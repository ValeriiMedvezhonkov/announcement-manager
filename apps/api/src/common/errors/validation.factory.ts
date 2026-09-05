import { HttpStatus, type ValidationError } from '@nestjs/common';

import type { FieldErrors } from './api-error.js';
import { ApiException } from './api.exception.js';

/**
 * Converts class-validator failures into the standard error contract, keyed by
 * field so the frontend can attach messages to inputs.
 */
export function createValidationException(errors: ValidationError[]): ApiException {
  return new ApiException(
    HttpStatus.BAD_REQUEST,
    'VALIDATION_ERROR',
    'Validation failed',
    collectFieldErrors(errors),
  );
}

function collectFieldErrors(errors: ValidationError[], parentPath = ''): FieldErrors {
  const fields: FieldErrors = {};

  for (const error of errors) {
    const path = parentPath === '' ? error.property : `${parentPath}.${error.property}`;

    if (error.constraints !== undefined) {
      fields[path] = Object.values(error.constraints);
    }

    if (error.children !== undefined && error.children.length > 0) {
      Object.assign(fields, collectFieldErrors(error.children, path));
    }
  }

  return fields;
}
