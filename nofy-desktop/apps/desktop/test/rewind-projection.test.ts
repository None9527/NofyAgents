import assert from "node:assert/strict";
import test from "node:test";
import { reduce } from "../renderer/core/project.ts";
import { normalizeNotification } from "../renderer/core/events.ts";
import { initialState } from "../renderer/core/store/state.ts";

test("persisted rewind marker removes the dead branch, keeps high water and is idempotent", () => {
  let state = reduce(initialState(), { type: "session/created", sessionId: "a", cwd: "/a", modelId: null });
  const emit = (n: number, update: Record<string, unknown>) => {
    state = reduce(state, { type: "kernel/event", event: normalizeNotification(String(update.sessionUpdate).endsWith("_chunk") ? "session/update" : "_nofy/session/update", { sessionId: "a", update, _meta: { eventId: "a-" + n } }) });
  };
  emit(1, { sessionUpdate: "user_message_chunk", content: { type: "text", text: "first" }, _meta: { promptIndex: 0 } });
  emit(2, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "kept" } });
  emit(3, { sessionUpdate: "turn_completed", stop_reason: "end_turn" });
  emit(4, { sessionUpdate: "user_message_chunk", content: { type: "text", text: "second" }, _meta: { promptIndex: 1 } });
  emit(5, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "removed" } });
  emit(6, { sessionUpdate: "rewind_marker", target_prompt_index: 1 });
  assert.equal(state.sessions.a?.blocks.filter(b => b.kind === "user-message").length, 1);
  assert.equal(state.sessions.a?.blocks.some(b => "text" in b && b.text === "removed"), false);
  assert.equal(state.sessions.a?.lastEventSeq, 6);
  const previous = state;
  emit(6, { sessionUpdate: "rewind_marker", target_prompt_index: 1 });
  assert.deepEqual(state.sessions.a, previous.sessions.a);
});
