/**
 * 斜杠面板门禁。三条纪律：
 *  1. 面板开关只看草稿形状（"/" 开头且无空白），不看别的状态；
 *  2. 分组依据是实测的 _meta.scope（有＝技能，无＝内置命令），不猜第三种；
 *  3. 选中＝填 "/name " 文本——内核自己在 prompt 里解析斜杠命令，不造第二条线路。
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { CommandInfo } from "../renderer/ui/readers.ts";
import {
  SLASH_PANEL_LIMIT,
  filterSlashGroups,
  slashInsert,
  slashQueryOf,
  slashStep,
} from "../renderer/features/conversation/slashModel.ts";

function cmd(name: string, scope: string | null, description: string | null = null): CommandInfo {
  return { name, description, hint: null, scope };
}

const TABLE: CommandInfo[] = [
  cmd("compact", null, "Compress conversation history"),
  cmd("context", null, "Show context window usage"),
  cmd("always-approve", null, "Toggle always-approve mode"),
  cmd("vercel-deploy", "user", "Deploy applications to Vercel"),
  cmd("playwright", "user", "Browser automation"),
];

test("slashQueryOf：只认「/ 开头且无空白」", () => {
  assert.equal(slashQueryOf("/"), "");
  assert.equal(slashQueryOf("/com"), "com");
  assert.equal(slashQueryOf("/compact "), null, "出现空白＝参数模式，面板让位");
  assert.equal(slashQueryOf("/compact keep goals"), null);
  assert.equal(slashQueryOf("hi"), null);
  assert.equal(slashQueryOf(""), null);
  assert.equal(slashQueryOf("a/b"), null);
});

test("分组：无 _meta.scope 是命令，有的是技能；空查询全收、命令在前", () => {
  const v = filterSlashGroups(TABLE, "");
  assert.equal(v.open, true);
  assert.deepEqual(
    v.groups.map((g) => [g.id, g.rows.length]),
    [["builtin", 3], ["skill", 2]],
  );
  assert.deepEqual(
    v.flat.map((c) => c.name),
    ["compact", "context", "always-approve", "vercel-deploy", "playwright"],
  );
  assert.equal(v.hidden, 0);
});

test("匹配：名前缀 > 名包含 > 描述包含；都不中才丢", () => {
  const v = filterSlashGroups(TABLE, "comp");
  assert.deepEqual(
    v.flat.map((c) => c.name),
    ["compact"],
  );
  const byDesc = filterSlashGroups(TABLE, "browser");
  assert.deepEqual(
    byDesc.flat.map((c) => c.name),
    ["playwright"],
  );
  const none = filterSlashGroups(TABLE, "zzz");
  assert.equal(none.open, false);
  assert.deepEqual(none.flat, []);
});

test("截断：超过 LIMIT 的诚实报数，命令段优先占预算", () => {
  const many: CommandInfo[] = [];
  for (let i = 0; i < SLASH_PANEL_LIMIT + 4; i += 1) many.push(cmd("k" + String(i), null));
  for (let i = 0; i < 3; i += 1) many.push(cmd("s" + String(i), "user"));
  const v = filterSlashGroups(many, "");
  assert.equal(v.flat.length, SLASH_PANEL_LIMIT);
  assert.equal(v.hidden, 7);
  assert.deepEqual(
    v.groups.map((g) => g.id),
    ["builtin"],
    "预算被命令段占满时技能段整段不画",
  );
});

test("slashInsert / slashStep", () => {
  assert.equal(slashInsert("deep-research"), "/deep-research ");
  assert.equal(slashStep(3, 2, 1), 0, "下越界回绕");
  assert.equal(slashStep(3, 0, -1), 2, "上越界回绕");
  assert.equal(slashStep(0, 0, 1), 0, "空表不炸");
});
