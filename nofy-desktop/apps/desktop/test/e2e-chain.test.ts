/**
 * 端到端链路门：KernelPort → bindKernel → store，以及 Effect → 出站原语。
 *
 * 守三件事：
 *  1. 真夹具经**完整链路**（不只是投影函数）能得到正确终态；
 *  2. 请求 / 通知 / 应答三种出站原语**不被用错**（陷阱 T1、T13 的结构性守卫）；
 *  3. 冷启动 session/load 能从响应里拿到标题（P1 硬前提，
 *     replay-dedup-measured.md §2）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { AGENT_METHOD, EXT_NOTIFY } from "@nofy-desktop/acp";
import type { JsonObject } from "../main/acp/connection.ts";
import { bindKernel, hydrateFromResponse } from "../renderer/core/bind.ts";
import { runEffect } from "../renderer/core/effects.ts";
import type { Effect } from "../renderer/core/effects.ts";
import type { KernelPort, KernelSignal, RpcId } from "../renderer/core/kernel-port.ts";
import { byPhase, fixtureExists, loadFixture } from "./helpers/replay.ts";
import type { Block } from "../renderer/core/store/state.ts";

type Out =
  | { op: "request"; method: string; params: unknown }
  | { op: "extRequest"; method: string; params: unknown }
  | { op: "notify"; method: string; params: unknown }
  | { op: "respond"; id: RpcId; result: unknown }
  | { op: "cancel"; sessionId: string };

function makePort() {
  const out: Out[] = [];
  const listeners = new Set<(s: KernelSignal) => void>();
  let ready = false;
  /** 下一次 request/extRequest 的返回值（按方法名匹配）。 */
  const replies = new Map<string, unknown>();
  const port: KernelPort = {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
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
    lastMethod: (op: Out["op"]) => {
      const list = out.filter((x) => x.op === op) as Array<{ method?: string }>;
      return list.length === 0 ? null : (list[list.length - 1] as { method?: string }).method ?? null;
    },
  };
}

const INIT_RESULT: JsonObject = {
  protocolVersion: 1,
  agentVersion: "0.2.121",
  agentCapabilities: { promptCapabilities: { image: false, audio: false, embeddedContext: true } },
  authMethods: [{ id: "api_key" }],
  _meta: {
    agentVersion: "0.2.121",
    modelState: { currentModelId: "qwen3-coder-plus", availableModels: [{ id: "qwen3-coder-plus" }] },
    availableCommands: [{ name: "compact" }],
  },
};

/** session/load 的响应，形状照 docs/contract/session-read-shapes.json 实测。 */
const LOAD_RESULT: JsonObject = {
  models: { currentModelId: "qwen3-coder-plus", availableModels: [{}, {}, {}, {}] },
  _meta: {
    sessionId: "sess-hist",
    codebaseIndexed: [],
    "nofy/sessionConfig": { options: [{ modelId: "a" }, { modelId: "b" }, { modelId: "c" }, { modelId: "d" }] },
    "nofy/sessionDetail": {
      sessionId: "sess-hist",
      kind: "build",
      cwd: "/some/repo",
      currentModelId: "qwen3-coder-plus",
      title: "历史会话的标题",
    },
    "nofy/schedulerBackgroundLoops": true,
  },
};

const tick = () => new Promise((r) => setTimeout(r, 5));

/* ══════════ 1. 真夹具走完整链路 ══════════ */

const hasTurn = fixtureExists("golden-turn.jsonl");

test("golden-turn flows through port → bind → store with correct spine", { skip: hasTurn ? false : "缺夹具" }, async () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "ready", result: INIT_RESULT });
  assert.equal(bound.store.getState().connection.status, "ready");
  assert.deepEqual(bound.store.getState().connection.promptCapabilities, {
    image: false,
    audio: false,
    embeddedContext: true,
  });

  for (const r of loadFixture("golden-turn.jsonl")) {
    const f = r.frame;
    if (f.kind === "notification") h.push({ kind: "notification", method: f.method, params: f.params });
    else if (f.kind === "server-request") h.push({ kind: "server-request", id: f.id, method: f.method, params: f.params as JsonObject });
  }
  const s = bound.store.getState();
  assert.deepEqual(s.unhandled, {}, "链路层出现未映射事件");
  const sess = Object.values(s.sessions)[0]!;
  const kinds = sess.blocks.filter((b) => b.kind !== "event").map((b) => b.kind);
  assert.deepEqual(kinds, ["user-message", "agent-message", "tool-call", "agent-message"]);
  assert.equal(sess.agentState, "idle");
  assert.equal(sess.stopReason, "end_turn");
  assert.equal(sess.turnUsage?.totalTokens, 44355);
  assert.equal(sess.availableCommands.length, 167);
  bound.unbind();
});

test("golden-permission flows through the chain into pendingInteractions", { skip: fixtureExists("golden-permission.jsonl") ? false : "缺夹具" }, () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "ready", result: INIT_RESULT });
  let pendingMax = 0;
  const seenIds = new Set<number | string>();
  let firstOpts: Array<Record<string, unknown>> = [];
  let firstOptsMethod = "";
  const unbindTrace = bound.store.subscribe((st) => {
    const n = st.pendingInteractions;
    pendingMax = Math.max(pendingMax, n.length);
    for (const p of n) seenIds.add(p.id);
    if (firstOptsMethod === "" && n.length > 0) {
      firstOptsMethod = n[0]!.method;
      firstOpts = (n[0]!.params["options"] ?? []) as Array<Record<string, unknown>>;
    }
  });
  for (const r of loadFixture("golden-permission.jsonl")) {
    const f = r.frame;
    if (f.kind === "notification") h.push({ kind: "notification", method: f.method, params: f.params });
    else if (f.kind === "server-request") h.push({ kind: "server-request", id: f.id, method: f.method, params: f.params as JsonObject });
  }
  const s = bound.store.getState();
  // 新契约（2026-09-13）：turn_completed 收尾清空调挂起请求 ⇒ 终态必空；
  // 「到达过」用订阅轨迹断言（峰值 2、首张选项逐字）。
  assert.equal(s.pendingInteractions.length, 0, "回合结束后不得留孤儿审批卡");
  // 到达数＝去重 id 数：夹具里第一张在 turn_completed 收尾时被清，第二张随后才到，
  // 峰值并发只有 1；断言峰值会把新契约误判成丢请求。
  assert.equal(seenIds.size, 2, "两轮各一次权限请求到达链路");
  assert.equal(firstOptsMethod, "session/request_permission");
  const opts = firstOpts;
  assert.equal(opts.length, 4);
  assert.equal(opts[0]!["optionId"], "enable-always-approve");
  unbindTrace();
  bound.unbind();
});

test("golden-replay: live then replay through the chain does not duplicate content", { skip: fixtureExists("golden-replay.jsonl") ? false : "缺夹具" }, () => {
  const recs = loadFixture("golden-replay.jsonl");
  const feed = (h: ReturnType<typeof makePort>, rs: typeof recs) => {
    for (const r of rs) {
      const f = r.frame;
      if (f.kind === "notification") h.push({ kind: "notification", method: f.method, params: f.params });
      else if (f.kind === "server-request") h.push({ kind: "server-request", id: f.id, method: f.method, params: f.params as JsonObject });
    }
  };
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "ready", result: INIT_RESULT });
  feed(h, byPhase(recs, "live"));
  const afterLive = bound.store.getState();
  const liveText = Object.values(afterLive.sessions)
    .flatMap((x) => x.blocks)
    .filter((b) => b.kind === "agent-message")
    .map((b) => (b as Extract<Block, { kind: "agent-message" }>).text)
    .join("");
  feed(h, byPhase(recs, "replay"));
  const afterReplay = bound.store.getState();
  const replayText = Object.values(afterReplay.sessions)
    .flatMap((x) => x.blocks)
    .filter((b) => b.kind === "agent-message")
    .map((b) => (b as Extract<Block, { kind: "agent-message" }>).text)
    .join("");
  assert.equal(replayText, liveText, "经完整链路后 agent 文本被重复拼接");
  bound.unbind();
});

/* ══════════ 2. 出站原语不得用错（T1 / T13） ══════════ */

async function runOne(effect: Effect) {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "ready", result: INIT_RESULT });
  h.replies.set(AGENT_METHOD.newSession, { sessionId: "s1", models: { currentModelId: "m" }, _meta: {} });
  h.replies.set(AGENT_METHOD.loadSession, LOAD_RESULT);
  h.replies.set(AGENT_METHOD.prompt, { stopReason: "end_turn", _meta: {} });
  h.replies.set(AGENT_METHOD.setSessionModel, { _meta: { model: { Ok: true } } });
  const res = await runEffect(h.port, bound.store, effect);
  return { h, bound, res };
}

test("session/cancel goes through the CANCEL primitive, never a request (trap T1)", async () => {
  const { h, res } = await runOne({ kind: "session/cancel", sessionId: "s1" });
  assert.equal(res.ok, true);
  assert.equal(h.ops("cancel").length, 1);
  assert.equal(
    h.out.some((x) => (x.op === "request" || x.op === "extRequest") && x.method === AGENT_METHOD.cancel),
    false,
    "session/cancel 被当请求发了 —— 会得到 -32601，停止按钮失效",
  );
});

test("queue/* and togglePlanMode go through NOTIFY, never a request (trap T13)", async () => {
  for (const eff of [
    { kind: "queue/edit", sessionId: "s1", entryId: "q1", newText: "x" },
    { kind: "queue/remove", sessionId: "s1", entryId: "q1" },
    { kind: "queue/clear", sessionId: "s1" },
    { kind: "togglePlanMode", sessionId: "s1" },
    {
      kind: "perm/notify",
      params: {
        clientIdentifier: "nofy-desktop",
        permission_mode: "always-approve",
        yolo_mode: true,
        auto_mode: false,
      },
    },
  ] as Effect[]) {
    const { h, res } = await runOne(eff);
    assert.equal(res.ok, true, eff.kind + " 应成功");
    assert.equal(h.ops("notify").length, 1, eff.kind + " 应恰好发一条通知");
    assert.equal(h.ops("request").length, 0, eff.kind + " **不得**走 request（会等一个永不到来的响应）");
    const m = String((h.ops("notify")[0] as { method: string }).method);
    assert.ok(m.startsWith("_nofy/"), eff.kind + " 的线路名应带 _nofy/ 前缀，实际 " + m);
  }
});

test("notify effects use the exact EXT_NOTIFY wire names", async () => {
  const cases: Array<[Effect, string]> = [
    [{ kind: "queue/edit", sessionId: "s", entryId: "q", newText: "n" }, EXT_NOTIFY.queueEdit],
    [{ kind: "queue/remove", sessionId: "s", entryId: "q" }, EXT_NOTIFY.queueRemove],
    [{ kind: "queue/clear", sessionId: "s" }, EXT_NOTIFY.queueClear],
    [{ kind: "togglePlanMode", sessionId: "s" }, EXT_NOTIFY.togglePlanMode],
    [
      {
        kind: "perm/notify",
        params: {
          clientIdentifier: "nofy-desktop",
          permission_mode: "ask",
          yolo_mode: false,
          auto_mode: false,
        },
      },
      EXT_NOTIFY.yoloModeChanged,
    ],
  ];
  for (const [eff, want] of cases) {
    const { h } = await runOne(eff);
    assert.equal((h.ops("notify")[0] as { method: string }).method, want);
  }
});

test("queue/edit payload uses the first-party field names (sessionId/id/newText)", async () => {
  // pager effects/mod.rs:1203-1207 的载荷键就是这三个
  const { h } = await runOne({ kind: "queue/edit", sessionId: "s1", entryId: "q9", newText: "改过的文本" });
  const n = h.ops("notify")[0] as { params: Record<string, unknown> };
  assert.deepEqual(n.params, { sessionId: "s1", id: "q9", newText: "改过的文本" });
});

/* ══════════ 3. 冷启动标题（P1 硬前提） ══════════ */

test("session/load hydrates the TITLE from the response (回放集里没有标题事件)", async () => {
  const { bound, res } = await runOne({ kind: "session/load", sessionId: "sess-hist", cwd: "/some/repo" });
  assert.equal(res.ok, true);
  const s = bound.store.getState();
  const sess = s.sessions["sess-hist"];
  assert.ok(sess !== undefined, "会话应已建立");
  assert.equal(sess!.title, "历史会话的标题");
  assert.equal(sess!.titleSource, "load-response");
  assert.equal(sess!.kind, "build");
  assert.equal(sess!.cwd, "/some/repo");
  assert.equal(sess!.modelId, "qwen3-coder-plus");
  assert.equal(sess!.modelOptions.length, 4, "模型选择器数据源应来自 nofy/sessionConfig.options");
  assert.equal(s.activeSessionId, "sess-hist");
});

test("hydrateFromResponse reads the measured field paths only", () => {
  const h = hydrateFromResponse(LOAD_RESULT);
  assert.equal(h.sessionId, "sess-hist");
  assert.equal(h.title, "历史会话的标题");
  assert.equal(h.kind, "build");
  assert.equal(h.modelOptions.length, 4);
  // 形状不符时必须安全降级，不得抛
  const empty = hydrateFromResponse({});
  assert.deepEqual(empty, { sessionId: null, title: null, cwd: null, modelId: null, kind: null, modelOptions: [] });
  const junk = hydrateFromResponse(null);
  assert.equal(junk.title, null);
});

/* ══════════ 4. prompt 的乐观更新与应答形状 ══════════ */

test("prompt sets turn-running optimistically but does NOT insert a user block", async () => {
  const { h, bound } = await runOne({ kind: "session/prompt", sessionId: "s1", text: "hi" });
  assert.equal(h.ops("request").length, 1);
  assert.equal((h.ops("request")[0] as { method: string }).method, AGENT_METHOD.prompt);
  const params = (h.ops("request")[0] as { params: Record<string, unknown> }).params;
  assert.deepEqual(params["prompt"], [{ type: "text", text: "hi" }]);
  const sess = bound.store.getState().sessions["s1"]!;
  // prompt 响应回来后仍是 turn-running（收尾由 turn_completed 事件负责）
  assert.equal(sess.agentState, "turn-running");
  // 关键：**不得**乐观插用户块——内核会发 user_message_chunk，插了就重复
  assert.equal(sess.blocks.filter((b) => b.kind === "user-message").length, 0);
});

test("permission respond payload is {outcome:{outcome:selected,optionId}}", async () => {
  const { h } = await runOne({ kind: "permission/respond", id: 77, optionId: "allow-once" });
  const r = h.ops("respond")[0] as { id: RpcId; result: Record<string, unknown> };
  assert.equal(r.id, 77);
  assert.deepEqual(r.result, { outcome: { outcome: "selected", optionId: "allow-once" } });
});

test("folderTrust respond is fail-closed: only explicit trust unlocks", async () => {
  const a = await runOne({ kind: "folderTrust/respond", id: 1, trust: true });
  assert.deepEqual((a.h.ops("respond")[0] as { result: unknown }).result, { outcome: "trust" });
  const b = await runOne({ kind: "folderTrust/respond", id: 2, trust: false });
  assert.deepEqual((b.h.ops("respond")[0] as { result: unknown }).result, { outcome: "reject" });
});

test("failed prompt records the error as a visible block and returns to idle", async () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "ready", result: INIT_RESULT });
  // 不 stub prompt 的回包 ⇒ request 抛错
  const res = await runEffect(h.port, bound.store, { kind: "session/prompt", sessionId: "s1", text: "hi" });
  assert.equal(res.ok, false);
  const sess = bound.store.getState().sessions["s1"]!;
  assert.equal(sess.agentState, "idle", "失败后不得卡在 turn-running（旧路 D11/D13 的体感）");
  assert.equal(sess.stopReason, "error");
  const errBlock = sess.blocks.find((b) => b.kind === "event" && b.tag === "prompt-error");
  assert.ok(errBlock !== undefined, "失败必须留下**可见**的块，不得静默");
});

test("status signals map to connecting/reconnecting, not to a dead button state", () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "status", connected: true });
  assert.equal(bound.store.getState().connection.status, "connecting");
  h.push({ kind: "ready", result: INIT_RESULT });
  assert.equal(bound.store.getState().connection.status, "ready");
  h.push({ kind: "status", connected: false });
  assert.equal(bound.store.getState().connection.status, "reconnecting");
  // 翻转不清数据（PLAN §7.3：陈旧保留）
  assert.equal(bound.store.getState().connection.agentVersion, "0.2.121");
  bound.unbind();
});

test("malformed frames are counted, never silently dropped", () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  h.push({ kind: "malformed", reason: "json-parse: boom" });
  h.push({ kind: "malformed", reason: "json-parse: boom" });
  assert.equal(bound.store.getState().unhandled["malformed:json-parse: boom"], 2);
  bound.unbind();
});

test("unbind stops the flow", () => {
  const h = makePort();
  const bound = bindKernel(h.port);
  bound.unbind();
  h.push({ kind: "ready", result: INIT_RESULT });
  assert.equal(bound.store.getState().connection.status, "idle", "退订后不应再写入 store");
});
