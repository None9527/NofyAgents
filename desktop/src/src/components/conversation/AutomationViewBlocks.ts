// A1-P1-B13：Automation 工具视图族逐字重建（styles js 107520–107720，共 201 行，26 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；编排方 B13 四族收割之 MCP-Wmt 族；B11 McpToolBlocks 已立助手域 107432–107519）。
// 消费面 = ConversationToolViews.tsx 手写 AutomationToolView（约 138 行）→ 墓碑 + 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p13/AutomationViewBlocks.seam-log.txt，均带〔A1-P1-B13〕。
// 区段切分墓碑：左界 = Wmt@107520（B11 McpToolBlocks 右界邻接）；右界 Gmt@107721（plan-guidance 族）。
// 束真身更正（手写体差异披露）：手写 AutomationToolView 为简化卡面；束真身含 CodeSurface 结果面（json/log 双模）+
//   Collapsible 详情面（description/parameters 双 section）+ snapshotRefs 加载器，见 A1-P1-B13.report.md §六。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   X→Button | wa→IconChevronRight（modules/button，button-laUijeDG.js t/o 导出）
//   kZ→Collapsible | AZ→CollapsibleTrigger | jZ→CollapsibleContent（modules/Conversation §1 留守原语，A0-S4-4b；同 ToolLayoutBlocks 判例）
//   Vmt→extractMcpToolInfo | Hmt→prettifyMcpServerName | Umt→prettifyMcpToolName | Rmt→extractMcpOutputText |
//     Lmt→isShortPlainOutput | T$→detectOutputLanguage | Pmt→MCP_TOOL_ICON | Imt→MCP_CONTENT_VISIBILITY_STYLE（./McpToolBlocks，B11）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【declare 面→真实 import〔A1-P1-B14〕：代码面族 48572–48872 已逐字实体化于 ./CodeSurfaceBlocks】
//   gk→CodeSurface | pk→CodeSurfaceHeader | mk→CodeSurfaceTitle | hk→CodeSurfaceActions |
//     _k→CodeSurfaceWrapButton | vk→CodeSurfaceCopyButton（./CodeSurfaceBlocks，B14）
//   【Automation 工具视图族 107520–107720】
//   Wmt→AutomationToolView（107520）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 X/wa（button-laUijeDG.js t/o 导出）
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../modules/Conversation'; // 原 kZ/AZ/jZ（§1 共享原语留守面，A0-S4-4b；同 ToolLayoutBlocks 判例）
import { extractMcpToolInfo, prettifyMcpServerName, prettifyMcpToolName, extractMcpOutputText, isShortPlainOutput, detectOutputLanguage, MCP_TOOL_ICON, MCP_CONTENT_VISIBILITY_STYLE } from './McpToolBlocks'; // 原 Vmt/Hmt/Umt/Rmt/Lmt/T$/Pmt/Imt（B11 助手域 107432–107519）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { CodeSurface, CodeSurfaceHeader, CodeSurfaceTitle, CodeSurfaceActions, CodeSurfaceWrapButton, CodeSurfaceCopyButton } from './CodeSurfaceBlocks'; // 原 gk/pk/mk/hk/_k/vk（B14：代码面族 48572–48872 逐字实体化，declare→import 收敛）

/* ── Automation 工具视图族（styles 107520–107720） ── */
function AutomationToolView(e: any) {
  let { intl: t } = useIntlContext(),
    n = extractMcpToolInfo(e),
    { toolCall: r } = e.toolCallNode,
    i = n?.serverName ? prettifyMcpServerName(n.serverName) : void 0,
    a = n ? prettifyMcpToolName(n.toolName, i ?? ``) : r.title,
    o = t.formatMessage({ id: `chat.toolCall.mcp.callDetails` }),
    s = t.formatMessage({ id: `chat.toolCall.mcp.result` }),
    c = t.formatMessage({ id: `chat.toolCall.mcp.copyResult` }),
    l = t.formatMessage({ id: `chat.toolCall.mcp.wrapLines` }),
    u = t.formatMessage({ id: `chat.toolCall.mcp.description` }),
    d = t.formatMessage({ id: `chat.toolCall.mcp.parameters` }),
    f = !!(n?.description || r.input !== void 0),
    p = extractMcpOutputText(r.output),
    m = r.status === `failed` ? (r.error ?? e.errorText) : void 0,
    h = !!(p || m),
    g = r.status === `pending` || r.status === `stopped`,
    _ =
      r.status === `stopped`
        ? (0, $.jsxs)(`span`, {
            className: `inline-flex items-center gap-2`,
            children: [
              (0, $.jsx)(`span`, { className: `text-foreground-subtlest`, children: `·` }),
              (0, $.jsx)(`span`, { children: e.statusLabel }),
            ],
          })
        : void 0,
    v =
      r.status === `failed`
        ? (0, $.jsxs)(`span`, {
            className: `inline-flex items-center gap-2`,
            children: [
              (0, $.jsx)(`span`, { className: `text-foreground-subtlest`, children: `·` }),
              (0, $.jsx)(`span`, { children: e.statusLabel }),
            ],
          })
        : void 0,
    y = e.onLoadFullToolCallFields,
    b = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `mb-2 space-y-3 py-1`,
          "data-testid": `mcp-expanded-content`,
          children: [
            m
              ? (0, $.jsxs)(`section`, {
                  className: `space-y-1.5`,
                  children: [
                    (0, $.jsx)(`h4`, {
                      className: `text-ui-base font-medium text-destructive`,
                      children: s,
                    }),
                    (0, $.jsx)(`p`, {
                      className: `whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive`,
                      "data-testid": `mcp-error-surface`,
                      children: m,
                    }),
                  ],
                })
              : p && isShortPlainOutput(p)
                ? (0, $.jsx)(`p`, {
                    className: `break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle`,
                    "data-testid": `mcp-result-surface`,
                    children: p.trim(),
                  })
                : p
                  ? (0, $.jsx)(`div`, {
                      className: `max-h-72 overflow-auto rounded-xl border border-border bg-card`,
                      "data-testid": `mcp-result-surface`,
                      children: (0, $.jsx)(CodeSurface, {
                        appTheme: e.theme,
                        className: `bg-card`,
                        code: p,
                        enableSyntaxHighlighting: detectOutputLanguage(p),
                        language: detectOutputLanguage(p) ? `json` : `log`,
                        renderMermaid: !1,
                        style: MCP_CONTENT_VISIBILITY_STYLE,
                        wrapLongLines: !0,
                        children: (0, $.jsxs)(CodeSurfaceHeader, {
                          className: `pl-3 pr-2 pt-2`,
                          children: [
                            (0, $.jsx)(CodeSurfaceTitle, {
                              children: (0, $.jsx)(`span`, {
                                className: `text-ui-base font-medium text-foreground-subtle`,
                                children: s,
                              }),
                            }),
                            (0, $.jsxs)(CodeSurfaceActions, {
                              children: [
                                (0, $.jsx)(CodeSurfaceWrapButton, { "aria-label": l, title: l }),
                                (0, $.jsx)(CodeSurfaceCopyButton, { "aria-label": c, title: c }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    })
                  : r.status === `pending`
                    ? (0, $.jsx)(`p`, {
                        className: `break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle`,
                        "data-testid": `mcp-pending-surface`,
                        children: e.statusLabel,
                      })
                    : (0, $.jsx)(`p`, {
                        className: `text-ui-base text-foreground-subtle`,
                        children: e.statusLabel,
                      }),
            f
              ? (0, $.jsxs)(Collapsible, {
                  className: `group/details`,
                  children: [
                    (0, $.jsx)(CollapsibleTrigger, {
                      asChild: !0,
                      children: (0, $.jsxs)(Button, {
                        type: `button`,
                        variant: `ghost`,
                        size: `sm`,
                        className: `-ml-2 text-foreground-subtlest hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground`,
                        children: [
                          (0, $.jsx)(IconChevronRight, {
                            className: `size-3.5 transition-transform group-data-[state=open]/details:rotate-90`,
                          }),
                          o,
                        ],
                      }),
                    }),
                    (0, $.jsx)(CollapsibleContent, {
                      children: (0, $.jsxs)(`div`, {
                        className: `space-y-3 pt-2`,
                        children: [
                          n?.description
                            ? (0, $.jsxs)(`section`, {
                                className: `space-y-1.5`,
                                children: [
                                  (0, $.jsx)(`h4`, {
                                    className: `text-ui-sm font-medium text-foreground-subtlest`,
                                    children: u,
                                  }),
                                  (0, $.jsx)(`p`, {
                                    className: `whitespace-pre-wrap break-words text-ui-base text-foreground-subtle`,
                                    children: n.description,
                                  }),
                                ],
                              })
                            : null,
                          r.input === void 0
                            ? null
                            : (0, $.jsxs)(`section`, {
                                className: `space-y-1.5`,
                                children: [
                                  (0, $.jsx)(`h4`, {
                                    className: `text-ui-sm font-medium text-foreground-subtlest`,
                                    children: d,
                                  }),
                                  (0, $.jsx)(`div`, {
                                    className: `max-h-72 overflow-auto rounded-xl border border-border bg-card`,
                                    children: (0, $.jsx)(CodeSurface, {
                                      appTheme: e.theme,
                                      code: JSON.stringify(r.input, null, 2),
                                      language: `json`,
                                    }),
                                  }),
                                ],
                              }),
                        ],
                      }),
                    }),
                  ],
                })
              : null,
            (0, $.jsx)(ToolSnapshotRefs, {
              refs: r.snapshotRefs ?? [],
              onLoadFullToolCallFields: y ? () => y(r.toolId) : void 0,
            }),
          ],
        }),
      [o, c, e, u, y, f, h, d, n?.description, s, p, r, m, l],
    );
  return n
    ? (0, $.jsx)(ToolLayout, {
        toolId: r.toolId,
        icon: MCP_TOOL_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: !g && (e.canToggle ?? !0),
        forceOpen: !g && (e.forceOpen ?? !1),
        kindLabel: `MCP`,
        kindDetail: i
          ? (0, $.jsx)(`span`, { className: `text-foreground-subtle`, children: i })
          : void 0,
        primaryText: a,
        summaryContentSeparator: `·`,
        secondaryText: _,
        statusLabel: v,
        statusTooltip: r.status === `failed` ? e.errorText : void 0,
        showFailureStatus: r.status === `failed`,
        isRunning: e.isRunning,
        title: n.description ?? n.toolName,
        renderContent: b,
      })
    : null;
}

export { AutomationToolView };
