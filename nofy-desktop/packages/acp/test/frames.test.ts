import assert from "node:assert/strict";
import test from "node:test";
import { classifyFrame } from "../src/frames.ts";

test("response frame: id + result", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","id":3,"result":{"ok":true}}');
  assert.equal(f.kind, "response");
  if (f.kind !== "response") return;
  assert.equal(f.id, 3);
  assert.deepEqual(f.result, { ok: true });
  assert.equal(f.error, undefined);
});

test("response frame: id + error carries code and message", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","id":7,"error":{"code":-32601,"message":"Method not found"}}');
  assert.equal(f.kind, "response");
  if (f.kind !== "response") return;
  assert.equal(f.error?.code, -32601);
  assert.equal(f.error?.message, "Method not found");
});

test("server-request frame: id + method", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","id":11,"method":"session/request_permission","params":{"sessionId":"s1"}}');
  assert.equal(f.kind, "server-request");
  if (f.kind !== "server-request") return;
  assert.equal(f.method, "session/request_permission");
  assert.deepEqual(f.params, { sessionId: "s1" });
});

test("notification frame: method, no id", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","method":"session/update","params":{"sessionUpdate":"agent_message_chunk"}}');
  assert.equal(f.kind, "notification");
  if (f.kind !== "notification") return;
  assert.equal(f.method, "session/update");
});

test("notification without params defaults to empty object", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","method":"_nofy/replayed"}');
  assert.equal(f.kind, "notification");
  if (f.kind !== "notification") return;
  assert.deepEqual(f.params, {});
});

test("id=0 is a valid response id (not treated as absent)", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","id":0,"result":null}');
  assert.equal(f.kind, "response");
  if (f.kind !== "response") return;
  assert.equal(f.id, 0);
});

/* ── malformed：旧路静默丢弃，本项目必须显式产出（PLAN.md §2.4） ── */

test("malformed: unparseable json", () => {
  const f = classifyFrame("[nofy-superv] not json at all");
  assert.equal(f.kind, "malformed");
  if (f.kind !== "malformed") return;
  assert.match(f.reason, /^json-parse/);
  assert.ok(f.raw.length > 0);
});

test("malformed: top-level array", () => {
  const f = classifyFrame("[1,2,3]");
  assert.equal(f.kind, "malformed");
  if (f.kind !== "malformed") return;
  assert.equal(f.reason, "not-an-object");
});

test("malformed: id but neither result nor error", () => {
  const f = classifyFrame('{"jsonrpc":"2.0","id":5}');
  assert.equal(f.kind, "malformed");
  if (f.kind !== "malformed") return;
  assert.equal(f.reason, "response-without-result-or-error");
});

test("malformed: no id and no method", () => {
  const f = classifyFrame('{"jsonrpc":"2.0"}');
  assert.equal(f.kind, "malformed");
  if (f.kind !== "malformed") return;
  assert.equal(f.reason, "no-id-and-no-method");
});

test("malformed: raw preview is truncated", () => {
  const f = classifyFrame("x".repeat(5000));
  assert.equal(f.kind, "malformed");
  if (f.kind !== "malformed") return;
  assert.ok(f.raw.length <= 201);
});

