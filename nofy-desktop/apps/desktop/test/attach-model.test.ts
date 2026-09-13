/**
 * 「+ 添加上下文」门禁。两条纪律：
 *  1. 客户端不读文件——wire 块只有 resource_link（uri 三斜杠）+ 文本块，顺序固定；
 *  2. 展示路径只做前缀运算（cwd 下剥相对），不碰 fs、不解析符号链接。
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { FuzzyMatch } from "../renderer/ui/readers.ts";
import {
  attachBlocks,
  attachDisplayPath,
  dedupeAttach,
  matchToAttach,
} from "../renderer/features/conversation/attachModel.ts";

const MATCH: FuzzyMatch = {
  name: "contextModel.ts",
  path: "/Users/mac/nofy-build/nofy-desktop/apps/desktop/renderer/features/conversation/contextModel.ts",
  type: "file",
  score: 12,
};

test("matchToAttach：fuzzy 行原样转附加项", () => {
  assert.deepEqual(matchToAttach(MATCH), {
    path: MATCH.path,
    name: "contextModel.ts",
    kind: "file",
  });
});

test("dedupeAttach：同路径不重复挂，不改入参", () => {
  const a = matchToAttach(MATCH);
  const once = dedupeAttach([], a);
  assert.equal(once.length, 1);
  const twice = dedupeAttach(once, a);
  assert.equal(twice.length, 1);
  assert.equal(once.length, 1, "入参不被改写");
  const other = { path: "/x/y.ts", name: "y.ts", kind: "file" as const };
  assert.equal(dedupeAttach(once, other).length, 2);
});

test("attachDisplayPath：cwd 下剥相对，其余原样", () => {
  const cwd = "/Users/mac/nofy-build/nofy-desktop";
  assert.equal(attachDisplayPath(cwd + "/apps/desktop/x.ts", cwd), "apps/desktop/x.ts");
  assert.equal(attachDisplayPath("/elsewhere/x.ts", cwd), "/elsewhere/x.ts");
  assert.equal(attachDisplayPath(cwd, cwd), cwd, "路径等于 cwd 不剥成空串");
  assert.equal(attachDisplayPath("/a/b.ts", null), "/a/b.ts");
  assert.equal(attachDisplayPath("/cwd2/x.ts", "/cwd"), "/cwd2/x.ts", "前缀必须按目录边界");
});

test("attachBlocks：附加在前文本在后；uri 三斜杠（内核 strip file:// 后正好是绝对路径）", () => {
  const blocks = attachBlocks([matchToAttach(MATCH)], "看下这个文件");
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0], {
    type: "resource_link",
    uri: "file://" + MATCH.path,
    name: "contextModel.ts",
  });
  assert.equal((blocks[0] as { uri: string }).uri.startsWith("file:///"), true);
  assert.deepEqual(blocks[1], { type: "text", text: "看下这个文件" });
  assert.deepEqual(attachBlocks([], "hi"), [{ type: "text", text: "hi" }]);
});
