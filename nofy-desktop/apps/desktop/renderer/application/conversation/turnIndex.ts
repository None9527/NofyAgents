import type { Block, TurnRecord } from "../../core/store/state.ts";
import { buildTurnSegments } from "./turns.ts";
import type { TurnSegment } from "./turns.ts";
type Range = { start: number; ordinal: number; segment: TurnSegment };
const same = (a: TurnSegment, b: TurnSegment) => a.key === b.key && a.user === b.user && a.turn === b.turn && a.final === b.final && a.running === b.running && a.middle.length === b.middle.length && a.middle.every((block, index) => block === b.middle[index]) && (a.following?.length ?? 0) === (b.following?.length ?? 0) && (a.following ?? []).every((block, index) => block === b.following?.[index]);
/** Incremental immutable read model. Scan references for dirty boundaries, regroup only the suffix. */
export function createTurnIndex() {
  let previousBlocks: Block[] = [], previousTurns: TurnRecord[] = [];
  let ranges: Range[] = [], segments: TurnSegment[] = [];
  let stats = { regroupedBlocks: 0, reusedSegments: 0 };
  return {
    read: (blocks: Block[], turns: TurnRecord[]): TurnSegment[] => {
      if (blocks === previousBlocks && turns === previousTurns) return segments;
      let dirty = 0;
      const common = Math.min(blocks.length, previousBlocks.length);
      while (dirty < common && blocks[dirty] === previousBlocks[dirty]) dirty++;
      let turnDirty = 0;
      while (turnDirty < Math.min(turns.length, previousTurns.length) && turns[turnDirty] === previousTurns[turnDirty]) turnDirty++;
      if (turnDirty < turns.length || turnDirty < previousTurns.length) {
        const range = ranges.find(range => range.segment.user !== null && range.ordinal === turnDirty);
        if (range) dirty = Math.min(dirty, range.start);
      }
      const at = ranges.findLastIndex(range => range.start <= dirty);
      const prefix = at < 0 ? [] : ranges.slice(0, at);
      const start = at < 0 ? 0 : ranges[at]!.start;
      const ordinal = at < 0 ? 0 : ranges[at]!.ordinal;
      const fresh = buildTurnSegments(blocks.slice(start), turns.slice(ordinal));
      const old = new Map(ranges.map(range => [range.segment.key, range.segment]));
      let reused = prefix.length;
      const merged = fresh.map(segment => { const existing = old.get(segment.key); if (existing && same(existing, segment)) { reused++; return existing; } return segment; });
      const starts: number[] = [];
      for (let i = start; i < blocks.length; i++) if (i === start || blocks[i]?.kind === "user-message") starts.push(i);
      let nextOrdinal = ordinal;
      ranges = [...prefix, ...merged.map((segment, i) => ({ start: starts[i] ?? start, ordinal: segment.user ? nextOrdinal++ : nextOrdinal, segment }))];
      const next = ranges.map(range => range.segment);
      if (next.length !== segments.length || next.some((segment, i) => segment !== segments[i])) segments = next;
      previousBlocks = blocks; previousTurns = turns;
      stats = { regroupedBlocks: blocks.length - start, reusedSegments: reused };
      return segments;
    },
    stats: () => stats,
  };
}
