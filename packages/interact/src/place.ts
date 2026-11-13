/**
 * Where a floating card goes: under its anchor, or above it when there is
 * more room there, centered on the anchor and kept inside the viewport.
 *
 * Pure geometry in CSS pixels, so it is unit tested without a browser.
 */

/** The parts of a DOMRect placement reads. */
interface Rect {
  left: number;
  top: number;
  bottom: number;
  width: number;
}

/** A size in CSS pixels. */
interface Size {
  width: number;
  height: number;
}

/** A card's top-left corner and which side of its anchor it sits on. */
export interface Placement {
  x: number;
  y: number;
  below: boolean;
}

/** Space between the anchor and the card. */
const GAP = 8;
/** Space kept between the card and the viewport's edges. */
const MARGIN = 12;

/** Places a card of `size` next to `anchor` inside `viewport`. */
export function placeNear(anchor: Rect, size: Size, viewport: Size): Placement {
  const roomBelow = viewport.height - anchor.bottom - GAP - MARGIN;
  const roomAbove = anchor.top - GAP - MARGIN;
  const below = size.height <= roomBelow || roomBelow >= roomAbove;
  const centered = anchor.left + anchor.width / 2 - size.width / 2;
  const maxX = Math.max(MARGIN, viewport.width - size.width - MARGIN);
  return {
    x: Math.min(Math.max(centered, MARGIN), maxX),
    y: below ? anchor.bottom + GAP : anchor.top - GAP - size.height,
    below,
  };
}
