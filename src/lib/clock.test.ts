/** Unit tests for course wall time. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { wallTime } from './clock.ts';

const ZONE = 'America/Los_Angeles';

test('wallTime converts to Pacific daylight time', () => {
  assert.equal(
    wallTime(ZONE, new Date('2026-08-24T19:00Z')),
    '2026-08-24T12:00',
  );
});

test('wallTime rolls the day back near UTC midnight', () => {
  assert.equal(
    wallTime(ZONE, new Date('2026-12-02T05:30Z')),
    '2026-12-01T21:30',
  );
});

test('wallTime prints midnight as 00, not 24', () => {
  assert.equal(
    wallTime(ZONE, new Date('2026-11-03T08:00Z')),
    '2026-11-03T00:00',
  );
});
