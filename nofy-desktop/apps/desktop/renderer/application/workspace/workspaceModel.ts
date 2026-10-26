export type WorkspacePrefs = { selected: string | null; recent: string[] };
export function decodeWorkspacePrefs(value: unknown): WorkspacePrefs {
  const o = value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  const recent = Array.isArray(o.recent) ? [...new Set(o.recent.filter((p): p is string => typeof p === "string" && p.length > 0))].slice(0, 20) : [];
  return { selected: typeof o.selected === "string" && o.selected.length > 0 ? o.selected : null, recent };
}
export function rememberWorkspace(state: WorkspacePrefs, cwd: string): WorkspacePrefs {
  return { selected: cwd, recent: [cwd, ...state.recent.filter((p) => p !== cwd)].slice(0, 20) };
}
