// Top chrome forked from the restored ZCode source (styles-CdEGpc2x.jsx):
//  - BOt: an absolute, pointer-transparent overlay at the top-left whose width
//    tracks the sidebar; left cluster = [logo (hover morphs into the sidebar
//    toggle icon), task back, task forward, animated new-task button].
//  - Right cluster (home `Mr` branch / TFt header): [H6 terminal toggle]
//    [side-pane toggle] [S6 windows-caption menu button with border-l] and
//    the window controls. No panel icons live in the top bar itself.
import { useState } from "react";
import { useI18n } from "../lib/i18n";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconClose,
  IconMaximize,
  IconMinimize,
  IconPanel,
  IconPlusCircle,
  IconTerminal,
} from "../icons";

interface OverlayProps {
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  onNewTask: () => void;
  onBack: () => void;
  onForward: () => void;
  canBack: boolean;
  canForward: boolean;
}

export function TopOverlay({
  sidebarVisible,
  onToggleSidebar,
  onNewTask,
  onBack,
  onForward,
  canBack,
  canForward,
}: OverlayProps) {
  const { tr } = useI18n();
  return (
    <div className="top-overlay" style={sidebarVisible ? { width: "var(--sidebar-w)" } : undefined}>
      <span className="tb-left">
        <span className="tb-icon-btn" title={`${tr("toggleSidebar")} (Ctrl+B)`} onClick={onToggleSidebar}>
          <span className="tb-logo">G</span>
          <IconPanel width={14} height={14} className="tb-logo-hover" />
        </span>
        <span className="tb-icon-btn" title={tr("back")} onClick={onBack} data-disabled={!canBack}>
          <IconArrowLeft width={14} height={14} />
        </span>
        <span className="tb-icon-btn" title={tr("forward")} onClick={onForward} data-disabled={!canForward}>
          <IconArrowRight width={14} height={14} />
        </span>
        <span className={`tb-newtask ${sidebarVisible ? "hidden" : ""}`}>
          <span className="tb-icon-btn" title={`${tr("newTask")} (Ctrl+N)`} onClick={onNewTask}>
            <IconPlusCircle width={14} height={14} />
          </span>
        </span>
      </span>
    </div>
  );
}

interface CaptionProps {
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  showSidePaneToggle: boolean;
  sidePaneOpen: boolean;
  onToggleSidePane: () => void;
  onNewTask: () => void;
  onOpenWorkspace: () => void;
  onToast: (msg: string) => void;
  cwd?: string;
}

export function CaptionRight({
  terminalOpen,
  onToggleTerminal,
  showSidePaneToggle,
  sidePaneOpen,
  onToggleSidePane,
  onNewTask,
  onOpenWorkspace,
  onToast,
  cwd,
}: CaptionProps) {
  const { tr } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = typeof window !== "undefined" && Boolean(window.grokDesktop);
  const openInFileManager = () => {
    if (isDesktop && cwd && window.grokDesktop?.termExec) {
      void window.grokDesktop.termExec(`xdg-open '${cwd}'`).catch(() => onToast(tr("menuOpenInFileManager")));
    } else {
      onToast(`Web 版暂不支持${tr("menuOpenInFileManager")}`);
    }
  };
  const item = (label: string, fn: () => void, shortcut?: string) => (
    <button
      className="cap-menu-item"
      key={label}
      onClick={() => {
        setMenuOpen(false);
        fn();
      }}
    >
      <span>{label}</span>
      {shortcut && <span className="cap-menu-shortcut">{shortcut}</span>}
    </button>
  );
  const sep = <div className="cap-menu-sep" />;
  const soon = (label: string) => () => onToast(`${label}: web 版暂不支持`);
  return (
    <div className="caption-right">
      <button
        className={`cap-btn ${terminalOpen ? "active" : ""}`}
        title={`${tr("terminalToggle")} (Ctrl+J)`}
        onClick={onToggleTerminal}
      >
        <IconTerminal width={15} height={15} />
      </button>
      {showSidePaneToggle && (
        <button
          className={`cap-btn ${sidePaneOpen ? "active" : ""}`}
          title={sidePaneOpen ? tr("sidePaneCollapse") : tr("sidePaneExpand")}
          onClick={onToggleSidePane}
        >
          <IconPanel width={15} height={15} />
        </button>
      )}
      <div className="cap-menu-wrap">
        <button
          className={`cap-btn cap-menu-trigger ${menuOpen ? "active" : ""}`}
          title={tr("windowMenu")}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <IconChevronDown width={15} height={15} />
        </button>
        {menuOpen && (
          <>
            <div className="cap-menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="cap-menu">
              {item(tr("menuNewTask"), onNewTask, "Ctrl+N")}
              {item(tr("menuOpenWorkspace"), onOpenWorkspace, "Ctrl+O")}
              {item(tr("menuOpenInFileManager"), openInFileManager)}
              {sep}
              {item(tr("menuAbout"), () => onToast("Grok Build · UI forked from ZCode 3.7.6"))}
              {sep}
              {item(tr("menuFeedback"), soon(tr("menuFeedback")))}
              {item(tr("menuCommunity"), soon(tr("menuCommunity")))}
              {item(tr("menuDocs"), soon(tr("menuDocs")))}
              {item(tr("menuExportLogs"), soon(tr("menuExportLogs")))}
              {sep}
              {item(tr("menuCloseWindow"), () => window.grokDesktop?.close() ?? window.close())}
            </div>
          </>
        )}
      </div>
      {isDesktop && (
        <>
          <button className="win-btn" title={tr("winMinimize")} onClick={() => window.grokDesktop?.minimize()}>
            <IconMinimize width={14} height={14} />
          </button>
          <button className="win-btn" title={tr("winMaximize")} onClick={() => window.grokDesktop?.toggleMaximize()}>
            <IconMaximize width={13} height={13} />
          </button>
          <button
            className="win-btn win-close"
            title={tr("menuCloseWindow")}
            onClick={() => window.grokDesktop?.close()}
          >
            <IconClose width={14} height={14} />
          </button>
        </>
      )}
    </div>
  );
}

declare global {
  interface Window {
    /** Phase 2: Electron preload exposes window controls + OS capabilities. */
    grokDesktop?: {
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
      toggleFullscreen: () => void;
      getState: () => Promise<{ maximized: boolean; fullscreen: boolean }>;
      isElectron: boolean;
      fsList: (dir: string) => Promise<Array<{ name: string; isDir: boolean }> | { error: string }>;
      fsRead: (file: string) => Promise<{ content: string | null; error: string }>;
      termExec: (command: string, cwd?: string) => Promise<{ output: string }>;
      selectDirectory: () => Promise<string | null>;
    };
  }
}
