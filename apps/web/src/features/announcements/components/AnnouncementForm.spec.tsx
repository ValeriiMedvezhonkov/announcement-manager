import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderPage } from '../../../test/render.tsx';
import { AnnouncementForm } from './AnnouncementForm.tsx';

function renderForm(onSubmit = vi.fn()) {
  renderPage(
    <AnnouncementForm
      title="Add announcement"
      submitLabel="Publish"
      isSubmitting={false}
      serverError={null}
      defaultValues={{ title: '', body: '', categoryIds: [], publicationDate: '' }}
      onSubmit={onSubmit}
    />,
    { path: '/announcements/new', initialEntry: '/announcements/new' },
  );
  return onSubmit;
}

describe('AnnouncementForm', () => {
  it('shows per-field errors and does not submit an empty form', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Content is required')).toBeInTheDocument();
    expect(screen.getByText('Select at least one category')).toBeInTheDocument();
    expect(screen.getByText('Publication date is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders an accessible server error box', () => {
    renderPage(
      <AnnouncementForm
        title="Add announcement"
        submitLabel="Publish"
        isSubmitting={false}
        serverError="Validation failed. Title is required"
        defaultValues={{ title: '', body: '', categoryIds: [], publicationDate: '' }}
        onSubmit={vi.fn()}
      />,
      { path: '/x', initialEntry: '/x' },
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Validation failed');
  });
});
