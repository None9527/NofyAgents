/* eslint-disable */
/**
 * ============================================================================
 * SidePanel.tsx — ZCode 3.7.6 右侧边面板（SidePane）组件族（解混淆重建 · D8 Stage B / F04）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族 = 右侧多标签侧面板：标签栏（激活/拖拽重排/关闭/重开/总览搜索）、
 * 空态四宫格（辅助对话/审查/终端/浏览器 [+开发者工具]）、14 种标签内容分派、
 * 侧面板状态机（开/合/最近关闭标签、按 工作区×任务 作用域过滤）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  根组件与标签栏：
 *   xqt  → SidePanel                    根：标签栏+内容分派+空态 (182519)
 *   TKt  → SidePaneTabChip              标签 chip（sortable+右键关闭菜单）(181303)
 *   EKt  → SidePaneTabChipDragOverlay   拖拽中的悬浮 chip (181429)
 *   wKt  → TabChipHoverTooltip          chip 悬停 tooltip（1500ms 延迟）(181283)
 *   bKt  → BrowserFaviconImage          favicon img（加载失败回退 globe）(181256)
 *   xKt  → BrowserTabFavicon            favicon 或 globe (181269)
 *   SKt  → BrowserUseTabIndicator       browser-use 操作中呼吸指示 (181272)
 *   R5   → SidePaneTabIcon              14 种标签类型的图标分派 (181455)
 *   DKt  → tabShowsDiffBadge            code-viewer patch/multi-file-diff 徽章 (181450)
 *   V5   → resolveSidePaneTabTitle      标签标题解析 (181533)
 *   NKt  → sidePaneTabSearchHint         总览搜索用的关键词串 (181562)
 *   PKt  → resolveTabTitleFromLabels     用预取 labels 解析标题 (181591)
 *   FKt  → resolveTabTypeLabel           标签类型名 (181612)
 *   IKt  → SidePaneTabOverview           ⌄ 标签总览（cmdk 搜索+最近关闭）(181639)
 *   hKt/gKt/_Kt/L5/vKt/yKt
 *        → buildSearchFields/normalizeQuery/filterRanked/
 *          lowerTrim/scoreSearchFields/tokenPrefixHit (181216–181253)
 *   z5/OKt/B5/kKt/AKt/jKt/MKt
 *        → patch 头文件路径解析助手群（diff --git / +++ / ---）(181483–181530)
 *
 *  空态四宫格与面板几何：
 *   mqt  → resolveEmptyStateTabOptions  空态可打开项（最多 5 项，默认 4 项=四宫格）(182389)
 *   hqt  → canOpenSelectionSideConversation (182405)
 *   gqt  → resolveSidePanePanelSizing   桌面 240px–65% / mobile overlay 100% (182408)
 *   _qt  → shouldRenderHeavyContent     code-viewer 重渲染门 (182425)
 *   vqt  → measureVisibleInlineSize     (182435)
 *   yqt  → usePanelVisibleInlineSize    (182444)
 *   bqt  → useResizeSettling            (182489)
 *   tqt  → isTabBarOverflowing          60px 估宽+8px 间隙判定 (182305)
 *   ZKt=0.45 QKt=60 $Kt=8 eqt=1         面板默认宽比/估宽/间隙/容差 (182302)
 *   lqt=200 uqt=220 dqt=[] fqt={left:false,right:false}  (182362)
 *
 *  开发者工具开关（localStorage 旗标轮询）：
 *   nqt  → DEVELOPER_TOOLS_FLAG_KEYS = [zcode:developer-tools:enabled, zcode:token-debug:enabled] (182311)
 *   iqt/aqt/oqt/sqt/cqt
 *        → isTruthyFlag/isDeveloperToolsEnabled/tryGetLocalStorage/1000ms/useDeveloperToolsEnabled (182313–182360)
 *
 *  标签内容（本族内实现部分）：
 *   LKt  → SubagentSessionTabContent    子智能体会话（只读 R0）(181855)
 *   KKt/qKt → SubagentDirectoryTabContent/Body 子智能体目录 (182104,182113)
 *   GKt  → SubagentDirectoryItemRow     (182056)
 *   WKt  → SubagentStatusIcon           running/waiting/success/failed/cancelled/lost (182038)
 *   VKt  → useSubagentDirectory         分页读取+loadMore (181904)
 *   U5/zKt/BKt/HKt/UKt
 *        → emptyDirectoryState/mergeItems/resolveRequestedCount/[]/buildOpenRequest (181892–182036)
 *   JKt  → SelectionSideChatTabContent  辅助对话（R0 selectionSideChat）(182199)
 *   YKt/XKt → PlanDetailBody/PlanDetailTabContent 计划详情 markdown (182237,182277)
 *   pqt  → SuspendedBrowserTabPlaceholder 挂起 browser tab 占位+ack (182366)
 *
 *  侧面板状态机（同 chunk 2816–3550 / jsx 1919–2615）：
 *   Boe  → useSidePaneState             总钩子（30+ handle*）(2816)
 *   as/os/ss/cs/foe/poe/moe
 *        → DEFAULT_SNAPSHOT/LRU(50)缓存/读/写/touch/evict/cacheKey (2577–2611)
 *   fae  → normalizeSidePaneState       ordinal 补全+activeTabId 修复 (1982)
 *   uae  → shouldKeepPanelMounted       visible || 有 browser tab (1978)
 *   dae  → isBrowserTabResident         非 suspended/suspend-pending (1981)
 *   pae/mae/hae/gae/_ae/vae/yae/bae/xae/Sae/Cae/Eae
 *        → 12 个标签工厂（browser/git/trajectory/repo-wiki/devtools/terminal/
 *          subagent-session/subagent-directory/selection-side-chat/plan-detail/
 *          whiteboard/code-viewer）(2015–2158)
 *   wae/Tae/cae → codeViewerSourceKey/hash36/normalizeDecodedSource (2129–2158)
 *   Qo/Zo/$o/es/Oae/kae/Aae/jae/Mae/Nae
 *        → upsertTab/findIndex/findActiveTab/ownerKey/isSharedTab/
 *          workspaceMatch/stampOwnership/scopeFilter/resolveActive/syncScope (2159–2237)
 *   Pae/Fae/Iae/Lae/Rae/zae/Bae/Vae/Hae/Uae/Wae/Gae/Kae/qae/Jae/Yae/Xae/Zae/Qae/$ae/eoe
 *        → 各型 open/toggle/residency/ordinal 转换 (2238–2458)
 *   ts/ns/toe/noe/roe/rs/is/ioe/aoe/ooe/soe/coe/loe/uoe/doe
 *        → 作用域归属/可见列表/关闭修复/重排/browser 元数据/开关 (2459–2575)
 *   zoe  → nextTerminalTabTitle         Terminal/Terminal 2… (2803)
 *   ls   → useTrajectoryViewerStore     model-trajectory-open 请求 (2610)
 *   goe  → useTrajectoryOpenRequests    (2619)
 *
 *  入口（装配现场，本体在 F05/F07/TopBar 族，此处登记证据）：
 *   O_e  → buildQuickPickCommands       panels 段 6 命令 (25395)
 *   D_e  → QUICK_PICK_SECTION_ORDER = [suggested,chat,navigation,panels,configure,app] (25394)
 *   rge  → useGlobalShortcuts           Ctrl+Alt+B = toggleSidePane (24021)
 *   SFt  → SessionHeaderRight 侧面板开关按钮（已抽取于 TopBar.tsx；js 143462）
 *   XJt  → 工作区根控制器接线 (186756,186780–186806)
 *
 *  图标（Sa=createLucideIcon 工厂，js / jsx）：
 *   kv plus 27606/24904（新增标签 ⊞）| dye chevrons-down 26804/23577（标签总览）
 *   _v message-square-text 27399/24557（辅助对话）| X_ file-diff 27036/23974（审查/git）
 *   Uv square-terminal 27818/24962（终端）| nv globe 27170/24145（浏览器）
 *   k_ bug 26737/23420（开发者工具）| Sv notepad-text 27501/24731（计划）
 *   D_ bot 26708/23362（子智能体会话）| uv list-tree 27300/24410（子智能体目录）
 *   qye map 27335/24490（treemapping）| wv palette 27522/24770（白板）
 *   Ibe waypoints 27982/25529（模型轨迹）| s3 自定义 32×32 SVG 132175/111452（repo wiki）
 *   Y_ file-code-corner 27024/23961（代码查看回退）| g x（imeComposition b 导出，关闭）
 *   M loader-circle（imeComposition w 导出，spinner）| o mouse-pointer-2（imeComposition C 导出）
 *   gye circle-pause 26839 | I_ circle-check 26821 | F_ circle-alert 26812
 *   iye ban 26680 | mye circle-dashed 26825（子智能体状态 5 图标）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入 / 同 chunk 他族组件）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime               react-BQLj9xdT.js / jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)                  utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa) button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale} IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、toast (m)、x 图标 (g=b)、mouse-pointer-2 (o=C)、
 *     spinner (M=w)、Popover 原语 (T/h/x = n/a/i)   imeComposition-DEYFkwWm.js
 *  6. TooltipProvider (Na=Ce)、Tooltip (Ia=X)        usageStatsUiParts-CiR7YEhh.js
 *  7. shortcutLabel ($i=n)、Ctrl+Alt 匹配 (Rre=c)、Ctrl 匹配 (ta=u)、
 *     Ctrl+Shift 匹配 (Qi=d)、Ctrl+Alt 文案 (Vre=t)  keyboardShortcuts-BGHopxr9.js
 *  8. logger (J)                         logger-PFDwl5Yq.js
 *  9. zustand create (Ae)                skillStore-BmeKHDBI.js
 * 10. dnd-kit（打包进本 chunk）：PointerSensor (aZ 92804)、useSensor (UX 92145)、
 *     useSensors (WX 92148)、closestCenter (KX 92201)、SortableContext (EZ 94241)、
 *     useSortable (DZ 94331)、DragOverlay (bZ 94053)、rectSortingStrategy (Uot 94148)、
 *     Transform 工具 (BX 91956)
 * 11. Radix 封装（本 chunk）：Tabs hC/gC/_C/vC (36949–36991)、
 *     ContextMenu yk/bk/xk/Sk (48825–48852)、cmdk Yb/Xb/Zb/Qb/$b/ex/tx (32092–32200)、
 *     Popover(imeComposition)、Tooltip(usageStatsUiParts)
 * 12. react-resizable-panels 封装：Panel (Z4=pAt 131943)、PanelResizeHandle (Q4 131944)
 * 13. ScopedErrorBoundary (p4 129952)：scope/resetKeys/variant
 * 14. 文件图标：resolveFileDisplayInfo (zc 5150)、FileIconImg (Vc 5195)
 * 15. 他族叶子组件（接口保留，见各自族）：
 *     R0 ConversationPane（F03，jsx 101388）— 辅助对话/子智能体会话内容
 *     tHt CodeViewerPanel（F14，js 161141）— code-viewer 标签内容
 *     BWt GitChangesPanel（本族叶子，js 178584）— git/审查 标签内容
 *     FGt WhiteboardCanvas（本族叶子，js 179888）、AGt TreemappingView（js 179493）、
 *     tKt ModelTrajectoryView（js 180606）、mKt DeveloperToolsView（js 180870）、
 *     l3 RepoWikiView（F16，js 132306）、bUt TerminalPanel（F13，js 175976）、
 *     _Wt BrowserView（F13，js 177724）、vWt BrowserUseView（F13，js 178191）
 * 16. 作用域 context：ServiceScopeProvider (DT 42761)、usePanelScope (ET 42756)；
 *     会话快照 k0、设置 store 选择器 Ao、白板 store Oe、任务结束订阅 Vie、
 *     计划 markdown 提取 qZ/u1 — 均为同 chunk 运行时助手，接口保留。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/SidePanel.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  formatRelativeTime,
  createBrowserTab,
  createGitTab,
  createModelTrajectoryTab,
  createRepoWikiTab,
  createDeveloperToolsTab,
  createTerminalTab,
  createSubagentSessionTab,
  createSubagentDirectoryTab,
  createSelectionSideChatTab,
  createPlanDetailTab,
  createWhiteboardTab,
  normalizeDecodedSource,
  createCodeViewerTab,
  upsertTab,
  stampTabOwnership,
  tabBelongsToTask,
  filterTabsForScope,
  visibleTabsForOwner,
  syncScopeState,
  findActiveSelectionSideChat,
  findActiveTab,
  closeTabById,
  closeTabAndRepair,
  activateTab,
  reorderTabs,
  normalizeSidePaneState,
  shouldKeepPanelMounted,
  isBrowserTabResident,
  nextTerminalTabTitle,
  useTrajectoryOpenRequests,
  useSidePaneState,
  tabShowsDiffBadge,
  resolveSidePaneTabTitle,
  SidePaneTabIcon,
  SidePaneTabChip,
  SidePaneTabChipDragOverlay,
  SidePaneTabOverview,
  useSubagentDirectory,
  SubagentDirectoryItemRow,
  SubagentDirectoryTabContent,
  SubagentSessionTabContent,
  SelectionSideChatTabContent,
  PlanDetailTabContent,
  SuspendedBrowserTabPlaceholder,
  DEVELOPER_TOOLS_FLAG_KEYS,
  isTruthyFlag,
  tryGetLocalStorage,
  isDeveloperToolsEnabled,
  useDeveloperToolsEnabled,
  canOpenSelectionSideConversation,
  resolveEmptyStateTabOptions,
  resolveSidePanePanelSizing,
  isTabBarOverflowing,
  usePanelVisibleInlineSize,
  useResizeSettling,
  shouldRenderHeavyContent,
  SidePanel,
  QUICK_PICK_SECTION_ORDER,
  buildSidePanelQuickPickCommands,
  useGlobalShortcuts,
} from '../components/shell/SidePanel';
export type {
  PlatformService,
  SubagentListResponse,
  SidePaneTabType,
  BrowserTab,
  BrowserUseTab,
  TerminalTab,
  GitTab,
  CodeViewerSource,
  CodeViewerTab,
  SelectionSideChatTab,
  PlanDetailTab,
  SubagentSessionTab,
  SubagentDirectoryTab,
  TreemappingTab,
  WhiteboardTab,
  ModelTrajectoryTab,
  RepoWikiTab,
  DeveloperToolsTab,
  SidePaneTab,
  SidePaneState,
  RecentClosedSidePaneTab,
  BrowserUseTabDescriptor,
  BrowserUseOperationEvent,
  BrowserUseVisibilityEvent,
  BrowserResidencyEvent,
  ScreenshotSurfaceRequest,
  BrowserNavigationRequest,
  SubagentDirectoryItem,
  SubagentOpenRequest,
  BrowserMetadataPatch,
  UseSidePaneStateArgs,
  SidePaneTabChipProps,
  SidePaneTabOverviewLabels,
  SubagentDirectoryState,
  EmptyStateTabOptionId,
  SidePanelProps,
  QuickPickSectionId,
  QuickPickCommand,
} from '../components/shell/SidePanel';
