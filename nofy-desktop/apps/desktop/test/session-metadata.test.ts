import assert from "node:assert/strict";
import test from "node:test";
import { decodeSessionMetadata, forgetSessionMetadata, markSessionRead, metadataFor, renameSessionGroup, updateSessionMetadata } from "../renderer/features/shell/sessionMetadataModel.ts";
import { buildSidebarModel } from "../renderer/features/shell/sidebarModel.ts";
import type { PaletteSession } from "../renderer/features/shell/palette.ts";

const session = (id: string, active = false): PaletteSession => ({ key: id, sessionId: id, title: id, activity: "idle", loaded: true, active, cwd: "/repo", at: id === "a" ? 20 : 10 });

test("metadata migrates unversioned and version 0 maps, sanitizes flags, and rejects unknown versions", () => {
  const old = decodeSessionMetadata({ a: { isPinned: true, groupName: "  Work  ", unread: "false" }, broken: 7 });
  assert.deepEqual(metadataFor(old, "a"), { archived: false, pinned: true, unread: false, group: "Work" });
  const versionZero = decodeSessionMetadata({ version: 0, sessions: { a: { archived: true } } });
  assert.equal(metadataFor(versionZero, "a").archived, true);
  assert.equal(Object.keys(decodeSessionMetadata({ version: 8, sessions: { a: { archived: true } } }).sessions).length, 0);
  const proto = decodeSessionMetadata(JSON.parse('{"__proto__":{"pinned":true}}'));
  assert.equal(metadataFor(proto, "__proto__").pinned, true);
  assert.equal(metadataFor(proto, "constructor").pinned, false);
});

test("archive running guard preserves all metadata and unarchive is always allowed", () => {
  const prefs = decodeSessionMetadata({ a: { pinned: true } });
  const denied = updateSessionMetadata(prefs, "a", { archived: true, pinned: false }, true);
  assert.equal(denied.prefs, prefs);
  assert.match(denied.error ?? "", /停止/);
  const archived = updateSessionMetadata(prefs, "a", { archived: true }).prefs;
  assert.equal(metadataFor(archived, "a").pinned, true);
  assert.equal(updateSessionMetadata(archived, "a", { archived: false }, true).error, null);
});

test("normal sidebar keeps active archived session visible, archive filter shows archived only", () => {
  const prefs = decodeSessionMetadata({ a: { archived: true }, b: { archived: true }, c: { pinned: true, unread: true, group: "Review" } });
  const input = { sessions: [session("a", true), session("b"), session("c")], metadata: prefs, view: "grouped" as const, sort: "recent" as const, now: 100, homeCwd: "/repo" };
  const normal = buildSidebarModel(input);
  assert.deepEqual(normal.flat.map((s) => s.sessionId), ["c", "a"]);
  assert.equal(normal.archivedCount, 2);
  assert.equal(normal.groups?.find((g) => g.name === "Review")?.tasks[0]?.unread, true);
  const archive = buildSidebarModel({ ...input, archiveView: true });
  assert.deepEqual(archive.flat.map((s) => s.sessionId), ["a", "b"]);
});

test("read marking and group rename preserve archive and pin; deletion forgets only target", () => {
  const prefs = decodeSessionMetadata({ a: { unread: true, group: "Old", pinned: true }, b: { group: "Old", archived: true }, c: { group: "Other" } });
  const read = markSessionRead(prefs, "a");
  assert.equal(metadataFor(read, "a").unread, false);
  assert.equal(metadataFor(prefs, "a").unread, true);
  const renamed = renameSessionGroup(read, "Old", " New ");
  assert.equal(metadataFor(renamed, "a").group, "New");
  assert.equal(metadataFor(renamed, "b").archived, true);
  assert.equal(metadataFor(renamed, "c").group, "Other");
  const dissolved = renameSessionGroup(renamed, "New", null);
  assert.equal(metadataFor(dissolved, "a").group, null);
  assert.equal(metadataFor(dissolved, "a").pinned, true);
  assert.equal(metadataFor(forgetSessionMetadata(dissolved, "a"), "a").pinned, false);
  assert.equal(metadataFor(forgetSessionMetadata(dissolved, "a"), "b").archived, true);
});
