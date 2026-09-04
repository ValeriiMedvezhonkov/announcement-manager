import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { normalizeCategoryName } from '../src/categories/normalize-category-name.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

/**
 * Deterministic seed data.
 *
 * Identifiers and timestamps are fixed literals rather than generated values so
 * that re-running the seed produces an identical database, and so that tests and
 * screenshots can rely on stable ordering.
 */

const CATEGORIES = [
  { id: '019621a0-0000-7000-8000-000000000001', name: 'City' },
  { id: '019621a0-0000-7000-8000-000000000002', name: 'Community events' },
  { id: '019621a0-0000-7000-8000-000000000003', name: 'Crime & Safety' },
  { id: '019621a0-0000-7000-8000-000000000004', name: 'Culture' },
  { id: '019621a0-0000-7000-8000-000000000005', name: 'Discounts & Benefits' },
  { id: '019621a0-0000-7000-8000-000000000006', name: 'Emergencies' },
  { id: '019621a0-0000-7000-8000-000000000007', name: 'For Seniors' },
  { id: '019621a0-0000-7000-8000-000000000008', name: 'Health' },
  { id: '019621a0-0000-7000-8000-000000000009', name: 'Kids & Family' },
] as const;

const ANNOUNCEMENTS = [
  {
    id: '019621b0-0000-7000-8000-000000000001',
    title: 'Water main replacement on Oak Street',
    body: 'Crews will replace the water main between 3rd and 7th Avenue. Expect reduced water pressure on weekdays between 09:00 and 16:00. Residents do not need to boil water; the supply remains safe throughout the works.',
    publicationDate: '2026-08-03T09:00:00.000Z',
    lastUpdate: '2026-08-03T09:00:00.000Z',
    categoryIds: [CATEGORIES[0].id],
  },
  {
    id: '019621b0-0000-7000-8000-000000000002',
    title: 'Summer street festival returns to the old town',
    body: 'Three days of live music, food stalls and workshops for all ages. The main stage opens at 17:00 on Friday. Several streets in the centre will be closed to traffic from Thursday evening.',
    publicationDate: '2026-08-07T12:30:00.000Z',
    lastUpdate: '2026-08-08T08:15:00.000Z',
    categoryIds: [CATEGORIES[1].id, CATEGORIES[3].id, CATEGORIES[8].id],
  },
  {
    id: '019621b0-0000-7000-8000-000000000003',
    title: 'Increase in bicycle thefts near the train station',
    body: 'Police report a rise in bicycle thefts around the station car park. Use a second lock where possible and register your frame number with the city register.',
    publicationDate: '2026-08-12T07:45:00.000Z',
    lastUpdate: '2026-08-12T07:45:00.000Z',
    categoryIds: [CATEGORIES[2].id],
  },
  {
    id: '019621b0-0000-7000-8000-000000000004',
    title: 'Free flu vaccinations for residents over 65',
    body: 'The municipal health centre offers free seasonal flu vaccinations from September. No appointment is required on Tuesday and Thursday mornings. Bring your insurance card and identification.',
    publicationDate: '2026-08-19T10:00:00.000Z',
    lastUpdate: '2026-08-21T14:20:00.000Z',
    categoryIds: [CATEGORIES[6].id, CATEGORIES[7].id],
  },
  {
    id: '019621b0-0000-7000-8000-000000000005',
    title: 'Reduced public transport fares for students',
    body: 'Students with a valid enrolment certificate receive a 40% discount on monthly passes for the upcoming academic year. Apply online or at any ticket office.',
    publicationDate: '2026-08-24T15:10:00.000Z',
    lastUpdate: '2026-08-24T15:10:00.000Z',
    categoryIds: [CATEGORIES[4].id],
  },
  {
    id: '019621b0-0000-7000-8000-000000000006',
    title: 'Storm warning: secure loose objects on balconies',
    body: 'A severe weather front is expected overnight with gusts up to 100 km/h. Secure garden furniture and balcony items. Emergency services can be reached on the usual number; call only in genuine emergencies.',
    publicationDate: '2026-09-01T18:00:00.000Z',
    lastUpdate: '2026-09-02T06:30:00.000Z',
    categoryIds: [CATEGORIES[5].id, CATEGORIES[0].id],
  },
] as const;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString === undefined || connectionString === '') {
    throw new Error('DATABASE_URL must be set to seed the database');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    for (const category of CATEGORIES) {
      const normalizedName = normalizeCategoryName(category.name);

      await prisma.category.upsert({
        where: { id: category.id },
        create: { id: category.id, name: category.name, normalizedName },
        update: { name: category.name, normalizedName },
      });
    }

    for (const announcement of ANNOUNCEMENTS) {
      const categories = announcement.categoryIds.map((id) => ({ id }));

      await prisma.announcement.upsert({
        where: { id: announcement.id },
        create: {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          publicationDate: new Date(announcement.publicationDate),
          lastUpdate: new Date(announcement.lastUpdate),
          categories: { connect: categories },
        },
        update: {
          title: announcement.title,
          body: announcement.body,
          publicationDate: new Date(announcement.publicationDate),
          lastUpdate: new Date(announcement.lastUpdate),
          categories: { set: categories },
        },
      });
    }

    console.log(
      `Seeded ${String(CATEGORIES.length)} categories and ${String(ANNOUNCEMENTS.length)} announcements`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
