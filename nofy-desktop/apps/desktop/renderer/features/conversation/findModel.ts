import type { Block } from "../../core/store/state.ts";
import { serviceResponse } from "../../core/service-actions.ts";
export type ConversationMatch = { blockId: string; turnBlockId: string; offset: number; length: number; snippet: string };
export function findInConversation(blocks: Block[], query: string): ConversationMatch[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  const matches: ConversationMatch[] = [];
  let turnBlockId = blocks[0]?.id ?? "";
  for (const block of blocks) {
    if (block.kind === "user-message") {
      turnBlockId = block.id;
      if (block.hidden) continue;
    }
    const text = block.kind === "user-message" || block.kind === "agent-message" ? block.text : block.kind === "tool-call" ? block.resultText ?? "" : "";
    const haystack = text.toLocaleLowerCase();
    let offset = haystack.indexOf(needle);
    while (offset >= 0) {
      matches.push({ blockId: block.id, turnBlockId, offset, length: needle.length, snippet: text.slice(Math.max(0, offset - 32), offset + needle.length + 64) });
      offset = haystack.indexOf(needle, offset + needle.length);
    }
  }
  return matches;
}
export type SessionSearchHit = { sessionId: string; cwd: string; summary: string; snippet: string | null; matchedFields: string[] };
export function parseSessionSearch(value: unknown): { hits: SessionSearchHit[]; nextOffset: number | null; bootstrapping: boolean } {
  const response = serviceResponse(value);
  const rows = Array.isArray(response["results"]) ? response["results"] : [];
  const hits = new Map<string, SessionSearchHit>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    if (typeof o["sessionId"] !== "string" || typeof o["cwd"] !== "string") continue;
    hits.set(o["sessionId"], { sessionId: o["sessionId"], cwd: o["cwd"], summary: typeof o["summary"] === "string" ? o["summary"] : "Untitled", snippet: typeof o["snippet"] === "string" ? o["snippet"] : null, matchedFields: Array.isArray(o["matchedFields"]) ? o["matchedFields"].filter((x): x is string => typeof x === "string") : [] });
  }
  return { hits: [...hits.values()], nextOffset: typeof response["nextOffset"] === "number" ? response["nextOffset"] : null, bootstrapping: response["bootstrapping"] === true };
}
