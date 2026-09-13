/**
 * 生态面 #2（文件 pane）的读取器与投影门禁。
 *
 * 形状来源不是猜的：docs/contract/ecosystem-shapes.json（探针实测）+
 * 内核源码 extensions/fs.rs 的 FsListRequest/FsReadFileRequest。
 * 守的是三件容易走样的事：
 *   1. fs/list 的节点**没有 size**——谁加了 size 就是在编数据；
 *   2. 目录在前、名字字典序的兜底排序（内核已 dirs-first，这里防回归）；
 *   3. fuzzy status 的 generation 乱序旧批必须被投影层丢弃。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { projectEvent } from "../renderer/core/project.ts";
import { initialState } from "../renderer/core/store/state.ts";
import { readFsFile, readFsNodes, readFuzzyMatches } from "../renderer/ui/readers.ts";

test("readFsNodes：取 result.nodes，目录在前、无 size 字段", () => {
  const res = {
    result: {
      nodes: [
        { name: "b.ts", path: "/w/b.ts", type: "file", modifiedAt: "2026-01-01T00:00:00Z" },
        { name: "a-dir", path: "/w/a-dir", type: "directory", modifiedAt: "2026-01-02T00:00:00Z" },
        { name: "a.ts", path: "/w/a.ts", type: "file", modifiedAt: null },
      ],
      truncated: true,
    },
  };
  const read = readFsNodes(res);
  assert.equal(read.truncated, true);
  assert.deepEqual(
    read.nodes.map((n) => n.name),
    ["a-dir", "a.ts", "b.ts"],
    "目录在前，同类型按名字字典序",
  );
  assert.ok(!("size" in read.nodes[0]!), "fs/list 实测无 size，读取器不得编");
  // 缺 path 的节点直接丢，不渲染半行
  const partial = readFsNodes({ result: { nodes: [{ name: "x", type: "file" }] } });
  assert.deepEqual(partial.nodes, []);
  // 没有 result 包装（另一条路径的形状）⇒ 空，不炸
  assert.deepEqual(readFsNodes({ nodes: [] }).nodes, []);
});

test("readFsFile：content 缺失即 null（预览显示「读取失败」而不是空白假装成功）", () => {
  const ok = readFsFile({ result: { content: "line1\nline2", size: 11, lineCount: 2, type: "text" } });
  assert.equal(ok?.content, "line1\nline2");
  assert.equal(ok?.lineCount, 2);
  assert.equal(readFsFile({ result: {} }), null);
  assert.equal(readFsFile(null), null);
});

test("readFuzzyMatches：实测键 name/type/path/score；缺 path 丢弃", () => {
  const matches = readFuzzyMatches([
    { name: "palette.ts", path: "/w/palette.ts", type: "file", score: 12.5, indices: [0, 3] },
    { name: "no-path", type: "file", score: 1 },
    { name: "dir", path: "/w/dir", type: "directory", score: 2 },
  ]);
  assert.equal(matches.length, 2);
  assert.equal(matches[0]?.score, 12.5);
  assert.equal(matches[1]?.type, "directory");
});

test("投影：search-fuzzy-status 进 store.search，且乱序旧批被丢", () => {
  const ev = (generation: number, names: string[]) => ({
    type: "search-fuzzy-status" as const,
    params: {
      sessionId: "s1",
      searchId: "q1",
      generation,
      done: true,
      total: names.length,
      matches: names.map((n) => ({ name: n, path: "/w/" + n, type: "file", score: 1 })),
    },
  });
  let state = initialState();
  state = projectEvent(state, ev(2, ["new.ts"]));
  assert.equal(state.search?.generation, 2);
  assert.equal(readFuzzyMatches(state.search?.matches ?? []).length, 1);
  // 旧批（generation 1）后到 ⇒ 丢弃，但事件计数仍 +1（不静默）
  const appliedBefore = state.appliedEvents;
  state = projectEvent(state, ev(1, ["old.ts"]));
  assert.equal(state.search?.generation, 2, "旧批不得覆盖新批");
  assert.equal(state.appliedEvents, appliedBefore + 1, "丢弃也要计数（PLAN §2.4）");
  // 新批正常覆盖
  state = projectEvent(state, ev(3, ["a.ts", "b.ts"]));
  assert.equal(state.search?.generation, 3);
  assert.equal(readFuzzyMatches(state.search?.matches ?? []).length, 2);
});
