/** Unit tests for term calendar math. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dueKey,
  formatClock,
  formatDay,
  formatDue,
  formatOfficeHours,
  isoDay,
  weekIndexOf,
  weekOf,
} from './term.ts';

const START = new Date('2026-08-24');

test('weekOf spans Monday to Friday', () => {
  const { start, end } = weekOf(START, 0);
  assert.equal(isoDay(start), '2026-08-24');
  assert.equal(isoDay(end), '2026-08-28');
});

test('weekOf crosses month and DST boundaries without drift', () => {
  // Week 10 starts Nov 2, the day after Pacific DST ends.
  assert.equal(isoDay(weekOf(START, 10).start), '2026-11-02');
  assert.equal(isoDay(weekOf(START, 14).end), '2026-12-04');
});

test('formatDay shows the calendar day in any host time zone', () => {
  assert.equal(formatDay(START), 'Aug 24');
});

test('dueKey defaults to end of day and sorts in time order', () => {
  const day = new Date('2026-11-02');
  assert.equal(dueKey(day), '2026-11-02T23:59');
  assert.ok(dueKey(day, '12:00') < dueKey(day));
  assert.ok(dueKey(day) < dueKey(new Date('2026-11-03'), '00:00'));
});

test('formatClock uses a 12-hour clock', () => {
  assert.equal(formatClock('00:05'), '12:05 am');
  assert.equal(formatClock('12:00'), '12:00 pm');
  assert.equal(formatClock('13:50'), '1:50 pm');
});

test('weekIndexOf counts Monday through Sunday as one week', () => {
  assert.equal(weekIndexOf(START, new Date('2026-08-24')), 0);
  assert.equal(weekIndexOf(START, new Date('2026-08-30')), 0);
  assert.equal(weekIndexOf(START, new Date('2026-11-02')), 10);
  assert.equal(weekIndexOf(START, new Date('2026-08-23')), -1);
});

test('formatOfficeHours fills gaps with what students should expect', () => {
  const hours = { day: 'Tue', start: '14:30', end: '15:30' };
  assert.equal(
    formatOfficeHours(['RRB 211', 'Zoom'], hours),
    'Tue 2:30 pm–3:30 pm · RRB 211, Zoom',
  );
  assert.equal(
    formatOfficeHours([]),
    'Hours announced on Piazza · Location TBA',
  );
});

test('formatDue shows the time only when one is set', () => {
  assert.equal(formatDue(new Date('2026-11-02'), '12:00'), 'Nov 2, 12:00 pm');
  assert.equal(formatDue(new Date('2026-11-09')), 'Nov 9');
});
