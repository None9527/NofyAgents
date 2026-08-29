// A0-S4-3: 自 modules/stores-tasks.tsx §2 原样迁入（T3 AutomationsStore；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { automationErrorMessage, findAutomation, isAutomationLimitError, isSameAutomationWorkspace, loadAutomationsIntoStore } from './automationsHelpers';
import type { Automation } from './automationsHelpers';
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 2. AutomationsStore（原 T3，js 134111–134388 / jsx 112916）
 * ----------------------------------------------------------------------------
 * 定时自动化：列表/创建（上限 20）/更新/删除/启停/重启/立即运行/运行历史缓存。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | workspacePath / workspaceIdentity | string\|null | 当前工作区 |
 *  | automations | Automation[] | 自动化列表 |
 *  | loading | boolean | 加载中 |
 *  | error | string \| null | 最近错误 |
 *  | operationId | string \| null | 操作锁（automation:create:* / update:<id> …） |
 *  | runsCache | Record<automationId, {status, runs?, error?}> | 运行历史缓存 |
 * actions（10）：initialize/refresh/createAutomation/updateAutomation/deleteAutomation/
 *   setEnabled/restartAutomation/runAutomationNow/loadRuns/deleteRun
 * ==========================================================================*/

/* Automation 已收敛至 StoresDeep 规范型（文件头 import + re-export；
   本地原有 lifecycleStatus 必填收窄与索引签名由规范型覆盖） */

export interface AutomationRun {
  runId: string; // A0-CLEANUP3 3b §C：按消费面（SL.AutomationRunRecord/运行历史表）补足；运行期恒有值
  trigger: string;
  sessionId?: string | null;
  scheduledAt?: number;
  createdAt: number;
  updatedAt?: number;
  outcome?: string;
  dispatchStatus?: string;
  error?: string;
  workspacePath?: string;
  [key: string]: unknown;
}

export interface AutomationsAgentService {
  /* A0-CLEANUP3 3b：宿主 agent 服务会话面（SettingsLeaves.AgentService 消费：思考项预览等） */
  createSession(args: unknown): Promise<any>;
  closeSession(args: unknown): Promise<any>;
  listAllAutomations(): Promise<Automation[]>;
  listAutomations?(args: { workspacePath: string; workspaceIdentity?: string }): Promise<Automation[]>;
  createAutomation(args: { workspacePath: string; workspaceIdentity?: string; title: string; [key: string]: unknown }): Promise<Automation>;
  updateAutomation(args: { workspacePath: string; workspaceIdentity?: string; automationId: string; [key: string]: unknown }): Promise<void>;
  deleteAutomation(args: { workspacePath: string; workspaceIdentity?: string; automationId: string }): Promise<void>;
  setAutomationEnabled(args: { workspacePath: string; workspaceIdentity?: string; automationId: string; enabled: boolean }): Promise<void>;
  restartAutomation(args: { workspacePath: string; workspaceIdentity?: string; automationId: string }): Promise<void>;
  runAutomationNow(args: { workspacePath: string; workspaceIdentity?: string; automationId: string }): Promise<{ status: "queued" | "duplicate" | string }>;
  listAutomationRuns(args: { workspacePath: string; workspaceIdentity?: string; automationId: string }): Promise<AutomationRun[]>;
  deleteAutomationRun(args: { workspacePath: string; workspaceIdentity?: string; runId: string }): Promise<void>;
  /* A0-CLEANUP3 3b：模型轨迹面（ExtendedViews.ZCodeAgentService 消费） */
  getModelTrajectory(args: unknown): Promise<any>;
  /* A0-CLEANUP3 3b：同一宿主服务兼插件同步面（Modals.ZCodeAgentService 消费面；bundle 真值） */
  getPluginsOverview(args: Record<string, unknown>): Promise<any>;
  listPlugins(args: Record<string, unknown>): Promise<any>;
  installPlugin(args: Record<string, unknown>): Promise<any>;
  setPluginEnabled(args: Record<string, unknown>): Promise<any>;
  configurePlugin(args: Record<string, unknown>): Promise<any>;
  addPluginMarketplace(args: Record<string, unknown>): Promise<any>;
  cancelPluginOperation?(args: { operationId: string }): Promise<void>;
  [method: string]: unknown;
}

export interface AutomationsState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  automations: Automation[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  runsCache: Record<string, { status: "loading" | "loaded" | "error"; runs?: AutomationRun[]; error?: string }>;
  initialize(args: { workspacePath: string; workspaceIdentity?: string | null; agentService: AutomationsAgentService }): Promise<void>;
  refresh(service: AutomationsAgentService): Promise<void>;
  createAutomation(draft: { title: string; [key: string]: unknown }, service: AutomationsAgentService): Promise<Automation | null>;
  updateAutomation(automationId: string, patch: Record<string, unknown>, service: AutomationsAgentService): Promise<boolean>;
  deleteAutomation(automationId: string, service: AutomationsAgentService): Promise<void>;
  setEnabled(automationId: string, enabled: boolean, service: AutomationsAgentService): Promise<void>;
  restartAutomation(automationId: string, service: AutomationsAgentService): Promise<void>;
  runAutomationNow(automationId: string, service: AutomationsAgentService): Promise<"queued" | "duplicate" | "failed">;
  loadRuns(automationId: string, service: AutomationsAgentService, force?: boolean): Promise<void>;
  deleteRun(automationId: string, runId: string, service: AutomationsAgentService): Promise<void>;
}

/* --- 外部助手（原 134000 区，接口级） --- */

const AUTOMATION_LIMIT = 20;
const AUTOMATION_STORE_NAME = "automations"; // 原 qe（日志前缀用）
let automationLoadSeq = 0; // 原 b3
const runNowInFlight = new Set<string>(); // 原 x3


export const useAutomationsStore: UseBoundStore<AutomationsState> = createStore<AutomationsState>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  automations: [],
  loading: false,
  error: null,
  operationId: null,
  runsCache: {},
  async initialize({ workspacePath, workspaceIdentity, agentService }) {
    const identity = workspaceIdentity?.trim() || null;
    const requestId = ++automationLoadSeq;
    const state = get();
    const warm = state.automations.length > 0 && state.workspacePath === workspacePath && state.workspaceIdentity === identity;
    set({
      workspacePath,
      workspaceIdentity: identity,
      loading: !warm,
      error: null,
      operationId: null,
      automations: warm ? state.automations : [],
      ...(warm ? {} : { runsCache: {} }),
    });
    await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: identity, agentService, requestId });
  },
  async refresh(service) {
    const { workspacePath, workspaceIdentity } = get();
    if (!workspacePath) return;
    const requestId = ++automationLoadSeq;
    set({ error: null });
    await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity, agentService: service, requestId });
  },
  async createAutomation(draft, service) {
    const { automations, workspacePath, workspaceIdentity } = get();
    if (!workspacePath) return null;
    if (automations.length >= AUTOMATION_LIMIT) {
      set({ error: `[${AUTOMATION_STORE_NAME}] automation limit reached` });
      return null;
    }
    set({ operationId: `automation:create:${draft.title}`, error: null });
    try {
      const created = await service.createAutomation({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), ...draft });
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
      return created;
    } catch (error) {
      const message = automationErrorMessage(error);
      if (isAutomationLimitError(error)) logger.warn("[automations] create blocked by limit", { limit: AUTOMATION_LIMIT });
      else logger.error("[automations] create failed", { error: message });
      set({ error: message });
      return null;
    } finally {
      set({ operationId: null });
    }
  },
  async updateAutomation(automationId, patch, service) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return false;
    const automation = findAutomation(state, automationId);
    if (!automation) return false;
    set({ operationId: `automation:update:${automationId}`, error: null });
    try {
      await service.updateAutomation({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
        ...patch,
      });
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: state.workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
      return true;
    } catch (error) {
      logger.error("[automations] update failed", { automationId, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
      return false;
    } finally {
      set({ operationId: null });
    }
  },
  async deleteAutomation(automationId, service) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return;
    const automation = findAutomation(state, automationId);
    if (!automation) return;
    set({ operationId: `automation:delete:${automationId}`, error: null });
    try {
      await service.deleteAutomation({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
      });
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: state.workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
    } catch (error) {
      logger.error("[automations] delete failed", { automationId, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async setEnabled(automationId, enabled, service) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return;
    const automation = findAutomation(state, automationId);
    if (!automation) return;
    set({ operationId: `automation:setEnabled:${automationId}`, error: null });
    try {
      await service.setAutomationEnabled({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
        enabled,
      });
      set({
        automations: get().automations.map((item) =>
          item.automationId === automationId ? { ...item, enabled, lifecycleStatus: enabled ? "active" : "paused" } : item,
        ),
      });
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: state.workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
    } catch (error) {
      logger.error("[automations] setEnabled failed", { automationId, enabled, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async restartAutomation(automationId, service) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return;
    const automation = findAutomation(state, automationId);
    if (!automation) return;
    set({ operationId: `automation:restart:${automationId}`, error: null });
    try {
      await service.restartAutomation({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
      });
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: state.workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
    } catch (error) {
      logger.error("[automations] restart failed", { automationId, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async runAutomationNow(automationId, service) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return "failed";
    const automation = findAutomation(state, automationId);
    if (!automation) return "failed";
    if (runNowInFlight.has(automationId)) return "duplicate";
    runNowInFlight.add(automationId);
    set({ operationId: `automation:runNow:${automationId}`, error: null });
    try {
      const result = await service.runAutomationNow({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
      });
      if (result.status === "duplicate") return "duplicate";
      await loadAutomationsIntoStore(set, get, { workspacePath, workspaceIdentity: state.workspaceIdentity, agentService: service, requestId: ++automationLoadSeq });
      return "queued";
    } catch (error) {
      logger.error("[automations] runNow failed", { automationId, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
      return "failed";
    } finally {
      runNowInFlight.delete(automationId);
      set({ operationId: null });
    }
  },
  async loadRuns(automationId, service, force = false) {
    const state = get();
    const workspacePath = state.workspacePath;
    if (!workspacePath) return;
    const automation = findAutomation(state, automationId);
    if (!automation) return;
    const cached = state.runsCache[automationId];
    if (!force && cached && cached.status !== "error") return;
    set({ runsCache: { ...get().runsCache, [automationId]: { status: "loading" } } });
    try {
      const runs = await service.listAutomationRuns({
        workspacePath: automation.workspacePath ?? workspacePath,
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        automationId,
      });
      if (!isSameAutomationWorkspace(get(), workspacePath, state.workspaceIdentity)) return;
      set({ runsCache: { ...get().runsCache, [automationId]: { status: "loaded", runs } } });
    } catch (error) {
      if (!isSameAutomationWorkspace(get(), workspacePath, state.workspaceIdentity)) return;
      logger.error("[automations] load runs failed", { automationId, error: automationErrorMessage(error) });
      set({ runsCache: { ...get().runsCache, [automationId]: { status: "error", error: automationErrorMessage(error) } } });
    }
  },
  async deleteRun(automationId, runId, service) {
    const automation = findAutomation(get(), automationId);
    if (!automation) return;
    set({ operationId: `automation:deleteRun:${runId}`, error: null });
    try {
      await service.deleteAutomationRun({
        workspacePath: automation.workspacePath ?? get().workspacePath ?? "",
        ...(automation.workspaceIdentity ? { workspaceIdentity: automation.workspaceIdentity } : {}),
        runId,
      });
      await get().loadRuns(automationId, service, true);
    } catch (error) {
      logger.error("[automations] delete run failed", { runId, error: automationErrorMessage(error) });
      set({ error: automationErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
}));

