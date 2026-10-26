import { useEffect,useRef,useState } from 'react';
import { settingsClientFor,useSettingsResource } from "../../application/settings/public.ts";
import type { Runtime } from '../../core/runtime.ts';
import { tr } from "../../ui/i18n.ts";
import { Btn } from "../../ui/primitives.tsx";
import { useLocale } from "../../ui/useLocale.ts";
import { response } from './settingsWritesModel.ts';
export function BundleSettings({runtime,tick}:{runtime:Runtime;tick:number}) {
  useLocale();
 const query = useSettingsResource(runtime, "bundle", null, null, true, tick); const catalog = query.data === null ? null : response(query.data); const error = query.error;const [detail,setDetail]=useState<{title:string;content:string}|null>(null);const request=useRef(0);
 useEffect(() => () => { request.current++; }, [runtime, tick]);
 async function open(kind:string,name:string){const token=++request.current;setDetail({title:name,content:tr("读取中…")});try{const content=await settingsClientFor(runtime).catalog.entry(kind as "persona"|"agent",name);if(token!==request.current)return;setDetail({title:name,content});}catch(cause){if(token===request.current)setDetail({title:name,content:cause instanceof Error?cause.message:String(cause)});}}
 return <section className="set__block"><h3 className="set__subhead">{tr("内置 Personas / Agents")}</h3><p className="set__meta">{tr("仅显示内核下载的 bundled cache；项目自定义目录不包含在此列表。")}</p>{error?<p className="set__error">{error}</p>:catalog===null?<p>{tr("读取中…")}</p>:catalog['hasCache']!==true?<p>{tr("内核没有内置资源缓存。")}</p>:['personas','agents'].map(group=>{const values=catalog[group];return <div key={group}><h4>{group}</h4>{Array.isArray(values)?values.filter((name):name is string=>typeof name==='string').map(name=><Btn key={name} onClick={()=>void open(group==='personas'?'persona':'agent',name)}>{name}</Btn>):null}</div>;})}{detail?<details open><summary>{detail.title}</summary><pre className="ui-code-preview">{detail.content}</pre><Btn onClick={()=>{request.current++;setDetail(null);}}>{tr("关闭详情")}</Btn></details>:null}</section>;
}
