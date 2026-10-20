/**
 * Content schemas: every file under src/content is validated here at build.
 *
 * A typo in a date, a missing person or a dangling deliverable id fails the
 * build with the file and field name, so broken content never deploys.
 */
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

/** Loads one YAML file as a single entry with the given id. */
function singleton(path: string, id: string) {
  return file(path, { parser: (text) => ({ [id]: parse(text) }) });
}

const site = defineCollection({
  loader: singleton('src/content/site.yaml', 'site'),
  schema: z.object({
    courseCode: z.string(),
    title: z.string(),
    tagline: z.string(),
    description: z.string().max(160),
    googleSiteVerification: z.array(z.string()),
    indexable: z.boolean(),
  }),
});

/** One folder per person, ever; the folder name is the person's id. */
const people = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: 'src/content/people',
    generateId: ({ entry }) => entry.split('/')[0] ?? entry,
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      honorific: z.string().optional(),
      positions: z.array(z.string()).min(1),
      email: z.email().optional(),
      links: z
        .object({ linkedin: z.url(), viterbi: z.url() })
        .partial()
        .default({}),
      photo: image(),
      /** Card blurb; defaults to the bio's first paragraph when omitted. */
      summary: z.string().optional(),
    }),
});

/** Every graded item; weeks and terms point at these ids. */
const deliverables = defineCollection({
  loader: file('src/content/course/deliverables.yaml'),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['assignment', 'project', 'presentation']),
  }),
});

/** Weekly topics grouped by module; week dates derive from the term. */
const curriculum = defineCollection({
  loader: singleton('src/content/course/curriculum.yaml', 'curriculum'),
  schema: z.object({
    modules: z.array(
      z.object({
        title: z.string(),
        weeks: z.array(
          z.object({
            title: z.string(),
            due: z.array(reference('deliverables')).default([]),
            core: z.array(z.string()).min(1),
            deeper: z.array(z.string()).default([]),
          }),
        ),
      }),
    ),
  }),
});

export const collections = { site, people, deliverables, curriculum };
