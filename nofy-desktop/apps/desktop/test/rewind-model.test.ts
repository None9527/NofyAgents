import test from "node:test";
import assert from "node:assert/strict";
import { canCommitRewind, readRewindPreview, rewindEffect, sameRewindScope } from "../renderer/features/conversation/turnActionsModel.ts";
const point = { promptIndex: 0, preview: "test", hasFileChanges: true, snapshotCount: 1 };
const preview = { success: false, target_prompt_index: 0, mode: "all", clean_files: ["changed.txt"], conflicts: [], prompt_text: null, error: null };
test("kernel success:false can be a successful read-only preview; commit must be explicit", () => {
  const parsed = readRewindPreview(preview, 0, "all");
  assert.equal(canCommitRewind(parsed), true);
  assert.deepEqual(parsed.cleanFiles, ["changed.txt"]);
  assert.equal((rewindEffect("session", point, "all") as { params: Record<string, unknown> }).params["force"], false);
  assert.equal((rewindEffect("session", point, "all", "commit") as { params: Record<string, unknown> }).params["force"], true);
});
test("conflicts, errors, malformed preview, wrong mode and checkpoint all fail closed", () => {
  assert.equal(canCommitRewind(readRewindPreview({ ...preview, conflicts: [{ path: "changed.txt", conflict_type: "modified_externally" }] }, 0, "all")), false);
  assert.equal(canCommitRewind(readRewindPreview({ ...preview, error: "invalid checkpoint" }, 0, "all")), false);
  assert.equal(canCommitRewind(readRewindPreview({ ...preview, conflicts: [null] }, 0, "all")), false);
  assert.equal(canCommitRewind(readRewindPreview(preview, 1, "all")), false);
  assert.equal(canCommitRewind(readRewindPreview(preview, 0, "files_only")), false);
  assert.equal(canCommitRewind(readRewindPreview({}, 0, "all")), false);
});
test("reconfirmed file scope must match the scope shown to the user", () => {
  const first = readRewindPreview(preview, 0, "all");
  assert.equal(sameRewindScope(first, readRewindPreview(preview, 0, "all")), true);
  assert.equal(sameRewindScope(first, readRewindPreview({ ...preview, clean_files: ["new.txt"] }, 0, "all")), false);
  assert.equal(sameRewindScope(first, readRewindPreview({ ...preview, conflicts: [{ path: "changed.txt", conflict_type: "modified_externally" }] }, 0, "all")), false);
});
