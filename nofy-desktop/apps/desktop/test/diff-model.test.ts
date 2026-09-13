/**
 * unified diff 纯模型门禁（审查面 #4）。
 *
 * 解析与折叠是「看起来简单、写错没人发现」的那类代码：行号串一位，界面上只是
 *  gutter 数字不对，截图都未必看得出来。用测试钉住：hunk 头解析、增/删/上下文
 * 的行号推进、No-newline 标记不吃行号、hunk 间空档补折叠、threshold=0 不折。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { diffTotals, foldContext, parseUnifiedDiff } from "../renderer/features/aux/diffModel.ts";

const PATCH = [
  "--- a/f.txt",
  "+++ b/f.txt",
  "@@ -1,4 +1,4 @@",
  " one",
  "-two",
  "+TWO",
  " three",
  "@@ -10,3 +10,4 @@",
  " ten",
  "+eleven",
  " twelve",
  " thirteen",
].join("\n");

test("解析：文件头跳过、hunk 头切段、行号各自推进", () => {
  const hunks = parseUnifiedDiff(PATCH);
  assert.equal(hunks.length, 2);
  assert.equal(hunks[0]?.oldStart, 1);
  assert.equal(hunks[1]?.oldStart, 10);
  const first = hunks[0]?.lines ?? [];
  assert.deepEqual(first.map((l) => [l.kind, l.oldNo, l.newNo]), [
    ["ctx", 1, 1],
    ["del", 2, null],
    ["add", null, 2],
    ["ctx", 3, 3],
  ]);
  const second = hunks[1]?.lines ?? [];
  assert.deepEqual(second.map((l) => [l.kind, l.oldNo, l.newNo]), [
    ["ctx", 10, 10],
    ["add", null, 11],
    ["ctx", 11, 12],
    ["ctx", 12, 13],
  ]);
});

test("解析：No-newline 标记不吃行号，也不变成一行", () => {
  const hunks = parseUnifiedDiff(["@@ -1,1 +1,1 @@", "-old", "+new", "\\ No newline at end of file"].join("\n"));
  const lines = hunks[0]?.lines ?? [];
  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map((l) => l.kind), ["del", "add"]);
});

test("解析：坏行降级为上下文（不抛、不丢）", () => {
  const hunks = parseUnifiedDiff(["@@ -1,2 +1,2 @@", " ctx", "???weird", "+add"].join("\n"));
  const lines = hunks[0]?.lines ?? [];
  assert.deepEqual(lines.map((l) => l.kind), ["ctx", "ctx", "add"]);
});

test("折叠：hunk 间空档按行号差补折叠段；段内长上下文折、短上下文留", () => {
  const segs = foldContext(parseUnifiedDiff(PATCH), 3);
  // 第一段 show(4 行) → fold(空档 6 行：old 4..9) → show(4 行)
  assert.deepEqual(segs.map((s) => s.kind), ["show", "fold", "show"]);
  const fold = segs[1];
  assert.ok(fold !== undefined && fold.kind === "fold", "第二段应是折叠段");
  assert.equal(fold.count, 6);
  assert.equal(fold.gap, true, "hunk 间空档是 gap 折叠（本地展不开）");
  assert.deepEqual(fold.lines, []);
});

test("折叠：段内折叠保留行文本（本地可展开），gap 折叠不保留", () => {
  const patch = ["@@ -1,6 +1,6 @@", " a", " b", " c", " d", "-e", "+E"].join("\n");
  const segs = foldContext(parseUnifiedDiff(patch), 3);
  const fold = segs[0];
  assert.ok(fold !== undefined, "至少应切出一段");
  assert.equal(fold.kind, "fold");
  if (fold.kind === "fold") {
    assert.equal(fold.gap, false);
    assert.equal(fold.lines.length, 4);
    assert.deepEqual(fold.lines.map((l) => l.text), ["a", "b", "c", "d"]);
  }
});

test("折叠：threshold=0 不折（全展开）", () => {
  const segs = foldContext(parseUnifiedDiff(PATCH), 0);
  assert.ok(segs.every((s) => s.kind === "show"));
});

test("折叠：段内连续上下文超过 threshold 才折", () => {
  const patch = ["@@ -1,6 +1,6 @@", " a", " b", " c", " d", "-e", "+E"].join("\n");
  const folded = foldContext(parseUnifiedDiff(patch), 3);
  assert.deepEqual(folded.map((s) => s.kind), ["fold", "show"], "4 连上下文 > 3 ⇒ 折");
  const kept = foldContext(parseUnifiedDiff(patch), 4);
  assert.deepEqual(kept.map((s) => s.kind), ["show"], "4 连上下文 = 4 ⇒ 不折");
});

test("汇总：增/删计数只数 +/- 行", () => {
  assert.deepEqual(diffTotals(parseUnifiedDiff(PATCH)), { add: 2, del: 1 });
});
