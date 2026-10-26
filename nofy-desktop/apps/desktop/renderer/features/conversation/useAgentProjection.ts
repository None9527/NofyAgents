import { useRef } from "react";
import { agentBlocks, isAgentBlock, isAgentPollBlock, linkedPollBlockIds } from "./agentModel.ts";
import type { AgentBlockView } from "./agentModel.ts";
import type { Block } from "../../core/store/state.ts";
import type { ConversationSession } from "../../application/conversation/public.ts";
export function useAgentProjection(session: ConversationSession | null) {
  const cache = useRef<{ blocks: Block[] | null; finished: unknown; sources: Block[]; views: Map<string, AgentBlockView>; linked: Set<string> }>({ blocks: null, finished: null, sources: [], views: new Map(), linked: new Set() });
  const current = cache.current;
  if (current.blocks !== session?.blocks || current.finished !== session?.subagentFinished) {
    const sources = session?.blocks.filter(block => isAgentBlock(block) || isAgentPollBlock(block)) ?? [];
    const unchanged = current.finished === session?.subagentFinished && sources.length === current.sources.length && sources.every((block, i) => block === current.sources[i]);
    if (!unchanged) {
      const views = new Map<string, AgentBlockView>();
      for (const view of agentBlocks(session)) {
        const previous = current.views.get(view.blockId);
        const same = previous && (Object.keys(view) as Array<keyof AgentBlockView>).every(key => view[key] === previous[key]);
        views.set(view.blockId, same ? previous : view);
      }
      current.views = views; current.linked = linkedPollBlockIds(session); current.sources = sources;
    }
    current.blocks = session?.blocks ?? null; current.finished = session?.subagentFinished;
  }
  return { views: current.views, linked: current.linked };
}
