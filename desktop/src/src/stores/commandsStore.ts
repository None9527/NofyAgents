// A0-S4-3: 自 modules/stores-workspace.tsx §4 原样迁入（F6 CommandsStore + 局部 commandsInFlight/commandsWorkspaceKey 副本；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 4. CommandsStore（原 F6，js 142754–142984 / jsx 118681）
 * ----------------------------------------------------------------------------
 * 斜杠命令（用户自定义 + 插件提供）：按工作区加载/增删改/启停。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | workspacePath / workspaceIdentity | string\|null | 当前工作区 |
 *  | loadedWorkspacePath / loadedWorkspaceIdentity | string\|null | 已加载数据对应的工作区 |
 *  | commands | CommandDescriptor[] | 合并后的全部命令 |
 *  | userCommands | CommandDescriptor[] | 用户命令子集 |
 *  | pluginCommands | CommandDescriptor[] | 插件命令子集 |
 *  | capability | { userScopeAvailable: boolean } | 能力位 |
 *  | loading | boolean | 加载中 |
 *  | error | string \| null | 最近错误 |
 *  | operatingCommandId | string \| null | 正在操作的命令（改/删/启停锁） |
 * actions：initialize/refresh/createCommand/updateCommand/deleteCommand/toggleCommand（6 个）
 * 并发：按工作区键的 in-flight 表（原 P6 Map）防止重复加载。
 * ==========================================================================*/

export interface CommandDescriptor {
  id: string;
  commandId?: string;
  name: string;
  description: string;
  inputHint?: string;
  source: "custom" | "plugin" | string;
  enabled: boolean;
  argumentHint?: string;
  [key: string]: unknown;
}

/** 子代理管理服务（调用面归纳：SettingsPanelsCapability/Composer/SkillStore 消费；条目型面按 any 兜底） */
export interface SubagentsService {
  list(args: unknown): Promise<any>;
  getPrimaryUserAgentsDirectory(args: unknown): Promise<{ path: string }>;
  createAgent(args: unknown): Promise<any>;
  updateAgent(args: unknown): Promise<any>;
  deleteAgent(args: unknown): Promise<any>;
  setEnabled(args: unknown): Promise<any>;
  setBuiltInModelOverride(args: unknown): Promise<any>;
  [method: string]: unknown;
}

export interface CommandsService {
  list(args: { workspacePath?: string | null; workspaceIdentity?: string }): Promise<{
    commands: CommandDescriptor[];
    userCommands: CommandDescriptor[];
    pluginCommands: CommandDescriptor[];
    capability: { userScopeAvailable: boolean };
  }>;
  writeCommandFile(draft: unknown): Promise<{ command: CommandDescriptor }>;
  updateCommandFile(args: { commandId: string; [key: string]: unknown }): Promise<{ command: CommandDescriptor }>;
  deleteCommandFile(args: { commandId: string }): Promise<void>;
  setCommandEnabled(args: { commandId: string; enabled: boolean }): Promise<void>;
  getPrimaryUserCommandsDirectory(args: { agentSource: string }): Promise<{ path: string }>;
}

export interface CommandsState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspacePath: string | null;
  loadedWorkspaceIdentity: string | null;
  commands: CommandDescriptor[];
  userCommands: CommandDescriptor[];
  pluginCommands: CommandDescriptor[];
  capability: { userScopeAvailable: boolean };
  loading: boolean;
  error: string | null;
  operatingCommandId: string | null;
  initialize(workspacePath: string | null, service: CommandsService, workspaceIdentity?: string | null): Promise<void>;
  refresh(service: CommandsService): Promise<void>;
  createCommand(draft: unknown, service: CommandsService): Promise<CommandDescriptor>;
  updateCommand(args: { commandId: string; [key: string]: unknown }, service: CommandsService): Promise<CommandDescriptor>;
  deleteCommand(args: { commandId: string }, service: CommandsService): Promise<boolean>;
  toggleCommand(args: { commandId: string; enabled: boolean }, service: CommandsService): Promise<void>;
}

const commandsInFlight = new Map<string, Promise<void>>(); // 原 P6

/** 原 mFt：命令加载的工作区键（无工作区时 `__no_workspace__`） */
function commandsWorkspaceKey(workspacePath: string | null, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath || "__no_workspace__";
}

export const useCommandsStore: UseBoundStore<CommandsState> = createStore<CommandsState>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  commands: [],
  userCommands: [],
  pluginCommands: [],
  capability: { userScopeAvailable: true },
  loading: false,
  error: null,
  operatingCommandId: null,
  initialize: async (workspacePath, service, workspaceIdentity) => {
    const identity = workspaceIdentity?.trim() || null;
    set({ workspacePath: workspacePath ?? null, workspaceIdentity: identity });
    const key = commandsWorkspaceKey(workspacePath, identity ?? undefined);
    const existing = commandsInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const load = (async () => {
      set({ loading: true, error: null });
      try {
        const result = await service.list({ workspacePath, ...(identity ? { workspaceIdentity: identity } : {}) });
        set({
          commands: result.commands,
          userCommands: result.userCommands,
          pluginCommands: result.pluginCommands,
          capability: result.capability,
          loadedWorkspacePath: workspacePath ?? null,
          loadedWorkspaceIdentity: identity,
          loading: false,
        });
      } catch (error) {
        set({ loading: false, error: error instanceof Error ? error.message : String(error) });
      } finally {
        commandsInFlight.delete(key);
      }
    })();
    commandsInFlight.set(key, load);
    await load;
  },
  refresh: async (service) => {
    const { workspacePath, workspaceIdentity } = get();
    set({ loading: true, error: null });
    try {
      const result = await service.list({ workspacePath: workspacePath ?? undefined, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
      set({
        commands: result.commands,
        userCommands: result.userCommands,
        pluginCommands: result.pluginCommands,
        capability: result.capability,
        loadedWorkspacePath: workspacePath,
        loadedWorkspaceIdentity: workspaceIdentity,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },
  createCommand: async (draft, service) => {
    set({ error: null });
    try {
      const { command } = await service.writeCommandFile(draft);
      const { commands, userCommands } = get();
      set({ commands: [...commands, command], userCommands: [...userCommands, command] });
      return command;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  updateCommand: async (args, service) => {
    set({ operatingCommandId: args.commandId, error: null });
    try {
      const { command } = await service.updateCommandFile(args);
      const { commands, userCommands } = get();
      set({
        commands: commands.map((item) => (item.id === args.commandId ? command : item)),
        userCommands: userCommands.map((item) => (item.id === args.commandId ? command : item)),
        operatingCommandId: null,
      });
      return command;
    } catch (error) {
      set({ operatingCommandId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  deleteCommand: async (args, service) => {
    set({ operatingCommandId: args.commandId, error: null });
    try {
      await service.deleteCommandFile(args);
      const { commands, userCommands } = get();
      set({
        commands: commands.filter((item) => item.id !== args.commandId),
        userCommands: userCommands.filter((item) => item.id !== args.commandId),
        operatingCommandId: null,
      });
      return true;
    } catch (error) {
      set({ operatingCommandId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  toggleCommand: async (args, service) => {
    set({ operatingCommandId: args.commandId, error: null });
    try {
      await service.setCommandEnabled(args);
      const { commands, userCommands } = get();
      set({
        commands: commands.map((item) => (item.id === args.commandId ? { ...item, enabled: args.enabled } : item)),
        userCommands: userCommands.map((item) => (item.id === args.commandId ? { ...item, enabled: args.enabled } : item)),
        operatingCommandId: null,
      });
    } catch (error) {
      set({ operatingCommandId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
}));

/* --- 斜杠命令合并助手（原 uFt/dFt/fFt/pFt，js 142719–142749） --- */

function stripLeadingSlashes(name: string): string {
  return name.trim().replace(/^\/+/, "");
}

/** 原 pFt：把服务返回的命令并入既有斜杠命令（自定义命令不与已存名冲突） */
export function mergeSlashCommands(existing: CommandDescriptor[], serviceCommands: CommandDescriptor[]): CommandDescriptor[] {
  const nonCustom = existing.filter((command) => command.source !== "custom");
  const takenNames = new Set(nonCustom.map((command) => stripLeadingSlashes(command.name).toLowerCase()).filter(Boolean));
  const merged: CommandDescriptor[] = [];
  const seen = new Set<string>();
  for (const command of serviceCommands) {
    if (!command.enabled) continue;
    const name = stripLeadingSlashes(command.name);
    if (!name) continue;
    const descriptor: CommandDescriptor = {
      ...command,
      name,
      description: command.description ?? "",
      inputHint: command.argumentHint ? `/${name} ${command.argumentHint}` : `/${name}`,
      source: "custom",
    };
    const lowered = name.toLowerCase();
    if (takenNames.has(lowered) || seen.has(lowered)) continue;
    seen.add(lowered);
    merged.push(descriptor);
  }
  return [...nonCustom, ...merged];
}

