/**
 * Serves the current term's class meetings as an .ics calendar, for the
 * home page's "Add to calendar" link. Rebuilt from the term file each build.
 */
import type { APIRoute } from 'astro';
import { buildIcs } from '../lib/calendar';
import { getClassCalendar } from '../lib/course';
import { href } from '../lib/paths';

export const GET: APIRoute = async ({ site }) => {
  const { id, text, series } = await getClassCalendar(
    new URL(href('/'), site).href,
  );
  return new Response(buildIcs(id, text, series), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
