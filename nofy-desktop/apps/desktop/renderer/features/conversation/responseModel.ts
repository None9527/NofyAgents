import type { Block, TurnRecord } from "../../core/store/state.ts";

/** Keep seconds visible even after a minute; endedAt freezes the clock. */
export function turnClock(turn: TurnRecord, now: number, locale: string): string {
  const seconds = Math.max(0, Math.floor(((turn.endedAt ?? now) - turn.startedAt) / 1000));
  const h = Math.floor(seconds / 3600), m = Math.floor(seconds / 60) % 60, s = seconds % 60;
  const units = locale === "en" ? ["h", "m", "s"] : ["时", "分", "秒"];
  return [h ? `${h} ${units[0]}` : null, h || m ? `${m} ${units[1]}` : null, `${s} ${units[2]}`].filter(Boolean).join(" ");
}
export type HookRun = { id: string; event: string; name: string; status: "success" | "failed" | "blocked" | "skipped" | "unknown"; elapsedMs: number | null; error: string | null; output: string | null };
/** Read HookRunEntryDto, including the nested tagged HookRunStatusDto. No guessed success. */
export function turnHookRuns(blocks: readonly Block[]): HookRun[] {
  const seen = new Set<string>();
  return blocks.flatMap(block => {
    if (block.kind !== "event" || !block.tag.startsWith("hook:") || seen.has(block.id)) return [];
    seen.add(block.id);
    if (!Array.isArray(block.payload)) return [];
    return block.payload.flatMap((value: unknown, index: number): HookRun[] => {
      if (!value || typeof value !== "object") return [];
      const row = value as Record<string, unknown>;
      if (typeof row.name !== "string") return [];
      const state = row.status && typeof row.status === "object" ? row.status as Record<string, unknown> : {};
      const status = state.status === "failed" && state.blocked === true ? "blocked" : ["success", "failed", "skipped"].includes(String(state.status)) ? state.status as HookRun["status"] : "unknown";
      return [{ id: `${block.id}:${index}`, event: block.tag.slice(5), name: row.name, status,
        elapsedMs: typeof state.elapsed_ms === "number" && Number.isFinite(state.elapsed_ms) ? state.elapsed_ms : null,
        error: typeof state.error === "string" ? state.error : null, output: typeof row.output === "string" ? row.output : null }];
    });
  });
}
