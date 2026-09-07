// nofy ACP client (Node) — D5c
// 与 web/src2/core/acp.ts 同线路契约（已对真 nofy agent serve 验证过）：
//   initialize / session/list / session/new / session/load(回放, _nofy/replayed 收尾)
//   session/prompt / session/cancel / session/update 流 / session/request_permission 应答
// 事件（EventEmitter）：
//   'status'      {connected}
//   'update'      {sessionId, update}            session/update
//   'notification'{sessionId, update}            _nofy/session_notification
//   'sessions'    {upserted, removed}            _nofy/sessions/changed
//   'replayed'    {sessionId}                    _nofy/replayed
//   'permission'  {id, params}                   session/request_permission（需 respondPermission）

import { EventEmitter } from "node:events";
import { createInterface } from "node:readline";
import WebSocket from "ws";
import { spawnStdioChild } from "./kernel-supervisor.js";

export class NofyAcpClient extends EventEmitter {
  constructor({ url, cwd = process.cwd(), clientName = "nofy-desktop", reconnectMs = 2000, stdio = false }) {
    super();
    this.url = url;
    // P0.5 拓扑：stdio=true 时不用 ws，改为派生私有 `nofy agent stdio` 子进程
    // （无端口/无 secret/天然单父客户端 ⇒ 结构性免除 §2.3 单客户端通知转发约束）。
    this.stdio = stdio;
    this.child = null;
    this.io = null;
    this.cwd = cwd;
    this.clientName = clientName;
    this.reconnectMs = reconnectMs;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.initialized = false;
    this.closedByUser = false;
    this.reconnectTimer = null;
    this.readyWaiters = [];
  }

  connect() {
    if (this.stdio) {
      void this.connectStdio();
      return;
    }
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
    };
    ws.on("open", () => {
      this.emit("status", { connected: true });
      void this.handshake();
    });
    ws.on("message", (data) => this.onFrame(String(data)));
    ws.on("close", () => {
      this.io = null;
      this.emit("status", { connected: false });
      this.failPending(new Error("connection closed"));
      this.initialized = false;
      if (!this.closedByUser) this.scheduleReconnect();
    });
    ws.on("error", () => {
      try {
        ws.close();
      } catch {}
    });
  }

  // P0.5：私有 stdio 子进程传输。行式 JSON-RPC over 继承管道，帧分派复用同一 onFrame。
  async connectStdio() {
    let child;
    try {
      child = await spawnStdioChild();
    } catch (e) {
      console.warn("[acp-client] stdio child spawn failed", e?.message);
      this.emit("status", { connected: false });
      this.scheduleReconnect();
      return;
    }
    this.child = child;
    const stdin = child.stdin;
    this.io = {
      kind: "stdio",
      isOpen: () => !child.killed && stdin.writable,
      send: (text) => stdin.write(text + "\n"),
    };
    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => this.onFrame(line));
    child.stderr.resume();
    child.once("exit", () => {
      rl.close();
      this.io = null;
      this.child = null;
      this.emit("status", { connected: false });
      this.failPending(new Error("kernel stdio child exited"));
      this.initialized = false;
      if (!this.closedByUser) this.scheduleReconnect();
    });
    this.emit("status", { connected: true });
    void this.handshake();
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.closedByUser) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectMs);
  }

  async handshake() {
    try {
      await this.rpc("initialize", {
        protocolVersion: 1,
        clientCapabilities: {
          fs: { readTextFile: false, writeTextFile: false },
          elicitation: { form: {}, url: {} },
        },
        clientInfo: { name: this.clientName, version: "0.1.0" },
      });
      this.initialized = true;
      const waiters = this.readyWaiters.splice(0);
      for (const w of waiters) w();
      this.emit("ready");
    } catch (e) {
      console.warn("[acp-client] initialize failed", e?.message);
    }
  }

  ready(timeoutMs = 8000) {
    if (this.initialized) return Promise.resolve();
    return new Promise((resolve) => {
      this.readyWaiters.push(resolve);
      setTimeout(resolve, timeoutMs);
    });
  }

  rpc(method, params) {
    const io = this.io;
    if (!io || !io.isOpen()) {
      return Promise.reject(new Error(`backend not connected (${io?.kind ?? "none"} ${this.url ?? ""})`));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      io.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    });
  }

  reply(id, result) {
    const io = this.io;
    if (!io || !io.isOpen()) return;
    io.send(JSON.stringify({ jsonrpc: "2.0", id, result }));
  }

  failPending(err) {
    for (const w of this.pending.values()) w.reject(err);
    this.pending.clear();
  }

  onFrame(data) {
    let frame;
    try {
      frame = JSON.parse(data);
    } catch {
      return;
    }
    if (frame.id != null && (frame.result !== undefined || frame.error !== undefined)) {
      const waiter = this.pending.get(frame.id);
      if (!waiter) return;
      this.pending.delete(frame.id);
      if (frame.error) waiter.reject(new Error(frame.error.message));
      else waiter.resolve(frame.result);
      return;
    }
    const params = frame.params ?? {};
    switch (frame.method) {
      case "session/update":
        this.emit("update", params);
        break;
      case "_nofy/session_notification":
        this.emit("notification", params);
        break;
      case "_nofy/sessions/changed":
        this.emit("sessions", params);
        break;
      case "_nofy/replayed":
        this.emit("replayed", { sessionId: String(params.sessionId ?? "") });
        break;
      case "session/request_permission":
        if (frame.id != null) this.emit("permission", { id: frame.id, params });
        break;
      default:
        // 未知 server→client 请求：回空结果，避免内核悬挂
        if (frame.id != null) this.reply(frame.id, {});
    }
  }

  // ------------------------------------------------------------- RPC surface

  async listSessions() {
    await this.ready();
    const result = (await this.rpc("session/list", {})) ?? {};
    return result.sessions ?? [];
  }

  // WS-ENUM：全部 workspace 的会话概览（ACP ext 方法；线上方法名带 '_' 前缀，
  // 内核 ACP 路由 strip_prefix('_') 后命中 nofy/session_summaries/workspace_list）
  // → { all_sessions: { <cwd>: [Summary, ...] } }
  async workspaceSummaries() {
    await this.ready();
    const result = (await this.rpc("_nofy/session_summaries/workspace_list", {})) ?? {};
    return result.all_sessions ?? {};
  }

  async newSession(cwd, scope = "task") {
    await this.ready();
    // 任务路 scope：'task'（项目作用域）；助手路 'os' 预留（kernel 层参数，UI 不动）
    return await this.rpc("session/new", {
      cwd,
      mcpServers: [],
      _meta: { nofy: { session: { scope } } },
    });
  }

  async loadSession(sessionId, cwd) {
    await this.ready();
    return await this.rpc("session/load", { sessionId, cwd: cwd ?? this.cwd, mcpServers: [] });
  }

  async prompt(sessionId, text) {
    return await this.rpc("session/prompt", {
      sessionId,
      prompt: [{ type: "text", text }],
    });
  }

  async cancel(sessionId) {
    try {
      await this.rpc("session/cancel", { sessionId });
    } catch {}
  }

  respondPermission(id, outcome) {
    this.reply(id, { outcome });
  }

  close() {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.failPending(new Error("closed"));
    try {
      this.ws?.close();
    } catch {}
    try {
      // stdin EOF 即子进程关停（probe6/probe7 已证的回收路径）
      this.child?.stdin?.end();
    } catch {}
    this.io = null;
  }
}

export function chunkText(content) {
  if (!content) return "";
  const blocks = Array.isArray(content) ? content : [content];
  return blocks
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
}

export default NofyAcpClient;
