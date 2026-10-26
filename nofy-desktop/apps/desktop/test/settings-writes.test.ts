import assert from "node:assert/strict";
import test from "node:test";
import { createSettingsClient } from "../renderer/application/settings/client.ts";
import { createResource } from "../renderer/application/settings/resourceCache.ts";
import { finishModelSave as shippedFinish, modelResourceConfirms as shippedResource } from "../renderer/application/settings/modelSave.ts";
import { settleSettingsWrite as shippedSettle } from "../renderer/application/settings/writeResult.ts";
import { finishModelSave, modelResourceConfirms, settleSettingsWrite } from "../renderer/features/settings/settingsWritesModel.ts";
import { initialState } from "../renderer/core/store/state.ts";
import type { Effect, TaskResult } from "../renderer/core/effects.ts";
import type { ModelConfigSnapshot } from "../renderer/application/settings/contracts.ts";

const draft = { name: "服务-1", transport: "stdio" as const, endpoint: "node", args: '["a"]', env: "{}" };

function readyClient(read: (effect: Effect) => Promise<TaskResult>) {
  const state = initialState();
  state.connection.status = "ready";
  state.activeSessionId = "A";
  return createSettingsClient(read, () => state);
}

const ok = (value: unknown): TaskResult => ({ ok: true, effect: "service/request", value });

test("settings settlement is the function the client uses", () => {
  assert.equal(settleSettingsWrite, shippedSettle);
  assert.equal(finishModelSave, shippedFinish);
  assert.equal(modelResourceConfirms, shippedResource);
});

test("visible state changes only when the write was accepted and read back", () => {
  assert.deepEqual(
    settleSettingsWrite({ committed: false, draft: true, accepted: true, error: null, readBack: true }),
    { success: true, visible: true, draft: true, error: null },
  );
  const disabled = settleSettingsWrite({ committed: true, draft: false, accepted: true, error: null, readBack: false });
  assert.equal(disabled.success, true);
  assert.equal(disabled.visible, false);
  assert.equal(disabled.draft, false);
});

test("method_not_found and a missing read-back keep the draft", () => {
  const missing = settleSettingsWrite({
    committed: "off",
    draft: "on",
    accepted: false,
    error: "method_not_found",
    readBack: null,
  });
  assert.equal(missing.success, false);
  assert.equal(missing.visible, "off");
  assert.equal(missing.draft, "on");
  assert.equal(missing.error, "method_not_found");
  const unread = settleSettingsWrite({
    committed: "saved",
    draft: "edited",
    accepted: true,
    error: "内核未回读确认。",
    readBack: null,
  });
  assert.equal(unread.success, false);
  assert.equal(unread.visible, "saved");
  assert.equal(unread.draft, "edited");
  assert.equal(unread.error, "内核未回读确认。");
});

test("skill toggle and MCP save succeed only after the shipped read-back", async () => {
  const skills = readyClient(async () => ok({ result: { skills: [{ name: "review", description: "", path: "/skills/review", scope: "user", user_invocable: true, enabled: true }] } }));
  assert.equal((await skills.catalog.toggleSkill("review", true, "/work/app")).kind, "success");
  const unconfirmed = readyClient(async () => ok({ result: { skills: [] } }));
  const held = await unconfirmed.catalog.toggleSkill("review", true, "/work/app");
  assert.equal(held.kind, "error");
  if (held.kind === "error") assert.equal(held.message, "内核未确认技能状态。");
  const refused = readyClient(async () => ({ ok: false, effect: "skills/toggle", error: "method_not_found" }));
  const failure = await refused.catalog.toggleSkill("review", true, "/work/app");
  assert.equal(failure.kind, "error");
  if (failure.kind === "error") assert.equal(failure.message, "method_not_found");
  const saved = readyClient(async (effect) => effect.kind === "eco/mcp"
    ? ok({ result: { servers: [{ name: "服务-1", enabled: true }] } })
    : ok({ result: { ok: true } }));
  assert.equal((await saved.mcp.save("A", draft)).kind, "success");
  const empty = readyClient(async (effect) => effect.kind === "eco/mcp"
    ? ok({ result: { servers: [] } })
    : ok({ result: { ok: true } }));
  const unread = await empty.mcp.save("A", draft);
  assert.equal(unread.kind, "error");
  if (unread.kind === "error") assert.equal(unread.message, "内核未回读确认。");
  const denied = readyClient(async () => ({ ok: false, effect: "service/request", error: "method_not_found" }));
  const rejected = await denied.mcp.save("A", draft);
  assert.equal(rejected.kind, "error");
  if (rejected.kind === "error") assert.equal(rejected.message, "method_not_found");
});

test("credential method_not_found keeps the typed key", async () => {
  const state = initialState();
  state.connection.status = "ready";
  const calls: string[] = [];
  const client = createSettingsClient(async (effect) => {
    if (effect.kind !== "service/request") throw new Error("unexpected");
    calls.push(effect.operation);
    if (effect.operation === "modelAuthenticate") return { ok: false, effect: "service/request", error: "method_not_found" };
    return ok({ result: { ok: true } });
  }, () => state);
  let key = "sk-test";
  const result = await client.credentials.save(key, () => { key = ""; });
  assert.equal(result.kind, "error");
  if (result.kind === "error") assert.equal(result.message, "凭据已保存，认证失败：method_not_found");
  assert.equal(key, "sk-test");
  assert.deepEqual(calls, ["setApiKey", "modelAuthenticate"]);
});

function modelSnapshot(id: string, name: string, defaultModelId: string | null): ModelConfigSnapshot {
  return {
    revisionHash: "r", format: "json", editable: true, reason: null, defaultModelId,
    models: [{ id, name, model: id, providerId: null, baseUrl: null, apiBackend: "responses", hasApiKey: false, hasHiddenUrlParts: false, hasModelOverrides: false }],
    providers: [],
  };
}

test("model save closes only after the written snapshot and the read-back match", async () => {
  const state = initialState();
  const expected = { id: "new", name: "New", makeDefault: true };
  const patch = { expectedRevision: "r", id: "new", name: "New", makeDefault: true, apiBackend: "responses" as const };
  const missing = createSettingsClient(async () => { throw new Error("unexpected service call"); }, () => state, {
    readModelConfig: async () => modelSnapshot("old", "Old", "old"),
    updateModelConfig: async () => modelSnapshot("old", "Old", "old"),
  });
  const held = await finishModelSave(missing.models, patch, expected);
  assert.equal(held.close, false);
  assert.equal(held.error, "内核未回读确认。");
  const offline = createSettingsClient(async () => { throw new Error("unexpected service call"); }, () => state, {
    readModelConfig: async () => { throw new Error("offline"); },
    updateModelConfig: async () => modelSnapshot("new", "New", "new"),
  });
  const failedRead = await finishModelSave(offline.models, patch, expected);
  const swallowed = modelResourceConfirms({ status: "error", data: modelSnapshot("old", "Old", "old"), error: "offline" }, expected);
  assert.equal(failedRead.close, false);
  assert.equal(failedRead.error, "offline");
  assert.equal(swallowed.close, false);
  assert.equal(swallowed.error, "offline");
  assert.equal(modelResourceConfirms({ status: "ready", data: modelSnapshot("new", "New", "new"), error: null }, expected).close, true);
  const confirmed = modelSnapshot("new", "New", "new");
  const saved = createSettingsClient(async () => { throw new Error("unexpected service call"); }, () => state, {
    readModelConfig: async () => confirmed,
    updateModelConfig: async () => confirmed,
  });
  assert.deepEqual(await finishModelSave(saved.models, patch, expected), { close: true, error: null });
  let fail = false;
  const resource = createResource(async () => {
    if (fail) throw new Error("offline");
    return modelSnapshot("old", "Old", "old");
  });
  await resource.load();
  fail = true;
  await resource.load(true);
  const listed = modelResourceConfirms(resource.getSnapshot(), expected);
  assert.equal(resource.getSnapshot().status, "error");
  assert.equal(listed.close, false);
  assert.equal(listed.error, "offline");
  assert.equal((resource.getSnapshot().data as ModelConfigSnapshot).models[0]?.id, "old");
});
