/**
 * Deterministic normalization used to enforce case-insensitive uniqueness of
 * category names at the database level.
 *
 * "Health", "health" and "  HEALTH  " all normalize to "health", so the unique
 * constraint on `Category.normalizedName` rejects them as duplicates. The
 * human-readable `Category.name` is never lowercased.
 */
export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}
