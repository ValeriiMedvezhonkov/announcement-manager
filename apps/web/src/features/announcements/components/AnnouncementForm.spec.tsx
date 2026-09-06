import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderPage } from '@test/render.tsx';
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

    // summary alert box lists every problem...
    const summary = (await screen.findByText(/fill in all required fields/)).closest(
      '[role="alert"]',
    );
    expect(summary).toHaveTextContent('Title is required');
    // ...and each field also shows its own error (hence 2 occurrences each)
    expect(screen.getAllByText('Title is required')).toHaveLength(2);
    expect(screen.getAllByText('Content is required')).toHaveLength(2);
    expect(screen.getAllByText('Select at least one category')).toHaveLength(2);
    expect(screen.getAllByText('Publication date is required')).toHaveLength(2);
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
