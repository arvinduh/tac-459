/** Unit tests for meeting time formatting. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatClock } from './term.ts';

test('formatClock uses a 12-hour clock', () => {
  assert.equal(formatClock('00:05'), '12:05 am');
  assert.equal(formatClock('12:00'), '12:00 pm');
  assert.equal(formatClock('13:50'), '1:50 pm');
});
