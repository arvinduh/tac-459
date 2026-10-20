/** Unit tests for the class calendar builders. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildIcs, firstMeeting, googleCalendarUrl } from './calendar.ts';

const SERIES = {
  days: ['Mon', 'Wed'],
  start: '12:00',
  end: '13:50',
  location: 'KAP 160, Kaprielian Hall',
  from: '2026-08-24',
  until: '2026-12-04',
  skip: ['2026-09-07'],
};
const TEXT = {
  title: 'TAC 459: Generative AI and NLP',
  description: 'Fall 2026 class meetings',
  url: 'https://example.com/',
};

test('firstMeeting finds the first class day on or after the start', () => {
  assert.equal(firstMeeting('2026-08-24', ['Mon', 'Wed']), '2026-08-24');
  assert.equal(firstMeeting('2026-08-25', ['Mon', 'Wed']), '2026-08-26');
  assert.throws(() => firstMeeting('2026-08-24', []));
});

test('buildIcs repeats weekly in local time and skips holidays', () => {
  const ics = buildIcs('fall-2026', TEXT, [SERIES]);
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.match(ics, /DTSTART;TZID=America\/Los_Angeles:20260824T120000\r\n/);
  assert.match(ics, /DTEND;TZID=America\/Los_Angeles:20260824T135000\r\n/);
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261205T075959Z/);
  assert.match(ics, /EXDATE;TZID=America\/Los_Angeles:20260907T120000/);
  assert.match(ics, /LOCATION:KAP 160\\, Kaprielian Hall/);
  for (const line of ics.split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, line);
  }
});

test('googleCalendarUrl opens a weekly event form', () => {
  const url = new URL(googleCalendarUrl(TEXT, SERIES));
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(
    url.searchParams.get('dates'),
    '20260824T120000/20260824T135000',
  );
  assert.equal(url.searchParams.get('ctz'), 'America/Los_Angeles');
  assert.match(url.searchParams.get('recur') ?? '', /BYDAY=MO,WE/);
});
