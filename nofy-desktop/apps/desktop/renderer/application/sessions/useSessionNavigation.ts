import { tr } from "../../ui/i18n.ts";
import { useEffect, useRef, useState } from "react";
import type { ShellState } from "../shell/public.ts";
import type { DesktopClient } from "../contracts/public.ts";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";

export function useSessionNavigation(runtime: DesktopClient, state: ShellState, cwd: string | null, onError: (message: string) => void) {
  const latest = useRef(0);
  const initialized = useRef(false);
  const [busy, setBusy] = useState(false);
  const create = async (directory = cwd): Promise<void> => {
    if (directory === null) return;
    const token = ++latest.current;
    setBusy(true);
    try {
      const res = await runtime.sessions.create(directory);
      if (token !== latest.current) return;
      if (!res.ok) { onError(tr("创建会话失败：") + res.error); return; }
      if (typeof res.value === "string") runtime.sessions.activate(res.value);
    } finally { if (token === latest.current) setBusy(false); }
  };
  const activate = async (sessionId: string, directory?: string): Promise<boolean> => {
    const token = ++latest.current;
    setBusy(true);
    try {
      const snapshot = runtime.projection.getState();
      if (snapshot.sessions[sessionId] === undefined) {
        const path = directory ?? snapshot.roster[sessionId]?.cwd;
        if (!path) { onError(tr("无法定位该会话的项目目录")); return false; }
        const res = await runtime.sessions.load(sessionId, path);
        if (!res.ok) { if (token === latest.current) onError(tr("载入会话失败：") + res.error); return false; }
      }
      if (token !== latest.current) return false;
      runtime.sessions.activate(sessionId);
      return true;
    } finally { if (token === latest.current) setBusy(false); }
  };
  useEffect(() => {
    if (state.connection.status !== "ready" || cwd === null || initialized.current) return;
    initialized.current = true;
    const saved = readPreference("last-session");
    const previous = saved !== null && typeof saved === "object" ? saved as Record<string, unknown> : {};
    const token = latest.current;
    void (async () => {
      if (typeof previous.id === "string" && typeof previous.cwd === "string") {
        try { await runtime.workspace.validateDirectory(previous.cwd); }
        catch {
          if (latest.current === token) {
            writePreference("last-session", null);
            onError(tr("上次会话的工作区已失效，历史仍保留；已切换到有效目录。"));
            await create(cwd);
          }
          return;
        }
        if (latest.current !== token) return;
        const ok = await activate(previous.id, previous.cwd);
        if (!ok && latest.current === token + 1) await create(cwd);
      } else if (latest.current === token && state.activeSessionId === null) await create(cwd);
    })();
  }, [state.connection.status, cwd]);
  const active = state.activeSessionId === null ? null : state.sessions[state.activeSessionId];
  useEffect(() => {
    if (active?.cwd) writePreference("last-session", { id: active.id, cwd: active.cwd });
  }, [active?.id, active?.cwd]);
  const wasReady = useRef(false);
  useEffect(() => {
    const ready = state.connection.status === "ready";
    if (ready && !wasReady.current && initialized.current && active?.cwd) {
      void runtime.sessions.load(active.id, active.cwd).then((res) => { if (!res.ok) onError(tr("恢复会话失败：") + res.error); });
    }
    wasReady.current = ready;
  }, [state.connection.status]);
  return { create, activate, busy };
}
