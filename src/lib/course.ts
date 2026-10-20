/**
 * Build-time access to the site config, the current term and the curriculum.
 *
 * Pages call these instead of reading collections directly, so a missing
 * singleton fails with one clear message and the current term is resolved
 * in one place.
 */
import { getEntry } from 'astro:content';

/** Returns the validated contents of site.yaml. */
export async function getSite() {
  const site = await getEntry('site', 'site');
  if (!site) throw new Error('src/content/site.yaml is missing');
  return site.data;
}

/** Returns the term that site.yaml names as current. */
export async function getCurrentTerm() {
  const { currentTerm } = await getSite();
  const term = await getEntry(currentTerm);
  if (!term) throw new Error(`Term '${currentTerm.id}' is missing`);
  return term.data;
}

/** Returns the curriculum's modules in teaching order. */
export async function getModules() {
  const curriculum = await getEntry('curriculum', 'curriculum');
  if (!curriculum) {
    throw new Error('src/content/course/curriculum.yaml is missing');
  }
  return curriculum.data.modules;
}
