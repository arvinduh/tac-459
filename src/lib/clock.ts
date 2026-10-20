/**
 * Reads the current wall time in the course time zone.
 *
 * The output uses the same 'YYYY-MM-DDTHH:MM' shape as term.ts's due keys,
 * so the browser decides "this week" and "up next" with string compares.
 */

/** Cache one formatter per time zone; building one is slow. */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Returns `now` as 'YYYY-MM-DDTHH:MM' wall time in `timeZone`. */
export function wallTime(timeZone: string, now: Date): string {
  const parts = new Map<string, string>();
  for (const { type, value } of formatterFor(timeZone).formatToParts(now)) {
    parts.set(type, value);
  }
  const part = (type: string) => parts.get(type) ?? '';
  return (
    `${part('year')}-${part('month')}-${part('day')}` +
    `T${part('hour')}:${part('minute')}`
  );
}
