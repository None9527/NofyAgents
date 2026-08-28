// Automations & skills main views, layout forked from the running original
// (captured via CDP): big title + subtitle header, empty-state card with a
// white primary action, keep-awake info row with switch, idle-task template
// card grid; skills grouped into 工作区与个人技能 / Plugin 技能.
// Logic stays real: daemon schedule table CRUD on the desktop shell.

import { useEffect, useState } from "react";
import type { Automation, HostClient, Skill } from "../lib/rpc";
import { IconAutomation, IconSkill } from "../icons";
import { useI18n } from "../lib/i18n";

interface Props {
  kind: "automations" | "skills";
  client: HostClient;
  automations: Automation[];
  skills: Skill[];
  onBack: () => void;
  onToast?: (msg: string) => void;
}

interface ScheduleRow {
  id?: string;
  name?: string;
  cron?: string;
  cron_spec?: string;
  goal?: string;
  enabled?: boolean;
}

export function ListView({ kind, client, automations, skills, onToast }: Props) {
  const { tr } = useI18n();
  const [rows, setRows] = useState<ScheduleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ id: "", cron: "", goal: "" });
  const [keepAwake, setKeepAwake] = useState(
    () => localStorage.getItem("gb.keepAwake") !== "0",
  );

  const refresh = () => {
    if (kind !== "automations" || !client.isDesktop) return;
    void client.scheduleList().then((result) => {
      if (result.ok) {
        setRows((result.schedules ?? []) as ScheduleRow[]);
        setError(null);
      } else {
        setRows([]);
        setError(result.error ?? tr("daemonDown"));
      }
    });
  };

  useEffect(refresh, [kind, client]);

  const submit = () => {
    if (!form.id.trim() || !form.cron.trim() || !form.goal.trim()) return;
    void client.scheduleAdd(form.id.trim(), form.cron.trim(), form.goal.trim()).then((r) => {
      setError(r.ok ? null : (r.error ?? tr("daemonDown")));
      if (r.ok) {
        setForm({ id: "", cron: "", goal: "" });
        setFormOpen(false);
      }
      refresh();
    });
  };

  const templates: Array<[string, string, string]> = [
    [tr("suggest1Title"), tr("suggest1Body"), "0 17 * * 5"],
    [tr("suggest2Title"), tr("suggest2Body"), "0 9 * * 1-5"],
    [tr("lvTpl3Title"), tr("lvTpl3Body"), "0 12 * * *"],
  ];

  return (
    <section className="lv">
      <header className="lv-header">
        <h1>{kind === "automations" ? tr("automations") : tr("skills")}</h1>
        <p>{kind === "automations" ? tr("lvAutoSubtitle") : tr("lvSkillsSubtitle")}</p>
      </header>
      <div className="lv-body">
        {kind === "automations" && (
          <>
            {(rows ?? []).length === 0 && (
              <div className="lv-empty-card">
                <div className="lv-empty-text">{tr("lvNoScheduled")}</div>
                <div className="lv-empty-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!client.isDesktop) {
                        onToast?.(tr("autoNeedDesktop"));
                        return;
                      }
                      setFormOpen((v) => !v);
                    }}
                  >
                    {tr("lvCreateScheduled")} ⌄
                  </button>
                  <button className="btn-secondary" disabled title={tr("lvIdleSoon")}>
                    {tr("lvCreateIdle")}
                  </button>
                </div>
              </div>
            )}
            {formOpen && (
              <div className="crud-form">
                <input
                  className="overlay-input"
                  placeholder={tr("autoId")}
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                />
                <input
                  className="overlay-input"
                  placeholder="0 17 * * 5"
                  value={form.cron}
                  onChange={(e) => setForm((f) => ({ ...f, cron: e.target.value }))}
                />
                <input
                  className="overlay-input"
                  placeholder={tr("autoGoal")}
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                />
                <button className="btn-primary" onClick={submit}>
                  {tr("autoAdd")}
                </button>
              </div>
            )}
            {error && <div className="crud-error">{error}</div>}
            {(rows ?? []).map((row, i) => (
              <div className="crud-row lv-row-card" key={row.id ?? row.name ?? i}>
                <IconAutomation width={14} height={14} />
                <span className="list-name">{row.id ?? row.name}</span>
                <span className="list-meta">
                  {row.enabled === false ? tr("disabled") : tr("enabled")} · {row.cron ?? row.cron_spec ?? ""}
                </span>
                <span className="spacer" />
                <button
                  className="settings-button"
                  onClick={() => {
                    void client.scheduleRemove(String(row.id ?? row.name ?? "")).then(refresh);
                  }}
                >
                  {tr("delete")}
                </button>
              </div>
            ))}
            <div className="lv-info-row">
              <span>ⓘ {tr("lvKeepAwake")}</span>
              <button
                className={`switch ${keepAwake ? "on" : ""}`}
                onClick={() => {
                  setKeepAwake((v) => {
                    localStorage.setItem("gb.keepAwake", v ? "0" : "1");
                    return !v;
                  });
                }}
              >
                <span className="knob" />
              </button>
            </div>
            <div className="lv-section-title">{tr("lvIdleTemplates")}</div>
            <div className="lv-grid">
              {templates.map(([title, body, cron], i) => (
                <div
                  className="lv-card"
                  key={i}
                  onClick={() => {
                    setForm((f) => ({ ...f, goal: `${title}：${body}`, cron, id: f.id || `idle-${i + 1}` }));
                    setFormOpen(true);
                  }}
                >
                  <div className="lv-card-title">
                    <IconAutomation width={14} height={14} /> {title}
                  </div>
                  <div className="lv-card-body">{body}</div>
                  <div className="lv-card-foot">{tr("lvEarliest")}</div>
                </div>
              ))}
            </div>
            {!client.isDesktop && (
              <>
                <div className="lv-section-title">{tr("automations")}</div>
                {automations.map((automation) => (
                  <div className="list-row" key={automation.id}>
                    <IconAutomation width={14} height={14} />
                    <span className="list-name">{automation.name}</span>
                    <span className="list-meta">
                      {automation.enabled ? tr("enabled") : tr("disabled")}
                      {automation.schedule ? ` · ${automation.schedule}` : ""}
                    </span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
        {kind === "skills" && (
          <>
            <div className="lv-toolbar">
              <button
                className="btn-primary"
                onClick={() => onToast?.(tr("lvNewSkillHint"))}
              >
                {tr("lvNewSkill")}
              </button>
            </div>
            <div className="lv-section-title">{tr("lvGroupLocal")}</div>
            {skills.length === 0 ? (
              <div className="lv-empty-text">{tr("lvNoSkills")}</div>
            ) : (
              skills.map((skill) => (
                <div className="lv-row-card crud-row" key={skill.name}>
                  <IconSkill width={14} height={14} />
                  <span className="list-name">{skill.name}</span>
                  <span className="list-meta">{skill.description?.slice(0, 80)}</span>
                </div>
              ))
            )}
            <div className="lv-section-title">{tr("lvGroupPlugin")}</div>
            <div className="lv-empty-text">{tr("lvNoPluginSkills")}</div>
          </>
        )}
      </div>
    </section>
  );
}
