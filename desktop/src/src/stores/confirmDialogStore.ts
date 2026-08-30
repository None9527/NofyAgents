/* ============================================================================
 * confirmDialogStore.ts — 薄 re-export shim（A1-R6 双实例收敛）
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例（自 stores-core §5 迁入）。A1-R6 裁决：
 * bundle 唯一 H2（js 123497–123509），树内 live 实例 = components/modals/
 * ConfirmDialog.tsx 之 ConfirmDialogStore——bundle 206864–206865 对话框呈现层
 * 直接消费 H2（pendingRequest/settleConfirmation 选择器，与 ConfirmDialog.tsx
 * 155–156 区逐字对应），且全树 requestConfirmation 消费面（Bots/settings 六节/
 * TopBar/OnboardingDialog/RemoteWizard，皆经 Modals.tsx 再导出）归一于该实例。
 * 本文件并行实例经实测无任何下游消费者（休眠），然跨实例请求不可见之潜在风险
 * 不可留 → 降为 shim，旧实例删除（原实现见 git 历史，检查点 2046aaa）。
 * 导出面不变（stores-core.tsx 之 import 面：useConfirmDialogStore/useConfirmDialog
 * + ConfirmRequest/ConfirmRequestInput/ConfirmDialogState 三型，逐一维系）。
 * 邻接登记：AlertDialogStore（原 N9）同型并行问题（stores/alertDialogStore.ts）
 * 本批未动，见 A1-R6.report.md §下批候选。
 * ==========================================================================*/

import type { ConfirmDialogRequest } from '../components/modals/ConfirmDialog';

export { useConfirmDialogStore, useConfirmDialog } from '../components/modals/ConfirmDialog';
export type { ConfirmDialogRequest as ConfirmRequest, ConfirmDialogStoreState as ConfirmDialogState } from '../components/modals/ConfirmDialog';

/** 原 ConfirmRequestInput（requestConfirmation 入参面，不含 resolve，由 store 注入）。 */
export type ConfirmRequestInput = Omit<ConfirmDialogRequest, "resolve">;
