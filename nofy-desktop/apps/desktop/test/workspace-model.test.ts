import assert from "node:assert/strict";
import test from "node:test";
import { decodeWorkspacePrefs, rememberWorkspace } from "../renderer/features/shell/workspaceModel.ts";
import { draftKey, decodeDrafts, clearSubmittedDraft } from "../renderer/features/conversation/draftModel.ts";

test("recent workspaces retain Chinese and spaces, deduplicate and cap history", () => {
  const value = rememberWorkspace({ selected: "/a", recent: ["/a", "/项目 空格"] }, "/项目 空格");
  assert.deepEqual(value, { selected: "/项目 空格", recent: ["/项目 空格", "/a"] });
  assert.equal(rememberWorkspace({ selected: null, recent: Array.from({ length: 30 }, (_, n) => "/" + n) }, "/new").recent.length, 20);
});
test("malformed saved workspace state cannot invent a session or path", () => {
  assert.deepEqual(decodeWorkspacePrefs({ selected: 1, recent: [null, "/a", "/a", ""] }), { selected: null, recent: ["/a"] });
});
test("draft identities separate projects and sessions and preserve edits during a pending send", () => {
  assert.notEqual(draftKey("a", "/x"), draftKey("b", "/x"));
  assert.notEqual(draftKey(null, "/x"), draftKey(null, "/y"));
  const drafts = { a: { text: "newer", attach: [] }, b: { text: "other", attach: [] } };
  assert.equal(clearSubmittedDraft(drafts, "a", { text: "old", attach: [] }), drafts);
  const next = clearSubmittedDraft(drafts, "b", drafts.b);
  assert.equal(next.a?.text, "newer");
  assert.equal(next.b, undefined);
  assert.deepEqual(decodeDrafts({ a: { text: 1 }, b: { text: "ok", attach: [] } }), { b: { text: "ok", attach: [] } });
});
