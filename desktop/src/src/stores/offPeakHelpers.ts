// A0-S4-3: 自 modules/StoresDeep.tsx §C 原样迁入（bX OffPeakTaskStore 深层助手；原文件现为薄 re-export shim）。
/* ============================================================================
 * §C. bX OffPeakTaskStore 深层助手（原 js 91354）
 * ==========================================================================*/

/* A0-CLEANUP4：判别联合——与 Home bX 本地族双向对齐（bundle js 91520–91544：
   ok 分支透传、失败分支 errorCategory/errorCode/failureStage 全字段读取；
   stores-tasks transportFailure 字面量满足失败分支） */
export type OffPeakCreateResult =
  /* A1-R9 精化：ok 支 task 原为 task?: unknown → 按运行期真形（创建成功恒含
   * 任务记录）具型为任务记录最小面并改必填——与 Home bX canonical 面双向对齐
   * （Home ok 支 task: OffPeakTaskSummary 必填；shim OffPeakTaskService.createTask
   * 返回面 → Home OffPeakTaskService 指派合拢，bX 接线所需）。 */
  | { ok: true; task: { offPeakTaskId: string; prompt: string; status: string; title?: string; [key: string]: unknown }; [key: string]: unknown }
  | {
      ok: false;
      failureStage: string;
      errorCategory: string;
      errorCode: string;
      providerName: string;
      [key: string]: unknown;
    };

/** 原 Eit（91354）：创建失败是否取号配额相关（quota_3103 ∧ 3103；触发可用性刷新） */
export function isTakeNumberFailure(result: OffPeakCreateResult | null | undefined): boolean {
  return result?.ok === false && result.errorCategory === "quota_3103" && result.errorCode === "3103";
}

