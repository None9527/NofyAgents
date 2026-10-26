import type { FileWorkspaceView } from "./fileWorkspacePrefs.ts";
import type { FilesClient } from "../contracts/public.ts";
import type { FsFile, FsNode } from "../../ui/readers.ts";
import { closeResource, openResource, updateResource } from "./resourceTabs.ts";
import type { FileViewMode, ResourceTabs } from "./resourceTabs.ts";
type Document = { file: FsFile | null; busy: boolean; error: string | null; stale?: boolean };
export type FileResourcesSnapshot = {
  dirs: Record<string, { nodes: FsNode[]; truncated: boolean }>;
  expanded: Set<string>; loading: Set<string>; error: string | null;
  resources: ResourceTabs; documents: Record<string, Document>;
  treeOpen: boolean; treeWidth: number; query: string;
  preview: { path: string; file: FsFile | null; busy: boolean } | null;
};
/** Read-only file queries and tab state. Suspend invalidates pending work, keeping view state. */
export function createFileResources(files: FilesClient, sessionId: string | null, valid: () => boolean, initial?: FileWorkspaceView, onView?: (view: FileWorkspaceView) => void) {
  let state: FileResourcesSnapshot = { dirs: {}, expanded: new Set(), loading: new Set(), error: null, resources: { tabs: [], active: null }, documents: {}, treeOpen: true, treeWidth: 200, query: "", preview: null };
  if (initial) state = { ...state, resources: initial.resources, expanded: new Set(initial.expanded), treeOpen: initial.treeOpen, treeWidth: initial.treeWidth };
  let disposed = false, suspended = false, generation = 0, readVersion = 0;
  const listeners = new Set<() => void>();
  const directories = new Map<string, Promise<void>>();
  const reads = new Map<string, Promise<void>>();
  const versions = new Map<string, number>();
  const directoryVersions = new Map<string, number>();
  const current = () => !disposed && !suspended && valid();
  const publish = (patch: Partial<FileResourcesSnapshot>) => {
    const viewChanged = Boolean(patch.resources || patch.expanded || patch.treeOpen !== undefined || patch.treeWidth !== undefined);
    state = { ...state, ...patch };
    const path = state.resources.active, document = path ? state.documents[path] : null;
    state = { ...state, preview: path ? { path, file: document?.file ?? null, busy: document?.busy ?? false } : null };
    if (viewChanged) onView?.({ resources: state.resources, expanded: [...state.expanded], treeOpen: state.treeOpen, treeWidth: state.treeWidth });
    for (const fn of [...listeners]) fn();
  };
  const update = (patch: Partial<FileResourcesSnapshot>) => { if (current()) publish(patch); };
  const removeUnused = (resources: ResourceTabs) => {
    const documents = { ...state.documents };
    for (const path of Object.keys(documents)) if (!resources.tabs.some(tab => tab.path === path)) {
      delete documents[path]; versions.delete(path); reads.delete(path);
    }
    return documents;
  };
  const loadDir = (path: string, refresh = false): Promise<void> => {
    if (!current()) return Promise.resolve();
    if (directories.has(path) && !refresh) return directories.get(path)!;
    const token = generation, revision = ++readVersion; directoryVersions.set(path,revision);
    update({ loading: new Set(state.loading).add(path) });
    const work = files.list(sessionId, path).then(result => {
      if (!current() || token !== generation || directoryVersions.get(path) !== revision) return;
      const loading = new Set(state.loading); loading.delete(path);
      update(result.ok ? { loading, dirs: { ...state.dirs, [path]: result.value }, error: null } : { loading, error: path + "：" + result.error });
    }, error => {
      if (!current() || token !== generation || directoryVersions.get(path) !== revision) return;
      const loading = new Set(state.loading); loading.delete(path);
      update({ loading, error: error instanceof Error ? error.message : String(error) });
    }).finally(() => { if (token === generation && directoryVersions.get(path) === revision) directories.delete(path); });
    directories.set(path, work); return work;
  };
  const readFile = (path: string, refresh = false): Promise<void> => {
    if (!current()) return Promise.resolve();
    if (reads.has(path) && !refresh) return reads.get(path)!;
    if (!refresh && state.documents[path]?.file && !state.documents[path]?.stale) return Promise.resolve();
    const token = ++readVersion, epoch = generation;
    versions.set(path, token);
    update({ documents: { ...state.documents, [path]: { file: state.documents[path]?.file ?? null, busy: true, error: null } } });
    const accepts = () => current() && epoch === generation && versions.get(path) === token && state.resources.tabs.some(tab => tab.path === path);
    const work = files.read(sessionId, path).then(result => {
      if (!accepts()) return;
      update({ documents: { ...state.documents, [path]: { file: result.ok ? result.value : state.documents[path]?.file ?? null, busy: false, error: result.ok ? null : result.error, stale: !result.ok } } });
    }, error => { if (accepts()) update({ documents: { ...state.documents, [path]: { file: state.documents[path]?.file ?? null, busy: false, stale: true, error: error instanceof Error ? error.message : String(error) } } }); })
      .finally(() => { if (epoch === generation && versions.get(path) === token) reads.delete(path); });
    reads.set(path, work); return work;
  };
  const closeFile = (path: string) => { const resources = closeResource(state.resources, path); update({ resources, documents: removeUnused(resources) }); };
  return {
    getSnapshot: () => state,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    loadDir,
    toggleDir: (path: string) => {
      if (!current()) return;
      const expanded = new Set(state.expanded);
      if (expanded.has(path)) expanded.delete(path); else { expanded.add(path); if (!state.dirs[path]) void loadDir(path); }
      update({ expanded });
    },
    openFile: (path: string, pinned = false) => {
      if (!current()) return Promise.resolve();
      if (!state.resources.tabs.some(tab => tab.path === path) && state.resources.tabs.length >= 12 && (pinned || state.resources.tabs.every(tab => tab.pinned))) { update({ error: "最多打开 12 个文件标签，请先关闭其他标签。" }); return Promise.resolve(); }
      const resources = openResource(state.resources, path, pinned);
      update({ resources, documents: removeUnused(resources), error: null });
      return readFile(path);
    },
    activate: (path: string) => { if (state.resources.tabs.some(tab => tab.path === path)) { update({ resources: { ...state.resources, active: path } }); void readFile(path); } },
    pin: (path: string) => update({ resources: updateResource(state.resources, path, { pinned: true }) }),
    closeFile,
    closePreview: () => { if (state.resources.active) closeFile(state.resources.active); },
    setMode: (path: string, mode: FileViewMode) => update({ resources: updateResource(state.resources, path, { mode }) }),
    savePosition: (path: string, mode: FileViewMode, position: number) => {
      const tab = state.resources.tabs.find(tab => tab.path === path);
      if (!tab || !Number.isFinite(position) || position < 0 || tab.positions[mode] === position) return;
      update({ resources: updateResource(state.resources, path, { positions: { ...tab.positions, [mode]: position } }) });
    },
    setTreeWidth: (width: number) => { if (Number.isFinite(width)) update({ treeWidth: Math.round(Math.max(150, Math.min(480, width))) }); },
    toggleTree: () => update({ treeOpen: !state.treeOpen }),
    setQuery: (query: string) => update({ query }),
    invalidate: (root: string, paths: string[]) => {
      const related = (path: string) => paths.some(change => path === change || path.startsWith(change.replace(/\/$/, "") + "/"));
      const directoriesToRead = new Set([root,...state.expanded]);
      for (const directory of directoriesToRead) if (related(directory) || paths.some(path => path.startsWith(directory.replace(/\/$/, "") + "/"))) void loadDir(directory,true);
      const documents = { ...state.documents };
      for (const path of Object.keys(documents)) if (related(path)) documents[path] = { ...documents[path]!, stale: true };
      update({ documents });
      if (state.resources.active && related(state.resources.active)) void readFile(state.resources.active,true);
    },
    refresh: (root: string) => { void loadDir(root,true); for (const path of state.expanded) void loadDir(path,true); if (state.resources.active) void readFile(state.resources.active, true); },
    resume: () => { suspended = false; },
    suspend: () => {
      suspended = true; generation++; directories.clear(); reads.clear();
      const documents = Object.fromEntries(Object.entries(state.documents).map(([path, doc]) => [path, { ...doc, busy: false }]));
      publish({ documents, loading: new Set() });
    },
    dispose: () => { disposed = true; generation++; directories.clear(); reads.clear(); listeners.clear(); },
  };
}
