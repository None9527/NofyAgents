export type MenuBox = { left: number; right: number; top: number; bottom: number };
/** Clamp against viewport, independently of clipping/containment in the trigger's ancestors. */
export function menuPosition(anchor: MenuBox, width: number, height: number, viewport: { width: number; height: number }, up: boolean, align: "left" | "right") {
  const margin = 8, gap = 6;
  const above = Math.max(0, anchor.top - gap - margin), below = Math.max(0, viewport.height - anchor.bottom - gap - margin);
  const opensUp = up ? above >= height || above >= below : below < height && above > below;
  const maxHeight = Math.max(0, opensUp ? above : below);
  const visibleHeight = Math.min(height, maxHeight);
  const left = Math.max(margin, Math.min(align === "right" ? anchor.right - width : anchor.left, viewport.width - width - margin));
  const top = Math.max(margin, opensUp ? anchor.top - gap - visibleHeight : anchor.bottom + gap);
  return { left, top, maxHeight };
}
