/**
 * The course's content rules, shared by the site and the editor scripts.
 *
 * Owns pure facts derived from content files: term labels and order, class
 * times, calendar links, the course map's lanes and staff tenure. It never
 * touches the file system or Astro; callers load the data and pass it in.
 * Only what this file exports is reachable from outside the package.
 */
export { firstMeeting, googleCalendarUrl } from './calendar.ts';
export type { EventText, MeetingSeries } from './calendar.ts';
export { buildLanes } from './lanes.ts';
export type { Segment } from './lanes.ts';
export { formatRuns, placeInLanes, toRuns } from './tenure.ts';
export {
  buildingName,
  currentTermProblems,
  formatSession,
  formatTimes,
  formatWeeks,
  mapUrl,
  rolloverReminder,
  scheduleUrl,
  termLabel,
  termRank,
} from './term.ts';
