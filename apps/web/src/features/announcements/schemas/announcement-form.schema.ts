import { z } from 'zod';

import { parsePublicationDate, PUBLICATION_DATE_FORMAT } from '../utils/dates.ts';

/** Client-side mirror of the API rules; the API remains authoritative. */
export const announcementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  body: z.string().trim().min(1, 'Content is required'),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  publicationDate: z
    .string()
    .trim()
    .min(1, 'Publication date is required')
    .refine(
      (value) => parsePublicationDate(value) !== null,
      `Use the format ${PUBLICATION_DATE_FORMAT.toUpperCase()}, e.g. 09/05/2026 14:30`,
    ),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
