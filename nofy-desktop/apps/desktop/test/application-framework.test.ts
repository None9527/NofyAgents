import assert from "node:assert/strict";
import test from "node:test";
import { createResource } from "../renderer/application/workspace/resource.ts";
import { createFileResources } from "../renderer/application/workspace/fileResources.ts";
import { createFileSearch } from "../renderer/application/workspace/search.ts";
import { openPanel, closePanel } from "../renderer/application/workspace/panelTabs.ts";
import { createDesktopClient } from "../renderer/application/client.ts";
import type { FilesClient } from "../renderer/application/contracts/public.ts";
import type { Runtime } from "../renderer/core/runtime.ts";
import type { Effect } from "../renderer/core/effects.ts";
import { initialState } from "../renderer/core/store/state.ts";
import { createStore } from "../renderer/core/store/store.ts";
import { reduce } from "../renderer/core/project.ts";
import { createFrameView, selectFrameView, sharedFrameView } from "../renderer/ui/frameStore.ts";
const defer = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; };
const flush = () => new Promise<void>(resolve => setImmediate(resolve));
const file = (content: string) => ({ content, size: content.length, lineCount: 1, type: "text" });
function files(overrides: Partial<FilesClient>): FilesClient {
  return { list: async () => ({ ok: true, value: { nodes: [], truncated: false } }), read: async () => ({ ok: true, value: file("default") }), openSearch: async () => ({ ok: true, value: "s" }), changeSearch: async () => ({ ok: true, effect: "search/fuzzyChange" }), closeSearch: async () => ({ ok: true, effect: "search/fuzzyClose" }), ...overrides };
}
test("resource refresh is single-flight and disposed responses cannot repaint", async () => {
  const request = defer<number>(); let reads = 0; let paints = 0;
  const resource = createResource(0, () => { reads++; return request.promise; });
  resource.subscribe(() => paints++);
  const first = resource.refresh(), second = resource.refresh();
  assert.equal(first, second); await flush(); assert.equal(reads, 1);
  resource.dispose(); request.resolve(42); await first;
  assert.equal(resource.getSnapshot().value, 0); assert.equal(paints, 1);
});
test("a changed connection identity discards a query even before owner cleanup", async () => {
  const request = defer<number>(); let valid = true;
  const resource = createResource(0, () => request.promise, () => valid);
  const work = resource.refresh(); valid = false; request.resolve(7); await work;
  assert.equal(resource.getSnapshot().value, 0);
});
test("file A arriving after B cannot replace the active preview; closing invalidates reads", async () => {
  const a = defer<any>(), b = defer<any>();
  const owner = createFileResources(files({ read: (_id, path) => path === "A" ? a.promise : b.promise }), "session", () => true);
  const openA = owner.openFile("A"), openB = owner.openFile("B");
  b.resolve({ ok: true, value: file("B") }); await openB;
  a.resolve({ ok: true, value: file("A") }); await openA;
  assert.equal(owner.getSnapshot().preview?.file?.content, "B");
  const late = defer<any>(); const another = createFileResources(files({ read: () => late.promise }), "session", () => true);
  const work = another.openFile("C"); another.closePreview(); late.resolve({ ok: true, value: file("C") }); await work;
  assert.equal(another.getSnapshot().preview, null);
});
test("directory reads coalesce and an invalidated workspace cannot populate the new tree", async () => {
  const request = defer<any>(); let reads = 0; let valid = true;
  const owner = createFileResources(files({ list: () => { reads++; return request.promise; } }), "session", () => valid);
  const first = owner.loadDir("/A"), second = owner.loadDir("/A"); assert.equal(first, second); assert.equal(reads, 1);
  valid = false; request.resolve({ ok: true, value: { nodes: [], truncated: true } }); await first;
  assert.deepEqual(owner.getSnapshot().dirs, {});
});
test("a pending fuzzy open is not duplicated and uses the latest query", async () => {
  const request = defer<any>(); let opens = 0; const queries: string[] = [];
  const owner = createFileSearch(files({ openSearch: () => { opens++; return request.promise; }, changeSearch: async (_id, q) => { queries.push(q); return { ok: true, effect: "search/fuzzyChange" }; } }), "session", "/root");
  const work = owner.change("first"); void owner.change("latest");
  request.resolve({ ok: true, value: "search" }); await work;
  assert.equal(opens, 1); assert.deepEqual(queries, ["latest"]); owner.close();
});
test("a late fuzzy open is closed after unmount, but never closed through a new transport", async () => {
  for (const changed of [false, true]) {
    const request = defer<any>(); const closed: string[] = []; let valid = true;
    const owner = createFileSearch(files({ openSearch: () => request.promise, closeSearch: async id => { closed.push(id); return { ok: true, effect: "search/fuzzyClose" }; } }), "session", "/root", () => valid);
    const work = owner.change("x"); owner.close(); if (changed) valid = false;
    request.resolve({ ok: true, value: "old-id" }); await work;
    assert.deepEqual(closed, changed ? [] : ["old-id"]); assert.equal(owner.getSnapshot(), null);
  }
});
test("panel navigation deduplicates, preserves order and selects a neighbor on close", () => {
  let state = openPanel({ tabs: [], active: null }, "files"); state = openPanel(state, "review"); state = openPanel(state, "files");
  assert.deepEqual(state, { tabs: ["files", "review"], active: "files" });
  state = closePanel(state, "files"); assert.deepEqual(state, { tabs: ["review"], active: "review" });
  assert.deepEqual(closePanel(state, "review"), { tabs: [], active: null });
});
test("unrelated projection updates do not notify selected readers; all readers see changed slices", () => {
  let state = { active: { text: "A" }, background: 0 }; let changed!: () => void; let tick!: () => void;
  const source = { getState: () => state, subscribe: (fn: () => void) => { changed = fn; return () => {}; } };
  const view = createFrameView(source, fn => { tick = fn; return () => {}; });
  const selection = selectFrameView(view, s => s.active); let one = 0, two = 0;
  const off1 = selection.subscribe(() => one++), off2 = selection.subscribe(() => two++);
  const original = selection.getSnapshot();
  state = { ...state, background: 1 }; changed(); tick(); assert.equal(selection.getSnapshot(), original); assert.equal(one + two, 0);
  state = { ...state, active: { text: "new" } }; changed(); tick(); assert.equal(one, 1); assert.equal(two, 1);
  off1(); off2();
  assert.equal(sharedFrameView(source), sharedFrameView({ ...source }));
});
test("desktop client hides transport mutation and rejects a stale approval with reused RPC id", async () => {
  const store = createStore(reduce, initialState()); const effects: Effect[] = [];
  const runtime = { store, effect: async (effect: Effect) => { effects.push(effect); return { ok: true, effect: effect.kind }; }, pickDirectory: async () => null } as unknown as Runtime;
  const client = createDesktopClient(runtime); assert.equal(createDesktopClient(runtime), client);
  assert.equal("dispatch" in client.projection, false); assert.equal("bridge" in client, false); assert.equal("effect" in client, false);
  store.dispatch({ type: "kernel/server-request", id: 1, method: "_nofy/exit_plan_mode", params: { sessionId: "a" } });
  const stale = store.getState().pendingInteractions[0]!;
  store.dispatch({ type: "connection/status", status: "reconnecting" });
  store.dispatch({ type: "connection/initialized", result: {} });
  store.dispatch({ type: "kernel/server-request", id: 1, method: "_nofy/exit_plan_mode", params: { sessionId: "a" } });
  assert.equal((await client.interactions.cancel(stale)).ok, false); assert.equal(effects.length, 0);
  await client.interactions.cancel(store.getState().pendingInteractions[0]!); assert.equal(effects[0]?.kind, "interaction/cancel");
});
test("permission mode transition stops before sending a notification through a changed kernel", async () => {
  const store = createStore(reduce, initialState()); const effects: Effect[] = [];
  const runtime = { store, effect: async (effect: Effect) => { effects.push(effect); if (effect.kind === "session/setMode") store.dispatch({ type: "connection/status", status: "reconnecting" }); return { ok: true, effect: effect.kind }; }, pickDirectory: async () => null } as unknown as Runtime;
  const result = await createDesktopClient(runtime).sessions.setPermission("a", "full");
  assert.equal(result.ok, false); assert.deepEqual(effects.map(effect => effect.kind), ["session/setMode"]);
});

test("failed fuzzy opens expose an error instead of pretending to remain loading", async () => {
  const owner = createFileSearch(files({ openSearch: async () => ({ ok: false, error: "unavailable" }) }), "session", "/root");
  let changed = 0; owner.subscribe(() => changed++);
  await owner.change("x");
  assert.equal(owner.getSnapshot(), null); assert.equal(owner.getErrorSnapshot(), "unavailable"); assert.ok(changed > 0);
});
