/**
 * Builds the Google Calendar link that adds a term's class meetings.
 *
 * It is generated from the term file's meetings and class dates, so a new
 * term's link needs no edits here. Pure functions, unit tested directly.
 */

/** The course's time zone; every clock time in term files is local to it. */
const TIME_ZONE = 'America/Los_Angeles';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** One weekly meeting and the term dates it repeats between. */
export interface MeetingSeries {
  days: string[];
  /** 'HH:MM' local time. */
  start: string;
  end: string;
  location: string;
  /** First and last day of classes, 'YYYY-MM-DD'. */
  from: string;
  until: string;
}

/** What the calendar entry says about itself. */
export interface EventText {
  title: string;
  description: string;
  url: string;
}

/** Returns the first date on or after `from` that falls on one of `days`. */
export function firstMeeting(from: string, days: string[]): string {
  const date = new Date(`${from}T00:00:00Z`);
  for (let offset = 0; offset < 7; offset += 1) {
    const day = WEEKDAYS[date.getUTCDay()] ?? '';
    if (days.includes(day)) return date.toISOString().slice(0, 10);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  throw new Error(`No meeting day among ${days.join(', ')}`);
}

/** Formats a local date and 'HH:MM' as an iCalendar local date-time. */
function localStamp(date: string, clock: string): string {
  return `${date.replaceAll('-', '')}T${clock.replace(':', '')}00`;
}

/**
 * The weekly rule, ending after the last day of classes.
 *
 * UNTIL must be UTC when the start has a time zone; 07:59:59Z the next day
 * is the last second of that day in Pacific standard time, and under one
 * hour past it in daylight time, when no class meets.
 */
function rule({ days, until }: MeetingSeries): string {
  const byDay = days.map((day) => day.slice(0, 2).toUpperCase()).join(',');
  const next = new Date(`${until}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const stamp = next.toISOString().slice(0, 10).replaceAll('-', '');
  return `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${stamp}T075959Z`;
}

/**
 * Returns a link that opens Google Calendar's new-event form, repeating
 * weekly through the last day of classes. The form cannot skip holidays.
 */
export function googleCalendarUrl(
  text: EventText,
  meeting: MeetingSeries,
): string {
  const first = firstMeeting(meeting.from, meeting.days);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: text.title,
    dates: `${localStamp(first, meeting.start)}/${localStamp(first, meeting.end)}`,
    ctz: TIME_ZONE,
    location: meeting.location,
    details: `${text.description}\n${text.url}`,
    recur: rule(meeting),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
