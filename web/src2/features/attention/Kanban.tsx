// Kanban 抽屉（S6，移植自旧 AgentDashboard + orca 纪律升级）：
// 四桶 需要你/工作/完成/闲；ack=markSeen，reveal=openTask。

import { useMemo } from "react";
import { useApp } from "../../core/store";
import { getTaskMeta, markSeen } from "../../core/meta";
import type { Task } from "../../core/types";
import { Button, Dot, IconButton } from "../../ui/primitives";
import { IconGauge } from "./icons-local";
import "./attention.css";

type Bucket = "attention" | "working" | "done" | "idle";

function elapsed(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "刚刚";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 时`;
  return `${Math.floor(h / 24)} 天`;
}

export function Kanban({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useApp((s) => s.tasks);
  const backendKind = useApp((s) => s.backendKind);
  const metaRev = useApp((s) => s.metaRev);
  const openTask = useApp((s) => s.openTask);
  const bumpMeta = useApp((s) => s.bumpMeta);

  void metaRev;

  const grouped = useMemo(() => {
    const g: Record<Bucket, Task[]> = { attention: [], working: [], done: [], idle: [] };
    for (const t of tasks) {
      const meta = getTaskMeta(t.taskId);
      const unread = t.status === "completed" && (meta.lastSeen ?? 0) < t.updatedAt;
      if (t.status === "awaiting-approval" || t.status === "failed" || unread) g.attention.push(t);
      else if (t.status === "running") g.working.push(t);
      else if (t.status === "completed") g.done.push(t);
      else g.idle.push(t);
    }
    for (const b of Object.keys(g) as Bucket[]) g[b].sort((a, z) => z.updatedAt - a.updatedAt);
    return g;
  }, [tasks, metaRev]);

  if (!open) return null;

  const columns: Array<[Bucket, string]> = [
    ["attention", "需要你"],
    ["working", "工作中"],
    ["done", "完成"],
    ["idle", "闲"],
  ];

  return (
    <>
      <div className="kanban-backdrop" onMouseDown={onClose} />
      <div className="kanban" data-slot="kanban" role="dialog" aria-label="任务看板">
        <div className="kanban__head">
          <span className="kanban__title">
            <IconGauge size={15} /> 任务看板
          </span>
          <IconButton label="关闭 (Ctrl+Shift+D)" onClick={onClose}>
            <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </IconButton>
        </div>
        <div className="kanban__board">
          {columns.map(([bucket, label]) => (
            <section className="kanban__col" key={bucket}>
              <header>
                <span className="meta-label">{label}</span>
                <span className="meta-label">{grouped[bucket].length}</span>
              </header>
              <div className="kanban__col-body">
                {grouped[bucket].length === 0 && <p className="kanban__none">空</p>}
                {grouped[bucket].map((t) => {
                  const meta = getTaskMeta(t.taskId);
                  const unread = t.status === "completed" && (meta.lastSeen ?? 0) < t.updatedAt;
                  return (
                    <div
                      className={`kanban__card${bucket === "attention" ? " kanban__card--attn" : ""}`}
                      key={t.taskId}
                      onClick={() => {
                        openTask(t.taskId);
                        onClose();
                      }}
                      title={t.title}
                    >
                      <div className="kanban__row">
                        <Dot
                          kind={
                            t.status === "running"
                              ? "running"
                              : t.status === "awaiting-approval"
                                ? "awaiting"
                                : t.status === "failed"
                                  ? "failed"
                                  : "idle"
                          }
                          pulse={t.status === "running"}
                        />
                        <span className="kanban__title-text" data-unseen={unread ? "true" : undefined}>
                          {t.title}
                        </span>
                        <span className="kanban__time">{elapsed(t.updatedAt)}</span>
                      </div>
                      <div className="kanban__sub">
                        <span>{backendKind === "mock" ? "mock" : backendKind === "websocket" ? "ACP" : backendKind}</span>
                        {t.status === "awaiting-approval" && <span style={{ color: "var(--warn)" }}>待裁决</span>}
                        {t.status === "failed" && <span style={{ color: "var(--danger)" }}>失败</span>}
                        <span style={{ marginLeft: "auto" }} />
                        {(unread || t.status === "awaiting-approval") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markSeen(t.taskId);
                              bumpMeta();
                            }}
                          >
                            已读
                          </Button>
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
    </>
  );
}
