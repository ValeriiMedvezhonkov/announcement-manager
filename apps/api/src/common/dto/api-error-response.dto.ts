import { ApiProperty } from '@nestjs/swagger';

import { API_ERROR_CODES, type ApiErrorCode, type FieldErrors } from '../errors/api-error.js';

/**
 * The single error shape every non-2xx response uses.
 */
export class ApiErrorResponseDto {
  /** HTTP status code, duplicated in the body for logging convenience. */
  statusCode!: number;

  /** Stable machine-readable error code; frontend logic branches on this. */
  @ApiProperty({ enum: API_ERROR_CODES })
  code!: ApiErrorCode;

  /** Human-readable summary of the problem. */
  message!: string;

  /** Present on validation failures: field name -> list of problems. */
  @ApiProperty({
    required: false,
    type: Object,
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: { title: ['Title is required'] },
  })
  errors?: FieldErrors;
}
