import type { TurnSegment } from "./turns.ts";
export const VIRTUAL_TURN_THRESHOLD = 200;
export const CONVERSATION_OVERSCAN = 8;
export function segmentIndexForBlock(segments: TurnSegment[], blockId: string): number {
  return segments.findIndex(segment => segment.user?.id === blockId || segment.final?.id === blockId || segment.middle.some(block => block.id === blockId) || segment.following?.some(block => block.id === blockId));
}
export function addPinnedIndex(indexes: number[], pinned: number): number[] {
  return pinned < 0 || indexes.includes(pinned) ? indexes : [...indexes, pinned].sort((a, b) => a - b);
}
