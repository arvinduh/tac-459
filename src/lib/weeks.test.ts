/** Unit tests for the week-by-week course layout. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildWeeks } from './weeks.ts';

const topic = (title: string) => ({ title, core: ['a'], deeper: [] });
const MODULES = [
  { title: 'One', weeks: [topic('w1'), topic('w2')] },
  { title: 'Two', weeks: [topic('w3')] },
];
const step = (title: string) => ({ title, text: '' });
const PARTS = [
  { id: 'curriculum', title: 'C', weeks: { from: 1, to: 3 }, steps: [] },
  {
    id: 'company-overview',
    title: 'O',
    weeks: { from: 2, to: 3 },
    steps: [step('s1'), step('s2'), step('s3')],
  },
  {
    id: 'capstone',
    title: 'P',
    weeks: { from: 3, to: 4 },
    steps: [step('p1'), step('p2')],
  },
];

test('buildWeeks fills each lane over its own span', () => {
  const rows = buildWeeks(PARTS, MODULES);
  assert.deepEqual(
    rows.map(({ cells }) => cells.map(({ kind }) => kind)),
    [
      ['topic', 'none', 'none'],
      ['topic', 'steps', 'none'],
      ['topic', 'continue', 'step'],
      ['none', 'none', 'step'],
    ],
  );
});

test('buildWeeks marks where each module begins', () => {
  const [first, second, third] = buildWeeks(PARTS, MODULES).map(
    ({ cells }) => cells[0],
  );
  assert.deepEqual(first?.kind === 'topic' && first.module, {
    number: 1,
    title: 'One',
  });
  assert.equal(second?.kind === 'topic' && second.module, undefined);
  assert.equal(third?.kind === 'topic' && third.module?.number, 2);
});

test('buildWeeks rejects a curriculum span without matching topics', () => {
  const [curriculum, ...rest] = PARTS;
  assert.throws(() =>
    buildWeeks(
      [{ ...curriculum!, weeks: { from: 1, to: 4 } }, ...rest],
      MODULES,
    ),
  );
});
