// A0-S4-5: 自 modules/services.tsx §C.4 原样迁入（远端断开错误/占位服务 + 工作区服务解析钩子，原 js 4834–4960；原文件现为薄 re-export shim）。
import * as React from "react";
import { useSessionRegistryStore } from '../modules/stores-core';
import type { BaseServices, RegisteredSession, ResolvedBaseServices } from '../modules/stores-core';
import { ServiceProxy } from './ipcBridge';
import { EventUtil } from './eventPrimitives';
import { useServices, useServicesOptional } from './serviceContext';
// 原 pc/oc（styles js 4801/4487）：canonical 属主 = modules/WorkspaceTabsDeep（A1-R1 双归属裁决）
import { useWorkspaceTabStore as useTabStoreSelector, isWorkspaceKindTab as isWorkspaceTab } from '../modules/WorkspaceTabsDeep';
/* --- C.4 远端服务解析与钩子（原 4834–4960） --- */

export const REMOTE_WORKSPACE_DISCONNECTED = "ZCODE_REMOTE_WORKSPACE_DISCONNECTED"; // 原 xc

/** 原 Sc */
export function isRemoteDisconnectedError(error: unknown): boolean {
  if (error === REMOTE_WORKSPACE_DISCONNECTED) return true;
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === REMOTE_WORKSPACE_DISCONNECTED || candidate.message === REMOTE_WORKSPACE_DISCONNECTED;
}

let disconnectedServicesSingleton: BaseServices | null = null; // 原 Cc

/** 原 Use：所有调用一律 reject 的占位服务集 */
function createDisconnectedServices(): BaseServices {
  const makeError = () => {
    const error = new Error(REMOTE_WORKSPACE_DISCONNECTED) as Error & { code?: string };
    error.code = REMOTE_WORKSPACE_DISCONNECTED;
    return error;
  };
  const stub = ServiceProxy.toService<Record<string, unknown>>({
    call: () => Promise.reject(makeError()),
    listen: () => EventUtil.None,
  });
  return new Proxy(Object.create(null) as BaseServices, {
    get() {
      return stub;
    },
  });
}

/** 原 wc */
export function getDisconnectedServices(): BaseServices {
  disconnectedServicesSingleton ||= createDisconnectedServices();
  return disconnectedServicesSingleton;
}

interface ServiceResolutionInput {
  currentContextServices: BaseServices;
  resolvedRemoteSessionId: string | null;
  baseServices: BaseServices | null;
  sessionsById: Record<string, RegisteredSession>;
  isRemoteTarget: boolean;
}

/** 原 Wse：按上下文挑选服务集（远端目标无会话 → 断开占位） */
function resolveServicesForContext(input: ServiceResolutionInput): BaseServices {
  const services = input.resolvedRemoteSessionId
    ? (input.sessionsById[input.resolvedRemoteSessionId]?.services ?? null)
    : input.isRemoteTarget
      ? getDisconnectedServices()
      : input.baseServices;
  return input.isRemoteTarget && !services ? getDisconnectedServices() : (services ?? input.currentContextServices);
}

/** 原 Tc：工作区是否带远端作用域。〔A1-R142〕补 export：Composer C2 remoteScopeKey 别名消费（束 pqe/WB 消费 bg ≡ 本真身）。 */
export function hasRemoteScope(scope: { workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: unknown }): boolean {
  return !!(scope?.workspaceIdentity?.trim() || scope?.remoteSessionId?.trim() || scope?.remoteTarget);
}

/** 原 Kse：工作区是否应按远端解析 */
function isRemoteWorkspaceTarget(args: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  preferredRemoteSessionId?: string | null;
  activeWorkspacePath?: string | null;
  activeWorkspaceIdentity?: string | null;
  activeTab?: WorkspaceTabLike | null;
  workspaceTabs?: WorkspaceTabLike[];
}): boolean {
  if (args.workspaceIdentity?.trim() || args.preferredRemoteSessionId?.trim()) return true;
  if (!args.workspacePath?.trim()) return false;
  if (
    args.activeWorkspacePath === args.workspacePath &&
    (args.activeWorkspaceIdentity?.trim() || (args.activeTab?.workspacePath === args.workspacePath && hasRemoteScope(args.activeTab)))
  )
    return true;
  const tabs = (args.workspaceTabs ?? []).filter((tab) => tab.workspacePath === args.workspacePath);
  return tabs.length === 1 && hasRemoteScope(tabs[0]);
}

/** 侧面板标签页的最小结构（原 oc isWorkspaceTab 的判定面） */
export interface WorkspaceTabLike {
  id: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: unknown;
  [key: string]: unknown;
}

/** TabStore（F04 域）的最小消费面：原 pc/oc declare 已改指 modules/WorkspaceTabsDeep（见头注 import）。 */

/** 原 gc：按注册表解析工作区对应的远端会话 id */
function resolveSessionIdForWorkspace(
  scope: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: unknown },
  registry: { sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string>; sessionsById: Record<string, RegisteredSession> },
): string | null | undefined {
  const identity = scope.workspaceIdentity?.trim();
  return [
    scope.remoteSessionId,
    identity ? registry.sessionIdByWorkspaceIdentity[identity] : undefined,
    !identity && scope.remoteTarget ? registry.sessionIdByWorkspacePath[scope.workspacePath] : undefined,
  ].find((sessionId) => !!(sessionId && registry.sessionsById[sessionId]));
}

/** 原 Hse：综合解析远端会话 id（活动标签优先） */
function resolveRemoteSessionIdFromRegistry(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  preferredRemoteSessionId?: string | null;
  remoteTarget?: unknown;
  activeTab?: WorkspaceTabLike | null;
  state: { sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string>; sessionsById: Record<string, RegisteredSession> };
}): string | null {
  if (!args.workspacePath) return null;
  const identity = args.workspaceIdentity?.trim() || undefined;
  const activeTab =
    args.activeTab && (identity ? args.activeTab.workspaceIdentity?.trim() === identity : args.activeTab.workspacePath === args.workspacePath) ? args.activeTab : null;
  const activeIdentity = activeTab?.workspaceIdentity?.trim() || undefined;
  const preferred = [args.preferredRemoteSessionId, activeTab?.remoteSessionId].find((sessionId) => !!(sessionId && args.state.sessionsById[sessionId]));
  return (
    resolveSessionIdForWorkspace(
      {
        workspacePath: args.workspacePath,
        workspaceIdentity: identity ?? activeIdentity,
        remoteSessionId: preferred,
        remoteTarget: activeTab?.remoteTarget ?? args.remoteTarget,
      },
      args.state,
    ) ?? null
  );
}

/** 原 bc：useResolvedRemoteSessionId（工作区路径+优先会话 → 注册表解析） */
export function useResolvedRemoteSessionId(
  workspacePath: string | null | undefined, // 〔A1-R142〕面宽化：Composer C2 别名消费面（原 declare 面 string|undefined；体内 !e 守卫 + ?? 强转运行期 undefined 安全；R136/R137 面级联判例承续）
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): string | null {
  const activeTab = useTabStoreSelector((state) => {
    if (!workspacePath || !state.activeTabId) return null;
    const tab = state.tabs.find((item) => item.id === state.activeTabId);
    if (!tab || !isWorkspaceTab(tab)) return null;
    if (workspaceIdentity) return tab.workspaceIdentity?.trim() === workspaceIdentity.trim() ? tab : null;
    return tab.workspacePath === workspacePath ? tab : null;
  });
  return useSessionRegistryStore((registry) =>
    resolveRemoteSessionIdFromRegistry({
      workspacePath: workspacePath ?? "",
      preferredRemoteSessionId,
      workspaceIdentity,
      remoteTarget,
      activeTab,
      state: registry,
    }),
  );
}

/** 原 Gse */
function coalesceServices<T>(fallback: T, override?: T | null): T {
  return override ?? fallback;
}

/** 原 Ec：useBaseServices（context 服务 + 注册表基础服务合流） */
export function useBaseServices(): ResolvedBaseServices {
  return coalesceServices(useServices(), useSessionRegistryStore((state) => state.baseServices as ResolvedBaseServices | null));
}

/** 原 qse：useBaseServicesOptional */
export function useBaseServicesOptional(): BaseServices | null {
  const contextServices = useServicesOptional();
  return useSessionRegistryStore((state) => state.baseServices) ?? contextServices;
}

export type ConnectionKind = "local-ready" | "remote-ready" | "remote-waiting";

export interface ResolvedWorkspaceServices {
  services: ResolvedBaseServices;
  remoteSessionId: string | null;
  isRemoteTarget: boolean;
  connectionKind: ConnectionKind;
  rpcReady: boolean;
}

/** 原 Dc（4907–4944）：工作区服务解析（远端会话未就绪时给出等待态） */
export function useResolvedWorkspaceServices(
  workspacePath: string | null | undefined, // 〔A1-R142〕面宽化：同上判（束真 Dc 首参带 !e 守卫；下游 useResolvedRemoteSessionId/isRemoteWorkspaceTarget 面皆 undefined 安全）
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): ResolvedWorkspaceServices {
  const contextServices = useServices();
  const resolvedRemoteSessionId = useResolvedRemoteSessionId(workspacePath, preferredRemoteSessionId, workspaceIdentity, remoteTarget);
  const isRemoteTarget = useTabStoreSelector((state) =>
    isRemoteWorkspaceTarget({
      workspacePath,
      workspaceIdentity,
      preferredRemoteSessionId,
      activeWorkspacePath: state.activeWorkspacePath,
      activeWorkspaceIdentity: state.activeWorkspaceIdentity,
      activeTab: (() => {
        const tab = state.activeTabId ? state.tabs.find((item) => item.id === state.activeTabId) : null;
        return tab && isWorkspaceTab(tab) ? tab : null;
      })(),
      workspaceTabs: state.tabs.filter((item) => isWorkspaceTab(item)),
    }),
  );
  const services = useSessionRegistryStore((registry) =>
    resolveServicesForContext({
      currentContextServices: contextServices,
      resolvedRemoteSessionId,
      baseServices: registry.baseServices,
      sessionsById: registry.sessionsById,
      isRemoteTarget,
    }),
  );
  const connectionKind: ConnectionKind = isRemoteTarget ? (resolvedRemoteSessionId ? "remote-ready" : "remote-waiting") : "local-ready";
  return React.useMemo(
    () => ({ services: services as ResolvedBaseServices, remoteSessionId: resolvedRemoteSessionId, isRemoteTarget, connectionKind, rpcReady: connectionKind !== "remote-waiting" }),
    [connectionKind, isRemoteTarget, resolvedRemoteSessionId, services],
  );
}

/** 原 Oc：useWorkspaceServices */
export function useWorkspaceServices(
  workspacePath: string | null,
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): ResolvedBaseServices {
  return useResolvedWorkspaceServices(workspacePath, preferredRemoteSessionId, workspaceIdentity, remoteTarget).services;
}
