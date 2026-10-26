import { useEffect, useState } from "react";
import type { WorkspaceClient } from "../contracts/public.ts";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";
import { decodeWorkspacePrefs, rememberWorkspace } from "./workspaceModel.ts";

export function useWorkspace(runtime: WorkspaceClient, bootCwd: string | null, activeCwd: string | null, onError: (message: string) => void) {
  const [prefs, setPrefs] = useState(() => decodeWorkspacePrefs(readPreference("workspaces")));
  const [busy, setBusy] = useState(false);
  const [validatedCwd, setValidatedCwd] = useState<string | null>(null);
  useEffect(() => { writePreference("workspaces", prefs); }, [prefs]);
  useEffect(() => {
    if (activeCwd) setPrefs((p) => p.selected === activeCwd ? p : rememberWorkspace(p, activeCwd));

  }, [bootCwd, activeCwd]);
  useEffect(() => {
    if (activeCwd || !bootCwd) return;
    let cancelled = false;
    setValidatedCwd(null);
    const selected = prefs.selected ?? bootCwd;
    void (async () => {
      try {
        const path = await runtime.validateDirectory(selected);
        if (!cancelled) setValidatedCwd(path);
      } catch (e) {
        if (cancelled) return;
        onError(e instanceof Error ? e.message : String(e));
        if (selected !== bootCwd) {
          try {
            const fallback = await runtime.validateDirectory(bootCwd);
            if (!cancelled) setPrefs(p => ({ selected: fallback, recent: [fallback, ...p.recent.filter(path => path !== selected && path !== fallback)].slice(0, 20) }));
          } catch { /* No valid fallback: require an explicit directory choice. */ }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [runtime, bootCwd, prefs.selected, activeCwd, onError]);
  const select = (cwd: string) => setPrefs((p) => rememberWorkspace(p, cwd));
  const pick = async (): Promise<string | null> => {
    if (busy) return null;
    setBusy(true);
    try {
      const cwd = await runtime.pickDirectory();
      if (cwd !== null) select(cwd);
      return cwd;
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); return null; }
    finally { setBusy(false); }
  };
  return { cwd: activeCwd ?? validatedCwd, recent: prefs.recent, select, pick, busy };
}
