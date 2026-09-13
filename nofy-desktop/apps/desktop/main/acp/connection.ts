/**
 * 内核 ACP 连接——**stdio 单传输，全应用单实例**。
 *
 * 移植自 seam/nofy-kernel-client.js（489 行）的已验证行为，重写为 TypeScript，
 * 并做四处刻意改动：
 *
 *  1. **删除 WS 传输**。旧路同时背着 ws 与 stdio 两条传输（io.kind === "ws"|"stdio"）；
 *     serve 模式有单客户端约束（server.rs:314-334）且需 secret 发现（旧 D1 成因），
 *     裁定 A 已定为 stdio-only，故 ws 依赖与相关分支全部不存在。
 *  2. **坏帧不静默**。旧路 onFrame 在 JSON.parse 失败时直接 return；本实现经
 *     classifyFrame 产出 malformed 并计数 + 发事件（PLAN.md §2.4）。
 *  3. **未知 server→client 请求回 METHOD_NOT_FOUND**，不再一律回 {}。
 *     第一方行为即如此：nofy-pager/src/acp/mod.rs 的 wait_for_exit_not_supported
 *     对 WaitForTerminalExit 返回 -32601 并由调用方轮询（PLAN.md §2.2）。
 *  4. **未handled 通知显式计数**，不静默丢弃（PLAN.md §5 投影层规则）。
 *
 * 保留的旧路已验证语义（不得改动）：
 *  - session/cancel 是 **notification**；同时把该会话所有挂起权限请求应答 cancelled
 *  - initialize 携带 _meta.clientIdentifier="nofy-desktop"、clientCapabilities.fs=false
 *  - ext 方法名幂等补 _nofy/ 前缀
 *  - stderr 必须被消费（防背压堵死子进程）
 *  - 子进程退出 → failPending + 清 serverRequests/pendingPermissions + 非用户关闭则重连
 */
import { createInterface } from "node:readline";
import type { ChildProcess } from "node:child_process";
import {
  AGENT_METHOD,
  CLIENT_SIDE_METHOD,
  EXT_EVENT,
  EXT_SERVER_REQUEST,
  FOLDER_TRUST_REJECT,
  classifyFrame,
  extMethodName,
  initializeParams,
} from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { TypedEmitter } from "../lib/emitter.ts";
import { log, warn } from "../lib/log.ts";
import { spawnKernelChild } from "../kernel/supervisor.ts";

const DEFAULT_READY_TIMEOUT_MS = 8_000;
const DEFAULT_RECONNECT_MS = 2_000;
/** JSON-RPC 标准码：方法不存在。 */
const METHOD_NOT_FOUND = -32601;

export type RpcId = number | string;
export type JsonObject = Record<string, unknown>;

/**
 * initialize 响应。S1 阶段为宽松形状——strict zod 门随投影层（S1b）落地，
 * 届时替换为 @nofy-desktop/acp 的 schema 类型。
 */
export type InitializeResult = {
  agentVersion?: string;
  agentCapabilities?: unknown;
  authMethods?: unknown;
  _meta?: JsonObject;
} & JsonObject;

export type ConnectionEvents = {
  status: [{ connected: boolean }];
  ready: [InitializeResult];
  /** 全部入站帧，供录制黄金夹具与诊断（PLAN.md §12.3） */
  frame: [InboundFrame];
  update: [JsonObject];
  extUpdate: [JsonObject];
  sessionNotification: [JsonObject];
  sessions: [JsonObject];
  models: [JsonObject];
  settings: [JsonObject];
  queue: [JsonObject];
  permission: [{ id: RpcId; params: JsonObject }];
  askUserQuestion: [{ id: RpcId; params: JsonObject }];
  exitPlanMode: [{ id: RpcId; params: JsonObject }];
  elicitation: [{ id: RpcId; method: string; params: JsonObject }];
  /**
   * 内核请求工作区信任裁定（folder_trust_prompt.rs:183）。fail-closed：
   * 只有 {outcome:"trust"} 解锁，其余（含不应答）一律 Reject。
   * 受能力门控制——我们未声明 _meta["nofy/folderTrust"].interactive 时内核不会发。
   */
  folderTrust: [{ id: RpcId; params: JsonObject }];
  /** 契约表之外的入站方法——显式暴露，绝不静默 */
  unhandled: [{ method: string; kind: "notification" | "server-request" }];
  malformed: [{ reason: string; raw: string }];
};

export type Diagnostics = {
  framesIn: number;
  responses: number;
  serverRequests: number;
  notifications: number;
  malformed: number;
  requestsOut: number;
  notificationsOut: number;
  unhandled: Record<string, number>;
};

type Pending = {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
  method: string;
};

type Io = {
  isOpen: () => boolean;
  send: (text: string) => boolean;
  close: () => void;
};

function asObject(v: unknown): JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as JsonObject) : {};
}

export class KernelConnection extends TypedEmitter<ConnectionEvents> {
  readonly clientIdentifier = "nofy-desktop";
  clientVersion = "0.1.0";
  reconnectMs = DEFAULT_RECONNECT_MS;

  private child: ChildProcess | null = null;
  private io: Io | null = null;
  private nextId = 1;
  private pending = new Map<RpcId, Pending>();
  private serverRequests = new Set<RpcId>();
  private pendingPermissions = new Map<RpcId, string>();
  private initialized = false;
  private closedByUser = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readyWaiters: Array<() => void> = [];
  private initializeResult: InitializeResult | null = null;
  private initializeRequest: JsonObject | null = null;

  readonly diag: Diagnostics = {
    framesIn: 0,
    responses: 0,
    serverRequests: 0,
    notifications: 0,
    malformed: 0,
    requestsOut: 0,
    notificationsOut: 0,
    unhandled: {},
  };

  /* ─────────────────────────── 连接 ─────────────────────────── */

  isOpen(): boolean {
    return this.io !== null && this.io.isOpen();
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get kernelPid(): number | undefined {
    return this.child?.pid;
  }

  /**
   * 接管一个已派生的内核子进程并完成握手。
   * stdout = 协议行；stderr 必须被消费（防背压堵死子进程）。
   */
  attachChild(child: ChildProcess): void {
    const stdout = child.stdout;
    if (stdout === null) {
      // 显式失败：没有 stdout 就收不到任何协议帧，静默继续只会变成「连上了但永远没事件」
      warn("kernel child has no readable stdout; cannot receive protocol frames");
      return;
    }
    if (this.io !== null) {
      try {
        this.io.close();
      } catch {
        /* ignore */
      }
    }
    this.child = child;
    child.stderr?.resume();

    const rl = createInterface({ input: stdout });
    rl.on("line", (line: string) => this.onFrame(line));

    child.on("exit", (code) => {
      rl.close();
      // 顺序要紧：**先清账，再发 status**。反过来的话，消费者在 status:false 的
      // 回调里仍会读到 isInitialized===true / isOpen()===true，把「已断连」误判成
      // 「还活着」——正是旧路 D2「桥的 main→host 方向从未被端到端验证」那类
      // 静默不一致的温床。
      this.failPending(new Error("kernel child exited (code=" + String(code) + ")"));
      this.serverRequests.clear();
      this.pendingPermissions.clear();
      this.initialized = false;
      this.initializeResult = null;
      this.io = null;
      this.child = null;
      this.emit("status", { connected: false });
      if (!this.closedByUser) this.scheduleReconnect();
    });

    this.io = {
      isOpen: () => child.exitCode === null && child.signalCode === null && child.stdin?.writable !== false,
      send: (text) => {
        if (child.stdin === null || child.stdin.destroyed) return false;
        return child.stdin.write(text + "\n");
      },
      close: () => {
        try {
          child.stdin?.end();
        } catch {
          /* ignore */
        }
      },
    };

    this.emit("status", { connected: true });
    void this.handshake();
  }

  /** 派生内核子进程并接管。supervisor 的单内核不变量在此生效。 */
  connect(): void {
    if (this.io !== null && this.io.isOpen()) return;
    const child = spawnKernelChild();
    this.attachChild(child);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null || this.closedByUser) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      try {
        this.connect();
      } catch (e) {
        warn("reconnect failed:", e instanceof Error ? e.message : String(e));
        this.scheduleReconnect();
      }
    }, this.reconnectMs);
  }

  close(): void {
    this.closedByUser = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.failPending(new Error("connection closed by caller"));
    try {
      this.io?.close();
    } catch {
      /* ignore */
    }
    this.io = null;
    this.initialized = false;
  }

  /* ─────────────────────────── 握手 ─────────────────────────── */

  private async handshake(): Promise<void> {
    const params = initializeParams(this.clientVersion);
    try {
      const result = asObject(await this.rpc(AGENT_METHOD.initialize, params));
      this.initializeRequest = params as unknown as JsonObject;
      this.initializeResult = result as InitializeResult;
      this.initialized = true;
      const waiters = this.readyWaiters.splice(0);
      for (const w of waiters) w();
      this.emit("ready", this.initializeResult);
    } catch (e) {
      warn("initialize failed:", e instanceof Error ? e.message : String(e));
    }
  }

  /**
   * 等待 initialize 完成。
   *
   * ⚠ 已知局限：在「子进程已死但 exit 事件尚未派发」的窗口里，`initialized` 与
   * `io` 都还是旧值，本方法会用**陈旧结果**立即返回（实测：SIGKILL 后立刻 ready()
   * 拿到旧 pid）。调用方若刚触发过进程终止，必须**先等 status:false**再 ready()
   * ——见 record-replay.ts 的 waitForDisconnect。
   * 这里额外要求 isOpen()，挡掉传输已明确关闭的情形。
   */
  ready(timeoutMs: number = DEFAULT_READY_TIMEOUT_MS): Promise<InitializeResult> {
    if (this.initialized && this.initializeResult !== null && this.isOpen()) {
      return Promise.resolve(this.initializeResult);
    }
    return new Promise<InitializeResult>((resolve, reject) => {
      this.readyWaiters.push(() => {
        resolve(this.initializeResult ?? {});
      });
      setTimeout(() => {
        if (!this.initialized) reject(new Error("kernel not ready (" + String(timeoutMs) + "ms)"));
      }, timeoutMs);
    });
  }

  /** initialize._meta.modelState——模型表唯一来源，桌面不维护自己的注册表。 */
  get modelState(): unknown {
    return asObject(this.initializeResult?._meta)["modelState"] ?? null;
  }

  get availableCommands(): unknown {
    return asObject(this.initializeResult?._meta)["availableCommands"] ?? null;
  }

  get agentVersion(): string | null {
    const r = this.initializeResult;
    if (!r) return null;
    const fromMeta = asObject(r._meta)["agentVersion"];
    if (typeof fromMeta === "string") return fromMeta;
    return typeof r.agentVersion === "string" ? r.agentVersion : null;
  }

  snapshot(): JsonObject {
    return {
      initialized: this.initialized,
      clientIdentifier: this.clientIdentifier,
      kernelPid: this.child?.pid ?? null,
      agentVersion: this.agentVersion,
      authMethods: this.initializeResult?.authMethods ?? [],
      agentCapabilities: this.initializeResult?.agentCapabilities ?? null,
      modelState: this.modelState,
      availableCommands: this.availableCommands,
      diag: { ...this.diag, unhandled: { ...this.diag.unhandled } },
    };
  }

  /* ─────────────────────────── 出站 ─────────────────────────── */

  private sendText(text: string): boolean {
    if (this.io === null || !this.io.isOpen()) return false;
    try {
      return this.io.send(text);
    } catch {
      return false;
    }
  }

  rpc(method: string, params?: unknown, timeoutMs = 0): Promise<unknown> {
    if (!this.isOpen()) return Promise.reject(new Error("kernel not connected"));
    const id = this.nextId++;
    return new Promise<unknown>((resolve, reject) => {
      const entry: Pending = { resolve, reject, timer: null, method };
      if (timeoutMs > 0) {
        entry.timer = setTimeout(() => {
          if (this.pending.delete(id)) reject(new Error(method + " timeout (" + String(timeoutMs) + "ms)"));
        }, timeoutMs);
      }
      this.pending.set(id, entry);
      this.diag.requestsOut++;
      if (!this.sendText(JSON.stringify({ jsonrpc: "2.0", id, method, params: params ?? {} }))) {
        this.pending.delete(id);
        if (entry.timer !== null) clearTimeout(entry.timer);
        reject(new Error("kernel send failed (" + method + ")"));
      }
    });
  }

  /** 内核扩展请求。方法名经 extMethodName 幂等归一为 _nofy/* 线上形。 */
  ext(method: string, params?: unknown, timeoutMs = 0): Promise<unknown> {
    return this.rpc(extMethodName(method), params, timeoutMs);
  }

  /** 通知（无 id、无应答）。返回是否已写出。 */
  notify(method: string, params?: unknown): boolean {
    this.diag.notificationsOut++;
    return this.sendText(JSON.stringify({ jsonrpc: "2.0", method, params: params ?? {} }));
  }

  /**
   * 停止轮次。
   * 陷阱 T1：session/cancel 是 **notification**，作为 request 发得 -32601。
   * 同时把该会话所有挂起权限请求应答 cancelled（PORTING-PLAN §2.3）。
   */
  cancel(sessionId: string, meta?: JsonObject): boolean {
    const params: JsonObject = { sessionId };
    if (meta !== undefined) params["_meta"] = meta;
    const sent = this.notify(AGENT_METHOD.cancel, params);
    for (const [id, sid] of [...this.pendingPermissions]) {
      if (sid === sessionId) this.respond(id, { outcome: { outcome: "cancelled" } });
    }
    return sent;
  }

  /** 应答内核 → 客户端的 request。重复应答幂等（第二次返回 false）。 */
  respond(id: RpcId, result: unknown): boolean {
    if (!this.serverRequests.has(id)) return false;
    this.serverRequests.delete(id);
    this.pendingPermissions.delete(id);
    return this.sendText(JSON.stringify({ jsonrpc: "2.0", id, result }));
  }

  /** 以 JSON-RPC 错误应答（用于本项目不实现的客户端侧方法）。 */
  respondError(id: RpcId, code: number, message: string): boolean {
    if (!this.serverRequests.has(id)) return false;
    this.serverRequests.delete(id);
    this.pendingPermissions.delete(id);
    return this.sendText(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }));
  }

  respondPermission(id: RpcId, outcome: JsonObject): boolean {
    return this.respond(id, { outcome });
  }

  /* ─────────────────────────── 入站 ─────────────────────────── */

  private failPending(err: Error): void {
    for (const w of this.pending.values()) {
      if (w.timer !== null) clearTimeout(w.timer);
      w.reject(err);
    }
    this.pending.clear();
  }

  private countUnhandled(method: string, kind: "notification" | "server-request"): void {
    const key = kind + " " + method;
    this.diag.unhandled[key] = (this.diag.unhandled[key] ?? 0) + 1;
    this.emit("unhandled", { method, kind });
  }

  private onFrame(raw: string): void {
    const frame = classifyFrame(raw);
    this.diag.framesIn++;
    this.emit("frame", frame);

    switch (frame.kind) {
      case "malformed": {
        this.diag.malformed++;
        warn("malformed frame (" + frame.reason + "):", frame.raw);
        this.emit("malformed", { reason: frame.reason, raw: frame.raw });
        return;
      }
      case "response": {
        this.diag.responses++;
        const waiter = this.pending.get(frame.id);
        if (waiter === undefined) return; // 迟到/未知应答：已清账，忽略
        this.pending.delete(frame.id);
        if (waiter.timer !== null) clearTimeout(waiter.timer);
        if (frame.error !== undefined) {
          const err = new Error(frame.error.message ?? "rpc error (" + waiter.method + ")");
          (err as Error & { code?: number }).code = frame.error.code;
          waiter.reject(err);
        } else {
          waiter.resolve(frame.result);
        }
        return;
      }
      case "server-request": {
        this.diag.serverRequests++;
        this.handleServerRequest(frame.id, frame.method, asObject(frame.params));
        return;
      }
      case "notification": {
        this.diag.notifications++;
        this.handleNotification(frame.method, asObject(frame.params));
        return;
      }
    }
  }

  private handleNotification(method: string, params: JsonObject): void {
    switch (method) {
      case CLIENT_SIDE_METHOD.sessionUpdate:
        this.emit("update", params);
        return;
      case EXT_EVENT.sessionUpdate:
        this.emit("extUpdate", params);
        return;
      case EXT_EVENT.sessionNotification:
        this.emit("sessionNotification", params);
        return;
      case EXT_EVENT.sessionsChanged:
        this.emit("sessions", params);
        return;
      case EXT_EVENT.modelsUpdate:
        this.emit("models", params);
        return;
      case EXT_EVENT.settingsUpdate:
        this.emit("settings", params);
        return;
      case EXT_EVENT.queueChanged:
        this.emit("queue", params);
        return;
      // 注：**没有** replayed 分支。_nofy/replayed 不是方法名，是 _meta 键
      //（methods.ts 的 EXT_META_KEY）；旧 seam 把它当通知，本项目已纠正。
      default:
        // 其余 _nofy/* 杂项事件（announcements/git_head_changed/task_*/mcp_*/…）
        // 由投影层（S1b）逐条接管；此处显式计数，不静默丢弃。
        this.countUnhandled(method, "notification");
        return;
    }
  }

  private handleServerRequest(id: RpcId, method: string, params: JsonObject): void {
    this.serverRequests.add(id);
    switch (method) {
      case CLIENT_SIDE_METHOD.requestPermission: {
        this.pendingPermissions.set(id, String(params["sessionId"] ?? ""));
        if (this.listenerCount("permission") === 0) {
          // 无人裁决 ⇒ 应答 cancelled，避免内核悬挂（PORTING-PLAN §2.3）
          this.respond(id, { outcome: { outcome: "cancelled" } });
          return;
        }
        this.emit("permission", { id, params });
        return;
      }
      case EXT_SERVER_REQUEST.askUserQuestion: {
        if (this.listenerCount("askUserQuestion") === 0) {
          this.respond(id, { outcome: "cancelled" });
          return;
        }
        this.emit("askUserQuestion", { id, params });
        return;
      }
      case EXT_SERVER_REQUEST.exitPlanMode: {
        if (this.listenerCount("exitPlanMode") === 0) {
          this.respond(id, { outcome: "cancelled" });
          return;
        }
        this.emit("exitPlanMode", { id, params });
        return;
      }
      case CLIENT_SIDE_METHOD.elicitation:
      case EXT_SERVER_REQUEST.mcpElicit: {
        if (this.listenerCount("elicitation") === 0) {
          this.respond(id, { action: { outcome: "cancelled" } });
          return;
        }
        this.emit("elicitation", { id, method, params });
        return;
      }
      case EXT_SERVER_REQUEST.folderTrustRequest: {
        // 不应答 ⇒ 内核超时后 stay gated 并释放 dedup key（每次开会话重问）。
        // 显式回 reject 至少是一个**决定**，语义比 METHOD_NOT_FOUND 干净。
        // 要真支持 GUI 信任提示：caps.ts 声明 folderTrust.interactive + 监听本事件。
        if (this.listenerCount("folderTrust") === 0) {
          // 显式 reject 而非 METHOD_NOT_FOUND：后者会被内核判为「not a decision」，
          // 释放 dedup key 导致每次开会话重问；reject 是一个**决定**，内核保留
          // dedup key（folder_trust_prompt.rs:221-228），同进程内不再重复问。
          // 拒绝不持久化，只是工作区继续 gated（仓库级 MCP/配置不加载）。
          // 注：本机自建内核 is_local_build()⇒folder_trust_inert()，实际不会走到这里；
          // 该分支是为 release-stamped 构建准备的（见 docs/contract/capability-gates.md）。
          warn("folder_trust/request 无人裁决：回 reject，工作区保持 gated（仓库级 MCP/配置不加载）");
          this.respond(id, FOLDER_TRUST_REJECT);
          return;
        }
        this.emit("folderTrust", { id, params });
        return;
      }
      case CLIENT_SIDE_METHOD.waitForTerminalExit:
        // 第一方行为：拒绝并让调用方轮询（nofy-pager/src/acp/mod.rs
        // wait_for_exit_not_supported）。PLAN.md §2.2。
        this.respondError(id, METHOD_NOT_FOUND, "nofy-desktop does not handle WaitForTerminalExit");
        return;
      case CLIENT_SIDE_METHOD.readTextFile:
      case CLIENT_SIDE_METHOD.writeTextFile:
      case CLIENT_SIDE_METHOD.createTerminal:
      case CLIENT_SIDE_METHOD.terminalOutput:
      case CLIENT_SIDE_METHOD.releaseTerminal:
      case CLIENT_SIDE_METHOD.killTerminal:
        // clientCapabilities 未声明 fs 与 terminal（caps.ts），内核正常不会委托。
        // 若仍收到，显式回 METHOD_NOT_FOUND 而非旧路的一律 {}——静默成功会掩盖契约漂移。
        this.countUnhandled(method, "server-request");
        this.respondError(id, METHOD_NOT_FOUND, "nofy-desktop does not declare this client capability: " + method);
        return;
      default:
        this.countUnhandled(method, "server-request");
        this.respondError(id, METHOD_NOT_FOUND, "nofy-desktop does not implement: " + method);
        return;
    }
  }
}

/* ─────────────────────────── 单例 ─────────────────────────── */

let singleton: KernelConnection | null = null;
let ensureInflight: Promise<KernelConnection> | null = null;

/** 获取（惰性创建）全进程唯一的内核连接；不触发派生。 */
export function getKernel(): KernelConnection {
  singleton ??= new KernelConnection();
  return singleton;
}

/** 确保单例已派生子进程并完成 initialize。并发调用共享同一次 ensure。 */
export function ensureKernel(timeoutMs?: number): Promise<KernelConnection> {
  ensureInflight ??= (async () => {
    const c = getKernel();
    if (c.isInitialized && c.isOpen()) return c;
    if (!c.isOpen()) c.connect();
    await c.ready(timeoutMs);
    return c;
  })().finally(() => {
    ensureInflight = null;
  });
  return ensureInflight;
}








