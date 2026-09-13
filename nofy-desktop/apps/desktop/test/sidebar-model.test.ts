/**
 * 侧栏列表模型门禁（分组 / 排序 / 时间芯片）。
 *
 * 这份模型是**侧栏与 ⌘K 共用的会话全集**折出来的，两处答案必须一致；
 * 而排序里「没有时间戳的项沉底」这类规则一旦写反，表现是列表每次刷新都跳一下——
 * 截图抓不到，只有测试抓得到。
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { PaletteSession } from "../renderer/features/shell/palette.ts";
import { buildSidebarModel, reorderProjects, sortTasks } from "../renderer/features/shell/sidebarModel.ts";
import type { SidebarInput, SidebarTask } from "../renderer/features/shell/sidebarModel.ts";

const NOW = 1_800_000_000_000;

function s(id: string, extra: Partial<PaletteSession> = {}): PaletteSession {
  return { key: id, sessionId: id, title: null, activity: null, loaded: true, active: false, cwd: null, at: null, ...extra };
}
function input(over: Partial<SidebarInput> = {}): SidebarInput {
  return { sessions: [], view: "projects", sort: "recent", now: NOW, homeCwd: "/Users/mac", ...over };
}
function task(id: string, title: string, at: number | null): SidebarTask {
  return { key: id, sessionId: id, title, activity: null, loaded: true, active: false, at, time: null };
}

test("项目视图：按 cwd 成组，本窗口工作区标 home，其余标 folder", () => {
  const m = buildSidebarModel(
    input({
      sessions: [s("a", { cwd: "/Users/mac" }), s("b", { cwd: "/Users/mac/nofy-build" }), s("c", { cwd: "/Users/mac/nofy-build" })],
    }),
  );
  assert.equal(m.projects.length, 2);
  const home = m.projects.find((p) => p.kind === "home");
  const other = m.projects.find((p) => p.kind === "folder");
  assert.equal(home?.label, "mac");
  assert.equal(other?.label, "nofy-build");
  assert.equal(other?.tasks.length, 2);
});

test("无 cwd 的会话落进 (none) 组，标签是占位而不是空串", () => {
  const m = buildSidebarModel(input({ sessions: [s("a")] }));
  assert.equal(m.projects.length, 1);
  assert.equal(m.projects[0]?.key, "(none)");
  assert.equal(m.projects[0]?.kind, "none");
  assert.equal(m.projects[0]?.label, "（无工作区）");
});

test("未加载（roster）会话也进列表，且标 loaded=false —— 冷启动可点开的依据", () => {
  const m = buildSidebarModel(
    input({ sessions: [s("l1", { cwd: "/p", loaded: true }), s("u1", { cwd: "/p", key: "roster:u1", loaded: false })] }),
  );
  assert.equal(m.total, 2);
  assert.equal(m.loadedCount, 1);
  const cold = m.projects[0]?.tasks.find((t) => !t.loaded);
  assert.equal(cold?.key, "roster:u1", "React key 必须带 roster: 前缀，否则与已加载项撞 key");
});

test("recent 排序：at 降序，null 一律沉底（不然列表每次刷新都跳）", () => {
  const out = sortTasks([task("n", "无时间", null), task("o", "旧", NOW - 5000), task("y", "新", NOW - 10)], "recent");
  assert.deepEqual(out.map((t) => t.sessionId), ["y", "o", "n"]);
});

test("title 排序：按标题，同标题再按时间降序稳定化", () => {
  const out = sortTasks([task("b", "乙", NOW - 1), task("a", "甲", NOW - 9), task("a2", "甲", NOW - 2)], "title");
  assert.deepEqual(out.map((t) => t.sessionId), ["a2", "a", "b"]);
});

test("空标题解析成「未命名会话」（与 ⌘K 同一个 resolveTaskTitle 口径）", () => {
  const m = buildSidebarModel(input({ sessions: [s("a", { title: "   " })] }));
  assert.equal(m.projects[0]?.tasks[0]?.title, "未命名会话");
});

test("时间芯片走紧凑档：分 / 小时 / 天（活壳实测文案「57分」「1小时」「6天」）", () => {
  const m = buildSidebarModel(
    input({
      sessions: [
        s("m", { cwd: "/p", at: NOW - 57 * 60_000 }),
        s("h", { cwd: "/p", at: NOW - 60 * 60_000 }),
        s("d", { cwd: "/p", at: NOW - 6 * 86_400_000 }),
        s("n", { cwd: "/p", at: null }),
      ],
    }),
  );
  const byId = new Map(m.flat.map((t) => [t.sessionId, t.time]));
  assert.equal(byId.get("m"), "57分");
  assert.equal(byId.get("h"), "1小时");
  assert.equal(byId.get("d"), "6天");
  assert.equal(byId.get("n"), null, "没有时间戳就不画芯片，别写「未知」占位");
});

test("分组视图：flat 是全部任务（跨工作区），视图与排序原样回带", () => {
  const m = buildSidebarModel(
    input({
      view: "grouped",
      sort: "title",
      sessions: [s("a", { cwd: "/p1", title: "甲" }), s("b", { cwd: "/p2", title: "乙" })],
    }),
  );
  assert.equal(m.view, "grouped");
  assert.equal(m.sort, "title");
  assert.deepEqual(m.flat.map((t) => t.title), ["甲", "乙"], "zh collator 走拼音：甲 jiǎ < 乙 yǐ");
  assert.equal(m.projects.length, 2, "两种视图共用一份模型：projects 也要算好，切 tab 不该重算");
});

test("项目排序：recent 按组内最近变更，title 按组名", () => {
  const sessions = [
    s("a", { cwd: "/zzz", at: NOW - 1000 }),
    s("b", { cwd: "/aaa", at: NOW - 9000 }),
  ];
  const recent = buildSidebarModel(input({ sessions, sort: "recent" }));
  assert.deepEqual(recent.projects.map((p) => p.label), ["zzz", "aaa"]);
  const byTitle = buildSidebarModel(input({ sessions, sort: "title" }));
  assert.deepEqual(byTitle.projects.map((p) => p.label), ["aaa", "zzz"]);
});

test("projectOrder：自定义拖拽序优先，不在表里的新工作区按默认序追加", () => {
  const sessions = [
    s("a", { cwd: "/aaa", at: NOW - 1000 }),
    s("b", { cwd: "/bbb", at: NOW - 2000 }),
    s("c", { cwd: "/ccc", at: NOW - 3000 }),
  ];
  const def = buildSidebarModel(input({ sessions }));
  assert.deepEqual(def.projects.map((p) => p.key), ["/aaa", "/bbb", "/ccc"], "默认 recent 序");
  const custom = buildSidebarModel(input({ sessions, projectOrder: ["/ccc", "/aaa"] }));
  assert.deepEqual(custom.projects.map((p) => p.key), ["/ccc", "/aaa", "/bbb"], "表内按表序，表外 /bbb 保持默认相对序追加");
});

test("reorderProjects：把 from 插到 to 的位置；同 key / 缺 key 不炸", () => {
  assert.deepEqual(reorderProjects(["a", "b", "c"], "c", "a"), ["c", "a", "b"]);
  assert.deepEqual(reorderProjects(["a", "b", "c"], "a", "c"), ["b", "c", "a"]);
  assert.deepEqual(reorderProjects(["a", "b"], "a", "a"), ["a", "b"]);
  assert.deepEqual(reorderProjects(["a", "b"], "zz", "a"), ["a", "b"], "from 不在表里 ⇒ 原序");
});
