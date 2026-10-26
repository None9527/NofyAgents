import { AnchoredPopover } from "../../ui/anchoredPopover.tsx";
import { taskOverviewLayout } from "../../ui/taskOverviewLayout.ts";
import type { CSSProperties,RefObject,Dispatch,ReactNode,SetStateAction } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFlagMotion, useSidebarMotion } from "../../ui/useSidebarMotion.ts";
import { SideSheet } from "../../ui/sideSheet.tsx";
import { useElementWidth } from "../../ui/useElementWidth.ts";
import { resolveDockHeight, resolveWindowLayout, resolveWorkArea } from "../../ui/windowLayout.ts";
import { tr } from "../../ui/i18n.ts";
import type { LayoutPrefs } from "../../ui/prefs.ts";
import { AUX_WIDTH_DEFAULT,AUX_WIDTH_MAX,AUX_WIDTH_MIN,SIDEBAR_WIDTH_DEFAULT,SIDEBAR_WIDTH_MAX,SIDEBAR_WIDTH_MIN } from "../../ui/prefs.ts";
/** Layout slots have no protocol or session ownership. Terminal lifecycle stays in its owner. */
export function ShellLayout({ layout, setLayout, platform, active=true, navigation, sidebar, header, conversation, auxiliary, bottomDock, overlays, overview }: {
  overview?: { open: boolean; pinned: boolean; anchor: RefObject<HTMLElement | null>; avoid: RefObject<HTMLElement | null>; content: ReactNode; onClose: () => void };
  layout: LayoutPrefs; setLayout: Dispatch<SetStateAction<LayoutPrefs>>; platform?: string; active?:boolean;
  navigation: ReactNode; sidebar: ReactNode; header: ReactNode; conversation: ReactNode; auxiliary: ReactNode; bottomDock?: (height:number)=>ReactNode; overlays: ReactNode;
}) {
  const motion = useSidebarMotion(layout.sidebarOpen, layout.sidebarWidth);
  const [sidebarDragging, setSidebarDragging] = useState(false);
  const [auxDragging, setAuxDragging] = useState(false);
  const shell = useElementWidth<HTMLDivElement>();
  const windowGeometry = resolveWindowLayout(shell.width, layout);
  useEffect(() => {
    if (windowGeometry.sidebarShouldFold) {
      setLayout(value => ({ ...value, sidebarOpen:false, sidebarWidth:Math.min(value.sidebarWidth, SIDEBAR_WIDTH_DEFAULT) }));
    }
  }, [shell.width, layout.sidebarOpen, layout.sidebarWidth, setLayout]);
  const body = useElementWidth<HTMLDivElement>();
  const pane = resolveWorkArea(body.width, layout.auxWidth, layout.auxSizing ?? (layout.auxWidth === AUX_WIDTH_DEFAULT ? "auto" : "fixed"));
  const split = pane.mode === "split";
  const expandedSplit = !!layout.auxExpanded && split;
  const expandMotion = useFlagMotion(expandedSplit);
  const targetWidth = layout.auxOpen && expandedSplit ? body.width : pane.width;
  const auxMotion = useSidebarMotion(layout.auxOpen && split, targetWidth);
  const widthMoving = auxMotion.moving || (layout.auxOpen && split && expandMotion.moving);
  const auxPresented = layout.auxOpen || auxMotion.moving;
  const splitSheet = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = splitSheet.current;
    if (!node) return;
    if (auxPresented) node.setAttribute("open", "");
    else node.removeAttribute("open");
  }, [auxPresented, split]);
  const summary = taskOverviewLayout(body.width - (layout.auxOpen && split ? (expandedSplit ? body.width : pane.width) + 1 : 0), overview?.pinned ?? false);
  const summaryInline = !!overview?.open && overview.pinned && summary.mode !== "overlay";
  const sidebarDrag = useRef<{ x: number; width: number } | null>(null);
  const auxDrag = useRef<{ x: number; width: number } | null>(null);
  const releaseAux = (event: { currentTarget: HTMLDivElement; pointerId: number }) => {
    setAuxDragging(false);
    auxDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <div ref={shell.ref} data-sidebar-motion={motion.moving} data-sidebar-dragging={sidebarDragging} data-aux-motion={split && widthMoving} data-aux-dragging={auxDragging} className={"shell" + (layout.sidebarOpen ? "" : " shell--sidebar-closed") + (split && !layout.auxOpen ? " shell--aux-closed" : "") + (layout.auxOpen && expandedSplit ? " shell--aux-expanded" : "") + (expandedSplit ? " shell--aux-reflow" : "")} style={{ "--workspace-sidebar-panel-width": Math.round(layout.sidebarWidth) + "px", "--aux-panel-width": Math.round(layout.auxWidth) + "px", "--sidebar-motion-duration": motion.duration + "ms", "--aux-motion-duration": auxMotion.duration + "ms", "--aux-width-duration": (split && widthMoving ? auxMotion.duration : 0) + "ms", "--topbar-inset": platform === "darwin" ? "6rem" : "0px" } as CSSProperties}>
    <div className="sidebar-slot" data-shell-slot="navigation" inert={!layout.sidebarOpen} aria-hidden={!layout.sidebarOpen} style={{ "--sidebar-content-width": motion.contentWidth + "px" } as CSSProperties}>{sidebar}</div>
    <div className="shell__handle" title={tr("拖拽调整侧栏宽度 · 双击恢复默认")}
      onPointerDown={event => { event.preventDefault(); setSidebarDragging(true); event.currentTarget.setPointerCapture(event.pointerId); sidebarDrag.current = { x: event.clientX, width: layout.sidebarWidth }; }}
      onPointerMove={event => { const from = sidebarDrag.current; if (!from) return; const width = from.width + event.clientX - from.x; if (width < SIDEBAR_WIDTH_MIN) { sidebarDrag.current = null; setSidebarDragging(false); setLayout(value => ({ ...value, sidebarOpen:false, sidebarWidth:SIDEBAR_WIDTH_MIN })); } else setLayout(value => ({ ...value, sidebarWidth:Math.min(SIDEBAR_WIDTH_MAX, width) })); }}
      onPointerUp={event => { setSidebarDragging(false); sidebarDrag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onLostPointerCapture={() => { setSidebarDragging(false); sidebarDrag.current = null; }}
      onDoubleClick={() => setLayout(value => ({ ...value, sidebarWidth: SIDEBAR_WIDTH_DEFAULT }))} />
    <div className="workbench" ref={body.ref} data-pane-mode={layout.auxOpen ? pane.mode : "closed"}><main className="shell__main" data-shell-slot="main" inert={layout.auxOpen && expandedSplit} aria-hidden={layout.auxOpen && expandedSplit} data-compact={body.width-(layout.auxOpen&&split&&!expandedSplit?pane.width+1:0)<420}><section className="card">{header}<div className="card__body" data-overview-mode={summaryInline ? summary.mode : "closed"} style={{ paddingRight: summaryInline ? summary.inset : 0 }}><div className="card__conversation">{conversation}</div>{summaryInline && <aside className="task-overview-inline" aria-label={tr("任务概览")}>{overview?.content}</aside>}</div><div className="shell__dock-slot" data-shell-slot="bottom-tools">{bottomDock?.(resolveDockHeight(shell.height,layout.dockHeight))}</div></section></main>
      {split ? <>
        <div className="aux__handle" title={tr("拖拽调整侧边面板宽度 · 双击恢复默认")}
          onPointerDown={event => { setAuxDragging(true); event.currentTarget.setPointerCapture(event.pointerId); auxDrag.current = { x: event.clientX, width: pane.width }; }}
          onPointerMove={event => { const from = auxDrag.current; if (from) setLayout(value => ({ ...value, auxSizing:"fixed", auxWidth: Math.min(AUX_WIDTH_MAX, Math.max(AUX_WIDTH_MIN, from.width - event.clientX + from.x)) })); }}
          onPointerUp={releaseAux}
          onLostPointerCapture={() => { setAuxDragging(false); auxDrag.current = null; }}
          onDoubleClick={() => setLayout(value => ({ ...value, auxWidth: AUX_WIDTH_DEFAULT, auxSizing:"auto" }))} />
        <div ref={splitSheet} className="side-sheet side-sheet--split" role="complementary" aria-label={tr("侧边面板")} aria-hidden={!layout.auxOpen} inert={!layout.auxOpen} style={{ "--side-sheet-width": pane.width + "px", "--aux-content-width": auxMotion.contentWidth + "px" } as CSSProperties}>
          {auxPresented ? auxiliary : null}
        </div>
      </> : layout.auxOpen ? <SideSheet active={active} mode="sheet" expanded={!!layout.auxExpanded} width={pane.width} label={tr("侧边面板")} onClose={() => setLayout(value => ({ ...value, auxOpen: false }))}>{auxiliary}</SideSheet> : null}
    </div>{active && overview?.open && !summaryInline && <AnchoredPopover anchor={overview.anchor} avoid={overview.avoid} up={false} focusOnOpen className="task-overview-popover" label={tr("任务概览")} onClose={overview.onClose}>{overview.content}</AnchoredPopover>}{navigation}{overlays}
  </div>;
}
