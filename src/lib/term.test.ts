/** Unit tests for time formatting and term order. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatClock, formatSession, formatTimes, termRank } from './term.ts';

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
