// A0-S4-3: 自 modules/StoresDeep.tsx §B 原样迁入（T3 AutomationsStore 深层助手；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import type { ScheduleRule } from '../modules/SettingsLeaves'; // A0-CLEANUP3 3b：Automation 三型 scheduleRule 统一

/* ============================================================================
 * §B. T3 AutomationsStore 深层助手（原 js 134084–134110）
 * ==========================================================================*/

export interface Automation {
  automationId: string;
  title: string;
  prompt: string;
  cronExpr: string;
  enabled: boolean;
  recurring?: boolean;
  lifecycleStatus?: string;
  model?: string | null;
  provider?: string | null;
  mode?: string;
  endAt?: number | null;
  targetTaskId?: string | null;
  scheduleEditedByUser?: boolean;
  scheduleRule?: ScheduleRule | null; // A0-CLEANUP3 3b：统一为 SL.ScheduleRule（EV.AutomationRecord / SL.AutomationTaskLite 互指）
  nextRunAt?: number | null; // A0-CLEANUP3 3b：列表态展示消费（describeAutomationNextRun）
  runCount?: number;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceKey?: string | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

export interface AutomationsAgentService {
  listAllAutomations(): Promise<Automation[]>;
  [method: string]: unknown;
}

interface AutomationsStoreSnapshot {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  automations: Automation[];
  loading: boolean;
  error: string | null;
  [key: string]: unknown;
}

/** 原 y3（134084）：错误消息提取 */
export function automationErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 b3（134087）：加载序号（竞态防护；与 x3 运行中去重集同为模块闭包量） */
let automationLoadSeq = 0;
const runNowInFlight = new Set<string>();

/** 读取/重置加载序号（供 stores-tasks.tsx 的 initialize/refresh 接线） */
export function nextAutomationLoadSeq(): number {
  return ++automationLoadSeq;
}
export function currentAutomationLoadSeq(): number {
  return automationLoadSeq;
}
export function automationRunNowInFlight(): Set<string> {
  return runNowInFlight;
}

/** 原 S3（134089）：工作区是否仍是当前工作区（路径 ∧ 身份） */
export function isSameAutomationWorkspace(
  state: { workspacePath: string | null; workspaceIdentity: string | null },
  workspacePath: string,
  workspaceIdentity: string | null,
): boolean {
  return state.workspacePath === workspacePath && state.workspaceIdentity === workspaceIdentity;
}

/** 原 C3（134092）：按 id 查找自动化 */
export function findAutomation(state: { automations: Automation[] }, automationId: string): Automation | undefined {
  return state.automations.find((automation) => automation.automationId === automationId);
}

/**
 * 原 w3（134099）：全量装载（竞态双重校验：序号 ∧ 工作区未变）。
 * 失败路径：日志 `[automations] load failed` + error 落盘。
 */
export async function loadAutomationsIntoStore(
  set: (partial: { automations?: Automation[]; loading?: boolean; error?: string | null }) => void,
  get: () => { workspacePath: string | null; workspaceIdentity: string | null; automations: Automation[] },
  args: { workspacePath: string; workspaceIdentity: string | null; agentService: AutomationsAgentService; requestId: number },
): Promise<void> {
  const { workspacePath, workspaceIdentity, agentService, requestId } = args;
  try {
    const automations = await agentService.listAllAutomations();
    if (requestId !== automationLoadSeq || !isSameAutomationWorkspace(get(), workspacePath, workspaceIdentity)) return;
    set({ automations, loading: false });
  } catch (error) {
    if (requestId !== automationLoadSeq || !isSameAutomationWorkspace(get(), workspacePath, workspaceIdentity)) return;
    logger.error("[automations] load failed", { workspacePath, error: automationErrorMessage(error) });
    set({ error: automationErrorMessage(error), loading: false });
  }
}

/** 原 ri（跨 chunk：src `et`=hx）：创建限额错误判定（消息含 AUTOMATION_CREATE_LIMIT_REACHED） */
export const AUTOMATION_CREATE_LIMIT_CODE = "AUTOMATION_CREATE_LIMIT_REACHED";
export function isAutomationLimitError(error: unknown): boolean {
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "";
  return message.includes(AUTOMATION_CREATE_LIMIT_CODE);
}

