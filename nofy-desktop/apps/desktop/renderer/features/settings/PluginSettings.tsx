import { useSettingsForm } from "./SettingsExitGuard.tsx";
import { useEffect, useMemo, useState } from "react";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import type { Runtime } from "../../core/runtime.ts";
import type { MarketplaceSourceRow, PluginRow } from "../../ui/readers.ts";
import { Btn } from "../../ui/primitives.tsx";
import { Field, TextInput } from "../../ui/forms.tsx";
import { createDesktopClient } from "../../application/public.ts";
import { useProjection, selectConnection } from "../../application/projection/public.ts";
import { useSettingsMutation } from "../../application/settings/public.ts";
import type { PluginCommand } from "../../application/settings/public.ts";
import { ACCEPTED_SETTINGS_METHODS, pluginSummary, SETTINGS_METHODS, settingsWriteShown } from "./settingsModel.ts";
export function PluginSettings({ runtime, sessionId, plugins, market, onRefresh }: { runtime: Runtime; sessionId: string | null; plugins: PluginRow[] | null; market: MarketplaceSourceRow[] | null; onRefresh: () => void }) {
  useLocale();
  const client = useMemo(() => createDesktopClient(runtime), [runtime]);
  const connection = useProjection(client.projection, selectConnection);
  const identity = JSON.stringify([sessionId, connection.transportEpoch]);
  const mutation = useSettingsMutation(identity, () => { const s = client.projection.getState(); return JSON.stringify([s.activeSessionId, s.connection.transportEpoch]); });
  const [source, setSource] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => { setSource(""); setConfirm(null); }, [identity]);
  useSettingsForm(source.length > 0 || confirm !== null, mutation.busy);
  const disabled = mutation.busy || sessionId === null || connection.status !== "ready";
  const canAct = settingsWriteShown(SETTINGS_METHODS.pluginsAction, ACCEPTED_SETTINGS_METHODS);
  const action = (command: PluginCommand) => {
    if (!sessionId) return;
    void mutation.run(() => client.settings.plugins.execute(sessionId, command), result => {
      if (result.kind === "confirmation") { mutation.setNotice(result.message); setConfirm(result.pluginId); return; }
      if (result.kind !== "success") return;
      mutation.setNotice(result.message + (result.restart ? tr(" 请重新创建会话以生效。") : ""));
      setConfirm(null); if (command.kind === "install") setSource(""); onRefresh();
    });
  };
  return <>
    <section className="set__block"><h3 className="set__subhead">{tr("插件安装")}</h3>
      <form onSubmit={event => { event.preventDefault(); action({ kind: "install", source }); }}>
        <Field label={tr("来源")}><TextInput aria-label={tr("插件来源")} placeholder={tr("Git URL、仓库路径或内核支持的来源")} value={source} disabled={mutation.busy} onChange={e => setSource(e.target.value)} /></Field>
        {canAct ? <Btn type="submit" variant="primary" disabled={disabled || !source.trim()}>{tr("安装")}</Btn> : null}
      </form>
      <p className="set__meta">{tr("安装由内核执行；失败时保留来源。市场多插件仓库请指定完整插件来源。")}</p>
      {mutation.notice ? <p role="status" className="set__meta">{mutation.notice}</p> : null}
    </section>
    <section className="set__block"><h3 className="set__subhead">{tr("已安装插件")}</h3>
      {sessionId === null ? <p>{tr("创建会话后管理插件。")}</p> : plugins === null ? <p>{tr("读取中…")}</p> : plugins.length === 0 ? <p>{tr("尚未安装插件。")}</p> : plugins.map(plugin => <div className="set__row" key={plugin.id}>
        <div className="set__rowmain"><span className="set__rowname">{plugin.name}</span><span className="set__rowdesc">{plugin.scope} · {pluginSummary(plugin)} · {plugin.enabled ? tr("已启用") : tr("已停用")}</span>{plugin.description ? <p>{plugin.description}</p> : null}{plugin.marketplaceSource ? <span className="set__meta">{tr("来源：")}{plugin.marketplaceSource}</span> : null}</div>
        {canAct ? <Btn disabled={disabled} onClick={() => action({ kind: "toggle", pluginId: plugin.id, enabled: !plugin.enabled })}>{plugin.enabled ? tr("停用") : tr("启用")}</Btn> : null}
        {canAct ? <details><summary>{tr("卸载")}</summary><p>{tr("卸载")}{plugin.name}{tr("。内核可能提示同仓库包含多个插件。")}</p><Btn variant="danger" disabled={disabled} onClick={() => action({ kind: "uninstall", pluginId: plugin.id, confirmed: confirm === plugin.id })}>{confirm === plugin.id ? tr("确认卸载整个插件仓库") : tr("卸载此插件")}</Btn></details> : null}
      </div>)}
    </section>
    <section className="set__block"><h3 className="set__subhead">{tr("插件市场")}</h3>{market?.map(src => <details key={src.sourceName}><summary>{src.sourceName} · {src.plugins.length}{tr("条目")}</summary><p className="set__meta">{src.sourceUrlOrPath}</p>{src.error ? <p className="set__error">{src.error}</p> : null}{src.plugins.map(p => <div className="set__row" key={p.name}><span>{p.name}</span><span className="set__rowdesc">{p.description}</span></div>)}</details>)}</section>
  </>;
}
