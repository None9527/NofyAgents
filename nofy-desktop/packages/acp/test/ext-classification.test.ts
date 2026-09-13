/**
 * 扩展名分类门禁——**以内核源码为准**，不以旧文档为准。
 *
 * 证据件：packages/acp/schema/kernel-ext-usage.json
 * （由 scripts/extract-kernel-ext.ts 扫 crates/codegen 全树 2,424 个 .rs 产出）。
 *
 * 守的是**行为性**分类：请求（等响应）/ 通知（不等响应）/ 内核→客户端（必须应答）。
 * 分错的后果不是样式问题——把通知当请求发会等一个永不到来的响应
 * （旧路 D13「sendText 恰好卡 30.0 秒」就是这一类失效形态）。
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  EXT_EVENT,
  EXT_NOTIFY,
  EXT_REQUEST,
  EXT_SERVER_REQUEST,
  EXT_META_KEY,
  EXT_EVIDENCE_SHA256,
  extMethodName,
} from "../src/methods.ts";
import {
  EXT_CLIENT_NOTIFICATION,
  EXT_CLIENT_REQUEST,
  EXT_DISPATCH_ONLY,
  EXT_DISPATCH_NOTIFY,
  EXT_EMIT_CLIENT,
  EXT_INDIRECT,
  EXT_KERNEL_EVENT,
  EXT_KERNEL_REQUEST,
} from "../src/generated/ext-names.ts";

const here = dirname(fileURLToPath(import.meta.url));
const evRaw = readFileSync(join(here, "..", "schema", "kernel-ext-usage.json"), "utf8");
type Ev = {
  buckets: {
    clientRequest: Record<string, string[]>;
    clientNotification: Record<string, string[]>;
    kernelRequest: Record<string, string[]>;
    kernelEvent: Record<string, string[]>;
  };
  constOnly: string[];
  nameAccessorOnly: string[];
  dispatched: Record<string, string[]>;
  dispatchedNotify?: Record<string, string[]>;
  dispatchedEqOther?: Record<string, string[]>;
  emittedClient?: Record<string, string[]>;
  unclassifiedLiterals?: Record<string, string[]>;
  sitesSha256: string;
};
const ev = JSON.parse(evRaw) as Ev;

const vals = (o: Record<string, string>) => Object.values(o);
/** 事件证据三源：构造点（ExtNotification::new）、常量/枚举访问器、emit_client_ext 助手。 */
const EVENT_POOL = new Set([...vals(EXT_KERNEL_EVENT), ...vals(EXT_INDIRECT), ...vals(EXT_EMIT_CLIENT)]);
const REQUEST_POOL = new Set([...vals(EXT_CLIENT_REQUEST), ...vals(EXT_DISPATCH_ONLY), ...vals(EXT_INDIRECT)]);
/**
 * 通知证据有两个来源：构造侧（pager 用 ExtNotification::new 发）与
 * **通知侧分派**（内核 ext_notification 体内用比较式接受，无响应构造点）。
 * 只认前者会漏掉 terminal/pty/input、permissions/reset、telemetry 四条——
 * 它们没有第一方构造点（GUI 客户端专用），却确实是通知。
 */
const NOTIFY_POOL = new Set([...vals(EXT_CLIENT_NOTIFICATION), ...vals(EXT_DISPATCH_NOTIFY)]);
const SERVER_POOL = new Set([...vals(EXT_KERNEL_REQUEST), ...vals(EXT_INDIRECT)]);

test("generated ext tables are in sync with the kernel evidence (sha256)", () => {
  const actual = createHash("sha256").update(evRaw).digest("hex");
  assert.equal(
    actual,
    EXT_EVIDENCE_SHA256,
    "生成物过期：kernel-ext-usage.json 变了但 ext-names.ts 没重跑。"
      + " 跑 pnpm --filter @nofy-desktop/acp gen",
  );
});

test("EXT_EVENT values are all kernel-emitted events", () => {
  for (const [k, v] of Object.entries(EXT_EVENT)) {
    assert.ok(EVENT_POOL.has(v), "EXT_EVENT." + k + " = " + v + " 不在内核事件证据内");
  }
});

test("EXT_REQUEST values are all client→kernel requests", () => {
  for (const [k, v] of Object.entries(EXT_REQUEST)) {
    assert.ok(REQUEST_POOL.has(v), "EXT_REQUEST." + k + " = " + v + " 不在请求证据内");
  }
});

test("EXT_NOTIFY values are all client→kernel notifications (fire-and-forget)", () => {
  for (const [k, v] of Object.entries(EXT_NOTIFY)) {
    assert.ok(NOTIFY_POOL.has(v), "EXT_NOTIFY." + k + " = " + v + " 不在通知证据内");
  }
});

test("EXT_SERVER_REQUEST values are all kernel→client requests needing an answer", () => {
  for (const [k, v] of Object.entries(EXT_SERVER_REQUEST)) {
    assert.ok(SERVER_POOL.has(v), "EXT_SERVER_REQUEST." + k + " = " + v + " 不在证据内");
  }
});

test("no name is classified as both request and notification (would hang or drop)", () => {
  const req = new Set(vals(EXT_REQUEST));
  const notif = new Set(vals(EXT_NOTIFY));
  const both = [...req].filter((x) => notif.has(x));
  assert.deepEqual(both, [], "同名同时归为请求与通知: " + both.join(", "));
  const ev2 = new Set(vals(EXT_EVENT));
  const overlap = [...req].filter((x) => ev2.has(x));
  assert.deepEqual(overlap, [], "同名既是出站请求又是入站事件: " + overlap.join(", "));
});

/* ── 回归守卫：本轮复核抓到的三处错 ── */

test("toggle_plan_mode is a NOTIFICATION, not a request (regression)", () => {
  // 第一方 pager：effects/mod.rs:1127 用 ExtNotification::new 发它，失败只 tracing::warn。
  assert.equal(EXT_NOTIFY.togglePlanMode, "_nofy/toggle_plan_mode");
  assert.ok(!vals(EXT_REQUEST).includes("_nofy/toggle_plan_mode"), "toggle_plan_mode 不得在 EXT_REQUEST 里");
});

test("all queue/* operations are NOTIFICATIONS (P3 queue pane depends on this)", () => {
  for (const k of ["queueRemove", "queueReorder", "queueClear", "queueEdit", "queueInterject", "queueHoldEdit", "queueReleaseEdit"] as const) {
    assert.ok(EXT_NOTIFY[k].startsWith("_nofy/queue/"), k + " 应为 queue 通知");
  }
  assert.ok(!vals(EXT_REQUEST).some((v) => v.startsWith("_nofy/queue/")), "queue/* 不得归为请求");
});

test("dispatch-notify names are notifications, never requests (陷阱 T13 第二例)", () => {
  // 内核 acp_agent.rs:1240 的 async fn ext_notification 体内比较式分派 ⇒ 无响应构造点。
  // 〔实测〕rpc() 发 _nofy/terminal/pty/input 得 -32601（docs/contract/ecosystem-shapes.json）。
  assert.ok(Object.keys(EXT_DISPATCH_NOTIFY).length >= 6, "通知侧分派证据丢了——提取器没扫 ext_notification？");
  for (const [k, v] of Object.entries(EXT_DISPATCH_NOTIFY)) {
    assert.ok(!vals(EXT_CLIENT_REQUEST).includes(v), k + " = " + v + " 不得同时是构造侧请求");
    assert.ok(!vals(EXT_DISPATCH_ONLY).includes(v), k + " = " + v + " 不得进 EXT_DISPATCH_ONLY（那是请求桶）");
    assert.ok(ev.dispatchedNotify?.[v.replace(/^_/, "")] !== undefined, k + " 缺证据行号");
  }
  assert.equal(EXT_NOTIFY.terminalPtyInput, "_nofy/terminal/pty/input");
  assert.equal(EXT_NOTIFY.permissionsReset, "_nofy/permissions/reset");
  assert.ok(!vals(EXT_REQUEST).includes("_nofy/terminal/pty/input"), "pty/input 被误归请求 ⇒ 终端面会卡到超时");
});

test("EQ-dispatch outside ext_notification stays out of the notify table (人工复核位)", () => {
  // 当前三条：workflows/list（match 守卫里的 s == 比较，**是请求**，探针实测可调通）、
  // mcp_initialized、session/update（两侧都有构造点）。它们不得被自动归成通知。
  for (const name of Object.keys(ev.dispatchedEqOther ?? {})) {
    assert.ok(
      !vals(EXT_DISPATCH_NOTIFY).includes("_" + name),
      name + " 同时出现在「EQ 非通知」与通知表里——分类判据需细化",
    );
  }
});

test("search status events are kernel→client events (⌘K 文件搜索的结果通道)", () => {
  // 〔实测〕fuzzy/change 的响应只有 {sessionId, searchId}；结果经通知推送。
  assert.equal(EXT_EVENT.searchFuzzyStatus, "_nofy/search/fuzzy/status");
  assert.equal(EXT_EVENT.searchContentStatus, "_nofy/search/content/status");
  assert.ok(ev.emittedClient?.["nofy/search/fuzzy/status"] !== undefined, "缺 emit_client_ext 证据行号");
});

test("literal census has no blind spots (每个内核里的 nofy/* 字面量都有归属)", () => {
  // 提取器扫全树 "nofy/…" 字面量（本轮 221 个），凡不属任何证据桶的必须落在
  // allowlist（_meta 键/参数键/测试夹具，逐条有理由）。盲区非空 ⇒ 内核加了新面
  // 而我们的表没跟上，或 allowlist 需要更新——两种情况都得人来看一眼。
  assert.deepEqual(ev.unclassifiedLiterals ?? {}, {}, "出现未分类的字面量方法名");
});

test("_nofy/replayed is NOT a method name anywhere (it is a _meta key)", () => {
  const all = [...vals(EXT_EVENT), ...vals(EXT_REQUEST), ...vals(EXT_NOTIFY), ...vals(EXT_SERVER_REQUEST)];
  assert.ok(!all.includes("_nofy/replayed"), "_nofy/replayed 又被当成方法名了");
  assert.equal(EXT_META_KEY.replayed, "nofy/replayed");
  // 内核全树无该构造点
  const constructed = new Set([
    ...Object.keys(ev.buckets.clientRequest),
    ...Object.keys(ev.buckets.clientNotification),
    ...Object.keys(ev.buckets.kernelRequest),
    ...Object.keys(ev.buckets.kernelEvent),
  ]);
  assert.ok(!constructed.has("nofy/replayed"), "内核出现了 nofy/replayed 构造点——须重新复核 EXT_META_KEY 的判定");
});

test("folder_trust/request is registered as a server request we must answer", () => {
  assert.equal(EXT_SERVER_REQUEST.folderTrustRequest, "_nofy/folder_trust/request");
});

test("mcp/upsert and mcp/delete are client→kernel requests (裁定 C #5 depends on it)", () => {
  assert.equal(EXT_REQUEST.mcpUpsert, "_nofy/mcp/upsert");
  assert.equal(EXT_REQUEST.mcpDelete, "_nofy/mcp/delete");
  assert.ok(ev.buckets.clientRequest["nofy/mcp/upsert"] !== undefined, "内核证据里 mcp/upsert 不再是客户端请求——裁定 C #5 需复核");
});

test("session_summaries/workspace_list is evidenced (smoke gate ③ depends on it)", () => {
  assert.equal(EXT_REQUEST.summariesWorkspaceList, "_nofy/session_summaries/workspace_list");
  assert.ok(
    ev.dispatched["nofy/session_summaries/workspace_list"] !== undefined,
    "内核分派表里找不到它——smoke 的隔离断言会失效",
  );
});

test("every EXT alias is in normalized wire form and idempotent", () => {
  const all = [...vals(EXT_EVENT), ...vals(EXT_REQUEST), ...vals(EXT_NOTIFY), ...vals(EXT_SERVER_REQUEST)];
  for (const v of all) {
    assert.ok(v.startsWith("_nofy/"), v + " 未带 _nofy/ 前缀");
    assert.equal(extMethodName(v), v, v + " 不是归一形");
  }
  assert.ok(new Set(all).size === all.length, "EXT 别名表里有重复的线路名");
});
