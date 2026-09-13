/**
 * App —— 壳的装配点。大布局按**活壳 3.11.2 的 CDP 实测**改正（uiux-reference.md §8、
 * docs/contract/zcode-live-metrics.md §1）：
 *
 *   侧栏（叠层按钮 + 动作区 + tabs + 列表 + 页脚）｜ 主列（h-1 拖拽条 + 对话卡片）
 *   卡片 = 卡片头（标题 / 路径胶囊 / 更多 ＋ 帮助 / 切换终端 / 展开·收起侧边面板）
 *        + 卡体（对话列 + 辅助 pane）
 *
 *   活壳**没有**全宽顶栏行，也**没有**整窗状态栏行：主题与设置住在侧栏页脚的齿轮里，
 *   连接与诊断量住在页脚的账号卡槽位（SidebarFoot）。卡片头右簇只有那三枚 28×28。
 *
 * 数据一律来自 store（useSyncExternalStore），出站一律走 runtime.effect。
 * 组件不认识线路形状：读协议字段只发生在 core/ 与 ui/readers.ts。
 *
 * ## 启动序列
 *
 *   bootstrap()（拿 cwd）→ 等 connection.status === "ready" → session/new
 *
 * 用 ref 守卫成「只发生一次」：本文件刻意**不套 StrictMode**——它会把挂载 effect
 * 跑两遍，而这里的 effect 会真的向内核发 session/new，双跑就是双会话。
 *
 * ## UI 局部态 vs store
 *
 * 侧栏/辅助 pane 开合、侧栏视图与排序、导航历史、主题、输入草稿是**窗口局部态**，
 * 不进 store（store 是内核投影的真相，混入局部态会污染回放门与跨窗语义）。
 * 布局持久化键 nofy-desktop:layout，思路照 ZCode 的 persistentLayoutKey
 * （uiux-reference.md §1「布局引擎」行）。
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { BootstrapInfo } from "../../../preload/contract.ts";
import type { AppState } from "../../core/store/state.ts";
import { interactionKind } from "../../core/interactions.ts";
import { useHotkeys } from "../../ui/hotkeys.ts";
import type { HotkeyMap } from "../../ui/hotkeys.ts";
import {
  readCommands,
  readContext,
  readFuzzyMatches,
  readGitStatus,
  readModelOptions,
  readOptions,
  readSearchId,
} from "../../ui/readers.ts";
import type { FuzzyMatch } from "../../ui/readers.ts";
import type { AttachItem } from "../conversation/attachModel.ts";
import type { PermId } from "../conversation/permModel.ts";
import { currentPermId, permAction } from "../conversation/permModel.ts";
import type { CommandInfo, ContextInfo } from "../../ui/readers.ts";
import type { GitStatus } from "../../ui/readers.ts";
import {
  AUX_WIDTH_DEFAULT,
  AUX_WIDTH_MAX,
  AUX_WIDTH_MIN,
  loadLayout,
  saveLayout,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from "../../ui/prefs.ts";
import type { LayoutPrefs } from "../../ui/prefs.ts";
import { applyTheme, loadTheme, saveTheme } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
import { appendUsageLedger, dayKey, loadUsageLedger } from "../../ui/usageLedger.ts";
import type { UsageEntry } from "../../ui/usageLedger.ts";
import { THEMES } from "../../ui/theme.ts";
import { setDocTitle } from "../../ui/doctitle.ts";
import { ApprovalCard, optionViews } from "../approvals/ApprovalCard.tsx";
import type { ApprovalHandlers } from "../approvals/ApprovalCard.tsx";
import { Composer } from "../conversation/Composer.tsx";
import { DiffChip } from "../conversation/DiffChip.tsx";
import { QueueStrip } from "../conversation/QueueStrip.tsx";
import { Spine } from "../conversation/Spine.tsx";
import { AuxPane } from "./AuxPane.tsx";
import type { AuxTab } from "./AuxPane.tsx";
import { agentBlocks, agentSummary, runningAgentRows } from "../conversation/agentModel.ts";
import type { AgentRow } from "../conversation/agentModel.ts";
import { AgentChip } from "../conversation/AgentChip.tsx";
import { CardHeader } from "./CardHeader.tsx";
import { CommandPalette } from "./CommandPalette.tsx";
import { navCanStep, navCurrent, navEmpty, navPush, navStep } from "./navhistory.ts";
import type { NavHistory } from "./navhistory.ts";
import { stepIndex } from "./palette.ts";
import type { PaletteAction, PaletteSession } from "./palette.ts";
import { buildSidebarModel } from "./sidebarModel.ts";
import type { SidebarSort, SidebarTask, SidebarView } from "./sidebarModel.ts";
import { Sidebar } from "./Sidebar.tsx";
import { SettingsSurface } from "../settings/SettingsSurface.tsx";
import type { SettingsSectionId } from "../settings/settingsModel.ts";
import { TerminalDock } from "./TerminalDock.tsx";
import type { Runtime } from "../../core/runtime.ts";

type Pending = AppState["pendingInteractions"] extends Array<infer T> ? T : never;

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function App({ runtime }: { runtime: Runtime }) {
  const state = useSyncExternalStore(runtime.store.subscribe, runtime.store.getState);
  const [boot, setBoot] = useState<BootstrapInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>(() => loadTheme());
  /** 设置面（阶段 C UI 批）：null = 工作区壳；非 null = 设置面停在该分区。
   *  窗口局部态（与侧栏开合同纪律），不进 store。 */
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId | null>(null);
  /** 本机用量账本（#7）：turn_completed.usage 投影变化时追加去重条目。 */
  const [usageEntries, setUsageEntries] = useState<UsageEntry[]>(() => loadUsageLedger());
  /** 布局（侧栏 + 辅助 pane 开合）：窗口局部态，一个键持久化（ui/prefs.ts）。 */
  const [layout, setLayout] = useState<LayoutPrefs>(() => loadLayout());
  /** 侧栏分隔条拖拽起点（features 不碰 window/document，走元素级 pointer 捕获）。 */
  const dragFrom = useRef<{ x: number; w: number } | null>(null);
  /** 右侧面板左缘把手拖拽起点（同纪律）。 */
  const auxDragFrom = useRef<{ x: number; w: number } | null>(null);
  /**
   * 视图导航历史（侧栏叠层的后退/前进）：记的是**会话激活序列**。
   * 与 ⌘⇧[ / ⌘⇧] 的环形切换分工不同——那是「在已加载集合里走一步」，
   * 这是「回到我刚才看过的那一个」（可跨加载状态）。
   */
  const [nav, setNav] = useState<NavHistory>(navEmpty);
  /** 后退/前进引发的激活不再入栈（否则一次后退就把前进分支冲掉了）。 */
  const navLock = useRef(false);
  /** 相对时间芯片的时钟：30s 一跳——够让「57分」保持诚实，又不至于每秒重排列表。 */
  const [now, setNow] = useState(() => Date.now());
  /** ⌘K 命令中心开合。 */
  const [paletteOpen, setPaletteOpen] = useState(false);
  /**
   * 辅助 pane 的开合标签与选中标签（窗口局部态；⌘K 面板命令要能切它）。
   * 零标签 = 首屏（活壳 3.11.2 的「打开标签页」引导页，zcode-live-metrics.md §1.8）。
   */
  const [auxTabState, setAuxTabState] = useState<{ tabs: AuxTab[]; active: AuxTab | null }>({ tabs: [], active: null });
  const openAuxTab = useCallback((t: AuxTab) => {
    setLayout((l) => ({ ...l, auxOpen: true }));
    setAuxTabState((s) => ({ tabs: s.tabs.includes(t) ? s.tabs : [...s.tabs, t], active: t }));
  }, []);
  const activateAuxTab = useCallback((t: AuxTab) => {
    setAuxTabState((s) => (s.tabs.includes(t) ? { ...s, active: t } : { tabs: [...s.tabs, t], active: t }));
  }, []);
  const closeAuxTab = useCallback((t: AuxTab) => {
    setAuxTabState((s) => {
      const idx = s.tabs.indexOf(t);
      const tabs = s.tabs.filter((x) => x !== t);
      // 关掉选中的那个时，选中权交给它右边/左边的邻居；全关光就回首屏。
      const active = s.active === t ? (tabs[Math.min(Math.max(idx, 0), tabs.length - 1)] ?? null) : s.active;
      return { tabs, active };
    });
  }, []);
  /** 脊柱块「在右侧打开」：目录 tab + 定位行展开。 */
  const [agentFocus, setAgentFocus] = useState<string | null>(null);
  const openAgent = useCallback(
    (id: string) => {
      setAgentFocus(id);
      openAuxTab("agents");
    },
    [openAuxTab],
  );
  const [newBusy, setNewBusy] = useState(false);
  /** composer 草稿：窗口局部态（空态建议芯片要能填进来），不进 store。 */
  const [draft, setDraft] = useState("");
  /** 聚焦令牌：⌘K 选中内核命令后把焦点交回 composer（见 Composer.focusToken）。 */
  const [focusToken, setFocusToken] = useState(0);
  /** 上下文用量（_nofy/session/info 轮询，实测读路径）；窗口局部态。 */
  const [ctx, setCtx] = useState<ContextInfo | null>(null);
  /**
   * git/status（审查面 + 汇总条，生态面 #4）。与 ctx 同纪律：App 轮询持有、
   * 传给 AuxPane 与 DiffChip——同一份数据不重复请求。15s 一跳：git 状态变化
   * 频率远低于对话流，快了是浪费内核。
   */
  const [git, setGit] = useState<GitStatus | null>(null);
  const [gitBusy, setGitBusy] = useState(false);
  const bootStarted = useRef(false);
  const creating = useRef(false);
  /**
   * 终端 dock 的挂载闸：**开过一次就一直挂着**（收起只是 display:none）。
   * 活壳同行为——CDP 实测面板收起时 .xterm 仍在 DOM 里，只是 0×0。
   * 若收起就卸载，用户跑在里面的 dev server 会被连带杀掉（我们的卸载不 kill pty，
   * 但 xterm 的 scrollback 会没，重开就是空白屏）。持久化里是开的 ⇒ 首屏就挂。
   */
  const [dockMounted, setDockMounted] = useState<boolean>(() => loadLayout().dockOpen);
  /** 侧栏拖拽的起点（pointer capture 在分隔条元素上，不碰 window——dep-guard）。 */

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;
    runtime.bootstrap().then(setBoot, (e: unknown) => setError("bootstrap 失败：" + msg(e)));
  }, [runtime]);

  const active = state.activeSessionId === null ? null : state.sessions[state.activeSessionId] ?? null;
  /** 子智能体目录行：活动会话的 task 块 + roster 活动态 join（子会话 id = subagent_id）。 */
  const agentRows = useMemo<AgentRow[]>(
    () =>
      agentBlocks(active).map((a) => ({
        ...a,
        activity: a.subagentId !== null ? (state.roster[a.subagentId]?.activity ?? null) : null,
      })),
    [active, state.roster],
  );
  /**
   * 胶囊源 = 所有 running 的子智能体（活壳 2026-09-11 实机：回合内也显示，结束即消失）。
   * 右上 AgentChip 与 composer .bgworks 都只由这份计数驱动。
   */
  const backgroundAgents = useMemo(() => runningAgentRows(agentRows), [agentRows]);
  const ready = state.connection.status === "ready";
  const auxOpen = layout.auxOpen;

  // 会话标题去窗口标题（顶栏单行不放标题：度量抄录 pass 的裁定，ui/doctitle.ts）
  const docTitle = active?.title ?? null;
  useEffect(() => {
    setDocTitle(docTitle === null ? "Nofy" : docTitle + " · Nofy");
  }, [docTitle]);

  // 内核就绪且还没有会话 ⇒ 开一个。ref 守卫，避免 ready 抖动时重复开。
  useEffect(() => {
    if (boot === null || !ready || state.activeSessionId !== null || creating.current) return;
    creating.current = true;
    void runtime.effect({ kind: "session/new", cwd: boot.cwd }).then((r) => {
      creating.current = false;
      if (!r.ok) setError("session/new 失败：" + r.error);
    });
  }, [boot, ready, state.activeSessionId, runtime]);

  // 用量轮询：6s 一次，够看趋势又不至于压内核；读不到就 null（用量条不渲染）。
  const activeId = state.activeSessionId;

  const refreshGit = useCallback(() => {
    if (activeId === null) {
      setGit(null);
      return;
    }
    setGitBusy(true);
    void runtime.effect({ kind: "git/status", sessionId: activeId }).then((r) => {
      setGitBusy(false);
      // 非 git 工作区内核回空形状（staged/unstaged 都空），readGitStatus 给空集合 ⇒ chip 不渲染
      setGit(r.ok ? readGitStatus(r.value) : null);
    });
  }, [activeId, runtime]);

  useEffect(() => {
    if (!ready || activeId === null) {
      setGit(null);
      return;
    }
    refreshGit();
    const t = setInterval(refreshGit, 15_000);
    return () => clearInterval(t);
  }, [ready, activeId, refreshGit]);

  useEffect(() => {
    if (!ready || activeId === null) {
      setCtx(null);
      return;
    }
    let stopped = false;
    const tick = (): void => {
      void runtime.effect({ kind: "session/info", sessionId: activeId }).then((r) => {
        if (stopped) return;
        setCtx(r.ok ? readContext(r.value) : null);
      });
    };
    tick();
    const t = setInterval(tick, 6000);
    // 冷启动拉一次 roster：sessions/changed 只在变更时推，首屏侧栏/权限芯片不能等推送。
    void runtime.effect({ kind: "roster/pull" });
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [ready, activeId, runtime]);

  const newSession = useCallback(() => {
    if (boot === null || newBusy) return;
    setNewBusy(true);
    void runtime.effect({ kind: "session/new", cwd: boot.cwd }).then((r) => {
      setNewBusy(false);
      if (!r.ok) setError("session/new 失败：" + r.error);
    });
  }, [boot, newBusy, runtime]);

  const send = useCallback(
    (text: string, attach: AttachItem[]) => {
      if (active === null) {
        setError("会话尚未就绪");
        return;
      }
      setError(null);
      void runtime
        .effect({
          kind: "session/prompt",
          sessionId: active.id,
          text,
          attach: attach.map((a) => ({ path: a.path, name: a.name })),
        })
        .then((r) => {
        if (!r.ok) setError("prompt 失败：" + r.error);
      });
    },
    [active, runtime],
  );

  /** 「添加附件」：系统选文件框 → 芯片。取消＝[] 静默。宿主能力，不经内核。 */
  const pickAttachFiles = useCallback(async (): Promise<AttachItem[]> => {
    const files = await runtime.pickFiles();
    return files.map((f) => ({ path: f.path, name: f.name, kind: "file" as const }));
  }, [runtime]);

  /* ═══════════ 「+ 添加上下文」的 fuzzy 搜索生命周期 ═══════════
     open 拿 searchId → change 推查询 → 结果走 _nofy/search/fuzzy/status 通知进 store.search
     （project.ts 已按 generation 丢弃乱序批）→ close 收尾。形状全实测（ecosystem-shapes.json）。 */
  const [attachSearchId, setAttachSearchId] = useState<string | null>(null);
  const attachCwd = active?.cwd ?? boot?.cwd ?? null;
  const openAttachSearch = useCallback(() => {
    if (attachSearchId !== null || attachCwd === null) return;
    void runtime
      .effect({ kind: "search/fuzzyOpen", sessionId: active?.id ?? null, cwd: attachCwd })
      .then((r) => {
        if (!r.ok) return;
        const sid = readSearchId(r.value);
        if (sid === null) return;
        setAttachSearchId(sid);
        void runtime.effect({ kind: "search/fuzzyChange", searchId: sid, query: "" });
      });
  }, [attachSearchId, attachCwd, active, runtime]);
  const closeAttachSearch = useCallback(() => {
    if (attachSearchId !== null) {
      void runtime.effect({ kind: "search/fuzzyClose", searchId: attachSearchId });
    }
    setAttachSearchId(null);
  }, [attachSearchId, runtime]);
  const queryAttachSearch = useCallback(
    (query: string) => {
      if (attachSearchId === null) return;
      void runtime.effect({ kind: "search/fuzzyChange", searchId: attachSearchId, query });
    },
    [attachSearchId, runtime],
  );
  const attachMatches = useMemo<FuzzyMatch[]>(
    () =>
      state.search !== null && state.search.searchId === attachSearchId
        ? readFuzzyMatches(state.search.matches)
        : [],
    [state.search, attachSearchId],
  );
  // 切会话时旧 searchId 作废：关掉搜索，避免把上一个工作区的命中挂到新会话上。
  useEffect(() => {
    closeAttachSearch();
    // 只跟会话走；closeAttachSearch 的身份变化不该重触发（它内部已按当前 id 幂等）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const stop = useCallback(() => {
    if (active === null) return;
    void runtime.effect({ kind: "session/cancel", sessionId: active.id }).then((r) => {
      if (!r.ok) setError("cancel 失败：" + r.error);
    });
  }, [active, runtime]);

  /* ═══════════ 窗口级动作（⌘K、卡片头、侧栏共用同一批回调） ═══════════ */

  /**
   * 权限模式当前档：三源合成（roster.yolo / settings auto / 会话 mode）。
   * 读回全靠内核推送，不在本地乐观置位——切了没生效就照实显示没生效。
   */
  const permCurrent: PermId | null =
    active === null
      ? null
      : currentPermId({
          yolo: state.roster[active.id]?.yolo === true,
          auto: readAutoPermissionEnabled(state.settings),
          mode: active.mode,
        });
  const onPerm = useCallback(
    (id: PermId) => {
      if (active === null) return;
      setError(null);
      const act = permAction(id);
      if (act.modeId !== null) {
        void runtime
          .effect({ kind: "session/setMode", sessionId: active.id, modeId: act.modeId })
          .then((r) => {
            if (!r.ok) setError("切换会话模式失败：" + r.error);
          });
      }
      void runtime.effect({ kind: "perm/notify", params: act.notify }).then((r) => {
        if (!r.ok) setError("切换权限模式失败：" + r.error);
        else void runtime.effect({ kind: "roster/pull" });
      });
    },
    [active, runtime],
  );

  const toggleSidebar = useCallback(() => setLayout((l) => ({ ...l, sidebarOpen: !l.sidebarOpen })), []);
  const toggleAux = useCallback(() => setLayout((l) => ({ ...l, auxOpen: !l.auxOpen })), []);
  const toggleTerminal = useCallback(() => {
    setDockMounted(true);
    setLayout((l) => ({ ...l, dockOpen: !l.dockOpen }));
  }, []);
  const openTerminal = useCallback(() => {
    setDockMounted(true);
    setLayout((l) => ({ ...l, dockOpen: true }));
  }, []);
  const closeTerminal = useCallback(() => setLayout((l) => ({ ...l, dockOpen: false })), []);
  /** 侧栏 tabs「分组 | 项目」与「筛选和排序」：都是布局事实，进同一个持久化键。 */
  const setView = useCallback((view: SidebarView) => setLayout((l) => ({ ...l, view })), []);
  const setSort = useCallback((sort: SidebarSort) => setLayout((l) => ({ ...l, sort })), []);
  /** 侧栏工作区行拖拽排序：把全量 key 序写回布局偏好（活壳 dnd 排序的持久化同位）。 */
  const reorderProjects = useCallback((projectOrder: string[]) => setLayout((l) => ({ ...l, projectOrder })), []);

  /** ⌘⇧[ / ⌘⇧]：在已加载会话之间环形切换（ZCode 同键位，QuickPick.tsx:3039-3050）。 */
  const sessionIds = useMemo(() => Object.keys(state.sessions).sort(), [state.sessions]);
  const cycleSession = useCallback(
    (delta: number) => {
      if (sessionIds.length < 2) return;
      const at = state.activeSessionId === null ? 0 : Math.max(0, sessionIds.indexOf(state.activeSessionId));
      const next = sessionIds[stepIndex(sessionIds.length, at, delta)];
      if (next !== undefined) runtime.store.dispatch({ type: "session/activated", sessionId: next });
    },
    [runtime, sessionIds, state.activeSessionId],
  );

  /**
   * 激活会话：侧栏任务行、⌘K 会话项、后退/前进**共用这一条路径**。
   * 已加载 ⇒ 直接激活；未加载 ⇒ session/load。
   * 〔实测〕roster 的 upserted[i] 带 cwd（golden-permission.jsonl），而 cwd 正是
   * session/load 的必需参数 ⇒ **冷启动载入历史会话可以由界面直接发起**（P1）。
   * 标题从 load 响应的 _meta["nofy/sessionDetail"].title 来（effects.ts 已接）。
   */
  const activateSession = useCallback(
    (sessionId: string) => {
      if (state.sessions[sessionId] !== undefined) {
        runtime.store.dispatch({ type: "session/activated", sessionId });
        return;
      }
      const cwd = state.roster[sessionId]?.cwd ?? null;
      if (cwd === null) {
        setError("该会话的 roster 条目没有 cwd，无法 session/load（形状见 session-read-shapes.md）");
        return;
      }
      void runtime.effect({ kind: "session/load", sessionId, cwd }).then((r) => {
        if (!r.ok) {
          setError("session/load 失败：" + r.error);
          return;
        }
        runtime.store.dispatch({ type: "session/activated", sessionId });
      });
    },
    [runtime, state.roster, state.sessions],
  );

  // 激活序列入栈（后退/前进的数据源）。navLock 让「由后退/前进引发的激活」不再入栈。
  useEffect(() => {
    const id = state.activeSessionId;
    if (id === null) return;
    if (navLock.current) {
      navLock.current = false;
      return;
    }
    setNav((h) => navPush(h, id));
  }, [state.activeSessionId]);

  const stepNav = useCallback(
    (delta: number) => {
      const next = navStep(nav, delta);
      if (next === nav) return;
      const target = navCurrent(next);
      if (target === null) return;
      navLock.current = true;
      setNav(next);
      activateSession(target);
    },
    [activateSession, nav],
  );

  /** 内核命令是 slash 命令：选中＝把 "/name " 填进草稿并把焦点交回 composer。 */
  const pickCommand = useCallback((name: string) => {
    setDraft("/" + name + " ");
    setFocusToken((n) => n + 1);
  }, []);

  const handlers: ApprovalHandlers = {
    chooseOption: (item: Pending, optionId: string) => {
      setError(null);
      void (async () => {
        const r = await runtime.effect({ kind: "permission/respond", id: item.id, optionId });
        if (!r.ok) {
          setError("应答失败：" + r.error);
          return;
        }
        // 实测：enable-always-approve 在线路上只是 allow_once，真开 YOLO 是**客户端职责**，
        // 须另发 _nofy/yolo_mode_changed（permission-flow-measured.md §3）。
        // 载荷四键逐字对齐 acp_agent.rs:1250-1305；内核按 clientIdentifier 匹配会话。
        if (optionId === "enable-always-approve") {
          const y = await runtime.effect({
            kind: "perm/notify",
            params: permAction("full").notify,
          });
          if (!y.ok) setError("已放行本次，但切换全放行失败：" + y.error);
        }
      })();
    },
    cancel: (item: Pending) => {
      setError(null);
      void runtime.effect({ kind: "interaction/cancel", id: item.id, method: item.method }).then((r) => {
        if (!r.ok) setError(r.error);
      });
    },
    trust: (item: Pending, trust: boolean) => {
      setError(null);
      void runtime.effect({ kind: "folderTrust/respond", id: item.id, trust }).then((r) => {
        if (!r.ok) setError("信任应答失败：" + r.error);
      });
    },
    answer: (item: Pending, payload: Record<string, unknown>) => {
      setError(null);
      void runtime.effect({ kind: "interaction/answer", id: item.id, payload }).then((r) => {
        if (!r.ok) setError("问答应答失败：" + r.error);
      });
    },
  };

  const running = active?.agentState === "turn-running" || active?.agentState === "turn-cancelling";
  const models = readModelOptions(active?.modelOptions ?? []);

  /* ═══════════ ⌘K 与侧栏共用的数据 ═══════════ */

  /**
   * 内核命令表：优先活跃会话的 availableCommands（实测 available_commands_update
   * 给 167 条），退回 initialize 的 7 条。形状 {name, description, input.hint}。
   */
  /**
   * 内核命令表（available_commands_update 实测 167 条；技能带 _meta.scope，内置命令不带）。
   * ⌘K 与 composer 斜杠面板共用这一份读结果——命令来源是内核，不是本地注册表。
   */
  const kernelCommands = useMemo<CommandInfo[]>(
    () => readCommands(active?.availableCommands ?? state.connection.initialCommands),
    [active, state.connection.initialCommands],
  );

  /**
   * 已知会话全集 = 已加载会话 + roster 里未加载的（后者点击走 session/load）。
   * **⌘K 的「会话」范围与侧栏列表共用这一份**：两处对同一批会话给出不同答案，
   * 是「界面自相矛盾」最常见的一种，所以数据源只折一次。
   */
  const knownSessions = useMemo<PaletteSession[]>(() => {
    const out: PaletteSession[] = [];
    for (const s of Object.values(state.sessions)) {
      const r = state.roster[s.id];
      out.push({
        key: s.id,
        sessionId: s.id,
        title: s.title ?? r?.title ?? null,
        activity: r?.activity ?? null,
        loaded: true,
        active: s.id === state.activeSessionId,
        cwd: s.cwd ?? r?.cwd ?? null,
        at: r?.lastChangeUnixMs ?? null,
      });
    }
    for (const r of Object.values(state.roster)) {
      if (state.sessions[r.sessionId] !== undefined) continue;
      out.push({
        key: "roster:" + r.sessionId,
        sessionId: r.sessionId,
        title: r.title,
        activity: r.activity,
        loaded: false,
        active: false,
        cwd: r.cwd,
        at: r.lastChangeUnixMs,
      });
    }
    return out;
  }, [state.activeSessionId, state.roster, state.sessions]);

  /**
   * 侧栏列表模型（纯函数，sidebarModel.ts）。now 是 30s 一跳的时钟，
   * 只影响相对时间芯片；homeCwd 决定哪一行画 house（活壳用 house 标本机主目录项目）。
   */
  const sidebarModel = useMemo(
    () =>
      buildSidebarModel({
        sessions: knownSessions,
        view: layout.view,
        sort: layout.sort,
        now,
        homeCwd: boot?.cwd ?? null,
        projectOrder: layout.projectOrder,
      }),
    [boot, knownSessions, layout.sort, layout.view, layout.projectOrder, now],
  );

  /**
   * 窗口动作。段序与关键词抄 ZCode buildQuickPickCommands（QuickPick.tsx:665-830），
   * 但**只放真能跑的**；未接线的显式 disabled + 写明实测状态与排期
   * （uiux-reference.md §1：灰按钮比假按钮诚实，空菜单项最失信）。
   */
  const paletteActions = useMemo<PaletteAction[]>(() => {
    // 四个主题（dark/light/zai-dark/zai-light）循环，标题写明**目标**主题
    const at = THEMES.findIndex((t) => t.id === theme);
    const next = THEMES[(at + 1) % THEMES.length] ?? THEMES[0]!;
    return [
      {
        id: "new-session", section: "suggested", title: "新建会话", icon: "plus", shortcut: "⌘N",
        keywords: ["new", "session", "task", "新建", "新任务", "会话"], run: newSession,
      },
      {
        id: "open-workspace", section: "suggested", title: "打开工作区…", icon: "folder", shortcut: "⌘O",
        keywords: ["open", "workspace", "folder", "project", "打开", "文件夹", "项目"],
        disabled: true, note: "未接线：需要 main 侧目录选择器（IPC 第 10 通道）",
      },
      {
        id: "toggle-sidebar", section: "panels", title: layout.sidebarOpen ? "收起侧栏" : "展开侧栏",
        icon: "panel", shortcut: "⌘B", keywords: ["sidebar", "侧栏", "侧边栏", "切换侧栏"], run: toggleSidebar,
      },
      {
        id: "toggle-aux", section: "panels", title: auxOpen ? "收起侧边面板" : "展开侧边面板",
        icon: "panel", shortcut: "⌘⌥B",
        keywords: ["pane", "panel", "aux", "辅助", "右栏", "侧边面板"], run: toggleAux,
      },
      {
        id: "files-pane", section: "panels", title: "文件面板", icon: "file",
        keywords: ["files", "tree", "viewer", "文件", "目录树", "代码查看"],
        run: () => openAuxTab("files"),
      },
      {
        id: "review-pane", section: "panels", title: "审查面板", icon: "edit",
        keywords: ["git", "diff", "review", "changes", "审查", "变更"],
        run: () => openAuxTab("review"),
      },
      {
        id: "terminal-pane", section: "panels",
        title: layout.dockOpen ? "收起终端面板" : "展开终端面板", icon: "terminal", shortcut: "⌘J",
        keywords: ["terminal", "shell", "console", "pty", "终端"],
        // ⌘J 是**我们自己**的绑定（活壳的终端开关键位未实测，不冒充抄来的）；
        // hotkeys-help.ts 与 App 的 hotkeyMap 由 test/hotkeys-help.test.ts 双向对账。
        run: toggleTerminal,
      },
      {
        id: "switch-theme", section: "configure", title: "切换到「" + next.label + "」主题", icon: "palette",
        keywords: ["theme", "dark", "light", "主题", "深色", "浅色"], run: () => setTheme(next.id),
      },
      {
        id: "settings", section: "configure", title: "设置…", icon: "gear",
        keywords: ["settings", "preferences", "配置", "设置"],
        disabled: true, note: "P6：分组词汇沿用活壳；config 读写路径待录",
      },
      {
        id: "ecosystem", section: "configure", title: "技能 / 插件 / 市场…", icon: "boxes",
        keywords: ["skills", "plugins", "marketplace", "技能", "插件", "市场"],
        disabled: true, note: "生态面 #5：skills/list(155) plugins/list marketplace/list(292) 已实测，待接",
      },
      {
        id: "mcp", section: "configure", title: "MCP 服务器…", icon: "boxes",
        keywords: ["mcp", "server", "servers", "服务器"],
        disabled: true, note: "生态面 #5：mcp/list 已实测（servers + tools + status），待接",
      },
      {
        id: "permission-mode", section: "configure", title: "权限模式…", icon: "shield",
        keywords: ["permission", "mode", "yolo", "权限", "模式"],
        disabled: true, note: "生效模式的线路来源未实测（composer 占位芯片同理）",
      },
      {
        id: "usage", section: "app", title: "用量明细…", icon: "clock",
        keywords: ["usage", "tokens", "stats", "用量", "统计"],
        disabled: true, note: "生态面 #7：session/usage 已实测（9 个量），待接",
      },
    ];
    // 依赖里只列 theme：next 是在回调内部由 theme 推出来的（写进依赖数组会出作用域）
  }, [auxOpen, layout.dockOpen, layout.sidebarOpen, newSession, openAuxTab, theme, toggleAux, toggleSidebar, toggleTerminal]);

  // 审批模态快捷键：1-9 选第 N 项、Esc 取消。只挂第一条待裁决，
  // 且输入框内按键忽略（ui/hotkeys.ts）——在 composer 打数字不能误触审批。
  const firstPending = state.pendingInteractions[0] ?? null;
  const hotkeyMap: HotkeyMap = {};
  if (firstPending !== null) {
    const pendingKind = interactionKind(firstPending.method);
    if (pendingKind === "permission") {
      // 数字键与屏幕行号同表（optionViews）；问答面不挂数字键（选中语义不是直确语义）。
      const opts = optionViews(readOptions(firstPending.params));
      for (const [i, o] of opts.slice(0, 9).entries()) {
        hotkeyMap[String(i + 1)] = () => handlers.chooseOption(firstPending, o.optionId);
      }
    }
    // 权限与问答两面都能 Esc 取消（问答取消形状已登记：{outcome:"cancelled"}）。
    if (pendingKind === "permission" || pendingKind === "ask-user") {
      hotkeyMap["Escape"] = () => handlers.cancel(firstPending);
    }
  }
  // 窗口级键位（照 ZCode useGlobalQuickPickShortcuts 的键位表）。
  // mod 组合键在输入框内也生效——⌘K 在 composer 里按不出来就等于没有。
  hotkeyMap["mod+k"] = () => setPaletteOpen((v) => !v);
  hotkeyMap["mod+shift+p"] = () => setPaletteOpen(true);
  hotkeyMap["mod+n"] = () => newSession();
  hotkeyMap["mod+b"] = () => toggleSidebar();
  hotkeyMap["mod+alt+b"] = () => toggleAux();
  hotkeyMap["mod+j"] = () => toggleTerminal();
  hotkeyMap["mod+shift+["] = () => cycleSession(-1);
  hotkeyMap["mod+shift+]"] = () => cycleSession(1);
  useHotkeys(hotkeyMap);

  /* 账本追加：turnUsage 引用变化 = 新的一轮用量落地；去重键 = 会话 + numTurns。 */
  const turnUsage = active?.turnUsage ?? null;
  useEffect(() => {
    if (turnUsage === null || active === null || turnUsage.numTurns <= 0) return;
    const wrote = appendUsageLedger({
      k: active.id + ":" + String(turnUsage.numTurns),
      d: dayKey(new Date()),
      m: active.modelId ?? "unknown",
      t: turnUsage.totalTokens,
      i: turnUsage.inputTokens,
      o: turnUsage.outputTokens,
      c: turnUsage.cachedReadTokens,
      r: turnUsage.reasoningTokens,
      mc: turnUsage.modelCalls,
      ms: turnUsage.apiDurationMs,
    });
    if (wrote) setUsageEntries(loadUsageLedger());
  }, [turnUsage, active]);

  /* 设置面整窗替换工作区壳（活壳同语法：SettingsView 是路由级整面，不是叠层）。 */
  if (settingsSection !== null) {
    return (
      <SettingsSurface
        runtime={runtime}
        boot={boot}
        sessionId={state.activeSessionId}
        mcpTick={state.mcpServers}
        section={settingsSection}
        onSection={setSettingsSection}
        onClose={() => setSettingsSection(null)}
        theme={theme}
        onTheme={setTheme}
        agentVersion={state.connection.agentVersion}
        usageEntries={usageEntries}
      />
    );
  }

  return (
    <div
      className={"shell" + (layout.sidebarOpen ? "" : " shell--sidebar-closed")}
      style={
        {
          "--workspace-sidebar-panel-width": String(Math.round(layout.sidebarWidth)) + "px",
          "--aux-panel-width": String(Math.round(layout.auxWidth)) + "px",
          /* macOS hiddenInset 红绿灯让位量：侧栏叠层按钮从它右边起。
           * 活壳实测第一个叠层按钮 x=96 ⇒ 让位 96px（6rem），不是旧顶栏的 72px。 */
          "--topbar-inset": boot?.platform === "darwin" ? "6rem" : "0px",
        } as CSSProperties
      }
    >
      <Sidebar
        state={state}
        boot={boot}
        bridge={runtime.bridge}
        theme={theme}
        onTheme={setTheme}
        model={sidebarModel}
        view={layout.view}
        sort={layout.sort}
        onView={setView}
        onSort={setSort}
        onReorderProjects={reorderProjects}
        sidebarOpen={layout.sidebarOpen}
        canBack={navCanStep(nav, -1)}
        canForward={navCanStep(nav, 1)}
        onBack={() => stepNav(-1)}
        onForward={() => stepNav(1)}
        onToggleSidebar={toggleSidebar}
        onNewSession={newSession}
        newSessionBusy={newBusy}
        onOpenPalette={() => setPaletteOpen(true)}
        onPickTask={(t: SidebarTask) => activateSession(t.sessionId)}
        onOpenSettings={setSettingsSection}
      />
      <div
        className="shell__handle"
        title="拖拽调整侧栏宽度 · 双击恢复默认"
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragFrom.current = { x: e.clientX, w: layout.sidebarWidth };
        }}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          const from = dragFrom.current;
          if (from === null) return;
          const next = from.w + (e.clientX - from.x);
          setLayout((l) => ({
            ...l,
            sidebarWidth: Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, next)),
          }));
        }}
        onPointerUp={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragFrom.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onDoubleClick={() => setLayout((l) => ({ ...l, sidebarWidth: SIDEBAR_WIDTH_DEFAULT }))}
      />
      <main className="shell__main">
        <div className="shell__dragstrip" />
        <section className="card">
          <CardHeader
            session={active}
            cwd={active?.cwd ?? boot?.cwd ?? null}
            boot={boot}
            kernelVersion={state.connection.agentVersion}
            terminalOpen={layout.dockOpen}
            onToggleTerminal={toggleTerminal}
            auxOpen={auxOpen}
            onToggleAux={toggleAux}
          />
          <div className="card__body">
            <div className="card__conversation">
              <div className="chipstack">
                <DiffChip git={git} onOpen={() => openAuxTab("review")} />
                <AgentChip summary={agentSummary(backgroundAgents)} onOpen={() => openAuxTab("agents")} />
              </div>
              <Spine session={active} running={running || !ready} onSuggest={setDraft} onOpenAgent={openAgent} />
              <div className="approvals">
                {state.pendingInteractions.map((item) => (
                  <ApprovalCard key={String(item.id)} item={item} handlers={handlers} />
                ))}
              </div>
              <QueueStrip entries={active?.queueEntries ?? []} />
              <Composer
                disabled={!ready || active === null}
                running={running}
                error={error}
                models={models}
                modelId={active?.modelId ?? null}
                context={ctx}
                promptCapabilities={state.connection.promptCapabilities}
                value={draft}
                onChange={setDraft}
                onSend={send}
                onStop={stop}
                backgroundAgentCount={backgroundAgents.length}
                onOpenBackgroundWorks={() => openAuxTab("agents")}
                focusToken={focusToken}
                commands={kernelCommands}
                perm={permCurrent}
                onPerm={onPerm}
                turnUsage={active?.turnUsage ?? null}
                pickFiles={pickAttachFiles}
                attachSearch={
                  active === null
                    ? null
                    : {
                        ready: attachSearchId !== null,
                        matches: attachMatches,
                        onOpen: openAttachSearch,
                        onClose: closeAttachSearch,
                        onQuery: queryAttachSearch,
                      }
                }
                cwd={attachCwd}
                onModel={(modelId) => {
                  if (active === null) return;
                  void runtime.effect({ kind: "session/setModel", sessionId: active.id, modelId }).then((r) => {
                    if (!r.ok) setError("切换模型失败：" + r.error);
                  });
                }}
                onEffort={(effortId) => {
                  if (active === null) return;
                  const modelId = active.modelId;
                  if (modelId === null) return;
                  void runtime
                    .effect({ kind: "session/setModel", sessionId: active.id, modelId, effort: effortId })
                    .then((r) => {
                      if (!r.ok) setError("切换推理档失败：" + r.error);
                    });
                }}
              />
              {dockMounted ? (
                <TerminalDock
                  runtime={runtime}
                  sessionId={active?.id ?? null}
                  cwd={active?.cwd ?? boot?.cwd ?? null}
                  theme={theme}
                  open={layout.dockOpen}
                  onClose={closeTerminal}
                  height={layout.dockHeight}
                  onHeight={(h) => setLayout((l) => ({ ...l, dockHeight: h }))}
                />
              ) : null}
            </div>
            {auxOpen ? (
              <>
                <div
                  className="aux__handle"
                  title="拖拽调整侧边面板宽度 · 双击恢复默认"
                  onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    auxDragFrom.current = { x: e.clientX, w: layout.auxWidth };
                  }}
                  onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
                    const from = auxDragFrom.current;
                    if (from === null) return;
                    // 左缘把手：向左拖变宽 ⇒ 宽度 = 起点宽 - 位移
                    const next = from.w - (e.clientX - from.x);
                    setLayout((l) => ({
                      ...l,
                      auxWidth: Math.min(AUX_WIDTH_MAX, Math.max(AUX_WIDTH_MIN, next)),
                    }));
                  }}
                  onPointerUp={(e: ReactPointerEvent<HTMLDivElement>) => {
                    auxDragFrom.current = null;
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
                  }}
                  onDoubleClick={() => setLayout((l) => ({ ...l, auxWidth: AUX_WIDTH_DEFAULT }))}
                />
              <AuxPane
                runtime={runtime}
                root={active?.cwd ?? boot?.cwd ?? null}
                sessionId={active?.id ?? null}
                tabs={auxTabState.tabs}
                active={auxTabState.active}
                onOpenTab={openAuxTab}
                onActivate={activateAuxTab}
                onCloseTab={closeAuxTab}
                now={now}
                agents={agentRows}
                agentFocus={agentFocus}
                git={git}
                gitBusy={gitBusy}
                onRefreshGit={refreshGit}
              />
              </>
            ) : (
              <div className="aux__sliver" title="侧边面板已收起（⌘⌥B 或卡片头右簇第 3 枚展开）" />
            )}
          </div>
        </section>
      </main>
      <CommandPalette
        open={paletteOpen}
        actions={paletteActions}
        commands={kernelCommands}
        sessions={knownSessions}
        onClose={() => setPaletteOpen(false)}
        onPickCommand={pickCommand}
        onPickSession={(s) => activateSession(s.sessionId)}
      />
    </div>
  );
}
import { readAutoPermissionEnabled } from "../../ui/readers.ts";
