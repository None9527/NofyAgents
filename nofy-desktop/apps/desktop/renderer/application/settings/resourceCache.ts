export type ResourceState<T> = { status: "idle" | "loading" | "ready" | "error"; data: T | null; error: string | null; refreshing: boolean };
/** One resource owns its snapshot and request generation. Refresh supersedes old responses. */
export function createResource<T>(read: () => Promise<T>, staleMs = 30000) {
  let state: ResourceState<T> = { status: "idle", data: null, error: null, refreshing: false };
  let generation = 0, updatedAt = 0;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: ResourceState<T>) => { state = next; for (const listener of [...listeners]) listener(); };
  const load = (force = false): Promise<void> => {
    if (!force && pending) return pending;
    if (!force && state.status === "ready" && Date.now() - updatedAt < staleMs) return Promise.resolve();
    const token = ++generation;
    publish({ ...state, status: state.data === null ? "loading" : state.status, error: null, refreshing: state.data !== null });
    const request = Promise.resolve().then(read).then(data => {
      if (token !== generation) return;
      updatedAt = Date.now(); publish({ status: "ready", data, error: null, refreshing: false });
    }, cause => {
      if (token !== generation) return;
      publish({ ...state, status: "error", error: cause instanceof Error ? cause.message : String(cause), refreshing: false });
    }).finally(() => { if (token === generation) pending = null; });
    pending = request;
    return request;
  };
  const invalidate = () => { generation++; pending = null; updatedAt = 0; publish({ ...state, status: "idle", error: null, refreshing: false }); };
  return { invalidate, getSnapshot: () => state, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, load };
}
