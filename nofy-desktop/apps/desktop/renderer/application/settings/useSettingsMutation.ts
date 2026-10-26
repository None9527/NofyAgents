import { useEffect, useRef, useState } from "react";
import type { SettingsResult } from "./contracts.ts";
/** Form lifecycle owns UI busy/error; the client owns protocol and mutation identity. */
export function useSettingsMutation(identity: string, currentIdentity: () => string) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const mounted = useRef(false);
  const latest = useRef({ identity, revision: 0 });
  if (latest.current.identity !== identity) latest.current = { identity, revision: latest.current.revision + 1 };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { setNotice(""); }, [identity]);
  const run = async (work: () => Promise<SettingsResult>, apply: (result: SettingsResult) => void) => {
    if (lock.current) return;
    const target = identity;
    const revision = latest.current.revision;
    lock.current = true; setBusy(true); setNotice("");
    try {
      const result = await work();
      if (!mounted.current || latest.current.identity !== target || latest.current.revision !== revision || currentIdentity() !== target) return;
      if (result.kind === "error") { setNotice(result.message); return; }
      apply(result);
    } catch (error) { if (mounted.current && latest.current.identity === target && latest.current.revision === revision && currentIdentity() === target) setNotice(error instanceof Error ? error.message : String(error)); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  return { busy, notice, setNotice, run };
}
