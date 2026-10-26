import { panelCommands } from "./panelRegistry.tsx";
import { tr } from "../../ui/i18n.ts";
import type { LayoutPrefs } from "../../ui/prefs.ts";
import type { ThemeName } from "../../ui/theme.ts";
import { THEMES } from "../../ui/theme.ts";
import type { SettingsSectionId } from "../settings/public.ts";
import type { AuxTab } from "./AuxPane.tsx";
import type { PaletteAction } from "./palette.ts";
export function windowActions({ theme, layout, ready, hasSession, workspace, newSession, openWorkspace, toggleSidebar, toggleAux, toggleTerminal, openAuxTab, setTheme, setSettingsSection, openPermission }: {
  theme: ThemeName; layout: LayoutPrefs; ready: boolean; hasSession: boolean; workspace: { busy: boolean }; newSession: () => void; openWorkspace: () => Promise<void>;
  toggleSidebar: () => void; toggleAux: () => void; toggleTerminal: () => void; openAuxTab: (tab: AuxTab) => void; setTheme: (theme: ThemeName) => void; setSettingsSection: (section: SettingsSectionId) => void; openPermission: () => void;
}): PaletteAction[] {
  const auxOpen = layout.auxOpen;
    // 四个主题（dark/light/zai-dark/zai-light）循环，标题写明**目标**主题
    const at = THEMES.findIndex((t) => t.id === theme);
    const next = THEMES[(at + 1) % THEMES.length] ?? THEMES[0]!;
    return [
      {
        id: "new-session", section: "suggested", title: tr("新建会话"), icon: "plus", shortcut: "⌘N",
        keywords: ["new", "session", "task", tr("新建"), tr("新任务"), tr("会话")], run: newSession,
      },
      {
        id: "open-workspace", section: "suggested", title: tr("打开工作区…"), icon: "folder", shortcut: "⌘O",
        keywords: ["open", "workspace", "folder", "project", tr("打开"), tr("文件夹"), tr("项目")],
        disabled: workspace.busy, run: () => { void openWorkspace(); },
      },
      {
        id: "toggle-sidebar", section: "panels", title: layout.sidebarOpen ? tr("收起侧栏") : tr("展开侧栏"),
        icon: "panel", shortcut: "⌘B", keywords: ["sidebar", tr("侧栏"), tr("侧边栏"), tr("切换侧栏")], run: toggleSidebar,
      },
      {
        id: "toggle-aux", section: "panels", title: auxOpen ? tr("收起侧边面板") : tr("展开侧边面板"),
        icon: "panel", shortcut: "⌘⌥B",
        keywords: ["pane", "panel", "aux", tr("辅助"), tr("右栏"), tr("侧边面板")], run: toggleAux,
      },
      ...panelCommands(openAuxTab),
      {
        id: "terminal-pane", section: "panels",
        title: layout.dockOpen ? tr("收起终端面板") : tr("展开终端面板"), icon: "terminal", shortcut: "⌘J",
        keywords: ["terminal", "shell", "console", "pty", tr("终端")],
        // ⌘J 是**我们自己**的绑定（活壳的终端开关键位未实测，不冒充抄来的）；
        // hotkeys-help.ts 与 App 的 hotkeyMap 由 test/hotkeys-help.test.ts 双向对账。
        run: toggleTerminal,
      },
      {
        id: "switch-theme", section: "configure", title: tr("切换到「") + next.label + tr("」主题"), icon: "palette",
        keywords: ["theme", "dark", "light", tr("主题"), tr("深色"), tr("浅色")], run: () => setTheme(next.id),
      },
      {
        id: "settings", section: "configure", title: tr("设置…"), icon: "gear",
        keywords: ["settings", "preferences", tr("配置"), tr("设置")],
        run: () => setSettingsSection("models"),
      },
      {
        id: "ecosystem", section: "configure", title: tr("技能 / 插件 / 市场…"), icon: "boxes",
        keywords: ["skills", "plugins", "marketplace", tr("技能"), tr("插件"), tr("市场")],
        run: () => setSettingsSection("plugins"),
      },
      {
        id: "mcp", section: "configure", title: tr("MCP 服务器…"), icon: "boxes",
        keywords: ["mcp", "server", "servers", tr("服务器")],
        run: () => setSettingsSection("mcp"),
      },
      {
        id: "permission-mode", section: "configure", title: tr("权限模式…"), icon: "shield",
        keywords: ["permission", "mode", "yolo", tr("权限"), tr("模式")],
        disabled: !hasSession || !ready, run: () => openPermission(),
      },
      {
        id: "usage", section: "app", title: tr("用量明细…"), icon: "clock",
        keywords: ["usage", "tokens", "stats", tr("用量"), tr("统计")],
        run: () => setSettingsSection("usage"),
          },
    ];
}
