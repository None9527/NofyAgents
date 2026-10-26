import assert from "node:assert/strict";
import test from "node:test";
import type { DiffHunk } from "../renderer/features/aux/diffModel.ts";
import {
  branchDiffParams,
  buildReviewTree,
  checkoutParams,
  commitParams,
  defaultBaseBranch,
  discardParams,
  fullFileVersion,
  gitApplyCommand,
  interpretGitWrite,
  omitWhitespace,
  pathGitActions,
  reviewFilePath,
  splitRows,
  statusChanges,
  switchableBranches,
  wordDiff,
} from "../renderer/features/aux/reviewModel.ts";
import { readGitBranches } from "../renderer/ui/readers.ts";
import type { GitChange, GitStatus } from "../renderer/ui/readers.ts";

function change(patch: Partial<GitChange> & Pick<GitChange, "path">): GitChange {
  return { type: "edit", staged: false, additions: 1, deletions: 0, patch: null, ...patch };
}

function line(kind: "ctx" | "add" | "del", text: string): DiffHunk["lines"][number] {
  return { kind, oldNo: kind === "add" ? null : 1, newNo: kind === "del" ? null : 1, text };
}

test("status sources keep staged and unstaged distinct", () => {
  const git: GitStatus = {
    root: "/repo",
    branch: "feature",
    commit: "abc",
    staged: [change({ path: "A.md", staged: true })],
    unstaged: [change({ path: "A.md" }), change({ path: "B.ts" })],
  };
  assert.deepEqual(statusChanges(git, "uncommitted").map((item) => item.staged), [true, false, false]);
  assert.deepEqual(statusChanges(git, "unstaged").map((item) => item.path), ["A.md", "B.ts"]);
  assert.equal(statusChanges(git, "staged").length, 1);
});

test("default base prefers origin main and never the current branch", () => {
  assert.equal(defaultBaseBranch([
    { name: "main", current: false, remote: false },
    { name: "origin/master", current: false, remote: true },
    { name: "origin/main", current: false, remote: true },
  ]), "origin/main");
  assert.equal(defaultBaseBranch([
    { name: "main", current: true, remote: false },
    { name: "feature", current: false, remote: false },
  ]), null);
  assert.equal(defaultBaseBranch([
    { name: "feature", current: true, remote: false },
    { name: "master", current: false, remote: false },
  ]), "master");
});

test("branch diff asks for the merge base against uppercase HEAD", () => {
  assert.deepEqual(branchDiffParams("origin/main"), { from: "origin/main", to: "HEAD", includePatch: true, mergeBase: true });
  assert.equal(fullFileVersion("branch"), "HEAD");
  assert.equal(fullFileVersion("staged"), "staged");
  assert.equal(fullFileVersion("unstaged"), "working");
});

test("branch list reader keeps name, current and remote only", () => {
  const parsed = readGitBranches({ result: { currentBranch: "feature", branches: [
    { name: "feature", current: true, remote: false },
    { name: "origin/main", current: false, remote: true, ahead: 4 },
    { current: true },
  ] } });
  assert.equal(parsed.currentBranch, "feature");
  assert.deepEqual(parsed.branches, [
    { name: "feature", current: true, remote: false },
    { name: "origin/main", current: false, remote: true },
  ]);
  assert.deepEqual(readGitBranches({}), { currentBranch: null, branches: [] });
});

test("file tree filters by path and keeps parent directories", () => {
  const tree = buildReviewTree([
    { path: "src/a.ts", key: "a" },
    { path: "src/nested/c.ts", key: "c" },
    { path: "readme.md", key: "r" },
  ], "c.ts");
  assert.equal(tree.length, 1);
  assert.equal(tree[0]?.kind, "dir");
  if (tree[0]?.kind !== "dir") return;
  assert.equal(tree[0].name, "src");
  assert.equal(tree[0].children[0]?.kind, "dir");
  assert.equal(reviewFilePath("/repo/", "src/a.ts"), "/repo/src/a.ts");
  assert.equal(reviewFilePath("/repo", "/abs/a.ts"), "/abs/a.ts");
});

test("local patch views hide paired whitespace, split rows, and mark words", () => {
  const hunks: DiffHunk[] = [{
    header: "@@",
    oldStart: 1,
    newStart: 1,
    lines: [line("del", "foo "), line("add", "foo"), line("ctx", "keep"), line("del", "old"), line("add", "new")],
  }];
  const hidden = omitWhitespace(hunks);
  assert.deepEqual(hidden[0]?.lines.map((item) => item.text), ["keep", "old", "new"]);
  const rows = splitRows([line("ctx", "keep"), line("del", "old"), line("add", "new")]);
  assert.equal(rows.length, 2);
  assert.equal(rows[1]?.left?.text, "old");
  assert.equal(rows[1]?.right?.text, "new");
  const words = wordDiff("hello world", "hello there");
  assert.equal(words?.before.find((span) => span.changed)?.text, "world");
  assert.equal(words?.after.find((span) => span.changed)?.text, "there");
  assert.equal(words?.before[0]?.changed, false);
});

test("git apply command wraps the real patch and refuses an empty one", () => {
  assert.equal(gitApplyCommand(null), null);
  assert.equal(gitApplyCommand("  "), null);
  const command = gitApplyCommand("@@ -1 +1 @@\n-old\n+new\n");
  assert.equal(command, "git apply <<'EOF'\n@@ -1 +1 @@\n-old\n+new\nEOF\n");
  const escaped = gitApplyCommand("@@\nEOF\n");
  assert.match(escaped ?? "", /<<'EOF_NOFY'/);
});

test("path writes stay off the branch source and discard matches the kernel scope", () => {
  assert.deepEqual(pathGitActions("branch", { staged: false }), []);
  assert.deepEqual(pathGitActions("uncommitted", { staged: false }), ["stage", "discard"]);
  assert.deepEqual(pathGitActions("staged", { staged: true }), ["unstage", "discard"]);
  assert.deepEqual(discardParams({ staged: false, type: "edit" }), { scope: "working", includeUntracked: false });
  assert.deepEqual(discardParams({ staged: false, type: "untracked" }), { scope: "working", includeUntracked: true });
  assert.deepEqual(discardParams({ staged: true, type: "edit" }), { scope: "both", includeUntracked: false });
});

test("commit pushes only when asked and checkout needs a real name", () => {
  assert.deepEqual(commitParams("  ship  ", false), { message: "ship", push: false });
  assert.deepEqual(commitParams("ship", true), { message: "ship", push: true });
  assert.equal(commitParams("   ", true), null);
  assert.deepEqual(checkoutParams(" topic ", true), { branch: "topic", create: true });
  assert.deepEqual(checkoutParams("feature", false), { branch: "feature", create: false });
  assert.equal(checkoutParams(" ", false), null);
  assert.deepEqual(switchableBranches([
    { name: "main", current: true, remote: false },
    { name: "origin/main", current: false, remote: true },
    { name: "feature", current: false, remote: false },
  ]).map((branch) => branch.name), ["feature"]);
});

test("git write keeps a commit warning and surfaces an envelope error", () => {
  assert.deepEqual(interpretGitWrite({ result: { commitHash: "abc", output: "ok" }, error: "pushed with warning" }), {
    ok: true, notice: "pushed with warning", commitHash: "abc", output: "ok",
  });
  assert.deepEqual(interpretGitWrite({ result: null, error: "would be overwritten" }), { ok: false, error: "would be overwritten" });
  assert.deepEqual(interpretGitWrite({ result: {} }), { ok: true, notice: null, commitHash: null, output: null });
});
