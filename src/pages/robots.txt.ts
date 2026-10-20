/**
 * Serves robots.txt pointing crawlers at the generated sitemap.
 *
 * Crawling stays allowed even while the site is not indexable, because the
 * pages' own noindex tag is what keeps them out of results, and a crawler
 * has to fetch a page to see it.
 */
import type { APIRoute } from 'astro';
import { href } from '../lib/paths';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(href('/sitemap-index.xml'), site);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`);
};
