import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listCategories',
    summary: 'List all categories alphabetically',
  })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  async listCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.list();
    return categories.map((category) => CategoryResponseDto.from(category));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createCategory',
    summary: 'Create a category',
    description:
      'Category names are unique case-insensitively: "Health", "health" and "  HEALTH  " are considered the same category.',
  })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto, description: 'Validation failed' })
  @ApiConflictResponse({
    type: ApiErrorResponseDto,
    description: 'A category with the same normalized name already exists',
  })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(dto.name);
    return CategoryResponseDto.from(category);
  }
}
