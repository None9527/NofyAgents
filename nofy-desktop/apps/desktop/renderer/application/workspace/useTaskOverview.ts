import { useState } from "react";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";
type OverviewView = { pinned: boolean; sections: Record<string, boolean>; allSources: boolean };
const empty: OverviewView = { pinned: false, sections: {}, allSources: false };
function readView(id: string): OverviewView {
  const raw = readPreference("task-overviews");
  if (!raw || typeof raw !== "object") return empty;
  const view = (raw as Record<string, unknown>)[id];
  if (!view || typeof view !== "object") return empty;
  const value = view as Partial<OverviewView>;
  return { pinned: value.pinned === true, allSources: value.allSources === true, sections: Object.fromEntries(Object.entries(value.sections ?? {}).filter(([,v]) => typeof v === "boolean")) };
}
/** Temporary opening is distinct from persisted pin/section choices, scoped by session. */
export function useTaskOverview(id: string | null) {
  const [stored, setStored] = useState<{ id: string | null; view: OverviewView; open: boolean | null }>(() => ({ id, view: id ? readView(id) : empty, open: null }));
  const state = stored.id === id ? stored : { id, view: id ? readView(id) : empty, open: null };
  const update = (patch: Partial<OverviewView>) => {
    const view = { ...state.view, ...patch };
    setStored({ id, view, open: true });
    if (id) {
      const raw = readPreference("task-overviews");
      const entries = raw && typeof raw === "object" ? Object.entries(raw).filter(([key]) => key !== id).slice(-49) : [];
      writePreference("task-overviews", Object.fromEntries([...entries, [id, view]]));
    }
  };
  const open = state.open === true;
  return { ...state.view, open, update, toggle: () => {
    setStored({ id, view: state.view, open: !open });
  }, close: () => setStored({ ...state, open: false }) };
}
