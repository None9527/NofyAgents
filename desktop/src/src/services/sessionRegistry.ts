// A0-S4-5: 自 modules/services.tsx §C.2 原样迁入（SessionRegistry 模块助手，原 js 4303–4378；注册表本体在 stores-core；原文件现为薄 re-export shim）。
import { useSessionRegistryStore, serviceGeneration } from '../modules/stores-core';
import type { BaseServices, RegisteredSession } from '../modules/stores-core';
/* --- C.2 SessionRegistry 模块助手（原 xse/Sse/Qs/$s/Cse/ec/wse，js 4303–4378） ---
 * 注册表本体（Zs）在 stores-core.tsx；Qs 的同步状态清除在 C.3 定义后回接。 */

export function registerBaseServices(services: BaseServices): void {
  useSessionRegistryStore.getState().registerBaseServices(services);
}

export function registerRemoteSession(entry: RegisteredSession): void {
  if (entry.services.zcodeAgentService) serviceGeneration(entry.services.zcodeAgentService as object);
  useSessionRegistryStore.getState().registerSession(entry);
}

export function bindSessionWorkspacePath(path: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspacePath(path, sessionId);
}

export function unbindSessionWorkspacePath(path: string): void {
  useSessionRegistryStore.getState().unbindWorkspacePath(path);
}

export function bindSessionWorkspaceIdentity(identity: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspaceIdentity(identity, sessionId);
}

export function unbindSessionWorkspaceIdentity(identity: string): void {
  useSessionRegistryStore.getState().unbindWorkspaceIdentity(identity);
}

export function getSessionServicesByWorkspaceIdentity(identity: string): BaseServices | null {
  const state = useSessionRegistryStore.getState();
  const sessionId = state.sessionIdByWorkspaceIdentity[identity];
  return sessionId ? (state.sessionsById[sessionId]?.services ?? null) : null;
}
