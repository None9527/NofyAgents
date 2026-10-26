import { organizationCommands } from "./sessionCommands.ts";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * Sidebar —— 活壳 3.11.2 侧栏的我们的版本。
 *
 * 解剖来源是 **CDP 运行时实测**（docs/contract/zcode-live-metrics.md §1.2），
 * 不是逆向树的类名猜测——上一轮就是猜错了槽位（把主题/设置塞进卡片头右簇）。
 *
 * 五段，自上而下与活壳同序：
 *
 *  1. h-12 拖拽区（[app-region:drag]）
 *  2. 窗口按钮组已迁到 WindowNavigation：折叠侧栏也保持可见，macOS 让位 96px。
 *     原布局：绝对定位 h-14 z-20，
 *     4 枚 28×28、pitch 32：切换侧边栏(panel-left-close/open) / 后退(arrow-left) /
 *     前进(arrow-right) / 新建任务(message-circle-plus)
 *  3. 动作区两行：新建任务 / 搜索。调度没有客户端列表方法，插件安装在设置里，
 *     这两条不再占侧栏。行内快捷键提示是淡色小字，不是带边框的 kbd 芯片。
 *  4. tabs 行 h-28：分组(hash) | 项目(folder)（55×24 + 滑动胶囊）＋右侧 3 枚 24×24
 *     展开全部(maximize-2) / 筛选和排序(list-filter) / 归档(archive)
 *  5. 列表（flex-1 overflow-y-auto）＋ 页脚 h-56（诊断卡 + 设置齿轮 32×32）
 *
 * ## 与活壳的刻意差别（每条都有据）
 *
 *  - 新建任务行用 <button> 而不是活壳的 DIV：同一外观、同一位置，语义更对（可聚焦、可读屏）。
 *  - 归档是本机偏好，不是内核会话属性。调度列表和插件市场不在侧栏。
 *  - 项目行图标只用 house（本窗口工作区）与 folder（其他）；活壳还有 cloud（云端项目），
 *    本机内核不产生云端会话 ⇒ 不画永远不出现的图标。
 *  - 列表 = 已打开会话 + 会话名单。项目是一份文件夹列表：目录来自 workspace_list，
 *    本窗口打开过但还没有会话的文件夹是空行。没有目录的会话在「聊天」，不进项目。
 */
import { useState } from "react";
import type { BootstrapInfo, NofyBridge } from "../../../preload/contract.ts";
import type { Projection } from "../../application/contracts/public.ts";
import { recordRender } from "../../ui/renderDiagnostics.ts";
import {
  IconArchive,
  IconChevronDown,
  IconChevronRight,
  IconExpand,
  IconFilter,
  IconFolder,
  IconGrip,
  IconHash,
  IconHouse,
  IconMessagePlus,
  IconPlus,
  IconSearch,
} from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { Dot } from "../../ui/primitives.tsx";
import type { ThemeName } from "../../ui/theme.ts";
import type { SidebarModel, SidebarProject, SidebarSort, SidebarTask, SidebarView } from "./sidebarModel.ts";
import { reorderProjects } from "./sidebarModel.ts";
import type { SettingsSectionId } from "../settings/public.ts";
import { SidebarFoot } from "./SidebarFoot.tsx";
import type { SessionMetadataPatch } from "./sessionMetadataModel.ts";

export type SidebarProps = {
  archiveView?: boolean;
  onArchiveView?: (archived: boolean) => void;
  onRenameGroup?: (previous: string, next: string) => void;
  onRemoveGroup?: (name: string) => void;
  onTaskMetadataChange?: (sessionId: string, patch: SessionMetadataPatch) => void;
  onOpenWorkspace: () => void;
  workspaceBusy: boolean;
  /** 在指定文件夹里新建任务（session/new）。空项目行的点击也走这里。 */
  onPickWorkspace: (cwd: string) => void;
  projection: Projection;
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
  onNewSession: () => void;
  newSessionBusy: boolean;
  onOpenPalette: () => void;
  onPickTask: (task: SidebarTask) => void;
  /** 页脚齿轮打开内核配置。外观不走这个入口。 */
  onOpenSettings: (section: SettingsSectionId) => void;
  /** workspace_list 失败时的内核原文。项目列表同时退回会话自带目录。 */
  catalogError?: string | null;
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

function TaskRow({ task, flat, onPick, onMetadataChange }: { task: SidebarTask; flat: boolean; onPick: (t: SidebarTask) => void; onMetadataChange?: (sessionId: string, patch: SessionMetadataPatch) => void }) {
  useLocale();
  const title = task.loaded ? task.title : task.title + tr("（尚未在本窗口打开）");
  return (
    <div className={"taskrow" + (flat ? " taskrow--flat" : "") + (task.loaded ? "" : " taskrow--cold")} style={onMetadataChange ? { display: "flex", alignItems: "center" } : undefined}>
      <button
        type="button"
        className={"taskrow__btn" + (task.active ? " taskrow__btn--active" : "")}
        style={onMetadataChange ? { flex: 1, minWidth: 0 } : undefined}
        onClick={() => onPick(task)}
        title={title}
      >
        <span className="taskrow__dot">
          {task.activity !== null && ATTENTION.has(task.activity) ? <Dot activity={task.activity} /> : null}
        </span>
        <span className="taskrow__title">{task.title}</span>
        {task.pinned ? <span title={tr("已置顶（仅此窗口）")} aria-label={tr("已置顶（仅此窗口）")}>★</span> : null}
        {task.unread ? <span title={tr("未读（仅此窗口）")} aria-label={tr("未读（仅此窗口）")}>●</span> : null}
        {task.archived ? <span title={tr("已归档（仅此窗口）")} aria-label={tr("已归档（仅此窗口）")}><IconArchive size={12} /></span> : null}
        {task.time !== null ? <span className="taskrow__time">{task.time}</span> : null}
      </button>
      {onMetadataChange ? <MenuButton variant="icon-sm" chevron={false} trigger="⋯" title={tr("组织会话 {0}", [task.title])}
        items={organizationCommands(task, task.activity === "working" || task.activity === "needs_input").map(command => ({ ...command, label: tr(command.label) }))}
        onPick={(id) => { const command = organizationCommands(task, task.activity === "working" || task.activity === "needs_input").find(item => item.id === id); if (command && !command.disabled) onMetadataChange(task.sessionId, command.patch); }} /> : null}
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  recordRender("Sidebar");
  useLocale();
  const {
    projection, boot, bridge, theme, onTheme, model, view, sort, onView, onSort,
    onReorderProjects,
    onNewSession, newSessionBusy, onOpenPalette, onPickTask,
    onOpenSettings, onOpenWorkspace, workspaceBusy, onPickWorkspace,
    archiveView = false, onArchiveView, onRenameGroup, onRemoveGroup, onTaskMetadataChange,
    catalogError = null,
  } = props;
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");

  /**
   * 折叠态是**窗口局部态**（不进 store）。默认规则抄活壳的可见行为：
   * 只有「装着当前会话」的项目默认展开，其余收起（实测活壳里 mac 那组是开的、
   * 其它组都是关的）。用户点过之后以显式值为准（?? 的左边）。
   */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState(true);
  const [chatsOpen, setChatsOpen] = useState(true);
  /** 正在拖的工作区 key（HTML5 dnd）；null = 没在拖。 */
  const [dragKey, setDragKey] = useState<string | null>(null);
  const isOpen = (p: SidebarProject): boolean => p.tasks.length > 0 && (collapsed[p.key] ?? p.tasks.some((t) => t.active));

  /**
   * 折叠开关。**当前态从 updater 的参数 m 算**，不从闭包里的 collapsed 算：
   * 一次点击里连开两组（或 React 批处理）时，闭包值是旧的，用它会丢一次翻转。
   * 默认值与 isOpen 同规则：只有装着当前会话的项目默认展开。
   */
  const toggleProject = (key: string): void =>
    setCollapsed((m) => {
      const p = model.projects.find((x) => x.key === key);
      const open = (p?.tasks.length ?? 0) > 0 && (m[key] ?? (p?.tasks.some((t) => t.active) ?? false));
      return { ...m, [key]: !open };
    });

  const expandable = model.projects.filter((p) => p.tasks.length > 0);
  const anyClosed = expandable.some((p) => !isOpen(p));
  const toggleAll = (): void => {
    const next: Record<string, boolean> = {};
    for (const p of expandable) next[p.key] = anyClosed ? false : true;
    setCollapsed(next);
  };

  const sortItems: MenuItem[] = [
    { id: "recent", label: tr("按最近变更"), hint: tr("最近变更在前"), selected: sort === "recent" },
    { id: "title", label: tr("按标题"), hint: tr("按标题排序"), selected: sort === "title" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__drag" />

      <div className="sidebar__actions">
        <button
          type="button"
          className="navrow"
          onClick={onNewSession}
          disabled={newSessionBusy}
          title={tr("新建任务（⌘N）")}
        >
          <IconMessagePlus size={16} />
          <span className="navrow__label">{tr("新建任务")}</span>
          <span className="navrow__hint">⌘N</span>
        </button>
        <button
          type="button"
          className="navrow"
          onClick={onOpenPalette}
          title={tr("搜索会话和命令（⌘K）")}
        >
          <IconSearch size={16} />
          <span className="navrow__label">{tr("搜索")}</span>
          <span className="navrow__hint">⌘K</span>
        </button>
      </div>

      <div className="sidebar__tabs">
        <div className="tablist" role="tablist" aria-label={tr("列表视图")}>
          <button
            type="button"
            role="tab"
            aria-selected={view === "grouped"}
            className={"tab" + (view === "grouped" ? " tab--on" : "")}
            onClick={() => onView("grouped")}
            title={tr("分组：全部任务按最近变更排成一条扁平列表（活壳同 tabs 的第一档）")}
          >
            <IconHash size={12} />
            <span>{tr("分组")}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "projects"}
            className={"tab" + (view === "projects" ? " tab--on" : "")}
            onClick={() => onView("projects")}
            title={tr("项目：按工作区分组，组内是该工作区的任务")}
          >
            <IconFolder size={12} />
            <span>{tr("项目")}</span>
          </button>
        </div>
        <button
          type="button"
          className="iconbtn iconbtn--sm"
          onClick={toggleAll}
          aria-label={anyClosed ? tr("展开全部") : tr("收起全部")}
          title={anyClosed ? tr("展开全部项目组") : tr("收起全部项目组")}
        >
          <IconExpand size={14} />
        </button>
        {/* 活壳实测：展开全部紧贴 tabs（x=128），筛选/排序与归档才靠右 */}
        <span className="sidebar__tabs-spacer" />
        <MenuButton
          align="right"
          variant="icon-sm"
          chevron={false}
          title={tr("筛选和排序")}
          trigger={<IconFilter size={14} />}
          items={sortItems}
          onPick={(id) => onSort(id === "title" ? "title" : "recent")}
        />
        <button
          type="button"
          className="iconbtn iconbtn--sm"
          disabled={!onArchiveView}
          aria-label={archiveView ? tr("返回未归档会话") : tr("查看归档会话")}
          aria-pressed={archiveView}
          onClick={() => onArchiveView?.(!archiveView)}
          title={tr("本地归档列表，共 {0} 个会话", [String(model.archivedCount ?? 0)])}
        >
          <IconArchive size={14} />
        </button>
      </div>

      <div className="sidebar__scroll">
        {catalogError ? <p className="sidebar__status" role="alert">{catalogError}</p> : null}
        {model.total === 0 && (view !== "projects" || model.projects.length === 0) ? (
          <div className="emptyboard">
            <IconMessagePlus className="emptyboard-icon" />
            <p className="emptyboard-title">{tr(archiveView ? "归档列表为空" : "还没有会话")}</p>
            <p className="emptyboard-hint">{tr(archiveView ? "会话菜单可将空闲会话归档；内核历史会保留" : "点「新建任务」，开始第一段对话")}</p>
          </div>
        ) : view === "grouped" ? (
          <div className="tasklist tasklist--flat">
            {(model.groups ?? [{ name: null, tasks: model.flat }]).map((group) => <section key={group.name === null ? "unassigned" : "named:" + group.name}>
              {group.name !== null ? <div className="sechead">
                <span className="sechead__name">{group.name}</span>
                {onRenameGroup ? <button type="button" aria-label={tr("重命名分组 {0}", [group.name])} onClick={() => { setEditingGroup(group.name); setGroupName(group.name!); }}>{tr("重命名")}</button> : null}
                {onRemoveGroup ? <button type="button" title={tr("会话回到未分组，不删除会话")} onClick={() => onRemoveGroup(group.name!)}>{tr("解散分组")}</button> : null}
              </div> : model.groups && model.groups.length > 1 ? <div className="sechead">{tr("未分组")}</div> : null}
              {editingGroup === group.name && group.name !== null && <form onSubmit={(e) => { e.preventDefault(); if (groupName.trim()) { onRenameGroup?.(group.name!, groupName.trim()); setEditingGroup(null); } }}>
                <label>{tr("新分组名称")}<input autoFocus value={groupName} maxLength={80} onChange={(e) => setGroupName(e.target.value)} /></label>
                <button type="submit" disabled={!groupName.trim()}>{tr("保存")}</button>
                <button type="button" onClick={() => setEditingGroup(null)}>{tr("取消")}</button>
              </form>}
              {group.tasks.map((t) => <TaskRow key={t.key} task={t} flat onPick={onPickTask} onMetadataChange={onTaskMetadataChange} />)}
            </section>)}
          </div>
        ) : (
          <>
          <section className="seclist">
            <div className="sechead">
              {/* 活壳的区段头是**纯小标题**：没有计数、工具钮悬停才现（实测 24×24 在 x=202/226）。
                  整段折叠仍由标题点击承担，chevron 做淡，作为可折叠的唯一暗示。 */}
              <button type="button" className="sechead__label" onClick={() => setSectionOpen((v) => !v)}>
                {sectionOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                <span className="sechead__name">{tr("项目")}</span>
              </button>
              <span className="sechead__tools">
                <button
                  type="button"
                  className="iconbtn iconbtn--sm"
                  disabled={workspaceBusy}
                  onClick={onOpenWorkspace}
                  aria-label={tr("添加项目")}
                  title={tr("选择项目文件夹")}
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
                      <p className="emptyboard-title">{tr("还没有项目")}</p>
                      <p className="emptyboard-hint">{tr("有会话之后，它所在的文件夹会列在这里")}</p>
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
                    <div className="projhead">
                      <button
                        type="button"
                        className="prow"
                        onClick={() => {
                          if (p.tasks.length === 0) {
                            if (!newSessionBusy) onPickWorkspace(p.cwd);
                            return;
                          }
                          toggleProject(p.key);
                        }}
                        title={p.cwd}
                        aria-expanded={p.tasks.length > 0 ? isOpen(p) : undefined}
                      >
                        {p.kind === "home" ? <IconHouse size={16} /> : <IconFolder size={16} />}
                        <span className="prow__name">{p.label}</span>
                        {/* 工作区行右端没有计数。有会话时点行折叠；空行点一下才新建任务。 */}
                        {projActivity(p) !== null ? (
                          <span className="prow__dot">
                            <Dot activity={projActivity(p)} />
                          </span>
                        ) : null}
                        <span className="prow__grip" aria-hidden="true">
                          <IconGrip size={12} />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="iconbtn iconbtn--sm prow__new"
                        disabled={newSessionBusy}
                        aria-label={tr("在 {0} 中新建任务", [p.label])}
                        title={tr("在 {0} 中新建任务", [p.label])}
                        onClick={() => onPickWorkspace(p.cwd)}
                      >
                        <IconMessagePlus size={14} />
                      </button>
                    </div>
                    {isOpen(p) ? (
                      <div className="tasklist">
                        {p.tasks.map((t) => (
                          <TaskRow key={t.key} task={t} flat={false} onPick={onPickTask} onMetadataChange={onTaskMetadataChange} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              : null}
          </section>
          {model.chats.length > 0 ? (
            <section className="seclist">
              <div className="sechead">
                <button type="button" className="sechead__label" onClick={() => setChatsOpen((v) => !v)}>
                  {chatsOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                  <span className="sechead__name">{tr("聊天")}</span>
                </button>
              </div>
              {chatsOpen ? (
                <div className="tasklist">
                  {model.chats.map((t) => (
                    <TaskRow key={t.key} task={t} flat={false} onPick={onPickTask} onMetadataChange={onTaskMetadataChange} />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
          </>
        )}
      </div>

      <SidebarFoot
        projection={projection}
        boot={boot}
        bridge={bridge}
        theme={theme}
        onTheme={onTheme}
        onOpenSettings={onOpenSettings}
      />
    </aside>
  );
}
