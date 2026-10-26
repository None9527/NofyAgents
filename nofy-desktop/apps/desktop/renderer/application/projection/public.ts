import { useMemo, useSyncExternalStore } from "react";
import { selectFrameView, sharedFrameView } from "../../ui/frameStore.ts";
import type { AppState } from "../../core/store/state.ts";
import type { Projection } from "../contracts/public.ts";
export function useProjection<T>(source: Projection, select: (state: AppState) => T): T {
  const view = useMemo(() => selectFrameView(sharedFrameView(source), select), [source, select]);
  return useSyncExternalStore(view.subscribe, view.getSnapshot, view.getSnapshot);
}
export const selectSearch = (state: AppState) => state.search;
export const selectConnection = (state: AppState) => state.connection;
export const selectActiveSession = (state: AppState) => state.activeSessionId === null ? null : state.sessions[state.activeSessionId] ?? null;
