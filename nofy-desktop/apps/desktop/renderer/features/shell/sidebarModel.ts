/**
 * 侧栏列表的**纯模型**：把「已加载会话 + roster 里的全部会话」折成两种视图。
 *
 * ## 解剖来源（活壳 3.11.2，CDP 实测；docs/contract/zcode-live-metrics.md §1.2）
 *
 * | 活壳的东西 | 实测 | 我们的落点 |
 * |---|---|---|
 * | tabs「分组 / 项目」 | 55×24、滑动胶囊、aria-selected | SidebarView 两态 grouped / projects |
 * | 分组视图 | 扁平行 group/task-row h-7（外框 248×32 + py-px），标题 flex-1 truncate + 时间芯片 ml-auto，按最近变更排序；「定时任务」是内嵌分区（hash 图标 + 计数徽标） | flat[]（定时任务分区随自动化面落地后再加，先不放假分区） |
 * | 项目视图 | 一份文件夹列表。没有目录的会话不进项目 | projects[]（kind = home / folder）；chats[] 是没有目录的会话；本窗口最近打开、还没有会话的文件夹是空项目行 |
 * | 时间芯片文案 | 「57分」「1小时」「6天」 | formatCompactRelative（palette.ts） |
 *
 * 两处刻意差别（都有据，不是偷懒）：
 *  1. 图标只用 house / folder：house 标**本窗口工作区**（boot.cwd），folder 标其他。
 *     活壳的 cloud 是云端项目；roster 实测有 origin 键，但本机内核没给云端会话，
 *     等真有云端来源再加分支——先画一个永远不出现的图标是装饰。
 *  2. 「定时任务」内嵌分区暂缺：自动化面未接线（生态面 #6），空分区比灰按钮更失信。
 *
 * 纯函数：不碰 DOM、不认识线路名。会话范围仍是 ⌘K 用的 PaletteSession[]。
 * 读到 workspace_list 后，项目行改按那份目录分组，并补上名单里尚未出现的会话。
 */
import type { WorkspaceCatalog } from "../../application/shell/public.ts";
import { formatCompactRelative, sessionTitle, workspaceLabel } from "./palette.ts";
import type { PaletteSession } from "./palette.ts";
import { metadataFor } from "./sessionMetadataModel.ts";
import type { SessionMetadataPrefs } from "./sessionMetadataModel.ts";

/** 侧栏两种列表视图（活壳 tabs 的「分组」「项目」）。 */
export type SidebarView = "grouped" | "projects";

/** 排序键（活壳「筛选和排序」菜单里我们真能兑现的两条）。 */
export type SidebarSort = "recent" | "title";

export type SidebarTask = {
  pinned?: boolean;
  unread?: boolean;
  archived?: boolean;
  group?: string | null;
  /** React key：已加载用 sessionId，未加载用 "roster:"+sessionId。 */
  key: string;
  sessionId: string;
  /** 已解析的显示标题（空标题 → 「未命名会话」，抄 :934 resolveTaskTitle）。 */
  title: string;
  activity: string | null;
  loaded: boolean;
  active: boolean;
  /** 最近变更 unix 毫秒；已加载会话可能没有（roster 才有）。 */
  at: number | null;
  /** 紧凑相对时间芯片文案；at 为 null 时 null（不渲染芯片）。 */
  time: string | null;
  /** 项目目录。未加载会话点开时用它定位，不另造一份会话名单。 */
  cwd: string | null;
};

export type SidebarProject = {
  key: string;
  /** 项目一定有目录。没有目录的会话在 SidebarModel.chats，不进这里。 */
  cwd: string;
  /** 末段名。 */
  label: string;
  /** home = 本窗口工作区（画 house）；folder = 其他文件夹。 */
  kind: "home" | "folder";
  tasks: SidebarTask[];
  /** 组内最近的变更时间（项目视图按它排序）；全组都没有则 null。 */
  latest: number | null;
};

export type SidebarModel = {
  groups?: Array<{ name: string | null; tasks: SidebarTask[] }>;
  archivedCount?: number;
  view: SidebarView;
  sort: SidebarSort;
  /** 项目视图的文件夹。含本窗口打开过、但还没有会话的空行。 */
  projects: SidebarProject[];
  /** 没有目录的会话。项目视图单独成「聊天」，不伪装成项目。 */
  chats: SidebarTask[];
  /** 分组视图用（全部任务，已按 sort 排好）。 */
  flat: SidebarTask[];
  total: number;
  loadedCount: number;
};

export type SidebarInput = {
  metadata?: SessionMetadataPrefs;
  archiveView?: boolean;
  sessions: PaletteSession[];
  view: SidebarView;
  sort: SidebarSort;
  now: number;
  /** 本窗口工作区（boot.cwd）。决定哪一行画 house。 */
  homeCwd: string | null;
  /** 工作区行自定义拖拽顺序（LayoutPrefs.projectOrder）；缺省/空 = 默认序。 */
  projectOrder?: string[];
  /**
   * 已读到的 workspace_list。null / 缺省 = 尚未读到或读取失败，项目仍按会话自带目录分组。
   * 读到之后以这份目录为项目来源，名单里还没有的会话仍留在自己的目录下。
   */
  workspaces?: WorkspaceCatalog | null;
  /**
   * 本窗口打开过的文件夹（WorkspacePrefs.recent）。还没有会话的路径补成空项目行。
   * 不造会话；点开才走现有的 session/new。
   */
  recentCwds?: string[];
};

/**
 * 排序：recent = at 降序、**null 一律沉底**（没有时间戳的项参与排序只会乱跳）；
 * title = 标题 localeCompare（zh collator），同标题再按 at 降序稳定化。
 */
export function sortTasks(tasks: SidebarTask[], sort: SidebarSort): SidebarTask[] {
  const out = [...tasks];
  if (sort === "title") {
    out.sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      const c = a.title.localeCompare(b.title, "zh-Hans-CN");
      if (c !== 0) return c;
      return (b.at ?? -1) - (a.at ?? -1);
    });
    return out;
  }
  out.sort((a, b) => Boolean(a.pinned) !== Boolean(b.pinned) ? a.pinned ? -1 : 1 : (b.at ?? -1) - (a.at ?? -1));
  return out;
}

/**
 * 拖拽排序：把 from 移到 to 当前所占的位置（即插在 to 前面）。纯函数，test/sidebar-model 盯着。
 * 返回的是**全量 key 序**，调用方直接存进 LayoutPrefs.projectOrder。
 */
export function reorderProjects(keys: string[], from: string, to: string): string[] {
  if (from === to) return keys;
  if (!keys.includes(from) || !keys.includes(to)) return keys;
  // 插到 to 的**原**下标：向下拖时移除 from 已把 to 左移一位，故原下标恰等于「落在 to 之后」，
  // 向上拖时原下标即「顶替 to 的位置」——两个方向都是「占据目标槽」。
  const target = keys.indexOf(to);
  const out = keys.filter((k) => k !== from);
  out.splice(Math.min(target, out.length), 0, from);
  return out;
}

type Draft = {
  key: string;
  sessionId: string;
  title: string | null;
  activity: string | null;
  loaded: boolean;
  active: boolean;
  at: number | null;
  cwd: string | null;
};

function shown(archived: boolean, active: boolean, archiveView: boolean): boolean {
  return archiveView ? archived : !archived || active;
}

function draftsFor(input: SidebarInput, metadata: SessionMetadataPrefs): Draft[] {
  const archiveView = input.archiveView === true;
  const known = input.sessions.filter((s) => shown(metadataFor(metadata, s.sessionId).archived, s.active, archiveView));
  if (!input.workspaces) {
    return known.map((s) => ({ key: s.key, sessionId: s.sessionId, title: s.title, activity: s.activity, loaded: s.loaded, active: s.active, at: s.at, cwd: s.cwd }));
  }
  const byId = new Map<string, PaletteSession>();
  for (const s of known) {
    const previous = byId.get(s.sessionId);
    if (!previous || (s.loaded && !previous.loaded)) byId.set(s.sessionId, s);
  }
  const placed = new Set<string>();
  const drafts: Draft[] = [];
  for (const item of input.workspaces.sessions) {
    if (placed.has(item.sessionId)) continue;
    const match = byId.get(item.sessionId);
    const active = match?.active ?? false;
    if (!shown(metadataFor(metadata, item.sessionId).archived, active, archiveView)) continue;
    placed.add(item.sessionId);
    drafts.push({
      key: match?.key ?? "summary:" + item.sessionId,
      sessionId: item.sessionId,
      title: item.title ?? match?.title ?? null,
      activity: match?.activity ?? null,
      loaded: match?.loaded ?? false,
      active,
      at: item.at ?? match?.at ?? null,
      cwd: item.cwd.length > 0 ? item.cwd : (match?.cwd ?? null),
    });
  }
  for (const s of known) {
    if (placed.has(s.sessionId)) continue;
    placed.add(s.sessionId);
    drafts.push({ key: s.key, sessionId: s.sessionId, title: s.title, activity: s.activity, loaded: s.loaded, active: s.active, at: s.at, cwd: s.cwd });
  }
  return drafts;
}

export function buildSidebarModel(input: SidebarInput): SidebarModel {
  const { view, sort, now, homeCwd } = input;
  const metadata = input.metadata ?? { version: 1, sessions: {} };
  const ids = new Set(input.sessions.map((s) => s.sessionId));
  if (input.workspaces) for (const row of input.workspaces.sessions) ids.add(row.sessionId);
  const archivedCount = [...ids].filter((id) => metadataFor(metadata, id).archived).length;
  const drafts = draftsFor(input, metadata);
  const tasks = drafts.map((row): SidebarTask => ({
    key: row.key,
    sessionId: row.sessionId,
    title: sessionTitle(row.title),
    activity: row.activity,
    loaded: row.loaded,
    active: row.active,
    at: row.at,
    time: formatCompactRelative(row.at, now),
    cwd: row.cwd,
    ...metadataFor(metadata, row.sessionId),
  }));

  const byCwd = new Map<string, { cwd: string; items: SidebarTask[] }>();
  const chatTasks: SidebarTask[] = [];
  for (const task of tasks) {
    if (task.cwd === null || task.cwd.length === 0) {
      chatTasks.push(task);
      continue;
    }
    const bucket = byCwd.get(task.cwd) ?? { cwd: task.cwd, items: [] };
    bucket.items.push(task);
    byCwd.set(task.cwd, bucket);
  }

  const projects: SidebarProject[] = [];
  for (const [key, bucket] of byCwd) {
    const sorted = sortTasks(bucket.items, sort);
    let latest: number | null = null;
    for (const t of sorted) if (t.at !== null && (latest === null || t.at > latest)) latest = t.at;
    projects.push({
      key,
      cwd: bucket.cwd,
      label: workspaceLabel(bucket.cwd) ?? bucket.cwd,
      kind: bucket.cwd === homeCwd ? "home" : "folder",
      tasks: sorted,
      latest,
    });
  }
  // 最近打开过、但目录里还没有会话的文件夹，并进同一份项目列表。没有时间的空行沉底，除非拖拽序把它们排上来。
  const seen = new Set(projects.map((p) => p.key));
  for (const cwd of input.recentCwds ?? []) {
    if (cwd.trim().length === 0 || seen.has(cwd)) continue;
    seen.add(cwd);
    projects.push({
      key: cwd,
      cwd,
      label: workspaceLabel(cwd) ?? cwd,
      kind: cwd === homeCwd ? "home" : "folder",
      tasks: [],
      latest: null,
    });
  }
  projects.sort((a, b) => {
    if (sort === "title") {
      const c = a.label.localeCompare(b.label, "zh-Hans-CN");
      if (c !== 0) return c;
    }
    return (b.latest ?? -1) - (a.latest ?? -1);
  });

  // 自定义拖拽顺序优先：在表里的按表序，不在表里的（新工作区）保持默认序追加在后。
  // Array.prototype.sort 稳定 ⇒ 同 rank（都不在表里）维持上面的默认序。
  const order = input.projectOrder ?? [];
  if (order.length > 0) {
    const rank = new Map<string, number>(order.map((k, i) => [k, i]));
    projects.sort((a, b) => (rank.get(a.key) ?? Number.POSITIVE_INFINITY) - (rank.get(b.key) ?? Number.POSITIVE_INFINITY));
  }

  const all = tasks;
  const groups = new Map<string | null, SidebarTask[]>();
  for (const task of sortTasks(all, sort)) {
    const name = task.group ?? null;
    const rows = groups.get(name) ?? []; rows.push(task); groups.set(name, rows);
  }
  return {
    archivedCount,
    groups: [...groups].sort(([a], [b]) => a === null ? 1 : b === null ? -1 : a.localeCompare(b)).map(([name, rows]) => ({ name, tasks: rows })),
    view,
    sort,
    projects,
    chats: sortTasks(chatTasks, sort),
    flat: sortTasks(all, sort),
    total: all.length,
    loadedCount: all.filter((t) => t.loaded).length,
  };
}
