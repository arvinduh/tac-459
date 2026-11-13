/**
 * Hints: one short floating line for any element with `data-tip`, such as
 * a week's dates or the terms a person taught.
 *
 * A hint repeats something the page already says, so touch screens, which
 * cannot point, simply go without. One shared element serves the page.
 */
import { placeNear } from './place.ts';

/** Wires every hint on the page. Call once per page load. */
export function startHints(): void {
  const hint = document.createElement('div');
  hint.className = 'interact-hint';
  hint.popover = 'manual';
  hint.setAttribute('role', 'tooltip');

  function show(target: Element): void {
    const text = target.getAttribute('data-tip');
    if (!text) return;
    hint.textContent = text;
    if (!hint.isConnected) document.body.append(hint);
    if (!hint.matches(':popover-open')) hint.showPopover();
    const spot = placeNear(
      target.getBoundingClientRect(),
      hint.getBoundingClientRect(),
      {
        width: document.documentElement.clientWidth,
        height: innerHeight,
      },
    );
    hint.style.setProperty('--card-x', `${spot.x}px`);
    hint.style.setProperty('--card-y', `${spot.y}px`);
  }

  function hide(): void {
    if (hint.matches(':popover-open')) hint.hidePopover();
  }

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    const target = (event.target as Element).closest?.('[data-tip]');
    if (target) {
      show(target);
    } else {
      hide();
    }
  });

  document.addEventListener('focusin', (event) => {
    const target = (event.target as Element).closest?.('[data-tip]');
    if (target) show(target);
  });

  document.addEventListener('focusout', hide);
  addEventListener('scroll', hide, { passive: true });
}
