import test from "node:test";
import assert from "node:assert/strict";
import { GUEST_POPUP_SELECTOR, popupCoversGuest, rectsOverlap } from "../renderer/application/workspace/popupCover.ts";
import type { PopupSnapshot } from "../renderer/application/workspace/popupCover.ts";

const guest = { x: 800, y: 100, width: 400, height: 600 };
const shown = { display: "flex", visibility: "visible", opacity: "1", containsGuest: false, backdrop: false };

function popup(patch: Partial<PopupSnapshot> & Pick<PopupSnapshot, "box">): PopupSnapshot {
  return { ...shown, ...patch };
}

test("rects ignore boxes that are not positioned yet", () => {
  assert.equal(rectsOverlap(guest, { x: 800, y: 100, width: 1, height: 40 }), false);
  assert.equal(rectsOverlap(guest, { x: 1200, y: 100, width: 40, height: 40 }), false);
});

test("a popup intersecting the guest covers it", () => {
  assert.equal(popupCoversGuest(guest, [popup({ box: { x: 900, y: 80, width: 200, height: 160 } })]), true);
});

test("a popup beside the guest does not cover it", () => {
  assert.equal(popupCoversGuest(guest, [popup({ box: { x: 100, y: 80, width: 280, height: 320 } })]), false);
});

test("hidden, transparent, and host popups do not cover the guest", () => {
  assert.equal(popupCoversGuest(guest, [
    popup({ visibility: "hidden", box: { x: 900, y: 80, width: 200, height: 160 } }),
    popup({ display: "none", box: { x: 900, y: 80, width: 200, height: 160 } }),
    popup({ opacity: "0", box: { x: 900, y: 80, width: 200, height: 160 } }),
    popup({ containsGuest: true, backdrop: true, box: { x: 0, y: 0, width: 1400, height: 900 } }),
    popup({ box: { x: 900, y: 80, width: 0, height: 0 } }),
  ]), false);
});

test("a modal backdrop covers the guest even when the dialog box is elsewhere", () => {
  assert.equal(popupCoversGuest(guest, [popup({ backdrop: true, box: { x: 40, y: 40, width: 280, height: 180 } })]), true);
});

test("the guest cover list skips transparent click catchers", () => {
  assert.equal(GUEST_POPUP_SELECTOR.includes("menu__overlay"), false);
  assert.equal(GUEST_POPUP_SELECTOR.includes("aux__switcher-overlay"), false);
  assert.equal(GUEST_POPUP_SELECTOR.includes(".menu__pop"), true);
  assert.equal(GUEST_POPUP_SELECTOR.includes(".palette__overlay"), true);
});
