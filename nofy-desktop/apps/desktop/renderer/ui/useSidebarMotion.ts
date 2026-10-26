import { useEffect, useRef, useState } from 'react';

export const SIDEBAR_MOTION_MS = 220;
/** Presentation only: keep the last open content width while its outer slot retracts. */
export function useSidebarMotion(open: boolean, preferredWidth: number) {
  const lastWidth = useRef(preferredWidth);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motion, setMotion] = useState({ open, moving: false });
  if (motion.open !== open) setMotion({ open, moving: !reduced });
  if (open) lastWidth.current = preferredWidth;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!motion.moving) return;
    if (reduced) { setMotion({ open, moving: false }); return; }
    const timer = setTimeout(() => setMotion(current => current.open === open ? { ...current, moving: false } : current), SIDEBAR_MOTION_MS + 40);
    return () => clearTimeout(timer);
  }, [open, motion.moving, reduced]);
  return { contentWidth: open ? preferredWidth : lastWidth.current, moving: motion.moving && !reduced, duration: reduced ? 0 : SIDEBAR_MOTION_MS };
}

/** Same 220ms beat as the sidebars, for a boolean that is not an open/close slot. */
export function useFlagMotion(flag: boolean) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motion, setMotion] = useState({ flag, moving: false });
  if (motion.flag !== flag) setMotion({ flag, moving: !reduced });
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!motion.moving) return;
    if (reduced) { setMotion({ flag, moving: false }); return; }
    const timer = setTimeout(() => setMotion(current => current.flag === flag ? { ...current, moving: false } : current), SIDEBAR_MOTION_MS + 40);
    return () => clearTimeout(timer);
  }, [flag, motion.moving, reduced]);
  return { moving: motion.moving && !reduced, duration: reduced ? 0 : SIDEBAR_MOTION_MS };
}
