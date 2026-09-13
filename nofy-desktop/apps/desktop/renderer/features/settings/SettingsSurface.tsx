/**
 * 设置面（阶段 C UI 批）。形态照逆向树 modules/Settings.tsx 的壳层语法：
 * 左段玻璃导航（拖拽条 + 返回工作区 + 分组分区按钮）＋右段圆角卡（拖拽条 +
 * 标题行 + 内容滚动区 max-w-4xl）。度量逐条对表（h-8 分区行 / rounded-xl /
 * px-2.5 / 组标题 text-ui-sm subtlest / 内容 gap-8 pb-8）。
 *
 * 只读纪律：安装/卸载/启停写路径未实测 ⇒ 灰按钮 + title 写明缺什么。
 * 数据走 core/effects.ts 的 eco/* 四请求；MCP 分区另订阅内核 mcp 事件
 * （App 把 state.mcpServers 的引用变化当 tick 传进来）做活刷新，不轮询。
 */
import { useCallback, useEffect, useState } from "react";
import type { BootstrapInfo } from "../../../preload/contract.ts";
import type { Runtime } from "../../core/runtime.ts";
import {
  IconArrowLeft,
  IconBlocks,
  IconChart,
  IconGear,
  IconMonitorCog,
  IconRefresh,
  IconSpark,
} from "../../ui/icons.tsx";
import {
  readMarketplace,
  readMcpServers,
  readPlugins,
  readSkills,
} from "../../ui/readers.ts";
import type {
  MarketplaceSourceRow,
  McpServerRow,
  PluginRow,
  SkillRow,
} from "../../ui/readers.ts";
import { THEMES } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
import {
  installStatusView,
  mcpStatusView,
  pluginSummary,
  SETTINGS_GROUPS,
  sectionLabel,
} from "./settingsModel.ts";
import type { SettingsSectionId } from "./settingsModel.ts";
import { UsageDashboard } from "./UsageDashboard.tsx";
import { dayKey } from "../../ui/usageLedger.ts";
import type { UsageEntry } from "../../ui/usageLedger.ts";

export type SettingsSurfaceProps = {
  runtime: Runtime;
  boot: BootstrapInfo | null;
  sessionId: string | null;
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
};

const SECTION_ICON: Record<SettingsSectionId, typeof IconGear> = {
  general: IconGear,
  plugins: IconBlocks,
  skills: IconSpark,
  mcp: IconMonitorCog,
  usage: IconChart,
};

/** 模型 tone → 既有 .dot 变体（不新造灯色族：completed/working/needs-input/dead）。 */
const DOT_VARIANT: Record<"ok" | "busy" | "bad" | "off", string> = {
  ok: "completed",
  busy: "working",
  bad: "needs-input",
  off: "dead",
};

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function SettingsSurface(props: SettingsSurfaceProps) {
  const { runtime, boot, sessionId, mcpTick, section, onSection, onClose, theme, onTheme, agentVersion } = props;
  const { usageEntries } = props;
  const [plugins, setPlugins] = useState<PluginRow[] | null>(null);
  const [market, setMarket] = useState<MarketplaceSourceRow[] | null>(null);
  const [skills, setSkills] = useState<SkillRow[] | null>(null);
  const [mcp, setMcp] = useState<McpServerRow[] | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);
  const cwd = boot?.cwd ?? null;

  useEffect(() => {
    let alive = true;
    const put = (key: string, fn: (v: unknown) => void) => (res: unknown) => {
      if (!alive) return;
      fn(res);
      setErrs((prev) => ({ ...prev, [key]: "" }));
    };
    const bad = (key: string) => (e: unknown) => {
      if (!alive) return;
      setErrs((prev) => ({ ...prev, [key]: msg(e) }));
    };
    if (section === "plugins") {
      if (sessionId !== null) {
        runtime.effect({ kind: "eco/plugins", sessionId }).then((r) => {
          if (!r.ok) return bad("plugins")(r.error);
          put("plugins", (v) => setPlugins(readPlugins(v)))(r.value);
        }, bad("plugins"));
      }
      runtime.effect({ kind: "eco/marketplace" }).then((r) => {
        if (!r.ok) return bad("market")(r.error);
        put("market", (v) => setMarket(readMarketplace(v)))(r.value);
      }, bad("market"));
    }
    if (section === "skills") {
      if (cwd !== null) {
        runtime.effect({ kind: "eco/skills", cwd }).then((r) => {
          if (!r.ok) return bad("skills")(r.error);
          put("skills", (v) => setSkills(readSkills(v)))(r.value);
        }, bad("skills"));
      }
    }
    if (section === "mcp") {
      if (sessionId !== null) {
        runtime.effect({ kind: "eco/mcp", sessionId }).then((r) => {
          if (!r.ok) return bad("mcp")(r.error);
          put("mcp", (v) => setMcp(readMcpServers(v)))(r.value);
        }, bad("mcp"));
      }
    }
    return () => {
      alive = false;
    };
    // mcpTick：内核 mcp 事件 ⇒ 重取；其余依赖见上。
  }, [section, tick, sessionId, cwd, runtime, mcpTick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const errOf = (key: string): string | null => errs[key] || null;

  return (
    <div className="set">
      <aside className="set__nav">
        <div className="set__drag" />
        <div className="set__backwrap">
          <button type="button" className="set__back" onClick={onClose} title="返回工作区">
            <IconArrowLeft size={16} />
            <span>返回工作区</span>
          </button>
        </div>
        <nav className="set__groups" aria-label="设置分区">
          {SETTINGS_GROUPS.map((g) => (
            <div className="set__group" key={g.id}>
              <div className="set__grouptitle">{g.label}</div>
              {g.sections.map((s) => {
                const Ic = SECTION_ICON[s.id];
                const on = s.id === section;
                return (
                  <button
                    type="button"
                    key={s.id}
                    className={"set__item" + (on ? " set__item--on" : "")}
                    aria-current={on ? "page" : undefined}
                    onClick={() => onSection(s.id)}
                  >
                    <Ic size={16} />
                    <span className="set__itemlabel">{s.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="set__navfoot">nofy-desktop · 内核 {agentVersion ?? "…"}</div>
      </aside>
      <section className="set__main">
        <div className="set__dragstrip" />
        <div className="set__card">
          <div className="set__headdrag" />
          <main className="set__scroll">
            <div className="set__content">
              <div className="set__titlebar">
                <h2 className="set__title">{sectionLabel(section)}</h2>
                {section !== "general" ? (
                  <button type="button" className="iconbtn iconbtn--sm" onClick={refresh} title="重新读取" aria-label="重新读取">
                    <IconRefresh size={14} />
                  </button>
                ) : null}
              </div>

              {section === "general" ? (
                <>
                  <section className="set__block">
                    <h3 className="set__subhead">外观</h3>
                    <div className="set__rows">
                      <div className="set__row">
                        <div className="set__rowmain">
                          <span className="set__rowname">主题</span>
                          <span className="set__rowdesc">深色 / 浅色，与 ZCode 出厂同族令牌</span>
                        </div>
                        <div className="set__themes">
                          {THEMES.map((t) => (
                            <button
                              type="button"
                              key={t.id}
                              className={"set__themebtn" + (theme === t.id ? " set__themebtn--on" : "")}
                              onClick={() => onTheme(t.id)}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="set__block">
                    <h3 className="set__subhead">关于</h3>
                    <div className="set__rows">
                      <div className="set__row">
                        <div className="set__rowmain">
                          <span className="set__rowname">内核版本</span>
                          <span className="set__rowdesc">{agentVersion ?? "未连接"}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              ) : null}

              {section === "plugins" ? (
                <>
                  <section className="set__block">
                    <h3 className="set__subhead">
                      已安装插件{plugins !== null ? " " + String(plugins.length) + " 个" : ""}
                    </h3>
                    {errOf("plugins") !== null ? (
                      <p className="set__error">读取失败：{errOf("plugins")}</p>
                    ) : sessionId === null ? (
                      <div className="emptyboard">
                        <IconBlocks className="emptyboard-icon" />
                        <p className="emptyboard-hint">还没有会话，插件清单读不出来。</p>
                      </div>
                    ) : plugins === null ? (
                      <p className="set__loading">读取中…</p>
                    ) : plugins.length === 0 ? (
                      <div className="emptyboard">
                        <IconBlocks className="emptyboard-icon" />
                        <p className="emptyboard-hint">还没安装插件。下面的市场里可以浏览条目。</p>
                      </div>
                    ) : (
                      <div className="set__rows">
                        {plugins.map((p) => (
                          <div className="set__row" key={p.id}>
                            <span className={"dot" + (p.enabled ? " dot--completed" : "")} title={p.enabled ? "已启用" : "已停用"} />
                            <div className="set__rowmain">
                              <span className="set__rowname">{p.name}</span>
                              <span className="set__rowdesc">
                                {p.scope}
                                {p.version !== null ? " · v" + p.version : ""} · {pluginSummary(p)}
                                {p.marketplaceSource !== null ? " · 来自 " + p.marketplaceSource : ""}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="set__write"
                              disabled
                              title="未接线：插件启停/卸载写路径未实测（生态面 #5 只读纪律）"
                            >
                              {p.enabled ? "停用" : "启用"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="set__block">
                    <h3 className="set__subhead">插件市场</h3>
                    {errOf("market") !== null ? (
                      <p className="set__error">读取失败：{errOf("market")}</p>
                    ) : market === null ? (
                      <p className="set__loading">读取中…</p>
                    ) : market.length === 0 ? (
                      <div className="emptyboard">
                        <IconBlocks className="emptyboard-icon" />
                        <p className="emptyboard-hint">还没有插件市场源。</p>
                      </div>
                    ) : (
                      market.map((src) => (
                        <section className="set__src" key={src.sourceName}>
                          <div className="set__srchead">
                            <span className="set__rowname">{src.sourceName}</span>
                            <span className="set__meta">
                              {src.sourceKind} · {src.plugins.length} 条目
                            </span>
                          </div>
                          {src.error !== null ? <p className="set__error">源读取失败：{src.error}</p> : null}
                          <div className="set__rows">
                            {src.plugins.slice(0, 50).map((mp) => (
                              <div className="set__row" key={src.sourceName + "/" + mp.name}>
                                <div className="set__rowmain">
                                  <span className="set__rowname">{mp.name}</span>
                                  <span className="set__rowdesc">
                                    {mp.category !== null ? mp.category + " · " : ""}
                                    {mp.author !== null ? mp.author + " · " : ""}
                                    {String(mp.skillCount)} 技能
                                    {mp.description !== null ? " · " + mp.description : ""}
                                  </span>
                                </div>
                                <span className="set__meta">{installStatusView(mp.installStatus)}</span>
                                <button
                                  type="button"
                                  className="set__write"
                                  disabled
                                  title="未接线：市场安装写路径未实测（生态面 #5 只读纪律）"
                                >
                                  安装
                                </button>
                              </div>
                            ))}
                            {src.plugins.length > 50 ? (
                              <p className="set__meta set__more">仅显示前 50 条，共 {String(src.plugins.length)} 条。</p>
                            ) : null}
                          </div>
                        </section>
                      ))
                    )}
                  </section>
                </>
              ) : null}

              {section === "skills" ? (
                <section className="set__block">
                  <h3 className="set__subhead">技能{skills !== null ? " " + String(skills.length) + " 个" : ""}</h3>
                  {errOf("skills") !== null ? (
                    <p className="set__error">读取失败：{errOf("skills")}</p>
                  ) : cwd === null ? (
                    <div className="emptyboard">
                      <IconSpark className="emptyboard-icon" />
                      <p className="emptyboard-hint">工作区还没就绪。</p>
                    </div>
                  ) : skills === null ? (
                    <p className="set__loading">读取中…</p>
                  ) : skills.length === 0 ? (
                    <div className="emptyboard">
                      <IconSpark className="emptyboard-icon" />
                      <p className="emptyboard-hint">这个工作区还没发现技能。</p>
                    </div>
                  ) : (
                    <div className="set__rows">
                      {skills.map((s) => (
                        <div className="set__row" key={s.path || s.name}>
                          <span className={"dot" + (s.enabled ? " dot--completed" : "")} title={s.enabled ? "已启用" : "已停用"} />
                          <div className="set__rowmain">
                            <span className="set__rowname">{s.name}</span>
                            <span className="set__rowdesc" title={s.description}>
                              {s.scope}
                              {s.userInvocable ? " · 可手动调用" : ""}
                              {s.description !== "" ? " · " + s.description : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              {section === "mcp" ? (
                <section className="set__block">
                  <h3 className="set__subhead">MCP 服务{mcp !== null ? " " + String(mcp.length) + " 个" : ""}</h3>
                  {errOf("mcp") !== null ? (
                    <p className="set__error">读取失败：{errOf("mcp")}</p>
                  ) : sessionId === null ? (
                    <div className="emptyboard">
                      <IconMonitorCog className="emptyboard-icon" />
                      <p className="emptyboard-hint">还没有会话，MCP 清单读不出来。</p>
                    </div>
                  ) : mcp === null ? (
                    <p className="set__loading">读取中…</p>
                  ) : mcp.length === 0 ? (
                    <div className="emptyboard">
                      <IconMonitorCog className="emptyboard-icon" />
                      <p className="emptyboard-hint">这个会话还没挂 MCP 服务。</p>
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
                                  {sv.source ?? "来源未知"} · {st.label} · {String(sv.toolCount)} 工具
                                  {sv.configSource !== null ? " · " + sv.configSource : ""}
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
                </section>
              ) : null}

              {section === "usage" ? (
                <>
                  <UsageDashboard entries={usageEntries} todayKey={dayKey(new Date())} />
                </>
              ) : null}
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
