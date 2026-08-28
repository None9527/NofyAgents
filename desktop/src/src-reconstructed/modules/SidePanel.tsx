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
 *   xqt  → SidePanel                    根：标签栏+内容分派+空态 (182519 / 147333)
 *   TKt  → SidePaneTabChip              标签 chip（sortable+右键关闭菜单）(181303 / 146452)
 *   EKt  → SidePaneTabChipDragOverlay   拖拽中的悬浮 chip (181429 / 146517)
 *   wKt  → TabChipHoverTooltip          chip 悬停 tooltip（1500ms 延迟）(181283 / 146442)
 *   bKt  → BrowserFaviconImage          favicon img（加载失败回退 globe）(181256 / 146415)
 *   xKt  → BrowserTabFavicon            favicon 或 globe (181269 / 146423)
 *   SKt  → BrowserUseTabIndicator       browser-use 操作中呼吸指示 (181272 / 146432)
 *   R5   → SidePaneTabIcon              14 种标签类型的图标分派 (181455 / 146527)
 *   DKt  → tabShowsDiffBadge            code-viewer patch/multi-file-diff 徽章 (181450 / 146524)
 *   V5   → resolveSidePaneTabTitle      标签标题解析 (181533 / 146611)
 *   NKt  → sidePaneTabSearchHint         总览搜索用的关键词串 (181562 / 146642)
 *   PKt  → resolveTabTitleFromLabels     用预取 labels 解析标题 (181591 / 146645)
 *   FKt  → resolveTabTypeLabel           标签类型名 (181612 / 146662)
 *   IKt  → SidePaneTabOverview           ⌄ 标签总览（cmdk 搜索+最近关闭）(181639 / 146665)
 *   hKt/gKt/_Kt/L5/vKt/yKt
 *        → buildSearchFields/normalizeQuery/filterRanked/
 *          lowerTrim/scoreSearchFields/tokenPrefixHit (181216–181253 / 146388–146405)
 *   z5/OKt/B5/kKt/AKt/jKt/MKt
 *        → patch 头文件路径解析助手群（diff --git / +++ / ---）(181483–181530 / 146561–146608)
 *
 *  空态四宫格与面板几何：
 *   mqt  → resolveEmptyStateTabOptions  空态可打开项（最多 5 项，默认 4 项=四宫格）(182389 / 147217)
 *   hqt  → canOpenSelectionSideConversation (182405 / 147226)
 *   gqt  → resolveSidePanePanelSizing   桌面 240px–65% / mobile overlay 100% (182408 / 147233)
 *   _qt  → shouldRenderHeavyContent     code-viewer 重渲染门 (182425 / 147250)
 *   vqt  → measureVisibleInlineSize     (182435 / 147260)
 *   yqt  → usePanelVisibleInlineSize    (182444 / 147269)
 *   bqt  → useResizeSettling            (182489 / 147310)
 *   tqt  → isTabBarOverflowing          60px 估宽+8px 间隙判定 (182305 / 147135)
 *   ZKt=0.45 QKt=60 $Kt=8 eqt=1         面板默认宽比/估宽/间隙/容差 (182302 / 147131)
 *   lqt=200 uqt=220 dqt=[] fqt={left:false,right:false}  (182362 / 147183)
 *
 *  开发者工具开关（localStorage 旗标轮询）：
 *   nqt  → DEVELOPER_TOOLS_FLAG_KEYS = [zcode:developer-tools:enabled, zcode:token-debug:enabled] (182311 / 147145)
 *   iqt/aqt/oqt/sqt/cqt
 *        → isTruthyFlag/isDeveloperToolsEnabled/tryGetLocalStorage/1000ms/useDeveloperToolsEnabled (182313–182360 / 147150–147180)
 *
 *  标签内容（本族内实现部分）：
 *   LKt  → SubagentSessionTabContent    子智能体会话（只读 R0）(181855 / 146763)
 *   KKt/qKt → SubagentDirectoryTabContent/Body 子智能体目录 (182104,182113 / 146995,147012)
 *   GKt  → SubagentDirectoryItemRow     (182056 / 146983)
 *   WKt  → SubagentStatusIcon           running/waiting/success/failed/cancelled/lost (182038 / 146954)
 *   VKt  → useSubagentDirectory         分页读取+loadMore (181904 / 146801)
 *   U5/zKt/BKt/HKt/UKt
 *        → emptyDirectoryState/mergeItems/resolveRequestedCount/[]/buildOpenRequest (181892–182036 / 146783–146938)
 *   JKt  → SelectionSideChatTabContent  辅助对话（R0 selectionSideChat）(182199 / 147056)
 *   YKt/XKt → PlanDetailBody/PlanDetailTabContent 计划详情 markdown (182237,182277 / 147076,147115)
 *   pqt  → SuspendedBrowserTabPlaceholder 挂起 browser tab 占位+ack (182366 / 147193)
 *
 *  侧面板状态机（同 chunk 2816–3550 / jsx 1919–2615）：
 *   Boe  → useSidePaneState             总钩子（30+ handle*）(2816 / 1919)
 *   as/os/ss/cs/foe/poe/moe
 *        → DEFAULT_SNAPSHOT/LRU(50)缓存/读/写/touch/evict/cacheKey (2577–2611 / 1668–1700)
 *   fae  → normalizeSidePaneState       ordinal 补全+activeTabId 修复 (1982 / 1043)
 *   uae  → shouldKeepPanelMounted       visible || 有 browser tab (1978 / 1037)
 *   dae  → isBrowserTabResident         非 suspended/suspend-pending (1981 / 1040)
 *   pae/mae/hae/gae/_ae/vae/yae/bae/xae/Sae/Cae/Eae
 *        → 12 个标签工厂（browser/git/trajectory/repo-wiki/devtools/terminal/
 *          subagent-session/subagent-directory/selection-side-chat/plan-detail/
 *          whiteboard/code-viewer）(2015–2158 / 1066–1229)
 *   wae/Tae/cae → codeViewerSourceKey/hash36/normalizeDecodedSource (2129–2158 / 1210–1229)
 *   Qo/Zo/$o/es/Oae/kae/Aae/jae/Mae/Nae
 *        → upsertTab/findIndex/findActiveTab/ownerKey/isSharedTab/
 *          workspaceMatch/stampOwnership/scopeFilter/resolveActive/syncScope (2159–2237 / 1231–1297)
 *   Pae/Fae/Iae/Lae/Rae/zae/Bae/Vae/Hae/Uae/Wae/Gae/Kae/qae/Jae/Yae/Xae/Zae/Qae/$ae/eoe
 *        → 各型 open/toggle/residency/ordinal 转换 (2238–2458 / 1300–1531)
 *   ts/ns/toe/noe/roe/rs/is/ioe/aoe/ooe/soe/coe/loe/uoe/doe
 *        → 作用域归属/可见列表/关闭修复/重排/browser 元数据/开关 (2459–2575 / 1532–1654)
 *   zoe  → nextTerminalTabTitle         Terminal/Terminal 2… (2803 / 1910)
 *   ls   → useTrajectoryViewerStore     model-trajectory-open 请求 (2610 / 1706)
 *   goe  → useTrajectoryOpenRequests    (2619 / 1713)
 *
 *  入口（装配现场，本体在 F05/F07/TopBar 族，此处登记证据）：
 *   O_e  → buildQuickPickCommands       panels 段 6 命令 (25395 / 22074)
 *   D_e  → QUICK_PICK_SECTION_ORDER = [suggested,chat,navigation,panels,configure,app] (25394 / 22073)
 *   rge  → useGlobalShortcuts           Ctrl+Alt+B = toggleSidePane (24021 / 20683)
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

import * as React from "react";

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

/** react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J） */
declare const logger: {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, meta?: unknown): void;
  error(msg: string, ...meta: unknown[]): void;
};

/** 快捷键文案：`shortcutLabel("B")` → “Ctrl+B”；`ctrlAltShortcutLabel("B")` → “Ctrl+Alt+B”（原 $i / Vre） */
declare function shortcutLabel(key: string): string;
declare function ctrlAltShortcutLabel(key: string): string;
/** 键盘事件匹配（原 ta=Ctrl/Cmd+key、Qi=Ctrl+Shift+key、Rre=Ctrl+Alt+key） */
declare function isPrimaryShortcut(event: React.KeyboardEvent | KeyboardEvent, key: string): boolean;
declare function isShiftShortcut(event: React.KeyboardEvent | KeyboardEvent, key: string): boolean;
declare function isAltShortcut(event: React.KeyboardEvent | KeyboardEvent, key: string): boolean;

/** 随机 id（原 xi） */
declare function uid(): string;

/** 桌面平台服务（原 l()，imeComposition chunk M 导出）——侧面板用到的 IPC 面 */
interface PlatformService {
  onOpenBrowserUrl?(cb: (e: { url: string; disposition?: string }) => void): () => void;
  onBrowserViewReady?(cb: (e: BrowserUseTabDescriptor) => void): () => void;
  onBrowserViewOperation?(cb: (e: BrowserUseOperationEvent) => void): () => void;
  onBrowserViewVisibility?(cb: (e: BrowserUseVisibilityEvent) => void): () => void;
  onBrowserViewCloseTab?(cb: (e: { tabId: string }) => void): () => void;
  onBrowserViewSuspend?(cb: (e: BrowserResidencyEvent) => void): () => void;
  onBrowserViewRestore?(cb: (e: BrowserResidencyEvent) => void): () => void;
  onBrowserViewScreenshotSurfacePrepare?(cb: (e: ScreenshotSurfaceRequest) => void): () => void;
  onBrowserViewScreenshotSurfaceRelease?(cb: (e: ScreenshotSurfaceRequest) => void): () => void;
  browserViewEnsureResident?(req: { tabId: string; workspaceKey: string; remoteSessionId?: string; sessionId: string }): Promise<void>;
  browserViewCloseTab?(req: { tabId: string; workspaceKey: string; remoteSessionId?: string; sessionId: string }): Promise<void>;
  browserViewSuspendReady?(req: { tabId: string; generation: number }): Promise<void>;
}
declare function usePlatformService(): PlatformService;

/** 基础服务容器（原 fs()，js 2638）：useServices → { zcodeAgentService, zcodeSessionService, … } */
interface ZCodeAgentService {
  listSessionSubagents(req: {
    workspacePath: string;
    workspaceIdentity?: string;
    remoteSessionId?: string;
    sessionId: string;
    endedLimit: number;
    endedCursor?: string;
  }): Promise<SubagentListResponse>;
}
interface SubagentListResponse {
  revision: number;
  childSessionIds: string[];
  running: SubagentDirectoryItem[];
  ended: { total: number; items: SubagentDirectoryItem[]; nextCursor?: string };
}
interface ZCodeSessionService {
  closeSession(req: { workspacePath: string; workspaceIdentity?: string; sessionId: string }): Promise<void>;
}
interface BaseServices {
  zcodeAgentService?: ZCodeAgentService;
  zcodeSessionService: ZCodeSessionService;
}
declare function useServices(): BaseServices;

/** 白板 store（原 Oe）：createBoard 返回 {id, name} */
declare const useWhiteboardStore: {
  getState(): { createBoard(req: { defaultNamePrefix?: string; workspaceIdentity?: string | null; workspacePath: string }): { id: string; name: string } };
};

/** 任务结束事件订阅（原 Vie）：父任务结束时回调（清理辅助对话用） */
declare function subscribeTaskEnded(cb: (e: { type: string; taskId: string; workspaceKey: string }) => void): () => void;
/** D5c：TUI 编辑打开请求只读订阅（不消费；实现见 stores-session.tsx TuiEditRequestStore） */
declare function useTuiEditPendingRequest(workspaceKeyOfView: string): {
  workspaceKey: string;
  sessionId: string;
  cwd: string;
  requestId: string;
} | null;

/** 会话运行时层（原 ET()：usePanelScope → { layer }；layer.acquire(sessionId) → {snapshot, release}） */
interface SessionHandle {
  snapshot: SessionSnapshot | null;
  release(): void;
}
interface SessionSnapshot {
  subagents?: { revision: number; running: SubagentDirectoryItem[]; endedTotal: number };
  rows: { window: Array<{ kind: string; toolCallId?: string; [k: string]: unknown }> };
}declare function usePanelScope(): { layer: { acquire(sessionId: string): SessionHandle } };

/** 会话快照钩子（原 k0(handle)） */
declare function useSessionSnapshot(handle: SessionHandle | null): { snapshot: SessionSnapshot | null };

/** 设置 store 选择器（原 Ao(selector, fallback)） */
interface CodePreviewSettings {
  [key: string]: unknown;
}
declare function useSettingsSelector<T>(selector: (s: { theme: string; codePreviewSettings: CodePreviewSettings }) => T, fallback: T): T;

/** 计划 markdown 提取（原 qZ(u1(row).toolCall, workspacePath).markdown） */
declare function extractPlanMarkdown(toolCall: unknown, workspacePath: string): { markdown: string };
declare function unwrapToolCallRow(row: unknown): { toolCall: unknown };

/** 相对时间（原 $S，js 36080）：taskList.justNow/minutesAgo/hoursAgo/daysAgo */
export function formatRelativeTime(timestampMs: number, intl: IntlShape): string {
  const diff = Date.now() - timestampMs;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return intl.formatMessage({ id: "taskList.justNow" });
  if (minutes < 60) return intl.formatMessage({ id: "taskList.minutesAgo" }, { minutes: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return intl.formatMessage({ id: "taskList.hoursAgo" }, { hours: String(hours) });
  const days = Math.floor(hours / 24);
  return intl.formatMessage({ id: "taskList.daysAgo" }, { days: String(days) });
}

/* --- UI 原语（button / usageStatsUiParts / imeComposition chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg";
}
declare const Button: React.FC<ButtonProps>;

/** TooltipProvider（原 Na = usageStatsUiParts Ce，js 512） */
declare const TooltipProvider: React.FC<{ delayDuration?: number; skipDelayDuration?: number; children: React.ReactNode }>;
/** Tooltip（原 Ia = usageStatsUiParts X）：title + shortcut + triggerClassName */
declare const Tooltip: React.FC<{
  title: string;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
  children: React.ReactNode;
}>;

/** Popover 原语（原 T/h/x，imeComposition chunk n/a/i 导出） */
declare const Popover: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
declare const PopoverTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>;
declare const PopoverContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { align?: "start" | "center" | "end"; className?: string }>;

/** 下拉菜单原语（已完整还原于 TopBar.tsx；此处声明接口复用） */
declare const DropdownMenu: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
declare const DropdownMenuTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>;
declare const DropdownMenuContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { align?: "start" | "center" | "end"; className?: string }>;
declare const DropdownMenuItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { disabled?: boolean; onSelect?: () => void }>;

/* --- cmdk 封装（原 Yb/Xb/Zb/Qb/$b/ex/tx，本 chunk 32092–32200；类名逐字保留） --- */

/** Command 根（原 Yb；底层 m_ = 打包进本 chunk 的 cmdk，jsx 26004 起） */
const Command: React.FC<React.ComponentPropsWithoutRef<"div"> & { loop?: boolean; shouldFilter?: boolean }> = ({ className, loop = false, ...rest }) => (
  <div
    data-slot="command"
    data-loop={loop}
    className={cn("flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground", className)}
    {...rest}
  />
);

/** Command 输入（原 Xb：外层 wrapper + InputGroup(qb) + 搜索图标 Jb/Fv） */
const CommandInput: React.FC<{ value: string; onValueChange: (v: string) => void; placeholder?: string; className?: string; inputGroupClassName?: string }> = ({
  className,
  inputGroupClassName,
  ...rest
}) => (
  <div data-slot="command-input-wrapper" className="p-1 border-b border-border">
    {/* InputGroup 类名与搜索图标位与原实现一致（qb + Jb/Fv search 图标） */}
    <div className={cn("h-8 border-0 !bg-transparent hover:border-input-border-hover flex items-center gap-2", inputGroupClassName)}>
      <input
        data-slot="command-input"
        cmdk-input=""
        className={cn("w-full text-ui-base/relaxed text-foreground outline-hidden placeholder:text-foreground-subtlest disabled:cursor-not-allowed disabled:opacity-50", className)}
        {...rest}
      />
    </div>
  </div>
);

/** Command 列表（原 Zb） */
const CommandList: React.FC<React.ComponentPropsWithoutRef<"div">> = ({ className, ...rest }) => (
  <div data-slot="command-list" className={cn("scrollbar-hide max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)} {...rest} />
);

/** Command 空态（原 Qb） */
const CommandEmpty: React.FC<React.ComponentPropsWithoutRef<"div">> = ({ className, ...rest }) => (
  <div data-slot="command-empty" className={cn("py-6 text-center text-ui-base/relaxed", className)} {...rest} />
);

/** Command 分组（原 $b；heading 经 cmdk-group-heading 选择器加样式） */
const CommandGroup: React.FC<React.ComponentPropsWithoutRef<"div"> & { heading?: React.ReactNode }> = ({ className, ...rest }) => (
  <div
    data-slot="command-group"
    className={cn(
      "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-ui-base **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-foreground-subtle",
      className,
    )}
    {...rest}
  />
);

/** Command 项（原 ex；尾部 check 指示器 M_ 在勾选态显示） */
const CommandItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { value?: string; disabled?: boolean; onSelect?: () => void }> = ({ className, children, ...rest }) => (
  <div
    data-slot="command-item"
    className={cn(
      "group/command-item relative flex min-h-7 cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-ui-base/relaxed outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-menu-hover data-selected:bg-menu-hover data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-foreground",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

/* --- ContextMenu 封装（原 yk/bk/xk/Sk，本 chunk 48825–48852；类名逐字保留） --- */

const ContextMenu: React.FC<{ children: React.ReactNode }> = (props) => <div data-slot="context-menu" {...props} />;
const ContextMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = (props) => <div data-slot="context-menu-trigger" {...props} />;
const ContextMenuContent: React.FC<React.ComponentPropsWithoutRef<"div">> = ({ className, ...rest }) => (
  <div
    data-slot="context-menu-content"
    className={cn(
      "z-[60] flex flex-col gap-0.5 min-w-44 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
      className,
    )}
    {...rest}
  />
);
const ContextMenuItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { inset?: boolean; variant?: "default" | "destructive"; disabled?: boolean; onSelect?: () => void }> = ({
  className,
  inset,
  variant = "default",
  ...rest
}) => (
  <div
    data-slot="context-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      "group/context-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive data-[variant=destructive]:data-[highlighted]:text-destructive-foreground data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-current data-[variant=destructive]:data-[highlighted]:*:[svg]:text-destructive-foreground",
      className,
    )}
    {...rest}
  />
);

/* --- Tabs 封装（原 hC/gC/_C/vC，本 chunk 36949–36991；类名逐字保留） --- */

const Tabs: React.FC<React.ComponentPropsWithoutRef<"div"> & { value: string; onValueChange: (v: string) => void; orientation?: "horizontal" | "vertical" }> = ({ className, orientation = "horizontal", ...rest }) => (
  <div data-slot="tabs" data-orientation={orientation} className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)} {...rest} />
);
const TabsList: React.FC<React.ComponentPropsWithoutRef<"div"> & { variant?: "default" | "line" }> = ({ className, variant = "default", ...rest }) => (
  <div
    data-slot="tabs-list"
    data-variant={variant}
    className={cn(
      // 原 zje cva：default=bg-muted；line=gap-1 bg-transparent（侧面板用 line 变体 + 大量覆盖类）
      "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
      variant === "default" ? "bg-muted" : "gap-1 bg-transparent",
      className,
    )}
    {...rest}
  />
);
const TabsTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { value: string; asChild?: boolean }> = ({ className, ...rest }) => (
  <button
    data-slot="tabs-trigger"
    className={cn(
      "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-ui-base font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
      "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
      "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
      "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
      className,
    )}
    {...rest}
  />
);
const TabsContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { value: string; forceMount?: boolean }> = ({ className, ...rest }) => (
  <div data-slot="tabs-content" className={cn("flex-1 text-ui-base outline-none", className)} {...rest} />
);

/* --- dnd-kit（vendored 进本 chunk，91811–94695；此处声明应用面接口） --- */

declare class PointerSensor {
  static activators: unknown;
}
declare function useSensor(sensor: unknown, options?: { activationConstraint?: { distance?: number } }): unknown;
declare function useSensors(...sensors: unknown[]): unknown;
/** 原 KX（js 92201）：按碰撞矩形与可放置矩形中心距离排序（closestCenter 变体） */
declare const closestCenterCollision: (args: unknown) => Array<{ id: string; data: unknown }>;
declare const SortableContext: React.FC<{ items: string[]; strategy?: unknown; children: React.ReactNode }>;
declare const rectSortingStrategy: unknown;
declare function useSortable(args: { id: string }): {
  attributes: Record<string, unknown>;
  listeners?: { onPointerDown?: (e: React.PointerEvent) => void };
  setNodeRef: (node: HTMLElement | null) => void;
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
  transition?: string;
  isDragging: boolean;
};
declare const DragOverlay: React.FC<{ dropAnimation?: null; children: React.ReactNode }>;
/** 原 BX.Transform.toString（js 91956） */
declare function transformToString(t: { x: number; y: number; scaleX: number; scaleY: number } | null): string | undefined;

/* --- react-resizable-panels 封装（原 Z4=pAt Panel / Q4 PanelResizeHandle，131934–131960） --- */

declare const Panel: React.FC<
  React.ComponentPropsWithoutRef<"div"> & {
    id: string;
    panelRef?: React.Ref<unknown>;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    defaultSize?: string;
    minSize?: string;
    maxSize?: string;
    collapsedSize?: string;
    collapsible?: boolean;
    disabled?: boolean;
  }
>;
declare const PanelResizeHandle: React.FC<React.ComponentPropsWithoutRef<"div">>;

/* --- ScopedErrorBoundary（原 p4，js 129952；行为：错误时渲染 $Ot 错误视图，
 *     resetKeys 变化时自动复位；此处保留接口） --- */
declare const ScopedErrorBoundary: React.FC<{
  scope: string;
  resetKeys?: unknown[];
  variant?: "panel" | "full";
  className?: string;
  onCaughtReactError?: (error: unknown, info: { componentStack?: string }, scope: string) => void;
  onReset?: () => void;
  children: React.ReactNode;
}>;

/* --- 文件图标（原 zc/Vc，js 5150/5195） --- */
interface FileDisplayInfo {
  fileIcon: string;
  fileIconSrc: string;
  fileName: string;
  filePath: string | null;
  normalizedPath: string;
}
declare function resolveFileDisplayInfo(path: string, options?: { basePath?: string; kind?: "directory" | "file" }): FileDisplayInfo;
const FileIconImg: React.FC<{ src: string; size?: number; className?: string }> = ({ src, size = 16, className }) => (
  <img src={src} alt="" width={size} height={size} className={className} aria-hidden="true" draggable={false} />
);

/* --- 图标（原 Sa 工厂批量生成的 lucide 图标；此处按语义命名） --- */

type IconProps = React.SVGProps<SVGSVGElement>;
declare function createLucideIcon(name: string, paths: unknown[]): React.FC<IconProps>;

const IconPlus = createLucideIcon("plus", []);                      // 原 kv（js 27606）新增标签 ⊞
const IconChevronsDown = createLucideIcon("chevrons-down", []);     // 原 dye（js 26804）标签总览
const IconMessageSquareText = createLucideIcon("message-square-text", []); // 原 _v（js 27399）辅助对话
const IconFileDiff = createLucideIcon("file-diff", []);             // 原 X_（js 27036）审查/git
const IconSquareTerminal = createLucideIcon("square-terminal", []); // 原 Uv（js 27818）终端
const IconGlobe = createLucideIcon("globe", []);                    // 原 nv（js 27170）浏览器
const IconBug = createLucideIcon("bug", []);                        // 原 k_（js 26737）开发者工具
const IconNotepadText = createLucideIcon("notepad-text", []);       // 原 Sv（js 27501）计划详情
const IconBot = createLucideIcon("bot", []);                        // 原 D_（js 26708）子智能体会话
const IconListTree = createLucideIcon("list-tree", []);             // 原 uv（js 27300）子智能体目录
const IconMap = createLucideIcon("map", []);                        // 原 qye（js 27335）treemapping
const IconPalette = createLucideIcon("palette", []);                // 原 wv（js 27522）白板
const IconWaypoints = createLucideIcon("waypoints", []);            // 原 Ibe（js 27982）模型轨迹
const IconFileCodeCorner = createLucideIcon("file-code-corner", []); // 原 Y_（js 27024）代码查看回退
const IconX = createLucideIcon("x", []);                            // 原 g（imeComposition chunk b 导出）关闭
const IconLoaderCircle = createLucideIcon("loader-circle", []);     // 原 M（imeComposition chunk w 导出）spinner
const IconMousePointer2 = createLucideIcon("mouse-pointer-2", []);  // 原 o（imeComposition chunk C 导出）browser-use 操作
const IconCirclePause = createLucideIcon("circle-pause", []);       // 原 gye（js 26839）waiting/blocked
const IconCircleCheck = createLucideIcon("circle-check", []);       // 原 I_（js 26821）success
const IconCircleAlert = createLucideIcon("circle-alert", []);       // 原 F_（js 26812）failed
const IconBan = createLucideIcon("ban", []);                        // 原 iye（js 26680）cancelled
const IconCircleDashed = createLucideIcon("circle-dashed", []);     // 原 mye（js 26825）lost

/** repo wiki 品牌图标（原 s3，js 132175；自定义 32×32 SVG，非 lucide） */
const RepoWikiIcon: React.FC<IconProps & { size?: number }> = ({ size, ...rest }) => (
  <svg aria-hidden="true" viewBox="0 0 32 32" width={size ?? 24} height={size ?? 24} fill="none" {...rest}>
    {/* 四个圆角方块拼合（路径从略，逐字见 js 132175–132200） */}
    <path d="M9.91922 3.2002H4.47922C3.77229 3.2002 3.19922 3.77327 3.19922 4.4802V9.9202C3.19922 10.6271 3.77229 11.2002 4.47922 11.2002H9.91922C10.6261 11.2002 11.1992 10.6271 11.1992 9.9202V4.4802C11.1992 3.77327 10.6261 3.2002 9.91922 3.2002Z" />
  </svg>
);

/* --- 他族叶子组件（接口保留；完整实现见各自族报告） --- */

/** 会话面板（原 R0，F03 ConversationFamily，js 119219 / jsx 101388） */
declare const ConversationPane: React.FC<{
  paneId: string;
  sessionId: string;
  rootSessionId?: string;
  selectionSideChat?: boolean;
  readOnly?: boolean;
  allowWorkspaceFileRewind?: boolean;
  focused?: boolean;
  telemetryVisible?: boolean;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenCodeViewer?: (source: CodeViewerSource) => void;
  onOpenFileLink?: (path: string) => void;
  onOpenSubagentSession?: (req: SubagentOpenRequest) => void;
  onSelectionSideChatUnavailable?: () => void;
}>;

/** 代码查看面板（原 tHt，F14 CodeViewerFamily，js 161141） */
declare const CodeViewerPanel: React.FC<{
  source: CodeViewerSource;
  onClose: () => void;
  workspacePath: string;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  renderHeavyContent: boolean;
}>;

/** Git 变更面板 = 审查标签内容（原 BWt，本族叶子，js 178584 / jsx 144748；
 *  体量大，接口保留：文件变更列表+diff 查看+查找+源切换） */
declare const GitChangesPanel: React.FC<{
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  gitState: GitState;
  isDesktop: boolean;
  selectedSourceId: string;
  fileChangeFindActiveIndex: number;
  fileChangeFindNavigationRequestId: number;
  fileChangeFindQuery: string;
  onFileChangeFindMatchCountChange: (count: number) => void;
  onSelectSource: (sourceId: string) => void;
  onClose: () => void;
  onRefresh: () => void;
  onRevealFileInTree: (path: string) => void;
}>;
interface GitState {
  [key: string]: unknown;
}

/** 白板画布（原 FGt，js 179888）、Treemapping（原 AGt，js 179493）、
 *  模型轨迹（原 tKt，js 180606）、开发者工具（原 mKt，js 180870）、
 *  仓库 Wiki（原 l3，F16，js 132306）、终端面板（原 bUt，F13，js 175976）、
 *  内嵌浏览器视图（原 _Wt，F13，js 177724）、browser-use 视图（原 vWt，F13，js 178191）
 *  —— 均为大体积叶子，接口保留。 */
declare const WhiteboardCanvas: React.FC<{ workspacePath: string; workspaceIdentity?: string | null; boardId: string }>;
declare const TreemappingView: React.FC<{ activeTaskId: string | null; workspacePath: string; workspaceIdentity?: string | null; source: { kind: "current" } | { kind: string; [k: string]: unknown } }>;
declare const ModelTrajectoryView: React.FC<{ taskId: string; title: string | null; workspacePath: string; workspaceIdentity?: string | null; onClose: () => void }>;
declare const DeveloperToolsView: React.FC<{ workspacePath: string; workspaceIdentity?: string | null; taskId: string | null }>;
declare const RepoWikiView: React.FC<{ workspacePath: string; workspaceIdentity?: string | null; onOpenCodeViewer: (source: CodeViewerSource) => void }>;
declare const TerminalPanel: React.FC<{
  services: BaseServices;
  cwd: string;
  isVisible: boolean;
  isWindowsDesktop: boolean;
  onOpenBrowserUrl: (url: string) => void;
}>;
declare const BrowserView: React.FC<{
  browserKey: string;
  isResidencyRestore: boolean;
  isVisible: boolean;
  isSelected: boolean;
  isCurrentTask: boolean;
  initialUrl?: string | null;
  faviconUrl?: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  residencyGeneration?: number;
  sessionId: string;
  onUrlChange: (url: string) => void;
  onPageMetadataChange: (meta: BrowserPageMetadata) => void;
  navigationRequest: { id: string; url: string } | null;
  onNavigationRequestHandled: (id: string) => void;
}>;
declare const BrowserUseView: React.FC<{
  tab: BrowserUseTab;
  isPanelVisible: boolean;
  isSelected: boolean;
  isCurrentTask: boolean;
  screenshotSurfaceRequest: ScreenshotSurfaceRequest | null;
  initialUrl?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  residencyGeneration?: number;
  onUrlChange: (url: string) => void;
  onPageMetadataChange: (meta: BrowserPageMetadata) => void;
}>;

/** 服务作用域 provider（原 DT，js 42761）：为子树注入 工作区×远程会话 的服务解析 */
declare const ServiceScopeProvider: React.FC<{
  scope: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string };
  children: React.ReactNode;
}>;

/** Markdown 渲染器（原 cj，F19，jsx 46461；计划详情标签用） */
declare const MarkdownRenderer: React.FC<{
  className?: string;
  workspacePath: string;
  theme: string;
  codePreviewSettings: CodePreviewSettings;
  onOpenCodeViewer?: (source: CodeViewerSource) => void;
  onOpenFileLink?: (path: string) => void;
  onOpenExternalUrl?: (url: string) => void;
  children: string;
}>;

/* ============================================================================
 * 1. 标签模型（14 种标签类型；原类型联合分散于各工厂函数，此处归并）
 * ==========================================================================*/

export type SidePaneTabType =
  | "browser" // 内嵌浏览器（用户手动开）
  | "browser-use" // agent 驱动的浏览器（browser-use 工具）
  | "terminal" // 终端
  | "git" // 审查（Git 变更；标题 sidePane.review=「审查」）
  | "code-viewer" // 代码/文件查看
  | "selection-side-chat" // 辅助对话（框选副屏会话）
  | "plan-detail" // 计划详情（ExitPlanMode markdown）
  | "subagent-session" // 子智能体会话
  | "subagent-directory" // 子智能体目录
  | "treemapping" // 文件活动 diff 地图
  | "whiteboard" // 白板
  | "model-trajectory" // 模型轨迹
  | "repo-wiki" // 仓库 Wiki
  | "developer-tools"; // 开发者工具（token 调试）

interface TabBase {
  id: string;
  type: SidePaneTabType;
  openedAt: number;
  /** 属主任务（草稿态为 __draft__，可为 null）；工作区共享类型无此字段 */
  ownerTaskId?: string | null;
  workspaceKey?: string | null;
  remoteSessionId?: string | null;
}

export interface BrowserTab extends TabBase {
  type: "browser";
  faviconUrl: string | null;
  initialUrl: string | null;
  title: string | null;
  /** 驻留状态：resident（默认）/ suspend-pending / suspended / restoring */
  residency?: "resident" | "suspend-pending" | "suspended" | "restoring";
  residencyGeneration?: number;
}

export interface BrowserUseTab extends TabBase {
  type: "browser-use";
  sessionId: string;
  tabId: string;
  browserId?: string;
  browserGeneration?: number;
  title?: string | null;
  faviconUrl?: string | null;
  residency?: BrowserTab["residency"];
  residencyGeneration?: number;
  /** 操作呼吸指示截止时间戳（原 browserUseOperationUntil，lae=5000ms TTL） */
  browserUseOperationUntil?: number;
  browserUseResizeBaselineVersion?: number;
}

export interface TerminalTab extends TabBase {
  type: "terminal";
  title: string;
  cwd?: string;
}

export interface GitTab extends TabBase {
  type: "git";
  /** 固定 id = "git"（工作区共享） */
}

export type CodeViewerSource =
  | { type: "file" | "image" | "pdf" | "pptx"; title: string; path: string }
  | { type: "text"; title: string; path?: string; content?: string }
  | { type: "patch"; title: string; path?: string; patch: string }
  | { type: "multi-file-diff"; title: string; path?: string; beforeContent: string; afterContent: string };

export interface CodeViewerTab extends TabBase {
  type: "code-viewer";
  source: CodeViewerSource;
  sourceKey: string | null;
}

export interface SelectionSideChatTab extends TabBase {
  type: "selection-side-chat";
  workspacePath: string;
  workspaceIdentity?: string;
  parentSessionId: string;
  childSessionId: string;
  /** 同一父会话下的第几个辅助对话（从 1 起） */
  ordinal: number;
}

export interface PlanDetailTab extends TabBase {
  type: "plan-detail";
  workspacePath: string;
  workspaceIdentity?: string;
  parentSessionId: string;
  toolCallId: string;
  markdown?: string;
  planFilePath?: string;
}

export interface SubagentSessionTab extends TabBase {
  type: "subagent-session";
  workspacePath: string;
  workspaceIdentity?: string;
  rootSessionId: string;
  parentSessionId: string;
  childSessionId: string;
  subagentType: string;
  title: string;
}

export interface SubagentDirectoryTab extends TabBase {
  type: "subagent-directory";
  workspacePath: string;
  workspaceIdentity?: string;
  rootSessionId: string;
  parentSessionId: string;
}

export interface TreemappingTab extends TabBase {
  type: "treemapping";
  source?: { kind: "current" } | { kind: string; [k: string]: unknown };
}

export interface WhiteboardTab extends TabBase {
  type: "whiteboard";
  boardId: string;
  title?: string;
}

export interface ModelTrajectoryTab extends TabBase {
  type: "model-trajectory";
  taskId: string;
  title: string | null;
}

export interface RepoWikiTab extends TabBase {
  type: "repo-wiki";
}

export interface DeveloperToolsTab extends TabBase {
  type: "developer-tools";
}

export type SidePaneTab =
  | BrowserTab
  | BrowserUseTab
  | TerminalTab
  | GitTab
  | CodeViewerTab
  | SelectionSideChatTab
  | PlanDetailTab
  | SubagentSessionTab
  | SubagentDirectoryTab
  | TreemappingTab
  | WhiteboardTab
  | ModelTrajectoryTab
  | RepoWikiTab
  | DeveloperToolsTab;

export interface SidePaneState {
  tabs: SidePaneTab[];
  activeTabId: string;
}

/** 最近关闭标签条目（原 ye 数组元素；上限 Roe=8） */
export interface RecentClosedSidePaneTab {
  tab: SidePaneTab;
  closedAt: number;
}

interface BrowserUseTabDescriptor {
  workspaceKey: string;
  remoteSessionId?: string | null;
  sessionId: string;
  tabId: string;
  browserId?: string;
  browserGeneration?: number;
  title?: string | null;
  activate?: boolean;
}
interface BrowserUseOperationEvent {
  workspaceKey: string;
  remoteSessionId?: string | null;
  sessionId: string;
  tabId: string;
  browserId?: string;
  browserGeneration?: number;
  resetsResizeBaseline?: boolean;
}
interface BrowserUseVisibilityEvent {
  visible: boolean;
  workspaceKey: string;
  remoteSessionId?: string | null;
  sessionId: string;
  browserId: string;
  browserGeneration: number;
  tabId?: string;
}
interface BrowserResidencyEvent {
  tabId: string;
  workspaceKey?: string;
  remoteSessionId?: string | null;
  sessionId?: string;
  residency: "resident" | "suspend-pending" | "suspended" | "restoring";
  generation: number;
  browserId?: string;
  browserGeneration?: number;
}
interface ScreenshotSurfaceRequest {
  requestId: string;
  workspaceKey: string;
  sessionId: string;
  browserId: string;
  browserGeneration: number;
  tabId: string;
  webContentsId: number;
}
interface BrowserPageMetadata {
  title?: string | null;
  faviconUrl?: string | null;
  [key: string]: unknown;
}
interface BrowserNavigationRequest {
  id: string;
  targetTabId: string;
  url: string;
}
export interface SubagentDirectoryItem {
  childSessionId: string;
  subagentType: string;
  title: string;
  status: "running" | "waiting" | "blocked" | "success" | "failed" | "cancelled" | "lost";
  summary?: string;
  startedAt?: number;
  endedAt?: number;
}
export interface SubagentOpenRequest {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  rootSessionId?: string;
  parentSessionId: string;
  childSessionId: string;
  subagentType: string;
  title: string;
}

/* ============================================================================
 * 2. 标签工厂（原 2015–2158 / jsx 1066–1229；id 规则逐字保留）
 * ==========================================================================*/

/** 原 pae：browser tab。id = tabId ?? `browser:${uid()}` */
export function createBrowserTab(opts?: { tabId?: string; initialUrl?: string | null; ownerTaskId?: string | null }): BrowserTab {
  return {
    id: opts?.tabId ?? `browser:${uid()}`,
    type: "browser",
    faviconUrl: null,
    initialUrl: opts?.initialUrl ?? null,
    openedAt: Date.now(),
    title: null,
  };
}

/** 原 mae：git（审查）tab。固定 id = "git"（工作区共享，单实例） */
export function createGitTab(): GitTab {
  return { id: "git", type: "git", openedAt: Date.now() };
}

/** 原 hae：model-trajectory tab。id = `model-trajectory:${taskId}` */
export function createModelTrajectoryTab(opts: { taskId: string; title?: string | null }): ModelTrajectoryTab {
  return { id: `model-trajectory:${opts.taskId}`, type: "model-trajectory", openedAt: Date.now(), taskId: opts.taskId, title: opts.title ?? null };
}

/** 原 gae：repo-wiki tab。固定 id = "repo-wiki" */
export function createRepoWikiTab(): RepoWikiTab {
  return { id: "repo-wiki", type: "repo-wiki", openedAt: Date.now() };
}

/** 原 _ae：developer-tools tab。固定 id = "developer-tools" */
export function createDeveloperToolsTab(): DeveloperToolsTab {
  return { id: "developer-tools", type: "developer-tools", openedAt: Date.now() };
}

/** 原 vae：terminal tab。id = `terminal:${uid()}`，标题由 nextTerminalTabTitle 生成 */
export function createTerminalTab(opts: { title: string; cwd?: string; remoteSessionId?: string | null }): TerminalTab {
  return {
    id: `terminal:${uid()}`,
    type: "terminal",
    openedAt: Date.now(),
    title: opts.title,
    ...(opts.cwd ? { cwd: opts.cwd } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
  };
}

const encodeKeyPart = (value: string) => encodeURIComponent(value);

/** 原 yae：subagent-session tab。id = 四段冒号拼接（工作区/根会话/子会话 均 URI 编码） */
export function createSubagentSessionTab(opts: SubagentOpenRequest & { workspaceKey: string }): SubagentSessionTab {
  const rootSessionId = opts.rootSessionId ?? opts.parentSessionId;
  return {
    id: ["subagent-session", encodeKeyPart(opts.workspaceKey), encodeKeyPart(rootSessionId), encodeKeyPart(opts.childSessionId)].join(":"),
    type: "subagent-session",
    openedAt: Date.now(),
    workspaceKey: opts.workspaceKey,
    workspacePath: opts.workspacePath,
    ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
    rootSessionId,
    parentSessionId: opts.parentSessionId,
    childSessionId: opts.childSessionId,
    subagentType: opts.subagentType,
    title: opts.title.trim(),
  };
}

/** 原 bae：subagent-directory tab。id 三段（父会话级目录） */
export function createSubagentDirectoryTab(opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }): SubagentDirectoryTab {
  const rootSessionId = opts.rootSessionId ?? opts.parentSessionId;
  return {
    id: ["subagent-directory", encodeKeyPart(opts.workspaceKey), encodeKeyPart(rootSessionId), encodeKeyPart(opts.parentSessionId)].join(":"),
    type: "subagent-directory",
    openedAt: Date.now(),
    workspaceKey: opts.workspaceKey,
    workspacePath: opts.workspacePath,
    ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
    rootSessionId,
    parentSessionId: opts.parentSessionId,
  };
}

/** 原 xae：selection-side-chat（辅助对话）tab。id 三段（父/子会话） */
export function createSelectionSideChatTab(opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; childSessionId: string; ordinal: number }): SelectionSideChatTab {
  return {
    id: ["selection-side-chat", encodeKeyPart(opts.workspaceKey), encodeKeyPart(opts.parentSessionId), encodeKeyPart(opts.childSessionId)].join(":"),
    type: "selection-side-chat",
    openedAt: Date.now(),
    workspaceKey: opts.workspaceKey,
    workspacePath: opts.workspacePath,
    ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
    parentSessionId: opts.parentSessionId,
    childSessionId: opts.childSessionId,
    ordinal: opts.ordinal,
  };
}

/** 原 Sae：plan-detail tab。id 三段（父会话/工具调用） */
export function createPlanDetailTab(opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; toolCallId: string; markdown?: string; planFilePath?: string }): PlanDetailTab {
  return {
    id: ["plan-detail", encodeKeyPart(opts.workspaceKey), encodeKeyPart(opts.parentSessionId), encodeKeyPart(opts.toolCallId)].join(":"),
    type: "plan-detail",
    openedAt: Date.now(),
    workspaceKey: opts.workspaceKey,
    workspacePath: opts.workspacePath,
    ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
    ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
    parentSessionId: opts.parentSessionId,
    toolCallId: opts.toolCallId,
    markdown: opts.markdown,
    ...(opts.planFilePath ? { planFilePath: opts.planFilePath } : {}),
  };
}

/** 原 Cae：whiteboard tab。id = `whiteboard:${boardId}` */
export function createWhiteboardTab(opts: { boardId: string; title?: string }): WhiteboardTab {
  return { id: `whiteboard:${opts.boardId}`, type: "whiteboard", boardId: opts.boardId, openedAt: Date.now(), title: opts.title };
}

/** 原 Tae：31 进制内容哈希（patch/multi-file-diff 的 sourceKey 用） */
function hash36(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) hash = (hash * 31 + content.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
}

/** 原 wae：code-viewer sourceKey（内容寻址去重；不可寻址返回 null） */
function codeViewerSourceKey(source: CodeViewerSource, workspaceIdentity?: string | null): string | null {
  const prefix = workspaceIdentity?.trim() ? workspaceIdentity.trim() : "";
  const ns = prefix ? `${prefix}:` : "";
  if (source.type === "file" || source.type === "image" || source.type === "pdf" || source.type === "pptx" || (source.type === "text" && source.path)) {
    return `${ns}${source.type}:${source.path}`;
  }
  if (source.type === "patch") return `${ns}patch:${source.path ?? source.title}:${hash36(source.patch)}`;
  if (source.type === "multi-file-diff") return `${ns}multi-file-diff:${source.path ?? source.title}:${hash36(`${source.beforeContent}\u0000${source.afterContent}`)}`;
  return null;
}

/** 原 cae：URI 解码 source 的 title/path（解码失败原样返回） */
function normalizeDecodedSource(source: CodeViewerSource): CodeViewerSource {
  // 完整实现见 js 1965–1976：decodeURI 保护 + 标题回退为文件名
  return source;
}

/** 原 Eae：code-viewer tab。id = sourceKey ? `code-viewer:${sourceKey}` : `code-viewer:${uid()}` */
export function createCodeViewerTab(rawSource: CodeViewerSource, workspaceIdentity?: string | null): CodeViewerTab {
  const source = normalizeDecodedSource(rawSource);
  const key = codeViewerSourceKey(source, workspaceIdentity);
  return { id: key ? `code-viewer:${key}` : `code-viewer:${uid()}`, type: "code-viewer", openedAt: Date.now(), source, sourceKey: key };
}

/* ============================================================================
 * 3. 状态转换（纯函数；原 2159–2575 / jsx 1231–1654）
 * ==========================================================================*/

/** 原 es：ownerTaskId 归一（空 → `__draft__` 草稿域） */
const ownerKey = (ownerTaskId: string | null | undefined): string => ownerTaskId ?? "__draft__";

/** 原 Zo */
function findTabIndex(state: SidePaneState | null, tabId: string): number {
  return state ? state.tabs.findIndex((t) => t.id === tabId) : -1;
}

/** 原 Qo：upsert —— 已存在同 id 则原位替换，否则追加；一律激活 */
export function upsertTab(state: SidePaneState | null, tab: SidePaneTab): SidePaneState {
  if (!state) return { tabs: [tab], activeTabId: tab.id };
  const index = findTabIndex(state, tab.id);
  if (index >= 0) {
    const tabs = [...state.tabs];
    tabs[index] = tab;
    return { tabs, activeTabId: tab.id };
  }
  return { tabs: [...state.tabs, tab], activeTabId: tab.id };
}

/** 原 $o：取激活标签 */
function findActiveTab(state: SidePaneState | null): SidePaneTab | null {
  return state ? (state.tabs.find((t) => t.id === state.activeTabId) ?? null) : null;
}

/** 原 Dae/Oae：工作区共享类型（跨任务可见，不随任务切换过滤） */
const WORKSPACE_SHARED_TAB_TYPES = new Set<SidePaneTabType>(["git", "repo-wiki", "developer-tools", "treemapping"]);
function isWorkspaceSharedTab(tab: SidePaneTab): boolean {
  return WORKSPACE_SHARED_TAB_TYPES.has(tab.type);
}

/** 原 kae */
function tabMatchesWorkspace(tab: SidePaneTab, workspaceKey: string | null): boolean {
  return tab.workspaceKey == null || tab.workspaceKey === workspaceKey;
}

/** 原 Aae：给未打标标签补属主（任务切换时把无主标签收编到当前任务） */
export function stampTabOwnership(state: SidePaneState | null, owner: { ownerTaskId: string | null; workspaceKey: string; remoteSessionId: string | null }): SidePaneState | null {
  if (!state) return state;
  let changed = false;
  const tabs = state.tabs.map((tab) =>
    tab.ownerTaskId === undefined
      ? ((changed = true),
        {
          ...tab,
          ownerTaskId: owner.ownerTaskId,
          workspaceKey: tab.workspaceKey ?? owner.workspaceKey,
          ...((tab.type === "browser" || tab.type === "browser-use") && owner.remoteSessionId ? { remoteSessionId: owner.remoteSessionId } : {}),
        })
      : tab,
  );
  return changed ? { ...state, tabs } : state;
}

/** 原 ts：标签是否属于某任务（browser-use 按 sessionId；subagent 按 rootSessionId；
 *  selection-side-chat/plan-detail 按 parentSessionId；其余按 ownerTaskId） */
export function tabBelongsToTask(tab: SidePaneTab, ownerTaskId: string | null): boolean {
  if (tab.type === "browser-use") return tab.sessionId === ownerTaskId;
  if (tab.type === "subagent-session" || tab.type === "subagent-directory") return tab.rootSessionId === ownerTaskId;
  if (tab.type === "selection-side-chat" || tab.type === "plan-detail") return tab.parentSessionId === ownerTaskId;
  return ownerKey(tab.ownerTaskId) === ownerKey(ownerTaskId);
}

/** 原 jae：按 工作区×任务 作用域过滤可见标签 */
export function filterTabsForScope(tabs: SidePaneTab[], scope: { workspaceKey: string; ownerTaskId: string | null }): SidePaneTab[] {
  const owner = ownerKey(scope.ownerTaskId);
  return tabs.filter((tab) =>
    tabMatchesWorkspace(tab, scope.workspaceKey)
      ? isWorkspaceSharedTab(tab)
        ? true
        : tab.type === "browser-use"
          ? tab.sessionId === scope.ownerTaskId
          : tab.type === "subagent-session" || tab.type === "subagent-directory"
            ? tab.rootSessionId === scope.ownerTaskId
            : tab.type === "selection-side-chat" || tab.type === "plan-detail"
              ? tab.parentSessionId === scope.ownerTaskId
              : ownerKey(tab.ownerTaskId) === owner
      : false,
  );
}

/** 原 ns：可见标签列表（兼容旧的纯数组形态） */
export function visibleTabsForOwner(state: SidePaneState | SidePaneTab[] | null, scope: { workspaceKey: string; ownerTaskId: string | null }): SidePaneTab[] {
  if (Array.isArray(state)) return filterTabsForScope(state, scope);
  return state?.tabs.filter((tab) => tabBelongsToTask(tab, scope.ownerTaskId)) ?? [];
}

/** 原 Mae：作用域内应激活的标签 id（优先 preferred，其次当前激活，最后最后一个） */
function resolveScopeActiveTabId(state: SidePaneState | null, scope: { workspaceKey: string; ownerTaskId: string | null }, preferredTabId: string | null): string | null {
  if (!state) return null;
  const tabs = filterTabsForScope(state.tabs, scope);
  if (tabs.length === 0) return null;
  if (preferredTabId && tabs.some((t) => t.id === preferredTabId)) return preferredTabId;
  if (tabs.some((t) => t.id === state.activeTabId)) return state.activeTabId;
  return tabs.at(-1)?.id ?? null;
}

/** 原 Nae：任务切换时同步作用域（激活标签 + 是否收起） */
export function syncScopeState(state: SidePaneState | null, scope: { workspaceKey: string; ownerTaskId: string | null }, preferredTabId: string | null): { sidePaneState: SidePaneState | null; isSidePaneCollapsed: boolean } {
  const activeTabId = resolveScopeActiveTabId(state, scope, preferredTabId);
  return {
    sidePaneState: state && state.activeTabId !== (activeTabId ?? "") ? { ...state, activeTabId: activeTabId ?? "" } : state,
    isSidePaneCollapsed: activeTabId === null,
  };
}

/** 原 Pae：重开最近关闭的标签（保留原 openedAt） */
function reopenTab(state: SidePaneState | null, tab: SidePaneTab): SidePaneState {
  return upsertTab(state, { ...tab, openedAt: tab.openedAt ?? Date.now() });
}

/** 原 Fae：打开/聚焦浏览器 —— 无强制参数且当前任务已有 browser tab 则直接激活它 */
function openOrFocusBrowserTab(state: SidePaneState | null, opts?: { forceNew?: boolean; tabId?: string; initialUrl?: string | null; ownerTaskId?: string | null }): SidePaneState {
  if (!opts?.forceNew && !opts?.tabId && !opts?.initialUrl) {
    const owner = ownerKey(opts?.ownerTaskId);
    const existing = state?.tabs.find((t) => t.type === "browser" && ownerKey(t.ownerTaskId) === owner);
    if (existing) return upsertTab(state, existing);
  }
  return upsertTab(state, createBrowserTab(opts));
}

/** 原 Iae：强制新建浏览器标签 */
function openNewBrowserTab(state: SidePaneState | null, opts?: { tabId?: string; initialUrl?: string | null; ownerTaskId?: string | null }): SidePaneState {
  return openOrFocusBrowserTab(state, { ...opts, forceNew: true });
}

/** 原 Lae：upsert browser-use 标签（保留驻留/图标/操作态；activate!==false 时激活） */
function upsertBrowserUseTab(state: SidePaneState | null, descriptor: BrowserUseTabDescriptor): SidePaneState {
  const id = `browser-use:${descriptor.tabId}`;
  const existing = state?.tabs.find((t) => t.type === "browser-use" && t.id === id) as BrowserUseTab | undefined;
  const remoteSessionId = descriptor.remoteSessionId ?? existing?.remoteSessionId;
  const tab: BrowserUseTab = {
    id,
    type: "browser-use",
    ownerTaskId: descriptor.sessionId,
    workspaceKey: descriptor.workspaceKey,
    ...(remoteSessionId ? { remoteSessionId } : {}),
    sessionId: descriptor.sessionId,
    tabId: descriptor.tabId,
    ...(descriptor.browserId ? { browserId: descriptor.browserId } : {}),
    ...(descriptor.browserGeneration === undefined ? {} : { browserGeneration: descriptor.browserGeneration }),
    openedAt: existing?.openedAt ?? Date.now(),
    ...((descriptor.title ?? existing?.title) ? { title: descriptor.title ?? existing?.title ?? null } : {}),
    ...(existing?.faviconUrl === undefined ? {} : { faviconUrl: existing.faviconUrl }),
    ...(existing?.residency === undefined ? {} : { residency: existing.residency }),
    ...(existing?.residencyGeneration === undefined ? {} : { residencyGeneration: existing.residencyGeneration }),
    ...(existing?.browserUseOperationUntil === undefined ? {} : { browserUseOperationUntil: existing.browserUseOperationUntil }),
    ...(existing?.browserUseResizeBaselineVersion === undefined ? {} : { browserUseResizeBaselineVersion: existing.browserUseResizeBaselineVersion }),
  };
  if (descriptor.activate !== false) return upsertTab(state, tab);
  if (!state) return { tabs: [tab], activeTabId: "" };
  const index = findTabIndex(state, tab.id);
  if (index >= 0) {
    const tabs = [...state.tabs];
    tabs[index] = tab;
    return { ...state, tabs };
  }
  return { ...state, tabs: [...state.tabs, tab] };
}

/** 原 Rae：browser-use 就绪 —— 属当前任务则展开并激活，否则后台挂载 */
function revealBrowserUseTab(state: SidePaneState | null, descriptor: BrowserUseTabDescriptor, scope: { workspaceKey: string; remoteSessionId: string | null; ownerTaskId: string | null }): { state: SidePaneState | null; shouldReveal: boolean } {
  const isCurrentScope =
    descriptor.workspaceKey === scope.workspaceKey && (descriptor.remoteSessionId ?? "") === (scope.remoteSessionId ?? "") && descriptor.sessionId === scope.ownerTaskId;
  return { state: upsertBrowserUseTab(state, { ...descriptor, activate: isCurrentScope }), shouldReveal: isCurrentScope };
}

/** 原 zae：browser-use 可见性同步（命中现有标签才激活） */
function syncBrowserUseVisibility(
  state: SidePaneState | null,
  descriptor: BrowserUseTabDescriptor & { browserId?: string; browserGeneration?: number },
  scope: { workspaceKey: string; remoteSessionId: string | null; ownerTaskId: string | null },
): { state: SidePaneState | null; shouldReveal: boolean; didMatch: boolean } {
  const match = state?.tabs.find(
    (t) =>
      t.type === "browser-use" &&
      (t as BrowserUseTab).tabId === descriptor.tabId &&
      t.workspaceKey === descriptor.workspaceKey &&
      (t.remoteSessionId ?? "") === (descriptor.remoteSessionId ?? "") &&
      (t as BrowserUseTab).sessionId === descriptor.sessionId &&
      (descriptor.browserId === undefined || (t as BrowserUseTab).browserId === descriptor.browserId) &&
      (descriptor.browserGeneration === undefined || (t as BrowserUseTab).browserGeneration === descriptor.browserGeneration),
  );
  if (!match) return { state, shouldReveal: false, didMatch: false };
  const isCurrentScope =
    descriptor.workspaceKey === scope.workspaceKey && (descriptor.remoteSessionId ?? "") === (scope.remoteSessionId ?? "") && descriptor.sessionId === scope.ownerTaskId;
  return { state: isCurrentScope ? activateTab(state, match.id) : state, shouldReveal: isCurrentScope, didMatch: true };
}

/** 原 Bae：应用驻留状态变更（代际过期保护：旧代际事件被忽略） */
function applyBrowserResidencyChange(state: SidePaneState | null, event: BrowserResidencyEvent): SidePaneState | null {
  if (!state) return state;
  const index = state.tabs.findIndex((t) => (t.type === "browser" && t.id === event.tabId) || (t.type === "browser-use" && (t as BrowserUseTab).tabId === event.tabId));
  if (index < 0) return state;
  const tab = state.tabs[index];
  if (
    (event.workspaceKey !== undefined && tab.workspaceKey !== event.workspaceKey) ||
    (Object.hasOwn(event, "remoteSessionId") && (tab.remoteSessionId ?? "") !== (event.remoteSessionId ?? "")) ||
    (event.sessionId !== undefined &&
      (tab.type === "browser-use" ? (tab as BrowserUseTab).sessionId !== event.sessionId : (tab.ownerTaskId ?? "unscoped") !== event.sessionId)) ||
    ((tab as BrowserTab).residencyGeneration ?? 0) > event.generation
  ) {
    return state;
  }
  const tabs = [...state.tabs];
  tabs[index] = {
    ...tab,
    ...(tab.type === "browser-use" && event.browserId ? { browserId: event.browserId } : {}),
    ...(tab.type === "browser-use" && event.browserGeneration !== undefined ? { browserGeneration: event.browserGeneration } : {}),
    residency: event.residency,
    residencyGeneration: event.generation,
  } as SidePaneTab;
  return { ...state, tabs };
}
/** 原 Vae：打开代码查看（同 sourceKey×任务 去重） */
function openCodeViewerTab(state: SidePaneState | null, source: CodeViewerSource, ownerTaskId: string | null): SidePaneState {
  const tab = createCodeViewerTab(source);
  if (!state || tab.sourceKey === null) return upsertTab(state, tab);
  const owner = ownerKey(ownerTaskId);
  const existing = state.tabs.find((t) => t.type === "code-viewer" && (t as CodeViewerTab).sourceKey === tab.sourceKey && ownerKey(t.ownerTaskId) === owner) as CodeViewerTab | undefined;
  return upsertTab(state, existing ? { ...existing, source: tab.source } : tab);
}

/** 原 Hae/Uae/Wae/Gae/Kae/qae：各型打开（upsert 语义，固定 id 天然单实例） */
const openGitTab = (state: SidePaneState | null) => upsertTab(state, createGitTab());
const openWhiteboardTab = (state: SidePaneState | null, opts: { boardId: string; title?: string }) => upsertTab(state, createWhiteboardTab(opts));
const openModelTrajectoryTab = (state: SidePaneState | null, opts: { taskId: string; title?: string | null }) => upsertTab(state, createModelTrajectoryTab(opts));
const openRepoWikiTab = (state: SidePaneState | null) => upsertTab(state, createRepoWikiTab());
const openDeveloperToolsTab = (state: SidePaneState | null) => upsertTab(state, createDeveloperToolsTab());
const openTerminalTabState = (state: SidePaneState | null, opts: { title: string; cwd?: string; remoteSessionId?: string | null }) => upsertTab(state, createTerminalTab(opts));

/** 原 Jae：打开子智能体会话（已存在则刷新元数据） */
function openSubagentSessionTab(state: SidePaneState | null, opts: SubagentOpenRequest & { workspaceKey: string }): SidePaneState {
  const fresh = createSubagentSessionTab(opts);
  const existing = state?.tabs.find((t) => t.type === "subagent-session" && t.id === fresh.id) as SubagentSessionTab | undefined;
  const title = opts.title.trim();
  return upsertTab(
    state,
    existing
      ? {
          ...existing,
          workspacePath: opts.workspacePath,
          ...(opts.workspaceIdentity ? { workspaceIdentity: opts.workspaceIdentity } : {}),
          ...(opts.remoteSessionId ? { remoteSessionId: opts.remoteSessionId } : {}),
          rootSessionId: opts.rootSessionId ?? opts.parentSessionId,
          parentSessionId: opts.parentSessionId,
          subagentType: opts.subagentType,
          title: title || existing.title || "",
        }
      : fresh,
  );
}

/** 原 Yae：打开子智能体目录 */
function openSubagentDirectoryTab(state: SidePaneState | null, opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId: string; parentSessionId: string }): SidePaneState {
  const fresh = createSubagentDirectoryTab(opts);
  const existing = state?.tabs.find((t) => t.type === "subagent-directory" && t.id === fresh.id);
  return upsertTab(state, existing ? { ...existing, ...fresh } : fresh);
}

/** 原 Xae：子智能体会话同步 —— 清理已失效（不在 validChildSessionIds 内）的会话标签 */
function syncSubagentSessionTabs(state: SidePaneState | null, opts: { rootSessionId: string; parentSessionId: string; validChildSessionIds: string[] }): SidePaneState | null {
  if (!state) return null;
  const valid = new Set(opts.validChildSessionIds);
  const stale = state.tabs.filter(
    (t) => t.type === "subagent-session" && (t as SubagentSessionTab).rootSessionId === opts.rootSessionId && (t as SubagentSessionTab).parentSessionId === opts.parentSessionId && !valid.has((t as SubagentSessionTab).childSessionId),
  );
  if (stale.length === 0) return state;
  const staleIds = new Set(stale.map((t) => t.id));
  const tabs = state.tabs.filter((t) => !staleIds.has(t.id));
  if (tabs.length === 0) return null;
  if (!staleIds.has(state.activeTabId)) return { ...state, tabs };
  const directory = state.tabs.find((t) => t.type === "subagent-directory" && (t as SubagentDirectoryTab).rootSessionId === opts.rootSessionId);
  if (directory) return { tabs, activeTabId: directory.id };
  const index = state.tabs.findIndex((t) => t.id === state.activeTabId);
  return { tabs, activeTabId: tabs[Math.max(0, Math.min(index - 1, tabs.length - 1))]?.id ?? tabs.at(-1)!.id };
}

/** 原 Qae：下一个辅助对话序号（同 工作区×父会话 内从 1 递增取空位） */
function nextSelectionChatOrdinal(tabs: SidePaneTab[], workspaceKey: string, parentSessionId: string): number {
  const used = new Set(tabs.flatMap((t) => (t.type === "selection-side-chat" && t.workspaceKey === workspaceKey && t.parentSessionId === parentSessionId ? [t.ordinal] : [])));
  let ordinal = 1;
  while (used.has(ordinal)) ordinal += 1;
  return ordinal;
}

/** 原 Zae：打开辅助对话标签（已存在则刷新；序号稳定） */
function openSelectionSideChatTab(state: SidePaneState | null, opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; childSessionId: string; ordinal?: number }): SidePaneState {
  const existing = state?.tabs.find(
    (t) => t.type === "selection-side-chat" && t.workspaceKey === opts.workspaceKey && (t as SelectionSideChatTab).parentSessionId === opts.parentSessionId && (t as SelectionSideChatTab).childSessionId === opts.childSessionId,
  ) as SelectionSideChatTab | undefined;
  const ordinal = existing?.ordinal ?? nextSelectionChatOrdinal(state?.tabs ?? [], opts.workspaceKey, opts.parentSessionId);
  const fresh = createSelectionSideChatTab({ ...opts, ordinal });
  return upsertTab(state, existing ? { ...existing, ...fresh } : fresh);
}

/** 原 $ae：找当前激活的辅助对话（限同 工作区×父会话） */
export function findActiveSelectionSideChat(state: SidePaneState | null, scope: { workspaceKey: string; parentSessionId: string }): SelectionSideChatTab | null {
  const active = findActiveTab(state);
  return active?.type === "selection-side-chat" && active.workspaceKey === scope.workspaceKey && active.parentSessionId === scope.parentSessionId ? active : null;
}

/** 原 eoe：打开计划详情标签 */
function openPlanDetailTab(state: SidePaneState | null, opts: { workspaceKey: string; workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; toolCallId: string; markdown?: string; planFilePath?: string }): SidePaneState {
  const fresh = createPlanDetailTab(opts);
  const existing = state?.tabs.find((t) => t.type === "plan-detail" && t.id === fresh.id);
  return upsertTab(state, existing ? { ...existing, ...fresh } : fresh);
}

/** 原 is：按 id 关闭标签（激活位就近补位） */
export function closeTabById(state: SidePaneState | null, tabId: string): SidePaneState | null {
  if (!state) return null;
  const index = findTabIndex(state, tabId);
  if (index < 0) return state;
  const tabs = state.tabs.filter((t) => t.id !== tabId);
  if (tabs.length === 0) return null;
  if (state.activeTabId === tabId) return { tabs, activeTabId: tabs[Math.min(index, tabs.length - 1)].id };
  return { tabs, activeTabId: state.activeTabId };
}

/** 原 ns 的 state 形态：按任务归属过滤（工作区过滤只在数组形态生效） */
function visibleTabsForTask(state: SidePaneState | null, ownerTaskId: string | null): SidePaneTab[] {
  return state?.tabs.filter((tab) => tabBelongsToTask(tab, ownerTaskId)) ?? [];
}

/** 原 toe：关闭后确保任务作用域内有激活标签（优先会话类标签） */
function ensureScopeActiveTab(state: SidePaneState | null, ownerTaskId: string | null, preferredTabId?: string | null): SidePaneState | null {
  if (!state) return null;
  const tabs = visibleTabsForTask(state, ownerTaskId);
  if (tabs.length === 0) return state.activeTabId === "" ? state : { ...state, activeTabId: "" };
  const preferred = preferredTabId ? tabs.find((t) => t.id === preferredTabId) : undefined;
  const next =
    tabs.find((t) => t.id === state.activeTabId) ??
    preferred ??
    tabs.findLast((t) => t.type === "subagent-session" || t.type === "subagent-directory" || t.type === "selection-side-chat" || t.type === "plan-detail") ??
    tabs.at(-1);
  return next && next.id !== state.activeTabId ? { ...state, activeTabId: next.id } : state;
}

/** 原 rs：关闭标签 + 任务作用域补位（优先回到该任务最近打开的子智能体标签） */
export function closeTabAndRepair(state: SidePaneState | null, tabId: string, ownerTaskId: string | null, preferredTabId?: string | null): SidePaneState | null {
  return ensureScopeActiveTab(closeTabById(state, tabId), ownerTaskId, preferredTabId);
}

/** 原 ioe：激活标签 */
export function activateTab(state: SidePaneState | null, tabId: string): SidePaneState | null {
  return !state || !state.tabs.some((t) => t.id === tabId) ? state : { ...state, activeTabId: tabId };
}

/** 原 aoe：浏览器元数据补丁（标题/favicon，仅 browser/browser-use） */
interface BrowserMetadataPatch {
  title?: string | null;
  faviconUrl?: string | null;
}
function patchBrowserTabMetadata(state: SidePaneState | null, tabId: string, patch: BrowserMetadataPatch): SidePaneState | null {
  if (!state) return state;
  let changed = false;
  const tabs = state.tabs.map((tab) => (tab.id === tabId && (tab.type === "browser" || tab.type === "browser-use") ? ((changed = true), ({ ...tab, ...patch } as SidePaneTab)) : tab));
  return changed ? { ...state, tabs } : state;
}

/** 原 ooe：标记 browser-use 操作中（呼吸指示 + 可选重置缩放基线） */
function markBrowserUseOperation(state: SidePaneState | null, event: BrowserUseOperationEvent & { operationUntil: number }): SidePaneState | null {
  if (!state) return state;
  let changed = false;
  const tabs = state.tabs.map((tab) =>
    tab.type !== "browser-use" ||
    tab.workspaceKey !== event.workspaceKey ||
    (tab as BrowserUseTab).sessionId !== event.sessionId ||
    ((tab as BrowserUseTab).browserId !== undefined && (tab as BrowserUseTab).browserId !== event.browserId) ||
    ((tab as BrowserUseTab).browserGeneration !== undefined && (tab as BrowserUseTab).browserGeneration !== event.browserGeneration) ||
    (tab as BrowserUseTab).tabId !== event.tabId
      ? tab
      : ((changed = true),
        {
          ...tab,
          browserUseOperationUntil: event.operationUntil,
          ...(event.resetsResizeBaseline ? { browserUseResizeBaselineVersion: ((tab as BrowserUseTab).browserUseResizeBaselineVersion ?? 0) + 1 } : {}),
        }),
  );
  return changed ? { ...state, tabs } : state;
}

/** 原 soe：拖拽重排（把 tabId 移到 targetId 的位置） */
export function reorderTabs(state: SidePaneState | null, tabId: string, targetId: string): SidePaneState | null {
  if (!state || tabId === targetId) return state;
  const from = findTabIndex(state, tabId);
  const to = findTabIndex(state, targetId);
  if (from < 0 || to < 0) return state;
  const tabs = [...state.tabs];
  const [moved] = tabs.splice(from, 1);
  return moved ? (tabs.splice(to, 0, moved), { ...state, tabs }) : state;
}

/** 原 coe：切换浏览器 —— 激活的是当前任务的 browser 则关闭，否则打开/聚焦 */
function toggleBrowserTab(state: SidePaneState | null, ownerTaskId: string | null): SidePaneState | null {
  const owner = ownerKey(ownerTaskId);
  const active = findActiveTab(state);
  return active?.type === "browser" && ownerKey(active.ownerTaskId) === owner ? closeTabById(state, active.id) : openOrFocusBrowserTab(state, { ownerTaskId });
}

/** 原 loe：切换审查 —— 激活的是 git 则关闭，否则打开 */
function toggleGitTab(state: SidePaneState | null): SidePaneState | null {
  const active = findActiveTab(state);
  return active?.type === "git" ? closeTabById(state, active.id) : openGitTab(state);
}

/** 原 uoe：关闭激活的 code-viewer（若有） */
function closeActiveCodeViewer(state: SidePaneState | null): SidePaneState | null {
  const active = findActiveTab(state);
  return active?.type === "code-viewer" ? closeTabById(state, active.id) : state;
}

/** 原 doe：关闭 git 标签 */
const closeGitTab = (state: SidePaneState | null) => closeTabById(state, "git");

/** 原 noe：关闭其他（任务作用域内保留 keepTabId） */
function closeOtherTabs(state: SidePaneState | null, keepTabId: string, ownerTaskId: string | null): SidePaneState | null {
  if (!state) return null;
  const scopeTabs = visibleTabsForTask(state, ownerTaskId);
  const kept = scopeTabs.find((t) => t.id === keepTabId);
  if (!kept) return state;
  const closeIds = new Set(scopeTabs.filter((t) => t.id !== keepTabId).map((t) => t.id));
  return { tabs: state.tabs.filter((t) => !closeIds.has(t.id)), activeTabId: kept.id };
}

/** 原 roe：关闭全部（任务作用域内） */
function closeAllTabs(state: SidePaneState | null, ownerTaskId: string | null): SidePaneState | null {
  if (!state) return null;
  const scopeIds = new Set(visibleTabsForTask(state, ownerTaskId).map((t) => t.id));
  const tabs = state.tabs.filter((t) => !scopeIds.has(t.id));
  return tabs.length === 0 ? null : { tabs, activeTabId: "" };
}

/** 原 fae：规范化 —— 补全辅助对话 ordinal + 修复失效 activeTabId（treemapping 豁免） */
export function normalizeSidePaneState(state: SidePaneState | null): SidePaneState | null {
  if (!state) return null;
  const tabs = state.tabs.filter((t) => t.type !== "treemapping");
  if (tabs.length === 0) return null;
  let changed = false;
  const normalized = tabs.map((tab, index, all) => {
    if (tab.type !== "selection-side-chat" || Number.isInteger(tab.ordinal)) return tab;
    const used = new Set(
      all.flatMap((other) => (other.type === "selection-side-chat" && other.workspaceKey === tab.workspaceKey && other.parentSessionId === tab.parentSessionId && Number.isInteger(other.ordinal) ? [other.ordinal] : [])),
    );
    let ordinal = 1;
    while (used.has(ordinal)) ordinal += 1;
    changed = true;
    const fixed = { ...tab, ordinal };
    all[index] = fixed;
    return fixed;
  });
  const activeTabId = state.activeTabId === "" || normalized.some((t) => t.id === state.activeTabId) ? state.activeTabId : normalized[normalized.length - 1].id;
  return !changed && normalized.length === state.tabs.length && activeTabId === state.activeTabId ? state : { tabs: normalized, activeTabId };
}

/** 原 uae：面板保持挂载条件 —— 可见，或存在 browser/browser-use 标签（需后台驻留） */
export function shouldKeepPanelMounted(isVisible: boolean, tabs: SidePaneTab[]): boolean {
  return isVisible || tabs.some((t) => t.type === "browser" || t.type === "browser-use");
}

/** 原 dae：browser 标签是否驻留（非挂起态才渲染真实视图） */
export function isBrowserTabResident(tab: BrowserTab | BrowserUseTab): boolean {
  return tab.residency !== "suspended" && tab.residency !== "suspend-pending";
}

/** 原 zoe：终端标签名去重 —— Terminal / Terminal 2 / Terminal 3…（取目录名） */
export function nextTerminalTabTitle(state: SidePaneState | null, workspacePath: string): string {
  const base = workspacePath.split(/[\\/]+/).filter(Boolean).pop() || "Terminal";
  const used = new Set(state?.tabs.filter((t) => t.type === "terminal").map((t) => (t as TerminalTab).title.trim()).filter(Boolean) ?? []);
  if (!used.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base} ${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

/* ============================================================================
 * 4. 工作区级缓存 + 轨迹请求 store（原 2577–2637 / jsx 1668–1718）
 * ==========================================================================*/

interface SidePaneSnapshot {
  sidePaneState: SidePaneState | null;
  isSidePaneCollapsed: boolean;
  activeGitSourceId: string;
  browserUrls: Record<string, string>;
  browserUrl: string | null;
}

/** 原 as：缺省快照 */
const DEFAULT_SIDE_PANE_SNAPSHOT: SidePaneSnapshot = {
  sidePaneState: null,
  isSidePaneCollapsed: true,
  activeGitSourceId: "unstaged",
  browserUrls: {},
  browserUrl: null,
};

/** 原 os：按工作区 key 的内存缓存（LRU，上限 50） */
const sidePaneCacheByWorkspaceKey = new Map<string, SidePaneSnapshot>();

function touchCache(key: string, snapshot: SidePaneSnapshot): SidePaneSnapshot {
  sidePaneCacheByWorkspaceKey.delete(key);
  sidePaneCacheByWorkspaceKey.set(key, snapshot);
  return snapshot;
}

function evictCaches(): void {
  while (sidePaneCacheByWorkspaceKey.size > 50) {
    const oldest = sidePaneCacheByWorkspaceKey.keys().next().value;
    if (!oldest) return;
    sidePaneCacheByWorkspaceKey.delete(oldest);
  }
}

/** 原 moe：缓存 key = workspaceIdentity?.trim() || workspacePath（空 → null） */
function resolveSidePaneCacheKey(opts: { workspacePath: string; workspaceIdentity?: string | null; taskId?: string | null }): string | null {
  const key = opts.workspaceIdentity?.trim() || opts.workspacePath;
  return key.trim() ? key : null;
}

/** 原 ss：读缓存（顺带规范化状态） */
function readSidePaneCache(key: string | null): SidePaneSnapshot {
  if (!key) return DEFAULT_SIDE_PANE_SNAPSHOT;
  const cached = sidePaneCacheByWorkspaceKey.get(key);
  return cached ? touchCache(key, { ...cached, sidePaneState: normalizeSidePaneState(cached.sidePaneState) }) : DEFAULT_SIDE_PANE_SNAPSHOT;
}

/** 原 cs：写缓存 */
function writeSidePaneCache(key: string | null, patch: Partial<SidePaneSnapshot>): void {
  if (!key) return;
  const snapshot: SidePaneSnapshot = { ...DEFAULT_SIDE_PANE_SNAPSHOT, ...sidePaneCacheByWorkspaceKey.get(key), ...patch };
  snapshot.sidePaneState = normalizeSidePaneState(snapshot.sidePaneState);
  touchCache(key, snapshot);
  evictCaches();
}

/** 原 ls：模型轨迹打开请求 store（zustand；跨组件单次投递） */
interface TrajectoryOpenRequest {
  workspaceKey: string;
  taskId: string;
  title?: string | null;
  requestId: string;
}
declare const useTrajectoryViewerStore: {
  getState(): { pendingRequest: TrajectoryOpenRequest | null; consumeRequest(requestId: string): void };
  subscribe(cb: (state: { pendingRequest: TrajectoryOpenRequest | null }) => void): () => void;
};

/** 原 goe：订阅本工作区的轨迹打开请求（命中即消费） */
export function useTrajectoryOpenRequests(workspaceKey: string | null, onOpen: (req: { taskId: string; title?: string | null }) => void): void {
  React.useEffect(() => {
    const deliver = (request: TrajectoryOpenRequest | null) => {
      if (!request || request.workspaceKey !== workspaceKey) return;
      onOpen({ taskId: request.taskId, title: request.title });
      useTrajectoryViewerStore.getState().consumeRequest(request.requestId);
    };
    deliver(useTrajectoryViewerStore.getState().pendingRequest);
    return useTrajectoryViewerStore.subscribe((state) => {
      deliver(state.pendingRequest);
    });
  }, [onOpen, workspaceKey]);
}

/* ============================================================================
 * 5. useSidePaneState（原 Boe，js 2816–3549 / jsx 1919–2615）
 * ----------------------------------------------------------------------------
 * 侧面板状态机总钩子。职责：
 *  - 状态持有：sidePaneState / isSidePaneCollapsed / 最近关闭标签(≤8) /
 *    底部终端开关 / 侧栏可见 / 浏览器导航请求；
 *  - 工作区切换时把当前状态写回内存缓存、读入新工作区状态（LRU 50）；
 *  - 任务切换时按 工作区×任务 作用域同步激活标签与收起态（含每任务
 *    “最近打开的子智能体标签”记忆 preferredTabId）；
 *  - 30+ handle*：打开/切换/关闭 各型标签、重排、重开、浏览器驻留事件接线；
 *  - 平台事件接线：onBrowserViewReady/Operation/Visibility/CloseTab/Suspend/
 *    Restore、onOpenBrowserUrl（webview 新窗口 → 右侧浏览器标签）；
 *  - 父任务结束时清理其辅助对话（关闭 runtime + 移除标签）。
 * ==========================================================================*/

/** browser-use 操作呼吸指示 TTL（原 lae，js 1977） */
const BROWSER_USE_OPERATION_TTL_MS = 5000;
/** 最近关闭标签上限（原 Roe，js 2801） */
const RECENT_CLOSED_TABS_LIMIT = 8;

export interface UseSidePaneStateArgs {
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  activeTaskId: string | null;
  /** 侧面板属主（通常 = activeTaskId ?? draftSessionId） */
  sidePaneOwnerId: string | null;
  isDesktop: boolean;
  isWorkspaceVisible?: boolean;
  supportsEmbeddedBrowser?: boolean;
  defaultWhiteboardNamePrefix?: string;
  platform?: PlatformService;
}

export function useSidePaneState({
  workspaceAbsPath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  activeTaskId,
  sidePaneOwnerId,
  isDesktop,
  isWorkspaceVisible = true,
  supportsEmbeddedBrowser,
  defaultWhiteboardNamePrefix,
  platform,
}: UseSidePaneStateArgs) {
  // 原 d = supportsEmbeddedBrowser ?? !!isDesktop
  const embeddedBrowserSupported = supportsEmbeddedBrowser ?? !!isDesktop;
  const workspaceKey = workspaceIdentity?.trim() || workspaceAbsPath;
  const { zcodeSessionService } = useServices();

  const cacheKey = React.useMemo(
    () => resolveSidePaneCacheKey({ workspacePath: workspaceAbsPath, workspaceIdentity, taskId: activeTaskId }),
    [activeTaskId, workspaceAbsPath, workspaceIdentity],
  );
  const cached = readSidePaneCache(cacheKey);

  const [isTerminalOpen, setIsTerminalOpen] = React.useState(false);
  const [sidePaneState, setSidePaneState] = React.useState<SidePaneState | null>(cached.sidePaneState);
  const [isSidePaneCollapsed, setIsSidePaneCollapsed] = React.useState(cached.isSidePaneCollapsed);
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true);
  const [browserNavigationRequest, setBrowserNavigationRequest] = React.useState<BrowserNavigationRequest | null>(null);
  const [recentClosedTabs, setRecentClosedTabs] = React.useState<RecentClosedSidePaneTab[]>([]);

  // 每根会话“最近打开的子智能体标签”记忆（关闭补位时优先回到它）
  const preferredTabByRootSession = React.useRef(new Map<string, string>());
  const ownerIdRef = React.useRef(sidePaneOwnerId);
  ownerIdRef.current = sidePaneOwnerId;
  const workspaceKeyRef = React.useRef(workspaceKey);
  workspaceKeyRef.current = workspaceKey;
  // 每任务最近激活标签（任务切回时恢复）
  const preferredTabByTask = React.useRef(new Map<string, string>());
  const cacheKeyRef = React.useRef(cacheKey);
  const latest = React.useRef({ sidePaneState, isSidePaneCollapsed });
  latest.current = { sidePaneState, isSidePaneCollapsed };

  /** 原 P：同步更新 + 返回新状态 */
  const updateState = React.useCallback((mutate: (state: SidePaneState | null) => SidePaneState | null): SidePaneState | null => {
    const next = mutate(latest.current.sidePaneState);
    latest.current = { ...latest.current, sidePaneState: next };
    setSidePaneState(next);
    return next;
  }, []);

  /** 原 F：更新并补打属主戳（含远程会话 id） */
  const updateStamped = React.useCallback(
    (mutate: (state: SidePaneState | null) => SidePaneState | null) => {
      updateState((state) =>
        stampTabOwnership(mutate(state), { ownerTaskId: ownerIdRef.current, workspaceKey: workspaceKeyRef.current, remoteSessionId: workspaceRemoteSessionId ?? null }),
      );
    },
    [updateState, workspaceRemoteSessionId],
  );

  // 原 2866–2878：工作区切换 —— 旧状态写缓存、新状态读入
  React.useEffect(() => {
    const previousKey = cacheKeyRef.current;
    if (previousKey === cacheKey) return;
    writeSidePaneCache(previousKey, latest.current);
    const snapshot = readSidePaneCache(cacheKey);
    cacheKeyRef.current = cacheKey;
    updateState(() => snapshot.sidePaneState);
    setIsSidePaneCollapsed(snapshot.isSidePaneCollapsed);
  }, [updateState, cacheKey]);
  React.useEffect(
    () => () => {
      writeSidePaneCache(cacheKeyRef.current, latest.current);
    },
    [],
  );

  /** 原 I：状态里是否有本作用域可见标签 */
  const hasVisibleTabs = React.useCallback(
    (state: SidePaneState | null) => !!(state && visibleTabsForOwner(state.tabs, { workspaceKey, ownerTaskId: sidePaneOwnerId }).length),
    [workspaceKey, sidePaneOwnerId],
  );

  /** 原 L：按可见标签数决定收起/展开 */
  const collapseIfEmpty = React.useCallback(
    (state: SidePaneState | null) => {
      if (hasVisibleTabs(state)) {
        setIsSidePaneCollapsed(false);
        return;
      }
      setIsSidePaneCollapsed(true);
    },
    [hasVisibleTabs],
  );

  // 原 2893–2911：任务/属主切换时同步作用域（含日志 [App] 同步对话右侧面板 scope）
  React.useEffect(() => {
    updateState((state) => {
      const scopeSlotKey = `${workspaceKey}::${sidePaneOwnerId ?? "__draft__"}`;
      const preferred = preferredTabByTask.current.get(scopeSlotKey) ?? (activeTaskId ? preferredTabByTask.current.get(activeTaskId) : undefined);
      const synced = syncScopeState(state, { workspaceKey, ownerTaskId: sidePaneOwnerId }, preferred ?? null);
      setIsSidePaneCollapsed(synced.isSidePaneCollapsed);
      logger.debug("[App] 同步对话右侧面板 scope", {
        activeTabId: synced.sidePaneState?.activeTabId ?? null,
        activeTaskId,
        isSidePaneCollapsed: synced.isSidePaneCollapsed,
        ownerTaskId: sidePaneOwnerId,
        preferredTabId: preferred ?? null,
        workspaceKey,
      });
      return synced.sidePaneState;
    });
  }, [activeTaskId, workspaceKey, updateState, sidePaneOwnerId]);

  /* --- 打开类句柄 --- */

  /** 原 R：打开代码查看（展开面板） */
  const handleOpenCodeViewer = React.useCallback(
    (source: CodeViewerSource) => {
      setIsSidePaneCollapsed(false);
      updateStamped((state) => {
        const next = openCodeViewerTab(state, source, ownerIdRef.current);
        const active = findActiveTab(next);
        const path = active?.type === "code-viewer" ? ((active as CodeViewerTab).source.path ?? "none") : "none";
        logger.info(`[App] 切换右侧面板 mode=code-viewer workspace=${workspaceAbsPath} title=${source.title} path=${path} tabs=${next.tabs.length}`);
        return next;
      });
    },
    [updateStamped, workspaceAbsPath],
  );

  /** 原 z：打开 URL —— 不支持内嵌浏览器时 window.open 外链 */
  const handleOpenBrowserUrl = React.useCallback(
    (url: string) => {
      if (!embeddedBrowserSupported) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      const tabId = `browser:${uid()}`;
      setBrowserNavigationRequest({ id: uid(), targetTabId: tabId, url });
      setIsSidePaneCollapsed(false);
      logger.info(`[App] 切换右侧面板 mode=browser workspace=${workspaceAbsPath} url=${url}`);
      updateStamped((state) => openNewBrowserTab(state, { tabId, initialUrl: url }));
    },
    [updateStamped, embeddedBrowserSupported, workspaceAbsPath],
  );

  /** 原 B：切换浏览器（激活则关，否则开/聚焦） */
  const handleToggleBrowser = React.useCallback(() => {
    if (!embeddedBrowserSupported) {
      logger.info(`[App] 当前壳层不支持内嵌浏览器，忽略切换请求 workspace=${workspaceAbsPath}`);
      return;
    }
    updateStamped((state) => {
      const next = toggleBrowserTab(state, ownerIdRef.current);
      collapseIfEmpty(next);
      const active = findActiveTab(next);
      logger.info(`[App] 切换右侧面板 mode=${active?.type ?? "none"} workspace=${workspaceAbsPath} tabs=${next?.tabs.length ?? 0}`);
      return next;
    });
  }, [updateStamped, embeddedBrowserSupported, collapseIfEmpty, workspaceAbsPath]);

  /** 原 V：新建浏览器标签 */
  const handleOpenBrowserTab = React.useCallback(() => {
    if (!embeddedBrowserSupported) {
      logger.info(`[App] 当前壳层不支持内嵌浏览器，忽略新建请求 workspace=${workspaceAbsPath}`);
      return;
    }
    setIsSidePaneCollapsed(false);
    updateStamped((state) => {
      const next = openNewBrowserTab(state);
      const active = findActiveTab(next);
      logger.info(`[App] 新建右侧浏览器 tab=${active?.id ?? "none"} workspace=${workspaceAbsPath} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, embeddedBrowserSupported, workspaceAbsPath]);

  // 原 2976–2986：webview 请求打开外链 → 右侧浏览器标签
  React.useEffect(() => {
    if (!embeddedBrowserSupported || !isDesktop || !isWorkspaceVisible || !platform?.onOpenBrowserUrl) return;
    return platform.onOpenBrowserUrl((event) => {
      logger.info(`[App] webview 请求打开右侧浏览器 tab workspace=${workspaceAbsPath} url=${event.url} disposition=${event.disposition}`);
      handleOpenBrowserUrl(event.url);
    });
  }, [handleOpenBrowserUrl, isDesktop, isWorkspaceVisible, platform, embeddedBrowserSupported, workspaceAbsPath]);

  /** 原 H：browser-use 就绪（属当前任务则展开激活，否则后台挂载） */
  const handleBrowserViewReady = React.useCallback(
    (descriptor: BrowserUseTabDescriptor) => {
      if (!isDesktop) return;
      const scope = { workspaceKey: workspaceKeyRef.current, remoteSessionId: workspaceRemoteSessionId ?? null, ownerTaskId: ownerIdRef.current };
      const result = revealBrowserUseTab(latest.current.sidePaneState, descriptor, scope);
      updateState(() => result.state);
      if (result.shouldReveal) setIsSidePaneCollapsed(false);
      logger.info(`[App] ${result.shouldReveal ? "展开并激活" : "后台挂载"} browser-use tab workspace=${descriptor.workspaceKey} sessionId=${descriptor.sessionId} tabId=${descriptor.tabId}`);
    },
    [updateState, isDesktop, workspaceRemoteSessionId],
  );

  React.useEffect(() => {
    if (!isDesktop || !isWorkspaceVisible || !platform?.onBrowserViewReady) return;
    return platform.onBrowserViewReady(handleBrowserViewReady);
  }, [handleBrowserViewReady, isDesktop, isWorkspaceVisible, platform]);

  // 原 3000–3016：browser-use 操作中 → 呼吸指示（TTL 5s）
  React.useEffect(() => {
    if (!isDesktop || !isWorkspaceVisible || !platform?.onBrowserViewOperation) return;
    return platform.onBrowserViewOperation((event) => {
      const operationUntil = Date.now() + BROWSER_USE_OPERATION_TTL_MS;
      updateState((state) => markBrowserUseOperation(state, { ...event, operationUntil }));
      logger.debug("[App] browser-use operation", {
        operationUntil,
        sessionId: event.sessionId,
        tabId: event.tabId,
        workspaceKey: event.workspaceKey,
      });
    });
  }, [updateState, isDesktop, isWorkspaceVisible, platform]);

  // 原 3017–3049：browser-use 可见性 → 激活/收起 + 每会话 preferredTab 记忆
  React.useEffect(() => {
    if (!isDesktop || !isWorkspaceVisible || !platform?.onBrowserViewVisibility) return;
    return platform.onBrowserViewVisibility((event) => {
      if (event.visible && event.tabId) {
        const result = syncBrowserUseVisibility(latest.current.sidePaneState, { ...event, tabId: event.tabId }, {
          workspaceKey: workspaceKeyRef.current,
          remoteSessionId: workspaceRemoteSessionId ?? null,
          ownerTaskId: ownerIdRef.current,
        });
        if (result.didMatch) {
          preferredTabByTask.current.set(`${event.workspaceKey}::${event.sessionId}`, `browser-use:${event.tabId}`);
        } else {
          logger.debug("[App] 忽略无现存 shell 的 browser-use visibility", {
            sessionId: event.sessionId,
            tabId: event.tabId,
            workspaceKey: event.workspaceKey,
          });
        }
        updateState(() => result.state);
        if (result.shouldReveal) setIsSidePaneCollapsed(false);
        return;
      }
      const active = findActiveTab(latest.current.sidePaneState);
      if (
        active?.type === "browser-use" &&
        active.workspaceKey === event.workspaceKey &&
        (active.remoteSessionId ?? "") === (event.remoteSessionId ?? "") &&
        (active as BrowserUseTab).sessionId === event.sessionId &&
        (active as BrowserUseTab).browserId === event.browserId &&
        (active as BrowserUseTab).browserGeneration === event.browserGeneration &&
        (event.tabId === undefined || (active as BrowserUseTab).tabId === event.tabId)
      ) {
        setIsSidePaneCollapsed(true);
      }
    });
  }, [updateState, isDesktop, isWorkspaceVisible, platform, workspaceRemoteSessionId]);

  // 原 3044–3058：主进程关闭 browser tab → 同步移除
  React.useEffect(() => {
    if (!isDesktop || !platform?.onBrowserViewCloseTab) return;
    return platform.onBrowserViewCloseTab((event) => {
      let closed = false;
      const next = updateState((state) => {
        const tab = state?.tabs.find((t) => (t.type === "browser-use" && (t as BrowserUseTab).tabId === event.tabId) || (t.type === "browser" && t.id === event.tabId));
        return tab ? ((closed = true), closeTabAndRepair(state, tab.id, ownerIdRef.current)) : state;
      });
      if (closed) collapseIfEmpty(next);
    });
  }, [updateState, isDesktop, platform, collapseIfEmpty]);

  // 原 3059–3078：驻留状态变更（挂起/恢复）
  React.useEffect(() => {
    if (!isDesktop || !platform?.onBrowserViewSuspend) return;
    return platform.onBrowserViewSuspend((event) => {
      updateState((state) =>
        state?.tabs.find(
          (t) =>
            ((t.type === "browser-use" && (t as BrowserUseTab).tabId === event.tabId) || (t.type === "browser" && t.id === event.tabId)) &&
            t.workspaceKey === event.workspaceKey &&
            (t.remoteSessionId ?? "") === (event.remoteSessionId ?? "") &&
            (t.type === "browser-use" ? (t as BrowserUseTab).sessionId === event.sessionId : (t.ownerTaskId ?? "unscoped") === event.sessionId),
        )
          ? applyBrowserResidencyChange(state, event)
          : state,
      );
    });
  }, [updateState, isDesktop, platform]);
  React.useEffect(() => {
    if (!isDesktop || !platform?.onBrowserViewRestore) return;
    return platform.onBrowserViewRestore((event) => {
      updateState((state) => applyBrowserResidencyChange(state, event));
    });
  }, [updateState, isDesktop, platform]);

  /** 原 ee：切换审查（git 标签开/关） */
  const handleToggleGit = React.useCallback(() => {
    updateStamped((state) => {
      const next = toggleGitTab(state);
      collapseIfEmpty(next);
      const active = findActiveTab(next);
      logger.info(`[App] 切换右侧面板 mode=${active?.type ?? "none"} workspace=${workspaceAbsPath} tabs=${next?.tabs.length ?? 0}`);
      return next;
    });
  }, [updateStamped, collapseIfEmpty, workspaceAbsPath]);

  /** 原 U：打开审查（只开不关） */
  const handleOpenGit = React.useCallback(() => {
    updateStamped((state) => {
      const next = openGitTab(state);
      setIsSidePaneCollapsed(false);
      logger.info(`[App] 打开右侧面板 mode=git workspace=${workspaceAbsPath} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, workspaceAbsPath]);

  /** 原 te：treemapping 入口（已隐藏，仅日志） */
  const handleOpenTreemapping = React.useCallback(
    (source?: { kind?: string }) => {
      logger.debug(`[App] 已隐藏 treemapping 侧边栏入口 workspace=${workspaceAbsPath} source=${source?.kind ?? "current"}`);
    },
    [workspaceAbsPath],
  );

  /** 原 ne：新建白板并打开 */
  const handleOpenWhiteboard = React.useCallback(() => {
    const board = useWhiteboardStore.getState().createBoard({
      defaultNamePrefix: defaultWhiteboardNamePrefix,
      workspaceIdentity,
      workspacePath: workspaceAbsPath,
    });
    setIsSidePaneCollapsed(false);
    updateStamped((state) => {
      const next = openWhiteboardTab(state, { boardId: board.id, title: board.name });
      logger.info(`[App] 打开右侧面板 mode=whiteboard workspace=${workspaceAbsPath} board=${board.id} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, defaultWhiteboardNamePrefix, workspaceAbsPath, workspaceIdentity]);

  /** 原 re：打开仓库 Wiki */
  const handleOpenRepoWiki = React.useCallback(() => {
    setIsSidePaneCollapsed(false);
    updateStamped((state) => {
      const next = openRepoWikiTab(state);
      logger.info(`[App] 打开右侧面板 mode=repo-wiki workspace=${workspaceAbsPath} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, workspaceAbsPath]);

  /** 原 ie：打开开发者工具 */
  const handleOpenDeveloperTools = React.useCallback(() => {
    setIsSidePaneCollapsed(false);
    updateStamped((state) => {
      const next = openDeveloperToolsTab(state);
      logger.info(`[App] 打开右侧面板 mode=developer-tools workspace=${workspaceAbsPath} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, workspaceAbsPath]);

  /** 原 ae：新建终端标签（标题去重） */
  const handleOpenTerminalTab = React.useCallback(() => {
    setIsSidePaneCollapsed(false);
    updateStamped((state) => {
      const title = nextTerminalTabTitle(state, workspaceAbsPath);
      const next = openTerminalTabState(state, { title, cwd: workspaceAbsPath, remoteSessionId: workspaceRemoteSessionId });
      logger.info(`[App] 新建右侧终端 tab=${title} workspace=${workspaceAbsPath} tabs=${next.tabs.length}`);
      return next;
    });
  }, [updateStamped, workspaceAbsPath, workspaceRemoteSessionId]);

  /** 原 oe：打开模型轨迹（消费 ls store 的请求） */
  const handleOpenModelTrajectory = React.useCallback(
    (req: { taskId: string; title?: string | null }) => {
      if (!req.taskId) return;
      setIsSidePaneCollapsed(false);
      updateStamped((state) => {
        const next = openModelTrajectoryTab(state, req);
        logger.info(`[App] 打开右侧面板 mode=model-trajectory workspace=${workspaceAbsPath} taskId=${req.taskId} tabs=${next.tabs.length}`);
        return next;
      });
    },
    [updateStamped, workspaceAbsPath],
  );

  /** 原 se：打开子智能体会话标签（记忆每根会话的最近标签） */
  const handleOpenSubagentSession = React.useCallback(
    (req: SubagentOpenRequest) => {
      const workspaceKeyValue = req.workspaceIdentity?.trim() || req.workspacePath;
      const rootSessionId = req.rootSessionId ?? req.parentSessionId;
      setIsSidePaneCollapsed(false);
      updateStamped((state) => {
        const next = openSubagentSessionTab(state, {
          workspaceKey: workspaceKeyValue,
          workspacePath: req.workspacePath,
          ...(req.workspaceIdentity ? { workspaceIdentity: req.workspaceIdentity } : {}),
          ...(req.remoteSessionId ? { remoteSessionId: req.remoteSessionId } : {}),
          rootSessionId,
          parentSessionId: req.parentSessionId,
          childSessionId: req.childSessionId,
          subagentType: req.subagentType,
          title: req.title,
        });
        preferredTabByRootSession.current.set(rootSessionId, next.activeTabId);
        logger.debug(`[App] 打开子智能体右侧 tab parent=${req.parentSessionId} child=${req.childSessionId} workspace=${workspaceKeyValue}`);
        return next;
      });
    },
    [updateStamped],
  );

  /** 原 ce：打开子智能体目录标签 */
  const handleOpenSubagentDirectory = React.useCallback(
    (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => {
      const workspaceKeyValue = req.workspaceIdentity?.trim() || req.workspacePath;
      const rootSessionId = req.rootSessionId ?? req.parentSessionId;
      setIsSidePaneCollapsed(false);
      updateStamped((state) => {
        const next = openSubagentDirectoryTab(state, {
          workspaceKey: workspaceKeyValue,
          workspacePath: req.workspacePath,
          ...(req.workspaceIdentity ? { workspaceIdentity: req.workspaceIdentity } : {}),
          ...(req.remoteSessionId ? { remoteSessionId: req.remoteSessionId } : {}),
          rootSessionId,
          parentSessionId: req.parentSessionId,
        });
        preferredTabByRootSession.current.set(rootSessionId, next.activeTabId);
        return next;
      });
    },
    [updateStamped],
  );

  /** 原 le：子智能体会话同步（清理失效会话标签） */
  const handleSyncSubagentSessionTabs = React.useCallback(
    (req: { rootSessionId: string; parentSessionId: string; validChildSessionIds: string[] }) => {
      updateState((state) => syncSubagentSessionTabs(state, req));
    },
    [updateState],
  );

  /** 原 ue：打开辅助对话（可替换既有子会话） */
  const handleOpenSelectionSideChat = React.useCallback(
    (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; childSessionId: string; replacesChildSessionId?: string }) => {
      const workspaceKeyValue = req.workspaceIdentity?.trim() || req.workspacePath;
      setIsSidePaneCollapsed(false);
      updateStamped((state) => {
        const replaced = req.replacesChildSessionId
          ? state?.tabs.find(
              (t) =>
                t.type === "selection-side-chat" &&
                t.workspaceKey === workspaceKeyValue &&
                (t as SelectionSideChatTab).parentSessionId === req.parentSessionId &&
                (t as SelectionSideChatTab).childSessionId === req.replacesChildSessionId,
            )
          : undefined;
        return openSelectionSideChatTab(replaced ? closeTabById(state, replaced.id) : state, { ...req, workspaceKey: workspaceKeyValue });
      });
      logger.debug("[App] 打开框选副屏会话", {
        childSessionId: req.childSessionId,
        parentSessionId: req.parentSessionId,
        workspaceKey: workspaceAbsPath,
      });
    },
    [updateStamped, workspaceAbsPath],
  );

  /** 原 de：打开计划详情标签 */
  const handleOpenPlanDetail = React.useCallback(
    (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; parentSessionId: string; toolCallId: string; markdown?: string; planFilePath?: string }) => {
      const workspaceKeyValue = req.workspaceIdentity?.trim() || req.workspacePath;
      setIsSidePaneCollapsed(false);
      updateStamped((state) => openPlanDetailTab(state, { ...req, workspaceKey: workspaceKeyValue }));
      logger.debug("[App] 打开计划详情右侧 tab", {
        parentSessionId: req.parentSessionId,
        toolCallId: req.toolCallId,
        workspaceKey: workspaceAbsPath,
      });
    },
    [updateStamped, workspaceAbsPath],
  );

  /** 原 fe：关闭辅助对话 runtime（sessionNotFound 静默） */
  const closeSelectionSideChatRuntime = React.useCallback(
    (tab: SelectionSideChatTab) => {
      // 原实现还清理会话选择缓存（yoe/Ts，横切层），此处保留主流程
      zcodeSessionService
        .closeSession({
          workspacePath: tab.workspacePath,
          ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
          sessionId: tab.childSessionId,
        })
        .catch((error) => {
          if (!String(error).includes("sessionNotFound")) {
            logger.warn("[App] 关闭框选副屏 runtime 失败", {
              childSessionId: tab.childSessionId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        });
    },
    [zcodeSessionService],
  );

  // 原 3287–3311：父任务结束 → 清理其全部辅助对话（关 runtime + 移除标签）
  React.useEffect(() => {
    const key = workspaceIdentity?.trim() || workspaceAbsPath;
    return subscribeTaskEnded((event) => {
      if (event.workspaceKey !== key) return;
      const chats =
        latest.current.sidePaneState?.tabs.filter((t) => t.type === "selection-side-chat" && (t as SelectionSideChatTab).parentSessionId === event.taskId) as SelectionSideChatTab[] | undefined ?? [];
      if (chats.length === 0) return;
      for (const chat of chats) closeSelectionSideChatRuntime(chat);
      const chatIds = new Set(chats.map((t) => t.id));
      updateState((state) => {
        if (!state) return state;
        let next: SidePaneState | null = state;
        for (const id of chatIds) next = closeTabAndRepair(next, id, activeTaskId);
        collapseIfEmpty(next);
        return next;
      });
      logger.info("[App] 父任务结束，清理框选副屏会话", {
        event: event.type,
        parentSessionId: event.taskId,
        workspaceKey: key,
      });
    });
  }, [activeTaskId, closeSelectionSideChatRuntime, updateState, collapseIfEmpty, workspaceAbsPath, workspaceIdentity]);

  // 原 3312：轨迹打开请求接线
  useTrajectoryOpenRequests(workspaceIdentity?.trim() || workspaceAbsPath, handleOpenModelTrajectory);

  /* --- 面板级句柄 --- */

  /** 原 W：底部终端面板开关（与侧面板标签独立） */
  const handleToggleTerminal = React.useCallback(() => {
    setIsTerminalOpen((open) => {
      const next = !open;
      logger.info("[App] 切换底部终端面板", { open: next, workspace: workspaceAbsPath });
      return next;
    });
  }, [workspaceAbsPath]);

  /* D5c：「在 TUI 中编辑此任务」——只读 peek 打开请求（不消费），负责把底部终端 dock 打开；
   * 新建 exec nofy 的终端页由 TerminalDockPanel 消费同一请求（见 TerminalPane.tsx）。 */
  const tuiEditPendingRequest = useTuiEditPendingRequest(workspaceKey);
  React.useEffect(() => {
    if (!tuiEditPendingRequest) return;
    logger.info("[App] TUI 编辑请求：打开底部终端面板", {
      workspace: workspaceAbsPath,
      sessionId: tuiEditPendingRequest.sessionId,
    });
    setIsTerminalOpen(true);
  }, [tuiEditPendingRequest, workspaceAbsPath]);

  /** 原 pe：侧栏可见性开关 */
  const handleToggleSidebar = React.useCallback(() => {
    setIsSidebarVisible((visible) => !visible);
  }, []);

  /** 原 me：侧面板收起/展开（⊞ 快捷键 Ctrl+Alt+B 的落点） */
  const handleToggleSidePaneCollapse = React.useCallback(() => {
    setIsSidePaneCollapsed((collapsed) => {
      const next = !collapsed;
      logger.info(`[App] ${next ? "收起" : "展开"}右侧面板 workspace=${workspaceAbsPath} tabs=${sidePaneState?.tabs.length ?? 0}`);
      return next;
    });
  }, [sidePaneState, workspaceAbsPath]);

  /** 原 he：关闭代码查看（仅当激活） */
  const handleCloseCodeViewer = React.useCallback(() => {
    logger.info(`[App] 关闭右侧面板 mode=code-viewer workspace=${workspaceAbsPath}`);
    updateState((state) => {
      const next = closeActiveCodeViewer(state);
      collapseIfEmpty(next);
      return next;
    });
  }, [updateState, collapseIfEmpty, workspaceAbsPath]);

  /** 原 ge：关闭审查 */
  const handleCloseGit = React.useCallback(() => {
    logger.info(`[App] 关闭右侧面板 mode=git workspace=${workspaceAbsPath}`);
    updateState((state) => {
      const next = closeGitTab(state);
      collapseIfEmpty(next);
      return next;
    });
  }, [updateState, collapseIfEmpty, workspaceAbsPath]);

  /** 原 _e：激活标签（suspended 浏览器先请求驻留；子智能体标签记忆） */
  const handleActivateSidePaneTab = React.useCallback(
    (tabId: string) => {
      const current = latest.current.sidePaneState?.tabs.find((t) => t.id === tabId);
      if ((current?.type === "browser" || current?.type === "browser-use") && (current as BrowserTab).residency === "suspended") {
        const targetTabId = current.type === "browser-use" ? (current as BrowserUseTab).tabId : current.id;
        platform
          ?.browserViewEnsureResident?.({
            tabId: targetTabId,
            workspaceKey: current.workspaceKey ?? workspaceKeyRef.current,
            ...(current.remoteSessionId ? { remoteSessionId: current.remoteSessionId } : {}),
            sessionId: current.type === "browser-use" ? (current as BrowserUseTab).sessionId : (current.ownerTaskId ?? "unscoped"),
          })
          .catch((error) => {
            logger.warn("[App] 激活 suspended Browser tab 失败", {
              error: error instanceof Error ? error.message : String(error),
              tabId: targetTabId,
            });
          });
      }
      updateState((state) => {
        const tab = state?.tabs.find((t) => t.id === tabId);
        if ((tab?.type === "subagent-session" || tab?.type === "subagent-directory") && tab) {
          preferredTabByRootSession.current.set((tab as SubagentSessionTab | SubagentDirectoryTab).rootSessionId, tab.id);
        }
        return activateTab(state, tabId);
      });
    },
    [updateState, platform],
  );

  /** 原 ve：拖拽重排 */
  const handleReorderSidePaneTab = React.useCallback(
    (tabId: string, targetId: string) => {
      updateState((state) => reorderTabs(state, tabId, targetId));
    },
    [updateState],
  );

  /** 原 ye：记入最近关闭（排除辅助对话与 browser-use；上限 8） */
  const rememberClosedTabs = React.useCallback((tabs: SidePaneTab[]) => {
    const memorable = tabs.filter((t) => t.type !== "selection-side-chat" && t.type !== "browser-use");
    if (memorable.length === 0) return;
    const closedAt = Date.now();
    setRecentClosedTabs((existing) => {
      const ids = new Set(memorable.map((t) => t.id));
      return [...memorable.map((tab) => ({ tab, closedAt })), ...existing.filter((entry) => !ids.has(entry.tab.id))].slice(0, RECENT_CLOSED_TABS_LIMIT);
    });
  }, []);

  /** 原 be：关闭前向主进程申请释放浏览器视图（桌面缺 authority 则拒绝） */
  const releaseBrowserTabs = React.useCallback(
    async (tabs: SidePaneTab[]): Promise<boolean> => {
      const browsers = tabs.filter((t) => t.type === "browser" || t.type === "browser-use");
      if (browsers.length === 0) return true;
      if (!platform?.browserViewCloseTab) {
        if (isDesktop) {
          logger.warn("[App] 关闭 Browser tab 时缺少 main authority");
          return false;
        }
        return true;
      }
      try {
        await Promise.all(
          browsers.map((tab) =>
            platform.browserViewCloseTab!({
              tabId: tab.type === "browser-use" ? (tab as BrowserUseTab).tabId : tab.id,
              workspaceKey: tab.workspaceKey ?? workspaceKeyRef.current,
              ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
              sessionId: tab.type === "browser-use" ? (tab as BrowserUseTab).sessionId : (tab.ownerTaskId ?? "unscoped"),
            }),
          ),
        );
        return true;
      } catch {
        return false;
      }
    },
    [isDesktop, platform],
  );

  /** 原 xe：关闭单个标签（辅助对话先关 runtime；浏览器先释放视图） */
  const handleCloseSidePaneTab = React.useCallback(
    (tabId: string) => {
      const tab = sidePaneState?.tabs.find((t) => t.id === tabId);
      if (tab?.type === "selection-side-chat") closeSelectionSideChatRuntime(tab);
      releaseBrowserTabs(tab ? [tab] : []).then((ok) => {
        if (!ok) return;
        if (tab) rememberClosedTabs([tab]);
        const next = updateState((state) => closeTabAndRepair(state, tabId, activeTaskId, activeTaskId ? preferredTabByRootSession.current.get(activeTaskId) : null));
        collapseIfEmpty(next);
        const active = findActiveTab(next);
        logger.info(`[App] 关闭右侧面板 tab=${tabId} mode=${active?.type ?? "none"} workspace=${workspaceAbsPath} tabs=${next?.tabs.length ?? 0}`);
      });
    },
    [activeTaskId, closeSelectionSideChatRuntime, releaseBrowserTabs, updateState, rememberClosedTabs, sidePaneState?.tabs, collapseIfEmpty, workspaceAbsPath],
  );

  /** 原 Se：关闭其他 */
  const handleCloseOtherSidePaneTabs = React.useCallback(
    (keepTabId: string) => {
      const scopeTabs = sidePaneState?.tabs.filter((t) => tabBelongsToTask(t, activeTaskId)) ?? [];
      const toClose = scopeTabs.some((t) => t.id === keepTabId) ? scopeTabs.filter((t) => t.id !== keepTabId) : [];
      releaseBrowserTabs(toClose).then((ok) => {
        if (!ok) return;
        for (const tab of toClose) if (tab.type === "selection-side-chat") closeSelectionSideChatRuntime(tab);
        rememberClosedTabs(toClose);
        updateState((state) => {
          const next = closeOtherTabs(state, keepTabId, activeTaskId);
          logger.info(`[App] 关闭其他右侧面板 tab=${keepTabId} workspace=${workspaceAbsPath} tabs=${next?.tabs.length ?? 0}`);
          return next;
        });
      });
    },
    [activeTaskId, closeSelectionSideChatRuntime, releaseBrowserTabs, updateState, rememberClosedTabs, sidePaneState?.tabs, workspaceAbsPath],
  );

  /** 原 Ce：关闭全部 */
  const handleCloseAllSidePaneTabs = React.useCallback(() => {
    const scopeTabs = sidePaneState?.tabs.filter((t) => tabBelongsToTask(t, activeTaskId)) ?? [];
    releaseBrowserTabs(scopeTabs).then((ok) => {
      if (!ok) return;
      for (const tab of scopeTabs) if (tab.type === "selection-side-chat") closeSelectionSideChatRuntime(tab);
      rememberClosedTabs(scopeTabs);
      updateState((state) => {
        logger.info(`[App] 关闭全部右侧面板 tabs workspace=${workspaceAbsPath}`);
        const next = closeAllTabs(state, activeTaskId);
        collapseIfEmpty(next);
        return next;
      });
    });
  }, [activeTaskId, closeSelectionSideChatRuntime, releaseBrowserTabs, updateState, rememberClosedTabs, sidePaneState?.tabs, collapseIfEmpty, workspaceAbsPath]);

  /** 原 we：重开最近关闭的标签（浏览器换发新 id） */
  const handleReopenClosedSidePaneTab = React.useCallback(
    (tabId: string) => {
      const entry = recentClosedTabs.find((e) => e.tab.id === tabId);
      if (!entry) return;
      setIsSidePaneCollapsed(false);
      updateState((state) => {
        let tab = entry.tab;
        if (entry.tab.type === "browser") {
          const { residency: _residency, residencyGeneration: _generation, ...rest } = entry.tab as BrowserTab;
          tab = { ...rest, id: `browser:${uid()}` };
        }
        const next = reopenTab(state, tab);
        if (tab.type === "subagent-session" || tab.type === "subagent-directory") {
          preferredTabByRootSession.current.set((tab as SubagentSessionTab | SubagentDirectoryTab).rootSessionId, tab.id);
        }
        return next;
      });
      setRecentClosedTabs((existing) => existing.filter((e) => e.tab.id !== tabId));
      logger.info(`[App] 重新打开最近关闭右侧面板 tab=${tabId} workspace=${workspaceAbsPath}`);
    },
    [recentClosedTabs, updateState, workspaceAbsPath],
  );

  /** 原 Te：浏览器导航请求消费回执 */
  const handleBrowserNavigationRequestHandled = React.useCallback((requestId: string) => {
    setBrowserNavigationRequest((request) => (request?.id === requestId ? null : request));
  }, []);

  /** 原 Ee：浏览器页面元数据变更（标题/favicon） */
  const handleBrowserPageMetadataChange = React.useCallback(
    (tabId: string, metadata: BrowserMetadataPatch) => {
      updateState((state) => patchBrowserTabMetadata(state, tabId, metadata));
    },
    [updateState],
  );

  return {
    isTerminalOpen,
    setIsTerminalOpen,
    sidePaneState,
    recentClosedSidePaneTabs: React.useMemo(() => recentClosedTabs.filter((entry) => tabBelongsToTask(entry.tab, activeTaskId)), [activeTaskId, recentClosedTabs]),
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
    handleOpenRepoWiki,
    handleOpenDeveloperTools,
    handleOpenTerminalTab,
    handleOpenModelTrajectory,
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
  };
}

/* ============================================================================
 * 6. 标签栏 UI（原 181256–181854 / jsx 146415–146762）
 * ==========================================================================*/

/** 原 z5：patch 路径是否有效（非空且非 /dev/null） */
function isValidPatchPath(path: string | undefined | null): boolean {
  const trimmed = path?.trim();
  return !!(trimmed && trimmed !== "/dev/null");
}

/** 原 OKt：去掉成对包裹引号 */
function unquotePatchPath(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
}

/** 原 B5：去掉 git diff 的 a/ b/ 前缀 */
function stripDiffSidePrefix(path: string): string {
  const trimmed = unquotePatchPath(path);
  return trimmed.startsWith("a/") || trimmed.startsWith("b/") ? trimmed.slice(2) : trimmed;
}

/** 原 kKt：解析 +++ / --- 行内的单个路径（引号或制表符截断） */
function parsePatchHeaderPath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('"')) {
    const match = trimmed.match(/^"((?:\\.|[^"\\])+)"/);
    return match?.[1] ? stripDiffSidePrefix(match[1]) : null;
  }
  const first = trimmed.split("\t", 1)[0]?.trim();
  return first ? stripDiffSidePrefix(first) : null;
}

/** 原 AKt：解析 `diff --git a/x b/x` 行（优先 b 侧） */
function parseDiffGitLine(line: string): string | null {
  const match = line.match(/^diff --git (?:"((?:\\.|[^"\\])*)"|(\S+)) (?:"((?:\\.|[^"\\])*)"|(\S+))$/);
  const bSide = match?.[3] ?? match?.[4];
  const aSide = match?.[1] ?? match?.[2];
  const bPath = bSide ? stripDiffSidePrefix(bSide) : null;
  if (isValidPatchPath(bPath)) return bPath;
  const aPath = aSide ? stripDiffSidePrefix(aSide) : null;
  return isValidPatchPath(aPath) ? aPath : null;
}

/** 原 jKt：从 patch 全文提取代表文件路径（先 diff --git / +++，后 ---） */
function extractPatchFilePath(patch: string): string | null {
  for (const line of patch.split(/\r?\n/)) {
    const fromGitLine = parseDiffGitLine(line);
    if (fromGitLine) return fromGitLine;
    if (line.startsWith("+++ ")) {
      const path = parsePatchHeaderPath(line.slice(4));
      if (isValidPatchPath(path)) return path;
    }
  }
  for (const line of patch.split(/\r?\n/)) {
    if (!line.startsWith("--- ")) continue;
    const path = parsePatchHeaderPath(line.slice(4));
    if (isValidPatchPath(path)) return path;
  }
  return null;
}

/** 原 MKt：patch source 的代表路径（显式 path → patch 头 → 标题兜底） */
function resolvePatchRepresentativePath(source: { path?: string; patch: string; title: string }): string | null {
  return isValidPatchPath(source.path) ? source.path! : extractPatchFilePath(source.patch) || (isValidPatchPath(source.title) ? source.title : null);
}

/** 原 DKt：标签是否显示 diff 徽章（code-viewer 且为 patch / multi-file-diff） */
export function tabShowsDiffBadge(tab: SidePaneTab): boolean {
  return tab.type === "code-viewer" && (tab.source.type === "patch" || tab.source.type === "multi-file-diff");
}

/** 原 V5：标签标题解析（14 型分派；辅助对话带序号「辅助对话 2」） */
export function resolveSidePaneTabTitle(tab: SidePaneTab, formatMessage: (descriptor: { id: string }) => string): string {
  switch (tab.type) {
    case "plan-detail":
      return formatMessage({ id: "planTool.panel.planTab" });
    case "selection-side-chat":
      return `${formatMessage({ id: "sidePane.selectionChat" })} ${tab.ordinal}`;
    case "subagent-session":
      return tab.title?.trim() || formatMessage({ id: "sidePane.subagent" });
    case "subagent-directory":
      return formatMessage({ id: "sidePane.subagentDirectory" });
    case "browser":
      return tab.title?.trim() || formatMessage({ id: "browser.title" });
    case "git":
      return formatMessage({ id: "sidePane.review" });
    case "treemapping":
      return formatMessage({ id: "treemapping.title" });
    case "whiteboard":
      return tab.title || formatMessage({ id: "whiteboard.title" });
    case "model-trajectory":
      return tab.title?.trim() || formatMessage({ id: "modelTrajectory.title" });
    case "repo-wiki":
      return formatMessage({ id: "repoWiki.title" });
    case "developer-tools":
      return formatMessage({ id: "developerTools.title" });
    case "terminal":
      return tab.title || formatMessage({ id: "terminal.title" });
    case "browser-use":
      return tab.title?.trim() || formatMessage({ id: "browser.title" });
    default:
      return tab.source.title || formatMessage({ id: "codeViewer.title" });
  }
}

/** 原 NKt：总览搜索用的附加关键词（类型语义 + 会话 id + 路径） */
function sidePaneTabSearchHint(tab: SidePaneTab): string {
  switch (tab.type) {
    case "plan-detail":
      return `${tab.parentSessionId} ${tab.toolCallId} plan ExitPlanMode`;
    case "selection-side-chat":
      return `${tab.parentSessionId} ${tab.childSessionId} ${tab.ordinal} selection side chat`;
    case "subagent-session":
      return `${tab.title ?? ""} ${tab.subagentType} ${tab.parentSessionId} ${tab.childSessionId}`;
    case "subagent-directory":
      return `${tab.rootSessionId} ${tab.parentSessionId} subagent directory`;
    case "browser":
      return tab.initialUrl ?? "";
    case "browser-use":
      return `${tab.title ?? ""} ${tab.sessionId} browser use`;
    case "git":
      return "git diff";
    case "treemapping":
      return "file activity diff map treemapping";
    case "whiteboard":
      return `${tab.title} whiteboard canvas draw sketch`;
    case "model-trajectory":
      return `${tab.title ?? ""} ${tab.taskId} model trajectory call io`;
    case "repo-wiki":
      return "workspace repo wiki documentation architecture sources";
    case "developer-tools":
      return "developer tools token debug network status request response headers";
    case "terminal":
      return `${tab.title} terminal shell command`;
    default:
      return tab.source.path ?? tab.source.title;
  }
}

/** 原 L5/gKt/hKt/yKt/vKt/_Kt：总览搜索的规范化/字段/评分/排序 */
const lowerTrim = (value: string): string => value.trim().toLocaleLowerCase();
const normalizeQuery = (query: string): string[] => lowerTrim(query).split(/\s+/).filter(Boolean);
interface TabSearchFields {
  title: string;
  hint: string;
  typeLabel: string;
  all: string;
}
function buildSearchFields(title: string, hint: string, typeLabel: string): TabSearchFields {
  return { title: lowerTrim(title), hint: lowerTrim(hint), typeLabel: lowerTrim(typeLabel), all: lowerTrim(`${title} ${hint} ${typeLabel}`) };
}
function tokenPrefixHit(value: string, token: string): boolean {
  return value.split(/[\s/_.:-]+/).some((part) => part.startsWith(token));
}
function scoreSearchFields(fields: TabSearchFields, tokens: string[]): number {
  // 全部词命中 all 才计分：标题前缀 120 > 词边界前缀 90 > 标题包含 70 > 提示 40 > 类型 20 > 1
  return tokens.every((token) => fields.all.includes(token))
    ? tokens.reduce(
        (score, token) =>
          fields.title.startsWith(token)
            ? score + 120
            : tokenPrefixHit(fields.title, token)
              ? score + 90
              : fields.title.includes(token)
                ? score + 70
                : fields.hint.includes(token)
                  ? score + 40
                  : fields.typeLabel.includes(token)
                    ? score + 20
                    : score + 1,
        0,
      )
    : 0;
}
function filterRanked<T extends { searchFields: TabSearchFields }>(items: T[], tokens: string[]): T[] {
  return tokens.length === 0
    ? items
    : items
        .map((item, index) => ({ item, index, score: scoreSearchFields(item.searchFields, tokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((entry) => entry.item);
}

/** 原 bKt：favicon 图片（加载失败回退 globe 图标） */
const BrowserFaviconImage: React.FC<{ faviconUrl: string }> = ({ faviconUrl }) => {
  const [failed, setFailed] = React.useState(false);
  return failed ? (
    <IconGlobe className="size-3.5" />
  ) : (
    <img src={faviconUrl} alt="" className="size-3.5 rounded-sm object-contain" draggable={false} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  );
};

/** 原 xKt：有 favicon 用图片，否则 globe */
const BrowserTabFavicon: React.FC<{ faviconUrl?: string | null }> = ({ faviconUrl }) =>
  faviconUrl ? <BrowserFaviconImage key={faviconUrl} faviconUrl={faviconUrl} /> : <IconGlobe className="size-3.5" />;

/** 原 JUt（F13 段 js 177345）：browser-use 操作窗口是否仍有效（呼吸指示判定） */
function useBrowserUseOperationActive(until: number = 0): boolean {
  const [knownUntil, setKnownUntil] = React.useState(0);
  const isActive = until > Date.now() && knownUntil !== until;
  React.useEffect(() => {
    if (!isActive) return;
    const timer = window.setTimeout(() => setKnownUntil(until), Math.max(0, until - Date.now()));
    return () => window.clearTimeout(timer);
  }, [isActive, until]);
  return isActive;
}

/** 原 SKt：browser-use 标签图标 —— 操作中显示呼吸的指针图标，否则 favicon */
const BrowserUseTabIndicator: React.FC<{ tab: BrowserUseTab }> = ({ tab }) => {
  const operating = useBrowserUseOperationActive(tab.browserUseOperationUntil);
  return operating ? (
    <span aria-hidden="true" data-browser-use-operation-indicator="active" className="browser-use-operation-breathe inline-flex size-3.5 shrink-0 items-center justify-center">
      <IconMousePointer2 className="size-3.5" />
    </span>
  ) : (
    <BrowserTabFavicon faviconUrl={tab.faviconUrl} />
  );
};

/** 原 R5：14 型标签图标分派（code-viewer 按文件扩展名取文件图标） */
export const SidePaneTabIcon: React.FC<{ tab: SidePaneTab }> = ({ tab }) => {
  switch (tab.type) {
    case "plan-detail":
      return <IconNotepadText className="size-3.5" />;
    case "selection-side-chat":
      return <IconMessageSquareText className="size-3.5" />;
    case "subagent-session":
      return <IconBot className="size-3.5" />;
    case "subagent-directory":
      return <IconListTree className="size-3.5" />;
    case "browser":
      return <BrowserTabFavicon faviconUrl={tab.faviconUrl} />;
    case "git":
      return <IconFileDiff className="size-3.5" />;
    case "treemapping":
      return <IconMap className="size-3.5" />;
    case "whiteboard":
      return <IconPalette className="size-3.5" />;
    case "model-trajectory":
      return <IconWaypoints className="size-3.5" />;
    case "repo-wiki":
      return <RepoWikiIcon className="size-3.5" />;
    case "developer-tools":
      return <IconBug className="size-3.5" />;
    case "terminal":
      return <IconSquareTerminal className="size-3.5" />;
    case "browser-use":
      return <BrowserUseTabIndicator tab={tab} />;
    default: {
      // code-viewer：patch 先解析代表路径；按路径取文件图标，兜底 file-code-corner / file-diff
      if (tab.source.type === "patch") {
        const path = resolvePatchRepresentativePath(tab.source);
        return path ? <FileIconImg src={resolveFileDisplayInfo(path).fileIconSrc} size={14} className="shrink-0" /> : <IconFileDiff className="size-3.5" />;
      }
      if (tab.source.type === "multi-file-diff") {
        return tab.source.path ? <FileIconImg src={resolveFileDisplayInfo(tab.source.path).fileIconSrc} size={14} className="shrink-0" /> : <IconFileDiff className="size-3.5" />;
      }
      return tab.source.path ? <FileIconImg src={resolveFileDisplayInfo(tab.source.path).fileIconSrc} size={14} className="shrink-0" /> : <IconFileCodeCorner className="size-3.5" />;
    }
  }
};

/** chip 悬停 tooltip 延迟（原 CKt） */
const TAB_TOOLTIP_DELAY_MS = 1500;

/** 原 wKt：chip 悬停 tooltip（拖拽中强制关闭） */
const TabChipHoverTooltip: React.FC<{ isDragging: boolean; title: string; children: React.ReactNode }> = ({ isDragging, title, children }) => {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (isDragging) setOpen(false);
  }, [isDragging]);
  return (
    <TooltipProvider delayDuration={TAB_TOOLTIP_DELAY_MS} skipDelayDuration={0}>
      <Tooltip title={title} side="bottom" triggerClassName="shrink" open={open && !isDragging} onOpenChange={(next) => setOpen(isDragging ? false : next)}>
        {children}
      </Tooltip>
    </TooltipProvider>
  );
};

export interface SidePaneTabChipProps {
  tab: SidePaneTab;
  title: string;
  closeTabLabel: string;
  closeTabMenuLabel: string;
  closeOtherTabsLabel: string;
  closeAllTabsLabel: string;
  diffBadgeLabel: string;
  isActive: boolean;
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  canCloseOtherTabs: boolean;
}

/** 原 TKt（js 181303 / jsx 146452）：单个标签 chip
 *  - dnd-kit useSortable 拖拽重排（拖拽中半透明+高 z，点击抑制）；
 *  - TabsTrigger 语义（data-state active/inactive）；
 *  - 右侧渐变遮罩 + 常驻关闭按钮；
 *  - 右键菜单：关闭标签 / 关闭其他标签 / 关闭所有标签。 */
export function SidePaneTabChip({
  tab,
  title,
  closeTabLabel,
  closeTabMenuLabel,
  closeOtherTabsLabel,
  closeAllTabsLabel,
  diffBadgeLabel,
  isActive,
  onActivateTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  canCloseOtherTabs,
}: SidePaneTabChipProps) {
  const suppressClickAfterDrag = React.useRef(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
  const normalizedTransform = transform ? { ...transform, scaleX: 1, scaleY: 1 } : null;
  const style: React.CSSProperties = {
    transform: transformToString(normalizedTransform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  if (isDragging) suppressClickAfterDrag.current = true;
  return (
    <ContextMenu>
      <TabChipHoverTooltip isDragging={isDragging} title={title}>
        <ContextMenuTrigger asChild>
          <TabsTrigger value={tab.id} asChild>
            <div
              ref={setNodeRef}
              data-side-pane-tab-id={tab.id}
              data-browser-tab-residency={"residency" in tab ? (tab as BrowserTab).residency : undefined}
              data-active={isActive ? "" : undefined}
              data-state={isActive ? "active" : "inactive"}
              style={style}
              {...attributes}
              {...listeners}
              onPointerDown={(event) => {
                listeners?.onPointerDown?.(event);
                event.preventDefault();
              }}
              onClick={(event) => {
                // 拖拽落点不触发激活
                if (suppressClickAfterDrag.current) {
                  suppressClickAfterDrag.current = false;
                  event.preventDefault();
                  return;
                }
                onActivateTab(tab.id);
              }}
              className={cn(
                "group relative inline-flex items-center gap-1.5",
                "flex-[1_1_9.75rem] !h-7 min-w-15 max-w-39 justify-start overflow-hidden rounded-md border px-1.5 pr-2 text-ui-base font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
                "border-transparent bg-[var(--side-pane-tab-bg)] text-foreground-subtle !rounded-lg",
                "hover:border-border hover:text-foreground",
                "data-active:!border-border data-active:!bg-card data-active:text-foreground",
                "[--side-pane-tab-bg:var(--color-background)] data-active:[--side-pane-tab-bg:var(--color-card)]",
                "cursor-default",
                isDragging && "cursor-grabbing shadow-md",
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                <SidePaneTabIcon tab={tab} />
              </span>
              <span className="min-w-0 flex-1 truncate">{title}</span>
              {tabShowsDiffBadge(tab) ? (
                <span className="ml-0.5 shrink-0 rounded-full border border-border bg-surface px-1 py-0 text-ui-xs leading-3 text-foreground-subtle">{diffBadgeLabel}</span>
              ) : null}
              {/* 右缘渐变 + 关闭按钮（不随拖拽位移） */}
              <span className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center">
                <span className="h-full w-2 bg-gradient-to-r from-transparent to-[var(--side-pane-tab-bg)] transition-colors" />
                <span className="pointer-events-auto flex h-full w-6 items-center justify-center bg-[var(--side-pane-tab-bg)] transition-colors">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={closeTabLabel}
                    className="rounded-md"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                  >
                    <IconX className="size-3" />
                  </Button>
                </span>
              </span>
            </div>
          </TabsTrigger>
        </ContextMenuTrigger>
      </TabChipHoverTooltip>
      <ContextMenuContent className="w-44">
        <ContextMenuItem onSelect={() => onCloseTab(tab.id)}>{closeTabMenuLabel}</ContextMenuItem>
        <ContextMenuItem disabled={!canCloseOtherTabs} onSelect={() => onCloseOtherTabs(tab.id)}>
          {closeOtherTabsLabel}
        </ContextMenuItem>
        <ContextMenuItem onSelect={onCloseAllTabs}>{closeAllTabsLabel}</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** 原 EKt（js 181429 / jsx 146517）：拖拽悬浮态 chip（DragOverlay 内） */
export const SidePaneTabChipDragOverlay: React.FC<{ tab: SidePaneTab; title: string; diffBadgeLabel: string }> = ({ tab, title, diffBadgeLabel }) => (
  <div
    className={cn(
      "inline-flex !h-7 w-39 min-w-15 max-w-39 items-center justify-start gap-1.5 whitespace-nowrap rounded-lg border border-border bg-selected px-1.5 pr-1 text-ui-base font-medium text-foreground shadow-md",
      "cursor-grabbing",
    )}
  >
    <span className="flex size-4 shrink-0 items-center justify-center">
      <SidePaneTabIcon tab={tab} />
    </span>
    <span className="min-w-0 flex-1 truncate">{title}</span>
    {tabShowsDiffBadge(tab) ? (
      <span className="ml-0.5 shrink-0 rounded-full border border-border bg-surface px-1 py-0 text-ui-xs leading-3 text-foreground-subtle">{diffBadgeLabel}</span>
    ) : null}
  </div>
);

/* ============================================================================
 * 7. 标签总览（原 IKt，js 181639–181854 / jsx 146665–146762）
 * ----------------------------------------------------------------------------
 * 标签栏最左 ⌄（chevrons-down）按钮：Popover + cmdk。
 *  - 搜索「打开的标签页」（标题+提示词+类型名评分排序）；
 *  - 「最近关闭的标签页」点击重开；
 *  - 打开期间每 60s 刷新相对时间。
 * ==========================================================================*/

export interface SidePaneTabOverviewLabels {
  title: string;
  searchPlaceholder: string;
  openTabs: string;
  recentlyClosedTabs: string;
  noResults: string;
  closeTab: (title: string) => string;
  relativeTime: (timestampMs: number) => string;
  browserTitle: string;
  reviewTitle: string;
  codeViewerTitle: string;
  treemappingTitle: string;
  whiteboardTitle: string;
  modelTrajectoryTitle: string;
  repoWikiTitle: string;
  developerToolsTitle: string;
  terminalTitle: string;
  subagentTypeLabel: string;
  subagentDirectoryTitle: string;
  selectionChatTitle: string;
  planTitle: string;
}

/** 原 PKt：用预取 labels 解析标题（避免在列表里重复调 intl） */
function resolveTabTitleFromLabels(tab: SidePaneTab, labels: SidePaneTabOverviewLabels): string {
  const byId: Record<string, string> = {
    "browser.title": labels.browserTitle,
    "sidePane.review": labels.reviewTitle,
    "codeViewer.title": labels.codeViewerTitle,
    "treemapping.title": labels.treemappingTitle,
    "whiteboard.title": labels.whiteboardTitle,
    "modelTrajectory.title": labels.modelTrajectoryTitle,
    "repoWiki.title": labels.repoWikiTitle,
    "developerTools.title": labels.developerToolsTitle,
    "terminal.title": labels.terminalTitle,
    "sidePane.subagent": labels.subagentTypeLabel,
    "sidePane.subagentDirectory": labels.subagentDirectoryTitle,
    "sidePane.selectionChat": labels.selectionChatTitle,
    "planTool.panel.planTab": labels.planTitle,
  };
  return resolveSidePaneTabTitle(tab, (descriptor) => byId[descriptor.id] ?? descriptor.id);
}

/** 原 FKt：类型名（分组展示用） */
function resolveTabTypeLabel(tab: SidePaneTab, labels: SidePaneTabOverviewLabels): string {
  switch (tab.type) {
    case "plan-detail":
      return labels.planTitle;
    case "selection-side-chat":
      return labels.selectionChatTitle;
    case "subagent-session":
      return tab.subagentType.trim() || labels.subagentTypeLabel;
    case "subagent-directory":
      return labels.subagentDirectoryTitle;
    case "browser":
    case "browser-use":
      return labels.browserTitle;
    case "git":
      return labels.reviewTitle;
    case "treemapping":
      return labels.treemappingTitle;
    case "whiteboard":
      return labels.whiteboardTitle;
    case "model-trajectory":
      return labels.modelTrajectoryTitle;
    case "repo-wiki":
      return labels.repoWikiTitle;
    case "developer-tools":
      return labels.developerToolsTitle;
    case "terminal":
      return labels.terminalTitle;
    default:
      return labels.codeViewerTitle;
  }
}

const GROUP_CLASS =
  "border-border border-b p-1 last:border-b-0 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-ui-base **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-foreground-subtle";

export function SidePaneTabOverview({
  tabs,
  activeTabId,
  recentClosedTabs,
  labels,
  onActivateTab,
  onCloseTab,
  onReopenClosedTab,
}: {
  tabs: SidePaneTab[];
  activeTabId: string;
  recentClosedTabs: RecentClosedSidePaneTab[];
  labels: SidePaneTabOverviewLabels;
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onReopenClosedTab: (tabId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());
  const tokens = React.useMemo(() => normalizeQuery(query), [query]);

  const openEntries = React.useMemo(
    () =>
      tabs.map((tab) => {
        const title = resolveTabTitleFromLabels(tab, labels);
        const hint = sidePaneTabSearchHint(tab);
        const typeLabel = resolveTabTypeLabel(tab, labels);
        return { tab, title, hint, openedAtLabel: labels.relativeTime(tab.openedAt ?? now), searchFields: buildSearchFields(title, hint, typeLabel) };
      }),
    [now, labels, tabs],
  );
  const closedEntries = React.useMemo(
    () =>
      recentClosedTabs.map((entry) => {
        const title = resolveTabTitleFromLabels(entry.tab, labels);
        const hint = sidePaneTabSearchHint(entry.tab);
        const typeLabel = resolveTabTypeLabel(entry.tab, labels);
        return { item: entry, title, hint, closedAtLabel: labels.relativeTime(entry.closedAt), searchFields: buildSearchFields(title, hint, typeLabel) };
      }),
    [now, labels, recentClosedTabs],
  );
  const matchedOpen = React.useMemo(() => filterRanked(openEntries, tokens), [tokens, openEntries]);
  const matchedClosed = React.useMemo(() => filterRanked(closedEntries, tokens), [tokens, closedEntries]);
  const hasResults = matchedOpen.length > 0 || matchedClosed.length > 0;

  // 打开期间每分钟刷新相对时间
  React.useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon-md" className="shrink-0" aria-label={labels.title}>
          <IconChevronsDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 bg-menu p-0">
        <Command shouldFilter={false} className="bg-transparent p-0 text-foreground">
          <CommandInput value={query} onValueChange={setQuery} placeholder={labels.searchPlaceholder} className="h-8" />
          <CommandList className="max-h-80">
            {!hasResults ? (
              <CommandGroup heading={labels.openTabs} className={GROUP_CLASS}>
                <CommandEmpty className="px-4 py-5 text-foreground-subtle">{labels.noResults}</CommandEmpty>
              </CommandGroup>
            ) : null}
            {matchedOpen.length > 0 ? (
              <CommandGroup heading={labels.openTabs} className={GROUP_CLASS}>
                {matchedOpen.map(({ tab, title, openedAtLabel }) => (
                  <CommandItem
                    key={tab.id}
                    value={title}
                    className={cn("mb-0.5 min-h-8 cursor-pointer gap-2 px-2 text-ui-base last:mb-0", tab.id === activeTabId && "bg-selected data-selected:bg-selected")}
                    onSelect={() => {
                      onActivateTab(tab.id);
                      setOpen(false);
                    }}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center text-foreground-subtle">
                      <SidePaneTabIcon tab={tab} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ui-base font-medium text-foreground">{title}</span>
                    <span className="mr-0.5 shrink-0 text-ui-base text-foreground-subtle">{openedAtLabel}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.closeTab(title)}
                      className="shrink-0 opacity-70 hover:opacity-100"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                    >
                      <IconX className="size-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {matchedClosed.length > 0 ? (
              <CommandGroup heading={labels.recentlyClosedTabs} className={GROUP_CLASS}>
                {matchedClosed.map(({ item, title, closedAtLabel }) => (
                  <CommandItem
                    key={item.tab.id}
                    value={title}
                    className="mb-0.5 min-h-8 cursor-pointer gap-2 px-2 text-ui-base last:mb-0"
                    onSelect={() => {
                      onReopenClosedTab(item.tab.id);
                      setOpen(false);
                    }}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center text-foreground-subtle">
                      <SidePaneTabIcon tab={item.tab} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ui-base font-medium text-foreground">{title}</span>
                    <span className="mr-0.5 shrink-0 text-ui-base text-foreground-subtle">{closedAtLabel}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ============================================================================
 * 8. 标签内容：子智能体 / 辅助对话 / 计划详情 / 挂起浏览器占位
 *    （原 181855–182304 / jsx 146763–147134）
 * ==========================================================================*/

/** 原 H5/RKt：子智能体目录分页大小 */
const SUBAGENT_PAGE_SIZE = 20;
const SUBAGENT_MAX_PAGE_SIZE = 100;

export interface SubagentDirectoryState {
  revision: number;
  ended: { total: number; items: SubagentDirectoryItem[]; nextCursor?: string };
  error: string | null;
  loading: boolean;
}

/** 原 U5 */
function emptySubagentDirectoryState(): SubagentDirectoryState {
  return { revision: 0, ended: { total: 0, items: [] }, error: null, loading: false };
}

/** 原 zKt：按 childSessionId 去重合并 */
function mergeSubagentItems(existing: SubagentDirectoryItem[], incoming: SubagentDirectoryItem[]): SubagentDirectoryItem[] {
  const seen = new Set(existing.map((item) => item.childSessionId));
  return [...existing, ...incoming.filter((item) => !seen.has(item.childSessionId))];
}

/** 原 BKt：total 变化时的补偿请求量 */
function resolveRequestedEndedCount(args: { loadedItemCount: number; nextTotal: number; previousTotal: number; requestedCount: number }): number {
  return args.loadedItemCount === 0 ? args.requestedCount : args.requestedCount + Math.max(0, args.nextTotal - args.previousTotal);
}

/** 原 VKt（js 181904 / jsx 146801）：子智能体目录读取（首页拉满补偿 + loadMore 翻页） */
export function useSubagentDirectory(args: {
  enabled?: boolean;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  sessionId: string;
  refreshKey?: number;
}): SubagentDirectoryState & { loadMore: () => Promise<void>; refresh: () => Promise<void> } {
  const { zcodeAgentService } = useServices();
  const [state, setState] = React.useState<SubagentDirectoryState>(emptySubagentDirectoryState);
  const requestSeq = React.useRef(0);
  const inFlight = React.useRef(false);
  const pageSize = React.useRef(SUBAGENT_PAGE_SIZE);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const enabled = args.enabled !== false && !!args.sessionId;

  const fetchPage = React.useCallback(
    (endedLimit: number, endedCursor?: string): Promise<SubagentListResponse> =>
      args.sessionId
        ? typeof zcodeAgentService?.listSessionSubagents === "function"
          ? zcodeAgentService.listSessionSubagents({
              workspacePath: args.workspacePath,
              ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}),
              ...(args.remoteSessionId ? { remoteSessionId: args.remoteSessionId } : {}),
              sessionId: args.sessionId,
              endedLimit,
              ...(endedCursor ? { endedCursor } : {}),
            })
          : Promise.resolve({ revision: 0, childSessionIds: [], running: [], ended: { total: 0, items: [] } })
        : Promise.reject(Error("session_id_missing")),
    [args.remoteSessionId, args.sessionId, args.workspaceIdentity, args.workspacePath, zcodeAgentService],
  );

  const refresh = React.useCallback(async () => {
    if (!enabled) {
      setState(emptySubagentDirectoryState());
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    const seq = ++requestSeq.current;
    setState((prev) => ({ ...prev, loading: prev.revision === 0, error: null }));
    try {
      const requested = Math.max(SUBAGENT_PAGE_SIZE, pageSize.current);
      const response = await fetchPage(Math.min(requested, SUBAGENT_MAX_PAGE_SIZE));
      const snapshot = stateRef.current;
      const targetCount = resolveRequestedEndedCount({
        loadedItemCount: snapshot.ended.items.length,
        nextTotal: response.ended.total,
        previousTotal: snapshot.ended.total,
        requestedCount: requested,
      });
      let items = response.ended.items;
      let cursor = response.ended.nextCursor;
      let latest = response;
      // total 比已加载多 → 连续翻页补齐
      while (items.length < targetCount && cursor) {
        const page = await fetchPage(Math.min(SUBAGENT_PAGE_SIZE, targetCount - items.length), cursor);
        items = mergeSubagentItems(items, page.ended.items);
        cursor = page.ended.nextCursor;
        latest = page;
      }
      if (seq !== requestSeq.current) return;
      pageSize.current = Math.max(SUBAGENT_PAGE_SIZE, items.length);
      setState({
        revision: latest.revision,
        ended: { total: latest.ended.total, items, ...(cursor ? { nextCursor: cursor } : {}) },
        error: null,
        loading: false,
      });
    } catch (error) {
      if (seq !== requestSeq.current) return;
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[subagent-directory] 读取子智能体目录失败", {
        error: message,
        sessionId: args.sessionId,
        workspaceKey: args.workspaceIdentity?.trim() || args.workspacePath,
      });
      setState((prev) => ({ ...prev, error: message, loading: false }));
    } finally {
      inFlight.current = false;
    }
  }, [enabled, args.remoteSessionId, args.sessionId, args.workspaceIdentity, args.workspacePath, fetchPage]);

  const loadMore = React.useCallback(async () => {
    const snapshot = stateRef.current;
    if (!enabled || snapshot.loading || inFlight.current || !snapshot.ended.nextCursor) return;
    inFlight.current = true;
    const seq = ++requestSeq.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchPage(SUBAGENT_PAGE_SIZE, snapshot.ended.nextCursor);
      if (seq !== requestSeq.current) return;
      const items = mergeSubagentItems(snapshot.ended.items, response.ended.items);
      pageSize.current = Math.max(SUBAGENT_PAGE_SIZE, items.length);
      setState({
        revision: response.revision,
        ended: { total: response.ended.total, items, ...(response.ended.nextCursor ? { nextCursor: response.ended.nextCursor } : {}) },
        error: null,
        loading: false,
      });
    } catch (error) {
      if (seq !== requestSeq.current) return;
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : String(error), loading: false }));
    } finally {
      inFlight.current = false;
    }
  }, [enabled, fetchPage]);

  React.useEffect(
    () => (
      (pageSize.current = SUBAGENT_PAGE_SIZE),
      setState(emptySubagentDirectoryState()),
      () => {
        requestSeq.current += 1;
      }
    ),
    [args.remoteSessionId, args.sessionId, args.workspaceIdentity, args.workspacePath],
  );
  React.useEffect(() => {
    void refresh();
  }, [args.refreshKey, refresh]);

  return { ...state, loadMore, refresh };
}

/** 原 WKt：子智能体状态图标（6 态） */
const SubagentStatusIcon: React.FC<{ status: SubagentDirectoryItem["status"] }> = ({ status }) => {
  const sizeClass = "size-4 shrink-0";
  switch (status) {
    case "running":
      return <IconLoaderCircle aria-hidden="true" className={`${sizeClass} animate-spin`} />;
    case "waiting":
    case "blocked":
      return <IconCirclePause aria-hidden="true" className={sizeClass} />;
    case "success":
      return <IconCircleCheck aria-hidden="true" className={sizeClass} />;
    case "failed":
      return <IconCircleAlert aria-hidden="true" className={sizeClass} />;
    case "cancelled":
      return <IconBan aria-hidden="true" className={sizeClass} />;
    case "lost":
      return <IconCircleDashed aria-hidden="true" className={sizeClass} />;
  }
};

/** 原 GKt（js 182056 / jsx 146983）：子智能体目录行 */
export const SubagentDirectoryItemRow = React.memo(function SubagentDirectoryItemRow({ item, onOpen }: { item: SubagentDirectoryItem; onOpen: (item: SubagentDirectoryItem) => void }) {
  const { intl } = useIntlContext();
  const when = "endedAt" in item ? item.endedAt : item.startedAt;
  return (
    <button
      type="button"
      className="flex w-full min-w-0 items-start gap-3 rounded-lg px-3 py-2.5 text-left text-ui-base transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
      onClick={() => onOpen(item)}
    >
      <span className="mt-0.5 text-foreground-subtle">
        <SubagentStatusIcon status={item.status} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-foreground">{item.title}</span>
          <span className="shrink-0 text-ui-sm text-foreground-subtlest">{intl.formatMessage({ id: `subagentDirectory.status.${item.status}` })}</span>
        </span>
        {item.summary ? <span className="mt-0.5 block truncate text-ui-sm text-foreground-subtle">{item.summary}</span> : null}
      </span>
      {when ? <span className="shrink-0 text-ui-sm text-foreground-subtlest">{formatRelativeTime(when, intl)}</span> : null}
    </button>
  );
});

/** 原 UKt：目录行 → 打开子智能体会话的请求 */
function buildSubagentSessionOpenRequest(tab: SubagentDirectoryTab, item: SubagentDirectoryItem): SubagentOpenRequest {
  return {
    workspacePath: tab.workspacePath,
    ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
    ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
    rootSessionId: tab.rootSessionId,
    parentSessionId: tab.parentSessionId,
    childSessionId: item.childSessionId,
    subagentType: item.subagentType,
    title: item.title,
  };
}

/** 原 qKt：目录主体（运行中 / 已结束 两段 + 更多 + 错误） */
const SubagentDirectoryBody = React.memo(function SubagentDirectoryBody({ tab, onOpenSubagentSession }: { tab: SubagentDirectoryTab; onOpenSubagentSession: (req: SubagentOpenRequest) => void }) {
  const { intl } = useIntlContext();
  const { layer } = usePanelScope();
  const [handle, setHandle] = React.useState<SessionHandle | null>(null);
  const snapshot = useSessionSnapshot(handle).snapshot;

  React.useEffect(() => {
    const acquired = layer.acquire(tab.parentSessionId);
    setHandle(acquired);
    return () => acquired.release();
  }, [layer, tab.parentSessionId]);

  const directory = useSubagentDirectory({
    enabled: snapshot !== null,
    workspacePath: tab.workspacePath,
    workspaceIdentity: tab.workspaceIdentity,
    remoteSessionId: tab.remoteSessionId,
    sessionId: tab.parentSessionId,
    refreshKey: snapshot?.subagents?.revision ?? 0,
  });
  const running = snapshot?.subagents?.running ?? [];
  const endedTotal = snapshot?.subagents?.endedTotal ?? 0;
  const open = (item: SubagentDirectoryItem) => {
    onOpenSubagentSession(buildSubagentSessionOpenRequest(tab, item));
  };

  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-ui-base font-semibold text-foreground">{intl.formatMessage({ id: "subagentDirectory.title" })}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <section>
          <h3 className="px-3 pb-1.5 text-ui-sm font-medium text-foreground-subtlest">
            {intl.formatMessage({ id: "subagentDirectory.running" })} · {running.length}
          </h3>
          {running.length > 0 ? (
            running.map((item) => <SubagentDirectoryItemRow key={item.childSessionId} item={item} onOpen={open} />)
          ) : (
            <p className="px-3 py-3 text-ui-base text-foreground-subtlest">{intl.formatMessage({ id: "subagentDirectory.runningEmpty" })}</p>
          )}
        </section>
        <section className="mt-5">
          <h3 className="px-3 pb-1.5 text-ui-sm font-medium text-foreground-subtlest">
            {intl.formatMessage({ id: "subagentDirectory.ended" })} · {endedTotal}
          </h3>
          {directory.ended.items.map((item) => (
            <SubagentDirectoryItemRow key={item.childSessionId} item={item} onOpen={open} />
          ))}
          {directory.ended.nextCursor ? (
            <div className="px-3 pt-2">
              <Button type="button" variant="ghost" size="sm" disabled={directory.loading} onClick={() => void directory.loadMore()}>
                {intl.formatMessage({ id: "subagentDirectory.showMore" })}
              </Button>
            </div>
          ) : null}
        </section>
        {directory.error ? (
          <p role="alert" className="mx-3 mt-4 text-ui-sm text-[var(--color-danger)]">
            {intl.formatMessage({ id: "subagentDirectory.loadFailed" })}
          </p>
        ) : null}
      </div>
    </div>
  );
});

/** 原 KKt：子智能体目录标签内容（服务作用域包裹） */
export const SubagentDirectoryTabContent = React.memo(function SubagentDirectoryTabContent({ tab, onOpenSubagentSession }: { tab: SubagentDirectoryTab; onOpenSubagentSession: (req: SubagentOpenRequest) => void }) {
  return (
    <ServiceScopeProvider
      scope={React.useMemo(
        () => ({
          workspacePath: tab.workspacePath,
          ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
          ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
        }),
        [tab.remoteSessionId, tab.workspaceIdentity, tab.workspacePath],
      )}
    >
      <SubagentDirectoryBody tab={tab} onOpenSubagentSession={onOpenSubagentSession} />
    </ServiceScopeProvider>
  );
});

/** 原 LKt（js 181855 / jsx 146763）：子智能体会话标签内容 = 只读会话面板 */
export const SubagentSessionTabContent = React.memo(function SubagentSessionTabContent({
  tab,
  focused,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenSubagentSession,
}: {
  tab: SubagentSessionTab;
  focused: boolean;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onOpenFileLink: (path: string) => void;
  onOpenSubagentSession: (req: SubagentOpenRequest) => void;
}) {
  return (
    <ServiceScopeProvider
      scope={React.useMemo(
        () => ({
          workspacePath: tab.workspacePath,
          ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
          ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
        }),
        [tab.remoteSessionId, tab.workspaceIdentity, tab.workspacePath],
      )}
    >
      <ConversationPane
        paneId={tab.id}
        sessionId={tab.childSessionId}
        rootSessionId={tab.rootSessionId}
        readOnly
        allowWorkspaceFileRewind
        focused={focused}
        telemetryVisible={focused}
        workspacePath={tab.workspacePath}
        workspaceIdentity={tab.workspaceIdentity}
        remoteSessionId={tab.remoteSessionId}
        onOpenBrowserUrl={onOpenBrowserUrl}
        onOpenCodeViewer={onOpenCodeViewer}
        onOpenFileLink={onOpenFileLink}
        onOpenSubagentSession={onOpenSubagentSession}
      />
    </ServiceScopeProvider>
  );
});

/** 原 JKt（js 182199 / jsx 147056）：辅助对话标签内容 = R0 selectionSideChat 形态 */
export const SelectionSideChatTabContent = React.memo(function SelectionSideChatTabContent({
  tab,
  focused,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  onOpenFileLink,
  onUnavailable,
}: {
  tab: SelectionSideChatTab;
  focused: boolean;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onOpenFileLink: (path: string) => void;
  /** runtime 不可用时关闭本标签（原 onUnavailable = onCloseTab） */
  onUnavailable: (tabId: string) => void;
}) {
  const scope = React.useMemo(
    () => ({
      workspacePath: tab.workspacePath,
      ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
      ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
    }),
    [tab.remoteSessionId, tab.workspaceIdentity, tab.workspacePath],
  );
  const handleUnavailable = React.useCallback(() => onUnavailable(tab.id), [onUnavailable, tab.id]);
  return (
    <ServiceScopeProvider scope={scope}>
      <ConversationPane
        paneId={tab.id}
        sessionId={tab.childSessionId}
        selectionSideChat
        focused={focused}
        telemetryVisible={focused}
        workspacePath={tab.workspacePath}
        workspaceIdentity={tab.workspaceIdentity}
        remoteSessionId={tab.remoteSessionId}
        onOpenBrowserUrl={onOpenBrowserUrl}
        onOpenCodeViewer={onOpenCodeViewer}
        onOpenFileLink={onOpenFileLink}
        onSelectionSideChatUnavailable={handleUnavailable}
      />
    </ServiceScopeProvider>
  );
});

/** 原 YKt：计划详情主体（跟踪会话里的 ExitPlanMode 工具调用 markdown，实时刷新） */
const PlanDetailBody = React.memo(function PlanDetailBody({
  tab,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  onOpenFileLink,
}: {
  tab: PlanDetailTab;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onOpenFileLink: (path: string) => void;
}) {
  const { layer } = usePanelScope();
  const [handle, setHandle] = React.useState<SessionHandle | null>(null);
  const [fallbackMarkdown, setFallbackMarkdown] = React.useState(tab.markdown);
  const theme = useSettingsSelector((s) => s.theme, "system");
  const codePreviewSettings = useSettingsSelector((s) => s.codePreviewSettings, {} as CodePreviewSettings);

  React.useEffect(() => {
    const acquired = layer.acquire(tab.parentSessionId);
    setHandle(acquired);
    return () => acquired.release();
  }, [layer, tab.parentSessionId]);

  const snapshot = useSessionSnapshot(handle);
  const liveMarkdown = React.useMemo(() => {
    const row = snapshot.snapshot?.rows.window.find((candidate) => candidate.kind === "toolCall" && candidate.toolCallId === tab.toolCallId);
    if (!row || row.kind !== "toolCall") return;
    return extractPlanMarkdown(unwrapToolCallRow(row).toolCall, tab.workspacePath).markdown;
  }, [snapshot.snapshot, tab.toolCallId, tab.workspacePath]);

  React.useEffect(() => {
    if (liveMarkdown) setFallbackMarkdown(liveMarkdown);
  }, [liveMarkdown]);
  React.useEffect(() => {
    if (tab.markdown) setFallbackMarkdown(tab.markdown);
  }, [tab.markdown]);

  const markdown = liveMarkdown ?? fallbackMarkdown;
  return (
    <div data-plan-detail-tool-call-id={tab.toolCallId} className="h-full min-h-0 overflow-y-auto bg-background px-4 py-4">
      <MarkdownRenderer
        className="mx-auto w-full max-w-4xl min-w-0 break-words text-foreground"
        workspacePath={tab.workspacePath}
        theme={theme}
        codePreviewSettings={codePreviewSettings}
        onOpenCodeViewer={onOpenCodeViewer}
        onOpenFileLink={onOpenFileLink}
        onOpenExternalUrl={onOpenBrowserUrl}
      >
        {markdown ?? ""}
      </MarkdownRenderer>
    </div>
  );
});

/** 原 XKt：计划详情标签内容（服务作用域包裹） */
export const PlanDetailTabContent = React.memo(function PlanDetailTabContent({
  tab,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  onOpenFileLink,
}: {
  tab: PlanDetailTab;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onOpenFileLink: (path: string) => void;
}) {
  return (
    <ServiceScopeProvider
      scope={React.useMemo(
        () => ({
          workspacePath: tab.workspacePath,
          ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
          ...(tab.remoteSessionId ? { remoteSessionId: tab.remoteSessionId } : {}),
        }),
        [tab.remoteSessionId, tab.workspaceIdentity, tab.workspacePath],
      )}
    >
      <PlanDetailBody tab={tab} onOpenBrowserUrl={onOpenBrowserUrl} onOpenCodeViewer={onOpenCodeViewer} onOpenFileLink={onOpenFileLink} />
    </ServiceScopeProvider>
  );
});

/** 原 pqt（js 182366 / jsx 147193）：挂起浏览器标签占位（挂载即向主进程回 suspend-ready ack） */
export function SuspendedBrowserTabPlaceholder({ tab }: { tab: BrowserTab | BrowserUseTab }) {
  const platform = usePlatformService();
  const targetTabId = tab.type === "browser-use" ? (tab as BrowserUseTab).tabId : tab.id;
  const generation = tab.residencyGeneration ?? 0;
  React.useEffect(() => {
    if (tab.residency !== "suspended") return;
    platform.browserViewSuspendReady?.({ tabId: targetTabId, generation }).catch((error) => {
      logger.debug("[browser-use] suspend ready ack 失败", {
        error: error instanceof Error ? error.message : String(error),
        generation,
        tabId: targetTabId,
      });
    });
  }, [generation, platform, tab.residency, targetTabId]);
  return <TabsContent value={tab.id} forceMount data-browser-tab-residency="suspended" className="relative z-10 h-full min-h-0 bg-background data-[state=inactive]:hidden" />;
}

/* ============================================================================
 * 9. 空态四宫格 + 开发者工具旗标 + 面板几何（原 182305–182518 / jsx 147135–147332）
 * ==========================================================================*/

/** 原 nqt：开发者工具开关的 localStorage 旗标键（任一为真即启用） */
export const DEVELOPER_TOOLS_FLAG_KEYS = ["zcode:developer-tools:enabled", "zcode:token-debug:enabled"];
const FALSY_FLAG_VALUES = new Set(["0", "false", "off", "no"]);

/** 原 iqt：旗标值解析（非空且不在 0/false/off/no 之列即为真） */
export function isTruthyFlag(raw: string | null): boolean {
  if (raw === null) return false;
  return !FALSY_FLAG_VALUES.has(raw.trim().toLowerCase());
}

/** 原 oqt：安全取 localStorage */
export function tryGetLocalStorage(): Storage | undefined {
  if (typeof window > "u") return;
  try {
    return window.localStorage;
  } catch {
    return;
  }
}

/** 原 aqt：开发者工具是否启用 */
export function isDeveloperToolsEnabled(storage: Storage | undefined = tryGetLocalStorage()): boolean {
  return storage
    ? DEVELOPER_TOOLS_FLAG_KEYS.some((key) => {
        try {
          return isTruthyFlag(storage.getItem(key));
        } catch {
          return false;
        }
      })
    : false;
}

/** 原 sqt：旗标轮询间隔 */
const DEVELOPER_TOOLS_POLL_MS = 1000;

/** 原 cqt：订阅开发者工具开关（storage 事件 + focus + 1s 轮询） */
export function useDeveloperToolsEnabled(): boolean {
  const [enabled, setEnabled] = React.useState(isDeveloperToolsEnabled);
  React.useEffect(() => {
    const refresh = () => {
      setEnabled(isDeveloperToolsEnabled());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || DEVELOPER_TOOLS_FLAG_KEYS.includes(event.key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, DEVELOPER_TOOLS_POLL_MS);
    refresh();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);
  return enabled;
}

/** 原 hqt：能否打开辅助对话 —— 有激活任务、非 mobile overlay、非手机键盘视口 */
export function canOpenSelectionSideConversation(args: { activeTaskId: string | null; isMobileTextInputViewport: boolean; mobileOverlay: boolean }): boolean {
  return !!(args.activeTaskId && !args.mobileOverlay && !args.isMobileTextInputViewport);
}

/** 空态四宫格候选项（按显示顺序） */
export type EmptyStateTabOptionId = "selection-side-conversation" | "review" | "terminal" | "browser" | "developer-tools";

/** 原 mqt（js 182389 / jsx 147217）：空态可打开项解析。
 *  规则：辅助对话（有激活任务时）→ 审查（尚无 git 标签时）→ 终端（恒有）
 *        → 浏览器（支持内嵌时）→ 开发者工具（旗标开启时）。
 *  典型桌面 + 激活任务 = 4 项，即「空态四宫格」。 */
export function resolveEmptyStateTabOptions(args: { developerToolsEnabled: boolean; hasReviewTab: boolean; canOpenSelectionSideConversation?: boolean; supportsEmbeddedBrowser?: boolean }): EmptyStateTabOptionId[] {
  const canOpenSelectionSideConversation = args.canOpenSelectionSideConversation ?? false;
  const supportsEmbeddedBrowser = args.supportsEmbeddedBrowser ?? true;
  const options: EmptyStateTabOptionId[] = [];
  if (canOpenSelectionSideConversation) options.push("selection-side-conversation");
  if (!args.hasReviewTab) options.push("review");
  options.push("terminal");
  if (supportsEmbeddedBrowser) options.push("browser");
  if (args.developerToolsEnabled) options.push("developer-tools");
  return options;
}

/** 原 gqt：面板尺寸策略 —— mobile overlay 全屏不可拖；桌面 0 起、240px–65% 可拖 */
export function resolveSidePanePanelSizing(args: { mobileOverlay: boolean }): {
  collapsedSize: string;
  defaultSize: string;
  maxSize: string;
  minSize: string;
  useResizablePanel: boolean;
} {
  return args.mobileOverlay
    ? { collapsedSize: "0px", defaultSize: "100%", maxSize: "100%", minSize: "0px", useResizablePanel: false }
    : { collapsedSize: "0px", defaultSize: "0px", maxSize: "65%", minSize: "240px", useResizablePanel: true };
}

/** 原 ZKt：首次展开且无测量值时的默认宽 = 父容器宽 × 0.45 */
const PANEL_DEFAULT_WIDTH_RATIO = 0.45;
/** 原 QKt/$Kt/eqt：标签栏溢出估算参数（估宽 60px、间隙 8px、容差 1px） */
const ESTIMATED_TAB_WIDTH_PX = 60;
const TAB_GAP_PX = 8;
const OVERFLOW_TOLERANCE_PX = 1;

/** 原 tqt：标签栏是否溢出（决定是否把 ⊞ 按钮收进滚动区） */
export function isTabBarOverflowing(args: { addButtonInside: boolean; addButtonWidth: number; tabCount: number; viewportWidth: number }): boolean {
  const tabsWidth = args.tabCount * ESTIMATED_TAB_WIDTH_PX + Math.max(0, args.tabCount - 1) * TAB_GAP_PX;
  const trailingGap = args.tabCount > 0 ? TAB_GAP_PX : 0;
  const available = args.viewportWidth + (args.addButtonInside ? 0 : args.addButtonWidth);
  return tabsWidth + trailingGap + args.addButtonWidth > available + OVERFLOW_TOLERANCE_PX;
}

/** 原 lqt/uqt/dqt/fqt */
const PANEL_OPEN_SETTLE_MS = 200; // 展开后清除定宽占位的时长
const RESIZE_SETTLE_DEBOUNCE_MS = 220; // resize 防抖时长
const EMPTY_TABS: SidePaneTab[] = [];
const NO_SCROLL_SHADOWS = { left: false, right: false };

/** 原 vqt：元素在视口内的可见宽度 */
function measureVisibleInlineSize(element: HTMLElement | null): number | null {
  if (!element || typeof window > "u") return null;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  if (viewportWidth <= 0) return null;
  const rect = element.getBoundingClientRect();
  const left = Math.max(0, rect.left);
  const right = Math.min(viewportWidth, rect.right);
  return Math.max(0, Math.round(right - left));
}

/** 原 yqt：面板可见内宽（resize/scroll/ResizeObserver 合流，rAF 防抖） */
export function usePanelVisibleInlineSize(elementRef: React.RefObject<HTMLDivElement | null>, visible: boolean): number | null {
  const [size, setSize] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!visible || typeof window > "u") {
      setSize(null);
      return;
    }
    const element = elementRef.current;
    if (!element) {
      setSize(null);
      return;
    }
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const next = measureVisibleInlineSize(element);
      setSize((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      if (frame === null) {
        if (typeof window.requestAnimationFrame !== "function") {
          measure();
          return;
        }
        frame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    const observer = typeof ResizeObserver > "u" ? null : new ResizeObserver(schedule);
    observer?.observe(element);
    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, { capture: true });
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [elementRef, visible]);
  return size;
}

/** 原 bqt：窗口/视觉视口 resize 后的安定窗口（期间不渲染重内容） */
export function useResizeSettling(visible: boolean): boolean {
  const [settling, setSettling] = React.useState(false);
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!visible || typeof window > "u") {
      setSettling(false);
      return;
    }
    const done = () => {
      timer.current = null;
      setSettling(false);
    };
    const bump = () => {
      setSettling((prev) => prev || true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(done, RESIZE_SETTLE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", bump, { passive: true });
    window.visualViewport?.addEventListener("resize", bump, { passive: true });
    return () => {
      window.removeEventListener("resize", bump);
      window.visualViewport?.removeEventListener("resize", bump);
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [visible]);
  return settling;
}

/** 原 _qt：code-viewer 重内容渲染门（可见+激活+（移动覆盖 或 未安定 或 宽度足够）） */
export function shouldRenderHeavyContent(args: {
  isActiveTab: boolean;
  isMobileOverlay?: boolean;
  isResizeSettling?: boolean;
  isSidePaneVisible: boolean;
  minVisibleInlineSizePx?: number;
  visibleInlineSizePx: number | null;
}): boolean {
  const minVisibleInlineSizePx = args.minVisibleInlineSizePx ?? 96;
  if (!args.isSidePaneVisible || !args.isActiveTab) return false;
  if (args.isMobileOverlay ?? false) return true;
  if (args.isResizeSettling ?? false) return false;
  return args.visibleInlineSizePx === null ? true : args.visibleInlineSizePx >= minVisibleInlineSizePx;
}

/** 原 VV（js 66107）：手机文本输入视口订阅（简化为常量 false 的接口占位） */
declare function useIsMobileTextInputViewport(): boolean;

/** 原 SWt（js 178264，F13 段）：browser-use 截图 surface 请求监听（按当前标签过滤） */
declare function useScreenshotSurfaceRequest(tabs: SidePaneTab[]): ScreenshotSurfaceRequest | null;
/** 原 xWt：在标签列表里找与截图请求匹配的 browser-use 标签 */
declare function findBrowserUseTabForSurface(tabs: SidePaneTab[], request: ScreenshotSurfaceRequest): BrowserUseTab | undefined;

/* ============================================================================
 * 10. SidePanel 根组件（原 xqt，js 182519–183258 / jsx 147333–147903）
 * ----------------------------------------------------------------------------
 * 结构（自外向内）：
 *  ① 桌面：Panel（react-resizable-panels，id="browser"，border-l，min 240px / max 65%）
 *     套 Q4 拖拽把手；mobile overlay/stacked 有专门覆盖类；不可见时 opacity-0
 *     但保持挂载（浏览器 tab 需后台驻留）。
 *  ② ScopedErrorBoundary（scope=workspace-side-pane，resetKeys=[workspaceKey, activeTabId]）。
 *  ③ Tabs（hC）：TabsList（!h-12 border-b）= [标签总览 ⌄ | dnd 标签条（可横滚，
 *     双侧渐隐遮罩）| ⊞ 新增标签（溢出时收进滚动区）]；TabsContent 区分派 14 型内容。
 *  ④ 无标签时渲染空态四宫格（side-pane-open-tab-shell）。
 * ==========================================================================*/

export interface SidePanelProps {
  services: BaseServices;
  isDesktop: boolean;
  isWindowsDesktop: boolean;
  isVisible: boolean;
  sidePaneState: SidePaneState | null;
  recentClosedSidePaneTabs: RecentClosedSidePaneTab[];
  isBrowserOpen: boolean;
  supportsEmbeddedBrowser?: boolean;
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  activeTaskId: string | null;
  sidePaneOwnerId: string | null;
  gitState: GitState;
  activeGitSourceId: string;
  panelRef?: React.Ref<unknown>;
  panelElementRef: React.RefObject<HTMLDivElement | null>;
  browserNavigationRequest: BrowserNavigationRequest | null;
  browserRestoreUrls: Record<string, string>;
  fileChangeFindActiveIndex: number;
  fileChangeFindNavigationRequestId: number;
  fileChangeFindQuery: string;
  onFileChangeFindMatchCountChange: (count: number) => void;
  onCloseCodeViewer: () => void;
  onCloseGit: () => void;
  onActivateTab: (tabId: string) => void;
  onReorderTab: (tabId: string, targetId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
  onReopenClosedTab: (tabId: string) => void;
  onOpenBrowserTab: () => void;
  onOpenWhiteboard: () => void;
  onOpenDeveloperTools: () => void;
  onOpenTerminalTab: () => void;
  onOpenRepoWiki: () => void;
  onOpenReviewTab: () => void;
  onOpenSelectionSideConversation: () => void;
  onRevealGitFileInTree: (path: string) => void;
  onOpenBrowserUrl: (url: string) => void;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onOpenFileLink: (path: string) => void;
  onOpenSubagentSession: (req: SubagentOpenRequest) => void;
  onRefreshGit: () => void;
  onBrowserNavigationRequestHandled: (requestId: string) => void;
  onBrowserUrlChange: (tabId: string, url: string) => void;
  onBrowserPageMetadataChange: (tabId: string, metadata: BrowserMetadataPatch) => void;
  onSelectGitSource: (sourceId: string) => void;
  mobileOverlay?: boolean;
  mobileStacked?: boolean;
}

export function SidePanel({
  services,
  isDesktop,
  isWindowsDesktop,
  isVisible,
  sidePaneState,
  recentClosedSidePaneTabs,
  isBrowserOpen,
  supportsEmbeddedBrowser = true,
  workspaceAbsPath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  activeTaskId,
  sidePaneOwnerId,
  gitState,
  activeGitSourceId,
  panelRef,
  panelElementRef,
  browserNavigationRequest,
  browserRestoreUrls,
  fileChangeFindActiveIndex,
  fileChangeFindNavigationRequestId,
  fileChangeFindQuery,
  onFileChangeFindMatchCountChange,
  onCloseCodeViewer,
  onCloseGit,
  onActivateTab,
  onReorderTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onReopenClosedTab,
  onOpenBrowserTab,
  onOpenWhiteboard,
  onOpenDeveloperTools,
  onOpenTerminalTab,
  onOpenRepoWiki,
  onOpenReviewTab,
  onOpenSelectionSideConversation,
  onRevealGitFileInTree,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenSubagentSession,
  onRefreshGit,
  onBrowserNavigationRequestHandled,
  onBrowserUrlChange,
  onBrowserPageMetadataChange,
  onSelectGitSource,
  mobileOverlay = false,
  mobileStacked = false,
}: SidePanelProps) {
  const { intl } = useIntlContext();
  const developerToolsEnabled = useDeveloperToolsEnabled();
  const isMobileTextInputViewport = useIsMobileTextInputViewport();

  // 原 le/ue：不可见也保持挂载（浏览器后台驻留）
  const keepMounted = !isVisible;
  const collapsible = !isVisible;
  const disabled = !isVisible;
  const workspaceKey = workspaceIdentity?.trim() || workspaceAbsPath;

  const rawTabs = sidePaneState?.tabs ?? EMPTY_TABS;
  // browser-use 截图 surface 请求（原 SWt 钩子 + xWt 匹配）
  const screenshotSurfaceRequest = useScreenshotSurfaceRequest(rawTabs);
  const matchedSurfaceTab = screenshotSurfaceRequest ? findBrowserUseTabForSurface(rawTabs, screenshotSurfaceRequest) : undefined;

  // 作用域内可见标签（工作区×属主任务）
  const visibleTabs = React.useMemo(() => visibleTabsForOwner(rawTabs, { workspaceKey, ownerTaskId: sidePaneOwnerId }), [sidePaneOwnerId, rawTabs, workspaceKey]);

  // 激活标签回退：当前激活不在可见集 → 可见集最后一个
  const stateActiveTabId = sidePaneState?.activeTabId ?? "";
  const activeTabId = visibleTabs.some((tab) => tab.id === stateActiveTabId) ? stateActiveTabId : (visibleTabs.at(-1)?.id ?? "");

  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const tabsViewportRef = React.useRef<HTMLDivElement | null>(null);
  const tabsContentRef = React.useRef<HTMLDivElement | null>(null);
  const [fixedWidthPx, setFixedWidthPx] = React.useState<number | null>(null);
  const shouldMount = shouldKeepPanelMounted(isVisible, rawTabs);
  const [mounted, setMounted] = React.useState(shouldMount);
  const [isResizeSettling, setIsResizeSettling] = React.useState(false);
  const [scrollShadows, setScrollShadows] = React.useState(NO_SCROLL_SHADOWS);
  const [draggingTabId, setDraggingTabId] = React.useState<string | null>(null);

  const visibleInlineSizePx = usePanelVisibleInlineSize(panelElementRef, mounted);
  const resizeSettling = useResizeSettling(mounted);
  const openSettleTimer = React.useRef<number | null>(null);
  const prevVisible = React.useRef(isVisible);
  const panelSizing = resolveSidePanePanelSizing({ mobileOverlay });

  const hasReviewTab = visibleTabs.some((tab) => tab.type === "git");
  const canOpenSelectionChat = canOpenSelectionSideConversation({ activeTaskId, isMobileTextInputViewport, mobileOverlay });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setDraggingTabId(String(event.active.id));
  };
  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    setDraggingTabId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderTab(String(active.id), String(over.id));
  };
  const handleDragCancel = () => {
    setDraggingTabId(null);
  };

  /** 原 Ue：面板首次展开的缺省宽 = 父容器宽 × 0.45 */
  const measureDefaultWidth = () => {
    const parent = panelElementRef.current?.parentElement;
    const width = Math.round(parent?.getBoundingClientRect().width ?? 0);
    return !Number.isFinite(width) || width <= 0 ? null : Math.round(width * PANEL_DEFAULT_WIDTH_RATIO);
  };

  // 原 182611–182643：挂载保持 + 展开/收起时的定宽占位（防内容抖动 200ms）
  React.useEffect(() => {
    if (shouldMount) setMounted(true);
  }, [shouldMount]);
  React.useEffect(() => {
    const wasVisible = prevVisible.current;
    prevVisible.current = isVisible;
    if (openSettleTimer.current !== null) {
      window.clearTimeout(openSettleTimer.current);
      openSettleTimer.current = null;
    }
    if (wasVisible && !isVisible) {
      // 收起：记住当前宽，避免下次展开闪缩
      const width = Math.round(panelElementRef.current?.getBoundingClientRect().width ?? 0);
      setFixedWidthPx(width > 0 ? width : null);
      return;
    }
    if (!wasVisible && isVisible) {
      // 展开：无测量值则用缺省宽，200ms 后释放
      setFixedWidthPx((prev) => prev ?? measureDefaultWidth());
      openSettleTimer.current = window.setTimeout(() => {
        setFixedWidthPx(null);
        openSettleTimer.current = null;
      }, PANEL_OPEN_SETTLE_MS);
    }
  }, [isVisible, panelElementRef]);
  React.useEffect(
    () => () => {
      if (openSettleTimer.current !== null) window.clearTimeout(openSettleTimer.current);
    },
    [],
  );
  const fixedWidthStyle = fixedWidthPx === null ? undefined : { width: `${fixedWidthPx}px` };

  // 原 182644–182698：标签条横滚状态 → ⊞ 按钮位置 + 双侧渐隐遮罩
  React.useEffect(() => {
    const viewport = tabsViewportRef.current;
    const content = tabsContentRef.current;
    if (!viewport || !content) {
      setIsResizeSettling(false);
      setScrollShadows((prev) => (prev.left || prev.right ? NO_SCROLL_SHADOWS : prev));
      return;
    }
    const update = () => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const addTrigger = viewport.parentElement?.querySelector("[data-side-pane-add-tab-trigger]");
      const addTriggerWidth = addTrigger?.getBoundingClientRect().width ?? 0;
      const overflowing = isTabBarOverflowing({
        addButtonInside: !!(addTrigger && content.contains(addTrigger)),
        addButtonWidth: addTriggerWidth,
        tabCount: visibleTabs.length,
        viewportWidth: viewport.clientWidth,
      });
      setIsResizeSettling(overflowing);
      setScrollShadows((prev) => {
        const next = { left: overflowing && viewport.scrollLeft > 1, right: overflowing && viewport.scrollLeft < maxScroll - 1 };
        return prev.left === next.left && prev.right === next.right ? prev : next;
      });
    };
    let frame: number | null = null;
    const initial = update;
    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(() => {
          frame = null;
          initial();
        });
      }
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    if (typeof ResizeObserver > "u") {
      window.addEventListener("resize", schedule);
      return () => {
        viewport.removeEventListener("scroll", update);
        window.removeEventListener("resize", schedule);
        if (frame !== null) cancelAnimationFrame(frame);
      };
    }
    const observer = new ResizeObserver(() => {
      schedule();
    });
    observer.observe(viewport);
    observer.observe(content);
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [visibleTabs]);

  // 原 182699–182721：激活标签平滑滚入视野
  React.useEffect(() => {
    const viewport = tabsViewportRef.current;
    const content = tabsContentRef.current;
    if (!activeTabId || !viewport || !content) return;
    let frame = requestAnimationFrame(() => {
      const chip = Array.from(content.querySelectorAll("[data-side-pane-tab-id]")).find((node) => (node as HTMLElement).dataset.sidePaneTabId === activeTabId);
      if (!chip) return;
      const viewportRect = viewport.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      const overflowLeft = chipRect.left - viewportRect.left;
      const overflowRight = chipRect.right - viewportRect.right;
      if (overflowLeft < 0) {
        viewport.scrollBy({ left: overflowLeft, behavior: "smooth" });
        return;
      }
      if (overflowRight > 0) viewport.scrollBy({ left: overflowRight, behavior: "smooth" });
    });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [activeTabId, visibleTabs]);

  /* --- ⊞ 新增标签下拉（原 Ge，js 182722–182803） --- */
  const addTabMenu = (
    <DropdownMenu open={addMenuOpen} onOpenChange={setAddMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-md"
          className="shrink-0"
          data-side-pane-add-trigger=""
          data-side-pane-add-tab-trigger=""
          aria-label={intl.formatMessage({ id: "sidePane.addTab" })}
        >
          <IconPlus className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canOpenSelectionChat ? (
          <DropdownMenuItem data-side-pane-add-item="selection-side-conversation" onSelect={onOpenSelectionSideConversation}>
            <IconMessageSquareText className="size-4" />
            <span>{intl.formatMessage({ id: "sidePane.selectionChat" })}</span>
          </DropdownMenuItem>
        ) : null}
        {hasReviewTab ? null : (
          <DropdownMenuItem
            onSelect={() => {
              onOpenReviewTab();
            }}
          >
            <IconFileDiff className="size-4" />
            <span>{intl.formatMessage({ id: "sidePane.review" })}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem data-side-pane-add-item="terminal" onSelect={() => onOpenTerminalTab()}>
          <IconSquareTerminal className="size-4" />
          <span>{intl.formatMessage({ id: "terminal.title" })}</span>
        </DropdownMenuItem>
        {supportsEmbeddedBrowser ? (
          <DropdownMenuItem data-side-pane-add-item="browser" onSelect={() => onOpenBrowserTab()}>
            <IconGlobe className="size-4" />
            <span>{intl.formatMessage({ id: "browser.title" })}</span>
          </DropdownMenuItem>
        ) : null}
        {developerToolsEnabled ? (
          <DropdownMenuItem
            onSelect={() => {
              onOpenDeveloperTools();
            }}
          >
            <IconBug className="size-4" />
            <span>{intl.formatMessage({ id: "developerTools.title" })}</span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /* --- 空态四宫格（原 Ke/qe/Je，js 182804–182891） --- */
  const emptyStateOptionsById: Record<EmptyStateTabOptionId, { id: EmptyStateTabOptionId; label: string; icon: React.FC<IconProps>; onOpen: () => void }> = {
    "selection-side-conversation": {
      id: "selection-side-conversation",
      label: intl.formatMessage({ id: "sidePane.selectionChat" }),
      icon: IconMessageSquareText,
      onOpen: onOpenSelectionSideConversation,
    },
    review: {
      id: "review",
      label: intl.formatMessage({ id: "sidePane.review" }),
      icon: IconFileDiff,
      onOpen: onOpenReviewTab,
    },
    terminal: {
      id: "terminal",
      label: intl.formatMessage({ id: "terminal.title" }),
      icon: IconSquareTerminal,
      onOpen: onOpenTerminalTab,
    },
    browser: {
      id: "browser",
      label: intl.formatMessage({ id: "browser.title" }),
      icon: IconGlobe,
      onOpen: onOpenBrowserTab,
    },
    "developer-tools": {
      id: "developer-tools",
      label: intl.formatMessage({ id: "developerTools.title" }),
      icon: IconBug,
      onOpen: onOpenDeveloperTools,
    },
  };
  const emptyStateOptions = resolveEmptyStateTabOptions({
    canOpenSelectionSideConversation: canOpenSelectionChat,
    developerToolsEnabled,
    hasReviewTab,
    supportsEmbeddedBrowser,
  }).map((id) => emptyStateOptionsById[id]);

  const emptyStateView = (
    <div className="side-pane-open-tab-shell flex h-full min-h-0 flex-col bg-background">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10">
        <div className="side-pane-open-tab-content flex w-full max-w-[20rem] flex-col gap-5">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-xl font-semibold leading-7 text-foreground">{intl.formatMessage({ id: "sidePane.openTab" })}</h2>
            <p className="text-ui-base leading-5 text-foreground-subtle">{intl.formatMessage({ id: "sidePane.openTabDescription" })}</p>
          </div>
          <div className="side-pane-open-tab-list flex w-full flex-col gap-2">
            {emptyStateOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  data-side-pane-open-tab-item={option.id}
                  className="side-pane-open-tab-button flex h-12 min-w-0 items-center gap-3 rounded-xl bg-surface px-3 text-ui-base font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={option.onOpen}
                >
                  <OptionIcon className="size-4 text-foreground-subtle" />
                  <span className="side-pane-open-tab-button-label min-w-0 flex-1 truncate text-left">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* --- 标签总览按钮（原 Ye） --- */
  const tabOverview = (
    <SidePaneTabOverview
      tabs={visibleTabs}
      activeTabId={activeTabId}
      recentClosedTabs={recentClosedSidePaneTabs}
      labels={{
        title: intl.formatMessage({ id: "sidePane.tabOverview" }),
        searchPlaceholder: intl.formatMessage({ id: "sidePane.searchTabs" }),
        openTabs: intl.formatMessage({ id: "sidePane.openTabs" }),
        recentlyClosedTabs: intl.formatMessage({ id: "sidePane.recentlyClosedTabs" }),
        noResults: intl.formatMessage({ id: "sidePane.noTabsFound" }),
        closeTab: (title) => intl.formatMessage({ id: "sidePane.closeTab" }, { title }),
        relativeTime: (timestamp) => formatRelativeTime(timestamp, intl),
        browserTitle: intl.formatMessage({ id: "browser.title" }),
        reviewTitle: intl.formatMessage({ id: "sidePane.review" }),
        codeViewerTitle: intl.formatMessage({ id: "codeViewer.title" }),
        treemappingTitle: intl.formatMessage({ id: "treemapping.title" }),
        whiteboardTitle: intl.formatMessage({ id: "whiteboard.title" }),
        modelTrajectoryTitle: intl.formatMessage({ id: "modelTrajectory.title" }),
        repoWikiTitle: intl.formatMessage({ id: "repoWiki.title" }),
        developerToolsTitle: intl.formatMessage({ id: "developerTools.title" }),
        terminalTitle: intl.formatMessage({ id: "terminal.title" }),
        subagentTypeLabel: intl.formatMessage({ id: "sidePane.subagent" }),
        subagentDirectoryTitle: intl.formatMessage({ id: "sidePane.subagentDirectory" }),
        selectionChatTitle: intl.formatMessage({ id: "sidePane.selectionChat" }),
        planTitle: intl.formatMessage({ id: "planTool.panel.planTab" }),
      }}
      onActivateTab={onActivateTab}
      onCloseTab={onCloseTab}
      onReopenClosedTab={onReopenClosedTab}
    />
  );

  const draggingTab = draggingTabId ? (visibleTabs.find((tab) => tab.id === draggingTabId) ?? null) : null;

  /* --- 面板主体（原 Ze，js 182922–183213） --- */
  const panelBody = (
    <div aria-hidden={!isVisible} className={cn("h-full", mobileStacked && "max-md:!w-full")} style={mobileOverlay ? undefined : fixedWidthStyle}>
      <ScopedErrorBoundary scope="workspace-side-pane" resetKeys={[workspaceKey, activeTabId]} variant="panel" className="h-full">
        {mounted && sidePaneState ? (
          <>
            {visibleTabs.length === 0 ? emptyStateView : null}
            <div className={cn("h-full min-h-0", visibleTabs.length === 0 && !screenshotSurfaceRequest && "hidden")}>
              <Tabs value={activeTabId} onValueChange={onActivateTab} className="relative h-full gap-0">
                <TabsList className={cn("flex justify-start w-full rounded-none p-0 border-0 border-b border-border bg-transparent shadow-none !h-12 overflow-hidden")}>
                  <div className="flex items-center justify-start flex-1 min-w-0">
                    <div className="flex h-full shrink-0 items-center p-2 pl-3">{tabOverview}</div>
                    {/* dnd 标签条：横向滚动 + 双侧渐隐遮罩 + 拖拽重排 */}
                    <DndContextShim sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
                      <div
                        ref={tabsViewportRef}
                        data-side-pane-tabs-viewport=""
                        className={cn(
                          "min-w-0 flex-1 overflow-x-auto !scrollbar-hide h-12 items-center",
                          scrollShadows.left &&
                            scrollShadows.right &&
                            "[mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_calc(100%-16px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_calc(100%-16px),transparent_100%)]",
                          scrollShadows.left &&
                            !scrollShadows.right &&
                            "[mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_100%)]",
                          !scrollShadows.left &&
                            scrollShadows.right &&
                            "[mask-image:linear-gradient(to_right,black_0%,black_calc(100%-16px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_calc(100%-16px),transparent_100%)]",
                        )}
                      >
                        <div ref={tabsContentRef} data-side-pane-tabs-content="" className="flex w-full gap-2 py-2.5">
                          <SortableContext items={visibleTabs.map((tab) => tab.id)} strategy={rectSortingStrategy}>
                            {visibleTabs.map((tab) => {
                              const title = resolveSidePaneTabTitle(tab, intl.formatMessage);
                              return (
                                <SidePaneTabChip
                                  key={tab.id}
                                  tab={tab}
                                  title={title}
                                  closeTabLabel={intl.formatMessage({ id: "sidePane.closeTab" }, { title })}
                                  closeTabMenuLabel={intl.formatMessage({ id: "sidePane.closeCurrentTab" })}
                                  closeOtherTabsLabel={intl.formatMessage({ id: "sidePane.closeOtherTabs" })}
                                  closeAllTabsLabel={intl.formatMessage({ id: "sidePane.closeAllTabs" })}
                                  diffBadgeLabel={intl.formatMessage({ id: "diff.title" })}
                                  isActive={tab.id === activeTabId}
                                  onActivateTab={onActivateTab}
                                  onCloseTab={onCloseTab}
                                  onCloseOtherTabs={onCloseOtherTabs}
                                  onCloseAllTabs={onCloseAllTabs}
                                  canCloseOtherTabs={visibleTabs.length > 1}
                                />
                              );
                            })}
                          </SortableContext>
                          {/* ⊞ 新增标签：溢出时收进滚动区尾部 */}
                          {isResizeSettling ? null : addTabMenu}
                        </div>
                      </div>
                      <DragOverlay dropAnimation={null}>
                        {draggingTab ? <SidePaneTabChipDragOverlay tab={draggingTab} title={resolveSidePaneTabTitle(draggingTab, intl.formatMessage)} diffBadgeLabel={intl.formatMessage({ id: "diff.title" })} /> : null}
                      </DragOverlay>
                    </DndContextShim>
                    {/* ⊞ 新增标签：不溢出时固定在标签栏右端 */}
                    <div className="ml-auto flex h-full shrink-0 items-center gap-1 pl-2 pr-3">{isResizeSettling ? addTabMenu : null}</div>
                  </div>
                </TabsList>
                {/* 内容区分派（14 型） */}
                <div className="relative min-h-0 flex-1 isolate">
                  {rawTabs.map((tab) =>
                    (tab.type === "browser" || tab.type === "browser-use") && !isBrowserTabResident(tab as BrowserTab | BrowserUseTab) ? (
                      <SuspendedBrowserTabPlaceholder key={tab.id} tab={tab as BrowserTab | BrowserUseTab} />
                    ) : tab.type === "browser-use" ? (
                      <BrowserUseView
                        key={tab.id}
                        tab={tab}
                        isPanelVisible={isVisible}
                        isSelected={tab.id === activeTabId}
                        isCurrentTask={tab.sessionId === sidePaneOwnerId}
                        screenshotSurfaceRequest={matchedSurfaceTab?.id === tab.id ? screenshotSurfaceRequest : null}
                        initialUrl={tab.residency === "restoring" ? undefined : browserRestoreUrls[tab.id]}
                        workspacePath={workspaceAbsPath}
                        workspaceIdentity={workspaceIdentity}
                        remoteSessionId={tab.remoteSessionId ?? workspaceRemoteSessionId}
                        residencyGeneration={tab.residencyGeneration}
                        onUrlChange={(url) => onBrowserUrlChange(tab.id, url)}
                        onPageMetadataChange={(metadata) => onBrowserPageMetadataChange(tab.id, metadata)}
                      />
                    ) : (
                      <TabsContent key={tab.id} value={tab.id} forceMount className="relative z-10 h-full min-h-0 bg-background data-[state=inactive]:hidden">
                        {tab.type === "subagent-session" ? (
                          <SubagentSessionTabContent
                            tab={tab}
                            focused={isVisible && tab.id === activeTabId}
                            onOpenBrowserUrl={onOpenBrowserUrl}
                            onOpenCodeViewer={onOpenCodeViewer}
                            onOpenFileLink={onOpenFileLink}
                            onOpenSubagentSession={onOpenSubagentSession}
                          />
                        ) : tab.type === "subagent-directory" ? (
                          <SubagentDirectoryTabContent tab={tab} onOpenSubagentSession={onOpenSubagentSession} />
                        ) : tab.type === "selection-side-chat" ? (
                          <SelectionSideChatTabContent
                            tab={tab}
                            focused={isVisible && tab.id === activeTabId}
                            onOpenBrowserUrl={onOpenBrowserUrl}
                            onOpenCodeViewer={onOpenCodeViewer}
                            onOpenFileLink={onOpenFileLink}
                            onUnavailable={onCloseTab}
                          />
                        ) : tab.type === "plan-detail" ? (
                          <PlanDetailTabContent tab={tab} onOpenBrowserUrl={onOpenBrowserUrl} onOpenCodeViewer={onOpenCodeViewer} onOpenFileLink={onOpenFileLink} />
                        ) : tab.type === "code-viewer" ? (
                          <CodeViewerPanel
                            source={tab.source}
                            onClose={onCloseCodeViewer}
                            workspacePath={workspaceAbsPath}
                            onOpenBrowserUrl={onOpenBrowserUrl}
                            onOpenCodeViewer={onOpenCodeViewer}
                            renderHeavyContent={shouldRenderHeavyContent({
                              isActiveTab: tab.id === activeTabId,
                              isMobileOverlay: mobileOverlay,
                              isResizeSettling: resizeSettling,
                              isSidePaneVisible: isVisible,
                              visibleInlineSizePx: visibleInlineSizePx,
                            })}
                          />
                        ) : tab.type === "git" ? (
                          <GitChangesPanel
                            workspacePath={workspaceAbsPath}
                            workspaceIdentity={workspaceIdentity}
                            workspaceRemoteSessionId={workspaceRemoteSessionId}
                            gitState={gitState}
                            isDesktop={isDesktop}
                            selectedSourceId={activeGitSourceId}
                            fileChangeFindActiveIndex={fileChangeFindActiveIndex}
                            fileChangeFindNavigationRequestId={fileChangeFindNavigationRequestId}
                            fileChangeFindQuery={fileChangeFindQuery}
                            onFileChangeFindMatchCountChange={onFileChangeFindMatchCountChange}
                            onSelectSource={onSelectGitSource}
                            onClose={onCloseGit}
                            onRefresh={onRefreshGit}
                            onRevealFileInTree={onRevealGitFileInTree}
                          />
                        ) : tab.type === "treemapping" ? (
                          <TreemappingView activeTaskId={activeTaskId} workspacePath={workspaceAbsPath} workspaceIdentity={workspaceIdentity} source={tab.source ?? { kind: "current" }} />
                        ) : tab.type === "whiteboard" ? (
                          <WhiteboardCanvas workspacePath={workspaceAbsPath} workspaceIdentity={workspaceIdentity} boardId={tab.boardId} />
                        ) : tab.type === "model-trajectory" ? (
                          <ModelTrajectoryView taskId={tab.taskId} title={tab.title} workspacePath={workspaceAbsPath} workspaceIdentity={workspaceIdentity} onClose={() => onCloseTab(tab.id)} />
                        ) : tab.type === "repo-wiki" ? (
                          <RepoWikiView workspacePath={workspaceAbsPath} workspaceIdentity={workspaceIdentity} onOpenCodeViewer={onOpenCodeViewer} />
                        ) : tab.type === "developer-tools" ? (
                          <DeveloperToolsView workspacePath={workspaceAbsPath} workspaceIdentity={workspaceIdentity} taskId={activeTaskId} />
                        ) : tab.type === "terminal" ? (
                          <TerminalPanel
                            services={services}
                            cwd={tab.cwd ?? workspaceAbsPath}
                            isVisible={isVisible && tab.id === activeTabId}
                            isWindowsDesktop={isWindowsDesktop}
                            onOpenBrowserUrl={onOpenBrowserUrl}
                          />
                        ) : (
                          <BrowserView
                            browserKey={tab.id}
                            isResidencyRestore={(tab as BrowserTab).residency === "restoring"}
                            isVisible={isVisible && isBrowserOpen && tab.id === activeTabId}
                            isSelected={tab.id === activeTabId}
                            isCurrentTask={tab.ownerTaskId === sidePaneOwnerId}
                            initialUrl={(tab as BrowserTab).residency === "restoring" ? undefined : (browserRestoreUrls[tab.id] ?? (tab as BrowserTab).initialUrl)}
                            faviconUrl={(tab as BrowserTab).faviconUrl}
                            workspacePath={workspaceAbsPath}
                            workspaceIdentity={workspaceIdentity}
                            remoteSessionId={tab.remoteSessionId ?? workspaceRemoteSessionId}
                            residencyGeneration={(tab as BrowserTab).residencyGeneration}
                            sessionId={tab.ownerTaskId ?? "unscoped"}
                            onUrlChange={(url) => onBrowserUrlChange(tab.id, url)}
                            onPageMetadataChange={(metadata) => onBrowserPageMetadataChange(tab.id, metadata)}
                            navigationRequest={browserNavigationRequest?.targetTabId === tab.id ? { id: browserNavigationRequest.id, url: browserNavigationRequest.url } : null}
                            onNavigationRequestHandled={onBrowserNavigationRequestHandled}
                          />
                        )}
                      </TabsContent>
                    ),
                  )}
                </div>
              </Tabs>
            </div>
          </>
        ) : mounted ? (
          emptyStateView
        ) : null}
      </ScopedErrorBoundary>
    </div>
  );

  /* --- 外壳：桌面可拖拽 Panel / 移动端裸容器（原 183214–183258） --- */
  return panelSizing.useResizablePanel ? (
    <>
      {isVisible ? <PanelResizeHandle className={mobileStacked ? "max-md:hidden" : undefined} /> : null}
      <Panel
        id="browser"
        panelRef={panelRef}
        elementRef={panelElementRef}
        defaultSize={panelSizing.defaultSize}
        minSize={panelSizing.minSize}
        maxSize={panelSizing.maxSize}
        collapsedSize={panelSizing.collapsedSize}
        collapsible={collapsible}
        disabled={disabled}
        className={cn(
          "border-l border-border transition-opacity duration-200 ease-out",
          mobileOverlay && "max-md:!h-full max-md:!w-full max-md:!min-w-0 max-md:!max-w-none max-md:!flex-1 max-md:!basis-auto max-md:border-l",
          mobileStacked && !mobileOverlay && "max-md:!h-[min(45dvh,24rem)] max-md:!w-full max-md:!min-w-0 max-md:!max-w-none max-md:!flex-none max-md:!basis-auto max-md:border-l-0 max-md:border-t",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {panelBody}
      </Panel>
    </>
  ) : (
    <div
      // 原实现直接把 elementRef 挂到容器 div（非 Panel 形态）
      ref={(node) => {
        (panelElementRef as { current: HTMLDivElement | null }).current = node;
      }}
      aria-hidden={!isVisible}
      className={cn("h-full w-full min-w-0 border-l border-border bg-background transition-opacity duration-200 ease-out", isVisible ? "opacity-100" : "pointer-events-none opacity-0")}
    >
      {panelBody}
    </div>
  );
}

/** dnd-kit DndContext（原 _Z，js 93473）——vendored 库，此处仅保留应用面接口 */
declare const DndContextShim: React.FC<{
  sensors: unknown;
  collisionDetection?: unknown;
  onDragStart: (event: { active: { id: string | number } }) => void;
  onDragEnd: (event: { active: { id: string | number }; over: { id: string | number } | null }) => void;
  onDragCancel: () => void;
  children: React.ReactNode;
}>;

/* ============================================================================
 * 11. 入口登记（⊞ / 快捷键 / quickpick panels 段）
 * ----------------------------------------------------------------------------
 * 侧面板有三类入口，全部在代码中定位（装配现场属 F05/F07/TopBar 族，
 * 此处按原样转录命令表与快捷键逻辑，便于改造时检索）：
 *
 *  A. ⊞ 新增标签按钮：本文件 addTabMenu（data-side-pane-add-tab-trigger，
 *     aria-label=sidePane.addTab）。菜单项 = resolveEmptyStateTabOptions 的
 *     同源五项（辅助对话/审查/终端/浏览器/开发者工具），与空态四宫格共用
 *     同一可见性谓词。
 *
 *  B. 快捷键（原 rge，js 24021–24078 / jsx 20683）：
 *     - Ctrl/⌘+K、Ctrl/⌘+Shift+P  打开命令面板（quickPick）
 *     - Ctrl/⌘+F                   任务内查找
 *     - Ctrl/⌘+Shift+[ / ]         上一/下一个会话
 *     - Ctrl/⌘+B                   切换侧栏
 *     - Ctrl/⌘+J                   切换底部终端
 *     - Ctrl/⌘+Alt+B               切换右侧面板收起/展开（toggleSidePane）
 *     - Ctrl/⌘+[ / ]               导航后退/前进
 *     文案标签由工作区根控制器计算（原 XJt js 186258–186263）：
 *       R=$i('B')  z=$i('N')  B=$i('[')  V=$i(']')  H=$i('J')
 *       ee=Vre('B')  → toggleSidePaneShortcutLabel = “Ctrl+Alt+B”（Mac ⌥⌘B）
 *     会话头右侧的侧面板开关按钮（sidePane.togglePanel，激活 !bg-selected）
 *     已抽取于 TopBar.tsx 的 SessionHeaderRight（原 SFt，js 143462）。
 *
 *  C. quickpick panels 段（原 O_e，js 25394–25520 / jsx 22073–22074）：
 *     段序 D_e = [suggested, chat, navigation, panels, configure, app]；
 *     panels 段 6 条命令（标题 i18n 值见 IntlProvider 词典）：
 *       toggle-sidebar   切换侧边栏      icon=sidebarClose/Open  shortcut=Ctrl+B
 *       toggle-terminal  切换终端        icon=terminal           shortcut=Ctrl+J
 *       toggle-preview   切换预览        icon=browser（仅 supportsEmbeddedBrowser）
 *       add-terminal-tab 添加终端标签    → handleOpenTerminalTab
 *       add-browser-tab  添加浏览器标签  → handleOpenBrowserTab（仅 supportsEmbeddedBrowser）
 *       add-review-tab   添加审查标签    → handleOpenGit（原 Sn=()=>Fe()，js 186553）
 *     命令执行链：Rje(命令面板, F05) → nPt 执行 → XJt handlers（js 186780–186806）
 *       → Boe 的 handle*（本文件 useSidePaneState）。
 * ==========================================================================*/

/** 原 D_e（js 25394）：quickPick 段序 */
export const QUICK_PICK_SECTION_ORDER = ["suggested", "chat", "navigation", "panels", "configure", "app"] as const;
export type QuickPickSectionId = (typeof QUICK_PICK_SECTION_ORDER)[number];

export interface QuickPickCommand {
  id: string;
  sectionId: QuickPickSectionId;
  titleId: string;
  icon: string;
  shortcut?: string;
  keywords: string[];
  disabled?: boolean;
  run: () => void;
}

/** 原 O_e 的 panels 段部分（js 25433–25502；suggested/configure/app 段属 F05，未展开）。
 *  与侧面板相关的 6 条命令逐字转录。 */
export function buildSidePanelQuickPickCommands(args: {
  isSidebarVisible: boolean;
  supportsEmbeddedBrowser?: boolean;
  shortcuts: { toggleSidebar: string; toggleTerminal: string };
  handlers: {
    toggleSidebar: () => void;
    toggleTerminal: () => void;
    togglePreview: () => void;
    openTerminalTab: () => void;
    openBrowserTab: () => void;
    openReviewTab: () => void;
  };
}): QuickPickCommand[] {
  const supportsEmbeddedBrowser = args.supportsEmbeddedBrowser ?? true;
  return [
    {
      id: "toggle-sidebar",
      sectionId: "panels",
      titleId: "quickPick.command.toggleSidebar",
      icon: args.isSidebarVisible ? "sidebarClose" : "sidebarOpen",
      shortcut: args.shortcuts.toggleSidebar,
      keywords: ["sidebar", "left sidebar", "toggle sidebar", "侧栏", "侧边栏", "切换侧栏"],
      run: args.handlers.toggleSidebar,
    },
    {
      id: "toggle-terminal",
      sectionId: "panels",
      titleId: "quickPick.command.toggleTerminal",
      icon: "terminal",
      shortcut: args.shortcuts.toggleTerminal,
      keywords: ["terminal", "shell", "console", "终端"],
      run: args.handlers.toggleTerminal,
    },
    ...(supportsEmbeddedBrowser
      ? [
          {
            id: "toggle-preview",
            sectionId: "panels" as const,
            titleId: "quickPick.command.togglePreview",
            icon: "browser",
            keywords: ["preview", "browser", "web", "show", "hide", "预览", "浏览器", "网页", "显示", "隐藏"],
            run: args.handlers.togglePreview,
          },
        ]
      : []),
    {
      id: "add-terminal-tab",
      sectionId: "panels",
      titleId: "quickPick.command.addTerminalTab",
      icon: "terminal",
      keywords: ["add", "terminal", "tab", "new terminal", "添加终端", "终端标签"],
      run: args.handlers.openTerminalTab,
    },
    ...(supportsEmbeddedBrowser
      ? [
          {
            id: "add-browser-tab",
            sectionId: "panels" as const,
            titleId: "quickPick.command.addBrowserTab",
            icon: "browser",
            keywords: ["add", "browser", "tab", "preview", "添加浏览器", "浏览器标签"],
            run: args.handlers.openBrowserTab,
          },
        ]
      : []),
    {
      id: "add-review-tab",
      sectionId: "panels",
      titleId: "quickPick.command.addReviewTab",
      icon: "diff",
      keywords: ["add", "review", "diff", "changes", "添加审查", "审查标签", "变更"],
      run: args.handlers.openReviewTab,
    },
  ];
}

/** 原 rge（js 24021–24078 / jsx 20683）：全局键盘快捷键。
 *  capture 阶段监听 window keydown；忽略 repeat 与 IME 组词。 */
export function useGlobalShortcuts(handlers: {
  openQuickPick: () => void;
  find: () => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  /** Ctrl/⌘+Alt+B → 右侧面板收起/展开 */
  toggleSidePane: () => void;
  previousConversation?: () => void;
  nextConversation?: () => void;
  navBack?: (() => void) | null;
  navForward?: (() => void) | null;
}): void {
  const { openQuickPick, find, toggleSidebar, toggleTerminal, toggleSidePane, previousConversation, nextConversation, navBack, navForward } = handlers;
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.isComposing) return;
      if (isPrimaryShortcut(event, "k") || isShiftShortcut(event, "p")) {
        event.preventDefault();
        openQuickPick();
        return;
      }
      if (isPrimaryShortcut(event, "f")) {
        event.preventDefault();
        find();
        return;
      }
      if (isShiftShortcut(event, "[")) {
        if (!previousConversation) return;
        event.preventDefault();
        previousConversation();
        return;
      }
      if (isShiftShortcut(event, "]")) {
        if (!nextConversation) return;
        event.preventDefault();
        nextConversation();
        return;
      }
      if (isPrimaryShortcut(event, "b")) {
        event.preventDefault();
        toggleSidebar();
        return;
      }
      if (isPrimaryShortcut(event, "j")) {
        event.preventDefault();
        toggleTerminal();
        return;
      }
      if (isAltShortcut(event, "b")) {
        event.preventDefault();
        toggleSidePane();
        return;
      }
      if (isPrimaryShortcut(event, "[")) {
        if (!navBack) return;
        event.preventDefault();
        navBack();
        return;
      }
      if (isPrimaryShortcut(event, "]")) {
        if (!navForward) return;
        event.preventDefault();
        navForward();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [openQuickPick, find, toggleSidebar, toggleTerminal, toggleSidePane, previousConversation, nextConversation, navBack, navForward]);
}

/* ============================================================================
 * 12. 装配现场备忘（工作区根 → 壳 → 侧面板 的接线，属 F07，行号供查证）
 * ----------------------------------------------------------------------------
 *  XJt（工作区根控制器，js 186219）：
 *    - js 186306–186355：调用 useSidePaneState(Boe)，解构全部 handle*；
 *    - js 186532–186557：_n=()=>qe()（toggleSidePane 落点）、xn/Me/Sn 等
 *      只读门包装（de = workspaceReadOnlyReason 存在时禁用）；
 *    - js 186753–186761：rge 全局快捷键接线（toggleSidePane: () => vn(_n)）；
 *    - js 186780–186806：O_e quickpick 命令表（panels 段 handlers）；
 *    - js 186928：toggleSidePaneShortcutLabel: ee（=Vre('B')）下发给壳。
 *  yJt（WorkspaceShell，js 183896）：
 *    - js 184666–184676：Tr = 辅助对话入口 —— woe(_oe(workspaceKey, activeTaskId))
 *      聚焦主会话控制器触发框选（无可用控制器时 warn「辅助对话入口没有可用的主会话控制器」）；
 *    - js 184677–184729：Er = (opts) => <xqt …/> 实例化本文件 SidePanel，
 *      mobileOverlay/mobileStacked 双形态（Dr=Er() 桌面；移动端覆盖层另挂）。
 *  SFt（SessionHeaderRight，TopBar.tsx 已抽取）：侧面板开关按钮 +
 *    tooltip(sidePane.togglePanel, shortcut=toggleSidePaneShortcutLabel)。
 * ==========================================================================*/
