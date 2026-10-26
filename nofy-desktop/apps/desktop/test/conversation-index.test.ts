import test from "node:test";
import assert from "node:assert/strict";
import { createTurnIndex, buildTurnSegments, createConversationSelector } from "../renderer/application/conversation/public.ts";
import { emptySession, initialState } from "../renderer/core/store/state.ts";
import type { Block, TurnRecord } from "../renderer/core/store/state.ts";
const user = (id: string): Block => ({ kind: "user-message", id, text: id, promptIndex: 0, modelId: null });
const agent = (id: string, text = "text"): Block => ({ kind: "agent-message", id, text, closed: false, usage: null });
const turn = (id: string, endedAt: number | null = 10): TurnRecord => ({ startedAt: 1, endedAt });
test("tail streaming preserves prior rows and regroups only the active turn", () => {
  const index = createTurnIndex();const blocks = [user("u1"), agent("a1"), user("u2"), agent("a2")];const turns = [turn("t1"), turn("t2", null)];
  const before = index.read(blocks, turns); const after = index.read([...blocks.slice(0, 3), agent("a2", "streamed")], turns);
  assert.equal(after[0], before[0]); assert.notEqual(after[1], before[1]); assert.equal(index.stats().regroupedBlocks, 2);
  assert.deepEqual(after, buildTurnSegments([...blocks.slice(0, 3), agent("a2", "streamed")], turns));
});
test("clock/metadata identity and closing a turn update exactly their affected rows", () => {
  const index = createTurnIndex();const blocks = [user("u1"), agent("a1"), user("u2"), agent("a2")];const turns = [turn("t1"), turn("t2", null)];
  const before = index.read(blocks, turns);assert.equal(index.read(blocks, turns), before);
  const after = index.read(blocks, [turns[0]!, { ...turns[1]!, endedAt: 20 }]);assert.equal(after[0], before[0]);assert.equal(after[1]?.running, false);
});
test("append, prepend, rewinds and earlier edits match full grouping including leading fragments", () => {
  const index = createTurnIndex();let blocks: Block[] = [agent("lead"), user("u1"), agent("a1")];let turns = [turn("t1")];
  assert.deepEqual(index.read(blocks, turns), buildTurnSegments(blocks, turns));
  const variants: Array<[Block[], TurnRecord[]]> = [
    [[...blocks, user("u2"), agent("a2")], [...turns, turn("t2", null)]],
    [[agent("lead", "changed"), ...blocks.slice(1)], turns],
    [[user("prepended"), agent("p"), ...blocks], [turn("p"), ...turns]],
    [[user("u1")], [turn("t1", null)]], [[], []],
  ];
  for (const [b,t] of variants) assert.deepEqual(index.read(b,t), buildTurnSegments(b,t));
});
test("deterministic arbitrary immutable changes keep incremental and full models equivalent", () => {
  const index = createTurnIndex();let blocks: Block[] = [];let turns: TurnRecord[] = [];let seed = 12345;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;return seed; };
  for (let n = 0; n < 150; n++) {
    const choice = random() % 5;
    if (choice === 0 || !blocks.length) { blocks = [...blocks, user("u" + n)];turns = [...turns, turn("t" + n, null)]; }
    else if (choice === 1) blocks = [...blocks, agent("a" + n)];
    else if (choice === 2) { const i = random() % blocks.length;blocks = blocks.map((b,j) => j === i && (b.kind === "agent-message" || b.kind === "user-message") ? { ...b, text: "edit" + n } : b); }
    else if (choice === 3) { blocks = blocks.slice(0, random() % blocks.length);turns = turns.slice(0, blocks.filter(b => b.kind === "user-message").length); }
    else if (turns.length) turns = turns.map((t,i) => i === turns.length - 1 ? { ...t, endedAt: n } : t);
    assert.deepEqual(index.read(blocks, turns), buildTurnSegments(blocks, turns), "iteration " + n);
  }
});
test("conversation projection ignores metadata and inactive session updates but observes blocks and gates", () => {
  const state = initialState();state.sessions.A = emptySession("A");state.sessions.B = emptySession("B");state.activeSessionId = "A";
  const select = createConversationSelector();const before = select(state);
  const metadata = { ...state, sessions: { ...state.sessions, A: { ...state.sessions.A!, title: "changed" }, B: { ...state.sessions.B!, blocks: [user("bg")] } } };
  assert.equal(select(metadata), before);
  const changed = { ...metadata, sessions: { ...metadata.sessions, A: { ...metadata.sessions.A!, blocks: [user("a")] } } };assert.notEqual(select(changed), before);
  assert.equal(select({ ...state, activeSessionId: null }), null);assert.equal(select({ ...state, activeSessionId: "B" })?.id, "B");
});
