/**
 * 连接层行为测试——用假子进程，不需要真内核。
 *
 * 重点钉住旧路付费最贵的几条（PLAN.md §2.3 陷阱表）：
 *   T1  session/cancel 必须是 notification（无 id）
 *   T2  stdout 纪律由 supervisor 侧保证，此处验 stdin 写出的是单行 JSON
 *   ——  坏帧不得静默（§2.4）
 *   ——  未知通知不得静默（§5）
 *   §2.2 WaitForTerminalExit 必须回 METHOD_NOT_FOUND
 */
import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { ChildProcess } from "node:child_process";
import { KernelConnection } from "../main/acp/connection.ts";

type Fake = {
  child: ChildProcess;
  stdin: PassThrough;
  stdout: PassThrough;
  written: () => Array<Record<string, unknown>>;
  feed: (frame: unknown) => void;
  exit: (code: number) => void;
};

/**
 * 构造一个只满足 attachChild 所需表面的假子进程。
 * 类型断言在此是必要的：ChildProcess 的完整表面无法在测试里忠实构造，
 * 而连接层只依赖 stdin/stdout/stderr/on("exit")/exitCode/signalCode。
 */
function makeFake(): Fake {
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const ee = new EventEmitter() as EventEmitter & {
    stdin: PassThrough;
    stdout: PassThrough;
    stderr: PassThrough;
    exitCode: number | null;
    signalCode: string | null;
    pid: number;
  };
  ee.stdin = stdin;
  ee.stdout = stdout;
  ee.stderr = stderr;
  ee.exitCode = null;
  ee.signalCode = null;
  ee.pid = 424242;

  let buf = "";
  const lines: string[] = [];
  stdin.on("data", (d: Buffer) => {
    buf += String(d);
    let i = buf.indexOf("\n");
    while (i >= 0) {
      lines.push(buf.slice(0, i));
      buf = buf.slice(i + 1);
      i = buf.indexOf("\n");
    }
  });

  return {
    child: ee as unknown as ChildProcess,
    stdin,
    stdout,
    written: () => lines.filter((l) => l.length > 0).map((l) => JSON.parse(l) as Record<string, unknown>),
    feed: (frame: unknown) => {
      stdout.write(typeof frame === "string" ? frame + "\n" : JSON.stringify(frame) + "\n");
    },
    exit: (code: number) => {
      ee.exitCode = code;
      ee.emit("exit", code, null);
    },
  };
}

const tick = () => new Promise((r) => setTimeout(r, 10));

function initResponse(id: number | string) {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: 1,
      agentVersion: "test",
      agentCapabilities: { loadSession: true },
      authMethods: [{ id: "api_key" }],
      _meta: {
        agentVersion: "test",
        modelState: { currentModelId: "m1", availableModels: [{ id: "m1" }] },
        availableCommands: [{ name: "compact" }],
      },
    },
  };
}

test("handshake sends initialize with nofy-desktop identity and fs caps false", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();

  const out = f.written();
  assert.equal(out.length, 1, "exactly one frame written before response");
  const init = out[0]!;
  assert.equal(init["method"], "initialize");
  assert.equal(typeof init["id"], "number");
  const params = init["params"] as Record<string, unknown>;
  assert.equal(params["protocolVersion"], 1);
  assert.deepEqual(params["_meta"], { clientIdentifier: "nofy-desktop" });
  assert.deepEqual(params["clientCapabilities"], {
    fs: { readTextFile: false, writeTextFile: false },
    elicitation: { form: {}, url: {} },
    // 能力门必须在 clientCapabilities._meta 里：folder_trust_prompt.rs:375
    // 「Production reads client_capabilities.meta, not top-level request meta」。
    _meta: { "nofy/folderTrust": { interactive: true } },
  });
  // 陷阱守卫：顶层 _meta 只放身份，放能力门是无效的
  assert.deepEqual(params["_meta"], { clientIdentifier: "nofy-desktop" });
  assert.equal(
    Object.keys(params["_meta"] as Record<string, unknown>).some((k) => k.startsWith("nofy/")),
    false,
    "能力门被放到请求顶层 _meta 了——内核只读 clientCapabilities._meta，这样声明静默失效",
  );

  c.close();
  f.exit(0);
});

test("ready() resolves with initialize result; modelState/availableCommands exposed", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  const id = f.written()[0]!["id"] as number;
  f.feed(initResponse(id));

  const result = await c.ready(1000);
  assert.equal(c.isInitialized, true);
  assert.equal(c.agentVersion, "test");
  assert.deepEqual(c.availableCommands, [{ name: "compact" }]);
  assert.deepEqual(result["_meta"] !== undefined, true);
  c.close();
  f.exit(0);
});

/* ─────────────── T1：session/cancel 必须是 notification ─────────────── */

test("cancel() sends session/cancel as a NOTIFICATION (no id) — trap T1", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  const sent = c.cancel("sess-1");
  assert.equal(sent, true);
  await tick();

  const frames = f.written();
  const cancelFrame = frames[frames.length - 1]!;
  assert.equal(cancelFrame["method"], "session/cancel");
  assert.deepEqual(cancelFrame["params"], { sessionId: "sess-1" });
  // 关键：notification **不得带 id**。带 id 会被内核当 request，回 -32601。
  assert.equal("id" in cancelFrame, false, "session/cancel must not carry an id");
  c.close();
  f.exit(0);
});

test("cancel() also answers every pending permission of that session as cancelled", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  let seen: unknown = null;
  c.on("permission", (p) => {
    seen = p;
  });
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  // 内核发来权限请求（server→client request，需应答）
  f.feed({
    jsonrpc: "2.0",
    id: 99,
    method: "session/request_permission",
    params: { sessionId: "sess-1", toolCall: {}, options: [] },
  });
  await tick();
  assert.notEqual(seen, null, "permission event should fire when a listener exists");

  c.cancel("sess-1");
  await tick();
  const frames = f.written();
  const answer = frames.find((x) => x["id"] === 99) as Record<string, unknown> | undefined;
  assert.ok(answer !== undefined, "pending permission must be answered on cancel");
  assert.deepEqual(answer!["result"], { outcome: { outcome: "cancelled" } });
  c.close();
  f.exit(0);
});

test("permission with NO listener is auto-answered cancelled (kernel never hangs)", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  f.feed({ jsonrpc: "2.0", id: 7, method: "session/request_permission", params: { sessionId: "s" } });
  await tick();
  const answer = f.written().find((x) => x["id"] === 7);
  assert.deepEqual(answer?.["result"], { outcome: { outcome: "cancelled" } });
  c.close();
  f.exit(0);
});

/* ─────────────── §2.2：WaitForTerminalExit 必须被拒绝 ─────────────── */

test("folder_trust/request with no listener is answered with an explicit reject", async () => {
  // 显式 reject 是一个**决定**（内核保留 dedup key，不重复问）；
  // METHOD_NOT_FOUND 会被判为「not a decision」并释放 key ⇒ 每次开会话重问。
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  f.feed({
    jsonrpc: "2.0",
    id: 31,
    method: "_nofy/folder_trust/request",
    params: { sessionId: "s1", cwd: "/repo", workspace: "/repo", configKinds: ["mcp"] },
  });
  await tick();
  const answer = f.written().find((x) => x["id"] === 31);
  assert.deepEqual(answer?.["result"], { outcome: "reject" });
  assert.equal(answer?.["error"], undefined, "不得用 JSON-RPC error 应答 folder trust");
  c.close();
  f.exit(0);
});

test("folder_trust/request with a listener surfaces the event and is not auto-answered", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  // 用数组收集而非 let 变量：闭包内赋值会被 TS 的控制流分析收窄成 never。
  const seen: Array<{ id: number | string; params: Record<string, unknown> }> = [];
  c.on("folderTrust", (e) => {
    seen.push(e);
  });
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  f.feed({ jsonrpc: "2.0", id: 32, method: "_nofy/folder_trust/request", params: { sessionId: "s1", cwd: "/repo" } });
  await tick();
  assert.equal(seen.length, 1, "有监听者时必须把事件抛出去");
  assert.equal(f.written().find((x) => x["id"] === 32), undefined, "有监听者时不得自动应答");
  const evt = seen[0];
  assert.ok(evt !== undefined);
  assert.equal(evt.params["cwd"], "/repo", "事件应带上内核给的 cwd 供 UI 展示");
  // 由 UI 决定后显式 trust
  c.respond(evt.id, { outcome: "trust" });
  await tick();
  assert.deepEqual(f.written().find((x) => x["id"] === 32)?.["result"], { outcome: "trust" });
  c.close();
  f.exit(0);
});

test("WaitForTerminalExit is rejected with METHOD_NOT_FOUND (first-party behaviour)", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  f.feed({ jsonrpc: "2.0", id: 5, method: "terminal/wait_for_exit", params: {} });
  await tick();
  const answer = f.written().find((x) => x["id"] === 5);
  assert.equal((answer?.["error"] as Record<string, unknown>)?.["code"], -32601);
  c.close();
  f.exit(0);
});

/* ─────────────── §2.4：坏帧与未知事件不得静默 ─────────────── */

test("malformed frame is surfaced and counted, never silently dropped", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  const seen: string[] = [];
  c.on("malformed", (m) => seen.push(m.reason));
  c.attachChild(f.child);
  await tick();

  f.feed("[nofy-desktop] this is not json");
  await tick();
  assert.equal(c.diag.malformed, 1);
  assert.equal(seen.length, 1);
  assert.match(seen[0]!, /^json-parse/);
  c.close();
  f.exit(0);
});

test("unknown notification is counted as unhandled with its wire name", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  const seen: string[] = [];
  c.on("unhandled", (u) => seen.push(u.kind + " " + u.method));
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  // 实测中真内核在 initialize 后就会推这一条（见 docs/contract/initialize-measured.md）
  f.feed({ jsonrpc: "2.0", method: "_nofy/mcp/servers_updated", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/some_future_event", params: {} });
  await tick();
  assert.deepEqual(seen, ["notification _nofy/mcp/servers_updated", "notification _nofy/some_future_event"]);
  assert.equal(c.diag.unhandled["notification _nofy/some_future_event"], 1);
  c.close();
  f.exit(0);
});

test("known notifications route to their typed events and are NOT unhandled", async () => {
  // 注：不含 _nofy/replayed —— 它不是方法名而是 _meta 键（methods.ts 的 EXT_META_KEY），
  // 内核全树无 ExtNotification::new("nofy/replayed")。旧 seam 把它当通知是错的。
  const f = makeFake();
  const c = new KernelConnection();
  const hits: string[] = [];
  c.on("update", () => hits.push("update"));
  c.on("extUpdate", () => hits.push("extUpdate"));
  c.on("sessionNotification", () => hits.push("sessionNotification"));
  c.on("sessions", () => hits.push("sessions"));
  c.on("models", () => hits.push("models"));
  c.on("settings", () => hits.push("settings"));
  c.on("queue", () => hits.push("queue"));
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  f.feed({ jsonrpc: "2.0", method: "session/update", params: { sessionUpdate: "agent_message_chunk" } });
  f.feed({ jsonrpc: "2.0", method: "_nofy/session/update", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/session_notification", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/sessions/changed", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/models/update", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/settings/update", params: {} });
  f.feed({ jsonrpc: "2.0", method: "_nofy/queue/changed", params: {} });
  await tick();

  assert.deepEqual(hits, [
    "update", "extUpdate", "sessionNotification", "sessions",
    "models", "settings", "queue",
  ]);
  assert.equal(Object.keys(c.diag.unhandled).length, 0);
  c.close();
  f.exit(0);
});

test("rpc rejects when the kernel answers with an error, carrying the code", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  const p = c.rpc("session/set_mode", { sessionId: "dead", modeId: "plan" }, 1000);
  await tick();
  const req = f.written()[f.written().length - 1]!;
  f.feed({ jsonrpc: "2.0", id: req["id"], error: { code: -32601, message: "Method not found" } });
  await assert.rejects(p, (e: Error & { code?: number }) => {
    assert.equal(e.code, -32601);
    assert.equal(e.message, "Method not found");
    return true;
  });
  c.close();
  f.exit(0);
});

test("ext() normalizes the wire name idempotently", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  const p1 = c.ext("session/info", { sessionId: "s" });
  const p2 = c.ext("nofy/session/info", { sessionId: "s" });
  const p3 = c.ext("_nofy/session/info", { sessionId: "s" });
  await tick();
  const methods = f.written().map((x) => x["method"]).filter((m) => m !== "initialize");
  assert.deepEqual(methods, ["_nofy/session/info", "_nofy/session/info", "_nofy/session/info"]);
  // 这三条请求永不应答；close() 会 reject 它们，必须显式收账，
  // 否则测试结束后产生 unhandledRejection（node:test 判失败）。
  c.close();
  await Promise.allSettled([p1, p2, p3]);
  f.exit(0);
});

test("child exit fails pending requests and clears server-request state", async () => {
  const f = makeFake();
  const c = new KernelConnection();
  c.reconnectMs = 100_000; // 测试内不真重连
  c.attachChild(f.child);
  await tick();
  f.feed(initResponse(f.written()[0]!["id"] as number));
  await c.ready(1000);

  const p = c.rpc("session/prompt", {}, 5000);
  f.feed({ jsonrpc: "2.0", id: 1234, method: "session/request_permission", params: { sessionId: "s" } });
  await tick();
  f.exit(1);
  await assert.rejects(p, /kernel child exited/);
  assert.equal(c.isInitialized, false);
  assert.equal(c.isOpen(), false);
  c.close();
});





