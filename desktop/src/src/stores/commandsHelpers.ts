// A0-S4-3: 自 modules/StoresDeep.tsx §E 原样迁入（F6 CommandsStore 深层助手 + §0 useSkillsStoreStatic 局部声明；原文件现为薄 re-export shim）。
import { normalizeProviderId } from '../modules/SrcSharedB';
import { skillContextKey, useSkillContextStore as useSkillContextStoreStatic } from './skillContextStore'; // 原 UB（A0-S4-3 收尾：改接 stores/ 属主）
import type { SkillsService } from './skillContextStore';
import { useSkillsStore as useSkillsStoreStatic } from './skillsStore'; // 〔A1-R129m〕原 Ne 静态面实接线（下方碑文）
import { useTaskStore } from './taskStore'; // 〔A1-R129n〕原 xe——lFt 实体化依存（getWorkspaceState/invalidateDraftRuntime）
import { t as logger } from '../modules/logger'; // 〔A1-R129n〕原 J——lFt/M6 实体化日志依存

/* ── tombstone〔A1-R129m〕：declare useSkillsStoreStatic（原 Ne 静态面）删除 → 实接线 stores/skillsStore::useSkillsStore。
 *    Ne≡Yn 导出 t（styles 侧 `Ne`，skillsStore 头块既注）；A0-S4-3 抽取 §E 时未接线，幻影 declare 无运行时实体；
 *    本批接线后下方 N6 转录（refreshSkillsAfterCommandsChange）始具运行时真身。
 *    面核：SkillsStoreState 六守卫字段逐一吻合；refresh(service: SkillsService, identity?: string | null)
 *    与调用点（skillContextStore.SkillsService 可赋值于 skillsStore.SkillsService，任务同形）直接兼容。 ── */

/* ============================================================================
 * §E. F6 CommandsStore 深层助手（原 js 142700–142753）
 * ==========================================================================*/

export interface SlashCommandEntry {
  name: string;
  description: string;
  inputHint?: string;
  source: string;
  enabled?: boolean;
  argumentHint?: string;
  [key: string]: unknown;
}

/** 原 P6（142750）：命令加载 in-flight 表（按工作区键去重） */
export const commandsInFlight = new Map<string, Promise<void>>();

/** 原 mFt（142751）：命令工作区键（无工作区 `__no_workspace__`） */
export function commandsWorkspaceKey(workspacePath: string | null, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath || "__no_workspace__";
}

/** 原 uFt（142719）：去前导斜杠 + trim */
export function trimLeadingSlashes(name: string): string {
  return name.trim().replace(/^\/+/, "");
}

/** 原 dFt（142722）：命令名归一键（小写） */
export function commandNameKey(name: string): string {
  return trimLeadingSlashes(name).toLowerCase();
}

/** 原 fFt（142725）：用户命令 → 斜杠命令条目（禁用/空名 → null） */
export function userCommandToSlashCommand(command: {
  enabled?: boolean;
  name: string;
  description?: string;
  argumentHint?: string;
}): SlashCommandEntry | null {
  if (!command.enabled) return null;
  const name = trimLeadingSlashes(command.name);
  return name
    ? {
        name,
        description: command.description ?? "",
        inputHint: command.argumentHint ? `/${name} ${command.argumentHint}` : `/${name}`,
        source: "custom",
      }
    : null;
}

/** 原 pFt（142737）：合并命令进斜杠命令表（非 custom 全保留；custom 按归一名去重补齐） */
export function mergeCommandsIntoSlashCommands(
  existing: SlashCommandEntry[],
  userCommands: Array<{ enabled?: boolean; name: string; description?: string; argumentHint?: string }>,
): SlashCommandEntry[] {
  const nonCustom = existing.filter((entry) => entry.source !== "custom");
  const taken = new Set(nonCustom.map((entry) => commandNameKey(entry.name)).filter(Boolean));
  const merged: SlashCommandEntry[] = [];
  const seen = new Set<string>();
  for (const command of userCommands) {
    const entry = userCommandToSlashCommand(command);
    if (!entry) continue;
    const key = commandNameKey(entry.name);
    if (!key || taken.has(key) || seen.has(key)) continue;
    seen.add(key);
    merged.push(entry);
  }
  return [...nonCustom, ...merged];
}

/**
 * 原 N6（142700）：命令变更后刷新技能域（同工作区 ∧ 同供应商时刷新技能 store；
 * 技能上下文已缓存时一并刷新）。
 */
export async function refreshSkillsAfterCommandsChange(args: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  provider?: string;
  skillsService: SkillsService;
}): Promise<void> {
  const workspacePath = args.workspacePath;
  if (!workspacePath) return;
  const skillsState = useSkillsStoreStatic.getState();
  const identity = args.workspaceIdentity?.trim() || null;
  const provider = normalizeProviderId(args.provider ?? "glm");
  const contextKey = skillContextKey(workspacePath, provider, identity);
  const contextState = useSkillContextStoreStatic.getState();
  const pending: Array<Promise<void>> = [];
  if (
    skillsState.workspacePath === workspacePath &&
    skillsState.workspaceIdentity === identity &&
    skillsState.loadedWorkspacePath === workspacePath &&
    skillsState.loadedWorkspaceIdentity === identity &&
    normalizeProviderId(skillsState.provider) === provider &&
    skillsState.loadedProvider === provider
  ) {
    pending.push(skillsState.refresh(args.skillsService, identity ?? undefined));
  }
  if (contextState.contexts[contextKey]) {
    pending.push(contextState.refresh(workspacePath, provider, args.skillsService, identity ?? undefined));
  }
  await Promise.all(pending);
}

/* ============================================================================
 * §E2. 同区域遗珠（原 js 142686–142716，§E 抽取时未收）：lFt/M6 延迟草稿会话失效
 * ============================================================================ */

/** 原 lFt（styles 142686）：运行时变更后失效延迟草稿会话（无效则关闭会话 + 双日志路）。〔A1-R129n〕实体化。 */
export async function invalidateDeferredDraftSession(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  zcodeSessionService: { closeSession(closeArgs: { workspacePath: string; workspaceIdentity?: string; sessionId: string }): Promise<unknown> };
  reason?: string;
  logScope: string;
}): Promise<void> {
  if (!args.workspacePath) return;
  let t = args.workspaceIdentity?.trim() || void 0,
    n = useTaskStore.getState(),
    r = n.getWorkspaceState(args.workspacePath, t).draftSessionId;
  if ((n.invalidateDraftRuntime(args.workspacePath, t), r))
    try {
      (await args.zcodeSessionService.closeSession({
        workspacePath: args.workspacePath,
        ...(t ? { workspaceIdentity: t } : {}),
        sessionId: r,
      }),
        logger.info(`[${args.logScope}] invalidated deferred draft session after runtime change`, {
          draftSessionId: r,
          reason: args.reason,
          workspaceIdentity: t ?? null,
          workspacePath: args.workspacePath,
        }));
    } catch (n) {
      logger.warn(`[${args.logScope}] close deferred draft session after runtime change failed`, {
        draftSessionId: r,
        reason: args.reason,
        workspaceIdentity: t ?? null,
        workspacePath: args.workspacePath,
        error: n instanceof Error ? n.message : String(n),
      });
    }
}

/** 原 M6（styles 142714）：技能同步后失效延迟草稿会话（lFt logScope=skills 包裹）。〔A1-R129n〕实体化。 */
export async function invalidateDraftSessionAfterSkillSync(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  zcodeSessionService: { closeSession(closeArgs: { workspacePath: string; workspaceIdentity?: string; sessionId: string }): Promise<unknown> };
  reason?: string;
}): Promise<void> {
  await invalidateDeferredDraftSession({ ...args, logScope: `skills` });
}
