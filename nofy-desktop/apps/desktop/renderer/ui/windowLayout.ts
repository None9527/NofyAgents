import type { LayoutPrefs } from "./prefs.ts";
import { AUX_WIDTH_DEFAULT, AUX_WIDTH_MIN, AUX_WIDTH_MAX, SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX, DOCK_HEIGHT_MIN, DOCK_HEIGHT_MAX } from "./prefs.ts";

export const WINDOW_LAYOUT = Object.freeze({ conversationMin:280, conversationComfortable:600, divider:1, automaticPanelRatio:.4, dockRatio:.45 });
const finite = (value:number, fallback:number) => Number.isFinite(value) ? value : fallback;
const clamp = (value:number, min:number, max:number) => Math.min(Math.max(value,min),max);

/** Persistent intent and measured geometry are separate; resizing never overwrites intent. */
export function resolveWindowLayout(width:number, prefs:Pick<LayoutPrefs,"sidebarOpen"|"sidebarWidth">) {
  const available=Math.max(0,finite(width,0));
  const sidebarWidth=Math.min(clamp(finite(prefs.sidebarWidth,SIDEBAR_WIDTH_MIN),SIDEBAR_WIDTH_MIN,SIDEBAR_WIDTH_MAX),available/2);
  return { sidebarWidth, sidebarShouldFold:available>0&&prefs.sidebarOpen&&available-sidebarWidth-WINDOW_LAYOUT.divider<WINDOW_LAYOUT.conversationComfortable };
}

export function resolveWorkArea(available:number, preferred:number, sizing:"auto"|"fixed"="fixed") {
  const width=Math.max(0,finite(available,0));
  const split=width>=WINDOW_LAYOUT.conversationMin+AUX_WIDTH_MIN+WINDOW_LAYOUT.divider;
  const desired=sizing==="auto" ? Math.min(AUX_WIDTH_DEFAULT,width*WINDOW_LAYOUT.automaticPanelRatio) : finite(preferred,AUX_WIDTH_DEFAULT);
  const reserve=sizing==="auto"&&width>=WINDOW_LAYOUT.conversationComfortable+AUX_WIDTH_MIN+WINDOW_LAYOUT.divider?WINDOW_LAYOUT.conversationComfortable:WINDOW_LAYOUT.conversationMin;
  const panelWidth=clamp(desired,AUX_WIDTH_MIN,split?Math.min(AUX_WIDTH_MAX,width-reserve-WINDOW_LAYOUT.divider):AUX_WIDTH_MAX);
  return { mode:split?"split" as const:"sheet" as const, width:Math.floor(panelWidth) };
}

export function resolveDockHeight(height:number, preferred:number) {
  const limit=Math.max(DOCK_HEIGHT_MIN,Math.min(DOCK_HEIGHT_MAX,Math.floor(Math.max(0,finite(height,0)-48)*WINDOW_LAYOUT.dockRatio)));
  return clamp(finite(preferred,280),DOCK_HEIGHT_MIN,limit);
}
