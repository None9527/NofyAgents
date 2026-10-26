import test from "node:test";
import assert from "node:assert/strict";
import { modDescriptors } from "../renderer/ui/hotkeys.ts";
test("macOS Option letter shortcuts use the physical letter instead of the produced character", () => {
  const event = { key: "∫", code: "KeyB", metaKey: true, ctrlKey: false, altKey: true, shiftKey: false, repeat: false } as KeyboardEvent;
  assert.deepEqual(modDescriptors(event), ["mod+alt+b", "mod+b"]);
  assert.deepEqual(modDescriptors({ ...event, key: "ı", shiftKey: true } as KeyboardEvent), ["mod+shift+alt+b", "mod+shift+b", "mod+alt+b", "mod+b"]);
});
