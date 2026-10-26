import { useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
/** Keep the same children mounted between inline and modal modes. Native modal owns focus/inert. */
export function SideSheet({ mode, width, onClose, children, label, active=true, expanded=false }: {
  active?:boolean; mode: "split" | "sheet"; width: number; onClose: () => void; children: ReactNode; label: string; expanded?: boolean;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useLayoutEffect(() => {
    const element = ref.current!;
    if (!active) { if (element.open) element.close(); return; }
    if (mode === "sheet") { if (element.open) element.close(); element.showModal(); }
    else element.open = true;
    return () => { if (!element.open) return; if (mode === "sheet") element.close(); else element.open = false; };
  }, [mode,active]);
  return <dialog ref={ref} open={active && mode === "split" ? true : undefined} role={mode === "split" ? "complementary" : "dialog"} aria-label={label}
    className={"side-sheet side-sheet--" + mode + (expanded ? " side-sheet--expanded" : "")}
    style={{ "--side-sheet-width": width + "px" } as CSSProperties}
    onKeyDown={event => {
      if (mode !== "sheet") return;
      event.stopPropagation();
      if ((event.metaKey || event.ctrlKey) && event.altKey && event.code === "KeyB") { event.preventDefault(); onClose(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (mode !== "sheet" || event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
    }}>
    {children}
  </dialog>;
}
