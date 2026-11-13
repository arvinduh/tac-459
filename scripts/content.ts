/**
 * Pure helpers for the content scripts: turning names into ids.
 *
 * Kept free of file system access so they are unit tested directly; the
 * scripts own all reading and writing.
 */

/** Turns a name into a lowercase, hyphenated id, e.g. 'Jane Doe' → 'jane-doe'. */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
