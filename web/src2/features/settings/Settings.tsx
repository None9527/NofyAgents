// 双栏设置（S10）：rail 四分区，只有激活分区渲染（zcode 纪律）。
// general=主题/契约默认；mcp/routines=桌面桥接 CRUD（web 诚实降级）；pairing=远程配对。

import { useEffect, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { Button, IconButton, Switch } from "../../ui/primitives";
import "./settings.css";

type Section = "general" | "mcp" | "routines" | "pairing";

const SECTIONS: Array<[Section, string]> = [
  ["general", "通用"],
  ["mcp", "MCP 服务器"],
  ["routines", "例程"],
  ["pairing", "远程配对"],
];

export function Settings() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const [section, setSection] = useState<Section>("general");

  if (!open) return null;
  return (
    <>
      <div className="settings-backdrop" onMouseDown={() => setOpen(false)} />
      <div className="settings" data-slot="settings" role="dialog" aria-label="设置">
        <div className="settings__rail">
          <div className="settings__rail-head">设置</div>
          {SECTIONS.map(([key, label]) => (
            <button key={key} className="settings__item" data-on={section === key} onClick={() => setSection(key)}>
              {label}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <IconButton label="关闭" onClick={() => setOpen(false)}>
              ×
            </IconButton>
          </div>
        </div>
        <div className="settings__content">
          {section === "general" && <GeneralSection />}
          {section === "mcp" && <McpSection />}
          {section === "routines" && <RoutinesSection />}
          {section === "pairing" && <PairingSection />}
        </div>
      </div>
    </>
  );
}

function GeneralSection() {
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const defaultAutonomy = useApp((s) => s.defaultAutonomy);
  const setDefaultAutonomy = useApp((s) => s.setDefaultAutonomy);
  const defaultBudget = useApp((s) => s.defaultBudget);
  const setDefaultBudget = useApp((s) => s.setDefaultBudget);
  return (
    <>
      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__row-label">主题</span>
          <Switch checked={theme === "light"} onChange={() => toggleTheme()} label="亮色主题" />
          <span>{theme === "light" ? "亮色" : "暗色"}</span>
        </div>
      </div>
      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__row-label">默认 autonomy</span>
          <div className="ui-seg" style={{ flex: 1 }}>
            {(["L1", "L2", "L3", "L4"] as const).map((lv) => (
              <button key={lv} data-on={defaultAutonomy === lv} onClick={() => setDefaultAutonomy(lv)}>
                {lv}
              </button>
            ))}
          </div>
        </div>
        <div className="settings__row">
          <span className="settings__row-label">默认预算</span>
          <div className="ui-seg" style={{ flex: 1 }}>
            {["不限", "100k", "500k", "1M"].map((b) => (
              <button key={b} data-on={defaultBudget === b} onClick={() => setDefaultBudget(b)}>
                {b === "不限" ? "∞" : b}
              </button>
            ))}
          </div>
        </div>
        <div className="settings__note">新工作单默认携带该契约；每任务可在契约模覆盖。</div>
      </div>
    </>
  );
}

function useClient() {
  try {
    return getClient();
  } catch {
    return null;
  }
}

function McpSection() {
  const client = useClient();
  const [servers, setServers] = useState<Array<{ name: string; command: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");

  const load = () => {
    if (!client) return;
    void client.mcpConfigList().then((r) => {
      if (r.ok) setServers(r.servers ?? []);
      else setError(r.error ?? "不可用");
    });
  };
  useEffect(load, [client]);

  return (
    <div className="settings__card">
      {error && <div className="settings__err">MCP 配置需桌面版：{error}</div>}
      {servers.map((s) => (
        <div className="settings__row" key={s.name}>
          <span style={{ fontFamily: "var(--font-mono)", width: 110, overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
          <span className="settings__note" style={{ flex: 1 }}>{s.command}</span>
          <Button size="sm" variant="destructive" onClick={() => void client?.mcpRemove(s.name).then(load)}>
            移除
          </Button>
        </div>
      ))}
      <div className="settings__row">
        <input className="settings__input" style={{ flex: "none", width: 110 }} placeholder="名称" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="settings__input" placeholder="命令，如: npx -y some-mcp" value={command} onChange={(e) => setCommand(e.target.value)} />
        <Button
          size="sm"
          variant="primary"
          disabled={!name.trim() || !command.trim()}
          onClick={() =>
            void client?.mcpAdd(name.trim(), command.trim()).then(() => {
              setName("");
              setCommand("");
              load();
            })
          }
        >
          添加
        </Button>
      </div>
    </div>
  );
}

function RoutinesSection() {
  const client = useClient();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [cron, setCron] = useState("0 9 * * *");
  const [goal, setGoal] = useState("");

  const load = () => {
    if (!client) return;
    void client.scheduleList().then((r) => {
      if (r.ok) setRows(r.schedules ?? []);
      else setError(r.error ?? "不可用");
    });
  };
  useEffect(load, [client]);

  return (
    <div className="settings__card">
      {error && <div className="settings__err">例程需桌面版 exec：{error}</div>}
      {rows.map((r, i) => (
        <div className="settings__row" key={i}>
          <span style={{ fontFamily: "var(--font-mono)", width: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {String(r.id ?? r.name ?? `#${i}`)}
          </span>
          <span className="settings__note" style={{ flex: 1 }}>
            {String(r.cron ?? r.schedule ?? "")} · {String(r.goal ?? r.prompt ?? "").slice(0, 60)}
          </span>
          <Button size="sm" variant="destructive" onClick={() => void client?.scheduleRemove(String(r.id ?? r.name)).then(load)}>
            移除
          </Button>
        </div>
      ))}
      <div className="settings__row">
        <input className="settings__input" style={{ flex: "none", width: 110 }} placeholder="id" value={id} onChange={(e) => setId(e.target.value)} />
        <input className="settings__input" style={{ flex: "none", width: 120 }} placeholder="cron" value={cron} onChange={(e) => setCron(e.target.value)} />
        <input className="settings__input" placeholder="目标（goal）" value={goal} onChange={(e) => setGoal(e.target.value)} />
        <Button
          size="sm"
          variant="primary"
          disabled={!id.trim() || !goal.trim()}
          onClick={() =>
            void client?.scheduleAdd(id.trim(), cron.trim(), goal.trim()).then(() => {
              setId("");
              setGoal("");
              load();
            })
          }
        >
          添加
        </Button>
      </div>
      <div className="settings__note">例程=定时派发的后台工作单；失败升级与 monitor 心跳见 Phase-3。</div>
    </div>
  );
}

function PairingSection() {
  const client = useClient();
  const [info, setInfo] = useState<{ token: string; port: number } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!client) return;
    void client.getPairingInfo().then(setInfo).catch(() => {});
  }, [client]);
  return (
    <div className="settings__card">
      {info ? (
        <>
          <div className="settings__row">
            <span className="settings__row-label">配对令牌</span>
            <code className="settings__input" style={{ display: "flex", alignItems: "center" }}>{info.token}</code>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard?.writeText(info.token);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <div className="settings__row">
            <span className="settings__row-label">端口</span>
            <span>{info.port}</span>
          </div>
          <div className="settings__note">手机/远端 Companion 经此令牌接入本守护进程（Phase-3 tray 药丸同源）。</div>
        </>
      ) : (
        <div className="settings__note">读取配对信息中…</div>
      )}
    </div>
  );
}
