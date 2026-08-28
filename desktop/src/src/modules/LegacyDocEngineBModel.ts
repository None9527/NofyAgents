/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBModel.ts — legacy-doc 内部引擎 [E6] 第 1 层：
 * 文档模型类型 + 节点/选区/节/字体/剪贴板 助手（解混淆重建 · D8 Stage B4 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版 36,535 行）
 * 覆盖区段：[E6] 前段 jsx 15114-16815（本文件语义重建；逐句对照为主，
 * 少量长分支按语义归纳——逐函数把握度见 LegacyDocEngineB.report.md §3）
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射（jsx 行）
 * ----------------------------------------------------------------------------
 *  标题/首字下沉/信头：
 *   Kl → rowHeightCacheKey (15114) | ql → xmlAttrValue (15119)
 *   Jl → headingLevelFromName (15124) | Yl → resolveStyleHeadingLevel (15131)
 *   Xl → applyHeadingRunStyles (15134) | Zl → parseDropCap (15151)
 *   Ql → hasFramePr (15208) | $l → detectLetterheadSide (15212)
 *   eu → neighborHasFramePr (15223) | tu → letterheadSideOfNode (15232)
 *   nu → collectLetterheadRun (15238) | ru/iu/au → 信头布局样式 (15262/15273/15279)
 *  通用助手：
 *   ou → clampNumber (15287) | su → isScrollableOverflow (15290)
 *   cu → findScrollContainer (15293) | lu → resolveCumulativeZoom (15303)
 *   uu → positiveNumber (15316) | du/fu → 页面主题样式/暗色反转滤镜 (15320)
 *   pu → joinDefined (15337) | mu..Lu → 表格手柄度量常量 (15341)
 *   Ru → scheduleFrame (15392) | zu → normalizeMeasuredHeight (15401)
 *  表格行高测量核算：
 *   Bu → reconcileTableRowHeights (15404) | Vu → resolveMeasuredRowHeights (15421)
 *   Hu → buildPaginationSnapshot (15444) | Uu → samePaginationSnapshot (15461)
 *   Wu → validateMeasuredHeightPrefix (15467)
 *  DOM 选区 ↔ 偏移：
 *   Gu → placeCaretAtEnd (15494) | Ku → selectionOffsetsWithin (15500)
 *   qu → rangeOffsetsWithin (15525) | Ju → selectTextRange (15547)
 *  右键菜单项表：
 *   Yu → TABLE_CONTEXT_MENU_ITEMS (15583) | Xu → isMacPlatform (15608)
 *   Zu → platformShortcut (15618) | Qu → CLIPBOARD_MENU_ITEMS (15621)
 *   $u → IMAGE_ORDER_MENU_ITEMS (15632) | ed → IMAGE_WRAP_MENU_ITEMS (15655)
 *  OPC / 嵌入字体：
 *   td..ad → z-index 层常量 (15688) | od → defaultTableBorders (15691)
 *   ld → twipsToPxRounded (15727) | ud → pointsToPx (15730)
 *   dd → relsPartPath (15733) | fd → resolvePartPath (15739)
 *   pd → parseRelationships (15754) | md → decryptEmbeddedFont (15767)
 *   hd → extractEmbeddedFonts (15776)
 *  分节/分栏/页码：
 *   gd → parseSectionColumns (15819) | _d → sectionContentWidthPx (15854)
 *   vd → sectionStartPageNumber (15861) | yd → sectionStartPageNumberOrUndefined (15870)
 *   bd → sectionPageNumberFormat (15879) | xd → sectionBreakType (15884)
 *   Sd → normalizeHeaderFooterRefType (15889) | Cd → dedupeHeaderFooterRefs (15893)
 *   wd → dedupeSectionHeaderFooters (15905) | Td → normalizeDocumentSections (15908)
 *  页眉/页脚浮动图占位核算：
 *   Ed → nodeHasHeavyContent (15927) | Dd/Od → 页眉/页脚含重内容 (15930/15933)
 *   kd → floatingImageTopPx (15936) | Ad → isAboveDocumentImage (15945)
 *   jd → paragraphFloatingImageTop (15948) | Md → minFloatingImageTop (15960)
 *   Nd → floatingImageReservedHeight (15968) | Pd → measureHeaderHeight (15996)
 *   Fd → measureFooterHeight (16014) | Id → resolvePageBodyHeight (16040)
 *  分页身份/度量：
 *   Ld → maxRenderedBottomPx (16079) | Rd → reconcilePageHeights (16085)
 *   zd → segmentIdentityKey (16095) | Bd → pageIdentityKey (16101)
 *   Vd → buildSectionPageMetrics (16104) | Hd → sectionIndexForNode (16129)
 *   Ud → scaleSectionMetrics (16135) | Wd → scaleHeightList (16141)
 *   Gd → resolvePageContentHeight (16144) | Kd → resolveRenderBodyHeight (16152)
 *   qd → pageIsOnlySplitSegments (16163) | Jd → estimateFootnoteHeight (16166)
 *   Yd → collectPageFootnotes (16181) | Xd → paginateWithFootnotes (16191)
 *  DOM 位置解析 / 表格选区：
 *   Zd → parseIndexAttr (16214) | Qd → parseParagraphDomLocation (16218)
 *   $d → parseTableCellDomLocation (16242) | ef → normalizeCellRange (16255)
 *   tf → isCollapsedCellSelection (16263) | nf → sameCellSelection (16266)
 *   rf → cellSelectionContains (16269) | af → rangeTouchesTable (16274)
 *   of → enumerateSelectedCells (16277) | sf → tableFirstLastCell (16294)
 *   cf → selectionCoversTable (16316) | lf → rangeTextLength (16329)
 *   uf → compareLocations (16335) | df → compareTextPositions (16338)
 *   ff → normalizeTextRange (16342)
 *  起始模型 / 文本助手：
 *   pf → STARTER_DOCX_MODEL (16351) | mf → cloneModel (16439)
 *   hf → createStarterModel (16442) | gf → textChildren (16445)
 *   _f → paragraphText (16448) | vf → nodesHaveExplicitFont (16451)
 *   yf → firstExplicitFontFamily (16454) | bf → resolveDocumentFontFamily (16470)
 *   xf → flattenTabLayouts (16489) | Sf → elementToPlainText (16511)
 *   Cf → elementToClipboardText (16520) | wf → htmlToPlainText (16530)
 *   Tf → htmlToClipboardText (16536) | Ef → renderStaticMarkup (16541)
 *   Df → formFieldDisplayText (16544) | Of → firstTextRunStyle (16558)
 *  节点谓词族：
 *   kf/Af → isParagraph/isTable (16563/16566) | jf/Mf → 段落收集 (16569/16574)
 *   Nf → nodesContainImage (16587) | Pf → paragraphHasImage (16597)
 *   Ff → paragraphIsTextBoxCarrier (16599) | If → paragraphIsImageOnly (16603)
 *   Lf → paragraphIsFloatingImageOnly (16615) | Rf → paragraphIsImagesAndText (16626)
 *   zf → paragraphIsBehindDocImages (16636) | Bf → isBehindDocImageOf (16643)
 *   Vf → paragraphIsCoverCandidate (16646) | Hf → paragraphHasPageAnchoredImage (16648)
 *   Uf → paragraphHasFloatingImage (16655) | Wf → collectHeadingColors (16657)
 *   Gf → nodesContainFullWidthImage (16699) | Kf → nodesContainPageFloatingImage (16713)
 *   qf → paragraphHasFormField (16717) | Jf → paragraphHasCheckbox (16719)
 *   Yf → paragraphHasVisibleText (16721) | Xf → normalizeComparableText (16725)
 *   Zf → textBoxInnerText (16731) | Qf → textDuplicatedInTextBox (16738)
 *   $f → paragraphIsWhitespaceOnly (16747) | ep → paragraphHasSectionBreak (16749)
 *   tp → imageIsFullPageCover (16751) | np → paragraphHasFullPageCover (16767)
 *   rp → imageIsPageBackground (16769) | ip → paragraphHasPageBackground (16777)
 *   ap → paragraphIsPlainIntro (16779) | op → documentStartsWithCovers (16781)
 *   sp → imageChildKey (16791) | cp → nodeIsRemovableCover (16792)
 *   lp → floatingLayerStyle (16795) | up → paragraphIsCheckboxYesNoRow (16810)
 *
 * ----------------------------------------------------------------------------
 * 外部契约（其他段/层提供，本文件以 declare 登记）
 * ----------------------------------------------------------------------------
 *   chunk-YE7GQOST：deepCloneModel（h）/ finalizeModel（g）/ newBlockId（v）
 *   [E2]/公共层：twipsToPxFloat（Br）/ 页面几何 parsePageGeometry（Yr）
 *   [E3]：字体名归一 normalizeFontFamily（m_）/ 颜色主题化 themeColor（p_）
 *   [E4]：段落行高估算（lg/zh）/ 编号标签（Zv/Xv/$v/ny/ey/qv/Jv/Uv/ty）等
 * ============================================================================
 */

import {
  MIN_BLOCK_HEIGHT_PX,
  FLOATING_IMAGE_CLEARANCE_PX,
  HEADER_SPACING_ADJUST_PX,
  FOOTER_OVERLAP_TOLERANCE_PX,
  FOOTER_CLEARANCE_A_PX,
  FOOTER_CLEARANCE_B_PX,
  FOOTER_CLEARANCE_C_PX,
  INITIAL_PAGE_NUMBER,
  FALLBACK_FONT_FAMILY,
  LETTERHEAD_INDENT_MIN_TWIPS,
  LETTERHEAD_INDENT_MAX_TWIPS,
  LETTERHEAD_TEXT_MAX_CHARS,
  FRAME_PR_NEIGHBOR_RADIUS,
  SECTION_PROPS_REGEX,
  SECTION_TYPE_REGEX,
  BOOKMARK_START_REGEX,
  FOOTNOTE_REFERENCE_REGEX,
  ENDNOTE_REFERENCE_REGEX,
  THUMBNAIL_HEADING_METRICS,
  boundedCacheSet,
  dropCapCache,
  paragraphIndentCache,
  type ThumbnailHeadingMetrics,
} from "./LegacyDocEngineBThumbnails";

/* ============================================================================
 * §0 模型类型（按引擎用法还原的最小完备契约）
 * ==========================================================================*/

/** 运行样式（run/text 级） */
export interface DocxRunStyle {
  fontFamily?: string;
  fontSizePt?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  backgroundColor?: string;
  highlight?: string;
  verticalAlign?: `superscript` | `subscript`;
  link?: string;
  [key: string]: unknown;
}

/** 段落间距 */
export interface DocxParagraphSpacing {
  beforeTwips?: number;
  afterTwips?: number;
  lineTwips?: number;
  lineRule?: `auto` | `atLeast` | `exact`;
  [key: string]: unknown;
}

/** 段落缩进 */
export interface DocxParagraphIndent {
  leftTwips?: number;
  rightTwips?: number;
  firstLineTwips?: number;
  hangingTwips?: number;
  [key: string]: unknown;
}

/** 边框（单边） */
export interface DocxBorderSpec {
  type?: string;
  sizeEighthPt?: number;
  spacePt?: number;
  color?: string;
  [key: string]: unknown;
}

/** 首字下沉（framePr 解析结果） */
export interface DocxDropCap {
  type: `drop` | `margin`;
  lines?: number;
  wrap?: string;
  horizontalAnchor?: string;
  verticalAnchor?: string;
  xTwips?: number;
  yTwips?: number;
  horizontalSpaceTwips?: number;
  verticalSpaceTwips?: number;
  [key: string]: unknown;
}

/** 浮动图片参数（w:anchor 解析结果） */
export interface DocxFloatingImage {
  behindDocument?: boolean;
  wrapType?: string;
  horizontalRelativeTo?: string;
  verticalRelativeTo?: string;
  horizontalAlign?: string;
  xPx?: number;
  yPx?: number;
  distLPx?: number;
  distRPx?: number;
  distTPx?: number;
  distBPx?: number;
  zIndex?: number;
  [key: string]: unknown;
}

/** 图片子节点 */
export interface DocxImageNode {
  type: `image`;
  src?: string;
  alt?: string;
  contentType?: string;
  data?: Uint8Array;
  widthPx?: number;
  heightPx?: number;
  crop?: { leftFraction?: number; topFraction?: number; rightFraction?: number; bottomFraction?: number };
  floating?: DocxFloatingImage;
  syntheticTextBox?: boolean;
  textBoxText?: string;
  cssFilter?: string;
  cssOpacity?: number;
  sourceXml?: string;
  [key: string]: unknown;
}

/** 表单域子节点 */
export interface DocxFormFieldNode {
  type: `form-field`;
  fieldType?: `checkbox` | `dropdown` | `date` | `text`;
  checked?: boolean;
  value?: string;
  options?: { displayText?: string; value?: string }[];
  title?: string;
  checkedSymbol?: string;
  uncheckedSymbol?: string;
  widget?: { checkbox?: { defaultChecked?: boolean; sizeMode?: string; sizePt?: number }; text?: { defaultText?: string }; [key: string]: unknown };
  style?: DocxRunStyle;
  sourceXml?: string;
  [key: string]: unknown;
}

/** 文本子节点 */
export interface DocxTextNode {
  type: `text`;
  text: string;
  style?: DocxRunStyle;
  link?: string;
  [key: string]: unknown;
}

export type DocxParagraphChild = DocxTextNode | DocxImageNode | DocxFormFieldNode | { type: string; [key: string]: unknown };

/** 段落样式 */
export interface DocxParagraphStyle {
  align?: `left` | `right` | `center` | `justify` | `both`;
  headingLevel?: number;
  styleId?: string;
  styleName?: string;
  spacing?: DocxParagraphSpacing;
  indent?: DocxParagraphIndent;
  borders?: Record<string, DocxBorderSpec | undefined>;
  backgroundColor?: string;
  numbering?: { numId: number; ilvl?: number; [key: string]: unknown };
  keepNext?: boolean;
  pageBreakBefore?: boolean;
  contextualSpacing?: boolean;
  dropCap?: DocxDropCap;
  tabStops?: { positionTwips?: number; kind?: string }[];
  [key: string]: unknown;
}

/** 段落节点 */
export interface DocxParagraphNode {
  type: `paragraph`;
  blockId?: string;
  children: DocxParagraphChild[];
  style?: DocxParagraphStyle;
  sourceXml?: string;
  [key: string]: unknown;
}

/** 表格单元格 */
export interface DocxTableCell {
  type: `table-cell`;
  nodes: DocxNode[];
  style?: {
    gridSpan?: number;
    rowSpan?: number;
    vMergeContinuation?: boolean;
    verticalAlign?: string;
    backgroundColor?: string;
    borders?: Record<string, DocxBorderSpec | undefined>;
    widthTwips?: number;
    marginTwips?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** 表格行 */
export interface DocxTableRow {
  type: `table-row`;
  cells: DocxTableCell[];
  style?: { heightTwips?: number; heightRule?: string; backgroundColor?: string; [key: string]: unknown };
  [key: string]: unknown;
}

/** 表格节点 */
export interface DocxTableNode {
  type: `table`;
  blockId?: string;
  rows: DocxTableRow[];
  style?: {
    borders?: Record<string, DocxBorderSpec | undefined>;
    widthTwips?: number;
    indentTwips?: number;
    layout?: `autofit` | `fixed`;
    floating?: Record<string, unknown>;
    columnWidthsTwips?: number[];
    cellMarginTwips?: unknown;
    [key: string]: unknown;
  };
  sourceXml?: string;
  [key: string]: unknown;
}

export type DocxNode = DocxParagraphNode | DocxTableNode | { type: string; [key: string]: unknown };

/** 页眉/页脚分节引用 */
export interface DocxHeaderFooterSection {
  partName: string;
  referenceType?: string;
  nodes: DocxNode[];
  [key: string]: unknown;
}

/** 文档节（sectPr） */
export interface DocxSection {
  startNodeIndex: number;
  sectionPropertiesXml?: string;
  headerSections: DocxHeaderFooterSection[];
  footerSections: DocxHeaderFooterSection[];
  [key: string]: unknown;
}

/** 段落样式定义（样式表条目） */
export interface DocxParagraphStyleDefinition {
  id: string;
  name?: string;
  headingLevel?: number;
  isDefault?: boolean;
  isPrimary?: boolean;
  align?: DocxParagraphStyle[`align`];
  runStyle?: DocxRunStyle;
  [key: string]: unknown;
}

/** 文档模型（引擎内部形态；经 [key: string]: unknown 与公共层 DocxModel 兼容） */
export interface DocxEditorModel {
  nodes: DocxNode[];
  metadata: {
    numberingDefinitions?: { instances: { numId: number; [key: string]: unknown }[]; [key: string]: unknown };
    paragraphStyles?: DocxParagraphStyleDefinition[];
    defaultParagraphStyleId?: string;
    headerSections?: DocxHeaderFooterSection[];
    footerSections?: DocxHeaderFooterSection[];
    sections?: DocxSection[];
    sectionPropertiesXml?: string;
    footnotes?: { id: string; nodes: DocxNode[]; [key: string]: unknown }[];
    endnotes?: { id: string; nodes: DocxNode[]; [key: string]: unknown }[];
    comments?: { id: number; author?: string; initials?: string; date?: string; text?: string; parentId?: number; resolved?: boolean; [key: string]: unknown }[];
    documentBackgroundColor?: string;
    documentPageCount?: number;
    compatibility?: { suppressSpacingBeforeAfterPageBreak?: boolean; [key: string]: unknown };
    sourceParts?: number;
    warnings?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* --- 选区/文本范围位置类型 --- */

export interface ParagraphLocation {
  kind: `paragraph`;
  nodeIndex: number;
  childIndex?: number;
}

export interface TableCellLocation {
  kind: `table-cell`;
  tableIndex: number;
  rowIndex: number;
  cellIndex: number;
  paragraphIndex: number;
  childIndex?: number;
}

export type DocxLocation = ParagraphLocation | TableCellLocation;

export type DocxSelection = { kind: `paragraph`; nodeIndex: number } | { kind: `table-cell`; tableIndex: number; rowIndex: number; cellIndex: number };

export interface DocxTextPosition {
  location: DocxLocation;
  offset: number;
}

export interface DocxTextRange {
  start: DocxTextPosition;
  end: DocxTextPosition;
}

/* --- 外部契约（跨段/跨 chunk） --- */

/** chunk-YE7GQOST `i` 导出：模型深拷贝（原 h） */
declare function deepCloneModel(model: DocxEditorModel): DocxEditorModel;
/** chunk-YE7GQOST `l` 导出：模型终结化（原 g；起始模型构造链用） */
declare function finalizeModel(model: DocxEditorModel): DocxEditorModel;
/** chunk-YE7GQOST `t` 导出：新块 id 生成器（原 v） */
declare function newBlockId(): string;
/** [E2]：段落行高估算（原 lg，jsx 18913；锚点登记） */
declare function estimateNodeHeight(node: DocxNode, contentWidthPx: number, gridLinePitchPx: number | undefined, extra?: unknown): number;
/** [E2]：段落外层高度（原 zh，jsx 18571；锚点登记） */
declare function paragraphOuterHeight(paragraph: DocxParagraphNode, contentWidthPx: number, gridLinePitchPx?: number): number;
/** [E3]：字体名归一（原 m_，jsx 20133；定义属 [E6] 区段，此处按语义实现） */
export function normalizeFontFamily(family: string | undefined): string | undefined {
  if (!family) return;
  const trimmed = family.trim();
  if (!trimmed) return;
  if (trimmed.includes(`,`)) return trimmed;
  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, ``);
  if (!unquoted) return;
  const escaped = unquoted.replace(/"/g, `\\"`);
  const head = /\s/.test(escaped) ? `"${escaped}"` : escaped;
  const lower = unquoted.toLowerCase();
  return `${head}, ${/(mono|consolas|courier|menlo|code)/.test(lower) ? `monospace` : /(times|cambria|georgia|garamond|baskerville|serif)/.test(lower) ? `serif` : `sans-serif`}`;
}

/** 主题感知颜色（原 p_，jsx 20127；暗色下近黑 → 浅灰） */
export function themeAwareColor(color: string | undefined, theme: `light` | `dark`): string | undefined {
  if (theme !== `dark`) return color;
  if (!color) return `#f3f4f6`;
  const lower = color.trim().toLowerCase();
  return lower === `#000` || lower === `#000000` || lower === `#111111` || lower === `#111827` || lower === `black` || lower === `rgb(0,0,0)` || lower === `rgb(0, 0, 0)` ? `#f3f4f6` : color;
}
/** [E4]：编号种类判定（原 Zv，锚点登记） */
declare function numberingKindOf(paragraph: DocxParagraphNode, definitions: unknown): `unordered` | `ordered` | undefined;
/** [E4]：编号段落判定（原 Xv） */
declare function isNumberedParagraph(paragraph: DocxParagraphNode): boolean;
/** [E4]：段落是否含制表位文本（原 cm 语义；锚点登记） */
declare function isEmptyTextParagraph(paragraph: DocxParagraphNode): boolean;
/** [E4]：图片浮动判定族（原 Ng=inline?/Kg=floating?；锚点登记） */
declare function isFloatingImageNode(image: DocxImageNode): boolean;
declare function isInlineImageNode(image: DocxImageNode): boolean;
/** [E4]：合成文本框文本提取（原 Zf 依赖 X_，锚点登记） */
declare function parseTextBoxParagraphs(sourceXml: string): { segments: { text: string }[] }[];
/** [E4]：边框可见性判定（原 Wy） */
export declare function isBorderVisible(border: DocxBorderSpec | undefined): boolean;
/** [E4]：段落样式浅克隆（原 ay） */
export declare function cloneParagraphStyle(style: DocxParagraphStyle | undefined, sourceXml?: string): DocxParagraphStyle | undefined;
/** [E4]：文本框图片渲染（原 tv；锚点登记） */
declare function renderTextBoxImage(image: DocxImageNode, a?: unknown, b?: unknown, c?: unknown, d?: unknown): string | undefined;
/** [E4]：浮动包装模式解析（原 Op） */
declare function resolveWrapMode(floating: DocxFloatingImage | undefined): { mode: string; [key: string]: unknown };
/** [E4]：浮动参数按模式构造（原 Ap） */
declare function buildFloatingForWrapMode(mode: string, current: DocxFloatingImage | undefined, extra?: unknown): DocxFloatingImage | undefined;
/** [E4]：字节 → base64（原 Ob） */
declare function bytesToBase64Url(bytes: Uint8Array): string;
/** [E4]：嵌套表定位（原 wy） */
declare function locateNestedTable(location: unknown): { hostTableIndex: number; hostRowIndex: number; hostCellIndex: number; rootContentIndex: number; descendants: { rowIndex: number; cellIndex: number; contentIndex: number }[] } | undefined;
/** [E4]：表格首选项（原 ox：表内首个可定位单元格） */
declare function firstTableCellLocation(model: DocxEditorModel, tableIndex: number): { kind: `table-cell`; tableIndex: number; rowIndex: number; cellIndex: number } | undefined;
/** [E4]：修订/批注模型操作（原 da/fa/Sa/pa；锚点登记） */
declare function acceptRevision(model: DocxEditorModel, target: { nodeIndex: number; revisionId: string; kind: string }): { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
declare function rejectRevision(model: DocxEditorModel, target: { nodeIndex: number; revisionId: string; kind: string }): { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
declare function addComment(model: DocxEditorModel, target: { nodeIndex: number; startOffset: number; endOffset: number; text: string; author?: string; initials?: string; date?: string }): { ok: true; model: DocxEditorModel; commentId: number } | { ok: false; reason: string };
declare function setCommentResolved(model: DocxEditorModel, commentId: number, resolved: boolean): { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
/** [E4]：DOCX 序列化（原 no，锚点登记） */
declare function serializeDocx(model: DocxEditorModel, pkg: unknown): Promise<Uint8Array>;
/** [E4]：分页主函数（原 Mg，jsx 19190；锚点登记，布局文件亦引用） */
declare function paginateDocument(
  model: DocxEditorModel,
  pageContentHeightPx: number,
  pageContentWidthPx: number,
  numberingDefinitions: unknown,
  sectionMetrics: SectionPageMetrics[],
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
): PageSegment[][];
/** [E2]：图片 src 解析（公共层 §4 _i） */
import { resolveImageSrc } from "./previewPaneOfficeLegacyDocContent";

/* --- 分页中间类型 --- */

export interface PageSegment {
  nodeIndex: number;
  tableRowRange?: { startRowIndex: number; endRowIndex: number };
  tableRowSlice?: { rowIndex: number; startOffsetPx: number; sliceHeightPx: number; totalRowHeightPx: number };
  paragraphLineRange?: { startLineIndex: number; endLineIndex: number; totalLineCount: number; lineHeightPx?: number };
}

export interface SectionPageMetrics {
  startNodeIndex: number;
  pageContentWidthPx: number;
  pageContentHeightPx: number;
  pageContentHeightMultiplier?: number;
  docGridLinePitchPx?: number;
}

/* ============================================================================
 * §1 表格行高缓存键（原 Kl，jsx 15114）
 * ==========================================================================*/

/** 原 Kl：(行高, 页内容高, 是否跨页) → 数值键（行高缓存索引用） */
export function rowHeightCacheKey(heightPx: number, pageContentHeightPx: number, spansPage = false): number {
  const normalized = normalizeRowHeightLocal(heightPx);
  const pageHeight = Number.isFinite(pageContentHeightPx) && pageContentHeightPx > 0 ? Math.max(0, Math.round(pageContentHeightPx)) : 0;
  return (normalized + 2) * 1e4 + pageHeight * 2 + +!!spansPage;
}

/** 原 Gl 语义局部副本（[E5] 已导出 normalizeRowHeightPx；此处避免循环按原式内联） */
function normalizeRowHeightLocal(height: number): number {
  return !Number.isFinite(height) || height <= 0 ? -1 : Math.max(1, Math.round(height));
}

/* ============================================================================
 * §2 标题/首字下沉/信头（原 ql..au，jsx 15119-15279）
 * ==========================================================================*/

/** 原 ql：XML 片段属性值提取（引号双轨） */
export function xmlAttrValue(xml: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  const match = xml.match(RegExp(`${escaped}=(?:"([^"]+)"|'([^']+)')`, `i`));
  return match?.[1] ?? match?.[2];
}

/** 原 Jl：样式名 → 标题级别（heading|h + 1-6） */
export function headingLevelFromName(name: string | undefined): number | undefined {
  if (!name) return;
  const match = name.match(/(?:^|[\s_-])(?:heading|h)\s*([1-6])(?:$|[\s_-])/i);
  if (!match?.[1]) return;
  const level = Number(match[1]);
  return level >= 1 && level <= 6 ? level : void 0;
}

/** 原 Yl：样式定义 → 标题级别（显式优先，名称回退） */
export function resolveStyleHeadingLevel(style: { headingLevel?: number; id?: string; name?: string }): number | undefined {
  return Number.isFinite(style.headingLevel) && (style.headingLevel as number) >= 1 && (style.headingLevel as number) <= 6
    ? style.headingLevel
    : headingLevelFromName(style.id) ?? headingLevelFromName(style.name);
}

/** 原 Xl：样式表 → 附加标题 run 样式（$s 度量并入，显式 runStyle 优先） */
export function applyHeadingRunStyles(definitions: DocxParagraphStyleDefinition[]): DocxParagraphStyleDefinition[] {
  return definitions.map((definition) => {
    const level = resolveStyleHeadingLevel(definition);
    const metrics = level ? THUMBNAIL_HEADING_METRICS[level] : void 0;
    const runStyle = metrics ? { ...metrics, ...(definition.runStyle ?? {}) } : definition.runStyle;
    const styleChanged = runStyle !== definition.runStyle || (metrics !== void 0 && definition.runStyle === void 0);
    const levelChanged = level !== definition.headingLevel;
    return !styleChanged && !levelChanged ? definition : { ...definition, headingLevel: level, runStyle };
  });
}

/** 原 Zl：段落首字下沉解析（style.dropCap 优先；否则 framePr，缓存 Fl） */
export function parseDropCap(paragraph: DocxParagraphNode): DocxDropCap | undefined {
  if (paragraph.style?.dropCap) return paragraph.style.dropCap as DocxDropCap;
  const xml = paragraph.sourceXml ?? ``;
  if (!xml) return;
  const cached = dropCapCache.get(xml);
  if (cached !== void 0) return (cached as DocxDropCap | null) ?? void 0;
  const framePr = xml.match(/<w:framePr\b[^>]*\/?>/i)?.[0];
  if (!framePr) {
    boundedCacheSet(dropCapCache, xml, null);
    return;
  }
  const dropCapKind = xmlAttrValue(framePr, `w:dropCap`)?.trim().toLowerCase();
  let type: `drop` | `margin` | undefined;
  if ((dropCapKind === `drop` || dropCapKind === `margin`) && (type = dropCapKind), !type) {
    boundedCacheSet(dropCapCache, xml, null);
    return;
  }
  const linesRaw = xmlAttrValue(framePr, `w:lines`);
  const lines = linesRaw ? Number(linesRaw) : NaN;
  const wrap = xmlAttrValue(framePr, `w:wrap`)?.trim();
  const hAnchor = xmlAttrValue(framePr, `w:hAnchor`)?.trim();
  const vAnchor = xmlAttrValue(framePr, `w:vAnchor`)?.trim();
  const x = xmlAttrValue(framePr, `w:x`) ? Number(xmlAttrValue(framePr, `w:x`)) : NaN;
  const y = xmlAttrValue(framePr, `w:y`) ? Number(xmlAttrValue(framePr, `w:y`)) : NaN;
  const hSpace = xmlAttrValue(framePr, `w:hSpace`) ? Number(xmlAttrValue(framePr, `w:hSpace`)) : NaN;
  const vSpace = xmlAttrValue(framePr, `w:vSpace`) ? Number(xmlAttrValue(framePr, `w:vSpace`)) : NaN;
  const result: DocxDropCap = {
    type,
    lines: Number.isFinite(lines) && lines > 0 ? Math.round(lines) : void 0,
    ...(wrap ? { wrap } : void 0),
    ...(hAnchor ? { horizontalAnchor: hAnchor } : void 0),
    ...(vAnchor ? { verticalAnchor: vAnchor } : void 0),
    ...(Number.isFinite(x) ? { xTwips: Math.round(x) } : void 0),
    ...(Number.isFinite(y) ? { yTwips: Math.round(y) } : void 0),
    ...(Number.isFinite(hSpace) ? { horizontalSpaceTwips: Math.round(hSpace) } : void 0),
    ...(Number.isFinite(vSpace) ? { verticalSpaceTwips: Math.round(vSpace) } : void 0),
  };
  boundedCacheSet(dropCapCache, xml, result);
  return result;
}

/** 原 Ql：段落含 framePr 判定 */
export function hasFramePr(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  return xml ? /<w:framePr\b[^>]*\/?>/i.test(xml) : false;
}

/** 原 $l：信头双栏判定——左/右缩进落在 [900,4200] twips 区间者判为该侧 */
export function detectLetterheadSide(paragraph: DocxParagraphNode): `left` | `right` | undefined {
  const leftTwips = paragraph.style?.indent?.leftTwips;
  const rightTwips = paragraph.style?.indent?.rightTwips;
  const left = Number.isFinite(leftTwips) && (leftTwips as number) > 0 ? Math.round(leftTwips as number) : 0;
  const right = Number.isFinite(rightTwips) && (rightTwips as number) > 0 ? Math.round(rightTwips as number) : 0;
  const rightInRange = right >= LETTERHEAD_INDENT_MIN_TWIPS && right <= LETTERHEAD_INDENT_MAX_TWIPS;
  const leftInRange = left >= LETTERHEAD_INDENT_MIN_TWIPS && left <= LETTERHEAD_INDENT_MAX_TWIPS;
  if (rightInRange && !leftInRange) return `left`;
  if (leftInRange && !rightInRange) return `right`;
  if (rightInRange && leftInRange) return right >= left ? `left` : `right`;
}

/** 原 eu：邻域（±3）内存在 framePr 段落判定 */
export function neighborHasFramePr(nodes: DocxNode[], index: number): boolean {
  const start = Math.max(0, index - FRAME_PR_NEIGHBOR_RADIUS);
  const end = Math.min(nodes.length - 1, index + FRAME_PR_NEIGHBOR_RADIUS);
  for (let i = start; i <= end; i += 1) {
    const node = nodes[i];
    if (!(!node || node.type !== `paragraph`) && hasFramePr(node as DocxParagraphNode)) return true;
  }
  return false;
}

/** 原 tu：节点信头侧判定（文本短（≤96 字符）且自身/邻域有 framePr） */
export function letterheadSideOfNode(nodes: DocxNode[], index: number): `left` | `right` | undefined {
  const node = nodes[index];
  if (!node || node.type !== `paragraph`) return;
  const side = detectLetterheadSide(node as DocxParagraphNode);
  if (side && !(paragraphText(node as DocxParagraphNode).replace(/\s+/g, ` `).trim().length > LETTERHEAD_TEXT_MAX_CHARS) && (hasFramePr(node as DocxParagraphNode) || neighborHasFramePr(nodes, index))) return side;
}

/** 信头连续段收集结果（原 nu 返回类型） */
export interface LetterheadRun {
  startOffset: number;
  endOffset: number;
  leftSegments: PageSegment[];
  rightSegments: PageSegment[];
  entries: { segment: PageSegment; side: `left` | `right` }[];
}

/** 原 nu：自偏移起收集左右交替的信头段序列（左右均需非空；跨行/跨表即止） */
export function collectLetterheadRun(nodes: DocxNode[], segments: PageSegment[], offset: number): LetterheadRun | undefined {
  if (offset < 0 || offset >= segments.length) return;
  const leftSegments: PageSegment[] = [];
  const rightSegments: PageSegment[] = [];
  const entries: { segment: PageSegment; side: `left` | `right` }[] = [];
  let cursor = offset;
  for (; cursor < segments.length; ) {
    const segment = segments[cursor];
    if (!segment || segment.tableRowRange || pageIsOnlySplitSegmentsLocal(segment.paragraphLineRange)) break;
    const side = letterheadSideOfNode(nodes, segment.nodeIndex);
    if (!side) break;
    side === `left` ? leftSegments.push(segment) : rightSegments.push(segment);
    entries.push({ segment, side });
    cursor += 1;
  }
  if (!(cursor <= offset || leftSegments.length === 0 || rightSegments.length === 0))
    return { startOffset: offset, endOffset: cursor, leftSegments, rightSegments, entries };
}

function pageIsOnlySplitSegmentsLocal(range: PageSegment[`paragraphLineRange`]): boolean {
  return !!range && range.startLineIndex > 0;
}

/** 原 ru：信头双栏网格容器样式 */
export function letterheadGridStyle(): Record<string, string | number> {
  return {
    display: `grid`,
    gridTemplateColumns: `1fr 1fr`,
    columnGap: 28,
    alignItems: `start`,
    width: `100%`,
    maxWidth: `100%`,
    boxSizing: `border-box`,
  };
}

/** 原 iu：信头栏目样式 */
export function letterheadColumnStyle(): Record<string, string | number> {
  return { minWidth: 0, maxWidth: `100%` };
}

/** 原 au：信头容器样式（可抑制双栏布局） */
export function letterheadContainerStyle(options?: { suppressLetterheadColumnLayout?: boolean }): Record<string, string | number> {
  return options?.suppressLetterheadColumnLayout
    ? { width: `100%`, boxSizing: `border-box`, marginLeft: 0, marginRight: 0 }
    : {};
}

/* ============================================================================
 * §3 通用助手（原 ou..pu，jsx 15287-15337）
 * ==========================================================================*/

/** 原 ou：数值夹取 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** 原 su：可滚动 overflow 判定 */
export function isScrollableOverflow(value: string): boolean {
  return value === `auto` || value === `scroll` || value === `overlay` || value === `hidden`;
}

/** 原 cu：向上查找滚动容器（回退 scrollingElement/documentElement） */
export function findScrollContainer(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element;
  for (; current; ) {
    const computed = window.getComputedStyle(current);
    if (isScrollableOverflow(computed.overflowY) || isScrollableOverflow(computed.overflow)) return current;
    current = current.parentElement;
  }
  const scrolling = typeof document < `u` ? document.scrollingElement : null;
  return scrolling instanceof HTMLElement ? scrolling : typeof document < `u` ? document.documentElement : null;
}

/** 原 lu：祖先链 zoom 累积（CSS zoom 归一化） */
export function resolveCumulativeZoom(element: HTMLElement): number {
  let current: HTMLElement | null = element;
  let zoom = 1;
  for (; current; ) {
    const value = window.getComputedStyle(current).zoom;
    if (value && value !== `normal`) {
      const parsed = Number.parseFloat(value);
      Number.isFinite(parsed) && parsed > 0 && (zoom *= parsed);
    }
    current = current.parentElement;
  }
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

/** 原 uu：正数归一（非法 → undefined） */
export function positiveNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}

/* ============================================================================
 * §4 页面主题（原 du/fu，jsx 15320-15336）
 * ==========================================================================*/

/** 页面主题视觉样式（原 du） */
export const PAGE_THEME_STYLES: Record<`light` | `dark`, Record<string, string>> = {
  light: {
    backgroundColor: `#ffffff`,
    color: `#111827`,
    colorScheme: `light`,
    border: `none`,
    boxShadow: `0 2px 10px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.05)`,
  },
  dark: {
    backgroundColor: `#0a0a0a`,
    color: `#f3f4f6`,
    colorScheme: `dark`,
    border: `none`,
    boxShadow: `0 2px 10px rgba(2, 6, 23, 0.55), 0 1px 2px rgba(2, 6, 23, 0.45)`,
  },
};

/** 原 fu：暗色主题下的浅色页面反转滤镜 */
export const DARK_THEME_INVERT_FILTER = `invert(0.95) hue-rotate(180deg) saturate(0.9) brightness(0.9) contrast(0.94)`;

/** 原 pu：去空白拼接（全空 → undefined） */
export function joinDefined(...parts: (string | undefined)[]): string | undefined {
  const trimmed = parts.map((part) => part?.trim()).filter((part) => !!part);
  return trimmed.length > 0 ? trimmed.join(` `) : void 0;
}

/* ============================================================================
 * §5 表格手柄度量（原 mu..Lu，jsx 15341-15391）
 * ==========================================================================*/

export const TABLE_HANDLE_SIZE_PX = 8; // 原 mu
export const TABLE_HANDLE_HIT_PX = 16; // 原 hu
export const TABLE_HANDLE_LINE_PX = 1; // 原 gu
export const TABLE_MOVE_HANDLE_SIZE_PX = 14; // 原 _u
export const TABLE_RESIZE_HANDLE_PX = 18; // 原 vu
export const TABLE_RESIZE_HIT_PX = 24; // 原 yu
export const TABLE_RESIZE_HIT_TOP_PX = TABLE_RESIZE_HANDLE_PX + 4; // 原 bu
export const TABLE_RESIZE_HIT_RIGHT_PX = TABLE_RESIZE_HANDLE_PX + 4; // 原 xu
export const TABLE_CORNER_HIT_INSET_PX = Math.ceil(TABLE_HANDLE_HIT_PX / 2) + 4; // 原 Su
export const TABLE_CORNER_HIT_SIZE_PX = TABLE_HANDLE_HIT_PX + 8; // 原 Cu
export const TABLE_HANDLE_LINE_OFFSET_PX = 0.5; // 原 wu
export const TABLE_HANDLE_BORDER_PX = 3; // 原 Tu

/** 角手柄圆点样式（原 Eu） */
export const TABLE_CORNER_HANDLE_STYLE: Record<string, string | number> = {
  width: TABLE_HANDLE_SIZE_PX,
  height: TABLE_HANDLE_SIZE_PX,
  borderRadius: 2,
  border: `1px solid #d4d4d8`,
  backgroundColor: `#ffffff`,
  boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
  pointerEvents: `none`,
};

/** 移动手柄方块样式（原 Du） */
export const TABLE_MOVE_HANDLE_STYLE: Record<string, string | number> = {
  width: TABLE_MOVE_HANDLE_SIZE_PX,
  height: TABLE_MOVE_HANDLE_SIZE_PX,
  borderRadius: 4,
  border: `1px solid #d4d4d8`,
  backgroundColor: `#ffffff`,
  boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)`,
  color: `#4b5563`,
  display: `grid`,
  placeItems: `center`,
  pointerEvents: `none`,
};

/** 页面表面基础样式（原 Ou；宽/高引用公共层缺省 900×1200） */
export const PAGE_SURFACE_BASE_STYLE: Record<string, string | number> = {
  position: `relative`,
  margin: `0 auto`,
  width: 900,
  minHeight: 1200,
  display: `block`,
  gap: 0,
  transition: `box-shadow 0.2s ease`,
};

export const TABLE_HOVER_SETTLE_MS = 300; // 原 ku
export const TABLE_ANNOTATION_MIN_PX = 48; // 原 Au
export const TABLE_ANNOTATION_GAP_A_PX = 12; // 原 ju
export const TABLE_ANNOTATION_GAP_B_PX = 4; // 原 Mu
export const TABLE_ANNOTATION_LANE_PX = 30; // 原 Nu
export const TABLE_ANNOTATION_PAD_PX = 8; // 原 Pu
export const TABLE_ANNOTATION_RADIUS_PX = 7; // 原 Fu
export const TABLE_ANNOTATION_ICON_PX = 5; // 原 Iu
export const TABLE_ANNOTATION_MAX_MS = 240; // 原 Lu

/** 原 Ru：requestAnimationFrame 回退调度 */
export function scheduleFrame(callback: () => void): void {
  if (typeof window < `u` && typeof window.requestAnimationFrame == `function`) {
    window.requestAnimationFrame(() => {
      callback();
    });
    return;
  }
  setTimeout(callback, 0);
}

/** 原 zu：测量高度归一（≥14 整数；非法 → 14） */
export function normalizeMeasuredHeight(height: number): number {
  return !Number.isFinite(height) || height <= 0 ? MIN_BLOCK_HEIGHT_PX : Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(height));
}

/* ============================================================================
 * §6 表格行高核算（原 Bu/Vu/Hu/Uu/Wu，jsx 15404-15493）
 * ==========================================================================*/

/** [E2]：表格自然行高估算（原 $h；锚点登记） */
declare function estimateTableRowHeights(
  table: DocxTableNode,
  contentWidthPx: number,
  numberingDefinitions: unknown,
  gridLinePitchPx: number | undefined,
  contentHeightPx?: number,
): number[];
/** [E2]：表格行头判定（原 Kh/Gh；锚点登记） */
declare function isHeaderRow(row: DocxTableRow): boolean;
declare function isRepeatHeaderRow(row: DocxTableRow): boolean;

/**
 * 原 Bu：测量行高 ↔ 模型行高 核算——按行高规则（exact/atLeast/auto）
 * 在 [自然高, 模型高+增量] 区间内夹取测量值。
 */
export function reconcileTableRowHeights(
  table: DocxTableNode,
  measuredHeights: number[],
  pageContentWidthPx: number | undefined,
  pageContentHeightPx: number | undefined,
  numberingDefinitions: unknown,
  gridLinePitchPx: number | undefined,
): number[] | undefined {
  if (measuredHeights.length !== table.rows.length) return;
  const natural = estimateTableRowHeights(table, pageContentWidthPx ?? 0, numberingDefinitions, gridLinePitchPx, pageContentHeightPx);
  if (natural.length === table.rows.length)
    return measuredHeights.map((measured, index) => {
      const row = table.rows[index];
      const normalized = normalizeMeasuredHeight(measured);
      const maxPageHeight = Number.isFinite(pageContentHeightPx) && (pageContentHeightPx as number) > 0 ? Math.max(120, Math.round(pageContentHeightPx as number)) : void 0;
      const naturalHeight = Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(natural[index] ?? MIN_BLOCK_HEIGHT_PX));
      const modelHeightRaw = twipsToPxRoundedFloat(row.style?.heightTwips);
      const modelHeight = Number.isFinite(modelHeightRaw) && (modelHeightRaw as number) > 0 ? Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(modelHeightRaw as number)) : void 0;
      const growth = isRepeatHeaderRow(row) ? Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(naturalHeight * 0.2)) : Math.max(4, Math.round(MIN_BLOCK_HEIGHT_PX * 0.5));
      const floorHeight = modelHeight ?? MIN_BLOCK_HEIGHT_PX;
      if ((isHeaderRow(row) && row.style?.heightRule !== `exact`) || (Number.isFinite(maxPageHeight) && normalized > (maxPageHeight as number) + 2)) return Math.max(floorHeight, normalized);
      const cap = Math.max(naturalHeight, floorHeight);
      return clampNumber(normalized, cap, Math.max(cap, (modelHeight ?? naturalHeight) + growth));
    });
}

/** 原 Vu：按草稿活跃键/签名校验，产出表格测量行高表 */
export function resolveMeasuredRowHeights(
  nodes: DocxNode[],
  measuredByBlockId: Record<string, { rowHeightsPx?: number[]; contentSignature?: string }>,
  options?: {
    activeDraftKeys?: string[];
    allowMeasuredImportPagination?: boolean;
    allowContentSignatureValidatedTables?: boolean;
    pageContentWidthPxByNodeIndex?: Map<number, number>;
    pageContentHeightPxByNodeIndex?: Map<number, number>;
    numberingDefinitions?: unknown;
    docGridLinePitchPxByNodeIndex?: Map<number, number>;
  },
): Record<number, number[]> | undefined {
  const activeTableIndexes = new Set<number>();
  (options?.activeDraftKeys ?? []).forEach((key) => {
    const [head] = key.split(`:`);
    const parsed = Number.parseInt(head ?? ``, 10);
    Number.isFinite(parsed) && parsed >= 0 && activeTableIndexes.add(parsed);
  });
  const hasActiveDrafts = activeTableIndexes.size > 0;
  if (hasActiveDrafts === false && options?.allowMeasuredImportPagination !== true && options?.allowContentSignatureValidatedTables !== true) return;
  const result: Record<number, number[]> = {};
  nodes.forEach((node, index) => {
    if (node.type !== `table` || !(node as DocxTableNode).blockId) return;
    const table = node as DocxTableNode;
    const measured = measuredByBlockId[table.blockId as string];
    if (!measured || !Array.isArray(measured.rowHeightsPx) || measured.rowHeightsPx.length !== table.rows.length) return;
    const heights = measured.rowHeightsPx;
    if (hasActiveDrafts) {
      if (!activeTableIndexes.has(index)) return;
      result[index] = heights.map((height) => normalizeMeasuredHeight(height));
      return;
    }
    /* 原逻辑：!(允许导入分页) && 签名不符 → 跳过；否则核算采用 */
    if (options?.allowMeasuredImportPagination !== true && measured.contentSignature !== contentSignatureLocal(table)) return;
    result[index] =
      reconcileTableRowHeights(
        table,
        heights,
        options?.pageContentWidthPxByNodeIndex?.get(index),
        options?.pageContentHeightPxByNodeIndex?.get(index),
        options?.numberingDefinitions,
        options?.docGridLinePitchPxByNodeIndex?.get(index),
      ) ?? heights.map((height) => normalizeMeasuredHeight(height));
  });
  return Object.keys(result).length > 0 ? result : void 0;
}

/** [E4]：内容签名（原 qs，jsx 14889；锚点登记） */
declare function contentSignatureLocal(node: DocxNode): string;

/** 原 Hu：分页上下文快照（块级签名序列） */
export function buildPaginationSnapshot(
  nodes: DocxNode[],
  segments: PageSegment[],
  contextSignature: string,
): { contextSignature: string; blocks: { blockId?: string; contentSignature: string }[] } {
  const blocks: { blockId?: string; contentSignature: string }[] = [];
  let lastIndex: number | undefined;
  for (const segment of segments) {
    if (segment.nodeIndex === lastIndex) continue;
    lastIndex = segment.nodeIndex;
    const node = nodes[segment.nodeIndex];
    blocks.push({ blockId: (node as DocxTableNode | undefined)?.blockId, contentSignature: node ? contentSignatureLocal(node) : `` });
  }
  return { contextSignature, blocks };
}

/** 原 Uu：分页快照相等判定 */
export function samePaginationSnapshot(
  a: { contextSignature: string; blocks: { blockId?: string; contentSignature: string }[] } | undefined,
  b: { contextSignature: string; blocks: { blockId?: string; contentSignature: string }[] } | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b || a.contextSignature !== b.contextSignature || a.blocks.length !== b.blocks.length) return false;
  for (let i = 0; i < a.blocks.length; i += 1) if (a.blocks[i].blockId !== b.blocks[i].blockId || a.blocks[i].contentSignature !== b.blocks[i].contentSignature) return false;
  return true;
}

/** 原 Wu：测量页高序列前缀校验（逐页块签名比对；返回可信前缀） */
export function validateMeasuredHeightPrefix(
  nodes: DocxNode[],
  pages: PageSegment[][],
  snapshots: ({ contextSignature: string; blocks: { blockId?: string; contentSignature: string }[] } | undefined)[],
  contextSignature: string,
): PageSegment[][] | undefined {
  let cursor = 0;
  let lastBlockId: string | undefined;
  let matched = 0;
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const snapshot = snapshots[pageIndex];
    if (!snapshot || snapshot.contextSignature !== contextSignature || snapshot.blocks.length === 0) break;
    let ok = true;
    for (let blockIndex = 0; blockIndex < snapshot.blocks.length; blockIndex += 1) {
      const block = snapshot.blocks[blockIndex];
      if (!block.blockId) {
        ok = false;
        break;
      }
      if (blockIndex === 0 && block.blockId === lastBlockId) continue;
      const node = nodes[cursor];
      if (!node || (node as DocxTableNode).blockId !== block.blockId || contentSignatureLocal(node) !== block.contentSignature) {
        ok = false;
        break;
      }
      cursor += 1;
    }
    if (!ok) break;
    lastBlockId = snapshot.blocks[snapshot.blocks.length - 1]?.blockId;
    matched += 1;
  }
  if (matched !== 0) return matched >= pages.length ? pages : pages.slice(0, matched);
}

/* ============================================================================
 * §7 DOM 选区 ↔ 偏移（原 Gu..Ju，jsx 15494-15582）
 * ==========================================================================*/

/** 原 Gu：光标置于元素末尾 */
export function placeCaretAtEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** 编号标签排除后的片段文本长度（原 Ku/qu 内共用逻辑） */
function rangeTextLengthExcludingNumbering(fragment: DocumentFragment): number {
  fragment.querySelectorAll(`[data-docx-numbering-label='true']`).forEach((label) => {
    label.remove();
  });
  return fragment.textContent?.length ?? 0;
}

/** 原 Ku：当前 DOM 选区 → 元素内文本偏移（编号标签不计） */
export function selectionOffsetsWithin(element: HTMLElement): { start: number; end: number } | undefined {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (!(!element.contains(range.startContainer) || !element.contains(range.endContainer)))
    try {
      const measure = (boundary: Range): number => rangeTextLengthExcludingNumbering(boundary.cloneContents());
      const beforeStart = document.createRange();
      beforeStart.setStart(element, 0);
      beforeStart.setEnd(range.startContainer, range.startOffset);
      const beforeEnd = document.createRange();
      beforeEnd.setStart(element, 0);
      beforeEnd.setEnd(range.endContainer, range.endOffset);
      const start = measure(beforeStart);
      const end = measure(beforeEnd);
      return { start: Math.min(start, end), end: Math.max(start, end) };
    } catch {
      return;
    }
}

/** 原 qu：给定 Range → 元素内文本偏移（编号标签不计） */
export function rangeOffsetsWithin(element: HTMLElement, range: Range): { start: number; end: number } | undefined {
  if (!(!element.contains(range.startContainer) || !element.contains(range.endContainer)))
    try {
      const measure = (boundary: Range): number => rangeTextLengthExcludingNumbering(boundary.cloneContents());
      const beforeStart = document.createRange();
      beforeStart.setStart(element, 0);
      beforeStart.setEnd(range.startContainer, range.startOffset);
      const beforeEnd = document.createRange();
      beforeEnd.setStart(element, 0);
      beforeEnd.setEnd(range.endContainer, range.endOffset);
      const start = measure(beforeStart);
      const end = measure(beforeEnd);
      return { start: Math.min(start, end), end: Math.max(start, end) };
    } catch {
      return;
    }
}

/** 原 Ju：文本偏移 → DOM 选区（树遍历定位；编号标签文本跳过；失败置末尾） */
export function selectTextRange(element: HTMLElement, startOffset: number, endOffset: number): void {
  const selection = window.getSelection();
  if (!selection) return;
  const locate = (root: HTMLElement, offset: number): { node: Node; offset: number } => {
    const target = Math.max(0, Math.round(offset));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let consumed = 0;
    let current = walker.nextNode();
    for (; current; ) {
      if (current instanceof Text && current.parentElement?.closest(`[data-docx-numbering-label='true']`)) {
        current = walker.nextNode();
        continue;
      }
      const length = current.textContent?.length ?? 0;
      if (consumed + length >= target) return { node: current, offset: Math.max(0, target - consumed) };
      consumed += length;
      current = walker.nextNode();
    }
    return { node: root, offset: root.childNodes.length };
  };
  try {
    const range = document.createRange();
    const low = Math.max(0, Math.min(startOffset, endOffset));
    const high = Math.max(low, Math.max(startOffset, endOffset));
    const start = locate(element, low);
    const end = locate(element, high);
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    placeCaretAtEnd(element);
  }
}

/* ============================================================================
 * §8 右键菜单项表（原 Yu..ed，jsx 15583-15687）
 * ==========================================================================*/

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  checked?: boolean;
  disabled?: boolean;
  children?: ContextMenuItem[];
  [key: string]: unknown;
}

/** 原 Yu：表格右键菜单项 */
export const TABLE_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { id: `insert-row-above`, label: `Insert row above` },
  { id: `insert-row-below`, label: `Insert row below` },
  { id: `insert-column-left`, label: `Insert column left` },
  { id: `insert-column-right`, label: `Insert column right` },
  { id: `delete-row`, label: `Delete row`, destructive: true },
  { id: `delete-column`, label: `Delete column`, destructive: true },
  { id: `delete-table`, label: `Delete table`, destructive: true },
];

/** 原 Xu：Mac 平台判定（userAgentData/platform/userAgent 三路） */
export function isMacPlatform(): boolean {
  if (typeof navigator > `u`) return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const dataPlatform = typeof nav.userAgentData?.platform == `string` ? nav.userAgentData.platform : ``;
  const platform = typeof navigator.platform == `string` ? navigator.platform : ``;
  const userAgent = typeof navigator.userAgent == `string` ? navigator.userAgent : ``;
  const joined = `${dataPlatform} ${platform}`.toLowerCase();
  const agent = userAgent.toLowerCase();
  return /mac|iphone|ipad|ipod/.test(joined) || /macintosh|mac os x|iphone|ipad|ipod/.test(agent);
}

/** 原 Zu：平台快捷键标签（Mac ⌘ / 其余 Ctrl+） */
export function platformShortcut(key: string): string {
  return isMacPlatform() ? `\u2318${key}` : `Ctrl+${key}`;
}

/** 原 Qu：剪贴板菜单项 */
export const CLIPBOARD_MENU_ITEMS: ContextMenuItem[] = [
  { id: `cut`, label: `Cut`, shortcut: platformShortcut(`X`) },
  { id: `copy`, label: `Copy`, shortcut: platformShortcut(`C`) },
  { id: `paste`, label: `Paste`, shortcut: platformShortcut(`V`) },
];

/** 原 $u：图片层序菜单项（含子菜单） */
export const IMAGE_ORDER_MENU_ITEMS: ContextMenuItem[] = [
  {
    id: `image-bring-to-front`,
    label: `Bring to Front`,
    children: [
      { id: `image-bring-to-front`, label: `Bring to Front` },
      { id: `image-bring-forward`, label: `Bring Forward` },
    ],
  },
  {
    id: `image-send-to-back`,
    label: `Send to Back`,
    children: [
      { id: `image-send-to-back`, label: `Send to Back` },
      { id: `image-send-backward`, label: `Send Backward` },
    ],
  },
];

/** 原 ed：图片环绕菜单项（7 种环绕模式） */
export const IMAGE_WRAP_MENU_ITEMS: ({ actionId: string; label: string; mode: string; separatorBefore?: boolean })[] = [
  { actionId: `image-wrap-inline`, label: `In Line with Text`, mode: `inline`, separatorBefore: true },
  { actionId: `image-wrap-square`, label: `Square`, mode: `square` },
  { actionId: `image-wrap-tight`, label: `Tight`, mode: `tight` },
  { actionId: `image-wrap-through`, label: `Through`, mode: `through` },
  { actionId: `image-wrap-top-and-bottom`, label: `Top and Bottom`, mode: `topAndBottom` },
  { actionId: `image-wrap-behind-text`, label: `Behind Text`, mode: `behindText`, separatorBefore: true },
  { actionId: `image-wrap-in-front-of-text`, label: `In Front of Text`, mode: `inFrontOfText` },
];

/* ============================================================================
 * §9 z-index 层与表格缺省边框（原 td..od，jsx 15688-15724）
 * ==========================================================================*/

export const Z_LAYER_BASE = 0; // 原 td
export const Z_LAYER_MAX = 65536; // 原 nd
export const Z_LAYER_FLOATING_UNIT = 251658240; // 原 rd（z-index 量化单位）
export const Z_LAYER_FLOATING_BASE = Z_LAYER_FLOATING_UNIT; // 原 id
export const MIN_Z_INDEX = 1; // 原 ad

/** 原 od：新建表格缺省边框（六边 single 4/8pt #d1d5db） */
export function defaultTableBorders(): Record<string, DocxBorderSpec> {
  const side = (): DocxBorderSpec => ({ type: `single`, sizeEighthPt: 4, color: `#d1d5db` });
  return { top: side(), right: side(), bottom: side(), left: side(), insideH: side(), insideV: side() };
}

export const TABLE_NESTED_HANDLE_SIZE_PX = 8; // 原 sd
export const TABLE_NESTED_HANDLE_COLOR = `#000000`; // 原 cd

/* ============================================================================
 * §10 单位换算（原 ld/ud，jsx 15727-15732）
 * ==========================================================================*/

/** 原 ld：twips → px 四舍五入（1px=15twips） */
export function twipsToPxRounded(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.round((twips as number) / 15);
}

/** 原 ud：磅 → px（96/72，两位小数） */
export function pointsToPx(points: number | undefined): number | undefined {
  if (Number.isFinite(points)) return Math.max(0, Number((((points as number) * 96) / 72).toFixed(2)));
}

/* ============================================================================
 * §11 OPC 关系与嵌入字体（原 dd..hd，jsx 15733-15818）
 * ==========================================================================*/

/** 原 dd：部件路径 → 其 .rels 路径 */
export function relsPartPath(partPath: string): string {
  const segments = partPath.split(`/`);
  const fileName = segments.pop() ?? partPath;
  const directory = segments.join(`/`);
  return directory.length > 0 ? `${directory}/_rels/${fileName}.rels` : `_rels/${fileName}.rels`;
}

/** 原 fd：相对目标解析（绝对/协议路径原样；.. 上溯） */
export function resolvePartPath(basePartPath: string, target: string): string {
  if (/^[a-z]+:/i.test(target)) return target;
  const base = basePartPath.replace(/^\/+/, ``);
  if (target.startsWith(`/`)) return target.replace(/^\/+/, ``);
  const stack = base.split(`/`);
  stack.pop();
  target.split(`/`).forEach((segment) => {
    if (!(!segment || segment === `.`)) {
      if (segment === `..`) {
        stack.length > 0 && stack.pop();
        return;
      }
      stack.push(segment);
    }
  });
  return stack.join(`/`);
}

/** docx 包契约（[V2] parseDocx 结果的最小面） */
export interface DocxPackageParts {
  parts: Map<string, { content?: string }>;
  binaryAssets: Map<string, Uint8Array>;
}

/** 原 pd：部件关系表解析（Id → 解析后目标路径） */
export function parseRelationships(pkg: DocxPackageParts, partPath: string): Map<string, string> {
  const relationships = new Map<string, string>();
  const content = pkg.parts.get(relsPartPath(partPath))?.content;
  if (!content) return relationships;
  const regex = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/gi;
  let match: RegExpExecArray | null;
  for (; (match = regex.exec(content)); ) {
    const id = match[1]?.trim();
    const target = match[2]?.trim();
    !id || !target || relationships.set(id, resolvePartPath(partPath, target));
  }
  return relationships;
}

/** 原 md：嵌入字体解密（fontKey GUID 逆序 XOR；无键原样） */
export function decryptEmbeddedFont(bytes: Uint8Array, fontKey: string | undefined): ArrayBuffer {
  const copy = Uint8Array.from(bytes);
  const hex = (fontKey ?? ``).replace(/[{}-]/g, ``);
  if (!/^[0-9a-f]{32}$/i.test(hex)) return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
  const keyBytes = Uint8Array.from(hex.match(/../g)?.map((pair) => Number.parseInt(pair, 16)) ?? []).reverse();
  const count = Math.min(32, copy.length);
  for (let i = 0; i < count; i += 1) copy[i] ^= keyBytes[i % keyBytes.length] ?? 0;
  return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
}

/** 嵌入字体（原 hd 返回类型） */
export interface EmbeddedFont {
  family: string;
  style: string;
  weight: string;
  source: ArrayBuffer;
}

/** 原 hd：fontTable.xml → 嵌入字体提取（四种嵌入变体 × 全部字体族） */
export function extractEmbeddedFonts(pkg: DocxPackageParts): EmbeddedFont[] {
  const content = pkg.parts.get(`word/fontTable.xml`)?.content;
  if (!content) return [];
  const relationships = parseRelationships(pkg, `word/fontTable.xml`);
  const fonts: EmbeddedFont[] = [];
  const fontRegex = /<w:font\b[^>]*w:name="([^"]+)"[^>]*>([\s\S]*?)<\/w:font>/gi;
  const variants = [
    { tagName: `embedRegular`, style: `normal`, weight: `400` },
    { tagName: `embedBold`, style: `normal`, weight: `700` },
    { tagName: `embedItalic`, style: `italic`, weight: `400` },
    { tagName: `embedBoldItalic`, style: `italic`, weight: `700` },
  ];
  let match: RegExpExecArray | null;
  for (; (match = fontRegex.exec(content)); ) {
    const family = match[1]?.trim();
    const body = match[2] ?? ``;
    family &&
      variants.forEach((variant) => {
        const tag = body.match(RegExp(`<w:${variant.tagName}\\b[^>]*\\/?>`, `i`))?.[0] ?? ``;
        const relationshipId = xmlAttrValue(tag, `r:id`);
        if (!relationshipId) return;
        const target = relationships.get(relationshipId);
        const asset = target ? pkg.binaryAssets.get(target) : void 0;
        asset &&
          fonts.push({
            family,
            style: variant.style,
            weight: variant.weight,
            source: decryptEmbeddedFont(asset, xmlAttrValue(tag, `w:fontKey`)),
          });
      });
  }
  return fonts;
}

/* ============================================================================
 * §12 分栏/页码/分节（原 gd..Td，jsx 15819-15926）
 * ==========================================================================*/

/** 分节分栏（原 gd 返回类型） */
export interface SectionColumns {
  count: number;
  gapPx: number;
  widthsPx?: number[];
}

/** 原 gd：sectPr → 分栏解析（列数/栏距/逐栏宽；栏距缺省 720twips） */
export function parseSectionColumns(sectPr: string | undefined): SectionColumns | undefined {
  if (!sectPr) return;
  const cols = sectPr.match(/<w:cols\b[^>]*\/?>/i)?.[0];
  if (!cols) return;
  const numRaw = cols.match(/w:num="([\d.]+)"/i)?.[1];
  const count = numRaw ? Math.round(Number(numRaw)) : 1;
  if (!Number.isFinite(count) || count <= 1) return;
  const columnCount = Math.max(2, count);
  const colTags = [...sectPr.matchAll(/<w:col\b[^>]*\/>/gi)];
  const widthsTwips = colTags.map((match) => Number(match[0].match(/w:w="([\d.]+)"/i)?.[1])).filter((value) => Number.isFinite(value) && value > 0);
  const widthsPx = widthsTwips.map((value) => Math.max(1, Math.round(twipsToPxRoundedFloat(value) ?? 0)));
  const spaceOnCols = cols.match(/w:space="([\d.]+)"/i)?.[1];
  const spaceOnCol = colTags.map((match) => match[0].match(/w:space="([\d.]+)"/i)?.[1]).find((value) => value !== void 0);
  let spaceTwips = spaceOnCols === void 0 ? (spaceOnCol === void 0 ? void 0 : Number(spaceOnCol)) : Number(spaceOnCols);
  if (spaceTwips === void 0 && widthsTwips.length === columnCount) {
    const pageWidth = Number(sectPr.match(/<w:pgSz\b[^>]*w:w="([\d.]+)"/i)?.[1]);
    const margins = sectPr.match(/<w:pgMar\b[^>]*\/?>/i)?.[0];
    const marginLeft = Number(margins?.match(/w:left="([\d.-]+)"/i)?.[1]);
    const marginRight = Number(margins?.match(/w:right="([\d.-]+)"/i)?.[1]);
    if (Number.isFinite(pageWidth) && Number.isFinite(marginLeft) && Number.isFinite(marginRight)) {
      const contentWidth = pageWidth - marginLeft - marginRight;
      const sum = widthsTwips.reduce((acc, value) => acc + value, 0);
      spaceTwips = Math.max(0, (contentWidth - sum) / Math.max(1, columnCount - 1));
    }
  }
  (spaceTwips === void 0 || !Number.isFinite(spaceTwips)) && (spaceTwips = 720);
  const gapPx = twipsToPxRoundedFloat(spaceTwips) ?? 24;
  return {
    count: columnCount,
    gapPx: Math.max(0, gapPx),
    ...(widthsPx.length === columnCount ? { widthsPx } : void 0),
  };
}

/** twips→px 浮点（原 Br 语义；公共层 twipsToPx 为取整版，此处按引擎用法保留浮点） */
function twipsToPxRoundedFloat(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.max(0, Math.round((twips as number) / 15));
  return undefined;
}

/** 原 _d：节内容宽（扣除分栏总间距后按栏数均分；下限 120） */
export function sectionContentWidthPx(geometry: { pageWidthPx: number; marginsPx: { left: number; right: number } }, sectPr?: string): number {
  const full = Math.max(120, geometry.pageWidthPx - geometry.marginsPx.left - geometry.marginsPx.right);
  const columns = parseSectionColumns(sectPr);
  if (!columns) return full;
  const gaps = Math.max(0, columns.gapPx) * Math.max(0, columns.count - 1);
  return Math.max(120, Math.round((full - gaps) / columns.count));
}

/** 原 vd：节起始页码（缺省 1） */
export function sectionStartPageNumber(sectPr: string | undefined): number {
  if (!sectPr) return INITIAL_PAGE_NUMBER;
  const pgNumType = sectPr.match(/<w:pgNumType\b[^>]*\/?>/i)?.[0];
  if (!pgNumType) return INITIAL_PAGE_NUMBER;
  const start = pgNumType.match(/\bw:start="(\d+)"/i)?.[1];
  if (!start) return INITIAL_PAGE_NUMBER;
  const value = Number(start);
  return !Number.isFinite(value) || value <= 0 ? INITIAL_PAGE_NUMBER : Math.max(1, Math.round(value));
}

/** 原 yd：节起始页码（无 → undefined） */
export function sectionStartPageNumberOrUndefined(sectPr: string | undefined): number | undefined {
  if (!sectPr) return;
  const pgNumType = sectPr.match(/<w:pgNumType\b[^>]*\/?>/i)?.[0];
  if (!pgNumType) return;
  const start = pgNumType.match(/\bw:start="(\d+)"/i)?.[1];
  if (!start) return;
  const value = Number(start);
  if (!(!Number.isFinite(value) || value <= 0)) return Math.max(1, Math.round(value));
}

/** 原 bd：节页码格式（w:fmt） */
export function sectionPageNumberFormat(sectPr: string | undefined): string | undefined {
  if (!sectPr) return;
  const format = sectPr.match(/<w:pgNumType\b[^>]*\/?>/i)?.[0]?.match(/\bw:fmt="([^"]+)"/i)?.[1]?.trim();
  return format && format.length > 0 ? format : void 0;
}

/** 原 xd：分节符类型（小写归一） */
export function sectionBreakType(sectPr: string | undefined): string | undefined {
  if (!sectPr) return;
  const type = sectPr.match(/<w:type\b[^>]*w:val="([^"]+)"/i)?.[1]?.trim();
  return type && type.length > 0 ? type.toLowerCase() : void 0;
}

/** 原 Sd：页眉/页脚引用类型归一（空 → default） */
export function normalizeHeaderFooterRefType(type: string | undefined): string {
  const trimmed = type?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : `default`;
}

/** 原 Cd：按引用类型去重（后者覆盖前者） */
export function dedupeHeaderFooterRefs(sections: DocxSection[], field: `headerSections` | `footerSections`): DocxSection[] {
  const seen = new Map<string, DocxHeaderFooterSection>();
  return sections.map((section) => {
    const entries = section[field];
    entries.length > 0 &&
      entries.forEach((entry) => {
        seen.set(normalizeHeaderFooterRefType(entry.referenceType), entry);
      });
    return { ...section, [field]: [...seen.values()] };
  });
}

/** 原 wd：页眉/页脚双字段去重 */
export function dedupeSectionHeaderFooters(sections: DocxSection[]): DocxSection[] {
  return sections.length === 0 ? sections : dedupeHeaderFooterRefs(dedupeHeaderFooterRefs(sections, `headerSections`), `footerSections`);
}

/** 原 Td：模型 → 规整节序列（按起始节点排序；首节补 0；去重） */
export function normalizeDocumentSections(metadata: DocxEditorModel[`metadata`]): DocxSection[] {
  const sections = (metadata.sections ?? [])
    .map((section) => ({
      startNodeIndex: Number.isFinite(section.startNodeIndex) && section.startNodeIndex >= 0 ? Math.round(section.startNodeIndex) : 0,
      sectionPropertiesXml: section.sectionPropertiesXml,
      headerSections: section.headerSections ?? [],
      footerSections: section.footerSections ?? [],
    }))
    .sort((a, b) => a.startNodeIndex - b.startNodeIndex);
  return sections.length > 0
    ? (sections[0].startNodeIndex > 0 &&
        sections.unshift({
          startNodeIndex: 0,
          sectionPropertiesXml: sections[0].sectionPropertiesXml,
          headerSections: sections[0].headerSections,
          footerSections: sections[0].footerSections,
        }),
      dedupeSectionHeaderFooters(sections))
    : [
        {
          startNodeIndex: 0,
          sectionPropertiesXml: metadata.sectionPropertiesXml,
          headerSections: metadata.headerSections ?? [],
          footerSections: metadata.footerSections ?? [],
        },
      ];
}

/* ============================================================================
 * §13 页眉/页脚浮动图占位核算（原 Ed..Fd，jsx 15927-16039）
 * ==========================================================================*/

/** 原 Ed：节点重内容判定（表格/图片段落，浮动背景图除外） */
export function nodeHasHeavyContent(node: DocxNode): boolean {
  if (node.type !== `paragraph`) return false;
  const paragraph = node as DocxParagraphNode;
  if (paragraphHasVisibleText(paragraph) || paragraphHasFormField(paragraph)) return true;
  if (!paragraphHasImage(paragraph)) return false;
  return paragraph.children.some((child) =>
    child.type === `image` ? (!isFloatingImageNode(child as DocxImageNode) || isInlineImageNode(child as DocxImageNode) ? true : isAboveDocumentImage(child as DocxImageNode)) : false,
  );
}

/** 原 Dd：页眉节含重内容判定 */
export function headerSectionsHaveHeavyContent(section: DocxSection): boolean {
  return (section.headerSections ?? []).some((part) => (part.nodes ?? []).some((node) => node.type === `table` || nodeHasHeavyContent(node)));
}

/** 原 Od：页脚节含重内容判定 */
export function footerSectionsHaveHeavyContent(section: DocxSection): boolean {
  return (section.footerSections ?? []).some((part) => (part.nodes ?? []).some((node) => node.type === `table` || nodeHasHeavyContent(node)));
}

/** 原 kd：浮动图顶边（页/边距参照换算） */
export function floatingImageTopPx(image: DocxImageNode, geometry: { marginsPx: { top: number } }): number | undefined {
  if (!isFloatingImageNode(image) || !image.floating) return;
  const floating = image.floating;
  const relativeTo = floating.verticalRelativeTo?.trim().toLowerCase();
  if (Number.isFinite(floating.yPx)) {
    if (relativeTo === `page`) return Math.round(floating.yPx as number);
    if (relativeTo === `margin`) return Math.round((floating.yPx as number) + geometry.marginsPx.top);
  }
}

/** 原 Ad：非背景浮动图判定（在文档之上） */
export function isAboveDocumentImage(image: DocxImageNode): boolean {
  return isFloatingImageNode(image) && !!image.floating && image.floating?.behindDocument !== true;
}

/** 原 jd：段落内最高浮动图顶边 */
export function paragraphFloatingImageTop(paragraph: DocxParagraphNode, geometry: { marginsPx: { top: number } }): number | undefined {
  if (!paragraphHasImage(paragraph)) return;
  let top: number | undefined;
  paragraph.children.forEach((child) => {
    if (child.type !== `image` || !child.floating || !isAboveDocumentImage(child as DocxImageNode)) return;
    const image = child as DocxImageNode;
    const imageTop = floatingImageTopPx(image, geometry);
    if (!Number.isFinite(imageTop)) return;
    const distT = Math.max(0, Math.round((image.floating?.distTPx ?? 0) as number));
    const adjusted = Math.max(0, Math.round((imageTop as number) - distT));
    top = top === void 0 ? adjusted : Math.min(top, adjusted);
  });
  return top;
}

/** 原 Md：节点序列中最高浮动图顶边 */
export function minFloatingImageTop(nodes: DocxNode[], geometry: { marginsPx: { top: number } }): number | undefined {
  let top: number | undefined;
  nodes.forEach((node) => {
    if (node.type !== `paragraph`) return;
    const paragraphTop = paragraphFloatingImageTop(node as DocxParagraphNode, geometry);
    Number.isFinite(paragraphTop) && (top = top === void 0 ? Math.round(paragraphTop as number) : Math.min(top as number, Math.round(paragraphTop as number)));
  });
  return top;
}

/** 原 Nd：浮动图在页眉/页脚区域的占位高度 */
export function floatingImageReservedHeight(paragraph: DocxParagraphNode, geometry: { marginsPx: { top: number; bottom: number }; pageHeightPx: number; pageWidthPx: number; headerDistancePx?: number }, region: `header` | `footer`): number {
  if (!paragraphHasImage(paragraph)) return 0;
  const marginTop = geometry.marginsPx.top;
  const bodyBottom = geometry.pageHeightPx - geometry.marginsPx.bottom;
  if (region === `footer`) {
    const top = paragraphFloatingImageTop(paragraph, geometry);
    return Number.isFinite(top) ? Math.max(0, bodyBottom - Math.round(top as number) + FLOATING_IMAGE_CLEARANCE_PX) : 0;
  }
  return paragraph.children.reduce((acc: number, child: DocxParagraphChild) => {
    if (child.type !== `image` || !child.floating) return acc;
    const image = child as DocxImageNode;
    const floating = image.floating as DocxFloatingImage;
    const height = Number.isFinite(image.heightPx) && (image.heightPx as number) > 0 ? Math.round(image.heightPx as number) : Number.isFinite(image.widthPx) && (image.widthPx as number) > 0 ? Math.round(image.widthPx as number) : MIN_BLOCK_HEIGHT_PX;
    const distT = Math.max(0, Math.round((floating.distTPx ?? 0) as number));
    const distB = Math.max(0, Math.round((floating.distBPx ?? 0) as number));
    let top = floatingImageTopPx(image, geometry);
    if (!Number.isFinite(top)) {
      const relativeTo = floating.verticalRelativeTo?.trim().toLowerCase();
      region === `header` && (relativeTo === void 0 || relativeTo === `` || relativeTo === `paragraph` || relativeTo === `line`) && (top = Math.max(0, Math.round(geometry.headerDistancePx ?? geometry.marginsPx.top)) + Math.round((floating.yPx ?? 0) as number));
    }
    if (!Number.isFinite(top)) return acc;
    const topRounded = Math.round(top as number);
    const bottom = topRounded + height + distT + distB;
    const isFullWidthBackground = region === `header` && floating.behindDocument === true && Math.max(1, Math.round((image.widthPx ?? 0) as number)) >= Math.round(geometry.pageWidthPx * 0.5) && topRounded <= marginTop + 192 && bottom > marginTop;
    if (!isAboveDocumentImage(image) && !isFullWidthBackground) return acc;
    const overflow = Math.max(0, bottom - marginTop);
    return overflow <= 0 ? acc : Math.max(acc, overflow + FLOATING_IMAGE_CLEARANCE_PX);
  }, 0);
}

/** 原 Pd：页眉区高度核算（最高节的重内容行高和 + 页眉距修正） */
export function measureHeaderHeight(
  headerSections: DocxHeaderFooterSection[] | undefined,
  geometry: { pageWidthPx: number; pageHeightPx: number; marginsPx: { left: number; right: number; top: number; bottom: number }; headerDistancePx: number; docGridLinePitchPx?: number },
): number {
  const heavy = (headerSections ?? []).filter((part) => (part.nodes ?? []).some((node) => node.type === `table` || nodeHasHeavyContent(node)));
  if (heavy.length === 0) return 0;
  const contentWidth = Math.max(24, geometry.pageWidthPx - geometry.marginsPx.left - geometry.marginsPx.right);
  const total = heavy.reduce((max: number, part: DocxHeaderFooterSection) => {
    const heavyNodes = (part.nodes ?? []).filter((node) => node.type === `table` || nodeHasHeavyContent(node));
    if (heavyNodes.length === 0) return max;
    const height = heavyNodes.reduce((sum: number, node: DocxNode) => {
      const reserved = node.type === `paragraph` ? floatingImageReservedHeight(node as DocxParagraphNode, geometry, `header`) : 0;
      return sum + Math.max(estimateNodeHeight(node, contentWidth, void 0, geometry.docGridLinePitchPx), reserved);
    }, 0);
    const gaps = Math.max(0, heavyNodes.length - 1) * 8;
    return Math.max(max, Math.round(height + gaps));
  }, 0);
  if (total <= 0) return 0;
  const adjusted = total + geometry.headerDistancePx - geometry.marginsPx.top;
  return Math.max(0, Math.round(adjusted));
}

/** 原 Fd：页脚区高度核算（含浮动图占位与最小保留） */
export function measureFooterHeight(footerSections: DocxHeaderFooterSection[] | undefined, geometry: { pageWidthPx: number; pageHeightPx: number; marginsPx: { left: number; right: number; top: number; bottom: number }; footerDistancePx: number; docGridLinePitchPx?: number }): number {
  const heavy = (footerSections ?? []).filter((part) => (part.nodes ?? []).some((node) => node.type === `table` || nodeHasHeavyContent(node)));
  if (heavy.length === 0) return 0;
  const contentWidth = Math.max(24, geometry.pageWidthPx - geometry.marginsPx.left - geometry.marginsPx.right);
  const total = heavy.reduce((max: number, part: DocxHeaderFooterSection) => {
    const heavyNodes = (part.nodes ?? []).filter((node) => node.type === `table` || nodeHasHeavyContent(node));
    if (heavyNodes.length === 0) return max;
    const height = heavyNodes.reduce((sum: number, node: DocxNode) => {
      const reserved = node.type === `paragraph` ? floatingImageReservedHeight(node as DocxParagraphNode, geometry, `footer`) : 0;
      return sum + Math.max(estimateNodeHeight(node, contentWidth, void 0, geometry.docGridLinePitchPx), reserved);
    }, 0);
    const gaps = Math.max(0, heavyNodes.length - 1) * 8;
    return Math.max(max, Math.round(height + gaps));
  }, 0);
  if (total <= 0) return 0;
  const bodyBottom = geometry.pageHeightPx - geometry.marginsPx.bottom;
  const floatingTop = heavy.reduce((min: number | undefined, part: DocxHeaderFooterSection) => {
    const top = minFloatingImageTop(part.nodes ?? [], geometry);
    return Number.isFinite(top) ? (min === void 0 ? Math.round(top as number) : Math.min(min, Math.round(top as number))) : min;
  }, void 0);
  const hasFooterReserved = heavy.some((part) => (part.nodes ?? []).some((node) => node.type === `paragraph` && floatingImageReservedHeight(node as DocxParagraphNode, geometry, `footer`) > 0));
  const adjusted = total + geometry.footerDistancePx - geometry.marginsPx.bottom;
  const withClearance = Math.max(0, Math.round(adjusted + FOOTER_CLEARANCE_A_PX));
  const fromFloating = Number.isFinite(floatingTop) ? Math.max(0, Math.round(bodyBottom - Math.round(floatingTop as number) + FOOTER_CLEARANCE_B_PX)) : 0;
  return Math.max(total > 0 ? FOOTER_CLEARANCE_C_PX : 0, hasFooterReserved ? Math.max(withClearance, fromFloating, 8) : Math.max(withClearance, fromFloating));
}

/* ============================================================================
 * §14 页面主体高度（原 Id..qd，jsx 16040-16165）
 * ==========================================================================*/

/** 原 Id：页主体高度核算（页眉/页脚占位 + 溢出修正） */
export function resolvePageBodyHeight(input: {
  pageLayout: { pageHeightPx: number; marginsPx: { bottom: number } };
  fallbackHeightPx: number;
  headerHeightPx: number;
  currentMeasuredHeightPx?: number;
  bodyTopPx?: number;
  bodyRenderedBottomPx?: number;
  footerTopPx?: number;
  skipBodyBottomAdjustment?: boolean;
}): { heightPx: number; bodyOverrunsFooter: boolean } {
  const { pageLayout, fallbackHeightPx, headerHeightPx, currentMeasuredHeightPx, bodyTopPx, bodyRenderedBottomPx, footerTopPx, skipBodyBottomAdjustment = false } = input;
  const renderedBottom = skipBodyBottomAdjustment ? void 0 : bodyRenderedBottomPx;
  const measuredHeight = skipBodyBottomAdjustment ? void 0 : currentMeasuredHeightPx;
  const bodyBottomLimit = pageLayout.pageHeightPx - pageLayout.marginsPx.bottom;
  const footerReserved = Number.isFinite(footerTopPx) ? Math.max(0, Math.round(bodyBottomLimit - (footerTopPx as number))) : 0;
  const footerLimit = bodyBottomLimit - footerReserved;
  const footerAdjusted = Number.isFinite(footerTopPx) && footerReserved === 0 ? Math.round((footerTopPx as number) - FOOTER_CLEARANCE_A_PX) : void 0;
  const effectiveLimit = Number.isFinite(footerAdjusted) ? Math.min(footerLimit, footerAdjusted as number) : footerLimit;
  const overflow = Number.isFinite(renderedBottom) ? Math.max(0, Math.round((renderedBottom as number) - effectiveLimit)) : 0;
  const underflow = Number.isFinite(renderedBottom) ? Math.max(0, Math.round(effectiveLimit - (renderedBottom as number))) : void 0;
  const shortfallPenalty = Number.isFinite(footerTopPx) && Number.isFinite(underflow) ? Math.max(0, FOOTER_OVERLAP_TOLERANCE_PX - (underflow as number)) : 0;
  const available = Math.max(0, effectiveLimit - shortfallPenalty);
  const measuredFallback = overflow > 0 && !Number.isFinite(bodyTopPx) && Number.isFinite(measuredHeight) && (measuredHeight as number) > 0 ? Math.max(120, Math.round((measuredHeight as number) - overflow - shortfallPenalty)) : void 0;
  const overruns = overflow > 0;
  if (Number.isFinite(bodyTopPx) && available > (bodyTopPx as number)) {
    const headerDeduction = headerHeightPx > 0 ? HEADER_SPACING_ADJUST_PX : 0;
    const needed = Math.max(120, Math.round(available - (bodyTopPx as number)));
    return {
      heightPx: Number.isFinite(measuredFallback) ? Math.min(Math.max(120, needed - headerDeduction), Math.max(120, (measuredFallback as number) - headerDeduction)) : Math.max(120, needed - headerDeduction),
      bodyOverrunsFooter: overruns,
    };
  }
  const headerDeduction = headerHeightPx > 0 ? HEADER_SPACING_ADJUST_PX : 0;
  const fallback = Math.max(120, fallbackHeightPx - headerHeightPx - headerDeduction - footerReserved - overflow - shortfallPenalty);
  return { heightPx: Number.isFinite(measuredFallback) ? Math.min(fallback, measuredFallback as number) : fallback, bodyOverrunsFooter: overruns };
}

/** 原 Ld：渲染块最大底边（忽略空块与分页忽略块） */
export function maxRenderedBottomPx(entries: { ignore?: boolean; bottomPx: number; widthPx: number; heightPx: number }[]): number | undefined {
  let max: number | undefined;
  entries.forEach((entry) => {
    entry.ignore || (Number.isFinite(entry.bottomPx) && ((entry.widthPx <= 0 && entry.heightPx <= 0) || (max = max === void 0 ? entry.bottomPx : Math.max(max, entry.bottomPx))));
  });
  return max;
}

/** 原 Rd：页高核算——身份键未变时取“测量与渲染的较小值” */
export function reconcilePageHeights(renderedHeights: number[], measuredHeights: number[], options?: { currentPageIdentityKeys?: string[]; nextPageIdentityKeys?: string[] }): number[] {
  return measuredHeights.map((measured, index) => {
    const rounded = Math.round(measured);
    const rendered = renderedHeights[index];
    const currentKey = options?.currentPageIdentityKeys?.[index];
    const nextKey = options?.nextPageIdentityKeys?.[index];
    const identityStable = currentKey === void 0 || nextKey === void 0 || currentKey === nextKey;
    return Number.isFinite(rendered) && identityStable ? Math.min(Math.round(rendered), rounded) : rounded;
  });
}

/** 原 zd：页段身份键（节点|行范围|行切片|行区间） */
export function segmentIdentityKey(segment: PageSegment): string {
  const rowRange = segment.tableRowRange ? `${segment.tableRowRange.startRowIndex}-${segment.tableRowRange.endRowIndex}` : `none`;
  const rowSlice = segment.tableRowSlice ? `${segment.tableRowSlice.rowIndex}-${Math.round(segment.tableRowSlice.startOffsetPx)}-${Math.round(segment.tableRowSlice.sliceHeightPx)}` : `none`;
  const lineRange = segment.paragraphLineRange ? `${segment.paragraphLineRange.startLineIndex}-${segment.paragraphLineRange.endLineIndex}-${segment.paragraphLineRange.totalLineCount}` : `none`;
  return `${segment.nodeIndex}|${rowRange}|${rowSlice}|${lineRange}`;
}

/** 原 Bd：页身份键（段键 :: 连接） */
export function pageIdentityKey(segments: PageSegment[]): string {
  return segments.map(segmentIdentityKey).join(`::`);
}

/** [E2]/公共层：sectPr → 页面几何（原 Yr；公共层 parsePageGeometry） */
declare function parsePageGeometryLocal(sectPr: string | undefined): { pageWidthPx: number; pageHeightPx: number; marginsPx: { top: number; right: number; bottom: number; left: number }; headerDistancePx: number; footerDistancePx: number; docGridLinePitchPx?: number };

/** 原 Vd：节序列 → 逐节页面度量（内容宽高/多栏倍率/网格行距） */
export function buildSectionPageMetrics(sections: DocxSection[], fallbackGeometry: { pageWidthPx: number; pageHeightPx: number; marginsPx: { top: number; right: number; bottom: number; left: number }; headerDistancePx: number; footerDistancePx: number; docGridLinePitchPx?: number }): SectionPageMetrics[] {
  const contentWidth = sectionContentWidthPx(fallbackGeometry);
  const contentHeight = Math.max(120, fallbackGeometry.pageHeightPx - fallbackGeometry.marginsPx.top - fallbackGeometry.marginsPx.bottom);
  return sections.length === 0
    ? [{ startNodeIndex: 0, pageContentWidthPx: contentWidth, pageContentHeightPx: contentHeight, pageContentHeightMultiplier: 1 }]
    : sections
        .map((section) => {
          const geometry = parsePageGeometryLocal(section.sectionPropertiesXml);
          const columns = parseSectionColumns(section.sectionPropertiesXml);
          const columnCount = Math.max(1, columns?.count ?? 1);
          const hasHeavyHeader = headerSectionsHaveHeavyContent(section);
          const hasHeavyFooter = footerSectionsHaveHeavyContent(section);
          const headerHeight = hasHeavyHeader ? measureHeaderHeight(section.headerSections ?? [], geometry) : 0;
          const footerHeight = hasHeavyFooter ? measureFooterHeight(section.footerSections ?? [], geometry) : 0;
          return {
            startNodeIndex: Math.max(0, Math.round(section.startNodeIndex)),
            pageContentWidthPx: sectionContentWidthPx(geometry, section.sectionPropertiesXml),
            pageContentHeightPx: Math.max(120, (geometry.pageHeightPx - geometry.marginsPx.top - geometry.marginsPx.bottom - headerHeight - footerHeight) * columnCount),
            pageContentHeightMultiplier: columnCount,
            docGridLinePitchPx: geometry.docGridLinePitchPx,
          };
        })
        .sort((a, b) => a.startNodeIndex - b.startNodeIndex);
}

/** 原 Hd：节点索引 → 节索引（二分前的线性推进，带夹取） */
export function sectionIndexForNode(metrics: SectionPageMetrics[], nodeIndex: number, hint: number): number {
  if (metrics.length === 0) return 0;
  let index = Math.max(0, Math.min(hint, metrics.length - 1));
  for (nodeIndex < metrics[index].startNodeIndex && (index = 0); index + 1 < metrics.length && metrics[index + 1].startNodeIndex <= nodeIndex; ) index += 1;
  return index;
}

/** 原 Ud：节度量按倍率缩放页高 */
export function scaleSectionMetrics(metrics: SectionPageMetrics[], scale: number): SectionPageMetrics[] {
  return !Number.isFinite(scale) || Math.abs(scale - 1) < 0.001 ? metrics : metrics.map((entry) => ({ ...entry, pageContentHeightPx: Math.max(120, Math.round(entry.pageContentHeightPx * scale)) }));
}

/** 原 Wd：高度列表按倍率缩放 */
export function scaleHeightList(heights: number[] | undefined, scale: number): number[] | undefined {
  return !heights || heights.length === 0 || !Number.isFinite(scale) || Math.abs(scale - 1) < 0.001 ? heights : heights.map((height) => Math.max(120, Math.round(height * scale)));
}

/** 原 Gd：页内容高解析（测量优先，身份键校验；回退节度量） */
export function resolvePageContentHeight(
  segments: PageSegment[],
  pageIndex: number,
  defaultHeightPx: number,
  metrics: SectionPageMetrics[],
  measuredHeights?: number[],
  identityKeys?: string[],
  pageKey?: string,
): number {
  const onlySplits = pageIsOnlySplitSegments(segments);
  const measured = measuredHeights?.[pageIndex];
  const identityStable = pageKey === void 0 || identityKeys?.[pageIndex] === void 0 || identityKeys?.[pageIndex] === pageKey;
  if (Number.isFinite(measured) && identityStable && !onlySplits) return Math.max(120, Math.round(measured as number));
  const sectionIndex = sectionIndexForNode(metrics, segments[0]?.nodeIndex ?? 0, 0);
  return Math.max(120, Math.round(metrics[sectionIndex]?.pageContentHeightPx ?? defaultHeightPx));
}

/** 原 Kd：渲染用页主体高度（多栏倍率还原） */
export function resolveRenderBodyHeight(input: {
  pageSegments: PageSegment[];
  pageIndex: number;
  defaultPageContentHeightPx: number;
  metricsBySection: SectionPageMetrics[];
  measuredPageContentHeightsPxByPageIndex?: number[];
  measuredPageContentIdentityKeysByPageIndex?: string[];
  pageIdentityKey?: string;
  useMeasuredPageContentHeights?: boolean;
  pageContentHeightScale?: number;
}): number {
  const firstNodeIndex = input.pageSegments[0]?.nodeIndex ?? 0;
  const sectionIndex = sectionIndexForNode(input.metricsBySection, firstNodeIndex, 0);
  const multiplier = Math.max(1, Math.round(input.metricsBySection[sectionIndex]?.pageContentHeightMultiplier ?? 1));
  const onlySplits = pageIsOnlySplitSegments(input.pageSegments);
  const measured = input.useMeasuredPageContentHeights === false ? void 0 : input.measuredPageContentHeightsPxByPageIndex?.[input.pageIndex];
  const identityStable = input.pageIdentityKey === void 0 || input.measuredPageContentIdentityKeysByPageIndex?.[input.pageIndex] === void 0 || input.measuredPageContentIdentityKeysByPageIndex?.[input.pageIndex] === input.pageIdentityKey;
  const useMeasured = Number.isFinite(measured) && identityStable && !onlySplits;
  const base = resolvePageContentHeight(
    input.pageSegments,
    input.pageIndex,
    input.defaultPageContentHeightPx,
    input.metricsBySection,
    input.useMeasuredPageContentHeights === false ? void 0 : input.measuredPageContentHeightsPxByPageIndex,
    input.useMeasuredPageContentHeights === false ? void 0 : input.measuredPageContentIdentityKeysByPageIndex,
    input.pageIdentityKey,
  );
  return useMeasured || multiplier <= 1 ? base : Math.max(120, Math.round(base / multiplier));
}

/** 原 qd：页仅含跨页分段判定 */
export function pageIsOnlySplitSegments(segments: PageSegment[]): boolean {
  return segments.length > 0 && segments.every((segment) => !segment.tableRowRange && !!segment.paragraphLineRange && segment.paragraphLineRange.startLineIndex > 0);
}

/* ============================================================================
 * §15 脚注核算（原 Jd..Xd，jsx 16166-16213）
 * ==========================================================================*/

/** 原 Jd：脚注区高度估算（逐段行高 + 段间距） */
export function estimateFootnoteHeight(footnotes: DocxNode[], contentWidthPx: number, gridLinePitchPx: number | undefined): number {
  if (footnotes.length === 0) return 0;
  let height = 19;
  footnotes.forEach((footnote, index) => {
    index > 0 && (height += 6);
    const paragraphs = ((footnote as { nodes?: DocxNode[] }).nodes ?? []).filter((node) => node.type === `paragraph`) as DocxParagraphNode[];
    if (paragraphs.length === 0) {
      height += 16;
      return;
    }
    paragraphs.forEach((paragraph, paragraphIndex) => {
      paragraphIndex > 0 && (height += 4);
      height += paragraphOuterHeight(paragraph, contentWidthPx, gridLinePitchPx);
    });
  });
  return Math.max(0, height);
}

/** [E4]：节点脚注/尾注引用收集（原 bm，jsx 17866） */
declare function collectNoteReferences(node: DocxNode, kind: `footnote` | `endnote`, rowRange: PageSegment[`tableRowRange`], lineRange: PageSegment[`paragraphLineRange`]): string[];

/** 原 Yd：页段引用的脚注实体收集（去重、按定义序） */
export function collectPageFootnotes(model: DocxEditorModel, segments: PageSegment[], footnotesById: Map<string, { id: string; nodes: DocxNode[] }>): { id: string; nodes: DocxNode[] }[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  segments.forEach((segment) => {
    const node = model.nodes[segment.nodeIndex];
    node &&
      collectNoteReferences(node, `footnote`, segment.tableRowRange, segment.paragraphLineRange).forEach((id) => {
        seen.has(id) || (seen.add(id), ids.push(id));
      });
  });
  return ids.map((id) => footnotesById.get(id)).filter((note) => !!note) as { id: string; nodes: DocxNode[] }[];
}

/**
 * 原 Xd：脚注联动分页——最多 3 轮迭代：
 * 每页扣除其脚注高度后重分页，直至页段序列稳定。
 */
export function paginateWithFootnotes(
  model: DocxEditorModel,
  initialPages: PageSegment[][],
  defaultPageContentHeightPx: number,
  contentWidthPx: number,
  sectionMetrics: SectionPageMetrics[],
  numberingDefinitions: unknown,
  footnotes: { id: string; nodes: DocxNode[] }[],
  paginate: (heights: number[] | undefined) => PageSegment[][],
): PageSegment[][] {
  if (initialPages.length === 0 || footnotes.length === 0) return initialPages;
  const footnotesById = new Map(footnotes.map((note) => [note.id, note]));
  let pages = initialPages;
  for (let round = 0; round < 3; round += 1) {
    const next = paginate(
      pages.map((segments, pageIndex) => {
        const notes = collectPageFootnotes(model, segments, footnotesById);
        const base = resolvePageContentHeight(segments, pageIndex, defaultPageContentHeightPx, sectionMetrics);
        if (notes.length === 0) return base;
        const footnoteHeight = estimateFootnoteHeight(notes as unknown as DocxNode[], contentWidthPx, void 0);
        return Math.max(120, base - footnoteHeight);
      }),
    );
    const stable =
      next.length === pages.length &&
      next.every((segments, index) => {
        const previous = pages[index] ?? [];
        return segments.length === previous.length
          ? segments.every((segment, segmentIndex) => {
              const other = previous[segmentIndex];
              return (
                other?.nodeIndex === segment.nodeIndex &&
                other?.tableRowRange?.startRowIndex === segment.tableRowRange?.startRowIndex &&
                other?.tableRowRange?.endRowIndex === segment.tableRowRange?.endRowIndex &&
                other?.paragraphLineRange?.startLineIndex === segment.paragraphLineRange?.startLineIndex &&
                other?.paragraphLineRange?.endLineIndex === segment.paragraphLineRange?.endLineIndex
              );
            })
          : false;
      });
    if ((pages = next, stable)) break;
  }
  return pages;
}

/* ============================================================================
 * §16 DOM 位置解析（原 Zd..$d，jsx 16214-16254）
 * ==========================================================================*/

/** 原 Zd：十进制索引属性解析 */
export function parseIndexAttr(value: string | null): number | undefined {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (Number.isFinite(parsed)) return parsed;
}

/** 段落/单元格 DOM 位置（原 Qd 返回类型） */
export type ParagraphDomLocation =
  | { kind: `paragraph`; nodeIndex: number }
  | { kind: `table-cell`; tableIndex: number; rowIndex: number; cellIndex: number; paragraphIndex: number };

/** 原 Qd：data-docx-paragraph-kind 属性 → 位置 */
export function parseParagraphDomLocation(element: Element | undefined | null): ParagraphDomLocation | undefined {
  if (!element) return;
  const kind = element.getAttribute(`data-docx-paragraph-kind`);
  if (kind === `paragraph`) {
    const nodeIndex = parseIndexAttr(element.getAttribute(`data-docx-paragraph-node-index`));
    return nodeIndex === void 0 ? void 0 : { kind: `paragraph`, nodeIndex };
  }
  if (kind === `table-cell`) {
    const tableIndex = parseIndexAttr(element.getAttribute(`data-docx-table-index`));
    const rowIndex = parseIndexAttr(element.getAttribute(`data-docx-row-index`));
    const cellIndex = parseIndexAttr(element.getAttribute(`data-docx-cell-index`));
    const paragraphIndex = parseIndexAttr(element.getAttribute(`data-docx-paragraph-index`));
    return tableIndex === void 0 || rowIndex === void 0 || cellIndex === void 0 || paragraphIndex === void 0
      ? void 0
      : { kind: `table-cell`, tableIndex, rowIndex, cellIndex, paragraphIndex };
  }
}

/** 原 $d：祖先单元格 → 表格位置 */
export function parseTableCellDomLocation(element: Element | undefined | null): { tableIndex: number; rowIndex: number; cellIndex: number } | undefined {
  if (!element) return;
  const cell = element.closest(`[data-docx-table-cell='true']`);
  if (!cell) return;
  const tableIndex = parseIndexAttr(cell.getAttribute(`data-docx-table-index`));
  const rowIndex = parseIndexAttr(cell.getAttribute(`data-docx-row-index`));
  const cellIndex = parseIndexAttr(cell.getAttribute(`data-docx-cell-index`));
  if (!(tableIndex === void 0 || rowIndex === void 0 || cellIndex === void 0)) return { tableIndex, rowIndex, cellIndex };
}

/* ============================================================================
 * §17 表格选区助手（原 ef..cf，jsx 16255-16328）
 * ==========================================================================*/

/** 表格单元格选区（锚点/焦点式） */
export interface TableCellSelection {
  tableIndex: number;
  anchorRowIndex: number;
  anchorCellIndex: number;
  focusRowIndex: number;
  focusCellIndex: number;
}

/** 单元格矩形范围 */
export interface TableCellRange {
  startRowIndex: number;
  endRowIndex: number;
  startCellIndex: number;
  endCellIndex: number;
}

/** 原 ef：锚点/焦点 → 规整矩形 */
export function normalizeCellRange(selection: TableCellSelection): TableCellRange {
  return {
    startRowIndex: Math.min(selection.anchorRowIndex, selection.focusRowIndex),
    endRowIndex: Math.max(selection.anchorRowIndex, selection.focusRowIndex),
    startCellIndex: Math.min(selection.anchorCellIndex, selection.focusCellIndex),
    endCellIndex: Math.max(selection.anchorCellIndex, selection.focusCellIndex),
  };
}

/** 原 tf：单格选区判定 */
export function isCollapsedCellSelection(selection: TableCellSelection): boolean {
  return selection.anchorRowIndex === selection.focusRowIndex && selection.anchorCellIndex === selection.focusCellIndex;
}

/** 原 nf：单元格选区相等判定 */
export function sameCellSelection(a: TableCellSelection | undefined, b: TableCellSelection | undefined): boolean {
  return !a || !b
    ? a === b
    : a.tableIndex === b.tableIndex && a.anchorRowIndex === b.anchorRowIndex && a.anchorCellIndex === b.anchorCellIndex && a.focusRowIndex === b.focusRowIndex && a.focusCellIndex === b.focusCellIndex;
}

/** 原 rf：选区是否覆盖指定单元格 */
export function cellSelectionContains(selection: TableCellSelection | undefined, tableIndex: number, rowIndex: number, cellIndex: number): boolean {
  if (!selection || selection.tableIndex !== tableIndex) return false;
  const range = normalizeCellRange(selection);
  return rowIndex >= range.startRowIndex && rowIndex <= range.endRowIndex && cellIndex >= range.startCellIndex && cellIndex <= range.endCellIndex;
}

/** 原 af：文本范围是否触及指定表格 */
export function rangeTouchesTable(range: DocxTextRange | undefined, tableIndex: number): boolean {
  return range ? [range.start.location, range.end.location].some((location) => location.kind === `table-cell` && location.tableIndex === tableIndex) : false;
}

/** 原 of：选区覆盖的实体单元格枚举（跳过纵向合并延续格） */
export function enumerateSelectedCells(table: DocxTableNode, selection: TableCellSelection): { rowIndex: number; cellIndex: number }[] {
  const range = normalizeCellRange(selection);
  const cells: { rowIndex: number; cellIndex: number }[] = [];
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    if (rowIndex < range.startRowIndex || rowIndex > range.endRowIndex) continue;
    const row = table.rows[rowIndex];
    if (row)
      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
        if (cellIndex < range.startCellIndex || cellIndex > range.endCellIndex) continue;
        const cell = row.cells[cellIndex];
        !cell || cell.style?.vMergeContinuation || cells.push({ rowIndex, cellIndex });
      }
  }
  return cells;
}

/** 原 sf：表格首/末实体单元格 */
export function tableFirstLastCell(table: DocxTableNode): { first: { rowIndex: number; cellIndex: number }; last: { rowIndex: number; cellIndex: number } } | undefined {
  let first: { rowIndex: number; cellIndex: number } | undefined;
  let lastRow = -1;
  let lastCell = -1;
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (row)
      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
        const cell = row.cells[cellIndex];
        !cell || cell.style?.vMergeContinuation || (first ||= { rowIndex, cellIndex }, rowIndex > lastRow && (lastRow = rowIndex), cellIndex > lastCell && (lastCell = cellIndex));
      }
  }
  if (!(!first || lastRow < 0 || lastCell < 0)) return { first, last: { rowIndex: lastRow, cellIndex: lastCell } };
}

/** 原 cf：选区覆盖整表判定 */
export function selectionCoversTable(table: DocxTableNode, selection: TableCellSelection): boolean {
  const covered = new Set(enumerateSelectedCells(table, selection).map((cell) => `${cell.rowIndex}:${cell.cellIndex}`));
  if (covered.size === 0) return false;
  let total = 0;
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (row)
      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
        const cell = row.cells[cellIndex];
        if (!(!cell || cell.style?.vMergeContinuation) && ((total += 1), !covered.has(`${rowIndex}:${cellIndex}`))) return false;
      }
  }
  return total > 0 && covered.size === total;
}

/* ============================================================================
 * §18 位置比较与范围归一（原 lf..ff，jsx 16329-16350）
 * ==========================================================================*/

/** 原 lf：范围文本长度（编号标签不计） */
export function rangeTextLength(range: Range): number {
  const fragment = range.cloneContents();
  fragment.querySelectorAll(`[data-docx-numbering-label='true']`).forEach((label) => {
    label.remove();
  });
  return fragment.textContent?.length ?? 0;
}

/** 原 uf：位置比较（段落/单元格混合序） */
export function compareLocations(a: DocxLocation, b: DocxLocation): number {
  return a.kind === `paragraph` && b.kind === `paragraph`
    ? Math.sign(a.nodeIndex - b.nodeIndex)
    : a.kind === `paragraph` && b.kind === `table-cell`
      ? a.nodeIndex === b.tableIndex
        ? -1
        : Math.sign(a.nodeIndex - b.tableIndex)
      : a.kind === `table-cell` && b.kind === `paragraph`
        ? a.tableIndex === b.nodeIndex
          ? 1
          : Math.sign(a.tableIndex - b.nodeIndex)
        : a.kind === `table-cell` && b.kind === `table-cell`
          ? a.tableIndex === b.tableIndex
            ? a.rowIndex === b.rowIndex
              ? a.cellIndex === b.cellIndex
                ? Math.sign(a.paragraphIndex - b.paragraphIndex)
                : Math.sign(a.cellIndex - b.cellIndex)
              : Math.sign(a.rowIndex - b.rowIndex)
            : Math.sign(a.tableIndex - b.tableIndex)
          : 0;
}

/** 原 df：文本位置比较（位置序优先，偏移序次之） */
export function compareTextPositions(a: DocxTextPosition, b: DocxTextPosition): number {
  const locationOrder = compareLocations(a.location, b.location);
  return locationOrder === 0 ? Math.sign(a.offset - b.offset) : locationOrder;
}

/** 原 ff：文本范围归一（start ≤ end） */
export function normalizeTextRange(range: DocxTextRange): DocxTextRange {
  return compareTextPositions(range.start, range.end) <= 0 ? { start: range.start, end: range.end } : { start: range.end, end: range.start };
}

/* ============================================================================
 * §19 起始模型（原 pf/mf/hf，jsx 16351-16444）
 * ==========================================================================*/

/** 原 pf：空白起始文档模型（Normal + Heading1-6 样式表） */
export const STARTER_DOCX_MODEL: DocxEditorModel = {
  nodes: [{ type: `paragraph`, children: [{ type: `text`, text: `` }] }],
  metadata: {
    sourceParts: 1,
    warnings: [],
    headerSections: [],
    footerSections: [],
    paragraphStyles: [
      { id: `Normal`, name: `Body`, isDefault: true, runStyle: { fontFamily: `Calibri`, fontSizePt: 11 } },
      { id: `Heading1`, name: `Heading 1`, headingLevel: 1, isPrimary: true, runStyle: { fontFamily: `Calibri Light`, fontSizePt: 16, bold: true, color: `#2f5496` } },
      { id: `Heading2`, name: `Heading 2`, headingLevel: 2, isPrimary: true, runStyle: { fontFamily: `Calibri Light`, fontSizePt: 13, bold: true, color: `#2f5496` } },
      { id: `Heading3`, name: `Heading 3`, headingLevel: 3, isPrimary: true, runStyle: { fontFamily: `Calibri`, fontSizePt: 12, bold: true, color: `#1f3763` } },
      { id: `Heading4`, name: `Heading 4`, headingLevel: 4, runStyle: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` } },
      { id: `Heading5`, name: `Heading 5`, headingLevel: 5, runStyle: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` } },
      { id: `Heading6`, name: `Heading 6`, headingLevel: 6, runStyle: { fontFamily: `Calibri`, fontSizePt: 11, bold: true, color: `#1f3763` } },
    ],
    defaultParagraphStyleId: `Normal`,
  },
};

/** 原 mf：模型克隆（深拷贝 + 终结化） */
export function cloneModel(model: DocxEditorModel): DocxEditorModel {
  return finalizeModel(deepCloneModel(model));
}

/** 原 hf：起始模型实例 */
export function createStarterModel(): DocxEditorModel {
  return cloneModel(STARTER_DOCX_MODEL);
}

/* ============================================================================
 * §20 文本助手（原 gf..Df，jsx 16445-16557）
 * ==========================================================================*/

/** 原 gf：段落文本子节点 */
export function textChildren(paragraph: DocxParagraphNode): DocxTextNode[] {
  return paragraph.children.filter((child): child is DocxTextNode => child.type === `text`);
}

/** 原 _f：段落全文 */
export function paragraphText(paragraph: DocxParagraphNode): string {
  return textChildren(paragraph)
    .map((child) => child.text)
    .join(``);
}

/** 原 vf：节点树含显式字体判定 */
export function nodesHaveExplicitFont(nodes: DocxNode[]): boolean {
  return nodes.some((node) =>
    node.type === `paragraph`
      ? (node as DocxParagraphNode).children.some((child) => (child.type === `text` || child.type === `form-field` ? !!(child as DocxTextNode).style?.fontFamily?.trim() : false))
      : node.type === `table`
        ? (node as DocxTableNode).rows.some((row) => row.cells.some((cell) => nodesHaveExplicitFont(cell.nodes)))
        : false,
  );
}

/** 原 yf：节点树首个显式字体 */
export function firstExplicitFontFamily(nodes: DocxNode[]): string | undefined {
  for (const node of nodes) {
    if (node.type === `paragraph`) {
      for (const child of (node as DocxParagraphNode).children) {
        if (child.type !== `text` && child.type !== `form-field`) continue;
        const family = (child as DocxTextNode).style?.fontFamily?.trim();
        if (family) return family;
      }
      continue;
    }
    if (node.type === `table`)
      for (const row of (node as DocxTableNode).rows)
        for (const cell of row.cells) {
          const family = firstExplicitFontFamily(cell.nodes);
          if (family) return family;
        }
  }
}

/** 原 bf：文档字体解析（默认样式 → 显式字体 → 页眉页脚 → Times New Roman 兜底） */
export function resolveDocumentFontFamily(model: DocxEditorModel): string | undefined {
  const styles = model.metadata.paragraphStyles ?? [];
  const defaultId = model.metadata.defaultParagraphStyleId?.trim().toLowerCase() ?? ``;
  const defaultFamily = (styles.find((style) => style.id.trim().toLowerCase() === defaultId) ?? styles.find((style) => style.isDefault) ?? styles.find((style) => style.id.trim().toLowerCase() === `normal`))?.runStyle?.fontFamily?.trim();
  if (defaultFamily) return normalizeFontFamily(defaultFamily);
  const bodyFamily = styles.find((style) => style.headingLevel === void 0 && !!style.runStyle?.fontFamily?.trim())?.runStyle?.fontFamily;
  if (bodyFamily) return normalizeFontFamily(bodyFamily);
  const nodeFamily = firstExplicitFontFamily(model.nodes);
  if (nodeFamily) return normalizeFontFamily(nodeFamily);
  for (const section of model.metadata.headerSections ?? []) {
    const family = firstExplicitFontFamily(section.nodes);
    if (family) return normalizeFontFamily(family);
  }
  for (const section of model.metadata.footerSections ?? []) {
    const family = firstExplicitFontFamily(section.nodes);
    if (family) return normalizeFontFamily(family);
  }
  return nodesHaveExplicitFont(model.nodes) || (model.metadata.headerSections ?? []).some((section) => nodesHaveExplicitFont(section.nodes)) || (model.metadata.footerSections ?? []).some((section) => nodesHaveExplicitFont(section.nodes))
    ? void 0
    : normalizeFontFamily(FALLBACK_FONT_FAMILY);
}

/** 原 xf：制表布局扁平化（剪贴板用；四种布局 → \t 连接） */
export function flattenTabLayouts(root: HTMLElement): void {
  Array.from(root.querySelectorAll(`[data-docx-tab-layout='center']`)).forEach((element) => {
    const left = element.querySelector(`[data-docx-tab-zone='left']`)?.textContent ?? ``;
    const center = element.querySelector(`[data-docx-tab-zone='center']`)?.textContent ?? ``;
    element.replaceWith(`${left}\t${center}`);
  });
  Array.from(root.querySelectorAll(`[data-docx-tab-layout='center-right']`)).forEach((element) => {
    const zone0 = element.querySelector(`[data-docx-tab-zone='0']`)?.textContent ?? ``;
    const zone1 = element.querySelector(`[data-docx-tab-zone='1']`)?.textContent ?? ``;
    const zone2 = element.querySelector(`[data-docx-tab-zone='2']`)?.textContent ?? ``;
    element.replaceWith(`${zone0}\t${zone1}\t${zone2}`);
  });
  Array.from(root.querySelectorAll(`[data-docx-tab-layout='leader']`)).forEach((element) => {
    const left = element.querySelector(`[data-docx-tab-zone='left']`)?.textContent ?? ``;
    const right = element.querySelector(`[data-docx-tab-zone='right']`)?.textContent ?? ``;
    element.replaceWith(`${left}\t${right}`);
  });
  Array.from(root.querySelectorAll(`[data-docx-tab-layout='right']`)).forEach((element) => {
    const left = element.querySelector(`[data-docx-tab-zone='left']`)?.textContent ?? ``;
    const right = element.querySelector(`[data-docx-tab-zone='right']`)?.textContent ?? ``;
    element.replaceWith(`${left}\t${right}`);
  });
  Array.from(root.querySelectorAll(`[data-docx-tab-char='true']`)).forEach((element) => {
    element.replaceWith(`\t`);
  });
}

/** 原 Sf：元素 → 纯文本（编号标签剔除；br → 换行） */
export function elementToPlainText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  flattenTabLayouts(clone);
  clone.querySelectorAll(`[data-docx-numbering-label='true']`).forEach((label) => {
    label.remove();
  });
  clone.querySelectorAll(`br`).forEach((br) => {
    br.replaceWith(`\n`);
  });
  return clone.textContent ?? ``;
}

/** 原 Cf：元素 → 剪贴板文本（逐 contenteditable 子块换行连接） */
export function elementToClipboardText(element: HTMLElement): string {
  const blocks = Array.from(element.children).filter((child) => child instanceof HTMLElement && child.getAttribute(`contenteditable`) !== `false`) as HTMLElement[];
  return blocks.length === 0
    ? elementToPlainText(element)
    : blocks
        .map((block) => {
          if (block.tagName.toUpperCase() === `BR`) return ``;
          const text = elementToPlainText(block);
          return text === `\n` ? `` : text;
        })
        .join(`\n`);
}

/** 原 wf：HTML 字符串 → 纯文本 */
export function htmlToPlainText(html: string): string {
  if (typeof document > `u`) return html.replace(/<br\s*\/?>/gi, `\n`).replace(/<[^>]+>/g, ``).replace(/&nbsp;/gi, ` `);
  const host = document.createElement(`div`);
  host.innerHTML = html;
  return elementToPlainText(host);
}

/** 原 Tf：HTML 字符串 → 剪贴板文本 */
export function htmlToClipboardText(html: string): string {
  if (typeof document > `u`) return htmlToPlainText(html);
  const host = document.createElement(`div`);
  host.innerHTML = html;
  return elementToClipboardText(host);
}

/** 原 Ef：React 静态标记渲染（react-dom/server renderToStaticMarkup） */
export function renderStaticMarkup(node: React.ReactNode): string {
  return renderToStaticMarkupContract(node);
}

/** react-dom/server 契约（[V1] CJS 段 Te.renderToStaticMarkup） */
declare function renderToStaticMarkupContract(node: unknown): string;
import type * as React from "react";

/** 原 Df：表单域显示文本（四类域分派） */
export function formFieldDisplayText(field: DocxFormFieldNode): string {
  switch (field.fieldType) {
    case `checkbox`:
      return field.checked ?? field.widget?.checkbox?.defaultChecked ? field.checkedSymbol ?? `☒` : field.uncheckedSymbol ?? `☐`;
    case `dropdown`:
      return field.value ?? field.options?.[0]?.displayText ?? ``;
    case `date`:
      return field.value ?? ``;
    case `text`:
      return field.value ?? field.widget?.text?.defaultText ?? ``;
    default:
      return field.value ?? ``;
  }
}

/** 原 Of：段落首个文本 run 样式 */
export function firstTextRunStyle(paragraph: DocxParagraphNode | undefined): DocxRunStyle | undefined {
  return textChildren(
    paragraph ?? {
      type: `paragraph`,
      children: [],
    },
  )[0]?.style;
}

/* ============================================================================
 * §21 节点谓词族（原 kf..up，jsx 16558-16815）
 * ==========================================================================*/

/** 原 kf：段落节点判定 */
export function isParagraph(node: DocxNode): node is DocxParagraphNode {
  return node.type === `paragraph`;
}

/** 原 Af：表格节点判定 */
export function isTable(node: DocxNode): node is DocxTableNode {
  return node.type === `table`;
}

/** 原 jf：节点序列中的段落 */
export function paragraphsOf(nodes: DocxNode[]): DocxParagraphNode[] {
  return nodes.filter(isParagraph);
}

/** 原 Mf：递归收集段落（表格深入单元格） */
export function collectParagraphsRecursive(nodes: DocxNode[]): DocxParagraphNode[] {
  const result: DocxParagraphNode[] = [];
  const walk = (list: DocxNode[]): void => {
    for (const node of list) {
      if (isParagraph(node)) {
        result.push(node);
        continue;
      }
      if (isTable(node)) for (const row of node.rows) for (const cell of row.cells) walk(cell.nodes);
    }
  };
  walk(nodes);
  return result;
}

/** 原 Nf：节点树含图片段落判定 */
export function nodesContainImage(nodes: DocxNode[]): boolean {
  for (const node of nodes) {
    if (isParagraph(node) && paragraphHasImage(node)) return true;
    if (isTable(node)) {
      for (const row of node.rows) for (const cell of row.cells) if (nodesContainImage(cell.nodes)) return true;
    }
  }
  return false;
}

/** 原 Pf：段落含图片 */
export function paragraphHasImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image`);
}

/** [E6]-渲染层：合成文本框图片的真实图形判定（原 nv，jsx 20671；锚点登记） */
declare function imageIsRealPictureShape(image: DocxImageNode): boolean;

/** 原 Ff：段落为合成文本框载体（浮动 + 真实图形 + 有文本） */
export function paragraphIsTextBoxCarrier(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode) && (child as DocxImageNode).syntheticTextBox === true && !imageIsRealPictureShape(child as DocxImageNode) && !!textBoxInnerText(child as DocxImageNode));
}

/** 原 If：段落仅图片（无可见文本；内联/浮动图） */
export function paragraphIsImageOnly(paragraph: DocxParagraphNode): boolean {
  if (paragraphHasVisibleText(paragraph) || paragraphHasFormField(paragraph) || paragraphIsTextBoxCarrier(paragraph)) return false;
  let hasImage = false;
  for (const child of paragraph.children) {
    if (child.type === `text`) {
      if ((child as DocxTextNode).text.trim().length > 0) return false;
      continue;
    }
    if (child.type !== `image` || (!isInlineImageNode(child as DocxImageNode) && !isFloatingImageNode(child as DocxImageNode))) return false;
    hasImage = true;
  }
  return hasImage;
}

/** 原 Lf：段落仅浮动图（sectPr 段落与文本框载体除外） */
export function paragraphIsFloatingImageOnly(paragraph: DocxParagraphNode): boolean {
  const hasSectionBreak = paragraphHasSectionBreak(paragraph) && !paragraphHasVisibleText(paragraph) && !paragraphHasFormField(paragraph);
  if (paragraphHasVisibleText(paragraph) || paragraphHasFormField(paragraph) || (paragraphIsTextBoxCarrier(paragraph) && !hasSectionBreak)) return false;
  let hasImage = false;
  for (const child of paragraph.children) {
    if (child.type === `text`) {
      if ((child as DocxTextNode).text.trim().length > 0) return false;
      continue;
    }
    if (child.type !== `image` || !isFloatingImageNode(child as DocxImageNode)) return false;
    hasImage = true;
  }
  return hasImage;
}

/** 原 Rf：段落仅图片与空文本 */
export function paragraphIsImagesAndText(paragraph: DocxParagraphNode): boolean {
  if (paragraphHasFormField(paragraph)) return false;
  let hasImage = false;
  for (const child of paragraph.children)
    if (child.type !== `text`) {
      if (child.type !== `image` || !isFloatingImageNode(child as DocxImageNode)) return false;
      hasImage = true;
    }
  return hasImage;
}

/** 原 zf：段落为背景图层（浮动背景图 + 空文本） */
export function paragraphIsBehindDocImages(paragraph: DocxParagraphNode): boolean {
  return paragraphIsFloatingImageOnly(paragraph) ? paragraph.children.every((child) => child.type === `text` || (child.type === `image` && (child as DocxImageNode).floating?.behindDocument === true)) : false;
}

/** 原 Bf：图片为段落的背景图层 */
export function isBehindDocImageOf(image: DocxImageNode, paragraph: DocxParagraphNode): boolean {
  return image.floating?.behindDocument === true && isFloatingImageNode(image) && paragraphIsBehindDocImages(paragraph);
}

/** 原 Vf：段落为封面候选（背景图段落且非文本框合成） */
export function paragraphIsCoverCandidate(paragraph: DocxParagraphNode): boolean {
  return paragraphIsBehindDocImages(paragraph) && !paragraphHasVisibleText(paragraph) && !paragraphHasFormField(paragraph) && paragraph.children.every((child) => child.type !== `image` || (child as DocxImageNode).syntheticTextBox !== true);
}

/** 原 Hf：段落含页/边距锚定图片 */
export function paragraphHasPageAnchoredImage(paragraph: DocxParagraphNode): boolean {
  return paragraphIsImageOnly(paragraph)
    ? paragraph.children.some((child) => {
        if (child.type !== `image` || !isFloatingImageNode(child as DocxImageNode) || !(child as DocxImageNode).floating) return false;
        const relativeTo = (child as DocxImageNode).floating?.horizontalRelativeTo?.trim().toLowerCase();
        return relativeTo === `page` || relativeTo === `margin`;
      })
    : false;
}

/** 原 Uf：段落含浮动图 */
export function paragraphHasFloatingImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode));
}

/** 原 Wf：标题颜色收集（标题级别 → 首个显式颜色；目录链接着色用） */
export function collectHeadingColors(model: DocxEditorModel): Record<number, string> {
  const colors: Record<number, string> = {};
  const stylesById = new Map((model.metadata.paragraphStyles ?? []).map((style) => [style.id, style]));
  const headingLevelOf = (paragraph: DocxParagraphNode): number | undefined => {
    if (Number.isFinite(paragraph.style?.headingLevel) && (paragraph.style?.headingLevel as number) > 0) return Math.round(paragraph.style?.headingLevel as number);
    const definition = paragraph.style?.styleId ? stylesById.get(paragraph.style.styleId) : void 0;
    return (definition ? resolveStyleHeadingLevel(definition) : void 0) || (headingLevelFromName(paragraph.style?.styleId) ?? headingLevelFromName(paragraph.style?.styleName));
  };
  const colorOf = (paragraph: DocxParagraphNode): string | undefined => {
    for (const child of paragraph.children) if ((child.type === `text` || child.type === `form-field`) && (child as DocxTextNode).style?.color) return (child as DocxTextNode).style?.color;
    return (paragraph.style?.styleId ? stylesById.get(paragraph.style.styleId) : void 0)?.runStyle?.color;
  };
  const visitParagraph = (paragraph: DocxParagraphNode): void => {
    const level = headingLevelOf(paragraph);
    if (!level || colors[level]) return;
    const color = colorOf(paragraph);
    color && (colors[level] = color);
  };
  const visitNodes = (nodes: DocxNode[]): void => {
    nodes.forEach((node) => {
      if (node.type === `paragraph`) {
        visitParagraph(node as DocxParagraphNode);
        return;
      }
      (node as DocxTableNode).rows.forEach((row) => {
        row.cells.forEach((cell) => {
          visitNodes(cell.nodes);
        });
      });
    });
  };
  model.nodes.forEach((node) => {
    if (node.type === `paragraph`) {
      visitParagraph(node as DocxParagraphNode);
      return;
    }
    (node as DocxTableNode).rows.forEach((row) => {
      row.cells.forEach((cell) => {
        visitNodes(cell.nodes);
      });
    });
  });
  return colors;
}

/** 原 Gf：节点序列含全宽图判定（页宽 80% 以上或页/边距锚定） */
export function nodesContainFullWidthImage(nodes: DocxNode[], pageWidthPx: number, contentWidthPx: number): boolean {
  const fullWidth = Math.max(1, Math.round(pageWidthPx));
  const contentWidth = Math.max(1, Math.round(contentWidthPx));
  const isFullWidth = (image: DocxImageNode): boolean => {
    if (!image.floating) return false;
    const relativeTo = image.floating.horizontalRelativeTo?.toLowerCase();
    const pageAnchored = relativeTo === `page` || relativeTo === `margin`;
    return !!(
      (image.floating.behindDocument && pageAnchored) ||
      (pageAnchored && (isFloatingImageNode(image) || isInlineImageNode(image))) ||
      (Number.isFinite(image.widthPx) && Number.isFinite(image.floating.xPx) && (image.widthPx as number) >= contentWidth - 12 && (image.floating.xPx as number) <= 12) ||
      (Number.isFinite(image.widthPx) && Number.isFinite(image.floating.xPx) && (image.widthPx as number) >= fullWidth - 12 && (image.floating.xPx as number) <= 12)
    );
  };
  const paragraphHas = (paragraph: DocxParagraphNode): boolean => paragraph.children.some((child) => child.type === `image` && isFullWidth(child as DocxImageNode));
  const tableHas = (table: DocxTableNode): boolean => table.rows.some((row) => row.cells.some((cell) => cell.nodes.some((node) => (node.type === `paragraph` ? paragraphHas(node as DocxParagraphNode) : tableHas(node as DocxTableNode)))));
  return nodes.some((node) => (node.type === `paragraph` ? paragraphHas(node as DocxParagraphNode) : tableHas(node as DocxTableNode)));
}

/** 原 Kf：节点序列含页锚定浮动图判定 */
export function nodesContainPageFloatingImage(nodes: DocxNode[]): boolean {
  const paragraphHas = (paragraph: DocxParagraphNode): boolean => paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode) && (child as DocxImageNode).floating?.verticalRelativeTo?.trim().toLowerCase() === `page`);
  const tableHas = (table: DocxTableNode): boolean => table.rows.some((row) => row.cells.some((cell) => cell.nodes.some((node) => (node.type === `paragraph` ? paragraphHas(node as DocxParagraphNode) : tableHas(node as DocxTableNode)))));
  return nodes.some((node) => (node.type === `paragraph` ? paragraphHas(node as DocxParagraphNode) : tableHas(node as DocxTableNode)));
}

/** 原 qf：段落含表单域 */
export function paragraphHasFormField(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `form-field`);
}

/** 原 Jf：段落含复选框 */
export function paragraphHasCheckbox(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `form-field` && (child as DocxFormFieldNode).fieldType === `checkbox`);
}

/** 原 Yf：段落含可见文本（含表单域显示文本） */
export function paragraphHasVisibleText(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => (child.type === `text` && (child as DocxTextNode).text.trim().length > 0) || (child.type === `form-field` && formFieldDisplayText(child as DocxFormFieldNode).trim().length > 0));
}

/** 原 Xf：文本比较归一（空白折叠、空行剔除） */
export function normalizeComparableText(text: string): string {
  return text
    .replace(/\r/g, ``)
    .split(`\n`)
    .map((line) => line.replace(/[\s\u00a0]+/g, ` `).trim())
    .filter((line) => line.length > 0)
    .join(`\n`)
    .trim();
}

/** 原 Zf：文本框图片内部文本（txbxContent 提取 + 归一） */
export function textBoxInnerText(image: DocxImageNode): string | undefined {
  if (!isFloatingImageNode(image) || !image.sourceXml || !/<w:txbxContent\b/i.test(image.sourceXml)) return;
  const paragraphs = parseTextBoxParagraphs(image.sourceXml);
  if (paragraphs.length === 0) return;
  const text = normalizeComparableText(paragraphs.map((paragraph) => paragraph.segments.map((segment) => segment.text).join(``)).join(`\n`));
  return text.length > 0 ? text : void 0;
}

/** 原 Qf：段落文本被文本框完全重复判定（封面重复文本消除用） */
export function textDuplicatedInTextBox(paragraph: DocxParagraphNode): boolean {
  if (!paragraphHasVisibleText(paragraph) || paragraphHasFormField(paragraph)) return false;
  const ownText = normalizeComparableText(
    paragraph.children
      .filter((child) => child.type === `text`)
      .map((child) => (child as DocxTextNode).text)
      .join(``),
  );
  if (!ownText) return false;
  const boxTexts = paragraph.children
    .filter((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode))
    .map((child) => textBoxInnerText(child as DocxImageNode))
    .filter((text) => !!text) as string[];
  return boxTexts.length === 0 ? false : boxTexts.includes(ownText) ? true : normalizeComparableText(boxTexts.join(`\n`)) === ownText;
}

/** 原 $f：段落仅空白文本（无图片/表单域） */
export function paragraphIsWhitespaceOnly(paragraph: DocxParagraphNode): boolean {
  return paragraphHasImage(paragraph) || paragraphHasFormField(paragraph) ? false : paragraph.children.every((child) => (child.type === `text` ? (child as DocxTextNode).text.replace(/[\s\u00a0]+/g, ``).length === 0 : false));
}

/** 原 ep：段落含分节符判定 */
export function paragraphHasSectionBreak(paragraph: DocxParagraphNode): boolean {
  return /<w:sectPr\b/i.test(paragraph.sourceXml ?? ``);
}

/** 原 tp：图片为全页封面判定（背后 + 无环绕 + 宽≥80% + 高≥70% + 段落参照） */
export function imageIsFullPageCover(image: DocxImageNode, contentWidthPx: number, contentHeightPx: number): boolean {
  if (!isFloatingImageNode(image) || !image.floating) return false;
  const floating = image.floating;
  if (floating.behindDocument !== true || (floating.wrapType ?? `none`) !== `none`) return false;
  const width = Math.max(0, Math.round((image.widthPx ?? 0) as number));
  const height = Math.max(0, Math.round((image.heightPx ?? 0) as number));
  const contentWidth = Math.max(1, Math.round(contentWidthPx));
  const contentHeight = Math.max(1, Math.round(contentHeightPx));
  const wideEnough = width >= contentWidth * 0.8;
  const tallEnough = height >= contentHeight * 0.7;
  const relativeTo = floating.verticalRelativeTo?.trim().toLowerCase();
  return wideEnough && tallEnough && (relativeTo === void 0 || relativeTo === `` || relativeTo === `paragraph` || relativeTo === `line`);
}

/** 原 np：段落含全页封面图 */
export function paragraphHasFullPageCover(paragraph: DocxParagraphNode, contentWidthPx: number, contentHeightPx: number): boolean {
  return paragraphIsImagesAndText(paragraph) && paragraph.children.some((child) => child.type === `image` && imageIsFullPageCover(child as DocxImageNode, contentWidthPx, contentHeightPx));
}

/** 原 rp：图片为页面背景判定（页/边距锚定 + 宽≥80%页宽 + 高≥70%页高 + 顶部贴边） */
export function imageIsPageBackground(image: DocxImageNode, geometry: { pageWidthPx: number; pageHeightPx: number; marginsPx: { top: number } }): boolean {
  if (!isFloatingImageNode(image) || !image.floating) return false;
  const relativeTo = image.floating.verticalRelativeTo?.trim().toLowerCase();
  if (relativeTo !== `page` && relativeTo !== `margin`) return false;
  const height = Math.max(0, Math.round((image.heightPx ?? 0) as number));
  return Math.max(0, Math.round((image.widthPx ?? 0) as number)) >= Math.round(geometry.pageWidthPx * 0.8) && height >= Math.round(geometry.pageHeightPx * 0.7) ? ((image.floating.yPx ?? 0) as number) <= geometry.marginsPx.top : false;
}

/** 原 ip：段落含页面背景图 */
export function paragraphHasPageBackground(paragraph: DocxParagraphNode, geometry: { pageWidthPx: number; pageHeightPx: number; marginsPx: { top: number } }): boolean {
  return paragraphHasPageAnchoredImage(paragraph) ? paragraph.children.some((child) => child.type === `image` && imageIsPageBackground(child as DocxImageNode, geometry)) : false;
}

/** 原 ap：段落为纯引言判定（有文本、无重复文本框、无浮动图） */
export function paragraphIsPlainIntro(paragraph: DocxParagraphNode): boolean {
  return !paragraphHasVisibleText(paragraph) || textDuplicatedInTextBox(paragraph) ? false : !paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode));
}

/** 原 op：文档开头全为封面段判定（前 t+1 段均纯引言且至少一全页封面） */
export function documentStartsWithCovers(model: DocxEditorModel, lastIndex: number, contentWidthPx: number, contentHeightPx: number): boolean {
  let hasCover = false;
  for (let index = 0; index <= lastIndex; index += 1) {
    const node = model.nodes[index];
    if (!node || node.type !== `paragraph` || !paragraphIsPlainIntro(node as DocxParagraphNode)) return false;
    paragraphHasFullPageCover(node as DocxParagraphNode, contentWidthPx, contentHeightPx) && (hasCover = true);
  }
  return hasCover;
}

/** 原 sp：图片子节点键 */
export function imageChildKey(nodeIndex: number, childIndex: number): string {
  return `${nodeIndex}:${childIndex}`;
}

/** 原 cp：节点为可移除封面段判定（开头封面序列内、自身非引言、仅文本与图） */
export function nodeIsRemovableCover(model: DocxEditorModel, nodeIndex: number, node: DocxNode, contentWidthPx: number, contentHeightPx: number): boolean {
  return !documentStartsWithCovers(model, nodeIndex, contentWidthPx, contentHeightPx) || paragraphHasFullPageCover(node as DocxParagraphNode, contentWidthPx, contentHeightPx) || (paragraphHasVisibleText(node as DocxParagraphNode) && !textDuplicatedInTextBox(node as DocxParagraphNode)) || paragraphHasFormField(node as DocxParagraphNode)
    ? false
    : (node as DocxParagraphNode).children.every((child) => child.type === `text` || (child.type === `image` && isFloatingImageNode(child as DocxImageNode)));
}

/** 原 lp：浮动图层绝对定位样式（页面坐标系；背景层 z=0） */
export function floatingLayerStyle(paragraph: DocxParagraphNode, geometry: { marginsPx: { left: number; top: number }; pageWidthPx: number; pageHeightPx: number }, options?: { anchorToPageSurface?: boolean; deltaX?: number; deltaY?: number }): Record<string, string | number> {
  const floating = paragraph.children.find((child) => child.type === `image` && child.floating)?.floating as DocxFloatingImage | undefined;
  const zIndex = Number.isFinite(floating?.zIndex) ? Math.max(1, Math.min(65535, Math.round((floating?.zIndex as number) / Z_LAYER_FLOATING_UNIT))) : MIN_Z_INDEX;
  return {
    position: `absolute`,
    left: (options?.anchorToPageSurface ? 0 : -geometry.marginsPx.left) + Math.round(options?.deltaX ?? 0),
    top: (options?.anchorToPageSurface ? 0 : -geometry.marginsPx.top) + Math.round(options?.deltaY ?? 0),
    width: geometry.pageWidthPx,
    height: geometry.pageHeightPx,
    zIndex: floating?.behindDocument === true ? 0 : zIndex,
  };
}

/** 原 up：段落为“是/否复选框行”判定（≥2 复选框 + 制表 + yes/no 文本） */
export function paragraphIsCheckboxYesNoRow(paragraph: DocxParagraphNode): boolean {
  if (paragraph.children.some((child) => child.type === `image`) || paragraph.children.filter((child) => child.type === `form-field` && (child as DocxFormFieldNode).fieldType === `checkbox`).length < 2) return false;
  const text = paragraph.children
    .filter((child) => child.type === `text`)
    .map((child) => (child as DocxTextNode).text)
    .join(``);
  if (!text.includes(`\t`)) return false;
  const normalized = text.replace(/\s+/g, ` `).trim().toLowerCase();
  return normalized.includes(`yes`) && normalized.includes(`no`);
}

/* --- 公共契约静态断言：本层类型与公共层 DocxModel 兼容 --- */
import type { DocxModel as PublicDocxModel } from "./previewPaneOfficeLegacyDocContent";
const _modelContractCheck: PublicDocxModel = undefined as unknown as DocxEditorModel;
void _modelContractCheck;
void resolveImageSrc;
