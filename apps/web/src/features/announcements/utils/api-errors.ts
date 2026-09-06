import { ApiError } from '@announcement-manager/api-client';

/** Maps API errors onto a readable submit-error message. */
export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.body.errors !== undefined) {
      const details = Object.values(error.body.errors).flat().join(' ');
      return `${error.body.message}. ${details}`;
    }
    return error.body.message;
  }
  return 'Something went wrong while saving. Please try again.';
}
