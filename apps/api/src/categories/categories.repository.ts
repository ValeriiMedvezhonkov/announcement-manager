import { Injectable } from '@nestjs/common';

import type { Category } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CreateCategoryData {
  name: string;
  normalizedName: string;
}

/**
 * Persistence for categories.
 *
 * Deliberately feature-specific rather than a generic repository: the queries
 * here encode this feature's rules (alphabetical listing, lookup by the
 * normalized uniqueness key) and would gain nothing from being generalised.
 */
@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** All categories, ordered for direct display in the UI. */
  list(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  /**
   * Loads the categories matching the given ids. Callers compare the returned
   * length against the requested ids to detect references that do not exist,
   * so this must not silently drop unknown ids.
   */
  findByIds(ids: readonly string[]): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { id: { in: [...ids] } } });
  }

  /**
   * Looks up a category by its case-insensitive uniqueness key, so a duplicate
   * can be reported as a conflict instead of surfacing a database error.
   */
  findByNormalizedName(normalizedName: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { normalizedName } });
  }

  create(data: CreateCategoryData): Promise<Category> {
    return this.prisma.category.create({ data });
  }
}
