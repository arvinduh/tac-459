/**
 * Content schemas: every file under src/content is validated here at build.
 *
 * A typo, a missing person or a dangling reference fails the
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
    /** Term the site shows; past terms stay for the archive. */
    currentTerm: reference('terms'),
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
            core: z.array(z.string()).min(1),
            deeper: z.array(z.string()).default([]),
          }),
        ),
      }),
    ),
  }),
});

/** Wall-clock time in the course time zone, e.g. '13:50'. */
const clock = z.iso.time({ precision: -1 });
const weekday = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

/** The course pitch: an intro and the components the course is built from. */
const overview = defineCollection({
  loader: singleton('src/content/course/overview.yaml', 'overview'),
  schema: z.object({
    /** One-sentence pitch under the home page title. */
    lede: z.string(),
    intro: z.string(),
    components: z
      .array(
        z.object({
          /** Slug of the component's own page, e.g. 'capstone'. */
          id: z.enum(['curriculum', 'company-overview', 'capstone']),
          title: z.string(),
          timing: z.string(),
          /** Short form for the home page. */
          summary: z.string(),
          /** Long form that opens the component's own page. */
          detail: z.string(),
          steps: z
            .array(
              z.object({
                label: z.string().optional(),
                title: z.string(),
                text: z.string(),
              }),
            )
            .default([]),
        }),
      )
      .min(1),
  }),
});

/** One small file per term holding only what changes term to term. */
const terms = defineCollection({
  loader: glob({ pattern: '*.yaml', base: 'src/content/terms' }),
  schema: ({ image }) =>
    z.object({
      label: z.string(),
      /** Whole-class photo, kept beside the term file. */
      classPhoto: image().optional(),
      meetings: z
        .array(
          z.object({
            days: z.array(weekday).min(1),
            start: clock,
            end: clock,
            location: z.string(),
          }),
        )
        .default([]),
      staff: z.array(
        z.object({
          person: reference('people'),
          role: z.enum(['instructor', 'learningAssistant']),
        }),
      ),
    }),
});

/** Products past teams built: one folder per product, under its term. */
const projects = defineCollection({
  loader: glob({ pattern: '*/*/index.md', base: 'src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      term: reference('terms'),
      team: z.array(z.string()).min(1),
      /** One sentence for cards and the meta description. */
      summary: z.string().max(160),
      /** Screenshots; the first is the cover. */
      images: z.tuple([image()], image()),
    }),
});

export const collections = {
  site,
  people,
  curriculum,
  overview,
  terms,
  projects,
};
