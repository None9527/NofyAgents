import type { ResourceTabs } from "./resourceTabs.ts";
export type FileWorkspaceView = { resources: ResourceTabs; expanded: string[]; treeOpen: boolean; treeWidth: number };
export function decodeFileWorkspaceView(raw: unknown, root: string | null): FileWorkspaceView | undefined {
  if (!root || !raw || typeof raw !== "object") return;
  const value = raw as Record<string, unknown>;
  const inside = (path: unknown): path is string => typeof path === "string" && path.length < 32768 && !path.includes("\0") && !path.split("/").includes("..") && (path === root || path.startsWith(root.replace(/\/$/, "") + "/"));
  const paths = new Set<string>();
  const tabs: ResourceTabs["tabs"] = [];
  if (Array.isArray(value.tabs)) for (const item of value.tabs.slice(0,12)) {
    if (!item || typeof item !== "object" || !inside(item.path) || paths.has(item.path)) continue;
    paths.add(item.path); const pos = item.positions;
    const position = (mode: string) => pos && typeof pos[mode] === "number" && Number.isFinite(pos[mode]) ? Math.max(0,Math.min(10_000_000,pos[mode])) : 0;
    tabs.push({ path: item.path, pinned: true, mode: item.mode === "preview" ? "preview" : "source", positions: { preview: position("preview"), source: position("source") } });
  }
  return { resources: { tabs, active: tabs.some(tab => tab.path === value.active) ? value.active as string : tabs[0]?.path ?? null }, expanded: Array.isArray(value.expanded) ? value.expanded.filter(inside).slice(0,32) : [], treeOpen: value.treeOpen !== false, treeWidth: typeof value.treeWidth === "number" && Number.isFinite(value.treeWidth) ? Math.max(150,Math.min(480,value.treeWidth)) : 200 };
}
export function encodeFileWorkspaceView(view: FileWorkspaceView) {
  const tabs = view.resources.tabs.filter(tab => tab.pinned);
  return { tabs, active: tabs.some(tab => tab.path === view.resources.active) ? view.resources.active : tabs[0]?.path ?? null, expanded: view.expanded.slice(0,32), treeOpen: view.treeOpen, treeWidth: view.treeWidth };
}
