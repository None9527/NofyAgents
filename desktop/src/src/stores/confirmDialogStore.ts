// A0-S4-3: 自 modules/stores-core.tsx §5 原样迁入（ConfirmDialogStore + useConfirmDialog；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 5. ConfirmDialogStore（原 H2，js 123480–123492 / jsx 105205）
 * ----------------------------------------------------------------------------
 * 全局确认对话框：单请求槽位 + Promise 结算。
 * state 字段表：pendingRequest: ConfirmRequest \| undefined（1 个）
 * actions：requestConfirmation/settleConfirmation（2 个）
 * selectors 使用方：123494（U2 useConfirmDialog）、206574–206575（对话框呈现层）。
 * 持久化：无。
 * ==========================================================================*/

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve?: (confirmed: boolean) => void;
  [key: string]: unknown;
}

/** requestConfirmation 的入参（不含 resolve，由 store 注入） */
export interface ConfirmRequestInput {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  [key: string]: unknown;
}

export interface ConfirmDialogState {
  pendingRequest: ConfirmRequest | undefined;
  requestConfirmation(request: ConfirmRequestInput): Promise<boolean>;
  settleConfirmation(confirmed: boolean): void;
}

export const useConfirmDialogStore: UseBoundStore<ConfirmDialogState> = createStore<ConfirmDialogState>((set, get) => ({
  pendingRequest: undefined,
  requestConfirmation: (request) =>
    get().pendingRequest
      ? (logger.warn("[ConfirmDialogStore] confirmation already in progress"), Promise.resolve(false))
      : new Promise<boolean>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleConfirmation: (confirmed) => {
    const pending = get().pendingRequest;
    if (!pending) return;
    set({ pendingRequest: undefined });
    pending.resolve?.(confirmed);
  },
}));

/** 原 U2：useConfirmDialog —— 返回 requestConfirmation 动作 */
export function useConfirmDialog(): ConfirmDialogState["requestConfirmation"] {
  return useConfirmDialogStore((state) => state.requestConfirmation);
}

