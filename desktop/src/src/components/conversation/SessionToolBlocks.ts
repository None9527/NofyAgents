// A1-P1-B13：Session 工具视图族逐字重建（styles js 107816–107994，共 179 行，44 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；编排方 B13 四族收割首选，B12 钥匙 sQ/lQ 已开）。
// 消费面 = ConversationToolViews.tsx Session 三 declare + 手写 SessionContextToolView（约 88 行）→ 墓碑 + 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p13/SessionToolBlocks.seam-log.txt，均带〔A1-P1-B13〕。
// 区段切分墓碑：Jmt 图标 var@107816 为左界（aye=Sa('book-open-text')@26732）；N$@107995（Task 归一域）为右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   aye→IconBookOpenText（lucide-react BookOpenText；原 styles 26732 vendored Sa('book-open-text')；A0-S3b 判例）
//   cj→MarkdownRenderer（modules/MarkdownIntegration canonical）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【Session 工具视图族 107816–107994】
//   Jmt→SESSION_CONTEXT_ICON（107816）| k$→isRecordLike（107817）| A$→firstStringField（107820）
//   Ymt→firstNestedRecord（107826）| j$→extractResultText（107833）| Xmt→rawInputOf（107859）| M$→rawOutputOf（107862）
//   Zmt→extractSessionQuery（107865）| Qmt→extractSessionCommandLabel（107873）| $mt→extractSessionResultText（107880）
//   eht→SessionContextToolView（107883）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { MarkdownRenderer } from '../../modules/MarkdownIntegration'; // 原 cj（MarkdownIntegration canonical）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { BookOpenText as IconBookOpenText } from 'lucide-react'; // 原 aye（styles 26732 vendored Sa('book-open-text')；A0-S3b 判例）

/* ── Session 工具视图族（styles 107816–107994） ── */
var SESSION_CONTEXT_ICON = (0, $.jsx)(IconBookOpenText, { className: `size-4 shrink-0 text-foreground-subtle` });
function isRecordLike(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function firstStringField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t == `string` && t.trim().length > 0) return t;
  }
}
function firstNestedRecord(e: any, t: any) {
  if (isRecordLike(e))
    for (let n of t) {
      let t = e[n];
      if (isRecordLike(t)) return t;
    }
}
function extractResultText(e: any): any {
  if (typeof e == `string`) return e.trim().length > 0 ? e : void 0;
  if (Array.isArray(e)) {
    let t = e.map((e: any) => extractResultText(e)).filter((e: any) => e !== void 0);
    return t.length > 0
      ? t.join(`
`)
      : void 0;
  }
  if (!isRecordLike(e))
    return typeof e == `number` || typeof e == `boolean` || typeof e == `bigint`
      ? String(e)
      : void 0;
  let t = firstStringField(e, [`content`, `output`, `result`, `text`, `message`, `error`]);
  if (t) return t;
  let n = firstNestedRecord(e, [`rawOutput`, `output`]);
  if (n) {
    let e = extractResultText(n);
    if (e) return e;
  }
  let r = e.content;
  if (Array.isArray(r)) {
    let e = extractResultText(r);
    if (e) return e;
  }
}
function rawInputOf(e: any) {
  if (isRecordLike(e)) return e.rawInput ?? e.input;
}
function rawOutputOf(e: any) {
  if (isRecordLike(e)) return e.rawOutput ?? e.output;
}
function extractSessionQuery(e: any) {
  if (typeof e.input == `string`) return e.input.trim().length > 0 ? e.input : void 0;
  for (let t of [e.input, e.output, rawInputOf(e.raw), rawOutputOf(e.raw)]) {
    if (!isRecordLike(t)) continue;
    let e = firstStringField(t, [`query`, `prompt`, `question`]);
    if (e) return e;
  }
}
function extractSessionCommandLabel(e: any) {
  for (let t of [e.input, e.output, rawInputOf(e.raw), rawOutputOf(e.raw)]) {
    if (!isRecordLike(t)) continue;
    let e = firstStringField(t, [`sessionId`, `session_id`]);
    if (e) return e;
  }
}
function extractSessionResultText(e: any) {
  return extractResultText(e.output) || extractResultText(rawOutputOf(e.raw));
}
function SessionContextToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCallNode: n, isRunning: r, statusLabel: i, errorText: a } = e,
    { toolCall: o } = n,
    s = extractSessionQuery(o),
    c = extractSessionCommandLabel(o),
    l = extractSessionResultText(o),
    u = o.status === `failed` ? a : l,
    d = t.formatMessage({ id: `chat.toolCall.sessionContext.title` }),
    f = (0, React.useMemo)(
      () => (0, $.jsx)(`span`, { className: `min-w-0 truncate`, children: s ?? o.title ?? d }),
      [d, s, o.title],
    ),
    p = (0, React.useMemo)(
      () =>
        c
          ? (0, $.jsx)(`code`, {
              className: `min-w-0 truncate rounded-md bg-surface px-1.5 py-0.5 font-mono text-ui-base text-foreground-subtle`,
              children: c,
            })
          : void 0,
      [c],
    ),
    m = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `space-y-3 rounded-xl border border-border bg-panel px-4 py-3`,
          children: [
            s
              ? (0, $.jsxs)(`section`, {
                  className: `space-y-1.5`,
                  children: [
                    (0, $.jsx)(`h4`, {
                      className: `text-ui-base font-medium uppercase text-foreground-subtle`,
                      children: t.formatMessage({ id: `chat.toolCall.sessionContext.query` }),
                    }),
                    (0, $.jsx)(`p`, {
                      className: `whitespace-pre-wrap break-words text-ui-base text-foreground`,
                      children: s,
                    }),
                  ],
                })
              : null,
            (0, $.jsxs)(`section`, {
              className: `space-y-1.5`,
              children: [
                (0, $.jsx)(`h4`, {
                  className: `text-ui-base font-medium uppercase text-foreground-subtle`,
                  children: t.formatMessage({ id: `chat.toolCall.sessionContext.result` }),
                }),
                u
                  ? (0, $.jsx)(MarkdownRenderer, {
                      className: `min-w-0 break-words text-ui-base`,
                      workspacePath: e.workspacePath,
                      theme: e.theme,
                      codePreviewSettings: e.codePreviewSettings,
                      onOpenCodeViewer: e.onOpenCodeViewer,
                      onOpenFileLink: e.onOpenFileLink,
                      onOpenExternalUrl: e.onOpenBrowserUrl,
                      children: u,
                    })
                  : (0, $.jsx)(`p`, {
                      className: `text-ui-base text-foreground-subtle`,
                      children: t.formatMessage({ id: `chat.toolCall.sessionContext.noResult` }),
                    }),
              ],
            }),
          ],
        }),
      [
        e.codePreviewSettings,
        e.onOpenBrowserUrl,
        e.onOpenCodeViewer,
        e.onOpenFileLink,
        e.theme,
        e.workspacePath,
        t,
        s,
        u,
      ],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: o.toolId,
        icon: SESSION_CONTEXT_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: e.canToggle ?? !0,
        forceOpen: e.forceOpen ?? !1,
        hideSecondaryTextWhenOpen: !0,
        kindLabel: t.formatMessage({
          id: r ? `chat.toolCall.sessionContext.reading` : `chat.toolCall.sessionContext.read`,
        }),
        sourceLabel: e.sourceLabel,
        primaryText: f,
        secondaryText: p,
        statusLabel: i,
        statusTooltip: o.status === `failed` ? a : void 0,
        showFailureStatus: o.status === `failed`,
        isRunning: r,
        title: o.title,
        renderContent: m,
      }),
      (0, $.jsx)(ToolSnapshotRefs, {
        refs: o.snapshotRefs ?? [],
        onLoadFullToolCallFields: e.onLoadFullToolCallFields
          ? () => e.onLoadFullToolCallFields?.(o.toolId)
          : void 0,
      }),
    ],
  });
}

export { SESSION_CONTEXT_ICON, isRecordLike, firstStringField, firstNestedRecord, extractResultText, rawInputOf, rawOutputOf, extractSessionQuery, extractSessionCommandLabel, extractSessionResultText, SessionContextToolView };
