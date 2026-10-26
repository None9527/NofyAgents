import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { consumeResponseBudget, responseBudget, transitionFollow } from './transcriptViewport.ts';
import type { FollowMode, TranscriptPhase } from './transcriptViewport.ts';
type Snapshot = { following: boolean; top: number; anchor: string | null; offset: number };
type Memory = { read: () => Snapshot | undefined; write: (value: Snapshot) => void };
/** One scroll owner for restore, following, geometry changes and explicit user intent. */
export function useTranscriptScroll({ host, content, spacer, phase, memory, revision, keys, virtual, scrollToIndex, scrollToEnd }: {
  host: RefObject<HTMLDivElement | null>; memory: Memory; revision: unknown; keys: string[]; virtual: boolean;
  content: RefObject<HTMLDivElement | null>; spacer: RefObject<HTMLDivElement | null>; phase: TranscriptPhase;
  scrollToIndex: (index: number) => void; scrollToEnd: () => void;
}) {
  const initial = useRef(memory.read());
  const stickRef = useRef(initial.current?.following ?? true);
  const mode = useRef<FollowMode>(stickRef.current ? 'user_follow' : 'static');
  const budget = useRef(0);
  const measuredHeight = useRef(0);
  const placedTurn = useRef<string | null>(initial.current ? keys.at(-1) ?? null : null);
  const disclosureAnchor = useRef<{ element: HTMLElement; top: number; until: number } | null>(null);
  const anchorFrame = useRef(0);
  const [readingHistory, setReading] = useState(!stickRef.current);
  const [backVisible, setBackVisible] = useState(false);
  const last = useRef<Snapshot>(initial.current ?? { following: true, top: 0, anchor: null, offset: 0 });
  const config = useRef({ keys, virtual, scrollToIndex, scrollToEnd });
  config.current = { keys, virtual, scrollToIndex, scrollToEnd };
  const applying = useRef(false);
  const userScrollUntil = useRef(0);
  const markUserScroll = useCallback(() => {
    userScrollUntil.current = performance.now() + 1200;
    disclosureAnchor.current = null;
    cancelAnimationFrame(anchorFrame.current);
    applying.current = false;
  }, []);
  const hidden = useRef(false);
  const restoreTarget = useRef(initial.current?.following === false ? initial.current : undefined);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryFrame = useRef(0);
  const restoreAttempts = useRef(0);
  const capture = useCallback(() => {
    const node = host.current;
    if (!node || hidden.current || node.clientWidth === 0 || node.clientHeight === 0) return;
    const top = node.getBoundingClientRect().top;
    const anchor = Array.from(node.querySelectorAll<HTMLElement>("[data-read-key]")).find(row => row.getBoundingClientRect().bottom > top + 8);
    last.current = { following: stickRef.current, top: node.scrollTop, anchor: anchor?.dataset.readKey ?? null, offset: anchor ? anchor.getBoundingClientRect().top - top : 0 };
    memory.write(last.current);
    setBackVisible(node.scrollHeight - node.scrollTop - node.clientHeight > 80);
  }, [host, memory]);
  const apply = useCallback(() => {
    const node = host.current;
    if (!node) return;
    if (node.clientWidth === 0 || node.clientHeight === 0) {
      if (!hidden.current && !stickRef.current) { restoreTarget.current ??= last.current; restoreAttempts.current = 0; }
      hidden.current = true;
      clearTimeout(settleTimer.current);
      return;
    }
    hidden.current = false;
    applying.current = true;
    const anchor = disclosureAnchor.current;
    if (anchor && performance.now() < anchor.until && anchor.element.isConnected) {
      node.scrollTop += anchor.element.getBoundingClientRect().top - anchor.top;
      cancelAnimationFrame(anchorFrame.current);
      anchorFrame.current = requestAnimationFrame(apply);
      return;
    }
    if (anchor) { disclosureAnchor.current = null; measuredHeight.current = content.current?.getBoundingClientRect().height ?? 0; capture(); }
    const height = content.current?.getBoundingClientRect().height ?? 0;
    if (budget.current > 0) {
      budget.current = Math.min(responseBudget(node.clientHeight), consumeResponseBudget(budget.current, height - measuredHeight.current));
      if (spacer.current) spacer.current.style.height = budget.current + 'px';
    }
    measuredHeight.current = height;
    if (mode.current === 'prework_watch' && content.current && content.current.getBoundingClientRect().bottom > node.getBoundingClientRect().bottom - 24) {
      mode.current = transitionFollow(mode.current, { type:'overflow' });
    }
    node.dataset.followMode = mode.current;
    if (stickRef.current && mode.current !== 'prework_watch') {
      if (config.current.virtual) config.current.scrollToEnd(); else node.scrollTop = node.scrollHeight;
      if (budget.current > 0) node.scrollTop = node.scrollHeight;
    } else {
      const saved = restoreTarget.current ?? last.current;
      const row = Array.from(node.querySelectorAll<HTMLElement>("[data-read-key]")).find(row => row.dataset.readKey === saved.anchor);
      if (row) node.scrollTop += row.getBoundingClientRect().top - node.getBoundingClientRect().top - saved.offset;
      else if (restoreTarget.current && saved.anchor && config.current.virtual && restoreAttempts.current++ < 20) {
        const at = config.current.keys.indexOf(saved.anchor);
        if (at >= 0) config.current.scrollToIndex(at);
        cancelAnimationFrame(retryFrame.current);
        retryFrame.current = requestAnimationFrame(apply);
        return;
      } else node.scrollTop = saved.top;
      if (restoreTarget.current) {
        clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(() => { restoreTarget.current = undefined; applying.current = false; capture(); }, 150);
      }
    }
    // Keep programmatic scroll separate from user intent, then capture browser-clamped geometry.
    requestAnimationFrame(() => { applying.current = false; if (!restoreTarget.current) capture(); });
  }, [host, content, spacer, capture]);
  useLayoutEffect(() => {
    const snapshot = initial.current;
    if (snapshot && !snapshot.following && virtual && snapshot.anchor) {
      const index = keys.indexOf(snapshot.anchor);
      if (index >= 0) scrollToIndex(index);
    }
    apply();
    const frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(apply); };
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(retryFrame.current); cancelAnimationFrame(anchorFrame.current); clearTimeout(settleTimer.current); memory.write(last.current); };
  }, [host, memory, apply]);
  useLayoutEffect(() => { if (stickRef.current) apply(); }, [revision, virtual]);
  useLayoutEffect(() => {
    if (phase === 'responding' || phase === 'settled') {
      mode.current = transitionFollow(mode.current, { type:phase === 'responding' ? 'response' : 'settled' });
      stickRef.current = mode.current !== 'static';
      setReading(!stickRef.current);
    }
    // The reservation only makes room while a reply is arriving. Leaving it after
    // settle keeps a phantom scroll range, so the jump pill covers a finished answer.
    if ((phase === 'settled' || phase === 'idle') && budget.current > 0) {
      budget.current = 0;
      if (spacer.current) spacer.current.style.height = '0px';
      capture();
    }
    if (host.current) host.current.dataset.followMode = mode.current;
  }, [phase, host, spacer, capture]);
  const setReadingHistory = useCallback((reading: boolean) => {
    restoreTarget.current = undefined; clearTimeout(settleTimer.current);
    mode.current = transitionFollow(mode.current, { type:reading ? 'hold' : 'bottom' });
    stickRef.current = !reading; setReading(reading); capture();
  }, [capture]);
  const onScroll = useCallback(() => {
    const node = host.current;
    if (!node || hidden.current || node.clientWidth === 0 || node.clientHeight === 0 || applying.current || restoreTarget.current) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    // Resize, disclosure animation and browser anchoring also dispatch scroll. They are not user intent.
    if (performance.now() < userScrollUntil.current) {
      mode.current = transitionFollow(mode.current, { type:'user-scroll', distance });
      stickRef.current = mode.current !== 'static'; setReading(!stickRef.current);
      node.dataset.followMode = mode.current;
      const upward = last.current.top - node.scrollTop;
      if (upward > 0 && budget.current > 0) {
        budget.current = consumeResponseBudget(budget.current, upward);
        if (spacer.current) spacer.current.style.height = budget.current + 'px';
      }
    }
    capture();
  }, [host, spacer, capture]);
  const backToLatest = useCallback(() => {
    disclosureAnchor.current = null; restoreTarget.current = undefined; clearTimeout(settleTimer.current);
    mode.current = transitionFollow(mode.current, { type:'bottom' }); stickRef.current = true; setReading(false); apply();
  }, [apply]);
  const startResponse = useCallback(() => {
    const node = host.current;
    if (!node) return;
    placedTurn.current = config.current.keys.at(-1) ?? null;
    disclosureAnchor.current = null; restoreTarget.current = undefined; clearTimeout(settleTimer.current);
    budget.current = responseBudget(node.clientHeight);
    measuredHeight.current = content.current?.getBoundingClientRect().height ?? 0;
    if (spacer.current) spacer.current.style.height = budget.current + 'px';
    mode.current = transitionFollow(mode.current, { type:'submit' }); stickRef.current = true; setReading(false);
    node.scrollTop = node.scrollHeight; capture(); apply();
  }, [host, content, spacer, capture, apply]);
  const latestKey = keys.at(-1);
  useLayoutEffect(() => {
    // First submission can create/remount the session after its follow token changed.
    // Place only the first turn here. Later submissions use followToken; replayed
    // turn keys must not repeatedly reset following into watch and then static.
    if (latestKey && placedTurn.current === null && stickRef.current && (phase === 'working' || phase === 'responding')) startResponse();
  }, [latestKey, phase, startResponse]);
  const anchorDisclosure = useCallback((element: HTMLElement) => {
    setReadingHistory(true);
    disclosureAnchor.current = { element, top:element.getBoundingClientRect().top, until:performance.now() + 350 };
    cancelAnimationFrame(anchorFrame.current);
    anchorFrame.current = requestAnimationFrame(apply);
  }, [setReadingHistory, apply]);
  return { stickRef, readingHistory, setReadingHistory, onScroll, markUserScroll, backVisible, backToLatest, startResponse, anchorDisclosure };
}
