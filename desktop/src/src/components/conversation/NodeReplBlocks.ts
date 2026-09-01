// A1-P1-B15：NodeRepl 族逐字重建（styles js 106856–107111 + 107115–107179 + 107216–107431，共 537 行，30 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（conversation 域 R0 余簇，B14 留批第 1 项）；CTV 手写 NodeReplToolView（约 160 行）+
//   五 declare（buildNodeReplModel/resolveNodeReplStatus/isPlainTextOutput/looksLikeJson/NodeReplImageList）+
//   NODE_REPL_ICON 手写 const 全墓碑，消费面改文件尾转导出（ConversationLeaves 导入面逐字不变）。
// 逐字证明：/tmp/a1r0-p1/p15/p15-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p15-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p15/seams-NodeReplBlocks.json，均带〔A1-P1-B15〕。
// 区段切分墓碑：左界 = 助手域起 smt var 链@106856（pmt 族 106875+ 同段携带）；右界 Nmt@107431 闭包末
//   （Pmt@107432 file-read 族图标 var 邻接，留批）；Dmt/Omt/kmt@107112–107114 + w$@107180–107215 既录
//   CodeSurfaceBlocks（B14），本叶 import 消费（NODE_REPL_TOOL_ICON/PLAIN_TEXT_OUTPUT_MAX_LENGTH/CodeSurfaceCard）。
// 束真身更正披露（CTV 手写期近似 → 束真身）：statusLabel 手写 props.statusLabel → 束 i(`chat.toolCall.nodeRepl.failed`)；
//   showFailureStatus 手写 `failed` → 束 `failed && !!r.userTitle`；title 手写 toolCall.title → 束 a.title（resolveNodeReplHeader）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   【真实 import】$→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）| X→Button（modules/button）
//   q_→IconExternalLink（styles 27013 Sa('external-link')；A0-S3b 判例 lucide ExternalLink）| wa→IconChevronRight（modules/button pass-1）
//   kZ/AZ/jZ→Collapsible/CollapsibleTrigger/CollapsibleContent（modules/Conversation）| lQ→ToolLayoutMemo（./ToolLayoutBlocks）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs）
//   qk→ImageGalleryGroup（modules/PreviewCards）| Wk→ImageLightbox（modules/PreviewCards）
//   Gk→IMAGE_THUMBNAIL_CLASS（modules/MarkdownIntegration）| Kk→IMAGE_INNER_CLASS（modules/MarkdownIntegration，〔A1-P1-B15〕补 export）
//   w$→CodeSurfaceCard | Dmt→NODE_REPL_TOOL_ICON | kmt→PLAIN_TEXT_OUTPUT_MAX_LENGTH（均 ./CodeSurfaceBlocks，B14 既录）
//   【regex var 链 106856–106862】smt→NODE_REPL_GENERIC_TITLE_PATTERN | cmt→LEADING_NEWLINES_PATTERN | lmt→REPL_ARROW_PROMPT_PATTERN
//   umt→ATTACHED_IMAGE_LINE_PATTERN | dmt→IMAGE_MIME_PATTERN | fmt→PERSISTED_OUTPUT_PATTERN
//   【助手域 106863–107035】v$→isRecordObject | y$→readTrimmedString | b$→readFirstStringField | pmt→readRawInput | mmt→readRawOutput
//   hmt→resolveNodeReplOperation | gmt→tryParseJsonObject | _mt→collectParsedInputs | vmt→resolveUserTitle | ymt→readFirstFieldOfEntries
//   x$→extractOutputText | bmt→stripArrowPrompts | xmt→filterAttachedImageLines | Smt→stripLeadingNewlines | S$→extractErrorSummary
//   Cmt→collectResultImages | C$→hasBrowserTurnEndImages | wmt→parsePersistedOutput
//   【视图族】Tmt→resolveNodeReplModel（107036）| Emt→NodeReplImageGallery（107053）| Amt→looksLikeJsonText（107115）
//   jmt→isShortSingleLineText（107124）| Mmt→resolveNodeReplHeader（107134）| Nmt→NodeReplToolView（107216）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 X/wa（button-laUijeDG.js；wa pass-1 canonical 同 ToolLayoutBlocks 判例）
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../modules/Conversation'; // 原 kZ/AZ/jZ（§1 共享原语留守面，A0-S4-4b）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { ImageGalleryGroup, ImageLightbox } from '../../modules/PreviewCards'; // 原 qk/Wk（styles 50165/49882；图像画廊域 canonical）
import { IMAGE_THUMBNAIL_CLASS, IMAGE_INNER_CLASS } from '../../modules/MarkdownIntegration'; // 原 Gk/Kk（styles 50163/50164；Kk export 〔A1-P1-B15〕补）
import { CodeSurfaceCard, NODE_REPL_TOOL_ICON, PLAIN_TEXT_OUTPUT_MAX_LENGTH } from './CodeSurfaceBlocks'; // 原 w$/Dmt/kmt（B14 既录 107180/107112/107114）
import { ExternalLink as IconExternalLink } from 'lucide-react'; // 原 q_（styles 27013 Sa('external-link')；A0-S3b 判例 npm lucide-react@1.35.0）

/* ── NodeRepl 族（styles 106856–107111 + 107115–107179 + 107216–107431） ── */
var NODE_REPL_GENERIC_TITLE_PATTERN = /(?:\bjs\b|\bjavascript\b|node[\s_-]*repl)/i,
  LEADING_NEWLINES_PATTERN = /^(?:[ \t]*\r?\n)+/,
  REPL_ARROW_PROMPT_PATTERN = /(^|\n)=> /g,
  ATTACHED_IMAGE_LINE_PATTERN = /^\[Attached image\/[^\]]+\]$/u,
  IMAGE_MIME_PATTERN = /^image\/[a-z0-9.+-]+$/iu,
  PERSISTED_OUTPUT_PATTERN =
    /^<persisted-output>\s*\nOutput too large \(([^)]+)\)\. Full output saved to: ([^\n]+)\n\nPreview \([^)]+\):\n([\s\S]*?)\n<\/persisted-output>\s*$/;
function isRecordObject(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function readTrimmedString(e: any) {
  if (typeof e == `string`) return e.trim().length > 0 ? e : void 0;
}
function readFirstStringField(e: any, t: any) {
  for (let n of t) {
    let t = readTrimmedString(e[n]);
    if (t) return t;
  }
}
function readRawInput(e: any) {
  if (isRecordObject(e)) return e.rawInput ?? e.input;
}
function readRawOutput(e: any) {
  if (isRecordObject(e)) return e.rawOutput ?? e.output ?? e.result;
}
function resolveNodeReplOperation(e: any) {
  let t = (e.toolName?.trim() || e.kind).toLowerCase();
  return t === `js_reset` || t === `mcp__node_repl__js_reset`
    ? `reset`
    : t === `js_add_node_module_dir` || t === `mcp__node_repl__js_add_node_module_dir`
      ? `add-module-dir`
      : `run`;
}
function tryParseJsonObject(e: any) {
  if (isRecordObject(e)) return e;
  if (typeof e == `string`)
    try {
      let t = JSON.parse(e);
      return isRecordObject(t) ? t : void 0;
    } catch {
      return;
    }
}
function collectParsedInputs(e: any) {
  let t: any[] = [];
  for (let n of [e.input, readRawInput(e.raw)]) {
    let e = tryParseJsonObject(n);
    e && !t.includes(e) && t.push(e);
  }
  return t;
}
function resolveUserTitle(e: any, t: any) {
  for (let n of [...t.map((e: any) => e.title), e.title]) {
    let e = readTrimmedString(n)?.trim();
    if (e && !NODE_REPL_GENERIC_TITLE_PATTERN.test(e)) return e;
  }
}
function readFirstFieldOfEntries(e: any, t: any) {
  for (let n of e) {
    let e = readFirstStringField(n, t);
    if (e) return e;
  }
}
function extractOutputText(e: any, t : any = 0): any {
  if (t > 4) return;
  let n = readTrimmedString(e);
  if (n) return n;
  if (typeof e == `number` || typeof e == `boolean` || typeof e == `bigint`) return String(e);
  if (Array.isArray(e)) {
    let n = e.map((e: any) => extractOutputText(e, t + 1)).filter((e: any) => e !== void 0);
    return n.length > 0
      ? n.join(`
`)
      : void 0;
  }
  if (!isRecordObject(e)) return;
  if (e.type === `text`) {
    let t = readFirstStringField(e, [`value`, `text`, `content`]);
    if (t) return t;
  }
  let r = readTrimmedString(e.logs),
    i = extractOutputText(e.result, t + 1);
  if (r || i)
    return [r, i].filter((e: any) => e !== void 0).join(`
`);
  for (let n of [`value`, `output`, `text`, `content`, `stdout`, `message`]) {
    let r = extractOutputText(e[n], t + 1);
    if (r) return r;
  }
}
function stripArrowPrompts(e: any) {
  return e && e.replace(REPL_ARROW_PROMPT_PATTERN, `$1`);
}
function filterAttachedImageLines(e: any, t: any) {
  if (!e || !t) return e;
  let n = e
    .split(
      `
`,
    )
    .filter((e: any) => !ATTACHED_IMAGE_LINE_PATTERN.test(e.trim()))
    .join(
      `
`,
    )
    .trim();
  return n === `(no output)` || n.length === 0 ? void 0 : n;
}
function stripLeadingNewlines(e: any) {
  return e && e.replace(LEADING_NEWLINES_PATTERN, ``);
}
function extractErrorSummary(e: any, t : any = 0): any {
  if (t > 4) return;
  if (typeof e == `string`) {
    let t = e.trim();
    return t.length > 0 ? { summary: t } : void 0;
  }
  if (!isRecordObject(e)) return;
  if (`error` in e) {
    let n = extractErrorSummary(e.error, t + 1);
    if (n) return n;
  }
  let n = readFirstStringField(e, [`message`, `errorText`]),
    r = readTrimmedString(e.name)?.trim(),
    i = readTrimmedString(e.stack);
  if (n) {
    let e = n.trim();
    return { summary: r && !e.startsWith(`${r}:`) ? `${r}: ${e}` : e, ...(i ? { stack: i } : {}) };
  }
}
function collectResultImages(e: any) {
  let t: any[] = [],
    n = new Set(),
    r = new Set(),
    i = (e: any) => {
      let r = readTrimmedString(e.base64) ?? readTrimmedString(e.data),
        i = readTrimmedString(e.mimeType)?.trim();
      if (!r || !i || !IMAGE_MIME_PATTERN.test(i)) return;
      let a = `${i}:${r.length}:${r.slice(0, 24)}`;
      n.has(a) || (n.add(a), t.push({ base64: r, mimeType: i }));
    },
    a = (e: any) => {
      if (!(!e || typeof e != `object` || r.has(e))) {
        if ((r.add(e), Array.isArray(e))) {
          for (let t of e) a(t);
          return;
        }
        if (isRecordObject(e)) {
          (e.type === `image` || `base64` in e) && i(e);
          for (let t of Object.values(e)) a(t);
        }
      }
    };
  for (let t of e) a(t);
  return t;
}
function hasBrowserTurnEndImages(e: any, t : any = new Set()): any {
  return !e || typeof e != `object` || t.has(e)
    ? !1
    : (t.add(e),
      Array.isArray(e)
        ? e.some((e: any) => hasBrowserTurnEndImages(e, t))
        : isRecordObject(e)
          ? e.kind === `node_repl_images` && e.source === `browser_turn_end`
            ? !0
            : Object.values(e).some((e: any) => hasBrowserTurnEndImages(e, t))
          : !1);
}
function parsePersistedOutput(e: any) {
  if (!e) return {};
  let t = PERSISTED_OUTPUT_PATTERN.exec(e);
  if (!t) return { resultText: e };
  let [, n, r, i] = t;
  return !n || !r
    ? { resultText: e }
    : {
        ...(i?.trim() ? { resultText: i } : {}),
        persistedResult: { artifactPath: r.trim(), sizeLabel: n.trim() },
      };
}
function resolveNodeReplModel(e: any): any {
  let t = collectParsedInputs(e),
    n = [e.output, readRawOutput(e.raw)].filter((e: any) => e !== void 0),
    r = n.map((e: any) => extractOutputText(e)).find((e: any) => e !== void 0),
    i = collectResultImages([...n, e.raw]),
    a = parsePersistedOutput(filterAttachedImageLines(stripArrowPrompts(r), i.length > 0));
  return {
    operation: resolveNodeReplOperation(e),
    userTitle: resolveUserTitle(e, t),
    code: stripLeadingNewlines(readFirstFieldOfEntries(t, [`code`])),
    moduleDirectory: readFirstFieldOfEntries(t, [`dir`, `path`])?.trim(),
    ...a,
    ...(hasBrowserTurnEndImages(e.raw) ? { displaySource: `browser_turn_end` } : {}),
    error: extractErrorSummary(e.error) ?? (e.status === `failed` ? n.map((e: any) => extractErrorSummary(e)).find(Boolean) : void 0),
    images: i,
  };
}
function NodeReplImageGallery({ images: e, resultImageLabel: t }: any) {
  let { intl: n } = useIntlContext(),
    [r, i] = (0, React.useState)(0),
    [a, o] = (0, React.useState)(!1),
    s = (0, React.useRef)([] as any[]),
    c = (0, React.useMemo)(
      () =>
        e.map((e: any, n: any) => ({
          alt: `${t} ${n + 1}`,
          filename: `result-image-${n + 1}`,
          src: `data:${e.mimeType};base64,${e.base64}`,
        })),
      [e, t],
    ),
    l = n.formatMessage({ id: `chat.attachments.preview.open` });
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ImageGalleryGroup, {
        "data-node-repl-image-gallery": ``,
        grouped: c.length >= 2,
        children: c.map((t: any, n: any) =>
          (0, $.jsx)(
            `button`,
            {
              ref: (e: any) => {
                s.current[n] = e;
              },
              type: `button`,
              "aria-label": `${l} ${n + 1}`,
              className: IMAGE_THUMBNAIL_CLASS,
              "data-image-thumbnail-trigger": ``,
              onClick: () => {
                (i(n), o(!0));
              },
              children: (0, $.jsx)(`img`, {
                alt: t.alt,
                className: IMAGE_INNER_CLASS,
                draggable: !1,
                loading: `lazy`,
                src: t.src,
              }),
            },
            `${e[n]?.mimeType}:${e[n]?.base64.length}:${n}`,
          ),
        ),
      }),
      (0, $.jsx)(ImageLightbox, {
        dialogTestId: `node-repl-image-lightbox`,
        imageTestId: `node-repl-image-lightbox-image`,
        initialIndex: r,
        items: c,
        onOpenChange: (e: any) => {
          (o(e), e || window.setTimeout(() => s.current[r]?.focus(), 0));
        },
        open: a,
      }),
    ],
  });
}
function looksLikeJsonText(e: any) {
  let t = e.trim();
  if (!(t.startsWith(`{`) || t.startsWith(`[`))) return !1;
  try {
    return (JSON.parse(t), !0);
  } catch {
    return !1;
  }
}
function isShortSingleLineText(e: any) {
  let t = e.trim();
  return (
    t.length > 0 &&
    t.length <= PLAIN_TEXT_OUTPUT_MAX_LENGTH &&
    !t.includes(`
`) &&
    !looksLikeJsonText(t)
  );
}
function resolveNodeReplHeader(e: any, t: any, n: any, r: any) {
  let i = t === `failed`,
    a = t === `denied`;
  if (a || t === `stopped`)
    return { title: r(a ? `chat.toolCall.nodeRepl.denied` : `chat.toolCall.nodeRepl.stopped`) };
  if (e.operation === `reset`)
    return {
      title: r(
        i
          ? `chat.toolCall.nodeRepl.resetFailed`
          : n
            ? `chat.toolCall.nodeRepl.resetting`
            : `chat.toolCall.nodeRepl.reset`,
      ),
    };
  if (e.operation === `add-module-dir`)
    return {
      title: r(
        i
          ? `chat.toolCall.nodeRepl.configureFailed`
          : n
            ? `chat.toolCall.nodeRepl.configuring`
            : `chat.toolCall.nodeRepl.configured`,
      ),
      detail: e.moduleDirectory,
    };
  let o = r(
    i
      ? `chat.toolCall.nodeRepl.failed`
      : n
        ? `chat.toolCall.nodeRepl.processing`
        : `chat.toolCall.nodeRepl.finished`,
  );
  return {
    title: e.userTitle ?? o,
    status: e.userTitle
      ? r(
          i
            ? `chat.toolCall.nodeRepl.failed`
            : n
              ? `chat.toolCall.nodeRepl.processing`
              : `chat.toolCall.nodeRepl.completed`,
        )
      : void 0,
  };
}
function NodeReplToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = (0, React.useMemo)(() => resolveNodeReplModel(n), [n]),
    i = (0, React.useCallback)((e: any) => t.formatMessage({ id: e }), [t]),
    a = (0, React.useMemo)(() => resolveNodeReplHeader(r, n.status, e.isRunning, i), [e.isRunning, i, r, n.status]),
    o = i(`chat.toolCall.nodeRepl.result`),
    s = i(`chat.toolCall.nodeRepl.noResult`),
    c = i(`chat.toolCall.nodeRepl.details`),
    l = i(`chat.toolCall.nodeRepl.detailContent`),
    u = i(`chat.toolCall.nodeRepl.technicalDetails`),
    d = i(`chat.toolCall.nodeRepl.copyResult`),
    f = i(`chat.toolCall.nodeRepl.copyDetails`),
    p = i(`chat.toolCall.nodeRepl.wrapLines`),
    m = i(`chat.toolCall.nodeRepl.resultImage`),
    h = r.persistedResult
      ? t.formatMessage(
          { id: `chat.toolCall.nodeRepl.fullResult` },
          { size: r.persistedResult.sizeLabel },
        )
      : void 0,
    g = n.status === `failed` ? (r.error?.summary ?? e.errorText) : void 0,
    _ = !!(r.code || r.error?.stack),
    v = !!(g || r.resultText || r.images.length > 0 || r.persistedResult),
    y = (r.operation === `run` || n.status === `failed`) && (v || _),
    b = e.canToggle ?? y,
    x = (0, React.useMemo)(
      () =>
        (0, $.jsxs)(`span`, {
          className: `inline-flex min-w-0 items-center gap-2`,
          children: [
            (0, $.jsx)(`span`, {
              className: `min-w-0 truncate font-medium text-foreground-subtle`,
              children: a.title,
            }),
            a.status
              ? (0, $.jsxs)(`span`, {
                  className: `shrink-0 text-foreground-subtlest`,
                  children: [`· `, a.status],
                })
              : null,
            a.detail
              ? (0, $.jsx)(`code`, {
                  className: `min-w-0 truncate font-mono text-foreground-subtlest`,
                  children: a.detail,
                })
              : null,
          ],
        }),
      [a.detail, a.status, a.title],
    ),
    S = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `mb-2 space-y-3 py-1`,
          "data-testid": `node-repl-expanded-content`,
          children: [
            g
              ? (0, $.jsxs)(`section`, {
                  className: `space-y-1.5`,
                  children: [
                    (0, $.jsx)(`h4`, {
                      className: `text-ui-base font-medium text-destructive`,
                      children: o,
                    }),
                    (0, $.jsx)(`p`, {
                      className: `whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive`,
                      children: g,
                    }),
                  ],
                })
              : r.resultText && isShortSingleLineText(r.resultText)
                ? (0, $.jsx)(`p`, {
                    className: `break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle`,
                    "data-testid": `node-repl-result-surface`,
                    children: r.resultText.trim(),
                  })
                : r.resultText
                  ? (0, $.jsx)(`div`, {
                      className: `max-h-72 overflow-auto rounded-xl border border-border bg-card`,
                      "data-testid": `node-repl-result-surface`,
                      children: (0, $.jsx)(CodeSurfaceCard, {
                        cardSurface: !0,
                        code: r.resultText,
                        copyLabel: d,
                        eagerLayout: !0,
                        label: o,
                        language: looksLikeJsonText(r.resultText) ? `json` : `log`,
                        wrapLabel: p,
                      }),
                    })
                  : !e.isRunning && r.images.length === 0
                    ? (0, $.jsx)(`p`, {
                        className: `text-ui-base text-foreground-subtle`,
                        children: s,
                      })
                    : null,
            r.images.length > 0 ? (0, $.jsx)(NodeReplImageGallery, { images: r.images, resultImageLabel: m }) : null,
            r.persistedResult && h
              ? (0, $.jsxs)(`div`, {
                  className: `flex flex-wrap items-center gap-2 text-ui-base text-foreground-subtle`,
                  children: [
                    (0, $.jsx)(`span`, { children: h }),
                    e.onOpenCodeViewer
                      ? (0, $.jsxs)(Button, {
                          type: `button`,
                          variant: `link`,
                          size: `xs`,
                          className: `px-0`,
                          onClick: () =>
                            e.onOpenCodeViewer?.({
                              type: `file`,
                              title: o,
                              path: r.persistedResult.artifactPath,
                            }),
                          children: [
                            i(`chat.toolCall.nodeRepl.openFullResult`),
                            (0, $.jsx)(IconExternalLink, { className: `size-3` }),
                          ],
                        })
                      : null,
                  ],
                })
              : null,
            _
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
                          c,
                        ],
                      }),
                    }),
                    (0, $.jsx)(CollapsibleContent, {
                      children: (0, $.jsxs)(`div`, {
                        className: `space-y-2 pt-2`,
                        children: [
                          r.code
                            ? (0, $.jsx)(`div`, {
                                className: `max-h-72 overflow-auto rounded-xl border border-border bg-card`,
                                "data-testid": `node-repl-detail-surface`,
                                children: (0, $.jsx)(CodeSurfaceCard, {
                                  cardSurface: !0,
                                  code: r.code,
                                  copyLabel: f,
                                  eagerLayout: !0,
                                  label: l,
                                  language: `javascript`,
                                  wrapLabel: p,
                                }),
                              })
                            : null,
                          r.error?.stack
                            ? (0, $.jsx)(`div`, {
                                className: `max-h-72 overflow-auto rounded-xl border border-border bg-card`,
                                "data-testid": `node-repl-detail-surface`,
                                children: (0, $.jsx)(CodeSurfaceCard, {
                                  cardSurface: !0,
                                  code: r.error.stack,
                                  copyLabel: f,
                                  eagerLayout: !0,
                                  label: u,
                                  language: `log`,
                                  wrapLabel: p,
                                }),
                              })
                            : null,
                        ],
                      }),
                    }),
                  ],
                })
              : null,
          ],
        }),
      [e.isRunning, e.onOpenCodeViewer, f, d, l, c, i, h, _, r, s, m, o, u, g, p],
    );
  return r.displaySource === `browser_turn_end`
    ? (0, $.jsx)(NodeReplImageGallery, { images: r.images, resultImageLabel: m })
    : (0, $.jsxs)($.Fragment, {
        children: [
          (0, $.jsx)(ToolLayout, {
            toolId: n.toolId,
            icon: NODE_REPL_TOOL_ICON,
            showIcon: e.showIcon !== !1,
            canToggle: b,
            forceOpen: e.forceOpen ?? !1,
            kindLabel: null,
            sourceLabel: e.sourceLabel,
            primaryText: x,
            statusLabel: i(`chat.toolCall.nodeRepl.failed`),
            statusTooltip: g,
            showFailureStatus: n.status === `failed` && !!r.userTitle,
            isRunning: e.isRunning,
            title: a.title,
            renderContent: y ? S : void 0,
          }),
          (0, $.jsx)(ToolSnapshotRefs, {
            refs: n.snapshotRefs ?? [],
            onLoadFullToolCallFields: e.onLoadFullToolCallFields
              ? () => e.onLoadFullToolCallFields?.(n.toolId)
              : void 0,
          }),
        ],
      });
}

export { NODE_REPL_GENERIC_TITLE_PATTERN, LEADING_NEWLINES_PATTERN, REPL_ARROW_PROMPT_PATTERN, ATTACHED_IMAGE_LINE_PATTERN, IMAGE_MIME_PATTERN, PERSISTED_OUTPUT_PATTERN, isRecordObject, readTrimmedString, readFirstStringField, readRawInput, readRawOutput, resolveNodeReplOperation, tryParseJsonObject, collectParsedInputs, resolveUserTitle, readFirstFieldOfEntries, extractOutputText, stripArrowPrompts, filterAttachedImageLines, stripLeadingNewlines, extractErrorSummary, collectResultImages, hasBrowserTurnEndImages, parsePersistedOutput, resolveNodeReplModel, NodeReplImageGallery, looksLikeJsonText, isShortSingleLineText, resolveNodeReplHeader, NodeReplToolView };
