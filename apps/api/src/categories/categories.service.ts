import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiException } from '../common/errors/api.exception.js';
import { Prisma, type Category } from '../generated/prisma/client.js';
import { CategoriesRepository } from './categories.repository.js';
import { normalizeCategoryName } from './normalize-category-name.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  list(): Promise<Category[]> {
    return this.repository.list();
  }

  /**
   * Creates a category, enforcing case-insensitive uniqueness.
   *
   * The pre-check exists to produce a friendly conflict message; the unique
   * constraint on normalizedName remains the actual guarantee. If a concurrent
   * request wins the race between check and insert, the constraint violation is
   * translated into the same 409 rather than leaking a database error.
   */
  async create(name: string): Promise<Category> {
    const normalizedName = normalizeCategoryName(name);

    const existing = await this.repository.findByNormalizedName(normalizedName);
    if (existing !== null) {
      throw this.conflict(existing.name);
    }

    try {
      return await this.repository.create({ name: name.trim(), normalizedName });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.conflict(name.trim());
      }
      throw error;
    }
  }

  private conflict(name: string): ApiException {
    return new ApiException(
      HttpStatus.CONFLICT,
      'CATEGORY_ALREADY_EXISTS',
      `A category named "${name}" already exists`,
    );
  }
}
