/** ACP Plan.entries is emitted by acp_plan_update; unknown shapes stay diagnosable. */
export function planEntries(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("entries" in payload) || !Array.isArray(payload.entries)) return null;
  const entries: Array<{ content: string; status: "pending" | "in_progress" | "completed" | "unknown" }> = [];
  for (const entry of payload.entries) {
    if (!entry || typeof entry !== "object" || typeof entry.content !== "string") return null;
    entries.push({ content: entry.content, status: ["pending", "in_progress", "completed"].includes(entry.status) ? entry.status : "unknown" });
  }
  return entries;
}
