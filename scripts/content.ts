/**
 * Pure helpers shared by the content scripts: naming and reference rewrites.
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

/** Turns a term id into its label, e.g. 'spring-2027' → 'Spring 2027'. */
export function termLabel(id: string): string {
  const [season = '', year = ''] = id.split('-');
  return `${season.charAt(0).toUpperCase()}${season.slice(1)} ${year}`;
}

/** Points every './from' reference in a content file at './to' instead. */
export function rewriteReference(text: string, from: string, to: string) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(['"]?)\\./${escaped}\\1(?=[\\s,\\]}]|$)`, 'gm'),
    `$1./${to}$1`,
  );
}
