export type FileViewMode = "preview" | "source";
export type ResourceTab = { path: string; pinned: boolean; mode: FileViewMode; positions: Record<FileViewMode, number> };
export type ResourceTabs = { tabs: ResourceTab[]; active: string | null };
export function isMarkdown(path: string): boolean { return /\.(md|markdown)$/i.test(path); }
/** Identity is the full path returned by the kernel, within the owner workspace scope. */
export function openResource(state: ResourceTabs, path: string, pinned = false): ResourceTabs {
  const existing = state.tabs.find(tab => tab.path === path);
  if (existing) return { tabs: pinned && !existing.pinned ? state.tabs.map(tab => tab === existing ? { ...tab, pinned: true } : tab) : state.tabs, active: path };
  const tab: ResourceTab = { path, pinned, mode: isMarkdown(path) ? "preview" : "source", positions: { preview: 0, source: 0 } };
  const preview = state.tabs.findIndex(tab => !tab.pinned);
  const tabs = [...state.tabs];
  if (!pinned && preview >= 0) tabs[preview] = tab; else tabs.push(tab);
  return { tabs, active: path };
}
export function closeResource(state: ResourceTabs, path: string): ResourceTabs {
  const index = state.tabs.findIndex(tab => tab.path === path);
  if (index < 0) return state;
  const tabs = state.tabs.filter(tab => tab.path !== path);
  return { tabs, active: state.active === path ? tabs[Math.min(index, tabs.length - 1)]?.path ?? null : state.active };
}
export function updateResource(state: ResourceTabs, path: string, change: Partial<Pick<ResourceTab, "mode" | "pinned" | "positions">>): ResourceTabs {
  return { ...state, tabs: state.tabs.map(tab => tab.path === path ? { ...tab, ...change } : tab) };
}
