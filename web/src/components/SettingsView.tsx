// Settings, layout forked from the running original: full-window two-pane —
// left nav rail (返回工作区 + grouped sections 基础设置/Agent 能力/数据与统计)
// and a right content pane with big title + subtitle per section.
// All logic kept real: locale/theme/zoom, provider list, MCP CRUD, pairing.

import { useEffect, useState } from "react";
import type { HostClient } from "../lib/rpc";
import type { Provider, Settings } from "../lib/rpc";
import { useI18n } from "../lib/i18n";
import {
  IconAutomation,
  IconFolder,
  IconGear,
  IconGlobe,
  IconMoon,
  IconPanel,
  IconSearch,
  IconSkill,
  IconTerminal,
} from "../icons";

interface Props {
  settings: Settings | null;
  providers: Provider[];
  mcpServers: Array<{ name: string; source?: string; status?: string; tools?: number | null }>;
  onLocaleChange: (locale: string) => void;
  onBack: () => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  client: HostClient;
  onMcpChanged?: () => void;
}

type Section = "general" | "appearance" | "models" | "mcp" | "skills" | "automations" | "usage";

export function SettingsView({
  settings,
  providers,
  mcpServers,
  onLocaleChange,
  onBack,
  theme,
  onThemeChange,
  zoom,
  onZoomChange,
  client,
  onMcpChanged,
}: Props) {
  const { tr } = useI18n();
  const [section, setSection] = useState<Section>("general");
  const [updateNote, setUpdateNote] = useState("");
  const [pairing, setPairing] = useState("");
  const [mcpForm, setMcpForm] = useState({ name: "", command: "" });
  const [mcpError, setMcpError] = useState<string | null>(null);

  const mcpAdd = () => {
    if (!mcpForm.name.trim() || !mcpForm.command.trim()) return;
    void client.mcpAdd(mcpForm.name.trim(), mcpForm.command.trim()).then((r) => {
      setMcpError(r.ok ? null : (r.error ?? tr("daemonDown")));
      if (r.ok) {
        setMcpForm({ name: "", command: "" });
        onMcpChanged?.();
      }
    });
  };
  useEffect(() => {
    client.getPairingInfo().then((info) => setPairing(info.token.slice(0, 8)));
  }, [client]);

  const railItem = (id: Section, icon: React.ReactNode, label: string) => (
    <button
      className={`set-rail-item ${section === id ? "active" : ""}`}
      onClick={() => setSection(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const TITLES: Record<Section, [string, string]> = {
    general: [tr("setGeneral"), tr("setGeneralDesc")],
    appearance: [tr("setAppearance"), tr("setAppearanceDesc")],
    models: [tr("setModels"), tr("setModelsDesc")],
    mcp: [tr("setMcp"), tr("setMcpDesc")],
    skills: [tr("skills"), tr("setSkillsDesc")],
    automations: [tr("automations"), tr("setAutoDesc")],
    usage: [tr("setUsage"), tr("setUsageDesc")],
  };

  return (
    <section className="set-shell">
      <div className="set-rail">
        <button className="set-back" onClick={onBack}>
          ← {tr("setBackToWorkspace")}
        </button>
        <div className="set-rail-scroll">
          <div className="set-group">{tr("setGroupBasic")}</div>
          {railItem("general", <IconGear width={15} height={15} />, tr("setGeneral"))}
          {railItem("appearance", <IconMoon width={15} height={15} />, tr("setAppearance"))}
          {railItem("models", <IconPanel width={15} height={15} />, tr("setModels"))}
          <div className="set-group">{tr("setGroupAgent")}</div>
          {railItem("mcp", <IconFolder width={15} height={15} />, tr("setMcp"))}
          {railItem("skills", <IconSkill width={15} height={15} />, tr("skills"))}
          {railItem("automations", <IconAutomation width={15} height={15} />, tr("automations"))}
          <div className="set-group">{tr("setGroupData")}</div>
          {railItem("usage", <IconSearch width={15} height={15} />, tr("setUsage"))}
        </div>
        <div className="sidebar-footer">
          <span className="avatar">D</span>
          <span className="user">dev</span>
          <span className="row-actions right">
            <IconGear width={14} height={14} />
          </span>
        </div>
      </div>
      <div className="set-content">
        <h1>{TITLES[section][0]}</h1>
        <p>{TITLES[section][1]}</p>

        {section === "general" && (
          <div className="set-card">
            <div className="settings-row">
              <span className="settings-label">{tr("uiLanguage")}</span>
              <select
                className="settings-select"
                value={settings?.locale ?? "zh-CN"}
                onChange={(e) => onLocaleChange(e.target.value)}
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
            <div className="settings-row">
              <span className="settings-label">
                {tr("zoom")} ({Math.round(zoom * 100)}%)
              </span>
              <span className="approve-buttons">
                <button className="settings-button" onClick={() => onZoomChange(zoom - 0.1)}>
                  -
                </button>
                <button className="settings-button" onClick={() => onZoomChange(zoom + 0.1)}>
                  +
                </button>
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">{tr("remotePairing")}</span>
              <span className="settings-value">
                {tr("connectionHint")} · code {pairing || "…"}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">{tr("currentVersion")}</span>
              <span className="settings-value">0.1.0 (web fork of ZCode 3.7.6)</span>
            </div>
            <div className="settings-row">
              <button
                className="settings-button"
                onClick={() => setUpdateNote(tr("noUpdateChannel"))}
              >
                {tr("checkUpdate")}
              </button>
              <span className="settings-value">{updateNote}</span>
            </div>
          </div>
        )}

        {section === "appearance" && (
          <div className="set-card">
            <div className="settings-row">
              <span className="settings-label">{tr("theme")}</span>
              <select
                className="settings-select"
                value={theme}
                onChange={(e) => onThemeChange(e.target.value === "light" ? "light" : "dark")}
              >
                <option value="dark">{tr("dark")}</option>
                <option value="light">{tr("light")}</option>
              </select>
            </div>
          </div>
        )}

        {section === "models" && (
          <div className="set-card">
            {providers.map((provider) => (
              <div className="settings-row" key={provider.id}>
                <span className="settings-label">{provider.name}</span>
                <span className="settings-value">{provider.models.join("、")}</span>
              </div>
            ))}
          </div>
        )}

        {section === "mcp" && (
          <div className="set-card">
            {mcpServers.length === 0 ? (
              <div className="settings-row">
                <span className="settings-value">{tr("noMcp")}</span>
              </div>
            ) : (
              mcpServers.map((server) => (
                <div className="settings-row" key={server.name}>
                  <span className="settings-label">
                    <span className={`mcp-dot status-${server.status === "ready" ? "ok" : "bad"}`} />
                    {server.name}
                  </span>
                  <span className="settings-value">
                    {server.source ?? ""}
                    {server.tools != null ? ` · ${server.tools} tools` : ""}
                    {server.status ? ` · ${server.status}` : ""}
                  </span>
                  {client.isDesktop && (
                    <span className="row-actions">
                      <button
                        className="settings-button"
                        onClick={() =>
                          void client
                            .mcpSetEnabled(server.name, server.status !== "ready")
                            .then((r) => setMcpError(r.ok ? null : (r.error ?? null)))
                            .then(onMcpChanged)
                        }
                      >
                        {server.status === "ready" ? tr("disabled") : tr("enabled")}
                      </button>
                      <button
                        className="settings-button"
                        onClick={() =>
                          void client
                            .mcpRemove(server.name)
                            .then((r) => setMcpError(r.ok ? null : (r.error ?? null)))
                            .then(onMcpChanged)
                        }
                      >
                        {tr("delete")}
                      </button>
                    </span>
                  )}
                </div>
              ))
            )}
            {client.isDesktop && (
              <div className="crud-form">
                <input
                  className="overlay-input"
                  placeholder={tr("mcpName")}
                  value={mcpForm.name}
                  onChange={(e) => setMcpForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="overlay-input"
                  placeholder="npx -y @modelcontextprotocol/server-filesystem /tmp"
                  value={mcpForm.command}
                  onChange={(e) => setMcpForm((f) => ({ ...f, command: e.target.value }))}
                />
                <button className="settings-button primary" onClick={mcpAdd}>
                  {tr("autoAdd")}
                </button>
              </div>
            )}
            {mcpError && <div className="crud-error">{mcpError}</div>}
          </div>
        )}

        {section === "skills" && (
          <div className="set-card">
            <div className="settings-row">
              <span className="settings-value">{tr("setSkillsHint")}</span>
            </div>
          </div>
        )}

        {section === "automations" && (
          <div className="set-card">
            <div className="settings-row">
              <span className="settings-value">{tr("setAutoHint")}</span>
            </div>
          </div>
        )}

        {section === "usage" && (
          <div className="set-card">
            <div className="settings-row">
              <span className="settings-label">{tr("setUsageSessions")}</span>
              <span className="settings-value">{tr("setUsageSessionsHint")}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">
                <IconTerminal width={14} height={14} /> {tr("setUsageDaemon")}
              </span>
              <span className="settings-value">
                {client.isDesktop ? tr("setUsageDaemonOn") : tr("setUsageDaemonOff")}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">
                <IconGlobe width={14} height={14} /> {tr("setUsageTransport")}
              </span>
              <span className="settings-value">{client.backendKind}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
