import { CategoryResponseDto } from '../../categories/dto/category-response.dto.js';
import type { AnnouncementWithCategories } from '../announcements.repository.js';

/**
 * Public representation of an announcement. Dates are ISO 8601 strings; the
 * Prisma row type never crosses the HTTP boundary.
 */
export class AnnouncementResponseDto {
  id!: string;
  title!: string;
  body!: string;
  publicationDate!: string;
  lastUpdate!: string;
  createdAt!: string;
  categories!: CategoryResponseDto[];

  static from(announcement: AnnouncementWithCategories): AnnouncementResponseDto {
    const dto = new AnnouncementResponseDto();
    dto.id = announcement.id;
    dto.title = announcement.title;
    dto.body = announcement.body;
    dto.publicationDate = announcement.publicationDate.toISOString();
    dto.lastUpdate = announcement.lastUpdate.toISOString();
    dto.createdAt = announcement.createdAt.toISOString();
    dto.categories = announcement.categories.map((category) => CategoryResponseDto.from(category));
    return dto;
  }
}

/** Predictable list envelope shared by paginated endpoints. */
export class AnnouncementListResponseDto {
  items!: AnnouncementResponseDto[];
  page!: number;
  limit!: number;
  total!: number;
}
