// v2 全局 store —— zustand 单店多切片。
// 纪律 D1：store 只是事件日志的投影；动作经 HostClient 写回后端，
//          状态经订阅回流，不在 UI 侧私造真相。
// 纪律 D3：连接瞬态=琥珀；断连不清数据（stale 保留最后已知舰队）。

import { create } from "zustand";
import { createTransport } from "./client";
import { HostClient } from "./host";
import type { LiveState, Task } from "./types";

export type ConnState = "connecting" | "connected" | "degraded";
export type Theme = "dark" | "light";

/** 历史栈导航目标（S3）。 */
export type NavTarget = { view: "home" } | { view: "task"; taskId: string };

const THEME_KEY = "grok-build.v2.theme";

interface AppState {
  // ---- conn 切片 ----
  conn: ConnState;
  backendKind: string;
  workspace: string;

  // ---- fleet 切片（断连时保留最后已知数据，stale=true 标记） ----
  tasks: Task[];
  stale: boolean;
  activeTaskId: string | null;

  // ---- live 切片（事件摄取投影） ----
  lives: Record<string, LiveState>;

  // ---- ui 切片 ----
  theme: Theme;
  sidebarVisible: boolean;
  railVisible: boolean;
  dockOpen: boolean;
  kanbanOpen: boolean;
  taskViewMode: "spine" | "lineage" | "contract";
  /** 契约默认（S9）：autonomy 旋钮 + 预算信封 */
  defaultAutonomy: "L1" | "L2" | "L3" | "L4";
  defaultBudget: string;
  paletteOpen: boolean;
  settingsOpen: boolean;

  // ---- nav 切片（历史栈，S3） ----
  nav: NavTarget[];
  navIdx: number;

  /** taskmeta 变更计数：localStorage 非响应式，用版本号驱动重渲染 */
  metaRev: number;

  // ---- 动作 ----
  navigate: (target: NavTarget) => void;
  goBack: () => void;
  goForward: () => void;
  openTask: (taskId: string) => void;
  bumpMeta: () => void;
  refreshFleet: () => void;
  toggleSidebar: () => void;
  toggleRail: () => void;
  toggleDock: () => void;
  toggleKanban: () => void;
  setTaskViewMode: (mode: "spine" | "lineage" | "contract") => void;
  setDefaultAutonomy: (lv: "L1" | "L2" | "L3" | "L4") => void;
  setDefaultBudget: (b: string) => void;
  setPaletteOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  toggleTheme: () => void;
}

export const useApp = create<AppState>()((set) => ({
  conn: "connecting",
  backendKind: "",
  workspace: "/",

  tasks: [],
  stale: false,
  activeTaskId: null,

  lives: {},

  theme: readTheme(),
  sidebarVisible: true,
  railVisible: false,
  dockOpen: false,
  kanbanOpen: false,
  taskViewMode: "spine",
  defaultAutonomy: readPref("grok-build.v2.autonomy", "L2") as "L1" | "L2" | "L3" | "L4",
  defaultBudget: readPref("grok-build.v2.budget", "不限"),
  paletteOpen: false,
  settingsOpen: false,

  nav: [{ view: "home" }],
  navIdx: 0,
  metaRev: 0,

  navigate: (target) =>
    set((s) => {
      const stack = [...s.nav.slice(0, s.navIdx + 1), target];
      return { nav: stack, navIdx: stack.length - 1 };
    }),
  goBack: () =>
    set((s) => {
      const navIdx = Math.max(0, s.navIdx - 1);
      const t = s.nav[navIdx];
      return { navIdx, activeTaskId: t.view === "task" ? t.taskId : null };
    }),
  goForward: () =>
    set((s) => {
      const navIdx = Math.min(s.nav.length - 1, s.navIdx + 1);
      const t = s.nav[navIdx];
      return { navIdx, activeTaskId: t.view === "task" ? t.taskId : null };
    }),
  // 注意：不在此 markSeen —— 已读语义归 digest（回来摘要）所有
  openTask: (taskId) => {
    set((s) => {
      const stack = [...s.nav.slice(0, s.navIdx + 1), { view: "task", taskId } as NavTarget];
      return {
        nav: stack,
        navIdx: stack.length - 1,
        activeTaskId: taskId,
        metaRev: s.metaRev + 1,
      };
    });
  },
  bumpMeta: () => set((s) => ({ metaRev: s.metaRev + 1 })),
  refreshFleet: () => void hydrate(),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleRail: () => set((s) => ({ railVisible: !s.railVisible })),
  toggleDock: () => set((s) => ({ dockOpen: !s.dockOpen })),
  toggleKanban: () => set((s) => ({ kanbanOpen: !s.kanbanOpen })),
  setTaskViewMode: (mode) => set({ taskViewMode: mode }),
  setDefaultAutonomy: (lv) => {
    persistPref("grok-build.v2.autonomy", lv);
    set({ defaultAutonomy: lv });
  },
  setDefaultBudget: (b) => {
    persistPref("grok-build.v2.budget", b);
    set({ defaultBudget: b });
  },
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  toggleTheme: () =>
    set((s) => {
      const theme: Theme = s.theme === "dark" ? "light" : "dark";
      persistTheme(theme);
      applyTheme(theme);
      return { theme };
    }),
}));

function readPref(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function persistPref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 非致命
  }
}

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // 非致命
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("light", theme === "light");
}

// ---------------------------------------------------------------------------
// bootstrap：创建传输 → 订阅事件 → 水合。main.tsx 调用一次。
// ---------------------------------------------------------------------------

let client: HostClient | null = null;

export function getClient(): HostClient {
  if (!client) throw new Error("store not bootstrapped");
  return client;
}

export function bootstrap(): void {
  applyTheme(useApp.getState().theme);

  const transport = createTransport();
  client = new HostClient(transport);
  useApp.setState({ backendKind: transport.kind });

  // 连通性 → conn 切片（琥珀降级，不清数据）
  client.subscribe("status", ({ connected }) => {
    if (connected) {
      useApp.setState({ conn: "connected", stale: false });
      void hydrate();
    } else {
      useApp.setState({ conn: "degraded", stale: true });
    }
  });

  // 流式更新 → live 切片
  client.subscribe("live", ({ sessionId, live }) => {
    useApp.setState((s) => {
      const lives = { ...s.lives };
      if (live) lives[sessionId] = live;
      else delete lives[sessionId];
      return { lives };
    });
  });

  // 落定 → 刷新舰队行状态
  client.subscribe("settled", ({ sessionId, status }) => {
    useApp.setState((s) => ({
      tasks: s.tasks.map((t) => (t.taskId === sessionId ? { ...t, status } : t)),
    }));
  });
}

/** 水合舰队（连接建立与恢复时）。失败保持降级态，不抛给 UI。 */
async function hydrate(): Promise<void> {
  const host = getClient();
  let workspace = useApp.getState().workspace;
  try {
    const settings = await host.getSettings();
    const ws = settings.recentProjects?.[0] ?? settings.lastWorkspaceSession?.[0]?.workspacePath;
    if (ws) workspace = ws;
  } catch {
    // 设置不可得：用默认工作区继续
  }
  try {
    const tasks = await host.getTasks(workspace);
    useApp.setState({ tasks, workspace, stale: false });
  } catch (error) {
    console.warn("[store] hydrate failed", error);
    useApp.setState({ conn: "degraded", stale: true });
  }
}
