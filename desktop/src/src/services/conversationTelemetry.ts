// A0-S4-5: 自 modules/services.tsx §F 原样迁入（会话遥测/归因监督器 + fact 助手 + BoundedStringSet，原 js 41808–42596；原文件现为薄 re-export shim）。
import { buildCompactionDetail, buildMessageCompletionDetail, buildPromptSeedDetail, clearConversationWaitState, currentConversationModel, extractPromptSeedFromTurnStarted, extractStepSourceDetail, finalizeConversationSteps, lastReportedMessageId, purgeConversationTiming, purgePromptSeedTiming, recordComposerFocusSink, recordComposerTextChangeSink, recordConversationResult, recordDuration, recordModelRequestStatus, recordPermissionRequested, recordPermissionResolved, recordProviderTtft, recordStreamChunkForeground, recordSubagentToolAttribution, recordToolPerformance, recordTtft, recordTurnStarted, recordUsageDelta, reportTelemetry, reportVisibleChatErrorSink, resolveBusinessRecoveryAction, resolveCompactionModelName } from '../modules/StoresDeep';
import type { TelemetryPlatform, TelemetryReport, TurnStartedFact } from '../modules/StoresDeep';
/* ============================================================================
 * F. 会话遥测监督（原 41808–42596）
 * ----------------------------------------------------------------------------
 * MODULE-MAP §2.6 记为“权限状态机”；按实现更正：这是 v4 会话遥测/归因监督器
 * （提示词种子 → 轮次 → 模型请求/工具/子代理/压缩/终端 的事实归因与上报，
 * 含前台判定、去重、缓冲与延迟终端处理）。permission.lifecycle 事实的处理
 * （SPe/CPe 权限等待计时）是其中一支。
 * ==========================================================================*/

const BOUNDED_SET_CAPACITY = 2000; // 原 lT
const MAX_PENDING_FACTS_PER_COMMAND = 128; // 原 sFe
const MAX_PENDING_FACT_COMMANDS = 200; // 原 cFe

/** 原 uT：有界字符串去重集（FIFO 驱逐） */
export class BoundedStringSet {
  private keys = new Set<string>();
  /** 返回 true 表示首次出现（已记住） */
  remember(key: string): boolean {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    if (this.keys.size > BOUNDED_SET_CAPACITY) {
      const oldest = this.keys.values().next().value;
      if (typeof oldest === "string") this.keys.delete(oldest);
    }
    return true;
  }
  clear(): void {
    this.keys.clear();
  }
}

/* --- fact 类型与助手 --- */

export interface AgentFact {
  kind:
    | "turn.started"
    | "turn.terminal"
    | "model.request.status"
    | "stream.chunk"
    | "tool.lifecycle"
    | "permission.lifecycle"
    | "usage.delta"
    | "subagent.lifecycle"
    | "compaction.terminal"
    | string;
  eventId: string;
  sessionId: string;
  sourceCommandId?: string;
  turnId?: string;
  [key: string]: unknown;
}

/* TelemetryPlatform 已收敛至 StoresDeep 规范型（文件头 import type + re-export；
   本地原索引签名型缺 reportTelemetryEvent/reportArmsCustomEvent，故按规范型收敛） */

/** 原 dT：model.request.status → task_network_debug_status 明细 */
function buildNetworkDebugStatus(fact: AgentFact): { statusType: string; [key: string]: unknown } {
  return {
    type: "task_network_debug_status",
    taskId: fact.sessionId,
    traceId: fact.eventId,
    ...(fact.sourceCommandId ? { inputId: fact.sourceCommandId } : {}),
    ...(fact.queryId ? { queryId: fact.queryId } : {}),
    eventKey: fact.eventId,
    eventId: fact.eventId,
    statusType: fact.status as string,
    requestId: fact.requestId,
    providerId: fact.providerId,
    modelId: fact.modelId,
    providerKind: fact.providerKind,
    transport: fact.transport,
    baseURL: fact.providerHostname ? `https://${fact.providerHostname}` : undefined,
    querySource: fact.querySource,
    attempt: fact.attempt,
    maxAttempts: fact.maxAttempts,
    nextAttempt: fact.nextAttempt,
    retryable: fact.retryable,
    statusCode: fact.statusCode,
    durationMs: fact.durationMs,
    delayMs: fact.delayMs,
    idleMs: fact.idleMs,
    timeoutMs: fact.timeoutMs,
    reason: fact.reason,
    requestHeaders: {},
    responseHeaders: {},
    requestHeaderCount: 0,
    responseHeaderCount: 0,
  };
}

/** 原 fT：usage.delta → 用量结构 */
function extractUsageDelta(fact: AgentFact): TokenUsage {
  return {
    inputTokens: fact.inputTokens as number,
    outputTokens: fact.outputTokens as number,
    totalTokens: fact.totalTokens as number,
    reasoningTokens: fact.reasoningTokens as number | undefined,
    cachedInputTokens: fact.cacheReadTokens as number | undefined,
    cachedWriteInputTokens: fact.cacheWriteTokens as number | undefined,
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  cachedWriteInputTokens?: number;
}

/** 原 pT：provider/model → 完整模型名 */
function resolveModelName(providerId?: string, modelId?: string): string {
  const provider = providerId?.trim() ?? "";
  const model = modelId?.trim() ?? "";
  if (!provider) return model;
  return model ? (model.includes("/") ? model : `${provider}/${model}`) : "";
}

/** 原 fFe：用量累加 */
function mergeTokenUsage(base: TokenUsage | null, delta: TokenUsage): TokenUsage {
  return base
    ? {
        inputTokens: base.inputTokens + delta.inputTokens,
        outputTokens: base.outputTokens + delta.outputTokens,
        totalTokens: base.totalTokens + delta.totalTokens,
        reasoningTokens: (base.reasoningTokens ?? 0) + (delta.reasoningTokens ?? 0),
        cachedInputTokens: (base.cachedInputTokens ?? 0) + (delta.cachedInputTokens ?? 0),
        cachedWriteInputTokens: (base.cachedWriteInputTokens ?? 0) + (delta.cachedWriteInputTokens ?? 0),
      }
    : { ...delta };
}

/** 原 pFe：工具超时判定 */
function isToolTimeoutFact(fact: AgentFact): boolean {
  return fact.errorCode === "tool_timeout" || (fact.performance as { timedOut?: boolean } | undefined)?.timedOut === true;
}

/** 原 mFe：终端状态归一 */
function mapTerminalStatus(status: string): "success" | "user_interrupt" | "fail" {
  return status === "success" ? "success" : status === "interrupted" ? "user_interrupt" : "fail";
}

/** 原 mT */
function finiteNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/* --- 遥测下沉函数（原实现分散于 41500–41800 区；接口级声明） --- */


/* TelemetryReport 已收敛至 StoresDeep 规范型（文件头 import type + re-export；
   本地原 eventExtraDetail 必填收窄由规范型可选 + 索引签名覆盖） */

interface PromptLifecycle {
  sessionId: string;
  sourceCommandId: string;
  taskKey: string;
  sendTime: number;
  foregroundFirstTokenAt: number | null;
  legacyFirstTokenObserved: boolean;
  active: boolean;
  turnId?: string;
  lastErrorMessage?: string;
  startedToolCallIds: Set<string>;
  stepSourceDetail: Record<string, string>;
}

interface ForegroundSubagentUsage {
  agentId?: string;
  parentCommandId: string;
  parentToolCallId: string;
  requestIds: string[];
  requestCount: number;
  modelName: string;
  modelProvider: string;
  providerName: string;
  usage: TokenUsage | null;
  stopped: boolean;
  pendingFinalizedSteps: Array<{ step: { eventExtraDetail: Record<string, string> }; extraDetail?: Record<string, string> }>;
}

/**
 * 原 hT（js 41893–42596）：ConversationTelemetrySupervisor。
 * 按工作区作用域聚合会话事实流：
 *  - acceptPromptSeed：提示词发送（send_btn 上报 + 生命周期建档 + 积压事实排空）
 *  - attachForeground/detachForeground：前台会话引用计数
 *  - handleFact：事实分派（去重 → 子代理/压缩/轮次/归因 → 缓冲或处理）
 *  - handleTerminal：轮次终端（完成/错误上报 + 计时臂 + 生命周期清理）
 *  - enqueueReport：串行上报队列（reportTail 链）
 */
export class ConversationTelemetrySupervisor {
  private platform: TelemetryPlatform;
  private workspaceScopeKey: string;
  private now: () => number;
  private eventIds = new BoundedStringSet();
  private acceptedCommandIds = new BoundedStringSet();
  private terminalKeys = new BoundedStringSet();
  private compactionKeys = new BoundedStringSet();
  private foregroundOwnerSessions = new Map<Record<string, unknown>, string>();
  private foregroundSessionCounts = new Map<string, number>();
  private lifecyclesByCommandId = new Map<string, PromptLifecycle>();
  private activeCommandBySessionId = new Map<string, string>();
  private commandIdByTurnKey = new Map<string, string>();
  private pendingFactsByCommandId = new Map<string, Array<{ fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }>>();
  private foregroundSubagentUsageByChildSession = new Map<string, ForegroundSubagentUsage>();
  private deferredTerminalsByCommandId = new Map<string, { lifecycle: PromptLifecycle; fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }>();
  private reportTail: Promise<void> | null = null;
  private disposed = false;

  constructor(args: { platform: TelemetryPlatform; workspaceScopeKey: string; now?: () => number }) {
    this.platform = args.platform;
    this.workspaceScopeKey = args.workspaceScopeKey;
    this.now = args.now ?? Date.now;
  }

  recordComposerFocus(): void {
    if (!this.disposed) recordComposerFocusSink(this.workspaceScopeKey, this.now());
  }

  recordComposerTextChange(change: { length: number }): void {
    if (!this.disposed) recordComposerTextChangeSink(this.workspaceScopeKey, change, this.now());
  }

  acceptPromptSeed(seed: { sourceCommandId: string; sessionId: string; sendTime: number; extraDetail?: Record<string, string> }, options: { reportSendButton?: boolean } = {}): void {
    if (this.disposed || !this.acceptedCommandIds.remember(seed.sourceCommandId)) return;
    const taskKey = this.taskKey(seed.sessionId);
    const detail = buildPromptSeedDetail({
      workspacePath: this.workspaceScopeKey,
      taskId: taskKey,
      messageId: seed.sourceCommandId,
      sendTime: seed.sendTime,
      extraDetail: seed.extraDetail,
    });
    this.lifecyclesByCommandId.set(seed.sourceCommandId, {
      sessionId: seed.sessionId,
      sourceCommandId: seed.sourceCommandId,
      taskKey,
      sendTime: seed.sendTime,
      foregroundFirstTokenAt: null,
      legacyFirstTokenObserved: false,
      active: false,
      startedToolCallIds: new Set(),
      stepSourceDetail: extractStepSourceDetail(seed.extraDetail),
    });
    if (this.lifecyclesByCommandId.size > BOUNDED_SET_CAPACITY) {
      const evictable = [...this.lifecyclesByCommandId].find(([commandId, lifecycle]) => commandId !== seed.sourceCommandId && !lifecycle.active);
      if (evictable) {
        this.lifecyclesByCommandId.delete(evictable[0]);
        purgePromptSeedTiming(evictable[1].taskKey, evictable[1].sourceCommandId);
      }
    }
    if (options.reportSendButton !== false) {
      this.enqueueReport({
        elementName: "send_btn",
        eventRegion: "app",
        eventType: "ck",
        eventExtraDetail: detail,
        talkId: seed.sessionId,
        messageId: seed.sourceCommandId,
      });
    }
    this.drainPendingFacts(seed.sourceCommandId);
  }

  attachForeground(paneKey: Record<string, unknown>, sessionId: string): () => void {
    if (this.disposed) return () => undefined;
    const owner = this.foregroundOwnerSessions.get(paneKey);
    if (owner === sessionId) return () => this.detachForeground(paneKey);
    if (owner) this.decrementForeground(owner);
    this.foregroundOwnerSessions.set(paneKey, sessionId);
    this.foregroundSessionCounts.set(sessionId, (this.foregroundSessionCounts.get(sessionId) ?? 0) + 1);
    return () => this.detachForeground(paneKey);
  }

  handleFact(fact: AgentFact): void {
    const dedupeKey = `${fact.sessionId}\u0000${fact.eventId}`;
    if (this.disposed || !this.eventIds.remember(dedupeKey)) return;
    const receivedAt = this.now();
    const foreground = this.isForeground(fact.sessionId);
    if (fact.kind === "model.request.status") recordModelRequestStatus(this.taskKey(fact.sessionId), buildNetworkDebugStatus(fact), fact.sourceCommandId ?? "");
    if (fact.kind === "subagent.lifecycle") {
      this.handleSubagentLifecycle(fact);
      return;
    }
    const subagentUsage = this.foregroundSubagentUsageByChildSession.get(fact.sessionId);
    if (subagentUsage) {
      this.handleForegroundSubagentFact(subagentUsage, fact);
      return;
    }
    if (fact.kind === "compaction.terminal") {
      this.handleCompaction(fact, foreground);
      return;
    }
    if (fact.kind === "turn.started") {
      const seed = extractPromptSeedFromTurnStarted(fact as unknown as TurnStartedFact);
      if (seed) this.acceptPromptSeed(seed, { reportSendButton: false });
    }
    const commandId = this.resolveCommandId(fact);
    if (!commandId) return;
    const lifecycle = this.lifecyclesByCommandId.get(commandId);
    const blockedByDeferredTerminal = lifecycle !== undefined && fact.kind === "turn.started" && this.hasDeferredTerminalForTask(lifecycle.taskKey, lifecycle.sourceCommandId);
    if (!lifecycle || blockedByDeferredTerminal || (!lifecycle.active && fact.kind !== "turn.started")) {
      this.bufferFact(commandId, { fact, receivedAt, foregroundAtReceipt: foreground });
      return;
    }
    this.processPromptFact(lifecycle, fact, receivedAt, foreground);
    if (fact.kind === "turn.started") this.drainPendingFacts(commandId);
  }

  private handleSubagentLifecycle(fact: AgentFact): void {
    if (fact.phase === "spawned") {
      if (fact.background || !fact.parentToolCallId) return;
      const commandId = this.resolveCommandId(fact);
      if (!commandId || !this.lifecyclesByCommandId.get(commandId)?.active) return;
      const usage: ForegroundSubagentUsage = {
        agentId: fact.agentId as string | undefined,
        parentCommandId: commandId,
        parentToolCallId: fact.parentToolCallId as string,
        requestIds: [],
        requestCount: 0,
        modelName: "",
        modelProvider: "",
        providerName: "",
        usage: null,
        stopped: false,
        pendingFinalizedSteps: [],
      };
      this.foregroundSubagentUsageByChildSession.set(fact.childSessionId as string, usage);
      this.syncForegroundSubagentToolAttribution(usage);
      return;
    }
    const usage = this.foregroundSubagentUsageByChildSession.get(fact.sessionId);
    if (!usage) return;
    if (fact.background) {
      usage.stopped = true;
      this.reportPendingForegroundSubagentSteps(usage, false);
      this.flushDeferredTerminal(usage.parentCommandId);
      return;
    }
    this.syncForegroundSubagentToolAttribution(usage);
    usage.stopped = true;
    this.reportPendingForegroundSubagentSteps(usage);
    this.flushDeferredTerminal(usage.parentCommandId);
  }

  private handleForegroundSubagentFact(usage: ForegroundSubagentUsage, fact: AgentFact): void {
    if (fact.kind === "model.request.status") {
      if (fact.status !== "model_request_started") return;
      usage.modelName = resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined);
      usage.modelProvider = (fact.providerId as string) ?? "";
      usage.providerName = (fact.providerHostname as string) ?? "";
      this.syncForegroundSubagentToolAttribution(usage);
      return;
    }
    if (fact.kind === "usage.delta") {
      usage.usage = mergeTokenUsage(usage.usage, extractUsageDelta(fact));
      usage.requestCount += 1;
      if (fact.requestId && !usage.requestIds.includes(fact.requestId as string)) usage.requestIds.push(fact.requestId as string);
      if (fact.providerId || fact.modelId) {
        usage.modelName = resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined);
        usage.modelProvider = (fact.providerId as string) ?? usage.modelProvider;
        usage.providerName = (fact.providerHostname as string) ?? usage.providerName;
      }
      this.syncForegroundSubagentToolAttribution(usage);
    }
  }

  private syncForegroundSubagentToolAttribution(usage: ForegroundSubagentUsage): void {
    const lifecycle = this.lifecyclesByCommandId.get(usage.parentCommandId);
    if (!lifecycle?.active) return;
    recordSubagentToolAttribution({
      taskId: lifecycle.taskKey,
      toolCallId: usage.parentToolCallId,
      requestIds: usage.requestIds,
      requestCount: usage.requestCount,
      modelName: usage.modelName,
      modelProvider: usage.modelProvider,
      providerName: usage.providerName,
      agentId: usage.agentId,
      ...(usage.usage ? { usage: usage.usage } : {}),
    });
  }

  private reportPendingForegroundSubagentSteps(usage: ForegroundSubagentUsage, applyAttribution = true): void {
    const lifecycle = this.lifecyclesByCommandId.get(usage.parentCommandId);
    if (!lifecycle?.active) return;
    for (const pending of usage.pendingFinalizedSteps.splice(0)) {
      if (applyAttribution) this.applyForegroundSubagentAttribution(pending.step, usage);
      this.reportFinalizedSteps(lifecycle, [pending.step], pending.extraDetail);
    }
  }

  private applyForegroundSubagentAttribution(step: { eventExtraDetail: Record<string, string> }, usage: ForegroundSubagentUsage): void {
    const detail = step.eventExtraDetail;
    detail.agent_id = usage.agentId ?? "";
    if (usage.modelName || usage.modelProvider || usage.providerName) {
      detail.model_name = usage.modelName;
      detail.model_provider = usage.modelProvider;
      detail.provider_name = usage.providerName;
    }
    if (usage.usage) {
      detail.model_request_id = usage.requestIds.length === 1 ? (usage.requestIds[0] ?? "") : "";
      detail.model_request_count = String(usage.requestCount);
      detail.token_usage_scope = "subagent_requests";
      detail.input_tokens = String(usage.usage.inputTokens);
      detail.output_tokens = String(usage.usage.outputTokens);
      detail.reasoning_tokens = String(usage.usage.reasoningTokens ?? 0);
      detail.cached_tokens = String(usage.usage.cachedInputTokens ?? 0);
      detail.cache_write_input_tokens = String(usage.usage.cachedWriteInputTokens ?? 0);
      detail.total_tokens = String(usage.usage.totalTokens);
    }
  }

  private flushDeferredTerminal(commandId: string): void {
    const deferred = this.deferredTerminalsByCommandId.get(commandId);
    if (!deferred) return;
    if ([...this.foregroundSubagentUsageByChildSession.values()].some((usage) => usage.parentCommandId === commandId && !usage.stopped)) return;
    this.deferredTerminalsByCommandId.delete(commandId);
    this.handleTerminal(deferred.lifecycle, deferred.fact, deferred.receivedAt, deferred.foregroundAtReceipt);
  }

  reportVisibleChatError(payload: Record<string, unknown> & { error?: unknown }): void {
    if (this.disposed) return;
    reportVisibleChatErrorSink(
      this.platform,
      { ...payload, providerBusinessRecoveryAction: resolveBusinessRecoveryAction(payload.error as { code?: string | null; message?: string | null }) } as unknown as Parameters<
        typeof reportVisibleChatErrorSink
      >[1],
    );
  }

  getPendingCommandCountForTest(): number {
    return this.pendingFactsByCommandId.size;
  }

  async flushReportsForTest(): Promise<void> {
    await this.reportTail;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const lifecycle of this.lifecyclesByCommandId.values()) {
      clearConversationWaitState(lifecycle.taskKey);
      purgeConversationTiming(lifecycle.taskKey);
    }
    this.eventIds.clear();
    this.acceptedCommandIds.clear();
    this.terminalKeys.clear();
    this.compactionKeys.clear();
    this.foregroundSubagentUsageByChildSession.clear();
    this.deferredTerminalsByCommandId.clear();
    this.foregroundOwnerSessions.clear();
    this.foregroundSessionCounts.clear();
    this.lifecyclesByCommandId.clear();
    this.activeCommandBySessionId.clear();
    this.commandIdByTurnKey.clear();
    this.pendingFactsByCommandId.clear();
  }

  private enqueueReport(report: TelemetryReport): void {
    const send = () => reportTelemetry(this.platform, report, "v4-conversation-telemetry");
    const chained = this.reportTail ? this.reportTail.then(send) : send();
    this.reportTail = chained;
    chained.then(() => {
      if (this.reportTail === chained) this.reportTail = null;
    });
  }

  private taskKey(sessionId: string): string {
    return `${this.workspaceScopeKey}\u0000${sessionId}`;
  }

  private isForeground(sessionId: string): boolean {
    return (this.foregroundSessionCounts.get(sessionId) ?? 0) > 0;
  }

  private detachForeground(paneKey: Record<string, unknown>): void {
    const owner = this.foregroundOwnerSessions.get(paneKey);
    if (!owner) return;
    this.foregroundOwnerSessions.delete(paneKey);
    this.decrementForeground(owner);
  }

  private decrementForeground(sessionId: string): void {
    const remaining = (this.foregroundSessionCounts.get(sessionId) ?? 1) - 1;
    if (remaining > 0) {
      this.foregroundSessionCounts.set(sessionId, remaining);
      return;
    }
    this.foregroundSessionCounts.delete(sessionId);
    clearConversationWaitState(this.taskKey(sessionId));
  }

  private resolveCommandId(fact: AgentFact): string | undefined {
    if (fact.sourceCommandId) return fact.sourceCommandId;
    if (fact.turnId) return this.commandIdByTurnKey.get(`${fact.sessionId}\u0000${fact.turnId}`);
    return this.activeCommandBySessionId.get(fact.sessionId);
  }

  private bufferFact(commandId: string, entry: { fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }): void {
    const pending = this.pendingFactsByCommandId.get(commandId) ?? [];
    pending.push(entry);
    if (pending.length > MAX_PENDING_FACTS_PER_COMMAND) {
      const dropIndex = pending.findIndex((item) => item.fact.kind === "stream.chunk" && !item.fact.firstChunk);
      const fallbackIndex = dropIndex >= 0 ? dropIndex : pending.findIndex((item) => item.fact.kind !== "turn.started");
      pending.splice(fallbackIndex >= 0 ? fallbackIndex : 0, 1);
    }
    this.pendingFactsByCommandId.delete(commandId);
    this.pendingFactsByCommandId.set(commandId, pending);
    if (this.pendingFactsByCommandId.size > MAX_PENDING_FACT_COMMANDS) {
      const oldest = this.pendingFactsByCommandId.keys().next().value;
      if (typeof oldest === "string") this.pendingFactsByCommandId.delete(oldest);
    }
  }

  private drainPendingFacts(commandId: string): void {
    const lifecycle = this.lifecyclesByCommandId.get(commandId);
    const pending = this.pendingFactsByCommandId.get(commandId);
    if (!lifecycle || !pending || pending.length === 0) return;
    this.pendingFactsByCommandId.delete(commandId);
    for (const entry of pending) {
      if (!this.lifecyclesByCommandId.has(commandId)) return;
      if (entry.fact.kind === "turn.started" && this.hasDeferredTerminalForTask(lifecycle.taskKey, lifecycle.sourceCommandId)) {
        this.bufferFact(commandId, entry);
        continue;
      }
      if (!lifecycle.active && entry.fact.kind !== "turn.started") {
        this.bufferFact(commandId, entry);
        continue;
      }
      this.processPromptFact(lifecycle, entry.fact, entry.receivedAt, entry.foregroundAtReceipt);
    }
  }

  private hasDeferredTerminalForTask(taskKey: string, exceptCommandId?: string): boolean {
    return [...this.deferredTerminalsByCommandId].some(([commandId, deferred]) => commandId !== exceptCommandId && deferred.lifecycle.taskKey === taskKey);
  }

  private drainPromptBlockedByDeferredTerminal(taskKey: string): void {
    if (this.hasDeferredTerminalForTask(taskKey)) return;
    const candidate = [...this.lifecyclesByCommandId.values()]
      .filter(
        (lifecycle) =>
          lifecycle.taskKey === taskKey &&
          !lifecycle.active &&
          this.pendingFactsByCommandId.get(lifecycle.sourceCommandId)?.some((entry) => entry.fact.kind === "turn.started"),
      )
      .sort((a, b) => a.sendTime - b.sendTime)[0];
    if (candidate) this.drainPendingFacts(candidate.sourceCommandId);
  }

  private processPromptFact(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    switch (fact.kind) {
      case "turn.started":
        lifecycle.active = true;
        lifecycle.turnId = fact.turnId as string | undefined;
        this.activeCommandBySessionId.set(fact.sessionId, lifecycle.sourceCommandId);
        if (fact.turnId) this.commandIdByTurnKey.set(`${fact.sessionId}\u0000${fact.turnId}`, lifecycle.sourceCommandId);
        recordTurnStarted(lifecycle.taskKey, lifecycle.sourceCommandId);
        return;
      case "model.request.status": {
        const status = buildNetworkDebugStatus(fact);
        recordModelRequestStatus(lifecycle.taskKey, status, lifecycle.sourceCommandId);
        if (fact.status === "model_request_failed") lifecycle.lastErrorMessage = fact.reason as string | undefined;
        return;
      }
      case "stream.chunk": {
        lifecycle.legacyFirstTokenObserved = true;
        if (foreground && lifecycle.foregroundFirstTokenAt === null) lifecycle.foregroundFirstTokenAt = receivedAt;
        const event: { type: string; [key: string]: unknown } = {
          type: fact.channel === "thought" ? "agent_thought_chunk" : "agent_message_chunk",
          taskId: fact.sessionId,
          traceId: fact.eventId,
          inputId: lifecycle.sourceCommandId,
          content: "",
          ...(fact.channel === "text" && fact.assistantMessageId ? { messageId: fact.assistantMessageId } : {}),
          ...(fact.parentToolCallId ? { parentToolUseId: fact.parentToolCallId } : {}),
        };
        this.reportFinalizedSteps(
          lifecycle,
          finalizeConversationSteps({ taskId: lifecycle.taskKey, event, activeInputId: lifecycle.sourceCommandId, clientMode: "desktop-continuous", now: receivedAt }),
        );
        if (foreground) {
          recordStreamChunkForeground(lifecycle.taskKey, {
            now: receivedAt,
            talkId: fact.sessionId,
            waitingTool: false,
            model: currentConversationModel(lifecycle.taskKey),
            messageId: fact.assistantMessageId as string | undefined,
            chunkType: fact.channel === "thought" ? "thought" : "message",
          });
        }
        return;
      }
      case "tool.lifecycle":
        this.handleToolLifecycle(lifecycle, fact, receivedAt, foreground);
        return;
      case "permission.lifecycle": {
        const requestId = (fact.requestId ?? fact.toolCallId) as string | undefined;
        if (fact.phase === "requested") recordPermissionRequested({ taskId: lifecycle.taskKey, requestId, toolCallId: fact.toolCallId as string | undefined, now: receivedAt });
        else recordPermissionResolved({ taskId: lifecycle.taskKey, requestId, now: receivedAt });
        return;
      }
      case "usage.delta":
        recordUsageDelta({
          taskId: lifecycle.taskKey,
          eventKey: fact.eventId,
          usage: extractUsageDelta(fact),
          requestId: fact.requestId as string | undefined,
          modelName: resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined),
          modelProvider: fact.providerId as string | undefined,
          providerName: fact.providerHostname as string | undefined,
        });
        return;
      case "turn.terminal":
        this.handleTerminal(lifecycle, fact, receivedAt, foreground);
        return;
      case "compaction.terminal":
        return;
    }
  }

  private handleToolLifecycle(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    lifecycle.legacyFirstTokenObserved = true;
    if (foreground && lifecycle.foregroundFirstTokenAt === null) lifecycle.foregroundFirstTokenAt = receivedAt;
    clearConversationWaitState(lifecycle.taskKey);
    const subagentUsage = fact.childSessionId === undefined ? undefined : this.foregroundSubagentUsageByChildSession.get(fact.childSessionId as string);
    const agentId = (fact.agentId as string | undefined) ?? subagentUsage?.agentId;
    const toolAttribution =
      agentId || subagentUsage
        ? {
            ...(agentId ? { agentId } : {}),
            ...(subagentUsage?.modelName ? { modelName: subagentUsage.modelName } : {}),
            ...(subagentUsage?.modelProvider ? { modelProvider: subagentUsage.modelProvider } : {}),
            ...(subagentUsage?.providerName ? { providerName: subagentUsage.providerName } : {}),
          }
        : undefined;
    const alreadyStarted = lifecycle.startedToolCallIds.has(fact.toolCallId as string);
    let event: { type: string; [key: string]: unknown };
    if (!alreadyStarted && fact.phase !== "completed" && fact.phase !== "failed") {
      lifecycle.startedToolCallIds.add(fact.toolCallId as string);
      event = {
        type: "tool_call",
        taskId: fact.sessionId,
        traceId: fact.eventId,
        inputId: lifecycle.sourceCommandId,
        toolId: fact.toolCallId,
        parentToolUseId: fact.parentToolCallId,
        input: {},
        toolName: fact.toolName,
        kind: fact.toolName ?? "",
        title: "",
        raw: {},
      };
    } else {
      lifecycle.startedToolCallIds.add(fact.toolCallId as string);
      event = {
        type: "tool_call_update",
        taskId: fact.sessionId,
        traceId: fact.eventId,
        inputId: lifecycle.sourceCommandId,
        toolId: fact.toolCallId,
        parentToolUseId: fact.parentToolCallId,
        status: fact.phase === "completed" ? "completed" : fact.phase === "failed" ? "failed" : "in_progress",
        toolName: fact.toolName,
        kind: fact.toolName,
        error: fact.errorMessage,
        raw: {},
      };
    }
    const steps = finalizeConversationSteps({
      taskId: lifecycle.taskKey,
      event,
      activeInputId: lifecycle.sourceCommandId,
      clientMode: "desktop-continuous",
      ...(toolAttribution ? { toolAttribution } : {}),
      now: receivedAt,
    });
    const automationDetail = fact.automationId ? { automation_id: fact.automationId as string } : undefined;
    const terminal = fact.phase === "completed" || fact.phase === "failed";
    const owningSubagent = terminal
      ? [...this.foregroundSubagentUsageByChildSession.values()].find(
          (usage) => usage.parentCommandId === lifecycle.sourceCommandId && usage.parentToolCallId === fact.toolCallId,
        )
      : undefined;
    if (owningSubagent && !owningSubagent.stopped) {
      const timedOut = isToolTimeoutFact(fact);
      const immediate: Array<{ eventExtraDetail: Record<string, string> }> = [];
      for (const step of steps) {
        if (step.eventExtraDetail.tool_call_id === fact.toolCallId) {
          if (timedOut) {
            this.applyForegroundSubagentAttribution(step, owningSubagent);
            immediate.push(step);
          } else {
            owningSubagent.pendingFinalizedSteps.push({ step, extraDetail: automationDetail });
          }
        } else {
          immediate.push(step);
        }
      }
      this.reportFinalizedSteps(lifecycle, immediate, automationDetail);
      if (timedOut) {
        owningSubagent.stopped = true;
        this.flushDeferredTerminal(owningSubagent.parentCommandId);
      }
    } else {
      this.reportFinalizedSteps(lifecycle, steps, automationDetail);
    }
    if (fact.errorMessage) lifecycle.lastErrorMessage = fact.errorMessage as string;
    const performance = fact.performance as
      | {
          totalMs?: number;
          permissionWaitMs?: number;
          commandRunMs?: number;
          firstOutputMs?: number;
          noOutputMs?: number;
          exitCode?: number;
          timedOut?: boolean;
          outputBytes?: number;
          commandCategory?: string;
          commandName?: string;
          commandCount?: number;
          commandStatus?: string;
          fsReadMs?: number;
          fsWriteMs?: number;
          patchMatchMs?: number;
          fileCount?: number;
          totalBytes?: number;
          maxFileBytes?: number;
          hunkCount?: number;
          matchAttempts?: number;
          workspaceKind?: string;
        }
      | undefined;
    if (!foreground || !terminal || !performance || Object.keys(performance).length === 0) return;
    recordToolPerformance({
      toolName: fact.toolName as string,
      status: fact.phase === "completed" ? "completed" : "failed",
      talkId: fact.sessionId,
      messageId: lastReportedMessageId(lifecycle.taskKey) as string,
      toolCallId: fact.toolCallId as string | undefined,
      parentToolCallId: fact.parentToolCallId as string | undefined,
      childSessionId: fact.childSessionId as string | undefined,
      childToolCallId: fact.childToolCallId as string | undefined,
      agentId: fact.agentId as string | undefined,
      agentType: fact.agentType as string | undefined,
      totalMs: performance.totalMs ?? (fact.durationMs as number | undefined),
      permissionWaitMs: performance.permissionWaitMs,
      commandRunMs: performance.commandRunMs,
      firstOutputMs: performance.firstOutputMs,
      noOutputMs: performance.noOutputMs,
      exitCode: performance.exitCode,
      timedOut: performance.timedOut,
      outputBytes: performance.outputBytes,
      commandCategory: performance.commandCategory,
      commandName: performance.commandName,
      commandCount: performance.commandCount,
      commandStatus: performance.commandStatus,
      fsReadMs: performance.fsReadMs,
      fsWriteMs: performance.fsWriteMs,
      patchMatchMs: performance.patchMatchMs,
      fileCount: performance.fileCount,
      totalBytes: performance.totalBytes,
      maxFileBytes: performance.maxFileBytes,
      hunkCount: performance.hunkCount,
      matchAttempts: performance.matchAttempts,
      workspaceKind: performance.workspaceKind,
    });
  }

  private handleTerminal(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    if ([...this.foregroundSubagentUsageByChildSession.values()].some((usage) => usage.parentCommandId === lifecycle.sourceCommandId && !usage.stopped)) {
      if (this.deferredTerminalsByCommandId.has(lifecycle.sourceCommandId)) return;
      this.deferredTerminalsByCommandId.set(lifecycle.sourceCommandId, { lifecycle, fact, receivedAt, foregroundAtReceipt: foreground });
      return;
    }
    const terminalKey = `${fact.sessionId}\u0000${lifecycle.sourceCommandId}\u0000message_completion`;
    if (!this.terminalKeys.remember(terminalKey)) return;
    const status = mapTerminalStatus(fact.status as string);
    const terminalEvent: { type: string; [key: string]: unknown } =
      fact.status === "success" || fact.resultType !== undefined
        ? { type: "task_complete", taskId: fact.sessionId, traceId: fact.eventId, inputId: lifecycle.sourceCommandId, stopReason: fact.resultType ?? "complete" }
        : {
            type: "task_error",
            taskId: fact.sessionId,
            traceId: fact.eventId,
            inputId: lifecycle.sourceCommandId,
            error: (fact.errorMessage as string | undefined) ?? lifecycle.lastErrorMessage ?? (fact.errorCode as string | undefined) ?? "",
            code: fact.errorCode,
          };
    this.reportFinalizedSteps(
      lifecycle,
      finalizeConversationSteps({ taskId: lifecycle.taskKey, event: terminalEvent, activeInputId: lifecycle.sourceCommandId, clientMode: "desktop-continuous", now: receivedAt }),
    );
    const completion = buildMessageCompletionDetail({
      taskId: lifecycle.taskKey,
      status,
      finishedAt: receivedAt,
      errorType: fact.errorCode as string | undefined,
      errorMsg: (fact.errorMessage as string | undefined) ?? lifecycle.lastErrorMessage,
    });
    if (!completion) return;
    this.enqueueReport({
      elementName: "message_completion",
      eventRegion: "app",
      eventType: "agent_trace",
      eventExtraDetail: completion.eventExtraDetail,
      talkId: fact.sessionId,
      messageId: lifecycle.sourceCommandId,
    });
    if (foreground) {
      this.reportCompletionArms(
        fact.sessionId,
        lifecycle.sourceCommandId,
        completion.eventExtraDetail,
        lifecycle.foregroundFirstTokenAt === null ? (lifecycle.legacyFirstTokenObserved ? undefined : -1) : lifecycle.foregroundFirstTokenAt - lifecycle.sendTime,
      );
    }
    clearConversationWaitState(lifecycle.taskKey);
    this.deferredTerminalsByCommandId.delete(lifecycle.sourceCommandId);
    this.activeCommandBySessionId.delete(fact.sessionId);
    this.lifecyclesByCommandId.delete(lifecycle.sourceCommandId);
    if (lifecycle.turnId) this.commandIdByTurnKey.delete(`${fact.sessionId}\u0000${lifecycle.turnId}`);
    for (const [childSessionId, usage] of this.foregroundSubagentUsageByChildSession) {
      if (usage.parentCommandId === lifecycle.sourceCommandId) this.foregroundSubagentUsageByChildSession.delete(childSessionId);
    }
    this.drainPromptBlockedByDeferredTerminal(lifecycle.taskKey);
  }

  private reportCompletionArms(sessionId: string, sourceCommandId: string, detail: Record<string, string>, ttftMs: number | undefined): void {
    if (ttftMs !== undefined) {
      recordTtft({ ttftMs, model: detail.model_name || undefined, talkId: sessionId, messageId: sourceCommandId });
      recordProviderTtft(this.platform, { providerId: detail.model_provider, modelName: detail.model_name, askMode: detail.ask_mode, ttftMs });
    }
    const durationMs = finiteNumber(detail.duration_ms);
    if (durationMs === undefined) return;
    recordDuration({ durationMs, result: detail.status ?? "", model: detail.model_name || undefined, talkId: sessionId, messageId: sourceCommandId });
    recordConversationResult({
      durationMs,
      result: detail.status ?? "",
      model: detail.model_name || undefined,
      talkId: sessionId,
      messageId: sourceCommandId,
      ttftMs,
      waitingMs: finiteNumber(detail.waiting_ms),
      toolCallTotal: finiteNumber(detail.tool_call_total),
      toolCallFailed: finiteNumber(detail.tool_call_failed),
      agentStepCount: finiteNumber(detail.agent_step_cnt),
      retryCount: finiteNumber(detail.retry_cnt),
      fileChangeCount: finiteNumber(detail.file_change_cnt),
      generatedCodeLines: finiteNumber(detail.generated_code_lines),
    });
  }

  private reportFinalizedSteps(lifecycle: PromptLifecycle, steps: Array<{ eventExtraDetail: Record<string, string> }>, extraDetail?: Record<string, string>): void {
    for (const step of steps) {
      this.enqueueReport({
        elementName: "agent_step",
        eventRegion: "app",
        eventType: "agent_trace",
        eventExtraDetail: { ...lifecycle.stepSourceDetail, ...step.eventExtraDetail, ...extraDetail },
        talkId: lifecycle.sessionId,
        messageId: lifecycle.sourceCommandId,
      });
    }
  }

  private handleCompaction(fact: AgentFact, foreground: boolean): void {
    const compactionKey = `${fact.sessionId}\u0000${fact.operationId}\u0000context_compaction`;
    if (!this.compactionKeys.remember(compactionKey) || !foreground) return;
    const detail = buildCompactionDetail({
      timeline: {
        version: 1,
        kind: "synthetic",
        type: "context_compaction",
        operationId: fact.operationId as string | undefined,
        status: fact.status as string,
        trigger: fact.trigger as string,
        display: "separator",
        reason: fact.reason as string | undefined,
        summaryMessageId: fact.summaryMessageId as string | undefined,
        preCompactTokenCount: fact.preCompactTokenCount as number | undefined,
        postCompactTokenCount: fact.postCompactTokenCount as number | undefined,
        truePostCompactTokenCount: fact.truePostCompactTokenCount as number | undefined,
        attempt: fact.attempt as number | undefined,
        maxAttempts: fact.maxAttempts as number | undefined,
        startedAt: fact.startedAt as number | undefined,
        endedAt: fact.endedAt as number | undefined,
      },
      modelName: resolveCompactionModelName({ configProvider: fact.modelProvider as string | undefined, modelName: fact.modelName as string | undefined }),
      modelProvider: fact.modelProvider as string | undefined,
    });
    if (!detail) return;
    this.enqueueReport({
      elementName: "context_compaction",
      eventRegion: "app",
      eventType: "agent_trace",
      eventExtraDetail: detail,
      talkId: fact.sessionId,
      messageId: (fact.summaryMessageId as string | undefined) ?? (fact.operationId as string | undefined),
    });
  }
}
