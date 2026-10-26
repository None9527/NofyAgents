import type { DesktopClient, PendingInteraction } from "../contracts/public.ts";
import type { TaskResult } from "../../core/effects.ts";
/** Structural interface matches the approval view without depending on its implementation. */
export function useApprovalActions(client: DesktopClient, onError: (message: string | null) => void) {
  const run = (item: PendingInteraction, action: () => Promise<TaskResult>) => {
    if (!client.projection.getState().pendingInteractions.includes(item)) return;
    onError(null);
    void action().then(result => { if (!result.ok) onError(result.error); }, error => onError(error instanceof Error ? error.message : String(error)));
  };
  return {
    chooseOption: (item: PendingInteraction, option: string) => run(item, () => client.interactions.choose(item, option)),
    cancel: (item: PendingInteraction) => run(item, () => client.interactions.cancel(item)),
    trust: (item: PendingInteraction, trust: boolean) => run(item, () => client.interactions.trust(item, trust)),
    answer: (item: PendingInteraction, payload: Record<string, unknown>) => run(item, () => client.interactions.answer(item, payload)),
  };
}
