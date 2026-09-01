// A0-S4-5: 自 modules/services.tsx §G 总题 + §G.1–G.4 原样迁入（任务未读去重 + v4 会话协议 schema + 命令词汇表 + FrameAssembler，原 js 32246–34180；原文件现为薄 re-export shim）。
// zod schema 本体在 src-HCld2afU.js，此处保持 declare 占位（与原文件一致）。
import * as React from "react";
import { crc32Hex } from '../modules/SrcSharedB';
/* ============================================================================
 * G. 命令队列运行时（原 32246–36438）
 * ----------------------------------------------------------------------------
 * chat.queue/steer 的底层：
 *  G.1 任务未读通知去重（ux/dx）
 *  G.2 v4 会话协议 zod schema（队列项 qOe：steer/dispatch/admittedAt/provenance）
 *  G.3 会话命令 schema 表（Yke：sendText/stop/queue 操作/交互解决/模型切换…）
 *  G.4 FrameAssembler（bS：流帧分片装配，15 种故障码）
 *  G.5 SessionIndexStore（XAe：v4-sessions-index 订阅/恢复状态机）
 *  G.6 WorkspaceSubscriptionSet（QAe）+ store 池（VS/HS/BS）
 * zod 本体在 src-HCld2afU.js（K 导出）；此处以 TS 类型 + 声明常量表达 schema。
 * ==========================================================================*/

/* --- G.1 任务未读通知去重（原 ux/dx，js 32262–32306） --- */

const UNREAD_NOTIFY_DEDUPE_MS = 500; // 原 cx
const UNREAD_NOTIFY_DEDUPE_MAX = 256; // 原 uOe
const unreadNotifyDedupe = new Map<string, number>(); // 原 lx
const unreadNotifyListeners = new Set<() => void>(); // 原 ox
let unreadNotifyVersion = 0; // 原 ax

export function subscribeUnreadNotifications(listener: () => void): () => void {
  unreadNotifyListeners.add(listener);
  return () => {
    unreadNotifyListeners.delete(listener);
  };
}

export function getUnreadNotificationVersion(): number {
  return unreadNotifyVersion;
}

/** 原 ux：同一任务同状态 500ms 内只通知一次（去重表上限 256） */
export function notifyTaskUnreadChange(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
  reason: string;
  taskMeta?: { updatedAt?: number; unreadAt?: number | null } | null;
}): void {
  if (!args.taskMeta || !args.taskId) {
    unreadNotifyVersion += 1;
    for (const listener of unreadNotifyListeners) listener();
    return;
  }
  const key = [args.workspaceIdentity?.trim() || args.workspacePath, args.taskId, args.reason, args.taskMeta.updatedAt, args.taskMeta.unreadAt ?? ""].join("::");
  const now = Date.now();
  const last = unreadNotifyDedupe.get(key);
  if (last !== undefined && now - last < UNREAD_NOTIFY_DEDUPE_MS) return;
  for (const [dedupeKey, at] of unreadNotifyDedupe) if (now - at >= UNREAD_NOTIFY_DEDUPE_MS) unreadNotifyDedupe.delete(dedupeKey);
  if (unreadNotifyDedupe.size < UNREAD_NOTIFY_DEDUPE_MAX) unreadNotifyDedupe.set(key, now);
  unreadNotifyVersion += 1;
  for (const listener of unreadNotifyListeners) listener();
}

/** 原 dx：useSyncExternalStore 版订阅钩子 */
export function useUnreadNotificationVersion(): number {
  return React.useSyncExternalStore(subscribeUnreadNotifications, getUnreadNotificationVersion);
}

/* --- G.2 v4 会话协议 schema（原 32876–33178 区） --- */

/** 原 WOe：投递请求/准入 */
export interface QueueDelivery {
  requested: "auto" | "startNow" | "queue" | "guide";
  admitted: "startNow" | "queue" | "guide";
  fallbackReasonCode?: string;
}

/** 原 GOe：准入序号与队列位置 */
export interface QueueOrder {
  admissionSeq: number;
  queuePosition?: number;
}

/** 原 KOe：steer（转向）状态机 */
export interface QueueSteer {
  state: "notRequested" | "submitting" | "steering" | "guided" | "fellBack";
  reasonCode?: string;
}

/** 原 Nx：dispatch（派发）状态机 */
export interface QueueDispatch {
  state: "admitted" | "queued" | "reserved" | "promoting" | "drained";
  reservationId?: string;
}

/** 原 Mx：附件引用 */
export interface QueueAttachmentRef {
  ref: string;
  fileName: string;
  mime: string;
  bytes: number;
  previewRef?: string;
}

/** 原 qOe：队列项（命令队列的核心契约） */
export interface QueueItem {
  sourceCommandId: string;
  queueItemId: string;
  clientId: string;
  kind: "sendText" | "sendGoalCommand" | "compact";
  text: string;
  attachments: QueueAttachmentRef[];
  delivery: QueueDelivery;
  order: QueueOrder;
  steer: QueueSteer;
  dispatch: QueueDispatch;
  admittedAt: number;
  provenance?: { sourceCommandId: string; queueItemId?: string; clientId?: string };
  toolDisallowlist?: string[];
}

/** 原 Px：会话阶段 */
export type SessionPhase = "draft" | "prewarming" | "running" | "completedSuccess" | "completedInterrupted" | "error";

/** 原 Fx：控制面 */
export interface SessionControl {
  phase: SessionPhase;
  sessionEnded: boolean;
  canStop: boolean;
  stopState: "idle" | "stoppable" | "stopping";
  stopTargetKind: "assistant" | "tool" | "subagent" | "compact" | "goalVerifier" | "goalContinuation" | "turnSteer" | "mixed" | "unknown";
  activeWorks: Array<{ kind: string; foregroundExecutionId?: string; startedAt: number }>;
  lastError: { code: string; message: string; recoverable: boolean; at: number; source: string; traceId?: string; detail?: string; attribution?: Record<string, unknown> } | null;
  apiRetry: { attempt: number; maxAttempts: number; nextRetryAt: number; reasonCode: string } | null;
}

/** 原 Lx：可用性位（各操作允许/禁止+原因码） */
export type AvailabilityFlag = { allowed: true } | { allowed: false; reasonCode: string };
export interface SessionAvailability {
  fork: AvailabilityFlag;
  compact: AvailabilityFlag;
  switchModelConfig: AvailabilityFlag;
  setFollowupMode: AvailabilityFlag;
  queueEdit: AvailabilityFlag;
  sendQueuedNow: AvailabilityFlag;
  pauseGoal: AvailabilityFlag;
  resumeGoal: AvailabilityFlag;
}

/** 原 Rx：输入路由 */
export interface InputRouting {
  mode: "startNow" | "enqueue" | "guide" | "reject" | "choice";
  reasonCode?: string;
}

/** 原 Ux：队列整体 */
export interface SessionQueue {
  items: QueueItem[];
  autoDrain: boolean;
  pauseReason?: "stopped" | "manual";
}

/** 原 Gx：待决交互（权限/用户输入） */
export interface PendingInteraction {
  interactionId: string;
  kind: "permission" | "userInput";
  anchorRowId: number | null;
  createdAt: number;
  autoResolution?:
    | { state: "hiddenGrace" | "visibleCountdown"; startedAt: number; visibleAt: number; deadlineAt: number }
    | { state: "snoozed"; startedAt: number; snoozedAt: number };
  payload:
    | { kind: "permission"; toolCallId: string; toolName: string; summary: string; detail: unknown; options: Array<{ optionId: string; label: string; kind: string; response?: unknown }> }
    | { kind: "userInput"; prompt: string; freeText: boolean; [key: string]: unknown };
}

/** 原 Kx：待决命令 */
export interface PendingCommand {
  commandId: string;
  clientId: string;
  type: string;
  state: "accepted" | "executing";
  at: number;
}

/** 原 qx：后台工作 */
export interface BackgroundWork {
  workId: string;
  kind: "bash" | "subagent";
  title: string;
  status: "running" | "resultPending" | "failed" | "cancelled";
  startedAt: number;
  endedAt?: number;
  cancellable?: boolean;
  blocked?: boolean;
  anchorRowId: number | null;
  childSessionId?: string;
}

/** 原 oke：会话快照（protocolVersion=1） */
export interface SessionSnapshot {
  protocolVersion: 1;
  sessionId: string;
  logEpoch: string;
  seq: number;
  revision: number;
  control: SessionControl;
  availability: SessionAvailability;
  inputRouting: InputRouting;
  meta: { title: string; titleSource: "default" | "generated" | "custom" };
  config: { provider: string; model: string; thought: string; thoughtLevels: string[]; followupMode: "queue" | "guide"; mode: string };
  modelTransition: { eventId: string; origin: "registryFallback"; from: { provider: string; model: string }; to: { provider: string; model: string } } | null;
  usage: {
    contextWindow: { usedTokens: number; maxTokens: number; autoCompactThresholdTokens: number | null; cache?: unknown; breakdown?: unknown } | null;
    cumulative: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };
  };
  queue: SessionQueue;
  pendingInteractions: PendingInteraction[];
  pendingCommands: PendingCommand[];
  backgroundWorks: BackgroundWork[];
  subagents?: { revision: number; childSessionIds: string[]; running: Array<Record<string, unknown>>; endedTotal: number };
  goal: Record<string, unknown> | null;
  plan: { items: Array<{ id: string; content: string; status: string }>; updatedAt: number } | null;
  rows: { window: unknown[]; totalCount: number; firstRowId: number | null };
}

/** 原 ske：状态补丁（快照各字段可选） */
export type SessionStatePatch = Partial<Omit<SessionSnapshot, "protocolVersion" | "sessionId" | "logEpoch" | "seq" | "revision" | "rows">> & { revision?: number };

/** 原 cke：行级增量操作 */
export type SessionRowOp =
  | { op: "row.appended"; row: unknown }
  | { op: "row.upserted"; row: unknown }
  | { op: "row.removed"; fromRowId: number }
  | { op: "row.delta"; rowId: number; path: unknown; append: string }
  | { op: "state.updated"; patch: SessionStatePatch };

/** zod schema 常量（原 ji/K/Jr/Oi/Fi/Li/_t/_i/Yn/Ar/$r 组合；本体在 src chunk） */
declare const QueueItemSchema: { parse(input: unknown): QueueItem; safeParse(input: unknown): { success: boolean; data?: QueueItem } }; // 原 qOe
declare const SessionRowOpSchema: { parse(input: unknown): SessionRowOp }; // 原 cke

/** 原 lke：行增量应用（row.delta 按行类型分派 text/inputText/output.text/summaryText） */
export declare function applyRowDelta(row: Record<string, unknown>, path: string, append: string): Record<string, unknown>;

/* --- G.3 会话命令 schema 表（原 Yke，js 34188–34320 区） --- */

/**
 * 会话传输命令词汇（zod 校验后送入 transport.sendCommand）：
 *  createSession / createSelectionSideSession / sendText / sendGoalCommand / stop /
 *  compact / forkAssistant / applyFileRewind / editUserQuery / retryTurn /
 *  setAssistantFeedback / sendQueuedNow / editQueueItem / reorderQueueItem /
 *  deleteQueueItem / setAutoDrain / resolveInteraction /
 *  snoozeInteractionAutoResolution / switchModelConfig / switchCollaborationMode /
 *  setFollowupMode / pauseGoal / resumeGoal
 * 约束（原 superRefine）：sendText 的 automationId 与 offPeakTaskId 互斥；
 * offPeakRunType 必须伴随 offPeakTaskId。
 */
export interface SessionCommandMap {
  createSession: { workspaceId: string; firstInput?: { text: string; attachments?: QueueAttachmentRef[] }; config?: Record<string, unknown> };
  createSelectionSideSession: Record<string, never>;
  sendText: {
    text: string;
    attachments?: QueueAttachmentRef[];
    heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend";
    expectedHeldQueueItemIds?: string[];
    automationId?: string;
    offPeakTaskId?: string;
    offPeakRunType?: "init" | "resume";
    toolDisallowlist?: string[];
    [key: string]: unknown;
  };
  sendGoalCommand: { text: string; displayText?: string; heldQueueDisposition?: string; expectedHeldQueueItemIds?: string[] };
  stop: { expectedForegroundExecutionId?: string };
  compact: Record<string, never>;
  sendQueuedNow: { queueItemId: string };
  editQueueItem: { queueItemId: string; newText: string };
  reorderQueueItem: { queueItemId: string; beforeQueueItemId: string | null };
  deleteQueueItem: { queueItemId: string };
  setAutoDrain: { autoDrain: boolean };
  resolveInteraction: { interactionId: string; answer: { optionId?: string; freeText?: string; action?: "accept" | "decline" | "cancel"; content?: unknown } };
  snoozeInteractionAutoResolution: { interactionId: string };
  switchModelConfig: { provider: string; model: string; thought: string };
  switchCollaborationMode: { mode: "build" | "edit" | "plan" | "yolo" };
  setFollowupMode: { mode: "queue" | "guide" };
  pauseGoal: Record<string, never>;
  resumeGoal: Record<string, never>;
  [command: string]: unknown;
}

declare const SessionCommandSchemas: { [K in keyof SessionCommandMap]?: { parse(input: unknown): SessionCommandMap[K] } }; // 原 Yke

/* --- G.4 FrameAssembler（原 bS，js 33842–34180） ---
 * 〔A1-P3-B4 孪生裁定〕本段为 A0 语义重建孪生（带类型、非逐字）。bS 的 bundle
 * 逐字真身 = services/conversationWireCore.ts SessionIndexTopicMultiplexer
 * （styles 33890–34228，ROUNDTRIP+SEAMSTRIP[wire] EXACT 661 行在案）；
 * 按真身优先原则，逐字方为 canonical，本段保留 A0 接线面、不重复转录。 */

export type FrameDeliveryKind = "initial" | "online" | "recovery";

export interface LogicalFrame {
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
  deliveryKind?: string;
  kind?: "complete" | "fragment";
  frame?: unknown;
  fragmentCount?: number;
  fragmentIndex?: number;
  logicalBytes?: number;
  checksum?: { algorithm: string; value: string };
  dataBase64?: string;
  [key: string]: unknown;
}

export type FrameAssemblyEvent<T> = { kind: "complete"; frame: T; deliveryKind: FrameDeliveryKind | null } | { kind: "fault"; fault: FrameAssemblyFault };

export interface FrameAssemblyFault {
  deliveryKind?: FrameDeliveryKind;
  reasonCode:
    | "proto.frameAssemblyMetadataMismatch"
    | "proto.frameAssemblyOrdinalConflict"
    | "proto.frameAssemblySuperseded"
    | "proto.frameEnvelopeTooLarge"
    | "proto.frameAssemblyTooLarge"
    | "proto.frameFragmentCountExceeded"
    | "proto.frameAssemblyInvalidBase64"
    | "proto.frameAssemblyConcurrentLimit"
    | "proto.frameAssemblyBudgetExceeded"
    | "proto.frameAssemblyFragmentConflict"
    | "proto.frameAssemblyLengthMismatch"
    | "proto.frameAssemblyChecksumMismatch"
    | "proto.frameAssemblyInvalidUtf8"
    | "proto.frameAssemblyInvalidJson"
    | "proto.frameAssemblyInvalidPayload"
    | "proto.frameAssemblyTimedOut";
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
}

interface FrameAssembly {
  deliveryKind: FrameDeliveryKind | null;
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
  fragmentCount: number;
  logicalBytes: number;
  checksum: { algorithm: "crc32"; value: string };
  fragments: Array<Uint8Array | undefined>;
  receivedCount: number;
  decodedBytes: number;
  firstSeenAt: number;
}

/** 协议限额（原 bi：宿主可配） */
export declare const protocolLimits: {
  logicalFrameAssemblyMaxBytes: number;
  logicalFrameAssemblyMaxFragments: number;
  logicalFrameAssemblyMaxConcurrent: number;
  logicalFrameAssemblyMaxStagedBytes: number;
  logicalFrameAssemblyTimeoutMs: number;
  maxFrameBytes: number;
};

declare function resolveBudgetLimit(value: number | undefined, fallback: number, name: string): number; // 原 yS
declare function assemblyRouteKey(topic: string, subscriptionId: string): string; // 原 _S
declare function normalizeDeliveryKind(raw: unknown): FrameDeliveryKind | null; // 原 gS
declare function frameEnvelopeMaxBytes(frame: LogicalFrame): { maxBytes: number }; // 原 pS
declare function hasCompleteFrameShape(frame: LogicalFrame, requiredFields: Set<string>): boolean; // 原 hS + Uke
declare function hasFragmentFrameShape(frame: LogicalFrame): boolean; // 原 Kke
declare function frameMetadataMatches(payload: unknown, meta: { logicalFrameId: string; logicalFrameOrdinal: number }): boolean; // 原 vS
declare function decodeFrameBase64(base64: string | undefined): Uint8Array | null; // 原 Tte
declare function bytesEqual(a: Uint8Array, b: Uint8Array): boolean; // 原 qke

/**
 * 原 bS：流帧装配器。按 (topic, subscriptionId) 路由聚合分片帧：
 * 序号单调 + 代际结算（settledByRoute）+ 预算（总量/分片数/并发/暂存字节/超时）
 * + crc32 校验 + utf-8/JSON/schema 三级解析。故障一律以 fault 事件返回。
 */
export class FrameAssembler<T> {
  private assemblies = new Map<string, FrameAssembly>();
  private settledByRoute = new Map<string, { logicalFrameId: string; logicalFrameOrdinal: number }>();
  private stagedDecodedBytes = 0;
  private maxAssemblyBytes: number;
  private maxFragments: number;
  private maxConcurrentAssemblies: number;
  private maxStagedDecodedBytes: number;
  private timeoutMs: number;
  private maxPhysicalFrameBytes: number;

  constructor(
    private frameSchema: { safeParse(input: unknown): { success: boolean; data?: T } },
    options: Partial<{ maxAssemblyBytes: number; maxFragments: number; maxConcurrentAssemblies: number; maxStagedDecodedBytes: number; timeoutMs: number; maxPhysicalFrameBytes: number }> = {},
  ) {
    this.maxAssemblyBytes = resolveBudgetLimit(options.maxAssemblyBytes, protocolLimits.logicalFrameAssemblyMaxBytes, "maxAssemblyBytes");
    this.maxFragments = resolveBudgetLimit(options.maxFragments, protocolLimits.logicalFrameAssemblyMaxFragments, "maxFragments");
    this.maxConcurrentAssemblies = resolveBudgetLimit(options.maxConcurrentAssemblies, protocolLimits.logicalFrameAssemblyMaxConcurrent, "maxConcurrentAssemblies");
    this.maxStagedDecodedBytes = resolveBudgetLimit(options.maxStagedDecodedBytes, protocolLimits.logicalFrameAssemblyMaxStagedBytes, "maxStagedDecodedBytes");
    this.timeoutMs = resolveBudgetLimit(options.timeoutMs, protocolLimits.logicalFrameAssemblyTimeoutMs, "timeoutMs");
    this.maxPhysicalFrameBytes = resolveBudgetLimit(options.maxPhysicalFrameBytes, protocolLimits.maxFrameBytes, "maxPhysicalFrameBytes");
  }

  accept(frame: LogicalFrame, now: number = Date.now()): Array<FrameAssemblyEvent<T>> {
    const events: Array<FrameAssemblyEvent<T>> = this.expire(now);
    const routeKey = assemblyRouteKey(frame.topic, frame.subscriptionId);
    if (!Number.isSafeInteger(frame.logicalFrameOrdinal) || frame.logicalFrameOrdinal < 1) {
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const settled = this.settledByRoute.get(routeKey);
    if (settled) {
      if (frame.logicalFrameOrdinal < settled.logicalFrameOrdinal) return events;
      if (frame.logicalFrameOrdinal === settled.logicalFrameOrdinal) {
        if (frame.logicalFrameId !== settled.logicalFrameId) events.push(this.fault(frame, "proto.frameAssemblyOrdinalConflict"));
        return events;
      }
    }
    const deliveryKind = normalizeDeliveryKind(frame.deliveryKind);
    if (deliveryKind === "recovery") {
      for (let index = events.length - 1; index >= 0; --index) {
        const event = events[index];
        if (
          event?.kind === "fault" &&
          event.fault.topic === frame.topic &&
          event.fault.subscriptionId === frame.subscriptionId &&
          event.fault.logicalFrameOrdinal < frame.logicalFrameOrdinal
        ) {
          events.splice(index, 1);
        }
      }
    }
    const existing = this.assemblies.get(routeKey);
    if (existing) {
      if (frame.logicalFrameOrdinal < existing.logicalFrameOrdinal) return events;
      if (frame.logicalFrameOrdinal === existing.logicalFrameOrdinal) {
        if (frame.logicalFrameId !== existing.logicalFrameId) {
          this.release(routeKey, existing);
          this.settle(routeKey, existing);
          events.push(this.fault(frame, "proto.frameAssemblyOrdinalConflict"));
        }
        return events;
      }
      this.release(routeKey, existing);
      this.settle(routeKey, existing);
      if (deliveryKind !== "recovery") events.push(this.fault(existing, "proto.frameAssemblySuperseded"));
    }
    if (deliveryKind === null) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    if (frame.kind === "complete") {
      if (!hasCompleteFrameShape(frame, COMPLETE_FRAME_REQUIRED_FIELDS) || !Object.prototype.hasOwnProperty.call(frame, "frame")) {
        this.releaseAndSettle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      if (frameEnvelopeMaxBytes(frame).maxBytes > this.maxPhysicalFrameBytes) {
        this.releaseAndSettle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameEnvelopeTooLarge"));
        return events;
      }
      const assembly = this.assemblies.get(routeKey);
      if (assembly) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(assembly, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      if (new TextEncoder().encode(JSON.stringify(frame.frame)).byteLength > this.maxAssemblyBytes) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyTooLarge"));
        return events;
      }
      if (!frameMetadataMatches(frame.frame, frame)) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      const parsed = this.frameSchema.safeParse(frame.frame);
      if (parsed.success) {
        this.settle(routeKey, frame);
        events.push({ kind: "complete", frame: parsed.data as T, deliveryKind });
      } else {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyInvalidPayload"));
      }
      return events;
    }
    if (!hasFragmentFrameShape(frame)) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    if (frameEnvelopeMaxBytes(frame).maxBytes > this.maxPhysicalFrameBytes) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameEnvelopeTooLarge"));
      return events;
    }
    if ((frame.fragmentCount ?? 0) > this.maxFragments) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameFragmentCountExceeded"));
      return events;
    }
    if ((frame.logicalBytes ?? 0) > this.maxAssemblyBytes) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyTooLarge"));
      return events;
    }
    if (
      !Number.isInteger(frame.fragmentCount ?? NaN) ||
      (frame.fragmentCount ?? 0) < 1 ||
      !Number.isInteger(frame.fragmentIndex ?? NaN) ||
      (frame.fragmentIndex ?? 0) < 0 ||
      (frame.fragmentIndex ?? 0) >= (frame.fragmentCount ?? 0) ||
      !Number.isInteger(frame.logicalBytes ?? NaN) ||
      (frame.logicalBytes ?? 0) < 1 ||
      (frame.fragmentCount ?? 0) > (frame.logicalBytes ?? 0) ||
      frame.checksum?.algorithm !== "crc32" ||
      !/^[0-9a-f]{8}$/u.test(frame.checksum?.value ?? "")
    ) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const decoded = decodeFrameBase64(frame.dataBase64);
    if (!decoded) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyInvalidBase64"));
      return events;
    }
    let assembly = this.assemblies.get(routeKey);
    if (assembly) {
      if (
        assembly.fragmentCount !== frame.fragmentCount ||
        assembly.deliveryKind !== deliveryKind ||
        assembly.logicalBytes !== frame.logicalBytes ||
        assembly.checksum.algorithm !== frame.checksum!.algorithm ||
        assembly.checksum.value !== frame.checksum!.value
      ) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
    } else {
      if (this.assemblies.size >= this.maxConcurrentAssemblies) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyConcurrentLimit"));
        return events;
      }
      if (this.stagedDecodedBytes + decoded.byteLength > this.maxStagedDecodedBytes) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyBudgetExceeded"));
        return events;
      }
      assembly = {
        deliveryKind,
        logicalFrameId: frame.logicalFrameId,
        logicalFrameOrdinal: frame.logicalFrameOrdinal,
        topic: frame.topic,
        subscriptionId: frame.subscriptionId,
        fragmentCount: frame.fragmentCount!,
        logicalBytes: frame.logicalBytes!,
        checksum: { algorithm: "crc32", value: frame.checksum!.value },
        fragments: Array.from({ length: frame.fragmentCount! }, () => undefined),
        receivedCount: 0,
        decodedBytes: 0,
        firstSeenAt: now,
      };
      this.assemblies.set(routeKey, assembly);
    }
    const duplicate = assembly.fragments[frame.fragmentIndex!];
    if (duplicate) {
      if (!bytesEqual(duplicate, decoded)) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(frame, "proto.frameAssemblyFragmentConflict"));
      }
      return events;
    }
    if (this.stagedDecodedBytes + decoded.byteLength > this.maxStagedDecodedBytes) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      events.push(this.fault(frame, "proto.frameAssemblyBudgetExceeded"));
      return events;
    }
    if (assembly.decodedBytes + decoded.byteLength > assembly.logicalBytes) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      events.push(this.fault(frame, "proto.frameAssemblyLengthMismatch"));
      return events;
    }
    assembly.fragments[frame.fragmentIndex!] = decoded;
    assembly.receivedCount += 1;
    assembly.decodedBytes += decoded.byteLength;
    this.stagedDecodedBytes += decoded.byteLength;
    if (assembly.receivedCount !== assembly.fragmentCount) return events;
    this.release(routeKey, assembly);
    if (assembly.decodedBytes !== assembly.logicalBytes) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyLengthMismatch"));
      return events;
    }
    const combined = new Uint8Array(assembly.decodedBytes);
    let offset = 0;
    for (const fragment of assembly.fragments) {
      if (!fragment) {
        this.settle(routeKey, assembly);
        events.push(this.fault(assembly, "proto.frameAssemblyLengthMismatch"));
        return events;
      }
      combined.set(fragment, offset);
      offset += fragment.byteLength;
    }
    if (crc32Hex(combined) !== assembly.checksum.value) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyChecksumMismatch"));
      return events;
    }
    let json: string;
    try {
      json = new TextDecoder("utf-8", { fatal: true }).decode(combined);
    } catch {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidUtf8"));
      return events;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(json);
    } catch {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidJson"));
      return events;
    }
    if (!frameMetadataMatches(payload, assembly)) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const parsed = this.frameSchema.safeParse(payload);
    if (parsed.success) {
      this.settle(routeKey, assembly);
      events.push({ kind: "complete", frame: parsed.data as T, deliveryKind: assembly.deliveryKind });
    } else {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidPayload"));
    }
    return events;
  }

  /** 超时装配清算（返回 TimedOut 故障） */
  expire(now: number = Date.now()): Array<FrameAssemblyEvent<T>> {
    const faults: Array<FrameAssemblyEvent<T>> = [];
    for (const [routeKey, assembly] of this.assemblies) {
      if (now - assembly.firstSeenAt < this.timeoutMs) continue;
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      faults.push(this.fault(assembly, "proto.frameAssemblyTimedOut"));
    }
    return faults;
  }

  discard(topic: string, subscriptionId: string): void {
    const routeKey = assemblyRouteKey(topic, subscriptionId);
    const assembly = this.assemblies.get(routeKey);
    if (assembly) this.release(routeKey, assembly);
    this.settledByRoute.delete(routeKey);
  }

  abort(topic: string, subscriptionId: string): void {
    const routeKey = assemblyRouteKey(topic, subscriptionId);
    const assembly = this.assemblies.get(routeKey);
    if (assembly) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
    }
  }

  clear(): void {
    this.assemblies.clear();
    this.settledByRoute.clear();
    this.stagedDecodedBytes = 0;
  }

  getStats(): { assemblies: number; stagedDecodedBytes: number } {
    return { assemblies: this.assemblies.size, stagedDecodedBytes: this.stagedDecodedBytes };
  }

  get nextExpiryAt(): number | null {
    let earliest: number | null = null;
    for (const assembly of this.assemblies.values()) {
      const expiry = assembly.firstSeenAt + this.timeoutMs;
      if (earliest === null || expiry < earliest) earliest = expiry;
    }
    return earliest;
  }

  private release(routeKey: string, assembly: FrameAssembly): void {
    if (this.assemblies.get(routeKey) !== assembly) return;
    this.assemblies.delete(routeKey);
    this.stagedDecodedBytes -= assembly.decodedBytes;
  }

  private settle(routeKey: string, frame: { logicalFrameId: string; logicalFrameOrdinal: number }): void {
    const known = this.settledByRoute.get(routeKey);
    if (known && known.logicalFrameOrdinal > frame.logicalFrameOrdinal) return;
    this.settledByRoute.set(routeKey, { logicalFrameId: frame.logicalFrameId, logicalFrameOrdinal: frame.logicalFrameOrdinal });
  }

  private releaseAndSettle(routeKey: string, frame: LogicalFrame): void {
    const assembly = this.assemblies.get(routeKey);
    if (assembly && assembly.logicalFrameOrdinal === frame.logicalFrameOrdinal && assembly.logicalFrameId === frame.logicalFrameId) {
      this.release(routeKey, assembly);
    }
    this.settle(routeKey, frame);
  }

  private fault(source: LogicalFrame | FrameAssembly, reasonCode: FrameAssemblyFault["reasonCode"]): FrameAssemblyEvent<T> {
    const deliveryKind = normalizeDeliveryKind(source.deliveryKind);
    return {
      kind: "fault",
      fault: {
        ...(deliveryKind === null ? {} : { deliveryKind }),
        reasonCode,
        logicalFrameId: source.logicalFrameId,
        logicalFrameOrdinal: source.logicalFrameOrdinal,
        topic: source.topic,
        subscriptionId: source.subscriptionId,
      },
    };
  }
}

const COMPLETE_FRAME_REQUIRED_FIELDS = new Set(["logicalFrameId", "logicalFrameOrdinal", "topic", "subscriptionId", "deliveryKind", "kind"]); // 原 Uke
