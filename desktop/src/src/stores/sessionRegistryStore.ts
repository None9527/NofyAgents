// A0-S4-3: 自 modules/stores-core.tsx §2 原样迁入（SessionRegistryStore + 模块级助手；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
// A0-CLEANUP3 3b：BaseServices 服务面收敛——各属主真实类型（type-only，无运行时环）
// A0-S4-3 收尾：改接 stores/ 属主（原经 modules/stores-tasks、stores-workspace shim）
import type { AutomationsAgentService } from './automationsStore';
import type { OffPeakGrayConfig, OffPeakTaskService } from './offPeakTaskStore';
import type { ZCodeTaskService } from './pinnedTaskListStore';
import type { CommandsService, SubagentsService } from './commandsStore';
import type { McpSyncService } from './mcpStore';
import type { PluginService } from './pluginsStore';
import type { SkillsService } from './skillContextStore';
import type { MemoryService, SettingService, SystemService } from '../modules/Settings';
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 2. SessionRegistryStore（原 Zs，js 4309–4352 / jsx 3184）
 * ----------------------------------------------------------------------------
 * 全局会话注册表：基础服务 + 按 sessionId/工作区路径/工作区身份 三索引。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | baseServices | BaseServices \| null | 本地（基础）服务集，由 registerBaseServices 注入 |
 *  | sessionsById | Record<sessionId, RegisteredSession> | 远端会话注册表 |
 *  | sessionIdByWorkspacePath | Record<path, sessionId> | 工作区路径 → 会话反查 |
 *  | sessionIdByWorkspaceIdentity | Record<identity, sessionId> | 工作区身份 → 会话反查 |
 * actions：registerBaseServices/registerSession/unregisterSession/
 *   bindWorkspacePath/unbindWorkspacePath/bindWorkspaceIdentity/unbindWorkspaceIdentity（7 个）
 * selectors 使用方（抽样）：共 30 处调用点 —— 4834/4900/4905/4924（服务解析）、
 *   24245（useWorkspaceProviderConfigFile）、35729–35731（任务列表域）等。
 * 持久化：无（纯内存）。
 * ==========================================================================*/

export interface BaseServices {
  /** 宿主 agent 服务；automations 面为其子面（ExtendedViews initializeAutomations 消费），其余成员经索引签名兜底 */
  zcodeAgentService?: AutomationsAgentService;
  zcodeTaskService?: ZCodeTaskService;
  zcodeSessionService?: { closeSession(args: unknown): Promise<any>; [method: string]: unknown };
  /** A0-CLEANUP3 3b：按消费面（Modals McpSyncDialog 本地面）补足同步方法 */
  mcpSyncService?: McpSyncService & {
    listLocalUserMcpCandidates(): Promise<any>;
    exportMcpServers(args: unknown): Promise<any>;
    listRemoteUserMcpStatuses(args: unknown): Promise<any>;
    checkRemoteUserMcpWriteAccess(): Promise<any>;
    importMcpServers(payload: unknown): Promise<any>;
  };
  fileWatcherService?: unknown;
  localModelProviderService?: unknown;
  /* A0-CLEANUP3 3b：属主已重建的服务面（field → owner 见 A0-CLEANUP3.report.md） */
  skillsService?: SkillsService;
  commandsService?: CommandsService;
  pluginService?: PluginService;
  pluginManagementService?: PluginService;
  subagentsService?: SubagentsService;
  automationsAgentService?: AutomationsAgentService;
  offPeakTaskService?: OffPeakTaskService;
  /** 宿主支付/订阅 IPC 服务（方法面过宽，按可调用索引签名兜底；PaymentDeep/UsageDeep 消费）；
   *  getOffPeakClientConfig = off-peak 灰度配置面（bundle js 91441 bX.initialize 消费，A0-CLEANUP4 具型） */
  codingPlanSubscriptionService?: {
    getOffPeakClientConfig(opts: { forceRefresh: boolean }): Promise<OffPeakGrayConfig | null>;
    [method: string]: (...args: any[]) => any;
  };
  paymentService?: Record<string, (...args: any[]) => any>;
  settingService?: SettingService;
  systemService?: SystemService;
  memoryService?: MemoryService;
  modelProviderService?: {
    onDidChangeProviderRegistry(cb: (event: any) => void): { dispose(): void };
    refreshCodingPlanApiKey(providerId: string): Promise<any>;
    getAllCached(): Promise<any>;
    [method: string]: unknown;
  };
  repoWikiService?: {
    onDidChangeRepoWiki(cb: (event: any) => void): { dispose(): void };
    readSummary(args: unknown): Promise<any>;
    readPage(args: unknown): Promise<any>;
    generate(args: unknown): Promise<any>;
    delete(args: unknown): Promise<any>;
    cancel(args: unknown): void;
    [method: string]: unknown;
  };
  hooksService?: { loadHooks(args: unknown): Promise<any>; saveHooks(args: unknown): Promise<any>; [method: string]: unknown }; // A0-CLEANUP3 3b：按消费面（StoresDeep.HooksService/SPC 本地面）具型
  skillSyncService?: {
    listLocalUserSkillCandidates(): Promise<any>;
    exportSkillsArchive(args: unknown): Promise<any>;
    /* A0-CLEANUP3 3b：按消费面（Modals.RemoteSkillSyncService）补足远端同步方法 */
    listRemoteUserSkillStatuses(args: unknown): Promise<any>;
    checkRemoteUserSkillWriteAccess(): Promise<any>;
    importSkillsArchive(args: unknown): Promise<any>;
    [method: string]: unknown;
  }; // A0-CLEANUP3 3b：按消费面（Modals 同步对话框）具型
  pluginSyncService?: {
    listLocalUserPluginCandidates(): Promise<any>;
    exportPluginsArchive(args: unknown): Promise<any>;
    exportMarketplaceSourceArchive(args: unknown): Promise<any>;
    /* A0-CLEANUP3 3b：按消费面（Modals.RemotePluginSyncService）补足远端同步方法 */
    listRemoteUserPluginStatuses(args: unknown): Promise<any>;
    checkRemoteUserPluginWriteAccess(): Promise<any>;
    importPluginsArchive(args: unknown): Promise<any>;
    importMarketplaceSourceArchive(args: unknown): Promise<any>;
    [method: string]: unknown;
  };
  credentialService?: { load(key: string): Promise<any>; [method: string]: unknown };
  oauthService?: { logout(providerId: string): Promise<any>; [method: string]: unknown };
  settingsSyncService?: { detect(args: unknown): Promise<any>; importSelected(args: unknown): Promise<any>; [method: string]: unknown };
  [serviceName: string]: unknown;
}

/** A0-CLEANUP3 3b：运行期恒有值的热服务面（启动注册 + 断开 Proxy 兜底）；
 * useServices/useBaseServices 等「必有上下文」钩子的收窄返回型，消除消费端 undefined 守卫。 */
export type ResolvedBaseServices = BaseServices &
  Pick<
    Required<BaseServices>,
    | "settingService"
    | "systemService"
    | "memoryService"
    | "mcpSyncService"
    | "zcodeTaskService"
    | "zcodeSessionService"
    | "skillsService"
    | "commandsService"
    | "pluginService"
    | "pluginManagementService"
    | "subagentsService"
    | "repoWikiService"
    | "zcodeAgentService"
    | "automationsAgentService"
    | "offPeakTaskService"
    | "modelProviderService"
    | "credentialService"
    | "oauthService"
    | "settingsSyncService"
    | "hooksService"
    | "skillSyncService"
    | "pluginSyncService"
    | "codingPlanSubscriptionService"
  >;

export interface RegisteredSession {
  sessionId: string;
  services: BaseServices;
  [key: string]: unknown;
}

export interface SessionRegistryState {
  baseServices: BaseServices | null;
  sessionsById: Record<string, RegisteredSession>;
  sessionIdByWorkspacePath: Record<string, string>;
  sessionIdByWorkspaceIdentity: Record<string, string>;
  registerBaseServices(services: BaseServices): void;
  registerSession(session: RegisteredSession): void;
  unregisterSession(sessionId: string): void;
  bindWorkspacePath(path: string, sessionId: string): void;
  unbindWorkspacePath(path: string): void;
  bindWorkspaceIdentity(identity: string, sessionId: string): void;
  unbindWorkspaceIdentity(identity: string): void;
}

export const useSessionRegistryStore: UseBoundStore<SessionRegistryState> = createStore<SessionRegistryState>((set) => ({
  baseServices: null,
  sessionsById: {},
  sessionIdByWorkspacePath: {},
  sessionIdByWorkspaceIdentity: {},
  registerBaseServices: (services) => set({ baseServices: services }),
  registerSession: (session) => set((state) => ({ sessionsById: { ...state.sessionsById, [session.sessionId]: session } })),
  unregisterSession: (sessionId) =>
    set((state) => {
      const sessionsById = { ...state.sessionsById };
      delete sessionsById[sessionId];
      return {
        sessionsById,
        sessionIdByWorkspacePath: Object.fromEntries(Object.entries(state.sessionIdByWorkspacePath).filter(([, id]) => id !== sessionId)),
        sessionIdByWorkspaceIdentity: Object.fromEntries(Object.entries(state.sessionIdByWorkspaceIdentity).filter(([, id]) => id !== sessionId)),
      };
    }),
  bindWorkspacePath: (path, sessionId) =>
    set((state) => ({ sessionIdByWorkspacePath: { ...state.sessionIdByWorkspacePath, [path]: sessionId } })),
  unbindWorkspacePath: (path) =>
    set((state) => {
      if (!(path in state.sessionIdByWorkspacePath)) return state;
      const next = { ...state.sessionIdByWorkspacePath };
      delete next[path];
      return { ...state, sessionIdByWorkspacePath: next };
    }),
  bindWorkspaceIdentity: (identity, sessionId) =>
    set((state) => ({ sessionIdByWorkspaceIdentity: { ...state.sessionIdByWorkspaceIdentity, [identity]: sessionId } })),
  unbindWorkspaceIdentity: (identity) =>
    set((state) => {
      if (!(identity in state.sessionIdByWorkspaceIdentity)) return state;
      const next = { ...state.sessionIdByWorkspaceIdentity };
      delete next[identity];
      return { ...state, sessionIdByWorkspaceIdentity: next };
    }),
}));

/* --- 模块级助手（原 xse/Sse/Qs/$s/Cse/ec/wse/tc/Tse + Xs 服务代号，js 4303–4378） --- */

/** 服务实例代号（原 Xs：WeakMap 递增编号，用于跨代比较服务实例） */
const serviceGenerations = new WeakMap<object, number>();
let nextServiceGeneration = 1;
export function serviceGeneration(service: object): number {
  const known = serviceGenerations.get(service);
  if (known !== undefined) return known;
  const generation = nextServiceGeneration++;
  serviceGenerations.set(service, generation);
  return generation;
}

/** 原 Sse：注入基础服务（应用引导期调用一次） */
export function registerBaseServices(services: BaseServices): void {
  useSessionRegistryStore.getState().registerBaseServices(services);
}

/** 原 xse：注册远端会话（给 zcodeAgentService 打代号后入表） */
export function registerRemoteSession(entry: RegisteredSession): void {
  if (entry.services.zcodeAgentService) serviceGeneration(entry.services.zcodeAgentService as object);
  useSessionRegistryStore.getState().registerSession(entry);
}

/** 原 Qs：注销会话（同时清除该工作区的 provider registry 同步状态，见 services.tsx） */
export declare function unregisterSessionAndPurgeSyncState(sessionId: string): void;

export function bindWorkspacePath(path: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspacePath(path, sessionId);
}
export function unbindWorkspacePath(path: string): void {
  useSessionRegistryStore.getState().unbindWorkspacePath(path);
}
export function bindWorkspaceIdentity(identity: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspaceIdentity(identity, sessionId);
}
export function unbindWorkspaceIdentity(identity: string): void {
  useSessionRegistryStore.getState().unbindWorkspaceIdentity(identity);
}

/** 原 tc：按 sessionId 取会话 */
export function getSessionById(sessionId: string): RegisteredSession | null {
  return useSessionRegistryStore.getState().sessionsById[sessionId] ?? null;
}

/** 原 Tse：按工作区身份取其会话服务集 */
export function getServicesByWorkspaceIdentity(identity: string): BaseServices | null {
  const state = useSessionRegistryStore.getState();
  const sessionId = state.sessionIdByWorkspaceIdentity[identity];
  return sessionId ? (state.sessionsById[sessionId]?.services ?? null) : null;
}

