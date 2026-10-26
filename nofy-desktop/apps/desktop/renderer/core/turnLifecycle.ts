import type { SessionState, TurnFeedback } from './store/state.ts';
/** Turn outcome is independent from individual tool failures. */
export function finishTurn(session: SessionState, reason: string, at: number, message?: string): SessionState {
  return {
    ...session, agentState: 'idle', stopReason: reason,
    openAgentBlockId: null,
    turns: session.turns.map((turn, i) => i !== session.turns.length - 1 ? turn : {
      ...turn, endedAt: turn.endedAt ?? Math.max(turn.startedAt, at),
      feedback: reason === 'error' ? (turn.feedback?.kind === 'failed' ? turn.feedback : { kind: 'failed', message: message || '本轮请求未完成。', at }) : undefined,
    }),
    blocks: session.blocks.map(block => {
      if ((block.kind === 'agent-message' || block.kind === 'agent-thought') && !block.closed) return { ...block, closed: true };
      if (block.kind === 'tool-call' && (block.interactionPending || ['running', 'in_progress', 'pending'].includes(block.status ?? ''))) return { ...block, status: 'interrupted', interactionPending: false };
      return block;
    }),
  };
}
export function turnFeedback(session: SessionState, feedback: TurnFeedback): SessionState {
  if (!session.turns.length) return session;
  return { ...session, turns: session.turns.map((turn, i) => i === session.turns.length - 1 ? { ...turn, feedback } : turn) };
}
export function resumeTurn(session: SessionState): SessionState {
  if (session.turns.at(-1)?.feedback?.kind !== 'retrying') return session;
  return { ...session, turns: session.turns.map((turn, i) => i === session.turns.length - 1 ? { ...turn, feedback: undefined } : turn) };
}
