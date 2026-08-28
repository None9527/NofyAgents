// 壳网格（S6/S7 版）：Fleet + 主区(Spine/Dispatch) + 注意力轨 + dock + kanban。

import { useEffect, useState } from "react";
import { useApp } from "../core/store";
import { TopOverlay } from "./TopOverlay";
import { StatusBar } from "./StatusBar";
import { Fleet } from "./Fleet";
import { Dispatch } from "../features/dispatch/Dispatch";
import { Spine } from "../features/spine/Spine";
import { Lineage } from "../features/lineage/Lineage";
import { Contract } from "../features/contract/Contract";
import { AttentionRail } from "../features/attention/AttentionRail";
import { Kanban } from "../features/attention/Kanban";
import { Dock, type DockTab } from "../features/dock/Dock";
import { Palette } from "../features/palette/Palette";
import { Settings } from "../features/settings/Settings";
import { Dot } from "../ui/primitives";
import "./shell.css";

function TaskView({ taskId }: { taskId: string }) {
  const mode = useApp((s) => s.taskViewMode);
  if (mode === "lineage") return <Lineage taskId={taskId} />;
  if (mode === "contract") return <Contract taskId={taskId} />;
  return <Spine taskId={taskId} />;
}

function MainArea() {
  const conn = useApp((s) => s.conn);
  const nav = useApp((s) => s.nav);
  const navIdx = useApp((s) => s.navIdx);
  const current = nav[navIdx];

  if (current?.view === "task") {
    return <TaskView taskId={current.taskId} />;
  }

  return (
    <div className="empty-hero" data-slot="main-placeholder">
      <div className="empty-hero__title">Grok Build</div>
      <div className="empty-hero__sub">
        派发 · 观察 · 裁决 —— 基于 nofy 内核的多任务控制台
      </div>
      {conn === "connected" ? (
        <Dispatch />
      ) : (
        <div className="empty-hero__slot">等待守护进程连接；连接建立后自动加载任务列表</div>
      )}
    </div>
  );
}

export function ShellGrid() {
  const sidebarVisible = useApp((s) => s.sidebarVisible);
  const railVisible = useApp((s) => s.railVisible);
  const conn = useApp((s) => s.conn);
  const tasks = useApp((s) => s.tasks);
  const stale = useApp((s) => s.stale);
  const dockOpen = useApp((s) => s.dockOpen);
  const toggleDock = useApp((s) => s.toggleDock);
  const kanbanOpen = useApp((s) => s.kanbanOpen);
  const toggleKanban = useApp((s) => s.toggleKanban);

  const [tabs, setTabs] = useState<DockTab[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const nextId = useState(() => ({ n: 1 }))[0];

  // 快捷键：Ctrl+Shift+D 看板；Ctrl+` dock；Ctrl+K 命令面板
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        toggleKanban();
      } else if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault();
        toggleDock();
      } else if (e.ctrlKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        useApp.getState().setPaletteOpen(!useApp.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleKanban, toggleDock]);

  const addTab = (kind: DockTab["kind"]) => {
    const id = nextId.n++;
    const tab: DockTab = { id, kind };
    setTabs((t) => [...t, tab]);
    setActiveId(id);
    if (!dockOpen) toggleDock();
  };
  const closeTab = (id: number) => {
    setTabs((t) => {
      const next = t.filter((x) => x.id !== id);
      setActiveId((a) => (a === id ? (next[next.length - 1]?.id ?? null) : a));
      return next;
    });
  };

  // 打开 dock 且无标签时默认一个终端
  useEffect(() => {
    if (dockOpen && tabs.length === 0) addTab("terminal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dockOpen]);

  return (
    <div className="shell" data-slot="shell">
      <TopOverlay />
      <aside className="shell-sidebar" data-hidden={sidebarVisible ? undefined : "true"}>
        <Fleet />
      </aside>
      <main className="shell-main">
        {conn === "degraded" && (
          <div className="degraded-banner" role="status">
            <Dot kind="amber" pulse />
            与守护进程的连接中断
            {stale && tasks.length > 0 ? `，正在展示最后已知的 ${tasks.length} 个任务` : ""}
            ，恢复后自动刷新。
          </div>
        )}
        <MainArea />
        {dockOpen && tabs.length > 0 && (
          <Dock
            tabs={tabs}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeTab}
            onAdd={addTab}
            onHide={toggleDock}
          />
        )}
      </main>
      <section className="shell-rail" data-hidden={railVisible ? undefined : "true"}>
        <AttentionRail onOpenKanban={toggleKanban} />
      </section>
      <StatusBar />
      <Kanban open={kanbanOpen} onClose={toggleKanban} />
      <Palette />
      <Settings />
    </div>
  );
}
