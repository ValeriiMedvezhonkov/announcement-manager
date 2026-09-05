import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async listCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.list();
    return categories.map((category) => CategoryResponseDto.from(category));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(dto.name);
    return CategoryResponseDto.from(category);
  }
}
