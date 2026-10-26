import { useRef } from "react";
import { tr } from "../../ui/i18n.ts";
export function TreeResizeHandle({ width, onChange }: { width: number; onChange: (value: number) => void }) {
  const drag = useRef<{ x: number; width: number; limit: number } | null>(null);
  return <div className="fileworkspace__tree-resize" role="separator" tabIndex={0} aria-label={tr("调整文件树宽度")} aria-orientation="vertical" aria-valuemin={150} aria-valuemax={480} aria-valuenow={width}
    onPointerDown={event => { drag.current = { x: event.clientX, width, limit: Math.max(150, (event.currentTarget.parentElement?.getBoundingClientRect().width ?? 700) - 220) }; event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault(); }}
    onPointerMove={event => { const start = drag.current; if (start) onChange(Math.min(start.limit, start.width + start.x - event.clientX)); }}
    onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onLostPointerCapture={() => { drag.current = null; }}
    onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const limit = Math.max(150, (event.currentTarget.parentElement?.getBoundingClientRect().width ?? 700) - 220); onChange(Math.min(limit, width + (event.key === "ArrowLeft" ? 12 : -12))); } }} />;
}
