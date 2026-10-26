/** Current-state presentation, not a playback queue. New identity replaces the pending one. */
export function summaryDelay(currentKey: string, nextKey: string, elapsed: number, live: boolean): number {
  return !live || currentKey === nextKey ? 0 : Math.max(0, 1000 - elapsed);
}
