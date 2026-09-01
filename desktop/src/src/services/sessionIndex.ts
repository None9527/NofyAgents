// A0-S4-5: 自 modules/services.tsx §G.5–G.6 原样迁入（SessionIndexStore 订阅/恢复状态机 + 会话索引 store 池 + WorkspaceSubscriptionSet，原 js 34981–35478；原文件现为薄 re-export shim）。
// settleRecovery 消费的 protocolLimits 属 §G.4（./commandQueueProtocol 的 declare 环境常量）；
// esbuild 不允许对环境常量做值引用导入，按 FeedbackCenter L303 既有惯例补本地环境声明副本（零 emit）。
import { INITIAL_SESSION_INDEX_STATE, RUNTIME_RESTART_BASE_DELAY_MS, RUNTIME_RESTART_MAX_DELAY_MS, RUNTIME_RESTART_RESET_MS, SUBSCRIBE_RETRY_BACKOFF_MS, applyFrameToIndexState, isDormantSubscribeError, isTransientSubscribeError, type SessionIndexRow } from '../modules/QuickPickDeep';
import { unsubscribeTransportSafe as unsubscribeTransport } from '../modules/QuickPickDeep'; // 原 IS
import { logger } from '../modules/SkillStore';
import { serviceGeneration } from '../modules/stores-core';
import { SessionIndexTopicMultiplexer, sessionTransportHandshake, sessionIndexInflightTracker, sessionFrameAssembly } from './conversationWireCore'; // 〔A1-P3-B4〕原 bS/AS/MS/NS 环境声明四件改指逐字实体（styles 33890/34647/34677/34746；ROUNDTRIP+SEAMSTRIP[wire] EXACT 在案）
import { sessionIndexFrameSchema } from './sessionsIndexSchemaCore'; // 〔A1-P3-B5〕原 oS 环境声明改指逐字实体（styles 33505，oS 整链闭合；ROUNDTRIP+SEAMSTRIP[os] EXACT 在案）

/** 协议限额环境声明副本（属主声明在 ./commandQueueProtocol §G.4，原 bi；同 FeedbackCenter 处置） */
declare const protocolLimits: {
  logicalFrameAssemblyMaxBytes: number;
  logicalFrameAssemblyMaxFragments: number;
  logicalFrameAssemblyMaxConcurrent: number;
  logicalFrameAssemblyMaxStagedBytes: number;
  logicalFrameAssemblyTimeoutMs: number;
  maxFrameBytes: number;
};
/* --- G.5 SessionIndexStore（原 XAe，js 34981–34960 区；v4-sessions-index） --- */

export interface SessionIndexEntry {
  sessionId: string;
  lastActivityAt: number;
  [key: string]: unknown;
}

export interface SessionIndexState {
  workspaceId: string | null;
  logEpoch: string | null;
  seq: number;
  /** A0-CLEANUP2 item 20：对齐属主 QuickPickDeep 行形（原镜像 SessionIndexEntry 弱形移至 getSessions 公共边界）。 */
  sessions: Map<string, SessionIndexRow>;
}

export type SessionIndexStatus = "idle" | "connecting" | "live" | "dormant" | "error";

export interface SessionIndexTransport {
  subscribe(args: { base?: { logEpoch: string; seq: number } }): Promise<{ ack: { subscriptionId: string; mode: "resume" | "snapshot"; logEpoch?: string } }>;
  unsubscribe(subscriptionId: string): Promise<void> | void;
  resync(args: { subscriptionId: string; base: { logEpoch: string; seq: number } | null; forceSnapshot?: boolean }): Promise<{ ack: { subscriptionId: string; mode: "resume" | "snapshot" } }>;
  activate(subscriptionId: string): void;
  onFrame(listener: (frame: { subscriptionId: string; fromSeq: number; toSeq: number; payload: { kind: "snapshot" | "deltas"; [key: string]: unknown } }, meta?: { deliveryKind?: string }) => void): () => void;
  onAssemblyFault(listener: (fault: { subscriptionId: string; deliveryKind?: string }) => void): () => void;
  onRuntimeRestart?(listener: () => void): () => void;
  onRuntimeLifecycle?(listener: (state: "available" | "unavailable") => void): () => void;
}

interface SessionIndexRecovery {
  subscriptionId: string;
  requestInFlight: boolean;
  ackReceived: boolean;
  validFrameSeen: boolean;
  upgradePending: boolean;
  ackMode: "resume" | "snapshot" | null;
  forceSnapshot: boolean;
  postRecoveryGapPending: boolean;
  frameDeadline: ReturnType<typeof setTimeout> | null;
}

/* 原 IS（unsubscribeTransport）已接线 QuickPickDeep.unsubscribeTransportSafe（见文件头 import） */

/**
 * 原 XAe：会话索引订阅状态机。
 * 状态：idle/connecting/live/dormant/error；帧断档 → resync 恢复
 * （resume 优先，失败升级 forceSnapshot，再失败 fail-closed 为 error）；
 * 运行时重启 → 指数退避重连（突发计数 2^min(n-1,16)，封顶）。
 */
export class SessionIndexStore {
  private state: SessionIndexState = INITIAL_SESSION_INDEX_STATE;
  private listeners = new Set<() => void>();
  private cachedList: SessionIndexEntry[] | null = null;
  private transport: SessionIndexTransport | null = null;
  private frameUnsub: (() => void) | null = null;
  private faultUnsub: (() => void) | null = null;
  private restartUnsub: (() => void) | null = null;
  private lifecycleUnsub: (() => void) | null = null;
  private subscriptionId: string | null = null;
  private awaitingInitial: { subscriptionId: string; mode: string } | null = null;
  private subscriptionHasAppliedBase = false;
  private recovery: SessionIndexRecovery | null = null;
  private status: SessionIndexStatus = "idle";
  private generation = 0;
  private closed = false;
  private runtimeRestartReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private runtimeRestartBurstCount = 0;
  private lastRuntimeRestartAt = 0;
  private subscribeRetryTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = (): SessionIndexState => this.state;

  getStatus(): SessionIndexStatus {
    return this.status;
  }

  async connect(transport: SessionIndexTransport, options: { forceSnapshot?: boolean; initialOverflowRetry?: boolean; subscribeRetryAttempt?: number } = {}): Promise<void> {
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.clearSubscribeRetry();
    this.closed = false;
    this.transport = transport;
    if (!this.frameUnsub) {
      this.frameUnsub = transport.onFrame((frame, meta) => this.handleFrame(frame, meta));
      this.faultUnsub = transport.onAssemblyFault((fault) => {
        if (fault.subscriptionId === this.subscriptionId) this.handleAssemblyFault(fault.subscriptionId, fault.deliveryKind);
      });
      if (transport.onRuntimeLifecycle) {
        this.lifecycleUnsub = transport.onRuntimeLifecycle((state) => {
          if (state === "available") this.handleRuntimeAvailable();
          else this.handleRuntimeUnavailable();
        });
      } else if (transport.onRuntimeRestart) {
        this.restartUnsub = transport.onRuntimeRestart(() => this.handleRuntimeRestart());
      }
    }
    const generation = ++this.generation;
    this.discardRecovery();
    this.status = "connecting";
    this.emit();
    const base = options.forceSnapshot || this.state.logEpoch === null ? undefined : { logEpoch: this.state.logEpoch, seq: this.state.seq };
    try {
      const result = await transport.subscribe(base ? { base } : {});
      if (generation !== this.generation || this.closed) {
        unsubscribeTransport(transport, result.ack.subscriptionId);
        return;
      }
      this.discardRecovery();
      this.subscriptionId = result.ack.subscriptionId;
      this.status = "live";
      this.subscriptionHasAppliedBase = !!(base && result.ack.mode === "resume" && result.ack.logEpoch === base.logEpoch);
      this.awaitingInitial = { subscriptionId: result.ack.subscriptionId, mode: result.ack.mode };
      transport.activate(result.ack.subscriptionId);
      this.emit();
    } catch (error) {
      if (generation !== this.generation || this.closed) return;
      this.awaitingInitial = null;
      this.subscriptionHasAppliedBase = false;
      if (isDormantSubscribeError(error)) {
        this.status = "dormant";
        this.emit();
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("fault.subscription.initialFrameStagingOverflow") && !options.initialOverflowRetry) {
        await this.connect(transport, { forceSnapshot: true, initialOverflowRetry: true });
        return;
      }
      const attempt = options.subscribeRetryAttempt ?? 0;
      const backoff = SUBSCRIBE_RETRY_BACKOFF_MS[attempt];
      if (isTransientSubscribeError(error) && backoff !== undefined) {
        this.status = "connecting";
        logger.warn(`[v4-sessions-index] subscribe 瞬时失败，${backoff}ms 后重试: ${message}`);
        this.subscribeRetryTimer = setTimeout(() => {
          this.subscribeRetryTimer = null;
          if (this.closed || generation !== this.generation) return;
          void this.connect(transport, { ...(options.forceSnapshot ? { forceSnapshot: true } : {}), subscribeRetryAttempt: attempt + 1 });
        }, backoff);
        this.emit();
        return;
      }
      this.status = "error";
      logger.warn(`[v4-sessions-index] subscribe 失败: ${message}`);
      this.emit();
    }
  }

  async replaceTransport(transport: SessionIndexTransport): Promise<void> {
    if (!this.closed && this.transport === transport) return;
    const generation = ++this.generation;
    const detached = this.detachTransport();
    this.status = "connecting";
    this.emit();
    if (detached.transport && detached.subscriptionId) unsubscribeTransport(detached.transport, detached.subscriptionId);
    if (generation !== this.generation || this.closed) return;
    await this.connect(transport, { forceSnapshot: true });
  }

  private handleFrame(frame: { subscriptionId: string; fromSeq: number; toSeq: number; payload: { kind: string } }, meta?: { deliveryKind?: string }): void {
    if (this.closed || this.subscriptionId === null || frame.subscriptionId !== this.subscriptionId) return;
    const initial = this.awaitingInitial?.subscriptionId === frame.subscriptionId ? this.awaitingInitial : null;
    const deliveryKind = meta?.deliveryKind ?? "online";
    if ((initial || (deliveryKind === "recovery" && this.awaitingInitial)) && (deliveryKind === "initial" || deliveryKind === "recovery")) this.awaitingInitial = null;
    if (deliveryKind === "online" && this.recovery && frame.payload.kind === "snapshot") {
      if (this.applyFrame(frame)) return;
      this.subscriptionHasAppliedBase = true;
      return;
    }
    if (deliveryKind === "online" && this.recovery) {
      if (frame.toSeq > this.state.seq) this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen;
      return;
    }
    if (frame.payload.kind === "deltas" && !this.subscriptionHasAppliedBase) {
      this.requestRecovery(deliveryKind === "recovery");
      return;
    }
    if (this.applyFrame(frame) && this.transport) {
      logger.warn(`[v4-sessions-index] 帧断档 fromSeq=${frame.fromSeq} local=${this.state.seq}，重订阅`);
      if (initial) this.connect(this.transport, { forceSnapshot: true });
      else this.requestRecovery(deliveryKind === "recovery");
      return;
    }
    this.subscriptionHasAppliedBase = true;
    if (deliveryKind === "recovery") this.markRecoveryFrameSeen();
  }

  private handleAssemblyFault(subscriptionId: string, deliveryKind?: string): void {
    if (subscriptionId !== this.subscriptionId) return;
    if (this.awaitingInitial?.subscriptionId === subscriptionId && (deliveryKind === "initial" || deliveryKind === "recovery" || deliveryKind === undefined)) {
      this.awaitingInitial = null;
    }
    if (deliveryKind === "online" && this.recovery) {
      this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen;
      return;
    }
    this.requestRecovery(deliveryKind === "recovery" || (deliveryKind === undefined && this.recovery !== null));
  }

  private requestRecovery(force = false): void {
    const transport = this.transport;
    const subscriptionId = this.subscriptionId;
    if (this.closed || !transport || !subscriptionId) return;
    const recovery = this.recovery;
    if (recovery) {
      if (!force) return;
      if (recovery.forceSnapshot) {
        this.failRecovery("fault.subscription.recoveryFailed");
        return;
      }
      if (recovery.requestInFlight || !recovery.ackReceived) {
        recovery.upgradePending = true;
        return;
      }
      if (recovery.ackMode === "resume") this.issueRecovery(recovery, true);
      else this.failRecovery("fault.subscription.recoveryFailed");
      return;
    }
    const created: SessionIndexRecovery = {
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
    this.recovery = created;
    this.issueRecovery(created, false);
  }

  private issueRecovery(recovery: SessionIndexRecovery, forceSnapshot: boolean): void {
    const transport = this.transport;
    if (!transport) return;
    this.clearRecoveryDeadline(recovery);
    const mustSnapshot = forceSnapshot || !this.subscriptionHasAppliedBase;
    recovery.requestInFlight = true;
    recovery.ackReceived = false;
    recovery.ackMode = null;
    recovery.validFrameSeen = false;
    recovery.upgradePending = false;
    recovery.forceSnapshot = mustSnapshot;
    recovery.postRecoveryGapPending = false;
    transport
      .resync({
        subscriptionId: recovery.subscriptionId,
        base: !this.subscriptionHasAppliedBase || this.state.logEpoch === null ? null : { logEpoch: this.state.logEpoch, seq: this.state.seq },
        ...(mustSnapshot ? { forceSnapshot: true } : {}),
      })
      .then((result) => {
        if (this.closed || this.recovery !== recovery) return;
        if (result.ack.subscriptionId !== recovery.subscriptionId) throw new Error("fault.subscription.resyncGenerationMismatch");
        recovery.requestInFlight = false;
        recovery.ackReceived = true;
        recovery.ackMode = result.ack.mode;
        this.settleRecovery(recovery);
      })
      .catch((error) => {
        if (this.closed || this.recovery !== recovery) return;
        this.clearRecoveryDeadline(recovery);
        this.recovery = null;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`[v4-sessions-index] resync 失败: ${message}`);
        if (message.includes("fault.subscription.notOwned") && this.transport) {
          void this.connect(this.transport);
          return;
        }
        this.status = "error";
        this.emit();
      });
  }

  private markRecoveryFrameSeen(): void {
    const recovery = this.recovery;
    if (!recovery) return;
    recovery.validFrameSeen = true;
    this.settleRecovery(recovery);
  }

  private settleRecovery(recovery: SessionIndexRecovery): void {
    if (this.recovery !== recovery || !recovery.ackReceived || recovery.requestInFlight) return;
    if (recovery.upgradePending) {
      this.clearRecoveryDeadline(recovery);
      if (!recovery.forceSnapshot && recovery.ackMode === "resume") this.issueRecovery(recovery, true);
      else this.failRecovery("fault.subscription.recoveryFailed");
      return;
    }
    if (recovery.validFrameSeen) {
      this.clearRecoveryDeadline(recovery);
      if (recovery.postRecoveryGapPending) this.issueRecovery(recovery, false);
      else this.recovery = null;
      return;
    }
    recovery.frameDeadline ||= setTimeout(() => {
      recovery.frameDeadline = null;
      if (this.closed || this.recovery !== recovery || recovery.validFrameSeen) return;
      if (recovery.forceSnapshot) this.failRecovery("fault.subscription.recoveryFrameTimedOut");
      else this.issueRecovery(recovery, true);
    }, protocolLimits.logicalFrameAssemblyTimeoutMs);
  }

  private clearRecoveryDeadline(recovery: SessionIndexRecovery): void {
    if (recovery.frameDeadline) {
      clearTimeout(recovery.frameDeadline);
      recovery.frameDeadline = null;
    }
  }

  private discardRecovery(): void {
    if (this.recovery) this.clearRecoveryDeadline(this.recovery);
    this.recovery = null;
  }

  private clearSubscribeRetry(): void {
    if (this.subscribeRetryTimer) {
      clearTimeout(this.subscribeRetryTimer);
      this.subscribeRetryTimer = null;
    }
  }

  private failRecovery(reason: string): void {
    this.discardRecovery();
    this.status = "error";
    logger.warn(`[v4-sessions-index] recovery fail-closed: ${reason}`);
    this.emit();
  }

  private handleRuntimeRestart(): void {
    if (this.closed || !this.transport) return;
    const transport = this.transport;
    const now = Date.now();
    if (now - this.lastRuntimeRestartAt >= RUNTIME_RESTART_RESET_MS) this.runtimeRestartBurstCount = 0;
    this.lastRuntimeRestartAt = now;
    const delay =
      this.runtimeRestartBurstCount === 0 ? 0 : Math.min(RUNTIME_RESTART_BASE_DELAY_MS * 2 ** Math.min(this.runtimeRestartBurstCount - 1, 16), RUNTIME_RESTART_MAX_DELAY_MS);
    this.runtimeRestartBurstCount += 1;
    this.generation += 1;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    if (this.status !== "connecting") {
      this.status = "connecting";
      this.emit();
    }
    if (this.runtimeRestartReconnectTimer) clearTimeout(this.runtimeRestartReconnectTimer);
    this.runtimeRestartReconnectTimer = setTimeout(() => {
      this.runtimeRestartReconnectTimer = null;
      if (this.closed || this.transport !== transport) return;
      void this.connect(transport, { forceSnapshot: true });
    }, delay);
  }

  private handleRuntimeAvailable(): void {
    if (this.closed || !this.transport) return;
    this.handleRuntimeRestart();
  }

  private handleRuntimeUnavailable(): void {
    if (this.closed) return;
    this.generation += 1;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    this.clearSubscribeRetry();
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.state = INITIAL_SESSION_INDEX_STATE;
    this.cachedList = null;
    this.status = "dormant";
    this.emit();
  }

  close(): void {
    this.closed = true;
    this.generation += 1;
    this.status = "idle";
    const detached = this.detachTransport();
    if (detached.subscriptionId && detached.transport) unsubscribeTransport(detached.transport, detached.subscriptionId);
  }

  private detachTransport(): { transport: SessionIndexTransport | null; subscriptionId: string | null } {
    const detached = { transport: this.transport, subscriptionId: this.subscriptionId };
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.runtimeRestartBurstCount = 0;
    this.lastRuntimeRestartAt = 0;
    this.clearSubscribeRetry();
    this.frameUnsub?.();
    this.frameUnsub = null;
    this.faultUnsub?.();
    this.faultUnsub = null;
    this.restartUnsub?.();
    this.restartUnsub = null;
    this.lifecycleUnsub?.();
    this.lifecycleUnsub = null;
    this.transport = null;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    return detached;
  }

  /** 返回 true 表示帧断档 */
  private applyFrame(frame: { payload: unknown; toSeq: number }): boolean {
    const { state, gap } = applyFrameToIndexState(
      this.state,
      // 传输面 frame.payload 为 {kind; [key]: unknown} 弱形，与属主 snapshot/deltas 判别联合不可比，双铸保留。
      frame as unknown as Parameters<typeof applyFrameToIndexState>[1],
    );
    if (gap) return true;
    if (state !== this.state) {
      this.state = state;
      this.cachedList = null;
      this.emit();
    }
    return false;
  }

  reset(): void {
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    this.state = INITIAL_SESSION_INDEX_STATE;
    this.cachedList = null;
    this.emit();
  }

  /** 按最近活动降序的会话列表（带缓存） */
  getSessions(): SessionIndexEntry[] {
    if (this.cachedList === null) {
      // 公共边界收弱形（消费面 Sidebar HomeConversationEntry 等收索引签名）；行形 SessionIndexRow → 弱形不可比，双铸。
      this.cachedList = ([...this.state.sessions.values()] as unknown as SessionIndexEntry[]).sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    }
    return this.cachedList;
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

/* --- G.6 会话索引 store 池 + 工作区订阅集（原 35356–35478） --- */

export interface SessionIndexScope {
  workspaceKey: string;
  /** bundle GS@styles 35529 仅传 workspaceKey(+endpointKey)，远程端点 scope 可无本地路径 */
  workspacePath?: string;
  workspaceIdentity?: string;
  endpointKey?: string;
}

interface SessionIndexPoolEntry {
  key: string;
  agentService: unknown;
  agentServiceGeneration: number;
  store: SessionIndexStore;
  refCount: number;
}

const sessionIndexPool = new Map<string, SessionIndexPoolEntry>(); // 原 LS
const sessionIndexPoolReverse = new WeakMap<SessionIndexStore, SessionIndexPoolEntry>(); // 原 RS

/* ── tombstone（A1-P3-B3）：declare createWorkspaceSessionIndexTransport（原 zS=oAe）删除——
 *    逐字真身（styles 33318–33320/34805–34942/35405–35408）已按 B5 体例转录至本文件尾部
 *    §B5-transport 段（ROUNDTRIP[transport] EXACT 157 行在案），调用点 518/533 逐字不变。
 *    declare workspaceIdentityOf（原 WS）删除——真身 = SessionStoreCore.sessionScopeWorkspaceKey
 *    （styles 35526–35528，A1-P3-B2 转录）；本 declare 在 A0 面零消费，改指不立本地副本。 ── */

export function sessionIndexPoolKey(scope: SessionIndexScope, agentService?: unknown): string {
  const base = `${scope.endpointKey ?? "__base__"}\u0000${scope.workspaceKey}`;
  return agentService ? `${base}\u0000service-generation:${serviceGeneration(agentService as object)}` : base;
}

/** 原 VS：获取（或创建）工作区的会话索引 store（引用计数；远端服务代际升级时热替换传输） */
export function acquireSessionIndexStore(scope: SessionIndexScope, agentService: unknown): SessionIndexStore {
  const key = sessionIndexPoolKey(scope);
  const generation = serviceGeneration(agentService as object);
  const existing = sessionIndexPool.get(key);
  if (existing && existing.agentService === agentService) {
    existing.refCount += 1;
    return existing.store;
  }
  if (existing && (scope.endpointKey ?? "__base__") !== "__base__") {
    existing.refCount += 1;
    if (generation > existing.agentServiceGeneration) {
      existing.agentService = agentService;
      existing.agentServiceGeneration = generation;
      const transport = createWorkspaceSessionIndexTransport({ workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity }, agentService);
      existing.store.replaceTransport(transport).catch((error) => {
        logger.warn("[v4-sessions-index] remote transport replacement failed", error);
      });
    }
    return existing.store;
  }
  if (existing) {
    sessionIndexPool.delete(key);
    if (existing.refCount <= 0) {
      existing.store.close();
      sessionIndexPoolReverse.delete(existing.store);
    }
  }
  const store = new SessionIndexStore();
  const transport = createWorkspaceSessionIndexTransport({ workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity }, agentService);
  void store.connect(transport, { forceSnapshot: true });
  const entry: SessionIndexPoolEntry = { key, agentService, agentServiceGeneration: generation, store, refCount: 1 };
  sessionIndexPool.set(key, entry);
  sessionIndexPoolReverse.set(store, entry);
  return store;
}

/** 原 HS：释放引用（归零即关闭） */
export function releaseSessionIndexStore(scope: SessionIndexScope, store: SessionIndexStore): void {
  const key = sessionIndexPoolKey(scope);
  const entry = sessionIndexPoolReverse.get(store);
  if (!entry || entry.key !== key) return;
  entry.refCount -= 1;
  if (entry.refCount > 0) return;
  entry.store.close();
  sessionIndexPoolReverse.delete(entry.store);
  if (sessionIndexPool.get(key) === entry) sessionIndexPool.delete(key);
}

/** 原 QAe：工作区订阅集 —— 按作用域列表对账（获取/释放/服务换代） */
export class WorkspaceSubscriptionSet {
  private active = new Map<string, { scope: SessionIndexScope; agentService: unknown; store: SessionIndexStore; unsubscribeStore: () => void }>();
  constructor(private onStoreChange: () => void) {}

  /** 返回是否有变化 */
  reconcile(desired: Array<{ scope: SessionIndexScope; agentService: unknown }>): boolean {
    const target = new Map<string, { scope: SessionIndexScope; agentService: unknown }>();
    for (const item of desired) target.set(sessionIndexPoolKey(item.scope), item);
    let changed = false;
    const releasedKeys: string[] = [];
    const acquiredKeys: string[] = [];
    for (const [key, entry] of this.active) {
      const wanted = target.get(key);
      // 〔A1-P3-B3〕US/ZAe 归一：内联五字段比较改指逐字 canonical sameScopeSubscriptionEntry（原 ZAe，styles 35446–35454；同形证据见 A1-P3-B3.report.md §四）
      if (wanted && sameScopeSubscriptionEntry(entry, wanted)) {
        continue;
      }
      if (wanted && entry.agentService !== wanted.agentService && (entry.scope.endpointKey ?? "__base__") !== "__base__") {
        const nextStore = acquireSessionIndexStore(wanted.scope, wanted.agentService);
        const sameStore = nextStore === entry.store;
        const unsubscribe = sameStore ? entry.unsubscribeStore : nextStore.subscribe(this.onStoreChange);
        if (sameStore) releaseSessionIndexStore(entry.scope, entry.store);
        else this.disposeEntry(entry);
        this.active.set(key, { ...wanted, store: nextStore, unsubscribeStore: unsubscribe });
        releasedKeys.push(scopeSubscriptionLabel(entry.scope));
        acquiredKeys.push(scopeSubscriptionLabel(wanted.scope));
        changed = true;
        continue;
      }
      releasedKeys.push(scopeSubscriptionLabel(entry.scope));
      this.disposeEntry(entry);
      this.active.delete(key);
      changed = true;
    }
    for (const [key, wanted] of target) {
      if (this.active.has(key)) continue;
      const store = acquireSessionIndexStore(wanted.scope, wanted.agentService);
      acquiredKeys.push(scopeSubscriptionLabel(wanted.scope));
      this.active.set(key, { ...wanted, store, unsubscribeStore: store.subscribe(this.onStoreChange) });
      changed = true;
    }
    if (changed) {
      logger.info("[v4-sessions-index] workspace subscription set reconciled", { acquiredScopeKeys: acquiredKeys, releasedScopeKeys: releasedKeys, activeCount: this.active.size });
      this.onStoreChange();
    } else {
      logger.debug("[v4-sessions-index] workspace subscription set unchanged", { activeCount: this.active.size });
    }
    return changed;
  }

  getStore(scope: SessionIndexScope): SessionIndexStore | undefined {
    return this.active.get(sessionIndexPoolKey(scope))?.store;
  }

  size(): number {
    return this.active.size;
  }

  dispose(): void {
    if (this.active.size > 0) {
      logger.info("[v4-sessions-index] workspace subscription set disposed", { releasedScopeKeys: [...this.active.values()].map((entry) => scopeSubscriptionLabel(entry.scope)) });
    }
    for (const entry of this.active.values()) this.disposeEntry(entry);
    this.active.clear();
  }

  private disposeEntry(entry: { scope: SessionIndexScope; store: SessionIndexStore; unsubscribeStore: () => void }): void {
    entry.unsubscribeStore();
    releaseSessionIndexStore(entry.scope, entry.store);
  }
}

/* ── tombstone（A1-P3-B3）：scopeLabel（A0 语义名）删除——与逐字 US（styles 35443–35445）消费面
 *    实测同形（同模板 `${endpointKey ?? "__base__"}:${workspaceKey}`；5 处调用位全传 scope 对象），
 *    归一保留逐字 canonical scopeSubscriptionLabel（见下方 §B5-transport 段），调用点改指。 ── */

/* ============================================================================
 * §B5-transport（A1-P3-B3 逐字段）：zS/oAe 传输族 + US/ZAe twins canonical
 * ----------------------------------------------------------------------------
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（四子区，非连续；中间 33321–34804 协议簇与 34943–35404/35409–35442 不属本段）：
 *   33318–33320（_ke）+ 34805–34942（oAe）+ 35405–35408（zS）+ 35443–35454（US/ZAe）
 * 转录机制：AST 精确改名（13 处：自由符引用 6 名 + 顶层声明锚 5 + 顶层引用 2），
 *   往返核对 ROUNDTRIP[transport] EXACT（157 行）在案（/tmp/a1r0-p3/p3b2-roundtrip.js）；
 *   体内 30 局部保留混淆名（B5 约定）。与既有 A0-S4-5 语义段并存（本段为逐字补面）。
 * 映射表（minified → 语义名 → bundle 定义行）：
 *   _ke→sessionIndexTopicKey(33318) | oAe→sessionIndexTransportFactory(34805)
 *   zS→createWorkspaceSessionIndexTransport(35405)
 *   US→scopeSubscriptionLabel(35443) | ZAe→sameScopeSubscriptionEntry(35446)
 *   （US/ZAe 归一：SessionStoreCore 同形实体改为本段再导出，A1-P3-B3 §四）
 * 区外自由符（协议簇 33505–34804）→〔A1-P3-B4〕bS/AS/MS/NS 四件改指
 *   services/conversationWireCore 逐字实体（本段环境声明删除，头部 import 接线）；
 *   oS→sessionIndexFrameSchema(33505)〔A1-P3-B5〕闭合：逐字真身录
 *   services/sessionsIndexSchemaCore.ts（oS 整链 32959–33508 闭合前缀，
 *   ROUNDTRIP+SEAMSTRIP[os] EXACT 80 行在案），本段改头部 import 接线；
 *   aS 链余量（oke/cke/aS 共声明者族）留批，边界证据见 A1-P3-B5.report.md §七。
 * 型缝（全型层，禁抑制符）×30：P1 顶层函数参数 :any ×8（5 函）+ P1 返回对象字面量
 *   方法参数 :any ×8（subscribe/activate/resync/unsubscribe/onFrame/onAssemblyFault/
 *   onRuntimeRestart/onRuntimeLifecycle，方法位隐 any 收口）；S5 容器泛型 ×4
 *   （a/o/s/c = new Set<any>()）；S6 声明位宽化 ×4（d/f/p/m : any = null）；
 *   S16 any 接收面回调参数 :any ×6（sessionFrameAssembly 双回调 / sessionIndexInflightTracker
 *   回调 / onDynamicSessionsIndexFrame 回套 / onAgentRuntimeRestarted / onAgentRuntimeLifecycle）。
 * ==========================================================================*/
/* ── tombstone（A1-P3-B5）：declare sessionIndexFrameSchema（原 oS）删除——逐字真身已录
 *    services/sessionsIndexSchemaCore.ts（styles 33505，oS 整链闭合前缀 32959–33508，
 *    ROUNDTRIP[os]+SEAMSTRIP[os] EXACT 80 行在案），本段改头部 import 接线；
 *    §B5-transport 消费面逐字不变。协议簇五符（oS/bS/AS/MS/NS）至此全闭合。 ── */
/* ── tombstone（A1-P3-B4）：declare SessionIndexTopicMultiplexer（原 bS）/
 *    sessionTransportHandshake（原 AS）/ sessionIndexInflightTracker（原 MS）/
 *    sessionFrameAssembly（原 NS）四件删除——逐字真身已录 services/conversationWireCore.ts
 *    （styles 33890–34228 / 34646–34670 / 34671–34745 / 34746–34804，
 *    ROUNDTRIP[wire]+SEAMSTRIP[wire] EXACT 661 行在案），本段改头部 import 接线。 ── */

export function sessionIndexTopicKey(e: any) {
  return `sessions-index/${e}`;
}
export function sessionIndexTransportFactory(e: any, t: any) {
  let n = {
      workspacePath: t.workspacePath,
      ...(t.workspaceIdentity ? { workspaceIdentity: t.workspaceIdentity } : {}),
    },
    r = () =>
      !e.helloConversationV4 || !e.initializeConversationV4
        ? Promise.reject(Error(`fault.connection.handshakeUnavailable`))
        : sessionTransportHandshake(e),
    i = sessionIndexTopicKey(t.workspaceIdentity?.trim() || t.workspacePath),
    a = new Set<any>(),
    o = new Set<any>(),
    s = new Set<any>(),
    c = new Set<any>(),
    l = sessionFrameAssembly(
      new SessionIndexTopicMultiplexer(sessionIndexFrameSchema),
      (e: any, t: any) => {
        for (let n of a) n(e, { deliveryKind: t });
      },
      (e: any) => {
        for (let t of o) t(e);
      },
    ),
    u = sessionIndexInflightTracker((e: any) => {
      l.accept(e);
    }),
    d: any = null,
    f: any = null,
    p: any = null,
    m: any = null,
    h = 0,
    g = t.workspaceIdentity?.trim() || t.workspacePath;
  return {
    async subscribe(t: any) {
      await r();
      let a = u.begin(i),
        o = h;
      try {
        let r = await e.subscribeSessionsIndexV4({
          ...n,
          runtimePolicy: `existing-only`,
          ...(t.base ? { base: t.base } : {}),
          ...(t.visibility ? { visibility: t.visibility } : {}),
        });
        if (o !== h) throw (u.cancel(a), Error(`fault.subscription.runtimeRestarted`));
        try {
          u.bind(a, r.ack.subscriptionId);
        } catch (t) {
          try {
            await e.unsubscribeSessionsIndexV4({
              ...n,
              subscriptionId: r.ack.subscriptionId,
              runtimePolicy: `existing-only`,
            });
          } catch (e) {
            logger.warn(`[v4-sessions-index] failed to undo rejected subscription`, e);
          }
          throw t;
        }
        return r;
      } catch (e) {
        throw (u.cancel(a), e);
      }
    },
    activate(e: any) {
      let t = u.activate(e);
      (t && (m = e), t?.previousSubscriptionId && l.discard(t.topic, t.previousSubscriptionId));
    },
    async resync(t: any) {
      if ((await r(), m !== t.subscriptionId)) throw Error(`fault.subscription.notOwned`);
      return (
        l.recover(i, t.subscriptionId),
        e.resyncSessionsIndexV4({
          ...n,
          subscriptionId: t.subscriptionId,
          base: t.base,
          runtimePolicy: `existing-only`,
          ...(t.forceSnapshot === void 0 ? {} : { forceSnapshot: t.forceSnapshot }),
        })
      );
    },
    async unsubscribe(t: any) {
      return (
        u.forget(t),
        m === t && (m = null),
        l.discard(i, t),
        await r(),
        e.unsubscribeSessionsIndexV4({ ...n, subscriptionId: t, runtimePolicy: `existing-only` })
      );
    },
    onFrame(t: any) {
      return (
        a.add(t),
        (d ??= e.onDynamicSessionsIndexFrame(n)((e: any) => u.accept(e))),
        () => {
          (a.delete(t), a.size === 0 && (d?.dispose(), (d = null)));
        }
      );
    },
    onAssemblyFault(e: any) {
      return (o.add(e), () => o.delete(e));
    },
    onRuntimeRestart(t: any) {
      return (
        s.add(t),
        (f ??= e.onAgentRuntimeRestarted((e: any) => {
          if (e.workspaceKey === g) {
            ((h += 1), u.clear(), l.clear(), (m = null));
            for (let e of s) e();
          }
        })),
        () => {
          (s.delete(t), s.size === 0 && (f?.dispose(), (f = null)));
        }
      );
    },
    ...(e.onAgentRuntimeLifecycle
      ? {
          onRuntimeLifecycle(t: any) {
            let n = c;
            return (
              n.add(t),
              (p ??=
                e.onAgentRuntimeLifecycle?.((e: any) => {
                  if (e.workspaceKey === g) {
                    ((h += 1), u.clear(), l.clear(), (m = null));
                    for (let t of n) t(e.state);
                  }
                }) ?? null),
              () => {
                (n.delete(t), n.size === 0 && (p?.dispose(), (p = null)));
              }
            );
          },
        }
      : {}),
  };
}
export function createWorkspaceSessionIndexTransport(e: any, t: any) {
  let n = e.workspaceIdentity?.trim();
  return sessionIndexTransportFactory(t, { workspacePath: e.workspacePath, ...(n ? { workspaceIdentity: n } : {}) });
}
export function scopeSubscriptionLabel(e: any) {
  return `${e.endpointKey ?? `__base__`}:${e.workspaceKey}`;
}
export function sameScopeSubscriptionEntry(e: any, t: any) {
  return (
    e.agentService === t.agentService &&
    e.scope.workspaceKey === t.scope.workspaceKey &&
    e.scope.workspacePath === t.scope.workspacePath &&
    e.scope.workspaceIdentity === t.scope.workspaceIdentity &&
    e.scope.endpointKey === t.scope.endpointKey
  );
}
