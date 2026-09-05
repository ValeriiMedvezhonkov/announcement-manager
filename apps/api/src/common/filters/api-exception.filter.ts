import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { type ApiErrorBody } from '../errors/api-error.js';
import { ApiException } from '../errors/api.exception.js';

/**
 * Translates every escaped error into the single public error shape.
 *
 * - ApiException: serialised as-is (services already chose code and message).
 * - Other HttpExceptions (404 on unknown route, body parse failure, ...):
 *   wrapped with a generic code, original message preserved.
 * - Everything else: logged with stack, returned as an opaque 500 so database
 *   errors, Prisma internals and stack traces never reach API consumers.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      const error = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`Unhandled exception on ${response.req.method} ${response.req.url}`, error);
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ApiErrorBody {
    if (exception instanceof ApiException) {
      return exception.body;
    }

    if (exception instanceof HttpException) {
      const status: number = exception.getStatus();
      return {
        statusCode: status,
        code: codeForStatus(status),
        message: exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };
  }
}

/** Maps framework-thrown HttpExceptions (route 404s, pipe failures, ...) to contract codes. */
function codeForStatus(status: number): 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR' {
  if (status === HttpStatus.BAD_REQUEST.valueOf()) {
    return 'VALIDATION_ERROR';
  }
  if (status === HttpStatus.NOT_FOUND.valueOf()) {
    return 'NOT_FOUND';
  }
  return 'INTERNAL_ERROR';
}
