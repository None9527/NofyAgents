/* ============================================================================
 * alertDialogStore.ts — 薄 re-export shim（A1-R7 双实例收敛）
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例（自 stores-core §6 迁入）。A1-R7 裁决：
 * bundle 唯一 N9（js 206804–206816 / jsx 164300），树内 live 实例 =
 * components/modals/ConfirmDialog.tsx 之 AlertDialogStore——bundle 206819–206820
 * G4t 呈现层直接消费 N9（pendingRequest/settleAlert 选择器，与 ConfirmDialog.tsx
 * 124–125 区逐字对应），且全树 requestAlert 消费面（OnboardingLoginLeaves
 * useAlertDialog，经 Modals.tsx 再导出）归一于该实例。本文件并行实例经实测
 * 唯一引用面为 modules/stores-core.tsx 之 import/re-export shim 链，零终端
 * 消费者（休眠），然跨实例请求不可见之潜在风险不可留 → 降为 shim，旧实例删除
 * （原实现见 git 历史，检查点 1152e9a）。
 * 导出面不变（stores-core.tsx 之 import 面：useAlertDialogStore/useAlert +
 * AlertRequest/AlertRequestInput/AlertDialogState 三型，逐一维系）。
 * 型别对应：AlertRequest←AlertDialogRequest | AlertDialogState←
 * AlertDialogStoreState | AlertRequestInput = Omit<…, "resolve">（同形）。
 * 环安全：ConfirmDialog.tsx 仅 import React/ui-dialog/button/UtilsCn/SkillStore/
 * I18n，不 import 任何 stores → 本文件 → ConfirmDialog 新边无成环（同 R6 H2/U2）。
 * 同型先例：stores/confirmDialogStore.ts（A1-R6 收敛）。
 * ==========================================================================*/

import type { AlertDialogRequest } from '../components/modals/ConfirmDialog';

export { useAlertDialogStore, useAlertDialog as useAlert } from '../components/modals/ConfirmDialog';
export type { AlertDialogRequest as AlertRequest, AlertDialogStoreState as AlertDialogState } from '../components/modals/ConfirmDialog';

/** 原 ConfirmRequestInput 之 alert 对应面（requestAlert 入参，不含 resolve，由 store 注入）。 */
export type AlertRequestInput = Omit<AlertDialogRequest, "resolve">;
