/**
 * Writes the JSON Schemas that editors such as VS Code use to autocomplete
 * content files, describe each field on hover and flag mistakes as you type.
 *
 * They are generated from the build's own schemas in @tac/content, so the
 * two can never disagree:
 *
 *   npm run schemas           rewrite .vscode/schemas
 *   npm run schemas -- --check fail if they are out of date
 *
 * Images are found by folder, so they are left out; references to terms
 * and people show as plain ids.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  curriculumSchema,
  overviewSchema,
  personSchema,
  projectSchema,
  siteSchema,
  termSchema,
} from '@tac/content';
import { z } from 'zod';

const OUT = '.vscode/schemas';
const image = () => z.string();
const id = z.string();

const kinds = {
  site: siteSchema(id),
  overview: overviewSchema,
  curriculum: curriculumSchema,
  person: personSchema(image),
  term: termSchema(image, id),
  project: projectSchema(image),
};

/** Renders one schema as editor-facing JSON Schema text. */
function render(schema: z.ZodType): string {
  const json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' });
  const { properties, required } = json;
  if (properties) delete properties['images'];
  if (Array.isArray(required)) {
    json.required = required.filter((key) => key !== 'images');
  }
  return `${JSON.stringify(json, null, 2)}\n`;
}

const check = process.argv.includes('--check');
await mkdir(OUT, { recursive: true });
const stale: string[] = [];
for (const [kind, schema] of Object.entries(kinds)) {
  const path = join(OUT, `${kind}.json`);
  const text = render(schema);
  if (!check) {
    await writeFile(path, text);
    continue;
  }
  const current = await readFile(path, 'utf8').catch(() => '');
  if (current !== text) stale.push(path);
}
if (stale.length > 0) {
  console.error(`Out of date, run npm run schemas: ${stale.join(', ')}`);
  process.exitCode = 1;
}
