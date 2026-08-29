/* eslint-disable */
/**
 * ============================================================================
 * stores-tasks.tsx — ZCode 3.7.6 横切层 zustand stores · 任务域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件含 4 个 store：
 *
 *  # | 混淆名 | 语义名                    | js 行          | 归属族
 *  --|--------|---------------------------|----------------|--------
 * 10 | bX     | OffPeakTaskStore          | 91368–91590    | F15
 * 14 | T3     | AutomationsStore          | 134111–137004* | F15
 * 15 | E6     | PinnedTaskListStore       | 142372–142463  | F01
 * 16 | k6     | WorkspaceTaskListStore    | 142464–142753* | F01
 *
 *  * T3 store 本体 134111–134388（其后为自动化编辑器 UI）；k6 store 本体
 *    142464–142556（其后为任务行 UI）。
 *
 * 持久化键：四个 store 均无本地持久化（数据经服务来自宿主/远端）。
 *   相关但属于族层的键：zcode-default-group-off-peak / zcode-default-group-cron
 *   （自动化分组缺省名，F15 族内）。
 *
 * selectors 使用方（抽样）：
 *  bX：25 处 —— 91597–91602（off-peak 横幅 kit）、138859–138860（AutomationsMain d6）等
 *  T3：14 处 —— 138843–138851（AutomationsMain d6）等
 *  E6：2 处 —— 151805–151806（侧栏置顶段）
 *  k6：4 处 —— 152320–152323（侧栏时间线段）
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
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { automationErrorMessage, findAutomation, isAutomationLimitError, isSameAutomationWorkspace, isTakeNumberFailure, loadAutomationsIntoStore } from './StoresDeep';
import { create as createStore, resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Ae | 原 Io
import { getSessionById as getRegisteredSession } from './stores-core'; // 原 tc
import type { Automation, OffPeakCreateResult } from './StoresDeep';
export type { Automation, OffPeakCreateResult };

/* ============================================================================
 * 1. OffPeakTaskStore（原 bX，js 91368–91590 / jsx 78945）
 * ----------------------------------------------------------------------------
 * 闲时（off-peak）任务：灰度配置/编码计划支持/取号可用性 + 任务 CRUD。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | tasks | OffPeakTask[] | 闲时任务列表 |
 *  | loading | boolean | 初始化加载中 |
 *  | error | string \| null | 最近错误类别/消息 |
 *  | operationId | string \| null | 当前操作锁（offpeak:create / offpeak:update:<id> …） |
 *  | grayConfig | OffPeakGrayConfig \| null | 灰度配置（enabled/codingPlanActive） |
 *  | codingPlanSupport | CodingPlanSupport \| null | 编码计划支持情况 |
 *  | takeNumberAvailability | TakeNumberAvailability \| null | 取号可用性 |
 *  | takeNumberAvailabilityStatus | 'idle'\|'loading'\|'ready'\|'error' | 取号状态机 |
 *  | newTaskBannerDismissed | boolean | 新任务横幅已关闭 |
 *  | pendingCreateDraft | unknown \| null | 待创建草稿（跨视图传递） |
 * actions（14）：initialize/refresh/refreshCodingPlanSupport/refreshTakeNumberAvailability/
 *   createTask/updateTask/pauseTask/continueTask/cancelTask/deleteTask/deleteHistory/
 *   dismissNewTaskBanner/setPendingCreateDraft/consumePendingCreateDraft
 * 并发：initialize 全局单飞（原 yX promise 槽）。
 * ==========================================================================*/

export interface OffPeakTask {
  offPeakTaskId?: string;
  [key: string]: unknown;
}

export interface OffPeakGrayConfig {
  enabled?: boolean;
  codingPlanActive?: boolean;
  [key: string]: unknown;
}

export interface CodingPlanSupport {
  supported?: boolean;
  [key: string]: unknown;
}

export interface TakeNumberAvailability {
  [key: string]: unknown;
}

export interface OffPeakTaskService {
  list(): Promise<OffPeakTask[]>;
  getCodingPlanSupport(): Promise<CodingPlanSupport>;
  getTakeNumberAvailability(): Promise<TakeNumberAvailability>;
  createTask(draft: unknown): Promise<OffPeakCreateResult>;
  updateTask(taskId: string, patch: unknown): Promise<OffPeakTask | null>;
  pauseTask(taskId: string): Promise<void>;
  continueTask(taskId: string): Promise<void>;
  cancelTask(taskId: string): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
  deleteHistory(taskId: string): Promise<void>;
}

export interface CodingPlanSubscriptionService {
  getOffPeakClientConfig(args: { forceRefresh: boolean }): Promise<OffPeakGrayConfig | null>;
}

/* OffPeakCreateResult 已收敛至 StoresDeep 规范型（文件头 import + re-export；
   本地原有 task?: OffPeakTask/queuePosition 字段由规范型的 task?: unknown 与索引签名覆盖） */

export interface OffPeakState {
  tasks: OffPeakTask[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  grayConfig: OffPeakGrayConfig | null;
  codingPlanSupport: CodingPlanSupport | null;
  takeNumberAvailability: TakeNumberAvailability | null;
  takeNumberAvailabilityStatus: "idle" | "loading" | "ready" | "error";
  newTaskBannerDismissed: boolean;
  pendingCreateDraft: unknown | null;
  initialize(services: { offPeakTaskService: OffPeakTaskService; codingPlanSubscriptionService: CodingPlanSubscriptionService }): Promise<void>;
  refresh(service: OffPeakTaskService): Promise<void>;
  refreshCodingPlanSupport(service: CodingPlanSubscriptionService & OffPeakTaskService): Promise<void>;
  refreshTakeNumberAvailability(service: OffPeakTaskService): Promise<void>;
  createTask(draft: unknown, service: OffPeakTaskService): Promise<OffPeakCreateResult>;
  updateTask(taskId: string, patch: unknown, service: OffPeakTaskService): Promise<boolean>;
  pauseTask(taskId: string, service: OffPeakTaskService): Promise<void>;
  continueTask(taskId: string, service: OffPeakTaskService): Promise<void>;
  cancelTask(taskId: string, service: OffPeakTaskService): Promise<void>;
  deleteTask(taskId: string, service: OffPeakTaskService): Promise<void>;
  deleteHistory(taskId: string, service: OffPeakTaskService): Promise<void>;
  dismissNewTaskBanner(): void;
  setPendingCreateDraft(draft: unknown | null): void;
  consumePendingCreateDraft(): unknown | null;
}

let offPeakInitInFlight: Promise<void> | null = null; // 原 yX

function offPeakErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 Eit：创建失败是否取号相关（需刷新可用性） */

export const useOffPeakTaskStore: UseBoundStore<OffPeakState> = createStore<OffPeakState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  operationId: null,
  grayConfig: null,
  codingPlanSupport: null,
  takeNumberAvailability: null,
  takeNumberAvailabilityStatus: "idle",
  newTaskBannerDismissed: false,
  pendingCreateDraft: null,
  async initialize({ offPeakTaskService, codingPlanSubscriptionService }) {
    if (offPeakInitInFlight) return offPeakInitInFlight;
    const load = (async () => {
      set({ loading: true, error: null, codingPlanSupport: null, takeNumberAvailability: null, takeNumberAvailabilityStatus: "loading" });
      try {
        let supportLoadFailed = false;
        const [grayConfig, tasks, codingPlanSupport] = await Promise.all([
          codingPlanSubscriptionService.getOffPeakClientConfig({ forceRefresh: true }).catch((error) => (logger.warn("[off-peak] gray config load failed", offPeakErrorMessage(error)), null)),
          offPeakTaskService.list().catch((error) => (logger.warn("[off-peak] list failed", offPeakErrorMessage(error)), [] as OffPeakTask[])),
          offPeakTaskService.getCodingPlanSupport().catch((error) => ((supportLoadFailed = true), logger.warn("[off-peak] coding plan support load failed", offPeakErrorMessage(error)), null)),
        ]);
        let availability: TakeNumberAvailability | null = null;
        let availabilityStatus: OffPeakState["takeNumberAvailabilityStatus"] = supportLoadFailed ? "error" : "idle";
        const codingPlanEligible = grayConfig?.codingPlanActive === true || codingPlanSupport?.supported === true;
        if (grayConfig?.enabled && codingPlanEligible) {
          try {
            availability = await offPeakTaskService.getTakeNumberAvailability();
            availabilityStatus = "ready";
          } catch (error) {
            availabilityStatus = "error";
            logger.warn("[off-peak] availability load failed", offPeakErrorMessage(error));
          }
        }
        set({ grayConfig, tasks, codingPlanSupport, takeNumberAvailability: availability, takeNumberAvailabilityStatus: availabilityStatus, loading: false });
      } catch (error) {
        set({ error: offPeakErrorMessage(error), takeNumberAvailability: null, takeNumberAvailabilityStatus: "error", loading: false });
      }
    })();
    offPeakInitInFlight = load;
    try {
      await load;
    } finally {
      if (offPeakInitInFlight === load) offPeakInitInFlight = null;
    }
  },
  async refresh(service) {
    try {
      set({ tasks: await service.list(), error: null });
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    }
  },
  async refreshCodingPlanSupport(service) {
    set({ codingPlanSupport: null, takeNumberAvailability: null, takeNumberAvailabilityStatus: "loading" });
    try {
      const support = await service.getCodingPlanSupport();
      set({ codingPlanSupport: support });
      const grayConfig = get().grayConfig;
      const eligible = grayConfig?.codingPlanActive === true || support.supported === true;
      if (grayConfig?.enabled && eligible) await get().refreshTakeNumberAvailability(service);
      else set({ takeNumberAvailabilityStatus: "idle" });
    } catch (error) {
      set({ codingPlanSupport: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] coding plan support refresh failed", offPeakErrorMessage(error));
    }
  },
  async refreshTakeNumberAvailability(service) {
    set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "loading" });
    try {
      set({ takeNumberAvailability: await service.getTakeNumberAvailability(), takeNumberAvailabilityStatus: "ready" });
    } catch (error) {
      set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] availability refresh failed", offPeakErrorMessage(error));
    }
  },
  async createTask(draft, service) {
    set({ operationId: "offpeak:create", error: null });
    try {
      const result = await service.createTask(draft);
      if (result.ok) {
        await Promise.all([get().refresh(service), get().refreshTakeNumberAvailability(service)]);
        return result;
      }
      set({ error: result.errorCategory ?? null, takeNumberAvailability: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] create failed", { errorCategory: result.errorCategory, errorCode: result.errorCode, failureStage: result.failureStage });
      if (isTakeNumberFailure(result)) await get().refreshTakeNumberAvailability(service);
      return result;
    } catch (error) {
      const transportFailure: OffPeakCreateResult = { ok: false, failureStage: "ticket_request", errorCategory: "network", errorCode: "", providerName: "" };
      set({ error: transportFailure.errorCategory ?? null, takeNumberAvailability: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] create RPC transport failed", { errorType: error instanceof Error ? error.name : typeof error });
      return transportFailure;
    } finally {
      set({ operationId: null });
    }
  },
  async updateTask(taskId, patch, service) {
    set({ operationId: `offpeak:update:${taskId}`, error: null });
    try {
      const updated = await service.updateTask(taskId, patch);
      await get().refresh(service);
      return updated !== null;
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
      return false;
    } finally {
      set({ operationId: null });
    }
  },
  async pauseTask(taskId, service) {
    set({ operationId: `offpeak:pause:${taskId}`, error: null });
    try {
      await service.pauseTask(taskId);
      await get().refresh(service);
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async continueTask(taskId, service) {
    set({ operationId: `offpeak:continue:${taskId}`, error: null });
    try {
      await service.continueTask(taskId);
      await get().refresh(service);
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async cancelTask(taskId, service) {
    set({ operationId: `offpeak:cancel:${taskId}`, error: null });
    try {
      await service.cancelTask(taskId);
      await get().refresh(service);
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteTask(taskId, service) {
    set({ operationId: `offpeak:delete:${taskId}`, error: null });
    try {
      await service.deleteTask(taskId);
      await get().refresh(service);
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteHistory(taskId, service) {
    set({ operationId: `offpeak:delete-history:${taskId}`, error: null });
    try {
      await service.deleteHistory(taskId);
      await get().refresh(service);
    } catch (error) {
      set({ error: offPeakErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  dismissNewTaskBanner() {
    set({ newTaskBannerDismissed: true });
  },
  setPendingCreateDraft(draft) {
    set({ pendingCreateDraft: draft });
  },
  consumePendingCreateDraft() {
    const draft = get().pendingCreateDraft;
    if (draft) set({ pendingCreateDraft: null });
    return draft;
  },
}));

/** 原 Oit（91590）：off-peak 模板入口（晨间简报/风险扫描/自定义） */
export const OFF_PEAK_TEMPLATE_IDS = [{ id: "standupGitSummary" }, { id: "ciFlakyReport" }, { id: "customize" }];

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
  [key: string]: unknown;
}

export interface AutomationsAgentService {
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

/* ============================================================================
 * 3. PinnedTaskListStore（原 E6，js 142372–142463 / jsx 118266）
 * ----------------------------------------------------------------------------
 * 远端置顶任务列表（按工作区键分桶）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | itemsByWorkspaceKey | Record<workspaceKey, PinnedTask[]> | 置顶任务 |
 *  | loadingByWorkspaceKey | Record<workspaceKey, boolean> | 加载态 |
 *  | errorByWorkspaceKey | Record<workspaceKey, string> | 错误 |
 * actions：refreshWorkspace/upsertTask/removeTask/clearWorkspace（4 个）
 * 消费：151805–151806（侧栏置顶段）；D6 会话注册后刷新（142430）。
 * ==========================================================================*/

export interface PinnedTask {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

export interface ZCodeTaskService {
  listPinnedTasks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<PinnedTask[]>;
  listTaskList(args: {
    kind: "timeline" | string;
    workspaceScopes: Array<{ workspacePath: string; workspaceIdentity?: string }>;
    sortBy: "created" | "updated" | string;
    limit: number;
  }): Promise<{ items: TimelineTask[]; total: number; hasMore: boolean }>;
  [method: string]: unknown;
}

export interface PinnedTaskListState {
  itemsByWorkspaceKey: Record<string, PinnedTask[]>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: { workspacePath: string; workspaceIdentity?: string | null; zcodeTaskService: ZCodeTaskService }): Promise<void>;
  upsertTask(task: PinnedTask): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}

/** 原 sFt：置顶任务排序（接口级，142400 区） */
declare function sortPinnedTasks(tasks: PinnedTask[]): PinnedTask[];

export const usePinnedTaskListStore: UseBoundStore<PinnedTaskListState> = createStore<PinnedTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService }) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const tasks = await zcodeTaskService.listPinnedTasks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(tasks) },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remotePinnedTaskStore] 读取远端 pinned task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task) {
    const key = workspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const existing = state.itemsByWorkspaceKey[key] ?? [];
      const next = existing.some((item) => item.taskId === task.taskId)
        ? existing.map((item) => (item.taskId === task.taskId ? task : item))
        : [...existing, task];
      return { itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(next) } };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: {
        ...state.itemsByWorkspaceKey,
        [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId),
      },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _items, ...itemsByWorkspaceKey } = state.itemsByWorkspaceKey;
      const { [key]: _loading, ...loadingByWorkspaceKey } = state.loadingByWorkspaceKey;
      const { [key]: _error, ...errorByWorkspaceKey } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey, loadingByWorkspaceKey, errorByWorkspaceKey };
    });
  },
}));

/** 原 D6（142430–142444）：会话注册后按会话服务刷新置顶列表 */
export async function refreshPinnedTasksForSession(args: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }): Promise<void> {
  const session = getRegisteredSession(args.sessionId);
  if (!session) {
    logger.warn("[remotePinnedTaskStore] 远端 session 尚未注册，跳过 pinned 读取", args);
    return;
  }
  await usePinnedTaskListStore.getState().refreshWorkspace({
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    zcodeTaskService: session.services.zcodeTaskService as ZCodeTaskService,
  });
}

/* ============================================================================
 * 4. WorkspaceTaskListStore（原 k6，js 142464–142556 / jsx 118392）
 * ----------------------------------------------------------------------------
 * 远端时间线任务列表（按工作区键分桶，含总数/hasMore 分页态）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | itemsByWorkspaceKey | Record<workspaceKey, TimelineTask[]> | 任务列表 |
 *  | totalByWorkspaceKey | Record<workspaceKey, number> | 总数 |
 *  | hasMoreByWorkspaceKey | Record<workspaceKey, boolean> | 是否还有更多 |
 *  | loadingByWorkspaceKey | Record<workspaceKey, boolean> | 加载态 |
 *  | errorByWorkspaceKey | Record<workspaceKey, string> | 错误 |
 * actions：refreshWorkspace/upsertTask/removeTask/clearWorkspace（4 个）
 * 消费：152320–152323（侧栏时间线段）；A6 会话注册后刷新（142558）。
 * ==========================================================================*/

export interface TimelineTask {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

export interface WorkspaceTaskListState {
  itemsByWorkspaceKey: Record<string, TimelineTask[]>;
  totalByWorkspaceKey: Record<string, number>;
  hasMoreByWorkspaceKey: Record<string, boolean>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    zcodeTaskService: ZCodeTaskService;
    sortBy: "created" | "updated" | string;
    limit: number;
  }): Promise<void>;
  upsertTask(task: TimelineTask, sortBy?: "created" | "updated" | string): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}

/** 原 cFt（142450–142462）：按 created/updated 双键排序（平手再比另一键，再比 taskId） */
export function sortTimelineTasks(tasks: TimelineTask[], sortBy: "created" | "updated" | string = "updated"): TimelineTask[] {
  return [...tasks].sort((a, b) =>
    sortBy === "created"
      ? (b.createdAt ?? 0) === (a.createdAt ?? 0)
        ? (b.updatedAt ?? 0) === (a.updatedAt ?? 0)
          ? b.taskId.localeCompare(a.taskId)
          : (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        : (b.createdAt ?? 0) - (a.createdAt ?? 0)
      : (b.updatedAt ?? 0) === (a.updatedAt ?? 0)
        ? (b.createdAt ?? 0) === (a.createdAt ?? 0)
          ? b.taskId.localeCompare(a.taskId)
          : (b.createdAt ?? 0) - (a.createdAt ?? 0)
        : (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
  );
}

export const useWorkspaceTaskListStore: UseBoundStore<WorkspaceTaskListState> = createStore<WorkspaceTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  totalByWorkspaceKey: {},
  hasMoreByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService, sortBy, limit }) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const result = await zcodeTaskService.listTaskList({
        kind: "timeline",
        workspaceScopes: [{ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) }],
        sortBy,
        limit,
      });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTimelineTasks(result.items, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: result.total },
        hasMoreByWorkspaceKey: { ...state.hasMoreByWorkspaceKey, [key]: result.hasMore },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remoteTimelineTaskStore] 读取远端 timeline task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task, sortBy = "updated") {
    const key = workspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const existing = state.itemsByWorkspaceKey[key] ?? [];
      const next = existing.some((item) => item.taskId === task.taskId)
        ? existing.map((item) => (item.taskId === task.taskId ? task : item))
        : [...existing, task];
      return {
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTimelineTasks(next, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: Math.max(state.totalByWorkspaceKey[key] ?? 0, next.length) },
      };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: {
        ...state.itemsByWorkspaceKey,
        [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId),
      },
      totalByWorkspaceKey: {
        ...state.totalByWorkspaceKey,
        [key]: Math.max(0, (state.totalByWorkspaceKey[key] ?? state.itemsByWorkspaceKey[key]?.length ?? 0) - 1),
      },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _items, ...itemsByWorkspaceKey } = state.itemsByWorkspaceKey;
      const { [key]: _total, ...totalByWorkspaceKey } = state.totalByWorkspaceKey;
      const { [key]: _hasMore, ...hasMoreByWorkspaceKey } = state.hasMoreByWorkspaceKey;
      const { [key]: _loading, ...loadingByWorkspaceKey } = state.loadingByWorkspaceKey;
      const { [key]: _error, ...errorByWorkspaceKey } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey, totalByWorkspaceKey, hasMoreByWorkspaceKey, loadingByWorkspaceKey, errorByWorkspaceKey };
    });
  },
}));

/** 原 A6（142558–142581）：会话注册后按会话服务刷新时间线列表 */
export async function refreshTimelineTasksForSession(args: {
  sessionId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  sortBy?: "created" | "updated" | string;
  limit?: number;
}): Promise<void> {
  const session = getRegisteredSession(args.sessionId);
  if (!session) {
    logger.warn("[remoteTimelineTaskStore] 远端 session 尚未注册，跳过 timeline 读取", args);
    return;
  }
  await useWorkspaceTaskListStore.getState().refreshWorkspace({
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    zcodeTaskService: session.services.zcodeTaskService as ZCodeTaskService,
    sortBy: args.sortBy ?? "updated",
    limit: args.limit ?? 10,
  });
}
