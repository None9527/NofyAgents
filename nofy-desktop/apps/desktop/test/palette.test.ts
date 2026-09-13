/**
 * ⌘K 命令面板的**纯模型**门禁。
 *
 * 为什么单独测：面板的行为大半是「过滤/分组/折叠/排序/高亮区间」这类纯函数，
 * 抄自 ZCode QuickPick 的算法（palette.ts 头注有逐条对照）。抄来的东西最容易
 * 在改写时走样——分词全命中写成任一命中、区间合并漏掉相邻、折叠上限改成 5——
 * 而这些走样在截图上看不出来。故用测试把行为钉住。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTION_SECTIONS, COLLAPSED_LIMIT, HISTORY_LIMIT, RECENT_LIMIT,
  buildPaletteView, findHighlightRanges, formatCompactRelative, formatRelative, matchesQuery,
  mergeHighlightRanges, parseScopedQuery, recordHistory, scopePrefix,
  sessionTitle, stepIndex, tokenizeQuery, workspaceLabel,
} from "../renderer/features/shell/palette.ts";
import type { PaletteAction, PaletteCommand, PaletteInput, PaletteSession } from "../renderer/features/shell/palette.ts";

function action(id: string, section: PaletteAction["section"], title: string, extra: Partial<PaletteAction> = {}): PaletteAction {
  return { id, section, title, keywords: [], icon: "plus", ...extra };
}
function session(id: string, extra: Partial<PaletteSession> = {}): PaletteSession {
  return { key: id, sessionId: id, title: null, activity: null, loaded: true, active: false, cwd: null, at: null, ...extra };
}
function input(over: Partial<PaletteInput> = {}): PaletteInput {
  return { rawQuery: "", scope: "all", actions: [], commands: [], sessions: [], expanded: new Set(), ...over };
}

test("前缀语法：> 命令、# 会话、其余落全部（抄 QuickPick:1129）", () => {
  assert.deepEqual(parseScopedQuery(">git status"), { query: "git status", scope: "commands", explicitScope: true });
  assert.deepEqual(parseScopedQuery("#重构"), { query: "重构", scope: "sessions", explicitScope: true });
  assert.deepEqual(parseScopedQuery("  >  compact "), { query: "compact", scope: "commands", explicitScope: true });
  assert.deepEqual(parseScopedQuery("plain"), { query: "plain", scope: "all", explicitScope: false });
  assert.equal(scopePrefix("commands"), ">");
  assert.equal(scopePrefix("sessions"), "#");
  assert.equal(scopePrefix("all"), "");
});

test("过滤是分词**全命中**，不是任一命中（抄 :1156）", () => {
  assert.ok(matchesQuery("新建会话 new session", "新建"));
  assert.ok(matchesQuery("新建会话 new session", "session 新建"));
  assert.ok(!matchesQuery("新建会话 new session", "session 终端"), "两个词只命中一个不该通过");
  assert.ok(matchesQuery("anything", ""), "空查询匹配全部");
  assert.ok(matchesQuery("Settings", "SETTINGS"), "大小写不敏感");
});

test("高亮区间：分词去重、找全部出现、合并重叠与相邻（抄 :957-1000）", () => {
  assert.deepEqual(tokenizeQuery("  a B a "), ["a", "b"]);
  // 相邻区间会合并（抄来的判据是 range.start > last.end，等于时合并）：
  // "abcabc" 因此是一整段高亮，不是两段。视觉上无差别，但行为要钉住，
  // 改成 >= 就会多出空 <span> 与额外的 key。
  assert.deepEqual(findHighlightRanges("abcabc", "abc"), [{ start: 0, end: 6 }]);
  assert.deepEqual(findHighlightRanges("ab-cd-ab", "ab"), [{ start: 0, end: 2 }, { start: 6, end: 8 }]);
  assert.deepEqual(findHighlightRanges("abcdef", "abc cde"), [{ start: 0, end: 5 }], "重叠区间要合并成一个");
  assert.deepEqual(findHighlightRanges("xyz", "q"), [], "没有命中就是空数组，不是整段高亮");
  assert.deepEqual(mergeHighlightRanges([{ start: 5, end: 7 }, { start: 0, end: 2 }, { start: 1, end: 4 }]), [
    { start: 0, end: 4 },
    { start: 5, end: 7 },
  ]);
});

test("相对时间分档与 null（抄 :922；now 作为参数 ⇒ 不依赖时钟）", () => {
  const now = 1_800_000_000_000;
  assert.equal(formatRelative(now - 10_000, now), "刚刚");
  assert.equal(formatRelative(now - 5 * 60_000, now), "5 分钟前");
  assert.equal(formatRelative(now - 3 * 3_600_000, now), "3 小时前");
  assert.equal(formatRelative(now - 2 * 86_400_000, now), "2 天前");
  assert.equal(formatRelative(now + 60_000, now), "刚刚", "未来时间不当负数显示");
  assert.equal(formatRelative(null, now), null, "没有 lastChangeUnixMs 就不显示时间");
});

test("标题与工作区的回退文案（抄 :934 / :1167）", () => {
  assert.equal(sessionTitle(null), "未命名会话");
  assert.equal(sessionTitle("   "), "未命名会话");
  assert.equal(sessionTitle("重构登录"), "重构登录");
  assert.equal(workspaceLabel("/Users/x/nofy-build"), "nofy-build");
  assert.equal(workspaceLabel(null), null);
});

test("搜索历史：去重置顶、上限 20（抄 :1026/:1088）", () => {
  let h = recordHistory([], "compact", "commands", 1);
  h = recordHistory(h, "git", "commands", 2);
  assert.deepEqual(h.map((e) => e.query), ["git", "compact"], "最新的在前");
  h = recordHistory(h, "compact", "commands", 3);
  assert.deepEqual(h.map((e) => e.query), ["compact", "git"], "重复查询置顶而不是追加");
  assert.deepEqual(recordHistory(h, "   ", "all", 4), h, "空查询不记");
  let many = recordHistory([], "q0", "all", 0);
  for (let i = 1; i < HISTORY_LIMIT + 10; i++) many = recordHistory(many, "q" + String(i), "all", i);
  assert.equal(many.length, HISTORY_LIMIT);
  assert.equal(many[0]!.query, "q" + String(HISTORY_LIMIT + 9));
  // 同词不同范围算两条（范围是搜索语义的一部分）
  const scoped = recordHistory(recordHistory([], "x", "commands", 1), "x", "sessions", 2);
  assert.equal(scoped.length, 2);
});

test("↑↓ 环形步进（cmdk loop 语义）", () => {
  assert.equal(stepIndex(3, 2, 1), 0);
  assert.equal(stepIndex(3, 0, -1), 2);
  assert.equal(stepIndex(0, 0, 1), 0);
});

test("视图：无查询时先给最近会话，且排除当前会话、上限 3（抄 :2600 顺序）", () => {
  const sessions = [
    session("s-active", { active: true, at: 100 }),
    session("s1", { title: "一", at: 90 }),
    session("s2", { title: "二", at: 80 }),
    session("s3", { title: "三", at: 70 }),
    session("s4", { title: "四", at: 60 }),
  ];
  const view = buildPaletteView(input({ sessions }));
  const recent = view.groups.find((g) => g.key === "recent");
  assert.ok(recent !== undefined, "应有「最近会话」段");
  assert.equal(recent!.rows.length, RECENT_LIMIT);
  assert.deepEqual(
    recent!.rows.map((r) => (r.kind === "session" ? r.session.sessionId : "?")),
    ["s1", "s2", "s3"],
    "按最近变更倒序，且不含当前会话",
  );
});

test("视图：动作按段序出现，禁用项不进可导航列表", () => {
  const actions = [
    action("app-1", "app", "反馈"),
    action("cfg-1", "configure", "设置", { disabled: true, note: "P6" }),
    action("pan-1", "panels", "终端 pane"),
    action("sug-1", "suggested", "新建会话"),
  ];
  const view = buildPaletteView(input({ actions }));
  assert.deepEqual(
    view.groups.map((g) => g.key),
    [...ACTION_SECTIONS],
    "段序固定为 suggested/panels/configure/app，与数组顺序无关",
  );
  assert.equal(view.flat.length, 3, "禁用项不可选（不进 ↑↓/Enter 的列表）");
  assert.ok(!view.flat.some((r) => r.kind === "action" && r.action.id === "cfg-1"));
});

test("视图：内核命令按 name/description/hint 过滤，行尾给 hint", () => {
  const commands: PaletteCommand[] = [
    { name: "compact", description: "Compress conversation history", hint: "optional context" },
    { name: "context", description: "Show context window usage", hint: null },
    { name: "deep-research", description: "Research with bounded parallel agents", hint: "<query>" },
  ];
  const all = buildPaletteView(input({ commands }));
  const kernel = all.groups.find((g) => g.key === "kernel");
  assert.equal(kernel!.rows.length, 3);
  const hit = buildPaletteView(input({ rawQuery: "compress", commands }));
  assert.deepEqual(
    hit.groups.find((g) => g.key === "kernel")!.rows.map((r) => (r.kind === "command" ? r.command.name : "?")),
    ["compact"],
    "description 参与匹配（用户记不住命令名，只记得它干什么）",
  );
  const byHint = buildPaletteView(input({ rawQuery: "<query>", commands }));
  assert.deepEqual(
    byHint.groups.find((g) => g.key === "kernel")!.rows.map((r) => (r.kind === "command" ? r.command.name : "?")),
    ["deep-research"],
  );
});

test("视图：全部范围下内核命令折叠到 3 条，展开后给全量（抄 :1111）", () => {
  const commands: PaletteCommand[] = Array.from({ length: 12 }, (_, i) => ({
    name: "cmd-" + String(i),
    description: "共同关键词 shared",
    hint: null,
  }));
  const collapsed = buildPaletteView(input({ rawQuery: "shared", commands }));
  const group = collapsed.groups.find((g) => g.key === "kernel")!;
  assert.equal(group.rows.length, COLLAPSED_LIMIT);
  assert.equal(group.total, 12, "total 记命中总数，界面据此显示「更多结果」");
  const opened = buildPaletteView(input({ rawQuery: "shared", commands, expanded: new Set(["kernel"]) }));
  assert.equal(opened.groups.find((g) => g.key === "kernel")!.rows.length, 12);
  const scoped = buildPaletteView(input({ rawQuery: ">shared", commands }));
  assert.equal(scoped.groups.find((g) => g.key === "kernel")!.rows.length, 12, "命令范围内不折叠");
});

test("视图：前缀覆盖范围胶囊；范围胶囊只管无前缀的查询", () => {
  const sessions = [session("s1", { title: "重构登录" })];
  const commands: PaletteCommand[] = [{ name: "compact", description: "d", hint: null }];
  const byPrefix = buildPaletteView(input({ rawQuery: "#重构", scope: "commands", sessions, commands }));
  assert.equal(byPrefix.scope, "sessions", "输入框前缀优先于胶囊");
  assert.ok(byPrefix.explicitScope);
  assert.ok(!byPrefix.groups.some((g) => g.key === "kernel"));
  const byTab = buildPaletteView(input({ rawQuery: "重构", scope: "sessions", sessions, commands }));
  assert.equal(byTab.scope, "sessions");
  assert.ok(!byTab.explicitScope);
});

test("视图：未加载会话排在已加载之后（点了就能切的优先）", () => {
  const sessions = [
    session("u1", { title: "未加载甲", loaded: false, cwd: "/tmp/a", at: 999 }),
    session("l1", { title: "已加载乙", loaded: true, at: 1 }),
  ];
  const view = buildPaletteView(input({ rawQuery: "载", sessions, scope: "sessions" }));
  const rows = view.groups.flatMap((g) => g.rows).map((r) => (r.kind === "session" ? r.session.sessionId : "?"));
  assert.deepEqual(rows, ["l1", "u1"]);
});

test("视图：查询无命中时 empty=true，且不留空段", () => {
  const view = buildPaletteView(input({ rawQuery: "zzz", actions: [action("a", "app", "反馈")], commands: [{ name: "compact", description: "d", hint: null }] }));
  assert.ok(view.empty);
  assert.deepEqual(view.groups, []);
});

test("相对时间两档：长档给 ⌘K 行，紧凑档给侧栏芯片（活壳实测「57分」「1小时」「6天」）", () => {
  const now = 1_800_000_000_000;
  const min = now - 57 * 60_000;
  const hour = now - 3 * 3_600_000;
  const day = now - 6 * 86_400_000;
  assert.equal(formatRelative(min, now), "57 分钟前");
  assert.equal(formatRelative(hour, now), "3 小时前");
  assert.equal(formatRelative(day, now), "6 天前");
  assert.equal(formatCompactRelative(min, now), "57分");
  assert.equal(formatCompactRelative(hour, now), "3小时");
  assert.equal(formatCompactRelative(day, now), "6天");
  // 两档的边界必须一致：<1 分＝刚刚、未来时间＝刚刚、null＝不画
  assert.equal(formatCompactRelative(now + 5000, now), "刚刚");
  assert.equal(formatCompactRelative(now - 30_000, now), "刚刚");
  assert.equal(formatCompactRelative(null, now), null);
  assert.equal(formatRelative(null, now), null);
});
