/**
 * The site's in-place detail: hover cards, hints and the motion they share.
 *
 * Owns behavior and the floating shells; pages own what goes inside, as
 * build-time HTML. Browser-only and framework-free. Styles come from
 * `@tac/interact/interact.css`, which reads the site's tokens.
 */
export { startCards } from './cards.ts';
export { startHints } from './hints.ts';
