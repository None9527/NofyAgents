import { useEffect, useState } from "react";
import type { SessionState } from "../../core/store/state.ts";
import { appendUsageLedger, dayKey, loadUsageLedger } from "../../ui/usageLedger.ts";
export function useUsageLedger(active: Pick<SessionState, "id" | "modelId" | "turnUsage"> | null) {
  const [entries, setEntries] = useState(loadUsageLedger);
  const usage = active?.turnUsage ?? null;
  useEffect(() => {
    if (!usage || !active || usage.numTurns <= 0) return;
    const wrote = appendUsageLedger({ k: active.id + ":" + usage.numTurns, d: dayKey(new Date()), m: active.modelId ?? "unknown", t: usage.totalTokens, i: usage.inputTokens, o: usage.outputTokens, c: usage.cachedReadTokens, r: usage.reasoningTokens, mc: usage.modelCalls, ms: usage.apiDurationMs });
    if (wrote) setEntries(loadUsageLedger());
  }, [usage, active?.id, active?.modelId]);
  return entries;
}
