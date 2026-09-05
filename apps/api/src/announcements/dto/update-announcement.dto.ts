import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Trim } from '../../common/transforms/trim.transform.js';

/**
 * PATCH semantics: every field optional, but any provided field must satisfy
 * the same rules as on create. An explicitly provided empty category list is
 * rejected — an announcement can never end up category-less.
 */
export class UpdateAnnouncementDto {
  @IsOptional()
  @Trim()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title?: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body must not be empty' })
  body?: string;

  @IsOptional()
  @ApiProperty({ format: 'date-time' })
  @IsISO8601(
    { strict: true, strictSeparator: true },
    { message: 'Publication date must be an ISO 8601 datetime' },
  )
  publicationDate?: string;

  @IsOptional()
  @IsArray({ message: 'Category ids must be an array' })
  @ArrayMinSize(1, { message: 'At least one category is required' })
  @IsUUID('all', { each: true, message: 'Each category id must be a UUID' })
  categoryIds?: string[];
}
