/** Coalesce stream notifications; reducer state remains synchronous and authoritative. */
export function createFrameView<S>(store: { getState: () => S; subscribe: (fn: () => void) => () => void }, schedule: (fn: () => void) => () => void) {
  let snapshot = store.getState();
  let cancel: (() => void) | null = null;
  const listeners = new Set<() => void>();
  let off: (() => void) | null = null;
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (off === null) {
        snapshot = store.getState();
        off = store.subscribe(() => {
          if (cancel !== null) return;
          cancel = schedule(() => {
            cancel = null;
            const next = store.getState();
            if (snapshot === next) return;
            snapshot = next;
            for (const fn of [...listeners]) fn();
          });
        });
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) { off?.(); off = null; cancel?.(); cancel = null; }
      };
    },
  };
}

export type FrameSource<S> = { getState: () => S; subscribe: (fn: () => void) => () => void };
export type FrameView<S> = { getSnapshot: () => S; subscribe: (fn: () => void) => () => void };
const sharedViews = new WeakMap<object, FrameView<unknown>>();
export function sharedFrameView<S>(store: FrameSource<S>): FrameView<S> {
  const existing = sharedViews.get(store.subscribe);
  if (existing) return existing as FrameView<S>;
  const view = createFrameView(store, notify => {
    const timer = setTimeout(notify, 16);
    return () => clearTimeout(timer);
  });
  sharedViews.set(store.subscribe, view);
  return view;
}
/** Stable selected snapshots; unchanged slices produce no notifications. */
export function selectFrameView<S, T>(view: FrameView<S>, select: (state: S) => T, equal: (a: T, b: T) => boolean = Object.is): FrameView<T> {
  let value = select(view.getSnapshot());
  const listeners = new Set<() => void>();
  let off: (() => void) | null = null;
  const update = () => { const next = select(view.getSnapshot()); if (equal(value, next)) return false; value = next; return true; };
  return {
    getSnapshot: () => { update(); return value; },
    subscribe: (fn) => {
      listeners.add(fn);
      if (!off) off = view.subscribe(() => { if (update()) for (const listener of [...listeners]) listener(); });
      return () => { listeners.delete(fn); if (!listeners.size) { off?.(); off = null; } };
    },
  };
}
