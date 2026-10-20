/**
 * Site-internal URLs.
 *
 * Pages link through `href` so the deploy base (the GitHub Pages sub-path
 * today, '/' on the course domain later) is decided in astro.config only.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefixes a root-relative path such as '/team/' with the deploy base. */
export function href(path: string): string {
  return `${BASE}${path}`;
}
