import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
/** Hard cap so a single request cannot ask for an unbounded page. */
const MAX_LIMIT = 100;

/** Trimmed search text; a blank search is treated as "no search". */
function toSearch({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Accepts `categoryIds=a,b` as well as repeated `categoryIds=a&categoryIds=b`,
 * normalising both to a string array for validation.
 */
function toCategoryIds({ value }: TransformFnParams): unknown {
  const parts = (Array.isArray(value) ? value : [value])
    .filter((entry): entry is string => typeof entry === 'string')
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
  return parts.length > 0 ? parts : undefined;
}

export class AnnouncementQueryDto {
  /** Case-insensitive match against title or body. */
  @IsOptional()
  @Transform(toSearch)
  @IsString({ message: 'Search must be a string' })
  search?: string;

  /** ANY-match: announcements having at least one of these categories. */
  @IsOptional()
  @Transform(toCategoryIds)
  @IsUUID('all', { each: true, message: 'Each category id must be a UUID' })
  categoryIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(MAX_LIMIT, { message: `Limit must be at most ${MAX_LIMIT}` })
  limit?: number = DEFAULT_LIMIT;
}
