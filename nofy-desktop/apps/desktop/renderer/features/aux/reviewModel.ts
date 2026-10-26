/**
 * 审查面的纯模型：四个来源、分支基准、文件树、以及已经拿到的 patch 上的视图。
 *
 * 未提交 / 未暂存 / 已暂存来自 git/status。分支来自 git/diffs：
 * from 是 git/branches 里选出的基准，to 必须是大写 HEAD，mergeBase 为 true。
 * 内核只在两端都是提交引用时才用 merge-base；working / staged 会忽略这个标志。
 */
import type { DiffHunk, DiffLine } from "./diffModel.ts";
import { readGitWrite } from "../../ui/readers.ts";
import type { GitBranch, GitChange, GitStatus } from "../../ui/readers.ts";

export type ReviewSource = "uncommitted" | "unstaged" | "staged" | "branch";

export function statusChanges(git: GitStatus, source: Exclude<ReviewSource, "branch">): GitChange[] {
  if (source === "unstaged") return git.unstaged;
  if (source === "staged") return git.staged;
  return [...git.staged, ...git.unstaged];
}

export function reviewChangeKey(change: GitChange, index: number): string {
  return change.path + "\0" + (change.staged ? "staged" : "work") + "\0" + String(index);
}

export type PathGitAction = "stage" | "unstage" | "discard";

/** 分支对比是两个提交，没有暂存区。工作区来源按这一行是否已暂存给出路径动作。 */
export function pathGitActions(source: ReviewSource, change: { staged: boolean }): PathGitAction[] {
  if (source === "branch") return [];
  return change.staged ? ["unstage", "discard"] : ["stage", "discard"];
}

/**
 * 丢弃范围跟内核 discard 对齐：
 * 未暂存的已跟踪文件是 working（checkout -- path）；
 * 未跟踪文件再加 includeUntracked，内核才会 git clean；
 * 已暂存一行用 both（reset 后再 checkout），staged 单独只会取消暂存。
 */
export function discardParams(change: { staged: boolean; type: string }): { scope: "working" | "both"; includeUntracked: boolean } {
  if (change.staged) return { scope: "both", includeUntracked: false };
  return { scope: "working", includeUntracked: change.type === "untracked" };
}

export function commitParams(message: string, push: boolean): { message: string; push: boolean } | null {
  const text = message.trim();
  if (text === "") return null;
  return { message: text, push: push === true };
}

export function checkoutParams(branch: string, create: boolean): { branch: string; create: boolean } | null {
  const name = branch.trim();
  if (name === "") return null;
  return { branch: name, create };
}

/** 切换分支只列出非当前的本地分支。远程名交给创建，不在这里 checkout。 */
export function switchableBranches(branches: readonly GitBranch[]): GitBranch[] {
  return branches.filter((branch) => !branch.remote && !branch.current);
}

export function interpretGitWrite(value: unknown): { ok: true; notice: string | null; commitHash: string | null; output: string | null } | { ok: false; error: string } {
  const parsed = readGitWrite(value);
  if (parsed.failure) return { ok: false, error: parsed.detail ?? "响应没有 result" };
  return { ok: true, notice: parsed.detail, commitHash: parsed.commitHash, output: parsed.output };
}

/** 优先 origin/main、origin/master，其次其它远程同名分支，最后才是非当前的本地 main/master。当前分支不做基准。 */
export function defaultBaseBranch(branches: readonly GitBranch[]): string | null {
  const remoteNamed = (short: string, originOnly: boolean): GitBranch | undefined =>
    branches.find((branch) => branch.remote && (originOnly ? branch.name === "origin/" + short : branch.name.endsWith("/" + short)));
  for (const short of ["main", "master"]) {
    const hit = remoteNamed(short, true);
    if (hit) return hit.name;
  }
  for (const short of ["main", "master"]) {
    const hit = remoteNamed(short, false);
    if (hit) return hit.name;
  }
  for (const short of ["main", "master"]) {
    const hit = branches.find((branch) => !branch.remote && !branch.current && branch.name === short);
    if (hit) return hit.name;
  }
  return null;
}

export function branchDiffParams(base: string): { from: string; to: "HEAD"; includePatch: true; mergeBase: true } {
  return { from: base, to: "HEAD", includePatch: true, mergeBase: true };
}

/** git/files 的 version。staged / working 是内核 GitRef 的两个工作区状态，HEAD 必须大写。 */
export function fullFileVersion(source: ReviewSource): "working" | "staged" | "HEAD" {
  if (source === "staged") return "staged";
  if (source === "branch") return "HEAD";
  return "working";
}

export function reviewFilePath(root: string, path: string): string {
  if (path.startsWith("/")) return path;
  return root.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export function gitApplyCommand(patch: string | null): string | null {
  if (patch === null || patch.trim() === "") return null;
  let marker = "EOF";
  while (patch.includes("\n" + marker + "\n") || patch.endsWith("\n" + marker) || patch.startsWith(marker + "\n")) marker += "_NOFY";
  const body = patch.endsWith("\n") ? patch : patch + "\n";
  return "git apply <<'" + marker + "'\n" + body + marker + "\n";
}

export type ReviewTreeNode =
  | { kind: "dir"; name: string; path: string; children: ReviewTreeNode[] }
  | { kind: "file"; name: string; path: string; key: string };

export function buildReviewTree(files: readonly { path: string; key: string }[], query: string): ReviewTreeNode[] {
  const needle = query.trim().toLowerCase();
  const matched = needle === "" ? files : files.filter((file) => file.path.toLowerCase().includes(needle));
  const root: { children: ReviewTreeNode[] } = { children: [] };
  for (const file of matched) {
    const parts = file.path.split("/").filter((part) => part.length > 0);
    const name = parts[parts.length - 1];
    if (name === undefined) continue;
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const dirName = parts[i];
      if (dirName === undefined) continue;
      const dirPath = parts.slice(0, i + 1).join("/");
      let dir = cursor.children.find((node): node is Extract<ReviewTreeNode, { kind: "dir" }> => node.kind === "dir" && node.name === dirName);
      if (dir === undefined) {
        dir = { kind: "dir", name: dirName, path: dirPath, children: [] };
        cursor.children.push(dir);
      }
      cursor = dir;
    }
    cursor.children.push({ kind: "file", name, path: file.path, key: file.key });
  }
  const sortNodes = (nodes: ReviewTreeNode[]): ReviewTreeNode[] => {
    const dirs = nodes.filter((node): node is Extract<ReviewTreeNode, { kind: "dir" }> => node.kind === "dir")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((dir) => ({ ...dir, children: sortNodes(dir.children) }));
    const leaves = nodes.filter((node) => node.kind === "file").sort((a, b) => a.name.localeCompare(b.name));
    return [...dirs, ...leaves];
  };
  return sortNodes(root.children);
}

function compactWhitespace(text: string): string {
  return text.replace(/\s+/g, "");
}

/** 成对的增删在去掉空白后相同，就从已加载的 patch 里拿掉。没有配对的行保留。 */
export function omitWhitespace(hunks: readonly DiffHunk[]): DiffHunk[] {
  const next: DiffHunk[] = [];
  for (const hunk of hunks) {
    const lines: DiffLine[] = [];
    let index = 0;
    while (index < hunk.lines.length) {
      const line = hunk.lines[index];
      if (line === undefined || line.kind === "ctx") {
        if (line) lines.push(line);
        index += 1;
        continue;
      }
      const run: DiffLine[] = [];
      while (index < hunk.lines.length && hunk.lines[index]?.kind !== "ctx") {
        const item = hunk.lines[index];
        if (item) run.push(item);
        index += 1;
      }
      const deleted = run.filter((item) => item.kind === "del");
      const added = run.filter((item) => item.kind === "add");
      const whitespaceOnly = deleted.length > 0 && deleted.length === added.length && deleted.every((item, itemIndex) => compactWhitespace(item.text) === compactWhitespace(added[itemIndex]?.text ?? "\u0000"));
      if (!whitespaceOnly) lines.push(...run);
    }
    if (lines.length > 0) next.push({ ...hunk, lines });
  }
  return next;
}

export type SplitRow = { left: DiffLine | null; right: DiffLine | null };

export function splitRows(lines: readonly DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line === undefined) break;
    if (line.kind === "ctx") {
      rows.push({ left: line, right: line });
      index += 1;
      continue;
    }
    const deleted: DiffLine[] = [];
    const added: DiffLine[] = [];
    while (index < lines.length && lines[index]?.kind === "del") {
      const item = lines[index];
      if (item) deleted.push(item);
      index += 1;
    }
    while (index < lines.length && lines[index]?.kind === "add") {
      const item = lines[index];
      if (item) added.push(item);
      index += 1;
    }
    const count = Math.max(deleted.length, added.length);
    for (let row = 0; row < count; row += 1) rows.push({ left: deleted[row] ?? null, right: added[row] ?? null });
  }
  return rows;
}

export type WordSpan = { text: string; changed: boolean };

function wordTokens(text: string): string[] {
  return text.match(/\s+|[A-Za-z0-9_]+|[^A-Za-z0-9_\s]/g) ?? [];
}

function mergeSpans(parts: WordSpan[]): WordSpan[] {
  const merged: WordSpan[] = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (last && last.changed === part.changed) last.text += part.text;
    else merged.push({ text: part.text, changed: part.changed });
  }
  return merged;
}

/** 已加载的两行之间做词级差异。太长就返回 null，调用方保持整行。 */
export function wordDiff(before: string, after: string): { before: WordSpan[]; after: WordSpan[] } | null {
  if (before.length > 4000 || after.length > 4000) return null;
  const left = wordTokens(before);
  const right = wordTokens(after);
  if (left.length === 0 || right.length === 0 || left.length > 300 || right.length > 300) return null;
  const rows = left.length + 1;
  const cols = right.length + 1;
  const scores: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = left.length - 1; i >= 0; i -= 1) {
    const row = scores[i];
    const below = scores[i + 1];
    if (row === undefined || below === undefined) continue;
    for (let j = right.length - 1; j >= 0; j -= 1) {
      row[j] = left[i] === right[j] ? (below[j + 1] ?? 0) + 1 : Math.max(row[j + 1] ?? 0, below[j] ?? 0);
    }
  }
  const beforeSpans: WordSpan[] = [];
  const afterSpans: WordSpan[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    const leftToken = left[i] ?? "";
    const rightToken = right[j] ?? "";
    if (leftToken === rightToken) {
      beforeSpans.push({ text: leftToken, changed: false });
      afterSpans.push({ text: rightToken, changed: false });
      i += 1;
      j += 1;
    } else if ((scores[i + 1]?.[j] ?? 0) >= (scores[i]?.[j + 1] ?? 0)) {
      beforeSpans.push({ text: leftToken, changed: true });
      i += 1;
    } else {
      afterSpans.push({ text: rightToken, changed: true });
      j += 1;
    }
  }
  while (i < left.length) {
    beforeSpans.push({ text: left[i] ?? "", changed: true });
    i += 1;
  }
  while (j < right.length) {
    afterSpans.push({ text: right[j] ?? "", changed: true });
    j += 1;
  }
  return { before: mergeSpans(beforeSpans), after: mergeSpans(afterSpans) };
}

/** 只给「先删后增」的成对行标词级差异。交错的行保持整行。 */
export function wordSpansForLines(lines: readonly DiffLine[]): Array<WordSpan[] | null> {
  const spans: Array<WordSpan[] | null> = lines.map(() => null);
  let index = 0;
  while (index < lines.length) {
    if (lines[index]?.kind === "ctx") {
      index += 1;
      continue;
    }
    const start = index;
    while (index < lines.length && lines[index]?.kind !== "ctx") index += 1;
    const region = lines.slice(start, index);
    const addAt = region.findIndex((line) => line.kind === "add");
    const splitAt = addAt === -1 ? region.length : addAt;
    if (!region.slice(0, splitAt).every((line) => line.kind === "del") || !region.slice(splitAt).every((line) => line.kind === "add")) continue;
    const deleted = region.slice(0, splitAt);
    const added = region.slice(splitAt);
    const count = Math.min(deleted.length, added.length);
    for (let pair = 0; pair < count; pair += 1) {
      const diff = wordDiff(deleted[pair]?.text ?? "", added[pair]?.text ?? "");
      if (diff === null) continue;
      spans[start + pair] = diff.before;
      spans[start + splitAt + pair] = diff.after;
    }
  }
  return spans;
}
