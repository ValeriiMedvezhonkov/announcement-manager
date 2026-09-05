import { Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * An announcement together with its categories. Every read path returns this
 * shape, because a category-less announcement is not meaningful to a caller.
 */
export type AnnouncementWithCategories = Prisma.AnnouncementGetPayload<{
  include: { categories: true };
}>;

export interface AnnouncementFilters {
  /** Free-text match against title or body. Already trimmed by the caller. */
  search?: string | undefined;
  /** ANY-match: an announcement matches if it has at least one of these. */
  categoryIds?: readonly string[] | undefined;
}

export interface AnnouncementListParams extends AnnouncementFilters {
  skip: number;
  take: number;
}

export interface CreateAnnouncementData {
  title: string;
  body: string;
  publicationDate: Date;
  categoryIds: readonly string[];
}

export interface UpdateAnnouncementData {
  title?: string | undefined;
  body?: string | undefined;
  publicationDate?: Date | undefined;
  categoryIds?: readonly string[] | undefined;
}

const INCLUDE_CATEGORIES = { categories: { orderBy: { name: 'asc' } } } as const;

/**
 * Persistence for announcements.
 *
 * This layer exists because announcements carry real persistence complexity:
 * relation loading, category filtering, text search, pagination and a fixed
 * ordering. It is intentionally not a generic repository — it exposes only the
 * queries this feature actually performs.
 */
@Injectable()
export class AnnouncementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AnnouncementWithCategories | null> {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: INCLUDE_CATEGORIES,
    });
  }

  /**
   * Always ordered by lastUpdate descending, which is the only ordering the
   * application exposes and the reason for the matching database index.
   */
  list(params: AnnouncementListParams): Promise<AnnouncementWithCategories[]> {
    return this.prisma.announcement.findMany({
      where: buildWhere(params),
      include: INCLUDE_CATEGORIES,
      orderBy: { lastUpdate: 'desc' },
      skip: params.skip,
      take: params.take,
    });
  }

  count(filters: AnnouncementFilters): Promise<number> {
    return this.prisma.announcement.count({ where: buildWhere(filters) });
  }

  /**
   * `lastUpdate` is server-managed and set here so it can never be supplied by
   * a client. A single nested write keeps the row and its category links atomic
   * without an explicit transaction.
   */
  create(data: CreateAnnouncementData): Promise<AnnouncementWithCategories> {
    const now = new Date();

    return this.prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        publicationDate: data.publicationDate,
        lastUpdate: now,
        categories: { connect: toConnect(data.categoryIds) },
      },
      include: INCLUDE_CATEGORIES,
    });
  }

  /**
   * Refreshes `lastUpdate` on every call: any update reaching this method is a
   * meaningful change, including one that only reassigns categories. Passing
   * `categoryIds` replaces the whole set rather than merging into it.
   */
  update(id: string, data: UpdateAnnouncementData): Promise<AnnouncementWithCategories> {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.publicationDate !== undefined && { publicationDate: data.publicationDate }),
        ...(data.categoryIds !== undefined && {
          categories: { set: toConnect(data.categoryIds) },
        }),
        lastUpdate: new Date(),
      },
      include: INCLUDE_CATEGORIES,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.announcement.delete({ where: { id } });
  }
}

/** Duplicate ids are collapsed so a repeated selection cannot fail the write. */
function toConnect(categoryIds: readonly string[]): { id: string }[] {
  return [...new Set(categoryIds)].map((id) => ({ id }));
}

/**
 * Shared by `list` and `count` so a page and its total can never be computed
 * from different criteria.
 */
function buildWhere(filters: AnnouncementFilters): Prisma.AnnouncementWhereInput {
  const where: Prisma.AnnouncementWhereInput = {};

  if (filters.search !== undefined && filters.search !== '') {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { body: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.categoryIds !== undefined && filters.categoryIds.length > 0) {
    where.categories = { some: { id: { in: [...filters.categoryIds] } } };
  }

  return where;
}
