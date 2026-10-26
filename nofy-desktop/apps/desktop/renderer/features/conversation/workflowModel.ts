import type { Block } from "../../core/store/state.ts";
import type { TurnSegment } from "./spineModel.ts";
import { isConversationBlockVisible } from "../../application/conversation/public.ts";

/** Rendering policy sits above protocol blocks: chronological content is never reordered. */
export function presentWorkSegment(segment: TurnSegment, hidden: ReadonlySet<string> = new Set()) {
  const ordered = [...segment.middle, ...(segment.final ? [segment.final] : []), ...(segment.following ?? [])]
    .filter(block => isConversationBlockVisible(block) && !hidden.has(block.id) && !(block.kind === 'event' && block.tag === 'prompt-error'))
    // Providers can send whitespace-only message chunks between tool/reasoning
    // phases. Keep the data, but allocate no prose padding or empty answer bar.
    .filter(block => !((block.kind === 'agent-message' || block.kind === 'agent-thought') && !block.text.trim()))
    .filter((block, index, blocks) => {
      const next = blocks[index + 1];
      // A successful plan tool is represented by its following structured plan.
      return !(block.kind === 'tool-call' && ['success', 'completed'].includes(block.status ?? '') &&
        /^(updating plan|update_plan|todo_write|todowrite)$/i.test(block.name ?? block.title ?? '') && next?.kind === 'event' && next.tag === 'plan');
    });
  const tail = ordered.at(-1);
  // Without a protocol final-answer marker, only a completed tail text is a safe final answer.
  const answer = !segment.running && tail?.kind === 'agent-message' && tail.closed ? tail : null;
  // Errors and pending user interactions survive manual and automatic whole-turn folding.
  const persistent = new Set(ordered.filter(block => block.kind === 'tool-call' &&
    (block.interactionPending || ['failed', 'error', 'cancelled', 'canceled', 'interrupted'].includes(block.status ?? ''))).map(block => block.id));
  const history = new Set(ordered.filter(block => block !== answer && !persistent.has(block.id)).map(block => block.id));
  const abnormal = segment.turn?.feedback?.kind === 'failed' || ordered.some(block => block.kind === 'tool-call' && ['cancelled', 'canceled', 'interrupted'].includes(block.status ?? ''));
  const phase = !segment.running ? 'settled' : tail?.kind === 'agent-message' ? 'responding' : 'working';
  return { ordered, answer, history, persistent, phase, defaultOpen: segment.running || abnormal || answer === null } as const;
}

export function latestReasoningLine(text: string) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  for (let i = lines.length - 1; i >= 0; i--) if (lines[i]!.trim()) return { key: String(i), text: lines[i]!.trim() };
  return null;
}
