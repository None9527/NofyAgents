/**
 * 侧栏列表的**纯模型**：把「已加载会话 + roster 里的全部会话」折成两种视图。
 *
 * ## 解剖来源（活壳 3.11.2，CDP 实测；docs/contract/zcode-live-metrics.md §1.2）
 *
 * | 活壳的东西 | 实测 | 我们的落点 |
 * |---|---|---|
 * | tabs「分组 / 项目」 | 55×24、滑动胶囊、aria-selected | SidebarView 两态 grouped / projects |
 * | 分组视图 | 扁平行 group/task-row h-7（外框 248×32 + py-px），标题 flex-1 truncate + 时间芯片 ml-auto，按最近变更排序；「定时任务」是内嵌分区（hash 图标 + 计数徽标） | flat[]（定时任务分区随自动化面落地后再加，先不放假分区） |
 * | 项目视图 | 项目行 248×32（house / folder / cloud 图标 + 名 truncate），展开后嵌套 li.group/task-item | projects[]（kind = home / folder / none） |
 * | 时间芯片文案 | 「57分」「1小时」「6天」 | formatCompactRelative（palette.ts） |
 *
 * 两处刻意差别（都有据，不是偷懒）：
 *  1. 图标只用 house / folder：house 标**本窗口工作区**（boot.cwd），folder 标其他。
 *     活壳的 cloud 是云端项目；roster 实测有 origin 键，但本机内核没给云端会话，
 *     等真有云端来源再加分支——先画一个永远不出现的图标是装饰。
 *  2. 「定时任务」内嵌分区暂缺：自动化面未接线（生态面 #6），空分区比灰按钮更失信。
 *
 * 纯函数：不碰 DOM、不认识线路名。输入是 ⌘K 已经在用的 PaletteSession[]
 * （那份数组由 App 从 store 折出来），所以侧栏与 ⌘K 的「会话」范围永远一致。
 */
import { formatCompactRelative, sessionTitle, workspaceLabel } from "./palette.ts";
import type { PaletteSession } from "./palette.ts";

/** 侧栏两种列表视图（活壳 tabs 的「分组」「项目」）。 */
export type SidebarView = "grouped" | "projects";

/** 排序键（活壳「筛选和排序」菜单里我们真能兑现的两条）。 */
export type SidebarSort = "recent" | "title";

export type SidebarTask = {
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
};

export type SidebarProject = {
  key: string;
  cwd: string | null;
  /** 末段名（无 cwd → 「（无工作区）」）。 */
  label: string;
  /** home = 本窗口工作区（活壳画 house 的那一行）；folder = 其他；none = 无 cwd。 */
  kind: "home" | "folder" | "none";
  tasks: SidebarTask[];
  /** 组内最近的变更时间（项目视图按它排序）；全组都没有则 null。 */
  latest: number | null;
};

export type SidebarModel = {
  view: SidebarView;
  sort: SidebarSort;
  /** 项目视图用。 */
  projects: SidebarProject[];
  /** 分组视图用（全部任务，已按 sort 排好）。 */
  flat: SidebarTask[];
  total: number;
  loadedCount: number;
};

export type SidebarInput = {
  sessions: PaletteSession[];
  view: SidebarView;
  sort: SidebarSort;
  now: number;
  /** 本窗口工作区（boot.cwd）。决定哪一行画 house。 */
  homeCwd: string | null;
  /** 工作区行自定义拖拽顺序（LayoutPrefs.projectOrder）；缺省/空 = 默认序。 */
  projectOrder?: string[];
};

/**
 * 排序：recent = at 降序、**null 一律沉底**（没有时间戳的项参与排序只会乱跳）；
 * title = 标题 localeCompare（zh collator），同标题再按 at 降序稳定化。
 */
export function sortTasks(tasks: SidebarTask[], sort: SidebarSort): SidebarTask[] {
  const out = [...tasks];
  if (sort === "title") {
    out.sort((a, b) => {
      const c = a.title.localeCompare(b.title, "zh-Hans-CN");
      if (c !== 0) return c;
      return (b.at ?? -1) - (a.at ?? -1);
    });
    return out;
  }
  out.sort((a, b) => (b.at ?? -1) - (a.at ?? -1));
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

export function buildSidebarModel(input: SidebarInput): SidebarModel {
  const { sessions, view, sort, now, homeCwd } = input;
  const tasks = new Map<string, SidebarTask>();
  for (const s of sessions) tasks.set(s.key, {
    key: s.key,
    sessionId: s.sessionId,
    title: sessionTitle(s.title),
    activity: s.activity,
    loaded: s.loaded,
    active: s.active,
    at: s.at,
    time: formatCompactRelative(s.at, now),
  });

  const byCwd = new Map<string, { cwd: string | null; items: SidebarTask[] }>();
  for (const s of sessions) {
    const key = s.cwd ?? "";
    const bucket = byCwd.get(key) ?? { cwd: s.cwd, items: [] };
    const task = tasks.get(s.key);
    if (task !== undefined) bucket.items.push(task);
    byCwd.set(key, bucket);
  }

  const projects: SidebarProject[] = [];
  for (const [key, bucket] of byCwd) {
    const sorted = sortTasks(bucket.items, sort);
    let latest: number | null = null;
    for (const t of sorted) if (t.at !== null && (latest === null || t.at > latest)) latest = t.at;
    projects.push({
      key: key.length === 0 ? "(none)" : key,
      cwd: bucket.cwd,
      label: workspaceLabel(bucket.cwd) ?? "（无工作区）",
      kind: bucket.cwd === null ? "none" : bucket.cwd === homeCwd ? "home" : "folder",
      tasks: sorted,
      latest,
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

  const all = [...tasks.values()];
  return {
    view,
    sort,
    projects,
    flat: sortTasks(all, sort),
    total: all.length,
    loadedCount: all.filter((t) => t.loaded).length,
  };
}
