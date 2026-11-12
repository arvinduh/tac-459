/**
 * Lays the course's parts out as lanes across the semester's weeks, for
 * the Course page's map.
 *
 * Each part is a lane of segments that tile weeks 1 to the last week of any
 * part: a gap where the part is not running, then its own pieces. The
 * curriculum's pieces are its modules, each spanning its weeks of topics; a
 * part with one step per week takes a step each week; any other part spans
 * its weeks as one group of steps. Pure functions; the page owns the markup.
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

interface Topics {
  title: string;
  core: string[];
  deeper: string[];
}

interface Module {
  title: string;
  weeks: Topics[];
}

/** One piece of a lane, `span` weeks wide. */
export type Segment =
  | { kind: 'gap'; span: number }
  | {
      kind: 'module';
      span: number;
      /** 1-based, in teaching order. */
      number: number;
      title: string;
      weeks: Array<Topics & { week: number }>;
    }
  | { kind: 'step'; span: 1; week: number; number: number; step: Step }
  /** All of a part's steps over its whole span, in order. */
  | { kind: 'steps'; span: number; steps: Step[] };

/** Returns a part's segments over its own span, first week first. */
function partSegments(part: Part, modules: readonly Module[]): Segment[] {
  const { from, to } = part.weeks;
  const span = to - from + 1;
  if (part.id === 'curriculum') {
    const total = modules.reduce((sum, { weeks }) => sum + weeks.length, 0);
    if (total !== span) {
      throw new Error(
        `overview.yaml: the curriculum spans ${span} weeks but ` +
          `curriculum.yaml has ${total} weeks of topics`,
      );
    }
    let week = from;
    return modules.map(({ title, weeks }, index): Segment => ({
      kind: 'module',
      span: weeks.length,
      number: index + 1,
      title,
      weeks: weeks.map((topics) => ({ ...topics, week: week++ })),
    }));
  }
  if (part.steps.length === span) {
    return part.steps.map((step, index): Segment => ({
      kind: 'step',
      span: 1,
      week: from + index,
      number: index + 1,
      step,
    }));
  }
  return [{ kind: 'steps', span, steps: part.steps }];
}

/**
 * Returns every part as a lane of segments covering weeks 1 to the last
 * week of any part, and that last week.
 *
 * Throws when the curriculum's span and its weeks of topics disagree.
 */
export function buildLanes(
  parts: readonly Part[],
  modules: readonly Module[],
): { last: number; lanes: Array<{ part: Part; segments: Segment[] }> } {
  const last = Math.max(...parts.map(({ weeks }) => weeks.to));
  const gap = (span: number): Segment[] =>
    span > 0 ? [{ kind: 'gap', span }] : [];
  return {
    last,
    lanes: parts.map((part) => ({
      part,
      segments: [
        ...gap(part.weeks.from - 1),
        ...partSegments(part, modules),
        ...gap(last - part.weeks.to),
      ],
    })),
  };
}
