import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DesktopClient } from "../contracts/public.ts";
import { readFuzzyMatches } from "../../ui/readers.ts";
import { useProjection, selectSearch } from "../projection/public.ts";
import { createFileSearch } from "./search.ts";
export function useAttachmentSearch(client: DesktopClient, sessionId: string | null, cwd: string | null, epoch: number) {
  const scope = JSON.stringify([sessionId, cwd, epoch]);
  const owner = useRef<{ scope: string; search: ReturnType<typeof createFileSearch>; off: () => void } | null>(null);
  const [snapshot, setSnapshot] = useState<{ scope: string; id: string | null }>({ scope, id: null });
  const searchState = useProjection(client.projection, selectSearch);
  const close = useCallback(() => { const current = owner.current; owner.current = null; current?.off(); current?.search.close(); setSnapshot(previous => previous.scope === scope && previous.id === null ? previous : { scope, id: null }); }, [scope]);
  useEffect(() => { return () => { const current = owner.current; owner.current = null; current?.off(); current?.search.close(); }; }, [scope]);
  const open = useCallback(() => {
    if (!cwd || owner.current?.scope === scope) return;
    close();
    const search = createFileSearch(client.files, sessionId, cwd, () => client.projection.getState().connection.transportEpoch === epoch);
    const off = search.subscribe(() => setSnapshot({ scope, id: search.getSnapshot() }));
    owner.current = { scope, search, off };
    void search.change("");
  }, [client, sessionId, cwd, epoch, scope, close]);
  const query = useCallback((text: string) => { if (owner.current?.scope === scope) void owner.current.search.change(text); }, [scope]);
  const id = snapshot.scope === scope ? snapshot.id : null;
  const matches = useMemo(() => id !== null && searchState?.searchId === id ? readFuzzyMatches(searchState.matches) : [], [id, searchState]);
  const view = useMemo(() => ({ onOpen: open, onClose: close, onQuery: query, matches, ready: id !== null }), [open, close, query, matches, id]);
  return { open, close, query, matches, ready: id !== null, view };
}
