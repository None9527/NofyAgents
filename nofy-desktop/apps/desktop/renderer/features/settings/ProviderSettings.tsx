import { finishModelSave, modelResourceConfirms, useSettingsResource, settingsClientFor } from "../../application/settings/public.ts";
import { useSettingsForm, useSettingsExit } from "./SettingsExitGuard.tsx";
import { useEffect, useRef, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import type { ModelApiBackend, ModelConfigRow, ModelConfigSnapshot } from "../../application/settings/public.ts";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { Btn } from "../../ui/primitives.tsx";
import { Field, TextInput, SelectControl } from "../../ui/forms.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { IconSpark, IconPlus } from "../../ui/icons.tsx";

type Draft = { id: string; name: string; model: string; providerId: string; baseUrl: string; apiBackend: ModelApiBackend; apiKey: string; makeDefault: boolean };
const empty = (): Draft => ({ id: "", name: "", model: "", providerId: "", baseUrl: "", apiBackend: "chat_completions", apiKey: "", makeDefault: true });

export function ProviderSettings({ runtime, tick = 0 }: { runtime: Runtime; tick?: number }) {
  useLocale();
  const client = settingsClientFor(runtime);
  const query = useSettingsResource(runtime, "model-config", null, null, true, tick);
  const config = query.data as ModelConfigSnapshot | null;
  const baseline = useRef<Draft>(empty());
  const leave = useSettingsExit();
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useSettingsForm(editorOpen && JSON.stringify(draft) !== JSON.stringify(baseline.current), busy);
  const lock = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    return () => { alive.current = false; };
  }, [runtime]);

  function edit(row: ModelConfigRow) {
    setEditing(true);
    setEditorOpen(true);
    setNotice("");
    baseline.current = { id: row.id, name: row.name, model: row.model, providerId: row.hasModelOverrides ? "" : row.providerId ?? "", baseUrl: row.hasHiddenUrlParts ? "" : row.baseUrl ?? "", apiBackend: row.apiBackend, apiKey: "", makeDefault: config?.defaultModelId === row.id };
    setDraft(baseline.current);
  }
  function closeEditor() {
    if (busy) return;
    setEditorOpen(false);
    setDraft(empty());
    setEditing(false);
    setNotice("");
  }
  async function refresh() { await query.refresh(); }
  async function save() {
    if (lock.current || !config?.editable) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    const expected = { id: draft.id.trim(), name: draft.name.trim(), makeDefault: draft.makeDefault };
    try {
      const decision = await finishModelSave(client.models, { expectedRevision: config.revisionHash, id: expected.id, name: expected.name, makeDefault: expected.makeDefault,
        ...(draft.model.trim() ? { model: draft.model.trim() } : {}), ...(draft.providerId.trim() ? { providerId: draft.providerId.trim() } : {}),
        ...(draft.baseUrl.trim() ? { baseUrl: draft.baseUrl.trim() } : {}), ...(draft.apiKey.trim() ? { apiKey: draft.apiKey.trim() } : {}), apiBackend: draft.apiBackend }, expected);
      if (!alive.current) return;
      if (!decision.close) { setNotice(decision.error ?? tr("内核未回读确认。")); return; }
      const listed = modelResourceConfirms(await query.refresh(), expected);
      if (!alive.current) return;
      if (!listed.close) { setNotice(listed.error ?? tr("内核未回读确认。")); return; }
      setDraft(empty()); setEditing(false); setEditorOpen(false); setNotice(tr("模型配置已保存，内核已重新启动。请新建会话测试真实连接。"));
    } catch (error) { if (alive.current) setNotice(error instanceof Error ? error.message : String(error)); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }

  return <section className="set__block model-settings">
    <div className="settings-section-head"><div><h3 className="set__subhead">{tr("供应商与默认模型")}</h3><p className="set__meta">{tr("管理用于对话的模型和连接信息。")}</p></div>
      <Btn variant="primary" disabled={busy || !config?.editable} onClick={() => { setEditing(false); baseline.current = empty(); setDraft(baseline.current); setNotice(""); setEditorOpen(true); }}><IconPlus size={14} />{tr("新增模型配置")}</Btn>
    </div>
    {config === null ? <p role="status">{tr("读取中…")}</p> : !config.editable ? <p role="status">{tr("遗留 TOML 配置暂为只读，请先单独迁移为 JSON。")}</p> : <>
      <div className="settings-caption">{tr("默认模型：")}<strong>{config.defaultModelId ?? tr("未配置")}</strong></div>
      {config.models.length ? <div className="set__rows model-list">{config.models.map(row => <div className="set__row" key={row.id}>
        <span className="model-list__icon"><IconSpark size={20} /></span>
        <div className="set__rowmain"><span className="set__rowname">{row.name}{config.defaultModelId === row.id ? <span className="ui-badge">{tr("默认")}</span> : null}</span>
          <span className="set__rowdesc" title={row.baseUrl ?? undefined}>{row.id} · {row.providerId ?? tr("独立模型")} · {row.hasApiKey ? tr("已配置凭据") : tr("未配置凭据")}</span>
        </div><Btn disabled={busy} onClick={() => edit(row)}>{tr("编辑")}</Btn>
      </div>)}</div> : <div className="settings-empty"><IconSpark size={24} /><p>{tr("添加模型，开始你的第一段对话。")}</p></div>}
    </>}
    <div className="settings-toolbar"><Btn disabled={busy} onClick={() => void refresh()}>{tr("重新读取")}</Btn>{(notice || query.error) && !editorOpen ? <p role="status" className="set__meta">{notice || query.error}</p> : null}</div>

    <Dialog open={editorOpen} title={tr(editing ? "编辑模型" : "添加模型配置")} onClose={() => leave(closeEditor)} busy={busy}
      footer={<><Btn size="md" disabled={busy} onClick={() => leave(closeEditor)}>{tr("取消")}</Btn><Btn size="md" variant="primary" type="submit" form="model-editor-form" disabled={busy}>{busy ? tr("保存中…") : tr("保存模型配置")}</Btn></>}>
      <form id="model-editor-form" className="ui-form" onSubmit={event => { event.preventDefault(); void save(); }}>
        <div className="ui-form__columns">
          <Field label={tr("模型 ID")}><TextInput aria-label={tr("模型 ID")} autoFocus={!editing} required disabled={editing || busy} value={draft.id} onChange={event => setDraft({ ...draft, id: event.target.value })} /></Field>
          <Field label={tr("显示名称")}><TextInput aria-label={tr("显示名称")} autoFocus={editing} required disabled={busy} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></Field>
        </div>
        <Field label={tr("模型 API 地址")}><TextInput aria-label={tr("模型 API 地址")} type="url" required={!editing} disabled={busy} placeholder={editing ? tr("留空保留现有地址") : "https://example.com/v1"} value={draft.baseUrl} onChange={event => setDraft({ ...draft, baseUrl: event.target.value })} /></Field>
        <Field label={tr("模型 API Key")}><TextInput aria-label={tr("模型 API Key")} type="password" autoComplete="off" disabled={busy} placeholder={tr("留空保留已有凭据，不回显密钥")} value={draft.apiKey} onChange={event => setDraft({ ...draft, apiKey: event.target.value })} /></Field>
        <details className="ui-disclosure" open>
          <summary>{tr("高级配置")}</summary>
          <div className="ui-form">
            <Field label={tr("API 协议")}><SelectControl aria-label={tr("API 协议")} disabled={busy} value={draft.apiBackend} onChange={event => setDraft({ ...draft, apiBackend: event.target.value as ModelApiBackend })}><option value="chat_completions">Chat Completions</option><option value="responses">Responses</option><option value="messages">Anthropic Messages</option></SelectControl></Field>
            <div className="ui-form__columns">
              <Field label={tr("API 模型名")}><TextInput aria-label={tr("API 模型名")} disabled={busy} placeholder={tr("留空使用模型 ID")} value={draft.model} onChange={event => setDraft({ ...draft, model: event.target.value })} /></Field>
              <Field label={tr("共享供应商 ID")}><TextInput aria-label={tr("共享供应商 ID")} disabled={busy} placeholder={tr("可留空，凭据只用于该模型")} value={draft.providerId} onChange={event => setDraft({ ...draft, providerId: event.target.value })} /></Field>
            </div>
          </div>
        </details>
        <label className="ui-check"><input type="checkbox" disabled={busy} checked={draft.makeDefault} onChange={event => setDraft({ ...draft, makeDefault: event.target.checked })} />{tr("设为新会话默认模型")}</label>
        <p className="ui-field__hint">{tr("保存只更新配置，连接状态以实际对话结果为准。")}</p>
        {notice ? <p role="status" className="ui-notice">{notice}</p> : null}
      </form>
    </Dialog>
  </section>;
}
