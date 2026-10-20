/**
 * The site's page list, shared by the header menu and the footer so both
 * always name the same pages in the same order.
 */
import { href } from './paths';

/** Top-level pages in reading order. */
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Course', path: '/course/' },
  { label: 'Projects', path: '/projects/' },
  { label: 'Team', path: '/team/' },
] as const;

/**
 * Reports whether a nav path owns the current URL path, children included.
 * Home owns only itself, or it would own every page.
 */
export function isCurrentPath(here: string, path: string): boolean {
  if (path === '/') return here === href('/');
  return here.startsWith(href(path));
}
