import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/** Independent right workspace. Its top strip owns document, review and agent tabs.
 * FilePane renders only the resource toolbar/content; application/workspace owns file state.
 * Cached document tabs stay reachable while file reads/watchers pause in other modules.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { BrowserPane, FilePane, ReviewPane } from "../aux/public.ts";
import type { ReviewSource } from "../aux/public.ts";
import { formatCompactRelative } from "./palette.ts";
import {
  IconChevronsDown,
  IconExpand,
  IconFile,
  IconGlobe,
  IconMinimize,
  IconPlus,
  IconTerminal,
  IconX,
  IconPanelRightClose,
} from "../../ui/icons.tsx";
import { WORKBENCH_PANELS } from "./panelRegistry.tsx";
import { directoryAgents } from "../conversation/public.ts";
import { AgentsPane } from "./AgentsPane.tsx";
import { ViewBoundary } from "../../ui/viewBoundary.tsx";
import { PaneToolbar, PaneIconButton, PaneMenuButton, PaneTab, PaneSearch } from "../../ui/workbench.tsx";
import type { AgentRow } from "../conversation/public.ts";
import { createTaskBoardSelector } from "../conversation/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import type { GitStatus } from "../../ui/readers.ts";

/** Registered workspace views are independent from kernel/session ownership. */
import type { PanelKind } from "../../application/workspace/public.ts";
import { createDesktopClient } from "../../application/public.ts";
import { useFileWorkspace } from "../../application/workspace/public.ts";
import { PANEL_KINDS } from "../../application/workspace/public.ts";
export type AuxTab = PanelKind;

const TAB_META = WORKBENCH_PANELS;

const TAB_ORDER = PANEL_KINDS;

export type AuxPaneProps = {
  enabled?:boolean;
  runtime: Runtime;
  root: string | null;
  sessionId: string | null;
  /** 开着的标签（有序）与选中的标签；App 持有（⌘K 面板命令要能切）。 */
  tabs: AuxTab[];
  active: AuxTab | null;
  onOpenTab: (t: AuxTab) => void;
  onActivate: (t: AuxTab) => void;
  onCloseTab: (t: AuxTab) => void;
  onCollapse: () => void;
  /** Right pane covers the workbench. Independent of the saved split width. */
  expanded: boolean;
  onToggleExpand: () => void;
  /** False while the shell slot is closed, so the native page hides before the slot finishes retracting. */
  open: boolean;
  /** Opens the existing bottom terminal dock. */
  onOpenTerminal: () => void;
  /** 相对时间时钟（App 30s 一跳）；弹层行的「刚刚 / 3小时」用它。 */
  now: number;
  /** 子智能体目录行（App 从活动会话的 task 块折出来 + roster 活动态 join）。 */
  agents: AgentRow[];
  /** 「在右侧打开」定位的子会话 id：目录里对应行自动展开。 */
  agentFocus: string | null;
  /** 目录行取消仍走已有 subagent/cancel。没有回调就不放按钮。 */
  onCancelAgent?: (subagentId: string) => void;
  /** 审查面（生态面 #4）：App 轮询持有的 git/status 与刷新回调 */
  git: GitStatus | null;
  gitBusy: boolean;
  onRefreshGit: () => void;
  reviewSource: ReviewSource;
  onReviewSource: (source: ReviewSource) => void;
  onOpenReviewFile: (path: string) => void;
};

export function AuxPane(props: AuxPaneProps) {
  useLocale();
  const { runtime, root, sessionId, tabs, active, now, git, gitBusy, onRefreshGit, agents, agentFocus } = props;
  const tabsViewport = useRef<HTMLDivElement>(null);
  const client = useMemo(() => createDesktopClient(runtime), [runtime]);
  const taskBoard = useMemo(() => createTaskBoardSelector(sessionId ?? ""), [sessionId]);
  const board = useProjection(client.projection, taskBoard);
  const directory = directoryAgents(agents, board.subagentProgress, board.subagentFinished);
  const files = useFileWorkspace(client, root, sessionId, props.enabled !== false && tabs.includes("files") && active === "files");
  useLayoutEffect(() => {
    tabsViewport.current?.querySelector<HTMLElement>(".ui-pane-tab.is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, files.resources.active, files.resources.tabs.length]);
  const activateFile = (path: string) => { files.activate(path); props.onActivate("files"); setSwitcher(false); };
  const [page, setPage] = useState({ url: "", title: "" });
  useEffect(() => props.runtime.bridge.onBrowserState(state => {
    setPage(current => current.url === state.url && current.title === state.title ? current : { url: state.url, title: state.title });
  }), [props.runtime]);
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

  const closeBrowserPage = () => { void runtime.bridge.browserCommand("home"); };
  /** A loaded page returns to the new-tab homepage. The empty homepage tab still collapses the pane. */
  const closeHomeTab = () => { if (page.url) closeBrowserPage(); else props.onCollapse(); };
  const closeTab = (t: AuxTab) => {
    if (t === "browser") closeBrowserPage();
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
  const openRows = tabs.filter(t => match(t) && (t !== "files" || files.resources.tabs.length === 0));
  const fileRows = tabs.includes("files") ? files.resources.tabs.filter(t => !q || t.path.toLowerCase().includes(q.toLowerCase())) : [];
  const recentRows = recent.filter((r) => !tabs.includes(r.tab) && match(r.tab));

  const addItems = [
    ...TAB_ORDER.filter((t) => !tabs.includes(t) && !(tabs.length === 0 && t === "browser")).map((t) => {
      const Ic = TAB_META[t].icon;
      return { id: t, label: TAB_META[t].label, icon: <Ic size={15} /> as ReactNode };
    }),
  ];
  const pickAdd = (id: string) => {
    if (TAB_ORDER.includes(id as AuxTab)) props.onOpenTab(id as AuxTab);
  };
  const expandLabel = props.expanded ? tr("退出全屏") : tr("全屏显示");
  const expandButton = <PaneIconButton aria-label={expandLabel} aria-pressed={props.expanded} title={expandLabel} onClick={props.onToggleExpand}>{props.expanded ? <IconMinimize size={16}/> : <IconExpand size={16}/>}</PaneIconButton>;
  const browserLabel = page.url ? (page.title.trim() || tr("浏览器")) : tr("新标签页");
  const homeTools = [
    ...(["files", "review", "agents"] as const).map(kind => {
      const meta = TAB_META[kind];
      const Ic = meta.icon;
      return { id: kind, label: meta.label, title: meta.title, icon: <Ic size={16} />, onClick: () => props.onOpenTab(kind) };
    }),
    { id: "terminal", label: tr("终端"), title: tr("展开终端面板"), icon: <IconTerminal size={16} />, onClick: props.onOpenTerminal },
  ];

  if (tabs.length === 0) {
    return <aside className="aux">
      <PaneToolbar className="aux__head">
        <div className="aux__tabs-scroll"><div className="aux__tabs-row">
          <PaneTab icon={<IconGlobe size={16}/>} label={browserLabel} active title={browserLabel} onActivate={() => undefined} onClose={closeHomeTab}/>
        </div></div>
        <PaneMenuButton chevron={false} align="left" title={tr("新增标签")} trigger={<IconPlus size={16}/>} items={addItems} disabled={!addItems.length} onPick={pickAdd}/>
        {expandButton}
        <PaneIconButton className="aux__collapse" aria-label={tr("收起右侧栏")} title={tr("收起右侧栏")} onClick={props.onCollapse}><IconPanelRightClose size={16}/></PaneIconButton>
      </PaneToolbar>
      <BrowserPane runtime={runtime} shown={props.enabled !== false && props.open} tools={homeTools}/>
    </aside>;
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
            aria-label={tr("关闭 ") + m.label}
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
      <PaneToolbar className="aux__head">
        <PaneIconButton aria-label={tr("搜索标签页")} aria-expanded={switcher} title={tr("搜索标签页：在打开的与最近关闭的标签之间切换")} onClick={()=>setSwitcher(v=>!v)}><IconChevronsDown size={16}/></PaneIconButton>
        <div className="aux__tabs-scroll" ref={tabsViewport}><div className="aux__tabs-row">
          {tabs.map(t=>{
            if(t==='files'&&files.resources.tabs.length) return <div key="files" className="aux__document-tabs" role="tablist" aria-label={tr("文件标签")}>
              {files.resources.tabs.map(item=><PaneTab key={item.path} icon={<IconFile size={16}/>} label={item.path.split('/').pop()??item.path} active={active==='files'&&item.path===files.resources.active} preview={!item.pinned} title={item.path} onActivate={()=>activateFile(item.path)} onPin={()=>files.pin(item.path)} onClose={()=>files.closeFile(item.path)}/>)}
            </div>;
            const meta=TAB_META[t],Ic=meta.icon;
            const label = t === "browser" ? browserLabel : meta.label;
            return <PaneTab key={t} role="button" icon={<Ic size={16}/>} label={label} active={t===active} title={t === "browser" ? browserLabel : meta.title} onActivate={()=>props.onActivate(t)} onClose={()=>closeTab(t)}/>;
          })}
          {tabs.includes('files')&&!files.resources.tabs.length?<div className="aux__document-tabs" role="tablist" aria-label={tr("文件标签")}/>:null}
        </div></div>
        <PaneMenuButton chevron={false} align="left" title={tr("新增标签")} trigger={<IconPlus size={16}/>} items={addItems} disabled={!addItems.length} onPick={pickAdd}/>
        {expandButton}
        <PaneIconButton className="aux__collapse" aria-label={tr("收起右侧栏")} title={tr("收起右侧栏")} onClick={props.onCollapse}><IconPanelRightClose size={16}/></PaneIconButton>
        {switcher ? (
          <>
            <span className="aux__switcher-overlay" onClick={() => setSwitcher(false)} />
            <div
              className="aux__switcher"
              role="dialog"
              aria-label={tr("搜索标签页")}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setSwitcher(false);
                }
              }}
            >
              <div className="aux__switcher-search"><PaneSearch label={tr("搜索标签页")} autoFocus value={query} placeholder={tr("搜索标签页…")} onChange={event=>setQuery(event.target.value)}/></div>
              <div className="aux__switcher-scroll">
                {openRows.length > 0 || fileRows.length > 0 ? (
                  <div className="aux__switcher-group">
                    <div className="aux__switcher-grouptitle">{tr("打开的标签页")}</div>
                    {fileRows.map(item => <div key={item.path} className="aux__switcher-resource">
                      <button type="button" className="aux__switcher-row" title={item.path} onClick={() => activateFile(item.path)}><IconFile size={16} /><span className="aux__switcher-rowlabel">{item.path.split("/").pop()}</span></button>
                      <button type="button" className="aux__switcher-rowx" aria-label={tr("关闭 ") + item.path.split("/").pop()} onClick={() => files.closeFile(item.path)}><IconX size={12} /></button>
                    </div>)}
                    {openRows.map((t) => row(t, true, openedAt[t]))}
                  </div>
                ) : null}
                {recentRows.length > 0 ? (
                  <div className="aux__switcher-group">
                    <div className="aux__switcher-grouptitle">{tr("最近关闭的标签页")}</div>
                    {recentRows.map((r) => row(r.tab, false, r.at))}
                  </div>
                ) : null}
                {openRows.length === 0 && fileRows.length === 0 && recentRows.length === 0 ? (
                  <p className="aux__switcher-none">{tr("没有匹配的标签页")}</p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </PaneToolbar>
      {active === null ? null : <ViewBoundary key={active} label={TAB_META[active].label}>{TAB_META[active].render({
        files:<FilePane client={client} root={root} files={files}/>,
        review:<ReviewPane runtime={runtime} sessionId={sessionId} git={git} gitBusy={gitBusy} onRefresh={onRefreshGit} source={props.reviewSource} onSource={props.onReviewSource} workspaceRoot={root} onOpenFile={props.onOpenReviewFile}/>,
        agents:<AgentsPane agents={directory} agentFocus={agentFocus} progress={board.subagentProgress} onCancel={props.onCancelAgent}/>,
        browser:<BrowserPane runtime={runtime} shown={props.enabled !== false && props.open} tools={homeTools}/>,
      })}</ViewBoundary>}
    </aside>
  );
}
