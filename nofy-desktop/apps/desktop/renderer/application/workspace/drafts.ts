import type { Attachment as AttachItem } from "../contracts/public.ts";
export type Draft = { text: string; attach: AttachItem[] };
export type Drafts = Record<string, Draft>;
export function draftKey(sessionId: string | null, cwd: string | null): string {
  return sessionId === null ? "workspace:" + (cwd ?? "") : "session:" + sessionId;
}
export function decodeDrafts(value: unknown): Drafts {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Drafts = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === null || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.text !== "string") continue;
    const attach: AttachItem[] = [];
    for (const a of Array.isArray(item.attach) ? item.attach : []) {
      if (a === null || typeof a !== "object") continue;
      const o = a as Record<string, unknown>;
      if (typeof o.path === "string" && typeof o.name === "string" && (o.kind === "file" || o.kind === "directory" || o.kind === "other")) attach.push({ path: o.path, name: o.name, kind: o.kind });
    }
    out[key] = { text: item.text, attach };
  }
  return out;
}
export function clearSubmittedDraft(drafts: Drafts, key: string, sent: Draft): Drafts {
  const current = drafts[key];
  if (current === undefined || current.text !== sent.text || JSON.stringify(current.attach) !== JSON.stringify(sent.attach)) return drafts;
  const next = { ...drafts };
  delete next[key];
  return next;
}
