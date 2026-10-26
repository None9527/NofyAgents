import type { FilesClient } from "../contracts/public.ts";
/** One owned fuzzy session. Late opens are closed; only the latest query is sent. */
export function createFileSearch(files: FilesClient, sessionId: string | null, cwd: string, valid: () => boolean = () => true) {
  let id: string | null = null;
  let opening: Promise<void> | null = null;
  let closed = false;
  let query = "";
  let error: string | null = null;
  const listeners = new Set<() => void>();
  const emit = () => { for (const listener of [...listeners]) listener(); };
  return {
    getSnapshot: () => id,
    getErrorSnapshot: () => error,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    change: (value: string): Promise<void> => {
      query = value;
      if (closed || !valid()) return Promise.resolve();
      if (id) return files.changeSearch(id, query).then(() => {});
      if (opening) return opening;
      error = null; emit();
      opening = files.openSearch(sessionId, cwd).then(async result => {
        if (!result.ok) { if (!closed && valid()) { error = result.error; emit(); } return; }
        if (!valid()) return;
        if (closed) { await files.closeSearch(result.value); return; }
        id = result.value; emit();
        await files.changeSearch(id, query);
      }).catch(cause => { if (!closed && valid()) { error = cause instanceof Error ? cause.message : String(cause); emit(); } }).finally(() => { opening = null; });
      return opening;
    },
    close: () => { if (closed) return; closed = true; const previous = id; id = null; emit(); listeners.clear(); if (previous && valid()) void files.closeSearch(previous); },
  };
}
