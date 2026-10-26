import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { IconArrowLeft, IconArrowRight, IconMessagePlus, IconPanelLeftClose, IconPanelLeftOpen } from "../../ui/icons.tsx";

/** Window controls remain mounted and reachable when the sidebar itself is hidden. */
export function WindowNavigation({ sidebarOpen, canBack, canForward, onBack, onForward, onToggleSidebar, onNewSession, newSessionBusy }: {
  sidebarOpen: boolean; canBack: boolean; canForward: boolean; onBack: () => void; onForward: () => void;
  onToggleSidebar: () => void; onNewSession: () => void; newSessionBusy: boolean;
}) {
  useLocale();
  return <nav className="window-navigation" aria-label={tr("工作区导航")}>
    <div className="window-navigation__buttons">
      <button type="button" className="iconbtn" onClick={onToggleSidebar} aria-label={tr("切换侧边栏")} aria-expanded={sidebarOpen} title={tr("切换侧边栏（⌘B）")}>
        {sidebarOpen ? <IconPanelLeftClose size={16} /> : <IconPanelLeftOpen size={16} />}
      </button>
      <button type="button" className="iconbtn" onClick={onBack} disabled={!canBack} aria-label={tr("后退")} title={tr("后退：沿我看过的会话顺序回溯（历史栈上限 64）")}><IconArrowLeft size={16} /></button>
      <button type="button" className="iconbtn" onClick={onForward} disabled={!canForward} aria-label={tr("前进")} title={tr("前进：回到后退之前的会话")}><IconArrowRight size={16} /></button>
      <button type="button" className="iconbtn" onClick={onNewSession} disabled={newSessionBusy} aria-label={tr("新建任务")} title={tr("新建任务（⌘N）")}><IconMessagePlus size={16} /></button>
    </div>
  </nav>;
}
