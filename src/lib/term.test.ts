/** Unit tests for time formatting and term order. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  currentTermProblems,
  formatClock,
  formatSession,
  formatTimes,
  mapUrl,
  scheduleUrl,
  termLabel,
  termRank,
} from './term.ts';

test('formatClock uses a 12-hour clock', () => {
  assert.equal(formatClock('00:05'), '12:05 am');
  assert.equal(formatClock('12:00'), '12:00 pm');
  assert.equal(formatClock('13:50'), '1:50 pm');
});

test('termRank orders terms by calendar', () => {
  const ids = ['fall-2024', 'spring-2025', 'spring-2024', 'summer-2024'];
  ids.sort((a, b) => termRank(a) - termRank(b));
  assert.deepEqual(ids, [
    'spring-2024',
    'summer-2024',
    'fall-2024',
    'spring-2025',
  ]);
});

test('termRank rejects ids that are not season-year', () => {
  assert.throws(() => termRank('autumn-2024'));
  assert.throws(() => termRank('fall'));
});

test('formatSession joins days, times and place', () => {
  const slot = { days: ['Mon', 'Wed'], start: '12:00', end: '13:50' };
  assert.equal(formatTimes(slot), 'Mon & Wed 12:00 pm–1:50 pm');
  assert.equal(
    formatSession({ ...slot, location: 'KAP 160' }),
    'Mon & Wed 12:00 pm–1:50 pm · KAP 160',
  );
});

test('termLabel capitalizes the season', () => {
  assert.equal(termLabel('fall-2026'), 'Fall 2026');
  assert.equal(termLabel('spring-2024'), 'Spring 2024');
});

test('scheduleUrl uses USC term numbers', () => {
  assert.equal(
    scheduleUrl('fall-2026', 'TAC 459'),
    'https://classes.usc.edu/term/20263/catalogue/course/tac459',
  );
  assert.match(scheduleUrl('spring-2027', 'TAC 459'), /term\/20271\//);
});

test('mapUrl links known buildings only', () => {
  const buildings = { KAP: 'Kaprielian Hall' };
  assert.equal(
    mapUrl('KAP 160', buildings),
    'https://www.google.com/maps/search/?api=1&query=Kaprielian%20Hall%2C%20University%20of%20Southern%20California',
  );
  assert.equal(mapUrl('Zoom', buildings), undefined);
});

test('currentTermProblems accepts a filled-in term', () => {
  const term = {
    classes: { start: '2026-08-24', end: '2026-12-04' },
    noClass: ['2026-09-07'],
    meetings: [{}],
    staff: [{ role: 'instructor' }],
  };
  assert.deepEqual(currentTermProblems('fall-2026', term), []);
});

test('currentTermProblems catches a term copied forward', () => {
  const copied = {
    classes: { start: '2026-08-24', end: '2026-12-04' },
    noClass: ['2026-09-07'],
    meetings: [],
    staff: [{ role: 'learningAssistant' }],
  };
  assert.deepEqual(currentTermProblems('spring-2027', copied), [
    'add its class meetings',
    'add at least one instructor',
    'classes.start 2026-08-24 is not in spring-2027',
  ]);
  assert.deepEqual(
    currentTermProblems('fall-2026', {
      noClass: [],
      meetings: [],
      staff: copied.staff,
    }),
    [
      'add its class meetings',
      'add at least one instructor',
      'add classes: { start, end }',
    ],
  );
});
