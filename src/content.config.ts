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
    description: z.string().max(160),
    /** Term the site shows; past terms stay for the archive. */
    currentTerm: reference('terms'),
    /** Campus building names by room-code prefix, for map links. */
    buildings: z.record(z.string(), z.string()).default({}),
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
      /** Square portrait; initials stand in until one is added. */
      photo: image().optional(),
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
/**
 * A calendar day as 'YYYY-MM-DD'. YAML reads a bare 2026-08-24 as a date,
 * so both that and a quoted string are accepted.
 */
const day = z
  .union([z.date(), z.iso.date()])
  .transform((value) =>
    typeof value === 'string' ? value : value.toISOString().slice(0, 10),
  );
/** A weekly slot: class meetings and office hours share this shape. */
const session = z.object({
  days: z.array(weekday).min(1),
  start: clock,
  end: clock,
  location: z.string(),
});

/** The course pitch: an intro and the components the course is built from. */
const overview = defineCollection({
  loader: singleton('src/content/course/overview.yaml', 'overview'),
  schema: z.object({
    /** The promise that opens the home page, one short sentence. */
    headline: z.string(),
    /** A short paragraph under the headline. */
    blurb: z.string(),
    components: z
      .array(
        z.object({
          /** Slug of the component's own page, e.g. 'capstone'. */
          id: z.enum(['curriculum', 'company-overview', 'capstone']),
          title: z.string(),
          timing: z.string(),
          /** The part as one short promise, shown at its stop on the home page. */
          promise: z.string(),
          /** Semester weeks the part spans, first and last inclusive. */
          weeks: z
            .object({ from: z.int().min(1), to: z.int().min(1) })
            .refine(({ from, to }) => from <= to, 'weeks.from is after to'),
          /** Short form for search results and links to the part. */
          summary: z.string(),
          /** Long form that opens the component's own page. */
          detail: z.string(),
          steps: z
            .array(
              z.object({
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

/**
 * One small file per term holding only what changes term to term. The file
 * name is the term id, such as fall-2026, and its display name derives from it.
 */
const terms = defineCollection({
  loader: glob({ pattern: '*.yaml', base: 'src/content/terms' }),
  schema: ({ image }) =>
    z.object({
      /** Whole-class photo, kept beside the term file. */
      classPhoto: image().optional(),
      meetings: z.array(session).default([]),
      /** First and last day of classes; required once the term is current. */
      classes: z.object({ start: day, end: day }).optional(),
      /** Weekdays without class, such as holidays, left out of the calendar. */
      noClass: z.array(day).default([]),
      staff: z.array(
        z.object({
          person: reference('people'),
          role: z.enum(['instructor', 'learningAssistant']),
          /** Weekly office hours; omit when announced elsewhere. */
          officeHours: session.optional(),
        }),
      ),
    }),
});

/**
 * Products past teams built: one folder per product, under its term, holding
 * index.yaml and the screenshots. The id is '<term>/<product>'.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '*/*/index.yaml',
    base: 'src/content/projects',
    generateId: ({ entry }) => entry.split('/').slice(0, 2).join('/'),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      term: reference('terms'),
      team: z.array(z.string()).min(1),
      /** One sentence for cards and the meta description. */
      summary: z.string().max(160),
      /** What the product does, for its own page. */
      description: z.string(),
      /** How the team built it. */
      built: z.string(),
      /** Public links, each shown only when present. */
      links: z
        .object({ demo: z.url(), code: z.url(), video: z.url() })
        .partial()
        .default({}),
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
