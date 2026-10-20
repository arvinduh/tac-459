/**
 * The site's page list, shared by the header menu and the footer so both
 * always name the same pages in the same order.
 */
import { href } from './paths';

/** Top-level pages after Home, in reading order. */
export const NAV_LINKS = [
  { label: 'Curriculum', path: '/curriculum/' },
  { label: 'Company overview', path: '/company-overview/' },
  { label: 'Capstone', path: '/capstone/' },
  { label: 'Projects', path: '/projects/' },
  { label: 'Team', path: '/team/' },
] as const;

/** Reports whether a nav path owns the current URL path, children included. */
export function isCurrentPath(here: string, path: string): boolean {
  return here.startsWith(href(path));
}
