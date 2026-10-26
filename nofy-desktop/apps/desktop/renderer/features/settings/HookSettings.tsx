import { useSettingsResource } from "../../application/settings/public.ts";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useEffect,useState } from 'react';
import type { Runtime } from '../../core/runtime.ts';
import { readHookRows } from './settingsWritesModel.ts';
import type { HookRow } from './settingsWritesModel.ts';
export function HookSettings({runtime,sessionId,tick}:{runtime:Runtime;sessionId:string|null;tick:number}) {
  useLocale();
 const query = useSettingsResource(runtime, "hooks", sessionId, null, true, tick);
 const hooks = query.data === null ? null : readHookRows(query.data); const error = query.error;
 return <section className="set__block"><h3 className="set__subhead">{tr("钩子")}</h3>{error?<p className="set__error" role="alert">{error}</p>:sessionId===null?<p>{tr("创建会话后读取 hooks。")}</p>:hooks===null?<p>{tr("读取中…")}</p>:hooks.length===0?<p>{tr("未发现 hooks。")}</p>:hooks.map(hook=><details className="set__row set__row--exp" key={hook.name}><summary>{hook.name} · {hook.disabled?tr("已停用"):tr("已启用")}</summary><p>{hook.event}</p><p className="set__meta">{tr("来源：")}{hook.source}</p><pre className="ui-code-preview">{hook.handler}</pre></details>)}</section>;
}
