import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderPage } from '@test/render.tsx';
import { EditAnnouncementPage } from './EditAnnouncementPage.tsx';

function renderEdit(id: string) {
  return renderPage(<EditAnnouncementPage />, {
    path: '/announcements/:id',
    initialEntry: `/announcements/${id}`,
  });
}

describe('EditAnnouncementPage', () => {
  it('prefills the form from the fetched announcement', async () => {
    renderEdit('a1000000-0000-4000-8000-000000000001');

    expect(await screen.findByLabelText('Title')).toHaveValue('Storm warning tonight');
    expect(screen.getByLabelText('Content')).toHaveValue('Secure loose objects.');
    // publication date rendered in the specified format (UTC instant -> local time)
    const dateField = screen.getByLabelText<HTMLInputElement>('Publication date');
    expect(dateField.value).toMatch(/^\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/);
    // selected category rendered as a chip inside the select (own query)
    expect(await screen.findByText('City')).toBeInTheDocument();
  });

  it('shows the not-found state for a missing announcement', async () => {
    renderEdit('a1000000-0000-4000-8000-00000000dead');

    expect(await screen.findByText('Announcement not found')).toBeInTheDocument();
  });
});
