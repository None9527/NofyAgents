// 顶栏覆盖层（S3）：左簇=logo(侧栏开关)+历史栈前进后退；右簇=⌄ 窗口菜单。
// zcode 纪律：整条拖拽区，按钮 no-drag；⌄ 菜单 border-l 45px。

import { useState } from "react";
import { useApp } from "../core/store";
import { getDesktop } from "../core/transport";
import { IconButton } from "../ui/primitives";
import { Menu, type MenuEntry } from "../ui/Menu";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconLogo,
  IconPanelRight,
  IconRefresh,
} from "../ui/icons";

export function TopOverlay() {
  const sidebarVisible = useApp((s) => s.sidebarVisible);
  const railVisible = useApp((s) => s.railVisible);
  const toggleSidebar = useApp((s) => s.toggleSidebar);
  const toggleRail = useApp((s) => s.toggleRail);
  const navIdx = useApp((s) => s.navIdx);
  const navLen = useApp((s) => s.nav.length);
  const goBack = useApp((s) => s.goBack);
  const goForward = useApp((s) => s.goForward);
  const refreshFleet = useApp((s) => s.refreshFleet);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const theme = useApp((s) => s.theme);

  const [winOpen, setWinOpen] = useState(false);
  const [winAnchor, setWinAnchor] = useState({ x: 0, y: 0 });

  const desktop = getDesktop();
  const canBack = navIdx > 0;
  const canForward = navIdx < navLen - 1;

  const winItems: MenuEntry[] = [
    { label: "命令面板", hint: "Ctrl+K", onClick: () => useApp.getState().setPaletteOpen(true) },
    { label: "设置", onClick: () => useApp.getState().setSettingsOpen(true) },
    "sep",
    { label: "刷新任务", icon: <IconRefresh size={13} />, onClick: refreshFleet },
    {
      label: theme === "dark" ? "切换亮色主题" : "切换暗色主题",
      onClick: toggleTheme,
    },
  ];
  if (desktop?.isElectron) {
    winItems.push(
      "sep",
      {
        label: "在文件管理器中打开",
        onClick: () =>
          void desktop.termExec?.(`xdg-open '${useApp.getState().workspace}'`),
      },
      { label: "最小化", onClick: () => desktop.minimize?.() },
      { label: "最大化/还原", onClick: () => desktop.toggleMaximize?.() },
      { label: "关闭窗口", danger: true, onClick: () => desktop.close?.() },
    );
  }

  return (
    <header className="shell-topbar" data-slot="topbar">
      <div className="shell-topbar__cluster">
        <IconButton
          label={sidebarVisible ? "隐藏侧栏" : "显示侧栏"}
          active={sidebarVisible}
          onClick={toggleSidebar}
        >
          <IconLogo size={17} />
        </IconButton>
        <IconButton label="后退 (Alt+←)" disabled={!canBack} onClick={goBack}>
          <IconChevronLeft size={16} />
        </IconButton>
        <IconButton label="前进 (Alt+→)" disabled={!canForward} onClick={goForward}>
          <IconChevronRight size={16} />
        </IconButton>
      </div>
      <div className="shell-topbar__cluster">
        <IconButton
          label={railVisible ? "收起注意力轨" : "展开注意力轨（S6）"}
          active={railVisible}
          onClick={toggleRail}
        >
          <IconPanelRight size={16} />
        </IconButton>
        <button
          className="win-menu-btn"
          data-slot="window-menu"
          aria-label="窗口菜单"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setWinAnchor({ x: r.right - 200, y: r.bottom + 6 });
            setWinOpen((v) => !v);
          }}
        >
          <IconChevronDown size={15} />
        </button>
      </div>
      <Menu open={winOpen} onClose={() => setWinOpen(false)} anchor={winAnchor} items={winItems} />
    </header>
  );
}
