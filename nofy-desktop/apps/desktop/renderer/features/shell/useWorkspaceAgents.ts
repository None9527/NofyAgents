import { useMemo } from "react";
import type { Projection } from "../../application/contracts/public.ts";
import { createAgentSourcesSelector } from "../../application/shell/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { agentBlocks, isAgentBlock, isAgentPollBlock } from "../conversation/public.ts";
export function useWorkspaceAgents(projection: Projection) {
  const selector = useMemo(() => createAgentSourcesSelector(block => isAgentBlock(block) || isAgentPollBlock(block)), []);
  const source = useProjection(projection, selector);
  return useMemo(() => agentBlocks(source), [source]);
}
