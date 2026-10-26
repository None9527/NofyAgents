import { PaneToolbar, PaneIconButton, PaneEmpty, PaneMenuButton, PaneSearch } from "../../ui/workbench.tsx";
import { Btn } from "../../ui/primitives.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * 审查面。四个来源：
 * 未提交 / 未暂存 / 已暂存读 App 轮询的 git/status；
 * 分支读 git/branches，再用 git/diffs（to=HEAD，mergeBase）对比用户选的基准。
 * 文件树、统一/并排、换行、隐藏空白、词级差异都作用在已经拿到的 patch 上。
 * 完整文件走 git/files。在文件中打开走现有的文件工作区。
 * 工作区来源上的路径动作是 git/stage、git/unstage、git/discard。丢弃先确认。
 * 分支来源没有这些动作。不走 git/stage/content。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import {
  IconBranch,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconEllipsis,
  IconEyeOff,
  IconFile,
  IconFolder,
  IconList,
  IconRefresh,
  IconWrap,
} from "../../ui/icons.tsx";
import { readFsFile, readGitBranches, readGitDiffs, readGitFiles } from "../../ui/readers.ts";
import type { GitBranch, GitChange, GitStatus } from "../../ui/readers.ts";
import { foldContext, parseUnifiedDiff } from "./diffModel.ts";
import type { DiffLine } from "./diffModel.ts";
import {
  branchDiffParams,
  buildReviewTree,
  defaultBaseBranch,
  discardParams,
  fullFileVersion,
  gitApplyCommand,
  interpretGitWrite,
  omitWhitespace,
  pathGitActions,
  reviewChangeKey,
  reviewFilePath,
  splitRows,
  statusChanges,
  wordSpansForLines,
} from "./reviewModel.ts";
import type { ReviewSource, ReviewTreeNode, WordSpan } from "./reviewModel.ts";

const FOLD_THRESHOLD = 8;

export type ReviewPaneProps = {
  runtime: Runtime;
  sessionId: string | null;
  git: GitStatus | null;
  gitBusy: boolean;
  onRefresh: () => void;
  source: ReviewSource;
  onSource: (source: ReviewSource) => void;
  workspaceRoot: string | null;
  onOpenFile: (path: string) => void;
};

type BranchState = {
  status: "idle" | "loading" | "ready" | "error";
  branches: GitBranch[];
  base: string | null;
  files: GitChange[];
  error: string | null;
};

const EMPTY_BRANCH: BranchState = { status: "idle", branches: [], base: null, files: [], error: null };

function baseAndDir(path: string): { base: string; dir: string } {
  const parts = path.split("/");
  const base = parts.pop() ?? path;
  return { base, dir: parts.join("/") };
}

function LineText({ text, spans }: { text: string; spans: WordSpan[] | null }) {
  if (spans === null) return <>{text}</>;
  return (
    <>
      {spans.map((span, index) => span.changed
        ? <mark key={index} className="diffword">{span.text}</mark>
        : <span key={index}>{span.text}</span>)}
    </>
  );
}

function DiffLineRow({ line, spans }: { line: DiffLine; spans: WordSpan[] | null }) {
  const no = line.kind === "add" ? line.newNo : line.oldNo;
  return (
    <div className={"diffl diffl--" + line.kind}>
      <span className="diffl__no">{no === null ? "" : String(no)}</span>
      <code className="diffl__code"><LineText text={line.text} spans={spans} /></code>
    </div>
  );
}

function DiffBody({
  change,
  foldKey,
  openFolds,
  onToggleFold,
  untrackedContent,
  mode,
  wrap,
  hideSpace,
  words,
  full,
}: {
  change: GitChange;
  foldKey: string;
  openFolds: Set<string>;
  onToggleFold: (key: string) => void;
  untrackedContent: string | null | undefined;
  mode: "unified" | "split";
  wrap: boolean;
  hideSpace: boolean;
  words: boolean;
  full: { kind: "off" } | { kind: "loading" } | { kind: "missing" } | { kind: "text"; text: string };
}) {
  useLocale();
  if (full.kind === "loading") return <div className="diffnote">{tr("正在读取完整文件…")}</div>;
  if (full.kind === "missing") return <div className="diffnote">{tr("读不到内容（二进制或读取失败）")}</div>;
  if (full.kind === "text") {
    const lines = full.text.split("\n");
    return (
      <div className={"diffview" + (wrap ? " diffview--wrap" : "")}>
        <div className="diffnote">{tr("完整文件")}</div>
        <div className="difflines">
          {lines.map((text, index) => (
            <DiffLineRow key={String(index)} line={{ kind: "ctx", oldNo: index + 1, newNo: index + 1, text }} spans={null} />
          ))}
        </div>
      </div>
    );
  }
  if (change.patch === null) {
    if (change.type !== "untracked") return <div className="diffnote">{tr("这条变更没有 patch，复制不了 git apply")}</div>;
    if (untrackedContent === undefined) return <div className="diffnote">{tr("读取工作区内容…")}</div>;
    if (untrackedContent === null) return <div className="diffnote">{tr("读不到内容（二进制或读取失败）")}</div>;
    const lines: DiffLine[] = untrackedContent.split("\n").map((text, index) => ({ kind: "add", oldNo: null, newNo: index + 1, text }));
    return <DiffLines lines={lines} mode={mode} words={words} />;
  }
  const hunks = hideSpace ? omitWhitespace(parseUnifiedDiff(change.patch)) : parseUnifiedDiff(change.patch);
  return <DiffSegments hunks={hunks} foldKey={foldKey} openFolds={openFolds} onToggleFold={onToggleFold} mode={mode} wrap={wrap} words={words} />;
}

function DiffSegments({
  hunks,
  foldKey,
  openFolds,
  onToggleFold,
  mode,
  wrap,
  words,
}: {
  hunks: ReturnType<typeof parseUnifiedDiff>;
  foldKey: string;
  openFolds: Set<string>;
  onToggleFold: (key: string) => void;
  mode: "unified" | "split";
  wrap: boolean;
  words: boolean;
}) {
  useLocale();
  const segs = foldContext(hunks, FOLD_THRESHOLD);
  return (
    <div className={"diffview" + (wrap ? " diffview--wrap" : "") + (mode === "split" ? " diffview--split" : "")}>
      {segs.map((seg, index) => {
        if (seg.kind === "show") {
          return <DiffLines key={"s" + String(index)} lines={seg.lines} mode={mode} words={words} />;
        }
        const key = foldKey + ":" + String(index);
        if (openFolds.has(key) && !seg.gap) {
          return <DiffLines key={key} lines={seg.lines} mode={mode} words={words} />;
        }
        return (
          <button
            key={key}
            type="button"
            className="difffold"
            disabled={seg.gap}
            onClick={() => onToggleFold(key)}
            title={seg.gap ? tr("两个 hunk 之间的空档：内核没吐这段上下文，本地展不开") : tr("展开 ") + String(seg.count) + tr(" 行未修改")}
          >
            {String(seg.count)}{tr("行未修改")}
          </button>
        );
      })}
    </div>
  );
}

function DiffLines({ lines, mode, words }: {
  lines: DiffLine[];
  mode: "unified" | "split";
  words: boolean;
}) {
  const spans = words ? wordSpansForLines(lines) : null;
  const spanFor = (line: DiffLine | null): WordSpan[] | null => {
    if (spans === null || line === null) return null;
    const at = lines.indexOf(line);
    return at < 0 ? null : spans[at] ?? null;
  };
  if (mode === "split") {
    return (
      <div className="diffsplit">
        {splitRows(lines).map((row, index) => (
          <div key={String(index)} className="diffsplit__row">
            {row.left ? <DiffLineRow line={row.left} spans={spanFor(row.left)} /> : <div className="diffl diffl--empty" />}
            {row.right ? <DiffLineRow line={row.right} spans={spanFor(row.right)} /> : <div className="diffl diffl--empty" />}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="difflines">
      {lines.map((line, index) => <DiffLineRow key={String(index)} line={line} spans={spans?.[index] ?? null} />)}
    </div>
  );
}

function ReviewTree({ nodes, collapsed, onToggle, onJump, pathCount, staged }: {
  nodes: ReviewTreeNode[];
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  onJump: (key: string) => void;
  pathCount: Map<string, number>;
  staged: Map<string, boolean>;
}) {
  useLocale();
  return (
    <ul className="reviewtree">
      {nodes.map((node) => node.kind === "dir" ? (
        <li key={node.path}>
          <button type="button" className="reviewtree__dir" aria-expanded={!collapsed.has(node.path)} onClick={() => onToggle(node.path)}>
            {collapsed.has(node.path) ? <IconChevronRight size={14} /> : <IconChevronDown size={14} />}
            <IconFolder size={14} />
            <span>{node.name}</span>
          </button>
          {collapsed.has(node.path) ? null : <ReviewTree nodes={node.children} collapsed={collapsed} onToggle={onToggle} onJump={onJump} pathCount={pathCount} staged={staged} />}
        </li>
      ) : (
        <li key={node.key}>
          <button
            type="button"
            className="reviewtree__file"
            aria-label={tr("跳转到") + " " + node.path + ((pathCount.get(node.path) ?? 0) > 1 ? " " + tr(staged.get(node.key) ? "已暂存" : "未暂存") : "")}
            onClick={() => onJump(node.key)}
          >
            <IconFile size={14} />
            <span>{node.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ReviewPane({ runtime, sessionId, git, gitBusy, onRefresh, source, onSource, workspaceRoot, onOpenFile }: ReviewPaneProps) {
  useLocale();
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [openFolds, setOpenFolds] = useState<Set<string>>(() => new Set());
  const [untracked, setUntracked] = useState<Record<string, string | null | undefined>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [writeBusy, setWriteBusy] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<GitChange | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [branch, setBranch] = useState<BranchState>(EMPTY_BRANCH);
  const [baseOverride, setBaseOverride] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [mode, setMode] = useState<"unified" | "split">("unified");
  const [wrap, setWrap] = useState(false);
  const [hideSpace, setHideSpace] = useState(false);
  const [words, setWords] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [full, setFull] = useState<Record<string, string | null | undefined>>({});
  const fullWanted = useRef(new Set<string>());
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const [focusKey, setFocusKey] = useState<string | null>(null);

  useEffect(() => {
    if (focusKey === null) return;
    rowRefs.current.get(focusKey)?.scrollIntoView({ block: "nearest" });
  }, [focusKey]);

  const gitCommit = git?.commit ?? null;
  useEffect(() => {
    if (source !== "branch" || sessionId === null) return;
    let cancelled = false;
    setBranch((current) => ({ ...current, status: "loading", error: null }));
    void (async () => {
      const listed = await runtime.effect({ kind: "git/branches", sessionId });
      if (cancelled) return;
      if (!listed.ok) {
        setBranch({ status: "error", branches: [], base: null, files: [], error: listed.error });
        return;
      }
      const parsed = readGitBranches(listed.value);
      const known = baseOverride !== null && parsed.branches.some((item) => item.name === baseOverride);
      const base = known ? baseOverride : defaultBaseBranch(parsed.branches);
      if (base === null) {
        setBranch({ status: "ready", branches: parsed.branches, base: null, files: [], error: null });
        return;
      }
      const diff = await runtime.effect({ kind: "git/diffs", sessionId, ...branchDiffParams(base) });
      if (cancelled) return;
      if (!diff.ok) {
        setBranch({ status: "error", branches: parsed.branches, base, files: [], error: diff.error });
        return;
      }
      setBranch({ status: "ready", branches: parsed.branches, base, files: readGitDiffs(diff.value), error: null });
    })();
    return () => { cancelled = true; };
  }, [source, sessionId, runtime, baseOverride, reload, gitCommit]);

  const toggle = (key: string): void => setOpen((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  const toggleFold = (key: string): void => setOpenFolds((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  const ensureUntracked = useCallback((path: string) => {
    if (sessionId === null || untracked[path] !== undefined) return;
    setUntracked((current) => ({ ...current, [path]: undefined }));
    void runtime.effect({ kind: "fs/readFile", sessionId, path, maxLines: 2000 }).then((result) => {
      if (!result.ok) {
        setLocalError(path + "：" + result.error);
        setUntracked((current) => ({ ...current, [path]: null }));
        return;
      }
      const file = readFsFile(result.value);
      setUntracked((current) => ({ ...current, [path]: file === null ? null : file.content }));
    });
  }, [runtime, sessionId, untracked]);

  const loadFull = (path: string) => {
    const id = source + "\0" + path;
    if (fullWanted.current.has(id)) {
      fullWanted.current.delete(id);
      setFull((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    if (sessionId === null) return;
    fullWanted.current.add(id);
    setFull((current) => ({ ...current, [id]: undefined }));
    void runtime.effect({ kind: "git/files", sessionId, paths: [path], version: fullFileVersion(source) }).then((result) => {
      if (!fullWanted.current.has(id)) return;
      if (!result.ok) {
        setLocalError(path + "：" + result.error);
        setFull((current) => ({ ...current, [id]: null }));
        return;
      }
      const files = readGitFiles(result.value);
      const hit = files.find((file) => file.path === path) ?? files[0];
      setFull((current) => ({ ...current, [id]: hit === undefined || hit.isBinary || hit.content === null ? null : hit.content }));
    });
  };

  const settleWrite = (result: Awaited<ReturnType<Runtime["effect"]>>): boolean => {
    setWriteBusy(false);
    if (!result.ok) {
      setLocalError(result.error);
      setDiscardError(result.error);
      return false;
    }
    const parsed = interpretGitWrite(result.value);
    if (!parsed.ok) {
      setLocalError(parsed.error);
      setDiscardError(parsed.error);
      return false;
    }
    if (parsed.notice) setLocalError(parsed.notice);
    onRefresh();
    return true;
  };
  const runPath = (action: "stage" | "unstage", path: string) => {
    if (sessionId === null || path === "" || writeBusy) return;
    setWriteBusy(true);
    setLocalError(null);
    const effect = action === "stage"
      ? { kind: "git/stage" as const, sessionId, paths: [path] }
      : { kind: "git/unstage" as const, sessionId, paths: [path] };
    void runtime.effect(effect).then(settleWrite);
  };
  const confirmDiscard = () => {
    if (sessionId === null || discardTarget === null || discardTarget.path === "" || writeBusy) return;
    const params = discardParams(discardTarget);
    setWriteBusy(true);
    setDiscardError(null);
    void runtime.effect({
      kind: "git/discard",
      sessionId,
      paths: [discardTarget.path],
      scope: params.scope,
      includeUntracked: params.includeUntracked,
    }).then((result) => {
      if (settleWrite(result)) {
        setDiscardTarget(null);
        setDiscardError(null);
      }
    });
  };

  const labels: Record<ReviewSource, string> = {
    uncommitted: tr("未提交"),
    unstaged: tr("未暂存"),
    staged: tr("已暂存"),
    branch: tr("分支"),
  };
  const changes = source === "branch" ? branch.files : git === null ? [] : statusChanges(git, source);
  const needle = query.trim().toLowerCase();
  const visible = needle === "" ? changes.map((change, index) => ({ change, index })) : changes.map((change, index) => ({ change, index })).filter((item) => item.change.path.toLowerCase().includes(needle));
  const entries = visible.map((item) => ({ ...item, key: reviewChangeKey(item.change, item.index) }));
  const pathCount = new Map<string, number>();
  const staged = new Map<string, boolean>();
  for (const entry of entries) {
    pathCount.set(entry.change.path, (pathCount.get(entry.change.path) ?? 0) + 1);
    staged.set(entry.key, entry.change.staged);
  }
  const tree = buildReviewTree(entries.map((entry) => ({ path: entry.change.path, key: entry.key })), "");
  let add = 0;
  let del = 0;
  for (const entry of entries) {
    add += entry.change.additions;
    del += entry.change.deletions;
  }
  const branchLoading = source === "branch" && (branch.status === "idle" || branch.status === "loading");
  const root = git?.root ?? workspaceRoot;
  const copyText = (text: string) => {
    void navigator.clipboard.writeText(text).catch(() => setLocalError(tr("复制失败")));
  };
  const jump = (key: string) => {
    setOpen((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
    const entry = entries.find((item) => item.key === key);
    if (entry && entry.change.patch === null && entry.change.type === "untracked") ensureUntracked(entry.change.path);
    setFocusKey(key);
  };

  let empty = tr("此来源没有文件");
  if (needle !== "" && changes.length > 0) empty = tr("没有匹配的文件");
  else if (source === "branch" && branch.base === null && !branchLoading && branch.error === null) empty = tr("分支对比还没有基准。从列表里选一个分支。");
  else if (source === "branch" && branch.base !== null) empty = tr("这个分支相对基准没有提交差异。");
  else if (source === "uncommitted") empty = tr("工作区很干净，没有待提交的改动。");
  else if (git === null && source !== "branch") empty = tr("还没读到改动清单：会话没关联文件夹，或这个文件夹不是 git 仓库。");

  return (
    <div className="review">
      <PaneToolbar className="review__head">
        <span className="review__branch" title={git?.commit ?? tr("内核没给 commit（非 git 工作区？）")}>
          <IconBranch size={16} />
          <span>{git?.branch ?? tr("非 git")}</span>
          {git?.commit !== null && git !== null ? <span className="review__commit">{git.commit.slice(0, 7)}</span> : null}
          {source === "branch" && branch.base ? <span className="review__base">{branch.base}</span> : null}
        </span>
        <PaneIconButton onClick={() => { onRefresh(); setReload((current) => current + 1); }} disabled={gitBusy || branchLoading} aria-label={tr("刷新")} title={tr("刷新")}><IconRefresh size={16} /></PaneIconButton>
      </PaneToolbar>
      <div className="review__tools">
        <select className="review__select" aria-label={tr("变更来源")} value={source} onChange={(event) => {
          const value = event.target.value;
          if (value === "uncommitted" || value === "unstaged" || value === "staged" || value === "branch") onSource(value);
        }}>
          {(Object.keys(labels) as ReviewSource[]).map((id) => <option key={id} value={id}>{labels[id]}</option>)}
        </select>
        {source === "branch" ? (
          <select className="review__select" aria-label={tr("选择对比分支")} value={branch.base ?? ""} onChange={(event) => { if (event.target.value !== "") setBaseOverride(event.target.value); }}>
            <option value="">{tr("选择对比分支")}</option>
            {branch.branches.map((item) => <option key={(item.remote ? "remote:" : "local:") + item.name} value={item.name}>{item.name}{item.current ? " · " + tr("当前分支") : ""}{item.remote ? " · " + tr("远程分支") : ""}</option>)}
          </select>
        ) : null}
        <PaneIconButton aria-label={tr("统一差异")} aria-pressed={mode === "unified"} title={tr("统一差异")} onClick={() => setMode("unified")}><IconList size={16} /></PaneIconButton>
        <PaneIconButton aria-label={tr("并排差异")} aria-pressed={mode === "split"} title={tr("并排差异")} onClick={() => setMode("split")}><IconBranch size={16} /></PaneIconButton>
        <PaneIconButton aria-label={tr("代码自动换行")} aria-pressed={wrap} title={tr("代码自动换行")} onClick={() => setWrap((current) => !current)}><IconWrap size={16} /></PaneIconButton>
        <PaneIconButton aria-label={tr("隐藏空白")} aria-pressed={hideSpace} title={tr("隐藏空白")} onClick={() => setHideSpace((current) => !current)}><IconEyeOff size={16} /></PaneIconButton>
        <PaneIconButton aria-label={tr("词级差异")} aria-pressed={words} title={tr("词级差异")} onClick={() => setWords((current) => !current)}><IconCheck size={16} /></PaneIconButton>
        <PaneIconButton aria-label={treeOpen ? tr("隐藏文件树") : tr("显示文件树")} aria-pressed={treeOpen} title={treeOpen ? tr("隐藏文件树") : tr("显示文件树")} onClick={() => setTreeOpen((current) => !current)}><IconFolder size={16} /></PaneIconButton>
      </div>
      {branchLoading ? <p className="review__sum">{tr("正在读取分支差异…")}</p> : (
        <div className="review__sum">
          <span className="review__sumlabel">{tr("更改")}</span>
          <span className="diffadd">+{String(add)}</span>
          <span className="diffdel">−{String(del)}</span>
          <span className="review__count">{String(entries.length)}{tr("个文件")}</span>
        </div>
      )}
      {source === "branch" && branch.error !== null ? <div className="review__error" role="alert">{branch.error}</div> : null}
      {localError !== null ? <div className="review__error" role="alert">{localError}</div> : null}
      <div className="review__body">
        <div className="review__lists">
          {branchLoading ? null : git === null && source !== "branch" ? (
            <PaneEmpty icon={<IconBranch size={24} />} title={tr("审查")} description={tr("还没读到改动清单：会话没关联文件夹，或这个文件夹不是 git 仓库。")} />
          ) : entries.length === 0 ? (
            source === "branch" && branch.error !== null ? null : <PaneEmpty icon={<IconCheck size={24} />} title={labels[source]} description={empty} />
          ) : entries.map((entry) => {
            const { base, dir } = baseAndDir(entry.change.path);
            const isOpen = open.has(entry.key);
            const fullId = source + "\0" + entry.change.path;
            const fullValue = full[fullId];
            const fullState = !fullWanted.current.has(fullId)
              ? { kind: "off" as const }
              : fullValue === undefined
                ? { kind: "loading" as const }
                : fullValue === null
                  ? { kind: "missing" as const }
                  : { kind: "text" as const, text: fullValue };
            const apply = gitApplyCommand(entry.change.patch);
            const filePath = root === null ? null : reviewFilePath(root, entry.change.path);
            const writes = pathGitActions(source, entry.change);
            const writeItems = writes.map((action) => ({
              id: action,
              label: action === "stage" ? tr("暂存") : action === "unstage" ? tr("取消暂存") : tr("丢弃"),
              disabled: sessionId === null || entry.change.path === "" || writeBusy,
            }));
            return (
              <div key={entry.key} className="reviewrow" ref={(node) => { if (node) rowRefs.current.set(entry.key, node); else rowRefs.current.delete(entry.key); }}>
                <button
                  type="button"
                  className="reviewrow__btn"
                  onClick={() => {
                    toggle(entry.key);
                    if (!isOpen && entry.change.patch === null && entry.change.type === "untracked") ensureUntracked(entry.change.path);
                  }}
                  aria-expanded={isOpen}
                  title={entry.change.path + (source === "uncommitted" ? " · " + tr(entry.change.staged ? "已暂存" : "未暂存") : "")}
                >
                  <IconFile size={16} />
                  <span className="reviewrow__name">{base}</span>
                  <span className="reviewrow__dir">{dir}</span>
                  <span className="reviewrow__stats">
                    <span className="diffadd">+{String(entry.change.additions)}</span>
                    <span className="diffdel">−{String(entry.change.deletions)}</span>
                  </span>
                  {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </button>
                <PaneMenuButton
                  chevron={false}
                  title={tr("文件操作") + " " + base}
                  trigger={<><IconEllipsis size={14} /><span className="sr-only">{tr("文件操作")} {base}</span></>}
                  items={[
                    ...writeItems,
                    { id: "copy-path", label: tr("复制路径"), disabled: filePath === null && entry.change.path === "", separatorBefore: writeItems.length > 0 },
                    { id: "copy-apply", label: tr("复制 git apply"), disabled: apply === null },
                    { id: "open-file", label: tr("在文件中打开"), disabled: filePath === null },
                    { id: "full-file", label: fullWanted.current.has(fullId) ? tr("收起完整文件") : tr("加载完整文件"), disabled: sessionId === null },
                  ]}
                  onPick={(id) => {
                    if (id === "stage" || id === "unstage") runPath(id, entry.change.path);
                    else if (id === "discard") { setDiscardError(null); setDiscardTarget(entry.change); }
                    else if (id === "copy-path") copyText(filePath ?? entry.change.path);
                    else if (id === "copy-apply" && apply !== null) copyText(apply);
                    else if (id === "open-file" && filePath !== null) onOpenFile(filePath);
                    else if (id === "full-file") loadFull(entry.change.path);
                  }}
                />
                {isOpen ? (
                  <DiffBody
                    change={entry.change}
                    foldKey={entry.key}
                    openFolds={openFolds}
                    onToggleFold={toggleFold}
                    untrackedContent={entry.change.type === "untracked" && entry.change.patch === null ? untracked[entry.change.path] : undefined}
                    mode={mode}
                    wrap={wrap}
                    hideSpace={hideSpace}
                    words={words}
                    full={fullState}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {treeOpen ? (
          <aside className="review__tree" aria-label={tr("文件树")}>
            <PaneSearch label={tr("筛选文件")} value={query} onChange={(event) => setQuery(event.target.value)} />
            {tree.length === 0 ? <p className="review__empty">{tr("没有匹配的文件")}</p> : (
              <ReviewTree
                nodes={tree}
                collapsed={collapsed}
                onToggle={(path) => setCollapsed((current) => {
                  const next = new Set(current);
                  if (next.has(path)) next.delete(path);
                  else next.add(path);
                  return next;
                })}
                onJump={jump}
                pathCount={pathCount}
                staged={staged}
              />
            )}
          </aside>
        ) : null}
      </div>
      <Dialog open={discardTarget !== null} title={tr("丢弃更改")} busy={writeBusy} onClose={() => { if (!writeBusy) { setDiscardTarget(null); setDiscardError(null); } }}>
        <p>{discardTarget?.path}</p>
        <p>{tr("这个路径的改动会被丢掉。")}</p>
        {discardError !== null ? <p role="alert">{discardError}</p> : null}
        <Btn type="button" disabled={writeBusy} onClick={() => { setDiscardTarget(null); setDiscardError(null); }}>{tr("取消")}</Btn>
        <Btn type="button" variant="danger" disabled={writeBusy || discardTarget === null || discardTarget.path === ""} onClick={confirmDiscard}>{tr("丢弃")}</Btn>
      </Dialog>
    </div>
  );
}
