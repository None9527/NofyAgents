import assert from "node:assert/strict";
import test from "node:test";
import { rpcErrorText, summarizeProviderError } from "../main/acp/provider-error.ts";
test("provider credential failures become actionable without copying secrets or provider body", () => {
  const result = summarizeProviderError({ status: 401, body: "Unauthorized API key sk-example-secret", url: "https://user:password@example.org/path?key=private" });
  assert.equal(result.kind, "credentials");
  assert.equal(result.httpStatus, 401);
  assert.match(result.guidance, /API key/);
  assert.doesNotMatch(JSON.stringify(result), /sk-example-secret|password|private|example.org/);
});
test("quota, throttling, model, timeout, provider outage and unknown have distinct fixed guidance", () => {
  assert.equal(summarizeProviderError("HTTP 402 insufficient balance").kind, "quota");
  assert.equal(summarizeProviderError("HTTP 429 Too many requests").kind, "rate-limit");
  assert.equal(summarizeProviderError("model does not exist").kind, "model");
  assert.equal(summarizeProviderError("connection timed out").kind, "connection");
  assert.equal(summarizeProviderError("HTTP 503").kind, "provider");
  assert.equal(summarizeProviderError(null).kind, "unknown");
});
test("cyclic and non-serializable data are handled safely", () => {
  const cycle: Record<string, unknown> = {}; cycle["self"] = cycle;
  assert.equal(summarizeProviderError(cycle).kind, "unknown");
  assert.equal(summarizeProviderError(1n).kind, "unknown");
});

test("git rpc errors keep the kernel data string", () => {
  const stderr = "error: Your local changes to the following files would be overwritten by checkout";
  assert.equal(rpcErrorText("_nofy/git/checkout", { message: "Internal error", data: stderr }), stderr);
  assert.equal(rpcErrorText("_nofy/git/commit", { message: "Internal error", data: "connection timed out" }), "connection timed out");
  assert.equal(rpcErrorText("session/prompt", { message: "Internal error", data: "connection timed out" }), "无法连接模型服务。请检查网络和供应商地址后重试。");
  assert.equal(rpcErrorText("_nofy/git/stage", { message: "Internal error", data: "  " }), "Internal error");
  assert.equal(rpcErrorText("_nofy/git/discard", { message: "boom" }), "boom");
});
