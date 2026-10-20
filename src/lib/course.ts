/**
 * Build-time access to the site config, terms, curriculum, people and products.
 *
 * Pages call these instead of reading collections directly, so a missing
 * singleton fails with one clear message and the current term is resolved
 * in one place.
 */
import { getCollection, getEntry } from 'astro:content';
import { termRank } from './term';

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

/** Returns this term's staff in term-file order. */
export async function getCurrentStaff() {
  const term = await getCurrentTerm();
  return Promise.all(
    term.staff.map(async ({ person, role }) => {
      const entry = await getEntry(person);
      if (!entry) throw new Error(`Person '${person.id}' is missing`);
      return { role, person: entry };
    }),
  );
}

/** Returns the course pitch from overview.yaml. */
export async function getOverview() {
  const overview = await getEntry('overview', 'overview');
  if (!overview) {
    throw new Error('src/content/course/overview.yaml is missing');
  }
  return overview.data;
}

/** Returns one course component by the id its page is named after. */
export async function getComponent(id: string) {
  const { components } = await getOverview();
  const component = components.find((entry) => entry.id === id);
  if (!component) throw new Error(`Course component '${id}' is missing`);
  return component;
}

/**
 * Returns every term that has products or a class photo, newest first, with
 * its products in folder order.
 */
export async function getProjectTerms() {
  const [terms, projects] = await Promise.all([
    getCollection('terms'),
    getCollection('projects'),
  ]);
  return terms
    .map(({ id, data }) => ({
      id,
      label: data.label,
      classPhoto: data.classPhoto,
      projects: projects.filter((project) => project.data.term.id === id),
    }))
    .filter((term) => term.projects.length > 0 || term.classPhoto)
    .sort((a, b) => termRank(b.id) - termRank(a.id));
}

/**
 * Returns everyone who taught a past term but not the current one, with the
 * labels of the terms they taught, most recently active first.
 */
export async function getPastStaff() {
  const { currentTerm } = await getSite();
  const terms = (await getCollection('terms')).sort(
    (a, b) => termRank(b.id) - termRank(a.id),
  );
  const current = terms.find(({ id }) => id === currentTerm.id);
  const currentIds = new Set(
    current?.data.staff.map(({ person }) => person.id),
  );
  const pastTerms = new Map<string, string[]>();
  for (const { id, data } of terms) {
    if (id === currentTerm.id) continue;
    for (const { person } of data.staff) {
      if (currentIds.has(person.id)) continue;
      pastTerms.set(person.id, [
        ...(pastTerms.get(person.id) ?? []),
        data.label,
      ]);
    }
  }
  return Promise.all(
    [...pastTerms].map(async ([id, labels]) => {
      const person = await getEntry('people', id);
      if (!person) throw new Error(`Person '${id}' is missing`);
      return { person, terms: labels };
    }),
  );
}
