import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Trim } from '../../common/transforms/trim.transform.js';

export class CreateAnnouncementDto {
  @Trim()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title!: string;

  @Trim()
  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  body!: string;

  /** ISO 8601 datetime; the client converts from its local input format. */
  @ApiProperty({ format: 'date-time' })
  @IsISO8601(
    { strict: true, strictSeparator: true },
    { message: 'Publication date must be an ISO 8601 datetime' },
  )
  publicationDate!: string;

  @IsArray({ message: 'Category ids must be an array' })
  @ArrayMinSize(1, { message: 'At least one category is required' })
  @IsUUID('all', { each: true, message: 'Each category id must be a UUID' })
  categoryIds!: string[];
}
