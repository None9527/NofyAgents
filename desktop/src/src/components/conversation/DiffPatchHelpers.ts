// A1-P1-B13：diff 行解析配色域逐字重建（styles js 100466–100506，共 41 行，2 处改名）。
// A1-P1-B14：gut 卫星收割——diff 截断标记域（23196–23211）+ 解析域（23274–23279）+ 轻量 diff 预览域
//   （100507–100567，共 83 行，20 处改名）并入本叶；gut@100507 = LightweightDiffPreview（B13 留批第 4 项）。
//   手写面对账：components/modals/PlainTextDiffPreview.tsx（A0-S4-4a 手写 JSX 体，F19 域 GitReview/CodeViewer
//   消费）与束真身 gut 语义同构、型面不同——F19 域界障集群（Glt/Wlt 横切）请编排方裁定，本批不越域。
// A1-P1-B15：diff 截断域余成员收割——Mh 单文件 diff 归一（22561–22572）+ lhe/uhe 截断标记/分区计数
//   （23212–23273）+ lg–fg 截断预览归一链（23280–23389，110 行）并入本叶（共 184 行，19 处改名；B14 留批第 6 项办结）。
//   Xp@16617（路径→高亮语言，Jp/Yp 语言表）/yh@20767（patch 文本→解析数组，rce/lme 链）为 gut 域深依赖，
//   叶内 declare 留批（F19 界障集群续留批）；消费面 fg@23359 resolveDiffPreviewLines（gut 束体未实体化）。
//   逐字证明增补：/tmp/a1r0-p1/p15/p15-roundtrip.js + p15-leafcheck.js（DiffPatchExt4 段）。
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
//   【B15 新增·Mh 单文件 diff 22561–22572】Mh→parseSingleFileDiff（22561）
//   【B15 新增·截断标记/分区计数 23212–23273】lhe→buildTruncatedMarker（23212）| uhe→countUnifiedDiffSections（23215）
//   【B15 新增·截断预览归一链 23280–23389】lg→isHunkHeaderLine（23280）| fhe→maxHunkEndLine（23283）
//   phe→truncateLineList（23299）| mhe→extractDiffHeaderPath（23307）| hhe→stripDiffPathPrefix（23315）
//   ghe→isLockfileName（23318）| _he→isGradlefilePath（23321）| vhe→isHighlightSuppressedPath（23326）
//   yhe→filterNonStructuralLines（23329）| ug→extractLinesAfterFirstHunk（23339）| dg→normalizePreviewLines（23351）
//   bhe→normalizePatchLines（23356）| fg→resolveDiffPreviewLines（23359）
//   【B15 新增·深依赖 declare（留批）】Xp→resolveLanguageForPath（16617）| yh→parsePatchText（20767）
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

/* ── diff 截断域余成员（styles 22561–22572 + 23212–23273 + 23280–23389）〔A1-P1-B15〕 ── */
/** 原 Xp（16617）：路径 → 高亮语言（Jp/Yp 语言映射表，gut 域深依赖未实体化，留批） */
declare function resolveLanguageForPath(path: string): string;
/** 原 yh（20767）：patch 文本 → 解析结果数组（rce 分隔/lme 解析链深依赖未实体化，留批） */
declare function parsePatchText(text: string, cacheKeyPrefix?: string, throwOnError?: boolean): Array<{ files: Array<{ name?: string; [key: string]: unknown }>; [key: string]: unknown }>;

function parseSingleFileDiff(e: any) {
  let t = parsePatchText(e);
  if (t.length !== 1)
    throw (
      console.error(t),
      Error(`PatchDiff: Provided patch must include only 1 patch, with 1 diff`)
    );
  let { files: n } = t[0];
  if (n.length !== 1)
    throw (console.error(n), Error(`FileDiff: Provided patch must contain exactly 1 file diff`));
  return n[0];
}
function buildTruncatedMarker(e: any) {
  return `${DIFF_TRUNCATED_MARKER_PREFIX}${e}`;
}
function countUnifiedDiffSections(e: any) {
  let t = e.split(/\r?\n/),
    n = t.filter((e: any) => e.startsWith(`diff --git `)).length;
  if (n > 0) return n;
  let r = (e: any) => {
      let t = e.match(/^@@\s-\d+(?:,(\d+))?\s\+\d+(?:,(\d+))?\s@@/);
      return t ? { oldLines: Number(t[1] ?? `1`), newLines: Number(t[2] ?? `1`) } : null;
    },
    i = (e: any) => (t[e]?.startsWith(`--- `) ?? !1) && (t[e + 1]?.startsWith(`+++ `) ?? !1),
    a = (e: any, n: any, r: any) => {
      let a = e,
        o = n,
        s = r;
      for (; o > 0 || s > 0;) {
        let e = t[a];
        if (e === void 0) return null;
        if (i(a)) return a;
        if (e.startsWith(`\\ `)) {
          a += 1;
          continue;
        }
        if (e.startsWith(` `)) (--o, --s);
        else if (e.startsWith(`-`)) --o;
        else if (e.startsWith(`+`)) --s;
        else return null;
        if (o < 0 || s < 0) return null;
        a += 1;
      }
      for (; t[a]?.startsWith(`\\ `);) a += 1;
      return a;
    },
    o = 0,
    s = 0;
  for (; s < t.length;) {
    let e = t[s],
      n = t[s + 1];
    if (!e?.startsWith(`--- `) || !n?.startsWith(`+++ `)) {
      s += 1;
      continue;
    }
    let i = s + 2,
      c = !1,
      l = !1;
    for (; i < t.length;) {
      let e = r(t[i] ?? ``);
      if (!e) break;
      l = !0;
      let n = a(i + 1, e.oldLines, e.newLines);
      if (n === null) break;
      ((c = !0), (i = n));
    }
    if (!c && !l) {
      s += 1;
      continue;
    }
    ((o += 1), (s = c ? i : s + 2));
  }
  return o;
}
function isHunkHeaderLine(e: any) {
  return e === `@@` || e.startsWith(`@@ `);
}
function maxHunkEndLine(e: any) {
  let t = 0;
  for (let n of e) {
    if (!n.startsWith(`@@ `)) continue;
    let e = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(n);
    if (!e) continue;
    let r = Number.parseInt(e[1] ?? `0`, 10),
      i = Number.parseInt(e[2] ?? `1`, 10),
      a = Number.parseInt(e[3] ?? `0`, 10),
      o = Number.parseInt(e[4] ?? `1`, 10),
      s = r + Math.max(0, Number.isNaN(i) ? 1 : i) - 1,
      c = a + Math.max(0, Number.isNaN(o) ? 1 : o) - 1;
    t = Math.max(t, s, c);
  }
  return t;
}
function truncateLineList(e: any) {
  if (e.length <= PLAINTEXT_TRUNCATION_WINDOW) return [...e];
  let t = PLAINTEXT_TRUNCATION_WINDOW - 1,
    n = Math.ceil(t / 2),
    r = t - n,
    i = e.length - t;
  return [...e.slice(0, n), buildTruncatedMarker(i), ...e.slice(e.length - r)];
}
function extractDiffHeaderPath(e: any) {
  for (let t of e) {
    if (!t.startsWith(`--- `) && !t.startsWith(`+++ `)) continue;
    let e = t.slice(4).trim().split(`	`, 1)[0]?.trim() ?? ``;
    if (!(!e || e === `/dev/null`)) return e;
  }
  return null;
}
function stripDiffPathPrefix(e: any) {
  return e.replace(/^([ab])\//, ``);
}
function isLockfileName(e: any) {
  return e ? LOCK_FILE_BASE_NAMES.has(stripDiffPathPrefix(e).split(`/`).at(-1)?.toLocaleLowerCase() ?? ``) : !1;
}
function isGradlefilePath(e: any) {
  if (!e) return !1;
  let t = stripDiffPathPrefix(e).toLocaleLowerCase();
  return GRADLE_FILE_EXTENSIONS.some((e: any) => t.endsWith(e));
}
function isHighlightSuppressedPath(e: any) {
  return isLockfileName(e) || isGradlefilePath(e) ? !0 : e ? ZSH_SHELL_FILE_NAMES.has(resolveLanguageForPath(e)) : !1;
}
function filterNonStructuralLines(e: any) {
  return e.filter((e: any) =>
    e.trim()
      ? !e.startsWith(`diff --git `) &&
        !e.startsWith(`index `) &&
        !e.startsWith(`--- `) &&
        !e.startsWith(`+++ `)
      : !1,
  );
}
function extractLinesAfterFirstHunk(e: any) {
  let t = [],
    n = !1;
  for (let r of e) {
    if (!n) {
      isHunkHeaderLine(r) && (n = !0);
      continue;
    }
    isHunkHeaderLine(r) || t.push(r);
  }
  return n || t.length > 0 ? t : filterNonStructuralLines(e);
}
function normalizePreviewLines(e: any) {
  let t = truncateLineList(e);
  for (; t.length > 0 && t.at(-1) === ``;) t.pop();
  return t.length > 0 ? t : [``];
}
function normalizePatchLines(e: any) {
  return normalizePreviewLines(extractLinesAfterFirstHunk(e.split(/\r?\n/)));
}
function resolveDiffPreviewLines(e: any) {
  let t = e.split(/\r?\n/),
    n = countUnifiedDiffSections(e),
    r = n > 1,
    i = n === 0,
    a = t.some((e: any) => e === `--- /dev/null`),
    o = t.some((e: any) => e === `+++ /dev/null`),
    s = maxHunkEndLine(t),
    c = t.length > MAX_PLAINTEXT_PREVIEW_LINES || e.length > MAX_PLAINTEXT_PREVIEW_CHARS,
    l = s > MAX_PLAINTEXT_HEAD_LINES,
    u = extractDiffHeaderPath(t),
    d = isHighlightSuppressedPath(u),
    f = filterNonStructuralLines(t),
    p = f.length > 0 && !t.some(isHunkHeaderLine);
  if (!i && !r && !a && !o && !c && !l && !p && !d) {
    try {
      let t = parsePatchText(e, void 0, !0);
      if (t.length === 1 && t[0]?.files.length === 1) return null;
    } catch {}
    return normalizePreviewLines(extractLinesAfterFirstHunk(t));
  }
  if (p) return normalizePreviewLines(f);
  if (i || d || ((a || o) && !c && !l)) return normalizePreviewLines(extractLinesAfterFirstHunk(t));
  if (!r && !c && !l)
    try {
      if (resolveLanguageForPath(u ?? parseSingleFileDiff(e).name) !== `text`) return null;
    } catch {
      return normalizePreviewLines(extractLinesAfterFirstHunk(t));
    }
  return normalizePreviewLines(extractLinesAfterFirstHunk(t));
}

export { parseSingleFileDiff, buildTruncatedMarker, countUnifiedDiffSections, isHunkHeaderLine, maxHunkEndLine, truncateLineList, extractDiffHeaderPath, stripDiffPathPrefix, isLockfileName, isGradlefilePath, isHighlightSuppressedPath, filterNonStructuralLines, extractLinesAfterFirstHunk, normalizePreviewLines, normalizePatchLines, resolveDiffPreviewLines }; // 〔A1-P1-B15〕diff 截断域余成员（Xp/yh 深依赖 declare 留批，不导出）

export { parseDiffLine, diffKindVisualStyle, MAX_PLAINTEXT_PREVIEW_LINES, MAX_PLAINTEXT_PREVIEW_CHARS, MAX_PLAINTEXT_HEAD_LINES, PLAINTEXT_TRUNCATION_WINDOW, DIFF_TRUNCATED_MARKER_PREFIX, DIFF_TRUNCATED_MARKER_PATTERN, LOCK_FILE_BASE_NAMES, ZSH_SHELL_FILE_NAMES, GRADLE_FILE_EXTENSIONS, parseTruncatedMarkerCount, LightweightDiffPreview };
