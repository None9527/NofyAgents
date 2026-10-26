import { useSyncExternalStore } from "react";
import { sharedFrameView } from "./frameStore.ts";
export function useFrameState<S>(store: { getState: () => S; subscribe: (fn: () => void) => () => void }): S {
  const view = sharedFrameView(store);
  return useSyncExternalStore(view.subscribe, view.getSnapshot, view.getSnapshot);
}
