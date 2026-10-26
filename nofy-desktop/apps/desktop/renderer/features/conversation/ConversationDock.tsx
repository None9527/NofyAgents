import { useMemo } from "react";
import type { ReactNode } from "react";
import type { Projection } from "../../application/contracts/public.ts";
import { createApprovalSelector } from "../../application/shell/public.ts";
import { useProjection } from "../../application/projection/public.ts";
/** Blocking interactions replace input visually while the editor stays mounted. */
export function ConversationDock({ projection, cancelOpen, children }: { projection: Projection; cancelOpen: boolean; children: ReactNode }) {
  const select = useMemo(createApprovalSelector, []);
  const approvals = useProjection(projection, select);
  return <div className="conversation-dock" data-blocked={cancelOpen || approvals.items.length > 0 ? "true" : "false"}>{children}</div>;
}
