import assert from "node:assert/strict";
import test from "node:test";
import { readWorkspaceCatalog } from "../renderer/application/shell/workspaceCatalog.ts";

const summary = {
  info: { id: "s1", cwd: "/work/app" },
  session_summary: "first prompt",
  generated_title: "Better title",
  updated_at: "2026-10-14T00:00:00.000Z",
};

test("workspace_list keeps measured fields and prefers generated_title", () => {
  const catalog = readWorkspaceCatalog({ all_sessions: { "/work/app": [summary, { info: { id: "s1", cwd: "/work/app" }, session_summary: "duplicate" }] } });
  assert.equal(catalog?.sessions.length, 1);
  assert.equal(catalog?.sessions[0]?.title, "Better title");
  assert.equal(catalog?.sessions[0]?.cwd, "/work/app");
  assert.equal(catalog?.sessions[0]?.at, Date.parse("2026-10-14T00:00:00.000Z"));
});

test("workspace_list uses session_summary when generated_title is empty and accepts a result wrapper", () => {
  const catalog = readWorkspaceCatalog({ result: { all_sessions: { "/tmp": [{ info: { id: "old", cwd: "/tmp" }, session_summary: "first prompt text", generated_title: "  ", updated_at: "nope" }] } } });
  assert.equal(catalog?.sessions[0]?.title, "first prompt text");
  assert.equal(catalog?.sessions[0]?.at, null);
});

test("missing all_sessions is unreadable and an empty map is an empty catalog", () => {
  assert.equal(readWorkspaceCatalog({}), null);
  assert.equal(readWorkspaceCatalog({ all_sessions: { "/tmp": {} } }), null);
  assert.deepEqual(readWorkspaceCatalog({ all_sessions: {} }), { sessions: [] });
});
