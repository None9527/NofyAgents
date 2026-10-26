import type { Effect } from "../../core/effects.ts";
import { serviceResponse } from "../../core/service-actions.ts";
export type RewindPoint = { promptIndex: number; preview: string; hasFileChanges: boolean; snapshotCount: number };
export function parseRewindPoints(value: unknown): RewindPoint[] {
  const result = serviceResponse(value);
  const rows = Array.isArray(result["rewind_points"]) ? result["rewind_points"] : [];
  return rows.flatMap(row => {
    if (!row || typeof row !== "object") return [];
    const r = row as Record<string, unknown>;
    return typeof r["prompt_index"] === "number" ? [{ promptIndex: r["prompt_index"], preview: typeof r["prompt_preview"] === "string" ? r["prompt_preview"] : "", hasFileChanges: r["has_file_changes"] === true, snapshotCount: typeof r["num_file_snapshots"] === "number" ? r["num_file_snapshots"] : 0 }] : [];
  });
}
export type RewindMode = "conversation_only" | "files_only" | "all";
/** Kernel force:false is read-only preview; force:true is commit, even for conversation_only. */
export function rewindEffect(sessionId: string, point: RewindPoint, mode: RewindMode, phase: "preview" | "commit" = "preview"): Effect {
  if (mode !== "conversation_only" && !point.hasFileChanges) throw new Error("This checkpoint has no file snapshots");
  return { kind: "service/request", operation: "rewindExecute", params: { sessionId, targetPromptIndex: point.promptIndex, force: phase === "commit", mode } };
}
export function forkAtTurnEffect(sessionId: string, cwd: string, promptIndex?: number): Effect {
  return { kind: "service/request", operation: "sessionFork", params: { sourceSessionId: sessionId, sourceCwd: cwd, newCwd: cwd, ...(promptIndex === undefined ? {} : { targetPromptIndex: promptIndex }) } };
}

export type RewindPreview = { valid: boolean; cleanFiles: string[]; conflicts: Array<{ path: string; type: string }>; error: string | null };
export function readRewindPreview(value: unknown, promptIndex: number, mode: RewindMode): RewindPreview {
  const response = serviceResponse(value);
  const clean = response["clean_files"];
  const conflicts = response["conflicts"];
  const valid = response["success"] === false && response["target_prompt_index"] === promptIndex && response["mode"] === mode && Array.isArray(clean) && clean.every(path => typeof path === "string") && Array.isArray(conflicts) && conflicts.every(item => item && typeof item === "object" && typeof (item as Record<string, unknown>)["path"] === "string" && typeof (item as Record<string, unknown>)["conflict_type"] === "string");
  return {
    valid,
    cleanFiles: Array.isArray(clean) ? clean.filter((path): path is string => typeof path === "string") : [],
    conflicts: Array.isArray(conflicts) ? conflicts.flatMap(item => item && typeof item === "object" && typeof (item as Record<string, unknown>)["path"] === "string" ? [{ path: String((item as Record<string, unknown>)["path"]), type: String((item as Record<string, unknown>)["conflict_type"] ?? "unknown") }] : []) : [],
    error: typeof response["error"] === "string" ? response["error"] : valid ? null : "Invalid rewind preview response",
  };
}
export function canCommitRewind(preview: RewindPreview): boolean {
  return preview.valid && preview.conflicts.length === 0 && preview.error === null;
}
export function sameRewindScope(first: RewindPreview, next: RewindPreview): boolean {
  return canCommitRewind(first) && canCommitRewind(next) && JSON.stringify([...first.cleanFiles].sort()) === JSON.stringify([...next.cleanFiles].sort());
}
