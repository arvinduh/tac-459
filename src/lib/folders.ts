/**
 * Loads one content entry per folder: a JSON file, the images beside it and
 * an optional Markdown body.
 *
 * Editors never list files: a photo or screenshot dropped into the folder is
 * picked up by name order, and a bio.md beside the JSON becomes the entry's
 * body. The folder's path under `base` is the entry's id, e.g.
 * 'spring-2025/brieftube'. Schemas, in @tac/content, own what the data means.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import type { Loader, LoaderContext } from 'astro/loaders';

const IMAGE = /\.(avif|jpe?g|png|webp)$/i;
const BODY = 'bio.md';

/** Lists the folders under `dir` that hold `file`, `depth` levels down. */
async function findFolders(
  dir: string,
  file: string,
  depth: number,
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  if (depth === 0) {
    return entries.some((entry) => entry.name === file) ? [dir] : [];
  }
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => findFolders(join(dir, entry.name), file, depth - 1)),
  );
  return nested.flat();
}

/** Reads one folder into the store, validating it against the schema. */
async function loadFolder(
  folder: string,
  base: string,
  file: string,
  context: LoaderContext,
) {
  const { parseData, renderMarkdown, generateDigest, store } = context;
  const names = (await readdir(folder)).sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true }),
  );
  const filePath = relative(process.cwd(), join(folder, file));
  const text = await readFile(filePath, 'utf8');
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`${filePath} must hold one JSON object`);
  }
  const images = names.filter((name) => IMAGE.test(name));
  const id = relative(base, folder).split(sep).join('/');
  const data = await parseData({
    id,
    filePath,
    data: { ...raw, images: images.map((name) => `./${name}`) },
  });
  const body = names.includes(BODY)
    ? await readFile(join(folder, BODY), 'utf8')
    : undefined;
  store.set({
    id,
    data,
    filePath,
    digest: generateDigest(text + images.join() + (body ?? '')),
    ...(body !== undefined && { body, rendered: await renderMarkdown(body) }),
  });
}

/**
 * Loads every `<base>/<folders…>/<file>` at the given depth, reloading in
 * dev whenever anything under `base` changes.
 */
export function folders(base: string, file: string, depth = 1): Loader {
  return {
    name: 'folders',
    load: async (context) => {
      const root = join(process.cwd(), base);
      const sync = async () => {
        const found = await findFolders(root, file, depth);
        context.store.clear();
        await Promise.all(
          found.map((folder) => loadFolder(folder, root, file, context)),
        );
      };
      await sync();
      context.watcher?.add(root);
      context.watcher?.on('all', (...[, path]) => {
        if (path.startsWith(root)) void sync();
      });
    },
  };
}
