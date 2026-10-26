import assert from "node:assert/strict";
import test from "node:test";
import { initialState, reduce } from "../renderer/core/project.ts";
import { normalizeNotification } from "../renderer/core/events.ts";

function stream() {
  let state = reduce(initialState(), { type: "session/created", sessionId: "a", cwd: "/a", modelId: null });
  let seq = 0;
  return {
    emit(kind: string, extra: Record<string, unknown> = {}) {
      state = reduce(state, { type: "kernel/event", event: normalizeNotification(kind === "response_completed" || kind === "turn_completed" ? "_nofy/session/update" : "session/update", { sessionId: "a", update: { sessionUpdate: kind, ...extra }, _meta: { eventId: `a-${++seq}` } }) });
    },
    blocks: () => state.sessions.a!.blocks,
  };
}
const text = (text: string) => ({ content: { type: "text", text } });

test("thought deltas join exactly without inserting whitespace or mutating snapshots", () => {
  const s = stream(); s.emit("agent_thought_chunk", text("Hello"));
  const before = s.blocks();
  s.emit("agent_thought_chunk", text(" 世界")); s.emit("agent_thought_chunk", text("!"));
  assert.equal(s.blocks().length, 1);
  const previous = before[0]!; const current = s.blocks()[0]!;
  assert.equal(previous.kind === "agent-thought" && previous.text, "Hello");
  assert.equal(current.kind === "agent-thought" && current.text, "Hello 世界!");
});

test("tools and agent messages break adjacent thought groups", () => {
  const s = stream(); s.emit("agent_thought_chunk", text("Before"));
  s.emit("tool_call", { toolCallId: "t", title: "Read" });
  s.emit("agent_thought_chunk", text("After"));
  s.emit("agent_message_chunk", text("Answer"));
  assert.deepEqual(s.blocks().map(b => b.kind), ["agent-thought", "tool-call", "agent-thought", "agent-message"]);
  assert.ok(s.blocks().filter(b => b.kind === "agent-thought").every(b => b.closed));
});

test("response completion closes thoughts even without any agent message", () => {
  const s = stream(); s.emit("agent_thought_chunk", text("First"));
  s.emit("response_completed"); s.emit("agent_thought_chunk", text("Second"));
  assert.equal(s.blocks().length, 2);
  const first = s.blocks()[0]!;
  assert.equal(first.kind === "agent-thought" && first.closed, true);
});

test("cancelled turns close thoughts and next turn starts a separate group", () => {
  const s = stream(); s.emit("agent_thought_chunk", text("First"));
  s.emit("turn_completed", { stop_reason: "cancelled" });
  s.emit("agent_thought_chunk", text("Second"));
  assert.equal(s.blocks().length, 2);
  const first = s.blocks()[0]!;
  assert.equal(first.kind === "agent-thought" && first.closed, true);
});
