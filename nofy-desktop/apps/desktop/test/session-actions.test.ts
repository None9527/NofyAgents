import assert from "node:assert/strict";
import test from "node:test";
import { emptySession } from "../renderer/core/store/state.ts";
import { exportLoadedConversation } from "../renderer/features/conversation/exportModel.ts";
import { findInConversation, parseSessionSearch } from "../renderer/features/conversation/findModel.ts";
import { parseRewindPoints, rewindEffect } from "../renderer/features/conversation/turnActionsModel.ts";
import { SERVICE_REQUESTS } from "../renderer/core/service-actions.ts";

test("export preserves Unicode/code and tool text while excluding raw protocol and thoughts", () => {
  const session = emptySession("session");
  session.blocks = [
    { kind: "user-message", id: "u", text: "中文 question", promptIndex: 0, modelId: null },
    { kind: "agent-thought", id: "thought", text: "private thought", closed: true },
    { kind: "event", id: "event", tag: "config", payload: { apiKey: "secret" } },
    { kind: "agent-message", id: "a", text: "```ts\nconst ok = true\n```", closed: true, usage: null },
  ];
  const output = exportLoadedConversation(session);
  assert.match(output.text, /中文 question/);
  assert.match(output.text, /```ts/);
  assert.match(output.text, /currently loaded/);
  assert.doesNotMatch(output.text, /private thought|secret/);
});
test("local find counts literal repeated matches and links each to its user turn", () => {
  const session = emptySession("session");
  session.blocks = [{ kind: "user-message", id: "u", text: "Test test", promptIndex: 1, modelId: null }, { kind: "agent-message", id: "a", text: "TEST", closed: true, usage: null }];
  const matches = findInConversation(session.blocks, "test");
  assert.equal(matches.length, 3);
  assert.ok(matches.every(m => m.turnBlockId === "u"));
  assert.deepEqual(findInConversation(session.blocks, "  "), []);
});
test("history parser deduplicates sessions and keeps content/title evidence", () => {
  const page = parseSessionSearch({ result: { results: [{ sessionId: "a", cwd: "/tmp", summary: "title", matchedFields: ["title"] }, { sessionId: "a", cwd: "/tmp", summary: "title", snippet: "text", matchedFields: ["content"] }, { sessionId: "bad" }], nextOffset: 20, bootstrapping: true } });
  assert.equal(page.hits.length, 1);
  assert.deepEqual(page.hits[0]?.matchedFields, ["content"]);
  assert.equal(page.nextOffset, 20);
});
test("rewind requires an actual checkpoint and explicitly selects scope without force", () => {
  const points = parseRewindPoints({ rewind_points: [{ prompt_index: 2, has_file_changes: false, num_file_snapshots: 0, prompt_preview: "hello" }] });
  const point = points[0]!;
  assert.throws(() => rewindEffect("id", point, "all"), /no file snapshots/);
  assert.deepEqual(rewindEffect("id", point, "conversation_only"), { kind: "service/request", operation: "rewindExecute", params: { sessionId: "id", targetPromptIndex: 2, force: false, mode: "conversation_only" } });
  assert.equal("settingsUpdate" in SERVICE_REQUESTS, false);
});

import { runEffect } from "../renderer/core/effects.ts";
import type { Effect } from "../renderer/core/effects.ts";
import type { KernelPort } from "../renderer/core/kernel-port.ts";
import { bindKernel } from "../renderer/core/bind.ts";

test("service whitelist uses standard authenticate and extension requests, rejects event injection", async () => {
  const calls: string[] = [];
  const port: KernelPort = {
    subscribe: () => () => {}, isReady: () => true,
    request: async method => { calls.push("request:" + method); return {}; },
    extRequest: async method => { calls.push("ext:" + method); return { success: true }; },
    notify: () => { throw new Error("Must not notify for request"); },
    respond: () => {}, cancel: () => {},
  };
  const bound = bindKernel(port);
  const auth = await runEffect(port, bound.store, { kind: "service/request", operation: "modelAuthenticate", params: { methodId: "nofy.api_key" } });
  assert.equal(auth.ok, true);
  const rename = await runEffect(port, bound.store, { kind: "service/request", operation: "sessionRename", params: { sessionId: "s", title: "title" } });
  assert.equal(rename.ok, true);
  const invalid = await runEffect(port, bound.store, { kind: "service/request", operation: "settingsUpdate", params: {} } as unknown as Effect);
  assert.equal(invalid.ok, false);
  assert.deepEqual(calls, ["request:authenticate", "ext:_nofy/session/rename"]);
  bound.unbind();
});
