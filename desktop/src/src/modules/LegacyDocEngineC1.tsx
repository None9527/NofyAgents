/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineC1.tsx — legacy-doc 内部引擎 C 上（解混淆重建 · B5-08 · 批次 C）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （只读；行号锚点均指 jsx 还原孪生
 *   src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx）
 *
 * 本文件覆盖（jsx 行号，互斥段）：
 *  §A1 测量原语族            18106-19189（[E6]b 登记余量）
 *  §A2 分页主循环 Mg 全量     19190-19541（含内层 19230-19541；
 *                            19190-19229 与批 B BLayout.paginateDocumentReconstructed
 *                            骨架重叠——本文件为逐字全量实体，批 B 文件不改）
 *  §B  隙段（C_/w_ 风格解析起）20231-20943
 *  §D  依赖补全（批 B 名义区段内未实体化、且本批范围必需者）：
 *      Br (12019) | _o/vo/xo/So/Mo (13983-14075) |
 *      Cp/wp/Tp + jp/Mp/Np/Pp/Fp/zp/Bp/Vp/Hp (17137-17541) |
 *      Gm/Km/qm/Jm (18049-18105) | Ng/Fg/Kg (19542-19563, 19817-19820) |
 *      ry/iy/ay/fb/bb/gb 局部克隆 (21933-21968, 22899-23038 语义；正式实体在 C2)
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射（jsx 行号；把握度：高/中）
 * ----------------------------------------------------------------------------
 * §D 依赖补全：
 *   Br → twipsToPxNonNegative (2154) | _o → PAGE_BREAK_RUN_RE (13983)
 *   vo → PAGE_BREAK_BEFORE_TAG_RE (13984) | xo → paragraphHasPageBreakRun (13993)
 *   So → paragraphPageBreakBeforeOf (13997) | Mo → nodePageBreakStarts (14061)
 *   Cp/wp/Tp → layoutTextCache/fragmentCache/singleFontCache (17137-17139)
 *   jp → tabPlaceholderSpaces (17233) | Mp → paragraphLayoutText (17248)
 *   Np → splitParagraphByLineBreaks (16012) | Pp → splitPartContentHeight (17373)
 *   Fp → fitSplitPartsHeight (16048) | zp → layoutTextFragments (17418)
 *   Bp → singleFontOfLayoutText (16120) | Vp → fragmentsForRuns (17465)
 *   Hp → paragraphLineLayout (17480)
 *   Gm → pageBreakHintMap (18531) | Km → paragraphIsKeepNextCandidate (18055)
 *   qm → keepNextChainFitsPageTail (18545) | Jm → paragraphDominantFontSizePt (18088)
 *   Ng → isInlineImageNode (24440) | Fg → isPageMarginCornerAnchoredFloating (19555)
 *   Kg → isFloatingImageNode (19817)
 * §A1 测量原语族（18106-19189）：
 *   Ym → paragraphFontSizePx (18556) | Xm → paragraphMaxFontPx (18113)
 *   Zm → firstFontFamilyName (18581) | Qm → paragraphDefaultFontFamily (18124)
 *   $m → denseLineFactorForFont (18590) | eh → looseLineFactorForFont (18154)
 *   th → paragraphIsCjkLike (18158) | nh → lineSpacingFactorFor (18161)
 *   rh → paragraphHasHardLineBreak (18782) | ih → charClassWidthFactor (18168)
 *   ah → heuristicCharClassWidth (18888) | oh → runFontPx (18175)
 *   sh → fontStringOf (18965) | ch → runFontString (18183)
 *   lh → splitTextByFont (19280) | uh → measureTextWidth (18192)
 *   dh → paragraphTabStopsPx (19659) | fh → paragraphIndentStartPx (18217)
 *   ph → leftTabStopsAfterIndent (18224) | mh → nextTabStopAfter (18228)
 *   hh → expandTabsToSpaces (20352) | gh → segmentsWidthPx (18235)
 *   _h → greedyLineCount (20461) | vh → paragraphTabSegments (18274)
 *   yh → splitTabSegments (18295) | bh → tocTabLineCount (18322)
 *   xh → lineCountCache (18343) | Sh → lineCountCacheGet (18345)
 *   Ch → lineCountCacheSet (18347) | wh → paragraphLineCount (18352)
 *   Th → paragraphContentWidth (22492) | Eh → paragraphEstimatedLineCount (18454)
 *   Dh → wrappedImageFootprintHeight (22515) | Oh → layoutBottomPx (18479)
 *   kh → layoutHasFullWidthExclusion (22542) | Ah → layoutHeightPx (18493)
 *   jh → layoutRangeHeightPx (22558) | Mh → layoutFitLineEnd (18505)
 *   Nh → lineTwipsToMultiple (18523) | Ph → doubleLineBlend (18525)
 *   Fh → lineHeightFromMultiple (18532) | Ih → snapToGridModeOf (18536)
 *   Lh → gridSnapHeight (18548) | Rh → paragraphLineHeight (18553)
 *   zh → paragraphOuterHeight (18572) | Bh → xmlHasSpacingBefore (18602)
 *   Vh → xmlHasParagraphSpacing (18608) | Hh → applyDefaultSpacingForGrid (18614)
 *   Uh → spacingBeforeAbsent (22701) | Wh → estimateCellContentHeight (18635)
 *   Gh → rowIsSplittable (22827) | Kh → rowNeedsHeightEstimation (18676)
 *   qh → rowHasNestedTable (18686) | Jh → rowHeightWithCaps (18689)
 *   Yh → tableStyleIdOf (18699) | Xh → tableHasVisibleBorders (18703)
 *   Zh → tableHasUnspacedParagraphs (18707) | Qh → tableIsTableGrid (18710)
 *   $h → tableRowHeights (18713) | eg → computeTableRowHeights (18729)
 *   tg → tableRowStyle (18759) | ng → dedupeSafeBoundaries (18766)
 *   rg → paragraphSafeLayout (18776) | ig → tableSafeLayout (18803)
 *   ag → cellSafeBoundaries (18812) | og → boundaryIsSafe (18840)
 *   sg → tableRowSliceFitHeight (18844) | cg → tableOuterHeightPx (18899)
 *   lg → estimateNodeHeight (23280) | ug → paragraphSpacingBeforeRaw (18918)
 *   dg → paragraphSpacingAfterRaw (23351) | fg → widowControlEnabled (18924)
 *   pg → isPlainPageBreakSpacer (23390) | mg → spacingBeforeAfterPageBreak (18929)
 *   hg → paragraphCanSplitLines (23421) | gg → lineRangeIsPartial (18939)
 *   _g → lineRangeForBand (23686) | vg → segmentRenderBottomPx (18957)
 *   yg → segmentCoversWholeParagraph (23765) | bg → splitEdgePadding (18964)
 *   xg → splitEdgeSmoothingPadding (23830) | Sg → splitSegmentExtraHeight (18987)
 *   Cg → splitSegmentSmoothingExtraHeight (23863) | wg → segmentMatchesLineRange (19000)
 *   Tg → nodeLayoutHeight (23894) | Eg → resolveParagraphLineRange (19025)
 *   Dg → trySplitParagraphSegment (24172) | Og → distributeSegmentsAcrossPages (19092)
 *   kg → rowRangeHeight (24262) | Ag → fitRowsWithin (19162)
 *   jg → paginateByBreakHints (24393)
 * §A2 分页主循环：
 *   Mg → paginateDocument (19190-19541；内层逐节点推进 19230-19541 全量)
 * §B 隙段（20231-20943）：
 *   w_ → tocLevelOf (20231) | T_ → isTocParagraph (20241)
 *   E_ → paragraphHasTocTab (20242) | D_ → tocTabStopOf (20245)
 *   O_ → tocFirstTabStopPx (20254) | k_ → paragraphHasTabChar (20257)
 *   A_ → countTabChars (20260) | j_ → tabLayoutKindOf (20269)
 *   M_ → tabStopByAlignment (20279) | N_ → decodeXmlEntities (20282)
 *   P_ → matchXmlRegions (20291) | F_ → revisionKindOfTag (20329)
 *   I_ → normalizeWhitespace (20341) | L_ → formatRevisionDateUtc (20346)
 *   R_ → stripTextBoxContentXml (20357) | z_ → extractRunTextSegments (20361)
 *   B_ → xmlFlagEnabled (20402) | V_ → xmlColorAttr (20407)
 *   H_ → parseRunStyleXml (20413) | U_ → extractXmlRegionContents (20451)
 *   W_ → mergeRunStyles (20454) | G_ → parseParagraphAlign (20469)
 *   K_ → escapeXmlAttrValue (20474) | q_ → svgDataUrl (20477)
 *   J_ → emuToPxRounded (20479) | Y_ → resolveFieldDisplayText (20482)
 *   X_ → parseTextBoxLines (20504) | Z_ → parseTextBoxShapeStyle (20574)
 *   Q_ → textBoxPlainText (20594) | $_ → textBoxRenderLines (20600)
 *   ev → textBoxZIndex (20621) | tv → renderTextBoxSvg (20625)
 *   nv → syntheticTextBoxIsGraphicShape (20674) | rv → parseShapeTransformXml (20679)
 *   iv → joinCssTransforms (20695) | av → shapeTransformCss (20699)
 *   ov → isTopAnchoredFloating (20726) | sv → describeFormattingList (20729)
 *   cv → describeRunFormattingXml (20732) | lv → describeParagraphFormattingXml (20736)
 *   uv → describeTableFormattingXml (20740) | dv → parseParagraphRevisions (20746)
 *   fv → parseParagraphCommentRanges (20863) | pv → pageFieldKindOfInstruction (20913)
 *   mv → styleRefTargetOfInstruction (20920) | hv → paragraphPageFieldKinds (20930)
 *
 * ----------------------------------------------------------------------------
 * 二、外部契约（其他批次实体，本文件导入）
 * ----------------------------------------------------------------------------
 *  BThumbnails：tc/nc/rc/sc/oc/ac/lc/uc/cc/dc/fc/pc/Sc/Cc/wc/Ac/Zc/Qc/$c/
 *    el/tl/nl/ol/sl/cl/vl/yl/bl/xl/Sl/Ic/Lc/Rc/zc/Xc/Fc 常量；
 *    engineCacheHl/Ul/Zl/Jl/Ml/Nl 缓存；boundedCacheSet (Wl)
 *  BModel：类型族 + normalizeFontFamily (m_) / xmlAttrValue (ql) /
 *    twipsToPxRounded (ld) / clampNumber (ou) / formFieldDisplayText (Df) /
 *    firstTextRunStyle (Of) / isParagraph (kf) / paragraphHasImage (Pf) /
 *    paragraphIsImageOnly (If) / paragraphIsFloatingImageOnly (Lf) /
 *    paragraphHasFormField (qf) / paragraphHasCheckbox (Jf) /
 *    paragraphHasVisibleText (Yf) / paragraphIsWhitespaceOnly ($f) /
 *    paragraphIsCheckboxYesNoRow (up) / nodeIsRemovableCover (cp) /
 *    paragraphIsCoverCandidate (Vf) / sectionIndexForNode (Hd) /
 *    rowHeightCacheKey (Kl) / Z_LAYER_MAX (nd)
 *  BLayout：paragraphBreakFlags (wm) / explicitColumnBreakOf (Tm) /
 *    lastRenderedPageBreakOf (Em) / lastRenderedBreakAtStart (Dm) /
 *    pageTailNearlyFull (Om) / pageBreakBeforeOf (Im) /
 *    sectionBreakNewPageOf (Lm) / paragraphStartsNewPage (Rm) /
 *    paragraphIsEmptyText (cm) / emptyBeforeDeletedMark (um) /
 *    isSectionBreakSpacer (dm) / isRemovableSectionSpacer (fm) /
 *    isTrailingSectionSpacer (pm) / contextualSpacingApplies (hm) /
 *    sectionBreakNodeIndexes (Bm) / newPageSectionStarts (Um) /
 *    xmlBoolAttrEnabled (km) / wordBreakOf (Lp) / imagePlaceholderText (Wp) /
 *    advanceAfterText (im) / nextTabStopDistance (am) / checkboxGapPx (Zp) /
 *    estimateTextWidthPx (rm) / isTocStyleName (C_) /
 *    paragraphFloatingLayout (Yp) /
 *    resolveNumberingIndent (c_) / numberingLabelWidthPx (l_) /
 *    keepNextExtraSpacing (n_) / borderTotalPx (o_) / paragraphIsSectionCover (Pm)
 *  Engine3：splitTextByScriptRuns (ji) / resolvePrimaryFontFamily (Mi)
 *  Engine4：layoutTextItemsBlock (Ns) / layoutPlainTextBlock (Ms) /
 *    tablePageBreakRowIndexes (jo) / countWrappedLinesCached (_s)
 *
 * §0 接线（A0-S2c；实体在 C2，C1↔C2 环时序安全）：
 *   zv → numberingLabelsForModel (21793) | kv → formatPageNumber (21729)
 *   yy/Ey/jy/My/Ny/Py/Ly/zy/ub → 表格几何族（22103-22868）
 *
 * ----------------------------------------------------------------------------
 * 三、与批 B 的边界裁决（详见 LegacyDocEngineC.report.md §2）
 * ----------------------------------------------------------------------------
 *  1. Mg (19190-19541)：批 B BLayout.paginateDocumentReconstructed 为骨架
 *     （内层 19230-19541 锚点登记）；本文件 paginateDocument 为逐字全量实体。
 *     批 B 文件不改；两者并存，报告记录重叠。
 *  2. _m (17851)：批 B spacingBeforeWithContext 第 4 参为 gridPitchPx 且缺
 *     mg 页断空格抑制；本文件按原式实体化 spacingBeforeForPagination，
 *     差异仅记录。gm 同理（批 B 依赖 declare paragraphSpacingAfterLocal；
 *     本文件 spacingAfterForPagination 直连 dg）。
 *  3. BLayout declare（Ym/Qm/ch/lh/uh/Nh/Fh/Rh/zh/lg/Tg/Ng/Kg/Mo/Gm/jb/
 *     dv/ov/E_/j_/D_/hv 等）由本文件实体化，名称对照见报告 §4。
 *  4. 批 B 未实体化且本批必需者（Mp/Np/Pp/Fp/jp/zp/Bp/Vp/Hp/Cp/wp/Tp、
 *     Ng/Kg/Fg、Gm/qm/Jm/Km、Mo/So/xo、Br）在本文件 §D 补全。
 * ============================================================================
 */

import {
  ROW_HEIGHT_TOLERANCE_PX,
  DEFAULT_FONT_SIZE_PT,
  DEFAULT_LINE_SPACING_MULTIPLE,
  SINGLE_LINE_SPACING,
  COMPACT_LINE_FACTOR,
  DENSE_LINE_FACTOR,
  NORMAL_LINE_FACTOR,
  LOOSE_LINE_FACTOR,
  ONE_POINT_FIVE_LINE,
  ONE_POINT_FIVE_LINE_ALT,
  DOUBLE_LINE_FACTOR,
  MIN_LINE_SPACING_RATIO,
  MIN_BLOCK_HEIGHT_PX,
  DEFAULT_LINE_PITCH_TWIPS,
  ZERO_OFFSET_A,
  ZERO_OFFSET_B,
  KEY_CODE_PAGE_NAV,
  FALLBACK_FONT_FAMILY,
  NUMBERING_LABEL_FONT_SIZE_PX,
  NUMBERING_LABEL_FONT_WEIGHT,
  NUMBERING_LABEL_GAP_PX,
  NUMBERING_LABEL_MIN_WIDTH_PX,
  TEXT_MEASURE_CACHE_LIMIT,
  ANNOTATION_GUTTER_WIDTH_PX,
  ANNOTATION_GUTTER_MIN_PX,
  ANNOTATION_ANCHOR_OFFSET_PX,
  ANNOTATION_CARD_MIN_HEIGHT_PX,
  ANNOTATION_CARD_GAP_PX,
  ANNOTATION_LANE_HEIGHT_PX,
  GUTTER_PADDING_A_PX,
  GUTTER_PADDING_B_PX,
  GUTTER_PADDING_C_PX,
  ENABLE_LAYOUT_SMOOTHING,
  LINE_HEIGHT_FALLBACK_FACTOR,
  TWIPS_PER_POINT_REF,
  DOUBLE_MIN_BLOCK_HEIGHT_PX,
  LETTERHEAD_COLUMN_MIN_COUNT,
  engineCacheHl,
  engineCacheUl,
  engineCacheZl,
  engineCacheJl,
  engineCacheMl,
  engineCacheNl,
  engineCacheIl,
  engineCacheLl,
  boundedCacheSet,
} from "./LegacyDocEngineBThumbnails";
import type {
  DocxEditorModel,
  DocxNode,
  DocxParagraphNode,
  DocxTableNode,
  DocxTableRow,
  DocxTableCell,
  DocxImageNode,
  DocxFormFieldNode,
  DocxRunStyle,
  DocxBorderSpec,
  DocxParagraphStyle,
  DocxParagraphIndent,
  PageSegment,
  SectionPageMetrics,
} from "./LegacyDocEngineBModel";
import {
  xmlAttrValue,
  twipsToPxRounded,
  clampNumber,
  formFieldDisplayText,
  firstTextRunStyle,
  isParagraph,
  paragraphHasImage,
  paragraphIsImageOnly,
  paragraphIsFloatingImageOnly,
  paragraphHasFormField,
  paragraphHasCheckbox,
  paragraphHasVisibleText,
  paragraphIsWhitespaceOnly,
  paragraphIsCheckboxYesNoRow,
  nodeIsRemovableCover,
  paragraphIsCoverCandidate,
  sectionIndexForNode,
  rowHeightCacheKey,
  Z_LAYER_MAX,
} from "./LegacyDocEngineBModel";
/** A0-S2c 条目4：m_ canonical = C5（BModel 459 为批 B 重复转录副本，保留不改；
 * 本文件消费点改指 C5 导出。C5→C1 环：双方均函数体内消费，时序安全） */
import { normalizeFontFamily } from "./LegacyDocEngineC5"; // 原 m_
import {
  paragraphBreakFlags,
  explicitColumnBreakOf,
  lastRenderedPageBreakOf,
  lastRenderedBreakAtStart,
  pageTailNearlyFull,
  pageBreakBeforeOf,
  sectionBreakNewPageOf,
  paragraphStartsNewPage,
  paragraphIsEmptyText,
  emptyBeforeDeletedMark,
  isSectionBreakSpacer,
  isRemovableSectionSpacer,
  isTrailingSectionSpacer,
  contextualSpacingApplies,
  sectionBreakNodeIndexes,
  newPageSectionStarts,
  xmlBoolAttrEnabled,
  wordBreakOf,
  imagePlaceholderText,
  advanceAfterText,
  nextTabStopDistance,
  checkboxGapPx,
  estimateTextWidthPx,
  isTocStyleName,
  resolveNumberingIndent,
  numberingLabelWidthPx,
  keepNextExtraSpacing,
  borderTotalPx,
  paragraphIsSectionCover,
  paragraphFloatingLayout,
} from "./LegacyDocEngineBLayout";
import { splitTextByScriptRuns, resolvePrimaryFontFamily } from "./LegacyDocEngine3";
import type { DocxScriptRun } from "./LegacyDocEngine3";
import {
  layoutTextItemsBlock,
  layoutPlainTextBlock,
  tablePageBreakRowIndexes,
  countWrappedLinesCached,
} from "./LegacyDocEngine4";
import type { TextBlockLayout, TextLayoutItem, LayoutExclusion } from "./LegacyDocEngine4";

/* ============================================================================
 * §0 契约登记（实体在 C2；A0-S2c 已接线为真实导入。
 * C1↔C2 环本已存在（C2 导入 C1 类型/值），两侧均为函数声明，
 * 模块初始化期无互调，时序安全。）
 * ==========================================================================*/

/** 原 zv（jsx 21793）：全文档编号标签预计算 → C2 实体导出（返回 C1 NumberingLabelEntry 面） */
/** 原 kv（jsx 21729）：页码格式化（数字 → 格式串） → C2 实体导出 */
/** 表格几何族（原 yy/Ey/jy/My/Ny/Py/Ly/zy/ub）→ C2 实体导出（§7 eg/ag/sg 消费） */
import {
  numberingLabelsForModel, // 原 zv
  formatPageNumber, // 原 kv
  tableMaxColumnCount, // 原 yy（jsx 22103）
  tableGridWidthsCached, // 原 Ey（jsx 22208）
  normalizeGridWidthsPx, // 原 jy（jsx 22276）
  evenGridWidthsPx, // 原 My（jsx 22285）
  clampTableContentWidthPx, // 原 Ny（jsx 22291）
  scaleGridWidthsToPx, // 原 Py（jsx 22294）
  cellMarginsPx, // 原 Ly（jsx 22378）
  effectiveCellMarginTwips, // 原 zy（jsx 22400）
  tableOuterBorderWidthPx, // 原 ub（jsx 22868）
} from "./LegacyDocEngineC2";

/** zv 的登记值面（与 C2 导出类型对齐） */
export interface NumberingLabelEntry {
  text?: string;
  trailingText?: string;
  imageSrc?: string;
  imageWidthPx?: number;
  imageHeightPx?: number;
  fontFamily?: string;
  color?: string;
  style?: DocxRunStyle;
}

/* --- 局部类型补丁（共享类型指数签名处的精化） --- */
interface DocxTabStop {
  positionTwips?: number;
  alignment?: string;
  leader?: string;
  [key: string]: unknown;
}
type ParagraphTabStops = DocxTabStop[];

function tabStopsOf(paragraph: DocxParagraphNode): ParagraphTabStops {
  return (paragraph.style?.tabStops ?? []) as ParagraphTabStops;
}

/* ============================================================================
 * §D-0 twips 换算与节点断页（原 Br，jsx 12019；原 _o/vo/xo/So/Mo，
 *       jsx 13983-14075；依赖补全）
 * ==========================================================================*/

/** 原 Br（jsx 12019）：twips → px（非有限 → undefined；夹取 ≥0） */
export function twipsToPxNonNegative(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.max(0, Math.round((twips as number) / TWIPS_PER_POINT_REF));
}

/** 原 _o（jsx 13983）：显式页断 run 正则 */
const PAGE_BREAK_RUN_RE = /<w:br\b[^>]*w:type="page"[^>]*\/?>/i;

/** 原 vo（jsx 13984）：pageBreakBefore 标签正则 */
const PAGE_BREAK_BEFORE_TAG_RE = /<w:pageBreakBefore\b[^>]*\/?>/i;

/** 原 xo（jsx 13993）：段落含显式页断 run */
function paragraphHasPageBreakRun(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  return xml.length > 0 && PAGE_BREAK_RUN_RE.test(xml);
}

/** 原 So（jsx 13997）：段前断页（样式或 XML 布尔属性） */
function paragraphPageBreakBeforeOf(paragraph: DocxParagraphNode): boolean {
  if (paragraph.style?.pageBreakBefore === true) return true;
  const xml = paragraph.sourceXml ?? ``;
  return xml ? xmlBoolAttrEnabled(xml.match(PAGE_BREAK_BEFORE_TAG_RE)?.[0]) : false;
}

/** 原 Mo（jsx 14061）：节点断页起点集（段前断页/页断 run/表格前后断页） */
export function nodePageBreakStarts(nodes: DocxNode[]): Set<number> {
  const breaks = new Set<number>();
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const hasNext = index + 1 < nodes.length;
    if (isParagraph(node)) {
      paragraphPageBreakBeforeOf(node) && breaks.add(index), hasNext && paragraphHasPageBreakRun(node) && breaks.add(index + 1);
      continue;
    }
    const tableBreaks = tablePageBreakRowIndexes(node as unknown as Parameters<typeof tablePageBreakRowIndexes>[0]);
    tableBreaks.startRowIndexes.includes(0) && index > 0 && breaks.add(index), hasNext && tableBreaks.breakAfterTable && breaks.add(index + 1);
  }
  for (const index of [...breaks]) (index <= 0 || index >= nodes.length) && breaks.delete(index);
  return breaks;
}

/* ============================================================================
 * §D-1 段落布局文本与行布局（原 Cp..Hp，jsx 17137-17541；依赖补全）
 * ==========================================================================*/

/** 原 Cp（jsx 17137）：段落 → 布局文本缓存（按模式键） */
const layoutTextCache = new WeakMap<DocxParagraphNode, Map<number, ParagraphLayoutText | null | undefined>>();

/** 原 wp（jsx 17138）：布局文本 → 字体片段缓存 */
const fragmentCache = new WeakMap<ParagraphLayoutText, LayoutTextFragment[]>();

/** 原 Tp（jsx 17139）：布局文本 → 单一字体缓存 */
const singleFontCache = new WeakMap<ParagraphLayoutText, string | null | undefined>();

/** 段落布局文本（原 Mp 返回面） */
export interface ParagraphLayoutText {
  text: string;
  runs: LayoutTextRun[];
}

/** 布局 run（kind：text/tab/image） */
export interface LayoutTextRun {
  kind: `text` | `tab` | `image`;
  key: string;
  text: string;
  startOffset: number;
  endOffset: number;
  style?: DocxRunStyle;
  link?: string;
  tabWidthPx?: number;
  image?: DocxImageNode;
}

/** 字体片段（原 zp 项） */
export interface LayoutTextFragment {
  text: string;
  font: string;
  startOffset: number;
  endOffset: number;
  break?: string;
  wordBreak?: string;
}

/** 原 jp（jsx 17233）：制表占位不换行空格串（宽度逼近） */
export function tabPlaceholderSpaces(widthPx: number, style: DocxRunStyle | undefined, fontSizePx: number): string {
  const target = Math.max(8, Math.round(widthPx));
  const unit = Math.max(1, measureTextWidth(`\xA0`, style, fontSizePx));
  let count = Math.max(1, Math.round(target / unit));
  let spaces = `\xA0`.repeat(count);
  let width = measureTextWidth(spaces, style, fontSizePx);
  for (; width + unit * 0.5 < target && count < 64; ) count += 1, spaces = `\xA0`.repeat(count), width = measureTextWidth(spaces, style, fontSizePx);
  for (; count > 1; ) {
    const fewer = `\xA0`.repeat(count - 1);
    const fewerWidth = measureTextWidth(fewer, style, fontSizePx);
    if (Math.abs(fewerWidth - target) >= Math.abs(width - target)) break;
    --count, spaces = fewer, width = fewerWidth;
  }
  return spaces;
}

/**
 * 原 Mp（jsx 17248）：段落布局文本——内联图占位、制表展开、
 * 显式换行/表单域/脚注引用 → undefined（缓存 Cp，模式位掩码）。
 */
export function paragraphLayoutText(
  paragraph: DocxParagraphNode,
  options?: { allowExplicitLineBreakText?: boolean; expandTabsForLayout?: boolean },
): ParagraphLayoutText | undefined {
  const mode = +!!options?.allowExplicitLineBreakText | (options?.expandTabsForLayout ? 2 : 0);
  const cache = layoutTextCache.get(paragraph);
  const cached = cache?.get(mode);
  if (cached !== void 0) return cached ?? void 0;
  const store = (value: ParagraphLayoutText | undefined): ParagraphLayoutText | undefined => (cache ? cache.set(mode, value ?? null) : layoutTextCache.set(paragraph, new Map([[mode, value ?? null]])), value);
  if (paragraphHasFormField(paragraph) || (!options?.allowExplicitLineBreakText && paragraphHasHardLineBreak(paragraph))) return store(void 0);
  const runs: LayoutTextRun[] = [];
  let text = ``;
  const fontSizePx = paragraphFontSizePx(paragraph);
  const tabStops = options?.expandTabsForLayout ? paragraphTabStopsPx(paragraph) : [];
  const checkboxRow = paragraphIsCheckboxYesNoRow(paragraph);
  const tabGrid = checkboxRow ? checkboxGapPx(paragraph) : ANNOTATION_GUTTER_WIDTH_PX;
  let cursorX = 0;
  let runStyle = firstTextRunStyle(paragraph);
  for (let index = 0; index < paragraph.children.length; index += 1) {
    const child = paragraph.children[index];
    if (!child) continue;
    if (child.type === `image`) {
      if ((child as DocxImageNode).floating) continue;
      const placeholder = imagePlaceholderText(child as DocxImageNode, runStyle, fontSizePx);
      const start = text.length;
      text += placeholder, runs.push({
        kind: `image`,
        key: `run-${index}`,
        text: placeholder,
        startOffset: start,
        endOffset: text.length,
        style: runStyle,
        image: child as DocxImageNode,
      });
      continue;
    }
    if (child.type !== `text` || (child as { noteReference?: unknown }).noteReference) return store(void 0);
    const childText = (child as { text: string }).text;
    if (childText.includes(`\t`)) {
      if (!options?.expandTabsForLayout) return store(void 0);
      const parts = childText.split(`\t`);
      parts.forEach((part, partIndex) => {
        if (part.length > 0) {
          const start = text.length;
          text += part, runs.push({
            kind: `text`,
            key: `run-${index}-${partIndex}`,
            text: part,
            startOffset: start,
            endOffset: text.length,
            style: (child as { style?: DocxRunStyle }).style,
            link: (child as { link?: string }).link,
          }), cursorX = advanceAfterText(cursorX, part, (child as { style?: DocxRunStyle }).style);
        }
        if (partIndex >= parts.length - 1) return;
        const distance = nextTabStopDistance(tabStops, cursorX, tabGrid, checkboxRow);
        const spaces = tabPlaceholderSpaces(distance, (child as { style?: DocxRunStyle }).style, fontSizePx);
        const start = text.length;
        text += spaces, runs.push({
          kind: `tab`,
          key: `run-${index}-${partIndex}-tab`,
          text: spaces,
          startOffset: start,
          endOffset: text.length,
          style: (child as { style?: DocxRunStyle }).style,
          tabWidthPx: distance,
        }), cursorX += distance;
      }), runStyle = (child as { style?: DocxRunStyle }).style ?? runStyle;
      continue;
    }
    const start = text.length;
    text += childText, runs.push({
      kind: `text`,
      key: `run-${index}`,
      text: childText,
      startOffset: start,
      endOffset: text.length,
      style: (child as { style?: DocxRunStyle }).style,
      link: (child as { link?: string }).link,
    }), cursorX = advanceAfterText(cursorX, childText, (child as { style?: DocxRunStyle }).style), runStyle = (child as { style?: DocxRunStyle }).style ?? runStyle;
  }
  return text.length === 0 ? store(void 0) : store({
    text,
    runs,
  });
}

/* --- §D-1a 段落样式克隆局部副本（正式实体在 C2；Np 所需，避免循环） --- */

/** 原 ry（jsx 21933，C2 正式实体）：边框侧浅克隆 */
function cloneBorderSideLocal(border: DocxBorderSpec | undefined): DocxBorderSpec | undefined {
  return border ? {
    ...border,
  } : void 0;
}

/** 原 iy（jsx 21936，C2 正式实体）：段落边框族克隆 */
function cloneBordersLocal(borders: DocxParagraphStyle[`borders`]): DocxParagraphStyle[`borders`] {
  if (borders) return {
    top: cloneBorderSideLocal(borders.top),
    right: cloneBorderSideLocal(borders.right),
    bottom: cloneBorderSideLocal(borders.bottom),
    left: cloneBorderSideLocal(borders.left),
    between: cloneBorderSideLocal(borders.between),
    bar: cloneBorderSideLocal(borders.bar),
  };
}

/** 原 ay（jsx 21948，C2 正式实体 cloneParagraphStyle）：段落样式深克隆 */
function cloneParagraphStyleLocal(style: DocxParagraphStyle | undefined): DocxParagraphStyle | undefined {
  if (style) return {
    ...style,
    numbering: style.numbering ? {
      ...style.numbering,
    } : void 0,
    spacing: style.spacing ? {
      ...style.spacing,
    } : void 0,
    indent: style.indent ? {
      ...style.indent,
    } : void 0,
    tabStops: style.tabStops ? (style.tabStops as ParagraphTabStops).map((stop) => ({
      ...stop,
    })) : void 0,
    borders: cloneBordersLocal(style.borders),
    dropCap: style.dropCap ? {
      ...style.dropCap,
    } : void 0,
  };
}

/** 原 fb（jsx 22899，C2 正式实体）：run 样式浅克隆 */
function cloneRunStyleLocal(style: DocxRunStyle | undefined): DocxRunStyle | undefined {
  return style ? {
    ...style,
  } : void 0;
}

/** 原 bb（jsx 23028，C2 正式实体）：文本子节点克隆 */
function cloneTextChildLocal(child: { text: string; style?: DocxRunStyle; link?: string; noteReference?: { id: number; kind?: string } }): { type: `text`; text: string; style?: DocxRunStyle; link?: string; noteReference?: { id: number; kind?: string } } {
  return {
    type: `text`,
    text: child.text,
    style: cloneRunStyleLocal(child.style),
    link: child.link,
    noteReference: child.noteReference ? {
      ...child.noteReference,
    } : void 0,
  };
}

/** 原 gb（jsx 22969，C2 正式实体）：表单域子节点克隆 */
function cloneFormFieldChildLocal(field: DocxFormFieldNode): DocxFormFieldNode {
  return {
    type: `form-field`,
    fieldType: field.fieldType,
    sourceKind: field.sourceKind,
    id: field.id,
    tag: field.tag,
    title: field.title,
    placeholder: field.placeholder,
    checked: field.checked,
    value: field.value,
    options: field.options?.map((option) => ({
      displayText: option.displayText,
      value: option.value,
    })),
    widget: cloneWidgetLocal(field.widget),
    checkedSymbol: field.checkedSymbol,
    uncheckedSymbol: field.uncheckedSymbol,
    style: cloneRunStyleLocal(field.style),
    link: field.link,
    sourceXml: field.sourceXml,
  } as DocxFormFieldNode;
}

/** 原 mb（jsx 22913，C2 正式实体）：表单域 widget 克隆（gb 所需局部副本） */
function cloneWidgetLocal(widget: DocxFormFieldNode[`widget`]): DocxFormFieldNode[`widget`] {
  const source = widget as {
    name?: unknown; enabled?: unknown; calcOnExit?: unknown;
    text?: { inputType?: unknown; defaultText?: string; maxLength?: unknown; textFormat?: unknown };
    checkbox?: { defaultChecked?: boolean; sizeMode?: string; sizePt?: number };
    dropdown?: { defaultValue?: unknown };
  } | undefined;
  if (source) return {
    name: source.name,
    enabled: source.enabled,
    calcOnExit: source.calcOnExit,
    text: source.text ? {
      inputType: source.text.inputType,
      defaultText: source.text.defaultText,
      maxLength: source.text.maxLength,
      textFormat: source.text.textFormat,
    } : void 0,
    checkbox: source.checkbox ? {
      defaultChecked: source.checkbox.defaultChecked,
      sizeMode: source.checkbox.sizeMode,
      sizePt: source.checkbox.sizePt,
    } : void 0,
    dropdown: source.dropdown ? {
      defaultValue: source.dropdown.defaultValue,
    } : void 0,
  } as DocxFormFieldNode[`widget`];
}

/**
 * 原 Np（jsx 17330）：显式换行拆分段落——仅文本/表单域子节点，
 * 按 \n 计数拆段；后续段清除编号（ay 克隆 + numbering 置空）。
 */
export function splitParagraphByLineBreaks(paragraph: DocxParagraphNode): DocxParagraphNode[] | undefined {
  if (!paragraphHasHardLineBreak(paragraph)) return;
  const parts: DocxParagraphNode[`children`][] = [];
  let current: DocxParagraphNode[`children`] = [];
  let sawBreak = false;
  const flush = (): void => {
    parts.push(current), current = [];
  };
  for (let index = 0; index < paragraph.children.length; index += 1) {
    const child = paragraph.children[index];
    if (child) {
      if (child.type === `text`) {
        const text = (child as { text: string }).text;
        if (/^[\r\n]+$/.test(text)) {
          const lineFeeds = text.replace(/[^\n]/g, ``).length;
          if (lineFeeds > 0) {
            for (let count = 0; count < lineFeeds; count += 1) sawBreak = true, flush();
            continue;
          }
        }
        current.push(cloneTextChildLocal(child as { text: string; style?: DocxRunStyle; link?: string; noteReference?: { id: number; kind?: string } }));
        continue;
      }
      if (child.type === `form-field`) {
        current.push(cloneFormFieldChildLocal(child as DocxFormFieldNode));
        continue;
      }
      return;
    }
  }
  if (sawBreak) return flush(), parts.map((children, partIndex) => {
    const style = cloneParagraphStyleLocal(paragraph.style);
    partIndex > 0 && style?.numbering && (style.numbering = void 0);
    return {
      ...paragraph,
      style,
      sourceXml: void 0,
      children: children.length > 0 ? children : [{
        type: `text`,
        text: ``,
      }],
    };
  });
}

/** 原 Pp（jsx 17373）：拆分段内容高（图片/表单域段走外高减段距） */
export function splitPartContentHeight(part: DocxParagraphNode, contentWidthPx: number, numberingDefinitions: unknown, gridPitchPx: number | undefined): number {
  if (!paragraphHasImage(part) && !paragraphHasFormField(part)) {
    const lineHeight = paragraphLineHeight(part, gridPitchPx);
    const lineCount = paragraphEstimatedLineCount(part, contentWidthPx, numberingDefinitions);
    return Math.max(1, lineHeight * Math.max(1, lineCount));
  }
  return Math.max(1, paragraphOuterHeight(part, contentWidthPx, numberingDefinitions, gridPitchPx) - paragraphSpacingBeforeRaw(part) - paragraphSpacingAfterRaw(part));
}

/**
 * 原 Fp（jsx 17380）：拆分段适配页尾——总高（已耗+段距+最大段高+段后距）
 * 超出按倍率折算的剩余空间则放弃（返回 undefined）。
 */
export function fitSplitPartsHeight(
  parts: DocxParagraphNode[],
  consumedHeightPx: number,
  pageContentHeightPx: number,
  lastSpacingAfterPx: number,
  pageContentHeightMultiplier: number,
  contentWidthPx: number,
  spacingBeforePx: number,
  spacingAfterPx: number,
  suppressedSpacingBeforePx: number,
  numberingDefinitions: unknown,
  gridPitchPx: number | undefined,
): number | undefined {
  if (parts.length <= 1 || pageContentHeightMultiplier <= 1) return;
  const consumed = Math.max(0, Math.max(consumedHeightPx, lastSpacingAfterPx));
  const effectiveBefore = consumedHeightPx > 0 ? Math.max(0, spacingBeforePx - suppressedSpacingBeforePx) : spacingBeforePx;
  const maxPartHeight = parts.reduce((max, part) => Math.max(max, splitPartContentHeight(part, contentWidthPx, numberingDefinitions, gridPitchPx)), 0);
  const total = consumed + effectiveBefore + maxPartHeight + spacingAfterPx;
  const remainingTotal = Math.max(0, pageContentHeightPx - lastSpacingAfterPx);
  const remainingConsumed = Math.max(0, consumedHeightPx - lastSpacingAfterPx);
  const scaledRemaining = Math.max(0, remainingTotal / pageContentHeightMultiplier - remainingConsumed);
  if (!(total - consumedHeightPx > scaledRemaining + ROW_HEIGHT_TOLERANCE_PX)) return total;
}

/** 原 zp（jsx 17418）：布局文本 → 字体片段（缓存 wp） */
export function layoutTextFragments(paragraph: DocxParagraphNode, layoutText: ParagraphLayoutText): LayoutTextFragment[] {
  const cached = fragmentCache.get(layoutText);
  if (cached) return cached;
  const fontSizePx = paragraphFontSizePx(paragraph);
  const wordBreak = wordBreakOf(layoutText.text);
  const fragments = layoutText.runs.filter((run) => run.endOffset > run.startOffset).flatMap((run) => run.kind === `text` ? splitTextByFont(run.text, run.style, fontSizePx).map((part) => ({
      text: part.text,
      font: part.font,
      startOffset: run.startOffset + part.startOffset,
      endOffset: run.startOffset + part.endOffset,
      break: `normal`,
      wordBreak,
    })) : [{
      text: run.text,
      font: runFontString(run.style, fontSizePx, run.text),
      startOffset: run.startOffset,
      endOffset: run.endOffset,
      break: `never`,
      wordBreak,
    }]);
  return fragmentCache.set(layoutText, fragments), fragments;
}

/** 原 Bp（jsx 17440）：布局文本单一字体（混体 → undefined；缓存 Tp） */
export function singleFontOfLayoutText(paragraph: DocxParagraphNode, layoutText: ParagraphLayoutText): string | undefined {
  const cached = singleFontCache.get(layoutText);
  if (cached !== void 0) return cached ?? void 0;
  const fontSizePx = paragraphFontSizePx(paragraph);
  let single: string | undefined;
  for (const run of layoutText.runs) {
    if (run.endOffset <= run.startOffset) continue;
    if (run.kind !== `text`) {
      singleFontCache.set(layoutText, null);
      return;
    }
    const fonts = splitTextByFont(run.text, run.style, fontSizePx).map((part) => part.font);
    for (const font of fonts) {
      if (single === void 0) {
        single = font;
        continue;
      }
      if (font !== single) {
        singleFontCache.set(layoutText, null);
        return;
      }
    }
  }
  return singleFontCache.set(layoutText, single ?? null), single;
}

/** 原 Vp（jsx 17465）：run 序列 → 布局条目（字体分段 + 断词策略） */
export function fragmentsForRuns(runs: { text: string; style?: DocxRunStyle }[], fontSizePx: number, fullText: string): TextLayoutItem[] {
  const wordBreak = wordBreakOf(fullText);
  let offset = 0;
  return runs.flatMap((run) => {
    const start = offset;
    offset += run.text.length;
    return splitTextByFont(run.text, run.style, fontSizePx).map((part) => ({
      text: part.text,
      font: part.font,
      startOffset: start + part.startOffset,
      endOffset: start + part.endOffset,
      break: `normal`,
      wordBreak,
    }));
  }).filter((item) => item.endOffset > item.startOffset);
}

/**
 * 原 Hp（jsx 17480）：段落行布局——首行缩进排除带 + 条目布局，
 * 回退纯文本布局。
 */
export function paragraphLineLayout(
  paragraph: DocxParagraphNode,
  layoutText: ParagraphLayoutText,
  contentWidthPx: number,
  lineHeightPx: number,
  exclusions?: LayoutExclusion[],
): TextBlockLayout | undefined {
  const fallbackFont = runFontString(firstTextRunStyle(paragraph), paragraphFontSizePx(paragraph), layoutText.text);
  const wordBreak = wordBreakOf(layoutText.text);
  const fragments = layoutTextFragments(paragraph, layoutText);
  const firstLineTwips = twipsToPxRounded(paragraph.style?.indent?.firstLineTwips);
  const layoutExclusions = Number.isFinite(firstLineTwips) && (firstLineTwips as number) > 0 ? [...(exclusions ?? []), {
      left: 0,
      right: Math.min(Math.max(1, Math.round(contentWidthPx)), Math.round(firstLineTwips as number)),
      top: 0,
      bottom: 1,
    }] : exclusions;
  return (fragments.length > 0 ? layoutTextItemsBlock(layoutText.text, fragments, contentWidthPx, lineHeightPx, layoutExclusions, fallbackFont) : void 0) || layoutPlainTextBlock(layoutText.text, fallbackFont, contentWidthPx, lineHeightPx, layoutExclusions, {
    wordBreak,
  });
}

/* ============================================================================
 * §D-2 断页提示与 keepNext 链（原 Gm/Km/qm/Jm，jsx 18049-18105；依赖补全）
 * ==========================================================================*/

/** 原 Gm（jsx 18049）：节点索引 → 其后最近断页提示索引（无则 -1） */
export function pageBreakHintMap(nodeCount: number, breaks: Set<number>): number[] {
  const hints = Array(nodeCount).fill(-1) as number[];
  let nearest = -1;
  for (let index = nodeCount - 1; index >= 0; --index) hints[index] = nearest, breaks.has(index) && (nearest = index);
  return hints;
}

/** 原 Km（jsx 18055）：keepNext 链候选（可见文本、非图/域/各类断页） */
function paragraphIsKeepNextCandidate(paragraph: DocxParagraphNode): boolean {
  return !(!paragraphHasVisibleText(paragraph) || paragraphHasImage(paragraph) || paragraphHasFormField(paragraph) || paragraphBreakFlags(paragraph) || pageBreakBeforeOf(paragraph) || lastRenderedBreakAtStart(paragraph) || sectionBreakNewPageOf(paragraph));
}

/**
 * 原 qm（jsx 18058）：keepNext 链是否恰好填满页尾——
 * 链总高超出页剩余且超出量在 (容差, 编号字号参考] 内。
 */
export function keepNextChainFitsPageTail(
  model: DocxEditorModel,
  nodeIndex: number,
  consumedHeightPx: number,
  lastSpacingAfterPx: number,
  contentWidthPx: number,
  pageContentHeightPx: number,
  breakHints: Set<number>,
  newPageStarts: Set<number>,
  hintMap: number[],
  estimateHeight: (nodeIndex: number, node: DocxNode, widthPx: number) => number,
  spacingBefore: (nodeIndex: number, node: DocxParagraphNode, consumedPx: number) => number,
  spacingAfter: (nodeIndex: number, node: DocxParagraphNode) => number,
): boolean {
  if (consumedHeightPx <= 0 || nodeIndex <= 0) return false;
  const nextBreak = hintMap[nodeIndex] ?? -1;
  if (nextBreak <= nodeIndex || !breakHints.has(nextBreak) || !newPageStarts.has(nextBreak)) return false;
  const pageRemaining = pageContentHeightPx - consumedHeightPx;
  let chainHeight = 0;
  let pendingSpacingAfter = lastSpacingAfterPx;
  let scanned = 0;
  for (let cursor = nodeIndex; cursor < nextBreak; cursor += 1) {
    const node = model.nodes[cursor];
    if (isParagraph(node) && isSectionBreakSpacer(node)) {
      pendingSpacingAfter = 0;
      continue;
    }
    if ((isParagraph(node) && nodeIsRemovableCover(model, cursor, node, contentWidthPx, pageContentHeightPx)) || (isParagraph(node) && paragraphIsCoverCandidate(node))) return false;
    if (isParagraph(node) && emptyBeforeDeletedMark(node, model.nodes[cursor - 1])) continue;
    if (!isParagraph(node) || !paragraphIsKeepNextCandidate(node) || (scanned += 1, scanned > NUMBERING_LABEL_FONT_SIZE_PX)) return false;
    const before = paragraphSpacingBeforeRaw(node);
    const after = paragraphSpacingAfterRaw(node);
    const effectiveBefore = spacingBefore(cursor, node, consumedHeightPx + chainHeight);
    const effectiveAfter = spacingAfter(cursor, node);
    const outer = Math.max(1, estimateHeight(cursor, node, contentWidthPx) - before - after + effectiveBefore + effectiveAfter);
    const suppressed = consumedHeightPx + chainHeight > 0 ? Math.min(pendingSpacingAfter, effectiveBefore) : 0;
    const added = Math.max(1, outer - suppressed);
    chainHeight += added, pendingSpacingAfter = effectiveAfter;
  }
  if (scanned === 0) return false;
  const overflow = chainHeight - pageRemaining;
  return overflow > ROW_HEIGHT_TOLERANCE_PX && overflow <= NUMBERING_LABEL_FONT_WEIGHT;
}

/** 原 Jm（jsx 18088）：段落主导字号（磅；按字符数众数，平手取大） */
export function paragraphDominantFontSizePt(paragraph: DocxParagraphNode): number | undefined {
  const histogram = new Map<number, number>();
  const tally = (sizePt: number | undefined, count: number): void => {
    if (!Number.isFinite(sizePt) || (sizePt as number) <= 0 || count <= 0) return;
    const key = Number((sizePt as number).toFixed(2));
    histogram.set(key, (histogram.get(key) ?? 0) + count);
  };
  if (paragraph.children.forEach((child) => {
    if (child.type !== `text` && child.type !== `form-field`) return;
    const text = child.type === `text` ? (child as { text: string }).text.replace(/\u2063/g, ``) : formFieldDisplayText(child as DocxFormFieldNode);
    const count = Math.max(1, text.length);
    tally((child as { style?: DocxRunStyle }).style?.fontSizePt, count);
  }), histogram.size === 0) return;
  let dominant: number | undefined;
  let best = -1;
  for (const [size, count] of histogram) (count > best || (count === best && (dominant === void 0 || size > dominant))) && (best = count, dominant = size);
  return dominant;
}

/* ============================================================================
 * §1 字体度量原语（原 Ym..uh，jsx 18106-18213）
 * ==========================================================================*/

/** 原 Ym（jsx 18106）：段落正文字号 px（主导字号 → 标题级别兜底；缓存 Hl） */
export function paragraphFontSizePx(paragraph: DocxParagraphNode): number {
  const cache = engineCacheHl as WeakMap<object, number>;
  let cached = cache.get(paragraph);
  if (cached !== void 0) return cached;
  const dominantPt = paragraphDominantFontSizePt(paragraph);
  const sizePt = dominantPt && dominantPt > 0 ? dominantPt : Number.isFinite(paragraph.style?.headingLevel) ? DEFAULT_FONT_SIZE_PT + Math.max(0, 6 - (paragraph.style?.headingLevel ?? 6)) : DEFAULT_FONT_SIZE_PT;
  const sizePx = Math.max(10, Math.round(sizePt * 96 / 72));
  return cache.set(paragraph, sizePx), sizePx;
}

/** 原 Xm（jsx 18113）：段落最大字号 px（正文基线与子运行取大） */
export function paragraphMaxFontPx(paragraph: DocxParagraphNode): number {
  const basePx = paragraphFontSizePx(paragraph);
  let maxPx = basePx;
  return paragraph.children.forEach((child) => {
    child.type !== `text` && child.type !== `form-field` || (maxPx = Math.max(maxPx, runFontPx((child as { style?: DocxRunStyle }).style, basePx)));
  }), Math.max(1, Math.round(maxPx));
}

/** 原 Zm（jsx 18121）：字体栈首族名（去引号小写） */
export function firstFontFamilyName(fontStack: string | undefined): string | undefined {
  if (!fontStack) return;
  const [first] = fontStack.split(`,`);
  return first?.trim().replace(/^['"]+|['"]+$/g, ``).toLowerCase() || void 0;
}

/** 原 Qm（jsx 18124）：段落默认字体族（按文本长度众数；缓存 Ul） */
export function paragraphDefaultFontFamily(paragraph: DocxParagraphNode): string | undefined {
  const cache = engineCacheUl as WeakMap<object, string | null>;
  const cached = cache.get(paragraph);
  if (cached !== void 0) return cached ?? void 0;
  const tally = new Map<string, number>();
  const add = (family: string | undefined, length: number): void => {
    const name = firstFontFamilyName(family);
    if (!name) return;
    const weight = Math.max(1, Math.round(length));
    tally.set(name, (tally.get(name) ?? 0) + weight);
  };
  if (paragraph.children.forEach((child) => {
    if (child.type !== `text` && child.type !== `form-field`) return;
    const text = child.type === `text` ? (child as { text: string }).text.replace(/\u2063/g, ``) : formFieldDisplayText(child as DocxFormFieldNode);
    add((child as { style?: DocxRunStyle }).style?.fontFamily, text.length);
  }), tally.size === 0) {
    cache.set(paragraph, null);
    return;
  }
  let dominantFamily: string | undefined;
  let best = -1;
  for (const [family, weight] of tally) weight > best && (dominantFamily = family, best = weight);
  return cache.set(paragraph, dominantFamily ?? null), dominantFamily;
}

/** 原 $m（jsx 18148）：字体 → 紧凑行系数（衬线族/arial/其余） */
export function denseLineFactorForFont(fontFamily: string | undefined): number {
  const name = firstFontFamilyName(fontFamily) ?? fontFamily?.toLowerCase();
  return name ? name === `times roman` || name === `times new roman` || name === `cambria` || name === `garamond` || name === `georgia` || name === `book antiqua` || name === `palatino linotype` ? NORMAL_LINE_FACTOR : name === `arial` ? DENSE_LINE_FACTOR : COMPACT_LINE_FACTOR : COMPACT_LINE_FACTOR;
}

/** 原 eh（jsx 18154）：字体 → 宽松行系数（1.5 倍行距路径） */
export function looseLineFactorForFont(fontFamily: string | undefined): number {
  const name = firstFontFamilyName(fontFamily) ?? fontFamily?.toLowerCase();
  return name ? name === `times roman` || name === `times new roman` || name === `cambria` || name === `garamond` || name === `georgia` || name === `book antiqua` || name === `palatino linotype` ? ONE_POINT_FIVE_LINE : name === `arial` ? ONE_POINT_FIVE_LINE_ALT : LOOSE_LINE_FACTOR : LOOSE_LINE_FACTOR;
}

/** 原 th（jsx 18158）：段落是否 CJK 主导（空白段/纯图段） */
export function paragraphIsCjkLike(paragraph: DocxParagraphNode): boolean {
  return paragraphIsWhitespaceOnly(paragraph) || paragraphIsImageOnly(paragraph);
}

/** 原 nh（jsx 18161）：段落行距系数（CJK → 宽松族；复选框行 ≥1.08） */
export function lineSpacingFactorFor(paragraph: DocxParagraphNode, fontFamily: string | undefined): number {
  if (paragraphIsCjkLike(paragraph)) return looseLineFactorForFont(fontFamily);
  const dense = denseLineFactorForFont(fontFamily);
  return paragraphHasCheckbox(paragraph) ? Math.max(1.08, dense) : dense;
}

/** 原 rh（jsx 18166）：段落是否含硬换行（文本子节点 \r/\n） */
export function paragraphHasHardLineBreak(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `text` && /[\r\n]/.test((child as { text: string }).text));
}

/** 原 ih（jsx 18168）：单字符类别宽度系数（空白/大写/小写/数字/CJK/其余） */
export function charClassWidthFactor(char: string, fontPx: number): number {
  return /\s/.test(char) ? fontPx * 0.34 : /[A-Z]/.test(char) ? fontPx * 0.66 : /[a-z]/.test(char) ? fontPx * 0.55 : /[0-9]/.test(char) ? fontPx * 0.57 : /[\u2e80-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(char) ? fontPx : fontPx * 0.48;
}

/** 原 ah（jsx 18171）：字符类别启发式宽度合计 */
export function heuristicCharClassWidth(text: string, fontPx: number): number {
  let total = 0;
  for (const char of text) total += charClassWidthFactor(char, fontPx);
  return total;
}

/** 原 oh（jsx 18175）：运行字号 px（上下标缩至 65%；下限 8） */
export function runFontPx(style: DocxRunStyle | undefined, fallbackPx: number): number {
  const sizePx = Number.isFinite(style?.fontSizePt) && (style?.fontSizePt as number) > 0 ? (style?.fontSizePt as number) * 96 / 72 : fallbackPx;
  const scriptFactor = style?.verticalAlign === `superscript` || style?.verticalAlign === `subscript` ? DEFAULT_LINE_SPACING_MULTIPLE : 1;
  return Math.max(8, Math.round(sizePx * scriptFactor));
}

/** 原 sh（jsx 18180）：canvas font 串（italic/bold/字号/字体族兜底） */
export function fontStringOf(style: DocxRunStyle | undefined, fallbackPx: number, fontFamilyOverride?: string): string {
  return `${style?.italic ? `italic` : `normal`} normal ${style?.bold ? `700` : `400`} ${runFontPx(style, fallbackPx)}px ${normalizeFontFamily(fontFamilyOverride ?? style?.fontFamily) ?? normalizeFontFamily(FALLBACK_FONT_FAMILY) ?? `"Times New Roman", serif`}`;
}

/** 原 ch（jsx 18183）：运行 font 串（文本给定 → 主字体族解析） */
export function runFontString(style: DocxRunStyle | undefined, fallbackPx: number, text?: string): string {
  return fontStringOf(style, fallbackPx, text === void 0 ? style?.fontFamily : resolvePrimaryFontFamily(text, style));
}

/** 原 lh（jsx 18185）：文本按脚本运行切分并附 font 串 */
export function splitTextByFont(text: string | undefined, style: DocxRunStyle | undefined, fallbackPx: number): (DocxScriptRun & { font: string })[] {
  return splitTextByScriptRuns(text, style).map((run) => ({
    ...run,
    font: fontStringOf(style, fallbackPx, run.fontFamily)
  }));
}

/** 测量上下文暂存（原 Rl 的本文件侧实例；engineScratchRl 为导出 let 不可跨模块赋值） */
let measureContext2d: CanvasRenderingContext2D | undefined;

/** 原 uh（jsx 18192）：文本宽度测量（字符类别启发式 + canvas 实测；缓存 zl，上限 Xc） */
export function measureTextWidth(text: string | undefined, style: DocxRunStyle | undefined, fallbackPx: number): number {
  if (!text) return 0;
  const runs = splitTextByFont(text, style, fallbackPx);
  const charSpacingPx = Number.isFinite(style?.characterSpacingTwips) ? (style?.characterSpacingTwips as number) / TWIPS_PER_POINT_REF : 0;
  const key = `${runs.map((run) => `${run.font}${run.text}`).join(``)}\0${charSpacingPx}\0${text}`;
  const cache = engineCacheZl as Map<string, number>;
  const cached = cache.get(key);
  if (cached !== void 0) return cached;
  let width = heuristicCharClassWidth(text, runFontPx(style, fallbackPx));
  if (typeof document < `u`) try {
    measureContext2d ||= document.createElement(`canvas`).getContext(`2d`) ?? void 0;
    const ctx = measureContext2d;
    ctx && (width = runs.reduce((acc, run) => (ctx.font = run.font, acc + ctx.measureText(run.text).width), 0));
  } catch {}
  for (charSpacingPx !== 0 && text.length > 1 && (width += charSpacingPx * Math.max(0, text.length - 1)), boundedCacheSet(cache, key, width); cache.size > TEXT_MEASURE_CACHE_LIMIT;) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
  return width;
}

/* ============================================================================
 * §2 制表位与行数原语（原 dh..Eh，jsx 18214-18464）
 * ==========================================================================*/

/** 原 dh（jsx 18214）：段落制表位 px（升序、去非正） */
export function paragraphTabStopsPx(paragraph: DocxParagraphNode): number[] {
  return tabStopsOf(paragraph).map((stop) => twipsToPxNonNegative(stop.positionTwips)).filter((px): px is number => Number.isFinite(px) && (px as number) > 0).map((px) => Math.round(px)).sort((a, b) => a - b);
}

/** 原 fh（jsx 18217）：段落起始缩进 px（左缩进 + 首行/悬挂） */
export function paragraphIndentStartPx(paragraph: DocxParagraphNode): number {
  const leftPx = twipsToPxRounded(paragraph.style?.indent?.leftTwips);
  const firstLinePx = twipsToPxRounded(paragraph.style?.indent?.firstLineTwips);
  const hangingPx = twipsToPxRounded(paragraph.style?.indent?.hangingTwips);
  const effectiveFirst = firstLinePx ?? (Number.isFinite(hangingPx) ? -(hangingPx as number) : 0);
  return (Number.isFinite(leftPx) ? leftPx as number : 0) + (Number.isFinite(effectiveFirst) ? effectiveFirst as number : 0);
}

/** 原 ph（jsx 18224）：缩进后的左对齐制表位（相对缩进起点，升序） */
export function leftTabStopsAfterIndent(paragraph: DocxParagraphNode): number[] {
  const indentPx = paragraphIndentStartPx(paragraph);
  return tabStopsOf(paragraph).filter((stop) => stop.alignment !== `right`).map((stop) => twipsToPxNonNegative(stop.positionTwips)).filter((px): px is number => Number.isFinite(px) && (px as number) > indentPx + 0.5).map((px) => Math.round(px - indentPx)).sort((a, b) => a - b);
}

/** 原 mh（jsx 18228）：当前 x 之后的下一制表位（缺省网格 48px） */
export function nextTabStopAfter(currentX: number, stops: number[]): number {
  const next = stops.find((stop) => stop > currentX + 0.5);
  if (next !== void 0) return next;
  const grid = ANNOTATION_GUTTER_WIDTH_PX;
  const computed = Math.floor(Math.max(0, currentX) / grid + 1) * grid;
  return Math.max(grid, computed);
}

/** 原 hh（jsx 18233）：制表符展开为 8 空格 */
export function expandTabsToSpaces(text: string): string {
  return text.replace(/\t/g, `        `);
}

/** 原 gh（jsx 18235）：段内文本段宽度合计 */
export function segmentsWidthPx(segments: { text: string; style?: DocxRunStyle }[], fontSizePx: number): number {
  return segments.reduce((acc, segment) => {
    const expanded = expandTabsToSpaces(segment.text);
    return expanded ? acc + measureTextWidth(expanded, segment.style, fontSizePx) : acc;
  }, 0);
}

/** 原 _h（jsx 18241）：贪心折行数（词单元 + 硬换行） */
export function greedyLineCount(segments: { text: string; style?: DocxRunStyle }[], maxWidthPx: number, fontSizePx: number): number {
  let lineCount = 1;
  let usedWidth = 0;
  let sawContent = false;
  const place = (token: string, style: DocxRunStyle | undefined): void => {
    const tokenWidth = measureTextWidth(token, style, fontSizePx);
    if (token.trim().length > 0 && usedWidth > 0 && usedWidth + tokenWidth > maxWidthPx && (lineCount += 1, usedWidth = 0), tokenWidth <= maxWidthPx) {
      usedWidth = Math.min(maxWidthPx, usedWidth + tokenWidth);
      return;
    }
    for (const char of token) {
      const charWidth = measureTextWidth(char, style, fontSizePx);
      usedWidth > 0 && usedWidth + charWidth > maxWidthPx && (lineCount += 1, usedWidth = 0), usedWidth = Math.min(maxWidthPx, usedWidth + charWidth);
    }
  };
  for (const segment of segments) {
    const text = expandTabsToSpaces(segment.text);
    if (!text) continue;
    const tokens = text.match(/(\r\n|\n|[^\S\r\n]+|[^\s\r\n]+)/g) ?? [];
    for (const token of tokens) if (!(token.length === 0 || token === `\r`)) {
      if (sawContent = true, token === `
` || token === `\r
`) {
        lineCount += 1, usedWidth = 0;
        continue;
      }
      place(token, segment.style);
    }
  }
  return sawContent ? Math.max(1, lineCount) : 1;
}

/** 制表段（原 vh 的段面） */
export interface ParagraphTabSegment {
  text: string;
  style?: DocxRunStyle;
  isTab?: boolean;
}

/** 原 vh（jsx 18274）：段落 → 制表段序列（文本/表单域；tab 单独成段） */
export function paragraphTabSegments(paragraph: DocxParagraphNode): ParagraphTabSegment[] {
  const segments: ParagraphTabSegment[] = [];
  const push = (text: string | undefined, style: DocxRunStyle | undefined): void => {
    if (!text || text === `\r`) return;
    const parts = text.split(`	`);
    parts.forEach((part, index) => {
      part.length > 0 && segments.push({
        text: part,
        style
      }), index < parts.length - 1 && segments.push({
        text: `	`,
        style,
        isTab: true
      });
    });
  };
  return paragraph.children.forEach((child) => {
    child.type !== `text` && child.type !== `form-field` || push(child.type === `text` ? (child as { text: string }).text : formFieldDisplayText(child as DocxFormFieldNode), (child as { style?: DocxRunStyle }).style);
  }), segments;
}

/** 制表拆分结果（原 yh 返回面） */
export interface TabSegmentSplit {
  leadingSegments: { text: string; style?: DocxRunStyle }[];
  contentSegments: { text: string; style?: DocxRunStyle }[];
  rightSegments: { text: string; style?: DocxRunStyle }[];
  hasTabSplit: boolean;
}

/** 原 yh（jsx 18295）：按首/末制表位拆三段（前导/内容/右对齐） */
export function splitTabSegments(paragraph: DocxParagraphNode): TabSegmentSplit {
  const segments = paragraphTabSegments(paragraph);
  const tabIndexes = segments.reduce<number[]>((acc, segment, index) => (segment.isTab && acc.push(index), acc), []);
  if (tabIndexes.length === 0) return {
    leadingSegments: [],
    contentSegments: segments,
    rightSegments: [],
    hasTabSplit: false
  };
  const firstTab = tabIndexes[0];
  const lastTab = tabIndexes[tabIndexes.length - 1];
  const plain = (slice: ParagraphTabSegment[]) => slice.filter((segment) => !segment.isTab && segment.text.length > 0).map((segment) => ({
    text: segment.text,
    style: segment.style
  }));
  return firstTab === lastTab ? {
    leadingSegments: [],
    contentSegments: plain(segments.slice(0, firstTab)),
    rightSegments: plain(segments.slice(lastTab + 1)),
    hasTabSplit: true
  } : {
    leadingSegments: plain(segments.slice(0, firstTab)),
    contentSegments: plain(segments.slice(firstTab + 1, lastTab)),
    rightSegments: plain(segments.slice(lastTab + 1)),
    hasTabSplit: true
  };
}

/** 原 bh（jsx 18322）：TOC 制表行行数（右栏宽 → 内容块折行） */
export function tocTabLineCount(paragraph: DocxParagraphNode, contentWidthPx: number, fontSizePx: number): number | undefined {
  const {
    leadingSegments,
    contentSegments,
    rightSegments,
    hasTabSplit
  } = splitTabSegments(paragraph);
  if (!hasTabSplit) return;
  const rightWidth = segmentsWidthPx(rightSegments, fontSizePx) + ANNOTATION_GUTTER_MIN_PX;
  const availableWidth = Math.max(contentWidthPx * 2, Math.round(contentWidthPx - rightWidth));
  const leadingWidth = segmentsWidthPx(leadingSegments, fontSizePx);
  const stops = leftTabStopsAfterIndent(paragraph);
  const firstTabPx = tocFirstTabStopPx(paragraph);
  const leadingEnd = leadingSegments.length === 0 ? 0 : Number.isFinite(firstTabPx) && (firstTabPx as number) > 0 ? Math.max(leadingWidth, Math.round(firstTabPx as number)) : Math.max(leadingWidth, Math.round(leadingWidth + nextTabStopDistance(stops, leadingWidth, ANNOTATION_GUTTER_WIDTH_PX)));
  const blockWidth = Math.max(contentWidthPx * 2, Math.round(availableWidth - leadingEnd));
  const joined = contentSegments.map((segment) => expandTabsToSpaces(segment.text)).join(``);
  if (joined.trim().length === 0) return 1;
  const font = runFontString(contentSegments.find((segment) => segment.text.trim().length > 0)?.style, fontSizePx, joined);
  const lineHeightPx = paragraphLineHeight(paragraph);
  const layout = layoutTextItemsBlock(joined, fragmentsForRuns(contentSegments, fontSizePx, joined), blockWidth, lineHeightPx, [], font);
  return layout?.lineCount ? layout.lineCount : greedyLineCount(contentSegments, blockWidth, fontSizePx);
}

/** 行数缓存（原 xh：段落 → 键串 → 行数） */
const lineCountCache = new WeakMap<object, Map<string, number>>();

/** 原 Sh（jsx 18345）：行数缓存读 */
export function lineCountCacheGet(paragraph: DocxParagraphNode, key: string): number | undefined {
  return lineCountCache.get(paragraph)?.get(key);
}

/** 原 Ch（jsx 18347）：行数缓存写 */
export function lineCountCacheSet(paragraph: DocxParagraphNode, key: string, value: number): number {
  let inner = lineCountCache.get(paragraph);
  return inner || (inner = new Map(), lineCountCache.set(paragraph, inner)), inner.set(key, value), value;
}

/** 原 wh（jsx 18352）：段落行数（快路径：单字体缓存折行；TOC 制表；逐词元推进） */
export function paragraphLineCount(paragraph: DocxParagraphNode, contentWidthPx: number, overrideWidthPx?: number): number {
  const fontPx = paragraphFontSizePx(paragraph);
  const widthPx = Math.max(fontPx * 2, Math.round(contentWidthPx));
  const firstLineWidth = Number.isFinite(overrideWidthPx) && (overrideWidthPx as number) > 0 ? Math.max(fontPx * 2, Math.round(overrideWidthPx as number)) : widthPx;
  const cacheKey = firstLineWidth === widthPx ? widthPx : `${widthPx}|${firstLineWidth}`;
  const cached = lineCountCacheGet(paragraph, cacheKey as string);
  if (cached !== void 0) return cached;
  const store = (count: number): number => lineCountCacheSet(paragraph, cacheKey as string, Math.max(1, Math.round(count)));
  const tabStops = paragraphTabStopsPx(paragraph);
  const hasTocTab = paragraphHasTocTab(paragraph);
  const tabKind = tabLayoutKindOf(paragraph);
  const rightAlignedTab = !hasTocTab && tabKind === `center-right` || !hasTocTab && tabKind === `center` || !hasTocTab && tabKind === `right`;
  if (!paragraph.style?.indent && firstLineWidth === widthPx && !paragraphHasHardLineBreak(paragraph) && !hasTocTab && !rightAlignedTab) {
    const fast = (() => {
      const layoutText = paragraphLayoutText(paragraph);
      if (!layoutText) return;
      const singleFont = singleFontOfLayoutText(paragraph, layoutText);
      if (singleFont !== void 0) {
        const wrapped = countWrappedLinesCached(layoutText.text, singleFont, widthPx, {
          wordBreak: wordBreakOf(layoutText.text)
        });
        if (wrapped !== void 0) return wrapped;
      }
      return paragraphLineLayout(paragraph, layoutText, widthPx, paragraphLineHeight(paragraph), [])?.lineCount;
    })();
    if (fast) return store(fast);
  }
  if (hasTocTab) {
    const tocCount = tocTabLineCount(paragraph, widthPx, fontPx);
    if (tocCount !== void 0) return store(tocCount);
  }
  let lineCount = 1;
  let usedWidth = 0;
  let sawContent = false;
  let inRightTab = false;
  let rightTabWidth = 0;
  const currentWidth = (): number => lineCount === 1 ? firstLineWidth : widthPx;
  const placeToken = (token: string, style: DocxRunStyle | undefined): void => {
    const tokenWidth = measureTextWidth(token, style, fontPx);
    if (token.trim().length > 0 && usedWidth > 0 && usedWidth + tokenWidth > currentWidth() && (lineCount += 1, usedWidth = 0), tokenWidth <= currentWidth()) {
      usedWidth = Math.min(currentWidth(), usedWidth + tokenWidth);
      return;
    }
    for (const char of token) {
      const charWidth = measureTextWidth(char, style, fontPx);
      usedWidth > 0 && usedWidth + charWidth > currentWidth() && (lineCount += 1, usedWidth = 0), usedWidth = Math.min(currentWidth(), usedWidth + charWidth);
    }
  };
  const placeChunk = (chunk: string, style: DocxRunStyle | undefined): void => {
    if (!(chunk.length === 0 || chunk === `\r`)) {
      if (sawContent = true, chunk === `
` || chunk === `\r
`) {
        inRightTab = false, rightTabWidth = 0, lineCount += 1, usedWidth = 0;
        return;
      }
      if (hasTocTab && inRightTab) {
        rightTabWidth += measureTextWidth(chunk, style, fontPx), usedWidth > 0 && usedWidth + rightTabWidth + ANNOTATION_GUTTER_MIN_PX > widthPx + ROW_HEIGHT_TOLERANCE_PX && (lineCount += 1, usedWidth = 0, rightTabWidth = 0);
        return;
      }
      if (chunk === `	`) {
        if (hasTocTab) {
          inRightTab = true, rightTabWidth = 0;
          return;
        }
        if (rightAlignedTab) {
          usedWidth = Math.min(widthPx, Math.max(usedWidth, widthPx - 1));
          return;
        }
        const nextStop = nextTabStopAfter(usedWidth, tabStops);
        nextStop > widthPx + ROW_HEIGHT_TOLERANCE_PX && usedWidth > 0 ? (lineCount += 1, usedWidth = 0) : usedWidth = Math.min(widthPx, nextStop);
        return;
      }
      placeToken(chunk, style);
    }
  };
  for (const child of paragraph.children) {
    if (child.type === `image`) {
      if (isFloatingImageNode(child as DocxImageNode) || isInlineImageNode(child as DocxImageNode)) continue;
      const imageWidth = Math.max(1, Math.round((child as DocxImageNode).widthPx ?? (child as DocxImageNode).heightPx ?? 24));
      sawContent = true, usedWidth > 0 && usedWidth + imageWidth > widthPx && (lineCount += 1, usedWidth = 0), usedWidth = Math.min(widthPx, usedWidth + imageWidth);
      continue;
    }
    const text = child.type === `text` ? (child as { text: string }).text : formFieldDisplayText(child as DocxFormFieldNode);
    if (!text) continue;
    const chunks = text.match(/(\r\n|\n|\t|[^\S\r\n\t]+|[^\s\r\n\t]+)/g) ?? [];
    for (const chunk of chunks) placeChunk(chunk, (child as { style?: DocxRunStyle }).style);
  }
  return store(sawContent ? lineCount : 1);
}

/** 原 Th（jsx 18440）：段落内容宽（去左右缩进/首行/边框；下限 24） */
export function paragraphContentWidth(paragraph: DocxParagraphNode, contentWidthPx: number, numberingDefinitions: unknown): number {
  const baseWidth = Math.max(24, Math.round(contentWidthPx));
  const indent = resolveNumberingIndent(paragraph, numberingDefinitions);
  const leftPx = Math.max(0, twipsToPxRounded(indent?.leftTwips) ?? 0);
  const rightPx = Math.max(0, twipsToPxRounded(paragraph.style?.indent?.rightTwips) ?? 0);
  const firstLinePx = twipsToPxRounded(indent?.firstLineTwips);
  const hangingPx = twipsToPxRounded(indent?.hangingTwips);
  const effectiveFirst = firstLinePx ?? (hangingPx ? -hangingPx : 0);
  const firstLinePositive = Number.isFinite(effectiveFirst) && (effectiveFirst as number) > 0 ? effectiveFirst as number : 0;
  const leftBorderPx = borderTotalPx(paragraph.style?.borders?.left);
  const rightBorderPx = borderTotalPx(paragraph.style?.borders?.right);
  return Math.max(24, Math.round(baseWidth - leftPx - rightPx - firstLinePositive - leftBorderPx - rightBorderPx));
}

/** 原 Eh（jsx 18464）：段落行数估算（浮动布局优先；悬挂/编号标签补偿） */
export function paragraphEstimatedLineCount(paragraph: DocxParagraphNode, contentWidthPx: number, numberingDefinitions: unknown, numberingLabel?: NumberingLabelEntry): number {
  const joined = paragraph.children.map((child) => child.type === `text` ? (child as { text: string }).text : child.type === `form-field` ? formFieldDisplayText(child as DocxFormFieldNode) : ``).join(``);
  if (!joined) return 1;
  if (!Number.isFinite(contentWidthPx) || contentWidthPx <= 0) return Math.max(1, joined.split(/\r?\n/).length);
  const textWidth = paragraphContentWidth(paragraph, contentWidthPx, numberingDefinitions);
  const floatingLayout = paragraphFloatingLayout(paragraph, textWidth, paragraphLineHeight(paragraph));
  if (floatingLayout) return floatingLayout.layout.lineCount;
  const hangingPx = twipsToPxRounded(resolveNumberingIndent(paragraph, numberingDefinitions)?.hangingTwips);
  const hangingPositive = Number.isFinite(hangingPx) && (hangingPx as number) > 0 ? hangingPx as number : 0;
  const labelWidth = (paragraph.style?.numbering?.numId ?? 0) > 0 ? numberingLabelWidthPx(paragraph, numberingDefinitions, numberingLabel) ?? 0 : 0;
  return paragraphLineCount(paragraph, textWidth, Math.max(24, Math.round(textWidth + hangingPositive - labelWidth)));
}

/* ============================================================================
 * §3 布局度量原语（原 Dh..Mh，jsx 18466-18522）
 * ==========================================================================*/

/** 原 Dh（jsx 18466）：环绕浮动图的行内占位高（topAndBottom/无文本段） */
export function wrappedImageFootprintHeight(paragraph: DocxParagraphNode, image: DocxImageNode): number {
  if (!isInlineImageNode(image)) return 0;
  const isTopBottom = image.floating?.wrapType === `topAndBottom`;
  const lacksText = !paragraphHasVisibleText(paragraph);
  if (!isTopBottom && !lacksText || isTopBottom && !lacksText) return 0;
  const floating = image.floating;
  const sizePx = Number.isFinite(image.heightPx) && (image.heightPx as number) > 0 ? Math.round(image.heightPx as number) : Number.isFinite(image.widthPx) && (image.widthPx as number) > 0 ? Math.round(image.widthPx as number) : MIN_BLOCK_HEIGHT_PX;
  const distTop = Math.max(0, Math.round(floating?.distTPx ?? 0));
  const distBottom = Math.max(0, Math.round(floating?.distBPx ?? 0));
  const offsetY = Math.max(0, Math.round(floating?.yPx ?? 0));
  return Math.max(MIN_BLOCK_HEIGHT_PX, sizePx + distTop + distBottom + offsetY);
}

/** 原 Oh（jsx 18479）：布局底边（末行 y + 行高） */
export function layoutBottomPx(layout: TextBlockLayout): number {
  if (layout.lines.length === 0) return 0;
  const lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1));
  return (layout.lines[layout.lines.length - 1]?.y ?? 0) + lineHeight;
}

/** 原 kh（jsx 18484）：布局是否含全宽排除带 */
export function layoutHasFullWidthExclusion(layout: TextBlockLayout): boolean {
  const containerWidth = Math.max(1, Math.round(layout.containerWidthPx ?? 0));
  return containerWidth <= 0 || layout.lines.length === 0 ? false : (layout.exclusions ?? []).some((exclusion) => {
    const left = Math.round(exclusion.left);
    const right = Math.round(exclusion.right);
    return left <= 0 && right >= containerWidth;
  });
}

/** 原 Ah（jsx 18493）：布局高度（全宽排除 → 底边；否则 height 取整） */
export function layoutHeightPx(layout: TextBlockLayout): number {
  const bottom = layoutBottomPx(layout);
  return layoutHasFullWidthExclusion(layout) ? Math.max(1, bottom) : Math.max(1, Math.round(layout.height));
}

/** 原 jh（jsx 18496）：布局行区间高度（[start, end) 的 y 跨度） */
export function layoutRangeHeightPx(layout: TextBlockLayout, startLineIndex: number, endLineIndex: number): number {
  if (layout.lines.length === 0) return 0;
  const lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1));
  const start = Math.max(0, Math.min(Math.round(startLineIndex), layout.lines.length));
  const end = Math.max(start, Math.min(Math.round(endLineIndex), layout.lines.length));
  if (end <= start) return 0;
  const topY = layout.lines[start]?.y ?? start * lineHeight;
  const bottomY = layout.lines[end - 1]?.y ?? (end - 1) * lineHeight;
  return Math.max(1, Math.round(bottomY - topY + lineHeight));
}

/** 原 Mh（jsx 18505）：行区间内按高度上限二分拟合末行 */
export function layoutFitLineEnd(layout: TextBlockLayout, startLineIndex: number, endLineIndex: number, maxHeightPx: number): number {
  const start = Math.max(0, Math.min(Math.round(startLineIndex), layout.lines.length));
  const end = Math.max(start, Math.min(Math.round(endLineIndex), layout.lines.length));
  const limit = Math.max(0, Math.round(maxHeightPx));
  if (limit <= 0 || end <= start) return start;
  let low = start;
  let high = end;
  let best = start;
  for (; low <= high;) {
    const mid = Math.floor((low + high) / 2);
    if (layoutRangeHeightPx(layout, start, mid) <= limit) {
      best = mid, low = mid + 1;
      continue;
    }
    high = mid - 1;
  }
  return best;
}

/* ============================================================================
 * §4 行高与段落外高（原 Nh..zh，jsx 18523-18601）
 * ==========================================================================*/

/** 原 Nh（jsx 18523）：lineTwips → 行距倍数（240twips=单倍；下限 fc） */
export function lineTwipsToMultiple(lineTwips: number | undefined, fallbackMultiple: number): number {
  return Number.isFinite(lineTwips) ? Math.max(MIN_LINE_SPACING_RATIO, (lineTwips as number) / 240) : Math.max(MIN_LINE_SPACING_RATIO, fallbackMultiple);
}

/** 原 Ph（jsx 18525）：双倍行距混合（1 → 基准；≥dc → 1） */
export function doubleLineBlend(multiple: number | undefined, baseFactor: number): number {
  const base = Math.max(MIN_LINE_SPACING_RATIO, Number.isFinite(baseFactor) ? baseFactor : COMPACT_LINE_FACTOR);
  if (!Number.isFinite(multiple) || (multiple as number) <= 1) return base;
  if ((multiple as number) >= DOUBLE_LINE_FACTOR) return 1;
  const ratio = ((multiple as number) - 1) / (DOUBLE_LINE_FACTOR - 1);
  return Number((base + (1 - base) * ratio).toFixed(4));
}

/** 原 Fh（jsx 18532）：行距倍数 → 字体感知行高系数 */
export function lineHeightFromMultiple(multiple: number, fontFamily: string | undefined, factorOverride?: number): number {
  const clamped = Math.max(MIN_LINE_SPACING_RATIO, multiple);
  const factor = factorOverride ?? denseLineFactorForFont(fontFamily);
  return Math.max(MIN_LINE_SPACING_RATIO, Number((clamped * doubleLineBlend(clamped, factor)).toFixed(3)));
}

/** 原 Ih（jsx 18536）：段落网格对齐模式（snapToGrid → snap/disable/inherit） */
export function snapToGridModeOf(paragraph: DocxParagraphNode): `snap` | `disable` | `inherit` {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return `inherit`;
  const pPr = xml.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/i)?.[0] ?? xml.match(/<w:pPr\b[^>]*\/>/i)?.[0] ?? ``;
  if (!pPr) return `inherit`;
  const snapTag = pPr.match(/<w:snapToGrid\b[^>]*\/?>/i)?.[0] ?? ``;
  if (!snapTag) return `inherit`;
  const value = snapTag.match(/\bw:val="([^"]+)"/i)?.[1]?.trim().toLowerCase();
  return value && (value === `0` || value === `false` || value === `off`) ? `disable` : `snap`;
}

/** 原 Lh（jsx 18548）：网格吸附高度（禁用/非有限 → undefined） */
export function gridSnapHeight(paragraph: DocxParagraphNode, lineHeightPx: number, skipSnap = false): number | undefined {
  const mode = snapToGridModeOf(paragraph);
  if (!(skipSnap || mode === `disable` || !Number.isFinite(lineHeightPx) || lineHeightPx <= 0)) return Math.max(1, Math.round(lineHeightPx));
}

/** 原 Rh（jsx 18553）：段落行高（显式行距/exact/atLeast/倍数路径 + 网格吸附） */
export function paragraphLineHeight(paragraph: DocxParagraphNode, gridPitchPx?: number, skipSnap = false): number {
  const lineTwips = paragraph.style?.spacing?.lineTwips;
  const lineRule = paragraph.style?.spacing?.lineRule ?? `auto`;
  const snapped = gridSnapHeight(paragraph, gridPitchPx as number, skipSnap);
  const fontPx = paragraphFontSizePx(paragraph);
  const fontFamily = paragraphDefaultFontFamily(paragraph);
  const spacingFactor = lineSpacingFactorFor(paragraph, fontFamily);
  const tocMultiple = isTocParagraph(paragraph) ? 1.05 : SINGLE_LINE_SPACING;
  const singleLinePx = Math.max(1, Math.round(fontPx * lineHeightFromMultiple(SINGLE_LINE_SPACING, fontFamily, spacingFactor)));
  if (lineRule !== `auto` && Number.isFinite(lineTwips)) {
    const explicitPx = Math.max(1, twipsToPxNonNegative(lineTwips) ?? 1);
    return lineRule === `exact` ? explicitPx : Math.max(explicitPx, singleLinePx, snapped ?? 0);
  }
  const multiple = lineTwipsToMultiple(lineTwips, tocMultiple);
  const factor = paragraphIsCjkLike(paragraph) ? Math.max(MIN_LINE_SPACING_RATIO, Number((multiple * spacingFactor).toFixed(3))) : lineHeightFromMultiple(multiple, fontFamily, spacingFactor);
  const lineHeightPx = Math.max(1, Math.round(fontPx * factor));
  const numberingExtra = paragraph.style?.numbering ? Math.ceil(fontPx) : 0;
  return Math.max(lineHeightPx, numberingExtra, snapped ?? 0);
}

/** 原 zh（jsx 18572）：段落外高（前后距 + 边框 + 内容/浮动/图片占位取大；缓存 Jl） */
export function paragraphOuterHeight(
  paragraph: DocxParagraphNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx?: number,
  skipSnap = false,
  numberingLabel?: NumberingLabelEntry,
  options?: { excludeWrappedFloatingImageFootprint?: boolean },
): number {
  const excludeFootprint = options?.excludeWrappedFloatingImageFootprint === true;
  const xml = paragraph.sourceXml;
  const baseKey = rowHeightCacheKey(contentWidthPx, gridPitchPx as number, skipSnap);
  let cacheKey: string | number = numberingLabel?.text === void 0 ? baseKey : `${baseKey}|${numberingLabel.text}`;
  if (excludeFootprint && (cacheKey = `${cacheKey}|no-wrap-footprint`), xml) {
    const cached = (engineCacheJl.get(xml) as Map<string | number, number> | undefined)?.get(cacheKey);
    if (cached !== void 0) return cached;
  }
  const spacingBefore = twipsToPxNonNegative(paragraph.style?.spacing?.beforeTwips) ?? 0;
  const spacingAfter = twipsToPxNonNegative(paragraph.style?.spacing?.afterTwips) ?? 0;
  const lineHeightPx = paragraphLineHeight(paragraph, gridPitchPx, skipSnap);
  const textWidth = Number.isFinite(contentWidthPx) && contentWidthPx > 0 ? paragraphContentWidth(paragraph, contentWidthPx, numberingDefinitions) : void 0;
  const floatingLayout = textWidth === void 0 ? void 0 : paragraphFloatingLayout(paragraph, textWidth, lineHeightPx);
  const lineCount = paragraphEstimatedLineCount(paragraph, contentWidthPx, numberingDefinitions, numberingLabel);
  const isFloatingCover = paragraphIsFloatingImageOnly(paragraph) && paragraphIsSectionCover(paragraph);
  const maxInlineImage = paragraph.children.reduce((acc, child) => child.type !== `image` || isFloatingImageNode(child as DocxImageNode) || isInlineImageNode(child as DocxImageNode) ? acc : Math.max(acc, (child as DocxImageNode).heightPx ?? 0), 0);
  const maxFootprint = excludeFootprint ? 0 : paragraph.children.reduce((acc, child) => child.type === `image` ? Math.max(acc, wrappedImageFootprintHeight(paragraph, child as DocxImageNode)) : acc, 0);
  const emptyTextHeight = paragraphIsEmptyText(paragraph) ? lineHeightPx + ANNOTATION_ANCHOR_OFFSET_PX : 0;
  const topBorderPx = borderTotalPx(paragraph.style?.borders?.top);
  const bottomBorderPx = borderTotalPx(paragraph.style?.borders?.bottom);
  const contentHeight = isFloatingCover ? 0 : floatingLayout && !excludeFootprint ? layoutHeightPx(floatingLayout.layout as unknown as TextBlockLayout) : lineHeightPx * lineCount;
  const bodyHeight = Math.max(isFloatingCover ? 0 : lineHeightPx, contentHeight, maxInlineImage, maxFootprint, emptyTextHeight);
  excludeFootprint && paragraph.children.some((child) => child.type === `image`);
  const total = Math.max(1, spacingBefore + spacingAfter + topBorderPx + bottomBorderPx + bodyHeight);
  if (xml) {
    const inner = (engineCacheJl.get(xml) as Map<string | number, number> | undefined) ?? new Map<string | number, number>();
    inner.set(cacheKey, total), boundedCacheSet(engineCacheJl, xml, inner);
  }
  return total;
}

/* ============================================================================
 * §5 XML 间距探针与单元格估算（原 Bh..Wh，jsx 18602-18672）
 * ==========================================================================*/

/** 原 Bh（jsx 18602）：sourceXml 是否含 w:spacing 前距属性 */
export function xmlHasSpacingBefore(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const tag = xml.match(/<w:spacing\b[^>]*\/?>/i)?.[0];
  return tag ? /\bw:before(?:\s*=|Lines\s*=|Autospacing\s*=)/i.test(tag) : false;
}

/** 原 Vh（jsx 18608）：pPr 内是否含任意 w:spacing */
export function xmlHasParagraphSpacing(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const pPr = xml.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/i)?.[0] ?? xml.match(/<w:pPr\b[^>]*\/>/i)?.[0] ?? ``;
  return pPr ? /<w:spacing\b[^>]*\/?>/i.test(pPr) : false;
}

/** 原 Hh（jsx 18614）：表格缺省间距应用（已有 spacing → 原样；否则网格缺省） */
export function applyDefaultSpacingForGrid(paragraph: DocxParagraphNode, applyDefaults: boolean): DocxParagraphNode {
  return !applyDefaults || !paragraph.sourceXml || xmlHasParagraphSpacing(paragraph) ? paragraph : {
    ...paragraph,
    sourceXml: void 0,
    style: {
      ...(paragraph.style ?? {}),
      spacing: {
        ...(paragraph.style?.spacing ?? {}),
        beforeTwips: ZERO_OFFSET_A,
        afterTwips: ZERO_OFFSET_B,
        lineTwips: DEFAULT_LINE_PITCH_TWIPS,
        lineRule: `auto`
      }
    }
  };
}

/** 原 Uh（jsx 18630）：段落是否无前距（首段抵扣用） */
export function spacingBeforeAbsent(paragraph: DocxParagraphNode): boolean {
  if (!paragraph.sourceXml) {
    const beforeTwips = paragraph.style?.spacing?.beforeTwips;
    return !(Number.isFinite(beforeTwips) && (beforeTwips as number) > 0);
  }
  return !xmlHasSpacingBefore(paragraph);
}

/** 原 Wh（jsx 18635）：单元格内容高度估算（逐段外高 + 首段前距抵扣） */
export function estimateCellContentHeight(
  nodes: DocxNode[],
  contentWidthPx: number | undefined,
  numberingDefinitions: unknown,
  applyDefaults = false,
  gridPitchPx?: number,
): number {
  let total = 0;
  let sawOverflow = false;
  let index = 0;
  for (const node of nodes) {
    if (!isParagraph(node)) {
      total += tableOuterHeightPx(node as DocxTableNode, contentWidthPx as number, numberingDefinitions, gridPitchPx);
      continue;
    }
    const paragraph = node as DocxParagraphNode;
    const skipSnap = snapToGridModeOf(paragraph) !== `snap`;
    const normalized = applyDefaultSpacingForGrid(paragraph, applyDefaults);
    const outer = paragraphOuterHeight(normalized, contentWidthPx as number, numberingDefinitions, gridPitchPx, skipSnap);
    const lineHeightPx = Math.max(MIN_BLOCK_HEIGHT_PX, paragraphLineHeight(normalized, gridPitchPx, skipSnap));
    const layoutText = paragraphLayoutText(normalized, {
      allowExplicitLineBreakText: true,
      expandTabsForLayout: true
    });
    const textWidth = typeof contentWidthPx == `number` && contentWidthPx > 0 ? paragraphContentWidth(normalized, contentWidthPx, numberingDefinitions) : void 0;
    const lineLayout = layoutText && typeof textWidth == `number` && textWidth > 0 ? paragraphLineLayout(normalized, layoutText, textWidth, lineHeightPx, []) : void 0;
    const isFirstNoSpacing = index === 0 && spacingBeforeAbsent(paragraph);
    index += 1;
    const spacingBefore = isFirstNoSpacing ? 0 : twipsToPxNonNegative(normalized.style?.spacing?.beforeTwips) ?? 0;
    const spacingAfter = twipsToPxNonNegative(normalized.style?.spacing?.afterTwips) ?? 0;
    const topBorderPx = borderTotalPx(normalized.style?.borders?.top);
    const bottomBorderPx = borderTotalPx(normalized.style?.borders?.bottom);
    const measured = lineLayout ? spacingBefore + spacingAfter + topBorderPx + bottomBorderPx + layoutHeightPx(lineLayout) : 0;
    const height = measured > 0 ? Math.max(outer, measured) : outer;
    if (measured > outer + lineHeightPx / 2 && (sawOverflow = true), !isFirstNoSpacing) {
      total += height;
      continue;
    }
    total += Math.max(1, height - spacingBefore);
  }
  return total + (sawOverflow ? Math.max(1, MIN_BLOCK_HEIGHT_PX) : 0);
}

/* ============================================================================
 * §6 表格行属性探针（原 Gh..Jh，jsx 18673-18698）
 * ==========================================================================*/

/** 原 Gh（jsx 18673）：行可拆分（非 cantSplit 且非 exact 高度） */
export function rowIsSplittable(row: DocxTableRow): boolean {
  return (row.style as { cantSplit?: boolean } | undefined)?.cantSplit !== true && row.style?.heightRule !== `exact`;
}

/** 原 Kh（jsx 18676）：行是否需要高度估算（含嵌套表或节点数 ≥ zc） */
export function rowNeedsHeightEstimation(row: DocxTableRow): boolean {
  let nodeCount = 0;
  let nestedTables = 0;
  for (const cell of row.cells) {
    nodeCount += cell.nodes.length;
    for (const node of cell.nodes) node.type === `table` && (nestedTables += 1);
  }
  return nestedTables > 0 || nodeCount >= NUMBERING_LABEL_MIN_WIDTH_PX;
}

/** 原 qh（jsx 18686）：行是否含嵌套表格 */
export function rowHasNestedTable(row: DocxTableRow): boolean {
  return row.cells.some((cell) => cell.nodes.some((node) => node.type === `table`));
}

/** 原 Jh（jsx 18689）：行高上限收束（可拆分 + 估算高给定时夹取） */
export function rowHeightWithCaps(row: DocxTableRow, heightPx: number, declaredHeightPx: number | undefined, pageContentHeightPx: number | undefined): number {
  if (!rowIsSplittable(row) || !Number.isFinite(declaredHeightPx) || (declaredHeightPx as number) <= 0 || !rowNeedsHeightEstimation(row)) return heightPx;
  const estimatedCap = Math.max(MIN_BLOCK_HEIGHT_PX * 2, Math.round(declaredHeightPx as number));
  const pageCap = Number.isFinite(pageContentHeightPx) && (pageContentHeightPx as number) > 0 ? Math.max(MIN_BLOCK_HEIGHT_PX * 4, Math.round(pageContentHeightPx as number)) : void 0;
  if (pageCap !== void 0 && heightPx > pageCap + ROW_HEIGHT_TOLERANCE_PX) return heightPx;
  const cap = estimatedCap + MIN_BLOCK_HEIGHT_PX * NUMBERING_LABEL_GAP_PX;
  return Math.min(heightPx, cap);
}

/* ============================================================================
 * §7 表格行高族（原 Yh..lg，jsx 18699-18917）
 * ==========================================================================*/

/** 原 Yh（jsx 18699）：表格样式 id（tblStyle） */
export function tableStyleIdOf(table: DocxTableNode): string | undefined {
  const xml = table.sourceXml ?? ``;
  return xml && xml.match(/<w:tblStyle\b[^>]*w:val="([^"]+)"/i)?.[1]?.trim() || void 0;
}

/** 原 Xh（jsx 18703）：表格是否含可见边框 */
export function tableHasVisibleBorders(table: DocxTableNode): boolean {
  const borders = table.style?.borders;
  return borders ? Object.values(borders).some((border) => border && border.type !== `none` && border.type !== `nil`) : false;
}

/** 原 Zh（jsx 18707）：表格是否含无间距段落 */
export function tableHasUnspacedParagraphs(table: DocxTableNode): boolean {
  return table.rows.some((row) => row.cells.some((cell) => cell.nodes.some((node) => node.type === `paragraph` && !xmlHasParagraphSpacing(node as DocxParagraphNode))));
}

/** 原 Qh（jsx 18710）：表格是否 TableGrid 风格（样式名或 fixed+边框+无间距） */
export function tableIsTableGrid(table: DocxTableNode): boolean {
  return tableStyleIdOf(table)?.toLowerCase() === `tablegrid` ? true : table.style?.layout === `fixed` && tableHasVisibleBorders(table) && tableHasUnspacedParagraphs(table);
}

/** 原 $h（jsx 18713）：表格逐行高（缓存 Nl；声明高融合 + 上限 + 大表放大） */
export function tableRowHeights(
  table: DocxTableNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx?: number,
  pageContentHeightPx?: number,
): number[] {
  const cacheKey = rowHeightCacheKey(contentWidthPx, gridPitchPx as number);
  const cache = engineCacheNl as WeakMap<object, Map<number, number[]>>;
  const inner = cache.get(table);
  let heights = inner?.get(cacheKey);
  if (!heights) {
    heights = computeTableRowHeights(table, contentWidthPx, numberingDefinitions, gridPitchPx);
    const next = inner ?? new Map<number, number[]>();
    next.set(cacheKey, heights), cache.set(table, next);
  }
  return table.rows.map((row, rowIndex) => {
    let height = heights[rowIndex] ?? 0;
    const declaredPx = twipsToPxNonNegative(row.style?.heightTwips);
    declaredPx && declaredPx > 0 && (height = row.style?.heightRule === `exact` ? declaredPx : Math.max(height, declaredPx)), height = rowHeightWithCaps(row, height, declaredPx, pageContentHeightPx);
    const inflateFactor = table.rows.length >= 35 ? 1.32 : table.rows.length >= TWIPS_PER_POINT_REF ? LINE_HEIGHT_FALLBACK_FACTOR : 1;
    const inflated = inflateFactor > 1 ? Math.round(height * inflateFactor) : height;
    return Math.max(MIN_BLOCK_HEIGHT_PX, inflated);
  });
}

/** 原 eg（jsx 18729）：表格行高计算（栅格宽 → 单元格内容高取大） */
export function computeTableRowHeights(
  table: DocxTableNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx?: number,
): number[] {
  const cellMarginTwips = table.style?.cellMarginTwips;
  const columnCount = tableMaxColumnCount(table);
  const tableWidthPx = twipsToPxNonNegative(table.style?.widthTwips);
  const gridWidths = (() => {
    const raw = tableGridWidthsCached(table, columnCount);
    return !raw || raw.length === 0 ? evenGridWidthsPx(columnCount, tableWidthPx) : normalizeGridWidthsPx(raw.map((width) => twipsToPxNonNegative(width) ?? 0), columnCount, tableWidthPx, 1);
  })();
  const gridTotalPx = tableWidthPx ?? gridWidths.reduce((acc, width) => acc + width, 0);
  const borderTotal = tableOuterBorderWidthPx(table, columnCount);
  const tableBodyWidth = clampTableContentWidthPx(gridTotalPx, Number.isFinite(contentWidthPx) && contentWidthPx > 0 ? Math.max(120, contentWidthPx - borderTotal) : void 0);
  const columnWidths = scaleGridWidthsToPx(gridWidths, tableBodyWidth);
  const applyDefaults = tableIsTableGrid(table);
  return table.rows.map((row) => {
    let columnCursor = 0;
    return row.cells.reduce((acc, cell) => {
      const gridSpan = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1;
      const startColumn = columnCursor;
      const endColumn = Math.min(columnCount - 1, startColumn + gridSpan - 1);
      columnCursor += gridSpan;
      const spanWidthPx = columnWidths.slice(startColumn, endColumn + 1).reduce((sum, width) => sum + width, 0);
      const evenSharePx = tableBodyWidth / Math.max(1, columnCount) * gridSpan;
      const cellWidthPx = spanWidthPx > 0 ? spanWidthPx : evenSharePx;
      const margins = cellMarginsPx(cell.style?.marginTwips ?? cellMarginTwips);
      const verticalMarginPx = margins.top + margins.bottom;
      const horizontalMarginPx = margins.left + margins.right;
      const cellContentWidth = Math.max(24, Math.round(cellWidthPx - horizontalMarginPx));
      const cellHeight = estimateCellContentHeight(cell.nodes, cellContentWidth, numberingDefinitions, applyDefaults, gridPitchPx);
      return Math.max(acc, cellHeight + verticalMarginPx);
    }, 0);
  });
}

/** 原 tg（jsx 18759）：行高样式（heightRule 读取后仅返回 px 高） */
export function tableRowStyle(row: DocxTableRow, heightPx: number | undefined): { height: string } | undefined {
  if (!Number.isFinite(heightPx) || (heightPx as number) <= 0) return;
  const normalized = Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(heightPx as number));
  return row.style?.heightRule, {
    height: `${normalized}px`
  };
}

/** 原 ng（jsx 18766）：安全边界去重（升序 + 相邻差 > Sl） */
export function dedupeSafeBoundaries(boundaries: number[]): number[] {
  const sorted = boundaries.filter((value) => Number.isFinite(value)).map((value) => Math.max(0, Math.round(value))).sort((a, b) => a - b);
  const result: number[] = [];
  for (const value of sorted) {
    const last = result[result.length - 1];
    (last === void 0 || Math.abs(last - value) > LETTERHEAD_COLUMN_MIN_COUNT) && result.push(value);
  }
  return result;
}

/** 原 rg（jsx 18776）：段落安全布局（外高 + 行边界集） */
export function paragraphSafeLayout(
  paragraph: DocxParagraphNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  applyDefaults: boolean,
  gridPitchPx: number | undefined,
  paragraphIndex: number,
): { heightPx: number; safeBoundariesPx: number[] } {
  const normalized = applyDefaultSpacingForGrid(paragraph, applyDefaults);
  const skipSnap = snapToGridModeOf(paragraph) === `disable`;
  const outer = paragraphOuterHeight(normalized, contentWidthPx, numberingDefinitions, gridPitchPx, skipSnap);
  const spacingBefore = paragraphIndex === 0 && spacingBeforeAbsent(paragraph) ? 0 : twipsToPxNonNegative(normalized.style?.spacing?.beforeTwips) ?? 0;
  const spacingAfter = twipsToPxNonNegative(normalized.style?.spacing?.afterTwips) ?? 0;
  const topBorderPx = borderTotalPx(normalized.style?.borders?.top);
  const bottomBorderPx = borderTotalPx(normalized.style?.borders?.bottom);
  const lineHeightPx = Math.max(MIN_BLOCK_HEIGHT_PX, paragraphLineHeight(normalized, gridPitchPx, skipSnap));
  const layoutText = paragraphLayoutText(normalized, {
    allowExplicitLineBreakText: true,
    expandTabsForLayout: true
  });
  const textWidth = paragraphContentWidth(normalized, contentWidthPx, numberingDefinitions);
  const lineLayout = layoutText ? paragraphLineLayout(normalized, layoutText, textWidth, lineHeightPx, []) : void 0;
  const lineTops = lineLayout ? lineLayout.lines.map((line) => Math.max(0, Math.round(line.y))) : Array.from({
    length: Math.max(1, paragraphEstimatedLineCount(normalized, contentWidthPx, numberingDefinitions))
  }, (_, index) => index * lineHeightPx);
  const contentTop = spacingBefore + topBorderPx;
  const contentHeight = lineLayout ? layoutHeightPx(lineLayout) : lineTops.length * lineHeightPx;
  const measuredTotal = Math.max(1, spacingBefore + topBorderPx + contentHeight + bottomBorderPx + spacingAfter);
  const heightPx = Math.max(1, outer, measuredTotal);
  return {
    heightPx,
    safeBoundariesPx: dedupeSafeBoundaries([...lineTops.map((top) => contentTop + top + lineHeightPx), heightPx])
  };
}

/** 原 ig（jsx 18803）：嵌套表安全布局（行高累加边界） */
export function tableSafeLayout(
  table: DocxTableNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx: number | undefined,
): { heightPx: number; safeBoundariesPx: number[] } {
  const rowHeights = tableRowHeights(table, contentWidthPx, numberingDefinitions, gridPitchPx);
  const boundaries: number[] = [];
  let cumulative = 0;
  for (const height of rowHeights) cumulative += Math.max(MIN_BLOCK_HEIGHT_PX, height), boundaries.push(cumulative);
  return {
    heightPx: Math.max(MIN_BLOCK_HEIGHT_PX, cumulative),
    safeBoundariesPx: dedupeSafeBoundaries(boundaries)
  };
}

/** 原 ag（jsx 18812）：单元格安全边界（逐子块边界 + 垂直对齐偏移） */
export function cellSafeBoundaries(input: {
  cell: DocxTableCell;
  rowHeightPx: number;
  contentWidthPx: number;
  tableCellMarginTwips: unknown;
  numberingDefinitions: unknown;
  applyWordTableDefaults: boolean;
  docGridLinePitchPx: number | undefined;
}): { safeBoundariesPx: number[]; contentBottomPx: number } {
  const {
    cell,
    rowHeightPx,
    contentWidthPx,
    tableCellMarginTwips,
    numberingDefinitions,
    applyWordTableDefaults,
    docGridLinePitchPx
  } = input;
  const margins = cellMarginsPx(effectiveCellMarginTwips(tableCellMarginTwips, cell.style?.marginTwips));
  const boundaries = [0, margins.top];
  let contentHeight = margins.top;
  let childIndex = 0;
  for (const node of cell.nodes) {
    const layout = node.type === `paragraph` ? paragraphSafeLayout(node as DocxParagraphNode, contentWidthPx, numberingDefinitions, applyWordTableDefaults, docGridLinePitchPx, childIndex++) : tableSafeLayout(node as DocxTableNode, contentWidthPx, numberingDefinitions, docGridLinePitchPx);
    boundaries.push(...layout.safeBoundariesPx.map((boundary) => contentHeight + boundary)), contentHeight += layout.heightPx;
  }
  const contentBottom = contentHeight + margins.bottom;
  const contentSpan = Math.max(0, contentHeight - margins.top);
  const availableSpan = Math.max(0, rowHeightPx - margins.top - margins.bottom);
  const slack = Math.max(0, availableSpan - contentSpan);
  const alignOffset = (cell.style?.verticalAlign as string | undefined) === `center` ? Math.round(slack / 2) : (cell.style?.verticalAlign as string | undefined) === `bottom` ? slack : 0;
  return {
    safeBoundariesPx: dedupeSafeBoundaries(boundaries.map((boundary) => Math.min(rowHeightPx, boundary + alignOffset))),
    contentBottomPx: Math.min(rowHeightPx, contentBottom + alignOffset)
  };
}

/** 原 og（jsx 18840）：边界是否安全（贴近行顶/底或命中安全边界） */
export function boundaryIsSafe(cellLayout: { safeBoundariesPx: number[]; contentBottomPx: number }, sliceBottomPx: number): boolean {
  return sliceBottomPx <= LETTERHEAD_COLUMN_MIN_COUNT || sliceBottomPx >= cellLayout.contentBottomPx - LETTERHEAD_COLUMN_MIN_COUNT ? true : cellLayout.safeBoundariesPx.some((boundary) => Math.abs(boundary - sliceBottomPx) <= LETTERHEAD_COLUMN_MIN_COUNT);
}

/** 原 sg（jsx 18844）：嵌套表行切片拟合高（自底向上找安全边界） */
export function tableRowSliceFitHeight(input: {
  table: DocxTableNode;
  rowIndex: number;
  rowHeightPx: number;
  rowSliceOffsetPx: number;
  preferredSliceHeightPx: number;
  maxAvailableWidthPx: number;
  numberingDefinitions: unknown;
  docGridLinePitchPx: number | undefined;
}): number | undefined {
  const {
    table,
    rowIndex,
    rowHeightPx,
    rowSliceOffsetPx,
    preferredSliceHeightPx,
    maxAvailableWidthPx,
    numberingDefinitions,
    docGridLinePitchPx
  } = input;
  const row = table.rows[rowIndex];
  if (!row || !rowHasNestedTable(row)) return preferredSliceHeightPx;
  const sliceOffset = Math.max(0, Math.round(rowSliceOffsetPx));
  const sliceBottom = Math.min(rowHeightPx, sliceOffset + Math.max(0, Math.round(preferredSliceHeightPx)));
  if (sliceBottom >= rowHeightPx - LETTERHEAD_COLUMN_MIN_COUNT) return Math.max(0, rowHeightPx - sliceOffset);
  const columnCount = tableMaxColumnCount(table);
  const tableWidthPx = twipsToPxNonNegative(table.style?.widthTwips);
  const gridWidths = (() => {
    const raw = tableGridWidthsCached(table, columnCount);
    return !raw || raw.length === 0 ? evenGridWidthsPx(columnCount, tableWidthPx) : normalizeGridWidthsPx(raw.map((width) => twipsToPxNonNegative(width) ?? 0), columnCount, tableWidthPx, 1);
  })();
  const gridTotalPx = tableWidthPx ?? gridWidths.reduce((acc, width) => acc + width, 0);
  const borderTotal = tableOuterBorderWidthPx(table, columnCount);
  const tableBodyWidth = clampTableContentWidthPx(gridTotalPx, Number.isFinite(maxAvailableWidthPx) && maxAvailableWidthPx > 0 ? Math.max(120, maxAvailableWidthPx - borderTotal) : void 0);
  const columnWidths = scaleGridWidthsToPx(gridWidths, tableBodyWidth);
  const applyDefaults = tableIsTableGrid(table);
  const cellMarginTwips = table.style?.cellMarginTwips;
  const cellLayouts: { safeBoundariesPx: number[]; contentBottomPx: number }[] = [];
  const candidates = [sliceBottom];
  let columnCursor = 0;
  for (const cell of row.cells) {
    const gridSpan = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1;
    const startColumn = columnCursor;
    const endColumn = Math.min(columnCount - 1, startColumn + gridSpan - 1);
    columnCursor += gridSpan;
    const spanWidthPx = columnWidths.slice(startColumn, endColumn + 1).reduce((sum, width) => sum + width, 0);
    const evenSharePx = tableBodyWidth / Math.max(1, columnCount) * gridSpan;
    const cellWidthPx = twipsToPxNonNegative(cell.style?.widthTwips) ?? (spanWidthPx > 0 ? spanWidthPx : evenSharePx);
    const margins = cellMarginsPx(effectiveCellMarginTwips(cellMarginTwips, cell.style?.marginTwips));
    const layout = cellSafeBoundaries({
      cell,
      rowHeightPx,
      contentWidthPx: Math.max(1, cellWidthPx - margins.left - margins.right),
      tableCellMarginTwips: cellMarginTwips,
      numberingDefinitions,
      applyWordTableDefaults: applyDefaults,
      docGridLinePitchPx
    });
    cellLayouts.push(layout), candidates.push(...layout.safeBoundariesPx);
  }
  const minBottom = sliceOffset + Math.max(1, DOUBLE_MIN_BLOCK_HEIGHT_PX);
  const sorted = dedupeSafeBoundaries(candidates).filter((boundary) => boundary >= minBottom && boundary <= sliceBottom + LETTERHEAD_COLUMN_MIN_COUNT).sort((a, b) => b - a);
  for (const boundary of sorted) if (cellLayouts.every((layout) => boundaryIsSafe(layout, boundary))) return Math.max(0, boundary - sliceOffset);
}

/** 原 cg（jsx 18899）：表格外高（行高合计，下限 2pc；缓存 Ml） */
export function tableOuterHeightPx(
  table: DocxTableNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx?: number,
): number {
  const xml = table.sourceXml;
  const cacheKey = rowHeightCacheKey(contentWidthPx, gridPitchPx as number);
  if (xml) {
    const cached = (engineCacheMl.get(xml) as Map<number, number> | undefined)?.get(cacheKey);
    if (cached !== void 0) return cached;
  }
  const rowsTotal = tableRowHeights(table, contentWidthPx, numberingDefinitions, gridPitchPx).reduce((acc, height) => acc + Math.max(MIN_BLOCK_HEIGHT_PX, height), 0);
  const total = Math.max(MIN_BLOCK_HEIGHT_PX * 2, rowsTotal);
  if (xml) {
    const inner = (engineCacheMl.get(xml) as Map<number, number> | undefined) ?? new Map<number, number>();
    inner.set(cacheKey, total), boundedCacheSet(engineCacheMl, xml, inner);
  }
  return total;
}

/** 原 lg（jsx 18915）：节点估算高（段落 → 外高；表格 → 外高） */
export function estimateNodeHeight(node: DocxNode, contentWidthPx: number, numberingDefinitions: unknown, gridPitchPx?: number): number {
  return node.type === `paragraph` ? paragraphOuterHeight(node as DocxParagraphNode, contentWidthPx, numberingDefinitions, gridPitchPx) : tableOuterHeightPx(node as DocxTableNode, contentWidthPx, numberingDefinitions, gridPitchPx);
}

/* ============================================================================
 * §8 分页间距原语（原 ug..mg，jsx 18918-18934；
 *    含 _m/gm 逐字实体——批 B 的 4 参变体差异见报告 §2.2）
 * ==========================================================================*/

/** 原 ug（jsx 18918）：段落原始前距 px */
export function paragraphSpacingBeforeRaw(paragraph: DocxParagraphNode): number {
  return twipsToPxNonNegative(paragraph.style?.spacing?.beforeTwips) ?? 0;
}

/** 原 dg（jsx 18921）：段落原始后距 px */
export function paragraphSpacingAfterRaw(paragraph: DocxParagraphNode): number {
  return twipsToPxNonNegative(paragraph.style?.spacing?.afterTwips) ?? 0;
}

/** 原 fg（jsx 18924）：孤行控制启用（缺省开） */
export function widowControlEnabled(paragraph: DocxParagraphNode): boolean {
  return (paragraph.style as { widowControl?: boolean } | undefined)?.widowControl !== false;
}

/** 原 pg（jsx 18926）：是否纯分页占位段（分节空段且无内容/图/表单域） */
export function isPlainPageBreakSpacer(paragraph: DocxParagraphNode): boolean {
  return paragraphBreakFlags(paragraph) ? !paragraphHasVisibleText(paragraph) && !paragraphHasImage(paragraph) && !paragraphHasFormField(paragraph) : false;
}

/** 原 mg（jsx 18929）：页断后前距抑制（前一节点为纯占位段 → 0） */
export function spacingBeforeAfterPageBreak(model: DocxEditorModel, nodeIndex: number, paragraph: DocxParagraphNode, consumedHeightPx: number, suppress: boolean): number {
  const raw = paragraphSpacingBeforeRaw(paragraph);
  if (!suppress || consumedHeightPx > 0 || nodeIndex <= 0) return raw;
  const previous = model.nodes[nodeIndex - 1];
  return previous?.type === `paragraph` && isPlainPageBreakSpacer(previous as DocxParagraphNode) ? 0 : raw;
}

/** 原 _m（jsx 17851，逐字）：分页前距（上下文间距 + 页断抑制） */
export function spacingBeforeForPagination(model: DocxEditorModel, nodeIndex: number, paragraph: DocxParagraphNode, consumedHeightPx: number, suppressAfterPageBreak: boolean): number {
  const base = spacingBeforeAfterPageBreak(model, nodeIndex, paragraph, consumedHeightPx, suppressAfterPageBreak);
  if (consumedHeightPx <= 0) return base;
  const previous = model.nodes[nodeIndex - 1];
  return previous?.type === `paragraph` && contextualSpacingApplies(previous as DocxParagraphNode, paragraph) ? 0 : base;
}

/** 原 gm（jsx 17846，逐字）：分页后距（上下文间距 → 0） */
export function spacingAfterForPagination(model: DocxEditorModel, nodeIndex: number, paragraph: DocxParagraphNode): number {
  const raw = paragraphSpacingAfterRaw(paragraph);
  const next = model.nodes[nodeIndex + 1];
  return next?.type === `paragraph` && contextualSpacingApplies(paragraph, next as DocxParagraphNode) ? 0 : raw;
}

/* ============================================================================
 * §9 拆段/分行裁决族（原 hg..jg，jsx 18935-19189）
 * ==========================================================================*/

/** 原 hg（jsx 18935）：段落可按行拆分（行数 ≥2 且无 keep 系限制） */
export function paragraphCanSplitLines(paragraph: DocxParagraphNode, totalLineCount: number, options?: { allowKeepLinesOverflow?: boolean; allowKeepNextOverflow?: boolean; allowImageParagraphSplit?: boolean }): boolean {
  return !(totalLineCount < 2 || (paragraph.style as { keepLines?: boolean } | undefined)?.keepLines === true && !options?.allowKeepLinesOverflow || paragraph.style?.keepNext === true && !options?.allowKeepNextOverflow || paragraphHasImage(paragraph) && !options?.allowImageParagraphSplit || paragraphHasFormField(paragraph));
}

/** 段落行区间（原 gg 消费面） */
export interface ParagraphLineRange {
  startLineIndex: number;
  endLineIndex: number;
  totalLineCount: number;
  lineHeightPx: number;
}

/** 原 gg（jsx 18937）：行区间是否部分（非整段） */
export function lineRangeIsPartial(range: ParagraphLineRange | undefined): boolean {
  return range ? range.startLineIndex > 0 || range.endLineIndex < range.totalLineCount : false;
}

/** 原 _g（jsx 18942）：按高度带求行区间 */
export function lineRangeForBand(lineTops: number[], lineHeightPx: number, bandTopPx: number, bandBottomPx: number): ParagraphLineRange | undefined {
  if (lineTops.length === 0 || !Number.isFinite(lineHeightPx) || lineHeightPx <= 0) return;
  const top = Math.max(0, bandTopPx);
  const bottom = Math.max(top, bandBottomPx);
  const hasBand = bottom > top;
  let startIndex: number | undefined;
  let endIndex: number | undefined;
  for (let index = 0; index < lineTops.length; index += 1) {
    const lineBottom = (lineTops[index] ?? index * lineHeightPx) + lineHeightPx;
    hasBand && lineBottom > top + ROW_HEIGHT_TOLERANCE_PX && lineBottom <= bottom + ROW_HEIGHT_TOLERANCE_PX && (startIndex === void 0 && (startIndex = index), endIndex = index + 1);
  }
  if (!(startIndex === void 0 || endIndex === void 0 || endIndex <= startIndex)) return {
    startLineIndex: startIndex,
    endLineIndex: endIndex,
    totalLineCount: lineTops.length,
    lineHeightPx
  };
}

/** 分段几何面（原 vg/yg 消费面） */
export interface SegmentGeometry {
  nodeIndex: number;
  paragraphTopPx: number;
  paragraphHeightPx: number;
  paragraphBottomPx: number;
  textBottomPx: number;
  sliceStartPx: number;
  sliceBottomPx: number;
}

/** 原 vg（jsx 18957）：分段渲染底边（段落底与文本底取大）。
 * A0-S2c：原式只读三字段，C4 调用面按原式传部分字段，参数收窄为所需字段集 */
export function segmentRenderBottomPx(geometry: Pick<SegmentGeometry, `paragraphTopPx` | `paragraphHeightPx` | `textBottomPx`>): number {
  return Math.max(Math.round(geometry.paragraphTopPx + geometry.paragraphHeightPx), Math.round(geometry.textBottomPx));
}

/** 原 yg（jsx 18961）：分段是否覆盖整段（A0-S2c：参数收窄为原式实际读取的四字段） */
export function segmentCoversWholeParagraph(geometry: Pick<SegmentGeometry, `sliceStartPx` | `sliceBottomPx` | `paragraphTopPx` | `paragraphBottomPx`>): boolean {
  return geometry.sliceStartPx <= geometry.paragraphTopPx + ROW_HEIGHT_TOLERANCE_PX && geometry.sliceBottomPx >= geometry.paragraphBottomPx + KEY_CODE_PAGE_NAV - ROW_HEIGHT_TOLERANCE_PX;
}

/** 原 bg（jsx 18964）：拆段边缘衬垫（部分区间 → 顶/底衬） */
export function splitEdgePadding(range: ParagraphLineRange | undefined): { topPx: number; bottomPx: number } {
  return lineRangeIsPartial(range) ? {
    topPx: range && range.startLineIndex > 0 ? Math.max(0, ANNOTATION_CARD_MIN_HEIGHT_PX) : 0,
    bottomPx: range && range.endLineIndex < range.totalLineCount ? Math.max(0, ANNOTATION_CARD_GAP_PX) : 0
  } : {
    topPx: 0,
    bottomPx: 0
  };
}

/** 原 xg（jsx 18974）：拆段平滑衬垫（字号/行高差的一半） */
export function splitEdgeSmoothingPadding(paragraph: DocxParagraphNode, range: ParagraphLineRange | undefined): { topPx: number; bottomPx: number } {
  if (!lineRangeIsPartial(range)) return {
    topPx: 0,
    bottomPx: 0
  };
  const lineHeightPx = Math.max(1, range?.lineHeightPx ?? 0);
  const maxFontPx = paragraphMaxFontPx(paragraph);
  const halfGap = Math.max(0, Math.ceil((maxFontPx - lineHeightPx) / 2));
  const pad = Math.max(halfGap, Math.ceil(lineHeightPx * 0.22));
  return {
    topPx: range && range.startLineIndex > 0 ? Math.min(GUTTER_PADDING_A_PX, pad) : 0,
    bottomPx: range && range.endLineIndex < range.totalLineCount ? Math.min(GUTTER_PADDING_B_PX, halfGap) : 0
  };
}

/** 原 Sg（jsx 18987）：拆段附加高（边缘衬垫 + 泳道高/0.9 行高取大） */
export function splitSegmentExtraHeight(range: ParagraphLineRange | undefined): number {
  const padding = splitEdgePadding(range);
  if (padding.topPx <= 0 && padding.bottomPx <= 0) return 0;
  const linePad = Math.max(0, Math.ceil((range?.lineHeightPx ?? 0) * 0.9));
  return Math.max(0, padding.topPx) + Math.max(0, padding.bottomPx) + Math.max(0, ANNOTATION_LANE_HEIGHT_PX, linePad);
}

/** 原 Cg（jsx 18994）：拆段平滑附加高（平滑衬垫 + 0.15 行高） */
export function splitSegmentSmoothingExtraHeight(paragraph: DocxParagraphNode, range: ParagraphLineRange | undefined): number {
  const padding = splitEdgeSmoothingPadding(paragraph, range);
  if (padding.topPx <= 0 && padding.bottomPx <= 0) return 0;
  const linePad = Math.max(0, Math.ceil((range?.lineHeightPx ?? 0) * 0.15));
  return Math.max(0, padding.topPx) + Math.max(0, padding.bottomPx) + Math.max(1, GUTTER_PADDING_C_PX, linePad);
}

/** 行区间分段引用面（原 wg 首参：渲染侧扁平分段，含 startLineIndex/endLineIndex） */
export interface LineRangeSegmentRef {
  nodeIndex: number;
  startLineIndex: number;
  endLineIndex: number;
}

/** 原 wg（jsx 19000）：分段与行区间匹配判定 */
export function segmentMatchesLineRange(segment: LineRangeSegmentRef | undefined, nodeIndex: number, range: ParagraphLineRange): boolean {
  return !segment || !range ? false : segment.nodeIndex === nodeIndex && segment.startLineIndex === range.startLineIndex && segment.endLineIndex === range.endLineIndex;
}

/** 原 Tg（jsx 19003）：分段节点布局高（行区间/表格行区间/整段外高） */
export function nodeLayoutHeight(
  node: DocxNode,
  segment: PageSegment,
  model: DocxEditorModel,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx?: number,
  options?: { excludeWrappedFloatingImageFootprint?: boolean },
): number {
  if (node.type === `paragraph`) {
    const paragraph = node as DocxParagraphNode;
    const range = segment.paragraphLineRange;
    if (range) {
      const spacingBefore = range.startLineIndex === 0 ? spacingBeforeForPagination(model, segment.nodeIndex, paragraph, +(segment.nodeIndex > 0), false) : 0;
      const spacingAfter = range.endLineIndex >= range.totalLineCount ? spacingAfterForPagination(model, segment.nodeIndex, paragraph) : 0;
      const layoutText = paragraphLayoutText(paragraph, {
        allowExplicitLineBreakText: true,
        expandTabsForLayout: true
      });
      const lineLayout = layoutText ? paragraphLineLayout(paragraph, layoutText, paragraphContentWidth(paragraph, contentWidthPx, numberingDefinitions), Math.max(1, range.lineHeightPx as number), []) : void 0;
      const rangeHeight = lineLayout && lineLayout.lineCount > 0 ? layoutRangeHeightPx(lineLayout, range.startLineIndex, range.endLineIndex) : Math.max(1, range.endLineIndex - range.startLineIndex) * Math.max(1, range.lineHeightPx as number);
      return Math.max(1, spacingBefore + rangeHeight + spacingAfter);
    }
    return Math.max(1, paragraphOuterHeight(paragraph, contentWidthPx, numberingDefinitions, gridPitchPx, false, void 0, options?.excludeWrappedFloatingImageFootprint ? {
      excludeWrappedFloatingImageFootprint: true
    } : void 0));
  }
  if (segment.tableRowRange) {
    if (segment.tableRowSlice) return Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(segment.tableRowSlice.sliceHeightPx));
    const rowHeights = tableRowHeights(node as DocxTableNode, contentWidthPx, numberingDefinitions, gridPitchPx);
    return Math.max(MIN_BLOCK_HEIGHT_PX, rowRangeHeight(rowHeights, segment.tableRowRange.startRowIndex, segment.tableRowRange.endRowIndex));
  }
  return node.type === `table` && (node as DocxTableNode).style?.floating ? 0 : Math.max(MIN_BLOCK_HEIGHT_PX, tableOuterHeightPx(node as DocxTableNode, contentWidthPx, numberingDefinitions, gridPitchPx));
}

/** 原 Eg（jsx 19025）：段落行区间解析（分段自带或布局推导） */
export function resolveParagraphLineRange(paragraph: DocxParagraphNode, segment: PageSegment, contentWidthPx: number, numberingDefinitions: unknown, gridPitchPx?: number): ParagraphLineRange {
  const lineHeightPx = Math.max(1, segment.paragraphLineRange?.lineHeightPx ?? paragraphLineHeight(paragraph, gridPitchPx));
  if (segment.paragraphLineRange) return {
    ...segment.paragraphLineRange,
    lineHeightPx
  };
  const textWidth = paragraphContentWidth(paragraph, contentWidthPx, numberingDefinitions);
  const layoutText = paragraphLayoutText(paragraph, {
    allowExplicitLineBreakText: true,
    expandTabsForLayout: true
  });
  const lineLayout = layoutText ? paragraphLineLayout(paragraph, layoutText, textWidth, lineHeightPx, []) : void 0;
  const lineCount = lineLayout && lineLayout.lineCount > 0 ? lineLayout.lineCount : paragraphEstimatedLineCount(paragraph, contentWidthPx, numberingDefinitions);
  return {
    startLineIndex: 0,
    endLineIndex: Math.max(1, lineCount),
    totalLineCount: Math.max(1, lineCount),
    lineHeightPx
  };
}

/** 原 Dg（jsx 19045）：段落分段拆分尝试（逐行扫描至高度上限） */
export function trySplitParagraphSegment(input: {
  paragraph: DocxParagraphNode;
  segment: PageSegment;
  model: DocxEditorModel;
  availableWidthPx: number;
  availableHeightPx: number;
  numberingDefinitions: unknown;
  docGridLinePitchPx: number | undefined;
}): { currentSegment: PageSegment; currentHeightPx: number; remainderSegment: PageSegment } | undefined {
  const {
    paragraph,
    segment,
    model,
    availableWidthPx,
    availableHeightPx,
    numberingDefinitions,
    docGridLinePitchPx
  } = input;
  if (segment.tableRowRange || segment.tableRowSlice || explicitColumnBreakOf(paragraph)) return;
  const lineRange = resolveParagraphLineRange(paragraph, segment, availableWidthPx, numberingDefinitions, docGridLinePitchPx);
  const firstLine = Math.max(0, lineRange.startLineIndex);
  const lastLine = Math.max(firstLine, lineRange.endLineIndex);
  if (lastLine - firstLine < 2 || !paragraphCanSplitLines(paragraph, lineRange.totalLineCount)) return;
  const heightLimit = Math.max(0, Math.round(availableHeightPx));
  let bestSegment: PageSegment | undefined;
  let bestHeight = 0;
  for (let endLine = firstLine + 1; endLine < lastLine; endLine += 1) {
    const candidate: PageSegment = {
        ...segment,
        paragraphLineRange: {
          startLineIndex: firstLine,
          endLineIndex: endLine,
          totalLineCount: lineRange.totalLineCount,
          lineHeightPx: lineRange.lineHeightPx
        }
      },
      candidateHeight = nodeLayoutHeight(paragraph, candidate, model, availableWidthPx, numberingDefinitions, docGridLinePitchPx);
    if (candidateHeight > heightLimit + ROW_HEIGHT_TOLERANCE_PX) break;
    bestSegment = candidate, bestHeight = candidateHeight;
  }
  if (bestSegment?.paragraphLineRange) return {
    currentSegment: bestSegment,
    currentHeightPx: bestHeight,
    remainderSegment: {
      ...segment,
      paragraphLineRange: {
        startLineIndex: bestSegment.paragraphLineRange.endLineIndex,
        endLineIndex: lastLine,
        totalLineCount: lineRange.totalLineCount,
        lineHeightPx: lineRange.lineHeightPx
      }
    }
  };
}

/** 原 Og（jsx 19092）：分段跨页分配（页高序列 + 拆段 + 断点提示） */
export function distributeSegmentsAcrossPages(
  model: DocxEditorModel,
  segments: PageSegment[],
  pageHeightsPx: number[],
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchByNodeIndex: Map<number, number> | undefined,
  measuredHeightByNodeIndex: Map<number, number> | undefined,
  balancePages = false,
  breakHintIndexes?: Set<number>,
): PageSegment[][] {
  const pageCount = Math.max(1, pageHeightsPx.length);
  const pages: PageSegment[][] = Array.from({
    length: pageCount
  }, () => []);
  const minWidth = Math.max(120, Math.round(contentWidthPx));
  const heightOf = (segment: PageSegment, widthPx: number): number => {
      const node = model.nodes[segment.nodeIndex];
      if (!node) return MIN_BLOCK_HEIGHT_PX;
      const gridPitch = gridPitchByNodeIndex?.get(segment.nodeIndex);
      const measured = node.type === `paragraph` && !segment.paragraphLineRange && !segment.tableRowRange && !segment.tableRowSlice ? measuredHeightByNodeIndex?.get(segment.nodeIndex) : void 0;
      return Number.isFinite(measured) && (measured as number) > 0 ? Math.max(1, Math.round(measured as number)) : nodeLayoutHeight(node, segment, model, widthPx, numberingDefinitions, gridPitch);
    },
    pageBudget = balancePages && pageCount > 1 ? Math.min(minWidth, Math.max(MIN_BLOCK_HEIGHT_PX * 4, Math.ceil(segments.reduce((acc, segment) => acc + heightOf(segment, Math.max(120, Math.round(pageHeightsPx[0] ?? 120))), 0) / pageCount) + ROW_HEIGHT_TOLERANCE_PX)) : minWidth;
  let pageIndex = 0;
  let pageUsed = 0;
  const nextPage = (): boolean => pageIndex + 1 >= pageCount ? false : (pageIndex += 1, pageUsed = 0, true);
  const push = (segment: PageSegment, heightPx: number): void => {
    pages[pageIndex]?.push(segment), pageUsed += Math.max(1, Math.round(heightPx));
  };
  for (const incoming of segments) {
    (incoming.paragraphLineRange?.startLineIndex ?? 0) === 0 && (incoming.tableRowRange?.startRowIndex ?? 0) === 0 && !incoming.tableRowSlice && breakHintIndexes?.has(incoming.nodeIndex) && pageUsed > 0 && nextPage();
    let pending: PageSegment | undefined = incoming;
    let guard = 0;
    for (; pending && guard < 256;) {
      guard += 1;
      const segment: PageSegment = pending;
      const node: DocxNode | undefined = model.nodes[segment.nodeIndex];
      if (!node) {
        pages[pageIndex]?.push(segment);
        break;
      }
      const widthPx = Math.max(120, Math.round(pageHeightsPx[pageIndex] ?? pageHeightsPx[0] ?? 120));
      const gridPitch = gridPitchByNodeIndex?.get(segment.nodeIndex);
      const height = heightOf(segment, widthPx);
      const remaining = Math.max(0, pageBudget - pageUsed);
      if (height <= remaining + ROW_HEIGHT_TOLERANCE_PX || pageIndex + 1 >= pageCount) {
        push(segment, height), pending = void 0;
        break;
      }
      const split: ReturnType<typeof trySplitParagraphSegment> = node.type === `paragraph` ? trySplitParagraphSegment({
        paragraph: node as DocxParagraphNode,
        segment,
        model,
        availableWidthPx: widthPx,
        availableHeightPx: remaining,
        numberingDefinitions,
        docGridLinePitchPx: gridPitch
      }) : void 0;
      if (split) {
        if (push(split.currentSegment, split.currentHeightPx), pending = split.remainderSegment, !nextPage()) {
          const remainder = split.remainderSegment;
          push(remainder, nodeLayoutHeight(node, remainder, model, widthPx, numberingDefinitions, gridPitch)), pending = void 0;
        }
        continue;
      }
      nextPage() || (push(segment, height), pending = void 0);
    }
  }
  return pages;
}

/** 原 kg（jsx 19155）：行区间高度合计 */
export function rowRangeHeight(rowHeights: number[], startRowIndex: number, endRowIndex: number): number {
  let total = 0;
  const start = Math.max(0, startRowIndex);
  const end = Math.max(start, Math.min(endRowIndex, rowHeights.length));
  for (let index = start; index < end; index += 1) total += Math.max(1, rowHeights[index] ?? MIN_BLOCK_HEIGHT_PX);
  return total;
}

/** 原 Ag（jsx 19162）：自起点按高度上限拟合行末（单行兜底） */
export function fitRowsWithin(rowHeights: number[], startIndex: number, maxHeightPx: number, allowSingleRow: boolean): number {
  if (startIndex >= rowHeights.length) return startIndex;
  const limit = Number.isFinite(maxHeightPx) && maxHeightPx > 0 ? maxHeightPx : 0;
  let used = 0;
  let endIndex = startIndex;
  for (; endIndex < rowHeights.length;) {
    const height = Math.max(1, rowHeights[endIndex] ?? MIN_BLOCK_HEIGHT_PX);
    if (used + height > limit + ROW_HEIGHT_TOLERANCE_PX) break;
    used += height, endIndex += 1;
  }
  return endIndex === startIndex && allowSingleRow ? Math.min(rowHeights.length, startIndex + 1) : endIndex;
}

/** 原 jg（jsx 19173）：按断页提示切段组（末行渲染/页断前缀） */
export function paginateByBreakHints(model: DocxEditorModel): { nodeIndex: number }[][] {
  if (model.nodes.length === 0) return [];
  const hints = [0];
  model.nodes.forEach((node, index) => {
    index === 0 || node.type !== `paragraph` || (lastRenderedPageBreakOf(node as DocxParagraphNode) || pageBreakBeforeOf(node as DocxParagraphNode)) && hints.push(index);
  });
  const sorted = [...new Set(hints)].sort((a, b) => a - b);
  const groups: { nodeIndex: number }[][] = [];
  return sorted.forEach((start, groupIndex) => {
    const end = sorted[groupIndex + 1] ?? model.nodes.length;
    const group: { nodeIndex: number }[] = [];
    for (let index = start; index < end; index += 1) group.push({
      nodeIndex: index
    });
    group.length > 0 && groups.push(group);
  }), groups;
}

/* ============================================================================
 * §10 分页主循环（原 Mg，jsx 19190-19541；逐字全量实体）
 * —— 批 B BLayout.paginateDocumentReconstructed 为骨架登记，本件为实体；
 *    两者并存，批 B 文件不改（边界裁决 1，报告 §2.1）。
 * ==========================================================================*/

/** 分页选项（原 Mg 第 6 参消费面） */
export interface PaginateDocumentOptions {
  allowParagraphLineSplitting?: boolean;
  suppressSpacingBeforeAfterPageBreak?: boolean;
  preferLastRenderedParagraphStartBreaks?: boolean;
  strictLastRenderedParagraphStartBreaks?: boolean;
  precomputedNumberingLabels?: Map<string, NumberingLabelEntry>;
  measuredPageContentHeightsPxByPageIndex?: number[];
  measuredParagraphOuterHeightsPxByNodeIndex?: Map<number, number>;
  measuredTableRowHeightsByNodeIndex?: Record<number, number[]>;
}

/** 原 Mg（jsx 19190-19541）：文档分页主循环（节区度量/段落折行/表格行切片） */
export function paginateDocument(
  model: DocxEditorModel,
  pageContentHeightPx: number,
  pageContentWidthPx: number,
  numberingDefinitions: unknown,
  sectionMetrics: SectionPageMetrics[] | undefined,
  options?: PaginateDocumentOptions,
): PageSegment[][] {
  if (model.nodes.length === 0) return [];
  const defaultMetrics: SectionPageMetrics = {
      startNodeIndex: 0,
      pageContentWidthPx: Math.max(120, Math.round(pageContentWidthPx)),
      pageContentHeightPx: Math.max(120, Math.round(pageContentHeightPx)),
      docGridLinePitchPx: void 0
    },
    metrics = sectionMetrics?.length ? sectionMetrics : [defaultMetrics],
    pages: PageSegment[][] = [],
    currentPage: PageSegment[] = [];
  let pageIndex = 0;
  const allowLineSplitting = options?.allowParagraphLineSplitting ?? true,
    suppressAfterPageBreak = options?.suppressSpacingBeforeAfterPageBreak ?? false,
    preferLastRenderedBreaks = options?.preferLastRenderedParagraphStartBreaks ?? false,
    strictLastRenderedBreaks = options?.strictLastRenderedParagraphStartBreaks ?? false,
    sectionBreaks = sectionBreakNodeIndexes(model),
    numberingLabels = options?.precomputedNumberingLabels ?? numberingLabelsForModel(model),
    newPageStarts = newPageSectionStarts(model),
    breakHints = pageBreakHintMap(model.nodes.length, sectionBreaks),
    tableHeightsCache = new Map<number, number[]>(),
    measuredPageHeights = options?.measuredPageContentHeightsPxByPageIndex,
    resolveMeasuredHeight = (index: number, fallbackPx: number, multiplier = 1): number => {
      const measured = measuredPageHeights?.[index];
      return Number.isFinite(measured) && (measured as number) > 0 ? Math.max(24, Math.min(Math.round(fallbackPx), Math.round((measured as number) * Math.max(1, multiplier)))) : Math.max(24, Math.round(fallbackPx));
    },
    pageHeightFor = (index: number, section: SectionPageMetrics | undefined): number => resolveMeasuredHeight(index, section?.pageContentHeightPx ?? defaultMetrics.pageContentHeightPx, section?.pageContentHeightMultiplier ?? defaultMetrics.pageContentHeightMultiplier ?? 1),
    flushPage = (): void => {
      currentPage.length > 0 && pages.push(currentPage), currentPage.length = 0, pageIndex += 1;
    };
  if (!Number.isFinite(pageContentHeightPx) || pageContentHeightPx <= 0) return [model.nodes.map((_, index) => ({
    nodeIndex: index
  }))];
  let consumedHeight = 0,
    lastSpacingAfter = 0,
    sectionIndex = 0,
    pageStartConsumed = 0,
    keepNextChainEnd = -1,
    currentPageHeight = pageHeightFor(0, metrics[0]);
  const rescaleConsumed = (heightPx: number, fromSection: SectionPageMetrics | undefined, toSection: SectionPageMetrics | undefined): number => {
    const normalized = Math.max(0, Math.round(heightPx));
    if (normalized <= 0) return 0;
    const fromMultiplier = Math.max(1, Math.round(fromSection?.pageContentHeightMultiplier ?? 1)),
      toMultiplier = Math.max(1, Math.round(toSection?.pageContentHeightMultiplier ?? 1));
    if (fromMultiplier === toMultiplier) return normalized;
    const perUnit = normalized / fromMultiplier;
    return Math.max(0, Math.round(perUnit * toMultiplier));
  };
  for (let nodeIndex = 0; nodeIndex < model.nodes.length; nodeIndex += 1) {
    const previousSection = sectionIndex;
    sectionIndex = sectionIndexForNode(metrics, nodeIndex, sectionIndex);
    const section = metrics[sectionIndex] ?? defaultMetrics;
    nodeIndex > 0 && sectionIndex !== previousSection && (consumedHeight = rescaleConsumed(consumedHeight, metrics[previousSection], section), currentPageHeight = pageHeightFor(pageIndex, section), pageStartConsumed = consumedHeight), sectionBreaks.has(nodeIndex) && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
    const node = model.nodes[nodeIndex];
    if (node.type === `paragraph` && (isSectionBreakSpacer(node as DocxParagraphNode) || isRemovableSectionSpacer(model, nodeIndex, node as DocxParagraphNode))) {
      lastSpacingAfter = 0;
      continue;
    }
    if (node.type === `paragraph` && isTrailingSectionSpacer(model, nodeIndex, node as DocxParagraphNode)) {
      lastSpacingAfter = 0;
      continue;
    }
    if (node.type === `paragraph` && emptyBeforeDeletedMark(node as DocxParagraphNode, model.nodes[nodeIndex - 1])) continue;
    if (node.type === `paragraph`) {
      const paragraph = node as DocxParagraphNode;
      pageBreakBeforeOf(paragraph) && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section)), preferLastRenderedBreaks && lastRenderedBreakAtStart(paragraph) && (strictLastRenderedBreaks || pageTailNearlyFull({
        pageConsumedHeightPx: consumedHeight,
        pageContentHeightPx: currentPageHeight
      })) && !paragraphStartsNewPage(model.nodes[nodeIndex - 1] as DocxParagraphNode) && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
      const spacingBeforeRawPx = paragraphSpacingBeforeRaw(paragraph),
        spacingAfterRawPx = paragraphSpacingAfterRaw(paragraph),
        effectiveBefore = spacingBeforeForPagination(model, nodeIndex, paragraph, consumedHeight, suppressAfterPageBreak),
        effectiveAfter = spacingAfterForPagination(model, nodeIndex, paragraph),
        lineHeightPx = paragraphLineHeight(paragraph, section.docGridLinePitchPx),
        textWidth = paragraphContentWidth(paragraph, section.pageContentWidthPx, numberingDefinitions),
        layoutText = paragraphLayoutText(paragraph, {
          allowExplicitLineBreakText: true,
          expandTabsForLayout: true
        });
      let cachedLineLayout: TextBlockLayout | undefined;
      let lineLayoutComputed = false;
      const getLineLayout = (): TextBlockLayout | undefined => lineLayoutComputed ? cachedLineLayout : (lineLayoutComputed = true, cachedLineLayout = layoutText ? paragraphLineLayout(paragraph, layoutText, textWidth, lineHeightPx, []) : void 0, cachedLineLayout);
      const numberingLabel = numberingLabels.get(`p:${nodeIndex}`),
        measuredOuterHeight = (section.pageContentHeightMultiplier ?? 1) > 1 ? options?.measuredParagraphOuterHeightsPxByNodeIndex?.get(nodeIndex) : void 0,
        outerHeight = Number.isFinite(measuredOuterHeight) && (measuredOuterHeight as number) > 0 ? measuredOuterHeight as number : paragraphOuterHeight(paragraph, section.pageContentWidthPx, numberingDefinitions, section.docGridLinePitchPx, false, numberingLabel);
      let totalHeight = Math.max(1, outerHeight - spacingBeforeRawPx - spacingAfterRawPx + effectiveBefore + effectiveAfter);
      const exceedsPage = totalHeight > section.pageContentHeightPx + ROW_HEIGHT_TOLERANCE_PX,
        keepLinesOverflow = (paragraph.style as { keepLines?: boolean } | undefined)?.keepLines === true && exceedsPage,
        keepNextOverflow = paragraph.style?.keepNext === true && exceedsPage,
        keepOverflow = keepLinesOverflow || keepNextOverflow,
        inKeepChain = nodeIndex <= keepNextChainEnd;
      keepOverflow && !inKeepChain && consumedHeight > 0 && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
      const suppressedSpacing = consumedHeight > 0 ? Math.min(lastSpacingAfter, effectiveBefore) : 0,
        heightAfterSuppress = Math.max(1, totalHeight - suppressedSpacing),
        hasLayoutText = !!layoutText,
        remainingHeight = Math.max(0, currentPageHeight - consumedHeight);
      if (hasLayoutText && remainingHeight <= heightAfterSuppress + lineHeightPx + ROW_HEIGHT_TOLERANCE_PX) {
        const layout = getLineLayout();
        const layoutHeight = layout ? layoutHeightPx(layout) : void 0;
        Number.isFinite(layoutHeight) && (totalHeight = Math.max(totalHeight, Math.max(1, Math.round(effectiveBefore + (layoutHeight as number) + effectiveAfter))));
      }
      const totalAfterMeasure = Math.max(1, totalHeight - suppressedSpacing),
        hardLineCount = paragraphHasHardLineBreak(paragraph) || paragraphHasTabChar(paragraph) ? getLineLayout()?.lineCount : void 0,
        imageSplitAllowed = paragraphHasImage(paragraph) && hasLayoutText,
        estimatedLineCount = paragraphEstimatedLineCount(paragraph, section.pageContentWidthPx, numberingDefinitions, numberingLabel),
        lineCount = Number.isFinite(hardLineCount) && (hardLineCount as number) > 0 ? Math.max(1, Math.round(hardLineCount as number)) : estimatedLineCount,
        splitParts = (section.pageContentHeightMultiplier ?? 1) > 1 ? splitParagraphByLineBreaks(paragraph) : void 0,
        tryFitSplitParts = (): boolean => {
          if (!splitParts || splitParts.length <= 1) return false;
          const fitted = fitSplitPartsHeight(splitParts, consumedHeight, currentPageHeight, pageStartConsumed, Math.max(1, Math.round(section.pageContentHeightMultiplier ?? 1)), section.pageContentWidthPx, effectiveBefore, effectiveAfter, suppressedSpacing, numberingDefinitions, section.docGridLinePitchPx);
          return Number.isFinite(fitted) ? (currentPage.push({
            nodeIndex
          }), consumedHeight = Math.max(consumedHeight, Math.round(fitted as number)), lastSpacingAfter = effectiveAfter, true) : false;
        };
      if (tryFitSplitParts() || splitParts && splitParts.length > 1 && consumedHeight > 0 && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section), tryFitSplitParts())) continue;
      const widowControl = widowControlEnabled(paragraph),
        widowLines = widowControl ? 2 : 1;
      if (paragraphCanSplitLines(paragraph, lineCount, {
        allowKeepLinesOverflow: keepLinesOverflow,
        allowKeepNextOverflow: keepNextOverflow,
        allowImageParagraphSplit: imageSplitAllowed
      }) && (!widowControl || lineCount > 3) && allowLineSplitting) {
        const layout = getLineLayout();
        const extraHeightFor = (startLine: number, endLine: number): number => {
            const range: ParagraphLineRange = {
              startLineIndex: startLine,
              endLineIndex: endLine,
              totalLineCount: lineCount,
              lineHeightPx
            };
            return hasLayoutText ? splitSegmentExtraHeight(range) : splitSegmentSmoothingExtraHeight(paragraph, range);
          },
          rangeHeightFor = (startLine: number, endLine: number): number => layout && layout.lineCount > 0 ? layoutRangeHeightPx(layout, startLine, endLine) : Math.max(1, endLine - startLine) * lineHeightPx;
        let lineCursor = 0;
        let isFirstSlice = true;
        for (; lineCursor < lineCount;) {
          const linesLeft = lineCount - lineCursor,
            sliceBefore = isFirstSlice ? consumedHeight > 0 ? Math.max(0, effectiveBefore - suppressedSpacing) : effectiveBefore : 0,
            sliceAfter = linesLeft <= widowLines ? effectiveAfter : 0,
            pageRemaining = Math.max(0, currentPageHeight - consumedHeight),
            sliceExtra = extraHeightFor(lineCursor, lineCount),
            sliceHeight = sliceBefore + rangeHeightFor(lineCursor, lineCount) + sliceAfter;
          if (sliceHeight + sliceExtra <= pageRemaining) {
            currentPage.push({
              nodeIndex,
              paragraphLineRange: {
                startLineIndex: lineCursor,
                endLineIndex: lineCount,
                totalLineCount: lineCount,
                lineHeightPx
              }
            }), consumedHeight += sliceHeight, lastSpacingAfter = effectiveAfter, lineCursor = lineCount;
            break;
          }
          const maxAdvance = Math.max(0, linesLeft - widowLines),
            candidateExtra = extraHeightFor(lineCursor, Math.min(lineCount, lineCursor + maxAdvance)),
            spaceLeft = Math.max(0, pageRemaining - sliceBefore - candidateExtra);
          let advanceLines = Math.floor(spaceLeft / lineHeightPx);
          if (advanceLines = Math.min(advanceLines, maxAdvance), layout && layout.lineCount > 0 && advanceLines > 0) {
            const fittedEnd = layoutFitLineEnd(layout as TextBlockLayout, lineCursor, Math.min(lineCount, lineCursor + advanceLines), spaceLeft);
            advanceLines = Math.max(0, fittedEnd - lineCursor);
          }
          if (advanceLines < widowLines) {
            if (currentPage.length > 0) {
              flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
              continue;
            }
            const forcedLines = Math.max(1, Math.floor(Math.max(1, spaceLeft) / lineHeightPx));
            advanceLines = Math.max(1, Math.min(maxAdvance > 0 ? maxAdvance : linesLeft, forcedLines));
          }
          let endLine = Math.min(lineCount, lineCursor + advanceLines);
          for (; advanceLines > widowLines;) {
            const shrunkExtra = extraHeightFor(lineCursor, endLine);
            if (sliceBefore + rangeHeightFor(lineCursor, endLine) + shrunkExtra <= pageRemaining) break;
            --advanceLines, endLine = Math.min(lineCount, lineCursor + advanceLines);
          }
          const sliceEnd = Math.min(lineCount, lineCursor + advanceLines);
          currentPage.push({
            nodeIndex,
            paragraphLineRange: {
              startLineIndex: lineCursor,
              endLineIndex: sliceEnd,
              totalLineCount: lineCount,
              lineHeightPx
            }
          }), consumedHeight += sliceBefore + rangeHeightFor(lineCursor, sliceEnd), lastSpacingAfter = 0, lineCursor = sliceEnd, isFirstSlice = false, lineCursor < lineCount && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
        }
        continue;
      }
      let keepChainHeight = totalAfterMeasure;
      let keepChainEnd = -1;
      if (paragraph.style?.keepNext === true && !inKeepChain && paragraphHasVisibleText(paragraph)) {
        let cursor = nodeIndex;
        let pendingAfter = effectiveAfter;
        for (; cursor < model.nodes.length - 1;) {
          const current = model.nodes[cursor];
          if (current.type !== `paragraph` || (current as DocxParagraphNode).style?.keepNext !== true || !paragraphHasVisibleText(current as DocxParagraphNode) || sectionBreaks.has(cursor + 1)) break;
          const next = model.nodes[cursor + 1];
          if (next.type !== `paragraph`) break;
          cursor += 1;
          const nextParagraph = next as DocxParagraphNode;
          const nextSection = metrics[sectionIndexForNode(metrics, cursor, sectionIndex)] ?? defaultMetrics,
            nextSpacingBefore = paragraphSpacingBeforeRaw(nextParagraph),
            nextSpacingAfter = paragraphSpacingAfterRaw(nextParagraph),
            nextEffectiveBefore = spacingBeforeForPagination(model, cursor, nextParagraph, 1, suppressAfterPageBreak),
            nextEffectiveAfter = spacingAfterForPagination(model, cursor, nextParagraph),
            nextHeight = Math.max(1, paragraphOuterHeight(nextParagraph, nextSection.pageContentWidthPx, numberingDefinitions, nextSection.docGridLinePitchPx) - nextSpacingBefore - nextSpacingAfter + nextEffectiveBefore + nextEffectiveAfter);
          keepChainHeight += Math.max(1, nextHeight - Math.min(pendingAfter, nextEffectiveBefore)), keepChainHeight += keepNextExtraSpacing(current as DocxParagraphNode, nextParagraph, nextSection.docGridLinePitchPx), pendingAfter = nextEffectiveAfter;
        }
        keepChainEnd = cursor;
      }
      const pageRemainingForKeep = currentPageHeight - consumedHeight,
        chainFits = keepNextChainFitsPageTail(model, nodeIndex, consumedHeight, lastSpacingAfter, section.pageContentWidthPx, currentPageHeight, sectionBreaks, newPageStarts, breakHints, (chainNodeIndex, chainNode, widthPx) => estimateNodeHeight(chainNode, widthPx, numberingDefinitions, section.docGridLinePitchPx), (chainNodeIndex, chainParagraph, consumedPx) => spacingBeforeForPagination(model, chainNodeIndex, chainParagraph, consumedPx, suppressAfterPageBreak), (chainNodeIndex, chainParagraph) => spacingAfterForPagination(model, chainNodeIndex, chainParagraph));
      consumedHeight > 0 && keepChainHeight > pageRemainingForKeep + ROW_HEIGHT_TOLERANCE_PX && !chainFits && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section)), consumedHeight === 0 && keepChainEnd > nodeIndex && (keepNextChainEnd = keepChainEnd), currentPage.push({
        nodeIndex
      }), consumedHeight += consumedHeight > 0 ? heightAfterSuppress : totalHeight, lastSpacingAfter = effectiveAfter;
      continue;
    }
    if ((node as { style?: { floating?: unknown } }).style?.floating) {
      currentPage.push({
        nodeIndex
      }), lastSpacingAfter = 0;
      continue;
    }
    const table = node as DocxTableNode;
    const measuredRowHeights = options?.measuredTableRowHeightsByNodeIndex?.[nodeIndex],
      normalizedMeasured = measuredRowHeights && measuredRowHeights.length === table.rows.length ? measuredRowHeights.map((height) => Math.max(MIN_BLOCK_HEIGHT_PX, Number.isFinite(height) ? Math.round(height) : MIN_BLOCK_HEIGHT_PX)) : void 0,
      rowHeights = normalizedMeasured ?? tableHeightsCache.get(nodeIndex) ?? tableRowHeights(table, section.pageContentWidthPx, numberingDefinitions, section.docGridLinePitchPx, section.pageContentHeightPx);
    if (!normalizedMeasured && !tableHeightsCache.has(nodeIndex) && tableHeightsCache.set(nodeIndex, rowHeights), rowHeights.length === 0) {
      currentPage.push({
        nodeIndex
      }), lastSpacingAfter = 0;
      continue;
    }
    const pageBreakRowStarts = tablePageBreakRowIndexes(table as unknown as Parameters<typeof tablePageBreakRowIndexes>[0]).startRowIndexes;
    pageBreakRowStarts.includes(0) && currentPage.length > 0 && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
    let headerRowCount = 0;
    for (const row of table.rows) if (row.style?.isHeader === true) headerRowCount += 1; else break;
    const headerHeight = headerRowCount > 0 ? rowRangeHeight(rowHeights, 0, headerRowCount) : 0,
      repeatHeader = headerRowCount > 0 && headerHeight > 0 && headerHeight + MIN_BLOCK_HEIGHT_PX * 2 < currentPageHeight;
    let rowCursor = 0;
    let rowSliceOffset = 0;
    let pageHeaderConsumed = 0;
    let pageBreakCursor = 0;
    for (; rowCursor < rowHeights.length;) {
      currentPage.length === 0 && (pageHeaderConsumed = 0), repeatHeader && rowCursor >= headerRowCount && currentPage.length === 0 && (currentPage.push({
        nodeIndex,
        tableRowRange: {
          startRowIndex: 0,
          endRowIndex: headerRowCount
        }
      }), consumedHeight += headerHeight, lastSpacingAfter = 0, pageHeaderConsumed = headerHeight);
      const pageRemaining = Math.max(0, currentPageHeight - consumedHeight),
        row = table.rows[rowCursor],
        rowHeight = Math.max(MIN_BLOCK_HEIGHT_PX, rowHeights[rowCursor] ?? MIN_BLOCK_HEIGHT_PX),
        rowRemaining = Math.max(0, rowHeight - rowSliceOffset),
        rowExceedsPage = rowHeight > Math.max(MIN_BLOCK_HEIGHT_PX, currentPageHeight - pageHeaderConsumed) + ROW_HEIGHT_TOLERANCE_PX,
        pageHasRoom = consumedHeight > 0 && pageRemaining >= DOUBLE_MIN_BLOCK_HEIGHT_PX,
        canSlice = rowSliceOffset > 0 || rowIsSplittable(row) || rowExceedsPage,
        alreadySlicing = rowSliceOffset > 0,
        useSmoothing = ENABLE_LAYOUT_SMOOTHING && canSlice && rowRemaining > pageRemaining + ROW_HEIGHT_TOLERANCE_PX && (alreadySlicing || rowExceedsPage || pageHasRoom);
      if (canSlice && rowRemaining > pageRemaining + ROW_HEIGHT_TOLERANCE_PX && !useSmoothing && currentPage.length > 0) {
        flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
        continue;
      }
      if (useSmoothing) {
        if (currentPage.length > 0 && pageRemaining <= MIN_BLOCK_HEIGHT_PX) {
          flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
          continue;
        }
        const preferredSlice = Math.max(MIN_BLOCK_HEIGHT_PX, Math.min(rowRemaining, consumedHeight <= 0 ? currentPageHeight : Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(pageRemaining)))),
          fittedSlice = tableRowSliceFitHeight({
            table,
            rowIndex: rowCursor,
            rowHeightPx: rowHeight,
            rowSliceOffsetPx: rowSliceOffset,
            preferredSliceHeightPx: preferredSlice,
            maxAvailableWidthPx: section.pageContentWidthPx,
            numberingDefinitions,
            docGridLinePitchPx: section.docGridLinePitchPx
          });
        if (fittedSlice === void 0 && consumedHeight > 0 && currentPage.length > 0) {
          flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
          continue;
        }
        const sliceHeight = Math.max(MIN_BLOCK_HEIGHT_PX, Math.min(rowRemaining, fittedSlice ?? preferredSlice));
        currentPage.push({
          nodeIndex,
          tableRowRange: {
            startRowIndex: rowCursor,
            endRowIndex: Math.min(rowHeights.length, rowCursor + 1)
          },
          tableRowSlice: {
            rowIndex: rowCursor,
            startOffsetPx: rowSliceOffset,
            sliceHeightPx: sliceHeight,
            totalRowHeightPx: rowHeight
          }
        }), consumedHeight += sliceHeight, lastSpacingAfter = 0, rowSliceOffset += sliceHeight, rowSliceOffset >= rowHeight - ROW_HEIGHT_TOLERANCE_PX && (rowCursor += 1, rowSliceOffset = 0), rowCursor < rowHeights.length && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
        continue;
      }
      if (rowSliceOffset > 0) {
        currentPage.push({
          nodeIndex,
          tableRowRange: {
            startRowIndex: rowCursor,
            endRowIndex: Math.min(rowHeights.length, rowCursor + 1)
          },
          tableRowSlice: {
            rowIndex: rowCursor,
            startOffsetPx: rowSliceOffset,
            sliceHeightPx: rowRemaining,
            totalRowHeightPx: rowHeight
          }
        }), consumedHeight += rowRemaining, lastSpacingAfter = 0, rowCursor += 1, rowSliceOffset = 0;
        continue;
      }
      let fitEnd = fitRowsWithin(rowHeights, rowCursor, pageRemaining, consumedHeight <= 0);
      for (; pageBreakCursor < pageBreakRowStarts.length && pageBreakRowStarts[pageBreakCursor] <= rowCursor;) pageBreakCursor += 1;
      const nextBreakRow = pageBreakRowStarts[pageBreakCursor];
      if (nextBreakRow !== void 0 && (fitEnd = Math.min(fitEnd, nextBreakRow)), fitEnd <= rowCursor) {
        if (currentPage.length > 0) {
          flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
          continue;
        }
        const singleEnd = Math.min(rowHeights.length, rowCursor + 1),
          singleHeight = rowRangeHeight(rowHeights, rowCursor, singleEnd);
        currentPage.push({
          nodeIndex,
          tableRowRange: {
            startRowIndex: rowCursor,
            endRowIndex: singleEnd
          }
        }), consumedHeight += singleHeight, lastSpacingAfter = 0, rowCursor = singleEnd, rowSliceOffset = 0, rowCursor < rowHeights.length && (flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section));
        continue;
      }
      const rangeHeight = rowRangeHeight(rowHeights, rowCursor, fitEnd),
        coversWholeTable = rowCursor === 0 && fitEnd >= rowHeights.length;
      if (currentPage.push({
        nodeIndex,
        tableRowRange: coversWholeTable ? void 0 : {
          startRowIndex: rowCursor,
          endRowIndex: fitEnd
        }
      }), consumedHeight += rangeHeight, lastSpacingAfter = 0, rowCursor = fitEnd, rowSliceOffset = 0, rowCursor < rowHeights.length) {
        const nextRow = table.rows[rowCursor],
          nextRowHeight = Math.max(MIN_BLOCK_HEIGHT_PX, rowHeights[rowCursor] ?? MIN_BLOCK_HEIGHT_PX),
          nextPageRemaining = Math.max(0, currentPageHeight - consumedHeight);
        if (ENABLE_LAYOUT_SMOOTHING && nextRow !== void 0 && rowIsSplittable(nextRow) && !pageBreakRowStarts.includes(rowCursor) && nextPageRemaining >= DOUBLE_MIN_BLOCK_HEIGHT_PX && nextRowHeight > nextPageRemaining + ROW_HEIGHT_TOLERANCE_PX) continue;
        flushPage(), consumedHeight = 0, lastSpacingAfter = 0, pageStartConsumed = 0, currentPageHeight = pageHeightFor(pageIndex, section);
      }
    }
  }
  return (currentPage.length > 0 || pages.length === 0) && pages.push(currentPage), pages;
}

/* ============================================================================
 * §10b 浮动图分类（原 Ng/Fg/Kg，jsx 19542-19563/19817-19820；依赖补全）
 * ==========================================================================*/

/** 原 Ng（jsx 19542）：内联（随文）浮动图判定 */
export function isInlineImageNode(image: DocxImageNode): boolean {
  const floating = image.floating;
  if (!floating || image.syntheticTextBox && !syntheticTextBoxIsGraphicShape(image)) return false;
  const wrapType = floating.wrapType;
  if (wrapType === void 0 || wrapType === `none` || isPageMarginCornerAnchoredFloating(image)) return false;
  if (!floating.behindDocument) return true;
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const verticalRelativeTo = floating.verticalRelativeTo?.toLowerCase();
  return !!(floating.horizontalAlign || (floating as { verticalAlign?: string }).verticalAlign || (floating as { wrapText?: string }).wrapText) && horizontalRelativeTo !== `page` && verticalRelativeTo !== `page`;
}

/** 原 Fg（jsx 19555）：页边距角锚定浮动图判定 */
export function isPageMarginCornerAnchoredFloating(image: DocxImageNode): boolean {
  const floating = image.floating;
  if (!floating || !floating.wrapType || floating.wrapType === `none` || floating.behindDocument) return false;
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const verticalRelativeTo = floating.verticalRelativeTo?.toLowerCase();
  const horizontalAlign = floating.horizontalAlign?.toLowerCase();
  const verticalAlign = (floating as { verticalAlign?: string }).verticalAlign as string | undefined;
  return (horizontalRelativeTo === `margin` || horizontalRelativeTo === `page`) && (verticalRelativeTo === `margin` || verticalRelativeTo === `page`) && (horizontalAlign === `left` || horizontalAlign === `right` || horizontalAlign === `inside` || horizontalAlign === `outside`) && (verticalAlign?.toLowerCase() === `top` || verticalAlign?.toLowerCase() === `inside`);
}

/** 原 Kg（jsx 19817）：绝对定位浮动图判定 */
export function isFloatingImageNode(image: DocxImageNode): boolean {
  const floating = image.floating;
  return !floating || isInlineImageNode(image) ? false : floating.xPx !== void 0 || floating.yPx !== void 0 || floating.horizontalAlign !== void 0 || (floating as { verticalAlign?: string }).verticalAlign !== void 0 || floating.zIndex !== void 0 || floating.behindDocument === true;
}

/* ============================================================================
 * §11 隙段：TOC/制表/XML 解析/文本框/修订（原 w_..hv，jsx 20231-20943）
 * ==========================================================================*/

/** 原 w_（jsx 20231）：TOC 级别（styleId/styleName → toc N） */
export function tocLevelOf(paragraph: DocxParagraphNode): number | undefined {
  const candidates = [paragraph.style?.styleId, paragraph.style?.styleName];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = candidate.trim().match(/^toc(?:[\s_-]*(\d+))?$/i);
    if (!match) continue;
    const level = match[1] ? Number.parseInt(match[1], 10) : 1;
    return Number.isFinite(level) && level > 0 ? Math.round(level) : 1;
  }
}

/** 原 T_（jsx 20241）：是否 TOC 段落 */
export function isTocParagraph(paragraph: DocxParagraphNode): boolean {
  return isTocStyleName(paragraph.style?.styleId) || isTocStyleName(paragraph.style?.styleName);
}

/** 原 E_（jsx 20242）：段落是否含 TOC 制表（右对齐/点线制表位或 tab 字符） */
export function paragraphHasTocTab(paragraph: DocxParagraphNode): boolean {
  return isTocParagraph(paragraph) ? tabStopsOf(paragraph).some((stop) => stop.alignment === `right` || stop.leader === `dot`) ? true : paragraph.children.some((child) => child.type === `text` ? (child as { text: string }).text.includes(`	`) : child.type === `form-field` ? formFieldDisplayText(child as DocxFormFieldNode).includes(`	`) : false) : false;
}

/** 原 D_（jsx 20245）：TOC 制表位（右对齐/点线；TOC 段缺省合成） */
export function tocTabStopOf(paragraph: DocxParagraphNode): DocxTabStop | undefined {
  const stop = tabStopsOf(paragraph).find((candidate) => candidate.alignment === `right` || candidate.leader === `dot`);
  if (stop) return stop;
  if (isTocParagraph(paragraph)) return {
    alignment: `right`,
    leader: `dot`
  };
}

/** 原 O_（jsx 20254）：TOC 首制表位 px */
export function tocFirstTabStopPx(paragraph: DocxParagraphNode): number | undefined {
  if (isTocParagraph(paragraph)) return leftTabStopsAfterIndent(paragraph)[0];
}

/** 原 k_（jsx 20257）：段落是否含 tab 字符 */
export function paragraphHasTabChar(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `text` ? (child as { text: string }).text.includes(`	`) : child.type === `form-field` ? formFieldDisplayText(child as DocxFormFieldNode).includes(`	`) : false);
}

/** 原 A_（jsx 20260）：段落 tab 字符计数 */
export function countTabChars(paragraph: DocxParagraphNode): number {
  return paragraph.children.reduce((acc, child) => {
    const text = child.type === `text` ? (child as { text: string }).text : child.type === `form-field` ? formFieldDisplayText(child as DocxFormFieldNode) : ``;
    if (!text) return acc;
    const tabs = text.match(/\t/g);
    return acc + (tabs ? tabs.length : 0);
  }, 0);
}

/** 原 j_（jsx 20269）：制表布局种类（center-right/center/right/none） */
export function tabLayoutKindOf(paragraph: DocxParagraphNode, options?: { withinHeaderFooter?: boolean }): `center-right` | `center` | `right` | `none` {
  const stops = tabStopsOf(paragraph);
  const hasLeft = stops.some((stop) => stop.alignment === `left`);
  const hasCenter = stops.some((stop) => stop.alignment === `center`);
  const hasRight = stops.some((stop) => stop.alignment === `right`);
  const tabCount = countTabChars(paragraph);
  const withinHeaderFooter = options?.withinHeaderFooter === true;
  return hasLeft && (hasCenter || hasRight) ? `none` : hasCenter && hasRight ? tabCount >= 2 || withinHeaderFooter && tabCount >= 1 ? `center-right` : `none` : hasCenter && tabCount === 1 ? `center` : hasRight && tabCount === 1 ? `right` : `none`;
}

/** 原 M_（jsx 20279）：按对齐取首个制表位 px */
export function tabStopByAlignment(paragraph: DocxParagraphNode, alignment: string): number | undefined {
  return tabStopsOf(paragraph).filter((stop) => stop.alignment === alignment).map((stop) => twipsToPxNonNegative(stop.positionTwips)).filter((px) => Number.isFinite(px) && (px as number) > 0).sort((a, b) => (a as number) - (b as number))[0];
}

/** 原 N_（jsx 20282）：XML 实体解码（hex/dec/amp/lt/gt/quot/apos） */
export function decodeXmlEntities(text: string | undefined): string | undefined {
  return text && text.replace(/&#x([0-9a-f]+);/gi, (whole, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  }).replace(/&#([0-9]+);/g, (whole, dec) => {
    const code = Number.parseInt(dec, 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  }).replace(/&amp;/g, `&`).replace(/&lt;/g, `<`).replace(/&gt;/g, `>`).replace(/&quot;/g, `"`).replace(/&apos;/g, `'`);
}

/** XML 区域（原 P_ 的段面） */
export interface XmlRegion {
  start: number;
  end: number;
  tagName: string;
  openTag: string;
}

/** 原 P_（jsx 20291）：成对 XML 区域匹配（自闭合/栈式配对） */
export function matchXmlRegions(xml: string | undefined, tagName: string): XmlRegion[] {
  if (!xml) return [];
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  const pattern = RegExp(`<(/?)${escaped}(?=[\\s>/])[^>]*>`, `gi`);
  const openStack: { start: number; openTag: string }[] = [];
  const regions: XmlRegion[] = [];
  for (const match of xml.matchAll(pattern)) {
    const whole = match[0] ?? ``;
    if (!whole) continue;
    const start = match.index ?? 0;
    const isClose = match[1] === `/`;
    if (!isClose && /\/>\s*$/i.test(whole)) {
      regions.push({
        start,
        end: start + whole.length,
        tagName,
        openTag: whole
      });
      continue;
    }
    if (!isClose) {
      openStack.push({
        start,
        openTag: whole
      });
      continue;
    }
    const open = openStack.pop();
    open && regions.push({
      start: open.start,
      end: start + whole.length,
      tagName,
      openTag: open.openTag
    });
  }
  return regions;
}

/** 原 F_（jsx 20329）：修订标签 → 种类 */
export function revisionKindOfTag(tagName: string): `insertion` | `deletion` | `move-from` | `move-to` | undefined {
  switch (tagName.trim().toLowerCase()) {
    case `w:ins`:
      return `insertion`;
    case `w:del`:
      return `deletion`;
    case `w:movefrom`:
      return `move-from`;
    case `w:moveto`:
      return `move-to`;
    default:
      return;
  }
}

/** 原 I_（jsx 20341）：空白归一（nbsp → 空格；压缩/裁剪） */
export function normalizeWhitespace(text: string | undefined): string | undefined {
  if (!text) return;
  const normalized = text.replace(/\u00a0/g, ` `).replace(/\s+/g, ` `).trim();
  return normalized.length > 0 ? normalized : void 0;
}

/** 原 L_（jsx 20346）：修订日期 → en-US UTC 短格式 */
export function formatRevisionDateUtc(dateText: string | undefined): string | undefined {
  if (!dateText) return;
  const trimmed = dateText.trim();
  if (!trimmed) return;
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat(`en-US`, {
    month: `short`,
    day: `2-digit`,
    year: `numeric`,
    timeZone: `UTC`
  }).format(date);
}

/** 原 R_（jsx 20357）：剥离文本框内容 XML */
export function stripTextBoxContentXml(xml: string): string {
  return xml.includes(`w:txbxContent`) ? xml.replace(/<w:txbxContent\b[\s\S]*?<\/w:txbxContent>/gi, ``) : xml;
}

/** 运行文本段（原 z_ 的段面） */
export interface RunTextSegment {
  text: string;
  isNote: boolean;
}

/** 原 z_（jsx 20361）：运行文本段抽取（delText/t/tab/br/脚尾注引用） */
export function extractRunTextSegments(xml: string | undefined, includeDelText: boolean): RunTextSegment[] {
  if (!xml) return [];
  const segments: RunTextSegment[] = [];
  for (const match of xml.matchAll(/<w:delText\b[^>]*>([\s\S]*?)<\/w:delText>|<(?:w|a):t\b[^>]*>([\s\S]*?)<\/(?:w|a):t>|<w:tab\b[^>]*\/?>|<w:(?:br|cr)\b[^>]*\/?>|<w:footnoteReference\b[^>]*\/?>|<w:endnoteReference\b[^>]*\/?>/gi)) {
    if (match[1] !== void 0) {
      if (!includeDelText) continue;
      const text = decodeXmlEntities(match[1] ?? ``) ?? ``;
      segments.push({
        text,
        isNote: false
      });
      continue;
    }
    if (match[2] !== void 0) {
      const text = decodeXmlEntities(match[2] ?? ``) ?? ``;
      segments.push({
        text,
        isNote: false
      });
      continue;
    }
    const whole = match[0] ?? ``;
    if (/^<w:tab\b/i.test(whole)) {
      segments.push({
        text: `	`,
        isNote: false
      });
      continue;
    }
    if (/^<w:(?:br|cr)\b/i.test(whole)) {
      segments.push({
        text: `
`,
        isNote: false
      });
      continue;
    }
    /^<w:(?:footnoteReference|endnoteReference)\b/i.test(whole) && segments.push({
      text: `⁣`,
      isNote: true
    });
  }
  return segments;
}

/** 原 B_（jsx 20402）：XML 布尔属性启用判定（缺省开） */
export function xmlFlagEnabled(tag: string | undefined): boolean {
  if (!tag) return false;
  const value = xmlAttrValue(tag, `w:val`)?.trim().toLowerCase();
  return value ? !(value === `false` || value === `0` || value === `off` || value === `none`) : true;
}

/** 原 V_（jsx 20407）：XML 颜色属性（auto → undefined；补 #） */
export function xmlColorAttr(tag: string | undefined): string | undefined {
  if (!tag) return;
  const value = xmlAttrValue(tag, `w:val`)?.trim();
  if (!(!value || /^auto$/i.test(value))) return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : value;
}

/** 原 H_（jsx 20413）：rPr → 运行样式解析 */
export function parseRunStyleXml(xml: string): DocxRunStyle | undefined {
  const rPrRegion = matchXmlRegions(xml, `w:rPr`)[0];
  const rPr = rPrRegion ? xml.slice(rPrRegion.start, rPrRegion.end) : ``;
  if (!rPr) return;
  const fontsTag = rPr.match(/<w:rFonts\b[^>]*\/?>/i)?.[0];
  const ascii = fontsTag ? xmlAttrValue(fontsTag, `w:ascii`) : void 0;
  const hAnsi = fontsTag ? xmlAttrValue(fontsTag, `w:hAnsi`) : void 0;
  const eastAsia = fontsTag ? xmlAttrValue(fontsTag, `w:eastAsia`) : void 0;
  const cs = fontsTag ? xmlAttrValue(fontsTag, `w:cs`) : void 0;
  const fontFamily = ascii ?? hAnsi ?? eastAsia ?? cs;
  const sizeTag = rPr.match(/<w:sz\b[^>]*\/?>/i)?.[0] ?? rPr.match(/<w:szCs\b[^>]*\/?>/i)?.[0];
  const halfPoints = sizeTag ? Number(xmlAttrValue(sizeTag, `w:val`)) : NaN;
  const fontSizePt = Number.isFinite(halfPoints) && halfPoints > 0 ? Number((halfPoints / 2).toFixed(2)) : void 0;
  const bold = xmlFlagEnabled(rPr.match(/<w:b(?:Cs)?\b[^>]*\/?>/i)?.[0]);
  const italic = xmlFlagEnabled(rPr.match(/<w:i(?:Cs)?\b[^>]*\/?>/i)?.[0]);
  const underlineTag = rPr.match(/<w:u\b[^>]*\/?>/i)?.[0];
  const underline = xmlFlagEnabled(underlineTag);
  const strike = xmlFlagEnabled(rPr.match(/<w:strike\b[^>]*\/?>/i)?.[0]);
  const color = xmlColorAttr(rPr.match(/<w:color\b[^>]*\/?>/i)?.[0]);
  const highlightTag = rPr.match(/<w:highlight\b[^>]*\/?>/i)?.[0];
  const highlight = highlightTag ? xmlAttrValue(highlightTag, `w:val`) : void 0;
  const vertAlignTag = rPr.match(/<w:vertAlign\b[^>]*\/?>/i)?.[0];
  const vertAlign = vertAlignTag ? xmlAttrValue(vertAlignTag, `w:val`) : void 0;
  const style: DocxRunStyle = {
    fontFamily: fontFamily?.trim() || void 0,
    fontSizePt,
    bold: bold || void 0,
    italic: italic || void 0,
    underline: underline || void 0,
    strike: strike || void 0,
    color,
    highlight: highlight?.trim() || void 0,
    verticalAlign: vertAlign === `superscript` || vertAlign === `subscript` ? vertAlign : void 0
  };
  return Object.values(style).some((value) => value !== void 0) ? style : void 0;
}

/** 原 U_（jsx 20451）：XML 区域内容抽取 */
export function extractXmlRegionContents(xml: string, tagName: string): string[] {
  return matchXmlRegions(xml, tagName).map((region) => xml.slice(region.start, region.end));
}

/** 原 W_（jsx 20454）：运行样式合并（override 优先） */
export function mergeRunStyles(base: DocxRunStyle | undefined, override: DocxRunStyle | undefined): DocxRunStyle | undefined {
  if (!base && !override) return;
  const merged: DocxRunStyle = {
    fontFamily: override?.fontFamily ?? base?.fontFamily,
    fontSizePt: override?.fontSizePt ?? base?.fontSizePt,
    bold: override?.bold ?? base?.bold,
    italic: override?.italic ?? base?.italic,
    underline: override?.underline ?? base?.underline,
    strike: override?.strike ?? base?.strike,
    color: override?.color ?? base?.color,
    highlight: override?.highlight ?? base?.highlight,
    verticalAlign: override?.verticalAlign ?? base?.verticalAlign
  };
  return Object.values(merged).some((value) => value !== void 0) ? merged : void 0;
}

/** 原 G_（jsx 20469）：段落对齐解析（jc） */
export function parseParagraphAlign(xml: string): `center` | `right` | `justify` | `left` | undefined {
  const jcTag = xml.match(/<w:jc\b[^>]*\/?>/i)?.[0];
  const value = jcTag ? xmlAttrValue(jcTag, `w:val`)?.trim().toLowerCase() : void 0;
  if (value === `center` || value === `right` || value === `justify` || value === `left`) return value;
}

/** 原 K_（jsx 20474）：XML 属性转义 */
export function escapeXmlAttrValue(text: string): string {
  return text.replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`).replace(/"/g, `&quot;`);
}

/** 原 q_（jsx 20477）：SVG data URL */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** 原 J_（jsx 20479）：EMU → px（9525 EMU/px） */
export function emuToPxRounded(emu: number): number | undefined {
  if (Number.isFinite(emu)) return Math.max(0, Number((emu / 9525).toFixed(3)));
}

/** 原 Y_（jsx 20482）：域结果显示文本（PAGE/NUMPAGES/STYLEREF；保留首尾空白） */
export function resolveFieldDisplayText(
  text: string,
  fieldKind: `PAGE` | `NUMPAGES` | undefined,
  styleRefTarget: string | undefined,
  pageIndex: number | undefined,
  pageCount: number | undefined,
  pageNumberFormat: string | undefined,
  styleRefResolver: ((target: string) => string | undefined) | undefined,
): string {
  if (fieldKind === `PAGE`) {
    const pageNumber = Number.isFinite(pageIndex) && (pageIndex as number) > 0 ? Math.max(1, Math.round(pageIndex as number)) : void 0;
    if (Number.isFinite(pageNumber)) {
      const leading = text.match(/^\s*/)?.[0] ?? ``;
      const trailing = text.match(/\s*$/)?.[0] ?? ``;
      return `${leading}${formatPageNumber(Math.round(pageNumber as number), pageNumberFormat)}${trailing}`;
    }
  }
  if (fieldKind === `NUMPAGES`) {
    const totalPages = Number.isFinite(pageCount) && (pageCount as number) > 0 ? Math.max(1, Math.round(pageCount as number)) : void 0;
    if (Number.isFinite(totalPages)) {
      const leading = text.match(/^\s*/)?.[0] ?? ``;
      const trailing = text.match(/\s*$/)?.[0] ?? ``;
      return `${leading}${Math.round(totalPages as number)}${trailing}`;
    }
  }
  if (styleRefTarget) {
    const resolved = styleRefResolver?.(styleRefTarget)?.trim();
    if (resolved) return `${text.match(/^\s*/)?.[0] ?? ``}${resolved}${text.match(/\s*$/)?.[0] ?? ``}`;
  }
  return text;
}

/** 文本框行（原 X_ 的段面） */
export interface TextBoxLine {
  align: `center` | `right` | `justify` | `left` | undefined;
  lineHeightPx: number;
  segments: { text: string; style?: DocxRunStyle }[];
}

/** 原 X_（jsx 20504）：文本框行解析（段落/行距/域结果/样式合并） */
export function parseTextBoxLines(
  xml: string,
  pageIndex?: number,
  pageCount?: number,
  pageNumberFormat?: string,
  styleRefResolver?: (target: string) => string | undefined,
): TextBoxLine[] {
  const content = extractXmlRegionContents(xml, `w:txbxContent`)[0];
  if (!content) return [];
  const lines: TextBoxLine[] = [];
  for (const paragraphXml of extractXmlRegionContents(content, `w:p`)) {
    const pPr = extractXmlRegionContents(paragraphXml, `w:pPr`)[0] ?? paragraphXml.match(/<w:pPr\b[^>]*\/?>/i)?.[0] ?? ``;
    const paragraphStyle = parseRunStyleXml(`<w:r>${extractXmlRegionContents(pPr, `w:rPr`)[0] ?? pPr.match(/<w:rPr\b[^>]*\/?>/i)?.[0] ?? ``}</w:r>`);
    const spacingTag = pPr.match(/<w:spacing\b[^>]*\/?>/i)?.[0] ?? ``;
    const lineTwips = spacingTag ? Number(xmlAttrValue(spacingTag, `w:line`)) : NaN;
    const lineRule = spacingTag ? xmlAttrValue(spacingTag, `w:lineRule`)?.trim().toLowerCase() : void 0;
    const exactLineHeight = Number.isFinite(lineTwips) && lineTwips > 0 && lineRule === `exact` ? Math.max(1, twipsToPxNonNegative(lineTwips) ?? 1) : void 0;
    const segments: { text: string; style?: DocxRunStyle }[] = [];
    const fieldStack: { inResult: boolean; pageFieldKind?: `PAGE` | `NUMPAGES`; styleRefTarget?: string; instructionStyle?: DocxRunStyle }[] = [];
    const appendText = (text: string | undefined, style: DocxRunStyle | undefined): void => {
      if (!text) return;
      const last = segments[segments.length - 1];
      if (last && JSON.stringify(last.style ?? {}) === JSON.stringify(style ?? {})) {
        last.text += text;
        return;
      }
      segments.push({
        text,
        style
      });
    };
    for (const runXml of extractXmlRegionContents(paragraphXml, `w:r`)) {
      const runStyle = mergeRunStyles(paragraphStyle, parseRunStyleXml(runXml));
      const beginCount = runXml.match(/<w:fldChar\b[^>]*\bw:fldCharType="begin"[^>]*\/?>/gi)?.length ?? 0;
      for (let index = 0; index < beginCount; index += 1) fieldStack.push({
        inResult: false
      });
      for (const instruction of runXml.matchAll(/<w:instrText\b[^>]*>([\s\S]*?)<\/w:instrText>/gi)) {
        const fieldKind = pageFieldKindOfInstruction(instruction[1] ?? ``);
        const styleRefTarget = styleRefTargetOfInstruction(instruction[1] ?? ``);
        if (!(!fieldKind && !styleRefTarget || fieldStack.length === 0)) {
          for (let depth = fieldStack.length - 1; depth >= 0; --depth) if (!fieldStack[depth].pageFieldKind && !fieldStack[depth].styleRefTarget) {
            fieldStack[depth].pageFieldKind = fieldKind, fieldStack[depth].styleRefTarget = styleRefTarget, fieldStack[depth].instructionStyle = mergeRunStyles(fieldStack[depth].instructionStyle, runStyle);
            break;
          }
        }
      }
      const separateCount = runXml.match(/<w:fldChar\b[^>]*\bw:fldCharType="separate"[^>]*\/?>/gi)?.length ?? 0;
      for (let index = 0; index < separateCount; index += 1) for (let depth = fieldStack.length - 1; depth >= 0; --depth) if (!fieldStack[depth].inResult) {
        fieldStack[depth].inResult = true;
        break;
      }
      const activeField = (() => {
        for (let depth = fieldStack.length - 1; depth >= 0; --depth) {
          const entry = fieldStack[depth];
          if (entry.inResult && (entry.pageFieldKind || entry.styleRefTarget)) return entry;
        }
      })();
      for (const textMatch of runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) {
        const rawText = decodeXmlEntities(textMatch[1] ?? ``) ?? ``;
        appendText(activeField ? resolveFieldDisplayText(rawText, activeField.pageFieldKind, activeField.styleRefTarget, pageIndex, pageCount, pageNumberFormat, styleRefResolver) : rawText, activeField?.instructionStyle ? mergeRunStyles(activeField.instructionStyle, runStyle) : runStyle);
      }
      const endCount = runXml.match(/<w:fldChar\b[^>]*\bw:fldCharType="end"[^>]*\/?>/gi)?.length ?? 0;
      for (let index = 0; index < endCount; index += 1) fieldStack.pop();
    }
    if (segments.length === 0) continue;
    const fontSizePt = segments.find((segment) => segment.style?.fontSizePt)?.style?.fontSizePt ?? 12;
    lines.push({
      align: parseParagraphAlign(paragraphXml),
      lineHeightPx: exactLineHeight ?? Math.max(14, Math.round((fontSizePt ?? 12) * 96 / 72 * 1.24)),
      segments
    });
  }
  return lines;
}

/** 文本框形状样式（原 Z_ 返回面） */
export interface TextBoxShapeStyle {
  backgroundColor: string | undefined;
  borderColor: string | undefined;
  borderWidthPx: number;
  paddingLeftPx: number;
  paddingTopPx: number;
  paddingRightPx: number;
  paddingBottomPx: number;
}

/** 原 Z_（jsx 20574）：文本框形状样式解析（bodyPr/ln/spPr） */
export function parseTextBoxShapeStyle(xml: string): TextBoxShapeStyle {
  const bodyPr = extractXmlRegionContents(xml, `wps:bodyPr`)[0] ?? xml.match(/<wps:bodyPr\b[^>]*\/?>/i)?.[0] ?? ``;
  const lineXml = extractXmlRegionContents(xml, `a:ln`)[0] ?? xml.match(/<a:ln\b[\s\S]*?<\/a:ln>/i)?.[0] ?? xml.match(/<a:ln\b[^>]*\/?>/i)?.[0] ?? ``;
  const spPr = extractXmlRegionContents(xml, `wps:spPr`)[0] ?? xml.match(/<wps:spPr\b[\s\S]*?<\/wps:spPr>/i)?.[0] ?? ``;
  const shapeNoFill = /<a:noFill\b/i.test(spPr) || /<wps:noFill\b/i.test(spPr);
  const lineNoFill = /<a:noFill\b/i.test(lineXml);
  const shapeFill = spPr.match(/<a:solidFill>\s*<a:srgbClr\b[^>]*val="([^"]+)"/i)?.[1] ?? spPr.match(/<a:solidFill>\s*<a:schemeClr\b[^>]*val="([^"]+)"/i)?.[1];
  const lineFill = lineXml.match(/<a:solidFill>\s*<a:srgbClr\b[^>]*val="([^"]+)"/i)?.[1] ?? lineXml.match(/<a:solidFill>\s*<a:schemeClr\b[^>]*val="([^"]+)"/i)?.[1];
  const lineWidthEmu = Number(xmlAttrValue(lineXml, `w`));
  const borderWidthPx = !lineXml || lineNoFill ? 0 : Number.isFinite(lineWidthEmu) && lineWidthEmu > 0 ? Math.max(1, Math.round(lineWidthEmu / 9525)) : 0;
  return {
    backgroundColor: !shapeNoFill && shapeFill ? `#${shapeFill}` : void 0,
    borderColor: borderWidthPx > 0 && lineFill ? `#${lineFill}` : void 0,
    borderWidthPx,
    paddingLeftPx: emuToPxRounded(Number(xmlAttrValue(bodyPr, `lIns`))) ?? 6,
    paddingTopPx: emuToPxRounded(Number(xmlAttrValue(bodyPr, `tIns`))) ?? 3,
    paddingRightPx: emuToPxRounded(Number(xmlAttrValue(bodyPr, `rIns`))) ?? 6,
    paddingBottomPx: emuToPxRounded(Number(xmlAttrValue(bodyPr, `bIns`))) ?? 3
  };
}

/** 原 Q_（jsx 20594）：文本框纯文本（textBoxText 优先；否则解析行） */
export function textBoxPlainText(image: DocxImageNode): string | undefined {
  const direct = image.textBoxText;
  if (typeof direct == `string`) return direct;
  const lines = image.sourceXml ? parseTextBoxLines(image.sourceXml) : [];
  if (lines.length !== 0) return lines.map((line) => line.segments.map((segment) => segment.text).join(``)).join(`
`);
}

/** 原 $_（jsx 20600）：文本框渲染行（纯文本行套用解析行样式） */
export function textBoxRenderLines(
  image: DocxImageNode,
  pageIndex?: number,
  pageCount?: number,
  pageNumberFormat?: string,
  styleRefResolver?: (target: string) => string | undefined,
): TextBoxLine[] {
  const parsed = image.sourceXml ? parseTextBoxLines(image.sourceXml, pageIndex, pageCount, pageNumberFormat, styleRefResolver) : [];
  const direct = image.textBoxText;
  if (typeof direct != `string`) return parsed;
  const textLines = direct.split(/\r?\n/);
  return textLines.length === 0 ? parsed : textLines.map((text, index) => {
    const reference = parsed[index] ?? parsed[0];
    const referenceStyle = reference?.segments[0]?.style;
    return {
      align: reference?.align,
      lineHeightPx: reference?.lineHeightPx ?? 18,
      segments: [{
        text,
        style: referenceStyle
      }]
    };
  });
}

/** 原 ev（jsx 20621）：文本框 z 序（zIndex/nd 量化；下限 4） */
export function textBoxZIndex(image: DocxImageNode): number {
  const quantized = Number.isFinite(image.floating?.zIndex) ? Math.max(1, Math.min(65535, Math.round((image.floating?.zIndex as number) / Z_LAYER_MAX))) : 4;
  return Math.max(4, quantized);
}

/** 原 tv（jsx 20625）：合成文本框 → SVG data URL（左对齐逐段 x 定位） */
export function renderTextBoxSvg(
  image: DocxImageNode,
  pageIndex?: number,
  pageCount?: number,
  pageNumberFormat?: string,
  styleRefResolver?: (target: string) => string | undefined,
): string | undefined {
  if (!image.syntheticTextBox || !image.sourceXml || syntheticTextBoxIsGraphicShape(image)) return;
  const lines = textBoxRenderLines(image, pageIndex, pageCount, pageNumberFormat, styleRefResolver);
  if (lines.length === 0) return;
  const widthPx = Math.max(8, Math.round(image.widthPx ?? 320));
  const naturalHeight = lines.reduce((acc, line) => acc + line.lineHeightPx, 6);
  const heightPx = Math.max(8, Math.round(image.heightPx ?? naturalHeight));
  let topPx = 0;
  const parts: string[] = [];
  for (const line of lines) {
    const lineBottom = topPx + line.lineHeightPx;
    const baseline = Math.min(lineBottom, Math.max(1, heightPx - 1));
    if (lineBottom > heightPx + 1 && parts.length > 0) break;
    topPx = lineBottom;
    const joined = line.segments.map((segment) => segment.text).join(``);
    const baseStyle = line.segments.find((segment) => segment.style)?.style;
    Math.max(10, Math.round((baseStyle?.fontSizePt ?? 12) * 96 / 72));
    const fullWidth = Math.max(1, estimateTextWidthPx(joined, baseStyle));
    const scale = fullWidth > widthPx && fullWidth > 0 ? widthPx / fullWidth : 1;
    const align = line.align ?? `left`;
    const anchor = align === `center` ? `middle` : align === `right` ? `end` : `start`;
    const anchorX = align === `center` ? Math.round(widthPx / 2) : align === `right` ? widthPx : 0;
    let dx = 0;
    const centeredSpans = line.segments.map((segment, segmentIndex) => {
      const segmentStyle = mergeRunStyles(baseStyle, segment.style);
      const fontSize = Math.max(10, Math.round((segmentStyle?.fontSizePt ?? 12) * 96 / 72 * scale));
      const decoration = [segmentStyle?.underline ? `underline` : ``, segmentStyle?.strike ? `line-through` : ``].filter(Boolean).join(` `);
      const attrs = [`font-size="${fontSize}"`, segmentStyle?.fontFamily ? `font-family="${escapeXmlAttrValue(segmentStyle.fontFamily)}"` : ``, segmentStyle?.bold ? `font-weight="700"` : ``, segmentStyle?.italic ? `font-style="italic"` : ``, segmentStyle?.color ? `fill="${segmentStyle.color}"` : `fill="#000000"`, decoration ? `text-decoration="${decoration}"` : ``].filter(Boolean).join(` `);
      const dxAttr = align === `left` && segmentIndex > 0 ? ` dx="${Math.round(dx)}"` : segmentIndex > 0 ? ` dx="0"` : ``;
      return dx = 0, `<tspan${dxAttr} ${attrs}>${escapeXmlAttrValue(segment.text)}</tspan>`;
    }).join(``);
    if (align === `left`) {
      let x = 0;
      const leftSpans = line.segments.map((segment) => {
        const segmentStyle = mergeRunStyles(baseStyle, segment.style);
        const fontSize = Math.max(10, Math.round((segmentStyle?.fontSizePt ?? 12) * 96 / 72 * scale));
        const decoration = [segmentStyle?.underline ? `underline` : ``, segmentStyle?.strike ? `line-through` : ``].filter(Boolean).join(` `);
        const span = `<tspan ${[`x="${Math.round(x)}"`, `font-size="${fontSize}"`, segmentStyle?.fontFamily ? `font-family="${escapeXmlAttrValue(segmentStyle.fontFamily)}"` : ``, segmentStyle?.bold ? `font-weight="700"` : ``, segmentStyle?.italic ? `font-style="italic"` : ``, segmentStyle?.color ? `fill="${segmentStyle.color}"` : `fill="#000000"`, decoration ? `text-decoration="${decoration}"` : ``].filter(Boolean).join(` `)}>${escapeXmlAttrValue(segment.text)}</tspan>`;
        return x += estimateTextWidthPx(segment.text, segmentStyle) * scale, span;
      }).join(``);
      parts.push(`<text y="${Math.round(baseline)}" text-anchor="${anchor}">${leftSpans}</text>`);
      continue;
    }
    parts.push(`<text x="${anchorX}" y="${Math.round(baseline)}" text-anchor="${anchor}">${centeredSpans}</text>`);
  }
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">${parts.join(``)}</svg>`);
}

/** 原 nv（jsx 20674）：合成文本框是否图形形状（pic/带填充描边的 wsp 组） */
export function syntheticTextBoxIsGraphicShape(image: DocxImageNode): boolean {
  return !image.syntheticTextBox || !image.sourceXml ? false : /<pic:pic\b|<a:blip\b/i.test(image.sourceXml) ? true : /<wpg:wgp\b/i.test(image.sourceXml) ? extractXmlRegionContents(image.sourceXml, `wps:wsp`).some((shape) => {
    const spPr = extractXmlRegionContents(shape, `wps:spPr`)[0] ?? ``;
    if (!spPr || /<w:txbxContent\b/i.test(shape)) return false;
    const lineXml = extractXmlRegionContents(spPr, `a:ln`)[0] ?? ``;
    return /<a:solidFill\b|<a:gradFill\b|<a:blipFill\b/i.test(spPr) || !!lineXml && !/<a:noFill\b/i.test(lineXml);
  }) : false;
}

/** 形状变换（原 rv 返回面） */
export interface ShapeTransform {
  rotationDegrees: number | undefined;
  flipH: boolean | undefined;
  flipV: boolean | undefined;
}

/** 原 rv（jsx 20679）：a:xfrm 形状变换解析（旋转/翻转） */
export function parseShapeTransformXml(xml: string | undefined): ShapeTransform | undefined {
  if (!xml) return;
  const xfrm = extractXmlRegionContents(xml, `a:xfrm`)[0] ?? xml.match(/<a:xfrm\b[^>]*\/?>/i)?.[0] ?? ``;
  if (!xfrm) return;
  const rotationRaw = Number(xmlAttrValue(xfrm, `rot`));
  const rotationDegrees = Number.isFinite(rotationRaw) ? Number((rotationRaw / 6e4).toFixed(3)) : void 0;
  const flipHRaw = xmlAttrValue(xfrm, `flipH`)?.trim().toLowerCase();
  const flipVRaw = xmlAttrValue(xfrm, `flipV`)?.trim().toLowerCase();
  const flipH = flipHRaw === `1` || flipHRaw === `true`;
  const flipV = flipVRaw === `1` || flipVRaw === `true`;
  if (!(!Number.isFinite(rotationDegrees) && !flipH && !flipV)) return {
    rotationDegrees,
    flipH: flipH || void 0,
    flipV: flipV || void 0
  };
}

/** 原 iv（jsx 20695）：CSS transform 连接（去空） */
export function joinCssTransforms(...parts: (string | undefined)[]): string | undefined {
  const nonEmpty = parts.filter((part) => !!(part && part.trim().length > 0));
  return nonEmpty.length > 0 ? nonEmpty.join(` `) : void 0;
}

/** 原 av（jsx 20699）：形状变换 → CSS（90° 族翻转 + 框填充尺寸交换） */
export function shapeTransformCss(image: DocxImageNode, options?: { frameWidthPx?: number; frameHeightPx?: number; fillFrame?: boolean; baseTransform?: string }): Record<string, string> {
  const transform = parseShapeTransformXml(image.sourceXml);
  const rotation = transform?.rotationDegrees;
  const frameWidthPx = Number.isFinite(options?.frameWidthPx) ? Math.max(1, Math.round(options?.frameWidthPx as number)) : void 0;
  const frameHeightPx = Number.isFinite(options?.frameHeightPx) ? Math.max(1, Math.round(options?.frameHeightPx as number)) : void 0;
  const fillFrame = options?.fillFrame === true;
  const quarterTurn = Number.isFinite(rotation) && Math.abs(Math.abs(rotation as number) % 180 - 90) < 0.5 ? (Math.round((rotation as number) / 90) % 4 + 4) % 4 * 90 : void 0;
  const flipCss = transform?.flipH || transform?.flipV ? `scale(${transform?.flipH ? -1 : 1}, ${transform?.flipV ? -1 : 1})` : void 0;
  if (fillFrame && Number.isFinite(frameWidthPx) && Number.isFinite(frameHeightPx) && Number.isFinite(quarterTurn)) {
    const width = frameWidthPx;
    const height = frameHeightPx;
    const rotateCss = quarterTurn === 90 ? `translate(${width}px, 0px) rotate(90deg)` : quarterTurn === 180 ? `translate(${width}px, ${height}px) rotate(180deg)` : quarterTurn === 270 ? `translate(0px, ${height}px) rotate(-90deg)` : void 0;
    return {
      width: `${height}px`,
      height: `${width}px`,
      maxWidth: `none`,
      transformOrigin: `top left`,
      transform: joinCssTransforms(options?.baseTransform, rotateCss, flipCss) as string
    };
  }
  const rotateCss = Number.isFinite(rotation) && Math.abs(rotation as number) >= 0.01 ? `rotate(${rotation}deg)` : void 0;
  const combined = joinCssTransforms(options?.baseTransform, rotateCss, flipCss);
  return combined ? {
    transformOrigin: `center center`,
    transform: combined
  } : {};
}

/** 原 ov（jsx 20726）：顶锚定浮动组判定（wgp + wsp） */
export function isTopAnchoredFloating(image: DocxImageNode): boolean {
  return !image.syntheticTextBox || !image.sourceXml ? false : /<wpg:wgp\b/i.test(image.sourceXml) && /<wps:wsp\b/i.test(image.sourceXml);
}

/** 原 sv（jsx 20729）：格式化描述列表连接 */
export function describeFormattingList(label: string, items: string[], fallback: string): string {
  return items.length === 0 ? fallback : `${label}: ${Array.from(new Set(items)).join(`, `)}`;
}

/** 原 cv（jsx 20732）：运行格式化描述 */
export function describeRunFormattingXml(xml: string): string {
  const items: string[] = [];
  return /<w:rFonts\b/i.test(xml) && items.push(`font`), /<w:sz\b/i.test(xml) && items.push(`size`), /<w:color\b/i.test(xml) && items.push(`color`), /<w:highlight\b/i.test(xml) && items.push(`highlight`), /<w:b(?:Cs)?\b/i.test(xml) && items.push(`bold`), /<w:i(?:Cs)?\b/i.test(xml) && items.push(`italic`), /<w:u\b/i.test(xml) && items.push(`underline`), /<w:strike\b/i.test(xml) && items.push(`strikethrough`), /<w:vertAlign\b/i.test(xml) && items.push(`baseline`), describeFormattingList(`Run formatting`, items, `Run formatting`);
}

/** 原 lv（jsx 20736）：段落格式化描述 */
export function describeParagraphFormattingXml(xml: string): string {
  const items: string[] = [];
  return /<w:ind\b/i.test(xml) && items.push(`margins/indent`), /<w:spacing\b/i.test(xml) && items.push(`line spacing`), /<w:jc\b/i.test(xml) && items.push(`alignment`), /<w:tabs\b/i.test(xml) && items.push(`tabs`), /<w:numPr\b/i.test(xml) && items.push(`numbering`), /<w:pBdr\b/i.test(xml) && items.push(`borders`), /<w:shd\b/i.test(xml) && items.push(`shading`), /<w:rPr\b/i.test(xml) && items.push(`text style`), describeFormattingList(`Paragraph formatting`, items, `Paragraph formatting`);
}

/** 原 uv（jsx 20740）：表格/行/单元格格式化描述 */
export function describeTableFormattingXml(kind: `table` | `row` | `cell`, xml: string): string {
  const items: string[] = [];
  /<w:tblW\b|<w:tcW\b|<w:gridSpan\b/i.test(xml) && items.push(`width`), /<w:tblLayout\b/i.test(xml) && items.push(`layout`), /<w:tblInd\b|<w:ind\b/i.test(xml) && items.push(`indent`), /<w:tblCellMar\b|<w:tcMar\b/i.test(xml) && items.push(`margins`), /<w:(?:tblBorders|tcBorders|trBorders|pBdr)\b/i.test(xml) && items.push(`borders`), /<w:trHeight\b/i.test(xml) && items.push(`row height`), /<w:vAlign\b/i.test(xml) && items.push(`vertical align`), /<w:jc\b/i.test(xml) && items.push(`alignment`), /<w:shd\b/i.test(xml) && items.push(`shading`);
  const label = kind === `table` ? `Table formatting` : kind === `row` ? `Row formatting` : `Cell formatting`;
  return describeFormattingList(label, items, label);
}

/** 修订条目（原 dv 的条目面） */
export interface TrackedChange {
  id: string;
  revisionId: string | undefined;
  kind: string;
  author: string | undefined;
  date: string | undefined;
  text: string | undefined;
}

/** 段落修订解析结果（原 dv 返回面） */
export interface ParagraphRevisions {
  inlineChangeByVisibleChildIndex: (TrackedChange | undefined)[];
  deletedSegmentsByVisibleChildIndex: Map<number, { text: string; change: TrackedChange; style: DocxRunStyle | undefined }[]>;
  changes: TrackedChange[];
}

/** 原 dv（jsx 20746）：段落修订解析（ins/del/move 区域 → 行内/删除段/变更表；缓存 Il） */
export function parseParagraphRevisions(paragraph: DocxParagraphNode): ParagraphRevisions | undefined {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return;
  const cache = engineCacheIl as Map<string, ParagraphRevisions | null>;
  const cached = cache.get(xml);
  if (cached !== void 0) return cached ?? void 0;
  const regions: (XmlRegion & { kind?: string; revisionId?: string; author?: string; date?: string })[] = [];
  for (const tagName of [`w:ins`, `w:del`, `w:moveFrom`, `w:moveTo`]) {
    const kind = revisionKindOfTag(tagName);
    kind && matchXmlRegions(xml, tagName).forEach((region) => {
      regions.push({
        ...region,
        kind,
        revisionId: xmlAttrValue(region.openTag, `w:id`),
        author: decodeXmlEntities(xmlAttrValue(region.openTag, `w:author`) ?? ``),
        date: xmlAttrValue(region.openTag, `w:date`)
      });
    });
  }
  const inlineChangeByVisibleChildIndex: (TrackedChange | undefined)[] = [];
  const deletedSegmentsByVisibleChildIndex = new Map<number, { text: string; change: TrackedChange; style: DocxRunStyle | undefined }[]>();
  const changes: TrackedChange[] = [];
  const changeRegistry = new Map<string, TrackedChange>();
  let inlineCounter = 0;
  let visibleIndex = 0;
  const registerChange = (kind: string | undefined, revisionId: string | undefined, author: string | undefined, date: string | undefined, text: string | undefined): TrackedChange => {
    const normalizedAuthor = author?.trim() || void 0;
    const normalizedDate = date?.trim() || void 0;
    const normalizedText = normalizeWhitespace(text);
    const normalizedRevisionId = revisionId?.trim() || void 0;
    const registryKey = normalizedRevisionId ? `${kind}:id:${normalizedRevisionId}` : `${kind}:anon:${normalizedAuthor ?? ``}:${normalizedDate ?? ``}:${normalizedText ?? ``}`;
    const existing = changeRegistry.get(registryKey);
    if (existing) return (!existing.text && normalizedText || existing.text && normalizedText && normalizedText.length > existing.text.length) && (existing.text = normalizedText), !existing.author && normalizedAuthor && (existing.author = normalizedAuthor), !existing.date && normalizedDate && (existing.date = normalizedDate), existing;
    const id = normalizedRevisionId ? `${kind}-${normalizedRevisionId}` : `${kind}-inline-${inlineCounter}`;
    inlineCounter += 1;
    const change: TrackedChange = {
      id,
      revisionId: normalizedRevisionId,
      kind: kind as string,
      author: normalizedAuthor,
      date: normalizedDate,
      text: normalizedText
    };
    return changeRegistry.set(registryKey, change), changes.push(change), change;
  };
  for (const runMatch of xml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/gi)) {
    const runXml = runMatch[0] ?? ``;
    if (!runXml) continue;
    const runStart = runMatch.index ?? 0;
    const runEnd = runStart + runXml.length;
    const enclosing = regions.filter((region) => runStart >= region.start && runEnd <= region.end).sort((a, b) => a.end - a.start - (b.end - b.start))[0];
    const kind = enclosing?.kind;
    const revisionId = enclosing?.revisionId;
    const author = enclosing?.author;
    const date = enclosing?.date;
    const isDeletion = kind === `deletion` || kind === `move-from`;
    const stripped = stripTextBoxContentXml(runXml);
    const runStyle = parseRunStyleXml(stripped);
    const keptSegments = extractRunTextSegments(stripped, false);
    const deletedSegments = extractRunTextSegments(stripped, true);
    const hasDrawing = /<w:(?:drawing|pict)\b/i.test(runXml);
    const visibleCount = keptSegments.filter((segment) => segment.text.length > 0 || segment.isNote).length + +!!hasDrawing;
    const keptText = normalizeWhitespace(keptSegments.map((segment) => segment.text).join(``));
    const deletedText = normalizeWhitespace(deletedSegments.map((segment) => segment.text).join(``));
    if (isDeletion) {
      const deletionText = deletedText ?? (hasDrawing ? `[image]` : void 0);
      if (!deletionText) continue;
      const change = registerChange(kind, revisionId, author, date, deletionText);
      if (deletedText) {
        const segments = deletedSegmentsByVisibleChildIndex.get(visibleIndex) ?? [];
        segments.push({
          text: deletedText,
          change,
          style: runStyle
        }), deletedSegmentsByVisibleChildIndex.set(visibleIndex, segments);
      }
      continue;
    }
    if (matchXmlRegions(runXml, `w:rPrChange`).forEach((region) => {
      const openTag = region.openTag ?? ``;
      const regionXml = runXml.slice(region.start, region.end);
      const regionAuthor = decodeXmlEntities(xmlAttrValue(openTag, `w:author`) ?? ``) || author;
      const regionDate = xmlAttrValue(openTag, `w:date`) ?? date;
      registerChange(`format-change`, xmlAttrValue(openTag, `w:id`) ?? revisionId, regionAuthor, regionDate, describeRunFormattingXml(regionXml));
    }), kind === `insertion` || kind === `move-to`) {
      const insertionText = keptText ?? (hasDrawing ? `[image]` : void 0);
      if (!insertionText) {
        visibleIndex += visibleCount;
        continue;
      }
      const change = registerChange(kind, revisionId, author, date, insertionText);
      for (let offset = 0; offset < visibleCount; offset += 1) inlineChangeByVisibleChildIndex[visibleIndex + offset] = change;
    }
    visibleIndex += visibleCount;
  }
  matchXmlRegions(xml, `w:pPrChange`).forEach((region) => {
    const openTag = region.openTag ?? ``;
    const regionXml = xml.slice(region.start, region.end);
    registerChange(`paragraph-format-change`, xmlAttrValue(openTag, `w:id`), decodeXmlEntities(xmlAttrValue(openTag, `w:author`) ?? ``), xmlAttrValue(openTag, `w:date`), describeParagraphFormattingXml(regionXml));
  }), regions.forEach((region) => {
    const regionXml = xml.slice(region.start, region.end);
    const isDeletion = region.kind === `deletion` || region.kind === `move-from`;
    const regionText = normalizeWhitespace(extractRunTextSegments(stripTextBoxContentXml(regionXml), isDeletion).map((segment) => segment.text).join(``));
    const hasDrawing = /<w:(?:drawing|pict)\b/i.test(regionXml);
    const displayText = regionText ?? (hasDrawing ? `[image]` : void 0);
    displayText && registerChange(region.kind, region.revisionId, region.author, region.date, displayText);
  });
  const hasInline = inlineChangeByVisibleChildIndex.some(Boolean);
  const hasDeleted = deletedSegmentsByVisibleChildIndex.size > 0;
  if (!hasInline && !hasDeleted && changes.length === 0) {
    boundedCacheSet(cache, xml, null);
    return;
  }
  const result: ParagraphRevisions = {
    inlineChangeByVisibleChildIndex,
    deletedSegmentsByVisibleChildIndex,
    changes
  };
  return boundedCacheSet(cache, xml, result), result;
}

/** 段落批注区间结果（原 fv 返回面） */
export interface ParagraphCommentRanges {
  commentIdsByVisibleChildIndex: number[][];
}

/** 原 fv（jsx 20863）：段落批注区间解析（可见子节点 → 批注 id 集；缓存 Ll） */
export function parseParagraphCommentRanges(paragraph: DocxParagraphNode): ParagraphCommentRanges | undefined {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml || !/commentRange|commentReference/i.test(xml)) return;
  const cache = engineCacheLl as Map<string, ParagraphCommentRanges | null>;
  const cached = cache.get(xml);
  if (cached !== void 0) return cached ?? void 0;
  const rangeStarts = new Map<number, number>();
  const rangeEnds = new Map<number, number>();
  for (const match of xml.matchAll(/<w:commentRangeStart\b[^>]*w:id="(-?\d+)"[^>]*\/?>/gi)) {
    const commentId = Number.parseInt(match[1] ?? ``, 10);
    Number.isFinite(commentId) && match.index !== void 0 && rangeStarts.set(commentId, match.index + match[0].length);
  }
  for (const match of xml.matchAll(/<w:commentRangeEnd\b[^>]*w:id="(-?\d+)"[^>]*\/?>/gi)) {
    const commentId = Number.parseInt(match[1] ?? ``, 10);
    Number.isFinite(commentId) && match.index !== void 0 && rangeEnds.set(commentId, match.index);
  }
  const ranges: { commentId: number; start: number; end: number }[] = [];
  if (new Set([...rangeStarts.keys(), ...rangeEnds.keys()]).forEach((commentId) => {
    const start = rangeStarts.get(commentId) ?? 0;
    const end = rangeEnds.get(commentId) ?? xml.length;
    end > start && ranges.push({
      commentId,
      start,
      end
    });
  }), ranges.length === 0) {
    boundedCacheSet(cache, xml, null);
    return;
  }
  const commentIdsByVisibleChildIndex: number[][] = [];
  let visibleIndex = 0;
  for (const runMatch of xml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/gi)) {
    const runXml = runMatch[0] ?? ``;
    if (!runXml) continue;
    const runStart = runMatch.index ?? 0;
    const segments = extractRunTextSegments(stripTextBoxContentXml(runXml), false);
    const hasDrawing = /<w:(?:drawing|pict)\b/i.test(runXml);
    const visibleCount = segments.filter((segment) => segment.text.length > 0 || segment.isNote).length + +!!hasDrawing;
    if (visibleCount === 0) continue;
    const activeIds = ranges.filter((range) => runStart >= range.start && runStart < range.end).map((range) => range.commentId);
    if (activeIds.length > 0) for (let offset = 0; offset < visibleCount; offset += 1) commentIdsByVisibleChildIndex[visibleIndex + offset] = activeIds;
    visibleIndex += visibleCount;
  }
  if (commentIdsByVisibleChildIndex.length === 0) {
    boundedCacheSet(cache, xml, null);
    return;
  }
  const result: ParagraphCommentRanges = {
    commentIdsByVisibleChildIndex
  };
  return boundedCacheSet(cache, xml, result), result;
}

/** 原 pv（jsx 20913）：域指令 → 页字段种类（PAGE/NUMPAGES；排除 PAGEREF） */
export function pageFieldKindOfInstruction(instruction: string): `PAGE` | `NUMPAGES` | undefined {
  const normalized = decodeXmlEntities(instruction)?.replace(/\s+/g, ` `).trim().toUpperCase() ?? ``;
  if (!(!normalized || normalized.includes(`PAGEREF`))) {
    if (/\bNUMPAGES\b/.test(normalized)) return `NUMPAGES`;
    if (/\bPAGE\b/.test(normalized)) return `PAGE`;
  }
}

/** 原 mv（jsx 20920）：域指令 → STYLEREF 目标 */
export function styleRefTargetOfInstruction(instruction: string): string | undefined {
  const normalized = decodeXmlEntities(instruction)?.replace(/\s+/g, ` `).trim();
  if (!normalized) return;
  const match = normalized.match(/\bSTYLEREF\b\s+(?:"([^"]+)"|([^\s\\]+))/i);
  const target = (match?.[1] ?? match?.[2] ?? ``).trim();
  return target.length > 0 ? target : void 0;
}

/** 原 hv（jsx 20930）：段落页字段种类集（instrText + fldSimple） */
export function paragraphPageFieldKinds(paragraph: DocxParagraphNode): (`PAGE` | `NUMPAGES`)[] {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return [];
  const kinds: (`PAGE` | `NUMPAGES`)[] = [];
  for (const match of xml.matchAll(/<w:instrText\b[^>]*>([\s\S]*?)<\/w:instrText>/gi)) {
    const kind = pageFieldKindOfInstruction(match[1] ?? ``);
    kind && kinds.push(kind);
  }
  for (const match of xml.matchAll(/<w:fldSimple\b[^>]*\bw:instr="([^"]+)"[^>]*>/gi)) {
    const kind = pageFieldKindOfInstruction(match[1] ?? ``);
    kind && kinds.push(kind);
  }
  return kinds;
}

/* ============================================================================
 * 符号表（混淆名 → 本文件语义名 → jsx 行号 → 把握度）
 * 把握度：高 = 逐句对照转录；中 = 语义推断命名，分支/常量未变
 * ==========================================================================*/
/*
 * §D 依赖补全（批 B 名义区段，本批必需）：
 *   Br → twipsToPxNonNegative (12019, 高)
 *   _o → PAGE_BREAK_RUN_RE (13983, 高) | vo → PAGE_BREAK_BEFORE_TAG_RE (13984, 高)
 *   xo → paragraphHasPageBreakRun (13993, 高) | So → paragraphPageBreakBeforeOf (13997, 高)
 *   Mo → nodePageBreakStarts (14061, 高)
 *   Cp → layoutTextCache (17137, 高) | wp → fragmentCache (17138, 高) | Tp → singleFontCache (17139, 高)
 *   jp → tabPlaceholderSpaces (17233, 高) | Mp → paragraphLayoutText (17248, 高)
 *   Np → splitParagraphByLineBreaks (17330, 高) | Pp → splitPartContentHeight (17373, 高)
 *   Fp → fitSplitPartsHeight (17380, 高) | zp → layoutTextFragments (17418, 高)
 *   Bp → singleFontOfLayoutText (17440, 高) | Vp → fragmentsForRuns (17465, 高)
 *   Hp → paragraphLineLayout (17480, 高)
 *   Gm → pageBreakHintMap (18049, 高) | Km → paragraphIsKeepNextCandidate (18055, 高)
 *   qm → keepNextChainFitsPageTail (18058, 高) | Jm → paragraphDominantFontSizePt (18088, 高)
 *   _m → spacingBeforeForPagination (17851, 高；批 B 4 参变体差异见报告 §2.2)
 *   gm → spacingAfterForPagination (17846, 高)
 *   ry/iy/ay/fb/bb/gb/mb → 局部克隆 cloneBordersLocal 等（正式实体在 C2，高）
 * §A1 测量原语族（18106-19189）：
 *   Ym → paragraphFontSizePx (18106, 高) | Xm → paragraphMaxFontPx (18113, 高)
 *   Zm → firstFontFamilyName (18121, 高) | Qm → paragraphDefaultFontFamily (18124, 高)
 *   $m → denseLineFactorForFont (18148, 高) | eh → looseLineFactorForFont (18154, 高)
 *   th → paragraphIsCjkLike (18158, 高) | nh → lineSpacingFactorFor (18161, 高)
 *   rh → paragraphHasHardLineBreak (18166, 高) | ih → charClassWidthFactor (18168, 高)
 *   ah → heuristicCharClassWidth (18171, 高) | oh → runFontPx (18175, 高)
 *   sh → fontStringOf (18180, 高) | ch → runFontString (18183, 高)
 *   lh → splitTextByFont (18185, 高) | uh → measureTextWidth (18192, 高)
 *   dh → paragraphTabStopsPx (18214, 高) | fh → paragraphIndentStartPx (18217, 高)
 *   ph → leftTabStopsAfterIndent (18224, 高) | mh → nextTabStopAfter (18228, 高)
 *   hh → expandTabsToSpaces (18233, 高) | gh → segmentsWidthPx (18235, 高)
 *   _h → greedyLineCount (18241, 高) | vh → paragraphTabSegments (18274, 高)
 *   yh → splitTabSegments (18295, 高) | bh → tocTabLineCount (18322, 高)
 *   xh → lineCountCache (18343, 高) | Sh → lineCountCacheGet (18345, 高)
 *   Ch → lineCountCacheSet (18347, 高) | wh → paragraphLineCount (18352, 高)
 *   Th → paragraphContentWidth (18440, 高) | Eh → paragraphEstimatedLineCount (18454, 高)
 *   Dh → wrappedImageFootprintHeight (18466, 高) | Oh → layoutBottomPx (18479, 高)
 *   kh → layoutHasFullWidthExclusion (18484, 高) | Ah → layoutHeightPx (18493, 高)
 *   jh → layoutRangeHeightPx (18496, 高) | Mh → layoutFitLineEnd (18505, 高)
 *   Nh → lineTwipsToMultiple (18523, 高) | Ph → doubleLineBlend (18525, 高)
 *   Fh → lineHeightFromMultiple (18532, 高) | Ih → snapToGridModeOf (18536, 高)
 *   Lh → gridSnapHeight (18548, 高) | Rh → paragraphLineHeight (18553, 高)
 *   zh → paragraphOuterHeight (18572, 高) | Bh → xmlHasSpacingBefore (18602, 高)
 *   Vh → xmlHasParagraphSpacing (18608, 高) | Hh → applyDefaultSpacingForGrid (18614, 高)
 *   Uh → spacingBeforeAbsent (18630, 高) | Wh → estimateCellContentHeight (18635, 高)
 *   Gh → rowIsSplittable (18673, 高) | Kh → rowNeedsHeightEstimation (18676, 高)
 *   qh → rowHasNestedTable (18686, 高) | Jh → rowHeightWithCaps (18689, 高)
 *   Yh → tableStyleIdOf (18699, 高) | Xh → tableHasVisibleBorders (18703, 高)
 *   Zh → tableHasUnspacedParagraphs (18707, 高) | Qh → tableIsTableGrid (18710, 高)
 *   $h → tableRowHeights (18713, 高) | eg → computeTableRowHeights (18729, 高)
 *   tg → tableRowStyle (18759, 高) | ng → dedupeSafeBoundaries (18766, 高)
 *   rg → paragraphSafeLayout (18776, 高) | ig → tableSafeLayout (18803, 高)
 *   ag → cellSafeBoundaries (18812, 高) | og → boundaryIsSafe (18840, 高)
 *   sg → tableRowSliceFitHeight (18844, 高) | cg → tableOuterHeightPx (18899, 高)
 *   lg → estimateNodeHeight (18915, 高) | ug → paragraphSpacingBeforeRaw (18918, 高)
 *   dg → paragraphSpacingAfterRaw (18921, 高) | fg → widowControlEnabled (18924, 高)
 *   pg → isPlainPageBreakSpacer (18926, 高) | mg → spacingBeforeAfterPageBreak (18929, 高)
 *   hg → paragraphCanSplitLines (18935, 高) | gg → lineRangeIsPartial (18939, 高)
 *   _g → lineRangeForBand (18942, 高) | vg → segmentRenderBottomPx (18957, 高)
 *   yg → segmentCoversWholeParagraph (18961, 高) | bg → splitEdgePadding (18964, 高)
 *   xg → splitEdgeSmoothingPadding (18974, 高) | Sg → splitSegmentExtraHeight (18987, 高)
 *   Cg → splitSegmentSmoothingExtraHeight (18994, 高) | wg → segmentMatchesLineRange (19000, 高)
 *   Tg → nodeLayoutHeight (19003, 高) | Eg → resolveParagraphLineRange (19025, 高)
 *   Dg → trySplitParagraphSegment (19045, 高) | Og → distributeSegmentsAcrossPages (19092, 高)
 *   kg → rowRangeHeight (19155, 高) | Ag → fitRowsWithin (19162, 高)
 *   jg → paginateByBreakHints (19173, 高)
 * §A2 分页主循环：
 *   Mg → paginateDocument (19190-19541, 高；全量逐字)
 * §10b 浮动图分类：
 *   Ng → isInlineImageNode (19542, 高) | Fg → isPageMarginCornerAnchoredFloating (19555, 高)
 *   Kg → isFloatingImageNode (19817, 高)
 * §B 隙段（20231-20943）：
 *   w_ → tocLevelOf (20231, 高) | T_ → isTocParagraph (20241, 高)
 *   E_ → paragraphHasTocTab (20242, 高) | D_ → tocTabStopOf (20245, 高)
 *   O_ → tocFirstTabStopPx (20254, 高) | k_ → paragraphHasTabChar (20257, 高)
 *   A_ → countTabChars (20260, 高) | j_ → tabLayoutKindOf (20269, 高)
 *   M_ → tabStopByAlignment (20279, 高) | N_ → decodeXmlEntities (20282, 高)
 *   P_ → matchXmlRegions (20291, 高) | F_ → revisionKindOfTag (20329, 高)
 *   I_ → normalizeWhitespace (20341, 高) | L_ → formatRevisionDateUtc (20346, 高)
 *   R_ → stripTextBoxContentXml (20357, 高) | z_ → extractRunTextSegments (20361, 高)
 *   B_ → xmlFlagEnabled (20402, 高) | V_ → xmlColorAttr (20407, 高)
 *   H_ → parseRunStyleXml (20413, 高) | U_ → extractXmlRegionContents (20451, 高)
 *   W_ → mergeRunStyles (20454, 高) | G_ → parseParagraphAlign (20469, 高)
 *   K_ → escapeXmlAttrValue (20474, 高) | q_ → svgDataUrl (20477, 高)
 *   J_ → emuToPxRounded (20479, 高) | Y_ → resolveFieldDisplayText (20482, 高)
 *   X_ → parseTextBoxLines (20504, 高) | Z_ → parseTextBoxShapeStyle (20574, 高)
 *   Q_ → textBoxPlainText (20594, 高) | $_ → textBoxRenderLines (20600, 高)
 *   ev → textBoxZIndex (20621, 高) | tv → renderTextBoxSvg (20625, 高)
 *   nv → syntheticTextBoxIsGraphicShape (20674, 高) | rv → parseShapeTransformXml (20679, 高)
 *   iv → joinCssTransforms (20695, 高) | av → shapeTransformCss (20699, 高)
 *   ov → isTopAnchoredFloating (20726, 高) | sv → describeFormattingList (20729, 高)
 *   cv → describeRunFormattingXml (20732, 高) | lv → describeParagraphFormattingXml (20736, 高)
 *   uv → describeTableFormattingXml (20740, 高) | dv → parseParagraphRevisions (20746, 高)
 *   fv → parseParagraphCommentRanges (20863, 高) | pv → pageFieldKindOfInstruction (20913, 高)
 *   mv → styleRefTargetOfInstruction (20920, 高) | hv → paragraphPageFieldKinds (20930, 高)
 * 常量复用登记（minifier 常量合并，值未变）：
 *   Lr(11997)=15 并入 TWIPS_PER_POINT_REF(bl=15) | Zc 双用（批注槽宽/缺省制表网格 48）
 *   Qc 双用（批注槽最小/TOC 右栏间隙 20） | Ac 复用为段落底边容差 4
 *   el/tl/nl/ol/sl/cl 复用于拆段衬垫族 | nd=Z_LAYER_MAX 用于文本框 z 序
 */
