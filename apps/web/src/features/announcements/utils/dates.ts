import { format, formatDistanceToNowStrict, isValid, parse } from 'date-fns';

/**
 * The written specification requires MM/DD/YYYY HH:mm for publication dates.
 * All parsing/formatting of that contract lives here.
 */
export const PUBLICATION_DATE_FORMAT = 'MM/dd/yyyy HH:mm';

/** Rendered instead of crashing the page when an API date is malformed. */
const INVALID_DATE_FALLBACK = '—';

function toValidDate(iso: string): Date | null {
  const value = new Date(iso);
  return isValid(value) ? value : null;
}

/** Parses user input in local time; returns null when not a real datetime. */
export function parsePublicationDate(input: string): Date | null {
  const parsed = parse(input.trim(), PUBLICATION_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}

/** Formats an API ISO string for display/editing in the specified format. */
export function formatPublicationDate(iso: string): string {
  const value = toValidDate(iso);
  return value === null ? INVALID_DATE_FALLBACK : format(value, PUBLICATION_DATE_FORMAT);
}

/** Formats a picked Date back into the input's string representation. */
export function formatDateInput(date: Date): string {
  return format(date, PUBLICATION_DATE_FORMAT);
}

/** Last-update column uses the same specified format for consistency. */
export function formatLastUpdate(iso: string): string {
  const value = toValidDate(iso);
  return value === null ? INVALID_DATE_FALLBACK : format(value, PUBLICATION_DATE_FORMAT);
}

/** "2 days ago" — used as the primary reading of the last update. */
export function formatRelativeUpdate(iso: string): string {
  const value = toValidDate(iso);
  return value === null
    ? INVALID_DATE_FALLBACK
    : formatDistanceToNowStrict(value, { addSuffix: true });
}

/** Date and time halves of the specified format, for two-line table cells. */
export function splitDateParts(iso: string): { date: string; time: string } {
  const value = toValidDate(iso);
  return value === null
    ? { date: INVALID_DATE_FALLBACK, time: '' }
    : { date: format(value, 'MM/dd/yyyy'), time: format(value, 'HH:mm') };
}
