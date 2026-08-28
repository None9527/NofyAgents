// 命令面板（S10）：质量阶梯模糊匹配（orca 纪律）——
// 0 精确 / 1 前缀 / 2 子串 / 3 子序列；分区=动作/导航/任务。
// 键盘：↑↓ 选择（data-selected + inset ring），Enter 执行，Esc 关闭。

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../core/store";
import { Kbd } from "../../ui/primitives";
import "./palette.css";

interface Entry {
  kind: "动作" | "导航" | "任务";
  label: string;
  hint?: string;
  run: () => void;
}

/** 质量阶梯：返回 0-3，-1=不匹配 */
function score(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 4;
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 2;
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i === q.length) return 3;
  }
  return -1;
}

export function Palette() {
  const open = useApp((s) => s.paletteOpen);
  const setOpen = useApp((s) => s.setPaletteOpen);
  const tasks = useApp((s) => s.tasks);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const s = useApp.getState();
    const acts: Entry[] = [
      { kind: "动作", label: "切换主题", hint: "暗/亮", run: s.toggleTheme },
      { kind: "动作", label: "刷新任务", run: s.refreshFleet },
      { kind: "动作", label: "打开设置", run: () => s.setSettingsOpen(true) },
      { kind: "动作", label: "任务看板", hint: "Ctrl+Shift+D", run: s.toggleKanban },
      { kind: "动作", label: "dock 终端/审查", hint: "Ctrl+`", run: s.toggleDock },
      { kind: "导航", label: "回到首页", hint: "Alt+←", run: () => s.navigate({ view: "home" }) },
      { kind: "导航", label: s.railVisible ? "收起注意力轨" : "展开注意力轨", run: s.toggleRail },
      { kind: "导航", label: s.sidebarVisible ? "隐藏侧栏" : "显示侧栏", run: s.toggleSidebar },
    ];
    const taskEntries: Entry[] = tasks.map((t) => ({
      kind: "任务" as const,
      label: t.title,
      hint: t.status ?? undefined,
      run: () => s.openTask(t.taskId),
    }));
    return [...acts, ...taskEntries];
  }, [tasks, open]);

  const results = useMemo(() => {
    return entries
      .map((e) => ({ e, sc: score(query, e.label) }))
      .filter((r) => r.sc >= 0)
      .sort((a, b) => a.sc - b.sc || a.e.label.localeCompare(b.e.label, "zh-CN"))
      .slice(0, 12)
      .map((r) => r.e);
  }, [entries, query]);

  useEffect(() => setSel(0), [query]);

  if (!open) return null;

  const pick = (e: Entry) => {
    setOpen(false);
    e.run();
  };

  return (
    <>
      <div className="palette-backdrop" onMouseDown={() => setOpen(false)} />
      <div className="palette" data-slot="palette" role="dialog" aria-label="命令面板">
        <input
          ref={inputRef}
          className="palette__input"
          placeholder="输入命令或任务名…（↑↓ 选择，Enter 执行）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((v) => Math.min(results.length - 1, v + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((v) => Math.max(0, v - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const e0 = results[sel];
              if (e0) pick(e0);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <div className="palette__list">
          {results.length === 0 && <div className="palette__empty">无匹配 —— 质量阶梯：精确→前缀→子串→子序列</div>}
          {results.map((e, i) => (
            <button
              key={`${e.kind}-${e.label}-${i}`}
              className="palette__item"
              data-selected={i === sel ? "true" : undefined}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(e)}
            >
              <span className="palette__kind">{e.kind}</span>
              <span className="palette__label">{e.label}</span>
              {e.hint && <span className="palette__hint">{e.hint}</span>}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "6px 12px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--fg-subtlest)" }}>随时呼出</span>
        </div>
      </div>
    </>
  );
}
