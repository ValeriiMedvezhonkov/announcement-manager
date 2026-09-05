import { Transform, type TransformFnParams } from 'class-transformer';

/**
 * Trims string inputs before validation so length and non-empty rules apply to
 * the meaningful content. Non-strings pass through untouched for the type
 * validators to reject.
 */
export function Trim(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  );
}
