// A0-S4-3: 自 modules/stores-session.tsx §3 原样迁入（s2 SplitLayoutStore + 布局模型/持久化恢复 + 顶层 subscribe；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 3. SplitLayoutStore（原 s2，js 121669–121703；布局模型 121368–121668）
 * ----------------------------------------------------------------------------
 * v4 分屏布局：二叉树窗格（leaf/split）+ 每窗格会话绑定 + 焦点。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | root | PaneTreeNode | 布局树根（缺省单叶 workspace-main） |
 *  | panes | Record<paneId, PaneBinding> | 非主窗格的会话绑定（主窗格不入表） |
 *  | focusedPaneId | string | 焦点窗格（缺省 workspace-main） |
 * actions（10）：splitPane/splitPaneWithBinding/openSessionInNewPane/replacePaneBinding/
 *   closePane/focusPane/bindPaneSession/setSplitRatio/confirmRestoredPaneSession/resetToPrimaryPane
 * 约束：最多 4 窗格（原 Y0）；比例钳制 0.25–0.75（原 H0）；主窗格不可关闭。
 * 持久化：`zcode-v4-pane-layout:v2`（subscribe 即写，原 Owt；仅 reload 时恢复，原 z0/kwt）。
 * ==========================================================================*/

export interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export interface PaneBinding {
  workspaceScope: WorkspaceScope;
  sessionId: string | null;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
}

export type PaneTreeNode =
  | { type: "leaf"; paneId: string }
  | { type: "split"; id: string; direction: "row" | "column"; ratio: number; first: PaneTreeNode; second: PaneTreeNode };

export interface SplitLayoutState {
  root: PaneTreeNode;
  panes: Record<string, PaneBinding>;
  focusedPaneId: string;
  splitPane(paneId: string, direction: "row" | "column", workspaceScope: WorkspaceScope): void;
  splitPaneWithBinding(paneId: string, side: "left" | "right" | "up" | "down", binding: PaneBinding): void;
  openSessionInNewPane(workspaceScope: WorkspaceScope, sessionId: string): void;
  replacePaneBinding(paneId: string, binding: PaneBinding): void;
  closePane(paneId: string): void;
  focusPane(paneId: string): void;
  bindPaneSession(paneId: string, sessionId: string): void;
  setSplitRatio(splitId: string, ratio: number): void;
  confirmRestoredPaneSession(paneId: string): void;
  resetToPrimaryPane(): void;
}

/* --- 常量与纯函数（原 121368–121512） --- */

export const PRIMARY_PANE_ID = "workspace-main"; // 原 B0
const MIN_SPLIT_RATIO = 0.25; // 原 cwt
const MAX_SPLIT_RATIO = 0.75; // 原 lwt
const DEFAULT_SPLIT_RATIO = 0.5; // 原 V0
const MAX_PANE_COUNT = 4;
export const PANE_LAYOUT_STORAGE_KEY = "zcode-v4-pane-layout:v2"; // 原 bwt
export const PANE_LAYOUT_LEGACY_STORAGE_KEY = "zcode-v4-pane-layout:v1"; // 原 xwt

export function clampSplitRatio(ratio: number): number {
  return Number.isFinite(ratio) ? Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, ratio)) : DEFAULT_SPLIT_RATIO;
}

/** 原 U0：工作区作用域键（identity 优先） */
export function workspaceScopeKey(scope: WorkspaceScope): string {
  return scope.workspaceIdentity?.trim() || scope.workspacePath;
}

/** 原 W0：绑定是否指向同一会话+工作区 */
export function bindingMatchesSession(binding: PaneBinding | undefined | null, scope: WorkspaceScope, sessionId: string): boolean {
  return !!binding && binding.sessionId === sessionId && workspaceScopeKey(binding.workspaceScope) === workspaceScopeKey(scope);
}

const PRIMARY_ROOT: PaneTreeNode = { type: "leaf", paneId: PRIMARY_PANE_ID }; // 原 G0
export const INITIAL_SPLIT_LAYOUT: Pick<SplitLayoutState, "root" | "panes" | "focusedPaneId"> = {
  root: PRIMARY_ROOT,
  panes: {},
  focusedPaneId: PRIMARY_PANE_ID,
}; // 原 K0

export function collectPaneIds(node: PaneTreeNode): string[] {
  return node.type === "leaf" ? [node.paneId] : [...collectPaneIds(node.first), ...collectPaneIds(node.second)];
}
export function paneCount(state: { root: PaneTreeNode }): number {
  return collectPaneIds(state.root).length;
}
export function canAddPane(state: { root: PaneTreeNode }): boolean {
  return paneCount(state) < MAX_PANE_COUNT;
}
export function containsPane(node: PaneTreeNode, paneId: string): boolean {
  return node.type === "leaf" ? node.paneId === paneId : containsPane(node.first, paneId) || containsPane(node.second, paneId);
}
export function effectiveFocusedPaneId(state: { root: PaneTreeNode; focusedPaneId: string }): string {
  return containsPane(state.root, state.focusedPaneId) ? state.focusedPaneId : PRIMARY_PANE_ID;
}

function nextPaneId(root: PaneTreeNode): string {
  let max = 0;
  for (const paneId of collectPaneIds(root)) {
    const match = /^pane-(\d+)$/.exec(paneId);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `pane-${max + 1}`;
}

function collectSplitIds(node: PaneTreeNode): string[] {
  return node.type === "leaf" ? [] : [node.id, ...collectSplitIds(node.first), ...collectSplitIds(node.second)];
}

function nextSplitId(root: PaneTreeNode): string {
  let max = 0;
  for (const id of collectSplitIds(root)) {
    const match = /^n(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `n${max + 1}`;
}

function replacePaneNode(root: PaneTreeNode, paneId: string, replacement: PaneTreeNode): PaneTreeNode {
  if (root.type === "leaf") return root.paneId === paneId ? replacement : root;
  const first = replacePaneNode(root.first, paneId, replacement);
  const second = replacePaneNode(root.second, paneId, replacement);
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

function removePaneNode(root: PaneTreeNode, paneId: string): PaneTreeNode | null {
  if (root.type === "leaf") return root.paneId === paneId ? null : root;
  const first = removePaneNode(root.first, paneId);
  if (first === null) return root.second;
  const second = removePaneNode(root.second, paneId);
  if (second === null) return root.first;
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

function setNodeRatio(root: PaneTreeNode, splitId: string, ratio: number): PaneTreeNode {
  if (root.type === "leaf") return root;
  if (root.id === splitId) return root.ratio === ratio ? root : { ...root, ratio };
  const first = setNodeRatio(root.first, splitId, ratio);
  const second = setNodeRatio(root.second, splitId, ratio);
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

/* --- 布局归约（原 fwt/n2/pwt/mwt/hwt/gwt/_wt/r2/vwt/ywt，js 121437–121512） --- */

type LayoutCore = Pick<SplitLayoutState, "root" | "panes" | "focusedPaneId">;

function reduceSplitPane(state: LayoutCore, paneId: string, direction: "row" | "column", binding: PaneBinding): LayoutCore {
  if (!containsPane(state.root, paneId) || !canAddPane(state)) return state;
  const newPaneId = nextPaneId(state.root);
  const split: PaneTreeNode = {
    type: "split",
    id: nextSplitId(state.root),
    direction,
    ratio: DEFAULT_SPLIT_RATIO,
    first: { type: "leaf", paneId },
    second: { type: "leaf", paneId: newPaneId },
  };
  return { root: replacePaneNode(state.root, paneId, split), panes: { ...state.panes, [newPaneId]: binding }, focusedPaneId: newPaneId };
}

function reduceSplitWithBinding(state: LayoutCore, paneId: string, side: "left" | "right" | "up" | "down", binding: PaneBinding): LayoutCore {
  if (!containsPane(state.root, paneId) || !canAddPane(state)) return state;
  const newPaneId = nextPaneId(state.root);
  const existingLeaf: PaneTreeNode = { type: "leaf", paneId };
  const newLeaf: PaneTreeNode = { type: "leaf", paneId: newPaneId };
  const newComesFirst = side === "left" || side === "up";
  const split: PaneTreeNode = {
    type: "split",
    id: nextSplitId(state.root),
    direction: side === "left" || side === "right" ? "row" : "column",
    ratio: DEFAULT_SPLIT_RATIO,
    first: newComesFirst ? newLeaf : existingLeaf,
    second: newComesFirst ? existingLeaf : newLeaf,
  };
  return { root: replacePaneNode(state.root, paneId, split), panes: { ...state.panes, [newPaneId]: binding }, focusedPaneId: newPaneId };
}

function reduceClosePane(state: LayoutCore, paneId: string): LayoutCore {
  if (paneId === PRIMARY_PANE_ID || !containsPane(state.root, paneId)) return state;
  const root = removePaneNode(state.root, paneId) ?? PRIMARY_ROOT;
  const panes = { ...state.panes };
  delete panes[paneId];
  return { root, panes, focusedPaneId: state.focusedPaneId === paneId ? PRIMARY_PANE_ID : state.focusedPaneId };
}

function reduceBindPaneSession(state: LayoutCore, paneId: string, sessionId: string): LayoutCore {
  const binding = state.panes[paneId];
  if (!binding || (binding.sessionId === sessionId && !binding.restoredUnvalidated)) return state;
  return { ...state, panes: { ...state.panes, [paneId]: { workspaceScope: binding.workspaceScope, sessionId } } };
}

function reduceReplacePaneBinding(state: LayoutCore, paneId: string, binding: PaneBinding): LayoutCore {
  if (!state.panes[paneId] || paneId === PRIMARY_PANE_ID) return state;
  return { ...state, panes: { ...state.panes, [paneId]: binding }, focusedPaneId: paneId };
}

/** 原 gwt：找已绑定该会话的窗格 */
export function findPaneIdBySession(state: LayoutCore, scope: WorkspaceScope, sessionId: string): string | null {
  for (const [paneId, binding] of Object.entries(state.panes)) if (bindingMatchesSession(binding, scope, sessionId)) return paneId;
  return null;
}

function reduceSetSplitRatio(state: LayoutCore, splitId: string, ratio: number): LayoutCore {
  const root = setNodeRatio(state.root, splitId, clampSplitRatio(ratio));
  return root === state.root ? state : { ...state, root };
}

function reduceFocusPane(state: LayoutCore, paneId: string): LayoutCore {
  return state.focusedPaneId === paneId || !containsPane(state.root, paneId) ? state : { ...state, focusedPaneId: paneId };
}

function reduceConfirmRestoredPaneSession(state: LayoutCore, paneId: string): LayoutCore {
  const binding = state.panes[paneId];
  return binding?.restoredUnvalidated
    ? { ...state, panes: { ...state.panes, [paneId]: { workspaceScope: binding.workspaceScope, sessionId: binding.sessionId } } }
    : state;
}

function reduceOpenSessionInNewPane(state: LayoutCore, scope: WorkspaceScope, sessionId: string): LayoutCore {
  const scopeKey = workspaceScopeKey(scope);
  for (const [paneId, binding] of Object.entries(state.panes)) {
    if (binding.sessionId === sessionId && workspaceScopeKey(binding.workspaceScope) === scopeKey) return reduceFocusPane(state, paneId);
  }
  return reduceSplitPane(state, effectiveFocusedPaneId(state), "row", { workspaceScope: scope, sessionId });
}

/* --- 持久化（原 Cwt 校验解析 / kwt 恢复 / Owt 保存，js 121514–121668） --- */

function parsePersistedLayout(raw: unknown): LayoutCore | null {
  /* 原 Cwt：结构校验 —— 树合法、≤4 叶、恰一个 workspace-main、绑定齐备 */
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { root?: unknown; panes?: unknown; focusedPaneId?: unknown };
  const root = parsePersistedNode(candidate.root);
  if (!root) return null;
  const paneIds = collectPaneIds(root);
  if (paneIds.length > MAX_PANE_COUNT || new Set(paneIds).size !== paneIds.length || paneIds.filter((id) => id === PRIMARY_PANE_ID).length !== 1) return null;
  const rawPanes = typeof candidate.panes === "object" && candidate.panes !== null ? (candidate.panes as Record<string, unknown>) : {};
  const panes: Record<string, PaneBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const binding = parsePersistedBinding(rawPanes[paneId]);
    if (!binding) return null;
    panes[paneId] = binding;
  }
  const focusedPaneId = typeof candidate.focusedPaneId === "string" && paneIds.includes(candidate.focusedPaneId) ? candidate.focusedPaneId : PRIMARY_PANE_ID;
  return { root, panes, focusedPaneId };
}

function parsePersistedNode(raw: unknown): PaneTreeNode | null {
  if (typeof raw !== "object" || raw === null) return null;
  const node = raw as { type?: string; paneId?: string; id?: string; direction?: string; ratio?: number; first?: unknown; second?: unknown };
  if (node.type === "leaf") return typeof node.paneId === "string" && node.paneId.length > 0 ? { type: "leaf", paneId: node.paneId } : null;
  if (node.type === "split") {
    if (typeof node.id !== "string" || node.id.length === 0 || (node.direction !== "row" && node.direction !== "column")) return null;
    const first = parsePersistedNode(node.first);
    const second = parsePersistedNode(node.second);
    return !first || !second
      ? null
      : { type: "split", id: node.id, direction: node.direction, ratio: clampSplitRatio(typeof node.ratio === "number" ? node.ratio : NaN), first, second };
  }
  return null;
}

function parsePersistedBinding(raw: unknown): PaneBinding | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { workspaceScope?: unknown; sessionId?: unknown };
  const scope = parsePersistedScope(candidate.workspaceScope);
  return scope && typeof candidate.sessionId === "string"
    ? { workspaceScope: scope, sessionId: candidate.sessionId, restoredUnvalidated: true }
    : null;
}

function parsePersistedScope(raw: unknown): WorkspaceScope | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { workspacePath?: unknown; workspaceIdentity?: unknown; remoteSessionId?: unknown };
  if (typeof candidate.workspacePath !== "string" || candidate.workspacePath.length === 0) return null;
  return {
    workspacePath: candidate.workspacePath,
    ...(typeof candidate.workspaceIdentity === "string" && candidate.workspaceIdentity.trim().length > 0 ? { workspaceIdentity: candidate.workspaceIdentity } : {}),
    ...(typeof candidate.remoteSessionId === "string" && candidate.remoteSessionId.length > 0 ? { remoteSessionId: candidate.remoteSessionId } : {}),
  };
}

/** 原 z0：本次导航是否为 renderer reload（只有 reload 才恢复分屏布局） */
export function isRendererReload(entries: PerformanceEntryList = navigationEntries()): boolean {
  return (entries[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
}

function navigationEntries(): PerformanceEntryList {
  try {
    return typeof globalThis.performance?.getEntriesByType === "function" ? globalThis.performance.getEntriesByType("navigation") : ([] as unknown as PerformanceEntryList);
  } catch {
    return [] as unknown as PerformanceEntryList;
  }
}

/** 原 kwt：reload 时从 localStorage 恢复布局 */
function restorePersistedLayout(): LayoutCore | null {
  try {
    const raw = globalThis.localStorage?.getItem(PANE_LAYOUT_STORAGE_KEY);
    return raw ? parsePersistedLayout(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** 原 Owt：布局变更即持久化（s2.subscribe 挂载） */
function persistLayout(state: LayoutCore): void {
  try {
    globalThis.localStorage?.setItem(PANE_LAYOUT_STORAGE_KEY, JSON.stringify({ version: 2, ...state }));
  } catch {
    /* 静默 */
  }
}

const restoredLayout = isRendererReload() ? restorePersistedLayout() : null; // 原 Awt

export const useSplitLayoutStore: UseBoundStore<SplitLayoutState> = createStore<SplitLayoutState>((set) => ({
  ...(restoredLayout ?? INITIAL_SPLIT_LAYOUT),
  splitPane: (paneId, direction, workspaceScope) => {
    set((state) => reduceSplitPane(state, paneId, direction, { workspaceScope, sessionId: null }));
  },
  splitPaneWithBinding: (paneId, side, binding) => {
    set((state) => reduceSplitWithBinding(state, paneId, side, binding));
  },
  openSessionInNewPane: (workspaceScope, sessionId) => {
    set((state) => reduceOpenSessionInNewPane(state, workspaceScope, sessionId));
  },
  replacePaneBinding: (paneId, binding) => {
    set((state) => reduceReplacePaneBinding(state, paneId, binding));
  },
  closePane: (paneId) => {
    set((state) => reduceClosePane(state, paneId));
  },
  focusPane: (paneId) => {
    set((state) => reduceFocusPane(state, paneId));
  },
  bindPaneSession: (paneId, sessionId) => {
    set((state) => reduceBindPaneSession(state, paneId, sessionId));
  },
  setSplitRatio: (splitId, ratio) => {
    set((state) => reduceSetSplitRatio(state, splitId, ratio));
  },
  confirmRestoredPaneSession: (paneId) => {
    set((state) => reduceConfirmRestoredPaneSession(state, paneId));
  },
  resetToPrimaryPane: () => {
    set(INITIAL_SPLIT_LAYOUT);
  },
}));

useSplitLayoutStore.subscribe((state) => {
  persistLayout(state);
});


// A0-S4-3: §4 SessionRouterStore 消费的 §3 局部符号（原同文件模块内可见；迁出后补导出，实体不变）
export { MAX_PANE_COUNT, parsePersistedNode, parsePersistedScope, reduceFocusPane, reduceSplitWithBinding, reduceClosePane, reduceSetSplitRatio };
export type { LayoutCore };
