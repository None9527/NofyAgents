import { useEffect, useRef, useState } from "react";
import type { DesktopClient } from "../contracts/public.ts";
import { tr } from "../../ui/i18n.ts";
import { loadSessionMetadata, saveSessionMetadata } from "./sessionMetadataPrefs.ts";
import { forgetSessionMetadata, markSessionRead, renameSessionGroup, updateSessionMetadata } from "./sessionMetadataModel.ts";
import type { SessionMetadataPatch } from "./sessionMetadataModel.ts";
export function useSessionMetadata(client: DesktopClient, activeId: string | null, onError: (message: string) => void) {
  const [prefs, setPrefs] = useState(loadSessionMetadata);
  const latest = useRef(prefs); latest.current = prefs;
  useEffect(() => { if (!saveSessionMetadata(prefs)) onError(tr("无法保存本地会话偏好")); }, [prefs]);
  useEffect(() => { if (activeId) setPrefs(p => markSessionRead(p, activeId)); }, [activeId]);
  return {
    prefs,
    change: (id: string, patch: SessionMetadataPatch) => {
      const state = client.projection.getState();
      const session = state.sessions[id]; const activity = state.roster[id]?.activity;
      const busy = (session !== undefined && session.agentState !== "idle") || activity === "working" || activity === "needs_input";
      const result = updateSessionMetadata(latest.current, id, patch, busy);
      if (result.error) { onError(tr(result.error)); return; }
      latest.current = result.prefs; setPrefs(result.prefs);
    },
    markRead: (id: string) => setPrefs(p => markSessionRead(p, id)),
    forget: (id: string) => setPrefs(p => forgetSessionMetadata(p, id)),
    renameGroup: (from: string, to: string | null) => setPrefs(p => renameSessionGroup(p, from, to)),
  };
}
