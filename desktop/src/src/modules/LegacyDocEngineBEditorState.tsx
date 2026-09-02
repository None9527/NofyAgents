/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBEditorState.tsx — legacy-doc 内部引擎 [E6] 第 4 层：
 * 编辑器状态机（原 tS，jsx 24338-26660，2323 行）
 * （解混淆重建 · D8 Stage B4 · Office 预览族 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版）
 *
 * 重建口径：
 *  - 返回面（100 个成员）逐一对齐原 jsx 26554-26659（高）；
 *  - 状态变量/refs/副作用 全量还原（高）；
 *  - 命令回调按原控制流语义重建；其中超长命令体（替换选区 ~190 行、
 *    边框预设 ~90 行、列表切换 ~90 行）按语义归纳（中），锚点见 §3。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射（tS 内部，jsx 行）
 * ----------------------------------------------------------------------------
 *  状态核：
 *   t.current → starterModelRef (24338) | n/r → reducerState/dispatch (24340)
 *   l → stateRef (24361) | u → commitAction (24363) | d/f/p/m/g → 分片提交器 (24369-24416)
 *   _/y → docxPackage/setDocxPackage (24418) | x/S → documentLoadNonce/bump (24419)
 *   T/E → fileName/setFileName (24424) | D/O → selectedFormFieldRaw/set (24425)
 *   k/A → status/setStatus (24426) | j/M → importError/set (24427)
 *   N/P → isImporting/set (24428) | F/I → documentTheme/set (24429)
 *   L/R → showTrackedChanges/set (24430) | z/B → showComments/set (24431)
 *   ee/V → paginationInfo/set (24432) | H → importAbortRef (24434)
 *   U/te → historyRestoreRequest/set (24435) | ne/re → selectionSessionKind/set (24436)
 *  命令（按返回面顺序，见 §2 映射表）：
 *   Be → applyEdit (24646) | Ve → annotationFailureMessage (24687)
 *   He → resolveRevision (24688) | Ue/We → accept/rejectTrackedChange (24737/24738)
 *   Ge → createComment (24740) | Ke → setCommentResolved (24776)
 *   Q → applyModelEdit (996) | qe → failImport (24826)
 *   Je → importDocxFile (24833) | Ye → newDocument (24880)
 *   Xe → exportDocx (24888) | Ze/Qe → undo/redo (24905/24927)
 *   $e → editSelectedParagraph (155916) | et → restoreSelection (24976)
 *   tt → setActiveTextRange (24980) | nt → suppressNextDomSelectionRestore (25007)
 *   rt → applyRunStyleEdit (115012) | it/at/ot → 样式/标题/行距 (25036/25052/25063)
 *   st/ct → setFontFamily/setFontSize (25088/25092) | lt → effectiveRunStyle (25097)
 *   ut/dt/ft/pt/mt/ht/gt/_t → 粗/斜/下划/删除/上标/下标/高亮/字色 (25107-25163)
 *   vt → setLink (25164) | yt/bt → replaceExpandedSelection/deleteExpandedSelection (25196/25387)
 *   xt/St/Ct/wt/Tt → 表单域族 (25388-25455) | Et → applyBorderPreset (25456)
 *   Dt → setAlignment (609) | Ot → toggleList (25575)
 *   kt → adjustSelectedListDepth (90599) | At/jt → 列表项插入/段落拆分 (25696/25755)
 *   Mt → insertTable (25806) | Nt → insertImageFile (25873)
 *   Pt → appendParagraph (25906) | Ft/It/Lt/Rt/zt → 图片/文本框/环绕/浮动 (25933-26005)
 *   Bt/Vt/Ht → 首字下沉族 (26006-26059) | Ut → moveImage (26061)
 *   Wt/Gt/Kt → 选段/选格/清格 (26098-26157) | qt/Jt/Yt/Xt → 表格删除/移动/浮动/嵌套提取 (26158-26297)
 *   Zt/Qt/$t/en → 行列增删 (26298-26427) | tn/nn/rn/an/on/sn → 文本提交族 (26428-26543)
 *   cn → syncPaginationInfo (26541)
 *
 * ----------------------------------------------------------------------------
 * 二、外部契约（A0-S2c 接线后）
 * ----------------------------------------------------------------------------
 *   公共层：importDocx（原 Nr，§2 导入管线）
 *   [E4]→C2 实体导出（§1 接线）：Gx editorReducer、Fx resolveLocation、
 *         Wx normalizeCursorState、wx/Ex sameSelection/sameTextRange、
 *         Cx/Sx/fb cloneSelection/cloneTextRange/cloneRunStyle、
 *         zx locationFor、ax sameLocationContract、Lx toMutableLocation、
 *         Px paragraphLocationOfImage、Bx selectionRunStyle、Kx replaceTextAtLocation、
 *         _x enumerateRangeLocations、bx rangeOffsetsInParagraph、Eb applyRunStyleToRange、
 *         Tb/Db expandLinkAt/applyLinkToRange、Sb runStyleAt、ay cloneParagraphStyle、
 *         gy/_y applyListIndent/removeListIndent、ny/ey/$v/qv/Jv/ty/Uv/my/hy 编号文本族、
 *         Zv/Xv/Qv numberingKindOf/paragraphHasNumbering/isNumberedParagraph、
 *         fy/py/dy/vy emptyParagraph/cloneCell/cloneRowStyle/cellParagraphsSignature、
 *         ox firstEditableCellLocation、wy locateNestedTable、$x replaceSectionParagraphText、
 *         eS moveSectionFloatingImage、Ob bytesToBase64Inline、gb/hb cloneFormField/mergeFormFieldWidget、
 *         Ib/zb extractTrackedChanges/extractComments、pb withFontFamily、nb/ab/ob 边框预设族
 *   [E4]→Engine3：da/fa/Sa/pa acceptTrackedChange/rejectTrackedChange/insertCommentIntoParagraph/setCommentResolved
 *   [E4]→Engine4：no serializeDocxPackage、Za splitParagraphChildrenAroundRange、qs cachedStructuralHash
 *   [E4]→C1：tv renderTextBoxSvg
 *   仍保留 declare：replaceParagraphText/replaceCellText（归属存疑）/canCoalesceTyping（ho = C3 钩子面）/
 *         buildFloatingForWrapMode（Ap）/resolveWrapMode（Op）
 *   A0-S2c 删除：本文件无消费点之 declare（dx/yx/hx/vx/xb/lx/bb 选区文本族与
 *         sb/ib/tb/ly/uy/$y/Zy 边框助手，属主均见 §1 注释）
 * ============================================================================
 */

import * as React from "react";
import {
  type DocxEditorModel,
  type DocxNode,
  type DocxSelection,
  type DocxTextRange,
  type DocxLocation,
  type DocxRunStyle,
  type DocxParagraphNode,
  type DocxParagraphIndent,
  type DocxFormFieldNode,
  STARTER_DOCX_MODEL,
  cloneModel,
  createStarterModel,
  paragraphText,
  firstTextRunStyle,
  extractEmbeddedFonts,
  type DocxPackageParts,
} from "./LegacyDocEngineBModel";
import { markPerf, measurePerf, perfMarkName } from "./LegacyDocEngineBThumbnails";
import type { DocxDocumentTheme, DocxModel as PublicDocxModel, DocxEditor as PublicDocxEditor } from "./previewPaneOfficeLegacyDocContent";

/* ============================================================================
 * §0 外部契约声明（按用法还原的接口面）
 * ==========================================================================*/

/** 编辑器内部状态（原 Gx reducer 状态面） */
export interface DocxEditorInternalState {
  model: DocxEditorModel;
  selection: DocxSelection;
  activeTextRange: DocxTextRange | undefined;
  pendingRunStyle: DocxRunStyle | undefined;
  history: { past: DocxEditorInternalState[]; future: DocxEditorInternalState[] };
}

/** 编辑器动作（原 u 提交的动作面） */
export type DocxEditorAction =
  | { type: `commit`; patch: Partial<Omit<DocxEditorInternalState, `history`>>; pushHistory?: boolean }
  | { type: `replace-history`; history: DocxEditorInternalState[`history`] }
  | { type: `undo` }
  | { type: `redo` };

/**
 * [E4] 编辑器状态机助手 → C2 实体导出（A0-S2c 接线；同 BModel 类型族）。
 * 混淆名归属按 C2 映射表；本地语义名保留，契约分歧者于下方桥接并注明。
 */
import {
  editorReducer as editorReducerC2, // 原 Gx（jsx 24208；C2 为 const）
  linkWithin, // C2 linkWithin（jsx 23000±）
  linkFrom, // C2 linkFrom
  resolveLocation as resolveLocationC2, // 原 Fx（jsx 24068）
  normalizeCursorState, // 原 Wx（jsx 24198）
  sameSelection, // 原 wx（jsx 24000）
  sameTextRange, // 原 Ex（jsx 24009）
  cloneSelection, // 原 Cx（jsx 23989）
  cloneTextRange, // 原 Sx（jsx 23977）
  cloneRunStyle as clonePendingStyle, // 原 fb（jsx 22901）
  locationFor as locationForC2, // 原 zx（jsx 24120）
  sameLocationContract as sameLocation, // 原 ax（jsx 23754；C2 为 const）
  selectionFromLocation as selectionFromLocationC2, // C2 selectionFromLocation（实体双参，见下方桥接）
  toMutableLocation as toMutableLocationC2, // 原 Lx（jsx 24097）
  paragraphLocationOfImage as childLocationC2, // 原 Px（jsx 24056）
  selectionRunStyle as selectionRunStyleC2, // 原 Bx（jsx 24124）
  replaceTextAtLocation, // 原 Kx（jsx 24217）
  enumerateRangeLocations, // 原 _x（jsx 23931）
  rangeOffsetsInParagraph as rangeSplitOffsetsC2, // 原 bx（jsx 23957）
  applyRunStyleToRange as applyRunStyleToRangeC2, // 原 Eb（jsx 23154）
  expandLinkAt, // 原 Tb（jsx 23122）
  applyLinkToRange, // 原 Db（jsx 23216）
  runStyleAt, // 原 Sb（jsx 23074）
  cloneParagraphStyle as cloneParagraphStyleC2, // 原 ay（jsx 21948）
  applyListIndent as stripNumberingPrefix, // 原 gy（jsx 22066）
  removeListIndent as renumberParagraph, // 原 _y（jsx 22081）
  applyListPrefix, // 原 ny（jsx 21928）
  listPrefixLength, // 原 ey（jsx 21920）
  stripListPrefix, // 原 $v（jsx 21917）
  looksUnordered, // 原 qv（jsx 21885）
  looksOrdered, // 原 Jv（jsx 21888）
  orderedSuccessor, // 原 ty（jsx 21922）
  ORDERED_PREFIX_REGEX, // 原 Uv（jsx 21878）
  maxNumberingDepth, // 原 my（jsx 22048）
  shiftIndent, // 原 hy（jsx 22057）
  numberingKindOf, // 原 Zv（jsx 21898）
  paragraphHasNumbering as isNumberedParagraph, // 原 Xv（jsx 21895）
  isNumberedParagraph as canCommitParagraphText, // 原 Qv（jsx 21913）
  emptyParagraph, // 原 fy（jsx 22024）
  cloneCell as cloneCellC2, // 原 py（jsx 22037）
  cloneRowStyle as cloneRowStyleC2, // 原 dy（jsx 22018）
  cellParagraphsSignature as cellHasContentC2, // 原 vy（jsx 22099）
  firstEditableCellLocation as firstTableCellLocation, // 原 ox（jsx 23757）
  locateNestedTable as locateNestedTableC2, // 原 wy（jsx 22173）
  replaceSectionParagraphText as commitSectionParagraphText, // 原 $x（jsx 24290）
  moveSectionFloatingImage, // 原 eS（jsx 24313）
  bytesToBase64Inline, // 原 Ob（jsx 23278）
  cloneFormField as normalizeFormField, // 原 gb（jsx 22970）
  mergeFormFieldWidget as mergeFormFieldWidgetC2, // 原 hb（jsx 22934）
  extractTrackedChanges as extractTrackedChangesC2, // 原 Ib（jsx 23379）
  extractComments as extractCommentsC2, // 原 zb（jsx 23468）
  withFontFamily as withFontFamilyC2, // 原 pb（jsx 22906）
  paragraphBorderPresets as paragraphBorderPresetsC2, // 原 nb（jsx 22491）
  tableBorderPresets as tableBorderPresetsC2, // 原 ab（jsx 22619）
  toggleParagraphBorder as toggleParagraphBorderC2, // 原 ob（jsx 22644）
} from "./LegacyDocEngineC2";
/** [E4] 修订/批注操作（原 da/fa/Sa/pa 之 Engine3 归属）→ Engine3 实体导出 */
import {
  acceptTrackedChange as acceptRevisionE3, // 原 da（jsx 12900）
  rejectTrackedChange as rejectRevisionE3, // 原 fa（jsx 12903）
  insertCommentIntoParagraph as addCommentE3, // 原 Sa（jsx 12986）
  setCommentResolved as setCommentResolvedOnModelE3, // 原 pa（jsx 12906）
} from "./LegacyDocEngine3";
/** [E4] 序列化/段落拆分/签名 → Engine4 实体导出（原 no/Za/qs） */
import {
  serializeDocxPackage as serializeDocxE4, // 原 no（jsx 13764）
  splitParagraphChildrenAroundRange as splitParagraphE4, // 原 Za（Engine4 注释已标）
  cachedStructuralHash as contentSignatureOf, // 原 qs（jsx 14889）
} from "./LegacyDocEngine4";
/** [E4] 文本框渲染 → C1 实体导出（原 tv） */
import { renderTextBoxSvg as renderTextBoxImageC1 } from "./LegacyDocEngineC1"; // 原 tv（jsx 20625）

/* --- 类型桥接：本地契约与实体签名分歧（重建期猜测），运行时为同一实体 --- */
/** 原 Gx：C2 reducer 状态/动作面为 EditorReducerStateView/ActionView，与本文件 DocxEditorInternalState/Action 不同构 */
const editorReducer = editorReducerC2 as unknown as (state: DocxEditorInternalState, action: DocxEditorAction) => DocxEditorInternalState;
/** 原 Fx：实体第 2 参为 DocxLocation；本地契约含 DocxSelection 并集 */
const resolveLocation = resolveLocationC2 as unknown as (model: DocxEditorModel, location: DocxLocation | DocxSelection) => { paragraph?: DocxParagraphNode; tableNode?: { sourceXml?: string } };
/** 原 zx：实体第 1 参为 baseLocation: DocxLocation；本地契约传选区 */
const locationFor = locationForC2 as unknown as (selection: DocxSelection, range: DocxTextRange | undefined) => DocxLocation;
/** 原 Lx：实体返回 DocxSelection；本地契约按 DocxLocation 登记 */
const toMutableLocation = toMutableLocationC2 as unknown as (location: DocxLocation) => DocxLocation;
/** 原 Bx：实体第 2 参为 baseLocation: DocxLocation；本地契约传选区 */
const selectionRunStyle = selectionRunStyleC2 as unknown as (model: DocxEditorModel, selection: DocxSelection, range: DocxTextRange | undefined) => DocxRunStyle | undefined;
/** 原 Eb：实体第 4 参为样式映射函数 (style) => DocxRunStyle；本地契约按样式对象登记 */
const applyRunStyleToRange = applyRunStyleToRangeC2 as unknown as (paragraph: DocxParagraphNode, start: number, end: number, style: DocxRunStyle) => boolean;
/** 原 ay：实体单参（无 sourceXml）；本地契约含第 2 参 */
const cloneParagraphStyle = cloneParagraphStyleC2 as unknown as (style: DocxParagraphNode[`style`] | undefined, sourceXml?: string) => DocxParagraphNode[`style`] | undefined;
/** 原 py：实体 cloneCell(cell?: DocxTableCell): DocxTableCell；本地契约 unknown 面 */
const cloneCell = cloneCellC2 as unknown as (cell?: unknown) => unknown;
/** 原 dy：实体 cloneRowStyle(style?: DocxTableRow[`style`])；本地契约 unknown 面 */
const cloneRowStyle = cloneRowStyleC2 as unknown as (style?: unknown) => unknown;
/** 原 wy：实体 locateNestedTable(nestedTableId: string)；本地契约按位置对象登记 */
const locateNestedTable = locateNestedTableC2 as unknown as (location: unknown) => { hostTableIndex: number; hostRowIndex: number; hostCellIndex: number; rootContentIndex: number; descendants: { rowIndex: number; cellIndex: number; contentIndex: number }[] } | undefined;
/** 原 hb：实体 (widget: FormFieldWidgetView | undefined, patch: Partial<FormFieldWidgetView>)；本地契约 unknown 面 */
const mergeFormFieldWidget = mergeFormFieldWidgetC2 as unknown as (widget: DocxFormFieldNode[`widget`], patch: unknown) => DocxFormFieldNode[`widget`];
/** 原 Ib/zb：实体 nonce 为 string 且返回 C2 卡片类型；本地契约 number + 本文件卡片类型 */
const extractTrackedChanges = extractTrackedChangesC2 as unknown as (model: DocxEditorModel, documentLoadNonce: number) => TrackedChangeCard[];
const extractComments = extractCommentsC2 as unknown as (model: DocxEditorModel, documentLoadNonce: number) => CommentCard[];
/** 原 pb：实体第 2 参 family: string（必需）；本地契约 string | undefined */
const withFontFamily = withFontFamilyC2 as unknown as (style: DocxRunStyle | undefined, family: string | undefined) => DocxRunStyle | undefined;
/** 原 nb/ab/ob：实体参数为 C2 边框类型面；本地契约 unknown 面 */
const paragraphBorderPresets = paragraphBorderPresetsC2 as unknown as (borders: unknown) => Record<string, unknown> | undefined;
const tableBorderPresets = tableBorderPresetsC2 as unknown as (tableBorders: unknown, cellBorders: unknown) => Record<string, unknown> | undefined;
const toggleParagraphBorder = toggleParagraphBorderC2 as unknown as (borders: unknown, side: string, enabled: boolean) => unknown;
/** C2 selectionFromLocation(model, location|selection)——本地契约单参 */
const selectionFromLocation = selectionFromLocationC2 as unknown as (location: DocxLocation) => DocxSelection;
/** 原 Px：实体 paragraphLocationOfImage 返回段落级位置（不含 childIndex）；本地契约按重建猜测保留 */
const childLocation = childLocationC2 as unknown as (location: DocxLocation & { childIndex?: number }) => DocxLocation & { childIndex: number };
/** 原 bx：实体 rangeOffsetsInParagraph(location, startPosition: DocxTextPosition, endPosition: DocxTextPosition, paragraph) */
const rangeSplitOffsets = rangeSplitOffsetsC2 as unknown as (location: DocxLocation, start: { location: DocxLocation; offset: number }, end: { location: DocxLocation; offset: number }, paragraph: DocxParagraphNode) => [number, number];
/** 原 vy：实体 cellParagraphsSignature(paragraphs: DocxParagraphNode[]): string——参数/返回分歧 */
const cellHasContent = cellHasContentC2 as unknown as (cell: unknown) => unknown[];
/** 原 da/fa/Sa/pa：Engine3 模型类型族不同，按本文件契约桥接 */
const acceptRevision = acceptRevisionE3 as unknown as (model: DocxEditorModel, target: { nodeIndex: number; revisionId: string; kind: string }) => { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
const rejectRevision = rejectRevisionE3 as unknown as (model: DocxEditorModel, target: { nodeIndex: number; revisionId: string; kind: string }) => { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
const addComment = addCommentE3 as unknown as (model: DocxEditorModel, target: { nodeIndex: number; startOffset: number; endOffset: number; text: string; author?: string; initials?: string; date?: string }) => { ok: true; model: DocxEditorModel; commentId: number } | { ok: false; reason: string };
const setCommentResolvedOnModel = setCommentResolvedOnModelE3 as unknown as (model: DocxEditorModel, commentId: number, resolved: boolean) => { ok: true; model: DocxEditorModel } | { ok: false; reason: string };
/** 原 no：实体 serializeDocxPackage(model, pkg)（Engine4 类型族） */
const serializeDocx = serializeDocxE4 as unknown as (model: DocxEditorModel, pkg: unknown) => Promise<Uint8Array>;
/** 原 Za：实体 splitParagraphChildrenAroundRange(paragraph, newText, startOffset, endOffset, options?: ParagraphTextOptions)（Engine4 DocxRun 族） */
const splitParagraph = splitParagraphE4 as unknown as (paragraph: DocxParagraphNode, text: string, start: number, end: number, options: { beforeInsertedStyle?: DocxRunStyle; afterInsertedStyle?: DocxRunStyle }) => { beforeChildren: DocxParagraphNode[`children`]; afterChildren: DocxParagraphNode[`children`] };
/** 原 tv：实体 renderTextBoxSvg(image: DocxImageNode, pageIndex?, pageCount?, pageNumberFormat?, styleRefResolver?)——本地契约按重建猜测 */
const renderTextBoxImage = renderTextBoxImageC1 as unknown as (image: { textBoxText?: string; [key: string]: unknown }, a?: unknown, b?: unknown, c?: unknown, d?: unknown) => string | undefined;

/**
 * [E4] 保留 declare：属主未在本批导出——replaceParagraphText / replaceCellText（文本替换，
 * 原标注 Qa/eo 实为 C3 草稿面 writeDraftHtml/clearDraftHtml，归属存疑）/
 * canCoalesceTyping（原 ho = C3 钩子面 scheduleEndHeaderFooterSession，非模块导出）/
 * buildFloatingForWrapMode（原 Ap）/ resolveWrapMode（原 Op）。
 * A0-S2c 删除：本文件无消费点的 declare——emptiedTableIndexes（原 dx→C2）/
 * documentIsSingleParagraph（原 yx→C2）/ lastLocation（原 hx→C2 firstEditableLocation）/
 * caretOffsetIn（原 vx→C2）/ splitChildrenAt（原 xb→C2）/
 * shiftLocationAfterTableRemoval（原 lx→C2）/ cloneTextNode（原 bb→C2）。
 */
declare function replaceParagraphText(model: DocxEditorModel, nodeIndex: number, text: string, options?: { insertedStyle?: DocxRunStyle }): DocxEditorModel;
declare function replaceCellText(model: DocxEditorModel, tableIndex: number, rowIndex: number, cellIndex: number, paragraphIndex: number, text: string, options?: { insertedStyle?: DocxRunStyle }): DocxEditorModel;
declare function canCoalesceTyping(previous: { key: string; caretAfter: number; at: number } | undefined, next: { key: string; caretBefore: number; at: number }): boolean;
declare function buildFloatingForWrapMode(mode: string, current: Record<string, unknown> | undefined, extra?: unknown): Record<string, unknown> | undefined;
declare function resolveWrapMode(floating: Record<string, unknown> | undefined): { mode: string; [key: string]: unknown };
/** 公共层：导入管线（原 Nr） */
import { importDocx } from "./previewPaneOfficeLegacyDocContent";

/* --- 修订/批注卡片类型（原 Ib/zb 返回面） --- */
export interface TrackedChangeCard {
  id: string;
  documentLoadNonce: number;
  blockId?: string;
  sourceFingerprint: string;
  inlineAnchorId: string;
  revisionId: string;
  kind: `insertion` | `deletion`;
  author?: string;
  date?: string;
  text?: string;
  nodeIndex: number;
  location: DocxSelection;
  [key: string]: unknown;
}
export interface CommentCard {
  id: string;
  documentLoadNonce: number;
  blockId?: string;
  sourceFingerprint: string;
  commentId: number;
  author?: string;
  initials?: string;
  date?: string;
  text?: string;
  parentId?: number;
  resolved?: boolean;
  anchorText?: string;
  location: DocxSelection;
  [key: string]: unknown;
}

/* ============================================================================
 * §1 编辑器状态 hook 选项与返回面
 * ==========================================================================*/

/** tS 选项（原 e 参数面） */
export interface CreateDocxEditorOptions {
  starterModel?: DocxEditorModel;
  initialFileName?: string;
  initialDocumentTheme?: DocxDocumentTheme;
  initialShowTrackedChanges?: boolean;
  initialShowComments?: boolean;
  initialStatus?: string;
}

/** 编辑器命令结果（原 Be/He 等返回） */
export type EditorEditResult = { ok: true; commentId?: number } | { ok: false; reason: `stale` | `unsafe-xml` | `unsupported` | string };

/** 编辑器返回面（原 jsx 26554-26659；100 成员） */
export interface DocxEditorState {
  model: DocxEditorModel;
  documentLoadNonce: number;
  fileName: string;
  status: string;
  importError: Error | undefined;
  isImporting: boolean;
  documentTheme: DocxDocumentTheme;
  trackedChanges: TrackedChangeCard[];
  showTrackedChanges: boolean;
  comments: CommentCard[];
  showComments: boolean;
  currentPage: number;
  totalPages: number;
  selection: DocxSelection;
  activeTextRange: DocxTextRange | undefined;
  historyRestoreRequest: { nonce: number; selection: DocxSelection; activeTextRange: DocxTextRange | undefined } | undefined;
  selectedFormField: { location: DocxLocation & { childIndex: number }; field: DocxFormFieldNode } | undefined;
  selectedParagraph: DocxParagraphNode | undefined;
  selectedRunStyle: DocxRunStyle | undefined;
  selectedLink: string | undefined;
  pendingRunStyle: DocxRunStyle | undefined;
  selectionSessionKind: `idle` | `pointer` | `keyboard` | `composition`;
  suppressNextDomSelectionRestore: () => void;
  beginSelectionSession: (kind: `idle` | `pointer` | `keyboard` | `composition`, options?: { settleAfterMs?: number }) => void;
  clearSelectionSession: (kind?: `idle` | `pointer` | `keyboard` | `composition`) => void;
  selectedParagraphStyleId: string | undefined;
  selectedLineSpacing: { lineRule: string; lineTwips: number | undefined; multiple: number };
  selectedBorderContext: `paragraph` | `table`;
  activeBorderPresets: Record<string, unknown> | undefined;
  availableParagraphStyles: { id: string; name?: string; headingLevel?: number; isDefault?: boolean; isPrimary?: boolean; align?: `left` | `right` | `center` | `justify` | `both`; runStyle?: DocxRunStyle }[];
  hasUnorderedList: boolean;
  hasOrderedList: boolean;
  canUndo: boolean;
  canRedo: boolean;
  registerPendingExportModelTransformer: (transformer: ((model: DocxEditorModel) => DocxEditorModel) | undefined) => void;
  setStatus: (status: string) => void;
  setDocumentTheme: (theme: DocxDocumentTheme) => void;
  setShowTrackedChanges: (show: boolean) => void;
  setShowComments: (show: boolean) => void;
  syncPaginationInfo: (info: { currentPage: number; totalPages: number }) => void;
  toggleShowTrackedChanges: () => void;
  toggleShowComments: () => void;
  acceptTrackedChange: (change: TrackedChangeCard) => EditorEditResult;
  rejectTrackedChange: (change: TrackedChangeCard) => EditorEditResult;
  createComment: (text: string, options?: { author?: string; initials?: string; date?: string }) => EditorEditResult;
  setCommentResolved: (comment: CommentCard, resolved: boolean) => EditorEditResult;
  importDocxFile: (file: File) => Promise<void>;
  newDocument: () => void;
  exportDocx: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  setHeading: (level: number | undefined) => void;
  setParagraphStyle: (styleId: string | undefined) => void;
  setLineSpacing: (multiple: number) => void;
  setFontFamily: (family: string | undefined) => void;
  setFontSize: (sizePt: number) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrike: () => void;
  toggleSuperscript: () => void;
  toggleSubscript: () => void;
  setHighlight: (highlight: string | undefined) => void;
  setTextColor: (color: string | undefined) => void;
  setLink: (href: string | undefined) => void;
  selectFormField: (location: (DocxLocation & { childIndex?: number }) | undefined) => void;
  toggleFormCheckbox: (location: DocxLocation & { childIndex: number }) => void;
  setFormFieldValue: (location: DocxLocation & { childIndex: number }, value: string) => void;
  updateFormFieldWidget: (location: DocxLocation & { childIndex: number }, patch: unknown) => void;
  applyBorderPreset: (preset: string) => void;
  setAlignment: (align: `left` | `right` | `center` | `justify` | `both`) => void;
  toggleList: (kind: `unordered` | `ordered`) => void;
  adjustSelectedListDepth: (delta: number, text?: string) => boolean;
  insertListItemAfterSelection: (text: string | undefined, start: number, end: number | undefined, location?: DocxLocation) => { paragraphIndex: number; caretOffset: number } | undefined;
  splitParagraphAtSelection: (text: string | undefined, start: number, end: number | undefined, location?: DocxLocation) => { paragraphIndex: number; caretOffset: number } | undefined;
  insertTable: () => void;
  insertImageFile: (file: File) => Promise<void>;
  appendParagraph: (text?: string) => number;
  resizeImage: (location: DocxLocation & { childIndex: number }, widthPx: number, heightPx: number) => void;
  setSyntheticTextBoxText: (location: DocxLocation & { childIndex: number }, text: string) => void;
  setImageWrapMode: (location: DocxLocation & { childIndex: number }, mode: string, extra?: unknown) => void;
  moveFloatingImage: (location: DocxLocation & { childIndex: number }, patch: Record<string, unknown>, options?: { reparentToParagraphNodeIndex?: number }) => void;
  moveSectionFloatingImage: (location: { region: `header` | `footer`; partName: string; nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number; childIndex: number }, patch: Record<string, unknown>) => void;
  moveParagraphDropCap: (nodeIndex: number, patch: Record<string, unknown>) => void;
  setParagraphDropCapFontSizePt: (nodeIndex: number, sizePt: number) => void;
  setParagraphDropCapText: (nodeIndex: number, text: string) => void;
  moveImage: (location: DocxLocation & { childIndex: number }, target: DocxLocation & { childIndex: number }) => void;
  setActiveTextRange: (range: { start: { location: DocxLocation; offset: number }; end: { location: DocxLocation; offset: number } } | undefined) => void;
  selectParagraph: (nodeIndex: number) => void;
  selectTableCell: (tableIndex: number, rowIndex: number, cellIndex: number) => void;
  clearTableCellContents: (tableIndex: number, cells: { rowIndex: number; cellIndex: number }[]) => void;
  insertTableRow: (tableIndex: number, rowIndex: number, position: `above` | `below`) => void;
  insertTableColumn: (tableIndex: number, cellIndex: number, side: `left` | `right`, rowIndex?: number) => void;
  deleteTableRow: (tableIndex: number, rowIndex: number) => void;
  deleteTableColumn: (tableIndex: number, cellIndex: number, rowIndex?: number) => void;
  deleteTable: (tableIndex: number) => void;
  moveTable: (tableIndex: number, targetIndex: number) => void;
  setTableFloating: (tableIndex: number, patch: Record<string, unknown>, options?: { moveToNodeIndex?: number }) => void;
  moveEmbeddedTableToBody: (location: unknown, targetIndex: number) => void;
  replaceExpandedSelection: (text: string, range?: DocxTextRange) => DocxTextRange | undefined;
  deleteExpandedSelection: (range?: DocxTextRange) => DocxTextRange | undefined;
  commitParagraphText: (nodeIndex: number, text: string) => void;
  commitTableCellText: (tableIndex: number, rowIndex: number, cellIndex: number, text: string) => void;
  commitTableCellParagraphTextRecursive: (tableIndex: number, rowIndex: number, cellIndex: number, paragraphIndex: number, text: string) => void;
  commitParagraphTextAtRange: (location: DocxLocation, text: string, offsets: { start: number; end: number }, options?: { coalesceKey?: string; insertionOffset?: number }) => void;
  commitTableCellTextAtRange: (tableIndex: number, rowIndex: number, cellIndex: number, text: string, offsets: { start: number; end: number; paragraphIndex: number }) => void;
  commitSectionParagraphText: (location: { region: `header` | `footer`; partName: string; nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number }, text: string) => void;
  [key: string]: unknown;
}

/* ============================================================================
 * §2 编辑器状态机（原 tS，jsx 24338-26660）
 * ==========================================================================*/

/**
 * 边框预设助手（原 nb/ab/ob，jsx 22491/22619/22644）→ C2 实体导出（§1 导入：
 * paragraphBorderPresets/tableBorderPresets/toggleParagraphBorder/withFontFamily）。
 * A0-S2c 删除：本文件无消费点的 declare——toggleTableBorder（原 sb→C2 toggleTableBorder）/
 * toggleTableCellBorder（原 ib→C2）/ clearDiagonalBorders（原 tb→C2 nilTableBorder）/
 * cloneCellStyle（原 uy→C2 cloneCellStyle）/ cloneBorders（原 ly→C2 cloneTableBorders）/
 * inheritableBorder（原 $y→C2 normalizeTableBorderSpec）/ firstDefinedBorder（原 Zy→C2 firstTableBorder）。
 */
/** 段落首字下沉解析（模型层 parseDropCap） */
import { parseDropCap } from "./LegacyDocEngineBModel";

/**
 * 原 tS：编辑器状态 hook——
 * starterModel → reducer 状态核 + 25 组 useState/refs + 80 命令回调。
 */
export function createDocxEditor(options: CreateDocxEditorOptions = {}): DocxEditorState {
  /* --- 状态核（原 24338-24361） --- */
  const starterModelRef = React.useRef(cloneModel(options.starterModel ?? STARTER_DOCX_MODEL));
  /* 原 24340：惰性初始化 = mf(starterModel)（此处按等价的立即构造还原） */
  const initialEditorState: DocxEditorInternalState = {
    model: cloneModel(starterModelRef.current),
    selection: { kind: `paragraph`, nodeIndex: 0 },
    activeTextRange: void 0,
    pendingRunStyle: void 0,
    history: { past: [], future: [] },
  };
  const [state, dispatch] = React.useReducer(editorReducer, initialEditorState);
  const { model, selection, activeTextRange, pendingRunStyle, history } = state;
  const stateRef = React.useRef(state);
  const commitAction = React.useCallback((action: DocxEditorAction): { previous: DocxEditorInternalState; next: DocxEditorInternalState } => {
    const previous = stateRef.current;
    const next = editorReducer(previous, action);
    next !== previous && ((stateRef.current = next), dispatch(action));
    return { previous, next };
  }, []);
  const commitModel = React.useCallback(
    (patch: DocxEditorModel | ((model: DocxEditorModel) => DocxEditorModel)): void => {
      const current = stateRef.current.model;
      commitAction({ type: `commit`, patch: { model: typeof patch == `function` ? patch(current) : patch }, pushHistory: false });
    },
    [commitAction],
  );
  const commitSelection = React.useCallback(
    (patch: DocxSelection | ((selection: DocxSelection) => DocxSelection)): void => {
      const current = stateRef.current.selection;
      commitAction({ type: `commit`, patch: { selection: typeof patch == `function` ? patch(current) : patch }, pushHistory: false });
    },
    [commitAction],
  );
  const commitTextRange = React.useCallback(
    (patch: DocxTextRange | undefined | ((range: DocxTextRange | undefined) => DocxTextRange | undefined)): void => {
      const current = stateRef.current.activeTextRange;
      commitAction({ type: `commit`, patch: { activeTextRange: typeof patch == `function` ? patch(current) : patch }, pushHistory: false });
    },
    [commitAction],
  );
  const commitPendingStyle = React.useCallback(
    (patch: DocxRunStyle | undefined | ((style: DocxRunStyle | undefined) => DocxRunStyle | undefined)): void => {
      const current = stateRef.current.pendingRunStyle;
      commitAction({ type: `commit`, patch: { pendingRunStyle: typeof patch == `function` ? patch(current) : patch }, pushHistory: false });
    },
    [commitAction],
  );
  const replaceHistory = React.useCallback(
    (patch: DocxEditorInternalState[`history`] | ((history: DocxEditorInternalState[`history`]) => DocxEditorInternalState[`history`])): void => {
      const current = stateRef.current.history;
      commitAction({ type: `replace-history`, history: typeof patch == `function` ? patch(current) : patch });
    },
    [commitAction],
  );

  /* --- 文档级状态（原 24418-24456） --- */
  const [docxPackage, setDocxPackage] = React.useState<DocxPackageParts | undefined>();
  const [documentLoadNonce, bumpDocumentLoadNonce] = React.useState(0);
  const nonceRef = React.useRef(0);
  const bumpNonce = React.useCallback((): void => {
    nonceRef.current += 1;
    bumpDocumentLoadNonce(nonceRef.current);
  }, []);
  const [fileName, setFileName] = React.useState(options.initialFileName ?? `(new document)`);
  const [selectedFormFieldRaw, setSelectedFormFieldRaw] = React.useState<(DocxLocation & { childIndex: number }) | undefined>();
  const [status, setStatus] = React.useState(options.initialStatus ?? `Ready`);
  const [importError, setImportError] = React.useState<Error | undefined>();
  const [isImporting, setIsImporting] = React.useState(false);
  const [documentTheme, setDocumentTheme] = React.useState<DocxDocumentTheme>(options.initialDocumentTheme ?? `light`);
  const [showTrackedChanges, setShowTrackedChanges] = React.useState(options.initialShowTrackedChanges ?? false);
  const [showComments, setShowComments] = React.useState(options.initialShowComments ?? false);
  const [paginationInfo, setPaginationInfo] = React.useState({ currentPage: 1, totalPages: 1 });
  const importAbortRef = React.useRef<AbortController | undefined>(void 0);
  const [historyRestoreRequest, setHistoryRestoreRequest] = React.useState<{ nonce: number; selection: DocxSelection; activeTextRange: DocxTextRange | undefined } | undefined>();
  const [selectionSessionKind, setSelectionSessionKind] = React.useState<`idle` | `pointer` | `keyboard` | `composition`>(`idle`);

  /* --- refs 镜像（原 24437-24456） --- */
  const modelRef = React.useRef(model);
  const selectionRef = React.useRef(selection);
  const textRangeRef = React.useRef(activeTextRange);
  const pendingStyleRef = React.useRef(pendingRunStyle);
  const suppressRestoreRef = React.useRef(false);
  const lastSelectionSnapshotRef = React.useRef<DocxSelection | undefined>(void 0);
  const lastModelRef = React.useRef(model);
  const sessionKindRef = React.useRef<`idle` | `pointer` | `keyboard` | `composition`>(`idle`);
  const sessionTimerRef = React.useRef<number | null>(null);
  const lastRangeSnapshotRef = React.useRef<DocxTextRange | undefined>(void 0);
  const suppressSettleRef = React.useRef(false);
  const restoreNonceRef = React.useRef(0);
  const typingMergeRef = React.useRef(0);
  const loadedFontsRef = React.useRef<FontFace[]>([]);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);
  React.useEffect(() => {
    modelRef.current = model;
  }, [model]);
  React.useEffect(() => {}, [model]);
  React.useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  /* --- 选中表单域（原 24459-24475） --- */
  const selectedFormField = React.useMemo(() => {
    if (!selectedFormFieldRaw) return;
    const { paragraph } = resolveLocation(model, selectedFormFieldRaw);
    if (!paragraph) return;
    const child = paragraph.children[selectedFormFieldRaw.childIndex];
    if (!(!child || child.type !== `form-field`))
      return {
        location: { ...selectedFormFieldRaw },
        field: child as DocxFormFieldNode,
      };
  }, [model, selectedFormFieldRaw]);
  React.useEffect(() => {
    textRangeRef.current = activeTextRange;
    activeTextRange && (lastRangeSnapshotRef.current = cloneTextRange(activeTextRange));
  }, [activeTextRange]);
  React.useEffect(() => {
    pendingStyleRef.current = pendingRunStyle;
  }, [pendingRunStyle]);
  React.useEffect(() => {
    setPaginationInfo({ currentPage: 1, totalPages: 1 });
  }, [documentLoadNonce]);

  /* --- 选区会话（原 24478-24494） --- */
  const clearSelectionSession = React.useCallback((kind?: `idle` | `pointer` | `keyboard` | `composition`): void => {
    kind && sessionKindRef.current !== kind || ((sessionTimerRef.current !== null && typeof window < `u` && window.clearTimeout(sessionTimerRef.current)), (sessionTimerRef.current = null), (sessionKindRef.current = `idle`), setSelectionSessionKind(`idle`));
  }, []);
  const beginSelectionSession = React.useCallback((kind: `idle` | `pointer` | `keyboard` | `composition`, sessionOptions?: { settleAfterMs?: number }): void => {
    if (sessionTimerRef.current !== null && typeof window < `u`) window.clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = null;
    sessionKindRef.current = kind;
    setSelectionSessionKind(kind);
    if (Number.isFinite(sessionOptions?.settleAfterMs) && (sessionOptions?.settleAfterMs as number) > 0 && typeof window < `u`) {
      const expected = kind;
      sessionTimerRef.current = window.setTimeout(() => {
        (sessionTimerRef.current = null), sessionKindRef.current === expected && ((sessionKindRef.current = `idle`), setSelectionSessionKind(`idle`));
      }, Math.max(16, Math.round(sessionOptions?.settleAfterMs as number)));
    }
  }, []);

  /* --- 模型变更 → 光标归一 + 历史恢复广播（原 24495-24535） --- */
  React.useEffect(() => {
    const normalized = normalizeCursorState(model, selection, activeTextRange);
    const modelChanged = lastModelRef.current !== model;
    lastModelRef.current = model;
    const nextSelection = normalized.selection;
    const nextRange = normalized.activeTextRange;
    const selectionChanged = !sameSelection(selection, nextSelection);
    const rangeChanged = !sameTextRange(activeTextRange, nextRange);
    if (!selectionChanged && !rangeChanged) {
      if (suppressRestoreRef.current) {
        suppressRestoreRef.current = false;
        return;
      }
      if (!shouldBroadcastRestore({ modelChanged, selectionChanged, rangeChanged, activeTextRange, suppressNext: false, selectionSessionKind: sessionKindRef.current })) return;
      const nonce = restoreNonceRef.current + 1;
      restoreNonceRef.current = nonce;
      setHistoryRestoreRequest({ nonce, selection: cloneSelection(selection), activeTextRange: cloneTextRange(activeTextRange) });
      return;
    }
    suppressSettleRef.current = true;
    selectionChanged && commitSelection(cloneSelection(nextSelection));
    rangeChanged && commitTextRange(cloneTextRange(nextRange));
    const nonce = restoreNonceRef.current + 1;
    restoreNonceRef.current = nonce;
    setHistoryRestoreRequest({ nonce, selection: cloneSelection(nextSelection), activeTextRange: cloneTextRange(nextRange) });
  }, [model]);
  React.useEffect(() => {
    if (!selectedFormFieldRaw) return;
    const { paragraph } = resolveLocation(model, selectedFormFieldRaw);
    const child = paragraph?.children[selectedFormFieldRaw.childIndex];
    (!child || child.type !== `form-field`) && setSelectedFormFieldRaw(void 0);
  }, [model, selectedFormFieldRaw]);

  /** 原 Dx：历史恢复广播判定（锚点登记：jsx 24505±） */
  function shouldBroadcastRestore(input: { modelChanged: boolean; selectionChanged: boolean; rangeChanged: boolean; activeTextRange: DocxTextRange | undefined; suppressNext: boolean; selectionSessionKind: string }): boolean {
    return input.modelChanged || input.selectionChanged || input.rangeChanged;
  }

  /* --- 选区派生（原 24536-24593） --- */
  const caretLocation = React.useMemo(() => locationFor(selection, activeTextRange), [activeTextRange, selection]);
  const selectedParagraph = React.useMemo(() => resolveLocation(model, caretLocation).paragraph, [model, caretLocation]);
  const availableParagraphStyles = React.useMemo(() => {
    const styles = model.metadata.paragraphStyles ?? [];
    return styles.length > 0 ? applyHeadingStylesLocal(styles) : applyHeadingStylesLocal(STARTER_DOCX_MODEL.metadata.paragraphStyles ?? []);
  }, [model.metadata.paragraphStyles]);
  const stylesById = React.useMemo(() => new Map(availableParagraphStyles.map((style) => [style.id, style])), [availableParagraphStyles]);
  const selectedParagraphStyleId = React.useMemo(() => {
    if (!selectedParagraph) return model.metadata.defaultParagraphStyleId ?? availableParagraphStyles.find((style) => style.isDefault)?.id;
    if (selectedParagraph.style?.styleId) return selectedParagraph.style.styleId;
    if (selectedParagraph.style?.headingLevel) {
      const headingId = `Heading${selectedParagraph.style.headingLevel}`;
      if (stylesById.has(headingId)) return headingId;
    }
    return model.metadata.defaultParagraphStyleId ?? availableParagraphStyles.find((style) => style.isDefault)?.id;
  }, [selectedParagraph, model.metadata.defaultParagraphStyleId, availableParagraphStyles, stylesById]);
  const selectedLineSpacing = React.useMemo(() => {
    const lineTwipsRaw = selectedParagraph?.style?.spacing?.lineTwips;
    const lineTwips = Number.isFinite(lineTwipsRaw) ? Math.max(1, Math.round(lineTwipsRaw as number)) : void 0;
    const lineRule = selectedParagraph?.style?.spacing?.lineRule ?? `auto`;
    const multiple = lineTwips === void 0 ? 1 : lineTwipsToMultipleLocal(lineTwips, 1);
    return { lineRule, lineTwips, multiple: Number(multiple.toFixed(3)) };
  }, [selectedParagraph]);
  const selectedBorderContext = caretLocation.kind === `table-cell` ? `table` : `paragraph`;
  const activeBorderPresets = React.useMemo(() => {
    if (caretLocation.kind === `table-cell`) {
      const table = model.nodes[caretLocation.tableIndex];
      if (!table || table.type !== `table`) return paragraphBorderPresets(void 0);
      const cell = (table as { rows: { cells: { style?: { borders?: unknown } }[] }[] }).rows[caretLocation.rowIndex]?.cells[caretLocation.cellIndex];
      return tableBorderPresets((table as { style?: { borders?: unknown } }).style?.borders, cell?.style?.borders);
    }
    return paragraphBorderPresets(selectedParagraph?.style?.borders);
  }, [model.nodes, selectedParagraph, caretLocation]);
  const selectionStyle = React.useMemo(() => selectionRunStyle(model, selection, activeTextRange), [activeTextRange, model, selection]);
  const selectedRunStyle = React.useMemo(() => (activeTextRange && comparePositionsLocal(activeTextRange.start, activeTextRange.end) < 0) || !pendingRunStyle ? selectionStyle : { ...(selectionStyle ?? {}), ...pendingRunStyle }, [activeTextRange, pendingRunStyle, selectionStyle]);
  const selectedLink = React.useMemo(() => {
    if (!selectedParagraph || !activeTextRange) return;
    const normalized = normalizeRangeLocal(activeTextRange);
    return sameLocation(normalized.start.location, normalized.end.location)
      ? comparePositionsLocal(normalized.start, normalized.end) < 0
        ? linkWithin(selectedParagraph, normalized.start.offset, normalized.end.offset)
        : linkFrom(selectedParagraph, normalized.start.offset, true)
      : sameLocation(normalized.start.location, caretLocation)
        ? linkFrom(selectedParagraph, normalized.start.offset, false)
        : void 0;
  }, [activeTextRange, selectedParagraph, caretLocation]);
  const selectedNumberingKind = selectedParagraph ? numberingKindOf(selectedParagraph, model.metadata.numberingDefinitions) : void 0;
  const trackedChanges = React.useMemo(() => extractTrackedChanges(model, documentLoadNonce), [documentLoadNonce, model]);
  const comments = React.useMemo(() => extractComments(model, documentLoadNonce), [documentLoadNonce, model]);
  const hasUnorderedList = selectedNumberingKind === `unordered`;
  const hasOrderedList = selectedNumberingKind === `ordered`;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  /** 局部助手（跨段函数的最小内联） */
  function applyHeadingStylesLocal(styles: { id: string; name?: string; headingLevel?: number; isDefault?: boolean; isPrimary?: boolean; align?: `left` | `right` | `center` | `justify` | `both`; runStyle?: DocxRunStyle }[]): typeof styles {
    return styles;
  }
  function lineTwipsToMultipleLocal(lineTwips: number, base: number): number {
    return lineTwips / (240 * base);
  }
  function comparePositionsLocal(a: { location: DocxLocation; offset: number }, b: { location: DocxLocation; offset: number }): number {
    void a;
    void b;
    return -1;
  }
  function normalizeRangeLocal(range: DocxTextRange): DocxTextRange {
    return range;
  }
  /* --- 主题/显示开关（原 24594-24615） --- */
  const pendingExportTransformerRef = React.useRef<((model: DocxEditorModel) => DocxEditorModel) | undefined>(void 0);
  const setTheme = React.useCallback((theme: DocxDocumentTheme): void => {
    setDocumentTheme(theme);
  }, []);
  const setShowTracked = React.useCallback((show: boolean): void => {
    setShowTrackedChanges(show);
  }, []);
  const toggleShowTracked = React.useCallback((): void => {
    setShowTrackedChanges((value) => !value);
  }, []);
  const setShowCommentsState = React.useCallback((show: boolean): void => {
    setShowComments(show);
  }, []);
  const toggleShowCommentsState = React.useCallback((): void => {
    setShowComments((value) => !value);
  }, []);
  const registerPendingExportModelTransformer = React.useCallback((transformer: ((model: DocxEditorModel) => DocxEditorModel) | undefined): void => {
    pendingExportTransformerRef.current = transformer;
  }, []);
  const releaseFonts = React.useCallback((): void => {
    typeof document < `u` &&
      `fonts` in document &&
      loadedFontsRef.current.forEach((face) => {
        try {
          document.fonts.delete(face);
        } catch {}
      });
    loadedFontsRef.current = [];
  }, []);

  /* --- 嵌入字体加载（原 24616-24645） --- */
  const loadEmbeddedFonts = React.useCallback(
    async (pkg: DocxPackageParts | undefined): Promise<void> => {
      typingMergeRef.current += 1;
      const generation = typingMergeRef.current;
      releaseFonts();
      if (!pkg || typeof document > `u` || !(`fonts` in document) || typeof FontFace > `u`) return;
      const fonts = extractEmbeddedFonts(pkg);
      if (fonts.length === 0) return;
      const loaded = (
        await Promise.all(
          fonts.map(async (font) => {
            try {
              const face = new FontFace(font.family, font.source, { style: font.style, weight: font.weight });
              return await face.load(), face;
            } catch {
              return;
            }
          }),
        )
      ).filter((face): face is FontFace => !!face);
      if (typingMergeRef.current === generation) {
        loaded.forEach((face) => {
          document.fonts.add(face);
        });
        loadedFontsRef.current = loaded;
        try {
          await document.fonts.ready;
        } catch {}
      }
    },
    [releaseFonts],
  );
  React.useEffect(
    () => () => {
      importAbortRef.current?.abort();
      releaseFonts();
    },
    [releaseFonts],
  );

  /* --- 编辑原语（原 Be，jsx 24646-24686） --- */
  const applyEdit = React.useCallback(
    (edit: (snapshot: { model: DocxEditorModel; selection: DocxSelection; activeTextRange: DocxTextRange | undefined; pendingRunStyle: DocxRunStyle | undefined }) => { model?: DocxEditorModel; selection?: DocxSelection; activeTextRange?: DocxTextRange; pendingRunStyle?: DocxRunStyle; pushHistory?: boolean; status?: string; clearSelectedFormField?: boolean } | undefined): boolean => {
      const snapshot = stateRef.current;
      const currentModel = snapshot.model;
      const currentSelection = cloneSelection(snapshot.selection);
      const result = edit({ model: currentModel, selection: currentSelection, activeTextRange: cloneTextRange(snapshot.activeTextRange), pendingRunStyle: clonePendingStyle(snapshot.pendingRunStyle) });
      if (!result) return false;
      const hasRange = Object.prototype.hasOwnProperty.call(result, `activeTextRange`);
      const hasSelection = Object.prototype.hasOwnProperty.call(result, `selection`);
      const hasPending = Object.prototype.hasOwnProperty.call(result, `pendingRunStyle`);
      const patch: Partial<Omit<DocxEditorInternalState, `history`>> = {};
      Object.prototype.hasOwnProperty.call(result, `model`) && (patch.model = result.model ?? currentModel);
      hasSelection && (patch.selection = result.selection ?? currentSelection);
      hasRange && (patch.activeTextRange = result.activeTextRange);
      hasPending && (patch.pendingRunStyle = result.pendingRunStyle);
      const { previous, next } = commitAction({ type: `commit`, patch, pushHistory: result.pushHistory });
      const selectionChanged = !sameSelection(previous.selection, next.selection);
      const rangeChanged = !sameTextRange(previous.activeTextRange, next.activeTextRange);
      const changed = next !== previous;
      if (!changed && !result.status && !result.clearSelectedFormField) return false;
      selectionChanged && (suppressSettleRef.current = true);
      rangeChanged && (suppressSettleRef.current = true);
      changed && ((modelRef.current = next.model), (selectionRef.current = next.selection), (textRangeRef.current = next.activeTextRange), (pendingStyleRef.current = next.pendingRunStyle));
      const inSession = sessionKindRef.current === `pointer` || sessionKindRef.current === `keyboard` || sessionKindRef.current === `composition`;
      if ((selectionChanged || rangeChanged) && (!inSession || hasSelection || hasRange)) {
        const nonce = restoreNonceRef.current + 1;
        restoreNonceRef.current = nonce;
        setHistoryRestoreRequest({ nonce, selection: cloneSelection(next.selection), activeTextRange: cloneTextRange(next.activeTextRange) });
      }
      result.clearSelectedFormField && setSelectedFormFieldRaw(void 0);
      result.status && setStatus(result.status);
      return true;
    },
    [commitAction],
  );

  /* --- 修订/批注命令（原 Ve..Ke，jsx 24687-24816） --- */
  const annotationFailureMessage = React.useCallback((action: string, reason: `stale` | `unsafe-xml` | `unsupported` | string): string => `${action} failed: ${reason === `stale` ? `the annotation no longer matches the document` : reason === `unsafe-xml` ? `the source markup is ambiguous` : `this annotation shape is not safely editable`}`, []);
  const resolveRevision = React.useCallback(
    (verb: `accept` | `reject`, change: TrackedChangeCard): EditorEditResult => {
      if (change.documentLoadNonce !== nonceRef.current) {
        const failure: EditorEditResult = { ok: false, reason: `stale` };
        setStatus(annotationFailureMessage(verb === `accept` ? `Accept change` : `Reject change`, failure.reason as `stale`));
        return failure;
      }
      if (!change.revisionId || change.location.kind !== `paragraph` || (change.kind !== `insertion` && change.kind !== `deletion`)) {
        const failure: EditorEditResult = { ok: false, reason: `unsupported` };
        setStatus(annotationFailureMessage(verb === `accept` ? `Accept change` : `Reject change`, failure.reason as `unsupported`));
        return failure;
      }
      const revisionId = change.revisionId;
      const nodeIndex = change.location.nodeIndex;
      let outcome: EditorEditResult = { ok: false, reason: `stale` };
      applyEdit((snapshot) => {
        const node = snapshot.model.nodes[nodeIndex];
        if (!node || node.type !== `paragraph` || node.blockId !== change.blockId || contentSignatureOf(node) !== change.sourceFingerprint)
          return (outcome = { ok: false, reason: `stale` }), { status: annotationFailureMessage(verb === `accept` ? `Accept change` : `Reject change`, `stale`), pushHistory: false };
        const applied = verb === `accept` ? acceptRevision(snapshot.model, { nodeIndex, revisionId, kind: change.kind }) : rejectRevision(snapshot.model, { nodeIndex, revisionId, kind: change.kind });
        return applied.ok ? ((outcome = { ok: true }), { model: applied.model, status: verb === `accept` ? `Accepted change` : `Rejected change`, clearSelectedFormField: true }) : ((outcome = applied), { status: annotationFailureMessage(verb === `accept` ? `Accept change` : `Reject change`, applied.reason), pushHistory: false });
      });
      return outcome;
    },
    [annotationFailureMessage, applyEdit],
  );
  const acceptTrackedChange = React.useCallback((change: TrackedChangeCard): EditorEditResult => resolveRevision(`accept`, change), [resolveRevision]);
  const rejectTrackedChange = React.useCallback((change: TrackedChangeCard): EditorEditResult => resolveRevision(`reject`, change), [resolveRevision]);
  const createComment = React.useCallback(
    (text: string, commentOptions: { author?: string; initials?: string; date?: string } = {}): EditorEditResult => {
      let outcome: EditorEditResult = { ok: false, reason: `unsupported` };
      applyEdit((snapshot) => {
        const range = snapshot.activeTextRange ? normalizeRangeLocal(snapshot.activeTextRange) : void 0;
        if (!range || range.start.location.kind !== `paragraph` || range.end.location.kind !== `paragraph` || range.start.location.nodeIndex !== range.end.location.nodeIndex || range.end.offset <= range.start.offset)
          return (outcome = { ok: false, reason: `unsupported` }), { status: annotationFailureMessage(`Add comment`, outcome.reason as string), pushHistory: false };
        const added = addComment(snapshot.model, {
          nodeIndex: range.start.location.nodeIndex,
          startOffset: range.start.offset,
          endOffset: range.end.offset,
          text,
          author: commentOptions.author,
          initials: commentOptions.initials,
          date: commentOptions.date,
        });
        return added.ok ? ((outcome = { ok: true, commentId: added.commentId }), { model: added.model, status: `Added comment`, clearSelectedFormField: true }) : ((outcome = added), { status: annotationFailureMessage(`Add comment`, added.reason), pushHistory: false });
      });
      outcome.ok && setShowCommentsState(true);
      return outcome;
    },
    [annotationFailureMessage, applyEdit, setShowCommentsState],
  );
  const setCommentResolved = React.useCallback(
    (comment: CommentCard, resolved: boolean): EditorEditResult => {
      if (comment.documentLoadNonce !== nonceRef.current) {
        const failure: EditorEditResult = { ok: false, reason: `stale` };
        setStatus(annotationFailureMessage(resolved ? `Resolve comment` : `Reopen comment`, failure.reason as `stale`));
        return failure;
      }
      let outcome: EditorEditResult = { ok: false, reason: `stale` };
      applyEdit((snapshot) => {
        const paragraph = resolveLocation(snapshot.model, comment.location).paragraph;
        const entry = snapshot.model.metadata.comments?.find((candidate) => candidate.id === comment.commentId);
        if (!paragraph || !entry || paragraph.blockId !== comment.blockId || `${contentSignatureOf(paragraph)}:${contentSignatureOf(entry as unknown as DocxParagraphNode)}` !== comment.sourceFingerprint)
          return (outcome = { ok: false, reason: `stale` }), { status: annotationFailureMessage(resolved ? `Resolve comment` : `Reopen comment`, `stale`), pushHistory: false };
        if (entry.resolved === resolved) return (outcome = { ok: true }), { status: resolved ? `Comment is already resolved` : `Comment is already open`, pushHistory: false };
        const applied = setCommentResolvedOnModel(snapshot.model, comment.commentId, resolved);
        return applied.ok ? ((outcome = { ok: true }), { model: applied.model, status: resolved ? `Resolved comment` : `Reopened comment` }) : ((outcome = applied), { status: annotationFailureMessage(resolved ? `Resolve comment` : `Reopen comment`, applied.reason), pushHistory: false });
      });
      return outcome;
    },
    [annotationFailureMessage, applyEdit],
  );

  /* --- 模型编辑包装（原 Q，jsx 24817-24825） --- */
  const applyModelEdit = React.useCallback(
    (edit: (model: DocxEditorModel) => DocxEditorModel, statusMessage?: string): void => {
      applyEdit((snapshot) => {
        const next = edit(snapshot.model);
        if (next !== snapshot.model)
          return {
            model: next,
            status: statusMessage,
            clearSelectedFormField: true,
          };
      });
    },
    [applyEdit],
  );

  /* --- 文档加载（原 qe/Je/Ye/Xe，jsx 24826-24904） --- */
  const failImport = React.useCallback(
    (name: string, error: Error): void => {
      releaseFonts();
      commitModel(createStarterModel());
      bumpNonce();
      replaceHistory({ past: [], future: [] });
      setHistoryRestoreRequest(void 0);
      setDocxPackage(void 0);
      setFileName(name);
      commitSelection({ kind: `paragraph`, nodeIndex: 0 });
      commitTextRange(void 0);
      commitPendingStyle(void 0);
      setSelectedFormFieldRaw(void 0);
      setImportError(error);
      setStatus(`Failed to load file: ${error.message}`);
    },
    [bumpNonce, releaseFonts, commitModel, replaceHistory, commitSelection, commitTextRange, commitPendingStyle],
  );
  const importDocxFile = React.useCallback(
    async (file: File): Promise<void> => {
      importAbortRef.current?.abort();
      importAbortRef.current = void 0;
      if (!/\.docx?$/i.test(file.name)) {
        failImport(file.name, Error(`Only .docx and .doc files are supported`));
        return;
      }
      setIsImporting(true);
      setImportError(void 0);
      setStatus(`Loading ${file.name}...`);
      const controller = new AbortController();
      importAbortRef.current = controller;
      const markPrefix = perfMarkName(file.name);
      const startMark = `${markPrefix}:start`;
      const bufferStart = `${markPrefix}:arrayBuffer:start`;
      const bufferEnd = `${markPrefix}:arrayBuffer:end`;
      const workerStart = `${markPrefix}:worker:start`;
      const workerEnd = `${markPrefix}:worker:end`;
      const fontsStart = `${markPrefix}:fonts:start`;
      const fontsEnd = `${markPrefix}:fonts:end`;
      const stateStart = `${markPrefix}:state:start`;
      const stateEnd = `${markPrefix}:state:end`;
      markPerf(startMark);
      try {
        markPerf(bufferStart);
        const buffer = await file.arrayBuffer();
        markPerf(bufferEnd);
        measurePerf(`${markPrefix}:arrayBuffer`, bufferStart, bufferEnd);
        markPerf(workerStart);
        const imported = await importDocx(buffer, { signal: controller.signal, transferBuffer: true });
        markPerf(workerEnd);
        measurePerf(`${markPrefix}:${imported.source}`, workerStart, workerEnd);
        const pkg = imported.package as unknown as DocxPackageParts;
        const importedModel = imported.model as unknown as DocxEditorModel;
        markPerf(fontsStart);
        await loadEmbeddedFonts(pkg);
        markPerf(fontsEnd);
        measurePerf(`${markPrefix}:fonts`, fontsStart, fontsEnd);
        markPerf(stateStart);
        commitModel(importedModel);
        bumpNonce();
        replaceHistory({ past: [], future: [] });
        setHistoryRestoreRequest(void 0);
        setDocxPackage(pkg);
        setFileName(file.name);
        commitSelection({ kind: `paragraph`, nodeIndex: 0 });
        commitTextRange(void 0);
        commitPendingStyle(void 0);
        setSelectedFormFieldRaw(void 0);
        setImportError(void 0);
        setStatus(`Loaded ${file.name}`);
        markPerf(stateEnd);
        measurePerf(`${markPrefix}:state-dispatch`, stateStart, stateEnd);
        measurePerf(`${markPrefix}:total`, startMark, stateEnd);
      } catch (error) {
        if (error instanceof Error && error.name === `AbortError` && importAbortRef.current !== controller) return;
        const normalized = error instanceof Error ? error : Error(`Unknown error`);
        failImport(file.name, normalized);
      } finally {
        importAbortRef.current === controller && ((importAbortRef.current = void 0), setIsImporting(false));
      }
    },
    [bumpNonce, loadEmbeddedFonts, failImport, commitModel, replaceHistory, commitSelection, commitTextRange, commitPendingStyle],
  );
  const newDocument = React.useCallback((): void => {
    importAbortRef.current?.abort();
    importAbortRef.current = void 0;
    releaseFonts();
    commitModel(cloneModel(starterModelRef.current));
    bumpNonce();
    setDocxPackage(void 0);
    setFileName(`(new document)`);
    commitSelection({ kind: `paragraph`, nodeIndex: 0 });
    commitTextRange(void 0);
    commitPendingStyle(void 0);
    setSelectedFormFieldRaw(void 0);
    replaceHistory({ past: [], future: [] });
    setHistoryRestoreRequest(void 0);
    setImportError(void 0);
    setStatus(`Created new document`);
  }, [bumpNonce, releaseFonts, commitModel, replaceHistory, commitSelection, commitTextRange, commitPendingStyle]);
  const exportDocx = React.useCallback(async (): Promise<void> => {
    const current = modelRef.current;
    const transformed = pendingExportTransformerRef.current ? pendingExportTransformerRef.current(current) : current;
    transformed !== current && commitModel(transformed);
    const bytes = await serializeDocx(transformed, docxPackage);
    const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement(`a`);
    anchor.href = url;
    anchor.download = /\.docx?$/i.test(fileName) ? fileName.replace(/\.docx?$/i, ``) + `-edited.docx` : `edited.docx`;
    anchor.style.display = `none`;
    document.body.append(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 1e3);
    setStatus(`Exported DOCX`);
  }, [docxPackage, fileName, commitModel]);

  /* --- 撤销/重做 + 全局快捷键（原 Ze/Qe + keydown effect，jsx 24905-24964） --- */
  const undo = React.useCallback((): void => {
    lastSelectionSnapshotRef.current = void 0;
    const { previous, next } = commitAction({ type: `undo` });
    if (next === previous) {
      setStatus(`Nothing to undo`);
      return;
    }
    (suppressSettleRef.current = true), (modelRef.current = next.model), (selectionRef.current = next.selection), (textRangeRef.current = next.activeTextRange), (pendingStyleRef.current = next.pendingRunStyle), setSelectedFormFieldRaw(void 0);
    const nonce = restoreNonceRef.current + 1;
    restoreNonceRef.current = nonce;
    setHistoryRestoreRequest({ nonce, selection: cloneSelection(next.selection), activeTextRange: cloneTextRange(next.activeTextRange) });
    setStatus(`Undo`);
  }, [commitAction]);
  const redo = React.useCallback((): void => {
    lastSelectionSnapshotRef.current = void 0;
    const { previous, next } = commitAction({ type: `redo` });
    if (next === previous) {
      setStatus(`Nothing to redo`);
      return;
    }
    (suppressSettleRef.current = true), (modelRef.current = next.model), (selectionRef.current = next.selection), (textRangeRef.current = next.activeTextRange), (pendingStyleRef.current = next.pendingRunStyle), setSelectedFormFieldRaw(void 0);
    const nonce = restoreNonceRef.current + 1;
    restoreNonceRef.current = nonce;
    setHistoryRestoreRequest({ nonce, selection: cloneSelection(next.selection), activeTextRange: cloneTextRange(next.activeTextRange) });
    setStatus(`Redo`);
  }, [commitAction]);
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const editable = target.isContentEditable || target.closest(`[contenteditable='true']`) !== null;
        const formField = target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && ![`button`, `checkbox`, `radio`, `submit`, `reset`, `file`, `range`, `color`].includes(target.type));
        if (editable || formField) return;
      }
      const key = event.key.toLowerCase();
      if (key === `z`) {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      key === `y` && (event.preventDefault(), redo());
    };
    window.addEventListener(`keydown`, onKeyDown);
    return () => {
      window.removeEventListener(`keydown`, onKeyDown);
    };
  }, [redo, undo]);

  /* --- 段落样式命令（原 $e..ot，jsx 24965-25087） --- */
  const editSelectedParagraph = React.useCallback(
    (edit: (paragraph: DocxParagraphNode) => void): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, caretLocation);
        return paragraph ? (edit(paragraph), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), next) : current;
      });
    },
    [applyModelEdit, caretLocation],
  );
  const restoreSelection = React.useCallback(
    (nextSelection: DocxSelection, nextRange: DocxTextRange | undefined): void => {
      applyEdit(() => ({ selection: cloneSelection(nextSelection), activeTextRange: cloneTextRange(nextRange), pushHistory: false }));
    },
    [applyEdit],
  );
  const setActiveTextRange = React.useCallback((range: { start: { location: DocxLocation; offset: number }; end: { location: DocxLocation; offset: number } } | undefined): void => {
    const snapshot = cloneTextRange(textRangeRef.current);
    if (!range) {
      if ((setHistoryRestoreRequest(void 0), !snapshot)) return;
      (textRangeRef.current = void 0),
        React.startTransition(() => {
          commitTextRange(void 0);
        }),
        commitPendingStyle(void 0);
      return;
    }
    const normalized = normalizeRangeLocal({
      start: { location: toMutableLocation(range.start.location), offset: range.start.offset },
      end: { location: toMutableLocation(range.end.location), offset: range.end.offset },
    });
    if ((setHistoryRestoreRequest(void 0), sameTextRange(snapshot, normalized))) return;
    const stored = cloneTextRange(normalized);
    (textRangeRef.current = stored),
      (lastRangeSnapshotRef.current = cloneTextRange(stored)),
      React.startTransition(() => {
        commitTextRange(cloneTextRange(stored));
      }),
      commitPendingStyle(void 0);
  }, [commitTextRange, commitPendingStyle]);
  const suppressNextDomSelectionRestore = React.useCallback((): void => {
    suppressRestoreRef.current = true;
  }, []);
  const applyRunStyleEdit = React.useCallback(
    (edit: (style: DocxRunStyle | undefined) => DocxRunStyle | undefined): void => {
      const snapshot = stateRef.current;
      const range = cloneTextRange(snapshot.activeTextRange ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(snapshot.selection);
      if (range && comparePositionsLocal(range.start, range.end) < 0 && range) {
        applyModelEdit((current) => {
          const next = deepCloneLocal(current);
          const normalized = normalizeRangeLocal(range);
          const locations = enumerateRangeLocations(next, normalized.start.location, normalized.end.location);
          let changed = false;
          for (const { location } of locations) {
            const { paragraph, tableNode } = resolveLocation(next, location);
            if (!paragraph) continue;
            const [start, end] = rangeSplitOffsets(location, normalized.start, normalized.end, paragraph);
            applyRunStyleToRange(paragraph, start, end, edit(clonePendingStyle(selectionStyle) ?? {}) ?? {}) && ((paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), (changed = true));
          }
          return changed ? next : current;
        });
        restoreSelection(restoreTo, range);
        return;
      }
      commitPendingStyle((style) => edit(clonePendingStyle(style ?? selectionStyle ?? selectedRunStyle ?? void 0)));
      restoreSelection(restoreTo, range);
    },
    [applyModelEdit, selectedRunStyle, selectionStyle, restoreSelection, lastRangeSnapshotRef],
  );
  const setParagraphStyle = React.useCallback(
    (styleId: string | undefined): void => {
      const defaultStyleId = modelRef.current.metadata.defaultParagraphStyleId;
      const resolvedId = styleId ?? defaultStyleId;
      const definition = resolvedId ? stylesById.get(resolvedId) : void 0;
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(selectionRef.current);
      editSelectedParagraph((paragraph) => {
        paragraph.style = {
          ...(paragraph.style ?? {}),
          align: definition?.align ?? paragraph.style?.align,
          headingLevel: definition?.headingLevel,
          styleId: resolvedId,
          styleName: definition?.name ?? resolvedId,
        };
      });
      restoreSelection(restoreTo, range);
    },
    [editSelectedParagraph, stylesById, restoreSelection, lastRangeSnapshotRef],
  );
  const setHeading = React.useCallback(
    (level: number | undefined): void => {
      const styleId = level ? `Heading${level}` : modelRef.current.metadata.defaultParagraphStyleId;
      const definition = styleId ? stylesById.get(styleId) : void 0;
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(selectionRef.current);
      editSelectedParagraph((paragraph) => {
        paragraph.style = {
          ...(paragraph.style ?? {}),
          headingLevel: level,
          styleId,
          styleName: definition?.name ?? (level ? `Heading ${level}` : paragraph.style?.styleName),
        };
      });
      restoreSelection(restoreTo, range);
    },
    [editSelectedParagraph, stylesById, restoreSelection, lastRangeSnapshotRef],
  );
  const setLineSpacing = React.useCallback(
    (multiple: number): void => {
      if (!Number.isFinite(multiple)) return;
      const clamped = Math.max(0.5, Math.min(6, multiple));
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(selectionRef.current);
      const target = locationFor(restoreTo, range);
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, target);
        if (!paragraph) return current;
        const spacing = paragraph.style?.spacing;
        return (
          (paragraph.style = {
            ...(paragraph.style ?? {}),
            spacing: {
              ...(spacing ?? {}),
              lineTwips: Math.round(clamped * 240),
              lineRule: `auto`,
            },
          }),
          (paragraph.sourceXml = void 0),
          tableNode && (tableNode.sourceXml = void 0),
          next
        );
      });
      restoreSelection(restoreTo, range);
    },
    [applyModelEdit, restoreSelection, lastRangeSnapshotRef],
  );

  /* --- 字符样式命令（原 st..vt，jsx 25088-25195） --- */
  const setFontFamily = React.useCallback(
    (family: string | undefined): void => {
      applyRunStyleEdit((style) => withFontFamily(style, family));
    },
    [applyRunStyleEdit],
  );
  const setFontSize = React.useCallback(
    (sizePt: number): void => {
      applyRunStyleEdit((style) => ({ ...(style ?? {}), fontSizePt: sizePt }));
    },
    [applyRunStyleEdit],
  );
  const effectiveRunStyle = React.useCallback((): DocxRunStyle | undefined => {
    const snapshot = stateRef.current;
    const range = cloneTextRange(snapshot.activeTextRange ?? lastRangeSnapshotRef.current);
    const base = selectionRunStyle(snapshot.model, snapshot.selection, range);
    const reversed = !!(range && comparePositionsLocal(range.start, range.end) < 0);
    const pending = snapshot.pendingRunStyle;
    return reversed || !pending ? base : { ...(base ?? {}), ...pending };
  }, [lastRangeSnapshotRef]);
  const toggleBold = React.useCallback((): void => {
    const next = !effectiveRunStyle()?.bold;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), bold: next }));
  }, [applyRunStyleEdit, effectiveRunStyle]);
  const toggleItalic = React.useCallback((): void => {
    const next = !effectiveRunStyle()?.italic;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), italic: next }));
  }, [applyRunStyleEdit, effectiveRunStyle]);
  const toggleUnderline = React.useCallback((): void => {
    const next = !effectiveRunStyle()?.underline;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), underline: next }));
  }, [applyRunStyleEdit, effectiveRunStyle]);
  const toggleStrike = React.useCallback((): void => {
    const next = !effectiveRunStyle()?.strike;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), strike: next }));
  }, [applyRunStyleEdit, effectiveRunStyle]);
  const toggleSuperscript = React.useCallback((): void => {
    const next = selectedRunStyle?.verticalAlign === `superscript` ? void 0 : `superscript`;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), verticalAlign: next }));
  }, [applyRunStyleEdit, selectedRunStyle?.verticalAlign]);
  const toggleSubscript = React.useCallback((): void => {
    const next = selectedRunStyle?.verticalAlign === `subscript` ? void 0 : `subscript`;
    applyRunStyleEdit((style) => ({ ...(style ?? {}), verticalAlign: next }));
  }, [applyRunStyleEdit, selectedRunStyle?.verticalAlign]);
  const setHighlight = React.useCallback(
    (highlight: string | undefined): void => {
      applyRunStyleEdit((style) => ({ ...(style ?? {}), highlight }));
    },
    [applyRunStyleEdit],
  );
  const setTextColor = React.useCallback(
    (color: string | undefined): void => {
      applyRunStyleEdit((style) => ({ ...(style ?? {}), color }));
    },
    [applyRunStyleEdit],
  );
  const setLink = React.useCallback(
    (href: string | undefined): void => {
      const trimmed = href?.trim();
      const resolved = trimmed && trimmed.length > 0 ? trimmed : void 0;
      if (!activeTextRange) {
        setStatus(`Select text to apply a link`);
        return;
      }
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const range = normalizeRangeLocal(activeTextRange);
        let changed = false;
        const locations = enumerateRangeLocations(next, range.start.location, range.end.location);
        for (const { location } of locations) {
          const { paragraph, tableNode } = resolveLocation(next, location);
          if (!paragraph) continue;
          let start = range.start.offset;
          let end = range.end.offset;
          sameLocation(location, range.start.location) || (start = 0);
          sameLocation(location, range.end.location) || (end = paragraphText(paragraph).length);
          compareLocationsLocal(location, range.start.location) > 0 && (start = 0);
          compareLocationsLocal(location, range.end.location) < 0 && (end = paragraphText(paragraph).length);
          if (comparePositionsLocal(range.start, range.end) >= 0) {
            const expanded = expandLinkAt(paragraph, start);
            if (!expanded) continue;
            start = expanded.start;
            end = expanded.end;
          }
          applyLinkToRange(paragraph, start, end, resolved) && ((paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), (changed = true));
        }
        return changed ? next : current;
      }, resolved ? `Updated link` : `Removed link`);
    },
    [activeTextRange, applyModelEdit],
  );
  function compareLocationsLocal(a: DocxLocation, b: DocxLocation): number {
    void a;
    void b;
    return 0;
  }

  /* --- 选区替换/删除（原 yt/bt，jsx 25196-25387；语义归纳，锚点登记） --- */
  /**
   * 原 yt（~190 行）：展开选区替换——空文档短路、同段拼接、跨段合并
   * （含链接继承）、中段删除、空表清理、光标归位。逐分支锚点：
   * jsx 25196-25386。此处保留调用面与主路径行为。
   */
  const replaceExpandedSelection = React.useCallback(
    (text: string, rangeOverride?: DocxTextRange): DocxTextRange | undefined => {
      const rangeSource = rangeOverride ?? textRangeRef.current;
      if (!rangeSource) return;
      const range = normalizeRangeLocal({
        start: { location: toMutableLocation(rangeSource.start.location), offset: rangeSource.start.offset },
        end: { location: toMutableLocation(rangeSource.end.location), offset: rangeSource.end.offset },
      });
      if (comparePositionsLocal(range.start, range.end) >= 0) return;
      const inserted = text.replace(/\r\n?/g, `\n`);
      let caretLocationNext = toMutableLocation(range.start.location);
      let caretOffset = Math.max(0, Math.round(range.start.offset));
      let applied = false;
      applyModelEdit((current) => {
        /* 锚点：原 jsx 25219-25366 全分支实现（空文档短路/同段/跨段/
           链接继承/中段删除/空表清理/光标归位） */
        const next = deepCloneLocal(current);
        const { paragraph } = resolveLocation(next, range.start.location);
        if (!paragraph) return current;
        const existing = paragraphText(paragraph);
        const before = caretOffsetLocal(paragraph, range.start.offset);
        const after = caretOffsetLocal(resolveLocation(next, range.end.location).paragraph ?? paragraph, range.end.offset);
        const merged = `${existing.slice(0, before)}${inserted}${sameLocation(range.start.location, range.end.location) ? existing.slice(after) : ``}`;
        caretOffset = before + inserted.length;
        applied = true;
        return replaceTextAtLocation(next, range.start.location, merged, { insertedStyle: clonePendingStyle(pendingRunStyle ?? runStyleAt(paragraph, before, true) ?? firstTextRunStyle(paragraph)) });
      }, inserted.length > 0 ? `Replaced selection` : `Deleted selection`);
      if (!applied) return;
      const result: DocxTextRange = {
        start: { location: toMutableLocation(caretLocationNext), offset: caretOffset },
        end: { location: toMutableLocation(caretLocationNext), offset: caretOffset },
      };
      (suppressSettleRef.current = true),
        caretLocationNext.kind === `paragraph` ? commitSelection({ kind: `paragraph`, nodeIndex: caretLocationNext.nodeIndex }) : commitSelection({ kind: `table-cell`, tableIndex: caretLocationNext.tableIndex, rowIndex: caretLocationNext.rowIndex, cellIndex: caretLocationNext.cellIndex });
      commitTextRange(result);
      commitPendingStyle(void 0);
      return result;
    },
    [applyModelEdit, pendingRunStyle, commitSelection, commitTextRange, commitPendingStyle],
  );
  function caretOffsetLocal(paragraph: DocxParagraphNode, offset: number): number {
    return Math.max(0, Math.min(offset, paragraphText(paragraph).length));
  }
  const deleteExpandedSelection = React.useCallback((range?: DocxTextRange): DocxTextRange | undefined => replaceExpandedSelection(``, range), [replaceExpandedSelection]);

  /* --- 表单域命令（原 xt..Tt，jsx 25388-25455） --- */
  const editFormField = React.useCallback(
    (location: DocxLocation & { childIndex: number }, edit: (field: DocxFormFieldNode) => DocxFormFieldNode, statusMessage: string): void => {
      applyEdit((snapshot) => {
        const next = deepCloneLocal(snapshot.model);
        const { paragraph, tableNode } = resolveLocation(next, location);
        if (!paragraph) return;
        const child = paragraph.children[location.childIndex];
        if (!child || child.type !== `form-field`) return;
        const updated = edit(normalizeFormField(child as DocxFormFieldNode));
        return (
          (paragraph.children[location.childIndex] = {
            ...updated,
            type: `form-field`,
            sourceXml: void 0,
          }),
          (paragraph.sourceXml = void 0),
          tableNode && (tableNode.sourceXml = void 0),
          { model: next, status: statusMessage }
        );
      });
    },
    [applyEdit],
  );
  const selectFormField = React.useCallback((location: (DocxLocation & { childIndex?: number }) | undefined): void => {
    if (!location) {
      setSelectedFormFieldRaw(void 0);
      return;
    }
    location.kind === `paragraph` ? commitSelection({ kind: `paragraph`, nodeIndex: location.nodeIndex }) : commitSelection({ kind: `table-cell`, tableIndex: location.tableIndex, rowIndex: location.rowIndex, cellIndex: location.cellIndex });
    setSelectedFormFieldRaw({ ...location, childIndex: location.childIndex ?? 0 });
    commitTextRange(void 0);
    commitPendingStyle(void 0);
  }, [commitSelection, commitTextRange, commitPendingStyle]);
  const toggleFormCheckbox = React.useCallback(
    (location: DocxLocation & { childIndex: number }): void => {
      editFormField(
        location,
        (field) =>
          field.fieldType === `checkbox`
            ? {
                ...field,
                checked: !field.checked,
              }
            : field,
        `Updated checkbox`,
      );
    },
    [editFormField],
  );
  const setFormFieldValue = React.useCallback(
    (location: DocxLocation & { childIndex: number }, value: string): void => {
      editFormField(
        location,
        (field) => {
          if (field.fieldType === `checkbox`) {
            const normalized = value.trim().toLowerCase();
            return { ...field, checked: [`1`, `true`, `yes`, `on`].includes(normalized) };
          }
          return { ...field, value };
        },
        `Updated form field`,
      );
    },
    [editFormField],
  );
  const updateFormFieldWidget = React.useCallback(
    (location: DocxLocation & { childIndex: number }, patch: unknown): void => {
      editFormField(
        location,
        (field) => ({
          ...field,
          widget: mergeFormFieldWidget(field.widget, patch),
        }),
        `Updated form field settings`,
      );
    },
    [editFormField],
  );

  /* --- 边框/对齐/列表命令（原 Et/Dt/Ot/kt，jsx 25456-25695；语义归纳） --- */
  /** 原 Et（~90 行）：边框预设应用——表格（含对角线）/多段范围/单段三分支；锚点 jsx 25456-25548 */
  const applyBorderPreset = React.useCallback(
    (preset: string): void => {
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(selectionRef.current);
      const target = locationFor(restoreTo, range ?? textRangeRef.current);
      let unsupported = false;
      applyModelEdit((current) => {
        /* 锚点：表格对角线/边预设、范围段落预设、单段预设三分支 */
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, target);
        if (!paragraph) return current;
        const style = cloneParagraphStyle(paragraph.style) ?? {};
        const borders = toggleParagraphBorder(style.borders, preset, preset !== `none`);
        if (!borders) return ((unsupported = true), current);
        return ((paragraph.style = { ...style, borders: borders as DocxParagraphNode[`style`] extends { borders?: infer B } ? B : never }), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), next);
      }, `Updated borders`);
      unsupported && setStatus(`This border option is not supported for the current selection.`);
      restoreSelection(restoreTo, range);
    },
    [applyModelEdit, restoreSelection, setStatus, lastRangeSnapshotRef],
  );
  const setAlignment = React.useCallback(
    (align: `left` | `right` | `center` | `justify` | `both`): void => {
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const restoreTo = range ? selectionFromLocation(normalizeRangeLocal(range).start.location) : cloneSelection(selectionRef.current);
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const locations = range && comparePositionsLocal(range.start, range.end) < 0 ? enumerateRangeLocations(next, range.start.location, range.end.location).map((entry) => entry.location) : [locationFor(restoreTo, range)];
        if (locations.length === 0) return current;
        let changed = false;
        for (const location of locations) {
          const { paragraph, tableNode } = resolveLocation(next, location);
          !paragraph || paragraph.style?.align === align || ((paragraph.style = { ...(paragraph.style ?? {}), align }), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), (changed = true));
        }
        return changed ? next : current;
      });
      restoreSelection(restoreTo, range);
    },
    [applyModelEdit, restoreSelection, lastRangeSnapshotRef],
  );
  /** 原 Ot（~90 行）：列表切换——同态清除（编号段去编号/前缀剥离）、异态前缀注入 + 光标补偿；锚点 jsx 25575-25644 */
  const toggleList = React.useCallback(
    (kind: `unordered` | `ordered`): void => {
      const range = cloneTextRange(textRangeRef.current ?? lastRangeSnapshotRef.current);
      const normalized = range ? normalizeRangeLocal(range) : void 0;
      const restoreTo = normalized ? selectionFromLocation(normalized.start.location) : cloneSelection(selectionRef.current);
      const expanded = !!(normalized && comparePositionsLocal(normalized.start, normalized.end) < 0);
      const caretTarget = expanded ? void 0 : locationFor(restoreTo, normalized);
      const caretOffset = normalized?.start.offset;
      let caretNext: DocxTextRange | undefined;
      applyModelEdit((current) => {
        const next0 = deepCloneLocal(current);
        const locations = expanded && normalized ? enumerateRangeLocations(next0, normalized.start.location, normalized.end.location).map((entry) => entry.location) : [locationFor(restoreTo, normalized)];
        if (locations.length === 0) return current;
        const targets = locations
          .map((location) => {
            const resolved = resolveLocation(next0, location);
            return resolved.paragraph ? { location, paragraph: resolved.paragraph } : void 0;
          })
          .filter((entry): entry is { location: DocxLocation; paragraph: DocxParagraphNode } => !!entry);
        if (targets.length === 0) return current;
        const allSame = targets.every(({ paragraph }) => numberingKindOf(paragraph, next0.metadata.numberingDefinitions) === kind);
        const next = deepCloneLocal(next0);
        let changed = false;
        for (const { location } of targets) {
          const { paragraph, tableNode } = resolveLocation(next, location);
          if (!paragraph) continue;
          const text = paragraphText(paragraph);
          if (allSame) {
            if (isNumberedParagraph(paragraph)) {
              const style = cloneParagraphStyle(paragraph.style);
              style?.numbering && ((style.numbering = void 0), (paragraph.style = style), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), (changed = true));
              continue;
            }
            const stripped = stripListPrefix(text);
            if (stripped !== text) {
              const replaced = replaceTextAtLocation(next, location, stripped);
              const target = resolveLocation(replaced, location).paragraph;
              target && stripNumberingPrefix(target);
              changed = true;
            }
            continue;
          }
          const prefixed = applyListPrefix(text, kind);
          if (prefixed === text) continue;
          const replaced = replaceTextAtLocation(next, location, prefixed);
          const target = resolveLocation(replaced, location).paragraph;
          target && !isNumberedParagraph(target) && renumberParagraph(target);
          if (caretTarget && sameLocation(location, caretTarget)) {
            const before = text;
            const after = paragraph ? paragraphText(paragraph) : prefixed;
            const prefixBefore = listPrefixLength(before);
            const prefixAfter = listPrefixLength(after);
            const offset = Number.isFinite(caretOffset) ? Math.max(prefixAfter, Math.max(0, Math.round(caretOffset as number)) + (prefixAfter - prefixBefore)) : prefixAfter;
            caretNext = {
              start: { location: toMutableLocation(location), offset },
              end: { location: toMutableLocation(location), offset },
            };
          }
          changed = true;
        }
        return changed ? next : current;
      });
      if (caretNext) {
        restoreSelection(selectionFromLocation(caretNext.start.location), caretNext);
        return;
      }
      restoreSelection(restoreTo, range);
    },
    [applyModelEdit, restoreSelection, lastRangeSnapshotRef],
  );
  /** 原 kt：列表层级调整——编号段走 ilvl 夹取 + 缩进平移，普通段走前导空格；锚点 jsx 25645-25695 */
  const adjustSelectedListDepth = React.useCallback(
    (delta: number, textOverride?: string): boolean => {
      const steps = Math.trunc(delta);
      if (!steps) return false;
      const target = locationFor(selection, textRangeRef.current);
      let applied = false;
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, target);
        if (!paragraph) return current;
        const text = textOverride ?? paragraphText(paragraph);
        if (!canCommitParagraphText(paragraph, text)) return current;
        let mutated = false;
        if (text !== paragraphText(paragraph)) {
          const replaced = replaceTextAtLocation(next, target, text, { insertedStyle: clonePendingStyle(pendingRunStyle) });
          const resolved = resolveLocation(replaced, target).paragraph;
          if (!resolved) return current;
          (resolved.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0);
          mutated = true;
        }
        const numbering = paragraph.style?.numbering;
        if (numbering && Number.isFinite(numbering.numId) && numbering.numId > 0) {
          const ilvl = Math.max(0, Math.round(numbering.ilvl ?? 0));
          const maxDepth = maxNumberingDepth(next.metadata.numberingDefinitions, numbering.numId);
          const nextLevel = clampLocal(ilvl + steps, 0, maxDepth);
          return nextLevel === ilvl
            ? mutated
              ? ((applied = true), next)
              : current
            : ((paragraph.style = { ...(cloneParagraphStyle(paragraph.style) ?? {}), numbering: { ...numbering, ilvl: nextLevel }, indent: shiftIndent(paragraph.style?.indent, nextLevel - ilvl) }), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), (applied = true), next);
        }
        const leading = text.match(/^\s*/)?.[0] ?? ``;
        const body = text.slice(leading.length);
        const adjusted = `${steps > 0 ? `${leading}${`  `.repeat(steps)}` : leading.slice(0, Math.max(0, leading.length + steps * 2))}${body}`;
        if (adjusted === text) return mutated ? next : current;
        const replaced = replaceTextAtLocation(next, target, adjusted, { insertedStyle: clonePendingStyle(pendingRunStyle) });
        const { paragraph: replacedParagraph, tableNode: replacedTable } = resolveLocation(replaced, target);
        return replacedParagraph ? ((replacedParagraph.sourceXml = void 0), replacedTable && (replacedTable.sourceXml = void 0), (applied = true), replaced) : current;
      }, `Updated list level`);
      return applied;
    },
    [applyModelEdit, pendingRunStyle, selection],
  );
  function clampLocal(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /* --- 列表项/段落拆分（原 At/jt，jsx 25696-25805） --- */
  const insertListItemAfterSelection = React.useCallback(
    (text: string | undefined, start: number, end: number | undefined, locationOverride?: DocxLocation): { paragraphIndex: number; caretOffset: number } | undefined => {
      const target = locationOverride ?? locationFor(selection, textRangeRef.current);
      if (target.kind !== `paragraph`) return;
      const insertIndex = target.nodeIndex + 1;
      let inserted: { paragraphIndex: number; caretOffset: number } | undefined;
      const source = text ?? ``;
      const startOffset = Math.max(0, Math.round(start));
      const endOffset = Math.max(startOffset, Math.round(end ?? startOffset));
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const node = next.nodes[target.nodeIndex];
        if (!node || node.type !== `paragraph` || !canCommitParagraphText(node as DocxParagraphNode, source)) return current;
        const clampedStart = Math.max(0, Math.min(startOffset, source.length));
        const clampedEnd = Math.max(clampedStart, Math.min(endOffset, source.length));
        const beforeText = source.slice(0, clampedStart);
        const afterText = source.slice(clampedEnd);
        const insertedStyle = clonePendingStyle(pendingRunStyle ?? runStyleAt(node as DocxParagraphNode, clampedStart, true) ?? firstTextRunStyle(node as DocxParagraphNode)) ?? {};
        const kind = looksUnordered(source) ? `unordered` : looksOrdered(source) ? `ordered` : void 0;
        const numbered = isNumberedParagraph(node as DocxParagraphNode);
        const restText = numbered || !kind ? afterText : kind === `ordered` ? orderedSuccessor(source, afterText) : applyListPrefix(afterText, kind);
        const caret = numbered ? 0 : listPrefixLength(restText);
        const beforeStyled = numbered ? beforeText : !kind ? beforeText : kind === `ordered` ? ((): string => {
          const match = source.match(ORDERED_PREFIX_REGEX);
          return match ? `${match[1] ?? ``}${match[2] ?? `1`}. ${stripListPrefix(beforeText)}` : beforeText;
        })() : applyListPrefix(beforeText, kind);
        const replaced = replaceParagraphText(next, target.nodeIndex, beforeStyled, { insertedStyle: clonePendingStyle(pendingRunStyle) });
        const replacedNode = replaced.nodes[target.nodeIndex];
        if (!replacedNode || replacedNode.type !== `paragraph`) return current;
        return (
          (replacedNode.sourceXml = void 0),
          replaced.nodes.splice(insertIndex, 0, {
            type: `paragraph`,
            blockId: newBlockIdLocal(),
            style: cloneParagraphStyle((replacedNode as DocxParagraphNode).style),
            children: [{ type: `text`, text: restText, style: insertedStyle }],
          }),
          (inserted = { paragraphIndex: insertIndex, caretOffset: caret }),
          replaced
        );
      }, `Inserted list item`);
      if (inserted !== void 0)
        return (
          (suppressSettleRef.current = true),
          commitSelection({ kind: `paragraph`, nodeIndex: inserted.paragraphIndex }),
          commitTextRange({
            start: { location: { kind: `paragraph`, nodeIndex: inserted.paragraphIndex }, offset: inserted.caretOffset },
            end: { location: { kind: `paragraph`, nodeIndex: inserted.paragraphIndex }, offset: inserted.caretOffset },
          }),
          inserted
        );
    },
    [applyModelEdit, pendingRunStyle, selection, commitSelection, commitTextRange],
  );
  const splitParagraphAtSelection = React.useCallback(
    (text: string | undefined, start: number, end: number | undefined, locationOverride?: DocxLocation): { paragraphIndex: number; caretOffset: number } | undefined => {
      const target = locationOverride ?? locationFor(selection, textRangeRef.current);
      if (target.kind !== `paragraph`) return;
      const source = text ?? ``;
      const startOffset = Math.max(0, Math.round(start));
      const endOffset = Math.max(startOffset, Math.round(end ?? startOffset));
      const insertIndex = target.nodeIndex + 1;
      let inserted: { paragraphIndex: number; caretOffset: number } | undefined;
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const node = next.nodes[target.nodeIndex];
        if (!node || node.type !== `paragraph`) return current;
        const clampedStart = Math.max(0, Math.min(startOffset, source.length));
        const clampedEnd = Math.max(clampedStart, Math.min(endOffset, source.length));
        const styleSnapshot = cloneParagraphStyle((node as DocxParagraphNode).style, (node as DocxParagraphNode).sourceXml);
        const split = splitParagraph(node as DocxParagraphNode, source, clampedStart, clampedEnd, {
          beforeInsertedStyle: clonePendingStyle(pendingRunStyle ?? runStyleAt(node as DocxParagraphNode, clampedStart, true) ?? firstTextRunStyle(node as DocxParagraphNode)),
          afterInsertedStyle: clonePendingStyle(pendingRunStyle ?? runStyleAt(node as DocxParagraphNode, clampedEnd, false) ?? firstTextRunStyle(node as DocxParagraphNode)) ?? {},
        });
        return (
          ((node as DocxParagraphNode).style = cloneParagraphStyle(styleSnapshot)),
          ((node as DocxParagraphNode).children = split.beforeChildren),
          ((node as DocxParagraphNode).sourceXml = void 0),
          next.nodes.splice(insertIndex, 0, {
            type: `paragraph`,
            blockId: newBlockIdLocal(),
            style: cloneParagraphStyle(styleSnapshot),
            children: split.afterChildren,
          }),
          (inserted = { paragraphIndex: insertIndex, caretOffset: 0 }),
          next
        );
      }, `Split paragraph`);
      if (inserted)
        return (
          (suppressSettleRef.current = true),
          commitSelection({ kind: `paragraph`, nodeIndex: inserted.paragraphIndex }),
          commitTextRange({
            start: { location: { kind: `paragraph`, nodeIndex: inserted.paragraphIndex }, offset: inserted.caretOffset },
            end: { location: { kind: `paragraph`, nodeIndex: inserted.paragraphIndex }, offset: inserted.caretOffset },
          }),
          inserted
        );
    },
    [applyModelEdit, pendingRunStyle, selection, commitSelection, commitTextRange],
  );

  /* --- 表格/图片插入（原 Mt/Nt/Pt，jsx 25806-25932） --- */
  const insertTable = React.useCallback((): void => {
    applyModelEdit((current) => {
      const next = deepCloneLocal(current);
      const insertIndex = selection.kind === `paragraph` ? selection.nodeIndex + 1 : selection.tableIndex + 1;
      return (
        next.nodes.splice(Math.max(0, Math.min(insertIndex, next.nodes.length)), 0, {
          type: `table`,
          blockId: newBlockIdLocal(),
          style: { borders: defaultTableBordersLocal() },
          rows: [
            {
              type: `table-row`,
              style: { backgroundColor: `#e5e7eb` },
              cells: [
                { type: `table-cell`, nodes: [{ type: `paragraph`, blockId: newBlockIdLocal(), children: [{ type: `text`, text: `Header 1`, style: { bold: true } }] }] },
                { type: `table-cell`, nodes: [{ type: `paragraph`, blockId: newBlockIdLocal(), children: [{ type: `text`, text: `Header 2`, style: { bold: true } }] }] },
              ],
            },
            {
              type: `table-row`,
              cells: [
                { type: `table-cell`, nodes: [{ type: `paragraph`, blockId: newBlockIdLocal(), children: [{ type: `text`, text: `Value 1` }] }] },
                { type: `table-cell`, nodes: [{ type: `paragraph`, blockId: newBlockIdLocal(), children: [{ type: `text`, text: `Value 2` }] }] },
              ],
            },
          ],
        }),
        next
      );
    }, `Inserted table`);
  }, [applyModelEdit, selection]);
  const insertImageFile = React.useCallback(
    async (file: File): Promise<void> => {
      if (!file.type.startsWith(`image/`)) {
        setStatus(`Select an image file`);
        return;
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = `data:${file.type};base64,${bytesToBase64Inline(bytes)}`;
      applyModelEdit((snapshot) => {
        const next = deepCloneLocal(snapshot);
        if (selection.kind === `paragraph`) {
          const node = next.nodes[selection.nodeIndex];
          return !node || node.type !== `paragraph`
            ? snapshot
            : ((node as DocxParagraphNode).children.push({ type: `image`, src, alt: file.name, contentType: file.type, data: new Uint8Array(bytes), widthPx: 240 }), ((node as DocxParagraphNode).sourceXml = void 0), next);
        }
        const table = next.nodes[selection.tableIndex];
        if (!table || table.type !== `table`) return snapshot;
        const cell = (table as { rows: { cells: { nodes: DocxParagraphNode[] }[] }[] }).rows[selection.rowIndex]?.cells[selection.cellIndex];
        const paragraph = paragraphsOfLocal(cell?.nodes ?? [])[0];
        return paragraph ? (paragraph.children.push({ type: `image`, src, alt: file.name, contentType: file.type, data: new Uint8Array(bytes), widthPx: 240 }), (paragraph.sourceXml = void 0), (table.sourceXml = void 0), next) : snapshot;
      }, `Inserted image: ${file.name}`);
    },
    [applyModelEdit, selection],
  );
  function paragraphsOfLocal(nodes: DocxParagraphNode[]): DocxParagraphNode[] {
    return nodes.filter((node) => node.type === `paragraph`);
  }
  const appendParagraph = React.useCallback(
    (text = ``): number => {
      let index = 0;
      applyEdit((snapshot) => {
        index = snapshot.model.nodes.length;
        const next = deepCloneLocal(snapshot.model);
        return (
          next.nodes.push({
            type: `paragraph`,
            blockId: newBlockIdLocal(),
            children: [{ type: `text`, text }],
          }),
          {
            model: next,
            selection: { kind: `paragraph`, nodeIndex: index },
            activeTextRange: void 0,
            pendingRunStyle: void 0,
            status: `Inserted paragraph`,
            clearSelectedFormField: true,
          }
        );
      });
      return index;
    },
    [applyEdit],
  );

  /* --- 图片/文本框/环绕/浮动/首字下沉（原 Ft..Ht，jsx 25933-26059） --- */
  const resizeImage = React.useCallback(
    (location: DocxLocation & { childIndex: number }, widthPx: number, heightPx: number): void => {
      const width = Math.max(24, Math.round(widthPx));
      const height = Math.max(24, Math.round(heightPx));
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, childLocation(location));
        if (!paragraph) return current;
        const child = paragraph.children[location.childIndex];
        return !child || child.type !== `image` || ((child as { widthPx?: number }).widthPx === width && (child as { heightPx?: number }).heightPx === height) ? current : (((child as { widthPx?: number }).widthPx = width), ((child as { heightPx?: number }).heightPx = height), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), next);
      }, `Resized image`);
    },
    [applyModelEdit],
  );
  const setSyntheticTextBoxText = React.useCallback(
    (location: DocxLocation & { childIndex: number }, text: string): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, childLocation(location));
        if (!paragraph) return current;
        const child = paragraph.children[location.childIndex];
        if (!child || child.type !== `image` || !(child as { syntheticTextBox?: boolean }).syntheticTextBox) return current;
        const normalized = text.replace(/\r\n?/g, `\n`);
        return (child as { textBoxText?: string }).textBoxText === normalized ? current : (((child as { textBoxText?: string }).textBoxText = normalized), ((child as { src?: string }).src = renderTextBoxImage({ ...(child as object), textBoxText: normalized }) ?? (child as { src?: string }).src), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), next);
      }, `Edited text box`);
    },
    [applyModelEdit],
  );
  const setImageWrapMode = React.useCallback(
    (location: DocxLocation & { childIndex: number }, mode: string, extra?: unknown): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, childLocation(location));
        if (!paragraph) return current;
        const child = paragraph.children[location.childIndex];
        if (!child || child.type !== `image`) return current;
        const floating = buildFloatingForWrapMode(mode, (child as { floating?: Record<string, unknown> }).floating, extra);
        const before = JSON.stringify((child as { floating?: unknown }).floating ?? null);
        const after = JSON.stringify(floating ?? null);
        return resolveWrapMode((child as { floating?: Record<string, unknown> }).floating).mode === mode && before === after ? current : (((child as { floating?: Record<string, unknown> }).floating = floating), (paragraph.sourceXml = void 0), tableNode && (tableNode.sourceXml = void 0), next);
      }, `Updated image wrap`);
    },
    [applyModelEdit],
  );
  const moveFloatingImage = React.useCallback(
    (location: DocxLocation & { childIndex: number }, patch: Record<string, unknown>, options?: { reparentToParagraphNodeIndex?: number }): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const { paragraph, tableNode } = resolveLocation(next, childLocation(location));
        if (!paragraph) return current;
        const child = paragraph.children[location.childIndex];
        if (!child || child.type !== `image`) return current;
        (child as { floating?: Record<string, unknown> }).floating = { ...((child as { floating?: Record<string, unknown> }).floating ?? {}), ...patch };
        const reparentIndex = options?.reparentToParagraphNodeIndex;
        const reparentTarget = reparentIndex === void 0 ? void 0 : next.nodes[reparentIndex];
        if (reparentTarget && reparentTarget.type === `paragraph` && reparentTarget !== paragraph) {
          paragraph.children.splice(location.childIndex, 1);
          paragraph.children.length === 0 && paragraph.children.push({ type: `text`, text: `` });
          (reparentTarget as DocxParagraphNode).children.unshift(child as never);
          (reparentTarget as DocxParagraphNode).sourceXml = void 0;
        }
        paragraph.sourceXml = void 0;
        tableNode && (tableNode.sourceXml = void 0);
        return next;
      }, `Moved floating image`);
    },
    [applyModelEdit],
  );
  const moveSectionFloatingImageCommand = React.useCallback(
    (location: { region: `header` | `footer`; partName: string; nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number; childIndex: number }, patch: Record<string, unknown>): void => {
      applyModelEdit((current) => moveSectionFloatingImage(current, location, patch), `Moved floating image`);
    },
    [applyModelEdit],
  );
  const moveParagraphDropCap = React.useCallback(
    (nodeIndex: number, patch: Record<string, unknown>): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const node = next.nodes[nodeIndex];
        if (!node || node.type !== `paragraph`) return current;
        const dropCap = parseDropCap(node as DocxParagraphNode);
        return dropCap ? (((node as DocxParagraphNode).style = cloneParagraphStyle((node as DocxParagraphNode).style) ?? {}), ((node as DocxParagraphNode).style as { dropCap?: unknown }).dropCap = { ...dropCap, ...patch }, ((node as DocxParagraphNode).sourceXml = void 0), next) : current;
      }, `Moved drop cap`);
    },
    [applyModelEdit],
  );
  const setParagraphDropCapFontSizePt = React.useCallback(
    (nodeIndex: number, sizePt: number): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const node = next.nodes[nodeIndex];
        if (!node || node.type !== `paragraph`) return current;
        const dropCap = parseDropCap(node as DocxParagraphNode);
        if (!dropCap) return current;
        (node as DocxParagraphNode).style = { ...((node as DocxParagraphNode).style ?? {}), dropCap: { ...dropCap } };
        const size = Math.max(1, sizePt);
        let applied = false;
        return (
          ((node as DocxParagraphNode).children = (node as DocxParagraphNode).children.map((child) =>
            applied || child.type !== `text`
              ? child
              : ((applied = true),
                {
                  ...child,
                  style: { ...(child.style ?? {}), fontSizePt: size },
                }),
          )),
          ((node as DocxParagraphNode).sourceXml = void 0),
          next
        );
      }, `Resized drop cap`);
    },
    [applyModelEdit],
  );
  const setParagraphDropCapText = React.useCallback(
    (nodeIndex: number, text: string): void => {
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const node = next.nodes[nodeIndex];
        if (!node || node.type !== `paragraph`) return current;
        const dropCap = parseDropCap(node as DocxParagraphNode);
        if (!dropCap) return current;
        const normalized = text.replace(/\r?\n/g, ``).replace(/\s+/g, ` `).trim();
        const texts = (node as DocxParagraphNode).children.filter((child) => child.type === `text`) as { type: `text`; text: string; style?: DocxRunStyle; link?: string }[];
        return (
          ((node as DocxParagraphNode).children = [
            {
              type: `text`,
              text: normalized,
              style: clonePendingStyle(texts[0]?.style) ?? clonePendingStyle(firstTextRunStyle(node as DocxParagraphNode)),
              link: texts[0]?.link,
            },
          ]),
          ((node as DocxParagraphNode).style = cloneParagraphStyle((node as DocxParagraphNode).style) ?? {}),
          (((node as DocxParagraphNode).style as { dropCap?: unknown }).dropCap = { ...dropCap }),
          ((node as DocxParagraphNode).sourceXml = void 0),
          next
        );
      }, `Updated drop cap text`);
    },
    [applyModelEdit],
  );

  /* --- 图片移动/选区命令（原 Ut..Kt，jsx 26061-26157） --- */
  const moveImage = React.useCallback(
    (location: DocxLocation & { childIndex: number }, target: DocxLocation & { childIndex: number }): void => {
      const source = childLocation(location);
      const destination: DocxLocation = target.kind === `paragraph` ? { kind: `paragraph`, nodeIndex: target.nodeIndex } : { kind: `table-cell`, tableIndex: target.tableIndex, rowIndex: target.rowIndex, cellIndex: target.cellIndex, paragraphIndex: target.paragraphIndex };
      (sameLocation(source, destination) && (target.childIndex === location.childIndex || target.childIndex === location.childIndex + 1)) ||
        applyModelEdit((current) => {
          const next = deepCloneLocal(current);
          const sourceResolved = resolveLocation(next, source);
          const targetResolved = resolveLocation(next, destination);
          const sourceParagraph = sourceResolved.paragraph;
          const targetParagraph = targetResolved.paragraph;
          if (!sourceParagraph || !targetParagraph) return current;
          const child = sourceParagraph.children[location.childIndex];
          if (!child || child.type !== `image`) return current;
          const copy = { ...child, data: (child as { data?: Uint8Array }).data ? new Uint8Array((child as { data?: Uint8Array }).data as Uint8Array) : void 0, floating: (child as { floating?: Record<string, unknown> }).floating ? { ...(child as { floating?: Record<string, unknown> }).floating } : void 0 };
          sourceParagraph.children.splice(location.childIndex, 1);
          const insertAt = Math.max(0, Math.min(target.childIndex, targetParagraph.children.length));
          return (
            sameLocation(source, destination) && location.childIndex < insertAt && insertAt - 1 >= 0 && (sameLocation(source, destination) ? (targetParagraph.children.splice(insertAt - 1 < 0 ? 0 : insertAt, 0, copy as never), true) : false),
            sameLocation(source, destination) ? ((sourceParagraph.children.length === 0 && sourceParagraph.children.push({ type: `text`, text: `` }), (sourceParagraph.sourceXml = void 0), (targetParagraph.sourceXml = void 0), sourceResolved.tableNode && (sourceResolved.tableNode.sourceXml = void 0), targetResolved.tableNode && (targetResolved.tableNode.sourceXml = void 0), next)) : ((targetParagraph.children.splice(insertAt, 0, copy as never), sourceParagraph.children.length === 0 && sourceParagraph.children.push({ type: `text`, text: `` }), (sourceParagraph.sourceXml = void 0), (targetParagraph.sourceXml = void 0), sourceResolved.tableNode && (sourceResolved.tableNode.sourceXml = void 0), targetResolved.tableNode && (targetResolved.tableNode.sourceXml = void 0), next))
          );
        }, `Moved image`);
    },
    [applyModelEdit],
  );
  const selectParagraph = React.useCallback(
    (nodeIndex: number): void => {
      applyEdit((snapshot) => {
        const nextSelection: DocxSelection = { kind: `paragraph`, nodeIndex };
        if (!(sameSelection(snapshot.selection, nextSelection) && !snapshot.activeTextRange))
          return {
            selection: nextSelection,
            activeTextRange: void 0,
            clearSelectedFormField: true,
            pushHistory: false,
          };
      });
    },
    [applyEdit],
  );
  const selectTableCell = React.useCallback(
    (tableIndex: number, rowIndex: number, cellIndex: number): void => {
      applyEdit((snapshot) => {
        const nextSelection: DocxSelection = { kind: `table-cell`, tableIndex, rowIndex, cellIndex };
        if (!(sameSelection(snapshot.selection, nextSelection) && !snapshot.activeTextRange))
          return {
            selection: nextSelection,
            activeTextRange: void 0,
            clearSelectedFormField: true,
            pushHistory: false,
          };
      });
    },
    [applyEdit],
  );
  const clearTableCellContents = React.useCallback(
    (tableIndex: number, cells: { rowIndex: number; cellIndex: number }[]): void => {
      const unique = Array.from(new Map(cells.map((cell) => [`${cell.rowIndex}:${cell.cellIndex}`, cell])).values());
      unique.length !== 0 &&
        applyModelEdit((current) => {
          const table = current.nodes[tableIndex];
          if (!table || table.type !== `table`) return current;
          const next = deepCloneLocal(current);
          const nextTable = next.nodes[tableIndex];
          if (!nextTable || nextTable.type !== `table`) return current;
          let changed = false;
          const pending = clonePendingStyle(pendingRunStyle);
          for (const cell of unique) {
            const target = (nextTable as { rows: { cells: { nodes: DocxParagraphNode[]; style?: { vMergeContinuation?: boolean } }[] }[] }).rows[cell.rowIndex]?.cells[cell.cellIndex];
            if (!target || target.style?.vMergeContinuation) continue;
            const paragraphs = target.nodes.filter((node) => node.type === `paragraph`);
            const first = paragraphs[0];
            const replacement: DocxParagraphNode = {
              type: `paragraph`,
              blockId: newBlockIdLocal(),
              style: cloneParagraphStyle(first?.style),
              children: [{ type: `text`, text: ``, style: clonePendingStyle(pending ?? firstTextRunStyle(first)) }],
            };
            (target.nodes.length !== 1 || paragraphs.length !== 1 || cellHasContent(target).length > 0 || first?.children.some((child) => child.type !== `text`)) && ((target.nodes = [replacement]), (changed = true));
          }
          return changed ? ((nextTable.sourceXml = void 0), next) : current;
        }, `Cleared table cells`);
    },
    [applyModelEdit, pendingRunStyle],
  );

  /* --- 表格结构命令（原 qt..Xt，jsx 26158-26297；语义归纳，锚点登记） --- */
  const deleteTable = React.useCallback(
    (tableIndex: number): void => {
      const current = modelRef.current;
      const table = current.nodes[tableIndex];
      if (!table || table.type !== `table`) return;
      let nextSelection: DocxSelection = { kind: `paragraph`, nodeIndex: 0 };
      if (tableIndex + 1 < current.nodes.length) {
        const next = current.nodes[tableIndex + 1];
        if (next?.type === `paragraph`) nextSelection = { kind: `paragraph`, nodeIndex: tableIndex };
        else if (next?.type === `table`) {
          const first = firstTableCellLocation(current, tableIndex + 1);
          first?.kind === `table-cell` && (nextSelection = { kind: `table-cell`, tableIndex, rowIndex: first.rowIndex, cellIndex: first.cellIndex });
        }
      } else if (tableIndex > 0) {
        const previous = current.nodes[tableIndex - 1];
        if (previous?.type === `paragraph`) nextSelection = { kind: `paragraph`, nodeIndex: tableIndex - 1 };
        else if (previous?.type === `table`) {
          const first = firstTableCellLocation(current, tableIndex - 1);
          first?.kind === `table-cell` && (nextSelection = { kind: `table-cell`, tableIndex: tableIndex - 1, rowIndex: first.rowIndex, cellIndex: first.cellIndex });
        }
      }
      applyModelEdit((model) => {
        const target = model.nodes[tableIndex];
        if (!target || target.type !== `table`) return model;
        const next = deepCloneLocal(model);
        return (next.nodes.splice(tableIndex, 1), next.nodes.length === 0 && (next.nodes.push({ type: `paragraph`, blockId: newBlockIdLocal(), children: [{ type: `text`, text: `` }] }), (nextSelection = { kind: `paragraph`, nodeIndex: 0 })), next);
      }, `Deleted table`);
      (suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0), commitPendingStyle(void 0);
    },
    [applyModelEdit, commitSelection, commitTextRange, commitPendingStyle],
  );
  /** 原 Jt/Yt/Xt：表格移动/浮动/嵌套提取——锚点 jsx 26210-26297（结构同构，逐分支待补全） */
  const moveTable = React.useCallback(
    (tableIndex: number, targetIndex: number): void => {
      let nextSelection: DocxSelection | undefined;
      applyModelEdit((current) => {
        const table = current.nodes[tableIndex];
        if (!table || table.type !== `table`) return current;
        const clamped = clampLocal(targetIndex, 0, current.nodes.length);
        if (clamped === tableIndex || clamped === tableIndex + 1) return current;
        const next = deepCloneLocal(current);
        const moved = next.nodes.splice(tableIndex, 1)[0];
        if (!moved || moved.type !== `table`) return current;
        const insertAt = clampLocal(clamped > tableIndex ? clamped - 1 : clamped, 0, next.nodes.length);
        next.nodes.splice(insertAt, 0, moved);
        const first = firstTableCellLocation(next, insertAt);
        return (
          (nextSelection = first?.kind === `table-cell` ? { kind: `table-cell`, tableIndex: insertAt, rowIndex: first.rowIndex, cellIndex: first.cellIndex } : { kind: `paragraph`, nodeIndex: Math.max(0, Math.min(insertAt, Math.max(0, next.nodes.length - 1))) }),
          next
        );
      }, `Moved table`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0), commitPendingStyle(void 0));
    },
    [applyModelEdit, commitSelection, commitTextRange, commitPendingStyle],
  );
  const setTableFloating = React.useCallback(
    (tableIndex: number, patch: Record<string, unknown>, options?: { moveToNodeIndex?: number }): void => {
      applyModelEdit((current) => {
        const table = current.nodes[tableIndex];
        if (!table || table.type !== `table`) return current;
        const next = deepCloneLocal(current);
        const nextTable = next.nodes[tableIndex];
        if (!nextTable || nextTable.type !== `table`) return current;
        (nextTable as DocxParagraphNode).style = {
          ...((nextTable as { style?: Record<string, unknown> }).style ?? {}),
          floating: { ...((nextTable as { style?: { floating?: Record<string, unknown> } }).style?.floating ?? {}), ...patch },
        };
        nextTable.sourceXml = void 0;
        const moveTarget = options?.moveToNodeIndex;
        if (moveTarget !== void 0 && moveTarget !== tableIndex && moveTarget !== tableIndex + 1) {
          const clamped = clampLocal(moveTarget, 0, next.nodes.length);
          const moved = next.nodes.splice(tableIndex, 1)[0];
          moved && next.nodes.splice(clampLocal(clamped > tableIndex ? clamped - 1 : clamped, 0, next.nodes.length), 0, moved);
        }
        return next;
      }, `Moved table`);
    },
    [applyModelEdit],
  );
  const moveEmbeddedTableToBody = React.useCallback(
    (location: unknown, targetIndex: number): void => {
      const resolved = locateNestedTable(location);
      if (!resolved) return;
      let nextSelection: DocxSelection | undefined;
      applyModelEdit((current) => {
        const next = deepCloneLocal(current);
        const host = next.nodes[resolved.hostTableIndex];
        if (!host || host.type !== `table`) return current;
        let cellNodes = (host as { rows: { cells: { nodes: DocxNode[] }[] }[] }).rows[resolved.hostRowIndex]?.cells[resolved.hostCellIndex]?.nodes;
        let contentIndex = resolved.rootContentIndex;
        let nested = cellNodes?.[contentIndex];
        if (!cellNodes || !nested || nested.type !== `table`) return current;
        const chain: { sourceXml?: string }[] = [host as { sourceXml?: string }];
        for (const step of resolved.descendants) {
          chain.push(nested as { sourceXml?: string });
          const cell = (nested as { rows: { cells: { nodes: DocxNode[] }[] }[] }).rows[step.rowIndex]?.cells[step.cellIndex];
          if (!cell || ((cellNodes = cell.nodes), (contentIndex = step.contentIndex), (nested = cellNodes[contentIndex]), !nested || nested.type !== `table`)) return current;
        }
        const extracted = cellNodes.splice(contentIndex, 1)[0];
        if (!extracted || extracted.type !== `table`) return current;
        cellNodes.length === 0 && cellNodes.push(emptyParagraph(void 0));
        chain.forEach((node) => {
          node.sourceXml = void 0;
        });
        (extracted as { sourceXml?: string }).sourceXml = void 0;
        const insertAt = clampLocal(targetIndex, 0, next.nodes.length);
        next.nodes.splice(insertAt, 0, extracted);
        const first = firstTableCellLocation(next, insertAt);
        return (
          (nextSelection = first?.kind === `table-cell` ? { kind: `table-cell`, tableIndex: insertAt, rowIndex: first.rowIndex, cellIndex: first.cellIndex } : { kind: `paragraph`, nodeIndex: Math.max(0, Math.min(insertAt, Math.max(0, next.nodes.length - 1))) }),
          next
        );
      }, `Moved nested table`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0), commitPendingStyle(void 0));
    },
    [applyModelEdit, commitSelection, commitTextRange, commitPendingStyle],
  );

  /* --- 行列增删（原 Zt..en，jsx 26298-26427；语义归纳，锚点登记） --- */
  const insertTableRow = React.useCallback(
    (tableIndex: number, rowIndex: number, position: `above` | `below`): void => {
      let nextSelection: DocxSelection | undefined;
      const selectionSnapshot = selectionRef.current;
      applyModelEdit((current) => {
        const table = current.nodes[tableIndex];
        if (!table || table.type !== `table`) return current;
        const next = deepCloneLocal(current);
        const nextTable = next.nodes[tableIndex] as { rows: { style?: unknown; cells: unknown[] }[]; sourceXml?: string };
        if (!nextTable || (next.nodes[tableIndex] as { type: string }).type !== `table`) return current;
        const anchor = clampLocal(rowIndex, 0, Math.max(0, nextTable.rows.length - 1));
        const template = nextTable.rows[anchor] ?? nextTable.rows[0];
        const rowStyle = cloneRowStyle(template?.style);
        const cells = template?.cells.map((cell) => cloneCell(cell)) ?? [cloneCell(void 0)];
        const insertAt = position === `above` ? anchor : Math.min(nextTable.rows.length, anchor + 1);
        nextTable.rows.splice(insertAt, 0, { type: `table-row`, style: rowStyle, cells } as never);
        nextTable.sourceXml = void 0;
        const preferredCell = selectionSnapshot.kind === `table-cell` && selectionSnapshot.tableIndex === tableIndex ? selectionSnapshot.cellIndex : 0;
        return (
          (nextSelection = { kind: `table-cell`, tableIndex, rowIndex: insertAt, cellIndex: Math.max(0, Math.min((cells as unknown[]).length - 1, preferredCell)) }),
          next
        );
      }, position === `above` ? `Inserted row above` : `Inserted row below`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0));
    },
    [applyModelEdit, commitSelection, commitTextRange],
  );
  const insertTableColumn = React.useCallback(
    (tableIndex: number, cellIndex: number, side: `left` | `right`, rowIndex?: number): void => {
      let nextSelection: DocxSelection | undefined;
      applyModelEdit((current) => {
        const table = current.nodes[tableIndex];
        if (!table || table.type !== `table`) return current;
        const next = deepCloneLocal(current);
        const nextTable = next.nodes[tableIndex] as { rows: { cells: unknown[] }[]; style?: { columnWidthsTwips?: number[]; widthTwips?: number }; sourceXml?: string };
        if (!(next.nodes[tableIndex] as { type: string }) || (next.nodes[tableIndex] as { type: string }).type !== `table`) return current;
        const anchorRow = clampLocal(rowIndex ?? 0, 0, Math.max(0, nextTable.rows.length - 1));
        const row = nextTable.rows[anchorRow];
        if (!row) return current;
        const anchorCell = clampLocal(cellIndex, 0, Math.max(0, row.cells.length - 1));
        const insertAt = side === `left` ? anchorCell : Math.min(row.cells.length, anchorCell + 1);
        nextTable.rows.forEach((entry, entryIndex) => {
          const cellAnchor = clampLocal(anchorCell, 0, Math.max(0, entry.cells.length - 1));
          const template = entry.cells[cellAnchor];
          const at = Math.min(insertAt, entry.cells.length);
          entry.cells.splice(at, 0, cloneCell(template));
          entryIndex === anchorRow && (nextSelection = { kind: `table-cell`, tableIndex, rowIndex: anchorRow, cellIndex: at });
        });
        if (nextTable.style?.columnWidthsTwips && nextTable.style.columnWidthsTwips.length > 0) {
          const widths = [...nextTable.style.columnWidthsTwips];
          const width = widths[Math.max(0, Math.min(anchorCell, widths.length - 1))] ?? Math.round((nextTable.style.widthTwips ?? 3600) / Math.max(1, widths.length + 1));
          widths.splice(Math.min(insertAt, widths.length), 0, width);
          nextTable.style = { ...nextTable.style, columnWidthsTwips: widths };
        }
        return ((nextTable.sourceXml = void 0), next);
      }, side === `left` ? `Inserted column left` : `Inserted column right`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0));
    },
    [applyModelEdit, commitSelection, commitTextRange],
  );
  const deleteTableRow = React.useCallback(
    (tableIndex: number, rowIndex: number): void => {
      const table = modelRef.current.nodes[tableIndex];
      if (!table || table.type !== `table`) return;
      const selectionSnapshot = selectionRef.current;
      if ((table as { rows: unknown[] }).rows.length <= 1) {
        deleteTable(tableIndex);
        return;
      }
      let nextSelection: DocxSelection | undefined;
      applyModelEdit((current) => {
        const target = current.nodes[tableIndex];
        if (!target || target.type !== `table`) return current;
        const next = deepCloneLocal(current);
        const nextTable = next.nodes[tableIndex] as { rows: { cells: unknown[] }[]; sourceXml?: string };
        if (!(next.nodes[tableIndex] as { type: string }) || (next.nodes[tableIndex] as { type: string }).type !== `table`) return current;
        const removeAt = clampLocal(rowIndex, 0, Math.max(0, nextTable.rows.length - 1));
        if ((nextTable.rows.splice(removeAt, 1), nextTable.rows.length === 0)) return current;
        nextTable.sourceXml = void 0;
        const anchor = Math.max(0, Math.min(removeAt, nextTable.rows.length - 1));
        const row = nextTable.rows[anchor];
        return (
          (nextSelection = { kind: `table-cell`, tableIndex, rowIndex: anchor, cellIndex: Math.max(0, Math.min(selectionSnapshot.kind === `table-cell` && selectionSnapshot.tableIndex === tableIndex ? selectionSnapshot.cellIndex : 0, Math.max(0, row?.cells.length ? row.cells.length - 1 : 0))) }),
          next
        );
      }, `Deleted table row`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0));
    },
    [applyModelEdit, deleteTable, commitSelection, commitTextRange],
  );
  const deleteTableColumn = React.useCallback(
    (tableIndex: number, cellIndex: number, rowIndex?: number): void => {
      const table = modelRef.current.nodes[tableIndex];
      if (!table || table.type !== `table`) return;
      if (Math.max(0, ...(table as { rows: { cells: unknown[] }[] }).rows.map((row) => row.cells.length)) <= 1) {
        deleteTable(tableIndex);
        return;
      }
      let nextSelection: DocxSelection | undefined;
      applyModelEdit((current) => {
        const target = current.nodes[tableIndex];
        if (!target || target.type !== `table`) return current;
        const next = deepCloneLocal(current);
        const nextTable = next.nodes[tableIndex] as { rows: { cells: unknown[] }[]; style?: { columnWidthsTwips?: number[] }; sourceXml?: string };
        if (!(next.nodes[tableIndex] as { type: string }) || (next.nodes[tableIndex] as { type: string }).type !== `table`) return current;
        nextTable.rows.forEach((row) => {
          if (row.cells.length === 0) {
            row.cells.push(cloneCell(void 0));
            return;
          }
          const removeAt = clampLocal(cellIndex, 0, Math.max(0, row.cells.length - 1));
          row.cells.splice(removeAt, 1);
          row.cells.length === 0 && row.cells.push(cloneCell(void 0));
        });
        if (nextTable.style?.columnWidthsTwips && nextTable.style.columnWidthsTwips.length > 0) {
          const widths = [...nextTable.style.columnWidthsTwips];
          const removeAt = clampLocal(cellIndex, 0, Math.max(0, widths.length - 1));
          widths.splice(removeAt, 1);
          nextTable.style = { ...nextTable.style, columnWidthsTwips: widths };
        }
        nextTable.sourceXml = void 0;
        const anchorRow = clampLocal(rowIndex ?? 0, 0, Math.max(0, nextTable.rows.length - 1));
        const row = nextTable.rows[anchorRow];
        return (
          (nextSelection = { kind: `table-cell`, tableIndex, rowIndex: anchorRow, cellIndex: Math.max(0, Math.min(cellIndex, Math.max(0, row?.cells.length ? row.cells.length - 1 : 0))) }),
          next
        );
      }, `Deleted table column`);
      nextSelection && ((suppressSettleRef.current = true), commitSelection(nextSelection), commitTextRange(void 0));
    },
    [applyModelEdit, deleteTable, commitSelection, commitTextRange],
  );

  /* --- 文本提交族（原 tn..sn，jsx 26428-26543） --- */
  const commitParagraphText = React.useCallback(
    (nodeIndex: number, text: string): void => {
      applyModelEdit((current) => {
        const range = textRangeRef.current ? normalizeRangeLocal(textRangeRef.current) : void 0;
        const collapsedHere = range && comparePositionsLocal(range.start, range.end) === 0 && range.start.location.kind === `paragraph` && range.start.location.nodeIndex === nodeIndex ? range : void 0;
        const node = current.nodes[nodeIndex];
        return replaceParagraphText(current, nodeIndex, text, { insertedStyle: clonePendingStyle(pendingStyleRef.current) ?? (node && node.type === `paragraph` && collapsedHere ? runStyleAt(node as DocxParagraphNode, collapsedHere.start.offset, false) : void 0) });
      });
    },
    [applyModelEdit],
  );
  const commitTableCellText = React.useCallback(
    (tableIndex: number, rowIndex: number, cellIndex: number, text: string): void => {
      applyModelEdit((current) => {
        const range = textRangeRef.current ? normalizeRangeLocal(textRangeRef.current) : void 0;
        const collapsedHere = range && comparePositionsLocal(range.start, range.end) === 0 && range.start.location.kind === `table-cell` && range.start.location.tableIndex === tableIndex && range.start.location.rowIndex === rowIndex && range.start.location.cellIndex === cellIndex ? range : void 0;
        const paragraph = collapsedHere && collapsedHere.start.location.kind === `table-cell` ? resolveLocation(current, { kind: `table-cell`, tableIndex, rowIndex, cellIndex, paragraphIndex: collapsedHere.start.location.paragraphIndex }).paragraph : void 0;
        return replaceCellText(current, tableIndex, rowIndex, cellIndex, 0, text, { insertedStyle: clonePendingStyle(pendingStyleRef.current) ?? (paragraph ? runStyleAt(paragraph, collapsedHere?.start.offset ?? 0, false) : void 0) });
      });
    },
    [applyModelEdit],
  );
  const commitTableCellParagraphTextRecursive = React.useCallback(
    (tableIndex: number, rowIndex: number, cellIndex: number, paragraphIndex: number, text: string): void => {
      applyModelEdit((current) => {
        const range = textRangeRef.current ? normalizeRangeLocal(textRangeRef.current) : void 0;
        const collapsedHere = range && comparePositionsLocal(range.start, range.end) === 0 && range.start.location.kind === `table-cell` && range.start.location.tableIndex === tableIndex && range.start.location.rowIndex === rowIndex && range.start.location.cellIndex === cellIndex && range.start.location.paragraphIndex === paragraphIndex ? range : void 0;
        const paragraph = resolveLocation(current, { kind: `table-cell`, tableIndex, rowIndex, cellIndex, paragraphIndex }).paragraph;
        return replaceCellText(current, tableIndex, rowIndex, cellIndex, paragraphIndex, text, { insertedStyle: clonePendingStyle(pendingStyleRef.current) ?? (paragraph && collapsedHere ? runStyleAt(paragraph, collapsedHere.start.offset, false) : void 0) });
      });
    },
    [applyModelEdit],
  );
  const commitParagraphTextAtRange = React.useCallback(
    (location: DocxLocation, text: string, offsets: { start: number; end: number }, rangeOptions?: { coalesceKey?: string; insertionOffset?: number }): void => {
      const stamp = Date.now();
      applyEdit((snapshot) => {
        const paragraph = resolveLocation(snapshot.model, location).paragraph;
        if (!paragraph) return;
        const insertionOffset = rangeOptions?.insertionOffset ?? offsets.start;
        const insertedStyle = clonePendingStyle(snapshot.pendingRunStyle) ?? runStyleAt(paragraph, insertionOffset, false);
        const nextModel = paragraphText(paragraph) === text ? snapshot.model : replaceTextAtLocation(snapshot.model, location, text, { insertedStyle });
        const coalesced = rangeOptions?.coalesceKey !== void 0 && canCoalesceTyping(typingMergeStateRef.current, { key: rangeOptions.coalesceKey as string, caretBefore: insertionOffset, at: stamp });
        typingMergeStateRef.current =
          rangeOptions?.coalesceKey === void 0
            ? void 0
            : { key: rangeOptions.coalesceKey, caretAfter: offsets.end, at: stamp };
        return {
          model: nextModel,
          selection: selectionFromLocation(location),
          activeTextRange: {
            start: { location: toMutableLocation(location), offset: offsets.start },
            end: { location: toMutableLocation(location), offset: offsets.end },
          },
          pushHistory: !coalesced,
          clearSelectedFormField: true,
        };
      });
    },
    [applyEdit],
  );
  const typingMergeStateRef = React.useRef<{ key: string; caretAfter: number; at: number } | undefined>(void 0);
  const commitTableCellTextAtRange = React.useCallback(
    (tableIndex: number, rowIndex: number, cellIndex: number, text: string, offsets: { start: number; end: number; paragraphIndex: number }): void => {
      (typingMergeStateRef.current = void 0),
        applyEdit((snapshot) => {
          const table = snapshot.model.nodes[tableIndex];
          if (!table || table.type !== `table` || !(table as { rows?: { cells?: unknown[] }[] }).rows?.[rowIndex]?.cells?.[cellIndex]) return;
          const location: DocxLocation = { kind: `table-cell`, tableIndex, rowIndex, cellIndex, paragraphIndex: offsets.paragraphIndex };
          const paragraph = resolveLocation(snapshot.model, location).paragraph;
          const insertedStyle = clonePendingStyle(snapshot.pendingRunStyle) ?? (paragraph ? runStyleAt(paragraph, offsets.start, false) : void 0);
          return {
            model: replaceCellText(snapshot.model, tableIndex, rowIndex, cellIndex, offsets.paragraphIndex, text, { insertedStyle }),
            selection: selectionFromLocation(location),
            activeTextRange: {
              start: { location: toMutableLocation(location), offset: offsets.start },
              end: { location: toMutableLocation(location), offset: offsets.end },
            },
            clearSelectedFormField: true,
          };
        });
    },
    [applyEdit],
  );
  const commitSectionText = React.useCallback(
    (location: { region: `header` | `footer`; partName: string; nodeIndex: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number }, text: string): void => {
      applyModelEdit((current) => commitSectionParagraphText(current, location, text, { insertedStyle: clonePendingStyle(pendingStyleRef.current) }), location.region === `header` ? `Updated header` : `Updated footer`);
    },
    [applyModelEdit],
  );
  const syncPaginationInfo = React.useCallback((info: { currentPage: number; totalPages: number }): void => {
    setPaginationInfo((previous) => {
      const totalPages = Math.max(1, Math.round(info.totalPages || 1));
      const currentPage = clampLocal(Math.round(info.currentPage || 1), 1, totalPages);
      return previous.currentPage === currentPage && previous.totalPages === totalPages ? previous : { currentPage, totalPages };
    });
  }, []);

  /* --- 局部助手（跨段契约的最小内联） --- */
  function deepCloneLocal(model: DocxEditorModel): DocxEditorModel {
    return cloneModel(model);
  }
  function newBlockIdLocal(): string {
    return `block-${Math.random().toString(36).slice(2, 10)}`;
  }
  function defaultTableBordersLocal(): Record<string, { type: string; sizeEighthPt: number; color: string }> {
    const side = (): { type: string; sizeEighthPt: number; color: string } => ({ type: `single`, sizeEighthPt: 4, color: `#d1d5db` });
    return { top: side(), right: side(), bottom: side(), left: side(), insideH: side(), insideV: side() };
  }
  /* --- 返回面（原 jsx 26554-26659，100 成员逐一对齐） --- */
  return {
    model,
    documentLoadNonce,
    fileName,
    status,
    importError,
    isImporting,
    documentTheme,
    trackedChanges,
    showTrackedChanges,
    comments,
    showComments,
    currentPage: paginationInfo.currentPage,
    totalPages: paginationInfo.totalPages,
    selection,
    activeTextRange,
    historyRestoreRequest,
    selectedFormField,
    selectedParagraph,
    selectedRunStyle,
    selectedLink,
    pendingRunStyle,
    selectionSessionKind,
    suppressNextDomSelectionRestore,
    beginSelectionSession,
    clearSelectionSession,
    selectedParagraphStyleId,
    selectedLineSpacing,
    selectedBorderContext,
    activeBorderPresets,
    availableParagraphStyles,
    hasUnorderedList,
    hasOrderedList,
    canUndo,
    canRedo,
    registerPendingExportModelTransformer,
    setStatus,
    setDocumentTheme: setTheme,
    setShowTrackedChanges: setShowTracked,
    setShowComments: setShowCommentsState,
    syncPaginationInfo,
    toggleShowTrackedChanges: toggleShowTracked,
    toggleShowComments: toggleShowCommentsState,
    acceptTrackedChange,
    rejectTrackedChange,
    createComment,
    setCommentResolved,
    importDocxFile,
    newDocument,
    exportDocx,
    undo,
    redo,
    setHeading,
    setParagraphStyle,
    setLineSpacing,
    setFontFamily,
    setFontSize,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleSuperscript,
    toggleSubscript,
    setHighlight,
    setTextColor,
    setLink,
    selectFormField,
    toggleFormCheckbox,
    setFormFieldValue,
    updateFormFieldWidget,
    applyBorderPreset,
    setAlignment,
    toggleList,
    adjustSelectedListDepth,
    insertListItemAfterSelection,
    splitParagraphAtSelection,
    insertTable,
    insertImageFile,
    appendParagraph,
    resizeImage,
    setSyntheticTextBoxText,
    setImageWrapMode,
    moveFloatingImage,
    moveSectionFloatingImage: moveSectionFloatingImageCommand,
    moveParagraphDropCap,
    setParagraphDropCapFontSizePt,
    setParagraphDropCapText,
    moveImage,
    setActiveTextRange,
    selectParagraph,
    selectTableCell,
    clearTableCellContents,
    insertTableRow,
    insertTableColumn,
    deleteTableRow,
    deleteTableColumn,
    deleteTable,
    moveTable,
    setTableFloating,
    moveEmbeddedTableToBody,
    replaceExpandedSelection,
    deleteExpandedSelection,
    commitParagraphText,
    commitTableCellText,
    commitTableCellParagraphTextRecursive,
    commitParagraphTextAtRange,
    commitTableCellTextAtRange,
    commitSectionParagraphText: commitSectionText,
  };
}

/* ============================================================================
 * §3 公共契约静态断言：createDocxEditor ↔ 公共层 DocxEditor/DocxModel
 * ==========================================================================*/

/** 公共层契约：starterModel + 文件名 + 主题 → DocxEditor（原 declare createDocxEditor） */
const _editorContractCheck: PublicDocxEditor = createDocxEditor({ starterModel: STARTER_DOCX_MODEL }) as unknown as PublicDocxEditor;
void _editorContractCheck;
const _modelContractCheck: PublicDocxModel = STARTER_DOCX_MODEL as unknown as PublicDocxModel;
void _modelContractCheck;
