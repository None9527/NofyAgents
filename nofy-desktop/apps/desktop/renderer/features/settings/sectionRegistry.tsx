import { saveFontSize, FONT_SIZES } from "../../ui/appearancePrefs.ts";
import { tr } from "../../ui/i18n.ts";
import { GeneralSettings } from "./GeneralSettings.tsx";
import type { Locale } from "../../ui/i18n.ts";
import {
IconBlocks,
IconChart,
IconGear,
IconHook,
IconMonitorCog,
IconPalette,
IconSpark
} from "../../ui/icons.tsx";
import { THEMES } from "../../ui/theme.ts";
import type {
MarketplaceSourceRow,
McpServerRow,
PluginRow,
SkillRow,
} from "../../ui/readers.ts";
import { dayKey } from "../../ui/usageLedger.ts";
import { BundleSettings } from "./BundleSettings.tsx";
import { HookSettings } from "./HookSettings.tsx";
import { McpSettings } from "./McpSettings.tsx";
import { ModelSettings } from "./ModelSettings.tsx";
import { PluginSettings } from "./PluginSettings.tsx";
import { ProviderSettings } from "./ProviderSettings.tsx";
import type { SettingsSectionId } from "./settingsModel.ts";
import {
ACCEPTED_SETTINGS_METHODS,
mcpStatusView,
SETTINGS_METHODS,
settingsWriteShown
} from "./settingsModel.ts";
import { UsageDashboard } from "./UsageDashboard.tsx";

import { useProjection, selectConnection } from "../../application/projection/public.ts";
import { settingsClientFor, useSettingsMutation } from "../../application/settings/public.ts";
import { Btn } from "../../ui/primitives.tsx";
import type { SettingsSurfaceProps } from "./SettingsSurface.tsx";
export type SectionProps = SettingsSurfaceProps & { locale: Locale; fontSize: number; setFontSize: (size: number) => void; cwd: string | null; tick: number; refresh: () => void; errOf: (key: string) => string | null; plugins: PluginRow[] | null; market: MarketplaceSourceRow[] | null; skills: SkillRow[] | null; mcp: McpServerRow[] | null };
const DOT_VARIANT: Record<"ok" | "busy" | "bad" | "off", string> = { ok: "completed", busy: "working", bad: "needs-input", off: "dead" };
function GeneralSection(props: SectionProps) {
  return <GeneralSettings locale={props.locale} />;
}
function AppearanceSection(props: SectionProps) {
  const { theme, onTheme, fontSize, setFontSize } = props;
  const pickFont = (size: number) => { saveFontSize(size); setFontSize(size); };
  return (<>
    <section className="set__block">
      <h3 className="set__subhead">{tr("主题")}</h3>
      <div className="set__themes" role="group" aria-label={tr("主题")}>
        {THEMES.map((item) => (
          <button key={item.id} type="button" className={"set__themebtn" + (theme === item.id ? " set__themebtn--on" : "")} aria-pressed={theme === item.id} onClick={() => onTheme(item.id)}>{item.label}</button>
        ))}
      </div>
    </section>
    <section className="set__block">
      <h3 className="set__subhead">{tr("界面字号")}</h3>
      <div className="set__themes" role="group" aria-label={tr("界面字号")}>
        {FONT_SIZES.map((size) => (
          <button key={size} type="button" className={"set__themebtn" + (fontSize === size ? " set__themebtn--on" : "")} aria-pressed={fontSize === size} onClick={() => pickFont(size)}>{String(size)}</button>
        ))}
      </div>
    </section>
  </>);
}
function ModelsSection(props: SectionProps) {
  const { runtime, sessionId, theme, onTheme, agentVersion, usageEntries, locale, fontSize, setFontSize, cwd, tick, refresh, errOf, plugins, market, skills, mcp } = props;
  return (<><ProviderSettings runtime={runtime} tick={tick} /><details className="settings-advanced"><summary>{tr("应用认证")}</summary><ModelSettings runtime={runtime} tick={tick} /></details></>);
}
function PluginsSection(props: SectionProps) {
  const { runtime, sessionId, theme, onTheme, agentVersion, usageEntries, locale, fontSize, setFontSize, cwd, tick, refresh, errOf, plugins, market, skills, mcp } = props;
  return (<><PluginSettings runtime={runtime} sessionId={sessionId} plugins={plugins} market={market} onRefresh={refresh}/>{errOf("plugins")?<p className="set__error" role="alert">{errOf("plugins")}</p>:null}{errOf("market")?<p className="set__error" role="alert">{errOf("market")}</p>:null}</>);
}
function SkillsSection(props: SectionProps) {
  const { runtime, sessionId, cwd, tick, refresh, errOf, skills } = props;
  const connection = useProjection(runtime.store, selectConnection);
  const identity = JSON.stringify([cwd, connection.transportEpoch]);
  const mutation = useSettingsMutation(identity, () => JSON.stringify([cwd, runtime.store.getState().connection.transportEpoch]));
  const disabled = mutation.busy || cwd === null || connection.status !== "ready";
  const canToggle = settingsWriteShown(SETTINGS_METHODS.skillsToggle, ACCEPTED_SETTINGS_METHODS);
  const toggle = (name: string, enabled: boolean) => {
    if (cwd === null) return;
    void mutation.run(() => settingsClientFor(runtime).catalog.toggleSkill(name, enabled, cwd), (result) => {
      if (result.kind !== "success") return;
      refresh();
    });
  };
  return (<><BundleSettings runtime={runtime} tick={tick}/><section className="set__block">
                  <h3 className="set__subhead">{tr("技能")}{skills !== null ? " " + String(skills.length) + tr(" 个") : ""}</h3>
                  {mutation.notice !== "" ? <p className="set__error" role="alert">{mutation.notice}</p> : null}
                  {errOf("skills") !== null ? (
                    <p className="set__error">{tr("读取失败：")}{errOf("skills")}</p>
                  ) : cwd === null ? (
                    <div className="emptyboard">
                      <IconSpark className="emptyboard-icon" />
                      <p className="emptyboard-hint">{tr("工作区还没就绪。")}</p>
                    </div>
                  ) : skills === null ? (
                    <p className="set__loading">{tr("读取中…")}</p>
                  ) : skills.length === 0 ? (
                    <div className="emptyboard">
                      <IconSpark className="emptyboard-icon" />
                      <p className="emptyboard-hint">{tr("这个工作区还没发现技能。")}</p>
                    </div>
                  ) : (
                    <div className="set__rows">
                      {skills.map((s) => (
                        <div className="set__row" key={s.path || s.name}>
                          <span className={"dot" + (s.enabled ? " dot--completed" : "")} title={s.enabled ? tr("已启用") : tr("已停用")} />
                          <div className="set__rowmain">
                            <span className="set__rowname">{s.name}</span>
                            <span className="set__rowdesc" title={s.description}>
                              {s.scope}
                              {s.userInvocable ? tr(" · 可手动调用") : ""}
                              {s.description !== "" ? " · " + s.description : ""}
                              {s.path ? " · " + s.path : ""}
                            </span>
                          </div>
                          {canToggle ? <Btn disabled={disabled} onClick={() => toggle(s.name, !s.enabled)}>{s.enabled ? tr("停用") : tr("启用")}</Btn> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section></>);
}
function McpSection(props: SectionProps) {
  const { runtime, sessionId, theme, onTheme, agentVersion, usageEntries, locale, fontSize, setFontSize, cwd, tick, refresh, errOf, plugins, market, skills, mcp } = props;
  return (<><McpSettings runtime={runtime} sessionId={sessionId} servers={mcp} onRefresh={refresh}/><section className="set__block">
                  <h3 className="set__subhead">{tr("MCP 服务")}{mcp !== null ? " " + String(mcp.length) + tr(" 个") : ""}</h3>
                  {errOf("mcp") !== null ? (
                    <p className="set__error">{tr("读取失败：")}{errOf("mcp")}</p>
                  ) : sessionId === null ? (
                    <div className="emptyboard">
                      <IconMonitorCog className="emptyboard-icon" />
                      <p className="emptyboard-hint">{tr("还没有会话，MCP 清单读不出来。")}</p>
                    </div>
                  ) : mcp === null ? (
                    <p className="set__loading">{tr("读取中…")}</p>
                  ) : mcp.length === 0 ? (
                    <div className="emptyboard">
                      <IconMonitorCog className="emptyboard-icon" />
                      <p className="emptyboard-hint">{tr("这个会话还没挂 MCP 服务。")}</p>
                    </div>
                  ) : (
                    <div className="set__rows">
                      {mcp.map((sv) => {
                        const st = mcpStatusView(sv.status, sv.enabled);
                        return (
                          <details className="set__row set__row--exp" key={sv.name}>
                            <summary className="set__rowsum">
                              <span className={"dot dot--" + DOT_VARIANT[st.tone]} title={st.label} />
                              <div className="set__rowmain">
                                <span className="set__rowname">{sv.name}</span>
                                <span className="set__rowdesc">
                                  {sv.source ?? tr("来源未知")} · {st.label} · {String(sv.toolCount)}{tr("工具")}{sv.configSource !== null ? " · " + sv.configSource : ""}
                                </span>
                              </div>
                            </summary>
                            {sv.tools.length > 0 ? (
                              <ul className="set__tools">
                                {sv.tools.map((t) => (
                                  <li key={t.name} title={t.description ?? undefined}>
                                    {t.name}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </details>
                        );
                      })}
                    </div>
                  )}
                </section></>);
}
function HooksSection(props: SectionProps) {
  const { runtime, sessionId, tick } = props;
  return <HookSettings runtime={runtime} sessionId={sessionId} tick={tick} />;
}
function UsageSection(props: SectionProps) {
  const { runtime, sessionId, theme, onTheme, agentVersion, usageEntries, locale, fontSize, setFontSize, cwd, tick, refresh, errOf, plugins, market, skills, mcp } = props;
  return (<>
                  <UsageDashboard entries={usageEntries} todayKey={dayKey(new Date())} />
                </>);
}
export const SECTION_REGISTRY = {
  general: { icon: IconGear, render: GeneralSection },
  appearance: { icon: IconPalette, render: AppearanceSection },
  models: { icon: IconSpark, render: ModelsSection },
  plugins: { icon: IconBlocks, render: PluginsSection },
  skills: { icon: IconSpark, render: SkillsSection },
  mcp: { icon: IconMonitorCog, render: McpSection },
  hooks: { icon: IconHook, render: HooksSection },
  usage: { icon: IconChart, render: UsageSection },
} satisfies Record<SettingsSectionId, { icon: typeof IconSpark; render: (props: SectionProps) => import("react").ReactNode }>;
