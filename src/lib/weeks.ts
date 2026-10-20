/**
 * Lays the course's parts out week by week, for the course timeline.
 *
 * Each part is a lane over its span of semester weeks. The curriculum's
 * lane takes one week of topics per week, in module order; a part with one
 * step per week takes a step each week; any other part shows all its steps
 * in its first week and continues through the rest. Pure functions; the
 * page owns the markup.
 */

interface Step {
  title: string;
  text: string;
}

interface Part {
  id: string;
  title: string;
  weeks: { from: number; to: number };
  steps: Step[];
}

interface Module {
  title: string;
  weeks: Array<{ title: string; core: string[]; deeper: string[] }>;
}

/** What one lane shows in one week. */
export type Cell =
  | { kind: 'none' }
  | { kind: 'continue' }
  | {
      kind: 'topic';
      /** Set in a module's first week. */
      module?: { number: number; title: string };
      title: string;
      core: string[];
      deeper: string[];
    }
  | ({ kind: 'step' } & Step)
  | { kind: 'steps'; steps: Step[] };

/** One semester week across every lane, in lane order. */
export interface WeekRow {
  week: number;
  cells: Cell[];
}

/** Returns the curriculum's weeks of topics, numbered and in module order. */
function topicCells(modules: readonly Module[]): Cell[] {
  return modules.flatMap((module, index) =>
    module.weeks.map((week, weekIndex): Cell => ({
      kind: 'topic',
      ...(weekIndex === 0 && {
        module: { number: index + 1, title: module.title },
      }),
      ...week,
    })),
  );
}

/** Returns a part's cells over its own span, first week first. */
function partCells(part: Part, modules: readonly Module[]): Cell[] {
  const span = part.weeks.to - part.weeks.from + 1;
  if (part.id === 'curriculum') {
    const cells = topicCells(modules);
    if (cells.length !== span) {
      throw new Error(
        `overview.yaml: the curriculum spans ${span} weeks but ` +
          `curriculum.yaml has ${cells.length} weeks of topics`,
      );
    }
    return cells;
  }
  if (part.steps.length === span) {
    return part.steps.map((step): Cell => ({ kind: 'step', ...step }));
  }
  return [
    { kind: 'steps', steps: part.steps },
    ...Array.from({ length: span - 1 }, (): Cell => ({ kind: 'continue' })),
  ];
}

/**
 * Returns every week from 1 to the last week of any part, with what each
 * part shows that week.
 *
 * Throws when the curriculum's span and its weeks of topics disagree.
 */
export function buildWeeks(
  parts: readonly Part[],
  modules: readonly Module[],
): WeekRow[] {
  const last = Math.max(...parts.map(({ weeks }) => weeks.to));
  const lanes = parts.map((part) => ({
    from: part.weeks.from,
    cells: partCells(part, modules),
  }));
  return Array.from({ length: last }, (_, index) => {
    const week = index + 1;
    return {
      week,
      cells: lanes.map(
        ({ from, cells }): Cell => cells[week - from] ?? { kind: 'none' },
      ),
    };
  });
}
