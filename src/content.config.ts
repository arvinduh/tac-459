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

/** A calendar day; YAML parses an unquoted 2026-08-24 to UTC midnight. */
const calendarDay = z.date();
/** Wall-clock time in the course time zone, e.g. '13:50'. */
const clock = z.iso.time({ precision: -1 });
const weekday = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

/** One small file per term holding only what changes term to term. */
const terms = defineCollection({
  loader: glob({ pattern: '*.yaml', base: 'src/content/terms' }),
  schema: z.object({
    label: z.string(),
    startDate: calendarDay,
    meetings: z.array(
      z.object({
        days: z.array(weekday).min(1),
        start: clock,
        end: clock,
        location: z.string(),
      }),
    ),
    staff: z.array(
      z.object({
        person: reference('people'),
        role: z.enum(['instructor', 'learningAssistant']),
      }),
    ),
    officeHours: z.array(
      z.object({
        person: reference('people'),
        hours: z.object({ day: weekday, start: clock, end: clock }).optional(),
        where: z.array(z.string()).default([]),
      }),
    ),
    due: z.array(
      z.object({
        deliverable: reference('deliverables'),
        date: calendarDay,
        time: clock.optional(),
      }),
    ),
  }),
});

export const collections = {
  site,
  people,
  deliverables,
  curriculum,
  terms,
};
