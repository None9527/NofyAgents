/**
 * ReviewPane —— 辅助 pane 的「审查」标签（生态面 #4）。
 *
 * ## 活壳解剖（CDP 实测，docs/contract/zcode-live-metrics.md §1.5）
 *
 *   内容头 h-56 p-3：左 = 区段选择器（未暂存…），右 = 刷新（refresh-cw）h-32
 *   文件行 h-32 px-3 gap-3：文件类型图标 16 + 名 truncate + 目录 truncate(最淡)
 *            + 右靠 +N(text-diff-added) −M(text-diff-removed) + chevron（展开旋转 180）
 *   展开体 = diff 视图：gutter 38、代码行 h-20、折叠行 h-32「N unmodified lines」
 *            （活壳是 shadow-DOM web component diffs-container；我们自绘、度量对齐）
 *   汇总条 = 卡片对话区右上浮 chip：file-diff + 更改 + +N −M（点开审查面）
 *
 * ## 数据（全部已实测，ecosystem-shapes.json）
 *
 *   git/status（includePatches=true）⇒ 条目自带 unified patch ⇒ 展开**零额外往返**；
 *   未跟踪文件没有 patch ⇒ 展开时才发 fs/read_file 取工作区内容，全行画成增行；
 *   git/files(version="HEAD") 留给「对照旧版」的后续批（本轮不放假按钮）。
 *
 * 状态归属：git/status 由 App 轮询持有（与 session/info 的 context 同纪律），
 * 展开/折叠是窗口局部态。出站一律 runtime.effect。
 */
import { useCallback, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import {
  IconBranch,
  IconChevronDown,
  IconChevronRight,
  IconFile,
  IconRefresh,
  IconCheck,
} from "../../ui/icons.tsx";
import { readFsFile } from "../../ui/readers.ts";
import type { GitChange, GitStatus } from "../../ui/readers.ts";
import { foldContext, parseUnifiedDiff } from "./diffModel.ts";
import type { DiffLine, DiffSegment } from "./diffModel.ts";

/** 连续上下文超过这个行数就折（活壳折叠行的可见行为；0 = 不折） */
const FOLD_THRESHOLD = 8;

export type ReviewPaneProps = {
  runtime: Runtime;
  sessionId: string | null;
  /** App 轮询持有的 git/status（null = 还没读到 / 非 git 工作区） */
  git: GitStatus | null;
  gitBusy: boolean;
  onRefresh: () => void;
};

function baseAndDir(path: string): { base: string; dir: string } {
  const parts = path.split("/");
  const base = parts.pop() ?? path;
  return { base, dir: parts.join("/") };
}

function DiffLineRow({ line }: { line: DiffLine }) {
  const no = line.kind === "add" ? line.newNo : line.oldNo;
  return (
    <div className={"diffl diffl--" + line.kind}>
      <span className="diffl__no">{no === null ? "" : String(no)}</span>
      <code className="diffl__code">{line.text}</code>
    </div>
  );
}

function DiffBody({
  change,
  foldKey,
  openFolds,
  onToggleFold,
  untrackedContent,
}: {
  change: GitChange;
  foldKey: string;
  openFolds: Set<string>;
  onToggleFold: (key: string) => void;
  /** 未跟踪文件的工作区内容；undefined = 还没取，null = 取失败/二进制 */
  untrackedContent: string | null | undefined;
}) {
  let segs: DiffSegment[];
  if (change.patch === null) {
    if (untrackedContent === undefined) return <div className="diffnote">读取工作区内容…</div>;
    if (untrackedContent === null) return <div className="diffnote">读不到内容（二进制或读取失败）</div>;
    const lines: DiffLine[] = untrackedContent
      .split("\n")
      .map((text, i) => ({ kind: "add" as const, oldNo: null, newNo: i + 1, text }));
    segs = [{ kind: "show", lines }];
  } else {
    segs = foldContext(parseUnifiedDiff(change.patch), FOLD_THRESHOLD);
  }
  return (
    <div className="diffview">
      {segs.map((seg, i) => {
        if (seg.kind === "show") {
          return (
            <div key={"s" + String(i)} className="difflines">
              {seg.lines.map((l, j) => (
                <DiffLineRow key={String(j)} line={l} />
              ))}
            </div>
          );
        }
        const key = foldKey + ":" + String(i);
        const opened = openFolds.has(key);
        if (opened && !seg.gap) {
          return (
            <div key={key} className="difflines">
              {seg.lines.map((l, j) => (
                <DiffLineRow key={String(j)} line={l} />
              ))}
            </div>
          );
        }
        return (
          <button
            key={key}
            type="button"
            className="difffold"
            disabled={seg.gap}
            onClick={() => onToggleFold(key)}
            title={seg.gap ? "两个 hunk 之间的空档：内核没吐这段上下文，本地展不开" : "展开 " + String(seg.count) + " 行未修改"}
          >
            {String(seg.count)} 行未修改
          </button>
        );
      })}
    </div>
  );
}

export function ReviewPane({ runtime, sessionId, git, gitBusy, onRefresh }: ReviewPaneProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [openFolds, setOpenFolds] = useState<Set<string>>(() => new Set());
  const [untracked, setUntracked] = useState<Record<string, string | null | undefined>>({});
  const [error, setError] = useState<string | null>(null);

  const toggle = (path: string): void =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const toggleFold = (key: string): void =>
    setOpenFolds((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  /** 未跟踪文件：展开时才取工作区内容（fs/read_file 已实测） */
  const ensureUntracked = useCallback(
    (path: string) => {
      if (sessionId === null || untracked[path] !== undefined) return;
      setUntracked((m) => ({ ...m, [path]: undefined }));
      void runtime.effect({ kind: "fs/readFile", sessionId, path, maxLines: 2000 }).then((r) => {
        if (!r.ok) {
          setError(path + "：" + r.error);
          setUntracked((m) => ({ ...m, [path]: null }));
          return;
        }
        const f = readFsFile(r.value);
        setUntracked((m) => ({ ...m, [path]: f === null ? null : f.content }));
      });
    },
    [runtime, sessionId, untracked],
  );

  const changes = git === null ? [] : [...git.unstaged, ...git.staged];
  let add = 0;
  let del = 0;
  for (const c of changes) {
    add += c.additions;
    del += c.deletions;
  }

  const renderRows = (items: GitChange[]) =>
    items.map((c) => {
      const { base, dir } = baseAndDir(c.path);
      const isOpen = open.has(c.path);
      return (
        <div className="reviewrow" key={c.path}>
          <button
            type="button"
            className="reviewrow__btn"
            onClick={() => {
              toggle(c.path);
              if (!isOpen && c.patch === null && c.type === "untracked") ensureUntracked(c.path);
            }}
            aria-expanded={isOpen}
            title={c.path + "（" + c.type + "）"}
          >
            <IconFile size={16} />
            <span className="reviewrow__name">{base}</span>
            <span className="reviewrow__dir">{dir}</span>
            <span className="reviewrow__stats">
              <span className="diffadd">+{String(c.additions)}</span>
              <span className="diffdel">−{String(c.deletions)}</span>
            </span>
            {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </button>
          {isOpen ? (
            <DiffBody
              change={c}
              foldKey={c.path}
              openFolds={openFolds}
              onToggleFold={toggleFold}
              untrackedContent={c.type === "untracked" && c.patch === null ? untracked[c.path] : undefined}
            />
          ) : null}
        </div>
      );
    });

  return (
    <div className="review">
      <div className="review__head">
        <span className="review__branch" title={git?.commit ?? "内核没给 commit（非 git 工作区？）"}>
          <IconBranch size={14} />
          <span>{git?.branch ?? "非 git"}</span>
          {git?.commit !== null && git !== null ? <span className="review__commit">{git.commit.slice(0, 7)}</span> : null}
        </span>
        <button
          type="button"
          className="iconbtn"
          onClick={onRefresh}
          disabled={gitBusy}
          aria-label="刷新"
          title="重发 _nofy/git/status（includePatches=true）"
        >
          <IconRefresh size={15} />
        </button>
      </div>
      <div className="review__sum">
        <span className="review__sumlabel">更改</span>
        <span className="diffadd">+{String(add)}</span>
        <span className="diffdel">−{String(del)}</span>
        <span className="review__count">{String(changes.length)} 个文件</span>
      </div>
      {error !== null ? <div className="review__error">{error}</div> : null}
      {git === null ? (
        <div className="emptyboard">
          <IconBranch className="emptyboard-icon" />
          <p className="emptyboard-hint">还没读到改动清单：会话没关联文件夹，或这个文件夹不是 git 仓库。</p>
        </div>
      ) : changes.length === 0 ? (
        <div className="emptyboard">
          <IconCheck className="emptyboard-icon" />
          <p className="emptyboard-hint">工作区很干净，没有待提交的改动。</p>
        </div>
      ) : (
        <div className="review__lists">
          {git.unstaged.length > 0 ? (
            <section className="review__section">
              <h4 className="review__sectionhead">未暂存 {String(git.unstaged.length)}</h4>
              {renderRows(git.unstaged)}
            </section>
          ) : null}
          {git.staged.length > 0 ? (
            <section className="review__section">
              <h4 className="review__sectionhead">已暂存 {String(git.staged.length)}</h4>
              {renderRows(git.staged)}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
