import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { useProjection, selectConnection } from "../projection/public.ts";
import { createResource } from "./resourceCache.ts";
import type { SettingsResourceName } from "./contracts.ts";
import { settingsClientFor } from "./client.ts";
const caches = new WeakMap<Runtime, Map<string, ReturnType<typeof createResource<unknown>>>>();
function resourceFor(runtime: Runtime, name: SettingsResourceName, sessionId: string | null, cwd: string | null, epoch: number) {
  let cache = caches.get(runtime);
  if (!cache) { cache = new Map(); caches.set(runtime, cache); }
  const sessionScoped = ["plugins", "mcp", "hooks"].includes(name);
  const key = JSON.stringify([name, sessionScoped ? sessionId : null, name === "skills" ? cwd : null, epoch]);
  const existing = cache.get(key);
  if (existing) return existing;
  const resource = createResource<unknown>(async () => {
    const client = settingsClientFor(runtime);
    return name === "model-config" ? client.models.read() : client.catalog.read(name,sessionId,cwd);
  });
  cache.set(key, resource);
  if (cache.size > 32) cache.delete(cache.keys().next().value!);
  return resource;
}
/** Identity follows native config across restarts; kernel resources follow transport epoch. */
export function useSettingsResource(runtime: Runtime, name: SettingsResourceName, sessionId: string | null = null, cwd: string | null = null, enabled = true, revision?: unknown) {
  const connection = useProjection(runtime.store, selectConnection);
  const epoch = name === "model-config" ? 0 : connection.transportEpoch;
  const resource = useMemo(() => resourceFor(runtime, name, sessionId, cwd, epoch), [runtime, name, sessionId, cwd, epoch]);
  const allowed = enabled && (name === "model-config" || connection.status === "ready") && (!["plugins", "mcp", "hooks"].includes(name) || sessionId !== null) && (name !== "skills" || cwd !== null);
  const last = useRef({ resource, revision });
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getSnapshot);
  useEffect(() => {
    const changed = last.current.resource === resource && last.current.revision !== revision;
    last.current = { resource, revision };
    if (changed) resource.invalidate();
    if (allowed) void resource.load(changed);
  }, [resource, revision, allowed]);
  return { ...snapshot, data: allowed ? snapshot.data : null, refresh: async () => { await resource.load(true); return resource.getSnapshot(); } };
}
