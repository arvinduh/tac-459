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
 * Names the building a room such as 'KAP 160' is in: the location's first
 * word looked up in the site's building list. Places it cannot name, such
 * as 'Zoom', return undefined.
 */
export function buildingName(
  location: string,
  buildings: Record<string, string>,
): string | undefined {
  return buildings[location.split(/\s/)[0] ?? ''];
}

/** Links a room to its building on Google Maps, when the building is known. */
export function mapUrl(
  location: string,
  buildings: Record<string, string>,
): string | undefined {
  const building = buildingName(location, buildings);
  if (!building) return undefined;
  const query = `${building}, University of Southern California`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** The parts of a term file that a current term must fill in. */
interface TermFacts {
  classes?: { start: string; end: string } | undefined;
  noClass: string[];
  meetings: unknown[];
  staff: { role: string }[];
}

/** Months a season's classes may start in, 1-based. */
const START_MONTHS: Record<string, number[]> = {
  spring: [1, 2],
  summer: [5, 6],
  fall: [8, 9],
};

/**
 * Lists what a term file still needs before the site can show it as the
 * current term; an empty list means it is ready.
 *
 * Catches a term copied forward without its new dates, meetings or staff,
 * so the build fails instead of publishing last term's schedule.
 */
export function currentTermProblems(id: string, term: TermFacts): string[] {
  const { season, year } = parseTerm(id);
  const problems: string[] = [];
  if (term.meetings.length === 0) problems.push('add its class meetings');
  if (!term.staff.some(({ role }) => role === 'instructor')) {
    problems.push('add at least one instructor');
  }
  const { classes } = term;
  if (!classes) return [...problems, 'add classes: { start, end }'];
  const [startYear, startMonth] = classes.start.split('-').map(Number);
  if (startYear !== year || !START_MONTHS[season]?.includes(startMonth ?? 0)) {
    problems.push(`classes.start ${classes.start} is not in ${id}`);
  }
  if (classes.end < classes.start) {
    problems.push('classes.end is before classes.start');
  }
  for (const date of term.noClass) {
    if (date < classes.start || date > classes.end) {
      problems.push(`noClass ${date} is outside the class dates`);
    }
  }
  return problems;
}

/** Returns the regular term after this one: spring to fall, fall to spring. */
export function nextTermId(id: string): string {
  const { season, year } = parseTerm(id);
  return season === 'fall' ? `spring-${year + 1}` : `fall-${year}`;
}

/** Days after the last class before the site counts as out of date. */
const ROLLOVER_GRACE_DAYS = 21;

/**
 * Says what to do when the current term ended long enough ago that the
 * site should have moved on, or returns undefined while it is still fine.
 * `today` and `classesEnd` are 'YYYY-MM-DD'.
 */
export function rolloverReminder(
  id: string,
  classesEnd: string,
  today: string,
): string | undefined {
  const due = new Date(`${classesEnd}T00:00:00Z`);
  due.setUTCDate(due.getUTCDate() + ROLLOVER_GRACE_DAYS);
  if (today <= due.toISOString().slice(0, 10)) return undefined;
  const next = nextTermId(id);
  return (
    `${termLabel(id)} classes ended on ${classesEnd}. Start ${termLabel(next)}: ` +
    `run npm run new -- term ${next}, fill it in, then set currentTerm: ${next} ` +
    'in src/content/site.yaml (see docs/editing.md).'
  );
}
