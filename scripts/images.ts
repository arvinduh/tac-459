/**
 * Keeps content images small: converts any photo or screenshot dropped into
 * src/content to WebP at most 2400px wide, renames it to a clean id, and
 * updates the content files beside it that point at it.
 *
 * The build accepts any JPEG, PNG or WebP and serves every size itself, so
 * this script protects the repository's size, not the site. Run it before
 * committing new images:
 *
 *   npm run images           convert and rewrite in place
 *   npm run images -- --check list what would change, and change nothing
 *
 * In CI, --check prints GitHub warnings instead of failing, so an upload made
 * in the GitHub web editor still deploys.
 */
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative } from 'node:path';
import sharp from 'sharp';
import { rewriteReference, slugify } from './content.ts';

const ROOT = 'src/content';
const MAX_WIDTH = 2400;
const QUALITY = 86;
const IMAGE = /\.(jpe?g|png|webp|tiff?)$/i;
const CONTENT = /\.(ya?ml|md)$/i;

const check = process.argv.includes('--check');
const inCi = Boolean(process.env['GITHUB_ACTIONS']);

/** Lists every file under a directory, recursively. */
async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

/** Reports whether a path exists. */
async function exists(path: string) {
  return stat(path).then(
    () => true,
    () => false,
  );
}

/** Returns why an image needs work, or nothing when it is already fine. */
async function problem(path: string, target: string) {
  if (basename(path) !== target) return `rename to ${target}`;
  const { width = 0 } = await sharp(path).metadata();
  if (width > MAX_WIDTH) return `${width}px wide, over ${MAX_WIDTH}px`;
  return undefined;
}

/** Converts one image and repoints the content files in its folder. */
async function convert(path: string, target: string) {
  const out = join(dirname(path), target);
  if (out !== path && (await exists(out))) {
    throw new Error(`${out} already exists; rename ${path} first`);
  }
  const before = (await stat(path)).size;
  const data = await sharp(path)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
  await writeFile(out, data);
  if (out !== path) await rm(path);

  const siblings = (await readdir(dirname(path))).filter((name) =>
    CONTENT.test(name),
  );
  for (const name of siblings) {
    const file = join(dirname(path), name);
    const text = await readFile(file, 'utf8');
    const next = rewriteReference(text, basename(path), target);
    if (next !== text) await writeFile(file, next);
  }
  return { before, after: data.length };
}

const images = (await walk(ROOT)).filter((path) => IMAGE.test(path));
let saved = 0;
let pending = 0;
for (const path of images) {
  const target = `${slugify(basename(path, extname(path)))}.webp`;
  const issue = await problem(path, target);
  if (!issue) continue;
  pending += 1;
  const shown = relative('.', path);
  if (check) {
    console.log(
      inCi
        ? `::warning file=${shown}::${issue}; run npm run images`
        : `${shown}: ${issue}`,
    );
    continue;
  }
  const { before, after } = await convert(path, target);
  saved += before - after;
  console.log(`${shown} → ${target} (${Math.round(after / 1024)} KB)`);
}

if (check) {
  console.log(
    pending ? `${pending} image(s) need npm run images` : 'Images are clean',
  );
} else {
  console.log(
    `${pending} image(s) converted, ${(saved / 1e6).toFixed(1)} MB saved`,
  );
}
