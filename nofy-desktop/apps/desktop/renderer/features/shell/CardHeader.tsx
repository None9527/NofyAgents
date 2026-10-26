import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/** Session controls and workspace controls share the window header. */
import type { ReactNode } from "react";
import type { SessionState } from "../../core/store/state.ts";
import { IconEllipsis, IconFolder, IconPanelRightClose, IconPanelRightOpen, IconTerminal } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { sessionTitle, workspaceLabel } from "./palette.ts";

export type CardHeaderProps = {
  actions?: ReactNode;
  overview?: ReactNode;
  session: Pick<SessionState, "id" | "title" | "kind" | "agentState"> | null;
  blockCount: number;
  /** 会话的 cwd（没有会话时由 App 退回 boot.cwd）。 */
  cwd: string | null;
  /** 终端 dock 的开合（生态面 #3）。与 auxOpen 同为窗口局部态，住 layout 持久化键。 */
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  auxOpen: boolean;
  onToggleAux: () => void;
};

export function CardHeader({
  actions,
  overview,
  blockCount,
  session,
  cwd,
  terminalOpen,
  onToggleTerminal,
  auxOpen,
  onToggleAux,
}: CardHeaderProps) {
  useLocale();
  const title = sessionTitle(session?.title ?? null);
  const more: MenuItem[] =
    session === null
      ? []
      : [
          { id: "id", label: tr("会话 ") + session.id.slice(0, 8) + "…", hint: session.id },
          { id: "kind", label: "kind " + (session.kind ?? "?"), hint: tr("session/new|load 响应 _meta 的 nofy/sessionDetail.kind") },
          { id: "cwd", label: workspaceLabel(cwd) ?? tr("（无工作区）"), hint: cwd ?? tr("会话未带 cwd") },
          { id: "blocks", label: String(blockCount) + tr(" 块 · ") + session.agentState, hint: tr("投影层计数（不是内核量）") },
        ];
  return (
    <header className={"card__head" + (session !== null ? " card__head--lined" : "")}>
      <div className="card__head-left">
        {session !== null ? (
          <>
            <h1 className="card__title" title={title}>
              {title}
            </h1>
            {cwd !== null ? (
              <span className="card__path" title={cwd}>
                <IconFolder size={16} />
                <span>{workspaceLabel(cwd)}</span>
              </span>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="card__head-right">
        {session && (actions ?? <MenuButton align="right" variant="icon" chevron={false} title={tr("会话信息（只读）：id / kind / cwd / 块数")} trigger={<IconEllipsis size={16}/>} items={more} onPick={() => {}}/>)}
        {overview}
        <button
          type="button"
          className={"iconbtn" + (terminalOpen ? " iconbtn--on" : "")}
          onClick={onToggleTerminal}
          aria-label={terminalOpen ? tr("关闭终端面板") : tr("展开终端面板")}
          title={
            (terminalOpen ? tr("关闭终端面板") : tr("展开终端面板")) +
            tr("（⌘J）：收起只隐藏，终端与其中正在跑的进程继续活着")
          }
        >
          <IconTerminal size={16} />
        </button>
        <button
          type="button"
          className={"iconbtn card__aux-toggle" + (auxOpen ? " iconbtn--on" : "")}
          onClick={onToggleAux}
          aria-label={auxOpen ? tr("收起侧边面板") : tr("展开侧边面板")}
          title={(auxOpen ? tr("收起侧边面板") : tr("展开侧边面板")) + tr("（⌘⌥B）：roster / 文件")}
        >
          {auxOpen ? <IconPanelRightClose size={16} /> : <IconPanelRightOpen size={16} />}
        </button>
      </div>
    </header>
  );
}
