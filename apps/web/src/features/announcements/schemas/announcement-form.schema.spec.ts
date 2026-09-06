import { describe, expect, it } from 'vitest';

import { announcementFormSchema } from './announcement-form.schema.ts';

const valid = {
  title: 'A title',
  body: 'Some content',
  categoryIds: ['c1000000-0000-4000-8000-000000000001'],
  publicationDate: '09/05/2026 14:30',
};

describe('announcementFormSchema', () => {
  it('accepts a valid announcement', () => {
    expect(announcementFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ['empty title', { ...valid, title: '   ' }],
    ['empty body', { ...valid, body: '' }],
    ['no categories', { ...valid, categoryIds: [] }],
    ['wrong date format', { ...valid, publicationDate: '2026-09-05 14:30' }],
    ['impossible date', { ...valid, publicationDate: '13/45/2026 99:99' }],
    ['overlong title', { ...valid, title: 'x'.repeat(201) }],
  ])('rejects %s', (_label, input) => {
    expect(announcementFormSchema.safeParse(input).success).toBe(false);
  });
});
