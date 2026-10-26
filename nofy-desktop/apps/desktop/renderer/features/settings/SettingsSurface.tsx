import { useEffect,useMemo,useState } from "react";
import { createPortal } from "react-dom";
import type { BootstrapInfo } from "../../../preload/contract.ts";
import { useSettingsResource } from "../../application/settings/public.ts";
import type { Runtime } from "../../core/runtime.ts";
import { loadFontSize } from "../../ui/appearancePrefs.ts";
import { tr } from "../../ui/i18n.ts";
import {
IconArrowLeft,
IconRefresh
} from "../../ui/icons.tsx";
import {
readMarketplace,
readMcpServers,
readPlugins,
readSkills,
} from "../../ui/readers.ts";
import { recordRender } from "../../ui/renderDiagnostics.ts";
import type { ThemeName } from "../../ui/theme.ts";
import type { UsageEntry } from "../../ui/usageLedger.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { SECTION_REGISTRY } from "./sectionRegistry.tsx";
import { useSettingsExit } from "./SettingsExitGuard.tsx";
import type { SettingsSectionId } from "./settingsModel.ts";
import {
sectionLabel,
SETTINGS_GROUPS
} from "./settingsModel.ts";

export type SettingsSurfaceProps = {
  runtime: Runtime;
  boot: BootstrapInfo | null;
  sessionId: string | null;
  workspaceCwd?: string;
  /** 内核 mcp 事件投影（state.mcpServers）引用变化 ⇒ MCP 分区活刷新。 */
  mcpTick: unknown;
  section: SettingsSectionId;
  onSection: (id: SettingsSectionId) => void;
  onClose: () => void;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  agentVersion: string | null;
  /** 本机用量账本（App 持有并在追加后刷新引用）。 */
  usageEntries: UsageEntry[];
  /** 设置目录挂在窗口左侧栏，不占中栏。 */
  navHost: HTMLElement | null;
};

export function SettingsSurface(props: SettingsSurfaceProps) {
  recordRender("SettingsSurface");
  const locale = useLocale();
  const { runtime, boot, sessionId, mcpTick, section, onSection, onClose, theme, onTheme, agentVersion } = props;
  const { usageEntries } = props;
  const [tick, setTick] = useState(0);
  const [fontSize, setFontSize] = useState(loadFontSize);
  const cwd = props.workspaceCwd ?? boot?.cwd ?? null;
  const leave = useSettingsExit();
  const { navHost } = props;
  useEffect(() => { navHost?.querySelector<HTMLButtonElement>(".set__back")?.focus(); }, [navHost]);
  const pluginQuery = useSettingsResource(runtime, "plugins", sessionId, null, section === "plugins", tick);
  const marketQuery = useSettingsResource(runtime, "market", null, null, section === "plugins", tick);
  const skillQuery = useSettingsResource(runtime, "skills", null, cwd, section === "skills", tick);
  const mcpQuery = useSettingsResource(runtime, "mcp", sessionId, null, section === "mcp", mcpTick);
  const plugins = useMemo(() => pluginQuery.data === null ? null : readPlugins(pluginQuery.data), [pluginQuery.data]);
  const market = useMemo(() => marketQuery.data === null ? null : readMarketplace(marketQuery.data), [marketQuery.data]);
  const skills = useMemo(() => skillQuery.data === null ? null : readSkills(skillQuery.data), [skillQuery.data]);
  const mcp = useMemo(() => mcpQuery.data === null ? null : readMcpServers(mcpQuery.data), [mcpQuery.data]);
  const SectionContent = SECTION_REGISTRY[section].render;
  const refresh = () => { setTick(t => t + 1); if (section === "mcp") void mcpQuery.refresh(); };
  const errOf = (key: string): string | null => ({ plugins: pluginQuery.error, market: marketQuery.error, skills: skillQuery.error, mcp: mcpQuery.error }[key] ?? null);

  const nav = (
      <div className="set__nav">
        <div className="sidebar__drag" />
        <div className="set__backwrap">
          <button type="button" className="set__back" onClick={() => leave(onClose)} title={tr("返回工作区")}>
            <IconArrowLeft size={16} />
            <span>{tr("返回工作区")}</span>
          </button>
        </div>
        <nav className="set__groups" aria-label={tr("设置分区")}>
          {SETTINGS_GROUPS.map((g) => (
            <div className="set__group" key={g.id}>
              <div className="set__grouptitle">{g.label}</div>
              {g.sections.map((s) => {
                const Ic = SECTION_REGISTRY[s.id].icon;
                const on = s.id === section;
                return (
                  <button
                    type="button"
                    key={s.id}
                    className={"set__item" + (on ? " set__item--on" : "")}
                    aria-current={on ? "page" : undefined}
                    onClick={() => { if (s.id !== section) leave(() => onSection(s.id)); }}
                  >
                    <Ic size={16} />
                    <span className="set__itemlabel">{s.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="set__navfoot">{tr("nofy-desktop · 内核")}{agentVersion ?? "…"}</div>
      </div>
  );
  return (
    <>
      {navHost ? createPortal(nav, navHost) : null}
      <section className="set__main">
        <div className="set__dragstrip" />
        <div className="set__card">
          <div className="set__headdrag" />
          <main className="set__scroll">
            <div className="set__content">
              <div className="set__titlebar">
                <h2 className="set__title">{sectionLabel(section)}</h2>
                <button type="button" className="iconbtn iconbtn--sm" onClick={refresh} title={tr("重新读取")} aria-label={tr("重新读取")}>
                  <IconRefresh size={14} />
                </button>
              </div>

              <SectionContent {...props} locale={locale} fontSize={fontSize} setFontSize={setFontSize} cwd={cwd} tick={tick} refresh={refresh} errOf={errOf} plugins={plugins} market={market} skills={skills} mcp={mcp} />
            </div>
          </main>
        </div>
      </section>
    </>
  );
}
