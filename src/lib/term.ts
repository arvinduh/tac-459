/** Pure helpers for term data: weekly slots, clock times and term order. */

/** Formats 'HH:MM' for people, e.g. '13:50' as '1:50 pm'. */
export function formatClock(clock: string): string {
  const [hours = 0, minutes = 0] = clock.split(':').map(Number);
  const suffix = hours < 12 ? 'am' : 'pm';
  const twelve = hours % 12 || 12;
  return `${twelve}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** A weekly slot as stored in a term file. */
interface Session {
  days: string[];
  start: string;
  end: string;
  location: string;
}

/** Formats when a weekly slot meets, e.g. 'Mon & Wed 12:00 pm–1:50 pm'. */
export function formatTimes({ days, start, end }: Omit<Session, 'location'>) {
  return `${days.join(' & ')} ${formatClock(start)}–${formatClock(end)}`;
}

/** Formats a weekly slot, e.g. 'Mon & Wed 12:00 pm–1:50 pm · KAP 160'. */
export function formatSession(session: Session) {
  return `${formatTimes(session)} · ${session.location}`;
}

const SEASONS = ['spring', 'summer', 'fall'];

/**
 * Returns a number that sorts term ids such as 'fall-2024' in calendar order.
 *
 * Throws when the id is not '<season>-<year>', so a misnamed term file fails
 * the build instead of landing in the wrong place.
 */
export function termRank(id: string): number {
  const [season = '', year = ''] = id.split('-');
  const seasonIndex = SEASONS.indexOf(season);
  if (seasonIndex < 0 || !/^\d{4}$/.test(year)) {
    throw new Error(`Term id '${id}' is not '<season>-<year>'`);
  }
  return Number(year) * SEASONS.length + seasonIndex;
}
