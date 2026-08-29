// A0-S4-3: 自 modules/stores-session.tsx §4 原样迁入（A2 SessionRouterStore + 工作组模型 + 顶层 subscribe；原文件现为薄 re-export shim）。
import { workspaceScopeKey, PRIMARY_PANE_ID, canAddPane, collectPaneIds, effectiveFocusedPaneId, INITIAL_SPLIT_LAYOUT, paneCount, MAX_PANE_COUNT, parsePersistedNode, parsePersistedScope, reduceFocusPane, reduceSplitWithBinding, reduceClosePane, reduceSetSplitRatio } from './splitLayoutStore';
import type { WorkspaceScope, PaneTreeNode, PaneBinding, LayoutCore } from './splitLayoutStore';
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 4. SessionRouterStore（原 A2，js 122619–122802；工作组模型 122284–122618）
 * ----------------------------------------------------------------------------
 * v4 工作台“会话组”路由：把分屏布局升格为可命名复用的一组会话
 * （primaryBinding + 分屏 panes），侧栏打开任务时聚焦/分裂/建组。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | activeGroupId | string \| null | 当前激活组 |
 *  | groups | Record<groupId, WorkbenchGroup> | 组表 |
 *  | sessionIndex | Record<sessionKey, groupId> | 会话键→组 反查索引 |
 * actions（13）：configureClientMode/openSessionFromSidebar/splitSessionIntoGroup/
 *   promotePaneLayoutToGroup/focusPane/closePane/confirmRestoredPaneSession/
 *   bindPaneSession/setSplitRatio/isSessionGrouped/getActiveContext/
 *   deactivateActiveGroup/resetWorkbenchGroups
 * 客户端模式（原 _2）：'desktop-continuous'（缺省）| 'web-remote-replayable'
 *   （回放模式禁用全部组操作，y2 门）。
 * 持久化：`zcode-v4-session-workbench-groups:v1`（subscribe 即写，原 wTt；
 *   恢复时所有绑定标 restoredUnvalidated，原 xTt）。
 * ==========================================================================*/

export interface SessionBinding {
  workspaceScope: WorkspaceScope;
  sessionId: string;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
}

export interface WorkbenchGroup {
  id: string;
  primaryBinding: SessionBinding;
  root: PaneTreeNode;
  panes: Record<string, SessionBinding>;
  focusedPaneId: string;
  updatedAt: number;
}

export type ClientMode = "desktop-continuous" | "web-remote-replayable";

export interface SessionRouterState {
  activeGroupId: string | null;
  groups: Record<string, WorkbenchGroup>;
  sessionIndex: Record<string, string>;
  configureClientMode(mode: ClientMode): void;
  openSessionFromSidebar(binding: SessionBinding): void;
  splitSessionIntoGroup(anchorPaneId: string, side: "left" | "right" | "up" | "down", binding: SessionBinding, primaryBinding?: SessionBinding): void;
  promotePaneLayoutToGroup(primaryBinding: SessionBinding, layout: LayoutCore): boolean;
  focusPane(groupId: string, paneId: string): void;
  closePane(groupId: string, paneId: string): void;
  confirmRestoredPaneSession(groupId: string, paneId: string): void;
  bindPaneSession(groupId: string, paneId: string, sessionId: string): void;
  setSplitRatio(groupId: string, splitId: string, ratio: number): void;
  isSessionGrouped(scope: WorkspaceScope, sessionId: string | null): boolean;
  getActiveContext(): SessionBinding | null;
  deactivateActiveGroup(): void;
  resetWorkbenchGroups(): void;
}

/* --- 键与纯函数（原 122284–122488） --- */

export const WORKBENCH_GROUPS_STORAGE_KEY = "zcode-v4-session-workbench-groups:v1"; // 原 nTt
const INITIAL_ROUTER_STATE: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex"> = {
  activeGroupId: null,
  groups: {},
  sessionIndex: {},
}; // 原 g2

let clientMode: ClientMode = "desktop-continuous"; // 原 _2
let hydratedFromStorage = false; // 原 v2

/** 原 y2：组功能门（回放模式禁用） */
export function isGroupRoutingEnabled(): boolean {
  return clientMode !== "web-remote-replayable";
}

/** 原 b2：会话键 = 工作区键::会话 id */
export function sessionKeyOf(scope: WorkspaceScope, sessionId: string): string {
  return `${workspaceScopeKey(scope)}::${sessionId}`;
}

function bindingKey(binding: SessionBinding): string {
  return sessionKeyOf(binding.workspaceScope, binding.sessionId);
}

function sameBinding(a: SessionBinding, b: SessionBinding): boolean {
  return bindingKey(a) === bindingKey(b);
}

function groupBindings(group: WorkbenchGroup): SessionBinding[] {
  return [group.primaryBinding, ...Object.values(group.panes)];
}

function groupHasBinding(group: WorkbenchGroup, binding: SessionBinding): boolean {
  return groupBindings(group).some((item) => bindingKey(item) === bindingKey(binding));
}

function bindingForPane(group: WorkbenchGroup, paneId: string): SessionBinding | null {
  return paneId === PRIMARY_PANE_ID ? group.primaryBinding : (group.panes[paneId] ?? null);
}

/** 原 E2：组的焦点上下文 */
export function focusedGroupBinding(group: WorkbenchGroup): SessionBinding | null {
  return bindingForPane(group, group.focusedPaneId);
}

function paneIdForGroupBinding(group: WorkbenchGroup, binding: SessionBinding): string | null {
  if (sameBinding(group.primaryBinding, binding)) return PRIMARY_PANE_ID;
  for (const [paneId, item] of Object.entries(group.panes)) if (sameBinding(item, binding)) return paneId;
  return null;
}

function nextGroupId(groups: Record<string, WorkbenchGroup>): string {
  let max = 0;
  for (const id of Object.keys(groups)) {
    const match = /^group-(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `group-${max + 1}`;
}

function rebuildSessionIndex(groups: Record<string, WorkbenchGroup>): Record<string, string> {
  const index: Record<string, string> = {};
  for (const group of Object.values(groups)) for (const binding of groupBindings(group)) index[bindingKey(binding)] = group.id;
  return index;
}

function upsertGroup(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">, group: WorkbenchGroup) {
  const groups = { ...state.groups, [group.id]: group };
  return { activeGroupId: group.id, groups, sessionIndex: rebuildSessionIndex(groups) };
}

function removeGroup(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">, groupId: string) {
  const groups = { ...state.groups };
  delete groups[groupId];
  return { activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId, groups, sessionIndex: rebuildSessionIndex(groups) };
}

/* 组内布局归约复用 SplitLayout 的归约（原 lTt/uTt/dTt/fTt 基于 r2/n2/pwt） */

function focusGroupPane(group: WorkbenchGroup, paneId: string, updatedAt: number = Date.now()): WorkbenchGroup {
  const next = reduceFocusPane(group, paneId);
  return next === group ? group : { ...group, focusedPaneId: next.focusedPaneId, updatedAt };
}

/** 原 C2：PaneBinding → SessionBinding（sessionId 必须是字符串；对应原校验） */
function toSessionBinding(binding: PaneBinding | undefined | null): SessionBinding | null {
  if (!binding || typeof binding.sessionId !== "string") return null;
  return {
    workspaceScope: binding.workspaceScope,
    sessionId: binding.sessionId,
    ...(binding.readOnly ? { readOnly: true } : {}),
    ...(binding.restoredUnvalidated ? { restoredUnvalidated: true } : {}),
  };
}

function splitGroupPane(group: WorkbenchGroup, anchorPaneId: string, side: "left" | "right" | "up" | "down", binding: SessionBinding, updatedAt: number = Date.now()): WorkbenchGroup {
  if (groupHasBinding(group, binding) || !canAddPane(group)) return group;
  const next = reduceSplitWithBinding(group, anchorPaneId, side, binding);
  if (next === group) return group;
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId, item] of Object.entries(next.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId] = converted;
  }
  return { ...group, root: next.root, panes, focusedPaneId: next.focusedPaneId, updatedAt };
}

function closeGroupPane(group: WorkbenchGroup, paneId: string, updatedAt: number = Date.now()): WorkbenchGroup | null {
  if (paneId === PRIMARY_PANE_ID) return null;
  const next = reduceClosePane(group, paneId);
  if (next === group) return group;
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId2, item] of Object.entries(next.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId2] = converted;
  }
  const candidate = { ...group, root: next.root, panes, focusedPaneId: next.focusedPaneId, updatedAt };
  return paneCount(candidate) < 2 ? null : candidate;
}

function confirmGroupRestoredPane(group: WorkbenchGroup, paneId: string): WorkbenchGroup {
  if (paneId === PRIMARY_PANE_ID) {
    if (!group.primaryBinding.restoredUnvalidated) return group;
    const { restoredUnvalidated: _drop, ...primaryBinding } = group.primaryBinding;
    return { ...group, primaryBinding };
  }
  const binding = group.panes[paneId];
  if (!binding?.restoredUnvalidated) return group;
  const { restoredUnvalidated: _drop, ...rest } = binding;
  return { ...group, panes: { ...group.panes, [paneId]: rest } };
}

/** 原 sTt：以 primary + 一次分裂创建组 */
function createGroupFromSplit(primaryBinding: SessionBinding, binding: SessionBinding, side: "left" | "right" | "up" | "down", options: { id?: string; updatedAt?: number } = {}): WorkbenchGroup {
  const layout = reduceSplitWithBinding(INITIAL_SPLIT_LAYOUT, PRIMARY_PANE_ID, side, binding);
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId, item] of Object.entries(layout.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId] = converted;
  }
  return {
    id: options.id ?? "group-1",
    primaryBinding,
    root: layout.root,
    panes,
    focusedPaneId: layout.focusedPaneId,
    updatedAt: options.updatedAt ?? Date.now(),
  };
}

/** 原 cTt：把现有分屏布局升格为组（所有非主窗格必须有绑定） */
function promoteLayoutToGroup(primaryBinding: SessionBinding, layout: LayoutCore, options: { id?: string; updatedAt?: number } = {}): WorkbenchGroup | null {
  const paneIds = collectPaneIds(layout.root);
  if (paneIds.length < 2 || !paneIds.includes(PRIMARY_PANE_ID)) return null;
  const panes: Record<string, SessionBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const converted = toSessionBinding(layout.panes[paneId]);
    if (!converted) return null;
    panes[paneId] = converted;
  }
  return {
    id: options.id ?? "group-1",
    primaryBinding,
    root: layout.root,
    panes,
    focusedPaneId: effectiveFocusedPaneId(layout),
    updatedAt: options.updatedAt ?? Date.now(),
  };
}

/* --- 持久化（原 yTt/O2/k2/bTt/xTt/STt/CTt/wTt/TTt，js 122489–122618） --- */

function persistWorkbenchGroups(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">): void {
  if (!isGroupRoutingEnabled()) return;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    const groups = Object.fromEntries(
      Object.entries(state.groups).map(([groupId, group]) => {
        const { restoredUnvalidated: _dropPrimary, ...primaryBinding } = group.primaryBinding;
        const panes = Object.fromEntries(
          Object.entries(group.panes).map(([paneId, binding]) => {
            const { restoredUnvalidated: _dropPane, ...rest } = binding;
            return [paneId, rest];
          }),
        );
        return [groupId, { ...group, primaryBinding, panes }];
      }),
    );
    storage.setItem(
      WORKBENCH_GROUPS_STORAGE_KEY,
      JSON.stringify({ version: 1, activeGroupId: state.activeGroupId, groups, sessionIndex: state.sessionIndex }),
    );
  } catch {
    /* 静默 */
  }
}

/** 原 TTt：从 localStorage 恢复（校验见原 CTt/STt/xTt；绑定一律标 restoredUnvalidated） */
function restoreWorkbenchGroups(): Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex"> | null {
  if (!isGroupRoutingEnabled()) return null;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const raw = storage.getItem(WORKBENCH_GROUPS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { activeGroupId?: unknown; groups?: unknown };
    if (typeof parsed !== "object" || parsed === null) return null;
    const rawGroups = typeof parsed.groups === "object" && parsed.groups !== null ? Object.values(parsed.groups as Record<string, unknown>) : [];
    const groups: Record<string, WorkbenchGroup> = {};
    const sessionIndex: Record<string, string> = {};
    for (const rawGroup of rawGroups) {
      const group = parsePersistedGroup(rawGroup);
      if (!group || groups[group.id]) continue;
      const keys = groupBindings(group).map(bindingKey);
      if (keys.some((key) => sessionIndex[key])) continue;
      groups[group.id] = group;
      for (const key of keys) sessionIndex[key] = group.id;
    }
    if (Object.keys(groups).length === 0) return null;
    return {
      activeGroupId: typeof parsed.activeGroupId === "string" && groups[parsed.activeGroupId] ? parsed.activeGroupId : null,
      groups,
      sessionIndex,
    };
  } catch {
    return null;
  }
}

function parsePersistedGroup(raw: unknown): WorkbenchGroup | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { id?: unknown; primaryBinding?: unknown; root?: unknown; panes?: unknown; focusedPaneId?: unknown; updatedAt?: unknown };
  if (typeof candidate.id !== "string") return null;
  const primaryBinding = parsePersistedSessionBinding(candidate.primaryBinding);
  const root = parsePersistedNode(candidate.root);
  if (!primaryBinding || !root) return null;
  const paneIds = collectPaneIds(root);
  if (new Set(paneIds).size !== paneIds.length || !paneIds.includes(PRIMARY_PANE_ID) || paneIds.length > MAX_PANE_COUNT) return null;
  const rawPanes = typeof candidate.panes === "object" && candidate.panes !== null ? (candidate.panes as Record<string, unknown>) : {};
  const panes: Record<string, SessionBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const binding = parsePersistedSessionBinding(rawPanes[paneId]);
    if (!binding) return null;
    panes[paneId] = binding;
  }
  const focusedPaneId = typeof candidate.focusedPaneId === "string" && paneIds.includes(candidate.focusedPaneId) ? candidate.focusedPaneId : PRIMARY_PANE_ID;
  const group: WorkbenchGroup = {
    id: candidate.id,
    primaryBinding,
    root,
    panes,
    focusedPaneId,
    updatedAt: typeof candidate.updatedAt === "number" ? candidate.updatedAt : 0,
  };
  return paneCount(group) < 2 ? null : group;
}

function parsePersistedSessionBinding(raw: unknown): SessionBinding | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { sessionId?: unknown; workspaceScope?: unknown; readOnly?: unknown };
  if (typeof candidate.sessionId !== "string" || candidate.readOnly === true) return null;
  const scope = parsePersistedScope(candidate.workspaceScope);
  return scope ? { workspaceScope: scope, sessionId: candidate.sessionId, restoredUnvalidated: true } : null;
}

export const useSessionRouterStore: UseBoundStore<SessionRouterState> = createStore<SessionRouterState>((set, get) => ({
  ...INITIAL_ROUTER_STATE,
  configureClientMode: (mode) => {
    if (mode === "web-remote-replayable") {
      clientMode = mode;
      hydratedFromStorage = false;
      set(INITIAL_ROUTER_STATE);
      return;
    }
    clientMode = mode;
    if (hydratedFromStorage) return;
    hydratedFromStorage = true;
    const restored = restoreWorkbenchGroups();
    if (restored) set(restored);
  },
  openSessionFromSidebar: (binding) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const groupId = state.sessionIndex[bindingKey(binding)];
      if (!groupId) return state.activeGroupId === null ? state : { ...state, activeGroupId: null };
      const group = state.groups[groupId];
      if (!group) return { ...state, activeGroupId: null };
      const paneId = paneIdForGroupBinding(group, binding);
      if (!paneId) return state;
      return upsertGroup({ ...state, activeGroupId: groupId }, focusGroupPane(group, paneId));
    });
  },
  splitSessionIntoGroup: (anchorPaneId, side, binding, primaryBinding) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const key = bindingKey(binding);
      if (state.sessionIndex[key]) return state;
      const active = state.activeGroupId ? state.groups[state.activeGroupId] : undefined;
      if (active) {
        const next = splitGroupPane(active, anchorPaneId, side, binding);
        return next === active ? state : upsertGroup(state, next);
      }
      if (!primaryBinding || sameBinding(primaryBinding, binding) || state.sessionIndex[bindingKey(primaryBinding)]) return state;
      return upsertGroup(state, createGroupFromSplit(primaryBinding, binding, side, { id: nextGroupId(state.groups) }));
    });
  },
  promotePaneLayoutToGroup: (primaryBinding, layout) => {
    if (!isGroupRoutingEnabled()) return false;
    const state = get();
    const group = promoteLayoutToGroup(primaryBinding, layout, { id: nextGroupId(state.groups) });
    if (!group) return false;
    const keys = groupBindings(group).map(bindingKey);
    if (new Set(keys).size !== keys.length || keys.some((key) => !!state.sessionIndex[key])) return false;
    set(upsertGroup(state, group));
    return true;
  },
  focusPane: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = focusGroupPane(group, paneId);
      return next === group && state.activeGroupId === groupId ? state : upsertGroup({ ...state, activeGroupId: groupId }, next);
    });
  },
  closePane: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = closeGroupPane(group, paneId);
      if (next) return next === group ? state : upsertGroup(state, next);
      return removeGroup(state, groupId);
    });
  },
  confirmRestoredPaneSession: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = confirmGroupRestoredPane(group, paneId);
      return next === group ? state : upsertGroup(state, next);
    });
  },
  bindPaneSession: (groupId, paneId, sessionId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      const existing = group ? bindingForPane(group, paneId) : null;
      if (!group || !existing || existing.sessionId === sessionId) return state;
      const nextBinding: SessionBinding = {
        workspaceScope: existing.workspaceScope,
        sessionId,
        ...(existing.readOnly ? { readOnly: true } : {}),
      };
      const nextKey = bindingKey(nextBinding);
      const owner = state.sessionIndex[nextKey];
      if ((owner && owner !== groupId) || (owner === groupId && !sameBinding(existing, nextBinding))) return state;
      return upsertGroup(
        state,
        paneId === PRIMARY_PANE_ID
          ? { ...group, primaryBinding: nextBinding, updatedAt: Date.now() }
          : { ...group, panes: { ...group.panes, [paneId]: nextBinding }, updatedAt: Date.now() },
      );
    });
  },
  setSplitRatio: (groupId, splitId, ratio) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = reduceSetSplitRatio(group, splitId, ratio);
      return next.root === group.root ? state : upsertGroup(state, { ...group, root: next.root, updatedAt: Date.now() });
    });
  },
  isSessionGrouped: (scope, sessionId) => (!isGroupRoutingEnabled() || !sessionId ? false : !!get().sessionIndex[sessionKeyOf(scope, sessionId)]),
  getActiveContext: () => {
    if (!isGroupRoutingEnabled()) return null;
    const state = get();
    const group = state.activeGroupId ? state.groups[state.activeGroupId] : undefined;
    return group ? focusedGroupBinding(group) : null;
  },
  deactivateActiveGroup: () => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => (state.activeGroupId === null ? state : { ...state, activeGroupId: null }));
  },
  resetWorkbenchGroups: () => {
    set(INITIAL_ROUTER_STATE);
  },
}));

useSessionRouterStore.subscribe((state) => {
  if (isGroupRoutingEnabled()) persistWorkbenchGroups(state);
});
