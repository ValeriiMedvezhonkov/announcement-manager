import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@test/msw-server.ts';
import { renderPage } from '@test/render.tsx';
import { AnnouncementsPage } from './AnnouncementsPage.tsx';

const API = 'http://localhost:3000/api';

function renderList(initialEntry = '/announcements') {
  return renderPage(<AnnouncementsPage />, { path: '/announcements', initialEntry });
}

describe('AnnouncementsPage', () => {
  it('renders announcements from the API in a table', async () => {
    renderList();

    expect(await screen.findByText('Storm warning tonight')).toBeInTheDocument();
    expect(screen.getByText('Free flu vaccinations')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows the empty state when there are no announcements at all', async () => {
    server.use(
      http.get(`${API}/announcements`, () =>
        HttpResponse.json({ items: [], page: 1, limit: 5, total: 0 }),
      ),
    );

    renderList();

    expect(await screen.findByText('No announcements yet')).toBeInTheDocument();
  });

  it('shows an error state with retry when the request fails', async () => {
    server.use(http.get(`${API}/announcements`, () => HttpResponse.error()));

    renderList();

    expect(await screen.findByText('Could not load announcements')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('debounces typed search into the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderList();
    await screen.findByText('Storm warning tonight');

    await user.type(screen.getByRole('searchbox'), 'storm');

    await waitFor(() => {
      expect(router.state.location.search).toBe('?search=storm');
    });
    await waitFor(() => {
      expect(screen.queryByText('Free flu vaccinations')).not.toBeInTheDocument();
    });
  });

  it('initializes the search input from the URL', async () => {
    renderList('/announcements?search=storm');

    expect(await screen.findByRole('searchbox')).toHaveValue('storm');
    expect(await screen.findByText('Storm warning tonight')).toBeInTheDocument();
    expect(screen.queryByText('Free flu vaccinations')).not.toBeInTheDocument();
  });
});
