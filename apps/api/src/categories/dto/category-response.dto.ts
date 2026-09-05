import type { Category } from '../../generated/prisma/client.js';

/**
 * Public representation of a category. `normalizedName` is an internal
 * uniqueness key and is deliberately not exposed.
 */
export class CategoryResponseDto {
  id!: string;
  name!: string;
  createdAt!: string;
  updatedAt!: string;

  static from(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.createdAt = category.createdAt.toISOString();
    dto.updatedAt = category.updatedAt.toISOString();
    return dto;
  }
}
