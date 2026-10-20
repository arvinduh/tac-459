/**
 * Content schemas: every file under src/content is validated here at build.
 *
 * A typo in a date, a missing person or a dangling deliverable id fails the
 * build with the file and field name, so broken content never deploys.
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
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

export const collections = { site };
