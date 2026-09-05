import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trim } from '../../common/transforms/trim.transform.js';

export class CreateCategoryDto {
  @Trim()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name!: string;
}
