import test from "node:test";
import assert from "node:assert/strict";
import { groupWorkBlocks, toolPresentation, workDuration } from "../renderer/features/conversation/workModel.ts";
import type { Block } from "../renderer/core/store/state.ts";
const read = (id: string): Extract<Block, { kind: "tool-call" }> => ({ kind: "tool-call", id, toolCallId: id, title: "Read", name: "read_file", toolKind: "read", status: "completed", rawInput: { file_path: "/src/" + id }, locations: [], argsDelta: "", resultText: "file content", rawOutput: null, interactionPending: false, interactionKind: null });
test("adjacent exploration groups retain exact block references and chronology", () => {
  const a = read("a"), b = read("b"), c = read("c");
  const thought: Block = { kind: "agent-thought", id: "thought", text: "thinking", closed: true };
  const items = groupWorkBlocks([a,b,thought,c]);
  assert.deepEqual(items.map(i=>i.kind), ["explore", "block", "explore"]);
  assert.equal(items[0]?.kind === "explore" && items[0].blocks[0], a);
  assert.equal(items[2]?.kind === "explore" && items[2].blocks[0], c);
});
test("read paths, command summaries and unknown tools remain distinct", () => {
  assert.equal(toolPresentation(read("a")).path, "/src/a");
  assert.deepEqual(toolPresentation({ ...read("x"), toolKind: "execute", rawInput: { command: "pnpm test" } }), { family: "execute", path: undefined, detail: "pnpm test" });
  assert.equal(toolPresentation({ ...read("x"), toolKind: "custom" }).family, "other");
  assert.equal(toolPresentation({...read("x"),toolKind:"other",name:"list_dir"}).family,"explore");
  assert.equal(toolPresentation({...read("x"),toolKind:null,name:"search_replace"}).family,"edit");
  assert.equal(toolPresentation({...read("x"),toolKind:"execute",name:"read_file"}).family,"execute");
});
test("work duration renders long sessions without claiming per-thought durations", () => {
  assert.equal(workDuration(12), "12 秒"); assert.equal(workDuration(321 * 60), "5 时 21 分"); assert.equal(workDuration(90, "en"), "1 m");
});
