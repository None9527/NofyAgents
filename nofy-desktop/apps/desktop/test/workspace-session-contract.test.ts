import assert from "node:assert/strict";
import test from "node:test";
import { createDesktopClient } from "../renderer/application/client.ts";
import type { Runtime } from "../renderer/core/runtime.ts";
import type { Effect } from "../renderer/core/effects.ts";
import { createStore } from "../renderer/core/store/store.ts";
import { initialState } from "../renderer/core/store/state.ts";
import { reduce } from "../renderer/core/project.ts";
function fixture(validate: (path: string) => Promise<string>) {
  const store = createStore(reduce, initialState());
  store.dispatch({ type: "connection/initialized", result: {} });
  store.dispatch({ type: "session/created", sessionId: "s", cwd: "/project", modelId: null });
  const effects: Effect[] = [];
  const runtime = { store, bridge: { validateDirectory: validate }, effect: async (effect: Effect) => { effects.push(effect); return { ok: true, effect: effect.kind }; } } as unknown as Runtime;
  return { store, effects, client: createDesktopClient(runtime) };
}
test("missing workspace blocks both creation and prompt before any kernel effect", async () => {
  const f = fixture(async () => { throw new Error("工作区不存在"); });
  assert.equal((await f.client.sessions.create("/missing")).ok, false);
  assert.equal((await f.client.sessions.send("s", "keep draft", [])).ok, false);
  assert.deepEqual(f.effects, []);
  assert.equal(f.store.getState().sessions.s?.agentState, "idle");
});
test("send validates the session directory rather than the selected project and preserves attachments", async () => {
  const paths: string[] = [];
  const f = fixture(async path => { paths.push(path); return path; });
  assert.equal((await f.client.sessions.send("s", "hello", [{ path: "/project/file", name: "file", kind: "file" }])).ok, true);
  assert.deepEqual(paths, ["/project"]);
  assert.equal(f.effects.length, 1);
  const effect = f.effects[0]!;
  assert.equal(effect.kind, "session/prompt");
  if (effect.kind === "session/prompt") { assert.match(effect.promptId!, /^desktop-/); assert.deepEqual(effect.attach, [{ path: "/project/file", name: "file" }]); assert.equal(effect.text, "hello"); }
});
test("transport change during native validation blocks stale prompt", async () => {
  let release!: (path: string) => void;
  const f = fixture(() => new Promise(done => { release = done; }));
  const pending = f.client.sessions.send("s", "hello", []);
  f.store.dispatch({ type: "connection/status", status: "reconnecting" });
  f.store.dispatch({ type: "connection/initialized", result: {} });
  release("/project");
  assert.equal((await pending).ok, false);
  assert.deepEqual(f.effects, []);
});
test("session cwd change during validation blocks rerouted prompt", async () => {
  let release!: (path: string) => void;
  const f = fixture(() => new Promise(done => { release = done; }));
  const pending = f.client.sessions.send("s", "hello", []);
  f.store.dispatch({ type: "session/created", sessionId: "s", cwd: "/other", modelId: null });
  release("/project");
  assert.equal((await pending).ok, false);
  assert.deepEqual(f.effects, []);
});

test("cancelling turns reject additional input without disturbing the current cancellation", async () => {
  const f = fixture(async path => path);
  f.store.dispatch({ type: "session/cancel-requested", sessionId: "s" });
  assert.equal((await f.client.sessions.send("s", "next instruction", [])).ok, false);
  assert.deepEqual(f.effects, []);
  assert.equal(f.store.getState().sessions.s?.agentState, "turn-cancelling");
});
