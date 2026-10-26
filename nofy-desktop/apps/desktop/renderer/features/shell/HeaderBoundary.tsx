import { useMemo } from "react";
import type { ComponentProps } from "react";
import type { Projection } from "../../application/contracts/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { CardHeader } from "./CardHeader.tsx";
export function HeaderBoundary({ projection, ...props }: Omit<ComponentProps<typeof CardHeader>, "blockCount"> & { projection: Projection }) {
  const selector = useMemo(() => (state: ReturnType<Projection["getState"]>) => state.activeSessionId ? state.sessions[state.activeSessionId]?.blocks.length ?? 0 : 0, []);
  const count = useProjection(projection, selector);
  return <CardHeader {...props} blockCount={count} />;
}
