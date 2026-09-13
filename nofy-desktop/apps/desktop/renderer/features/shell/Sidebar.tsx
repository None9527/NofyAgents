/**
 * Sidebar —— 活壳 3.11.2 侧栏的我们的版本。
 *
 * 解剖来源是 **CDP 运行时实测**（docs/contract/zcode-live-metrics.md §1.2），
 * 不是逆向树的类名猜测——上一轮就是猜错了槽位（把主题/设置塞进卡片头右簇）。
 *
 * 五段，自上而下与活壳同序：
 *
 *  1. h-12 拖拽区（[app-region:drag]）
 *  2. 叠层按钮组：绝对定位 h-14 z-20，macOS 让位 96px（实测首枚 x=96），
 *     4 枚 28×28、pitch 32：切换侧边栏(panel-left-close/open) / 后退(arrow-left) /
 *     前进(arrow-right) / 新建任务(message-circle-plus)
 *  3. 动作区 px-2 py-3 gap-1，**四行** 248×32：新建任务(message-circle-plus) / 搜索(search) /
 *     自动化(calendar-clock) / 插件市场(blocks)。注意：新建任务行与叠层第 4 枚**并存**
 *     （活壳就是这样；上一轮我误判成重复，是因为那行是 DIV 不是 BUTTON，选择器漏了它）。
 *     行内快捷键提示是**淡色小字**（ml-auto text-ui-xs），不是带边框的 kbd 芯片。
 *  4. tabs 行 h-28：分组(hash) | 项目(folder)（55×24 + 滑动胶囊）＋右侧 3 枚 24×24
 *     展开全部(maximize-2) / 筛选和排序(list-filter) / 归档(archive)
 *  5. 列表（flex-1 overflow-y-auto）＋ 页脚 h-56（诊断卡 + 设置齿轮 32×32）
 *
 * ## 与活壳的刻意差别（每条都有据）
 *
 *  - 新建任务行用 <button> 而不是活壳的 DIV：同一外观、同一位置，语义更对（可聚焦、可读屏）。
 *  - 自动化 / 归档 / 添加项目置灰：读路径已实测但界面未接线，title 里写清缺什么。
 *    灰按钮比假按钮诚实。插件市场已于阶段 C UI 批接线（开设置面插件分区）。
 *  - 项目行图标只用 house（本窗口工作区）与 folder（其他）；活壳还有 cloud（云端项目），
 *    本机内核不产生云端会话 ⇒ 不画永远不出现的图标。
 *  - 列表内容 = 已加载会话 + roster 全量。roster 条目带 cwd（实测），所以未加载的
 *    历史会话点一下就能 session/load —— 冷启动可用性由这条来（P1）。
 *  - 活壳侧栏还有一层 translate-x-full 的**滑入面板**（与侧栏等宽，覆盖在列表上），
 *    自动化/插件市场就是从那里滑出来的。我们的对应面走右侧辅助 pane，先不造第二层。
 */
import { useState } from "react";
import type { BootstrapInfo, NofyBridge } from "../../../preload/contract.ts";
import type { AppState } from "../../core/store/state.ts";
import {
  IconArchive,
  IconArrowLeft,
  IconArrowRight,
  IconBlocks,
  IconCalendarClock,
  IconChevronDown,
  IconChevronRight,
  IconExpand,
  IconFilter,
  IconFolder,
  IconGrip,
  IconHash,
  IconHouse,
  IconMessagePlus,
  IconPanelLeftClose,
  IconPanelLeftOpen,
  IconPlus,
  IconSearch,
} from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { Dot } from "../../ui/primitives.tsx";
import type { ThemeName } from "../../ui/theme.ts";
import type { SidebarModel, SidebarProject, SidebarSort, SidebarTask, SidebarView } from "./sidebarModel.ts";
import { reorderProjects } from "./sidebarModel.ts";
import type { SettingsSectionId } from "../settings/settingsModel.ts";
import { SidebarFoot } from "./SidebarFoot.tsx";

export type SidebarProps = {
  state: AppState;
  boot: BootstrapInfo | null;
  bridge: NofyBridge;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  /** 折叠好的列表模型（sidebarModel.ts 是纯函数，App 用 useMemo 算）。 */
  model: SidebarModel;
  view: SidebarView;
  sort: SidebarSort;
  onView: (v: SidebarView) => void;
  onSort: (s: SidebarSort) => void;
  /** 工作区行拖拽排序：传回全量 key 序（App 写进 LayoutPrefs.projectOrder）。 */
  onReorderProjects: (keys: string[]) => void;
  sidebarOpen: boolean;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onToggleSidebar: () => void;
  onNewSession: () => void;
  newSessionBusy: boolean;
  onOpenPalette: () => void;
  onPickTask: (task: SidebarTask) => void;
  /** 「插件市场」动作行开设置面插件分区（阶段 C UI 批接线）。 */
  onOpenSettings: (section: SettingsSectionId) => void;
};

/**
 * 任务行：项目视图与分组视图共用。
 *
 * 16px 的状态点槽**两视图都留**：活壳两个分区（项目 / 任务）的行都是
 * 「16 图标槽 + 标题 + 右靠时间」三段（本轮实测 li 的 children：16×16 / flex-1 / fs12 时间），
 * 槽位恒定才不会让两视图的行左缘错开 24px。
 *
 * 但点**只在需要注意力时画**：活壳任务行这个槽平时是空的，活动点住在**工作区行**名字后
 * （本轮实测 zcodebot 行那颗蓝点）。照这个分工来，行里不撒无意义的灰点。
 */
const ATTENTION = new Set(["working", "needs_input", "dead"]);

/** 工作区行的活动点：取组内第一个需要注意力的任务的活动态（活壳同位那颗点）。 */
function projActivity(p: SidebarProject): string | null {
  for (const t of p.tasks) {
    if (t.activity !== null && ATTENTION.has(t.activity)) return t.activity;
  }
  return null;
}

function TaskRow({ task, flat, onPick }: { task: SidebarTask; flat: boolean; onPick: (t: SidebarTask) => void }) {
  const title = task.loaded
    ? task.title + "（" + task.sessionId + "）"
    : task.title + "（未加载 · roster：" + task.sessionId + "，点击走 session/load）";
  return (
    <div className={"taskrow" + (flat ? " taskrow--flat" : "") + (task.loaded ? "" : " taskrow--cold")}>
      <button
        type="button"
        className={"taskrow__btn" + (task.active ? " taskrow__btn--active" : "")}
        onClick={() => onPick(task)}
        title={title}
      >
        <span className="taskrow__dot">
          {task.activity !== null && ATTENTION.has(task.activity) ? <Dot activity={task.activity} /> : null}
        </span>
        <span className="taskrow__title">{task.title}</span>
        {task.time !== null ? <span className="taskrow__time">{task.time}</span> : null}
      </button>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const {
    state, boot, bridge, theme, onTheme, model, view, sort, onView, onSort,
    onReorderProjects,
    sidebarOpen, canBack, canForward, onBack, onForward, onToggleSidebar,
    onNewSession, newSessionBusy, onOpenPalette, onPickTask,
    onOpenSettings,
  } = props;

  /**
   * 折叠态是**窗口局部态**（不进 store）。默认规则抄活壳的可见行为：
   * 只有「装着当前会话」的项目默认展开，其余收起（实测活壳里 mac 那组是开的、
   * 其它组都是关的）。用户点过之后以显式值为准（?? 的左边）。
   */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState(true);
  /** 正在拖的工作区 key（HTML5 dnd）；null = 没在拖。 */
  const [dragKey, setDragKey] = useState<string | null>(null);
  const isOpen = (p: SidebarProject): boolean => collapsed[p.key] ?? p.tasks.some((t) => t.active);

  /**
   * 折叠开关。**当前态从 updater 的参数 m 算**，不从闭包里的 collapsed 算：
   * 一次点击里连开两组（或 React 批处理）时，闭包值是旧的，用它会丢一次翻转。
   * 默认值与 isOpen 同规则：只有装着当前会话的项目默认展开。
   */
  const toggleProject = (key: string): void =>
    setCollapsed((m) => {
      const p = model.projects.find((x) => x.key === key);
      const open = m[key] ?? (p?.tasks.some((t) => t.active) ?? false);
      return { ...m, [key]: !open };
    });

  const anyClosed = model.projects.some((p) => !isOpen(p));
  const toggleAll = (): void => {
    const next: Record<string, boolean> = {};
    for (const p of model.projects) next[p.key] = anyClosed ? false : true;
    setCollapsed(next);
  };

  const sortItems: MenuItem[] = [
    { id: "recent", label: "按最近变更", hint: "roster.lastChangeUnixMs 降序", selected: sort === "recent" },
    { id: "title", label: "按标题", hint: "localeCompare(zh)", selected: sort === "title" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__drag" />

      {/* 叠层：不占流式布局（活壳是 absolute h-14 z-20 + pointer-events 分离） */}
      <div className="sidebar__overlay">
        <div className="sidebar__overlay-btns">
          <button
            type="button"
            className="iconbtn"
            onClick={onToggleSidebar}
            aria-label="切换侧边栏"
            title="切换侧边栏（⌘B）"
          >
            {sidebarOpen ? <IconPanelLeftClose size={16} /> : <IconPanelLeftOpen size={16} />}
          </button>
          <button
            type="button"
            className="iconbtn"
            onClick={onBack}
            disabled={!canBack}
            aria-label="后退"
            title="后退：沿我看过的会话顺序回溯（历史栈上限 64）"
          >
            <IconArrowLeft size={16} />
          </button>
          <button
            type="button"
            className="iconbtn"
            onClick={onForward}
            disabled={!canForward}
            aria-label="前进"
            title="前进：回到后退之前的会话"
          >
            <IconArrowRight size={16} />
          </button>
          <button
            type="button"
            className="iconbtn"
            onClick={onNewSession}
            disabled={newSessionBusy}
            aria-label="新建任务"
            title="新建任务（⌘N）：session/new，cwd = 本窗口工作区"
          >
            <IconMessagePlus size={16} />
          </button>
        </div>
      </div>

      <div className="sidebar__actions">
        <button
          type="button"
          className="navrow"
          onClick={onNewSession}
          disabled={newSessionBusy}
          title="新建任务（⌘N）：session/new，cwd = 本窗口工作区"
        >
          <IconMessagePlus size={16} />
          <span className="navrow__label">新建任务</span>
          <span className="navrow__hint">⌘N</span>
        </button>
        <button
          type="button"
          className="navrow"
          onClick={onOpenPalette}
          title="命令中心：内核命令（实测 167 条）+ 窗口动作 + 会话（含未加载的，点击走 session/load）"
        >
          <IconSearch size={16} />
          <span className="navrow__label">搜索</span>
          <span className="navrow__hint">⌘K</span>
        </button>
        <button
          type="button"
          className="navrow"
          disabled
          title="自动化：未接线（生态面 #6）。活壳这一行滑出定时任务面板；内核侧调度通告已有，读路径未录"
        >
          <IconCalendarClock size={16} />
          <span className="navrow__label">自动化</span>
        </button>
        <button
          type="button"
          className="navrow"
          onClick={() => onOpenSettings("plugins")}
          title="插件市场：开设置面插件分区（只读：marketplace/list 292 条、plugins/list）"
        >
          <IconBlocks size={16} />
          <span className="navrow__label">插件市场</span>
        </button>
      </div>

      <div className="sidebar__tabs">
        <div className="tablist" role="tablist" aria-label="列表视图">
          <button
            type="button"
            role="tab"
            aria-selected={view === "grouped"}
            className={"tab" + (view === "grouped" ? " tab--on" : "")}
            onClick={() => onView("grouped")}
            title="分组：全部任务按最近变更排成一条扁平列表（活壳同 tabs 的第一档）"
          >
            <IconHash size={12} />
            <span>分组</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "projects"}
            className={"tab" + (view === "projects" ? " tab--on" : "")}
            onClick={() => onView("projects")}
            title="项目：按工作区分组，组内是该工作区的任务"
          >
            <IconFolder size={12} />
            <span>项目</span>
          </button>
        </div>
        <button
          type="button"
          className="iconbtn iconbtn--sm"
          onClick={toggleAll}
          aria-label={anyClosed ? "展开全部" : "收起全部"}
          title={anyClosed ? "展开全部项目组" : "收起全部项目组"}
        >
          <IconExpand size={14} />
        </button>
        {/* 活壳实测：展开全部紧贴 tabs（x=128），筛选/排序与归档才靠右 */}
        <span className="sidebar__tabs-spacer" />
        <MenuButton
          align="right"
          variant="icon-sm"
          chevron={false}
          title="筛选和排序"
          trigger={<IconFilter size={14} />}
          items={sortItems}
          onPick={(id) => onSort(id === "title" ? "title" : "recent")}
        />
        <button
          type="button"
          className="iconbtn iconbtn--sm"
          disabled
          aria-label="归档"
          title="归档：未接线。内核侧没有归档写路径的实测记录（roster 只给 activity/origin），不放假动作"
        >
          <IconArchive size={14} />
        </button>
      </div>

      <div className="sidebar__scroll">
        {model.total === 0 ? (
          <div className="emptyboard">
            <IconMessagePlus className="emptyboard-icon" />
            <p className="emptyboard-title">还没有会话</p>
            <p className="emptyboard-hint">点「新建任务」，开始第一段对话</p>
          </div>
        ) : view === "grouped" ? (
          <div className="tasklist tasklist--flat">
            {model.flat.map((t) => (
              <TaskRow key={t.key} task={t} flat onPick={onPickTask} />
            ))}
          </div>
        ) : (
          <section className="seclist">
            <div className="sechead">
              {/* 活壳的区段头是**纯小标题**：没有计数、工具钮悬停才现（实测 24×24 在 x=202/226）。
                  整段折叠仍由标题点击承担，chevron 做淡，作为可折叠的唯一暗示。 */}
              <button type="button" className="sechead__label" onClick={() => setSectionOpen((v) => !v)}>
                {sectionOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                <span className="sechead__name">项目</span>
              </button>
              <span className="sechead__tools">
                <button
                  type="button"
                  className="iconbtn iconbtn--sm"
                  disabled
                  aria-label="添加项目"
                  title="添加项目：需要 main 侧目录选择器（IPC 第 10 通道未接线）"
                >
                  <IconPlus size={14} />
                </button>
              </span>
            </div>
            {sectionOpen
              ? model.projects.length === 0
                ? (
                    <div className="emptyboard">
                      <IconFolder className="emptyboard-icon" />
                      <p className="emptyboard-title">还没有项目</p>
                      <p className="emptyboard-hint">有会话之后，它所在的文件夹会列在这里</p>
                    </div>
                  )
                : model.projects.map((p) => (
                  <div
                    className="proj"
                    key={p.key}
                    draggable
                    onDragStart={(e) => {
                      setDragKey(p.key);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", p.key);
                    }}
                    onDragOver={(e) => {
                      if (dragKey !== null && dragKey !== p.key) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = dragKey ?? e.dataTransfer.getData("text/plain");
                      setDragKey(null);
                      if (from === "" || from === p.key) return;
                      onReorderProjects(reorderProjects(model.projects.map((x) => x.key), from, p.key));
                    }}
                    onDragEnd={() => setDragKey(null)}
                  >
                    <button
                      type="button"
                      className="prow"
                      onClick={() => toggleProject(p.key)}
                      title={p.cwd ?? "会话未带 cwd"}
                      aria-expanded={isOpen(p)}
                    >
                      {p.kind === "home" ? <IconHouse size={16} /> : <IconFolder size={16} />}
                      <span className="prow__name">{p.label}</span>
                      {/* 活壳工作区行右端没有计数/chevron（只有远端未连的警告+重连、或活动点）；
                          折叠靠点行本身，aria-expanded 留给读屏。 */}
                      {projActivity(p) !== null ? (
                        <span className="prow__dot">
                          <Dot activity={projActivity(p)} />
                        </span>
                      ) : null}
                      {/* 拖拽把手暗示：悬停才现（活壳 grip 同纪律）；整行 draggable，见 .proj */}
                      <span className="prow__grip" aria-hidden="true">
                        <IconGrip size={12} />
                      </span>
                    </button>
                    {isOpen(p) ? (
                      <div className="tasklist">
                        {p.tasks.map((t) => (
                          <TaskRow key={t.key} task={t} flat={false} onPick={onPickTask} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              : null}
          </section>
        )}
      </div>

      <SidebarFoot
        state={state}
        boot={boot}
        bridge={bridge}
        theme={theme}
        onTheme={onTheme}
        onOpenSettings={onOpenSettings}
      />
    </aside>
  );
}
