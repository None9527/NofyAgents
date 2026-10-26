import test from "node:test";
import assert from "node:assert/strict";
import { initialState, emptySession } from "../renderer/core/store/state.ts";
import { createKnownSessionsSelector, createShellSelector, createApprovalSelector, createQueueSelector, createAgentSourcesSelector, createDiagnosticsSelector } from "../renderer/application/shell/public.ts";
import type { AppState } from "../renderer/core/store/state.ts";
const base = (): AppState => ({ ...initialState(), activeSessionId: "a", sessions: { a: emptySession("a"), b: emptySession("b") } });
test("window composition ignores text, queue, approval, search and diagnostic updates while preserving navigation changes", () => {
  const select = createShellSelector(), state = base(), first = select(state);
  const changed: AppState = { ...state, appliedEvents: 1, sessions: { ...state.sessions, a: { ...state.sessions.a!, blocks: [{ kind: "agent-message", id: "m", text: "stream", closed: false, usage: null }], queueEntries: [{} as never] } }, pendingInteractions: [{ id: 1, method: "ask", sessionId: "a", params: {} }], search: { searchId: "s", sessionId: "a", matches: [], total: 0, done: true, generation: 1 } };
  assert.equal(select(changed), first);
  assert.ok(!("blocks" in first.sessions.a!));
  const renamed = select({ ...changed, sessions: { ...changed.sessions, a: { ...changed.sessions.a!, title: "renamed" } } });
  assert.notEqual(renamed, first); assert.equal(renamed.sessions.a!.title, "renamed"); assert.equal(renamed.sessions.b, first.sessions.b);
  assert.deepEqual(Object.keys(select({ ...changed, sessions: { b: changed.sessions.b! } }).sessions), ["b"]);
});
test("approval scope preserves request identity and detects same-id replacement after reconnect", () => {
  const select = createApprovalSelector(), state = base();
  const a = { id: 1, method: "session/request_permission", sessionId: "a", params: {} }, b = { ...a, sessionId: "b" };
  state.pendingInteractions = [a,b]; const first = select(state); assert.deepEqual(first.items, [a]);
  assert.equal(select({ ...state, appliedEvents: 10 }), first);
  assert.deepEqual(select({ ...state, activeSessionId: "b" }).items, [b]);
  const replacement = { ...a }; const next = select({ ...state, connection: { ...state.connection, transportEpoch: 1 }, pendingInteractions: [replacement] });
  assert.equal(next.items[0], replacement); assert.equal(next.epoch, 1); assert.notEqual(next, first);
});
test("queue scope changes with navigation and availability, not message streaming", () => {
  const select = createQueueSelector(), state = base(), first = select(state);
  assert.equal(select({ ...state, sessions: { ...state.sessions, a: { ...state.sessions.a!, lastEventSeq: 10 } } }), first);
  assert.notEqual(select({ ...state, connection: { ...state.connection, status: "ready" } }), first);
  assert.equal(select({ ...state, activeSessionId: "b" }).id, "b");
});
test("agent sources ignore ordinary text and retain completion changes and session boundaries", () => {
  const select = createAgentSourcesSelector(block => block.kind === "tool-call"), state = base(), first = select(state);
  assert.equal(select({ ...state, sessions: { ...state.sessions, a: { ...state.sessions.a!, blocks: [{ kind: "agent-message", id: "m", text: "delta", closed: false, usage: null }] } } }), first);
  const done = { ...state.sessions.a!, subagentFinished: { child: { status: "completed", error: null, durationMs: 3, output: "done" } } };
  assert.notEqual(select({ ...state, sessions: { ...state.sessions, a: done } }), first);
  assert.notEqual(select({ ...state, activeSessionId: "b" }), first);
});
test("diagnostic counters remain live in their own scope", () => {
  const select = createDiagnosticsSelector(), state = base(), first = select(state);
  assert.equal(select({ ...state, sessions: { ...state.sessions, a: { ...state.sessions.a!, lastEventSeq: 10 } } }), first);
  assert.equal(select({ ...state, appliedEvents: 7 }).appliedEvents, 7);
});

test("navigation rows ignore model/running changes but react to loaded titles and selected task", () => {
  const shell = createShellSelector(), select = createKnownSessionsSelector(), state = base(), first = select(shell(state));
  assert.equal(select(shell({ ...state, sessions: { ...state.sessions, a: { ...state.sessions.a!, agentState: "turn-running", modelId: "new-model" } } })), first);
  const selected = select(shell({ ...state, activeSessionId: "b" }));
  assert.equal(selected.find(row => row.sessionId === "b")?.active, true);
  assert.notEqual(selected, first);
});
