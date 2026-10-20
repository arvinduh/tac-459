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
import { termRank } from '../src/lib/term.ts';
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

/** Creates a person's folder with a bio template. */
async function newPerson(name: string) {
  const dir = join(CONTENT, 'people', slugify(name));
  await mkdir(dir, { recursive: true });
  await create(
    join(dir, 'index.md'),
    `---
name: ${name}
positions:
  - Learning Assistant
# Optional: email, honorific (e.g. Prof.), links: { linkedin: …, viterbi: … }
# Initials show until a photo is added: put photo.webp here and uncomment.
# photo: ./photo.webp
---

A few sentences about ${name}: studies, work and interests.

## Experience

- One line per role or project.
`,
  );
  console.log(`Next: fill in ${dir}/index.md; add a square photo when ready.`);
}

/** Creates a product folder under its term with a record template. */
async function newProject(term: string, title: string) {
  termRank(term);
  const dir = join(CONTENT, 'projects', term, slugify(title));
  await mkdir(dir, { recursive: true });
  await create(
    join(dir, 'index.yaml'),
    `title: ${JSON.stringify(title)}
term: ${term}
# One sentence, at most 160 characters, for cards and search results.
summary: What the product does, for whom.
description: What the product does and why it matters, in a short paragraph.
built: How the team built it, naming the models and tools.
team:
  - First Last
# Screenshots in this folder; the first one is the cover.
images:
  - ./1.webp
# Optional; delete any you do not have.
links:
  demo: https://example.com
  code: https://github.com/owner/repo
  video: https://youtu.be/id
`,
  );
  console.log(
    `Next: add screenshots to ${dir} as 1, 2, 3…, then run npm run images.`,
  );
}

/** Creates a term file from the current one, with the same staff. */
async function newTerm(id: string) {
  termRank(id);
  const site = await readFile(join(CONTENT, 'site.yaml'), 'utf8');
  const current = /^currentTerm: (\S+)/m.exec(site)?.[1];
  if (!current) throw new Error('site.yaml has no currentTerm');
  const from = join(CONTENT, 'terms', `${current}.yaml`);
  const text = await readFile(from, 'utf8');
  await create(join(CONTENT, 'terms', `${id}.yaml`), text);
  console.log(
    `Next: update meetings, staff and office hours in it, then set ` +
      `currentTerm: ${id} in ${join(CONTENT, 'site.yaml')}.`,
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
