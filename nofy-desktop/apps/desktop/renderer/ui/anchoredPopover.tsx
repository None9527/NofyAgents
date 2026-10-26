import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { menuPosition } from "./menuPosition.ts";

/** Native top layer avoids clipping and keeps the panel attached to a moving trigger. */
export function AnchoredPopover({ anchor, children, className, label, onClose, onMouseEnter, onMouseLeave, up = true, focusOnOpen = false, avoid }: {
  avoid?: RefObject<HTMLElement | null>;
  anchor: RefObject<HTMLElement | null>; children: ReactNode; className: string; label: string;
  onClose: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void; up?: boolean; focusOnOpen?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const [position, setPosition] = useState<ReturnType<typeof menuPosition> | null>(null);
  useLayoutEffect(() => {
    const node = panel.current, trigger = anchor.current;
    if (!node || !trigger) return;
    node.showPopover();
    const place = () => {
      if (!trigger.isConnected) { close.current(); return; }
      const next = menuPosition(trigger.getBoundingClientRect(), node.getBoundingClientRect().width, node.scrollHeight + 2,
        { width: window.innerWidth, height: !up && avoid?.current ? Math.min(window.innerHeight, avoid.current.getBoundingClientRect().top) : window.innerHeight }, up, "right");
      setPosition(previous => previous && previous.left === next.left && previous.top === next.top && previous.maxHeight === next.maxHeight ? previous : next);
    };
    const outside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (node.contains(target) || trigger.contains(target)) return;
      // Menus portal outside this popover and occupy their own top layer.
      if (target instanceof Element && target.closest(".menu__pop")) return;
      close.current();
    };
    const keys = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (event.target instanceof Element && event.target.closest(".menu__pop")) return;
      event.preventDefault();
      event.stopPropagation();
      close.current();
      trigger.focus();
    };
    const observer = new ResizeObserver(place);
    observer.observe(node);
    if (avoid?.current) observer.observe(avoid.current);
    for (let parent: HTMLElement | null = trigger; parent; parent = parent.parentElement) observer.observe(parent);
    window.addEventListener("resize", place); document.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", outside, true); document.addEventListener("keydown", keys, true);
    place();

    return () => {
      observer.disconnect(); window.removeEventListener("resize", place); document.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", outside, true); document.removeEventListener("keydown", keys, true);
      if (node.matches(":popover-open")) node.hidePopover();
    };
  }, [anchor, up, focusOnOpen, avoid]);
  const placed = position !== null;
  useLayoutEffect(() => { if (focusOnOpen && placed) panel.current?.focus(); }, [focusOnOpen, placed]);
  return createPortal(<div ref={panel} tabIndex={-1} popover="manual" className={className} role="dialog" aria-label={label}
    onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    style={{ left: position?.left ?? 0, top: position?.top ?? 0, maxHeight: position?.maxHeight, visibility: position ? "visible" : "hidden" }}>
    {children}
  </div>, anchor.current?.closest("dialog[open]") ?? document.body);
}
