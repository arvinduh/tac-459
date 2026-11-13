/**
 * Content schemas: the shape of every content file, checked at build.
 *
 * Owns field names, types and the descriptions editors see on hover. Each
 * schema is a factory, because images and cross-file references are
 * resolved by whoever loads the files (Astro at build, a plain string when
 * generating editor schemas), so the caller passes those pieces in.
 *
 * Objects are strict: a misspelled field fails the build instead of being
 * silently ignored.
 */
import { z } from 'zod';

/** Wall-clock time in the course time zone, e.g. '13:50'. */
const clock = z.iso.time({ precision: -1 });
const weekday = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

/** A weekly slot: class meetings and office hours share this shape. */
const session = z.strictObject({
  days: z.array(weekday).min(1),
  start: clock.describe("Start time, 24-hour, e.g. '12:00'."),
  end: clock.describe("End time, 24-hour, e.g. '13:50'."),
  location: z.string().describe("A room code such as 'KAP 160', or 'Zoom'."),
});

/** Semester weeks, first and last inclusive. */
const weeks = z
  .strictObject({ from: z.int().min(1), to: z.int().min(1) })
  .refine(({ from, to }) => from <= to, 'weeks.from is after weeks.to');

/** Course identity and search metadata: site.json. */
export function siteSchema<T extends z.ZodType>(term: T) {
  return z.strictObject({
    courseCode: z.string(),
    title: z.string(),
    homeTitle: z
      .string()
      .max(70)
      .describe("The home page's tab and search-result title."),
    description: z.string().max(160).describe('The search-result snippet.'),
    currentTerm: term.describe('The term the site shows, e.g. fall-2026.'),
    buildings: z
      .record(z.string(), z.string())
      .default({})
      .describe('Building names by room-code prefix, for map links.'),
    indexable: z
      .boolean()
      .describe('Lets search engines index the site; false until launch.'),
  });
}

/** The course pitch and its parts: course/overview.json. */
export const overviewSchema = z.strictObject({
  headline: z
    .array(
      z
        .string()
        .max(18)
        .regex(/^[^*]*\*[^*]+\*[^*]*$/, 'Mark one key term with *asterisks*'),
    )
    .min(2)
    .max(5)
    .describe(
      'The promise that opens the home page, one short phrase per line, each with its key term in *asterisks*.',
    ),
  blurb: z.string().describe('A short paragraph under the headline.'),
  parts: z
    .array(
      z.strictObject({
        id: z
          .enum(['curriculum', 'company-overview', 'capstone'])
          .describe("The part's link on the Course page, e.g. #capstone."),
        title: z.string(),
        promise: z.string().describe('The part as one short promise.'),
        weeks,
        summary: z.string().describe('Short form for cards and search.'),
        detail: z.string().describe('Long form, opening its section.'),
        steps: z
          .array(z.strictObject({ title: z.string(), text: z.string() }))
          .default([]),
      }),
    )
    .min(1),
});

/** Weekly topics grouped by module: course/curriculum.json. */
export const curriculumSchema = z.strictObject({
  modules: z.array(
    z.strictObject({
      title: z.string(),
      weeks: z.array(
        z.strictObject({
          title: z.string(),
          core: z.array(z.string()).min(1),
          deeper: z.array(z.string()).default([]),
        }),
      ),
    }),
  ),
});

/** A folder may hold at most one photo; returns it, or nothing. */
function onePhoto<I extends z.ZodType>(image: () => I) {
  return z.array(image()).max(1, 'Keep one photo in this folder');
}

/** One person, ever: people/<id>/person.json, beside photo and bio.md. */
export function personSchema<I extends z.ZodType>(image: () => I) {
  return z
    .strictObject({
      name: z.string(),
      honorific: z.string().optional().describe("e.g. 'Prof.'"),
      positions: z.array(z.string()).min(1),
      email: z.email().optional(),
      links: z
        .strictObject({ linkedin: z.url(), viterbi: z.url() })
        .partial()
        .default({}),
      summary: z.string().optional().describe('A short bio for the team page.'),
      images: onePhoto(image),
    })
    .transform(({ images: [photo], ...person }) => ({ ...person, photo }));
}

/** What changes per term: terms/<id>/term.json, beside the class photo. */
export function termSchema<I extends z.ZodType, P extends z.ZodType>(
  image: () => I,
  person: P,
) {
  return z
    .strictObject({
      classes: z
        .strictObject({ start: z.iso.date(), end: z.iso.date() })
        .optional()
        .describe('First and last day of classes; needed once current.'),
      meetings: z.array(session).default([]),
      staff: z.array(
        z.strictObject({
          person,
          role: z.enum(['instructor', 'learningAssistant']),
          officeHours: z
            .union([session, z.string()])
            .optional()
            .describe("A weekly slot, or a note like 'Announced on Piazza'."),
        }),
      ),
      images: onePhoto(image),
    })
    .transform(({ images: [classPhoto], ...term }) => ({
      ...term,
      classPhoto,
    }));
}

/** A product a past team built: projects/<term>/<slug>/project.json. */
export function projectSchema<I extends z.ZodType>(image: () => I) {
  return z.strictObject({
    title: z.string(),
    team: z.array(z.string()).min(1),
    summary: z
      .string()
      .max(160)
      .describe('One sentence for cards and search results.'),
    description: z.string().describe('What the product does.'),
    built: z.string().describe('How the team built it.'),
    images: z.tuple([image()], image(), {
      error: 'Add at least one screenshot to this folder',
    }),
  });
}
