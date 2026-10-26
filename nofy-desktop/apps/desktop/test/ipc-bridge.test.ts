/**
 * IPC 边界门 —— S0 的验收核心。
 *
 * 守四件事：
 *  1. **不丢帧**：无客户端期间的信号被缓冲，attach 时按序回放；
 *  2. **不重复**：同一订阅者不会收到两份同一信号（sticky 顶替 buffer 里的
 *     status/ready；server-request 按 id 去重；已应答的不再重投）；
 *  3. **不悬死**：未应答的 server-request 跨 reload 重投；连接断开则清账
 *     （否则会重投一批点了没反应的僵尸审批卡）；
 *  4. **边界透明**：真夹具经 bridge + adaptIpcBridge 得到的 AppState
 *     与直连 adaptConnection 逐字段相等 —— 这是「bind/effects/project 一行不改
 *     就能跨进程」这句话的**可执行版本**。
 *
 * 全部在 node 下跑，不需要 Electron：bridge 不认识 electron，
 * ipc-port 的桥是参数传进来的（内存 IPC 对拉，形状与 preload 一致）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { AGENT_METHOD } from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { createKernelBridge } from "../main/seam/bridge.ts";
import { adaptIpcBridge } from "../renderer/seam/ipc-port.ts";
import { bindKernel } from "../renderer/core/bind.ts";
import { runEffect } from "../renderer/core/effects.ts";
import type { KernelPort, KernelSignal, RpcId } from "../renderer/core/kernel-port.ts";
import type { BootstrapInfo, NofyBridge } from "../preload/contract.ts";
import { fixtureExists, loadFixture } from "./helpers/replay.ts";
import type { Rec } from "./helpers/replay.ts";
import type { AppState } from "../renderer/core/store/state.ts";

/* ═══════════════════════ 测试替身 ═══════════════════════ */

type Out =
  | { op: "request"; method: string; params: unknown }
  | { op: "extRequest"; method: string; params: unknown }
  | { op: "notify"; method: string; params: unknown }
  | { op: "respond"; id: RpcId; result: unknown }
  | { op: "cancel"; sessionId: string };

function makePort() {
  const out: Out[] = [];
  const listeners = new Set<(s: KernelSignal) => void>();
  const replies = new Map<string, unknown>();
  let ready = false;
  const port: KernelPort = {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    request: async (method, params) => {
      out.push({ op: "request", method, params });
      if (replies.has(method)) return replies.get(method);
      throw new Error("no reply stubbed for " + method);
    },
    extRequest: async (method, params) => {
      out.push({ op: "extRequest", method, params });
      if (replies.has(method)) return replies.get(method);
      throw new Error("no reply stubbed for " + method);
    },
    notify: (method, params) => {
      out.push({ op: "notify", method, params });
    },
    respond: (id, result) => {
      out.push({ op: "respond", id, result });
    },
    cancel: (sessionId) => {
      out.push({ op: "cancel", sessionId });
    },
    isReady: () => ready,
  };
  return {
    port,
    out,
    replies,
    setReady: (v: boolean) => {
      ready = v;
    },
    push: (sig: KernelSignal) => {
      for (const fn of [...listeners]) fn(sig);
    },
    ops: (op: Out["op"]) => out.filter((x) => x.op === op),
  };
}

const BOOTSTRAP: BootstrapInfo = {
  cwd: "/tmp/ws",
  clientVersion: "0.1.0",
  appVersion: "0.1.0",
  platform: "darwin",
  arch: "arm64",
  kernelPid: 4242,
  kernelConnected: true,
  isolatedHome: null,
};

/**
 * 内存 IPC：与 preload/index.ts **同形状**（含早到暂存），
 * 只是把 ipcRenderer.invoke 换成直接调用。
 * 用它测的是边界语义，不是 Electron 的传输实现。
 */
function createMemoryIpc(bridge: ReturnType<typeof createKernelBridge>): NofyBridge {
  const listeners = new Set<(s: KernelSignal) => void>();
  const early: KernelSignal[] = [];
  let droppedEarly = 0;
  let attached: { detach: () => void } | null = null;
  const sink = (sig: KernelSignal): void => {
    if (listeners.size === 0) {
      if (early.length >= 1000) {
        early.shift();
        droppedEarly++;
      }
      early.push(sig);
      return;
    }
    for (const fn of [...listeners]) fn(sig);
  };
  return {
    onSignal: (cb) => {
      listeners.add(cb);
      if (early.length > 0) {
        for (const sig of early.splice(0, early.length)) cb(sig);
      }
      return () => {
        listeners.delete(cb);
      };
    },
    subscribe: async () => {
      attached?.detach();
      const client = bridge.attach(sink);
      attached = client;
      return { replayed: client.replayed, clients: bridge.stats().clients };
    },
    request: (m, p) => bridge.request(m, p),
    extRequest: (m, p) => bridge.extRequest(m, p),
    notify: async (m, p) => {
      bridge.notify(m, p);
    },
    respond: async (id, r) => {
      bridge.respond(id, r);
    },
    cancel: async (sid) => {
      bridge.cancel(sid);
    },
    isReady: async () => bridge.isReady(),
    bootstrap: async () => BOOTSTRAP,
    readRaster: async () => ({ ok: false, error: "Unavailable in memory IPC" }),
    watchFiles: async () => ({ ok: true }),
    unwatchFiles: async () => {},
    onFilesChanged: () => () => {},
    pickFiles: async () => [],
    applyDesktopHost: async () => {},
    pickDirectory: async () => null,
    validateDirectory: async path => path,
    saveText: async () => false,
    copyFilePath: async () => ({ ok: false, error: "Native clipboard not available in the memory test" }),
    openWorkspacePath: async () => ({ ok: false, error: "Native open not available in the memory test" }),
    readModelConfig: async () => ({ revisionHash: "test", format: "missing", editable: true, reason: null, defaultModelId: null, models: [], providers: [] }),
    updateModelConfig: async () => { throw new Error("Model config is not available in the in-memory boundary test"); },
    browserNavigate: async () => ({ url: "", title: "", loading: false, canGoBack: false, canGoForward: false, error: null }),
    browserCommand: async () => ({ url: "", title: "", loading: false, canGoBack: false, canGoForward: false, error: null }),
    browserSetBounds: async () => ({ url: "", title: "", loading: false, canGoBack: false, canGoForward: false, error: null }),
    browserOpenExternal: async () => ({ ok: false, error: "scheme" }),
    browserHost: async () => ({ ok: true, zoom: 1, zoomLabel: "100%", device: "off", downloads: [], extensions: [], find: null, imported: null, skippedPasswords: false, cleared: false, saved: false, cancelled: false, store: false }),
    onBrowserState: () => () => {},
    onBrowserHostEvent: () => () => {},
    diagnostics: () => ({ listeners: listeners.size, early: early.length, droppedEarly, rejected: 0 }),
  };
}

const notif = (method: string, n: number): KernelSignal => ({
  kind: "notification",
  method,
  params: { n },
});
const serverReq = (id: RpcId, sessionId: string): KernelSignal => ({
  kind: "server-request",
  id,
  method: "session/request_permission",
  params: { sessionId, options: [] },
});

/* ═══════════════════════ 1. 缓冲 / 回放 / 不重复 ═══════════════════════ */

test("无客户端时缓冲，attach 按序回放，之后转直播", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push({ kind: "status", connected: true });
  h.push({ kind: "ready", result: { agentVersion: "0.2.121" } });
  h.push(notif("a", 1));
  h.push(notif("b", 2));
  assert.deepEqual(bridge.stats(), { clients: 0, buffered: 4, dropped: 0, outstanding: 0 });

  const got: KernelSignal[] = [];
  const client = bridge.attach((s) => got.push(s));
  assert.equal(client.replayed, 4);
  assert.deepEqual(
    got.map((s) => s.kind),
    ["status", "ready", "notification", "notification"],
  );
  assert.equal(bridge.stats().buffered, 0);

  h.push(notif("c", 3));
  assert.equal(got.length, 5, "attach 后应转直播");
  assert.equal(bridge.stats().buffered, 0);

  client.detach();
  h.push(notif("d", 4));
  assert.equal(got.length, 5, "detach 后不再投递");
  assert.equal(bridge.stats().buffered, 1);
  bridge.dispose();
});

test("reload：迟到订阅者拿到 sticky 的 status/ready，但不重放已消费的事件", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push({ kind: "status", connected: true });
  h.push({ kind: "ready", result: { agentVersion: "0.2.121" } });

  const first: KernelSignal[] = [];
  const c1 = bridge.attach((s) => first.push(s));
  h.push(notif("consumed", 1));
  c1.detach();

  // 模拟界面重载：buffer 已空，只有 sticky 能救回来
  const second: KernelSignal[] = [];
  const c2 = bridge.attach((s) => second.push(s));
  assert.deepEqual(
    second.map((s) => s.kind),
    ["status", "ready"],
    "重载后必须重新拿到连接状态与 initialize 结果",
  );
  assert.equal(
    second.some((s) => s.kind === "notification"),
    false,
    "已消费的事件不得重放（重放会造成重复块）",
  );
  c2.detach();
  bridge.dispose();
});

/* ═══════════════════════ 2. server-request 不悬死 ═══════════════════════ */

test("未应答的 server-request 跨 attach 重投；respond 后不再重投", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push(serverReq(7, "s1"));

  const a: KernelSignal[] = [];
  const ca = bridge.attach((s) => a.push(s));
  assert.equal(a.filter((s) => s.kind === "server-request").length, 1);
  ca.detach();

  const b: KernelSignal[] = [];
  const cb = bridge.attach((s) => b.push(s));
  assert.equal(b.filter((s) => s.kind === "server-request").length, 1, "重载后权限请求必须还在");
  assert.equal(bridge.stats().outstanding, 1);

  bridge.respond(7, { outcome: { outcome: "selected", optionId: "allow-once" } });
  assert.deepEqual(h.ops("respond"), [{ op: "respond", id: 7, result: { outcome: { outcome: "selected", optionId: "allow-once" } } }]);
  cb.detach();

  const c: KernelSignal[] = [];
  const cc = bridge.attach((s) => c.push(s));
  assert.equal(c.filter((s) => s.kind === "server-request").length, 0, "已应答的请求不得重投");
  assert.equal(bridge.stats().outstanding, 0);
  cc.detach();
  bridge.dispose();
});

test("连接断开清空 outstanding（僵尸审批卡防线）", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push(serverReq(9, "s1"));
  h.push({ kind: "status", connected: false });
  assert.equal(bridge.stats().outstanding, 0);

  const got: KernelSignal[] = [];
  const c = bridge.attach((s) => got.push(s));
  assert.equal(got.some((s) => s.kind === "server-request"), false);
  c.detach();
  bridge.dispose();
});

test("cancel 连带清账：只清该会话的挂起请求", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push(serverReq(11, "s1"));
  h.push(serverReq(12, "s2"));
  bridge.cancel("s1");
  assert.deepEqual(h.ops("cancel"), [{ op: "cancel", sessionId: "s1" }]);

  const got: KernelSignal[] = [];
  const c = bridge.attach((s) => got.push(s));
  const ids = got.filter((s) => s.kind === "server-request").map((s) => (s.kind === "server-request" ? s.id : null));
  assert.deepEqual(ids, [12], "s1 的请求已被 cancel 应答，只剩 s2");
  c.detach();
  bridge.dispose();
});

test("缓冲溢出丢最旧并计数（内存不得无上界）", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  for (let i = 0; i < 20_005; i++) h.push(notif("x", i));
  const st = bridge.stats();
  assert.equal(st.buffered, 20_000);
  assert.equal(st.dropped, 5);
  const got: KernelSignal[] = [];
  const c = bridge.attach((s) => got.push(s));
  const first = got[0];
  assert.equal(first?.kind, "notification");
  assert.deepEqual(first?.kind === "notification" ? first.params : null, { n: 5 }, "最旧的 5 条被丢");
  c.detach();
  bridge.dispose();
});

/* ═══════════════════════ 3. 握手与订阅的顺序无关 ═══════════════════════ */

test("握手早于订阅也不丢 ready（ipc-port 的早到暂存）", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  h.push({ kind: "status", connected: true });
  h.push({ kind: "ready", result: { agentVersion: "0.2.121", _meta: {} } });

  // adaptIpcBridge 构造时就发 subscribe，而 bindKernel 的订阅在其后
  const port = adaptIpcBridge(createMemoryIpc(bridge));
  const bound = bindKernel(port);
  assert.equal(bound.store.getState().connection.status, "ready");
  assert.equal(bound.store.getState().connection.agentVersion, "0.2.121");
  assert.equal(port.isReady(), true);
  bridge.dispose();
});

test("isReady 随 status:false 落回 false", () => {
  const h = makePort();
  const bridge = createKernelBridge(h.port);
  const port = adaptIpcBridge(createMemoryIpc(bridge));
  bindKernel(port);
  h.push({ kind: "ready", result: {} });
  assert.equal(port.isReady(), true);
  h.push({ kind: "status", connected: false });
  assert.equal(port.isReady(), false);
  bridge.dispose();
});

/* ═══════════════════════ 4. 边界透明（真夹具） ═══════════════════════ */

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * 夹具帧 → KernelSignal。
 *
 * 只有 initialize 的 response 是信号（ready）；其余 response 是 port.request 的
 * resolve 值，走 replies 表——这正是真实链路里的分工，别把它们混成一路。
 */
function signalsFrom(recs: Rec[]): { signals: KernelSignal[]; newSessionReply: Record<string, unknown> | null } {
  const signals: KernelSignal[] = [{ kind: "status", connected: true }];
  let newSessionReply: Record<string, unknown> | null = null;
  for (const r of recs) {
    const f: InboundFrame = r.frame;
    if (f.kind === "response") {
      const res = isObj(f.result) ? f.result : null;
      if (res === null) continue;
      if (f.id === 1) signals.push({ kind: "ready", result: res });
      else if (typeof res["sessionId"] === "string" && newSessionReply === null) newSessionReply = res;
      continue;
    }
    if (f.kind === "notification") {
      signals.push({ kind: "notification", method: f.method, params: f.params });
      continue;
    }
    if (f.kind === "server-request") {
      signals.push({ kind: "server-request", id: f.id, method: f.method, params: isObj(f.params) ? f.params : {} });
      continue;
    }
    signals.push({ kind: "malformed", reason: f.reason });
  }
  return { signals, newSessionReply };
}

const hasTurn = fixtureExists("golden-turn.jsonl");

/** 直连基线：信号 → bindKernel，session/new 走 Effect。 */
async function directState(signals: KernelSignal[], reply: Record<string, unknown> | null): Promise<{ state: AppState; ops: Out[] }> {
  const h = makePort();
  if (reply !== null) h.replies.set(AGENT_METHOD.newSession, reply);
  const bound = bindKernel(h.port);
  if (reply !== null) await runEffect(h.port, bound.store, { kind: "session/new", cwd: "/tmp/ws" });
  for (const s of signals) h.push(s);
  return { state: bound.store.getState(), ops: h.out };
}

/** 跨边界：同一批信号，但中间插一层 bridge + 内存 IPC + adaptIpcBridge。 */
async function bridgedState(
  signals: KernelSignal[],
  reply: Record<string, unknown> | null,
  bufferFirst: number,
): Promise<{ state: AppState; ops: Out[]; stats: ReturnType<ReturnType<typeof createKernelBridge>["stats"]> }> {
  const h = makePort();
  if (reply !== null) h.replies.set(AGENT_METHOD.newSession, reply);
  const bridge = createKernelBridge(h.port);
  // bufferFirst > 0 ⇒ 模拟「内核先握手、界面后加载」的真实启动顺序
  for (const s of signals.slice(0, bufferFirst)) h.push(s);
  const port = adaptIpcBridge(createMemoryIpc(bridge));
  const bound = bindKernel(port);
  if (reply !== null) await runEffect(port, bound.store, { kind: "session/new", cwd: "/tmp/ws" });
  for (const s of signals.slice(bufferFirst)) h.push(s);
  return { state: bound.store.getState(), ops: h.out, stats: bridge.stats() };
}

test("边界透明：golden-turn 跨 IPC 与直连终态逐字段相等", { skip: hasTurn ? false : "缺 golden-turn.jsonl" }, async () => {
  const { signals, newSessionReply } = signalsFrom(loadFixture("golden-turn.jsonl"));
  assert.ok(signals.length > 10, "夹具应给出足够多的信号，否则本门是空转");

  const base = await directState(signals, newSessionReply);
  const bridged = await bridgedState(signals, newSessionReply, 0);
  assert.equal(bridged.stats.dropped, 0);
  assert.deepEqual(zeroTurnClocks(bridged.state), zeroTurnClocks(base.state), "跨 IPC 的 AppState 必须与直连完全一致");
  assert.deepEqual(
    bridged.ops.map((o) => o.op),
    base.ops.map((o) => o.op),
    "出站原语序列也必须一致（请求没被降级成通知、反之亦然）",
  );
});

test("边界透明：内核先跑、界面后挂（启动缓冲路径）终态仍相等", { skip: hasTurn ? false : "缺 golden-turn.jsonl" }, async () => {
  const { signals, newSessionReply } = signalsFrom(loadFixture("golden-turn.jsonl"));
  const base = await directState(signals, newSessionReply);
  const cut = Math.floor(signals.length * 0.4);
  assert.ok(cut > 3, "切点应落在事件流中段");
  const bridged = await bridgedState(signals, newSessionReply, cut);
  assert.equal(bridged.stats.dropped, 0, "启动缓冲不应溢出");
  assert.deepEqual(zeroTurnClocks(bridged.state), zeroTurnClocks(base.state), "缓冲回放后的终态必须与直连一致");
});
/**
 * turns 是本地墙钟（Date.now()），两次跑必然差几毫秒——本门验的是 IPC 透明性，
 * 不是本地计时，比较前归零（2026-09-11 回合折叠批引入 turns 后加的垫片）。
 */
function zeroTurnClocks<T>(state: T): T {
  const s = state as { sessions?: Record<string, { turns?: Array<{ startedAt: number; endedAt: number | null }> }> };
  for (const sess of Object.values(s.sessions ?? {})) {
    sess.turns = (sess.turns ?? []).map((t) => ({ startedAt: 0, endedAt: t.endedAt === null ? null : 0 }));
  }
  return state;
}
