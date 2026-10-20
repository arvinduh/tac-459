/** Unit tests for the course map's lanes. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLanes } from './lanes.ts';

const topics = (title: string) => ({ title, core: ['a'], deeper: [] });
const MODULES = [
  { title: 'One', weeks: [topics('w1'), topics('w2')] },
  { title: 'Two', weeks: [topics('w3')] },
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

test('buildLanes tiles every lane over the whole semester', () => {
  const { last, lanes } = buildLanes(PARTS, MODULES);
  assert.equal(last, 4);
  assert.deepEqual(
    lanes.map(({ segments }) => segments.map(({ kind, span }) => [kind, span])),
    [
      [
        ['module', 2],
        ['module', 1],
        ['gap', 1],
      ],
      [
        ['gap', 1],
        ['steps', 2],
        ['gap', 1],
      ],
      [
        ['gap', 2],
        ['step', 1],
        ['step', 1],
      ],
    ],
  );
});

test('buildLanes numbers modules and their weeks', () => {
  const [first, second] = buildLanes(PARTS, MODULES).lanes[0]!.segments;
  assert.equal(first?.kind === 'module' && first.number, 1);
  assert.deepEqual(
    first?.kind === 'module' && first.weeks.map(({ week }) => week),
    [1, 2],
  );
  assert.equal(second?.kind === 'module' && second.weeks[0]?.week, 3);
});

test('buildLanes places one step per week', () => {
  const steps = buildLanes(PARTS, MODULES).lanes[2]!.segments.filter(
    (segment) => segment.kind === 'step',
  );
  assert.deepEqual(
    steps.map(({ week, number }) => [week, number]),
    [
      [3, 1],
      [4, 2],
    ],
  );
});

test('buildLanes rejects a curriculum span without matching topics', () => {
  const [curriculum, ...rest] = PARTS;
  assert.throws(() =>
    buildLanes(
      [{ ...curriculum!, weeks: { from: 1, to: 4 } }, ...rest],
      MODULES,
    ),
  );
});
