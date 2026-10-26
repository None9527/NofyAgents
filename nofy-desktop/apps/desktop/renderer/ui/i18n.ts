import { englishMessages } from './i18nMessages.ts';
export type Locale = 'zh-CN' | 'en';
const STORAGE_KEY = 'nofy-desktop:locale';
type LocaleHost = {localStorage?:{getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};document?:{documentElement:{lang:string}}};
const host = () => globalThis as unknown as LocaleHost;
export function loadLocale():Locale {try{return host().localStorage?.getItem(STORAGE_KEY)==='en'?'en':'zh-CN';}catch{return 'zh-CN';}}
let locale:Locale=loadLocale();
const initialDocument=host().document;if(initialDocument)initialDocument.documentElement.lang=locale;
const listeners=new Set<()=>void>();
export function getLocale():Locale {return locale;}
export function subscribeLocale(listener:()=>void):()=>void {listeners.add(listener);return()=>{listeners.delete(listener);};}
export function setLocale(value:Locale):void {
 if((value!=='en'&&value!=='zh-CN')||value===locale)return;
 locale=value;
 try{host().localStorage?.setItem(STORAGE_KEY,value);}catch{/* Preference persistence is optional. */}
 const doc=host().document;if(doc)doc.documentElement.lang=value;
 for(const listener of [...listeners])listener();
}
/** Only call with client-owned resource keys. Never translate model output or RPC content. */
export function tr(source:string,values:readonly unknown[]=[]):string {
 const normalized=source.replace(/\s+/g,' ').trim();
 const translated=locale==='en'?englishMessages[normalized]:undefined;
 let result=translated===undefined?source:(source.match(/^\s+/)?.[0]??'')+translated+(source.match(/\s+$/)?.[0]??'');
 if(values.length)result=result.replace(/\{(\d+)\}/g,(placeholder,index:string)=>Number(index)<values.length?String(values[Number(index)]):placeholder);
 return result;
}
export const messages={
 'zh-CN':{settings:'设置',back:'返回工作区',refresh:'重新读取',general:'通用',plugins:'插件',skills:'技能',mcp:'MCP 服务',usage:'用量',save:'保存',cancel:'取消',loading:'读取中…'},
 en:{settings:'Settings',back:'Back to workspace',refresh:'Refresh',general:'General',plugins:'Plugins',skills:'Skills',mcp:'MCP servers',usage:'Usage',save:'Save',cancel:'Cancel',loading:'Loading…'},
} as const;
export type MessageKey=keyof typeof messages['zh-CN'];
export function translate(key:MessageKey,selectedLocale:Locale=locale):string{return messages[selectedLocale][key];}
