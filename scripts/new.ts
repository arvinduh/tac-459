/**
 * Starts new content from a template, so editors fill in blanks instead of
 * copying files and guessing field names:
 *
 *   npm run new -- person "Jane Doe"
 *   npm run new -- project fall-2026 "Product name"
 *   npm run new -- term spring-2027
 *
 * It never overwrites: if the target exists, it stops. Each template is
 * valid except for the files it asks for (a photo, screenshots), so the
 * build names exactly what is still missing.
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { termRank } from '@tac/content';
import { slugify } from './content.ts';

const CONTENT = 'src/content';
const [kind, ...args] = process.argv.slice(2);

/** Writes a new file, refusing to replace one that exists. */
async function create(path: string, text: string) {
  const exists = await stat(path).then(
    () => true,
    () => false,
  );
  if (exists) throw new Error(`${path} already exists`);
  await writeFile(path, text);
  console.log(`Created ${path}`);
}

/** Writes a value as a formatted JSON file, refusing to replace one. */
async function createJson(path: string, value: unknown) {
  await create(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Creates a person's folder with a record template. */
async function newPerson(name: string) {
  const dir = join(CONTENT, 'people', slugify(name));
  await mkdir(dir, { recursive: true });
  await createJson(join(dir, 'person.json'), {
    name,
    positions: ['Learning Assistant'],
    summary: `A sentence or two about ${name} for the team page.`,
  });
  console.log(
    `Next: fill in ${dir}/person.json. Initials show until a square ` +
      'photo is added to the folder; a bio.md there becomes the long bio.',
  );
}

/** Creates a product folder under its term with a record template. */
async function newProject(term: string, title: string) {
  termRank(term);
  const dir = join(CONTENT, 'projects', term, slugify(title));
  await mkdir(dir, { recursive: true });
  await createJson(join(dir, 'project.json'), {
    title,
    summary: 'What the product does, for whom, in one sentence.',
    description: 'What the product does and why it matters.',
    built: 'How the team built it, naming the models and tools.',
    team: ['First Last'],
  });
  console.log(
    `Next: add screenshots to ${dir}; they show in name order, so the ` +
      'first one is the cover.',
  );
}

/** Creates a term folder from the current one, with the same staff. */
async function newTerm(id: string) {
  termRank(id);
  const sitePath = join(CONTENT, 'site.json');
  const { currentTerm } = JSON.parse(await readFile(sitePath, 'utf8'));
  const from = join(CONTENT, 'terms', String(currentTerm), 'term.json');
  const dir = join(CONTENT, 'terms', id);
  await mkdir(dir, { recursive: true });
  // The class photo stays behind: last term's photo is not this term's.
  await create(join(dir, 'term.json'), await readFile(from, 'utf8'));
  console.log(
    `Next: update classes, meetings and staff in ${dir}/term.json, then ` +
      `set "currentTerm": "${id}" in ${sitePath}.`,
  );
}

switch (kind) {
  case 'person': {
    const [name] = args;
    if (!name) throw new Error('Usage: npm run new -- person "Full Name"');
    await newPerson(name);
    break;
  }
  case 'project': {
    const [term, title] = args;
    if (!term || !title) {
      throw new Error('Usage: npm run new -- project <term-id> "Title"');
    }
    await newProject(term, title);
    break;
  }
  case 'term': {
    const [id] = args;
    if (!id) throw new Error('Usage: npm run new -- term <season>-<year>');
    await newTerm(id);
    break;
  }
  default:
    throw new Error('Usage: npm run new -- <person|project|term> …');
}
