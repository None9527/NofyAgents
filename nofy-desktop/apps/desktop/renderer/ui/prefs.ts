/**
 * 窗口局部偏好的持久化（布局开合；主题在 theme.ts）。
 *
 * 为什么住在 ui/ 而不是 features/：dep-guard 门规定 features 不准碰
 * window/document——组件必须是 store 的纯函数视图。布局/主题这类**窗口局部态**
 * 确实需要 localStorage，那就把「碰 window」集中到 ui/ 这一个允许区，
 * 与 theme.ts 同一先例。键名思路照 ZCode 的 persistentLayoutKey
 * （uiux-reference.md §1「布局引擎」行），但命名空间是我们自己的。
 */
const LAYOUT_KEY = "nofy-desktop:layout";

/**
 * 布局是**一个**窗口级状态（侧栏开合 + 辅助 pane 开合），一个键记整组——
 * 照 ZCode persistentLayoutKey 的思路（uiux-reference.md §1「布局引擎」行）。
 * 键数量不随面板数增长；值是可读的 "sidebar-open|aux-closed"，手改也行。
 *
 * 兼容：早期版本只写 "aux-open"/"aux-closed"，loadLayout 用 includes 判断，
 * 读旧值仍然正确（缺 sidebar 段 ⇒ 视为开）。
 */
/**
 * 侧栏宽度也进布局键：活壳 3.11.2 的侧栏是
 * `w-[var(--workspace-sidebar-panel-width)]`（实测解析 264px）+ 一条可拖分隔条
 * （CDP 取到 group/handle 1px、z-10）。宽度是用户调出来的布局事实，得记住。
 */
export type LayoutPrefs = {
  sidebarOpen: boolean;
  auxOpen: boolean;
  sidebarWidth: number;
  /**
   * 侧栏列表视图（活壳 tabs「分组 | 项目」）。字面量与 features/shell/sidebarModel.ts
   * 的 SidebarView 同形——ui/ 不反向 import features/（层次是 features → ui），
   * 两边靠结构类型对齐；改一边必须改另一边，test/prefs-layout.test.ts 盯着解码。
   */
  view: "grouped" | "projects";
  /** 排序键（活壳「筛选和排序」菜单里我们真能兑现的两条）。 */
  sort: "recent" | "title";
  /**
   * 项目视图工作区行的自定义拖拽顺序（活壳 SortableWorkspaceSidebarItem 的 dnd 排序同位）。
   * 存 key（cwd 或 "(none)"）数组；不在表里的新工作区按默认序追加在后。
   */
  projectOrder: string[];
  /** 右侧辅助面板宽（活壳实测 548）；拖拽左缘调宽，双击把手恢复默认。 */
  auxWidth: number;
  /** 终端 dock 高（默认 280 = 活壳 17.5rem）；拖拽顶缘调高，双击把手恢复默认。 */
  dockHeight: number;
  /**
   * 终端 dock 开合（生态面 #3）。与 auxOpen 同纪律：开合是用户调出来的布局事实，要记住。
   * 注意「关掉」只是收起——dock 组件保持挂载、pty 与其中的进程继续活着
   * （活壳同行为：面板收起时 .xterm 仍在 DOM 里，只是 0×0，CDP 实测）。
   */
  dockOpen: boolean;
};

/** 活壳实测值（docs/contract/zcode-live-metrics.json）；拖拽下限/上限见 shell CSS。 */
export const SIDEBAR_WIDTH_DEFAULT = 264;
export const SIDEBAR_WIDTH_MIN = 200;
export const SIDEBAR_WIDTH_MAX = 480;
export const AUX_WIDTH_DEFAULT = 548;
export const AUX_WIDTH_MIN = 320;
export const AUX_WIDTH_MAX = 760;
export const DOCK_HEIGHT_DEFAULT = 280;
export const DOCK_HEIGHT_MIN = 140;
export const DOCK_HEIGHT_MAX = 640;

export function loadLayout(): LayoutPrefs {
  return loadLayoutInner();
}

function parseProjectOrder(raw: string): string[] {
  const m = /(?:^|\|)po=([^|]*)/.exec(raw);
  if (m === null) return [];
  const seg = m[1];
  if (seg === undefined) return [];
  try {
    const v = JSON.parse(decodeURIComponent(seg)) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseDockHeight(raw: string): number {
  const m = /(?:^|\|)dh=(\d+)/.exec(raw);
  const seg = m === null ? null : m[1];
  if (seg === null || seg === undefined) return DOCK_HEIGHT_DEFAULT;
  const n = Number(seg);
  return Number.isFinite(n) ? Math.min(DOCK_HEIGHT_MAX, Math.max(DOCK_HEIGHT_MIN, n)) : DOCK_HEIGHT_DEFAULT;
}

function parseAuxWidth(raw: string): number {
  const m = /(?:^|\|)a=(\d+)/.exec(raw);
  const seg = m === null ? null : m[1];
  if (seg === null || seg === undefined) return AUX_WIDTH_DEFAULT;
  const n = Number(seg);
  return Number.isFinite(n) ? Math.min(AUX_WIDTH_MAX, Math.max(AUX_WIDTH_MIN, n)) : AUX_WIDTH_DEFAULT;
}

function loadLayoutInner(): LayoutPrefs {
  const fallback: LayoutPrefs = {
    sidebarOpen: true,
    auxOpen: true,
    sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
    view: "projects",
    sort: "recent",
    dockOpen: false,
    projectOrder: [],
    auxWidth: AUX_WIDTH_DEFAULT,
    dockHeight: DOCK_HEIGHT_DEFAULT,
  };
  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY);
    if (raw === null) return fallback;
    const widthMatch = /w=(\d+)/.exec(raw);
    const width = widthMatch === null ? SIDEBAR_WIDTH_DEFAULT : Number(widthMatch[1]);
    return {
      sidebarOpen: !raw.includes("sidebar-closed"),
      auxOpen: !raw.includes("aux-closed"),
      sidebarWidth: Number.isFinite(width) ? Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, width)) : SIDEBAR_WIDTH_DEFAULT,
      // 旧值没有 v=/s= 段 ⇒ 落回默认（向后兼容：升级前的布局键照样能读）
      view: raw.includes("v=grouped") ? "grouped" : "projects",
      sort: raw.includes("s=title") ? "title" : "recent",
      // 旧值没有 dock 段 ⇒ 视为收起（升级前根本没有 dock，默认开会让老用户莫名其妙多一条）
      dockOpen: raw.includes("dock-open"),
      projectOrder: parseProjectOrder(raw),
      auxWidth: parseAuxWidth(raw),
      dockHeight: parseDockHeight(raw),
    };
  } catch {
    return fallback;
  }
}

export function saveLayout(layout: LayoutPrefs): void {
  /* po= 段 = encodeURIComponent(JSON.stringify(string[]))：cwd 可能含逗号/竖线，故整体编码。 */
  try {
    const value =
      (layout.sidebarOpen ? "sidebar-open" : "sidebar-closed") + "|" +
      (layout.auxOpen ? "aux-open" : "aux-closed") +
      "|w=" + String(Math.round(layout.sidebarWidth)) +
      "|v=" + layout.view +
      "|s=" + layout.sort +
      "|" + (layout.dockOpen ? "dock-open" : "dock-closed") +
      // 空序不写 po= 段：升级前的布局键保持逐字不变、仍可手读手改；缺段读回 []。
      (layout.projectOrder.length > 0 ? "|po=" + encodeURIComponent(JSON.stringify(layout.projectOrder)) : "");
    // 默认宽不写 a= 段：升级前的布局键保持逐字不变；缺段读回默认。
    const withAux =
      layout.auxWidth === AUX_WIDTH_DEFAULT ? value : value + "|a=" + String(Math.round(layout.auxWidth));
    const withDock =
      layout.dockHeight === DOCK_HEIGHT_DEFAULT ? withAux : withAux + "|dh=" + String(Math.round(layout.dockHeight));
    window.localStorage.setItem(LAYOUT_KEY, withDock);
  } catch {
    /* 隐私模式/配额满：记不住不影响使用 */
  }
}
/* ═══════════════ ⌘K 面板的搜索历史 ═══════════════
 * 存储键抄 ZCode 的命名法（:1027 zcode-command-center-search-history:<workspaceKey>），
 * 命名空间换成我们自己的；上限 20 条由 palette.ts 的 recordHistory 保证（纯函数可测），
 * 这里只管读写与**解码失败即空**——历史是便利品，坏了不该让面板打不开。
 */
const HISTORY_KEY = "nofy-desktop:palette-history";

export type StoredHistory = Array<{ query: string; scope: string; at: number }>;

export function loadPaletteHistory(): StoredHistory {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: StoredHistory = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      if (typeof o["query"] !== "string" || typeof o["scope"] !== "string") continue;
      out.push({ query: o["query"], scope: o["scope"], at: typeof o["at"] === "number" ? o["at"] : 0 });
    }
    return out;
  } catch {
    return [];
  }
}

export function savePaletteHistory(entries: StoredHistory): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* 同上：记不住不影响使用 */
  }
}

export function clearPaletteHistory(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* 忽略 */
  }
}
