import { HttpStatus, Injectable } from '@nestjs/common';

import { CategoriesRepository } from '../categories/categories.repository.js';
import { ApiException } from '../common/errors/api.exception.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  type AnnouncementWithCategories,
  AnnouncementsRepository,
} from './announcements.repository.js';

export interface ListAnnouncementsParams {
  page: number;
  limit: number;
  search?: string | undefined;
  categoryIds?: readonly string[] | undefined;
}

export interface AnnouncementListResult {
  items: AnnouncementWithCategories[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  publicationDate: Date;
  categoryIds: readonly string[];
}

export interface UpdateAnnouncementInput {
  title?: string | undefined;
  body?: string | undefined;
  publicationDate?: Date | undefined;
  categoryIds?: readonly string[] | undefined;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly announcements: AnnouncementsRepository,
    private readonly categories: CategoriesRepository,
  ) {}

  async list(params: ListAnnouncementsParams): Promise<AnnouncementListResult> {
    const filters = { search: params.search, categoryIds: params.categoryIds };

    const [items, total] = await Promise.all([
      this.announcements.list({
        ...filters,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.announcements.count(filters),
    ]);

    return { items, page: params.page, limit: params.limit, total };
  }

  async getById(id: string): Promise<AnnouncementWithCategories> {
    const announcement = await this.announcements.findById(id);
    if (announcement === null) {
      throw this.notFound(id);
    }
    return announcement;
  }

  async create(input: CreateAnnouncementInput): Promise<AnnouncementWithCategories> {
    await this.assertCategoriesExist(input.categoryIds);
    return this.announcements.create(input);
  }

  async update(id: string, input: UpdateAnnouncementInput): Promise<AnnouncementWithCategories> {
    if (input.categoryIds !== undefined) {
      await this.assertCategoriesExist(input.categoryIds);
    }

    try {
      return await this.announcements.update(id, input);
    } catch (error) {
      throw this.translateMissingRecord(error, id);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.announcements.delete(id);
    } catch (error) {
      throw this.translateMissingRecord(error, id);
    }
  }

  /**
   * Every referenced category must exist; unknown ids are reported explicitly
   * rather than silently dropped.
   */
  private async assertCategoriesExist(categoryIds: readonly string[]): Promise<void> {
    const unique = [...new Set(categoryIds)];
    const found = await this.categories.findByIds(unique);

    if (found.length !== unique.length) {
      const foundIds = new Set(found.map((category) => category.id));
      const missing = unique.filter((id) => !foundIds.has(id));

      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_CATEGORY_SELECTION',
        `Unknown category ids: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Maps Prisma's "record not found" (P2025) on a write to the 404 contract.
   * Categories are validated before any write and cannot be deleted through
   * the API, so a P2025 here can only mean the announcement itself is gone.
   * Doing it this way instead of a read-before-write avoids an extra query
   * and closes the race where the row disappears between check and write.
   */
  private translateMissingRecord(error: unknown, id: string): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return this.notFound(id);
    }
    return error;
  }

  private notFound(id: string): ApiException {
    return new ApiException(
      HttpStatus.NOT_FOUND,
      'ANNOUNCEMENT_NOT_FOUND',
      `Announcement ${id} was not found`,
    );
  }
}
