/* ============================================================================
 * skillContextStore.ts — 薄 re-export shim（A1-R8 双实例收敛）+ 属主助手
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例之一（自 stores-workspace §2 迁入）。
 * A1-R8 普查：bundle 唯一 UB（@63640，定义于 Composer 转录域 63571–63704，
 * Composer 尾表在案）。树内两并行实例：modules/Composer.tsx 1093 / 本文件 80。
 * 实测消费面：Composer 实例 1173–1176（= bundle 63708–63711 钩子簇，
 * contexts[key]/initialize/refresh/setEnabled 逐字对应）；本文件实例经
 * stores-workspace 77 行 re-export → StoresDeep 146 行 + commandsHelpers 3 行
 * （后者 = bundle N6@142724 UB.getState() 簇）。两实例皆 live → 择一收敛。
 * 裁决：Composer 为 canonical——UB 定义区属主 + 环安全唯一可行向（本文件
 * A0-CLEANUP2 item 13 已 import Composer 之 loadSkillContext，边既成；反向
 * Composer→本文件则与本边成二环）。本文件实例删除（原实现见 git 历史，
 * 检查点 153547a）。
 * 导出面维系：useSkillContextStore（改 re-export）+ skillContextKey（原 BB，
 * 纯函数助手非 store 实例，保留属主位）+ SkillDescriptor/SkillContextEntry/
 * SkillsService/SkillContextState 四型（stores-workspace 63–64 / commandsHelpers
 * 3–4 行 import 面逐一不破）。
 * 环安全：本文件 → modules/Composer 为既有边（loadSkillContext 接线在案），
 * 本批仅扩其导入面，零新边。
 * 同型先例：stores/confirmDialogStore.ts（A1-R6）、stores/alertDialogStore.ts（A1-R7）、
 * stores/codeCommentsStore.ts（A1-R8 同批）。
 * ==========================================================================*/

import { useSkillContextStore } from '../modules/Composer'; // A1-R8 canonical re-export（原 UB js 63640）；本文件 → Composer 边 A0-CLEANUP2 item 13 既成（原载 loadSkillContext，随实例删除并入同一边）
import { resolveDefaultAgentCliProvider as normalizeProvider } from '../modules/SrcSharedA'; // 原 ni

export { useSkillContextStore };

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
