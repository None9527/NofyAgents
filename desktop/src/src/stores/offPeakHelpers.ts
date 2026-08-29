// A0-S4-3: 自 modules/StoresDeep.tsx §C 原样迁入（bX OffPeakTaskStore 深层助手；原文件现为薄 re-export shim）。
/* ============================================================================
 * §C. bX OffPeakTaskStore 深层助手（原 js 91354）
 * ==========================================================================*/

/* A0-CLEANUP4：判别联合——与 Home bX 本地族双向对齐（bundle js 91520–91544：
   ok 分支透传、失败分支 errorCategory/errorCode/failureStage 全字段读取；
   stores-tasks transportFailure 字面量满足失败分支） */
export type OffPeakCreateResult =
  | { ok: true; task?: unknown; [key: string]: unknown }
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

