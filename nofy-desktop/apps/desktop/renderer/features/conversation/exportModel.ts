import type { Block, SessionState } from "../../core/store/state.ts";
import { buildTurnSegments } from "./spineModel.ts";

function exportBlock(block: Block): string {
  if (block.kind === "agent-message") return block.text;
  if (block.kind === "tool-call") return `### Tool: ${block.title ?? block.name ?? "tool"}\n\nStatus: ${block.status ?? "unknown"}\n\n${block.resultText ?? "(No text result)"}`;
  return "";
}
/** Only projected human-facing text. Raw input/output, events, thoughts and protocol metadata are excluded. */
export function exportLoadedConversation(session: SessionState): { filename: string; text: string } {
  const lines = [`# ${(session.title ?? "Conversation").replace(/[\r\n]/g, " ")}`, "", "> Scope: currently loaded conversation. This export does not assert complete historical coverage.", ""];
  for (const [index, segment] of buildTurnSegments(session.blocks, session.turns).entries()) {
    lines.push(`## Turn ${index + 1}`, "");
    if (segment.user && segment.user.hidden !== true) lines.push("### User", "", segment.user.text, "");
    for (const block of segment.middle) {
      const text = exportBlock(block);
      if (text) lines.push(text, "");
    }
    if (segment.final) lines.push("### Assistant", "", exportBlock(segment.final), "");
    for (const block of segment.following ?? []) {
      const text = exportBlock(block);
      if (text) lines.push(text, "");
    }
  }
  return { filename: `conversation-${session.id.replace(/[^\w-]/g, "_")}.md`, text: lines.join("\n") };
}
