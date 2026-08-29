// A0-S4-3: 自 modules/stores-core.tsx §6 原样迁入（AlertDialogStore + useAlert；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 6. AlertDialogStore（原 N9，js 206514–206560 / jsx 164300）
 * ----------------------------------------------------------------------------
 * 全局警告对话框：单请求槽位 + 无参结算（原 G4t 呈现层：标题/描述/确认按钮 ⏎）。
 * state 字段表：pendingRequest: AlertRequest \| undefined（1 个）
 * actions：requestAlert/settleAlert（2 个）
 * selectors 使用方：206529–206530（G4t 呈现层）、209651（useAlert 钩子）。
 * 持久化：无。
 * ==========================================================================*/

export interface AlertRequest {
  title: string;
  description?: string;
  actionLabel?: string;
  resolve?: () => void;
  [key: string]: unknown;
}

/** requestAlert 的入参（不含 resolve，由 store 注入） */
export interface AlertRequestInput {
  title: string;
  description?: string;
  actionLabel?: string;
  [key: string]: unknown;
}

export interface AlertDialogState {
  pendingRequest: AlertRequest | undefined;
  requestAlert(request: AlertRequestInput): Promise<void>;
  settleAlert(): void;
}

export const useAlertDialogStore: UseBoundStore<AlertDialogState> = createStore<AlertDialogState>((set, get) => ({
  pendingRequest: undefined,
  requestAlert: (request) =>
    get().pendingRequest
      ? (logger.warn("[AlertDialogStore] alert already in progress"), Promise.resolve())
      : new Promise<void>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleAlert: () => {
    const pending = get().pendingRequest;
    if (!pending) return;
    set({ pendingRequest: undefined });
    pending.resolve?.();
  },
}));

/** 原 209651 无名钩子：useAlert —— 返回 requestAlert 动作 */
export function useAlert(): AlertDialogState["requestAlert"] {
  return useAlertDialogStore((state) => state.requestAlert);
}
