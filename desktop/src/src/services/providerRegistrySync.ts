// A0-S4-5: 自 modules/services.tsx §C.3 原样迁入（provider registry 同步主循环 + 注销清态，原 js 4122–4308；原文件现为薄 re-export shim）。
import { useSessionRegistryStore } from '../modules/stores-core';
import { automationsWorkspaceKey as providerSyncScopeKey, ZCODE_AGENT_PROVIDER_NOT_READY as PROVIDER_NOT_READY_CODE } from '../modules/SrcSharedB'; // 原 Ti | 原 Hr
import { extractErrorInfo as normalizeRpcError } from '../modules/SrcSharedA'; // 原 it
/* --- C.3 Provider registry 同步（原 4122–4308） --- */

interface ProviderRegistrySnapshot {
  revision: number;
  providers: unknown[];
}

interface ProviderSyncState {
  workspaceKey: string;
  appliedProviderRegistryRevision?: number;
  pendingProviderRegistryRevision?: number;
  remoteRuntimeIdentity?: string;
  remoteSessionId?: string;
  lastSyncError?: string;
}

export interface ProviderRegistrySyncArgs {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string;
  force?: boolean;
  includeWorkspaceState?: boolean;
  runtimePolicy?: unknown;
  remoteZCodeSessionService: {
    getWorkspaceRuntimeIdentity?(args: { workspacePath: string; workspaceIdentity?: string | null }): Promise<{ identity?: string | null }>;
    updateProviderRegistry(args: {
      workspacePath: string;
      workspaceIdentity?: string | null;
      registry: ProviderRegistrySnapshot;
      includeWorkspaceState: boolean;
      runtimePolicy?: unknown;
    }): Promise<{
      status: "applied" | "runtime-unavailable" | "failed" | string;
      appliedProviderRevision: number;
      providerCount: number;
      workspaceState?: unknown;
    }>;
  };
  localModelProviderService: { getProviderRegistrySnapshot(): Promise<ProviderRegistrySnapshot> };
}

export interface ProviderRegistrySyncResult {
  workspaceKey: string;
  providerRegistryRevision: number;
  appliedProviderRegistryRevision?: number;
  providerCount: number;
  status: "unchanged" | "applied" | "runtime-unavailable" | string;
  workspaceState?: unknown;
}

const providerSyncStates = new Map<string, ProviderSyncState>(); // 原 qs
const MAX_PROVIDER_BOOTSTRAP_RETRIES = 2; // 原 cse
const providerSyncInFlight = new Map<string, { providerRegistryRevision: number; remoteRuntimeIdentity?: string; remoteSessionId?: string; promise: Promise<ProviderRegistrySyncResult> }>(); // 原 Js

function syncStateFor(args: { workspacePath: string; workspaceIdentity?: string | null }): ProviderSyncState {
  const key = providerSyncScopeKey(args);
  const existing = providerSyncStates.get(key);
  if (existing) return existing;
  const created: ProviderSyncState = { workspaceKey: key };
  providerSyncStates.set(key, created);
  return created;
}

function syncErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function providerNotReadyError(scope: { workspaceKey: string; providerRegistryRevision: number }): Error {
  const error = new Error(`远端 Agent 在 Provider Registry 应用后仍未就绪 workspaceKey=${scope.workspaceKey} revision=${scope.providerRegistryRevision}`) as Error & { code?: string };
  error.code = PROVIDER_NOT_READY_CODE;
  return error;
}

function trimToUndefined(value?: string | null): string | undefined {
  return value?.trim() || undefined;
}

function syncRequired(args: {
  force: boolean;
  remoteSessionId?: string;
  providerRegistryRevision: number;
  state: ProviderSyncState;
}): boolean {
  return (
    args.force ||
    (args.remoteSessionId !== undefined && args.state.remoteSessionId !== args.remoteSessionId) ||
    args.state.appliedProviderRegistryRevision !== args.providerRegistryRevision ||
    args.state.pendingProviderRegistryRevision !== undefined
  );
}

/** 原 Ys：探测远端运行时身份（方法不存在 → 无需 provider 引导） */
async function probeRemoteRuntimeIdentity(args: ProviderRegistrySyncArgs): Promise<{ identity?: string; providerBootstrapRequired: boolean }> {
  if (typeof args.remoteZCodeSessionService.getWorkspaceRuntimeIdentity !== "function") return { providerBootstrapRequired: false };
  try {
    return {
      identity: trimToUndefined(
        (await args.remoteZCodeSessionService.getWorkspaceRuntimeIdentity({ workspacePath: args.workspacePath, workspaceIdentity: args.workspaceIdentity }))?.identity,
      ),
      providerBootstrapRequired: false,
    };
  } catch (error) {
    const normalized = normalizeRpcError(error);
    if (normalized.code === "ZCODE_AGENT_PROVIDER_NOT_READY") return { providerBootstrapRequired: true };
    if (normalized.message.includes("Method not found") || normalized.message.includes("not found")) return { providerBootstrapRequired: false };
    throw error;
  }
}

/** 原 hse：全部同步状态标记 pending（provider 注册表变更时） */
export function markAllProviderSyncPending(revision: number): void {
  for (const state of providerSyncStates.values()) state.pendingProviderRegistryRevision = revision;
}

/** 原 gse/_se：清除工作区的同步状态（会话注销时，见 Qs） */
export function purgeProviderSyncState(scope: { workspacePath: string; workspaceIdentity?: string | null }): void {
  const key = providerSyncScopeKey(scope);
  providerSyncStates.delete(key);
  providerSyncInFlight.delete(key);
}

export function purgeProviderSyncStates(args: { workspacePaths: string[]; workspaceIdentities: string[] }): void {
  for (const identity of args.workspaceIdentities) if (identity.trim()) purgeProviderSyncState({ workspacePath: identity, workspaceIdentity: identity });
  for (const path of args.workspacePaths) purgeProviderSyncState({ workspacePath: path });
}

/** 原 vse（4189–4308）：provider registry 同步主循环（幂等 + 并发合并 + 引导重试） */
export async function syncProviderRegistryAndReturn(rawArgs: unknown): Promise<ProviderRegistrySyncResult> {
  const args = rawArgs as ProviderRegistrySyncArgs;
  const scopeKey = providerSyncScopeKey(args);
  const remoteSessionId = trimToUndefined(args.remoteSessionId);
  for (;;) {
    const snapshot = await args.localModelProviderService.getProviderRegistrySnapshot();
    const inFlight = providerSyncInFlight.get(scopeKey);
    if (inFlight) {
      try {
        await inFlight.promise;
      } catch (error) {
        const latest = await args.localModelProviderService.getProviderRegistrySnapshot();
        const state = syncStateFor(args);
        if (syncRequired({ force: args.force === true, remoteSessionId, providerRegistryRevision: latest.revision, state })) continue;
        const probe = await probeRemoteRuntimeIdentity(args);
        if (latest.revision === inFlight.providerRegistryRevision && inFlight.remoteRuntimeIdentity === probe.identity && inFlight.remoteSessionId === remoteSessionId) {
          throw error;
        }
      }
      continue;
    }
    const state = syncStateFor(args);
    const sessionChanged = remoteSessionId !== undefined && state.remoteSessionId !== remoteSessionId;
    const required = syncRequired({ force: args.force === true, remoteSessionId, providerRegistryRevision: snapshot.revision, state });
    const probe = required ? { providerBootstrapRequired: false } : await probeRemoteRuntimeIdentity(args);
    const remoteIdentity = probe.identity;
    const bootstrapRequired = probe.providerBootstrapRequired || (remoteIdentity !== undefined && state.remoteRuntimeIdentity !== remoteIdentity);
    if (!required && !sessionChanged && !bootstrapRequired && state.appliedProviderRegistryRevision === snapshot.revision) {
      return {
        workspaceKey: scopeKey,
        providerRegistryRevision: snapshot.revision,
        appliedProviderRegistryRevision: snapshot.revision,
        providerCount: snapshot.providers.length,
        status: "unchanged",
      };
    }
    const promise = (async (): Promise<ProviderRegistrySyncResult> => {
      try {
        let attempts = 0;
        for (;;) {
          attempts += 1;
          const result = await args.remoteZCodeSessionService.updateProviderRegistry({
            workspacePath: args.workspacePath,
            workspaceIdentity: args.workspaceIdentity,
            registry: snapshot,
            includeWorkspaceState: args.includeWorkspaceState === true,
            ...(args.runtimePolicy ? { runtimePolicy: args.runtimePolicy } : {}),
          });
          if (result.status === "runtime-unavailable") {
            state.pendingProviderRegistryRevision = snapshot.revision;
            state.lastSyncError = undefined;
            return { workspaceKey: scopeKey, providerRegistryRevision: snapshot.revision, providerCount: snapshot.providers.length, status: result.status };
          }
          if (result.status === "failed") throw new Error(`provider registry 同步失败 workspaceKey=${scopeKey} revision=${snapshot.revision}`);
          const postProbe = await probeRemoteRuntimeIdentity(args);
          if (postProbe.providerBootstrapRequired) {
            if (attempts < MAX_PROVIDER_BOOTSTRAP_RETRIES) continue;
            throw providerNotReadyError({ workspaceKey: scopeKey, providerRegistryRevision: snapshot.revision });
          }
          state.appliedProviderRegistryRevision = result.appliedProviderRevision;
          state.remoteSessionId = remoteSessionId;
          state.remoteRuntimeIdentity = postProbe.identity;
          state.pendingProviderRegistryRevision = undefined;
          state.lastSyncError = undefined;
          const syncResult: ProviderRegistrySyncResult = {
            workspaceKey: scopeKey,
            providerRegistryRevision: snapshot.revision,
            appliedProviderRegistryRevision: result.appliedProviderRevision,
            providerCount: result.providerCount,
            status: result.status,
          };
          if (args.includeWorkspaceState) syncResult.workspaceState = result.workspaceState;
          return syncResult;
        }
      } catch (error) {
        state.pendingProviderRegistryRevision = snapshot.revision;
        state.lastSyncError = syncErrorMessage(error);
        throw error;
      }
    })();
    const entry = { providerRegistryRevision: snapshot.revision, remoteRuntimeIdentity: remoteIdentity, remoteSessionId, promise };
    providerSyncInFlight.set(scopeKey, entry);
    try {
      return await promise;
    } finally {
      if (providerSyncInFlight.get(scopeKey) === entry) providerSyncInFlight.delete(scopeKey);
    }
  }
}

/** 原 Qs：注销会话（清除绑定 + provider 同步状态） */
export function unregisterSessionAndPurgeSyncState(sessionId: string): void {
  const state = useSessionRegistryStore.getState();
  purgeProviderSyncStates({
    workspacePaths: Object.entries(state.sessionIdByWorkspacePath)
      .filter(([, id]) => id === sessionId)
      .map(([path]) => path),
    workspaceIdentities: Object.entries(state.sessionIdByWorkspaceIdentity)
      .filter(([, id]) => id === sessionId)
      .map(([identity]) => identity),
  });
  useSessionRegistryStore.getState().unregisterSession(sessionId);
}
