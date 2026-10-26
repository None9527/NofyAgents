import { useCallback, useState } from "react";
import { closePanel, openPanel } from "./panelTabs.ts";
import type { PanelKind, PanelTabs } from "./panelTabs.ts";
export function usePanelTabs() {
  const [state, setState] = useState<PanelTabs>({ tabs: [], active: null });
  const open = useCallback((kind: PanelKind) => setState(s => openPanel(s, kind)), []);
  const close = useCallback((kind: PanelKind) => setState(s => closePanel(s, kind)), []);
  return { state, open, close };
}
