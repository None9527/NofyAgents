/* eslint-disable */
/**
 * ============================================================================
 * FeedbackCenter.tsx — ZCode 3.7.6 反馈中心 F09（RMe 族）逐字重建（B5-03）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行，未改动）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：COVERAGE-LEDGER §c #9（反馈中心 RMe）+ B5-FULL-DECODE-PLAN 批次 #3。
 *
 * 行号口径：本文件 js 行号 = 当前融合 chunk 行号。注意：当前 chunk 较旧账（213,695 行）
 * 在本区段之前插入了 48 行（去品牌提交 cb2ab75），故旧账行号一律 +48 对本文件成立
 * （旧 37067→37115、旧 39107→39155、旧 40396→40444、旧 41892→41940）。
 *
 * 范围（当前行号）：
 *   37093–39298  反馈中心全族（37093–37114 状态徽章 Bje/Vje 起；截图/表单原语/
 *                提交作业引擎/提交表单/功能请求/我的工单/后台指示卡/根 RMe）
 *                + F07 邻接助手 zMe/BMe
 *   39455        JMe 可见性守卫（F07 助手，WorkspaceShell.tsx 已 declare）
 *   39459–39460  uw logo dataURI / dw 附件分块字节（lw 已在 TopBar.tsx，见边界注记）
 *   39461–40444  附件上传协议 + v4 会话传输/快照存储/数据层（会话运行时域）
 * 排除（只注记）：
 *   37040–37092  yC FeedbackStore → stores-core.tsx §3
 *   37139–37172  xC/SC/CC/Wje/wC 联系持久化 → stores-core.tsx §3（TC 除外，见 §2）
 *   39299–39453  设置导航状态机 → Settings.tsx §2
 *   39458        lw PRODUCT_DOCS_URL → TopBar.tsx
 *   40445–41855  遥测下沉 29 函数 → StoresDeep.tsx §H
 *   41856–41940  遥测 fact 助手 uT/dT/fT/pT/fFe/pFe/mFe/mT → services.tsx（已抽取）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [状态呈现]
 *   Bje  → TICKET_STATUS_STYLES          (37093 / 33890)
 *   Vje  → TICKET_STATUS_I18N_KEYS       (37104 / 33928)
 *   Hje  → formatTicketStatus            (37115 / 33939)
 *   Uje  → TicketStatusBadge             (37118 / 33944)
 *   bC   → FeedbackErrorBanner           (37129 / 33956)
 *  [联系方式持久化]（xC/SC/CC/Wje/wC 已在 stores-core.tsx §3；本文件仅补 TC）
 *   TC   → persistFeedbackContact        (37172 / 33992)
 *  [截图]
 *   Gje  → ScreenshotPicker              (37175 / 33995)
 *   Kje  → ScreenshotGridItem            (37294 / 34033)
 *   qje  → readScreenshotFile            (37320 / 34043)
 *   EC   → screenshotDataUrl             (37342 / 34063)
 *  [表单原语]
 *   DC   → FeedbackSwitch                (37345 / 34066)
 *   OC   → UploadProgressRow             (37360 / 34073)
 *   Jje  → DescriptionField              (37394 / 34082)
 *   Yje  → ContactField                  (37411 / 34102)
 *   Xje  → LogsToggleRow                 (37430 / 34115)
 *   Zje  → SubmitActionBar               (37465 / 34127)
 *   kC   → FormSection                   (37530 / 34138)
 *   AC   → FormFieldBody                 (37548 / 34145)
 *   Qje  → CharCount                     (37559 / 34151)
 *   $je  → SCROLL_FADE_CLASSES           (37565 / 34157)
 *   jC   → FadeScrollArea                (37571 / 34163)
 *  [模型上下文 / 错误归一]
 *   eMe  → MODEL_OPTIONS_PREVIEW_LIMIT=12 (37630 / 34205)
 *   tMe  → collectModelContext           (37631 / 34206)
 *   MC   → extractErrorMessage           (37651 / 34228)
 *  [提交作业引擎]
 *   NC   → DEFAULT_SUBMISSION_COPY       (37656 / 34231)
 *   nMe  → submissionJobSeq              (37679 / —)
 *   PC   → submissionJobsById            (37680 / —)
 *   FC   → submissionRegistryListeners   (37681 / —)
 *   IC   → snapshotSubmissionJobs        (37682 / 34257)
 *   LC   → notifySubmissionRegistry      (37685 / 34263)
 *   rMe  → getSubmissionJobs             (37689 / 34267)
 *   iMe  → subscribeSubmissionJobs       (37692 / 34270)
 *   RC   → dismissSubmissionJob          (37703 / 34277)
 *   aMe  → getSubmissionJobById          (37706 / 34280)
 *   zC   → cancelJobBeforeTicket         (37709 / 34283)
 *   oMe  → createFeedbackSubmissionJob   (37723 / 34296)
 *   sMe  → freezeFormDraft               (37898 / 34469)
 *   cMe  → displaySubmissionError        (37902 / 34480)
 *   BC   → FeedbackSubmissionCanceledError (37911 / 34483)
 *   lMe  → uploadFullLogWithResume       (37916 / 34488)
 *   VC   → formatBytes                   (37992 / 34549)
 *   uMe  → mapUploadProgress             (37999 / 34552)
 *   dMe  → isUploadCanceledError         (38021 / 34572)
 *   HC   → useSubmissionCopy             (38024 / 34575)
 *  [提交表单]
 *   fMe  → TITLE_MAX_LENGTH=80           (38052 / 34600)
 *   pMe  → TICKET_AGENT_NAME='Nofy Agent' (38053 / 34601)  REBRAND-014+114
 *   mMe  → deriveTicketTitle             (38054 / 34602)
 *   hMe  → buildFeedbackDescription     (38064 / 34605)
 *   gMe  → DEVICE_AGENT_PROVIDER='Nofy Agent' (38089 / 34615)  REBRAND-015+115
 *   _Me  → DEFAULT_SEVERITY='P2-中'      (38090 / 34616)
 *   vMe  → DEFAULT_MODULE='其它'         (38091 / 34617)
 *   UC   → startFeedbackSubmission       (38092 / 34618)
 *   yMe  → DESCRIPTION_MAX_LENGTH=4000   (38162 / 34703)
 *   bMe  → CONTACT_MAX_LENGTH=200        (38163 / 34704)
 *   WC   → SCREENSHOT_MAX_COUNT=5        (38164 / 34705)
 *   xMe  → hasFeedbackAttachments         (38165 / 34706)
 *   SMe  → FeedbackSubmitForm            (38168 / 34712)
 *   CMe  → isTextEditingTarget           (38389 / 34867)
 *   wMe  → useFeedbackModelContext       (38394 / 34872)
 *  [功能请求]
 *   GC   → FEATURE_FIELD_MAX=2000        (38400 / 34878)
 *   TMe  → FEATURE_CONTACT_MAX=200       (38401 / 34879)
 *   EMe  → FeatureRequestDialog          (38402 / 34880)
 *   KC   → FeatureRequestField           (38637 / 34996)
 *   DMe  → buildFeatureRequestDescription (38677 / 35015)
 *  [我的工单]
 *   qC   → formatRelativeTime            (38690 / 35024)
 *   OMe  → FeedbackTicketsView           (38717 / 35047)
 *   kMe  → TicketsLoadingPlaceholder     (38827 / 35117)
 *   AMe  → TicketList                    (38837 / 35125)
 *   jMe  → TicketsEmptyState             (38924 / 35152)
 *  [后台提交指示]
 *   MMe  → SUCCESS_CARD_TTL_MS=5000      (38952 / 35167)
 *   NMe  → isJobSettledWithTicket        (38953 / 35168)
 *   PMe  → jobOpenTarget                 (38956 / 35171)
 *   FMe  → FeedbackBackgroundJobHost    (38961 / 35180)
 *   IMe  → BackgroundJobCard             (38980 / 35191)
 *   LMe  → BackgroundJobIndicator        (39014 / 35215)
 *  [根]
 *   RMe  → FeedbackCenter（memo 根）     (39155 / 35262)
 *  [F07 邻接助手（行段在 F09 包络内，归属 F07；WorkspaceShell.tsx 已 declare）]
 *   zMe  → resolveAdjacentTasks          (39254 / 35307)
 *   BMe  → collectWorkspaceTaskIds       (39268 / 35321)
 *   JMe  → runWithWorkspaceVisibility    (39455 / 35462)
 *  [常量（邻接）]
 *   uw   → APP_LOGO_DATA_URL             (39459 / 35470)  REBRAND-003+103
 *   dw   → ATTACHMENT_CHUNK_BYTES=384KB  (39460 / 35471)
 *  [附件上传协议]
 *   fw   → throwIfUploadAborted          (39461 / 35472)
 *   YMe  → base64ToBytes                 (39466 / 35477)
 *   XMe  → base64ByteLength              (39472 / 35483)
 *   ZMe  → bytesToBase64                 (39492 / 35495)
 *   QMe  → sha256Checksum                (39498 / 35501)
 *   $Me  → newUploadId                   (39503 / 35506)
 *   eNe  → measureAttachmentFrameBytes   (39508 / 35509)
 *   pw   → assertFrameWithinLimit        (39512 / 35513)
 *   tNe  → uploadAttachmentChunkedV4     (39515 / 35516)
 *  [v4 会话运行时（会话数据层域；ExtendedViews/services 曾接口级登记）]
 *   mw   → createConversationTransport   (39582 / 35586)
 *   nNe  → INITIAL_SNAPSHOT_STORE_STATE  (39781 / 35783)
 *   rNe  → TERMINAL_COMMAND_STATUSES     (39793 / 35795)
 *   iNe  → frameBumpsPlanDirectory       (39794 / 35796)
 *   aNe  → frameBumpsTurnNavigator       (39804 / 35804)
 *   hw   → hasOlderRows                  (39814 / 35812)
 *   oNe  → isFirstTurnHeaderMissing      (39819 / 35817)
 *   gw   → prependOlderRows              (39824 / 35822)
 *   sNe  → ConversationSnapshotStore     (39829 / 35827)
 *   cNe  → KEEP_WARM_MS_DEFAULT=30000    (40329 / 36320)
 *   lNe  → KEEP_WARM_MS_E2E=1000         (40330 / 36321)
 *   uNe  → resolveKeepWarmMs             (40331 / 36322)
 *   _w   → ConversationDataLayer         (40334 / 36325)
 *   vw   → dataLayerEntriesByKey         (40390 / 36376)
 *   dNe  → DATA_LAYER_KEEP_WARM_MS=30000 (40391 / 36377)
 *   fNe  → dataLayerKey                  (40392 / 36378)
 *   yw   → disposeDataLayerEntry         (40396 / 36382)
 *   pNe  → releaseDataLayerEntry         (40400 / 36385)
 *   mNe  → acquireConversationDataLayer  (40411 / 36396)
 * ============================================================================
 */

import * as React from "react";
import { Input, Textarea, toast } from './ImeComposition';
import { Tabs, TabsContent } from './Settings';
import { logger } from './SkillStore';
import { readFeedbackContact, useFeedbackStore, writeFeedbackContact } from './stores-core';

/* ============================================================================
 * §0 外部依赖（跨 chunk 导入 / 本 chunk 它族；声明位）
 * ==========================================================================*/

/** 原 Z（utils-CEEH0K_K.js 的 t 导出） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

type FormatMessageFn = (descriptor: { id: string }, values?: Record<string, string>) => string;
interface IntlShape {
  formatMessage: FormatMessageFn;
}
/** 原 G（IntlProvider-C321H7m8.js 的 n 导出） */
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 原 J（logger-PFDwl5Yq.js 的 t 导出） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-lg" | "icon-md" | "icon-sm" | "icon-xs";
}
/** 原 X（button-laUijeDG.js 的 t 导出） */
declare const Button: React.FC<ButtonProps>;
/** 原 P（imeComposition chunk 的 y 导出） */
/** 原 j（imeComposition chunk 的 v 导出） */
/** spinner：loader-circle（原 M，imeComposition chunk 的 w 导出） */
declare const IconLoaderCircle: React.FC<{ className?: string }>;
/** 关闭图标（原 g，imeComposition chunk 的 b 导出） */
declare const IconX: React.FC<{ className?: string }>;

interface IconProps {
  className?: string;
}
declare function createLucideIcon(name: string, paths: unknown[]): React.FC<IconProps>;
const IconInbox = createLucideIcon("inbox", []);            // 原 Vye（js 27298）
const IconRefreshCcw = createLucideIcon("refresh-ccw", []); // 原 Mv（js 27719）
const IconCirclePlus = createLucideIcon("circle-plus", []); // 原 L_（js 26902）
const IconCopy = createLucideIcon("copy", []);              // 原 W_（js 26974）
const IconImage = createLucideIcon("image", []);            // 原 cv（js 27293）
const IconUpload = createLucideIcon("upload", []);          // 原 Mbe（js 27985）
const IconChevronUp = createLucideIcon("chevron-up", []);   // 原 P_（js 26851）
const IconChevronDown = createLucideIcon("chevron-down", []); // 原 N_（js 26802）
const IconArrowLeft = createLucideIcon("arrow-left", []);   // 原 S_（js 26682）
const IconCirclePause = createLucideIcon("circle-pause", []); // 原 gye（js 26887）
const IconCircleCheck = createLucideIcon("circle-check", []); // 原 I_（js 26821）
const IconCircleAlert = createLucideIcon("circle-alert", []); // 原 F_（js 26812）
const IconFileText = createLucideIcon("file-text", []);     // 原 Z_（js 27108）
const IconCheck = createLucideIcon("check", []);            // 原 M_（js 26xxx）

/** Radix Dialog 封装族（原 zb/Hb/Ub/Gb，本 chunk 31943+） */
declare const Dialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }>;
declare const DialogContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { showCloseButton?: boolean }>;
declare const DialogHeader: React.FC<React.ComponentPropsWithoutRef<"div">>;
declare const DialogTitle: React.FC<React.ComponentPropsWithoutRef<"div">>;

/** Tabs 原语（原 hC/vC，本 chunk 36949/36986；Settings.tsx §Tabs 已逐字抽取） */

/** Radix Switch 原语（原 UDe/WDe，Radix 封装主块） */
declare const SwitchRoot: React.FC<
  Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> & {
    "data-slot"?: string;
    "data-size"?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>;
declare const SwitchThumb: React.FC<React.ComponentPropsWithoutRef<"span"> & { "data-slot"?: string }>;

/** FeedbackStore（原 yC，js 37040 / jsx 33835）——stores-core.tsx §3 已逐字重建 */
interface FeedbackSubmitPayload {
  title?: string;
  type: "bug" | "feature";
  module: string;
  severity: string;
  includeLogs: boolean;
  description?: string;
  screenshots?: Blob[];
}
interface FeedbackStoreState {
  open: boolean;
  featureRequestOpen: boolean;
  tab: "submit" | "tickets";
  submitDraft: FeedbackSubmitPayload | null;
  submissionJobId: string | null;
  selectedTicketId: string | null;
  openSubmit(draft?: FeedbackSubmitPayload | null): void;
  openSubmissionJob(jobId: string): void;
  openFeatureRequest(): void;
  openTickets(ticketId?: string | null): void;
  setTab(tab: "submit" | "tickets"): void;
  setSelectedTicketId(ticketId: string | null): void;
  close(): void;
}

/** 工作区标签页 store 选择器（原 pc，本 chunk 4753；Settings.tsx/stores-session.tsx 已登记） */
declare function useWorkspaceTabStore<T>(
  selector: (state: { activeWorkspacePath?: string | null; activeWorkspaceIdentity?: string | null }) => T,
): T;
/** 工作区服务条目 store 选择器（原 xe，skillStore chunk 的 h 导出） */
declare function useWorkspaceServicesStore<T>(
  selector: (state: Record<string, unknown>) => T,
): T;
/** 按 (state, workspacePath, workspaceIdentity) 解析工作区服务条目（原 fe，skillStore chunk 的 U 导出） */
declare function resolveWorkspaceServicesEntry(
  state: Record<string, unknown>,
  workspacePath: string,
  workspaceIdentity?: string,
): { configOptions?: ConfigOptionItem[] } | null;

/** `custom:…` 模型键解析（原 Zn，src-HCld2afU.js 的 P 导出） */
declare function parseCustomModelKey(key: string): { providerId: string; modelName?: string } | null;

/** E2E store bridge 模式判定（原 re，skillStore chunk 的 K 导出） */
declare function isE2eStoreBridgeMode(): boolean;

/** 工作区实体键（原 Io，本 chunk 1368） */
declare function workspaceEntityKey(workspacePath: string, workspaceIdentity?: string): string;

/* --- v4 会话协议底座（本 chunk 它族：33283–34760 区，F03/横切域） --- */

/** 快照增量应用（原 dke，本 chunk 33283） */
declare function applySnapshotDeltas(snapshot: SessionSnapshot, deltas: SessionDelta[]): SessionSnapshot;
/** 会话 topic → 层键 `conversation/<id>`（原 Bke，本 chunk 33777） */
declare function conversationLayerKey(sessionId: string): string;
/** 层键 → sessionId（原 dS，本 chunk 33780） */
declare function sessionIdFromTopic(topic: string): string | null;
/** RPC 就绪握手（hello+initialize，带缓存；原 AS，本 chunk 34647） */
declare function ensureConversationRuntimeReady(agentService: AgentServiceV4): Promise<unknown>;
/** 帧装配完成跟踪器（原 MS，本 chunk 34677） */
declare function createFrameCompletionTracker(callback: (frame: unknown) => void): {
  begin(topic: string): FrameTicket;
  bind(ticket: FrameTicket, subscriptionId: string): void;
  cancel(ticket: FrameTicket): void;
  activate(subscriptionId: string): { topic: string; previousSubscriptionId: string | null } | null;
  accept(frame: unknown): void;
  forget(subscriptionId: string): void;
  clear(): void;
};
interface FrameTicket {
  topic: string;
  subscriptionId: string | null;
  frames: unknown[];
  stagedBytes: number;
  overflowReason: string | null;
}
/** 帧路由器（装配器 → 帧/故障/重启事件分派；原 NS，本 chunk 34746） */
declare function createFrameRouter(
  assembler: FrameAssemblerLike,
  onFrame: (frame: ConversationFrame, meta: { deliveryKind: DeliveryKind }) => void,
  onAssemblyFault: (fault: AssemblyFault) => void,
): { accept(event: unknown): void; discard(topic: string, subscriptionId: string): void; recover(topic: string, subscriptionId: string): void; clear(): void };
interface FrameAssemblerLike {
  [method: string]: unknown;
}

/** 协议限额（原 bi，src-HCld2afU.js 的 oo 导出；services.tsx 已 declare protocolLimits） */
declare const protocolLimits: {
  maxFrameBytes: number;
  attachmentMaxBytes: number;
  attachmentChunkMaxBytes: number;
  attachmentUploadMaxChunks: number;
  rowsRangeMaxLimit: number;
  snapshotTailWindowRows: number;
  logicalFrameAssemblyTimeoutMs: number;
};
/** 消息类型枚举（原 vt，src-HCld2afU.js 的 Ct 导出） */
declare const AgentMessageKind: { ZCodeAgent: string; [key: string]: string };
/** agent 框架标识（原 ire，src-HCld2afU.js 的 vt 导出 = `nofy-agent`） */
declare const AGENT_FRAMEWORK_ID: string;

/** proto 追加式缓冲写（原 js，本 chunk 3756） */
declare class ProtoBufferWriter {
  buffer: { byteLength: number };
}
/** proto 值序列化（原 Rs，本 chunk 3812） */
declare function writeProtoValues(writer: ProtoBufferWriter, values: unknown[]): void;

/* --- 反馈服务接口（由调用面归纳；把握度：中高） --- */

export interface FeedbackScreenshot {
  id: string;
  filename: string;
  contentType: string;
  dataBase64: string;
  size: number;
}
export type FeedbackUploadScreenshot = Omit<FeedbackScreenshot, "id">;

export interface FeedbackTicket {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Disposable {
  dispose(): void;
}

export interface FeedbackTicketInput {
  title: string;
  description: string;
  type: string;
  severity: string;
  module: string;
  framework: string;
  device: Record<string, unknown>;
  source: string;
  contact?: string;
  locale: string;
}

export interface FeedbackService {
  create(input: FeedbackTicketInput, opts: { operationId: string }): Promise<{ id: string }>;
  uploadAttachmentData(
    ticketId: string,
    kind: "image",
    data: { dataBase64: string; filename: string; contentType: string },
  ): Promise<unknown>;
  comment(ticketId: string, message: string): Promise<unknown>;
  cancelUpload(progressId: string): Promise<void>;
  cancelCreate(operationId: string): Promise<void>;
  onDynamicUploadProgress(progressId: string): (
    listener: (event: UploadProgressEvent) => void,
  ) => Disposable;
  prepareCompactLogArchive(args: { full: boolean; progressId: string }): Promise<{ path: string; size: number }>;
  uploadAttachmentWithProgress(
    ticketId: string,
    kind: "log",
    data: { path: string; contentType: string },
    progressId: string,
  ): Promise<unknown>;
  cleanupPreparedLogArchive(path: string): Promise<unknown>;
  getDeviceSnapshot(): Promise<Record<string, unknown>>;
  list(args: { mine: boolean; limit: number }): Promise<{ items: FeedbackTicket[] }>;
}

export interface UploadProgressEvent {
  phase: "preparing" | "uploading" | "complete" | string;
  uploadedBytes: number;
  totalBytes: number;
}

/* ============================================================================
 * §1 工单状态呈现（原 Bje/Vje/Hje/Uje/bC，js 37093–37138 / jsx 33890–33960）
 * ==========================================================================*/

/** 原 Bje（37093 / 33890）：工单状态 → 呈现样式（文字色 + 圆点色） */
export const TICKET_STATUS_STYLES: Record<string, { className: string; dot: string }> = {
  已提交: { className: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  信息不足: { className: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  已采纳: { className: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  答复关闭: { className: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  已归档: { className: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  已拒绝: { className: "text-foreground-subtle", dot: "bg-foreground-subtlest" },
  开发中: { className: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  已解决: { className: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  已上线: { className: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
};

/** 原 Vje（37104 / 33928）：工单状态 → i18n 键 */
export const TICKET_STATUS_I18N_KEYS: Record<string, string> = {
  已提交: "feedback.status.pendingReview",
  信息不足: "feedback.status.needInfo",
  已采纳: "feedback.status.accepted",
  答复关闭: "feedback.status.closedByReply",
  已归档: "feedback.status.completed",
  已拒绝: "feedback.status.rejected",
  开发中: "feedback.status.inDevelopment",
  已解决: "feedback.status.resolved",
  已上线: "feedback.status.released",
};

/** 原 Hje（37115 / 33939） */
export function formatTicketStatus(status: string, formatMessage: FormatMessageFn): string {
  return formatMessage({ id: TICKET_STATUS_I18N_KEYS[status] });
}

/** 原 Uje（37118 / 33944）：工单状态徽章（可选圆点） */
export function TicketStatusBadge({
  status,
  withDot = true,
  children,
  className,
}: {
  status: string;
  withDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const style = TICKET_STATUS_STYLES[status];
  const { intl } = useIntlContext();
  return (
    <span className={cn("inline-flex items-center gap-1 text-ui-base font-medium", style.className, className)}>
      {withDot ? <span className={cn("size-1.5 rounded-full", style.dot)} /> : null}
      {children ?? formatTicketStatus(status, intl.formatMessage)}
    </span>
  );
}

/** 原 bC（37129 / 33956）：反馈错误横幅 */
export function FeedbackErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-ui-base text-red-300"
      role="alert"
    >
      <IconCircleAlert className="mt-0.5 size-3.5 shrink-0 text-red-400" />
      <span className="break-words leading-relaxed">{message}</span>
    </div>
  );
}

/* ============================================================================
 * §2 联系方式持久化（边界：xC/SC/CC/Wje/wC 已在 stores-core.tsx §3 重建）
 * ----------------------------------------------------------------------------
 * stores-core.tsx §3 语义名：FEEDBACK_CONTACT_KEY（xC）/ feedbackStorage（SC，
 * 私有）/ readFeedbackContact（CC）/ clearFeedbackContact（Wje）/
 * writeFeedbackContact（wC）。TC 未被 stores-core 覆盖，本文件补齐。
 * ==========================================================================*/

/** 原 SC（stores-core.tsx §3 私有助手，此处声明供 TC 缺省参使用） */
declare function feedbackStorage(): Storage | null;
/** 原 CC（stores-core.tsx §3：readFeedbackContact） */
/** 原 wC（stores-core.tsx §3：writeFeedbackContact） */

/** 原 TC（37172 / 33992）：写入并原样返回（供受控输入 onChange 链式使用） */
export function persistFeedbackContact(contact: string, storage: Storage | null = feedbackStorage()): string {
  return (writeFeedbackContact(contact, storage), contact);
}

/* ============================================================================
 * §3 截图选择器（原 Gje/Kje/qje/EC，js 37175–37344 / jsx 33995–34065）
 * ==========================================================================*/

/** 原 EC（37342 / 34063） */
export function screenshotDataUrl(item: FeedbackUploadScreenshot | FeedbackScreenshot): string {
  return `data:${item.contentType};base64,${item.dataBase64}`;
}

/** 原 qje（37320 / 34043）：File → 截图条目（dataURL 读入后取 base64 段） */
export function readScreenshotFile(file: File): Promise<FeedbackScreenshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    ((reader.onerror = () => reject(Error(`截图读取失败`))),
      (reader.onload = () => {
        const result = typeof reader.result == "string" ? reader.result : "";
        const commaIndex = result.indexOf(",");
        if (commaIndex < 0) {
          reject(Error(`截图数据格式不正确`));
          return;
        }
        resolve({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          filename: file.name || `screenshot-${Date.now()}.png`,
          contentType: file.type || "image/png",
          dataBase64: result.slice(commaIndex + 1),
          size: file.size,
        });
      }),
      reader.readAsDataURL(file));
  });
}

/** 原 Kje（37294 / 34033）：截图网格单项（预览按钮 + 悬浮删除） */
export function ScreenshotGridItem({
  item,
  removeLabel,
  onPreview,
  onRemove,
}: {
  item: FeedbackScreenshot;
  removeLabel: string;
  onPreview: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="group relative min-w-0 overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={onPreview}
        className="block aspect-square w-full text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/50"
        title={item.filename}
      >
        <img src={screenshotDataUrl(item)} alt={item.filename} className="size-full object-cover" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full border border-border bg-popover text-foreground-subtle opacity-90 shadow-sm transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        aria-label={removeLabel}
        title={removeLabel}
      >
        <IconX className="size-3" />
      </button>
    </li>
  );
}

/** 原 Gje（37175 / 33995）：截图选择器（拖放/文件选择/网格/预览对话框） */
export function ScreenshotPicker({
  screenshots,
  screenshotHint,
  addScreenshotLabel,
  removeScreenshotLabel,
  onChange,
  onAddFiles,
}: {
  screenshots: FeedbackScreenshot[];
  screenshotHint: string;
  addScreenshotLabel: string;
  removeScreenshotLabel: string;
  onChange: (items: FeedbackScreenshot[]) => void;
  onAddFiles: (files: File[]) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewItem, setPreviewItem] = React.useState<FeedbackScreenshot | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      (event.preventDefault(), setDragging(false));
      const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
      files.length !== 0 && onAddFiles(files);
    },
    [onAddFiles],
  );
  const handleRemove = React.useCallback(
    (id: string) => {
      onChange(screenshots.filter((item) => item.id !== id));
    },
    [onChange, screenshots],
  );
  return (
    <>
      <div
        tabIndex={0}
        onDragEnter={(event) => {
          (event.preventDefault(), setDragging(true));
        }}
        onDragOver={(event) => {
          (event.preventDefault(), setDragging(true));
        }}
        onDragLeave={(event) => {
          event.currentTarget.contains(event.relatedTarget as Node) || setDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-dashed border-border bg-surface p-3 outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-primary/30",
          dragging ? "border-border-hover bg-surface-hover" : "",
        )}
      >
        {screenshots.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {screenshots.map((item) => (
              <ScreenshotGridItem
                key={item.id}
                item={item}
                removeLabel={removeScreenshotLabel}
                onPreview={() => setPreviewItem(item)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-ui-base text-foreground-subtle">
            <IconImage className="size-3.5 shrink-0" />
            <span className="min-w-0">{screenshotHint}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 shrink-0 rounded-lg"
          >
            {addScreenshotLabel}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              ((event.currentTarget.value = ""), onAddFiles(files));
            }}
          />
        </div>
      </div>
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => {
          open || setPreviewItem(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate text-ui-base">{previewItem?.filename}</DialogTitle>
          </DialogHeader>
          {previewItem ? (
            <div className="max-h-[72vh] overflow-auto rounded-lg border border-border bg-background p-2">
              <img
                src={screenshotDataUrl(previewItem)}
                alt={previewItem.filename}
                className="mx-auto max-h-[68vh] max-w-full rounded-md object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ============================================================================
 * §4 表单原语（原 DC/OC/Jje/Yje/Xje/Zje/kC/AC/Qje/$je/jC，
 *    js 37345–37629 / jsx 34066–34204）
 * ==========================================================================*/

/** 原 DC（37345 / 34066）：反馈表单开关（Radix Switch 封装，default/sm 两档） */
export function FeedbackSwitch({
  className,
  size = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchRoot> & { size?: "default" | "sm" }) {
  return (
    <SwitchRoot
      data-slot="switch"
      data-size={size}
      className={cn(
        "p-px peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-input-border-focused/30 aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[18px] data-[size=default]:w-[32px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-primary/30 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchThumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-primary-foreground ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </SwitchRoot>
  );
}

/** 原 OC（37360 / 34073）：上传/提交进度行（确定/不定长两态） */
export function UploadProgressRow({
  progress,
  processingLabel,
}: {
  progress: FeedbackProgress;
  processingLabel: string;
}) {
  const percent = Math.max(0, Math.min(progress.progress ?? 0, 100));
  return (
    <div className="w-full rounded-lg border border-border bg-card px-3 py-2" aria-live="polite">
      <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ui-xs leading-4">
        <span className="font-medium text-foreground">{progress.label}</span>
        <span className="shrink-0 font-mono text-foreground-subtle">
          {progress.progress === void 0 ? processingLabel : `${percent}%`}
        </span>
        {progress.detail ? (
          <span className="min-w-[160px] flex-1 font-mono text-foreground-subtlest">{progress.detail}</span>
        ) : null}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        {progress.indeterminate ? (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}

/** 原 kC（37530 / 34138）：表单分区（标题 + 右侧槽位 + 内容） */
export function FormSection({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-ui-base font-semibold text-foreground">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

/** 原 AC（37548 / 34145）：表单字段体（可选右上槽位） */
export function FormFieldBody({ right, children }: { right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {right ? <div className="flex items-center justify-end gap-2">{right}</div> : null}
      {children}
    </div>
  );
}

/** 原 Qje（37559 / 34151）：字数计（超限变红） */
export function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <span className={cn("text-ui-xs tabular-nums", value > max ? "text-destructive" : "text-foreground-subtle")}>
      {value}/{max}
    </span>
  );
}

/** 原 Jje（37394 / 34082）：描述输入字段（自动聚焦 + 字数计） */
export function DescriptionField({
  value,
  max,
  onChange,
  formatMessage,
}: {
  value: string;
  max: number;
  onChange: (value: string) => void;
  formatMessage: (key: string) => string;
}) {
  return (
    <FormSection
      title={formatMessage("feedback.submit.simple.descriptionTitle")}
      right={<CharCount value={value.length} max={max} />}
    >
      <FormFieldBody>
        <Textarea
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          maxLength={max}
          placeholder={formatMessage("feedback.submit.simple.descriptionPlaceholder")}
          className="field-sizing-fixed h-[136px] max-h-[136px] min-w-0 max-w-full resize-none overflow-y-auto rounded-xl border-input-border bg-input text-ui-base leading-6 whitespace-pre-wrap break-words text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused"
        />
      </FormFieldBody>
    </FormSection>
  );
}

/** 原 Yje（37411 / 34102）：联系方式字段（写入即持久化） */
export function ContactField({
  value,
  max,
  onChange,
  formatMessage,
}: {
  value: string;
  max: number;
  onChange: (value: string) => void;
  formatMessage: (key: string) => string;
}) {
  return (
    <FormSection title={formatMessage("feedback.submit.simple.contactTitle")}>
      <FormFieldBody>
        <Input
          type="text"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={(event) => {
            onChange(persistFeedbackContact(event.target.value));
          }}
          maxLength={max}
          placeholder={formatMessage("feedback.submit.contact.placeholder")}
          className="h-10 rounded-xl border-input-border bg-input px-3 text-ui-base text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused"
        />
      </FormFieldBody>
    </FormSection>
  );
}

/** 原 Xje（37430 / 34115）：日志开关行（图标 + 标题/说明 + 开关） */
export function LogsToggleRow({
  checked,
  onCheckedChange,
  title,
  label,
  hint,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  label: string;
  hint: string;
}) {
  return (
    <FormSection title={title}>
      <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <IconFileText className="mt-0.5 size-3.5 shrink-0 text-foreground-subtlest" />
          <span className="min-w-0">
            <span className="block text-ui-base font-medium text-foreground">{label}</span>
            <span className="mt-0.5 block text-ui-xs leading-5 text-foreground-subtle">{hint}</span>
          </span>
        </div>
        <FeedbackSwitch
          size="sm"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-0.5 shrink-0 data-checked:bg-primary data-unchecked:bg-input"
        />
      </div>
    </FormSection>
  );
}

/** 原 Zje（37465 / 34127）：提交表单底部操作条（进度 + 工单入口 + 取消/提交） */
export function SubmitActionBar({
  submitting,
  submitProgress,
  submitDisabled,
  onCancel,
  onViewTickets,
  onSubmit,
  formatMessage,
}: {
  submitting: boolean;
  submitProgress: FeedbackProgress | null;
  submitDisabled: boolean;
  onCancel: () => void;
  onViewTickets: () => void;
  onSubmit: () => Promise<void>;
  formatMessage: (key: string) => string;
}) {
  return (
    <div className="shrink-0 px-6 pb-6 pt-2">
      {submitting && submitProgress ? (
        <UploadProgressRow progress={submitProgress} processingLabel={formatMessage("feedback.submit.processing")} />
      ) : null}
      <div className={cn("flex items-center justify-between gap-3", submitting && submitProgress ? "mt-2.5" : "")}>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onViewTickets}
          disabled={submitting}
          className="min-w-0 justify-start rounded-lg text-foreground-subtle hover:text-foreground"
        >
          <IconInbox className="size-4 shrink-0" />
          <span className="truncate">{formatMessage("feedback.center.ticketsTitle")}</span>
        </Button>
        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="ghost" size="lg" onClick={onCancel}>
            {formatMessage("common.cancel")}
          </Button>
          <Button size="lg" onClick={() => void onSubmit()} disabled={submitDisabled} className="rounded-lg">
            {submitting ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                {formatMessage("feedback.submit.submitting")}
              </>
            ) : (
              formatMessage("feedback.submit.submit")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 原 $je（37565 / 34157）：滚动渐隐遮罩四态类名 */
export const SCROLL_FADE_CLASSES: Record<"none" | "top" | "bottom" | "both", string> = {
  none: "",
  top:
    "[mask-image:linear-gradient(to_bottom,transparent_0,black_24px,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_24px,black_100%)]",
  bottom:
    "[mask-image:linear-gradient(to_bottom,black_0,black_calc(100%_-_24px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0,black_calc(100%_-_24px),transparent_100%)]",
  both:
    "[mask-image:linear-gradient(to_bottom,transparent_0,black_24px,black_calc(100%_-_24px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_24px,black_calc(100%_-_24px),transparent_100%)]",
};

/** 原 jC（37571 / 34163）：渐隐滚动容器（scroll/resize 联动判定四态） */
export function FadeScrollArea({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [fade, setFade] = React.useState<"none" | "top" | "bottom" | "both">("none");
  return (
    (React.useEffect(() => {
      const scroller = scrollRef.current;
      const inner = innerRef.current;
      if (!scroller || !inner) {
        setFade("none");
        return;
      }
      const update = () => {
        const scrollable = scroller.scrollHeight - scroller.clientHeight;
        if (scrollable <= 1) {
          setFade("none");
          return;
        }
        const atTop = scroller.scrollTop > 1;
        const atBottom = scroller.scrollTop < scrollable - 1;
        setFade(atTop && atBottom ? "both" : atTop ? "top" : atBottom ? "bottom" : "none");
      };
      let rafId: number | null = null;
      const schedule = () => {
        rafId === null &&
          (rafId = requestAnimationFrame(() => {
            ((rafId = null), update());
          }));
      };
      if ((update(), scroller.addEventListener("scroll", update, { passive: true }), typeof ResizeObserver > "u"))
        return (
          window.addEventListener("resize", schedule),
          () => {
            (scroller.removeEventListener("scroll", update),
              window.removeEventListener("resize", schedule),
              rafId !== null && cancelAnimationFrame(rafId));
          }
        );
      const observer = new ResizeObserver(schedule);
      return (
        observer.observe(scroller),
        observer.observe(inner),
        window.addEventListener("resize", schedule),
        () => {
          (scroller.removeEventListener("scroll", update),
            observer.disconnect(),
            window.removeEventListener("resize", schedule),
            rafId !== null && cancelAnimationFrame(rafId));
        }
      );
    }, [children]),
    (
      <div ref={scrollRef} className={cn("min-h-0 flex-1 overflow-y-auto", SCROLL_FADE_CLASSES[fade], className)} {...props}>
        <div ref={innerRef}>{children}</div>
      </div>
    )
  )
  );
}

/* ============================================================================
 * §5 模型上下文 / 错误归一（原 eMe/tMe/MC，js 37630–37655 / jsx 34205–34230）
 * ==========================================================================*/

export interface ConfigOptionItem {
  category?: string;
  type?: string;
  options?: Array<{ value: string; name: string }>;
  currentValue?: unknown;
  [key: string]: unknown;
}

export interface FeedbackModelContext {
  model?: string;
  display?: string;
  optionCount?: number;
  optionsPreview?: string[];
}

/** 原 eMe（37630 / 34205） */
export const MODEL_OPTIONS_PREVIEW_LIMIT = 12;

/** 原 tMe（37631 / 34206）：从工作区 configOptions 提取模型上下文（model select 项） */
export function collectModelContext(configOptions?: ConfigOptionItem[]): FeedbackModelContext {
  const selectItem = configOptions?.find((item) => item.category === "model" && item.type === "select");
  if (!selectItem) return {};
  const options = (selectItem.options ?? [])
    .map((option) => ({ value: option.value.trim(), name: option.name.trim() }))
    .filter((option) => option.value.length > 0 || option.name.length > 0);
  const currentValue =
    typeof selectItem.currentValue == "string"
      ? selectItem.currentValue.trim()
      : String(selectItem.currentValue ?? "").trim();
  const matched = currentValue ? options.find((option) => option.value === currentValue) : void 0;
  const parsed = currentValue ? parseCustomModelKey(currentValue) : null;
  const display = matched?.name || parsed?.modelName?.trim() || currentValue;
  return {
    ...(currentValue ? { model: currentValue } : {}),
    ...(display ? { display } : {}),
    optionCount: options.length,
    optionsPreview: options.slice(0, MODEL_OPTIONS_PREVIEW_LIMIT).map((option) => option.name || option.value),
  };
}

/** 原 MC（37651 / 34228）：错误消息提取（剥 `Error:` 前缀） */
export function extractErrorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : typeof error == "string" ? error : String(error))
    .replace(/^(Error:\s*)+/i, "")
    .trim();
}

/* ============================================================================
 * §6 提交作业引擎（原 NC…HC，js 37656–38051 / jsx 34231–34599）
 * ----------------------------------------------------------------------------
 * 后台反馈提交作业：创建工单 → 逐张上传截图 → （可选）完整日志上传（可暂停/
 * 续传），全程进度状态机 + 注册表订阅广播。
 * ==========================================================================*/

export type FeedbackJobStatus = "running" | "success" | "error" | "paused-log";

export interface FeedbackProgress {
  kind: "working" | "success" | "uploading-log" | "paused-log";
  label: string;
  detail?: string;
  indeterminate?: boolean;
  progress?: number;
  uploadedBytes?: number;
  totalBytes?: number;
}

export interface FeedbackSubmissionJobState {
  id: string;
  status: FeedbackJobStatus;
  ticketId?: string;
  error?: string;
  progress: FeedbackProgress;
}

export interface FeedbackFormDraft {
  title?: string;
  description: string;
  contact: string;
  screenshots?: FeedbackUploadScreenshot[];
  includeLogs: boolean;
  type: string;
  severity: string;
  module: string;
}

export interface FeedbackSubmissionCopy {
  connectingLabel: string;
  connectingDetail: string;
  cancelingCreateLabel: string;
  cancelingCreateDetail: string;
  canceledLabel: string;
  canceledDetail: string;
  uploadingScreenshotLabel: string;
  submittedLabel: string;
  submittedDetail: string;
  failedLabel: string;
  networkErrorDetail: string;
  postCreateNetworkErrorDetail: string;
  pausingLogLabel: string;
  pausingLogDetail: string;
  exportingLogLabel: string;
  exportingLogDetail: string;
  uploadingLogLabel: string;
  logUploadSuccessLabel: string;
  logUploadPausedLabel: string;
  logUploadPausedDetail: string;
  preparingUploadDetail: string;
}

/** 原 NC（37656 / 34231）：提交文案缺省表（中文硬编码兜底，i18n 版见 HC） */
export const DEFAULT_SUBMISSION_COPY: FeedbackSubmissionCopy = {
  connectingLabel: "正在连接反馈服务",
  connectingDetail: "创建成功后会继续上传截图和日志",
  cancelingCreateLabel: "正在取消提交",
  cancelingCreateDetail: "已收到取消请求，正在停止创建反馈。",
  canceledLabel: "反馈提交已取消",
  canceledDetail: "反馈提交已取消",
  uploadingScreenshotLabel: "正在上传截图",
  submittedLabel: "反馈已提交",
  submittedDetail: "我们会尽快处理。",
  failedLabel: "反馈提交失败",
  networkErrorDetail: "无法连接反馈服务，请检查网络、VPN 或代理设置后重试。",
  postCreateNetworkErrorDetail: "反馈已创建，但后续材料上传失败。请打开已创建的反馈补充材料，不要重复提交。",
  pausingLogLabel: "正在暂停日志上传",
  pausingLogDetail: "已收到取消请求，稍等一下。",
  exportingLogLabel: "正在导出完整日志",
  exportingLogDetail: "会根据本机日志大小耗时数秒",
  uploadingLogLabel: "正在上传完整日志",
  logUploadSuccessLabel: "日志上传成功",
  logUploadPausedLabel: "已暂停日志上传",
  logUploadPausedDetail: "日志是定位问题的必需材料，请继续上传。",
  preparingUploadDetail: "准备上传",
};

/** 原 BC（37911 / 34483） */
export class FeedbackSubmissionCanceledError extends Error {
  constructor(message: string) {
    (super(message), (this.name = "FeedbackSubmissionCanceledError"));
  }
}

export interface FeedbackSubmissionJob {
  id: string;
  formDraft: FeedbackFormDraft;
  done: Promise<{ ticketId: string }>;
  getState(): FeedbackSubmissionJobState;
  subscribe(listener: (state: FeedbackSubmissionJobState) => void): Disposable;
  cancelActiveUpload(): Promise<void>;
  cancelSubmission(): Promise<void>;
  continueLogUpload(): void;
}

export type SubmissionJobSnapshot = FeedbackSubmissionJobState & { job: FeedbackSubmissionJob };

/** 原 nMe/PC/FC（37679–37681）：作业序号 / 作业注册表 / 注册表监听器 */
let submissionJobSeq = 0;
const submissionJobsById = new Map<string, FeedbackSubmissionJob>();
const submissionRegistryListeners = new Set<(jobs: SubmissionJobSnapshot[]) => void>();

/** 原 IC（37682 / 34257） */
export function snapshotSubmissionJobs(): SubmissionJobSnapshot[] {
  return Array.from(submissionJobsById.values()).map((job) => ({ ...job.getState(), job }));
}

/** 原 LC（37685 / 34263） */
export function notifySubmissionRegistry(): void {
  const snapshot = snapshotSubmissionJobs();
  for (const listener of submissionRegistryListeners) listener(snapshot);
}

/** 原 rMe（37689 / 34267） */
export function getSubmissionJobs(): SubmissionJobSnapshot[] {
  return snapshotSubmissionJobs();
}

/** 原 iMe（37692 / 34270） */
export function subscribeSubmissionJobs(listener: (jobs: SubmissionJobSnapshot[]) => void): Disposable {
  return (
    submissionRegistryListeners.add(listener),
    listener(snapshotSubmissionJobs()),
    {
      dispose: () => {
        submissionRegistryListeners.delete(listener);
      },
    }
  );
}

/** 原 RC（37703 / 34277）：移除作业（paused-log 态不可移除） */
export function dismissSubmissionJob(jobId: string): void {
  submissionJobsById.get(jobId)?.getState().status !== "paused-log" &&
    submissionJobsById.delete(jobId) &&
    notifySubmissionRegistry();
}

/** 原 aMe（37706 / 34280） */
export function getSubmissionJobById(jobId: string): FeedbackSubmissionJob | null {
  return submissionJobsById.get(jobId) ?? null;
}

/** 原 zC（37709 / 34283）：仅在「创建工单前」阶段可整体取消 */
export async function cancelJobBeforeTicket(
  job: FeedbackSubmissionJob,
  opts: { onCancelError?: (message: string) => void } = {},
): Promise<boolean> {
  const state = job.getState();
  if (state.status !== "running" || state.ticketId) return false;
  try {
    return (await job.cancelSubmission(), dismissSubmissionJob(job.id), true);
  } catch (error) {
    const message = extractErrorMessage(error);
    return (
      logger.warn("[FeedbackSubmissionJob] 取消反馈创建命令失败", { jobId: job.id, error: message }),
      opts.onCancelError?.(message),
      false
    );
  }
}

/** 原 sMe（37898 / 34469）：草稿深冻结 */
export function freezeFormDraft(draft: FeedbackFormDraft): FeedbackFormDraft {
  const screenshots = draft.screenshots
    ? (Object.freeze(draft.screenshots.map((item) => Object.freeze({ ...item }))) as FeedbackUploadScreenshot[])
    : void 0;
  return Object.freeze({ ...draft, ...(screenshots ? { screenshots } : {}) });
}

/** 原 cMe（37902 / 34480）：网络类错误 → 面向用户文案（区分工单是否已创建） */
export function displaySubmissionError(
  message: string,
  copy: FeedbackSubmissionCopy,
  flags: { ticketCreated: boolean },
): string {
  return /^(?:fetch failed|failed to fetch|network request failed)$/i.test(message) ||
    /^request timed out after \d+ms$/i.test(message) ||
    /connect timeout error/i.test(message)
    ? flags.ticketCreated
      ? copy.postCreateNetworkErrorDetail
      : copy.networkErrorDetail
    : message;
}

/** 原 VC（37992 / 34549）：字节数 → 可读串 */
export function formatBytes(bytes: number): string {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 原 uMe（37999 / 34552）：动态上传进度事件 → 进度条状态 */
export function mapUploadProgress(
  event: UploadProgressEvent,
  copy: FeedbackSubmissionCopy = DEFAULT_SUBMISSION_COPY,
): FeedbackProgress {
  const totalBytes = Math.max(event.totalBytes, 0);
  const uploadedBytes = Math.min(Math.max(event.uploadedBytes, 0), totalBytes);
  const percent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
  return event.phase === "preparing"
    ? {
        kind: "working",
        label: copy.exportingLogLabel,
        detail: totalBytes > 0 ? `${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}` : copy.exportingLogDetail,
        progress: percent,
        uploadedBytes,
        totalBytes,
      }
    : {
        kind: event.phase === "complete" ? "success" : "uploading-log",
        label: event.phase === "complete" ? copy.logUploadSuccessLabel : copy.uploadingLogLabel,
        detail: totalBytes > 0 ? `${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}` : copy.preparingUploadDetail,
        progress: percent,
        uploadedBytes,
        totalBytes,
      };
}

/** 原 dMe（38021 / 34572） */
export function isUploadCanceledError(error: unknown): boolean {
  return error instanceof Error && error.name === "FeedbackUploadCanceledError";
}

/** 原 HC（38024 / 34575）：提交文案 i18n 化（21 键，随 formatMessage 记忆） */
export function useSubmissionCopy(formatMessage: (key: string) => string): FeedbackSubmissionCopy {
  return React.useMemo(
    () => ({
      connectingLabel: formatMessage("feedback.submission.connectingLabel"),
      connectingDetail: formatMessage("feedback.submission.connectingDetail"),
      cancelingCreateLabel: formatMessage("feedback.submission.cancelingCreateLabel"),
      cancelingCreateDetail: formatMessage("feedback.submission.cancelingCreateDetail"),
      canceledLabel: formatMessage("feedback.submission.canceledLabel"),
      canceledDetail: formatMessage("feedback.submission.canceledDetail"),
      uploadingScreenshotLabel: formatMessage("feedback.submission.uploadingScreenshotLabel"),
      submittedLabel: formatMessage("feedback.submission.submittedLabel"),
      submittedDetail: formatMessage("feedback.submission.submittedDetail"),
      failedLabel: formatMessage("feedback.submission.failedLabel"),
      networkErrorDetail: formatMessage("feedback.submission.networkErrorDetail"),
      postCreateNetworkErrorDetail: formatMessage("feedback.submission.postCreateNetworkErrorDetail"),
      pausingLogLabel: formatMessage("feedback.submission.pausingLogLabel"),
      pausingLogDetail: formatMessage("feedback.submission.pausingLogDetail"),
      exportingLogLabel: formatMessage("feedback.submission.exportingLogLabel"),
      exportingLogDetail: formatMessage("feedback.submission.exportingLogDetail"),
      uploadingLogLabel: formatMessage("feedback.submission.uploadingLogLabel"),
      logUploadSuccessLabel: formatMessage("feedback.submission.logUploadSuccessLabel"),
      logUploadPausedLabel: formatMessage("feedback.submission.logUploadPausedLabel"),
      logUploadPausedDetail: formatMessage("feedback.submission.logUploadPausedDetail"),
      preparingUploadDetail: formatMessage("feedback.submission.preparingUploadDetail"),
    }),
    [formatMessage],
  );
}

interface LogUploadControl {
  setState(patch: Partial<FeedbackSubmissionJobState>): void;
  setProgress(progress: FeedbackProgress): void;
  getActiveProgressId(): string | null;
  setActiveProgressId(progressId: string | null): void;
  waitForLogUploadAction(): Promise<string>;
}

/** 原 lMe（37916 / 34488）：完整日志上传（导出 → 上传；取消时暂停等待续传） */
async function uploadFullLogWithResume(
  feedbackService: FeedbackService,
  ticketId: string,
  copy: FeedbackSubmissionCopy,
  control: LogUploadControl,
): Promise<void> {
  let archive: { path: string; size: number } | null = null;
  const progressId = `feedback-log-${ticketId}-${Date.now()}`;
  const subscription = feedbackService.onDynamicUploadProgress(progressId)((event) => {
    control.setProgress(mapUploadProgress(event, copy));
  });
  try {
    (control.setActiveProgressId(progressId),
      control.setProgress({
        kind: "working",
        label: copy.exportingLogLabel,
        detail: copy.exportingLogDetail,
        indeterminate: true,
      }),
      (archive = await feedbackService.prepareCompactLogArchive({ full: true, progressId })));
    let shouldRetry = true;
    for (; shouldRetry; )
      try {
        (control.setActiveProgressId(progressId),
          control.setProgress({
            kind: "uploading-log",
            label: copy.uploadingLogLabel,
            detail: `0 / ${formatBytes(archive.size)}`,
            progress: 0,
            uploadedBytes: 0,
            totalBytes: archive.size,
          }),
          await feedbackService.uploadAttachmentWithProgress(
            ticketId,
            "log",
            { path: archive.path, contentType: "application/zip" },
            progressId,
          ),
          (shouldRetry = false),
          control.setProgress({
            kind: "success",
            label: copy.logUploadSuccessLabel,
            detail: copy.submittedDetail,
            progress: 100,
            uploadedBytes: archive.size,
            totalBytes: archive.size,
          }));
      } catch (error) {
        if (!isUploadCanceledError(error)) throw error;
        (control.setActiveProgressId(null),
          control.setState({
            status: "paused-log",
            progress: {
              kind: "paused-log",
              label: copy.logUploadPausedLabel,
              detail: copy.logUploadPausedDetail,
              progress: 0,
              uploadedBytes: 0,
              totalBytes: archive.size,
            },
          }),
          await control.waitForLogUploadAction(),
          control.setState({ status: "running" }),
          (shouldRetry = true));
      } finally {
        control.setActiveProgressId(null);
      }
  } catch (error) {
    const message = extractErrorMessage(error);
    throw (
      await feedbackService
        .comment(ticketId, `系统提示：完整日志自动上传失败，请必要时让用户手动导出日志。错误：${message}`)
        .catch(() => void 0),
      error
    );
  } finally {
    (archive && (await feedbackService.cleanupPreparedLogArchive(archive.path).catch(() => void 0)),
      control.setActiveProgressId(null),
      subscription.dispose());
  }
}

export interface FeedbackSubmissionJobInput {
  feedbackService: FeedbackService;
  ticketInput: FeedbackTicketInput;
  screenshots: FeedbackUploadScreenshot[];
  includeLogs: boolean;
  formDraft: FeedbackFormDraft;
  copy?: FeedbackSubmissionCopy;
  onTicketCreated?: (ticketId: string) => void;
  onCompleted?: (ticketId: string) => void;
  onError?: (message: string) => void;
}

/** 原 oMe（37723 / 34296）：创建后台反馈提交作业（创建 → 截图 → 日志 三段管线） */
export function createFeedbackSubmissionJob(input: FeedbackSubmissionJobInput): FeedbackSubmissionJob {
  const copy = input.copy ?? DEFAULT_SUBMISSION_COPY;
  const seq = submissionJobSeq++;
  const startedAt = Date.now();
  const jobId = `feedback-submit-${startedAt}-${seq}`;
  const createOperationId = `feedback-create-${startedAt}-${seq}`;
  const formDraft = freezeFormDraft(input.formDraft);
  const listeners = new Set<(state: FeedbackSubmissionJobState) => void>();
  let state: FeedbackSubmissionJobState = {
    id: jobId,
    status: "running",
    progress: {
      kind: "working",
      label: copy.connectingLabel,
      detail: copy.connectingDetail,
      indeterminate: true,
    },
  };
  let activeProgressId: string | null = null;
  let resolveLogUploadAction: ((action: string) => void) | null = null;
  let cancelRequested = false;
  let canceledReported = false;
  function setState(patch: Partial<FeedbackSubmissionJobState>): void {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
    notifySubmissionRegistry();
  }
  function setProgress(progress: FeedbackProgress): void {
    setState({ progress });
  }
  function reportCanceled(): void {
    canceledReported ||
      ((canceledReported = true),
      setState({
        status: "error",
        error: copy.canceledDetail,
        progress: {
          kind: "working",
          label: copy.canceledLabel,
          detail: copy.canceledDetail,
          indeterminate: false,
        },
      }),
      input.onError?.(copy.canceledDetail));
  }
  async function run(): Promise<{ ticketId: string }> {
    try {
      logger.info("[FeedbackSubmissionJob] 开始后台提交反馈", { jobId });
      const ticket = await input.feedbackService.create(input.ticketInput, { operationId: createOperationId });
      if (cancelRequested) throw new FeedbackSubmissionCanceledError(copy.canceledDetail);
      (setState({ status: "running", ticketId: ticket.id, error: void 0 }), input.onTicketCreated?.(ticket.id));
      const failures: string[] = [];
      for (const [index, screenshot] of input.screenshots.entries())
        try {
          (setProgress({
            kind: "working",
            label: copy.uploadingScreenshotLabel,
            detail: `${index + 1}/${input.screenshots.length} · ${formatBytes(screenshot.size)}`,
            indeterminate: true,
          }),
            await input.feedbackService.uploadAttachmentData(ticket.id, "image", {
              dataBase64: screenshot.dataBase64,
              filename: screenshot.filename,
              contentType: screenshot.contentType,
            }));
        } catch (error) {
          failures.push(`${screenshot.filename}: ${extractErrorMessage(error)}`);
        }
      return (
        failures.length > 0 &&
          (await input.feedbackService
            .comment(ticket.id, `系统提示：部分截图上传失败：${failures.join("；")}`)
            .catch(() => void 0)),
        input.includeLogs &&
          (await uploadFullLogWithResume(input.feedbackService, ticket.id, copy, {
            setState,
            setProgress,
            getActiveProgressId: () => activeProgressId,
            setActiveProgressId: (progressId) => {
              activeProgressId = progressId;
            },
            waitForLogUploadAction: () =>
              new Promise((resolve) => {
                resolveLogUploadAction = resolve;
              }),
          })),
        setState({
          status: "success",
          ticketId: ticket.id,
          progress: {
            kind: "success",
            label: copy.submittedLabel,
            detail: copy.submittedDetail,
            progress: 100,
          },
        }),
        input.onCompleted?.(ticket.id),
        logger.info("[FeedbackSubmissionJob] 后台反馈提交完成", { jobId, ticketId: ticket.id }),
        { ticketId: ticket.id }
      );
    } catch (error) {
      if (!state.ticketId && (cancelRequested || error instanceof FeedbackSubmissionCanceledError))
        throw (
          reportCanceled(),
          logger.info("[FeedbackSubmissionJob] 反馈提交已取消", { jobId }),
          new FeedbackSubmissionCanceledError(copy.canceledDetail)
        );
      const message = extractErrorMessage(error);
      const displayError = displaySubmissionError(message, copy, { ticketCreated: !!state.ticketId });
      throw (
        setState({
          status: "error",
          error: displayError,
          progress: { kind: "working", label: copy.failedLabel, detail: displayError, indeterminate: false },
        }),
        input.onError?.(displayError),
        logger.warn("[FeedbackSubmissionJob] 后台反馈提交失败", { jobId, error: message, displayError }),
        error
      );
    } finally {
      ((activeProgressId = null), (resolveLogUploadAction = null));
    }
  }
  const job: FeedbackSubmissionJob = {
    id: jobId,
    formDraft,
    done: run(),
    getState: () => state,
    subscribe: (listener) => (
      listeners.add(listener),
      listener(state),
      {
        dispose: () => {
          listeners.delete(listener);
        },
      }
    ),
    cancelActiveUpload: async () => {
      const progressId = activeProgressId;
      progressId &&
        (setProgress({
          kind: "working",
          label: copy.pausingLogLabel,
          detail: copy.pausingLogDetail,
          indeterminate: true,
        }),
        await input.feedbackService.cancelUpload(progressId));
    },
    cancelSubmission: async () => {
      if (!(state.status !== "running" && state.status !== "paused-log")) {
        if (((cancelRequested = true), !state.ticketId)) {
          const previousProgress = state.progress;
          setProgress({
            kind: "working",
            label: copy.cancelingCreateLabel,
            detail: copy.cancelingCreateDetail,
            indeterminate: true,
          });
          try {
            await input.feedbackService.cancelCreate(createOperationId);
          } catch (error) {
            throw (!canceledReported && !state.ticketId && setProgress(previousProgress), error);
          }
          reportCanceled();
          return;
        }
        await job.cancelActiveUpload();
      }
    },
    continueLogUpload: () => {
      (resolveLogUploadAction?.("continue"), (resolveLogUploadAction = null));
    },
  };
  return (submissionJobsById.set(job.id, job), notifySubmissionRegistry(), job);
}

/* ============================================================================
 * §7 提交表单（原 fMe…wMe，js 38052–38399 / jsx 34600–34877）
 * ==========================================================================*/

/** 原 fMe（38052 / 34600） */
export const TITLE_MAX_LENGTH = 80;
/** 原 pMe（38053 / 34601） */
const TICKET_AGENT_NAME = "Nofy Agent"; // REBRAND-014+114

/** 原 mMe（38054 / 34602）：首行非空文本 → 工单标题（截断 80，兜底「用户反馈」） */
export function deriveTicketTitle(description: string): string {
  return (
    (
      description
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0) ?? description.replace(/\s+/g, " ").trim()
    ).slice(0, TITLE_MAX_LENGTH) || "用户反馈"
  );
}

/** 原 hMe（38064 / 34605）：轻量表单 → 工单正文模板（客户端补齐上下文） */
export function buildFeedbackDescription({
  raw,
  modelContext,
  ticketType = "bug",
  ticketModule = "其它",
  ticketSeverity = "P2-中",
}: {
  raw: string;
  modelContext: FeedbackModelContext;
  ticketType?: string;
  ticketModule?: string;
  ticketSeverity?: string;
}): string {
  return [
    "原始反馈",
    "",
    `反馈类型: ${ticketType}`,
    `产品模块: ${ticketModule}`,
    `严重程度: ${ticketSeverity}`,
    "Agent 框架: nofy-agent",
    `当前 Agent: ${TICKET_AGENT_NAME}`,
    `当前模型型号: ${modelContext.display || modelContext.model || "未上报"}`,
    `模型列表数量: ${modelContext.optionCount ?? "未上报"}`,
    `模型列表预览: ${modelContext.optionsPreview?.join(", ") || "未上报"}`,
    "处理方式: 用户提交轻量表单，客户端自动补齐上下文，后端可异步生成 AI 分析",
    "",
    "用户原始描述",
    raw.trim(),
  ].join("\n");
}

/** 原 gMe（38089 / 34615） */
const DEVICE_AGENT_PROVIDER = "Nofy Agent"; // REBRAND-015+115
/** 原 _Me（38090 / 34616） */
const DEFAULT_SEVERITY = "P2-中";
/** 原 vMe（38091 / 34617） */
const DEFAULT_MODULE = "其它";

export interface StartFeedbackSubmissionArgs {
  feedbackService: FeedbackService;
  title?: string;
  description: string;
  contact: string;
  screenshots: FeedbackScreenshot[];
  includeLogs: boolean;
  ticketType: string;
  ticketSeverity: string;
  ticketModule: string;
  modelContext: FeedbackModelContext;
  locale: string;
  copy: FeedbackSubmissionCopy;
  onTicketCreated?: (ticketId: string) => void;
  onCompleted?: (ticketId: string) => void;
  onError?: (message: string) => void;
}

/** 原 UC（38092 / 34618）：组装工单输入并创建后台提交作业 */
export async function startFeedbackSubmission({
  feedbackService,
  title,
  description,
  contact,
  screenshots,
  includeLogs,
  ticketType,
  ticketSeverity,
  ticketModule,
  modelContext,
  locale,
  copy,
  onTicketCreated,
  onCompleted,
  onError,
}: StartFeedbackSubmissionArgs): Promise<FeedbackSubmissionJob> {
  const deviceSnapshot = await feedbackService.getDeviceSnapshot();
  const framework = AGENT_FRAMEWORK_ID;
  const trimmedDescription = description.trim();
  const trimmedContact = contact.trim();
  writeFeedbackContact(trimmedContact);
  const uploads = screenshots.map(({ id: _id, ...rest }) => ({ ...rest }));
  const draft: FeedbackFormDraft = {
    ...(title === void 0 ? {} : { title }),
    description,
    contact,
    screenshots: uploads,
    includeLogs,
    type: ticketType,
    severity: ticketSeverity,
    module: ticketModule,
  };
  return createFeedbackSubmissionJob({
    feedbackService,
    ticketInput: {
      title: deriveTicketTitle(title ?? trimmedDescription),
      description: buildFeedbackDescription({
        raw: trimmedDescription,
        modelContext,
        ticketType,
        ticketModule,
        ticketSeverity,
      }),
      type: ticketType,
      severity: ticketSeverity,
      module: ticketModule,
      framework,
      device: {
        ...deviceSnapshot,
        agentProvider: DEVICE_AGENT_PROVIDER,
        agentFramework: framework,
        ...(modelContext.model ? { agentModel: modelContext.model } : {}),
        ...(modelContext.display ? { agentModelDisplay: modelContext.display } : {}),
        ...(modelContext.optionCount === void 0 ? {} : { agentModelOptionCount: modelContext.optionCount }),
        ...(modelContext.optionsPreview?.length ? { agentModelOptionsPreview: modelContext.optionsPreview } : {}),
      },
      source: "desktop-app",
      contact: trimmedContact || void 0,
      locale,
    },
    screenshots: uploads,
    includeLogs,
    formDraft: draft,
    copy,
    onTicketCreated,
    onCompleted,
    onError,
  });
}

/** 原 yMe/bMe/WC（38162–38164 / 34703–34705） */
export const DESCRIPTION_MAX_LENGTH = 4000;
export const CONTACT_MAX_LENGTH = 200;
export const SCREENSHOT_MAX_COUNT = 5;

/** 原 xMe（38165 / 34706） */
export function hasFeedbackAttachments(args: { includeLogs: boolean; screenshotCount: number }): boolean {
  return args.includeLogs || args.screenshotCount > 0;
}

/** 原 CMe（38389 / 34867）：焦点是否落在可编辑文本控件（粘贴截图时跳过） */
export function isTextEditingTarget(document: Document): boolean {
  const active = document.activeElement;
  const view = document.defaultView;
  return !active || !view ? false : active instanceof view.HTMLInputElement || active instanceof view.HTMLTextAreaElement;
}

/** 原 wMe（38394 / 34872）：当前活动工作区的模型上下文 */
export function useFeedbackModelContext(): FeedbackModelContext {
  const workspacePath = useWorkspaceTabStore((state) => state.activeWorkspacePath);
  const workspaceIdentity = useWorkspaceTabStore((state) => state.activeWorkspaceIdentity ?? void 0);
  const entry = useWorkspaceServicesStore((state) =>
    workspacePath ? resolveWorkspaceServicesEntry(state, workspacePath, workspaceIdentity) : null,
  );
  return React.useMemo(() => collectModelContext(entry?.configOptions), [entry?.configOptions]);
}

/** 原 SMe（38168 / 34712）：反馈提交表单（描述/截图/联系方式/日志开关 + 后台作业接线） */
export function FeedbackSubmitForm({
  feedbackService,
  platform,
  initialDraft,
  submissionJobId,
  onSubmitted,
  onViewTickets,
  onCancel,
}: {
  feedbackService: FeedbackService;
  platform: unknown;
  initialDraft: FeedbackSubmitPayload | null;
  submissionJobId: string | null;
  onSubmitted: (ticketId: string) => void;
  onViewTickets: () => void;
  onCancel: () => void;
}) {
  const { intl, locale } = useIntlContext();
  const formatMessage = React.useCallback(
    (key: string, values?: Record<string, string>) => intl.formatMessage({ id: key }, values),
    [intl],
  );
  const appliedDraftRef = React.useRef<FeedbackSubmitPayload | null>(null);
  const mountedRef = React.useRef(true);
  const jobRef = React.useRef<FeedbackSubmissionJob | null>(null);
  const modelContext = useFeedbackModelContext();
  const [description, setDescription] = React.useState("");
  const [contact, setContact] = React.useState(() => readFeedbackContact());
  const [screenshots, setScreenshots] = React.useState<FeedbackScreenshot[]>([]);
  const [includeLogs, setIncludeLogs] = React.useState(true);
  const [ticketType, setTicketType] = React.useState("bug");
  const [severity, setSeverity] = React.useState(DEFAULT_SEVERITY);
  const [module, setModule] = React.useState(DEFAULT_MODULE);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitProgress, setSubmitProgress] = React.useState<FeedbackProgress | null>(null);
  const [job, setJob] = React.useState<FeedbackSubmissionJob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const copy = useSubmissionCopy(formatMessage);
  const applyDraft = React.useCallback((draft: FeedbackFormDraft) => {
    ((appliedDraftRef.current = draft as unknown as FeedbackSubmitPayload),
      setDescription(draft.description ?? draft.title ?? ""),
      draft.contact !== void 0 && setContact(draft.contact),
      setTicketType(draft.type ?? "bug"),
      setSeverity(draft.severity ?? "P2-中"),
      setModule(draft.module ?? "其它"),
      setIncludeLogs(draft.includeLogs ?? true),
      setScreenshots(
        (draft.screenshots ?? []).map((item, index) => ({
          id: `draft-${Date.now()}-${index}`,
          filename: item.filename,
          contentType: item.contentType,
          dataBase64: item.dataBase64,
          size: item.size,
        })),
      ),
      setError(null));
  }, []);
  ((React.useEffect(
    () => (
      (mountedRef.current = true),
      () => {
        mountedRef.current = false;
        const currentJob = jobRef.current;
        const state = currentJob?.getState();
        currentJob && state?.status === "running" && !state.ticketId && cancelJobBeforeTicket(currentJob);
      }
    ),
    [],
  )),
    (React.useEffect(() => {
      if (!job) return;
      const subscription = job.subscribe((state) => {
        (setSubmitProgress(state.progress),
          setSubmitting(state.status === "running" || state.status === "paused-log"),
          state.status === "error" && setError(state.error ?? formatMessage("feedback.submission.failedLabel")));
      });
      return () => subscription.dispose();
    }, [formatMessage, job])),
    (React.useEffect(() => {
      if (job || !submissionJobId) return;
      const restored = getSubmissionJobById(submissionJobId);
      restored &&
        (logger.debug("[FeedbackSubmitForm] 恢复后台反馈任务", {
          jobId: restored.id,
          hasFormDraft: !!restored.formDraft,
          screenshotCount: restored.formDraft.screenshots?.length ?? 0,
        }),
        applyDraft(restored.formDraft),
        (jobRef.current = restored),
        setJob(restored));
    }, [applyDraft, job, submissionJobId])),
    (React.useEffect(() => {
      !initialDraft || appliedDraftRef.current === initialDraft || applyDraft(initialDraft as unknown as FeedbackFormDraft);
    }, [applyDraft, initialDraft])));
  const addFiles = React.useCallback(
    async (files: File[]) => {
      const images = files.filter((file) => file.type.startsWith("image/"));
      if (images.length !== 0) {
        setError(null);
        try {
          const capacity = Math.max(SCREENSHOT_MAX_COUNT - screenshots.length, 0);
          const items = await Promise.all(images.slice(0, capacity).map((file) => readScreenshotFile(file)));
          (items.length > 0 && setScreenshots((previous) => [...previous, ...items].slice(0, SCREENSHOT_MAX_COUNT)),
            images.length > capacity &&
              setError(formatMessage("feedback.submit.screenshotLimit", { count: String(SCREENSHOT_MAX_COUNT) })));
        } catch (fileError) {
          setError(extractErrorMessage(fileError));
        }
      }
    },
    [formatMessage, screenshots.length],
  );
  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (isTextEditingTarget(event.currentTarget.ownerDocument)) return;
      const images = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
      images.length !== 0 && (event.preventDefault(), addFiles(images));
    },
    [addFiles],
  );
  const handleCancel = React.useCallback(() => {
    const currentJob = jobRef.current;
    const state = currentJob?.getState();
    if (submitting && currentJob && state?.status === "running" && !state.ticketId) {
      cancelJobBeforeTicket(currentJob, { onCancelError: setError });
      return;
    }
    onCancel();
  }, [onCancel, submitting]);
  const handleSubmit = React.useCallback(async () => {
    if (!description.trim()) {
      setError(formatMessage("feedback.submit.missingDescription"));
      return;
    }
    (setSubmitting(true),
      setSubmitProgress({
        kind: "working",
        label: formatMessage("feedback.submission.connectingLabel"),
        detail: formatMessage("feedback.submission.connectingDetail"),
        indeterminate: true,
      }),
      setError(null));
    try {
      const created = await startFeedbackSubmission({
        feedbackService,
        description,
        contact,
        screenshots,
        includeLogs,
        ticketType,
        ticketSeverity: severity,
        ticketModule: module,
        modelContext,
        locale,
        copy,
        onTicketCreated: hasFeedbackAttachments({ includeLogs, screenshotCount: screenshots.length })
          ? () => {
              mountedRef.current && onCancel();
            }
          : void 0,
        onCompleted: (ticketId) => {
          (toast(formatMessage("feedback.submission.submittedToast"), { durationMs: 3000 }),
            mountedRef.current &&
              window.setTimeout(() => {
                mountedRef.current && jobRef.current?.id === created.id && onSubmitted(ticketId);
              }, 1200));
        },
        onError: (message) => {
          mountedRef.current && setError(message);
        },
      });
      ((jobRef.current = created),
        mountedRef.current && setJob(created),
        created.done
          .catch(() => void 0)
          .finally(() => {
            mountedRef.current && jobRef.current?.id === created.id && setSubmitting(false);
          }));
    } catch (submitError) {
      (setError(extractErrorMessage(submitError)), setSubmitting(false));
    }
  }, [contact, description, feedbackService, formatMessage, includeLogs, locale, modelContext, onCancel, onSubmitted, screenshots, copy, module, severity, ticketType]);
  return (
    <div className="flex h-full min-h-0 flex-col bg-popover text-foreground" onPaste={handlePaste}>
      <FadeScrollArea className="px-6 pb-4 pt-3">
        <div className="mx-auto flex max-w-[720px] flex-col gap-3">
          <DescriptionField value={description} max={DESCRIPTION_MAX_LENGTH} onChange={setDescription} formatMessage={formatMessage} />
          <FormSection
            title={formatMessage("feedback.submit.simple.screenshotTitle")}
            right={
              <span className="text-ui-xs tabular-nums text-foreground-subtle">
                {screenshots.length}/{SCREENSHOT_MAX_COUNT}
              </span>
            }
          >
            <ScreenshotPicker
              screenshots={screenshots}
              screenshotHint={formatMessage("feedback.submit.simple.screenshotHint")}
              addScreenshotLabel={formatMessage("feedback.submit.addScreenshot")}
              removeScreenshotLabel={formatMessage("feedback.submit.removeScreenshot")}
              onChange={setScreenshots}
              onAddFiles={(files) => {
                addFiles(files);
              }}
            />
          </FormSection>
          <ContactField value={contact} max={CONTACT_MAX_LENGTH} onChange={setContact} formatMessage={formatMessage} />
          <LogsToggleRow
            checked={includeLogs}
            onCheckedChange={setIncludeLogs}
            title={formatMessage("feedback.submit.simple.logsTitle")}
            label={formatMessage("feedback.submit.simple.logsLabel")}
            hint={formatMessage("feedback.submit.simple.logsHint")}
          />
          {error ? <FeedbackErrorBanner message={error} /> : null}
        </div>
      </FadeScrollArea>
      <SubmitActionBar
        submitting={submitting}
        submitProgress={submitProgress}
        submitDisabled={submitting || !description.trim()}
        onViewTickets={onViewTickets}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        formatMessage={formatMessage}
      />
    </div>
  );
}

/* ============================================================================
 * §8 功能请求对话框（原 GC/TMe/EMe/KC/DMe，js 38400–38689 / jsx 34878–35023）
 * ==========================================================================*/

/** 原 GC（38400 / 34878） */
export const FEATURE_FIELD_MAX = 2000;
/** 原 TMe（38401 / 34879） */
export const FEATURE_CONTACT_MAX = 200;

/** 原 KC（38637 / 34996）：功能请求字段（必填星号 + 字数计 + 文本域） */
export function FeatureRequestField({
  autoFocus,
  required,
  title,
  value,
  max,
  placeholder,
  onChange,
}: {
  autoFocus?: boolean;
  required: boolean;
  title: string;
  value: string;
  max: number;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-ui-base font-semibold text-foreground">
          {required ? <span className="mr-1 text-destructive">*</span> : null}
          {title}
        </h3>
        <span className="text-ui-xs tabular-nums text-foreground-subtle">
          {value.length}/{max}
        </span>
      </div>
      <Textarea
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        maxLength={max}
        placeholder={placeholder}
        className="field-sizing-fixed h-[136px] max-h-[136px] min-w-0 max-w-full resize-none overflow-y-auto rounded-xl border-input-border bg-input text-ui-base leading-6 whitespace-pre-wrap break-words text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused"
      />
    </section>
  );
}

/** 原 DMe（38677 / 35015）：功能请求正文模板（描述/期望方案/来源三段） */
export function buildFeatureRequestDescription({
  description,
  solution,
  source,
  formatMessage,
}: {
  description: string;
  solution: string;
  source: string;
  formatMessage: (key: string) => string;
}): string {
  return [
    `## ${formatMessage("feedback.featureRequest.descriptionLabel")}`,
    description.trim(),
    "",
    `## ${formatMessage("feedback.featureRequest.solutionLabel")}`,
    solution.trim(),
    "",
    `## ${formatMessage("feedback.submit.template.section.featureSource")}`,
    source.trim(),
  ].join("\n");
}

/** 原 EMe（38402 / 34880）：功能请求对话框（独立于反馈中心主壳，memo） */
export const FeatureRequestDialog = React.memo(function FeatureRequestDialog({
  feedbackService,
}: {
  feedbackService: FeedbackService;
}) {
  const open = useFeedbackStore((state) => state.featureRequestOpen);
  const close = useFeedbackStore((state) => state.close);
  const openTickets = useFeedbackStore((state) => state.openTickets);
  const { intl, locale } = useIntlContext();
  const formatMessage = React.useCallback(
    (key: string, values?: Record<string, string>) => intl.formatMessage({ id: key }, values),
    [intl],
  );
  const [description, setDescription] = React.useState("");
  const [solution, setSolution] = React.useState("");
  const [contact, setContact] = React.useState(() => readFeedbackContact());
  const [submitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState<FeedbackProgress | null>(null);
  const [job, setJob] = React.useState<FeedbackSubmissionJob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(true);
  const jobRef = React.useRef<FeedbackSubmissionJob | null>(null);
  const copy = useSubmissionCopy(formatMessage);
  const submitDisabled = submitting || !description.trim() || !solution.trim();
  ((React.useEffect(
    () => (
      (mountedRef.current = true),
      () => {
        mountedRef.current = false;
        const currentJob = jobRef.current;
        const state = currentJob?.getState();
        currentJob && state?.status === "running" && !state.ticketId && cancelJobBeforeTicket(currentJob);
      }
    ),
    [],
  )),
    (React.useEffect(() => {
      if (!job) return;
      const subscription = job.subscribe((state) => {
        (setProgress(state.progress),
          setSubmitting(state.status === "running" || state.status === "paused-log"),
          state.status === "error" && setError(state.error ?? formatMessage("feedback.submission.failedLabel")));
      });
      return () => subscription.dispose();
    }, [formatMessage, job])));
  const cancelIfCreating = React.useCallback(() => {
    const currentJob = jobRef.current;
    const state = currentJob?.getState();
    return currentJob && state?.status === "running" && !state.ticketId
      ? (cancelJobBeforeTicket(currentJob, { onCancelError: setError }), true)
      : false;
  }, []);
  const handleClose = React.useCallback(() => {
    (submitting && cancelIfCreating()) || submitting || close();
  }, [cancelIfCreating, close, submitting]);
  const handleReset = React.useCallback(() => {
    submitting || (setDescription(""), setSolution(""), setError(null));
  }, [submitting]);
  const handleSubmit = React.useCallback(async () => {
    const trimmedDescription = description.trim();
    const trimmedSolution = solution.trim();
    if (!trimmedDescription || !trimmedSolution) {
      setError(formatMessage("feedback.featureRequest.missingRequired"));
      return;
    }
    (setSubmitting(true),
      setProgress({
        kind: "working",
        label: formatMessage("feedback.submission.connectingLabel"),
        detail: formatMessage("feedback.submission.connectingDetail"),
        indeterminate: true,
      }),
      setError(null));
    try {
      const created = await startFeedbackSubmission({
        feedbackService,
        title: trimmedDescription,
        description: buildFeatureRequestDescription({
          description: trimmedDescription,
          solution: trimmedSolution,
          source: formatMessage("feedback.featureRequest.source"),
          formatMessage,
        }),
        contact,
        screenshots: [],
        includeLogs: false,
        ticketType: "feature",
        ticketSeverity: "P3-低",
        ticketModule: "其它",
        modelContext: {},
        locale,
        copy,
        onCompleted: (ticketId) => {
          (toast(formatMessage("feedback.featureRequest.submittedToast"), { durationMs: 3000 }),
            mountedRef.current &&
              window.setTimeout(() => {
                mountedRef.current && jobRef.current?.id === created.id && openTickets(ticketId);
              }, 900));
        },
        onError: (message) => {
          mountedRef.current && setError(message);
        },
      });
      ((jobRef.current = created),
        setJob(created),
        created.done
          .catch(() => void 0)
          .finally(() => {
            (dismissSubmissionJob(created.id), mountedRef.current && jobRef.current?.id === created.id && setSubmitting(false));
          }));
    } catch (submitError) {
      (setError(extractErrorMessage(submitError)), setSubmitting(false));
    }
  }, [contact, copy, description, feedbackService, formatMessage, locale, openTickets, solution]);
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        nextOpen || handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="grid h-[min(38rem,calc(100vh-2rem))] w-[min(34rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl border border-popover-border bg-popover p-0 text-foreground shadow-md backdrop-blur-2xl max-sm:h-[calc(100vh-1rem)] max-sm:w-[calc(100vw-1rem)]"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 p-6 pb-0">
          <DialogTitle className="min-w-0 truncate text-ui-lg font-medium text-foreground">
            {formatMessage("feedback.featureRequest.title")}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="shrink-0 rounded-xl"
            aria-label={formatMessage("common.close")}
            onClick={handleClose}
          >
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <FadeScrollArea className="px-6 pb-4 pt-3">
          <div className="mx-auto flex max-w-[720px] flex-col gap-3">
            <FeatureRequestField
              autoFocus
              required
              title={formatMessage("feedback.featureRequest.descriptionLabel")}
              value={description}
              max={FEATURE_FIELD_MAX}
              placeholder={formatMessage("feedback.featureRequest.descriptionPlaceholder")}
              onChange={setDescription}
            />
            <FeatureRequestField
              required
              title={formatMessage("feedback.featureRequest.solutionLabel")}
              value={solution}
              max={FEATURE_FIELD_MAX}
              placeholder={formatMessage("feedback.featureRequest.solutionPlaceholder")}
              onChange={setSolution}
            />
            <section className="space-y-2">
              <h3 className="text-ui-base font-semibold text-foreground">
                {formatMessage("feedback.featureRequest.contactLabel")}
              </h3>
              <Input
                type="text"
                inputMode="email"
                autoComplete="email"
                value={contact}
                onChange={(event) => {
                  setContact(persistFeedbackContact(event.target.value));
                }}
                maxLength={FEATURE_CONTACT_MAX}
                placeholder={formatMessage("feedback.submit.contact.placeholder")}
                className="h-10 rounded-xl border-input-border bg-input px-3 text-ui-base text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused"
              />
            </section>
            {error ? <FeedbackErrorBanner message={error} /> : null}
          </div>
        </FadeScrollArea>
        <div className="shrink-0 px-6 pb-6 pt-2">
          {submitting && progress ? (
            <UploadProgressRow progress={progress} processingLabel={formatMessage("feedback.submit.processing")} />
          ) : null}
          <div
            className={
              submitting && progress
                ? "mt-2.5 flex items-center justify-between gap-3"
                : "flex items-center justify-between gap-3"
            }
          >
            <Button
              type="button"
              variant="link"
              size="lg"
              disabled={submitting}
              className="px-0 text-primary"
              onClick={handleReset}
            >
              {formatMessage("feedback.featureRequest.reset")}
            </Button>
            <div className="flex shrink-0 justify-end gap-2">
              <Button variant="outline" size="lg" onClick={handleClose}>
                {formatMessage("common.cancel")}
              </Button>
              <Button size="lg" onClick={() => void handleSubmit()} disabled={submitDisabled} className="rounded-lg">
                {submitting ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                    {formatMessage("feedback.submit.submitting")}
                  </>
                ) : (
                  formatMessage("feedback.featureRequest.submit")
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

/* ============================================================================
 * §9 我的工单（原 qC/OMe/kMe/AMe/jMe，js 38690–38951 / jsx 35024–35166）
 * ==========================================================================*/

/** 原 qC（38690 / 35024）：相对时间（刚刚/分钟/小时/天，7 天后落日期） */
export function formatRelativeTime(timestamp: string, formatMessage?: FormatMessageFn): string {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return "";
  const elapsed = Date.now() - time;
  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;
  return formatMessage
    ? elapsed < minute
      ? formatMessage({ id: "feedback.time.justNow" })
      : elapsed < hour
        ? formatMessage({ id: "feedback.time.minutesAgo" }, { count: String(Math.floor(elapsed / minute)) })
        : elapsed < day
          ? formatMessage({ id: "feedback.time.hoursAgo" }, { count: String(Math.floor(elapsed / hour)) })
          : elapsed < 7 * day
            ? formatMessage({ id: "feedback.time.daysAgo" }, { count: String(Math.floor(elapsed / day)) })
            : new Date(timestamp).toLocaleDateString()
    : elapsed < minute
      ? "刚刚"
      : elapsed < hour
        ? `${Math.floor(elapsed / minute)} 分钟前`
        : elapsed < day
          ? `${Math.floor(elapsed / hour)} 小时前`
          : elapsed < 7 * day
            ? `${Math.floor(elapsed / day)} 天前`
            : new Date(timestamp).toLocaleDateString();
}

/** 原 kMe（38827 / 35117）：工单列表加载占位 */
export function TicketsLoadingPlaceholder() {
  const { intl } = useIntlContext();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 py-8 text-center text-ui-base text-foreground-subtle">
      <IconLoaderCircle className="size-4 animate-spin text-primary" />
      <span>{intl.formatMessage({ id: "common.loading" })}</span>
    </div>
  );
}

/** 原 AMe（38837 / 35125）：工单表格（状态/描述/编号三列，窄屏折行） */
export function TicketList({
  items,
  selectedTicketId,
  copiedTicketId,
  onCopyTicketId,
}: {
  items: FeedbackTicket[];
  selectedTicketId: string | null;
  copiedTicketId: string | null;
  onCopyTicketId: (ticketId: string) => void;
}) {
  const { intl } = useIntlContext();
  const formatMessage = intl.formatMessage;
  return items.length === 0 ? null : (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden grid-cols-[7.5rem_minmax(0,1fr)_13rem] gap-3 border-b border-border px-3 py-2 text-ui-xs font-medium text-foreground-subtle md:grid">
        <span>{formatMessage({ id: "feedback.tickets.column.status" })}</span>
        <span>{formatMessage({ id: "feedback.tickets.column.description" })}</span>
        <span>{formatMessage({ id: "feedback.tickets.column.id" })}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const selected = selectedTicketId === item.id;
          const copied = copiedTicketId === item.id;
          const copyLabel = formatMessage({ id: copied ? "feedback.detail.issueCopied" : "feedback.detail.issueCopy" });
          return (
            <li
              key={item.id}
              className={cn(
                "grid gap-2 px-3 py-2.5 md:grid-cols-[7.5rem_minmax(0,1fr)_13rem] md:items-center md:gap-3",
                selected ? "bg-card-selected" : "bg-card",
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 md:block">
                <TicketStatusBadge status={item.status} />
                <span className="shrink-0 text-ui-xs text-foreground-subtle md:hidden">
                  {formatRelativeTime(item.created_at, formatMessage)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="line-clamp-2 text-ui-base leading-5 text-foreground md:truncate">{item.title}</div>
                <div className="mt-1 hidden text-ui-xs text-foreground-subtle md:block">
                  {formatRelativeTime(item.created_at, formatMessage)}
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-ui-xs text-foreground-subtle md:hidden">
                  {formatMessage({ id: "feedback.tickets.issuePrefix" })}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-ui-xs text-foreground">{item.id}</span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={copyLabel}
                  title={copyLabel}
                  onClick={() => onCopyTicketId(item.id)}
                  className="shrink-0 text-foreground-subtle hover:text-foreground"
                >
                  {copied ? <IconCheck className="size-3 text-success" /> : <IconCopy className="size-3" />}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 原 jMe（38924 / 35152）：工单空态（新建入口） */
export function TicketsEmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  const { intl } = useIntlContext();
  const formatMessage = intl.formatMessage;
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 pt-12 text-center">
      <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-card">
        <IconInbox className="size-4 text-foreground-subtle" />
      </div>
      <div className="text-ui-base font-medium text-foreground">
        {formatMessage({ id: "feedback.tickets.empty.title" })}
      </div>
      <p className="text-ui-base leading-5 text-foreground-subtle">
        {formatMessage({ id: "feedback.tickets.empty.description" })}
      </p>
      <Button size="sm" variant="outline" onClick={onCreateNew} className="mt-1 rounded-lg">
        <IconCirclePlus />
        {formatMessage({ id: "feedback.tickets.empty.action" })}
      </Button>
    </div>
  );
}

/** 原 OMe（38717 / 35047）：我的工单视图（拉取/复制编号/刷新/新建） */
export function FeedbackTicketsView({
  feedbackService,
  onCreateNew,
}: {
  feedbackService: FeedbackService;
  onCreateNew: () => void;
}) {
  const selectedTicketId = useFeedbackStore((state) => state.selectedTicketId);
  const { intl } = useIntlContext();
  const formatMessage = intl.formatMessage;
  const copyResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [items, setItems] = React.useState<FeedbackTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = React.useState<string | null>(null);
  const refresh = React.useCallback(async () => {
    (setLoading(true), setError(null));
    try {
      setItems((await feedbackService.list({ mine: true, limit: 50 })).items);
    } catch (listError) {
      setError(extractErrorMessage(listError));
    } finally {
      setLoading(false);
    }
  }, [feedbackService]);
  ((React.useEffect(() => {
    refresh();
  }, [refresh])),
    (React.useEffect(
      () => () => {
        copyResetTimerRef.current !== null && globalThis.clearTimeout(copyResetTimerRef.current);
      },
      [],
    )));
  const copyTicketId = React.useCallback(
    (ticketId: string) => {
      if (typeof navigator > "u" || !navigator.clipboard?.writeText) {
        logger.warn(formatMessage({ id: "feedback.detail.issueCopyFailed" }), {
          issueId: ticketId,
          reason: "clipboard-unavailable",
        });
        return;
      }
      navigator.clipboard.writeText(ticketId).then(
        () => {
          (setCopiedTicketId(ticketId),
            copyResetTimerRef.current !== null && globalThis.clearTimeout(copyResetTimerRef.current),
            (copyResetTimerRef.current = globalThis.setTimeout(() => {
              (setCopiedTicketId(null), (copyResetTimerRef.current = null));
            }, 1600)));
        },
        (error) => {
          logger.warn(formatMessage({ id: "feedback.detail.issueCopyFailed" }), {
            issueId: ticketId,
            error: error instanceof Error ? error.message : String(error),
          });
        },
      );
    },
    [formatMessage],
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-popover">
      {loading && items.length === 0 ? (
        <TicketsLoadingPlaceholder />
      ) : (
        <FadeScrollArea className="px-6 pb-4 pt-3">
          {error && items.length === 0 ? (
            <div className="pb-2">
              <FeedbackErrorBanner message={error} />
            </div>
          ) : null}
          {!loading && items.length === 0 && !error ? <TicketsEmptyState onCreateNew={onCreateNew} /> : null}
          <TicketList
            items={items}
            selectedTicketId={selectedTicketId}
            copiedTicketId={copiedTicketId}
            onCopyTicketId={copyTicketId}
          />
          {loading && items.length > 0 ? (
            <div className="flex items-center justify-center py-2 text-ui-xs text-foreground-subtle">
              <IconLoaderCircle className="mr-1.5 size-3 animate-spin" />
              {formatMessage({ id: "common.loading" })}
            </div>
          ) : null}
        </FadeScrollArea>
      )}
      <div className="flex shrink-0 items-center justify-between gap-2 px-6 pb-6 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={() => void refresh()}
          disabled={loading}
          aria-label={formatMessage({ id: "common.refresh" })}
          className="rounded-xl text-foreground-subtle hover:text-foreground"
        >
          {loading ? <IconLoaderCircle className="size-4 animate-spin" /> : <IconRefreshCcw className="size-4" />}
        </Button>
        <Button size="lg" onClick={onCreateNew} className="rounded-lg">
          <IconCirclePlus />
          {formatMessage({ id: "feedback.tickets.newFeedback" })}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * §10 后台提交指示（原 MMe/NMe/PMe/FMe/IMe/LMe，js 38952–39154 / jsx 35167–35261）
 * ==========================================================================*/

/** 原 MMe（38952 / 35167） */
export const SUCCESS_CARD_TTL_MS = 5000;

/** 原 NMe（38953 / 35168） */
export function isJobSettledWithTicket(status: FeedbackJobStatus, ticketId: string | undefined): boolean {
  return !!ticketId && (status === "success" || status === "error");
}

/** 原 PMe（38956 / 35171）：卡片点击目标（已有工单 → 工单；否则 → 作业） */
export function jobOpenTarget(
  state: FeedbackSubmissionJobState,
): { kind: "ticket"; ticketId: string } | { kind: "submission"; jobId: string } {
  return isJobSettledWithTicket(state.status, state.ticketId)
    ? { kind: "ticket", ticketId: state.ticketId as string }
    : { kind: "submission", jobId: state.id };
}

/** 原 LMe（39014 / 35215）：后台作业指示卡（可展开/收起、暂停态续传、进度条） */
export function BackgroundJobIndicator({
  status,
  progress,
  ticketId,
  error,
  onOpen,
  onContinueUpload,
  onDismiss,
  defaultExpanded = false,
}: {
  status: FeedbackJobStatus;
  progress: FeedbackProgress;
  ticketId?: string;
  error?: string;
  onOpen: () => void;
  onContinueUpload: () => void;
  onDismiss: () => void;
  defaultExpanded?: boolean;
}) {
  const { intl } = useIntlContext();
  const percent = Math.max(0, Math.min(progress.progress ?? 0, 100));
  const paused = status === "paused-log";
  const succeeded = status === "success";
  const failed = status === "error";
  const attention = paused || failed;
  const [expanded, setExpanded] = React.useState(() => attention || defaultExpanded);
  const StatusIcon = paused ? IconCirclePause : succeeded ? IconCircleCheck : failed ? IconCircleAlert : IconUpload;
  const toneClass = failed ? "text-destructive" : succeeded ? "text-success" : paused ? "text-warning" : "text-primary";
  return (
    <div
      className={cn(
        "pointer-events-auto overflow-hidden rounded-xl border border-popover-border bg-popover text-foreground shadow-lg transition-[width] duration-200",
        expanded ? "w-[min(380px,calc(100vw-1.5rem))]" : "w-[min(320px,calc(100vw-1.5rem))]",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5",
          expanded ? "px-3 py-2.5" : "px-3 py-2",
        )}
      >
        <StatusIcon className={cn("mt-0.5 shrink-0", expanded ? "size-4" : "size-3.5", toneClass)} />
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={intl.formatMessage({ id: "feedback.background.open" })}
        >
          <div className="min-w-0 truncate text-ui-base font-medium leading-5 text-foreground">
            {intl.formatMessage({ id: "feedback.background.title" })}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-ui-base leading-5 text-foreground-subtle">{progress.label}</span>
            {progress.progress === void 0 ? null : (
              <span className="shrink-0 font-mono text-ui-xs text-foreground-subtle">{percent}%</span>
            )}
          </div>
          {expanded ? (
            <div className="mt-0.5 flex min-w-0 items-center gap-2 text-ui-xs text-foreground-subtlest">
              <span className="min-w-0 truncate">
                {error || progress.detail || ticketId || intl.formatMessage({ id: "feedback.background.defaultDetail" })}
              </span>
              <span className="shrink-0 text-foreground-subtle">
                {intl.formatMessage({ id: "feedback.background.openDetail" })}
              </span>
            </div>
          ) : null}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              if (!expanded) {
                onOpen();
                return;
              }
              setExpanded(false);
            }}
            className="shrink-0 text-foreground-subtle hover:bg-hover hover:text-foreground"
            aria-label={intl.formatMessage({ id: expanded ? "feedback.background.collapse" : "feedback.background.open" })}
          >
            {expanded ? <IconChevronUp className="size-3" /> : <IconChevronDown className="size-3" />}
          </Button>
          {paused ? null : (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={onDismiss}
              className="shrink-0 text-foreground-subtle hover:bg-hover hover:text-foreground"
              aria-label={intl.formatMessage({ id: "feedback.background.dismiss" })}
            >
              <IconX className="size-3" />
            </Button>
          )}
        </div>
      </div>
      <div className={cn("bg-border", expanded ? "h-1" : "h-0.5")}>
        {progress.indeterminate ? (
          <div className="h-full w-1/3 animate-pulse rounded-r-full bg-primary" />
        ) : (
          <div
            className={cn(
              "h-full rounded-r-full transition-[width] duration-200",
              failed ? "bg-destructive" : succeeded ? "bg-success" : paused ? "bg-warning" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
      {expanded && paused ? (
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-3 py-2">
          <Button type="button" size="sm" onClick={onContinueUpload}>
            {intl.formatMessage({ id: "feedback.submit.continueUpload" })}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** 原 IMe（38980 / 35191）：单作业卡片（成功 5s 自动移除 + 打开分派） */
export function BackgroundJobCard({
  job,
  onOpenSubmissionJob,
  onOpenTicket,
}: {
  job: SubmissionJobSnapshot;
  onOpenSubmissionJob: (jobId: string) => void;
  onOpenTicket: (ticketId: string) => void;
}) {
  return (
    (React.useEffect(() => {
      if (job.status !== "success") return;
      const timer = window.setTimeout(() => {
        dismissSubmissionJob(job.id);
      }, SUCCESS_CARD_TTL_MS);
      return () => window.clearTimeout(timer);
    }, [job.id, job.status])),
    (
      <BackgroundJobIndicator
        status={job.status}
        progress={job.progress}
        ticketId={job.ticketId}
        error={job.error}
        onOpen={() => {
          const target = jobOpenTarget(job);
          if (
            (logger.debug("[FeedbackBackgroundUploadIndicator] 打开后台反馈卡片", {
              jobId: job.id,
              status: job.status,
              target: target.kind,
            }),
            target.kind === "ticket")
          ) {
            (onOpenTicket(target.ticketId), dismissSubmissionJob(job.id));
            return;
          }
          onOpenSubmissionJob(target.jobId);
        }}
        onContinueUpload={job.job.continueLogUpload}
        onDismiss={() => dismissSubmissionJob(job.id)}
      />
    )
  );
}

/** 原 FMe（38961 / 35180）：后台作业宿主（反馈对话框打开时隐藏） */
export function FeedbackBackgroundJobHost({ feedbackDialogOpen }: { feedbackDialogOpen: boolean }) {
  const [jobs, setJobs] = React.useState(() => getSubmissionJobs());
  const openSubmissionJob = useFeedbackStore((state) => state.openSubmissionJob);
  const openTickets = useFeedbackStore((state) => state.openTickets);
  return (
    (React.useEffect(() => {
      const subscription = subscribeSubmissionJobs(setJobs);
      return () => subscription.dispose();
    }, [])),
    jobs.length === 0 || feedbackDialogOpen ? null : (
      <div className="pointer-events-none fixed right-3 bottom-3 z-[9998] flex max-h-[calc(100vh-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 overflow-y-auto sm:right-4 sm:bottom-4">
        {jobs.map((job) => (
          <BackgroundJobCard key={job.id} job={job} onOpenSubmissionJob={openSubmissionJob} onOpenTicket={openTickets} />
        ))}
      </div>
    )
  );
}

/* ============================================================================
 * §11 反馈中心根（原 RMe，js 39155–39253 / jsx 35262–35306）
 * ----------------------------------------------------------------------------
 * 提交 / 我的工单 双标签主壳；功能请求对话框（EMe）与后台作业宿主（FMe）随挂。
 * 挂载点：g8t 应用根（jsx 150716）`<RMe feedbackService={t} platform={oe} />`。
 * ==========================================================================*/

/** 原 RMe（39155 / 35262） */
export const FeedbackCenter = React.memo(function FeedbackCenter({
  feedbackService,
  platform,
}: {
  feedbackService: FeedbackService | null;
  platform: unknown;
}) {
  const open = useFeedbackStore((state) => state.open);
  const featureRequestOpen = useFeedbackStore((state) => state.featureRequestOpen);
  const tab = useFeedbackStore((state) => state.tab);
  const submitDraft = useFeedbackStore((state) => state.submitDraft);
  const submissionJobId = useFeedbackStore((state) => state.submissionJobId);
  const setTab = useFeedbackStore((state) => state.setTab);
  const close = useFeedbackStore((state) => state.close);
  const openTickets = useFeedbackStore((state) => state.openTickets);
  const { intl } = useIntlContext();
  const titleKey = tab === "tickets" ? "feedback.center.ticketsTitle" : "feedback.center.submitTitle";
  return feedbackService ? (
    <>
      <FeedbackBackgroundJobHost feedbackDialogOpen={open || featureRequestOpen} />
      <FeatureRequestDialog feedbackService={feedbackService} />
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          nextOpen || close();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="grid h-[min(38rem,calc(100vh-2rem))] w-[min(34rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border border-popover-border bg-popover p-0 text-foreground shadow-md backdrop-blur-2xl max-sm:h-[calc(100vh-1rem)] max-sm:w-[calc(100vw-1rem)]"
        >
          <DialogHeader className="flex-row items-center justify-between gap-2 p-6 pb-0">
            <div className="flex min-w-0 items-center gap-2">
              {tab === "tickets" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-md"
                  className="shrink-0 rounded-lg text-foreground-subtle hover:text-foreground"
                  aria-label={intl.formatMessage({ id: "feedback.center.backToSubmit" })}
                  data-feedback-back-to-submit="true"
                  onClick={() => setTab("submit")}
                >
                  <IconArrowLeft className="size-4" />
                </Button>
              ) : null}
              <DialogTitle className="min-w-0 truncate text-ui-lg font-medium text-foreground">
                {intl.formatMessage({ id: titleKey })}
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="shrink-0 rounded-xl"
              aria-label={intl.formatMessage({ id: "common.close" })}
              onClick={close}
            >
              <IconX className="size-4" />
            </Button>
          </DialogHeader>
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "submit" | "tickets")}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <TabsContent value="submit" className="min-h-0 flex-1 overflow-hidden outline-none">
              <FeedbackSubmitForm
                key={submissionJobId ?? "new-feedback"}
                feedbackService={feedbackService}
                platform={platform}
                initialDraft={submitDraft}
                submissionJobId={submissionJobId}
                onSubmitted={(ticketId) => openTickets(ticketId)}
                onViewTickets={() => setTab("tickets")}
                onCancel={close}
              />
            </TabsContent>
            <TabsContent value="tickets" className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
              <FeedbackTicketsView feedbackService={feedbackService} onCreateNew={() => setTab("submit")} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
});

/* ============================================================================
 * §12 F07 邻接助手（原 zMe/BMe，js 39254–39298 / jsx 35307–35336）
 * ----------------------------------------------------------------------------
 * 边界注记：行段落在 F09 包络内，语义归属 F07 WorkspaceShell（上一任务/下一
 * 任务导航）；WorkspaceShell.tsx 865 已 declare（resolveAdjacentTasks/
 * collectWorkspaceTaskIds），本文件为其实现位。
 * ==========================================================================*/

/** 原 zMe（39254 / 35307）：相邻任务导航能力（去重 + 当前位前后项） */
export function resolveAdjacentTasks(input: { taskIds: string[]; activeTaskId: string | null }): {
  canSelectPreviousConversation: boolean;
  canSelectNextConversation: boolean;
  previousTaskId: string | null;
  nextTaskId: string | null;
} {
  const taskIds = [...new Set(input.taskIds.filter((taskId) => taskId.length > 0))];
  const activeIndex = input.activeTaskId ? taskIds.indexOf(input.activeTaskId) : -1;
  const nextAnchor = activeIndex === -1 ? taskIds.length : activeIndex;
  const previousAnchor = activeIndex === -1 ? -1 : activeIndex;
  const previousTaskId = taskIds[nextAnchor - 1] ?? null;
  const nextTaskId = taskIds[previousAnchor + 1] ?? null;
  return {
    canSelectPreviousConversation: previousTaskId !== null,
    canSelectNextConversation: nextTaskId !== null,
    previousTaskId,
    nextTaskId,
  };
}

interface SearchResultsSnapshot {
  resultsByQueryKey: Record<
    string,
    {
      descriptor: {
        kind: string;
        search: string;
        workspaceKeys: string[];
        visibleLimit: number | null;
      };
      stale: boolean;
      fetchedAt: number;
      taskKeys: string[];
    }
  >;
  taskMetaByEntityKey: Record<
    string,
    { taskId: string; workspacePath: string; workspaceIdentity?: string } | undefined
  >;
}

/** 原 BMe（39268 / 35321）：从搜索结果里取当前工作区任务序列（回退 fallbackTaskIds） */
export function collectWorkspaceTaskIds(input: {
  workspacePath: string;
  workspaceIdentity?: string;
  resultsByQueryKey: SearchResultsSnapshot["resultsByQueryKey"];
  taskMetaByEntityKey: SearchResultsSnapshot["taskMetaByEntityKey"];
  fallbackTaskIds: string[];
}): string[] {
  const workspaceKey = workspaceEntityKey(input.workspacePath, input.workspaceIdentity);
  const candidates = Object.values(input.resultsByQueryKey)
    .filter((result) => {
      const descriptor = result.descriptor;
      return (
        descriptor.kind === "workspace" &&
        descriptor.search === "" &&
        descriptor.workspaceKeys.length === 1 &&
        descriptor.workspaceKeys[0] === workspaceKey
      );
    })
    .sort((a, b) =>
      a.stale === b.stale
        ? a.descriptor.visibleLimit === b.descriptor.visibleLimit
          ? b.fetchedAt - a.fetchedAt
          : a.descriptor.visibleLimit === null
            ? -1
            : 1
        : Number(a.stale) - Number(b.stale),
    );
  for (const result of candidates) {
    const taskIds: string[] = [];
    for (const taskKey of result.taskKeys) {
      const meta = input.taskMetaByEntityKey[taskKey];
      meta && workspaceEntityKey(meta.workspacePath, meta.workspaceIdentity) === workspaceKey && taskIds.push(meta.taskId);
    }
    if (taskIds.length > 0) return taskIds;
  }
  return [...input.fallbackTaskIds];
}

/* ============================================================================
 * §13 边界注记：设置导航状态机（js 39299–39453 / jsx 35337–35461）
 * ----------------------------------------------------------------------------
 * JC/YC/XC/ZC/QC/$C/VMe/ew/tw/nw/HMe/rw/UMe/iw/aw/ow/WMe/GMe/KMe/sw/qMe/cw
 * （`zcode-settings-section-intent` 等五键 + 分区可见性/意图事件/持久化）已由
 * Settings.tsx §2「设置导航状态机」逐字抽取（旧 js 39251–39405），不重复转录。
 * ==========================================================================*/

/* ============================================================================
 * §14 可见性守卫与邻接常量（原 JMe/uw/dw，js 39455–39460 / jsx 35462–35471）
 * ----------------------------------------------------------------------------
 * 边界注记：lw PRODUCT_DOCS_URL（39458 / 35469）已由 TopBar.tsx 920 逐字抽取，
 * 不重复转录；uw 在 WorkspaceShell.tsx 930 仅 declare（APP_LOGO_DATA_URL），
 * 本文件为其实现位。
 * ==========================================================================*/

/** 原 JMe（39455 / 35462）：工作区不可见时先回调返回，再执行动作 */
export function runWithWorkspaceVisibility({
  isWorkspaceVisible,
  onReturnToWorkspace,
  run,
}: {
  isWorkspaceVisible: boolean;
  onReturnToWorkspace?: () => void;
  run: () => void;
}): void {
  (isWorkspaceVisible || onReturnToWorkspace?.(), run());
}

/** 原 uw（39459 / 35470）：18×18 应用 logo data-url（REBRAND-003+103） */
export const APP_LOGO_DATA_URL =
  `data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M2.91528%2017.32C1.40918%2017.32%200.183716%2016.0946%200.183716%2014.5885V2.91906C0.183716%201.41296%201.40918%200.1875%202.91528%200.1875H14.5847C16.0908%200.1875%2017.3163%201.41296%2017.3163%202.91906V14.5885C17.3163%2016.0946%2016.0908%2017.32%2014.5847%2017.32H2.91528Z'%20fill='url(%23paint0_linear_11758_79291)'%20style=''%20/%3e%3cpath%20d='M14.5847%200.367454C15.9918%200.367454%2017.1325%201.50817%2017.1325%202.91529V14.5847C17.1325%2015.9918%2015.9918%2017.1325%2014.5847%2017.1325H2.91529C1.50817%2017.1325%200.367454%2015.9918%200.367454%2014.5847V2.91529C0.367454%201.50817%201.50817%200.367454%202.91529%200.367454H14.5847ZM14.5847%200H2.91529C2.13652%200%201.40459%200.303149%200.853871%200.853871C0.303149%201.40459%200%202.13652%200%202.91529V14.5847C0%2015.3635%200.303149%2016.0954%200.853871%2016.6461C1.40459%2017.1969%202.13652%2017.5%202.91529%2017.5H14.5847C15.3635%2017.5%2016.0954%2017.1969%2016.6461%2016.6461C17.1969%2016.0954%2017.5%2015.3635%2017.5%2014.5847V2.91529C17.5%202.13652%2017.1969%201.40459%2016.6461%200.853871C16.0954%200.303149%2015.3635%200%2014.5847%200Z'%20fill='%23B7BCBF'%20style='fill:%23B7BCBF;fill:color(display-p3%200.7176%200.7373%200.7490);fill-opacity:1;'%20/%3e%3cpath%20d='M5%2014.5%20L5%208.2%20A4%204%200%200%201%2013%208.2%20L13%2014.5'%20stroke='white'%20stroke-width='2.8'%20fill='none'%20/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_11758_79291'%20x1='8.74999'%20y1='17.32'%20x2='8.74999'%20y2='0.187504'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20style='stop-color:black;stop-opacity:1;'%20/%3e%3cstop%20offset='1'%20stop-color='%23151718'%20style='stop-color:%23151718;stop-color:color(display-p3%200.0824%200.0902%200.0941);stop-opacity:1;'%20/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e`; // REBRAND-003+103

/** 原 dw（39460 / 35471）：附件分块上传字节上限（384KB） */
export const ATTACHMENT_CHUNK_BYTES = 384 * 1024;

/* ============================================================================
 * §15 附件上传协议（原 fw…tNe，js 39461–39581 / jsx 35472–35585）
 * ----------------------------------------------------------------------------
 * v4 附件分块上传：begin → chunk×N → commit（可中止）；base64/校验和助手。
 * ==========================================================================*/

/** 原 fw（39461 / 35472）：上传已中止 → 抛 AbortError */
export function throwIfUploadAborted(signal?: { aborted: boolean }): void {
  if (!signal?.aborted) return;
  const error = Error("Attachment upload canceled");
  throw ((error.name = "AbortError"), error);
}

/** 原 YMe（39466 / 35477）：base64 → 字节 */
export function base64ToBytes(dataBase64: string): Uint8Array {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** 原 XMe（39472 / 35483）：base64 串 → 解码字节数（严格校验） */
export function base64ByteLength(dataBase64: string): number {
  if (dataBase64.length === 0) return 0;
  if (dataBase64.length % 4 != 0) throw Error("proto.invalidBase64");
  const padding = dataBase64.endsWith("==") ? 2 : +!!dataBase64.endsWith("=");
  const bodyLength = dataBase64.length - padding;
  for (let index = 0; index < bodyLength; index += 1) {
    const code = dataBase64.charCodeAt(index);
    if (!(
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      (code >= 48 && code <= 57) ||
      code === 43 ||
      code === 47
    ))
      throw Error("proto.invalidBase64");
  }
  for (let index = bodyLength; index < dataBase64.length; index += 1)
    if (dataBase64.charCodeAt(index) !== 61) throw Error("proto.invalidBase64");
  return (dataBase64.length / 4) * 3 - padding;
}

/** 原 ZMe（39492 / 35495）：字节 → base64（32K 分段防栈溢出） */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 32768;
  for (let offset = 0; offset < bytes.length; offset += chunkSize)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  return btoa(binary);
}

/** 原 QMe（39498 / 35501）：SHA-256 校验和（`sha256:<hex>`） */
export async function sha256Checksum(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) throw Error("fault.attachment.checksumUnavailable");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", Uint8Array.from(bytes).buffer);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

/** 原 $Me（39503 / 35506）：上传事务 id */
export function newUploadId(): string {
  return typeof globalThis.crypto.randomUUID == "function"
    ? `upload-${globalThis.crypto.randomUUID()}`
    : `upload-${[...globalThis.crypto.getRandomValues(new Uint32Array(4))].map((part) => part.toString(16).padStart(8, "0")).join("")}`;
}

/** 原 eNe（39508 / 35509）：帧字节数预估（proto 编码探测） */
export function measureAttachmentFrameBytes(kind: string, payload: unknown): number {
  const writer = new ProtoBufferWriter();
  return (writeProtoValues(writer, [100, 2147483647, AgentMessageKind.ZCodeAgent, kind]), writeProtoValues(writer, [payload]), writer.buffer.byteLength);
}

/** 原 pw（39512 / 35513）：帧超限断言 */
export function assertFrameWithinLimit(kind: string, payload: unknown): void {
  if (measureAttachmentFrameBytes(kind, payload) > protocolLimits.maxFrameBytes) throw Error("proto.frameTooLarge");
}

export interface AttachmentPutInput {
  sessionId: string;
  fileName: string;
  mime: string;
  dataBase64: string;
}
export interface AttachmentPutOptions {
  signal?: { aborted: boolean };
  onProgress?: (progress: { phase: "uploading" | "committing"; uploadedBytes: number; totalBytes: number }) => void;
}

/** 原 tNe（39515 / 35516）：v4 分块上传（断点续传 nextChunkIndex；失败即 abort） */
export async function uploadAttachmentChunkedV4(
  agentService: AgentServiceV4,
  scope: { workspacePath: string; workspaceIdentity?: string },
  input: AttachmentPutInput,
  options: AttachmentPutOptions = {},
): Promise<{ ref: string }> {
  throwIfUploadAborted(options.signal);
  const totalBytes = base64ByteLength(input.dataBase64);
  if (totalBytes > protocolLimits.attachmentMaxBytes) throw Error("proto.payloadTooLarge");
  const bytes = base64ToBytes(input.dataBase64);
  if (bytes.byteLength !== totalBytes) throw Error("proto.invalidBase64");
  const uploadId = newUploadId();
  const transaction = { ...scope, sessionId: input.sessionId, uploadId };
  const totalChunks = Math.ceil(bytes.byteLength / ATTACHMENT_CHUNK_BYTES);
  const beginPayload = {
    ...transaction,
    fileName: input.fileName,
    mime: input.mime,
    totalBytes: bytes.byteLength,
    totalChunks,
    checksum: await sha256Checksum(bytes),
  };
  assertFrameWithinLimit("attachmentBeginV4", beginPayload);
  let began = false;
  try {
    throwIfUploadAborted(options.signal);
    const beginAck = await agentService.attachmentBeginV4(beginPayload);
    if (((began = true), beginAck.state === "committed"))
      return (
        options.onProgress?.({
          phase: "committing",
          uploadedBytes: bytes.byteLength,
          totalBytes: bytes.byteLength,
        }),
        { ref: beginAck.ref as string }
      );
    if (beginAck.nextChunkIndex > totalChunks) throw Error("fault.attachment.invalidServerProgress");
    options.onProgress?.({
      phase: "uploading",
      uploadedBytes: Math.min(beginAck.nextChunkIndex * ATTACHMENT_CHUNK_BYTES, bytes.byteLength),
      totalBytes: bytes.byteLength,
    });
    for (let chunkIndex = beginAck.nextChunkIndex; chunkIndex < totalChunks; chunkIndex += 1) {
      throwIfUploadAborted(options.signal);
      const offset = chunkIndex * ATTACHMENT_CHUNK_BYTES;
      const chunkPayload = {
        ...transaction,
        chunkIndex,
        dataBase64: bytesToBase64(bytes.subarray(offset, Math.min(offset + ATTACHMENT_CHUNK_BYTES, bytes.length))),
      };
      if ((assertFrameWithinLimit("attachmentChunkV4", chunkPayload), (await agentService.attachmentChunkV4(chunkPayload)).nextChunkIndex !== chunkIndex + 1))
        throw Error("fault.attachment.invalidServerProgress");
      options.onProgress?.({
        phase: "uploading",
        uploadedBytes: Math.min((chunkIndex + 1) * ATTACHMENT_CHUNK_BYTES, bytes.byteLength),
        totalBytes: bytes.byteLength,
      });
    }
    (throwIfUploadAborted(options.signal),
      options.onProgress?.({
        phase: "committing",
        uploadedBytes: bytes.byteLength,
        totalBytes: bytes.byteLength,
      }));
    const commitPayload = transaction;
    return (assertFrameWithinLimit("attachmentCommitV4", commitPayload), await agentService.attachmentCommitV4(commitPayload));
  } catch (error) {
    if (began)
      try {
        await agentService.attachmentAbortV4(transaction);
      } catch (abortError) {
        logger.warn("[v4-attachment] failed to abort upload transaction", abortError);
      }
    throw error;
  }
}

/* ============================================================================
 * §16 v4 会话运行时（原 mw…mNe，js 39582–40444 / jsx 35586–36443）
 * ----------------------------------------------------------------------------
 * 边界注记：语义归属会话数据层域（F03/横切）。ExtendedViews.tsx 761 与
 * services.tsx 1923 曾以接口级登记 _w/mw（SessionSnapshotClientImpl/
 * createSessionTransport、ConversationLayer/createConversationTransport），
 * 本文件为其逐字实现位。
 * ==========================================================================*/

export interface SessionRow {
  rowId: number;
  turnId?: string | null;
  kind: string;
  toolName?: string;
  status?: string;
  origin?: string;
  sourceCommandId?: string;
  [key: string]: unknown;
}

export type SessionDelta =
  | { op: "row.removed"; fromRowId: number; [key: string]: unknown }
  | { op: "row.appended" | "row.upserted"; row: SessionRow; [key: string]: unknown }
  | { op: string; [key: string]: unknown };

export interface SessionSnapshot {
  seq: number;
  logEpoch: string;
  rows: { window: SessionRow[]; firstRowId: number | null; totalCount: number };
  pendingCommands: Array<{ commandId: string }>;
  modelTransition?: { eventId: string | null; [key: string]: unknown } | null;
  [key: string]: unknown;
}

export interface SessionPlan {
  rowId: number;
  [key: string]: unknown;
}

export type DeliveryKind = "online" | "initial" | "recovery" | string;

export interface ConversationFrame {
  topic: string;
  subscriptionId: string;
  fromSeq: number;
  toSeq: number;
  payload:
    | { kind: "snapshot"; snapshot: SessionSnapshot }
    | { kind: "deltas"; deltas: SessionDelta[] };
}

export interface AssemblyFault {
  topic: string;
  subscriptionId: string;
  deliveryKind?: DeliveryKind;
}

export interface AgentServiceV4 {
  helloConversationV4(): Promise<unknown>;
  initializeConversationV4(args: {
    kind: string;
    protocolVersion: number;
    clientId: string;
    appVersion: string;
  }): Promise<unknown>;
  subscribeConversationV4(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    sessionId: string;
    base?: { logEpoch: string; seq: number };
    visibility?: unknown;
  }): Promise<{ ack: { subscriptionId: string; mode: string; logEpoch?: string } }>;
  unsubscribeConversationV4(args: { workspacePath: string; workspaceIdentity?: string; subscriptionId: string }): Promise<unknown>;
  resyncConversationV4(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    subscriptionId: string;
    base: { logEpoch: string; seq: number } | null;
    forceSnapshot?: boolean;
  }): Promise<{ ack: { subscriptionId: string; mode: string } }>;
  sendConversationCommandV4(args: { workspacePath: string; workspaceIdentity?: string; envelope: unknown }): Promise<unknown>;
  queryConversationCommandsV4(args: { workspacePath: string; workspaceIdentity?: string; commands: unknown }): Promise<unknown>;
  conversationRowsRangeV4(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    sessionId: string;
    beforeRowId?: number;
    limit: number;
  }): Promise<{ atLogEpoch: string; rows: SessionRow[]; hasMore: boolean }>;
  conversationPlansV4(args: { workspacePath: string; workspaceIdentity?: string; sessionId: string }): Promise<{
    atLogEpoch: string;
    plans: SessionPlan[];
  }>;
  conversationFileChangesV4(args: Record<string, unknown>): Promise<unknown>;
  conversationFileRewindPreviewV4(args: Record<string, unknown>): Promise<unknown>;
  attachmentBeginV4(args: Record<string, unknown>): Promise<{ state: string; ref?: string; nextChunkIndex: number }>;
  attachmentChunkV4(args: Record<string, unknown>): Promise<{ nextChunkIndex: number }>;
  attachmentCommitV4(args: Record<string, unknown>): Promise<{ ref: string }>;
  attachmentAbortV4(args: Record<string, unknown>): Promise<unknown>;
  attachmentReadV4(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    sessionId: string;
    ref: string;
    offset: number;
    limit: number;
  }): Promise<{ totalBytes: number; mediaType: string; dataBase64: string; nextOffset: number | null }>;
  onDynamicConversationFrame(scope: { workspacePath: string; workspaceIdentity?: string }): (
    listener: (frame: ConversationFrame, meta: { deliveryKind: DeliveryKind }) => void,
  ) => Disposable;
  onAgentRuntimeRestarted(listener: (event: { workspaceKey: string }) => void): Disposable;
}

export interface ConversationTransport {
  subscribe(args: {
    topic: string;
    base?: { logEpoch: string; seq: number };
    visibility?: unknown;
  }): Promise<{ ack: { subscriptionId: string; mode: string; logEpoch?: string } }>;
  activate(subscriptionId: string): void;
  resync(args: {
    subscriptionId: string;
    base: { logEpoch: string; seq: number } | null;
    forceSnapshot?: boolean;
  }): Promise<{ ack: { subscriptionId: string; mode: string } }>;
  unsubscribe(subscriptionId: string): Promise<unknown>;
  sendCommand(envelope: unknown): Promise<unknown>;
  queryCommands(args: { commands: unknown }): Promise<unknown>;
  rowsRange(args: { sessionId: string; beforeRowId?: number; limit: number }): Promise<{
    atLogEpoch: string;
    rows: SessionRow[];
    hasMore: boolean;
  }>;
  plans(args: { sessionId: string }): Promise<{ atLogEpoch: string; plans: SessionPlan[] }>;
  fileChanges(args: Record<string, unknown>): Promise<unknown>;
  fileRewindPreview(args: Record<string, unknown>): Promise<unknown>;
  attachmentPut(input: AttachmentPutInput, options?: AttachmentPutOptions): Promise<{ ref: string }>;
  attachmentRead(args: { sessionId: string; ref: string }): Promise<{ bytes: Uint8Array; mediaType: string }>;
  onFrame(listener: (frame: ConversationFrame, meta: { deliveryKind: DeliveryKind }) => void): () => void;
  onAssemblyFault(listener: (fault: AssemblyFault) => void): () => void;
  onRuntimeRestart(listener: () => void): () => void;
}

/** 原 mw（39582 / 35586）：v4 会话传输（订阅/重同步/命令/行区间/附件/帧路由） */
export function createConversationTransport(
  agentService: AgentServiceV4,
  target: { workspacePath: string; workspaceIdentity?: string },
): ConversationTransport {
  const scope = {
      workspacePath: target.workspacePath,
      ...(target.workspaceIdentity ? { workspaceIdentity: target.workspaceIdentity } : {}),
    },
    ensureReady = () => ensureConversationRuntimeReady(agentService),
    frameListeners = new Set<(frame: ConversationFrame, meta: { deliveryKind: DeliveryKind }) => void>(),
    assemblyFaultListeners = new Set<(fault: AssemblyFault) => void>(),
    runtimeRestartListeners = new Set<() => void>(),
    router = createFrameRouter(
      createFrameAssemblerStub(),
      (frame, meta) => {
        for (const listener of frameListeners) listener(frame, { deliveryKind: meta.deliveryKind });
      },
      (fault) => {
        for (const listener of assemblyFaultListeners) listener(fault);
      },
    ),
    completionTracker = createFrameCompletionTracker((frame) => {
      router.accept(frame);
    }),
    topicBySubscriptionId = new Map<string, string>();
  let frameSubscription: Disposable | null = null,
    restartSubscription: Disposable | null = null,
    runtimeGeneration = 0;
  const workspaceKey = target.workspaceIdentity?.trim() || target.workspacePath,
    decodeBase64 = (dataBase64: string) => {
      const binary = atob(dataBase64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return bytes;
    };
  return {
    async subscribe(request) {
      await ensureReady();
      const sessionId = sessionIdFromTopic(request.topic);
      if (!sessionId) return Promise.reject(Error(`Unsupported v4 topic: ${request.topic}`));
      const ticket = completionTracker.begin(request.topic);
      const generationAtStart = runtimeGeneration;
      try {
        const result = await agentService.subscribeConversationV4({
          ...scope,
          sessionId,
          ...(request.base ? { base: request.base } : {}),
          ...(request.visibility ? { visibility: request.visibility } : {}),
        });
        if (generationAtStart !== runtimeGeneration) throw (completionTracker.cancel(ticket), Error("fault.subscription.runtimeRestarted"));
        try {
          completionTracker.bind(ticket, result.ack.subscriptionId);
        } catch (bindError) {
          try {
            await agentService.unsubscribeConversationV4({ ...scope, subscriptionId: result.ack.subscriptionId });
          } catch (undoError) {
            logger.warn("[v4-conversation] failed to undo rejected subscription", undoError);
          }
          throw bindError;
        }
        return (topicBySubscriptionId.set(result.ack.subscriptionId, request.topic), result);
      } catch (error) {
        throw (completionTracker.cancel(ticket), error);
      }
    },
    activate(subscriptionId) {
      const activated = completionTracker.activate(subscriptionId);
      activated?.previousSubscriptionId &&
        (router.discard(activated.topic, activated.previousSubscriptionId), topicBySubscriptionId.delete(activated.previousSubscriptionId));
    },
    async resync(request) {
      await ensureReady();
      const topic = topicBySubscriptionId.get(request.subscriptionId);
      if (!topic) throw Error("fault.subscription.notOwned");
      return (
        router.recover(topic, request.subscriptionId),
        agentService.resyncConversationV4({
          ...scope,
          subscriptionId: request.subscriptionId,
          base: request.base,
          ...(request.forceSnapshot === void 0 ? {} : { forceSnapshot: request.forceSnapshot }),
        })
      );
    },
    async unsubscribe(subscriptionId) {
      completionTracker.forget(subscriptionId);
      const topic = topicBySubscriptionId.get(subscriptionId);
      return (
        topicBySubscriptionId.delete(subscriptionId),
        topic && router.discard(topic, subscriptionId),
        await ensureReady(),
        agentService.unsubscribeConversationV4({ ...scope, subscriptionId })
      );
    },
    async sendCommand(envelope) {
      return (await ensureReady(), agentService.sendConversationCommandV4({ ...scope, envelope }));
    },
    async queryCommands(request) {
      return (await ensureReady(), agentService.queryConversationCommandsV4({ ...scope, commands: request.commands }));
    },
    async rowsRange(request) {
      return (
        await ensureReady(),
        agentService.conversationRowsRangeV4({
          ...scope,
          sessionId: request.sessionId,
          ...(request.beforeRowId === void 0 ? {} : { beforeRowId: request.beforeRowId }),
          limit: request.limit,
        })
      );
    },
    async plans(request) {
      return (await ensureReady(), agentService.conversationPlansV4({ ...scope, sessionId: request.sessionId }));
    },
    async fileChanges(request) {
      return (
        await ensureReady(),
        agentService.conversationFileChangesV4({
          ...scope,
          sessionId: request.sessionId,
          target: request.target,
          baseRevision: request.baseRevision,
          baseLogEpoch: request.baseLogEpoch,
        })
      );
    },
    async fileRewindPreview(request) {
      return (
        await ensureReady(),
        agentService.conversationFileRewindPreviewV4({
          ...scope,
          sessionId: request.sessionId,
          target: request.target,
          baseRevision: request.baseRevision,
          baseLogEpoch: request.baseLogEpoch,
        })
      );
    },
    async attachmentPut(input, options) {
      return (await ensureReady(), uploadAttachmentChunkedV4(agentService, scope, input, options));
    },
    async attachmentRead(request) {
      await ensureReady();
      const chunks: Uint8Array[] = [];
      let offset = 0;
      let totalBytes: number | null = null;
      let mediaType: string | null = null;
      for (let attempt = 0; ; attempt += 1) {
        if (attempt > protocolLimits.attachmentUploadMaxChunks) throw Error("fault.attachment.previewTooManyChunks");
        const page = await agentService.attachmentReadV4({
          ...scope,
          sessionId: request.sessionId,
          ref: request.ref,
          offset,
          limit: protocolLimits.attachmentChunkMaxBytes,
        });
        if (((totalBytes ??= page.totalBytes), (mediaType ??= page.mediaType), page.totalBytes !== totalBytes || page.mediaType !== mediaType))
          throw Error("fault.attachment.previewChangedDuringRead");
        const chunkBytes = decodeBase64(page.dataBase64);
        const nextOffset = offset + chunkBytes.byteLength;
        if (nextOffset > totalBytes) throw Error("fault.attachment.previewSizeMismatch");
        if (page.nextOffset !== null && page.nextOffset !== nextOffset)
          throw Error("fault.attachment.previewOffsetMismatch");
        if ((chunks.push(chunkBytes), page.nextOffset === null)) {
          if (nextOffset !== totalBytes) throw Error("fault.attachment.previewTruncated");
          const bytes = new Uint8Array(totalBytes);
          let writeOffset = 0;
          for (const chunk of chunks) (bytes.set(chunk, writeOffset), (writeOffset += chunk.byteLength));
          return { bytes, mediaType: mediaType as string };
        }
        if (chunkBytes.byteLength === 0) throw Error("fault.attachment.previewEmptyChunk");
        offset = page.nextOffset;
      }
    },
    onFrame(listener) {
      return (
        frameListeners.add(listener),
        (frameSubscription ??= agentService.onDynamicConversationFrame(scope)((frame) => completionTracker.accept(frame))),
        () => {
          (frameListeners.delete(listener), frameListeners.size === 0 && (frameSubscription?.dispose(), (frameSubscription = null)));
        }
      );
    },
    onAssemblyFault(listener) {
      return (assemblyFaultListeners.add(listener), () => assemblyFaultListeners.delete(listener));
    },
    onRuntimeRestart(listener) {
      return (
        runtimeRestartListeners.add(listener),
        (restartSubscription ??= agentService.onAgentRuntimeRestarted((event) => {
          if (event.workspaceKey === workspaceKey) {
            ((runtimeGeneration += 1), completionTracker.clear(), router.clear(), topicBySubscriptionId.clear());
            for (const restartListener of runtimeRestartListeners) restartListener();
          }
        })),
        () => {
          (runtimeRestartListeners.delete(listener), runtimeRestartListeners.size === 0 && (restartSubscription?.dispose(), (restartSubscription = null)));
        }
      );
    },
  };
}

/** 帧装配器占位（原 bS 实体在 services.tsx §G.4 逐字抽取；此处仅满足路由装配） */
declare function createFrameAssemblerStub(): FrameAssemblerLike;

/** 原 nNe（39781 / 35783）：快照 store 初始状态 */
export const INITIAL_SNAPSHOT_STORE_STATE: SnapshotStoreState = {
  status: "connecting",
  snapshot: null,
  subscriptionId: null,
  lastError: null,
  optimisticCommands: [],
  loadingOlder: false,
  sessionPlans: [],
  planDirectoryRevision: 0,
  plansLoading: false,
  turnNavigatorDirectoryRevision: 0,
};

/** 原 rNe（39793 / 35795）：命令终态集合 */
const TERMINAL_COMMAND_STATUSES = new Set(["success", "error", "cancelled"]);

export interface SnapshotStoreState {
  status: "connecting" | "live" | "error" | "closed";
  snapshot: SessionSnapshot | null;
  subscriptionId: string | null;
  lastError: string | null;
  optimisticCommands: Array<{ commandId: string; [key: string]: unknown }>;
  loadingOlder: boolean;
  sessionPlans: SessionPlan[];
  planDirectoryRevision: number;
  plansLoading: boolean;
  turnNavigatorDirectoryRevision: number;
}

/** 原 iNe（39794 / 35796）：帧是否触动计划目录（快照 / ExitPlanMode 终态行） */
export function frameBumpsPlanDirectory(frame: ConversationFrame): boolean {
  return frame.payload.kind === "snapshot"
    ? true
    : frame.payload.deltas.some((delta) => {
        if (delta.op === "row.removed") return true;
        if (delta.op !== "row.appended" && delta.op !== "row.upserted") return false;
        const row = (delta as { row: SessionRow }).row;
        return row.kind === "toolCall" && row.toolName === "ExitPlanMode" && TERMINAL_COMMAND_STATUSES.has(row.status as string);
      });
}

/** 原 aNe（39804 / 35804）：帧是否触动轮导航目录（真实用户输入行） */
export function frameBumpsTurnNavigator(frame: ConversationFrame): boolean {
  return frame.payload.kind === "snapshot"
    ? true
    : frame.payload.deltas.some((delta) => {
        if (delta.op === "row.removed") return true;
        if (delta.op !== "row.appended" && delta.op !== "row.upserted") return false;
        const row = (delta as { row: SessionRow }).row;
        return row.kind === "userInput" && row.origin === "realUser";
      });
}

/** 原 hw（39814 / 35812）：窗口之前是否还有更旧行 */
export function hasOlderRows(snapshot: SessionSnapshot | null): boolean {
  if (!snapshot) return false;
  const firstVisible = snapshot.rows.window[0];
  return !firstVisible || snapshot.rows.firstRowId === null ? false : firstVisible.rowId > snapshot.rows.firstRowId;
}

/** 原 oNe（39817 / 35817）：首行所在轮是否缺 turnHeader */
export function isFirstTurnHeaderMissing(snapshot: SessionSnapshot | null, disabled: boolean): boolean {
  if (disabled || !hasOlderRows(snapshot) || !snapshot) return false;
  const firstTurnId = snapshot.rows.window[0]?.turnId;
  return firstTurnId ? !snapshot.rows.window.some((row) => row.turnId === firstTurnId && row.kind === "turnHeader") : false;
}

/** 原 gw（39824 / 35822）：更旧行前置拼接（不连续 → null） */
export function prependOlderRows(window: SessionRow[], olderRows: SessionRow[]): SessionRow[] | null {
  const firstRowId = window[0]?.rowId ?? 1 / 0;
  const prefix = olderRows.filter((row) => row.rowId < firstRowId);
  return prefix.length === 0 ? null : [...prefix, ...window];
}

interface RecoveryState {
  subscriptionId: string;
  requestInFlight: boolean;
  ackReceived: boolean;
  validFrameSeen: boolean;
  upgradePending: boolean;
  ackMode: string | null;
  forceSnapshot: boolean;
  postRecoveryGapPending: boolean;
  frameDeadline: ReturnType<typeof setTimeout> | null;
}

export type TurnNavigatorHydrationResult =
  | { status: "hydrated"; logEpoch: string; directoryRevision: number }
  | { status: "not-enough-queries"; logEpoch: string; directoryRevision: number }
  | { status: "stale"; logEpoch: string }
  | { status: "retryable-failure"; logEpoch: string };

/** 原 sNe（39829 / 35827）：v4 会话快照 store（订阅/帧应用/恢复/补拉历史/计划） */
export class ConversationSnapshotStore {
  topic: string;
  transport: ConversationTransport;
  state: SnapshotStoreState = INITIAL_SNAPSHOT_STORE_STATE;
  listeners = new Set<() => void>();
  modelTransitionListeners = new Set<(transition: NonNullable<SessionSnapshot["modelTransition"]>) => void>();
  observedModelTransitionEventId: string | null = null;
  generation = 0;
  awaitingInitial: { subscriptionId: string; mode: string } | null = null;
  subscriptionHasAppliedBase = false;
  recovery: RecoveryState | null = null;
  offAssemblyFault: () => void;
  offRuntimeRestart: () => void;
  planQueryInFlight = false;
  planQueryPending = false;
  turnNavigatorHydrationTerminal: TurnNavigatorHydrationResult | null = null;
  closed = false;
  constructor(topic: string, transport: ConversationTransport) {
    ((this.topic = topic),
      (this.transport = transport),
      (this.offAssemblyFault = transport.onAssemblyFault((fault) => {
        fault.topic === this.topic && this.handleAssemblyFault(fault.subscriptionId, fault.deliveryKind);
      })),
      (this.offRuntimeRestart = transport.onRuntimeRestart(() => this.handleRuntimeRestart())));
  }
  getState(): SnapshotStoreState {
    return this.state;
  }
  subscribe(listener: () => void): () => void {
    return (this.listeners.add(listener), () => this.listeners.delete(listener));
  }
  onOnlineModelTransition(listener: (transition: NonNullable<SessionSnapshot["modelTransition"]>) => void): () => void {
    return (this.modelTransitionListeners.add(listener), () => this.modelTransitionListeners.delete(listener));
  }
  setState(patch: Partial<SnapshotStoreState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
  async connect(options: { forceSnapshot?: boolean; initialOverflowRetry?: boolean } = {}): Promise<void> {
    if (this.closed) return;
    const generationAtStart = ++this.generation;
    this.discardRecovery();
    const baseSnapshot = options.forceSnapshot ? null : this.state.snapshot;
    this.setState({ status: "connecting" });
    try {
      const result = await this.transport.subscribe({
        topic: this.topic,
        base: baseSnapshot ? { logEpoch: baseSnapshot.logEpoch, seq: baseSnapshot.seq } : void 0,
      });
      if (generationAtStart !== this.generation || this.closed) {
        this.transport.unsubscribe(result.ack.subscriptionId);
        return;
      }
      (this.discardRecovery(),
        this.setState({ status: "live", subscriptionId: result.ack.subscriptionId, lastError: null }),
        (this.subscriptionHasAppliedBase = !!(
          baseSnapshot &&
          result.ack.mode === "resume" &&
          result.ack.logEpoch === baseSnapshot.logEpoch
        )),
        (this.awaitingInitial = { subscriptionId: result.ack.subscriptionId, mode: result.ack.mode }),
        this.transport.activate(result.ack.subscriptionId));
    } catch (error) {
      if (generationAtStart !== this.generation || this.closed) return;
      const message = error instanceof Error ? error.message : String(error);
      if (
        ((this.awaitingInitial = null),
        (this.subscriptionHasAppliedBase = false),
        message.includes("fault.subscription.initialFrameStagingOverflow") && !options.initialOverflowRetry)
      ) {
        await this.connect({ forceSnapshot: true, initialOverflowRetry: true });
        return;
      }
      (logger.warn(`[v4-store] subscribe ${this.topic} 失败: ${message}`),
        this.setState({ status: "error", lastError: message }));
    }
  }
  retry(): Promise<void> {
    return this.connect();
  }
  recoverFromStaleAuthority(): void {
    this.requestRecovery();
  }
  handleFrame(frame: ConversationFrame, meta?: { deliveryKind?: DeliveryKind }): void {
    if (this.closed || frame.subscriptionId !== this.state.subscriptionId) return;
    const awaiting =
      this.awaitingInitial?.subscriptionId === frame.subscriptionId ? this.awaitingInitial : null;
    const deliveryKind = meta?.deliveryKind ?? "online";
    const initialContext = deliveryKind === "initial" ? awaiting : null;
    if (
      ((initialContext || (deliveryKind === "recovery" && awaiting)) && (this.awaitingInitial = null),
      deliveryKind === "online" && this.recovery && frame.payload.kind === "snapshot")
    ) {
      this.applyFrame(frame, { subscribeMode: null, recovery: false, online: true });
      return;
    }
    if (deliveryKind === "online" && this.recovery) {
      frame.toSeq > (this.state.snapshot?.seq ?? 0) &&
        (this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen);
      return;
    }
    if (frame.payload.kind === "deltas" && !this.subscriptionHasAppliedBase) {
      this.requestRecovery(deliveryKind === "recovery");
      return;
    }
    this.applyFrame(frame, {
      subscribeMode: initialContext?.mode ?? null,
      recovery: deliveryKind === "recovery",
      online: deliveryKind === "online",
    });
  }
  applyFrame(frame: ConversationFrame, context: { subscribeMode: string | null; recovery: boolean; online: boolean }): void {
    if (frame.payload.kind === "snapshot") {
      const hadAppliedBase = this.subscriptionHasAppliedBase;
      (this.setState({
        snapshot: frame.payload.snapshot,
        planDirectoryRevision: this.state.planDirectoryRevision + 1,
        turnNavigatorDirectoryRevision: this.state.turnNavigatorDirectoryRevision + 1,
      }),
        (this.subscriptionHasAppliedBase = true),
        this.reconcileOptimistic(frame.payload.snapshot),
        this.observeModelTransition(frame.payload.snapshot, context.online && hadAppliedBase),
        context.recovery && this.markRecoveryFrameSeen());
      return;
    }
    const snapshot = this.state.snapshot;
    if (snapshot && frame.toSeq <= snapshot.seq) {
      context.recovery && this.markRecoveryFrameSeen();
      return;
    }
    if (!snapshot || frame.fromSeq !== snapshot.seq) {
      (logger.warn(
        `[v4-store] ${this.topic} 帧断档 fromSeq=${frame.fromSeq} local=${snapshot?.seq ?? "none"}，重订阅`,
      ),
        context.subscribeMode === null
          ? this.requestRecovery(context.recovery)
          : this.connect({ forceSnapshot: true }));
      return;
    }
    const nextSnapshot: SessionSnapshot = { ...applySnapshotDeltas(snapshot, frame.payload.deltas), seq: frame.toSeq };
    const removedFromRowId = frame.payload.deltas.reduce<number | null>(
      (min, delta) => (delta.op === "row.removed" ? Math.min(min ?? (delta as { fromRowId: number }).fromRowId, (delta as { fromRowId: number }).fromRowId) : min),
      null,
    );
    (this.setState({
      snapshot: nextSnapshot,
      ...(removedFromRowId === null ? {} : { sessionPlans: this.state.sessionPlans.filter((plan) => plan.rowId < removedFromRowId) }),
      ...(frameBumpsPlanDirectory(frame) ? { planDirectoryRevision: this.state.planDirectoryRevision + 1 } : {}),
      ...(frameBumpsTurnNavigator(frame)
        ? { turnNavigatorDirectoryRevision: this.state.turnNavigatorDirectoryRevision + 1 }
        : {}),
    }),
      (this.subscriptionHasAppliedBase = true),
      this.reconcileOptimistic(nextSnapshot),
      this.observeModelTransition(nextSnapshot, context.online),
      context.recovery && this.markRecoveryFrameSeen());
  }
  observeModelTransition(snapshot: SessionSnapshot, notify: boolean): void {
    const transition = snapshot.modelTransition;
    const eventId = transition?.eventId ?? null;
    if (
      eventId !== this.observedModelTransitionEventId &&
      ((this.observedModelTransitionEventId = eventId), !(!notify || !transition))
    )
      for (const listener of this.modelTransitionListeners) listener(transition!);
  }
  handleAssemblyFault(subscriptionId: string, deliveryKind?: DeliveryKind): void {
    if (this.closed || subscriptionId !== this.state.subscriptionId) return;
    this.awaitingInitial?.subscriptionId === subscriptionId &&
      (deliveryKind === "initial" || deliveryKind === "recovery" || deliveryKind === void 0) &&
      (this.awaitingInitial = null);
    const forceSnapshot = deliveryKind === "recovery" || (deliveryKind === void 0 && this.recovery !== null);
    if (deliveryKind === "online" && this.recovery) {
      this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen;
      return;
    }
    this.requestRecovery(forceSnapshot);
  }
  requestRecovery(forceSnapshot = false): void {
    if (this.closed) return;
    const subscriptionId = this.state.subscriptionId;
    if (!subscriptionId) {
      this.connect({ forceSnapshot: true });
      return;
    }
    const existing = this.recovery;
    if (existing) {
      if (!forceSnapshot) return;
      if (existing.forceSnapshot) {
        this.failRecovery("fault.subscription.recoveryFailed");
        return;
      }
      if (existing.requestInFlight || !existing.ackReceived) {
        existing.upgradePending = true;
        return;
      }
      existing.ackMode === "resume"
        ? this.issueRecovery(existing, true)
        : this.failRecovery("fault.subscription.recoveryFailed");
      return;
    }
    const recovery: RecoveryState = {
      subscriptionId,
      requestInFlight: false,
      ackReceived: false,
      validFrameSeen: false,
      upgradePending: false,
      ackMode: null,
      forceSnapshot: false,
      postRecoveryGapPending: false,
      frameDeadline: null,
    };
    ((this.recovery = recovery), this.issueRecovery(recovery, false));
  }
  issueRecovery(recovery: RecoveryState, forceSnapshot: boolean): void {
    this.clearRecoveryDeadline(recovery);
    const snapshot = this.state.snapshot;
    const shouldForce = forceSnapshot || !this.subscriptionHasAppliedBase;
    ((recovery.requestInFlight = true),
      (recovery.ackReceived = false),
      (recovery.ackMode = null),
      (recovery.upgradePending = false),
      (recovery.validFrameSeen = false),
      (recovery.forceSnapshot = shouldForce),
      (recovery.postRecoveryGapPending = false),
      this.transport
        .resync({
          subscriptionId: recovery.subscriptionId,
          base:
            this.subscriptionHasAppliedBase && snapshot ? { logEpoch: snapshot.logEpoch, seq: snapshot.seq } : null,
          ...(shouldForce ? { forceSnapshot: true } : {}),
        })
        .then((result) => {
          if (!(this.closed || this.recovery !== recovery)) {
            if (result.ack.subscriptionId !== recovery.subscriptionId)
              throw Error("fault.subscription.resyncGenerationMismatch");
            ((recovery.requestInFlight = false),
              (recovery.ackReceived = true),
              (recovery.ackMode = result.ack.mode),
              this.settleRecovery(recovery));
          }
        })
        .catch((error) => {
          if (this.closed || this.recovery !== recovery) return;
          (this.clearRecoveryDeadline(recovery), (this.recovery = null));
          const message = error instanceof Error ? error.message : String(error);
          if (
            (logger.warn(`[v4-store] resync ${this.topic} 失败: ${message}`),
            message.includes("fault.subscription.notOwned"))
          ) {
            this.connect();
            return;
          }
          this.setState({ status: "error", lastError: message });
        }));
  }
  markRecoveryFrameSeen(): void {
    const recovery = this.recovery;
    recovery && ((recovery.validFrameSeen = true), this.settleRecovery(recovery));
  }
  settleRecovery(recovery: RecoveryState): void {
    if (!(this.recovery !== recovery || !recovery.ackReceived || recovery.requestInFlight)) {
      if (recovery.upgradePending) {
        (this.clearRecoveryDeadline(recovery),
          !recovery.forceSnapshot && recovery.ackMode === "resume"
            ? this.issueRecovery(recovery, true)
            : this.failRecovery("fault.subscription.recoveryFailed"));
        return;
      }
      if (recovery.validFrameSeen) {
        (this.clearRecoveryDeadline(recovery),
          recovery.postRecoveryGapPending ? this.issueRecovery(recovery, false) : (this.recovery = null));
        return;
      }
      recovery.frameDeadline ||= setTimeout(() => {
        ((recovery.frameDeadline = null),
          !(this.closed || this.recovery !== recovery || recovery.validFrameSeen) &&
            (recovery.forceSnapshot
              ? this.failRecovery("fault.subscription.recoveryFrameTimedOut")
              : this.issueRecovery(recovery, true)));
      }, protocolLimits.logicalFrameAssemblyTimeoutMs);
    }
  }
  clearRecoveryDeadline(recovery: RecoveryState): void {
    recovery.frameDeadline &&= (clearTimeout(recovery.frameDeadline), null);
  }
  discardRecovery(): void {
    (this.recovery && this.clearRecoveryDeadline(this.recovery), (this.recovery = null));
  }
  failRecovery(reason: string): void {
    this.recovery &&
      (this.discardRecovery(),
      logger.warn(`[v4-store] ${this.topic} recovery fail-closed: ${reason}`),
      this.setState({ status: "error", lastError: reason }));
  }
  handleRuntimeRestart(): void {
    this.closed ||
      ((this.generation += 1),
      this.discardRecovery(),
      (this.awaitingInitial = null),
      (this.subscriptionHasAppliedBase = false),
      this.setState({ status: "connecting", subscriptionId: null }),
      this.connect({ forceSnapshot: true }));
  }
  async loadOlder(limit: number = protocolLimits.snapshotTailWindowRows): Promise<void> {
    if (this.closed || this.state.loadingOlder) return;
    const snapshot = this.state.snapshot;
    if (!hasOlderRows(snapshot) || !snapshot) return;
    const sessionId = sessionIdFromTopic(this.topic);
    if (!sessionId) return;
    const cursorRowId = snapshot.rows.window[0]?.rowId;
    if (cursorRowId !== void 0) {
      this.setState({ loadingOlder: true });
      try {
        const result = await this.transport.rowsRange({ sessionId, beforeRowId: cursorRowId, limit });
        if (this.closed) return;
        const current = this.state.snapshot;
        if (!current || result.atLogEpoch !== current.logEpoch) {
          logger.warn(`[v4-store] ${this.topic} rows/range 纪元不匹配（${result.atLogEpoch}），整体丢弃`);
          return;
        }
        if (current.rows.window[0]?.rowId !== cursorRowId) return;
        const merged = prependOlderRows(current.rows.window, result.rows);
        if (merged === null) return;
        this.setState({ snapshot: { ...current, rows: { ...current.rows, window: merged } } });
      } catch (error) {
        logger.warn(
          `[v4-store] rowsRange ${this.topic} 失败: ${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        this.closed || this.setState({ loadingOlder: false });
      }
    }
  }
  async loadAllOlder(): Promise<TurnNavigatorHydrationResult> {
    const staleResult = (logEpoch: string = this.state.snapshot?.logEpoch ?? "unknown"): TurnNavigatorHydrationResult => ({
      status: "stale",
      logEpoch,
    });
    if (this.closed || this.state.loadingOlder) return staleResult();
    const snapshot = this.state.snapshot;
    if (!snapshot) return staleResult();
    const directoryRevision = this.state.turnNavigatorDirectoryRevision;
    if (
      this.turnNavigatorHydrationTerminal?.logEpoch === snapshot.logEpoch &&
      ("directoryRevision" in this.turnNavigatorHydrationTerminal
        ? this.turnNavigatorHydrationTerminal.directoryRevision
        : void 0) === directoryRevision
    )
      return this.turnNavigatorHydrationTerminal;
    if (!hasOlderRows(snapshot)) return staleResult(snapshot.logEpoch);
    const sessionId = sessionIdFromTopic(this.topic);
    const cursorRowId = snapshot.rows.window[0]?.rowId;
    if (!sessionId || cursorRowId === void 0) return staleResult(snapshot.logEpoch);
    const logEpoch = snapshot.logEpoch;
    const pages: SessionRow[][] = [];
    let beforeRowId = cursorRowId;
    let applied = false;
    (this.setState({ loadingOlder: true }),
      logger.debug("[v4-store] 完整问题目录开始补拉历史 rows", {
        beforeRowId,
        loadedRows: snapshot.rows.window.length,
        sessionId,
        totalRows: snapshot.rows.totalCount,
      }));
    try {
      for (;;) {
        const result = await this.transport.rowsRange({
          sessionId,
          beforeRowId,
          limit: protocolLimits.rowsRangeMaxLimit,
        });
        if (this.closed) return staleResult(logEpoch);
        const current = this.state.snapshot;
        if (!current || result.atLogEpoch !== logEpoch || current.logEpoch !== logEpoch || current.rows.window[0]?.rowId !== cursorRowId)
          return (
            logger.warn("[v4-store] 完整问题目录补拉期间投影游标失效，整批丢弃", {
              currentBeforeRowId: current?.rows.window[0]?.rowId,
              expectedBeforeRowId: cursorRowId,
              resultLogEpoch: result.atLogEpoch,
              sessionId,
            }),
            staleResult(logEpoch)
          );
        const olderRows = result.rows.filter((row) => row.rowId < beforeRowId);
        const nextCursor = olderRows[0]?.rowId;
        if (nextCursor === void 0 || nextCursor >= beforeRowId)
          return (
            logger.warn("[v4-store] 完整问题目录 rows/range 未推进游标，停止补拉", {
              beforeRowId,
              hasMore: result.hasMore,
              sessionId,
            }),
            { status: "retryable-failure", logEpoch }
          );
        if ((pages.push(olderRows), (beforeRowId = nextCursor), !result.hasMore)) break;
      }
      const current = this.state.snapshot;
      if (!current || current.logEpoch !== logEpoch || current.rows.window[0]?.rowId !== cursorRowId) return staleResult(logEpoch);
      const history = [...pages].reverse().flat();
      const realUserQueryCount = [...history, ...current.rows.window].reduce(
        (count, row) => (row.kind === "userInput" && row.origin === "realUser" ? count + 1 : count),
        0,
      );
      if (realUserQueryCount < 2) {
        logger.debug("[v4-store] 完整问题目录探测后不足两条 query，保持 tail window", {
          pages: pages.length,
          realUserQueryCount,
          sessionId,
        });
        const terminal: TurnNavigatorHydrationResult = { status: "not-enough-queries", logEpoch, directoryRevision };
        return ((this.turnNavigatorHydrationTerminal = terminal), terminal);
      }
      const merged = prependOlderRows(current.rows.window, history);
      if (merged === null) return staleResult(logEpoch);
      ((applied = true),
        this.setState({ loadingOlder: false, snapshot: { ...current, rows: { ...current.rows, window: merged } } }),
        logger.debug("[v4-store] 完整问题目录历史 rows 补拉完成", {
          loadedRows: merged.length,
          pages: pages.length,
          sessionId,
        }));
      const terminal: TurnNavigatorHydrationResult = { status: "hydrated", logEpoch, directoryRevision };
      return ((this.turnNavigatorHydrationTerminal = terminal), terminal);
    } catch (error) {
      return (
        logger.warn(
          `[v4-store] 完整问题目录 rowsRange ${this.topic} 失败: ${error instanceof Error ? error.message : String(error)}`,
        ),
        { status: "retryable-failure", logEpoch }
      );
    } finally {
      !this.closed && !applied && this.setState({ loadingOlder: false });
    }
  }
  async refreshPlans(): Promise<void> {
    if (this.closed) return;
    if (this.planQueryInFlight) {
      this.planQueryPending = true;
      return;
    }
    const snapshot = this.state.snapshot;
    const sessionId = sessionIdFromTopic(this.topic);
    if (!snapshot || !sessionId) return;
    const generationAtStart = this.generation;
    const revisionAtStart = this.state.planDirectoryRevision;
    ((this.planQueryInFlight = true), this.setState({ plansLoading: true }));
    try {
      const result = await this.transport.plans({ sessionId });
      if (this.closed || this.generation !== generationAtStart) return;
      const current = this.state.snapshot;
      if (!current || current.logEpoch !== result.atLogEpoch) return;
      if (this.state.planDirectoryRevision !== revisionAtStart) {
        this.planQueryPending = true;
        return;
      }
      this.setState({ sessionPlans: result.plans });
    } catch (error) {
      this.closed ||
        logger.warn(
          `[v4-store] plans ${this.topic} 失败: ${error instanceof Error ? error.message : String(error)}`,
        );
    } finally {
      ((this.planQueryInFlight = false),
        this.closed || this.setState({ plansLoading: false }),
        this.planQueryPending &&
          !this.closed &&
          ((this.planQueryPending = false), this.refreshPlans()));
    }
  }
  markCommandPending(command: SnapshotStoreState["optimisticCommands"][number]): void {
    this.closed || this.setState({ optimisticCommands: [...this.state.optimisticCommands, command] });
  }
  settleCommand(commandId: string): void {
    const remaining = this.state.optimisticCommands.filter((command) => command.commandId !== commandId);
    remaining.length !== this.state.optimisticCommands.length && this.setState({ optimisticCommands: remaining });
  }
  reconcileOptimistic(snapshot: SessionSnapshot): void {
    if (this.state.optimisticCommands.length === 0) return;
    const knownCommandIds = new Set(snapshot.pendingCommands.map((command) => command.commandId));
    for (const row of snapshot.rows.window)
      row.kind === "userInput" && row.sourceCommandId && knownCommandIds.add(row.sourceCommandId);
    const remaining = this.state.optimisticCommands.filter((command) => !knownCommandIds.has(command.commandId));
    remaining.length !== this.state.optimisticCommands.length && this.setState({ optimisticCommands: remaining });
  }
  async close(): Promise<void> {
    if (this.closed) return;
    ((this.closed = true),
      this.offAssemblyFault(),
      this.offRuntimeRestart(),
      this.modelTransitionListeners.clear(),
      this.discardRecovery(),
      (this.awaitingInitial = null),
      (this.subscriptionHasAppliedBase = false),
      this.generation++);
    const { subscriptionId } = this.state;
    if ((this.setState({ status: "closed", subscriptionId: null }), subscriptionId))
      try {
        await this.transport.unsubscribe(subscriptionId);
      } catch (error) {
        logger.warn(`[v4-store] unsubscribe ${this.topic} 失败（忽略）: ${String(error)}`);
      }
  }
}

/** 原 cNe/lNe（40329–40330 / 36320–36321） */
const KEEP_WARM_MS_DEFAULT = 30000;
const KEEP_WARM_MS_E2E = 1000;

/** 原 uNe（40331 / 36322）：E2E 桥模式缩短保活 */
export function resolveKeepWarmMs(e2e: boolean = isE2eStoreBridgeMode()): number {
  return e2e ? KEEP_WARM_MS_E2E : KEEP_WARM_MS_DEFAULT;
}

/** 原 _w（40334 / 36325）：会话数据层（按 topic 引用计数 + 保活回收） */
export class ConversationDataLayer {
  transport: ConversationTransport;
  keepWarmMs: number;
  entries = new Map<string, { store: ConversationSnapshotStore; refCount: number; keepWarmTimer: ReturnType<typeof setTimeout> | null }>();
  offFrame: () => void;
  disposed = false;
  constructor(args: { transport: ConversationTransport; keepWarmMs?: number }) {
    ((this.transport = args.transport),
      (this.keepWarmMs = args.keepWarmMs ?? resolveKeepWarmMs()),
      (this.offFrame = this.transport.onFrame((frame, meta) => {
        this.entries.get(frame.topic)?.store.handleFrame(frame, meta);
      })));
  }
  acquire(topic: string): { store: ConversationSnapshotStore; release(): void } {
    if (this.disposed) throw Error("SessionDataLayer 已释放，不能再 acquire");
    const key = conversationLayerKey(topic);
    let existing = this.entries.get(key);
    if (existing)
      (existing.refCount++,
        existing.keepWarmTimer !== null && (clearTimeout(existing.keepWarmTimer), (existing.keepWarmTimer = null)));
    else {
      const store = new ConversationSnapshotStore(key, this.transport);
      ((existing = { store, refCount: 1, keepWarmTimer: null }), this.entries.set(key, existing), store.connect());
    }
    let released = false;
    return {
      store: existing.store,
      release: () => {
        released || ((released = true), this.releaseEntry(key));
      },
    };
  }
  get size(): number {
    return this.entries.size;
  }
  queryCommands(request: { commands: unknown }): Promise<unknown> {
    return this.transport.queryCommands(request);
  }
  releaseEntry(key: string): void {
    const entry = this.entries.get(key);
    entry &&
      (entry.refCount--,
      !(entry.refCount > 0 || this.disposed) &&
        (entry.keepWarmTimer = setTimeout(() => {
          (this.entries.delete(key), entry.store.close());
        }, this.keepWarmMs)));
  }
  dispose(): void {
    if (!this.disposed) {
      ((this.disposed = true), this.offFrame());
      for (const entry of this.entries.values())
        (entry.keepWarmTimer !== null && clearTimeout(entry.keepWarmTimer), entry.store.close());
      this.entries.clear();
    }
  }
}

/** 原 vw/dNe（40390–40391 / 36376–36377）：数据层注册表与保活时长 */
const dataLayerEntriesByKey = new Map<string, DataLayerEntry>();
const DATA_LAYER_KEEP_WARM_MS = 30000;

interface DataLayerEntry {
  key: string;
  agentService: AgentServiceV4;
  transport: ConversationTransport;
  layer: ConversationDataLayer;
  refCount: number;
  keepWarmTimer: ReturnType<typeof setTimeout> | null;
  stale: boolean;
}

/** 原 fNe（40392 / 36378）：数据层键（远端会话 × 工作区） */
export function dataLayerKey(target: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string }): string {
  const workspaceKey = target.workspaceIdentity?.trim() || target.workspacePath;
  return `${target.remoteSessionId ?? "__base__"} ${workspaceKey}`;
}

/** 原 yw（40396 / 36382） */
export function disposeDataLayerEntry(entry: DataLayerEntry): void {
  (entry.keepWarmTimer !== null && (clearTimeout(entry.keepWarmTimer), (entry.keepWarmTimer = null)),
    entry.layer.dispose());
}

/** 原 pNe（40400 / 36385）：引用归零 → 保活窗口后释放（stale 立即释放） */
export function releaseDataLayerEntry(entry: DataLayerEntry): void {
  if ((--entry.refCount, !(entry.refCount > 0))) {
    if (entry.stale) {
      disposeDataLayerEntry(entry);
      return;
    }
    entry.keepWarmTimer = setTimeout(() => {
      (dataLayerEntriesByKey.get(entry.key) === entry && dataLayerEntriesByKey.delete(entry.key), entry.layer.dispose());
    }, DATA_LAYER_KEEP_WARM_MS);
  }
}

/** 原 mNe（40411 / 36396）：获取（或复用）工作区的会话数据层 */
export function acquireConversationDataLayer(
  target: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string },
  agentService: AgentServiceV4,
): { layer: ConversationDataLayer; transport: ConversationTransport; release(): void } {
  const key = dataLayerKey(target);
  const existing = dataLayerEntriesByKey.get(key);
  let entry: DataLayerEntry;
  if (existing && existing.agentService === agentService)
    ((existing.refCount += 1),
      existing.keepWarmTimer !== null && (clearTimeout(existing.keepWarmTimer), (existing.keepWarmTimer = null)),
      (entry = existing));
  else {
    existing && (dataLayerEntriesByKey.delete(key), (existing.stale = true), existing.refCount <= 0 && disposeDataLayerEntry(existing));
    const transport = createConversationTransport(agentService, {
      workspacePath: target.workspacePath,
      ...(target.workspaceIdentity ? { workspaceIdentity: target.workspaceIdentity } : {}),
    });
    ((entry = {
      key,
      agentService,
      transport,
      layer: new ConversationDataLayer({ transport }),
      refCount: 1,
      keepWarmTimer: null,
      stale: false,
    }),
      dataLayerEntriesByKey.set(key, entry));
  }
  let released = false;
  return {
    layer: entry.layer,
    transport: entry.transport,
    release: () => {
      released || ((released = true), releaseDataLayerEntry(entry));
    },
  };
}

/* ============================================================================
 * §17 边界注记：尾段 41856–41940（旧 41808–41892）遥测 fact 助手
 * ----------------------------------------------------------------------------
 * uT/dT/fT/pT/fFe/pFe/mFe/mT（有界去重集 + task_network_debug_status 构造 +
 * 用量映射/累加 + 工具超时/终态归一 + 可选数值解析）已由 services.tsx 逐字抽取
 * （BoundedStringSet 2072 / buildNetworkDebugStatus 2115 / 2150 / 2171 / 2179 /
 * 2193 / 2198 / 2203），其消费体 hT = ConversationTelemetrySupervisor 亦在
 * services.tsx 2295。任务清单曾将本段标为「RMe 块收尾导出」，实测为遥测监督域
 * 助手，归属横切 services——不重复转录。
 * ==========================================================================*/

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行 / jsx 行；本批次展开的全部符号）
 * ============================================================================
 *  状态呈现：Bje 37093/33890 | Vje 37104/33928 | Hje 37115/33939 | Uje 37118/33944
 *   bC 37129/33956
 *  联系持久化：TC 37172/33992（xC/SC/CC/Wje/wC → stores-core.tsx §3）
 *  截图：Gje 37175/33995 | Kje 37294/34033 | qje 37320/34043 | EC 37342/34063
 *  表单原语：DC 37345/34066 | OC 37360/34073 | Jje 37394/34082 | Yje 37411/34102
 *   Xje 37430/34115 | Zje 37465/34127 | kC 37530/34138 | AC 37548/34145
 *   Qje 37559/34151 | $je 37565/34157 | jC 37571/34163
 *  模型/错误：eMe 37630/34205 | tMe 37631/34206 | MC 37651/34228
 *  作业引擎：NC 37656/34231 | nMe 37679 | PC 37680 | FC 37681 | IC 37682/34257
 *   LC 37685/34263 | rMe 37689/34267 | iMe 37692/34270 | RC 37703/34277
 *   aMe 37706/34280 | zC 37709/34283 | oMe 37723/34296 | sMe 37898/34469
 *   cMe 37902/34480 | BC 37911/34483 | lMe 37916/34488 | VC 37992/34549
 *   uMe 37999/34552 | dMe 38021/34572 | HC 38024/34575
 *  提交表单：fMe 38052/34600 | pMe 38053/34601 | mMe 38054/34602 | hMe 38064/34605
 *   gMe 38089/34615 | _Me 38090/34616 | vMe 38091/34617 | UC 38092/34618
 *   yMe 38162/34703 | bMe 38163/34704 | WC 38164/34705 | xMe 38165/34706
 *   SMe 38168/34712 | CMe 38389/34867 | wMe 38394/34872
 *  功能请求：GC 38400/34878 | TMe 38401/34879 | EMe 38402/34880 | KC 38637/34996
 *   DMe 38677/35015
 *  工单：qC 38690/35024 | OMe 38717/35047 | kMe 38827/35117 | AMe 38837/35125
 *   jMe 38924/35152
 *  后台指示：MMe 38952/35167 | NMe 38953/35168 | PMe 38956/35171 | FMe 38961/35180
 *   IMe 38980/35191 | LMe 39014/35215
 *  根：RMe 39155/35262
 *  F07 邻接：zMe 39254/35307 | BMe 39268/35321 | JMe 39455/35462
 *  常量：uw 39459/35470 | dw 39460/35471（lw 39458 → TopBar.tsx）
 *  附件协议：fw 39461/35472 | YMe 39466/35477 | XMe 39472/35483 | ZMe 39492/35495
 *   QMe 39498/35501 | $Me 39503/35506 | eNe 39508/35509 | pw 39512/35513 | tNe 39515/35516
 *  v4 运行时：mw 39582/35586 | nNe 39781/35783 | rNe 39793/35795 | iNe 39794/35796
 *   aNe 39804/35804 | hw 39814/35812 | oNe 39819/35817 | gw 39824/35822
 *   sNe 39829/35827 | cNe 40329/36320 | lNe 40330/36321 | uNe 40331/36322
 *   _w 40334/36325 | vw 40390/36376 | dNe 40391/36377 | fNe 40392/36378
 *   yw 40396/36382 | pNe 40400/36385 | mNe 40411/36396
 *  边界（只注记）：37040–37092 yC→stores-core | 37139–37172 xC..wC→stores-core
 *   39299–39453 设置导航→Settings.tsx | 39458 lw→TopBar.tsx | 40445–41855 遥测→StoresDeep §H
 *   41856–41940 uT..mT→services.tsx
 * ============================================================================
 */
