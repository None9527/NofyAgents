/* ============================================================================
 * offPeakTaskStore.ts — 薄 re-export shim（A1-R8 双实例收敛）
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例之一（自 stores-tasks §1 迁入）。
 * A1-R8 普查：bundle 唯一 bX（@91416；A0 期行号 91368 系统性误标，jsx 78945
 * 孪生验证无误）。树内两并行实例：components/shell/Home.tsx 641 / 本文件 121。
 * 实测消费面：Home 实例 896–901（= bundle 91645–91650 kit 钩子簇，grayConfig/
 * newTaskBannerDismissed/initialize/refreshCodingPlanSupport/dismissNewTaskBanner/
 * setPendingCreateDraft 逐字对应）+ modules/Home.tsx 145 行 re-export（Bots/
 * PaymentDeep/WorkspaceShell 导入面在案）；本文件实例唯一引用面为
 * modules/stores-tasks.tsx 55/64 行 import/re-export shim 链，零终端拉取
 * （TopBar 取 pinned/workspace 二店、AutomationsMain/View 与 ExtendedViews 取
 * automations 店，皆不触 offPeak 导出；AutomationsMainView 之 bX 消费面原以
 * declare 悬置，同批普查留批）→ 休眠，降为 shim，旧实例删除（原实现见 git 历史，
 * 检查点 153547a）。
 * 裁决：Home 为 canonical——bX 定义区（91416，紧邻 kit@91639）属主 + 唯一
 * live 实例。AutomationsMainView 之 bX 消费面（bundle 138876 簇）原以 declare
 * 悬置，同批普查裁决接线归一，因型面缝合不拢留待型面对齐专批（见其留批注）。
 * 导出面维系：useOffPeakTaskStore + OFF_PEAK_TEMPLATE_IDS（← canonical 侧
 * OFF_PEAK_HOME_TEMPLATES 别名，原 Oit@91638 同常两录，归一于 canonical）+
 * OffPeakTask/OffPeakGrayConfig/CodingPlanSupport/TakeNumberAvailability/
 * OffPeakTaskService/CodingPlanSubscriptionService/OffPeakState 七型
 * （stores-tasks 55–56 / sessionRegistryStore 6 行 import 面逐一不破）。
 * 环安全：本文件 → components/shell/Home；Home 不 import 任何 stores/（实测），
 * 其闭包（Composer/GitReview/SkillStore/stores-session 等）皆不反入本文件
 * → 新边无成环。
 * 同型先例：stores/confirmDialogStore.ts（A1-R6）、stores/alertDialogStore.ts（A1-R7）、
 * stores/codeCommentsStore.ts、stores/skillContextStore.ts（A1-R8 同批）。
 * ==========================================================================*/

import type { OffPeakCreateResult } from './offPeakHelpers';

export { useOffPeakTaskStore, OFF_PEAK_HOME_TEMPLATES as OFF_PEAK_TEMPLATE_IDS } from '../components/shell/Home';

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

/* OffPeakCreateResult 已收敛至 StoresDeep 规范型（offPeakHelpers 头 import + re-export；
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
