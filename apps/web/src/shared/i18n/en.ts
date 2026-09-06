/**
 * English translations — the single source for every user-facing string.
 *
 * Keys are grouped by area; values may contain {placeholders} filled by t().
 * Adding a locale later means providing another file with this exact shape.
 */
export const en = {
  // common
  'common.loading.aria': 'Loading page',

  // brand / navigation
  'brand.name': 'Test city',
  'nav.announcements': 'Announcements',
  'nav.main.aria': 'Main navigation',
  'nav.open.aria': 'Open navigation',
  'nav.close.aria': 'Close navigation',

  // announcements list
  'list.title': 'Announcements',
  'list.add': 'Add announcement',
  'list.search.placeholder': 'Search announcements',
  'list.search.aria': 'Search announcements by title or content',
  'list.filter.placeholder': 'Filter by category',
  'list.filter.aria': 'Filter by categories',
  'list.loading.aria': 'Loading announcements',
  'list.header.title': 'Title',
  'list.header.publicationDate': 'Publication date',
  'list.header.lastUpdate': 'Last update',
  'list.header.categories': 'Categories',
  'list.header.actions': 'Actions',
  'list.card.published': 'Published {date}',
  'list.card.updated': 'Updated {date}',
  'list.edit.aria': 'Edit "{title}"',
  'list.error.title': 'Could not load announcements',
  'list.error.message':
    'The server did not respond. Check that the API is running, then try again.',
  'list.error.retry': 'Try again',
  'list.refreshError': 'Couldn’t refresh the list — showing the last loaded results.',
  'list.empty.title': 'No announcements yet',
  'list.empty.message': 'Create the first announcement to get started.',
  'list.filteredEmpty.title': 'No matching announcements',
  'list.filteredEmpty.message': 'Nothing matches your current search and filters.',
  'list.filteredEmpty.clear': 'Clear filters',

  // pagination
  'pagination.aria': 'Pagination',
  'pagination.previous.aria': 'Previous page',
  'pagination.next.aria': 'Next page',
  'pagination.page.aria': 'Page {page}',

  // announcement form
  'form.create.title': 'Add announcement',
  'form.edit.title': 'Edit the announcement',
  'form.back': 'Back to announcements',
  'form.field.title': 'Title',
  'form.field.content': 'Content',
  'form.field.category': 'Category',
  'form.field.category.hint': 'Select category so readers know what your announcement is about.',
  'form.field.publicationDate': 'Publication date',
  'form.publish': 'Publish',
  'form.saving': 'Saving…',
  'form.summary.title': 'Please fill in all required fields before publishing:',

  // form validation messages
  'validation.title.required': 'Title is required',
  'validation.title.max': 'Title must be at most 200 characters',
  'validation.content.required': 'Content is required',
  'validation.category.required': 'Select at least one category',
  'validation.date.required': 'Publication date is required',
  'validation.date.format': 'Use the format MM/DD/YYYY HH:MM, e.g. 09/05/2026 14:30',

  // category select
  'categorySelect.placeholder': 'Select categories',
  'categorySelect.noOptions': 'No categories found',
  'categorySelect.create': 'Create "{name}"',

  // date field
  'dateField.placeholder': 'MM/DD/YYYY HH:MM',
  'dateField.timeCaption': 'Time',
  'dateField.sheet.aria': 'Pick publication date and time',

  // edit page states
  'edit.loading.aria': 'Loading announcement',
  'edit.notFound.title': 'Announcement not found',
  'edit.notFound.message': 'It may have been deleted. Pick another announcement from the list.',
  'edit.error.title': 'Could not load the announcement',
  'edit.error.message': 'The server did not respond. Please try again.',
  'edit.back': 'Back to announcements',

  // delete confirmation
  'delete.action': 'Delete',
  'delete.confirm.question': 'Delete this announcement?',
  'delete.confirm.aria': 'Confirm deletion',
  'delete.cancel': 'Cancel',
  'delete.deleting': 'Deleting…',

  // toasts
  'toast.announcement.published': '"{title}" published',
  'toast.announcement.updated': '"{title}" updated',
  'toast.announcement.deleted': '"{title}" deleted',
  'toast.announcement.realtime': 'New announcement: "{title}"',
  'toast.category.created': 'Category "{name}" created',
  'toast.category.existed': 'Category "{name}" already existed and was selected',
  'toast.category.failed': 'Could not create the category',

  // generic errors / fallbacks
  'error.generic': 'Something went wrong while saving. Please try again.',
  'error.page.title': 'Something went wrong',
  'error.page.message': 'The page hit an unexpected error. Reloading usually resolves it.',
  'error.page.messageLong':
    'The page hit an unexpected error. Reloading usually resolves it; if the problem persists, please try again later.',
  'error.page.reload': 'Reload page',
  'notFound.title': 'Page not found',
  'notFound.message': 'The page you are looking for does not exist.',
  'notFound.back': 'Go to announcements',
} as const;
