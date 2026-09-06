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

/* ── tombstone〔A1-R186〕死界面普查批第五批（stores/automationsHelpers.ts：1 面／8 行，本批该文件共 1 碑）：本地 interface AutomationsStoreSnapshot@39-46（8 行）纯删，8 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface AutomationsStoreSnapshot：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    同名定义站：AutomationsStoreSnapshot 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 8 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 8 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 8 行置换原 8 行，文件行数 110 不变、零重锚（本文件 automationsHelpers 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

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

