// A0-S4-3: 自 modules/SkillStore.tsx §1 原样迁入（jsx 5–39 vendored zustand v5 内核；原文件现为薄 re-export shim）。
import * as React from "react";

/* ============================================================================
 * 1. zustand 运行时（原 d/f/p/m/h/g/_，jsx 5–39）
 *    vendored zustand v5 内核（本 chunk 内联副本；导出 q = create，styles 侧 `Ae`，
 *    styles 内 20 个 store 的创建点基础，见 MODULE-MAP §2.1）
 * ==========================================================================*/

type SetStateFn<T> = (partial: Partial<T> | ((state: T) => Partial<T> | T), replace?: boolean) => void;
type GetStateFn<T> = () => T;

interface ZustandStoreApi<T> {
  setState: SetStateFn<T>;
  getState: GetStateFn<T>;
  getInitialState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

type ZustandStateCreator<T> = (set: SetStateFn<T>, get: GetStateFn<T>, api: ZustandStoreApi<T>) => T;

/** 原 f（jsx 6）：vanilla createStore 实现（状态+监听集+四元 API）。 */
const createStoreImpl = <T,>(createState: ZustandStateCreator<T>): ZustandStoreApi<T> => {
  let state: T;
  const listeners = new Set<(state: T, prevState: T) => void>();
  const setState: SetStateFn<T> = (partial, replace) => {
    const nextState = typeof partial == `function` ? (partial as (state: T) => Partial<T> | T)(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace ?? (typeof nextState != `object` || !nextState) ? (nextState as T) : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener: (state: T, prevState: T) => void) => (listeners.add(listener), () => listeners.delete(listener));
  const api: ZustandStoreApi<T> = {
    setState: setState,
    getState: getState,
    getInitialState: getInitialState,
    subscribe: (listener) => subscribe(listener),
  };
  const initialState = (state = createState(setState, getState, api));
  return api;
};

/** 原 p（jsx 26）：vanilla create（无参返回工厂本身，柯里化形态）。 */
const createVanillaStore: {
  <T>(createState: ZustandStateCreator<T>): ZustandStoreApi<T>;
  (): typeof createStoreImpl;
} = ((createState?: any) => (createState ? createStoreImpl(createState) : createStoreImpl)) as any;

/** 原 m（jsx 27）：恒等选择器（缺省）。 */
const identitySelector = <T,>(state: T): T => state;

/** 原 h（jsx 28）：useStore（useSyncExternalStore 绑定 + 选择器；导出 J）。 */
function useStore<T, R>(store: ZustandStoreApi<T>, selector: (state: T) => R = identitySelector as (state: T) => R): R {
  const slice = React.useSyncExternalStore(
    store.subscribe,
    React.useCallback(() => selector(store.getState()), [store, selector]),
    React.useCallback(() => selector(store.getInitialState()), [store, selector]),
  );
  return React.useDebugValue(slice), slice;
}

/** 绑定钩子类型 = 选择器钩子 + store 四元 API（Object.assign 合成物）。 */
type BoundStoreHook<T> = {
  <R>(selector?: (state: T) => R): R;
  setState: SetStateFn<T>;
  getState: GetStateFn<T>;
  getInitialState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

/** 原 g（jsx 32）：绑定钩子工厂（useBoundStore = 钩子 + 静态 API）。 */
const createBoundStore = <T,>(createState: ZustandStateCreator<T>): BoundStoreHook<T> => {
  const store = createVanillaStore(createState);
  const useBoundStore = <R,>(selector?: (state: T) => R) => useStore(store, selector as (state: T) => R);
  return Object.assign(useBoundStore, store), useBoundStore as BoundStoreHook<T>;
};

/** 原 _（jsx 38）：react create（导出 q；styles 侧 `Ae`）。 */
const create: {
  <T>(createState: ZustandStateCreator<T>): ReturnType<typeof createBoundStore<T>>;
  (): typeof createBoundStore;
  <T>(): (createState: ZustandStateCreator<T>) => ReturnType<typeof createBoundStore<T>>;
} = ((createState?: any) => (createState ? createBoundStore(createState) : createBoundStore)) as any;


/* ============================================================================
 * 导出（A0-S4-3：原模块内局部符号；拆分为独立单元后按单元面导出）
 * ==========================================================================*/

export { createStoreImpl, createVanillaStore, identitySelector, useStore, createBoundStore, create };
export type { SetStateFn, GetStateFn, ZustandStoreApi, ZustandStateCreator, BoundStoreHook };
