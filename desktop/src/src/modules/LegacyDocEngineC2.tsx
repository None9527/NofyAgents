/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineC2.tsx — legacy-doc 内部引擎 C 下（解混淆重建 · B5-08 · 批次 C）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （只读；行号锚点均指 jsx 还原孪生
 *   src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx）
 *
 * 本文件覆盖（jsx 行号）：
 *  §C [E6]c 渲染助手与编辑器 reducer 全量实体化  20944-24337（195 符号）
 *     此前仅锚点登记 + declare 契约（批 B / C3），本批逐字实体化。
 *  §D 依赖补全（本批范围外、但 §C 必需者）：
 *     Ig (19564) / Lg (19576) / Rg (19649) / Gg (19788)
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射（jsx 行号；把握度：高/中）
 * ----------------------------------------------------------------------------
 * §1 域结果解析：
 *   gv → pageFieldResultsCache (20944) | _v → paragraphPageFieldResults (20945)
 *   vv → styleRefFieldResultsCache (20998) | yv → paragraphStyleRefFieldResults (20999)
 *   bv → normalizeStyleName (21052) | xv → tocFieldFallback (21055)
 * §2 引导符/脚注/日期：
 *   Sv → leaderBackgroundStyle (21074) | Cv → noteReferenceMark (21094)
 *   wv → normalizeDateToIso (21104)
 * §3 段落 run 渲染器：
 *   Tv → renderParagraphRuns (21113-21684，JSX；10 参)
 * §4 编号格式与标签：
 *   Ev → romanNumeralOf (21685) | Dv → letterOrdinalOf (21693)
 *   Ov → numberInFormat (21703) | kv → formatPageNumber (21728)
 *   Av → numberingLevelOf (21732) | jv → numberingLevelHasVisibleBullet (21736)
 *   Mv → numberingLevelIsBullet (21739) | Nv → numberingLevelsOf (21742)
 *   Pv → effectiveNumIdOfParagraph (21746) | Fv → numberingLevelStart (21771)
 *   Iv → numberingSuffixText (21777) | Lv → BULLET_GLYPH_REPLACEMENTS (21780)
 *   Rv → replaceBulletGlyphs (21785) | zv → numberingLabelsForModel (21792)
 * §5 列表文本族：
 *   Bv → UNORDERED_BULLET_PREFIX_REGEX (21878) | Vv → ORDERED_DOT_PREFIX_REGEX (21878)
 *   Hv → ANY_LIST_PREFIX_REGEX (21878) | Uv → ORDERED_PREFIX_REGEX (21878)
 *   Wv → LIST_INDENT_TWIPS=720 (21878) | Gv → LIST_HANGING_TWIPS=360 (21878)
 *   Kv → MAX_NUMBERING_DEPTH_DEFAULT=8 (21878)
 *   qv → looksUnordered (21885) | Jv → looksOrdered (21888)
 *   Yv → textIsBulletGlyphs (21891) | Xv → paragraphHasNumbering (21895)
 *   Zv → numberingKindOf (21898) | Qv → isNumberedParagraph (21913)
 *   $v → stripListPrefix (21917) | ey → listPrefixLength (21920)
 *   ty → orderedSuccessor (21922) | ny → applyListPrefix (21928)
 * §6 结构克隆与段落/单元格构造：
 *   ry → cloneBorderSide (21933) | iy → cloneParagraphBorders (21938)
 *   ay → cloneParagraphStyle (21948) | oy → cloneParagraphStyleWithDefaultSpacing (21969)
 *   sy → cloneMarginTwips (21983) | cy → cloneTableBorderSide (21991)
 *   ly → cloneTableBorders (21998) | uy → cloneCellStyle (22011)
 *   dy → cloneRowStyle (22018) | fy → emptyParagraph (22024)
 *   py → cloneCell (22037) | my → maxNumberingDepth (22048)
 *   hy → shiftIndent (22057) | gy → applyListIndent (22066)
 *   _y → removeListIndent (22081) | vy → cellParagraphsSignature (22099)
 * §7 表格几何：
 *   yy → tableMaxColumnCount (22103) | by → floatingTableSide (22106)
 *   xy → floatingTableWidthPx (22112) | Sy → floatingTableLayout (22118)
 *   Cy → floatingTableStyle (22150) | wy → locateNestedTable (22173)
 *   Ty → tableGridWidthsCache (22207) | Ey → tableGridWidthsCached (22208)
 *   Dy → tableGridWidthsTwips (22215) | Oy → gridWidthsDivergeFromCells (22222)
 *   ky → gridWidthsFromCellWidths (22240) | Ay → normalizeGridWidthsTwips (22266)
 *   jy → normalizeGridWidthsPx (22276) | My → evenGridWidthsPx (22285)
 *   Ny → clampTableContentWidthPx (22291) | Py → scaleGridWidthsToPx (22294)
 *   Fy → rowColumnSpanCount (22336) | Iy → effectiveColumnWidthsPx (22339)
 *   Ly → cellMarginsPx (22378) | Ry → cellPaddingStyle (22385)
 *   zy → effectiveCellMarginTwips (22400) | db → diagonalBordersBackground (22884)
 * §8 边框预设：
 *   By → borderTypeNormalized (22408) | Vy → borderSideCss (22411)
 *   Hy → borderSideWidthPx (22421) | Uy → borderTypeVisible (22427)
 *   Wy → paragraphBorderVisible (22431) | Gy → tableBorderVisible (22434)
 *   Ky → cellBordersVisible (22437) | qy → tableUsesCellBorders (22440)
 *   Jy → tableBorderSpacingPx (22446) | Yy → tableBorderCollapseStyle (22451)
 *   Xy → firstParagraphBorder (22458) | Zy → firstTableBorder (22461)
 *   Qy → normalizeParagraphBorderSpec (22464) | $y → normalizeTableBorderSpec (22472)
 *   eb → nilParagraphBorder (22481) | tb → nilTableBorder (22486)
 *   nb → paragraphBorderPresets (22491) | rb → paragraphsMatchBorderPreset (22514)
 *   ib → toggleTableCellBorder (22553) | ab → tableBorderPresets (22619)
 *   ob → toggleParagraphBorder (22644) | sb → toggleTableBorder (22727)
 *   cb → cellBorderForSide (22839) | lb → cellBorderCss (22848)
 *   ub → tableOuterBorderWidthPx (22868)
 * §9 run/表单域克隆与文本编辑：
 *   fb → cloneRunStyle (22901) | pb → withFontFamily (22906)
 *   mb → cloneFormFieldWidget (22913) | hb → mergeFormFieldWidget (22934)
 *   gb → cloneFormField (22970) | _b → sameJson (22993)
 *   vb → normalizeParagraphChildren (22996) | yb → paragraphChildrenAllText (23027)
 *   bb → cloneTextNode (23030) | xb → splitChildrenAt (23041)
 *   Sb → runStyleAt (23074) | Cb → linkFrom (23088)
 *   wb → linkWithin (23102) | Tb → expandLinkAt (23122)
 *   Eb → applyRunStyleToRange (23154) | Db → applyLinkToRange (23216)
 *   Ob → bytesToBase64Inline (23278)
 * §10 位置/批注/修订：
 *   kb → selectionCoversCell (23288) | Ab → locationKeyContract (23291)
 *   jb → imageLocationKeyContract (23294) | Mb → childLocationKey (23297；+别名 imageDropZoneKey)
 *   Nb → locationFromDataset (23300；+别名 parseImageDropZoneDataset) | Pb → firstTableCellLocation (23328)
 *   Fb → tableFormattingRevisions (23342) | Ib → extractTrackedChanges (23379)
 *   Lb → xmlTextPreview (23454) | Rb → commentAnchorText (23460)
 *   zb → extractComments (23468) | Bb → colorWithAlpha (23537)
 *   Vb → annotationColorFor (23541) | Hb → commentHighlightStyle (23550)
 *   Ub → commentCardHeight (23557) | Wb → trackedChangeKindLabel (23562)
 *   Gb → trackedChangeColor (23580) | Kb → trackedChangeIsAnnotatable (23610)
 *   qb → locationSortVector (23613) | Jb → locationInPages (23616)
 *   Yb → pageIndexForLocation (23619) | Xb → locationElement (23623)
 *   Zb → annotationAnchorRect (23626) | Qb → elementWithClassToken (23644)
 *   $b → annotationLocationElement (23652) | ex → elementByDataAttr (23655)
 *   tx → annotationAnchorElement (23663) | nx → trackedChangeCardHeight (23679)
 *   rx → assignConnectorLanes (23684) | ix → layoutGutterAnnotations (23712)
 *   ax → sameLocationContract (23754)
 * §11 位置导航与选区：
 *   ox → firstEditableCellLocation (23757) | sx → lastEditableCellLocation (23773)
 *   cx → locationNodeIndex (23791) | lx → shiftLocationAfterTableRemoval (23794)
 *   ux → tableFullTextRange (23813) | dx → emptiedTableIndexes (23830)
 *   fx → firstLocationOfNode (23847) | px → previousEditableParagraphLocation (23854)
 *   mx → nextEditableParagraphLocation (23861) | hx → firstEditableLocation (23899)
 *   gx → lastLocation (23905) | _x → enumerateRangeLocations (23931)
 *   vx → caretOffsetIn (23941) | yx → documentIsSingleParagraph (23945)
 *   bx → rangeOffsetsInParagraph (23957) | xx → cloneLocationContract (23965)
 *   Sx → cloneTextRange (23977) | Cx → cloneSelection (23989)
 *   wx → sameSelection (24000) | Tx → sameTextPosition (24006)
 *   Ex → sameTextRange (24009) | Dx → modelChangedBroadcastable (24016)
 *   Ox → selectionRestoreArbitration (24019) | kx → htmlInsertionContract (24022)
 *   Ax → isCompositionKey (24030) | jx → isNavigationOrEditKey (24033)
 *   Mx → caretBeforeBlockText (24042) | Nx → caretXOutOfRange (24053)
 *   Px → paragraphLocationOfImage (24056) | Fx → resolveLocation (24068)
 *   Ix → locationFirstParagraph (24085) | Lx → toMutableLocation (24097)
 *   Rx → locationBaseContract (24108) | zx → locationFor (24120)
 *   Bx → selectionRunStyle (24124) | Vx → nearestEditableLocation (24133)
 *   Hx → normalizeRangeToEditable (24172) | Ux → selectionFromLocation (24191)
 *   Wx → normalizeCursorState (24198)
 * §12 reducer 与节区草稿：
 *   Gx → editorReducer (24208，Uo 工厂实例) | Kx → replaceTextAtLocation (24217)
 *   qx → sectionParagraphDraftKey (24220) | Jx → sectionImageKey (24230)
 *   Yx → cellParagraphDraftKey (24241) | Xx → parseSectionDraftKey (24244)
 *   Zx → sectionNodeTextAt (24263) | Qx → sectionParagraphAt (24274)
 *   $x → replaceSectionParagraphText (24290) | eS → moveSectionFloatingImage (24313)
 * §D 依赖补全（范围外）：
 *   Ig → floatingWrapSide (19564) | Lg → floatingWrapStyle (19576)
 *   Rg → floatingAbsoluteStyle (19649) | Gg → behindDocImageFrameSize (19788)
 *   Jg → imageIsPageAnchoredFloating (19829)
 *
 * ----------------------------------------------------------------------------
 * 二、外部契约（其他批次实体，本文件导入）
 * ----------------------------------------------------------------------------
 *  BThumbnails：KEY_CODE_IME_COMPOSITION (jc) / KEY_CODE_SHIFT (Mc) /
 *    PAGINATION_IGNORE_INSET_PX (Pc) / ANNOTATION_GUTTER_WIDTH_PX (Zc) /
 *    NAVIGATION_KEYS (Ol) / MODIFIER_KEYS (kl) / boundedCacheSet (Wl)
 *  BModel：类型族 + paragraphText (_f) / paragraphsOf (jf) /
 *    collectParagraphsRecursive (Mf) / formFieldDisplayText (Df) /
 *    firstTextRunStyle (Of) / isBehindDocImageOf (Bf) / themeAwareColor (p_) /
 *    joinDefined (pu) / clampNumber (ou) / twipsToPxRounded (ld) /
 *    TABLE_NESTED_HANDLE_SIZE_PX (sd) / TABLE_NESTED_HANDLE_COLOR (cd) /
 *    TABLE_ANNOTATION_GAP_B_PX (Mu) / TABLE_ANNOTATION_LANE_PX (Nu) /
 *    TABLE_ANNOTATION_ICON_PX (Iu) / compareLocations (uf) /
 *    compareTextPositions (df) / normalizeTextRange (ff) /
 *    paragraphIsCheckboxYesNoRow (up)
 *  BLayout：runStyleToCss (__) / runStyleToCssDefaults (v_) /
 *    mergeTextDecoration (y_) / insertionDecoration (b_) / deletionDecoration (x_) /
 *    scriptFontSpans (h_) / applyNumberingFontStyle (g_) /
 *    numberingLabelContainerStyle (u_) / checkboxGapPx (Zp) /
 *    checkboxLeadingSpace (Qp) / advanceAfterText (im) / nextTabStopDistance (am) /
 *    imageCropMetrics ($g) / FLOATING_SIDE_CLEARANCE_PX (fp)
 *  C1：twipsToPxNonNegative (Br) / leftTabStopsAfterIndent (ph) /
 *    isTocParagraph (T_) / paragraphHasTocTab (E_) / tocTabStopOf (D_) /
 *    tabLayoutKindOf (j_) / tabStopByAlignment (M_) / decodeXmlEntities (N_) /
 *    matchXmlRegions (P_) / normalizeWhitespace (I_) /
 *    describeTableFormattingXml (uv) / parseParagraphRevisions (dv) /
 *    parseParagraphCommentRanges (fv) / pageFieldKindOfInstruction (pv) /
 *    styleRefTargetOfInstruction (mv) / paragraphPageFieldKinds (hv) /
 *    tocLevelOf (w_) / renderTextBoxSvg (tv) / shapeTransformCss (av) /
 *    isInlineImageNode (Ng) / isPageMarginCornerAnchoredFloating (Fg) /
 *    isFloatingImageNode (Kg) / NumberingLabelEntry 类型
 *  Engine4：cachedStructuralHash (qs)（导入）；replaceModelParagraphText (Qa) /
 *    replaceTableCellParagraphText (eo) / createEditorHistoryReducer (Uo)
 *    因 Engine4 公共面类型族出自 Engine3 与 BModel 不同构，按批 B 口径
 *    改挂文件内 declare 契约（见 §0；差异见报告 §2.5）
 *  公共层：resolveImageSrc (_i) / needsImageConversion (li) /
 *    imagePlaceholderLabel (ui)
 *
 * 本文件 declare 登记：
 *   deepCloneModel（chunk-YE7GQOST `i` 导出，原 h）|
 *   newBlockId（chunk-YE7GQOST `t` 导出，原 v）|
 *   replaceModelParagraphText / replaceTableCellParagraphText /
 *   createEditorHistoryReducer（Engine4 契约，见 §0）
 *
 * ----------------------------------------------------------------------------
 * 三、与批 A/B 及 C3 的边界裁决（详见 LegacyDocEngineC.report.md §2）
 * ----------------------------------------------------------------------------
 *  1. C1 declare 的 9 项表格几何契约 + zv/kv 由本文件按同名实体化，签名对齐。
 *  2. C3 declare 的 Contract 名（locationKeyContract 等）由本文件同名导出；
 *     批 B BEditorState declare 的同源符号以语义名导出，差异名以别名双出。
 *  3. BLayout g_/__/x_ 的第 3 参按批 B 转录为 paragraph，原式为 text
 *     （Mi(text, style) 语义）——调用点以 cast 对接，差异仅记录，不改批 B。
 *  4. §D 五函数（Ig/Lg/Rg/Gg/Jg）位于 [E6]b 名义区段（19564-19836），批 B 未实体化
 *     （批 B paragraphHasPageAnchoredFloatingImage 实为 Yg/Zg 族段落级谓词，
 *     非图级 Jg），本文件补全；其中 Ng/Fg/Kg 由 C1 实体化。
 * ============================================================================
 */

import * as React from "react";
import {
  KEY_CODE_IME_COMPOSITION,
  KEY_CODE_SHIFT,
  PAGINATION_IGNORE_INSET_PX,
  ANNOTATION_GUTTER_WIDTH_PX,
  NAVIGATION_KEYS,
  MODIFIER_KEYS,
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
  DocxLocation,
  DocxSelection,
  DocxTextPosition,
  DocxTextRange,
  DocxParagraphChild,
  DocxTextNode,
  PageSegment,
} from "./LegacyDocEngineBModel";
import {
  paragraphText,
  paragraphsOf,
  collectParagraphsRecursive,
  xmlAttrValue,
  formFieldDisplayText,
  firstTextRunStyle,
  isBehindDocImageOf,
  themeAwareColor,
  joinDefined,
  clampNumber,
  twipsToPxRounded,
  TABLE_NESTED_HANDLE_SIZE_PX,
  TABLE_NESTED_HANDLE_COLOR,
  TABLE_ANNOTATION_GAP_B_PX,
  TABLE_ANNOTATION_LANE_PX,
  TABLE_ANNOTATION_ICON_PX,
  compareLocations,
  compareTextPositions,
  normalizeTextRange,
  isParagraph,
  paragraphIsCheckboxYesNoRow,
} from "./LegacyDocEngineBModel";
import {
  runStyleToCss,
  runStyleToCssDefaults,
  insertionDecoration,
  deletionDecoration,
  scriptFontSpans,
  applyNumberingFontStyle,
  numberingLabelContainerStyle,
  checkboxGapPx,
  checkboxLeadingSpace,
  advanceAfterText,
  nextTabStopDistance,
  imageCropMetrics,
  FLOATING_SIDE_CLEARANCE_PX,
} from "./LegacyDocEngineBLayout";
import type { NumberingLabelEntry, TrackedChange } from "./LegacyDocEngineC1";
import {
  twipsToPxNonNegative,
  leftTabStopsAfterIndent,
  isTocParagraph,
  paragraphHasTocTab,
  tocTabStopOf,
  tabLayoutKindOf,
  tabStopByAlignment,
  decodeXmlEntities,
  matchXmlRegions,
  normalizeWhitespace,
  describeTableFormattingXml,
  parseParagraphRevisions,
  parseParagraphCommentRanges,
  pageFieldKindOfInstruction,
  styleRefTargetOfInstruction,
  paragraphPageFieldKinds,
  tocLevelOf,
  renderTextBoxSvg,
  shapeTransformCss,
  isInlineImageNode,
  isPageMarginCornerAnchoredFloating,
  isFloatingImageNode,
} from "./LegacyDocEngineC1";
import {
  cachedStructuralHash,
  replaceModelParagraphText as replaceModelParagraphTextE4,
  replaceTableCellParagraphText as replaceTableCellParagraphTextE4,
  createEditorHistoryReducer as createEditorHistoryReducerE4,
} from "./LegacyDocEngine4";
import { resolveImageSrc, needsImageConversion, imagePlaceholderLabel } from "./previewPaneOfficeLegacyDocContent";
/** chunk-YE7GQOST `i`/`t` 导出（原 h/v）：经 DocxWasmGlue 以语义名导入（B5-14-Final.report §2.3 裁决） */
import { cloneDocModel, allocateBlockId as newBlockId } from "./DocxWasmGlue";

/* ============================================================================
 * §0 外部契约接线（A0-S2c：原 declare 已换真实导入）
 *  - deepCloneModel/newBlockId：chunk-YE7GQOST 实体 = DocxWasmGlue
 *    cloneDocModel(826)/allocateBlockId(468)；newBlockId 按契约名别名导入，
 *    deepCloneModel 因 Glue 类型族（DocxCoreModel）与本件 BModel 类型族
 *    不同构，以本地契约类型绑定（类型层垫片，零运行时影响）。
 *  - Engine4 三式：实体已导入（见上 *E4 别名）；类型族差异同上。
 * ==========================================================================*/

/** chunk-YE7GQOST `i` 导出：模型深拷贝（原 h；$x/eS 消费；实体：DocxWasmGlue.cloneDocModel） */
const deepCloneModel = cloneDocModel as unknown as (model: DocxEditorModel) => DocxEditorModel;

/** 段落文本替换选项（原 Engine4 ParagraphTextOptions 面） */
export interface ParagraphTextOptions {
  insertedStyle?: DocxRunStyle;
  beforeInsertedStyle?: DocxRunStyle;
  afterInsertedStyle?: DocxRunStyle;
  [key: string]: unknown;
}

/** [E4] 原 Qa（jsx 13517 区段）：按节点下标替换段落文本（实体：LegacyDocEngine4.replaceModelParagraphText） */
const replaceModelParagraphText = replaceModelParagraphTextE4 as unknown as (
  model: DocxEditorModel,
  nodeIndex: number,
  newText: string,
  options?: ParagraphTextOptions,
) => DocxEditorModel;
/** [E4] 原 eo（jsx 13616 区段）：按单元格坐标替换段落文本（实体：LegacyDocEngine4.replaceTableCellParagraphText） */
const replaceTableCellParagraphText = replaceTableCellParagraphTextE4 as unknown as (
  model: DocxEditorModel,
  nodeIndex: number,
  rowIndex: number,
  cellIndex: number,
  paragraphOrdinal: number,
  newText: string,
  options?: ParagraphTextOptions,
) => DocxEditorModel;

/** 历史归约器适配器契约（方法语法 → 双变，对齐 Engine4 EditorHistoryAdapter） */
interface EditorHistoryAdapterContract {
  cloneSelection(selection: unknown): unknown;
  cloneTextRange(range: unknown): unknown;
  clonePendingStyle(style: unknown): unknown;
  normalizeCursor(model: DocxEditorModel, selection: unknown, activeTextRange: unknown): { selection: unknown; activeTextRange: unknown };
  sameSelection(former: unknown, latter: unknown): boolean;
  sameTextRange(former: unknown, latter: unknown): boolean;
  samePendingStyle(former: unknown, latter: unknown): boolean;
}

/** 历史归约器状态/动作视图（宿主装配面） */
export interface EditorReducerStateView {
  model: DocxEditorModel;
  selection: unknown;
  activeTextRange: unknown;
  [key: string]: unknown;
}
export interface EditorReducerActionView {
  type: string;
  [key: string]: unknown;
}

/** [E4] 原 Uo（jsx 14202）：编辑器历史归约器工厂（实体：LegacyDocEngine4.createEditorHistoryReducer） */
const createEditorHistoryReducer = createEditorHistoryReducerE4 as unknown as (
  adapter: EditorHistoryAdapterContract,
) => (state: EditorReducerStateView, action: EditorReducerActionView) => EditorReducerStateView;

/* --- 编号定义视图（metadata.numberingDefinitions 的宽松登记类型） --- */

interface NumberingLevelView {
  ilvl?: number;
  start?: number;
  format?: string;
  text?: string;
  suffix?: string;
  bulletFontFamily?: string;
  bulletColor?: string;
  runStyle?: DocxRunStyle;
  pictureBullet?: { src?: string; widthPx?: number; heightPx?: number };
  [key: string]: unknown;
}

interface NumberingInstanceView {
  numId: number;
  abstractNumId?: number;
  levelOverrides?: NumberingLevelView[];
  levelStartOverrides?: Record<string, number>;
  [key: string]: unknown;
}

interface NumberingDefinitionsView {
  instances: NumberingInstanceView[];
  abstracts?: { abstractNumId?: number; levels?: NumberingLevelView[]; [key: string]: unknown }[];
  [key: string]: unknown;
}

/* ============================================================================
 * §1 域结果解析（原 gv/_v/vv/yv/bv/xv，jsx 20944-21073）
 * ==========================================================================*/

/** 原 gv（jsx 20944）：页字段结果缓存（键 = 段落 sourceXml） */
const pageFieldResultsCache = new Map<string, { kind: `PAGE` | `NUMPAGES`; rawText: string }[]>();

/** 原 _v（jsx 20945）：段落页字段（PAGE/NUMPAGES）结果序列 */
export function paragraphPageFieldResults(paragraph: DocxParagraphNode): { kind: `PAGE` | `NUMPAGES`; rawText: string }[] {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return [];
  const cached = pageFieldResultsCache.get(xml);
  if (cached) return cached;
  const results: { kind: `PAGE` | `NUMPAGES`; rawText: string }[] = [],
    stack: { kind?: `PAGE` | `NUMPAGES`; inResult: boolean }[] = [];
  for (const match of xml.matchAll(/<w:fldSimple\b[^>]*\bw:instr="([^"]+)"[^>]*>[\s\S]*?<\/w:fldSimple>|<w:r\b[\s\S]*?<\/w:r>/gi)) {
    const chunk = match[0] ?? ``;
    if (!chunk) continue;
    if (/^<w:fldSimple\b/i.test(chunk)) {
      const kind = pageFieldKindOfInstruction(match[1] ?? ``);
      if (!kind) continue;
      for (const textMatch of chunk.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) results.push({
        kind,
        rawText: decodeXmlEntities(textMatch[1] ?? ``) ?? ``,
      });
      continue;
    }
    const beginCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="begin"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < beginCount; index += 1) stack.push({
      inResult: false,
    });
    for (const instrMatch of chunk.matchAll(/<w:instrText\b[^>]*>([\s\S]*?)<\/w:instrText>/gi)) {
      const kind = pageFieldKindOfInstruction(instrMatch[1] ?? ``);
      if (!kind || stack.length === 0) continue;
      let assigned = false;
      for (let index = stack.length - 1; index >= 0; --index) if (stack[index].kind === void 0) {
        stack[index].kind = kind, assigned = true;
        break;
      }
      assigned || (stack[stack.length - 1].kind = kind);
    }
    const separateCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="separate"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < separateCount; index += 1) for (let stackIndex = stack.length - 1; stackIndex >= 0; --stackIndex) if (!stack[stackIndex].inResult) {
      stack[stackIndex].inResult = true;
      break;
    }
    const activeKind = (() => {
      for (let index = stack.length - 1; index >= 0; --index) {
        const entry = stack[index];
        if (entry.inResult && entry.kind) return entry.kind;
      }
    })();
    if (activeKind) for (const textMatch of chunk.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) results.push({
      kind: activeKind,
      rawText: decodeXmlEntities(textMatch[1] ?? ``) ?? ``,
    });
    const endCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="end"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < endCount; index += 1) stack.pop();
  }
  return boundedCacheSet(pageFieldResultsCache, xml, results), results;
}

/** 原 vv（jsx 20998）：STYLEREF 域结果缓存 */
const styleRefFieldResultsCache = new Map<string, { target: string; rawText: string }[]>();

/** 原 yv（jsx 20999）：段落 STYLEREF 域结果序列 */
export function paragraphStyleRefFieldResults(paragraph: DocxParagraphNode): { target: string; rawText: string }[] {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return [];
  const cached = styleRefFieldResultsCache.get(xml);
  if (cached) return cached;
  const results: { target: string; rawText: string }[] = [],
    stack: { target?: string; inResult: boolean }[] = [];
  for (const match of xml.matchAll(/<w:fldSimple\b[^>]*\bw:instr="([^"]+)"[^>]*>[\s\S]*?<\/w:fldSimple>|<w:r\b[\s\S]*?<\/w:r>/gi)) {
    const chunk = match[0] ?? ``;
    if (!chunk) continue;
    if (/^<w:fldSimple\b/i.test(chunk)) {
      const target = styleRefTargetOfInstruction(match[1] ?? ``);
      if (!target) continue;
      for (const textMatch of chunk.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) results.push({
        target,
        rawText: decodeXmlEntities(textMatch[1] ?? ``) ?? ``,
      });
      continue;
    }
    const beginCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="begin"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < beginCount; index += 1) stack.push({
      inResult: false,
    });
    for (const instrMatch of chunk.matchAll(/<w:instrText\b[^>]*>([\s\S]*?)<\/w:instrText>/gi)) {
      const target = styleRefTargetOfInstruction(instrMatch[1] ?? ``);
      if (!target || stack.length === 0) continue;
      let assigned = false;
      for (let index = stack.length - 1; index >= 0; --index) if (stack[index].target === void 0) {
        stack[index].target = target, assigned = true;
        break;
      }
      assigned || (stack[stack.length - 1].target = target);
    }
    const separateCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="separate"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < separateCount; index += 1) for (let stackIndex = stack.length - 1; stackIndex >= 0; --stackIndex) if (!stack[stackIndex].inResult) {
      stack[stackIndex].inResult = true;
      break;
    }
    const activeTarget = (() => {
      for (let index = stack.length - 1; index >= 0; --index) {
        const entry = stack[index];
        if (entry.inResult && entry.target) return entry.target;
      }
    })();
    if (activeTarget) for (const textMatch of chunk.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) results.push({
      target: activeTarget,
      rawText: decodeXmlEntities(textMatch[1] ?? ``) ?? ``,
    });
    const endCount = chunk.match(/<w:fldChar\b[^>]*\bw:fldCharType="end"[^>]*\/?>/gi)?.length ?? 0;
    for (let index = 0; index < endCount; index += 1) stack.pop();
  }
  return boundedCacheSet(styleRefFieldResultsCache, xml, results), results;
}

/** 原 bv（jsx 21052）：样式名归一（空白压缩 + 小写） */
export function normalizeStyleName(name: string): string {
  return name.replace(/\s+/g, ` `).trim().toLowerCase();
}

/** 原 xv（jsx 21055）：指定 rStyle 的 run 文本拼接（TOC 链接域回退） */
export function tocFieldFallback(paragraph: DocxParagraphNode, styleName: string): string | undefined {
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return;
  const wanted = normalizeStyleName(styleName);
  if (!wanted) return;
  const parts: string[] = [];
  for (const runMatch of xml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/gi)) {
    const runXml = runMatch[0] ?? ``;
    if (runXml && normalizeStyleName(xmlAttrValue(runXml.match(/<w:rStyle\b[^>]*>/i)?.[0] ?? ``, `w:val`) ?? ``) === wanted) {
      for (const textMatch of runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) {
        const text = decodeXmlEntities(textMatch[1] ?? ``) ?? ``;
        text.length > 0 && parts.push(text);
      }
      /<w:tab\b[^>]*\/?>/i.test(runXml) && parts.push(`	`);
    }
  }
  const joined = parts.join(``).trim();
  return joined.length > 0 ? joined : void 0;
}

/* ============================================================================
 * §2 引导符/脚注/日期（原 Sv/Cv/wv，jsx 21074-21112）
 * ==========================================================================*/

/** 原 Sv（jsx 21074）：TOC 引导符背景样式（点线/短划/下划） */
export function leaderBackgroundStyle(leader: string | undefined, color: string | undefined): Record<string, string> {
  const kind = leader === `middleDot` ? `dot` : leader,
    paint = color || `currentColor`;
  return kind === `hyphen` ? {
    backgroundImage: `linear-gradient(to right, transparent 0, transparent 4px, ${paint} 4px, ${paint} 5px, transparent 5px, transparent 8px)`,
    backgroundSize: `8px 1px`,
    backgroundPosition: `0 80%`,
    backgroundRepeat: `repeat-x`,
  } : kind === `underscore` ? {
    backgroundImage: `linear-gradient(to right, ${paint} 0, ${paint} 1px, transparent 1px, transparent 4px)`,
    backgroundSize: `4px 1px`,
    backgroundPosition: `0 90%`,
    backgroundRepeat: `repeat-x`,
  } : {
    backgroundImage: `radial-gradient(${paint} 1px, transparent 1px)`,
    backgroundSize: `7px 9px`,
    backgroundPosition: `0 72%`,
    backgroundRepeat: `repeat-x`,
  };
}

/** 原 Cv（jsx 21094）：脚注/尾注引用标记文本 */
export function noteReferenceMark(
  noteReference: { kind: `footnote` | `endnote`; id: number } | undefined,
  footnoteNumbers: Map<number, number>,
  endnoteNumbers: Map<number, number>,
): string | undefined {
  if (!noteReference) return;
  const mapped = noteReference.kind === `footnote` ? footnoteNumbers.get(noteReference.id) : endnoteNumbers.get(noteReference.id);
  if (noteReference.kind === `footnote`) {
    const value = mapped ?? Math.max(1, Math.round(noteReference.id));
    return !Number.isFinite(value) || value <= 0 ? void 0 : String(Math.round(value));
  }
  const value = mapped ?? Math.max(1, Math.round(noteReference.id));
  if (!(!Number.isFinite(value) || value <= 0)) return romanNumeralOf(Math.round(value)).toLowerCase();
}

/** 原 wv（jsx 21104）：修订日期 → ISO 日期串 */
export function normalizeDateToIso(dateText: string | undefined): string | undefined {
  if (!dateText) return;
  const trimmed = dateText.trim();
  if (!trimmed) return;
  const lead = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (lead?.[1]) return lead[1];
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
}
/* ============================================================================
 * §3 段落 run 渲染器（原 Tv，jsx 21113-21684；JSX 全量）
 * ==========================================================================*/

/** Tv 的页面度量入参（浮动图原点/页宽） */
export interface ParagraphRenderMetrics {
  left?: number;
  top?: number;
  marginLeft?: number;
  marginTop?: number;
  columnLeft?: number;
  columnTop?: number;
  pageWidth?: number;
}

/** Tv 的节区图片交互入参 */
export interface SectionImageInteraction {
  isReadOnly?: boolean;
  imageLocationForChild?: (childIndex: number) => (SectionDraftLocation & { childIndex: number }) | undefined;
  onImagePointerDown?: (
    event: React.PointerEvent,
    location: SectionDraftLocation & { childIndex: number },
    image: DocxImageNode,
    isInlineLayout: boolean,
    isAbsoluteLayout: boolean,
  ) => void;
  onImageClick?: (location: SectionDraftLocation & { childIndex: number }) => void;
  floatingMovePreview?: { imageKey?: string; deltaX?: number; deltaY?: number };
}

/** Tv 的选项入参 */
export interface ParagraphRenderOptions {
  withinHeaderFooter?: boolean;
  headerFooterRegion?: `header` | `footer`;
  showTrackedChanges?: boolean;
  trackedMarkupMode?: string;
  showCommentHighlights?: boolean;
  tocLinkColorByLevel?: Record<number, string>;
  floatingAnchorOriginCorrectionXPx?: number;
  imageFilterSuffix?: string;
  pageNumberFormat?: string;
  numberingDefinitions?: unknown;
  resolveStyleRefFieldValue?: (target: string) => string | undefined;
  sectionImageInteraction?: SectionImageInteraction;
}

/** 原 Tv（jsx 21113）：段落 run 渲染（域替换/制表布局/修订/批注/浮动图） */
export function renderParagraphRuns(
  paragraph: DocxParagraphNode,
  keyPrefix: string,
  theme: `light` | `dark` = `light`,
  numberingLabel?: NumberingLabelEntry,
  onNavigate?: (target: string) => void,
  metrics?: ParagraphRenderMetrics,
  noteNumberMaps?: { footnote?: Map<number, number>; endnote?: Map<number, number> },
  pageIndex?: number,
  pageCount?: number,
  options?: ParagraphRenderOptions,
): React.ReactNode {
  const mainRuns: React.ReactNode[] = [],
    tocLeftRuns: React.ReactNode[] = [],
    tocRightRuns: React.ReactNode[] = [],
    noteMaps = {
      footnote: noteNumberMaps?.footnote ?? new Map<number, number>(),
      endnote: noteNumberMaps?.endnote ?? new Map<number, number>(),
    },
    hasTocTab = paragraphHasTocTab(paragraph),
    tabLayoutKind = tabLayoutKindOf(paragraph, {
      withinHeaderFooter: options?.withinHeaderFooter,
    }),
    isCenterRightLayout = !hasTocTab && tabLayoutKind === `center-right`,
    isCenterLayout = !hasTocTab && tabLayoutKind === `center`,
    isRightLayout = !hasTocTab && tabLayoutKind === `right`,
    isSpecialTabLayout = isCenterRightLayout || isCenterLayout || isRightLayout,
    pageFieldKinds = paragraphPageFieldKinds(paragraph),
    pageFieldResultsList = paragraphPageFieldResults(paragraph),
    styleRefResults = paragraphStyleRefFieldResults(paragraph),
    hasPageFields = pageFieldKinds.length > 0 || pageFieldResultsList.length > 0,
    hasStyleRefFields = styleRefResults.length > 0;
  let pageFieldCursor = 0,
    styleRefCursor = 0;
  const tocTabStop = tocTabStopOf(paragraph),
    tabStopPositionsPx = ((paragraph.style?.tabStops ?? []) as { positionTwips?: number }[]).map((tabStop) => twipsToPxNonNegative(tabStop.positionTwips)).filter((value) => Number.isFinite(value) && (value as number) > 0).sort((a, b) => (a as number) - (b as number)) as number[];
  let tocLeaderUsed = false,
    tocLeaderColor: string | undefined;
  const revisions = options?.showTrackedChanges === true && options?.trackedMarkupMode !== `gutter` ? parseParagraphRevisions(paragraph) : void 0,
    commentRanges = options?.showCommentHighlights === true ? parseParagraphCommentRanges(paragraph) : void 0,
    tocLevel = tocLevelOf(paragraph),
    tocLinkColor = tocLevel ? options?.tocLinkColorByLevel?.[tocLevel] : void 0,
    floatingAnchorCorrectionXPx = Number.isFinite(options?.floatingAnchorOriginCorrectionXPx) ? Math.round(options?.floatingAnchorOriginCorrectionXPx as number) : 0,
    isCheckboxYesNoRow = paragraphIsCheckboxYesNoRow(paragraph),
    checkboxGridSizePx = isCheckboxYesNoRow ? checkboxGapPx(paragraph) : ANNOTATION_GUTTER_WIDTH_PX,
    leftTabStops = hasTocTab ? leftTabStopsAfterIndent(paragraph) : [],
    advanceTracked = !hasTocTab && !isSpecialTabLayout;
  let currentXPx = 0,
    visibleChildIndex = 0;
  const pushDeletedSegments = (target: React.ReactNode[], deletedKeyPrefix: string, fallbackStyle?: DocxRunStyle) => {
      if (!revisions) return;
      const deleted = revisions.deletedSegmentsByVisibleChildIndex.get(visibleChildIndex);
      !deleted || deleted.length === 0 || deleted.forEach((entry, entryIndex) => {
        target.push(<span key={`${deletedKeyPrefix}-tracked-del-${visibleChildIndex}-${entryIndex}`} data-docx-tracked-change="deletion" data-docx-tracked-change-id={entry.change.id} title={entry.change.author ? `${entry.change.author} deleted` : `Deleted`} style={deletionDecoration(theme, entry.style ?? fallbackStyle, entry.text as unknown as DocxParagraphNode | undefined)}>{scriptFontSpans(entry.text, entry.style ?? fallbackStyle, `${deletedKeyPrefix}-tracked-del-${entryIndex}`)}</span>);
      });
    },
    inlineChangeForCurrent = () => revisions?.inlineChangeByVisibleChildIndex[visibleChildIndex],
    commentHighlightForCurrent = (): React.CSSProperties | undefined => {
      const commentIds = commentRanges?.commentIdsByVisibleChildIndex[visibleChildIndex];
      if (!(!commentIds || commentIds.length === 0)) return commentHighlightStyle(theme, commentIds[0]);
    },
    dataAttributesForChange = (change: TrackedChange | undefined): Record<string, string> => {
      const attrs: Record<string, string> = {};
      change && (attrs[`data-docx-tracked-change`] = change.kind, attrs[`data-docx-tracked-change-id`] = change.id);
      const commentIds = commentRanges?.commentIdsByVisibleChildIndex[visibleChildIndex];
      return commentIds && commentIds.length > 0 && (attrs[`data-docx-comment-ids`] = commentIds.join(` `), commentIds.length === 1 && (attrs[`data-docx-comment-id`] = String(commentIds[0]))), attrs;
    },
    trackVisibleChild = (child: DocxParagraphChild) => {
      !revisions && !commentRanges || child.type !== `form-field` && (visibleChildIndex += 1);
    },
    normalizeFieldText = (text: string) => text.replace(/\u00a0/g, ` `).replace(/\s+/g, ` `).trim(),
    advanceAfterRenderedText = (text: string | undefined, style: DocxRunStyle | undefined) => {
      advanceTracked && (currentXPx = advanceAfterText(currentXPx, text, style));
    },
    advancePx = (widthPx: number) => {
      advanceTracked && (currentXPx += Math.max(0, Math.round(widthPx)));
    },
    nextTabDistance = () => nextTabStopDistance(tabStopPositionsPx, currentXPx, checkboxGridSizePx, isCheckboxYesNoRow),
    pushTextWithSoftBreaks = (target: React.ReactNode[], key: string, text: string, css: Record<string, unknown>, style: DocxRunStyle | undefined, extraAttrs: Record<string, string>) => {
      if (!(paragraph.style?.align === `justify` && text.includes(`
`))) {
        const merged = applyNumberingFontStyle(css, text as unknown as DocxParagraphNode, style);
        target.push(<span key={key} {...extraAttrs} style={merged}>{scriptFontSpans(text, style, key)}</span>), advanceAfterRenderedText(text, style);
        return;
      }
      const lines = text.split(`
`);
      lines.forEach((line, lineIndex) => {
        const isLast = lineIndex === lines.length - 1;
        if (lineIndex > 0 && target.push(<br key={`${key}-soft-break-${lineIndex}`} />), line.length > 0) {
          const lineCss = applyNumberingFontStyle(css, line as unknown as DocxParagraphNode, style);
          target.push(<span key={`${key}-segment-${lineIndex}`} {...extraAttrs} style={isLast ? {
            ...lineCss,
            display: `inline-block`,
            maxWidth: `100%`,
            whiteSpace: `pre-wrap`,
            verticalAlign: `baseline`,
          } : lineCss}>{scriptFontSpans(line, style, `${key}-segment-${lineIndex}`)}</span>);
        }
        advanceAfterRenderedText(line, style), isLast || (currentXPx = 0);
      });
    },
    tabSpanStyle = (style: DocxRunStyle | undefined, baseCss: Record<string, unknown>) => {
      const distance = nextTabDistance();
      advancePx(distance);
      const hasUnderline = !!style?.underline;
      return {
        ...baseCss,
        display: `inline-block`,
        width: distance,
        minWidth: distance,
        whiteSpace: `pre`,
        textDecoration: hasUnderline ? `none` : baseCss.textDecoration as React.CSSProperties[`textDecoration`],
        borderBottom: hasUnderline ? `1px solid currentColor` : void 0,
        lineHeight: `1em`,
      };
    },
    pushTabSpacer = (target: React.ReactNode[], key: string, style: DocxRunStyle | undefined, trackedChange: TrackedChange | undefined, widthPx: number) => {
      const css = insertionDecoration(runStyleToCss(style, theme), trackedChange as Parameters<typeof insertionDecoration>[1]),
        hasUnderline = !!style?.underline;
      target.push(<span key={key} style={{
        ...css,
        display: `inline-block`,
        width: widthPx,
        minWidth: widthPx,
        whiteSpace: `pre`,
        textDecoration: hasUnderline ? `none` : css.textDecoration as React.CSSProperties[`textDecoration`],
        borderBottom: hasUnderline ? `1px solid currentColor` : void 0,
        lineHeight: `1em`,
      }}>{`\xA0`}</span>);
    },
    substitutePageField = (text: string, zoneIndex?: number): string => {
      if (!hasPageFields || text.trim().length === 0) return text;
      let kind = pageFieldKinds[pageFieldCursor];
      const resultEntry = pageFieldResultsList[pageFieldCursor];
      if (resultEntry) {
        if (normalizeFieldText(text) !== normalizeFieldText(resultEntry.rawText)) return text;
        kind = resultEntry.kind;
      } else {
        if (!kind) return text;
        const trimmed = text.trim();
        if (!(/^\d+$/.test(trimmed) || /^[ivxlcdm]+$/i.test(trimmed)) && zoneIndex !== 1) return text;
      }
      const resolved = kind === `NUMPAGES` ? Number.isFinite(pageCount) && (pageCount as number) > 0 ? Math.max(1, Math.round(pageCount as number)) : void 0 : Number.isFinite(pageIndex) && (pageIndex as number) > 0 ? Math.max(1, Math.round(pageIndex as number)) : void 0;
      if (!Number.isFinite(resolved)) return text;
      pageFieldCursor += 1;
      const lead = text.match(/^\s*/)?.[0] ?? ``,
        tail = text.match(/\s*$/)?.[0] ?? ``,
        value = Math.max(1, Math.round(resolved as number));
      return `${lead}${kind === `PAGE` ? formatPageNumber(value, options?.pageNumberFormat) : String(value)}${tail}`;
    },
    substituteStyleRefField = (text: string): string => {
      if (!hasStyleRefFields || text.trim().length === 0) return text;
      const entry = styleRefResults[styleRefCursor];
      if (!entry || normalizeFieldText(text) !== normalizeFieldText(entry.rawText)) return text;
      const resolved = options?.resolveStyleRefFieldValue?.(entry.target)?.trim();
      return resolved ? (styleRefCursor += 1, `${text.match(/^\s*/)?.[0] ?? ``}${resolved}${text.match(/\s*$/)?.[0] ?? ``}`) : text;
    },
    substituteFields = (text: string, zoneIndex?: number) => substitutePageField(substituteStyleRefField(text), zoneIndex),
    tocLinkStyle = (style: DocxRunStyle | undefined, trackedChange: TrackedChange | undefined, text: string): Record<string, unknown> => isTocParagraph(paragraph) ? {
      ...insertionDecoration({
        ...runStyleToCss(style, theme, text as unknown as DocxParagraphNode | undefined),
        color: tocLinkColor ? themeAwareColor(tocLinkColor, theme) : `inherit`,
        textDecoration: `none`,
      }, trackedChange as Parameters<typeof insertionDecoration>[1]),
      ...commentHighlightForCurrent(),
    } : {
      ...insertionDecoration(runStyleToCssDefaults(style, theme, text as unknown as DocxParagraphNode | undefined), trackedChange as Parameters<typeof insertionDecoration>[1]),
      ...commentHighlightForCurrent(),
    },
    imageIsPageAnchoredHorizontal = (image: DocxImageNode) => {
      const relativeTo = image.floating?.horizontalRelativeTo?.trim().toLowerCase();
      return relativeTo === `page` || relativeTo === `margin` || relativeTo === `column`;
    },
    pushChild = (target: React.ReactNode[], child: DocxParagraphChild, key: string, textOverride: string | undefined, trackedChange: TrackedChange | undefined, childIndex = -1): void => {
      if (child.type === `form-field`) {
        const fieldChild = child as DocxFormFieldNode,
          displayText = (formFieldDisplayText(fieldChild) || `\xA0`).replace(/\t/g, ` `),
          text = textOverride ?? displayText,
          dataAttrs = dataAttributesForChange(trackedChange);
        if (fieldChild.link) {
          const href = fieldChild.link as string,
            isAnchor = href.startsWith(`#`);
          target.push(<a key={key} {...dataAttrs} href={href} target={isAnchor ? void 0 : `_blank`} rel={isAnchor ? void 0 : `noreferrer noopener`} onMouseDown={event => {
            !isAnchor || !onNavigate || (event.preventDefault(), event.stopPropagation());
          }} onClick={event => {
            !isAnchor || !onNavigate || (event.preventDefault(), event.stopPropagation(), onNavigate(href.slice(1)));
          }} style={tocLinkStyle(fieldChild.style, trackedChange, text)}>{scriptFontSpans(text, fieldChild.style, key)}</a>), advanceAfterRenderedText(text, fieldChild.style);
          return;
        }
        const fieldCss = {
          ...insertionDecoration(runStyleToCss(fieldChild.style, theme, text as unknown as DocxParagraphNode | undefined), trackedChange as Parameters<typeof insertionDecoration>[1]),
          ...commentHighlightForCurrent(),
        };
        if (text === `	` && !hasTocTab && !isSpecialTabLayout) {
          target.push(<span key={key} {...dataAttrs} style={tabSpanStyle(fieldChild.style, fieldCss)}>{`\xA0`}</span>);
          return;
        }
        target.push(<span key={key} {...dataAttrs} style={fieldCss}>{scriptFontSpans(text, fieldChild.style, key)}</span>), advanceAfterRenderedText(text, fieldChild.style);
        return;
      }
      if (child.type === `image`) {
        const image = child as DocxImageNode,
          isBackgroundLayer = isBehindDocImageOf(image, paragraph),
          imageInteraction = options?.sectionImageInteraction,
          imageLocation = imageInteraction?.imageLocationForChild?.(childIndex),
          imageKey = imageLocation ? sectionImageKey(imageLocation) : void 0,
          movePreview = imageKey && imageInteraction?.floatingMovePreview?.imageKey === imageKey ? imageInteraction.floatingMovePreview : void 0,
          isHeaderFooterAnchored = options?.withinHeaderFooter === true && imageIsPageAnchoredFloating(image),
          isWrappedFloating = options?.withinHeaderFooter === true && !!(image.floating?.wrapType && image.floating.wrapType !== `none`) && isPageMarginCornerAnchoredFloating(image),
          isInlineLayout = !isHeaderFooterAnchored && (isWrappedFloating ? true : isInlineImageNode(image)),
          isAbsoluteLayout = isHeaderFooterAnchored ? true : isWrappedFloating ? false : isFloatingImageNode(image),
          horizontalRelativeTo = image.floating?.horizontalRelativeTo?.toLowerCase();
        image.floating?.verticalRelativeTo?.toLowerCase();
        let frameWidthPx = image.widthPx,
          frameHeightPx = image.heightPx;
        ({
          widthPx: frameWidthPx,
          heightPx: frameHeightPx,
        } = behindDocImageFrameSize(image, frameWidthPx, frameHeightPx, metrics));
        const anchorCorrectionXPx = imageIsPageAnchoredHorizontal(image) ? floatingAnchorCorrectionXPx : 0,
          columnOriginLeft = options?.withinHeaderFooter === true && options?.headerFooterRegion === `header` && image.floating?.behindDocument === true && horizontalRelativeTo === `column` ? metrics?.marginLeft : metrics?.columnLeft,
          wrapStyle = isInlineLayout ? floatingWrapStyle(image, {
            containerWidthPx: metrics?.pageWidth,
            deltaX: (movePreview?.deltaX ?? 0) + anchorCorrectionXPx,
            deltaY: movePreview?.deltaY ?? 0,
            allowNegativeOffsets: true,
          }) : isAbsoluteLayout ? floatingAbsoluteStyle(image, {
            pageOriginLeft: metrics?.left,
            pageOriginTop: metrics?.top,
            marginOriginLeft: metrics?.marginLeft,
            marginOriginTop: metrics?.marginTop,
            columnOriginLeft,
            columnOriginTop: metrics?.columnTop,
            deltaX: (movePreview?.deltaX ?? 0) + anchorCorrectionXPx,
            deltaY: movePreview?.deltaY ?? 0,
          }) : movePreview ? ({
            transform: `translate(${movePreview.deltaX}px, ${movePreview.deltaY}px)`,
            position: `relative`,
            zIndex: 4,
          } as React.CSSProperties) : {},
          floatingStyle = isInlineLayout ? {
            ...wrapStyle,
          } : wrapStyle,
          handlePointerDown = imageLocation && imageInteraction?.onImagePointerDown && !imageInteraction.isReadOnly && !isBackgroundLayer ? (event: React.PointerEvent) => {
            imageInteraction.onImagePointerDown?.(event, imageLocation, image, isInlineLayout, isAbsoluteLayout);
          } : void 0,
          handleClick = imageLocation && imageInteraction?.onImageClick && !imageInteraction.isReadOnly && !isBackgroundLayer ? (event: React.MouseEvent) => {
            event.stopPropagation(), imageInteraction.onImageClick?.(imageLocation);
          } : void 0,
          cursor = imageLocation && !imageInteraction?.isReadOnly && !isBackgroundLayer && (isInlineLayout || isAbsoluteLayout) ? `move` : void 0,
          isCenteredImage = !isInlineLayout && !isAbsoluteLayout && paragraph.style?.align === `center` && paragraph.children.length === 1 && paragraph.children[0]?.type === `image`,
          insertionOutlineKind = trackedChange?.kind === `insertion` || trackedChange?.kind === `move-to` ? trackedChange?.kind : void 0,
          insertionOutline = insertionOutlineKind ? {
            outline: insertionOutlineKind === `move-to` ? `2px solid rgba(112, 173, 71, 0.35)` : `2px solid rgba(220, 38, 38, 0.3)`,
            outlineOffset: 1,
          } : void 0,
          resolvedSrc = renderTextBoxSvg(image, pageIndex, pageCount, options?.pageNumberFormat, options?.resolveStyleRefFieldValue) ?? resolveImageSrc(image);
        if (!image.src) {
          target.push(<span key={key} style={{
            display: `inline-flex`,
            minWidth: 112,
            minHeight: 80,
            alignItems: `center`,
            justifyContent: `center`,
            border: `1px dashed #d1d5db`,
            borderRadius: 4,
            color: `#6b7280`,
            fontSize: 12,
            marginInline: isInlineLayout || isAbsoluteLayout ? void 0 : 0,
            paddingInline: 8,
            ...insertionOutline,
            ...floatingStyle,
            cursor,
            ...(isBackgroundLayer ? {
              pointerEvents: `none`,
              userSelect: `none`,
            } : void 0),
          }} onPointerDown={handlePointerDown} onClick={handleClick}>{`Missing image`}</span>);
          return;
        }
        if (needsImageConversion(image) || image.src && !resolvedSrc) {
          const isTiny = (frameWidthPx ?? 0) <= 56 && (frameHeightPx ?? 0) <= 56,
            placeholder = imagePlaceholderLabel(image, frameWidthPx, frameHeightPx);
          target.push(<span key={key} role="img" aria-label={image.alt ?? `DOCX image`} style={{
            display: `inline-flex`,
            alignItems: `center`,
            justifyContent: `center`,
            width: frameWidthPx ? `${frameWidthPx}px` : `1.8em`,
            height: frameHeightPx ? `${frameHeightPx}px` : `1.8em`,
            minWidth: 16,
            minHeight: 16,
            border: `1px solid #d1d5db`,
            borderRadius: 3,
            backgroundColor: `#ffffff`,
            color: `#0f172a`,
            fontSize: isTiny ? 12 : 10,
            fontWeight: 700,
            textTransform: `lowercase`,
            fontFamily: `Arial, sans-serif`,
            lineHeight: 1,
            verticalAlign: `middle`,
            marginInline: isInlineLayout || isAbsoluteLayout ? void 0 : 0,
            ...insertionOutline,
            ...floatingStyle,
            cursor,
            ...(isBackgroundLayer ? {
              pointerEvents: `none`,
              userSelect: `none`,
            } : void 0),
          }} onPointerDown={handlePointerDown} onClick={handleClick}>{placeholder}</span>);
          return;
        }
        target.push((() => {
          const crop = imageCropMetrics(image, frameWidthPx as number, frameHeightPx as number),
            filterStyle = {
              filter: joinDefined(image.cssFilter, options?.imageFilterSuffix),
              opacity: image.cssOpacity,
            },
            transformStyle = shapeTransformCss(image, {
              frameWidthPx: crop?.frameWidthPx ?? frameWidthPx,
              frameHeightPx: crop?.frameHeightPx ?? frameHeightPx,
              baseTransform: crop ? `translate(${-crop.offsetXPx}px, ${-crop.offsetYPx}px)` : void 0,
            });
          return crop ? <span key={key} style={{
            width: `${crop.frameWidthPx}px`,
            height: `${crop.frameHeightPx}px`,
            overflow: `clip`,
            display: isCenteredImage ? `block` : `inline-block`,
            marginLeft: isCenteredImage ? `auto` : void 0,
            marginRight: isCenteredImage ? `auto` : void 0,
            verticalAlign: `middle`,
            marginInline: isInlineLayout || isAbsoluteLayout ? void 0 : 0,
            ...insertionOutline,
            ...floatingStyle,
            cursor,
            ...(isBackgroundLayer ? {
              pointerEvents: `none`,
              userSelect: `none`,
            } : void 0),
          }} onPointerDown={handlePointerDown} onClick={handleClick}><img src={resolvedSrc} alt={image.alt ?? `DOCX image`} draggable={false} style={{
              width: `${crop.imageWidthPx}px`,
              height: `${crop.imageHeightPx}px`,
              maxWidth: `none`,
              display: `block`,
              ...filterStyle,
              ...transformStyle,
            }} /></span> : <img key={key} src={resolvedSrc} alt={image.alt ?? `DOCX image`} draggable={false} onPointerDown={handlePointerDown} onClick={handleClick} style={{
            width: frameWidthPx ? `${frameWidthPx}px` : void 0,
            height: frameHeightPx ? `${frameHeightPx}px` : void 0,
            maxWidth: isInlineLayout || isAbsoluteLayout ? void 0 : `100%`,
            display: isCenteredImage ? `block` : void 0,
            marginLeft: isCenteredImage ? `auto` : void 0,
            marginRight: isCenteredImage ? `auto` : void 0,
            verticalAlign: `middle`,
            marginInline: isInlineLayout || isAbsoluteLayout ? void 0 : 0,
            ...filterStyle,
            ...shapeTransformCss(image, {
              frameWidthPx: frameWidthPx,
              frameHeightPx: frameHeightPx,
            }),
            ...insertionOutline,
            ...floatingStyle,
            cursor,
            ...(isBackgroundLayer ? {
              pointerEvents: `none`,
              userSelect: `none`,
            } : void 0),
          }} />;
        })()), !isInlineLayout && !isAbsoluteLayout && advancePx(frameWidthPx ?? 0);
        return;
      }
      const textChild = child as DocxTextNode,
        text = textOverride ?? textChild.text,
        textCss: Record<string, unknown> = {
          ...insertionDecoration(runStyleToCss(textChild.style, theme, text as unknown as DocxParagraphNode | undefined), trackedChange as Parameters<typeof insertionDecoration>[1]),
          ...commentHighlightForCurrent(),
        },
        dataAttrs = dataAttributesForChange(trackedChange),
        noteMark = noteReferenceMark(textChild.noteReference as { kind: `footnote` | `endnote`; id: number } | undefined, noteMaps.footnote, noteMaps.endnote);
      if (noteMark) {
        target.push(<span key={key} {...dataAttrs} style={{
          ...textCss,
          verticalAlign: `super`,
          fontSize: `0.75em`,
        }}>{scriptFontSpans(noteMark, textChild.style, key)}</span>), advanceAfterRenderedText(noteMark, textChild.style);
        return;
      }
      if (text === `	` && !hasTocTab && !isSpecialTabLayout) {
        target.push(<span key={key} {...dataAttrs} style={tabSpanStyle(textChild.style, textCss)}>{`\xA0`}</span>);
        return;
      }
      if (textChild.link) {
        const href = textChild.link as string,
          isAnchor = href.startsWith(`#`);
        target.push(<a key={key} {...dataAttrs} href={href} target={isAnchor ? void 0 : `_blank`} rel={isAnchor ? void 0 : `noreferrer noopener`} onMouseDown={event => {
          !isAnchor || !onNavigate || (event.preventDefault(), event.stopPropagation());
        }} onClick={event => {
          !isAnchor || !onNavigate || (event.preventDefault(), event.stopPropagation(), onNavigate(href.slice(1)));
        }} style={tocLinkStyle(textChild.style, trackedChange, text)}>{scriptFontSpans(text, textChild.style, key)}</a>), advanceAfterRenderedText(text, textChild.style);
        return;
      }
      pushTextWithSoftBreaks(target, key, text, textCss, textChild.style, dataAttrs);
    },
    tabZoneContainerStyle: React.CSSProperties = {
      display: `inline-flex`,
      minWidth: 0,
      whiteSpace: `pre-wrap`,
      alignItems: `baseline`,
      wordBreak: `normal`,
      overflowWrap: `normal`,
      flexWrap: `nowrap`,
    },
    pushNumberingLabel = (target: React.ReactNode[], labelKey: string) => {
      if (!numberingLabel) return;
      const labelBaseStyle = numberingLabel.style ? runStyleToCss(numberingLabel.style, theme) : void 0;
      target.push(<span key={labelKey} style={numberingLabelContainerStyle(paragraph, options?.numberingDefinitions, numberingLabel, labelBaseStyle, theme)}>{numberingLabel.imageSrc ? <><img src={numberingLabel.imageSrc} alt="" aria-hidden="true" style={{
            display: `inline-block`,
            verticalAlign: `text-bottom`,
            width: numberingLabel.imageWidthPx ?? 12,
            height: numberingLabel.imageHeightPx ?? 12,
            marginRight: 2,
          }} />{numberingLabel.trailingText ?? ``}</> : numberingLabel.text ?? ``}</span>);
    },
    buildTabZoneRuns = (zoneCount: number): React.ReactNode[][] => {
      const zones = Array.from({
          length: zoneCount,
        }, () => [] as React.ReactNode[]);
      let zoneCursor = 0;
      return pushNumberingLabel(zones[0], `${keyPrefix}-numbering-anchored`), paragraph.children.forEach((child, childIdx) => {
        const zoneIndex = Math.max(0, Math.min(zoneCount - 1, zoneCursor)),
          zoneRuns = zones[zoneIndex],
          childKey = `${keyPrefix}-anchored-run-${childIdx}`;
        pushDeletedSegments(zoneRuns, `${childKey}-before`, child.type === `text` || child.type === `form-field` ? (child as DocxTextNode | DocxFormFieldNode).style : void 0);
        const inlineChange = inlineChangeForCurrent(),
          childText = child.type === `text` ? (child as DocxTextNode).text : child.type === `form-field` ? formFieldDisplayText(child as DocxFormFieldNode) : void 0;
        if (typeof childText != `string` || !childText.includes(`	`)) {
          child.type === `text` ? pushChild(zoneRuns, child, childKey, checkboxLeadingSpace(paragraph, childIdx, substituteFields(childText ?? ``, zoneIndex)), inlineChange, childIdx) : pushChild(zoneRuns, child, childKey, void 0, inlineChange, childIdx), trackVisibleChild(child);
          return;
        }
        const parts = childText.split(`	`);
        parts.forEach((part, partIndex) => {
          const partZoneIndex = Math.max(0, Math.min(zoneCount - 1, zoneCursor));
          part.length > 0 && pushChild(zones[partZoneIndex], child, `${childKey}-part-${partIndex}`, substituteFields(part, partZoneIndex), inlineChange, childIdx), partIndex < parts.length - 1 && zoneCursor < zoneCount - 1 && (zoneCursor += 1);
        }), trackVisibleChild(child);
      }), pushDeletedSegments(zones[Math.max(0, Math.min(zoneCount - 1, zoneCursor))], `${keyPrefix}-tail`), zones;
    };
  if (numberingLabel && !isSpecialTabLayout && (pushNumberingLabel(hasTocTab ? tocLeftRuns : mainRuns, `${keyPrefix}-numbering`), numberingLabel.imageSrc ? (advancePx(numberingLabel.imageWidthPx ?? 12), advanceAfterRenderedText(numberingLabel.trailingText ?? ``, numberingLabel.style)) : advanceAfterRenderedText(numberingLabel.text ?? ``, numberingLabel.style)), isSpecialTabLayout || (paragraph.children.forEach((child, childIdx) => {
    const childKey = `${keyPrefix}-run-${childIdx}`,
      targetRuns = hasTocTab ? tocLeaderUsed ? tocRightRuns : tocLeftRuns : mainRuns;
    pushDeletedSegments(targetRuns, `${childKey}-before`, child.type === `text` || child.type === `form-field` ? (child as DocxTextNode | DocxFormFieldNode).style : void 0);
    const inlineChange = inlineChangeForCurrent();
    if (hasTocTab && child.type === `text` && (child as DocxTextNode).text.includes(`	`) && !tocLeaderUsed) {
      const text = (child as DocxTextNode).text,
        lastTabIndex = text.lastIndexOf(`	`),
        leftText = text.slice(0, lastTabIndex),
        rightText = text.slice(lastTabIndex + 1);
      !tocLeaderColor && (child as DocxTextNode).style?.color && (tocLeaderColor = (child as DocxTextNode).style?.color);
      const hasLaterTab = paragraph.children.slice(childIdx + 1).some((later) => later.type === `text` && (later as DocxTextNode).text.includes(`	`) || later.type === `form-field` && formFieldDisplayText(later as DocxFormFieldNode).includes(`	`));
      if (leftText.length === 0 && rightText.length === 0 && hasLaterTab) {
        pushChild(tocLeftRuns, child, `${keyPrefix}-run-${childIdx}-spacer`, ` `, inlineChange, childIdx), trackVisibleChild(child);
        return;
      }
      if (leftText.length > 0) {
        let leftXPx = 0,
          leftParts = leftText.split(`	`);
        leftParts.forEach((part, partIndex) => {
          if (part.length > 0) {
            const partText = substituteFields(part, 0);
            pushChild(tocLeftRuns, child, `${keyPrefix}-run-${childIdx}-left-${partIndex}`, partText, inlineChange, childIdx), leftXPx = advanceAfterText(leftXPx, partText, (child as DocxTextNode).style);
          }
          if (partIndex >= leftParts.length - 1) return;
          const distance = nextTabStopDistance(leftTabStops, leftXPx, checkboxGridSizePx);
          pushTabSpacer(tocLeftRuns, `${keyPrefix}-run-${childIdx}-left-tab-${partIndex}`, (child as DocxTextNode).style, inlineChange, distance), leftXPx += distance;
        });
      }
      pushChild(tocRightRuns, child, `${keyPrefix}-run-${childIdx}-right`, substituteFields(rightText, 1), inlineChange, childIdx), tocLeaderUsed = true, trackVisibleChild(child);
      return;
    }
    if (child.type === `text`) {
      pushChild(targetRuns, child, childKey, checkboxLeadingSpace(paragraph, childIdx, substituteFields((child as DocxTextNode).text)), inlineChange, childIdx), trackVisibleChild(child);
      return;
    }
    pushChild(targetRuns, child, childKey, void 0, inlineChange, childIdx), trackVisibleChild(child);
  }), pushDeletedSegments(hasTocTab ? tocLeaderUsed ? tocRightRuns : tocLeftRuns : mainRuns, `${keyPrefix}-tail`)), isCenterRightLayout) {
    const zones = buildTabZoneRuns(3),
      centerXPx = Math.max(0, Math.round(tabStopByAlignment(paragraph, `center`) ?? 0)),
      rightXPx = Math.max(centerXPx, Math.round(tabStopByAlignment(paragraph, `right`) ?? centerXPx));
    return <div key={`${keyPrefix}-center-right-tabs`} data-docx-tab-layout="center-right" style={{
      display: `grid`,
      gridTemplateColumns: `${centerXPx}px 0px ${Math.max(0, rightXPx - centerXPx)}px 0px minmax(0, 1fr)`,
      alignItems: `start`,
      width: `100%`,
    }}><span data-docx-tab-zone="0" style={{
        ...tabZoneContainerStyle,
        gridColumn: `1 / 2`,
        gridRow: `1 / 2`,
      }}>{zones[0]}</span><span data-docx-tab-zone="1" style={{
        ...tabZoneContainerStyle,
        gridColumn: `1 / -1`,
        gridRow: `1 / 2`,
        justifySelf: `start`,
        marginLeft: centerXPx,
        textAlign: `center`,
        transform: `translateX(-50%)`,
        width: `max-content`,
        maxWidth: `100%`,
      }}>{zones[1]}</span><span data-docx-tab-zone="2" style={{
        ...tabZoneContainerStyle,
        gridColumn: `3 / 4`,
        gridRow: `1 / 2`,
        justifySelf: `end`,
        justifyContent: `flex-end`,
        textAlign: `right`,
      }}>{zones[2]}</span></div>;
  }
  if (isCenterLayout) {
    const zones = buildTabZoneRuns(2),
      centerXPx = Math.max(0, Math.round(tabStopByAlignment(paragraph, `center`) ?? 0));
    return <div key={`${keyPrefix}-center-tabs`} data-docx-tab-layout="center" style={{
      display: `grid`,
      gridTemplateColumns: `${centerXPx}px 0px minmax(0, 1fr)`,
      alignItems: `start`,
      width: `100%`,
    }}>{zones[0].length > 0 ? <span data-docx-tab-zone="left" style={{
        ...tabZoneContainerStyle,
        gridColumn: `1 / 2`,
        gridRow: `1 / 2`,
      }}>{zones[0]}</span> : null}<span data-docx-tab-zone="center" style={{
      ...tabZoneContainerStyle,
      gridColumn: `1 / -1`,
      gridRow: `1 / 2`,
      justifySelf: `start`,
      marginLeft: centerXPx,
      textAlign: `center`,
      transform: `translateX(-50%)`,
      width: `max-content`,
      maxWidth: `100%`,
    }}>{zones[1]}</span></div>;
  }
  if (isRightLayout) {
    const zones = buildTabZoneRuns(2);
    return <div key={`${keyPrefix}-right-tabs`} data-docx-tab-layout="right" style={{
      display: `grid`,
      gridTemplateColumns: `${Math.max(0, Math.round(tabStopByAlignment(paragraph, `right`) ?? 0))}px 0px minmax(0, 1fr)`,
      alignItems: `start`,
      width: `100%`,
    }}><span data-docx-tab-zone="left" style={{
        ...tabZoneContainerStyle,
        gridColumn: `1 / 2`,
        gridRow: `1 / 2`,
      }}>{zones[0]}</span><span data-docx-tab-zone="right" style={{
      ...tabZoneContainerStyle,
      gridColumn: `1 / 2`,
      gridRow: `1 / 2`,
      justifySelf: `end`,
      justifyContent: `flex-end`,
      textAlign: `right`,
    }}>{zones[1]}</span></div>;
  }
  return !hasTocTab || !tocLeaderUsed ? tocLeftRuns.length > 0 ? tocLeftRuns : mainRuns : <div key={`${keyPrefix}-toc`} data-docx-tab-layout="leader" style={{
    display: `flex`,
    alignItems: `baseline`,
    width: `100%`,
  }}><span data-docx-tab-zone="left" style={{
      display: `block`,
      flex: `0 1 auto`,
      minWidth: 0,
      whiteSpace: `pre-wrap`,
    }}>{tocLeftRuns}</span><span aria-hidden="true" style={{
      ...leaderBackgroundStyle(tocTabStop?.leader, themeAwareColor(tocLeaderColor, theme)),
      flex: `1 1 auto`,
      minWidth: 8,
      marginLeft: 6,
      marginRight: 6,
      height: `1em`,
      alignSelf: `center`,
    }} /><span data-docx-tab-zone="right" style={{
      display: `block`,
      flex: `0 0 max-content`,
      minWidth: `max-content`,
      width: `max-content`,
      textAlign: `right`,
      whiteSpace: `nowrap`,
      textIndent: 0,
    }}>{tocRightRuns}</span></div>;
}
/* ============================================================================
 * §4 编号格式与标签（原 Ev..zv，jsx 21685-21877）
 * ==========================================================================*/

/** 原 Ev（jsx 21685）：罗马数字 */
export function romanNumeralOf(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ``;
  const table = [[1e3, `M`], [900, `CM`], [500, `D`], [400, `CD`], [100, `C`], [90, `XC`], [50, `L`], [40, `XL`], [10, `X`], [9, `IX`], [5, `V`], [4, `IV`], [1, `I`]] as [number, string][];
  let rest = Math.floor(value);
  let roman = ``;
  for (const [part, glyph] of table) for (; rest >= part;) roman += glyph, rest -= part;
  return roman;
}

/** 原 Dv（jsx 21693）：字母序号（A..Z..AA） */
export function letterOrdinalOf(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ``;
  let rest = Math.floor(value),
    letters = ``;
  for (; rest > 0;) {
    const digit = (rest - 1) % 26;
    letters = String.fromCharCode(65 + digit) + letters, rest = Math.floor((rest - 1) / 26);
  }
  return letters;
}

/** 原 Ov（jsx 21703）：按编号格式渲染数字 */
export function numberInFormat(format: string | undefined, value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ``;
  switch ((format ?? `decimal`).toLowerCase()) {
    case `decimal`:
      return String(value);
    case `upperroman`:
      return romanNumeralOf(value);
    case `lowerroman`:
      return romanNumeralOf(value).toLowerCase();
    case `upperletter`:
      return letterOrdinalOf(value);
    case `lowerletter`:
      return letterOrdinalOf(value).toLowerCase();
    case `ordinal`:
    case `cardinaltext`:
    case `ordinaltext`:
      return String(value);
    case `bullet`:
      return `•`;
    case `none`:
      return ``;
    default:
      return String(value);
  }
}

/** 原 kv（jsx 21728）：页码格式化（空 → 十进制兜底） */
export function formatPageNumber(value: number, format: string | undefined): string {
  const formatted = numberInFormat(format, value);
  return formatted.length > 0 ? formatted : String(value);
}

/** 原 Av（jsx 21732）：编号级别定义（实例覆盖优先） */
export function numberingLevelOf(definitions: NumberingDefinitionsView, numId: number, levelIndex: number): NumberingLevelView | undefined {
  const instance = definitions.instances.find((entry) => entry.numId === numId);
  return instance ? instance.levelOverrides?.find((level) => level.ilvl === levelIndex) || definitions.abstracts?.find((entry) => entry.abstractNumId === instance.abstractNumId)?.levels?.find((level) => level.ilvl === levelIndex) : void 0;
}

/** 原 jv（jsx 21736）：级别有可见项目符号（图/文） */
export function numberingLevelHasVisibleBullet(level: NumberingLevelView | undefined): boolean {
  return !!(level?.pictureBullet?.src || level?.text && level.text.trim().length > 0);
}

/** 原 Mv（jsx 21739）：级别为纯项目符号（无编号占位） */
export function numberingLevelIsBullet(level: NumberingLevelView | undefined): boolean {
  return level?.format?.trim().toLowerCase() === `bullet` || !!level?.pictureBullet?.src || textIsBulletGlyphs(level?.text ?? ``, level?.bulletFontFamily);
}

/** 原 Nv（jsx 21742）：实例级别表（抽象级 + 覆盖） */
export function numberingLevelsOf(definitions: NumberingDefinitionsView, numId: number): NumberingLevelView[] {
  const instance = definitions.instances.find((entry) => entry.numId === numId);
  return instance ? [...(definitions.abstracts?.find((entry) => entry.abstractNumId === instance.abstractNumId)?.levels ?? []), ...(instance.levelOverrides ?? [])] : [];
}

/** 原 Pv（jsx 21746）：段落有效 numId（纯符号段回退到真实编号实例） */
export function effectiveNumIdOfParagraph(paragraph: DocxParagraphNode, definitions: NumberingDefinitionsView | undefined): number | undefined {
  const numbering = paragraph.style?.numbering;
  if (!definitions || !numbering || !Number.isFinite(numbering.numId) || numbering.numId <= 0) return numbering?.numId;
  const numId = numbering.numId,
    levelIndex = Math.max(0, Math.round(numbering.ilvl ?? 0)),
    level = numberingLevelOf(definitions, numId, levelIndex);
  if (!numberingLevelIsBullet(level) || numberingLevelHasVisibleBullet(level)) return numId;
  const levels = numberingLevelsOf(definitions, numId);
  if (levels.length === 0 || levels.some((entry) => !numberingLevelIsBullet(entry) || numberingLevelHasVisibleBullet(entry))) return numId;
  const text = paragraphText(paragraph).trim();
  return text.length === 0 || textIsBulletGlyphs(text) || /^[\u2022\u25cf\u25cb\u25a0\u25a1\u25aa\u25ab\u25c6\u25c7\u25e6\u2043]/.test(text) ? numId : definitions.instances.find((instance) => {
    if (instance.numId === numId) return false;
    const candidate = numberingLevelOf(definitions, instance.numId, levelIndex);
    if (!candidate) return false;
    const candidateFormat = candidate.format?.trim().toLowerCase();
    if (!candidateFormat || candidateFormat === `none` || numberingLevelIsBullet(candidate) || !candidate.text || !/%\d+/.test(candidate.text)) return false;
    if (levelIndex > 0) {
      const parent = numberingLevelOf(definitions, instance.numId, levelIndex - 1);
      if (!parent) return false;
      const parentFormat = parent.format?.trim().toLowerCase();
      if (!parentFormat || parentFormat === `none` || numberingLevelIsBullet(parent)) return false;
    }
    return true;
  })?.numId ?? numId;
}

/** 原 Fv（jsx 21771）：级别起始值（覆盖优先，缺省 1） */
export function numberingLevelStart(definitions: NumberingDefinitionsView, numId: number, levelIndex: number): number {
  const override = definitions.instances.find((entry) => entry.numId === numId)?.levelStartOverrides?.[String(levelIndex)];
  if (Number.isFinite(override)) return Math.max(1, Math.round(override as number));
  const level = numberingLevelOf(definitions, numId, levelIndex);
  return Number.isFinite(level?.start) && (level?.start as number) > 0 ? Math.round(level?.start as number) : 1;
}

/** 原 Iv（jsx 21777）：级别后缀（tab/space → 字符） */
export function numberingSuffixText(level: NumberingLevelView | undefined): string {
  return level?.suffix === `tab` ? `	` : level?.suffix === `space` ? ` ` : ``;
}

/** 原 Lv（jsx 21780）：符号字体 PUA 码位 → 通用字形（键为 U+F0A7/F0A8/F0B7/F0D8） */
export const BULLET_GLYPH_REPLACEMENTS: Record<string, string> = {
  [`\uf0a7`]: `□`,
  [`\uf0a8`]: `▪`,
  [`\uf0b7`]: `•`,
  [`\uf0d8`]: `➢`,
};

/** 原 Rv（jsx 21785）：项目符号字形替换（符号字体/courier 特判） */
export function replaceBulletGlyphs(text: string | undefined, bulletFontFamily: string | undefined): string | undefined {
  if (!text) return text;
  const family = bulletFontFamily?.trim().toLowerCase() ?? ``;
  return !(family.includes(`wingdings`) || family.includes(`symbol`) || family.includes(`courier`)) && !/[\uf0a7\uf0a8\uf0b7\uf0d8]/.test(text) ? text : Array.from(text).map((glyph) => BULLET_GLYPH_REPLACEMENTS[glyph] || (glyph === `o` && family.includes(`courier`) ? `◦` : glyph)).join(``);
}

/** 原 zv（jsx 21792）：全文档编号标签表（段 → 标签文本/图） */
export function numberingLabelsForModel(model: DocxEditorModel): Map<string, NumberingLabelEntry> {
  const labels = new Map<string, NumberingLabelEntry>(),
    definitions = model.metadata.numberingDefinitions as unknown as NumberingDefinitionsView | undefined;
  if (!definitions) return labels;
  const instanceById = new Map(definitions.instances.map((instance) => [instance.numId, instance])),
    styleById = new Map((model.metadata.paragraphStyles ?? []).map((style) => [style.id, style])),
    countersByNumId = new Map<number, (number | undefined)[]>(),
    countersByAbstractId = new Map<number, (number | undefined)[]>(),
    registerParagraph = (paragraph: DocxParagraphNode, labelKey: string) => {
      const numbering = paragraph.style?.numbering;
      if (!numbering || numbering.numId <= 0) return;
      const numId = effectiveNumIdOfParagraph(paragraph, definitions) ?? numbering.numId,
        levelIndex = Math.max(0, numbering.ilvl ?? 0),
        level = numberingLevelOf(definitions, numId, levelIndex),
        abstractNumId = instanceById.get(numId)?.abstractNumId,
        template = level?.text ?? `%${levelIndex + 1}.`;
      if (!template || template.trim().length === 0) return;
      const counters = countersByNumId.get(numId) ?? [],
        abstractCounters = Number.isFinite(abstractNumId) ? countersByAbstractId.get(abstractNumId as number) ?? [] : void 0;
      let resetChain = false;
      for (let index = 0; index < levelIndex; index += 1) {
        const inherited = abstractCounters && Number.isFinite(abstractCounters[index]) ? Math.max(1, Math.round(abstractCounters[index] as number)) : void 0;
        if (inherited !== void 0) {
          const current = counters[index];
          (!Number.isFinite(current) || Math.max(1, Math.round(current as number)) !== inherited) && (resetChain = true), counters[index] = inherited;
          continue;
        }
        Number.isFinite(counters[index]) || (counters[index] = numberingLevelStart(definitions, numId, index));
      }
      const currentAtLevel = resetChain ? void 0 : counters[levelIndex];
      counters[levelIndex] = Number.isFinite(currentAtLevel) ? (currentAtLevel as number) + 1 : numberingLevelStart(definitions, numId, levelIndex);
      for (let index = levelIndex + 1; index < counters.length; index += 1) counters[index] = void 0;
      if (countersByNumId.set(numId, counters), abstractCounters && Number.isFinite(abstractNumId)) {
        for (let index = 0; index <= levelIndex; index += 1) abstractCounters![index] = counters[index];
        for (let index = levelIndex + 1; index < abstractCounters!.length; index += 1) abstractCounters![index] = void 0;
        countersByAbstractId.set(abstractNumId as number, abstractCounters!);
      }
      const rendered = template.replaceAll(/%(\d+)/g, (_whole, placeholder) => {
        const slot = Math.max(0, Number(placeholder) - 1),
          counter = counters[slot],
          value = Number.isFinite(counter) ? Math.max(1, Math.round(counter as number)) : numberingLevelStart(definitions, numId, slot),
          slotFormat = numberingLevelOf(definitions, numId, slot)?.format;
        return numberInFormat(slotFormat, value);
      });
      if (!rendered || rendered.trim().length === 0) return;
      const isBullet = (level?.format ?? ``).trim().toLowerCase() === `bullet`,
        suffix = numberingSuffixText(level);
      if (isBullet && level?.pictureBullet?.src) {
        labels.set(labelKey, {
          imageSrc: level.pictureBullet.src,
          imageWidthPx: level.pictureBullet.widthPx,
          imageHeightPx: level.pictureBullet.heightPx,
          trailingText: suffix,
        });
        return;
      }
      const firstStyledChild = paragraph.children.find((child) => (child.type === `text` || child.type === `form-field`) && !!(child as DocxTextNode | DocxFormFieldNode).style),
        styleRun = paragraph.style?.styleId ? styleById.get(paragraph.style.styleId)?.runStyle : void 0,
        baseRun = (firstStyledChild as DocxTextNode | DocxFormFieldNode | undefined)?.style ?? styleRun,
        mergedRun = level?.runStyle ? {
          ...(baseRun ?? {}),
          ...level.runStyle,
        } : baseRun,
        displayText = isBullet ? replaceBulletGlyphs(rendered, level?.bulletFontFamily) : rendered;
      labels.set(labelKey, {
        text: `${displayText}${suffix}`,
        fontFamily: isBullet ? level?.bulletFontFamily : void 0,
        color: isBullet ? level?.bulletColor : void 0,
        style: mergedRun ? {
          ...mergedRun,
        } : void 0,
      });
    };
  return model.nodes.forEach((node, nodeIndex) => {
    if (node.type === `paragraph`) {
      registerParagraph(node as DocxParagraphNode, `p:${nodeIndex}`);
      return;
    }
    (node as DocxTableNode).rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        paragraphsOf(cell.nodes).forEach((cellParagraph, paragraphIndex) => {
          registerParagraph(cellParagraph, `t:${nodeIndex}:${rowIndex}:${cellIndex}:${paragraphIndex}`);
        });
      });
    });
  }), labels;
}

/* ============================================================================
 * §5 列表文本族（原 Bv..ny，jsx 21878-21932）
 * ==========================================================================*/

/** 原 Bv（jsx 21878）：无序列表前缀正则 */
export const UNORDERED_BULLET_PREFIX_REGEX = /^\s*•\s+/;
/** 原 Vv（jsx 21878）：有序列表前缀正则 */
export const ORDERED_DOT_PREFIX_REGEX = /^\s*\d+\.\s+/;
/** 原 Hv（jsx 21878）：任意列表前缀正则 */
export const ANY_LIST_PREFIX_REGEX = /^\s*(?:•\s+|\d+\.\s+)/;
/** 原 Uv（jsx 21878）：有序前缀捕获正则（缩进 + 序号） */
export const ORDERED_PREFIX_REGEX = /^(\s*)(\d+)\.\s+/;
/** 原 Wv（jsx 21878）：列表缩进 twips */
export const LIST_INDENT_TWIPS = 720;
/** 原 Gv（jsx 21878）：列表悬挂缩进 twips */
export const LIST_HANGING_TWIPS = 360;
/** 原 Kv（jsx 21878）：编号最大深度缺省 */
export const MAX_NUMBERING_DEPTH_DEFAULT = 8;

/** 原 qv（jsx 21885）：文本似无序列表 */
export function looksUnordered(text: string): boolean {
  return UNORDERED_BULLET_PREFIX_REGEX.test(text);
}

/** 原 Jv（jsx 21888）：文本似有序列表 */
export function looksOrdered(text: string): boolean {
  return ORDERED_DOT_PREFIX_REGEX.test(text);
}

/** 原 Yv（jsx 21891）：文本为纯项目符号字形 */
export function textIsBulletGlyphs(text: string, bulletFontFamily?: string): boolean {
  const normalized = replaceBulletGlyphs(text, bulletFontFamily)?.trim() ?? ``;
  return !normalized || /%[\d]+/.test(normalized) ? false : /^[\u2022\u25cf\u25cb\u25a0\u25a1\u25aa\u25ab\u25c6\u25c7\u25e6\u2043\-–—]+$/.test(normalized);
}

/** 原 Xv（jsx 21895）：段落带编号定义 */
export function paragraphHasNumbering(paragraph: DocxParagraphNode): boolean {
  return !!(paragraph.style?.numbering && paragraph.style.numbering.numId > 0);
}

/** 原 Zv（jsx 21898）：编号种类（ordered/unordered） */
export function numberingKindOf(paragraph: DocxParagraphNode, definitions: NumberingDefinitionsView | undefined): `unordered` | `ordered` | undefined {
  const numbering = paragraph.style?.numbering;
  if (numbering && numbering.numId > 0) {
    if (definitions) {
      const level = numberingLevelOf(definitions, effectiveNumIdOfParagraph(paragraph, definitions) ?? numbering.numId, Math.max(0, numbering.ilvl ?? 0)),
        format = level?.format?.trim().toLowerCase();
      if (format === `bullet` || level?.pictureBullet || textIsBulletGlyphs(level?.text ?? ``, level?.bulletFontFamily)) return `unordered`;
      if (format && format !== `none`) return `ordered`;
    }
    return `ordered`;
  }
  const text = paragraphText(paragraph);
  if (looksUnordered(text)) return `unordered`;
  if (looksOrdered(text)) return `ordered`;
}

/** 原 Qv（jsx 21913）：列表段落判定（编号或文本前缀） */
export function isNumberedParagraph(paragraph: DocxParagraphNode, text?: string): boolean {
  const subject = text ?? paragraphText(paragraph);
  return paragraphHasNumbering(paragraph) || looksUnordered(subject) || looksOrdered(subject);
}
/** C3 契约别名（原 Qv，jsx 31143 消费） */
export const paragraphIsListItem = isNumberedParagraph;

/** 原 $v（jsx 21917）：剥离列表前缀 */
export function stripListPrefix(text: string): string {
  return text.replace(/^\s*(?:•\s+|\d+\.\s+)/, ``);
}

/** 原 ey（jsx 21920）：列表前缀长度 */
export function listPrefixLength(text: string): number {
  return text.match(ANY_LIST_PREFIX_REGEX)?.[0]?.length ?? 0;
}

/** 原 ty（jsx 21922）：有序前缀递增拼接 */
export function orderedSuccessor(text: string, rest: string): string {
  const match = text.match(ORDERED_PREFIX_REGEX),
    indent = match?.[1] ?? ``,
    ordinal = Number.parseInt(match?.[2] ?? ``, 10);
  return `${indent}${Number.isFinite(ordinal) ? Math.max(1, ordinal + 1) : 1}. ${stripListPrefix(rest)}`;
}

/** 原 ny（jsx 21928）：按种类添加列表前缀 */
export function applyListPrefix(text: string, kind: `unordered` | `ordered`): string {
  const stripped = stripListPrefix(text);
  return kind === `unordered` ? `\u2022 ${stripped}` : `1. ${stripped}`;
}
/* ============================================================================
 * §6 结构克隆与段落/单元格构造（原 ry..vy，jsx 21933-22099）
 * ==========================================================================*/

/** 原 ry（jsx 21933）：单边边框克隆 */
export function cloneBorderSide(border: DocxBorderSpec | undefined): DocxBorderSpec | undefined {
  return border ? {
    ...border,
  } : void 0;
}

/** 原 iy（jsx 21938）：段落边框组克隆（含 between/bar） */
export function cloneParagraphBorders(borders: DocxParagraphStyle[`borders`] | undefined): DocxParagraphStyle[`borders`] | undefined {
  if (borders) return {
    top: cloneBorderSide(borders.top),
    right: cloneBorderSide(borders.right),
    bottom: cloneBorderSide(borders.bottom),
    left: cloneBorderSide(borders.left),
    between: cloneBorderSide(borders.between),
    bar: cloneBorderSide(borders.bar),
  };
}

/** 原 ay（jsx 21948）：段落样式深克隆（编号/间距/缩进/制表位/边框/首字下沉） */
export function cloneParagraphStyle(style: DocxParagraphStyle | undefined): DocxParagraphStyle | undefined {
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
    tabStops: style.tabStops ? style.tabStops.map((tabStop) => ({
      ...tabStop,
    })) : void 0,
    borders: cloneParagraphBorders(style.borders),
    dropCap: style.dropCap ? {
      ...style.dropCap,
    } : void 0,
  };
}

/** 原 oy（jsx 21969）：段落样式克隆 + 无样式/无间距时补默认行距
 * （行距 259/段后 160 为原式常量复用：jc/Mc 键码值兼作 twips） */
export function cloneParagraphStyleWithDefaultSpacing(style: DocxParagraphStyle | undefined, keepExisting: boolean): DocxParagraphStyle | undefined {
  const cloned = cloneParagraphStyle(style);
  if (keepExisting || cloned?.styleId) return cloned;
  const spacing = cloned?.spacing;
  return spacing?.beforeTwips !== void 0 || spacing?.afterTwips !== void 0 || spacing?.lineTwips !== void 0 || spacing?.lineRule !== void 0 ? cloned : {
    ...(cloned ?? {}),
    spacing: {
      ...(spacing ?? {}),
      lineRule: `auto`,
      lineTwips: KEY_CODE_IME_COMPOSITION,
      afterTwips: KEY_CODE_SHIFT,
    },
  };
}

/** 单元格边距 twips 面 */
export interface CellMarginTwips {
  topTwips?: number;
  rightTwips?: number;
  bottomTwips?: number;
  leftTwips?: number;
}

/** 原 sy（jsx 21983）：单元格边距克隆 */
export function cloneMarginTwips(marginTwips: CellMarginTwips | undefined): CellMarginTwips | undefined {
  if (marginTwips) return {
    topTwips: marginTwips.topTwips,
    rightTwips: marginTwips.rightTwips,
    bottomTwips: marginTwips.bottomTwips,
    leftTwips: marginTwips.leftTwips,
  };
}

/** 表格边框单边面（type/color/sizeEighthPt 三字段） */
export interface TableBorderSide {
  type?: string;
  color?: string;
  sizeEighthPt?: number;
}

/** 原 cy（jsx 21991）：表格边框单边克隆（三字段） */
export function cloneTableBorderSide(border: TableBorderSide | undefined): TableBorderSide | undefined {
  if (border) return {
    type: border.type,
    color: border.color,
    sizeEighthPt: border.sizeEighthPt,
  };
}

/** 表格边框组面（含 insideH/insideV/对角线） */
export interface TableBorders {
  top?: TableBorderSide;
  right?: TableBorderSide;
  bottom?: TableBorderSide;
  left?: TableBorderSide;
  insideH?: TableBorderSide;
  insideV?: TableBorderSide;
  tl2br?: TableBorderSide;
  tr2bl?: TableBorderSide;
}

/** 原 ly（jsx 21998）：表格边框组克隆 */
export function cloneTableBorders(borders: TableBorders | undefined): TableBorders | undefined {
  if (borders) return {
    top: cloneTableBorderSide(borders.top),
    right: cloneTableBorderSide(borders.right),
    bottom: cloneTableBorderSide(borders.bottom),
    left: cloneTableBorderSide(borders.left),
    insideH: cloneTableBorderSide(borders.insideH),
    insideV: cloneTableBorderSide(borders.insideV),
    tl2br: cloneTableBorderSide(borders.tl2br),
    tr2bl: cloneTableBorderSide(borders.tr2bl),
  };
}

/** 原 uy（jsx 22011）：单元格样式克隆（边距/边框精化） */
export function cloneCellStyle(style: DocxTableCell[`style`] | undefined): DocxTableCell[`style`] | undefined {
  if (style) return {
    ...style,
    marginTwips: cloneMarginTwips(style.marginTwips as CellMarginTwips | undefined),
    borders: cloneTableBorders(style.borders as unknown as TableBorders | undefined) as unknown as Record<string, DocxBorderSpec | undefined>,
  };
}

/** 原 dy（jsx 22018）：表格行样式克隆 */
export function cloneRowStyle(style: DocxTableRow[`style`] | undefined): DocxTableRow[`style`] | undefined {
  if (style) return {
    ...style,
  };
}

/** 原 fy（jsx 22024）：空段落构造（继承源段落首 run 样式与段落样式） */
export function emptyParagraph(sourceParagraph?: DocxParagraphNode): DocxParagraphNode {
  const runStyle = cloneRunStyle(firstTextRunStyle(sourceParagraph));
  return {
    type: `paragraph`,
    blockId: newBlockId(),
    style: cloneParagraphStyle(sourceParagraph?.style),
    children: [{
      type: `text`,
      text: ``,
      style: runStyle,
    }],
  };
}

/** 原 py（jsx 22037）：单元格克隆（首段空化；去行跨/续接标记） */
export function cloneCell(cell?: DocxTableCell): DocxTableCell {
  const firstParagraph = cell ? paragraphsOf(cell.nodes)[0] : void 0,
    cellStyle = cloneCellStyle(cell?.style);
  return {
    type: `table-cell`,
    style: cellStyle ? {
      ...cellStyle,
      rowSpan: void 0,
      vMergeContinuation: void 0,
    } : void 0,
    nodes: [emptyParagraph(firstParagraph)],
  };
}

/** 原 my（jsx 22048）：编号最大深度（实例级数夹取 0..8） */
export function maxNumberingDepth(definitions: NumberingDefinitionsView | undefined, numId: number): number {
  if (!definitions) return MAX_NUMBERING_DEPTH_DEFAULT;
  const instance = definitions.instances.find((entry) => entry.numId === numId);
  if (!instance) return MAX_NUMBERING_DEPTH_DEFAULT;
  const levels = [...(definitions.abstracts?.find((entry) => entry.abstractNumId === instance.abstractNumId)?.levels ?? []), ...(instance.levelOverrides ?? [])];
  return levels.length === 0 ? MAX_NUMBERING_DEPTH_DEFAULT : clampNumber(Math.max(0, ...levels.map((level) => Math.max(0, Math.round(level.ilvl ?? 0)))), 0, MAX_NUMBERING_DEPTH_DEFAULT);
}

/** 原 hy（jsx 22057）：缩进平移（左缩进 +Δ×720，悬挂缺省 360） */
export function shiftIndent(indent: DocxParagraphIndent | undefined, delta: number): DocxParagraphIndent | undefined {
  if (!delta) return indent;
  const leftTwips = Math.max(0, (indent?.leftTwips ?? 0) + delta * LIST_INDENT_TWIPS),
    hangingTwips = indent?.hangingTwips ?? (leftTwips > 0 ? LIST_HANGING_TWIPS : void 0);
  return {
    ...(indent ?? {}),
    leftTwips,
    hangingTwips,
  };
}

/** 原 gy（jsx 22066）：无缩进段落补列表缩进（720/360；置真表示已改） */
export function applyListIndent(paragraph: DocxParagraphNode): boolean {
  const style = cloneParagraphStyle(paragraph.style) ?? {},
    indent = style.indent,
    hasLeft = Number.isFinite(indent?.leftTwips) && Math.abs(indent?.leftTwips ?? 0) > 0,
    hasFirstLine = Number.isFinite(indent?.firstLineTwips) && Math.abs(indent?.firstLineTwips ?? 0) > 0,
    hasHanging = Number.isFinite(indent?.hangingTwips) && Math.abs(indent?.hangingTwips ?? 0) > 0;
  return hasLeft || hasFirstLine || hasHanging ? false : (paragraph.style = {
    ...style,
    indent: {
      ...(indent ?? {}),
      leftTwips: LIST_INDENT_TWIPS,
      hangingTwips: LIST_HANGING_TWIPS,
    },
  }, paragraph.sourceXml = void 0, true);
}

/** 原 _y（jsx 22081）：撤销列表缩进（恰为 720/360 时移除） */
export function removeListIndent(paragraph: DocxParagraphNode): boolean {
  const style = cloneParagraphStyle(paragraph.style),
    indent = style?.indent;
  if (!style || !indent) return false;
  const leftTwips = indent.leftTwips,
    hangingTwips = indent.hangingTwips,
    firstLineTwips = indent.firstLineTwips;
  if (!(Number.isFinite(leftTwips) && Math.round(leftTwips ?? 0) === LIST_INDENT_TWIPS && Number.isFinite(hangingTwips) && Math.round(hangingTwips ?? 0) === LIST_HANGING_TWIPS && !Number.isFinite(firstLineTwips))) return false;
  const rest = {
      ...indent,
      leftTwips: void 0,
      hangingTwips: void 0,
    },
    hasAny = [rest.leftTwips, rest.rightTwips, rest.firstLineTwips, rest.hangingTwips].some((value) => Number.isFinite(value));
  return paragraph.style = {
    ...style,
    indent: hasAny ? rest : void 0,
  }, paragraph.sourceXml = void 0, true;
}

/** 原 vy（jsx 22099）：段落数组 → 换行连接签名文本 */
export function cellParagraphsSignature(paragraphs: DocxParagraphNode[]): string {
  return paragraphs.map(paragraphText).join(`
`);
}
/* ============================================================================
 * §7 表格几何（原 yy..zy，jsx 22103-22407）
 * ==========================================================================*/

/** 原 yy（jsx 22103）：表格最大列数（gridSpan 合计，≥1） */
export function tableMaxColumnCount(table: DocxTableNode): number {
  return Math.max(1, ...table.rows.map((row) => row.cells.reduce((sum, cell) => sum + (cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1), 0)));
}

/** 原 by（jsx 22106）：浮动表环绕侧（对齐/xTwips 推断） */
export function floatingTableSide(table: DocxTableNode): `left` | `right` | undefined {
  const floating = table.style?.floating as { horizontalAlign?: string; xTwips?: number } | undefined;
  if (!floating) return;
  const align = floating.horizontalAlign?.toLowerCase();
  return align === `right` || align === `outside` ? `right` : align === `left` || align === `inside` ? `left` : Number.isFinite(floating.xTwips) && (floating.xTwips as number) > 1440 ? `right` : `left`;
}

/** 原 xy（jsx 22112）：浮动表宽 px（栅格合计兜底，下限 24） */
export function floatingTableWidthPx(table: DocxTableNode, contentWidthPx: number): number {
  const declared = twipsToPxNonNegative(table.style?.widthTwips),
    columnWidthsTwips = table.style?.columnWidthsTwips,
    gridTotal = columnWidthsTwips && columnWidthsTwips.length > 0 ? columnWidthsTwips.reduce((sum, widthTwips) => sum + (twipsToPxNonNegative(widthTwips) ?? 0), 0) : void 0;
  return Math.max(24, Math.min(Math.max(1, Math.round(contentWidthPx)), Math.round(declared ?? gridTotal ?? contentWidthPx)));
}

/** 浮动表布局选项 */
export interface FloatingTableLayoutOptions {
  tableWidthPx: number;
  tableHeightPx: number;
  flowTopPx?: number;
  deltaX?: number;
  deltaY?: number;
  indentPx?: number;
  pageMarginLeftPx?: number;
  pageMarginTopPx?: number;
}

/** 原 Sy（jsx 22118）：浮动表绝对布局 + 环绕排除区 */
export function floatingTableLayout(table: DocxTableNode, contentWidthPx: number, options: FloatingTableLayoutOptions): { leftPx: number; topPx: number; exclusion: { left: number; right: number; top: number; bottom: number } } | undefined {
  const floating = table.style?.floating as { leftFromTextTwips?: number; rightFromTextTwips?: number; topFromTextTwips?: number; bottomFromTextTwips?: number; xTwips?: number; yTwips?: number; horizontalAnchor?: string; verticalAnchor?: string; horizontalAlign?: string } | undefined;
  if (!floating) return;
  const containerWidthPx = Math.max(1, Math.round(contentWidthPx)),
    tableWidthPx = Math.max(1, Math.round(options.tableWidthPx)),
    tableHeightPx = Math.max(0, Math.round(options.tableHeightPx)),
    leftClearance = twipsToPxNonNegative(floating.leftFromTextTwips) ?? 0,
    rightClearance = twipsToPxNonNegative(floating.rightFromTextTwips) ?? 0,
    topClearance = twipsToPxNonNegative(floating.topFromTextTwips) ?? 0,
    bottomClearance = twipsToPxNonNegative(floating.bottomFromTextTwips) ?? 0,
    offsetX = twipsToPxRounded(floating.xTwips),
    offsetY = twipsToPxRounded(floating.yTwips),
    horizontalAnchor = floating.horizontalAnchor?.trim().toLowerCase(),
    verticalAnchor = floating.verticalAnchor?.trim().toLowerCase(),
    horizontalAlign = floating.horizontalAlign?.trim().toLowerCase(),
    flowTopPx = Math.round(options.flowTopPx ?? 0),
    deltaX = Math.round(options.deltaX ?? 0),
    deltaY = Math.round(options.deltaY ?? 0),
    leftPx = (offsetX === void 0 ? horizontalAlign === `right` || horizontalAlign === `outside` ? containerWidthPx - tableWidthPx - rightClearance : horizontalAlign === `center` ? Math.round((containerWidthPx - tableWidthPx) / 2) : horizontalAlign === `left` || horizontalAlign === `inside` ? leftClearance : Math.round(options.indentPx ?? 0) : horizontalAnchor === `page` ? offsetX - Math.round(options.pageMarginLeftPx ?? 0) : offsetX) + deltaX,
    topPx = (offsetY === void 0 ? 0 : verticalAnchor === `margin` ? offsetY - flowTopPx : verticalAnchor === `page` ? offsetY - Math.round(options.pageMarginTopPx ?? 0) - flowTopPx : offsetY) + deltaY;
  let exclusionLeft = Math.max(0, leftPx - leftClearance),
    exclusionRight = Math.min(containerWidthPx, leftPx + tableWidthPx + rightClearance);
  return exclusionLeft > 0 && exclusionLeft < FLOATING_SIDE_CLEARANCE_PX && (exclusionLeft = 0), exclusionRight < containerWidthPx && containerWidthPx - exclusionRight < FLOATING_SIDE_CLEARANCE_PX && (exclusionRight = containerWidthPx), {
    leftPx,
    topPx,
    exclusion: {
      left: exclusionLeft,
      right: exclusionRight,
      top: topPx - topClearance,
      bottom: topPx + tableHeightPx + bottomClearance,
    },
  };
}

/** 原 Cy（jsx 22150）：浮动表 float 样式（环绕间距） */
export function floatingTableStyle(table: DocxTableNode, indentPx: number): Record<string, unknown> {
  const floating = table.style?.floating as { topFromTextTwips?: number; bottomFromTextTwips?: number; leftFromTextTwips?: number; rightFromTextTwips?: number } | undefined;
  if (!floating) return {
    marginLeft: indentPx,
    position: `relative`,
  };
  const side = floatingTableSide(table) ?? `left`,
    marginTop = twipsToPxNonNegative(floating.topFromTextTwips) ?? 0,
    marginBottom = twipsToPxNonNegative(floating.bottomFromTextTwips) ?? 8,
    marginLeft = twipsToPxNonNegative(floating.leftFromTextTwips) ?? 8,
    marginRight = twipsToPxNonNegative(floating.rightFromTextTwips) ?? 8;
  return {
    float: side,
    clear: `none`,
    marginTop,
    marginBottom,
    marginLeft: side === `left` ? marginLeft + indentPx : marginLeft,
    marginRight: side === `right` ? marginRight + indentPx : marginRight,
    position: `relative`,
    zIndex: 1,
  };
}

/** 原 wy（jsx 22173）：嵌套表宿主定位（body/active-cell-nested-table-… 键解析） */
export function locateNestedTable(nestedTableId: string): { hostTableIndex: number; hostRowIndex: number; hostCellIndex: number; rootContentIndex: number; descendants: { rowIndex: number; cellIndex: number; contentIndex: number }[] } | undefined {
  const parts = nestedTableId.split(`-`),
    parseIndex = (part: string) => {
      const value = Number(part);
      if (!(!Number.isInteger(value) || value < 0)) return value;
    };
  if (parts.length < 8 || parts[0] !== `body` && parts[0] !== `active` || parts[1] !== `cell` || parts[2] !== `nested` || parts[3] !== `table`) return;
  const hostTableIndex = parseIndex(parts[4]),
    hostRowIndex = parseIndex(parts[5]),
    hostCellIndex = parseIndex(parts[6]),
    rootContentIndex = parseIndex(parts[7]);
  if (hostTableIndex === void 0 || hostRowIndex === void 0 || hostCellIndex === void 0 || rootContentIndex === void 0) return;
  const descendants: { rowIndex: number; cellIndex: number; contentIndex: number }[] = [];
  let cursor = 8;
  for (; cursor < parts.length;) {
    if (parts[cursor] !== `nested` || parts[cursor + 1] !== `table`) return;
    const rowIndex = parseIndex(parts[cursor + 2]),
      cellIndex = parseIndex(parts[cursor + 3]),
      contentIndex = parseIndex(parts[cursor + 4]);
    if (rowIndex === void 0 || cellIndex === void 0 || contentIndex === void 0) return;
    descendants.push({
      rowIndex,
      cellIndex,
      contentIndex,
    }), cursor += 5;
  }
  return {
    hostTableIndex,
    hostRowIndex,
    hostCellIndex,
    rootContentIndex,
    descendants,
  };
}

/** 原 Ty（jsx 22207）：表格栅格宽缓存（表 → 列数 → twips 数组） */
const tableGridWidthsCache = new WeakMap<DocxTableNode, Map<number, (number | undefined)[] | undefined>>();

/** 原 Ey（jsx 22208）：表格栅格宽（缓存） */
export function tableGridWidthsCached(table: DocxTableNode, columnCount: number): (number | undefined)[] | undefined {
  const byColumnCount = tableGridWidthsCache.get(table);
  if (byColumnCount?.has(columnCount)) return byColumnCount.get(columnCount);
  const widths = tableGridWidthsTwips(table, columnCount),
    cache = byColumnCount ?? new Map<number, (number | undefined)[] | undefined>();
  return cache.set(columnCount, widths), tableGridWidthsCache.set(table, cache), widths;
}

/** 原 Dy（jsx 22215）：表格栅格宽 twips（声明栅格与单元格推断互裁） */
export function tableGridWidthsTwips(table: DocxTableNode, columnCount: number): (number | undefined)[] | undefined {
  const declared = table.style?.columnWidthsTwips,
    inferred = gridWidthsFromCellWidths(table, columnCount);
  if (declared && declared.length === columnCount) return inferred && inferred.length > 0 && gridWidthsDivergeFromCells(table, declared) ? inferred : normalizeGridWidthsTwips(declared, columnCount);
  if (inferred && inferred.length > 0) return inferred;
  if (declared && declared.length > 0) return normalizeGridWidthsTwips(declared, columnCount);
}

/** 原 Oy（jsx 22222）：声明栅格与单元格宽半数以上背离 */
export function gridWidthsDivergeFromCells(table: DocxTableNode, gridWidthsTwips: number[]): boolean {
  let divergentRows = 0,
    measuredRows = 0;
  for (const row of table.rows) {
    let cursor = 0,
      measuredCells = 0,
      divergentCells = 0;
    for (const cell of row.cells) {
      const span = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1,
        spanWidth = gridWidthsTwips.slice(cursor, cursor + span).reduce((sum, width) => sum + Math.max(0, width), 0);
      cursor += span;
      const declaredWidth = cell.style?.widthTwips;
      !declaredWidth || declaredWidth <= 0 || spanWidth <= 0 || (measuredCells += 1, Math.abs(declaredWidth - spanWidth) / spanWidth > 0.2 && (divergentCells += 1));
    }
    measuredCells > 0 && (measuredRows += 1, divergentCells * 2 > measuredCells && (divergentRows += 1));
  }
  return measuredRows > 0 && divergentRows * 2 > measuredRows;
}

/** 原 ky（jsx 22240）：按单元格宽推断栅格（最满行胜出） */
export function gridWidthsFromCellWidths(table: DocxTableNode, columnCount: number): number[] | undefined {
  let best: number[] | undefined,
    bestFilled = -1,
    bestTotal = -1;
  for (const row of table.rows) {
    const widths: number[] = [];
    for (const cell of row.cells) {
      const span = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1,
        widthTwips = cell.style?.widthTwips;
      if (widthTwips && widthTwips > 0) {
        const perColumn = widthTwips / span;
        for (let index = 0; index < span; index += 1) widths.push(perColumn);
        continue;
      }
      for (let index = 0; index < span; index += 1) widths.push(0);
    }
    if (widths.length !== columnCount || widths.length === 0) continue;
    const filled = widths.filter((width) => width > 0).length;
    if (filled <= 0) continue;
    const total = widths.reduce((sum, width) => sum + (width > 0 ? width : 0), 0);
    (filled > bestFilled || filled === bestFilled && total > bestTotal) && (best = widths, bestFilled = filled, bestTotal = total);
  }
  if (best) return normalizeGridWidthsTwips(best, columnCount);
}

/** 原 Ay（jsx 22266）：栅格宽归一（缺省均摊 1440/列数；全零重置） */
export function normalizeGridWidthsTwips(widthsTwips: number[], columnCount: number): number[] {
  const fallback = 1440 / Math.max(1, columnCount),
    normalized = Array.from({
      length: columnCount,
    }, (_unused, index) => {
      const width = widthsTwips[index];
      return Number.isFinite(width) ? Math.max(1, width as number) : fallback;
    });
  return normalized.every((width) => width <= 0) ? Array.from({
    length: columnCount,
  }, () => fallback) : normalized;
}

/** 原 jy（jsx 22276）：栅格宽 px 归一（缺省均摊表宽；下限可配） */
export function normalizeGridWidthsPx(widthsPx: number[], columnCount: number, tableWidthPx: number | undefined, minWidthPx = 24): number[] {
  const fallback = Number.isFinite(tableWidthPx) && (tableWidthPx as number) > 0 ? (tableWidthPx as number) / Math.max(1, columnCount) : 140;
  return Array.from({
    length: columnCount,
  }, (_unused, index) => {
    const width = widthsPx[index];
    return !Number.isFinite(width) || (width as number) <= 0 ? Math.max(minWidthPx, Math.round(fallback)) : Math.max(minWidthPx, Math.round(width as number));
  });
}

/** 原 My（jsx 22285）：均分栅格宽 px（下限 24） */
export function evenGridWidthsPx(columnCount: number, tableWidthPx: number | undefined): number[] {
  const fallback = Number.isFinite(tableWidthPx) && (tableWidthPx as number) > 0 ? (tableWidthPx as number) / Math.max(1, columnCount) : 140;
  return Array.from({
    length: columnCount,
  }, () => Math.max(24, Math.round(fallback)));
}

/** 原 Ny（jsx 22291）：表体宽夹取（≥1；上限可选） */
export function clampTableContentWidthPx(totalPx: number, capPx: number | undefined): number {
  return !Number.isFinite(totalPx) || totalPx <= 0 ? 1 : !Number.isFinite(capPx) || (capPx as number) <= 0 ? Math.max(1, Math.round(totalPx)) : Math.max(1, Math.min(Math.round(totalPx), Math.round(capPx as number)));
}

/** 原 Py（jsx 22294）：栅格宽按总宽缩放（8px 下限迭代再分配） */
export function scaleGridWidthsToPx(widthsPx: number[], totalPx: number): number[] {
  if (widthsPx.length === 0) return [];
  if (!Number.isFinite(totalPx) || totalPx <= 0) return [...widthsPx];
  const sanitized = widthsPx.map((width) => Number.isFinite(width) && width > 0 ? width : 1),
    sum = sanitized.reduce((acc, width) => acc + width, 0);
  if (!Number.isFinite(sum) || sum <= 0) {
    const even = Math.max(1, totalPx / sanitized.length);
    return Array.from({
      length: sanitized.length,
    }, () => even);
  }
  if (Math.abs(sum - totalPx) <= 0.5) return sanitized;
  if (sum < totalPx) {
    const factor = totalPx / sum;
    return sanitized.map((width) => Math.max(1, width * factor));
  }
  if (sanitized.length * 8 >= totalPx) {
    const even = Math.max(1, totalPx / sanitized.length);
    return Array.from({
      length: sanitized.length,
    }, () => even);
  }
  const scaled = sanitized.map((width) => Math.max(8, width / sum * totalPx));
  let excess = scaled.reduce((acc, width) => acc + width, 0) - totalPx,
    iterations = 0;
  for (; excess > 0.25 && iterations < 64;) {
    const shrinkable = scaled.map((value, index) => ({
      value,
      index,
    })).filter((entry) => entry.value > 8.01);
    if (shrinkable.length === 0) break;
    const shrinkRoom = shrinkable.reduce((acc, entry) => acc + (entry.value - 8), 0);
    if (shrinkRoom <= 0) break;
    for (const entry of shrinkable) {
      const share = (entry.value - 8) / shrinkRoom * excess;
      scaled[entry.index] = Math.max(8, entry.value - share);
    }
    excess = scaled.reduce((acc, width) => acc + width, 0) - totalPx, iterations += 1;
  }
  return scaled;
}

/** 原 Fy（jsx 22336）：行栅格跨列合计（夹取列数内） */
export function rowColumnSpanCount(row: DocxTableRow, columnCount: number): number {
  const spanTotal = row.cells.reduce((sum, cell) => sum + (cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1), 0);
  return Math.max(0, Math.min(columnCount, spanTotal));
}

/** 原 Iy（jsx 22339）：有效列宽 px（fixed 布局尾部空列折叠） */
export function effectiveColumnWidthsPx(table: DocxTableNode, widthsPx: number[], tableWidthPx: number): { columnWidthsPx: number[]; effectiveColumnCount: number } {
  const columnCount = widthsPx.length;
  if (columnCount === 0) return {
    columnWidthsPx: [],
    effectiveColumnCount: 0,
  };
  const scaled = scaleGridWidthsToPx(widthsPx, tableWidthPx),
    total = widthsPx.reduce((acc, width) => acc + width, 0);
  if (table.style?.layout !== `fixed` || table.rows.length < 2 || !Number.isFinite(total) || total <= 0 || !Number.isFinite(tableWidthPx) || tableWidthPx <= 0 || total <= tableWidthPx + 0.5) return {
    columnWidthsPx: scaled,
    effectiveColumnCount: columnCount,
  };
  const rowSpans = table.rows.map((row) => rowColumnSpanCount(row, columnCount)),
    spanHistogram = new Map<number, number>();
  if (rowSpans.forEach((span) => {
    span <= 0 || span >= columnCount || spanHistogram.set(span, (spanHistogram.get(span) ?? 0) + 1);
  }), spanHistogram.size === 0) return {
    columnWidthsPx: scaled,
    effectiveColumnCount: columnCount,
  };
  let candidateCount = columnCount,
    candidateHits = 0;
  for (const [span, hits] of spanHistogram.entries()) (hits > candidateHits || hits === candidateHits && span > candidateCount) && (candidateCount = span, candidateHits = hits);
  if (candidateHits / Math.max(1, rowSpans.length) < 0.6 || candidateCount <= 0 || candidateCount >= columnCount) return {
    columnWidthsPx: scaled,
    effectiveColumnCount: columnCount,
  };
  const tailWidth = widthsPx.slice(candidateCount).reduce((acc, width) => acc + width, 0),
    tailFraction = tailWidth / total;
  return !Number.isFinite(tailWidth) || tailWidth < 24 || tailFraction < 0.12 ? {
    columnWidthsPx: scaled,
    effectiveColumnCount: columnCount,
  } : {
    columnWidthsPx: [...scaleGridWidthsToPx(widthsPx.slice(0, candidateCount), tableWidthPx), ...Array.from({
      length: columnCount - candidateCount,
    }, () => 0)],
    effectiveColumnCount: candidateCount,
  };
}

/** 原 Ly（jsx 22378）：单元格边距 twips → px（缺省 4px 内边距） */
export function cellMarginsPx(marginTwips: unknown): { top: number; right: number; bottom: number; left: number } {
  const margins = marginTwips as CellMarginTwips | undefined;
  return {
    top: twipsToPxNonNegative(margins?.topTwips) ?? PAGINATION_IGNORE_INSET_PX.top,
    right: twipsToPxNonNegative(margins?.rightTwips) ?? PAGINATION_IGNORE_INSET_PX.right,
    bottom: twipsToPxNonNegative(margins?.bottomTwips) ?? PAGINATION_IGNORE_INSET_PX.bottom,
    left: twipsToPxNonNegative(margins?.leftTwips) ?? PAGINATION_IGNORE_INSET_PX.left,
  };
}

/** 原 Ry（jsx 22385）：单元格 padding 样式 */
export function cellPaddingStyle(marginTwips: unknown): { paddingTop: number; paddingRight: number; paddingBottom: number; paddingLeft: number } {
  const {
    top,
    right,
    bottom,
    left,
  } = cellMarginsPx(marginTwips);
  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  };
}

/** 原 zy（jsx 22400）：有效单元格边距 twips（单元格覆盖优先） */
export function effectiveCellMarginTwips(tableMarginTwips: unknown, cellMarginTwips: unknown): CellMarginTwips | undefined {
  const tableMargins = tableMarginTwips as CellMarginTwips | undefined,
    cellMargins = cellMarginTwips as CellMarginTwips | undefined;
  if (!(!tableMargins && !cellMargins)) return {
    topTwips: cellMargins?.topTwips ?? tableMargins?.topTwips,
    rightTwips: cellMargins?.rightTwips ?? tableMargins?.rightTwips,
    bottomTwips: cellMargins?.bottomTwips ?? tableMargins?.bottomTwips,
    leftTwips: cellMargins?.leftTwips ?? tableMargins?.leftTwips,
  };
}

/* C3（批 B5-09）declare 契约别名（契约名与实体名双出，见报告 §3） */
/** 原 yy（jsx 22103）C3 契约别名 */
export const tableGridColumnCount = tableMaxColumnCount;
/** 原 Ey（jsx 22208）C3 契约别名 */
export const tableGridColumnsCached = tableGridWidthsCached;
/** 原 jy（jsx 22276）C3 契约别名 */
export const normalizeColumnWidths = normalizeGridWidthsPx;
/** 原 My（jsx 22285）C3 契约别名 */
export const defaultColumnWidths = evenGridWidthsPx;
/* ============================================================================
 * §8 边框预设（原 By..sb，jsx 22408-22838）
 * ==========================================================================*/

/** 原 By（jsx 22408）：边框类型归一（小写；空 → undefined） */
export function borderTypeNormalized(type: string | undefined): string | undefined {
  if (!type) return;
  const normalized = type.trim().toLowerCase();
  return normalized.length > 0 ? normalized : void 0;
}

/** 原 Vy（jsx 22411）：单边边框 CSS 串 */
export function borderSideCss(border: TableBorderSide | undefined): string | undefined {
  const type = borderTypeNormalized(border?.type);
  if (!type) return;
  if (type === `none` || type === `nil`) return `none`;
  const style = type === `double` ? `double` : type === `dashed` || type === `dashsmallgap` || type === `dotdash` || type === `dotdotdash` ? `dashed` : type === `dotted` ? `dotted` : `solid`,
    sizeEighthPt = border?.sizeEighthPt;
  return `${Number.isFinite(sizeEighthPt) && (sizeEighthPt as number) > 0 ? Math.max(0.5, Number(((sizeEighthPt as number) / 6).toFixed(2))) : 1}px ${style} ${border?.color ?? `#000000`}`;
}

/** 原 Hy（jsx 22421）：单边边框宽 px */
export function borderSideWidthPx(border: TableBorderSide | undefined): number {
  const type = borderTypeNormalized(border?.type);
  if (!type || type === `none` || type === `nil`) return 0;
  const sizeEighthPt = border?.sizeEighthPt;
  return Number.isFinite(sizeEighthPt) && (sizeEighthPt as number) > 0 ? Math.max(0.5, Number(((sizeEighthPt as number) / 6).toFixed(2))) : 1;
}

/** 原 Uy（jsx 22427）：边框类型可见（非 none/nil） */
export function borderTypeVisible(type: string | undefined): boolean {
  const normalized = borderTypeNormalized(type);
  return !!(normalized && normalized !== `none` && normalized !== `nil`);
}

/** 原 Wy（jsx 22431）：段落单边边框可见 */
export function paragraphBorderVisible(border: DocxBorderSpec | undefined): boolean {
  return borderTypeVisible(border?.type);
}

/** 原 Gy（jsx 22434）：表格单边边框可见 */
export function tableBorderVisible(border: TableBorderSide | undefined): boolean {
  return borderTypeVisible(border?.type);
}

/** 原 Ky（jsx 22437）：单元格四边任一边框可见 */
export function cellBordersVisible(borders: TableBorders | undefined): boolean {
  return !!(tableBorderVisible(borders?.top) || tableBorderVisible(borders?.right) || tableBorderVisible(borders?.bottom) || tableBorderVisible(borders?.left));
}

/** 原 qy（jsx 22440）：表格走单元格边框（有间距，或无内边框且单元格自带边框） */
export function tableUsesCellBorders(table: DocxTableNode): boolean {
  const cellSpacing = twipsToPxNonNegative(table.style?.cellSpacingTwips as number | undefined);
  if (Number.isFinite(cellSpacing) && (cellSpacing as number) > 0) return true;
  const borders = table.style?.borders as unknown as TableBorders | undefined;
  return tableBorderVisible(borders?.insideH) || tableBorderVisible(borders?.insideV) ? false : table.rows.some((row) => row.cells.some((cell) => cellBordersVisible(cell.style?.borders as unknown as TableBorders | undefined)));
}

/** 原 Jy（jsx 22446）：表格边框间距 px */
export function tableBorderSpacingPx(table: DocxTableNode): number {
  const cellSpacing = twipsToPxNonNegative(table.style?.cellSpacingTwips as number | undefined);
  return Number.isFinite(cellSpacing) && (cellSpacing as number) > 0 ? Math.max(0, Math.round(cellSpacing as number)) : tableUsesCellBorders(table) && cellBordersVisible(table.style?.borders as unknown as TableBorders | undefined) ? 1 : 0;
}

/** 原 Yy（jsx 22451）：表格 border-collapse 样式 */
export function tableBorderCollapseStyle(table: DocxTableNode, spacingPx = tableBorderSpacingPx(table)): Record<string, string> {
  return tableUsesCellBorders(table) ? {
    borderCollapse: `separate`,
    borderSpacing: `${Math.max(0, Math.round(spacingPx))}px`,
  } : {
    borderCollapse: `collapse`,
  };
}

/** 原 Xy（jsx 22458）：段落边框首个定义边（继承源） */
export function firstParagraphBorder(borders: DocxParagraphStyle[`borders`] | undefined): DocxBorderSpec | undefined {
  if (borders) return borders.top ?? borders.right ?? borders.bottom ?? borders.left ?? borders.between ?? borders.bar;
}

/** 原 Zy（jsx 22461）：表格边框首个定义边 */
export function firstTableBorder(borders: TableBorders | undefined): TableBorderSide | undefined {
  if (borders) return borders.top ?? borders.right ?? borders.bottom ?? borders.left ?? borders.insideH ?? borders.insideV ?? borders.tl2br ?? borders.tr2bl;
}

/** 原 Qy（jsx 22464）：段落边框规格归一（缺省 single/默认尺寸/色） */
export function normalizeParagraphBorderSpec(border: DocxBorderSpec | undefined): DocxBorderSpec {
  return {
    type: borderTypeVisible(border?.type) ? border?.type : `single`,
    sizeEighthPt: Number.isFinite(border?.sizeEighthPt) && (border?.sizeEighthPt as number) > 0 ? Math.round(border?.sizeEighthPt as number) : TABLE_NESTED_HANDLE_SIZE_PX,
    color: border?.color ?? TABLE_NESTED_HANDLE_COLOR,
    ...(Number.isFinite(border?.spacePt) ? {
      spacePt: Math.max(0, Math.round(border?.spacePt as number)),
    } : void 0),
  };
}

/** 原 $y（jsx 22472）：表格边框规格归一 */
export function normalizeTableBorderSpec(border: TableBorderSide | undefined): TableBorderSide {
  return {
    type: borderTypeVisible(border?.type) ? border?.type : `single`,
    sizeEighthPt: Number.isFinite(border?.sizeEighthPt) && (border?.sizeEighthPt as number) > 0 ? Math.round(border?.sizeEighthPt as number) : TABLE_NESTED_HANDLE_SIZE_PX,
    color: border?.color ?? TABLE_NESTED_HANDLE_COLOR,
  };
}

/** 原 eb（jsx 22481）：段落 nil 边框 */
export function nilParagraphBorder(): DocxBorderSpec {
  return {
    type: `nil`,
  };
}

/** 原 tb（jsx 22486）：表格 nil 边框 */
export function nilTableBorder(): TableBorderSide {
  return {
    type: `nil`,
  };
}

/** 原 nb（jsx 22491）：段落边框预设命中表 */
export function paragraphBorderPresets(borders: DocxParagraphStyle[`borders`] | undefined): Record<string, boolean> | undefined {
  const top = paragraphBorderVisible(borders?.top),
    right = paragraphBorderVisible(borders?.right),
    bottom = paragraphBorderVisible(borders?.bottom),
    left = paragraphBorderVisible(borders?.left),
    between = paragraphBorderVisible(borders?.between),
    bar = paragraphBorderVisible(borders?.bar);
  return {
    bottom,
    top,
    left,
    right,
    none: !(top || right || bottom || left || between || bar),
    all: top && right && bottom && left,
    outside: top && right && bottom && left,
    inside: between || bar,
    "inside-horizontal": between,
    "inside-vertical": bar,
    "diagonal-down": false,
    "diagonal-up": false,
    "horizontal-line": bottom,
  };
}

/** 原 rb（jsx 22514）：段落组边框预设一致性判定 */
export function paragraphsMatchBorderPreset(side: string, paragraphBordersList: (DocxParagraphStyle[`borders`] | undefined)[]): boolean {
  if (paragraphBordersList.length === 0) return false;
  const first = paragraphBordersList[0],
    last = paragraphBordersList[paragraphBordersList.length - 1],
    allLeft = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.left)),
    allRight = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.right)),
    allTop = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.top)),
    allBottom = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.bottom)),
    allBetween = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.between)),
    allBar = paragraphBordersList.every((borders) => paragraphBorderVisible(borders?.bar));
  switch (side) {
    case `top`:
      return paragraphBorderVisible(first?.top);
    case `bottom`:
      return paragraphBorderVisible(last?.bottom);
    case `left`:
      return allLeft;
    case `right`:
      return allRight;
    case `all`:
    case `outside`:
      return paragraphBorderVisible(first?.top) && paragraphBorderVisible(last?.bottom) && allLeft && allRight;
    case `none`:
      return paragraphBordersList.every((borders) => (paragraphBorderPresets(borders) as Record<string, boolean>).none);
    case `inside`:
      return allBetween && allBar;
    case `inside-horizontal`:
      return allBetween;
    case `inside-vertical`:
      return allBar;
    case `horizontal-line`:
      return paragraphBorderVisible(last?.bottom);
    case `diagonal-down`:
    case `diagonal-up`:
      return false;
    default:
      return allTop && allBottom;
  }
}

/** 原 ib（jsx 22553）：单元格边框切换（段落边框组形态；首末行特判） */
export function toggleTableCellBorder(borders: DocxParagraphStyle[`borders`] | undefined, side: string, enabled: boolean, rowIndex: number, rowCount: number): DocxParagraphStyle[`borders`] | undefined {
  if (rowCount <= 1) return toggleParagraphBorder(borders, side, enabled);
  const cloned = cloneParagraphBorders(borders) ?? {},
    preset = normalizeParagraphBorderSpec(firstParagraphBorder(cloned)),
    nil = nilParagraphBorder(),
    applied = enabled ? nil : preset,
    isFirst = rowIndex === 0,
    isLast = rowIndex === rowCount - 1;
  switch (side) {
    case `top`:
      return cloned.top = {
        ...(isFirst ? applied : nil),
      }, cloned;
    case `bottom`:
      return cloned.bottom = {
        ...(isLast ? applied : nil),
      }, cloned;
    case `left`:
      return cloned.left = {
        ...applied,
      }, cloned;
    case `right`:
      return cloned.right = {
        ...applied,
      }, cloned;
    case `all`:
    case `outside`:
      return enabled ? (cloned.top = {
        ...nil,
      }, cloned.right = {
        ...nil,
      }, cloned.bottom = {
        ...nil,
      }, cloned.left = {
        ...nil,
      }) : (cloned.top = {
        ...(isFirst ? applied : nil),
      }, cloned.right = {
        ...applied,
      }, cloned.bottom = {
        ...(isLast ? applied : nil),
      }, cloned.left = {
        ...applied,
      }), cloned;
    case `horizontal-line`:
      return cloned.bottom = {
        ...(isLast ? applied : nil),
      }, cloned;
    case `none`:
      return cloned.top = {
        ...nil,
      }, cloned.right = {
        ...nil,
      }, cloned.bottom = {
        ...nil,
      }, cloned.left = {
        ...nil,
      }, cloned.between = {
        ...nil,
      }, cloned.bar = {
        ...nil,
      }, cloned;
    default:
      return toggleParagraphBorder(borders, side, enabled);
  }
}

/** 原 ab（jsx 22619）：表格边框预设命中表（表级 + 单元格级合并） */
export function tableBorderPresets(tableBorders: TableBorders | undefined, cellBorders: TableBorders | undefined): Record<string, boolean> {
  const top = tableBorderVisible(tableBorders?.top),
    right = tableBorderVisible(tableBorders?.right),
    bottom = tableBorderVisible(tableBorders?.bottom),
    left = tableBorderVisible(tableBorders?.left),
    insideH = tableBorderVisible(tableBorders?.insideH),
    insideV = tableBorderVisible(tableBorders?.insideV),
    diagonalDown = tableBorderVisible(cellBorders?.tl2br ?? tableBorders?.tl2br),
    diagonalUp = tableBorderVisible(cellBorders?.tr2bl ?? tableBorders?.tr2bl);
  return {
    bottom,
    top,
    left,
    right,
    none: !(top || right || bottom || left || insideH || insideV || diagonalDown || diagonalUp),
    all: top && right && bottom && left && insideH && insideV,
    outside: top && right && bottom && left,
    inside: insideH && insideV,
    "inside-horizontal": insideH,
    "inside-vertical": insideV,
    "diagonal-down": diagonalDown,
    "diagonal-up": diagonalUp,
    "horizontal-line": insideH,
  };
}

/** 原 ob（jsx 22644）：段落边框切换 */
export function toggleParagraphBorder(borders: DocxParagraphStyle[`borders`] | undefined, side: string, enabled = false): DocxParagraphStyle[`borders`] | undefined {
  const cloned = cloneParagraphBorders(borders) ?? {},
    preset = normalizeParagraphBorderSpec(firstParagraphBorder(cloned)),
    nil = nilParagraphBorder(),
    applied = enabled ? nil : preset;
  switch (side) {
    case `top`:
      cloned.top = {
        ...applied,
      };
      break;
    case `right`:
      cloned.right = {
        ...applied,
      };
      break;
    case `bottom`:
      cloned.bottom = {
        ...applied,
      };
      break;
    case `left`:
      cloned.left = {
        ...applied,
      };
      break;
    case `all`:
    case `outside`:
      cloned.top = {
        ...applied,
      }, cloned.right = {
        ...applied,
      }, cloned.bottom = {
        ...applied,
      }, cloned.left = {
        ...applied,
      };
      break;
    case `inside`:
      cloned.between = {
        ...applied,
      }, cloned.bar = {
        ...applied,
      };
      break;
    case `inside-horizontal`:
      cloned.between = {
        ...applied,
      };
      break;
    case `inside-vertical`:
      cloned.bar = {
        ...applied,
      };
      break;
    case `horizontal-line`:
      cloned.bottom = {
        ...applied,
      };
      break;
    case `none`:
      cloned.top = {
        ...nil,
      }, cloned.right = {
        ...nil,
      }, cloned.bottom = {
        ...nil,
      }, cloned.left = {
        ...nil,
      }, cloned.between = {
        ...nil,
      }, cloned.bar = {
        ...nil,
      };
      break;
    case `diagonal-down`:
    case `diagonal-up`:
      return;
    default:
      return cloned;
  }
  return cloned;
}

/** 原 sb（jsx 22727）：表格边框切换（含对角线） */
export function toggleTableBorder(borders: TableBorders | undefined, side: string, enabled = false): TableBorders | undefined {
  const cloned = cloneTableBorders(borders) ?? {},
    preset = normalizeTableBorderSpec(firstTableBorder(cloned)),
    nil = nilTableBorder(),
    applied = enabled ? nil : preset;
  switch (side) {
    case `top`:
      cloned.top = {
        ...applied,
      };
      break;
    case `right`:
      cloned.right = {
        ...applied,
      };
      break;
    case `bottom`:
      cloned.bottom = {
        ...applied,
      };
      break;
    case `left`:
      cloned.left = {
        ...applied,
      };
      break;
    case `all`:
      cloned.top = {
        ...applied,
      }, cloned.right = {
        ...applied,
      }, cloned.bottom = {
        ...applied,
      }, cloned.left = {
        ...applied,
      }, cloned.insideH = {
        ...applied,
      }, cloned.insideV = {
        ...applied,
      };
      break;
    case `outside`:
      cloned.top = {
        ...applied,
      }, cloned.right = {
        ...applied,
      }, cloned.bottom = {
        ...applied,
      }, cloned.left = {
        ...applied,
      }, enabled || (cloned.insideH = {
        ...nil,
      }, cloned.insideV = {
        ...nil,
      });
      break;
    case `inside`:
      cloned.insideH = {
        ...applied,
      }, cloned.insideV = {
        ...applied,
      };
      break;
    case `inside-horizontal`:
      cloned.insideH = {
        ...applied,
      };
      break;
    case `inside-vertical`:
      cloned.insideV = {
        ...applied,
      };
      break;
    case `horizontal-line`:
      cloned.insideH = {
        ...applied,
      };
      break;
    case `none`:
      cloned.top = {
        ...nil,
      }, cloned.right = {
        ...nil,
      }, cloned.bottom = {
        ...nil,
      }, cloned.left = {
        ...nil,
      }, cloned.insideH = {
        ...nil,
      }, cloned.insideV = {
        ...nil,
      }, cloned.tl2br = {
        ...nil,
      }, cloned.tr2bl = {
        ...nil,
      };
      break;
    case `diagonal-down`:
      cloned.tl2br = {
        ...applied,
      };
      break;
    case `diagonal-up`:
      cloned.tr2bl = {
        ...applied,
      };
      break;
    default:
      return cloned;
  }
  return cloned;
}
/* ============================================================================
 * §8b 单元格边解析与表外边框（原 cb/lb/ub/db，jsx 22839-22898）
 * ==========================================================================*/

/** 原 cb（jsx 22839）：单元格某边边框（单元格覆盖 → 表边框按位置回退） */
export function cellBorderForSide(
  tableBorders: TableBorders | undefined,
  cellBordersMap: Record<string, TableBorderSide | undefined> | undefined,
  side: `top` | `right` | `bottom` | `left`,
  rowIndex: number,
  rowCount: number,
  startColumn: number,
  endColumn: number,
  columnCount: number,
): TableBorderSide | undefined {
  const override = cellBordersMap?.[side];
  if (override) return override;
  const isFirstRow = rowIndex === 0,
    isLastRow = rowIndex >= rowCount - 1,
    isFirstColumn = startColumn === 0,
    isLastColumn = endColumn >= columnCount - 1;
  return side === `top` ? isFirstRow ? tableBorders?.top : tableBorders?.insideH : side === `bottom` ? isLastRow ? tableBorders?.bottom : tableBorders?.insideH : side === `left` ? isFirstColumn ? tableBorders?.left : tableBorders?.insideV : isLastColumn ? tableBorders?.right : tableBorders?.insideV;
}

/** 原 lb（jsx 22848）：单元格四边 CSS（缺省边省略） */
export function cellBorderCss(
  tableBorders: TableBorders | undefined,
  cellBordersMap: Record<string, TableBorderSide | undefined> | undefined,
  rowIndex: number,
  rowCount: number,
  startColumn: number,
  endColumn: number,
  columnCount: number,
): Record<string, string> {
  const top = borderSideCss(cellBorderForSide(tableBorders, cellBordersMap, `top`, rowIndex, rowCount, startColumn, endColumn, columnCount)),
    right = borderSideCss(cellBorderForSide(tableBorders, cellBordersMap, `right`, rowIndex, rowCount, startColumn, endColumn, columnCount)),
    bottom = borderSideCss(cellBorderForSide(tableBorders, cellBordersMap, `bottom`, rowIndex, rowCount, startColumn, endColumn, columnCount)),
    left = borderSideCss(cellBorderForSide(tableBorders, cellBordersMap, `left`, rowIndex, rowCount, startColumn, endColumn, columnCount));
  return {
    ...(top === void 0 ? void 0 : {
      borderTop: top,
    }),
    ...(right === void 0 ? void 0 : {
      borderRight: right,
    }),
    ...(bottom === void 0 ? void 0 : {
      borderBottom: bottom,
    }),
    ...(left === void 0 ? void 0 : {
      borderLeft: left,
    }),
  };
}

/** 原 ub（jsx 22868）：表格外侧边框宽合计 px（左右最大均值） */
export function tableOuterBorderWidthPx(table: DocxTableNode, columnCount = tableMaxColumnCount(table)): number {
  if (columnCount <= 0 || tableUsesCellBorders(table)) return 0;
  const rowCount = table.rows.length,
    borders = table.style?.borders as unknown as TableBorders | undefined;
  let leftWidth = borderSideWidthPx(borders?.left),
    rightWidth = borderSideWidthPx(borders?.right);
  return table.rows.forEach((row, rowIndex) => {
    let columnCursor = 0;
    row.cells.forEach((cell) => {
      const span = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1,
        startColumn = columnCursor,
        endColumn = Math.min(columnCount - 1, startColumn + span - 1);
      columnCursor += span, !cell.style?.vMergeContinuation && (startColumn === 0 && (leftWidth = Math.max(leftWidth, borderSideWidthPx(cellBorderForSide(borders, cell.style?.borders as unknown as Record<string, TableBorderSide | undefined> | undefined, `left`, rowIndex, rowCount, startColumn, endColumn, columnCount)))), endColumn >= columnCount - 1 && (rightWidth = Math.max(rightWidth, borderSideWidthPx(cellBorderForSide(borders, cell.style?.borders as unknown as Record<string, TableBorderSide | undefined> | undefined, `right`, rowIndex, rowCount, startColumn, endColumn, columnCount)))));
    });
  }), Math.max(0, Math.ceil((leftWidth + rightWidth) / 2));
}

/** 原 db（jsx 22884）：对角线边框背景（渐变叠合） */
export function diagonalBordersBackground(tableBorders: TableBorders | undefined, cellBorders: TableBorders | undefined): Record<string, string> {
  const tl2br = cellBorders?.tl2br ?? tableBorders?.tl2br,
    tr2bl = cellBorders?.tr2bl ?? tableBorders?.tr2bl,
    gradients: string[] = [],
    pushGradient = (border: TableBorderSide | undefined, direction: string) => {
      if (!tableBorderVisible(border)) return;
      const color = border?.color ?? `#000000`,
        widthPx = Number.isFinite(border?.sizeEighthPt) && (border?.sizeEighthPt as number) > 0 ? Math.max(0.75, Number(((border?.sizeEighthPt as number) / 6).toFixed(2))) : 1,
        halfPx = Number((widthPx / 2).toFixed(2));
      gradients.push(`linear-gradient(${direction}, transparent calc(50% - ${halfPx}px), ${color} calc(50% - ${halfPx}px), ${color} calc(50% + ${halfPx}px), transparent calc(50% + ${halfPx}px))`);
    };
  return pushGradient(tl2br, `to bottom right`), pushGradient(tr2bl, `to bottom left`), gradients.length === 0 ? {} : {
    backgroundImage: gradients.join(`, `),
    backgroundRepeat: `no-repeat`,
    backgroundSize: `100% 100%`,
  };
}

/* ============================================================================
 * §9 run/表单域克隆与文本编辑（原 fb..Ob，jsx 22901-23287）
 * ==========================================================================*/

/** 原 fb（jsx 22901）：run 样式克隆 */
export function cloneRunStyle(style: DocxRunStyle | undefined): DocxRunStyle | undefined {
  return style ? {
    ...style,
  } : void 0;
}

/** 原 pb（jsx 22906）：run 样式强制字体族（清除字体主题/回退字段） */
export function withFontFamily(style: DocxRunStyle | undefined, fontFamily: string): DocxRunStyle {
  const next: DocxRunStyle & Record<string, unknown> = {
    ...(style ?? {}),
    fontFamily,
  };
  return delete next.fontFamilyAscii, delete next.fontFamilyHAnsi, delete next.fontFamilyEastAsia, delete next.fontFamilyCs, delete next.fontThemeAscii, delete next.fontThemeHAnsi, delete next.fontThemeEastAsia, delete next.fontThemeCs, delete next.resolvedFontFamilyAscii, delete next.resolvedFontFamilyHAnsi, delete next.resolvedFontFamilyEastAsia, delete next.resolvedFontFamilyCs, delete next.fontHint, next;
}

/** 表单域 widget 面 */
export interface FormFieldWidgetView {
  name?: string;
  enabled?: boolean;
  calcOnExit?: boolean;
  text?: { inputType?: string; defaultText?: string; maxLength?: number; textFormat?: string };
  checkbox?: { defaultChecked?: boolean; sizeMode?: string; sizePt?: number };
  dropdown?: { defaultValue?: string };
}

/** 原 mb（jsx 22913）：表单域 widget 克隆（白名单字段） */
export function cloneFormFieldWidget(widget: FormFieldWidgetView | undefined): FormFieldWidgetView | undefined {
  if (widget) return {
    name: widget.name,
    enabled: widget.enabled,
    calcOnExit: widget.calcOnExit,
    text: widget.text ? {
      inputType: widget.text.inputType,
      defaultText: widget.text.defaultText,
      maxLength: widget.text.maxLength,
      textFormat: widget.text.textFormat,
    } : void 0,
    checkbox: widget.checkbox ? {
      defaultChecked: widget.checkbox.defaultChecked,
      sizeMode: widget.checkbox.sizeMode,
      sizePt: widget.checkbox.sizePt,
    } : void 0,
    dropdown: widget.dropdown ? {
      defaultValue: widget.dropdown.defaultValue,
    } : void 0,
  };
}

/** 原 hb（jsx 22934）：表单域 widget 合并（空补丁 → 纯克隆） */
export function mergeFormFieldWidget(widget: FormFieldWidgetView | undefined, patch: Partial<FormFieldWidgetView>): FormFieldWidgetView | undefined {
  if (!(patch.name !== void 0 || patch.enabled !== void 0 || patch.calcOnExit !== void 0 || patch.text !== void 0 || patch.checkbox !== void 0 || patch.dropdown !== void 0)) return cloneFormFieldWidget(widget);
  const text = patch.text === void 0 ? cloneFormFieldWidget(widget)?.text : {
      ...(widget?.text ?? {}),
      ...patch.text,
    },
    checkbox = patch.checkbox === void 0 ? cloneFormFieldWidget(widget)?.checkbox : {
      ...(widget?.checkbox ?? {}),
      ...patch.checkbox,
    },
    dropdown = patch.dropdown === void 0 ? cloneFormFieldWidget(widget)?.dropdown : {
      ...(widget?.dropdown ?? {}),
      ...patch.dropdown,
    };
  return {
    ...(widget ?? {}),
    ...(patch.name === void 0 ? void 0 : {
      name: patch.name,
    }),
    ...(patch.enabled === void 0 ? void 0 : {
      enabled: patch.enabled,
    }),
    ...(patch.calcOnExit === void 0 ? void 0 : {
      calcOnExit: patch.calcOnExit,
    }),
    ...(text ? {
      text,
    } : void 0),
    ...(checkbox ? {
      checkbox,
    } : void 0),
    ...(dropdown ? {
      dropdown,
    } : void 0),
  };
}

/** 原 gb（jsx 22970）：表单域节点克隆 */
export function cloneFormField(field: DocxFormFieldNode): DocxFormFieldNode {
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
    widget: cloneFormFieldWidget(field.widget as FormFieldWidgetView | undefined),
    checkedSymbol: field.checkedSymbol,
    uncheckedSymbol: field.uncheckedSymbol,
    style: cloneRunStyle(field.style),
    link: field.link,
    sourceXml: field.sourceXml,
  } as DocxFormFieldNode;
}

/** 原 _b（jsx 22993）：JSON 相等 */
export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

/** 原 vb（jsx 22996）：子运行归一（相邻同样式文本合并；深克隆） */
export function normalizeParagraphChildren(children: DocxParagraphChild[]): DocxParagraphChild[] {
  const normalized: DocxParagraphChild[] = [];
  for (const child of children) {
    const last = normalized[normalized.length - 1];
    if (last && last.type === `text` && child.type === `text` && sameJson((last as DocxTextNode).style, (child as DocxTextNode).style) && (last as DocxTextNode).link === (child as DocxTextNode).link) {
      (last as DocxTextNode).text += (child as DocxTextNode).text;
      continue;
    }
    normalized.push(child.type === `text` ? {
      type: `text`,
      text: (child as DocxTextNode).text,
      style: cloneRunStyle((child as DocxTextNode).style),
      link: (child as DocxTextNode).link,
    } : child.type === `form-field` ? cloneFormField(child as DocxFormFieldNode) : {
      type: `image`,
      src: (child as DocxImageNode).src,
      alt: (child as DocxImageNode).alt,
      widthPx: (child as DocxImageNode).widthPx,
      heightPx: (child as DocxImageNode).heightPx,
      partName: (child as DocxImageNode).partName,
      contentType: (child as DocxImageNode).contentType,
      data: (child as DocxImageNode).data ? new Uint8Array((child as DocxImageNode).data as Uint8Array) : void 0,
      floating: (child as DocxImageNode).floating ? {
        ...(child as DocxImageNode).floating,
      } : void 0,
      syntheticTextBox: (child as DocxImageNode).syntheticTextBox,
      textBoxText: (child as DocxImageNode).textBoxText,
    } as DocxParagraphChild);
  }
  return normalized;
}

/** 原 yb（jsx 23027）：段落子全为文本 */
export function paragraphChildrenAllText(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.every((child) => child.type === `text`);
}

/** 原 bb（jsx 23030）：文本子节点克隆 */
export function cloneTextNode(child: DocxTextNode): DocxTextNode {
  return {
    type: `text`,
    text: child.text,
    style: cloneRunStyle(child.style),
    link: child.link,
    noteReference: child.noteReference ? {
      ...(child.noteReference as object),
    } : void 0,
  } as DocxTextNode;
}

/** 原 xb（jsx 23041）：文本子序列按偏移切分 */
export function splitChildrenAt(children: DocxParagraphChild[], offset: number): { left: DocxParagraphChild[]; right: DocxParagraphChild[] } {
  const splitAt = Math.max(0, Math.round(offset)),
    left: DocxParagraphChild[] = [],
    right: DocxParagraphChild[] = [];
  let cursor = 0;
  for (const child of children) {
    const textChild = child as DocxTextNode,
      length = textChild.text.length,
      start = cursor,
      end = start + length;
    if (cursor = end, end <= splitAt) {
      left.push(cloneTextNode(textChild));
      continue;
    }
    if (start >= splitAt) {
      right.push(cloneTextNode(textChild));
      continue;
    }
    const cut = Math.max(0, Math.min(length, splitAt - start)),
      head = textChild.text.slice(0, cut),
      tail = textChild.text.slice(cut);
    head.length > 0 && left.push({
      ...cloneTextNode(textChild),
      text: head,
    }), tail.length > 0 && right.push({
      ...cloneTextNode(textChild),
      text: tail,
    });
  }
  return {
    left,
    right,
  };
}

/** 原 Sb（jsx 23074）：偏移处 run 样式（边界取后邻可配） */
export function runStyleAt(paragraph: DocxParagraphNode, offset: number, forwardAtBoundary: boolean): DocxRunStyle | undefined {
  const textChildren = paragraph.children.filter((child) => child.type === `text`) as DocxTextNode[];
  if (textChildren.length === 0) return;
  const target = Math.max(0, offset);
  let cursor = 0;
  for (let index = 0; index < textChildren.length; index += 1) {
    const child = textChildren[index],
      length = child.text.length,
      end = cursor + length;
    if (cursor = end, target < end) return cloneRunStyle(child.style);
    if (target === end) return forwardAtBoundary || index === textChildren.length - 1 ? cloneRunStyle(child.style) : cloneRunStyle(textChildren[index + 1]?.style);
  }
  return cloneRunStyle(textChildren[textChildren.length - 1]?.style);
}

/** 原 Cb（jsx 23088）：偏移处链接 */
export function linkFrom(paragraph: DocxParagraphNode, offset: number, forwardAtBoundary: boolean): string | undefined {
  const textChildren = paragraph.children.filter((child) => child.type === `text`) as DocxTextNode[];
  if (textChildren.length === 0) return;
  const target = Math.max(0, offset);
  let cursor = 0;
  for (let index = 0; index < textChildren.length; index += 1) {
    const child = textChildren[index],
      length = child.text.length,
      end = cursor + length;
    if (cursor = end, target < end) return child.link;
    if (target === end) return forwardAtBoundary || index === textChildren.length - 1 ? child.link : textChildren[index + 1]?.link;
  }
  return textChildren[textChildren.length - 1]?.link;
}

/** 原 wb（jsx 23102）：范围内唯一链接（混杂 → undefined） */
export function linkWithin(paragraph: DocxParagraphNode, start: number, end: number): string | undefined {
  const from = Math.max(0, Math.min(start, end)),
    to = Math.max(from, Math.max(start, end));
  if (from === to) return linkFrom(paragraph, from, true);
  let cursor = 0,
    commonLink: string | undefined;
  for (const child of paragraph.children) {
    if (child.type !== `text`) continue;
    const textChild = child as DocxTextNode,
      childStart = cursor,
      childEnd = childStart + textChild.text.length;
    if (cursor = childEnd, !(childEnd <= from || childStart >= to)) {
      if (!commonLink) {
        commonLink = textChild.link;
        continue;
      }
      if (commonLink !== textChild.link) return;
    }
  }
  return commonLink;
}

/** 原 Tb（jsx 23122）：偏移所在链接段展开 */
export function expandLinkAt(paragraph: DocxParagraphNode, offset: number): { start: number; end: number; link: string } | undefined {
  const textChildren = paragraph.children.filter((child) => child.type === `text`) as DocxTextNode[];
  if (textChildren.length === 0) return;
  const target = Math.max(0, offset);
  let cursor = 0,
    anchorIndex = -1;
  for (let index = 0; index < textChildren.length; index += 1) {
    const child = textChildren[index],
      end = cursor + child.text.length;
    if (cursor = end, target < end || target === end || index === textChildren.length - 1) {
      anchorIndex = index;
      break;
    }
  }
  if (anchorIndex < 0) return;
  const link = textChildren[anchorIndex].link;
  if (!link) return;
  const starts: number[] = [];
  cursor = 0;
  for (const child of textChildren) starts.push(cursor), cursor += child.text.length;
  let firstIndex = anchorIndex;
  for (; firstIndex > 0 && textChildren[firstIndex - 1]?.link === link;) --firstIndex;
  let lastIndex = anchorIndex;
  for (; lastIndex + 1 < textChildren.length && textChildren[lastIndex + 1]?.link === link;) lastIndex += 1;
  const start = starts[firstIndex] ?? 0,
    end = (starts[lastIndex] ?? 0) + (textChildren[lastIndex]?.text.length ?? 0);
  if (!(end <= start)) return {
    start,
    end,
    link,
  };
}

/** 原 Eb（jsx 23154）：范围套用 run 样式（就地替换 children） */
export function applyRunStyleToRange(paragraph: DocxParagraphNode, start: number, end: number, styleForRange: (style: DocxRunStyle | undefined) => DocxRunStyle | undefined): boolean {
  const from = Math.max(0, Math.min(start, end)),
    to = Math.max(from, Math.max(start, end));
  if (from === to) return false;
  const rebuilt: DocxParagraphChild[] = [];
  let cursor = 0,
    changed = false;
  for (const child of paragraph.children) {
    if (child.type !== `text`) {
      child.type === `form-field` ? rebuilt.push(cloneFormField(child as DocxFormFieldNode)) : rebuilt.push({
        type: `image`,
        src: (child as DocxImageNode).src,
        alt: (child as DocxImageNode).alt,
        widthPx: (child as DocxImageNode).widthPx,
        heightPx: (child as DocxImageNode).heightPx,
        partName: (child as DocxImageNode).partName,
        contentType: (child as DocxImageNode).contentType,
        data: (child as DocxImageNode).data ? new Uint8Array((child as DocxImageNode).data as Uint8Array) : void 0,
        floating: (child as DocxImageNode).floating ? {
          ...(child as DocxImageNode).floating,
        } : void 0,
        syntheticTextBox: (child as DocxImageNode).syntheticTextBox,
        textBoxText: (child as DocxImageNode).textBoxText,
      } as DocxParagraphChild);
      continue;
    }
    const textChild = child as DocxTextNode,
      text = textChild.text,
      childStart = cursor,
      childEnd = childStart + text.length;
    if (cursor = childEnd, childEnd <= from || childStart >= to || text.length === 0) {
      rebuilt.push({
        type: `text`,
        text,
        style: cloneRunStyle(textChild.style),
        link: textChild.link,
      });
      continue;
    }
    changed = true;
    const cutStart = Math.max(0, from - childStart),
      cutEnd = Math.min(text.length, to - childStart);
    cutStart > 0 && rebuilt.push({
      type: `text`,
      text: text.slice(0, cutStart),
      style: cloneRunStyle(textChild.style),
      link: textChild.link,
    });
    const middle = text.slice(cutStart, cutEnd);
    middle.length > 0 && rebuilt.push({
      type: `text`,
      text: middle,
      style: styleForRange(cloneRunStyle(textChild.style)),
      link: textChild.link,
    }), cutEnd < text.length && rebuilt.push({
      type: `text`,
      text: text.slice(cutEnd),
      style: cloneRunStyle(textChild.style),
      link: textChild.link,
    });
  }
  return changed ? (paragraph.children = normalizeParagraphChildren(rebuilt), true) : false;
}

/** 原 Db（jsx 23216）：范围套用链接（就地替换 children） */
export function applyLinkToRange(paragraph: DocxParagraphNode, start: number, end: number, href: string | undefined): boolean {
  const from = Math.max(0, Math.min(start, end)),
    to = Math.max(from, Math.max(start, end));
  if (from === to) return false;
  const rebuilt: DocxParagraphChild[] = [];
  let cursor = 0,
    changed = false;
  for (const child of paragraph.children) {
    if (child.type !== `text`) {
      child.type === `form-field` ? rebuilt.push(cloneFormField(child as DocxFormFieldNode)) : rebuilt.push({
        type: `image`,
        src: (child as DocxImageNode).src,
        alt: (child as DocxImageNode).alt,
        widthPx: (child as DocxImageNode).widthPx,
        heightPx: (child as DocxImageNode).heightPx,
        partName: (child as DocxImageNode).partName,
        contentType: (child as DocxImageNode).contentType,
        data: (child as DocxImageNode).data ? new Uint8Array((child as DocxImageNode).data as Uint8Array) : void 0,
        floating: (child as DocxImageNode).floating ? {
          ...(child as DocxImageNode).floating,
        } : void 0,
        syntheticTextBox: (child as DocxImageNode).syntheticTextBox,
        textBoxText: (child as DocxImageNode).textBoxText,
      } as DocxParagraphChild);
      continue;
    }
    const textChild = child as DocxTextNode,
      text = textChild.text,
      childStart = cursor,
      childEnd = childStart + text.length;
    if (cursor = childEnd, childEnd <= from || childStart >= to || text.length === 0) {
      rebuilt.push({
        type: `text`,
        text,
        style: cloneRunStyle(textChild.style),
        link: textChild.link,
      });
      continue;
    }
    changed = true;
    const cutStart = Math.max(0, from - childStart),
      cutEnd = Math.min(text.length, to - childStart);
    cutStart > 0 && rebuilt.push({
      type: `text`,
      text: text.slice(0, cutStart),
      style: cloneRunStyle(textChild.style),
      link: textChild.link,
    });
    const middle = text.slice(cutStart, cutEnd);
    middle.length > 0 && rebuilt.push({
      type: `text`,
      text: middle,
      style: cloneRunStyle(textChild.style),
      link: href,
    }), cutEnd < text.length && rebuilt.push({
      type: `text`,
      text: text.slice(cutEnd),
      style: cloneRunStyle(textChild.style),
      link: textChild.link,
    });
  }
  return changed ? (paragraph.children = normalizeParagraphChildren(rebuilt), true) : false;
}

/** 原 Ob（jsx 23278）：字节 → base64（Buffer 优先；分块 fromCharCode 兜底） */
export function bytesToBase64Inline(bytes: Uint8Array): string {
  if (typeof Buffer < `u`) return Buffer.from(bytes).toString(`base64`);
  let binary = ``,
    chunkSize = 32768;
  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return typeof btoa == `function` ? btoa(binary) : ``;
}

/* --- §10 追加类型导入（与文件头导入同源模块，重复导入合法） --- */
import type { TableCellLocation } from "./LegacyDocEngineBModel";
import type { XmlRegion } from "./LegacyDocEngineC1";

/* ============================================================================
 * §10 位置键、修订/批注卡片抽取、槽位标注布局
 *     （原 kb..ax，jsx 23288-23756）
 * ==========================================================================*/

/** 原 kb（jsx 23288）：选区是否覆盖指定单元格 */
export function selectionCoversCell(selection: DocxSelection, tableIndex: number, rowIndex: number, cellIndex: number): boolean {
  return selection.kind === `table-cell` && selection.tableIndex === tableIndex && selection.rowIndex === rowIndex && selection.cellIndex === cellIndex;
}

/** 原 Ab（jsx 23291）：位置键（C3 契约名 locationKeyContract） */
export function locationKeyContract(location: DocxLocation): string {
  return location.kind === `paragraph` ? `p:${location.nodeIndex}` : `t:${location.tableIndex}:${location.rowIndex}:${location.cellIndex}:${location.paragraphIndex}`;
}

/** 原 jb（jsx 23294）：图片位置键（含 childIndex） */
export function imageLocationKeyContract(location: DocxLocation): string {
  return `${locationKeyContract(location)}:${location.childIndex}`;
}

/** 原 Mb（jsx 23295）：子级位置键（同 jb 形态） */
export function childLocationKey(location: DocxLocation): string {
  return `${locationKeyContract(location)}:${location.childIndex}`;
}

/** 原 Nb（jsx 23300）：从 DOM dataset 还原位置 */
export function locationFromDataset(dataset: DOMStringMap): DocxLocation | undefined {
  const targetKind = dataset.docxTargetKind;
  const childIndex = Number.parseInt(dataset.docxChildIndex ?? ``, 10);
  if (!(!Number.isFinite(childIndex) || childIndex < 0)) {
    if (targetKind === `paragraph`) {
      const nodeIndex = Number.parseInt(dataset.docxNodeIndex ?? ``, 10);
      return !Number.isFinite(nodeIndex) || nodeIndex < 0 ? void 0 : {
        kind: `paragraph`,
        nodeIndex: nodeIndex,
        childIndex: childIndex
      };
    }
    if (targetKind === `table-cell`) {
      const tableIndex = Number.parseInt(dataset.docxTableIndex ?? ``, 10);
      const rowIndex = Number.parseInt(dataset.docxRowIndex ?? ``, 10);
      const cellIndex = Number.parseInt(dataset.docxCellIndex ?? ``, 10);
      const paragraphIndex = Number.parseInt(dataset.docxParagraphIndex ?? ``, 10);
      return !Number.isFinite(tableIndex) || !Number.isFinite(rowIndex) || !Number.isFinite(cellIndex) || !Number.isFinite(paragraphIndex) || tableIndex < 0 || rowIndex < 0 || cellIndex < 0 || paragraphIndex < 0 ? void 0 : {
        kind: `table-cell`,
        tableIndex: tableIndex,
        rowIndex: rowIndex,
        cellIndex: cellIndex,
        paragraphIndex: paragraphIndex,
        childIndex: childIndex
      };
    }
  }
}

/** 原 Pb（jsx 23326）：表格首个非空单元格位置 */
export function firstTableCellLocation(table: DocxTableNode, tableIndex: number): TableCellLocation | undefined {
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (row) {
      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) if (row.cells[cellIndex]) return {
        kind: `table-cell`,
        tableIndex: tableIndex,
        rowIndex: rowIndex,
        cellIndex: cellIndex,
        paragraphIndex: 0
      };
    }
  }
}

/** 表格格式化修订条目（原 Fb 的条目面） */
export interface TableFormattingRevision {
  stableId: string;
  kind: string;
  author: string | undefined;
  date: string | undefined;
  text: string;
  location: TableCellLocation;
}

/** 原 Fb（jsx 23344）：表格/行/单元格格式化修订抽取（tblPrChange/trPrChange/tcPrChange） */
export function tableFormattingRevisions(table: DocxTableNode, tableIndex: number): TableFormattingRevision[] {
  const sourceXml = table.sourceXml ?? ``;
  if (!sourceXml) return [];
  const firstCellLocation = firstTableCellLocation(table, tableIndex);
  if (!firstCellLocation) return [];
  const revisions: TableFormattingRevision[] = [];
  const dedupeByKey = new Map<string, TableFormattingRevision>();
  const collectRevision = (scope: `table` | `row` | `cell`, region: XmlRegion) => {
    const kind = `paragraph-format-change`;
    const author = decodeXmlEntities(xmlAttrValue(region.openTag, `w:author`) ?? ``) || void 0;
    const date = xmlAttrValue(region.openTag, `w:date`)?.trim() || void 0;
    const revisionId = xmlAttrValue(region.openTag, `w:id`)?.trim() || void 0;
    const description = describeTableFormattingXml(scope, sourceXml.slice(region.start, region.end));
    const dedupeKey = revisionId ? `${scope}:${kind}:id:${revisionId}` : `${scope}:${kind}:${author ?? ``}:${date ?? ``}:${description}`;
    const existing = dedupeByKey.get(dedupeKey);
    if (existing) {
      !existing.text && description && (existing.text = description), !existing.author && author && (existing.author = author), !existing.date && date && (existing.date = date);
      return;
    }
    const revision: TableFormattingRevision = {
      stableId: revisionId ? `${scope}-${kind}-${revisionId}` : `${scope}-${kind}-${dedupeByKey.size}`,
      kind: kind,
      author: author,
      date: date,
      text: description,
      location: {
        kind: `table-cell`,
        tableIndex: tableIndex,
        rowIndex: firstCellLocation.rowIndex,
        cellIndex: firstCellLocation.cellIndex,
        paragraphIndex: firstCellLocation.paragraphIndex
      }
    };
    revisions.push(revision), dedupeByKey.set(dedupeKey, revision);
  };
  return matchXmlRegions(sourceXml, `w:tblPrChange`).forEach(region => collectRevision(`table`, region)), matchXmlRegions(sourceXml, `w:trPrChange`).forEach(region => collectRevision(`row`, region)), matchXmlRegions(sourceXml, `w:tcPrChange`).forEach(region => collectRevision(`cell`, region)), revisions;
}

/** 修订卡片（原 Ib 的条目面） */
export interface TrackedChangeCard {
  id: string;
  documentLoadNonce: string;
  blockId: string | undefined;
  sourceFingerprint: string;
  inlineAnchorId?: string;
  revisionId?: string;
  kind: string;
  author?: string;
  date?: string;
  text?: string;
  nodeIndex: number;
  location: DocxLocation;
}

/** 原 Ib（jsx 23377）：全文档修订卡片抽取 */
export function extractTrackedChanges(model: DocxEditorModel, documentLoadNonce: string): TrackedChangeCard[] {
  const cards: TrackedChangeCard[] = [];
  const collectParagraphChanges = (paragraph: DocxParagraphNode, nodeIndex: number, location: DocxLocation) => {
    const parsed = parseParagraphRevisions(paragraph);
    parsed && parsed.changes.forEach((change, changeOrdinal) => {
      cards.push({
        id: `${locationKeyContract(location)}:${change.id}:${changeOrdinal}`,
        documentLoadNonce: documentLoadNonce,
        blockId: paragraph.blockId,
        sourceFingerprint: cachedStructuralHash(paragraph),
        inlineAnchorId: change.id,
        revisionId: change.revisionId,
        kind: change.kind,
        author: change.author,
        date: change.date,
        text: change.text,
        nodeIndex: nodeIndex,
        location: location.kind === `paragraph` ? {
          kind: `paragraph`,
          nodeIndex: location.nodeIndex
        } : {
          kind: `table-cell`,
          tableIndex: location.tableIndex,
          rowIndex: location.rowIndex,
          cellIndex: location.cellIndex,
          paragraphIndex: location.paragraphIndex
        }
      });
    });
  };
  return model.nodes.forEach((node, nodeIndex) => {
    if (node.type === `paragraph`) {
      collectParagraphChanges(node as DocxParagraphNode, nodeIndex, {
        kind: `paragraph`,
        nodeIndex: nodeIndex
      });
      return;
    }
    const table = node as DocxTableNode;
    table.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        const directParagraphs = paragraphsOf(cell.nodes);
        directParagraphs.forEach((paragraph, paragraphIndex) => {
          collectParagraphChanges(paragraph, nodeIndex, {
            kind: `table-cell`,
            tableIndex: nodeIndex,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            paragraphIndex: paragraphIndex
          });
        }), collectParagraphsRecursive(cell.nodes).filter(paragraph => !directParagraphs.includes(paragraph)).forEach((paragraph, deepOrdinal) => {
          collectParagraphChanges(paragraph, nodeIndex, {
            kind: `table-cell`,
            tableIndex: nodeIndex,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            paragraphIndex: -(deepOrdinal + 1)
          });
        });
      });
    }), tableFormattingRevisions(table, nodeIndex).forEach((revision, revisionOrdinal) => {
      cards.push({
        id: `${locationKeyContract(revision.location)}:${revision.stableId}:${revisionOrdinal}`,
        documentLoadNonce: documentLoadNonce,
        blockId: table.blockId,
        sourceFingerprint: cachedStructuralHash(table),
        kind: revision.kind,
        author: revision.author,
        date: revision.date,
        text: revision.text,
        nodeIndex: nodeIndex,
        location: revision.location
      });
    });
  }), cards;
}

/** 原 Lb（jsx 23454）：w:t 文本预览（≤120 字符） */
export function xmlTextPreview(xml: string): string | undefined {
  const parts: string[] = [];
  for (const match of xml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)) parts.push(decodeXmlEntities(match[1] ?? ``) ?? ``);
  const joined = parts.join(``).replace(/\s+/g, ` `).trim();
  if (joined) return joined.length > 120 ? `${joined.slice(0, 119)}\u2026` : joined;
}

/** 原 Rb（jsx 23460）：批注锚定区段文本 */
export function commentAnchorText(xml: string, commentId: number): string | undefined {
  const startMatch = xml.match(RegExp(`<w:commentRangeStart\\b[^>]*w:id="${commentId}"[^>]*/?>`, `i`));
  const endMatch = xml.match(RegExp(`<w:commentRangeEnd\\b[^>]*w:id="${commentId}"[^>]*/?>`, `i`));
  const startOffset = startMatch?.index === void 0 ? endMatch?.index === void 0 ? void 0 : 0 : startMatch.index + startMatch[0].length;
  if (startOffset === void 0) return;
  const endOffset = endMatch?.index === void 0 ? xml.length : endMatch.index;
  if (!(endOffset <= startOffset)) return xmlTextPreview(xml.slice(startOffset, endOffset));
}

/** 批注卡片（原 zb 的条目面） */
export interface CommentCard {
  id: string;
  documentLoadNonce: string;
  blockId: string | undefined;
  sourceFingerprint: string;
  commentId: number;
  author?: string;
  initials?: string;
  date?: string;
  text?: string;
  parentId?: number;
  resolved?: boolean;
  anchorText?: string;
  nodeIndex: number;
  location: DocxLocation;
}

type CommentMetadataEntry = NonNullable<DocxEditorModel[`metadata`][`comments`]>[number];

/** 原 zb（jsx 23466）：全文档批注卡片抽取 */
export function extractComments(model: DocxEditorModel, documentLoadNonce: string): CommentCard[] {
  const comments = model.metadata.comments ?? [];
  if (comments.length === 0) return [];
  const commentById = new Map<number, CommentMetadataEntry>(comments.map(entry => [entry.id, entry]));
  const cards: CommentCard[] = [];
  const collectParagraphComments = (paragraph: DocxParagraphNode, nodeIndex: number, location: DocxLocation) => {
    const sourceXml = paragraph.sourceXml ?? ``;
    if (!(!sourceXml || !/commentReference/i.test(sourceXml))) for (const match of sourceXml.matchAll(/<w:commentReference\b[^>]*w:id="(-?\d+)"/gi)) {
      const commentId = Number.parseInt(match[1] ?? ``, 10);
      const comment = Number.isFinite(commentId) ? commentById.get(commentId) : void 0;
      comment && cards.push({
        id: `${locationKeyContract(location)}:comment:${commentId}`,
        documentLoadNonce: documentLoadNonce,
        blockId: paragraph.blockId,
        sourceFingerprint: `${cachedStructuralHash(paragraph)}:${cachedStructuralHash(comment)}`,
        commentId: commentId,
        author: comment.author,
        initials: comment.initials,
        date: comment.date,
        text: comment.text,
        parentId: comment.parentId,
        resolved: comment.resolved,
        anchorText: commentAnchorText(sourceXml, commentId),
        nodeIndex: nodeIndex,
        location: location.kind === `paragraph` ? {
          kind: `paragraph`,
          nodeIndex: location.nodeIndex
        } : {
          kind: `table-cell`,
          tableIndex: location.tableIndex,
          rowIndex: location.rowIndex,
          cellIndex: location.cellIndex,
          paragraphIndex: location.paragraphIndex
        }
      });
    }
  };
  return model.nodes.forEach((node, nodeIndex) => {
    if (node.type === `paragraph`) {
      collectParagraphComments(node as DocxParagraphNode, nodeIndex, {
        kind: `paragraph`,
        nodeIndex: nodeIndex
      });
      return;
    }
    const table = node as DocxTableNode;
    table.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        const directParagraphs = paragraphsOf(cell.nodes);
        directParagraphs.forEach((paragraph, paragraphIndex) => {
          collectParagraphComments(paragraph, nodeIndex, {
            kind: `table-cell`,
            tableIndex: nodeIndex,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            paragraphIndex: paragraphIndex
          });
        }), collectParagraphsRecursive(cell.nodes).filter(paragraph => !directParagraphs.includes(paragraph)).forEach((paragraph, deepOrdinal) => {
          collectParagraphComments(paragraph, nodeIndex, {
            kind: `table-cell`,
            tableIndex: nodeIndex,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            paragraphIndex: -(deepOrdinal + 1)
          });
        });
      });
    });
  }), cards;
}

/** 原 Bb（jsx 23535）：六位十六进制色附加透明度 */
export function colorWithAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, ``);
  return /^[\da-f]{6}$/i.test(hex) ? `rgba(${Number.parseInt(hex.slice(0, 2), 16)}, ${Number.parseInt(hex.slice(2, 4), 16)}, ${Number.parseInt(hex.slice(4, 6), 16)}, ${alpha})` : color;
}

/** 原 Vb（jsx 23540）：标注配色（按主题与序号轮换） */
export function annotationColorFor(theme: string, seed: number | undefined): string {
  const lightPalette = [`#5b9bd5`, `#d65f5f`, `#8f6ac8`, `#70ad47`, `#d9872b`];
  const darkPalette = [`#7dd3fc`, `#fca5a5`, `#c4b5fd`, `#86efac`, `#fdba74`];
  if (Number.isFinite(seed)) {
    const palette = theme === `dark` ? darkPalette : lightPalette;
    return palette[Math.abs(Math.round(seed as number)) % palette.length];
  }
  return theme === `dark` ? darkPalette[0] : lightPalette[0];
}

/** 原 Hb（jsx 23550）：批注高亮样式 */
export function commentHighlightStyle(theme: string, seed: number | undefined): React.CSSProperties {
  const baseColor = annotationColorFor(theme, seed);
  return {
    backgroundColor: colorWithAlpha(baseColor, theme === `dark` ? 0.3 : 0.22),
    boxShadow: `inset 0 -1px 0 ${colorWithAlpha(baseColor, theme === `dark` ? 0.7 : 0.48)}`
  };
}

/** 原 Ub（jsx 23556）：批注卡片高度估算 */
export function commentCardHeight(comment: { text?: string }): number {
  const text = comment.text || `Comment`;
  const lineCount = Math.min(2, Math.max(1, Math.ceil(text.length / 42)));
  return Math.max(TABLE_ANNOTATION_LANE_PX, 24 + lineCount * 11);
}

/** 原 Wb（jsx 23562）：修订类型标签 */
export function trackedChangeKindLabel(kind: string): string {
  switch (kind) {
    case `insertion`:
      return `Inserted`;
    case `deletion`:
      return `Deleted`;
    case `move-from`:
      return `Moved from`;
    case `move-to`:
      return `Moved to`;
    case `format-change`:
      return `Formatted`;
    case `paragraph-format-change`:
      return `Paragraph formatting`;
    default:
      return kind;
  }
}

/** 原 Gb（jsx 23580）：修订类型配色 */
export function trackedChangeColor(kind: string, theme: string): string {
  const palette = theme === `dark` ? {
    insertion: `#f87171`,
    deletion: `#f87171`,
    moveFrom: `#86efac`,
    moveTo: `#86efac`,
    format: `#c084fc`
  } : {
    insertion: `#dc2626`,
    deletion: `#dc2626`,
    moveFrom: `#70ad47`,
    moveTo: `#70ad47`,
    format: `#7c3aed`
  };
  switch (kind) {
    case `insertion`:
      return palette.insertion;
    case `deletion`:
      return palette.deletion;
    case `move-from`:
      return palette.moveFrom;
    case `move-to`:
      return palette.moveTo;
    case `format-change`:
    case `paragraph-format-change`:
      return palette.format;
    default:
      return palette.format;
  }
}

/** 原 Kb（jsx 23610）：修订是否可作槽位标注（插入/移入不占位） */
export function trackedChangeIsAnnotatable(change: { kind: string }): boolean {
  return change.kind !== `insertion` && change.kind !== `move-to`;
}

/** 原 qb（jsx 23612）：位置排序向量 */
export function locationSortVector(location: DocxLocation): number[] {
  return location.kind === `paragraph` ? [location.nodeIndex, 0, 0, 0] : [location.tableIndex, location.rowIndex, location.cellIndex, location.paragraphIndex];
}

/** 原 Jb（jsx 23614）：位置是否落在给定页段集合 */
export function locationInPages(location: DocxLocation, segments: PageSegment[]): boolean {
  return location.kind === `paragraph` ? segments.some(segment => segment.nodeIndex === location.nodeIndex) : segments.some(segment => segment.nodeIndex === location.tableIndex ? segment.tableRowRange ? location.rowIndex >= segment.tableRowRange.startRowIndex && location.rowIndex < segment.tableRowRange.endRowIndex : !0 : !1);
}

/** 原 Yb（jsx 23617）：位置所在页码（未命中 -1） */
export function pageIndexForLocation(location: DocxLocation, pages: PageSegment[][]): number {
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) if (locationInPages(location, pages[pageIndex] ?? [])) return pageIndex;
  return -1;
}

/** 原 Xb（jsx 23620）：位置对应的 DOM 元素 */
export function locationElement(root: ParentNode, location: DocxLocation): Element | undefined {
  return location.kind === `paragraph` ? root.querySelector(`[data-docx-paragraph-kind="paragraph"][data-docx-paragraph-node-index="${location.nodeIndex}"]`) ?? void 0 : root.querySelector(`[data-docx-paragraph-kind="table-cell"][data-docx-table-index="${location.tableIndex}"][data-docx-row-index="${location.rowIndex}"][data-docx-cell-index="${location.cellIndex}"][data-docx-paragraph-index="${location.paragraphIndex}"]`) || (root.querySelector(`[data-docx-table-cell="true"][data-docx-table-index="${location.tableIndex}"][data-docx-row-index="${location.rowIndex}"][data-docx-cell-index="${location.cellIndex}"]`) ?? void 0);
}

/** 原 Zb（jsx 23625）：标注锚点矩形（元素相对页参照系的未缩放坐标） */
export function annotationAnchorRect(element: HTMLElement, pageElement: HTMLElement): { left: number; width: number; right: number; top: number; height: number } | undefined {
  const frameRect = pageElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  if (frameRect.height <= 0 || frameRect.width <= 0) return;
  const scaleY = frameRect.height / Math.max(1, pageElement.offsetHeight);
  if (!Number.isFinite(scaleY) || scaleY <= 0) return;
  const scaleX = frameRect.width / Math.max(1, pageElement.offsetWidth);
  if (!Number.isFinite(scaleX) || scaleX <= 0) return;
  const left = (elementRect.left - frameRect.left) / scaleX;
  const width = elementRect.width / scaleX;
  return {
    left: left,
    width: width,
    right: left + width,
    top: (elementRect.top - frameRect.top) / scaleY,
    height: elementRect.height / scaleY
  };
}

/** 原 Qb（jsx 23644）：按属性值分词查找元素 */
export function elementWithClassToken(root: Element, attribute: string, token: string): Element | undefined {
  const candidates: Element[] = [];
  root.hasAttribute(attribute) && candidates.push(root), candidates.push(...root.querySelectorAll(`[${attribute}]`));
  for (const candidate of candidates) {
    const value = candidate.getAttribute(attribute);
    if (value && value.split(/\s+/).includes(token)) return candidate;
  }
}

/** 标注卡片（槽位布局与锚点解析的条目面） */
export interface AnnotationCard {
  id: string;
  documentLoadNonce?: string;
  blockId?: string;
  sourceFingerprint?: string;
  nodeIndex?: number;
  location: DocxLocation;
  trackedChange?: TrackedChangeCard;
  comment?: CommentCard;
  [key: string]: unknown;
}

/** 原 $b（jsx 23653）：标注位置元素 */
export function annotationLocationElement(root: ParentNode, annotation: AnnotationCard): Element | undefined {
  return locationElement(root, annotation.location);
}

/** 原 ex（jsx 23655）：按 data 属性查找（先位置域后全局） */
export function elementByDataAttr(root: Element, annotation: AnnotationCard, attribute: string, value: string): Element | undefined {
  const scopeElement = annotationLocationElement(root, annotation);
  if (scopeElement) {
    const scoped = elementWithClassToken(scopeElement, attribute, value);
    if (scoped) return scoped;
  }
  return elementWithClassToken(root, attribute, value);
}

/** 原 tx（jsx 23661）：标注锚点元素（修订→批注→位置兜底） */
export function annotationAnchorElement(root: Element, annotation: AnnotationCard): Element | undefined {
  if (annotation.trackedChange) {
    const byChangeId = elementByDataAttr(root, annotation, `data-docx-tracked-change-id`, annotation.trackedChange.id);
    if (byChangeId) return byChangeId;
    const inlineAnchorId = annotation.trackedChange.inlineAnchorId;
    if (inlineAnchorId && inlineAnchorId !== annotation.trackedChange.id) {
      const byAnchorId = elementByDataAttr(root, annotation, `data-docx-tracked-change-id`, inlineAnchorId);
      if (byAnchorId) return byAnchorId;
    }
  }
  if (annotation.comment) {
    const byCommentId = elementByDataAttr(root, annotation, `data-docx-comment-ids`, String(annotation.comment.commentId));
    if (byCommentId) return byCommentId;
  }
  return locationElement(root, annotation.location);
}

/** 原 nx（jsx 23678）：修订卡片高度估算 */
export function trackedChangeCardHeight(change: { kind: string; text?: string }): number {
  const text = normalizeWhitespace(change.text) ?? trackedChangeKindLabel(change.kind);
  const lineCount = Math.min(2, Math.max(1, Math.ceil(text.length / 42)));
  return Math.max(TABLE_ANNOTATION_LANE_PX, 22 + lineCount * 11);
}

/** 槽位标注视图（原 ix 的条目面） */
export interface GutterAnnotationView {
  annotation: AnnotationCard;
  anchorX: number;
  anchorY: number;
  top: number;
  heightPx: number;
  connectorLane: number;
}

/** 原 rx（jsx 23684）：连接线泳道分配（原式常量名复用：Iu=泳道数 5） */
export function assignConnectorLanes(views: GutterAnnotationView[]): void {
  if (views.length <= 1) {
    views.forEach(view => {
      view.connectorLane = 0;
    });
    return;
  }
  const laneEnds = Array.from({
    length: TABLE_ANNOTATION_ICON_PX
  }, () => -1 / 0);
  views.map((view, ordinal) => {
    const midY = view.top + view.heightPx / 2;
    return {
      entry: view,
      index: ordinal,
      startY: Math.min(view.anchorY, midY) - 3,
      endY: Math.max(view.anchorY, midY) + 3
    };
  }).sort((former, latter) => {
    const startDelta = former.startY - latter.startY;
    if (startDelta !== 0) return startDelta;
    const endDelta = former.endY - latter.endY;
    return endDelta === 0 ? former.index - latter.index : endDelta;
  }).forEach(span => {
    let laneIndex = laneEnds.findIndex(laneEnd => span.startY > laneEnd + 3);
    laneIndex < 0 && (laneIndex = laneEnds.reduce((bestIndex, laneEnd, index) => laneEnd < laneEnds[bestIndex] ? index : bestIndex, 0)), span.entry.connectorLane = laneIndex, laneEnds[laneIndex] = Math.max(laneEnds[laneIndex], span.endY);
  });
}

/** 原 ix（jsx 23711）：槽位标注布局（C3 契约名 layoutGutterAnnotationsContract） */
export function layoutGutterAnnotations(
  annotations: AnnotationCard[],
  positionCache: Map<string, { x?: number; y?: number }>,
  measuredHeights: Map<string, number> | undefined,
  gutterWidthPx: number,
  viewportHeightPx: number
): GutterAnnotationView[] {
  if (annotations.length === 0) return [];
  const evenStep = Math.max(18, viewportHeightPx / Math.max(1, annotations.length + 1));
  const views = annotations.map((annotation, ordinal) => {
    const fallbackY = Math.min(Math.max(10, Math.round((ordinal + 1) * evenStep)), Math.max(10, viewportHeightPx - 10));
    const cachedPosition = positionCache.get(annotation.id);
    const anchorYRaw = cachedPosition?.y ?? fallbackY;
    const anchorXRaw = cachedPosition?.x ?? Math.max(10, gutterWidthPx - 10);
    const measuredHeight = measuredHeights?.get(annotation.id);
    const estimatedHeight = annotation.trackedChange ? trackedChangeCardHeight(annotation.trackedChange) : annotation.comment ? commentCardHeight(annotation.comment) : TABLE_ANNOTATION_LANE_PX;
    const heightPx = Number.isFinite(measuredHeight) && (measuredHeight as number) > 0 ? Math.max(TABLE_ANNOTATION_LANE_PX, Math.round(measuredHeight as number)) : estimatedHeight;
    return {
      annotation: annotation,
      anchorX: clampNumber(Math.round(anchorXRaw), 10, Math.max(10, gutterWidthPx - 10)),
      anchorY: clampNumber(Math.round(anchorYRaw), 10, Math.max(10, viewportHeightPx - 10)),
      top: 0,
      heightPx: heightPx,
      connectorLane: 0
    };
  });
  views.sort((former, latter) => {
    const yDelta = former.anchorY - latter.anchorY;
    if (Math.abs(yDelta) > 2) return yDelta;
    const xDelta = former.anchorX - latter.anchorX;
    return xDelta === 0 ? former.annotation.id.localeCompare(latter.annotation.id) : xDelta;
  });
  let stackBottom = 8;
  views.forEach(view => {
    const desiredTop = view.anchorY - 8;
    view.top = Math.max(desiredTop, stackBottom), stackBottom = view.top + view.heightPx + TABLE_ANNOTATION_GAP_B_PX;
  });
  const viewportFloor = Math.max(0, viewportHeightPx - 8);
  const overflowPx = stackBottom - TABLE_ANNOTATION_GAP_B_PX - viewportFloor;
  if (overflowPx > 0) {
    let compactTop = 8;
    views.forEach(view => {
      const shiftedTop = view.top - overflowPx;
      view.top = Math.max(shiftedTop, compactTop), compactTop = view.top + view.heightPx + TABLE_ANNOTATION_GAP_B_PX;
    });
  }
  return assignConnectorLanes(views), views;
}

/** 原 ax（jsx 23754）：位置等价（C3 契约名 sameLocationContract） */
export function sameLocation(former: DocxLocation, latter: DocxLocation): boolean {
  return former.kind === `paragraph` ? latter.kind === `paragraph` && former.nodeIndex === latter.nodeIndex : latter.kind === `paragraph` ? !1 : former.tableIndex === latter.tableIndex && former.rowIndex === latter.rowIndex && former.cellIndex === latter.cellIndex && former.paragraphIndex === latter.paragraphIndex;
}

/** C3 契约别名（ax 23754） */
export const sameLocationContract = sameLocation;
/** C3 契约别名（ix 23711） */
export const layoutGutterAnnotationsContract = layoutGutterAnnotations;

/* ============================================================================
 * §11 可编辑位置导航、范围枚举、选区/文本域克隆比较
 *     （原 ox..Wx，jsx 23757-24206）
 * ==========================================================================*/

/** 原 ox（jsx 23757）：表格首个可编辑单元格位置（跳过纵并续行） */
export function firstEditableCellLocation(model: DocxEditorModel, tableIndex: number): TableCellLocation | undefined {
  const node = model.nodes[tableIndex];
  if (!(!node || node.type !== `table`)) for (let rowIndex = 0; rowIndex < (node as DocxTableNode).rows.length; rowIndex += 1) {
    const row = (node as DocxTableNode).rows[rowIndex];
    if (row) for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
      const cell = row.cells[cellIndex];
      if (!(!cell || cell.style?.vMergeContinuation) && paragraphsOf(cell.nodes).length !== 0) return {
        kind: `table-cell`,
        tableIndex: tableIndex,
        rowIndex: rowIndex,
        cellIndex: cellIndex,
        paragraphIndex: 0
      };
    }
  }
}

/** 原 sx（jsx 23771）：表格末个可编辑单元格位置 */
export function lastEditableCellLocation(model: DocxEditorModel, tableIndex: number): TableCellLocation | undefined {
  const node = model.nodes[tableIndex];
  if (!(!node || node.type !== `table`)) for (let rowIndex = (node as DocxTableNode).rows.length - 1; rowIndex >= 0; --rowIndex) {
    const row = (node as DocxTableNode).rows[rowIndex];
    if (row) for (let cellIndex = row.cells.length - 1; cellIndex >= 0; --cellIndex) {
      const cell = row.cells[cellIndex];
      if (!cell || cell.style?.vMergeContinuation) continue;
      const cellParagraphs = paragraphsOf(cell.nodes);
      if (cellParagraphs.length !== 0) return {
        kind: `table-cell`,
        tableIndex: tableIndex,
        rowIndex: rowIndex,
        cellIndex: cellIndex,
        paragraphIndex: cellParagraphs.length - 1
      };
    }
  }
}

/** 原 cx（jsx 23790）：位置的宿主节点下标 */
export function locationNodeIndex(location: DocxLocation): number {
  return location.kind === `paragraph` ? location.nodeIndex : location.tableIndex;
}

/** 原 lx（jsx 23792）：表格删除后的位置平移（命中被删表返回 undefined） */
export function shiftLocationAfterTableRemoval(location: DocxLocation, removedTableIndexes: number[]): DocxLocation | undefined {
  if (removedTableIndexes.length === 0) return cloneLocation(location);
  const sortedIndexes = [...removedTableIndexes].filter(index => Number.isFinite(index) && index >= 0).map(index => Math.round(index)).sort((former, latter) => former - latter);
  let adjustedIndex = location.kind === `paragraph` ? location.nodeIndex : location.tableIndex;
  for (const removedIndex of sortedIndexes) {
    if (removedIndex === adjustedIndex) return;
    removedIndex < adjustedIndex && --adjustedIndex;
  }
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: Math.max(0, adjustedIndex)
  } : {
    kind: `table-cell`,
    tableIndex: Math.max(0, adjustedIndex),
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: location.paragraphIndex
  };
}

/** 原 ux（jsx 23813）：表格全文本域（首段起 → 末段止） */
export function tableFullTextRange(model: DocxEditorModel, tableIndex: number): DocxTextRange | undefined {
  const firstLocation = firstEditableCellLocation(model, tableIndex);
  const lastLocationOfTable = lastEditableCellLocation(model, tableIndex);
  if (!firstLocation || !lastLocationOfTable) return;
  const firstParagraph = resolveLocation(model, firstLocation).paragraph;
  const lastParagraph = resolveLocation(model, lastLocationOfTable).paragraph;
  if (!(!firstParagraph || !lastParagraph)) return {
    start: {
      location: cloneLocation(firstLocation),
      offset: 0
    },
    end: {
      location: cloneLocation(lastLocationOfTable),
      offset: paragraphText(lastParagraph).length
    }
  };
}

/** 原 dx（jsx 23830）：被文本域完整覆盖（可整表清空）的表节点下标 */
export function emptiedTableIndexes(model: DocxEditorModel, range: DocxTextRange): number[] {
  const startNodeIndex = locationNodeIndex(range.start.location);
  const endNodeIndex = locationNodeIndex(range.end.location);
  const lowerBound = Math.min(startNodeIndex, endNodeIndex);
  const upperBound = Math.max(startNodeIndex, endNodeIndex);
  const coveredIndexes: number[] = [];
  for (let nodeIndex = lowerBound; nodeIndex <= upperBound; nodeIndex += 1) {
    const node = model.nodes[nodeIndex];
    if (!node || node.type !== `table`) continue;
    const fullRange = tableFullTextRange(model, nodeIndex);
    if (!fullRange) continue;
    const coversStart = compareTextPositions(range.start, fullRange.start) <= 0;
    const coversEnd = compareTextPositions(range.end, fullRange.end) >= 0;
    !coversStart || !coversEnd || coveredIndexes.push(nodeIndex);
  }
  return coveredIndexes;
}

/** 原 fx（jsx 23847）：节点首个可编辑位置 */
export function firstLocationOfNode(model: DocxEditorModel, nodeIndex: number): DocxLocation | undefined {
  const node = model.nodes[nodeIndex];
  if (node) return node.type === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: nodeIndex
  } : firstEditableCellLocation(model, nodeIndex);
}

/** 原 px（jsx 23855）：节点末个可编辑位置（C3 契约名 previousEditableParagraphLocation） */
export function previousEditableParagraphLocation(model: DocxEditorModel, nodeIndex: number): DocxLocation | undefined {
  const node = model.nodes[nodeIndex];
  if (node) return node.type === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: nodeIndex
  } : lastEditableCellLocation(model, nodeIndex);
}

/** 原 mx（jsx 23862）：下一个可编辑位置（跨单元格/行/节点） */
export function nextEditableParagraphLocation(model: DocxEditorModel, location: DocxLocation): DocxLocation | undefined {
  if (location.kind === `paragraph`) {
    for (let nodeIndex = location.nodeIndex + 1; nodeIndex < model.nodes.length; nodeIndex += 1) {
      const candidate = firstLocationOfNode(model, nodeIndex);
      if (candidate) return candidate;
    }
    return;
  }
  const tableNode = model.nodes[location.tableIndex];
  if (!tableNode || tableNode.type !== `table`) return;
  const table = tableNode as DocxTableNode;
  const currentCell = table.rows[location.rowIndex]?.cells[location.cellIndex];
  if (!currentCell) return;
  const cellParagraphs = paragraphsOf(currentCell.nodes);
  if (location.paragraphIndex < cellParagraphs.length - 1) return {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: location.paragraphIndex + 1
  };
  for (let rowIndex = location.rowIndex; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (row) for (let cellIndex = rowIndex === location.rowIndex ? location.cellIndex + 1 : 0; cellIndex < row.cells.length; cellIndex += 1) {
      const cell = row.cells[cellIndex];
      if (!(!cell || cell.style?.vMergeContinuation) && paragraphsOf(cell.nodes).length !== 0) return {
        kind: `table-cell`,
        tableIndex: location.tableIndex,
        rowIndex: rowIndex,
        cellIndex: cellIndex,
        paragraphIndex: 0
      };
    }
  }
  for (let nodeIndex = location.tableIndex + 1; nodeIndex < model.nodes.length; nodeIndex += 1) {
    const candidate = firstLocationOfNode(model, nodeIndex);
    if (candidate) return candidate;
  }
}

/** 原 hx（jsx 23899）：全文档首个可编辑位置 */
export function firstEditableLocation(model: DocxEditorModel): DocxLocation | undefined {
  for (let nodeIndex = 0; nodeIndex < model.nodes.length; nodeIndex += 1) {
    const candidate = firstLocationOfNode(model, nodeIndex);
    if (candidate) return candidate;
  }
}

/** 原 gx（jsx 23904）：全文档末个可编辑位置 */
export function lastLocation(model: DocxEditorModel): DocxLocation | undefined {
  for (let nodeIndex = model.nodes.length - 1; nodeIndex >= 0; --nodeIndex) {
    const node = model.nodes[nodeIndex];
    if (node) {
      if (node.type === `paragraph`) return {
        kind: `paragraph`,
        nodeIndex: nodeIndex
      };
      const table = node as DocxTableNode;
      for (let rowIndex = table.rows.length - 1; rowIndex >= 0; --rowIndex) {
        const row = table.rows[rowIndex];
        if (row) for (let cellIndex = row.cells.length - 1; cellIndex >= 0; --cellIndex) {
          const cell = row.cells[cellIndex];
          if (!cell || cell.style?.vMergeContinuation) continue;
          const cellParagraphs = paragraphsOf(cell.nodes);
          if (cellParagraphs.length !== 0) return {
            kind: `table-cell`,
            tableIndex: nodeIndex,
            rowIndex: rowIndex,
            cellIndex: cellIndex,
            paragraphIndex: cellParagraphs.length - 1
          };
        }
      }
    }
  }
}

/** 原 _x（jsx 23933）：范围位置枚举（C3 契约名 enumerateRangeLocationsContract） */
export function enumerateRangeLocations(model: DocxEditorModel, startLocation: DocxLocation, endLocation: DocxLocation): { location: DocxLocation }[] {
  const locations: { location: DocxLocation }[] = [];
  const ordered = compareLocations(startLocation, endLocation) <= 0 ? [startLocation, endLocation] : [endLocation, startLocation];
  let currentLocation: DocxLocation | undefined = ordered[0];
  const boundaryEnd = ordered[1];
  for (; currentLocation && (locations.push({
    location: currentLocation
  }), !(compareLocations(currentLocation, boundaryEnd) >= 0));) currentLocation = nextEditableParagraphLocation(model, currentLocation);
  return locations;
}

/** 原 vx（jsx 23940）：段落插入偏移夹取（C3 契约名 paragraphInsertOffset） */
export function caretOffsetIn(paragraph: DocxParagraphNode, offset: number): number {
  const textLength = paragraphText(paragraph).length;
  return Math.max(0, Math.min(Math.max(0, textLength), Math.round(offset)));
}

/** 原 yx（jsx 23944）：文档是否单一段落全域选中 */
export function documentIsSingleParagraph(model: DocxEditorModel, range: DocxTextRange): boolean {
  const normalized = normalizeTextRange(range);
  const first = firstEditableLocation(model);
  const last = lastLocation(model);
  if (!first || !last || !sameLocation(normalized.start.location, first) || !sameLocation(normalized.end.location, last)) return !1;
  const firstParagraph = resolveLocation(model, first).paragraph;
  const lastParagraph = resolveLocation(model, last).paragraph;
  if (!firstParagraph || !lastParagraph) return !1;
  const startOffset = caretOffsetIn(firstParagraph, normalized.start.offset);
  const endOffset = caretOffsetIn(lastParagraph, normalized.end.offset);
  return startOffset <= 0 && endOffset >= paragraphText(lastParagraph).length;
}

/** 原 bx（jsx 23955）：范围在指定段落内的偏移对（越界侧取段首/段尾） */
export function rangeOffsetsInParagraph(location: DocxLocation, startPosition: DocxTextPosition, endPosition: DocxTextPosition, paragraph: DocxParagraphNode): [number, number] {
  const ordered = compareTextPositions(startPosition, endPosition) <= 0 ? [startPosition, endPosition] : [endPosition, startPosition];
  const orderedStart = ordered[0];
  const orderedEnd = ordered[1];
  const startInParagraph = sameLocation(location, orderedStart.location);
  const endInParagraph = sameLocation(location, orderedEnd.location);
  return [startInParagraph ? caretOffsetIn(paragraph, orderedStart.offset) : 0, endInParagraph ? caretOffsetIn(paragraph, orderedEnd.offset) : paragraphText(paragraph).length];
}

/** 原 xx（jsx 23965）：位置克隆（C3 契约名 cloneLocationContract） */
export function cloneLocation(location: DocxLocation): DocxLocation {
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: location.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: location.paragraphIndex
  };
}

/** 原 Sx（jsx 23976）：文本域克隆（C3 契约名 collapsedRangeToRestore） */
export function cloneTextRange(range: DocxTextRange | undefined): DocxTextRange | undefined {
  if (range) return {
    start: {
      location: cloneLocation(range.start.location),
      offset: range.start.offset
    },
    end: {
      location: cloneLocation(range.end.location),
      offset: range.end.offset
    }
  };
}

/** 原 Cx（jsx 23988）：选区克隆（收敛至段落/单元格粒度） */
export function cloneSelection(selection: DocxSelection): DocxSelection {
  return selection.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: selection.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: selection.tableIndex,
    rowIndex: selection.rowIndex,
    cellIndex: selection.cellIndex
  };
}

/** 原 wx（jsx 23999）：选区等价 */
export function sameSelection(former: DocxSelection, latter: DocxSelection): boolean {
  if (former.kind !== latter.kind) return !1;
  if (former.kind === `paragraph`) return former.nodeIndex === (latter as Extract<DocxSelection, { kind: `paragraph` }>).nodeIndex;
  const latterCell = latter as Extract<DocxSelection, { kind: `table-cell` }>;
  return former.tableIndex === latterCell.tableIndex && former.rowIndex === latterCell.rowIndex && former.cellIndex === latterCell.cellIndex;
}

/** 原 Tx（jsx 24007）：文本位置等价 */
export function sameTextPosition(former: DocxTextPosition, latter: DocxTextPosition): boolean {
  return compareTextPositions(former, latter) === 0;
}

/** 原 Ex（jsx 24009）：文本域等价（C3 契约名 sameTextRangeApprox） */
export function sameTextRange(former: DocxTextRange | undefined, latter: DocxTextRange | undefined): boolean {
  if (!former && !latter) return !0;
  if (!former || !latter) return !1;
  const normalizedFormer = normalizeTextRange(former);
  const normalizedLatter = normalizeTextRange(latter);
  return sameTextPosition(normalizedFormer.start, normalizedLatter.start) && sameTextPosition(normalizedFormer.end, normalizedLatter.end);
}

/** 编辑器状态广播视图（原 Dx 的消费面） */
export interface EditorBroadcastStateView {
  suppressNext?: boolean;
  selectionSessionKind?: string;
  activeTextRange?: DocxTextRange;
  selectionChanged?: boolean;
  rangeChanged?: boolean;
  modelChanged?: boolean;
  [key: string]: unknown;
}

/** 原 Dx（jsx 24016）：模型变化是否可广播（排除交互会话与脏标记） */
export function modelChangedBroadcastable(state: EditorBroadcastStateView): boolean {
  return state.suppressNext || state.selectionSessionKind === `pointer` || state.selectionSessionKind === `keyboard` || state.selectionSessionKind === `composition` || !state.activeTextRange || state.selectionChanged || state.rangeChanged ? !1 : state.modelChanged as boolean;
}

/** 原 Ox（jsx 24019）：选区恢复仲裁 */
export function selectionRestoreArbitration(input: { hasLiveRange: boolean; isCollapsed: boolean; anchorIsElement: boolean; rangeInsideFocusedHost: boolean; rangeInsideViewer: boolean }): boolean {
  return input.hasLiveRange ? !input.isCollapsed && input.rangeInsideViewer ? !1 : !input.rangeInsideFocusedHost || input.isCollapsed && input.anchorIsElement : !0;
}

/** 原 kx（jsx 24026）：HTML 插入缓存（同值复用对象引用） */
export function htmlInsertionContract(cache: Map<string, { __html: string }>, key: string, html: string): { __html: string } {
  const cached = cache.get(key);
  if (cached && cached.__html === html) return cached;
  const entry = {
    __html: html
  };
  return cache.set(key, entry), entry;
}

/** 原 Ax（jsx 24030）：输入法组合键判定 */
export function isCompositionKey(event: React.KeyboardEvent): boolean {
  return event.nativeEvent?.isComposing ? !0 : event.keyCode === 229;
}

/** 原 jx（jsx 24033）：导航/编辑键判定（修饰键与组合期排除） */
export function isNavigationOrEditKey(event: React.KeyboardEvent): boolean {
  if (event.nativeEvent?.isComposing || MODIFIER_KEYS.has(event.key)) return !1;
  if (NAVIGATION_KEYS.has(event.key)) return !0;
  if (event.ctrlKey || event.metaKey) {
    const lowered = event.key.toLowerCase();
    return lowered === `a` || lowered === `x` || lowered === `z` || lowered === `y`;
  }
  return !1;
}

/** 原 Mx（jsx 24043）：光标是否位于块文本之前 */
export function caretBeforeBlockText(element: HTMLElement, domRange: Range, caretClientX?: number): boolean {
  if (!domRange.collapsed) return !1;
  if (domRange.startContainer === element && domRange.startOffset === 0) return !0;
  if (!element.contains(domRange.startContainer)) return !1;
  try {
    const probeRange = document.createRange();
    return probeRange.selectNodeContents(element), probeRange.setEnd(domRange.startContainer, domRange.startOffset), !(probeRange.toString().length !== 0 || Number.isFinite(caretClientX) && (caretClientX as number) <= element.getBoundingClientRect().left + 12);
  } catch {
    return !1;
  }
}

/** 原 Nx（jsx 24053）：光标 X 越界判定（块前且非文本节点） */
export function caretXOutOfRange(element: HTMLElement, domRange: Range, caretClientX: number): boolean {
  return caretBeforeBlockText(element, domRange, caretClientX) ? domRange.startContainer === element || !(domRange.startContainer instanceof Text) : !1;
}

/** 原 Px（jsx 24056）：图片位置 → 段落位置（去 childIndex） */
export function paragraphLocationOfImage(location: DocxLocation): DocxLocation {
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: location.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: location.paragraphIndex
  };
}

/** 原 Fx（jsx 24066）：位置解析（C3 契约名 resolveLocationContract） */
export function resolveLocation(model: DocxEditorModel, location: DocxLocation): { paragraph?: DocxParagraphNode; tableNode?: DocxTableNode } {
  if (location.kind === `paragraph`) {
    const node = model.nodes[location.nodeIndex];
    return !node || node.type !== `paragraph` ? {} : {
      paragraph: node as DocxParagraphNode
    };
  }
  const tableNode = model.nodes[location.tableIndex];
  if (!tableNode || tableNode.type !== `table`) return {};
  const table = tableNode as DocxTableNode;
  const cell = table.rows[location.rowIndex]?.cells[location.cellIndex];
  if (!cell) return {};
  const paragraph = paragraphsOf(cell.nodes)[location.paragraphIndex];
  return paragraph ? {
    paragraph: paragraph,
    tableNode: table
  } : {};
}

/** 原 Ix（jsx 24083）：位置 → 首段落位置（表格单元格归零段序） */
export function locationFirstParagraph(location: DocxLocation | DocxSelection): DocxLocation {
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: location.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: 0
  };
}

/** 原 Lx（jsx 24095）：位置 → 选区粒度（去段落序） */
export function toMutableLocation(location: DocxLocation): DocxSelection {
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: location.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex
  };
}

/** 原 Rx（jsx 24108）：位置基线归一（段序夹取取整，C3 契约名 locationBaseContract） */
export function locationBase(location: DocxLocation): DocxLocation {
  return location.kind === `paragraph` ? {
    kind: `paragraph`,
    nodeIndex: location.nodeIndex
  } : {
    kind: `table-cell`,
    tableIndex: location.tableIndex,
    rowIndex: location.rowIndex,
    cellIndex: location.cellIndex,
    paragraphIndex: Math.max(0, Math.round(location.paragraphIndex))
  };
}

/** 原 zx（jsx 24119）：文本域起点基线位置（无域时取首段落位置） */
export function locationFor(baseLocation: DocxLocation, range: DocxTextRange | undefined): DocxLocation {
  const rangeStartLocation = range?.start.location;
  return rangeStartLocation ? locationBase(rangeStartLocation) : locationFirstParagraph(baseLocation);
}

/** 原 Bx（jsx 24124）：选区运行样式（域首字符样式兜底段落首样式） */
export function selectionRunStyle(model: DocxEditorModel, baseLocation: DocxLocation, range: DocxTextRange | undefined): DocxRunStyle | undefined {
  const resolvedLocation = locationFor(baseLocation, range);
  const paragraph = resolveLocation(model, resolvedLocation).paragraph;
  if (!paragraph) return;
  if (!range) return firstTextRunStyle(paragraph);
  const normalized = normalizeTextRange(range);
  const probeOffset = compareTextPositions(normalized.start, normalized.end) < 0 && !sameLocation(normalized.start.location, normalized.end.location) ? 0 : sameLocation(normalized.start.location, resolvedLocation) ? normalized.start.offset : 0;
  return paragraph.children.some(child => child.type === `text`) ? runStyleAt(paragraph, probeOffset, !1) : firstTextRunStyle(paragraph);
}

/** 原 Vx（jsx 24136）：最近可编辑位置（单元格夹取 → 首单元格 → 邻节点） */
export function nearestEditableLocation(model: DocxEditorModel, location: DocxLocation): DocxLocation | undefined {
  if (resolveLocation(model, location).paragraph) return cloneLocation(location);
  if (location.kind === `table-cell`) {
    const tableNode = model.nodes[location.tableIndex];
    if (tableNode && tableNode.type === `table`) {
      const table = tableNode as DocxTableNode;
      const clampedRowIndex = clampNumber(location.rowIndex, 0, Math.max(0, table.rows.length - 1));
      const row = table.rows[clampedRowIndex];
      if (row) {
        const clampedCellIndex = clampNumber(location.cellIndex, 0, Math.max(0, row.cells.length - 1));
        const cell = row.cells[clampedCellIndex];
        if (cell && !cell.style?.vMergeContinuation) {
          const cellParagraphs = paragraphsOf(cell.nodes);
          if (cellParagraphs.length > 0) return {
            kind: `table-cell`,
            tableIndex: location.tableIndex,
            rowIndex: clampedRowIndex,
            cellIndex: clampedCellIndex,
            paragraphIndex: clampNumber(location.paragraphIndex, 0, Math.max(0, cellParagraphs.length - 1))
          };
        }
      }
      const firstCell = firstEditableCellLocation(model, location.tableIndex);
      if (firstCell) return firstCell;
    }
  }
  if (model.nodes.length === 0) return;
  const clampedNodeIndex = clampNumber(location.kind === `paragraph` ? location.nodeIndex : location.tableIndex, 0, Math.max(0, model.nodes.length - 1));
  const atClamped = firstLocationOfNode(model, clampedNodeIndex);
  if (atClamped) return atClamped;
  for (let nodeIndex = clampedNodeIndex + 1; nodeIndex < model.nodes.length; nodeIndex += 1) {
    const candidate = firstLocationOfNode(model, nodeIndex);
    if (candidate) return candidate;
  }
  for (let nodeIndex = clampedNodeIndex - 1; nodeIndex >= 0; --nodeIndex) {
    const candidate = firstLocationOfNode(model, nodeIndex);
    if (candidate) return candidate;
  }
  return firstEditableLocation(model);
}

/** 原 Hx（jsx 24173）：文本域归一至可编辑位置（偏移夹取） */
export function normalizeRangeToEditable(model: DocxEditorModel, range: DocxTextRange | undefined): DocxTextRange | undefined {
  if (!range) return;
  const normalized = normalizeTextRange(range);
  const startLocation = nearestEditableLocation(model, locationBase(normalized.start.location));
  const endLocation = nearestEditableLocation(model, locationBase(normalized.end.location));
  if (!startLocation || !endLocation) return;
  const startParagraph = resolveLocation(model, startLocation).paragraph;
  const endParagraph = resolveLocation(model, endLocation).paragraph;
  if (!(!startParagraph || !endParagraph)) return normalizeTextRange({
    start: {
      location: cloneLocation(startLocation),
      offset: caretOffsetIn(startParagraph, normalized.start.offset)
    },
    end: {
      location: cloneLocation(endLocation),
      offset: caretOffsetIn(endParagraph, normalized.end.offset)
    }
  });
}

/** 原 Ux（jsx 24190）：位置 → 选区（不可编辑时兜底首段） */
export function selectionFromLocation(model: DocxEditorModel, location: DocxLocation | DocxSelection): DocxSelection {
  const editable = nearestEditableLocation(model, locationFirstParagraph(location));
  return editable ? toMutableLocation(editable) : {
    kind: `paragraph`,
    nodeIndex: 0
  };
}

/** 原 Wx（jsx 24196）：光标状态归一（选区 + 活动文本域） */
export function normalizeCursorState(model: DocxEditorModel, selection: DocxSelection, range: DocxTextRange | undefined): { selection: DocxSelection; activeTextRange: DocxTextRange | undefined } {
  const normalizedRange = normalizeRangeToEditable(model, range);
  return normalizedRange ? {
    selection: selectionFromLocation(model, toMutableLocation(normalizedRange.start.location)),
    activeTextRange: normalizedRange
  } : {
    selection: selectionFromLocation(model, selection),
    activeTextRange: void 0
  };
}

/** C3 契约别名（xx 23965） */
export const cloneLocationContract = cloneLocation;
/** C3 契约别名（Sx 23976） */
export const collapsedRangeToRestore = cloneTextRange;
/** C3 契约别名（Ex 24009） */
export const sameTextRangeApprox = sameTextRange;
/** C3 契约别名（_x 23933） */
export const enumerateRangeLocationsContract = enumerateRangeLocations;
/** C3 契约别名（vx 23940） */
export const paragraphInsertOffset = caretOffsetIn;
/** C3 契约别名（Fx 24066） */
export const resolveLocationContract = resolveLocation;
/** C3 契约别名（Rx 24108） */
export const locationBaseContract = locationBase;
/** 原 fb（jsx 22901）C3 契约别名 */
export const cloneRunStyleContract = cloneRunStyle;
/** 原 fb（jsx 22901）BEditorState 契约别名（编辑器待生效样式克隆） */
export const clonePendingStyle = cloneRunStyle;
/** 原 Nb（jsx 23300）C3 契约别名（图片拖放区 dataset 解析） */
export const parseImageDropZoneDataset = locationFromDataset;
/** 原 Mb（jsx 23297）C3 契约别名（图片拖放区键） */
export const imageDropZoneKey = childLocationKey;

/* ============================================================================
 * §12 编辑器归约器装配与节区（页眉/页脚）文本/浮动图写入
 *     （原 Gx..eS，jsx 24208-24337）
 * ==========================================================================*/

/** 原 Gx（jsx 24208）：编辑器历史归约器（适配器 = 本文件克隆/比较/归一函数） */
export const editorReducer = createEditorHistoryReducer({
  cloneSelection: cloneSelection,
  cloneTextRange: cloneTextRange,
  clonePendingStyle: cloneRunStyle,
  sameSelection: sameSelection,
  sameTextRange: sameTextRange,
  samePendingStyle: (former, latter) => JSON.stringify(former ?? null) === JSON.stringify(latter ?? null),
  normalizeCursor: normalizeCursorState
});

/** 原 Kx（jsx 24218）：按位置替换文本（段落/单元格分派） */
export function replaceTextAtLocation(model: DocxEditorModel, location: DocxLocation, newText: string, options?: ParagraphTextOptions): DocxEditorModel {
  return location.kind === `paragraph` ? replaceModelParagraphText(model, location.nodeIndex, newText, options) : replaceTableCellParagraphText(model, location.tableIndex, location.rowIndex, location.cellIndex, location.paragraphIndex, newText, options);
}

/** 节区草稿位置（原 qx/Jx/Xx 的键面） */
export interface SectionDraftLocation {
  region: string;
  partName: string;
  nodeIndex: number;
  rowIndex?: number;
  cellIndex?: number;
  paragraphIndex?: number;
}

/** 原 qx（jsx 24220）：节区段落草稿键 */
export function sectionParagraphDraftKey(location: SectionDraftLocation): string {
  return JSON.stringify({
    region: location.region,
    partName: location.partName,
    nodeIndex: location.nodeIndex,
    rowIndex: location.rowIndex ?? -1,
    cellIndex: location.cellIndex ?? -1,
    paragraphIndex: location.paragraphIndex ?? -1
  });
}

/** 原 Jx（jsx 24230）：节区图片键（含 childIndex） */
export function sectionImageKey(location: SectionDraftLocation & { childIndex: number }): string {
  return JSON.stringify({
    region: location.region,
    partName: location.partName,
    nodeIndex: location.nodeIndex,
    rowIndex: location.rowIndex ?? -1,
    cellIndex: location.cellIndex ?? -1,
    paragraphIndex: location.paragraphIndex ?? -1,
    childIndex: location.childIndex
  });
}

/** 原 Yx（jsx 24240）：单元格段落草稿键 */
export function cellParagraphDraftKey(tableIndex: number, rowIndex: number, cellIndex: number, paragraphIndex: number): string {
  return `${tableIndex}:${rowIndex}:${cellIndex}:${paragraphIndex}`;
}

/** 原 Xx（jsx 24241）：节区草稿键解析 */
export function parseSectionDraftKey(key: string): { region: `header` | `footer`; partName: string; nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number } | undefined {
  try {
    const parsed = JSON.parse(key);
    if (!parsed || parsed.region !== `header` && parsed.region !== `footer` || typeof parsed.partName != `string` || !Number.isFinite(parsed.nodeIndex)) return;
    const rowIndex = Number.isFinite(parsed.rowIndex) && parsed.rowIndex >= 0 ? Math.round(parsed.rowIndex) : void 0;
    const cellIndex = Number.isFinite(parsed.cellIndex) && parsed.cellIndex >= 0 ? Math.round(parsed.cellIndex) : void 0;
    const paragraphIndex = Number.isFinite(parsed.paragraphIndex) && parsed.paragraphIndex >= 0 ? Math.round(parsed.paragraphIndex) : void 0;
    return {
      region: parsed.region,
      partName: parsed.partName,
      nodeIndex: Math.max(0, Math.round(parsed.nodeIndex)),
      rowIndex: rowIndex,
      cellIndex: cellIndex,
      paragraphIndex: paragraphIndex
    };
  } catch {
    return;
  }
}

/** 原 Zx（jsx 24261）：节区节点文本读取 */
export function sectionNodeTextAt(nodes: DocxNode[], location: { nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number }): string | undefined {
  const node = nodes[location.nodeIndex];
  if (!node) return;
  if (location.rowIndex === void 0 || location.cellIndex === void 0) return node.type === `paragraph` ? paragraphText(node as DocxParagraphNode) : void 0;
  if (node.type !== `table`) return;
  const table = node as DocxTableNode;
  const paragraphOrdinal = Math.max(0, Math.round(location.paragraphIndex ?? 0));
  const cell = table.rows[location.rowIndex]?.cells[location.cellIndex];
  if (!cell) return;
  const paragraph = paragraphsOf(cell.nodes)[paragraphOrdinal];
  return paragraph ? paragraphText(paragraph) : void 0;
}

/** 原 Qx（jsx 24276）：节区段落解析 */
export function sectionParagraphAt(nodes: DocxNode[], location: { nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number }): { paragraph?: DocxParagraphNode; tableNode?: DocxTableNode } {
  const node = nodes[location.nodeIndex];
  if (!node) return {};
  if (location.rowIndex === void 0 || location.cellIndex === void 0) return node.type === `paragraph` ? {
    paragraph: node as DocxParagraphNode
  } : {};
  if (node.type !== `table`) return {};
  const table = node as DocxTableNode;
  const paragraphOrdinal = Math.max(0, Math.round(location.paragraphIndex ?? 0));
  const cell = table.rows[location.rowIndex]?.cells[location.cellIndex];
  if (!cell) return {};
  const paragraph = paragraphsOf(cell.nodes)[paragraphOrdinal];
  return paragraph ? {
    paragraph: paragraph,
    tableNode: table
  } : {};
}

/** 原 $x（jsx 24290）：节区段落文本替换（顶层 + 各节同名 part 全量；BEditorState 契约名 commitSectionParagraphText） */
export function replaceSectionParagraphText(model: DocxEditorModel, location: SectionDraftLocation, newText: string, options?: ParagraphTextOptions): DocxEditorModel {
  const cloned = deepCloneModel(model);
  const sectionGroups = location.region === `header` ? [cloned.metadata.headerSections ?? [], ...(cloned.metadata.sections?.map(section => section.headerSections ?? []) ?? [])] : [cloned.metadata.footerSections ?? [], ...(cloned.metadata.sections?.map(section => section.footerSections ?? []) ?? [])];
  const normalizedLocation = {
    nodeIndex: Math.max(0, Math.round(location.nodeIndex)),
    rowIndex: Number.isFinite(location.rowIndex) && (location.rowIndex as number) >= 0 ? Math.round(location.rowIndex as number) : void 0,
    cellIndex: Number.isFinite(location.cellIndex) && (location.cellIndex as number) >= 0 ? Math.round(location.cellIndex as number) : void 0,
    paragraphIndex: Number.isFinite(location.paragraphIndex) && (location.paragraphIndex as number) >= 0 ? Math.round(location.paragraphIndex as number) : void 0
  };
  let replaced = !1;
  return sectionGroups.forEach(group => {
    group.forEach(section => {
      if (section.partName !== location.partName) return;
      const currentText = sectionNodeTextAt(section.nodes, normalizedLocation);
      if (currentText === void 0 || currentText === newText) return;
      const scopedModel = {
        ...cloned,
        nodes: section.nodes
      };
      section.nodes = (normalizedLocation.rowIndex === void 0 || normalizedLocation.cellIndex === void 0 ? replaceModelParagraphText(scopedModel, normalizedLocation.nodeIndex, newText, options) : replaceTableCellParagraphText(scopedModel, normalizedLocation.nodeIndex, normalizedLocation.rowIndex as number, normalizedLocation.cellIndex as number, normalizedLocation.paragraphIndex ?? 0, newText, options)).nodes, replaced = !0;
    });
  }), replaced ? cloned : model;
}

/** 原 eS（jsx 24311）：节区浮动图位移（命中后清源 XML 缓存） */
export function moveSectionFloatingImage(model: DocxEditorModel, location: SectionDraftLocation & { childIndex: number }, patch: Record<string, unknown>): DocxEditorModel {
  const cloned = deepCloneModel(model);
  const sectionGroups = location.region === `header` ? [cloned.metadata.headerSections ?? [], ...(cloned.metadata.sections?.map(section => section.headerSections ?? []) ?? [])] : [cloned.metadata.footerSections ?? [], ...(cloned.metadata.sections?.map(section => section.footerSections ?? []) ?? [])];
  const normalizedLocation = {
    nodeIndex: Math.max(0, Math.round(location.nodeIndex)),
    rowIndex: Number.isFinite(location.rowIndex) && (location.rowIndex as number) >= 0 ? Math.round(location.rowIndex as number) : void 0,
    cellIndex: Number.isFinite(location.cellIndex) && (location.cellIndex as number) >= 0 ? Math.round(location.cellIndex as number) : void 0,
    paragraphIndex: Number.isFinite(location.paragraphIndex) && (location.paragraphIndex as number) >= 0 ? Math.round(location.paragraphIndex as number) : void 0,
    childIndex: Math.max(0, Math.round(location.childIndex))
  };
  let moved = !1;
  return sectionGroups.forEach(group => {
    group.forEach(section => {
      if (section.partName !== location.partName) return;
      const resolved = sectionParagraphAt(section.nodes, normalizedLocation);
      const paragraph = resolved.paragraph;
      if (!paragraph) return;
      const child = paragraph.children[normalizedLocation.childIndex];
      !child || child.type !== `image` || ((child as DocxImageNode).floating = {
        ...((child as DocxImageNode).floating ?? {}),
        ...patch
      }, paragraph.sourceXml = void 0, resolved.tableNode && (resolved.tableNode.sourceXml = void 0), moved = !0);
    });
  }), moved ? cloned : model;
}

/** BEditorState 契约别名（$x 24290） */
export const commitSectionParagraphText = replaceSectionParagraphText;

/* ============================================================================
 * §D [E6]b 余带依赖补全：浮动图环绕/绝对定位样式与底图框尺寸
 *     （原 Ig/Lg/Rg/Gg，jsx 19564-19816；批 B 未实体化，本文件补全）
 * ==========================================================================*/

/** 原 Ig（jsx 19564）：浮动图环绕侧（wrapText → 对齐 → 几何推断） */
export function floatingWrapSide(image: DocxImageNode, frame?: { containerWidthPx?: number; imageWidthPx?: number }): `left` | `right` {
  const floating = image.floating;
  const wrapText = floating?.wrapText;
  if (wrapText === `left`) return `right`;
  if (wrapText === `right`) return `left`;
  const align = floating?.horizontalAlign?.toLowerCase();
  if (align === `right` || align === `outside`) return `right`;
  if (align === `left` || align === `inside`) return `left`;
  const containerWidthPx = Number.isFinite(frame?.containerWidthPx) && (frame?.containerWidthPx as number) > 0 ? Math.max(1, Math.round(frame?.containerWidthPx as number)) : void 0;
  const imageWidthPx = Number.isFinite(frame?.imageWidthPx) && (frame?.imageWidthPx as number) > 0 ? Math.max(1, Math.round(frame?.imageWidthPx as number)) : void 0;
  return Number.isFinite(containerWidthPx) && Number.isFinite(imageWidthPx) && Number.isFinite(floating?.xPx) ? (floating?.xPx as number) + (imageWidthPx as number) / 2 <= (containerWidthPx as number) / 2 ? `left` : `right` : (floating?.xPx ?? 0) >= 0 && (floating?.xPx ?? 0) > 96 ? `right` : `left`;
}

/** 原 Lg（jsx 19576）：浮动图环绕布局样式（topAndBottom 居中/右/左 + 左右浮动） */
export function floatingWrapStyle(image: DocxImageNode, options?: { containerWidthPx?: number; deltaX?: number; deltaY?: number; allowNegativeOffsets?: boolean }): React.CSSProperties {
  const floating = image.floating;
  const wrapType = floating?.wrapType;
  if (!floating || !wrapType) return {};
  const leftClearance = floating.distLPx ?? 0;
  const rightClearance = floating.distRPx ?? 0;
  const topClearance = floating.distTPx ?? 0;
  const bottomClearance = floating.distBPx ?? 0;
  const deltaX = Number.isFinite(options?.deltaX) ? Math.round(options?.deltaX as number) : 0;
  const deltaY = Number.isFinite(options?.deltaY) ? Math.round(options?.deltaY as number) : 0;
  const allowNegativeOffsets = options?.allowNegativeOffsets === !0;
  const shiftedLeft = Number.isFinite(floating.xPx) ? Math.round((floating.xPx as number) + deltaX) : void 0;
  const shiftedTop = Number.isFinite(floating.yPx) ? Math.round((floating.yPx as number) + deltaY) : void 0;
  const clampedLeft = allowNegativeOffsets ? Math.round(shiftedLeft ?? 0) : Math.max(0, Math.round(shiftedLeft ?? 0));
  const clampedTop = allowNegativeOffsets ? Math.round(shiftedTop ?? 0) : Math.max(0, Math.round(shiftedTop ?? 0));
  const horizontalAlign = floating.horizontalAlign?.toLowerCase();
  const hasExplicitAlign = horizontalAlign === `left` || horizontalAlign === `center` || horizontalAlign === `right` || horizontalAlign === `inside` || horizontalAlign === `outside`;
  const containerWidthPx = Number.isFinite(options?.containerWidthPx) ? Math.max(1, Math.round(options?.containerWidthPx as number)) : void 0;
  const imageWidthPx = Number.isFinite(image.widthPx) ? Math.max(1, Math.round(image.widthPx as number)) : void 0;
  const widthStyle = imageWidthPx ? {
    width: imageWidthPx
  } : {
    width: `fit-content`
  };
  const rightRemainder = Number.isFinite(shiftedLeft) && Number.isFinite(shiftedLeft) && Number.isFinite(containerWidthPx) && Number.isFinite(imageWidthPx) ? allowNegativeOffsets ? Math.round((containerWidthPx as number) - (shiftedLeft as number) - (imageWidthPx as number)) : Math.max(0, Math.round((containerWidthPx as number) - (shiftedLeft as number) - (imageWidthPx as number))) : 0;
  const hasAbsoluteLeft = Number.isFinite(shiftedLeft);
  const alignZeroLeft = hasExplicitAlign && !hasAbsoluteLeft ? 0 : clampedLeft;
  const topOffset = topClearance + clampedTop;
  if (wrapType === `topAndBottom`) return horizontalAlign === `center` ? {
    display: `block`,
    ...widthStyle,
    marginTop: topOffset,
    marginBottom: bottomClearance,
    marginLeft: `auto`,
    marginRight: `auto`,
    clear: `both`
  } : horizontalAlign === `right` || horizontalAlign === `outside` ? {
    display: `block`,
    ...widthStyle,
    marginTop: topOffset,
    marginBottom: bottomClearance,
    marginLeft: `auto`,
    marginRight: hasAbsoluteLeft ? rightRemainder : rightClearance,
    clear: `both`
  } : {
    display: `block`,
    ...widthStyle,
    marginTop: topOffset,
    marginBottom: bottomClearance,
    marginLeft: hasAbsoluteLeft ? alignZeroLeft : leftClearance + alignZeroLeft,
    marginRight: rightClearance,
    clear: `both`
  };
  const wrapSide = floatingWrapSide(image, {
      containerWidthPx: containerWidthPx,
      imageWidthPx: imageWidthPx
    });
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const sideClearance = hasAbsoluteLeft && !hasExplicitAlign && (horizontalRelativeTo === `margin` || horizontalRelativeTo === `page` || horizontalRelativeTo === `column`) ? wrapSide === `left` ? Math.max(0, alignZeroLeft) : Math.max(0, rightRemainder) : 0;
  const clearanceAsIndent = sideClearance > 0 && horizontalRelativeTo === `column`;
  return {
    display: `block`,
    ...widthStyle,
    float: wrapSide,
    marginTop: topOffset,
    marginBottom: bottomClearance,
    marginLeft: wrapSide === `left` ? sideClearance > 0 ? clearanceAsIndent ? leftClearance + sideClearance : 0 : hasAbsoluteLeft ? alignZeroLeft : leftClearance + alignZeroLeft : leftClearance,
    marginRight: wrapSide === `right` ? sideClearance > 0 ? clearanceAsIndent ? rightClearance + sideClearance : 0 : hasAbsoluteLeft ? rightRemainder : rightClearance + rightRemainder : rightClearance,
    paddingLeft: wrapSide === `left` && sideClearance > 0 && !clearanceAsIndent ? sideClearance : void 0,
    paddingRight: wrapSide === `right` && sideClearance > 0 && !clearanceAsIndent ? sideClearance : void 0,
    boxSizing: sideClearance > 0 && !clearanceAsIndent ? `content-box` : void 0
  };
}

/** 原 Rg（jsx 19649）：浮动图绝对定位样式（锚定参照系 + 对齐兜底 + 位移） */
export function floatingAbsoluteStyle(image: DocxImageNode, options?: { pageOriginLeft?: number; pageOriginTop?: number; marginOriginLeft?: number; marginOriginTop?: number; columnOriginLeft?: number; columnOriginTop?: number; paragraphOriginLeft?: number; paragraphOriginTop?: number; deltaX?: number; deltaY?: number }): React.CSSProperties {
  const floating = image.floating;
  if (!floating) return {};
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const verticalRelativeTo = floating.verticalRelativeTo?.toLowerCase();
  const horizontalAlign = floating.horizontalAlign?.toLowerCase();
  const verticalAlign = (floating.verticalAlign as string | undefined)?.toLowerCase();
  const hasWrap = !!(floating.wrapType && floating.wrapType !== `none`);
  const leftClearance = hasWrap ? floating.distLPx ?? 0 : 0;
  const rightClearance = hasWrap ? floating.distRPx ?? 0 : 0;
  const topClearance = hasWrap ? floating.distTPx ?? 0 : 0;
  const bottomClearance = hasWrap ? floating.distBPx ?? 0 : 0;
  const deltaX = Number.isFinite(options?.deltaX) ? Math.round(options?.deltaX as number) : 0;
  const deltaY = Number.isFinite(options?.deltaY) ? Math.round(options?.deltaY as number) : 0;
  const stackedZIndex = Number.isFinite(floating.zIndex) ? Math.max(1, Math.min(65535, Math.round((floating.zIndex as number) / 65536))) : void 0;
  const zIndex = floating.behindDocument ? -1e5 + (stackedZIndex ?? 1) : stackedZIndex ?? 4;
  const absoluteLeft = floating.xPx === void 0 ? void 0 : horizontalRelativeTo === `page` ? floating.xPx + (options?.pageOriginLeft ?? 0) : horizontalRelativeTo === `margin` ? floating.xPx + (options?.marginOriginLeft ?? options?.pageOriginLeft ?? 0) : horizontalRelativeTo === `column` ? floating.xPx + (options?.columnOriginLeft ?? 0) : horizontalRelativeTo === `paragraph` || horizontalRelativeTo === `line` ? floating.xPx + (options?.paragraphOriginLeft ?? 0) : floating.xPx;
  const absoluteTop = floating.yPx === void 0 ? void 0 : verticalRelativeTo === `page` ? floating.yPx + (options?.pageOriginTop ?? 0) : verticalRelativeTo === `margin` ? floating.yPx + (options?.marginOriginTop ?? options?.pageOriginTop ?? 0) : verticalRelativeTo === `column` ? floating.yPx + (options?.columnOriginTop ?? 0) : verticalRelativeTo === `paragraph` || verticalRelativeTo === `line` ? floating.yPx + (options?.paragraphOriginTop ?? 0) : floating.yPx;
  const style: React.CSSProperties = {
      position: `absolute`,
      zIndex: zIndex
    };
  const transformParts: string[] = [];
  if (absoluteLeft === void 0 ? horizontalAlign === `right` || horizontalAlign === `outside` ? style.right = rightClearance - deltaX : horizontalAlign === `center` ? (style.left = `50%`, transformParts.push(`translateX(-50%)`)) : style.left = leftClearance + deltaX : style.left = (absoluteLeft as number) + deltaX, absoluteTop === void 0 ? verticalAlign === `bottom` || verticalAlign === `outside` ? style.bottom = bottomClearance - deltaY : verticalAlign === `center` ? (style.top = `50%`, transformParts.push(`translateY(-50%)`)) : style.top = topClearance + deltaY : style.top = (absoluteTop as number) + deltaY, transformParts.length > 0 || deltaX !== 0 || deltaY !== 0) {
    const centerHorizontal = absoluteLeft === void 0 && horizontalAlign === `center`;
    const centerVertical = absoluteTop === void 0 && verticalAlign === `center`;
    const centerTranslate = centerHorizontal || centerVertical ? `translate(${centerHorizontal ? deltaX : 0}px, ${centerVertical ? deltaY : 0}px)` : ``;
    style.transform = [...transformParts, centerTranslate].filter(Boolean).join(` `);
  }
  return style;
}

/** 原 Gg（jsx 19788）：底图（behindDoc）框尺寸——页宽占比不足时右延至页边 */
export function behindDocImageFrameSize(image: DocxImageNode, frameWidthPx: number | undefined, frameHeightPx: number | undefined, metrics?: { pageWidth?: number; marginLeft?: number; left?: number }): { widthPx: number | undefined; heightPx: number | undefined } {
  const floating = image.floating;
  const pageWidth = Number.isFinite(metrics?.pageWidth) ? Math.max(1, Math.round(metrics?.pageWidth as number)) : void 0;
  if (!floating || !isFloatingImageNode(image) || floating.behindDocument !== !0 || floating.wrapType !== void 0 && floating.wrapType !== `none` || !Number.isFinite(pageWidth)) return {
    widthPx: frameWidthPx,
    heightPx: frameHeightPx
  };
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  if (horizontalRelativeTo !== `page` && horizontalRelativeTo !== `margin`) return {
    widthPx: frameWidthPx,
    heightPx: frameHeightPx
  };
  const roundedWidth = Number.isFinite(frameWidthPx) ? Math.max(1, Math.round(frameWidthPx as number)) : void 0;
  if (Number.isFinite(roundedWidth) && (roundedWidth as number) < (pageWidth as number) * 0.55) return {
    widthPx: frameWidthPx,
    heightPx: frameHeightPx
  };
  const absoluteLeft = Number.isFinite(floating.xPx) ? Math.round(horizontalRelativeTo === `margin` ? (floating.xPx as number) + ((metrics?.marginLeft ?? metrics?.left ?? 0) as number) : floating.xPx as number) : horizontalRelativeTo === `margin` ? Math.round((metrics?.marginLeft ?? metrics?.left ?? 0) as number) : 0;
  const extendedWidth = Math.max(1, Math.round((pageWidth as number) - Math.max(0, absoluteLeft)));
  if (Number.isFinite(roundedWidth) && (roundedWidth as number) >= extendedWidth) return {
    widthPx: frameWidthPx,
    heightPx: frameHeightPx
  };
  const widthPx = extendedWidth;
  return {
    widthPx: widthPx,
    heightPx: Number.isFinite(frameWidthPx) && Number.isFinite(frameHeightPx) && (frameWidthPx as number) > 0 ? Math.max(1, Math.round((frameHeightPx as number) * widthPx / (frameWidthPx as number))) : frameHeightPx
  };
}

/** 原 Jg（jsx 19829）：图片级页/边距锚定浮动判定（批 B 未实体化；
 * 批 B paragraphHasPageAnchoredFloatingImage 为 Yg/Zg 族段落级谓词） */
export function imageIsPageAnchoredFloating(image: DocxImageNode): boolean {
  if (!isInlineImageNode(image)) return !1;
  const floating = image.floating;
  if (!floating) return !1;
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const verticalRelativeTo = floating.verticalRelativeTo?.toLowerCase();
  return (horizontalRelativeTo === `page` || horizontalRelativeTo === `margin`) && (verticalRelativeTo === `page` || verticalRelativeTo === `margin`);
}
/* ============================================================================
 * 文件尾符号表（混淆名 → 语义名，jsx 行号，把握度；与文件头映射表一致）
 * ----------------------------------------------------------------------------
 * §1 域结果解析：
 *   gv → pageFieldResultsCache (20944, 高) | _v → paragraphPageFieldResults (20945, 高)
 *   vv → styleRefFieldResultsCache (20998, 高) | yv → paragraphStyleRefFieldResults (20999, 高)
 *   bv → normalizeStyleName (21052, 高) | xv → tocFieldFallback (21055, 高)
 * §2 引导符/脚注/日期：
 *   Sv → leaderBackgroundStyle (21074, 高) | Cv → noteReferenceMark (21094, 高)
 *   wv → normalizeDateToIso (21104, 高)
 * §3 段落 run 渲染器：
 *   Tv → renderParagraphRuns (21113-21684, 高；JSX 全量逐字)
 * §4 编号格式与标签：
 *   Ev → romanNumeralOf (21685, 高) | Dv → letterOrdinalOf (21693, 高)
 *   Ov → numberInFormat (21703, 高) | kv → formatPageNumber (21728, 高)
 *   Av → numberingLevelOf (21732, 高) | jv → numberingLevelHasVisibleBullet (21736, 高)
 *   Mv → numberingLevelIsBullet (21739, 高) | Nv → numberingLevelsOf (21742, 高)
 *   Pv → effectiveNumIdOfParagraph (21746, 高) | Fv → numberingLevelStart (21771, 高)
 *   Iv → numberingSuffixText (21777, 高) | Lv → BULLET_GLYPH_REPLACEMENTS (21780, 高)
 *   Rv → replaceBulletGlyphs (21785, 高) | zv → numberingLabelsForModel (21792, 高)
 * §5 列表文本族：
 *   Bv → UNORDERED_BULLET_PREFIX_REGEX (21878, 高) | Vv → ORDERED_DOT_PREFIX_REGEX (21878, 高)
 *   Hv → ANY_LIST_PREFIX_REGEX (21878, 高) | Uv → ORDERED_PREFIX_REGEX (21878, 高)
 *   Wv → LIST_INDENT_TWIPS=720 (21878, 高) | Gv → LIST_HANGING_TWIPS=360 (21878, 高)
 *   Kv → MAX_NUMBERING_DEPTH_DEFAULT=8 (21878, 高)
 *   qv → looksUnordered (21885, 高) | Jv → looksOrdered (21888, 高)
 *   Yv → textIsBulletGlyphs (21891, 高) | Xv → paragraphHasNumbering (21895, 高)
 *   Zv → numberingKindOf (21898, 高) | Qv → isNumberedParagraph (21913, 高；+别名 paragraphIsListItem)
 *   $v → stripListPrefix (21917, 高) | ey → listPrefixLength (21920, 高)
 *   ty → orderedSuccessor (21922, 高) | ny → applyListPrefix (21928, 高)
 * §6 结构克隆与段落/单元格构造：
 *   ry → cloneBorderSide (21933, 高) | iy → cloneParagraphBorders (21938, 高)
 *   ay → cloneParagraphStyle (21948, 高) | oy → cloneParagraphStyleWithDefaultSpacing (21969, 高)
 *   sy → cloneMarginTwips (21983, 高) | cy → cloneTableBorderSide (21991, 高)
 *   ly → cloneTableBorders (21998, 高) | uy → cloneCellStyle (22011, 高)
 *   dy → cloneRowStyle (22018, 高) | fy → emptyParagraph (22024, 高)
 *   py → cloneCell (22037, 高) | my → maxNumberingDepth (22048, 高)
 *   hy → shiftIndent (22057, 高) | gy → applyListIndent (22066, 高)
 *   _y → removeListIndent (22081, 高) | vy → cellParagraphsSignature (22099, 高)
 * §7 表格几何：
 *   yy → tableMaxColumnCount (22103, 高) | by → floatingTableSide (22106, 高)
 *   xy → floatingTableWidthPx (22112, 高) | Sy → floatingTableLayout (22118, 高)
 *   Cy → floatingTableStyle (22150, 高) | wy → locateNestedTable (22173, 高)
 *   Ty → tableGridWidthsCache (22207, 高) | Ey → tableGridWidthsCached (22208, 高)
 *   Dy → tableGridWidthsTwips (22215, 高) | Oy → gridWidthsDivergeFromCells (22222, 高)
 *   ky → gridWidthsFromCellWidths (22240, 高) | Ay → normalizeGridWidthsTwips (22266, 高)
 *   jy → normalizeGridWidthsPx (22276, 高) | My → evenGridWidthsPx (22285, 高)
 *   Ny → clampTableContentWidthPx (22291, 高) | Py → scaleGridWidthsToPx (22294, 高)
 *   Fy → rowColumnSpanCount (22336, 高) | Iy → effectiveColumnWidthsPx (22339, 高)
 *   Ly → cellMarginsPx (22378, 中；参数 unknown) | Ry → cellPaddingStyle (22385, 高)
 *   zy → effectiveCellMarginTwips (22400, 中；参数 unknown) | db → diagonalBordersBackground (22884, 高)
 * §8 边框预设：
 *   By → borderTypeNormalized (22408, 高) | Vy → borderSideCss (22411, 高)
 *   Hy → borderSideWidthPx (22421, 高) | Uy → borderTypeVisible (22427, 高)
 *   Wy → paragraphBorderVisible (22431, 高) | Gy → tableBorderVisible (22434, 高)
 *   Ky → cellBordersVisible (22437, 高) | qy → tableUsesCellBorders (22440, 高)
 *   Jy → tableBorderSpacingPx (22446, 高) | Yy → tableBorderCollapseStyle (22451, 高)
 *   Xy → firstParagraphBorder (22458, 高) | Zy → firstTableBorder (22461, 高)
 *   Qy → normalizeParagraphBorderSpec (22464, 高) | $y → normalizeTableBorderSpec (22472, 高)
 *   eb → nilParagraphBorder (22481, 高) | tb → nilTableBorder (22486, 高)
 *   nb → paragraphBorderPresets (22491, 高) | rb → paragraphsMatchBorderPreset (22514, 高)
 *   ib → toggleTableCellBorder (22553, 高) | ab → tableBorderPresets (22619, 高)
 *   ob → toggleParagraphBorder (22644, 高) | sb → toggleTableBorder (22727, 高)
 *   cb → cellBorderForSide (22839, 高) | lb → cellBorderCss (22848, 高)
 *   ub → tableOuterBorderWidthPx (22868, 高)
 * §9 run/表单域克隆与文本编辑：
 *   fb → cloneRunStyle (22901, 高；+别名 cloneRunStyleContract/clonePendingStyle) | pb → withFontFamily (22906, 高)
 *   mb → cloneFormFieldWidget (22913, 高) | hb → mergeFormFieldWidget (22934, 高)
 *   gb → cloneFormField (22970, 高) | _b → sameJson (22993, 高)
 *   vb → normalizeParagraphChildren (22996, 高) | yb → paragraphChildrenAllText (23027, 高)
 *   bb → cloneTextNode (23030, 高) | xb → splitChildrenAt (23041, 高)
 *   Sb → runStyleAt (23074, 高) | Cb → linkFrom (23088, 高)
 *   wb → linkWithin (23102, 高) | Tb → expandLinkAt (23122, 高)
 *   Eb → applyRunStyleToRange (23154, 高) | Db → applyLinkToRange (23216, 高)
 *   Ob → bytesToBase64Inline (23278, 高)
 * §10 位置/批注/修订：
 *   kb → selectionCoversCell (23288, 高) | Ab → locationKeyContract (23291, 高)
 *   jb → imageLocationKeyContract (23294, 高) | Mb → childLocationKey (23297, 高；+别名 imageDropZoneKey)
 *   Nb → locationFromDataset (23300, 高；+别名 parseImageDropZoneDataset) | Pb → firstTableCellLocation (23328, 高)
 *   Fb → tableFormattingRevisions (23342, 高) | Ib → extractTrackedChanges (23379, 高)
 *   Lb → xmlTextPreview (23454, 高) | Rb → commentAnchorText (23460, 高)
 *   zb → extractComments (23468, 高) | Bb → colorWithAlpha (23537, 高)
 *   Vb → annotationColorFor (23541, 高) | Hb → commentHighlightStyle (23550, 高)
 *   Ub → commentCardHeight (23557, 高) | Wb → trackedChangeKindLabel (23562, 高)
 *   Gb → trackedChangeColor (23580, 高) | Kb → trackedChangeIsAnnotatable (23610, 高)
 *   qb → locationSortVector (23613, 高) | Jb → locationInPages (23616, 高)
 *   Yb → pageIndexForLocation (23619, 高) | Xb → locationElement (23623, 高)
 *   Zb → annotationAnchorRect (23626, 高) | Qb → elementWithClassToken (23644, 高)
 *   $b → annotationLocationElement (23652, 高) | ex → elementByDataAttr (23655, 高)
 *   tx → annotationAnchorElement (23663, 高) | nx → trackedChangeCardHeight (23679, 高)
 *   rx → assignConnectorLanes (23684, 高) | ix → layoutGutterAnnotations (23712, 高；+别名 layoutGutterAnnotationsContract)
 *   ax → sameLocation (23754, 高；+别名 sameLocationContract)
 * §11 位置导航与选区：
 *   ox → firstEditableCellLocation (23757, 高) | sx → lastEditableCellLocation (23773, 高)
 *   cx → locationNodeIndex (23791, 高) | lx → shiftLocationAfterTableRemoval (23794, 高)
 *   ux → tableFullTextRange (23813, 高) | dx → emptiedTableIndexes (23830, 高)
 *   fx → firstLocationOfNode (23847, 高) | px → previousEditableParagraphLocation (23854, 高)
 *   mx → nextEditableParagraphLocation (23861, 高) | hx → firstEditableLocation (23899, 高)
 *   gx → lastLocation (23905, 高) | _x → enumerateRangeLocations (23931, 高；+别名 enumerateRangeLocationsContract)
 *   vx → caretOffsetIn (23941, 高；+别名 paragraphInsertOffset) | yx → documentIsSingleParagraph (23945, 高)
 *   bx → rangeOffsetsInParagraph (23957, 高) | xx → cloneLocation (23965, 高；+别名 cloneLocationContract)
 *   Sx → cloneTextRange (23977, 高；+别名 collapsedRangeToRestore) | Cx → cloneSelection (23989, 高)
 *   wx → sameSelection (24000, 高) | Tx → sameTextPosition (24006, 高)
 *   Ex → sameTextRange (24009, 高；+别名 sameTextRangeApprox) | Dx → modelChangedBroadcastable (24016, 高)
 *   Ox → selectionRestoreArbitration (24019, 高) | kx → htmlInsertionContract (24022, 高)
 *   Ax → isCompositionKey (24030, 高) | jx → isNavigationOrEditKey (24033, 高)
 *   Mx → caretBeforeBlockText (24042, 高) | Nx → caretXOutOfRange (24053, 高)
 *   Px → paragraphLocationOfImage (24056, 高) | Fx → resolveLocation (24068, 高；+别名 resolveLocationContract)
 *   Ix → locationFirstParagraph (24085, 高) | Lx → toMutableLocation (24097, 高)
 *   Rx → locationBase (24108, 高；+别名 locationBaseContract) | zx → locationFor (24120, 高)
 *   Bx → selectionRunStyle (24124, 高) | Vx → nearestEditableLocation (24133, 高)
 *   Hx → normalizeRangeToEditable (24172, 高) | Ux → selectionFromLocation (24191, 高)
 *   Wx → normalizeCursorState (24198, 高)
 * §12 reducer 与节区草稿：
 *   Gx → editorReducer (24208, 高；Uo 工厂实例) | Kx → replaceTextAtLocation (24217, 高)
 *   qx → sectionParagraphDraftKey (24220, 高) | Jx → sectionImageKey (24230, 高)
 *   Yx → cellParagraphDraftKey (24241, 高) | Xx → parseSectionDraftKey (24244, 高)
 *   Zx → sectionNodeTextAt (24263, 高) | Qx → sectionParagraphAt (24274, 高)
 *   $x → replaceSectionParagraphText (24290, 高；+别名 commitSectionParagraphText)
 *   eS → moveSectionFloatingImage (24313, 高)
 * §D 依赖补全（[E6]b 余带，范围外）：
 *   Ig → floatingWrapSide (19564, 高) | Lg → floatingWrapStyle (19576, 高)
 *   Rg → floatingAbsoluteStyle (19649, 高) | Gg → behindDocImageFrameSize (19788, 高)
 *   Jg → imageIsPageAnchoredFloating (19829, 高)
 * ==========================================================================*/
