// Dispatch 工作单（S4）：首页 composer。
// 移植旧 Composer 的 / @ # 解析语义；芯片实时成形（model/mode/effort/autonomy/budget）。
// 派发=assign 动词的第一现场：提交即 createTask 并导航至任务脊柱。

import { useEffect, useRef, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { setTaskMeta } from "../../core/meta";
import type { Provider } from "../../core/types";
import { Menu, type MenuEntry } from "../../ui/Menu";
import { IconChevronDown } from "../../ui/icons";
import "./dispatch.css";

const EFFORTS = ["off", "low", "medium", "high", "max"] as const;
const AUTONOMY = [
  ["L1", "严格审批"],
  ["L2", "监督"],
  ["L3", "自主"],
  ["L4", "全信"],
] as const;
const BUDGETS = ["不限", "100k", "500k", "1M"] as const;

type Anchor = { x: number; y: number };

function anchorOf(e: React.MouseEvent<HTMLElement>): Anchor {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left, y: r.bottom + 6 };
}

export function Dispatch() {
  const conn = useApp((s) => s.conn);
  const workspace = useApp((s) => s.workspace);
  const tasks = useApp((s) => s.tasks);
  const openTask = useApp((s) => s.openTask);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [mode, setMode] = useState<"build" | "plan">("build");
  const [effort, setEffort] = useState<(typeof EFFORTS)[number]>("high");
  const defaultAutonomy = useApp((s) => s.defaultAutonomy);
  const defaultBudget = useApp((s) => s.defaultBudget);
  const [autonomy, setAutonomy] = useState<"L1" | "L2" | "L3" | "L4">(defaultAutonomy);
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]>(
    (BUDGETS as readonly string[]).includes(defaultBudget)
      ? (defaultBudget as (typeof BUDGETS)[number])
      : "不限",
  );

  const [providers, setProviders] = useState<Provider[]>([]);
  const [commands, setCommands] = useState<Array<{ name: string; description: string }>>([]);
  const [skills, setSkills] = useState<Array<{ name: string; description?: string }>>([]);
  const [files, setFiles] = useState<Array<{ name: string; isDir: boolean }>>([]);

  const [menu, setMenu] = useState<null | "model" | "effort" | "autonomy" | "budget">(null);
  const [anchor, setAnchor] = useState<Anchor>({ x: 0, y: 0 });

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const client = (() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  })();
  const desktop = Boolean(client?.isDesktop);

  // 水合芯片数据源
  useEffect(() => {
    if (!client) return;
    void client.getProviders().then(setProviders).catch(() => {});
    void client.getCommands().then(setCommands).catch(() => {});
    void client.getSkills(workspace).then(setSkills).catch(() => {});
    if (client.isDesktop) void client.listFiles(workspace).then(setFiles);
  }, [client, workspace]);

  // 自动增高
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [draft]);

  // ---- / @ # 弹层（移植旧解析正则） ----
  const slashToken = /^\/(\S*)$/.exec(draft);
  const atToken = /@([^\s@]*)$/.exec(draft);
  const hashToken = /#([^\s#]*)$/.exec(draft);

  const slashItems = slashToken
    ? commands.filter((c) => c.name.startsWith(slashToken[1])).slice(0, 8)
    : [];
  const atItems = atToken
    ? desktop
      ? files.filter((f) => f.name.startsWith(atToken[1])).slice(0, 8)
      : []
    : [];
  const hashItems = hashToken
    ? [
        ...tasks.map((t) => ({ kind: "session" as const, id: t.taskId, label: t.title })),
        ...skills.map((s) => ({ kind: "skill" as const, id: s.name, label: s.name })),
      ]
        .filter((m) => m.label.toLowerCase().includes(hashToken[1].toLowerCase()))
        .slice(0, 8)
    : [];

  const popup: { head: string; rows: Array<{ key: string; icon: string; label: string; desc?: string; pick: () => void }> } | null =
    slashToken
      ? {
          head: "命令",
          rows: slashItems.map((c) => ({
            key: c.name,
            icon: "/",
            label: c.name,
            desc: c.description,
            pick: () => setDraft(`/${c.name} `),
          })),
        }
      : atToken
        ? {
            head: desktop ? "文件" : "文件（需桌面版）",
            rows: atItems.map((f) => ({
              key: f.name,
              icon: f.isDir ? "🗀" : "·",
              label: f.name,
              pick: () => setDraft((d) => d.replace(/@([^\s@]*)$/, `@${f.name} `)),
            })),
          }
        : hashToken
          ? {
              head: "提及",
              rows: hashItems.map((m) => ({
                key: `${m.kind}-${m.id}`,
                icon: m.kind === "session" ? "#" : "⚡",
                label: m.label,
                pick: () => setDraft((d) => d.replace(/#([^\s#]*)$/, `#${m.label} `)),
              })),
            }
          : null;

  const showPopup = Boolean(popup && (popup.rows.length > 0 || atToken || hashToken || slashToken));

  // ---- 派发 ----
  const canSend = Boolean(draft.trim()) && conn === "connected" && !busy && Boolean(client);

  const submit = async () => {
    if (!canSend || !client) return;
    setBusy(true);
    const extras: string[] = [];
    if (mode !== "build") extras.push(`mode=${mode}`);
    if (autonomy !== "L2") extras.push(`autonomy=${autonomy}`);
    if (budget !== "不限") extras.push(`budget=${budget}`);
    if (effort !== "high") extras.push(`effort=${effort}`);
    const preamble = extras.length ? `[工作单] ${extras.join(" ")}\n\n` : "";
    const prompt = preamble + draft;
    const title = draft.trim().split("\n")[0].slice(0, 40) || "新任务";
    try {
      const task = await client.createTask({
        workspacePath: workspace,
        title,
        prompt,
        model,
        mode,
        // L1 严格审批 → 工具调用前先裁决
        confirm: autonomy === "L1",
      });
      // 契约随任务落盘（S9）：每任务覆盖
      setTaskMeta(task.taskId, { autonomy, budget });
      if (effort !== "high") void client.setEffort(task.taskId, effort).catch(() => {});
      setDraft("");
      openTask(task.taskId);
      useApp.getState().refreshFleet();
    } catch (error) {
      console.warn("[dispatch] createTask failed", error);
    } finally {
      setBusy(false);
    }
  };

  const openMenu = (kind: NonNullable<typeof menu>) => (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchorOf(e));
    setMenu((m) => (m === kind ? null : kind));
  };

  const modelLabel = model ?? "默认模型";
  const menuItems: Record<Exclude<typeof menu, null>, MenuEntry[]> = {
    model: providers.length
      ? providers.flatMap((p): MenuEntry[] => [
          ...p.models.slice(0, 6).map((m) => ({
            label: `${p.name} / ${m}`,
            hint: model === `${p.id}/${m}` ? "✓" : undefined,
            onClick: () => setModel(`${p.id}/${m}`),
          })),
        ])
      : [{ label: "模型列表将于首次派发后可用", disabled: true }],
    effort: EFFORTS.map((lv) => ({
      label: lv,
      hint: effort === lv ? "✓" : undefined,
      onClick: () => setEffort(lv),
    })),
    autonomy: AUTONOMY.map(([lv, name]) => ({
      label: `${lv} ${name}`,
      hint: autonomy === lv ? "✓" : undefined,
      onClick: () => setAutonomy(lv),
    })),
    budget: BUDGETS.map((b) => ({
      label: b === "不限" ? "不限预算" : `≤ ${b} tokens`,
      hint: budget === b ? "✓" : undefined,
      onClick: () => setBudget(b),
    })),
  };

  return (
    <div className="dispatch" data-slot="dispatch">
      {showPopup && popup && (
        <div className="dispatch-popup" data-slot="dispatch-popup">
          <div className="ui-menu__head">{popup.head}</div>
          {popup.rows.length === 0 && (
            <div className="dispatch-popup__empty">
              {atToken && !desktop ? "@ 文件引用需桌面版（Electron）能力" : "无匹配项"}
            </div>
          )}
          {popup.rows.map((row) => (
            <button key={row.key} className="ui-menu__item" onClick={row.pick}>
              <span style={{ width: 14, textAlign: "center" }}>{row.icon}</span>
              <span>{row.label}</span>
              {row.desc && <span className="ui-menu__hint">{row.desc}</span>}
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={areaRef}
        className="dispatch__area"
        rows={1}
        placeholder={
          conn === "connected"
            ? "派发工作单…  / 命令  @ 文件  # 提及"
            : "守护进程未连接 —— 恢复后可派发"
        }
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
      />

      <div className="dispatch__chips">
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void file.text().then((content) => {
                setDraft((d) => `${d}${d ? "\n" : ""}<file name="${file.name}">\n${content.slice(0, 20000)}\n</file>\n`);
              });
            }
            e.target.value = "";
          }}
        />
        <button className="chip" title="附加文件" onClick={() => fileRef.current?.click()}>
          + 附件
        </button>
        <button className="chip" data-set={model != null} onClick={openMenu("model")}>
          {modelLabel} <IconChevronDown size={11} />
        </button>
        <button
          className="chip"
          data-set={mode !== "build"}
          title="plan 模式只规划不执行"
          onClick={() => setMode((m) => (m === "build" ? "plan" : "build"))}
        >
          {mode === "build" ? "构建" : "规划"}
        </button>
        <button className="chip" data-set={effort !== "high"} onClick={openMenu("effort")}>
          思考 {effort} <IconChevronDown size={11} />
        </button>
        <button className="chip" data-set={autonomy !== "L2"} onClick={openMenu("autonomy")}>
          {autonomy} <IconChevronDown size={11} />
        </button>
        <button className="chip" data-set={budget !== "不限"} onClick={openMenu("budget")}>
          {budget === "不限" ? "预算∞" : `≤${budget}`} <IconChevronDown size={11} />
        </button>

        <button
          className="chip--send"
          data-slot="send"
          disabled={!canSend}
          title="派发 (Enter)"
          onClick={() => void submit()}
        >
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <path d="M8 13V3M4 7l4-4 4 4" />
          </svg>
        </button>
      </div>

      <Menu open={menu != null} onClose={() => setMenu(null)} anchor={anchor} items={menu ? menuItems[menu] : []} />
    </div>
  );
}
