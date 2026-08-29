/* eslint-disable */
/**
 * ============================================================================
 * WorkspaceShell.tsx — ZCode 3.7.6 工作区壳 + 工作区根控制器（解混淆重建 · D8 Stage B / F07）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  主体（本文件完整还原）：
 *   yJt  → WorkspaceShell            工作区壳：三分布局根组件 (183896-185431 / 148387-149354)
 *   XJt  → WorkspaceRoot             工作区根控制器：状态机+装配 (186219-187019 / 150098-150859)
 *   Y4t  → MemoizedWorkspaceRoot     memo(XJt)，供远控壳挂载 (206773 / 164452)
 *
 *  壳平台助手（本文件完整还原）：
 *   Z5   → MAC_TRAFFIC_LIGHTS_PADDING_PX = 96        (185430 / 149354)
 *   Q5   → WINDOWS_CAPTION_CONTROLS_WIDTH_PX = 136   (185431 / 149354)
 *   $5   → roundPositivePx                            (185432 / 149355)
 *   bJt  → resolveWindowControlsPadding              (185435 / 149358)
 *   xJt  → updateReadyVersionOf                       (185442 / 149370)
 *   SJt  → useAppChromeState      全屏/窗口外观/控制区几何/更新状态订阅 (185445-185564 / 149373-149484)
 *   CJt  → RELOAD_SESSION_DEBOUNCE_MS = 1200         (185566 / 149485)
 *   wJt  → toReloadSessionError                       (185567 / 149486)
 *   TJt  → withinReloadDebounce                       (185574 / 149495)
 *   EJt  → pickSelectedModelFromConfigOptions         (185578 / 149498)
 *   e7   → parseProviderIdFromModelRef                (185584 / 149502)
 *   DJt  → findCustomModelProvider                    (185591 / 149510)
 *   OJt  → isProviderMismatch                        (185598 / 149516)
 *   kJt  → resolveSelectedSupplierKey                 (185605 / 149520)
 *   AJt  → shouldUseLocalPreference                   (185614 / 149526)
 *   jJt  → resolveWorkspaceModelSelection             (185624-185687 / 149535-149584)
 *   MJt  → useReloadSession        会话重建（进程重启+配置重取+模型裁决）(185688-185784 / 149585-149670)
 *   NJt  → useWorkspaceLifecycle   工作区切换清理+预热释放 (185785-185824 / 149671-149696)
 *   PJt  → isTaskRuntimeActive                        (185825 / 149697)
 *   FJt  → mergeTaskProviders                         (185828 / 149700)
 *   IJt  → hasActiveTaskRuntimeForProvider            (185835 / 149706)
 *   LJt  → useWorkspaceShellZCodeState 选择器对        (185847-185880 / 149720-149744)
 *   t7   → isRestartingRuntime                        (185881 / 149745)
 *   RJt  → isTaskStillVisible                         (185884 / 149748)
 *   zJt  → useTaskNavigation       任务选择/前进后退/自动化导航 (185889-186063 / 149753-149916)
 *   BJt  → useBrowserRestoreUrls   按任务恢复浏览器 url + git 源持久化 (186064-186109 / 149917-149967)
 *   n7   → trimmedOrUndefined                         (186110 / 149968)
 *   VJt  → resolveActiveWorkspaceTarget               (186112 / 149971)
 *   HJt  → OFF_PEAK_POLL_INTERVAL_MS = 30000          (186119 / 149985)
 *   UJt  → toOffPeakNotifyStatus                      (186121 / 149986)
 *   WJt  → useOffPeakNotifications 30s 轮询+系统通知   (186123-186168 / 149986-150039)
 *   GJt  → e2eTaskMembershipProbes  window.__testActions 探针 (186170-186214 / 150040-150091)
 *   r7   → CLOSE_ACTIVE_CONTEXT_EVENT = 'zcode:close-active-context-request' (186215 / 150092)
 *   KJt  → resolveCloseableSidePaneTab                (186216 / 150092)
 *
 *  窗口壳 / 错误边界 / 平台控件（本文件完整还原）：
 *   l4   → WindowShell             窗口壳 memo：h-dvh 列容器 (129647-129666 / 109071-109087)
 *   ekt  → AppErrorBoundary        应用级错误边界（本文件保留接口）(129920 / 109184)
 *   p4   → ScopedErrorBoundary     作用域错误边界（scope/resetKeys/variant）(129952-129991 / 109217-109263)
 *   tkt  → LinuxWindowControls     Linux 桌面 −□× 三键 (129992-130033 / 109264-109304)
 *   d4   → toError                 (129708 / 109131)
 *   YOt  → serializeErrorForLog    (129711 / 109134)
 *   ZOt  → didResetKeysChange       (129729 / 109152)
 *   JOt  → LOCALE_PREFERENCE_KEY = 'zcode-locale-preference' (129706 / 109129)
 *   XOt  → detectInitialLocale      (129714 / 109137)
 *   f4   → translateAppError        (129724 / 109147)
 *   VOt/HOt/UOt/u4/WOt/GOt/KOt/qOt → ARMS react-error 遥测组 (129667-129705 / 109088-109128)
 *
 *  分割布局原语（本文件还原 X4 包装层；cAt/pAt 引擎保留接口）：
 *   cAt  → ResizablePanelGroup     react-resizable-panels Group 引擎 (131422 / 110732)
 *   uAt  → usePersistentGroupLayout localStorage 布局持久化 (131631 / 110950)
 *   pAt  → ResizablePanel          Panel 引擎 (131715 / 111031)
 *   X4   → SplitLayoutGroup        = cAt + 布局持久化 (131934-131942 / 111263-111271)
 *   Z4   → SplitPanel              = pAt (131943 / 111283)
 *   J4   → persistentLayoutKey     'react-resizable-panels:{id}:{panels}' (131599 / 110913)
 *
 *  WorkspaceShell 私有助手（本文件完整还原）：
 *   Iqt  → useCollapsiblePanel     面板开合+尺寸记忆 (183714-183777 / 148181-148239)
 *   Lqt  → resolveAutomationsRunTab 运行历史目标工作区 tab 裁决 (183778-183785 / 148240-148247)
 *   Rqt  → windowRoundedCornerClasses Win 圆角/边框让位 (183782-183790 / 148255-148266)
 *   zqt/Bqt/Vqt/Hqt/Uqt → 远控导航高度常量 0.5/352/24/48/168 (183792-183796 / 148267)
 *   Wqt  → isSidebarShownInShellLayout (183796 / 148267)
 *   Gqt  → preferredNavHeightForViewport (183799 / 148274)
 *   Kqt  → maxNavHeightForViewport  (183802 / 148277)
 *   W5   → clampNavHeight           (183805 / 148280)
 *   qqt  → toggleNavHeight          (183810 / 148294)
 *   Jqt/Yqt/Xqt → G5 用属性/事件名  (183816-183818 / 148300)
 *   G5   → setSidebarResizingAttribute (183819 / 148310)
 *   Zqt  → MOBILE_VIEWPORT_QUERY = '(max-width: 767px)' (183822 / 148313)
 *   K5   → COLLAPSE_NAV_ONCE_KEY = 'zcode:web-remote-control:collapse-navigation-once' (183823)
 *   Qqt  → DEFAULT_VIEWPORT_HEIGHT = 800 (183824)
 *   $qt  → NAV_DRAG_THRESHOLD_PX = 4 (183825)
 *   eJt  → DEFAULT_SIDEBAR_WIDTH_PX = 264 (183826)
 *   q5   → MIN_SIDEBAR_WIDTH_PX = 264 (183827)
 *   tJt  → MAX_SIDEBAR_WIDTH_RATIO = 0.5 (183828)
 *   nJt  → SIDEBAR_WIDTH_STORAGE_KEY = 'zcode:workspace-shell:sidebar-width-px' (183829)
 *   rJt  → SIDEBAR_RATIO_STORAGE_KEY = 'react-resizable-panels:workspace-shell-layout:sidebar:content' (183830)
 *   iJt  → SIDEBAR_KEYBOARD_STEP_PX = 16 (183831)
 *   aJt  → SIDEBAR_PANEL_WIDTH_VAR = '--workspace-sidebar-panel-width' (183832)
 *   oJt  → SIDEBAR_WIDTH_VAR = '--workspace-sidebar-width' (183833)
 *   sJt  → SIDE_PANE_AUTO_COLLAPSE_THRESHOLD_PX = 480 (183834)
 *   cJt  → EMPTY_LOGS_BY_WORKSPACE_KEY = {} (183835)
 *   lJt  → EMPTY_REMOTE_WORKSPACE_SESSIONS = [] (183836)
 *   uJt  → SIDEBAR_AUTO_COLLAPSE_THRESHOLD_PX = 360 (183837)
 *   dJt  → RESIZE_DEBOUNCE_MS = 300 (183838)
 *   fJt  → WORKSPACE_BODY_PANEL_IDS = ['conversation-column', 'browser'] (183839)
 *   pJt  → CONVERSATION_COLUMN_PANEL_IDS = ['conversation', 'terminal'] (183840)
 *   J5   → clampSidebarWidth        (183841 / 148337)
 *   mJt  → readPersistedSidebarWidth (183845 / 148341)
 *   hJt  → readPersistedSidebarRatio (183856 / 148352)
 *   Y5   → persistSidebarWidth      (183868 / 148364)
 *   X5   → viewportHeight           (183874 / 148369)
 *   gJt  → isMobileViewportNow      (183877 / 148372)
 *   _Jt  → consumeCollapseNavigationOnce (183882 / 148375)
 *   vJt  → armCollapseNavigationOnce (183890 / 148382)
 *
 *  会话持久化 / 侧栏投放上下文（本文件完整还原）：
 *   RTt  → LAST_SESSION_STORAGE_PREFIX = 'zcode-v4-last-session:v1:' (123122 / 104862)
 *   j2   → lastSessionStorageKey    (123124 / 104864)
 *   zTt  → readLastSessionId        (123127 / 104867)
 *   BTt  → writeLastSessionId       (123133 / 104873)
 *   VTt  → shouldRestoreLastSession (123139 / 104879)
 *   HTt  → useLastSessionPersistence (123141-123177 / 104845-104880)
 *   FTt  → SidebarSessionDropContext (123103 / 104799)
 *   ITt  → SidebarSessionDropProvider (123104-123117 / 104800-104813)
 *   LTt  → useSidebarSessionDrop    (123118 / 104814)
 *
 *  叶子组件（接口保留；完整 JSX 见各自行号或已抽取模块）：
 *   TFt  → SessionHeader            （已抽取进 TopBar.tsx，js 144008）
 *   BOt  → TopBarOverlay            （已抽取进 TopBar.tsx，js 129516）
 *   S6   → WindowsCaptionMenu       （已抽取进 TopBar.tsx，js 141854）
 *   U6   → HelpMenu                 （已抽取进 TopBar.tsx，js 143345）
 *   H6   → TerminalToggleButton     （已抽取进 TopBar.tsx，js 143316）
 *   zZ   → GitBranchChip            （已抽取进 TopBar.tsx，js ~96589）
 *   c4/s4 → windowsCaptionInsetStyle / WINDOWS_CAPTION_RIGHT_INSET_VAR（TopBar.tsx）
 *   rVt  → Sidebar                  F01 根（js 159137 / jsx 132075）
 *   a4   → WorkspaceSelectionRow    F02 副根（js 128568 / jsx 108415）
 *   xqt  → SidePanel                F04 根（js 182519 / jsx 147333）
 *   Mqt  → DockTerminalBrowserPanel F13 根（js 183602 / jsx 148118）
 *   PTt  → ConversationOrchestrator F03 编排器（js 122803 / jsx 104572）
 *   owt  → StackedConversationPane  F03 变体（js 121284 / jsx 103212）
 *   nPt  → TaskFindDialog           F05 副根（js 139949 / jsx 116646）
 *   l3   → RepoWikiMain             F16 根（js 132306 / jsx 111550）
 *   d6   → AutomationsMain          F15 根（js 138823 / jsx 115911）
 *   JPt  → WebRemoteMobileShell     F17（js 141584 / jsx 117999 附近）
 *   Rje  → QuickPick                F05 根（js 36439 / jsx 33404）
 *   RMe  → FeedbackCenter           F09 根（js 39107 / jsx 35262）
 *   $Ot  → ScopedErrorFallback      p4 的呈现层（js ~129790+）
 *   QOt  → AppErrorFallback         ekt 的呈现层（js 129735 / jsx 109158）
 *
 *  图标（Sa = createLucideIcon 工厂）：
 *   Rye grip-horizontal (27180) | fv loader (27315) | bv minus (27442)
 *   Wv square (27823) | g=X close（imeComposition chunk b 导出）
 *
 *  data-testid / 常量（来自 src-HCld2afU.js 或本 chunk）：
 *   Mi = 'app-header'（src chunk 8235，导出 wt←bg）
 *   c6 = 'automations-main-toast-anchor'（本 chunk 138630）
 *   'resizable-handle' / 'new-task-draft-drag-region' / 'new-task-draft-drop-mask' /
 *   'automations-main-drag-region' / 'web-remote-control-navigation-panel'（内联字面量）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与原局部名）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime           react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa)
 *                                   button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale, setLocale}
 *                                   IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、toast (m)、close 图标 (g=b)
 *                                   imeComposition-DEYFkwWm.js
 *  6. shortcutLabel ($i)、shortcutLabelVariant (Vre)、快捷键判定 (ta/Qi/Rre)
 *                                   keyboardShortcuts-BGHopxr9.js
 *  7. logger (J)                    logger-PFDwl5Yq.js
 *  8. DesktopCommand 枚举 (oi)、testid Mi、模型供应商工具 (jt/On/mi/Ei)、
 *     zod/环境常量                    src-HCld2afU.js
 *  9. useTaskStore (xe)、zustand create (Ae)、工作区状态选择器群
 *     (B/se/Fe/Re/fe/ze/le/oe/Ce/ae/re)、useSkillsStore (Ne)
 *                                   skillStore-BmeKHDBI.js
 * 10. 本 chunk 内：stores（A2 会话路由 122619、s2 分屏 121669、Vo 搜索 1553、
 *     yC 反馈 36992、ko 设置 1296、pc/hc 工作区 tabs 4753/4761、Ug MCP 25007）、
 *     服务钩子（fs 2638、Ec 4897、Dc 4907、Oc 4945、Boe 2816）、
 *     会话路由（MTt/ATt/jTt 122742-122802）、路径/域工具（Io 1368、Go 1928、
 *     Yo 1958、BA 50926、VA 50929、Lo 1371、yst 94961、Ogt 109814、z0 121365）、
 *     git/任务元数据钩子（nge 23920、Yse 4949、e_e 24724、wge 24240）、
 *     快捷键绑定层（rge 24015）、QuickPick 命令表（O_e 25395）、
 *     查找状态（T_e/Wg/E_e 25385-25393）、e2e 桥（w_e 25374、re()、GJt 内联）、
 *     通知（eSt 117283）、模型裁决依赖（fM/pM 52633/52636、NM 52950、$6e 78042、
 *     VUe 52921）、未读/搜索助手（tae/nae/Wo/Ho 1905-1911、sx 32242、tc 4380、
 *     $ae 2440、_oe 2650、woe 2685、rXe 67542、W6e 77966、hse 4178、
 *     moe/ss/cs 2595-2609、$o 2171、oc/sc 4439/4445、co 1033、xo 1103、
 *     iw 39327、lw 39409、uw 39411、JMe 39407、zMe/BMe 39206/39220、S_e 25351）
 * ============================================================================
 */

import * as React from "react";
import { workspaceKeyOf } from './CodeViewer';
import { ConversationOrchestrator } from './Conversation';
import { APP_LOGO_DATA_URL, FeedbackCenter, collectWorkspaceTaskIds, resolveAdjacentTasks, runWithWorkspaceVisibility } from './FeedbackCenter';
import { WorkspaceSelectionRow } from './Home';
import { toast } from './ImeComposition';
import { pathBasename } from './ModalsLeaves';
import { QuickPick, buildQuickPickCommands } from './QuickPick';
import { resolveThemeMode } from './Settings';
import { SidePanel, useSidePaneState, type RecentClosedSidePaneTab, type SidePaneState, type SidePaneTab } from './SidePanel'; // 侧面板态型以 SidePanel 导出为准
import { logger, useTaskStore } from './SkillStore';
import { taskEntityKey } from './StoresDeep';
import { GitBranchChip, HelpMenu, PRODUCT_DOCS_URL, SessionHeader, TerminalToggleButton, TopBarOverlay, WINDOWS_CAPTION_RIGHT_INSET_VAR, WindowsCaptionMenu, windowsCaptionInsetStyle } from './TopBar';
import { WebRemoteMobileShell } from './WebRemote';
import { useBaseServices, useServices } from './services';
import { useFeedbackStore, useSettingsStore } from './stores-core';
import { cn } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { AutomationsMain } from './ExtendedViews'; // 原 d6（F15 根）
import { type GitDataset, type GitSourceOption, type GitSummary } from './GitReview'; // 原 Yhe/Yse 缺省形（git 域规范导出）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): {
  intl: IntlShape;
  locale: string;
  setLocale(locale: string): void;
};

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk） */

/** 快捷键文案（原 $i / Vre，keyboardShortcuts chunk）：$i('N') → 'Ctrl+N' */
declare function shortcutLabel(key: string): string;
declare function shortcutLabelVariant(key: string): string;

/** 桌面命令枚举（原 oi，src-HCld2afU.js） */
declare const DesktopCommand: {
  MinimizeWindow: "minimize-window";
  ToggleMaximizeWindow: "toggle-maximize-window";
  CloseWindow: "close-window";
};
type DesktopCommandValue =
  | "minimize-window"
  | "toggle-maximize-window"
  | "close-window";

/* --- 平台服务（原 l()=usePlatformService，imeComposition chunk 的 M 导出） --- */

interface WindowControlsOverlayMetrics {
  leftPaddingPx?: number;
  rightPaddingPx?: number;
}
interface DesktopWindowChromeState {
  isMaximized: boolean;
  supportsNativeRoundedCorners: boolean | null;
}
type UpdateState =
  | { kind: "update-available"; version?: string }
  | { kind: "download-progress"; version?: string; percent?: number }
  | { kind: "update-downloaded"; version: string }
  | { kind: string };

interface PlatformService {
  getWindowControlsOverlayMetrics?(): WindowControlsOverlayMetrics;
  onWindowFullscreenChanged(cb: (fullscreen: boolean) => void): () => void;
  getDesktopWindowChromeState?(): Promise<DesktopWindowChromeState>;
  onDesktopWindowChromeStateChanged?(cb: (s: DesktopWindowChromeState) => void): () => void;
  onWindowControlsOverlayChanged?(
    cb: (m: WindowControlsOverlayMetrics) => void,
  ): () => void;
  onUpdateReady?(cb: (version: string) => void): () => void;
  getUpdateState?(): Promise<UpdateState>;
  onUpdateStateChanged?(cb: (s: UpdateState) => void): () => void;
  canOpenCommunity(locale: string): Promise<boolean>;
  openCommunity(): void;
  openExternal(url: string): void | Promise<void>;
  openFeedback(): void;
  onOpenFeedbackDialog?(cb: () => void): (() => void) | undefined;
  onOpenTicketsPanel?(cb: () => void): (() => void) | undefined;
  showTaskNotification(input: {
    taskId: string;
    status: "completed" | "failed";
    title: string;
    body: string;
  }): void;
  executeDesktopCommand(command: DesktopCommandValue): void;
}
declare function usePlatformService(): PlatformService;

/* --- 服务束（原 e：工作区服务 32 面之一组；fs/Ec/Dc/Oc 解析） --- */

interface FileStatResult {
  type: "file" | "directory";
}
interface WorkspaceServices {
  fileService: { stat(input: { path: string }): Promise<FileStatResult> };
  zcodeTaskService: {
    restartWorkspaceProcess(input: {
      workspacePath: string;
      workspaceIdentity?: string;
      provider: string;
      resumeTaskId?: string;
    }): Promise<void>;
    releaseWorkspacePreparation(input: {
      workspacePath: string;
      workspaceIdentity?: string;
      provider: string;
    }): Promise<void>;
    setTaskUnread(input: {
      taskId: string;
      workspacePath: string;
      workspaceIdentity?: string;
      unread: boolean;
    }): Promise<{ unreadAt: number | null }>;
  };
  zcodeSessionService: unknown;
  modelProviderService: {
    onDidChangeProviderRegistry(cb: (e: { snapshot: { revision: number } }) => void): {
      dispose(): void;
    };
    resolveWorkspaceModelSelection(input: {
      zcodeProvider: string;
      workspacePath: string;
      workspaceIdentity?: string;
      modelProviders: ModelProviderInfo[];
      localPreference: string | null;
      providersReady: boolean;
    }): Promise<ModelSelectionResolution>;
  };
  zcodeAgentService: {
    getPluginsOverview(input: unknown): Promise<unknown>;
    addPluginMarketplace(input: unknown): Promise<unknown>;
    updatePluginMarketplace(input: unknown): Promise<unknown>;
    installPlugin(input: unknown): Promise<unknown>;
    listPlugins(input: unknown): Promise<unknown>;
  };
  offPeakTaskService: {
    list(): Promise<Array<{
      offPeakTaskId: string;
      status: string;
      title?: string;
      prompt?: string;
      sessionId?: string;
      conversationId?: string;
    }>>;
  };
  mcpSyncService: unknown;
}
declare function useWorkspaceServicesResolver(
  workspacePath: string,
  remoteSessionId: string | undefined,
  workspaceIdentity: string | undefined,
  remoteTarget: RemoteTarget | undefined,
): { rpcReady: boolean };

/* --- 模型供应商域（原 fM/pM/NM/$6e/VUe/mi/On/jt/Ei/B/se/Fe/Re，
       skillStore + src chunk） --- */

interface ModelProviderInfo {
  id: string;
  source: "builtin" | "models-dev" | "custom" | "workspace";
}
interface ModelSelectionResolution {
  selectedSupplierKey: string | null;
  selectedModel: string | null;
  isGhostSupplier: boolean;
  supplierMismatchReason: string | null;
  uiError?: string | null;
  shouldClearLocalPreference: boolean;
}
interface ConfigOption {
  category: string;
  type: string;
  currentValue?: unknown;
}
declare function getModelProviderRegistry(): ModelProviderInfo[];
declare function isModelProviderRegistryReady(): boolean;
declare function fetchDraftConfigOptions(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  provider: string;
  zcodeSessionService: unknown;
}): Promise<{ configOptions?: ConfigOption[]; slashCommands?: unknown[] }>;
declare function mergeConfigOptions(
  current: ConfigOption[],
  fetched: ConfigOption[],
  provider: string,
): ConfigOption[];
declare function normalizeReloadError(error: unknown, input: { workspacePath: string; provider: string }): Error;
declare function supplierKeyFromProviderId(providerId: string): string;
declare function defaultSupplierKeyForProvider(zcodeProvider: string): string;
declare function isGhostSupplierId(id: string): boolean;
declare function isLocalBuiltinProvider(zcodeProvider: string): boolean;
declare function readLocalModelPreference(
  zcodeProvider: string,
  workspacePath: string,
  workspaceIdentity?: string,
): string | null;
declare function parseModelRef(modelRef: string): { providerId: string; modelId?: string } | null;
declare function applySelectedModelToConfigOptions(
  configOptions: ConfigOption[],
  model: string,
  zcodeProvider: string,
): ConfigOption[];
declare function clearLocalModelPreference(
  zcodeProvider: string,
  workspacePath: string,
  workspaceIdentity?: string,
): void;

/* --- 任务/工作区状态域（原 xe 及 skillStore 选择器群） --- */

type WorkspaceInitState = "idle" | "initializing" | "ready" | "failed";
interface WorkspaceZCodeState {
  activeTaskId: string | null;
  draftSessionId?: string | null;
  draftFocusVersion: number;
  modelSwitchPending: boolean;
  modelSwitchStage: string | null;
  selectedProvider: string;
  selectedSupplierKey: string | null;
  configOptions: ConfigOption[] | null;
  optimisticTaskListByTaskId: Record<string, { provider?: string }>;
  workspaceInit: { state: WorkspaceInitState; error: string | null };
  taskRuntimeByTaskId?: Record<string, { status: string; provider?: string }>;
  taskListCache?: Array<{ taskId: string; provider?: string }>;
  groupedDraftTask?: { placement?: string } | null;
}
interface WorkspaceStateSlice extends WorkspaceZCodeState {
  taskStatus: string;
  taskError: string | null;
}
interface TaskNavItem {
  taskId?: string;
  workspacePath: string;
  workspaceIdentity?: string;
  automationId?: string;
}
interface VisibleTask {
  taskId: string;
}
interface TaskStoreState {
  workspaces: Record<string, { selectedProvider?: string }>;
  getWorkspaceState(workspacePath: string, workspaceIdentity?: string): WorkspaceZCodeState;
  setActiveTaskId(workspacePath: string, taskId: string, workspaceIdentity?: string): void;
  setWorkspaceInitState(workspacePath: string, state: WorkspaceInitState, error: string | null, workspaceIdentity?: string): void;
  setWorkspaceInitAttempts(workspacePath: string, attempts: number, workspaceIdentity?: string): void;
  setConfigOptions(workspacePath: string, options: ConfigOption[], workspaceIdentity?: string): void;
  setConfigOptionsStatus(workspacePath: string, status: string, workspaceIdentity?: string): void;
  setSlashCommands(workspacePath: string, commands: unknown[], workspaceIdentity?: string): void;
  setDraftError(workspacePath: string, error: Error | null, workspaceIdentity?: string): void;
  setTaskState(workspacePath: string, state: string, error: string | null, workspaceIdentity?: string): void;
  setModelSelectionResolution(workspacePath: string, resolution: { selectedSupplierKey: string | null; isGhostSupplier: boolean; supplierMismatchReason: string | null }, workspaceIdentity?: string): void;
  startDraft(workspacePath: string, provider: string, workspaceIdentity?: string, options?: { groupedDraftPlacement?: string }): void;
  clearGroupedDraftTask(workspacePath: string, workspaceIdentity?: string): void;
  taskNavHistory: unknown;
  taskNavPushAutomations(workspacePath: string, workspaceIdentity?: string, automationId?: string): void;
  taskNavGoBack(): TaskNavItem | null;
  taskNavGoForward(): TaskNavItem | null;
  removeTaskFromNavHistory(taskId: string): void;
}
declare const taskStore: { getState(): TaskStoreState };
declare function getWorkspaceStateSelector(
  state: TaskStoreState,
  workspacePath: string,
  workspaceIdentity?: string,
): WorkspaceZCodeState;
declare function deriveTaskStateSlice(state: WorkspaceZCodeState): {
  taskStatus: string;
  taskError: string | null;
};
declare function deriveDraftStateSlice(state: WorkspaceZCodeState): { provider: string; supplierKey: string | null };
declare function getWorkspaceInitSlice(state: WorkspaceZCodeState): { status: string; error?: string | null };
declare function getVisibleTasks(state: WorkspaceZCodeState): VisibleTask[];
declare function isAutomationsNavEntry(entry: TaskNavItem): boolean;
declare function canTaskNavBack(history: unknown): boolean;
declare function canTaskNavForward(history: unknown): boolean;
declare function isModelRuntimeRestarting(pending: boolean, stage: string | null): boolean;
declare function readLocalPreferenceForDraft(
  zcodeProvider: string,
  workspacePath: string,
  workspaceIdentity?: string,
): string | null;

/* --- 搜索结果域（原 Vo） --- */

interface SearchResultsState {
  resultsByQueryKey: Record<
    string,
    {
      descriptor: {
        kind: string;
        search: string;
        workspaceKeys: string[];
        visibleLimit: number | null;
      };
      taskKeys: string[];
      fetchedAt: number;
      stale: boolean;
    }
  >;
  taskMetaByEntityKey: Record<
    string,
    {
      taskId: string;
      unreadAt?: number | null;
      status?: string;
    }
  >;
}
declare const searchResultsStore: { getState(): SearchResultsState };

/* --- 未读状态助手（原 tae/nae/Wo/Ho/sx） --- */

declare function markTaskUnreadLocally(input: {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string;
}, unreadAt: number | null | undefined): void;
declare function applyTaskUnreadAt(input: {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string;
}, unreadAt: number | null): void;
declare function rollbackTaskUnread(input: {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string;
}, unreadAt: number | null): void;
declare function queueUnreadPersistence(inputs: Array<{
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string;
}>): void;
declare function flushUnreadPersistence(): void;

/* --- 远程会话注册表（原 tc） --- */

declare function getRemoteSessionRegistryEntry(
  remoteSessionId: string,
): { services: WorkspaceServices | null } | null;

/* --- 工作区 tabs 域（原 pc/hc/oc/sc） --- */

type RemoteTarget = { host?: string; label?: string } | string | null;
interface WorkspaceTab {
  kind: "workspace" | "settings";
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
  workspacePurpose?: "project" | "conversation" | "scratch";
  localWorkspacePath?: string | null;
  availability?: string;
  label?: string;
}
interface WorkspaceTabsState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  addTab(path: string, options?: { workspaceIdentity?: string; workspacePurpose?: string }): void;
  activateTabByPath(path: string, options?: { workspaceIdentity?: string }): boolean;
  openSettingsTab(section?: string): void;
}
declare function useWorkspaceTabs<T>(selector: (state: WorkspaceTabsState) => T): T;
declare function useWorkspaceTabsStore(): WorkspaceTabsState;
declare function isWorkspaceTab(tab: WorkspaceTab): tab is WorkspaceTab & { kind: "workspace" };
declare function isWorkspaceUnavailableLocalDirectory(
  state: { tabs: WorkspaceTab[] },
  workspacePath: string,
  workspaceIdentity?: string,
): boolean;

/* --- 设置域（原 ko / xo / iw） --- */

declare function setSettingsTabTarget(section: string): void;

/* --- 反馈域（原 yC） --- */


/* --- 路径 / 工作区键 工具（原 Io/Go/Yo/BA/VA/Lo） --- */

declare function workspaceKey(workspacePath: string, workspaceIdentity?: string | null): string;
declare function browserUrlFromPath(path: string): string;
declare function isPathWithin(parent: string, child: string): boolean;
declare function isSamePath(a: string, b: string): boolean;

/* --- git 域（原 nge/Yse/yst） --- */
/* GitSummary/GitDataset/GitSourceOption 已接线 GitReview 导出（原 Yhe 缺省形）；
 * GitState 用 type 别名（对 SidePanel GitState {[key:string]:unknown} 占位可赋值） */
type GitState = {
  summary: GitSummary;
  datasets: { unstaged: GitDataset; staged: GitDataset; [key: string]: GitDataset };
  sourceOptions: GitSourceOption[];
  workspaceKey: string;
};
declare function useGitState(input: {
  workspacePath: string;
  activeTaskId: string | null;
  includeExtendedData: boolean;
  refreshToken: number;
  remoteSessionId: string | null;
  remoteTarget: RemoteTarget | undefined;
  workspaceIdentity?: string;
}): GitState;
declare function useGitSummarySync(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId: string | null;
  gitSummary: GitSummary;
  gitSummaryWorkspaceKey: string;
  enabled: boolean;
  onRefreshGit: () => void;
}): void;
declare function countDirtyFiles(datasets: GitState["datasets"]): number;

/* --- 会话编排 / 分屏路由（原 PTt/owt 叶子 + A2/s2/MTt/ATt/jTt） --- */

interface SessionBinding {
  workspaceScope: {
    workspacePath: string;
    workspaceIdentity?: string;
    remoteSessionId?: string;
  };
  sessionId: string;
}
declare const sessionRouterStore: {
  getState(): {
    activeGroupId: string | null;
    deactivateActiveGroup(): void;
    openSessionFromSidebar(binding: SessionBinding): void;
    splitSessionIntoGroup(anchorPaneId: string, side: string, binding: SessionBinding, primary?: SessionBinding): void;
    promotePaneLayoutToGroup(binding: SessionBinding, splitStore: unknown): boolean;
  };
};
declare const splitLayoutStore: {
  getState(): {
    resetToPrimaryPane(): void;
    focusPane(paneId: string): void;
    splitPaneWithBinding(anchorPaneId: string, side: string, binding: SessionBinding): void;
    replacePaneBinding(paneId: string, binding: SessionBinding): void;
  };
};
declare function openSessionBesideDraft(
  draftScope: SessionBinding | null,
  target: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string; sessionId: string },
): void;
declare function canOpenSessionInSplit(
  draftScope: SessionBinding | null,
  target: SessionBinding,
  options: { mode: string; side: string },
): boolean;
declare function openSessionInSplit(
  draftScope: SessionBinding | null,
  target: SessionBinding,
  options: { mode: string; side: string },
): boolean;

/* --- 辅助对话 / 选择域（原 $ae/_oe/woe/rXe） --- */

/* SidePaneTab/SidePaneState 已接线 SidePanel 导出（本地松形已删） */
declare function findSelectionSideChatTab(
  sidePaneState: SidePaneState | null | undefined,
  input: { workspaceKey: string; parentSessionId: string },
): (SidePaneTab & { childSessionId?: string | null }) | null;
declare function auxiliaryChatRegistryKey(workspaceKey: string, parentSessionId: string): string;
declare function focusAuxiliaryChat(registryKey: string): boolean;
declare function handoffCrossWorkspaceConversation(input: {
  sourceWorkspacePath: string;
  sourceWorkspaceIdentity?: string;
  targetWorkspacePath: string;
}): void;

/* --- 侧面板状态（原 Boe，js 2816） --- */

interface SidePaneController {
  isTerminalOpen: boolean;
  setIsTerminalOpen(open: boolean): void;
  sidePaneState: SidePaneState | null;
  recentClosedSidePaneTabs: RecentClosedSidePaneTab[];
  isSidePaneCollapsed: boolean;
  setIsSidePaneCollapsed(collapsed: boolean): void;
  isSidebarVisible: boolean;
  browserNavigationRequest: unknown;
  setBrowserNavigationRequest(request: unknown): void;
  handleOpenCodeViewer(...args: unknown[]): void;
  handleOpenBrowserUrl(url: string): void;
  handleToggleBrowser(): void;
  handleOpenBrowserTab(): void;
  handleToggleGit(): void;
  handleOpenGit(sourceId?: string): void;
  handleOpenTreemapping(...args: unknown[]): void;
  handleOpenWhiteboard(): void;
  handleOpenDeveloperTools(): void;
  handleOpenTerminalTab(): void;
  handleOpenSubagentSession(sessionId: string): void;
  handleOpenSubagentDirectory(): void;
  handleSyncSubagentSessionTabs(): void;
  handleOpenSelectionSideChat(sessionId: string): void;
  handleOpenPlanDetail(planId?: string): void;
  handleToggleTerminal(): void;
  handleToggleSidebar(): void;
  handleToggleSidePaneCollapse(): void;
  handleCloseCodeViewer(tabId: string): void;
  handleCloseGit(): void;
  handleActivateSidePaneTab(tabId: string): void;
  handleReorderSidePaneTab(input: unknown): void;
  handleCloseSidePaneTab(tabId: string): void;
  handleCloseOtherSidePaneTabs(tabId: string): void;
  handleCloseAllSidePaneTabs(): void;
  handleReopenClosedSidePaneTab(tabId: string): void;
  handleBrowserNavigationRequestHandled(requestId: unknown): void;
  handleBrowserPageMetadataChange(input: unknown): void;
}
declare function getActiveSidePaneTab(state: SidePaneState | null | undefined): SidePaneTab | null;

/* --- 任务元数据 / 日志文件（原 e_e / wge） --- */

interface TaskFileRef {
  path: string;
  exists: boolean;
  loading: boolean;
  provider?: string;
}
interface ActiveTaskMeta {
  resolvedActiveTaskMeta: unknown;
  activeTraceId: string | null;
  activeSessionId: string | null;
  activeTaskProvider: string | null;
  workspaceHeaderProvider: string | null;
  activeTaskChangeSummary: string | null;
  activeTaskTitle: string | null;
  taskNativeSessionLogFile: TaskFileRef;
  taskSessionFile: TaskFileRef;
}
declare function useActiveTaskMeta(input: {
  workspaceAbsPath: string;
  activeTaskId: string | null;
  workspaceRemoteSessionId?: string;
  workspaceIdentity?: string;
  selectedProvider: string;
  intl: IntlShape;
}): ActiveTaskMeta;
declare function useProviderConfigFile(
  workspaceAbsPath: string,
  provider: string | null,
  remoteSessionId?: string,
  workspaceIdentity?: string,
): TaskFileRef;

/* --- 按任务 UI 状态持久化（原 moe/ss/cs） --- */

interface PerTaskUiState {
  activeGitSourceId?: string;
  browserUrl?: string;
  browserUrls?: Record<string, string>;
}
declare function perTaskUiStateKey(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  taskId: string | null;
}): string | null;
declare function readPerTaskUiState(key: string | null): PerTaskUiState;
declare function writePerTaskUiState(key: string | null, patch: Partial<PerTaskUiState>): void;

/* --- 键盘快捷键绑定层（原 rge，js 24015） --- */

declare function useWorkspaceKeyboardShortcuts(handlers: {
  openQuickPick: () => void;
  find: () => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  toggleSidePane: () => void;
  previousConversation: () => void;
  nextConversation: () => void;
  navBack: (() => void) | null;
  navForward: (() => void) | null;
}): void;

/* --- QuickPick 命令表（原 O_e，js 25395） --- */

interface QuickPickCommand {
  id: string;
  section: string;
  [key: string]: unknown;
}

/* --- 上一任务 / 下一任务（原 zMe/BMe，js 39206/39220） --- */


/* --- 可见性守卫 / e2e 桥 / MCP 同步（原 JMe/w_e/re/S_e） --- */

declare function isE2eTestMode(): boolean;
declare function useMcpSyncForRemote(
  workspacePath: string,
  workspaceIdentity: string | undefined,
  rpcReady: boolean,
): void;

/* --- 任务完成通知（原 eSt，js 117283） --- */

declare function useTaskCompletionNotifications(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  endpointKey?: string;
  enabled: boolean;
  rpcReady: boolean;
  platform: PlatformService;
  formatMessage: IntlShape["formatMessage"];
}): void;

/* --- 供应商注册表修订 / 渲染器重载探测（原 hse/z0） --- */

declare function setProviderRegistryRevision(revision: number): void;
declare function detectRendererReload(): boolean;

/* --- 内嵌浏览器可打开判定（原 Ogt，js 109814） --- */

declare function canOpenPathInEmbeddedBrowser(input: {
  path: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  compactForRemoteControl: boolean;
}): boolean;

/* --- 工作区状态预热（原 W6e，js 77966；NJt 用） --- */

/* --- 常量（原 lw/uw/c6/Mi） --- */

/** 原 lw（js 39409） */
/** 原 uw（js 39411）：18×18 Z 字 logo data-url */
/** 原 c6（js 138630） */
declare const AUTOMATIONS_MAIN_TOAST_ANCHOR_ID: string;
/** 原 Mi（src-HCld2afU.js 8235，导出 wt←bg = 'app-header'） */
declare const APP_HEADER_TEST_ID: string;

/* --- 图标（原 Sa 工厂；此处按语义命名） --- */

type IconProps = React.SVGProps<SVGSVGElement>;
declare function createLucideIcon(name: string, paths: unknown[]): React.FC<IconProps>;
const IconGripHorizontal = createLucideIcon("grip-horizontal", []); // 原 Rye（js 27180）
const IconLoader = createLucideIcon("loader", []);                   // 原 fv（js 27315）
const IconMinus = createLucideIcon("minus", []);                     // 原 bv（js 27442）
const IconSquare = createLucideIcon("square", []);                   // 原 Wv（js 27823）
declare const IconClose: React.FC<IconProps>;                        // 原 g（imeComposition chunk b 导出）

/* --- 按钮（原 X，button-laUijeDG.js） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | string;
  size?: "icon" | "icon-md" | string;
  "data-web-remote-navigation-resize-handle"?: string;
}
declare const Button: React.FC<ButtonProps>;

/* ============================================================================
 * 1. 窗口壳 WindowShell（原 l4，js 129647-129666 / jsx 109071-109087）
 * ----------------------------------------------------------------------------
 * 全屏 h-dvh 列容器；背景色按平台分档：
 *   - Mac 桌面：bg-background-alt
 *   - Win / Linux / 非桌面：bg-background-win-alt
 * title/actions/tabBar/headerTestId/showHeader 由上层（次级窗口/设置壳）传入，
 * 本 memo 本体只负责外框（与源一致：这些 props 仅解构不透传）。
 * ==========================================================================*/

interface WindowShellProps {
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  tabBar?: React.ReactNode;
  isDesktop?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  headerTestId?: string;
  showHeader?: boolean;
}

export const WindowShell = React.memo(function WindowShell({
  title,
  children,
  actions,
  tabBar,
  isDesktop = false,
  isMacDesktop = false,
  isWindowsDesktop = false,
  headerTestId,
  showHeader = isDesktop,
}: WindowShellProps) {
  // 源实现中 title/actions/tabBar/headerTestId/showHeader 未参与渲染（保留签名）
  void title; void actions; void tabBar; void headerTestId; void showHeader;
  return (
    <div
      className={cn(
        "flex h-dvh flex-col overflow-hidden border-border text-foreground",
        !isDesktop || isWindowsDesktop || (isDesktop && !isMacDesktop && !isWindowsDesktop)
          ? "bg-background-win-alt"
          : "bg-background-alt",
      )}
    >
      <div className="relative flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
});

/* ============================================================================
 * 2. 错误边界组（原 ekt/p4 + 遥测助手，js 129667-129991 / jsx 109088-109263）
 * ----------------------------------------------------------------------------
 *  - p4 = ScopedErrorBoundary：带 scope 的分区错误边界。props.resetKeys 变化时
 *    自动清除错误态（ZOt 比较），呈现层 $Ot 按 variant（panel/compact/silent）
 *    渲染降级 UI。yJt 用它包裹 6 个作用域：
 *    workspace-sidebar / workspace-header / repo-wiki-main / automations-main /
 *    workspace-chat / desktop-top-overlay / draft-caption-menu。
 *  - ekt = AppErrorBoundary：应用级边界（本文件保留接口）。
 *  - qOt：错误上报 ARMS 自定义事件（perf_react_error / react_error）。
 * ==========================================================================*/

/** 原 d4（js 129708）：任意 thrown 值 → Error */
function toError(error: unknown): Error {
  return error instanceof Error ? error : Error(typeof error === "string" ? error : "Unknown error");
}

/** 原 YOt（js 129711）：日志用错误序列化 */
function serializeErrorForLog(error: Error): { name: string; message: string; stack?: string } {
  return { name: error.name, message: error.message, ...(error.stack ? { stack: error.stack } : {}) };
}

const ARMS_REACT_ERROR_NAME = "perf_react_error"; // 原 VOt
const ARMS_REACT_ERROR_GROUP = "react_error";       // 原 HOt
const ARMS_STACK_TRUNCATE_LENGTH = 4000;            // 原 UOt

let armsTelemetryClient: { reportArmsCustomEvent(e: unknown): Promise<void> } | null = null; // 原 u4

/** 原 WOt（js 129670）：由 App 根注入遥测客户端 */
export function setArmsTelemetryClient(
  client: { reportArmsCustomEvent(e: unknown): Promise<void> } | null,
): void {
  armsTelemetryClient = client;
}

/** 原 GOt（js 129674） */
function truncateForArms(value: string): string {
  return value.length > 4000 ? value.slice(0, ARMS_STACK_TRUNCATE_LENGTH) : value;
}

/** 原 KOt（js 129678） */
function buildArmsReactErrorEvent(input: {
  error: Error;
  componentStack: string;
  scope?: string;
}): Record<string, unknown> {
  return {
    name: ARMS_REACT_ERROR_NAME,
    group: ARMS_REACT_ERROR_GROUP,
    value: 1,
    properties: {
      error_name: input.error.name,
      error_message: input.error.message,
      error_stack: input.error.stack ? truncateForArms(input.error.stack) : undefined,
      component_stack: input.componentStack ? truncateForArms(input.componentStack) : undefined,
      boundary_scope: input.scope ?? "app",
    },
  };
}

/** 原 qOt（js 129690）：react-error ARMS 上报（失败仅 warn，不影响渲染） */
function reportReactErrorToArms(input: { error: Error; componentStack: string; scope?: string }): void {
  if (!armsTelemetryClient) return;
  try {
    const event = buildArmsReactErrorEvent(input);
    Promise.resolve(armsTelemetryClient.reportArmsCustomEvent(event)).catch((error) => {
      logger.warn("[react-error] ARMS 自定义事件上报失败", {
        scope: input.scope ?? "app",
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    logger.warn("[react-error] ARMS 自定义事件上报异常", {
      scope: input.scope ?? "app",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 原 ZOt（js 129729）：resetKeys 逐项 Object.is 比较，长度不同视为变化 */
function didResetKeysChange(previous: unknown[] = [], next: unknown[] = []): boolean {
  return previous.length === next.length ? previous.some((value, index) => !Object.is(value, next[index])) : true;
}

const LOCALE_PREFERENCE_KEY = "zcode-locale-preference"; // 原 JOt（js 129706）

/** 原 XOt（js 129714）：初始语言探测（localStorage → navigator.language → en-US） */
function detectInitialLocale(): string {
  if (typeof localStorage < "u" && typeof localStorage.getItem === "function")
    try {
      const stored = localStorage.getItem(LOCALE_PREFERENCE_KEY);
      if (stored === "zh-CN" || stored === "en-US") return stored;
    } catch { /* ignore */ }
  return typeof navigator < "u"
    ? navigator.language.toLowerCase().startsWith("zh")
      ? "zh-CN"
      : "en-US"
    : "en-US";
}

/** 原 f4（js 129724）：appError.* 静态文案（不走 intl context，边界内可用） */
const APP_ERROR_FALLBACK_STRINGS: Record<string, string> = {
  "appError.title": "出错了",
  "appError.description": "页面渲染出现异常，可以尝试重置该区域或重新加载窗口。",
  "appError.unknown": "未知错误",
};
function translateAppError(key: string): string {
  return APP_ERROR_FALLBACK_STRINGS[key] ?? key;
}

/** 原 $Ot：作用域错误降级呈现层（接口保留；完整 JSX 见 js ~129790+） */
declare const ScopedErrorFallback: React.FC<{
  error: Error;
  componentStack: string;
  onReset: () => void;
  onReload: () => void;
  variant?: "panel" | "compact" | "silent" | string;
  className?: string;
}>;

interface ScopedErrorBoundaryProps {
  scope: string;
  /** 变化时自动清除错误态（如 [workspaceKey, activeTaskId]） */
  resetKeys?: unknown[];
  variant?: "panel" | "compact" | "silent" | string;
  className?: string;
  onCaughtReactError?: (error: Error, reactErrorInfo: { componentStack?: string }, scope: string) => void;
  onReset?: () => void;
  children?: React.ReactNode;
}

/** 原 p4（js 129952-129991 / jsx 109217-109263） */
export class ScopedErrorBoundary extends React.Component<
  ScopedErrorBoundaryProps,
  { error: Error | null; componentStack: string }
> {
  state = { error: null as Error | null, componentStack: "" };

  static getDerivedStateFromError(error: unknown) {
    return { error: toError(error), componentStack: "" };
  }

  componentDidCatch(error: unknown, errorInfo: { componentStack?: string }) {
    const normalized = toError(error);
    logger.error(
      `[ScopedErrorBoundary:${this.props.scope}] React subtree crashed:`,
      serializeErrorForLog(normalized),
      errorInfo.componentStack,
    );
    this.props.onCaughtReactError?.(normalized, errorInfo, this.props.scope);
    reportReactErrorToArms({
      error: normalized,
      componentStack: errorInfo.componentStack ?? "",
      scope: this.props.scope,
    });
    this.setState({ componentStack: errorInfo.componentStack ?? "" });
  }

  componentDidUpdate(previous: ScopedErrorBoundaryProps) {
    if (
      this.state.error &&
      didResetKeysChange(previous.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ error: null, componentStack: "" });
    }
  }

  handleReset = () => {
    this.setState({ error: null, componentStack: "" });
    this.props.onReset?.();
  };

  handleReload = () => {
    if (typeof window < "u") window.location.reload();
  };

  render() {
    return this.state.error ? (
      <ScopedErrorFallback
        error={this.state.error}
        componentStack={this.state.componentStack}
        onReset={this.handleReset}
        onReload={this.handleReload}
        variant={this.props.variant}
        className={this.props.className}
      />
    ) : (
      this.props.children
    );
  }
}

/** 原 QOt（js 129735）：应用级错误降级呈现层（接口保留） */
declare const AppErrorFallback: React.FC<{
  error: Error;
  componentStack: string;
  onReset: () => void;
  onReload: () => void;
  isDesktop?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
}>;

/** 原 ekt（js 129920-129950 / jsx 109184-109216）：应用级错误边界（接口保留，结构同 p4） */
export declare class AppErrorBoundary extends React.Component<{
  isDesktop?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  onCaughtReactError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  children?: React.ReactNode;
}> {}

/* ============================================================================
 * 3. Linux 窗口控制按钮 LinuxWindowControls（原 tkt，js 129992-130033 / jsx 109264-109304）
 * ----------------------------------------------------------------------------
 * Linux 桌面没有原生 caption 控件，由 yJt 在 draft 态右上角挂 120px 容器渲染本组件：
 * [最小化 minus][最大化 square][关闭 x(红色悬停)]，均走 executeDesktopCommand。
 * ==========================================================================*/

export function LinuxWindowControls() {
  const platform = usePlatformService();
  const { intl } = useIntlContext();
  const execute = (command: DesktopCommandValue) => {
    platform.executeDesktopCommand(command);
  };
  return (
    <div className="flex h-12 items-center gap-1 px-2 [app-region:no-drag]">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-foreground-subtle hover:bg-hover hover:text-foreground"
        aria-label={intl.formatMessage({ id: "titleBar.window.minimize" })}
        title={intl.formatMessage({ id: "titleBar.window.minimize" })}
        onClick={() => execute(DesktopCommand.MinimizeWindow)}
      >
        <IconMinus className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-foreground-subtle hover:bg-hover hover:text-foreground"
        aria-label={intl.formatMessage({ id: "titleBar.window.toggleMaximize" })}
        title={intl.formatMessage({ id: "titleBar.window.toggleMaximize" })}
        onClick={() => execute(DesktopCommand.ToggleMaximizeWindow)}
      >
        <IconSquare className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-foreground-subtle hover:bg-destructive hover:text-destructive-foreground"
        aria-label={intl.formatMessage({ id: "titleBar.menu.file.closeWindow" })}
        title={intl.formatMessage({ id: "titleBar.menu.file.closeWindow" })}
        onClick={() => execute(DesktopCommand.CloseWindow)}
      >
        <IconClose className="size-4" />
      </Button>
    </div>
  );
}

/* ============================================================================
 * 4. 分割布局原语（原 cAt/uAt/pAt/X4/Z4，js 131422-131960 / jsx 110732-111283）
 * ----------------------------------------------------------------------------
 * 引擎层（cAt Group / pAt Panel / 分隔条 gAt）是 vendored react-resizable-panels
 * 变体，接口保留；此处还原应用包装层：
 *  - X4 = SplitLayoutGroup：Group + usePersistentGroupLayout（localStorage 记忆
 *    'react-resizable-panels:{layoutId}:{panelIds}' 布局）。
 *  - Z4 = SplitPanel：Panel 直挂。
 * §13.6 三分布局即由两层 X4 嵌套构成（见 WorkspaceShell 返回段）。
 * ==========================================================================*/

/** 原 J4（js 131599）：持久化键 'react-resizable-panels:{id}:{panelIds}' */
function persistentLayoutKey(id: string, panelIds: string[]): string {
  return `react-resizable-panels:${[id, ...panelIds].join(":")}`;
}

/** 原 uAt（js 131631，接口级）：读取/防抖写回分组布局；返回默认布局与变更回调 */
declare function usePersistentGroupLayout(input: {
  id?: string;
  groupId?: string;
  panelIds?: string[];
  debounceSaveMs?: number;
  storage?: Storage;
}): {
  defaultLayout: Record<string, number> | undefined;
  onLayoutChange: (layout: Record<string, number>) => void;
};

/** 原 cAt（js 131422，接口级）：可缩放分组引擎（flex 行/列 + 拖拽分隔条注册） */
declare const ResizablePanelGroup: React.FC<{
  className?: string;
  defaultLayout?: Record<string, number>;
  disableCursor?: boolean;
  disabled?: boolean;
  elementRef?: React.Ref<HTMLDivElement>;
  groupRef?: React.Ref<unknown>;
  id?: string;
  onLayoutChange?: (layout: Record<string, number>) => void;
  onLayoutChanged?: (layout: Record<string, number>) => void;
  orientation?: "horizontal" | "vertical";
  resizeTargetMinimumSize?: { coarse: number; fine: number };
  style?: React.CSSProperties;
  children?: React.ReactNode;
}>;

/** 原 pAt（js 131715，接口级）：可缩放面板引擎（minSize/maxSize/defaultSize/collapsible） */
declare const ResizablePanel: React.FC<{
  id?: string;
  className?: string;
  defaultSize?: string;
  minSize?: string;
  maxSize?: string;
  collapsible?: boolean;
  disabled?: boolean;
  elementRef?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}>;

interface SplitLayoutGroupProps {
  className?: string;
  /** 布局持久化 id（如 'workspace-body-layout'） */
  layoutId?: string;
  /** 参与持久化的面板 id 列表 */
  panelIds?: string[];
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

/** 原 X4（js 131934-131942 / jsx 111263-111271） */
export function SplitLayoutGroup({ className, layoutId, panelIds, ...rest }: SplitLayoutGroupProps) {
  const { defaultLayout, onLayoutChange } = usePersistentGroupLayout({ id: layoutId, panelIds });
  return (
    <ResizablePanelGroup
      className={cn("flex h-full w-full", className)}
      defaultLayout={defaultLayout}
      onLayoutChange={onLayoutChange}
      {...rest}
    />
  );
}

/** 原 Z4 = pAt（js 131943 / jsx 111283） */
export const SplitPanel = ResizablePanel;

/* ============================================================================
 * 5. WorkspaceShell 私有助手：常量与纯函数
 *    （js 183792-183895 / jsx 148267-148386，逐字还原）
 * ==========================================================================*/

/* --- 5.1 Web 远控导航高度（手机视口下侧栏变为顶部导航抽屉） --- */

const NAV_HEIGHT_VIEWPORT_RATIO = 0.5;   // 原 zqt
const NAV_HEIGHT_MAX_PX = 352;           // 原 Bqt
const NAV_HEIGHT_COLLAPSE_THRESHOLD_PX = 24; // 原 Vqt：低于此值视为收起
const NAV_HEIGHT_HEADER_OFFSET_PX = 48;  // 原 Hqt
const NAV_HEIGHT_BOTTOM_RESERVE_PX = 168; // 原 Uqt

/** 原 Wqt（js 183796）：侧栏是否参与壳布局。
 *  非远控壳 → 恒真；远控壳手机视口且导航收起 → 假（此时侧栏高度塌为 0）。 */
function isSidebarShownInShellLayout(input: {
  isCollapsed: boolean;
  isMobileViewport: boolean;
  isWebRemoteControlShell: boolean;
}): boolean {
  return !input.isWebRemoteControlShell || !input.isMobileViewport || !input.isCollapsed;
}

/** 原 Gqt（js 183799）：视口 → 期望导航高度 = clamp(viewport*0.5 - 48, 0, 352) */
function preferredNavHeightForViewport(viewportHeight: number): number {
  return Math.round(
    Math.max(0, Math.min(viewportHeight * NAV_HEIGHT_VIEWPORT_RATIO - NAV_HEIGHT_HEADER_OFFSET_PX, NAV_HEIGHT_MAX_PX)),
  );
}

/** 原 Kqt（js 183802）：可拖拽上限 = viewport - 48 - 168 */
function maxNavHeightForViewport(viewportHeight: number): number {
  return Math.max(0, Math.round(viewportHeight - NAV_HEIGHT_HEADER_OFFSET_PX - NAV_HEIGHT_BOTTOM_RESERVE_PX));
}

/** 原 W5（js 183805）：钳制导航高度；≤24px 归零并标记收起 */
function clampNavHeight(input: { heightPx: number; viewportHeight: number }): {
  heightPx: number;
  isCollapsed: boolean;
} {
  const max = maxNavHeightForViewport(input.viewportHeight);
  const clamped = Math.max(0, Math.min(Math.round(input.heightPx), max));
  return clamped <= NAV_HEIGHT_COLLAPSE_THRESHOLD_PX
    ? { heightPx: 0, isCollapsed: true }
    : { heightPx: clamped, isCollapsed: false };
}

/** 原 qqt（js 183810）：点击把手快速切换（展开态→收起；收起态→期望高度） */
function toggleNavHeight(input: {
  currentHeightPx: number;
  isCollapsed: boolean;
  viewportHeight: number;
}): { heightPx: number; isCollapsed: boolean } {
  return !input.isCollapsed && input.currentHeightPx > NAV_HEIGHT_COLLAPSE_THRESHOLD_PX
    ? { heightPx: 0, isCollapsed: true }
    : clampNavHeight({
        heightPx: preferredNavHeightForViewport(input.viewportHeight),
        viewportHeight: input.viewportHeight,
      });
}

/* --- 5.2 侧栏拖拽宽度（桌面形态） --- */

const SIDEBAR_RESIZING_ATTRIBUTE = "data-workspace-sidebar-resizing"; // 原 Jqt
const SIDEBAR_RESIZE_END_EVENT = "zcode:workspace-sidebar-resize-end"; // 原 Yqt
const SIDEBAR_RESIZING_ATTRIBUTE_ON = "true"; // 原 Xqt

/** 原 G5（js 183819）：拖拽中给壳/面板挂 data 属性（关闭 transition），
 *  结束时派发 resize-end 事件，供 CSS/其它组件响应。 */
function setSidebarResizingAttribute(input: {
  active: boolean;
  panelElement: HTMLElement | null;
  shellElement: HTMLElement | null;
}): void {
  for (const element of [input.shellElement, input.panelElement]) {
    if (element) {
      if (input.active) element.setAttribute(SIDEBAR_RESIZING_ATTRIBUTE, SIDEBAR_RESIZING_ATTRIBUTE_ON);
      else element.removeAttribute(SIDEBAR_RESIZING_ATTRIBUTE);
    }
  }
  if (!input.active && input.shellElement?.dispatchEvent && typeof Event < "u") {
    input.shellElement.dispatchEvent(new Event(SIDEBAR_RESIZE_END_EVENT));
  }
}

const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)"; // 原 Zqt
const COLLAPSE_NAVIGATION_ONCE_KEY = "zcode:web-remote-control:collapse-navigation-once"; // 原 K5
const DEFAULT_VIEWPORT_HEIGHT = 800; // 原 Qqt
const NAV_DRAG_THRESHOLD_PX = 4;     // 原 $qt
const DEFAULT_SIDEBAR_WIDTH_PX = 264; // 原 eJt
const MIN_SIDEBAR_WIDTH_PX = 264;     // 原 q5
const MAX_SIDEBAR_WIDTH_RATIO = 0.5;  // 原 tJt
const SIDEBAR_WIDTH_STORAGE_KEY = "zcode:workspace-shell:sidebar-width-px"; // 原 nJt
const SIDEBAR_RATIO_STORAGE_KEY =
  "react-resizable-panels:workspace-shell-layout:sidebar:content"; // 原 rJt
const SIDEBAR_KEYBOARD_STEP_PX = 16;  // 原 iJt
const SIDEBAR_PANEL_WIDTH_VAR = "--workspace-sidebar-panel-width"; // 原 aJt
const SIDEBAR_WIDTH_VAR = "--workspace-sidebar-width";             // 原 oJt
const SIDE_PANE_AUTO_COLLAPSE_THRESHOLD_PX = 480; // 原 sJt
const EMPTY_LOGS_BY_WORKSPACE_KEY: Record<string, unknown> = {}; // 原 cJt
const EMPTY_REMOTE_WORKSPACE_SESSIONS: unknown[] = []; // 原 lJt
const SIDEBAR_AUTO_COLLAPSE_THRESHOLD_PX = 360; // 原 uJt：会话列窄于此自动收侧栏
const RESIZE_DEBOUNCE_MS = 300; // 原 dJt
/** 原 fJt：主体水平分割的两个面板 id（conversation-column | browser=侧面板） */
const WORKSPACE_BODY_PANEL_IDS = ["conversation-column", "browser"];
/** 原 pJt：会话列垂直分割的两个面板 id（conversation | terminal=dock） */
const CONVERSATION_COLUMN_PANEL_IDS = ["conversation", "terminal"];

/** 原 J5（js 183841）：侧栏宽度钳制 = [264, min(∞, 容器宽×0.5)] */
function clampSidebarWidth(widthPx: number, containerWidthPx?: number): number {
  const max = containerWidthPx && containerWidthPx > 0
    ? Math.max(MIN_SIDEBAR_WIDTH_PX, containerWidthPx * MAX_SIDEBAR_WIDTH_RATIO)
    : Infinity;
  return Math.round(Math.max(MIN_SIDEBAR_WIDTH_PX, Math.min(widthPx, max)));
}

/** 原 mJt（js 183845）：读持久化侧栏宽度（localStorage） */
function readPersistedSidebarWidth(): number | null {
  if (typeof window > "u") return null;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? clampSidebarWidth(parsed) : null;
  } catch {
    return null;
  }
}

/** 原 hJt（js 183856）：读 react-resizable-panels 旧版百分比布局中的侧栏比例 */
function readPersistedSidebarRatio(): number | null {
  if (typeof window > "u") return null;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_RATIO_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const sidebar = Number((parsed as Record<string, unknown>).sidebar);
    return Number.isFinite(sidebar) && sidebar > 0 ? sidebar / 100 : null;
  } catch {
    return null;
  }
}

/** 原 Y5（js 183868）：写持久化侧栏宽度 */
function persistSidebarWidth(widthPx: number): void {
  if (typeof window > "u") return;
  try {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(Math.round(widthPx)));
  } catch { /* ignore */ }
}

/** 原 X5（js 183874）：视口高度（SSR 兜底 800） */
function viewportHeight(): number {
  return typeof window > "u" ? DEFAULT_VIEWPORT_HEIGHT : window.innerHeight || DEFAULT_VIEWPORT_HEIGHT;
}

/** 原 gJt（js 183877）：当前是否手机视口（matchMedia 初值） */
function isMobileViewportNow(): boolean {
  return (
    typeof window < "u" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(MOBILE_VIEWPORT_QUERY).matches
  );
}

/** 原 _Jt（js 183882）：消费一次性"跨工作区后收起导航"标记（sessionStorage） */
function consumeCollapseNavigationOnce(): boolean {
  if (typeof window > "u") return false;
  try {
    if (window.sessionStorage.getItem(COLLAPSE_NAVIGATION_ONCE_KEY) === "1") {
      window.sessionStorage.removeItem(COLLAPSE_NAVIGATION_ONCE_KEY);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

/** 原 vJt（js 183890）：埋设一次性收起标记 */
function armCollapseNavigationOnce(): void {
  if (typeof window > "u") return;
  try {
    window.sessionStorage.setItem(COLLAPSE_NAVIGATION_ONCE_KEY, "1");
  } catch { /* ignore */ }
}

/* ============================================================================
 * 6. useCollapsiblePanel（原 Iqt，js 183714-183777 / jsx 148181-148239）
 * ----------------------------------------------------------------------------
 * 面板开合控制器：把布尔 open 翻译成分割引擎的 expand/collapse 指令。
 *  - expandedSize：展开目标尺寸（如 dock '30%'、侧面板 '45%'）
 *  - rememberExpandedSize：收起前记住当前百分比，下次展开恢复
 *  - resizeOnInitialVisibleMount：首次挂载即展开时是否立即 resize（侧面板为 false）
 * 返回 panelRef（引擎面板句柄）/panelElementRef（DOM）/isVisible（动画后布尔）。
 * ==========================================================================*/

interface CollapsiblePanelHandle {
  resize(size: string): void;
  expand(): void;
  collapse(): void;
  getSize(): { asPercentage: number };
}

/** 原 Fqt（js 183698，接口级）：面板元素尺寸观察清理器 */
declare function observePanelElement(element: HTMLElement): (() => void) | undefined;

function useCollapsiblePanel(input: {
  open: boolean;
  alwaysMounted?: boolean;
  expandedSize?: string;
  rememberExpandedSize?: boolean;
  resizeOnInitialVisibleMount?: boolean;
}): {
  panelRef: React.RefObject<CollapsiblePanelHandle | null>;
  panelElementRef: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
} {
  const { open, alwaysMounted = false, expandedSize, rememberExpandedSize = false, resizeOnInitialVisibleMount = true } = input;
  const panelRef = React.useRef<CollapsiblePanelHandle | null>(null);
  const panelElementRef = React.useRef<HTMLElement | null>(null);
  const expandedSizeRef = React.useRef(expandedSize);
  const didInitialResizeRef = React.useRef(false);
  const [isVisible, setIsVisible] = React.useState(open);

  React.useEffect(() => {
    expandedSizeRef.current = expandedSize;
  }, [expandedSize]);

  React.useEffect(() => {
    if (alwaysMounted) {
      setIsVisible(open);
      return;
    }
    if (open) {
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
    setIsVisible(false);
  }, [alwaysMounted, open]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const element = panelElementRef.current;
    if (!didInitialResizeRef.current) {
      didInitialResizeRef.current = true;
      if (isVisible && !resizeOnInitialVisibleMount) return;
    }
    const dispose = element ? observePanelElement(element) : undefined;
    const frame = window.requestAnimationFrame(() => {
      if (isVisible) {
        const size = expandedSizeRef.current;
        if (size) {
          panel.resize(size);
          return;
        }
        panel.expand();
        return;
      }
      if (rememberExpandedSize) {
        const percentage = panel.getSize().asPercentage;
        if (Number.isFinite(percentage) && percentage > 0) {
          expandedSizeRef.current = `${percentage}%`;
        }
      }
      panel.collapse();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      dispose?.();
    };
  }, [isVisible, rememberExpandedSize, resizeOnInitialVisibleMount]);

  return { panelRef, panelElementRef, isVisible };
}

/* ============================================================================
 * 7. resolveAutomationsRunTab（原 Lqt，js 183778-183785 / jsx 148240-148247）
 * ----------------------------------------------------------------------------
 * 自动化运行历史打开会话前的目标工作区 tab 裁决：
 *  - 能激活现有 tab → accepted
 *  - 远程身份且无 tab → 拒绝（远程未连接，保留当前页）
 *  - 本地且无 tab → 补开一个本地 tab
 * ==========================================================================*/

function resolveAutomationsRunTab(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  activateTabByPath(path: string, options?: { workspaceIdentity?: string }): boolean;
  addLocalWorkspaceTab(path: string): void;
}): { accepted: boolean; openedLocalTab?: boolean; reason?: string } {
  const identity = input.workspaceIdentity?.trim();
  return input.activateTabByPath(input.workspacePath, identity ? { workspaceIdentity: identity } : undefined)
    ? { accepted: true, openedLocalTab: false }
    : identity
      ? { accepted: false, reason: "remote_attachment_missing" }
      : (input.addLocalWorkspaceTab(input.workspacePath), { accepted: true, openedLocalTab: true });
}

/* ============================================================================
 * 8. windowRoundedCornerClasses（原 Rqt，js 183782-183790 / jsx 148255-148266）
 * ----------------------------------------------------------------------------
 * Win11 内容区 section 的圆角/边框让位：
 *  - 非 Win 或未知原生圆角支持 → rounded-xl border
 *  - Win 支持原生圆角：最大化 → 去圆角只留左边框；非最大化 → rounded-xl border
 *  - Win 不支持原生圆角 → 仅左侧圆角（右侧贴原生边框）
 * ==========================================================================*/

function windowRoundedCornerClasses(input: {
  isWindowsDesktop: boolean;
  isWindowsMaximized: boolean;
  supportsNativeRoundedCorners: boolean | null;
}): string {
  return !input.isWindowsDesktop || input.supportsNativeRoundedCorners === null
    ? "rounded-xl border border-border"
    : input.supportsNativeRoundedCorners
      ? input.isWindowsMaximized
        ? "rounded-none border-l border-border"
        : "rounded-xl border border-border"
      : "rounded-l-xl border border-border";
}

/* ============================================================================
 * 9. 会话持久化（原 RTt/j2/zTt/BTt/VTt/HTt，js 123122-123177 / jsx 104862-104880）
 * ----------------------------------------------------------------------------
 * 'zcode-v4-last-session:v1:{workspaceKey}' 记忆每工作区最后会话；
 * 渲染器重载（非热切换）且当前无活动会话、无草稿焦点时自动恢复。
 * ==========================================================================*/

const LAST_SESSION_STORAGE_PREFIX = "zcode-v4-last-session:v1:"; // 原 RTt

/** 原 j2 */
function lastSessionStorageKey(workspaceKey: string): string {
  return `${LAST_SESSION_STORAGE_PREFIX}${workspaceKey}`;
}

/** 原 zTt */
function readLastSessionId(workspaceKey: string): string | null {
  try {
    return localStorage.getItem(lastSessionStorageKey(workspaceKey));
  } catch {
    return null;
  }
}

/** 原 BTt：sessionId 为 null/空 时删除键 */
function writeLastSessionId(workspaceKey: string, sessionId: string | null): void {
  try {
    if (sessionId) localStorage.setItem(lastSessionStorageKey(workspaceKey), sessionId);
    else localStorage.removeItem(lastSessionStorageKey(workspaceKey));
  } catch { /* ignore */ }
}

/** 原 VTt：仅在"渲染器重载 + 无活动会话 + 草稿焦点版本为 0"时恢复 */
function shouldRestoreLastSession(input: {
  enabled: boolean;
  rendererReload: boolean;
  activeSessionId: string | null;
  draftFocusVersion: number;
}): boolean {
  return (
    input.enabled &&
    input.rendererReload &&
    input.activeSessionId === null &&
    input.draftFocusVersion === 0
  );
}

/** 原 HTt（js 123141-123177）：每工作区只恢复一次；之后持续写回当前会话 */
function useLastSessionPersistence(input: {
  workspaceKey: string;
  activeSessionId: string | null;
  draftFocusVersion: number;
  enabled?: boolean;
  selectSession: (sessionId: string) => void;
}): void {
  const { workspaceKey, activeSessionId, draftFocusVersion, enabled = true, selectSession } = input;
  const attemptedWorkspaceKeysRef = React.useRef(new Set<string>());
  const isRendererReloadRef = React.useRef(detectRendererReload());
  const pendingRestoreRef = React.useRef<{ workspaceKey: string; sessionId: string } | null>(null);
  const selectSessionRef = React.useRef(selectSession);
  selectSessionRef.current = selectSession;

  React.useEffect(() => {
    if (!enabled || attemptedWorkspaceKeysRef.current.has(workspaceKey)) return;
    attemptedWorkspaceKeysRef.current.add(workspaceKey);
    const wasRendererReload = isRendererReloadRef.current;
    isRendererReloadRef.current = false;
    if (
      !shouldRestoreLastSession({
        activeSessionId,
        draftFocusVersion,
        enabled,
        rendererReload: wasRendererReload,
      })
    ) {
      if (activeSessionId === null) writeLastSessionId(workspaceKey, null);
      return;
    }
    const lastSessionId = readLastSessionId(workspaceKey);
    if (lastSessionId) {
      pendingRestoreRef.current = { workspaceKey, sessionId: lastSessionId };
      selectSessionRef.current(lastSessionId);
    }
  }, [enabled, workspaceKey]);

  React.useEffect(() => {
    if (enabled && attemptedWorkspaceKeysRef.current.has(workspaceKey)) {
      if (pendingRestoreRef.current?.workspaceKey === workspaceKey) {
        if (activeSessionId === null) return;
        pendingRestoreRef.current = null;
      }
      writeLastSessionId(workspaceKey, activeSessionId);
    }
  }, [activeSessionId, enabled, workspaceKey]);
}

/* ============================================================================
 * 10. 侧栏会话投放上下文（原 FTt/ITt/LTt，js 123103-123120 / jsx 104799-104814）
 * ----------------------------------------------------------------------------
 * 侧栏内任务行拖拽到聊天区时的"能否投放/如何打开"能力注入。
 * ==========================================================================*/

interface SidebarSessionDropValue {
  enabled: boolean;
  canOpenSession(target: SessionBinding): boolean;
  openSession(target: SessionBinding): void;
}

const SidebarSessionDropContext = React.createContext<SidebarSessionDropValue>({
  enabled: false,
  canOpenSession: () => false,
  openSession: () => {},
}); // 原 FTt

/** 原 ITt（js 123104-123117） */
export function SidebarSessionDropProvider({
  enabled,
  canOpenSession,
  onOpenSession,
  children,
}: {
  enabled: boolean;
  canOpenSession: (target: SessionBinding) => boolean;
  onOpenSession: (target: SessionBinding) => void;
  children?: React.ReactNode;
}) {
  const latestRef = React.useRef({ canOpenSession, onOpenSession });
  latestRef.current = { canOpenSession, onOpenSession };
  const value = React.useMemo<SidebarSessionDropValue>(
    () => ({
      enabled,
      canOpenSession: (target) => enabled && latestRef.current.canOpenSession(target),
      openSession: (target) => {
        if (enabled) latestRef.current.onOpenSession(target);
      },
    }),
    [enabled],
  );
  return <SidebarSessionDropContext.Provider value={value}>{children}</SidebarSessionDropContext.Provider>;
}

/** 原 LTt（js 123118） */
export function useSidebarSessionDrop(): SidebarSessionDropValue {
  return React.useContext(SidebarSessionDropContext);
}

/* ============================================================================
 * 11. 叶子组件接口（其它族根组件；完整 JSX 见各自行号或已抽取模块）
 * ==========================================================================*/

/** 原 TFt SessionHeader（TopBar.tsx 已完整还原，js 144008） */
/** 原 BOt TopBarOverlay（TopBar.tsx 已完整还原，js 129516） */
/** 原 S6 WindowsCaptionMenu（TopBar.tsx 已完整还原，js 141854） */
/** 原 U6 HelpMenu（TopBar.tsx 已完整还原，js 143345） */
/** 原 H6 TerminalToggleButton（TopBar.tsx 已完整还原，js 143316） */
/** 原 zZ GitBranchChip（TopBar.tsx 已完整还原，js ~96589） */
/** 原 c4 windowsCaptionInsetStyle（TopBar.tsx 已还原，js 129509） */
/** 原 s4 WINDOWS_CAPTION_RIGHT_INSET_VAR（TopBar.tsx 已还原，js 129507） */

/** 原 a4 WorkspaceSelectionRow（F02 副根，js 128568-128795）：
 *  草稿 composer 头部的工作区选择行（最近项目/分离/远程连接入口） */

/** 原 rVt Sidebar（F01 根，js 159137-160322 / jsx 132075）：
 *  aside flex h-full flex-col = h-12 drag 条 + 导航 4 行 + 分段行 + 任务/项目列表 + 页脚 */
declare const Sidebar: React.FC<Record<string, unknown>>; // 属主 Sidebar.tsx 已导出 WorkspaceSidebar（rVt）；调用面 10 处类型未收敛，暂保留 declare

/** 原 xqt SidePanel（F04 根，js 182519-183363 / jsx 147333）：
 *  右侧多标签面板（文件树/Git/白板/轨迹/子代理目录…）。
 *  §13.6 中记作 Dr 右摘要栏（与整个会话列并排的右列）。 */

/** 原 Mqt DockTerminalBrowserPanel（F13 根，js 183602-183895 / jsx 148118）：
 *  Z4 id='terminal' border-t minSize 140px maxSize 50%，内含 jqt 终端/浏览器标签页。
 *  §13.7：dock 在会话列内部（聊天下方）。 */
declare const DockTerminalBrowserPanel: React.FC<Record<string, unknown>>;

/** 原 PTt ConversationOrchestrator（F03 编排器，js 122803-123102 / jsx 104572）：
 *  会话面板编排（消息流/草稿/摘要栏装配；内嵌 R0 会话面板 + hit 草稿头） */

/** 原 owt StackedConversationPane（F03 变体，js 121284）：
 *  Web 远控堆叠形态用的会话面板（chatContent 插槽） */
declare const StackedConversationPane: React.FC<Record<string, unknown>>;

/** 原 nPt TaskFindDialog（F05 副根，js 139949 / jsx 116646）：
 *  任务内查找对话框（placement: chat/side-pane） */
declare const TaskFindDialog: React.FC<Record<string, unknown> & { placement: "chat" | "side-pane" }>;

/** 原 l3 RepoWikiMain（F16 根，js 132306-133070 / jsx 111550） */
declare const RepoWikiMain: React.FC<Record<string, unknown>>;

/** 原 d6 AutomationsMain（F15 根，js 138823-139924 / jsx 115911）
 *  已接线：ExtendedViews.tsx §6.10（d6 视图态全量展开） */

/** 原 JPt WebRemoteMobileShell（F17，js 141584）：
 *  手机端远控壳（导航抽屉 + 聊天内容 + 侧面板覆盖层） */

/* ============================================================================
 * 12. WorkspaceShell（原 yJt，js 183896-185431 / jsx 148387-149354）
 * ----------------------------------------------------------------------------
 * §13.6 三分体的实现本体。布局树（桌面形态）：
 *
 *  WindowShell(l4)  title=`ZCode / {basename}`
 *  └─ div[data-workspace-shell]  relative flex h-full w-full overflow-hidden
 *     │   style: --workspace-sidebar-panel-width / --workspace-sidebar-width
 *     ├─ div[data-panel][id=sidebar]  w-[var(--workspace-sidebar-panel-width)]
 *     │  │   max-w-[50%] transition-[width,opacity]（隐藏态宽 4px/0 + opacity-0）
 *     │  └─ aside(ref=sidebarContainerRef)
 *     │     └─ ScopedErrorBoundary(scope=workspace-sidebar)
 *     │        └─ SidebarSessionDropProvider(ITt)
 *     │           └─ Sidebar(rVt)                      ← F01
 *     ├─ div[role=separator][data-testid=resizable-handle]（侧栏拖拽宽度）
 *     ├─ div[data-panel][id=content]  flex min-w-[320px] flex-1 flex-col
 *     │  │   （Mac: p-1 pl-0 pt-0 + 顶部 h-1 drag 条）
 *     │  └─ section  relative flex min-h-0 flex-1 flex-col overflow-hidden
 *     │     │   bg-background + Win 圆角让位(Rqt)
 *     │     ├─ 头部三态：
 *     │     │   Ar: ScopedErrorBoundary(workspace-header,compact,border-b) > SessionHeader(TFt)
 *     │     │   jr: header[data-testid=new-task-draft-drag-region] h-10 drag
 *     │     │       右簇 [U6 帮助][H6 终端]（Mr 分支时让位，不渲染）
 *     │     │   否则: 无头部
 *     │     ├─ (远控) 导航高度拖拽把手 Button(grip-horizontal)
 *     │     ├─ 主视图三分支：
 *     │     │   repo-wiki  → main > ScopedErrorBoundary(repo-wiki-main) > RepoWikiMain(l3)
 *     │     │   automations→ main[id=automations-main-toast-anchor] > drag 条 + 滚动区
 *     │     │                > ScopedErrorBoundary(automations-main) > AutomationsMain(d6)
 *     │     │   chat(默认) → X4(workspace-body-layout, ['conversation-column','browser'])
 *     │     │     ├─ Z4#conversation-column minSize 35%（远控 0px；侧面板开时 defaultSize 52%）
 *     │     │     │  └─ X4 vertical(workspace-conversation-column-layout, ['conversation','terminal'])
 *     │     │     │     ├─ Z4#conversation minSize 35%（elementRef 供窄度检测）
 *     │     │     │     │  └─ main > [TaskFindDialog(nPt) + ScopedErrorBoundary(workspace-chat)
 *     │     │     │     │            > ConversationOrchestrator(PTt)]
 *     │     │     │     └─ DockTerminalBrowserPanel(Mqt)   ← dock 在会话列内、聊天下方
 *     │     │     └─ SidePanel(xqt)                        ← Dr 右摘要栏，与整个会话列并排
 *     ├─ ScopedErrorBoundary(desktop-top-overlay) > TopBarOverlay(BOt)
 *     ├─ (Mr) ScopedErrorBoundary(draft-caption-menu) > div.absolute.top-0.z-30.h-12
 *     │        [H6 终端][S6 ⌄菜单]（Win: caption 让位样式；Linux: right-[120px]）
 *     ├─ (Linux 桌面) div.absolute.right-0.top-0.z-30.h-12.w-[120px] > LinuxWindowControls(tkt)
 *     └─ (远控切换任务中) 全屏 loading 遮罩 common.loading
 *
 * 另：Web 远控 + 手机视口 + 有切换器时改走 JPt 移动壳分支（见返回段）。
 * ==========================================================================*/

type WorkspaceMainView = "chat" | "automations" | "repo-wiki";

/** 原 tn 投影：传给壳的工作区 tab 摘要（无 kind/id 内部字段） */
interface WorkspaceTabSummary {
  workspacePath: string;
  label?: string;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
  workspaceIdentity?: string | null;
  workspacePurpose?: "project" | "conversation" | "scratch";
  localWorkspacePath?: string | null;
  availability?: string;
}

interface WorkspaceShellProps {
  services: WorkspaceServices;
  workspaceReadOnlyReason?: string;
  workspaceMainView: WorkspaceMainView;
  openAutomationId?: string | null;
  onWorkspaceMainViewChange: (view: WorkspaceMainView) => void;
  onOpenAutomationConsumed?: () => void;
  handleOpenAutomations: (automationId?: string) => void;
  onConnectRemote?: (...args: unknown[]) => void;
  onSelectRemoteProject?: (...args: unknown[]) => void;
  onCancelRemoteProject?: (...args: unknown[]) => void;
  onReconnectRemoteWorkspace?: (...args: unknown[]) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  user?: unknown;
  reconnectingRemoteWorkspaceKeys?: string[];
  remoteWorkspaceErrorByWorkspaceKey?: Record<string, string>;
  reconnectingRemoteWorkspaceLogsByWorkspaceKey?: Record<string, unknown>;
  onCreateTask?: (options?: { initialPrompt?: string }) => void;
  onCreateConversationTask?: (options?: { initialPrompt?: string }) => void;
  onResolveConversationWorkspace?: () => Promise<string>;
  onOpenWorkspace?: () => void;
  onOpenFolderFromWorkspaceMenu?: (...args: unknown[]) => void;
  onOpenRemoteWorkspace?: (...args: unknown[]) => void;
  onCreateScratchWorkspace?: () => void;
  allowOpenWorkspace?: boolean;
  webRemoteControlWorkspaceSwitcher?: unknown;
  initialWebRemoteControlMobileNavigationIntent?: unknown;
  initialWebRemoteControlWorkspaceList?: unknown;
  webRemoteControlTerminalTransportState?: unknown;
  allowRemoteWorkspace?: boolean;
  remoteWorkspaceSessions?: unknown[];
  workspaceAbsPath: string;
  workspaceRemoteSessionId?: string;
  workspaceIdentity?: string;
  isWorkspaceVisible?: boolean;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  workspaceShellZCodeState: WorkspaceStateSlice;
  theme: string;
  isMacFullscreen: boolean;
  desktopWindowChromeState: DesktopWindowChromeState | null;
  macWindowControlsLeftPaddingPx?: number;
  windowsWindowControlsRightPaddingPx?: number;
  updateReadyVersion?: string | null;
  updateState?: UpdateState | null;
  sidebarContainerRef?: React.RefObject<HTMLElement | null>;
  toggleSidebarShortcutLabel?: string;
  newTaskShortcutLabel?: string;
  goBackShortcutLabel?: string;
  goForwardShortcutLabel?: string;
  toggleSidePaneShortcutLabel?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  canTaskNavBack: boolean;
  canTaskNavForward: boolean;
  isTerminalOpen: boolean;
  isSidebarVisible: boolean;
  isSidePaneOpen: boolean;
  isBrowserOpen: boolean;
  supportsEmbeddedBrowser: boolean;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: string | null) => void;
  sidePaneState: SidePaneState | null;
  recentClosedSidePaneTabs: RecentClosedSidePaneTab[];
  projectName: string;
  workspaceTabs: WorkspaceTabSummary[];
  activeTaskId: string | null;
  sidePaneOwnerId: string | null;
  activeTraceId?: string | null;
  activeSessionId?: string | null;
  activeTaskProvider?: string | null;
  resolvedActiveTaskMeta?: unknown;
  activeTaskTitle?: string | null;
  activeTaskChangeSummary?: string | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: { added: number; removed: number } | null;
  activeGitSourceId?: string;
  gitState: GitState;
  browserNavigationRequest?: unknown;
  browserRestoreUrls?: Record<string, string>;
  providerConfigFile: TaskFileRef;
  taskNativeSessionLogFile: TaskFileRef;
  taskSessionFile: TaskFileRef;
  testMessages?: unknown[] | null;
  conversationFindActiveIndex?: number;
  conversationFindQuery?: string;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex?: number }) => void;
  searchResultHighlightRequest?: SearchResultHighlightRequest | null;
  onSearchResultHighlightDone?: (requestId: number) => void;
  fileChangeFindActiveIndex?: number;
  fileChangeFindNavigationRequestId?: number;
  fileChangeFindQuery?: string;
  onFileChangeFindMatchCountChange?: (count: number) => void;
  appLogoUrl: string;
  platform: PlatformService;
  reloadSessionDisabled: boolean;
  reloadSessionPending: boolean;
  handleReloadSession: (options?: { provider?: string; resumeTaskId?: string }) => void;
  handleSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string) => void;
  handleTaskNavBack: () => void;
  handleTaskNavForward: () => void;
  handleStartDraftInWorkspace: (workspacePath: string, workspaceIdentity?: string, purpose?: string) => void;
  handleOpenCommandCenter: () => void;
  handleRefreshGit: () => void;
  handleBrowserUrlChange: (tabId: string, url: string) => void;
  handleBrowserPageMetadataChange: (input: unknown) => void;
  handleToggleSidebar: () => void;
  handleToggleTerminal: () => void;
  handleToggleBrowser: () => void;
  handleOpenBrowserTab: () => void;
  handleOpenTreemapping: (...args: unknown[]) => void;
  handleOpenWhiteboard: () => void;
  handleOpenDeveloperTools: () => void;
  handleOpenTerminalTab: () => void;
  handleToggleGit: () => void;
  handleOpenGitReview: (sourceId?: string) => void;
  handleToggleSidePane: () => void;
  handleOpenBrowserUrl: (url: string) => void;
  handleOpenCodeViewer: (source: CodeViewerSource) => void;
  handleOpenSubagentSession: (sessionId: string) => void;
  handleOpenSubagentDirectory: () => void;
  handleSyncSubagentSessionTabs: () => void;
  handleOpenSelectionSideChat: (sessionId: string) => void;
  handleOpenPlanDetail: (planId?: string) => void;
  handleCloseCodeViewer: (tabId: string) => void;
  handleCloseGit: () => void;
  handleActivateSidePaneTab: (tabId: string) => void;
  handleReorderSidePaneTab: (input: unknown) => void;
  handleCloseSidePaneTab: (tabId: string) => void;
  handleCloseOtherSidePaneTabs: (tabId: string) => void;
  handleCloseAllSidePaneTabs: () => void;
  handleReopenClosedSidePaneTab: (tabId: string) => void;
  handleBrowserNavigationRequestHandled: (requestId: unknown) => void;
  setIsTerminalOpen: (open: boolean) => void;
  setGitSelectedSourceId: (sourceId: string) => void;
  taskFindDialogProps: TaskFindDialogProps;
  /* 以下四项由 XJt 透传、yJt 本体未解构使用（签名保真） */
  remoteConnectionLogs?: unknown[];
  remoteConnectionInProgress?: boolean;
  isGitOpen?: boolean;
  shellPanelIds?: string[];
}

interface SearchResultHighlightRequest {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string;
  requestId?: number;
  [key: string]: unknown;
}

interface CodeViewerSource {
  type: string;
  title?: string;
  path?: string;
  workspacePath?: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
  [key: string]: unknown;
}

interface TaskFindDialogProps {
  open: boolean;
  focusRequestId?: number;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  isLinuxDesktop?: boolean;
  conversationMatchCount?: number;
  conversationMatchIndex?: number;
  fileChangeMatchCount?: number;
  fileChangeMatchIndex?: number;
  onOpenChange?: (open: boolean) => void;
  onConversationFindChange?: (query: string, activeIndex: number) => void;
  onConversationFindNavigate?: (query: string, activeIndex: number) => void;
  onFileChangeFindChange?: (query: string, activeIndex: number) => void;
  onFileChangeFindNavigate?: (query: string, activeIndex: number) => void;
  onOpenFileChanges?: () => void;
}

interface PrimaryDraftDropTargetController {
  active: boolean;
  onDragOver: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}

export const WorkspaceShell = React.memo(function WorkspaceShell(props: WorkspaceShellProps) {
  const {
    services,
    workspaceReadOnlyReason,
    workspaceMainView,
    openAutomationId,
    onWorkspaceMainViewChange,
    onOpenAutomationConsumed,
    handleOpenAutomations,
    onConnectRemote,
    onSelectRemoteProject,
    onCancelRemoteProject,
    onReconnectRemoteWorkspace,
    onLogout,
    onLogin,
    user,
    reconnectingRemoteWorkspaceKeys,
    remoteWorkspaceErrorByWorkspaceKey,
    reconnectingRemoteWorkspaceLogsByWorkspaceKey = EMPTY_LOGS_BY_WORKSPACE_KEY,
    onCreateTask,
    onCreateConversationTask,
    onResolveConversationWorkspace,
    onOpenWorkspace,
    onOpenFolderFromWorkspaceMenu,
    onOpenRemoteWorkspace,
    onCreateScratchWorkspace,
    allowOpenWorkspace = true,
    webRemoteControlWorkspaceSwitcher,
    initialWebRemoteControlMobileNavigationIntent,
    initialWebRemoteControlWorkspaceList,
    webRemoteControlTerminalTransportState,
    allowRemoteWorkspace = true,
    remoteWorkspaceSessions = EMPTY_REMOTE_WORKSPACE_SESSIONS,
    workspaceAbsPath,
    workspaceRemoteSessionId,
    workspaceIdentity,
    isWorkspaceVisible = true,
    isDesktop,
    isMacDesktop,
    isWindowsDesktop,
    workspaceShellZCodeState,
    theme,
    isMacFullscreen,
    desktopWindowChromeState,
    macWindowControlsLeftPaddingPx,
    windowsWindowControlsRightPaddingPx = 136,
    updateReadyVersion,
    updateState,
    sidebarContainerRef,
    toggleSidebarShortcutLabel,
    newTaskShortcutLabel,
    goBackShortcutLabel,
    goForwardShortcutLabel,
    toggleSidePaneShortcutLabel,
    canGoBack,
    canGoForward,
    canTaskNavBack,
    canTaskNavForward,
    isTerminalOpen,
    isSidebarVisible,
    isSidePaneOpen,
    isBrowserOpen,
    supportsEmbeddedBrowser,
    summaryPanelVariantOverride,
    onSummaryPanelVariantOverrideChange,
    sidePaneState,
    recentClosedSidePaneTabs,
    projectName,
    workspaceTabs,
    activeTaskId,
    sidePaneOwnerId,
    activeTraceId,
    activeSessionId,
    activeTaskProvider,
    resolvedActiveTaskMeta,
    activeTaskTitle,
    activeTaskChangeSummary,
    gitWorktreeReviewSourceId,
    gitWorktreeChangeSummary,
    activeGitSourceId,
    gitState,
    browserNavigationRequest,
    browserRestoreUrls,
    providerConfigFile,
    taskNativeSessionLogFile,
    taskSessionFile,
    testMessages,
    conversationFindActiveIndex,
    conversationFindQuery,
    onConversationFindMatchStateChange,
    searchResultHighlightRequest,
    onSearchResultHighlightDone,
    fileChangeFindActiveIndex,
    fileChangeFindNavigationRequestId,
    fileChangeFindQuery,
    onFileChangeFindMatchCountChange,
    appLogoUrl,
    platform,
    reloadSessionDisabled,
    reloadSessionPending,
    handleReloadSession,
    handleSelectTask,
    handleTaskNavBack,
    handleTaskNavForward,
    handleStartDraftInWorkspace,
    handleOpenCommandCenter,
    handleRefreshGit,
    handleBrowserUrlChange,
    handleBrowserPageMetadataChange,
    handleToggleSidebar,
    handleToggleTerminal,
    handleToggleBrowser,
    handleOpenBrowserTab,
    handleOpenTreemapping,
    handleOpenWhiteboard,
    handleOpenDeveloperTools,
    handleOpenTerminalTab,
    handleToggleGit,
    handleOpenGitReview,
    handleToggleSidePane,
    handleOpenBrowserUrl,
    handleOpenCodeViewer,
    handleOpenSubagentSession,
    handleOpenSubagentDirectory,
    handleSyncSubagentSessionTabs,
    handleOpenSelectionSideChat,
    handleOpenPlanDetail,
    handleCloseCodeViewer,
    handleCloseGit,
    handleActivateSidePaneTab,
    handleReorderSidePaneTab,
    handleCloseSidePaneTab,
    handleCloseOtherSidePaneTabs,
    handleCloseAllSidePaneTabs,
    handleReopenClosedSidePaneTab,
    handleBrowserNavigationRequestHandled,
    setIsTerminalOpen,
    setGitSelectedSourceId,
    taskFindDialogProps,
    remoteConnectionLogs,
    remoteConnectionInProgress,
    isGitOpen,
    shellPanelIds,
  } = props;

  void isWorkspaceVisible; void testMessages; void onCreateScratchWorkspace;
  void remoteConnectionLogs; void isGitOpen; void shellPanelIds; void remoteConnectionInProgress;

  const { intl } = useIntlContext();
  const workspaceTabsStore = useWorkspaceTabsStore(); // 原 zt = hc()
  const isLinuxDesktop = !!(isDesktop && !isMacDesktop && !isWindowsDesktop); // 原 Bt
  const isWebRemoteControlShell = !!webRemoteControlWorkspaceSwitcher; // 原 Vt
  /** 侧栏隐藏时面板保留宽度：Mac 4px（让圆角连续），其余 0 */
  const macHiddenSidebarWidthPx = isMacDesktop ? 4 : 0; // 原 Ht

  /* --- Web 远控导航抽屉状态（手机视口） --- */
  const [webRemoteNavCollapsed, setWebRemoteNavCollapsed] = React.useState<boolean>(() =>
    isWebRemoteControlShell ? consumeCollapseNavigationOnce() : false,
  ); // 原 [Ut, Wt]
  const [webRemoteNavHeightPx, setWebRemoteNavHeightPx] = React.useState<number>(() => {
    const viewport = viewportHeight();
    return clampNavHeight({ heightPx: preferredNavHeightForViewport(viewport), viewportHeight: viewport }).heightPx;
  }); // 原 [Gt, Kt]
  const [webRemoteTaskSwitching, setWebRemoteTaskSwitching] = React.useState(false); // 原 [qt, Jt]
  const [primaryDraftDropTargetController, setPrimaryDraftDropTargetController] =
    React.useState<PrimaryDraftDropTargetController | null>(null); // 原 [Yt, Xt]
  const fileTreeOpenRequestIdRef = React.useRef(0); // 原 Zt
  const [fileTreeOpenRequest, setFileTreeOpenRequest] = React.useState<{ id: number; target: unknown } | null>(null); // 原 [Qt, $t]
  const [isFileTreeOpen, setIsFileTreeOpen] = React.useState(false); // 原 [en, tn]
  const [isMobileViewport, setIsMobileViewport] = React.useState(isMobileViewportNow); // 原 [nn, rn]
  const [isWebRemoteNavDragging, setIsWebRemoteNavDragging] = React.useState(false); // 原 [an, on]
  const webRemoteNavHeightPxRef = React.useRef(webRemoteNavHeightPx); // 原 sn
  const webRemoteNavCollapsedRef = React.useRef(webRemoteNavCollapsed); // 原 cn
  const webRemoteNavDragStateRef = React.useRef<{
    pointerId: number;
    startHeightPx: number;
    startY: number;
    didDrag: boolean;
  } | null>(null); // 原 ln
  const webRemoteNavPointerUsedRef = React.useRef(false); // 原 un
  const workspaceKey = workspaceIdentity?.trim() || workspaceAbsPath; // 原 dn

  /* --- 最后会话恢复（§13 之外的持久化行为；原 HTt 调用现场 184056） --- */
  useLastSessionPersistence({
    workspaceKey,
    activeSessionId: activeTaskId,
    draftFocusVersion: workspaceShellZCodeState.draftFocusVersion,
    enabled: !isWebRemoteControlShell,
    selectSession: (sessionId) => handleSelectTask(workspaceAbsPath, sessionId, workspaceIdentity),
  });

  const shellElementRef = React.useRef<HTMLDivElement | null>(null); // 原 fn
  const sidebarPanelElementRef = React.useRef<HTMLDivElement | null>(null); // 原 pn
  const conversationElementRef = React.useRef<HTMLElement | null>(null); // 原 mn
  const autoCollapseStateRef = React.useRef({
    handleToggleSidebar,
    handleToggleSidePane,
    isSidebarVisible,
    isSidePaneOpen,
    workspaceKey,
  }); // 原 hn
  const resizeDebounceTimerRef = React.useRef<number | null>(null); // 原 gn
  const sidebarDragStateRef = React.useRef<{
    containerWidthPx: number;
    pointerId: number;
    startWidthPx: number;
    startX: number;
  } | null>(null); // 原 _n
  const [sidebarWidthPx, setSidebarWidthPx] = React.useState<number>(
    () => readPersistedSidebarWidth() ?? DEFAULT_SIDEBAR_WIDTH_PX,
  ); // 原 [vn, yn]
  const sidebarWidthPxRef = React.useRef(sidebarWidthPx); // 原 bn
  const openWorkspaceKeys = React.useMemo(
    () => workspaceTabs.map((tab) => tab.workspaceIdentity?.trim() || tab.workspacePath),
    [workspaceTabs],
  ); // 原 xn
  const isSidebarPanelVisible = isSidebarVisible; // 原 Sn

  /* --- dock（终端/浏览器）与侧面板的开合控制器（原 Iqt 两次调用） --- */
  const {
    panelRef: dockPanelRef,
    panelElementRef: dockPanelElementRef,
    isVisible: isDockVisible,
  } = useCollapsiblePanel({ open: isTerminalOpen, expandedSize: "30%", rememberExpandedSize: true }); // 原 Cn/wn/Tn
  const {
    panelRef: sidePanePanelRef,
    panelElementRef: sidePanePanelElementRef,
    isVisible: isSidePaneVisible,
  } = useCollapsiblePanel({
    open: isSidePaneOpen,
    expandedSize: "45%",
    rememberExpandedSize: true,
    resizeOnInitialVisibleMount: false,
  }); // 原 En/Dn/On
  const mobileSidePanePanelRef = React.useRef<unknown>(null); // 原 kn
  const mobileSidePanePanelElementRef = React.useRef<unknown>(null); // 原 An

  const reloadSessionDisabledEffective = !!workspaceReadOnlyReason || reloadSessionDisabled || reloadSessionPending; // 原 jn
  const simplifyForNarrowRemote = isWebRemoteControlShell && isMobileViewport; // 原 Mn
  const showNewTaskButton = !isSidebarVisible || isFileTreeOpen; // 原 Nn
  const resizeSidebarLabel = intl.formatMessage({ id: "workspaceSidebar.resizeSidebar" }); // 原 Pn

  React.useEffect(() => {
    autoCollapseStateRef.current = {
      handleToggleSidebar,
      handleToggleSidePane,
      isSidebarVisible,
      isSidePaneOpen,
      workspaceKey,
    };
  }, [handleToggleSidebar, handleToggleSidePane, isSidebarVisible, isSidePaneOpen, workspaceKey]);

  /* --- 会话列过窄时自动收起侧栏/右侧面板（原 184111-184160）
       仅 chat 主视图生效；阈值：侧面板 480px、侧栏 360px；resize 防抖 300ms --- */
  React.useEffect(() => {
    if (workspaceMainView !== "chat" || typeof window > "u") return;
    const measureConversationWidth = () =>
      conversationElementRef.current?.getBoundingClientRect().width ?? null;
    const collapseSidebarIfNarrow = () => {
      const width = measureConversationWidth();
      if (width === null) return;
      const { handleToggleSidebar: toggleSidebar, isSidebarVisible: sidebarVisible, workspaceKey: currentKey } =
        autoCollapseStateRef.current;
      if (
        sidebarVisible &&
        width < SIDEBAR_AUTO_COLLAPSE_THRESHOLD_PX
      ) {
        logger.info("[WorkspaceShellLayout] conversation 过窄，自动收起左侧栏", {
          widthPx: Math.round(width),
          thresholdPx: SIDEBAR_AUTO_COLLAPSE_THRESHOLD_PX,
          workspaceKey: currentKey,
        });
        toggleSidebar();
      }
    };
    const collapsePanelsIfNarrow = () => {
      const width = measureConversationWidth();
      if (width === null) return;
      const {
        handleToggleSidePane: toggleSidePane,
        isSidePaneOpen: sidePaneOpen,
        workspaceKey: currentKey,
      } = autoCollapseStateRef.current;
      if (sidePaneOpen && width < SIDE_PANE_AUTO_COLLAPSE_THRESHOLD_PX) {
        logger.info("[WorkspaceShellLayout] conversation 过窄，自动收起右侧面板", {
          widthPx: Math.round(width),
          thresholdPx: SIDE_PANE_AUTO_COLLAPSE_THRESHOLD_PX,
          workspaceKey: currentKey,
        });
        toggleSidePane();
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(collapseSidebarIfNarrow);
        });
        return;
      }
      collapseSidebarIfNarrow();
    };
    const handleResize = () => {
      if (resizeDebounceTimerRef.current !== null) window.clearTimeout(resizeDebounceTimerRef.current);
      resizeDebounceTimerRef.current = window.setTimeout(() => {
        resizeDebounceTimerRef.current = null;
        collapsePanelsIfNarrow();
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (resizeDebounceTimerRef.current !== null) {
        window.clearTimeout(resizeDebounceTimerRef.current);
        resizeDebounceTimerRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [workspaceMainView]);

  React.useEffect(() => {
    sidebarWidthPxRef.current = sidebarWidthPx;
  }, [sidebarWidthPx]);

  /** 原 Fn（184163）：把侧栏宽度写入壳元素 CSS 变量（隐藏时面板宽 = Mac 4px/0） */
  const applySidebarWidthPx = React.useCallback(
    (widthPx: number) => {
      sidebarWidthPxRef.current = widthPx;
      const shell = shellElementRef.current;
      if (shell) {
        shell.style.setProperty(
          SIDEBAR_PANEL_WIDTH_VAR,
          `${isSidebarPanelVisible ? widthPx : macHiddenSidebarWidthPx}px`,
        );
        shell.style.setProperty(SIDEBAR_WIDTH_VAR, `${widthPx}px`);
      }
    },
    [macHiddenSidebarWidthPx, isSidebarPanelVisible],
  );

  /* --- 首次挂载：从旧版百分比布局迁移侧栏宽度（原 184173-184182） --- */
  React.useEffect(() => {
    if (readPersistedSidebarWidth() !== null) return;
    const ratio = readPersistedSidebarRatio();
    const shell = shellElementRef.current;
    if (ratio === null || !shell) return;
    const containerWidth = shell.getBoundingClientRect().width;
    if (!Number.isFinite(containerWidth) || containerWidth <= 0) return;
    const migrated = clampSidebarWidth(containerWidth * ratio, containerWidth);
    sidebarWidthPxRef.current = migrated;
    setSidebarWidthPx(migrated);
    persistSidebarWidth(migrated);
  }, []);

  /** 原 In（184184）：提交新宽度（可选持久化） */
  const commitSidebarWidthPx = React.useCallback((widthPx: number, options: { persist: boolean }) => {
    const containerWidth = shellElementRef.current?.getBoundingClientRect().width;
    const clamped = clampSidebarWidth(widthPx, containerWidth);
    sidebarWidthPxRef.current = clamped;
    setSidebarWidthPx((previous) => (previous === clamped ? previous : clamped));
    if (options.persist) persistSidebarWidth(clamped);
    return clamped;
  }, []);

  /** 原 Ln（184190）：侧栏分隔条 pointerdown（仅鼠标左键/触摸） */
  const handleSidebarResizePointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!isSidebarPanelVisible || (event.pointerType === "mouse" && event.button !== 0)) return;
      const shell = shellElementRef.current;
      if (shell) {
        sidebarDragStateRef.current = {
          containerWidthPx: shell.getBoundingClientRect().width,
          pointerId: event.pointerId,
          startWidthPx: sidebarWidthPxRef.current,
          startX: event.clientX,
        };
        setSidebarResizingAttribute({
          active: true,
          panelElement: sidebarPanelElementRef.current,
          shellElement: shell,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    },
    [isSidebarPanelVisible],
  );

  /** 原 Rn（184202）：拖拽中实时应用宽度 + aria-valuenow */
  const handleSidebarResizePointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const drag = sidebarDragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const next = clampSidebarWidth(drag.startWidthPx + event.clientX - drag.startX, drag.containerWidthPx);
      applySidebarWidthPx(next);
      event.currentTarget.setAttribute("aria-valuenow", String(Math.round(next)));
    },
    [applySidebarWidthPx],
  );

  /** 原 zn（184215）：拖拽结束（cancel=true 不持久化） */
  const handleSidebarResizePointerUp = React.useCallback((event: React.PointerEvent, cancel = false) => {
    const drag = sidebarDragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    sidebarDragStateRef.current = null;
    setSidebarResizingAttribute({
      active: false,
      panelElement: sidebarPanelElementRef.current,
      shellElement: shellElementRef.current,
    });
    setSidebarWidthPx((previous) => {
      const latest = sidebarWidthPxRef.current;
      return previous === latest ? previous : latest;
    });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!cancel) persistSidebarWidth(sidebarWidthPxRef.current);
  }, []);

  /** 原 Bn（184228）：键盘调整（←/→ ±16px，Home 264px，End 容器 50%） */
  const handleSidebarResizeKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!isSidebarPanelVisible) return;
      const containerWidth = shellElementRef.current?.getBoundingClientRect().width;
      const endWidth = containerWidth && containerWidth > 0
        ? containerWidth * MAX_SIDEBAR_WIDTH_RATIO
        : sidebarWidthPxRef.current;
      let next: number | null = null;
      if (event.key === "ArrowLeft") next = sidebarWidthPxRef.current - SIDEBAR_KEYBOARD_STEP_PX;
      else if (event.key === "ArrowRight") next = sidebarWidthPxRef.current + SIDEBAR_KEYBOARD_STEP_PX;
      else if (event.key === "Home") next = MIN_SIDEBAR_WIDTH_PX;
      else if (event.key === "End") next = endWidth;
      if (next !== null) {
        event.preventDefault();
        commitSidebarWidthPx(next, { persist: true });
      }
    },
    [commitSidebarWidthPx, isSidebarPanelVisible],
  );

  React.useEffect(
    () => () => {
      setSidebarResizingAttribute({
        active: false,
        panelElement: sidebarPanelElementRef.current,
        shellElement: shellElementRef.current,
      });
    },
    [],
  );

  React.useEffect(() => {
    webRemoteNavHeightPxRef.current = webRemoteNavHeightPx;
    webRemoteNavCollapsedRef.current = webRemoteNavCollapsed;
  }, [webRemoteNavCollapsed, webRemoteNavHeightPx]);

  /* --- 手机视口监听（原 184253-184275） --- */
  React.useEffect(() => {
    if (!isWebRemoteControlShell || typeof window > "u" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const sync = () => {
      setIsMobileViewport(query.matches);
    };
    sync();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => {
        query.removeEventListener("change", sync);
      };
    }
    query.addListener(sync);
    return () => {
      query.removeListener(sync);
    };
  }, [isWebRemoteControlShell]);

  /* --- 远控导航高度随视口收缩（展开态才跟随；原 184276-184288） --- */
  React.useEffect(() => {
    if (!isWebRemoteControlShell || typeof window > "u") return;
    const handleResize = () => {
      if (webRemoteNavCollapsedRef.current) return;
      const viewport = viewportHeight();
      setWebRemoteNavHeightPx((previous) =>
        clampNavHeight({ heightPx: previous, viewportHeight: viewport }).heightPx,
      );
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isWebRemoteControlShell]);

  /** 原 Vn（184289） */
  const applyWebRemoteNavSize = React.useCallback((size: { heightPx: number; isCollapsed: boolean }) => {
    setWebRemoteNavHeightPx(size.heightPx);
    setWebRemoteNavCollapsed(size.isCollapsed);
  }, []);

  /** 原 Hn（184293）：点击把手快速切换展开/收起 */
  const toggleWebRemoteNavQuick = React.useCallback(() => {
    const next = toggleNavHeight({
      currentHeightPx: webRemoteNavHeightPxRef.current,
      isCollapsed: webRemoteNavCollapsedRef.current,
      viewportHeight: viewportHeight(),
    });
    logger.debug("[WorkspaceShellLayout] Web 远控导航快速切换", next);
    applyWebRemoteNavSize(next);
  }, [applyWebRemoteNavSize]);

  /** 原 Un（184297）：导航把手 pointerdown（收起态从 0 高度起拖） */
  const handleWebRemoteNavPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!isWebRemoteControlShell || !isMobileViewport || (event.pointerType === "mouse" && event.button !== 0))
        return;
      const startHeightPx = webRemoteNavCollapsedRef.current ? 0 : webRemoteNavHeightPxRef.current;
      webRemoteNavDragStateRef.current = {
        pointerId: event.pointerId,
        startHeightPx,
        startY: event.clientY,
        didDrag: false,
      };
      webRemoteNavPointerUsedRef.current = true;
      setIsWebRemoteNavDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      logger.debug("[WorkspaceShellLayout] Web 远控导航拖拽开始", { startHeightPx });
    },
    [isMobileViewport, isWebRemoteControlShell],
  );

  /** 原 Wn（184311）：超过 4px 阈值才算拖拽 */
  const handleWebRemoteNavPointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const drag = webRemoteNavDragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaY = event.clientY - drag.startY;
      if (!drag.didDrag && Math.abs(deltaY) < NAV_DRAG_THRESHOLD_PX) return;
      event.preventDefault();
      drag.didDrag = true;
      applyWebRemoteNavSize(
        clampNavHeight({ heightPx: drag.startHeightPx + deltaY, viewportHeight: viewportHeight() }),
      );
    },
    [applyWebRemoteNavSize],
  );

  /** 原 Gn（184322）：拖拽结束；未拖拽则走快速切换 */
  const handleWebRemoteNavPointerUp = React.useCallback(
    (event: React.PointerEvent, cancel = false) => {
      const drag = webRemoteNavDragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      webRemoteNavDragStateRef.current = null;
      setIsWebRemoteNavDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (cancel) {
        webRemoteNavPointerUsedRef.current = false;
        return;
      }
      if (!drag.didDrag) {
        toggleWebRemoteNavQuick();
        return;
      }
      const next = clampNavHeight({
        heightPx: drag.startHeightPx + event.clientY - drag.startY,
        viewportHeight: viewportHeight(),
      });
      logger.debug("[WorkspaceShellLayout] Web 远控导航拖拽结束", next);
      applyWebRemoteNavSize(next);
    },
    [applyWebRemoteNavSize, toggleWebRemoteNavQuick],
  );

  /** 原 Kn（184347）：click（pointer 已消费过则跳过，避免拖拽后误触） */
  const handleWebRemoteNavClick = React.useCallback(() => {
    if (webRemoteNavPointerUsedRef.current) {
      webRemoteNavPointerUsedRef.current = false;
      return;
    }
    toggleWebRemoteNavQuick();
  }, [toggleWebRemoteNavQuick]);

  /** 原 qn（184354）：远控任务打开 → 收起导航；跨工作区时埋一次性标记 */
  const handleWebRemoteTaskOpen = React.useCallback(
    ({ crossWorkspace }: { crossWorkspace?: boolean }) => {
      if (!isWebRemoteControlShell || !isMobileViewport) return;
      setWebRemoteNavCollapsed(true);
      if (crossWorkspace) armCollapseNavigationOnce();
    },
    [isMobileViewport, isWebRemoteControlShell],
  );

  /** 原 Jn（184360） */
  const handleWebRemoteTaskSwitchingChange = React.useCallback((switching: boolean) => {
    setWebRemoteTaskSwitching(switching);
  }, []);

  const showSidebarInLayout = isSidebarShownInShellLayout({
    isCollapsed: webRemoteNavCollapsed,
    isMobileViewport,
    isWebRemoteControlShell,
  }); // 原 Yn

  /** 原 Xn（184365）：搜索结果高亮请求仅接受"当前任务 + 同工作区"的 */
  const scopedSearchResultHighlightRequest = React.useMemo(
    () =>
      !searchResultHighlightRequest || searchResultHighlightRequest.taskId !== activeTaskId
        ? null
        : workspaceKey === workspaceKeyOf(searchResultHighlightRequest.workspacePath, searchResultHighlightRequest.workspaceIdentity)
          ? searchResultHighlightRequest
          : null,
    [activeTaskId, searchResultHighlightRequest, workspaceAbsPath, workspaceIdentity],
  );

  /** 原 Zn（184375）：任务内查找对话框（chat 放置位） */
  const renderTaskFindDialog = () => <TaskFindDialog {...taskFindDialogProps} placement="chat" />;

  /** 原 Qn（184376）：git 脏文件数（unstaged∪staged 去重） */
  const gitDirtyFileCount = React.useMemo(
    () => countDirtyFiles(gitState.datasets),
    [gitState.datasets.staged, gitState.datasets.unstaged],
  );

  /** 原 $n/er（184377-184383）：当前工作区 tab 的远程目标 / 本地路径 */
  const currentRemoteTarget = React.useMemo(
    () =>
      workspaceTabs.find(
        (tab) => tab.workspacePath === workspaceAbsPath && (!workspaceIdentity || tab.workspaceIdentity === workspaceIdentity),
      )?.remoteTarget,
    [workspaceAbsPath, workspaceIdentity, workspaceTabs],
  );
  const currentLocalWorkspacePath = React.useMemo(
    () =>
      workspaceTabs.find(
        (tab) => tab.workspacePath === workspaceAbsPath && (!workspaceIdentity || tab.workspaceIdentity === workspaceIdentity),
      )?.localWorkspacePath,
    [workspaceAbsPath, workspaceIdentity, workspaceTabs],
  );

  /** 原 tr/nr（184384-184393）：壳 CSS 变量（远控导航高度 + 侧栏宽度两档） */
  const webRemoteNavStyle = React.useMemo<React.CSSProperties | undefined>(
    () => (isWebRemoteControlShell ? ({ "--web-remote-navigation-height": `${webRemoteNavHeightPx}px` } as React.CSSProperties) : undefined),
    [isWebRemoteControlShell, webRemoteNavHeightPx],
  );
  const shellStyle = React.useMemo<React.CSSProperties>(
    () => ({
      ...webRemoteNavStyle,
      [SIDEBAR_PANEL_WIDTH_VAR]: `${isSidebarPanelVisible ? sidebarWidthPx : macHiddenSidebarWidthPx}px`,
      [SIDEBAR_WIDTH_VAR]: `${sidebarWidthPx}px`,
    }),
    [macHiddenSidebarWidthPx, isSidebarPanelVisible, sidebarWidthPx, webRemoteNavStyle],
  );

  /** 原 rr（184394）：侧面板激活的代码查看路径（供侧栏文件树高亮） */
  const activeCodeViewerPath = React.useMemo(() => {
    const activeTab = sidePaneState?.tabs.find((tab) => tab.id === sidePaneState.activeTabId) ?? null;
    return activeTab?.type === "code-viewer" ? (activeTab.source?.path ?? null) : null;
  }, [sidePaneState]);

  /** 原 ir（184399）：按路径找已开工作区 tab（身份/远程会话过滤 + 当前身份优先、路径长者优先） */
  const findWorkspaceTabByPath = React.useCallback(
    (path: string, identity?: string, remoteSessionId?: string) => {
      const matches = workspaceTabs.filter(
        (tab) =>
          isSamePath(tab.workspacePath, path) &&
          (!identity || tab.workspaceIdentity === identity) &&
          (!remoteSessionId || tab.remoteSessionId === remoteSessionId),
      );
      if (matches.length === 0) return null;
      matches.sort((a, b) => {
        const aCurrent = +(a.workspaceIdentity === workspaceIdentity);
        const bCurrent = +(b.workspaceIdentity === workspaceIdentity);
        return aCurrent === bCurrent ? b.workspacePath.length - a.workspacePath.length : bCurrent - aCurrent;
      });
      return matches[0] ?? null;
    },
    [workspaceIdentity, workspaceTabs],
  );

  /** 原 ar（184419）：文件树打开请求（自增 id） */
  const requestFileTreeOpen = React.useCallback((request: { target: unknown }) => {
    fileTreeOpenRequestIdRef.current += 1;
    setFileTreeOpenRequest({ id: fileTreeOpenRequestIdRef.current, ...request });
  }, []);

  /** 原 or（184423）：切回 chat 主视图 */
  const switchToChatView = React.useCallback(() => {
    onWorkspaceMainViewChange("chat");
  }, [onWorkspaceMainViewChange]);

  React.useEffect(() => {
    if (isWebRemoteControlShell && workspaceMainView === "automations") onWorkspaceMainViewChange("chat");
  }, [isWebRemoteControlShell, onWorkspaceMainViewChange, workspaceMainView]);

  /** 原 sr（184429）：打开仓库 wiki（只读工作区禁止） */
  const handleOpenRepoWiki = React.useCallback(() => {
    if (!workspaceReadOnlyReason) onWorkspaceMainViewChange("repo-wiki");
  }, [onWorkspaceMainViewChange, workspaceReadOnlyReason]);

  /** 原 cr（184433）：新建任务 = 先切 chat 再透传 */
  const handleCreateTask = React.useCallback(
    (options?: { initialPrompt?: string }) => {
      if (workspaceReadOnlyReason) return;
      switchToChatView();
      onCreateTask?.(options);
    },
    [onCreateTask, switchToChatView, workspaceReadOnlyReason],
  );

  /** 原 lr（184437）：当前活动会话的作用域（分屏路由锚点） */
  const activeSessionScope = React.useMemo<SessionBinding | null>(
    () =>
      activeTaskId
        ? {
            workspaceScope: {
              workspacePath: workspaceAbsPath,
              ...(workspaceIdentity?.trim() ? { workspaceIdentity } : {}),
              ...(workspaceRemoteSessionId ? { remoteSessionId: workspaceRemoteSessionId } : {}),
            },
            sessionId: activeTaskId,
          }
        : null,
    [activeTaskId, workspaceAbsPath, workspaceIdentity, workspaceRemoteSessionId],
  );

  /** 原 ur（184451）：带初始提示词建任务（只读禁止） */
  const handleCreateTaskWithPrompt = React.useCallback(
    (prompt: string) => {
      if (workspaceReadOnlyReason) return;
      handleCreateTask({ initialPrompt: prompt });
    },
    [handleCreateTask, workspaceReadOnlyReason],
  );

  /** 原 dr（184457）：跨工作区选择任务（自动化运行历史入口）：
   *  非远控壳时先裁决目标工作区 tab（远程未连接 → toast 并保留当前页），
   *  再走 MTt 分屏路由，最后切 chat + handleSelectTask。 */
  const handleSelectTaskAcrossWorkspaces = React.useCallback(
    (targetWorkspacePath: string, sessionId: string, targetIdentity?: string, explicitRemoteSessionId?: string) => {
      if (!isWebRemoteControlShell) {
        const resolution = resolveAutomationsRunTab({
          workspacePath: targetWorkspacePath,
          workspaceIdentity: targetIdentity,
          activateTabByPath: workspaceTabsStore.activateTabByPath,
          addLocalWorkspaceTab: (path) => {
            workspaceTabsStore.addTab(path);
          },
        });
        if (!resolution.accepted) {
          logger.warn("[automations] 运行历史目标远程 workspace 未连接，保留当前页面", {
            sessionId,
            workspaceIdentity: targetIdentity,
            workspacePath: targetWorkspacePath,
          });
          toast(intl.formatMessage({ id: "automations.runs.openSessionFailed" }));
          return;
        }
        if (resolution.openedLocalTab) {
          logger.info("[automations] 为运行历史会话补开本地 workspace tab", {
            sessionId,
            workspacePath: targetWorkspacePath,
          });
        }
        const remoteSessionId =
          explicitRemoteSessionId ??
          workspaceTabs.find(
            (tab) => (tab.workspaceIdentity?.trim() || tab.workspacePath) === (targetIdentity?.trim() || targetWorkspacePath),
          )?.remoteSessionId;
        openSessionBesideDraft(activeSessionScope, {
          workspacePath: targetWorkspacePath,
          ...(targetIdentity?.trim() ? { workspaceIdentity: targetIdentity } : {}),
          ...(remoteSessionId ? { remoteSessionId } : {}),
          sessionId,
        });
      }
      switchToChatView();
      handleSelectTask(targetWorkspacePath, sessionId, targetIdentity);
    },
    [handleSelectTask, intl, isWebRemoteControlShell, activeSessionScope, switchToChatView, workspaceTabsStore, workspaceTabs],
  );

  /** 原 fr（184496）：分屏面板活动会话变化回调 */
  const handlePaneActiveSessionChange = React.useCallback(
    (binding: { workspacePath: string; workspaceIdentity?: string; sessionId: string; remoteSessionId?: string }, sessionId: string) => {
      handleSelectTaskAcrossWorkspaces(binding.workspacePath, sessionId, binding.workspaceIdentity, binding.remoteSessionId);
    },
    [handleSelectTaskAcrossWorkspaces],
  );

  /** 原 pr（184504）：侧栏任务拖入聊天区 → 能否右侧分屏（context-menu/right） */
  const handleCanOpenSessionInSplit = React.useCallback(
    (binding: SessionBinding) => canOpenSessionInSplit(activeSessionScope, binding, { mode: "context-menu", side: "right" }),
    [activeSessionScope],
  );

  /** 原 mr（184507）：投放打开：先分屏，成功才切换活动任务 */
  const handleOpenSessionFromSidebarDrop = React.useCallback(
    (binding: SessionBinding) => {
      switchToChatView();
      if (
        openSessionInSplit(activeSessionScope, binding, { mode: "context-menu", side: "right" })
      ) {
        handleSelectTask(binding.workspaceScope.workspacePath, binding.sessionId, binding.workspaceScope.workspaceIdentity);
      }
    },
    [handleSelectTask, activeSessionScope, switchToChatView],
  );

  /** 原 hr（184514）：在某工作区开始草稿（先切 chat） */
  const handleStartDraftInWorkspaceView = React.useCallback(
    (targetWorkspacePath: string, targetIdentity?: string, purpose?: string) => {
      switchToChatView();
      handleStartDraftInWorkspace(targetWorkspacePath, targetIdentity, purpose);
    },
    [handleStartDraftInWorkspace, switchToChatView],
  );

  /** 原 gr（184519）：当前工作区用途（project|conversation|scratch） */
  const currentWorkspacePurpose =
    workspaceTabs.find(
      (tab) => tab.workspacePath === workspaceAbsPath && (!workspaceIdentity || tab.workspaceIdentity === workspaceIdentity),
    )?.workspacePurpose ?? "project";

  /** 原 _r（184524）：会话工作区解析 + 跨工作区草稿接力（rXe） */
  const handleResolveConversationWorkspaceAndStartDraft = React.useCallback(async () => {
    if (!onResolveConversationWorkspace) return;
    let targetWorkspacePath: string;
    try {
      targetWorkspacePath = await onResolveConversationWorkspace();
    } catch (error) {
      logger.error("[WorkspaceShellLayout] 切换对话 workspace 失败", { error });
      return;
    }
    if ((workspaceIdentity?.trim() || workspaceAbsPath) !== targetWorkspacePath) {
      handoffCrossWorkspaceConversation({
        sourceWorkspacePath: workspaceAbsPath,
        sourceWorkspaceIdentity: workspaceIdentity,
        targetWorkspacePath,
      });
    }
    handleStartDraftInWorkspaceView(targetWorkspacePath, undefined, "conversation");
  }, [handleStartDraftInWorkspaceView, onResolveConversationWorkspace, workspaceAbsPath, workspaceIdentity]);

  /** 原 vr（184538）：当前工作区内选择会话 */
  const handleSelectSessionInCurrentWorkspace = React.useCallback(
    (sessionId: string) => {
      handleSelectTask(workspaceAbsPath, sessionId, workspaceIdentity);
    },
    [handleSelectTask, workspaceAbsPath, workspaceIdentity],
  );

  /** 原 yr（184542）：草稿 composer 头部 = [工作区选择行 a4][项目用途时的分支 chip zZ] */
  const draftComposerHeader = React.useMemo(
    () => (
      <React.Fragment>
        <WorkspaceSelectionRow
          workspacePath={workspaceAbsPath}
          workspaceIdentity={workspaceIdentity}
          isWindowsDesktop={isWindowsDesktop}
          compactForRemoteControl={isWebRemoteControlShell}
          workspaceTabs={workspaceTabs}
          onSelectWorkspace={(target: { workspacePath: string; workspaceIdentity?: string; workspacePurpose?: string }) =>
            handleStartDraftInWorkspaceView(target.workspacePath, target.workspaceIdentity, target.workspacePurpose)
          }
          onSelectConversationWorkspace={handleResolveConversationWorkspaceAndStartDraft}
          onOpenFolder={onOpenFolderFromWorkspaceMenu}
          allowOpenWorkspace={allowOpenWorkspace}
          allowRemoteWorkspace={allowRemoteWorkspace}
          remoteWorkspaceSessions={remoteWorkspaceSessions}
          onConnectRemote={onConnectRemote}
          onSelectRemoteProject={onSelectRemoteProject}
          onCancelRemoteProject={onCancelRemoteProject}
        />
        {currentWorkspacePurpose === "project" ? (
          <GitBranchChip
            workspacePath={workspaceAbsPath}
            gitSummary={gitState.summary}
            dirtyFileCount={gitDirtyFileCount}
            onRefreshGit={handleRefreshGit}
            compactForRemoteControl={isWebRemoteControlShell}
            className="px-0 pt-0"
            popoverClassName="w-72"
            branchListClassName="max-h-48"
            avoidPopoverCollisions={false}
          />
        ) : null}
      </React.Fragment>
    ),
    [
      allowOpenWorkspace, allowRemoteWorkspace, currentWorkspacePurpose, gitDirtyFileCount,
      gitState.summary, handleRefreshGit, handleResolveConversationWorkspaceAndStartDraft,
      handleStartDraftInWorkspaceView, isWebRemoteControlShell, isWindowsDesktop,
      onCancelRemoteProject, onConnectRemote, onOpenFolderFromWorkspaceMenu,
      onSelectRemoteProject, remoteWorkspaceSessions, workspaceAbsPath, workspaceIdentity, workspaceTabs,
    ],
  );

  /** 原 br（184578）：会话删除后：关闭其辅助对话标签 → 回到草稿 */
  const handleSessionDeleted = React.useCallback(() => {
    if (activeTaskId) {
      for (const tab of sidePaneState?.tabs ?? []) {
        if (tab.type === "selection-side-chat" && tab.parentSessionId === activeTaskId) {
          handleCloseSidePaneTab(tab.id);
        }
      }
    }
    handleStartDraftInWorkspaceView(workspaceAbsPath, workspaceIdentity);
  }, [activeTaskId, handleCloseSidePaneTab, handleStartDraftInWorkspaceView, sidePaneState?.tabs, workspaceAbsPath, workspaceIdentity]);

  /** 原 xr（184586）：repo-wiki 打开代码查看（先切 chat） */
  const handleOpenCodeViewerFromRepoWiki = React.useCallback(
    (source: CodeViewerSource) => {
      switchToChatView();
      handleOpenCodeViewer(source);
    },
    [handleOpenCodeViewer, switchToChatView],
  );

  /** 原 Sr（184591）：markdown 文件链接打开裁决：
   *  文件 → 可内嵌浏览器? 浏览器 : 代码查看；目录 → 已开工作区? 文件树定位 : 临时外部目录 */
  const handleOpenFileLink = React.useCallback(
    async (link: {
      path: string;
      label?: string;
      workspacePath?: string;
      workspaceIdentity?: string;
      workspaceRemoteSessionId?: string;
    }) => {
      if (workspaceReadOnlyReason) return;
      try {
        if ((await services.fileService.stat({ path: link.path })).type === "file") {
          if (
            canOpenPathInEmbeddedBrowser({
              path: link.path,
              workspaceIdentity: link.workspaceIdentity,
              workspaceRemoteSessionId: link.workspaceRemoteSessionId,
              compactForRemoteControl: isWebRemoteControlShell,
            })
          ) {
            handleOpenBrowserUrl(browserUrlFromPath(link.path));
            return;
          }
          handleOpenCodeViewer({
            type: "file",
            title: pathBasename(link.path),
            path: link.path,
            workspacePath: link.workspacePath,
            workspaceIdentity: link.workspaceIdentity,
            workspaceRemoteSessionId: link.workspaceRemoteSessionId,
          });
          return;
        }
        const existingTab = findWorkspaceTabByPath(link.path, link.workspaceIdentity, link.workspaceRemoteSessionId);
        if (existingTab) {
          requestFileTreeOpen({
            target: {
              workspacePath: existingTab.workspacePath,
              workspaceName: existingTab.label,
              workspaceIdentity: existingTab.workspaceIdentity,
              workspaceRemoteSessionId: existingTab.remoteSessionId,
              revealPath: isPathWithin(existingTab.workspacePath, link.path) ? undefined : link.path,
            },
          });
          return;
        }
        requestFileTreeOpen({
          target: {
            workspacePath: link.path,
            workspaceName: link.label || pathBasename(link.path),
            revealPath: link.path,
            temporaryExternalDirectory: true,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn("[WorkspaceShell] 打开 markdown 文件链接失败", { path: link.path, error: message });
        handleOpenCodeViewer({
          type: "file",
          title: pathBasename(link.path),
          path: link.path,
          workspacePath: link.workspacePath,
          workspaceIdentity: link.workspaceIdentity,
          workspaceRemoteSessionId: link.workspaceRemoteSessionId,
        });
        toast(intl.formatMessage({ id: "workspaceFileTree.openFailed" }));
      }
    },
    [findWorkspaceTabByPath, handleOpenBrowserUrl, handleOpenCodeViewer, intl, isWebRemoteControlShell, requestFileTreeOpen, services.fileService, workspaceReadOnlyReason],
  );

  /** 原 Cr（184654）：git 文件在文件树中定位 */
  const handleRevealGitFileInTree = React.useCallback(
    (path: string) => {
      if (workspaceReadOnlyReason) return;
      requestFileTreeOpen({
        target: {
          workspacePath: workspaceAbsPath,
          workspaceName: projectName,
          workspaceIdentity,
          workspaceRemoteSessionId,
          revealPath: path,
        },
      });
    },
    [requestFileTreeOpen, projectName, workspaceAbsPath, workspaceIdentity, workspaceRemoteSessionId, workspaceReadOnlyReason],
  );

  /** 原 wr（184666）：当前会话的辅助对话（选择域侧聊天）子会话 id */
  const activeSelectionSideChatSessionId = activeTaskId
    ? (findSelectionSideChatTab(sidePaneState, { workspaceKey, parentSessionId: activeTaskId })?.childSessionId ?? null)
    : null;

  /** 原 Tr（184669）：打开辅助对话（无主会话控制器时告警） */
  const handleOpenSelectionSideConversation = React.useCallback(() => {
    if (!activeTaskId) return;
    if (!focusAuxiliaryChat(auxiliaryChatRegistryKey(workspaceKey, activeTaskId))) {
      logger.warn("[WorkspaceShell] 辅助对话入口没有可用的主会话控制器", {
        parentSessionId: activeTaskId,
        workspaceKey,
      });
    }
  }, [activeTaskId, workspaceKey]);

  /** 原 Er（184675）：侧面板（右摘要栏）渲染器；mobileOverlay 变体供移动壳插槽 */
  const renderSidePanel = (options: { mobileOverlay?: boolean } = {}) => (
    <SidePanel
      services={services}
      isDesktop={isDesktop}
      isVisible={options.mobileOverlay ? isSidePaneOpen : isSidePaneVisible}
      sidePaneState={sidePaneState}
      recentClosedSidePaneTabs={recentClosedSidePaneTabs}
      isBrowserOpen={isBrowserOpen}
      supportsEmbeddedBrowser={supportsEmbeddedBrowser}
      workspaceAbsPath={workspaceAbsPath}
      workspaceIdentity={workspaceIdentity}
      workspaceRemoteSessionId={workspaceRemoteSessionId}
      activeTaskId={activeTaskId}
      sidePaneOwnerId={sidePaneOwnerId}
      gitState={gitState}
      activeGitSourceId={activeGitSourceId}
      panelRef={options.mobileOverlay ? mobileSidePanePanelRef : sidePanePanelRef}
      panelElementRef={options.mobileOverlay ? mobileSidePanePanelElementRef : sidePanePanelElementRef}
      browserNavigationRequest={browserNavigationRequest}
      browserRestoreUrls={browserRestoreUrls}
      fileChangeFindActiveIndex={fileChangeFindActiveIndex}
      fileChangeFindNavigationRequestId={fileChangeFindNavigationRequestId}
      fileChangeFindQuery={fileChangeFindQuery}
      onFileChangeFindMatchCountChange={onFileChangeFindMatchCountChange}
      onCloseCodeViewer={handleCloseCodeViewer}
      onCloseGit={handleCloseGit}
      onActivateTab={handleActivateSidePaneTab}
      onReorderTab={handleReorderSidePaneTab}
      onCloseTab={handleCloseSidePaneTab}
      onCloseOtherTabs={handleCloseOtherSidePaneTabs}
      onCloseAllTabs={handleCloseAllSidePaneTabs}
      onReopenClosedTab={handleReopenClosedSidePaneTab}
      onOpenBrowserTab={handleOpenBrowserTab}
      onOpenWhiteboard={handleOpenWhiteboard}
      onOpenDeveloperTools={handleOpenDeveloperTools}
      onOpenTerminalTab={handleOpenTerminalTab}
      onOpenRepoWiki={handleOpenRepoWiki}
      onOpenReviewTab={handleToggleGit}
      onOpenSelectionSideConversation={handleOpenSelectionSideConversation}
      onRevealGitFileInTree={handleRevealGitFileInTree}
      onOpenBrowserUrl={handleOpenBrowserUrl}
      onOpenCodeViewer={handleOpenCodeViewer}
      onOpenFileLink={handleOpenFileLink}
      onOpenSubagentSession={handleOpenSubagentSession}
      onRefreshGit={handleRefreshGit}
      onBrowserNavigationRequestHandled={handleBrowserNavigationRequestHandled}
      onBrowserUrlChange={handleBrowserUrlChange}
      onBrowserPageMetadataChange={handleBrowserPageMetadataChange}
      onSelectGitSource={setGitSelectedSourceId}
      mobileOverlay={options.mobileOverlay}
      mobileStacked={isWebRemoteControlShell}
    />
  );
  const sidePanelElement = renderSidePanel(); // 原 Dr：主体三分的右列

  /* --- 头部三态判定（原 184731-184741） --- */
  const hasUpdateReady =
    updateReadyVersion !== null ||
    updateState?.kind === "update-available" ||
    updateState?.kind === "download-progress" ||
    updateState?.kind === "update-downloaded"; // 原 Or
  const isChatLikeView = workspaceMainView !== "automations"; // 原 kr
  const showSessionHeader = isChatLikeView && activeTaskId !== null; // 原 Ar
  const showDraftHeader = isChatLikeView && !showSessionHeader && isDesktop; // 原 jr
  /** 原 Mr：草稿态需要 caption 菜单（Win 或 Linux 桌面） */
  const showDraftCaptionMenu = !showSessionHeader && (isWindowsDesktop || isLinuxDesktop);
  /** 原 Nr：Win caption 让位样式（TopBar 族 c4/s4） */
  const draftCaptionInsetStyle = isWindowsDesktop
    ? { ...windowsCaptionInsetStyle(windowsWindowControlsRightPaddingPx), right: WINDOWS_CAPTION_RIGHT_INSET_VAR }
    : undefined;
  const draftCaptionPositionClass = isLinuxDesktop ? "right-[120px]" : isWindowsDesktop ? false : "right-0"; // 原 Pr
  const draftCaptionBackgroundClass = isLinuxDesktop
    ? "rounded-bl-xl border-b border-border bg-background"
    : false; // 原 Fr

  const workspaceResetKeys = React.useMemo(() => [workspaceKey], [workspaceKey]); // 原 Ir
  const sessionResetKeys = React.useMemo(() => [workspaceKey, activeTaskId], [workspaceKey, activeTaskId]); // 原 Lr
  const chatResetKeys = React.useMemo(() => [workspaceKey, activeTaskId ?? "draft"], [workspaceKey, activeTaskId]); // 原 Rr
  const overlayResetKeys = React.useMemo(() => [workspaceKey, isSidebarVisible], [workspaceKey, isSidebarVisible]); // 原 zr

  /* --- 会话头（Ar 态）与草稿头（jr 态）的公共 props（原 184770-184825 / 185069-185122） --- */
  const sessionHeaderElement = (
    <ScopedErrorBoundary scope="workspace-header" resetKeys={sessionResetKeys} variant="compact" className="border-b">
      <SessionHeader
        readOnlyReason={workspaceReadOnlyReason}
        workspaceAbsPath={workspaceAbsPath}
        remoteSessionId={workspaceRemoteSessionId}
        workspaceIdentity={workspaceIdentity}
        remoteTarget={currentRemoteTarget}
        localWorkspacePath={currentLocalWorkspacePath}
        projectName={projectName}
        activeTaskTitle={activeTaskTitle}
        activeTaskChangeSummary={activeTaskChangeSummary}
        hasUpdateReady={hasUpdateReady}
        activeTaskId={activeTaskId}
        activeTraceId={activeTraceId}
        activeSessionId={activeSessionId}
        activeTaskProvider={activeTaskProvider}
        resolvedActiveTaskMeta={resolvedActiveTaskMeta}
        sessionLogPath={taskSessionFile.path}
        nativeSessionLogProvider={taskNativeSessionLogFile.provider}
        nativeSessionLogPath={taskNativeSessionLogFile.path}
        nativeSessionLogExists={taskNativeSessionLogFile.exists}
        nativeSessionLogLoading={taskNativeSessionLogFile.loading}
        providerWorkspaceConfigPath={providerConfigFile.path}
        providerWorkspaceConfigExists={providerConfigFile.exists}
        providerWorkspaceConfigLoading={providerConfigFile.loading}
        workspaceHeaderState={workspaceShellZCodeState}
        gitSummary={gitState.summary}
        gitDirtyFileCount={gitDirtyFileCount}
        isMacDesktop={isMacDesktop}
        isMacFullscreen={isMacFullscreen}
        isWindowsDesktop={isWindowsDesktop}
        isWebRemoteControl={isWebRemoteControlShell}
        windowsWindowControlsRightPaddingPx={windowsWindowControlsRightPaddingPx}
        isDesktop={isDesktop}
        simplifyForNarrowRemote={simplifyForNarrowRemote}
        isSidebarVisible={isSidebarVisible}
        isTerminalOpen={isTerminalOpen}
        isSidePaneOpen={isSidePaneOpen}
        onRefreshGit={handleRefreshGit}
        onToggleTerminal={handleToggleTerminal}
        onToggleBrowser={handleToggleBrowser}
        onToggleSidePane={handleToggleSidePane}
        toggleSidePaneShortcutLabel={toggleSidePaneShortcutLabel}
        onReloadSession={handleReloadSession}
        reloadSessionDisabled={reloadSessionDisabledEffective}
        reloadSessionPending={reloadSessionPending}
        onCreateTask={handleCreateTask}
        onOpenWorkspace={onOpenWorkspace}
        allowOpenWorkspace={allowOpenWorkspace}
      />
    </ScopedErrorBoundary>
  );

  /* ================= 返回分支一：Web 远控 + 手机视口 + 有切换器 → 移动壳 ================= */
  if (isWebRemoteControlShell && isMobileViewport && webRemoteControlWorkspaceSwitcher) {
    return (
      // REBRAND-038+138
      <WindowShell
        title={`nofy / ${pathBasename(workspaceAbsPath)}`}
        showHeader={true}
        isDesktop={isDesktop}
        isMacDesktop={isMacDesktop}
        isWindowsDesktop={isWindowsDesktop}
        headerTestId={APP_HEADER_TEST_ID}
      >
        <WebRemoteMobileShell
          activeTaskId={activeTaskId}
          activeWorkspaceIdentity={workspaceIdentity}
          activeWorkspacePath={workspaceAbsPath}
          initialNavigationIntent={initialWebRemoteControlMobileNavigationIntent}
          initialWorkspaceList={initialWebRemoteControlWorkspaceList}
          webRemoteControlTerminalTransportState={webRemoteControlTerminalTransportState}
          isSidePaneOpen={isSidePaneOpen}
          onCloseSidePane={isSidePaneOpen ? handleToggleSidePane : undefined}
          onSelectTask={handleSelectTaskAcrossWorkspaces}
          onStartDraftInWorkspace={handleStartDraftInWorkspaceView}
          switcher={webRemoteControlWorkspaceSwitcher}
          renderChatHeader={() =>
            showSessionHeader ? sessionHeaderElement : null
          }
          chatOverlay={workspaceMainView === "chat" ? renderTaskFindDialog() : undefined}
          chatContent={
            workspaceMainView === "repo-wiki" ? (
              <ScopedErrorBoundary scope="repo-wiki-main" resetKeys={workspaceResetKeys} variant="panel" className="h-full">
                <RepoWikiMain
                  workspacePath={workspaceAbsPath}
                  workspaceIdentity={workspaceIdentity}
                  workspaceTabs={workspaceTabs}
                  onOpenCodeViewer={handleOpenCodeViewerFromRepoWiki}
                  onBack={switchToChatView}
                />
              </ScopedErrorBoundary>
            ) : workspaceMainView === "automations" && !isWebRemoteControlShell ? (
              /* 与桌面分支同构；远控壳下 automations 已被强制切回 chat，此支实际不可达 */
              <AutomationsMainContent
                isDesktop={isDesktop}
                workspaceAbsPath={workspaceAbsPath}
                workspaceIdentity={workspaceIdentity}
                workspaceResetKeys={workspaceResetKeys}
                handleCreateTaskWithPrompt={handleCreateTaskWithPrompt}
                openAutomationId={openAutomationId}
                onOpenAutomationConsumed={onOpenAutomationConsumed}
                handleSelectTaskAcrossWorkspaces={handleSelectTaskAcrossWorkspaces}
              />
            ) : (
              <div className="relative flex h-full min-h-0 flex-1 flex-col">
                <ScopedErrorBoundary scope="workspace-chat" resetKeys={chatResetKeys} variant="panel" className="h-full">
                  <StackedConversationPane
                    readOnly={!!workspaceReadOnlyReason}
                    workspacePath={workspaceAbsPath}
                    workspaceIdentity={workspaceIdentity}
                    compactForRemoteControl={isWebRemoteControlShell}
                    sessionId={activeTaskId}
                    provider={activeTaskProvider ?? undefined}
                    onSessionCreated={handleSelectSessionInCurrentWorkspace}
                    onSessionDeleted={handleSessionDeleted}
                    draftComposerHeader={draftComposerHeader}
                    gitSummary={gitState.summary}
                    gitDirtyFileCount={gitDirtyFileCount}
                    gitWorktreeReviewSourceId={gitWorktreeReviewSourceId}
                    gitWorktreeChangeSummary={gitWorktreeChangeSummary}
                    activeTaskChangeSummary={activeTaskChangeSummary}
                    summaryPanelVariantOverride={summaryPanelVariantOverride}
                    onSummaryPanelVariantOverrideChange={onSummaryPanelVariantOverrideChange}
                    onRefreshGit={handleRefreshGit}
                    onOpenGitReview={handleOpenGitReview}
                    onOpenBrowserUrl={handleOpenBrowserUrl}
                    onOpenAutomationsMain={handleOpenAutomations}
                    onOpenCodeViewer={handleOpenCodeViewer}
                    onOpenFileLink={handleOpenFileLink}
                    onOpenSubagentSession={handleOpenSubagentSession}
                    onOpenSubagentDirectory={handleOpenSubagentDirectory}
                    onSyncSubagentSessionTabs={handleSyncSubagentSessionTabs}
                    onOpenPlanDetail={handleOpenPlanDetail}
                    conversationFindQuery={conversationFindQuery}
                    conversationFindActiveIndex={conversationFindActiveIndex}
                    onConversationFindMatchStateChange={onConversationFindMatchStateChange}
                    searchResultHighlightRequest={scopedSearchResultHighlightRequest}
                    onSearchResultHighlightDone={onSearchResultHighlightDone}
                  />
                </ScopedErrorBoundary>
              </div>
            )
          }
          sidePaneContent={renderSidePanel({ mobileOverlay: true })}
        />
      </WindowShell>
    );
  }

  /* ================= 返回分支二：桌面 / 宽视口形态（§13.6 三分体现场） ================= */
  return (
  // REBRAND-038+138
    <WindowShell
      title={`nofy / ${pathBasename(workspaceAbsPath)}`}
      showHeader={true}
      isDesktop={isDesktop}
      isMacDesktop={isMacDesktop}
      isWindowsDesktop={isWindowsDesktop}
      headerTestId={APP_HEADER_TEST_ID}
    >
      <div
        ref={shellElementRef}
        data-workspace-shell="true"
        style={shellStyle}
        className={cn("relative flex h-full min-h-0 w-full overflow-hidden", isWebRemoteControlShell && "max-md:flex-col")}
      >
        {/* ---- 左列：侧栏面板（§13.8 rVt 的挂载位） ---- */}
        <div
          ref={sidebarPanelElementRef}
          data-panel=""
          data-workspace-sidebar-panel="true"
          id="sidebar"
          className={cn(
            "w-[var(--workspace-sidebar-panel-width)] max-w-[50%] flex-none overflow-hidden duration-200 ease-out transition-[width,opacity] data-[workspace-sidebar-resizing=true]:transition-opacity",
            isWebRemoteControlShell &&
              cn(
                showSidebarInLayout
                  ? "max-md:!h-[var(--web-remote-navigation-height)] max-md:!min-h-0 max-md:!w-full max-md:!max-w-none max-md:!flex-none max-md:!basis-auto max-md:border-b max-md:border-border max-md:bg-sidebar"
                  : "max-md:!h-0 max-md:!min-h-0 max-md:!w-full max-md:!max-w-none max-md:!flex-none max-md:!basis-0 max-md:!border-b-0",
              ),
            isSidebarPanelVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <aside
            id={isWebRemoteControlShell ? "web-remote-control-navigation-panel" : undefined}
            ref={sidebarContainerRef as React.RefObject<HTMLElement> | null | undefined}
            className={cn(
              "h-full overflow-hidden select-none",
              isWebRemoteControlShell && "max-md:min-h-0 max-md:flex-1",
              !showSidebarInLayout && "max-md:hidden",
            )}
            aria-hidden={!isSidebarPanelVisible || !showSidebarInLayout}
          >
            <ScopedErrorBoundary scope="workspace-sidebar" resetKeys={workspaceResetKeys} variant="panel" className="h-full">
              <SidebarSessionDropProvider
                enabled={!isWebRemoteControlShell && !isMobileViewport}
                canOpenSession={handleCanOpenSessionInSplit}
                onOpenSession={handleOpenSessionFromSidebarDrop}
              >
                <Sidebar
                  workspacePath={workspaceAbsPath}
                  workspaceRemoteSessionId={workspaceRemoteSessionId}
                  activePreviewPath={activeCodeViewerPath}
                  onSelectTask={handleSelectTaskAcrossWorkspaces}
                  onStartDraftInWorkspace={handleStartDraftInWorkspaceView}
                  onOpenCodeViewer={handleOpenCodeViewer}
                  onOpenBrowserUrl={handleOpenBrowserUrl}
                  fileTreeOpenRequest={fileTreeOpenRequest}
                  onCreateTask={handleCreateTask}
                  onCreateConversationTask={onCreateConversationTask ?? handleCreateTask}
                  onOpenFolderFromWorkspaceMenu={onOpenFolderFromWorkspaceMenu}
                  onOpenRemoteWorkspace={onOpenRemoteWorkspace}
                  webRemoteControlWorkspaceSwitcher={webRemoteControlWorkspaceSwitcher}
                  theme={theme}
                  onConnectRemote={onConnectRemote}
                  onSelectRemoteProject={onSelectRemoteProject}
                  onCancelRemoteProject={onCancelRemoteProject}
                  onReconnectRemoteWorkspace={onReconnectRemoteWorkspace}
                  reconnectingRemoteWorkspaceKeys={reconnectingRemoteWorkspaceKeys}
                  remoteWorkspaceErrorByWorkspaceKey={remoteWorkspaceErrorByWorkspaceKey}
                  reconnectingRemoteWorkspaceLogsByWorkspaceKey={reconnectingRemoteWorkspaceLogsByWorkspaceKey}
                  onLogout={onLogout}
                  onLogin={onLogin}
                  user={user}
                  isDesktop={isDesktop}
                  isWebRemoteControl={isWebRemoteControlShell}
                  isMacDesktop={isMacDesktop}
                  isWindowsDesktop={isWindowsDesktop}
                  isSidebarVisible={isSidebarVisible}
                  onToggleSidebar={handleToggleSidebar}
                  toggleSidebarShortcutLabel={toggleSidebarShortcutLabel}
                  canGoBack={canTaskNavBack}
                  canGoForward={canTaskNavForward}
                  onGoBack={handleTaskNavBack}
                  onGoForward={handleTaskNavForward}
                  goBackShortcutLabel={goBackShortcutLabel}
                  goForwardShortcutLabel={goForwardShortcutLabel}
                  onOpenCommandCenter={handleOpenCommandCenter}
                  onOpenRepoWiki={handleOpenRepoWiki}
                  repoWikiActive={workspaceMainView === "repo-wiki"}
                  onOpenAutomations={handleOpenAutomations}
                  automationsActive={workspaceMainView === "automations"}
                  onFileTreeOpenChange={setIsFileTreeOpen}
                  onWebRemoteTaskOpen={handleWebRemoteTaskOpen}
                  onWebRemoteTaskSwitchingChange={handleWebRemoteTaskSwitchingChange}
                />
              </SidebarSessionDropProvider>
            </ScopedErrorBoundary>
          </aside>
        </div>

        {/* ---- 侧栏宽度拖拽条（§2 拖拽区中的唯一竖向 separator） ---- */}
        {isSidebarVisible && showSidebarInLayout ? (
          <div
            role="separator"
            tabIndex={0}
            aria-controls="sidebar"
            aria-label={resizeSidebarLabel}
            aria-orientation="vertical"
            aria-valuemin={MIN_SIDEBAR_WIDTH_PX}
            aria-valuenow={Math.round(sidebarWidthPx)}
            data-testid="resizable-handle"
            onKeyDown={handleSidebarResizeKeyDown}
            onPointerCancel={(event) => handleSidebarResizePointerUp(event, true)}
            onPointerDown={handleSidebarResizePointerDown}
            onPointerMove={handleSidebarResizePointerMove}
            onPointerUp={(event) => handleSidebarResizePointerUp(event)}
            className={cn(
              "group/handle relative z-10 flex shrink-0 translate-x-px touch-none items-center justify-center bg-transparent outline-none transition-colors [app-region:no-drag] focus:outline-none focus-visible:bg-border-hover/60 focus-visible:ring-0",
              "my-6 h-[calc(100%-48px)] w-px cursor-ew-resize hover:bg-border-hover/60",
              "[mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_82%,transparent_100%)]",
              isWebRemoteControlShell && "max-md:hidden",
            )}
          />
        ) : null}

        {/* ---- 右主区：内容列（§13.6 section.bg-background 本体） ---- */}
        <div
          data-panel=""
          id="content"
          className={cn(
            "flex min-w-[320px] flex-1 flex-col",
            isMacDesktop ? "p-1 pl-0 pt-0" : "p-0",
            isWebRemoteControlShell && "max-md:!w-full max-md:!min-w-0 max-md:!flex-1 max-md:!basis-0",
          )}
        >
          {isMacDesktop && <div className="h-1 w-full [app-region:drag]" />}
          <section
            className={cn(
              "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
              windowRoundedCornerClasses({
                isWindowsDesktop,
                isWindowsMaximized: desktopWindowChromeState?.isMaximized ?? false,
                supportsNativeRoundedCorners: desktopWindowChromeState?.supportsNativeRoundedCorners ?? null,
              }),
              isWebRemoteControlShell && "max-md:rounded-none max-md:border-x-0 max-md:border-b-0",
            )}
          >
            {/* 头部三态：会话头 / 草稿头 / 无 */}
            {showSessionHeader ? (
              sessionHeaderElement
            ) : showDraftHeader ? (
              <header
                className={cn(
                  "relative flex h-10 shrink-0 [app-region:drag]",
                  isLinuxDesktop && "mr-[165px]",
                )}
                data-testid="new-task-draft-drag-region"
              >
                {primaryDraftDropTargetController?.active ? (
                  <div
                    className="absolute inset-0 z-40 bg-accent/55 backdrop-blur-sm pointer-events-auto [app-region:no-drag]"
                    data-testid="new-task-draft-drop-mask"
                    onDragOver={primaryDraftDropTargetController.onDragOver}
                    onDragLeave={primaryDraftDropTargetController.onDragLeave}
                    onDrop={primaryDraftDropTargetController.onDrop}
                  />
                ) : null}
                {showDraftCaptionMenu ? null : (
                  <div
                    className={cn(
                      "absolute top-0 z-30 h-10 w-20 pointer-events-auto [app-region:no-drag]",
                      "right-0",
                    )}
                  >
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5">
                      <HelpMenu />
                      <TerminalToggleButton isTerminalOpen={isTerminalOpen} onToggleTerminal={handleToggleTerminal} />
                    </div>
                  </div>
                )}
              </header>
            ) : null}

            {/* 远控导航高度拖拽把手（仅手机视口可见） */}
            {isWebRemoteControlShell ? (
              <Button
                type="button"
                variant="outline"
                size="icon-md"
                data-web-remote-navigation-resize-handle="true"
                className={cn(
                  "absolute left-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 touch-none cursor-ns-resize border-border bg-surface text-foreground-subtle shadow-sm hover:bg-surface-hover hover:text-foreground max-md:inline-flex [app-region:no-drag]",
                  showSessionHeader ? "top-12" : showDraftHeader ? "top-10" : "top-0",
                  isWebRemoteNavDragging && "border-border-hover bg-surface-hover text-foreground",
                )}
                aria-expanded={!webRemoteNavCollapsed}
                aria-controls="web-remote-control-navigation-panel"
                aria-label={intl.formatMessage({
                  id: webRemoteNavCollapsed
                    ? "webRemoteControl.expandNavigation"
                    : "webRemoteControl.collapseNavigation",
                })}
                onPointerDown={handleWebRemoteNavPointerDown}
                onPointerMove={handleWebRemoteNavPointerMove}
                onPointerUp={(event) => {
                  handleWebRemoteNavPointerUp(event);
                }}
                onPointerCancel={(event) => {
                  handleWebRemoteNavPointerUp(event, true);
                }}
                onClick={handleWebRemoteNavClick}
              >
                <IconGripHorizontal className="size-4" />
              </Button>
            ) : null}

            {/* 主视图三分支 */}
            {workspaceMainView === "repo-wiki" ? (
              <main className="min-h-0 flex-1 overflow-hidden">
                <ScopedErrorBoundary scope="repo-wiki-main" resetKeys={workspaceResetKeys} variant="panel" className="h-full">
                  <RepoWikiMain
                    workspacePath={workspaceAbsPath}
                    workspaceIdentity={workspaceIdentity}
                    workspaceTabs={workspaceTabs}
                    onOpenCodeViewer={handleOpenCodeViewerFromRepoWiki}
                    onBack={switchToChatView}
                  />
                </ScopedErrorBoundary>
              </main>
            ) : workspaceMainView === "automations" && !isWebRemoteControlShell ? (
              <AutomationsMainContent
                isDesktop={isDesktop}
                workspaceAbsPath={workspaceAbsPath}
                workspaceIdentity={workspaceIdentity}
                workspaceResetKeys={workspaceResetKeys}
                handleCreateTaskWithPrompt={handleCreateTaskWithPrompt}
                openAutomationId={openAutomationId}
                onOpenAutomationConsumed={onOpenAutomationConsumed}
                handleSelectTaskAcrossWorkspaces={handleSelectTaskAcrossWorkspaces}
              />
            ) : (
              /* §13.6 三分体：
                 X4 水平分割 [conversation-column | Dr 右摘要栏]
                 conversation-column 内 X4 垂直分割 [conversation 聊天 | Mqt dock] */
              <SplitLayoutGroup
                layoutId="workspace-body-layout"
                panelIds={WORKSPACE_BODY_PANEL_IDS}
                className={cn("min-h-0 flex-1", isWebRemoteControlShell && "max-md:!flex-col")}
              >
                <SplitPanel
                  id="conversation-column"
                  minSize={isWebRemoteControlShell ? "0px" : "35%"}
                  defaultSize={isSidePaneVisible ? "52%" : undefined}
                  className={
                    isWebRemoteControlShell
                      ? "max-md:!w-full max-md:!min-w-0 max-md:!flex-1 max-md:!basis-0"
                      : undefined
                  }
                >
                  <SplitLayoutGroup
                    orientation="vertical"
                    layoutId="workspace-conversation-column-layout"
                    panelIds={CONVERSATION_COLUMN_PANEL_IDS}
                    className="h-full min-h-0"
                  >
                    <SplitPanel id="conversation" elementRef={conversationElementRef} minSize="35%">
                      <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                        {renderTaskFindDialog()}
                        <ScopedErrorBoundary scope="workspace-chat" resetKeys={chatResetKeys} variant="panel" className="h-full">
                          <ConversationOrchestrator
                            readOnly={!!workspaceReadOnlyReason}
                            workspacePath={workspaceAbsPath}
                            workspaceIdentity={workspaceIdentity}
                            remoteSessionId={workspaceRemoteSessionId}
                            compactForRemoteControl={isWebRemoteControlShell}
                            sessionId={activeTaskId}
                            activeSelectionSideChatSessionId={activeSelectionSideChatSessionId}
                            provider={activeTaskProvider ?? undefined}
                            onSessionCreated={handleSelectSessionInCurrentWorkspace}
                            onSessionDeleted={handleSessionDeleted}
                            draftComposerHeader={draftComposerHeader}
                            onPrimaryDraftDropTargetControllerChange={setPrimaryDraftDropTargetController}
                            gitSummary={gitState.summary}
                            gitDirtyFileCount={gitDirtyFileCount}
                            activeTaskChangeSummary={activeTaskChangeSummary}
                            gitWorktreeReviewSourceId={gitWorktreeReviewSourceId}
                            gitWorktreeChangeSummary={gitWorktreeChangeSummary}
                            summaryPanelVariantOverride={summaryPanelVariantOverride}
                            onSummaryPanelVariantOverrideChange={onSummaryPanelVariantOverrideChange}
                            onRefreshGit={handleRefreshGit}
                            onOpenGitReview={handleOpenGitReview}
                            onPaneActiveSessionChange={handlePaneActiveSessionChange}
                            onOpenBrowserUrl={handleOpenBrowserUrl}
                            onOpenAutomationsMain={handleOpenAutomations}
                            onOpenCodeViewer={handleOpenCodeViewer}
                            onOpenSubagentSession={handleOpenSubagentSession}
                            onOpenSubagentDirectory={handleOpenSubagentDirectory}
                            onSyncSubagentSessionTabs={handleSyncSubagentSessionTabs}
                            onOpenSelectionSideChat={handleOpenSelectionSideChat}
                            onOpenPlanDetail={handleOpenPlanDetail}
                            onOpenFileLink={handleOpenFileLink}
                            conversationFindQuery={conversationFindQuery}
                            conversationFindActiveIndex={conversationFindActiveIndex}
                            onConversationFindMatchStateChange={onConversationFindMatchStateChange}
                            searchResultHighlightRequest={scopedSearchResultHighlightRequest}
                            onSearchResultHighlightDone={onSearchResultHighlightDone}
                          />
                        </ScopedErrorBoundary>
                      </main>
                    </SplitPanel>
                    <DockTerminalBrowserPanel
                      services={services}
                      workspaceAbsPath={workspaceAbsPath}
                      workspaceIdentity={workspaceIdentity}
                      openWorkspaceKeys={openWorkspaceKeys}
                      isVisible={isDockVisible}
                      isWindowsDesktop={isWindowsDesktop}
                      panelRef={dockPanelRef}
                      panelElementRef={dockPanelElementRef}
                      onClose={() => setIsTerminalOpen(false)}
                      onOpenBrowserUrl={handleOpenBrowserUrl}
                    />
                  </SplitLayoutGroup>
                </SplitPanel>
                {sidePanelElement}
              </SplitLayoutGroup>
            )}
          </section>
        </div>

        {/* ---- 顶栏浮层（§13.1：绝对定位，压在侧栏 h-12 drag 条上） ---- */}
        <ScopedErrorBoundary scope="desktop-top-overlay" resetKeys={overlayResetKeys} variant="silent">
          <TopBarOverlay
            newTaskDisabledReason={workspaceReadOnlyReason}
            workspaceAbsPath={workspaceAbsPath}
            isMacDesktop={isMacDesktop}
            isMacFullscreen={isMacFullscreen}
            macWindowControlsLeftPaddingPx={macWindowControlsLeftPaddingPx}
            windowsWindowControlsRightPaddingPx={windowsWindowControlsRightPaddingPx}
            isWindowsDesktop={isWindowsDesktop}
            isDesktop={isDesktop}
            isSidebarVisible={isSidebarVisible}
            updateReadyVersion={updateReadyVersion}
            updateState={updateState}
            toggleSidebarShortcutLabel={toggleSidebarShortcutLabel}
            newTaskShortcutLabel={newTaskShortcutLabel}
            goBackShortcutLabel={goBackShortcutLabel}
            goForwardShortcutLabel={goForwardShortcutLabel}
            canTaskNavBack={canTaskNavBack}
            canTaskNavForward={canTaskNavForward}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            showNewTaskButton={showNewTaskButton}
            appLogoUrl={appLogoUrl}
            platform={platform}
            onToggleSidebar={handleToggleSidebar}
            onCreateTask={handleCreateTask}
            onGoBack={handleTaskNavBack}
            onGoForward={handleTaskNavForward}
            hideTaskNavigationButtons={simplifyForNarrowRemote}
          />
        </ScopedErrorBoundary>

        {/* ---- 草稿态 caption 菜单（§13.2 Mr 分支 = [H6 终端][S6 ⌄菜单]） ---- */}
        {showDraftCaptionMenu ? (
          <ScopedErrorBoundary scope="draft-caption-menu" resetKeys={workspaceResetKeys} variant="silent">
            <div
              style={draftCaptionInsetStyle}
              className={cn(
                "absolute top-0 z-30 flex h-12 items-center pointer-events-auto [app-region:no-drag]",
                draftCaptionPositionClass,
                draftCaptionBackgroundClass,
              )}
            >
              <TerminalToggleButton
                isTerminalOpen={isTerminalOpen}
                onToggleTerminal={handleToggleTerminal}
                useWindowsCaptionSpacing={isWindowsDesktop}
              />
              <WindowsCaptionMenu
                readOnlyReason={workspaceReadOnlyReason}
                workspaceAbsPath={workspaceAbsPath}
                onCreateTask={handleCreateTask}
                onOpenWorkspace={onOpenWorkspace}
                allowOpenWorkspace={allowOpenWorkspace}
                onToggleTerminal={handleToggleTerminal}
                onToggleBrowser={handleToggleBrowser}
                triggerPresentation={isWindowsDesktop ? "header-borderless" : "header"}
                useWindowsCaptionSpacing={isWindowsDesktop}
              />
            </div>
          </ScopedErrorBoundary>
        ) : null}

        {/* ---- Linux 桌面原生控件让位区（−□×，120px） ---- */}
        {isLinuxDesktop ? (
          <div className="absolute right-0 top-0 z-30 flex h-12 w-[120px] items-center justify-end border-b border-border bg-background pointer-events-auto [app-region:no-drag]">
            <LinuxWindowControls />
          </div>
        ) : null}

        {/* ---- 远控任务切换 loading 遮罩 ---- */}
        {isWebRemoteControlShell && webRemoteTaskSwitching ? (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center bg-background/72 backdrop-blur-[1px]"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle shadow-sm">
              <IconLoader className="size-4 animate-spin" />
              {intl.formatMessage({ id: "common.loading" })}
            </div>
          </div>
        ) : null}
      </div>
    </WindowShell>
  );
});

/** 原 184840-184876 / 185202-185240 的 automations main 子树（两分支共用，结构逐字一致） */
function AutomationsMainContent({
  isDesktop,
  workspaceAbsPath,
  workspaceIdentity,
  workspaceResetKeys,
  handleCreateTaskWithPrompt,
  openAutomationId,
  onOpenAutomationConsumed,
  handleSelectTaskAcrossWorkspaces,
}: {
  isDesktop: boolean;
  workspaceAbsPath: string;
  workspaceIdentity?: string;
  workspaceResetKeys: unknown[];
  handleCreateTaskWithPrompt: (prompt: string) => void;
  openAutomationId?: string | null;
  onOpenAutomationConsumed?: () => void;
  handleSelectTaskAcrossWorkspaces: (workspacePath: string, sessionId: string, workspaceIdentity?: string) => void;
}) {
  return (
    <main id={AUTOMATIONS_MAIN_TOAST_ANCHOR_ID} className="flex min-h-0 flex-1 flex-col bg-background">
      {isDesktop ? (
        <div className="h-12 shrink-0 [app-region:drag]" data-testid="automations-main-drag-region" />
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <ScopedErrorBoundary scope="automations-main" resetKeys={workspaceResetKeys} variant="panel" className="min-h-full">
          <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-4 md:px-6 md:py-6">
            <AutomationsMain
              workspacePath={workspaceAbsPath}
              workspaceIdentity={workspaceIdentity}
              onCreateViaChat={handleCreateTaskWithPrompt}
              openAutomationId={openAutomationId}
              onOpenAutomationConsumed={onOpenAutomationConsumed}
              onOpenSession={({
                sessionId,
                workspacePath,
                workspaceIdentity: targetIdentity,
              }: {
                sessionId: string;
                workspacePath: string;
                workspaceIdentity?: string | null;
              }) => handleSelectTaskAcrossWorkspaces(workspacePath, sessionId, targetIdentity ?? undefined)}
            />
          </div>
        </ScopedErrorBoundary>
      </div>
    </main>
  );
}

/** 原 184365 内联的 workspaceKey 计算（Io） */

/* ============================================================================
 * 13. 壳平台状态 useAppChromeState（原 SJt，js 185445-185564 / jsx 149373-149484）
 * ----------------------------------------------------------------------------
 * 聚合窗口外观相关的原生事件订阅，产出 WorkspaceShell 需要的 6 项：
 *  - Mac 全屏态（交通灯让位切换）
 *  - Win 窗口外观状态（最大化/原生圆角支持 → Rqt 圆角让位）
 *  - Mac/Win 窗口控制区几何（动态让位像素）
 *  - 自动更新就绪版本 + 更新状态（Win 首次就绪弹 toast）
 *  - sidebarContainerRef（侧栏容器句柄，透传给 rVt）
 * ==========================================================================*/

const MAC_TRAFFIC_LIGHTS_PADDING_PX = 96;        // 原 Z5（js 185430）
const WINDOWS_CAPTION_CONTROLS_WIDTH_PX = 136;   // 原 Q5（js 185431）

/** 原 $5（js 185432）：正有限数 → 四舍五入，否则 null */
function roundPositivePx(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

/** 原 bJt（js 185435）：按平台取默认让位像素（Mac 左 96 / Win 右 136） */
function resolveWindowControlsPadding(input: {
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  platform: PlatformService;
}): { leftPaddingPx: number; rightPaddingPx: number } {
  const metrics = input.platform.getWindowControlsOverlayMetrics?.();
  return {
    leftPaddingPx: input.isDesktop && input.isMacDesktop
      ? (roundPositivePx(metrics?.leftPaddingPx) ?? MAC_TRAFFIC_LIGHTS_PADDING_PX)
      : MAC_TRAFFIC_LIGHTS_PADDING_PX,
    rightPaddingPx: input.isDesktop && input.isWindowsDesktop
      ? (roundPositivePx(metrics?.rightPaddingPx) ?? WINDOWS_CAPTION_CONTROLS_WIDTH_PX)
      : WINDOWS_CAPTION_CONTROLS_WIDTH_PX,
  };
}

/** 原 xJt（js 185442）：仅 update-downloaded 携带版本号 */
function updateReadyVersionOf(state: UpdateState | null): string | null {
  return state?.kind === "update-downloaded" ? (state as { version: string }).version : null;
}

interface AppChromeState {
  isMacFullscreen: boolean;
  desktopWindowChromeState: DesktopWindowChromeState | null;
  macWindowControlsLeftPaddingPx: number;
  windowsWindowControlsRightPaddingPx: number;
  updateReadyVersion: string | null;
  updateState: UpdateState | null;
  sidebarContainerRef: React.RefObject<HTMLElement | null>;
}

/** 原 SJt（js 185445-185564） */
function useAppChromeState(input: {
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  platform: PlatformService;
  workspaceAbsPath: string;
}): AppChromeState {
  const { isDesktop, isMacDesktop, isWindowsDesktop, platform, workspaceAbsPath } = input;
  const defaults = resolveWindowControlsPadding({ isDesktop, isMacDesktop, isWindowsDesktop, platform });
  const [isMacFullscreen, setIsMacFullscreen] = React.useState(false);
  const [desktopWindowChromeState, setDesktopWindowChromeState] =
    React.useState<DesktopWindowChromeState | null>(null);
  const [macWindowControlsLeftPaddingPx, setMacWindowControlsLeftPaddingPx] = React.useState<number>(
    () => defaults.leftPaddingPx,
  );
  const [windowsWindowControlsRightPaddingPx, setWindowsWindowControlsRightPaddingPx] = React.useState<number>(
    () => defaults.rightPaddingPx,
  );
  const [updateReadyVersion, setUpdateReadyVersion] = React.useState<string | null>(null);
  const [updateState, setUpdateState] = React.useState<UpdateState | null>(null);
  const sidebarContainerRef = React.useRef<HTMLElement | null>(null);
  const didToastUpdateReadyRef = React.useRef(false);
  const updateStateFetchGenerationRef = React.useRef(0);
  const { intl } = useIntlContext();

  /* Mac 全屏订阅 */
  React.useEffect(() => {
    if (!isDesktop || !isMacDesktop) {
      setIsMacFullscreen(false);
      setMacWindowControlsLeftPaddingPx(MAC_TRAFFIC_LIGHTS_PADDING_PX);
      return;
    }
    return platform.onWindowFullscreenChanged((fullscreen) => {
      setIsMacFullscreen(fullscreen);
    });
  }, [isDesktop, isMacDesktop, platform]);

  /* Win 窗口外观状态：先订阅变更，再补一次快照（代际防乱序） */
  React.useEffect(() => {
    if (!isDesktop || !isWindowsDesktop || !platform.getDesktopWindowChromeState) {
      setDesktopWindowChromeState(null);
      return;
    }
    let disposed = false;
    let generation = 0;
    const unsubscribe = platform.onDesktopWindowChromeStateChanged?.((state) => {
      generation += 1;
      setDesktopWindowChromeState(state);
    });
    const snapshotGeneration = generation;
    platform.getDesktopWindowChromeState().then(
      (state) => {
        if (!disposed && generation === snapshotGeneration) setDesktopWindowChromeState(state);
      },
      (error) => logger.warn("[app-chrome] 同步桌面窗口外观状态失败", { error }),
    );
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [isDesktop, isWindowsDesktop, platform]);

  /* 窗口控制区几何变化（Mac 左 / Win 右） */
  React.useEffect(() => {
    if (!isDesktop || (!isMacDesktop && !isWindowsDesktop) || !platform.onWindowControlsOverlayChanged) {
      setMacWindowControlsLeftPaddingPx(MAC_TRAFFIC_LIGHTS_PADDING_PX);
      setWindowsWindowControlsRightPaddingPx(WINDOWS_CAPTION_CONTROLS_WIDTH_PX);
      return;
    }
    return platform.onWindowControlsOverlayChanged((metrics) => {
      const left = roundPositivePx(metrics.leftPaddingPx);
      const right = roundPositivePx(metrics.rightPaddingPx);
      logger.debug("[app-chrome] 收到原生窗口控制区几何变化", {
        isMacDesktop,
        isWindowsDesktop,
        leftPaddingPx: left,
        rightPaddingPx: right,
      });
      if (isMacDesktop && left !== null) setMacWindowControlsLeftPaddingPx(left);
      if (isWindowsDesktop && right !== null) setWindowsWindowControlsRightPaddingPx(right);
    });
  }, [isDesktop, isMacDesktop, isWindowsDesktop, platform]);

  /* 更新就绪：Win 首次 toast（bottom-left，4s，variant=update） */
  React.useEffect(() => {
    if (platform.onUpdateReady) {
      return platform.onUpdateReady((version) => {
        logger.info("[App] 收到可安装更新", { workspaceAbsPath, version });
        setUpdateReadyVersion(version);
        if (isWindowsDesktop && !didToastUpdateReadyRef.current) {
          didToastUpdateReadyRef.current = true;
          toast(intl.formatMessage({ id: "update.toast.ready" }, { version }), {
            durationMs: 4000,
            position: "bottom-left",
            variant: "update",
          });
        }
      });
    }
    return undefined;
  }, [platform, workspaceAbsPath, isWindowsDesktop, intl]);

  /* 更新状态：快照 + 流式变更 */
  React.useEffect(() => {
    let disposed = false;
    if (platform.getUpdateState) {
      const generation = updateStateFetchGenerationRef.current;
      platform.getUpdateState().then(
        (state) => {
          if (!disposed && updateStateFetchGenerationRef.current === generation) {
            setUpdateState(state);
            setUpdateReadyVersion(updateReadyVersionOf(state));
          }
        },
        (error) => {
          logger.warn("[App] 同步自动更新状态失败", { error });
        },
      );
    }
    if (!platform.onUpdateStateChanged) {
      return () => {
        disposed = true;
      };
    }
    const unsubscribe = platform.onUpdateStateChanged((state) => {
      updateStateFetchGenerationRef.current += 1;
      setUpdateState(state);
      setUpdateReadyVersion(updateReadyVersionOf(state));
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [platform]);

  return {
    isMacFullscreen,
    desktopWindowChromeState,
    macWindowControlsLeftPaddingPx,
    windowsWindowControlsRightPaddingPx,
    updateReadyVersion,
    updateState,
    sidebarContainerRef,
  };
}

/* ============================================================================
 * 14. 会话重建的模型裁决组（原 CJt…jJt，js 185566-185687 / jsx 149485-149584）
 * ----------------------------------------------------------------------------
 * 重建会话（MJt）后需重新拉取草稿 configOptions，并裁决"选中的模型供应商"：
 * 本地偏好（localPreference）与 configOptions 中 model select 的当前值可能不一致，
 * 需要按 供应商注册表/幽灵供应商/内置供应商 规则仲裁。
 * ==========================================================================*/

const RELOAD_SESSION_DEBOUNCE_MS = 1200; // 原 CJt

/** 原 wJt（js 185567）：重建失败 → 带上下文的 Error（VUe 归一化） */
function toReloadSessionError(
  error: unknown,
  input: { workspacePath: string; provider: string },
): Error {
  return normalizeReloadError(error, {
    workspacePath: input.workspacePath,
    provider: input.provider,
    // 源实现附带 reason/attempt 元数据（attempt=1, maxAttempts=1, reason='reload-session'）
  });
}

/** 原 TJt（js 185574）：1200ms 内的重复重建请求视为抖动 */
function withinReloadDebounce(lastAttemptAt: number | null, now: number, windowMs = RELOAD_SESSION_DEBOUNCE_MS): boolean {
  return lastAttemptAt === null ? false : now - lastAttemptAt < windowMs;
}

/** 原 EJt（js 185578）：从 configOptions 取 category=model&type=select 的当前值 */
function pickSelectedModelFromConfigOptions(configOptions: ConfigOption[]): string | null {
  const modelSelect = configOptions.find((option) => option.category === "model" && option.type === "select");
  return typeof modelSelect?.currentValue === "string" && modelSelect.currentValue.trim().length > 0
    ? modelSelect.currentValue.trim()
    : null;
}

/** 原 e7（js 185584）：'provider/model' → providerId（先按完整模型引用解析，再按 '/' 切分） */
function parseProviderIdFromModelRef(modelRef: string): string | null {
  const trimmed = modelRef.trim();
  if (!trimmed) return null;
  const parsed = parseModelRef(trimmed);
  if (parsed?.providerId.trim()) return parsed.providerId.trim();
  const slashIndex = trimmed.indexOf("/");
  return slashIndex <= 0 || slashIndex >= trimmed.length - 1 ? null : trimmed.slice(0, slashIndex).trim() || null;
}

/** 原 DJt（js 185591）：按 id 找自定义供应商（排除 builtin 与幽灵 id） */
function findCustomModelProvider(providers: ModelProviderInfo[], providerId: string): ModelProviderInfo | null {
  const trimmed = providerId.trim();
  if (!trimmed) return null;
  const match = providers.find((provider) => provider.id.trim() === trimmed);
  return !match || match.source === "builtin" || isGhostSupplierId(match.id) ? null : match;
}

/** 原 OJt（js 185598）：configOptions 的供应商 ≠ 本地偏好供应商 且目标可用 → 失配 */
function isProviderMismatch(input: {
  configOptions: ConfigOption[];
  localPreferenceProviderId: string;
  modelProviders: ModelProviderInfo[];
}): boolean {
  const configProviderId = parseProviderIdFromModelRef(pickSelectedModelFromConfigOptions(input.configOptions) ?? "");
  return !configProviderId || configProviderId === input.localPreferenceProviderId
    ? false
    : isGhostSupplierId(configProviderId)
      ? true
      : input.modelProviders.some((provider) => provider.id.trim() === configProviderId);
}

/** 原 kJt（js 185605）：裁决选中供应商键：configOptions 优先，其次本地偏好，最后默认 */
function resolveSelectedSupplierKey(input: {
  zcodeProvider: string;
  configOptions: ConfigOption[];
  localPreference: string | null;
  modelProviders: ModelProviderInfo[];
  providersReady: boolean;
}): string {
  const configProviderId = parseProviderIdFromModelRef(pickSelectedModelFromConfigOptions(input.configOptions) ?? "");
  if (
    (configProviderId && input.modelProviders.some((provider) => provider.id.trim() === configProviderId)) ||
    (configProviderId && findCustomModelProvider(input.modelProviders, configProviderId))
  ) {
    return supplierKeyFromProviderId(configProviderId);
  }
  const preferenceProviderId = parseProviderIdFromModelRef(input.localPreference ?? "");
  return preferenceProviderId &&
    (!input.providersReady || input.modelProviders.some((provider) => provider.id.trim() === preferenceProviderId))
    ? supplierKeyFromProviderId(preferenceProviderId)
    : defaultSupplierKeyForProvider(input.zcodeProvider);
}

/** 原 AJt（js 185614）：本地偏好是否应参与裁决（存在且未失配） */
function shouldUseLocalPreference(input: {
  localPreference: string | null;
  configOptions: ConfigOption[];
  modelProviders: ModelProviderInfo[];
  providersReady: boolean;
}): boolean {
  if (!input.localPreference) return false;
  const preferenceProviderId = parseProviderIdFromModelRef(input.localPreference);
  return !preferenceProviderId || !input.providersReady
    ? true
    : isProviderMismatch({
        configOptions: input.configOptions,
        localPreferenceProviderId: preferenceProviderId,
        modelProviders: input.modelProviders,
      })
      ? false
      : !!input.modelProviders.some((provider) => provider.id.trim() === preferenceProviderId);
}

/** 原 jJt（js 185624-185687）：工作区模型选择裁决。
 *  内置供应商（Ei）走本地快路径；否则调 modelProviderService 远程裁决，失败回退原样。 */
async function resolveWorkspaceModelSelection(input: {
  modelProviderService: WorkspaceServices["modelProviderService"];
  zcodeProvider: string;
  workspacePath: string;
  workspaceIdentity?: string;
  configOptions: ConfigOption[];
  applySelectedModel?: boolean;
}): Promise<{ resolvedConfigOptions: ConfigOption[]; resolution: ModelSelectionResolution | null }> {
  const localPreference = readLocalPreferenceForDraft(input.zcodeProvider, input.workspacePath, input.workspaceIdentity);
  if (isLocalBuiltinProvider(input.zcodeProvider)) {
    const applySelectedModel = input.applySelectedModel ?? true;
    const modelProviders = getModelProviderRegistry();
    const providersReady = isModelProviderRegistryReady();
    const resolvedConfigOptions =
      applySelectedModel &&
      shouldUseLocalPreference({
        localPreference,
        configOptions: input.configOptions,
        modelProviders,
        providersReady,
      }) &&
      localPreference
        ? applySelectedModelToConfigOptions(input.configOptions, localPreference, input.zcodeProvider)
        : [...input.configOptions];
    return {
      resolvedConfigOptions,
      resolution: {
        selectedSupplierKey: resolveSelectedSupplierKey({
          zcodeProvider: input.zcodeProvider,
          configOptions: resolvedConfigOptions,
          localPreference,
          modelProviders,
          providersReady,
        }),
        selectedModel: null,
        isGhostSupplier: false,
        supplierMismatchReason: null,
        uiError: null,
        shouldClearLocalPreference: false,
      },
    };
  }
  try {
    const resolution = await input.modelProviderService.resolveWorkspaceModelSelection({
      zcodeProvider: input.zcodeProvider,
      workspacePath: input.workspacePath,
      workspaceIdentity: input.workspaceIdentity,
      modelProviders: getModelProviderRegistry(),
      localPreference,
      providersReady: isModelProviderRegistryReady(),
    });
    return {
      resolvedConfigOptions:
        (input.applySelectedModel ?? true) && resolution.selectedModel
          ? applySelectedModelToConfigOptions(input.configOptions, resolution.selectedModel, input.zcodeProvider)
          : [...input.configOptions],
      resolution,
    };
  } catch (error) {
    logger.warn(
      `[zcodeModelSelectionResolution] 裁决失败，回退到原始 configOptions provider=${input.zcodeProvider}`,
      error,
    );
    return { resolvedConfigOptions: [...input.configOptions], resolution: null };
  }
}

/* ============================================================================
 * 15. useReloadSession（原 MJt，js 185688-185784 / jsx 149585-149670）
 * ----------------------------------------------------------------------------
 * 会话重建状态机：
 *   idle →（节流 1200ms）→ initializing →（restartWorkspaceProcess）
 *     无 resumeTaskId 时：configOptions loading → 拉草稿配置(NM) → 合并($6e)
 *       → 模型裁决(jJt) → ready + toast 成功
 *     失败：init failed + configOptions error + draftError + toast 失败
 * 仅当活动工作区 tab 与当前工作区一致时附带 workspaceIdentity。
 * ==========================================================================*/

function useReloadSession(input: {
  intl: IntlShape;
  services: WorkspaceServices;
  workspaceAbsPath: string;
  reloadSessionDisabled: boolean;
}): { reloadSessionPending: boolean; handleReloadSession: (options?: { provider?: string; resumeTaskId?: string }) => Promise<void> } {
  const { intl, services, workspaceAbsPath, reloadSessionDisabled } = input;
  const [reloadSessionPending, setReloadSessionPending] = React.useState(false);
  const activeWorkspaceIdentity = useWorkspaceTabs((state) => {
    if (!state.activeTabId) return undefined;
    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
    if (!activeTab || !isWorkspaceTab(activeTab) || activeTab.workspacePath !== workspaceAbsPath) return undefined;
    return activeTab.workspaceIdentity ?? undefined;
  });
  const lastAttemptAtRef = React.useRef<number | null>(null);

  const handleReloadSession = React.useCallback(
    async (options?: { provider?: string; resumeTaskId?: string }) => {
      if (reloadSessionDisabled || reloadSessionPending) return;
      const now = Date.now();
      if (withinReloadDebounce(lastAttemptAtRef.current, now)) {
        logger.info(`[App] 忽略重复 workspace session 重建请求 workspace=${workspaceAbsPath}`);
        return;
      }
      lastAttemptAtRef.current = now;
      setReloadSessionPending(true);
      const store = taskStore.getState();
      const workspaceState = store.getWorkspaceState(workspaceAbsPath, activeWorkspaceIdentity);
      const draftSlice = deriveDraftStateSlice(workspaceState);
      const provider = options?.provider ?? draftSlice.provider;
      const resumeTaskId = options?.resumeTaskId?.trim() || workspaceState.activeTaskId || undefined;
      const isFreshDraft = !resumeTaskId;
      store.setWorkspaceInitState(workspaceAbsPath, "initializing", null, activeWorkspaceIdentity);
      if (isFreshDraft) {
        store.setConfigOptionsStatus(workspaceAbsPath, "loading", activeWorkspaceIdentity);
        store.setDraftError(workspaceAbsPath, null, activeWorkspaceIdentity);
        store.setTaskState(workspaceAbsPath, "idle", null, activeWorkspaceIdentity);
      }
      try {
        await services.zcodeTaskService.restartWorkspaceProcess({
          workspacePath: workspaceAbsPath,
          ...(activeWorkspaceIdentity ? { workspaceIdentity: activeWorkspaceIdentity } : {}),
          provider,
          resumeTaskId,
        });
        if (isFreshDraft) {
          const draftConfig = await fetchDraftConfigOptions({
            workspacePath: workspaceAbsPath,
            workspaceIdentity: activeWorkspaceIdentity,
            provider,
            zcodeSessionService: services.zcodeSessionService,
          });
          const latestState = store.getWorkspaceState(workspaceAbsPath, activeWorkspaceIdentity);
          if (latestState.selectedProvider === provider) {
            const merged = mergeConfigOptions(latestState.configOptions ?? [], draftConfig.configOptions ?? [], provider);
            const { resolvedConfigOptions, resolution } = await resolveWorkspaceModelSelection({
              modelProviderService: services.modelProviderService,
              zcodeProvider: provider,
              workspacePath: workspaceAbsPath,
              workspaceIdentity: activeWorkspaceIdentity,
              configOptions: merged,
            });
            if (store.getWorkspaceState(workspaceAbsPath, activeWorkspaceIdentity).selectedProvider === provider) {
              if (resolution) {
                store.setModelSelectionResolution(
                  workspaceAbsPath,
                  {
                    selectedSupplierKey: resolution.selectedSupplierKey,
                    isGhostSupplier: resolution.isGhostSupplier,
                    supplierMismatchReason: resolution.supplierMismatchReason,
                  },
                  activeWorkspaceIdentity,
                );
              }
              if (resolution?.shouldClearLocalPreference) {
                clearLocalModelPreference(provider, workspaceAbsPath, activeWorkspaceIdentity);
              }
              store.setConfigOptions(workspaceAbsPath, resolvedConfigOptions, activeWorkspaceIdentity);
              store.setConfigOptionsStatus(workspaceAbsPath, "ready", activeWorkspaceIdentity);
              store.setSlashCommands(workspaceAbsPath, draftConfig.slashCommands ?? [], activeWorkspaceIdentity);
              store.setDraftError(workspaceAbsPath, null, activeWorkspaceIdentity);
            }
          }
        }
        store.setWorkspaceInitAttempts(workspaceAbsPath, 0, activeWorkspaceIdentity);
        store.setWorkspaceInitState(workspaceAbsPath, "ready", null, activeWorkspaceIdentity);
        logger.info(
          `[App] workspace session 重建完成 workspace=${workspaceAbsPath} provider=${provider} resumeTaskId=${resumeTaskId ?? "<none>"}`,
        );
        toast(intl.formatMessage({ id: "appHeader.reloadSessionSuccess" }));
      } catch (error) {
        const normalized = toReloadSessionError(error, { workspacePath: workspaceAbsPath, provider });
        logger.warn(`[App] workspace session 重建失败 workspace=${workspaceAbsPath} provider=${provider}`, {
          resumeTaskId: resumeTaskId ?? null,
          message: normalized.message,
        });
        store.setWorkspaceInitState(workspaceAbsPath, "failed", normalized.message, activeWorkspaceIdentity);
        if (isFreshDraft) {
          store.setConfigOptionsStatus(workspaceAbsPath, "error", activeWorkspaceIdentity);
          store.setDraftError(workspaceAbsPath, normalized, activeWorkspaceIdentity);
        }
        toast(intl.formatMessage({ id: "appHeader.reloadSessionFailed" }));
      } finally {
        setReloadSessionPending(false);
      }
    },
    [intl, reloadSessionDisabled, reloadSessionPending, services.zcodeTaskService, services.modelProviderService, services.zcodeSessionService, workspaceAbsPath, activeWorkspaceIdentity],
  );

  return { reloadSessionPending, handleReloadSession };
}

/* ============================================================================
 * 16. useWorkspaceLifecycle（原 NJt，js 185785-185824 / jsx 149671-149696）
 * ----------------------------------------------------------------------------
 *  - 工作区路径变化 → 清空浏览器导航请求与测试消息
 *  - 卸载时：若无活动任务、无 creating/streaming 运行时、且预热状态非 idle，
 *    回退预热（init attempts=0、state=idle）并 releaseWorkspacePreparation。
 * ==========================================================================*/

function useWorkspaceLifecycle(input: {
  workspaceAbsPath: string;
  workspaceIdentity?: string;
  services: WorkspaceServices;
  setBrowserNavigationRequest: (request: unknown) => void;
  setTestMessages: (messages: unknown[] | null) => void;
}): void {
  const { workspaceAbsPath, workspaceIdentity, services, setBrowserNavigationRequest, setTestMessages } = input;
  const previousWorkspacePathRef = React.useRef(workspaceAbsPath);

  React.useEffect(() => {
    if (previousWorkspacePathRef.current !== workspaceAbsPath) {
      previousWorkspacePathRef.current = workspaceAbsPath;
      setBrowserNavigationRequest(null);
      setTestMessages(null);
    }
  }, [setBrowserNavigationRequest, setTestMessages, workspaceAbsPath]);

  React.useEffect(
    () => () => {
      const workspaceState = taskStore.getState().getWorkspaceState(workspaceAbsPath);
      const taskSlice = deriveTaskStateSlice(workspaceState);
      if (
        workspaceState.activeTaskId ||
        taskSlice.taskStatus === "creating" ||
        taskSlice.taskStatus === "streaming" ||
        getWorkspaceInitSlice(workspaceState).status === "idle"
      ) {
        return;
      }
      const provider = workspaceState.selectedProvider;
      logger.info(`[App] 回退 workspace 预热状态 workspace=${workspaceAbsPath} provider=${provider}`);
      taskStore.getState().setWorkspaceInitAttempts(workspaceAbsPath, 0, workspaceIdentity);
      taskStore.getState().setWorkspaceInitState(workspaceAbsPath, "idle", null, workspaceIdentity);
      services.zcodeTaskService
        .releaseWorkspacePreparation({
          workspacePath: workspaceAbsPath,
          ...(workspaceIdentity ? { workspaceIdentity } : {}),
          provider,
        })
        .catch((error) => {
          logger.error(`[App] 释放 workspace 预热态失败 workspace=${workspaceAbsPath} provider=${provider}:`, error);
        });
    },
    [services.zcodeTaskService, workspaceIdentity, workspaceAbsPath],
  );
}

/* ============================================================================
 * 17. 工作区 zcode 状态选择器（原 PJt/FJt/IJt/LJt/t7，js 185825-185882 / jsx 149697-149745）
 * ==========================================================================*/

/** 原 PJt（js 185825）：任务运行时活跃三态 */
function isTaskRuntimeActive(status: string): boolean {
  return status === "creating" || status === "restoring" || status === "streaming";
}

/** 原 FJt（js 185828）：乐观任务表 + 列表缓存 → taskId→provider 映射 */
function mergeTaskProviders(
  optimisticTaskListByTaskId: Record<string, { provider?: string }>,
  taskListCache: Array<{ taskId: string; provider?: string }>,
): Record<string, string> {
  const providers: Record<string, string> = {};
  for (const entry of taskListCache ?? []) {
    if (entry.provider) providers[entry.taskId] = entry.provider;
  }
  for (const [taskId, optimistic] of Object.entries(optimisticTaskListByTaskId)) {
    if (optimistic.provider) providers[taskId] = optimistic.provider;
  }
  return providers;
}

/** 原 IJt（js 185835）：是否存在"同供应商的活跃运行时" → 重建禁用依据 */
function hasActiveTaskRuntimeForProvider(
  provider: string,
  taskRuntimeByTaskId: Record<string, { status: string; provider?: string }>,
  optimisticTaskListByTaskId: Record<string, { provider?: string }>,
  taskListCache: Array<{ taskId: string; provider?: string }>,
  activeTaskId: string | null,
): boolean {
  const providersByTaskId = mergeTaskProviders(optimisticTaskListByTaskId, taskListCache);
  const activeTaskIdTrimmed = activeTaskId?.trim() ?? "";
  for (const [taskId, runtime] of Object.entries(taskRuntimeByTaskId)) {
    if (!isTaskRuntimeActive(runtime.status)) continue;
    const runtimeProvider = runtime.provider ?? providersByTaskId[taskId];
    if (!runtimeProvider) {
      if (activeTaskIdTrimmed.length > 0 && activeTaskIdTrimmed === taskId) return true;
      continue;
    }
    if (runtimeProvider === provider) return true;
  }
  return false;
}

/** 原 co（skillStore chunk）：zustand shallow 选择器包装（接口级） */
declare function shallowSelector<T>(selector: T): T;

/** 原 LJt（js 185847-185880）：供 WorkspaceShell 消费的成对选择器。
 *  workspaceShellZCodeState：渲染所需的最小状态投影（shallow 比较）；
 *  reloadSessionDisabled：任一活跃运行时与草稿供应商同供应商 → 禁用重建。 */
function useWorkspaceShellZCodeState(workspaceAbsPath: string, workspaceIdentity?: string): {
  workspaceShellZCodeState: WorkspaceStateSlice;
  reloadSessionDisabled: boolean;
} {
  return {
    workspaceShellZCodeState: useTaskStore(
      shallowSelector((state: TaskStoreState): WorkspaceStateSlice => {
        const workspaceState = getWorkspaceStateSelector(state, workspaceAbsPath, workspaceIdentity);
        const taskSlice = deriveTaskStateSlice(workspaceState);
        return {
          activeTaskId: workspaceState.activeTaskId,
          draftFocusVersion: workspaceState.draftFocusVersion,
          modelSwitchPending: workspaceState.modelSwitchPending,
          modelSwitchStage: workspaceState.modelSwitchStage,
          selectedProvider: workspaceState.selectedProvider,
          selectedSupplierKey: workspaceState.selectedSupplierKey,
          configOptions: workspaceState.configOptions,
          optimisticTaskListByTaskId: workspaceState.optimisticTaskListByTaskId,
          workspaceInit: workspaceState.workspaceInit,
          taskStatus: taskSlice.taskStatus,
          taskError: taskSlice.taskError,
        };
      }),
    ),
    reloadSessionDisabled: useTaskStore((state: TaskStoreState) => {
      const workspaceState = getWorkspaceStateSelector(state, workspaceAbsPath, workspaceIdentity);
      return hasActiveTaskRuntimeForProvider(
        deriveDraftStateSlice(workspaceState).provider,
        workspaceState.taskRuntimeByTaskId ?? {},
        workspaceState.optimisticTaskListByTaskId,
        workspaceState.taskListCache ?? [],
        workspaceState.activeTaskId,
      );
    }),
  };
}

/** 原 t7（js 185881）：模型运行时重建中（阻断任务切换导航） */
function isRestartingRuntime(modelSwitchPending: boolean, modelSwitchStage: string | null): boolean {
  return modelSwitchPending && modelSwitchStage === "restartingRuntime";
}

/* ============================================================================
 * 18. useTaskNavigation（原 zJt，js 185889-186063 / jsx 149753-149916）
 * ----------------------------------------------------------------------------
 * 任务选择与前进/后退导航状态机：
 *  - 模型运行时重建中（restartingRuntime）→ 阻断并 toast 'taskList.switchBlockedByModelRestart'
 *  - 选择任务：激活工作区 tab → 清除未读（乐观 + 回滚链）→ setActiveTaskId
 *  - 后退/前进：弹出导航历史，跳过已不存在的任务（RJt 可见性裁决），
 *    自动化条目（oe）走 automations 导航；历史耗尽 → toast 'taskNav.noMore*'
 * ==========================================================================*/

/** 原 RJt（js 185884）：导航历史条目是否仍可见（任务列表或搜索元数据中） */
function isTaskStillVisible(input: {
  entry: TaskNavItem;
  visibleTasks: VisibleTask[];
  taskMetaByEntityKey: SearchResultsState["taskMetaByEntityKey"];
}): boolean {
  if (input.visibleTasks.some((task) => task.taskId === input.entry.taskId)) return true;
  const meta = input.taskMetaByEntityKey[taskEntityKey(input.entry)];
  return meta ? meta.taskId === input.entry.taskId : false;
}

function useTaskNavigation(input: {
  intl: IntlShape;
  workspaceAbsPath: string;
  workspaceIdentity?: string;
  activateTabByPath: (path: string, options?: { workspaceIdentity?: string }) => boolean;
  onNavigateToTask?: () => void;
  onNavigateToAutomations?: (target: { workspacePath: string; workspaceIdentity?: string; automationId?: string }) => void;
}): {
  handleSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string) => void;
  handleOpenAutomations: (automationId?: string) => void;
  handleTaskNavBack: () => void;
  handleTaskNavForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  canTaskNavBack: boolean;
  canTaskNavForward: boolean;
} {
  const { intl, workspaceAbsPath, workspaceIdentity, activateTabByPath, onNavigateToTask, onNavigateToAutomations } = input;
  const services = useServices();
  const workspaceTabsStore = useWorkspaceTabsStore();
  const setActiveTaskId = useTaskStore((state) => state.setActiveTaskId);
  const taskNavHistory = useTaskStore((state) => state.taskNavHistory);
  const taskNavPushAutomations = useTaskStore((state) => state.taskNavPushAutomations);
  const taskNavGoBack = useTaskStore((state) => state.taskNavGoBack);
  const taskNavGoForward = useTaskStore((state) => state.taskNavGoForward);
  const removeTaskFromNavHistory = useTaskStore((state) => state.removeTaskFromNavHistory);

  /** 原 h（185907）：选择任务（含未读清除乐观链） */
  const handleSelectTask = React.useCallback(
    (targetWorkspacePath: string, taskId: string, targetIdentity?: string) => {
      const workspaceState = taskStore.getState().getWorkspaceState(targetWorkspacePath, targetIdentity);
      if (isRestartingRuntime(workspaceState.modelSwitchPending, workspaceState.modelSwitchStage)) {
        logger.info(
          `[App] 模型运行时重建中，忽略 task 切换 workspace=${targetWorkspacePath} taskId=${taskId} stage=${workspaceState.modelSwitchStage}`,
        );
        toast(intl.formatMessage({ id: "taskList.switchBlockedByModelRestart" }));
        return;
      }
      activateTabByPath(targetWorkspacePath, targetIdentity ? { workspaceIdentity: targetIdentity } : undefined);
      const activeTab = workspaceTabsStore.tabs.find((tab) => tab.id === workspaceTabsStore.activeTabId);
      const targetKey = workspaceKey(targetWorkspacePath, targetIdentity);
      const isActiveTabSameWorkspace = !!(
        activeTab &&
        isWorkspaceTab(activeTab) &&
        workspaceKey(activeTab.workspacePath, activeTab.workspaceIdentity) === targetKey
      );
      const remoteSessionId = activeTab && isWorkspaceTab(activeTab) && isActiveTabSameWorkspace
        ? activeTab.remoteSessionId ?? undefined
        : undefined;
      const resolvedIdentity = activeTab && isWorkspaceTab(activeTab) && isActiveTabSameWorkspace
        ? (activeTab.workspaceIdentity ?? targetIdentity)
        : targetIdentity;
      const taskRef = { taskId, workspacePath: targetWorkspacePath, ...(resolvedIdentity ? { workspaceIdentity: resolvedIdentity } : {}) };
      const entityKey = taskEntityKey(taskRef);
      const previousUnreadAt = searchResultsStore.getState().taskMetaByEntityKey[entityKey]?.unreadAt;
      const wasUnread = typeof previousUnreadAt === "number";
      const isRemoteAttachedWorkspace = !!(
        resolvedIdentity ||
        (activeTab && isWorkspaceTab(activeTab) && isActiveTabSameWorkspace && (activeTab.remoteSessionId || activeTab.remoteTarget))
      );
      if (wasUnread) {
        markTaskUnreadLocally(taskRef, undefined);
        const remoteServices = remoteSessionId
          ? (getRemoteSessionRegistryEntry(remoteSessionId)?.services ?? null)
          : isRemoteAttachedWorkspace
            ? null
            : services;
        if (remoteServices) {
          remoteServices.zcodeTaskService
            .setTaskUnread({ ...taskRef, unread: false })
            .then((result) => {
              applyTaskUnreadAt(taskRef, result.unreadAt);
              flushUnreadPersistence();
            })
            .catch((error) => {
              rollbackTaskUnread(taskRef, previousUnreadAt);
              queueUnreadPersistence([taskRef]);
              flushUnreadPersistence();
              logger.warn(
                `[App] 选择 task 时清除未读状态失败 workspace=${targetWorkspacePath} taskId=${taskId}:`,
                error instanceof Error ? error.message : String(error),
              );
            });
        } else {
          rollbackTaskUnread(taskRef, previousUnreadAt);
          logger.warn(
            `[App] 选择 task 时跳过未读持久化，远程 workspace 未连接 workspace=${targetWorkspacePath} taskId=${taskId}`,
          );
        }
      }
      setActiveTaskId(targetWorkspacePath, taskId, resolvedIdentity);
      onNavigateToTask?.();
    },
    [activateTabByPath, intl, onNavigateToTask, services, workspaceTabsStore, setActiveTaskId],
  );

  /** 原 g（185953）：打开自动化主视图（推入导航历史） */
  const handleOpenAutomations = React.useCallback(
    (automationId?: string) => {
      const trimmed = automationId?.trim() || undefined;
      taskNavPushAutomations(workspaceAbsPath, workspaceIdentity, trimmed);
      onNavigateToAutomations?.({
        workspacePath: workspaceAbsPath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        ...(trimmed ? { automationId: trimmed } : {}),
      });
    },
    [onNavigateToAutomations, taskNavPushAutomations, workspaceAbsPath, workspaceIdentity],
  );

  /** 原 _（185964）：任务后退 */
  const handleTaskNavBack = React.useCallback(() => {
    const workspaceState = taskStore.getState().getWorkspaceState(workspaceAbsPath);
    if (isRestartingRuntime(workspaceState.modelSwitchPending, workspaceState.modelSwitchStage)) {
      logger.info(
        `[App] 模型运行时重建中，忽略任务后退导航 workspace=` + workspaceAbsPath + ` stage=` + workspaceState.modelSwitchStage,
      );
      toast(intl.formatMessage({ id: "taskList.switchBlockedByModelRestart" }));
      return;
    }
    let entry = taskNavGoBack();
    const taskMetaByEntityKey = searchResultsStore.getState().taskMetaByEntityKey;
    while (entry) {
      const candidate = entry;
      if (isAutomationsNavEntry(candidate)) {
        activateTabByPath(
          candidate.workspacePath,
          candidate.workspaceIdentity ? { workspaceIdentity: candidate.workspaceIdentity } : undefined,
        );
        onNavigateToAutomations?.({
          workspacePath: candidate.workspacePath,
          ...(candidate.workspaceIdentity ? { workspaceIdentity: candidate.workspaceIdentity } : {}),
          ...(candidate.automationId ? { automationId: candidate.automationId } : {}),
        });
        return;
      }
      if (
        isTaskStillVisible({
          entry: candidate,
          visibleTasks: getVisibleTasks(taskStore.getState().getWorkspaceState(candidate.workspacePath, candidate.workspaceIdentity)),
          taskMetaByEntityKey,
        })
      ) {
        handleSelectTask(candidate.workspacePath, candidate.taskId!, candidate.workspaceIdentity);
        return;
      }
      removeTaskFromNavHistory(candidate.taskId!);
      entry = taskNavGoBack();
    }
    toast(intl.formatMessage({ id: "taskNav.noMoreBack" }));
  }, [activateTabByPath, handleSelectTask, intl, onNavigateToAutomations, removeTaskFromNavHistory, taskNavGoBack, workspaceAbsPath]);

  /** 原 v（186004）：任务前进（镜像后退） */
  const handleTaskNavForward = React.useCallback(() => {
    const workspaceState = taskStore.getState().getWorkspaceState(workspaceAbsPath);
    if (isRestartingRuntime(workspaceState.modelSwitchPending, workspaceState.modelSwitchStage)) {
      logger.info(
        `[App] 模型运行时重建中，忽略任务前进导航 workspace=` + workspaceAbsPath + ` stage=` + workspaceState.modelSwitchStage,
      );
      toast(intl.formatMessage({ id: "taskList.switchBlockedByModelRestart" }));
      return;
    }
    let entry = taskNavGoForward();
    const taskMetaByEntityKey = searchResultsStore.getState().taskMetaByEntityKey;
    while (entry) {
      const candidate = entry;
      if (isAutomationsNavEntry(candidate)) {
        activateTabByPath(
          candidate.workspacePath,
          candidate.workspaceIdentity ? { workspaceIdentity: candidate.workspaceIdentity } : undefined,
        );
        onNavigateToAutomations?.({
          workspacePath: candidate.workspacePath,
          ...(candidate.workspaceIdentity ? { workspaceIdentity: candidate.workspaceIdentity } : {}),
          ...(candidate.automationId ? { automationId: candidate.automationId } : {}),
        });
        return;
      }
      if (
        isTaskStillVisible({
          entry: candidate,
          visibleTasks: getVisibleTasks(taskStore.getState().getWorkspaceState(candidate.workspacePath, candidate.workspaceIdentity)),
          taskMetaByEntityKey,
        })
      ) {
        handleSelectTask(candidate.workspacePath, candidate.taskId!, candidate.workspaceIdentity);
        return;
      }
      removeTaskFromNavHistory(candidate.taskId!);
      entry = taskNavGoForward();
    }
    toast(intl.formatMessage({ id: "taskNav.noMoreForward" }));
  }, [activateTabByPath, handleSelectTask, intl, onNavigateToAutomations, removeTaskFromNavHistory, taskNavGoForward, workspaceAbsPath]);

  const canGoBack = canTaskNavBack(taskNavHistory);   // 原 y
  const canGoForward = canTaskNavForward(taskNavHistory); // 原 b
  const currentWorkspaceState = taskStore.getState().getWorkspaceState(workspaceAbsPath);
  const isModelRestarting = isRestartingRuntime(currentWorkspaceState.modelSwitchPending, currentWorkspaceState.modelSwitchStage);

  return {
    handleSelectTask,
    handleOpenAutomations,
    handleTaskNavBack,
    handleTaskNavForward,
    canGoBack,
    canGoForward,
    canTaskNavBack: canGoBack && !isModelRestarting,
    canTaskNavForward: canGoForward && !isModelRestarting,
  };
}

/* ============================================================================
 * 19. useBrowserRestoreUrls（原 BJt，js 186064-186109 / jsx 149917-149967）
 * ----------------------------------------------------------------------------
 * 按工作区（moe 键）持久化浏览器标签 url 与激活 git 源；任务切换时：
 * 旧键写回当前 git 源 → 新键恢复 {browser: browserUrl, ...browserUrls}。
 * ==========================================================================*/

function useBrowserRestoreUrls(input: {
  activeTaskId: string | null;
  gitSelectedSourceId: string;
  setGitSelectedSourceId: (sourceId: string) => void;
  workspaceAbsPath: string;
  workspaceIdentity?: string;
}): {
  browserRestoreUrls: Record<string, string> | undefined;
  handleBrowserUrlChange: (tabId: string, url: string) => void;
} {
  const { activeTaskId, gitSelectedSourceId, setGitSelectedSourceId, workspaceAbsPath, workspaceIdentity } = input;
  const uiStateKey = React.useMemo(
    () => perTaskUiStateKey({ workspacePath: workspaceAbsPath, workspaceIdentity, taskId: activeTaskId }),
    [activeTaskId, workspaceAbsPath, workspaceIdentity],
  );
  const previousKeyRef = React.useRef(uiStateKey);
  const [browserRestoreUrls, setBrowserRestoreUrls] = React.useState<Record<string, string> | undefined>(() => {
    const stored = readPerTaskUiState(uiStateKey);
    return stored.browserUrl ? { browser: stored.browserUrl, ...stored.browserUrls } : stored.browserUrls;
  });
  const latestGitSourceIdRef = React.useRef(gitSelectedSourceId);
  latestGitSourceIdRef.current = gitSelectedSourceId;

  React.useEffect(() => {
    const previousKey = previousKeyRef.current;
    if (previousKey === uiStateKey) return;
    writePerTaskUiState(previousKey, { activeGitSourceId: latestGitSourceIdRef.current });
    const stored = readPerTaskUiState(uiStateKey);
    previousKeyRef.current = uiStateKey;
    setGitSelectedSourceId(stored.activeGitSourceId ?? "unstaged");
    setBrowserRestoreUrls(stored.browserUrl ? { browser: stored.browserUrl, ...stored.browserUrls } : stored.browserUrls);
  }, [uiStateKey, setGitSelectedSourceId]);

  React.useEffect(
    () => () => {
      writePerTaskUiState(previousKeyRef.current, { activeGitSourceId: latestGitSourceIdRef.current });
    },
    [],
  );

  const handleBrowserUrlChange = React.useCallback(
    (tabId: string, url: string) => {
      setBrowserRestoreUrls((previous) => ({ ...previous, [tabId]: url }));
      writePerTaskUiState(uiStateKey, {
        browserUrls: { ...readPerTaskUiState(uiStateKey).browserUrls, [tabId]: url },
      });
    },
    [uiStateKey],
  );

  return { browserRestoreUrls, handleBrowserUrlChange };
}

/* ============================================================================
 * 20. 活动目标解析（原 n7/VJt，js 186110-186118 / jsx 149968-149984）
 * ==========================================================================*/

/** 原 n7 */
function trimmedOrUndefined(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

/** 原 VJt：活动工作区 tab 的身份/远程会话优先，其次显式 props */
function resolveActiveWorkspaceTarget(input: {
  activeTarget: { workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: RemoteTarget };
  explicitWorkspaceIdentity?: string;
  explicitRemoteSessionId?: string;
}): { workspaceIdentity?: string; remoteSessionId?: string; remoteTarget?: RemoteTarget } {
  return {
    workspaceIdentity: trimmedOrUndefined(input.activeTarget.workspaceIdentity) ?? trimmedOrUndefined(input.explicitWorkspaceIdentity),
    remoteSessionId: trimmedOrUndefined(input.activeTarget.remoteSessionId) ?? trimmedOrUndefined(input.explicitRemoteSessionId),
    remoteTarget: input.activeTarget.remoteTarget,
  };
}

/* ============================================================================
 * 21. 闲时任务通知（原 HJt/UJt/WJt，js 186119-186168 / jsx 149985-150039）
 * ----------------------------------------------------------------------------
 * 30s 轮询 offPeakTaskService.list()，状态迁移到 completed/failed 时发系统通知。
 * ==========================================================================*/

const OFF_PEAK_POLL_INTERVAL_MS = 30000; // 原 HJt

/** 原 UJt */
function toOffPeakNotifyStatus(status: string): "completed" | "failed" | null {
  return status === "completed" ? "completed" : status === "failed" ? "failed" : null;
}

/** 原 WJt（js 186123-186168） */
function useOffPeakNotifications(input: {
  offPeakTaskService: WorkspaceServices["offPeakTaskService"];
  platform: PlatformService;
  enabled: boolean;
  formatMessage: IntlShape["formatMessage"];
}): void {
  const { offPeakTaskService, platform, enabled, formatMessage } = input;
  const lastStatusByTaskIdRef = React.useRef(new Map<string, string>());

  React.useEffect(() => {
    if (!enabled || !platform) return;
    let disposed = false;
    const poll = async () => {
      try {
        const tasks = await offPeakTaskService.list();
        if (disposed) return;
        const lastStatusByTaskId = lastStatusByTaskIdRef.current;
        const seenTaskIds = new Set<string>();
        for (const task of tasks) {
          seenTaskIds.add(task.offPeakTaskId);
          const previousStatus = lastStatusByTaskId.get(task.offPeakTaskId);
          lastStatusByTaskId.set(task.offPeakTaskId, task.status);
          if (previousStatus === task.status) continue;
          const notifyStatus = toOffPeakNotifyStatus(task.status);
          if (!notifyStatus || previousStatus === undefined) continue;
          const titleId =
            notifyStatus === "completed" ? "offPeak.notify.completed.title" : "offPeak.notify.failed.title";
          const bodyId =
            notifyStatus === "completed" ? "offPeak.notify.completed.body" : "offPeak.notify.failed.body";
          try {
            platform.showTaskNotification({
              taskId: task.sessionId ?? task.conversationId ?? task.offPeakTaskId,
              status: notifyStatus,
              title: formatMessage({ id: titleId }),
              body: formatMessage({ id: bodyId }, { title: task.title || task.prompt }),
            });
          } catch (error) {
            logger.warn("[off-peak] notification dispatch failed", error);
          }
        }
        for (const taskId of lastStatusByTaskId.keys()) {
          if (!seenTaskIds.has(taskId)) lastStatusByTaskId.delete(taskId);
        }
      } catch (error) {
        logger.warn("[off-peak] notification poll failed", error);
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), OFF_PEAK_POLL_INTERVAL_MS);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [enabled, platform, offPeakTaskService, formatMessage]);
}

/* ============================================================================
 * 22. e2e 探针与关闭活动上下文事件（原 GJt/r7/KJt，js 186170-186217 / jsx 150040-150097）
 * ==========================================================================*/

/** 原 GJt（js 186170-186214）：window.__testActions 的任务成员/刷新探针 */
const e2eTaskMembershipProbes = {
  armTaskMembershipRefreshHold: () => {
    holdTaskMembershipRefresh();
    flushUnreadPersistence();
  },
  releaseTaskMembershipRefreshHold: releaseTaskMembershipRefreshHold,
  getTaskMembershipRefreshHoldState: getTaskMembershipRefreshHoldState,
  getTaskListMembershipProbe: ({
    workspacePath,
    workspaceIdentity,
    taskId,
  }: {
    workspacePath: string;
    workspaceIdentity?: string;
    taskId: string;
  }) => {
    const workspaceKey = workspaceKeyOf2(workspacePath, workspaceIdentity);
    const entityKey = taskEntityKey({ workspacePath, workspaceIdentity, taskId });
    const searchState = searchResultsStore.getState();
    const membershipKinds = new Set<string>();
    for (const result of Object.values(searchState.resultsByQueryKey)) {
      if (result.descriptor.workspaceKeys.includes(workspaceKey) && result.taskKeys.includes(entityKey)) {
        membershipKinds.add(result.descriptor.kind);
      }
    }
    return { membershipKinds: [...membershipKinds].sort(), taskPresent: !!searchState.taskMetaByEntityKey[entityKey] };
  },
  getTaskListRefreshProbe: ({
    workspacePath,
    workspaceIdentity,
    taskId,
  }: {
    workspacePath: string;
    workspaceIdentity?: string;
    taskId: string;
  }) => {
    const workspaceKey = workspaceKeyOf2(workspacePath, workspaceIdentity);
    const entityKey = taskEntityKey({ workspacePath, workspaceIdentity, taskId });
    const searchState = searchResultsStore.getState();
    const matchingQueries = Object.values(searchState.resultsByQueryKey)
      .filter(
        (result) =>
          result.descriptor.kind === "workspace" &&
          result.descriptor.workspaceKeys.includes(workspaceKey) &&
          result.taskKeys.includes(entityKey),
      )
      .sort((a, b) => b.fetchedAt - a.fetchedAt);
    const latestQuery = matchingQueries[0] ?? null;
    const taskMeta = searchState.taskMetaByEntityKey[entityKey];
    const activity = taskMeta ? describeTaskActivity(taskMeta) : null;
    return {
      matchingQueryCount: matchingQueries.length,
      latestQueryStale: latestQuery?.stale ?? null,
      latestInvalidationVersion: (latestQuery as { invalidationVersion?: number } | null)?.invalidationVersion ?? null,
      taskPresent: !!taskMeta,
      taskStatus: taskMeta?.status ?? null,
      activityPhase: activity?.phase ?? null,
    };
  },
};

/** 原 _Oe/vOe/yOe（任务成员刷新保持，接口级）与 Mo（活动相位描述，接口级） */
declare function holdTaskMembershipRefresh(): void;
declare function releaseTaskMembershipRefreshHold(): void;
declare function getTaskMembershipRefreshHoldState(): unknown;
declare function describeTaskActivity(meta: { taskId: string; status?: string }): { phase: string } | null;
/** Io 的局部别名（避免与字符串常量冲突命名） */
declare function workspaceKeyOf2(workspacePath: string, workspaceIdentity?: string): string;

/** 原 r7（js 186215）：全局"关闭活动上下文"事件名（Esc 等由宿主派发） */
const CLOSE_ACTIVE_CONTEXT_EVENT = "zcode:close-active-context-request";

/** 原 KJt（js 186216）：工作区可见且侧面板未收起时，返回激活标签供关闭 */
function resolveCloseableSidePaneTab(input: {
  isWorkspaceVisible: boolean;
  isSidePaneCollapsed: boolean;
  sidePaneState: SidePaneState | null;
}): SidePaneTab | null {
  return !input.isWorkspaceVisible || input.isSidePaneCollapsed ? null : getActiveSidePaneTab(input.sidePaneState);
}

/* ============================================================================
 * 23. WorkspaceRoot（原 XJt，js 186219-187019 / jsx 150098-150859）
 * ----------------------------------------------------------------------------
 * 工作区根控制器：一个工作区 tab 对应一个 XJt 实例（由远控壳/应用根挂载
 * Y4t=memo(XJt)）。职责（状态机要点）：
 *  1. 身份解析：活动工作区 tab → workspaceIdentity/remoteSessionId/remoteTarget
 *     （VJt），只读判定（本地目录失联 → workspaceSidebar.unavailableLocalDirectory）。
 *  2. 状态供给：useWorkspaceShellZCodeState（LJt）+ useSidePaneState（Boe）+
 *     useAppChromeState（SJt）+ useGitState（nge）+ useActiveTaskMeta（e_e）。
 *  3. 主视图状态机：[chat | automations | repo-wiki]（Yn），automations 携带
 *     openAutomationId，任务导航/选择后回 chat。
 *  4. 草稿焦点联动：draftFocusVersion 变化（同工作区、非 0）→ 自动收起侧面板。
 *  5. 查找状态机：会话内查找（ht）与文件变更查找（St）各一套
 *     {query, activeIndex, navigationRequestId}（T_e/Wg/E_e）。
 *  6. 快捷键：rge 绑定 Ctrl+K/⌘K/⌘P 命令面板、Ctrl+F 查找、⌘[/] 上一/下一会话、
 *     Ctrl+B 侧栏、Ctrl+J 终端、Ctrl+Shift+B 侧面板、Ctrl+[/] 任务后退/前进。
 *  7. 草稿工作区切换（Jn）：失联目录拒绝；解析目标供应商；分组草稿位置迁移；
 *     非远控壳时重置会话路由组与主分屏；startDraft。
 *  8. 全局事件：CLOSE_ACTIVE_CONTEXT_EVENT → 关闭激活侧面板标签；
 *     平台菜单 → 反馈/工单对话框。
 *  9. 渲染：Fragment = [QuickPick(Rje)][FeedbackCenter(RMe)][WorkspaceShell(yJt)]。
 * ==========================================================================*/

/** 原 C_e（js 185826 附近，NJt 相邻）：目标工作区已选供应商解析 */
declare function resolveProviderForDraft(input: {
  currentSelectedProvider: string;
  targetWorkspacePath: string;
  targetWorkspaceIdentity?: string;
  workspaces: Record<string, { selectedProvider?: string }>;
}): string;

/** 原 Rje QuickPick（F05 根，接口保留） */
/** 原 RMe FeedbackCenter（F09 根，接口保留） */

interface FindState {
  activeIndex: number;
  navigationRequestId: number;
  query: string;
}

/** 原 T_e（js 25385） */
function createInitialFindState(): FindState {
  return { activeIndex: -1, navigationRequestId: 0, query: "" };
}

/** 原 Wg（js 25388）：更新查找输入（不改导航代） */
function updateFindStateQuery(state: FindState, query: string, activeIndex: number): FindState {
  return { activeIndex, navigationRequestId: state.navigationRequestId, query };
}

/** 原 E_e（js 25391）：导航请求（代 +1） */
function navigateFindState(state: FindState, query: string, activeIndex: number): FindState {
  return { activeIndex, navigationRequestId: state.navigationRequestId + 1, query };
}

interface WorkspaceRootProps {
  services: WorkspaceServices;
  baseFeedbackService: unknown;
  onConnectRemote?: (...args: unknown[]) => void;
  onSelectRemoteProject?: (...args: unknown[]) => void;
  onCancelRemoteProject?: (...args: unknown[]) => void;
  onReconnectRemoteWorkspace?: (...args: unknown[]) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  user?: unknown;
  reconnectingRemoteWorkspaceKeys?: string[];
  remoteWorkspaceErrorByWorkspaceKey?: Record<string, string>;
  reconnectingRemoteWorkspaceLogsByWorkspaceKey?: Record<string, unknown>;
  remoteConnectionLogs?: unknown[];
  onCreateTask?: (options?: { initialPrompt?: string }) => void;
  onCreateConversationTask?: (options?: { initialPrompt?: string }) => void;
  onResolveConversationWorkspace?: () => Promise<string>;
  onOpenWorkspace?: () => void;
  onOpenFolderFromWorkspaceMenu?: (...args: unknown[]) => void;
  onOpenRemoteWorkspace?: (...args: unknown[]) => void;
  onCreateScratchWorkspace?: () => void;
  remoteConnectionInProgress?: boolean;
  onReturnToWorkspace?: () => void;
  allowOpenWorkspace?: boolean;
  webRemoteControlWorkspaceSwitcher?: unknown;
  initialWebRemoteControlMobileNavigationIntent?: unknown;
  initialWebRemoteControlWorkspaceList?: unknown;
  webRemoteControlTerminalTransportState?: unknown;
  allowRemoteWorkspace?: boolean;
  remoteWorkspaceSessions?: unknown[];
  workspaceAbsPath: string;
  workspaceRemoteSessionId?: string;
  workspaceIdentity?: string;
  isWorkspaceVisible?: boolean;
  isDesktop: boolean;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  supportsEmbeddedBrowser?: boolean;
}

export function WorkspaceRoot(props: WorkspaceRootProps) {
  const {
    services,
    baseFeedbackService,
    onConnectRemote,
    onSelectRemoteProject,
    onCancelRemoteProject,
    onReconnectRemoteWorkspace,
    onLogout,
    onLogin,
    user,
    reconnectingRemoteWorkspaceKeys,
    remoteWorkspaceErrorByWorkspaceKey,
    reconnectingRemoteWorkspaceLogsByWorkspaceKey = {},
    remoteConnectionLogs = [],
    onCreateTask,
    onCreateConversationTask,
    onResolveConversationWorkspace,
    onOpenWorkspace,
    onOpenFolderFromWorkspaceMenu,
    onOpenRemoteWorkspace,
    onCreateScratchWorkspace,
    remoteConnectionInProgress = false,
    onReturnToWorkspace,
    allowOpenWorkspace = true,
    webRemoteControlWorkspaceSwitcher,
    initialWebRemoteControlMobileNavigationIntent,
    initialWebRemoteControlWorkspaceList,
    webRemoteControlTerminalTransportState,
    allowRemoteWorkspace = true,
    remoteWorkspaceSessions = [],
    workspaceAbsPath,
    workspaceRemoteSessionId,
    workspaceIdentity: explicitWorkspaceIdentity,
    isWorkspaceVisible = true,
    isDesktop,
    isMacDesktop,
    isWindowsDesktop,
    supportsEmbeddedBrowser,
  } = props;


  /* --- 快捷键文案（原 186258-186264） --- */
  const toggleSidebarShortcutLabel = shortcutLabel("B");      // 原 R
  const newTaskShortcutLabel = shortcutLabel("N");            // 原 z
  const goBackShortcutLabel = shortcutLabel("[");             // 原 B
  const goForwardShortcutLabel = shortcutLabel("]");          // 原 V
  const toggleTerminalShortcutLabel = shortcutLabel("J");     // 原 H
  const toggleSidePaneShortcutLabel = shortcutLabelVariant("B"); // 原 ee（Ctrl+Shift+B）
  const openWorkspaceShortcutLabel = shortcutLabel("O");      // 原 U
  const isLinuxDesktop = !!(isDesktop && !isMacDesktop && !isWindowsDesktop); // 原 te
  const supportsEmbeddedBrowserEffective = supportsEmbeddedBrowser ?? !!isDesktop; // 原 ne

  const { intl, locale, setLocale } = useIntlContext();
  const platform = usePlatformService();

  /* --- 身份解析：活动工作区 tab 优先（原 186269-186288） --- */
  const activeWorkspaceTarget = resolveActiveWorkspaceTarget({
    activeTarget: useWorkspaceTabs(
      shallowSelector((state: WorkspaceTabsState) => {
        if (!state.activeTabId) {
          return { workspaceIdentity: undefined, remoteSessionId: undefined, remoteTarget: undefined };
        }
        const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
        return !activeTab || !isWorkspaceTab(activeTab) || activeTab.workspacePath !== workspaceAbsPath
          ? { workspaceIdentity: undefined, remoteSessionId: undefined, remoteTarget: undefined }
          : {
              workspaceIdentity: activeTab.workspaceIdentity,
              remoteSessionId: activeTab.remoteSessionId,
              remoteTarget: activeTab.remoteTarget,
            };
      }),
    ),
    explicitWorkspaceIdentity,
    explicitRemoteSessionId: workspaceRemoteSessionId,
  });
  const workspaceIdentity = activeWorkspaceTarget.workspaceIdentity; // 原 ce
  const { rpcReady } = useWorkspaceServicesResolver(
    workspaceAbsPath,
    activeWorkspaceTarget.remoteSessionId,
    workspaceIdentity,
    activeWorkspaceTarget.remoteTarget,
  ); // 原 ue

  /** 原 de：本地目录失联 → 全壳只读原因 */
  const workspaceReadOnlyReason = useWorkspaceTabs((state) =>
    isWorkspaceUnavailableLocalDirectory(state, workspaceAbsPath, workspaceIdentity),
  )
    ? intl.formatMessage({ id: "workspaceSidebar.unavailableLocalDirectory" })
    : undefined;

  const baseServices = useBaseServices(); // 原 fe = Ec()
  const { workspaceShellZCodeState, reloadSessionDisabled } = useWorkspaceShellZCodeState(
    workspaceAbsPath,
    workspaceIdentity,
  ); // 原 LJt 调用

  /* --- 供应商注册表修订同步（原 186294-186299） --- */
  React.useEffect(() => {
    const subscription = baseServices.modelProviderService.onDidChangeProviderRegistry((event) => {
      setProviderRegistryRevision(event.snapshot.revision);
    });
    return () => subscription.dispose();
  }, [baseServices.modelProviderService]);

  const activeTaskId = workspaceShellZCodeState.activeTaskId; // 原 me
  const draftSessionId = useTaskStore((state) => state.getWorkspaceState(workspaceAbsPath, workspaceIdentity).draftSessionId); // 原 he
  const sidePaneOwnerId = activeTaskId ?? draftSessionId ?? null; // 原 ge
  const [summaryPanelVariantOverride, setSummaryPanelVariantOverride] = React.useState<string | null>(null); // 原 [_e, ve]
  const draftFocusVersion = workspaceShellZCodeState.draftFocusVersion; // 原 ye

  /* --- 侧面板状态机（原 Boe 调用，186304-186349） --- */
  const {
    isTerminalOpen,
    setIsTerminalOpen,
    sidePaneState,
    recentClosedSidePaneTabs,
    isSidePaneCollapsed,
    setIsSidePaneCollapsed,
    isSidebarVisible,
    browserNavigationRequest,
    setBrowserNavigationRequest,
    handleOpenCodeViewer,
    handleOpenBrowserUrl,
    handleToggleBrowser,
    handleOpenBrowserTab,
    handleToggleGit,
    handleOpenGit,
    handleOpenTreemapping,
    handleOpenWhiteboard,
    handleOpenDeveloperTools,
    handleOpenTerminalTab,
    handleOpenSubagentSession,
    handleOpenSubagentDirectory,
    handleSyncSubagentSessionTabs,
    handleOpenSelectionSideChat,
    handleOpenPlanDetail,
    handleToggleTerminal,
    handleToggleSidebar,
    handleToggleSidePaneCollapse,
    handleCloseCodeViewer,
    handleCloseGit,
    handleActivateSidePaneTab,
    handleReorderSidePaneTab,
    handleCloseSidePaneTab,
    handleCloseOtherSidePaneTabs,
    handleCloseAllSidePaneTabs,
    handleReopenClosedSidePaneTab,
    handleBrowserNavigationRequestHandled,
    handleBrowserPageMetadataChange,
  } = useSidePaneState({
    workspaceAbsPath,
    workspaceIdentity,
    workspaceRemoteSessionId,
    activeTaskId,
    sidePaneOwnerId,
    isDesktop,
    isWorkspaceVisible,
    supportsEmbeddedBrowser: supportsEmbeddedBrowserEffective,
    platform,
    defaultWhiteboardNamePrefix: intl.formatMessage({ id: "whiteboard.defaultName" }),
  });

  const workspaceKey = workspaceIdentity?.trim() || workspaceAbsPath; // 原 it
  const notificationEnabled = useSettingsStore((state) => state.notificationEnabled); // 原 at

  /* --- 通知：任务完成（eSt）+ 闲时任务（WJt） --- */
  useTaskCompletionNotifications({
    workspacePath: workspaceAbsPath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(workspaceRemoteSessionId ? { endpointKey: workspaceRemoteSessionId } : {}),
    enabled: notificationEnabled,
    rpcReady,
    platform,
    formatMessage: intl.formatMessage,
  });
  useOffPeakNotifications({
    offPeakTaskService: services.offPeakTaskService,
    platform,
    enabled: !!(notificationEnabled && isDesktop),
    formatMessage: intl.formatMessage,
  });

  /* --- 草稿焦点联动：新建任务时收起右侧面板（原 186372-186385） --- */
  const draftFocusWatchRef = React.useRef({ workspaceKey, draftFocusVersion });
  React.useEffect(() => {
    const previous = draftFocusWatchRef.current;
    if (previous.workspaceKey !== workspaceKey) {
      draftFocusWatchRef.current = { workspaceKey, draftFocusVersion };
      return;
    }
    if (previous.draftFocusVersion === draftFocusVersion || (draftFocusWatchRef.current = { workspaceKey, draftFocusVersion }, draftFocusVersion === 0)) {
      return;
    }
    const tabCount = sidePaneState?.tabs.length ?? 0;
    if (!isSidePaneCollapsed) {
      logger.info(`[App] 新建任务时收起右侧面板 workspace=${workspaceAbsPath} tabs=${tabCount}`);
      setIsSidePaneCollapsed(true);
    }
  }, [draftFocusVersion, isSidePaneCollapsed, setIsSidePaneCollapsed, sidePaneState, workspaceAbsPath, workspaceKey]);

  /* --- 查找 / 高亮 / 测试消息 状态组（原 186386-186402） --- */
  const [testMessages, setTestMessages] = React.useState<unknown[] | null>(null); // 原 [st, ct]
  const [isQuickPickOpen, setQuickPickOpen] = React.useState(false); // 原 [lt, ut]
  const [isTaskFindOpen, setTaskFindOpen] = React.useState(false); // 原 [dt, ft]
  const [taskFindFocusRequestId, setTaskFindFocusRequestId] = React.useState(0); // 原 [pt, mt]
  const [conversationFindState, setConversationFindState] = React.useState<FindState>(createInitialFindState); // 原 [ht, gt]
  const [conversationMatchCount, setConversationMatchCount] = React.useState(0); // 原 [_t, vt]
  const searchHighlightRequestIdRef = React.useRef(0); // 原 yt
  const [searchResultHighlightRequest, setSearchResultHighlightRequest] = React.useState<SearchResultHighlightRequest | null>(null); // 原 [bt, xt]
  const [fileChangeFindState, setFileChangeFindState] = React.useState<FindState>(createInitialFindState); // 原 [St, Ct]
  const [fileChangeMatchCount, setFileChangeMatchCount] = React.useState(0); // 原 [wt, Tt]
  const [canOpenCommunity, setCanOpenCommunity] = React.useState(false); // 原 [Et, Dt]
  const [gitSelectedSourceId, setGitSelectedSourceId] = React.useState("unstaged"); // 原 [Ot, kt]
  const [gitRefreshToken, triggerGitRefresh] = React.useState(0); // 原 [At, jt]

  const { browserRestoreUrls, handleBrowserUrlChange } = useBrowserRestoreUrls({
    activeTaskId,
    gitSelectedSourceId,
    setGitSelectedSourceId,
    workspaceAbsPath,
    workspaceIdentity,
  }); // 原 BJt 调用

  const theme = useSettingsStore((state) => state.theme); // 原 Nt
  const setTheme = useSettingsStore((state) => state.setTheme); // 原 Pt

  /* --- 窗口外观状态（原 SJt 调用，186412-186422） --- */
  const {
    isMacFullscreen,
    desktopWindowChromeState,
    macWindowControlsLeftPaddingPx,
    windowsWindowControlsRightPaddingPx,
    updateReadyVersion,
    updateState,
    sidebarContainerRef,
  } = useAppChromeState({
    isDesktop,
    isMacDesktop,
    isWindowsDesktop,
    platform,
    workspaceAbsPath,
  });

  const workspaceTabs = useWorkspaceTabs((state) => state.tabs); // 原 Ht
  const addWorkspaceTab = useWorkspaceTabs((state) => state.addTab); // 原 Ut
  const activateWorkspaceTabByPath = useWorkspaceTabs((state) => state.activateTabByPath); // 原 Wt

  /* --- 活动任务元数据（原 e_e 调用，186428-186441） --- */
  const {
    resolvedActiveTaskMeta,
    activeTraceId,
    activeSessionId,
    activeTaskProvider,
    workspaceHeaderProvider,
    activeTaskChangeSummary,
    activeTaskTitle,
    taskNativeSessionLogFile,
    taskSessionFile,
  } = useActiveTaskMeta({
    workspaceAbsPath,
    activeTaskId,
    workspaceRemoteSessionId,
    workspaceIdentity,
    selectedProvider: workspaceShellZCodeState.selectedProvider,
    intl,
  });

  const providerConfigFile = useProviderConfigFile(workspaceAbsPath, workspaceHeaderProvider, workspaceRemoteSessionId, workspaceIdentity); // 原 en

  /** 原 tn（186447）：传给壳的工作区 tab 摘要（仅 workspace 类） */
  const workspaceTabsSummary = React.useMemo(
    () =>
      workspaceTabs.filter(isWorkspaceTab).map((tab) => ({
        workspacePath: tab.workspacePath,
        label: tab.label,
        remoteSessionId: tab.remoteSessionId,
        remoteTarget: tab.remoteTarget,
        workspaceIdentity: tab.workspaceIdentity,
        workspacePurpose: tab.workspacePurpose,
        localWorkspacePath: tab.localWorkspacePath,
        availability: tab.availability,
      })),
    [workspaceTabs],
  );
  const workspaceTabList = React.useMemo(() => workspaceTabs.filter(isWorkspaceTab), [workspaceTabs]); // 原 nn

  const activeSidePaneTab = React.useMemo(() => getActiveSidePaneTab(sidePaneState), [sidePaneState]); // 原 rn
  const isBrowserOpen = activeSidePaneTab?.type === "browser"; // 原 an
  const isGitOpen = activeSidePaneTab?.type === "git"; // 原 on
  const hasGitTab = sidePaneState?.tabs.some((tab) => tab.type === "git") ?? false; // 原 sn
  const handleRefreshGit = React.useCallback(() => {
    triggerGitRefresh((token) => token + 1);
  }, []); // 原 cn
  const openSettingsTab = useWorkspaceTabs((state) => state.openSettingsTab); // 原 ln

  /* --- git 状态（原 nge + Yse 调用，186469-186487） --- */
  const gitState = useGitState({
    workspacePath: workspaceAbsPath,
    activeTaskId,
    includeExtendedData: hasGitTab,
    refreshToken: gitRefreshToken,
    remoteSessionId: activeWorkspaceTarget.remoteSessionId ?? null,
    remoteTarget: activeWorkspaceTarget.remoteTarget,
    workspaceIdentity,
  });
  useGitSummarySync({
    workspacePath: workspaceAbsPath,
    workspaceIdentity,
    remoteSessionId: activeWorkspaceTarget.remoteSessionId ?? null,
    gitSummary: gitState.summary,
    gitSummaryWorkspaceKey: gitState.workspaceKey,
    enabled: isWorkspaceVisible,
    onRefreshGit: handleRefreshGit,
  });

  const activeGitSourceId =
    gitState.sourceOptions.find((option) => option.id === gitSelectedSourceId)?.id ??
    gitState.sourceOptions[0]?.id ??
    "unstaged"; // 原 dn

  /** 原 fn（186488-186504）：每源 +/- 行数合计 */
  const changeTotalsBySourceId = React.useMemo(
    () =>
      Object.fromEntries(
        gitState.sourceOptions.map((option) => {
          const totals = (gitState.datasets[option.id] ?? gitState.datasets.unstaged).sections
            .flatMap((section) => section.changes)
            .reduce(
              (accumulator, change) => (
                (accumulator.added += change.added), (accumulator.removed += change.removed), accumulator
              ),
              { added: 0, removed: 0 },
            );
          return [option.id, totals];
        }),
      ) as Record<string, { added: number; removed: number }>,
    [gitState.datasets, gitState.sourceOptions],
  );

  /** 原 pn（186505-186511）：worktree 变更摘要（unstaged+staged 合计） */
  const gitWorktreeChangeSummary = React.useMemo(() => {
    const unstaged = changeTotalsBySourceId.unstaged ?? { added: 0, removed: 0 };
    const staged = changeTotalsBySourceId.staged ?? { added: 0, removed: 0 };
    return { added: unstaged.added + staged.added, removed: unstaged.removed + staged.removed };
  }, [changeTotalsBySourceId]);

  /** 原 mn（186512-186517）：worktree 审查默认源（有变更者优先） */
  const gitWorktreeReviewSourceId = React.useMemo(() => {
    const unstaged = changeTotalsBySourceId.unstaged ?? { added: 0, removed: 0 };
    const staged = changeTotalsBySourceId.staged ?? { added: 0, removed: 0 };
    return unstaged.added + unstaged.removed > 0
      ? "unstaged"
      : staged.added + staged.removed > 0
        ? "staged"
        : null;
  }, [changeTotalsBySourceId]);

  /** 原 hn（186518-186522）：打开 git 审查（可指定源；只读禁止） */
  const handleOpenGitReview = React.useCallback(
    (sourceId?: string) => {
      if (workspaceReadOnlyReason) return;
      if (sourceId) setGitSelectedSourceId(sourceId);
      handleOpenGit();
    },
    [handleOpenGit, workspaceReadOnlyReason],
  );

  const isSidePaneOpen = !isSidePaneCollapsed; // 原 gn

  /* --- 关闭活动上下文事件 → 关闭激活侧面板标签（原 186523-186535） --- */
  React.useEffect(() => {
    const listener = () => {
      const closeableTab = resolveCloseableSidePaneTab({
        isWorkspaceVisible,
        isSidePaneCollapsed,
        sidePaneState,
      });
      if (closeableTab) handleCloseSidePaneTab(closeableTab.id);
    };
    window.addEventListener(CLOSE_ACTIVE_CONTEXT_EVENT, listener);
    return () => {
      window.removeEventListener(CLOSE_ACTIVE_CONTEXT_EVENT, listener);
    };
  }, [handleCloseSidePaneTab, isSidePaneCollapsed, isWorkspaceVisible, sidePaneState]);

  /** 原 _n（186536）：侧面板开合（折叠态切换） */
  const handleToggleSidePane = React.useCallback(() => {
    handleToggleSidePaneCollapse();
  }, [handleToggleSidePaneCollapse]);

  /** 原 vn（186540）：可见性守卫执行器（不可见时先回工作区） */
  const runWithVisibility = React.useCallback(
    (run: () => void) => {
      runWithWorkspaceVisibility({ isWorkspaceVisible, onReturnToWorkspace, run });
    },
    [isWorkspaceVisible, onReturnToWorkspace],
  );

  /* --- 只读守卫包装组（原 186545-186572） --- */
  const handleCreateTaskGuarded = React.useCallback(
    (options?: { initialPrompt?: string }) => {
      if (!workspaceReadOnlyReason) onCreateTask?.(options);
    },
    [onCreateTask, workspaceReadOnlyReason],
  );
  const handleToggleTerminalGuarded = React.useCallback(() => {
    if (!workspaceReadOnlyReason) handleToggleTerminal();
  }, [handleToggleTerminal, workspaceReadOnlyReason]);
  const handleOpenTerminalTabGuarded = React.useCallback(() => {
    if (!workspaceReadOnlyReason) handleOpenTerminalTab();
  }, [handleOpenTerminalTab, workspaceReadOnlyReason]);
  const handleOpenGitReviewGuarded = React.useCallback(() => {
    if (!workspaceReadOnlyReason) handleOpenGit();
  }, [handleOpenGit, workspaceReadOnlyReason]);
  const handleToggleGitGuarded = React.useCallback(() => {
    if (!workspaceReadOnlyReason) handleToggleGit();
  }, [handleToggleGit, workspaceReadOnlyReason]);
  const handleOpenCodeViewerGuarded = React.useCallback(
    (...args: Parameters<SidePaneController["handleOpenCodeViewer"]>) => {
      if (!workspaceReadOnlyReason) handleOpenCodeViewer(...args);
    },
    [handleOpenCodeViewer, workspaceReadOnlyReason],
  );
  const handleOpenTreemappingGuarded = React.useCallback(
    (...args: Parameters<SidePaneController["handleOpenTreemapping"]>) => {
      if (!workspaceReadOnlyReason) handleOpenTreemapping(...args);
    },
    [handleOpenTreemapping, workspaceReadOnlyReason],
  );

  const projectName = pathBasename(workspaceAbsPath); // 原 En

  /* --- 任务内查找对话框状态（原 186574-186604） --- */
  const handleOpenTaskFind = React.useCallback(() => {
    runWithVisibility(() => {
      setTaskFindFocusRequestId((requestId) => requestId + 1);
      setTaskFindOpen(true);
    });
  }, [runWithVisibility]);
  const handleTaskFindOpenChange = React.useCallback((open: boolean) => {
    setTaskFindOpen(open);
    if (!open) {
      setConversationFindState((state) => updateFindStateQuery(state, "", -1));
      setConversationMatchCount(0);
      setFileChangeFindState((state) => updateFindStateQuery(state, "", -1));
      setFileChangeMatchCount(0);
    }
  }, []);
  const handleConversationFindChange = React.useCallback((query: string, activeIndex: number) => {
    setConversationFindState((state) => updateFindStateQuery(state, query, activeIndex));
  }, []);
  const handleConversationFindNavigate = React.useCallback((query: string, activeIndex: number) => {
    setConversationFindState((state) => navigateFindState(state, query, activeIndex));
  }, []);
  const handleConversationFindMatchStateChange = React.useCallback(
    (matchState: { matchCount: number; activeIndex?: number }) => {
      setConversationMatchCount(matchState.matchCount);
      if (matchState.activeIndex !== undefined) {
        setConversationFindState((state) => updateFindStateQuery(state, state.query, matchState.activeIndex ?? -1));
      }
    },
    [],
  );
  const handleSearchResultHighlightRequest = React.useCallback((request: SearchResultHighlightRequest) => {
    searchHighlightRequestIdRef.current += 1;
    setSearchResultHighlightRequest({ ...request, requestId: searchHighlightRequestIdRef.current });
  }, []);
  const handleSearchResultHighlightDone = React.useCallback((requestId: number) => {
    setSearchResultHighlightRequest((previous) => (previous?.requestId === requestId ? null : previous));
  }, []);
  const handleFileChangeFindChange = React.useCallback((query: string, activeIndex: number) => {
    setFileChangeFindState((state) => updateFindStateQuery(state, query, activeIndex));
  }, []);
  const handleFileChangeFindNavigate = React.useCallback((query: string, activeIndex: number) => {
    setFileChangeFindState((state) => navigateFindState(state, query, activeIndex));
  }, []);

  /** 原 In（186605）：命令中心开关 */
  const handleOpenCommandCenter = React.useCallback(() => {
    setQuickPickOpen((open) => !open);
  }, []);

  /* --- 反馈中心接线（原 186607-186625） --- */
  const openFeedbackSubmit = useFeedbackStore((state) => state.openSubmit);
  const openTicketsPanel = useFeedbackStore((state) => state.openTickets);
  const isLoggedIn = !!user; // 原 zn
  const handleOpenFeedback = React.useCallback(() => {
    platform.openFeedback();
  }, [platform]);
  React.useEffect(() => {
    const disposeFeedback = platform.onOpenFeedbackDialog?.(() => {
      openFeedbackSubmit();
    });
    const disposeTickets = platform.onOpenTicketsPanel?.(() => {
      openTicketsPanel();
    });
    return () => {
      disposeFeedback?.();
      disposeTickets?.();
    };
  }, [openFeedbackSubmit, openTicketsPanel, platform]);
  const handleOpenCommunity = React.useCallback(() => platform.openCommunity(), [platform]); // 原 Vn
  const handleOpenProductDocs = React.useCallback(() => {
    platform.openExternal(PRODUCT_DOCS_URL);
  }, [platform]); // 原 Hn

  /* --- 主题切换（原 186627-186632） --- */
  const themeTarget = resolveThemeMode(theme) === "dark" ? "light" : "dark"; // 原 Un
  const handleSwitchTheme = React.useCallback(() => {
    setTheme(themeTarget);
  }, [setTheme, themeTarget]); // 原 Wn

  /** 原 Gn（186633）：打开设置指定分区 */
  const handleOpenSettingsSection = React.useCallback(
    (section: string) => {
      setSettingsTabTarget(section);
      openSettingsTab();
    },
    [openSettingsTab],
  );

  const { reloadSessionPending, handleReloadSession } = useReloadSession({
    intl,
    services,
    workspaceAbsPath,
    reloadSessionDisabled,
  }); // 原 MJt 调用

  /** 原 Jn（186642-186666）：在工作区开始草稿（工作区切换核心） */
  const handleStartDraftInWorkspace = React.useCallback(
    (targetWorkspacePath: string, targetIdentity?: string, purpose?: string) => {
      const store = taskStore.getState();
      const resolvedIdentity =
        targetIdentity ?? workspaceTabs.filter(isWorkspaceTab).find((tab) => tab.workspacePath === targetWorkspacePath)?.workspaceIdentity ?? undefined;
      if (isWorkspaceUnavailableLocalDirectory({ tabs: workspaceTabs }, targetWorkspacePath, resolvedIdentity)) return;
      const targetProvider = resolveProviderForDraft({
        currentSelectedProvider: workspaceShellZCodeState.selectedProvider,
        targetWorkspacePath,
        targetWorkspaceIdentity: resolvedIdentity,
        workspaces: store.workspaces,
      });
      const currentWorkspaceState = store.getWorkspaceState(workspaceAbsPath, workspaceIdentity);
      const groupedDraftPlacement =
        currentWorkspaceState.activeTaskId === null ? currentWorkspaceState.groupedDraftTask?.placement : undefined;
      const tabOptions =
        resolvedIdentity || purpose
          ? { ...(resolvedIdentity ? { workspaceIdentity: resolvedIdentity } : {}), ...(purpose ? { workspacePurpose: purpose } : {}) }
          : undefined;
      if (purpose) addWorkspaceTab(targetWorkspacePath, tabOptions);
      else if (!activateWorkspaceTabByPath(targetWorkspacePath, resolvedIdentity ? { workspaceIdentity: resolvedIdentity } : undefined)) {
        addWorkspaceTab(targetWorkspacePath, tabOptions);
      }
      if (!webRemoteControlWorkspaceSwitcher) {
        sessionRouterStore.getState().deactivateActiveGroup();
        splitLayoutStore.getState().resetToPrimaryPane();
      }
      store.startDraft(targetWorkspacePath, targetProvider, resolvedIdentity, groupedDraftPlacement ? { groupedDraftPlacement } : undefined);
      if (groupedDraftPlacement && (workspaceIdentity?.trim() || workspaceAbsPath) !== (resolvedIdentity?.trim() || targetWorkspacePath)) {
        store.clearGroupedDraftTask(workspaceAbsPath, workspaceIdentity);
      }
    },
    [activateWorkspaceTabByPath, addWorkspaceTab, workspaceTabs, workspaceAbsPath, workspaceIdentity, workspaceShellZCodeState.selectedProvider, webRemoteControlWorkspaceSwitcher],
  );

  /* --- 生命周期/远程 MCP/e2e 桥（原 186668-186696） --- */
  useWorkspaceLifecycle({
    workspaceAbsPath,
    workspaceIdentity,
    services,
    setBrowserNavigationRequest,
    setTestMessages,
  });
  useMcpSyncForRemote(workspaceAbsPath, workspaceIdentity, rpcReady);
  registerTestActions(
    React.useMemo(
      () => ({
        ...e2eTaskMembershipProbes,
        getTheme: () => theme,
        setTheme,
        getLocale: () => locale,
        setLocale,
        setChatMessages: (messages: unknown[]) => {
          setTestMessages([...messages]);
        },
        getChatMessageCount: () => testMessages?.length ?? 0,
        getPluginsOverview: (input: unknown) => services.zcodeAgentService.getPluginsOverview(input),
        addPluginMarketplace: (input: unknown) => services.zcodeAgentService.addPluginMarketplace(input),
        updatePluginMarketplace: (input: unknown) => services.zcodeAgentService.updatePluginMarketplace(input),
        installPlugin: (input: unknown) => services.zcodeAgentService.installPlugin(input),
        listPlugins: (input: unknown) => services.zcodeAgentService.listPlugins(input),
      }),
      [locale, services.zcodeAgentService, setLocale, theme, setTheme, testMessages],
    ),
  );

  /* --- 主视图状态机（原 186697-186706） --- */
  const [workspaceMainView, setWorkspaceMainView] = React.useState<WorkspaceMainView>("chat"); // 原 [Yn, Xn]
  const [openAutomationId, setOpenAutomationId] = React.useState<string | null>(null); // 原 [Zn, Qn]
  const handleNavigateToChat = React.useCallback(() => {
    setWorkspaceMainView("chat");
  }, []); // 原 $n
  const handleNavigateToAutomations = React.useCallback(
    (target: { automationId?: string }) => {
      setOpenAutomationId(target.automationId ?? null);
      setWorkspaceMainView("automations");
    },
    [],
  ); // 原 er
  const handleOpenAutomationConsumed = React.useCallback(() => {
    setOpenAutomationId(null);
  }, []); // 原 tr

  /* --- 任务导航（原 zJt 调用，186707-186719） --- */
  const {
    handleSelectTask,
    handleOpenAutomations,
    handleTaskNavBack,
    handleTaskNavForward,
    canGoBack,
    canGoForward,
    canTaskNavBack,
    canTaskNavForward,
  } = useTaskNavigation({
    intl,
    workspaceAbsPath,
    workspaceIdentity,
    activateTabByPath: activateWorkspaceTabByPath,
    onNavigateToTask: handleNavigateToChat,
    onNavigateToAutomations: handleNavigateToAutomations,
  });

  /** 原 ur（186723-186744）：上一/下一会话（可见任务序列 + 搜索结果序） */
  const handleSelectAdjacentConversation = React.useCallback(
    (direction: "previous" | "next") => {
      runWithVisibility(() => {
        const visibleTaskIds = getVisibleTasks(taskStore.getState().getWorkspaceState(workspaceAbsPath, workspaceIdentity)).map(
          (task) => task.taskId,
        );
        const searchState = searchResultsStore.getState();
        const adjacent = resolveAdjacentTasks({
          taskIds: collectWorkspaceTaskIds({
            workspacePath: workspaceAbsPath,
            workspaceIdentity,
            resultsByQueryKey: searchState.resultsByQueryKey,
            taskMetaByEntityKey: searchState.taskMetaByEntityKey,
            fallbackTaskIds: visibleTaskIds,
          }),
          activeTaskId,
        });
        const targetTaskId = direction === "previous" ? adjacent.previousTaskId : adjacent.nextTaskId;
        if (targetTaskId) handleSelectTask(workspaceAbsPath, targetTaskId, workspaceIdentity);
      });
    },
    [activeTaskId, handleSelectTask, runWithVisibility, workspaceAbsPath, workspaceIdentity],
  );
  const handleSelectPreviousConversation = React.useCallback(() => {
    handleSelectAdjacentConversation("previous");
  }, [handleSelectAdjacentConversation]); // 原 dr
  const handleSelectNextConversation = React.useCallback(() => {
    handleSelectAdjacentConversation("next");
  }, [handleSelectAdjacentConversation]); // 原 fr

  const shellPanelIds = React.useMemo(() => ["sidebar", "content"], []); // 原 pr

  /* --- 键盘快捷键绑定（原 rge 调用，186752-186762） --- */
  useWorkspaceKeyboardShortcuts({
    openQuickPick: handleOpenCommandCenter,
    find: handleOpenTaskFind,
    toggleSidebar: () => runWithVisibility(handleToggleSidebar),
    toggleTerminal: () => runWithVisibility(handleToggleTerminalGuarded),
    toggleSidePane: () => runWithVisibility(handleToggleSidePane),
    previousConversation: handleSelectPreviousConversation,
    nextConversation: handleSelectNextConversation,
    navBack: canTaskNavBack ? () => runWithVisibility(handleTaskNavBack) : null,
    navForward: canTaskNavForward ? () => runWithVisibility(handleTaskNavForward) : null,
  });

  /* --- 社群可用性（按语言区域）（原 186763-186776） --- */
  React.useEffect(() => {
    let disposed = false;
    platform.canOpenCommunity(locale).then(
      (available) => {
        if (!disposed) setCanOpenCommunity(available);
      },
      () => {
        if (!disposed) setCanOpenCommunity(false);
      },
    );
    return () => {
      disposed = true;
    };
  }, [locale, platform]);

  /* --- QuickPick 命令表（原 O_e 调用，186778-186834） --- */
  const quickPickCommands = React.useMemo(
    () =>
      buildQuickPickCommands({
        allowOpenWorkspace,
        canOpenCommunity,
        isSidebarVisible,
        supportsEmbeddedBrowser: supportsEmbeddedBrowserEffective,
        isLoggedIn,
        themeTarget,
        shortcuts: {
          newTask: newTaskShortcutLabel,
          openWorkspace: openWorkspaceShortcutLabel,
          toggleSidebar: toggleSidebarShortcutLabel,
          toggleTerminal: toggleTerminalShortcutLabel,
        },
        handlers: {
          createTask: () => runWithVisibility(() => handleCreateTaskGuarded()),
          openWorkspace: () => runWithVisibility(() => onOpenWorkspace?.()),
          openSettings: openSettingsTab,
          openSkillsSettings: () => handleOpenSettingsSection("skills"),
          openMcpSettings: () => handleOpenSettingsSection("mcp"),
          switchTheme: handleSwitchTheme,
          openFeedback: handleOpenFeedback,
          openCommunity: handleOpenCommunity,
          openProductDocs: handleOpenProductDocs,
          login: () => onLogin?.(),
          logout: () => onLogout?.(),
          toggleSidebar: () => runWithVisibility(handleToggleSidebar),
          toggleTerminal: () => runWithVisibility(handleToggleTerminalGuarded),
          togglePreview: () => runWithVisibility(handleToggleBrowser),
          openTerminalTab: () => runWithVisibility(handleOpenTerminalTabGuarded),
          openBrowserTab: () => runWithVisibility(handleOpenBrowserTab),
          openReviewTab: () => runWithVisibility(handleOpenGitReviewGuarded),
        },
      }),
    [
      allowOpenWorkspace, canOpenCommunity, handleOpenCommunity, handleOpenFeedback, handleOpenProductDocs,
      handleOpenSettingsSection, handleSwitchTheme, handleOpenBrowserTab, handleOpenGitReviewGuarded,
      handleOpenTerminalTabGuarded, handleToggleBrowser, handleToggleSidebar, handleToggleTerminalGuarded,
      isLoggedIn, isSidebarVisible, newTaskShortcutLabel, handleCreateTaskGuarded, onLogin, onLogout,
      onOpenWorkspace, runWithVisibility, openSettingsTab, openWorkspaceShortcutLabel,
      supportsEmbeddedBrowserEffective, toggleSidebarShortcutLabel, toggleTerminalShortcutLabel, themeTarget,
    ],
  );

  /** 原 hr（186836-186856）：任务内查找对话框 props 束 */
  const taskFindDialogProps = React.useMemo(
    () => ({
      open: isTaskFindOpen,
      focusRequestId: taskFindFocusRequestId,
      isMacDesktop,
      isWindowsDesktop,
      isLinuxDesktop,
      conversationMatchCount,
      conversationMatchIndex: conversationFindState.activeIndex,
      fileChangeMatchCount,
      fileChangeMatchIndex: fileChangeFindState.activeIndex,
      onOpenChange: handleTaskFindOpenChange,
      onConversationFindChange: handleConversationFindChange,
      onConversationFindNavigate: handleConversationFindNavigate,
      onFileChangeFindChange: handleFileChangeFindChange,
      onFileChangeFindNavigate: handleFileChangeFindNavigate,
      onOpenFileChanges: handleOpenGitReviewGuarded,
    }),
    [
      conversationMatchCount, conversationFindState.activeIndex, fileChangeMatchCount,
      fileChangeFindState.activeIndex, handleConversationFindChange, handleConversationFindNavigate,
      handleFileChangeFindChange, handleFileChangeFindNavigate, handleOpenGitReviewGuarded,
      handleTaskFindOpenChange, isLinuxDesktop, isMacDesktop, isTaskFindOpen, isWindowsDesktop,
      taskFindFocusRequestId,
    ],
  );

  /* --- 渲染：Fragment = [QuickPick][FeedbackCenter][WorkspaceShell] --- */
  return (
    <React.Fragment>
      <QuickPick
        open={isQuickPickOpen}
        commands={quickPickCommands}
        workspaceAbsPath={workspaceAbsPath}
        workspaceIdentity={workspaceIdentity}
        activeTaskId={activeTaskId}
        activeTaskChangeSummary={activeTaskChangeSummary}
        workspaceTabs={workspaceTabList}
        onOpenChange={setQuickPickOpen}
        onSelectTask={handleSelectTask}
        onSearchResultHighlightRequest={handleSearchResultHighlightRequest}
        onOpenCodeViewer={handleOpenCodeViewerGuarded}
      />
      <FeedbackCenter feedbackService={baseFeedbackService} platform={platform} />
      <WorkspaceShell
        services={services}
        workspaceReadOnlyReason={workspaceReadOnlyReason}
        workspaceMainView={workspaceMainView}
        openAutomationId={openAutomationId}
        onWorkspaceMainViewChange={setWorkspaceMainView}
        onOpenAutomationConsumed={handleOpenAutomationConsumed}
        handleOpenAutomations={handleOpenAutomations}
        onConnectRemote={onConnectRemote}
        onSelectRemoteProject={onSelectRemoteProject}
        onCancelRemoteProject={onCancelRemoteProject}
        onReconnectRemoteWorkspace={onReconnectRemoteWorkspace}
        onLogout={onLogout}
        onLogin={onLogin}
        user={user}
        reconnectingRemoteWorkspaceKeys={reconnectingRemoteWorkspaceKeys}
        remoteWorkspaceErrorByWorkspaceKey={remoteWorkspaceErrorByWorkspaceKey}
        reconnectingRemoteWorkspaceLogsByWorkspaceKey={reconnectingRemoteWorkspaceLogsByWorkspaceKey}
        remoteConnectionLogs={remoteConnectionLogs}
        onCreateTask={handleCreateTaskGuarded}
        onCreateConversationTask={onCreateConversationTask}
        onResolveConversationWorkspace={onResolveConversationWorkspace}
        onOpenWorkspace={onOpenWorkspace}
        onOpenFolderFromWorkspaceMenu={onOpenFolderFromWorkspaceMenu}
        onOpenRemoteWorkspace={onOpenRemoteWorkspace}
        onCreateScratchWorkspace={onCreateScratchWorkspace}
        remoteConnectionInProgress={remoteConnectionInProgress}
        allowOpenWorkspace={allowOpenWorkspace}
        webRemoteControlWorkspaceSwitcher={webRemoteControlWorkspaceSwitcher}
        initialWebRemoteControlMobileNavigationIntent={initialWebRemoteControlMobileNavigationIntent}
        initialWebRemoteControlWorkspaceList={initialWebRemoteControlWorkspaceList}
        webRemoteControlTerminalTransportState={webRemoteControlTerminalTransportState}
        allowRemoteWorkspace={allowRemoteWorkspace}
        remoteWorkspaceSessions={remoteWorkspaceSessions}
        workspaceAbsPath={workspaceAbsPath}
        workspaceRemoteSessionId={workspaceRemoteSessionId}
        workspaceIdentity={workspaceIdentity}
        isWorkspaceVisible={isWorkspaceVisible}
        isDesktop={isDesktop}
        isMacDesktop={isMacDesktop}
        isWindowsDesktop={isWindowsDesktop}
        workspaceShellZCodeState={workspaceShellZCodeState}
        theme={theme}
        isMacFullscreen={isMacFullscreen}
        desktopWindowChromeState={desktopWindowChromeState}
        macWindowControlsLeftPaddingPx={macWindowControlsLeftPaddingPx}
        windowsWindowControlsRightPaddingPx={windowsWindowControlsRightPaddingPx}
        updateReadyVersion={updateReadyVersion}
        updateState={updateState}
        sidebarContainerRef={sidebarContainerRef}
        toggleSidebarShortcutLabel={toggleSidebarShortcutLabel}
        newTaskShortcutLabel={newTaskShortcutLabel}
        goBackShortcutLabel={goBackShortcutLabel}
        goForwardShortcutLabel={goForwardShortcutLabel}
        toggleSidePaneShortcutLabel={toggleSidePaneShortcutLabel}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        canTaskNavBack={canTaskNavBack}
        canTaskNavForward={canTaskNavForward}
        isTerminalOpen={isTerminalOpen}
        isSidebarVisible={isSidebarVisible}
        isBrowserOpen={isBrowserOpen}
        supportsEmbeddedBrowser={supportsEmbeddedBrowserEffective}
        isGitOpen={isGitOpen}
        isSidePaneOpen={isSidePaneOpen}
        summaryPanelVariantOverride={summaryPanelVariantOverride}
        onSummaryPanelVariantOverrideChange={setSummaryPanelVariantOverride}
        sidePaneState={sidePaneState}
        recentClosedSidePaneTabs={recentClosedSidePaneTabs}
        shellPanelIds={shellPanelIds}
        projectName={projectName}
        workspaceTabs={workspaceTabsSummary}
        activeTaskId={activeTaskId}
        sidePaneOwnerId={sidePaneOwnerId}
        activeTraceId={activeTraceId}
        activeSessionId={activeSessionId}
        activeTaskProvider={activeTaskProvider}
        resolvedActiveTaskMeta={resolvedActiveTaskMeta}
        activeTaskTitle={activeTaskTitle}
        activeTaskChangeSummary={activeTaskChangeSummary}
        gitWorktreeReviewSourceId={gitWorktreeReviewSourceId}
        gitWorktreeChangeSummary={gitWorktreeChangeSummary}
        activeGitSourceId={activeGitSourceId}
        gitState={gitState}
        browserNavigationRequest={browserNavigationRequest}
        browserRestoreUrls={browserRestoreUrls}
        providerConfigFile={providerConfigFile}
        taskNativeSessionLogFile={taskNativeSessionLogFile}
        taskSessionFile={taskSessionFile}
        testMessages={testMessages}
        conversationFindActiveIndex={conversationFindState.activeIndex}
        conversationFindQuery={conversationFindState.query}
        onConversationFindMatchStateChange={handleConversationFindMatchStateChange}
        searchResultHighlightRequest={searchResultHighlightRequest}
        onSearchResultHighlightDone={handleSearchResultHighlightDone}
        fileChangeFindActiveIndex={fileChangeFindState.activeIndex}
        fileChangeFindNavigationRequestId={fileChangeFindState.navigationRequestId}
        fileChangeFindQuery={fileChangeFindState.query}
        onFileChangeFindMatchCountChange={setFileChangeMatchCount}
        appLogoUrl={APP_LOGO_DATA_URL}
        platform={platform}
        reloadSessionDisabled={reloadSessionDisabled}
        reloadSessionPending={reloadSessionPending}
        handleReloadSession={handleReloadSession}
        handleSelectTask={handleSelectTask}
        handleTaskNavBack={handleTaskNavBack}
        handleTaskNavForward={handleTaskNavForward}
        handleStartDraftInWorkspace={handleStartDraftInWorkspace}
        handleOpenCommandCenter={handleOpenCommandCenter}
        handleRefreshGit={handleRefreshGit}
        handleOpenGitReview={handleOpenGitReview}
        handleBrowserUrlChange={handleBrowserUrlChange}
        handleBrowserPageMetadataChange={handleBrowserPageMetadataChange}
        handleToggleSidebar={handleToggleSidebar}
        handleToggleTerminal={handleToggleTerminalGuarded}
        handleToggleBrowser={handleToggleBrowser}
        handleOpenBrowserTab={handleOpenBrowserTab}
        handleOpenTreemapping={handleOpenTreemappingGuarded}
        handleOpenWhiteboard={handleOpenWhiteboard}
        handleOpenDeveloperTools={handleOpenDeveloperTools}
        handleOpenTerminalTab={handleOpenTerminalTabGuarded}
        handleToggleGit={handleToggleGitGuarded}
        handleToggleSidePane={handleToggleSidePane}
        handleOpenBrowserUrl={handleOpenBrowserUrl}
        handleOpenCodeViewer={handleOpenCodeViewerGuarded}
        handleOpenSubagentSession={handleOpenSubagentSession}
        handleOpenSubagentDirectory={handleOpenSubagentDirectory}
        handleSyncSubagentSessionTabs={handleSyncSubagentSessionTabs}
        handleOpenSelectionSideChat={handleOpenSelectionSideChat}
        handleOpenPlanDetail={handleOpenPlanDetail}
        handleCloseCodeViewer={handleCloseCodeViewer}
        handleCloseGit={handleCloseGit}
        handleActivateSidePaneTab={handleActivateSidePaneTab}
        handleReorderSidePaneTab={handleReorderSidePaneTab}
        handleCloseSidePaneTab={handleCloseSidePaneTab}
        handleCloseOtherSidePaneTabs={handleCloseOtherSidePaneTabs}
        handleCloseAllSidePaneTabs={handleCloseAllSidePaneTabs}
        handleReopenClosedSidePaneTab={handleReopenClosedSidePaneTab}
        handleBrowserNavigationRequestHandled={handleBrowserNavigationRequestHandled}
        setIsTerminalOpen={setIsTerminalOpen}
        setGitSelectedSourceId={setGitSelectedSourceId}
        taskFindDialogProps={taskFindDialogProps}
      />
    </React.Fragment>
  );
}

/** 原 w_e（js 25374）：e2e 模式下挂载 window.__testActions（接口级，语义保留） */
declare function registerTestActions(actions: Record<string, unknown>): void;

/** 原 Y4t（js 206773 / jsx 164452）：memo 化工作区根，供远控壳/应用根挂载 */
export const MemoizedWorkspaceRoot = React.memo(WorkspaceRoot);
