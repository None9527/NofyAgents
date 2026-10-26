import { memo, useMemo } from "react";
import type { DesktopClient } from "../../application/contracts/public.ts";
import { createApprovalSelector } from "../../application/shell/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { useApprovalActions } from "../../application/sessions/public.ts";
import { interactionKind } from "../../core/interactions.ts";
import { useHotkeys } from "../../ui/hotkeys.ts";
import { recordRender } from "../../ui/renderDiagnostics.ts";
import { ApprovalCard } from "./ApprovalCard.tsx";
export const ApprovalHost = memo(function ApprovalHost({ client, onError }: { client: DesktopClient; onError: (error: string | null) => void }) {
  recordRender("ApprovalHost");
  const selector = useMemo(createApprovalSelector, []);
  const { items, epoch } = useProjection(client.projection, selector);
  const handlers = useApprovalActions(client, onError);
  const first = items[0];
  const kind = first ? interactionKind(first.method) : null;
  useHotkeys(first && (kind === "permission" || kind === "ask-user") ? { Escape: () => handlers.cancel(first) } : {});
  return <>{items.map(item => <ApprovalCard key={String(epoch) + ":" + String(item.id)} item={item} handlers={handlers} />)}</>;
});
