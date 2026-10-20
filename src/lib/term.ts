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

/** Returns the 0-based week of a term that `day` falls in, Monday to Sunday. */
export function weekIndexOf(startDate: Date, day: Date): number {
  return Math.floor((day.getTime() - startDate.getTime()) / (7 * DAY_MS));
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

/** Formats 'HH:MM' for people, e.g. '13:50' as '1:50 pm'. */
export function formatClock(clock: string): string {
  const [hours = 0, minutes = 0] = clock.split(':').map(Number);
  const suffix = hours < 12 ? 'am' : 'pm';
  const twelve = hours % 12 || 12;
  return `${twelve}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/**
 * Describes office hours for people, e.g. 'Tue 2:30 pm–3:30 pm · Zoom'.
 *
 * Missing hours mean they are announced on Piazza; a missing place means
 * it is still to be announced.
 */
export function formatOfficeHours(
  where: readonly string[],
  hours?: { day: string; start: string; end: string },
): string {
  const when = hours
    ? `${hours.day} ${formatClock(hours.start)}–${formatClock(hours.end)}`
    : 'Hours announced on Piazza';
  return `${when} · ${where.length > 0 ? where.join(', ') : 'Location TBA'}`;
}

/** Formats a due moment for people, e.g. 'Nov 2, 12:00 pm' or 'Nov 9'. */
export function formatDue(date: Date, time?: string): string {
  const day = formatDay(date);
  return time ? `${day}, ${formatClock(time)}` : day;
}
