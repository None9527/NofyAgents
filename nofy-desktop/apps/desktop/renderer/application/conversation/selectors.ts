import type { AppState, SessionState } from "../../core/store/state.ts";
export type ConversationSession = Pick<SessionState, "id" | "blocks" | "turns" | "subagentFinished" | "agentState">;
/** One selector instance per view. Metadata and other sessions cannot invalidate its snapshot. */
export function createConversationSelector() {
  let previous: ConversationSession | null = null;
  return (state: AppState): ConversationSession | null => {
    const session = state.activeSessionId === null ? null : state.sessions[state.activeSessionId] ?? null;
    if (!session) { previous = null; return null; }
    if (previous && previous.id === session.id && previous.blocks === session.blocks && previous.turns === session.turns && previous.subagentFinished === session.subagentFinished && previous.agentState === session.agentState) return previous;
    previous = { id: session.id, blocks: session.blocks, turns: session.turns, subagentFinished: session.subagentFinished, agentState: session.agentState };
    return previous;
  };
}
export const selectConversationReady = (state: AppState) => state.connection.status === "ready";
