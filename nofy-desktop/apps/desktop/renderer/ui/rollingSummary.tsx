import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { summaryDelay } from './summaryTiming.ts';

export type SummarySnapshot = { key: string; text: string };
/** Retains the existing API; presents the latest state after a minimum dwell.
 * Same-identity deltas are immediate. Completion cancels pending work without replaying old text. */
export function RollingSummary({ snapshot, enabled = true, followEnd = false }: {
  snapshot: SummarySnapshot; enabled?: boolean; followEnd?: boolean;
}) {
  const [displayed, setDisplayed] = useState(snapshot);
  const current = useRef(snapshot);
  const shownAt = useRef(performance.now());
  const viewport = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const promote = () => {
      if (current.current.key !== snapshot.key) shownAt.current = performance.now();
      current.current = snapshot;
      setDisplayed(snapshot);
    };
    const delay = summaryDelay(current.current.key, snapshot.key, performance.now() - shownAt.current, enabled);
    if (!delay) { promote(); return; }
    const timer = setTimeout(promote, delay);
    // A new state cancels the obsolete pending identity; there is no historical queue.
    return () => clearTimeout(timer);
  }, [snapshot.key, snapshot.text, enabled]);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node || !followEnd) return;
    const follow = () => { node.scrollLeft = node.scrollWidth; };
    follow(); const observer = new ResizeObserver(follow); observer.observe(node);
    return () => observer.disconnect();
  }, [displayed.text, followEnd]);
  const visible = enabled ? displayed : snapshot;
  return <span className="ui-rolling-summary" title={visible.text}>
    <span ref={viewport} className="ui-rolling-summary__current" data-summary-key={visible.key} data-follow-end={followEnd}>{visible.text}</span>
  </span>;
}
