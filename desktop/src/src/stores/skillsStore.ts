// A0-S4-3: 自 modules/SkillStore.tsx §17 原样迁入（jsx 2368–2517 技能 store 域；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 u（logger-PFDwl5Yq 的 t 导出）
import { resolveDefaultAgentCliProvider as resolveAgentProvider } from '../modules/SrcSharedA'; // 原 o（src 的 ds 导出 = 内部 Es）
import { create } from './zustand'; // 原 _（jsx 38）
import { isE2EStoreBridgeEnabled } from './e2eStoreBridge'; // 原 v（jsx 50）

/* ============================================================================
 * 17. 技能 store（原 $–Yn，jsx 2368–2517；Yn 导出 t，styles 侧 `Ne`）
 * ==========================================================================*/

/** 原 $（jsx 2368）：技能列表在途缓存（按 scope 键）。 */
const skillListInflight = new Map<string, Promise<SkillListResult>>();

/** 技能描述（字段为调用面归纳：仅 id 确定，其余透传）。 */
interface SkillDescriptor {
  id: string;
  [key: string]: unknown;
}

interface SkillListResult {
  skills: SkillDescriptor[];
  capability: unknown;
}

/** 技能服务接口（跨 chunk 注入）。 */
interface SkillsService {
  list(args: { workspacePath: string; workspaceIdentity?: string | null; provider: string }): Promise<SkillListResult>;
  setEnabled(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    provider: string;
    scope?: string;
    skillId: string;
    enabled: boolean;
  }): Promise<unknown>;
}

/** 原 qn（jsx 2369）：技能 scope 键 `<工作区|身份>::<供应商原文>`。 */
function getSkillScopeKey(workspacePath: string, provider: string, workspaceIdentity?: string | null): string {
  return `${workspaceIdentity?.trim() || workspacePath}::${provider}`;
}

/** 原 Jn（jsx 2372）：技能列表加载（在途去重；可选 bypassCache）。 */
function listSkillsCached(
  workspacePath: string,
  provider: string,
  service: SkillsService,
  workspaceIdentity?: string | null,
  options: { bypassCache?: boolean } = {},
): Promise<SkillListResult> {
  const scopeKey = getSkillScopeKey(workspacePath, provider, workspaceIdentity);
  if (!options.bypassCache) {
    const inflight = skillListInflight.get(scopeKey);
    if (inflight) return inflight;
  }
  const request = service
    .list({
      workspacePath: workspacePath,
      workspaceIdentity: workspaceIdentity,
      provider: provider,
    })
    .finally(() => {
      skillListInflight.get(scopeKey) === request && skillListInflight.delete(scopeKey);
    });
  return skillListInflight.set(scopeKey, request), request;
}

interface SkillsStoreState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspacePath: string | null;
  loadedWorkspaceIdentity: string | null;
  provider: string;
  loadedProvider: string | null;
  skills: SkillDescriptor[];
  capability: unknown;
  loading: boolean;
  error: string | null;
}

type SkillsStore = SkillsStoreState & {
  initialize: (
    workspacePath: string,
    providerOrService: string | SkillsService,
    maybeService?: SkillsService,
    workspaceIdentity?: string | null,
  ) => Promise<void>;
  refresh: (service: SkillsService, workspaceIdentity?: string | null) => Promise<void>;
  setEnabled: (
    skillId: string,
    providerOrEnabled: string | boolean,
    scopeOrService?: string | SkillsService,
    enabledOrIdentity?: boolean | null,
    maybeService?: SkillsService,
    workspaceIdentity?: string | null,
  ) => Promise<void>;
};

/** 原 Yn（jsx 2387）：技能 store（initialize/refresh/setEnabled 双形参式；导出 t）。 */
const useSkillsStore = create<SkillsStore>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  provider: `glm`,
  loadedProvider: null,
  skills: [],
  capability: null,
  loading: false,
  error: null,
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
        error: `skillsService is required`,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity,
        loadedProvider: provider,
      });
      return;
    }
    const reusable =
      current.skills.length > 0 && current.loadedWorkspacePath === workspacePath && current.loadedWorkspaceIdentity === resolvedIdentity && current.loadedProvider === provider;
    set({
      workspacePath: workspacePath,
      workspaceIdentity: resolvedIdentity,
      provider: provider,
      skills: reusable ? current.skills : [],
      capability: reusable ? current.capability : null,
      loading: !reusable,
      error: null,
    });
    try {
      const result = await listSkillsCached(workspacePath, provider, service, resolvedIdentity ?? void 0);
      set({
        skills: result.skills,
        capability: result.capability,
        loading: false,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity,
        loadedProvider: provider,
      });
    } catch (error) {
      logger.error(`[skills] initialize failed`, {
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
      loading: !(get().skills.length > 0),
      error: null,
    }),
      skillListInflight.delete(getSkillScopeKey(workspacePath, provider, resolvedIdentity));
    try {
      const result = await listSkillsCached(workspacePath, provider, service, resolvedIdentity);
      set({
        skills: result.skills,
        capability: result.capability,
        loading: false,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: resolvedIdentity ?? null,
        loadedProvider: provider,
      });
    } catch (error) {
      logger.error(`[skills] refresh failed`, {
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
  async setEnabled(skillId, providerOrEnabled, scopeOrService, enabledOrIdentity, maybeService, workspaceIdentity) {
    const currentWorkspacePath = get().workspacePath;
    if (!currentWorkspacePath) return;
    const resolvedIdentity = workspaceIdentity?.trim() || get().workspaceIdentity || void 0;
    const enabledIsBoolean = typeof providerOrEnabled == `boolean`;
    const provider = resolveAgentProvider(enabledIsBoolean ? get().provider : providerOrEnabled);
    const scope = enabledIsBoolean ? void 0 : (scopeOrService as string | undefined);
    const enabled = enabledIsBoolean ? providerOrEnabled : (enabledOrIdentity as boolean);
    const service = enabledIsBoolean ? (scopeOrService as SkillsService | undefined) : maybeService;
    if (!service) {
      set({
        error: `skillsService is required`,
      });
      return;
    }
    try {
      await service.setEnabled({
        workspacePath: currentWorkspacePath,
        workspaceIdentity: resolvedIdentity,
        provider: provider,
        ...(scope
          ? {
              scope: scope,
            }
          : {}),
        skillId: skillId,
        enabled: enabled,
      }),
        await get().refresh(service, resolvedIdentity);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
}));

/** 原 jsx 2517：E2E 桥挂载（__skillStoreE2E）。 */
isE2EStoreBridgeEnabled() && (window.__skillStoreE2E = useSkillsStore);


/* ============================================================================
 * 导出（A0-S4-3：对应原 SkillStore 导出块中技能域 1 符号 + 类型补导出 1 项）
 * ==========================================================================*/

export { useSkillsStore };
export type { SkillsService };
