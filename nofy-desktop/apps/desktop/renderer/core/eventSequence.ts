/** Exact membership, compressed into sorted inclusive ranges. Replay may arrive
 * below the high-water mark, so a maximum alone cannot identify duplicates. */
export type EventSequenceRanges = ReadonlyArray<readonly [number, number]>;

export function hasEventSequence(ranges: EventSequenceRanges, seq: number): boolean {
  let low = 0, high = ranges.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const [start, end] = ranges[mid]!;
    if (seq < start) high = mid - 1;
    else if (seq > end) low = mid + 1;
    else return true;
  }
  return false;
}

export function rememberEventSequence(ranges: EventSequenceRanges, seq: number): EventSequenceRanges {
  if (hasEventSequence(ranges, seq)) return ranges;
  const next: Array<readonly [number, number]> = [];
  let start = seq, end = seq, inserted = false;
  for (const range of ranges) {
    if (range[1] < start - 1) next.push(range);
    else if (range[0] > end + 1) {
      if (!inserted) { next.push([start, end]); inserted = true; }
      next.push(range);
    } else { start = Math.min(start, range[0]); end = Math.max(end, range[1]); }
  }
  if (!inserted) next.push([start, end]);
  return next;
}
