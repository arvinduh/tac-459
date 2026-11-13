/** Unit tests for card placement. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { placeNear } from './place.ts';

const viewport = { width: 1000, height: 800 };
const size = { width: 200, height: 100 };

test('placeNear centers the card under its anchor when it fits', () => {
  const anchor = { left: 400, top: 100, bottom: 120, width: 100 };
  assert.deepEqual(placeNear(anchor, size, viewport), {
    x: 350,
    y: 128,
    below: true,
  });
});

test('placeNear flips above an anchor near the bottom edge', () => {
  const anchor = { left: 400, top: 740, bottom: 760, width: 100 };
  assert.deepEqual(placeNear(anchor, size, viewport), {
    x: 350,
    y: 632,
    below: false,
  });
});

test('placeNear keeps the card inside both side edges', () => {
  const left = { left: 0, top: 100, bottom: 120, width: 20 };
  const right = { left: 980, top: 100, bottom: 120, width: 20 };
  assert.equal(placeNear(left, size, viewport).x, 12);
  assert.equal(placeNear(right, size, viewport).x, 788);
});
