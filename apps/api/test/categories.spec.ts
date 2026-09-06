import { beforeEach, describe, expect, it } from 'vitest';

import { api, createCategory, resetDatabase } from './helpers.js';

interface CategoryBody {
  id: string;
  name: string;
}

describe('categories API', () => {
  beforeEach(resetDatabase);

  it('creates a category and returns it without internal fields', async () => {
    const { status, body } = await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name: '  Infrastructure  ' }),
    });

    expect(status).toBe(201);
    const category = body as CategoryBody & Record<string, unknown>;
    expect(category.name).toBe('Infrastructure'); // trimmed
    expect(category.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(category).not.toHaveProperty('normalizedName');
  });

  it('rejects duplicates case- and whitespace-insensitively with 409', async () => {
    await createCategory('Health');

    for (const variant of ['Health', 'health', '  HEALTH  ', 'HeAlTh']) {
      const { status, body } = await api('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: variant }),
      });
      expect(status).toBe(409);
      expect((body as { code: string }).code).toBe('CATEGORY_ALREADY_EXISTS');
    }
  });

  it('rejects an empty name with a field-keyed validation error', async () => {
    const { status, body } = await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    });

    expect(status).toBe(400);
    const error = body as { code: string; errors: Record<string, string[]> };
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.errors.name).toBeDefined();
  });

  it('lists categories alphabetically', async () => {
    await createCategory('Zebra');
    await createCategory('Alpha');
    await createCategory('Mango');

    const { status, body } = await api('/categories');

    expect(status).toBe(200);
    expect((body as CategoryBody[]).map((category) => category.name)).toEqual([
      'Alpha',
      'Mango',
      'Zebra',
    ]);
  });
});
