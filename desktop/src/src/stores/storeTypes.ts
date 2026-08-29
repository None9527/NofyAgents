// A0-S4-3: 自 modules/stores-core.tsx §0 原样迁入（横切层 zustand 接口类型；四份同形副本收敛于此，原文件现为薄 re-export shim）。
/* ============================================================================
 * 0. zustand 接口（原 `Ae` = skillStore chunk 导出的 create；`ne` = 选择器钩子）
 * ==========================================================================*/

export type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
export type GetState<T> = () => T;

export interface StoreApi<T> {
  getState: GetState<T>;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

/** zustand 绑定钩子：`useStore(selector)` + 静态 getState/setState/subscribe；
 *  无参调用返回全量 state（zustand 语义，hooksStore() 等消费面依赖） */
export type UseBoundStore<T> = StoreApi<T> & (<R>(selector: (state: T) => R) => R) & (() => T);
