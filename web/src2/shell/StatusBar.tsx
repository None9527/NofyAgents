// 状态栏（24px，orca §12 度量）：左=连接健康+舰队脉搏；右=主题开关+施工徽标。
// D3：降级显示琥珀+“最后已知 N 任务”，不隐藏、不尖叫。

import { useState } from "react";
import { useApp } from "../core/store";
import { Dot, IconButton } from "../ui/primitives";
import { IconMoon, IconSun, IconTerminal } from "../ui/icons";
import type { ConnState } from "../core/store";

function connText(conn: ConnState, stale: boolean, taskCount: number): string {
  switch (conn) {
    case "connected":
      return "已连接守护进程";
    case "connecting":
      return "正在连接守护进程…";
    case "degraded":
      return stale && taskCount > 0
        ? `连接中断 · 最后已知 ${taskCount} 个任务 · 自动重连中`
        : "连接中断 · 自动重连中";
  }
}

function DockToggle() {
  const dockOpen = useApp((s) => s.dockOpen);
  const toggleDock = useApp((s) => s.toggleDock);
  return (
    <IconButton label="dock：终端/浏览器/审查 (Ctrl+`)" active={dockOpen} onClick={toggleDock}>
      <IconTerminal size={14} />
    </IconButton>
  );
}

/** 工作区项：显示末段路径，点击复制全路径（诚实动作）。 */
function WorkspaceItem() {
  const workspace = useApp((s) => s.workspace);
  const [copied, setCopied] = useState(false);
  const name = workspace === "/" ? "/" : (workspace.split("/").filter(Boolean).pop() ?? "/");
  return (
    <>
      <span className="shell-statusbar__sep" />
      <button
        className="statusbar-btn"
        title={workspace}
        onClick={() => {
          void navigator.clipboard?.writeText(workspace);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "已复制路径" : name}
      </button>
    </>
  );
}

export function StatusBar() {
  const conn = useApp((s) => s.conn);
  const backendKind = useApp((s) => s.backendKind);
  const tasks = useApp((s) => s.tasks);
  const stale = useApp((s) => s.stale);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);

  const running = tasks.filter((t) => t.status === "running").length;
  const awaiting = tasks.filter((t) => t.status === "awaiting-approval").length;
  const dotKind = conn === "connected" ? "running" : conn === "degraded" ? "amber" : "amber";

  return (
    <footer className="shell-statusbar" data-slot="statusbar">
      <div className="shell-statusbar__group">
        <span className="shell-statusbar__item">
          <Dot kind={dotKind} pulse={conn !== "connected"} />
          {connText(conn, stale, tasks.length)}
        </span>
        <span className="shell-statusbar__sep" />
        <span className="shell-statusbar__item">
          {tasks.length} 任务{running > 0 ? ` · ${running} 运行中` : ""}
          {awaiting > 0 ? ` · ${awaiting} 待裁决` : ""}
        </span>
        <span className="shell-statusbar__sep" />
        <span className="shell-statusbar__item">
          传输: {backendKind === "mock" ? "mock" : backendKind === "websocket" ? "ACP" : backendKind || "—"}
        </span>
        <WorkspaceItem />
      </div>
      <div className="shell-statusbar__group">
        <DockToggle />
        <span className="shell-statusbar__item" style={{ color: "var(--amber)" }}>
          v2 施工区 · S6–S7
        </span>
        <IconButton
          label={theme === "dark" ? "切换亮色主题" : "切换暗色主题"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />}
        </IconButton>
      </div>
    </footer>
  );
}
