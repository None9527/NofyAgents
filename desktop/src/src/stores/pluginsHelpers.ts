// A0-S4-3: 自 modules/StoresDeep.tsx §F 原样迁入（B6 PluginsStore 深层助手 + §0 useTaskStoreStatic 局部声明；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { mergeCommandsIntoSlashCommands } from './commandsHelpers';
import type { SlashCommandEntry } from './commandsHelpers';

/** 原 xe（skillStore h）：useTaskStore（静态面消费） */
declare const useTaskStoreStatic: {
  getState(): {
    workspacePath: string | null;
    workspaceIdentity: string | null;
    loadedWorkspacePath: string | null;
    loadedWorkspaceIdentity: string | null;
    provider?: string;
    loadedProvider?: string;
    refresh(skillsService: unknown, workspaceIdentity?: string): Promise<void>;
    getWorkspaceState(
      workspacePath: string,
      workspaceIdentity?: string,
    ): { slashCommands: SlashCommandEntry[] };
    setSlashCommands(
      workspacePath: string,
      commands: SlashCommandEntry[],
      workspaceIdentity?: string,
    ): void;
  };
};

/* ============================================================================
 * §F. B6 PluginsStore 深层助手（原 js 142873–142984、143135–143180）
 * ==========================================================================*/

export interface PluginDiagnostic {
  severity: string;
  message: string;
  [key: string]: unknown;
}

export interface PluginsAgentService {
  listPlugins(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    plugins: unknown[];
    diagnostics: PluginDiagnostic[];
  }>;
  getPluginsOverview(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    marketplaces: unknown[];
    availablePlugins: unknown[];
    installedPlugins: unknown[];
    restorableBuiltins: unknown[];
    diagnostics: PluginDiagnostic[];
  }>;
  [method: string]: unknown;
}

interface PluginsStoreSnapshot {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  plugins: unknown[];
  marketplaces: unknown[];
  marketplaceAvailabilityKnown: boolean;
  availablePlugins: unknown[];
  installedPlugins: unknown[];
  restorableBuiltins: unknown[];
  diagnostics: PluginDiagnostic[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  [key: string]: unknown;
}

/** 原 hFt（142873）/ z6（142978）/ yFt（143135）：错误消息提取（三处同实现） */
export function pluginErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 gFt（142876）：插件工作区键（身份优先） */
export function pluginsWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 I6（142879）：插件列表加载 in-flight 表 */
export const pluginsInFlight = new Map<string, Promise<void>>();

/**
 * 原 L6（142880）：带 operationId 的通用操作包装。
 * 成功 → 执行回调 + 重载列表，返回 true；失败 → 日志 `[plugins] operation failed` + error 落盘，返回 false。
 */
export async function runPluginOperation(
  set: (partial: Partial<PluginsStoreSnapshot>) => void,
  get: () => PluginsStoreSnapshot,
  pluginService: PluginsAgentService,
  operationId: string,
  operation: (args: { workspacePath: string; workspaceIdentity?: string }) => Promise<void>,
): Promise<boolean> {
  const { workspacePath, workspaceIdentity } = get();
  if (!workspacePath) return false;
  set({ operationId, error: null });
  try {
    await operation({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
    await loadPluginsListDeduped(set, get, { workspacePath, workspaceIdentity, pluginService });
    return true;
  } catch (error) {
    logger.error("[plugins] operation failed", { operationId, error: pluginErrorMessage(error) });
    set({ error: pluginErrorMessage(error) });
    return false;
  } finally {
    set({ operationId: null });
  }
}

/** 原 R6（142900）：列表加载去重（同工作区键并入在途；完成后清槽） */
export async function loadPluginsListDeduped(
  set: (partial: Partial<PluginsStoreSnapshot>) => void,
  get: () => PluginsStoreSnapshot,
  args: { workspacePath: string; workspaceIdentity: string | null; pluginService: PluginsAgentService },
): Promise<void> {
  const key = pluginsWorkspaceKey(args.workspacePath, args.workspaceIdentity);
  const inFlight = pluginsInFlight.get(key);
  if (inFlight) {
    logger.debug("[plugins] join in-flight list", { workspaceKey: key });
    await inFlight;
    return;
  }
  const task = loadPluginsList(set, get, { ...args, workspaceKey: key });
  pluginsInFlight.set(key, task);
  try {
    await task;
  } finally {
    if (pluginsInFlight.get(key) === task) pluginsInFlight.delete(key);
  }
}

/**
 * 原 _Ft（142915）：列表 + 概览并行加载；概览失败降级为仅列表（市场可用性置未知）；
 * 再失败落 error。工作区守卫：写回前校验工作区未变。
 */
export async function loadPluginsList(
  set: (partial: Partial<PluginsStoreSnapshot>) => void,
  get: () => PluginsStoreSnapshot,
  args: { workspacePath: string; workspaceIdentity: string | null; pluginService: PluginsAgentService; workspaceKey: string },
): Promise<void> {
  const guardedSet = (partial: Partial<PluginsStoreSnapshot>) => {
    const snapshot = get();
    if (snapshot.workspacePath !== args.workspacePath || snapshot.workspaceIdentity !== args.workspaceIdentity) return;
    set(partial);
  };
  try {
    const [list, overview] = await Promise.all([
      args.pluginService.listPlugins({
        workspacePath: args.workspacePath,
        ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}),
      }),
      args.pluginService.getPluginsOverview({
        workspacePath: args.workspacePath,
        ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}),
      }),
    ]);
    const diagnostics = [...list.diagnostics, ...overview.diagnostics];
    guardedSet({
      plugins: list.plugins,
      marketplaces: overview.marketplaces,
      marketplaceAvailabilityKnown: true,
      availablePlugins: overview.availablePlugins,
      installedPlugins: overview.installedPlugins,
      restorableBuiltins: overview.restorableBuiltins,
      diagnostics,
      loading: false,
    });
  } catch (error) {
    logger.error("[plugins] overview/list failed", {
      workspacePath: args.workspacePath,
      workspaceKey: args.workspaceKey,
      error: error instanceof Error ? error.message : String(error),
    });
    try {
      const list = await args.pluginService.listPlugins({
        workspacePath: args.workspacePath,
        ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}),
      });
      guardedSet({
        plugins: list.plugins,
        marketplaces: [],
        marketplaceAvailabilityKnown: false,
        availablePlugins: [],
        installedPlugins: [],
        restorableBuiltins: [],
        diagnostics: list.diagnostics,
        loading: false,
      });
      return;
    } catch (fallbackError) {
      logger.error("[plugins] list fallback failed", {
        workspacePath: args.workspacePath,
        workspaceKey: args.workspaceKey,
        error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      });
      guardedSet({
        loading: false,
        marketplaceAvailabilityKnown: false,
        error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      });
    }
  }
}

/** 原 vFt（stores-workspace.tsx 已实现，此处仅登记语义）：诊断含 error 级即抛错 */

/**
 * 原 bFt（143138）：远程插件同步后刷新斜杠命令（工作区守卫 + 任务 store 合并写回）。
 * 失败路径：日志 `[plugins] refresh slash commands after remote plugin sync failed`。
 */
export async function refreshCommandsAfterPluginSync(args: {
  commandsService: {
    list(listArgs: { workspacePath: string; workspaceIdentity?: string }): Promise<{
      commands: SlashCommandEntry[];
      userCommands: SlashCommandEntry[];
      pluginCommands: SlashCommandEntry[];
      capability: { userScopeAvailable: boolean };
    }>;
  };
  reason: string;
  workspacePath: string;
  workspaceIdentity: string | null;
}): Promise<void> {
  const { commandsService, reason, workspacePath, workspaceIdentity } = args;
  const identity = workspaceIdentity ?? undefined;
  try {
    const result = await commandsService.list({ workspacePath, ...(identity ? { workspaceIdentity: identity } : {}) });
    const commandsState = commandsStoreStatic.getState();
    if (commandsState.workspacePath === workspacePath && commandsState.workspaceIdentity === workspaceIdentity) {
      commandsStoreStatic.setState({
        commands: result.commands,
        userCommands: result.userCommands,
        pluginCommands: result.pluginCommands,
        capability: result.capability,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: workspaceIdentity,
        loading: false,
        error: null,
      });
    }
    const taskState = useTaskStoreStatic.getState();
    const slashCommands = taskState.getWorkspaceState(workspacePath, identity).slashCommands;
    taskState.setSlashCommands(workspacePath, mergeCommandsIntoSlashCommands(slashCommands, result.commands), identity);
  } catch (error) {
    const commandsState = commandsStoreStatic.getState();
    if (commandsState.workspacePath === workspacePath && commandsState.workspaceIdentity === workspaceIdentity) {
      commandsStoreStatic.setState({ loading: false, error: pluginErrorMessage(error) });
    }
    logger.warn("[plugins] refresh slash commands after remote plugin sync failed", {
      reason,
      workspaceIdentity,
      workspacePath,
      error: pluginErrorMessage(error),
    });
  }
}

/** F6 静态面（供 bFt 接线；实体在 stores-workspace.tsx） */
declare const commandsStoreStatic: {
  getState(): {
    workspacePath: string | null;
    workspaceIdentity: string | null;
    commands: SlashCommandEntry[];
    userCommands: SlashCommandEntry[];
    pluginCommands: SlashCommandEntry[];
    capability: { userScopeAvailable: boolean };
    loadedWorkspacePath: string | null;
    loadedWorkspaceIdentity: string | null;
    loading: boolean;
    error: string | null;
  };
  setState(partial: Partial<ReturnType<typeof commandsStoreStatic.getState>>): void;
};

/**
 * 原 V6（143172，尾部跨族接线）：远程同步后刷新插件域（工作区守卫 → refresh → 会话侧联动）。
 * 尾部 `M6`（会话登记联动）属 F07 域，接口级。
 */
export async function refreshPluginsAfterRemoteSync(args: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  zcodeAgentService: PluginsAgentService;
  zcodeSessionService: unknown;
}): Promise<void> {
  const workspacePath = args.workspacePath;
  if (!workspacePath) return;
  const identity = args.workspaceIdentity?.trim() || null;
  const pluginsState = pluginsStoreStatic.getState();
  if (pluginsState.workspacePath === workspacePath && pluginsState.workspaceIdentity === identity) {
    await pluginsState.refresh(args.zcodeAgentService);
  }
  await refreshSessionAfterPluginSync({
    zcodeSessionService: args.zcodeSessionService,
    workspacePath,
    workspaceIdentity: identity,
  });
}

interface PluginsStoreStaticState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  refresh(service: PluginsAgentService): Promise<void>;
  [key: string]: unknown;
}
declare const pluginsStoreStatic: { getState(): PluginsStoreStaticState };
/** 原 M6（F07 域；接口级）：插件同步后的会话侧登记联动 */
declare function refreshSessionAfterPluginSync(args: {
  zcodeSessionService: unknown;
  workspacePath: string;
  workspaceIdentity: string | null;
}): Promise<void>;

