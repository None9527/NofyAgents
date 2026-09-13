/**
 * AuxPane —— 对话卡片内部右侧的辅助 pane（活壳 3.11.2 实测：在卡片内，不在 shell 层）。
 *
 * 标签模型照 ZCode SidePanel（uiux-reference.md §1；度量 zcode-live-metrics.md §1.8）：
 * - 头行 48 高、5% surface 底：[chevrons-down 28 触发钮][可横滚芯片组：图标+名+×][+ 28 新增标签]；
 *   触发钮开「搜索标签页」弹层（搜索框 + 打开的 / 最近关闭的两段，288 宽 br12 popover 底）。
 * - 零标签时头行整行不画，画首屏：居中标题副题 + 三列卡片网格（卡 88 高 br12 surface 底）。
 * - 开合标签的四个入口：首屏卡片、+ 菜单、弹层行、芯片/行的 ×。开合与选中是**窗口局部态**
 *   （App 持有，⌘K 面板命令要能切它）；「最近关闭」是面板局部态，不进 store。
 * - 每个标签背后是一个视图；roster / 文件 / 审查已落地，子智能体等夹具录到后按同一模型加。
 */
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { FilePane } from "../aux/FilePane.tsx";
import { ReviewPane } from "../aux/ReviewPane.tsx";
import { formatCompactRelative } from "./palette.ts";
import {
  IconChevronsDown,
  IconBot,
  IconFile,
  IconFileDiff,
  IconGlobe,
  IconMessagePlus,
  IconPlus,
  IconSearch,
  IconX,
} from "../../ui/icons.tsx";
import type { IconProps } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { Chip, Dot } from "../../ui/primitives.tsx";
import type { AgentRow } from "../conversation/agentModel.ts";
import type { GitStatus } from "../../ui/readers.ts";

/**
 * 面板标签只有「文件 / 审查」两种。
 *
 * 为什么没有「会话活动 / roster」标签（2026-09-11 用户裁定）：子智能体与会话活动的显示
 * 属于**子智能体那一套图标体系**（活壳的 agents 模态 / 会话内联块，见 §1.9 的抓取结论），
 * 不是侧边面板的标签；产品里不存在「会话活动」这个设定。roster 读路径保留——
 * 侧栏的「未加载会话」列表与 session/load 还靠它（sidebarModel.ts）。
 */
export type AuxTab = "files" | "review" | "agents";

type IconCmp = (p: IconProps) => ReactElement;

/** 三个真标签的产品文案与图标（审查=活壳 file-diff 图标位，终端/浏览器见首屏灰卡）。 */
const TAB_META: Record<AuxTab, { label: string; icon: IconCmp; title: string }> = {
  files: {
    label: "文件",
    icon: IconFile,
    title: "工作区文件树 + 模糊搜索（_nofy/fs/* 与 _nofy/search/fuzzy/*，已实测）",
  },
  review: {
    label: "审查",
    icon: IconFileDiff,
    title: "审查：git/status（含 patch）+ 自绘 unified diff（生态面 #4，读路径已实测）",
  },
  agents: {
    label: "子智能体",
    icon: IconBot,
    title: "子智能体目录：本会话 task 块的提示词/回传/subagent_id（活壳 SidePanel 的 SubagentDirectoryTab 同位；脊柱块「在右侧打开」落这里）",
  },
};

const TAB_ORDER: AuxTab[] = ["files", "review", "agents"];

export type AuxPaneProps = {
  runtime: Runtime;
  root: string | null;
  sessionId: string | null;
  /** 开着的标签（有序）与选中的标签；App 持有（⌘K 面板命令要能切）。 */
  tabs: AuxTab[];
  active: AuxTab | null;
  onOpenTab: (t: AuxTab) => void;
  onActivate: (t: AuxTab) => void;
  onCloseTab: (t: AuxTab) => void;
  /** 相对时间时钟（App 30s 一跳）；弹层行的「刚刚 / 3小时」用它。 */
  now: number;
  /** 子智能体目录行（App 从活动会话的 task 块折出来 + roster 活动态 join）。 */
  agents: AgentRow[];
  /** 「在右侧打开」定位的子会话 id：目录里对应行自动展开。 */
  agentFocus: string | null;
  /** 审查面（生态面 #4）：App 轮询持有的 git/status 与刷新回调 */
  git: GitStatus | null;
  gitBusy: boolean;
  onRefreshGit: () => void;
};

export function AuxPane(props: AuxPaneProps) {
  const { runtime, root, sessionId, tabs, active, now, git, gitBusy, onRefreshGit, agents, agentFocus } = props;
  const [switcher, setSwitcher] = useState(false);
  const [query, setQuery] = useState("");
  /** 最近关闭（面板局部态）：关标签时记一笔，弹层第二段与重开都靠它。 */
  const [recent, setRecent] = useState<Array<{ tab: AuxTab; at: number }>>([]);
  /** 每个标签的开标签时刻：弹层「打开的标签页」段的相对时间用它。 */
  const [openedAt, setOpenedAt] = useState<Record<string, number>>({});
  useEffect(() => {
    setOpenedAt((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const t of tabs) {
        if (next[t] === undefined) {
          next[t] = Date.now();
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tabs]);

  const closeTab = (t: AuxTab) => {
    props.onCloseTab(t);
    setRecent((r) => [{ tab: t, at: Date.now() }, ...r.filter((x) => x.tab !== t)].slice(0, 6));
  };
  const reopen = (t: AuxTab) => {
    props.onOpenTab(t);
    setRecent((r) => r.filter((x) => x.tab !== t));
    setSwitcher(false);
  };

  const q = query.trim();
  const match = (t: AuxTab) => q.length === 0 || TAB_META[t].label.includes(q);
  const openRows = tabs.filter(match);
  const recentRows = recent.filter((r) => !tabs.includes(r.tab) && match(r.tab));

  const addItems = [
    ...TAB_ORDER.filter((t) => !tabs.includes(t)).map((t) => {
      const Ic = TAB_META[t].icon;
      return { id: t, label: TAB_META[t].label, icon: <Ic size={15} /> as ReactNode };
    }),
    { id: "chat", label: "辅助对话", icon: <IconMessagePlus size={15} /> as ReactNode, disabled: true },
    { id: "browser", label: "浏览器", icon: <IconGlobe size={15} /> as ReactNode, disabled: true },
  ];
  const pickAdd = (id: string) => {
    if (TAB_ORDER.includes(id as AuxTab)) props.onOpenTab(id as AuxTab);
  };

  /* ── 首屏：零标签时头行不画，整 pane 是居中的开标签引导（活壳 §1.8 实测） ── */
  if (tabs.length === 0) {
    const cards: Array<{ id: string; label: string; icon: IconCmp; title: string; run: (() => void) | null }> = [
      { id: "review", label: TAB_META.review.label, icon: TAB_META.review.icon, title: TAB_META.review.title, run: () => props.onOpenTab("review") },
      { id: "files", label: TAB_META.files.label, icon: TAB_META.files.icon, title: TAB_META.files.title, run: () => props.onOpenTab("files") },
      { id: "chat", label: "辅助对话", icon: IconMessagePlus, title: "未接线：辅助对话标签将按 pane↔session 绑定模型开在这里", run: null },
      { id: "browser", label: "浏览器", icon: IconGlobe, title: "明确不做：内嵌浏览器不在本产品范围", run: null },
    ];
    return (
      <aside className="aux">
        <div className="aux__open-shell">
          <div className="aux__open-center">
            <div className="aux__open-content">
              <div className="aux__open-head">
                <h2 className="aux__open-title">打开标签页</h2>
                <p className="aux__open-sub">选择要在侧边面板中打开的标签。</p>
              </div>
              <div className="aux__open-grid">
                {cards.map((c) => {
                  const Ic = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="aux__open-card"
                      disabled={c.run === null}
                      title={c.title}
                      onClick={c.run ?? undefined}
                    >
                      <Ic size={16} className="aux__open-cardicon" />
                      <span className="aux__open-cardlabel">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const row = (t: AuxTab, isOpen: boolean, at: number | undefined) => {
    const m = TAB_META[t];
    const Ic = m.icon;
    const activate = () => {
      if (isOpen) props.onActivate(t);
      else reopen(t);
      setSwitcher(false);
    };
    return (
      <div
        key={(isOpen ? "o:" : "r:") + t}
        role="button"
        tabIndex={0}
        className={"aux__switcher-row" + (isOpen && t === active ? " aux__switcher-row--active" : "")}
        title={m.title}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
      >
        <span className="aux__switcher-rowicon">
          <Ic size={16} />
        </span>
        <span className="aux__switcher-rowlabel">{m.label}</span>
        <span className="aux__switcher-rowtime">{formatCompactRelative(at ?? null, now) ?? ""}</span>
        {isOpen ? (
          <button
            type="button"
            className="aux__switcher-rowx"
            aria-label={"关闭 " + m.label}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(t);
            }}
          >
            <IconX size={12} />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <aside className="aux">
      <div className="aux__head">
        <span className="aux__head-lead">
          <button
            type="button"
            className="iconbtn"
            aria-label="搜索标签页"
            aria-expanded={switcher}
            title="搜索标签页：在打开的与最近关闭的标签之间切换"
            onClick={() => setSwitcher((v) => !v)}
          >
            <IconChevronsDown size={16} />
          </button>
        </span>
        <div className="aux__tabs-scroll">
          <div className="aux__tabs-row">
            {tabs.map((t) => {
              const m = TAB_META[t];
              const Ic = m.icon;
              return (
                <div
                  key={t}
                  role="button"
                  tabIndex={0}
                  className={"aux__chip" + (t === active ? " aux__chip--active" : "")}
                  title={m.title}
                  onClick={() => props.onActivate(t)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      props.onActivate(t);
                    }
                  }}
                >
                  <span className="aux__chip-icon">
                    <Ic size={14} />
                  </span>
                  <span className="aux__chip-label">{m.label}</span>
                  <span className="aux__chip-xwrap">
                    <button
                      type="button"
                      className="aux__chip-x"
                      aria-label={"关闭 " + m.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(t);
                      }}
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                </div>
              );
            })}
            <MenuButton
              variant="icon"
              chevron={false}
              align="left"
              title="新增标签"
              trigger={<IconPlus size={16} />}
              items={addItems}
              onPick={pickAdd}
            />
          </div>
        </div>
        {switcher ? (
          <>
            <span className="aux__switcher-overlay" onClick={() => setSwitcher(false)} />
            <div
              className="aux__switcher"
              role="dialog"
              aria-label="搜索标签页"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setSwitcher(false);
                }
              }}
            >
              <div className="aux__switcher-search">
                <span className="aux__switcher-searchicon">
                  <IconSearch size={16} />
                </span>
                <input
                  className="aux__switcher-input"
                  autoFocus
                  value={query}
                  placeholder="搜索标签页…"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="aux__switcher-scroll">
                {openRows.length > 0 ? (
                  <div className="aux__switcher-group">
                    <div className="aux__switcher-grouptitle">打开的标签页</div>
                    {openRows.map((t) => row(t, true, openedAt[t]))}
                  </div>
                ) : null}
                {recentRows.length > 0 ? (
                  <div className="aux__switcher-group">
                    <div className="aux__switcher-grouptitle">最近关闭的标签页</div>
                    {recentRows.map((r) => row(r.tab, false, r.at))}
                  </div>
                ) : null}
                {openRows.length === 0 && recentRows.length === 0 ? (
                  <p className="aux__switcher-none">没有匹配的标签页</p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
      {active === "files" ? <FilePane runtime={runtime} root={root} sessionId={sessionId} /> : null}
      {active === "review" ? (
        <ReviewPane runtime={runtime} sessionId={sessionId} git={git} gitBusy={gitBusy} onRefresh={onRefreshGit} />
      ) : null}
      {active === "agents" ? (
        <div className="aux__body agentsdir">
          {agents.length === 0 ? (
            <div className="emptyboard">
              <IconBot className="emptyboard-icon" />
              <p className="emptyboard-hint">本会话还没有子智能体。模型拉起子会话后，这里会同批列出。</p>
            </div>
          ) : (
            agents.map((a) => (
              <details key={a.blockId} className="agentsdir__row" open={agentFocus === a.subagentId}>
                <summary className="agentsdir__head">
                  <span className={"agentbadge agentbadge--" + a.color} title={a.subagentType ?? "类型未知"}>
                    {a.subagentType ?? "未知类型"}
                  </span>
                  <span className="agentsdir__desc">{a.description ?? a.prompt ?? a.toolCallId}</span>
                  {a.running ? <Dot activity="working" /> : a.activity !== null ? <Dot activity={a.activity} /> : null}
                  {a.status !== null ? <Chip>{a.status}</Chip> : null}
                </summary>
                <div className="agent__body">
                  {a.prompt !== null ? (
                    <div className="agent__section">
                      <div className="block__label">提示词</div>
                      <pre className="tool-card__args">{a.prompt.length > 4000 ? a.prompt.slice(0, 4000) + "…" : a.prompt}</pre>
                    </div>
                  ) : null}
                  {a.output !== null && a.output.length > 0 ? (
                    <div className="agent__section">
                      <div className="block__label">回传</div>
                      <Markdown text={a.output} />
                    </div>
                  ) : null}
                  <div className="agent__meta mono">subagent_id {a.subagentId ?? "等待结果页脚回传"}</div>
                </div>
              </details>
            ))
          )}
        </div>
      ) : null}
    </aside>
  );
}
