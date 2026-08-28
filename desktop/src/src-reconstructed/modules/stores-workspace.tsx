/* eslint-disable */
/**
 * ============================================================================
 * stores-workspace.tsx — ZCode 3.7.6 横切层 zustand stores · 工作区域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件含 6 个 store：
 *
 *  # | 混淆名 | 语义名              | js 行          | 归属族
 *  --|--------|----------------------|----------------|--------
 *  5 | Ug     | McpStore             | 25007–25973    | F06
 *  7 | UB     | SkillContextStore    | 63592–63845    | F08
 *  9 | FH     | CodeCommentsStore    | 68514–68579    | F14
 * 17 | F6     | CommandsStore        | 142754–142984  | F06
 * 18 | B6     | PluginsStore         | 142985–143100  | F06
 * 19 | Z0t    | HooksStore           | 201244–201421  | F06
 *
 * ----------------------------------------------------------------------------
 * 持久化键
 * ----------------------------------------------------------------------------
 *  McpStore: zcode-mcp-deleted-preload（zg，24788；被预载 MCP 的删除名单）；
 *            服务器配置经 mcpSyncService（Lg/Rg 助手）落盘到各来源配置文件
 *  Commands/Plugins/Hooks/SkillContext/CodeComments: 无（配置在宿主文件系统，经服务读写）
 *
 * selectors 使用方（抽样）：
 *  Ug：15 处 —— 194658–194676（设置 MCP 分区）、25350 S_e 接线钩子等
 *  F6：13 处 —— 200506–200513（设置 commands 分区）等
 *  B6：37 处 —— 194660、199959、200014–200018（设置 plugins 分区/市场）等
 *  Z0t：1 处 —— 202037（设置 hooks 分区）
 *  UB：4 处 —— 63660–63663（WB useSkillContext 钩子）
 *  FH：3 处 —— 161208–161210（代码查看器行级评论）
 * ============================================================================
 */

/* ============================================================================
 * 0. zustand 接口（同 stores-core.tsx）
 * ==========================================================================*/

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
type GetState<T> = () => T;
interface StoreApi<T> {
  getState: GetState<T>;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}
export type UseBoundStore<T> = StoreApi<T> & (<R>(selector: (state: T) => R) => R);
declare function createStore<T>(initializer: (set: SetState<T>, get: GetState<T>) => T): UseBoundStore<T>;

declare const logger: {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, ...meta: unknown[]): void;
  error(msg: string, ...meta: unknown[]): void;
};

/** 原 Io：工作区键（identity 优先，回退 path） */
declare function workspaceKey(workspacePath: string, workspaceIdentity?: string | null): string;
/** 原 ni：供应商 id 归一 */
declare function normalizeProvider(provider: string): string;
/** 原 Sc：是否远端工作区断开错误 */
declare function isRemoteDisconnectedError(error: unknown): boolean;

/* ============================================================================
 * 1. McpStore（原 Ug，js 25007–25973 / jsx 21655）
 * ----------------------------------------------------------------------------
 * MCP（Model Context Protocol）服务器管理：多来源（zcodeagentmcp/claudeclimcp/
 * geminiclimcp/codexclimcp/opencodemcp/mcp 预载）× 作用域（user/workspace）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | config | McpConfig | 本地 mcp 配置（缺省 i_e 展开） |
 *  | nativeServers | NativeMcpServer[] | 从用户目录/工作区读到的原生服务器 |
 *  | servers | DerivedMcpServer[] | 归一后的展示列表（Vg 派生） |
 *  | statusSnapshots | Record<serverId, StatusSnapshot> | 连接状态快照 |
 *  | currentProjectPath | string | 当前工作区路径 |
 *  | currentWorkspaceIdentity | string \| undefined | 当前工作区身份 |
 *  | enabledStates | Record<serverId, boolean> | 启用覆盖 |
 *  | deletedPreloadMcpServers | Set<string> | 被删除的预载服务器名单（持久化 zcode-mcp-deleted-preload） |
 *  | isConfigLoaded | boolean | 配置是否已加载 |
 *  | currentSessionId | string \| null | 当前会话 |
 * actions（38）：loadConfig/loadMcpFromUserDirectory/ensureLoadedForWorkspace/saveConfig/
 *   addMcpServer/updateMcpServer/deleteMcpServer/
 *   addScopedMcpServer/updateScopedMcpServer/deleteScopedMcpServer/
 *   {add|update|delete}{ClaudeCli|GeminiCli|CodexCli|OpenCode|ZCodeAgent}McpServer（15 个）/
 *   toggleServer/updateServerStatus/beginServerStatusListRefresh/
 *   markServerStatusListRefreshFailed/mergeServerStatusSnapshots/getServer/
 *   setCurrentProjectPath/getEnabledMcpServersForZCode/checkAllServerStatus/
 *   mergePreloadedMcpServers/deletePreloadedMcpServer/setCurrentSessionId/migrateLegacyCommonMcp
 * 节流：connect/status 两个请求代次计数（原 i），变更动作经 a() 双双递增。
 * ==========================================================================*/

export type McpSource = "mcp" | "zcodeagentmcp" | "claudeclimcp" | "geminiclimcp" | "codexclimcp" | "opencodemcp";
export type McpScope = "user" | "workspace";
export type McpServerStatus = "unknown" | "connecting" | "connected" | "error" | string;

export interface McpServerConfig {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  [key: string]: unknown;
}

export interface NativeMcpServer {
  source: McpSource;
  scope: McpScope;
  name: string;
  config: McpServerConfig;
  enabled: boolean;
  projectPath?: string;
  location?: unknown;
}

export interface DerivedMcpServer {
  id: string;
  source: McpSource;
  scope: McpScope;
  name: string;
  config: McpServerConfig;
  enabled: boolean;
  projectPath?: string;
  location?: unknown;
  status: McpServerStatus;
  authorization?: unknown;
  error?: string;
  toolCount?: number;
  changed?: boolean;
  lastConnected?: Date;
}

export interface McpConfig {
  mcpServers?: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

export interface McpSyncService {
  [method: string]: unknown;
}

export interface McpState {
  config: McpConfig;
  nativeServers: NativeMcpServer[];
  servers: DerivedMcpServer[];
  statusSnapshots: Record<string, unknown>;
  currentProjectPath: string;
  currentWorkspaceIdentity: string | undefined;
  enabledStates: Record<string, boolean>;
  deletedPreloadMcpServers: Set<string>;
  isConfigLoaded: boolean;
  currentSessionId: string | null;
  loadConfig(): void;
  loadMcpFromUserDirectory(syncService?: unknown, workspaceIdentity?: string | null): Promise<boolean>;
  ensureLoadedForWorkspace(workspacePath: string | null, syncService: unknown, workspaceIdentity?: string | null): Promise<boolean>;
  saveConfig(): void;
  addMcpServer(name: string, config: McpServerConfig): Promise<void>;
  updateMcpServer(name: string, config: McpServerConfig): Promise<void>;
  deleteMcpServer(name: string): void;
  addScopedMcpServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateScopedMcpServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteScopedMcpServer(source: McpSource, name: string, projectPath?: string): void;
  addClaudeCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateClaudeCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteClaudeCliMcpServer(name: string, projectPath?: string): void;
  addGeminiCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateGeminiCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteGeminiCliMcpServer(name: string, projectPath?: string): void;
  addCodexCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateCodexCliMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteCodexCliMcpServer(name: string, projectPath?: string): void;
  addOpenCodeMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateOpenCodeMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteOpenCodeMcpServer(name: string, projectPath?: string): void;
  addZCodeAgentMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  updateZCodeAgentMcpServer(name: string, config: McpServerConfig, projectPath?: string): Promise<void>;
  deleteZCodeAgentMcpServer(name: string, projectPath?: string): void;
  toggleServer(serverId: string, enabled: boolean): Promise<void>;
  updateServerStatus(serverId: string, status: McpServerStatus, error?: string, options?: { invalidateStatusListRequests?: boolean }): void;
  beginServerStatusListRefresh(kind?: "connect" | "status"): number;
  markServerStatusListRefreshFailed(error: string, generation: number, kind?: "connect" | "status"): void;
  mergeServerStatusSnapshots(snapshots: Record<string, unknown>, generation: number, kind?: "connect" | "status"): void;
  getServer(serverId: string): DerivedMcpServer | undefined;
  setCurrentProjectPath(path: string, workspaceIdentity?: string | null, syncService?: unknown): void;
  getEnabledMcpServersForZCode(options?: unknown): Array<{ name: string; config: McpServerConfig }>;
  checkAllServerStatus(probe: (config: McpServerConfig) => Promise<{ success: boolean; error?: string }>): Promise<void>;
  mergePreloadedMcpServers(servers: Record<string, McpServerConfig>): void;
  deletePreloadedMcpServer(source: McpSource, name: string): void;
  setCurrentSessionId(sessionId: string | null): void;
  migrateLegacyCommonMcp(): Promise<{ changed: boolean }>;
}

/* --- 外部助手（原实现位于 24015–25006 的 MCP 接线区，接口级声明） --- */

const MCP_DELETED_PRELOAD_KEY = "zcode-mcp-deleted-preload"; // 原 zg（24788）

/** 原 Hg：mcpSyncService 句柄（b_e 注入；24999） */
let mcpSyncServiceHandle: McpSyncService | null = null;
/** 原 y_e：当前会话级 mcpSyncService（x_e 注入；25004） */
let sessionMcpSyncService: McpSyncService | null = null;
export function setMcpSyncServiceHandle(service: McpSyncService | null): void {
  mcpSyncServiceHandle = service;
}
export function setSessionMcpSyncService(service: McpSyncService | null): void {
  sessionMcpSyncService = service;
}

declare const DEFAULT_MCP_CONFIG: McpConfig; // 原 i_e
declare function readLocalMcpConfig(): McpConfig; // 原 s_e
declare function readDeletedPreloadServers(key: string, fallback: string[]): string[]; // 原 a_e
declare function writeDeletedPreloadServers(key: string, names: string[]): void; // 原 o_e
declare function listNativeMcpServers(service: McpSyncService | null, args: { workspacePath?: string }, identityOrService?: unknown): Promise<NativeMcpServer[]>; // 原 Rg
declare function mergeWorkspaceNativeServers(service: McpSyncService | null, servers: NativeMcpServer[], workspacePath?: string): Promise<NativeMcpServer[]>; // 原 g_e
declare function persistMcpChange(service: McpSyncService | null, change: Record<string, unknown>, identityOrService: unknown): Promise<void>; // 原 Lg
declare function deriveMcpServers(
  config: McpConfig,
  nativeServers: NativeMcpServer[],
  enabledStates: Record<string, boolean>,
  deletedPreload: Set<string>,
  previous: DerivedMcpServer[],
): DerivedMcpServer[]; // 原 Vg
declare function applyStatusSnapshots(servers: DerivedMcpServer[], snapshots: Record<string, unknown>, options: { markMissingConnectingAsError: boolean }): DerivedMcpServer[]; // 原 v_e
declare function preloadServerKey(source: McpSource, name: string): string; // 原 Bg
declare function mcpScopePriority(server: NativeMcpServer): number; // 原 p_e
declare function toZCodeMcpServer(name: string, config: McpServerConfig): { name: string; config: McpServerConfig } | null; // 原 Ii
declare function readLegacyCommonMcp(service: McpSyncService | null): Promise<{ servers: Record<string, McpServerConfig>; sourcePath?: string }>; // 原 n_e
declare function migrateLegacyCommonMcpServers(
  service: McpSyncService | null,
  legacy: Record<string, McpServerConfig>,
  nativeServers: NativeMcpServer[],
  sourcePath?: string,
): Promise<{ changed: boolean }>; // 原 h_e

export const useMcpStore: UseBoundStore<McpState> = createStore<McpState>((set, get) => {
  let inFlightLoad: Promise<boolean> | null = null;
  let inFlightLoadKey: string | null = null;
  const refreshGenerations = { connect: 0, status: 0 }; // 原 i

  function bumpGenerations() {
    refreshGenerations.connect += 1;
    refreshGenerations.status += 1;
  }

  /** 原 o：解析持久化用 mcpSyncService（无工作区身份则不落盘，返回 null） */
  function persistenceIdentity(syncService?: unknown, workspaceIdentity?: string | null): unknown {
    const identity = (workspaceIdentity ?? get().currentWorkspaceIdentity)?.trim();
    return identity ? (syncService ?? sessionMcpSyncService) : null;
  }

  /** 原 s：以补丁重算派生列表 */
  function withDerived(patch: { config?: McpConfig; nativeServers?: NativeMcpServer[] }) {
    const state = get();
    const config = patch.config ?? state.config;
    const nativeServers = patch.nativeServers ?? state.nativeServers;
    return {
      config,
      nativeServers,
      servers: deriveMcpServers(config, nativeServers, state.enabledStates, state.deletedPreloadMcpServers, state.servers),
    };
  }

  /** 原 c：upsert 原生服务器条目 */
  function upsertNativeServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string) {
    const nativeServers = get().nativeServers.slice();
    const index = nativeServers.findIndex((server) => server.source === source && server.name === name && server.projectPath === projectPath);
    if (index >= 0) {
      const existing = nativeServers[index];
      if (!existing) return;
      nativeServers[index] = { ...existing, config };
    } else {
      nativeServers.push({ source, scope: projectPath ? "workspace" : "user", name, config, enabled: true, projectPath });
    }
    set(withDerived({ nativeServers }));
  }

  /** 原 l：非 mcp 来源的变更持久化（失败仅告警） */
  async function persistChange(source: McpSource, change: Record<string, unknown>) {
    if (source === "mcp") return;
    await persistMcpChange(mcpSyncServiceHandle, change, persistenceIdentity()).catch((error) => {
      logger.warn(`[mcpStore] persist ${source} MCP failed`, String(error));
    });
  }

  return {
    config: { ...DEFAULT_MCP_CONFIG },
    nativeServers: [],
    servers: [],
    statusSnapshots: {},
    currentProjectPath: "",
    currentWorkspaceIdentity: undefined,
    enabledStates: {},
    deletedPreloadMcpServers: new Set<string>(),
    isConfigLoaded: false,
    currentSessionId: null,
    loadConfig: () => {
      const config = readLocalMcpConfig();
      const enabledStates: Record<string, boolean> = {};
      const deleted = new Set(readDeletedPreloadServers(MCP_DELETED_PRELOAD_KEY, []));
      set({ config, nativeServers: [], enabledStates, deletedPreloadMcpServers: deleted, servers: deriveMcpServers(config, [], enabledStates, deleted, []), statusSnapshots: {}, isConfigLoaded: true });
    },
    loadMcpFromUserDirectory: async (syncService, workspaceIdentity) => {
      if (typeof window === "undefined") return false;
      const requestedPath = get().currentProjectPath || undefined;
      const requestedKey = (workspaceIdentity ?? get().currentWorkspaceIdentity)?.trim() || requestedPath || "";
      if (inFlightLoad && inFlightLoadKey === requestedKey) return await inFlightLoad;
      if (inFlightLoad) await inFlightLoad;
      const currentPath = get().currentProjectPath || undefined;
      const currentIdentity = get().currentWorkspaceIdentity;
      const currentKey = currentIdentity?.trim() || currentPath || "";
      if (currentKey !== requestedKey) return false;
      const identity = persistenceIdentity(syncService, currentIdentity);
      if (inFlightLoad && inFlightLoadKey === currentKey) return await inFlightLoad;
      inFlightLoadKey = currentKey;
      inFlightLoad = (async () => {
        try {
          logger.info(`[mcpStore] loadMcpFromUserDirectory workspace=${currentPath ?? "<none>"} identity=${currentIdentity ?? "<none>"}`);
          let servers = await listNativeMcpServers(mcpSyncServiceHandle, { workspacePath: currentPath }, identity);
          if (!identity) servers = await mergeWorkspaceNativeServers(mcpSyncServiceHandle, servers, currentPath);
          const state = get();
          if ((state.currentWorkspaceIdentity?.trim() || state.currentProjectPath) === currentKey) {
            set(withDerived({ nativeServers: servers }));
            return true;
          }
          return false;
        } catch (error) {
          if (isRemoteDisconnectedError(error)) logger.warn("[mcpStore] loadMcpFromUserDirectory failed", String(error));
          return false;
        } finally {
          inFlightLoad = null;
          inFlightLoadKey = null;
        }
      })();
      return await inFlightLoad;
    },
    ensureLoadedForWorkspace: async (workspacePath, syncService, workspaceIdentity) => {
      if (!get().isConfigLoaded) get().loadConfig();
      const path = workspacePath ?? "";
      const identity = workspaceIdentity?.trim() || undefined;
      if (path !== get().currentProjectPath || identity !== get().currentWorkspaceIdentity) {
        get().setCurrentProjectPath(path, identity, syncService ?? null);
      }
      return await get().loadMcpFromUserDirectory(syncService, identity);
    },
    saveConfig: () => {
      const { deletedPreloadMcpServers } = get();
      writeDeletedPreloadServers(MCP_DELETED_PRELOAD_KEY, Array.from(deletedPreloadMcpServers));
    },
    addMcpServer: (name, config) => get().addZCodeAgentMcpServer(name, config),
    updateMcpServer: (name, config) => get().updateZCodeAgentMcpServer(name, config),
    deleteMcpServer: (name) => get().deleteZCodeAgentMcpServer(name),
    addScopedMcpServer: async (source, name, config, projectPath) => {
      bumpGenerations();
      const normalized = source === "mcp" ? "zcodeagentmcp" : source;
      await persistChange(normalized, { action: "upsert", source: normalized, name, config, projectPath });
      upsertNativeServer(normalized, name, config, projectPath);
    },
    updateScopedMcpServer: async (source, name, config, projectPath) => {
      bumpGenerations();
      const normalized = source === "mcp" ? "zcodeagentmcp" : source;
      await persistChange(normalized, { action: "upsert", source: normalized, name, config, projectPath });
      upsertNativeServer(normalized, name, config, projectPath);
    },
    deleteScopedMcpServer: (source, name, projectPath) => {
      bumpGenerations();
      const normalized = source === "mcp" ? "zcodeagentmcp" : source;
      void persistChange(normalized, { action: "delete", source: normalized, name, projectPath });
      set(withDerived({ nativeServers: get().nativeServers.filter((server) => !(server.source === normalized && server.name === name && server.projectPath === projectPath)) }));
    },
    addClaudeCliMcpServer: (name, config, projectPath) => get().addScopedMcpServer("claudeclimcp", name, config, projectPath),
    updateClaudeCliMcpServer: (name, config, projectPath) => get().updateScopedMcpServer("claudeclimcp", name, config, projectPath),
    deleteClaudeCliMcpServer: (name, projectPath) => get().deleteScopedMcpServer("claudeclimcp", name, projectPath),
    addGeminiCliMcpServer: (name, config, projectPath) => get().addScopedMcpServer("geminiclimcp", name, config, projectPath),
    updateGeminiCliMcpServer: (name, config, projectPath) => get().updateScopedMcpServer("geminiclimcp", name, config, projectPath),
    deleteGeminiCliMcpServer: (name, projectPath) => get().deleteScopedMcpServer("geminiclimcp", name, projectPath),
    addCodexCliMcpServer: (name, config, projectPath) => get().addScopedMcpServer("codexclimcp", name, config, projectPath),
    updateCodexCliMcpServer: (name, config, projectPath) => get().updateScopedMcpServer("codexclimcp", name, config, projectPath),
    deleteCodexCliMcpServer: (name, projectPath) => get().deleteScopedMcpServer("codexclimcp", name, projectPath),
    addOpenCodeMcpServer: (name, config, projectPath) => get().addScopedMcpServer("opencodemcp", name, config, projectPath),
    updateOpenCodeMcpServer: (name, config, projectPath) => get().updateScopedMcpServer("opencodemcp", name, config, projectPath),
    deleteOpenCodeMcpServer: (name, projectPath) => get().deleteScopedMcpServer("opencodemcp", name, projectPath),
    addZCodeAgentMcpServer: (name, config, projectPath) => get().addScopedMcpServer("zcodeagentmcp", name, config, projectPath),
    updateZCodeAgentMcpServer: (name, config, projectPath) => get().updateScopedMcpServer("zcodeagentmcp", name, config, projectPath),
    deleteZCodeAgentMcpServer: (name, projectPath) => get().deleteScopedMcpServer("zcodeagentmcp", name, projectPath),
    toggleServer: async (serverId, enabled) => {
      bumpGenerations();
      const server = get().servers.find((item) => item.id === serverId);
      if (server && server.source !== "mcp") {
        await persistMcpChange(
          mcpSyncServiceHandle,
          { action: "set-enabled", source: server.source, name: server.name, enabled, projectPath: server.projectPath, location: server.location },
          persistenceIdentity(),
        ).catch((error) => {
          logger.warn("[mcpStore] persist MCP enabled override failed", String(error));
        });
      }
      set((state) => ({
        enabledStates: { ...state.enabledStates, [serverId]: enabled },
        servers: state.servers.map((item) => (item.id === serverId ? { ...item, enabled } : item)),
      }));
    },
    updateServerStatus: (serverId, status, error, options) => {
      if (options?.invalidateStatusListRequests !== false) bumpGenerations();
      set((state) => ({
        servers: state.servers.map((item) =>
          item.id === serverId
            ? {
                ...item,
                status,
                authorization: undefined,
                error,
                toolCount: status === "connected" ? item.toolCount : undefined,
                changed: status === "error" ? item.changed : false,
                lastConnected: status === "connected" ? new Date() : item.lastConnected,
              }
            : item,
        ),
      }));
    },
    beginServerStatusListRefresh: (kind = "connect") => {
      refreshGenerations[kind] += 1;
      const generation = refreshGenerations[kind];
      if (kind !== "status") {
        set((state) => ({
          servers: state.servers.map((server) => {
            const enabled = state.enabledStates[server.id] ?? server.enabled;
            return server.source !== "zcodeagentmcp" || !enabled || (!server.changed && server.status !== "unknown")
              ? server
              : { ...server, status: "connecting", authorization: undefined, error: undefined, toolCount: undefined };
          }),
        }));
      }
      return generation;
    },
    markServerStatusListRefreshFailed: (error, generation, kind = "connect") => {
      if (generation !== refreshGenerations[kind] || kind === "status") return;
      set((state) => ({
        statusSnapshots: {},
        servers: state.servers.map((server) => {
          const enabled = state.enabledStates[server.id] ?? server.enabled;
          return server.source !== "zcodeagentmcp" || !enabled || server.status !== "connecting"
            ? server
            : { ...server, status: "error", authorization: undefined, error, toolCount: undefined };
        }),
      }));
    },
    mergeServerStatusSnapshots: (snapshots, generation, kind = "connect") => {
      if (generation !== refreshGenerations[kind]) return;
      set((state) => {
        const merged = kind === "status" ? { ...state.statusSnapshots, ...snapshots } : snapshots;
        return { statusSnapshots: merged, servers: applyStatusSnapshots(state.servers, merged, { markMissingConnectingAsError: kind !== "status" }) };
      });
    },
    getServer: (serverId) => get().servers.find((server) => server.id === serverId),
    setCurrentProjectPath: (path, workspaceIdentity, sessionId) => {
      bumpGenerations();
      const { config, currentProjectPath, currentWorkspaceIdentity, deletedPreloadMcpServers, enabledStates, isConfigLoaded, nativeServers, servers } = get();
      const identity = workspaceIdentity?.trim() || undefined;
      const changed = path !== currentProjectPath || identity !== currentWorkspaceIdentity;
      const nextNative = changed ? [] : nativeServers;
      set({
        currentProjectPath: path,
        currentWorkspaceIdentity: identity,
        nativeServers: nextNative,
        statusSnapshots: {},
        servers: deriveMcpServers(config, nextNative, enabledStates, deletedPreloadMcpServers, changed ? [] : servers),
      });
      if (isConfigLoaded && changed) void get().loadMcpFromUserDirectory(sessionId, identity);
    },
    getEnabledMcpServersForZCode: () => {
      const { servers, enabledStates, currentProjectPath } = get();
      const byName = new Map<string, DerivedMcpServer>();
      for (const server of servers) {
        if (!(enabledStates[server.id] ?? server.enabled)) continue;
        if (server.source !== "zcodeagentmcp") continue;
        if (server.scope === "workspace" && server.projectPath !== currentProjectPath) continue;
        const known = byName.get(server.name);
        if (!known || mcpScopePriority(server) > mcpScopePriority(known)) byName.set(server.name, server);
      }
      const result: Array<{ name: string; config: McpServerConfig }> = [];
      for (const server of byName.values()) {
        const converted = toZCodeMcpServer(server.name, server.config);
        if (converted) result.push(converted);
      }
      return result;
    },
    checkAllServerStatus: async (probe) => {
      for (const server of get().servers) {
        if (!(get().enabledStates[server.id] ?? server.enabled)) continue;
        if (!server.changed && server.status !== "unknown") continue;
        get().updateServerStatus(server.id, "connecting");
        try {
          const result = await probe(server.config);
          get().updateServerStatus(server.id, result.success ? "connected" : "error", result.success ? undefined : (result.error ?? "Connection failed"));
        } catch (error) {
          get().updateServerStatus(server.id, "error", String(error));
        }
      }
    },
    mergePreloadedMcpServers: (servers) => {
      const { deletedPreloadMcpServers, nativeServers } = get();
      const source: McpSource = "zcodeagentmcp";
      const next = nativeServers.slice();
      let changed = false;
      for (const [name, config] of Object.entries(servers)) {
        const key = preloadServerKey(source, name);
        const already = next.some((server) => server.source === source && server.name === name && !server.projectPath);
        if (deletedPreloadMcpServers.has(key) || already) continue;
        next.push({ source, scope: "user", name, config, enabled: true });
        void persistChange(source, { action: "upsert", source, name, config });
        changed = true;
      }
      if (changed) set(withDerived({ nativeServers: next }));
    },
    deletePreloadedMcpServer: (source, name) => {
      const normalized = source === "mcp" ? "zcodeagentmcp" : source;
      const key = preloadServerKey(normalized, name);
      void persistChange(normalized, { action: "delete", source: normalized, name });
      set((state) => {
        const deleted = new Set(state.deletedPreloadMcpServers);
        deleted.add(key);
        writeDeletedPreloadServers(MCP_DELETED_PRELOAD_KEY, Array.from(deleted));
        const nativeServers = state.nativeServers.filter((server) => !(server.source === normalized && server.name === name && !server.projectPath));
        return {
          deletedPreloadMcpServers: deleted,
          nativeServers,
          servers: deriveMcpServers(state.config, nativeServers, state.enabledStates, deleted, state.servers),
        };
      });
    },
    setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
    migrateLegacyCommonMcp: async () => {
      const legacy = await readLegacyCommonMcp(mcpSyncServiceHandle);
      const workspacePath = get().currentProjectPath || undefined;
      const nativeServers = get().nativeServers.length > 0 ? get().nativeServers : await listNativeMcpServers(mcpSyncServiceHandle, { workspacePath });
      const result = await migrateLegacyCommonMcpServers(mcpSyncServiceHandle, legacy.servers ?? {}, nativeServers, legacy.sourcePath);
      if (result.changed) set(withDerived({ nativeServers: await listNativeMcpServers(mcpSyncServiceHandle, { workspacePath }) }));
      return result;
    },
  };
});

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
  setEnabled(args: { workspacePath: string; workspaceIdentity?: string; provider: string; scope: string; skillId: string; enabled: boolean }): Promise<void>;
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

/** 原 HB：上下文装载器（初始化/强制刷新两用；接口级，本体在 63400 区） */
declare function loadSkillContext(
  args: { workspacePath: string; provider: string; skillsService: SkillsService; workspaceIdentity?: string | null; bypassCache: boolean },
  set: SetState<SkillContextState>,
  get: GetState<SkillContextState>,
): Promise<void>;

function patchSkillContextEntry(state: SkillContextState, key: string, entry: SkillContextEntry): Partial<SkillContextState> {
  return { contexts: { ...state.contexts, [key]: entry } };
}

export const useSkillContextStore: UseBoundStore<SkillContextState> = createStore<SkillContextState>((set, get) => ({
  contexts: {},
  async initialize(workspacePath, provider, skillsService, workspaceIdentity) {
    const key = skillContextKey(workspacePath, provider, workspaceIdentity);
    if (get().contexts[key]) return;
    await loadSkillContext({ workspacePath, provider, skillsService, workspaceIdentity, bypassCache: false }, set, get);
  },
  async refresh(workspacePath, provider, skillsService, workspaceIdentity) {
    await loadSkillContext({ workspacePath, provider, skillsService, workspaceIdentity, bypassCache: true }, set, get);
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

/* ============================================================================
 * 3. CodeCommentsStore（原 FH，js 68514–68579 / jsx 60720）
 * ----------------------------------------------------------------------------
 * 行级代码评论：按 `工作区键\0源路径` 桶存放。
 * state 字段表：commentsByBucketKey: Record<bucketKey, CodeComment[]>（1 个）
 * actions：getComments/addComment/removeComment/removeCommentBySource/
 *   restoreCommentFromAttachment/clearSource（6 个）
 * 消费：161208–161210（代码查看器 tHt 域）。
 * ==========================================================================*/

export interface CodeComment {
  id: string;
  sourcePath: string;
  sourceTitle?: string;
  startLine: number;
  endLine: number;
  selectedText?: string;
  comment: string;
}

export interface CodeCommentsState {
  commentsByBucketKey: Record<string, CodeComment[]>;
  getComments(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): CodeComment[];
  addComment(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; comment: CodeComment }): void;
  removeComment(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; id: string }): void;
  removeCommentBySource(target: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void;
  restoreCommentFromAttachment(attachment: {
    id: string;
    workspacePath: string;
    workspaceIdentity?: string | null;
    sourcePath?: string;
    sourceTitle?: string;
    startLine: number;
    endLine: number;
    selectedText?: string;
    comment: string;
  }): void;
  clearSource(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): void;
}

const EMPTY_COMMENTS: CodeComment[] = []; // 原 AXe

/** 原 kH：工作区键（identity 优先；68500 区） */
declare function commentsWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string;

/** 原 PH：评论桶键 = `工作区键\0源路径` */
function commentBucketKey(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): string {
  return `${commentsWorkspaceKey(target.workspacePath, target.workspaceIdentity)}\u0000${target.sourcePath}`;
}

/** 原 vXe：附件恢复登记（会话引用侧效果；接口级） */
declare function markCommentRestoredFromAttachment(target: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void;

export const useCodeCommentsStore: UseBoundStore<CodeCommentsState> = createStore<CodeCommentsState>((set, get) => ({
  commentsByBucketKey: {},
  getComments: (target) => get().commentsByBucketKey[commentBucketKey(target)] ?? EMPTY_COMMENTS,
  addComment: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      return {
        commentsByBucketKey: {
          ...state.commentsByBucketKey,
          [bucketKey]: [...existing.filter((comment) => comment.id !== target.comment.id), target.comment],
        },
      };
    });
  },
  removeComment: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      const next = existing.filter((comment) => comment.id !== target.id);
      return next.length === existing.length ? state : { commentsByBucketKey: { ...state.commentsByBucketKey, [bucketKey]: next } };
    });
  },
  removeCommentBySource: (target) => {
    const prefix = commentsWorkspaceKey(target.workspacePath, target.workspaceIdentity);
    set((state) => {
      let changed = false;
      const next = Object.fromEntries(
        Object.entries(state.commentsByBucketKey).map(([bucketKey, comments]) => {
          if (!bucketKey.startsWith(`${prefix}\u0000`)) return [bucketKey, comments];
          const filtered = comments.filter((comment) => comment.id !== target.id);
          changed ||= filtered.length !== comments.length;
          return [bucketKey, filtered];
        }),
      );
      return changed ? { commentsByBucketKey: next } : state;
    });
  },
  restoreCommentFromAttachment: (attachment) => {
    if (!attachment.sourcePath) return;
    markCommentRestoredFromAttachment({ id: attachment.id, workspacePath: attachment.workspacePath, workspaceIdentity: attachment.workspaceIdentity });
    get().addComment({
      workspacePath: attachment.workspacePath,
      workspaceIdentity: attachment.workspaceIdentity,
      sourcePath: attachment.sourcePath,
      comment: {
        id: attachment.id,
        sourcePath: attachment.sourcePath,
        sourceTitle: attachment.sourceTitle,
        startLine: attachment.startLine,
        endLine: attachment.endLine,
        selectedText: attachment.selectedText,
        comment: attachment.comment,
      },
    });
  },
  clearSource: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      if (!state.commentsByBucketKey[bucketKey]) return state;
      const { [bucketKey]: _removed, ...rest } = state.commentsByBucketKey;
      return { commentsByBucketKey: rest };
    });
  },
}));

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

/* ============================================================================
 * 5. PluginsStore（原 B6，js 142985–143135 / jsx 119004）
 * ----------------------------------------------------------------------------
 * 插件与市场：列表/概览双源刷新 + 市场增删改 + 插件安装/卸载/更新/恢复/配置/启停。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | workspacePath / workspaceIdentity | string\|null | 当前工作区 |
 *  | plugins | PluginDescriptor[] | 已安装插件 |
 *  | marketplaces | PluginMarketplace[] | 市场列表 |
 *  | marketplaceAvailabilityKnown | boolean | 市场可用性是否已知 |
 *  | availablePlugins / installedPlugins / restorableBuiltins | 数组 | 概览三表 |
 *  | diagnostics | PluginDiagnostic[] | 诊断（list+概览合并） |
 *  | loading / error | boolean / string\|null | 加载态 |
 *  | togglingPluginId | string \| null | 启停锁 |
 *  | operationId | string \| null | 当前操作 id（`marketplace:add:*` 等） |
 *  | describeCache | Record<pluginId, {status, data?, error?}> | 插件详情缓存 |
 * actions（13）：initialize/refresh/addMarketplace/updateMarketplace/removeMarketplace/
 *   installPlugin/uninstallPlugin/updatePlugin/restoreBuiltin/configurePlugin/
 *   validateSource/setEnabled/describePlugin
 * ==========================================================================*/

export interface PluginDescriptor { id: string; name: string; enabled?: boolean; [key: string]: unknown }
export interface PluginMarketplace { name?: string; [key: string]: unknown }
export interface PluginDiagnostic { severity: "error" | "warning" | string; message: string; [key: string]: unknown }

export interface PluginService {
  listPlugins(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{ plugins: PluginDescriptor[]; diagnostics: PluginDiagnostic[] }>;
  getPluginsOverview(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    marketplaces: PluginMarketplace[];
    availablePlugins: unknown[];
    installedPlugins: unknown[];
    restorableBuiltins: unknown[];
    diagnostics: PluginDiagnostic[];
  }>;
  addPluginMarketplace(args: { source: string; workspacePath: string; workspaceIdentity?: string; [key: string]: unknown }): Promise<void>;
  updatePluginMarketplace(args: { marketplace?: string; workspacePath: string; workspaceIdentity?: string; [key: string]: unknown }): Promise<{ diagnostics?: PluginDiagnostic[] }>;
  removePluginMarketplace(args: { marketplace: string; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  installPlugin(args: { pluginName: string; marketplace: string; workspacePath: string; workspaceIdentity?: string }): Promise<{ diagnostics: PluginDiagnostic[] }>;
  uninstallPlugin(args: { pluginId: string; removeCache: boolean; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  updatePlugin(args: { pluginId: string; workspacePath: string; workspaceIdentity?: string }): Promise<{ diagnostics: PluginDiagnostic[] }>;
  restoreBuiltinPlugin(args: { pluginId: string; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  configurePlugin(args: { pluginId: string; options: unknown; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  validatePlugin(args: { source: string; workspacePath: string; workspaceIdentity?: string }): Promise<{ diagnostics: PluginDiagnostic[] }>;
  setPluginEnabled(args: { pluginId: string; enabled: boolean; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  describePlugin(args: { marketplace: string; pluginName: string; workspacePath: string; workspaceIdentity?: string }): Promise<{ components: unknown[]; diagnostics?: PluginDiagnostic[] }>;
}

export interface PluginsState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  plugins: PluginDescriptor[];
  marketplaces: PluginMarketplace[];
  marketplaceAvailabilityKnown: boolean;
  availablePlugins: unknown[];
  installedPlugins: unknown[];
  restorableBuiltins: unknown[];
  diagnostics: PluginDiagnostic[];
  loading: boolean;
  error: string | null;
  togglingPluginId: string | null;
  operationId: string | null;
  describeCache: Record<string, { status: "loading" | "loaded" | "error"; data?: unknown; error?: string }>;
  initialize(args: { workspacePath: string; workspaceIdentity?: string | null; pluginService: PluginService }): Promise<void>;
  refresh(service: PluginService): Promise<void>;
  addMarketplace(source: string, service: PluginService): Promise<boolean>;
  updateMarketplace(marketplace: string | null, service: PluginService): Promise<boolean>;
  removeMarketplace(marketplace: string, service: PluginService): Promise<boolean>;
  installPlugin(pluginName: string, marketplace: string, service: PluginService): Promise<boolean>;
  uninstallPlugin(pluginId: string, service: PluginService, removeCache?: boolean): Promise<boolean>;
  updatePlugin(pluginId: string, service: PluginService): Promise<boolean>;
  restoreBuiltin(pluginId: string, service: PluginService): Promise<boolean>;
  configurePlugin(pluginId: string, options: unknown, service: PluginService): Promise<boolean>;
  validateSource(source: string, service: PluginService): Promise<void>;
  setEnabled(pluginId: string, enabled: boolean, service: PluginService): Promise<void>;
  describePlugin(pluginId: string, pluginName: string, marketplace: string, service: PluginService, force?: boolean): Promise<void>;
}

const pluginsInFlight = new Map<string, Promise<void>>(); // 原 I6

function pluginsErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function pluginsWorkspaceKey(workspacePath: string | null, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath || "";
}

/** 原 vFt：诊断含 error 级即抛错 */
function throwOnPluginDiagnosticError(diagnostics: PluginDiagnostic[]): void {
  const error = diagnostics.find((diagnostic) => diagnostic.severity === "error");
  if (error) throw new Error(error.message);
}

export const usePluginsStore: UseBoundStore<PluginsState> = createStore<PluginsState>((set, get) => {
  /** 原 L6：带 operationId 的通用操作包装 */
  async function runPluginOperation(service: PluginService, operationId: string, operation: (args: { workspacePath: string; workspaceIdentity?: string }) => Promise<void>): Promise<boolean> {
    const { workspacePath, workspaceIdentity } = get();
    if (!workspacePath) return false;
    set({ operationId, error: null });
    try {
      await operation({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
      await refreshPluginList(set, get, { workspacePath, workspaceIdentity, pluginService: service });
      return true;
    } catch (error) {
      logger.error("[plugins] operation failed", { operationId, error: pluginsErrorMessage(error) });
      set({ error: pluginsErrorMessage(error) });
      return false;
    } finally {
      set({ operationId: null });
    }
  }

  return {
    workspacePath: null,
    workspaceIdentity: null,
    plugins: [],
    marketplaces: [],
    marketplaceAvailabilityKnown: false,
    availablePlugins: [],
    installedPlugins: [],
    restorableBuiltins: [],
    diagnostics: [],
    loading: false,
    error: null,
    togglingPluginId: null,
    operationId: null,
    describeCache: {},
    async initialize({ workspacePath, workspaceIdentity, pluginService }) {
      const identity = workspaceIdentity?.trim() || null;
      const state = get();
      const warm = state.plugins.length > 0 && state.workspacePath === workspacePath && state.workspaceIdentity === identity;
      set({
        workspacePath,
        workspaceIdentity: identity,
        loading: !warm,
        marketplaceAvailabilityKnown: warm ? state.marketplaceAvailabilityKnown : false,
        error: null,
      });
      await refreshPluginList(set, get, { workspacePath, workspaceIdentity: identity, pluginService });
    },
    async refresh(service) {
      const { workspacePath, workspaceIdentity } = get();
      if (!workspacePath) return;
      set({ error: null });
      await refreshPluginList(set, get, { workspacePath, workspaceIdentity, pluginService: service });
    },
    async addMarketplace(source, service) {
      return runPluginOperation(service, `marketplace:add:${source}`, async (args) => {
        await service.addPluginMarketplace({ ...args, source });
      });
    },
    async updateMarketplace(marketplace, service) {
      let partialError: string | null = null;
      const ok = await runPluginOperation(service, `marketplace:update:${marketplace ?? "__all__"}`, async (args) => {
        const result = await service.updatePluginMarketplace({ ...args, ...(marketplace ? { marketplace } : {}) });
        const errorDiagnostic = result.diagnostics?.find((diagnostic) => diagnostic.severity === "error");
        if (errorDiagnostic) {
          partialError = errorDiagnostic.message;
          logger.warn("[plugins] marketplace refresh partially failed", { diagnostics: result.diagnostics });
        }
      });
      if (ok && partialError) {
        set({ error: partialError });
        return false;
      }
      return ok;
    },
    async removeMarketplace(marketplace, service) {
      return runPluginOperation(service, `marketplace:remove:${marketplace}`, async (args) => {
        await service.removePluginMarketplace({ ...args, marketplace });
      });
    },
    async installPlugin(pluginName, marketplace, service) {
      return runPluginOperation(service, `plugin:install:${pluginName}@${marketplace}`, async (args) => {
        throwOnPluginDiagnosticError((await service.installPlugin({ ...args, pluginName, marketplace })).diagnostics);
      });
    },
    async uninstallPlugin(pluginId, service, removeCache = true) {
      return runPluginOperation(service, `plugin:uninstall:${pluginId}`, async (args) => {
        await service.uninstallPlugin({ ...args, pluginId, removeCache });
      });
    },
    async updatePlugin(pluginId, service) {
      return runPluginOperation(service, `plugin:update:${pluginId}`, async (args) => {
        throwOnPluginDiagnosticError((await service.updatePlugin({ ...args, pluginId })).diagnostics);
      });
    },
    async restoreBuiltin(pluginId, service) {
      return runPluginOperation(service, `plugin:restore:${pluginId}`, async (args) => {
        await service.restoreBuiltinPlugin({ ...args, pluginId });
      });
    },
    async configurePlugin(pluginId, options, service) {
      return runPluginOperation(service, `plugin:configure:${pluginId}`, async (args) => {
        await service.configurePlugin({ ...args, pluginId, options });
      });
    },
    async validateSource(source, service) {
      const { workspacePath, workspaceIdentity } = get();
      if (!workspacePath) return;
      set({ operationId: `marketplace:validate:${source}`, error: null });
      try {
        set({
          diagnostics: (await service.validatePlugin({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), source })).diagnostics,
        });
      } catch (error) {
        logger.error("[plugins] validate source failed", { source, error: pluginsErrorMessage(error) });
        set({ error: pluginsErrorMessage(error) });
      } finally {
        set({ operationId: null });
      }
    },
    async setEnabled(pluginId, enabled, service) {
      const { workspacePath, workspaceIdentity } = get();
      if (!workspacePath) return;
      set({ togglingPluginId: pluginId, error: null });
      try {
        await service.setPluginEnabled({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), pluginId, enabled });
        await refreshPluginList(set, get, { workspacePath, workspaceIdentity, pluginService: service });
      } catch (error) {
        logger.error("[plugins] setEnabled failed", { pluginId, enabled, error: pluginsErrorMessage(error) });
        set({ error: pluginsErrorMessage(error) });
      } finally {
        set({ togglingPluginId: null });
      }
    },
    async describePlugin(pluginId, pluginName, marketplace, service, force = false) {
      const { workspacePath, workspaceIdentity, describeCache } = get();
      if (!workspacePath) return;
      const cached = describeCache[pluginId];
      if (!force && cached && cached.status !== "error") return;
      set({ describeCache: { ...get().describeCache, [pluginId]: { status: "loading" } } });
      try {
        const result = await service.describePlugin({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), marketplace, pluginName });
        const errorDiagnostic = result.diagnostics?.find((diagnostic) => diagnostic.severity === "error");
        if (result.components.length === 0 && errorDiagnostic) {
          set({ describeCache: { ...get().describeCache, [pluginId]: { status: "error", error: errorDiagnostic.message } } });
          return;
        }
        set({ describeCache: { ...get().describeCache, [pluginId]: { status: "loaded", data: result } } });
      } catch (error) {
        logger.error("[plugins] describe failed", { pluginId, marketplace, error: pluginsErrorMessage(error) });
        set({ describeCache: { ...get().describeCache, [pluginId]: { status: "error", error: pluginsErrorMessage(error) } } });
      }
    },
  };
});

/** 原 R6/_Ft：列表+概览双源刷新（按工作区键并入 in-flight） */
async function refreshPluginList(
  set: SetState<PluginsState>,
  get: GetState<PluginsState>,
  args: { workspacePath: string; workspaceIdentity: string | null; pluginService: PluginService },
): Promise<void> {
  const key = pluginsWorkspaceKey(args.workspacePath, args.workspaceIdentity);
  const existing = pluginsInFlight.get(key);
  if (existing) {
    logger.debug("[plugins] join in-flight list", { workspaceKey: key });
    await existing;
    return;
  }
  const load = fetchPluginsOverviewAndList(set, get, { ...args, workspaceKey: key });
  pluginsInFlight.set(key, load);
  try {
    await load;
  } finally {
    if (pluginsInFlight.get(key) === load) pluginsInFlight.delete(key);
  }
}

async function fetchPluginsOverviewAndList(
  set: SetState<PluginsState>,
  get: GetState<PluginsState>,
  args: { workspacePath: string; workspaceIdentity: string | null; pluginService: PluginService; workspaceKey: string },
): Promise<void> {
  const apply = (patch: Partial<PluginsState>) => {
    const state = get();
    if (state.workspacePath !== args.workspacePath || state.workspaceIdentity !== args.workspaceIdentity) return;
    set(patch);
  };
  try {
    const [list, overview] = await Promise.all([
      args.pluginService.listPlugins({ workspacePath: args.workspacePath, ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}) }),
      args.pluginService.getPluginsOverview({ workspacePath: args.workspacePath, ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}) }),
    ]);
    const diagnostics = [...list.diagnostics, ...overview.diagnostics];
    apply({
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
    logger.error("[plugins] overview/list failed", { workspacePath: args.workspacePath, workspaceKey: args.workspaceKey, error: error instanceof Error ? error.message : String(error) });
    try {
      const list = await args.pluginService.listPlugins({ workspacePath: args.workspacePath, ...(args.workspaceIdentity ? { workspaceIdentity: args.workspaceIdentity } : {}) });
      apply({
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
      apply({ loading: false, marketplaceAvailabilityKnown: false, error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) });
    }
  }
}

/* ============================================================================
 * 6. HooksStore（原 Z0t，js 201244–201421 / jsx 160815）
 * ----------------------------------------------------------------------------
 * 钩子（事件驱动脚本）：事件/匹配器/命令/参数/超时/异步/壳/状态消息。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | workspacePath / workspaceIdentity | string\|null | 当前工作区 |
 *  | loadedWorkspaceKey | string \| null | 已加载数据的工作区键 |
 *  | hooks | HookDescriptor[] | 钩子列表 |
 *  | loading / error | boolean / string\|null | 加载态 |
 *  | operatingHookId | string \| null | 操作锁 |
 * actions：initialize/refresh/addHook/updateHook/deleteHook/toggleHook/importHook（7 个）
 * 乐观更新：先改内存再落盘，失败回滚（原 v9 saveHooks 助手）。
 * 事件枚举（原 $0t）：SessionStart/UserPromptSubmit/PreToolUse/PermissionRequest/
 *   PostToolUse/PostToolUseFailure/Stop
 * ==========================================================================*/

export const HOOK_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PermissionRequest",
  "PostToolUse",
  "PostToolUseFailure",
  "Stop",
] as const;

export interface HookDescriptor {
  id: string;
  event: (typeof HOOK_EVENTS)[number] | string;
  type?: "process" | string;
  matcher?: string;
  command?: string;
  args?: string[];
  async?: boolean;
  shell?: string;
  statusMessage?: string;
  timeout?: number;
  custom?: Record<string, unknown>;
  enabled: boolean;
  editable?: boolean;
  location?: { source: "zcode" | "claude" | string; scope: "user" | "project" | string };
  [key: string]: unknown;
}

export interface HooksService {
  loadHooks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{ hooks: HookDescriptor[] }>;
  saveHooks?(args: { workspacePath: string; workspaceIdentity?: string; hooks: HookDescriptor[] }): Promise<void>;
  [method: string]: unknown;
}

export interface HooksState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspaceKey: string | null;
  hooks: HookDescriptor[];
  loading: boolean;
  error: string | null;
  operatingHookId: string | null;
  initialize(workspacePath: string | null, workspaceIdentity: string | null, service: HooksService): Promise<void>;
  refresh(service: HooksService): Promise<void>;
  addHook(draft: Partial<HookDescriptor>, service: HooksService): Promise<void>;
  updateHook(hookId: string, patch: Partial<HookDescriptor>, service: HooksService): Promise<void>;
  deleteHook(hookId: string, service: HooksService): Promise<void>;
  toggleHook(hookId: string, enabled: boolean, service: HooksService): Promise<void>;
  importHook(hookId: string, service: HooksService): Promise<void>;
}

const hooksInFlight = new Map<string, Promise<void>>(); // 原 g9

/** 原 K0t：钩子工作区键 */
declare function hooksWorkspaceKey(workspacePath: string, workspaceIdentity: string | null): string;
/** 原 J0t：由草稿构造新钩子（生成 id，落位工作区） */
declare function buildNewHook(draft: Partial<HookDescriptor>, workspacePath: string): HookDescriptor;
/** 原 Y0t：合并钩子补丁 */
declare function mergeHookPatch(hook: HookDescriptor, patch: Partial<HookDescriptor>): HookDescriptor;
/** 原 _9：钩子是否可编辑 */
declare function isHookEditable(hook: HookDescriptor): boolean;
/** 原 q0t：按作用域生成位置描述 */
declare function hookLocationForScope(workspacePath: string, scope: string): HookDescriptor["location"];
/** 原 v9：落盘（失败抛出，供回滚） */
declare function saveHooksList(hooks: HookDescriptor[], get: GetState<HooksState>, set: SetState<HooksState>, service: HooksService): Promise<void>;
/** 原 X0t：重载钩子列表 */
declare function reloadHooks(get: GetState<HooksState>, set: SetState<HooksState>, service: HooksService): Promise<void>;

export const useHooksStore: UseBoundStore<HooksState> = createStore<HooksState>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspaceKey: null,
  hooks: [],
  loading: false,
  error: null,
  operatingHookId: null,
  initialize: async (workspacePath, workspaceIdentity, service) => {
    const identity = workspaceIdentity?.trim() || null;
    set({ workspacePath: workspacePath ?? null, workspaceIdentity: identity });
    if (!workspacePath) {
      set({ hooks: [], loading: false, loadedWorkspaceKey: null });
      return;
    }
    const key = hooksWorkspaceKey(workspacePath, identity);
    const existing = hooksInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const load = (async () => {
      set({ loading: true, error: null });
      try {
        set({
          hooks: (await service.loadHooks({ workspacePath, ...(identity ? { workspaceIdentity: identity } : {}) })).hooks,
          loadedWorkspaceKey: key,
          loading: false,
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error), loading: false });
      } finally {
        hooksInFlight.delete(key);
      }
    })();
    hooksInFlight.set(key, load);
    await load;
  },
  refresh: async (service) => {
    set({ loading: true, error: null });
    try {
      await reloadHooks(get, set, service);
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },
  addHook: async (draft, service) => {
    const { workspacePath, hooks } = get();
    if (!workspacePath) throw new Error("No workspace path set");
    const next = [...hooks, buildNewHook(draft, workspacePath)];
    set({ hooks: next, error: null });
    try {
      await saveHooksList(next, get, set, service);
    } catch (error) {
      set({ hooks, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  updateHook: async (hookId, patch, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.map((hook) => (hook.id === hookId ? mergeHookPatch(hook, patch) : hook));
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  deleteHook: async (hookId, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.filter((hook) => hook.id !== hookId);
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  toggleHook: async (hookId, enabled, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.map((hook) => (hook.id === hookId ? { ...hook, enabled } : hook));
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  importHook: async (hookId, service) => {
    const { hooks, workspacePath } = get();
    if (!workspacePath) throw new Error("No workspace path set");
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || target.location?.source === "zcode") throw new Error("Hook is not importable");
    const imported: HookDescriptor = {
      ...target,
      id: `hook-${crypto.randomUUID()}`,
      enabled: true,
      location: hookLocationForScope(workspacePath, target.location?.scope ?? "user"),
    };
    const next = [...hooks, imported];
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
}));
