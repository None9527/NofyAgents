import { KeyboardScope } from "../../ui/keyboardScope.ts";
import { ViewBoundary } from "../../ui/viewBoundary.tsx";
import { tr } from "../../ui/i18n.ts";
import type { ReactNode } from "react";

/** A route covers the working environment. The workspace stays laid out so scroll and tool nodes survive. */
export function WindowFrame({ workspace, route }: { workspace:ReactNode; route:{id:string;title:string;close:()=>void;view:ReactNode}|null }) {
  return <div className="window-frame" data-surface={route?.id??"workspace"}>
    <KeyboardScope enabled={route===null}><div className="window-frame__workspace" inert={route!==null} aria-hidden={route!==null}>{workspace}</div></KeyboardScope>
    {route ? <div className="window-frame__route" data-route={route.id}><div className="window-frame__sheet" role="dialog" aria-modal="true" aria-label={route.title}><ViewBoundary key={route.id} label={route.title} close={{label:tr("返回工作区"),run:route.close}}>{route.view}</ViewBoundary></div></div> : null}
  </div>;
}
