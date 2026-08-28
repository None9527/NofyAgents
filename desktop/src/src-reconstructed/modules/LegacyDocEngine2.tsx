/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngine2.tsx — legacy-doc 内部排版引擎 · [E2] 文本测量与断行布局
 * （解混淆重建 · D8 Stage B4 · Office 预览族 / legacy-doc 引擎展开第 2 段）
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，行号锚点均指此）
 * 本文件覆盖：[E2] jsx 11177-11846（登记表作 11177-11993；其中 11847-11993
 * 为 jsx-runtime 句柄与 wasm 注册/导入管线，已在 previewPaneOfficeLegacyDocContent.tsx
 * §1/§2 全量重建，不重复收入）。
 *
 * 段职责（按实际代码核定）：
 *   1) Canvas 文本测量宿主：单例 2d 上下文、按字体的测量缓存、
 *      表情符号过绘修正（canvas vs DOM 实测差）、字素级宽度缓存。
 *   2) 浏览器排版怪癖探测（Safari/Chromium 分支：行拟合容差、
 *      CJK 闭引号粘着、keep-all 标点、前缀宽度偏好、软连字符早断）。
 *   3) 令牌流 → 宽度表（buildWidthTable）：逐令牌测量、CJK 再切分、
 *      字间距/制表位/软连字符/硬换行记账、硬换行分块重映射、BiDi 段级。
 *   4) 断行行走器：简单快路径（walkSimpleLine）与块级完整路径
 *      （walkChunkLine：字素级断点、优先断点、软连字符、制表位、字间距），
 *      行数/最大宽度统计、行文本提取（含软连字符补显）。
 *
 * 依赖：[E1] LegacyDocEngine1（令牌流/BiDi 段级/标点集/脚本探测）。
 * 被依赖：[E4] LegacyDocEngine4 的布局服务（缓存测量/命中测试）。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射表（行号 = jsx）
 * ----------------------------------------------------------------------------
 *  测量宿主：
 *   en/ln → 单例测量上下文 (11094/11106) · tn/un → 字体测量缓存 (11095/11109)
 *   dn → measureTextCached (11112) · fn → getLineLayoutQuirks (11119)
 *   pn → parseFontSizeFromFont (11139) · mn/sn → 字素 Segmenter 单例 (11144)
 *   an/on → EMOJI_PRESENTATION_RE/EMOJI_SEQUENCE_RE (11098/11099)
 *   hn → isEmojiPresentation (11148) · gn → containsEmojiSequence (11151)
 *   cn/_n → 表情过绘修正缓存/测量 (11153/11154)
 *   vn → countEmojiSegments (11168) · yn → emojiCountOf (11174)
 *   bn → emojiCorrectedWidth (11177) · xn → computeBreakableFitAdvances (11180)
 *   Sn → openFontMeasureSession (11222)
 *  宽度表记账助手：
 *   Cn → isFitOnlyKind (11233) · wn → isLineEndShrinkableKind (11236)
 *   Tn → skipShrinkableKinds (11239) · En → advanceToTabStop (11247)
 *   Dn → fitLetterSpacingAt (11253) · On → addIfNonZero (11256)
 *   kn → letterSpacingAtSegment (11258) · An → lineEndFitAdvanceOf (11261)
 *   jn → fitAdvanceOf (11263) · Mn → paintAdvanceOf (11265)
 *   Nn → withTrailingLetterSpacing (11268) · Pn → plusLetterSpacing (11270)
 *   Fn → lowerBoundIndex (11273) · In → trailingLetterSpacingBefore (11280)
 *   Ln → advanceWithTrailingSpacing (11297)
 *  块定位：
 *   Rn → findChunkBySegment (11298) · zn → enterChunkAtCursor (11308)
 *   Bn → locateChunkForCursor (11318) · Vn → advanceToNextChunk (11323)
 *  断行行走：
 *   Hn → walkChunkLine (11324) · Un → walkSimpleLine (11438)
 *   Wn → walkLineFromCursor (11479) · Gn → walkNextLineFromCursor (11482)
 *   Kn → countLinesAndMaxWidth (11488)
 *  行文本提取：
 *   qn/Jn/Yn/Xn → 行字素缓存族 (11525-11533) · Zn → isSoftHyphenLineEnd (11536)
 *   Qn → appendStringSlice (11539) · $n → getLineGraphemeCache (11542)
 *   er → extractLineText (11546)
 *  CJK 再切分：
 *   tr/nr → CJK 字素 Segmenter 单例 (11566) · rr → createEmptyMeasuredText (11573)
 *   ir → segmentCJKRun (11600) · ar → applyKeepAllToCJKRuns (11640)
 *   or → graphemeCountForSpacing (11666) · sr → isHyphenLikeChar (11676)
 *   cr → hyphenBreakOffsets (11680) · lr → widthWithLetterSpacing (11687)
 *  宽度表构建与入口：
 *   ur → buildWidthTable (11689) · dr → remapChunksToWidthIndexes (11791)
 *   fr → measureTextLayout (11807) · pr → measurePreWrapLayout (11813)
 *   mr → measuredTextIdentity (11815) · hr → createLineFragment (11817)
 *   gr → countLayoutLines (11831) · _r → breakNextLine (11834)
 * ============================================================================
 */

import {
  segmentTextToLayoutTokens,
  mapBidiLevelsToSegmentStarts,
  containsCJK,
  allowsBreakAfter,
  endsWithClosingQuoteRun,
  isNumericTokenText,
  OPEN_PUNCT_SET,
  CLOSE_PUNCT_SET,
  CJK_NO_LINE_START_SET,
} from "./LegacyDocEngine1";
import type { TokenKind, LineLayoutQuirks, LayoutTokenStream } from "./LegacyDocEngine1";

/* ============================================================================
 * 类型
 * ==========================================================================*/

/** 可断字素宽度模式（原 xn 的 i 参数） */
export type BreakableFitMode = `sum-graphemes` | `pair-context` | `segment-prefixes`;

/** 单文本测量缓存条目（原 dn 缓存值，被 xn/yn 原地扩展） */
interface TextMeasureEntry {
  width: number;
  containsCJK: boolean;
  /** 表情符号计数（yn 惰性填充） */
  emojiCount?: number;
  /** 字素级断点宽度（xn 惰性填充；null = 单字素不可再分） */
  breakableFitAdvances?: number[] | null;
  breakableFitMode?: BreakableFitMode;
}

/** 字体测量缓存（原 tn 值类型） */
export type FontMeasureCache = Map<string, TextMeasureEntry>;

/** 字体测量会话（原 Sn 返回） */
export interface FontMeasureSession {
  cache: FontMeasureCache;
  fontSize: number;
  /** 表情符号过绘修正量（px/个） */
  emojiCorrection: number;
}

/** 宽度表（原 ur 返回；断行行走与行提取的消费对象） */
export interface MeasuredText {
  /** 各段（令牌）宽度——制表位/软连字符/硬换行为 0 */
  widths: number[];
  /** 行尾拟合推进（空格类为 0；软连字符 = 连字符宽） */
  lineEndFitAdvances: number[];
  /** 行尾绘制推进（空格类为 0） */
  lineEndPaintAdvances: number[];
  kinds: TokenKind[];
  /** 单块且无字间距 → 可走快路径 */
  simpleLineWalkFastPath: boolean;
  /** 各段 BiDi 级别（无 RTL 为 null） */
  segLevels: Int8Array | null;
  /** 各段字素级断点宽度（不可再分 = null） */
  breakableFitAdvances: (number[] | null)[];
  /** 各段优先断点（连字符后字素序号；无 = null） */
  breakablePreferredBreaks: (number[] | null)[];
  letterSpacing: number;
  /** 各段字素数（字间距记账用） */
  spacingGraphemeCounts: number[];
  /** 软连字符显示宽度（含字间距补偿） */
  discretionaryHyphenWidth: number;
  /** 制表位推进（8 空格宽） */
  tabStopAdvance: number;
  /** 硬换行分块（段索引 → 宽度索引重映射后） */
  chunks: { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[];
  /** 段文本（仅 withSegments 构建时存在；行提取用） */
  segments?: string[];
}

/** 断行游标（段索引 + 段内字素索引） */
export interface LineCursor {
  segmentIndex: number;
  graphemeIndex: number;
}

/** 行片段（原 hr 返回：一行中落下的一段文本） */
export interface LineFragment {
  text: string;
  width: number;
  start: LineCursor;
  end: LineCursor;
}

/** 测量选项（原 fr 的 r 参数） */
export interface TextMeasureOptions {
  whiteSpace?: string;
  wordBreak?: string;
  letterSpacing?: number;
}

/* ============================================================================
 * §1 测量宿主与缓存（原 en..dn，jsx 11094-11118）
 * ==========================================================================*/

let cachedMeasureContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null; // 原 en
const fontMeasureCaches = new Map<string, FontMeasureCache>(); // 原 tn

/** 原 ln：单例 2d 测量上下文（OffscreenCanvas 优先，回退 DOM canvas） */
export function getMeasureContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  if (cachedMeasureContext !== null) return cachedMeasureContext;
  if (typeof OffscreenCanvas < `u`) return (cachedMeasureContext = new OffscreenCanvas(1, 1).getContext(`2d`)!);
  if (typeof document < `u`) return (cachedMeasureContext = document.createElement(`canvas`).getContext(`2d`)!);
  throw Error(`Text measurement requires OffscreenCanvas or a DOM canvas context.`);
}

/** 原 un：取（建）字体级测量缓存 */
export function getFontMeasureCache(font: string): FontMeasureCache {
  let cache = fontMeasureCaches.get(font);
  return cache || ((cache = new Map()), fontMeasureCaches.set(font, cache)), cache;
}

/** 原 dn：文本宽度测量（缓存；附带 CJK 探测） */
export function measureTextCached(text: string, cache: FontMeasureCache): TextMeasureEntry {
  let entry = cache.get(text);
  return (
    entry === undefined &&
      ((entry = { width: getMeasureContext().measureText(text).width, containsCJK: containsCJK(text) }), cache.set(text, entry)),
    entry
  );
}

/* ============================================================================
 * §2 浏览器排版怪癖（原 nn/fn，jsx 11119-11138）
 * ==========================================================================*/

let cachedLineLayoutQuirks: LineLayoutQuirks | null = null; // 原 nn

/**
 * 原 fn：按 userAgent 探测排版怪癖——
 * Safari：1/64 行拟合容差、前缀宽度偏好、软连字符早断、禁 keep-all 标点；
 * Chromium：CJK 闭引号粘着；无 navigator（非浏览器）→ 保守缺省。
 */
export function getLineLayoutQuirks(): LineLayoutQuirks {
  if (cachedLineLayoutQuirks !== null) return cachedLineLayoutQuirks;
  if (typeof navigator > `u`)
    return (cachedLineLayoutQuirks = {
      lineFitEpsilon: 0.005,
      carryCJKAfterClosingQuote: false,
      breakKeepAllAfterPunctuation: true,
      preferPrefixWidthsForBreakableRuns: false,
      preferEarlySoftHyphenBreak: false,
    });
  const userAgent = navigator.userAgent,
    isSafari =
      navigator.vendor === `Apple Computer, Inc.` &&
      userAgent.includes(`Safari/`) &&
      !userAgent.includes(`Chrome/`) &&
      !userAgent.includes(`Chromium/`) &&
      !userAgent.includes(`CriOS/`) &&
      !userAgent.includes(`FxiOS/`) &&
      !userAgent.includes(`EdgiOS/`),
    isChromium = userAgent.includes(`Chrome/`) || userAgent.includes(`Chromium/`) || userAgent.includes(`CriOS/`) || userAgent.includes(`Edg/`);
  return (cachedLineLayoutQuirks = {
    lineFitEpsilon: isSafari ? 1 / 64 : 0.005,
    carryCJKAfterClosingQuote: isChromium,
    breakKeepAllAfterPunctuation: !isSafari,
    preferPrefixWidthsForBreakableRuns: isSafari,
    preferEarlySoftHyphenBreak: isSafari,
  });
}

/** 原 pn：从 font 短写解析字号（缺省 16） */
export function parseFontSizeFromFont(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return match ? parseFloat(match[1]) : 16;
}

/* ============================================================================
 * §3 字素切分与表情修正（原 mn..bn，jsx 11144-11179）
 * ==========================================================================*/

let cachedGraphemeSegmenter: Intl.Segmenter | null = null; // 原 sn

/** 原 mn：字素粒度 Intl.Segmenter 单例 */
export function getGraphemeSegmenter(): Intl.Segmenter {
  return cachedGraphemeSegmenter === null && (cachedGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: `grapheme` })), cachedGraphemeSegmenter;
}

/** 原 an（jsx 11098） —— 数据逐字保留 */
export const EMOJI_PRESENTATION_RE = /\p{Emoji_Presentation}/u;
/** 原 on（jsx 11099）：表情序列探测（含 ZWJ/VS16/keycap） —— 数据逐字保留 */
export const EMOJI_SEQUENCE_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u;

/** 原 hn：表情呈现判定（Emoji_Presentation 或带 VS16） */
export function isEmojiPresentation(text: string): boolean {
  return EMOJI_PRESENTATION_RE.test(text) || text.includes(`\uFE0F`);
}

/** 原 gn：含表情序列（含 Extended_Pictographic/区域指示符/VS16/keycap） */
export function containsEmojiSequence(text: string): boolean {
  return EMOJI_SEQUENCE_RE.test(text);
}

const emojiCorrectionCache = new Map<string, number>(); // 原 cn

/**
 * 原 _n：表情符号过绘修正——canvas 测量 😀 若显著宽于字号，
 * 用 DOM 隐式 span 实测对照，差值 >0.5px 记为每个表情的修正量（缓存）。
 */
export function measureEmojiOverdrawCorrection(font: string, fontSize: number): number {
  let correction = emojiCorrectionCache.get(font);
  if (correction !== undefined) return correction;
  const context = getMeasureContext();
  context.font = font;
  let canvasWidth = context.measureText(`😀`).width;
  if ((correction = 0), canvasWidth > fontSize + 0.5 && typeof document < `u` && document.body !== null) {
    const probe = document.createElement(`span`);
    (probe.style.font = font),
      (probe.style.display = `inline-block`),
      (probe.style.visibility = `hidden`),
      (probe.style.position = `absolute`),
      (probe.textContent = `😀`),
      document.body.appendChild(probe);
    const domWidth = probe.getBoundingClientRect().width;
    document.body.removeChild(probe), canvasWidth - domWidth > 0.5 && (correction = canvasWidth - domWidth);
  }
  return emojiCorrectionCache.set(font, correction), correction;
}

/** 原 vn：表情字素计数 */
export function countEmojiSegments(text: string): number {
  let count = 0;
  const segmenter = getGraphemeSegmenter();
  for (const segment of segmenter.segment(text)) isEmojiPresentation(segment.segment) && count++;
  return count;
}

/** 原 yn：表情计数（缓存到测量条目） */
export function emojiCountOf(text: string, entry: TextMeasureEntry): number {
  return entry.emojiCount === undefined && (entry.emojiCount = countEmojiSegments(text)), entry.emojiCount;
}

/** 原 bn：表情修正后的宽度 */
export function emojiCorrectedWidth(text: string, entry: TextMeasureEntry, correction: number): number {
  return correction === 0 ? entry.width : entry.width - emojiCountOf(text, entry) * correction;
}

/**
 * 原 xn：可断字素宽度表（按模式缓存于测量条目）——
 * sum-graphemes：逐字素独立测量；
 * pair-context（或字素 >96）：相邻字素成对测量取差（组合字素安全）；
 * segment-prefixes：前缀递增测量取差。
 * 单字素返回 null（不可再分）。
 */
export function computeBreakableFitAdvances(
  text: string,
  entry: TextMeasureEntry,
  cache: FontMeasureCache,
  emojiCorrection: number,
  mode: BreakableFitMode,
): number[] | null {
  if (entry.breakableFitAdvances !== undefined && entry.breakableFitMode === mode) return entry.breakableFitAdvances;
  entry.breakableFitMode = mode;
  const segmenter = getGraphemeSegmenter(),
    graphemes: string[] = [];
  for (const segment of segmenter.segment(text)) graphemes.push(segment.segment);
  if (graphemes.length <= 1) return (entry.breakableFitAdvances = null), entry.breakableFitAdvances;
  if (mode === `sum-graphemes`) {
    const advances: number[] = [];
    for (const grapheme of graphemes) {
      const measure = measureTextCached(grapheme, cache);
      advances.push(emojiCorrectedWidth(grapheme, measure, emojiCorrection));
    }
    return (entry.breakableFitAdvances = advances), entry.breakableFitAdvances;
  }
  if (mode === `pair-context` || graphemes.length > PAIR_CONTEXT_GRAPHEME_LIMIT) {
    const advances: number[] = [];
    let prevGrapheme: string | null = null,
      prevPairWidth = 0;
    for (const grapheme of graphemes) {
      const soloWidth = emojiCorrectedWidth(grapheme, measureTextCached(grapheme, cache), emojiCorrection);
      if (prevGrapheme === null) advances.push(soloWidth);
      else {
        const pair = prevGrapheme + grapheme,
          pairMeasure = measureTextCached(pair, cache);
        advances.push(emojiCorrectedWidth(pair, pairMeasure, emojiCorrection) - prevPairWidth);
      }
      (prevGrapheme = grapheme), (prevPairWidth = soloWidth);
    }
    return (entry.breakableFitAdvances = advances), entry.breakableFitAdvances;
  }
  const advances: number[] = [];
  let prefix = ``,
    prefixWidth = 0;
  for (const grapheme of graphemes) {
    prefix += grapheme;
    const measure = measureTextCached(prefix, cache),
      corrected = emojiCorrectedWidth(prefix, measure, emojiCorrection);
    advances.push(corrected - prefixWidth), (prefixWidth = corrected);
  }
  return (entry.breakableFitAdvances = advances), entry.breakableFitAdvances;
}

/** 原 rn：pair-context 字素数阈值 */
const PAIR_CONTEXT_GRAPHEME_LIMIT = 96;

/** 原 Sn：字体测量会话（设置上下文 font + 取缓存/字号/表情修正） */
export function openFontMeasureSession(font: string, hasEmoji: boolean): FontMeasureSession {
  const context = getMeasureContext();
  context.font = font;
  const cache = getFontMeasureCache(font),
    fontSize = parseFontSizeFromFont(font);
  return { cache, fontSize, emojiCorrection: hasEmoji ? measureEmojiOverdrawCorrection(font, fontSize) : 0 };
}

/* ============================================================================
 * §4 宽度表记账助手（原 Cn..Ln，jsx 11233-11297）
 * ==========================================================================*/

/** 原 Cn：仅参与拟合、不占绘制尾宽的类别 */
export function isFitOnlyKind(kind: TokenKind): boolean {
  return kind === `space` || kind === `zero-width-break` || kind === `soft-hyphen`;
}

/** 原 wn：行尾可收缩类别（空格/保留空格/制表/零宽断点/软连字符） */
export function isLineEndShrinkableKind(kind: TokenKind): boolean {
  return kind === `space` || kind === `preserved-space` || kind === `tab` || kind === `zero-width-break` || kind === `soft-hyphen`;
}

/** 原 Tn：跳过行尾可收缩段（返回首个不可收缩段索引） */
export function skipShrinkableKinds(table: MeasuredText, from: number, to: number = table.widths.length): number {
  for (; from < to;) {
    const kind = table.kinds[from];
    if (!isFitOnlyKind(kind)) break;
    from++;
  }
  return from;
}

/** 原 En：推进到下一制表位（对齐 tabStopAdvance 倍数） */
export function advanceToTabStop(currentWidth: number, tabStopAdvance: number): number {
  if (tabStopAdvance <= 0) return 0;
  const rem = currentWidth % tabStopAdvance;
  return Math.abs(rem) <= 1e-6 ? tabStopAdvance : tabStopAdvance - rem;
}

/** 原 Dn：拟合用字间距（有字间距、行已开启且该段有字素时计一份） */
export function fitLetterSpacingAt(table: MeasuredText, lineStarted: boolean, segmentIndex: number): number {
  return table.letterSpacing !== 0 && lineStarted && table.spacingGraphemeCounts[segmentIndex] > 0 ? table.letterSpacing : 0;
}

/** 原 On：非零则相加（行尾推进记账） */
export function addIfNonZero(base: number, extra: number): number {
  return extra === 0 ? 0 : base + extra;
}

/** 原 kn：段级字间距（该段有字素时计一份） */
export function letterSpacingAtSegment(table: MeasuredText, segmentIndex: number): number {
  return table.letterSpacing !== 0 && table.spacingGraphemeCounts[segmentIndex] > 0 ? table.letterSpacing : 0;
}

/** 原 An：行尾拟合推进（制表位 = 制表宽度 + 字间距；其余 = 记账值） */
export function lineEndFitAdvanceOf(table: MeasuredText, kind: TokenKind, segmentIndex: number, spacing: number, tabAdvance: number): number {
  return addIfNonZero(spacing, kind === `tab` ? tabAdvance + letterSpacingAtSegment(table, segmentIndex) : table.lineEndFitAdvances[segmentIndex]);
}

/** 原 jn：断行拟合推进（制表位行尾不计宽） */
export function fitAdvanceOf(table: MeasuredText, kind: TokenKind, segmentIndex: number, spacing: number): number {
  return addIfNonZero(spacing, kind === `tab` ? 0 : table.lineEndFitAdvances[segmentIndex]);
}

/** 原 Mn：断行绘制推进（制表位计实宽） */
export function paintAdvanceOf(table: MeasuredText, kind: TokenKind, segmentIndex: number, spacing: number, tabAdvance: number): number {
  return addIfNonZero(spacing, kind === `tab` ? tabAdvance : table.lineEndPaintAdvances[segmentIndex]);
}

/** 原 Nn：字间距存在且行已开启 → 追加一份字间距 */
export function withTrailingLetterSpacing(table: MeasuredText, lineStarted: boolean, width: number): number {
  return table.letterSpacing !== 0 && lineStarted ? width + table.letterSpacing : width;
}

/** 原 Pn：有字间距则追加一份 */
export function plusLetterSpacing(table: MeasuredText, width: number): number {
  return table.letterSpacing === 0 ? width : width + table.letterSpacing;
}

/** 原 Fn：升序数组中首个 ≥target 的索引（线性下界） */
export function lowerBoundIndex(sorted: number[], from: number, target: number): number {
  let index = from;
  for (; index < sorted.length && sorted[index] < target;) index++;
  return index;
}

/**
 * 原 In：行内断点前的尾随字间距——
 * 字素中断 → 该段有字素计一份；否则回扫至前一实体段
 * （跳过空格/零宽/硬换行；软连字符仅当紧邻时不计）。
 */
export function trailingLetterSpacingBefore(table: MeasuredText, lineStartSegment: number, lineStartGrapheme: number, segmentIndex: number, graphemeIndex: number): number {
  if (table.letterSpacing === 0) return 0;
  if (graphemeIndex > 0) return table.spacingGraphemeCounts[segmentIndex] > 0 ? table.letterSpacing : 0;
  for (let i = segmentIndex - 1; i >= lineStartSegment; i--) {
    const kind = table.kinds[i];
    if (!(kind === `space` || kind === `zero-width-break` || kind === `hard-break`)) {
      if (kind === `soft-hyphen`) {
        if (i === segmentIndex - 1) return 0;
        continue;
      }
      return (i === lineStartSegment && lineStartGrapheme > 0) || table.spacingGraphemeCounts[i] > 0 ? table.letterSpacing : 0;
    }
  }
  return 0;
}

/** 原 Ln：宽度 + 尾随字间距 */
export function advanceWithTrailingSpacing(table: MeasuredText, width: number, lineStartSegment: number, lineStartGrapheme: number, segmentIndex: number, graphemeIndex: number): number {
  return width + trailingLetterSpacingBefore(table, lineStartSegment, lineStartGrapheme, segmentIndex, graphemeIndex);
}

/* ============================================================================
 * §5 硬换行块定位（原 Rn..Vn，jsx 11298-11322）
 * ==========================================================================*/

/** 原 Rn：段索引 → 块索引（按 consumedEndSegmentIndex 二分） */
export function findChunkBySegment(table: MeasuredText, segmentIndex: number): number {
  let lo = 0,
    hi = table.chunks.length;
  for (; lo < hi;) {
    const mid = Math.floor((lo + hi) / 2);
    segmentIndex < table.chunks[mid].consumedEndSegmentIndex ? (hi = mid) : (lo = mid + 1);
  }
  return lo < table.chunks.length ? lo : -1;
}

/**
 * 原 zn：游标进入块——跳过块首可收缩段；
 * 空块/段耗尽 → 推进到下一块或 -1。
 */
export function enterChunkAtCursor(table: MeasuredText, chunkIndex: number, cursor: LineCursor): number {
  let segmentIndex = cursor.segmentIndex;
  if (cursor.graphemeIndex > 0) return chunkIndex;
  const chunk = table.chunks[chunkIndex];
  return (chunk.startSegmentIndex === chunk.endSegmentIndex && segmentIndex === chunk.startSegmentIndex) ||
    (segmentIndex < chunk.startSegmentIndex && (segmentIndex = chunk.startSegmentIndex),
    (segmentIndex = skipShrinkableKinds(table, segmentIndex, chunk.endSegmentIndex)),
    segmentIndex < chunk.endSegmentIndex)
    ? ((cursor.segmentIndex = segmentIndex), (cursor.graphemeIndex = 0), chunkIndex)
    : chunk.consumedEndSegmentIndex >= table.widths.length
      ? -1
      : ((cursor.segmentIndex = chunk.consumedEndSegmentIndex), (cursor.graphemeIndex = 0), chunkIndex + 1);
}

/** 原 Bn：为游标定位块（段耗尽 → -1） */
export function locateChunkForCursor(table: MeasuredText, cursor: LineCursor): number {
  if (cursor.segmentIndex >= table.widths.length) return -1;
  const chunkIndex = findChunkBySegment(table, cursor.segmentIndex);
  return chunkIndex < 0 ? -1 : enterChunkAtCursor(table, chunkIndex, cursor);
}

/** 原 Vn：从当前块推进到包含游标的下一块 */
export function advanceToNextChunk(table: MeasuredText, chunkIndex: number, cursor: LineCursor): number {
  if (cursor.segmentIndex >= table.widths.length) return -1;
  let next = chunkIndex;
  for (; next < table.chunks.length && cursor.segmentIndex >= table.chunks[next].consumedEndSegmentIndex;) next++;
  return next >= table.chunks.length ? -1 : enterChunkAtCursor(table, next, cursor);
}

/* ============================================================================
 * §6 断行行走器（原 Hn/Un/Wn/Gn/Kn，jsx 11324-11524）
 * ==========================================================================*/

/**
 * 原 Hn：块级断行行走（完整路径）——
 * 逐段累计宽度；超宽时按优先级回退断点：
 *   软连字符早断（Safari 怪癖）→ 已记软连字符断点 → 行尾可收缩段
 *   → 已记断点（含字素级）→ 段内字素级断点（breakableFitAdvances，
 *     优先断点 breakablePreferredBreaks 加权）；
 * 制表位按当前宽度对齐；字间距按段/字素记账；返回行宽（行首即超宽 → 0）。
 */
export function walkChunkLine(table: MeasuredText, cursor: LineCursor, chunkIndex: number, maxWidth: number): number | null {
  const chunk = table.chunks[chunkIndex];
  if (chunk.startSegmentIndex === chunk.endSegmentIndex)
    return (cursor.segmentIndex = chunk.consumedEndSegmentIndex), (cursor.graphemeIndex = 0), 0;
  const { widths, kinds, breakableFitAdvances, breakablePreferredBreaks, discretionaryHyphenWidth } = table,
    quirks = getLineLayoutQuirks(),
    limit = maxWidth + quirks.lineFitEpsilon,
    lineStartSegment = cursor.segmentIndex,
    lineStartGrapheme = cursor.graphemeIndex;
  let lineWidth = 0,
    lineStarted = false,
    breakSegment = cursor.segmentIndex,
    breakGrapheme = cursor.graphemeIndex,
    hyphenBreakSegment = -1,
    hyphenFitWidth = 0,
    hyphenPaintWidth = 0,
    hyphenKind: TokenKind | null = null;
  /** 断点宽度（软连字符断点落在当前断点 → 用含连字符宽） */
  const breakWidth = (): number => (hyphenKind === `soft-hyphen` && hyphenBreakSegment === breakSegment && breakGrapheme === 0 ? hyphenPaintWidth : lineWidth);
  /** 提交断点并返回行宽（行未开启 → null） */
  const commit = (segmentIndex = breakSegment, graphemeIndex = breakGrapheme, width = breakWidth()): number | null =>
    lineStarted ? ((cursor.segmentIndex = segmentIndex), (cursor.graphemeIndex = graphemeIndex), advanceWithTrailingSpacing(table, width, lineStartSegment, lineStartGrapheme, segmentIndex, graphemeIndex)) : null;
  /** 以整段为断点起点 */
  const startLineAtSegment = (segmentIndex: number, segmentWidth: number): void => {
    (lineStarted = true), (breakSegment = segmentIndex + 1), (breakGrapheme = 0), (lineWidth = segmentWidth);
  };
  /** 以段内字素为断点起点 */
  const startLineAtGrapheme = (segmentIndex: number, graphemeIndex: number, width: number): void => {
    (lineStarted = true), (breakSegment = segmentIndex), (breakGrapheme = graphemeIndex + 1), (lineWidth = width);
  };
  /** 累加段宽（行未开启则先记断点起点） */
  const accumulate = (segmentIndex: number, segmentWidth: number): void => {
    if (!lineStarted) {
      startLineAtSegment(segmentIndex, segmentWidth);
      return;
    }
    (lineWidth += segmentWidth), (breakSegment = segmentIndex + 1), (breakGrapheme = 0);
  };
  /** 记录行尾可收缩段的断点候选（含软连字符两种宽度） */
  const recordShrinkable = (kind: TokenKind, shrinkable: boolean, segmentIndex: number, segmentWidth: number, spacing: number, totalAdvance: number): void => {
    if (!shrinkable) return;
    const fit = fitAdvanceOf(table, kind, segmentIndex, spacing),
      paint = paintAdvanceOf(table, kind, segmentIndex, spacing, segmentWidth);
    (hyphenBreakSegment = segmentIndex + 1), (hyphenFitWidth = lineWidth - totalAdvance + fit), (hyphenPaintWidth = lineWidth - totalAdvance + paint), (hyphenKind = kind);
  };
  /** 段内字素级行走（超宽即断；优先断点加权）。调用方保证 advances 非 null
   * （原代码同此信任：仅在 `breakableFitAdvances[n] !== null` 或字素续行时进入） */
  const walkGraphemes = (segmentIndex: number, fromGrapheme: number): number | null => {
    const advances = breakableFitAdvances[segmentIndex] as number[],
      preferred = breakablePreferredBreaks[segmentIndex] ?? null;
    let preferredIndex = preferred === null ? -1 : lowerBoundIndex(preferred, 0, fromGrapheme + 1),
      preferredBreakGrapheme = -1,
      preferredBreakWidth = 0;
    for (let g = fromGrapheme; g < advances.length; g++) {
      const advance = advances[g];
      if (!lineStarted) startLineAtGrapheme(segmentIndex, g, advance);
      else {
        const spaced = withTrailingLetterSpacing(table, true, advance),
          nextWidth = lineWidth + spaced;
        if (plusLetterSpacing(table, nextWidth) > limit) return preferred !== null && preferredBreakGrapheme > fromGrapheme ? commit(segmentIndex, preferredBreakGrapheme, preferredBreakWidth) : commit();
        (lineWidth = nextWidth), (breakSegment = segmentIndex), (breakGrapheme = g + 1);
      }
      const graphemeOrdinal = g + 1;
      preferred !== null && preferred[preferredIndex] === graphemeOrdinal && ((preferredBreakGrapheme = graphemeOrdinal), (preferredBreakWidth = lineWidth), preferredIndex++);
    }
    return lineStarted && breakSegment === segmentIndex && breakGrapheme === advances.length && ((breakSegment = segmentIndex + 1), (breakGrapheme = 0)), null;
  };
  /** 已记软连字符断点可用则提交 */
  const commitSoftHyphen = (): number | null => (hyphenKind !== `soft-hyphen` || hyphenBreakSegment < 0 ? null : hyphenFitWidth <= limit ? commit(hyphenBreakSegment, 0, hyphenPaintWidth) : null);
  for (let segmentIndex = cursor.segmentIndex; segmentIndex < chunk.endSegmentIndex; segmentIndex++) {
    const kind = kinds[segmentIndex],
      shrinkable = isLineEndShrinkableKind(kind),
      fromGrapheme = segmentIndex === cursor.segmentIndex ? cursor.graphemeIndex : 0,
      spacing = fitLetterSpacingAt(table, lineStarted, segmentIndex),
      segmentWidth = kind === `tab` ? advanceToTabStop(lineWidth + spacing, table.tabStopAdvance) : widths[segmentIndex],
      totalAdvance = spacing + segmentWidth,
      lineEndAdvance = lineEndFitAdvanceOf(table, kind, segmentIndex, spacing, segmentWidth);
    if (kind === `soft-hyphen` && fromGrapheme === 0) {
      lineStarted && ((breakSegment = segmentIndex + 1), (breakGrapheme = 0), (hyphenBreakSegment = segmentIndex + 1), (hyphenFitWidth = lineWidth + discretionaryHyphenWidth), (hyphenPaintWidth = lineWidth + discretionaryHyphenWidth), (hyphenKind = kind));
      continue;
    }
    if (!lineStarted) {
      if (fromGrapheme > 0) {
        const result = walkGraphemes(segmentIndex, fromGrapheme);
        if (result !== null) return result;
      } else if (lineEndAdvance > limit && breakableFitAdvances[segmentIndex] !== null) {
        const result = walkGraphemes(segmentIndex, 0);
        if (result !== null) return result;
      } else startLineAtSegment(segmentIndex, segmentWidth);
      recordShrinkable(kind, shrinkable, segmentIndex, segmentWidth, spacing, totalAdvance);
      continue;
    }
    if (lineWidth + lineEndAdvance > limit) {
      const fitWidth = lineWidth + fitAdvanceOf(table, kind, segmentIndex, spacing),
        paintWidth = lineWidth + paintAdvanceOf(table, kind, segmentIndex, spacing, segmentWidth);
      if (hyphenKind === `soft-hyphen` && quirks.preferEarlySoftHyphenBreak && hyphenFitWidth <= limit) return commit(hyphenBreakSegment, 0, hyphenPaintWidth);
      const hyphenResult = commitSoftHyphen();
      if (hyphenResult !== null) return hyphenResult;
      if (shrinkable && fitWidth <= limit) return accumulate(segmentIndex, totalAdvance), commit(segmentIndex + 1, 0, paintWidth);
      if (hyphenBreakSegment >= 0 && hyphenFitWidth <= limit) return breakSegment > hyphenBreakSegment || (breakSegment === hyphenBreakSegment && breakGrapheme > 0) ? commit() : commit(hyphenBreakSegment, 0, hyphenPaintWidth);
      if (lineEndAdvance > limit && breakableFitAdvances[segmentIndex] !== null) {
        const committed = commit();
        if (committed !== null) return committed;
        const graphemeResult = walkGraphemes(segmentIndex, 0);
        if (graphemeResult !== null) return graphemeResult;
      }
      return commit();
    }
    accumulate(segmentIndex, totalAdvance), recordShrinkable(kind, shrinkable, segmentIndex, segmentWidth, spacing, totalAdvance);
  }
  return hyphenBreakSegment === chunk.consumedEndSegmentIndex && breakGrapheme === 0
    ? commit(chunk.consumedEndSegmentIndex, 0, hyphenPaintWidth)
    : commit(chunk.consumedEndSegmentIndex, 0, lineWidth);
}

/**
 * 原 Un：简单断行行走（快路径：单块、无字间距、无制表位记账）——
 * 逐段累加；段超宽且有字素断点 → 字素级行走（优先断点加权）；
 * 行尾可收缩段记回退断点。
 */
export function walkSimpleLine(table: MeasuredText, cursor: LineCursor, maxWidth: number): number | null {
  const { widths, kinds, breakableFitAdvances, breakablePreferredBreaks } = table,
    limit = maxWidth + getLineLayoutQuirks().lineFitEpsilon;
  let lineWidth = 0,
    lineStarted = false,
    breakSegment = cursor.segmentIndex,
    breakGrapheme = cursor.graphemeIndex,
    shrinkBreakSegment = -1,
    shrinkBreakWidth = 0;
  for (let segmentIndex = cursor.segmentIndex; segmentIndex < widths.length; segmentIndex++) {
    const kind = kinds[segmentIndex],
      shrinkable = isLineEndShrinkableKind(kind),
      fromGrapheme = segmentIndex === cursor.segmentIndex ? cursor.graphemeIndex : 0,
      advances = breakableFitAdvances[segmentIndex],
      segmentWidth = widths[segmentIndex];
    if (!lineStarted) {
      if (fromGrapheme > 0 || (segmentWidth > limit && advances !== null)) {
        const graphemeAdvances = advances as number[],
          preferred = breakablePreferredBreaks[segmentIndex] ?? null;
        let preferredIndex = preferred === null ? -1 : lowerBoundIndex(preferred, 0, fromGrapheme + 1),
          preferredBreakGrapheme = -1,
          preferredBreakWidth = 0;
        const firstAdvance = graphemeAdvances[fromGrapheme];
        (lineStarted = true), (lineWidth = firstAdvance), (breakSegment = segmentIndex), (breakGrapheme = fromGrapheme + 1),
          preferred !== null && preferred[preferredIndex] === breakGrapheme && ((preferredBreakGrapheme = breakGrapheme), (preferredBreakWidth = lineWidth), preferredIndex++);
        for (let g = fromGrapheme + 1; g < graphemeAdvances.length; g++) {
          const advance = graphemeAdvances[g];
          if (lineWidth + advance > limit)
            return preferred !== null && preferredBreakGrapheme > fromGrapheme
              ? ((cursor.segmentIndex = segmentIndex), (cursor.graphemeIndex = preferredBreakGrapheme), preferredBreakWidth)
              : ((cursor.segmentIndex = breakSegment), (cursor.graphemeIndex = breakGrapheme), lineWidth);
          (lineWidth += advance), (breakSegment = segmentIndex), (breakGrapheme = g + 1),
            preferred !== null && preferred[preferredIndex] === breakGrapheme && ((preferredBreakGrapheme = breakGrapheme), (preferredBreakWidth = lineWidth), preferredIndex++);
        }
        breakSegment === segmentIndex && breakGrapheme === graphemeAdvances.length && ((breakSegment = segmentIndex + 1), (breakGrapheme = 0));
      } else (lineStarted = true), (lineWidth = segmentWidth), (breakSegment = segmentIndex + 1), (breakGrapheme = 0);
      shrinkable && ((shrinkBreakSegment = segmentIndex + 1), (shrinkBreakWidth = lineWidth - segmentWidth));
      continue;
    }
    if (lineWidth + segmentWidth > limit)
      return shrinkable
        ? ((cursor.segmentIndex = segmentIndex + 1), (cursor.graphemeIndex = 0), lineWidth)
        : shrinkBreakSegment >= 0
          ? breakSegment > shrinkBreakSegment || (breakSegment === shrinkBreakSegment && breakGrapheme > 0)
            ? ((cursor.segmentIndex = breakSegment), (cursor.graphemeIndex = breakGrapheme), lineWidth)
            : ((cursor.segmentIndex = shrinkBreakSegment), (cursor.graphemeIndex = 0), shrinkBreakWidth)
          : ((cursor.segmentIndex = breakSegment), (cursor.graphemeIndex = breakGrapheme), lineWidth);
    (lineWidth += segmentWidth), (breakSegment = segmentIndex + 1), (breakGrapheme = 0), shrinkable && ((shrinkBreakSegment = segmentIndex + 1), (shrinkBreakWidth = lineWidth - segmentWidth));
  }
  return lineStarted ? ((cursor.segmentIndex = breakSegment), (cursor.graphemeIndex = breakGrapheme), lineWidth) : null;
}

/** 原 Wn：按表形态分派行走器 */
export function walkLineFromCursor(table: MeasuredText, cursor: LineCursor, chunkIndex: number, maxWidth: number): number | null {
  return table.simpleLineWalkFastPath ? walkSimpleLine(table, cursor, maxWidth) : walkChunkLine(table, cursor, chunkIndex, maxWidth);
}

/** 原 Gn：定位游标所在块并走一行 */
export function walkNextLineFromCursor(table: MeasuredText, cursor: LineCursor, maxWidth: number): number | null {
  const chunkIndex = locateChunkForCursor(table, cursor);
  return chunkIndex < 0 ? null : walkLineFromCursor(table, cursor, chunkIndex, maxWidth);
}

/** 原 Kn：全文行数与最大行宽（空表 → 0/0） */
export function countLinesAndMaxWidth(table: MeasuredText, maxWidth: number): { lineCount: number; maxLineWidth: number } {
  if (table.widths.length === 0) return { lineCount: 0, maxLineWidth: 0 };
  const cursor: LineCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineCount = 0,
    maxLineWidth = 0;
  if (!table.simpleLineWalkFastPath) {
    let chunkIndex = locateChunkForCursor(table, cursor);
    for (; chunkIndex >= 0;) {
      const width = walkChunkLine(table, cursor, chunkIndex, maxWidth);
      if (width === null) return { lineCount, maxLineWidth };
      lineCount++, width > maxLineWidth && (maxLineWidth = width), (chunkIndex = advanceToNextChunk(table, chunkIndex, cursor));
    }
    return { lineCount, maxLineWidth };
  }
  for (;;) {
    const width = walkNextLineFromCursor(table, cursor, maxWidth);
    if (width === null) return { lineCount, maxLineWidth };
    lineCount++, width > maxLineWidth && (maxLineWidth = width);
  }
}

/* ============================================================================
 * §7 行文本提取（原 qn..er，jsx 11525-11565）
 * ==========================================================================*/

let cachedLineGraphemeSegmenter: Intl.Segmenter | null = null; // 原 qn
const lineGraphemeCaches = new WeakMap<MeasuredText, Map<number, string[]>>(); // 原 Jn

/** 原 Yn：行提取专用字素 Segmenter 单例 */
export function getLineGraphemeSegmenter(): Intl.Segmenter {
  return cachedLineGraphemeSegmenter === null && (cachedLineGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: `grapheme` })), cachedLineGraphemeSegmenter;
}

/** 原 Xn：段文本的字素数组（缓存于表级 Map） */
export function graphemesOfSegment(segmentIndex: number, segments: string[], cache: Map<number, string[]>): string[] {
  let graphemes = cache.get(segmentIndex);
  if (graphemes !== undefined) return graphemes;
  graphemes = [];
  const segmenter = getLineGraphemeSegmenter();
  for (const segment of segmenter.segment(segments[segmentIndex])) graphemes.push(segment.segment);
  return cache.set(segmentIndex, graphemes), graphemes;
}

/** 原 Zn：段区间以软连字符收尾 */
export function isSoftHyphenLineEnd(kinds: TokenKind[], startSegment: number, endSegment: number): boolean {
  return endSegment > startSegment && kinds[endSegment - 1] === `soft-hyphen`;
}

/** 原 Qn：字素数组切片追加 */
export function appendStringSlice(target: string, graphemes: string[], from: number, to: number): string {
  for (let i = from; i < to; i++) target += graphemes[i];
  return target;
}

/** 原 $n：表级行字素缓存 */
export function getLineGraphemeCache(table: MeasuredText): Map<number, string[]> {
  let cache = lineGraphemeCaches.get(table);
  return cache === undefined ? ((cache = new Map()), lineGraphemeCaches.set(table, cache), cache) : cache;
}

/**
 * 原 er：行文本提取——跳过软连字符/硬换行段；起始段按字素偏移截取；
 * 软连字符断行补显 '-'；末段按字素偏移截取。
 */
export function extractLineText(table: MeasuredText, graphemeCache: Map<number, string[]>, startSegment: number, startGrapheme: number, endSegment: number, endGrapheme: number): string {
  let text = ``;
  const hyphenEnded = isSoftHyphenLineEnd(table.kinds, startSegment, endSegment);
  for (let segmentIndex = startSegment; segmentIndex < endSegment; segmentIndex++)
    if (!(table.kinds[segmentIndex] === `soft-hyphen` || table.kinds[segmentIndex] === `hard-break`))
      if (segmentIndex === startSegment && startGrapheme > 0) {
        const graphemes = graphemesOfSegment(segmentIndex, table.segments!, graphemeCache);
        text = appendStringSlice(text, graphemes, startGrapheme, graphemes.length);
      } else text += table.segments![segmentIndex];
  if (endGrapheme > 0) {
    hyphenEnded && (text += `-`);
    const graphemes = graphemesOfSegment(endSegment, table.segments!, graphemeCache);
    text = appendStringSlice(text, graphemes, startSegment === endSegment ? startGrapheme : 0, endGrapheme);
  } else hyphenEnded && (text += `-`);
  return text;
}

/* ============================================================================
 * §8 CJK 再切分与宽度表构建（原 tr..dr，jsx 11566-11806）
 * ==========================================================================*/

let cachedCJKGraphemeSegmenter: Intl.Segmenter | null = null; // 原 tr

/** 原 nr：CJK 再切分专用字素 Segmenter 单例 */
export function getCJKGraphemeSegmenter(): Intl.Segmenter {
  return cachedCJKGraphemeSegmenter === null && (cachedCJKGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: `grapheme` })), cachedCJKGraphemeSegmenter;
}

/** 原 rr：空宽度表（withSegments 决定是否带 segments 字段） */
export function createEmptyMeasuredText(withSegments: boolean): MeasuredText {
  return withSegments
    ? {
        widths: [],
        lineEndFitAdvances: [],
        lineEndPaintAdvances: [],
        kinds: [],
        simpleLineWalkFastPath: true,
        segLevels: null,
        breakableFitAdvances: [],
        breakablePreferredBreaks: [],
        letterSpacing: 0,
        spacingGraphemeCounts: [],
        discretionaryHyphenWidth: 0,
        tabStopAdvance: 0,
        chunks: [],
        segments: [],
      }
    : {
        widths: [],
        lineEndFitAdvances: [],
        lineEndPaintAdvances: [],
        kinds: [],
        simpleLineWalkFastPath: true,
        segLevels: null,
        breakableFitAdvances: [],
        breakablePreferredBreaks: [],
        letterSpacing: 0,
        spacingGraphemeCounts: [],
        discretionaryHyphenWidth: 0,
        tabStopAdvance: 0,
        chunks: [],
      };
}

/**
 * 原 ir：CJK 词内再切分——字素聚类为“词元”：
 * 开引号开头粘着后续、闭标点/禁则标点粘着前词、
 * carryCJKAfterClosingQuote 时 CJK 词粘着闭引号尾；
 * 非 CJK 相邻字素互相粘着。
 */
export function segmentCJKRun(text: string, quirks: LineLayoutQuirks): { text: string; start: number }[] {
  const runs: { text: string; start: number }[] = [];
  let parts: string[] = [],
    runStart = 0,
    runHasCJK = false,
    endsQuoteRun = false,
    startsOpenPunct = false;
  function flush(): void {
    parts.length !== 0 && (runs.push({ text: parts.length === 1 ? parts[0] : parts.join(``), start: runStart }), (parts = []), (runHasCJK = false), (endsQuoteRun = false), (startsOpenPunct = false));
  }
  function begin(part: string, start: number, hasCJK: boolean): void {
    (parts = [part]), (runStart = start), (runHasCJK = hasCJK), (endsQuoteRun = endsWithClosingQuoteRun(part)), (startsOpenPunct = OPEN_PUNCT_SET.has(part));
  }
  function append(part: string, hasCJK: boolean): void {
    parts.push(part), (runHasCJK ||= hasCJK);
    const quoteTail = endsWithClosingQuoteRun(part);
    part.length === 1 && CLOSE_PUNCT_SET.has(part) ? (endsQuoteRun ||= quoteTail) : (endsQuoteRun = quoteTail), (startsOpenPunct = false);
  }
  for (const segment of getCJKGraphemeSegmenter().segment(text)) {
    const part = segment.segment,
      hasCJK = containsCJK(part);
    if (parts.length === 0) {
      begin(part, segment.index, hasCJK);
      continue;
    }
    if (startsOpenPunct || CJK_NO_LINE_START_SET.has(part) || CLOSE_PUNCT_SET.has(part) || (quirks.carryCJKAfterClosingQuote && hasCJK && endsQuoteRun)) {
      append(part, hasCJK);
      continue;
    }
    if (!runHasCJK && !hasCJK) {
      append(part, hasCJK);
      continue;
    }
    flush(), begin(part, segment.index, hasCJK);
  }
  return flush(), runs;
}

/** 原 ar：keep-all 下的 CJK 再切分组合并（与 [E1] Qt 同构：按断行许可分组还原原文切片） */
export function applyKeepAllToCJKRuns(text: string, runs: { text: string; start: number }[], breakKeepAllAfterPunctuation: boolean): { text: string; start: number }[] {
  if (runs.length <= 1) return runs;
  const merged: { text: string; start: number }[] = [];
  let runStart = -1,
    runHasCJK = false;
  function pushRange(from: number, to: number): void {
    const start = runs[from].start,
      end = to < runs.length ? runs[to].start : text.length;
    merged.push({ text: text.slice(start, end), start });
  }
  function flush(index: number): void {
    if (!(runStart < 0)) {
      if (runHasCJK) runStart + 1 === index ? merged.push(runs[runStart]) : pushRange(runStart, index);
      else for (let i = runStart; i < index; i++) merged.push(runs[i]);
      (runStart = -1), (runHasCJK = false);
    }
  }
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    runStart >= 0 && !allowsBreakAfter(runs[i - 1].text, breakKeepAllAfterPunctuation) && flush(i), runStart < 0 && (runStart = i), (runHasCJK ||= containsCJK(run.text));
  }
  return flush(runs.length), merged;
}

/** 原 or：字间距记账用字素数（零宽/软连字符/硬换行 0；制表位 1） */
export function graphemeCountForSpacing(text: string, kind: TokenKind): number {
  if (kind === `zero-width-break` || kind === `soft-hyphen` || kind === `hard-break`) return 0;
  if (kind === `tab`) return 1;
  let count = 0;
  const segmenter = getCJKGraphemeSegmenter();
  for (const segment of segmenter.segment(text)) count++;
  return count;
}

/** 原 sr：连字符族字符（含亚美尼亚连字符） */
export function isHyphenLikeChar(ch: string): boolean {
  return ch === `-` || ch === `\u058A` || ch === `\u2010` || ch === `\u2012` || ch === `\u2013` || ch === `\u2014`;
}

/** 原 cr：连字符优先断点（各连字符后的字素序号；无连字符 → null） */
export function hyphenBreakOffsets(text: string): number[] | null {
  if (!/[-\u058A\u2010\u2012\u2013\u2014]/u.test(text)) return null;
  const offsets: number[] = [];
  let ordinal = 0;
  for (const segment of getCJKGraphemeSegmenter().segment(text)) ordinal++, isHyphenLikeChar(segment.segment) && offsets.push(ordinal);
  return offsets.length === 0 ? null : offsets;
}

/** 原 lr：字间距补偿宽度（n 个字素计 n-1 份） */
export function widthWithLetterSpacing(width: number, graphemeCount: number, letterSpacing: number): number {
  return graphemeCount > 1 ? width + (graphemeCount - 1) * letterSpacing : width;
}

/**
 * 原 ur（[E2] 核心）：令牌流 → 宽度表——
 * 逐令牌：软连字符/硬换行/制表位记 0 宽；CJK 文本再切分（keep-all 合并）；
 * 可断词（长度 >1 的词）按怪癖选择字素宽度模式（数字 → pair-context；
 * Safari 前缀偏好 → segment-prefixes；否则 sum-graphemes）并记连字符断点；
 * 空格类行尾记账归零；字间距按字素数补偿；单块且无字间距 → 快路径标记；
 * 硬换行分块重映射到宽度索引；段级 BiDi 级别（Ae）。
 */
export function buildWidthTable(stream: LayoutTokenStream, font: string, withSegments: boolean, wordBreak: string, letterSpacing: number): MeasuredText {
  const quirks = getLineLayoutQuirks(),
    { cache, emojiCorrection } = openFontMeasureSession(font, containsEmojiSequence(stream.normalized)),
    discretionaryHyphenWidth = emojiCorrectedWidth(`-`, measureTextCached(`-`, cache), emojiCorrection) + (letterSpacing === 0 ? 0 : letterSpacing * 2),
    tabStopAdvance = emojiCorrectedWidth(` `, measureTextCached(` `, cache), emojiCorrection) * 8,
    hasLetterSpacing = letterSpacing !== 0;
  if (stream.len === 0) return createEmptyMeasuredText(withSegments);
  const widths: number[] = [],
    lineEndFitAdvances: number[] = [],
    lineEndPaintAdvances: number[] = [],
    kinds: TokenKind[] = [];
  let simpleLineWalkFastPath = stream.chunks.length <= 1 && !hasLetterSpacing;
  const segmentStarts: number[] | null = withSegments ? [] : null,
    breakableFitAdvances: (number[] | null)[] = [],
    breakablePreferredBreaks: (number[] | null)[] = [],
    spacingGraphemeCounts: number[] = [],
    segmentTexts: string[] | null = withSegments ? [] : null,
    segmentToWidthIndex: number[] = Array.from({ length: stream.len });
  /** 记账一段（原 S 闭包） */
  function record(
    text: string,
    width: number,
    lineEndFit: number,
    lineEndPaint: number,
    kind: TokenKind,
    start: number,
    fitAdvances: number[] | null,
    preferredBreaks: number[] | null,
    graphemeCount: number,
  ): void {
    kind !== `text` && kind !== `space` && kind !== `zero-width-break` && (simpleLineWalkFastPath = false),
      widths.push(width),
      lineEndFitAdvances.push(lineEndFit),
      lineEndPaintAdvances.push(lineEndPaint),
      kinds.push(kind),
      segmentStarts?.push(start),
      breakableFitAdvances.push(fitAdvances),
      breakablePreferredBreaks.push(preferredBreaks),
      hasLetterSpacing && spacingGraphemeCounts.push(graphemeCount),
      segmentTexts !== null && segmentTexts.push(text);
  }
  /** 测量并记账一个文本片段（原 C 闭包） */
  function measureAndRecord(text: string, kind: TokenKind, start: number, isWordLike: boolean, breakable: boolean): void {
    const measure = measureTextCached(text, cache),
      graphemeCount = hasLetterSpacing ? graphemeCountForSpacing(text, kind) : 0,
      width = widthWithLetterSpacing(emojiCorrectedWidth(text, measure, emojiCorrection), graphemeCount, letterSpacing),
      fitWidth = kind === `space` || kind === `preserved-space` || kind === `zero-width-break` ? 0 : width,
      lineEndFit = fitWidth === 0 ? 0 : fitWidth + (graphemeCount > 0 ? letterSpacing : 0),
      paintWidth = kind === `space` || kind === `zero-width-break` ? 0 : width;
    if (breakable && isWordLike && text.length > 1) {
      let mode: BreakableFitMode = `sum-graphemes`;
      letterSpacing === 0 ? (isNumericTokenText(text) ? (mode = `pair-context`) : quirks.preferPrefixWidthsForBreakableRuns && (mode = `segment-prefixes`)) : (mode = `segment-prefixes`);
      const advances = computeBreakableFitAdvances(text, measure, cache, emojiCorrection, mode);
      record(text, width, lineEndFit, paintWidth, kind, start, advances, advances === null || wordBreak === `keep-all` ? null : hyphenBreakOffsets(text), graphemeCount);
      return;
    }
    record(text, width, lineEndFit, paintWidth, kind, start, null, null, graphemeCount);
  }
  for (let i = 0; i < stream.len; i++) {
    segmentToWidthIndex[i] = widths.length;
    const text = stream.texts[i],
      isWordLike = stream.isWordLike[i],
      kind = stream.kinds[i],
      start = stream.starts[i];
    if (kind === `soft-hyphen`) {
      record(text, 0, discretionaryHyphenWidth, discretionaryHyphenWidth, kind, start, null, null, 0);
      continue;
    }
    if (kind === `hard-break`) {
      record(text, 0, 0, 0, kind, start, null, null, 0);
      continue;
    }
    if (kind === `tab`) {
      record(text, 0, 0, 0, kind, start, null, null, hasLetterSpacing ? graphemeCountForSpacing(text, kind) : 0);
      continue;
    }
    const measure = measureTextCached(text, cache);
    if (kind === `text` && measure.containsCJK) {
      const cjkRuns = segmentCJKRun(text, quirks),
        finalRuns = wordBreak === `keep-all` ? applyKeepAllToCJKRuns(text, cjkRuns, quirks.breakKeepAllAfterPunctuation) : cjkRuns;
      for (let k = 0; k < finalRuns.length; k++) {
        const run = finalRuns[k];
        measureAndRecord(run.text, `text`, start + run.start, isWordLike, wordBreak === `keep-all` || !containsCJK(run.text));
      }
      continue;
    }
    measureAndRecord(text, kind, start, isWordLike, true);
  }
  const chunks = remapChunksToWidthIndexes(stream.chunks, segmentToWidthIndex, widths.length),
    segLevels = segmentStarts === null ? null : mapBidiLevelsToSegmentStarts(stream.normalized, segmentStarts);
  return segmentTexts === null
    ? {
        widths,
        lineEndFitAdvances,
        lineEndPaintAdvances,
        kinds,
        simpleLineWalkFastPath,
        segLevels,
        breakableFitAdvances,
        breakablePreferredBreaks,
        letterSpacing,
        spacingGraphemeCounts,
        discretionaryHyphenWidth,
        tabStopAdvance,
        chunks,
      }
    : {
        widths,
        lineEndFitAdvances,
        lineEndPaintAdvances,
        kinds,
        simpleLineWalkFastPath,
        segLevels,
        breakableFitAdvances,
        breakablePreferredBreaks,
        letterSpacing,
        spacingGraphemeCounts,
        discretionaryHyphenWidth,
        tabStopAdvance,
        chunks,
        segments: segmentTexts,
      };
}

/** 原 dr：硬换行分块的段索引 → 宽度索引重映射（越界夹到表尾） */
export function remapChunksToWidthIndexes(
  chunks: { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[],
  segmentToWidthIndex: number[],
  widthCount: number,
): { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[] {
  const remapped: { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i],
      start = chunk.startSegmentIndex < segmentToWidthIndex.length ? segmentToWidthIndex[chunk.startSegmentIndex] : widthCount,
      end = chunk.endSegmentIndex < segmentToWidthIndex.length ? segmentToWidthIndex[chunk.endSegmentIndex] : widthCount,
      consumed = chunk.consumedEndSegmentIndex < segmentToWidthIndex.length ? segmentToWidthIndex[chunk.consumedEndSegmentIndex] : widthCount;
    remapped.push({ startSegmentIndex: start, endSegmentIndex: end, consumedEndSegmentIndex: consumed });
  }
  return remapped;
}

/* ============================================================================
 * §9 测量入口与行级 API（原 fr.._r，jsx 11807-11846）
 * ==========================================================================*/

/** 原 fr：文本 → 宽度表（令牌化 + buildWidthTable） */
export function measureTextLayout(text: string, font: string, withSegments: boolean, options?: TextMeasureOptions): MeasuredText {
  const wordBreak = options?.wordBreak ?? `normal`,
    letterSpacing = options?.letterSpacing ?? 0;
  return buildWidthTable(segmentTextToLayoutTokens(text, getLineLayoutQuirks(), options?.whiteSpace, wordBreak), font, withSegments, wordBreak, letterSpacing);
}

/** 原 pr：pre-wrap 测量（带段文本，供行提取；[E4] 布局服务主入口） */
export function measurePreWrapLayout(text: string, font: string, options?: TextMeasureOptions): MeasuredText {
  return measureTextLayout(text, font, true, options);
}

/** 原 mr：恒等（原代码预留的表变换插槽） */
export function measuredTextIdentity(table: MeasuredText): MeasuredText {
  return table;
}

/** 原 hr：行片段构造（含行文本提取） */
export function createLineFragment(
  table: MeasuredText,
  graphemeCache: Map<number, string[]>,
  width: number,
  startSegment: number,
  startGrapheme: number,
  endSegment: number,
  endGrapheme: number,
): LineFragment {
  return {
    text: extractLineText(table, graphemeCache, startSegment, startGrapheme, endSegment, endGrapheme),
    width,
    start: { segmentIndex: startSegment, graphemeIndex: startGrapheme },
    end: { segmentIndex: endSegment, graphemeIndex: endGrapheme },
  };
}

/** 原 gr：行数与最大行宽统计 */
export function countLayoutLines(table: MeasuredText, maxWidth: number): { lineCount: number; maxLineWidth: number } {
  return countLinesAndMaxWidth(measuredTextIdentity(table), maxWidth);
}

/**
 * 原 _r（[E2] 行级出口）：自游标断出下一行——
 * 定位块 → 行走一行 → 行片段（文本/宽度/起止游标）；
 * 表耗尽或行走失败 → null。maxWidth=Infinity 时走到块尾。
 */
export function breakNextLine(table: MeasuredText, cursor: LineCursor, maxWidth: number): LineFragment | null {
  const target = measuredTextIdentity(table),
    walkCursor: LineCursor = { segmentIndex: cursor.segmentIndex, graphemeIndex: cursor.graphemeIndex },
    chunkIndex = locateChunkForCursor(target, walkCursor);
  if (chunkIndex < 0) return null;
  const startSegment = walkCursor.segmentIndex,
    startGrapheme = walkCursor.graphemeIndex,
    width = walkLineFromCursor(target, walkCursor, chunkIndex, maxWidth);
  return width === null ? null : createLineFragment(table, getLineGraphemeCache(table), width, startSegment, startGrapheme, walkCursor.segmentIndex, walkCursor.graphemeIndex);
}

/* ============================================================================
 * 尾符号表（本文件导出 ↔ 原混淆名 ↔ jsx 行）
 * ----------------------------------------------------------------------------
 * 导出符号（44）：
 *  宿主：getMeasureContext(ln,11106) getFontMeasureCache(un,11109)
 *   measureTextCached(dn,11112) getLineLayoutQuirks(fn,11119)
 *   parseFontSizeFromFont(pn,11139) getGraphemeSegmenter(mn,11144)
 *  表情：EMOJI_PRESENTATION_RE(an,11098) EMOJI_SEQUENCE_RE(on,11099)
 *   isEmojiPresentation(hn,11148) containsEmojiSequence(gn,11151)
 *   measureEmojiOverdrawCorrection(_n,11154) countEmojiSegments(vn,11168)
 *   emojiCountOf(yn,11174) emojiCorrectedWidth(bn,11177)
 *   computeBreakableFitAdvances(xn,11180) openFontMeasureSession(Sn,11222)
 *  记账：isFitOnlyKind(Cn,11233) isLineEndShrinkableKind(wn,11236)
 *   skipShrinkableKinds(Tn,11239) advanceToTabStop(En,11247)
 *   fitLetterSpacingAt(Dn,11253) addIfNonZero(On,11256)
 *   letterSpacingAtSegment(kn,11258) lineEndFitAdvanceOf(An,11261)
 *   fitAdvanceOf(jn,11263) paintAdvanceOf(Mn,11265)
 *   withTrailingLetterSpacing(Nn,11268) plusLetterSpacing(Pn,11270)
 *   lowerBoundIndex(Fn,11273) trailingLetterSpacingBefore(In,11280)
 *   advanceWithTrailingSpacing(Ln,11297)
 *  块定位：findChunkBySegment(Rn,11298) enterChunkAtCursor(zn,11308)
 *   locateChunkForCursor(Bn,11318) advanceToNextChunk(Vn,11323)
 *  行走：walkChunkLine(Hn,11324) walkSimpleLine(Un,11438)
 *   walkLineFromCursor(Wn,11479) walkNextLineFromCursor(Gn,11482)
 *   countLinesAndMaxWidth(Kn,11488)
 *  行提取：getLineGraphemeSegmenter(Yn,11528) graphemesOfSegment(Xn,11530)
 *   isSoftHyphenLineEnd(Zn,11536) appendStringSlice(Qn,11539)
 *   getLineGraphemeCache($n,11542) extractLineText(er,11546)
 *  CJK/构建：getCJKGraphemeSegmenter(nr,11568) createEmptyMeasuredText(rr,11573)
 *   segmentCJKRun(ir,11600) applyKeepAllToCJKRuns(ar,11640)
 *   graphemeCountForSpacing(or,11666) isHyphenLikeChar(sr,11676)
 *   hyphenBreakOffsets(cr,11680) widthWithLetterSpacing(lr,11687)
 *   buildWidthTable(ur,11689) remapChunksToWidthIndexes(dr,11791)
 *  入口：measureTextLayout(fr,11807) measurePreWrapLayout(pr,11813)
 *   measuredTextIdentity(mr,11815) createLineFragment(hr,11817)
 *   countLayoutLines(gr,11831) breakNextLine(_r,11834)
 * 内部（未导出）：cachedMeasureContext(en,11094) fontMeasureCaches(tn,11095)
 *   cachedLineLayoutQuirks(nn,11117) cachedGraphemeSegmenter(sn,11143)
 *   emojiCorrectionCache(cn,11153) PAIR_CONTEXT_GRAPHEME_LIMIT(rn,11097)
 *   cachedLineGraphemeSegmenter(qn,11525) lineGraphemeCaches(Jn,11526)
 *   cachedCJKGraphemeSegmenter(tr,11566)
 * ============================================================================
 */
