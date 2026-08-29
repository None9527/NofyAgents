// A0-S4-3: 自 modules/stores-workspace.tsx §5 原样迁入（B6 PluginsStore + 局部 pluginsInFlight/pluginsWorkspaceKey 副本；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { SetState, GetState, UseBoundStore } from './storeTypes';

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

export interface PluginDescriptor { id: string; name: string; enabled: boolean; version?: string; description?: string; [key: string]: unknown } // A0-CLEANUP3 3b：按消费面（PluginManageList props）补足 version/description，enabled 运行期恒有值
export interface PluginMarketplace { id: string; name?: string; pluginCount?: number; lastUpdated?: number | null; featured?: string[]; refreshFailure?: { failedAt: number; message: string }; [key: string]: unknown } // A0-CLEANUP3 3b：按消费面（SPC/SL 市场族）补足字段
export interface PluginDiagnostic { severity: "error" | "warning" | string; message: string; [key: string]: unknown }

export interface PluginService {
  listPlugins(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{ plugins: PluginDescriptor[]; diagnostics: PluginDiagnostic[] }>;
  getPluginsOverview(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{
    marketplaces: PluginMarketplace[];
    availablePlugins: Array<{ id: string; name: string; marketplace?: string; installed?: boolean; [key: string]: unknown }>;
    installedPlugins: Array<{ id: string; scope?: string; updateStatus?: string; [key: string]: unknown }>;
    restorableBuiltins: Array<{ id: string; name: string; marketplace?: string; [key: string]: unknown }>;
    diagnostics: PluginDiagnostic[];
  }>; // A0-CLEANUP3 3b：返回面与 PluginsState 对齐
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
  availablePlugins: Array<{ id: string; name: string; marketplace?: string; installed?: boolean; [key: string]: unknown }>; // A0-CLEANUP3 3b：按消费面（SL buildStoreItems）具型
  installedPlugins: Array<{ id: string; scope?: string; updateStatus?: string; [key: string]: unknown }>;
  restorableBuiltins: Array<{ id: string; name: string; marketplace?: string; [key: string]: unknown }>;
  diagnostics: PluginDiagnostic[];
  loading: boolean;
  error: string | null;
  togglingPluginId: string | null;
  operationId: string | null;
  describeCache: Record<string, { status: "loading" | "loaded" | "error"; data?: Record<string, unknown>; error?: string }>; // A0-CLEANUP3 3b：data 收敛为对象面（SL PluginDescribeEntry.data 兼容）
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

