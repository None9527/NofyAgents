import { useState } from "react";
import type { Task } from "../lib/rpc";
import { useI18n } from "../lib/i18n";
import { relativeDays } from "../lib/format";
import { getTaskMeta } from "../lib/taskmeta";
import {
  IconArchive,
  IconAutomation,
  IconChevronDown,
  IconCopy,
  IconDots,
  IconExpand,
  IconFilter,
  IconFolder,
  IconGauge,
  IconGear,
  IconHash,
  IconPlus,
  IconPlusCircle,
  IconSearch,
  IconSkill,
} from "../icons";

export type MainView =
  | "home"
  | "task"
  | "settings"
  | "automations"
  | "skills"
  | "terminal"
  | "browser"
  | "files"
  | "git";

export type TaskAction =
  | "rename"
  | "pin"
  | "archive"
  | "delete"
  | "markUnread"
  | "copyPath";

interface Props {
  tasks: Task[];
  workspaceName: string;
  onOpenTask: (task: Task) => void;
  onNewTask: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onNavigate: (view: MainView) => void;
  /** source taskList context menu: pin/rename/archive/markUnread/copy/delete */
  onTaskAction: (task: Task, action: TaskAction) => void;
  onAddProject: () => void;
  workspacePath?: string | null;
  onToast?: (msg: string) => void;
  onOpenDashboard?: () => void;
}

export function Sidebar({
  tasks,
  workspaceName,
  onOpenTask,
  onNewTask,
  onOpenSearch,
  onOpenSettings,
  onNavigate,
  onTaskAction,
  onAddProject,
  workspacePath,
  onToast,
  onOpenDashboard,
}: Props) {
  const [footMenu, setFootMenu] = useState(false);
  const { tr, locale } = useI18n();
  const [showArchived, setShowArchived] = useState(false);
  const [seg, setSeg] = useState<"group" | "project">("project");
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [ctx, setCtx] = useState<{ x: number; y: number; task: Task } | null>(null);

  const sorted = [...tasks].sort((a, b) =>
    sortBy === "updated"
      ? b.updatedAt - a.updatedAt
      : ((b as { createdAt?: number }).createdAt ?? b.updatedAt) -
        ((a as { createdAt?: number }).createdAt ?? a.updatedAt),
  );
  const metas = sorted.map((t) => ({ t, m: getTaskMeta(t.taskId) }));
  const active = metas.filter((x) => !x.m.archived);
  const pinnedRows = active.filter((x) => x.m.pinned);
  const rest = active.filter((x) => !x.m.pinned);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const todayRows = rest.filter((x) => x.t.updatedAt >= +dayStart);
  const earlierRows = rest.filter((x) => x.t.updatedAt < +dayStart);
  const archivedRows = metas.filter((x) => x.m.archived);

  const row = (task: Task) => {
    const meta = getTaskMeta(task.taskId);
    const unread = task.status === "completed" && (meta.lastSeen ?? 0) < task.updatedAt;
    return (
      <div
        className="session-row"
        key={task.taskId}
        onClick={() => onOpenTask(task)}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtx({ x: e.clientX, y: e.clientY, task });
        }}
      >
        <span className="session-title">{task.title}</span>
        {unread && <span className="unread-dot" title={tr("unread")} />}
        <em>{relativeDays(locale, task.updatedAt)}</em>
      </div>
    );
  };

  const ctxItem = (label: string, action: TaskAction) => (
    <button
      className="cap-menu-item"
      key={action}
      onClick={() => {
        if (ctx) onTaskAction(ctx.task, action);
        setCtx(null);
      }}
    >
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="sidebar">
      {/* logo/back/forward live in the shell top overlay (BOt), like the source */}
      <nav className="nav">
        <div className="nav-item" onClick={onNewTask}>
          <IconPlusCircle />
          <span>{tr("newTask")}</span>
          <em>Ctrl+N</em>
        </div>
        <div className="nav-item" onClick={onOpenSearch}>
          <IconSearch />
          <span>{tr("search")}</span>
          <em>Ctrl+K</em>
        </div>
        <div className="nav-item" onClick={() => onNavigate("automations")}>
          <IconAutomation />
          <span>{tr("automations")}</span>
        </div>
        <div className="nav-item" onClick={() => onNavigate("skills")}>
          <IconSkill />
          <span>{tr("skills")}</span>
        </div>
        {onOpenDashboard && (
          <div className="nav-item" onClick={onOpenDashboard}>
            <IconGauge />
            <span>{tr("dashTitle")}</span>
            <em>Ctrl+Shift+D</em>
          </div>
        )}
      </nav>
      <div className="group-row">
        <div className="segment">
          <span className={`seg ${seg === "group" ? "active" : ""}`} onClick={() => setSeg("group")}>
            <IconHash width={12} height={12} /> {tr("groups")}
          </span>
          <span className={`seg ${seg === "project" ? "active" : ""}`} onClick={() => setSeg("project")}>
            <IconFolder width={12} height={12} /> {tr("projects")}
          </span>
          <IconExpand width={12} height={12} className="seg-extra" />
        </div>
        <span className="row-actions">
          <span className="seg-menu-wrap" style={{ position: "relative", display: "inline-flex" }}>
            <span onClick={() => setSortOpen((v) => !v)} title={tr("sortBy")}>
              <IconFilter width={14} height={14} />
            </span>
            {sortOpen && (
              <>
                <div className="cap-menu-backdrop" onClick={() => setSortOpen(false)} />
                <div className="cap-menu" style={{ top: 20, right: 0, width: 160 }}>
                  <button
                    className={`cap-menu-item ${sortBy === "updated" ? "active" : ""}`}
                    onClick={() => {
                      setSortBy("updated");
                      setSortOpen(false);
                    }}
                  >
                    <span>{tr("sortByUpdated")}</span>
                  </button>
                  <button
                    className={`cap-menu-item ${sortBy === "created" ? "active" : ""}`}
                    onClick={() => {
                      setSortBy("created");
                      setSortOpen(false);
                    }}
                  >
                    <span>{tr("sortByCreated")}</span>
                  </button>
                </div>
              </>
            )}
          </span>
          <span onClick={() => setShowArchived((v) => !v)} title={tr("archived")}>
            <IconArchive width={14} height={14} />
          </span>
        </span>
      </div>
      <div className="sidebar-lists">
      <div className="section">
        {seg === "project" && (
          <>
            <div className="section-head">
              <span>
                {tr("projects")} <IconChevronDown width={11} height={11} />
              </span>
              <span className="row-actions">
                <span
                  style={{ position: "relative", display: "inline-flex" }}
                  onClick={() => setDotsOpen((v) => !v)}
                  title={tr("sortBy")}
                >
                  <IconDots width={13} height={13} />
                  {dotsOpen && (
                    <>
                      <div className="cap-menu-backdrop" onClick={() => setDotsOpen(false)} />
                      <div className="cap-menu" style={{ top: 18, right: 0, width: 170 }}>
                        <button
                          className="cap-menu-item"
                          onClick={() => {
                            setDotsOpen(false);
                            setSortBy("updated");
                          }}
                        >
                          <span>{tr("sortByUpdated")}</span>
                        </button>
                        <button
                          className="cap-menu-item"
                          onClick={() => {
                            setDotsOpen(false);
                            setSortBy("created");
                          }}
                        >
                          <span>{tr("sortByCreated")}</span>
                        </button>
                        <button
                          className="cap-menu-item"
                          onClick={() => {
                            setDotsOpen(false);
                            setShowArchived((v) => !v);
                          }}
                        >
                          <span>{showArchived ? tr("ctxUnarchive") : tr("archived")}</span>
                        </button>
                      </div>
                    </>
                  )}
                </span>
                <span onClick={onAddProject} title={tr("menuOpenWorkspace")}>
                  <IconPlus width={13} height={13} />
                </span>
              </span>
            </div>
            <div className="workspace-row">
              <IconFolder width={14} height={14} />
              <span>{workspaceName}</span>
            </div>
          </>
        )}
        {seg === "group" && (
          <div className="section-head">
            <span>
              {tr("tasksSection")} <IconChevronDown width={11} height={11} />
            </span>
          </div>
        )}
        {pinnedRows.length > 0 && (
          <>
            <div className="group-label">📌 {tr("pinned")}</div>
            {pinnedRows.map((x) => row(x.t))}
          </>
        )}
        {todayRows.length > 0 && (
          <>
            <div className="group-label">{tr("today")}</div>
            {todayRows.map((x) => row(x.t))}
          </>
        )}
        {earlierRows.length > 0 && (
          <>
            <div className="group-label">{tr("earlier")}</div>
            {earlierRows.map((x) => row(x.t))}
          </>
        )}
        {active.length === 0 && <div className="empty">{tr("noTasks")}</div>}
        <div className="group-label clickable" onClick={() => setShowArchived((v) => !v)}>
          <IconArchive width={11} height={11} /> {tr("archived")} ({archivedRows.length})
        </div>
        {showArchived && archivedRows.map((x) => row(x.t))}
      </div>
      </div>
      <div className="sidebar-footer">
        <span
          className="footer-user"
          style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          onClick={() => setFootMenu((v) => !v)}
        >
          <span className="avatar">D</span>
          <span className="user">dev</span>
          {footMenu && (
            <>
              <div className="cap-menu-backdrop" onClick={() => setFootMenu(false)} />
              <div className="cap-menu" style={{ bottom: 40, left: 0, width: 220 }}>
                <button
                  className="cap-menu-item"
                  onClick={() => {
                    setFootMenu(false);
                    onToast?.(tr("footerConnectHint"));
                  }}
                >
                  <span>{tr("footerConnect")}</span>
                </button>
                <button
                  className="cap-menu-item"
                  onClick={() => {
                    setFootMenu(false);
                    onOpenSettings();
                  }}
                >
                  <span>{tr("settings")}</span>
                </button>
              </div>
            </>
          )}
        </span>
        <span className="row-actions right">
          <span
            onClick={() => void navigator.clipboard?.writeText(workspacePath ?? "")}
            title={tr("ctxCopyPath")}
            style={{ display: "inline-flex" }}
          >
            <IconCopy width={14} height={14} />
          </span>
          <span onClick={onOpenSettings} style={{ display: "inline-flex" }}>
            <IconGear width={14} height={14} />
          </span>
        </span>
      </div>
      {ctx && (
        <>
          <div className="cap-menu-backdrop" onClick={() => setCtx(null)} />
          <div className="ctx-menu" style={{ left: ctx.x, top: ctx.y }}>
            {ctxItem(getTaskMeta(ctx.task.taskId).pinned ? tr("ctxUnpin") : tr("pin"), "pin")}
            {ctxItem(tr("rename"), "rename")}
            {ctxItem(
              getTaskMeta(ctx.task.taskId).archived ? tr("ctxUnarchive") : tr("archive"),
              "archive",
            )}
            {ctxItem(tr("ctxMarkUnread"), "markUnread")}
            {ctxItem(tr("ctxCopyPath"), "copyPath")}
            <div className="cap-menu-sep" />
            {ctxItem(tr("delete"), "delete")}
          </div>
        </>
      )}
    </aside>
  );
}
