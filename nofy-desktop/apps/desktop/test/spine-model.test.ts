/**
 * spineModel 门：回合分组（user 开回合 / 最后 agent-message = 最终答案 / 运行态判定 / 秒数）。
 * 分组口径来自活壳观察（spineModel.ts 头注），这里锁纯函数行为防回归。
 */
import test from "node:test";
import assert from "node:assert/strict";
import { buildTurnSegments, turnSeconds } from "../renderer/features/conversation/spineModel.ts";
import type { Block, TurnRecord } from "../renderer/core/store/state.ts";

function user(id: string): Block {
  return { kind: "user-message", id, text: "q", promptIndex: 0, modelId: null };
}
function agent(id: string, closed = true): Block {
  return { kind: "agent-message", id, text: "a", closed, usage: null };
}
function thought(id: string): Block {
  return { kind: "agent-thought", id, text: "t", closed: true };
}
function tool(id: string): Block {
  return {
    kind: "tool-call",
    id,
    toolCallId: id,
    name: "read_file",
    title: null,
    toolKind: "read",
    status: "completed",
    rawInput: null,
    locations: [],
    argsDelta: "",
    resultText: null,
    rawOutput: null,
    interactionPending: false,
    interactionKind: null,
  };
}

test("分组：user 开回合；中间过程与最终答案分开", () => {
  const blocks = [user("u1"), thought("t1"), agent("a1"), tool("k1"), agent("a2"), user("u2"), agent("a3")];
  const turns: TurnRecord[] = [
    { startedAt: 1000, endedAt: 4000 },
    { startedAt: 5000, endedAt: null },
  ];
  const segs = buildTurnSegments(blocks, turns);
  assert.equal(segs.length, 2);
  const s1 = segs[0];
  assert.equal(s1?.user?.id, "u1");
  assert.deepEqual(s1?.middle.map((b) => b.id), ["t1", "a1", "k1"]);
  assert.equal(s1?.final?.id, "a2");
  assert.equal(s1?.running, false);
  const s2 = segs[1];
  assert.equal(s2?.running, true);
  assert.equal(s2?.final?.id, "a3");
});

test("无 user 前缀的碎片原样平铺（lead 段无 turn 头）", () => {
  const segs = buildTurnSegments([tool("k0"), agent("a0")], []);
  assert.equal(segs.length, 1);
  assert.equal(segs[0]?.user, null);
  assert.equal(segs[0]?.turn, null);
  assert.deepEqual(segs[0]?.middle.map((b) => b.id), ["k0"]);
  assert.equal(segs[0]?.final?.id, "a0");
});

test("turnSeconds：结束回合用区间、运行中用 now、下限 1s", () => {
  assert.equal(turnSeconds({ startedAt: 1000, endedAt: 4200 }, 9999), 3);
  assert.equal(turnSeconds({ startedAt: 1000, endedAt: null }, 2500), 2);
  assert.equal(turnSeconds({ startedAt: 1000, endedAt: 1200 }, 0), 1);
});
