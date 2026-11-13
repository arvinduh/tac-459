/**
 * Content collections: where each kind of content lives and how it loads.
 *
 * Schemas come from @tac/content; this file only wires them to Astro's
 * images and references. A typo, a missing person or a dangling reference
 * fails the build with the file and field name, so broken content never
 * deploys.
 */
import {
  curriculumSchema,
  overviewSchema,
  personSchema,
  projectSchema,
  siteSchema,
  termSchema,
} from '@tac/content';
import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { folders } from './lib/folders';

/** Loads one JSON file as a single entry with the given id. */
function singleton(path: string, id: string) {
  return file(path, { parser: (text) => ({ [id]: JSON.parse(text) }) });
}

export const collections = {
  site: defineCollection({
    loader: singleton('src/content/site.json', 'site'),
    schema: siteSchema(reference('terms')),
  }),
  overview: defineCollection({
    loader: singleton('src/content/course/overview.json', 'overview'),
    schema: overviewSchema,
  }),
  curriculum: defineCollection({
    loader: singleton('src/content/course/curriculum.json', 'curriculum'),
    schema: curriculumSchema,
  }),
  people: defineCollection({
    loader: folders('src/content/people', 'person.json'),
    schema: ({ image }) => personSchema(image),
  }),
  terms: defineCollection({
    loader: folders('src/content/terms', 'term.json'),
    schema: ({ image }) => termSchema(image, reference('people')),
  }),
  projects: defineCollection({
    loader: folders('src/content/projects', 'project.json', 2),
    schema: ({ image }) => projectSchema(image),
  }),
};
