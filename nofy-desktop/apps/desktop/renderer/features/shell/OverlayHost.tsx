import type { ComponentProps } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { tr } from "../../ui/i18n.ts";
import { Btn } from "../../ui/primitives.tsx";
import { SessionSearch } from "./SessionSearch.tsx";
import { CommandPalette } from "./CommandPalette.tsx";
export function OverlayHost({ runtime, historyOpen, onCloseHistory, onSelectHistory, palette }: { runtime: Runtime; historyOpen: boolean; onCloseHistory: () => void; onSelectHistory: (id: string, cwd: string) => Promise<void>; palette: ComponentProps<typeof CommandPalette> }) {
  return <>{historyOpen ? <section className="history-dialog" role="dialog" aria-modal="true" aria-label={tr("历史内容搜索")} onKeyDown={event => { if (event.key === "Escape") onCloseHistory(); }}><Btn onClick={onCloseHistory}>{tr("关闭搜索")}</Btn><SessionSearch runtime={runtime} onSelectSession={onSelectHistory} /></section> : null}<CommandPalette {...palette} /></>;
}
