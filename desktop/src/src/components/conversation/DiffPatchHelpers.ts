// A1-P1-B13：diff 行解析配色域逐字重建（styles js 100466–100506，共 41 行，2 处改名）。
// A1-P1-B14：gut 卫星收割——diff 截断标记域（23196–23211）+ 解析域（23274–23279）+ 轻量 diff 预览域
//   （100507–100567，共 83 行，20 处改名）并入本叶；gut@100507 = LightweightDiffPreview（B13 留批第 4 项）。
//   手写面对账：components/modals/PlainTextDiffPreview.tsx（A0-S4-4a 手写 JSX 体，F19 域 GitReview/CodeViewer
//   消费）与束真身 gut 语义同构、型面不同——F19 域界障集群（Glt/Wlt 横切）请编排方裁定，本批不越域。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B12 留批卫星，gut@100507 DiffView 之先行实体化铺路）。
// 纯闭合零依赖；消费面留批（gut 束体未实体化，F19 域）。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；无参数缝（零参数函数）。
// 区段切分墓碑：左界 = ToolLayoutBlocks 右界邻接（lQ@100465）；右界 gut@100507（DiffView，F19 域）。
// 注意：CTV parsePatchLines/inferPatchLanguage 双 declare（105/106）为手写面近似签名，与 mut/hut 真身不符，
//   不构成本叶消费面，原样留存（见 A1-P1-B13.report.md §七）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   mut→parseDiffLine（100466）| hut→diffKindVisualStyle（100474）
//   【B14 新增·真实 import】G→useIntlContext（I18n useZCodeIntl）| Z→cn（UtilsCn）
//   【B14 新增·diff 截断标记域 23196–23211】
//   ehe→MAX_PLAINTEXT_PREVIEW_LINES（23196）| the→MAX_PLAINTEXT_PREVIEW_CHARS（23197）
//   nhe→MAX_PLAINTEXT_HEAD_LINES（23198）| rhe→PLAINTEXT_TRUNCATION_WINDOW（23199）
//   ihe→DIFF_TRUNCATED_MARKER_PREFIX（23200）| ahe→DIFF_TRUNCATED_MARKER_PATTERN（23201）
//   ohe→LOCK_FILE_BASE_NAMES（23202）| she→ZSH_SHELL_FILE_NAMES（23210）| che→GRADLE_FILE_EXTENSIONS（23211）
//   【B14 新增·diff 截断标记解析域 23274–23279】dhe→parseTruncatedMarkerCount（23274）
//   【B14 新增·轻量 diff 预览域 100507–100567】gut→LightweightDiffPreview（100507）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）〔A1-P1-B14〕
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）〔A1-P1-B14〕
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）〔A1-P1-B14〕

/* ── diff 行解析配色域（styles 100466–100506） ── */
function parseDiffLine(e: any) {
  return e.startsWith(`+`)
    ? { content: e.slice(1), kind: `added`, marker: `+`, raw: e }
    : e.startsWith(`-`)
      ? { content: e.slice(1), kind: `removed`, marker: `-`, raw: e }
      : e.startsWith(` `)
        ? { content: e.slice(1), kind: `context`, marker: ` `, raw: e }
        : { content: e, kind: `context`, marker: ``, raw: e };
}
function diffKindVisualStyle(e: any) {
  return e === `added`
    ? {
        lineNumberClassName: `text-diff-added`,
        rowStyle: {
          backgroundColor: `color-mix(in srgb, var(--color-diff-added) 14%, transparent)`,
          boxShadow: `inset 3px 0 0 var(--color-diff-added)`,
        },
        gutterStyle: {
          backgroundColor: `color-mix(in srgb, var(--color-diff-added) 18%, var(--color-background))`,
          boxShadow: `inset 3px 0 0 var(--color-diff-added)`,
          color: `var(--color-diff-added)`,
        },
      }
    : e === `removed`
      ? {
          lineNumberClassName: `text-diff-removed`,
          rowStyle: {
            backgroundColor: `color-mix(in srgb, var(--color-diff-removed) 14%, transparent)`,
            boxShadow: `inset 3px 0 0 var(--color-diff-removed)`,
          },
          gutterStyle: {
            backgroundColor: `color-mix(in srgb, var(--color-diff-removed) 18%, var(--color-background))`,
            boxShadow: `inset 3px 0 0 var(--color-diff-removed)`,
            color: `var(--color-diff-removed)`,
          },
        }
      : {
          lineNumberClassName: `text-foreground-subtlest`,
          gutterStyle: { backgroundColor: `var(--color-background)` },
        };
}


/* ── diff 截断标记域（styles 23196–23211） ── */
var MAX_PLAINTEXT_PREVIEW_LINES = 1200,
  MAX_PLAINTEXT_PREVIEW_CHARS = 18e4,
  MAX_PLAINTEXT_HEAD_LINES = 1200,
  PLAINTEXT_TRUNCATION_WINDOW = 800,
  DIFF_TRUNCATED_MARKER_PREFIX = `\\ __ZCODE_DIFF_TRUNCATED__:`,
  DIFF_TRUNCATED_MARKER_PATTERN = /^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$/,
  LOCK_FILE_BASE_NAMES = new Set([
    `bun.lock`,
    `bun.lockb`,
    `npm-shrinkwrap.json`,
    `package-lock.json`,
    `pnpm-lock.yaml`,
    `yarn.lock`,
  ]),
  ZSH_SHELL_FILE_NAMES = new Set([`zsh`]),
  GRADLE_FILE_EXTENSIONS = [`.gradle`, `.gradle.kts`];

/* ── diff 截断标记解析域（styles 23274–23279） ── */
function parseTruncatedMarkerCount(e: any) {
  let t = DIFF_TRUNCATED_MARKER_PATTERN.exec(e);
  if (!t) return null;
  let n = Number.parseInt(t[1] ?? ``, 10);
  return !Number.isFinite(n) || n <= 0 ? null : n;
}

/* ── 轻量 diff 预览域（styles 100507–100567） ── */
function LightweightDiffPreview({ className: e, codePreviewSettings: t, lines: n, renderLineContent: r, ...i }: any) {
  let { intl: a } = useIntlContext();
  return (0, $.jsx)(`div`, {
    className: cn(`w-full min-w-0 overflow-auto bg-background`, e),
    "data-lightweight-diff-preview": !0,
    ...i,
    children: (0, $.jsx)(`div`, {
      className: cn(
        `min-w-full font-mono leading-relaxed text-foreground`,
        !t.wrapLongLines && `w-max`,
      ),
      "data-lightweight-diff-scroll-content": !0,
      style: { fontSize: t.fontSizePx },
      children: n.map((e: any, n: any) => {
        let i = parseTruncatedMarkerCount(e);
        if (i !== null)
          return (0, $.jsx)(
            `div`,
            {
              className: `px-3 py-1 text-foreground-subtle`,
              children: a.formatMessage(
                { id: `diff.preview.truncatedLines` },
                { count: String(i) },
              ),
            },
            n,
          );
        let o = parseDiffLine(e),
          s = diffKindVisualStyle(o.kind);
        return (0, $.jsxs)(
          `div`,
          {
            className: `flex min-w-full w-full`,
            style: s.rowStyle,
            children: [
              t.showLineNumbers
                ? (0, $.jsx)(`span`, {
                    "aria-hidden": `true`,
                    className: cn(
                      `sticky left-0 z-[1] w-12 shrink-0 select-none border-r border-border px-2 text-right tabular-nums`,
                      s.lineNumberClassName,
                    ),
                    style: s.gutterStyle,
                    children: n + 1,
                  })
                : null,
              (0, $.jsx)(`code`, {
                className: cn(
                  `block flex-1 px-3`,
                  t.wrapLongLines ? `whitespace-pre-wrap break-words` : `whitespace-pre`,
                ),
                children: r?.(o, n) ?? (o.content || ` `),
              }),
            ],
          },
          n,
        );
      }),
    }),
  });
}

export { parseDiffLine, diffKindVisualStyle, MAX_PLAINTEXT_PREVIEW_LINES, MAX_PLAINTEXT_PREVIEW_CHARS, MAX_PLAINTEXT_HEAD_LINES, PLAINTEXT_TRUNCATION_WINDOW, DIFF_TRUNCATED_MARKER_PREFIX, DIFF_TRUNCATED_MARKER_PATTERN, LOCK_FILE_BASE_NAMES, ZSH_SHELL_FILE_NAMES, GRADLE_FILE_EXTENSIONS, parseTruncatedMarkerCount, LightweightDiffPreview };
