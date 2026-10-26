export type PanelTabs = { tabs: PanelKind[]; active: PanelKind | null };
export const PANEL_KINDS = ["files", "review", "agents", "browser"] as const;
export type PanelKind = typeof PANEL_KINDS[number];
export function openPanel(state: PanelTabs, kind: PanelKind): PanelTabs {
  if (state.active === kind && state.tabs.includes(kind)) return state;
  return { tabs: state.tabs.includes(kind) ? state.tabs : [...state.tabs, kind], active: kind };
}
export function closePanel(state: PanelTabs, kind: PanelKind): PanelTabs {
  const index = state.tabs.indexOf(kind);
  if (index < 0) return state;
  const tabs = state.tabs.filter(tab => tab !== kind);
  return { tabs, active: state.active === kind ? tabs[Math.min(index, tabs.length - 1)] ?? null : state.active };
}
