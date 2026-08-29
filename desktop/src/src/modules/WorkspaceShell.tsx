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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/WorkspaceShell.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

// 〔A0-S4-4c〕接口级 export declare 留守副本（ambient，编译期擦除，emit 中立；新文件保留同文副本）。
import * as React from "react";
export declare class AppErrorBoundary extends React.Component<{
  isDesktop?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  onCaughtReactError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  children?: React.ReactNode;
}> {}

export {
  WindowShell,
  setArmsTelemetryClient,
  ScopedErrorBoundary,
  LinuxWindowControls,
  SplitLayoutGroup,
  SplitPanel,
  SidebarSessionDropProvider,
  useSidebarSessionDrop,
  WorkspaceShell,
  CLOSE_ACTIVE_CONTEXT_EVENT,
  WorkspaceRoot,
  MemoizedWorkspaceRoot,
} from '../components/shell/WorkspaceShell';
export type {
  WorkspaceServices,
  PrimaryDraftDropTargetController,
} from '../components/shell/WorkspaceShell';
