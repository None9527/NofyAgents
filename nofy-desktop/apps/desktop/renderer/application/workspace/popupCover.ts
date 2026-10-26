/** Boxes are CSS pixels. A native WebContentsView paints above the renderer, so overlap has to hide that view. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopupSnapshot {
  box: Box;
  display: string;
  visibility: string;
  opacity: string;
  /** The guest slot lives inside this element, so the element is a host, not a cover. */
  containsGuest: boolean;
  /** A modal dialog's backdrop covers the window even when the dialog box does not. */
  backdrop: boolean;
}

const MIN_BOX = 2;

export function rectsOverlap(a: Box, b: Box): boolean {
  if (a.width < MIN_BOX || a.height < MIN_BOX || b.width < MIN_BOX || b.height < MIN_BOX) return false;
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function popupCoversGuest(guest: Box, popups: readonly PopupSnapshot[]): boolean {
  return popups.some((popup) => {
    if (popup.containsGuest) return false;
    if (popup.display === "none" || popup.visibility === "hidden" || Number(popup.opacity) === 0) return false;
    if (popup.backdrop) return true;
    return rectsOverlap(guest, popup.box);
  });
}

/**
 * Real popup boxes only. Full-screen transparent click catchers (.menu__overlay,
 * .aux__switcher-overlay) are omitted so opening a menu does not blank the page.
 * .palette__overlay stays because it is a visible scrim.
 */
export const GUEST_POPUP_SELECTOR = [
  "[popover]:popover-open",
  "dialog[open]",
  ".menu__pop",
  ".slash",
  ".pickpop",
  ".aux__switcher",
  ".palette",
  ".palette__overlay",
  ".history-dialog",
  ".window-frame__sheet",
].join(",");
