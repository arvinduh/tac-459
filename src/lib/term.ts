/**
 * Calendar math for a term: week ranges and due-date keys.
 *
 * Dates arrive from the term YAML as UTC midnight, each standing for a
 * calendar day in the course time zone. Everything here stays in UTC so a
 * day never shifts; converting "now" into the course zone is clock.ts's job.
 */

const DAY_MS = 86_400_000;

/** Due time assumed when a deliverable gives a date but no time. */
const END_OF_DAY = '23:59';

const DAY_LABEL = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/** Formats a calendar day as 'YYYY-MM-DD'. */
export function isoDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}

/** Formats a calendar day for people, e.g. 'Aug 24'. */
export function formatDay(day: Date): string {
  return DAY_LABEL.format(day);
}

/** Returns Monday and Friday of week `index` (0-based) of a term. */
export function weekOf(
  startDate: Date,
  index: number,
): { start: Date; end: Date } {
  const start = new Date(startDate.getTime() + index * 7 * DAY_MS);
  return { start, end: new Date(start.getTime() + 4 * DAY_MS) };
}

/**
 * Returns the due moment as 'YYYY-MM-DDTHH:MM' course wall time.
 *
 * Keys sort lexicographically in time order, so a page can compare them
 * against clock.ts's wall time without parsing either.
 */
export function dueKey(date: Date, time?: string): string {
  return `${isoDay(date)}T${time ?? END_OF_DAY}`;
}
