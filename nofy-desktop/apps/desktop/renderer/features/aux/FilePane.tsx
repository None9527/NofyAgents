/**
 * FilePane —— 辅助 pane 的「文件」标签（生态面 #2）。
 *
 * 数据全部走已实测的读路径（docs/contract/ecosystem-shapes.json）：
 *   树   = _nofy/fs/list（depth=1 逐层展开；**includeHidden=false**——实测默认 true
 *        会把 .git 内部全吐出来）
 *   预览 = _nofy/fs/read_file（maxLines 截断，size/lineCount 由内核给）
 *   搜索 = _nofy/search/fuzzy/open → change → **status 通知** → close
 *        （结果不在 change 的响应里，走 _nofy/search/fuzzy/status，投影进 store.search）
 *
 * 状态归属：展开/加载/预览/查询是**窗口局部态**（useState），与草稿同纪律；
 * 内核推来的搜索结果住 store（core/project.ts 的 search-fuzzy-status 分支）。
 * 出站一律 runtime.effect——线路名只在 core/effects.ts。
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { CodeBlock } from "../../ui/codeblock.tsx";
import { IconChevronDown, IconChevronRight, IconFile, IconFolder, IconSearch } from "../../ui/icons.tsx";
import { readFsFile, readFsNodes, readFuzzyMatches } from "../../ui/readers.ts";
import type { FsFile, FsNode, FuzzyMatch } from "../../ui/readers.ts";

export type FilePaneProps = {
  runtime: Runtime;
  /** 活跃会话的 cwd（没有则不渲染树，诚实说明）。 */
  root: string | null;
  sessionId: string | null;
};

type DirState = { nodes: FsNode[]; truncated: boolean };

function langOf(path: string): string | null {
  const dot = path.lastIndexOf(".");
  if (dot === -1 || dot === path.length - 1) return null;
  return path.slice(dot + 1).toLowerCase();
}

export function FilePane({ runtime, root, sessionId }: FilePaneProps) {
  const state = useSyncExternalStore(runtime.store.subscribe, runtime.store.getState);
  const [dirs, setDirs] = useState<Record<string, DirState>>({});
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ path: string; file: FsFile | null; busy: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const searchIdRef = useRef<string | null>(null);
  const loadedRoot = useRef<string | null>(null);

  const loadDir = useCallback(
    (path: string) => {
      setLoading((s) => new Set(s).add(path));
      void runtime
        .effect({ kind: "fs/list", sessionId, path, depth: 1, includeHidden: false, limit: 500 })
        .then((r) => {
          setLoading((s) => {
            const next = new Set(s);
            next.delete(path);
            return next;
          });
          if (!r.ok) {
            setError(path + "：" + r.error);
            return;
          }
          setError(null);
          const read = readFsNodes(r.value);
          setDirs((d) => ({ ...d, [path]: read }));
        });
    },
    [runtime, sessionId],
  );

  // 根目录懒加载（root 变化重来）
  useEffect(() => {
    if (root === null || loadedRoot.current === root) return;
    loadedRoot.current = root;
    setDirs({});
    setExpanded(new Set());
    loadDir(root);
  }, [root, loadDir]);

  const openFile = useCallback(
    (path: string) => {
      setPreview({ path, file: null, busy: true });
      void runtime.effect({ kind: "fs/readFile", sessionId, path, maxLines: 4000 }).then((r) => {
        if (!r.ok) {
          setPreview({ path, file: null, busy: false });
          setError(path + "：" + r.error);
          return;
        }
        setPreview({ path, file: readFsFile(r.value), busy: false });
      });
    },
    [runtime, sessionId],
  );

  /* ── 模糊搜索：open 一次、change 防抖、结果来自 store.search ── */
  useEffect(() => {
    if (root === null) return;
    const q = query.trim();
    if (q.length === 0) {
      const sid = searchIdRef.current;
      if (sid !== null) {
        searchIdRef.current = null;
        void runtime.effect({ kind: "search/fuzzyClose", searchId: sid });
      }
      return;
    }
    const t = setTimeout(() => {
      const existing = searchIdRef.current;
      if (existing !== null) {
        void runtime.effect({ kind: "search/fuzzyChange", searchId: existing, query: q });
        return;
      }
      void runtime.effect({ kind: "search/fuzzyOpen", sessionId, cwd: root }).then((r) => {
        if (!r.ok) {
          setError("搜索打开失败：" + r.error);
          return;
        }
        const o = (r.value as { result?: { searchId?: string } } | null)?.result ?? null;
        const sid = typeof o?.searchId === "string" ? o.searchId : null;
        if (sid === null) {
          setError("搜索 open 没给 searchId");
          return;
        }
        searchIdRef.current = sid;
        void runtime.effect({ kind: "search/fuzzyChange", searchId: sid, query: q });
      });
    }, 250);
    return () => clearTimeout(t);
  }, [query, root, runtime, sessionId]);

  // 卸载时关掉搜索会话（内核侧的 fuzzy 会话不关会一直轮询）
  useEffect(() => {
    return () => {
      const sid = searchIdRef.current;
      if (sid !== null) void runtime.effect({ kind: "search/fuzzyClose", searchId: sid });
    };
  }, [runtime]);

  const matches = useMemo<FuzzyMatch[]>(() => readFuzzyMatches(state.search?.matches ?? []), [state.search]);
  const searching = query.trim().length > 0;

  if (root === null) {
    return (
      <div className="emptyboard">
        <IconFolder className="emptyboard-icon" />
        <p className="emptyboard-hint">会话还没关联文件夹。建一个会话，文件树就有根了。</p>
      </div>
    );
  }

  const toggleDir = (path: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        if (dirs[path] === undefined) loadDir(path);
      }
      return next;
    });
  };

  const renderDir = (path: string, depth: number): React.ReactNode => {
    const d = dirs[path];
    if (d === undefined) {
      return (
        <div key={path + ":loading"} className="filetree__row" style={{ paddingLeft: 8 + (depth + 1) * 14 }}>
          <span className="filetree__spin">…</span>
        </div>
      );
    }
    return d.nodes.map((n) => {
      const row =
        n.type === "directory" ? (
          <button
            key={n.path}
            type="button"
            className="filetree__row"
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => toggleDir(n.path)}
            title={n.path}
          >
            {expanded.has(n.path) ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
            <IconFolder size={13} />
            <span className="filetree__name">{n.name}</span>
          </button>
        ) : (
          <button
            key={n.path}
            type="button"
            className={"filetree__row" + (preview?.path === n.path ? " filetree__row--on" : "")}
            style={{ paddingLeft: 8 + depth * 14 + 12 }}
            onClick={() => openFile(n.path)}
            title={n.path}
          >
            <IconFile size={13} />
            <span className="filetree__name">{n.name}</span>
          </button>
        );
      const children = n.type === "directory" && expanded.has(n.path) ? renderDir(n.path, depth + 1) : null;
      return (
        <div key={n.path}>
          {row}
          {children}
        </div>
      );
    });
  };

  return (
    <div className="filepane">
      <div className="filepane__search">
        <IconSearch size={13} />
        <input
          value={query}
          spellCheck={false}
          autoComplete="off"
          placeholder="模糊搜文件（_nofy/search/fuzzy/*）"
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && state.search !== null ? (
          <span className="filepane__count">
            {String(matches.length)}
            {state.search.total !== null ? "/" + String(state.search.total) : ""}
            {state.search.done ? "" : " …"}
          </span>
        ) : null}
      </div>
      {error !== null ? <p className="filepane__error">{error}</p> : null}
      <div className="filepane__body">
        {searching ? (
          matches.length === 0 ? (
            <div className="emptyboard">
              <IconSearch className="emptyboard-icon" />
              <p className="emptyboard-hint">{state.search === null ? "搜索会话建立中…" : "没有匹配的文件。"}</p>
            </div>
          ) : (
            matches.map((m) => (
              <button
                key={m.path}
                type="button"
                className={"filetree__row" + (preview?.path === m.path ? " filetree__row--on" : "")}
                onClick={() => openFile(m.path)}
                title={m.path}
              >
                {m.type === "directory" ? <IconFolder size={13} /> : <IconFile size={13} />}
                <span className="filetree__name">{m.name}</span>
                <span className="filetree__dir">{dirOf(m.path, root)}</span>
              </button>
            ))
          )
        ) : (
          renderDir(root, 0)
        )}
      </div>
      {preview !== null ? (
        <div className="filepane__preview">
          <div className="filepane__preview-head">
            <span className="filetree__name" title={preview.path}>
              {preview.path.split("/").pop() ?? preview.path}
            </span>
            <span className="filepane__preview-meta">
              {preview.busy
                ? "读取中…"
                : preview.file === null
                  ? "读取失败"
                  : String(preview.file.lineCount ?? "?") + " 行 · " + String(preview.file.size ?? "?") + " B"}
            </span>
            <button type="button" className="filepane__close" onClick={() => setPreview(null)}>
              关闭
            </button>
          </div>
          <div className="filepane__preview-body">
            {preview.file !== null ? <CodeBlock lang={langOf(preview.path)} code={preview.file.content} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** 相对工作区的目录部分（抄 QuickPick :1167 fileDirectoryLabel 的思路）。 */
function dirOf(path: string, root: string): string {
  const rel = path.startsWith(root) ? path.slice(root.length).replace(/^\//, "") : path;
  const slash = rel.lastIndexOf("/");
  return slash === -1 ? "" : rel.slice(0, slash);
}
