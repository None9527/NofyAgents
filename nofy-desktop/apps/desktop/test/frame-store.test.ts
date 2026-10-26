import assert from "node:assert/strict";
import test from "node:test";
import { createFrameView } from "../renderer/ui/frameStore.ts";
test("a burst projects every state but renders only the final frame without losing notifications", () => {
  let state = 0;
  const subscribers = new Set<() => void>();
  const pending: Array<() => void> = [];
  let canceled = 0;
  const store = { getState: () => state, subscribe: (fn: () => void) => { subscribers.add(fn); return () => subscribers.delete(fn); } };
  const view = createFrameView(store, (fn) => { pending.push(fn); return () => { canceled++; }; });
  let painted = 0;
  const off = view.subscribe(() => painted++);
  for (let i = 1; i <= 1000; i++) { state = i; for (const fn of subscribers) fn(); }
  assert.equal(store.getState(), 1000);
  assert.equal(pending.length, 1);
  assert.equal(view.getSnapshot(), 0);
  pending.shift()!();
  assert.equal(view.getSnapshot(), 1000);
  assert.equal(painted, 1);
  state++;
  for (const fn of subscribers) fn();
  off();
  assert.equal(canceled, 1);
  assert.equal(subscribers.size, 0);
});
