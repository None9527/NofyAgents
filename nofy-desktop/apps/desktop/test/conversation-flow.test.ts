import test from "node:test";
import assert from "node:assert/strict";
import { buildTurnSegments, createTurnIndex, isConversationBlockVisible, segmentIndexForBlock } from "../renderer/application/conversation/public.ts";
import type { Block } from "../renderer/core/store/state.ts";
const user: Block = { kind: "user-message", id: "u", text: "Question", promptIndex: 0, modelId: null };
const answer: Block = { kind: "agent-message", id: "a", text: "Answer", closed: true, usage: null };
const work = (id: string): Block => ({ kind: "agent-thought", id, text: id, closed: true });
const hook: Block = { kind: "event", id: "hook", tag: "hook:stop", payload: { secret: "hook diagnostic" } };

test("work after the answer retains its position instead of moving before the answer", () => {
  const segment = buildTurnSegments([user, work("before"), answer, work("after"), hook], [])[0]!;
  assert.deepEqual(segment.middle.map(b => b.id), ["before"]);
  assert.equal(segment.final, answer);
  assert.deepEqual(segment.following?.map(b => b.id), ["after", "hook"]);
  const visible = [...segment.middle, segment.final!, ...segment.following!].filter(isConversationBlockVisible);
  assert.deepEqual(visible.map(b => b.id), ["before", "a", "after"]);
});
test("hook payload stays in the projection but is excluded from conversation presentation", () => {
  assert.equal(isConversationBlockVisible(hook), false);
  assert.equal(isConversationBlockVisible({ ...hook, tag: "unknown:event" }), true);
  assert.equal(buildTurnSegments([user, answer, hook], [])[0]?.following?.[0], hook);
});
test("trailing updates invalidate their own segment and remain findable", () => {
  const index = createTurnIndex();
  const before = index.read([user, answer, work("after")], []);
  const after = index.read([user, answer, { ...work("after"), text: "changed" } as Block], []);
  assert.notEqual(after[0], before[0]);
  assert.equal(segmentIndexForBlock(after, "after"), 0);
  assert.equal(after[0]?.final, answer);
});
