/* eslint-disable */
/**
 * ============================================================================
 * ConversationLeaves.tsx — Conversation 族接口级叶子展开（B4 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：同目录 Conversation.report.md §5「中（接口级）」清单——本文件将六组叶子
 *       从「接口声明」展开为「逐行还原」，格式与口径同 TopBar.tsx / Conversation.tsx。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [List] Rbt 滚动意图助手族（14 个，实体化）：
 *   Ryt  → distanceFromBottom        (— / 97137)
 *   T1   → isNearBottom              (— / 97140)
 *   zyt  → isNearBottomAlias         (— / 97143)
 *   Byt  → resolveFollowIntent       (— / 97146)
 *   Vyt  → resolveInitialIntent      (— / 97149)
 *   Hyt  → shouldSuppressTopAdjustment (— / 97152)
 *   Uyt  → scrollDeltaDirection      (— / 97155)
 *   Wyt  → compareScrollDirection    (— / 97158)
 *   Gyt  → keyScrollIntent           (— / 97161)
 *   E1   → resolveFollowAfterIntent  (— / 97164)
 *   Kyt  → shouldLoadOlderOnUnfollow (— / 97171)
 *   D1   → alwaysTrue                (— / 97174)
 *   qyt  → computePrependCompensation (— / 97177)
 *   Jyt  → computePrependGrowth      (— / 97180)
 *   Yyt  → estimatePrependTrigger    (— / 97184)
 *   Xyt  → shouldTriggerLoadOlder    (— / 97187)
 *  [Tool] 15 个工具视图（Wht 分派中接口级者，实体化）：
 *   opt  → FileReadToolView          (105465 / 90659)
 *   Gft  → FileWriteToolView         (104844 / 90186)  + Kft 单文件编辑行 (— / 90290)
 *   Spt  → ExploreToolView           (105825 / 91001)
 *   upt  → SearchToolView            (105569 / 90768)  + lpt 搜索标签 (— / 90700)
 *   Mht  → TodoToolView              (108857 / 93007)
 *   Pht  → AskUserQuestionToolView   (108963 / 93067)
 *   Vpt  → AgentToolView             (106243 / 91282)
 *   Dht  → TaskControlToolView       (108728 / 92920)
 *   Sht  → TaskOutputToolView        (108581 / 92812)
 *   mht  → SkillToolView             (108309 / 92669)
 *   eht  → SessionContextToolView    (107835 / 92325)
 *   ght  → SwitchModeToolView        (108426 / 92725)（plan 面板）
 *   omt  → GoalToolView              (106753 / 91604)
 *   Nmt  → NodeReplToolView          (107168 / 91932)
 *   Wmt  → AutomationToolView        (107472 / 92099)
 *   Qpt  → FallbackToolView          (106609 / 91478)  + Hpt CUA 权限引导 (106405 / 91360)
 *  工具视图共享件（本次一并实体化）：
 *   VQ   → EditInlineDiffContent     (— / 90046)
 *   jft/Mft/Nft/Pft/Fft → 降动效侦听/数字翻牌动画 (— / 90063–90120)
 *   Ift  → DiffCountBadge            (— / 90127)
 *   Lft  → FileSummaryLabel          (— / 90133)
 *   HQ   → PathSecondaryText         (— / 90147)
 *   Rft  → resolveEditKindLabel      (— / 90150)
 *   zft  → FileSummaryList           (— / 90157)
 *   Bft/Vft/Hft → 编辑图标/折叠预设   (— / 90166)
 *   Uft  → isRawFailed               (— / 90173)
 *   UQ   → toCodeViewerTarget        (— / 90177)
 *   Wft  → toPatchPreview            (— / 90183)
 *  [Turn] 预览卡单项：
 *   A_t  → PreviewCard               (111233 / 94950)
 *   O_t  → useVisiblePreviewCards    (111161 / 94877)
 *   k_t  → PreviewCardList           (111193 / 94925)
 *   C_t/w_t/T_t/E_t/D_t/c1 → 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 (— / 94833–94876)
 *  [Turn] 自动化卡：
 *   Mvt  → collectAutomationCards    (— / 96194)
 *   Nvt  → tryParseJsonObject        (— / 96214)
 *   Pvt  → extractDeletedAutomationId (— / 96223)
 *   Fvt  → AutomationCardList        (— / 96229)
 *   fgt  → AutomationCard            (107448 区 / 93676)
 *   sgt/cgt/lgt/ugt/dgt → cron 工具判定/JSON 宽松解析/自动化模型归一/多源抽取 (— / 93617–93666)
 *  [Captcha] Aliyun captcha 部件：
 *   ASt  → handleAliyunSdkFail       (117919 / 100205)
 *   jSt  → initAliyunCaptchaInstance (— / 100280)
 *   MSt  → awaitCaptchaInstance      (— / 100322)
 *   NSt  → waitCaptchaScriptSettle   (— / 100335)
 *   PSt  → runAliyunCaptchaVerification (— / 100344)
 *   kSt  → loadAliyunCaptchaScript   (— / 100160)
 *   wSt  → CaptchaHostContainer      (— / 100110)
 *   v0/TSt/ESt/DSt/OSt → 在途拒绝/重置/配置键/挂载校验/按钮查询 (— / 100130–100190)
 *   r0/i0/_St/vSt/a0/o0/ySt/bSt/s0/c0/xSt/SSt → 失败载荷解析族 (— / 100045–100100)
 *   FSt/ISt/LSt → 验证头名/区域头名/头构建 (— / 100470–100478)
 *   RSt/zSt/BSt/VSt/HSt → ARMS 事件名/组/注入/构建/上报 (— / 100480–100500)
 *   b0   → isCaptchaProtectedProvider (118292 / 100548)
 *   nCt/w0/T0/rCt/iCt/aCt → 验证参数缓存/运行时头账本 (— / 100560–100590)
 *   E0/D0/oCt/sCt/cCt/lCt/uCt/dCt/fCt → 配置缓存/可用性/语言/串行队列/预检/发送前恢复 (— / 100590–100680)
 *  [Interaction] 交互通知 toast：
 *   eSt  → useWorkspaceInteractionNotifier (117283 / 99619)
 *   tSt  → useSnapshotInteractionNotifier  (117346 / 99703)
 *   Gxt/Kxt/qxt/Jxt/Yxt/Xxt/Zxt/Qxt/$xt → 相位变化通知构建族 (— / 99539–99616)
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 已在 Conversation.tsx 还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. Button (X)；4. useIntlContext (G)；
 *  5. logger (J)；6. toast (m)；7. Markdown 渲染器 (cj，F19)；
 *  8. ToolLayout (lQ) / ToolCallBlock (K$) / 展开内容 (oQ) / 快照引用 (sQ) —— Conversation.tsx §4；
 *  9. Collapsible 原语 (kZ/AZ/jZ)；10. 代码面 (w$/gk/pk/mk/hk/_k/vk) —— shiki 封装；
 *  11. 文件图标 (Vc/zc/Hc/Go)；12. 命令队列 (OS/K1)；13. 平台通知 (VS/HS)；
 *  14. 工作区服务 (fs/Oc)；15. 流式摘要 (xpt)；16. 错误文本 (rQ)；17. plan markdown (qZ)。
 * ============================================================================
 */

import * as React from "react";
import { ToolCallBlock, ToolLayout } from './Conversation'; // +ToolLayout（A0-D 接线：原 lQ declare → Conversation §4.1 canonical 导出）
import { FileOpenWithMenu } from './FileRewindDialogDeep'; // 原 v_t（A0-CLEANUP2 item 45 接线：declare → 属主导出；本文件 E_t buildFilePreviewSource 为另一束符号，保留本地）
import { MarkdownRenderer, baseName, joinWorkspacePath, type CodePreviewSettings, type FileLinkModel } from './MarkdownIntegration'; // +CodePreviewSettings/FileLinkModel（A0-D 类型收敛）
import { logger } from './SkillStore';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from './I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical；IntlShape=ZCodeIntl）
import { Button } from './button'; // 原 t 导出，button-laUijeDG.js（A0-D 接线：declare → button.tsx canonical）
import { cn } from './UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { useServices } from './services'; // 原 eSt 内 fs()（bundle 117331）= context 面 useServices（A0-D 裁决：基线误名 useWorkspaceServices）

/* ── tombstone（A0-D）：FileOpenWithMenu（原 v_t，110427 / 94447）的跨文件 import
 *    已回退为下方 declare——属主 FileRewindDialogDeep.tsx 本地定义未导出（全文件
 *    0 导出），待属主补 export 后换真实 import（需要的 export 已登记）。 ── */

/* ============================================================================
 * 0. 外部依赖的类型声明
 *    ── A0-D 接线：cn / useIntlContext / Button / ToolLayout declare 已删除，
 *       canonical = UtilsCn / I18n（useZCodeIntl）/ button / Conversation §4.1，
 *       经文件头真实 import 消费；本地 IntlShape/ButtonProps 脚手架随删除。 ──
 * ==========================================================================*/

/* A0-CLEANUP2 item 45：FileOpenWithMenu declare 删除 → import { FileOpenWithMenu } from './FileRewindDialogDeep'
   （属主导出，原 v_t；website 分支仅 type+url 与属主判别联合吻合）。 */

/** 图标 */
declare const IconPencil: React.FC<React.SVGProps<SVGSVGElement>>; // Dv（edit）
declare const IconSearch: React.FC<React.SVGProps<SVGSVGElement>>; // Fv（read/search）
declare const IconTerminal: React.FC<React.SVGProps<SVGSVGElement>>; // Uv
declare const IconShield: React.FC<React.SVGProps<SVGSVGElement>>; // Rbe
declare const IconTarget: React.FC<React.SVGProps<SVGSVGElement>>; // rv（goal）
declare const IconGauge: React.FC<React.SVGProps<SVGSVGElement>>; // Sv（switch-mode）
declare const IconCalendar: React.FC<React.SVGProps<SVGSVGElement>>; // R_（automations/task-stop）
declare const IconClock: React.FC<React.SVGProps<SVGSVGElement>>; // V_（automation 卡）
declare const IconQuestion: React.FC<React.SVGProps<SVGSVGElement>>; // vye
declare const IconBot: React.FC<React.SVGProps<SVGSVGElement>>; // D_
declare const IconGlobe: React.FC<React.SVGProps<SVGSVGElement>>; // nv（website 卡）
declare const IconFile: React.FC<React.SVGProps<SVGSVGElement>>; // Z_（文件卡缺省）
declare const IconCheck: React.FC<React.SVGProps<SVGSVGElement>>; // M_
declare const IconCopy: React.FC<React.SVGProps<SVGSVGElement>>; // W_
declare const IconChevronRight: React.FC<React.SVGProps<SVGSVGElement>>; // wa
declare const IconArrowUpRight: React.FC<React.SVGProps<SVGSVGElement>>; // C_（plan 全览）
declare const IconExternal: React.FC<React.SVGProps<SVGSVGElement>>; // q_（node-repl 打开）
declare const IconLoader: React.FC<React.SVGProps<SVGSVGElement>>; // fv

/* ---- 会话流共享类型（与 Conversation.tsx 同口径）
 * A0-D 类型收敛：ToolCall/ToolCallNode/ToolDisplayModel/FileSummary/OpenCodeViewerFn
 * 为会话族 canonical 形状，导出供 Conversation/ConversationOverlays import。 ---- */

export interface ToolCall {
  toolId: string;
  toolName: string;
  kind: string;
  title?: string | null;
  status: string;
  input?: unknown;
  inputText?: string;
  output?: unknown;
  error?: string | null;
  content?: unknown;
  raw?: unknown;
  thought?: string | null;
  snapshotRefs?: unknown[];
  [key: string]: unknown;
}
export interface ToolCallNode {
  toolCall: ToolCall;
  childToolCalls?: ToolCallNode[];
  [key: string]: unknown;
}
/* ── A0-D：本地 CodePreviewSettings 脚手架删除，canonical = MarkdownIntegration
 *    导出（经文件头 type import 消费；形状为五字段严格型）。 ── */
export interface ToolDisplayModel {
  inlinePreview: { type: string; [key: string]: unknown };
  [key: string]: unknown;
}
export type OpenCodeViewerFn = (target: unknown) => void;

export interface ToolCallViewProps {
  toolCallNode: ToolCallNode;
  viewerSource?: unknown;
  showTodoToolCalls?: boolean;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  displayModel: ToolDisplayModel;
  rawFileSummaries: FileSummary[];
  isRunning: boolean;
  statusLabel: string;
  sourceLabel?: string;
  errorText?: string;
  childToolList: React.ReactNode;
  showIcon?: boolean;
  disableSummaryContentAnimation?: boolean;
  agentSummaryAction?: { [key: string]: unknown; ariaLabel?: string };
  authoritativeAgentType?: string;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: (automationId: string) => void;
  onOpenPlanDetail?: (plan: { toolCallId: string; markdown: string; planFilePath?: string }) => void;
  onLoadFullToolCallFields?: (toolId: string) => void;
  kindLabelOverride?: React.ReactNode;
  canToggle?: boolean;
  forceOpen?: boolean;
}

export interface FileSummary {
  path: string;
  fileName: string;
  filePath?: string | null;
  patch?: string | null;
  operationKind?: string;
  actionLabel?: string;
  changeStat?: { added: number; removed: number } | null;
  [key: string]: unknown;
}

/* ── tombstone（A0-D）：ToolLayout declare（原 lQ）已删除，canonical = Conversation.tsx
 *    §4.1 ToolLayoutImpl（memo 导出），经文件头真实 import 消费；props 面以
 *    Conversation ToolLayoutProps 为准（summaryAction 含 onActivate，1412 消费点
 *    以类型垫片接通）。 ── */
/** ToolCallBlock（原 K$，Conversation.tsx §4 已还原） */
/** 展开区通用内容（原 oQ：输入/输出/错误/子工具列表） */
declare const ToolCallExpandedContent: React.FC<{
  childToolList: React.ReactNode;
  displayModel: ToolDisplayModel;
  inlinePreviewOverride?: { type: string } | null;
  toolCall: ToolCall;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
/** 快照引用加载条（原 sQ） */
declare const SnapshotRefsLoader: React.FC<{
  refs: unknown[];
  onLoadFullToolCallFields?: () => void;
}>;
/** 错误面（原 aQ） */
declare const ToolErrorSurface: React.FC<{ errorText?: string | null; [key: string]: unknown }>;
/** Markdown 渲染器（原 cj，F19） */
/** Collapsible 原语（Radix 封装） */
declare const Collapsible: React.FC<{ className?: string; children?: React.ReactNode }>;
declare const CollapsibleTrigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }>;
declare const CollapsibleContent: React.FC<{ children?: React.ReactNode }>;
/** 代码面（shiki 封装，原 w$/gk 族） */
declare const CodeSurface: React.FC<{
  cardSurface?: boolean;
  code: string;
  copyLabel?: string;
  wrapLabel?: string;
  eagerLayout?: boolean;
  label?: React.ReactNode;
  language?: string;
  appTheme?: string;
  className?: string;
  enableSyntaxHighlighting?: boolean;
  renderMermaid?: boolean;
  style?: unknown;
  wrapLongLines?: boolean;
  children?: React.ReactNode;
}>;
declare const CodeSurfaceHeader: React.FC<{ className?: string; children?: React.ReactNode }>;
declare const CodeSurfaceTitle: React.FC<{ children?: React.ReactNode }>;
declare const CodeSurfaceActions: React.FC<{ children?: React.ReactNode }>;
declare const CodeSurfaceWrapButton: React.FC<{ "aria-label": string; title?: string }>;
declare const CodeSurfaceCopyButton: React.FC<{ "aria-label": string; title?: string }>;
/** 文件图标/路径助手（原 Vc/zc/Hc/Go） */
declare const FileIcon: React.FC<{ src: string; size?: number; className?: string }>;
declare function resolveFileIconMeta(path: string, options?: { basePath?: string }): { fileIconSrc: string };
declare function resolvePathTitle(path: string, basePath?: string): string;
/** 流式子工具摘要（原 xpt） */
declare function resolveStreamingChildSummary(
  intl: IntlShape,
  childToolCalls: ToolCallNode[],
  viewProps: ToolCallViewProps,
  options?: { includeChildActionKindLabel?: boolean },
): { primaryText: React.ReactNode; secondaryText?: React.ReactNode; animationKey?: string; title?: string } | null;
/** 工具错误文本（原 rQ，Conversation.tsx 已还原） */
declare function extractToolErrorText(toolCall: ToolCall): string | null;
/** plan markdown 抽取（原 qZ，横切） */
declare function extractPlanMarkdown(toolCall: ToolCall, workspacePath?: string): { markdown: string | null; planFilePath?: string | null };
/** 平台服务（原 S，imeComposition chunk） */
interface PlatformService {
  prepareCuaHelperPermissionDrag?(): Promise<void>;
  openCuaPermissionOnboarding?(args: { initialPermission: string }): Promise<{ success: boolean; canceled?: boolean; error?: string }>;
  openCuaAccessibilitySettings?(): Promise<{ success: boolean; canceled?: boolean; error?: string }>;
  startCuaHelperPermissionDrag?(): void;
  showTaskNotification(notification: TaskNotification): void;
  getCaptchaConfig?(): Promise<CaptchaConfig | null>;
  [key: string]: unknown;
}
declare function usePlatformService(): PlatformService | null;
/** 工作区服务（原 fs/Oc） */
interface WorkspaceServicesLike { zcodeAgentService: unknown; fileService: unknown; [key: string]: unknown }
declare function useWorkspaceScopedServices(
  workspacePath?: string,
  remoteSessionId?: string | null,
  workspaceIdentity?: string | null,
): { fileService: FileServiceLike };
interface FileServiceLike {
  checkFilesExist(args: { paths: string[] }): Promise<Array<{ path: string; exists: boolean }>>;
  [key: string]: unknown;
}
/** 代理目录 store（原 he/je） */
interface AgentDescriptor { id: string; name: string; color?: string }
declare function useWorkspaceAgents(workspacePath?: string): AgentDescriptor[] | undefined;
declare function useGlobalAgents(): AgentDescriptor[];
declare function getGlobalAgents(): AgentDescriptor[];
/** 打开 with 菜单（原 v_t，Conversation.tsx 接口级） */
/** 命令队列（原 OS/K1） */
declare function buildCommand(args: { type: string; sessionId: string | null; payload: unknown }): { commandId: string; [key: string]: unknown };
declare const pendingCommandLedger: {
  record(command: unknown): void;
  applyAck(command: unknown, ack: unknown): void;
};
/** 交互通知登记（原 VS/HS，jsx 32468/32498） */
interface InteractionNotifierRegistry {
  getSessions(): AgentSessionSnapshot[];
  getStatus(): string;
  subscribe(cb: () => void): () => void;
}
declare function registerWorkspaceNotifier(key: WorkspaceNotifierKey, service: unknown): InteractionNotifierRegistry;
declare function unregisterWorkspaceNotifier(key: WorkspaceNotifierKey, registry: InteractionNotifierRegistry): void;
interface WorkspaceNotifierKey {
  workspaceKey: string;
  workspacePath: string;
  workspaceIdentity?: string;
  endpointKey?: string;
}
interface AgentSessionSnapshot {
  sessionId: string;
  phase?: string;
  pendingInteractions?: PendingInteraction[];
  meta?: { title?: string };
  [key: string]: unknown;
}
interface PendingInteraction {
  interactionId: string;
  source?: string;
  payload: {
    kind: string;
    toolName?: string;
    summary?: string;
    prompt?: string;
    schema?: unknown;
    [key: string]: unknown;
  };
}

/* ============================================================================
 * 1. 原 Ryt…Xyt（jsx 97137–97188）：Rbt 消息列表滚动意图助手族（14 实体化）
 * ==========================================================================*/

export interface ScrollMetrics {
  scrollTop: number;
  contentHeight: number;
  viewportHeight: number;
  contentWidthChanging?: boolean;
}
/** 原 Ryt：距底像素 */
export function distanceFromBottom(metrics: ScrollMetrics): number {
  return Math.max(0, metrics.contentHeight - metrics.viewportHeight - metrics.scrollTop);
}
/** 原 T1：贴底判定（默认 48px 容差） */
export function isNearBottom(metrics: ScrollMetrics, epsilonPx = 48): boolean {
  return distanceFromBottom(metrics) <= epsilonPx;
}
/** 原 zyt：贴底判定别名（供意图解析复用） */
export function isNearBottomAlias(metrics: ScrollMetrics, epsilonPx = 48): boolean {
  return isNearBottom(metrics, epsilonPx);
}
/** 原 Byt：用户滚动 → 是否继续跟随 */
export function resolveFollowIntent(intent: { source: string; metrics: ScrollMetrics; epsilonPx?: number; following: boolean }): boolean {
  return intent.source === "user" ? isNearBottomAlias(intent.metrics, intent.epsilonPx) : intent.following;
}
/** 原 Vyt：初始意图（跟随 → stickToBottom，否则 hold） */
export function resolveInitialIntent(following: boolean, held = false): "stickToBottom" | "hold" {
  return following && !held ? "stickToBottom" : "hold";
}
/** 原 Hyt：顶部预载后是否抑制滚动补偿（已离顶且非跟随） */
export function shouldSuppressTopAdjustment(args: {
  suppressAdjustment?: boolean;
  following: boolean;
  contentWidthChanging?: boolean;
  itemEnd: number;
  scrollTop: number;
}): boolean {
  return args.suppressAdjustment || args.following || args.contentWidthChanging ? false : args.itemEnd <= args.scrollTop;
}
/** 原 Uyt：滚动增量方向 */
export function scrollDeltaDirection(delta: number): "awayFromBottom" | "towardBottom" | "none" {
  return delta < 0 ? "awayFromBottom" : delta > 0 ? "towardBottom" : "none";
}
/** 原 Wyt：前后 scrollTop 比较方向 */
export function compareScrollDirection(previous: number, next: number): "awayFromBottom" | "towardBottom" | "none" {
  return next > previous ? "awayFromBottom" : next < previous ? "towardBottom" : "none";
}
/** 原 Gyt：键盘滚动意图（方向键/PageUp/Down/Home/End/空格） */
export function keyScrollIntent(event: {
  key: string;
  shiftKey?: boolean;
  editableTarget?: boolean;
}): "awayFromBottom" | "towardBottom" | "none" {
  if (event.editableTarget) return "none";
  if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home") return "awayFromBottom";
  if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === "End") return "towardBottom";
  if (event.key === " ") return event.shiftKey ? "awayFromBottom" : "towardBottom";
  return "none";
}
/** 原 E1：意图后的跟随状态再判定 */
export function resolveFollowAfterIntent(args: {
  userScrollIntent?: string;
  following: boolean;
  metrics: ScrollMetrics;
  bottomEpsilonPx?: number;
  lastObservedScrollTop: number;
  scrollEpsilonPx?: number;
}): boolean {
  const intent = args.userScrollIntent ?? "unknown";
  if (intent === "awayFromBottom") return false;
  if (intent === "none") return args.following;
  if (isNearBottom(args.metrics, args.bottomEpsilonPx ?? 48)) return true;
  if (args.metrics.scrollTop < args.lastObservedScrollTop - (args.scrollEpsilonPx ?? 2)) return false;
  return args.following;
}
/** 原 Kyt：取消跟随后是否触发预载更早行 */
export function shouldLoadOlderOnUnfollow(following: boolean, olderCount: number): boolean {
  return !following && olderCount > 0;
}
/** 原 D1：常量真（虚拟化选项占位） */
export function alwaysTrue(): boolean {
  return true;
}
/** 原 qyt：预载补偿偏移（旧首行新起点 - 旧偏移 - 已滚） */
export function computePrependCompensation(
  previousFirstRow: { key: number; offsetTop: number },
  nextFirstRow: { key: number; start: number },
  scrollTop: number,
): number | null {
  return previousFirstRow.key !== nextFirstRow.key || !Number.isFinite(previousFirstRow.offsetTop) || !Number.isFinite(nextFirstRow.start) || !Number.isFinite(scrollTop)
    ? null
    : nextFirstRow.start - previousFirstRow.offsetTop - scrollTop;
}
/** 原 Jyt：预载增长量（仅当首行前移且总高增加） */
export function computePrependGrowth(args: {
  prevFirstRowId: number | null;
  nextFirstRowId: number | null;
  prevTotalSize: number;
  nextTotalSize: number;
}): number | null {
  if (args.prevFirstRowId === null || args.nextFirstRowId === null || args.nextFirstRowId >= args.prevFirstRowId) return null;
  const growth = args.nextTotalSize - args.prevTotalSize;
  return growth > 0 ? growth : null;
}
/** 原 Yyt：预载触发阈值估算（下限 64，默认两倍平均行高） */
export function estimatePrependTrigger(averageRowHeight: number): number {
  return !Number.isFinite(averageRowHeight) || averageRowHeight <= 0 ? 64 : Math.max(64, averageRowHeight * 2);
}
/** 原 Xyt：是否触发预载更早行 */
export function shouldTriggerLoadOlder(args: {
  canLoadOlder: boolean;
  loadingOlder: boolean;
  scrollTop: number;
  triggerPx?: number;
}): boolean {
  return args.canLoadOlder && !args.loadingOlder && args.scrollTop <= (args.triggerPx ?? 64);
}

/* ============================================================================
 * 2. 工具视图共享件（原 VQ/jft…Fft/Ift/Lft/HQ/Rft/zft/Bft/Vft/Hft/Uft/UQ/Wft）
 * ==========================================================================*/

/** 原 bhe/rA/kft/Oft：patch 行解析/语言推断/主题类名/高亮行渲染（接口级，F19 域） */
declare function parsePatchLines(patch: string): unknown[];
declare function inferPatchLanguage(pathOrTitle: string, patch: string): string;
declare function resolveHighlightTheme(theme: string, settings: CodePreviewSettings): string;
declare const HighlightedCodeLines: React.FC<{
  className?: string;
  codePreviewSettings?: CodePreviewSettings;
  "data-inline-diff-highlight-language": string;
  "data-inline-diff-highlight-theme": string;
  language: string;
  lines: unknown[];
  path: string;
  theme: string;
}>;

/** 原 VQ（— / 90046）：编辑内联 diff 内容（max-h-60 滚动卡） */
export const EditInlineDiffContent = React.memo(function EditInlineDiffContent({
  preview,
  theme = "system",
  codePreviewSettings,
}: {
  preview: { patch: string; path?: string; title: string };
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
}) {
  const lines = React.useMemo(() => parsePatchLines(preview.patch), [preview.patch]);
  const language = React.useMemo(() => inferPatchLanguage(preview.path ?? preview.title, preview.patch), [preview.patch, preview.path, preview.title]);
  const highlightTheme = React.useMemo(() => resolveHighlightTheme(theme, codePreviewSettings ?? ({} as CodePreviewSettings)), [codePreviewSettings, theme]); /* A0-D 类型垫片：缺省空对象 */
  return (
    <div className="space-y-3">
      <div className="mb-2 max-h-60 overflow-auto rounded-xl border border-border bg-card" data-inline-diff-preview={true}>
        <HighlightedCodeLines
          className="h-full bg-card"
          codePreviewSettings={codePreviewSettings}
          data-inline-diff-highlight-language={language}
          data-inline-diff-highlight-theme={highlightTheme}
          language={language}
          lines={lines}
          path={preview.path ?? preview.title}
          theme={highlightTheme}
        />
      </div>
    </div>
  );
});
EditInlineDiffContent.displayName = "EditInlineDiffContent";

/** 原 Aft/jft：翻牌动画参数 + 降动效侦听 */
const DIGIT_FLIP_TRANSITION = { duration: 0.16, ease: [0.4, 0, 0.2, 1] as const };
declare const MotionPresence: React.FC<{ initial?: boolean; children?: React.ReactNode }>;
declare const motion: { span: React.FC<React.HTMLAttributes<HTMLSpanElement> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown; style?: React.CSSProperties; children?: React.ReactNode }> };
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReduced(query.matches);
    };
    onChange();
    if (typeof query.addEventListener == "function") {
      query.addEventListener("change", onChange);
      return () => {
        query.removeEventListener("change", onChange);
      };
    }
    query.addListener(onChange);
    return () => {
      query.removeListener(onChange);
    };
  }, []);
  return reduced;
}
/** 原 Mft/Nft：数字/标点宽度类 */
function isDigitChar(char: string): boolean {
  return /^[0-9]$/.test(char);
}
function digitWidthClass(char: string): string {
  return isDigitChar(char) ? "w-[0.66em]" : char === ":" || char === "." ? "w-[0.34em]" : "w-[0.7em]";
}
/** 原 Pft：单字符翻牌（数字翻转动效，降动效时静态） */
function FlipDigit({ character, index, reducedMotion }: { character: string; index: number; reducedMotion: boolean }) {
  const widthClass = digitWidthClass(character);
  return !isDigitChar(character) || reducedMotion ? (
    <span aria-hidden="true" className={cn("inline-flex h-[1.15em] shrink-0 items-center justify-center leading-none", widthClass)}>
      {character}
    </span>
  ) : (
    <span aria-hidden="true" className={cn("relative inline-flex h-[1.15em] shrink-0 items-center justify-center overflow-hidden leading-none [perspective:8em]", widthClass)}>
      <MotionPresence initial={false}>
        <motion.span
          key={`${index}-${character}`}
          className="absolute inset-0 flex items-center justify-center leading-none"
          initial={{ rotateX: -90, y: "-0.45em", opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          exit={{ rotateX: 90, y: "0.45em", opacity: 0 }}
          style={{ transformOrigin: "50% 50%" }}
          transition={DIGIT_FLIP_TRANSITION}
        >
          {character}
        </motion.span>
      </MotionPresence>
    </span>
  );
}
/** 原 Fft：数值串翻牌容器 */
function FlipNumberText({ value, className }: { value: string; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const chars = React.useMemo(() => Array.from(value), [value]);
  return (
    <span aria-label={value} className={cn("inline-flex max-w-full items-center overflow-hidden whitespace-nowrap align-middle leading-none", className)} role="text" title={value}>
      {chars.map((char, index) => (
        <FlipDigit key={index} character={char} index={index} reducedMotion={reducedMotion} />
      ))}
    </span>
  );
}
/** 原 Ift：+added / -removed 差异计数徽章 */
function DiffCountBadge({ summary }: { summary: { added: number; removed: number } | null }) {
  if (!summary || (summary.added <= 0 && summary.removed <= 0)) return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono leading-none tabular-nums">
      {summary.added > 0 ? (
        <span aria-label={`+${summary.added}`} className="inline-flex items-center text-diff-added" role="text" title={`+${summary.added}`}>
          {"+"}
          <FlipNumberText value={String(summary.added)} />
        </span>
      ) : null}
      {summary.removed > 0 ? (
        <span aria-label={`-${summary.removed}`} className="inline-flex items-center text-diff-removed" role="text" title={`-${summary.removed}`}>
          {"-"}
          <FlipNumberText value={String(summary.removed)} />
        </span>
      ) : null}
    </span>
  );
}
/** 原 Lft：文件摘要标签（图标 + 文件名，可点击） */
function FileSummaryLabel({
  summary,
  clickable = false,
  onClick,
  title,
  basePath,
}: {
  summary: FileSummary;
  clickable?: boolean;
  onClick?: () => void;
  title?: string;
  basePath?: string;
}) {
  const icon = resolveFileIconMeta(summary.path, { basePath });
  const label = title ?? resolvePathTitle(summary.path, basePath);
  return clickable ? (
    <button
      type="button"
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-foreground hover:underline"
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <FileIcon src={icon.fileIconSrc} size={16} className="size-4 shrink-0" />
      <span className="min-w-0 truncate text-foreground">{baseName(summary.path)}</span>
    </button>
  ) : (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-foreground" title={label}>
      <FileIcon src={icon.fileIconSrc} size={16} className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{baseName(summary.path)}</span>
    </span>
  );
}
/** 原 HQ：次级路径文本 */
function PathSecondaryText(path: string | null | undefined, basePath?: string): React.ReactNode {
  return path ? <span className="min-w-0 truncate text-foreground-subtlest">{resolvePathTitle(path, basePath)}</span> : null;
}
/** 原 Fhe + Rft：编辑动作标签（write/delete/edit × 进行中） */
declare function resolveFileOperation(toolCallish: { kind: string; title?: string | null; input?: unknown; output?: unknown; raw?: unknown }, operationKind?: string): string;
function resolveEditKindLabel(operationKinds: Array<string | undefined>, actionLabels: Array<string | undefined>, isRunning: boolean, toolCallish: { kind: string; title?: string | null; input?: unknown; output?: unknown; raw?: unknown }): string {
  const operation = resolveFileOperation(toolCallish, operationKinds[0]);
  return operation === "write"
    ? isRunning
      ? "chat.toolCall.edit.writing"
      : "chat.toolCall.edit.wrote"
    : operation === "delete"
      ? isRunning
        ? "chat.toolCall.edit.deleting"
        : "chat.toolCall.edit.deleted"
      : isRunning
        ? "chat.toolCall.edit.editing"
        : "chat.toolCall.edit.edited";
}
/** 原 zft：文件摘要列表（逗号分隔） */
function FileSummaryList(summaries: FileSummary[], options: { clickable?: boolean; basePath?: string; onClick?: (summary: FileSummary) => void } = {}): React.ReactNode {
  return (
    <div className="inline-flex min-w-0 items-center">
      {summaries.map((summary, index) => (
        <span key={summary.path} className="inline-flex min-w-0 items-center">
          {index > 0 ? <span className="mx-1 text-foreground-subtlest">{","}</span> : null}
          <FileSummaryLabel
            summary={summary}
            clickable={options.clickable}
            basePath={options.basePath}
            onClick={options.onClick ? () => options.onClick?.(summary) : undefined}
          />
        </span>
      ))}
    </div>
  );
}
/** 原 Bft/Vft/Hft：编辑图标与折叠预设 */
const EDIT_TOOL_ICON = <IconPencil className="size-4 shrink-0 text-foreground-subtle" />;
const EDIT_TOGGLE_PRESET = { canToggle: true, forceOpen: false };
const EDIT_ROW_TOGGLE_PRESET = { canToggle: true, forceOpen: false };
/** 原 Uft：raw.status === 'failed' 判定 */
function isRawFailed(raw: unknown): boolean {
  if (typeof raw != "object" || !raw || Array.isArray(raw)) return false;
  const { status } = raw as { status?: unknown };
  return typeof status == "string" && status === "failed";
}
/** 原 UQ：文件摘要 → 代码查看目标 */
function toCodeViewerTarget(summary: FileSummary): { type: "patch"; title: string; path: string; patch: string } | { type: "file"; title: string; path: string } {
  return summary.patch
    ? { type: "patch", title: summary.fileName, path: summary.path, patch: summary.patch }
    : { type: "file", title: summary.fileName, path: summary.path };
}
/** 原 Wft：单文件 patch → 内联预览源 */
function toPatchPreview(summary: FileSummary | null): { type: "patch"; source: { type: "patch"; title: string; path: string; patch: string } } | undefined {
  if (!summary?.patch) return undefined;
  const target = toCodeViewerTarget(summary);
  if (target.type === "patch") return { type: "patch", source: target };
  return undefined;
}

/** 原 Kft（— / 90290）：多文件编辑中的单文件行 */
function FileWriteChildRow({
  summary,
  isRunning,
  statusLabel,
  errorText,
  toolId,
  isFailed,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenBrowserUrl,
  childToolList,
  displayModel,
  toolCall,
  workspacePath,
  theme,
  codePreviewSettings,
  showIcon = true,
  sourceLabel,
}: {
  summary: FileSummary;
  isRunning: boolean;
  statusLabel: string;
  errorText?: string;
  toolId: string;
  isFailed: boolean;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  childToolList: React.ReactNode;
  displayModel: ToolDisplayModel;
  toolCall: ToolCall;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  showIcon?: boolean;
  sourceLabel?: string;
}) {
  const { intl } = useIntlContext();
  const kindLabel = intl.formatMessage({ id: resolveEditKindLabel([summary.operationKind], [summary.actionLabel], isRunning, toolCall) });
  const patchPreview = toPatchPreview(summary);
  const openInViewer = React.useCallback(() => {
    if (onOpenCodeViewer) onOpenCodeViewer(toCodeViewerTarget(summary));
  }, [onOpenCodeViewer, summary]);
  const primaryText = React.useMemo(
    () => <FileSummaryLabel summary={summary} clickable={!!onOpenCodeViewer} basePath={workspacePath} onClick={openInViewer} />,
    [onOpenCodeViewer, openInViewer, summary, workspacePath],
  );
  const secondaryText = React.useMemo(() => PathSecondaryText(summary.filePath, workspacePath), [summary.filePath, workspacePath]);
  const diffCount = React.useMemo(() => <DiffCountBadge summary={summary.changeStat ?? null} />, [summary.changeStat]);
  const rowTitle = React.useMemo(() => resolvePathTitle(summary.filePath ?? summary.path, workspacePath), [summary.filePath, summary.path, workspacePath]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3">
        {patchPreview?.type === "patch" ? <EditInlineDiffContent preview={patchPreview.source} theme={theme} codePreviewSettings={codePreviewSettings} /> : null}
        <ToolCallExpandedContent
          childToolList={childToolList}
          displayModel={displayModel}
          inlinePreviewOverride={patchPreview?.type === "patch" ? { type: "none" } : undefined}
          toolCall={toolCall}
          workspacePath={workspacePath}
          theme={theme}
          codePreviewSettings={codePreviewSettings}
          onOpenCodeViewer={onOpenCodeViewer}
          onOpenFileLink={onOpenFileLink}
          onOpenBrowserUrl={onOpenBrowserUrl}
        />
      </div>
    ),
    [childToolList, codePreviewSettings, displayModel, patchPreview, onOpenBrowserUrl, onOpenCodeViewer, onOpenFileLink, theme, toolCall, workspacePath],
  );
  return (
    <>
      <ToolLayout
        toolId={toolId}
        icon={EDIT_TOOL_ICON}
        showIcon={showIcon !== false}
        {...EDIT_ROW_TOGGLE_PRESET}
        kindLabel={kindLabel}
        sourceLabel={sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        diffCount={diffCount}
        statusLabel={statusLabel}
        statusTooltip={isFailed ? errorText : undefined}
        showFailureStatus={isFailed}
        isRunning={isRunning}
        title={rowTitle}
        renderContent={renderContent}
      />
    </>
  );
}

/** 原 Gft（104844 / 90186）：FileWriteToolView */
export function FileWriteToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, rawFileSummaries, isRunning, statusLabel, errorText, onOpenCodeViewer } = props;
  const { toolCall } = toolCallNode;
  const multiple = rawFileSummaries.length > 1;
  const failed = toolCall.status === "failed" || isRawFailed(toolCall.raw) || !!errorText;
  const displayedStatus = failed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : statusLabel;
  const openSummary = React.useCallback(
    (summary: FileSummary) => {
      if (onOpenCodeViewer) onOpenCodeViewer(toCodeViewerTarget(summary));
    },
    [onOpenCodeViewer],
  );
  const primaryText = React.useMemo(
    () =>
      rawFileSummaries.length > 0
        ? FileSummaryList(rawFileSummaries, { clickable: !!onOpenCodeViewer, basePath: props.workspacePath, onClick: openSummary })
        : null,
    [props.workspacePath, onOpenCodeViewer, openSummary, rawFileSummaries],
  );
  const secondaryText = React.useMemo(
    () => (rawFileSummaries.length === 1 ? PathSecondaryText(rawFileSummaries[0]?.filePath, props.workspacePath) : undefined),
    [props.workspacePath, rawFileSummaries],
  );
  const aggregated = React.useMemo(
    () =>
      rawFileSummaries.reduce(
        (acc, summary) =>
          summary.changeStat ? { added: acc.added + summary.changeStat.added, removed: acc.removed + summary.changeStat.removed } : acc,
        { added: 0, removed: 0 },
      ),
    [rawFileSummaries],
  );
  const diffCount = React.useMemo(() => <DiffCountBadge summary={aggregated} />, [aggregated]);
  const kindLabel = intl.formatMessage({
    id: resolveEditKindLabel(
      rawFileSummaries.map((summary) => summary.operationKind),
      rawFileSummaries.map((summary) => summary.actionLabel),
      isRunning,
      { kind: toolCall.kind, title: toolCall.title, input: toolCall.input, output: toolCall.output, raw: toolCall.raw },
    ),
  });
  const togglePreset = multiple ? { canToggle: true, forceOpen: false, autoOpen: false } : EDIT_TOGGLE_PRESET;
  const expandedPrimaryText = React.useMemo(
    () =>
      rawFileSummaries.length > 1 ? (
        <span>
          {intl.formatMessage({ id: "chat.toolCall.edit.multipleFiles" }, { count: String(rawFileSummaries.length) })}
        </span>
      ) : (
        primaryText
      ),
    [intl, primaryText, rawFileSummaries.length],
  );
  const singlePatch = toPatchPreview(rawFileSummaries.length === 1 ? (rawFileSummaries[0] ?? null) : null);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () =>
      rawFileSummaries.length === 0 ? (
        <>
          <ToolCallExpandedContent
            childToolList={null}
            displayModel={props.displayModel}
            toolCall={toolCall}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
          <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        </>
      ) : multiple ? (
        <>
          <div className="ml-2 space-y-2 border-border border-l pl-3.5 border-border">
            {rawFileSummaries.map((summary, index) => (
              <FileWriteChildRow
                key={`${summary.path}:${index}`}
                summary={summary}
                isRunning={isRunning}
                statusLabel={displayedStatus}
                errorText={errorText}
                toolId={`${toolCall.toolId}:${index}`}
                isFailed={failed}
                onOpenCodeViewer={props.onOpenCodeViewer}
                onOpenFileLink={props.onOpenFileLink}
                onOpenBrowserUrl={props.onOpenBrowserUrl}
                childToolList={null}
                displayModel={props.displayModel}
                toolCall={toolCall}
                workspacePath={props.workspacePath}
                theme={props.theme}
                codePreviewSettings={props.codePreviewSettings}
                showIcon={false}
                sourceLabel={props.sourceLabel}
              />
            ))}
            <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {singlePatch?.type === "patch" ? <EditInlineDiffContent preview={singlePatch.source} theme={props.theme} codePreviewSettings={props.codePreviewSettings} /> : null}
            <ToolCallExpandedContent
              childToolList={props.childToolList}
              displayModel={props.displayModel}
              inlinePreviewOverride={singlePatch?.type === "patch" ? { type: "none" } : undefined}
              toolCall={toolCall}
              workspacePath={props.workspacePath}
              theme={props.theme}
              codePreviewSettings={props.codePreviewSettings}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink}
              onOpenBrowserUrl={props.onOpenBrowserUrl}
            />
            <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
          </div>
        </>
      ),
    [props.childToolList, props.codePreviewSettings, props.displayModel, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.sourceLabel, props.theme, props.workspacePath, displayedStatus, errorText, loadFull, multiple, failed, isRunning, rawFileSummaries, singlePatch, toolCall],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={EDIT_TOOL_ICON}
        showIcon={props.showIcon !== false}
        {...togglePreset}
        kindLabel={(props.kindLabelOverride as string) ?? kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        expandedPrimaryText={expandedPrimaryText}
        secondaryText={secondaryText}
        diffCount={diffCount}
        hideDiffCountWhenOpen={multiple}
        statusLabel={displayedStatus}
        statusTooltip={failed ? errorText : undefined}
        showFailureStatus={failed}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
    </>
  );
}

/* ---- 原 opt（105465 / 90659）：FileReadToolView ---- */

/** 原 ipt：toolCall → 文件入口（entryType/file/fileName/path/filePath） */
declare function resolveFileReadEntry(toolCall: ToolCall): {
  entryType: string;
  fileName: string;
  path: string;
  filePath?: string | null;
} | null;
/** 原 apt：可读文件摘要标签 */
declare const ReadSummaryLabel: React.FC<{ summary: NonNullable<ReturnType<typeof resolveFileReadEntry>>; clickable: boolean; onClick: () => void }>;
const READ_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function FileReadToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText, onOpenCodeViewer } = props;
  const { toolCall } = toolCallNode;
  const entry = resolveFileReadEntry(toolCall);
  const clickable = entry?.entryType === "file" && !!onOpenCodeViewer;
  const openEntry = React.useCallback(() => {
    if (!entry || entry.entryType !== "file" || !onOpenCodeViewer) return;
    onOpenCodeViewer({ type: "file", title: entry.fileName, path: entry.path });
  }, [onOpenCodeViewer, entry]);
  const primaryText = React.useMemo(
    () =>
      entry ? (
        <ReadSummaryLabel summary={entry} clickable={clickable} onClick={openEntry} />
      ) : (
        toolCall.title ?? toolCall.kind ?? intl.formatMessage({ id: "chat.toolCall.read.read" })
      ),
    [clickable, intl, openEntry, entry, toolCall.kind, toolCall.title],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={READ_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.toolCall.read.reading" : "chat.toolCall.read.read" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={entry ? PathSecondaryText(entry.filePath) : undefined}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        content={null}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 upt（105569 / 90768）：SearchToolView + lpt ---- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value == "object" && !!value && !Array.isArray(value);
}
/** 原 lpt（— / 90700）：搜索类工具主文本（list_files/search/grep/glob + 通用字段回退） */
function resolveSearchLabel(intl: IntlShape, input: unknown): string {
  if (typeof input == "string") {
    const trimmed = input.trim();
    return trimmed.length > 0
      ? intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query: trimmed })
      : intl.formatMessage({ id: "chat.toolCall.search.find" });
  }
  if (!isPlainObject(input)) return intl.formatMessage({ id: "chat.toolCall.search.find" });
  const parsedCmd = input.parsed_cmd;
  if (Array.isArray(parsedCmd)) {
    for (const item of parsedCmd) {
      if (!isPlainObject(item) || typeof item.type != "string") continue;
      if (item.type === "list_files") {
        const cwd = typeof input.cwd == "string" && input.cwd.trim().length > 0 ? input.cwd.trim().replace(/\/+$/, "") : undefined;
        return cwd
          ? intl.formatMessage({ id: "chat.toolCall.search.listIn" }, { cwd })
          : intl.formatMessage({ id: "chat.toolCall.search.list" });
      }
      if (item.type === "search" || item.type === "grep" || item.type === "glob") {
        const query =
          typeof item.pattern == "string" ? item.pattern.trim() : typeof item.query == "string" ? item.query.trim() : typeof item.path == "string" ? item.path.trim() : "";
        return query.length > 0
          ? intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query })
          : intl.formatMessage({ id: "chat.toolCall.search.find" });
      }
    }
  }
  for (const field of ["search_query", "searchQuery", "query", "pattern", "path", "url", "prompt", "target", "name"]) {
    const value = input[field];
    if (typeof value != "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query: trimmed });
  }
  return intl.formatMessage({ id: "chat.toolCall.search.find" });
}
const SEARCH_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function SearchToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const label = resolveSearchLabel(intl, toolCall.input);
  const primaryText = React.useMemo(() => <span className="truncate">{label}</span>, [label]);
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SEARCH_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        kindLabel={(props.kindLabelOverride as string) ?? intl.formatMessage({ id: isRunning ? "chat.toolCall.search.searching" : "chat.toolCall.search.searched" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        content={null}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Spt（105825 / 91001）：ExploreToolView + 命令分桶 ---- */

/** 原 ppt：剥离 shell -lc 包裹 */
function unwrapShellCommand(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:\/bin\/)?(?:zsh|bash|sh)\s+-lc\s+([\s\S]+)$/i);
  if (!match?.[1]) return trimmed;
  const inner = match[1].trim();
  return (inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'")) ? inner.slice(1, -1).trim() : inner;
}
/** 原 mpt：input → 命令列表（字符串/数组/parsed_cmd，&&/||/; 切分去重） */
function extractCommands(input: unknown): string[] {
  const commands: string[] = [];
  const push = (value: unknown) => {
    if (typeof value == "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) commands.push(trimmed);
      return;
    }
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item == "string")) {
        const list = value as string[];
        const lcIndex = list.findIndex((item) => item === "-lc");
        if (lcIndex >= 0 && typeof list[lcIndex + 1] == "string") {
          const inner = list[lcIndex + 1].trim();
          if (inner.length > 0) {
            commands.push(inner);
            return;
          }
        }
        const joined = list.join(" ").trim();
        if (joined.length > 0) commands.push(joined);
        return;
      }
      for (const item of value) {
        if (!isPlainObject(item)) continue;
        const cmd = item.cmd;
        if (typeof cmd == "string" && cmd.trim().length > 0) commands.push(cmd.trim());
      }
    }
  };
  push(input);
  if (isPlainObject(input)) {
    for (const field of ["command", "cmd", "script", "parsed_cmd"]) push(input[field]);
  }
  return Array.from(new Set(commands.flatMap((command) => unwrapShellCommand(command).split(/&&|\|\||;/g))))
    .map((command) => command.trim())
    .filter(Boolean);
}
/** 原 hpt：子调用 → 桶（search/list/file） */
function classifyExploreBucket(entry: { kind: string; title?: string | null; input?: unknown }): "search" | "list" | "file" {
  const head = `${entry.kind} ${entry.title ?? ""}`.toLowerCase();
  const body = extractCommands(entry.input).join(" ; ").toLowerCase();
  if (/(\bgrep\b|\bsearch\b|\bfetch\b|\bweb.?search\b|\bweb.?fetch\b)/i.test(head) || /(^|\s)(rg|grep|ripgrep|git\s+grep)(\s|$)/i.test(body)) return "search";
  if (/(\bglob\b|\bfind\b|\blist\b|\btree\b|\bdir\b|\bls\b)/i.test(head) || /(^|\s)(ls|find|tree|dir)(\s|$)/i.test(body)) return "list";
  return "file";
}
/** 原 $Q：桶计数文案 */
function exploreBucketLabel(intl: IntlShape, bucket: "search" | "list" | "file" | string, count: number): string {
  switch (bucket) {
    case "search":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.search.one" : "chat.toolCall.explore.bucket.search.other" });
    case "list":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.list.one" : "chat.toolCall.explore.bucket.list.other" });
    case "file":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.file.one" : "chat.toolCall.explore.bucket.file.other" });
    default:
      return intl.formatMessage({ id: "chat.toolCall.explore.bucket.items" });
  }
}
/** 原 gpt：桶计数 → 摘要串 */
function formatExploreSummary(intl: IntlShape, counts: { search: number; list: number; file: number }): string {
  const parts: string[] = [];
  if (counts.search > 0) parts.push(`${counts.search} ${exploreBucketLabel(intl, "search", counts.search)}`);
  if (counts.list > 0) parts.push(`${counts.list} ${exploreBucketLabel(intl, "list", counts.list)}`);
  if (counts.file > 0) parts.push(`${counts.file} ${exploreBucketLabel(intl, "file", counts.file)}`);
  return parts.length > 0 ? parts.join(", ") : intl.formatMessage({ id: "chat.toolCall.explore.emptySummary" });
}
const EXPLORE_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function ExploreToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall, childToolCalls = [] } = toolCallNode;
  const summary = formatExploreSummary(
    intl,
    childToolCalls.reduce(
      (counts, child) => {
        const bucket = classifyExploreBucket({ kind: child.toolCall.kind, title: child.toolCall.title, input: child.toolCall.input });
        counts[bucket] += 1;
        return counts;
      },
      { search: 0, list: 0, file: 0 },
    ),
  );
  const kindLabel = intl.formatMessage({ id: "chat.toolCall.explore.label" });
  const streaming = isRunning ? resolveStreamingChildSummary(intl, childToolCalls, props, { includeChildActionKindLabel: true }) : null;
  const renderContent = React.useCallback(
    () =>
      childToolCalls.length > 0 ? (
        <div className="ml-2 space-y-2 border-border border-l pl-3.5 border-border">
          {childToolCalls.map((child) => (
            <ToolCallBlock
              key={child.toolCall.toolId}
              toolCallNode={child}
              workspacePath={props.workspacePath}
              showIcon={false}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink}
              onOpenBrowserUrl={props.onOpenBrowserUrl}
              onOpenAutomationsMain={props.onOpenAutomationsMain}
              onLoadFullToolCallFields={props.onLoadFullToolCallFields}
              displayModel={props.displayModel}
              rawFileSummaries={[]}
              isRunning={isRunning}
              statusLabel={statusLabel}
              childToolList={null}
              viewerSource={null}
              showTodoToolCalls
              disableSummaryContentAnimation={false}
            />
          ))}
        </div>
      ) : null,
    [childToolCalls, props.onLoadFullToolCallFields, props.onOpenAutomationsMain, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.workspacePath, props.displayModel, isRunning, statusLabel],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={EXPLORE_TOOL_ICON}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        kindLabel={kindLabel}
        expandedKindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={streaming ? streaming.primaryText : summary}
        expandedPrimaryText={summary}
        secondaryText={streaming?.secondaryText}
        expandedSecondaryText={null}
        summaryContentSeparator="·"
        animateSummaryContent
        disableSummaryContentAnimation={props.disableSummaryContentAnimation}
        summaryContentKey={streaming?.animationKey ?? `explore:${toolCall.toolId}:${isRunning ? "running" : "done"}:${summary}`}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={streaming?.title ?? (isRunning ? summary : toolCall.title)}
        expandedTitle={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Vpt（106243 / 91282）：AgentToolView ---- */

/** 原 Ppt/Npt/Opt/l$/kpt/jpt/Mpt：代理提示/回退名/类型解析/颜色哈希/输出抽取 */
declare function extractAgentPrompt(toolCall: ToolCall): string | null; // Ppt
declare function fallbackMessage(intl: IntlShape, id: string, fallback: string): string; // t$
declare function resolveAgentFallbackName(toolCall: ToolCall, fallback: string): string; // Npt
declare function resolveAgentTypeLabel(toolCall: ToolCall, fallback: string, authoritative?: string): string | null; // Opt
declare function normalizeAgentName(value: string): string | null; // l$
declare function resolveAgentColorHash(toolCall: ToolCall): string | undefined; // kpt
declare function extractAgentOutputFile(toolCall: ToolCall): { outputFile: string; [key: string]: unknown } | null; // jpt
declare function extractAgentOutputText(toolCall: ToolCall): string | null; // Mpt
/** 原 Fpt/Lpt/Rpt：提示/子调用列表/标签段 */
declare const AgentPromptBlock: React.FC<{
  prompt: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
declare const AgentChildToolList: React.FC<ToolCallViewProps & { childToolCalls: ToolCallNode[] }>;
declare const AgentLabeledBlock: React.FC<{
  label: string;
  content: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
declare const AgentOutputFileCard: React.FC<{ outputFile: string; hasActivity: boolean; isRunning: boolean; status: string }>;
/** 原 zpt：代理名色点徽章 */
declare const AgentColorBadge: React.FC<{ color: string; name: string }>;
/** 原 Xft/Yft：名称哈希色 */
function hashPaletteColor(name: string): string {
  const palette = ["yellow", "red", "orange", "green", "cyan", "blue", "purple", "pink"];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  return palette[hash % palette.length] ?? "blue";
}
const AGENT_TOOL_ICON = <IconBot className="size-4 shrink-0 text-foreground-subtle" />;

export function AgentToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall, childToolCalls = [] } = props.toolCallNode;
  const prompt = extractAgentPrompt(toolCall);
  const kindLabel = fallbackMessage(intl, "chat.toolCall.agent.fallback", "SubAgent");
  const fallbackName = resolveAgentFallbackName(toolCall, kindLabel);
  const typeLabel = resolveAgentTypeLabel(toolCall, "", props.authoritativeAgentType);
  const workspaceAgents = useWorkspaceAgents(props.workspacePath);
  const globalAgents = useGlobalAgents();
  const agents = workspaceAgents && workspaceAgents.length > 0 ? workspaceAgents : globalAgents.length > 0 ? globalAgents : getGlobalAgents();
  const agentColor = React.useMemo(() => {
    const normalized = normalizeAgentName(typeLabel ?? "");
    if (!normalized) return undefined;
    return agents.find((agent) => {
      const byName = normalizeAgentName(agent.name);
      const byId = normalizeAgentName(agent.id);
      return byName === normalized || byId === normalized;
    })?.color;
  }, [typeLabel, agents]);
  const colorBadge =
    typeLabel && agentColor ? <AgentColorBadge color={agentColor} name={typeLabel} /> : null;
  const streaming = props.isRunning ? resolveStreamingChildSummary(intl, childToolCalls, props, { includeChildActionKindLabel: true }) : null;
  const outputFile = extractAgentOutputFile(toolCall);
  const outputText = extractAgentOutputText(toolCall);
  const thought = toolCall.thought?.trim();
  const primaryText = React.useMemo(() => <span className="truncate">{fallbackName}</span>, [fallbackName]);
  const summaryAction = React.useMemo(
    () =>
      props.agentSummaryAction
        ? ({ ...props.agentSummaryAction, ariaLabel: fallbackMessage(intl, "chat.toolCall.agent.openInSidePane", "Open on the right") } as {
            testId?: string;
            ariaLabel: string;
            onActivate: () => void;
          }) /* A0-D 类型垫片：agentSummaryAction 运行时含 onActivate（Conversation 透传 unknown） */
        : undefined,
    [props.agentSummaryAction, intl],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="ml-2 space-y-3 border-border border-l pl-3.5">
        {outputFile ? <AgentOutputFileCard outputFile={outputFile.outputFile} hasActivity={!!(outputText || thought)} isRunning={props.isRunning} status={toolCall.status} /> : null}
        {prompt ? (
          <AgentPromptBlock
            prompt={prompt}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        {thought ? (
          <AgentLabeledBlock
            label={fallbackMessage(intl, "chat.toolCall.agent.thought", "Agent thought")}
            content={thought}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        {outputText ? (
          <AgentLabeledBlock
            label={fallbackMessage(intl, "chat.toolCall.agent.output", "Agent output")}
            content={outputText}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        <AgentChildToolList {...props} childToolCalls={childToolCalls} />
      </div>
    ),
    [outputText, thought, outputFile, childToolCalls, props, intl, toolCall.status],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={AGENT_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        forceOpen={false}
        summaryAction={summaryAction}
        kindLabel={kindLabel}
        expandedKindLabel={kindLabel}
        kindDetail={colorBadge}
        expandedKindDetail={colorBadge}
        sourceLabel={undefined}
        autoCollapseOnComplete
        primaryText={streaming ? streaming.primaryText : primaryText}
        expandedPrimaryText={primaryText}
        secondaryText={streaming?.secondaryText}
        expandedSecondaryText={null}
        summaryContentSeparator="·"
        animateSummaryContent
        disableSummaryContentAnimation={props.disableSummaryContentAnimation}
        summaryContentKey={streaming?.animationKey ?? `agent:${toolCall.toolId}:${fallbackName}`}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={streaming?.title ?? fallbackName}
        expandedTitle={fallbackName}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Qpt（106609 / 91478）+ Hpt/Xpt/Ypt：FallbackToolView + CUA 权限引导 ---- */

/** 原 Upt/Wpt/Gpt/Kpt/qpt/Jpt/f$/p$：CUA 工具与权限失败判定 */
function nestedToolName(value: unknown): string | null {
  if (!isPlainObject(value)) return null;
  const plain = (v: unknown) => (typeof v == "string" && v.trim().length > 0 ? v.trim() : null);
  return (
    plain(value.toolName) ??
    plain(value.tool_name) ??
    plain(value.name) ??
    (isPlainObject(value._meta) && isPlainObject(value._meta.zcode) ? plain((value._meta.zcode as Record<string, unknown>).toolName) : null)
  );
}
function normalizeToolNameForMatch(name?: string | null): string {
  return name?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}
function isCuaToolName(name?: string | null): boolean {
  const normalized = normalizeToolNameForMatch(name);
  return normalized === "zcode-cua" || normalized.startsWith("mcp--zcode-cua--");
}
function isCuaAccessRequestName(name?: string | null): boolean {
  return normalizeToolNameForMatch(name).includes("request-access");
}
function cuaCandidateNames(toolCall: ToolCall): string[] {
  return [
    typeof toolCall.toolName == "string" ? toolCall.toolName : null,
    typeof toolCall.kind == "string" ? toolCall.kind : null,
    typeof toolCall.title == "string" ? toolCall.title : null,
    nestedToolName(toolCall.raw),
  ].filter((name): name is string => name !== null);
}
function parseJsonish(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  if (typeof value == "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}
const CUA_PERMISSION_PATTERN = /accessibility|辅助功能|screen[_ -]?recording|screen[_ -]?capture|屏幕录制/i;
function mentionsCuaPermission(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  const parsed = parseJsonish(value, depth);
  if (typeof parsed == "string") return CUA_PERMISSION_PATTERN.test(parsed);
  if (Array.isArray(parsed)) return parsed.some((item) => mentionsCuaPermission(item, depth + 1));
  if (isPlainObject(parsed)) {
    return Object.entries(parsed).some(([key, item]) => CUA_PERMISSION_PATTERN.test(key) || mentionsCuaPermission(item, depth + 1));
  }
  return false;
}
function isCuaPermissionDenied(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  const parsed = parseJsonish(value, depth);
  if (typeof parsed == "string") {
    return (
      CUA_PERMISSION_PATTERN.test(parsed) &&
      /(denied|not granted|permission|action_required|zcode cua helper|未授权|没有获得)/i.test(parsed)
    );
  }
  if (Array.isArray(parsed)) return parsed.some((item) => isCuaPermissionDenied(item, depth + 1));
  if (!isPlainObject(parsed)) return false;
  for (const [key, raw] of Object.entries(parsed)) {
    const text = typeof raw == "string" ? raw.toLowerCase() : null;
    const field = key.toLowerCase();
    if (
      (field === "accessibility" && raw === false) ||
      (field === "input_permission" && text === "denied") ||
      (field === "screen_recording" && text !== null && text !== "granted") ||
      (field === "screen_capture_available" && raw === false) ||
      (field === "status_after" && text === "denied") ||
      (field === "action_required" && text?.includes("accessibility")) ||
      (field === "missing" && Array.isArray(raw) && raw.some((item) => item === "accessibility" || item === "screen_recording")) ||
      (field === "blocked_by" && Array.isArray(raw) && (raw.includes("accessibility") || raw.includes("screen_recording"))) ||
      isCuaPermissionDenied(raw, depth + 1)
    ) {
      return true;
    }
  }
  return false;
}
/** 原 Ypt：CUA 工具且输出含权限拒绝 */
function isCuaPermissionFailure(toolCall: ToolCall): boolean {
  return cuaCandidateNames(toolCall).some(isCuaToolName) ? isCuaPermissionDenied(toolCall.output) || isCuaPermissionDenied(toolCall.error) : false;
}
/** 原 Xpt（106604 / 91469）：切模式请求判定（zcode-cua + request-access/描述提及） */
export function isCuaAccessRequest(entry: { kind: string; title?: string | null; raw?: unknown; description?: unknown }): boolean {
  const names = cuaCandidateNames({ kind: entry.kind, title: entry.title, raw: entry.raw, toolId: "", toolName: entry.kind, status: "" });
  return names.some(isCuaToolName) ? names.some(isCuaAccessRequestName) || mentionsCuaPermission(entry.description) || mentionsCuaPermission(entry.raw) : false;
}

/** 原 Hpt（106405 / 91360）：CUA 权限引导面板（辅助功能/屏幕录制 + 拖拽助手） */
export function CuaPermissionOnboardingPanel({ platform }: { platform: PlatformService | null }) {
  const { intl } = useIntlContext();
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (typeof platform?.prepareCuaHelperPermissionDrag == "function") {
      platform.prepareCuaHelperPermissionDrag().catch(() => {});
    }
  }, [platform]);
  if (typeof platform?.openCuaPermissionOnboarding != "function" && typeof platform?.openCuaAccessibilitySettings != "function") return null;
  const open = async (permission: "accessibility" | "screen_recording") => {
    setBusy(true);
    try {
      const result =
        typeof platform.openCuaPermissionOnboarding == "function"
          ? await platform.openCuaPermissionOnboarding({ initialPermission: permission })
          : permission === "accessibility"
            ? await platform.openCuaAccessibilitySettings?.()
            : { success: false, error: "not_supported" };
      if (result?.success === false && !result.canceled) {
        logger.warn("[cuaPermission] open failed", { error: result.error ?? "unknown error" });
      }
    } catch (error) {
      logger.warn("[cuaPermission] open threw", { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void open("accessibility")}>
          {intl.formatMessage({ id: busy ? "chat.cuaPermission.opening" : "chat.cuaPermission.openAccessibility" })}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || typeof platform?.openCuaPermissionOnboarding != "function"}
          onClick={() => void open("screen_recording")}
        >
          {intl.formatMessage({ id: busy ? "chat.cuaPermission.opening" : "chat.cuaPermission.openScreenRecording" })}
        </Button>
      </div>
      <button
        type="button"
        draggable={typeof platform?.startCuaHelperPermissionDrag == "function"}
        disabled={typeof platform?.startCuaHelperPermissionDrag != "function"}
        aria-label={intl.formatMessage({ id: "chat.cuaPermission.dragTitle" })}
        className="flex min-w-0 cursor-grab items-center gap-3 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-left active:cursor-grabbing disabled:cursor-default disabled:opacity-70"
        onDragStart={(event) => {
          event.preventDefault();
          platform?.startCuaHelperPermissionDrag?.();
        }}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
          <IconGauge className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "chat.cuaPermission.dragTitle" })}</p>
          <p className="text-ui-base leading-5 text-foreground-subtle">{intl.formatMessage({ id: "chat.cuaPermission.helperPathHint" })}</p>
        </div>
        <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
      </button>
    </div>
  );
}
const FALLBACK_TOOL_ICON = <IconShield className="size-4 shrink-0 text-foreground-subtle" />;

export function FallbackToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const { toolCallNode, isRunning, statusLabel, errorText, childToolList, displayModel } = props;
  const { toolCall } = toolCallNode;
  const kindLabel = toolCall.kind.length > 0 ? toolCall.kind[0].toUpperCase() + toolCall.kind.slice(1) : toolCall.kind;
  const hasInlinePreview = displayModel.inlinePreview.type !== "none";
  const cuaFailure = isCuaPermissionFailure(toolCall);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <>
        <ToolCallExpandedContent
          childToolList={childToolList}
          displayModel={displayModel}
          toolCall={toolCall}
          workspacePath={props.workspacePath}
          theme={props.theme}
          codePreviewSettings={props.codePreviewSettings}
          onOpenCodeViewer={props.onOpenCodeViewer}
          onOpenFileLink={props.onOpenFileLink}
          onOpenBrowserUrl={props.onOpenBrowserUrl}
        />
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        {cuaFailure ? <CuaPermissionOnboardingPanel platform={platform} /> : null}
        {hasInlinePreview ? null : (
          <pre className="px-4 py-3 rounded-xl bg-surface text-ui-xs mt-1 text-foreground-subtle max-h-50 overflow-auto">{JSON.stringify(toolCall, null, 2)}</pre>
        )}
      </>
    ),
    [childToolList, displayModel, loadFull, hasInlinePreview, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.codePreviewSettings, props.theme, props.workspacePath, toolCall, cuaFailure, platform],
  );
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={FALLBACK_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={props.canToggle ?? true}
      forceOpen={props.forceOpen ?? false}
      kindLabel={(props.kindLabelOverride as string) ?? kindLabel}
      sourceLabel={props.sourceLabel}
      primaryText={toolCall.title ?? intl.formatMessage({ id: "chat.toolCall.toolCall" })}
      secondaryText={toolCall.status === "failed" ? undefined : statusLabel}
      statusLabel={toolCall.status === "failed" ? statusLabel : undefined}
      statusTooltip={toolCall.status === "failed" ? errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={isRunning}
      title={toolCall.title}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 omt（106753 / 91604）：GoalToolView ---- */

function jsonPath(value: unknown, path: string[]): unknown {
  let current: unknown = value;
  for (const key of path) {
    if (!isPlainObject(current)) return undefined;
    current = current[key];
  }
  return current;
}
function parseJsonText(value: unknown): unknown {
  if (typeof value != "string") return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}
function isEmptyValue(value: unknown): boolean {
  return value == null || (typeof value == "string" && value.trim().length === 0);
}
function stringifyLoose(value: unknown): string {
  if (typeof value == "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
function sameLooseValue(a: unknown, b: unknown): boolean {
  return isEmptyValue(a) || isEmptyValue(b) ? false : stringifyLoose(a) === stringifyLoose(b);
}
/** 原 nmt/rmt：goal 结果/内容多源抽取 */
function extractGoalResult(toolCall: ToolCall): unknown {
  for (const candidate of [toolCall.output, jsonPath(toolCall.raw, ["result", "content"]), jsonPath(toolCall.raw, ["rawOutput"]), jsonPath(toolCall.raw, ["output"])]) {
    const parsed = parseJsonText(candidate);
    if (!isEmptyValue(parsed)) return parsed;
  }
  return undefined;
}
function extractGoalContent(toolCall: ToolCall, result: unknown): unknown {
  for (const candidate of [toolCall.content, jsonPath(toolCall.raw, ["content"]), jsonPath(toolCall.raw, ["result", "display"])]) {
    const parsed = parseJsonText(candidate);
    if (!isEmptyValue(parsed) && !sameLooseValue(parsed, result)) return parsed;
  }
  return undefined;
}
/** 原 imt：goal 视图模型（result/content/thought/error 去重合并） */
function buildGoalViewModel(toolCall: ToolCall, errorText?: string): Record<string, unknown> {
  const result = extractGoalResult(toolCall);
  const content = extractGoalContent(toolCall, result);
  const thought = parseJsonText(toolCall.thought);
  const model: Record<string, unknown> = { status: toolCall.status };
  if (!isEmptyValue(result)) model.result = result;
  if (!isEmptyValue(content)) model.content = content;
  if (!isEmptyValue(thought) && !sameLooseValue(thought, result) && !sameLooseValue(thought, content)) model.thought = thought;
  if (errorText) model.error = errorText;
  return model;
}
function stringifyPretty(value: unknown): string {
  if (typeof value == "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
const GOAL_TOOL_ICON = <IconTarget className="size-4 shrink-0 text-foreground-subtle" />;

export function GoalToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const body = stringifyPretty(buildGoalViewModel(toolCall, props.errorText));
  const kindLabel = intl.formatMessage({ id: "chat.toolCall.goal.label" });
  const primaryText = React.useMemo(
    () => (
      <span className="min-w-0 truncate">{toolCall.title ?? kindLabel}</span>
    ),
    [kindLabel, toolCall.title],
  );
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <>
        <div className="space-y-2">
          <h4 className="text-ui-base font-medium uppercase tracking-wide text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.result" })}</h4>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface px-3 py-3 font-mono text-ui-base text-foreground">{body}</pre>
        </div>
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
      </>
    ),
    [loadFull, intl, body, toolCall.snapshotRefs, toolCall.toolId],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={GOAL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        kindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={toolCall.status === "failed" ? undefined : props.statusLabel}
        statusLabel={toolCall.status === "failed" ? props.statusLabel : undefined}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
    </>
  );
}

/* ---- 原 Nmt（107168 / 91932）：NodeReplToolView ---- */

interface NodeReplModel {
  operation: string;
  code?: string;
  title?: string;
  resultText?: string;
  images: Array<{ [key: string]: unknown }>;
  persistedResult?: { sizeLabel: string; artifactPath: string } | null;
  error?: { summary?: string; stack?: string } | null;
  displaySource?: string;
}
/** 原 Tmt：node-repl 视图模型归一（接口级解析） */
declare function buildNodeReplModel(toolCall: ToolCall): NodeReplModel;
/** 原 Mmt：状态标题模型 */
declare function resolveNodeReplStatus(
  model: NodeReplModel,
  status: string,
  isRunning: boolean,
  formatMessage: (id: string) => string,
): { title: string; status?: string | null; detail?: string | null };
/** 原 jmt/Amt：纯文本判定/JSON 判定 */
declare function isPlainTextOutput(text: string): boolean;
declare function looksLikeJson(text: string): boolean;
/** 原 Emt：结果图像列表 */
declare const NodeReplImageList: React.FC<{ images: Array<{ [key: string]: unknown }>; resultImageLabel: string }>;
const NODE_REPL_ICON = <IconTerminal className="size-4 shrink-0 text-foreground-subtle" />;

export function NodeReplToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const model = React.useMemo(() => buildNodeReplModel(toolCall), [toolCall]);
  const format = React.useCallback((id: string) => intl.formatMessage({ id }), [intl]);
  const statusModel = React.useMemo(() => resolveNodeReplStatus(model, toolCall.status, props.isRunning, format), [props.isRunning, format, model, toolCall.status]);
  const resultLabel = format("chat.toolCall.nodeRepl.result");
  const noResultLabel = format("chat.toolCall.nodeRepl.noResult");
  const detailsLabel = format("chat.toolCall.nodeRepl.details");
  const detailContentLabel = format("chat.toolCall.nodeRepl.detailContent");
  const technicalLabel = format("chat.toolCall.nodeRepl.technicalDetails");
  const copyResultLabel = format("chat.toolCall.nodeRepl.copyResult");
  const copyDetailsLabel = format("chat.toolCall.nodeRepl.copyDetails");
  const wrapLabel = format("chat.toolCall.nodeRepl.wrapLines");
  const imageLabel = format("chat.toolCall.nodeRepl.resultImage");
  const persistedLabel = model.persistedResult
    ? intl.formatMessage({ id: "chat.toolCall.nodeRepl.fullResult" }, { size: model.persistedResult.sizeLabel })
    : undefined;
  const errorText = toolCall.status === "failed" ? (model.error?.summary ?? props.errorText) : undefined;
  const hasDetails = !!(model.code || model.error?.stack);
  const hasResult = !!(errorText || model.resultText || model.images.length > 0 || model.persistedResult);
  const toggleable = (model.operation === "run" || toolCall.status === "failed") && (hasResult || hasDetails);
  const canToggle = props.canToggle ?? toggleable;
  const primaryText = React.useMemo(
    () => (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate font-medium text-foreground-subtle">{statusModel.title}</span>
        {statusModel.status ? (
          <span className="shrink-0 text-foreground-subtlest">{`· `}{statusModel.status}</span>
        ) : null}
        {statusModel.detail ? <code className="min-w-0 truncate font-mono text-foreground-subtlest">{statusModel.detail}</code> : null}
      </span>
    ),
    [statusModel.detail, statusModel.status, statusModel.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="mb-2 space-y-3 py-1" data-testid="node-repl-expanded-content">
        {errorText ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium text-destructive">{resultLabel}</h4>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{errorText}</p>
          </section>
        ) : model.resultText && isPlainTextOutput(model.resultText) ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="node-repl-result-surface">
            {model.resultText.trim()}
          </p>
        ) : model.resultText ? (
          <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-result-surface">
            <CodeSurface
              cardSurface
              code={model.resultText}
              copyLabel={copyResultLabel}
              eagerLayout
              label={resultLabel}
              language={looksLikeJson(model.resultText) ? "json" : "log"}
              wrapLabel={wrapLabel}
            />
          </div>
        ) : !props.isRunning && model.images.length === 0 ? (
          <p className="text-ui-base text-foreground-subtle">{noResultLabel}</p>
        ) : null}
        {model.images.length > 0 ? <NodeReplImageList images={model.images} resultImageLabel={imageLabel} /> : null}
        {model.persistedResult && persistedLabel ? (
          <div className="flex flex-wrap items-center gap-2 text-ui-base text-foreground-subtle">
            <span>{persistedLabel}</span>
            {props.onOpenCodeViewer ? (
              <Button
                type="button"
                variant="link"
                size="xs"
                className="px-0"
                onClick={() =>
                  props.onOpenCodeViewer?.({ type: "file", title: resultLabel, path: model.persistedResult?.artifactPath })
                }
              >
                {format("chat.toolCall.nodeRepl.openFullResult")}
                <IconExternal className="size-3" />
              </Button>
            ) : null}
          </div>
        ) : null}
        {hasDetails ? (
          <Collapsible className="group/details">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-foreground-subtlest hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground">
                <IconChevronRight className="size-3.5 transition-transform group-data-[state=open]/details:rotate-90" />
                {detailsLabel}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-2">
                {model.code ? (
                  <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-detail-surface">
                    <CodeSurface cardSurface code={model.code} copyLabel={copyDetailsLabel} eagerLayout label={detailContentLabel} language="javascript" wrapLabel={wrapLabel} />
                  </div>
                ) : null}
                {model.error?.stack ? (
                  <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-detail-surface">
                    <CodeSurface cardSurface code={model.error.stack} copyLabel={copyDetailsLabel} eagerLayout label={technicalLabel} language="log" wrapLabel={wrapLabel} />
                  </div>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </div>
    ),
    [props.isRunning, props.onOpenCodeViewer, copyDetailsLabel, copyResultLabel, detailContentLabel, detailsLabel, format, persistedLabel, hasDetails, model, noResultLabel, imageLabel, resultLabel, technicalLabel, errorText, wrapLabel],
  );
  if (model.displaySource === "browser_turn_end") return <NodeReplImageList images={model.images} resultImageLabel={imageLabel} />;
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={NODE_REPL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={canToggle}
        forceOpen={props.forceOpen ?? false}
        kindLabel={null}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined} />
    </>
  );
}

/* ---- 原 Wmt（107472 / 92099）：AutomationToolView（MCP 调用面） ---- */

interface McpToolInfo { serverName?: string; toolName?: string; description?: string }
/** 原 Vmt/Hmt/Umt/Rmt/Lmt/T$：MCP 信息归一/服务器名美化/工具名美化/输出文本/纯文本判定/JSON 判定 */
declare function extractMcpToolInfo(props: ToolCallViewProps): McpToolInfo | null; // Vmt
declare function prettifyMcpServerName(serverName: string): string; // Hmt
declare function prettifyMcpToolName(toolName: string, serverName: string): string; // Umt
declare function extractMcpOutputText(output: unknown): string | null; // Rmt
declare function isShortPlainOutput(text: string): boolean; // Lmt
declare function detectOutputLanguage(text: string): string; // T$
const MCP_TOOL_ICON = <IconBot className="size-4 shrink-0 text-foreground-subtle" />;

export function AutomationToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const info = extractMcpToolInfo(props);
  const { toolCall } = props.toolCallNode;
  const serverLabel = info?.serverName ? prettifyMcpServerName(info.serverName) : undefined;
  const primaryLabel = info ? prettifyMcpToolName(info.toolName ?? "", serverLabel ?? "") : toolCall.title;
  const detailsLabel = intl.formatMessage({ id: "chat.toolCall.mcp.callDetails" });
  const resultLabel = intl.formatMessage({ id: "chat.toolCall.mcp.result" });
  const copyResultLabel = intl.formatMessage({ id: "chat.toolCall.mcp.copyResult" });
  const wrapLabel = intl.formatMessage({ id: "chat.toolCall.mcp.wrapLines" });
  const descriptionLabel = intl.formatMessage({ id: "chat.toolCall.mcp.description" });
  const parametersLabel = intl.formatMessage({ id: "chat.toolCall.mcp.parameters" });
  const hasDetails = !!(info?.description || toolCall.input !== undefined);
  const outputText = extractMcpOutputText(toolCall.output);
  const errorText = toolCall.status === "failed" ? (toolCall.error ?? props.errorText) : undefined;
  const pending = toolCall.status === "pending" || toolCall.status === "stopped";
  const stoppedSuffix =
    toolCall.status === "stopped" ? (
      <span className="inline-flex items-center gap-2">
        <span className="text-foreground-subtlest">{`·`}</span>
        <span>{props.statusLabel}</span>
      </span>
    ) : undefined;
  const failedSuffix =
    toolCall.status === "failed" ? (
      <span className="inline-flex items-center gap-2">
        <span className="text-foreground-subtlest">{`·`}</span>
        <span>{props.statusLabel}</span>
      </span>
    ) : undefined;
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <div className="mb-2 space-y-3 py-1" data-testid="mcp-expanded-content">
        {errorText ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium text-destructive">{resultLabel}</h4>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive" data-testid="mcp-error-surface">
              {errorText}
            </p>
          </section>
        ) : outputText && isShortPlainOutput(outputText) ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="mcp-result-surface">
            {outputText.trim()}
          </p>
        ) : outputText ? (
          <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="mcp-result-surface">
            <CodeSurface
              appTheme={props.theme}
              className="bg-card"
              code={outputText}
              enableSyntaxHighlighting={detectOutputLanguage(outputText) === "json"}
              language={detectOutputLanguage(outputText) === "json" ? "json" : "log"}
              renderMermaid={false}
              wrapLongLines
            >
              <CodeSurfaceHeader className="pl-3 pr-2 pt-2">
                <CodeSurfaceTitle>
                  <span className="text-ui-base font-medium text-foreground-subtle">{resultLabel}</span>
                </CodeSurfaceTitle>
                <CodeSurfaceActions>
                  <CodeSurfaceWrapButton aria-label={wrapLabel} title={wrapLabel} />
                  <CodeSurfaceCopyButton aria-label={copyResultLabel} title={copyResultLabel} />
                </CodeSurfaceActions>
              </CodeSurfaceHeader>
            </CodeSurface>
          </div>
        ) : toolCall.status === "pending" ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="mcp-pending-surface">
            {props.statusLabel}
          </p>
        ) : (
          <p className="text-ui-base text-foreground-subtle">{props.statusLabel}</p>
        )}
        {hasDetails ? (
          <Collapsible className="group/details">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-foreground-subtlest hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground">
                <IconChevronRight className="size-3.5 transition-transform group-data-[state=open]/details:rotate-90" />
                {detailsLabel}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-2">
                {info?.description ? (
                  <section className="space-y-1.5">
                    <h4 className="text-ui-sm font-medium text-foreground-subtlest">{descriptionLabel}</h4>
                    <p className="whitespace-pre-wrap break-words text-ui-base text-foreground-subtle">{info.description}</p>
                  </section>
                ) : null}
                {toolCall.input === undefined ? null : (
                  <section className="space-y-1.5">
                    <h4 className="text-ui-sm font-medium text-foreground-subtlest">{parametersLabel}</h4>
                    <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card">
                      <CodeSurface appTheme={props.theme} code={JSON.stringify(toolCall.input, null, 2)} language="json" />
                    </div>
                  </section>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
      </div>
    ),
    [detailsLabel, copyResultLabel, props, descriptionLabel, loadFull, hasDetails, parametersLabel, resultLabel, outputText, toolCall, errorText, wrapLabel],
  );
  if (!info) return null;
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={MCP_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={!pending && (props.canToggle ?? true)}
      forceOpen={!pending && (props.forceOpen ?? false)}
      kindLabel="MCP"
      kindDetail={serverLabel ? <span className="text-foreground-subtle">{serverLabel}</span> : undefined}
      primaryText={primaryLabel}
      summaryContentSeparator="·"
      secondaryText={stoppedSuffix}
      statusLabel={failedSuffix}
      statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={props.isRunning}
      title={info.description ?? info.toolName}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 eht（107835 / 92325）：SessionContextToolView ---- */

/** 原 Zmt/Qmt/$mt：查询文本/命令标签/结果文本抽取 */
declare function extractSessionQuery(toolCall: ToolCall): string | null; // Zmt
declare function extractSessionCommandLabel(toolCall: ToolCall): string | null; // Qmt
declare function extractSessionResultText(toolCall: ToolCall): string | null; // $mt
const SESSION_CONTEXT_ICON = <IconGlobe className="size-4 shrink-0 text-foreground-subtle" />;

export function SessionContextToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const query = extractSessionQuery(toolCall);
  const commandLabel = extractSessionCommandLabel(toolCall);
  const resultText = extractSessionResultText(toolCall);
  const displayedResult = toolCall.status === "failed" ? errorText : resultText;
  const kindTitle = intl.formatMessage({ id: "chat.toolCall.sessionContext.title" });
  const primaryText = React.useMemo(
    () => (
      <span className="min-w-0 truncate">{query ?? toolCall.title ?? kindTitle}</span>
    ),
    [kindTitle, query, toolCall.title],
  );
  const secondaryText = React.useMemo(
    () =>
      commandLabel ? (
        <code className="min-w-0 truncate rounded-md bg-surface px-1.5 py-0.5 font-mono text-ui-base text-foreground-subtle">{commandLabel}</code>
      ) : undefined,
    [commandLabel],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 rounded-xl border border-border bg-panel px-4 py-3">
        {query ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium uppercase text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.query" })}</h4>
            <p className="whitespace-pre-wrap break-words text-ui-base text-foreground">{query}</p>
          </section>
        ) : null}
        <section className="space-y-1.5">
          <h4 className="text-ui-base font-medium uppercase text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.result" })}</h4>
          {displayedResult ? (
            <MarkdownRenderer
              className="min-w-0 break-words text-ui-base"
              workspacePath={props.workspacePath}
              theme={props.theme}
              codePreviewSettings={props.codePreviewSettings}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink as ((link: FileLinkModel) => void) | undefined} /* A0-D 类型垫片：链路按 path 建模，MI 边界收 FileLinkModel（零运行时影响） */
              onOpenExternalUrl={props.onOpenBrowserUrl}
            >
              {displayedResult}
            </MarkdownRenderer>
          ) : (
            <p className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.noResult" })}</p>
          )}
        </section>
      </div>
    ),
    [props.codePreviewSettings, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.theme, props.workspacePath, intl, query, displayedResult],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SESSION_CONTEXT_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.toolCall.sessionContext.reading" : "chat.toolCall.sessionContext.read" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 mht（108309 / 92669）：SkillToolView ---- */

/** 原 fht/pht/V$/z$：技能名/参数/输出文本/raw 判定 */
declare function extractSkillName(toolCall: ToolCall): string | null; // fht
declare function extractSkillArgs(toolCall: ToolCall): string | null; // pht
declare function extractOutputText(output: unknown): string | null; // V$
declare function isRawRecord(value: unknown): value is Record<string, unknown>; // z$
const SKILL_TOOL_ICON = <IconSparklesLike className="size-4 shrink-0 text-foreground-subtle" />;
declare const IconSparklesLike: React.FC<React.SVGProps<SVGSVGElement>>; // dht（skill 图标）

export function SkillToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const skillName = extractSkillName(toolCall);
  const skillArgs = extractSkillArgs(toolCall);
  const outputText = extractOutputText(toolCall.output);
  const rawOutput = isRawRecord(toolCall.raw) ? extractOutputText(toolCall.raw.rawOutput) : null;
  const surfaceText = toolCall.status === "failed" ? (props.errorText ?? outputText ?? rawOutput ?? undefined) : (outputText ?? rawOutput ?? undefined);
  const label = intl.formatMessage({ id: "chat.toolCall.skill.label" });
  const unknownLabel = intl.formatMessage({ id: "chat.toolCall.skill.unknown" });
  const argsLabel = intl.formatMessage({ id: "chat.toolCall.skill.args" });
  const noOutputLabel = intl.formatMessage({ id: "chat.toolCall.skill.noOutput" });
  const primaryText = React.useMemo(
    () => (
      <span className="truncate font-mono text-foreground-subtlest">{skillName ?? toolCall.title ?? label}</span>
    ),
    [label, skillName, toolCall.title],
  );
  const secondaryText = React.useMemo(() => (skillArgs ? <code className="truncate font-mono">{skillArgs}</code> : null), [skillArgs]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 mb-2 rounded-xl border border-border bg-panel px-4 py-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-ui-base text-foreground">
            <span className="text-foreground-subtle">{label}</span>
            <code className="rounded-md bg-surface px-2 py-1 font-mono text-ui-base text-foreground">{skillName ?? toolCall.title ?? unknownLabel}</code>
          </div>
          {skillArgs ? (
            <div className="flex items-start gap-2 font-mono text-ui-base text-foreground">
              <span className="shrink-0 text-foreground-subtle">{argsLabel}</span>
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground-subtle">{skillArgs}</pre>
            </div>
          ) : null}
        </div>
        {surfaceText ? (
          <div className="space-y-1">
            <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">{surfaceText}</pre>
          </div>
        ) : (
          !props.isRunning && (
            <div className="space-y-1">
              <p className="font-mono text-ui-base text-foreground-subtle">{noOutputLabel}</p>
            </div>
          )
        )}
      </div>
    ),
    [props.isRunning, surfaceText, skillArgs, argsLabel, label, skillName, noOutputLabel, unknownLabel, toolCall.title],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SKILL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen
        kindLabel={(props.kindLabelOverride as string) ?? intl.formatMessage({ id: props.isRunning ? "chat.toolCall.skill.running" : "chat.toolCall.skill.ran" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? surfaceText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 ght（108426 / 92725）：SwitchModeToolView（plan 面板） ---- */

function isInteractiveChild(target: EventTarget | null, currentTarget: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const closest = target.closest("button, a, input, textarea, select, [role='button']");
  return closest !== null && closest !== currentTarget;
}

export function SwitchModeToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const errorText = extractToolErrorText(toolCall);
  const { markdown, planFilePath } = extractPlanMarkdown(toolCall, props.workspacePath);
  const refsLoader = (
    <SnapshotRefsLoader
      refs={toolCall.snapshotRefs ?? []}
      onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
    />
  );
  const hasMarkdown = typeof markdown == "string" && markdown.length > 0;
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const isCopied = copiedText === markdown;
  const openDetail = () => {
    if (!markdown || !props.onOpenPlanDetail) return;
    props.onOpenPlanDetail({
      toolCallId: toolCall.toolId,
      markdown,
      ...(planFilePath ? { planFilePath } : {}),
    });
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isInteractiveChild(event.target, event.currentTarget)) openDetail();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveChild(event.target, event.currentTarget)) return;
    event.preventDefault();
    openDetail();
  };
  const copyMarkdown = () => {
    if (!markdown || typeof navigator > "u" || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(markdown).then(
      () => setCopiedText(markdown),
      () => setCopiedText(null),
    );
  };
  if (hasMarkdown) {
    return (
      <>
        <section
          role={props.onOpenPlanDetail ? "button" : undefined}
          tabIndex={props.onOpenPlanDetail ? 0 : undefined}
          aria-label={intl.formatMessage({ id: "planTool.panel.open" })}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="group w-full min-w-0 overflow-hidden rounded-xl border border-card-border bg-card text-foreground shadow-xs outline-none transition-colors hover:border-border-hover focus-visible:border-input-border-focused focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <header className="flex h-10 min-w-0 items-start gap-2 px-4 pt-4">
            <div className="flex shrink-0 items-center gap-2">
              <IconGauge className="size-4 shrink-0 text-foreground-subtle" />
              <h3 className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "planTool.panel.planTab" })}</h3>
            </div>
            {planFilePath ? (
              <code className="min-w-0 truncate text-ui-sm text-foreground-subtlest" title={planFilePath}>
                {baseName(planFilePath)}
              </code>
            ) : null}
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={intl.formatMessage({ id: isCopied ? "planTool.panel.copied" : "planTool.panel.copy" })}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  copyMarkdown();
                }}
              >
                {isCopied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
              </Button>
            </div>
          </header>
          <div className="relative overflow-hidden">
            <div className="max-h-64 overflow-hidden px-4 pt-2 pb-12 [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_100%)]">
              <MarkdownRenderer
                className="min-w-0 break-words text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground-subtle [&_p]:text-foreground-subtle"
                workspacePath={props.workspacePath}
                theme={props.theme}
                codePreviewSettings={props.codePreviewSettings}
                onOpenCodeViewer={props.onOpenCodeViewer}
                onOpenFileLink={props.onOpenFileLink as ((link: FileLinkModel) => void) | undefined} /* A0-D 类型垫片：同 §sessionContext 处 */
                onOpenExternalUrl={props.onOpenBrowserUrl}
              >
                {markdown}
              </MarkdownRenderer>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              className="absolute bottom-6 left-1/2 h-10 -translate-x-1/2 rounded-full !pr-4.5 pl-6 shadow-xs"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                openDetail();
              }}
            >
              {intl.formatMessage({ id: "planTool.panel.viewFull" })}
              <IconArrowUpRight data-icon="inline-end" className="size-4" />
            </Button>
          </div>
        </section>
        {refsLoader}
      </>
    );
  }
  if (toolCall.output !== undefined || errorText) {
    return (
      <>
        <ToolErrorSurface errorText={errorText} />
        {refsLoader}
      </>
    );
  }
  return <>{refsLoader}</>;
}

/* ---- 原 Sht（108581 / 92812）：TaskOutputToolView ---- */

interface TaskOutputRaw { kind?: string; taskStatus?: string; output?: string; retrievalStatus?: string; truncated?: boolean; [key: string]: unknown }
/** 原 F$/yht/bht/xht：raw 归一/输入 taskId/raw 状态失败判定/停止判定 */
declare function normalizeTaskOutputRaw(raw: unknown): TaskOutputRaw | null; // F$
declare function extractTaskOutputInputId(input: unknown): string | null; // yht
declare function isTaskRuntimeFailed(status?: string): boolean; // bht
declare function isTaskRuntimeStopped(status?: string): boolean; // xht
const TASK_OUTPUT_ICON = <IconClock className="size-4 shrink-0 text-foreground-subtle" />;

export function TaskOutputToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const raw = normalizeTaskOutputRaw(toolCall.raw);
  const info = raw?.kind === "task_output" ? raw : undefined;
  const inputId = extractTaskOutputInputId(toolCall.input);
  const taskStatus = info?.taskStatus;
  const normalizedStatus = taskStatus?.trim().toLowerCase();
  const denied = toolCall.status === "denied";
  const stopped = toolCall.status === "stopped";
  const failed = toolCall.status === "failed";
  const runtimeFailed = isTaskRuntimeFailed(taskStatus);
  const showFailed = !denied && !stopped && (failed || runtimeFailed);
  const output = info?.output;
  const hasOutput = output !== undefined;
  let kindLabel: string;
  if (failed) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.failed" });
  else if (denied) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.denied" });
  else if (stopped) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.stopped" });
  else if (props.isRunning) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.fetching" });
  else if (info?.retrievalStatus === "not_ready") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.running" });
  else if (info?.retrievalStatus === "timeout") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.timeout" });
  else if (runtimeFailed) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.taskFailed" });
  else if (isTaskRuntimeStopped(taskStatus)) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.taskStopped" });
  else if (normalizedStatus === "pending" || normalizedStatus === "running") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.running" });
  else if (normalizedStatus && normalizedStatus !== "completed") kindLabel = taskStatus ?? normalizedStatus;
  else if (info?.retrievalStatus === "success") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.retrieved" });
  else kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.completed" });
  const primaryText = React.useMemo(
    () => (
      <code className="min-w-0 truncate font-mono">{inputId ?? toolCall.title ?? "TaskOutput"}</code>
    ),
    [inputId, toolCall.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="rounded-lg border border-border bg-panel px-4 py-3">
        <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">{output}</pre>
        {info?.truncated === true ? <p className="mt-3 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.taskOutput.truncated" })}</p> : null}
      </div>
    ),
    [intl, output, info?.truncated],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={TASK_OUTPUT_ICON}
        showIcon={props.showIcon !== false}
        canToggle={hasOutput && (props.canToggle ?? true)}
        forceOpen={hasOutput && (props.forceOpen ?? false)}
        kindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={showFailed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : undefined}
        statusTooltip={failed ? props.errorText : undefined}
        showFailureStatus={showFailed}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={hasOutput ? renderContent : undefined}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Dht（108728 / 92920）：TaskControlToolView（task stop） ---- */

interface TaskStopRaw { kind?: string; taskId?: string; taskType?: string; command?: string; message?: string; truncated?: boolean; [key: string]: unknown }
declare function normalizeTaskStopRaw(raw: unknown): TaskStopRaw | null; // F$ 复用
declare function stringField(value: unknown, fields: string[]): string | undefined; // U$
declare function nestedRecord(value: unknown): Record<string, unknown> | null; // H$
declare function nestedStringField(raw: unknown, path: string[]): string | undefined; // Tht
declare function resolveStopResultText(message: string | undefined, taskId?: string, command?: string): string | undefined; // Eht
declare const DetailRow: React.FC<{ label: string; value: string; mono?: boolean }>; // W$
const TASK_STOP_ICON = <IconCalendar className="size-4 shrink-0 text-foreground-subtle" />;

export function TaskControlToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const raw = normalizeTaskStopRaw(toolCall.raw);
  const info = raw?.kind === "task_stop" ? raw : undefined;
  const input = nestedRecord(toolCall.input) ?? nestedStringField(toolCall.raw, ["rawInput", "input"]);
  const output = nestedRecord(toolCall.output) ?? nestedStringField(toolCall.raw, ["rawOutput", "output"]);
  const taskId = info?.taskId ?? stringField(output, ["task_id"]) ?? stringField(input, ["task_id", "shell_id"]);
  const taskType = info?.taskType ?? stringField(output, ["task_type"]);
  const rawCommand = info?.command;
  const outputCommand = stringField(output, ["command"]);
  const isAgent = taskType === "local_agent";
  const command = isAgent ? rawCommand : (rawCommand ?? outputCommand);
  const anyCommand = rawCommand ?? outputCommand;
  const message = info?.message ?? stringField(output, ["message"]);
  const truncated = info?.truncated === true;
  const denied = toolCall.status === "denied";
  const stopped = toolCall.status === "stopped";
  const failed = toolCall.status === "failed";
  const resultText = failed || denied || stopped ? (props.errorText ?? message) : resolveStopResultText(message, taskId, anyCommand);
  const hasContent = !!(taskType || command || resultText || truncated);
  const kindId = props.isRunning
    ? "chat.toolCall.taskStop.stopping"
    : failed
      ? "chat.toolCall.taskStop.failed"
      : denied
        ? "chat.toolCall.taskStop.denied"
        : stopped
          ? "chat.toolCall.taskStop.cancelled"
          : "chat.toolCall.taskStop.stopped";
  const primaryText = React.useMemo(
    () => (
      <code className="min-w-0 truncate font-mono">{taskId ?? toolCall.title ?? "TaskStop"}</code>
    ),
    [taskId, toolCall.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="rounded-lg border border-border bg-panel px-4 py-3">
        <dl className="space-y-3">
          {taskType ? <DetailRow label={intl.formatMessage({ id: "chat.toolCall.taskStop.taskType" })} value={taskType} mono /> : null}
          {command ? <DetailRow label={intl.formatMessage({ id: isAgent ? "chat.toolCall.taskStop.description" : "chat.toolCall.taskStop.command" })} value={command} mono={!isAgent} /> : null}
          {resultText ? <DetailRow label={intl.formatMessage({ id: "chat.toolCall.taskStop.result" })} value={resultText} /> : null}
        </dl>
        {truncated ? <p className="mt-3 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.taskStop.truncated" })}</p> : null}
      </div>
    ),
    [truncated, intl, isAgent, resultText, command, taskType],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={TASK_STOP_ICON}
        showIcon={props.showIcon !== false}
        canToggle={hasContent && (props.canToggle ?? true)}
        forceOpen={hasContent && (props.forceOpen ?? false)}
        kindLabel={intl.formatMessage({ id: kindId })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={failed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : undefined}
        statusTooltip={failed ? props.errorText : undefined}
        showFailureStatus={failed}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={hasContent ? renderContent : undefined}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Mht（108857 / 93007）：TodoToolView ---- */

interface TodoItem { id: string; title: string; status: string }
/** 原 Aht：todo 列表抽取 */
declare function extractTodoItems(props: ToolCallViewProps): TodoItem[] | null;
/** 原 jht/kht：状态图标/状态类名 */
declare const TodoStatusIcon: React.FC<{ status: string }>;
declare const TODO_STATUS_CLASSES: Record<string, string>;
const TODO_TOOL_ICON = <IconListTodoLike className="size-4 shrink-0 text-foreground-subtle" />;
declare const IconListTodoLike: React.FC<React.SVGProps<SVGSVGElement>>; // Oht

export function TodoToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const items = extractTodoItems(props);
  const completedCount = items?.filter((item) => item.status === "completed").length ?? 0;
  const current = items?.find((item) => item.status === "in_progress") ?? items?.find((item) => item.status !== "completed") ?? items?.at(-1);
  const kindLabel = intl.formatMessage({ id: "todo.panel.title" });
  const primaryLabel = current?.title ?? toolCall.title ?? intl.formatMessage({ id: "todo.panel.currentTask" });
  const counter = items ? `${completedCount}/${items.length}` : props.statusLabel;
  const primaryText = React.useMemo(() => <span className="min-w-0 truncate text-foreground-subtlest">{primaryLabel}</span>, [primaryLabel]);
  const secondaryText = React.useMemo(() => <span className="shrink-0 font-mono text-ui-base text-foreground-subtlest">{counter}</span>, [counter]);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () =>
      items ? (
        <div className="space-y-1 rounded-xl bg-surface px-3 py-2">
          {items.map((item) => (
            <div key={item.id} className="flex min-w-0 items-center gap-2 py-1">
              <TodoStatusIcon status={item.status} />
              <span className={cn("min-w-0 break-words text-ui-base", TODO_STATUS_CLASSES[item.status])}>{item.title}</span>
            </div>
          ))}
          <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        </div>
      ) : (
        <>
          <ToolCallExpandedContent
            childToolList={props.childToolList}
            displayModel={props.displayModel}
            toolCall={toolCall}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
          <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        </>
      ),
    [props.childToolList, props.codePreviewSettings, props.displayModel, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.theme, props.workspacePath, loadFull, items, toolCall],
  );
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={TODO_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={props.canToggle ?? true}
      forceOpen={props.forceOpen ?? false}
      kindLabel={kindLabel}
      sourceLabel={props.sourceLabel}
      primaryText={primaryText}
      secondaryText={secondaryText}
      statusLabel={toolCall.status === "failed" ? props.statusLabel : undefined}
      statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={props.isRunning}
      title={toolCall.title}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 Pht（108963 / 93067）：AskUserQuestionToolView ---- */

interface AskQuestionModel { questions: Array<{ id: string; question: string; options?: unknown[] }> ; answers?: Record<string, unknown> }
/** 原 eg/$h：toolCall → 问题模型归一 */
declare function normalizeAskQuestions(toolCall: ToolCall): AskQuestionModel;
/** 原 Ume：已答载荷抽取 */
declare function extractAnswers(toolCall: ToolCall): Record<string, unknown> | undefined;
/** 原 Wme：单题答案展示文本 */
declare function formatAnswerText(question: { id: string; question: string }, answers: Record<string, unknown> | undefined, fallback: string): string;
const ASK_QUESTION_ICON = <IconQuestion className="size-4 shrink-0 text-foreground-subtle" />;

export function AskUserQuestionToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const model = normalizeAskQuestions(toolCall);
  const answers = extractAnswers(toolCall) ?? model.answers;
  const autoContinued = !isRunning && toolCall.status !== "failed" && answers !== undefined && Object.keys(answers).length === 0;
  const emptyLabel = intl.formatMessage({ id: autoContinued ? "chat.askQuestion.autoContinued" : "chat.askQuestion.noAnswerProvided" });
  const questionCount = model.questions.length;
  const failed = toolCall.status === "failed";
  const renderContent = React.useCallback(
    () =>
      !isRunning || failed ? (
        <div className="ml-2 space-y-2 border-l border-border pl-3.5">
          {model.questions.map((question) => (
            <div key={question.id} className="space-y-1">
              <p className="text-ui-base font-medium leading-5 text-foreground">{question.question}</p>
              <p className="text-ui-base leading-5 text-foreground-subtle">{formatAnswerText(question, answers, emptyLabel)}</p>
            </div>
          ))}
          {model.questions.length === 0 ? <p className="text-ui-base leading-5 text-foreground-subtle">{emptyLabel}</p> : null}
        </div>
      ) : null,
    [answers, model.questions, failed, isRunning, emptyLabel],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={ASK_QUESTION_ICON}
        showIcon={props.showIcon !== false}
        canToggle={!isRunning}
        forceOpen={false}
        autoOpen={false}
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.askQuestion.asking" : "chat.askQuestion.asked" })}
        sourceLabel={props.sourceLabel}
        primaryText={null}
        secondaryText={isRunning ? null : autoContinued ? emptyLabel : intl.formatMessage({ id: "chat.askQuestion.questionsCount" }, { count: String(questionCount) })}
        statusLabel={failed ? statusLabel : undefined}
        statusTooltip={failed ? errorText : undefined}
        showFailureStatus={failed}
        isRunning={isRunning}
        title={toolCall.title ?? "AskUserQuestion"}
        renderContent={renderContent}
      />
    </>
  );
}

/* ============================================================================
 * 3. 预览卡单项（原 c1/C_t/w_t/T_t/E_t/D_t/O_t/k_t/A_t，jsx 94007–95033）
 * ==========================================================================*/

export interface PreviewCardModel {
  id: string;
  type: "website" | "file";
  kind?: string;
  title: string;
  subtitleId: string;
  url?: string;
  path?: string;
  filePath?: string | null;
  [key: string]: unknown;
}

/** 原 pgt：扩展名 → 预览种类/副标题 id */
const PREVIEW_KIND_TABLE: Array<{ extensions: string[]; kind: string; subtitleId: string }> = [
  { extensions: [".md"], kind: "markdown", subtitleId: "chat.previewCards.markdown" },
  { extensions: [".html", ".htm"], kind: "html", subtitleId: "chat.previewCards.htmlWebsite" },
  { extensions: [".docx"], kind: "docx", subtitleId: "chat.previewCards.docx" },
  { extensions: [".xlsx"], kind: "xlsx", subtitleId: "chat.previewCards.xlsx" },
  { extensions: [".pptx"], kind: "pptx", subtitleId: "chat.previewCards.pptx" },
  { extensions: [".pdf"], kind: "pdf", subtitleId: "chat.previewCards.pdf" },
];
function stripTrailingPunctuation(value: string): string {
  return value.trim().replace(/[.,;!?，。！？；：、]+$/, "").replace(/:\d+(?::\d+)?$/, "");
}
function matchPreviewKind(value: string): { extensions: string[]; kind: string; subtitleId: string } | null {
  const lowered = stripTrailingPunctuation(value).toLowerCase();
  return PREVIEW_KIND_TABLE.find((entry) => entry.extensions.some((extension) => lowered.endsWith(extension))) ?? null;
}
/** 原 o1：可嵌入浏览器 URL 判定（接口级，横切） */
declare function isEmbeddableBrowserUrl(url: string): boolean;
/** 原 qo：URL pathname 解码 */
declare function decodeUrlPathname(pathname: string): string;
/** 原 gA/Jo：工作区相对路径解析 */
declare function resolveWorkspaceRelativePath(workspacePath: string | undefined, candidate: string): { path: string } | null;

/** 原 r1：file:// URL → 本地路径（含 UNC 主机） */
function fileUrlToPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "file:") return null;
    const pathname = decodeUrlPathname(parsed.pathname);
    if (/^\/[a-zA-Z]:\//.test(pathname)) return pathname.slice(1);
    return parsed.hostname && parsed.hostname !== "localhost" ? `//${parsed.hostname}${pathname}` : pathname;
  } catch {
    return null;
  }
}
/** 原 i1：引用文本 → 工作区路径（file:// / 相对 / 裸文件名） */
function resolveReferencePath(workspacePath: string | undefined, reference: string): string | null {
  if (/^file:\/\//i.test(reference)) return fileUrlToPath(reference);
  const relative = resolveWorkspaceRelativePath(workspacePath, reference);
  if (relative) return relative.path;
  const cleaned = stripTrailingPunctuation(reference);
  if (!cleaned || cleaned.startsWith("http://") || cleaned.startsWith("https://")) return null;
  if (!cleaned.includes("/") && !cleaned.includes("\\")) return joinWorkspacePath(workspacePath as string, cleaned); /* A0-D 类型垫片：bundle 同参（undefined 时原样抛出） */
  return resolveWorkspaceRelativePath(workspacePath, `./${cleaned}`)?.path ?? null;
}
/** 原 c1（94007）：卡片 → 本地路径（website 用 filePath/file:// 解析） */
function previewCardPath(card: PreviewCardModel): string | null {
  return card.type === "website" ? (card.filePath ?? fileUrlToPath(card.url ?? "")) : (card.path ?? null);
}
/** 原 Lgt：全部卡片均可解析为本地路径 */
function allCardsHaveLocalPath(cards: PreviewCardModel[]): boolean {
  return cards.some((card) => previewCardPath(card) !== null);
}
/** 原 C_t（94833）：卡片列表签名 */
function previewCardsSignature(cards: PreviewCardModel[]): string {
  return cards
    .map((card) =>
      card.type === "website"
        ? [card.id, card.type, card.title, card.subtitleId, card.url, card.filePath ?? ""].join("\0")
        : [card.id, card.type, card.kind, card.title, card.subtitleId, card.path].join("\0"),
    )
    .join("");
}
/** 原 w_t（94836）：同步可见卡片（仅 website 且 URL 可嵌入；上限 10；有本地路径则走异步） */
function resolveSyncVisibleCards(cards: PreviewCardModel[]): PreviewCardModel[] | null {
  return allCardsHaveLocalPath(cards) ? null : cards.filter((card) => card.type === "website" && isEmbeddableBrowserUrl(card.url ?? "")).slice(0, 10);
}
/** 原 T_t（94839）：异步存在性校验（前 15 → checkFilesExist → 上限 10） */
async function resolveAsyncVisibleCards(cards: PreviewCardModel[], fileService: FileServiceLike): Promise<PreviewCardModel[]> {
  const synced = resolveSyncVisibleCards(cards);
  if (synced) return synced;
  const head = cards.slice(0, 15);
  const paths = head.map(previewCardPath).filter((path): path is string => path !== null);
  const checked = await fileService.checkFilesExist({ paths });
  const existing = new Set(checked.filter((entry) => entry.exists).map((entry) => entry.path));
  return head
    .filter((card) => {
      if (card.type === "website" && !isEmbeddableBrowserUrl(card.url ?? "")) return false;
      const path = previewCardPath(card);
      return path === null || existing.has(path);
    })
    .slice(0, 10);
}
/** 原 E_t（94854）：文件预览源构建（返回形对齐属主 FileOpenPreviewSource，供 v_t target.previewSource 透传） */
function buildFilePreviewSource(
  card: PreviewCardModel,
  scope: { workspacePath?: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): { type: `file`; title: string; path: string | undefined; workspacePath?: string; workspaceIdentity?: string; workspaceRemoteSessionId?: string } {
  return {
    type: "file",
    title: card.title,
    path: card.path,
    ...(scope.workspacePath ? { workspacePath: scope.workspacePath } : {}),
    ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
    ...(scope.workspaceRemoteSessionId ? { workspaceRemoteSessionId: scope.workspaceRemoteSessionId } : {}),
  };
}
/** 原 D_t（94870）：website 卡是否按文件打开（file:// 且路径不可远程感知） */
declare function isRemoteAwarePath(args: { path: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null }): boolean; // Ogt
function previewCardOpensAsFile(
  card: PreviewCardModel,
  scope: { workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): boolean {
  const path = previewCardPath(card);
  return card.type !== "website" || ((card.url ?? "").startsWith("file://") && path !== null && !isRemoteAwarePath({ path, ...scope }));
}

/** 原 O_t（111161 / 94877）：可见预览卡钩子（同步 website 子集，否则异步存在性校验） */
export function useVisiblePreviewCards(
  cards: PreviewCardModel[],
  scope: { workspacePath?: string; workspaceRemoteSessionId?: string | null; workspaceIdentity?: string | null } = {},
): { visibleCards: PreviewCardModel[]; settled: boolean } {
  const { fileService } = useWorkspaceScopedServices(scope.workspacePath, scope.workspaceRemoteSessionId, scope.workspaceIdentity);
  const signature = React.useMemo(() => previewCardsSignature(cards), [cards]);
  const stableRef = React.useRef({ cards, signature });
  if (stableRef.current.signature !== signature) stableRef.current = { cards, signature };
  const stableCards = stableRef.current.cards;
  const synced = React.useMemo(() => resolveSyncVisibleCards(stableCards), [stableCards]);
  const [asyncState, setAsyncState] = React.useState<{ fileService: FileServiceLike | null; signature: string; visibleCards: PreviewCardModel[] }>({
    fileService: null,
    signature: "",
    visibleCards: [],
  });
  React.useEffect(() => {
    if (synced) return;
    let cancelled = false;
    resolveAsyncVisibleCards(stableCards, fileService).then(
      (visible) => {
        if (!cancelled) setAsyncState({ fileService, signature, visibleCards: visible });
      },
      () => {
        if (!cancelled) setAsyncState({ fileService, signature, visibleCards: [] });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [signature, fileService, synced, stableCards]);
  if (synced) return { visibleCards: synced, settled: true };
  const matches = asyncState.fileService === fileService && asyncState.signature === signature;
  return { visibleCards: matches ? asyncState.visibleCards : [], settled: matches };
}

/** 原 A_t（111233 / 94950）：预览卡单项（图标 + 标题/副标题 + 打开方式菜单） */
export function PreviewCard({
  card,
  animationDelayMs,
  subtitle,
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  compactForRemoteControl,
}: {
  card: PreviewCardModel;
  animationDelayMs: number;
  subtitle: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  /** bundle v_t 实际回传对象 {path,label,pathKind,workspacePath,...}（110488）；链路按 path 建模，边界收 any。 */
  onOpenFileLink?: (arg: any) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}) {
  const localPath = previewCardPath(card);
  const opensAsFile = previewCardOpensAsFile(card, { workspaceIdentity, workspaceRemoteSessionId });
  const iconMeta = localPath ? resolveFileIconMeta(localPath) : null;
  const previewSource =
    opensAsFile && localPath
      ? {
          type: "file",
          title: card.title,
          path: localPath,
          ...(workspacePath ? { workspacePath } : {}),
          ...(workspaceIdentity ? { workspaceIdentity } : {}),
          ...(workspaceRemoteSessionId ? { workspaceRemoteSessionId } : {}),
        }
      : null;
  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl border border-card-border bg-card p-3 pr-4 text-foreground"
      data-zcode-stream-animate="true"
      style={{ "--zcode-stream-animation-delay": `${animationDelayMs}ms` } as React.CSSProperties}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-background text-foreground-subtle">
        {!opensAsFile && card.type === "website" ? (
          <IconGlobe className="size-5" />
        ) : iconMeta ? (
          <FileIcon src={iconMeta.fileIconSrc} size={20} />
        ) : (
          <IconFile className="size-5" />
        )}
      </div>
      <div className="min-w-0 flex flex-1 flex-col gap-1">
        <div className="truncate text-ui-base font-medium leading-5">{card.title}</div>
        <div className="truncate text-ui-base leading-5 text-foreground-subtlest">{subtitle}</div>
      </div>
      <FileOpenWithMenu
        target={
          !opensAsFile && card.type === "website"
            ? { type: "website", url: card.url ?? "" }
            : {
                type: "file",
                path: localPath ?? "",
                title: card.title,
                label: card.title,
                previewSource: card.type === "website" ? previewSource ?? undefined : buildFilePreviewSource(card, { workspacePath, workspaceIdentity, workspaceRemoteSessionId }),
              }
        }
        onOpenBrowserUrl={onOpenBrowserUrl}
        onOpenFileLink={onOpenFileLink}
        onOpenCodeViewer={onOpenCodeViewer}
      />
    </div>
  );
}

/** 原 k_t（111193 / 94925）：预览卡列表（36ms 级联入场，上限 240ms） */
export function PreviewCardList({
  cards,
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  compactForRemoteControl,
}: {
  cards: PreviewCardModel[];
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenFileLink?: (path: string) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}) {
  const { intl } = useIntlContext();
  const { visibleCards, settled } = useVisiblePreviewCards(cards, { workspacePath, workspaceIdentity, workspaceRemoteSessionId });
  if (!settled || visibleCards.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3">
      {visibleCards.map((card, index) => (
        <PreviewCard
          key={card.id}
          card={card}
          animationDelayMs={Math.min(index * 36, 240)}
          subtitle={intl.formatMessage({ id: card.subtitleId })}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          workspaceRemoteSessionId={workspaceRemoteSessionId}
          onOpenBrowserUrl={onOpenBrowserUrl}
          onOpenFileLink={onOpenFileLink}
          onOpenCodeViewer={onOpenCodeViewer}
          compactForRemoteControl={compactForRemoteControl}
        />
      ))}
    </div>
  );
}

/* ============================================================================
 * 4. 自动化卡（原 sgt…dgt/Mvt/Nvt/Pvt/Fvt/fgt，jsx 93617–93766 + 96194–96238）
 * ==========================================================================*/

/** 原 e1/agt：宽松对象判定/scheduleRule 归一（接口级） */
declare function isPlainObjectLike(value: unknown): value is Record<string, unknown>;
declare function normalizeScheduleRule(value: unknown): unknown;
/** 原 u1：toolCall 节点归一（Conversation.tsx 接口级） */
declare function normalizeToolCallNode(node: ToolCallNode): { toolCall: ToolCall; [key: string]: unknown };
/** 原 rgt：cron 表达式 → 人读调度文案（F15 域，接口级） */
declare function formatCronSchedule(
  args: { cronExpr: string; scheduleRule?: unknown; recurring?: boolean; maxRuns?: number },
  intl: IntlShape,
): string;

function tryParseJsonObject(value: unknown): Record<string, unknown> | null {
  let current = value;
  if (typeof current == "string") {
    try {
      current = JSON.parse(current);
    } catch {
      return null;
    }
  }
  return typeof current == "object" && current && !Array.isArray(current) ? (current as Record<string, unknown>) : null;
}
/** 原 sgt（93617）：cron 创建/更新工具判定 */
function isCronCreateOrUpdate(entry: { toolName?: string; kind?: string; title?: string | null }): boolean {
  return [entry.toolName, entry.kind, entry.title].some((value) => {
    const normalized = (value ?? "").toLowerCase().replace(/[^a-z0-9]/gu, "");
    return normalized === "croncreate" || normalized === "cronupdate";
  });
}
function parseJsonLoose(value: unknown): unknown {
  if (typeof value == "string") return tryParseJsonObject(value) ?? undefined;
  return value;
}
/** 原 ugt：自动化模型归一（camel/snake 双键 + 字段清洗） */
function normalizeAutomationModel(value: unknown): AutomationModel | null {
  const parsed = parseJsonLoose(value);
  if (!isPlainObjectLike(parsed)) return null;
  const container = isPlainObjectLike(parsed.automation) ? parsed.automation : parsed;
  const automationId =
    typeof container.automationId == "string" && container.automationId.trim()
      ? container.automationId.trim()
      : typeof container.automation_id == "string" && container.automation_id.trim()
        ? container.automation_id.trim()
        : undefined;
  const title = typeof container.title == "string" && container.title.trim() ? container.title.trim() : undefined;
  const cronExpr =
    typeof container.cronExpr == "string" && container.cronExpr.trim()
      ? container.cronExpr.trim()
      : typeof container.cron_expr == "string" && container.cron_expr.trim()
        ? container.cron_expr.trim()
        : undefined;
  if (!title && !cronExpr) return null;
  const scheduleRule = normalizeScheduleRule(container.scheduleRule);
  const recurring = typeof container.recurring == "boolean" ? container.recurring : undefined;
  const maxRuns = typeof container.maxRuns == "number" && Number.isFinite(container.maxRuns) ? container.maxRuns : undefined;
  return {
    ...(automationId ? { automationId } : {}),
    ...(title ? { title } : {}),
    ...(cronExpr ? { cronExpr } : {}),
    ...(scheduleRule ? { scheduleRule } : {}),
    ...(recurring === undefined ? {} : { recurring }),
    ...(maxRuns === undefined ? {} : { maxRuns }),
  };
}
export interface AutomationModel {
  automationId?: string;
  title?: string;
  cronExpr?: string;
  scheduleRule?: unknown;
  recurring?: boolean;
  maxRuns?: number;
}
/** 原 dgt（93666）：多源抽取自动化模型（raw/result/output/content） */
function extractAutomationModel(entry: { raw?: unknown; output?: unknown; content?: unknown }): AutomationModel | null {
  const raw = isPlainObjectLike(entry.raw) ? entry.raw : null;
  const result = isPlainObjectLike(raw?.result) ? raw.result : null;
  const candidates = [entry.output, raw?.rawOutput, raw?.output, result?.content, result?.display, raw?.result, entry.content];
  for (const candidate of candidates) {
    const model = normalizeAutomationModel(candidate);
    if (model) return model;
  }
  return null;
}
/** 原 Pvt（96223）：cronDelete 的自动化 id */
function extractDeletedAutomationId(node: { output?: { text?: unknown } | null; input?: unknown; inputText?: string }): string | undefined {
  for (const candidate of [node.output?.text, node.input, node.inputText]) {
    const id = tryParseJsonObject(candidate)?.id;
    if (typeof id == "string" && id.trim()) return id.trim();
  }
  return undefined;
}
export interface AutomationCardModel {
  rowId: number;
  toolCallId: string;
  automation: AutomationModel;
}
/** 原 Mvt（— / 96194）：成功 cron 调用 → 自动化卡列表（delete 移除同 id） */
export function collectAutomationCards(rows: Array<{ kind: string; status: string; toolName: string; rowId: number; toolCallId: string; [key: string]: unknown }>): AutomationCardModel[] {
  let cards: AutomationCardModel[] = [];
  for (const row of rows) {
    if (row.kind !== "toolCall" || row.status !== "success") continue;
    if (row.toolName.toLowerCase().replace(/[^a-z0-9]/gu, "") === "crondelete") {
      const deletedId = extractDeletedAutomationId(row as { output?: { text?: unknown } | null; input?: unknown; inputText?: string });
      if (deletedId) cards = cards.filter((card) => card.automation.automationId !== deletedId);
      continue;
    }
    const normalized = normalizeToolCallNode(row as unknown as ToolCallNode);
    if (!isCronCreateOrUpdate(normalized.toolCall)) continue;
    const automation = extractAutomationModel(normalized.toolCall);
    if (automation) {
      if (automation.automationId) cards = cards.filter((card) => card.automation.automationId !== automation.automationId);
      cards.push({ rowId: row.rowId as number, toolCallId: row.toolCallId as string, automation });
    }
  }
  return cards;
}
/** 原 fgt（107448 区 / 93676）：自动化卡单项（时钟图标 + 标题/调度 + 打开按钮） */
export function AutomationCard({ automation, onOpenAutomationsMain }: { automation: AutomationModel; onOpenAutomationsMain?: (automationId: string) => void }) {
  const { intl } = useIntlContext();
  const title = automation.title ?? intl.formatMessage({ id: "automations.chatCreated.defaultTitle" });
  const schedule = automation.cronExpr
    ? formatCronSchedule(
        {
          cronExpr: automation.cronExpr,
          ...(automation.scheduleRule ? { scheduleRule: automation.scheduleRule } : {}),
          ...(automation.recurring === undefined ? {} : { recurring: automation.recurring }),
          ...(automation.maxRuns === undefined ? {} : { maxRuns: automation.maxRuns }),
        },
        intl,
      )
    : intl.formatMessage({ id: "automations.chatCreated.scheduleFallback" });
  const canOpen = !!onOpenAutomationsMain;
  return (
    <div data-testid="automation-chat-created-card" className="my-1 w-full rounded-xl border border-border/70 bg-card/70 px-3 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
          <IconClock className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-ui-base font-medium text-foreground">{title}</div>
          <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">{schedule}</div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="automation-chat-created-open"
          className={cn(
            "h-auto rounded-lg border-border/70 bg-transparent px-3 py-1.5 text-ui-base text-foreground hover:bg-hover hover:text-foreground",
            !canOpen && "opacity-50",
          )}
          disabled={!canOpen}
          onClick={() => onOpenAutomationsMain?.(automation.automationId ?? "")}
        >
          <span>{intl.formatMessage({ id: "automations.chatCreated.open" })}</span>
        </Button>
      </div>
    </div>
  );
}
/** 原 Fvt（— / 96229）：自动化卡列表 */
export function AutomationCardList({
  cards,
  context,
}: {
  cards: AutomationCardModel[];
  context: { onOpenAutomationsMain?: (automationId: string) => void };
}) {
  if (cards.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <AutomationCard key={`${card.rowId}:${card.toolCallId}`} automation={card.automation} onOpenAutomationsMain={context.onOpenAutomationsMain} />
      ))}
    </div>
  );
}

/* ============================================================================
 * 5. Aliyun captcha 部件（原 mSt…fCt，jsx 100034–100680）
 * ==========================================================================*/

const ALIYUN_CAPTCHA_SCRIPT_URL = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"; // mSt
const CAPTCHA_INSTANCE_TIMEOUT_MS = 10000; // t0
const CAPTCHA_SCRIPT_SETTLE_MS = 2000; // hSt
const CAPTCHA_VERIFICATION_TIMEOUT_MS = 120000; // gSt

/** 原 n0：交互验证必需错误 */
export class CaptchaInteractiveRequiredError extends Error {
  code = "CAPTCHA_INTERACTIVE_REQUIRED";
  constructor(message = "Captcha requires interactive verification.") {
    super(message);
    this.name = "CaptchaInteractiveRequiredError";
  }
}

interface CaptchaConfig { enabled?: boolean; region: string; prefix: string; sceneId: string; mode?: string; language?: string; captchaLogoImg?: string }
interface CaptchaVerifyPayloadLike {
  success?: boolean;
  verifyResult?: boolean;
  verifyCode?: string;
  certifyId?: string;
  captchaVerifyParam?: string;
  CaptchaVerifyParam?: string;
  VerifyCode?: string;
  [key: string]: unknown;
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value == "object" && !!value;
}
/** 原 i0：验证结果字段归一 */
function normalizeVerifyResult(value: unknown): { success?: boolean; verifyResult?: boolean; verifyCode?: string; certifyId?: string } | null {
  if (!isObjectLike(value)) return null;
  const verifyCode = typeof value.verifyCode == "string" ? value.verifyCode : typeof value.VerifyCode == "string" ? value.VerifyCode : undefined;
  return {
    success: typeof value.success == "boolean" ? value.success : undefined,
    verifyResult: typeof value.verifyResult == "boolean" ? value.verifyResult : undefined,
    verifyCode,
    certifyId: typeof value.certifyId == "string" ? value.certifyId : undefined,
  };
}
/** 原 _St：F008 重复提交判定 */
function isDuplicateSubmission(value: unknown): boolean {
  if (normalizeVerifyResult(value)?.verifyCode !== "F008") return false;
  const text = typeof value == "string" ? value : isObjectLike(value) ? JSON.stringify(value) : "";
  return text.includes("重复提交") || text.includes("只允许提交一次");
}
/** 原 vSt：certifyId 抽取 */
function extractCertifyId(value: unknown): string | undefined {
  const trimmed = (typeof value == "string" ? value : "").trim();
  if (trimmed?.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return typeof parsed.certifyId == "string" ? parsed.certifyId : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
/** 原 a0：fail 载荷中的验证参数 */
function extractVerifyParam(value: unknown): string | undefined {
  if (!isObjectLike(value)) return undefined;
  return ((typeof value.captchaVerifyParam == "string" ? value.captchaVerifyParam : typeof value.CaptchaVerifyParam == "string" ? value.CaptchaVerifyParam : undefined) ?? "").trim() || undefined;
}
/** 原 o0：终态通过（success+verifyResult 或 T006） */
function isTerminalPass(value: unknown): boolean {
  const normalized = normalizeVerifyResult(value);
  return normalized ? normalized.success === true && normalized.verifyResult === true || normalized.verifyCode === "T006" : false;
}
/** 原 ySt：需升级交互（success 且 verifyResult=false） */
function isAwaitingUpgrade(value: unknown): boolean {
  const normalized = normalizeVerifyResult(value);
  return normalized ? normalized.success === true && normalized.verifyResult === false : false;
}
/** 原 bSt：延迟交互失败（需升级但无参数，或终态通过无参数） */
function isDeferredInteractiveFail(value: unknown): boolean {
  return isAwaitingUpgrade(value) ? true : isTerminalPass(value) && extractVerifyParam(value) === undefined;
}
/** 原 s0：fail 载荷摘要 */
function summarizeCaptchaFail(value: unknown): Record<string, unknown> {
  const normalized = normalizeVerifyResult(value);
  return {
    verifyCode: normalized?.verifyCode ?? null,
    success: normalized?.success ?? null,
    verifyResult: normalized?.verifyResult ?? null,
    certifyId: normalized?.certifyId ?? null,
    awaitingUpgrade: isAwaitingUpgrade(value),
    terminalPass: isTerminalPass(value),
    hasParamInFail: !!extractVerifyParam(value),
    duplicateSubmission: isDuplicateSubmission(value),
  };
}
function firstStringField(value: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const entry = value[field];
    if (typeof entry == "string" && entry.trim().length > 0) return entry.trim();
  }
  return null;
}
function firstNumberField(value: Record<string, unknown>, fields: string[]): number | null {
  for (const field of fields) {
    const entry = value[field];
    if (typeof entry == "number" && Number.isFinite(entry)) return entry;
  }
  return null;
}
/** 原 SSt：阿里云错误面归一 */
function summarizeAliyunError(value: unknown): Record<string, unknown> {
  const base = summarizeCaptchaFail(value);
  if (!isObjectLike(value)) {
    return {
      ...base,
      aliyunErrorCode: null,
      aliyunErrorMessage: value instanceof Error ? value.message : String(value),
      requestId: null,
      hostId: null,
      statusCode: null,
      errorName: value instanceof Error ? value.name : null,
    };
  }
  return {
    ...base,
    aliyunErrorCode: firstStringField(value, ["Code", "code", "errorCode", "ErrorCode"]),
    aliyunErrorMessage: firstStringField(value, ["Message", "message", "errorMessage", "ErrorMessage", "msg"]),
    requestId: firstStringField(value, ["RequestId", "requestId", "requestID"]),
    hostId: firstStringField(value, ["HostId", "hostId"]),
    statusCode: firstNumberField(value, ["StatusCode", "statusCode", "status"]),
    errorName: value instanceof Error ? value.name : null,
  };
}

const CAPTCHA_CONTAINER_ID = "zcode-aliyun-captcha-container"; // CSt
const CAPTCHA_ELEMENT_ID = "zcode-aliyun-captcha-element"; // l0
const CAPTCHA_BUTTON_ID = "zcode-aliyun-captcha-button"; // u0

/** 原 wSt（— / 100110）：captcha 宿主容器（零尺寸 + 隐藏按钮） */
export function CaptchaHostContainer() {
  return (
    <div id={CAPTCHA_CONTAINER_ID} aria-hidden="true" className="fixed left-0 top-0 z-[2147483647] h-0 w-0 overflow-visible">
      <div id={CAPTCHA_ELEMENT_ID} className="absolute left-0 top-0 h-0 w-0 overflow-visible" />
      <button
        id={CAPTCHA_BUTTON_ID}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2 border-0 p-0 opacity-0"
      />
    </div>
  );
}

interface CaptchaInFlight {
  resolve: (param: string) => void;
  reject: (error: unknown) => void;
  allowInteractive: boolean;
  awaitingDeferredSdkSuccess?: boolean;
  handleDeferredFail?: (fail: unknown) => void;
}
interface CaptchaInstanceEntry {
  configKey: string;
  buttonElement: HTMLButtonElement;
  buttonSelector: string;
  instancePromise: Promise<AliyunCaptchaInstance>;
  initStartedAt: number;
}
interface AliyunCaptchaInstance {
  show?: () => void;
  startTracelessVerification?: () => void;
}
declare global {
  interface Window {
    initAliyunCaptcha?: (config: Record<string, unknown>) => void;
    AliyunCaptchaConfig?: { region: string; prefix: string };
  }
}

let scriptLoadPromise: Promise<void> | null = null; // d0
let instanceEntry: CaptchaInstanceEntry | null = null; // f0
let inFlight: CaptchaInFlight | null = null; // p0
let verificationRunning = false; // m0
let scriptLoadedAt = 0; // h0
const CAPTCHA_LOGO_URL = ""; // g0（icon 资源占位）

function captchaDebug(event: string, meta?: unknown): void {
  logger.debug("[captcha]", event, meta);
}
/** 原 TSt：重置在途与实例 + 清空挂载点 */
function resetCaptchaState(): void {
  inFlight = null;
  instanceEntry = null;
  if (typeof document < "u") document.getElementById(CAPTCHA_ELEMENT_ID)?.replaceChildren();
}
/** 原 ESt：配置键 */
function captchaConfigKey(config: CaptchaConfig): string {
  return [config.region, config.prefix, config.sceneId, config.mode ?? "popup", config.language ?? "", config.captchaLogoImg ?? CAPTCHA_LOGO_URL].join("::");
}
/** 原 DSt：挂载三件校验 */
function requireCaptchaHostElements(): { containerElement: HTMLElement; mountElement: HTMLElement; buttonElement: HTMLButtonElement } {
  const container = document.getElementById(CAPTCHA_CONTAINER_ID);
  const mount = document.getElementById(CAPTCHA_ELEMENT_ID);
  const button = document.getElementById(CAPTCHA_BUTTON_ID);
  if (!(container instanceof HTMLElement)) throw Error("Captcha host container is not mounted.");
  if (!(mount instanceof HTMLElement)) throw Error("Captcha host element is not mounted.");
  if (!(button instanceof HTMLButtonElement)) throw Error("Captcha host button is not mounted.");
  return { containerElement: container, mountElement: mount, buttonElement: button };
}
/** 原 OSt：回退按钮查询 */
function requireCaptchaButton(): { buttonElement: HTMLButtonElement; buttonSelector: string } {
  const button = document.getElementById(CAPTCHA_BUTTON_ID);
  if (!(button instanceof HTMLButtonElement)) throw Error("Captcha fallback button is not mounted.");
  return { buttonElement: button, buttonSelector: `#${CAPTCHA_BUTTON_ID}` };
}
/** 原 kSt（— / 100160）：脚本加载（去重 + 在途共享） */
function loadAliyunCaptchaScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window > "u" || typeof document > "u") {
      reject(Error("Captcha requires browser environment."));
      return;
    }
    if (typeof window.initAliyunCaptcha == "function") {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${ALIYUN_CAPTCHA_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(Error("Failed to load captcha script.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = ALIYUN_CAPTCHA_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoadedAt = Date.now();
      resolve();
    };
    script.onerror = () => reject(Error("Failed to load captcha script."));
    document.head.appendChild(script);
  }).catch((error) => {
    scriptLoadPromise = null;
    throw error;
  });
  return scriptLoadPromise;
}
/** 原 v0：拒绝在途 */
function rejectInFlight(error: unknown): void {
  const current = inFlight;
  inFlight = null;
  current?.reject(error);
}

/** 原 ASt（117919 / 100205）：SDK fail 回调分派（终态通过/延迟交互/重复提交/通用失败） */
function handleAliyunSdkFail(fail: unknown, rejectInstance: (error: unknown) => void): void {
  const summary = summarizeCaptchaFail(fail);
  if (!scriptLoadPromise && isDeferredInteractiveFail(fail)) {
    // 原 p0 && bSt 分支：无在途且延迟失败 → 记录 stale
    captchaDebug("sdk.fail.stale_after_success", summary);
    return;
  }
  captchaDebug("sdk.fail", summary);
  logger.info("[captcha] aliyun sdk fail", summary);
  if (isTerminalPass(fail)) {
    const param = extractVerifyParam(fail);
    if (param) {
      captchaDebug("sdk.fail.terminal_pass", summary);
      logger.info("[captcha] aliyun sdk terminal pass from fail", summary);
      const current = inFlight;
      inFlight = null;
      current?.resolve(param);
      return;
    }
  }
  if (isDeferredInteractiveFail(fail)) {
    const current = inFlight;
    if (!current) {
      rejectInstance(new CaptchaInteractiveRequiredError());
      return;
    }
    if (current && !current.allowInteractive) {
      rejectInFlight(new CaptchaInteractiveRequiredError());
      return;
    }
    current.awaitingDeferredSdkSuccess = true;
    current.handleDeferredFail?.(fail);
    return;
  }
  if (isDuplicateSubmission(fail)) {
    captchaDebug("sdk.fail.duplicate", summary);
    logger.warn("[captcha] aliyun sdk duplicate submission", summary);
    resetCaptchaState();
    if (inFlight && !inFlight.allowInteractive) {
      rejectInFlight(new CaptchaInteractiveRequiredError());
      return;
    }
    rejectInFlight(fail ?? Error("Captcha verification data was already submitted."));
    return;
  }
  if (inFlight && !inFlight.allowInteractive) {
    rejectInFlight(new CaptchaInteractiveRequiredError());
    return;
  }
  rejectInstance(fail ?? Error("Captcha failed before instance ready."));
  rejectInFlight(fail ?? Error("Captcha failed."));
}

/** 原 jSt（— / 100280）：实例初始化（配置键去重 + getInstance/success/fail/onOnError 接线） */
async function initAliyunCaptchaInstance(config: CaptchaConfig): Promise<CaptchaInstanceEntry> {
  const configKey = captchaConfigKey(config);
  if (instanceEntry && instanceEntry.configKey === configKey) return instanceEntry;
  await loadAliyunCaptchaScript();
  const init = window.initAliyunCaptcha;
  if (typeof init != "function") throw Error("Captcha SDK is unavailable.");
  requireCaptchaHostElements();
  const { buttonElement, buttonSelector } = requireCaptchaButton();
  window.AliyunCaptchaConfig = { region: config.region, prefix: config.prefix };
  let resolveInstance!: (instance: AliyunCaptchaInstance) => void;
  let rejectInstance!: (error: unknown) => void;
  instanceEntry = {
    configKey,
    buttonElement,
    buttonSelector,
    instancePromise: new Promise<AliyunCaptchaInstance>((resolve, reject) => {
      resolveInstance = resolve;
      rejectInstance = reject;
    }),
    initStartedAt: Date.now(),
  };
  try {
    logger.info("[captcha] aliyun sdk init start", {
      configKey,
      mode: config.mode ?? "popup",
      language: config.language ?? null,
      hasCaptchaLogoImg: !!(config.captchaLogoImg ?? CAPTCHA_LOGO_URL),
    });
    init({
      SceneId: config.sceneId,
      mode: config.mode ?? "popup",
      language: config.language,
      captchaLogoImg: config.captchaLogoImg ?? CAPTCHA_LOGO_URL,
      showErrorTip: false,
      element: `#${CAPTCHA_ELEMENT_ID}`,
      button: buttonSelector,
      getInstance: (instance: AliyunCaptchaInstance) => {
        logger.info("[captcha] aliyun sdk instance ready", {
          configKey,
          hasShow: typeof instance.show == "function",
          hasStartTracelessVerification: typeof instance.startTracelessVerification == "function",
        });
        resolveInstance(instance);
      },
      success: (param: string) => {
        captchaDebug("sdk.success", { paramLength: param.length });
        logger.info("[captcha] aliyun sdk success", { paramLength: param.length });
        const current = inFlight;
        inFlight = null;
        current?.resolve(param);
      },
      fail: (fail: unknown) => {
        handleAliyunSdkFail(fail, rejectInstance);
      },
      onError: (error: unknown) => {
        logger.warn("[captcha] aliyun sdk onError", { configKey, ...summarizeAliyunError(error) });
        if (inFlight && !inFlight.allowInteractive) {
          rejectInFlight(new CaptchaInteractiveRequiredError());
          return;
        }
        rejectInstance(error ?? Error("Captcha errored before instance ready."));
        rejectInFlight(error ?? Error("Captcha errored."));
      },
    });
  } catch (error) {
    instanceEntry = null;
    logger.warn("[captcha] aliyun sdk init threw", { configKey, ...summarizeAliyunError(error) });
    rejectInstance(error);
    throw error;
  }
  return instanceEntry;
}

/** 原 MSt（— / 100322）：实例等待 + 超时 */
async function awaitCaptchaInstance(promise: Promise<AliyunCaptchaInstance>, options: { configKey?: string; initStartedAt?: number } = {}): Promise<AliyunCaptchaInstance> {
  return Promise.race([
    promise,
    new Promise<AliyunCaptchaInstance>((_, reject) => {
      window.setTimeout(() => {
        logger.warn("[captcha] aliyun sdk instance wait timed out", {
          configKey: options.configKey ?? null,
          timeoutMs: CAPTCHA_INSTANCE_TIMEOUT_MS,
          elapsedSinceInitMs: options.initStartedAt === undefined ? null : Date.now() - options.initStartedAt,
        });
        reject(Error(`Captcha instance timed out after ${CAPTCHA_INSTANCE_TIMEOUT_MS}ms.`));
      }, CAPTCHA_INSTANCE_TIMEOUT_MS);
    }),
  ]);
}
/** 原 NSt（— / 100335）：脚本加载后 2s 稳定等待 */
async function waitCaptchaScriptSettle(): Promise<void> {
  if (!scriptLoadedAt) return;
  const elapsed = Date.now() - scriptLoadedAt;
  if (elapsed >= CAPTCHA_SCRIPT_SETTLE_MS) return;
  const remaining = CAPTCHA_SCRIPT_SETTLE_MS - elapsed;
  await new Promise((resolve) => {
    window.setTimeout(() => resolve(undefined), remaining);
  });
}

/** 原 PSt（— / 100344）：验证主流程（auto/traceless/interactive + 延迟交互升级 + 超时） */
async function runAliyunCaptchaVerification(
  config: CaptchaConfig,
  options: { allowInteractive?: boolean; preferInteractive?: boolean; timeoutMs?: number; onInteractiveChallenge?: () => void } = {},
): Promise<string> {
  if (typeof window > "u" || typeof document > "u") throw Error("Captcha requires browser environment.");
  if (inFlight || verificationRunning) throw Error("Captcha verification is already in progress.");
  verificationRunning = true;
  try {
    const allowInteractive = options.allowInteractive !== false;
    const preferInteractive = options.preferInteractive === true;
    const timeoutMs = options.timeoutMs;
    const onInteractiveChallenge = options.onInteractiveChallenge;
    const attemptKind = preferInteractive ? "interactive" : allowInteractive ? "auto" : "traceless";
    const entry = await initAliyunCaptchaInstance(config);
    await waitCaptchaScriptSettle();
    let captured: CaptchaInFlight | null = null;
    const verification = new Promise<string>((resolve, reject) => {
      let deferredRequested = false;
      inFlight = {
        resolve,
        reject,
        allowInteractive,
        handleDeferredFail: allowInteractive
          ? (fail) => {
              if (deferredRequested) return;
              deferredRequested = true;
              logger.info("[captcha] aliyun deferred interactive challenge requested", { attemptKind, fail: summarizeCaptchaFail(fail) });
              onInteractiveChallenge?.();
              awaitCaptchaInstance(entry.instancePromise, { configKey: entry.configKey, initStartedAt: entry.initStartedAt })
                .then((instance) => {
                  if (!inFlight) return;
                  if (typeof instance.show == "function") {
                    logger.info("[captcha] aliyun show deferred interactive challenge", { attemptKind });
                    instance.show();
                    return;
                  }
                  logger.info("[captcha] aliyun deferred fallback button click", { attemptKind, buttonSelector: entry.buttonSelector });
                  entry.buttonElement.click();
                })
                .catch((error) => {
                  logger.warn("[captcha] aliyun deferred interactive challenge failed", {
                    error: error instanceof Error ? error.message : String(error),
                  });
                  rejectInFlight(error);
                });
            }
          : undefined,
      };
      captured = inFlight;
      void (async () => {
        let instance: AliyunCaptchaInstance;
        try {
          instance = await awaitCaptchaInstance(entry.instancePromise, { configKey: entry.configKey, initStartedAt: entry.initStartedAt });
        } catch (error) {
          if (!allowInteractive) {
            rejectInFlight(error instanceof CaptchaInteractiveRequiredError ? error : new CaptchaInteractiveRequiredError("Captcha instance was not ready for traceless verification."));
            return;
          }
          rejectInFlight(error);
          return;
        }
        if (inFlight) {
          logger.info("[captcha] aliyun execute start", {
            allowInteractive,
            attemptKind,
            hasShow: typeof instance.show == "function",
            hasStartTracelessVerification: typeof instance.startTracelessVerification == "function",
            preferInteractive,
            timeoutMs: timeoutMs ?? null,
          });
          try {
            if (!preferInteractive && typeof instance.startTracelessVerification == "function") {
              logger.info("[captcha] aliyun start traceless verification", { attemptKind });
              instance.startTracelessVerification();
              return;
            }
            if (!allowInteractive) {
              rejectInFlight(new CaptchaInteractiveRequiredError("Traceless verification is unavailable for this captcha instance."));
              return;
            }
            if (preferInteractive) {
              onInteractiveChallenge?.();
              logger.info("[captcha] aliyun trigger button click", { attemptKind, buttonSelector: entry.buttonSelector });
              entry.buttonElement.click();
              return;
            }
            logger.info("[captcha] aliyun fallback button click", { attemptKind, buttonSelector: entry.buttonSelector });
            onInteractiveChallenge?.();
            entry.buttonElement.click();
          } catch (error) {
            rejectInFlight(error);
          }
        }
      })();
    });
    if (timeoutMs !== undefined && timeoutMs > 0) {
      let timer: number | undefined;
      const timeout = new Promise<void>((resolve) => {
        timer = window.setTimeout(() => {
          if (!inFlight || inFlight !== captured) return;
          if (!allowInteractive && inFlight.awaitingDeferredSdkSuccess) {
            captchaDebug("traceless.timeout.skipped", { reason: "awaiting_deferred_sdk_success", timeoutMs });
            return;
          }
          captchaDebug(allowInteractive ? "interactive.timeout" : "traceless.timeout", { timeoutMs });
          rejectInFlight(allowInteractive ? Error(`Captcha verification timed out after ${timeoutMs}ms.`) : new CaptchaInteractiveRequiredError(`Traceless captcha timed out after ${timeoutMs}ms.`));
          resolve();
        }, timeoutMs);
      });
      try {
        return await Promise.race([verification, timeout.then(() => Promise.reject(Error(`Captcha verification timed out after ${timeoutMs}ms.`)))]);
      } catch (error) {
        inFlight = null;
        throw error;
      } finally {
        if (timer !== undefined) window.clearTimeout(timer);
      }
    }
    return await verification;
  } catch (error) {
    inFlight = null;
    throw error;
  } finally {
    verificationRunning = false;
  }
}

/** 原 FSt/ISt/LSt：验证头 */
export const CAPTCHA_VERIFY_HEADER = "X-Aliyun-Captcha-Verify-Param";
export const CAPTCHA_REGION_HEADER = "X-Aliyun-Captcha-Verify-Region";
export function buildCaptchaHeaders(args: { captchaVerifyParam: string; captchaRegion?: string | null }): Record<string, string> {
  const region = args.captchaRegion?.trim();
  return {
    [CAPTCHA_VERIFY_HEADER]: args.captchaVerifyParam,
    ...(region ? { [CAPTCHA_REGION_HEADER]: region } : {}),
  };
}

/** 原 RSt/zSt/BSt/VSt/HSt：ARMS 自定义事件 */
const CAPTCHA_ARMS_EVENT_NAME = "aliyun_captcha_verification";
const CAPTCHA_ARMS_GROUP = "captcha";
let armsReporter: { reportArmsCustomEvent(event: unknown): Promise<void> } | null = null;
export function injectArmsReporter(reporter: typeof armsReporter): void {
  armsReporter = reporter;
}
function buildCaptchaArmsEvent(event: { result: string; source: string; providerId?: string | null }): Record<string, unknown> {
  const tracelessPassed = event.result === "traceless_passed";
  const captchaDisplayed = event.result === "interactive_displayed" || event.result === "interactive_passed";
  return {
    name: CAPTCHA_ARMS_EVENT_NAME,
    group: CAPTCHA_ARMS_GROUP,
    value: 1,
    properties: {
      result: event.result,
      source: event.source,
      provider_id: event.providerId,
      traceless_passed: tracelessPassed,
      captcha_displayed: captchaDisplayed,
      traceless_passed_count: +!!tracelessPassed,
      captcha_displayed_count: +!!captchaDisplayed,
    },
  };
}
function reportCaptchaArmsEvent(event: { result: string; source: string; providerId?: string | null }): void {
  if (!armsReporter) return;
  const payload = buildCaptchaArmsEvent(event);
  armsReporter.reportArmsCustomEvent(payload).catch((error) => {
    logger.warn("[captcha] ARMS 自定义事件上报失败", {
      result: event.result,
      source: event.source,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

/** 原 USt/WSt/GSt/KSt/qSt/JSt/YSt/b0：zcode-plan 供应商判定 */
declare const ZCODE_PLAN_OPENAI_BASE_URL: string; // USt（Gnt.zcodePlanOpenAiBaseUrl）
declare function resolveProviderEndpoint(provider: unknown, format: string): string; // YSt/Ir
declare function normalizeProviderConfig(value: unknown): { providerId?: string } | null; // se
declare function providerConfigFromOptions(options: unknown): string | null; // Ie
declare function resolveSupplierProvider(value: string | null | undefined): string | null; // Uq
function providerPrefix(value: string): string | null {
  const trimmed = value.trim();
  const slash = trimmed.indexOf("/");
  return slash <= 0 ? null : trimmed.slice(0, slash).trim() || null;
}
function resolveProviderIdFromLabel(label?: string | null): string | null {
  const trimmed = label?.trim() ?? "";
  if (!trimmed) return null;
  const normalized = normalizeProviderConfig(trimmed);
  return normalized?.providerId ? normalized.providerId : providerPrefix(trimmed);
}
function resolveTaskProviderId(entry: { configOptions?: unknown; selectedSupplierKey?: string | null; taskMeta?: { model?: string } | null }): string | null {
  return (
    resolveProviderIdFromLabel(entry.configOptions ? providerConfigFromOptions(entry.configOptions) : null) ||
    (entry.selectedSupplierKey ? resolveSupplierProvider(entry.selectedSupplierKey) : null) ||
    resolveProviderIdFromLabel(entry.taskMeta?.model)
  );
}
function normalizeBaseUrl(value?: string | null): string {
  return value?.trim().replace(/\/+$/, "").toLowerCase() ?? "";
}
function isZcodePlanBaseUrl(value?: string | null): boolean {
  const normalized = normalizeBaseUrl(value);
  return normalized
    ? normalized === ZCODE_PLAN_OPENAI_BASE_URL.toLowerCase() ||
        normalized.startsWith(`${ZCODE_PLAN_OPENAI_BASE_URL.toLowerCase()}/`) ||
        normalized.endsWith("/zcode-plan") ||
        normalized.endsWith("/zcode-plan/anthropic")
    : false;
}
/** 原 b0（118292 / 100548）：供应商是否受 captcha 保护（zcode-plan 基址判定） */
export function isCaptchaProtectedProvider(provider: unknown): boolean {
  return (
    isZcodePlanBaseUrl(provider ? resolveProviderEndpoint(provider, "openai-compatible") : undefined) ||
    isZcodePlanBaseUrl(provider ? resolveProviderEndpoint(provider, "anthropic") : undefined)
  );
}

export const CAPTCHA_VERIFY_FAILED_MESSAGE = "Captcha verification failed. Please try again."; // ZSt

/** 原 nCt/w0/T0/rCt/iCt/aCt：验证参数缓存 + 运行时头账本 */
const captchaParamCache = new Map<string, { param: string; obtainedAt: number }>(); // QSt
const certifyIdByProvider = new Map<string, string>(); // $St
const runtimeHeadersBySession = new Map<string, Record<string, string>>(); // C0
function cacheCaptchaParam(providerId: string, param: string): void {
  const trimmed = param.trim();
  if (trimmed) captchaParamCache.set(providerId.trim(), { param: trimmed, obtainedAt: Date.now() });
}
function forgetCaptchaParam(providerId: string): void {
  captchaParamCache.delete(providerId.trim());
}
function runtimeHeadersKey(entry: { workspaceIdentity?: string | null; workspacePath: string; sessionId?: string | null; providerId: string }): string {
  return [entry.workspaceIdentity?.trim() || entry.workspacePath, entry.sessionId?.trim() ?? "", entry.providerId.trim()].join("::");
}
function rememberRuntimeHeaders(entry: { workspaceIdentity?: string | null; workspacePath: string; sessionId?: string | null; providerId: string; runtimeProviderHeaders: Record<string, string> }): void {
  if (!entry.providerId.trim()) return;
  runtimeHeadersBySession.set(runtimeHeadersKey(entry), entry.runtimeProviderHeaders);
}
function forgetRuntimeHeaders(entry: { workspaceIdentity?: string | null; workspacePath: string; sessionId?: string | null; providerId: string; runtimeProviderHeaders: Record<string, string> }): void {
  const key = runtimeHeadersKey(entry);
  if (runtimeHeadersBySession.get(key) === entry.runtimeProviderHeaders) runtimeHeadersBySession.delete(key);
}
/** 原 aCt（— / 100585）：取出并清除运行时头 */
export function takeRuntimeProviderHeaders(entry: { workspaceIdentity?: string | null; workspacePath: string; sessionId?: string | null; providerId: string }): Record<string, string> | undefined {
  const key = runtimeHeadersKey(entry);
  const headers = runtimeHeadersBySession.get(key);
  runtimeHeadersBySession.delete(key);
  return headers;
}

/** 原 E0/D0：配置缓存（60s + 在途共享）/可用性判定 */
let captchaConfigCache: { value: CaptchaConfig | null; expiresAt: number } | null = null; // x0
let captchaConfigInFlight: Promise<CaptchaConfig | null> | null = null; // S0
async function getCachedCaptchaConfig(service?: { getCaptchaConfig?(): Promise<CaptchaConfig | null> }): Promise<CaptchaConfig | null> {
  const now = Date.now();
  if (captchaConfigCache && captchaConfigCache.expiresAt > now) return captchaConfigCache.value;
  if (!captchaConfigInFlight) {
    captchaConfigInFlight = (async () => {
      try {
        const config = await service?.getCaptchaConfig?.();
        captchaConfigCache = { value: config ?? null, expiresAt: now + 60000 };
        return config ?? null;
      } catch {
        return null;
      }
    })().finally(() => {
      captchaConfigInFlight = null;
    });
  }
  return captchaConfigInFlight;
}
function isCaptchaConfigUnusable(config: CaptchaConfig | null): boolean {
  return !config || config.enabled === false ? true : !config.region || !config.prefix || !config.sceneId;
}
/** 原 oCt/sCt/cCt：配置 → 初始化参数（语言映射） */
const LOCALE_PREFERENCE_KEY = "zcode-locale-preference"; // tCt
function resolveCaptchaLanguage(): string {
  const preference = readLocalePreference();
  if (preference === "zh-CN") return "cn";
  if (preference === "en-US") return "en";
  return (typeof navigator > "u" ? "" : navigator.language.toLowerCase()).startsWith("zh") ? "cn" : "en";
}
function readLocalePreference(): string | null {
  if (typeof localStorage > "u" || typeof localStorage.getItem != "function") return null;
  const value = localStorage.getItem(LOCALE_PREFERENCE_KEY);
  return value === "zh-CN" || value === "en-US" || value === "system" ? value : null;
}
function toCaptchaInitConfig(config: CaptchaConfig): CaptchaConfig {
  return { region: config.region, prefix: config.prefix, sceneId: config.sceneId, language: resolveCaptchaLanguage() };
}
/** 原 lCt：验证串行队列 */
let verificationQueueTail: Promise<void> = Promise.resolve(); // eCt
async function withVerificationQueue<T>(providerId: string | undefined, run: () => Promise<T>): Promise<T> {
  const previous = verificationQueueTail;
  let release!: () => void;
  verificationQueueTail = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    logger.debug("[captcha] zcode-plan verification queue slot acquired", { providerId: providerId ?? null });
    return await run();
  } finally {
    release();
  }
}
/** 原 uCt：发送前预检（配置可用 → 重置 → 验证 → 缓存参数 + ARMS） */
async function runSendPreflightCaptcha(
  service: { getCaptchaConfig?(): Promise<CaptchaConfig | null> },
  options: { providerId?: string; source?: string } = {},
): Promise<string | undefined> {
  const config = await getCachedCaptchaConfig(service);
  if (!config || isCaptchaConfigUnusable(config)) return undefined;
  const providerId = options.providerId?.trim();
  const initConfig = toCaptchaInitConfig(config);
  return withVerificationQueue(providerId, async () => {
    resetCaptchaState();
    let interactiveDisplayed = false;
    const param = await runAliyunCaptchaVerification(initConfig, {
      allowInteractive: true,
      timeoutMs: CAPTCHA_VERIFICATION_TIMEOUT_MS,
      onInteractiveChallenge: () => {
        interactiveDisplayed = true;
      },
    });
    if (providerId) cacheCaptchaParam(providerId, param);
    reportCaptchaArmsEvent({
      result: interactiveDisplayed ? "interactive_displayed" : "traceless_passed",
      source: options.source ?? "send_preflight",
      providerId,
    });
    return param;
  });
}
/** 原 dCt（— / 100655）：发送前 certifyId 记录（F008 重复告警） */
export function noteCaptchaCertifyIdForSend(providerId: string, verifyParam: string): void {
  const certifyId = extractCertifyId(verifyParam);
  if (!certifyId) return;
  const previous = certifyIdByProvider.get(providerId);
  if (previous && previous === certifyId) {
    logger.warn("[captcha] certifyId 与上一轮相同，请求可能触发 F008 重复提交", { providerId, certifyId });
  }
  certifyIdByProvider.set(providerId, certifyId);
  logger.debug("[captcha] prepared certifyId for send", { providerId, certifyId, reusedFromPrevious: previous === certifyId });
}
/** 原 fCt（— / 100666）：受保护供应商发送前恢复（b0 门控 + 配置/验证/参数三段） */
export async function restoreCaptchaVerificationForSend(args: {
  providerConfig: unknown;
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null> };
  providerId?: string;
  modelProviderService?: unknown;
}): Promise<string> {
  if (!isCaptchaProtectedProvider(args.providerConfig)) return "";
  const config = await getCachedCaptchaConfig(args.codingPlanSubscriptionService);
  if (!config || isCaptchaConfigUnusable(config)) throw Error(CAPTCHA_VERIFY_FAILED_MESSAGE);
  const param = await runSendPreflightCaptcha(args.codingPlanSubscriptionService, {
    providerId: args.providerId,
  });
  if (!param?.trim()) throw Error(CAPTCHA_VERIFY_FAILED_MESSAGE);
  return param;
}

/* ============================================================================
 * 6. 交互通知 toast（原 eSt/tSt + Gxt…$xt，jsx 99539–99745）
 * ==========================================================================*/

interface TaskNotification {
  taskId: string;
  status: string;
  requestId?: string;
  title: string;
  body: string;
}
type FormatMessageFn = (descriptor: { id: string }) => string;

/** 原 Uxt（99509）：会话相位 → 通知相位（接口级映射） */
declare function resolveNotificationPhase(phase: string | undefined): string | null;
/** 原 Wxt（99522）：会话+相位 → 通知载荷 */
declare function buildSessionPhaseNotification(session: AgentSessionSnapshot, phase: string, formatMessage: FormatMessageFn): TaskNotification;
/** 原 e0（99512）：通知正文回退（任务标题拼接） */
declare function notificationBodyFallback(title: string | undefined, id: string, formatMessage: FormatMessageFn): string;

/** 原 Gxt（99539）：相位变化 → 通知列表 */
function collectPhaseChangeNotifications(args: {
  previousBySessionId: Map<string, AgentSessionSnapshot>;
  sessions: AgentSessionSnapshot[];
  formatMessage: FormatMessageFn;
}): TaskNotification[] {
  const notifications: TaskNotification[] = [];
  for (const session of args.sessions) {
    const phase = resolveNotificationPhase(session.phase);
    if (!phase) continue;
    const previous = args.previousBySessionId.get(session.sessionId);
    if (previous && resolveNotificationPhase(previous.phase) !== phase) {
      notifications.push(buildSessionPhaseNotification(session, phase, args.formatMessage));
    }
  }
  return notifications;
}
function isPlainObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value == "object" && !!value && !Array.isArray(value);
}
/** 原 qxt：plan 审批交互判定 */
function isPlanApprovalInteraction(payload: PendingInteraction["payload"]): boolean {
  if (payload.toolName === "ExitPlanMode") return true;
  return isPlainObjectValue(payload.schema)
    ? payload.schema.interaction === "plan_approval" || payload.schema.toolName === "ExitPlanMode"
    : false;
}
/** 原 Jxt（99555）：交互 → 通知载荷（permission/plan/问卷三分派） */
function buildInteractionNotification(args: {
  snapshot: AgentSessionSnapshot;
  interaction: PendingInteraction;
  formatMessage: FormatMessageFn;
}): TaskNotification {
  const { snapshot, interaction, formatMessage } = args;
  const requestId = interaction.interactionId;
  const taskId = snapshot.sessionId;
  const title = snapshot.meta?.title;
  if (interaction.payload.kind === "permission") {
    return {
      taskId,
      status: "permission_request",
      requestId,
      title: formatMessage({ id: "notification.permissionRequired" }),
      body: (interaction.payload.summary ?? "").trim() || notificationBodyFallback(title, "notification.permissionRequired", formatMessage),
    };
  }
  if (isPlanApprovalInteraction(interaction.payload)) {
    return {
      taskId,
      status: "elicitation_request",
      requestId,
      title: formatMessage({ id: "notification.planApprovalRequired" }),
      body: formatMessage({ id: "notification.planApprovalBody" }),
    };
  }
  return {
    taskId,
    status: "elicitation_request",
    requestId,
    title: formatMessage({ id: "notification.inputRequired" }),
    body: (interaction.payload.prompt ?? "").trim() || notificationBodyFallback(title, "notification.inputRequired", formatMessage),
  };
}
/** 原 Yxt（99592）：快照中未见交互 → 通知列表 */
function collectUnseenInteractionNotifications(args: {
  snapshot: AgentSessionSnapshot;
  seenRequestIds: Set<string>;
  formatMessage: FormatMessageFn;
}): TaskNotification[] {
  return (args.snapshot.pendingInteractions ?? [])
    .filter((interaction) => !args.seenRequestIds.has(interaction.interactionId))
    .map((interaction) => buildInteractionNotification({ snapshot: args.snapshot, interaction, formatMessage: args.formatMessage }));
}
/** 原 Xxt（99599）：空白串 → undefined */
function trimToUndefined(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}
/** 原 Zxt（99602）：工作区通知键签名 */
function workspaceNotifierSignature(args: { workspacePath: string; workspaceIdentity?: string; endpointKey?: string }): string {
  return [args.endpointKey ?? "__base__", args.workspaceIdentity ?? "", args.workspacePath].join("\0");
}
/** 原 Qxt（99605）：会话 → sessionId 映射 */
function sessionsByIdMap(sessions: AgentSessionSnapshot[]): Map<string, AgentSessionSnapshot> {
  return new Map(sessions.map((session) => [session.sessionId, session]));
}
/** 原 $xt（99608）：平台通知触发（吞异常） */
function showTaskNotificationSafe(platform: PlatformService, notification: TaskNotification): void {
  try {
    platform.showTaskNotification(notification);
  } catch (error) {
    logger.warn("[task-notification] 触发平台通知失败", {
      taskId: notification.taskId,
      status: notification.status,
      error,
    });
  }
}

/** 原 eSt（117283 / 99619）：工作区级交互通知钩子（订阅会话注册表，相位变化触发） */
export function useWorkspaceInteractionNotifier(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  endpointKey?: string | null;
  enabled: boolean;
  rpcReady: boolean;
  platform: PlatformService | null;
  formatMessage: FormatMessageFn;
}): void {
  const services = useServices(); // 原 fs()（bundle eSt 117331）：context 面，零参
  const workspaceIdentity = trimToUndefined(args.workspaceIdentity);
  const endpointKey = trimToUndefined(args.endpointKey);
  const workspaceKey = workspaceIdentity ?? args.workspacePath;
  const signature = React.useMemo(
    () =>
      workspaceNotifierSignature({
        workspacePath: args.workspacePath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        ...(endpointKey ? { endpointKey } : {}),
      }),
    [endpointKey, workspaceIdentity, args.workspacePath],
  );
  const [state, setState] = React.useState<{ signature: string; sessions: AgentSessionSnapshot[]; status: string }>({
    signature,
    sessions: [],
    status: "idle",
  });
  const previousRef = React.useRef<Map<string, AgentSessionSnapshot> | null>(null);

  React.useEffect(() => {
    previousRef.current = null;
    setState({ signature, sessions: [], status: "idle" });
  }, [signature]);

  React.useEffect(() => {
    if (!args.enabled || !args.rpcReady || !args.platform) {
      previousRef.current = null;
      setState({ signature, sessions: [], status: "idle" });
      return;
    }
    const key: WorkspaceNotifierKey = {
      workspaceKey,
      workspacePath: args.workspacePath,
      ...(workspaceIdentity ? { workspaceIdentity } : {}),
      ...(endpointKey ? { endpointKey } : {}),
    };
    const registry = registerWorkspaceNotifier(key, services.zcodeAgentService);
    const sync = () => {
      setState({ signature, sessions: registry.getSessions(), status: registry.getStatus() });
    };
    const unsubscribe = registry.subscribe(sync);
    sync();
    return () => {
      unsubscribe();
      unregisterWorkspaceNotifier(key, registry);
    };
  }, [args.enabled, endpointKey, args.platform, args.rpcReady, signature, workspaceIdentity, workspaceKey, args.workspacePath, services]);

  React.useEffect(() => {
    if (!args.enabled || !args.platform || state.signature !== signature || state.status !== "live") return;
    const previous = previousRef.current;
    const next = sessionsByIdMap(state.sessions);
    if (!previous) {
      previousRef.current = next;
      return;
    }
    const notifications = collectPhaseChangeNotifications({
      previousBySessionId: previous,
      sessions: state.sessions,
      formatMessage: args.formatMessage,
    });
    for (const notification of notifications) showTaskNotificationSafe(args.platform, notification);
    previousRef.current = next;
  }, [args.enabled, args.formatMessage, state, args.platform, signature]);
}

/** 原 tSt（117346 / 99703）：快照级交互通知钩子（新出现 pendingInteraction 触发） */
export function useSnapshotInteractionNotifier(args: {
  snapshot: AgentSessionSnapshot | null;
  enabled: boolean;
  platform: PlatformService | null;
  formatMessage: FormatMessageFn;
}): void {
  const seenRef = React.useRef<{ sessionId: string; seenRequestIds: Set<string> } | null>(null);
  React.useEffect(() => {
    if (!args.enabled || !args.snapshot) {
      seenRef.current = null;
      return;
    }
    const interactionIds = (args.snapshot.pendingInteractions ?? []).map((interaction) => interaction.interactionId);
    const seen = seenRef.current;
    if (!seen || seen.sessionId !== args.snapshot.sessionId) {
      seenRef.current = { sessionId: args.snapshot.sessionId, seenRequestIds: new Set(interactionIds) };
      return;
    }
    if (args.platform) {
      const notifications = collectUnseenInteractionNotifications({
        snapshot: args.snapshot,
        seenRequestIds: seen.seenRequestIds,
        formatMessage: args.formatMessage,
      });
      for (const notification of notifications) showTaskNotificationSafe(args.platform, notification);
    }
    for (const id of interactionIds) seen.seenRequestIds.add(id);
  }, [args.enabled, args.formatMessage, args.platform, args.snapshot]);
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行 / jsx 行；本批次展开的六组叶子）
 * ============================================================================
 *  滚动意图：Ryt 97137 | T1 97140 | zyt 97143 | Byt 97146 | Vyt 97149 | Hyt 97152
 *   Uyt 97155 | Wyt 97158 | Gyt 97161 | E1 97164 | Kyt 97171 | D1 97174
 *   qyt 97177 | Jyt 97180 | Yyt 97184 | Xyt 97187
 *  工具视图：opt 105465/90659 | Gft 104844/90186 (+Kft 90290) | Spt 105825/91001
 *   upt 105569/90768 (+lpt 90700) | Mht 108857/93007 | Pht 108963/93067
 *   Vpt 106243/91282 | Dht 108728/92920 | Sht 108581/92812 | mht 108309/92669
 *   eht 107835/92325 | ght 108426/92725 | omt 106753/91604 | Nmt 107168/91932
 *   Wmt 107472/92099 | Qpt 106609/91478 (+Hpt 106405/91360, Xpt 106604/91469)
 *  共享件：VQ 90046 | jft 90063 | Mft/Nft/Pft/Fft 90090–90120 | Ift 90127 | Lft 90133
 *   HQ 90147 | Rft 90150 | zft 90157 | Bft/Vft/Hft 90166 | Uft 90173 | UQ 90177 | Wft 90183
 *  预览卡：A_t 111233/94950 | O_t 111161/94877 | k_t 111193/94925
 *   C_t 94833 | w_t 94836 | T_t 94839 | E_t 94854 | D_t 94870 | c1 94007
 *  自动化卡：Mvt 96194 | Nvt 96214 | Pvt 96223 | Fvt 96229 | fgt 93676
 *   sgt 93617 | cgt 93623 | lgt 93631 | ugt 93635 | dgt 93666
 *  captcha：ASt 117919/100205 | jSt 100280 | MSt 100322 | NSt 100335 | PSt 100344
 *   kSt 100160 | wSt 100110 | v0/TSt/ESt/DSt/OSt 100130–100190
 *   r0/i0/_St/vSt/a0/o0/ySt/bSt/s0/c0/xSt/SSt 100045–100100
 *   FSt/ISt/LSt 100470–100478 | RSt/zSt/BSt/VSt/HSt 100480–100500
 *   b0 118292/100548 | nCt/w0/T0/rCt/iCt/aCt 100560–100590
 *   E0/D0/oCt/sCt/cCt/lCt/uCt/dCt/fCt 100590–100680
 *  toast：eSt 117283/99619 | tSt 117346/99703 | Gxt 99539 | Kxt 99549 | qxt 99552
 *   Jxt 99555 | Yxt 99592 | Xxt 99599 | Zxt 99602 | Qxt 99605 | $xt 99608
 * ============================================================================
 */
