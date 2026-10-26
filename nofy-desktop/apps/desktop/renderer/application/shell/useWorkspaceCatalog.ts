import { useEffect, useState } from "react";
import type { DesktopClient } from "../contracts/public.ts";
import { tr } from "../../ui/i18n.ts";
import { readWorkspaceCatalog } from "./workspaceCatalog.ts";
import type { WorkspaceCatalog } from "./workspaceCatalog.ts";

/** Pulls the measured workspace catalog. A failure keeps `catalog` null so the sidebar can fall back to session folders. */
export function useWorkspaceCatalog(client: DesktopClient, ready: boolean, epoch: number): { catalog: WorkspaceCatalog | null; error: string | null } {
  const [snap, setSnap] = useState<{ epoch: number; catalog: WorkspaceCatalog | null; error: string | null }>({ epoch: -1, catalog: null, error: null });
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let token = 0;
    let signature = "";
    const pull = (): void => {
      const current = ++token;
      void client.sessions.listWorkspaces().then((res) => {
        if (cancelled || current !== token) return;
        if (!res.ok) {
          setSnap({ epoch, catalog: null, error: tr("项目列表读取失败：") + res.error });
          return;
        }
        const catalog = readWorkspaceCatalog(res.value);
        setSnap(catalog ? { epoch, catalog, error: null } : { epoch, catalog: null, error: tr("项目列表响应无法读取") });
      });
    };
    const sync = (): void => {
      const next = Object.keys(client.projection.getState().roster).sort().join("\0");
      if (next === signature && token !== 0) return;
      signature = next;
      pull();
    };
    sync();
    const stop = client.projection.subscribe(sync);
    return () => {
      cancelled = true;
      stop();
    };
  }, [client, ready, epoch]);
  if (!ready || snap.epoch !== epoch) return { catalog: null, error: null };
  return { catalog: snap.catalog, error: snap.error };
}
