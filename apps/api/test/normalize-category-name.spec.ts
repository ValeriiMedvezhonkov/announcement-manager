import { describe, expect, it } from 'vitest';

import { normalizeCategoryName } from '../src/categories/normalize-category-name.js';

describe('normalizeCategoryName', () => {
  it.each([
    ['Health', 'health'],
    ['  HEALTH  ', 'health'],
    ['HeAlTh', 'health'],
    ['Kids  &  Family', 'kids & family'],
    ['Crime & Safety', 'crime & safety'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeCategoryName(input)).toBe(expected);
  });
});
