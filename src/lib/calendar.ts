/**
 * Builds calendar entries for a term's class meetings: an .ics file any
 * calendar app imports, and a Google Calendar link.
 *
 * Both are generated from the term file's meetings and class dates, so a new
 * term's calendar needs no edits here. Pure functions, unit tested directly.
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
  /** Days without class, such as holidays, 'YYYY-MM-DD'. */
  skip: string[];
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

/** Formats a local date and 'HH:MM' as an iCalendar floating date-time. */
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

/** Escapes text for an iCalendar property value. */
function escapeText(text: string): string {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n');
}

/** Folds a content line to 75 octets, as RFC 5545 requires. */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut -= 1;
    parts.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  return [...parts, rest].join('\r\n');
}

/**
 * Returns an .ics calendar with one repeating event per meeting series.
 *
 * Times carry the course's time zone id, which every major calendar app
 * resolves; holidays are excluded with EXDATE.
 */
export function buildIcs(
  id: string,
  text: EventText,
  series: MeetingSeries[],
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TAC 459//Course site//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeText(text.title)}`,
    `X-WR-TIMEZONE:${TIME_ZONE}`,
    ...series.flatMap((meeting, index) => {
      const first = firstMeeting(meeting.from, meeting.days);
      const skipped = meeting.skip.map((date) =>
        localStamp(date, meeting.start),
      );
      return [
        'BEGIN:VEVENT',
        `UID:${id}-${index + 1}@tac-459`,
        `DTSTAMP:${meeting.from.replaceAll('-', '')}T000000Z`,
        `DTSTART;TZID=${TIME_ZONE}:${localStamp(first, meeting.start)}`,
        `DTEND;TZID=${TIME_ZONE}:${localStamp(first, meeting.end)}`,
        rule(meeting),
        ...(skipped.length > 0
          ? [`EXDATE;TZID=${TIME_ZONE}:${skipped.join(',')}`]
          : []),
        `SUMMARY:${escapeText(text.title)}`,
        `LOCATION:${escapeText(meeting.location)}`,
        `DESCRIPTION:${escapeText(text.description)}`,
        `URL:${text.url}`,
        'END:VEVENT',
      ];
    }),
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/**
 * Returns a link that opens Google Calendar's new-event form, repeating
 * weekly through the last day of classes.
 *
 * Google's form takes the weekly rule but not holidays, so those stay in
 * the .ics file only.
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
