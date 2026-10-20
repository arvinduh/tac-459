/** Unit tests for packing tenures into timeline lanes. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatRuns, placeInLanes, toRuns } from './tenure.ts';

test('toRuns splits at gaps', () => {
  assert.deepEqual(toRuns([3, 0, 1]), [
    [0, 1],
    [3, 3],
  ]);
});

test('placeInLanes reuses a lane once its tenure ends', () => {
  const placed = placeInLanes([
    { id: 'a', terms: [0, 1] },
    { id: 'b', terms: [0, 1, 2] },
    { id: 'c', terms: [2, 3] },
  ]);
  const lanes = Object.fromEntries(placed.map(({ id, lane }) => [id, lane]));
  assert.deepEqual(lanes, { a: 0, b: 1, c: 0 });
});

test('placeInLanes uses as many lanes as the busiest term', () => {
  const placed = placeInLanes([
    { id: 'a', terms: [0] },
    { id: 'b', terms: [0, 1] },
    { id: 'c', terms: [1] },
    { id: 'd', terms: [1, 2] },
  ]);
  assert.equal(Math.max(...placed.map(({ lane }) => lane)) + 1, 3);
});

test('placeInLanes fits a tenure into a gap only when every term is free', () => {
  const placed = placeInLanes([
    { id: 'a', terms: [0, 2] },
    { id: 'b', terms: [1] },
    { id: 'c', terms: [1, 2] },
  ]);
  const lanes = Object.fromEntries(placed.map(({ id, lane }) => [id, lane]));
  assert.deepEqual(lanes, { a: 0, b: 0, c: 1 });
});

test('formatRuns names runs by their first and last terms', () => {
  const labels = ['Spring 2024', 'Fall 2024', 'Spring 2025', 'Fall 2025'];
  assert.equal(
    formatRuns(
      [
        [0, 1],
        [3, 3],
      ],
      labels,
    ),
    'Spring 2024–Fall 2024, Fall 2025',
  );
});
