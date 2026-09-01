/* ============================================================================
 * SplitLayoutUiDeep.tsx —— A1-R3：v4 分屏表现层（PTt 域）逐字重建
 * ----------------------------------------------------------------------------
 * 属主：styles-CdEGpc2x.js（md5 48d71d48…）js 121301–121372 + 121722–122305 +
 *       122820–123136 + 123139–123193（RTt…HTt）+ 151164–151184（PRt）+
 *       155248–155280（Lzt/Rzt）（jsx 孪生无此表现层跨度，行号以 js 为准）。
 *
 * 立模块自裁说明（任务项 1「并入 SplitLayoutDeep.tsx 或立新模块」）：
 *   立新模块。SplitLayoutDeep.tsx 为纯逻辑域（无 React UI、无 Conversation 依赖），
 *   而 PTt 域必须渲染 R0=ConversationPane（./Conversation）。Conversation.tsx 经
 *   ./stores-session（A1-R3 起为 SplitLayoutDeep 的 re-export shim）值依赖
 *   SplitLayoutDeep——若把 PTt 域并入 SplitLayoutDeep，则成
 *   Conversation → stores-session → SplitLayoutDeep → Conversation 运行期环。
 *
 * 环安全头注证明（值 import 闭包，/tmp/a1r0/ring-check-r3.py 实测）：
 *   本模块值依赖 = { ./SplitLayoutDeep, ./Conversation, ./services, ./SrcSharedB,
 *   ./UtilsCn, ./logger, ./GitReview(type), ./ConversationLeaves(type),
 *   ./MarkdownIntegration(type), ./SidePanel(type), ./WorkspaceShell(type) }。
 *   Conversation.tsx 值闭包（85 文件）不含 components/shell/WorkspaceShell.tsx 与
 *   modules/WorkspaceShell.tsx；SplitLayoutDeep/services/SrcSharedB 闭包同不含。
 *   唯一反向边为 Conversation.tsx:131 与本文件对 ./WorkspaceShell 的 type-only
 *   import（编译期擦除，tsc 型环无害；先例：Conversation.tsx A0-CLEANUP3 #36）。
 *   故 WorkspaceShell(shell) → 本模块 → Conversation 为单向链，无运行期环。
 *
 * B5 体例：顶层名语义化 + 下表映射；函数体局部名保留混淆形；型别按调用面归纳。
 *
 *   混淆 → 语义 → js 行
 *   ─────────────────────────────────────────────────────────────────────
 *   c2   → SPLIT_CSS_VAR_PREFIX            (121722)
 *   Mwt  → ROOT_PANE_RECT                  (121723)
 *   l2   → flattenPaneNode                 (121724)
 *   Nwt  → flattenPaneTree                 (121772)
 *   Pwt  → paneRectStyle                   (121777)
 *   Fwt  → dividerStyle                    (121783)
 *   u2   → SESSION_DRAG_MIME               (121804)
 *   d2   → sessionDragFallbackPayload      (121805，模块内态，经函数面暴露)
 *   Iwt  → serializeSessionDragPayload     (121806)
 *   Lwt  → setSessionDragFallbackPayload   (121808)
 *   Rwt  → clearSessionDragFallbackPayload (121810)
 *   zwt  → dataTransferHasSessionPayload   (121812)
 *   Bwt  → isPlainObject                   (121814)
 *   Vwt  → parseSessionDragPayload         (121816)
 *   f2   → dropSideAtPoint                 (121841)
 *   p2   → dropTargetRegistry              (121853，模块内态)
 *   m2   → activeDropPreviewTarget         (121854，模块内态)
 *   h2   → clearDropPreview                (121855)
 *   Hwt  → findDropTargetAt                (121858)
 *   Uwt  → registerDropTarget              (121866)
 *   Wwt  → previewSessionDropAt            (121875)
 *   Gwt  → commitSessionDropAt             (121880)
 *   Kwt  → cancelSessionDropPreview        (121883)
 *   qwt  → DROP_HIGHLIGHT_STYLE            (121886)
 *   Jwt  → INACTIVE_PANE_OVERLAY_STYLE     (121890)
 *   Ywt  → dropSideOverlayClass            (121896)
 *   Xwt  → PaneFrame                       (121909)
 *   Zwt  → RestoredSessionWatcher          (121966)
 *   Qwt  → workspaceBadgeOf                (121999)
 *   $wt  → SplitPaneHost                   (122003)
 *   eTt  → selectionSideChatSessionIdForPane (122198)
 *   tTt  → SplitDivider                    (122201)
 *   PTt  → ConversationOrchestrator        (122820)
 *   FTt  → SidebarSessionDropContext       (123120)
 *   ITt  → SidebarSessionDropProvider      (123121)
 *   LTt  → useSidebarSessionDrop           (123136)
 *   owt  → StackedConversationPane         (121301)
 *   ── A1-R4 增补（拖放源侧 + last-session 域）──
 *   PRt  → createSessionDragPreview        (151164)
 *   Lzt  → dragPointerPositionOf           (155248)
 *   Rzt  → trackSessionDragPointer         (155253)
 *   RTt  → LAST_SESSION_STORAGE_PREFIX     (123139)
 *   j2   → lastSessionStorageKey           (123140)
 *   zTt  → readLastSessionId               (123143)
 *   BTt  → writeLastSessionId              (123150)
 *   VTt  → isLastSessionRestorable         (123155)
 *   HTt  → useLastSessionRestore           (123158)
 *   （UTt 123194 属主在 components/shell/Home.tsx useRemoteWorkspaceEnabled，不重复）
 *
 *   跨域改指（真实 import，无新 declare）：
 *   s2→splitLayoutStore | A2→sessionRouterStore | B0→MAIN_PANE_ID |
 *   G0→PRIMARY_PANE_LEAF | H0→clampSplitRatio | U0→workspaceScopeKey |
 *   Z0→focusedPaneId | T2→paneBindingById | E2→focusedGroupBinding |
 *   dTt→closeGroupPane | ATt→canOpenSessionInSplit | jTt→openSessionInSplit |
 *   NTt→toPersistableSessionBinding（以上 ./SplitLayoutDeep，A1-R2 重建）
 *   R0→ConversationPane（./Conversation）| DT→PanelScopeProvider |
 *   wFe→V4ConversationProvider | fs→useServices | VS→acquireSessionIndexStore |
 *   HS→releaseSessionIndexStore（./services）| qr→joinTestidParts |
 *   Hte→v4PaneShellTestid | Er→v4SplitDividerTestid（./SrcSharedB）|
 *   Z→cn（./UtilsCn）| J→logger（./logger）
 *
 * 型注（型别宽化，各就其位）：
 *   - PanelScopeProvider 之 TelemetryScope.workspaceIdentity 宽化为 string | null
 *     （services/telemetryScopes.tsx 行注；本域 $wt 传入面含 null 语义，其内部
 *     读取均以 ?.trim()/?? 防御，零行为差）。
 *   - ConversationPaneProps 四处收敛（Conversation.tsx 行注）：+onSessionDeleted、
 *     onDropTargetControllerChange 收窄、onOpenSubagentDirectory 宽化（连带
 *     components/shell/TopBar.tsx 两面）、onSyncSubagentSessionTabs 收窄——皆
 *     bundle 调用面真形（js 122166-122196 透传面 + js 119615 包装面）。
 *   - onOpenSelectionSideChat / onOpenPlanDetail 链保 unknown：bundle R0 内
 *     en（js 119645–119695）/wlt（js 98818）包装面本地未转录，且与壳层处理面
 *     （workspacePath 必具）互斥，全链收敛留独立批次；壳层渲染点各一边界注。
 * ==========================================================================*/

import * as React from "react";
import {
  MAIN_PANE_ID,
  PRIMARY_PANE_LEAF,
  clampSplitRatio,
  workspaceScopeKey,
  focusedPaneId,
  paneBindingById,
  focusedGroupBinding,
  closeGroupPane,
  canOpenSessionInSplit,
  openSessionInSplit,
  toPersistableSessionBinding,
  isReloadNavigationEntry,
  splitLayoutStore,
  sessionRouterStore,
  type PaneNode,
  type PaneBinding,
  type PaneWorkspaceScope,
  type SessionBinding,
} from "./SplitLayoutDeep"; // 原 s2/A2/B0/G0/H0/U0/Z0/T2/E2/dTt/ATt/jTt/NTt（A1-R2 重建）+ z0（A1-R4：HTt 消费）
import { ConversationPane } from "./Conversation"; // 原 R0（js 119236）
import { PanelScopeProvider, V4ConversationProvider, useServices, acquireSessionIndexStore, releaseSessionIndexStore } from "./services"; // 原 DT/wFe/fs/VS/HS
import { joinTestidParts, v4PaneShellTestid, v4SplitDividerTestid } from "./SrcSharedB"; // 原 qr/Hte/Er
import { cn } from "./UtilsCn"; // 原 Z（utils-CEEH0K_K.js）
import { t as logger } from "./logger"; // 原 J
import { type GitSummary } from "./GitReview"; // GitSummary 属主（components/code-viewer/GitReview.tsx 定义，modules/GitReview.tsx 转手）
import { type OpenCodeViewerFn } from "./ConversationLeaves"; // A0-D canonical
import { type FileLinkModel } from "./MarkdownIntegration"; // A0-D canonical
import { type SubagentOpenRequest } from "./SidePanel"; // A0-CLEANUP3 #36 canonical
import { type PrimaryDraftDropTargetController } from "./WorkspaceShell"; // type-only：同 Conversation.tsx:131 先例（编译期擦除，无运行期环）

/* ============================================================================
 * §0. 型别（按 bundle 调用面归纳）
 * ==========================================================================*/

/** 面板矩形（百分比/calc 表达式面，c2 变量合成）。 */
export interface PaneRect {
  left: string;
  top: string;
  width: string;
  height: string;
}

/** 展平叶描述（Nwt 返回面）。 */
export interface LeafDescriptor {
  paneId: string;
  rect: PaneRect;
}

/** 展平分隔条描述（Nwt 返回面；tTt 定位用）。 */
export interface DividerDescriptor {
  splitId: string;
  direction: `row` | `column`;
  ratio: number;
  regionFraction: number;
  boundary: string;
  crossStart: string;
  crossLength: string;
}

/** 会话拖放载荷（Vwt 解析面 = NTt 扁平面 + kind 印）。 */
export interface SessionDragPayload {
  kind: `zcode/session`;
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sessionId: string;
}

/** 投放方位（f2 返回面）。 */
export type DropSide = `left` | `right` | `up` | `down`;

/** 投放目标控制器（Uwt 注册面）。 */
export interface DropTargetController {
  canDrop?(payload: SessionDragPayload): boolean;
  onPreview(side: DropSide | null): void;
  onDrop(side: DropSide, payload: SessionDragPayload): void;
}

/** 投放目标条目（p2 集合元）。 */
export interface DropTargetEntry {
  controller: DropTargetController;
  element: HTMLElement;
}

/** 侧栏会话投放目标（FTt/ITt/LTt 载荷面 = NTt 返回同形，js 151680 构造面）。 */
export type SidebarSessionDropTarget = {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sessionId: string;
};

/** 侧栏会话投放上下文值（原 FTt 默认面）。 */
export interface SidebarSessionDropValue {
  enabled: boolean;
  canOpenSession(target: SidebarSessionDropTarget): boolean;
  openSession(target: SidebarSessionDropTarget): void;
}

/** 分隔条拖动态（tTt 内 s.current 面）。 */
interface DividerDragState {
  pointerId: number;
  regionPx: number;
  startClient: number;
  startRatio: number;
  latestClient: number;
  rafId: number | null;
}

/** 面板壳 props（PTt 之 xe useMemo 面 → $wt 之 c → R0 透传面）。
 *  型注：各回调形与 ConversationPaneProps 对应面收敛后同形（Conversation.tsx
 *  A1-R3 行注）；onOpenSelectionSideChat 保 unknown（见文件头型注）。 */
export interface PaneShellProps {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  compactForRemoteControl: boolean;
  readOnly: boolean;
  sessionId: string | null;
  activeSessionId: string | null;
  activeSelectionSideChatSessionId: string | null;
  provider?: string;
  onSessionCreated?: (sessionId: string, groupedDraftTask?: unknown) => void;
  onSessionDeleted?: () => void;
  draftComposerHeader?: React.ReactNode;
  onPrimaryDraftDropTargetControllerChange?: (controller: PrimaryDraftDropTargetController | null) => void;
  gitSummary?: GitSummary | null;
  gitDirtyFileCount?: number | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary: unknown;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: "mini" | "panel" | "auto" | null) => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenSubagentSession?: (session: SubagentOpenRequest) => void;
  onOpenSubagentDirectory?: (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => void;
  onSyncSubagentSessionTabs?: (req: { rootSessionId: string; parentSessionId: string; validChildSessionIds: string[] }) => void;
  onOpenSelectionSideChat?: (reference: unknown) => void;
  /** 型注：plan 链保 unknown——bundle wlt（js 98818）构造面 {parentSessionId,
   *  toolCallId, markdown, planFilePath?} 与 WorkspaceShell 处理面（含
   *  workspacePath 必具）互斥，全链收敛留独立批次；R0 prop 面 (plan?: unknown)
   *  同形透传，渲染点单处边界注。 */
  onOpenPlanDetail?: (plan?: unknown) => void;
  conversationFindQuery: string;
  conversationFindActiveIndex: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { taskId?: string; requestId?: number; query?: string; snippet?: string; snippetIndex?: number; [key: string]: unknown } | null;
  onSearchResultHighlightDone?: (requestId: number) => void;
}

/** 会话编排器 props（原 PTt 解构面；WorkspaceShell 渲染点 3580 调用面）。 */
export interface ConversationOrchestratorProps {
  workspacePath: string;
  workspaceIdentity?: string;
  readOnly?: boolean;
  remoteSessionId?: string;
  compactForRemoteControl?: boolean;
  sessionId: string | null;
  activeSelectionSideChatSessionId?: string | null;
  provider?: string;
  onSessionCreated?: (sessionId: string, groupedDraftTask?: unknown) => void;
  onSessionDeleted?: () => void;
  draftComposerHeader?: React.ReactNode;
  onPrimaryDraftDropTargetControllerChange?: (controller: PrimaryDraftDropTargetController | null) => void;
  gitSummary?: GitSummary | null;
  gitDirtyFileCount?: number | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary?: unknown;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: "mini" | "panel" | "auto" | null) => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onPaneActiveSessionChange?: (scope: PaneWorkspaceScope, sessionId: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenSubagentSession?: (session: SubagentOpenRequest) => void;
  onOpenSubagentDirectory?: (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => void;
  onSyncSubagentSessionTabs?: (req: { rootSessionId: string; parentSessionId: string; validChildSessionIds: string[] }) => void;
  onOpenSelectionSideChat?: (reference: unknown) => void;
  onOpenPlanDetail?: (plan?: unknown) => void; // 型注：同 PaneShellProps.onOpenPlanDetail（plan 链 unknown 收口）
  conversationFindQuery?: string;
  conversationFindActiveIndex?: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { taskId?: string; requestId?: number; query?: string; snippet?: string; snippetIndex?: number; [key: string]: unknown } | null;
  onSearchResultHighlightDone?: (requestId: number) => void;
}

/** 堆叠会话面板 props（原 owt 解构面；WorkspaceShell 渲染点 3266 调用面）。 */
export interface StackedConversationPaneProps {
  workspacePath: string;
  workspaceIdentity?: string;
  readOnly?: boolean;
  compactForRemoteControl?: boolean;
  sessionId: string | null;
  provider?: string;
  onSessionCreated?: (sessionId: string, groupedDraftTask?: unknown) => void;
  onSessionDeleted?: () => void;
  draftComposerHeader?: React.ReactNode;
  gitSummary?: GitSummary | null;
  gitDirtyFileCount?: number | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary?: unknown;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: "mini" | "panel" | "auto" | null) => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenSubagentSession?: (session: SubagentOpenRequest) => void;
  onOpenSubagentDirectory?: (req: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; rootSessionId?: string; parentSessionId: string }) => void;
  onSyncSubagentSessionTabs?: (req: { rootSessionId: string; parentSessionId: string; validChildSessionIds: string[] }) => void;
  onOpenPlanDetail?: (plan?: unknown) => void; // 型注：同 PaneShellProps.onOpenPlanDetail（plan 链 unknown 收口）
  conversationFindQuery?: string;
  conversationFindActiveIndex?: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { taskId?: string; requestId?: number; query?: string; snippet?: string; snippetIndex?: number; [key: string]: unknown } | null;
  onSearchResultHighlightDone?: (requestId: number) => void;
}

/* ============================================================================
 * §1. 布局几何（js 121722–121800）
 * ==========================================================================*/

/** 原 c2：分割比 CSS 变量前缀（tTt 拖动写、根容器 style 读）。 */
export const SPLIT_CSS_VAR_PREFIX = `--v4-split-`;

/** 原 Mwt：根面板矩形（全幅）。 */
export const ROOT_PANE_RECT: PaneRect = { left: `0%`, top: `0%`, width: `100%`, height: `100%` };

/** 原 l2：递归展平面板树（叶入 i、分隔条入 a；ratio 经 CSS 变量表达式传递）。 */
function flattenPaneNode(e: PaneNode, t: PaneRect, n: number, r: number, i: LeafDescriptor[], a: DividerDescriptor[]): void {
  if (e.type === `leaf`) {
    i.push({ paneId: e.paneId, rect: t });
    return;
  }
  let o = `var(${SPLIT_CSS_VAR_PREFIX}${e.id}, ${e.ratio})`;
  if (e.direction === `row`) {
    let s = `(${t.left}) + (${t.width}) * ${o}`;
    (a.push({
      splitId: e.id,
      direction: `row`,
      ratio: e.ratio,
      regionFraction: n,
      boundary: s,
      crossStart: t.top,
      crossLength: t.height,
    }),
      flattenPaneNode(e.first, { ...t, width: `(${t.width}) * ${o}` }, n * e.ratio, r, i, a),
      flattenPaneNode(
        e.second,
        { ...t, left: s, width: `(${t.width}) * (1 - ${o})` },
        n * (1 - e.ratio),
        r,
        i,
        a,
      ));
    return;
  }
  let s = `(${t.top}) + (${t.height}) * ${o}`;
  (a.push({
    splitId: e.id,
    direction: `column`,
    ratio: e.ratio,
    regionFraction: r,
    boundary: s,
    crossStart: t.left,
    crossLength: t.width,
  }),
    flattenPaneNode(e.first, { ...t, height: `(${t.height}) * ${o}` }, n, r * e.ratio, i, a),
    flattenPaneNode(
      e.second,
      { ...t, top: s, height: `(${t.height}) * (1 - ${o})` },
      n,
      r * (1 - e.ratio),
      i,
      a,
    ));
}

/** 原 Nwt：展平面板树为叶 + 分隔条。 */
export function flattenPaneTree(e: PaneNode): { leaves: LeafDescriptor[]; dividers: DividerDescriptor[] } {
  let t: LeafDescriptor[] = [],
    n: DividerDescriptor[] = [];
  return (flattenPaneNode(e, ROOT_PANE_RECT, 1, 1, t, n), { leaves: t, dividers: n });
}

/** 原 Pwt：面板矩形 → 绝对定位样式。 */
export function paneRectStyle(e: PaneRect): React.CSSProperties {
  return {
    left: `calc(${e.left})`,
    top: `calc(${e.top})`,
    width: `calc(${e.width})`,
    height: `calc(${e.height})`,
  };
}

/** 原 Fwt：分隔条描述 → 绝对定位样式（row 竖条 / column 横条）。 */
export function dividerStyle(e: DividerDescriptor): React.CSSProperties {
  return e.direction === `row`
    ? {
        left: `calc(${e.boundary})`,
        top: `calc(${e.crossStart})`,
        height: `calc(${e.crossLength})`,
        width: `9px`,
        transform: `translateX(-50%)`,
      }
    : {
        top: `calc(${e.boundary})`,
        left: `calc(${e.crossStart})`,
        width: `calc(${e.crossLength})`,
        height: `9px`,
        transform: `translateY(-50%)`,
      };
}

/* ============================================================================
 * §2. 会话拖放协议（js 121804–121838）
 * ==========================================================================*/

/** 原 u2：会话拖放 MIME。 */
export const SESSION_DRAG_MIME = `application/x-zcode-session`;

/** 原 d2：dataTransfer 不可读时的兜底载荷（模块内态；经 Lwt/Rwt/Vwt 暴露）。 */
let sessionDragFallbackPayload: SessionDragPayload | null = null;

/** 原 Iwt：序列化拖放载荷。 */
export function serializeSessionDragPayload(e: SessionDragPayload): string {
  return JSON.stringify(e);
}

/** 原 Lwt：设置兜底载荷（dragstart 时与 setData 同写）。 */
export function setSessionDragFallbackPayload(e: SessionDragPayload): void {
  sessionDragFallbackPayload = e;
}

/** 原 Rwt：清除兜底载荷（dragend）。 */
export function clearSessionDragFallbackPayload(): void {
  sessionDragFallbackPayload = null;
}

/** 原 zwt：dataTransfer 是否含会话载荷。 */
export function dataTransferHasSessionPayload(e: DataTransfer): boolean {
  return Array.from(e.types ?? []).includes(SESSION_DRAG_MIME);
}

/** 原 Bwt：是否普通对象。 */
export function isPlainObject(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/** 原 Vwt：解析会话拖放载荷（dataTransfer 不可读时回落兜底；形状校验失败 → null）。
 *  行注：n 为 unknown 记录面，typeof 守卫后字段读取经 `as string` 收窄
 *  （三元条件内收窄不穿透，非 any）。 */
export function parseSessionDragPayload(e: DataTransfer): SessionDragPayload | null {
  if (!dataTransferHasSessionPayload(e)) return null;
  try {
    let t = e.getData(SESSION_DRAG_MIME);
    if (!t) return sessionDragFallbackPayload;
    let n = JSON.parse(t);
    return !isPlainObject(n) ||
      n.kind !== `zcode/session` ||
      typeof n.workspacePath != `string` ||
      typeof n.sessionId != `string`
      ? null
      : {
          kind: `zcode/session`,
          workspacePath: n.workspacePath as string,
          workspaceIdentity: typeof n.workspaceIdentity == `string` ? n.workspaceIdentity : void 0,
          remoteSessionId: typeof n.remoteSessionId == `string` ? n.remoteSessionId : void 0,
          sessionId: n.sessionId as string,
        };
  } catch {
    return null;
  }
}

/* ============================================================================
 * §3. 投放目标注册表（js 121841–121908）
 * ==========================================================================*/

/** 原 f2：点相对矩形的最近投放方位（≤0.32 边距，否则 null）。
 *  行注：方位-距离对列经 `as Array<[DropSide, number]>` 收窄（字面量即 DropSide）。 */
export function dropSideAtPoint(e: DOMRect, t: number, n: number): DropSide | null {
  if (e.width <= 0 || e.height <= 0) return null;
  let r = (t - e.left) / e.width,
    i = (n - e.top) / e.height;
  if (r < 0 || r > 1 || i < 0 || i > 1) return null;
  let [a, o] = (
    [
      [`left`, r],
      [`right`, 1 - r],
      [`up`, i],
      [`down`, 1 - i],
    ] as Array<[DropSide, number]>
  ).reduce((e, t) => (t[1] < e[1] ? t : e));
  return o <= 0.32 ? a : null;
}

/** 原 p2：投放目标注册表（模块内态）。 */
const dropTargetRegistry = new Set<DropTargetEntry>();

/** 原 m2：当前预览中的投放目标（模块内态）。 */
let activeDropPreviewTarget: DropTargetEntry | null = null;

/** 原 h2：清除当前投放预览。 */
export function clearDropPreview(): void {
  (activeDropPreviewTarget?.controller.onPreview(null), (activeDropPreviewTarget = null));
}

/** 原 Hwt：按坐标查找可投放目标（canDrop 过滤 + 方位判定）。 */
export function findDropTargetAt(e: SessionDragPayload, t: number, n: number): { side: DropSide; target: DropTargetEntry } | null {
  for (let r of dropTargetRegistry) {
    if (r.controller.canDrop && !r.controller.canDrop(e)) continue;
    let i = dropSideAtPoint(r.element.getBoundingClientRect(), t, n);
    if (i) return { side: i, target: r };
  }
  return null;
}

/** 原 Uwt：注册投放目标（返回注销函数）。 */
export function registerDropTarget(e: HTMLElement, t: DropTargetController): () => void {
  let n = { controller: t, element: e };
  return (
    dropTargetRegistry.add(n),
    () => {
      (activeDropPreviewTarget === n && clearDropPreview(), dropTargetRegistry.delete(n));
    }
  );
}

/** 原 Wwt：预览投放（目标切换时先清旧预览）。 */
export function previewSessionDropAt(e: SessionDragPayload, t: number, n: number): boolean {
  let r = findDropTargetAt(e, t, n);
  return r
    ? (activeDropPreviewTarget !== r.target && (clearDropPreview(), (activeDropPreviewTarget = r.target)), r.target.controller.onPreview(r.side), !0)
    : (clearDropPreview(), !1);
}

/** 原 Gwt：提交投放。 */
export function commitSessionDropAt(e: SessionDragPayload, t: number, n: number): boolean {
  let r = findDropTargetAt(e, t, n);
  return (clearDropPreview(), r ? (r.target.controller.onDrop(r.side, e), !0) : !1);
}

/** 原 Kwt：取消投放预览。 */
export function cancelSessionDropPreview(): void {
  clearDropPreview();
}

/** 原 qwt：投放高亮覆盖层样式。 */
export const DROP_HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: `color-mix(in oklab, var(--color-brand) 14%, transparent)`,
  boxShadow: `inset 0 0 0 1px color-mix(in oklab, var(--color-brand) 34%, transparent)`,
};

/** 原 Jwt：非聚焦面板遮罩样式。 */
export const INACTIVE_PANE_OVERLAY_STYLE: React.CSSProperties = {
  backgroundColor: `color-mix(in oklab, var(--color-background) 34%, transparent)`,
  backdropFilter: `brightness(0.94) saturate(0.94)`,
};

/** 原 Ywt：投放方位 → 覆盖层 tailwind 类。 */
export function dropSideOverlayClass(e: DropSide): string {
  switch (e) {
    case `left`:
      return `left-1 top-1 bottom-1 w-1/2`;
    case `right`:
      return `right-1 top-1 bottom-1 w-1/2`;
    case `up`:
      return `left-1 right-1 top-1 h-1/2`;
    case `down`:
      return `left-1 right-1 bottom-1 h-1/2`;
  }
}

/* ============================================================================
 * §4. 面板容器 / 会话面板宿主（js 121909–122198）
 * ==========================================================================*/

interface PaneFrameProps {
  containerRef: React.Ref<HTMLDivElement>;
  paneId: string;
  focused: boolean;
  showFocusIndicator: boolean;
  onFocusRequest: (paneId: string) => void;
  style: React.CSSProperties;
  dropSide: DropSide | null;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  restoredUnvalidated?: boolean;
}

/** 原 Xwt：面板框（聚焦环 + 非聚焦遮罩 + 投放高亮 + 指针/拖放事件捕获）。 */
export const PaneFrame = React.memo(function ({
  containerRef: e,
  paneId: t,
  focused: n,
  showFocusIndicator: r,
  onFocusRequest: i,
  style: a,
  dropSide: o,
  onDragOver: s,
  onDragLeave: c,
  onDrop: l,
  children: u,
  restoredUnvalidated: d = !1,
}: PaneFrameProps) {
  let f = React.useCallback(() => {
    i(t);
  }, [i, t]);
  return (
    <div
      ref={e}
      data-testid={joinTestidParts(v4PaneShellTestid, t)}
      data-pane-id={t}
      data-focused={n ? `true` : `false`}
      data-restored-unvalidated={d ? `true` : `false`}
      onPointerDownCapture={f}
      onFocusCapture={f}
      onDragOver={s}
      onDragLeave={c}
      onDrop={l}
      style={a}
      className={cn(
        `absolute flex min-h-0 min-w-0 flex-col`,
        r && n && `ring-1 ring-inset ring-[var(--color-brand)]`,
      )}
    >
      {r && !n ? (
        <div
          aria-hidden="true"
          data-v4-pane-inactive-overlay="true"
          style={INACTIVE_PANE_OVERLAY_STYLE}
          className="pointer-events-none absolute inset-0 z-30 rounded-md transition-[background-color,backdrop-filter]"
        />
      ) : null}
      {o ? (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div
            aria-hidden="true"
            style={DROP_HIGHLIGHT_STYLE}
            className={cn(`absolute rounded-md transition-[background-color,box-shadow]`, dropSideOverlayClass(o))}
          />
        </div>
      ) : null}
      {u}
    </div>
  );
});

interface RestoredSessionWatcherProps {
  paneId: string;
  scope: PaneWorkspaceScope;
  sessionId: string;
  onConfirmed: (paneId: string) => void;
  onMissing: (paneId: string) => void;
}

/** 原 Zwt：恢复会话校验监视器（会话索引 store 就绪后核对会话存在性，
 *  确认 → onConfirmed，缺失 → onMissing；卸载释放引用计数）。 */
function RestoredSessionWatcher({ paneId: e, scope: t, sessionId: n, onConfirmed: r, onMissing: i }: RestoredSessionWatcherProps) {
  let a = useServices().zcodeAgentService,
    { workspacePath: o, workspaceIdentity: s, remoteSessionId: c } = t;
  return (
    React.useEffect(() => {
      if (!a) return;
      let t = {
          workspaceKey: workspaceScopeKey({ workspacePath: o, workspaceIdentity: s }),
          workspacePath: o,
          ...(s ? { workspaceIdentity: s } : {}),
          ...(c ? { endpointKey: c } : {}),
        },
        l = acquireSessionIndexStore(t, a),
        u = !1,
        d = !1,
        f = () => {
          u ||
            d ||
            l.getState().workspaceId === null ||
            ((d = !0), l.getSessions().some((e) => e.sessionId === n) ? r(e) : i(e));
        },
        p = l.subscribe(f);
      return (
        f(),
        () => {
          ((u = !0), p(), releaseSessionIndexStore(t, l));
        }
      );
    }, [a, e, n, o, s, c, r, i]),
    null
  );
}

/** 原 Qwt：工作区徽标（跨工作区面板角标面）。 */
export function workspaceBadgeOf(e: PaneWorkspaceScope): { label: string; workspacePath: string; remote: boolean } {
  return {
    label: e.workspacePath.split(/[\\/]/).filter(Boolean).pop() ?? e.workspacePath,
    workspacePath: e.workspacePath,
    remote: !!(e.workspaceIdentity || e.remoteSessionId),
  };
}

/** 原 eTt：面板选区侧栏会话 id 解析（仅活动面板且会话一致时透传）。 */
export function selectionSideChatSessionIdForPane(e: string | null, t: string | null, n: string | null): string | null {
  return e && e === t ? (n ?? null) : null;
}

interface SplitPaneHostProps {
  paneId: string;
  rect: PaneRect;
  focused: boolean;
  showFocusIndicator: boolean;
  canSplit: boolean;
  shellWorkspaceKey: string;
  binding: PaneBinding | null;
  primaryBinding: SessionBinding | null;
  shell: PaneShellProps;
  onFocusRequest: (paneId: string) => void;
  /** bundle 122040-122044：C/w 按 onSplit(paneId, `row`|`column`, scope) 调用 */
  onSplit?: (paneId: string, direction: `row` | `column`, workspaceScope: PaneWorkspaceScope) => void;
  onClosePane: (paneId: string) => void;
  onConfirmRestoredSession: (paneId: string) => void;
  onBindSession: (paneId: string, sessionId: string) => boolean;
  onPaneActiveSessionChange?: (scope: PaneWorkspaceScope, sessionId: string) => void;
  canDropSession?: (payload: SessionDragPayload) => boolean;
  onDropSession?: (paneId: string, side: DropSide, payload: SessionDragPayload) => void;
}

/** 原 $wt：会话面板宿主——单叶面板的绑定解析 + 拖放投放 + R0 装配。
 *  主面板（workspace-main）承载 shell 草稿/活动会话；副面板按 binding 渲染。 */
function SplitPaneHost({
  paneId: e,
  rect: t,
  focused: n,
  showFocusIndicator: r,
  canSplit: i,
  shellWorkspaceKey: a,
  binding: o,
  primaryBinding: s,
  shell: c,
  onFocusRequest: l,
  onSplit: u,
  onClosePane: d,
  onConfirmRestoredSession: f,
  onBindSession: p,
  onPaneActiveSessionChange: m,
  canDropSession: h,
  onDropSession: g,
}: SplitPaneHostProps) {
  let [_, v] = React.useState<DropSide | null>(null),
    y = e === MAIN_PANE_ID,
    b = y && !!s,
    x = React.useMemo<PaneWorkspaceScope>(
      () =>
        !y && o
          ? o.workspaceScope
          : y && s
            ? s.workspaceScope
            : {
                workspacePath: c.workspacePath,
                ...(c.workspaceIdentity ? { workspaceIdentity: c.workspaceIdentity } : {}),
                ...(c.remoteSessionId ? { remoteSessionId: c.remoteSessionId } : {}),
              },
      [y, o, s, c.workspacePath, c.workspaceIdentity, c.remoteSessionId],
    ),
    S = React.useMemo(() => paneRectStyle(t), [t]),
    C = React.useCallback(() => {
      u?.(e, `row`, x);
    }, [u, e, x]),
    w = React.useCallback(() => {
      u?.(e, `column`, x);
    }, [u, e, x]),
    T = React.useCallback(() => {
      d(e);
    }, [d, e]),
    E = React.useCallback(() => {
      if (b) {
        (T(), c.onSessionDeleted?.());
        return;
      }
      if (y) {
        c.onSessionDeleted?.();
        return;
      }
      T();
    }, [T, b, y, c.onSessionDeleted]),
    D = React.useCallback(
      (t: string) => {
        p(e, t) !== !1 && m?.(x, t);
      },
      [p, m, e, x],
    ),
    O = React.useCallback(
      (t: string) => {
        if (y && !s) {
          (p(e, t), c.onSessionCreated?.(t));
          return;
        }
        D(t);
      },
      [D, y, p, e, s, c.onSessionCreated],
    ),
    k = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        if (!g || !i) return;
        let t = parseSessionDragPayload(e.dataTransfer);
        if (!t || (h && !h(t))) {
          v(null);
          return;
        }
        let n = dropSideAtPoint(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY);
        if (!n) {
          v(null);
          return;
        }
        (e.preventDefault(), e.stopPropagation(), (e.dataTransfer.dropEffect = `copy`), v(n));
      },
      [h, i, g],
    ),
    A = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
      let t = e.relatedTarget;
      (t instanceof Node && e.currentTarget.contains(t)) || v(null);
    }, []),
    j = React.useCallback(
      (t: React.DragEvent<HTMLDivElement>) => {
        if (!g || !i) {
          v(null);
          return;
        }
        let n = parseSessionDragPayload(t.dataTransfer),
          r = _ ?? dropSideAtPoint(t.currentTarget.getBoundingClientRect(), t.clientX, t.clientY);
        (v(null),
          !(!n || !r || (h && !h(n))) && (t.preventDefault(), t.stopPropagation(), g(e, r, n)));
      },
      [h, i, _, g, e],
    ),
    M = React.useRef<HTMLDivElement | null>(null),
    N = React.useCallback((e: HTMLDivElement | null) => {
      M.current = e;
    }, []);
  if (
    (React.useEffect(() => {
      let t = M.current;
      if (!(!t || !g || !i))
        return registerDropTarget(t, { canDrop: (e) => !h || h(e), onPreview: v, onDrop: (t, n) => g(e, t, n) });
    }, [h, i, g, e]),
    !y && !o)
  )
    return null;
  let P = workspaceScopeKey(x) === a,
    F = y ? (s?.sessionId ?? c.sessionId) : (o?.sessionId ?? null),
    I = !!((y ? s?.readOnly : o?.readOnly) || (P && c.readOnly)),
    L = P,
    R = F === c.searchResultHighlightRequest?.taskId ? c.searchResultHighlightRequest : null;
  return (
    <PaneFrame
      containerRef={N}
      paneId={e}
      focused={n}
      showFocusIndicator={r}
      onFocusRequest={l}
      style={S}
      dropSide={_}
      onDragOver={k}
      onDragLeave={A}
      onDrop={j}
      restoredUnvalidated={!!(y ? s : o)?.restoredUnvalidated}
    >
      <PanelScopeProvider scope={x}>
        {(y ? s : o)?.restoredUnvalidated && F ? (
          <RestoredSessionWatcher paneId={e} scope={x} sessionId={F} onConfirmed={f} onMissing={d} />
        ) : null}
        <ConversationPane
          paneId={e}
          readOnly={I}
          sessionId={F}
          activeSelectionSideChatSessionId={selectionSideChatSessionIdForPane(
            F,
            c.activeSessionId ?? c.sessionId,
            c.activeSelectionSideChatSessionId,
          )}
          workspacePath={x.workspacePath}
          workspaceIdentity={x.workspaceIdentity}
          remoteSessionId={x.remoteSessionId}
          compactForRemoteControl={c.compactForRemoteControl ?? !1}
          provider={y && P ? c.provider : void 0}
          onSessionCreated={O}
          onSessionDeleted={E}
          focused={n}
          onSplitRight={i && u ? C : void 0}
          onSplitDown={i && u ? w : void 0}
          onClosePane={y ? void 0 : T}
          workspaceBadge={!y && !P ? workspaceBadgeOf(x) : void 0}
          draftComposerHeader={y && !s ? c.draftComposerHeader : void 0}
          onDropTargetControllerChange={y && !s ? c.onPrimaryDraftDropTargetControllerChange : void 0}
          gitSummary={L ? c.gitSummary : void 0}
          gitDirtyFileCount={L ? c.gitDirtyFileCount : void 0}
          gitWorktreeReviewSourceId={L ? c.gitWorktreeReviewSourceId : void 0}
          gitWorktreeChangeSummary={L ? c.gitWorktreeChangeSummary : void 0}
          activeTaskChangeSummary={y ? c.activeTaskChangeSummary : void 0}
          summaryPanelVariantOverride={L ? c.summaryPanelVariantOverride : void 0}
          onSummaryPanelVariantOverrideChange={L ? c.onSummaryPanelVariantOverrideChange : void 0}
          onRefreshGit={L ? c.onRefreshGit : void 0}
          onOpenGitReview={L ? c.onOpenGitReview : void 0}
          onOpenBrowserUrl={c.onOpenBrowserUrl}
          onOpenAutomationsMain={c.onOpenAutomationsMain}
          onOpenCodeViewer={c.onOpenCodeViewer}
          onOpenFileLink={c.onOpenFileLink}
          onOpenSubagentSession={c.onOpenSubagentSession}
          onOpenSubagentDirectory={c.onOpenSubagentDirectory}
          onSyncSubagentSessionTabs={c.onSyncSubagentSessionTabs}
          onOpenSelectionSideChat={c.onOpenSelectionSideChat}
          onOpenPlanDetail={c.onOpenPlanDetail}
          conversationFindQuery={n ? c.conversationFindQuery : ``}
          conversationFindActiveIndex={n ? (c.conversationFindActiveIndex ?? -1) : -1}
          onConversationFindMatchStateChange={n ? c.onConversationFindMatchStateChange : void 0}
          searchResultHighlightRequest={R}
          onSearchResultHighlightDone={c.onSearchResultHighlightDone}
        />
      </PanelScopeProvider>
    </PaneFrame>
  );
}

/* ============================================================================
 * §5. 分割条（js 122201–122305）
 * ==========================================================================*/

interface SplitDividerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  splitId: string;
  direction: `row` | `column`;
  ratio: number;
  regionFraction: number;
  style: React.CSSProperties;
  onCommitRatio: (splitId: string, ratio: number) => void;
}

/** 原 tTt：分割条（指针拖动实时写 CSS 变量，抬手提交 ratio）。 */
export const SplitDivider = React.memo(function ({
  containerRef: e,
  splitId: t,
  direction: n,
  ratio: r,
  regionFraction: i,
  style: a,
  onCommitRatio: o,
}: SplitDividerProps) {
  let s = React.useRef<DividerDragState | null>(null),
    [c, l] = React.useState(!1),
    u = n === `row`,
    d = React.useCallback(
      (e: DividerDragState) =>
        e.regionPx <= 0
          ? e.startRatio
          : clampSplitRatio(e.startRatio + (e.latestClient - e.startClient) / e.regionPx),
      [],
    ),
    f = React.useCallback(
      (t: React.PointerEvent<HTMLDivElement>) => {
        if (t.button !== 0 && t.pointerType === `mouse`) return;
        let n = e.current;
        if (!n) return;
        t.preventDefault();
        try {
          t.currentTarget.setPointerCapture(t.pointerId);
        } catch {}
        let a = n.getBoundingClientRect(),
          o = u ? t.clientX : t.clientY;
        ((s.current = {
          pointerId: t.pointerId,
          regionPx: (u ? a.width : a.height) * i,
          startClient: o,
          startRatio: r,
          latestClient: o,
          rafId: null,
        }),
          l(!0));
      },
      [e, u, r, i],
    ),
    p = React.useCallback(
      (n: React.PointerEvent<HTMLDivElement>) => {
        let r = s.current;
        !r ||
          n.pointerId !== r.pointerId ||
          ((r.latestClient = u ? n.clientX : n.clientY),
          r.rafId === null &&
            (r.rafId = requestAnimationFrame(() => {
              ((r.rafId = null), e.current?.style.setProperty(`${SPLIT_CSS_VAR_PREFIX}${t}`, String(d(r))));
            })));
      },
      [e, u, d, t],
    ),
    m = React.useCallback(
      (n: React.PointerEvent<HTMLDivElement>) => {
        let r = s.current;
        if (!r || n.pointerId !== r.pointerId) return;
        (r.rafId !== null && (cancelAnimationFrame(r.rafId), (r.rafId = null)),
          (r.latestClient = u ? n.clientX : n.clientY));
        let i = d(r);
        (e.current?.style.setProperty(`${SPLIT_CSS_VAR_PREFIX}${t}`, String(i)),
          (s.current = null),
          l(!1),
          o(t, i));
      },
      [e, u, o, d, t],
    );
  return (
    React.useEffect(
      () => () => {
        let e = s.current;
        (e?.rafId != null && cancelAnimationFrame(e.rafId), (s.current = null));
      },
      [],
    ),
    (
      <div
        data-testid={v4SplitDividerTestid}
        data-split-id={t}
        role="separator"
        aria-orientation={u ? `vertical` : `horizontal`}
        data-dragging={c ? `true` : `false`}
        onPointerDown={f}
        onPointerMove={p}
        onPointerUp={m}
        onPointerCancel={m}
        style={a}
        className={cn(
          `group absolute z-10 touch-none select-none`,
          u ? `cursor-col-resize` : `cursor-row-resize`,
        )}
      >
        <div
          className={cn(
            `pointer-events-none transition-colors`,
            u ? `mx-auto h-full w-px` : `my-auto h-px w-full`,
            c
              ? `bg-[var(--color-brand)]`
              : `bg-[var(--color-border)] group-hover:bg-[var(--color-brand)]`,
          )}
        />
      </div>
    )
  );
});

/* ============================================================================
 * §6. 会话编排器（原 PTt，styles 122820–123119）
 * ----------------------------------------------------------------------------
 * v4 分屏的会话列装配环境：把分屏树（s2 store 或会话组 A2）展平成面板叶 +
 * 分隔条，为每叶渲染 SplitPaneHost。主面板（workspace-main）承载当前会话或
 * 草稿；草稿首次发送可提升为会话组（promotePaneLayoutToGroup）。远程远控
 * 模式（compactForRemoteControl）固定单面板。
 * ==========================================================================*/

export function ConversationOrchestrator({
  workspacePath: e,
  workspaceIdentity: t,
  readOnly: n = !1,
  remoteSessionId: r,
  compactForRemoteControl: i = !1,
  sessionId: a,
  activeSelectionSideChatSessionId: o = null,
  provider: s,
  onSessionCreated: c,
  onSessionDeleted: l,
  draftComposerHeader: u,
  onPrimaryDraftDropTargetControllerChange: d,
  gitSummary: f,
  gitDirtyFileCount: p,
  gitWorktreeReviewSourceId: m,
  gitWorktreeChangeSummary: h,
  activeTaskChangeSummary: g,
  summaryPanelVariantOverride: _,
  onSummaryPanelVariantOverrideChange: v,
  onRefreshGit: y,
  onOpenGitReview: b,
  onPaneActiveSessionChange: x,
  onOpenBrowserUrl: S,
  onOpenAutomationsMain: C,
  onOpenCodeViewer: w,
  onOpenFileLink: T,
  onOpenSubagentSession: E,
  onOpenSubagentDirectory: D,
  onSyncSubagentSessionTabs: O,
  onOpenSelectionSideChat: k,
  onOpenPlanDetail: A,
  conversationFindQuery: j = ``,
  conversationFindActiveIndex: M = -1,
  onConversationFindMatchStateChange: N,
  searchResultHighlightRequest: P,
  onSearchResultHighlightDone: F,
}: ConversationOrchestratorProps) {
  let I = t?.trim() || e,
    L = splitLayoutStore((e) => e.root),
    R = splitLayoutStore((e) => e.panes),
    z = splitLayoutStore((e) => focusedPaneId(e)),
    B = splitLayoutStore((e) => e.splitPane),
    V = splitLayoutStore((e) => e.closePane),
    H = splitLayoutStore((e) => e.confirmRestoredPaneSession),
    ee = splitLayoutStore((e) => e.focusPane),
    U = splitLayoutStore((e) => e.bindPaneSession),
    te = splitLayoutStore((e) => e.setSplitRatio),
    ne = splitLayoutStore((e) => e.resetToPrimaryPane),
    re = sessionRouterStore((e) => (i || !e.activeGroupId ? null : (e.groups[e.activeGroupId] ?? null))),
    ie = sessionRouterStore((e) => e.focusPane),
    ae = sessionRouterStore((e) => e.closePane),
    oe = sessionRouterStore((e) => e.confirmRestoredPaneSession),
    se = sessionRouterStore((e) => e.bindPaneSession),
    ce = sessionRouterStore((e) => e.setSplitRatio),
    le = sessionRouterStore((e) => e.promotePaneLayoutToGroup),
    ue = React.useRef<HTMLDivElement | null>(null),
    de = i ? PRIMARY_PANE_LEAF : (re?.root ?? L),
    fe: Record<string, PaneBinding> = i ? {} : (re?.panes ?? R),
    W = i ? MAIN_PANE_ID : (re?.focusedPaneId ?? z),
    pe = React.useMemo(() => flattenPaneTree(de), [de]),
    me = React.useMemo(
      () =>
        i || re || !a
          ? !1
          : Object.values(R).some((e) => e.sessionId === a && workspaceScopeKey(e.workspaceScope) === I),
      [re, i, R, a, I],
    )
      ? null
      : a,
    he = React.useMemo(() => {
      let e: Record<string, string> = {};
      for (let t of pe.dividers) e[`${SPLIT_CSS_VAR_PREFIX}${t.splitId}`] = String(t.ratio);
      return e;
    }, [pe]),
    ge = pe.leaves.length,
    _e = ge > 1,
    ve = ge < 4,
    ye = React.useMemo<PaneWorkspaceScope>(
      () => ({
        workspacePath: e,
        ...(t ? { workspaceIdentity: t } : {}),
        ...(r ? { remoteSessionId: r } : {}),
      }),
      [r, e, t],
    ),
    be = React.useMemo<SessionBinding | null>(() => (me ? { workspaceScope: ye, sessionId: me } : null), [me, ye]),
    xe = React.useMemo<PaneShellProps>(
      () => ({
        workspacePath: e,
        ...(t ? { workspaceIdentity: t } : {}),
        ...(r ? { remoteSessionId: r } : {}),
        compactForRemoteControl: i,
        readOnly: n,
        sessionId: me,
        activeSessionId: a,
        activeSelectionSideChatSessionId: o,
        provider: s,
        onSessionCreated: c,
        onSessionDeleted: l,
        draftComposerHeader: u,
        onPrimaryDraftDropTargetControllerChange: d,
        gitSummary: f,
        gitDirtyFileCount: p,
        gitWorktreeReviewSourceId: m,
        gitWorktreeChangeSummary: h,
        activeTaskChangeSummary: me ? g : null,
        summaryPanelVariantOverride: _,
        onSummaryPanelVariantOverrideChange: v,
        onRefreshGit: y,
        onOpenGitReview: b,
        onOpenBrowserUrl: S,
        onOpenAutomationsMain: C,
        onOpenCodeViewer: w,
        onOpenFileLink: T,
        onOpenSubagentSession: E,
        onOpenSubagentDirectory: D,
        onSyncSubagentSessionTabs: O,
        onOpenSelectionSideChat: k,
        onOpenPlanDetail: A,
        conversationFindQuery: j,
        conversationFindActiveIndex: M,
        onConversationFindMatchStateChange: N,
        searchResultHighlightRequest: P,
        onSearchResultHighlightDone: F,
      }),
      [
        e,
        t,
        r,
        i,
        n,
        me,
        o,
        s,
        c,
        l,
        u,
        d,
        f,
        p,
        m,
        h,
        g,
        _,
        v,
        y,
        b,
        S,
        C,
        w,
        T,
        E,
        D,
        O,
        k,
        A,
        j,
        M,
        N,
        P,
        F,
      ],
    ),
    Se = React.useMemo(
      () => (e: string): SessionBinding | null => {
        if (re) return paneBindingById(re, e);
        if (e === `workspace-main`) return me ? { workspaceScope: ye, sessionId: me } : null;
        let t = R[e];
        return t?.sessionId
          ? {
              workspaceScope: t.workspaceScope,
              sessionId: t.sessionId,
              ...(t.readOnly ? { readOnly: !0 } : {}),
            }
          : null;
      },
      [re, R, me, ye],
    ),
    Ce = React.useCallback(
      (e: SessionBinding | null) => {
        !e || e.readOnly || x?.(e.workspaceScope, e.sessionId);
      },
      [x],
    ),
    we = React.useMemo(
      () => (e: string) => {
        (re ? ie(re.id, e) : ee(e), Ce(Se(e)));
      },
      [re, ie, ee, Se, Ce],
    ),
    Te = React.useMemo(
      () => (e: string) => {
        if (re) {
          let t = closeGroupPane(re, e),
            n =
              re.focusedPaneId === e
                ? t
                  ? focusedGroupBinding(t)
                  : e === `workspace-main`
                    ? null
                    : re.primaryBinding
                : null;
          (ae(re.id, e), Ce(n));
        } else {
          let t = W === e && me ? { workspaceScope: ye, sessionId: me } : null;
          (V(e), Ce(t));
        }
      },
      [re, ae, V, W, me, ye, Ce],
    ),
    Ee = React.useMemo(
      () => (e: string) => {
        re ? oe(re.id, e) : H(e);
      },
      [re, oe, H],
    ),
    De = React.useMemo(
      () => (e: string, t: number) => {
        re ? ce(re.id, e, t) : te(e, t);
      },
      [re, ce, te],
    ),
    Oe = React.useMemo(
      () => (e: string, t: string): boolean => {
        if (re) return (se(re.id, e, t), !0);
        if (e === `workspace-main`) {
          let e = splitLayoutStore.getState();
          return (
            Object.keys(e.panes).length > 0 &&
              le({ workspaceScope: ye, sessionId: t }, e) &&
              (ne(),
              logger.info(`[v4-workbench] primary draft promoted to session group`, {
                createdSessionId: t,
                workspaceKey: workspaceScopeKey(ye),
              })),
            !0
          );
        }
        if ((U(e, t), !a)) return !1;
        let n = le({ workspaceScope: ye, sessionId: a }, splitLayoutStore.getState());
        return (n && ne(), n);
      },
      [re, se, U, le, ne, a, ye],
    ),
    ke = React.useCallback((e: SessionDragPayload) => canOpenSessionInSplit(be, toPersistableSessionBinding(e), { mode: `drag`, side: `right` }), [be]),
    Ae = React.useCallback(
      (e: string, t: DropSide, n: SessionDragPayload) => {
        openSessionInSplit(be, toPersistableSessionBinding(n), { anchorPaneId: e, mode: `drag`, side: t });
      },
      [be],
    );
  return (
    <div ref={ue} style={he} className="relative h-full min-h-0 w-full">
      {pe.leaves.map((e) => (
        <SplitPaneHost
          key={e.paneId}
          paneId={e.paneId}
          rect={e.rect}
          focused={W === e.paneId}
          showFocusIndicator={_e}
          canSplit={ve}
          shellWorkspaceKey={I}
          binding={e.paneId === `workspace-main` ? null : (fe[e.paneId] ?? null)}
          primaryBinding={e.paneId === `workspace-main` ? (re?.primaryBinding ?? null) : null}
          shell={xe}
          onFocusRequest={we}
          onSplit={i || re ? void 0 : B}
          onClosePane={Te}
          onConfirmRestoredSession={Ee}
          onBindSession={Oe}
          onPaneActiveSessionChange={x}
          canDropSession={i ? void 0 : ke}
          onDropSession={i ? void 0 : Ae}
        />
      ))}
      {pe.dividers.map((e) => (
        <SplitDivider
          key={e.splitId}
          containerRef={ue}
          splitId={e.splitId}
          direction={e.direction}
          ratio={e.ratio}
          regionFraction={e.regionFraction}
          style={dividerStyle(e)}
          onCommitRatio={De}
        />
      ))}
    </div>
  );
}

/* ============================================================================
 * §7. 侧栏会话投放上下文（原 FTt/ITt/LTt，js 123121–123136）
 * ----------------------------------------------------------------------------
 * 侧栏内任务行拖拽到聊天区时的「能否投放/如何打开」能力注入。
 * ==========================================================================*/

/** 原 FTt。 */
export const SidebarSessionDropContext = React.createContext<SidebarSessionDropValue>({
  enabled: !1,
  canOpenSession: () => !1,
  openSession: () => {},
});

/** 原 ITt（最新回调经 ref 锁存，value 仅随 enabled 变）。 */
export function SidebarSessionDropProvider({
  enabled: e,
  canOpenSession: t,
  onOpenSession: n,
  children: r,
}: {
  enabled: boolean;
  canOpenSession: (target: SidebarSessionDropTarget) => boolean;
  onOpenSession: (target: SidebarSessionDropTarget) => void;
  children?: React.ReactNode;
}) {
  let i = React.useRef({ canOpenSession: t, onOpenSession: n });
  i.current = { canOpenSession: t, onOpenSession: n };
  let a = React.useMemo<SidebarSessionDropValue>(
    () => ({
      enabled: e,
      canOpenSession: (t) => e && i.current.canOpenSession(t),
      openSession: (t) => {
        e && i.current.onOpenSession(t);
      },
    }),
    [e],
  );
  return <SidebarSessionDropContext.Provider value={a}>{r}</SidebarSessionDropContext.Provider>;
}

/** 原 LTt。 */
export function useSidebarSessionDrop(): SidebarSessionDropValue {
  return React.useContext(SidebarSessionDropContext);
}

/* ============================================================================
 * §8. 堆叠会话面板薄壳（原 owt，js 121301–121372）
 * ----------------------------------------------------------------------------
 * Web 远控堆叠形态：V4ConversationProvider 包裹单主面板 R0（paneId 固定
 * workspace-main），props 全量透传。
 * ==========================================================================*/

export function StackedConversationPane({
  workspacePath: e,
  workspaceIdentity: t,
  readOnly: n = !1,
  compactForRemoteControl: r = !1,
  sessionId: i,
  provider: a,
  onSessionCreated: o,
  onSessionDeleted: s,
  draftComposerHeader: c,
  gitSummary: l,
  gitDirtyFileCount: u,
  gitWorktreeReviewSourceId: d,
  gitWorktreeChangeSummary: f,
  activeTaskChangeSummary: p,
  summaryPanelVariantOverride: m,
  onSummaryPanelVariantOverrideChange: h,
  onRefreshGit: g,
  onOpenGitReview: _,
  onOpenBrowserUrl: v,
  onOpenAutomationsMain: y,
  onOpenCodeViewer: b,
  onOpenFileLink: x,
  onOpenSubagentSession: S,
  onOpenSubagentDirectory: C,
  onSyncSubagentSessionTabs: w,
  onOpenPlanDetail: T,
  conversationFindQuery: E = ``,
  conversationFindActiveIndex: D = -1,
  onConversationFindMatchStateChange: O,
  searchResultHighlightRequest: k,
  onSearchResultHighlightDone: A,
}: StackedConversationPaneProps) {
  return (
    <V4ConversationProvider workspacePath={e} workspaceIdentity={t}>
      <ConversationPane
        paneId={`workspace-main`}
        readOnly={n}
        sessionId={i}
        workspacePath={e}
        workspaceIdentity={t}
        compactForRemoteControl={r}
        provider={a}
        onSessionCreated={o}
        onSessionDeleted={s}
        draftComposerHeader={c}
        gitSummary={l}
        gitDirtyFileCount={u}
        gitWorktreeReviewSourceId={d}
        gitWorktreeChangeSummary={f}
        activeTaskChangeSummary={p}
        summaryPanelVariantOverride={m}
        onSummaryPanelVariantOverrideChange={h}
        onRefreshGit={g}
        onOpenGitReview={_}
        onOpenBrowserUrl={v}
        onOpenAutomationsMain={y}
        onOpenCodeViewer={b}
        onOpenFileLink={x}
        onOpenSubagentSession={S}
        onOpenSubagentDirectory={C}
        onSyncSubagentSessionTabs={w}
        onOpenPlanDetail={T}
        conversationFindQuery={E}
        conversationFindActiveIndex={D}
        onConversationFindMatchStateChange={O}
        searchResultHighlightRequest={k}
        onSearchResultHighlightDone={A}
      />
    </V4ConversationProvider>
  );
}

/* ============================================================================
 * §8a. 会话拖拽源侧助手（原 PRt/Lzt/Rzt，js 151164–151184 + 155248–155280）
 * ----------------------------------------------------------------------------
 * A1-R4 补全 PTt 域消费面：PRt 为任务行 dragstart 之影像生成（Sidebar 消费）；
 * Lzt/Rzt 为拖拽指针跟踪（壳层分组视图以 getPosition 喂 Wwt/Gwt 预览/落点）。
 * 归入本模块自裁说明：三者皆会话拖放机制件（Wwt/Gwt/Kwt 之供给面），集中域内；
 * Sidebar 保持纯消费。无新值依赖（纯 DOM/React），环安全不变。
 * ==========================================================================*/

/** 原 PRt（js 151164）：HTML5 拖拽影像——克隆行节点离屏挂载并 setDragImage，返回清理。
 * 行注：cloneNode 返回 Node，源为 HTMLElement 行节点，收窄为 HTMLElement（非 any）。 */
export function createSessionDragPreview({
  clientX: e,
  clientY: t,
  dataTransfer: n,
  source: r,
}: {
  clientX: number;
  clientY: number;
  dataTransfer: DataTransfer;
  source: HTMLElement;
}): () => void {
  let i = r.ownerDocument,
    a = r.getBoundingClientRect(),
    o = r.cloneNode(!0) as HTMLElement;
  return (
    (o.dataset.taskWorkbenchDragPreview = `true`),
    o.classList.add(`border`, `border-border`, `bg-background`, `shadow-lg`),
    (o.style.position = `fixed`),
    (o.style.left = `-10000px`),
    (o.style.top = `-10000px`),
    (o.style.pointerEvents = `none`),
    (o.style.width = `${a.width}px`),
    i.body.append(o),
    n.setDragImage(
      o,
      Math.max(0, Math.min(e - a.left, a.width)),
      Math.max(0, Math.min(t - a.top, a.height)),
    ),
    () => o.remove()
  );
}

/** 原 Lzt（js 155248）：指针事件面取 client 坐标（缺面/非数 → null）。
 * 行注：参型 unknown 承 nativeEvent；bundle 仅 `in` 守卫，此处先 typeof 对象收窄
 * （TS `in` 运算所需；nativeEvent 恒为对象，行为一致），再 in 守卫 + 结构面收窄（非 any）。 */
export function dragPointerPositionOf(e: unknown): { x: number; y: number } | null {
  if (typeof e !== `object` || e === null || !(`clientX` in e) || !(`clientY` in e)) return null;
  let { clientX: t, clientY: n } = e as { clientX?: unknown; clientY?: unknown };
  return typeof t == `number` && typeof n == `number` ? { x: t, y: n } : null;
}

/** 原 Rzt（js 155253）：拖拽期指针位置跟踪（capture 三件，可 dispose）。 */
export function trackSessionDragPointer(e: Document, t: unknown): { dispose(): void; getPosition(): { x: number; y: number } } | null {
  let n = dragPointerPositionOf(t);
  if (!n) return null;
  let r = n,
    i = !1,
    a = () => {
      i ||
        ((i = !0),
        e.removeEventListener(`pointermove`, o, !0),
        e.removeEventListener(`pointerup`, s, !0),
        e.removeEventListener(`pointercancel`, c, !0));
    },
    o = (e: PointerEvent) => {
      r = { x: e.clientX, y: e.clientY };
    },
    s = (e: PointerEvent) => {
      ((r = { x: e.clientX, y: e.clientY }), a());
    },
    c = () => {
      a();
    };
  return (
    e.addEventListener(`pointermove`, o, !0),
    e.addEventListener(`pointerup`, s, !0),
    e.addEventListener(`pointercancel`, c, !0),
    { dispose: a, getPosition: () => r }
  );
}

/* ============================================================================
 * §8b. 最后会话恢复域（原 RTt/j2/zTt/BTt/VTt/HTt，styles 123139–123193）
 * ----------------------------------------------------------------------------
 * A1-R4 转录（R3 尾注登记项）；UTt（123194）已有属主（components/shell/Home.tsx
 * useRemoteWorkspaceEnabled，逐字），不重复。z0=isReloadNavigationEntry 经
 * ./SplitLayoutDeep 真实 import（R2 重建）。
 * ==========================================================================*/

/** 原 RTt：最后会话存储前缀。 */
export const LAST_SESSION_STORAGE_PREFIX = `zcode-v4-last-session:v1:`;

/** 原 j2：存储键。 */
export function lastSessionStorageKey(e: string): string {
  return `${LAST_SESSION_STORAGE_PREFIX}${e}`;
}

/** 原 zTt：读最后会话 id。 */
export function readLastSessionId(e: string): string | null {
  try {
    return localStorage.getItem(lastSessionStorageKey(e));
  } catch {
    return null;
  }
}

/** 原 BTt：写/删最后会话 id（空值删键）。 */
export function writeLastSessionId(e: string, t: string | null): void {
  try {
    t ? localStorage.setItem(lastSessionStorageKey(e), t) : localStorage.removeItem(lastSessionStorageKey(e));
  } catch {}
}

/** 原 VTt：可恢复判定（启用 + 渲染器重载 + 无活动会话 + 草稿焦点版本 0）。 */
export function isLastSessionRestorable(e: { enabled: boolean; rendererReload: boolean; activeSessionId: string | null; draftFocusVersion: number }): boolean {
  return e.enabled && e.rendererReload && e.activeSessionId === null && e.draftFocusVersion === 0;
}

/** 原 HTt（js 123158）：每工作区只恢复一次最后会话（渲染器重载场景），其后持续写回。 */
export function useLastSessionRestore({
  workspaceKey: e,
  activeSessionId: t,
  draftFocusVersion: n,
  enabled: r = !0,
  selectSession: i,
}: {
  workspaceKey: string;
  activeSessionId: string | null;
  draftFocusVersion: number;
  enabled?: boolean;
  selectSession: (sessionId: string) => void;
}): void {
  let a = React.useRef(new Set<string>()),
    o = React.useRef(isReloadNavigationEntry()),
    s = React.useRef<{ workspaceKey: string; sessionId: string } | null>(null),
    c = React.useRef(i);
  ((c.current = i),
    React.useEffect(() => {
      if (!r || a.current.has(e)) return;
      a.current.add(e);
      let i = o.current;
      if (
        ((o.current = !1),
        !isLastSessionRestorable({ activeSessionId: t, draftFocusVersion: n, enabled: r, rendererReload: i }))
      ) {
        t === null && writeLastSessionId(e, null);
        return;
      }
      let l = readLastSessionId(e);
      l && ((s.current = { workspaceKey: e, sessionId: l }), c.current(l));
    }, [r, e]),
    React.useEffect(() => {
      if (r && a.current.has(e)) {
        if (s.current?.workspaceKey === e) {
          if (t === null) return;
          s.current = null;
        }
        writeLastSessionId(e, t);
      }
    }, [t, r, e]));
}

/* ============================================================================
 * §9. 尾表（符号台账）
 * ----------------------------------------------------------------------------
 *   语义名                          原混淆名   bundle js 行   导出
 *   SPLIT_CSS_VAR_PREFIX            c2        121722        ✓
 *   ROOT_PANE_RECT                  Mwt       121723        ✓
 *   flattenPaneNode                 l2        121724        （模块内）
 *   flattenPaneTree                 Nwt       121772        ✓
 *   paneRectStyle                   Pwt       121777        ✓
 *   dividerStyle                    Fwt       121783        ✓
 *   SESSION_DRAG_MIME               u2        121804        ✓
 *   sessionDragFallbackPayload      d2        121805        （模块内态）
 *   serializeSessionDragPayload     Iwt       121806        ✓
 *   setSessionDragFallbackPayload   Lwt       121808        ✓
 *   clearSessionDragFallbackPayload Rwt       121810        ✓
 *   dataTransferHasSessionPayload   zwt       121812        ✓
 *   isPlainObject                   Bwt       121814        ✓
 *   parseSessionDragPayload         Vwt       121816        ✓
 *   dropSideAtPoint                 f2        121841        ✓
 *   dropTargetRegistry              p2        121853        （模块内态）
 *   activeDropPreviewTarget         m2        121854        （模块内态）
 *   clearDropPreview                h2        121855        ✓
 *   findDropTargetAt                Hwt       121858        ✓
 *   registerDropTarget              Uwt       121866        ✓
 *   previewSessionDropAt            Wwt       121875        ✓
 *   commitSessionDropAt             Gwt       121880        ✓
 *   cancelSessionDropPreview        Kwt       121883        ✓
 *   DROP_HIGHLIGHT_STYLE            qwt       121886        ✓
 *   INACTIVE_PANE_OVERLAY_STYLE     Jwt       121890        ✓
 *   dropSideOverlayClass            Ywt       121896        ✓
 *   PaneFrame                       Xwt       121909        ✓
 *   RestoredSessionWatcher          Zwt       121966        （模块内）
 *   workspaceBadgeOf                Qwt       121999        ✓
 *   SplitPaneHost                   $wt       122003        （模块内）
 *   selectionSideChatSessionIdForPane eTt     122198        ✓
 *   SplitDivider                    tTt       122201        ✓
 *   ConversationOrchestrator        PTt       122820        ✓
 *   SidebarSessionDropContext       FTt       123120        ✓
 *   SidebarSessionDropProvider      ITt       123121        ✓
 *   useSidebarSessionDrop           LTt       123136        ✓
 *   StackedConversationPane         owt       121301        ✓
 *   createSessionDragPreview        PRt       151164        ✓（A1-R4）
 *   dragPointerPositionOf           Lzt       155248        ✓（A1-R4）
 *   trackSessionDragPointer         Rzt       155253        ✓（A1-R4）
 *   LAST_SESSION_STORAGE_PREFIX     RTt       123139        ✓（A1-R4）
 *   lastSessionStorageKey           j2        123140        ✓（A1-R4）
 *   readLastSessionId               zTt       123143        ✓（A1-R4）
 *   writeLastSessionId              BTt       123150        ✓（A1-R4）
 *   isLastSessionRestorable         VTt       123155        ✓（A1-R4）
 *   useLastSessionRestore           HTt       123158        ✓（A1-R4）
 *
 * 未转录（他域，后续批次）：
 *   - 壳层分组视图（sBt）之 DnD 编排对 Wwt/Gwt/Kwt/Rzt 的消费现场
 *     （js 155580/155969/155985/156026）——分组视图已退役（HOME-SEG），
 *     机制件本模块在位，随视图重建接线。
 * ==========================================================================*/
