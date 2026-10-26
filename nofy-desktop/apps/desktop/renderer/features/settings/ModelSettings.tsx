import { useEffect,useRef,useState } from 'react';
import { settingsClientFor,useSettingsResource } from "../../application/settings/public.ts";
import type { Runtime } from '../../core/runtime.ts';
import { Field,TextInput } from "../../ui/forms.tsx";
import { tr } from "../../ui/i18n.ts";
import { Btn } from "../../ui/primitives.tsx";
import { useLocale } from "../../ui/useLocale.ts";
import { useSettingsForm } from "./SettingsExitGuard.tsx";
import { response } from './settingsWritesModel.ts';
/** Credentials remain in this mounted form until kernel acceptance, never UI preferences. */
export function ModelSettings({runtime,tick=0}:{runtime:Runtime;tick?:number}) {
  useLocale();
  const [key,setKey]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');const [authMethod,setAuthMethod]=useState<string|null>(null);const lock=useRef(false);
  const query = useSettingsResource(runtime, "auth", null, null, true, tick);
  useSettingsForm(key.length > 0, busy);
  useEffect(() => { const method = response(query.data)['methodId']; setAuthMethod(typeof method === 'string' ? method : null); }, [query.data]);
  async function save() {
    if (!key.trim() || lock.current) return;
    lock.current=true;
    setBusy(true);setMessage('');
    try {
      const result = await settingsClientFor(runtime).credentials.save(key, () => setKey(''));
      if (result.kind === "success") await query.refresh();
      setMessage(result.kind === "success" || result.kind === "error" ? result.message : '');
    } catch(error) {setMessage(error instanceof Error?error.message:String(error));} finally {lock.current=false;setBusy(false);}
  }
  return <section className="set__block"><h3 className="set__subhead">{tr("模型与认证")}</h3><p className="set__meta">{tr("认证方式：")}{authMethod??tr("未认证")}</p><p className="set__meta">{tr("应用 API Key 由内核保存，不回显已有密钥。保存后请重启应用并新建会话测试连接；已有会话可能使用旧凭据。供应商与默认模型使用上方表单管理。")}</p><form onSubmit={e=>{e.preventDefault();void save();}} className="set__rows"><Field label="API Key"><TextInput disabled={busy} type="password" autoComplete="off" value={key} onChange={e=>setKey(e.target.value)} aria-label="API Key" placeholder={tr("输入新凭据，不回显已有密钥")} /></Field><Btn type="submit" variant="primary" disabled={busy||!key.trim()}>{busy?tr("保存中…"):tr("保存凭据")}</Btn></form>{message || query.error?<p role="status" className="set__meta">{message || query.error}</p>:null}</section>;
}
