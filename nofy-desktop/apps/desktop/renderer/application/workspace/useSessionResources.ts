import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { DesktopClient } from "../contracts/public.ts";
import type { ContextInfo, GitStatus } from "../../ui/readers.ts";
import { createResource } from "./resource.ts";
export function useSessionResources(client: DesktopClient, id: string | null, ready: boolean, epoch: number) {
  const resources = useMemo(() => {
    const valid = () => { const s = client.projection.getState(); return id !== null && ready && s.activeSessionId === id && s.connection.status === "ready" && s.connection.transportEpoch === epoch; };
    return {
      context: createResource<ContextInfo | null>(null, () => id ? client.workspace.context(id) : Promise.resolve(null), valid),
      git: createResource<GitStatus | null>(null, () => id ? client.workspace.git(id) : Promise.resolve(null), valid),
    };
  }, [client, id, ready, epoch]);
  const context = useSyncExternalStore(resources.context.subscribe, resources.context.getSnapshot);
  const git = useSyncExternalStore(resources.git.subscribe, resources.git.getSnapshot);
  useEffect(() => {
    if (!ready || id === null) return;
    void resources.context.refresh(); void resources.git.refresh(); void client.sessions.refreshRoster();
    // 对账只跟会话就绪或传输代际走一次。放进 git 的 15 秒轮询会把现场行重新标成回放。
    void client.tasks.reconcile(id);
    const ctxTimer = setInterval(() => { void resources.context.refresh(); }, 6000);
    const gitTimer = setInterval(() => { void resources.git.refresh(); }, 15000);
    return () => { clearInterval(ctxTimer); clearInterval(gitTimer); resources.context.dispose(); resources.git.dispose(); };
  }, [client, id, ready, resources]);
  return { ctx: context.value, git: git.value, gitBusy: git.busy, gitError: git.error, refreshGit: resources.git.refresh };
}
