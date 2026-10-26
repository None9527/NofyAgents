import { useSettingsForm } from "./SettingsExitGuard.tsx";
import { useEffect, useMemo, useState } from "react";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import type { Runtime } from "../../core/runtime.ts";
import type { McpServerRow } from "../../ui/readers.ts";
import { Btn } from "../../ui/primitives.tsx";
import { Field, SelectControl, TextArea, TextInput } from "../../ui/forms.tsx";
import { createDesktopClient } from "../../application/public.ts";
import { useProjection, selectConnection } from "../../application/projection/public.ts";
import { useSettingsMutation } from "../../application/settings/public.ts";
import type { McpDraft, SettingsResult } from "../../application/settings/public.ts";
import { ACCEPTED_SETTINGS_METHODS, SETTINGS_METHODS, settingsWriteShown } from "./settingsModel.ts";
const EMPTY: McpDraft = { name: "", transport: "http", endpoint: "", args: "[]", env: "{}" };
type Setup = Extract<SettingsResult, { kind: "setup" }>;
/** User-scope writes only; protocol fields and setup decoding belong to the client. */
export function McpSettings({ runtime, sessionId, servers, onRefresh }: { runtime: Runtime; sessionId: string | null; servers: McpServerRow[] | null; onRefresh: () => void }) {
  useLocale();
  const client = useMemo(() => createDesktopClient(runtime), [runtime]);
  const connection = useProjection(client.projection, selectConnection);
  const identity = JSON.stringify([sessionId, connection.transportEpoch]);
  const mutation = useSettingsMutation(identity, () => { const s = client.projection.getState(); return JSON.stringify([s.activeSessionId, s.connection.transportEpoch]); });
  const [draft, setDraft] = useState<McpDraft>(EMPTY);
  const [open, setOpen] = useState(false);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { setDraft(EMPTY); setOpen(false); setSetup(null); setValues({}); }, [identity]);
  useSettingsForm((open && JSON.stringify(draft) !== JSON.stringify(EMPTY)) || (setup !== null && Object.values(values).some(value => value !== "")), mutation.busy);
  const disabled = mutation.busy || sessionId === null || connection.status !== "ready";
  const show = (method: string) => settingsWriteShown(method, ACCEPTED_SETTINGS_METHODS);
  const action = (work: () => Promise<SettingsResult>) => mutation.run(work, result => {
    if (result.kind === "setup") { setSetup(result); setValues({}); return; }
    if (result.kind !== "success") return;
    mutation.setNotice(result.message); setOpen(false); setDraft(EMPTY); setSetup(null); setValues({}); onRefresh();
  });
  return <section className="set__block">
    <h3 className="set__subhead">{tr("管理 MCP")}</h3>
    <p className="set__meta">{tr("新增和删除写入用户配置。启停作用于当前会话，并由内核保存状态；项目配置暂不支持写入。编辑会替换该服务配置，请保留所需字段。")}</p>
    {show(SETTINGS_METHODS.mcpUpsert) ? <Btn disabled={disabled} onClick={() => { setDraft(EMPTY); setOpen(v => !v); }}>{tr("新增服务")}</Btn> : null}
    {open ? <form className="set__rows" onSubmit={event => { event.preventDefault(); if (sessionId) void action(() => client.settings.mcp.save(sessionId, draft)); }}>
      <Field label={tr("名称")}><TextInput aria-label={tr("MCP 名称")} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} disabled={mutation.busy} /></Field>
      <Field label={tr("运输")}><SelectControl value={draft.transport} onChange={e => setDraft({ ...draft, transport: e.target.value as McpDraft["transport"] })} disabled={mutation.busy}><option value="http">HTTP</option><option value="stdio">stdio</option></SelectControl></Field>
      <Field label={draft.transport === "http" ? tr("地址") : tr("命令")}><TextInput value={draft.endpoint} onChange={e => setDraft({ ...draft, endpoint: e.target.value })} disabled={mutation.busy} /></Field>
      {draft.transport === "stdio" ? <>
        <Field label={tr("参数 JSON")}><TextInput value={draft.args} onChange={e => setDraft({ ...draft, args: e.target.value })} disabled={mutation.busy} /></Field>
        <Field label={tr("环境变量 JSON")}><TextArea value={draft.env} onChange={e => setDraft({ ...draft, env: e.target.value })} disabled={mutation.busy} /></Field>
      </> : null}
      <div className="ui-actions"><Btn type="submit" variant="primary" disabled={disabled}>{tr("保存")}</Btn><Btn disabled={mutation.busy} onClick={() => { setOpen(false); setDraft(EMPTY); }}>{tr("取消")}</Btn></div>
    </form> : null}
    {servers?.map(server => <div className="set__row" key={server.name}>
      <span className="set__rowname">{server.name}</span>
      {show(SETTINGS_METHODS.mcpToggle) ? <Btn disabled={disabled} onClick={() => { if (sessionId) void action(() => client.settings.mcp.toggle(sessionId, server.name, !server.enabled)); }}>{server.enabled ? tr("停用") : tr("启用")}</Btn> : null}
      {show(SETTINGS_METHODS.mcpAuthTrigger) ? <Btn disabled={disabled} onClick={() => { if (sessionId) void action(() => client.settings.mcp.authenticate(sessionId, server.name)); }}>{tr("认证 / Setup")}</Btn> : null}
      {server.source === "local" && show(SETTINGS_METHODS.mcpUpsert) ? <Btn disabled={disabled} onClick={() => { setDraft({ ...EMPTY, name: server.name }); setOpen(true); }}>{tr("替换配置")}</Btn> : null}
      {server.source === "local" && show(SETTINGS_METHODS.mcpDelete) ? <details><summary>{tr("删除")}</summary><p>{tr("将删除用户配置中的")}{server.name}{tr("，并停止此会话中的服务。")}</p><Btn variant="danger" disabled={disabled} onClick={() => { if (sessionId) void action(() => client.settings.mcp.remove(sessionId, server.name)); }}>{tr("确认删除")}</Btn></details> : null}
    </div>)}
    {setup && show(SETTINGS_METHODS.mcpSetup) ? <form onSubmit={e => { e.preventDefault(); if (sessionId) void action(() => client.settings.mcp.setup(sessionId, setup.server, values)); }}>
      <h4>{setup.server} Setup</h4>
      {setup.fields.map(field => <Field label={field.label} key={field.name}><SelectControl required={field.required} value={values[field.name] ?? ""} disabled={mutation.busy} onChange={e => setValues({ ...values, [field.name]: e.target.value })}><option value="">{tr("请选择")}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectControl></Field>)}
      <div className="ui-actions"><Btn type="submit" variant="primary" disabled={disabled}>{tr("保存 Setup")}</Btn><Btn disabled={mutation.busy} onClick={() => { setSetup(null); setValues({}); }}>{tr("取消")}</Btn></div>
    </form> : null}
    {mutation.notice ? <p className="set__meta" role="status">{mutation.notice}</p> : null}
  </section>;
}
