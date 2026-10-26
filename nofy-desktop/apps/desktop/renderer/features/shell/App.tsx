import { TaskOverview, WatchingChip } from "./TaskOverview.tsx";
import { IconList } from "../../ui/icons.tsx";
import { useTaskOverview, openTaskSource } from "../../application/workspace/public.ts";
import { loadGeneralPrefs, subscribeGeneralPrefs } from "../../ui/generalPrefs.ts";
import { tr } from "../../ui/i18n.ts";
import { recordRender } from "../../ui/renderDiagnostics.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { OverlayHost } from "./OverlayHost.tsx";
import { WindowNavigation } from "./WindowNavigation.tsx";
import { ShellLayout } from "./ShellLayout.tsx";
import { WindowFrame } from "./WindowFrame.tsx";
import { windowActions } from "./windowActions.ts";
/** Window composition. Client use cases, resource lifetimes and persisted state live in application.
 * Runtime is still forwarded to legacy views during migration; App never emits raw effects.
 * Startup remains without StrictMode because navigation bootstrap creates kernel sessions.
 */
import { lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState } from "react";
import type { BootstrapInfo } from "../../../preload/contract.ts";
import { useProjection } from "../../application/projection/public.ts";
import { createDesktopClient } from "../../application/public.ts";
import { useSessionNavigation } from "../../application/sessions/public.ts";
import { createKnownSessionsSelector,createShellSelector,useWorkspaceCatalog } from "../../application/shell/public.ts";
import { metadataFor,useAttachmentSearch,useDrafts,usePanelTabs,useSessionMetadata,useSessionResources,useUsageLedger,useWindowPreferences,useWorkspace } from "../../application/workspace/public.ts";
import type { Runtime } from "../../core/runtime.ts";
import { setDocTitle } from "../../ui/doctitle.ts";
import type { HotkeyMap } from "../../ui/hotkeys.ts";
import { useHotkeys } from "../../ui/hotkeys.ts";
import type { CommandInfo } from "../../ui/readers.ts";
import {
readAutoPermissionEnabled,
readCommands,
readModelOptions,
} from "../../ui/readers.ts";
import { ApprovalHost,CancelTurnCard } from "../approvals/public.ts";
import type { AgentRow,AttachItem,PermId } from "../conversation/public.ts";
import { AgentChip,Composer,ConversationDock,currentPermId,QueueHost,runningAgentRows,Spine } from "../conversation/public.ts";
import type { SettingsSectionId } from "../settings/public.ts";
import type { ReviewSource } from "../aux/public.ts";
import type { AuxTab } from "./AuxPane.tsx";
import { AuxPane } from "./AuxPane.tsx";
import { HeaderBoundary as CardHeader } from "./HeaderBoundary.tsx";
import type { NavHistory } from "./navhistory.ts";
import { navCanStep,navCurrent,navEmpty,navPush,navStep } from "./navhistory.ts";
import { stepIndex } from "./palette.ts";
import { SessionActionsMenu } from "./SessionActionsMenu.tsx";
import { SidebarBoundary as Sidebar } from "./SidebarBoundary.tsx";
import type { SidebarSort,SidebarTask,SidebarView } from "./sidebarModel.ts";
import { buildSidebarModel } from "./sidebarModel.ts";
import { useWorkspaceAgents } from "./useWorkspaceAgents.ts";
const SettingsSurface = lazy(() => import("../settings/public.ts").then((m) => ({ default: m.SettingsSurface })));
const TerminalDock = lazy(() => import("./TerminalDock.tsx").then((m) => ({ default: m.TerminalDock })));

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function App({ runtime }: { runtime: Runtime }) {
  recordRender("App");
  const locale = useLocale();
  const client = useMemo(() => createDesktopClient(runtime), [runtime]);
  // 历史回放会密集到达 IPC；投影仍逐帧同步，界面只订阅合并后的快照。
  const shellSelector = useMemo(createShellSelector, []);
  const state = useProjection(client.projection, shellSelector);
  const agentSources = useWorkspaceAgents(client.projection);
  const [boot, setBoot] = useState<BootstrapInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme, layout, setLayout, dockMounted, setDockMounted, now } = useWindowPreferences();
  /** 设置面（阶段 C UI 批）：null = 工作区壳；非 null = 设置面停在该分区。
   *  窗口局部态（与侧栏开合同纪律），不进 store。 */
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId | null>(null);
  const [settingsNavHost, setSettingsNavHost] = useState<HTMLElement | null>(null);
  /** 本机用量账本（#7）：turn_completed.usage 投影变化时追加去重条目。 */
  /** 布局（侧栏 + 辅助 pane 开合）：窗口局部态，一个键持久化（ui/prefs.ts）。 */
  // 新窗口尚无已绑定标签，空辅助栏不预占对话宽度；宽度/终端偏好仍保留。
  /** 侧栏分隔条拖拽起点（features 不碰 window/document，走元素级 pointer 捕获）。 */
  /** 右侧面板左缘把手拖拽起点（同纪律）。 */
  /**
   * 视图导航历史（侧栏叠层的后退/前进）：记的是**会话激活序列**。
   * 与 ⌘⇧[ / ⌘⇧] 的环形切换分工不同——那是「在已加载集合里走一步」，
   * 这是「回到我刚才看过的那一个」（可跨加载状态）。
   */
  const [nav, setNav] = useState<NavHistory>(navEmpty);
  /** 后退/前进引发的激活不再入栈（否则一次后退就把前进分支冲掉了）。 */
  const navLock = useRef(false);
  /** 相对时间芯片的时钟：30s 一跳——够让「57分」保持诚实，又不至于每秒重排列表。 */
  /** ⌘K 命令中心开合。 */
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [findSession, setFindSession] = useState<string | null>(null);
  const [planJump, setPlanJump] = useState<{ sessionId: string; token: number; blockId: string } | null>(null);
  const [reviewSource, setReviewSource] = useState<ReviewSource>("branch");
  const changeFind = useCallback((open: boolean) => setFindSession(open ? client.projection.getState().activeSessionId : null), [client]);
  useEffect(() => setFindSession(null), [state.activeSessionId]);
  const metadata = useSessionMetadata(client, state.activeSessionId, setError);
  const sessionMetadata = metadata.prefs;
  const changeMetadata = metadata.change;
  const [archiveView, setArchiveView] = useState(false);
  const deleteProjection = (id: string): void => {
    client.sessions.forget(id);
    metadata.forget(id);
    drafts.forget(id);
  };

  const [cancelSession, setCancelSession] = useState<string | null>(null);
  /**
   * 辅助 pane 的开合标签与选中标签（窗口局部态；⌘K 面板命令要能切它）。
   * 零标签 = 浏览器新标签页：地址栏、本窗口真实工具，以及本窗口打开过的网页。全屏在分栏里把右侧栏加宽，中栏同步让出宽度。
   */
  const panel = usePanelTabs();
  const auxTabState = panel.state;
  const openAuxTab = useCallback((t: AuxTab) => {
    setLayout(l => ({ ...l, auxOpen: true }));
    panel.open(t);
  }, [panel.open]);
  const activateAuxTab = panel.open;
  const closeAuxTab = panel.close;
  /** 脊柱块和右上胶囊共用：目录 tab + 定位行展开。 */
  const [agentFocus, setAgentFocus] = useState<string | null>(null);
  const openAgent = useCallback(
    (id: string) => {
      setAgentFocus(id);
      openAuxTab("agents");
    },
    [openAuxTab],
  );

  /** composer 草稿：窗口局部态（空态建议芯片要能填进来），不进 store。 */
  /** 聚焦令牌：⌘K 选中内核命令后把焦点交回 composer（见 Composer.focusToken）。 */
  const [focusToken, setFocusToken] = useState(0);
  const [followToken, setFollowToken] = useState(0);
  const [permissionOpenToken, setPermissionOpenToken] = useState(0);
  const bootStarted = useRef(false);

  /**
   * 终端 dock 的挂载闸：**开过一次就一直挂着**（收起只是 display:none）。
   * 活壳同行为——CDP 实测面板收起时 .xterm 仍在 DOM 里，只是 0×0。
   * 若收起就卸载，用户跑在里面的 dev server 会被连带杀掉（我们的卸载不 kill pty，
   * 但 xterm 的 scrollback 会没，重开就是空白屏）。持久化里是开的 ⇒ 首屏就挂。
   */
  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;
    runtime.bootstrap().then(setBoot, (e: unknown) => setError(tr("bootstrap 失败：") + msg(e)));
  }, [runtime]);

  const active = state.activeSessionId === null ? null : state.sessions[state.activeSessionId] ?? null;
  const usageEntries = useUsageLedger(active);
  const workspace = useWorkspace(client.workspace, boot?.cwd ?? null, active?.cwd ?? null, setError);
  const navigation = useSessionNavigation(client, state, workspace.cwd, setError);
  const newBusy = navigation.busy;
  const drafts = useDrafts(active?.id ?? null, workspace.cwd);
  const draftId = drafts.key;
  const currentDraft = drafts.current;
  const draft = currentDraft.text;
  const setDraft = drafts.setText;
  const setAttachments = drafts.setAttachments;
  const openWorkspace = async (): Promise<void> => {
    const directory = await workspace.pick();
    if (directory !== null) await navigation.create(directory);
  };
  const chooseWorkspace = (cwd: string): void => { workspace.select(cwd); void navigation.create(cwd); };

  /** 子智能体目录行：活动会话的 task 块 + roster 活动态 join（子会话 id = subagent_id）。 */
  const agentRows = useMemo<AgentRow[]>(
    () =>
      agentSources.map((a) => ({
        ...a,
        activity: a.subagentId !== null ? (state.roster[a.subagentId]?.activity ?? null) : null,
      })),
    [agentSources, state.roster, locale],
  );
  /**
   * 胶囊源 = 所有 running 的子智能体（回合内也显示，结束即消失）。
   * 右上 AgentChip 与 composer .bgworks 都只用这份，点开进右侧已有的子智能体目录。
   */
  const backgroundAgents = useMemo(() => runningAgentRows(agentRows), [agentRows, locale]);
  const openRunningAgent = useCallback(() => {
    const id = backgroundAgents.find((agent) => agent.subagentId !== null)?.subagentId;
    if (id) openAgent(id);
    else openAuxTab("agents");
  }, [backgroundAgents, openAgent, openAuxTab]);
  const ready = state.connection.status === "ready";
  const auxOpen = layout.auxOpen;

  // 会话标题去窗口标题（顶栏单行不放标题：度量抄录 pass 的裁定，ui/doctitle.ts）
  const docTitle = active?.title ?? null;
  useEffect(() => {
    setDocTitle(docTitle === null ? "Nofy" : docTitle + " · Nofy");
  }, [docTitle]);

  // 用量轮询：6s 一次，够看趋势又不至于压内核；读不到就 null（用量条不渲染）。
  const activeId = state.activeSessionId;

  const overview = useTaskOverview(activeId);
  const composerRef = useRef<HTMLDivElement>(null);
  const overviewAnchor = useRef<HTMLButtonElement>(null);
  const currentDraftRef = useRef(currentDraft); currentDraftRef.current = currentDraft;
  const { ctx, git, gitBusy, gitError, refreshGit } = useSessionResources(client, activeId, ready, state.connection.transportEpoch);

  const newSession = (): void => { void navigation.create(workspace.cwd); };
  const send = async (text: string, attach: AttachItem[]): Promise<boolean> => {
    if (active === null) { setError(tr("会话尚未就绪")); return false; }
    const key = draftId;
    const submitted = currentDraft;
    setError(null);
    if (!running) setFollowToken(value => value + 1);
    const result = await client.sessions.send(active.id, text, attach);
    if (!result.ok) {
      const latest = client.projection.getState();
      if (latest.activeSessionId === active.id && latest.sessions[active.id]?.turns.at(-1)?.feedback?.kind !== "failed") setError(tr("发送失败：") + result.error);
      return false;
    }
    drafts.clearSubmitted(key, submitted);
    return true;
  };

  /** 「添加附件」：系统选文件框 → 芯片。取消＝[] 静默。宿主能力，不经内核。 */
  const pickAttachFiles = useCallback(async (): Promise<AttachItem[]> => {
    const files = await runtime.pickFiles();
    return files.map((f) => ({ path: f.path, name: f.name, kind: "file" as const }));
  }, [runtime]);

  const attachmentSearch = useAttachmentSearch(client, active?.id ?? null, active?.cwd ?? boot?.cwd ?? null, state.connection.transportEpoch);
  const openAttachSearch = attachmentSearch.open;
  const closeAttachSearch = attachmentSearch.close;
  const queryAttachSearch = attachmentSearch.query;
  const attachMatches = attachmentSearch.matches;

  const stop = (): void => {
    if (!active) return;
    if (backgroundAgents.length > 0) { setCancelSession(active.id); return; }
    void client.sessions.cancel(active.id);
  };

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
      void client.sessions.setPermission(active.id, id).then(r => { if (!r.ok) setError(r.error); });
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
  const sessionIds = useMemo(() => Object.keys(state.sessions).sort(), [state.sessions, locale]);
  const cycleSession = useCallback(
    (delta: number) => {
      if (sessionIds.length < 2) return;
      const at = state.activeSessionId === null ? 0 : Math.max(0, sessionIds.indexOf(state.activeSessionId));
      const next = sessionIds[stepIndex(sessionIds.length, at, delta)];
      if (next !== undefined) client.sessions.activate(next);
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
  const activateSession = (sessionId: string, directory?: string): void => { void navigation.activate(sessionId, directory).then((ok) => { if (ok) metadata.markRead(sessionId); }); };

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
  }, [setDraft]);


  const running = active?.agentState === "turn-running" || active?.agentState === "turn-cancelling";
  useEffect(() => {
    const apply = () => {
      const prefs = loadGeneralPrefs();
      void runtime.bridge.applyDesktopHost({ keepAwake: prefs.keepAwake && running, httpProxy: prefs.httpProxy, noProxy: prefs.noProxy });
    };
    apply();
    return subscribeGeneralPrefs(apply);
  }, [runtime, running]);
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !running) {
      const prefs = loadGeneralPrefs();
      const Notify = (globalThis as { Notification?: typeof Notification }).Notification;
      if (prefs.notifyDone && Notify !== undefined && Notify.permission === "granted" && (globalThis as { document?: { hidden?: boolean } }).document?.hidden === true) {
        new Notify(tr("回合已结束"), { silent: !prefs.notifySound, body: active?.title ?? "" });
      }
    }
    wasRunning.current = running;
  }, [active?.title, running]);
  const models = useMemo(() => readModelOptions(active?.modelOptions ?? []), [active?.modelOptions, locale]);

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
    [active?.availableCommands, state.connection.initialCommands, locale],
  );

  /**
   * 已知会话全集 = 已加载会话 + roster 里未加载的（后者点击走 session/load）。
   * **⌘K 的「会话」范围与侧栏列表共用这一份**：两处对同一批会话给出不同答案，
   * 是「界面自相矛盾」最常见的一种，所以数据源只折一次。
   */
  const knownSessionSelector = useMemo(createKnownSessionsSelector, []);
  const knownSessions = knownSessionSelector(state);
  const workspaceCatalog = useWorkspaceCatalog(client, ready, state.connection.transportEpoch);

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
        homeCwd: workspace.cwd,
        projectOrder: layout.projectOrder,
        recentCwds: workspace.recent,
        metadata: sessionMetadata,
        archiveView,
        workspaces: workspaceCatalog.catalog,
      }),
    [boot, knownSessions, layout.sort, layout.view, layout.projectOrder, now, locale, sessionMetadata, archiveView, workspace.cwd, workspace.recent, workspaceCatalog.catalog],
  );

  /**
   * 窗口动作。段序与关键词抄 ZCode buildQuickPickCommands（QuickPick.tsx:665-830），
   * 但**只放真能跑的**；未接线的显式 disabled + 写明实测状态与排期
   * （uiux-reference.md §1：灰按钮比假按钮诚实，空菜单项最失信）。
   */
  const paletteActions = windowActions({ theme, layout, ready, hasSession: active !== null, workspace, newSession, openWorkspace, toggleSidebar, toggleAux, toggleTerminal, openAuxTab, setTheme, setSettingsSection, openPermission: () => setPermissionOpenToken(n => n + 1) });

  // 审批模态快捷键：1-9 选第 N 项、Esc 取消。只挂第一条待裁决，
  // 且输入框内按键忽略（ui/hotkeys.ts）——在 composer 打数字不能误触审批。
  const hotkeyMap: HotkeyMap = {};
  // 窗口级键位（照 ZCode useGlobalQuickPickShortcuts 的键位表）。
  // mod 组合键在输入框内也生效——⌘K 在 composer 里按不出来就等于没有。
  hotkeyMap["mod+k"] = () => setPaletteOpen((v) => !v);
  hotkeyMap["mod+shift+p"] = () => setPaletteOpen(true);
  hotkeyMap["mod+n"] = () => newSession();
  hotkeyMap["mod+o"] = () => { void openWorkspace(); };
  hotkeyMap["mod+shift+f"] = () => setHistoryOpen((v) => !v);
  hotkeyMap["mod+b"] = () => toggleSidebar();
  hotkeyMap["mod+alt+b"] = () => toggleAux();
  hotkeyMap["mod+j"] = () => toggleTerminal();
  hotkeyMap["mod+shift+["] = () => cycleSession(-1);
  hotkeyMap["mod+shift+]"] = () => cycleSession(1);
  useHotkeys(settingsSection === null ? hotkeyMap : {});

  const settingsView = settingsSection === null ? null : <Suspense fallback={<div role="status">{tr("正在读取设置…")}</div>}><SettingsSurface
        workspaceCwd={workspace.cwd ?? undefined}
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
        navHost={settingsNavHost}
      /></Suspense>;

  return <WindowFrame route={null} workspace={<ShellLayout layout={settingsSection ? { ...layout, sidebarOpen: true } : layout} setLayout={setLayout} platform={boot?.platform}
    navigation={<WindowNavigation sidebarOpen={layout.sidebarOpen} canBack={navCanStep(nav, -1)} canForward={navCanStep(nav, 1)} onBack={() => stepNav(-1)} onForward={() => stepNav(1)} onToggleSidebar={toggleSidebar} onNewSession={newSession} newSessionBusy={newBusy} />}
    sidebar={settingsSection ? <aside className="sidebar" ref={setSettingsNavHost} /> : <Sidebar
        archiveView={archiveView}
        onArchiveView={setArchiveView}
        onRenameGroup={(previous, next) => metadata.renameGroup(previous, next)}
        onRemoveGroup={(name) => metadata.renameGroup(name, null)}
        onTaskMetadataChange={changeMetadata}
        onOpenWorkspace={() => { void openWorkspace(); }}
        workspaceBusy={workspace.busy}
        onPickWorkspace={chooseWorkspace}
        projection={client.projection}
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
        onNewSession={newSession}
        newSessionBusy={newBusy}
        onOpenPalette={() => setPaletteOpen(true)}
        onPickTask={(t: SidebarTask) => activateSession(t.sessionId, t.cwd ?? undefined)}
        onOpenSettings={setSettingsSection}
        catalogError={workspaceCatalog.error}
      />}
    overview={active ? { open: overview.open, pinned: false, anchor: overviewAnchor, avoid: composerRef, onClose: overview.close,
      content: <TaskOverview key={active.id} client={client} runtime={runtime} sessionId={active.id} cwd={active.cwd} agents={agentRows} git={git} busy={gitBusy} error={gitError} ready={ready} refresh={() => void refreshGit()} view={overview}
        onError={setError} onPlan={blockId => { overview.close(); setPlanJump(current => ({ sessionId: active.id, token: (current?.token ?? 0) + 1, blockId })); }} onReview={() => { setReviewSource("branch"); overview.close(); openAuxTab("review"); }} onAgent={id => { overview.close(); openAgent(id); }}
        onSource={path => { if (!active.cwd) return; const operation = openTaskSource(client, active.id, active.cwd, path); overview.close(); openAuxTab("files"); void operation.catch(e => setError(msg(e))); }}
        onAdd={() => { const id = active.id; void pickAttachFiles().then(files => { if (client.projection.getState().activeSessionId !== id) return; setAttachments([...new Map([...currentDraftRef.current.attach, ...files].map(file => [file.path, file])).values()]); overview.close(); }).catch(e => setError(msg(e))); }}
        onShowAll={() => { overview.close(); openAuxTab("files"); }} />
    } : undefined}
    header={<CardHeader projection={client.projection}
            overview={active && <button ref={overviewAnchor} className={"iconbtn task-overview-trigger" + (overview.open ? " iconbtn--on" : "")} aria-label={tr("任务概览")} aria-expanded={overview.open} aria-haspopup="dialog" onClick={overview.toggle}><IconList size={16}/></button>}
            actions={active === null ? null : <SessionActionsMenu key={active.id} metadata={metadataFor(sessionMetadata, active.id)} onMetadataChange={(patch) => changeMetadata(active.id, patch)} runtime={runtime} session={active} onSelectSession={async (id, cwd) => { await navigation.activate(id, cwd); }} onDeleted={deleteProjection} saveText={runtime.saveText} />}
            session={active}
            cwd={active?.cwd ?? workspace.cwd}
            terminalOpen={layout.dockOpen}
            onToggleTerminal={toggleTerminal}
            auxOpen={auxOpen}
            onToggleAux={toggleAux}
          />}
    conversation={settingsView ?? <>
              <div className="chipstack">
                <AgentChip agents={backgroundAgents} onOpen={openRunningAgent} />
                <WatchingChip client={client} sessionId={active?.id ?? null} onOpen={() => { if (!overview.open) overview.toggle(); }} />
              </div>
              <Spine followToken={followToken} jumpRequest={planJump && planJump.sessionId === active?.id ? planJump : null} runtime={runtime} session={null} running={running || !ready} findOpen={active !== null && findSession === active.id} onFindChange={changeFind} onSuggest={setDraft} onOpenAgent={openAgent} onEdit={setDraft} onRewound={async (id, text) => { const target = client.projection.getState().sessions[id]; if (target?.cwd) { const result = await client.sessions.load(id, target.cwd, true); if (!result.ok) throw new Error(tr("历史刷新失败：") + result.error); } if (text !== null) drafts.restore(id, text); }} />
              <ConversationDock projection={client.projection} cancelOpen={cancelSession !== null && cancelSession === active?.id}><div className="conversation-dock__scroll"><div className="approvals">
                {cancelSession === active?.id ? <CancelTurnCard key={cancelSession} runningCount={backgroundAgents.length} onClose={() => setCancelSession(null)} onChoose={(cancelSubagents) => { const id = cancelSession; setCancelSession(null); if (id) void client.sessions.cancel(id, cancelSubagents); }} /> : null}
                <ApprovalHost client={client} onError={setError} />
              </div>
              <QueueHost client={client} />
              </div>
              <div className="dock-composer" ref={composerRef}><Composer
                permissionOpenToken={permissionOpenToken}
                key={draftId}
                attachments={currentDraft.attach}
                onAttachmentsChange={setAttachments}
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
                onOpenBackgroundWorks={openRunningAgent}
                focusToken={focusToken}
                commands={kernelCommands}
                perm={permCurrent}
                onPerm={onPerm}
                turnUsage={active?.turnUsage ?? null}
                pickFiles={pickAttachFiles}
                attachSearch={
                  active === null
                    ? null
                    : attachmentSearch.view
                }
                cwd={active?.cwd ?? boot?.cwd ?? null}
                onModel={(modelId) => {
                  if (active === null) return;
                  void client.sessions.setModel(active.id, modelId).then((r) => {
                    if (!r.ok) setError(tr("切换模型失败：") + r.error);
                  });
                }}
                onEffort={(effortId) => {
                  if (active === null) return;
                  const modelId = active.modelId;
                  if (modelId === null) return;
                  void client.sessions.setModel(active.id, modelId, effortId)
                    .then((r) => {
                      if (!r.ok) setError(tr("切换推理档失败：") + r.error);
                    });
                }}
              /></div></ConversationDock>
              </>}
    bottomDock={height => dockMounted ? (
                <Suspense fallback={<div role="status">{tr("正在加载终端…")}</div>}><TerminalDock
                  runtime={runtime}
                  sessionId={active?.id ?? null}
                  cwd={active?.cwd ?? workspace.cwd}
                  theme={theme}
                  open={layout.dockOpen}
                  onClose={closeTerminal}
                  height={height}
                  onHeight={(h) => setLayout((l) => ({ ...l, dockHeight: h }))}
                /></Suspense>
              ) : null}
    auxiliary={<AuxPane open={layout.auxOpen} enabled
                runtime={runtime}
                root={active?.cwd ?? boot?.cwd ?? null}
                sessionId={active?.id ?? null}
                tabs={auxTabState.tabs}
                active={auxTabState.active}
                onOpenTab={openAuxTab}
                onActivate={activateAuxTab}
                onCloseTab={closeAuxTab}
                onCollapse={toggleAux}
                onOpenTerminal={openTerminal}
                expanded={layout.auxExpanded}
                onToggleExpand={() => setLayout(l => ({ ...l, auxExpanded: !l.auxExpanded }))}
                now={now}
                agents={agentRows}
                agentFocus={agentFocus}
                onCancelAgent={(id) => {
                  if (active === null) return;
                  void client.tasks.cancelSubagent(active.id, id).then(
                    (result) => { if (!result.ok) setError(result.error); },
                    (reason: unknown) => setError(msg(reason)),
                  );
                }}
                git={git}
                gitBusy={gitBusy}
                onRefreshGit={refreshGit}
                reviewSource={reviewSource}
                onReviewSource={setReviewSource}
                onOpenReviewFile={path => { if (!active?.cwd) return; const operation = openTaskSource(client, active.id, active.cwd, path); openAuxTab("files"); void operation.catch(e => setError(msg(e))); }}
              />}
    overlays={<OverlayHost runtime={runtime} historyOpen={historyOpen} onCloseHistory={() => setHistoryOpen(false)} onSelectHistory={async (id,cwd) => { await navigation.activate(id,cwd); setHistoryOpen(false); }} palette={{ open: paletteOpen, actions: paletteActions, commands: kernelCommands, sessions: knownSessions, onClose: () => setPaletteOpen(false), onPickCommand: pickCommand, onPickSession: session => activateSession(session.sessionId) }} />} />} />;
}
