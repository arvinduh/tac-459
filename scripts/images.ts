/**
 * Keeps content images a sensible size: shrinks any photo or screenshot in
 * src/content wider than 2400px, in place, keeping its name and format.
 *
 * The build serves every size and format itself, so this only protects the
 * repository from multi-megabyte phone photos. Run it before committing:
 *
 *   npm run images           shrink in place
 *   npm run images -- --check list what would change, and change nothing
 *
 * In CI, --check prints GitHub warnings instead of failing, so an upload made
 * in the GitHub web editor still deploys.
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/content';
const MAX_WIDTH = 2400;
const IMAGE = /\.(avif|jpe?g|png|webp)$/i;

const check = process.argv.includes('--check');
const inCi = Boolean(process.env['GITHUB_ACTIONS']);

const files = await readdir(ROOT, { recursive: true });
let pending = 0;
let saved = 0;
for (const name of files.filter((file) => IMAGE.test(file))) {
  const path = join(ROOT, name);
  const { width = 0 } = await sharp(path).metadata();
  if (width <= MAX_WIDTH) continue;
  pending += 1;
  const shown = relative('.', path);
  if (check) {
    const issue = `${width}px wide, over ${MAX_WIDTH}px; run npm run images`;
    console.log(
      inCi ? `::warning file=${shown}::${issue}` : `${shown}: ${issue}`,
    );
    continue;
  }
  const before = (await stat(path)).size;
  const data = await sharp(path)
    .rotate()
    .resize({ width: MAX_WIDTH })
    .toBuffer();
  await writeFile(path, data);
  saved += before - data.length;
  console.log(`${shown}: ${width}px → ${MAX_WIDTH}px`);
}

if (check) {
  console.log(pending ? `${pending} image(s) too large` : 'Images are clean');
} else {
  console.log(
    `${pending} image(s) shrunk, ${(saved / 1e6).toFixed(1)} MB saved`,
  );
}
