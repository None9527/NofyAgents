// A0-S4-3: 自 modules/stores-workspace.tsx §2 原样迁入（UB SkillContextStore；原文件现为薄 re-export shim）。
import { loadSkillContext } from '../modules/Composer'; // 原 HB（js 63581；A0-CLEANUP2 item 13 接线：declare → Composer 属主导出）
import { resolveDefaultAgentCliProvider as normalizeProvider } from '../modules/SrcSharedA'; // 原 ni
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 2. SkillContextStore（原 UB，js 63592–63845 / jsx 56751）
 * ----------------------------------------------------------------------------
 * 按 工作区×供应商×身份 缓存技能上下文（技能列表/能力/加载态）。
 * state 字段表：contexts: Record<contextKey, SkillContextEntry>（1 个）
 *   contextKey = `${identity?.trim() || workspacePath}::${provider}`（原 BB，63517）
 * actions：initialize/refresh/setEnabled（3 个）
 * 消费：WB useSkillContext 钩子（63636–63704）——与技能主 store（Ne，skillStore
 *   chunk）双源合流：主 store 已载同一工作区时优先其数据，否则用本缓存。
 * ==========================================================================*/

export interface SkillDescriptor {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: "workspace" | "user" | "plugin" | string;
  source: "user" | "plugin" | "built-in" | string;
  path: string;
  model?: string | null;
  [key: string]: unknown;
}

export interface SkillContextEntry {
  skills: SkillDescriptor[];
  capability: unknown | null;
  loading: boolean;
  error: string | null;
}

export interface SkillsService {
  list(args: { workspacePath: string; workspaceIdentity?: string | null; provider: string }): Promise<{
    skills: any[];
    capability: any;
    diagnostics: any[];
  }>;
  setEnabled(args: { workspacePath: string; workspaceIdentity?: string | null; provider: string; scope?: string; skillId: string; enabled: boolean }): Promise<void>;
  deleteSkill(args: { workspacePath: string; workspaceIdentity?: string | null; skillId: string }): Promise<void>;
  /* A0-CLEANUP3 3b：同一服务兼远端技能同步面（SPC 以 skillsService 作 remoteSkillSyncService；Modals.RemoteSkillSyncService 消费面） */
  listRemoteUserSkillStatuses(args: unknown): Promise<any>;
  checkRemoteUserSkillWriteAccess(): Promise<any>;
  importSkillsArchive(args: unknown): Promise<any>;
  [method: string]: unknown;
}

export interface SkillContextState {
  contexts: Record<string, SkillContextEntry>;
  initialize(workspacePath: string, provider: string, skillsService: SkillsService, workspaceIdentity?: string | null): Promise<void>;
  refresh(workspacePath: string, provider: string, skillsService: SkillsService, workspaceIdentity?: string | null): Promise<void>;
  setEnabled(
    workspacePath: string,
    provider: string,
    skillId: string,
    scope: string,
    enabled: boolean,
    skillsService: SkillsService,
    workspaceIdentity?: string | null,
  ): Promise<void>;
}

/** 原 BB：技能上下文键 */
export function skillContextKey(workspacePath: string, provider: string, workspaceIdentity?: string | null): string {
  return `${workspaceIdentity?.trim() || workspacePath}::${normalizeProvider(provider)}`;
}

/* A0-CLEANUP2 item 13：原 HB declare 删除 → 改用 Composer 属实导出。
   本文件 SkillContextEntry/SkillsService 为接口级镜像（缺 workspacePath/provider/loaded 等属主侧字段），
   故调用面按 Composer 自身先例（Composer useSkillContextStore，js UB 63640）以 as never 桥接。 */

function patchSkillContextEntry(state: SkillContextState, key: string, entry: SkillContextEntry): Partial<SkillContextState> {
  return { contexts: { ...state.contexts, [key]: entry } };
}

export const useSkillContextStore: UseBoundStore<SkillContextState> = createStore<SkillContextState>((set, get) => ({
  contexts: {},
  async initialize(workspacePath, provider, skillsService, workspaceIdentity) {
    const key = skillContextKey(workspacePath, provider, workspaceIdentity);
    if (get().contexts[key]) return;
    await loadSkillContext(
      { workspacePath, provider, skillsService: skillsService as never, workspaceIdentity: workspaceIdentity ?? undefined, bypassCache: false },
      set as never,
      get as never,
    );
  },
  async refresh(workspacePath, provider, skillsService, workspaceIdentity) {
    await loadSkillContext(
      { workspacePath, provider, skillsService: skillsService as never, workspaceIdentity: workspaceIdentity ?? undefined, bypassCache: true },
      set as never,
      get as never,
    );
  },
  async setEnabled(workspacePath, provider, skillId, scope, enabled, skillsService, workspaceIdentity) {
    const normalized = normalizeProvider(provider);
    try {
      await skillsService.setEnabled({
        workspacePath,
        workspaceIdentity: workspaceIdentity?.trim() || undefined,
        provider: normalized,
        scope,
        skillId,
        enabled,
      });
      await get().refresh(workspacePath, normalized, skillsService, workspaceIdentity);
    } catch (error) {
      const key = skillContextKey(workspacePath, normalized, workspaceIdentity);
      const message = error instanceof Error ? error.message : String(error);
      set((state) => {
        const entry = state.contexts[key];
        return entry ? patchSkillContextEntry(state, key, { ...entry, loading: false, error: message }) : {};
      });
    }
  },
}));

