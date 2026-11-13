/**
 * Hover cards: the short version of anything a page mentions, opened in
 * place instead of on another page.
 *
 * A trigger is any element with `data-card="<id>"`; its content is the
 * page's `<template id="card-<id>">`, rendered at build time. With a mouse
 * the card opens after a short pause and stays open while the pointer moves
 * onto it; keyboard focus opens it at once. Touch cannot point, so the
 * first tap opens the card as a sheet along the bottom and a second tap
 * follows the trigger's link. One shared native popover gives top-layer
 * stacking, light dismiss and Escape for free, and it survives client-side
 * page swaps because it attaches itself whenever it opens.
 */
import { placeNear } from './place.ts';

/** Pause before a card opens, so passing the pointer over is not a hover. */
const OPEN_DELAY_MS = 180;
/** Grace period for moving the pointer from a trigger onto its card. */
const CLOSE_DELAY_MS = 140;

/** Returns the trigger an event happened in, if any. */
function triggerOf(target: EventTarget | null): HTMLElement | undefined {
  if (!(target instanceof Element)) return undefined;
  return target.closest<HTMLElement>('[data-card]') ?? undefined;
}

/** Wires every hover card on the page. Call once per page load. */
export function startCards(): void {
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const card = document.createElement('div');
  card.className = 'interact-card';
  card.id = 'interact-card';
  card.popover = 'auto';

  let anchor: HTMLElement | undefined;
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function isOpen(): boolean {
    return card.matches(':popover-open');
  }

  function release(): void {
    anchor?.removeAttribute('aria-describedby');
    anchor = undefined;
  }

  function hide(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (isOpen()) card.hidePopover();
    release();
  }

  function position(trigger: HTMLElement): void {
    const spot = placeNear(
      trigger.getBoundingClientRect(),
      card.getBoundingClientRect(),
      {
        width: document.documentElement.clientWidth,
        height: innerHeight,
      },
    );
    card.style.setProperty('--card-x', `${spot.x}px`);
    card.style.setProperty('--card-y', `${spot.y}px`);
    card.dataset['side'] = spot.below ? 'below' : 'above';
  }

  function show(trigger: HTMLElement, asSheet: boolean): void {
    clearTimeout(closeTimer);
    if (trigger === anchor && isOpen()) return;
    const id = trigger.dataset['card'];
    const template = document.getElementById(`card-${id}`);
    if (!(template instanceof HTMLTemplateElement)) return;
    release();
    card.replaceChildren(template.content.cloneNode(true));
    card.classList.toggle('is-sheet', asSheet);
    // Attached on demand: a client-side page swap replaces the body.
    if (!card.isConnected) document.body.append(card);
    if (!isOpen()) card.showPopover();
    if (!asSheet) position(trigger);
    anchor = trigger;
    trigger.setAttribute('aria-describedby', card.id);
  }

  function scheduleHide(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(hide, CLOSE_DELAY_MS);
  }

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (card.contains(event.target as Node)) {
      clearTimeout(closeTimer);
      return;
    }
    const trigger = triggerOf(event.target);
    if (!trigger) return;
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    const delay = isOpen() ? 0 : OPEN_DELAY_MS;
    openTimer = setTimeout(() => show(trigger, false), delay);
  });

  document.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse') return;
    const to = event.relatedTarget as Node | null;
    if (to && (card.contains(to) || triggerOf(to) === anchor)) return;
    if (triggerOf(event.target) || card.contains(event.target as Node)) {
      scheduleHide();
    }
  });

  document.addEventListener('focusin', (event) => {
    const trigger = triggerOf(event.target);
    if (trigger?.matches(':focus-visible')) show(trigger, false);
  });

  document.addEventListener('focusout', (event) => {
    const to = event.relatedTarget as Node | null;
    if (to && card.contains(to)) return;
    if (triggerOf(event.target) === anchor) hide();
  });

  // Touch: light dismiss closes the sheet on pointerdown, before the click,
  // so whether this tap is the second one on the same trigger is noted here.
  let secondTap = false;
  document.addEventListener(
    'pointerdown',
    (event) => {
      secondTap = isOpen() && triggerOf(event.target) === anchor;
    },
    { capture: true },
  );

  // Capture phase, so it runs before a client router follows the link.
  document.addEventListener(
    'click',
    (event) => {
      const trigger = triggerOf(event.target);
      if (!trigger || canHover.matches) return;
      if (secondTap) {
        hide();
        return;
      }
      event.preventDefault();
      show(trigger, true);
    },
    { capture: true },
  );

  card.addEventListener('toggle', (event) => {
    if ((event as ToggleEvent).newState === 'closed') release();
  });

  addEventListener(
    'scroll',
    () => {
      if (isOpen() && !card.classList.contains('is-sheet')) hide();
    },
    { passive: true },
  );
}
