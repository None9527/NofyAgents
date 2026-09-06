// nofy kernel ACP client — A1 Track A（main 进程原生 ACP 单例）
//
// PORTING-PLAN §阶段 A / §3：ACP 连接归 main 所有。serve 模式下内核只把出站通知
// 转发给当前连着的那条 WS（§2.3 单客户端约束），第二条并发连接会抢走/丢失事件流
// ⇒ 全进程唯一实例（getNofyKernelClient / ensureNofyKernelClient），workspace 枚举、
// 会话主流程、host IPC 全部复用这一条连接。
//
// 吸收 seam/acp-client.js 已验证部分（帧分派 / pending 表 / 重连 / 事件面），
// 修正其已证实错误：
//   1. session/cancel 是 notification（无 id）——§2.1/§2.5.1：作为 request 发送得
//      -32601（acp-client.js:196 错发 request 且 catch{} 吞掉）；cancel 时同时把该
//      会话所有挂起权限请求应答 cancelled（§2.3）。
//   2. initialize 携带 _meta.clientIdentifier="nofy-desktop"（§2.1 initialize 请求侧
//      要点；内核认识该标识，Desktop 类拿到更丰富的权限选项集）。
//   3. 内核扩展方法线上全部 `_nofy/*` 下划线前缀、双向（§2.2）：ext() 幂等补前缀，
//      入站扩展通知按 `_nofy/` 名分派。
//   4. clientCapabilities.fs 声明 false（§2.3 桌面建议；内核用本地实现）。
//
// 事件（EventEmitter）：
//   'status'          {connected}                 连接状态
//   'ready'           {}                          initialize 完成
//   'acp'             {kind:"notification"|"request", method, params, id?}
//                                                 全部入站通知/请求（bridge 多路复用面）
//   'update'          params                      session/update 主流式通道
//   'ext-update'      params                      _nofy/session/update 持久轨
//   'notification'    params                      _nofy/session_notification
//   'sessions'        params                      _nofy/sessions/changed（roster 增量）
//   'models'          params                      _nofy/models/update（完整 modelState）
//   'settings'        params                      _nofy/settings/update
//   'queue'           params                      _nofy/queue/changed
//   'replayed'        {sessionId}                 _nofy/replayed（load 回放收尾）
//   'permission'      {id, params}                session/request_permission（需 respond）
//   'ask-user-question' {id, params}              _nofy/ask_user_question
//   'exit-plan-mode'  {id, params}                _nofy/exit_plan_mode
//   'elicitation'     {id, method, params}        session/elicitation | _nofy/mcp/elicit

import { EventEmitter } from "node:events";
import { createInterface } from "node:readline";
import WebSocket from "ws";
import { ensureKernel } from "./kernel-supervisor.js";

const DEFAULT_READY_TIMEOUT_MS = 8_000;

export class NofyKernelClient extends EventEmitter {
  constructor({ url = null, clientIdentifier = "nofy-desktop", clientVersion = "0.1.0", reconnectMs = 2_000 } = {}) {
    super();
    this.url = url;
    this.endpointMode = null; // kernel-supervisor 发现模式（attach-*/spawned/…）
    this.clientIdentifier = clientIdentifier;
    this.clientVersion = clientVersion;
    this.reconnectMs = reconnectMs;
    this.ws = null;
    // 传输抽象（P0.5）：{kind:"ws"|"stdio", isOpen(), send(text), close()}。
    // ACP 帧在两种传输上同形（WS 文本帧 / stdio 行式 JSON），故协议层共用。
    this.io = null;
    this.child = null; // stdio 形态的内核子进程（桌面私有，父死子亡）
    this.stdioFactory = null; // 重连时重新派生子进程的工厂（kernel-supervisor 注入）
    this.nextId = 1;
    this.pending = new Map(); // 我方 request id → {resolve, reject, timer?}
    this.serverRequests = new Set(); // 未应答的 server→client request id
    this.pendingPermissions = new Map(); // server→client 权限请求 id → sessionId
    this.initialized = false;
    this.closedByUser = false;
    this.reconnectTimer = null;
    this.readyWaiters = [];
    this.initializeResult = null;
    this.initializeParams = null; // 最近一次 initialize 请求载荷（探针/诊断用）
  }

  /* ─────────────────────────── 连接管理 ─────────────────────────── */

  setEndpoint(url, mode = null) {
    if (!url) return;
    if (this.url === url) {
      if (mode) this.endpointMode = mode;
      return;
    }
    this.url = url;
    this.endpointMode = mode ?? this.endpointMode;
    if (this.ws || this.io) {
      // 端点变更：拆旧连接，由调用方重新 connect()
      try {
        this.io?.close();
      } catch {}
      this.io = null;
      this.ws = null;
      this.stdioMode = false;
      this.initialized = false;
      this.failPending(new Error("kernel endpoint changed"));
    }
  }

  isOpen() {
    return !!this.io && this.io.isOpen();
  }

  /** 传输无关的出站原语；返回是否已写出。 */
  _sendText(text) {
    if (!this.io || !this.io.isOpen()) return false;
    try {
      this.io.send(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * stdio 传输（P0.5 默认拓扑）：内核作为桌面私有协议子进程
   * （`nofy agent stdio`，行式 JSON-RPC over 继承管道；无端口、无 secret、
   * 天然单父客户端）。stdin EOF 即子进程关停 ⇒ 生命周期随桌面。
   */
  attachStdioChild(child) {
    if (!child) return;
    if (this.io?.kind === "stdio") {
      try {
        this.io.close();
      } catch {}
    }
    this.child = child;
    this.stdioMode = true;
    this.endpointMode = this.endpointMode ?? "stdio-child";
    // 内核把协议写 stdout、日志写 stderr；stderr 必须消费防背压堵死子进程。
    child.stderr?.resume();
    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => this.onFrame(line));
    child.on("exit", (code) => {
      rl.close();
      this.emit("status", { connected: false });
      this.failPending(new Error(`kernel child exited (code=${code})`));
      this.serverRequests.clear();
      this.pendingPermissions.clear();
      this.initialized = false;
      this.io = null;
      this.child = null;
      if (!this.closedByUser) this.scheduleReconnect();
    });
    this.io = {
      kind: "stdio",
      isOpen: () => child.exitCode == null && child.signalCode == null && child.stdin?.writable !== false,
      send: (text) => child.stdin.write(text + "\n"),
      close: () => {
        try {
          child.stdin.end();
        } catch {}
      },
    };
    this.emit("status", { connected: true });
    void this.handshake();
  }

  connect() {
    // stdio 形态：重连＝重新派生子进程（工厂由 kernel-supervisor 注入）
    if (this.stdioMode) {
      if (this.io?.kind === "stdio" && this.io.isOpen()) return;
      if (!this.stdioFactory) throw new Error("NofyKernelClient: stdio mode without stdioFactory");
      void this.stdioFactory()
        .then((child) => this.attachStdioChild(child))
        .catch(() => this.scheduleReconnect());
      return;
    }
    if (!this.url) throw new Error("NofyKernelClient: no endpoint (setEndpoint/ensureNofyKernelClient first)");
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    let ws;
    try {
      ws = new WebSocket(this.url);
    } catch (e) {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    this.io = {
      kind: "ws",
      isOpen: () => ws.readyState === WebSocket.OPEN,
      send: (text) => ws.send(text),
      close: () => {
        try {
          ws.removeAllListeners();
          ws.close();
        } catch {}
      },
    };
    ws.on("open", () => {
      this.emit("status", { connected: true });
      void this.handshake();
    });
    ws.on("message", (data) => this.onFrame(String(data)));
    ws.on("close", () => {
      this.emit("status", { connected: false });
      this.failPending(new Error("connection closed"));
      this.serverRequests.clear();
      this.pendingPermissions.clear();
      this.initialized = false;
      this.io = null;
      if (!this.closedByUser) this.scheduleReconnect();
    });
    ws.on("error", () => {
      try {
        ws.close();
      } catch {}
    });
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.closedByUser) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectMs);
  }

  close() {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.failPending(new Error("closed"));
    try {
      this.io?.close();
    } catch {}
    this.io = null;
    this.ws = null;
  }

  /* ─────────────────────────── 握手 ─────────────────────────── */

  async handshake() {
    const params = {
      protocolVersion: 1,
      // §2.3：fs/terminal 不声明能力，内核用本地实现（桌面不自管）
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        elicitation: { form: {}, url: {} },
      },
      clientInfo: { name: this.clientIdentifier, version: this.clientVersion },
      // §2.1：内核认识 nofy-desktop 标识（Desktop 类权限选项集更丰富）
      _meta: { clientIdentifier: this.clientIdentifier },
    };
    try {
      const result = await this.rpc("initialize", params);
      this.initializeParams = params;
      this.initializeResult = result ?? {};
      this.initialized = true;
      const waiters = this.readyWaiters.splice(0);
      for (const w of waiters) w();
      this.emit("ready", {});
    } catch (e) {
      console.warn("[nofy-kernel-client] initialize failed", e?.message);
    }
  }

  ready(timeoutMs = DEFAULT_READY_TIMEOUT_MS) {
    if (this.initialized) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.readyWaiters.push(resolve);
      setTimeout(() => {
        if (!this.initialized) reject(new Error(`kernel client not ready (${timeoutMs}ms)`));
      }, timeoutMs);
    });
  }

  /** initialize._meta.modelState（§2.4：模型表唯一来源，桌面不维护自己的注册表） */
  get modelState() {
    return this.initializeResult?._meta?.modelState ?? null;
  }

  stateSnapshot() {
    return {
      initialized: this.initialized,
      url: this.url,
      endpointMode: this.endpointMode,
      clientIdentifier: this.clientIdentifier,
      agentVersion: this.initializeResult?._meta?.agentVersion ?? this.initializeResult?.agentVersion ?? null,
      authMethods: this.initializeResult?.authMethods ?? [],
      agentCapabilities: this.initializeResult?.agentCapabilities ?? null,
      modelState: this.modelState,
    };
  }

  /* ─────────────────────────── 出站 ─────────────────────────── */

  rpc(method, params, timeoutMs = 0) {
    if (!this.isOpen()) {
      return Promise.reject(new Error(`kernel not connected (${this.url ?? this.endpointMode ?? "no endpoint"})`));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const entry = { resolve, reject, timer: null };
      if (timeoutMs > 0) {
        entry.timer = setTimeout(() => {
          if (this.pending.delete(id)) reject(new Error(`${method} timeout (${timeoutMs}ms)`));
        }, timeoutMs);
      }
      this.pending.set(id, entry);
      if (!this._sendText(JSON.stringify({ jsonrpc: "2.0", id, method, params }))) {
        this.pending.delete(id);
        if (entry.timer) clearTimeout(entry.timer);
        reject(new Error(`kernel send failed (${method})`));
      }
    });
  }

  /**
   * 内核扩展方法（§2.2：线上全部 `_nofy/*` 前缀）。幂等补前缀：
   * "a/b" | "nofy/a/b" | "_nofy/a/b" → "_nofy/a/b"
   */
  ext(method, params, timeoutMs = 0) {
    return this.rpc(NofyKernelClient.extMethodName(method), params, timeoutMs);
  }

  static extMethodName(method) {
    const m = String(method ?? "");
    if (m.startsWith("_nofy/")) return m;
    if (m.startsWith("nofy/")) return `_${m}`;
    return `_nofy/${m}`;
  }

  /** notification（无 id、无应答）。返回是否已发出。 */
  notify(method, params) {
    return this._sendText(JSON.stringify({ jsonrpc: "2.0", method, params }));
  }

  /**
   * 停止：§2.1 session/cancel 是 notification（request 形式得 -32601，§2.5.1）。
   * §2.3：cancel 时把该会话所有挂起权限请求应答 cancelled。
   */
  cancel(sessionId, meta) {
    const params = { sessionId };
    if (meta && typeof meta === "object") params._meta = meta;
    const sent = this.notify("session/cancel", params);
    for (const [id, sid] of [...this.pendingPermissions]) {
      if (sid === String(sessionId)) this.respond(id, { outcome: { outcome: "cancelled" } });
    }
    return sent;
  }

  /** 应答 server→client request（权限/问答/计划模式/表单）。重复应答幂等。 */
  respond(id, result) {
    if (!this.serverRequests.has(id)) return false;
    this.serverRequests.delete(id);
    this.pendingPermissions.delete(id);
    return this._sendText(JSON.stringify({ jsonrpc: "2.0", id, result }));
  }

  respondPermission(id, outcome) {
    return this.respond(id, { outcome });
  }

  /* ─────────────────────────── 入站 ─────────────────────────── */

  failPending(err) {
    for (const w of this.pending.values()) {
      if (w.timer) clearTimeout(w.timer);
      w.reject(err);
    }
    this.pending.clear();
  }

  onFrame(data) {
    let frame;
    try {
      frame = JSON.parse(data);
    } catch {
      return;
    }
    // 我方 request 的应答
    if (frame.id != null && frame.method === undefined && (frame.result !== undefined || frame.error !== undefined)) {
      const waiter = this.pending.get(frame.id);
      if (!waiter) return;
      this.pending.delete(frame.id);
      if (waiter.timer) clearTimeout(waiter.timer);
      if (frame.error) {
        const err = new Error(frame.error.message ?? "rpc error");
        err.code = frame.error.code;
        waiter.reject(err);
      } else waiter.resolve(frame.result);
      return;
    }
    const params = frame.params ?? {};
    // server→client request（需应答）
    if (frame.id != null && frame.method !== undefined) {
      this.handleServerRequest(frame.id, frame.method, params);
      return;
    }
    // notification（§2.2：扩展通知线上带 `_nofy/` 前缀）
    if (frame.method !== undefined) {
      this.emit("acp", { kind: "notification", method: frame.method, params });
      switch (frame.method) {
        case "session/update":
          this.emit("update", params);
          break;
        case "_nofy/session/update":
          this.emit("ext-update", params);
          break;
        case "_nofy/session_notification":
          this.emit("notification", params);
          break;
        case "_nofy/sessions/changed":
          this.emit("sessions", params);
          break;
        case "_nofy/models/update":
          this.emit("models", params);
          break;
        case "_nofy/settings/update":
          this.emit("settings", params);
          break;
        case "_nofy/queue/changed":
          this.emit("queue", params);
          break;
        case "_nofy/replayed":
          this.emit("replayed", { sessionId: String(params.sessionId ?? "") });
          break;
        default:
          break; // 其余 _nofy/* 杂项事件经 'acp' 面消费
      }
    }
  }

  handleServerRequest(id, method, params) {
    this.serverRequests.add(id);
    this.emit("acp", { kind: "request", method, params, id });
    switch (method) {
      case "session/request_permission":
        this.pendingPermissions.set(id, String(params?.sessionId ?? ""));
        this.emit("permission", { id, params });
        // 无人裁决 ⇒ 应答 cancelled，避免内核悬挂（§2.3 取消语义）
        if (this.listenerCount("permission") === 0) this.respond(id, { outcome: { outcome: "cancelled" } });
        break;
      case "_nofy/ask_user_question":
        this.emit("ask-user-question", { id, params });
        if (this.listenerCount("ask-user-question") === 0) this.respond(id, { outcome: "cancelled" });
        break;
      case "_nofy/exit_plan_mode":
        this.emit("exit-plan-mode", { id, params });
        if (this.listenerCount("exit-plan-mode") === 0) this.respond(id, { outcome: "cancelled" });
        break;
      case "session/elicitation":
      case "_nofy/mcp/elicit":
        this.emit("elicitation", { id, method, params });
        if (this.listenerCount("elicitation") === 0) this.respond(id, { action: { outcome: "cancelled" } });
        break;
      default:
        // fs/terminal/未知 server→client 请求：回空结果防悬挂
        //（fs 能力已声明 false、terminal 未声明，内核正常不会委托；兜底）
        this.respond(id, {});
        break;
    }
  }
}

/* ─────────────────────────── 单例 ─────────────────────────── */

let singleton = null;
let ensureInflight = null;

/** 获取（惰性创建）全进程唯一的内核客户端；不触发连接。 */
export function getNofyKernelClient() {
  singleton ??= new NofyKernelClient();
  return singleton;
}

/**
 * 确保单例已连上内核：端点来自 kernel-supervisor 的发现-否则-启动（复用，不重复），
 * 连接 + initialize 完成后返回。并发调用共享同一次 ensure。
 */
export async function ensureNofyKernelClient() {
  ensureInflight ??= (async () => {
    const client = getNofyKernelClient();
    if (client.initialized && client.isOpen()) return client;
    const endpoint = await ensureKernel();
    if (endpoint.child) {
      // P0.5 默认拓扑：私有 stdio 子进程（重连＝重新派生）
      client.stdioFactory = endpoint.respawn ?? null;
      client.attachStdioChild(endpoint.child);
    } else {
      client.setEndpoint(endpoint.url, endpoint.mode);
      client.connect();
    }
    await client.ready();
    return client;
  })().finally(() => {
    ensureInflight = null;
  });
  return ensureInflight;
}

export default NofyKernelClient;
