import { describe, expect, it } from 'vitest';

import {
  formatLastUpdate,
  formatPublicationDate,
  parsePublicationDate,
  splitDateParts,
} from './dates.ts';

describe('date utilities', () => {
  it('round-trips the specified MM/DD/YYYY HH:mm format', () => {
    const parsed = parsePublicationDate('09/05/2026 14:30');
    expect(parsed).not.toBeNull();
    expect(formatPublicationDate(parsed?.toISOString() ?? '')).toBe('09/05/2026 14:30');
  });

  it('returns null for invalid user input', () => {
    expect(parsePublicationDate('nonsense')).toBeNull();
    expect(parsePublicationDate('13/45/2026 99:99')).toBeNull();
  });

  it('renders a fallback instead of throwing on malformed API dates', () => {
    expect(formatPublicationDate('not-a-date')).toBe('—');
    expect(formatLastUpdate('')).toBe('—');
    expect(splitDateParts('garbage')).toEqual({ date: '—', time: '' });
  });
});
