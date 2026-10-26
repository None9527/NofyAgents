import test from "node:test";
import assert from "node:assert/strict";
import { closeResource, openResource, updateResource } from "../renderer/application/workspace/resourceTabs.ts";
import { createFileResources } from "../renderer/application/workspace/fileResources.ts";
import { fileWorkspaceOwner } from "../renderer/application/workspace/fileWorkspaceCache.ts";
import type { DesktopClient, FilesClient } from "../renderer/application/contracts/public.ts";
import { initialState } from "../renderer/core/store/state.ts";
const files: FilesClient = { list: async () => ({ ok: true, value: { nodes: [], truncated: false } }), read: async (_id, path) => ({ ok: true, value: { content: path, size: 1, lineCount: 1, type: "text" } }), openSearch: async () => ({ ok: true, value: "s" }), changeSearch: async () => ({ ok: true, effect: "search/fuzzyChange" }), closeSearch: async () => ({ ok: true, effect: "search/fuzzyClose" }) };
test("one temporary slot replaces previews while explicit opens retain separate full-path identities", () => {
  let s = openResource({ tabs: [], active: null }, "/project/A.md"); s = openResource(s, "/project/B.ts");
  assert.equal(s.tabs.length, 1); assert.equal(s.active, "/project/B.ts");
  s = openResource(s, "/project/B.ts", true); s = openResource(s, "/project/A.md");
  s = openResource(s, "/project/other/A.md", true); s = openResource(s, "/project/A.md", true);
  assert.equal(s.tabs.length, 3); assert.ok(s.tabs.every(tab => tab.pinned));
  s = openResource(s, "/project/B.ts"); assert.equal(s.tabs.length, 3); assert.equal(s.active, "/project/B.ts");
});
test("file modes and both scroll positions survive activation and closing non-active tabs", () => {
  let s = openResource({ tabs: [], active: null }, "/A.md", true);
  s = updateResource(s, "/A.md", { mode: "source", positions: { source: 320, preview: 150 } });
  s = openResource(s, "/B.ts", true); s = openResource(s, "/A.md"); s = closeResource(s, "/B.ts");
  assert.equal(s.active, "/A.md"); assert.deepEqual(s.tabs[0]?.positions, { source: 320, preview: 150 }); assert.equal(s.tabs[0]?.mode, "source");
  assert.deepEqual(closeResource(s, "/A.md"), { tabs: [], active: null });
});
test("suspend/resume preserves views and ignores earlier reads even after resuming", async () => {
  let finish!: (value: Awaited<ReturnType<FilesClient["read"]>>) => void;
  const owner = createFileResources({ ...files, read: () => new Promise(done => { finish = done; }) }, "A", () => true);
  const old = owner.openFile("/A.md", true); owner.setMode("/A.md", "source"); owner.savePosition("/A.md", "source", 220);
  owner.suspend(); owner.resume(); finish({ ok: true, value: { content: "stale", size: 1, lineCount: 1, type: "text" } }); await old;
  assert.equal(owner.getSnapshot().documents["/A.md"]?.file, null); assert.equal(owner.getSnapshot().resources.tabs[0]?.positions.source, 220);
});
test("window view cache isolates roots/sessions, bounds owners and invalidates on reconnect", async () => {
  const state = initialState(); state.connection.status = "ready"; state.activeSessionId = "A";
  const client = { files, projection: { getState: () => state, subscribe: () => () => {} } } as unknown as DesktopClient;
  const a = fileWorkspaceOwner(client, "/root", "A", 0); await a.openFile("/root/A.md", true); a.suspend();
  const other = fileWorkspaceOwner(client, "/other", "A", 0); assert.notEqual(a, other);
  assert.equal(fileWorkspaceOwner(client, "/root", "A", 0), a);
  for (let i = 0; i < 5; i++) fileWorkspaceOwner(client, "/root" + i, "A", 0);
  assert.notEqual(fileWorkspaceOwner(client, "/root", "A", 0), a);
  state.connection.transportEpoch++;
  assert.notEqual(fileWorkspaceOwner(client, "/root", "A", 1), a);
});
test("tab limit rejects additional fixed files while allowing an existing resource", async () => {
  const owner = createFileResources(files, "A", () => true);
  for (let i = 0; i < 12; i++) await owner.openFile("/" + i + ".ts", true);
  await owner.openFile("/overflow.ts", true); assert.equal(owner.getSnapshot().resources.tabs.length, 12); assert.match(owner.getSnapshot().error!, /12/);
  await owner.openFile("/0.ts"); assert.equal(owner.getSnapshot().resources.active, "/0.ts"); assert.equal(owner.getSnapshot().error, null);
});
test("A B A reopening cannot accept an earlier read of the same path", async () => {
  const replies: Array<(value: Awaited<ReturnType<FilesClient["read"]>>) => void> = [];
  const owner = createFileResources({ ...files, read: () => new Promise(done => replies.push(done)) }, "A", () => true);
  const first = owner.openFile("/A.md"); const b = owner.openFile("/B.ts"); const latest = owner.openFile("/A.md");
  const value = (content: string) => ({ ok: true as const, value: { content, size: 1, lineCount: 1, type: "text" } });
  replies[2]!(value("latest")); await latest; replies[0]!(value("old")); replies[1]!(value("B")); await Promise.all([first, b]);
  assert.equal(owner.getSnapshot().preview?.file?.content, "latest"); assert.deepEqual(Object.keys(owner.getSnapshot().documents), ["/A.md"]);
});
test("inner tree width is clamped and retained independently of hiding the tree", () => {
  const owner = createFileResources(files, "A", () => true);
  owner.setTreeWidth(310); owner.toggleTree(); owner.toggleTree(); assert.equal(owner.getSnapshot().treeWidth, 310);
  owner.setTreeWidth(-20); assert.equal(owner.getSnapshot().treeWidth, 150);
  owner.setTreeWidth(2000); assert.equal(owner.getSnapshot().treeWidth, 480);
  owner.setTreeWidth(NaN); assert.equal(owner.getSnapshot().treeWidth, 480);
});
