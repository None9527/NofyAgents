// 注意力轨（S6）—— 右轨常驻注意力总线。
// 分级：L3 失败 / L2 待裁决（approval·elicitation）/ L1 运行中 / L0 未读完成。
// 一键动作：reveal(打开) / 允许·拒绝 / 标为已读。SLA=滞留时长。

import { useEffect, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { bumpApproval, getTaskMeta, markSeen } from "../../core/meta";
import type { LiveState, Task } from "../../core/types";
import { Badge, Button, Dot } from "../../ui/primitives";
import { IconGauge } from "./icons-local";
import "./attention.css";

function elapsed(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "刚刚";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时`;
  return `${Math.floor(h / 24)} 天`;
}

interface Item {
  level: "L3" | "L2" | "L1" | "L0";
  task: Task;
  detail?: string;
}

export function AttentionRail({ onOpenKanban }: { onOpenKanban: () => void }) {
  const tasks = useApp((s) => s.tasks);
  const metaRev = useApp((s) => s.metaRev);
  const openTask = useApp((s) => s.openTask);
  const bumpMeta = useApp((s) => s.bumpMeta);
  const refreshFleet = useApp((s) => s.refreshFleet);
  const [pendings, setPendings] = useState<Record<string, LiveState | null>>({});

  const client = (() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  })();

  // 待裁决任务的 pending 详情轮询
  useEffect(() => {
    if (!client) return;
    const awaiting = tasks.filter((t) => t.status === "awaiting-approval");
    if (awaiting.length === 0) return;
    const tick = async () => {
      const next: Record<string, LiveState | null> = {};
      for (const t of awaiting) {
        next[t.taskId] = await client.getLive(t.taskId).catch(() => null);
      }
      setPendings(next);
    };
    void tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, [tasks, client]);

  void metaRev;

  const items: Item[] = [];
  for (const t of tasks) {
    const meta = getTaskMeta(t.taskId);
    const unread = t.status === "completed" && (meta.lastSeen ?? 0) < t.updatedAt;
    if (t.status === "failed") items.push({ level: "L3", task: t });
    else if (t.status === "awaiting-approval")
      items.push({
        level: "L2",
        task: t,
        detail: pendings[t.taskId]?.pending
          ? `${pendings[t.taskId]?.pending?.name} 等待裁决`
          : pendings[t.taskId]?.elicitation
            ? "问卷等待回答"
            : "等待裁决",
      });
    else if (t.status === "running") items.push({ level: "L1", task: t });
    else if (unread) items.push({ level: "L0", task: t });
  }
  const order = { L3: 0, L2: 1, L1: 2, L0: 3 } as const;
  items.sort((a, b) => order[a.level] - order[b.level] || b.task.updatedAt - a.task.updatedAt);

  const groups: Array<["L3" | "L2" | "L1" | "L0", string]> = [
    ["L3", "失败"],
    ["L2", "待裁决"],
    ["L1", "运行中"],
    ["L0", "未读"],
  ];

  return (
    <div className="rail" data-slot="attention-rail">
      <div className="rail__head">
        <span className="meta-label">注意力 · {items.length}</span>
        <Button size="sm" variant="ghost" onClick={onOpenKanban}>
          <IconGauge size={13} /> 看板
        </Button>
      </div>
      {items.length === 0 && <div className="rail__empty">所有任务安静 —— 无需裁决。</div>}
      {groups.map(([lv, label]) => {
        const list = items.filter((i) => i.level === lv);
        if (list.length === 0) return null;
        return (
          <div className="rail__group" key={lv}>
            <span className="rail__label meta-label">
              {lv} {label} · {list.length}
            </span>
            {list.map((item) => (
              <div className={`attn-card attn-card--${item.level}`} key={item.task.taskId}>
                <div className="attn-card__row">
                  <Dot
                    kind={
                      item.task.status === "running"
                        ? "running"
                        : item.task.status === "awaiting-approval"
                          ? "awaiting"
                          : item.task.status === "failed"
                            ? "failed"
                            : "idle"
                    }
                    pulse={item.task.status === "running"}
                  />
                  <span className="attn-card__title">{item.task.title}</span>
                  <span className="kanban__time">{elapsed(item.task.updatedAt)}</span>
                </div>
                {item.detail && <div className="attn-card__sub">{item.detail}</div>}
                <div className="attn-card__actions">
                  <Button size="sm" variant="secondary" onClick={() => openTask(item.task.taskId)}>
                    打开
                  </Button>
                  {item.level === "L2" && client && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          bumpApproval(true);
                          void client.approveTool(item.task.taskId, true).then(refreshFleet);
                        }}
                      >
                        允许
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          bumpApproval(false);
                          void client.approveTool(item.task.taskId, false).then(refreshFleet);
                        }}
                      >
                        拒绝
                      </Button>
                    </>
                  )}
                  {item.level === "L0" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        markSeen(item.task.taskId);
                        bumpMeta();
                      }}
                    >
                      已读
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ marginTop: "auto" }}>
        <Badge tone="accent">SLA：滞留时长即风险</Badge>
      </div>
    </div>
  );
}
