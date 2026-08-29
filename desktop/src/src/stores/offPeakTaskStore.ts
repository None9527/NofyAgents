// A0-S4-3: 自 modules/stores-tasks.tsx §1 原样迁入（bX OffPeakTaskStore；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { isTakeNumberFailure } from './offPeakHelpers'; // 原 Eit（StoresDeep §C）
import type { OffPeakCreateResult } from './offPeakHelpers';
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

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
  offPeakTaskId: string; // A0-CLEANUP3 3b：按消费面（SL OffPeakTaskRecord/SPC OffPeakTask）补足；运行期恒有值
  prompt: string;
  status: string;
  title?: string;
  permissionMode?: string;
  model?: string | null;
  thoughtLevel?: string | null;
  startedAt?: number;
  endedAt?: number;
  historyDeletedAt?: number;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

export interface OffPeakGrayConfig {
  enabled?: boolean;
  codingPlanActive?: boolean;
  allowedModels?: string[]; // A0-CLEANUP3 3b：按消费面（OffPeakTaskEditor props）补足
  allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
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
  [method: string]: unknown; // A0-CLEANUP3 3b：EV 弱型面（{[key]: unknown}）互指
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

