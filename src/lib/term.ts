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

/** Splits a term id such as 'fall-2024', throwing when it is malformed. */
function parseTerm(id: string) {
  const [season = '', year = ''] = id.split('-');
  const seasonIndex = SEASONS.indexOf(season);
  if (seasonIndex < 0 || !/^\d{4}$/.test(year)) {
    throw new Error(`Term id '${id}' is not '<season>-<year>'`);
  }
  return { season, seasonIndex, year: Number(year) };
}

/**
 * Returns a number that sorts term ids such as 'fall-2024' in calendar order.
 *
 * Throws when the id is not '<season>-<year>', so a misnamed term file fails
 * the build instead of landing in the wrong place.
 */
export function termRank(id: string): number {
  const { seasonIndex, year } = parseTerm(id);
  return year * SEASONS.length + seasonIndex;
}

/** Names a term for people, e.g. 'fall-2026' as 'Fall 2026'. */
export function termLabel(id: string): string {
  const { season, year } = parseTerm(id);
  return `${season[0]?.toUpperCase()}${season.slice(1)} ${year}`;
}

/**
 * Links a course's page in the USC Schedule of Classes for a term.
 *
 * USC numbers terms as the year then 1, 2 or 3 for spring, summer or fall,
 * so 'fall-2026' is 20263, and course codes drop their space: 'tac459'.
 */
export function scheduleUrl(termId: string, courseCode: string): string {
  const { seasonIndex, year } = parseTerm(termId);
  const course = courseCode.toLowerCase().replace(/\s+/g, '');
  return `https://classes.usc.edu/term/${year}${seasonIndex + 1}/catalogue/course/${course}`;
}

/**
 * Links a room such as 'KAP 160' to its building on Google Maps.
 *
 * The building code is the location's first word, looked up in the site's
 * building list; locations it cannot place, such as 'Zoom', get no link.
 */
export function mapUrl(
  location: string,
  buildings: Record<string, string>,
): string | undefined {
  const building = buildings[location.split(/\s/)[0] ?? ''];
  if (!building) return undefined;
  const query = `${building}, University of Southern California`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
