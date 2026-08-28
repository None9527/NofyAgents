// Fleet 侧栏（S2）：工作区舰队列表。
// 行三态（orca §2.4）：idle 透明 / hover / current(selected)；
// 未读=updatedAt>lastSeen→加粗；状态点语义同看板色表。

import { useMemo, useState } from "react";
import { useApp } from "../core/store";
import { getTaskMeta, setTaskMeta } from "../core/meta";
import { getClient } from "../core/store";
import type { Task } from "../core/types";
import { Dot, IconButton } from "../ui/primitives";
import { Menu, type MenuEntry } from "../ui/Menu";

type Segment = "all" | "active" | "pinned";
type SortBy = "updated" | "title";

function dotKind(status: string | null): "idle" | "running" | "awaiting" | "failed" {
  if (status === "running") return "running";
  if (status === "awaiting-approval") return "awaiting";
  if (status === "failed") return "failed";
  return "idle";
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  return `${Math.floor(diff / 86400_000)} 天前`;
}

export function Fleet() {
  const tasks = useApp((s) => s.tasks);
  const conn = useApp((s) => s.conn);
  const activeTaskId = useApp((s) => s.activeTaskId);
  const openTask = useApp((s) => s.openTask);
  const metaRev = useApp((s) => s.metaRev);
  const bumpMeta = useApp((s) => s.bumpMeta);

  const [segment, setSegment] = useState<Segment>("all");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState({ x: 0, y: 0 });
  const [ctx, setCtx] = useState<{ task: Task; x: number; y: number } | null>(null);
  const [deleteArm, setDeleteArm] = useState(false);

  // metaRev 驱动 meta 重读
  void metaRev;

  const rows = useMemo(() => {
    const withMeta = tasks.map((t) => ({ task: t, meta: getTaskMeta(t.taskId) }));
    const visible = withMeta.filter(({ meta }) => !meta.archived);
    const filtered = visible.filter(({ task, meta }) => {
      if (segment === "active")
        return task.status === "running" || task.status === "awaiting-approval";
      if (segment === "pinned") return Boolean(meta.pinned);
      return true;
    });
    filtered.sort((a, b) =>
      sortBy === "title"
        ? a.task.title.localeCompare(b.task.title, "zh-CN")
        : b.task.updatedAt - a.task.updatedAt,
    );
    return filtered;
  }, [tasks, segment, sortBy, metaRev]);

  const pinnedCount = rows.filter(({ meta }) => meta.pinned).length;

  const ctxItems: MenuEntry[] = ctx
    ? [
        {
          label: getTaskMeta(ctx.task.taskId).pinned ? "取消置顶" : "置顶",
          hint: "P",
          onClick: () => {
            setTaskMeta(ctx.task.taskId, { pinned: !getTaskMeta(ctx.task.taskId).pinned });
            bumpMeta();
          },
        },
        {
          label: "归档",
          onClick: () => {
            setTaskMeta(ctx.task.taskId, { archived: true });
            bumpMeta();
          },
        },
        {
          label: "复制会话 ID",
          onClick: () => void navigator.clipboard?.writeText(ctx.task.taskId),
        },
        "sep",
        deleteArm
          ? {
              label: "确认删除？不可恢复",
              danger: true,
              onClick: () => {
                void getClient()
                  .updateTask({ taskId: ctx.task.taskId, deleted: true })
                  .then(() => useApp.getState().refreshFleet());
                setDeleteArm(false);
              },
            }
          : {
              label: "删除…",
              danger: true,
              onClick: () => setDeleteArm(true),
            },
      ]
    : [];

  return (
    <div className="fleet" data-slot="fleet">
      <div className="fleet__head">
        <span className="meta-label">任务</span>
        <span className="meta-label">{rows.length}</span>
      </div>

      <div className="fleet__controls">
        <div className="ui-seg" data-slot="segment">
          {(
            [
              ["all", "全部"],
              ["active", "活动"],
              ["pinned", `置顶${pinnedCount ? ` ${pinnedCount}` : ""}`],
            ] as Array<[Segment, string]>
          ).map(([key, label]) => (
            <button key={key} data-on={segment === key} onClick={() => setSegment(key)}>
              {label}
            </button>
          ))}
        </div>
        <IconButton
          label="排序"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setSortAnchor({ x: r.left, y: r.bottom + 4 });
            setSortOpen((v) => !v);
          }}
        >
          <SortIcon />
        </IconButton>
      </div>

      <div className="fleet__list">
        {conn === "connecting" && tasks.length === 0 && (
          <div className="fleet-row">正在水合会话…</div>
        )}
        {rows.map(({ task, meta }) => {
          const unread = task.updatedAt > (meta.lastSeen ?? 0);
          return (
            <div
              key={task.taskId}
              className="fleet-row"
              data-current={task.taskId === activeTaskId ? "true" : undefined}
              onClick={() => openTask(task.taskId)}
              onContextMenu={(e) => {
                e.preventDefault();
                setDeleteArm(false);
                setCtx({ task, x: e.clientX, y: e.clientY });
              }}
            >
              <Dot kind={dotKind(task.status)} pulse={task.status === "running"} />
              <span
                className="fleet-row__title"
                style={unread ? { fontWeight: 600, color: "var(--fg)" } : undefined}
              >
                {meta.pinned ? "📌 " : ""}
                {task.title}
              </span>
              <span className="fleet-row__time">{relTime(task.updatedAt)}</span>
            </div>
          );
        })}
        {conn !== "connecting" && rows.length === 0 && (
          <div className="fleet-row">
            {segment === "pinned" ? "暂无置顶任务" : "暂无任务 · S4 工作单将在此派发"}
          </div>
        )}
      </div>

      <Menu
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        anchor={sortAnchor}
        head="排序"
        items={[
          {
            label: "最近更新",
            hint: sortBy === "updated" ? "✓" : undefined,
            onClick: () => setSortBy("updated"),
          },
          {
            label: "标题",
            hint: sortBy === "title" ? "✓" : undefined,
            onClick: () => setSortBy("title"),
          },
        ]}
      />
      <Menu
        open={ctx != null}
        onClose={() => {
          setCtx(null);
          setDeleteArm(false);
        }}
        anchor={ctx ? { x: ctx.x, y: ctx.y } : { x: 0, y: 0 }}
        head={ctx?.task.title.slice(0, 24)}
        items={ctxItems}
      />
    </div>
  );
}

function SortIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 3v10M5 13l-2.5-2.5M5 13l2.5-2.5M11 13V3M11 3l-2.5 2.5M11 3l2.5 2.5" />
    </svg>
  );
}
