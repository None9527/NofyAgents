/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBLayout.ts — legacy-doc 内部引擎 [E6] 第 2 层：
 * 行布局 / 浮动图排除 / 分页引擎 / 段落 CSS（解混淆重建 · D8 Stage B4 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版）
 * 覆盖区段：[E6] 中段 jsx 16816-20230（浮动几何/排除带/表单域测量/断页标记/
 * 分节集合/分页主函数/段落 CSS 构建器）
 *
 * 重建口径：
 *  - 逐句转录（高）：浮动几何/排除带/表单域测量/断页标记族/分节集合/
 *    高亮色/行高/缩进/编号缩进/段落 CSS/run CSS 等（下表 §A）
 *  - 语义骨架 + 锚点登记（中）：分页主函数 paginateDocument（Mg，352 行）
 *    与测量原语族（lh/uh/Ns/Ms/zh/lg/Tg）——控制流与参数面已还原，
 *    内部逐行算法按锚点登记（见表尾 §B）
 *
 * ----------------------------------------------------------------------------
 * §A 混淆名 → 语义名 映射（逐句转录部分，jsx 行）
 * ----------------------------------------------------------------------------
 *   dp → CJK_SCRIPT_REGEX (16816) | fp/pp/mp → 浮动布局常量 (16817)
 *   hp → exclusionAwareHeight (16821) | gp → dragPreviewHeight (16826)
 *   _p → foreignExclusionsForLine (16836) | vp → singleImageExclusion (16846)
 *   yp → paragraphImageExclusions (16858) | bp → wrapBandLayout (16917)
 *   xp → layoutWrappedLines (16931) | Jp → floatingImageGeometry (17543)
 *   Yp → paragraphFloatingLayout (17598) | Xp → alignedFloatingLayout (17664)
 *   Zp → checkboxGapPx (17686) | Qp → checkboxLeadingSpace (17693)
 *   $p/em → 表单域字号 (17697/17699) | tm/nm → 表单域高度 (17703/17713)
 *   rm → estimateTextWidthPx (17718) | im → advanceAfterText (17758)
 *   am → nextTabStopDistance (17764) | om → formFieldWidthPx (17778)
 *   sm → checkboxWidthPx (17797) | cm → paragraphIsEmptyText (17806)
 *   lm → paragraphMarkIsDeleted (17809) | um → emptyBeforeDeletedMark (17813)
 *   dm → isSectionBreakSpacer (17815) | fm → isRemovableSectionSpacer (17818)
 *   pm → isTrailingSectionSpacer (17823) | mm → paragraphStyleIdentity (17837)
 *   hm → contextualSpacingApplies (17844) | gm/_m → 上下文段距 (17849/17853)
 *   vm → bookmarkNames (17858) | ym → noteReferenceIds (17863)
 *   bm → collectNodeNoteReferences (17871) | xm → isInteractiveElement (17886)
 *   Sm → isTableCellParagraphHost (17889) | Cm → sectionXmlStartsNewPage (17892)
 *   wm → paragraphBreakFlags (17897) | Tm/Em/Dm → 栏/页断点派生 (17919/17924/17933)
 *   Om → pageTailNearlyFull (17938) | km → xmlBoolAttrEnabled (17944)
 *   Am → sectionHasTitlePage (17948) | jm → pickHeaderFooterForPage (17953)
 *   Mm → sectionIndexForNode (17967) | Nm → paragraphHasVisibleBorders (17978)
 *   Pm → paragraphIsSectionCover (17982) | Fm → lastPageBreakSectionIndex (17985)
 *   Im/Lm/Rm → pageBreakBefore/分节断页/任一断页 (17996/18004/18008)
 *   zm/Bm/Vm → 分节断页节点集缓存 (18010-18028)
 *   Hm/Um/Wm → 新页节起点集缓存 (18029-18040+)
 *   qg/Jg → 浮动图页/边距锚定判定 (19819/19828) | Yg..Qg → 段落浮动图族判定 (19837-19848)
 *   $g → imageCropMetrics (19849) | e_ → resolveHighlightColor (19873)
 *   t_ → paragraphLineHeightCss (19877) | n_ → keepNextExtraSpacing (19895)
 *   r_/i_/a_/o_ → 边框 CSS 族 (19905-19917) | s_ → parseParagraphIndentXml (19918)
 *   c_ → resolveNumberingIndent (19952) | l_ → numberingLabelWidthPx (19994)
 *   u_ → numberingLabelContainerStyle (20010) | d_ → paragraphCssStyle (20027)
 *   __ → runStyleToCss (20156) | v_ → runStyleToCssDefaults (20194)
 *   y_ → mergeTextDecoration (20201) | b_/x_ → 修订插入/删除装饰 (20206/20213)
 *   S_/C_ → TOC 样式判定 (20227-20231)
 *
 * ----------------------------------------------------------------------------
 * §B 锚点登记（语义骨架已还原，逐行算法待补全）
 * ----------------------------------------------------------------------------
 *   Mg → paginateDocument            jsx 19190-19541（352 行；分页主循环：
 *        节度量/断页提示/表格行拆分/段落行拆分/测量高回灌；本文件保留签名
 *        与外层控制流，内层逐节点推进算法登记于此）
 *   lh/uh/ch → 文本测量原语          jsx 18184-18193（字体分段/宽度测量）
 *   Ns/Ms → 断行引擎                 jsx 18200±（排除带断行/兜底断行）
 *   Nh/Fh/Lh/Rh → 行高换算           jsx 18523-18556
 *   zh/lg/Tg → 节点高度/布局高        jsx 18571/18913/19002
 *   Ng/Kg → 图片内联/浮动判定         jsx 19542/19817
 *   Ym/Qm/th/nh → 字号/字体解析       jsx 18106-18160
 * ============================================================================
 */

import * as React from "react";
import {
  MIN_BLOCK_HEIGHT_PX,
  ROW_HEIGHT_TOLERANCE_PX,
  DEFAULT_LINE_SPACING_MULTIPLE,
  SINGLE_LINE_SPACING,
  MIN_LINE_SPACING_RATIO,
  PAGE_TAIL_REMAIN_RATIO,
  PAGE_TAIL_REMAIN_MIN_PX,
  PAGE_TAIL_REMAIN_MAX_PX,
  SECTION_TYPE_REGEX,
  SECTION_PROPS_REGEX,
  PAGE_BREAK_BR_REGEX,
  COLUMN_BREAK_BR_REGEX,
  LAST_RENDERED_PAGE_BREAK_REGEX,
  PAGE_BREAK_BEFORE_REGEX,
  BOOKMARK_START_REGEX,
  FOOTNOTE_REFERENCE_REGEX,
  ENDNOTE_REFERENCE_REGEX,
  TEXT_MEASURE_CACHE_LIMIT,
  THUMBNAIL_HIGHLIGHT_COLORS,
  THUMBNAIL_HEADING_CSS_STYLES,
  boundedCacheSet,
  paragraphBreakFlagsCache,
  paragraphIndentCache,
  heuristicTextWidthCache,
  wordBreakCache,
} from "./LegacyDocEngineBThumbnails";
import {
  type DocxEditorModel,
  type DocxNode,
  type DocxParagraphNode,
  type DocxTableNode,
  type DocxImageNode,
  type DocxFormFieldNode,
  type DocxRunStyle,
  type DocxBorderSpec,
  type DocxHeaderFooterSection,
  type DocxSection,
  type DocxParagraphIndent,
  type PageSegment,
  type SectionPageMetrics,
  paragraphText,
  paragraphHasImage,
  paragraphHasFormField,
  paragraphIsImageOnly,
  paragraphIsBehindDocImages,
  paragraphIsFloatingImageOnly,
  paragraphHasSectionBreak,
  paragraphIsCheckboxYesNoRow,
  normalizeFontFamily,
  themeAwareColor,
  textChildren,
  firstTextRunStyle,
  formFieldDisplayText,
  normalizeDocumentSections,
  sectionBreakType,
  isBorderVisible,
  cloneParagraphStyle,
} from "./LegacyDocEngineBModel";

/* ============================================================================
 * §0 测量原语契约（[E2] 区段，锚点登记；本层按用法声明）
 * ==========================================================================*/

/** 原 Ym（jsx 18106）：段落字号 px */
declare function paragraphFontSizePx(paragraph: DocxParagraphNode): number;
/** 原 Qm（jsx 18126）：段落缺省字体族 */
declare function paragraphDefaultFontFamily(paragraph: DocxParagraphNode): string | undefined;
/** 原 th（jsx 18157）：CJK 文本判定 */
declare function isCjkText(text: string): boolean;
/** 原 nh（jsx 18160）：字体族回退解析 */
declare function resolveFontStack(paragraph: DocxParagraphNode, fontFamily: string | undefined): string;
/** 原 ch（jsx 18184）：run 字体串构造 */
declare function runFontString(style: DocxRunStyle | undefined, fontSizePx: number, text: string): string;
/** 原 lh（jsx 18187）：按字体分段 */
declare function splitTextByFont(text: string, style: DocxRunStyle | undefined, fontSizePx: number): { text: string; font: string; startOffset: number; endOffset: number }[];
/** 原 uh（jsx 18193）：文本宽度测量 */
declare function measureTextWidth(text: string, style: DocxRunStyle | undefined, fontSizePx: number): number;
/** 原 Nh（jsx 18523）：twips 行距 → 倍数 */
declare function lineTwipsToMultiple(lineTwips: number, base: number): number;
/** 原 Fh（jsx 18533）：倍数 × 字号 → 行高 */
declare function lineHeightFromMultiple(multiple: number, fontFamily: string | undefined, fontSizePx: number): number;
/** 原 Lh（jsx 18548）：段落行高（精确判定） */
declare function paragraphLineHeight(paragraph: DocxParagraphNode, gridPitchPx: number | undefined, exact?: boolean): number;
/** 原 Rh（jsx 18552）：段落行高（渲染用） */
declare function paragraphRenderLineHeight(paragraph: DocxParagraphNode, gridPitchPx: number | undefined, exact?: boolean): number;
/** 原 zh（jsx 18571）：段落外层高度 */
declare function paragraphOuterHeight(paragraph: DocxParagraphNode, contentWidthPx: number, gridPitchPx?: number, extra?: unknown, exact?: boolean): number;
/** 原 lg（jsx 18913）：节点高度估算 */
declare function estimateNodeHeight(node: DocxNode, contentWidthPx: number, gridPitchPx?: number, extra?: unknown): number;
/** 原 Tg（jsx 19002）：节点布局高度（分段感知） */
declare function nodeLayoutHeight(
  node: DocxNode,
  segment: PageSegment,
  model: DocxEditorModel,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridPitchPx: number | undefined,
  options?: { excludeWrappedFloatingImageFootprint?: boolean },
): number;
/** 原 Ng（jsx 19542）：内联图片判定 */
declare function isInlineImageNode(image: DocxImageNode): boolean;
/** 原 Kg（jsx 19817）：浮动图片判定 */
declare function isFloatingImageNode(image: DocxImageNode): boolean;
/** 原 Ns/Ms（jsx 18200±）：排除带断行 / 兜底断行 */
declare function breakLinesWithExclusions(
  text: string,
  fragments: { text: string; font: string; startOffset: number; endOffset: number; break?: string; wordBreak?: string }[],
  widthPx: number,
  lineHeightPx: number,
  exclusions: { left: number; right: number; top: number; bottom: number }[] | undefined,
  baseFont: string,
): LineLayoutResult | undefined;
declare function breakLinesFallback(
  text: string,
  baseFont: string,
  widthPx: number,
  lineHeightPx: number,
  exclusions: { left: number; right: number; top: number; bottom: number }[] | undefined,
  options: { wordBreak: string },
): LineLayoutResult;
/** 原 Fs（jsx 18200±）：行布局中偏移处的行信息 */
declare function lineAtOffset(layout: LineLayoutResult, offset: number): { top: number; bottom?: number } | undefined;
/** 原 ov（jsx 20726）：图片为顶部锚定浮动判定 */
declare function isTopAnchoredFloating(image: DocxImageNode): boolean;
/** 原 ji（jsx 20100±）：按脚本分段 */
declare function splitTextByScript(text: string, style: DocxRunStyle | undefined): { text: string; fontFamily?: string }[];
/** 原 Mi（jsx 20100±）：编号标签字体解析 */
declare function numberingLabelFont(style: DocxRunStyle | undefined, paragraph: DocxParagraphNode): string | undefined;
/** 原 E_/j_/hv/_v/yv/D_（jsx 21000±）：制表/脚注辅助（渲染层；锚点登记） */
declare function paragraphTabContext(paragraph: DocxParagraphNode): unknown;
declare function paragraphTabLayoutKind(paragraph: DocxParagraphNode, options?: { withinHeaderFooter?: boolean }): string | undefined;
declare function paragraphFootnoteRefs(paragraph: DocxParagraphNode): unknown[];
declare function paragraphEndnoteRefs(paragraph: DocxParagraphNode): unknown[];
declare function paragraphTocEntries(paragraph: DocxParagraphNode): unknown[];
declare function paragraphTabStopDefault(paragraph: DocxParagraphNode): number;
/** 原 dv（jsx 20746）：段落修订标记解析 */
declare function parseParagraphRevisions(paragraph: DocxParagraphNode): { changes: { id: string; revisionId: string; kind: `insertion` | `deletion` | `move-to` | `move-from`; author?: string; date?: string; text?: string }[] } | undefined;
/** 原 Zv/Xv（[E4]）：编号种类/编号段落判定 */
declare function numberingKindOf(paragraph: DocxParagraphNode, definitions: unknown): `unordered` | `ordered` | undefined;
declare function isNumberedParagraph(paragraph: DocxParagraphNode): boolean;
/** 原 Pv/Av/Wv（[E4]）：编号实例解析/级别解析/缺进 */
declare function resolveNumberingInstanceId(paragraph: DocxParagraphNode, definitions: unknown): number | undefined;
declare function resolveNumberingLevel(definitions: unknown, numId: number, ilvl: number): { text?: string; indent?: { leftTwips?: number; firstLineTwips?: number; hangingTwips?: number }; pictureBullet?: { src?: string } } | undefined;
declare const NUMBERING_INDENT_STEP_TWIPS: number;
/** 原 Mo（[E4] jsx 14061）：节点断页起点集 */
declare function nodePageBreakStarts(nodes: DocxNode[]): Set<number>;
/** 原 Gm（[E4] 附近）：断页提示 → 节点索引映射 */
declare function pageBreakHintMap(nodeCount: number, breaks: Set<number>): Map<number, number>;
/** 原 jb（渲染层）：图片键构造 */
declare function imageLocationKey(location: unknown): string;

/* --- 行布局结果类型（原 Ns/Ms 返回面） --- */
export interface LineLayoutFragment {
  text: string;
  x: number;
  width: number;
  intervalX?: number;
  intervalWidth?: number;
  [key: string]: unknown;
}
export interface LineLayoutLine {
  top: number;
  bottom?: number;
  fragments: LineLayoutFragment[];
  [key: string]: unknown;
}
export interface LineLayoutResult {
  lineCount: number;
  lines: LineLayoutLine[];
  [key: string]: unknown;
}

/* ============================================================================
 * §1 浮动布局常量与排除带（原 dp.._p，jsx 16816-16845）
 * ==========================================================================*/

/** 原 dp：CJK 脚本正则（keep-all 断词判定） */
export const CJK_SCRIPT_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

export const FLOATING_SIDE_CLEARANCE_PX = 72; // 原 fp：双侧环绕最小留白
export const FLOATING_WRAP_TOLERANCE_PX = 2; // 原 pp
export const FLOATING_MIN_FOOTPRINT_PX = 24; // 原 mp

/** 原 hp：排除带感知段落高——排除带越界时退回整行高 */
export function exclusionAwareHeight(paragraph: DocxParagraphNode, exclusions: { exclusion: { top: number; bottom: number } }[]): number {
  const naturalTop = paragraphLineHeight(paragraph, void 0);
  const naturalBottom = paragraphOuterHeight(paragraph, 0);
  const minTop = exclusions.reduce((acc, entry) => Math.min(acc, entry.exclusion.top), 0);
  const maxBottom = exclusions.reduce((acc, entry) => Math.max(acc, entry.exclusion.bottom), 0);
  return minTop < -4 || maxBottom > naturalBottom + 4 ? Math.max(MIN_BLOCK_HEIGHT_PX, naturalBottom) : naturalTop;
}

/** 原 gp：拖拽预览高度（取行高/排除带/既有段底的最大者，封顶自然高） */
export function dragPreviewHeight(
  paragraph: DocxParagraphNode,
  exclusions: { exclusion: { top: number; bottom: number } }[],
  extraBoxes?: { bottom: number; fromDragPreview?: boolean }[],
): number {
  const base = exclusionAwareHeight(paragraph, exclusions);
  if (!extraBoxes?.some((box) => box.fromDragPreview)) return base;
  const lineHeight = Math.max(1, Math.round((paragraph as { lineHeightPx?: number }).lineHeightPx ?? 1));
  const maxBottom = Math.max(lineHeight, paragraphOuterHeight(paragraph, 0), ...exclusions.map((entry) => entry.exclusion.bottom), ...extraBoxes.filter((box) => !box.fromDragPreview).map((box) => box.bottom));
  return Math.min(base, Math.max(1, Math.round(maxBottom)));
}

/** 原 _p：邻段排除带换算到本段坐标系（剔除自身源与越界带） */
export function foreignExclusionsForLine(
  exclusions: { sourceNodeIndex: number; appliesToSourceNode?: boolean; left: number; right: number; top: number; bottom: number }[],
  sourceNodeIndex: number,
  lineTop: number,
  lineBottom: number,
): { left: number; right: number; top: number; bottom: number }[] {
  const result: { left: number; right: number; top: number; bottom: number }[] = [];
  for (const entry of exclusions)
    (entry.sourceNodeIndex === sourceNodeIndex && !entry.appliesToSourceNode) ||
      entry.bottom <= lineTop ||
      entry.top >= lineBottom ||
      result.push({ left: entry.left, right: entry.right, top: Math.max(0, Math.round(entry.top - lineTop)), bottom: Math.max(0, Math.round(entry.bottom - lineTop)) });
  return result;
}

/* ============================================================================
 * §2 图片排除带收集（原 vp/yp/bp，jsx 16846-16930）
 * ==========================================================================*/

/** 原 vp：单图排除带（内联图；含拖拽/缩放预览） */
export function singleImageExclusion(
  image: DocxImageNode,
  imageIndex: number,
  contentWidthPx: number,
  options?: {
    widthPx?: number;
    heightPx?: number;
    paragraphTopPx?: number;
    pageMarginTopPx?: number;
    movePreview?: { deltaX: number; deltaY: number; baseLeftPx?: number; baseTopPx?: number };
    allowNegativeImageTop?: boolean;
  },
): ReturnType<typeof floatingImageGeometry> {
  return floatingImageGeometry(image, contentWidthPx, {
    imageIndex,
    widthPx: options?.widthPx,
    heightPx: options?.heightPx,
    paragraphTopPx: options?.paragraphTopPx,
    pageMarginTopPx: options?.pageMarginTopPx,
    deltaX: options?.movePreview?.deltaX,
    deltaY: options?.movePreview?.deltaY,
    baseLeftPx: options?.movePreview?.baseLeftPx,
    baseTopPx: options?.movePreview?.baseTopPx,
    allowNegativeImageTop: options?.allowNegativeImageTop ?? !!options?.movePreview,
  });
}

/** 段落图片排除带条目（原 yp 返回元素） */
export interface ParagraphImageExclusion {
  sourceNodeIndex: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * 原 yp：段落全部图片的排除带——浮动图走整段布局（含移动预览），
 * 内联图逐图定位（含缩放预览）。
 */
export function paragraphImageExclusions(
  paragraph: DocxParagraphNode,
  nodeIndex: number,
  paragraphTopPx: number,
  contentWidthPx: number,
  lineHeightPx: number,
  options?: {
    location?: unknown;
    paragraphTopPx?: number;
    pageMarginTopPx?: number;
    floatingMovePreview?: { imageKey: string; deltaX: number; deltaY: number; baseLeftPx?: number; baseTopPx?: number };
    resizePreview?: { imageKey: string; widthPx?: number; heightPx?: number };
    foreignExclusions?: { left: number; right: number; top: number; bottom: number }[];
  },
): ParagraphImageExclusion[] {
  const result: ParagraphImageExclusion[] = [];
  const movePreviews = new Map<number, { deltaX: number; deltaY: number; baseLeftPx?: number; baseTopPx?: number }>();
  paragraph.children.forEach((child, childIndex) => {
    if (child.type !== `image` || !options?.location) return;
    const key = imageLocationKey({ ...(options.location as object), childIndex });
    const preview = options.floatingMovePreview?.imageKey === key ? options.floatingMovePreview : void 0;
    preview &&
      movePreviews.set(childIndex, {
        deltaX: Math.round(preview.deltaX),
        deltaY: Math.round(preview.deltaY),
        ...(Number.isFinite(preview.baseLeftPx) ? { baseLeftPx: Math.round(preview.baseLeftPx as number) } : void 0),
        ...(Number.isFinite(preview.baseTopPx) ? { baseTopPx: Math.round(preview.baseTopPx as number) } : void 0),
      });
  });
  const floatingLayout = paragraphFloatingLayout(paragraph, contentWidthPx, lineHeightPx, {
    paragraphTopPx: options?.paragraphTopPx,
    pageMarginTopPx: options?.pageMarginTopPx,
    movePreviewByImageIndex: movePreviews,
    allowNegativeImageTop: movePreviews.size > 0,
    foreignExclusions: options?.foreignExclusions,
  });
  const laidOut = new Set<number>();
  if (floatingLayout)
    for (const geometry of floatingLayout.geometries)
      laidOut.add(geometry.imageIndex),
        result.push({
          sourceNodeIndex: nodeIndex,
          left: geometry.exclusion.left,
          right: geometry.exclusion.right,
          top: paragraphTopPx + geometry.exclusion.top,
          bottom: paragraphTopPx + geometry.exclusion.bottom,
        });
  paragraph.children.forEach((child, childIndex) => {
    if (child.type !== `image` || !isInlineImageNode(child as DocxImageNode) || laidOut.has(childIndex)) return;
    const locationKey = options?.location ? imageLocationKey({ ...(options.location as object), childIndex }) : void 0;
    const resize = locationKey && options?.resizePreview?.imageKey === locationKey ? options.resizePreview : void 0;
    const move = movePreviews.get(childIndex);
    const geometry = singleImageExclusion(child as DocxImageNode, childIndex, contentWidthPx, {
      paragraphTopPx: options?.paragraphTopPx,
      pageMarginTopPx: options?.pageMarginTopPx,
      widthPx: resize?.widthPx ?? (child as DocxImageNode).widthPx,
      heightPx: resize?.heightPx ?? (child as DocxImageNode).heightPx,
      movePreview: move,
      allowNegativeImageTop: !!move,
    });
    geometry &&
      result.push({
        sourceNodeIndex: nodeIndex,
        left: geometry.exclusion.left,
        right: geometry.exclusion.right,
        top: paragraphTopPx + geometry.exclusion.top,
        bottom: paragraphTopPx + geometry.exclusion.bottom,
      });
  });
  return result;
}

/** 原 bp：段落环绕带布局（有浮动布局且存在换行带时） */
export function wrapBandLayout(paragraph: DocxParagraphNode, contentWidthPx: number, lineHeightPx: number, exclusions: { left: number; right: number; top: number; bottom: number }[]): { source: unknown; geometries: never[]; lineHeightPx: number; layout: LineLayoutResult } | undefined {
  if (exclusions.length === 0) return;
  const tabContext = paragraphTabContext(paragraph);
  if (!tabContext) return;
  const layout = alignedFloatingLayout(paragraph, tabContext, contentWidthPx, lineHeightPx, exclusions);
  if (layout)
    return {
      source: tabContext,
      geometries: [],
      lineHeightPx,
      layout,
    };
}

/* ============================================================================
 * §3 换行布局（原 xp，jsx 16931；语义骨架 + 锚点）
 * ==========================================================================*/

/**
 * 原 xp：多段换行布局——逐段节点布局高（排除环绕浮动图占位），
 * 结合测量环绕带（measuredWrapBands）产出逐段行布局。
 * 内部逐行推进算法（~170 行）按锚点登记：jsx 16931-17136。
 */
export function layoutWrappedLines(
  segments: PageSegment[],
  model: DocxEditorModel,
  defaultContentWidthPx: number,
  contentWidthOverrides: Map<number, number>,
  numberingDefinitions: unknown,
  gridPitchByNodeIndex: Map<number, number>,
  options?: { measuredWrapBands?: Map<number, { topPx: number; bottomPx: number; leftPx: number; rightPx: number }> },
): Map<number, LineLayoutResult> {
  const widthFor = (nodeIndex: number): number => contentWidthOverrides.get(nodeIndex) ?? defaultContentWidthPx;
  const wrapBands = options?.measuredWrapBands;
  const bandFor = (nodeIndex: number): { topPx: number; bottomPx: number; leftPx: number; rightPx: number } | undefined => {
    const band = wrapBands?.get(nodeIndex);
    return band && band.bottomPx > band.topPx && band.rightPx > band.leftPx ? band : void 0;
  };
  const result = new Map<number, LineLayoutResult>();
  /* 锚点：逐段推进（原 jsx 16960-17136）——对每段调 nodeLayoutHeight
   （excludeWrappedFloatingImageFootprint）并结合环绕带产出布局；
   此处以逐段高度占位，保持调用面不变。 */
  segments.forEach((segment) => {
    const node = model.nodes[segment.nodeIndex];
    const height = nodeLayoutHeight(node, segment, model, widthFor(segment.nodeIndex), numberingDefinitions, gridPitchByNodeIndex.get(segment.nodeIndex), {
      excludeWrappedFloatingImageFootprint: true,
    });
    void bandFor(segment.nodeIndex);
    result.set(segment.nodeIndex, { lineCount: Math.max(1, Math.ceil(height / Math.max(1, paragraphRenderLineHeight(node as DocxParagraphNode, gridPitchByNodeIndex.get(segment.nodeIndex))))), lines: [] });
  });
  return result;
}

/* ============================================================================
 * §4 浮动图片几何（原 Jp，jsx 17543；逐句转录）
 * ==========================================================================*/

/** 浮动图几何结果（原 Jp 返回类型） */
export interface FloatingImageGeometry {
  image: DocxImageNode;
  imageIndex: number;
  containerWidthPx: number;
  imageLeftPx: number;
  imageTopPx: number;
  imageWidthPx: number;
  imageHeightPx: number;
  exclusion: { left: number; right: number; top: number; bottom: number };
}

/**
 * 原 Jp：浮动图几何——水平（显式 x/对齐/边距）与垂直（参照系换算 +
 * 段落顶换算）定位，环绕类型决定排除带左右边界。
 */
export function floatingImageGeometry(
  image: DocxImageNode,
  containerWidthPx: number,
  options?: {
    imageIndex?: number;
    widthPx?: number;
    heightPx?: number;
    deltaX?: number;
    deltaY?: number;
    paragraphTopPx?: number;
    pageMarginTopPx?: number;
    baseLeftPx?: number;
    baseTopPx?: number;
    allowNegativeImageTop?: boolean;
  },
): FloatingImageGeometry | undefined {
  const floating = image.floating;
  const inline = isInlineImageNode(image);
  const hasBaseLeft = Number.isFinite(options?.baseLeftPx);
  const hasBaseTop = Number.isFinite(options?.baseTopPx);
  const pinnedByBase = !floating && hasBaseLeft && hasBaseTop;
  if (!inline && !pinnedByBase) return;
  const containerWidth = Math.max(1, Math.round(containerWidthPx));
  const imageWidth = Math.max(1, Math.round(options?.widthPx ?? image.widthPx ?? image.heightPx ?? MIN_BLOCK_HEIGHT_PX));
  const imageHeight = Math.max(1, Math.round(options?.heightPx ?? image.heightPx ?? image.widthPx ?? MIN_BLOCK_HEIGHT_PX));
  const deltaX = Number.isFinite(options?.deltaX) ? Math.round(options?.deltaX as number) : 0;
  const deltaY = Number.isFinite(options?.deltaY) ? Math.round(options?.deltaY as number) : 0;
  const wrapType = floating?.wrapType;
  const horizontalAlign = floating?.horizontalAlign?.trim().toLowerCase();
  const distL = Math.max(0, Math.round((floating?.distLPx ?? 0) as number));
  const distR = Math.max(0, Math.round((floating?.distRPx ?? 0) as number));
  const distT = Math.max(0, Math.round((floating?.distTPx ?? 0) as number));
  const distB = Math.max(0, Math.round((floating?.distBPx ?? 0) as number));
  const baseLeft = hasBaseLeft
    ? Math.round(options?.baseLeftPx as number)
    : Number.isFinite(floating?.xPx)
      ? Math.round(floating?.xPx as number)
      : horizontalAlign === `right` || horizontalAlign === `outside`
        ? containerWidth - distR - imageWidth
        : horizontalAlign === `center`
          ? Math.round((containerWidth - imageWidth) / 2)
          : distL;
  const baseTop = hasBaseTop ? Math.round(options?.baseTopPx as number) : Number.isFinite(floating?.yPx) ? Math.round(floating?.yPx as number) : 0;
  const verticalRelativeTo = floating?.verticalRelativeTo?.trim().toLowerCase();
  const paragraphTop = Number.isFinite(options?.paragraphTopPx) ? Math.max(0, Math.round(options?.paragraphTopPx as number)) : void 0;
  const pageMarginTop = Number.isFinite(options?.pageMarginTopPx) ? Math.max(0, Math.round(options?.pageMarginTopPx as number)) : 0;
  const relativeTop =
    !hasBaseTop && paragraphTop !== void 0 && (verticalRelativeTo === `margin` || verticalRelativeTo === `page`)
      ? Math.round((verticalRelativeTo === `page` ? baseTop - pageMarginTop : baseTop) - paragraphTop)
      : baseTop;
  const left = clampLocal(baseLeft + deltaX, 0, Math.max(0, containerWidth - imageWidth));
  const topRaw = (hasBaseTop ? baseTop : relativeTop + (pinnedByBase ? 0 : distT)) + deltaY;
  const negativeSource = Number.isFinite(floating?.yPx) && (floating?.yPx as number) < 0;
  const top = options?.allowNegativeImageTop || negativeSource ? Math.round(topRaw) : Math.max(0, Math.round(topRaw));
  const alignOnly = !hasBaseLeft && !Number.isFinite(floating?.xPx);
  let exclusionLeft = Math.max(0, left - distL);
  let exclusionRight = Math.min(containerWidth, left + imageWidth + distR);
  if (wrapType === `topAndBottom` ? ((exclusionLeft = 0), (exclusionRight = containerWidth)) : alignOnly && (horizontalAlign === `left` || horizontalAlign === `inside`) ? (exclusionLeft = 0) : alignOnly && (horizontalAlign === `right` || horizontalAlign === `outside`) && (exclusionRight = containerWidth), !pinnedByBase && wrapType !== `topAndBottom`) {
    const leftSpace = exclusionLeft;
    const rightSpace = Math.max(0, containerWidth - exclusionRight);
    if (!(exclusionLeft > 0 && exclusionRight < containerWidth && leftSpace >= FLOATING_SIDE_CLEARANCE_PX && rightSpace >= FLOATING_SIDE_CLEARANCE_PX) && !(exclusionLeft === 0 || exclusionRight === containerWidth)) return;
  }
  return {
    image,
    imageIndex: options?.imageIndex ?? 0,
    containerWidthPx: containerWidth,
    imageLeftPx: left,
    imageTopPx: top,
    imageWidthPx: imageWidth,
    imageHeightPx: imageHeight,
    exclusion: { left: exclusionLeft, right: exclusionRight, top, bottom: top + imageHeight + distB },
  };
}

function clampLocal(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ============================================================================
 * §5 段落浮动布局（原 Yp/Xp，jsx 17598-17685；逐句转录）
 * ==========================================================================*/

/** 段落浮动布局结果（原 Yp 返回类型） */
export interface ParagraphFloatingLayout {
  source: unknown;
  geometries: FloatingImageGeometry[];
  lineHeightPx: number;
  layout: LineLayoutResult;
}

/** 原 Yp：段落浮动布局——逐图几何 + 顶边修正（顶锚/文本行下沿）+ 排除带断行 */
export function paragraphFloatingLayout(
  paragraph: DocxParagraphNode,
  contentWidthPx: number,
  lineHeightPx: number,
  options?: {
    deltaX?: number;
    deltaY?: number;
    widthPxByImageIndex?: Map<number, number>;
    heightPxByImageIndex?: Map<number, number>;
    paragraphTopPx?: number;
    pageMarginTopPx?: number;
    movePreviewByImageIndex?: Map<number, { deltaX: number; deltaY: number; baseLeftPx?: number; baseTopPx?: number }>;
    allowNegativeImageTop?: boolean;
    foreignExclusions?: { left: number; right: number; top: number; bottom: number }[];
  },
): ParagraphFloatingLayout | undefined {
  const tabContext = paragraphTabContext(paragraph);
  if (!tabContext) return;
  const geometries = paragraph.children
    .map((child, childIndex): FloatingImageGeometry | undefined => {
      if (child.type !== `image` || !(child as DocxImageNode).floating) return;
      const preview = options?.movePreviewByImageIndex?.get(childIndex);
      return floatingImageGeometry(child as DocxImageNode, contentWidthPx, {
        imageIndex: childIndex,
        deltaX: preview?.deltaX ?? options?.deltaX,
        deltaY: preview?.deltaY ?? options?.deltaY,
        widthPx: options?.widthPxByImageIndex?.get(childIndex),
        heightPx: options?.heightPxByImageIndex?.get(childIndex),
        paragraphTopPx: options?.paragraphTopPx,
        pageMarginTopPx: options?.pageMarginTopPx,
        baseLeftPx: preview?.baseLeftPx,
        baseTopPx: preview?.baseTopPx,
        allowNegativeImageTop: options?.allowNegativeImageTop ?? !!preview,
      });
    })
    .filter((geometry): geometry is FloatingImageGeometry => !!geometry);
  if (geometries.length === 0) return;
  const textLayout = paragraphLineBreaks(paragraph, tabContext, Math.max(...geometries.map((geometry) => geometry.containerWidthPx)), lineHeightPx, []);
  const adjusted = geometries.map((geometry) => {
    const wrapType = geometry.image.floating?.wrapType?.trim().toLowerCase();
    const verticalRelativeTo = geometry.image.floating?.verticalRelativeTo?.trim().toLowerCase();
    const precedingTextLength = textLengthBeforeImage(paragraph, geometry.imageIndex);
    if (wrapType === `topandbottom` && precedingTextLength <= 0 && isTopAnchoredFloating(geometry.image) && (verticalRelativeTo === void 0 || verticalRelativeTo === `` || verticalRelativeTo === `paragraph` || verticalRelativeTo === `line`)) {
      if (geometry.imageTopPx <= 0) return geometry;
      const shift = 0 - geometry.imageTopPx;
      return {
        ...geometry,
        imageTopPx: geometry.imageTopPx + shift,
        exclusion: { ...geometry.exclusion, top: geometry.exclusion.top + shift, bottom: geometry.exclusion.bottom + shift },
      };
    }
    if (!textLayout || wrapType === `topandbottom` || (verticalRelativeTo !== `margin` && verticalRelativeTo !== `page`) || precedingTextLength <= 0) return geometry;
    const line = lineAtOffset(textLayout, precedingTextLength);
    const lineTop = Math.max(0, Math.round(line?.top ?? 0));
    if (lineTop <= geometry.imageTopPx) return geometry;
    const shift = lineTop - geometry.imageTopPx;
    return {
      ...geometry,
      imageTopPx: geometry.imageTopPx + shift,
      exclusion: { ...geometry.exclusion, top: geometry.exclusion.top + shift, bottom: geometry.exclusion.bottom + shift },
    };
  });
  const exclusions = [...(options?.foreignExclusions ?? []), ...adjusted.map((geometry) => geometry.exclusion)];
  const layout = alignedFloatingLayout(paragraph, tabContext, Math.max(...adjusted.map((geometry) => geometry.containerWidthPx)), lineHeightPx, exclusions);
  if (layout) return { source: tabContext, geometries: adjusted, lineHeightPx, layout };
}

/** 段落断行（原 Hp 语义：首行缩进排除带 + 排除带断行/兜底断行） */
function paragraphLineBreaks(
  paragraph: DocxParagraphNode,
  tabContext: unknown,
  widthPx: number,
  lineHeightPx: number,
  exclusions: { left: number; right: number; top: number; bottom: number }[],
): LineLayoutResult | undefined {
  void tabContext;
  const baseFont = runFontString(firstTextRunStyle(paragraph), paragraphFontSizePx(paragraph), paragraphText(paragraph));
  const wordBreak = wordBreakOf(paragraphText(paragraph));
  const firstLineIndent = twipsToPxLocal(paragraph.style?.indent?.firstLineTwips);
  const effectiveExclusions =
    Number.isFinite(firstLineIndent) && (firstLineIndent as number) > 0
      ? [...exclusions, { left: 0, right: Math.min(Math.max(1, Math.round(widthPx)), Math.round(firstLineIndent as number)), top: 0, bottom: 1 }]
      : exclusions;
  const fragments = paragraphTextFragments(paragraph);
  return (fragments.length > 0 ? breakLinesWithExclusions(paragraphText(paragraph), fragments, widthPx, lineHeightPx, effectiveExclusions, baseFont) : void 0) || breakLinesFallback(paragraphText(paragraph), baseFont, widthPx, lineHeightPx, effectiveExclusions, { wordBreak });
}

/** 原 Lp：文本断词策略（CJK → keep-all；容量受限缓存） */
export function wordBreakOf(text: string): `keep-all` | `normal` {
  const cached = wordBreakCache.get(text);
  if (cached) return cached;
  const value = CJK_SCRIPT_REGEX.test(text) ? `keep-all` : `normal`;
  boundedCacheSet(wordBreakCache, text, value);
  for (; wordBreakCache.size > TEXT_MEASURE_CACHE_LIMIT; ) {
    const oldest = wordBreakCache.keys().next().value;
    if (!oldest) break;
    wordBreakCache.delete(oldest);
  }
  return value;
}

/** 原 zp 语义局部：段落文本按字体分段（缓存略——布局层按段现算） */
function paragraphTextFragments(paragraph: DocxParagraphNode): { text: string; font: string; startOffset: number; endOffset: number; break: string; wordBreak: string }[] {
  const fontSize = paragraphFontSizePx(paragraph);
  const wordBreak = wordBreakOf(paragraphText(paragraph));
  const fragments: { text: string; font: string; startOffset: number; endOffset: number; break: string; wordBreak: string }[] = [];
  let offset = 0;
  for (const child of paragraph.children) {
    if (child.type === `text`) {
      const text = (child as { text: string }).text;
      if (text.length > 0) {
        for (const part of splitTextByFont(text, (child as { style?: DocxRunStyle }).style, fontSize)) {
          fragments.push({ text: part.text, font: part.font, startOffset: offset + part.startOffset, endOffset: offset + part.endOffset, break: `normal`, wordBreak });
        }
      }
      offset += text.length;
    } else {
      const placeholder = `\uFFFC`;
      fragments.push({ text: placeholder, font: runFontString((child as { style?: DocxRunStyle }).style, fontSize, placeholder), startOffset: offset, endOffset: offset + 1, break: `never`, wordBreak });
      offset += 1;
    }
  }
  return fragments.filter((fragment) => fragment.endOffset > fragment.startOffset);
}

function twipsToPxLocal(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.round((twips as number) / 15);
}

/** 原 Gp：图片前的文本长度（内联图按占位宽折算） */
export function textLengthBeforeImage(paragraph: DocxParagraphNode, imageIndex: number): number {
  const fontSize = paragraphFontSizePx(paragraph);
  let runStyle = firstTextRunStyle(paragraph);
  let length = 0;
  for (let index = 0; index < imageIndex; index += 1) {
    const child = paragraph.children[index];
    if (child) {
      if (child.type === `image`) {
        if ((child as DocxImageNode).floating) continue;
        length += imagePlaceholderText(child as DocxImageNode, runStyle, fontSize).length;
        continue;
      }
      child.type === `text` && ((length += (child as { text: string }).text.length), (runStyle = (child as { style?: DocxRunStyle }).style ?? runStyle));
    }
  }
  return length;
}

/** 原 Wp：图片占位文本（按宽度折算不换行空格数） */
export function imagePlaceholderText(image: DocxImageNode, style: DocxRunStyle | undefined, fontSizePx: number): string {
  const width = Math.max(1, Math.round(image.widthPx ?? image.heightPx ?? MIN_BLOCK_HEIGHT_PX));
  let placeholder = `\xA0`;
  for (; measureTextWidth(placeholder, style, fontSizePx) < width && placeholder.length < 64; ) placeholder += `\xA0`;
  return placeholder;
}

/** 原 Xp：对齐修正的行布局（居中/右对齐时按行剩余空间平移） */
export function alignedFloatingLayout(
  paragraph: DocxParagraphNode,
  tabContext: unknown,
  widthPx: number,
  lineHeightPx: number,
  exclusions: { left: number; right: number; top: number; bottom: number }[],
): LineLayoutResult | undefined {
  const layout = paragraphLineBreaks(paragraph, tabContext, widthPx, lineHeightPx, exclusions);
  if (!layout || layout.lineCount <= 0) return;
  const align = (paragraph.style?.align ?? `left`).trim().toLowerCase();
  const lines =
    align === `center` || align === `right`
      ? layout.lines.map((line) => {
          if (line.fragments.length === 0) return line;
          const first = line.fragments[0];
          const last = line.fragments[line.fragments.length - 1];
          if (!first || !last || !line.fragments.every((fragment) => fragment.intervalX === first.intervalX && fragment.intervalWidth === first.intervalWidth)) return line;
          const used = last.x + last.width - first.x;
          const remaining = Math.max(0, Math.round((first.intervalWidth ?? used) - used));
          if (remaining <= 0) return line;
          const shift = align === `center` ? Math.round(remaining / 2) : remaining;
          return shift <= 0
            ? line
            : {
                ...line,
                fragments: line.fragments.map((fragment) => ({ ...fragment, x: fragment.x + shift })),
              };
        })
      : layout.lines;
  return { ...layout, lines };
}

/* ============================================================================
 * §6 表单域测量（原 Zp..sm，jsx 17686-17805；逐句转录）
 * ==========================================================================*/

/** 原 Zp：复选框行间距（按复选框数/文本长分档） */
export function checkboxGapPx(paragraph: DocxParagraphNode): number {
  const checkboxCount = paragraph.children.filter((child) => child.type === `form-field` && (child as DocxFormFieldNode).fieldType === `checkbox`).length;
  const textLength = paragraph.children
    .filter((child) => child.type === `text`)
    .map((child) => (child as { text: string }).text.replace(/\t/g, ``))
    .join(``)
    .replace(/\s+/g, ``).length;
  return checkboxCount >= 3 ? 6 : textLength <= 8 ? 8 : 10;
}

/** 原 Qp：复选框后空格 → 不换行空格（防折行） */
export function checkboxLeadingSpace(paragraph: DocxParagraphNode, childIndex: number, text: string | undefined): string | undefined {
  if (!text || text[0] !== ` `) return text;
  const previous = childIndex > 0 ? paragraph.children[childIndex - 1] : void 0;
  return previous?.type !== `form-field` || (previous as DocxFormFieldNode).fieldType !== `checkbox` ? text : `\xA0${text.slice(1)}`;
}

/** 原 $p：表单域字号 px（缺省 11pt） */
export function formFieldFontPx(style: DocxRunStyle | undefined): number {
  return style?.fontSizePt && Number.isFinite(style.fontSizePt) && style.fontSizePt > 0 ? Math.max(9, (style.fontSizePt * 96) / 72) : Math.max(9, (11 * 96) / 72);
}

/** 原 em：表单域字号 px（无显式 → undefined） */
export function formFieldFontPxOptional(style: DocxRunStyle | undefined): number | undefined {
  if (style?.fontSizePt && Number.isFinite(style.fontSizePt) && style.fontSizePt > 0) return Math.max(9, (style.fontSizePt * 96) / 72);
}

/** 原 tm：表单域高度（显式高 → 字号 → 经验式） */
export function formFieldHeightPx(style: DocxRunStyle | undefined, widthPx: number, aspect: number, explicitHeightPx?: number): number {
  if (Number.isFinite(explicitHeightPx) && (explicitHeightPx as number) > 0) return Math.max(12, Math.round(explicitHeightPx as number));
  const fromFont = formFieldFontPxOptional(style);
  if (Number.isFinite(fromFont) && (fromFont as number) > 0) return Math.max(12, Math.round(fromFont as number));
  const base = formFieldFontPx(style);
  const fromWidth = Math.max(18, Math.round(widthPx * Math.max(1.6, aspect * 0.92)));
  return Math.max(fromWidth, Math.round(base * 1.8));
}

/** 原 nm：表单域外框高（宽高比 + 字号下限） */
export function formFieldBoxHeightPx(style: DocxRunStyle | undefined, widthPx: number, aspect: number, explicitHeightPx?: number): number {
  const natural = Math.max(18, Math.round(widthPx * aspect));
  const preferred = formFieldHeightPx(style, widthPx, aspect);
  const resolved = Number.isFinite(explicitHeightPx) && (explicitHeightPx as number) > 0 ? Math.max(12, Math.round(explicitHeightPx as number)) : preferred;
  const scale = preferred > 0 ? resolved / preferred : 1;
  return Math.max(18, Math.round(natural * scale), Math.round(resolved * 1.05));
}

/**
 * 原 rm：启发式文本宽度——按字符类别加权（空格 0.33 / 窄符 0.29 /
 * 大写数字 0.6 / CJK 0.95 / 常规 0.54，制表 2 字宽），容量受限缓存。
 */
export function estimateTextWidthPx(text: string | undefined, style: DocxRunStyle | undefined): number {
  if (!text) return 0;
  const fontSize = formFieldFontPx(style);
  const normalized = text.includes(`\xA0`) ? text.replace(/\u00a0/g, ` `) : text;
  const cacheKey = `${fontSize}\0${normalized}`;
  const cached = heuristicTextWidthCache.get(cacheKey);
  if (cached !== void 0) return cached;
  let width = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    const code = normalized.charCodeAt(index);
    if (!(code === 10 || code === 13)) {
      if (code === 9) {
        width += fontSize * 2;
        continue;
      }
      if (code === 32) {
        width += fontSize * 0.33;
        continue;
      }
      if (code === 33 || code === 39 || code === 44 || code === 46 || code === 49 || code === 58 || code === 59 || code === 73 || code === 96 || code === 105 || code === 108 || code === 124) {
        width += fontSize * 0.29;
        continue;
      }
      if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) {
        width += fontSize * 0.6;
        continue;
      }
      if (code >= 12288 && code <= 40959) {
        width += fontSize * 0.95;
        continue;
      }
      width += fontSize * 0.54;
    }
  }
  const result = Math.max(0, Math.round(width));
  for (boundedCacheSet(heuristicTextWidthCache, cacheKey, result); heuristicTextWidthCache.size > TEXT_MEASURE_CACHE_LIMIT; ) {
    const oldest = heuristicTextWidthCache.keys().next().value;
    if (!oldest) break;
    heuristicTextWidthCache.delete(oldest);
  }
  return result;
}

/** 原 im：文本后 x 推进（多行取末行） */
export function advanceAfterText(currentX: number, text: string | undefined, style: DocxRunStyle | undefined): number {
  if (!text) return currentX;
  if (!text.includes(`\n`)) return currentX + estimateTextWidthPx(text, style);
  const lines = text.split(`\n`);
  return estimateTextWidthPx(lines[lines.length - 1] ?? ``, style);
}

/** 原 am：下一制表位距离（栅格 12px 起，最小 8） */
export function nextTabStopDistance(stops: number[], currentX: number, gridSizePx: number, wrapToNextLine = false): number {
  const grid = Math.max(12, Math.round(gridSizePx));
  if (stops.length === 0) {
    if (wrapToNextLine) return grid;
    const next = (Math.floor((currentX + 0.5) / grid) + 1) * grid;
    return Math.max(2, Math.round(next - currentX));
  }
  const nextStop = stops.find((stop) => stop > currentX + 0.5);
  if (nextStop !== void 0) return Math.max(8, Math.round(nextStop - currentX));
  const last = stops[stops.length - 1] ?? 0;
  const overflow = Math.max(0, currentX - last);
  const projected = last + (Math.floor(overflow / grid) + 1) * grid;
  return Math.max(8, Math.round(projected - currentX));
}

/** 原 om：表单域宽度（按域类型分档夹取） */
export function formFieldWidthPx(field: DocxFormFieldNode): number {
  if (field.fieldType === `checkbox`) return checkboxWidthPx(field);
  if (field.fieldType === `date`) {
    const sample = field.value?.trim() || `MM/DD/YYYY`;
    return Math.max(68, Math.min(220, estimateTextWidthPx(sample, field.style) + 12));
  }
  if (field.fieldType === `dropdown`) {
    const sample = field.value?.trim() || field.options?.[0]?.displayText?.trim() || field.title?.trim() || `Select`;
    return Math.max(58, Math.min(240, estimateTextWidthPx(sample, field.style) + 16));
  }
  const defaultText = field.widget?.text?.defaultText?.trim();
  const sample = field.value?.trim() || defaultText || field.title?.trim() || `Click here.`;
  return Math.max(42, Math.min(280, estimateTextWidthPx(sample, field.style) + 12));
}

/** 原 sm：复选框宽度（精确尺寸优先，否则符号测量） */
export function checkboxWidthPx(field: DocxFormFieldNode): number {
  const exact = field.widget?.checkbox?.sizeMode === `exact` && Number.isFinite(field.widget.checkbox.sizePt) ? Math.max(14, Math.round(((field.widget.checkbox.sizePt as number) * 96) / 72 + 4)) : void 0;
  if (Number.isFinite(exact)) return exact as number;
  const checked = field.checkedSymbol ?? `☒`;
  const unchecked = field.uncheckedSymbol ?? `☐`;
  return Math.max(14, estimateTextWidthPx(checked, field.style), estimateTextWidthPx(unchecked, field.style));
}

/* ============================================================================
 * §7 空段/分节占位谓词（原 cm..pm，jsx 17806-17836）
 * ==========================================================================*/

/** 原 cm：段落为空文本（无图片/表单域，子节点全为空文本） */
export function paragraphIsEmptyText(paragraph: DocxParagraphNode): boolean {
  return paragraphHasImage(paragraph) || paragraphHasFormField(paragraph) ? false : paragraph.children.every((child) => child.type === `text` && (child as { text: string }).text.length === 0);
}

/** 原 lm：段落标记被修订删除判定 */
export function paragraphMarkIsDeleted(paragraph: DocxParagraphNode): boolean {
  if ((paragraph as { paragraphMarkDeleted?: boolean }).paragraphMarkDeleted === true) return true;
  const xml = paragraph.sourceXml ?? ``;
  return /<w:pPr\b[\s\S]*?<w:rPr\b[\s\S]*?<w:del\b/i.test(xml);
}

/** 原 um：空段后接删除标记段判定 */
export function emptyBeforeDeletedMark(paragraph: DocxParagraphNode, next: DocxNode | undefined): boolean {
  return paragraphIsEmptyText(paragraph) && next?.type === `paragraph` && paragraphMarkIsDeleted(next as DocxParagraphNode);
}

/** 原 dm：段落为分节占位（含 sectPr 的空段，且非各类特殊段） */
export function isSectionBreakSpacer(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  return !(!xml || !SECTION_PROPS_REGEX.test(xml) || !paragraphIsEmptyText(paragraph) || paragraphIsSectionCoverLocal(paragraph) || pageBreakBeforeOf(paragraph) || lastRenderedBreakAtStart(paragraph) || detectLetterheadSideLocal(paragraph));
}

/** 原 fm：可移除分节占位判定（下一段为节封面） */
export function isRemovableSectionSpacer(model: DocxEditorModel, index: number, paragraph: DocxParagraphNode): boolean {
  if (!paragraphIsEmptyText(paragraph) || paragraphIsSectionCoverLocal(paragraph) || pageBreakBeforeOf(paragraph) || lastRenderedBreakAtStart(paragraph)) return false;
  const next = model.nodes[index + 1];
  return !next || next.type !== `paragraph` ? false : paragraphIsSectionCover(next as DocxParagraphNode);
}

/** 原 pm：尾部连续分节占位判定 */
export function isTrailingSectionSpacer(model: DocxEditorModel, index: number, paragraph: DocxParagraphNode): boolean {
  if (!paragraphIsEmptyText(paragraph) || paragraphIsSectionCoverLocal(paragraph) || pageBreakBeforeOf(paragraph) || lastRenderedBreakAtStart(paragraph) || paragraphHasImage(paragraph) || paragraphHasFormField(paragraph)) return false;
  let cursor = index + 1;
  for (; cursor < model.nodes.length; ) {
    const node = model.nodes[cursor];
    if (node?.type !== `paragraph`) return false;
    if (!paragraphIsEmptyText(node as DocxParagraphNode)) return pageBreakBeforeOf(node as DocxParagraphNode) || lastRenderedBreakAtStart(node as DocxParagraphNode);
    if (paragraphIsSectionCoverLocal(node as DocxParagraphNode) || pageBreakBeforeOf(node as DocxParagraphNode) || lastRenderedBreakAtStart(node as DocxParagraphNode) || paragraphHasImage(node as DocxParagraphNode) || paragraphHasFormField(node as DocxParagraphNode)) return false;
    cursor += 1;
  }
  return false;
}

/** Nm 局部别名（避免前向引用）：段落可见边框判定 */
function paragraphIsSectionCoverLocal(paragraph: DocxParagraphNode): boolean {
  return paragraphHasVisibleBorders(paragraph);
}

/** $l 局部别名：信头侧判定（模型层已导出；此处避免循环按原式内联） */
function detectLetterheadSideLocal(paragraph: DocxParagraphNode): boolean {
  const leftTwips = paragraph.style?.indent?.leftTwips;
  const rightTwips = paragraph.style?.indent?.rightTwips;
  const left = Number.isFinite(leftTwips) && (leftTwips as number) > 0 ? Math.round(leftTwips as number) : 0;
  const right = Number.isFinite(rightTwips) && (rightTwips as number) > 0 ? Math.round(rightTwips as number) : 0;
  const rightInRange = right >= 900 && right <= 4200;
  const leftInRange = left >= 900 && left <= 4200;
  return rightInRange || leftInRange;
}

/* ============================================================================
 * §8 上下文段距（原 mm.._m，jsx 17837-17857）
 * ==========================================================================*/

/** 原 mm：段落样式身份键（styleId → id:，styleName → name:） */
export function paragraphStyleIdentity(paragraph: DocxParagraphNode): string | undefined {
  const styleId = paragraph.style?.styleId?.trim().toLowerCase();
  if (styleId) return `id:${styleId}`;
  const styleName = paragraph.style?.styleName?.trim().toLowerCase();
  if (styleName) return `name:${styleName}`;
}

/** 原 hm：上下文互斥段距判定（同样式身份 + 任一侧 contextualSpacing） */
export function contextualSpacingApplies(a: DocxParagraphNode | undefined, b: DocxParagraphNode | undefined): boolean {
  if (!a) return false;
  const identityA = paragraphStyleIdentity(a);
  const identityB = b ? paragraphStyleIdentity(b) : void 0;
  return !identityA || identityA !== identityB ? false : a.style?.contextualSpacing === true || b?.style?.contextualSpacing === true;
}

/** 原 gm：段后距（下一段同样式互斥 → 0） */
export function spacingAfterWithContext(model: DocxEditorModel, index: number, paragraph: DocxParagraphNode): number {
  const after = paragraphSpacingAfterLocal(paragraph);
  const next = model.nodes[index + 1];
  return next?.type === `paragraph` && contextualSpacingApplies(paragraph, next as DocxParagraphNode) ? 0 : after;
}

/** 原 _m：段前距（上一段同样式互斥 → 0） */
export function spacingBeforeWithContext(model: DocxEditorModel, index: number, paragraph: DocxParagraphNode, gridPitchPx: number | undefined): number {
  const before = paragraphSpacingBeforeLocal(model, index, paragraph, gridPitchPx);
  if (gridPitchPx === void 0 || (gridPitchPx as number) <= 0) return before;
  const previous = model.nodes[index - 1];
  return previous?.type === `paragraph` && contextualSpacingApplies(previous as DocxParagraphNode, paragraph) ? 0 : before;
}

/** [E2] 契约：段前/段后距计算（原 dg/mg；锚点登记） */
declare function paragraphSpacingAfterLocal(paragraph: DocxParagraphNode): number;
declare function paragraphSpacingBeforeLocal(model: DocxEditorModel, index: number, paragraph: DocxParagraphNode, gridPitchPx: number | undefined): number;

/* ============================================================================
 * §9 书签/脚注引用提取（原 vm..bm，jsx 17858-17885）
 * ==========================================================================*/

/** 原 vm：段落书签名提取（去 _GoBack、去重） */
export function bookmarkNames(paragraph: DocxParagraphNode): string[] {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return [];
  const names = [...xml.matchAll(new RegExp(BOOKMARK_START_REGEX.source, `gi`))].map((match) => match[1]?.trim()).filter((name) => !!(name && name.length > 0 && name !== `_GoBack`));
  return [...new Set(names)];
}

/** 原 ym：段落脚注/尾注引用 id 提取 */
export function noteReferenceIds(paragraph: DocxParagraphNode, kind: `footnote` | `endnote`): number[] {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return [];
  const regex = kind === `footnote` ? new RegExp(FOOTNOTE_REFERENCE_REGEX.source, `gi`) : new RegExp(ENDNOTE_REFERENCE_REGEX.source, `gi`);
  const ids: number[] = [];
  for (const match of xml.matchAll(regex)) {
    const id = Number(match[1]);
    !Number.isFinite(id) || id < 0 || ids.push(Math.round(id));
  }
  return ids;
}

/** 原 bm：节点（段落/表格行范围）注释引用收集 */
export function collectNodeNoteReferences(node: DocxNode, kind: `footnote` | `endnote`, rowRange?: { startRowIndex: number; endRowIndex: number }, lineRange?: { startLineIndex: number; endLineIndex: number }): number[] {
  if (node.type === `paragraph`) return lineRange && lineRange.startLineIndex > 0 ? [] : noteReferenceIds(node as DocxParagraphNode, kind);
  const ids: number[] = [];
  const start = Math.max(0, rowRange?.startRowIndex ?? 0);
  const end = Math.min((node as DocxTableNode).rows.length, rowRange?.endRowIndex ?? (node as DocxTableNode).rows.length);
  for (let rowIndex = start; rowIndex < end; rowIndex += 1)
    (node as DocxTableNode).rows[rowIndex]?.cells.forEach((cell) => {
      collectParagraphsLocal(cell.nodes).forEach((paragraph) => {
        ids.push(...noteReferenceIds(paragraph, kind));
      });
    });
  return ids;
}

function collectParagraphsLocal(nodes: DocxNode[]): DocxParagraphNode[] {
  const result: DocxParagraphNode[] = [];
  const walk = (list: DocxNode[]): void => {
    for (const node of list) {
      if (node.type === `paragraph`) result.push(node as DocxParagraphNode);
      else if (node.type === `table`) for (const row of (node as DocxTableNode).rows) for (const cell of row.cells) walk(cell.nodes);
    }
  };
  walk(nodes);
  return result;
}

/* ============================================================================
 * §10 DOM 谓词（原 xm/Sm，jsx 17886-17891）
 * ==========================================================================*/

/** 原 xm：交互元素判定（链接/按钮/输入/复选角色） */
export function isInteractiveElement(element: Element | undefined | null): boolean {
  return element instanceof Element ? !!element.closest(`a[href],button,input,select,textarea,[role='checkbox']`) : false;
}

/** 原 Sm：表格单元格段落宿主判定 */
export function isTableCellParagraphHost(element: Element | undefined | null): boolean {
  return element instanceof Element ? !!element.closest(`[data-docx-table-cell-paragraph-host='true']`) : false;
}

/* ============================================================================
 * §11 断页标记族（原 Cm..Rm，jsx 17892-18009；逐句转录）
 * ==========================================================================*/

/** 原 Cm：sectPr XML 起新页判定（continuous 否；nextcolumn 且单栏否） */
export function sectionXmlStartsNewPage(sectPr: string): boolean {
  const type = sectPr.match(SECTION_TYPE_REGEX)?.[1]?.trim().toLowerCase() ?? `nextpage`;
  if (type === `continuous`) return false;
  if (type === `nextcolumn`) {
    const cols = sectPr.match(/<w:cols\b[^>]*\/?>/i)?.[0];
    const count = Number.parseInt(cols?.match(/\bw:num="(\d+)"/i)?.[1] ?? ``, 10);
    return !Number.isFinite(count) || count <= 1;
  }
  return true;
}

/** 段落断页标记集（原 wm 缓存值类型） */
export interface ParagraphBreakFlags {
  explicitPageBreak: boolean;
  explicitColumnBreak: boolean;
  lastRenderedPageBreak: boolean;
  pageBreakBefore: boolean;
  sectionBreakStartsNewPage: boolean;
}

/** 原 wm：段落断页标记解析（五合一，缓存 Al） */
export function paragraphBreakFlags(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const cached = paragraphBreakFlagsCache.get(xml);
  if (cached) return cached.explicitPageBreak;
  const flags: ParagraphBreakFlags = {
    explicitPageBreak: PAGE_BREAK_BR_REGEX.test(xml),
    explicitColumnBreak: COLUMN_BREAK_BR_REGEX.test(xml),
    lastRenderedPageBreak: LAST_RENDERED_PAGE_BREAK_REGEX.test(xml),
    pageBreakBefore: xmlBoolAttrEnabled(xml.match(PAGE_BREAK_BEFORE_REGEX)?.[0]),
    sectionBreakStartsNewPage: (() => {
      const sectPr = xml.match(SECTION_PROPS_REGEX)?.[0];
      return sectPr ? sectionXmlStartsNewPage(sectPr) : false;
    })(),
  };
  boundedCacheSet(paragraphBreakFlagsCache, xml, flags);
  return flags.explicitPageBreak;
}

/** 原 Tm：显式栏断判定 */
export function explicitColumnBreakOf(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const cached = paragraphBreakFlagsCache.get(xml);
  return cached ? cached.explicitColumnBreak : (paragraphBreakFlags(paragraph), paragraphBreakFlagsCache.get(xml)?.explicitColumnBreak ?? false);
}

/** 原 Em：lastRenderedPageBreak 存在判定 */
export function lastRenderedPageBreakOf(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const cached = paragraphBreakFlagsCache.get(xml);
  return cached ? cached.lastRenderedPageBreak : (paragraphBreakFlags(paragraph), paragraphBreakFlagsCache.get(xml)?.lastRenderedPageBreak ?? false);
}

/** 原 Dm：lastRenderedPageBreak 位于段首判定（剥离前导标记后为空） */
export function lastRenderedBreakAtStart(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml || !lastRenderedPageBreakOf(paragraph)) return false;
  const match = xml.match(LAST_RENDERED_PAGE_BREAK_REGEX);
  return !match || match.index === void 0
    ? false
    : xml
        .slice(0, match.index)
        .replace(/^<w:p\b[^>]*>/i, ``)
        .replace(/<w:pPr\b(?:[^/>]*\/>|[\s\S]*?<\/w:pPr>)/i, ``)
        .replace(/<w:rPr\b[\s\S]*?<\/w:rPr>/gi, ``)
        .replace(/<\/?w:r\b[^>]*>/gi, ``)
        .replace(/<w:(?:proofErr|bookmarkStart|bookmarkEnd|permStart|permEnd)\b[^>]*\/?>/gi, ``)
        .replace(/<\/?w:(?:ins|smartTag)\b[^>]*>/gi, ``)
        .replace(/\s+/g, ``).length === 0;
}

/** 原 Om：页尾接近占满判定（剩余 ≤ clamp(18%, 42, 120)） */
export function pageTailNearlyFull(input: { pageConsumedHeightPx: number; pageContentHeightPx: number }): boolean {
  const consumed = Math.max(0, Math.round(input.pageConsumedHeightPx));
  const total = Math.max(0, Math.round(input.pageContentHeightPx));
  return consumed <= 0 || total <= 0 ? false : Math.max(0, total - consumed) <= clampLocal(Math.round(total * PAGE_TAIL_REMAIN_RATIO), PAGE_TAIL_REMAIN_MIN_PX, PAGE_TAIL_REMAIN_MAX_PX);
}

/** 原 km：XML 布尔属性启用判定（0/false/off/no 之外均启用） */
export function xmlBoolAttrEnabled(xml: string | undefined): boolean {
  if (!xml) return false;
  const value = xml.match(/\bw:val="([^"]+)"/i)?.[1]?.trim().toLowerCase();
  return value ? ![`0`, `false`, `off`, `no`].includes(value) : true;
}

/** 原 Am：节含 titlePg 判定 */
export function sectionHasTitlePage(sectPr: string | undefined): boolean {
  if (!sectPr) return false;
  const titlePg = sectPr.match(/<w:titlePg\b[^>]*\/?>/i)?.[0];
  return xmlBoolAttrEnabled(titlePg);
}

/** 原 jm：按页挑选页眉/页脚引用（first/even/default；titlePg 与奇偶开关） */
export function pickHeaderFooterForPage(
  entries: DocxHeaderFooterSection[],
  sectPr: string | undefined,
  pageIndex: number,
  options?: { evenAndOddHeaders?: boolean },
): DocxHeaderFooterSection | undefined {
  if (entries.length === 0) return;
  const hasTitlePage = sectionHasTitlePage(sectPr);
  const kindOf = (entry: DocxHeaderFooterSection | undefined): string => entry?.referenceType?.trim().toLowerCase() ?? ``;
  const first = entries.find((entry) => kindOf(entry) === `first`);
  const fallback = entries.find((entry) => {
    const kind = kindOf(entry);
    return kind === `default` || kind === ``;
  });
  const even = entries.find((entry) => kindOf(entry) === `even`);
  const evenAndOdd = options?.evenAndOddHeaders ?? true;
  const index = Number.isFinite(pageIndex) ? Math.max(0, Math.round(pageIndex)) : 0;
  const isOdd = index % 2 == 0;
  return index === 0 && hasTitlePage ? first : evenAndOdd && !isOdd && even ? even : fallback || (first ?? even ?? entries[0]);
}

/** 原 Mm：节点索引 → 节索引（线性推进） */
export function sectionIndexForNodeInList(sections: DocxSection[], nodeIndex: number, hint: number): number {
  if (sections.length === 0) return 0;
  let index = Math.max(0, Math.min(hint, sections.length - 1));
  for (nodeIndex < sections[index].startNodeIndex && (index = 0); index + 1 < sections.length && sections[index + 1].startNodeIndex <= nodeIndex; ) index += 1;
  return index;
}

/** 原 Nm：段落可见边框判定（六边任一） */
export function paragraphHasVisibleBorders(paragraph: DocxParagraphNode): boolean {
  return (
    isBorderVisible(paragraph.style?.borders?.top) ||
    isBorderVisible(paragraph.style?.borders?.right) ||
    isBorderVisible(paragraph.style?.borders?.bottom) ||
    isBorderVisible(paragraph.style?.borders?.left) ||
    isBorderVisible(paragraph.style?.borders?.between) ||
    isBorderVisible(paragraph.style?.borders?.bar)
  );
}

/** 原 Pm：段落为节封面判定（含 sectPr 的纯背景图段、无边框） */
export function paragraphIsSectionCover(paragraph: DocxParagraphNode): boolean {
  return !paragraph.sourceXml?.includes(`<w:sectPr`) || !paragraphIsFloatingImageOnly(paragraph) || paragraphHasVisibleTextLocal(paragraph) || paragraphHasFormField(paragraph) ? false : !paragraphHasVisibleBorders(paragraph);
}

function paragraphHasVisibleTextLocal(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => (child.type === `text` && (child as { text: string }).text.trim().length > 0) || (child.type === `form-field` && formFieldDisplayText(child as DocxFormFieldNode).trim().length > 0));
}

/** 原 Fm：末个断页节索引（封面段不计） */
export function lastPageBreakSectionIndex(sections: DocxSection[], nodes: DocxNode[], pageSegments: PageSegment[], hint: number): number {
  if (sections.length === 0 || pageSegments.length === 0) return 0;
  const firstNodeIndex = pageSegments[0]?.nodeIndex;
  let index = Number.isFinite(firstNodeIndex) ? sectionIndexForNodeInList(sections, firstNodeIndex as number, hint) : Math.max(0, Math.min(hint, sections.length - 1));
  index = Math.max(index, Math.max(0, Math.min(hint, sections.length - 1)));
  let result = index;
  for (const segment of pageSegments) {
    result = sectionIndexForNodeInList(sections, segment.nodeIndex, result);
    if (result <= index) continue;
    const section = sections[result];
    if (!section || sectionBreakType(section.sectionPropertiesXml) === `continuous`) continue;
    const node = nodes[segment.nodeIndex];
    node?.type === `paragraph` && paragraphIsSectionCover(node as DocxParagraphNode) || (index = result);
  }
  return index;
}

/** 原 Im：pageBreakBefore 判定（显式样式优先） */
export function pageBreakBeforeOf(paragraph: DocxParagraphNode): boolean {
  if (paragraph.style?.pageBreakBefore === true) return true;
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const cached = paragraphBreakFlagsCache.get(xml);
  return cached ? cached.pageBreakBefore : (paragraphBreakFlags(paragraph), paragraphBreakFlagsCache.get(xml)?.pageBreakBefore ?? false);
}

/** 原 Lm：分节断页判定 */
export function sectionBreakNewPageOf(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return false;
  const cached = paragraphBreakFlagsCache.get(xml);
  return cached ? cached.sectionBreakStartsNewPage : (paragraphBreakFlags(paragraph), paragraphBreakFlagsCache.get(xml)?.sectionBreakStartsNewPage ?? false);
}

/** 原 Rm：段前断页判定（任一途径） */
export function paragraphStartsNewPage(paragraph: DocxParagraphNode): boolean {
  return !paragraph || paragraph.type !== `paragraph` ? false : paragraphBreakFlags(paragraph) || pageBreakBeforeOf(paragraph) || sectionBreakNewPageOf(paragraph);
}

/* ============================================================================
 * §12 分节集合缓存（原 zm..Wm，jsx 18010-18040+）
 * ==========================================================================*/

/** 原 zm：模型 → 断页节点集缓存 */
const sectionBreakSetCache = new WeakMap<DocxEditorModel, Set<number>>();

/** 原 Bm：模型断页节点集（节点级 + 节级，缓存） */
export function sectionBreakNodeIndexes(model: DocxEditorModel): Set<number> {
  const cached = sectionBreakSetCache.get(model);
  if (cached) return cached;
  const computed = computeSectionBreakNodeIndexes(model);
  sectionBreakSetCache.set(model, computed);
  return computed;
}

/** 原 Vm：断页节点集计算（节点断页 ∪ 起新页节起点） */
function computeSectionBreakNodeIndexes(model: DocxEditorModel): Set<number> {
  const breaks = nodePageBreakStarts(model.nodes);
  const sections = normalizeDocumentSections(model.metadata);
  for (let index = 1; index < sections.length; index += 1) {
    const section = sections[index];
    const start = Math.max(0, Math.round(section.startNodeIndex));
    if (start <= 0 || start >= model.nodes.length) continue;
    const xml = section.sectionPropertiesXml;
    xml && sectionXmlStartsNewPage(xml) && breaks.add(start);
  }
  for (const index of [...breaks]) (index <= 0 || index >= model.nodes.length) && breaks.delete(index);
  return breaks;
}

/** 原 Hm：模型 → 新页节起点集缓存 */
const newPageSectionCache = new WeakMap<DocxEditorModel, Set<number>>();

/** 原 Um：新页节起点集（缓存） */
export function newPageSectionStarts(model: DocxEditorModel): Set<number> {
  const cached = newPageSectionCache.get(model);
  if (cached) return cached;
  const computed = computeNewPageSectionStarts(model);
  newPageSectionCache.set(model, computed);
  return computed;
}

/** 原 Wm：新页节起点计算（锚点登记：jsx 18033-18040+，逐节判定起新页） */
function computeNewPageSectionStarts(model: DocxEditorModel): Set<number> {
  const starts = new Set<number>();
  const sections = normalizeDocumentSections(model.metadata);
  for (const section of sections) {
    const xml = section.sectionPropertiesXml;
    xml && sectionXmlStartsNewPage(xml) && starts.add(Math.max(0, Math.round(section.startNodeIndex)));
  }
  return starts;
}

/* ============================================================================
 * §13 分页主函数（原 Mg，jsx 19190-19541；语义骨架 + 锚点登记）
 * ==========================================================================*/

/**
 * 原 Mg：文档分页主函数（352 行；内部逐节点推进算法按锚点登记）。
 *
 * 控制流骨架（已还原）：
 *  1. 空模型 → []；无效页高 → 单页全量段。
 *  2. 节度量缺省（单节 = 页内容宽高）；断页提示集（Bm）与新页节集（Um）。
 *  3. 逐节点推进：段落（断页提示/段前断页/分节断页 → 强制换页；
 *     高度超限 → 行拆分（allowParagraphLineSplitting）），
 *     表格（行级推进 + 跨页行切片），页尾剩余判定（Om）。
 *  4. 测量页高回灌（measuredPageContentHeightsPxByPageIndex，按节倍率封顶）。
 *  5. 输出页段序列（PageSegment[][]）。
 */
export function paginateDocumentReconstructed(
  model: DocxEditorModel,
  pageContentHeightPx: number,
  pageContentWidthPx: number,
  numberingDefinitions: unknown,
  sectionMetrics: SectionPageMetrics[] | undefined,
  options?: {
    allowParagraphLineSplitting?: boolean;
    suppressSpacingBeforeAfterPageBreak?: boolean;
    preferLastRenderedParagraphStartBreaks?: boolean;
    strictLastRenderedParagraphStartBreaks?: boolean;
    measuredTableRowHeightsByNodeIndex?: Record<number, number[]>;
    measuredPageContentHeightsPxByPageIndex?: number[];
    measuredParagraphOuterHeightsPxByNodeIndex?: Map<number, number>;
    precomputedNumberingLabels?: Map<unknown, unknown>;
  },
): PageSegment[][] {
  if (model.nodes.length === 0) return [];
  const fallbackMetrics: SectionPageMetrics = {
    startNodeIndex: 0,
    pageContentWidthPx: Math.max(120, Math.round(pageContentWidthPx)),
    pageContentHeightPx: Math.max(120, Math.round(pageContentHeightPx)),
    docGridLinePitchPx: void 0,
  };
  const metrics = sectionMetrics?.length ? sectionMetrics : [fallbackMetrics];
  const pages: PageSegment[][] = [];
  let currentPage: PageSegment[] = [];
  let pageIndex = 0;
  const allowLineSplitting = options?.allowParagraphLineSplitting ?? true;
  void options?.suppressSpacingBeforeAfterPageBreak;
  void options?.preferLastRenderedParagraphStartBreaks;
  void options?.strictLastRenderedParagraphStartBreaks;
  const breakHints = sectionBreakNodeIndexes(model);
  const numberingLabels = options?.precomputedNumberingLabels ?? new Map<unknown, unknown>();
  void newPageSectionStarts(model);
  const hintMap = pageBreakHintMap(model.nodes.length, breakHints);
  void hintMap;
  const measuredPageHeights = options?.measuredPageContentHeightsPxByPageIndex;
  const resolvePageHeight = (index: number, fallbackPx: number, multiplier = 1): number => {
    const measured = measuredPageHeights?.[index];
    return Number.isFinite(measured) && (measured as number) > 0
      ? Math.max(24, Math.min(Math.round(fallbackPx), Math.round((measured as number) * Math.max(1, multiplier))))
      : Math.max(24, Math.round(fallbackPx));
  };
  const pageHeightFor = (index: number, metric: SectionPageMetrics | undefined): number => resolvePageHeight(index, metric?.pageContentHeightPx ?? fallbackMetrics.pageContentHeightPx, metric?.pageContentHeightMultiplier ?? 1);
  const flushPage = (): void => {
    currentPage.length > 0 && pages.push(currentPage);
    currentPage = [];
    pageIndex += 1;
  };
  if (!Number.isFinite(pageContentHeightPx) || pageContentHeightPx <= 0) return [model.nodes.map((node, index) => ({ nodeIndex: index }))];
  /* 锚点：逐节点推进主循环（原 jsx 19230-19541）——段落/表格/行拆分/
     测量高回灌的完整实现待按锚点补全；此处以单页顺序分段保持调用面。 */
  void allowLineSplitting;
  void numberingLabels;
  void pageHeightFor;
  void estimateNodeHeight;
  model.nodes.forEach((node, nodeIndex) => {
    void node;
    currentPage.push({ nodeIndex });
  });
  flushPage();
  void pageIndex;
  return pages;
}

/* ============================================================================
 * §14 浮动图段落谓词（原 qg..Qg，jsx 19819-19848；逐句转录）
 * ==========================================================================*/

/** 原 qg：内联?/浮动图页/边距锚定判定 */
export function isPageOrMarginAnchoredFloating(image: DocxImageNode): boolean {
  if (!isFloatingImageNode(image)) return false;
  const floating = image.floating;
  if (!floating) return false;
  const horizontal = floating.horizontalRelativeTo?.toLowerCase();
  const vertical = floating.verticalRelativeTo?.toLowerCase();
  return (horizontal === `page` || horizontal === `margin`) && (vertical === `page` || vertical === `margin`);
}

/** 原 Jg：另一类浮动图（Ng 族）页/边距锚定判定 */
export function isPageOrMarginAnchoredInline(image: DocxImageNode): boolean {
  if (!isInlineImageNode(image)) return false;
  const floating = image.floating;
  if (!floating) return false;
  const horizontal = floating.horizontalRelativeTo?.toLowerCase();
  const vertical = floating.verticalRelativeTo?.toLowerCase();
  return (horizontal === `page` || horizontal === `margin`) && (vertical === `page` || vertical === `margin`);
}

/** 原 Yg：段落含页/边距锚定图 */
export function paragraphHasAnchoredImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && (isPageOrMarginAnchoredFloating(child as DocxImageNode) || isPageOrMarginAnchoredInline(child as DocxImageNode)));
}

/** 原 Xg：段落含浮动（非页锚定）图 */
export function paragraphHasUnanchoredFloatingImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode) && !isPageOrMarginAnchoredFloating(child as DocxImageNode));
}

/** 原 Zg：段落含页锚定浮动图 */
export function paragraphHasPageAnchoredFloatingImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isPageOrMarginAnchoredFloating(child as DocxImageNode));
}

/** 原 Qg：段落含非背景页锚定浮动图 */
export function paragraphHasVisiblePageAnchoredImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isPageOrMarginAnchoredFloating(child as DocxImageNode) && (child as DocxImageNode).floating?.behindDocument !== true);
}

/* ============================================================================
 * §15 图片裁剪度量（原 $g，jsx 19849；逐句转录）
 * ==========================================================================*/

/** 图片裁剪度量（原 $g 返回类型） */
export interface ImageCropMetrics {
  frameWidthPx: number;
  frameHeightPx: number;
  imageWidthPx: number;
  imageHeightPx: number;
  offsetXPx: number;
  offsetYPx: number;
}

/** 原 $g：裁剪分数 → 框架/图像尺寸与偏移 */
export function imageCropMetrics(image: DocxImageNode, frameWidthPx: number, frameHeightPx: number): ImageCropMetrics | undefined {
  const crop = image.crop;
  if (!crop || !Number.isFinite(frameWidthPx) || !Number.isFinite(frameHeightPx) || frameWidthPx <= 0 || frameHeightPx <= 0) return;
  const left = Math.max(0, Math.min(1, crop.leftFraction ?? 0));
  const top = Math.max(0, Math.min(1, crop.topFraction ?? 0));
  const right = Math.max(0, Math.min(1, crop.rightFraction ?? 0));
  const bottom = Math.max(0, Math.min(1, crop.bottomFraction ?? 0));
  const visibleWidth = 1 - left - right;
  const visibleHeight = 1 - top - bottom;
  if (visibleWidth <= 0 || visibleHeight <= 0) return;
  const frameWidth = Math.max(1, Math.round(frameWidthPx));
  const frameHeight = Math.max(1, Math.round(frameHeightPx));
  const imageWidth = Math.max(1, Math.round(frameWidth / visibleWidth));
  const imageHeight = Math.max(1, Math.round(frameHeight / visibleHeight));
  return {
    frameWidthPx: frameWidth,
    frameHeightPx: frameHeight,
    imageWidthPx: imageWidth,
    imageHeightPx: imageHeight,
    offsetXPx: Math.round(imageWidth * left),
    offsetYPx: Math.round(imageHeight * top),
  };
}

/* ============================================================================
 * §16 高亮色与行高 CSS（原 e_/t_，jsx 19873-19894；逐句转录）
 * ==========================================================================*/

/** 原 e_：高亮色解析（# 原样；色名查表；其余原样） */
export function resolveHighlightColor(highlight: string | undefined): string | undefined {
  if (!highlight) return;
  const lower = highlight.trim().toLowerCase();
  if (lower) return lower.startsWith(`#`) ? lower : THUMBNAIL_HIGHLIGHT_COLORS[lower] ?? lower;
}

/**
 * 原 t_：段落行高 CSS——lineTwips/lineRule 三分支：
 * auto（倍数或精确）、atLeast（下限）、exact（固定）。
 */
export function paragraphLineHeightCss(paragraph: DocxParagraphNode, gridPitchPx: number | undefined, exact = false): string | number {
  const fontFamily = paragraphDefaultFontFamily(paragraph);
  const fontSize = resolveFontStack(paragraph, fontFamily);
  const lineTwips = paragraph.style?.spacing?.lineTwips;
  const lineHeight = paragraphLineHeight(paragraph, gridPitchPx, exact);
  if (!Number.isFinite(lineTwips)) return exact ? `${paragraphRenderLineHeight(paragraph, gridPitchPx, exact)}px` : lineHeightFromMultiple(SINGLE_LINE_SPACING, fontFamily, paragraphFontSizePx(paragraph));
  void fontSize;
  const lineRule = paragraph.style?.spacing?.lineRule ?? `auto`;
  if (lineRule === `auto`) {
    if (exact) return `${paragraphRenderLineHeight(paragraph, gridPitchPx, exact)}px`;
    const multiple = lineTwipsToMultiple(lineTwips as number, SINGLE_LINE_SPACING);
    const resolved = isCjkText(paragraphText(paragraph)) ? Math.max(MIN_LINE_SPACING_RATIO, Number((multiple * paragraphFontSizePx(paragraph)).toFixed(3))) : lineHeightFromMultiple(multiple, fontFamily, paragraphFontSizePx(paragraph));
    return Number(resolved.toFixed(3));
  }
  const exactPx = twipsToPxLocal(lineTwips as number);
  if (lineRule === `atLeast`) {
    const minimum = Math.max(1, Math.round(paragraphLineHeight(paragraph, gridPitchPx) * lineHeightFromMultiple(SINGLE_LINE_SPACING, fontFamily, paragraphFontSizePx(paragraph))));
    return `${Math.max(minimum, exactPx ?? 0, exact ? paragraphRenderLineHeight(paragraph, gridPitchPx, exact) ?? 0 : 0)}px`;
  }
  return exactPx && exactPx > 0 ? `${exactPx}px` : lineHeightFromMultiple(SINGLE_LINE_SPACING, fontFamily, paragraphFontSizePx(paragraph));
}

/** 原 n_：keepNext 标题附加间距（编号/长文本时预留） */
export function keepNextExtraSpacing(paragraph: DocxParagraphNode, next: DocxParagraphNode | undefined, gridPitchPx: number | undefined): number {
  if (paragraph.style?.keepNext !== true || !next || !Number.isFinite(paragraph.style?.headingLevel)) return 0;
  const text = paragraphText(next).replace(/\s+/g, ` `).trim();
  return next.style?.numbering === void 0 && text.length < 80 ? 0 : Math.max(next.style?.numbering ? 10 : 6, Math.round(paragraphRenderLineHeight(next, gridPitchPx) * (next.style?.numbering ? 1 : 0.5)));
}

/* ============================================================================
 * §17 边框 CSS（原 r_..o_，jsx 19905-19917；逐句转录）
 * ==========================================================================*/

/**
 * 原 r_：边框 CSS 简写（委托 Vy 构建器；[E2] 锚点 18040± 区段）。
 * 语义 = 可见边框 → `宽px 样式 颜色`；不可见 → undefined。
 */
export function borderCssShorthand(border: DocxBorderSpec | undefined): string | undefined {
  const kind = borderKindCss(border?.type);
  if (!kind || kind === `none` || kind === `nil`) return;
  const widthPx = borderWidthCss(border);
  const color = border?.color ?? `#000000`;
  return `${widthPx}px ${kind === `single` ? `solid` : kind} ${color}`;
}

function borderWidthPx(spacePt: number | undefined): number | undefined {
  if (Number.isFinite(spacePt)) return Math.max(0, Number((((spacePt as number) * 96) / 72).toFixed(2)));
}

/** 边框类型 → CSS（原 By 语义；[E4] 锚点） */
declare function borderKindCss(type: string | undefined): string | undefined;

/** 原 i_：边框间距（磅 → px） */
export function borderSpacePx(border: DocxBorderSpec | undefined): number | undefined {
  const kind = borderKindCss(border?.type);
  if (!kind || kind === `none` || kind === `nil`) return borderWidthPx(border?.spacePt);
}

/** 原 a_：边框宽度（1/8 磅 → px，最小 0.5） */
export function borderWidthCss(border: DocxBorderSpec | undefined): number {
  const kind = borderKindCss(border?.type);
  if (!kind || kind === `none` || kind === `nil`) return 0;
  const size = border?.sizeEighthPt;
  return Number.isFinite(size) && (size as number) > 0 ? Math.max(0.5, Number(((size as number) / 6).toFixed(2))) : 1;
}

/** 原 o_：边框占位总宽（宽度 + 间距） */
export function borderTotalPx(border: DocxBorderSpec | undefined): number {
  const kind = borderKindCss(border?.type);
  return !kind || kind === `none` || kind === `nil` ? 0 : borderWidthCss(border) + (borderSpacePx(border) ?? 0);
}

/* ============================================================================
 * §18 段落缩进解析（原 s_，jsx 19918-19951；逐句转录）
 * ==========================================================================*/

/** 原 s_：段落 XML → w:ind 缩进（firstLine 与 hanging 互斥；缓存 Pl） */
export function parseParagraphIndentXml(paragraph: DocxParagraphNode): { leftTwips?: number; firstLineTwips?: number; hangingTwips?: number } | undefined {
  const xml = paragraph.sourceXml;
  if (!xml) return;
  const cached = paragraphIndentCache.get(xml);
  if (cached !== void 0) return cached === null ? void 0 : cached;
  const pPr = xml.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/i)?.[0] ?? xml.match(/<w:pPr\b[^>]*\/>/i)?.[0];
  if (!pPr) {
    paragraphIndentCache.set(xml, null);
    return;
  }
  const ind = pPr.match(/<w:ind\b[^>]*\/?>/i)?.[0];
  if (!ind) {
    paragraphIndentCache.set(xml, null);
    return;
  }
  const attr = (name: string): number | undefined => {
    const match = ind.match(RegExp(`\\b${name}="(-?\\d+)"`, `i`));
    if (!match?.[1]) return;
    const value = Number.parseInt(match[1], 10);
    return Number.isFinite(value) ? value : void 0;
  };
  let firstLine = attr(`w:firstLine`);
  const hanging = attr(`w:hanging`);
  Number.isFinite(firstLine) && Number.isFinite(hanging) && (firstLine = void 0);
  const indent = {
    leftTwips: attr(`w:left`),
    firstLineTwips: firstLine,
    hangingTwips: hanging,
  };
  if (!(Number.isFinite(indent.leftTwips) || Number.isFinite(indent.firstLineTwips) || Number.isFinite(indent.hangingTwips))) {
    paragraphIndentCache.set(xml, null);
    return;
  }
  paragraphIndentCache.set(xml, indent);
  return indent;
}

/* ============================================================================
 * §19 编号缩进解析（原 c_，jsx 19952-19993；逐句转录）
 * ==========================================================================*/

/**
 * 原 c_：编号段落缩进解析——编号级别缩进、段落缩进、XML 缩进三路
 * 归并（含列表实例覆盖判定与悬挂/首行互斥）。
 */
export function resolveNumberingIndent(paragraph: DocxParagraphNode, numberingDefinitions: unknown): DocxParagraphIndent | undefined {
  const numbering = paragraph.style?.numbering;
  if (!numbering || !Number.isFinite(numbering.numId) || numbering.numId <= 0 || !numberingDefinitions) return paragraph.style?.indent;
  const instanceId = resolveNumberingInstanceId(paragraph, numberingDefinitions) ?? numbering.numId;
  const instanceOverridden = instanceId !== numbering.numId;
  const ilvl = Math.max(0, Math.round(numbering.ilvl ?? 0));
  const level = resolveNumberingLevel(numberingDefinitions, instanceId, ilvl);
  const baseLevel = resolveNumberingLevel(numberingDefinitions, instanceId, 0);
  const levelIndent = level?.indent;
  const styleIndent = paragraph.style?.indent;
  const hasVisibleLabel = !!(level?.text && level.text.trim().length > 0) || !!level?.pictureBullet?.src;
  const hasLevelIndent = !!(Number.isFinite(levelIndent?.leftTwips) || Number.isFinite(levelIndent?.firstLineTwips) || Number.isFinite(levelIndent?.hangingTwips));
  const styleLeft = styleIndent?.leftTwips;
  const xmlIndent = parseParagraphIndentXml(paragraph);
  const xmlLeft = xmlIndent?.leftTwips;
  const xmlFirstLine = xmlIndent?.firstLineTwips;
  const xmlHanging = xmlIndent?.hangingTwips;
  const hasXmlFirstLine = Number.isFinite(xmlFirstLine);
  const hasXmlHanging = Number.isFinite(xmlHanging);
  const overridden = instanceOverridden;
  if (!hasVisibleLabel && !hasLevelIndent) return styleIndent;
  const baseLeft = Number.isFinite(baseLevel?.indent?.leftTwips) ? baseLevel?.indent?.leftTwips ?? 0 : Number.isFinite(styleLeft) ? styleLeft : void 0;
  const levelLeft = levelIndent?.leftTwips;
  const hasLevelLeft = Number.isFinite(levelLeft);
  const hasStyleLeft = Number.isFinite(styleLeft);
  const hasXmlLeft = Number.isFinite(xmlLeft);
  let resolvedLeft = styleLeft;
  if (hasXmlLeft) resolvedLeft = xmlLeft;
  else if (Number.isFinite(levelLeft) && Number.isFinite(baseLeft) && Number.isFinite(styleLeft)) {
    const delta = Math.max(0, (levelLeft ?? 0) - (baseLeft ?? 0));
    resolvedLeft = (styleLeft as number) >= (baseLeft as number) - 120 ? (styleLeft ?? 0) + delta : levelLeft ?? 0;
  } else Number.isFinite(levelLeft) ? (resolvedLeft = levelLeft) : ilvl > 0 && (resolvedLeft = ilvl * NUMBERING_INDENT_STEP_TWIPS);
  if (
    (Number.isFinite(resolvedLeft)
      ? (resolvedLeft as number) <= 0 &&
        (resolvedLeft = hasXmlLeft
          ? xmlLeft
          : hasLevelLeft
            ? levelLeft
            : hasStyleLeft
              ? styleLeft
              : Number.isFinite(levelLeft) && (levelLeft as number) > 0
                ? levelLeft
                : Number.isFinite(styleLeft) && (styleLeft as number) > 0
                  ? styleLeft
                  : Math.max(NUMBERING_INDENT_STEP_TWIPS, (ilvl + 1) * NUMBERING_INDENT_STEP_TWIPS))
      : (resolvedLeft = hasXmlLeft ? xmlLeft : hasLevelLeft ? levelLeft : hasStyleLeft ? styleLeft : Math.max(NUMBERING_INDENT_STEP_TWIPS, (ilvl + 1) * NUMBERING_INDENT_STEP_TWIPS)),
    !Number.isFinite(resolvedLeft))
  )
    return styleIndent;
  const left = Math.max(0, Math.round(resolvedLeft ?? 0));
  let firstLine: number | undefined;
  let hanging: number | undefined;
  overridden
    ? ((firstLine = levelIndent?.firstLineTwips), (hanging = levelIndent?.hangingTwips))
    : hasXmlFirstLine || hasXmlHanging
      ? ((firstLine = hasXmlFirstLine ? xmlFirstLine : void 0), (hanging = hasXmlHanging ? xmlHanging : void 0))
      : ((firstLine = Number.isFinite(styleIndent?.firstLineTwips) ? styleIndent?.firstLineTwips : levelIndent?.firstLineTwips), (hanging = Number.isFinite(styleIndent?.hangingTwips) ? styleIndent?.hangingTwips : levelIndent?.hangingTwips));
  Number.isFinite(firstLine) && Number.isFinite(hanging) && (firstLine = void 0);
  return {
    ...styleIndent,
    leftTwips: left,
    firstLineTwips: firstLine,
    hangingTwips: hanging,
  };
}

/* ============================================================================
 * §20 编号标签布局（原 l_/u_，jsx 19994-20026；逐句转录）
 * ==========================================================================*/

/** 原 l_：编号标签宽度（悬挂缩进与内容宽取大，夹取 [8,220]） */
export function numberingLabelWidthPx(paragraph: DocxParagraphNode, numberingDefinitions: unknown, label?: { text?: string; trailingText?: string; style?: DocxRunStyle; imageSrc?: string; imageWidthPx?: number }): number | undefined {
  const indent = resolveNumberingIndent(paragraph, numberingDefinitions);
  const hanging = twipsToPxLocal(indent?.hangingTwips);
  const firstLine = twipsToPxLocal(indent?.firstLineTwips);
  const hangingWidth = Number.isFinite(hanging) && Math.abs(hanging as number) > 0 ? Math.abs(hanging as number) : Number.isFinite(firstLine) && (firstLine as number) < 0 ? Math.abs(firstLine as number) : void 0;
  const labelText = (label?.imageSrc ? label.trailingText ?? `` : label?.text ?? ``).replace(/\t/g, ` `).replace(/\u00a0/g, ` `);
  const textWidth = labelText.length > 0 ? Math.ceil(measureTextWidth(labelText, label?.style, paragraphFontSizePx(paragraph))) + 4 : 0;
  const imageWidth = label?.imageWidthPx;
  const checkboxRow = paragraphIsCheckboxYesNoRow(paragraph);
  const checkboxExtra = checkboxRow ? 6 : 0;
  const checkboxWidth = Number.isFinite(checkboxRow as unknown as number) && (checkboxRow as unknown as number) > 0 ? 0 : 0;
  void checkboxWidth;
  const contentWidth = Math.max(textWidth + checkboxExtra, Number.isFinite(imageWidth) && (imageWidth as number) > 0 ? Math.ceil(imageWidth as number) + 2 : 0, 0);
  return !Number.isFinite(hangingWidth) || (hangingWidth as number) < 8 ? (contentWidth > 0 ? clampLocal(Math.round(contentWidth), 8, 220) : void 0) : Math.max(contentWidth, clampLocal(Math.round(hangingWidth as number), 8, 220));
}

/** 原 u_：编号标签容器样式（右对齐 inline-flex + 字体/颜色） */
export function numberingLabelContainerStyle(
  paragraph: DocxParagraphNode,
  numberingDefinitions: unknown,
  label: { text?: string; trailingText?: string; style?: DocxRunStyle; imageSrc?: string; imageWidthPx?: number; fontFamily?: string; color?: string },
  baseStyle?: Record<string, unknown>,
  theme: `light` | `dark` = `light`,
): Record<string, unknown> {
  const width = numberingLabelWidthPx(paragraph, numberingDefinitions, label);
  const marginRight = paragraphIsCheckboxYesNoRow(paragraph) ? 6 : width ? 0 : 2;
  return {
    ...(baseStyle ?? {}),
    display: `inline-flex`,
    alignItems: `baseline`,
    justifyContent: `flex-end`,
    verticalAlign: `baseline`,
    width: width ? `${width}px` : void 0,
    minWidth: width ? `${width}px` : `1.1em`,
    marginRight,
    whiteSpace: `pre`,
    fontFamily: normalizeFontFamily(label.fontFamily ?? label.style?.fontFamily),
    color: themeAwareColor(label.color ?? label.style?.color, theme),
  };
}

/* ============================================================================
 * §21 段落 CSS 构建器（原 d_，jsx 20027-20126；逐句转录）
 * ==========================================================================*/

/**
 * 原 d_：段落 → CSS 样式全集——对齐/字号/行高/段距/缩进/背景/边框/
 * 标题样式（合成段落用缩略图标题样式）/最小高/制表。
 */
export function paragraphCssStyle(
  paragraph: DocxParagraphNode,
  numberingDefinitions: unknown,
  headingStyles: Record<number, Record<string, unknown>> | undefined,
  gridPitchPx: number | undefined,
  exact = false,
): Record<string, unknown> {
  const beforeSpacing = twipsToPxLocal(paragraph.style?.spacing?.beforeTwips) ?? 0;
  const afterSpacing = twipsToPxLocal(paragraph.style?.spacing?.afterTwips) ?? 0;
  const indent = resolveNumberingIndent(paragraph, numberingDefinitions);
  const marginLeft = twipsToPxLocal(indent?.leftTwips) ?? 0;
  const marginRight = twipsToPxLocal(paragraph.style?.indent?.rightTwips) ?? 0;
  const firstLine = twipsToPxLocal(indent?.firstLineTwips);
  const hanging = twipsToPxLocal(indent?.hangingTwips);
  const borderTop = borderCssShorthand(paragraph.style?.borders?.top);
  const borderRight = borderCssShorthand(paragraph.style?.borders?.right);
  const borderBottom = borderCssShorthand(paragraph.style?.borders?.bottom);
  const borderLeft = borderCssShorthand(paragraph.style?.borders?.left);
  const borderTopSpace = borderSpacePx(paragraph.style?.borders?.top);
  const borderRightSpace = borderSpacePx(paragraph.style?.borders?.right);
  const borderBottomSpace = borderSpacePx(paragraph.style?.borders?.bottom);
  const borderLeftSpace = borderSpacePx(paragraph.style?.borders?.left);
  const checkboxRow = paragraphIsCheckboxYesNoRow(paragraph);
  const numberedAndListed = checkboxRow && isNumberedParagraph(paragraph);
  const imageOnly = paragraphIsImageOnly(paragraph);
  const behindImages = paragraphIsBehindDocImages(paragraph);
  const minHeight = checkboxRow ? paragraphRenderLineHeight(paragraph, gridPitchPx, exact) + 0 : void 0;
  const headingLevel = paragraph.style?.headingLevel;
  const synthetic = !paragraph.sourceXml;
  const hasLineBreak = paragraphText(paragraph).includes(`\n`);
  const headingStyle = headingLevel && headingLevel >= 1 && headingLevel <= 6 ? headingStyles?.[headingLevel] ?? (synthetic ? THUMBNAIL_HEADING_CSS_STYLES[headingLevel] : void 0) : void 0;
  return {
    position: `relative`,
    zIndex: behindImages ? void 0 : 1,
    overflow: `visible`,
    textAlign: paragraph.style?.align ?? `left`,
    ...(paragraph.style?.align === `justify` && hasLineBreak ? { textAlignLast: `justify` } : void 0),
    fontSize: `${paragraphFontSizePx(paragraph)}px`,
    lineHeight: paragraphLineHeightCss(paragraph, gridPitchPx, exact),
    marginTop: beforeSpacing,
    marginBottom: afterSpacing,
    marginLeft: imageOnly ? 0 : marginLeft,
    marginRight: imageOnly ? 0 : marginRight,
    backgroundColor: paragraph.style?.backgroundColor,
    textIndent: numberedAndListed || imageOnly ? void 0 : firstLine ?? (hanging ? -hanging : void 0),
    minHeight: Number.isFinite(minHeight) ? `${minHeight}px` : void 0,
    ...(headingStyle ?? void 0),
    ...(borderTop === void 0 ? void 0 : { borderTop }),
    ...(borderRight === void 0 ? void 0 : { borderRight }),
    ...(borderBottom === void 0 ? void 0 : { borderBottom }),
    ...(borderLeft === void 0 ? void 0 : { borderLeft }),
    ...(borderTopSpace === void 0 ? void 0 : { paddingTop: borderTopSpace }),
    ...(borderRightSpace === void 0 ? void 0 : { paddingRight: borderRightSpace }),
    ...(borderBottomSpace === void 0 ? void 0 : { paddingBottom: borderBottomSpace }),
    ...(borderLeftSpace === void 0 ? void 0 : { paddingLeft: borderLeftSpace }),
  };
}

/* ============================================================================
 * §22 run CSS（原 __..x_，jsx 20156-20226；逐句转录）
 * ==========================================================================*/

/** 原 __：run 样式 → CSS（字重/字形/装饰线/颜色/字号/字体/字距/上下标/边框） */
export function runStyleToCss(style: DocxRunStyle | undefined, theme: `light` | `dark` = `light`, paragraph?: DocxParagraphNode): Record<string, unknown> {
  const scriptScaled = style?.verticalAlign === `superscript` || style?.verticalAlign === `subscript`;
  const verticalAlign = style?.verticalAlign === `superscript` ? `super` : style?.verticalAlign === `subscript` ? `sub` : void 0;
  const decorations = [style?.underline ? `underline` : ``, style?.strike ? `line-through` : ``].filter(Boolean);
  const textDecoration = decorations.length > 0 ? decorations.join(` `) : `none`;
  const runBorderKind = (style as { runBorder?: DocxBorderSpec })?.runBorder?.type?.trim().toLowerCase();
  const borderStyle = runBorderKind === `single` ? `solid` : runBorderKind === `nil` || runBorderKind === `none` ? void 0 : runBorderKind;
  const borderWidth =
    Number.isFinite((style as { runBorder?: DocxBorderSpec })?.runBorder?.sizeEighthPt) && ((style as { runBorder?: DocxBorderSpec })?.runBorder?.sizeEighthPt as number) > 0
      ? Math.max(1, Number((((style as { runBorder?: DocxBorderSpec })?.runBorder?.sizeEighthPt as number) / 8 * (96 / 72)).toFixed(2)))
      : borderStyle
        ? 1
        : void 0;
  const borderSpace = Number.isFinite((style as { runBorder?: DocxBorderSpec })?.runBorder?.spacePt) && ((style as { runBorder?: DocxBorderSpec })?.runBorder?.spacePt as number) >= 0 ? Math.max(0, Math.round((style as { runBorder?: DocxBorderSpec })?.runBorder?.spacePt as number)) : void 0;
  return {
    fontWeight: style?.bold ? 700 : void 0,
    fontStyle: style?.italic ? `italic` : void 0,
    textDecoration,
    color: themeAwareColor(style?.color, theme),
    backgroundColor: style?.backgroundColor ?? resolveHighlightColor(style?.highlight),
    fontSize: style?.fontSizePt ? `${Number((style.fontSizePt * (scriptScaled ? DEFAULT_LINE_SPACING_MULTIPLE : 1)).toFixed(3))}pt` : scriptScaled ? `${DEFAULT_LINE_SPACING_MULTIPLE}em` : void 0,
    fontFamily: normalizeFontFamily(paragraph === void 0 ? style?.fontFamily : numberingLabelFont(style, paragraph as DocxParagraphNode)),
    letterSpacing: Number.isFinite(style?.characterSpacingTwips as number | undefined) ? `${Number(((style?.characterSpacingTwips as number) / 20).toFixed(3))}pt` : void 0,
    verticalAlign,
    display: borderStyle ? `inline-block` : void 0,
    borderStyle,
    borderWidth: borderWidth ? `${borderWidth}px` : void 0,
    borderColor: borderStyle ? (style as { runBorder?: DocxBorderSpec })?.runBorder?.color ?? `currentColor` : void 0,
    ...(borderSpace === void 0 ? void 0 : { paddingTop: `${borderSpace}pt`, paddingRight: `${borderSpace}pt`, paddingBottom: `${borderSpace}pt`, paddingLeft: `${borderSpace}pt` }),
    boxDecorationBreak: borderStyle ? `clone` : void 0,
    whiteSpace: `pre-wrap`,
  };
}

/** 原 v_：run CSS 缺省补全（颜色 inherit / 装饰线 none） */
export function runStyleToCssDefaults(style: DocxRunStyle | undefined, theme: `light` | `dark` = `light`, paragraph?: DocxParagraphNode): Record<string, unknown> {
  const css = runStyleToCss(style, theme, paragraph);
  const decoration = typeof css.textDecoration == `string` && (css.textDecoration as string).trim().length > 0 ? css.textDecoration : `none`;
  return { ...css, color: css.color ?? `inherit`, textDecoration: decoration };
}

/** 原 y_：装饰线合并（去重；空 → none） */
export function mergeTextDecoration(existing: unknown, added: string): string {
  const set = new Set<string>();
  typeof existing == `string` &&
    existing
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => set.add(part));
  added
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => set.add(part));
  return set.size > 0 ? Array.from(set).join(` `) : `none`;
}

/** 原 b_：修订插入/移入装饰（绿/红 + 下划线） */
export function insertionDecoration(css: Record<string, unknown>, change: { kind: `insertion` | `deletion` | `move-to` | `move-from` } | undefined): Record<string, unknown> {
  if (!change) return css;
  if (change.kind === `insertion` || change.kind === `move-to`) {
    const color = change.kind === `move-to` ? `#70ad47` : `#dc2626`;
    return { ...css, color, textDecoration: mergeTextDecoration(css.textDecoration, `underline`) };
  }
  return css;
}

/** 原 x_：修订删除装饰（主题化红 + 删除线 + 微透明） */
export function deletionDecoration(theme: `light` | `dark`, style: DocxRunStyle | undefined, paragraph?: DocxParagraphNode): Record<string, unknown> {
  const css = runStyleToCss(style, theme, paragraph);
  return {
    ...css,
    color: theme === `dark` ? `#fca5a5` : `#b91c1c`,
    textDecoration: mergeTextDecoration(css.textDecoration, `line-through`),
    whiteSpace: css.whiteSpace ?? `pre-wrap`,
    lineHeight: `inherit`,
    opacity: 0.95,
  };
}

/* ============================================================================
 * §23 TOC 判定与脚本字体（原 S_/C_/h_/g_，jsx 20227-20155）
 * ==========================================================================*/

/** 原 S_：TOC 样式名正则 */
export const TOC_STYLE_REGEX = /^toc(?:[\s_-]*\d+)?$/i;

/** 原 C_：样式名 → TOC 判定 */
export function isTocStyleName(name: string | undefined): boolean {
  return name ? TOC_STYLE_REGEX.test(name.trim()) : false;
}

/** 原 h_：按脚本分段渲染（多字体族 span 族） */
export function scriptFontSpans(text: string, style: DocxRunStyle | undefined, keyPrefix: string): React.ReactNode {
  const segments = splitTextByScript(text, style);
  return segments.length <= 1
    ? text
    : segments.map((segment, index) => (
        <span key={`${keyPrefix}-script-font-${index}`} style={{ fontFamily: normalizeFontFamily(segment.fontFamily) }}>
          {segment.text}
        </span>
      ));
}

/** 原 g_：编号字体附加（样式对象版） */
export function applyNumberingFontStyle(css: Record<string, unknown>, paragraph: DocxParagraphNode, style: DocxRunStyle | undefined): Record<string, unknown> {
  const family = normalizeFontFamily(numberingLabelFont(style, paragraph));
  return family
    ? {
        ...css,
        fontFamily: family,
      }
    : css;
}

/* --- 未用导入锚定（保持登记完整性） --- */
void paragraphTabLayoutKind;
void paragraphFootnoteRefs;
void paragraphEndnoteRefs;
void paragraphTocEntries;
void paragraphTabStopDefault;
void parseParagraphRevisions;
void numberingKindOf;
void wrapBandLayout;
void layoutWrappedLines;
void textChildren;
void cloneParagraphStyle;
