import { useLayoutEffect, useRef } from "react";
import type { UserBrowserBounds } from "../../../shared/user-browser-contract.ts";
import { GUEST_POPUP_SELECTOR, popupCoversGuest } from "./popupCover.ts";
import type { Box, PopupSnapshot } from "./popupCover.ts";

const HIDDEN: UserBrowserBounds = { x: 0, y: 0, width: 0, height: 0, visible: false };

function guestCovered(slot: HTMLElement, guest: Box): boolean {
  const popups: PopupSnapshot[] = [];
  for (const node of Array.from(document.querySelectorAll(GUEST_POPUP_SELECTOR))) {
    if (!(node instanceof HTMLElement)) continue;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    popups.push({
      box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      containsGuest: node.contains(slot),
      backdrop: node instanceof HTMLDialogElement && node.matches(":modal"),
    });
  }
  return popupCoversGuest(guest, popups);
}

/** Keep a main-process WebContentsView aligned with a renderer slot. Coordinates stay CSS pixels. */
export function useBrowserFrame(node: HTMLElement | null, shown: boolean, send: (bounds: UserBrowserBounds) => void): void {
  const sendRef = useRef(send);
  sendRef.current = send;
  useLayoutEffect(() => {
    if (!node || !shown) {
      sendRef.current(HIDDEN);
      return;
    }
    let frame = 0;
    let last = "";
    const tick = () => {
      const rect = node.getBoundingClientRect();
      // Overflow does not clip the sibling WebContentsView. Hide it while a popup intersects the slot.
      const moving = node.closest("[data-aux-motion]")?.getAttribute("data-aux-motion") === "true";
      const guest = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      const placed = rect.width >= 1 && rect.height >= 1;
      const visible = !moving && placed && !guestCovered(node, guest);
      const next: UserBrowserBounds = visible ? { ...guest, visible: true } : HIDDEN;
      const key = visible ? next.x + "|" + next.y + "|" + next.width + "|" + next.height : "hidden";
      if (key !== last) {
        last = key;
        sendRef.current(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      sendRef.current(HIDDEN);
    };
  }, [node, shown]);
}
