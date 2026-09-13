/**
 * 极小 reducer store——**唯一写入通道是 dispatch**。
 *
 * 为什么不用 zustand（PLAN §4 原定）：TUI 的模型是
 * Action → dispatch(纯同步) → 状态，reducer 形态与它一一对应，
 * 且「渲染层不拥有状态」这条纪律可以被**结构性**保证——
 * 状态对象在 store 之外拿不到 setter。zustand 的 set() 是命令式的，
 * 任何组件都能拿到并直接改，纪律只能靠约定。
 *
 * 若将来确需 zustand 的选择器性能， reducer 形状就是契约，迁移是机械的。
 */

export type Reducer<S, A> = (state: S, action: A) => S;

export type Store<S, A> = {
  getState: () => S;
  dispatch: (action: A) => void;
  subscribe: (fn: (state: S) => void) => () => void;
};

export function createStore<S, A>(reducer: Reducer<S, A>, initial: S): Store<S, A> {
  let state = initial;
  const listeners = new Set<(s: S) => void>();
  return {
    getState: () => state,
    dispatch: (action: A) => {
      const next = reducer(state, action);
      if (next === state) return; // 无变化则不通知，避免无谓重渲
      state = next;
      for (const fn of [...listeners]) fn(state);
    },
    subscribe: (fn: (s: S) => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

