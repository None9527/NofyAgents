// A0-S4-3: 自 modules/stores-core.tsx §4 原样迁入（SelectionScopesStore + bH/aXe 助手；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 4. SelectionScopesStore（原 yH，js 67554–67560 / jsx 59934）
 * ----------------------------------------------------------------------------
 * 会话引用选择域：按作用域键存放已选引用列表（引用选择面板的选中态）。
 * state 字段表：scopes: Record<scopeKey, SelectionScopeItem[]>（1 个）
 * actions：无内置 action —— 消费方直接用 getState/setState（原 bH/aXe 助手）。
 * selectors 使用方：`yH(` 仅 1 处（定义）；消费走 bH/aXe（F03 会话族引用选择）。
 * 持久化：无。
 * ==========================================================================*/

export interface SelectionScopeItem {
  [key: string]: unknown;
}

export interface SelectionScopesState {
  scopes: Record<string, SelectionScopeItem[]>;
}

export const useSelectionScopesStore: UseBoundStore<SelectionScopesState> = createStore<SelectionScopesState>(() => ({ scopes: {} }));

/** 原 bH：取某作用域的选中项（缺省空数组） */
export function getSelectionScope(scopeKey: string): SelectionScopeItem[] {
  return useSelectionScopesStore.getState().scopes[scopeKey] ?? [];
}

/** 原 aXe：以更新函数改写某作用域；结果为空时删除该键 */
export function updateSelectionScope(scopeKey: string, updater: (items: SelectionScopeItem[]) => SelectionScopeItem[]): void {
  useSelectionScopesStore.setState((state) => {
    const next = updater(state.scopes[scopeKey] ?? []);
    if (next.length === 0) {
      const { [scopeKey]: _removed, ...rest } = state.scopes;
      return { scopes: rest };
    }
    return { scopes: { ...state.scopes, [scopeKey]: next } };
  });
}

