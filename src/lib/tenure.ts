/**
 * Packs staff tenures into the fewest timeline lanes.
 *
 * A tenure is the set of term positions (0 = earliest term) someone held a
 * role. People whose tenures never share a term can share a lane, so the
 * lane count equals the most people in that role in any one term.
 */

/** One person's terms in one role, as term positions. */
export interface Tenure {
  id: string;
  terms: number[];
}

/** Where a tenure sits: its lane and its unbroken runs of terms. */
export interface Placement {
  id: string;
  lane: number;
  /** Inclusive [first, last] term positions of each unbroken run. */
  runs: Array<[number, number]>;
}

/** Splits sorted term positions into unbroken runs, e.g. [0,1,3] → [0,1],[3,3]. */
export function toRuns(terms: readonly number[]): Array<[number, number]> {
  const runs: Array<[number, number]> = [];
  for (const term of [...terms].sort((a, b) => a - b)) {
    const last = runs.at(-1);
    if (last && term === last[1] + 1) last[1] = term;
    else runs.push([term, term]);
  }
  return runs;
}

/**
 * Assigns each tenure the lowest lane free in all of its terms, earliest
 * starters first, which keeps long-serving people in the top lanes.
 */
export function placeInLanes(tenures: readonly Tenure[]): Placement[] {
  const lanes: Array<Set<number>> = [];
  const ordered = [...tenures].sort(
    (a, b) => Math.min(...a.terms) - Math.min(...b.terms),
  );
  return ordered.map(({ id, terms }) => {
    let lane = lanes.findIndex((taken) => terms.every((t) => !taken.has(t)));
    if (lane < 0) lane = lanes.push(new Set<number>()) - 1;
    for (const term of terms) lanes[lane]?.add(term);
    return { id, lane, runs: toRuns(terms) };
  });
}
