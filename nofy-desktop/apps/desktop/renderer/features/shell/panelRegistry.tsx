import type { ReactElement, ReactNode } from "react";
import type { PanelKind } from "../../application/workspace/public.ts";
import { PANEL_KINDS } from "../../application/workspace/public.ts";
import type { IconProps } from "../../ui/icons.tsx";
import { IconBot, IconFile, IconFileDiff, IconGlobe } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import type { PaletteAction } from "./palette.ts";

type PanelViews = Record<PanelKind,ReactNode>;
type PanelDefinition = {
  label:string; title:string; icon:(props:IconProps)=>ReactElement;
  command:{id:string;title:()=>string;icon:PaletteAction["icon"];keywords:string[]};
  render:(views:PanelViews)=>ReactNode;
};
/** Presentation registration only. Application owns IDs/state; domain owners supply live views. */
export const WORKBENCH_PANELS:Record<PanelKind,PanelDefinition> = {
  files:{get label(){return tr("文件");},get title(){return tr("浏览文件和目录");},icon:IconFile,command:{id:"files-pane",title:()=>tr("文件面板"),icon:"file",keywords:["files","tree","viewer","文件","目录树"]},render:views=>views.files},
  review:{get label(){return tr("审查");},get title(){return tr("查看工作区更改");},icon:IconFileDiff,command:{id:"review-pane",title:()=>tr("审查面板"),icon:"edit",keywords:["git","diff","review","审查","变更"]},render:views=>views.review},
  agents:{get label(){return tr("子智能体");},get title(){return tr("查看本会话子智能体");},icon:IconBot,command:{id:"agents-pane",title:()=>tr("子智能体"),icon:"panel",keywords:["agents","subagents","子智能体"]},render:views=>views.agents},
  browser:{get label(){return tr("浏览器");},get title(){return tr("在应用内打开网页");},icon:IconGlobe,command:{id:"browser-pane",title:()=>tr("浏览器面板"),icon:"globe",keywords:["browser","url","网页","浏览器"]},render:views=>views.browser},
};

export function panelCommands(open:(kind:PanelKind)=>void):PaletteAction[] {
  return PANEL_KINDS.map(kind=>{const item=WORKBENCH_PANELS[kind].command;return {id:item.id,section:"panels",title:item.title(),icon:item.icon,keywords:item.keywords,run:()=>open(kind)};});
}
