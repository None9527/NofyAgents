import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconChevronDown } from "./icons.tsx";

/** Keep a timeline row in one DOM position as it moves from live content to history. */
export function CollapsibleRow({ id, open, children, className = "" }: {
  id: string; open: boolean; children: ReactNode; className?: string;
}) {
  return <div id={id} className={"ui-collapse-row " + className} data-open={open} inert={!open} aria-hidden={!open}>
    <div className="ui-collapse-row__clip">{children}</div>
  </div>;
}

/** Native semantics/search reveal remain intact; user choice wins over later automatic status changes. */
export function Disclosure({ summary, children, className="", summaryClassName="", open, autoOpen=false, canExpand=true, onOpenChange }: {
  summary:ReactNode;children:ReactNode;className?:string;summaryClassName?:string;open?:boolean;autoOpen?:boolean;canExpand?:boolean;onOpenChange?:(open:boolean)=>void;
}) {
  const [local,setLocal]=useState(autoOpen);
  const touched=useRef(false);
  const expanded=open??local;
  useEffect(()=>{if(open===undefined&&!touched.current)setLocal(autoOpen);},[autoOpen,open]);
  if(!canExpand)return <div className={"ui-motion-disclosure "+className} data-expandable="false"><div className={"ui-motion-disclosure__summary "+summaryClassName}>{summary}</div></div>;
  return <details className={"ui-motion-disclosure "+className} open={expanded} onToggle={event=>{
    const next=event.currentTarget.open;
    if(next===expanded)return;
    touched.current=true;setLocal(next);onOpenChange?.(next);
  }}><summary className={"ui-motion-disclosure__summary "+summaryClassName} aria-expanded={expanded}>{summary}<IconChevronDown size={13} className="ui-motion-disclosure__chevron"/></summary>
    <div className="ui-motion-disclosure__body" inert={!expanded} aria-hidden={!expanded}>{children}</div>
  </details>;
}
