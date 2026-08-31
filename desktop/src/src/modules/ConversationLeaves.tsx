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
 *  [Captcha] Aliyun captcha 部件（A1-R16 真身行全勘，旧 jsx 视图注保留对照）：
 *   ASt  → handleAliyunSdkFail       (117936 / 100205；旧注 117919 误读，R15 勘误)
 *   jSt  → initAliyunCaptchaInstance (117983 / 100280)
 *   MSt  → awaitCaptchaInstance      (118055 / 100322)
 *   NSt  → waitCaptchaScriptSettle   (118070 / 100335)
 *   PSt  → runAliyunCaptchaVerification (118080 / 100344)
 *   kSt  → rejectCaptchaRemoved      (117929；A1-R16 实体化；loadAliyunCaptchaScript 束内无对应，删碑)
 *   wSt  → CaptchaHostContainer      (117871 / 100110；消费 212894 = AppRootLeaves 1910)
 *   v0/TSt/ESt/DSt/OSt → 在途拒绝/重置/配置键/挂载校验/按钮查询 (117934/117899/117904/117915/117924)
 *   r0/i0/_St/vSt/a0/o0/ySt/bSt/s0/c0/xSt/SSt → 失败载荷解析族 (117763–117867)
 *   FSt/ISt/LSt → 验证头名/区域头名/头构建 (118231–118233)
 *   RSt/zSt/BSt/VSt/HSt → ARMS 事件名/组/注入/构建/上报 (118237–118270)
 *   USt/WSt/GSt/KSt → 基址常量/前缀/label 解析/任务供应商 (118271/118272/118279/118284；KSt canonical=captchaProviderOfTaskMeta，A1-R16 导出收敛)
 *   pCt  → resolveCodingPlanProviderHeaders (118459；A1-R16 实体化)
 *   b0   → isCaptchaProtectedProvider (118309 / 100548)
 *   nCt/w0/T0/rCt/iCt/aCt → 验证参数缓存/运行时头账本 (— / 100560–100590)
 *   E0/D0/oCt/sCt/cCt/lCt/uCt/dCt/fCt → 配置缓存/可用性/语言/串行队列/预检/发送前恢复 (— / 100590–100680)
 *   XSt/ZSt → CAPTCHA_VERIFY_FAILED_CODE/CAPTCHA_VERIFY_FAILED_MESSAGE (118312–118313)
 *   mCt/kCt/ACt/jCt/A0/j0/MCt/M0/NCt → 3007 自动恢复链（§5b：retryCaptchaForRecovery/createCaptchaGatekeeper/buildCaptchaAssertionKeys/findCaptchaRecoveryEditTarget/captchaAssertionStatus/recordCaptchaFailure/sharedCaptchaRecoveryGatekeeper/isCaptchaDecisionHandled/useSessionErrorRecovery，118462–118867；A1-R14）
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

/* ============================================================================
 * 〔A0-S4-4b：components 拆分（conversation/composer 域）——本文件现为薄 re-export shim〕
 * 三个组件族已按族原样迁入，导入方零改动（仍从本文件取符号）：
 *   §2 工具视图共享件 + 17 工具视图 → components/conversation/ConversationToolViews.tsx
 *   §3 预览卡单项                    → components/conversation/PreviewCards.tsx
 *   §4 自动化卡                      → components/conversation/AutomationCards.tsx
 * §0 声明群随消费族分配：IconQuestion/展开区三件（ToolCallExpandedContent/
 * SnapshotRefsLoader/ToolErrorSurface）/代码面六件/resolvePathTitle/
 * resolveStreamingChildSummary/extractToolErrorText/extractPlanMarkdown/
 * usePlatformService/代理目录三件（+AgentDescriptor）随工具视图族；
 * useWorkspaceScopedServices（+FileServiceLike）随预览卡族；
 * FileIcon/resolveFileIconMeta 为工具视图族与预览卡族共用，按消费方复制（shim 不再保留）。
 * PlatformService 型别留守本文件（§5/§6 消费，补 export；工具视图族经 type import 取回）。
 * §1 滚动意图助手族（纯函数管线）、§5 captcha 引擎（服务管线，组件与模块级引擎态纠缠）、
 * §6 交互通知钩子（hooks 管线）非组件单元，留守本文件。
 * ==========================================================================*/
import * as React from "react";
import type { CodePreviewSettings, FileLinkModel } from './MarkdownIntegration'; // 〔A0-S4-4b〕§0 共享类型 ToolCallViewProps 签名所需二型别（原导入块余量，type-only）
import { logger, parseCustomModelId, getCurrentModelValue, type ConfigOption } from './SkillStore'; // A1-R17：+parseCustomModelId（原 se=skillStore D@903 导出 O）+getCurrentModelValue（原 Ie=skillStore I@982 导出 w）+ConfigOption 型——KSt 簇 118281/118285 消费改指属主导出
import { cn } from './UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { useServices, useBaseServices } from './services'; // 原 eSt 内 fs()（bundle 117331）= context 面 useServices（A0-D 裁决：基线误名 useWorkspaceServices）；+useBaseServices（原 Ec，4945；A1-R14 §5b NCt 消费）
import { normalizeCaptchaCode } from './StoresDeep'; // A1-R14：原 Cw（40570，R12 收敛 stub）——§5b NCt 3007 判定消费；环安全：StoresDeep 不反引本文件（grep 实证）
import { resolveProviderKindEndpointUrl, GHOST_PROVIDER_REF_PREFIX } from './SrcSharedB'; // A1-R17：原 Ir=src chunk vu@5076（导出 Uo）属主导出 + Pte=src chunk sS@8980（导出 k）——YSt/Uq 逐字消费
import { pendingCommandLedger } from '../components/conversation/ConversationCommandLedger'; // 原 K1（styles 115758–115963 class 单例；〔A1-P1-B6〕跨域改指——R25 基线 declare 删，真身 components/conversation 叶；本文件消费面零，import 仅属主归指）

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
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（8）：IconPencil/IconSearch/IconTerminal/IconShield/IconTarget/IconGauge/IconCalendar/IconClock → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（9）：IconBot/IconGlobe/IconFile/IconCheck/IconCopy/IconChevronRight/IconArrowUpRight/IconExternal/IconLoader → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

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
/* A0-CLEANUP3 #36：target 收 any（束边界弱形）——值侧 (source: SidePanel.CodeViewerSource) => void
 * 与调用面字面量 {type:"file";title;path?: undefined}（NodeRepl 结果打开，1857）
 * 双向兼容；原 unknown 形参致逆变失配（3602/3355/3401）。 */
export type OpenCodeViewerFn = (target: any) => void;

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
  onOpenFileLink?: (link: FileLinkModel) => void;
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
/** Markdown 渲染器（原 cj，F19） */
/** Collapsible 原语（Radix 封装） */
/* ── tombstone（A0-S3c）：Collapsible、CollapsibleContent、CollapsibleTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */


/** 平台服务（原 S，imeComposition chunk） */
export interface PlatformService {
  prepareCuaHelperPermissionDrag?(): Promise<void>;
  openCuaPermissionOnboarding?(args: { initialPermission: string }): Promise<{ success: boolean; canceled?: boolean; error?: string }>;
  openCuaAccessibilitySettings?(): Promise<{ success: boolean; canceled?: boolean; error?: string }>;
  startCuaHelperPermissionDrag?(): void;
  showTaskNotification(notification: TaskNotification): void;
  getCaptchaConfig?(): Promise<CaptchaConfig | null>;
  [key: string]: unknown;
}
/** 工作区服务（原 fs/Oc） */
interface WorkspaceServicesLike { zcodeAgentService: unknown; fileService: unknown; [key: string]: unknown }
/** 打开 with 菜单（原 v_t，Conversation.tsx 接口级） */
/** 命令队列（原 OS/K1） */
declare function buildCommand(args: { type: string; sessionId: string | null; payload: unknown }): { commandId: string; [key: string]: unknown };
/* K1：〔A1-P1-B6〕跨域改指——R25 基线 declare const pendingCommandLedger（record/applyAck 二方法面）删，
   真 import 见文件头（./ConversationCommandLedger 真身叶，styles 115758–115963 逐字）；本文件消费面零，属主归指。 */
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
 * 〔A0-S4-4b〕§2/§3/§4 组件族迁出位——以下为再导出面（原 §2 469–2650、
 * §3 2651–2931、§4 2932–3113 已按族原样迁入 components/conversation/）
 * ==========================================================================*/

export {
  EditInlineDiffContent,
  FileWriteToolView,
  FileReadToolView,
  SearchToolView,
  ExploreToolView,
  AgentToolView,
  isCuaAccessRequest,
  CuaPermissionOnboardingPanel,
  FallbackToolView,
  GoalToolView,
  NodeReplToolView,
  AutomationToolView,
  SessionContextToolView,
  SkillToolView,
  SwitchModeToolView,
  TaskOutputToolView,
  TaskControlToolView,
  TodoToolView,
  AskUserQuestionToolView,
} from '../components/conversation/ConversationToolViews';

export {
  useVisiblePreviewCards,
  PreviewCard,
  PreviewCardList,
} from '../components/conversation/PreviewCards';
export type { PreviewCardModel } from '../components/conversation/PreviewCards';

export {
  collectAutomationCards,
  AutomationCard,
  AutomationCardList,
} from '../components/conversation/AutomationCards';
export type { AutomationModel, AutomationCardModel } from '../components/conversation/AutomationCards';

/* ============================================================================
 * 5. Aliyun captcha 部件（原 mSt…fCt，jsx 100034–100680）
 * ==========================================================================*/

const ALIYUN_CAPTCHA_SCRIPT_URL = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"; // mSt（A1-R16：束内 117754 声明后零消费，死常量，与束同构保留）
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

export interface CaptchaConfig { enabled?: boolean; region: string; prefix: string; sceneId: string; mode?: string; language?: string; captchaLogoImg?: string } // A1-R15 补 export：ConversationOverlays useOverlayServices declare 面型引用（type-only，无运行时环）
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

/* ── tombstone（A1-R16）：let scriptLoadPromise（declare 期误映 d0）删除——styles chunk 无脚本加载
 *    实体（d0 束内 117887 声明后零读写，死态）；前批 loadAliyunCaptchaScript 系 jsx 视图转录残留，
 *    同批删碑（见下 kSt 位）。 ── */
let instanceEntry: CaptchaInstanceEntry | null = null; // f0
let inFlight: CaptchaInFlight | null = null; // p0
let verificationRunning = false; // m0
let scriptLoadedAt = 0; // h0（A1-R16：束内 117892 声明后零赋值，waitCaptchaScriptSettle 恒早退——与束同构）
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
/* ── tombstone（A1-R16）：function loadAliyunCaptchaScript（declare 期误映 kSt）删除——styles chunk
 *    无脚本加载实体：kSt 真身 117929 = 恒拒门（`Promise.reject(Error(\`Captcha has been removed.\`))`），
 *    jSt 117986 唯一消费 = `await kSt()`（本构建 captcha SDK 初始化恒抛 removed）；createElement(`script`)
 *    束内 81615/83192 均属异域。前批按 jsx 视图转录引入偏差，本批收敛回束逐字行为。 ── */
/** 原 kSt（js 117929）— 逐字；移除门（本构建 captcha SDK 初始化恒拒） */
function rejectCaptchaRemoved(): Promise<never> {
  return Promise.reject(Error(`Captcha has been removed.`));
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
  if (!inFlight && isDeferredInteractiveFail(fail)) {
    // A1-R16 收敛：原 !p0 && bSt 分支（束 117938 逐字；前批误映 scriptLoadPromise）→ 无在途且延迟失败 → 记录 stale
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
  await rejectCaptchaRemoved(); // A1-R16：原 kSt 117986 逐字（恒拒门；前批误接脚本加载）
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
/** 原 NSt（js 118070 / 旧注 — / 100335）：脚本加载后 2s 稳定等待（A1-R16：h0 束内零赋值，恒早退，与束同构） */
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
export function buildCaptchaHeaders(args: { providerId?: string; captchaVerifyParam: string; captchaRegion?: string | null }): Record<string, string> {
  // A1-R14 型缝：providerId 为 mCt 118508 调用面携带字段（LSt 体内不读，bundle 逐字如此）
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

/** 原 USt/WSt/GSt/KSt/qSt/JSt/YSt/b0：zcode-plan 供应商判定（A1-R16 真身行：USt 118271 / WSt 118272 / GSt 118279 / KSt 118284） */
declare const ZCODE_PLAN_OPENAI_BASE_URL: string; // USt（Gnt.zcodePlanOpenAiBaseUrl；Gnt@88214 = hee(Wnt()) 惰性配置，深依赖留 declare）
/* ── tombstone（A1-R17）：declare function resolveProviderEndpoint（原 YSt，js 118303；Ir=src chunk vu@5076
 *    导出 Uo → SrcSharedB resolveProviderKindEndpointUrl 属主导出）删除——下方逐字实现。 ── */
/** 原 YSt（js 118303）：供应商种类端点解析（apiFormat 缺省补 anthropic-messages；endpoints 直读兜底） */
export function resolveProviderEndpoint(e: unknown, t: string): string | undefined {
  const provider = e as { apiFormat?: string; endpoints: { anthropic?: string; openai?: string } };
  return (
    resolveProviderKindEndpointUrl({ ...provider, apiFormat: provider.apiFormat ?? `anthropic-messages` }, t) ||
    (t === `anthropic` ? provider.endpoints.anthropic : provider.endpoints.openai)
  );
}
/* ── tombstone（A1-R17）：declare function normalizeProviderConfig（原 se = skillStore D@903 包裹 i，导出 O；
 *    属主 = stores/taskStore parseCustomModelId，原 D jsx 881）删除——调用面改指属主导出（下方）。 ── */
/* ── tombstone（A1-R17）：declare function providerConfigFromOptions（原 Ie = skillStore I@982，导出 w；
 *    属主 = stores/taskStore getCurrentModelValue，原 I jsx 958）删除——调用面改指属主导出（下方）。 ── */
/** 原 Uq（js 77975）：supplier key 供应商解析（custom: 前缀直取；ghost: 双段冒号后 payload 取 provider= 段，decodeURIComponent 容错） */
export function resolveSupplierProvider(e: string): string | null {
  let t = e.trim();
  if (t.startsWith(`custom:`)) return t.slice(7).trim() || null;
  if (!t.startsWith(`ghost:`)) return null;
  let n = t.indexOf(`:`, GHOST_PROVIDER_REF_PREFIX.length),
    r = n >= 0 ? t.indexOf(`:`, n + 1) : -1;
  if (r < 0) return null;
  let i = t.slice(r + 1),
    a = i;
  try {
    a = decodeURIComponent(i);
  } catch {
    a = i;
  }
  return (
    a
      .split(`,`)
      .map((e) => e.trim())
      .find((e) => e.startsWith(`provider=`))
      ?.slice(9)
      .trim() || null
  );
}
function providerPrefix(value: string): string | null {
  const trimmed = value.trim();
  const slash = trimmed.indexOf("/");
  return slash <= 0 ? null : trimmed.slice(0, slash).trim() || null;
}
function resolveProviderIdFromLabel(label?: string | null): string | null {
  const trimmed = label?.trim() ?? "";
  if (!trimmed) return null;
  const normalized = parseCustomModelId(trimmed);
  return normalized?.providerId ? normalized.providerId : providerPrefix(trimmed);
}
/** A1-R16 收敛：原 resolveTaskProviderId 改名导出——canonical 语义名取 declare 期既用名（AppRootLeaves c8t 1451 消费逐字不变）。
 * A1-R17：configOptions 收 ConfigOption[] 真型（bundle KSt 118285 传 configOptions 即选项数组；唯一调用面 1454 仅传 taskMeta，宽化安全） */
export function captchaProviderOfTaskMeta(entry: { configOptions?: ConfigOption[] | null; selectedSupplierKey?: string | null; taskMeta?: { model?: string } | null }): string | null {
  return (
    resolveProviderIdFromLabel(entry.configOptions ? getCurrentModelValue(entry.configOptions) : null) ||
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
/** 原 b0（118309 / 100548；A1-R14 行校正，旧注 118292）：供应商是否受 captcha 保护（zcode-plan 基址判定） */
export function isCaptchaProtectedProvider(provider: unknown): boolean {
  return (
    isZcodePlanBaseUrl(provider ? resolveProviderEndpoint(provider, "openai-compatible") : undefined) ||
    isZcodePlanBaseUrl(provider ? resolveProviderEndpoint(provider, "anthropic") : undefined)
  );
}

export const CAPTCHA_VERIFY_FAILED_MESSAGE = "Captcha verification failed. Please try again."; // ZSt
/** 原 XSt（js 118312）：captcha 验证失败错误码（A1-R14 canonical：ConversationOverlays 私有副本删碑改归本文件，与 ZSt 同 var 声明位） */
export const CAPTCHA_VERIFY_FAILED_CODE = `CAPTCHA_VERIFY_FAILED`;

/** 原 nCt/w0/T0/rCt/iCt/aCt：验证参数缓存 + 运行时头账本（A1-R14：workspacePath 放宽为可选——bundle T0 118331 `e.workspaceIdentity?.trim() || e.workspacePath` 容忍 undefined；mCt/NCt 消费面 118503/118856 传可选值） */
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
function runtimeHeadersKey(entry: { workspaceIdentity?: string | null; workspacePath?: string; sessionId?: string | null; providerId: string }): string {
  return [entry.workspaceIdentity?.trim() || entry.workspacePath, entry.sessionId?.trim() ?? "", entry.providerId.trim()].join("::");
}
function rememberRuntimeHeaders(entry: { workspaceIdentity?: string | null; workspacePath?: string; sessionId?: string | null; providerId: string; runtimeProviderHeaders: Record<string, string> }): void {
  if (!entry.providerId.trim()) return;
  runtimeHeadersBySession.set(runtimeHeadersKey(entry), entry.runtimeProviderHeaders);
}
function forgetRuntimeHeaders(entry: { workspaceIdentity?: string | null; workspacePath?: string; sessionId?: string | null; providerId: string; runtimeProviderHeaders: Record<string, string> }): void {
  const key = runtimeHeadersKey(entry);
  if (runtimeHeadersBySession.get(key) === entry.runtimeProviderHeaders) runtimeHeadersBySession.delete(key);
}
/** 原 aCt（— / 100585）：取出并清除运行时头 */
export function takeRuntimeProviderHeaders(entry: { workspaceIdentity?: string | null; workspacePath?: string; sessionId?: string | null; providerId: string }): Record<string, string> | undefined {
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
  options: { providerId?: string; source?: string; modelProviderService?: unknown } = {}, // A1-R14 型缝：modelProviderService 为 mCt 118494 调用面携带字段（uCt 体内不读）
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
/** 原 fCt（js 118446 / jsx ~100618）— 逐字（A1-R15 校正：前代为 declare 期接口级近似面（string 返回、
 * 缺 dCt/w0/LSt 三段），改回 bundle 逐字真身；全树零终端消费（grep 实证），改面不破坏既有接线；
 * gCt 转录面（ConversationOverlays respondProviderRuntimeHeadersOnce）消费 .headers 面。
 * pCt（118459，`.headers` 投影包装）消费面 192570 属发送域，留批。 */
export async function restoreCaptchaVerificationForSend(e: {
  providerConfig: unknown;
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null> };
  providerId: string;
  modelProviderService?: unknown;
}): Promise<{ captchaVerifyParam: string; headers: Record<string, string> } | undefined> {
  if (!isCaptchaProtectedProvider(e.providerConfig)) return;
  let t = await getCachedCaptchaConfig(e.codingPlanSubscriptionService);
  if (!t || isCaptchaConfigUnusable(t)) throw Error(CAPTCHA_VERIFY_FAILED_MESSAGE);
  let n = await runSendPreflightCaptcha(e.codingPlanSubscriptionService, {
    providerId: e.providerId,
    modelProviderService: e.modelProviderService,
  });
  if (!n?.trim()) throw Error(CAPTCHA_VERIFY_FAILED_MESSAGE);
  noteCaptchaCertifyIdForSend(e.providerId, n);
  let r = buildCaptchaHeaders({ providerId: e.providerId, captchaVerifyParam: n, captchaRegion: t.region });
  return (
    forgetCaptchaParam(e.providerId),
    { captchaVerifyParam: n, headers: r }
  );
}

/** 原 pCt（js 118459）— 逐字；fCt 的 .headers 投影包装（A1-R16 实体化；消费面 = ModelProviderSettingsSection
 *  handleTestModel 1987 = bundle 192570 ze 回调，declare 删碑改指本导出）。
 *  型缝：codingPlanSubscriptionService 带索引签名（消费面 1991 传 useServices 弱型面，循 R14 弱型缝先例） */
export async function resolveCodingPlanProviderHeaders(e: {
  providerId: string;
  providerConfig: unknown;
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null>; [method: string]: unknown };
  modelProviderService?: unknown;
}): Promise<Record<string, string> | undefined> {
  return (await restoreCaptchaVerificationForSend(e))?.headers;
}

/* --- 5b. 3007 自动恢复链（原 mCt/kCt/ACt/jCt/A0/j0/MCt/M0/NCt，js 118462–118867；A1-R14 实体化）
 * 映射表（minified → 语义名 → bundle 行）：
 *   mCt → retryCaptchaForRecovery        (118462)  私有（调用点仅 NCt 118818）
 *   kCt → createCaptchaGatekeeper        (118735)  导出（AppRootLeaves c8t 212506 消费）
 *   ACt → buildCaptchaAssertionKeys      (118738)  导出（NCt 118793 + c8t 212493；返回 ::连接串，旧 declare 面 string[] 为 declare 期近似）
 *   jCt → findCaptchaRecoveryEditTarget  (118747)  私有（调用点仅 NCt 118785）
 *   A0  → captchaAssertionStatus         (118765)  导出（NCt 118801 + c8t）
 *   j0  → recordCaptchaFailure           (118772)  导出（NCt 118862 + c8t）
 *   MCt → sharedCaptchaRecoveryGatekeeper(118775)  私有模块实例（NCt 专用）
 *   M0  → isCaptchaDecisionHandled       (118776)  导出（NCt 118838 + c8t）
 *   NCt → useSessionErrorRecovery        (118779)  导出（Conversation.tsx ConversationPane 5328 = bundle 120963 消费）
 * 行内消费：b0=isCaptchaProtectedProvider / E0=getCachedCaptchaConfig / D0=isCaptchaConfigUnusable /
 *   w0=forgetCaptchaParam / uCt=runSendPreflightCaptcha / dCt=noteCaptchaCertifyIdForSend /
 *   LSt=buildCaptchaHeaders / rCt=rememberRuntimeHeaders / iCt=forgetRuntimeHeaders（本文件 §5）；
 *   Cw=normalizeCaptchaCode（StoresDeep，R12 收敛 stub——stub 语义下 3007 判定恒不成立，自动恢复为死路，逐字保留）；
 *   Ec=useBaseServices（services/remoteServices 177）；XSt=CAPTCHA_VERIFY_FAILED_CODE（本文件 §5）。
 */
/** 原 mCt（js 118462）— 逐字；3007 恢复再验证（b0 门控 → 配置可用 → 验证 → 头入账） */
async function retryCaptchaForRecovery(e: {
  scope: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  taskId: string | null;
  providerId: string;
  providerConfig: unknown;
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null>; [method: string]: unknown }; // 型缝：索引签名承载 ResolvedBaseServices 面（弱型检查需共有成员，getCaptchaConfig 为 E0 118473 消费面）
  modelProviderService?: unknown;
}): Promise<{ captchaVerifyParam: string; headers: Record<string, string> } | undefined> {
  if (!isCaptchaProtectedProvider(e.providerConfig)) {
    logger.info(`[captcha] retry-captcha skipped: provider is not zcode-plan`, {
      providerId: e.providerId,
      scope: e.scope,
      taskId: e.taskId ?? null,
      workspacePath: e.workspacePath,
    });
    return;
  }
  let t = await getCachedCaptchaConfig(e.codingPlanSubscriptionService);
  if (!t || isCaptchaConfigUnusable(t)) {
    logger.info(`[captcha] retry-captcha skipped: captcha config unavailable`, {
      enabled: t?.enabled ?? null,
      hasPrefix: !!t?.prefix,
      hasRegion: !!t?.region,
      hasSceneId: !!t?.sceneId,
      providerId: e.providerId,
      scope: e.scope,
      taskId: e.taskId ?? null,
      workspacePath: e.workspacePath,
    });
    return;
  }
  (logger.info(`[captcha] retry-captcha verification start`, {
    providerId: e.providerId,
    scope: e.scope,
    taskId: e.taskId ?? null,
    workspacePath: e.workspacePath,
  }),
    forgetCaptchaParam(e.providerId));
  let n = await runSendPreflightCaptcha(e.codingPlanSubscriptionService, {
    providerId: e.providerId,
    modelProviderService: e.modelProviderService,
    source: `captcha_retry`,
  });
  if (!n?.trim()) {
    logger.warn(`[captcha] retry-captcha verification returned empty param`, {
      providerId: e.providerId,
      scope: e.scope,
      taskId: e.taskId ?? null,
      workspacePath: e.workspacePath,
    });
    return;
  }
  noteCaptchaCertifyIdForSend(e.providerId, n);
  let r = buildCaptchaHeaders({ providerId: e.providerId, captchaVerifyParam: n, captchaRegion: t.region });
  return (
    forgetCaptchaParam(e.providerId),
    rememberRuntimeHeaders({
      providerId: e.providerId,
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      sessionId: e.taskId,
      runtimeProviderHeaders: r,
    }),
    logger.info(`[captcha] retry-captcha request-scoped runtime header staged`, {
      paramLength: n.length,
      providerId: e.providerId,
      scope: e.scope,
      taskId: e.taskId ?? null,
      workspacePath: e.workspacePath,
    }),
    { captchaVerifyParam: n, headers: r }
  );
}

/** captcha 恢复去重门闩（原 kCt 返回面；bundle 118735） */
export interface CaptchaGatekeeper {
  handledKeys: Set<string>;
  inFlightKeys: Set<string>;
}
/** 原 kCt（js 118735）— 逐字 */
export function createCaptchaGatekeeper(): CaptchaGatekeeper {
  return { handledKeys: new Set(), inFlightKeys: new Set() };
}
/** 原 ACt（js 118738）— 逐字；五段 ::连接断言键（树名沿用 declare 期 buildCaptchaAssertionKeys） */
export function buildCaptchaAssertionKeys(e: {
  workspaceIdentity?: string | null;
  workspacePath?: string;
  sessionId: string | null;
  providerId: string;
  providerBusinessCode: string;
  rootSourceCommandId: string;
}): string {
  return [
    e.workspaceIdentity?.trim() || e.workspacePath,
    e.sessionId,
    e.providerId,
    e.providerBusinessCode,
    e.rootSourceCommandId,
  ].join(`::`);
}

/** 3007 恢复行窄面（bundle jCt 118747 读取面；与 Conversation.tsx ConversationRow 联合结构兼容：
 *  userInput 变体 text 必有，其余六种行归入第二成员；rootSourceCommandId 为 proto 真存字段，
 *  declare 期 UserInputRow 未列，经可选面结构承载） */
type CaptchaRecoveryRow =
  | { kind: `userInput`; rowId: number; origin?: string; actions?: { canEdit?: boolean }; entityId?: string | null; rootSourceCommandId?: string | null; text: string }
  | { kind: `assistantText` | `reasoning` | `turnHeader` | `timelineMarker` | `toolCall` | `subagent`; rowId: number; origin?: string; actions?: { canEdit?: boolean }; entityId?: string | null; rootSourceCommandId?: string | null; text?: string };

/** 原 jCt（js 118747）— 逐字；末条可编辑真实用户输入解析（权威 edit target） */
function findCaptchaRecoveryEditTarget(e: CaptchaRecoveryRow[]): {
  target: { rowId: number; entityId: string };
  newText: string;
  rootSourceCommandId: string;
} | null {
  for (let t = e.length - 1; t >= 0; --t) {
    let n = e[t];
    if (!(
      n?.kind !== `userInput` ||
      n.origin !== `realUser` ||
      n.actions?.canEdit !== !0 ||
      !n.entityId ||
      !n.rootSourceCommandId?.trim()
    ))
      return {
        target: { rowId: n.rowId, entityId: n.entityId },
        newText: n.text,
        rootSourceCommandId: n.rootSourceCommandId.trim(),
      };
  }
  return null;
}

/** 原 A0（js 118765）— 逐字；键状态机（首触 started → 在途 in-flight → 了结 handled） */
export function captchaAssertionStatus(e: CaptchaGatekeeper, t: string): `handled` | `in-flight` | `started` {
  return e.handledKeys.has(t)
    ? `handled`
    : e.inFlightKeys.has(t)
      ? `in-flight`
      : (e.inFlightKeys.add(t), `started`);
}
/** 原 j0（js 118772）— 逐字；在途了结（成功记 handled，失败释出允许重试） */
export function recordCaptchaFailure(e: CaptchaGatekeeper, t: string, n: boolean): void {
  (e.inFlightKeys.delete(t), n && e.handledKeys.add(t));
}
/** 原 MCt（js 118775）：NCt 专用共享门闩（模块级单例） */
const sharedCaptchaRecoveryGatekeeper = createCaptchaGatekeeper();
/** 原 M0（js 118776）— 逐字；edit 回执是否视为了结（accepted/duplicate） */
export function isCaptchaDecisionHandled(e: { status: string }): boolean {
  return e.status === `accepted` || e.status === `duplicate`;
}

/** 原 NCt（js 118779 / jsx 100999）— 逐字；会话错误自动恢复（3007 → 末条用户输入重编辑）。
 *  消费面：Conversation.tsx ConversationPane（本树 5328 = bundle 120963）。 */
export function useSessionErrorRecovery(e: {
  enabled: boolean;
  error: { code?: string; message?: string } | null;
  errorVisible: boolean;
  sessionId: string | null;
  providerId?: string | null;
  rows: CaptchaRecoveryRow[];
  workspacePath?: string;
  workspaceIdentity?: string | null;
  dispatchEdit: (target: { rowId: number; entityId: string }, newText: string) => Promise<{ status: string; reasonCode?: string }>;
  onRecoveryStart?: () => void;
  onRecoveryError: (error: { code: string; message: string }) => void;
}): void {
  let t = useBaseServices();
  React.useEffect(() => {
    let n = e.providerId?.trim() ?? ``,
      r = normalizeCaptchaCode(e.error?.code, e.error?.message);
    if (!e.enabled || !e.errorVisible || r !== `3007` || !e.sessionId || !n) return;
    let i = findCaptchaRecoveryEditTarget(e.rows);
    if (!i) {
      logger.warn(`[v4-captcha] 3007 自动恢复跳过：缺少权威 edit target`, {
        providerId: n,
        sessionId: e.sessionId,
      });
      return;
    }
    let a = buildCaptchaAssertionKeys({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      sessionId: e.sessionId,
      providerId: n,
      providerBusinessCode: `3007`,
      rootSourceCommandId: i.rootSourceCommandId,
    });
    captchaAssertionStatus(sharedCaptchaRecoveryGatekeeper, a) === `started` &&
      (async () => {
        let r = !1,
          o;
        e.onRecoveryStart?.();
        try {
          let a = (await t.modelProviderService.getAllCached()).find((e: { id: string }) => e.id === n);
          if (((a ||= (await t.modelProviderService.getAll()).find((e: { id: string }) => e.id === n)), !a))
            throw Error(`captcha_provider_not_found:${n}`);
          if (!isCaptchaProtectedProvider(a)) {
            (logger.info(`[v4-captcha] 3007 自动恢复跳过：当前 provider 不使用阿里云验证码`, {
              providerId: n,
              sessionId: e.sessionId,
            }),
              (r = !0));
            return;
          }
          let s = await retryCaptchaForRecovery({
            scope: `V4Conversation.autoRetry`,
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
            taskId: e.sessionId,
            providerId: n,
            providerConfig: a,
            codingPlanSubscriptionService: t.codingPlanSubscriptionService,
            modelProviderService: t.modelProviderService,
          });
          if (!s?.captchaVerifyParam.trim()) throw Error(`captcha_runtime_header_empty`);
          o = s.headers;
          let c = await e.dispatchEdit(i.target, i.newText);
          if (((r = isCaptchaDecisionHandled(c)), !r))
            throw Error(`captcha_edit_not_accepted:${c.status}:${c.reasonCode ?? ``}`);
        } catch (t) {
          (logger.warn(`[v4-captcha] 3007 自动恢复失败，保留当前 key 允许后续重试`, {
            error: t instanceof Error ? t.message : String(t),
            providerId: n,
            sessionId: e.sessionId,
          }),
            e.onRecoveryError({ code: CAPTCHA_VERIFY_FAILED_CODE, message: t instanceof Error ? t.message : String(t) }));
        } finally {
          (!r &&
            o &&
            forgetRuntimeHeaders({
              providerId: n,
              workspacePath: e.workspacePath,
              workspaceIdentity: e.workspaceIdentity,
              sessionId: e.sessionId,
              runtimeProviderHeaders: o,
            }),
            recordCaptchaFailure(sharedCaptchaRecoveryGatekeeper, a, r));
        }
      })();
  }, [
    t.codingPlanSubscriptionService,
    t.modelProviderService,
    e.dispatchEdit,
    e.enabled,
    e.error?.code,
    e.error?.message,
    e.errorVisible,
    e.onRecoveryError,
    e.onRecoveryStart,
    e.providerId,
    e.rows,
    e.sessionId,
    e.workspaceIdentity,
    e.workspacePath,
  ]);
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
 *   b0 118309/100548 | nCt/w0/T0/rCt/iCt/aCt 100560–100590
 *   E0/D0/oCt/sCt/cCt/lCt/uCt/dCt/fCt 100590–100680
 *   XSt/ZSt 118312–118313 | mCt 118462 | kCt 118735 | ACt 118738 | jCt 118747 | A0 118765
 *   j0 118772 | MCt 118775 | M0 118776 | NCt 118779（§5b 3007 自动恢复链，A1-R14）
 *  toast：eSt 117283/99619 | tSt 117346/99703 | Gxt 99539 | Kxt 99549 | qxt 99552
 *   Jxt 99555 | Yxt 99592 | Xxt 99599 | Zxt 99602 | Qxt 99605 | $xt 99608
 * ============================================================================
 */
