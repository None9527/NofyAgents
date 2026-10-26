import test from "node:test";
import assert from "node:assert/strict";
import { addPinnedIndex, segmentIndexForBlock } from "../renderer/application/conversation/virtualPolicy.ts";
import { buildTurnSegments } from "../renderer/application/conversation/turns.ts";
import type { Block } from "../renderer/core/store/state.ts";
const agent = (id: string): Block => ({ kind: "agent-message", id, text: id, closed: true, usage: null });
test("find targets leading, hidden middle and final blocks with a stable turn index", () => {
  const blocks: Block[] = [agent("leading"), { kind: "user-message", id: "user", text: "q", promptIndex: 0, modelId: null }, agent("middle"), agent("final")];
  const segments = buildTurnSegments(blocks, []);
  assert.equal(segmentIndexForBlock(segments, "leading"), 0);
  for (const id of ["user", "middle", "final"]) assert.equal(segmentIndexForBlock(segments, id), 1);
  assert.equal(segmentIndexForBlock(segments, "missing"), -1);
});
test("an offscreen modal pins one extra index, without duplicate or invalid ranges", () => {
  assert.deepEqual(addPinnedIndex([10,11,12], 2), [2,10,11,12]);
  assert.deepEqual(addPinnedIndex([10,11,12], 11), [10,11,12]);
  assert.deepEqual(addPinnedIndex([10,11,12], -1), [10,11,12]);
});
