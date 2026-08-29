// A0-S4-3: 自 modules/SkillStore.tsx §15–§16 原样迁入（jsx 2015–2367 子代理上下文 + 单例 store 域，含同步刷新 Kn；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 u（logger-PFDwl5Yq 的 t 导出）
import { resolveDefaultAgentCliProvider as resolveAgentProvider } from '../modules/SrcSharedA'; // 原 o（src 的 ds 导出 = 内部 Es）
import { create } from './zustand'; // 原 _（jsx 38）
import type { SetStateFn, GetStateFn } from './zustand';
import { isE2EStoreBridgeEnabled } from './e2eStoreBridge'; // 原 v（jsx 50）

/* ============================================================================
 * 15. 子代理上下文域（原 q–Bn，jsx 2015–2134；Bn 导出 a）
 *     按 工作区×供应商 缓存的上下文条目（供多工作区同屏使用）
 * ==========================================================================*/

/** 子代理描述（字段为调用面归纳：仅 id 确定，其余透传）。 */
interface SubagentDescriptor {
  id: string;
  [key: string]: unknown;
}

/** 子代理配置（createAgent 用；`new:${name}` 运行标识依赖 name）。 */
interface SubagentAgentConfig {
  name: string;
  [key: string]: unknown;
}

/** 子代理服务接口（跨 chunk 注入；list/setEnabled 本域使用）。 */
interface SubagentsService {
  list(args: { workspacePath: string; workspaceIdentity?: string | null; provider: string }): Promise<{
    agents: SubagentDescriptor[];
    capability: unknown;
  }>;
  setEnabled(args: { agentId: string; enabled: boolean }): Promise<unknown>;
  createAgent(args: { config: SubagentAgentConfig; provider: string }): Promise<{ agent: SubagentDescriptor }>;
  updateAgent(args: { agentId: string; config: SubagentAgentConfig; oldFilePath?: string | null; provider: string }): Promise<{ agent: SubagentDescriptor }>;
  deleteAgent(args: { agentId: string; filePath?: string | null }): Promise<unknown>;
}

interface SubagentContextLoadResult {
  agents: SubagentDescriptor[];
  capability: unknown;
}

interface SubagentContextEntry {
  workspacePath: string;
  workspaceIdentity: string | null;
  provider: string;
  agents: SubagentDescriptor[];
  capability: unknown;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

/** 原 q（jsx 2015）：上下文加载在途缓存（按 scope 键）。 */
const subagentContextInflight = new Map<string, Promise<SubagentContextLoadResult>>();

/** 原 J（jsx 2016）：scope → 加载序号（竞态护栏）。 */
const subagentContextLoadSeqByScope = new Map<string, number>();

/** 原 Ln（jsx 2017）：全局加载序号计数。 */
let subagentContextLoadSeq = 0;

/** 原 Y（jsx 2018）：上下文 scope 键 `<工作区|身份>::<归一供应商>`（导出 i）。 */
function getSubagentContextScopeKey(workspacePath: string, provider: string, workspaceIdentity?: string | null): string {
  return `${workspaceIdentity?.trim() || workspacePath}::${resolveAgentProvider(provider)}`;
}

/** 原 X（jsx 2021）：contexts 补丁。 */
function setSubagentContext(
  state: { contexts: Record<string, SubagentContextEntry> },
  scopeKey: string,
  context: SubagentContextEntry,
): { contexts: Record<string, SubagentContextEntry> } {
  return {
    contexts: {
      ...state.contexts,
      [scopeKey]: context,
    },
  };
}

/** 原 Rn（jsx 2029）：上下文加载（在途去重；bypassCache 强制新请求）。 */
function loadSubagentContext(
  scopeKey: string,
  workspacePath: string,
  provider: string,
  service: SubagentsService,
  workspaceIdentity?: string | null,
  bypassCache = false,
): Promise<SubagentContextLoadResult> {
  if (!bypassCache) {
    const inflight = subagentContextInflight.get(scopeKey);
    if (inflight) return inflight;
  }
  const request = service
    .list({
      workspacePath: workspacePath,
      workspaceIdentity: workspaceIdentity,
      provider: provider,
    })
    .finally(() => {
      subagentContextInflight.get(scopeKey) === request && subagentContextInflight.delete(scopeKey);
    });
  return subagentContextInflight.set(scopeKey, request), request;
}

interface SubagentContextLoadRequest {
  workspacePath: string;
  provider: string;
  subagentsService: SubagentsService;
  workspaceIdentity?: string | null;
  bypassCache?: boolean;
}

/** 原 zn（jsx 2043）：上下文加载入 store（占位 loading → 成功回填/失败记日志）。 */
async function loadSubagentContextIntoStore(
  request: SubagentContextLoadRequest,
  set: SetStateFn<SubagentContextsStoreState>,
  get: GetStateFn<SubagentContextsStore>,
): Promise<void> {
  const provider = resolveAgentProvider(request.provider);
  const workspaceIdentity = request.workspaceIdentity?.trim() || void 0;
  const scopeKey = getSubagentContextScopeKey(request.workspacePath, provider, workspaceIdentity);
  const existing = get().contexts[scopeKey];
  const loadSeq = ++subagentContextLoadSeq;
  subagentContextLoadSeqByScope.set(scopeKey, loadSeq),
    set((state) =>
      setSubagentContext(state, scopeKey, {
        workspacePath: request.workspacePath,
        workspaceIdentity: workspaceIdentity ?? null,
        provider: provider,
        agents: existing?.agents ?? [],
        capability: existing?.capability ?? null,
        loading: existing?.loaded !== true,
        loaded: existing?.loaded ?? false,
        error: null,
      }),
    );
  try {
    const result = await loadSubagentContext(scopeKey, request.workspacePath, provider, request.subagentsService, workspaceIdentity, request.bypassCache);
    if (subagentContextLoadSeqByScope.get(scopeKey) !== loadSeq) return;
    set((state) =>
      setSubagentContext(state, scopeKey, {
        workspacePath: request.workspacePath,
        workspaceIdentity: workspaceIdentity ?? null,
        provider: provider,
        agents: result.agents,
        capability: result.capability,
        loading: false,
        loaded: true,
        error: null,
      }),
    );
  } catch (error) {
    if (subagentContextLoadSeqByScope.get(scopeKey) !== loadSeq) return;
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[subagents] workspace context load failed`, {
      workspacePath: request.workspacePath,
      workspaceIdentity: workspaceIdentity,
      provider: provider,
      error: message,
    }),
      set((state) =>
        setSubagentContext(state, scopeKey, {
          ...(state.contexts[scopeKey] ?? {
            workspacePath: request.workspacePath,
            workspaceIdentity: workspaceIdentity ?? null,
            provider: provider,
            agents: [],
            capability: null,
            loaded: false,
          }),
          loading: false,
          error: message,
        }),
      );
  }
}

interface SubagentContextsStoreState {
  contexts: Record<string, SubagentContextEntry>;
}

type SubagentContextsStore = SubagentContextsStoreState & {
  initialize: (workspacePath: string, provider: string, service: SubagentsService, workspaceIdentity?: string | null) => Promise<void>;
  refresh: (workspacePath: string, provider: string, service: SubagentsService, workspaceIdentity?: string | null) => Promise<void>;
  setEnabled: (
    workspacePath: string,
    provider: string,
    agentId: string,
    enabled: boolean,
    service: SubagentsService,
    workspaceIdentity?: string | null,
  ) => Promise<void>;
};

/** 原 Bn（jsx 2094）：子代理上下文 store（按 scope 缓存；导出 a）。 */
const useSubagentContextsStore = create<SubagentContextsStore>((set, get) => ({
  contexts: {},
  async initialize(workspacePath, provider, service, workspaceIdentity) {
    const scopeKey = getSubagentContextScopeKey(workspacePath, provider, workspaceIdentity);
    get().contexts[scopeKey] ||
      (await loadSubagentContextIntoStore(
        {
          workspacePath: workspacePath,
          provider: provider,
          subagentsService: service,
          workspaceIdentity: workspaceIdentity,
          bypassCache: false,
        },
        set,
        get,
      ));
  },
  async refresh(workspacePath, provider, service, workspaceIdentity) {
    await loadSubagentContextIntoStore(
      {
        workspacePath: workspacePath,
        provider: provider,
        subagentsService: service,
        workspaceIdentity: workspaceIdentity,
        bypassCache: true,
      },
      set,
      get,
    );
  },
  async setEnabled(workspacePath, provider, agentId, enabled, service, workspaceIdentity) {
    try {
      await service.setEnabled({
        agentId: agentId,
        enabled: enabled,
      }),
        await get().refresh(workspacePath, provider, service, workspaceIdentity);
    } catch (error) {
      const scopeKey = getSubagentContextScopeKey(workspacePath, provider, workspaceIdentity);
      const message = error instanceof Error ? error.message : String(error);
      set((state) => {
        const context = state.contexts[scopeKey];
        return context
          ? setSubagentContext(state, scopeKey, {
              ...context,
              loading: false,
              error: message,
            })
          : {};
      });
    }
  },
}));

/* ============================================================================
 * 16. 子代理单例 store（原 Z–Gn，jsx 2135–2357；Gn 导出 r）+ 同步刷新 Kn（导出 n）
 * ==========================================================================*/

/** 原 Z（jsx 2135）：子代理列表在途缓存（按 scope 键）。 */
const subagentListInflight = new Map<string, Promise<SubagentContextLoadResult>>();

/** 原 Vn（jsx 2136）：操作序号计数（CRUD 竞态护栏）。 */
let subagentOperationSeq = 0;

/** 原 Hn（jsx 2137）：子代理 scope 键 `<工作区|身份>::<供应商原文>`。 */
function getSubagentScopeKey(workspacePath: string, provider: string, workspaceIdentity?: string | null): string {
  return `${workspaceIdentity?.trim() || workspacePath}::${provider}`;
}

/** 原 Un（jsx 2140）：子代理列表加载（在途去重；可选 bypassCache）。 */
function listSubagentsCached(
  workspacePath: string,
  provider: string,
  service: SubagentsService,
  workspaceIdentity?: string | null,
  options: { bypassCache?: boolean } = {},
): Promise<SubagentContextLoadResult> {
  const scopeKey = getSubagentScopeKey(workspacePath, provider, workspaceIdentity);
  if (!options.bypassCache) {
    const inflight = subagentListInflight.get(scopeKey);
    if (inflight) return inflight;
  }
  const request = service
    .list({
      workspacePath: workspacePath,
      workspaceIdentity: workspaceIdentity,
      provider: provider,
    })
    .finally(() => {
      subagentListInflight.get(scopeKey) === request && subagentListInflight.delete(scopeKey);
    });
  return subagentListInflight.set(scopeKey, request), request;
}

/** 原 Wn（jsx 2155）：取下一操作序号。 */
function nextSubagentOperationSeq(): number {
  return (subagentOperationSeq += 1), subagentOperationSeq;
}

/** 原 Q（jsx 2158）：序号是否仍为当前（竞态判定）。 */
function isCurrentSubagentOperation(seq: number): boolean {
  return seq === subagentOperationSeq;
}

interface SubagentsStoreState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspacePath: string | null;
  loadedWorkspaceIdentity: string | null;
  provider: string;
  loadedProvider: string | null;
  agents: SubagentDescriptor[];
  capability: unknown;
  loading: boolean;
  error: string | null;
  operatingAgentId: string | null;
}

type SubagentsStore = SubagentsStoreState & {
  initialize: (
    workspacePath: string,
    providerOrService: string | SubagentsService,
    maybeService?: SubagentsService,
    workspaceIdentity?: string | null,
  ) => Promise<void>;
  refresh: (service: SubagentsService, workspaceIdentity?: string | null) => Promise<void>;
  setEnabled: (agentId: string, enabled: boolean, service: SubagentsService, workspaceIdentity?: string | null) => Promise<void>;
  createAgent: (
    config: SubagentAgentConfig,
    provider: string,
    service: SubagentsService,
    workspaceIdentity?: string | null,
  ) => Promise<SubagentDescriptor | null>;
  updateAgent: (
    agentId: string,
    config: SubagentAgentConfig,
    oldFilePath: string | null | undefined,
    provider: string,
    service: SubagentsService,
    workspaceIdentity?: string | null,
  ) => Promise<SubagentDescriptor | null>;
  deleteAgent: (
    agentId: string,
    filePath: string | null | undefined,
    service: SubagentsService,
    workspaceIdentity?: string | null,
  ) => Promise<boolean>;
};

/** 原 Gn（jsx 2161）：子代理单例 store（CRUD 六动作 + 操作序号护栏；导出 r）。 */
const useSubagentsStore = create<SubagentsStore>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  provider: `glm`,
  loadedProvider: null,
  agents: [],
  capability: null,
  loading: false,
  error: null,
  operatingAgentId: null,
  async initialize(workspacePath, providerOrService, maybeService, workspaceIdentity) {
    const current = get();
    const providerIsString = typeof providerOrService == `string`;
    const provider = resolveAgentProvider(providerIsString ? providerOrService : `glm`);
    const service = providerIsString ? maybeService : providerOrService;
    const resolvedIdentity = workspaceIdentity?.trim() || null;
    if (!service) {
      set({
        workspacePath: workspacePath,
        workspaceIdentity: resolvedIdentity,
        provider: provider,
        loading: false,
        error: `subagentsService is required`,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity,
        loadedProvider: provider,
      });
      return;
    }
    const reusable =
      current.agents.length > 0 && current.loadedWorkspacePath === workspacePath && current.loadedWorkspaceIdentity === resolvedIdentity && current.loadedProvider === provider;
    set({
      workspacePath: workspacePath,
      workspaceIdentity: resolvedIdentity,
      provider: provider,
      agents: reusable ? current.agents : [],
      capability: reusable ? current.capability : null,
      loading: !reusable,
      error: null,
    });
    const operationSeq = nextSubagentOperationSeq();
    try {
      const result = await listSubagentsCached(workspacePath, provider, service, resolvedIdentity ?? void 0);
      if (!isCurrentSubagentOperation(operationSeq)) return;
      set({
        agents: result.agents,
        capability: result.capability,
        loading: false,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity,
        loadedProvider: provider,
      });
    } catch (error) {
      if (!isCurrentSubagentOperation(operationSeq)) return;
      logger.error(`[subagents] initialize failed`, {
        workspacePath: workspacePath,
        provider: provider,
        error: error instanceof Error ? error.message : String(error),
      }),
        set({
          loading: false,
          error: error instanceof Error ? error.message : String(error),
          loadedWorkspacePath: workspacePath,
          loadedWorkspaceIdentity: resolvedIdentity,
          loadedProvider: provider,
        });
    }
  },
  async refresh(service, workspaceIdentity) {
    const workspacePath = get().workspacePath;
    if (!workspacePath) return;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    const provider = resolveAgentProvider(get().provider);
    set({
      loading: !(get().agents.length > 0),
      error: null,
    });
    const operationSeq = nextSubagentOperationSeq();
    try {
      const result = await listSubagentsCached(workspacePath, provider, service, resolvedIdentity, {
        bypassCache: true,
      });
      if (!isCurrentSubagentOperation(operationSeq)) return;
      set({
        agents: result.agents,
        capability: result.capability,
        loading: false,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity ?? null,
        loadedProvider: provider,
      });
    } catch (error) {
      if (!isCurrentSubagentOperation(operationSeq)) return;
      logger.error(`[subagents] refresh failed`, {
        workspacePath: workspacePath,
        provider: provider,
        error: error instanceof Error ? error.message : String(error),
      }),
        set({
          loading: false,
          error: error instanceof Error ? error.message : String(error),
          loadedWorkspacePath: workspacePath,
          loadedWorkspaceIdentity: resolvedIdentity ?? null,
          loadedProvider: provider,
        });
    }
  },
  async setEnabled(agentId, enabled, service, workspaceIdentity) {
    if (!get().workspacePath) return;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({
      operatingAgentId: agentId,
    });
    try {
      await service.setEnabled({
        agentId: agentId,
        enabled: enabled,
      }),
        await get().refresh(service, resolvedIdentity);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({
        operatingAgentId: null,
      });
    }
  },
  async createAgent(config, provider, service, workspaceIdentity) {
    if (!get().workspacePath) return null;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({
      operatingAgentId: `new:${config.name}`,
    });
    try {
      const result = await service.createAgent({
        config: config,
        provider: resolveAgentProvider(provider),
      });
      return await get().refresh(service, resolvedIdentity), result.agent;
    } catch (error) {
      return (
        set({
          error: error instanceof Error ? error.message : String(error),
        }),
        null
      );
    } finally {
      set({
        operatingAgentId: null,
      });
    }
  },
  async updateAgent(agentId, config, oldFilePath, provider, service, workspaceIdentity) {
    if (!get().workspacePath) return null;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({
      operatingAgentId: agentId,
    });
    try {
      const result = await service.updateAgent({
        agentId: agentId,
        config: config,
        oldFilePath: oldFilePath,
        provider: resolveAgentProvider(provider),
      });
      return await get().refresh(service, resolvedIdentity), result.agent;
    } catch (error) {
      return (
        set({
          error: error instanceof Error ? error.message : String(error),
        }),
        null
      );
    } finally {
      set({
        operatingAgentId: null,
      });
    }
  },
  async deleteAgent(agentId, filePath, service, workspaceIdentity) {
    if (!get().workspacePath) return false;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    set({
      operatingAgentId: agentId,
    });
    try {
      return await service.deleteAgent({
        agentId: agentId,
        filePath: filePath,
      }),
        await get().refresh(service, resolvedIdentity),
        true;
    } catch (error) {
      return (
        set({
          error: error instanceof Error ? error.message : String(error),
        }),
        false
      );
    } finally {
      set({
        operatingAgentId: null,
      });
    }
  },
}));

/** 原 jsx 2356：E2E 桥挂载（__subagentsStoreE2E）。 */
isE2EStoreBridgeEnabled() && (window.__subagentsStoreE2E = useSubagentsStore);

/** 原 Kn（jsx 2357）：同工作区两个子代理 store 的同步刷新（导出 n）。 */
async function refreshSubagentStoresForWorkspace(args: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  subagentsService: SubagentsService;
}): Promise<void> {
  const workspacePath = args.workspacePath?.trim();
  if (!workspacePath) return;
  const workspaceIdentity = args.workspaceIdentity?.trim() || null;
  const subagentsState = useSubagentsStore.getState();
  const pending: Promise<void>[] = [];
  subagentsState.workspacePath === workspacePath &&
    subagentsState.workspaceIdentity === workspaceIdentity &&
    pending.push(subagentsState.refresh(args.subagentsService, workspaceIdentity ?? void 0));
  const contextsState = useSubagentContextsStore.getState();
  const scopeKey = getSubagentContextScopeKey(workspacePath, `glm`, workspaceIdentity);
  contextsState.contexts[scopeKey] && pending.push(contextsState.refresh(workspacePath, `glm`, args.subagentsService, workspaceIdentity ?? void 0));
  await Promise.all(pending);
}


/* ============================================================================
 * 导出（A0-S4-3：对应原 SkillStore 导出块中子代理域 4 符号）
 * ==========================================================================*/

export { useSubagentContextsStore, getSubagentContextScopeKey, refreshSubagentStoresForWorkspace, useSubagentsStore };
