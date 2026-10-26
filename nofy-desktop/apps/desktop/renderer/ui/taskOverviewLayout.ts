/** A section stays open until it would push the card past a glance. Longer lists start folded. */
export const OVERVIEW_OPEN_ROW_CAP = 5;

export function overviewSectionOpen(saved: boolean | undefined, count: number): boolean {
  return typeof saved === "boolean" ? saved : count <= OVERVIEW_OPEN_ROW_CAP;
}

/** Input is the middle pane's width, after navigation and workbench allocation. */
export function taskOverviewLayout(width: number, pinned: boolean) {
  const panelWidth = 300;
  const gutter = (Math.max(0, width) - 736) / 2;
  const mode = gutter < 180 ? "overlay" : gutter < 400 ? "shift" : "gutter";
  return { mode, panelWidth, inset: pinned && mode === "shift" ? panelWidth + 16 : 0 } as const;
}
