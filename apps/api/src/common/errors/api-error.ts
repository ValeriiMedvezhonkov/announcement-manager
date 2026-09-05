/**
 * Stable machine-readable error codes forming part of the public API contract.
 * Frontend logic branches on these rather than on human-readable messages.
 */
export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'ANNOUNCEMENT_NOT_FOUND',
  'CATEGORY_NOT_FOUND',
  'CATEGORY_ALREADY_EXISTS',
  'INVALID_CATEGORY_SELECTION',
  'SEARCH_UNAVAILABLE',
  'NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** Field name -> list of problems with that field. */
export type FieldErrors = Record<string, string[]>;

/**
 * The single error shape every non-2xx response uses.
 */
export interface ApiErrorBody {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  errors?: FieldErrors;
}
