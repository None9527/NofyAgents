// Agent Dashboard — kanban companion drawer adapted from Orca
// (ref-ui/orca AgentKanbanBoard): columns Needs You / Working / Done / Idle,
// cards carry dot state, unseen-bold title, elapsed time, host badge;
// ack = markSeen, reveal = openTask. Data comes from the existing task list +
// taskmeta; no backend additions.
import { useMemo } from "react";
import type { Task } from "../lib/rpc";
import { getTaskMeta, markSeen } from "../lib/taskmeta";
import { useI18n } from "../lib/i18n";
import { IconClose, IconGauge } from "../icons";

type Bucket = "attention" | "working" | "done" | "idle";

interface Props {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  backendKind: string;
  onOpenTask: (task: Task) => void;
  onRefresh: () => void;
}

const DOT: Record<string, string> = {
  running: "#4f9e6f",
  "awaiting-approval": "#d19a66",
  completed: "#4f9e6f",
  idle: "#6f6f6f",
};

function elapsed(now: number, ts: number, tr: (k: string, v?: Record<string, number>) => string): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return tr("dashJustNow");
  const m = Math.floor(s / 60);
  if (m < 60) return tr("dashMinutes", { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return tr("dashHours", { count: h });
  return tr("dashDays", { count: Math.floor(h / 24) });
}

export function AgentDashboard({ open, onClose, tasks, backendKind, onOpenTask, onRefresh }: Props) {
  const { tr } = useI18n();
  const now = Date.now();

  const grouped = useMemo(() => {
    const g: Record<Bucket, Task[]> = { attention: [], working: [], done: [], idle: [] };
    for (const t of tasks) {
      const meta = getTaskMeta(t.taskId);
      const unread = t.status === "completed" && (meta.lastSeen ?? 0) < t.updatedAt;
      if (t.status === "awaiting-approval" || unread) g.attention.push(t);
      else if (t.status === "running") g.working.push(t);
      else if (t.status === "completed") g.done.push(t);
      else g.idle.push(t);
    }
    for (const b of Object.keys(g) as Bucket[]) g[b].sort((a, z) => z.updatedAt - a.updatedAt);
    return g;
  }, [tasks]);

  if (!open) return null;

  const columns: Array<[Bucket, string]> = [
    ["attention", tr("dashNeedsYou")],
    ["working", tr("dashWorking")],
    ["done", tr("dashDone")],
    ["idle", tr("dashIdle")],
  ];

  return (
    <div className="dash-drawer">
      <div className="dash-head">
        <span className="dash-title">
          <IconGauge width={15} height={15} /> {tr("dashTitle")}
        </span>
        <span className="msg-act" onClick={onClose}>
          <IconClose width={13} height={13} />
        </span>
      </div>
      <div className="dash-board">
        {columns.map(([bucket, label]) => (
          <section className="dash-col" key={bucket}>
            <header>
              <span className="dash-col-label">{label}</span>
              <span className="dash-col-count">{grouped[bucket].length}</span>
            </header>
            <div className="dash-col-body">
              {grouped[bucket].length === 0 && <p className="dash-none">{tr("dashNone")}</p>}
              {grouped[bucket].map((t) => {
                const meta = getTaskMeta(t.taskId);
                const unread = t.status === "completed" && (meta.lastSeen ?? 0) < t.updatedAt;
                return (
                  <div
                    className={`dash-card ${bucket === "attention" ? "attn" : ""}`}
                    key={t.taskId}
                    onClick={() => onOpenTask(t)}
                    title={t.title}
                  >
                    <div className="dash-card-row">
                      <span className="dash-dot" style={{ background: DOT[t.status ?? "idle"] }} />
                      <span className={`dash-card-title ${unread ? "unseen" : ""}`}>{t.title}</span>
                      <span className="dash-time">{elapsed(now, t.updatedAt, tr)}</span>
                    </div>
                    <div className="dash-card-row sub">
                      <span className="dash-host">{backendKind}</span>
                      {t.status === "awaiting-approval" && (
                        <span className="dash-question">{tr("awaiting")}</span>
                      )}
                      <span className="spacer" />
                      {(unread || t.status === "awaiting-approval") && (
                        <button
                          className="dash-ack"
                          onClick={(e) => {
                            e.stopPropagation();
                            markSeen(t.taskId);
                            onRefresh();
                          }}
                        >
                          {tr("dashAck")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
