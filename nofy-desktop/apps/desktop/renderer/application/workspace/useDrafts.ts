import { useEffect, useState } from "react";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";
import { clearSubmittedDraft, decodeDrafts, draftKey } from "./drafts.ts";
import type { Draft } from "./drafts.ts";
import type { Attachment } from "../contracts/public.ts";
const EMPTY: Draft = { text: "", attach: [] };
export function useDrafts(sessionId: string | null, cwd: string | null) {
  const [drafts, setDrafts] = useState(() => decodeDrafts(readPreference("drafts")));
  useEffect(() => { writePreference("drafts", drafts); }, [drafts]);
  const key = draftKey(sessionId, cwd);
  const current = drafts[key] ?? EMPTY;
  return {
    key, current,
    setText: (text: string) => setDrafts(all => ({ ...all, [key]: { text, attach: all[key]?.attach ?? [] } })),
    setAttachments: (attach: Attachment[]) => setDrafts(all => ({ ...all, [key]: { text: all[key]?.text ?? "", attach } })),
    clearSubmitted: (id: string, sent: Draft) => setDrafts(all => clearSubmittedDraft(all, id, sent)),
    forget: (id: string) => setDrafts(all => { const next = { ...all }; delete next[draftKey(id, null)]; return next; }),
    restore: (id: string, text: string) => setDrafts(all => ({ ...all, [draftKey(id, null)]: { text, attach: [] } })),
  };
}
