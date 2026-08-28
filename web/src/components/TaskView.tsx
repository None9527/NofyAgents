import { useEffect, useMemo, useRef, useState } from "react";
import type { Task, Turn } from "../lib/rpc";
import type { HostClient } from "../lib/rpc";
import { renderMarkdown } from "../lib/markdown";
import { Composer } from "./Composer";
import { Dock } from "./Dock";
import { ElicitationDialog } from "./ElicitationDialog";
import { IconArrowDown, IconBranch, IconChevronDown, IconFolder } from "../icons";
import { useI18n } from "../lib/i18n";

interface Props {
  client: HostClient;
  task: Task;
  turns: Turn[];
  live?: {
    text: string;
    thought?: string;
    status: string;
    pending?: { name: string; input: Record<string, unknown> } | null;
    elicitation?: Record<string, unknown> | null;
  } | null;
  stats?: {
    usage: { input: number; output: number; reasoning: number };
    summary: string | null;
    contextTokens?: number;
    contextWindow?: number;
    queue?: string[];
  } | null;
  commands: Array<{ name: string; description: string }>;
  workspacePath?: string;
  effort?: string;
  onEffort?: (effort: string) => void;
  tasks?: Array<{ taskId: string; title: string }>;
  skills?: Array<{ name: string; description?: string }>;
  onBack: () => void;
  onFollowUp: (text: string, mode?: string) => void;
  onRetry?: (text: string) => void;
  /** source canFork: derive a new task from this turn's prompt */
  onFork?: (text: string) => void;
  /** header breadcrumb menu + git chip review */
  recentProjects?: string[];
  onSwitchWorkspace?: (path: string) => void;
  onOpenReview?: () => void;
  onEditUser?: (text: string) => void;
  onRewind?: (turnIndex: number) => void;
  onResolveElicitation?: (
    action: "accept" | "decline" | "cancel",
    content?: Record<string, unknown>,
  ) => void;
  onApproveTool?: (allow: boolean) => void;
  onCancel?: () => void;
  onAction?: (action: "rename" | "pin" | "archive" | "delete") => void;
  /** bottom dock (terminal/browser/review) visibility, owned by the shell */
  terminalOpen: boolean;
  /** right summary aside visibility, owned by the shell caption cluster */
  panelOpen: boolean;
  onPanelOpenChange: (open: boolean) => void;
  onHideDock: () => void;
  /** dock tab state lives in the shell so the command palette can add tabs */
  dockTabs: Array<{ id: number; kind: "terminal" | "browser" | "review"; url?: string }>;
  dockActive: number | null;
  onDockSelect: (id: number) => void;
  onDockAdd: (kind: "terminal" | "browser" | "review") => void;
  onDockClose: (id: number) => void;
}

interface TodoItem {
  id?: string;
  content?: string;
  status?: string;
}

const WRITE_TOOLS = new Set(["write", "write_file", "search_replace", "edit_file", "str_replace"]);

const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function exportMarkdown(task: Task, turns: Turn[]): void {
  const lines: string[] = [`# ${task.title}`, ""];
  for (const turn of turns) {
    if (turn.userText) lines.push("## 用户", "", turn.userText, "");
    for (const call of turn.toolCalls ?? []) {
      lines.push(`> 工具 \`${call.name}\``, ">", "```", `> ${call.output.slice(0, 800)}`, "```", "");
    }
    if (turn.assistantText) lines.push("## 助手", "", turn.assistantText, "");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${task.title.slice(0, 40) || "session"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TaskView({
  client,
  task,
  turns,
  live,
  stats,
  commands,
  workspacePath,
  effort,
  onEffort,
  tasks,
  skills,
  onFollowUp,
  onRetry,
  onFork,
  onEditUser,
  recentProjects,
  onSwitchWorkspace,
  onOpenReview,
  onRewind,
  onResolveElicitation,
  onApproveTool,
  onCancel,
  onAction,
  terminalOpen,
  panelOpen,
  onPanelOpenChange,
  onHideDock,
  dockTabs,
  dockActive,
  onDockSelect,
  onDockAdd,
  onDockClose,
}: Props) {
  const { tr } = useI18n();
  const [draft, setDraft] = useState("");
  const [pinned, setPinned] = useState(true);
  const [votes, setVotes] = useState<Record<number, "up" | "down">>({});
  const [navOpen, setNavOpen] = useState(false);
  const [wsMenu, setWsMenu] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [findQ, setFindQ] = useState("");
  const [findIdx, setFindIdx] = useState(0);
  const [codeView, setCodeView] = useState<{ path: string; content: string } | null>(null);

  // source quickPick.find: Ctrl+F find-in-conversation with prev/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const findMatches = findQ.trim()
    ? turns
        .map((t, i) => ({ i, hit: (t.userText ?? "").includes(findQ) || (t.assistantText ?? "").includes(findQ) }))
        .filter((x) => x.hit)
        .map((x) => x.i)
    : [];
  const gotoMatch = (dir: number) => {
    if (findMatches.length === 0) return;
    const next = (findIdx + dir + findMatches.length) % findMatches.length;
    setFindIdx(next);
    document.getElementById(`turn-${findMatches[next]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const openCode = (path: string) => {
    void client.readContext(path).then((content) => {
      if (content != null) setCodeView({ path, content });
    });
  };
  const scrollRef = useRef<HTMLDivElement>(null);

  // agent work panel: latest todo list + files touched this session
  const { todos, changedFiles } = useMemo(() => {
    let latest: TodoItem[] = [];
    const files: string[] = [];
    for (const turn of turns) {
      for (const call of turn.toolCalls ?? []) {
        const name = call.name.toLowerCase();
        const input = call.input as { todos?: TodoItem[]; path?: string; file_path?: string };
        if (name === "todo_write" || name === "todowrite") latest = input.todos ?? latest;
        const path = input.path ?? input.file_path;
        if (path && (WRITE_TOOLS.has(name) || name.includes("write") || name.includes("replace") || name.includes("edit"))) {
          if (!files.includes(path)) files.push(path);
        }
      }
    }
    return { todos: latest, changedFiles: files };
  }, [turns]);

  const running = task.status === "running";
  const awaiting = task.status === "awaiting-approval" || live?.status === "awaiting-approval";
  const userTurns = turns
    .map((t, i) => ({ i, text: t.userText }))
    .filter((t): t is { i: number; text: string } => Boolean(t.text));
  const ctxPct = stats?.contextWindow
    ? Math.min(100, ((stats.contextTokens ?? 0) / stats.contextWindow) * 100)
    : 0;

  // auto-scroll while pinned to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [turns, live, pinned]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    // sending while running enqueues the message (drained when the turn ends)
    setDraft("");
    setPinned(true);
    onFollowUp(text);
  };

  return (
    <section className="task-view">
      <header className="ws-header">
        <span
          className="ws-breadcrumb"
          title={workspacePath ?? ""}
          onClick={() => setWsMenu((v) => !v)}
          style={{ position: "relative" }}
        >
          <IconFolder width={14} height={14} />
          {(workspacePath ?? "").split("/").pop() || "—"}
          <IconChevronDown width={12} height={12} />
          {wsMenu && (
            <>
              <div className="cap-menu-backdrop" onClick={() => setWsMenu(false)} />
              <div className="cap-menu" style={{ top: 30, left: 0, width: 220 }}>
                {(recentProjects ?? []).map((p) => (
                  <button
                    className="cap-menu-item"
                    key={p}
                    onClick={() => {
                      setWsMenu(false);
                      onSwitchWorkspace?.(p);
                    }}
                  >
                    <span>{p.split("/").pop()}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </span>
        <h1 className="ws-task-title" title={task.title}>
          {task.title}
        </h1>
        {stats?.summary && (
          <span
            className="ws-change-pill"
            title={tr("openReviewHint")}
            onClick={() => onOpenReview?.()}
            style={{ cursor: "pointer" }}
          >
            <span>{stats.summary}</span>
          </span>
        )}
        <span
          className="ws-git-chip"
          title={tr("openReviewHint")}
          onClick={() => onOpenReview?.()}
        >
          <IconBranch width={12} height={12} />
          {changedFiles.length}
        </span>
        <span className="spacer" />
        <span className="ws-header-actions">
          {stats?.contextTokens ? (
            <span
              className="ctx-meter"
              title={`${tr("ctx")}: ${fmtK(stats.contextTokens)} / ${fmtK(stats.contextWindow ?? 0)}`}
            >
              <span className="ctx-bar">
                <span style={{ width: `${ctxPct}%` }} className={ctxPct > 85 ? "hot" : ""} />
              </span>
              {fmtK(stats.contextTokens)}
            </span>
          ) : null}
          {running && (
            <button className="settings-button stop-button" onClick={onCancel}>
              ■ {tr("stop")}
            </button>
          )}
          <button className="settings-button" onClick={() => exportMarkdown(task, turns)}>
            {tr("export")}
          </button>
          <button className="settings-button" onClick={() => onAction?.("rename")}>
            {tr("rename")}
          </button>
          <button className="settings-button" onClick={() => onAction?.("pin")}>
            📌 {tr("pin")}
          </button>
          <button className="settings-button" onClick={() => onAction?.("archive")}>
            {tr("archive")}
          </button>
          <button className="settings-button" onClick={() => onAction?.("delete")}>
            {tr("delete")}
          </button>
        </span>
      </header>

      {findOpen && (
        <div className="find-bar">
          <input
            className="overlay-input"
            placeholder={tr("findPlaceholder")}
            value={findQ}
            onChange={(e) => {
              setFindQ(e.target.value);
              setFindIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") gotoMatch(e.shiftKey ? -1 : 1);
              if (e.key === "Escape") setFindOpen(false);
            }}
            autoFocus
          />
          <span className="find-count">
            {findQ.trim() ? `${findMatches.length === 0 ? 0 : findIdx + 1} / ${findMatches.length}` : ""}
          </span>
          <button className="msg-act" title={tr("findPrev")} onClick={() => gotoMatch(-1)}>
            ↑
          </button>
          <button className="msg-act" title={tr("findNext")} onClick={() => gotoMatch(1)}>
            ↓
          </button>
          <button className="msg-act" onClick={() => setFindOpen(false)}>
            ✕
          </button>
        </div>
      )}

      <div className="task-body">
      <div className="conv-column">
      <div className="task-scroll" ref={scrollRef} onScroll={onScroll}>
        {turns.length === 0 && <div className="empty">{tr("noConversation")}</div>}
        {turns.map((turn, i) => (
          <div className="turn" key={i} id={`turn-${i}`}>
            {turn.userText && (
              <div className="msg user-side">
                {/* source: user turn = plain subtle text row with border-b + hover edit */}
                <div className="turn-user-row">
                  <div className="turn-user-text">{turn.userText}</div>
                  <span className="turn-hover-actions">
                    <button
                      className="msg-act"
                      title={tr("turnEdit")}
                      onClick={() => {
                        setDraft(turn.userText ?? "");
                        // source edit disposition: reset conversation (+files) and resend
                        if (onRewind && window.confirm(tr("turnEditConfirm"))) onRewind(i);
                        onEditUser?.(turn.userText ?? "");
                      }}
                    >
                      ✎
                    </button>
                    {onRewind && (
                      <button
                        className="msg-act"
                        title={tr("rewindToHere")}
                        onClick={() => onRewind(i)}
                      >
                        ↺
                      </button>
                    )}
                  </span>
                </div>
              </div>
            )}
            {(turn.toolCalls ?? []).map((call, j) => (
              <details className="tool-block" key={`t${j}`}>
                <summary className="tool-name">
                  <span className={`tool-status ${call.output ? "ok" : "run"}`}>
                    {call.output ? "✓" : "…"}
                  </span>
                  {call.name}
                  {call.name === "bash" || call.name === "run_terminal_command" ? (
                    `：${String(call.input.command ?? "").slice(0, 80)}`
                  ) : (
                    <>
                      ：
                      <span
                        className="tool-path-link"
                        title={tr("openCodeHint")}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const raw = String(call.input.path ?? call.input.file_path ?? "");
                          if (!raw) return;
                          openCode(raw.startsWith("/") ? raw : `${workspacePath ?? ""}/${raw}`);
                        }}
                      >
                        {String(call.input.path ?? call.input.file_path ?? "")}
                      </span>
                    </>
                  )}
                </summary>
                <pre className="tool-output">{call.output.slice(0, 4000) || "(无输出)"}</pre>
              </details>
            ))}
            {turn.thought && (
              <details className="thought-wrap">
                <summary>{tr("thought")}</summary>
                <div className="bubble thought">{turn.thought}</div>
              </details>
            )}
            {turn.assistantText && (
              <div className="msg assistant-side">
                <div className="bubble assistant">
                  <span
                    className="bubble-copy"
                    title={tr("copy")}
                    onClick={() => void navigator.clipboard?.writeText(turn.assistantText ?? "")}
                  >
                    ⧉
                  </span>
                  {renderMarkdown(turn.assistantText)}
                </div>
                <div className="msg-meta turn-hover-actions">
                  <span className="msg-actions">
                    <button
                      className={`msg-act ${votes[i] === "up" ? "on" : ""}`}
                      title={tr("like")}
                      onClick={() =>
                        setVotes((v) => {
                          const n = { ...v };
                          if (n[i] === "up") delete n[i];
                          else n[i] = "up";
                          return n;
                        })
                      }
                    >
                      👍
                    </button>
                    <button
                      className={`msg-act ${votes[i] === "down" ? "on" : ""}`}
                      title={tr("dislike")}
                      onClick={() =>
                        setVotes((v) => {
                          const n = { ...v };
                          if (n[i] === "down") delete n[i];
                          else n[i] = "down";
                          return n;
                        })
                      }
                    >
                      👎
                    </button>
                    {turn.userText && (
                      <button
                        className="msg-act"
                        title={tr("retry")}
                        onClick={() => onRetry?.(turn.userText ?? "")}
                      >
                        ↻
                      </button>
                    )}
                    {turn.userText && onFork && (
                      <button
                        className="msg-act"
                        title={tr("turnFork")}
                        onClick={() => onFork(turn.userText ?? "")}
                      >
                        ⑂
                      </button>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {live && (live.thought || live.text) && (
          <div className="turn">
            {live.thought && (
              <details className="thought-wrap" open>
                <summary>{tr("thought")}</summary>
                <div className="bubble thought">{live.thought}</div>
              </details>
            )}
            {live.text && (
              <div className="msg assistant-side">
                <div className="bubble assistant streaming">{renderMarkdown(live.text)}</div>
              </div>
            )}
          </div>
        )}

        {awaiting && live?.pending && (
          <div className="approve-row">
            <div className="tool-block">
              <span className="tool-name">
                {tr("awaiting")}: {live.pending.name}
                {live.pending.name === "bash"
                  ? `: ${String(live.pending.input.command ?? "").slice(0, 80)}`
                  : `: ${String(live.pending.input.path ?? "").slice(0, 80)}`}
              </span>
            </div>
            <div className="approve-buttons">
              <button className="settings-button" onClick={() => onApproveTool?.(true)}>
                {tr("allow")}
              </button>
              <button className="settings-button" onClick={() => onApproveTool?.(false)}>
                {tr("deny")}
              </button>
            </div>
          </div>
        )}

        {task.mode === "plan" && task.status === "completed" && !live && (
          <div className="approve-row">
            <button className="settings-button" onClick={() => onFollowUp("按照计划执行", "build")}>
              {tr("approvePlan")}
            </button>
          </div>
        )}
        {stats?.summary && <div className="turn-summary">摘要：{stats.summary}</div>}
      </div>

      {!pinned && (
        <button
          className="scroll-bottom"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
            setPinned(true);
          }}
        >
          <IconArrowDown width={14} height={14} />
        </button>
      )}

      {userTurns.length > 1 && (
        <>
          <button
            className={`turn-nav-toggle ${navOpen ? "active" : ""}`}
            title={tr("turnNav")}
            onClick={() => setNavOpen((v) => !v)}
          >
            ☰ {userTurns.length}
          </button>
          {navOpen && (
            <div className="turn-nav">
              {userTurns.slice(-12).map((t) => (
                <button
                  key={t.i}
                  className="turn-nav-item"
                  title={t.text.slice(0, 120)}
                  onClick={() => {
                    document.getElementById(`turn-${t.i}`)?.scrollIntoView({ behavior: "smooth" });
                    setPinned(false);
                  }}
                >
                  {t.text.slice(0, 18)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="task-composer-wrap">
        {stats?.queue && stats.queue.length > 0 && (
          <div className="queue-row">
            <span className="queue-label">{tr("queue")}</span>
            {stats.queue.map((q, i) => (
              <span className="queue-chip" key={i} title={q}>
                {q.slice(0, 40)}
              </span>
            ))}
          </div>
        )}
        <Composer
          client={client}
          draft={draft}
          setDraft={setDraft}
          onSubmit={submit}
          commands={commands}
          workspacePath={workspacePath}
          effort={effort}
          onEffort={onEffort}
          tasks={tasks}
          skills={skills}
          busy={running}
        />
      </div>

      {terminalOpen && (
        <Dock
          client={client}
          cwd={workspacePath ?? "."}
          tabs={dockTabs}
          activeId={dockActive}
          onSelect={onDockSelect}
          onClose={onDockClose}
          onAdd={onDockAdd}
          onHide={onHideDock}
        />
      )}
      </div>

      {panelOpen && (
        <aside className="work-panel">
          <div className="work-panel-head">
            <span>{tr("panel")}</span>
            <span className="msg-act" onClick={() => onPanelOpenChange(false)}>
              ✕
            </span>
          </div>
          <div className="work-panel-section">
            <div className="work-panel-title">{tr("todos")}</div>
            {todos.length === 0 && <div className="empty">{tr("noTodos")}</div>}
            {todos.map((todo, i) => (
              <div className={`todo-row todo-${todo.status ?? "pending"}`} key={todo.id ?? i}>
                <span className="todo-mark">
                  {todo.status === "completed" ? "✓" : todo.status === "in_progress" ? "…" : "·"}
                </span>
                <span>{todo.content}</span>
              </div>
            ))}
          </div>
          <div className="work-panel-section">
            <div className="work-panel-title">{tr("filesChanged")}</div>
            {changedFiles.length === 0 && <div className="empty">{tr("gitClean")}</div>}
            {changedFiles.map((file) => (
              <div className="todo-row" key={file}>
                <span className="todo-mark">✎</span>
                <span className="git-path">{file}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
      </div>

      {codeView && (
        <div className="overlay-backdrop" onClick={() => setCodeView(null)}>
          <div className="code-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="code-viewer-head">
              <span className="git-path">{codeView.path}</span>
              <span className="msg-act" onClick={() => setCodeView(null)}>
                ✕
              </span>
            </div>
            <pre className="code-viewer-body">{codeView.content}</pre>
          </div>
        </div>
      )}

      {live?.elicitation && (
        <ElicitationDialog
          params={live.elicitation}
          onResolve={(action, content) => onResolveElicitation?.(action, content)}
        />
      )}
    </section>
  );
}
