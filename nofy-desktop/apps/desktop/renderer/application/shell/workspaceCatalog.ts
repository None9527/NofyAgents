/** Measured `_nofy/session_summaries/workspace_list` body: `{ all_sessions: { [cwd]: Summary[] } }`. */
export type WorkspaceCatalogSession = {
  sessionId: string;
  cwd: string;
  title: string | null;
  at: number | null;
};

export type WorkspaceCatalog = {
  sessions: WorkspaceCatalogSession[];
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function time(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Returns null when `all_sessions` is missing or a group is not an array. Empty map is a real empty catalog. */
export function readWorkspaceCatalog(value: unknown): WorkspaceCatalog | null {
  const root = record(value);
  if (!root) return null;
  const nested = record(root["result"]);
  const body = nested && Object.hasOwn(nested, "all_sessions") ? nested : root;
  const all = record(body["all_sessions"]);
  if (!all) return null;
  const sessions: WorkspaceCatalogSession[] = [];
  const seen = new Set<string>();
  for (const [key, rows] of Object.entries(all)) {
    if (!Array.isArray(rows)) return null;
    for (const row of rows) {
      const item = record(row);
      if (!item) continue;
      const info = record(item["info"]);
      const sessionId = text(info?.["id"]);
      if (!sessionId || seen.has(sessionId)) continue;
      seen.add(sessionId);
      sessions.push({
        sessionId,
        cwd: text(info?.["cwd"]) ?? text(key) ?? "",
        title: text(item["generated_title"]) ?? text(item["session_summary"]),
        at: time(item["updated_at"]),
      });
    }
  }
  return { sessions };
}
