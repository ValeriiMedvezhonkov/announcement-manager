import { HttpException } from '@nestjs/common';

import type { ApiErrorBody, ApiErrorCode, FieldErrors } from './api-error.js';

/**
 * Application exception carrying the public error contract.
 *
 * Services throw this with a specific code; the exception filter serialises it
 * verbatim. Anything else that escapes is mapped to a generic response so
 * internals never leak to API consumers.
 */
export class ApiException extends HttpException {
  readonly body: ApiErrorBody;

  constructor(statusCode: number, code: ApiErrorCode, message: string, errors?: FieldErrors) {
    const body: ApiErrorBody = {
      statusCode,
      code,
      message,
      ...(errors !== undefined && { errors }),
    };
    super(body, statusCode);
    this.body = body;
  }
}
