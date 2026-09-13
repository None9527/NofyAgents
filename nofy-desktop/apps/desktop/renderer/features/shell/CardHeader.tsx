/**
 * CardHeader —— 对话卡片自带的头（h-12）。
 *
 * ## 活壳解剖（3.11.2，CDP 实测；这个槽位我们此前看错了，本轮按实测改正）
 *
 * header.@container/workspace-header = flex h-12 shrink-0，**下边框随状态变**
 * （空态 border-transparent，会话态 border-border）。内层一行
 * 「flex h-12 flex-1 items-center justify-between gap-2 overflow-hidden p-2 pl-4 [app-region:drag]」，
 * 左右两簇：
 *
 *   左（min-w-0 flex-1 → 内层 flex items-center gap-1 [app-region:no-drag]）
 *     h1[data-testid=workspace-title]   任务标题：font-semibold、truncate、max-w-100、min-w-12
 *     div[data-testid=workspace-path]   路径胶囊：rounded-full bg-tag/50 py-1 pl-2 pr-2.5、
 *                                       folder 图标 mr-1 size-4、末段名 truncate、max-w-48
 *     button[data-testid=workspace-more-button]  aria「更多」ellipsis 28×28
 *   右（flex shrink-0 items-center gap-0.5 [app-region:no-drag]；实测 88×28 = 3×28 + 2×2）
 *     帮助               circle-question-mark
 *     切换终端           square-terminal
 *     展开/收起侧边面板   panel-right-open / panel-right-close
 *
 * **右簇里没有主题、没有设置、没有诊断。** 活壳里主题住在设置弹窗、设置齿轮（32×32）
 * 与账号卡住在侧栏页脚。我们对应：主题 + 设置 → SidebarFoot 的齿轮菜单；
 * 连接与诊断量 → SidebarFoot 的账号卡槽位（原先挂整窗状态栏，活壳没有那一行）。
 *
 * 空态（还没有会话）时活壳左半是空的（h1 不渲染，容器高 0）——照做。宁可得一条
 * 空 header，也不编一个「工作区未定」的假标题占位。
 *
 * ## ⋯ 菜单为什么是只读信息
 *
 * 活壳那枚是任务操作菜单（重命名 / 归档 / 删除…）。我们还没有对应的内核写路径，
 * 所以先放**真能给的信息**：会话 id（对着内核日志找会话要用）、kind、cwd、
 * 块数与 agentState。等有写路径再加动作——放假动作比不放更坏。
 */
import type { BootstrapInfo } from "../../../preload/contract.ts";
import type { SessionState } from "../../core/store/state.ts";
import { IconEllipsis, IconFolder, IconPanelRightClose, IconPanelRightOpen, IconTerminal } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { HelpMenu } from "./HelpMenu.tsx";
import { sessionTitle, workspaceLabel } from "./palette.ts";

export type CardHeaderProps = {
  session: SessionState | null;
  /** 会话的 cwd（没有会话时由 App 退回 boot.cwd）。 */
  cwd: string | null;
  boot: BootstrapInfo | null;
  kernelVersion: string | null;
  /** 终端 dock 的开合（生态面 #3）。与 auxOpen 同为窗口局部态，住 layout 持久化键。 */
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  auxOpen: boolean;
  onToggleAux: () => void;
};

export function CardHeader({
  session,
  cwd,
  boot,
  kernelVersion,
  terminalOpen,
  onToggleTerminal,
  auxOpen,
  onToggleAux,
}: CardHeaderProps) {
  const title = sessionTitle(session?.title ?? null);
  const more: MenuItem[] =
    session === null
      ? []
      : [
          { id: "id", label: "会话 " + session.id.slice(0, 8) + "…", hint: session.id },
          { id: "kind", label: "kind " + (session.kind ?? "?"), hint: "session/new|load 响应 _meta 的 nofy/sessionDetail.kind" },
          { id: "cwd", label: workspaceLabel(cwd) ?? "（无工作区）", hint: cwd ?? "会话未带 cwd" },
          { id: "blocks", label: String(session.blocks.length) + " 块 · " + session.agentState, hint: "投影层计数（不是内核量）" },
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
            <MenuButton
              align="left"
              variant="icon"
              chevron={false}
              title="会话信息（只读）：id / kind / cwd / 块数"
              trigger={<IconEllipsis size={16} />}
              items={more}
              onPick={() => {
                /* 只读 */
              }}
            />
          </>
        ) : null}
      </div>
      <div className="card__head-right">
        <HelpMenu boot={boot} kernelVersion={kernelVersion} />
        <button
          type="button"
          className={"iconbtn" + (terminalOpen ? " iconbtn--on" : "")}
          onClick={onToggleTerminal}
          aria-label={terminalOpen ? "关闭终端面板" : "展开终端面板"}
          title={
            (terminalOpen ? "关闭终端面板" : "展开终端面板") +
            "（⌘J）：收起只隐藏，终端与其中正在跑的进程继续活着"
          }
        >
          <IconTerminal size={16} />
        </button>
        <button
          type="button"
          className={"iconbtn" + (auxOpen ? " iconbtn--on" : "")}
          onClick={onToggleAux}
          aria-label={auxOpen ? "收起侧边面板" : "展开侧边面板"}
          title={(auxOpen ? "收起侧边面板" : "展开侧边面板") + "（⌘⌥B）：roster / 文件"}
        >
          {auxOpen ? <IconPanelRightClose size={16} /> : <IconPanelRightOpen size={16} />}
        </button>
      </div>
    </header>
  );
}
