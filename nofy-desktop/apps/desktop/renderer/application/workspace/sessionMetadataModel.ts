/** Client-owned organisation. These values never imply kernel lifecycle changes. */
export type SessionMetadata = { archived: boolean; pinned: boolean; unread: boolean; group: string | null };
export type SessionMetadataPrefs = { version: 1; sessions: Record<string, SessionMetadata> };
export type SessionMetadataPatch = Partial<SessionMetadata>;
export const EMPTY_SESSION_METADATA: SessionMetadata = { archived: false, pinned: false, unread: false, group: null };
const obj = (v: unknown): Record<string, unknown> | null => typeof v === "object" && v !== null && !Array.isArray(v) ? v as Record<string, unknown> : null;
export function normalizeGroup(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : null;
}

export function decodeSessionMetadata(value: unknown): SessionMetadataPrefs {
  const input = obj(value);
  const sessions: Record<string, SessionMetadata> = Object.create(null) as Record<string, SessionMetadata>;
  if (!input || (input.version !== undefined && input.version !== 0 && input.version !== 1)) return { version: 1, sessions };
  const source = obj(input.sessions) ?? (input.version === undefined ? input : null);
  if (source) for (const [id, raw] of Object.entries(source)) {
    if (!id || id.length > 512) continue;
    const row = obj(raw);
    if (!row) continue;
    const metadata = { archived: row.archived === true, pinned: row.pinned === true || row.isPinned === true, unread: row.unread === true, group: normalizeGroup(row.group ?? row.groupName) };
    if (metadata.archived || metadata.pinned || metadata.unread || metadata.group) sessions[id] = metadata;
  }
  return { version: 1, sessions };
}

export function metadataFor(prefs: SessionMetadataPrefs, sessionId: string): SessionMetadata {
  return Object.hasOwn(prefs.sessions, sessionId) ? prefs.sessions[sessionId]! : EMPTY_SESSION_METADATA;
}

export function updateSessionMetadata(prefs: SessionMetadataPrefs, sessionId: string, patch: SessionMetadataPatch, running = false): { prefs: SessionMetadataPrefs; error: string | null } {
  if (!sessionId) return { prefs, error: "会话身份缺失" };
  const current = metadataFor(prefs, sessionId);
  if (running && patch.archived === true && !current.archived) return { prefs, error: "请先停止当前回合，再归档会话" };
  const next = { ...current, ...patch, group: patch.group === undefined ? current.group : normalizeGroup(patch.group) };
  if (next.archived === current.archived && next.pinned === current.pinned && next.unread === current.unread && next.group === current.group) return { prefs, error: null };
  const sessions = Object.assign(Object.create(null) as Record<string, SessionMetadata>, prefs.sessions);
  if (next.archived || next.pinned || next.unread || next.group) sessions[sessionId] = next;
  else delete sessions[sessionId];
  return { prefs: { version: 1, sessions }, error: null };
}

export function markSessionRead(prefs: SessionMetadataPrefs, sessionId: string): SessionMetadataPrefs {
  return updateSessionMetadata(prefs, sessionId, { unread: false }).prefs;
}

export function renameSessionGroup(prefs: SessionMetadataPrefs, previous: string, next: string | null): SessionMetadataPrefs {
  let updated = prefs;
  for (const [id, row] of Object.entries(prefs.sessions)) if (row.group === previous) updated = updateSessionMetadata(updated, id, { group: next }).prefs;
  return updated;
}

export function forgetSessionMetadata(prefs: SessionMetadataPrefs, sessionId: string): SessionMetadataPrefs {
  if (!Object.hasOwn(prefs.sessions, sessionId)) return prefs;
  const sessions = { ...prefs.sessions }; delete sessions[sessionId];
  return { version: 1, sessions };
}
