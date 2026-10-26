import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { DesktopClient } from "../contracts/public.ts";
import { useProjection, selectConnection, selectSearch } from "../projection/public.ts";
import { readFuzzyMatches } from "../../ui/readers.ts";
import { fileWorkspaceOwner } from "./fileWorkspaceCache.ts";
import { createFileSearch } from "./search.ts";
export function useFileWorkspace(client: DesktopClient, root: string | null, sessionId: string | null, enabled = true) {
  const connection = useProjection(client.projection, selectConnection);
  const search = useProjection(client.projection, selectSearch);
  const epoch = connection.transportEpoch;
  const owner = useMemo(() => fileWorkspaceOwner(client, root, sessionId, epoch), [client, root, sessionId, epoch]);
  const snapshot = useSyncExternalStore(owner.subscribe, owner.getSnapshot);
  const query = snapshot.query;
  const [watchError, setWatchError] = useState<string | null>(null);
  const watchSerial = useRef(0);
  const watchKey = JSON.stringify([root,...snapshot.expanded,...snapshot.resources.tabs.map(tab => tab.path.slice(0,tab.path.lastIndexOf("/")))]);
  useEffect(() => {
    if (!enabled || !root || connection.status !== "ready") return;
    const id = JSON.stringify([root,sessionId,epoch,++watchSerial.current]);
    const directories = [...new Set([...snapshot.expanded,...snapshot.resources.tabs.map(tab => tab.path.slice(0,tab.path.lastIndexOf("/")))])].filter(path => path !== root).slice(0,31);
    const off = client.host.onFilesChanged(change => { if (change.id === id && change.root === root) owner.invalidate(root,change.paths); });
    let alive = true; setWatchError(null);
    void client.host.watchFiles({ id, root, directories }).then(result => { if (alive && !result.ok) setWatchError(result.error ?? "File watch unavailable"); }, cause => { if (alive) setWatchError(String(cause)); });
    return () => { alive = false; off(); void client.host.unwatchFiles(id); };
  }, [owner, client, watchKey, connection.status, enabled]);
  const fuzzy = useMemo(() => enabled && root && query.trim() ? createFileSearch(client.files, sessionId, root, () => { const state = client.projection.getState(); return state.connection.transportEpoch === epoch && state.activeSessionId === sessionId; }) : null, [client, root, sessionId, epoch, Boolean(query.trim()), enabled]);
  const searchId = useSyncExternalStore(fuzzy?.subscribe ?? NO_SUBSCRIBE, fuzzy?.getSnapshot ?? NULL_SNAPSHOT);
  const searchError = useSyncExternalStore(fuzzy?.subscribe ?? NO_SUBSCRIBE, fuzzy?.getErrorSnapshot ?? NULL_SNAPSHOT);
  useEffect(() => {
    if (!enabled) return;
    owner.resume();
    if (root && connection.status === "ready") { owner.refresh(root); }
    return () => owner.suspend();
  }, [owner, root, connection.status, enabled]);
  useEffect(() => () => fuzzy?.close(), [fuzzy]);
  useEffect(() => { if (!query.trim() || !fuzzy || connection.status !== "ready") return; const timer = setTimeout(() => { void fuzzy.change(query.trim()); }, 250); return () => clearTimeout(timer); }, [query, fuzzy, connection.status]);
  const searchState = query.trim() && searchId && search?.searchId === searchId ? search : null;
  const matches = useMemo(() => readFuzzyMatches(searchState?.matches ?? []), [searchState]);
  return { ...snapshot, error: snapshot.error ?? searchError ?? watchError, query, setQuery: owner.setQuery, search: searchState, matches, toggleDir: owner.toggleDir, openFile: owner.openFile, closePreview: owner.closePreview, closeFile: owner.closeFile, activate: owner.activate, pin: owner.pin, setMode: owner.setMode, savePosition: owner.savePosition, toggleTree: owner.toggleTree, setTreeWidth: owner.setTreeWidth, refresh: () => { if (root) owner.refresh(root); } };
}
const NO_SUBSCRIBE = () => () => {};
const NULL_SNAPSHOT = () => null;
