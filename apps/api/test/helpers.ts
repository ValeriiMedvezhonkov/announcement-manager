import { PrismaPg } from '@prisma/adapter-pg';

import { normalizeCategoryName } from '../src/categories/normalize-category-name.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TEST_DATABASE_URL } from './global-setup.js';

export const API_BASE = 'http://localhost:3101/api';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
});

/** Empties every table so each test starts from a known state. */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "announcements", "categories", "_AnnouncementCategories" CASCADE',
  );
}

export async function createCategory(name: string): Promise<{ id: string; name: string }> {
  return prisma.category.create({
    data: { name, normalizedName: normalizeCategoryName(name) },
    select: { id: true, name: true },
  });
}

interface AnnouncementSeed {
  title: string;
  body: string;
  publicationDate?: string;
  lastUpdate?: string;
  categoryIds: string[];
}

export async function createAnnouncement(seed: AnnouncementSeed): Promise<{ id: string }> {
  return prisma.announcement.create({
    data: {
      title: seed.title,
      body: seed.body,
      publicationDate: new Date(seed.publicationDate ?? '2026-01-01T10:00:00.000Z'),
      lastUpdate: new Date(seed.lastUpdate ?? '2026-01-01T10:00:00.000Z'),
      categories: { connect: seed.categoryIds.map((id) => ({ id })) },
    },
    select: { id: true },
  });
}

export async function api(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const body: unknown = response.status === 204 ? undefined : await response.json();
  return { status: response.status, body };
}
