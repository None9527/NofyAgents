// A0-S4-3: 自 modules/stores-workspace.tsx §1 原样迁入（Ug McpStore + MCP declare 块；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { isRemoteDisconnectedError } from '../modules/services';
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

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
  type?: string; // A0-CLEANUP3 3b：对齐 SettingsPanels.McpServer.config 消费面
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  oauth?: unknown;
  [key: string]: unknown;
}

export interface NativeMcpServer {
  source: McpSource;
  scope: McpScope;
  name: string;
  config: McpServerConfig;
  enabled: boolean;
  projectPath?: string | null; // A0-CLEANUP3 3b：upsert 以 null 兜底传入（用户级服务器）
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
  authorization?: { authorizationUrl?: string } | null; // A0-CLEANUP3 3b：派生逻辑仅置 undefined（405/424/438），按消费面具型
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
  addScopedMcpServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string | null): Promise<void>; // A0-CLEANUP3 3b：Settings 以 null 兜底传入
  updateScopedMcpServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string | null): Promise<void>;
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
  function upsertNativeServer(source: McpSource, name: string, config: McpServerConfig, projectPath?: string | null) { // A0-CLEANUP3 3b：上游以 null 兜底传入
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

