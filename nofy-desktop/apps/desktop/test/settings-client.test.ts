import test from "node:test";
import assert from "node:assert/strict";
import { createSettingsClient } from "../renderer/application/settings/client.ts";
import { decodeSettingsOutcome } from "../renderer/core/settings/protocol.ts";
import { initialState } from "../renderer/core/store/state.ts";
import type { Effect, TaskResult } from "../renderer/core/effects.ts";
const draft = { name: "服务-1", transport: "stdio" as const, endpoint: "node", args: '["a b"]', env: '{"X":"v"}' };
function fixture(read: (effect: Effect) => Promise<TaskResult>) {
  const state = initialState(); state.connection.status = "ready"; state.activeSessionId = "A";
  const calls: Effect[] = [];
  const client = createSettingsClient(async effect => { calls.push(effect); return read(effect); }, () => state);
  return { state, calls, client };
}
const result = (value: unknown): TaskResult => ({ ok: true, effect: "service/request", value });
test("MCP validation prevents writes and the adapter preserves the actual stdio contract", async () => {
  const f = fixture(async (effect) => effect.kind === "eco/mcp" ? result({ result: { servers: [{ name: "服务-1", enabled: true }] } }) : result({ result: { ok: true } }));
  const invalid = await f.client.mcp.save("A", { ...draft, args: "{}" });
  assert.equal(invalid.kind, "error"); if (invalid.kind === "error") assert.equal(invalid.code, "validation");
  assert.equal(f.calls.length, 0);
  assert.equal((await f.client.mcp.save("A", draft)).kind, "success");
  assert.deepEqual(f.calls[0], { kind: "service/request", operation: "mcpUpsert", params: { session_id: "A", server_name: "服务-1", enabled: true, command: "node", args: ["a b"], env: { X: "v" } } });
});
test("RPC acceptance does not override an unsuccessful business result", async () => {
  const f = fixture(async () => result({ result: { status: "validation_error", message: "bad config" } }));
  const r = await f.client.mcp.toggle("A", "server", true);
  assert.deepEqual(r, { kind: "error", code: "remote", message: "bad config" });
});
test("supported Setup is normalized and submission uses the separate camel-case contract", async () => {
  const f = fixture(async effect => {
    if (effect.kind === "eco/mcp") return result({ result: { servers: [{ name: "server", enabled: true }] } });
    return result(effect.kind === "service/request" && effect.operation === "mcpAuthTrigger" ? { result: { status: "setup_required", setup: { fields: [{ id: "region", label: "Region", type: "select", required: true, options: [{ label: "US", value: "us" }] }] } } } : { result: { status: "authenticated" } });
  });
  const setup = await f.client.mcp.authenticate("A", "server");
  assert.deepEqual(setup, { kind: "setup", server: "server", fields: [{ name: "region", label: "Region", required: true, options: [{ label: "US", value: "us" }] }] });
  await f.client.mcp.setup("A", "server", { region: "us" });
  assert.deepEqual(f.calls[1], { kind: "service/request", operation: "mcpSetup", params: { sessionId: "A", serverName: "server", values: { region: "us" } } });
});
test("unsupported or ambiguous Setup never becomes a successful authentication", async () => {
  const invalid = [{ id: "x", type: "text" }, { id: "x", type: "select", options: [] }];
  for (const field of invalid) {
    const f = fixture(async () => result({ result: { status: "setup_required", setup: { fields: [field] } } }));
    const r = await f.client.mcp.authenticate("A", "server");
    assert.equal(r.kind, "error"); if (r.kind === "error") assert.equal(r.code, "unsupported");
  }
  assert.equal(decodeSettingsOutcome({ status: "setup_required", setup: { fields: [1, 2] } }).setup, null);
});
test("plugin repository confirmation requires a separate explicit confirmed command", async () => {
  const f = fixture(async effect => {
    if (effect.kind === "eco/plugins") return result({ result: { plugins: [] } });
    const confirmed = effect.kind === "service/request" && (effect.params.action as { confirmed?: boolean }).confirmed === true;
    return result(confirmed ? { result: { status: "success" } } : { result: { status: "confirmation_required", message: "repository has other plugins" } });
  });
  const command = { kind: "uninstall" as const, pluginId: "plugin", confirmed: false };
  assert.deepEqual(await f.client.plugins.execute("A", command), { kind: "confirmation", pluginId: "plugin", message: "repository has other plugins" });
  assert.equal(f.calls.length, 1);
  assert.equal((await f.client.plugins.execute("A", { ...command, confirmed: true })).kind, "success");
});
test("plugin reload is a real follow-up; a rejected reload reports partial completion", async () => {
  const f = fixture(async effect => {
    if (effect.kind === "eco/plugins") return result({ result: { plugins: [] } });
    if (effect.kind === "service/request" && (effect.params.action as { type: string }).type === "reload") return result({ result: { status: "error", message: "reload refused" } });
    return result({ result: { status: "success", requiresReload: true } });
  });
  const r = await f.client.plugins.execute("A", { kind: "install", source: " git-source " });
  assert.equal(r.kind, "error"); if (r.kind === "error") assert.match(r.message, /reload refused/);
  assert.deepEqual(f.calls.flatMap(effect => effect.kind === "service/request" ? [effect.params.action] : []), [{ type: "install", source: "git-source" }, { type: "reload" }]);
});
test("a changed transport or active session prevents reload and discards the old result", async () => {
  for (const change of ["epoch", "session"] as const) {
    const f = fixture(async () => { if (change === "epoch") f.state.connection.transportEpoch++; else f.state.activeSessionId = "B"; return result({ result: { status: "success", requiresReload: true } }); });
    const r = await f.client.plugins.execute("A", { kind: "install", source: "source" });
    assert.equal(r.kind, "error"); if (r.kind === "error") assert.equal(r.code, "stale");
    assert.equal(f.calls.length, 1);
  }
});
test("MCP and plugin writes share a scope lock which releases after completion", async () => {
  const pending: Array<(result: TaskResult) => void> = [];
  const f = fixture(() => new Promise<TaskResult>(done => { pending.push(done); }));
  const seen = async (count: number) => { for (let i = 0; i < 20 && f.calls.length < count; i++) await Promise.resolve(); assert.equal(f.calls.length, count); };
  const work = f.client.mcp.toggle("A", "server", true);
  const busy = await f.client.plugins.execute("A", { kind: "install", source: "source" });
  assert.equal(busy.kind, "error"); if (busy.kind === "error") assert.equal(busy.code, "busy");
  assert.equal(f.calls.length, 1);
  pending[0]!(result({ result: { ok: true } }));
  await seen(2);
  pending[1]!(result({ result: { servers: [{ name: "server", enabled: true }] } }));
  assert.equal((await work).kind, "success");
  const next = f.client.mcp.remove("A", "server");
  await seen(3);
  pending[2]!(result({ result: { ok: true } }));
  await seen(4);
  pending[3]!(result({ result: { servers: [] } }));
  assert.equal((await next).kind, "success");
});
test("disconnected and inactive scopes emit no writes", async () => {
  const f = fixture(async () => result({ ok: true }));
  f.state.connection.status = "reconnecting";
  const disconnected = await f.client.mcp.remove("A", "server");
  assert.equal(disconnected.kind, "error"); if (disconnected.kind === "error") assert.equal(disconnected.code, "disconnected");
  f.state.connection.status = "ready";
  const stale = await f.client.mcp.remove("B", "server");
  assert.equal(stale.kind, "error"); if (stale.kind === "error") assert.equal(stale.code, "stale"); assert.equal(f.calls.length, 0);
});
