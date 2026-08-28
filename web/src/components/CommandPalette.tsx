// Ctrl+P quick pick, forked from the ZCode command palette: titled 「命令面板」,
// sections 建议/推荐/对话/导航/面板/配置 with the source command table
// (newTask, openWorkspace, openFile, settings, previous/nextConversation,
// find, goBack/Forward, toggleTerminal/Preview/Sidebar/SidePane,
// addTerminal/Browser/ReviewTab, mcpServers, switchTheme…).
import { useEffect, useMemo, useRef, useState } from "react";
import type { Task } from "../lib/rpc";
import type { MainView } from "./Sidebar";
import { useI18n } from "../lib/i18n";

interface Item {
  id: string;
  section: string;
  label: string;
  hint?: string;
  run: () => void;
}

interface Props {
  tasks: Task[];
  currentTaskId?: string | null;
  onNavigate: (view: MainView) => void;
  onOpenTask: (task: Task) => void;
  onNewTask: () => void;
  onToggleTheme: () => void;
  onSetTheme: (theme: "dark" | "light") => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleSidePane: () => void;
  onAddDockTab: (kind: "terminal" | "browser" | "review") => void;
  onOpenSearch: () => void;
  onClose: () => void;
}

export function CommandPalette(props: Props) {
  const { tasks, onClose } = props;
  const { tr } = useI18n();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      { id: "new", section: tr("qpSuggested"), label: tr("newTask"), hint: "Ctrl+N", run: props.onNewTask },
      { id: "find", section: tr("qpSuggested"), label: tr("qpFind"), hint: "Ctrl+K", run: props.onOpenSearch },
      { id: "settings", section: tr("qpSuggested"), label: tr("settings"), run: () => props.onNavigate("settings") },
      { id: "theme-dark", section: tr("qpRecommended"), label: tr("qpThemeDark"), run: () => props.onSetTheme("dark") },
      { id: "theme-light", section: tr("qpRecommended"), label: tr("qpThemeLight"), run: () => props.onSetTheme("light") },
      { id: "skills", section: tr("qpRecommended"), label: tr("skills"), run: () => props.onNavigate("skills") },
      { id: "autos", section: tr("qpRecommended"), label: tr("automations"), run: () => props.onNavigate("automations") },
      { id: "prev", section: tr("qpChat"), label: tr("qpPrevTask"), run: () => shiftTask(-1) },
      { id: "next", section: tr("qpChat"), label: tr("qpNextTask"), run: () => shiftTask(1) },
      { id: "back", section: tr("qpNavigation"), label: tr("qpGoBack"), run: () => props.onNavigate("home") },
      { id: "sidebar", section: tr("qpPanels"), label: tr("toggleSidebar"), hint: "Ctrl+B", run: props.onToggleSidebar },
      { id: "terminal", section: tr("qpPanels"), label: tr("qpToggleTerminal"), hint: "Ctrl+J", run: props.onToggleTerminal },
      { id: "add-term", section: tr("qpPanels"), label: tr("qpAddTerminalTab"), run: () => props.onAddDockTab("terminal") },
      { id: "add-browser", section: tr("qpPanels"), label: tr("qpAddBrowserTab"), run: () => props.onAddDockTab("browser") },
      { id: "add-review", section: tr("qpPanels"), label: tr("qpAddReviewTab"), run: () => props.onAddDockTab("review") },
      { id: "sidepane", section: tr("qpPanels"), label: tr("qpToggleSidePane"), run: props.onToggleSidePane },
      { id: "mcp", section: tr("qpConfigure"), label: tr("qpMcp"), run: () => props.onNavigate("settings") },
      ...tasks.map((t) => ({
        id: `task-${t.taskId}`,
        section: tr("qpChat"),
        label: t.title,
        hint: t.status ?? "",
        run: () => props.onOpenTask(t),
      })),
    ];
    function shiftTask(dir: number) {
      if (tasks.length === 0) return;
      const idx = Math.max(
        0,
        tasks.findIndex((t) => t.taskId === props.currentTaskId),
      );
      props.onOpenTask(tasks[(idx + dir + tasks.length) % tasks.length]);
    }
    const q = query.trim().toLowerCase();
    if (!q) return base.slice(0, 14);
    return base.filter((i) => i.label.toLowerCase().includes(q));
  }, [query, tasks, props, tr]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => setCursor(0), [query]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") setCursor((c) => Math.min(items.length - 1, c + 1));
    else if (e.key === "ArrowUp") setCursor((c) => Math.max(0, c - 1));
    else if (e.key === "Enter" && items[cursor]) {
      items[cursor].run();
      onClose();
    }
  };

  // group preserving section order
  const sections = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Item[]>();
    for (const item of items) {
      if (!map.has(item.section)) {
        map.set(item.section, []);
        order.push(item.section);
      }
      map.get(item.section)!.push(item);
    }
    return order.map((s) => [s, map.get(s)!] as const);
  }, [items]);

  let flat = -1;
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="palette-card" onClick={(e) => e.stopPropagation()}>
        <div className="palette-title">{tr("paletteTitle")}</div>
        <div className="overlay-input-row">
          <input
            ref={inputRef}
            className="overlay-input"
            placeholder={tr("paletteInput")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
          />
        </div>
        <div className="palette-list">
          {items.length === 0 && <div className="empty">{tr("noResults")}</div>}
          {sections.map(([section, list]) => (
            <div key={section}>
              <div className="palette-section">{section}</div>
              {list.map((item) => {
                flat += 1;
                const i = flat;
                return (
                  <div
                    key={item.id}
                    className={`menu-item ${i === cursor ? "active" : ""}`}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => {
                      item.run();
                      onClose();
                    }}
                  >
                    <span>{item.label}</span>
                    <em>{item.hint}</em>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
