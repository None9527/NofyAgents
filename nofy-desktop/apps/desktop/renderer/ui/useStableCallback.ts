import { useCallback, useLayoutEffect, useRef } from "react";
/** Stable event identity, latest committed closure; never used to mask changed data props. */
export function useStableCallback<A extends unknown[], R>(callback: ((...args: A) => R) | undefined): ((...args: A) => R) | undefined {
  const current = useRef(callback);
  useLayoutEffect(() => { current.current = callback; }, [callback]);
  const stable = useCallback((...args: A) => current.current!(...args), []);
  return callback ? stable : undefined;
}
