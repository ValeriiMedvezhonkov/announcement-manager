import { z } from 'zod';

import { parsePublicationDate } from '@features/announcements/utils/dates.ts';
import { t } from '@shared/i18n/index.ts';

/** Client-side mirror of the API rules; the API remains authoritative. */
export const announcementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, t('validation.title.required'))
    .max(200, t('validation.title.max')),
  body: z.string().trim().min(1, t('validation.content.required')),
  categoryIds: z.array(z.string()).min(1, t('validation.category.required')),
  publicationDate: z
    .string()
    .trim()
    .min(1, t('validation.date.required'))
    .refine((value) => parsePublicationDate(value) !== null, t('validation.date.format')),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
