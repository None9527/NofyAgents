/** A query owner: identity change invalidates pending work; polling never overlaps. */
export function createResource<T>(initial: T, read: () => Promise<T>, valid: () => boolean = () => true) {
  let snapshot = { value: initial, busy: false, error: null as string | null };
  let revision = 0;
  let pending: Promise<void> | null = null;
  let disposed = false;
  const listeners = new Set<() => void>();
  const emit = () => { for (const listener of [...listeners]) listener(); };
  return {
    getSnapshot: () => snapshot,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    refresh: (): Promise<void> => {
      if (disposed || !valid()) return Promise.resolve();
      if (pending) return pending;
      const token = ++revision;
      snapshot = { ...snapshot, busy: true, error: null }; emit();
      pending = Promise.resolve().then(read).then(value => {
        if (disposed || token !== revision || !valid()) return;
        snapshot = { value, busy: false, error: null }; emit();
      }, error => {
        if (disposed || token !== revision || !valid()) return;
        snapshot = { ...snapshot, busy: false, error: error instanceof Error ? error.message : String(error) }; emit();
      }).finally(() => { if (token === revision) pending = null; });
      return pending;
    },
    dispose: () => { disposed = true; revision++; listeners.clear(); pending = null; },
  };
}
