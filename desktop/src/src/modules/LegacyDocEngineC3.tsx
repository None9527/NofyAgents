/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineC3.tsx — legacy-doc 内部引擎 [E7] 交互回调簇 · 前半：
 * 页节信息/虚拟化页窗/测量回灌/选区与指针/键盘/草稿提交/表格几何与缩放
 * （解混淆重建 · D8 Stage B5 · Office 预览族 · 批次 B5-09 · C3）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版 previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx）
 * 覆盖区段：[E7] ES 交互回调簇前半 jsx 27889-31873
 *
 * 与批 B 的关系：
 *  - LegacyDocEngineBPageRenderer.tsx（批 B）已覆盖 props/状态骨架/分页 memo 链
 *    （jsx 27340-27888）与最终 JSX（35408-36416）；本件实体化其 §3 锚点登记的
 *    交互回调簇前半（测量回灌/虚拟化/选区/指针/键盘/草稿/beforeinput/表格几何）。
 *  - 回调簇后半（jsx 31874-35407：节区图片/拖拽/包裹段落渲染器/runs 渲染器/
 *    拖放导入/单元格切片/fs 节点渲染器/ps 页流渲染器/脚注簇）见 LegacyDocEngineC4.tsx。
 *  - 本件不改动批 B 任何文件；接口面按批 B DocxEditorState/DocxEditorViewProps
 *    对接，契约差异只记录于 LegacyDocEngineC34.report.md。
 *
 * 重建口径：
 *  - 类名/字符串常量/data-* 属性/分支结构零改动（逐句对照转录，把握度高）；
 *  - 顶层回调符号按语义命名（映射见下），函数体内局部变量名从源（保持逐字保真）；
 *  - 外部段符号（[E1]-[E6] 与渲染助手）：A0-S2c 已将 §0 的 85 项接线至域内实体导出
 *    （C1/C2/C5/B 系/Engine4/BPageRegistry），余 11 项保留 declare（属主未转录/他批），
 *    契约面分歧以类型面桥接（§0a）；逐件见 A0-S2c.report.md §2。
 *
 * ----------------------------------------------------------------------------
 * §A 混淆名 → 语义名 映射（本件实体化符号，jsx 行）
 * ----------------------------------------------------------------------------
 *  页节/快照面：
 *   ar → declaredPageCount (1922) | or → pageSectionInfoByIndex (27900)
 *   sr → pageContentKeys (184724) | cr → pageLayoutSizes (27966)
 *   lr → pageSnapshotBatch (27971) | aS 调用 → publishPageSnapshots effect (27987)
 *   ur → tocStyleFieldResolver (1995) | dr → livePageCount (28023)
 *   fr → heavyTableDocument (2009) | pr → deferredPaintActive (28040)
 *   mr → totalHeightForPageCount (187074)
 *  虚拟化面：
 *   yr/br → virtualizationSettled (28072) | xr/Sr → resolvedScrollElement (28073)
 *   Cr/wr → resolvedZoomScale (28074) | Tr/Er → pendingVisibleRange (28075)
 *   Dr → settleDelayMs (2115) | Or → overscanPx (28077) | kr → effectiveOverscan (28078)
 *   Ar → webdriverDetected (2124) | jr → virtualizationEnabled (28080)
 *   Mr → scrollElementProp (2130) | Nr → zoomScaleProp (28082)
 *   Fr → resolveZoomScale (2139)
 *   Rr → virtualizerActive (2148) | Vr → windowScrollPending (28198)
 *   Hr → scrollElementIsDocument (2168) | Ur → virtualizerInContainer (28200)
 *   Wr → virtualizerInWindow (2180) | Gr → estimatePageSize (28198)
 *   Kr → markPaginationThrottle (2186) | qr → containerVirtualizer (28204)
 *   Xr → windowVirtualizer (2198) | Zr → activeVirtualizer (28212)
 *   Qr → virtualItems (2204) | $r → anchorPageIndex (28223)
 *   ei → virtualVisibleRange (2210) | ti → overscannedVisibleRange (28252)
 *   ni → manualWindowActive (2216) | ri → mergedVisibleRange (28338)
 *   ii → effectiveVisibleRange (2222) | ai → clampedVisibleRange (28345)
 *   oi/si/ci → renderWindowBounds (28362-28365) | di → deferredFullWindow (28366)
 *   fi/pi → firstRenderedPage/lastRenderedPage (28367-28368)
 *   mi → renderedPageIndexes (2252) | hi → pageWindowSpacers (28375)
 *  测量回灌面：
 *   gi → visibleTableRowIndexes (2258) | yi → measurementPassActive (28447)
 *   bi → awaitingTableMeasurement (2287) | xi → measurementOverlayPending (28466)
 *   Si → annotationsByPage (2343) | Ci/wi → annotationAnchorPoints (28516)
 *   Ti/Ei → headerOverlapHeights (28517) | Di/Oi → annotationCardHeights (28521)
 *   ki → gutterAnnotationLayouts (28580) | Ai → footnotePageNumberBase (28585)
 *   ji → pageInRenderWindow (28588) | Ni → revealPage (28589)
 *   Pi → scrollToBookmark (28600) | Fi → headerFooterNodesByPage (28633)
 *   Ii → estimatedHeaderHeights (28655)
 *  表格选区/指针面：
 *   Li → setTableSelectionAnchor (28909) | Ri → clearTableSelection (28919)
 *   zi → tableHitTest (28921) | Bi → nearestTableAtPoint (28928)
 *   Vi → handlePointerMoveCapture (28940) | Hi → handlePointerLeave (28946)
 *   Ui → selectWholeTable (28948) | Wi → computeTableDropTarget (28959)
 *   Gi → beginTableMove (28996)
 *  右键菜单状态面：
 *   Ki → closeTableContextMenu (29063) | qi → closeContextMenu (29066)
 *   Ji → openTextContextMenu (29069) | Yi → openTableContextMenu (29077)
 *   Xi → runTableAction (29084) | Zi → tableContextMenuActions (29114)
 *   Qi → resolveTableMenuCell (2796)
 *  DOM 选区助手面：
 *   $i → placeCaretInHost (2799) | ea → setTextRangeInElement (29276)
 *   ta → textLengthOfElement (2805) | na → recordPartialLineSelection (29313)
 *   ra → resolveLocationHostElement (2811) | ia → textNodeAtOffset (29348)
 *   aa → paragraphHostAtOffset (29371) | oa → boundaryToDomPoint (29389)
 *   sa → applyDomSelection (29395) | ca → restoreSelectionAfterEdit (29455)
 *   la → wrappedParagraphHit (29510) | ua → selectAllContent (29523)
 *   da → domPointToBoundary (29540) | fa → boundaryAtPoint (29583)
 *   pa → selectionFromDom (29676) | ma → syncActiveTextRangeFromDom (29690)
 *   ha → scheduleSelectionSync (29715)
 *  选区会话面：
 *   ga → hasSelectionInside (29766) | _a → restoreCaretAtX (29773)
 *   va → ensureSelectionAfterTap (29795) | ya → cancelPointerSession (29821)
 *   ba → clearTransientSelections (29824) | xa → beginWrappedEditing (29827)
 *   Sa → focusWrappedTextarea (29862) | Ca → commitWrappedText (29882)
 *   wa → focusParagraphNode (29888) | Ta → selectDropCap (29893)
 *   Ea → scheduleCollapsedSelectionSync (29897)
 *  指针拖选面：
 *   Da → beginTextDragSelection (30039) | Oa → tableCellAtPoint (30088)
 *   ka → beginTableCellDragSelection (30090) | Aa → handlePointerDownCapture (30143)
 *   ja → handleContextMenu (30161)
 *  键盘面：
 *   Ma → handleTableSelectionDelete (30195) | Na → handleKeyDownCapture (30211)
 *   Pa → handleKeyUp (30252) | Fa → deleteExpandedSelectionFromKey (30255)
 *   Ia → replaceSelectionWithText (30286)
 *  右键菜单动作面：
 *   La → contextMenuActionsFor (30306) | Ra → runContextMenuAction (30385)
 *  光标导航面：
 *   za → focusParagraphAtOffset (3076) | Ba → focusTableCellParagraph (30776)
 *   Va → focusLocationAtOffset (3082) | Ha → placeCaretAtPointInLocation (30793)
 *   Ua → focusParagraphEnd (3091) | Wa → selectionOffsetsInHost (30824)
 *   Ga → caretPointOfCollapsed (3100) | Ka → tableParagraphUnderSelection (30866)
 *   qa → syncTableCellTextRange (3106) | Ja → syncParagraphTextRange (30902)
 *  草稿面：
 *   Ya → commitTableCellDraft (3119) | Xa → registerCellDraftElement (30935)
 *   Za → readDraftHtml (3155) | Qa → writeDraftHtml (30939)
 *   eo → clearDraftHtml (3173) | no → commitCellParagraphDraft (30943)
 *   ao → registerSectionDraftElement (3235) | oo → readSectionDraft (30958)
 *   so → writeSectionDraft (3259) | co → clearSectionDraft (30961)
 *   lo → commitSectionDraft (30963) | uo → captureSectionParagraphKey (30980)
 *   fo → commitSectionRegionDrafts (30986) | po → endHeaderFooterSession (30998)
 *   ho → scheduleEndHeaderFooterSession (31004)
 *  撤销/输入面：
 *   _o → handleUndoRedoKeys (31073) | vo → handleBeforeInput (31083)
 *  表格几何面：
 *   yo → resolveColumnWidthsRender (31344) | bo → resolveRowHeightsRender (31349)
 *   xo → resolveColumnWidthsDraft (31355) | So → resolveRowHeightsDraft (31362)
 *  缩放面：
 *   Co → normalizeRowHeightsForResize (31451) | wo → distributeRowHeights (31453)
 *   To → beginColumnResize (3352) | Eo → beginRowResize (31524)
 *   Do → beginColumnResizeDraft (3358) | Oo → beginRowResizeDraft (31606)
 *   ko → beginImageResize (31646) | Ao → beginImagePointerMove (31675)
 *   Mo → beginDropCapMove (31820) | No → beginDropCapResize (31847)
 * ============================================================================
 */

import * as React from "react";
import {
  type DocxEditorModel,
  type DocxNode,
  type DocxParagraphNode,
  type DocxTableNode,
  type DocxImageNode,
  type DocxLocation,
  type DocxTextRange,
  type DocxSelection,
  type PageSegment,
  type DocxSection,
  type SectionPageMetrics, // 〔A1-R186〕★本行 specifier SectionPageMetrics（所属导入语句 @135-171）之代码位命中除本语句自身外为 @475，逐处实测皆落在本批被删区间内 ⇒ 该 specifier 成**未用导入**。两 tsconfig 皆无 noUnusedLocals／noUnusedParameters ⇒ 不碍构建；导入语句本体逐字保留（删行会破净零行、并使环论证失效），本骑手係记录、候未用导入清理集。原文逐字保留、只增不改（骑手只增文、不删旧字）。
  clampNumber,
  findScrollContainer,
  resolveCumulativeZoom,
  compareLocations,
  compareTextPositions,
  normalizeTextRange,
  elementToPlainText,
  elementToClipboardText,
  htmlToPlainText,
  htmlToClipboardText,
  renderStaticMarkup,
  parseParagraphDomLocation,
  scheduleFrame,
  normalizeMeasuredHeight,
  TABLE_RESIZE_HIT_PX,
  TABLE_HANDLE_BORDER_PX,
  TABLE_HOVER_SETTLE_MS,
  TABLE_ANNOTATION_MIN_PX,
  TABLE_ANNOTATION_GAP_A_PX,
  TABLE_ANNOTATION_GAP_B_PX,
  TABLE_ANNOTATION_LANE_PX,
  TABLE_ANNOTATION_PAD_PX,
  TABLE_ANNOTATION_RADIUS_PX,
  TABLE_ANNOTATION_MAX_MS,
} from "./LegacyDocEngineBModel";
import {
  PAGE_GRID_GAP_PX,
  MIN_BLOCK_HEIGHT_PX,
  ROW_HEIGHT_TOLERANCE_PX,
  PAGINATION_SETTLE_MS,
  DOUBLE_CLICK_INTERVAL_MS,
  KEY_CODE_MIN_LAYOUT,
  INITIAL_PAGE_NUMBER,
  GUTTER_PADDING_D_PX,
  GUTTER_CONNECTOR_WIDTH_PX,
  GUTTER_CONNECTOR_GAP_PX,
  DRAG_SCROLL_ZONE_PX,
  DRAG_SCROLL_STEP_PX,
  DRAG_SCROLL_MIN_PX,
  DRAG_SCROLL_PAGE_PX,
  CONTEXT_MENU_WIDTH_PX,
  INACTIVE_REGION_OPACITY,
  PAGINATION_IGNORE_ATTR,
} from "./LegacyDocEngineBThumbnails";
import {
  sectionBreakNodeIndexes,
  lastRenderedPageBreakOf,
  lastPageBreakSectionIndex,
  pickHeaderFooterForPage,
  paragraphHasVisibleBorders,
  paragraphIsSectionCover,
  paragraphStartsNewPage,
  isInteractiveElement,
  collectNodeNoteReferences,
  FLOATING_WRAP_TOLERANCE_PX,
  FLOATING_MIN_FOOTPRINT_PX,
} from "./LegacyDocEngineBLayout";
import type { DocxEditorState } from "./LegacyDocEngineBEditorState";

/* ============================================================================
 * §0 接线（A0-S2c）：原 declare 改指域内实体导出。行尾注原混淆名；
 * 契约面分歧者以 `as unknown as` 桥接（类型面、零运行时）或参数序适配器，
 * 逐件见 A0-S2c.report.md §2。
 * ==========================================================================*/
import {
  locationKeyContract, // 原 Ab
  imageLocationKeyContract, // 原 jb
  sameLocation as sameLocationContract, // 原 ax
  cloneLocation as cloneLocationContract, // 原 xx
  paragraphLocationOfImage, // 原 Px
  locationBase as locationBaseContract, // 原 Rx
  pageIndexForLocation, // 原 Yb
  trackedChangeIsAnnotatable, // 原 Kb
  locationSortVector, // 原 qb
  annotationAnchorElement, // 原 tx
  annotationAnchorRect as annotationAnchorRectSource, // 原 Zb（锚点 Element 面 → 下方桥接）
  layoutGutterAnnotations as layoutGutterAnnotationsContract, // 原 ix
  paragraphBorderVisible, // 原 Wy
  enumerateRangeLocations as enumerateRangeLocationsContract, // 原 _x
  rangeOffsetsInParagraph, // 原 bx
  caretOffsetIn as paragraphInsertOffset, // 原 vx
  resolveLocation as resolveLocationContract, // 原 Fx
  tocFieldFallback, // 原 xv
  normalizeStyleName, // 原 bv
  selectionRestoreArbitration, // 原 Ox
  caretXOutOfRange, // 原 Nx
  sameTextRange as sameTextRangeApprox, // 原 Ex
  cloneTextRange as collapsedRangeToRestore, // 原 Sx
  isNavigationOrEditKey, // 原 jx
  previousEditableParagraphLocation, // 原 px
  nextEditableParagraphLocation, // 原 mx
  isNumberedParagraph as paragraphIsListItem, // 原 Qv
  cellParagraphDraftKey, // 原 Yx
  sectionParagraphDraftKey, // 原 qx
  parseSectionDraftKey, // 原 Xx
  sectionNodeTextAt, // 原 Zx
  replaceSectionParagraphText, // 原 $x
  cloneRunStyle as cloneRunStyleContract, // 原 fb
  cellParagraphsSignature, // 原 vy
  tableMaxColumnCount as tableGridColumnCount, // 原 yy
  tableGridWidthsCached as tableGridColumnsCached, // 原 Ey
  normalizeGridWidthsPx as normalizeGridWidthsPxSource, // 原 jy（宽度可含 undefined → 下方桥接）
  evenGridWidthsPx as defaultColumnWidths, // 原 My
  locationFromDataset as parseImageDropZoneDataset, // 原 Nb
  childLocationKey as imageDropZoneKey, // 原 Mb
} from "./LegacyDocEngineC2";
import {
  positiveNumber as normalizeZoomScaleProp, // 原 uu
  measureHeaderHeight as estimateHeaderHeight, // 原 Pd
  minFloatingImageTop as minFloatingImageTopSource, // 原 Md（返回可 undefined；消费经 Number.isFinite 守卫 → 下方桥接）
  maxRenderedBottomPx as measureBodyRenderedBottom, // 原 Ld
  resolvePageBodyHeight as arbitratePageContentHeight, // 原 Id
  buildPaginationSnapshot, // 原 Hu（BModel 参数序 nodes/segments；消费点经适配器）
  samePaginationSnapshot, // 原 Uu
  reconcilePageHeights as mergeMeasuredPageHeights, // 原 Rd
  sameCellSelection as sameTableSelection, // 原 nf
  tableFirstLastCell, // 原 sf
  parseTableCellDomLocation as tableCellLocationFromElement, // 原 $d
  enumerateSelectedCells as tableSelectionCells, // 原 of
  selectionCoversTable as tableSelectionIsWholeTable, // 原 cf
  isCollapsedCellSelection as tableSelectionCollapsed, // 原 tf
  TABLE_CONTEXT_MENU_ITEMS as TABLE_CONTEXT_MENU_ACTIONS_SOURCE, // 原 Yu
  CLIPBOARD_MENU_ITEMS as TEXT_CONTEXT_MENU_ACTIONS_SOURCE, // 原 Qu
  IMAGE_WRAP_MENU_ITEMS as IMAGE_WRAP_MENU_ITEMS_SOURCE, // 原 ed
  IMAGE_ORDER_MENU_ITEMS as IMAGE_ZORDER_MENU_SOURCE, // 原 $u
  paragraphText as paragraphTextContract, // 原 _f
  rangeOffsetsWithin as domRangeToOffsets, // 原 qu
  sectionBreakType as sectionBreakTypeOf, // 原 xd
  sectionStartPageNumber as startingPageNumberOfSection, // 原 vd
  sectionStartPageNumberOrUndefined as explicitPageStartOfSection, // 原 yd
  twipsToPxRounded as twipsToPx, // 原 ld
  rangeTextLength as rangePlainTextLength, // 原 lf
  parseDropCap as dropCapOfParagraph, // 原 Zl
  paragraphHasImage as paragraphHasDropCap, // 原 Pf（调用点旧注误标首字下沉；混淆名为准）
  paragraphHasVisibleText as paragraphIsTextBox, // 原 Yf（同上，实为可见文本判定）
  paragraphHasFormField as paragraphIsFramed, // 原 qf（同上，实为表单域判定）
} from "./LegacyDocEngineBModel";
import {
  updateOverlapStability as updateOverlapStabilitySource, // 原 Io（targetPageCount 可 undefined → 下方桥接）
  mapBeforeInputEvent as mapBeforeInputEventSource, // 原 ro（指令面分歧 → 下方桥接）
  applyPlainTextInputCommand as applyPlainTextInputCommandSource, // 原 mo（同上）
  inputCommandCategory as inputCommandCategorySource, // 原 io（同上）
  mergeCellParagraphsAtBoundary as mergeCellParagraphDelete, // 原 go
  replaceTableCellParagraphTextDeep as replaceCellParagraphText, // 原 to
  replaceTableCellText as replaceCellTextContract, // 原 $a
  hitTestTextOffset as wrappedLayoutHitOffset, // 原 Ps
} from "./LegacyDocEngine4";
import {
  isInlineImageNode as floatingImageCreatesExclusion, // 原 Ng
  lineRangeIsPartial as partialLineRangeIsProper, // 原 gg
  segmentMatchesLineRange as samePartialLineSelection, // 原 wg
  twipsToPxNonNegative as twipsToPxRounded, // 原 Br
  tableRowHeights as tableRowHeightsC1, // 原 $h（contentWidthPx 可 undefined → 下方桥接）
} from "./LegacyDocEngineC1";
import { floatingImageGeometry } from "./LegacyDocEngineBLayout"; // 原 Jp（消费面经适配器）
import {
  buildPageThumbnailSnapshots as buildPageThumbnailSnapshotsSource, // 原 wS（输入面含 undefined 元素 → 下方桥接）
  publishPageSnapshots as publishPageSnapshotsSource, // 原 aS（快照面桥接，与 wS 配套）
} from "./LegacyDocEngineBPageRegistry";
import {
  unscaleDelta, // 原 zg
  unscaleRect, // 原 Bg
  sectionFloatingMovePatch, // 原 Vg
  floatingMovePatch, // 原 Hg
  paragraphHostPointHit, // 原 Ug
  floatingWrapIsInlineLike, // 原 Wg
} from "./LegacyDocEngineC5";

/* 批 B 常量语义裁决（值同源 jsx 15383-15391；批 B 以表格域命名登记，
   本件按 [E7] 批注槽实际用途起本地别名——见报告 §3）：
   ku=300 批注槽带宽度 | Au=48 卡片左偏移 | ju=12 卡片右收进 | Mu=4 卡片顶间隙
   Nu=30 卡片最小高 | Pu=8 连接线最小泳道 | Fu=7 泳道步进 | Lu=240 初始绘制延迟 */
const ANNOTATION_GUTTER_BAND_WIDTH_PX = TABLE_HOVER_SETTLE_MS; // 原 ku=300
const ANNOTATION_CARD_LEFT_PX = TABLE_ANNOTATION_MIN_PX; // 原 Au=48
const ANNOTATION_CARD_RIGHT_PX = TABLE_ANNOTATION_GAP_A_PX; // 原 ju=12
const ANNOTATION_CARD_TOP_GAP_PX = TABLE_ANNOTATION_GAP_B_PX; // 原 Mu=4
const ANNOTATION_CARD_MIN_HEIGHT_PX = TABLE_ANNOTATION_LANE_PX; // 原 Nu=30
const ANNOTATION_CONNECTOR_MIN_LANE_PX = TABLE_ANNOTATION_PAD_PX; // 原 Pu=8
const ANNOTATION_CONNECTOR_LANE_STEP_PX = TABLE_ANNOTATION_RADIUS_PX; // 原 Fu=7
const INITIAL_PAINT_DELAY_MS = TABLE_ANNOTATION_MAX_MS; // 原 Lu=240

/* ============================================================================
 * §0 外部契约声明（其他段/层提供；锚点登记）
 * A0-S2c 接线：本节原 105 项 declare 中 85 项已改指域内实体导出（顶部导入），
 * 9 项无消费删除；余 11 项为跨批/未转录锚点（保留），另设契约面桥接 13 件。
 * 逐件归属见 A0-S2c.report.md §2。
 * ==========================================================================*/

/* --- §0a 契约面桥接（类型面、零运行时；参数序适配器另注） --- */

/** 原 Zb 桥接：C2 锚点参数为 HTMLElement 面，消费侧传 Element（类型面） */
const annotationAnchorRect = annotationAnchorRectSource as unknown as (anchor: Element, pageElement: HTMLElement) => { top: number; left: number; right: number; bottom: number; width: number; height: number } | undefined;
/** 原 Md 桥接：实际返回可 undefined，消费侧均经 Number.isFinite 守卫；旧 declare 登记 number 面（类型面） */
const estimateFooterHeight = minFloatingImageTopSource as unknown as (footerNodes: DocxNode[], layout: PageLayoutContract) => number;
/** 原 Io 桥接：targetPageCount 消费侧可 undefined（类型面） */
const measurementStabilityArbitration = updateOverlapStabilitySource as unknown as (input: {
  pageCount: number;
  targetPageCount: number | undefined;
  overlappingPageIndexes: number[];
  previousSignature: string | undefined;
  previousConsecutivePasses: number;
  stabilityThreshold: number;
}) => { signature: string; consecutivePasses: number; shouldLatch: boolean };
/** 原 Hu 适配器：BModel 参数序 (nodes, segments, key)，jsx 消费面 (segments, nodes, key)，
 *  交换参数序保持原语义；返回实为快照对象，本地面按旧 declare 登记为 string
 *  （消费侧仅经 samePaginationSnapshot 相等比较） */
const pageContentIdentityKey = (segments: PageSegment[], nodes: DocxNode[], geometryIdentityKey: string): string =>
  buildPaginationSnapshot(nodes, segments, geometryIdentityKey) as unknown as string;
/** 原 Uu 桥接：实际比较对象为 Hu 快照；旧 declare 登记 string 面（类型面） */
const sameIdentityKeyList = samePaginationSnapshot as unknown as (a: string | undefined, b: string | undefined) => boolean;
/** 原 jy 桥接：列宽数组可含 undefined 元素（类型面） */
const normalizeColumnWidths = normalizeGridWidthsPxSource as unknown as (widths: (number | undefined)[], count: number, totalWidthPx: number, minWidthPx?: number) => number[];
/** 原 $h 桥接：消费侧 contentWidthPx 可 undefined（类型面） */
const estimateTableRowHeights = tableRowHeightsC1 as unknown as (table: DocxTableNode, contentWidthPx: number | undefined, numberingDefinitions: unknown, docGridLinePitchPx: number | undefined, contentHeightPx: number | undefined) => (number | undefined)[];
/** 原 Jp 桥接：消费面（图节点、内容宽、frame）→ BLayout floatingImageGeometry（类型面；
 *  调用点参数已按 jsx 31767 校正为图节点 r） */
const floatingAnchorLayout = floatingImageGeometry as unknown as (image: Record<string, unknown>, contentWidthPx: number, frame: { widthPx: number; heightPx: number; baseLeftPx?: number; baseTopPx?: number }) => { imageLeftPx?: number; imageTopPx?: number } | undefined;
/** 原 ro 桥接：Engine4 指令面（DocxInputCommand）与旧 declare 登记面分歧（类型面） */
const classifyBeforeInput = mapBeforeInputEventSource as unknown as (input: { inputType: string; data: string | null; dataTransferText: string | undefined }) =>
  | { kind: `blocked` | `historyUndo` | `historyRedo` | `insertParagraph` | `insertText` | `replaceText` | `insertLineBreak` | `deleteContent` | `deleteRange`; direction?: `backward` | `forward` }
  | undefined;
/** 原 mo 桥接：同上（类型面） */
const applyInputEdit = applyPlainTextInputCommandSource as unknown as (text: string, start: number, end: number, operation: NonNullable<ReturnType<typeof classifyBeforeInput>>) => { text: string; caret: number } | undefined;
/** 原 io 桥接：同上（类型面） */
const coalesceSuffixForInput = inputCommandCategorySource as unknown as (operation: NonNullable<ReturnType<typeof classifyBeforeInput>>) => string | undefined;
/** 原 wS 桥接：pageSectionInfoByIndex 含 undefined 元素，输入面按旧 declare 登记（类型面） */
const buildPageThumbnailSnapshotBatch = buildPageThumbnailSnapshotsSource as unknown as (input: {
  model: DocxEditorModel;
  pageNodeSegmentsByPage: PageSegment[][];
  pageSectionInfoByIndex: (PageSectionInfoContract | undefined)[];
  contentKeysByPage: string[];
  fallbackLayout: PageLayoutContract;
  documentTheme: unknown;
  docGridLinePitchPxByNodeIndex: Map<number, number>;
  numberingDefinitions: unknown;
}) => ({ key: string; getSnapshot(): unknown } | undefined)[];
/** 原 aS 桥接：与 wS 桥接面配套（类型面） */
const publishPageSnapshots = publishPageSnapshotsSource as unknown as (editor: DocxEditorState, contentKeys: string[], sizes: { widthPx: number; heightPx: number }[], snapshots: ({ key: string; getSnapshot(): unknown } | undefined)[]) => void;

/* --- §0b 保留 declare（属主未转录/属他批；锚点登记） --- */

/** 原 l（@tanstack/react-virtual useVirtualizer 契约，jsx 28204）——vendor 库面，保留 */
declare function useVirtualizerContract(options: { count: number; getScrollElement: () => HTMLElement | null; estimateSize: (index: number) => number; overscan: number }): VirtualizerContract;
/** 原 c（@tanstack/react-virtual useWindowVirtualizer 契约，jsx 28210）——vendor 库面，保留 */
declare function useWindowVirtualizerContract(options: { count: number; getScrollElement: () => Window | null; estimateSize: (index: number) => number; overscan: number }): VirtualizerContract;
interface VirtualizerContract {
  getVirtualItems(): { index: number; start: number; end: number; size: number }[];
  measure(): void;
  scrollToIndex(index: number, options?: { align?: `start` | `center` | `end` | `auto` }): void;
  scrollOffset: number;
  scrollRect?: { height: number };
  scrollDirection?: `forward` | `backward`;
}
/** 原 Op（jsx 30317）：浮动图 → 环绕语义模型——属主未转录，保留 */
declare function imageWrapModel(floating: unknown): { mode: string; moveWithText: boolean; fixedPositionOnPage: boolean };
/** 原 kp（jsx 30623）：菜单动作 → 环绕模式——属主未转录，保留 */
declare function wrapModeForAction(actionId: string): string | undefined;
/** 原 Up（jsx 29829 消费）：段落编辑文本（含显式换行）——属主未转录，保留 */
declare function paragraphEditText(paragraph: DocxParagraphNode): string;
/** 原 Mf（jsx 27624 消费）：单元格节点 → 段落列表——属主未转录，保留 */
declare function cellParagraphs(nodes: DocxNode[]): DocxParagraphNode[];
/** 原 jf（jsx 31251 消费）：单元格节点 → 段落数组（含空段）——属主未转录，保留 */
declare function cellParagraphArray(nodes: DocxNode[]): DocxParagraphNode[];
/** 原 Ce.flushSync（react-dom，jsx 31077）——react-dom 面，保留 */
declare function flushSyncContract(callback: () => void): void;
/** 原 Yr（jsx 15900± 消费）：sectPr → 页几何（版式契约）——属主未转录，保留 */
declare function pageGeometryOfSection(sectionPropertiesXml: string | undefined): PageLayoutContract;
/** 原 Ys（jsx 14893）：metadata 身份哈希（sections/headers/numbering 等）——属主未转录，保留 */
declare function metadataIdentityHash(metadata: unknown): string;
/** 原 qp（jsx 17543）：px → twips——属主未转录，保留 */
declare function pxToTwips(px: number): number;

/* 图片层序常量（原 jsx 15686-15689，图片环绕域；本簇右键菜单消费，原值照录） */
const IMAGE_ZINDEX_MIN = 0; // 原 td
const IMAGE_ZINDEX_STEP = 65536; // 原 nd
const IMAGE_ZINDEX_MAX = 251658240; // 原 rd
const IMAGE_ZINDEX_DEFAULT = IMAGE_ZINDEX_MAX; // 原 id
/* 内容宽兜底常量（原 Pr，jsx 11994；表格/浮动域共用，原值照录） */
const CONTENT_WIDTH_FALLBACK_PX = 900; // 原 Pr

/** 页几何契约（原 Yr 返回面 / 公共层 DocxPageGeometry） */
export interface PageLayoutContract {
  pageWidthPx: number;
  pageHeightPx: number;
  marginsPx: { top: number; right: number; bottom: number; left: number };
  headerDistancePx: number;
  footerDistancePx: number;
}
/** 表格选区契约（原 un 状态面） 〔A1-R186〕★本注（块 @435-435、类别「死面之标签」）係下方被删面之**标签**：其主语 TableSelectionContract 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R185 referent-liveness 判据〕其 referent 经重测仍有代码位命中：un（束符，「原 X」之后者；命中 47 处，★短 token）（口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））。★须自载〔A1-R185 referent-liveness 判据〕之局限：其 referent 抽取兼收束符与短 token，树内代码位命中可能係同形巧合而非真 referent（本批实测 `js` 一词全树代码位命中 557 处、`hook` 199 处，皆属此类，已自存活理据中剔除）⇒ 该判据之误差方向係**偏存活**（不会误删活注）；本批只据此判存活、不据命中数作任何更强声称。〔独立理据〕本注另载束源登记形（原 X；束符 un）⇒ 按〔A1-R165 s8〕其束源标注须逐字保留于原处。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/LegacyDocEngineC3.tsx：4 面／43 行，本批该文件共 4 碑）：本地 interface TableSelectionContract@436-442（7 行）纯删，7 行等行墓碑在原位。判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface TableSelectionContract：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；带 export 而无一家导入方把该名作 specifier 拉取〔判据 Ⓑ 之 specifier 级，A1-R184 v8〕。
 *    同名定义站：TableSelectionContract 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    邻接注记裁定（±4 行窗口）：@146／@435／@453／@456／@464／@5246 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 7 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 7 行置换原 7 行，文件行数 5252 不变、零重锚（本文件 LegacyDocEngineC3 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */
/** 页节信息（原 or 元素面） */
export interface PageSectionInfoContract {
  section: DocxSection;
  sectionIndex: number;
  pageIndexWithinSection: number;
  layout: PageLayoutContract;
  pageNumber: number;
}

/* ============================================================================
 * §1 交互簇上下文（批 B DocxEditorView 骨架的状态面 → 本簇回调的输入）〔A1-R186〕★本节注（块 @452-454）所辖之节（自块尾至 @494）今**失全部代码**：节内 33 行代码皆落在本批被删区间内、存活 0 ⇒ 本节只剩墓碑与注记。原文逐字保留、只增不改（骑手只增文、不删旧字）。
 * ==========================================================================*/

/** 分页结果面（批 B Qn memo 返回） 〔A1-R186〕★本注（块 @456-456、类别「死面之标签」）係下方被删面之**标签**：其主语 PaginationClusterInput 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R185 referent-liveness 判据〕其 referent 经重测仍有代码位命中：B（注内符号；命中 161 处，★短 token）／Qn（注内符号；命中 12 处，★短 token）（口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））。★须自载〔A1-R185 referent-liveness 判据〕之局限：其 referent 抽取兼收束符与短 token，树内代码位命中可能係同形巧合而非真 referent（本批实测 `js` 一词全树代码位命中 557 处、`hook` 199 处，皆属此类，已自存活理据中剔除）⇒ 该判据之误差方向係**偏存活**（不会误删活注）；本批只据此判存活、不据命中数作任何更强声称。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/LegacyDocEngineC3.tsx：4 面／43 行，本批该文件共 4 碑）：本地 interface PaginationClusterInput@457-462（6 行）纯删，6 行等行墓碑在原位。判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface PaginationClusterInput：单轮代码位读者 1 处（@481，逐处实测皆落在本批被删区间内）⇒ 级联迭代至不动点后读者 0；带 export 而无一家导入方把该名作 specifier 拉取〔判据 Ⓑ 之 specifier 级，A1-R184 v8〕。同名定义站：PaginationClusterInput 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    邻接注记裁定（±4 行窗口）：@146／@435／@453／@456／@464／@5246 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 6 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 6 行置换原 6 行，文件行数 5252 不变、零重锚（本文件 LegacyDocEngineC3 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/** 交互簇上下文：渲染器视图向回调簇提供的派生面 〔A1-R186〕★本注（块 @464-464、类别「死面之标签」）係下方被删面之**标签**：其主语 DocxEditorViewClusterContext 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★★本注係旧簇跨度所吞之窗口注（本批按 57 簇重新分类后方得归主），其 referent 经重测仍活（DocxEditorView 命中 4 处／useDocxEditorViewInteractionCallbacks 命中 2 处／useDocxEditorViewRenderCallbacks 命中 1 处；口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））⇒ 必须存活。裁定出处逐字引自 dossier-F：「dossier-F f.2: DocxEditorView is live in 4 places and both callback clusters (C3@518, C4@380) are live」。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/LegacyDocEngineC3.tsx：4 面／43 行，本批该文件共 4 碑）：本地 interface DocxEditorViewClusterContext@465-493（29 行）纯删，29 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface DocxEditorViewClusterContext：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；带 export 而无一家导入方把该名作 specifier 拉取〔判据 Ⓑ 之 specifier 级，A1-R184 v8〕。
 *    同名定义站：DocxEditorViewClusterContext 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    原体内 @489 之单行成员文档注按〔A1-R165 s8〕**逐字保留于本碑**（其注内散文「表单域双击判定（批 B 已实体化，原 nt，jsx 27447）」原样转录；定界符按〔A1-R173 沉淀①〕只描述不引用）——它载束源出处，删之即失证。
 *    原体内 @491 之单行成员文档注按〔A1-R165 s8〕**逐字保留于本碑**（其注内散文「页元素登记（批 B 已实体化，原 ht，jsx 27465）」原样转录；定界符按〔A1-R173 沉淀①〕只描述不引用）——它载束源出处，删之即失证。
 *    邻接注记裁定（±4 行窗口）：@146／@435／@453／@456／@464／@5246 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 29 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 29 行置换原 29 行，文件行数 5252 不变、零重锚（本文件 LegacyDocEngineC3 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/* ============================================================================
 * §2 交互簇核心面（批 B 骨架状态面 → 回调簇输入；原 27383-27556 登记面）
 * ==========================================================================*/

/**
 * 交互簇核心：回调簇消费的全部状态/引用/派生面。
 * 字段名 = 语义名；解构别名 = 源混淆名（函数体内保持逐字保真）。
 * 状态对 [值, setter] 与 refs 由批 B DocxEditorView 骨架持有（jsx 27383-27556），
 * 此处仅登记契约面，不重复转录骨架声明（边界裁决见报告 §2）。
 */
export interface DocxEditorViewInteractionCore {
  [key: string]: any;
}

/* ============================================================================
 * §3 交互回调簇 hook（原 ES 函数体交互段 jsx 27889-31873 实体化）
 * ==========================================================================*/

/**
 * 原 ES 交互回调簇：页节信息/快照发布/虚拟化页窗/测量回灌/表格选区与指针/
 * DOM 选区助手/选区会话/拖选/键盘/右键菜单/光标导航/草稿提交/表格几何与缩放。
 * 函数体内局部变量名从源；顶层符号语义名见文件头 §A。
 */
export function useDocxEditorViewInteractionCallbacks(core: DocxEditorViewInteractionCore): any {
  const {
    editor: e,
    deferInitialPaginationPaint: a,
    pageVirtualization: s,
    visiblePageRange: u,
    onPageCountChange: d,
    onRequestPageReveal: f,
    onFormFieldDoubleClick: x,
    showTrackedChanges: w,
    showComments: E,
    annotationsVisible: O,
    isReadOnly: k,
    isEditable: N,
    invertFilter: M,
    paginationSink: C,
    tocLinkColorByLevel: F,
    highlightContext: I,
    fallbackLayout: Hn,
    sections: Bn,
    defaultSectionXml: Vn,
    sectionMetrics: Un,
    geometryIdentityKey: Wn,
    docGridLinePitchPxByNodeIndex: Gn,
    pageContentWidthPxByNodeIndex: Kn,
    pageContentHeightPxByNodeIndex: qn,
    sectionColumns: Jn,
    pages: $n,
    useMeasuredPageHeightsForRender: er,
    renderMeasuredPageHeightsPx: tr,
    renderPageHeightScale: nr,
    pageIdentityKeys: rr,
    measuredParagraphOuterHeightsByNodeIndex: ie,
    locationKey: P,
    handleFormFieldTap: nt,
    pageElementCallbackFor: ht,
    rootElementRef: L,
    pageBodyElementMapRef: se,
    pageWrapperElementMapRef: le,
    headerElementMapRef: K,
    footerElementMapRef: ce,
    annotationCardElementMapRef: ue,
    paragraphElementMapRef: te,
    floatingTableElementMapRef: G,
    draggedImageRef: Z,
    bookmarkNodeIndexMap: Xn,
    draftElementMapRef: oe,
    cellHostElementMapRef: ae,
    historyRestoreNonceRef: X,
    clipboardTextRef: V,
    wrappedEditStateMirrorRef: We,
    cellDraftHostMapRef: W,
    scheduleAnnotationEpoch: Fn,
    paginationKick: Pn,
    wrappedParagraphRegistryRef: kt,
    wrappedSelectionRestoreRef: Dt,
    wrappedTextareaRef: Et,
    selectionRestoreMemoRef: ye,
    paragraphOffsetRestoreRef: ve,
    wrappedCaretActiveRef: xe,
    selectionSyncTimerRef: we,
    selectionSyncFrameRef: _e,
    beginFrameToken: In,
    isFrameTokenCurrent: Ln,
    runOnFrameToken: Rn,
    invalidateFrameToken: zn,
    cellDraftElementMapRef: R,
    cellParagraphDraftElementMapRef: ee,
    paragraphDraftMapRef: H,
    partialLineRestoreRef: U,
    lastTapRef: De,
    dragSessionRef: cn,
    pointerSessionRef: Se,
    measurementModelRef: An,
    measurementPassCountRef: jn,
    paginationThrottleDeadlineRef: Mn,
    frameTokenRef: Ee,
    activeTextRangeRef: be,
    selectionSyncPendingRef: fe,
    sectionDraftCaretRestoreRef: pe,
    revealRequestRef: J,
    scrollFrameRef: de,
    revealFrameRef: Y,
    frameTokenFrameRef: Te,
    paginationSettleTimerRef: Nn,
    paginationStatsRef: Bt,
    measurementLatchRef: St,
    measuredRowHeightsEpochRef: Ot,
    rowResizeSessionRef: on,
    cornerResizeSessionRef: sn,
    tableDragEnabledRef: ln,
    setBlockIdHeightOverrides: re,
    dropOverlayVisible: Oe, setDropOverlayVisible: ke,
    imageDragging: Ae, setImageDragging: je,
    imageDropTarget: Me, setImageDropTarget: Ne,
    selectedImage: Pe, setSelectedImage: Fe,
    selectedSectionImage: Ie, setSelectedSectionImage: Le,
    selectedDropCap: Re, setSelectedDropCap: ze,
    hoveredDropCap: Be, setHoveredDropCap: Ve,
    wrappedEditState: He, setWrappedEditState: Ue,
    resizePreview: Ge, setResizePreview: Ke,
    floatingMovePreview: Q, setFloatingMovePreview: qe,
    dropCapMovePreview: Je, setDropCapMovePreview: Ye,
    dropCapResizePreview: Xe, setDropCapResizePreview: Ze,
    columnWidthOverridesA, setColumnWidthOverridesA,
    columnWidthOverridesB, setColumnWidthOverridesB,
    columnResizeSession, setColumnResizeSession,
    columnResizePreview, setColumnResizePreview,
    rowHeightPreviewA, setRowHeightPreviewA,
    rowHeightPreviewB, setRowHeightPreviewB,
    measuredTableRowHeights: dt, setMeasuredTableRowHeights: ft,
    measuredPageHeights: pt, setMeasuredPageHeights: mt,
    measuredPageIdentityKeys: gt, setMeasuredPageIdentityKeys: _t,
    measuredPageHeightKeys: vt, setMeasuredPageHeightKeys: yt,
    measurementOverlapLatch: bt, setMeasurementOverlapLatch: xt,
    paginationPaintPending: Pt, setPaginationPaintPending: Ft,
    initialPaintComplete: At, setInitialPaintComplete: jt,
    paginationSettled: Mt, setPaginationSettled: Nt,
    paginationStats: It, setPaginationStats: Lt,
    importPaginationActive: Rt, setImportPaginationActive: zt,
    rowResizeSession, setRowResizeSession,
    rowResizePreview, setRowResizePreview,
    cornerResizeSession: Gt, setCornerResizeSession: Kt,
    cornerResizePreview: qt, setCornerResizePreview: Jt,
    hoveredBoundary: Yt, setHoveredBoundary: Xt,
    hoveredTable: Zt, setHoveredTable: Qt,
    hoveredHandle: $t, setHoveredHandle: en,
    embeddedTableKeyA: tn, setEmbeddedTableKeyA: nn,
    embeddedTableKeyB: rn, setEmbeddedTableKeyB: an,
    tableSelection: un, setTableSelection: dn,
    tableMovePreview: fn, setTableMovePreview: pn,
    floatingTableMovePreview: mn, setFloatingTableMovePreview: hn,
    tableContextMenu: gn, setTableContextMenu: _n,
    contextMenu: vn, setContextMenu: yn,
    headerFooterSession: bn, setHeaderFooterSession: xn,
    annotationEpoch: Sn, bumpAnnotationEpoch: Cn,
    layoutEpoch: wn, bumpLayoutEpoch: Tn,
    paginationEpoch: En, bumpPaginationEpoch: Dn,
    floatingExclusionRects: On, setFloatingExclusionRects: kn,
    partialLineSelection: wt, setPartialLineSelection: Tt,
  } = core;

  /* ---------- 页节/快照面（jsx 27889-28041） ---------- */

  // 原 ir（jsx 27889）：nodeIndex → 首次出现页索引 查找表
  const firstPageIndexByNodeIndex = React.useMemo(() => {
    let e = new Map<number, number>();
    return $n.forEach((t: any, n: any) => {
      t.forEach((t: any) => {
        e.has(t.nodeIndex) || e.set(t.nodeIndex, n);
      });
    }), e;
  }, [$n]);

  // 原 ar（jsx 27893）：模型声明页数（归一）
  const declaredPageCount = React.useMemo(() => {
    let t = (e.model.metadata as any).documentPageCount;
    if (!(!Number.isFinite(t) || t <= 0)) return Math.max(1, Math.round(t));
  }, [e.model.metadata.documentPageCount]);

  // 原 or（jsx 27900）：逐页节区信息（节索引/节内页序/版式/页码）
  const pageSectionInfoByIndex = React.useMemo(() => {
    if ($n.length === 0) return [];
    let t = Bn.length > 0 ? Bn : [{
        startNodeIndex: 0,
        sectionPropertiesXml: e.model.metadata.sectionPropertiesXml,
        headerSections: (e.model.metadata as any).headerSections,
        footerSections: (e.model.metadata as any).footerSections
      }],
      n = new Map<number, number>();
    t.forEach((e: any, t: any) => {
      let r = Math.max(0, Math.round(e.startNodeIndex)),
        i = firstPageIndexByNodeIndex.get(r);
      if (!Number.isFinite(i)) return;
      let a = Math.max(0, Math.round(i as number));
      if (t > 0 && sectionBreakTypeOf(e.sectionPropertiesXml) === `continuous`) {
        let e = $n[a]?.[0]?.nodeIndex;
        Number.isFinite(e) && e < r && (a += 1);
      }
      n.set(t, a);
    }), n.has(0) || n.set(0, 0);
    let r = 0;
    for (let i = 0; i < $n.length; i += 1) r = lastPageBreakSectionIndex(t, e.model.nodes, $n[i] ?? [], r), n.has(r) || n.set(r, i);
    let i = new Map<number, number>();
    t.forEach((e: any, t: any) => {
      if (t === 0 || e.startNodeIndex < 0 || sectionBreakTypeOf(e.sectionPropertiesXml) !== `continuous`) return;
      let r = firstPageIndexByNodeIndex.get(e.startNodeIndex),
        a = n.get(t);
      Number.isFinite(r) && Number.isFinite(a) && (a as number) > (r as number) && i.set(t, Math.round((a as number) - (r as number)));
    });
    let a = new Map<number, number>(),
      o: PageSectionInfoContract[] = [],
      c = 0,
      l = startingPageNumberOfSection(t[0]?.sectionPropertiesXml);
    for (let r = 0; r < $n.length; r += 1) {
      let u = $n[r] ?? [];
      for (; c + 1 < t.length;) {
        let e = n.get(c + 1);
        if (!Number.isFinite(e) || (e as number) > r) break;
        c += 1;
      }
      c = lastPageBreakSectionIndex(t, e.model.nodes, u, c);
      let d = t[c] ?? t[t.length - 1],
        f = a.get(c) ?? 0;
      a.set(c, f + 1);
      let p = i.get(c) ?? 0,
        m = f + p;
      r === 0 ? l = explicitPageStartOfSection(d.sectionPropertiesXml) ?? startingPageNumberOfSection(d.sectionPropertiesXml) : f === 0 ? l = (explicitPageStartOfSection(d.sectionPropertiesXml) ?? l + 1) + p : l += 1, o.push({
        section: d,
        sectionIndex: c,
        pageIndexWithinSection: m,
        layout: pageGeometryOfSection(d.sectionPropertiesXml ?? Vn),
        pageNumber: l
      });
    }
    return o;
  }, [Bn, e.model.nodes, e.model.metadata.footerSections, e.model.metadata.headerSections, e.model.metadata.sectionPropertiesXml, firstPageIndexByNodeIndex, $n, Vn]);

  // 原 sr（jsx 27957）：逐页内容身份键（快照失效判定）
  const pageContentKeys = React.useMemo(() => {
    let t = metadataIdentityHash(e.model.metadata);
    return $n.map((n: any, r: any) => {
      let i = pageSectionInfoByIndex[r],
        a = ``;
      for (let t of n) a += paragraphTextContract(e.model.nodes[t.nodeIndex]), a += `,`;
      return [e.documentLoadNonce, w ? `tc1` : `tc0`, t, i ? `${i.sectionIndex}.${i.pageNumber}` : `s?`, rr[r] ?? ``, a].join(`|`);
    });
  }, [e.documentLoadNonce, e.model, rr, $n, pageSectionInfoByIndex, w]);

  // 原 cr（jsx 27966）：逐页版面尺寸（快照发布用）
  const pageLayoutSizes = React.useMemo(() => $n.map((e: any, t: any) => {
    let n = pageSectionInfoByIndex[t]?.layout ?? Hn;
    return {
      widthPx: n.pageWidthPx,
      heightPx: n.pageHeightPx
    };
  }), [Hn, $n, pageSectionInfoByIndex]);

  // 原 lr（jsx 27971）：缩略图快照批（懒 getSnapshot）
  const pageSnapshotBatch = React.useMemo(() => buildPageThumbnailSnapshotBatch({
    model: e.model,
    pageNodeSegmentsByPage: $n,
    pageSectionInfoByIndex: pageSectionInfoByIndex,
    contentKeysByPage: pageContentKeys,
    fallbackLayout: Hn,
    documentTheme: e.documentTheme,
    docGridLinePitchPxByNodeIndex: Gn,
    numberingDefinitions: e.model.metadata.numberingDefinitions
  }), [Gn, Hn, e.documentTheme, e.model, e.model.metadata.numberingDefinitions, $n, pageSectionInfoByIndex, pageContentKeys]);

  // 原 aS 调用（jsx 27985-27987）：快照发布（页内容键/尺寸/缩略图）
  React.useEffect(() => {
    publishPageSnapshots(e, pageContentKeys, pageLayoutSizes, pageSnapshotBatch);
  }, [C, pageContentKeys, pageSnapshotBatch, pageLayoutSizes]);

  // 原 ur（jsx 27988）：TOC 样式字段解析器（样式名 → 页内首见文本，回退前溯）
  const tocStyleFieldResolver = React.useMemo(() => {
    let t = new Map<string, string | undefined>(),
      n = e.model.nodes,
      r = (e: any, t: any, n: any) => {
        let r = normalizeStyleName(e.style?.styleId ?? ``),
          i = normalizeStyleName(e.style?.styleName ?? ``);
        if (r === n || i === n) {
          let t = paragraphTextContract(e).replace(/\s+/g, ` `).trim();
          if (t.length > 0) return t;
        }
        return tocFieldFallback(e, t);
      };
    return (e: any, i: any) => {
      let a = normalizeStyleName(i);
      if (!a) return;
      let o = `${e}:${a}`;
      if (t.has(o)) return t.get(o);
      let s = $n[e] ?? [],
        c = new Set<number>();
      for (let e of s) {
        if (!Number.isFinite(e.nodeIndex) || c.has(e.nodeIndex)) continue;
        c.add(e.nodeIndex);
        let s = n[e.nodeIndex];
        if (!s || s.type !== `paragraph`) continue;
        let l = r(s, i, a);
        if (l) return t.set(o, l), l;
      }
      let l = s[0]?.nodeIndex,
        u = Number.isFinite(l) && l > 0 ? Math.min(n.length - 1, Math.round(l) - 1) : n.length - 1;
      for (let e = u; e >= 0; --e) {
        let s = n[e];
        if (!s || s.type !== `paragraph`) continue;
        let c = r(s, i, a);
        if (c) return t.set(o, c), c;
      }
      t.set(o, void 0);
    };
  }, [e.model.nodes, $n]);

  // 原 dr（jsx 28023）：活动页数
  const livePageCount = $n.length;

  // 原 fr（jsx 28024）：重表格文档判定（单元格/行/列阈值）
  const heavyTableDocument = React.useMemo(() => {
    let t = 0,
      n = 0,
      r = 0;
    for (let i of e.model.nodes) if (i.type === `table`) for (let e of (i as any).rows) {
      let i = 0;
      n += e.cells.length;
      for (let n of e.cells) {
        let e = cellParagraphs(n.nodes).length;
        t += e, i += e;
      }
      r = Math.max(r, i);
    }
    return t >= 1e3 || n >= 240 || r >= 100;
  }, [e.model.nodes]);

  // 原 pr（jsx 28040）：延迟首绘活动
  const deferredPaintActive = a && !At;

  // 原 mr（jsx 28041）：页数 → 总高度估算（网格间距 + 逐页版式高）
  const totalHeightForPageCount = React.useCallback((e: any) => {
    let t = Math.max(0, Math.round(e));
    if (t <= 0) return 0;
    let n = pageSectionInfoByIndex[pageSectionInfoByIndex.length - 1]?.layout ?? Hn,
      r = Math.max(0, (t - 1) * PAGE_GRID_GAP_PX);
    for (let e = 0; e < t; e += 1) {
      let t = pageSectionInfoByIndex[e]?.layout ?? n;
      r += Math.max(1, Math.round(t.pageHeightPx));
    }
    return r;
  }, [Hn, pageSectionInfoByIndex]);

  // 原 分页统计回灌 effect（jsx 28047-28068）：页数/总高单调上抬
  React.useEffect(() => {
    if (!deferredPaintActive) {
      Lt((e: any) => e.pageCount === 0 && e.totalHeightPx === 0 ? e : {
        pageCount: 0,
        totalHeightPx: 0
      });
      return;
    }
    let e = Math.max(1, livePageCount, declaredPageCount ?? 0);
    Lt((t: any) => {
      let n = Math.max(t.pageCount, e),
        r = Math.max(t.totalHeightPx, totalHeightForPageCount(n));
      return t.pageCount === n && t.totalHeightPx === r ? t : {
        pageCount: n,
        totalHeightPx: r
      };
    });
  }, [totalHeightForPageCount, deferredPaintActive, livePageCount, declaredPageCount]);

  /* ---------- 虚拟化页窗面（jsx 28070-28408） ---------- */

  // 原 hr..vr（jsx 28070-28078）：页数仲裁/渲染计数/高度/外部页窗判定
  const convergencePageCount = declaredPageCount ?? Math.max(1, It.pageCount, livePageCount);
  const virtualizationPageCount = deferredPaintActive ? convergencePageCount : livePageCount;
  const virtualizationTotalHeightPx = deferredPaintActive ? Math.max(It.totalHeightPx, totalHeightForPageCount(Math.max(1, livePageCount, declaredPageCount ?? 0, It.pageCount))) : 0;
  const externalRangeProvided = Number.isFinite(Number(u?.startPageIndex)) || Number.isFinite(Number(u?.endPageIndex));

  // 原 yr..Fr（jsx 28078-28083）：虚拟化状态面
  const [virtualizationSettled, setVirtualizationSettled] = React.useState(!1);
  const [resolvedScrollElement, setResolvedScrollElement] = React.useState<any>(null);
  const [resolvedZoomScale, setResolvedZoomScale] = React.useState<any>(1);
  const [pendingVisibleRange, setPendingVisibleRange] = React.useState<any>(void 0);
  const settleDelayMs = Math.max(0, Math.round(Number.isFinite(s?.settleDelayMs) ? s?.settleDelayMs : DOUBLE_CLICK_INTERVAL_MS));
  const overscanPx = Math.max(0, Math.round(Number.isFinite(s?.overscan) ? s?.overscan : DRAG_SCROLL_STEP_PX));
  const effectiveOverscan = heavyTableDocument && !Number.isFinite(s?.overscan) ? DRAG_SCROLL_MIN_PX : overscanPx;
  const webdriverDetected = typeof navigator < `u` && (navigator as any).webdriver === !0;
  const virtualizationEnabled = s?.enabled !== !1 && !externalRangeProvided && !deferredPaintActive && At && !virtualizationSettled && !webdriverDetected && livePageCount > 1;
  const scrollElementProp = s?.scrollElement ?? null;
  const zoomScaleProp = normalizeZoomScaleProp(s?.zoomScale);
  const resolveZoomScale = React.useCallback((e: any, t: any = 1) => zoomScaleProp === void 0 ? e ? resolveCumulativeZoom(e) : t : zoomScaleProp, [zoomScaleProp]);

  // 原 浮动排除矩形回灌 effect（jsx 28087-28155）：
  // 模型换代重置计数；逐页收集浮动表格/环绕图片/段落矩形，容差比较后回灌
  React.useEffect(() => {
    if (Q || Ge || mn || cn.current) return;
    let t = An.current !== e.model;
    if (t && (An.current = e.model, jn.current = 0), jn.current >= FLOATING_MIN_FOOTPRINT_PX) return;
    let n = new Map<string, any>();
    se.current.forEach((t: any) => {
      if (!t.isConnected) return;
      let r = t.getBoundingClientRect();
      if (r.width <= 0) return;
      let i = resolveZoomScale(t, 1),
        a = (e: any) => ({
          topPx: (e.top - r.top) / i,
          bottomPx: (e.bottom - r.top) / i,
          leftPx: (e.left - r.left) / i,
          rightPx: (e.right - r.left) / i
        }),
        o = !1;
      if (G.current.forEach((r: any, i: any) => {
        if (!r.isConnected || !t.contains(r)) return;
        let s = e.model.nodes[i];
        s?.type !== `table` || !(s as any).style?.floating || (o = !0, n.set(`tbl:${i}`, a(r.getBoundingClientRect())));
      }), t.querySelectorAll(`[data-docx-image-location]`).forEach((t: any) => {
        if (!(t instanceof HTMLElement)) return;
        let r = t.getAttribute(`data-docx-image-location`) ?? ``,
          i = /^p:(\d+):(\d+)$/.exec(r);
        if (!i) return;
        let s = Number.parseInt(i[1] ?? ``, 10),
          c = Number.parseInt(i[2] ?? ``, 10),
          l = e.model.nodes[s],
          u = l?.type === `paragraph` ? (l as any).children[c] : void 0;
        !u || u.type !== `image` || !u.floating?.wrapType || u.floating.wrapType === `none` || u.floating.behindDocument === !0 || floatingImageCreatesExclusion(u) || getComputedStyle(t).position === `absolute` && (o = !0, n.set(`img:${r}`, a(t.getBoundingClientRect())));
      }), !o) {
        let n = !1;
        if (te.current.forEach((r: any, i: any) => {
          if (n || !r.isConnected || !t.contains(r)) return;
          let a = e.model.nodes[i];
          a?.type === `paragraph` && (a as any).children.some((e: any) => e.type === `image` && floatingImageCreatesExclusion(e)) && (n = !0);
        }), !n) return;
      }
      te.current.forEach((e: any, r: any) => {
        if (!e.isConnected || !t.contains(e)) return;
        let i = e.getBoundingClientRect();
        i.height <= 0 || n.set(`para:${r}`, a(i));
      });
    });
    let r = (e: any, t: any) => Math.abs(e.topPx - t.topPx) <= FLOATING_WRAP_TOLERANCE_PX && Math.abs(e.bottomPx - t.bottomPx) <= FLOATING_WRAP_TOLERANCE_PX && Math.abs(e.leftPx - t.leftPx) <= FLOATING_WRAP_TOLERANCE_PX && Math.abs(e.rightPx - t.rightPx) <= FLOATING_WRAP_TOLERANCE_PX,
      i = new Map<string, any>();
    t || On.forEach((e: any, t: any) => {
      i.set(t, e);
    });
    let o = !1;
    n.forEach((e, n) => {
      let a = On.get(n);
      if (a && r(a, e)) {
        i.set(n, a);
        return;
      }
      a && !t && (o = !0), i.set(n, e);
    });
    let s = i.size !== On.size;
    if (!s) {
      for (let [e, t] of i) if (On.get(e) !== t) {
        s = !0;
        break;
      }
    }
    s && (o && (jn.current += 1), kn(i));
  });

  // 原 虚拟化沉降 effect（jsx 28156-28170）：重表格文档延迟启用
  React.useEffect(() => {
    setVirtualizationSettled(!heavyTableDocument);
  }, [e.documentLoadNonce, heavyTableDocument]);
  React.useEffect(() => {
    if (typeof window > `u` || webdriverDetected || livePageCount <= 1) {
      setVirtualizationSettled(!0);
      return;
    }
    if (heavyTableDocument) {
      setVirtualizationSettled(!1);
      return;
    }
    let e = window.setTimeout(() => {
      setVirtualizationSettled(!1);
    }, settleDelayMs);
    return () => {
      window.clearTimeout(e);
    };
  }, [e.documentLoadNonce, heavyTableDocument, livePageCount, settleDelayMs, webdriverDetected]);

  // 原 滚动容器解析 layoutEffect（jsx 28171-28174）
  React.useLayoutEffect(() => {
    typeof window > `u` || setResolvedScrollElement(scrollElementProp instanceof HTMLElement ? scrollElementProp : findScrollContainer(L.current));
  }, [e.documentLoadNonce, scrollElementProp, livePageCount, w]);

  // 原 [Ir, Lr]（jsx 28176）：视口尺寸纪元（ResizeObserver/window resize）
  const [viewportSizeEpoch, bumpViewportSizeEpoch] = React.useState(0);
  React.useEffect(() => {
    if (typeof window > `u`) return;
    let e = L.current;
    if (!e) return;
    let t = () => {
        bumpViewportSizeEpoch(e => e + 1);
      },
      n = typeof ResizeObserver == `function` ? new ResizeObserver(t) : void 0;
    return n?.observe(e), window.addEventListener(`resize`, t), () => {
      n?.disconnect(), window.removeEventListener(`resize`, t);
    };
  }, [e.documentLoadNonce]);

  // 原 缩放解析 layoutEffect（jsx 28186-28191）
  React.useLayoutEffect(() => {
    if (typeof window > `u`) return;
    let e = L.current;
    if (!e) return;
    let t = Math.round(resolveZoomScale(e, resolvedZoomScale) * 100) / 100;
    setResolvedZoomScale((e: any) => Math.abs(e - t) < 0.005 ? e : t);
  }, [e.documentLoadNonce, livePageCount, resolveZoomScale, resolvedZoomScale, viewportSizeEpoch]);

  // 原 Rr..Wr（jsx 28197-28201）：虚拟化器激活面
  const virtualizerActive = virtualizationEnabled && resolvedScrollElement !== null;
  const windowScrollPending = typeof window < `u` && virtualizationEnabled && resolvedScrollElement === null;
  const scrollElementIsDocument = typeof document < `u` && resolvedScrollElement !== null && (resolvedScrollElement === document.scrollingElement || resolvedScrollElement === document.documentElement || resolvedScrollElement === document.body);
  const virtualizerInContainer = virtualizerActive && !scrollElementIsDocument;
  const virtualizerInWindow = virtualizerActive && scrollElementIsDocument;

  // 原 Gr（jsx 28198）：页尺寸估算（含网格间距，按缩放）
  const estimatePageSize = React.useCallback((e: any) => {
    let t = pageSectionInfoByIndex[e]?.layout ?? Hn;
    return Math.max(1, Math.round((t.pageHeightPx + PAGE_GRID_GAP_PX) * resolvedZoomScale));
  }, [Hn, pageSectionInfoByIndex, resolvedZoomScale]);

  // 原 Kr（jsx 28202）：分页回灌节流标记
  const markPaginationThrottle = React.useCallback(() => {
    Mn.current = Date.now() + CONTEXT_MENU_WIDTH_PX;
  }, []);

  // 原 qr/Xr/Zr（jsx 28204-28212）：容器/窗口虚拟化器与活动选择
  const containerVirtualizer = useVirtualizerContract({
    count: Math.max(1, livePageCount),
    getScrollElement: () => virtualizerInContainer ? resolvedScrollElement : null,
    estimateSize: estimatePageSize,
    overscan: effectiveOverscan
  });
  const windowVirtualizer = useWindowVirtualizerContract({
    count: Math.max(1, livePageCount),
    getScrollElement: () => virtualizerInWindow && typeof window < `u` ? window as any : null,
    estimateSize: estimatePageSize,
    overscan: effectiveOverscan
  });
  const activeVirtualizer = scrollElementIsDocument ? windowVirtualizer : containerVirtualizer;
  React.useLayoutEffect(() => {
    containerVirtualizer.measure(), windowVirtualizer.measure();
  }, [estimatePageSize, containerVirtualizer, windowVirtualizer]);

  // 原 Qr（jsx 28222）：虚拟项
  const virtualItems = activeVirtualizer.getVirtualItems();

  // 原 $r（jsx 28223）：锚点页（可见重叠最大项）
  const anchorPageIndex = React.useMemo(() => {
    if (!virtualizerActive || virtualItems.length === 0) return;
    let e = activeVirtualizer,
      t = Number.isFinite(e.scrollOffset) ? e.scrollOffset : virtualItems[0]?.start ?? 0,
      n = e.scrollRect?.height,
      r = t + (Number.isFinite(n) && (n as number) > 0 ? (n as number) : virtualItems[0]?.size ?? 0),
      i,
      a = -1;
    return virtualItems.forEach(e => {
      let n = Math.min(e.end, r) - Math.max(e.start, t);
      n > a && (a = n, i = e.index);
    }), i === void 0 ? void 0 : clampNumber(i, 0, livePageCount - 1);
  }, [virtualizerActive, activeVirtualizer, virtualItems, livePageCount]);

  // 原 ei（jsx 28232）：虚拟可见范围
  const virtualVisibleRange = React.useMemo(() => {
    if (!virtualizerActive) return;
    if (livePageCount <= 0) return {
      startPageIndex: 0,
      endPageIndex: -1
    };
    if (virtualItems.length === 0) return {
      startPageIndex: 0,
      endPageIndex: Math.min(livePageCount - 1, 2)
    };
    let e = virtualItems[0],
      t = virtualItems[virtualItems.length - 1],
      n = clampNumber(Math.round(e?.index ?? 0), 0, livePageCount - 1);
    return {
      startPageIndex: n,
      endPageIndex: clampNumber(Math.round(t?.index ?? n), n, livePageCount - 1)
    };
  }, [virtualizerActive, virtualItems, livePageCount]);

  // 原 ti（jsx 28252）：方向性过扫描范围（重表格文档）
  const overscannedVisibleRange = React.useMemo(() => {
    if (!virtualVisibleRange) return;
    if (!heavyTableDocument || Number.isFinite(s?.overscan)) return virtualVisibleRange;
    let e = activeVirtualizer.scrollDirection,
      t = e !== `forward`,
      n = e !== `backward`,
      r = clampNumber(virtualVisibleRange.startPageIndex - (t ? DRAG_SCROLL_PAGE_PX : 0), 0, livePageCount - 1);
    return {
      startPageIndex: r,
      endPageIndex: clampNumber(virtualVisibleRange.endPageIndex + (n ? DRAG_SCROLL_PAGE_PX : 0), r, livePageCount - 1)
    };
  }, [heavyTableDocument, activeVirtualizer.scrollDirection, virtualVisibleRange, livePageCount, s?.overscan]);

  // 原 ni（jsx 28266）：手动页窗活动
  const manualWindowActive = heavyTableDocument || virtualItems.length === 0;

  // 原 手动页窗跟踪 layoutEffect（jsx 28267-28331）：
  // rAF 节流扫描 [data-docx-page-wrapper] 可见页，回灌待决范围
  React.useLayoutEffect(() => {
    if (!virtualizerActive || !resolvedScrollElement || !manualWindowActive || typeof window > `u`) {
      setPendingVisibleRange((e: any) => e === void 0 ? e : void 0);
      return;
    }
    let e = L.current;
    if (!e) {
      setPendingVisibleRange((e: any) => e === void 0 ? e : void 0);
      return;
    }
    let t: any = null,
      n = (e: any) => {
        React.startTransition(() => {
          setPendingVisibleRange(e);
        });
      },
      r = () => {
        t = null, markPaginationThrottle();
        let r = scrollElementIsDocument ? {
            top: 0,
            bottom: window.innerHeight
          } : resolvedScrollElement.getBoundingClientRect(),
          i = e.querySelectorAll(`[data-docx-page-wrapper="true"][data-index]`),
          a,
          o;
        for (let e of Array.from(i)) {
          let t = (e as Element).getAttribute(`data-index`),
            n = Number.parseInt(t ?? ``, 10);
          if (!Number.isFinite(n)) continue;
          let i = (e as Element).getBoundingClientRect();
          if (!(i.bottom <= r.top)) {
            if (i.top >= r.bottom) {
              if (a !== void 0) break;
              continue;
            }
            a === void 0 && (a = n), o = n;
          }
        }
        if (a === void 0 || o === void 0) {
          n((e: any) => e === void 0 ? e : void 0);
          return;
        }
        let s = clampNumber(a - effectiveOverscan, 0, livePageCount - 1),
          c = clampNumber((o as number) + effectiveOverscan, s, livePageCount - 1);
        n((e: any) => e?.startPageIndex === s && e?.endPageIndex === c ? e : {
          startPageIndex: s,
          endPageIndex: c
        });
      },
      i = () => {
        markPaginationThrottle(), t === null && (t = window.requestAnimationFrame(r));
      },
      a = typeof ResizeObserver == `function` ? new ResizeObserver(() => {
        i();
      }) : void 0;
    return scrollElementIsDocument || a?.observe(resolvedScrollElement), a?.observe(e), scrollElementIsDocument ? window.addEventListener(`scroll`, i, {
      passive: !0
    }) : resolvedScrollElement.addEventListener(`scroll`, i, {
      passive: !0
    }), window.addEventListener(`resize`, i), i(), () => {
      scrollElementIsDocument ? window.removeEventListener(`scroll`, i) : resolvedScrollElement.removeEventListener(`scroll`, i), window.removeEventListener(`resize`, i), a?.disconnect(), t !== null && window.cancelAnimationFrame(t);
    };
  }, [heavyTableDocument, virtualizerActive, virtualItems.length, resolvedScrollElement, scrollElementIsDocument, livePageCount, effectiveOverscan, manualWindowActive, markPaginationThrottle]);

  // 原 滚动节流标记 effect（jsx 28332-28341）
  React.useEffect(() => {
    if (!virtualizerActive || !resolvedScrollElement || typeof window > `u`) return;
    let e = () => {
        markPaginationThrottle();
      },
      t = scrollElementIsDocument ? window : resolvedScrollElement;
    return (t as any).addEventListener(`scroll`, e, {
      passive: !0
    }), () => {
      (t as any).removeEventListener(`scroll`, e);
    };
  }, [virtualizerActive, resolvedScrollElement, scrollElementIsDocument, markPaginationThrottle]);

  // 原 ri（jsx 28338）：合并可见范围（待决范围扩张合并）
  const mergedVisibleRange = React.useMemo(() => pendingVisibleRange ? !virtualVisibleRange || !heavyTableDocument || !(pendingVisibleRange.startPageIndex <= virtualVisibleRange.endPageIndex + 2 && virtualVisibleRange.startPageIndex <= pendingVisibleRange.endPageIndex + 2) ? pendingVisibleRange : {
      startPageIndex: Math.min(pendingVisibleRange.startPageIndex, virtualVisibleRange.startPageIndex),
      endPageIndex: Math.max(pendingVisibleRange.endPageIndex, virtualVisibleRange.endPageIndex)
    } : virtualVisibleRange, [heavyTableDocument, pendingVisibleRange, virtualVisibleRange]);

  // 原 ii（jsx 28343）：生效可见范围（外部 > 合并 > 窗口待决）
  const effectiveVisibleRange = u ?? mergedVisibleRange ?? pendingVisibleRange ?? (windowScrollPending ? {
    startPageIndex: 0,
    endPageIndex: Math.min(livePageCount - 1, Math.max(0, effectiveOverscan))
  } : void 0);

  // 原 ai（jsx 28345）：夹取可见范围
  const clampedVisibleRange = React.useMemo(() => {
    if (livePageCount <= 0) return {
      startPageIndex: 0,
      endPageIndex: -1
    };
    let e = Number(effectiveVisibleRange?.startPageIndex),
      t = Number(effectiveVisibleRange?.endPageIndex),
      n = Number.isFinite(e) ? Math.round(e) : 0,
      r = Number.isFinite(t) ? Math.round(t) : livePageCount - 1,
      i = clampNumber(n, 0, livePageCount - 1);
    return {
      startPageIndex: i,
      endPageIndex: clampNumber(r, i, livePageCount - 1)
    };
  }, [effectiveVisibleRange?.endPageIndex, effectiveVisibleRange?.startPageIndex, livePageCount]);

  // 原 oi..pi（jsx 28362-28368）：渲染窗边界
  const renderWindowStart = externalRangeProvided ? clampedVisibleRange.startPageIndex : 0;
  const initialRenderSpan = heavyTableDocument ? Math.min(2, GUTTER_PADDING_D_PX) : GUTTER_PADDING_D_PX;
  const renderWindowEnd = externalRangeProvided ? clampedVisibleRange.endPageIndex : Math.min(livePageCount - 1, initialRenderSpan - 1);
  const deferredFullWindow = deferredPaintActive && livePageCount > 0 && renderWindowStart === 0 && renderWindowEnd >= livePageCount - 1;
  const firstRenderedPage = deferredFullWindow ? 0 : deferredPaintActive ? renderWindowStart : clampedVisibleRange.startPageIndex;
  const lastRenderedPage = deferredFullWindow ? livePageCount - 1 : deferredPaintActive ? renderWindowEnd : clampedVisibleRange.endPageIndex;

  // 原 mi（jsx 28369）：渲染页索引序列
  const renderedPageIndexes = React.useMemo(() => {
    if (livePageCount <= 0 || lastRenderedPage < firstRenderedPage) return [];
    let e: number[] = [];
    for (let t = firstRenderedPage; t <= lastRenderedPage; t += 1) e.push(t);
    return e;
  }, [livePageCount, lastRenderedPage, firstRenderedPage]);

  // 原 hi（jsx 28375）：页窗前/后占位尺寸
  const pageWindowSpacers = React.useMemo(() => {
    let e = (e: any) => {
        let t = pageSectionInfoByIndex[e]?.layout ?? Hn;
        return O ? t.pageWidthPx + ANNOTATION_GUTTER_BAND_WIDTH_PX : t.pageWidthPx;
      },
      t = (t: any, n: any) => {
        if (livePageCount <= 0 || n < t || t >= livePageCount || n < 0) return {
          heightPx: 0,
          widthPx: 0
        };
        let r = clampNumber(t, 0, livePageCount - 1),
          i = clampNumber(n, r, livePageCount - 1),
          a = 0,
          o = 0;
        for (let t = r; t <= i; t += 1) {
          let n = pageSectionInfoByIndex[t]?.layout ?? Hn;
          a += Math.max(1, Math.round(n.pageHeightPx)), o = Math.max(o, e(t));
        }
        let s = i - r + 1;
        return a += Math.max(0, s - 1) * PAGE_GRID_GAP_PX, {
          heightPx: a,
          widthPx: o
        };
      };
    return {
      before: t(0, firstRenderedPage - 1),
      after: t(lastRenderedPage + 1, livePageCount - 1)
    };
  }, [Hn, livePageCount, pageSectionInfoByIndex, O, lastRenderedPage, firstRenderedPage]);

  // 原 blockId 行高回灌 layoutEffect（jsx 28403-28422）：
  // 部分行段落实测外高（含 margin）→ blockId 覆盖表
  React.useLayoutEffect(() => {
    typeof window > `u` || Date.now() < Mn.current || re((t: any) => {
      let n = new Map<any, number>(t),
        r = !1,
        i = L.current,
        a = resolveZoomScale(i, 1);
      return te.current.forEach((t: any, i: any) => {
        let o = e.model.nodes[i];
        if (o?.type !== `paragraph` || !(o as any).blockId || !t.isConnected || t.dataset.docxParagraphPartialLineRange === `true` || t.closest(`[data-docx-header-footer-region="footer"]`) || t.closest(`[data-docx-header-footer-region="header"]`)) return;
        let s = t.getBoundingClientRect();
        if (s.width <= 0 && s.height <= 0) return;
        let c = window.getComputedStyle(t),
          l = Number.parseFloat(c.marginTop || `0`),
          u = Number.parseFloat(c.marginBottom || `0`),
          d = Math.max(1, Math.round(s.height / a + (Number.isFinite(l) ? l : 0) + (Number.isFinite(u) ? u : 0))),
          f = n.get((o as any).blockId);
        (f === void 0 || Math.abs(f - d) > 1) && (n.set((o as any).blockId, d), r = !0);
      }), r ? n : t;
    });
  }, [e.documentLoadNonce, e.model.nodes, rr, En, resolveZoomScale, lastRenderedPage, firstRenderedPage]);

  /* ---------- 测量回灌面（jsx 28423-28908） ---------- */

  // 原 gi（jsx 28423）：渲染窗内可见表格行索引表
  const visibleTableRowIndexes = React.useMemo(() => {
    let t = new Map<number, Set<number>>(),
      n = (n: any, r: any) => {
        let i = e.model.nodes[n];
        if (!i || i.type !== `table` || r < 0 || r >= (i as any).rows.length) return;
        let a = t.get(n);
        a ? a.add(r) : t.set(n, new Set([r]));
      };
    for (let t of renderedPageIndexes) for (let r of $n[t] ?? []) {
      let t = e.model.nodes[r.nodeIndex];
      if (!(!t || t.type !== `table`)) {
        if (r.tableRowSlice) {
          n(r.nodeIndex, r.tableRowSlice.rowIndex);
          continue;
        }
        if (r.tableRowRange) {
          for (let e = r.tableRowRange.startRowIndex; e < r.tableRowRange.endRowIndex; e += 1) n(r.nodeIndex, e);
          continue;
        }
        for (let e = 0; e < (t as any).rows.length; e += 1) n(r.nodeIndex, e);
      }
    }
    return t;
  }, [e.model.nodes, $n, renderedPageIndexes]);

  // 原 yi（jsx 28447）：测量回灌通行（延迟首绘或待决绘制）
  const measurementPassActive = deferredPaintActive || Pt;

  // 原 bi（jsx 28448）：等待表格测量（页高缺失/行高缺失）
  const awaitingTableMeasurement = React.useMemo(() => {
    if (livePageCount === 0) return !1;
    for (let t of renderedPageIndexes) {
      let n = $n[t] ?? [],
        r = n.some((e: any) => !!e.tableRowSlice);
      if (!Number.isFinite(pt[t]) && !(heavyTableDocument && r)) return !0;
      for (let t of n) {
        let n = e.model.nodes[t.nodeIndex];
        if (!n || n.type !== `table` || t.tableRowSlice) continue;
        let r = (n as any).blockId ? dt[(n as any).blockId]?.rowHeightsPx : void 0;
        if (!r || r.length !== (n as any).rows.length) return !0;
      }
    }
    return !1;
  }, [e.model.nodes, heavyTableDocument, pt, livePageCount, $n, dt, renderedPageIndexes]);

  // 原 xi（jsx 28466）：测量覆盖待决（非延迟首绘且非虚拟化重表格）
  const measurementOverlayPending = !deferredPaintActive && (!heavyTableDocument || !virtualizerActive) && awaitingTableMeasurement;

  // 原 绘制待决标记 effect（jsx 28467-28469）
  React.useEffect(() => {
    measurementOverlayPending && Ft(!0);
  }, [measurementOverlayPending]);

  // 原 绘制待决沉降 effect（jsx 28469-28478）：双 rAF 后清除
  React.useEffect(() => {
    if (deferredPaintActive || !Pt || measurementOverlayPending) return;
    let e = !1,
      t: any = null,
      n = window.requestAnimationFrame(() => {
        t = window.requestAnimationFrame(() => {
          e || Ft(!1);
        });
      });
    return () => {
      e = !0, window.cancelAnimationFrame(n), t !== null && window.cancelAnimationFrame(t);
    };
  }, [deferredPaintActive, Pt, measurementOverlayPending]);

  // 原 页数通告 effect（jsx 28478-28480）
  React.useEffect(() => {
    d && d(virtualizationPageCount);
  }, [d, virtualizationPageCount]);

  // 原 分页信息同步 effect（jsx 28480-28486）
  React.useEffect(() => {
    let t = clampNumber((anchorPageIndex ?? firstRenderedPage) + 1, 1, Math.max(1, virtualizationPageCount));
    e.syncPaginationInfo({
      currentPage: t,
      totalPages: Math.max(1, virtualizationPageCount)
    });
  }, [e.syncPaginationInfo, anchorPageIndex, virtualizationPageCount, firstRenderedPage]);

  // 原 Si（jsx 28488）：逐页批注（修订/评论）按位置排序
  const annotationsByPage = React.useMemo(() => {
    let t = $n.map(() => [] as any[]),
      n = (e: any) => {
        let n = pageIndexForLocation(e.location, $n);
        n < 0 || n >= t.length || t[n].push(e);
      };
    return w && e.trackedChanges.forEach((e: any) => {
      trackedChangeIsAnnotatable(e) && n({
        id: e.id,
        location: e.location,
        trackedChange: e
      });
    }), E && e.comments.forEach((e: any) => {
      n({
        id: e.id,
        location: e.location,
        comment: e
      });
    }), t.forEach((e: any[]) => {
      e.sort((e: any, t: any) => {
        let n = locationSortVector(e.location),
          r = locationSortVector(t.location);
        for (let e = 0; e < n.length; e += 1) if (n[e] !== r[e]) return n[e] - r[e];
        return e.id.localeCompare(t.id);
      });
    }), t;
  }, [E, e.comments, e.trackedChanges, $n, w]);

  // 原 [Ci, wi]/[Ti, Ei]/[Di, Oi]（jsx 28516-28521）：
  // 批注锚点/页眉重叠高/批注卡高 状态面
  const [annotationAnchorPoints, setAnnotationAnchorPoints] = React.useState<any[]>([]);
  const [headerOverlapHeights, setHeaderOverlapHeights] = React.useState<Record<number, number>>({});
  React.useEffect(() => {
    setHeaderOverlapHeights({});
  }, [e.documentLoadNonce]);
  const [annotationCardHeights, setAnnotationCardHeights] = React.useState<any[]>([]);

  // 原 锚点坐标回灌 layoutEffect（jsx 28522-28545）
  React.useLayoutEffect(() => {
    if (!O || annotationsByPage.length === 0) {
      setAnnotationAnchorPoints((e: any) => e.length === 0 ? e : []);
      return;
    }
    setAnnotationAnchorPoints(annotationsByPage.map((e: any, t: any) => {
      let n = le.current.get(t),
        r = new Map<string, { x: number; y: number }>();
      if (!n || e.length === 0) return r;
      let i = Math.max(1, n.offsetHeight),
        a = Math.max(1, n.offsetWidth);
      return e.forEach((e: any) => {
        let t = annotationAnchorElement(n, e);
        if (!t) return;
        let o = annotationAnchorRect(t, n);
        if (!o) return;
        let s = clampNumber(Math.round(o.top + o.height / 2), 10, Math.max(10, i - 10)),
          c = clampNumber(Math.round(o.right), 10, Math.max(10, a - 10));
        r.set(e.id, {
          x: c,
          y: s
        });
      }), r;
    }));
  }, [annotationsByPage, O, lastRenderedPage, firstRenderedPage]);

  // 原 批注卡高回灌 layoutEffect（jsx 28545-28578）
  React.useLayoutEffect(() => {
    if (!O || annotationsByPage.length === 0) {
      setAnnotationCardHeights((e: any) => e.length === 0 ? e : []);
      return;
    }
    let e = L.current,
      t = resolveZoomScale(e, 1),
      n = annotationsByPage.map((e: any, n: any) => {
        let r = new Map<string, number>();
        return e.forEach((e: any) => {
          let i = ue.current.get(`${n}:${e.id}`);
          if (!i) return;
          let a = Math.round(i.getBoundingClientRect().height / t);
          !Number.isFinite(a) || a <= 0 || r.set(e.id, Math.max(ANNOTATION_CARD_MIN_HEIGHT_PX, a));
        }), r;
      });
    setAnnotationCardHeights((e: any) => {
      if (e.length === n.length) {
        let t = !0;
        for (let r = 0; r < n.length && t; r += 1) {
          let i = e[r] ?? new Map(),
            a = n[r] ?? new Map();
          if (i.size !== a.size) {
            t = !1;
            break;
          }
          for (let [e, n] of a) if (i.get(e) !== n) {
            t = !1;
            break;
          }
        }
        if (t) return e;
      }
      return n;
    });
  }, [O, annotationsByPage, lastRenderedPage, firstRenderedPage]);

  // 原 ki（jsx 28580）：批注槽布局（逐页锚点/卡高 → 顶偏移/泳道）
  const gutterAnnotationLayouts = React.useMemo(() => annotationsByPage.map((e: any, t: any) => {
    let n = pageSectionInfoByIndex[t]?.layout ?? Hn;
    return layoutGutterAnnotationsContract(e, annotationAnchorPoints[t] ?? new Map(), annotationCardHeights[t] ?? new Map(), Math.max(1, n.pageWidthPx), Math.max(1, n.pageHeightPx));
  }), [Hn, pageSectionInfoByIndex, annotationAnchorPoints, annotationCardHeights, annotationsByPage]);

  // 原 Ai（jsx 28585）：脚注页码基（声明页数优先）
  const footnotePageNumberBase = React.useMemo(() => {
    if (e.canUndo || e.canRedo) return livePageCount;
    let t = (e.model.metadata as any).documentPageCount;
    return Number.isFinite(t) && t > 0 ? Math.max(1, Math.round(t)) : livePageCount;
  }, [e.canRedo, e.canUndo, e.model.metadata.documentPageCount, livePageCount]);

  // 原 ji（jsx 28588）：页在渲染窗内判定
  const pageInRenderWindow = React.useCallback((e: any) => e >= firstRenderedPage && e <= lastRenderedPage, [lastRenderedPage, firstRenderedPage]);

  // 原 Ni（jsx 28589）：页显现（外部回调优先，否则虚拟化滚动）
  const revealPage = React.useCallback((e: any) => {
    if (f) {
      f(e);
      return;
    }
    if (!virtualizerActive) return;
    let t = clampNumber(Math.round(e), 0, Math.max(1, livePageCount) - 1);
    activeVirtualizer.scrollToIndex(t, {
      align: `center`
    });
  }, [virtualizerActive, activeVirtualizer, f, livePageCount]);

  // 原 Pi（jsx 28600）：书签滚动（元素直滚 / 跨页显现重试）
  const scrollToBookmark = React.useCallback((t: any) => {
    let n = t.trim();
    if (!n) return !1;
    let r = Xn.get(n);
    if (r === void 0) return !1;
    let i = te.current.get(r) ?? G.current.get(r);
    if (i) return i.scrollIntoView({
      behavior: `smooth`,
      block: `center`,
      inline: `nearest`
    }), e.model.nodes[r]?.type === `paragraph` && e.selectParagraph(r), !0;
    let a = firstPageIndexByNodeIndex.get(r);
    if (a === void 0) return !1;
    a >= firstRenderedPage && a <= lastRenderedPage || revealPage(a);
    let o = (e: any = 0) => {
      let t = te.current.get(r) ?? G.current.get(r) ?? le.current.get(a);
      if (t) {
        t.scrollIntoView({
          behavior: `smooth`,
          block: `center`,
          inline: `nearest`
        });
        return;
      }
      e < 6 && window.requestAnimationFrame(() => {
        o(e + 1);
      });
    };
    return window.requestAnimationFrame(() => {
      o();
    }), e.model.nodes[r]?.type === `paragraph` && e.selectParagraph(r), !0;
  }, [Xn, e, e.model.nodes, firstPageIndexByNodeIndex, revealPage, lastRenderedPage, firstRenderedPage]);

  // 原 Fi（jsx 28633）：逐页页眉/页脚节点（偶奇页仲裁 + 边框/特殊段过滤）
  const headerFooterNodesByPage = React.useMemo(() => $n.map((t: any, n: any) => {
    let r = pageSectionInfoByIndex[n],
      i = r?.section.headerSections ?? (e.model.metadata as any).headerSections,
      a = r?.section.footerSections ?? (e.model.metadata as any).footerSections,
      o = r?.section.sectionPropertiesXml ?? e.model.metadata.sectionPropertiesXml,
      s = r?.pageIndexWithinSection ?? n,
      c = (e.model.metadata as any).compatibility?.evenAndOddHeaders === !0,
      l = pickHeaderFooterForPage(i, o, s, {
        evenAndOddHeaders: c
      }),
      u = pickHeaderFooterForPage(a, o, s, {
        evenAndOddHeaders: c
      }),
      d = (e: any) => paragraphBorderVisible(e.style?.borders?.top) || paragraphBorderVisible(e.style?.borders?.right) || paragraphBorderVisible(e.style?.borders?.bottom) || paragraphBorderVisible(e.style?.borders?.left) || paragraphBorderVisible(e.style?.borders?.between) || paragraphBorderVisible(e.style?.borders?.bar),
      f = (e: any) => e.filter((e: any) => e.type === `paragraph` ? paragraphHasDropCap(e) || paragraphIsTextBox(e) || paragraphIsFramed(e) || d(e) : !0);
    return {
      headerPartName: l?.partName,
      footerPartName: u?.partName,
      headerNodes: f(l?.nodes ?? []),
      footerNodes: f(u?.nodes ?? [])
    };
  }), [pageSectionInfoByIndex, $n, e.model.metadata.headerSections, e.model.metadata.footerSections, e.model.metadata.sectionPropertiesXml]);

  // 原 Ii（jsx 28655）：页眉估算高度表
  const estimatedHeaderHeights = React.useMemo(() => {
    let e: Record<number, number> = {};
    for (let t = 0; t < $n.length; t += 1) {
      let n = headerFooterNodesByPage[t]?.headerNodes ?? [];
      if (n.length === 0) continue;
      let r = pageSectionInfoByIndex[t]?.layout ?? Hn,
        i = estimateHeaderHeight([{
          partName: headerFooterNodesByPage[t]?.headerPartName ?? `page-${t}-header`,
          referenceType: `default`,
          nodes: n
        }], r);
      i > 0 && (e[t] = Math.max(0, Math.round(i)));
    }
    return e;
  }, [Hn, headerFooterNodesByPage, $n.length, pageSectionInfoByIndex]);

  // 原 页眉重叠高回灌 layoutEffect（jsx 28671-28715）
  React.useLayoutEffect(() => {
    if (!measurementPassActive) return;
    let e = L.current;
    if (!e || livePageCount === 0) {
      setHeaderOverlapHeights((e: any) => Object.keys(e).length === 0 ? e : {});
      return;
    }
    let t = resolveZoomScale(e, 1),
      n: Record<number, number> = {};
    for (let e = 0; e < livePageCount; e += 1) {
      if (!pageInRenderWindow(e)) continue;
      let r = headerFooterNodesByPage[e]?.headerNodes;
      if (!r || r.length === 0) continue;
      let i = K.current.get(e),
        a = le.current.get(e);
      if (!i || !a) continue;
      let o = pageSectionInfoByIndex[e]?.layout ?? Hn,
        s = a.getBoundingClientRect(),
        c = i.getBoundingClientRect(),
        l = c.bottom,
        u = Math.max(16, Math.min(Math.round(o.pageHeightPx * 0.12), Math.round(o.marginsPx.top + o.headerDistancePx + 24)));
      i.querySelectorAll(`*`).forEach((e: any) => {
        if (!e.isConnected) return;
        let t = e.getBoundingClientRect();
        t.width <= 0 && t.height <= 0 || t.bottom > c.bottom + u + 1 || (l = Math.max(l, t.bottom));
      });
      let d = Math.max(0, (c.bottom - s.top) / t),
        f = Math.max(0, (l - s.top) / t),
        p = Math.max(o.marginsPx.top, f),
        m = Math.max(0, p - d);
      n[e] = clampNumber(Math.round(m), 0, u);
    }
    setHeaderOverlapHeights((e: any) => {
      let t = Object.keys(e).map(e => Number.parseInt(e, 10)),
        r = Object.keys(n).map(e => Number.parseInt(e, 10));
      if (t.length === r.length) {
        let t = !0;
        for (let i of r) if ((e[i] ?? 0) !== (n[i] ?? 0)) {
          t = !1;
          break;
        }
        if (t) return e;
      }
      return n;
    });
  }, [Hn, pageInRenderWindow, measurementPassActive, livePageCount, headerFooterNodesByPage, pageSectionInfoByIndex, resolveZoomScale, lastRenderedPage, firstRenderedPage]);

  // 原 页内容高度测量回灌 effect（jsx 28716-28847）：
  // 逐页页眉/正文/页脚矩形 → 内容高度仲裁 → 页高/身份键/行高合并回灌
  React.useEffect(() => {
    if (Rt) {
      mt((e: any) => e.length === 0 ? e : []), _t((e: any) => e.length === 0 ? e : []), yt((e: any) => e.length === 0 ? e : []);
      return;
    }
    if (!measurementPassActive) return;
    let t = L.current;
    if (!t || livePageCount === 0) {
      mt((e: any) => e.length === 0 ? e : []), _t((e: any) => e.length === 0 ? e : []), yt((e: any) => e.length === 0 ? e : []);
      return;
    }
    if (Date.now() < Mn.current) return;
    let n = resolveZoomScale(t, 1),
      r = rr,
      i = $n.map((e: any, t: any) => {
        let r = pageSectionInfoByIndex[t]?.layout ?? Hn,
          i = Math.max(120, r.pageHeightPx - r.marginsPx.top - r.marginsPx.bottom);
        if (!(t >= firstRenderedPage && t <= lastRenderedPage)) return {
          heightPx: pt?.[t] ?? i,
          bodyOverrunsFooter: !1
        };
        let a = le.current.get(t);
        if (!a) return {
          heightPx: i,
          bodyOverrunsFooter: !1
        };
        let o = K.current.get(t),
          s = se.current.get(t),
          c = ce.current.get(t),
          l = o ? Math.max(0, Math.round(o.getBoundingClientRect().height / n)) : 0,
          u = estimateFooterHeight(headerFooterNodesByPage[t]?.footerNodes ?? [], r),
          d = Number.isFinite(u) ? Math.round(u) : void 0;
        if (c) {
          let e = a.getBoundingClientRect(),
            t = Math.max(16, Math.min(Math.round(r.pageHeightPx * 0.12), Math.round(r.marginsPx.bottom + r.footerDistancePx + 24))),
            i = Math.max(0, r.pageHeightPx - Math.max(0, r.footerDistancePx)),
            o = Number.isFinite(u) ? Math.max(0, Math.min(Math.max(0, i - t), Math.round(u - t))) : Math.max(0, i - t),
            s = 1 / 0;
          if (c.querySelectorAll(`*`).forEach((t: any) => {
            if (!t.isConnected) return;
            let r = t.getBoundingClientRect();
            r.width <= 0 && r.height <= 0 || (r.top - e.top) / n < o - 1 || (s = Math.min(s, r.top));
          }), Number.isFinite(s)) {
            let t = (s - e.top) / n;
            d = Number.isFinite(d) ? Math.min(Math.round(d as number), Math.round(t)) : Math.round(t);
          }
        }
        let f = a.getBoundingClientRect(),
          p = s?.getBoundingClientRect(),
          m = p ? Math.max(0, Math.round((p.top - f.top) / n)) : void 0,
          h = s?.querySelectorAll(`[data-docx-image-location]`).length ?? 0,
          g = s?.textContent?.replace(/\s+/g, ``).length ?? 0,
          _ = h > 0 && g === 0,
          v = s && p ? measureBodyRenderedBottom(Array.from(s.querySelectorAll(`*`)).map((e: any) => {
            let t = e.getBoundingClientRect();
            return {
              bottomPx: t.bottom,
              widthPx: t.width,
              heightPx: t.height,
              ignore: !e.isConnected || !!e.closest(`[data-docx-image-location]`) || !!e.closest(`[${PAGINATION_IGNORE_ATTR}="true"]`)
            };
          })) : void 0,
          y = p && Number.isFinite(v) ? Math.max(0, Math.round(((v as number) - f.top) / n)) : void 0;
        return arbitratePageContentHeight({
          pageLayout: r,
          fallbackHeightPx: i,
          headerHeightPx: l,
          currentMeasuredHeightPx: pt?.[t],
          bodyTopPx: m,
          bodyRenderedBottomPx: y,
          footerTopPx: d,
          skipBodyBottomAdjustment: _
        });
      }),
      a = i.map((e: any) => e.heightPx),
      o = $n.map((t: any, n: any) => {
        if (!(!(n >= firstRenderedPage && n <= lastRenderedPage) || !le.current.get(n))) return pageContentIdentityKey(t, e.model.nodes, Wn);
      }),
      s = i.reduce((e: number[], t: any, n: any) => (t.bodyOverrunsFooter && e.push(n), e), []),
      c = (e.model.metadata as any).documentPageCount,
      l = measurementStabilityArbitration({
        pageCount: livePageCount,
        targetPageCount: Number.isFinite(c) ? Math.max(sectionBreakNodeIndexes(e.model).size + 1, Math.round(c)) : void 0,
        overlappingPageIndexes: s,
        previousSignature: St.current.signature,
        previousConsecutivePasses: St.current.consecutivePasses,
        stabilityThreshold: INITIAL_PAGE_NUMBER
      });
    St.current = {
      signature: l.signature,
      consecutivePasses: l.consecutivePasses
    };
    let u = window.requestAnimationFrame(() => {
      l.shouldLatch && xt(!0), mt((e: any) => {
        let t = mergeMeasuredPageHeights(e, a, {
          currentPageIdentityKeys: gt,
          nextPageIdentityKeys: r
        });
        if (e.length === t.length) {
          let n = !0;
          for (let r = 0; r < t.length; r += 1) if (Math.abs((e[r] ?? 0) - t[r]) > 1) {
            n = !1;
            break;
          }
          if (n) return e;
        }
        return t;
      }), _t((e: any) => {
        if (e.length === r.length) {
          let t = !0;
          for (let n = 0; n < r.length; n += 1) if (e[n] !== r[n]) {
            t = !1;
            break;
          }
          if (t) return e;
        }
        return r;
      }), yt((e: any) => {
        let t = o.map((t: any, n: any) => t ?? e[n]);
        if (e.length === t.length) {
          let n = !0;
          for (let r = 0; r < t.length; r += 1) if (!sameIdentityKeyList(e[r], t[r])) {
            n = !1;
            break;
          }
          if (n) return e;
        }
        return t;
      });
    });
    return () => {
      window.cancelAnimationFrame(u);
    };
  }, [Rt, Hn, e.model.nodes, pt, gt, Wn, measurementPassActive, En, livePageCount, e.model.metadata.documentPageCount, $n, rr, pageSectionInfoByIndex, headerFooterNodesByPage, resolveZoomScale, lastRenderedPage, firstRenderedPage]);

  // 原 分页振荡熔断 effect（jsx 28848-28854）：
  // 延迟首绘下页计数反复变化 → 转导入分页
  React.useEffect(() => {
    if (!a || At || Rt || livePageCount <= 0) return;
    let e = Math.max(1, Math.round(livePageCount)),
      t = Bt.current;
    t.distinctPageCounts.add(e), t.lastPageCount !== void 0 && t.lastPageCount !== e && (t.changeCount += 1), t.lastPageCount = e, !(t.distinctPageCounts.size < GUTTER_CONNECTOR_WIDTH_PX || t.changeCount < GUTTER_CONNECTOR_GAP_PX) && (J.current = void 0, zt(!0), mt([]), yt([]), ft({}));
  }, [a, Rt, At, livePageCount]);

  // 原 分页沉降 effect（jsx 28854-28865）
  React.useEffect(() => {
    if (!a || !At || Mt) return;
    if (typeof window > `u`) {
      Nt(!0);
      return;
    }
    let e = window.setTimeout(() => {
      React.startTransition(() => {
        Nt(!0);
      });
    }, DRAG_SCROLL_ZONE_PX);
    return () => {
      window.clearTimeout(e);
    };
  }, [a, Mt, At]);

  // 原 首绘放行 effect（jsx 28866-28908）：
  // 渲染窗元素齐备 + 签名稳定 + 延迟闩 → 首绘完成
  React.useEffect(() => {
    if (!a || At) return;
    if (livePageCount === 0) {
      jt(!0);
      return;
    }
    if (Date.now() < Mn.current) return;
    let t: number[] = [];
    for (let e = firstRenderedPage; e <= lastRenderedPage; e += 1) t.push(e);
    if (!t.every(e => {
      if (!le.current.get(e) || !se.current.get(e)) return !1;
      let t = headerFooterNodesByPage[e];
      return !((t?.headerNodes.length ?? 0) > 0 && !K.current.get(e) || (t?.footerNodes.length ?? 0) > 0 && !ce.current.get(e));
    })) return;
    let n = `${livePageCount}::${t.map(e => ($n[e] ?? []).map((e: any) => {
      let t = e.tableRowRange ? `${e.tableRowRange.startRowIndex}-${e.tableRowRange.endRowIndex}` : `none`,
        n = e.tableRowSlice ? `${Math.max(0, Math.round(e.tableRowSlice.rowIndex))}:${Math.max(0, Math.round(e.tableRowSlice.startOffsetPx))}:${Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(e.tableRowSlice.sliceHeightPx))}` : `none`,
        r = e.paragraphLineRange ? `${e.paragraphLineRange.startLineIndex}-${e.paragraphLineRange.endLineIndex}` : `none`;
      return `${e.nodeIndex}:${t}:${n}:${r}`;
    }).join(`,`)).join(`|`)}::${t.map(e => `${Math.round(pt[e] ?? 0)}:${headerOverlapHeights[e] ?? 0}`).join(`|`)}::${t.map(t => ($n[t] ?? []).filter((t: any) => e.model.nodes[t.nodeIndex]?.type === `table`).map((t: any) => {
      let n = e.model.nodes[t.nodeIndex],
        r = ((n as any)?.blockId ? dt[(n as any).blockId]?.rowHeightsPx : void 0) ?? [];
      return `${t.nodeIndex}:${r.join(`,`)}`;
    }).join(`;`)).join(`|`)}`;
    J.current = n, de.current !== null && typeof window < `u` && typeof window.cancelAnimationFrame == `function` && window.cancelAnimationFrame(de.current);
    let r = !1,
      i: any = null;
    return (() => {
      if (typeof window > `u` || typeof window.requestAnimationFrame != `function`) {
        jt(!0);
        return;
      }
      i = window.setTimeout(() => {
        i = null, de.current = window.requestAnimationFrame(() => {
          r || Date.now() < Mn.current || J.current === n && (de.current = null, jt(!0));
        });
      }, INITIAL_PAINT_DELAY_MS);
    })(), () => {
      r = !0, i !== null && typeof window < `u` && window.clearTimeout(i), de.current !== null && typeof window < `u` && typeof window.cancelAnimationFrame == `function` && window.cancelAnimationFrame(de.current), de.current = null;
    };
  }, [a, e.model.nodes, headerOverlapHeights, At, pt, livePageCount, headerFooterNodesByPage, $n, En, dt, lastRenderedPage, firstRenderedPage]);

  /* ---------- 表格选区/指针面（jsx 28909-29062） ---------- */

  // 原 Li（jsx 28909）：表格选区锚点设置（单格起步）
  const setTableSelectionAnchor = React.useCallback((e: any, t: any, n: any) => {
    let r = {
      tableIndex: e,
      anchorRowIndex: t,
      anchorCellIndex: n,
      focusRowIndex: t,
      focusCellIndex: n
    };
    dn((e: any) => sameTableSelection(e, r) ? e : r);
  }, []);

  // 原 Ri（jsx 28919）：表格选区清除
  const clearTableSelection = React.useCallback(() => {
    dn((e: any) => e && void 0);
  }, []);

  // 原 zi（jsx 28921）：表格命中判定（含命中外扩）
  const tableHitTest = React.useCallback((e: any, t: any, n: any) => {
    let r = G.current.get(e);
    if (!r || !r.isConnected) return !1;
    let i = r.getBoundingClientRect();
    return i.width <= 0 || i.height <= 0 ? !1 : t >= i.left - TABLE_RESIZE_HIT_PX && t <= i.right + TABLE_RESIZE_HIT_PX && n >= i.top - TABLE_RESIZE_HIT_PX && n <= i.bottom + TABLE_RESIZE_HIT_PX;
  }, []);

  // 原 Bi（jsx 28928）：最近表格命中（距离最小）
  const nearestTableAtPoint = React.useCallback((e: any, t: any) => {
    let n,
      r = 1 / 0;
    return G.current.forEach((i: any, a: any) => {
      if (!i || !i.isConnected) return;
      let o = i.getBoundingClientRect();
      if (o.width <= 0 || o.height <= 0 || e < o.left - TABLE_RESIZE_HIT_PX || e > o.right + TABLE_RESIZE_HIT_PX || t < o.top - TABLE_RESIZE_HIT_PX || t > o.bottom + TABLE_RESIZE_HIT_PX) return;
      let s = e < o.left ? o.left - e : e > o.right ? e - o.right : 0,
        c = t < o.top ? o.top - t : t > o.bottom ? t - o.bottom : 0,
        l = Math.hypot(s, c);
      l < r && (r = l, n = a);
    }), n;
  }, []);

  // 原 Vi（jsx 28940）：指针移动捕获（表格悬停跟踪）
  const handlePointerMoveCapture = React.useCallback((e: any) => {
    if (k || cn.current) return;
    let t = nearestTableAtPoint(e.clientX, e.clientY);
    Qt((e: any) => e === t ? e : t);
  }, [k, nearestTableAtPoint]);

  // 原 Hi（jsx 28946）：指针离开（清除表格悬停）
  const handlePointerLeave = React.useCallback(() => {
    k || cn.current || Qt(void 0);
  }, [k]);

  // 原 Ui（jsx 28948）：整表选择
  const selectWholeTable = React.useCallback((t: any) => {
    let n = e.model.nodes[t];
    if (!n || n.type !== `table`) return;
    let r = tableFirstLastCell(n as DocxTableNode);
    r && (dn({
      tableIndex: t,
      anchorRowIndex: r.first.rowIndex,
      anchorCellIndex: r.first.cellIndex,
      focusRowIndex: r.last.rowIndex,
      focusCellIndex: r.last.cellIndex
    }), e.selectTableCell(t, r.first.rowIndex, r.first.cellIndex), e.setActiveTextRange(void 0));
  }, [e]);

  // 原 Wi（jsx 28959）：表格拖放目标计算（按中点分界）
  const computeTableDropTarget = React.useCallback((t: any, n: any) => {
    let r = L.current;
    if (!r) return;
    let i = new Map<number, HTMLElement>();
    te.current.forEach((e: any, t: any) => {
      e.isConnected && i.set(t, e);
    }), G.current.forEach((e: any, t: any) => {
      e.isConnected && i.set(t, e);
    });
    let a = Array.from(i.entries()).map(([e, t]) => ({
      nodeIndex: e,
      rect: (t as HTMLElement).getBoundingClientRect()
    })).filter(e => e.rect.height > 0 && e.rect.width > 0).sort((e, t) => e.nodeIndex - t.nodeIndex);
    if (a.length === 0) return;
    let o = r.getBoundingClientRect(),
      s = a[a.length - 1].nodeIndex + 1,
      c = a[a.length - 1].rect.bottom - o.top,
      l = a[a.length - 1].rect.left - o.left,
      u = a[a.length - 1].rect.width;
    for (let e of a) {
      let t = e.rect.top + e.rect.height / 2;
      if (n.y < t) {
        s = e.nodeIndex, c = e.rect.top - o.top, l = e.rect.left - o.left, u = e.rect.width;
        break;
      }
    }
    if (Number.isFinite(s)) return {
      targetNodeIndex: clampNumber(s, 0, Math.max(0, e.model.nodes.length)),
      preview: {
        top: Math.max(0, Math.round(c)),
        left: Math.max(0, Math.round(l)),
        width: Math.max(0, Math.round(u))
      }
    };
  }, [e.model.nodes.length]);

  // 原 Gi（jsx 28996）：表格拖动（浮动位移/落点重排）
  const beginTableMove = React.useCallback((t: any, n: any) => {
    if (k || t.button !== 0 && t.button !== void 0) return;
    t.preventDefault(), t.stopPropagation(), selectWholeTable(n), Qt(n), cn.current = {
      pointerId: t.pointerId,
      tableIndex: n,
      startX: t.clientX,
      startY: t.clientY,
      hasMoved: !1
    };
    let r = resolveZoomScale(L.current, 1),
      i = G.current.get(n),
      a = i?.getBoundingClientRect(),
      o = i?.closest(`[data-docx-floating-table-host]`)?.getBoundingClientRect(),
      s = (e: any) => {
        let t = cn.current;
        if (!t || e.pointerId !== t.pointerId) return;
        let n = e.clientX - t.startX,
          i = e.clientY - t.startY;
        !t.hasMoved && Math.abs(n) + Math.abs(i) < TABLE_HANDLE_BORDER_PX || (t.hasMoved = !0, hn({
          tableIndex: t.tableIndex,
          deltaX: unscaleDelta(n, r),
          deltaY: unscaleDelta(i, r)
        }), e.preventDefault());
      },
      c = (t: any) => {
        let n = cn.current;
        if (!n || t.pointerId !== n.pointerId) return;
        window.removeEventListener(`pointermove`, s), window.removeEventListener(`pointerup`, c), window.removeEventListener(`pointercancel`, c), cn.current = void 0;
        let i = document.elementFromPoint(t.clientX, t.clientY),
          l = G.current.get(n.tableIndex);
        if (Qt(i && l?.contains(i) ? n.tableIndex : void 0), hn(void 0), !n.hasMoved || !a) return;
        let u = unscaleDelta(t.clientX - n.startX, r),
          d = unscaleDelta(t.clientY - n.startY, r),
          f = e.model.nodes[n.tableIndex];
        if (!f || f.type !== `table`) return;
        let p = (f as any).style?.floating,
          m = o ? (a.left - o.left) / r : twipsToPx((f as any).style?.indentTwips) ?? 0,
          h = o ? (a.top - o.top) / r : 0,
          g = computeTableDropTarget(n.tableIndex, {
            x: t.clientX,
            y: t.clientY
          }),
          _ = L.current?.getBoundingClientRect(),
          v = g !== void 0 && _ !== void 0 && g.targetNodeIndex !== n.tableIndex && g.targetNodeIndex !== n.tableIndex + 1,
          y = h + d;
        if (v && g && _) {
          let e = _.top + g.preview.top;
          !o && g.targetNodeIndex > n.tableIndex && (e -= a.height), y = (a.top + (t.clientY - n.startY) - e) / r;
        }
        y = Math.max(0, y), e.setTableFloating(n.tableIndex, {
          xTwips: pxToTwips(m + u),
          yTwips: pxToTwips(y),
          horizontalAnchor: `margin`,
          verticalAnchor: `text`,
          horizontalAlign: void 0,
          verticalAlign: void 0,
          leftFromTextTwips: p?.leftFromTextTwips ?? 187,
          rightFromTextTwips: p?.rightFromTextTwips ?? 187,
          topFromTextTwips: p?.topFromTextTwips ?? 0,
          bottomFromTextTwips: p?.bottomFromTextTwips ?? 0
        }, v && g ? {
          moveToNodeIndex: g.targetNodeIndex
        } : void 0);
      };
    window.addEventListener(`pointermove`, s), window.addEventListener(`pointerup`, c, {
      once: !0
    }), window.addEventListener(`pointercancel`, c, {
      once: !0
    });
  }, [e, k, computeTableDropTarget, selectWholeTable]);

  /* ---------- 右键菜单状态面（jsx 29063-29161） ---------- */

  // 原 Ki（jsx 29063）：表格右键菜单关闭
  const closeTableContextMenu = React.useCallback(() => {
    _n(void 0);
  }, []);

  // 原 qi（jsx 29066）：通用右键菜单关闭
  const closeContextMenu = React.useCallback(() => {
    yn(void 0);
  }, []);

  // 原 Ji（jsx 29069）：文本右键菜单打开
  const openTextContextMenu = React.useCallback((e: any, t: any) => {
    _n(void 0), yn({
      ...e,
      clientX: t.x,
      clientY: t.y
    });
  }, []);

  // 原 Yi（jsx 29077）：表格右键菜单打开
  const openTableContextMenu = React.useCallback((e: any, t: any) => {
    yn(void 0), _n({
      ...e,
      clientX: t.x,
      clientY: t.y
    });
  }, []);

  // 原 Xi（jsx 29084）：表格动作分派（行/列插入删除）
  const runTableAction = React.useCallback((t: any, n: any) => {
    let r = n ?? gn;
    if (r) {
      switch (t) {
        case `insert-row-above`:
          e.insertTableRow(r.tableIndex, r.rowIndex, `above`);
          break;
        case `insert-row-below`:
          e.insertTableRow(r.tableIndex, r.rowIndex, `below`);
          break;
        case `insert-column-left`:
          e.insertTableColumn(r.tableIndex, r.cellIndex, `left`, r.rowIndex);
          break;
        case `insert-column-right`:
          e.insertTableColumn(r.tableIndex, r.cellIndex, `right`, r.rowIndex);
          break;
        case `delete-row`:
          e.deleteTableRow(r.tableIndex, r.rowIndex);
          break;
        case `delete-column`:
          e.deleteTableColumn(r.tableIndex, r.cellIndex, r.rowIndex);
          break;
        case `delete-table`:
          e.deleteTable(r.tableIndex);
          break;
        default:
          break;
      }
      closeTableContextMenu();
    }
  }, [closeTableContextMenu, e, gn]);

  // 原 Zi（jsx 29114）：表格右键菜单动作表
  const tableContextMenuActions = React.useMemo(() => [...TABLE_CONTEXT_MENU_ACTIONS_SOURCE], []);

  // 原 Qi（jsx 29115）：表格菜单单元格解析（选区优先）
  const resolveTableMenuCell = React.useCallback((t: any, n: any = 0, r: any = 0) => {
    let i = e.model.nodes[t];
    if (!i || i.type !== `table`) return {
      tableIndex: t,
      rowIndex: Math.max(0, n),
      cellIndex: Math.max(0, r)
    };
    let a = e.selection,
      o = clampNumber((a as any).kind === `table-cell` && (a as any).tableIndex === t ? (a as any).rowIndex : n, 0, Math.max(0, (i as any).rows.length - 1)),
      s = (i as any).rows[o];
    return {
      tableIndex: t,
      rowIndex: o,
      cellIndex: clampNumber((a as any).kind === `table-cell` && (a as any).tableIndex === t ? (a as any).cellIndex : r, 0, Math.max(0, (s?.cells.length ?? 1) - 1))
    };
  }, [e.model.nodes, e.selection]);

  // 原 右键菜单外部关闭 effect（jsx 29133-29145）
  React.useEffect(() => {
    if (!gn && !vn) return;
    let e = (e: any) => {
        let t = e.target;
        t instanceof Element && t.closest(`[data-docx-table-context-menu='true'],[data-docx-context-menu='true']`) || (_n(void 0), yn(void 0));
      },
      t = (e: any) => {
        e.key === `Escape` && (e.preventDefault(), _n(void 0), yn(void 0));
      };
    return window.addEventListener(`pointerdown`, e, !0), window.addEventListener(`keydown`, t, !0), () => {
      window.removeEventListener(`pointerdown`, e, !0), window.removeEventListener(`keydown`, t, !0);
    };
  }, [vn, gn]);

  // 原 选区/菜单失效守卫 effects（jsx 29146-29164）
  React.useEffect(() => {
    if (!un) return;
    let t = e.model.nodes[un.tableIndex];
    (!t || t.type !== `table`) && dn(void 0);
  }, [e.model.nodes, un]);
  React.useEffect(() => {
    if (!gn) return;
    let t = e.model.nodes[gn.tableIndex];
    (!t || t.type !== `table`) && _n(void 0);
  }, [e.model.nodes, gn]);
  React.useEffect(() => {
    if (!vn || vn.kind !== `image`) return;
    let t = vn.image?.location;
    if (!t) {
      yn(void 0);
      return;
    }
    let {
      paragraph: n
    } = resolveLocationContract(e.model, paragraphLocationOfImage(t));
    let r = (n as any)?.children[t.childIndex];
    (!r || r.type !== `image`) && yn(void 0);
  }, [vn, e.model]);

  /* ---------- DOM 选区助手面（jsx 29166-29313） ---------- */

  // 原 $i（jsx 29166）：宿主内光标放置（点命中 + 8 向探测 + 最近文本回退）
  const placeCaretInHost = React.useCallback((e: any, t?: any) => {
    let n = window.getSelection();
    if (!n) return;
    let r = () => {
        let t = document.createRange();
        t.selectNodeContents(e), t.collapse(!0), n.removeAllRanges(), n.addRange(t);
      },
      i = () => {
        let t = document.createRange();
        t.selectNodeContents(e), t.collapse(!1), n.removeAllRanges(), n.addRange(t);
      };
    if (!t) {
      i();
      return;
    }
    let a = document as any,
      o = (e: any, t: any) => {
        let n;
        if (typeof a.caretPositionFromPoint == `function`) {
          let r = a.caretPositionFromPoint(e, t);
          r && (n = document.createRange(), n.setStart(r.offsetNode, r.offset), n.collapse(!0));
        } else if (typeof a.caretRangeFromPoint == `function`) {
          let r = a.caretRangeFromPoint(e, t);
          r && (n = r, n.collapse(!0));
        }
        return n;
      },
      s = (t: any, n: any) => {
        let r = document.createTreeWalker(e, NodeFilter.SHOW_TEXT),
          i = document.createRange(),
          a = document.createRange(),
          o,
          s = 1 / 0,
          c = r.nextNode();
        for (; c;) {
          if (c instanceof Text && c.parentElement?.closest(`[data-docx-numbering-label='true']`)) {
            c = r.nextNode();
            continue;
          }
          if (!(c instanceof Text)) {
            c = r.nextNode();
            continue;
          }
          let e = c.textContent?.length ?? 0;
          for (let r = 0; r <= e; r += 1) {
            try {
              i.setStart(c, r), i.collapse(!0);
            } catch {
              continue;
            }
            let l = 0,
              u = 0,
              d = 0;
            if (e > 0) {
              let t = Math.max(0, Math.min(e - 1, r === e ? r - 1 : r)),
                n = Math.min(e, t + 1);
              if (n <= t) continue;
              let i;
              try {
                a.setStart(c, t), a.setEnd(c, n), i = a.getBoundingClientRect();
              } catch {
                continue;
              }
              if (i.width === 0 && i.height === 0) continue;
              l = r === e ? i.right : i.left, u = i.top, d = i.bottom;
            } else {
              let e = i.getBoundingClientRect();
              if (e.width === 0 && e.height === 0) continue;
              l = e.left, u = e.top, d = e.bottom;
            }
            let f = Math.abs(t - l),
              p = n < u ? u - n : n > d ? n - d : 0,
              m = f * f + p * p;
            m < s && (s = m, o = i.cloneRange());
          }
          c = r.nextNode();
        }
        return o;
      },
      c = o(t.x, t.y),
      l = e.getBoundingClientRect();
    if (c && c.startContainer === e) for (let n = 1; n <= 36; n += 1) {
      let r = [o(t.x + n, t.y), o(t.x - n, t.y), o(t.x, t.y + n), o(t.x, t.y - n), o(t.x + n, t.y + n), o(t.x - n, t.y - n), o(t.x + n, t.y - n), o(t.x - n, t.y + n)].find(t => t && e.contains(t.startContainer) && t.startContainer !== e);
      if (r) {
        c = r;
        break;
      }
    }
    let u = !!(c && c.collapsed && t.x > l.left + 12 && (c.startContainer === e && c.startOffset === 0 || c.startContainer instanceof Text && c.startOffset === 0));
    if (!c || !e.contains(c.startContainer) || c.startContainer === e || u) {
      let n = s(t.x, t.y);
      n && e.contains(n.startContainer) && (c = n);
    }
    if (!c || !e.contains(c.startContainer)) {
      t.x <= l.left + 12 ? r() : i();
      return;
    }
    if (c.startContainer === e) {
      t.x <= l.left + 12 ? r() : i();
      return;
    }
    n.removeAllRanges(), n.addRange(c);
  }, []);

  // 原 节区草稿光标恢复 effect（jsx 29269-29275）
  React.useEffect(() => {
    pe.current && window.requestAnimationFrame(() => {
      let e = pe.current;
      if (!e) return;
      let t = oe.current.get(e.draftKey);
      t && (t.focus(), placeCaretInHost(t, e.point), pe.current = void 0);
    });
  }, [bn, placeCaretInHost]);

  // 原 ea（jsx 29276）：元素内文本范围设置（文本节点遍历定位）
  const setTextRangeInElement = React.useCallback((e: any, t: any, n: any) => {
    let r = window.getSelection();
    if (!r) return;
    let i = (e: any, t: any) => {
      let n = Math.max(0, Math.round(t)),
        r = document.createTreeWalker(e, NodeFilter.SHOW_TEXT),
        i = 0,
        a = r.nextNode();
      for (; a;) {
        if (a instanceof Text && a.parentElement?.closest(`[data-docx-numbering-label='true']`)) {
          a = r.nextNode();
          continue;
        }
        let e = a.textContent?.length ?? 0;
        if (i + e >= n) return {
          node: a,
          offset: Math.max(0, n - i)
        };
        i += e, a = r.nextNode();
      }
      return {
        node: e,
        offset: e.childNodes.length
      };
    };
    try {
      let a = document.createRange(),
        o = Math.max(0, Math.min(t, n)),
        s = Math.max(o, Math.max(t, n)),
        c = i(e, o),
        l = i(e, s);
      a.setStart(c.node, c.offset), a.setEnd(l.node, l.offset), r.removeAllRanges(), r.addRange(a);
    } catch {
      placeCaretInHost(e);
    }
  }, [placeCaretInHost]);

  // 原 ta（jsx 29310）：元素文本长度（剔除编号标签）
  const textLengthOfElement = React.useCallback((e: any) => {
    let t = document.createRange();
    return t.selectNodeContents(e), rangePlainTextLength(t);
  }, []);

  // 原 na（jsx 29313）：部分行选区登记（真子范围才保留）
  const recordPartialLineSelection = React.useCallback((e: any, t: any, n: any) => {
    if (!partialLineRangeIsProper(t)) {
      U.current = void 0, Tt((t: any) => t?.nodeIndex === e ? void 0 : t);
      return;
    }
    let r = t,
      i = {
        nodeIndex: e,
        startLineIndex: r.startLineIndex,
        endLineIndex: r.endLineIndex
      };
    U.current = {
      ...i,
      ...(n ? {
        point: n
      } : void 0)
    }, Tt((t: any) => samePartialLineSelection(t, e, r) ? t : i);
  }, []);

  // 原 ra（jsx 29332）：位置 → 宿主元素解析（草稿宿主优先）
  const resolveLocationHostElement = React.useCallback((e: any) => {
    if (e.kind === `paragraph`) {
      let t = kt.current.get(locationKeyContract({
        kind: `paragraph`,
        nodeIndex: e.nodeIndex
      } as DocxLocation));
      if (t?.element.isConnected) return t.element;
      let n = te.current.get(e.nodeIndex);
      if (n?.isConnected) return n;
      let r = Array.from(L.current?.querySelectorAll(`[data-docx-paragraph-kind="paragraph"][data-docx-paragraph-node-index="${e.nodeIndex}"]`) ?? []);
      return (r as HTMLElement[]).find(e => e.isContentEditable) ?? r[0] ?? void 0;
    }
    if (L.current) return L.current.querySelector(`[data-docx-paragraph-kind="table-cell"][data-docx-table-index="${e.tableIndex}"][data-docx-row-index="${e.rowIndex}"][data-docx-cell-index="${e.cellIndex}"][data-docx-paragraph-index="${e.paragraphIndex}"]`) ?? void 0;
  }, [te]);

  // 原 ia（jsx 29348）：文本偏移 → 文本节点/偏移定位
  const textNodeAtOffset = React.useCallback((e: any, t: any) => {
    let n = Math.max(0, Math.round(t)),
      r = document.createTreeWalker(e, NodeFilter.SHOW_TEXT),
      i = 0,
      a = r.nextNode();
    for (; a;) {
      if (a instanceof Text && a.parentElement?.closest(`[data-docx-numbering-label='true']`)) {
        a = r.nextNode();
        continue;
      }
      let e = a.textContent?.length ?? 0;
      if (i + e >= n) return {
        node: a,
        offset: Math.max(0, n - i)
      };
      i += e, a = r.nextNode();
    }
    return {
      node: e,
      offset: e.childNodes.length
    };
  }, []);

  // 原 aa（jsx 29371）：段落宿主按行命中（多宿主矩形判定）
  const paragraphHostAtOffset = React.useCallback((e: any, t: any) => {
    let n = L.current,
      r = te.current.get(e),
      i = Array.from(n?.querySelectorAll(`[data-docx-paragraph-kind="paragraph"][data-docx-paragraph-node-index="${e}"]`) ?? []),
      a = [...(r ? [r] : []), ...i].filter((e, t, n) => (e as HTMLElement).isConnected && n.indexOf(e) === t),
      o = Math.max(0, Math.round(t));
    for (let e of a) try {
      let t = textNodeAtOffset(e, o),
        n = document.createRange();
      n.setStart(t.node, t.offset), n.setEnd(t.node, t.offset);
      let r = n.getClientRects().item(0) ?? n.getBoundingClientRect(),
        i = (e as HTMLElement).getBoundingClientRect();
      if (Number.isFinite(r.top) && Number.isFinite(r.bottom) && Number.isFinite(i.top) && Number.isFinite(i.bottom) && r.bottom >= i.top - 1 && r.top <= i.bottom + 1) return e;
    } catch {
      continue;
    }
    return (a as HTMLElement[]).find(e => e.isContentEditable) ?? a[0] ?? void 0;
  }, [textNodeAtOffset]);

  // 原 oa（jsx 29389）：边界 → DOM 文本点
  const boundaryToDomPoint = React.useCallback((e: any) => {
    let t = e.location,
      n = resolveLocationHostElement(t);
    if (!n) return;
    let r = textLengthOfElement(n);
    return textNodeAtOffset(n, Math.max(0, Math.min(e.offset, r)));
  }, [resolveLocationHostElement, textNodeAtOffset, textLengthOfElement]);

  // 原 sa（jsx 29395）：DOM 选区应用（方向保持 + 回退折叠）
  const applyDomSelection = React.useCallback((t: any, n: any) => {
    let r = window.getSelection();
    if (!r) return;
    let i = normalizeTextRange({
        start: {
          location: cloneLocationContract(t.location),
          offset: t.offset
        },
        end: {
          location: cloneLocationContract(n.location),
          offset: n.offset
        }
      }),
      a = boundaryToDomPoint(t),
      o = boundaryToDomPoint(n);
    if (!a || !o) {
      let t = resolveLocationHostElement(i.start.location) ?? resolveLocationHostElement(i.end.location);
      if (!t) {
        e.setActiveTextRange(void 0);
        return;
      }
      let n = textNodeAtOffset(t, i.start.offset),
        a = document.createRange();
      a.setStart(n.node, n.offset), a.collapse(!0), r.removeAllRanges(), r.addRange(a), e.setActiveTextRange({
        start: {
          location: cloneLocationContract(i.start.location),
          offset: i.start.offset
        },
        end: {
          location: cloneLocationContract(i.start.location),
          offset: i.start.offset
        }
      });
      return;
    }
    try {
      let s = compareTextPositions(t, n) <= 0,
        c = s ? a : o,
        l = s ? o : a;
      if (!(r.anchorNode === a.node && r.anchorOffset === a.offset && r.focusNode === o.node && r.focusOffset === o.offset)) if (typeof r.setBaseAndExtent == `function`) r.setBaseAndExtent(a.node, a.offset, o.node, o.offset);else {
        let e = document.createRange();
        e.setStart(c.node, c.offset), e.setEnd(l.node, l.offset), r.removeAllRanges(), r.addRange(e);
      }
      e.setActiveTextRange(i);
    } catch {
      let t = resolveLocationHostElement(i.start.location);
      if (!t) {
        e.setActiveTextRange(void 0);
        return;
      }
      placeCaretInHost(t), e.setActiveTextRange({
        start: {
          location: cloneLocationContract(i.start.location),
          offset: i.start.offset
        },
        end: {
          location: cloneLocationContract(i.start.location),
          offset: i.start.offset
        }
      });
    }
  }, [e, boundaryToDomPoint, textNodeAtOffset, resolveLocationHostElement, placeCaretInHost]);

  // 原 ca（jsx 29455）：编辑后选区恢复（帧令牌重试）
  const restoreSelectionAfterEdit = React.useCallback((t: any) => {
    let n = In();
    e.beginSelectionSession(`command` as any, {
      settleAfterMs: 140
    });
    let r = normalizeTextRange({
      start: {
        location: cloneLocationContract(t.start.location),
        offset: t.start.offset
      },
      end: {
        location: cloneLocationContract(t.end.location),
        offset: t.end.offset
      }
    });
    ye.current = {
      range: {
        start: {
          location: cloneLocationContract(r.start.location),
          offset: r.start.offset
        },
        end: {
          location: cloneLocationContract(r.end.location),
          offset: r.end.offset
        }
      },
      expiresAt: Date.now() + 500
    };
    let i = compareTextPositions(r.start, r.end) === 0;
    r.start.location.kind === `paragraph` && r.end.location.kind === `paragraph` && r.start.location.nodeIndex === r.end.location.nodeIndex ? ve.current = {
      nodeIndex: r.start.location.nodeIndex,
      start: Math.max(0, Math.round(r.start.offset)),
      end: Math.max(0, Math.round(r.end.offset))
    } : ve.current = null;
    let a = (e: any) => {
      if (Ln(n)) {
        if (i) {
          e === 0 && window.getSelection()?.removeAllRanges(), applyDomSelection(r.start, r.start);
          let t = window.getSelection(),
            i = !!(t && t.rangeCount > 0 && t.isCollapsed);
          (e === 0 || !i && e < 4) && (i || t?.removeAllRanges(), Rn(n, () => {
            a(e + 1);
          }));
          return;
        }
        applyDomSelection(r.start, r.end), e === 0 && Rn(n, () => {
          applyDomSelection(r.start, r.end);
        });
      }
    };
    a(0);
  }, [In, e, Ln, Rn, applyDomSelection]);

  // 原 la（jsx 29510）：包裹段落命中（版式点 → 偏移）
  const wrappedParagraphHit = React.useCallback((e: any) => {
    let t = document.elementFromPoint(e.x, e.y);
    if (!(t instanceof Element)) return;
    let n = t.closest(`[data-docx-wrapped-paragraph-root='true'][data-docx-wrapped-paragraph-location-key]`);
    if (!n) return;
    let r = n.getAttribute(`data-docx-wrapped-paragraph-location-key`);
    if (!r) return;
    let i = kt.current.get(r);
    if (!i || !i.element.isConnected) return;
    let a = i.element.getBoundingClientRect(),
      o = clampNumber(wrappedLayoutHitOffset(i.layout, e.x - a.left, e.y - a.top), 0, i.textLength);
    return {
      location: cloneLocationContract(i.location),
      offset: o
    };
  }, []);

  // 原 ua（jsx 29523）：全选内容（首尾宿主范围）
  const selectAllContent = React.useCallback(() => {
    let e = L.current;
    if (!e) return;
    clearTableSelection();
    let t = Array.from(e.querySelectorAll(`[data-docx-paragraph-host='true'],[data-docx-wrapped-paragraph-root='true'][data-docx-wrapped-paragraph-location-key]`)) as Element[];
    if (t.length === 0) return;
    let n = t[0],
      r = t[t.length - 1],
      i = parseParagraphDomLocation(n),
      a = parseParagraphDomLocation(r);
    !i || !a || applyDomSelection({
      location: i,
      offset: 0
    }, {
      location: a,
      offset: textLengthOfElement(r)
    });
  }, [clearTableSelection, textLengthOfElement, applyDomSelection]);

  // 原 da（jsx 29540）：DOM 点 → 边界（段落宿主/包裹宿主）
  const domPointToBoundary = React.useCallback((e: any, t: any) => {
    if (!e) return;
    let n = e instanceof Element ? e : e.parentElement,
      r = n?.closest(`[data-docx-paragraph-kind]`);
    if (!r) {
      let r = n?.closest(`[data-docx-wrapped-paragraph-root='true'][data-docx-wrapped-paragraph-location-key]`);
      if (!r) return;
      let i = r.getAttribute(`data-docx-wrapped-paragraph-location-key`);
      if (!i) return;
      let a = kt.current.get(i);
      if (!a || !a.element.contains(e)) return;
      try {
        let n = document.createRange();
        n.setStart(a.element, 0);
        let r = Math.max(0, Number.isFinite(t) ? Math.round(t) : 0);
        n.setEnd(e, r);
        let i = rangePlainTextLength(n);
        return {
          location: cloneLocationContract(a.location),
          offset: clampNumber(Math.round(i), 0, a.textLength)
        };
      } catch {
        return;
      }
    }
    let i = parseParagraphDomLocation(r);
    if (i) try {
      let n = document.createRange();
      n.setStart(r, 0);
      let a = Math.max(0, Number.isFinite(t) ? Math.round(t) : 0);
      n.setEnd(e, a);
      let o = rangePlainTextLength(n);
      return {
        location: i,
        offset: Math.max(0, Math.round(o))
      };
    } catch {
      return;
    }
  }, []);

  // 原 fa（jsx 29583）：点 → 边界（命中/宿主回退/单元格多段/页间插值）
  const boundaryAtPoint = React.useCallback((e: any, t?: any) => {
    let n = wrappedParagraphHit(e);
    if (n) return n;
    let r = document as any,
      i = (e: any) => {
        let t = null,
          n = 0;
        if (typeof r.caretPositionFromPoint == `function`) {
          let i = r.caretPositionFromPoint(e.x, e.y);
          i && (t = i.offsetNode, n = i.offset);
        } else if (typeof r.caretRangeFromPoint == `function`) {
          let i = r.caretRangeFromPoint(e.x, e.y);
          i && (t = i.startContainer, n = i.startOffset);
        }
        if (t) return domPointToBoundary(t, n);
      },
      a = (e: any, t: any) => {
        let n = parseParagraphDomLocation(t);
        return n ? sameLocationContract(e.location, n) : !1;
      },
      o = (t: any) => {
        let n = t.getBoundingClientRect();
        return {
          x: n.width > 2 ? clampNumber(e.x, n.left + 1, n.right - 1) : n.left + n.width / 2,
          y: n.height > 2 ? clampNumber(e.y, n.top + 1, n.bottom - 1) : n.top + n.height / 2
        };
      },
      s = i(e);
    if (s) {
      if (!t) return s;
      let n = resolveLocationHostElement(s.location);
      if (!n) return s;
      let r = n.getBoundingClientRect();
      if (!(e.y < r.top - 1 || e.y > r.bottom + 1)) return s;
    }
    let c = (n: any) => {
        if (!n) return;
        let r = parseParagraphDomLocation(n) ?? (() => {
          let e = n.getAttribute(`data-docx-wrapped-paragraph-location-key`);
          return (e ? kt.current.get(e) : void 0)?.location;
        })();
        if (!r) return;
        let s = i(o(n));
        if (s && a(s, n)) return s;
        if (t === `start`) return {
          location: r,
          offset: 0
        };
        if (t === `end`) return {
          location: r,
          offset: textLengthOfElement(n)
        };
        let c = n.getBoundingClientRect();
        return {
          location: r,
          offset: e.y >= c.top + c.height / 2 ? textLengthOfElement(n) : 0
        };
      },
      l = document.elementFromPoint(e.x, e.y);
    if (l instanceof Element) {
      let n = c(l.closest(`[data-docx-paragraph-kind]`) ?? void 0);
      if (n) return n;
      let r = l.closest(`[data-docx-table-cell='true']`) ?? void 0;
      if (r) {
        let n = Array.from(r.querySelectorAll(`[data-docx-paragraph-kind='table-cell'][data-docx-table-paragraph-index]`)).sort((e, t) => {
          let n = Number.parseInt(e.getAttribute(`data-docx-table-paragraph-index`) ?? ``, 10),
            r = Number.parseInt(t.getAttribute(`data-docx-table-paragraph-index`) ?? ``, 10);
          return (Number.isFinite(n) ? n : 0) - (Number.isFinite(r) ? r : 0);
        });
        if (n.length > 0) return c(t === `start` ? n[0] : t === `end` ? n[n.length - 1] : n.reduce((t, n) => {
          let r = t.getBoundingClientRect(),
            i = n.getBoundingClientRect(),
            a = Math.abs(e.y - (r.top + r.height / 2));
          return Math.abs(e.y - (i.top + i.height / 2)) < a ? n : t;
        }, n[0] as Element));
      }
    }
    let u = L.current;
    if (!u) return;
    let d = Array.from(u.querySelectorAll(`[data-docx-paragraph-host='true'],[data-docx-wrapped-paragraph-root='true'][data-docx-wrapped-paragraph-location-key]`)) as Element[];
    if (d.length === 0) return;
    let f, p;
    for (let t of d) {
      let n = t.getBoundingClientRect();
      if (e.y < n.top) {
        p = t;
        break;
      }
      f = t;
    }
    if (f && p) return c(t === `start` ? f : p);
    if (f) return c(f);
    if (p) return c(p);
  }, [textLengthOfElement, domPointToBoundary, resolveLocationHostElement, wrappedParagraphHit]);

  // 原 pa（jsx 29676）：DOM 选区 → 模型范围
  const selectionFromDom = React.useCallback(() => {
    let e = L.current,
      t = window.getSelection();
    if (!e || !t || t.rangeCount === 0) return;
    let n = t.getRangeAt(0);
    if (!e.contains(n.startContainer) || !e.contains(n.endContainer)) return;
    let r = domPointToBoundary(n.startContainer, n.startOffset),
      i = domPointToBoundary(n.endContainer, n.endOffset);
    if (!(!r || !i)) return normalizeTextRange({
      start: r,
      end: i
    });
  }, [domPointToBoundary]);

  // 原 ma（jsx 29690）：活动文本范围自 DOM 同步
  const syncActiveTextRangeFromDom = React.useCallback(() => {
    let t = e.selectionSessionKind,
      n = L.current,
      r = document.activeElement,
      i = !!(r instanceof HTMLElement && r.isContentEditable && n && n.contains(r)),
      a = window.getSelection(),
      o = a?.anchorNode ?? null,
      s = !!(a && a.isCollapsed && a.rangeCount > 0 && o && o.nodeType !== Node.TEXT_NODE),
      c = !!(i && (!a || a.rangeCount === 0));
    if (s || c) {
      if (t === `keyboard` || t === `composition` || xe.current) return;
      let n = (o instanceof Element ? o : o?.parentElement ?? null)?.closest(`[data-docx-paragraph-host='true']`) ?? (i ? (r as HTMLElement).closest(`[data-docx-paragraph-host='true']`) : null),
        a = collapsedRangeToRestore(e.activeTextRange);
      if (a && n) {
        let e = normalizeTextRange(a);
        resolveLocationHostElement(e.start.location) === n && applyDomSelection(e.start, e.end);
      }
      return;
    }
    let l = selectionFromDom();
    if (!l) {
      if (i && e.activeTextRange) return;
      e.setActiveTextRange(void 0);
      return;
    }
    clearTableSelection(), e.setActiveTextRange(l);
  }, [clearTableSelection, e, selectionFromDom, resolveLocationHostElement, applyDomSelection]);

  // 原 ha（jsx 29715）：选区同步调度（rAF 合并）
  const scheduleSelectionSync = React.useCallback(() => {
    we.current !== null && (window.clearTimeout(we.current), we.current = null), _e.current === null && (_e.current = window.requestAnimationFrame(() => {
      _e.current = null, syncActiveTextRangeFromDom();
    }));
  }, [syncActiveTextRangeFromDom]);

  // 原 DOM 选区恢复 layoutEffect（jsx 29723-29764）：
  // 焦点宿主内无活动范围时按记忆范围/偏移恢复
  React.useLayoutEffect(() => {
    if (k) return;
    let t = e.selectionSessionKind;
    if (Se.current.moved || t === `composition` || xe.current) return;
    let n = L.current;
    if (!n) return;
    let r = document.activeElement;
    if (!(r instanceof HTMLElement) || !r.isContentEditable || !n.contains(r)) return;
    let i = r.closest(`[data-docx-paragraph-host='true']`) as HTMLElement | null;
    if (!i) return;
    let a = window.getSelection();
    if (!a) return;
    let o = a.rangeCount > 0 ? a.getRangeAt(0) : void 0,
      s = a.anchorNode,
      c = !!(o && i.contains(o.startContainer) && i.contains(o.endContainer)),
      l = !!(o && n.contains(o.startContainer) && n.contains(o.endContainer)),
      u = !!(s && s.nodeType !== Node.TEXT_NODE),
      d = selectionRestoreArbitration({
        hasLiveRange: !!o,
        isCollapsed: a.isCollapsed,
        anchorIsElement: u,
        rangeInsideFocusedHost: c,
        rangeInsideViewer: l
      }),
      f = ye.current,
      p = f && f.expiresAt >= Date.now() ? f.range : void 0;
    f && !p && (ye.current = void 0);
    let m = !!(p && !sameTextRangeApprox(p, selectionFromDom()));
    if (!d && !m) return;
    let h = i.getAttribute(`data-docx-paragraph-node-index`),
      g = h == null ? NaN : Number.parseInt(h, 10),
      _ = ve.current;
    if (_ && Number.isFinite(g) && _.nodeIndex === g) {
      let e = elementToPlainText(i).length,
        t = Math.max(0, Math.min(_.start, e));
      setTextRangeInElement(i, t, Math.max(t, Math.min(_.end, e)));
      return;
    }
    if (t === `keyboard`) return;
    let v = p ?? e.activeTextRange;
    if (!v) return;
    let y = normalizeTextRange(v),
      b = resolveLocationHostElement(y.start.location);
    !b || b !== i || applyDomSelection(y.start, y.end);
  });

  /* ---------- 选区会话面（jsx 29766-29900） ---------- */

  // 原 ga（jsx 29766）：元素内是否存在展开选区
  const hasSelectionInside = React.useCallback((e: any) => {
    let t = window.getSelection();
    if (!t || t.isCollapsed || t.rangeCount === 0) return !1;
    let n = t.getRangeAt(0);
    return e.contains(n.startContainer) && e.contains(n.endContainer);
  }, []);

  // 原 _a（jsx 29773）：按 X 坐标恢复光标（越界才重放）
  const restoreCaretAtX = React.useCallback((e: any, t: any, n: any) => {
    let r = window.getSelection(),
      i = r && r.rangeCount > 0 ? r.getRangeAt(0) : void 0;
    if (!(i && e.contains(i.startContainer) && e.contains(i.endContainer))) {
      placeCaretInHost(e, t);
      return;
    }
    if (!(i && caretXOutOfRange(e, i, t.x))) return;
    let a = () => {
      if (Number.isFinite(n) && !Ln(n)) return;
      let r = window.getSelection(),
        i = r && r.rangeCount > 0 ? r.getRangeAt(0) : void 0;
      i && e.contains(i.startContainer) && e.contains(i.endContainer) && i && caretXOutOfRange(e, i, t.x) && placeCaretInHost(e, t);
    };
    if (Number.isFinite(n)) {
      Rn(n, a);
      return;
    }
    window.requestAnimationFrame(a);
  }, [Ln, placeCaretInHost, Rn]);

  // 原 va（jsx 29795）：点按后选区确保（会话沉降 + 重试）
  const ensureSelectionAfterTap = React.useCallback((t: any, n: any, r: any) => {
    let i = In();
    e.beginSelectionSession(`pointer`, {
      settleAfterMs: 320
    }), Rn(i, () => {
      if (!Ln(i)) return;
      let a = window.getSelection(),
        o = a && a.rangeCount > 0 ? a.getRangeAt(0) : void 0;
      if (a && !a.isCollapsed && o) {
        r(), e.clearSelectionSession(`pointer`);
        return;
      }
      if (!(o && t.contains(o.startContainer) && t.contains(o.endContainer))) {
        restoreCaretAtX(t, n, i), Rn(i, () => {
          Ln(i) && (r(), e.clearSelectionSession(`pointer`));
        });
        return;
      }
      if (o && caretXOutOfRange(t, o, n.x)) {
        restoreCaretAtX(t, n, i), Rn(i, () => {
          Ln(i) && (r(), e.clearSelectionSession(`pointer`));
        });
        return;
      }
      r(), e.clearSelectionSession(`pointer`);
    });
  }, [In, e, restoreCaretAtX, Ln, Rn]);

  // 原 ya（jsx 29821）：指针会话取消
  const cancelPointerSession = React.useCallback(() => {
    zn(), e.clearSelectionSession(`pointer`);
  }, [zn, e]);

  // 原 ba（jsx 29824）：瞬态选区清除（表格/图片/首字下沉/包裹）
  const clearTransientSelections = React.useCallback((t: any) => {
    clearTableSelection(), Fe(void 0), Le(void 0), ze(void 0), Ve(void 0), Ue(void 0), e.selection.kind === `table-cell` && e.selectParagraph(t);
  }, [clearTableSelection, e]);

  // 原 xa（jsx 29827）：包裹编辑进入（文本/选区/光标 X 记忆）
  const beginWrappedEditing = React.useCallback((t: any, n: any, r: any, i: any) => {
    let a = resolveLocationContract(e.model, t).paragraph,
      o = i?.textLength ?? i?.textOverride?.length ?? (a ? paragraphEditText(a).length : 0),
      s = Math.max(0, Math.min(Math.round(n), o)),
      c = Math.max(0, Math.min(Math.round(r), o)),
      l = Math.min(s, c),
      u = Math.max(s, c),
      d = Math.max(0, Math.min(Math.round(i?.anchorOffset ?? n), o)),
      f = locationKeyContract(t),
      p = i?.textOverride ?? (a ? paragraphEditText(a) : ``);
    Dt.current = {
      locationKey: f,
      start: l,
      end: u
    }, Ue((e: any) => ({
      location: t,
      locationKey: f,
      text: p,
      selectionStart: l,
      selectionEnd: u,
      anchorOffset: d,
      isComposing: i?.isComposing ?? e?.isComposing ?? !1,
      preferredCaretX: i?.preferredCaretX ?? (l === u ? e?.preferredCaretX : void 0)
    })), t.kind === `paragraph` ? e.selectParagraph(t.nodeIndex) : e.selectTableCell(t.tableIndex, t.rowIndex, t.cellIndex), e.setActiveTextRange({
      start: {
        location: cloneLocationContract(t),
        offset: l
      },
      end: {
        location: cloneLocationContract(t),
        offset: u
      }
    });
  }, [e]);

  // 原 Sa（jsx 29862）：包裹文本域聚焦与选区恢复
  const focusWrappedTextarea = React.useCallback(() => {
    scheduleFrame(() => {
      let e = Et.current;
      if (!e || !e.isConnected) return;
      e.focus();
      let t = Dt.current,
        n = He,
        r = t && (!n || t.locationKey === n.locationKey) ? t : n ? {
          locationKey: n.locationKey,
          start: n.selectionStart,
          end: n.selectionEnd
        } : void 0;
      if (!r) return;
      let i = Math.max(0, Math.min(r.start, e.value.length)),
        a = Math.max(i, Math.min(r.end, e.value.length));
      try {
        e.setSelectionRange(i, a), t && t.locationKey === r.locationKey && t.start === r.start && t.end === r.end && (Dt.current = void 0);
      } catch {}
    });
  }, [He]);

  // 原 Ca（jsx 29882）：包裹文本提交（段落/单元格递归）
  const commitWrappedText = React.useCallback((t: any, n: any) => {
    if (e.suppressNextDomSelectionRestore(), t.kind === `paragraph`) {
      e.commitParagraphText(t.nodeIndex, n);
      return;
    }
    e.commitTableCellParagraphTextRecursive(t.tableIndex, t.rowIndex, t.cellIndex, t.paragraphIndex, n);
  }, [e]);

  // 原 wa（jsx 29888）：段落节点聚焦（可选点光标）
  const focusParagraphNode = React.useCallback((t: any, n: any) => {
    clearTransientSelections(t), e.selectParagraph(t), scheduleFrame(() => {
      let e = te.current.get(t);
      !e || !e.isConnected || (n ? placeCaretInHost(e, n) : placeCaretInHost(e), scheduleSelectionSync());
    });
  }, [clearTransientSelections, e, scheduleSelectionSync, placeCaretInHost]);

  // 原 Ta（jsx 29893）：首字下沉选择
  const selectDropCap = React.useCallback((e: any) => {
    k || (clearTableSelection(), Fe(void 0), Le(void 0), Ue(void 0), ze(e));
  }, [clearTableSelection, k]);

  // 原 Ea（jsx 29897）：折叠选区同步调度（定时器合并）
  const scheduleCollapsedSelectionSync = React.useCallback(() => {
    we.current !== null && window.clearTimeout(we.current), we.current = window.setTimeout(() => {
      we.current = null, scheduleSelectionSync();
    }, 80);
  }, [scheduleSelectionSync]);

  // 原 历史恢复选区 effect（jsx 29902-29976）：
  // historyRestoreRequest 换代 → 帧令牌重试聚焦 + 范围/单元格边界恢复
  React.useEffect(() => {
    let t = e.historyRestoreRequest;
    if (!t || t.nonce === X.current) return;
    X.current = t.nonce;
    let n = In();
    e.beginSelectionSession(`history-restore` as any, {
      settleAfterMs: 180
    }), be.current = void 0, R.current.clear(), ee.current.clear(), H.current.clear();
    let r = t.activeTextRange ? normalizeTextRange(t.activeTextRange) : void 0,
      i = () => {
        if (r) {
          let e = resolveLocationHostElement(r.start.location);
          if (e) return e;
        }
        if (t.selection.kind === `paragraph`) return te.current.get(t.selection.nodeIndex);
        let e = `${(t.selection as any).tableIndex}:${(t.selection as any).rowIndex}:${(t.selection as any).cellIndex}`;
        return ae.current.get(e);
      },
      a = (o: any = 0) => {
        if (!Ln(n)) return;
        let s = i();
        if (!s) {
          o < 6 && Rn(n, () => {
            a(o + 1);
          });
          return;
        }
        if (!r && t.selection.kind === `table-cell`) {
          let t = window.getSelection();
          if (t && t.rangeCount > 0 && s.contains(t.getRangeAt(0).startContainer) && s.contains(t.getRangeAt(0).endContainer)) {
            e.clearSelectionSession(`history-restore` as any);
            return;
          }
        }
        try {
          s.focus({
            preventScroll: !0
          });
        } catch {
          s.focus();
        }
        if (r) {
          applyDomSelection(r.start, r.end), e.clearSelectionSession(`history-restore` as any);
          return;
        }
        if (t.selection.kind === `table-cell`) {
          let n = `cell-${(t.selection as any).tableIndex}-${(t.selection as any).rowIndex}-${(t.selection as any).cellIndex}`,
            r = fe.current,
            i = r?.cellElementKey === n,
            a = i && r?.boundary?.location.kind === `table-cell` && r.boundary.location.tableIndex === (t.selection as any).tableIndex && r.boundary.location.rowIndex === (t.selection as any).rowIndex && r.boundary.location.cellIndex === (t.selection as any).cellIndex ? r.boundary : void 0;
          if (a) {
            applyDomSelection(a, a), fe.current = void 0, e.clearSelectionSession(`history-restore` as any);
            return;
          }
          let o = i ? r.point : void 0,
            c = `[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${(t.selection as any).tableIndex}'][data-docx-row-index='${(t.selection as any).rowIndex}'][data-docx-cell-index='${(t.selection as any).cellIndex}'][data-docx-table-paragraph-index]`,
            l = Array.from(s.querySelectorAll(c)) as Element[],
            u = i && Number.isFinite(r?.paragraphIndex) ? s.querySelector(`[data-docx-paragraph-kind='table-cell'][data-docx-table-index='${(t.selection as any).tableIndex}'][data-docx-row-index='${(t.selection as any).rowIndex}'][data-docx-cell-index='${(t.selection as any).cellIndex}'][data-docx-table-paragraph-index='${r?.paragraphIndex}']`) ?? void 0 : void 0,
            d = o && l.length > 0 ? l.reduce((e, t) => {
              let n = e.getBoundingClientRect(),
                r = t.getBoundingClientRect(),
                i = Math.abs(o.y - (n.top + n.height / 2));
              return Math.abs(o.y - (r.top + r.height / 2)) < i ? t : e;
            }, l[0] as Element) : void 0,
            f = o ? document.elementFromPoint(o.x, o.y)?.closest(c) ?? void 0 : void 0,
            p = l[0],
            m = u ?? f ?? d ?? p;
          m ? placeCaretInHost(m, o) : o && placeCaretInHost(s, o), i && (fe.current = void 0), e.clearSelectionSession(`history-restore` as any);
          return;
        }
        placeCaretInHost(s), e.clearSelectionSession(`history-restore` as any);
      };
    Rn(n, () => {
      a();
    });
  }, [In, e, e.historyRestoreRequest, Ln, placeCaretInHost, resolveLocationHostElement, Rn, applyDomSelection]);

  // 原 selectionchange 监听 effect（jsx 29977-30011）：
  // 折叠 → 延迟同步；展开 → 即时同步；宿主内偏移记忆
  React.useEffect(() => {
    let e = () => {
      let e = window.getSelection();
      if (!e || e.rangeCount === 0) return;
      let t = e.getRangeAt(0),
        n = L.current;
      if (!n || !n.contains(t.startContainer) || !n.contains(t.endContainer)) return;
      let r = ye.current;
      if (r && r.expiresAt >= Date.now() || (r && (ye.current = void 0), on.current?.hasMoved)) return;
      let i = sn.current;
      if (i?.isSelectingAcrossNodes || i?.isSelectingCells) return;
      let a = document.activeElement,
        o = !!(t.collapsed && a instanceof HTMLElement && a.isContentEditable && n.contains(a) && a.contains(t.startContainer));
      if (a instanceof HTMLElement && a.isContentEditable && n.contains(a) && a.contains(t.startContainer) && a.contains(t.endContainer) && t.startContainer.nodeType === Node.TEXT_NODE && t.endContainer.nodeType === Node.TEXT_NODE && a instanceof HTMLElement) {
        let e = a.closest(`[data-docx-paragraph-host='true']`),
          t = e?.getAttribute(`data-docx-paragraph-node-index`),
          n = e ? selectionOffsetsInHost(e) : void 0;
        if (e && t != null && n) {
          let e = Number.parseInt(t, 10);
          Number.isFinite(e) && (ve.current = {
            nodeIndex: e,
            start: n.start,
            end: n.end
          });
        }
      }
      if (o) {
        scheduleCollapsedSelectionSync();
        return;
      }
      scheduleSelectionSync();
    };
    return document.addEventListener(`selectionchange`, e), () => {
      document.removeEventListener(`selectionchange`, e);
    };
  }, [scheduleSelectionSync, scheduleCollapsedSelectionSync]);

  // 原 指针会话跟踪 effect（jsx 30012-30037）
  React.useEffect(() => {
    let t = (t: any) => {
        ye.current = void 0;
        let n = L.current,
          r = t.target;
        if (n && r instanceof Node && !n.contains(r)) {
          let t = selectionFromDom();
          t && (zn(), e.setActiveTextRange(t));
        }
        Se.current = {
          down: !0,
          moved: !1
        };
      },
      n = (e: any) => {
        Se.current.down && e.buttons !== 0 && (Se.current.moved = !0);
      },
      r = () => {
        Se.current = {
          down: !1,
          moved: !1
        };
      };
    return window.addEventListener(`pointerdown`, t, !0), window.addEventListener(`pointermove`, n, !0), window.addEventListener(`pointerup`, r, !0), () => {
      window.removeEventListener(`pointerdown`, t, !0), window.removeEventListener(`pointermove`, n, !0), window.removeEventListener(`pointerup`, r, !0);
    };
  }, [zn, e, selectionFromDom]);

  /* ---------- 指针拖选面（jsx 30039-30194） ---------- */

  // 原 Da（jsx 30039）：文本拖选会话（阈值起步 + 方向端点）
  const beginTextDragSelection = React.useCallback((e: any, t: any, n: any, r: any) => {
    on.current = {
      pointerId: t,
      startBoundary: e,
      startX: n,
      startY: r,
      hasMoved: !1,
      explicitSelectionActive: !1
    };
    let i = (e: any) => {
        let t = on.current;
        if (!t || e.pointerId !== t.pointerId) return;
        Math.abs(e.clientX - t.startX) + Math.abs(e.clientY - t.startY) >= 3 && (t.hasMoved = !0);
        let n = e.clientY < t.startY || e.clientY === t.startY && e.clientX < t.startX ? `start` : `end`;
        if (!t.explicitSelectionActive) {
          if (!t.hasMoved) return;
          let r = boundaryAtPoint({
            x: e.clientX,
            y: e.clientY
          }, n);
          if (!r || sameLocationContract(t.startBoundary.location, r.location)) return;
          t.explicitSelectionActive = !0;
        }
        e.preventDefault();
        let r = boundaryAtPoint({
          x: e.clientX,
          y: e.clientY
        }, n);
        r && applyDomSelection(t.startBoundary, r);
      },
      a = (e: any) => {
        let t = on.current;
        if (!(!t || e.pointerId !== t.pointerId)) {
          if (t.explicitSelectionActive && t.hasMoved) {
            let n = e.clientY < t.startY || e.clientY === t.startY && e.clientX < t.startX ? `start` : `end`,
              r = boundaryAtPoint({
                x: e.clientX,
                y: e.clientY
              }, n);
            r && applyDomSelection(t.startBoundary, r);
          }
          on.current = void 0, window.removeEventListener(`pointermove`, i), window.removeEventListener(`pointerup`, a), window.removeEventListener(`pointercancel`, a);
        }
      };
    window.addEventListener(`pointermove`, i), window.addEventListener(`pointerup`, a, {
      once: !0
    }), window.addEventListener(`pointercancel`, a, {
      once: !0
    });
  }, [boundaryAtPoint, applyDomSelection]);

  // 原 Oa（jsx 30088）：点 → 表格单元格位置
  const tableCellAtPoint = React.useCallback((e: any) => tableCellLocationFromElement(document.elementFromPoint(e.x, e.y)), []);

  // 原 ka（jsx 30090）：表格单元格拖选（格选/跨节点升级）
  const beginTableCellDragSelection = React.useCallback((t: any, n: any, r: any, i: any, a: any) => {
    sn.current = {
      pointerId: t,
      anchorCell: n,
      startBoundary: a,
      startX: r,
      startY: i,
      isSelectingCells: !1,
      isSelectingAcrossNodes: !1
    };
    let o = (t: any) => {
        let n = sn.current;
        if (!n || t.pointerId !== n.pointerId || !n.isSelectingCells && !n.isSelectingAcrossNodes && Math.abs(t.clientX - n.startX) + Math.abs(t.clientY - n.startY) < 3) return;
        let r = t.clientY < n.startY || t.clientY === n.startY && t.clientX < n.startX ? `start` : `end`;
        if (n.isSelectingAcrossNodes) {
          let e = boundaryAtPoint({
            x: t.clientX,
            y: t.clientY
          }, r);
          if (!n.startBoundary || !e) return;
          clearTableSelection(), applyDomSelection(n.startBoundary, e), t.preventDefault();
          return;
        }
        let i = tableCellAtPoint({
          x: t.clientX,
          y: t.clientY
        });
        if (i && i.tableIndex === n.anchorCell.tableIndex) {
          if (!(i.rowIndex !== n.anchorCell.rowIndex || i.cellIndex !== n.anchorCell.cellIndex)) return;
          n.isSelectingCells || (n.isSelectingCells = !0, fe.current = void 0, window.getSelection()?.removeAllRanges()), dn({
            tableIndex: n.anchorCell.tableIndex,
            anchorRowIndex: n.anchorCell.rowIndex,
            anchorCellIndex: n.anchorCell.cellIndex,
            focusRowIndex: i.rowIndex,
            focusCellIndex: i.cellIndex
          }), e.selectTableCell(i.tableIndex, i.rowIndex, i.cellIndex), e.setActiveTextRange(void 0), t.preventDefault();
          return;
        }
        if (!n.startBoundary) return;
        let a = boundaryAtPoint({
          x: t.clientX,
          y: t.clientY
        }, r);
        a && (n.isSelectingAcrossNodes = !0, n.isSelectingCells = !1, fe.current = void 0, clearTableSelection(), applyDomSelection(n.startBoundary, a), t.preventDefault());
      },
      s = (e: any) => {
        let t = sn.current;
        !t || e.pointerId !== t.pointerId || ((t.isSelectingCells || t.isSelectingAcrossNodes) && (ln.current = !0), sn.current = void 0, window.removeEventListener(`pointermove`, o), window.removeEventListener(`pointerup`, s), window.removeEventListener(`pointercancel`, s));
      };
    window.addEventListener(`pointermove`, o), window.addEventListener(`pointerup`, s, {
      once: !0
    }), window.addEventListener(`pointercancel`, s, {
      once: !0
    });
  }, [clearTableSelection, e, boundaryAtPoint, tableCellAtPoint, applyDomSelection]);

  // 原 Aa（jsx 30143）：指针按下捕获（菜单关闭/交互元素短路/拖选起步）
  const handlePointerDownCapture = React.useCallback((e: any) => {
    if (gn || vn) {
      let t = e.target;
      t instanceof Element && !t.closest(`[data-docx-table-context-menu='true'],[data-docx-context-menu='true']`) && (closeTableContextMenu(), closeContextMenu());
    }
    if (e.button !== 0 && e.button !== void 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    let t = e.target;
    if (!(t instanceof Element) || (bn && !t.closest(`[data-docx-header-footer-region='header']`) && !t.closest(`[data-docx-header-footer-region='footer']`) && endHeaderFooterSession(bn), isInteractiveElement(t)) || t.closest(`[data-docx-table-cell='true']`)) return;
    let n = t.closest(`[data-docx-paragraph-host='true']`);
    if (!n || !(n as HTMLElement).isContentEditable) return;
    let r = boundaryAtPoint({
      x: e.clientX,
      y: e.clientY
    });
    r && beginTextDragSelection(r, e.pointerId, e.clientX, e.clientY);
  }, [bn, beginTextDragSelection, closeContextMenu, closeTableContextMenu, vn, boundaryAtPoint, endHeaderFooterSession, gn]);

  // 原 ja（jsx 30161）：右键菜单（选区命中判定 + 文本菜单打开）
  const handleContextMenu = React.useCallback((t: any) => {
    if (k || t.defaultPrevented) return;
    let n = t.target;
    if (!(n instanceof Element) || n.closest(`[data-docx-table-context-menu='true']`) || n.closest(`[data-docx-context-menu='true']`) || isInteractiveElement(n)) return;
    let r = window.getSelection(),
      i = r && r.rangeCount > 0 ? r.getRangeAt(0) : void 0,
      a = r && !r.isCollapsed && i ? Array.from(i?.getClientRects() ?? []).some(e => t.clientX >= e.left && t.clientX <= e.right && t.clientY >= e.top && t.clientY <= e.bottom) : !1,
      o = selectionFromDom();
    if (a) o && (clearTableSelection(), e.setActiveTextRange(o));else {
      let e = boundaryAtPoint({
        x: t.clientX,
        y: t.clientY
      });
      if (!e) return;
      clearTableSelection(), applyDomSelection(e, e), o = {
        start: {
          location: cloneLocationContract(e.location),
          offset: e.offset
        },
        end: {
          location: cloneLocationContract(e.location),
          offset: e.offset
        }
      };
    }
    let s = o ? cloneLocationContract(normalizeTextRange(o).start.location) : void 0;
    t.preventDefault(), t.stopPropagation(), openTextContextMenu({
      kind: `text`,
      activeTextRange: o ? normalizeTextRange(o) : void 0,
      location: s
    }, {
      x: t.clientX,
      y: t.clientY
    });
  }, [clearTableSelection, e, k, openTextContextMenu, selectionFromDom, boundaryAtPoint, applyDomSelection]);

  /* ---------- 键盘面（jsx 30195-30305） ---------- */

  // 原 Ma（jsx 30195）：表格选区删除（整表/清格）
  const handleTableSelectionDelete = React.useCallback((t: any) => {
    if (k || t.defaultPrevented || t.key !== `Backspace` && t.key !== `Delete` || !un || tableSelectionCollapsed(un)) return !1;
    let n = e.model.nodes[un.tableIndex];
    if (!n || n.type !== `table`) return !1;
    let r = tableSelectionCells(n as DocxTableNode, un);
    if (r.length === 0) return !1;
    if (t.preventDefault(), t.stopPropagation(), fe.current = void 0, e.setActiveTextRange(void 0), tableSelectionIsWholeTable(n as DocxTableNode, un)) return R.current.forEach((e: any, t: any) => {
      t.startsWith(`${un.tableIndex}:`) && R.current.delete(t);
    }), clearTableSelection(), e.deleteTable(un.tableIndex), !0;
    r.forEach(e => {
      R.current.delete(`${un.tableIndex}:${e.rowIndex}:${e.cellIndex}`);
    }), e.clearTableCellContents(un.tableIndex, r);
    let i = r[0];
    return i ? (e.selectTableCell(un.tableIndex, i.rowIndex, i.cellIndex), setTableSelectionAnchor(un.tableIndex, i.rowIndex, i.cellIndex)) : clearTableSelection(), !0;
  }, [clearTableSelection, e, k, setTableSelectionAnchor, un]);

  // 原 Na（jsx 30211）：键盘按下捕获（删除/全选分派）
  const handleKeyDownCapture = React.useCallback((t: any) => {
    if (ye.current = void 0, !k && handleTableSelectionDelete(t)) return;
    let n = (t.key === `Backspace` || t.key === `Delete`) && !t.metaKey && !t.ctrlKey && !t.altKey && !t.shiftKey;
    if (!k && n && !t.defaultPrevented) {
      let n = t.target;
      if (!(n instanceof Element) || !isInteractiveElement(n)) {
        let n = e.activeTextRange;
        if (!n || compareTextPositions(n.start, n.end) >= 0) {
          let e = window.getSelection();
          if (e && e.rangeCount > 0) {
            let t = e.getRangeAt(0),
              r = domPointToBoundary(t.startContainer, t.startOffset),
              i = domPointToBoundary(t.endContainer, t.endOffset);
            r && i && (n = normalizeTextRange({
              start: r,
              end: i
            }));
          }
        }
        if (n && compareTextPositions(n.start, n.end) < 0) {
          let r = normalizeTextRange(n);
          t.preventDefault(), t.stopPropagation(), restoreSelectionAfterEdit({
            start: {
              location: cloneLocationContract(r.start.location),
              offset: r.start.offset
            },
            end: {
              location: cloneLocationContract(r.start.location),
              offset: r.start.offset
            }
          });
          let i = e.deleteExpandedSelection(r);
          i && (be.current = void 0, R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(i));
          return;
        }
      }
    }
    if (!((t.key === `a` || t.key === `A`) && (t.ctrlKey || t.metaKey)) || t.shiftKey || t.altKey) return;
    let r = t.target;
    r instanceof Element && (isInteractiveElement(r) || L.current?.contains(r) && (t.preventDefault(), t.stopPropagation(), selectAllContent()));
  }, [e, handleTableSelectionDelete, k, domPointToBoundary, selectAllContent, restoreSelectionAfterEdit]);

  // 原 Pa（jsx 30252）：键盘抬起（导航/编辑键 → 选区同步）
  const handleKeyUp = React.useCallback((e: any) => {
    isNavigationOrEditKey(e) && scheduleSelectionSync();
  }, [scheduleSelectionSync]);

  // 原 Fa（jsx 30255）：展开选区按键删除
  const deleteExpandedSelectionFromKey = React.useCallback((t: any) => {
    if (k || t.defaultPrevented || t.key !== `Backspace` && t.key !== `Delete`) return !1;
    let n = e.activeTextRange;
    if (!n || compareTextPositions(n.start, n.end) >= 0) {
      let e = window.getSelection();
      if (e && e.rangeCount > 0) {
        let t = e.getRangeAt(0),
          r = domPointToBoundary(t.startContainer, t.startOffset),
          i = domPointToBoundary(t.endContainer, t.endOffset);
        r && i && (n = normalizeTextRange({
          start: r,
          end: i
        }));
      }
    }
    if (!n || compareTextPositions(n.start, n.end) >= 0) return !1;
    let r = normalizeTextRange(n);
    t.preventDefault(), t.stopPropagation(), restoreSelectionAfterEdit({
      start: {
        location: cloneLocationContract(r.start.location),
        offset: r.start.offset
      },
      end: {
        location: cloneLocationContract(r.start.location),
        offset: r.start.offset
      }
    });
    let i = e.deleteExpandedSelection(r);
    return i && (be.current = void 0, R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(i)), !0;
  }, [e, k, domPointToBoundary, restoreSelectionAfterEdit]);

  // 原 Ia（jsx 30286）：选区文本替换（粘贴/拖入）
  const replaceSelectionWithText = React.useCallback((t: any) => {
    if (k) return !1;
    let n = e.activeTextRange;
    if (!n) {
      let e = window.getSelection();
      if (e && e.rangeCount > 0) {
        let t = e.getRangeAt(0),
          r = domPointToBoundary(t.startContainer, t.startOffset),
          i = domPointToBoundary(t.endContainer, t.endOffset);
        r && i && (n = normalizeTextRange({
          start: r,
          end: i
        }));
      }
    }
    if (!n) return !1;
    let r = normalizeTextRange(n);
    if (compareTextPositions(r.start, r.end) >= 0) return !1;
    let i = t.replace(/\r\n?/g, `\n`),
      a = e.replaceExpandedSelection(i, r);
    return a ? (be.current = void 0, R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(a), !0) : !1;
  }, [e, k, domPointToBoundary, restoreSelectionAfterEdit]);

  /* ---------- 右键菜单动作面（jsx 30306-30384） ---------- */

  // 原 La（jsx 30306）：右键菜单动作表构建（表格/文本/图片三态）
  const contextMenuActionsFor = React.useCallback((e: any) => {
    if (e.kind === `table`) return tableContextMenuActions.map((e: any) => ({
      id: e.id,
      label: e.label,
      destructive: e.destructive
    }));
    let t = e.activeTextRange ? normalizeTextRange(e.activeTextRange) : void 0,
      n = !!(t && compareTextPositions(t.start, t.end) < 0),
      r = TEXT_CONTEXT_MENU_ACTIONS_SOURCE.map((e: any) => ({
        ...e,
        disabled: (e.id === `cut` || e.id === `copy`) && !n
      }));
    if (e.kind !== `image`) return r;
    let i = e.image?.floating,
      a = e.image?.wrap ?? imageWrapModel(i),
      o = !!i,
      s = Number.isFinite(i?.zIndex) ? clampNumber(Math.round(i?.zIndex), IMAGE_ZINDEX_MIN, IMAGE_ZINDEX_MAX) : IMAGE_ZINDEX_DEFAULT,
      c = !o || s >= IMAGE_ZINDEX_MAX,
      l = !o || s <= IMAGE_ZINDEX_MIN,
      u = (e: any) => {
        switch (e) {
          case `image-bring-to-front`:
            return !o || s >= IMAGE_ZINDEX_MAX;
          case `image-bring-forward`:
            return c;
          case `image-send-to-back`:
            return !o || s <= IMAGE_ZINDEX_MIN;
          case `image-send-backward`:
            return l;
          default:
            return !1;
        }
      },
      d = IMAGE_WRAP_MENU_ITEMS_SOURCE.map((e: any) => ({
        id: e.actionId,
        label: e.label,
        checked: a.mode === e.mode,
        separatorBefore: e.separatorBefore
      })),
      f = [{
        id: `image-edit-wrap-boundary`,
        label: `Edit Wrap Boundary`,
        disabled: !0,
        separatorBefore: !0
      }, {
        id: `image-move-with-text`,
        label: `Move with Text`,
        checked: a.moveWithText,
        disabled: a.mode === `inline`,
        separatorBefore: !0
      }, {
        id: `image-fix-position-on-page`,
        label: `Fix Position on Page`,
        checked: a.fixedPositionOnPage,
        disabled: a.mode === `inline`
      }, {
        id: `image-more-layout-options`,
        label: `More Layout Options...`,
        disabled: !0,
        separatorBefore: !0
      }],
      p = IMAGE_ZORDER_MENU_SOURCE.map((e: any) => {
        let t = e.children?.map((e: any) => ({
          ...e,
          disabled: u(e.id)
        }));
        return {
          ...e,
          separatorBefore: !0,
          disabled: t ? t.every((e: any) => !!e.disabled) : u(e.id),
          children: t
        };
      });
    return [...r, ...d, ...f, ...p];
  }, [tableContextMenuActions]);

  // 原 Ra（jsx 30385）：右键菜单动作执行（剪贴板/图片环绕/层序）
  const runContextMenuAction = React.useCallback((t: any, n: any) => {
    if ((e => e === `insert-row-above` || e === `insert-row-below` || e === `insert-column-left` || e === `insert-column-right` || e === `delete-row` || e === `delete-column` || e === `delete-table`)(t)) {
      runTableAction(t, n?.kind === `table` ? n.tableContext : void 0);
      return;
    }
    let r = n ?? vn;
    if (!r) return;
    let i = r.activeTextRange ? normalizeTextRange(r.activeTextRange) : selectionFromDom(),
      a = !!(i && compareTextPositions(i.start, i.end) < 0),
      o = (e: any) => {
        let t = normalizeTextRange(e),
          n = resolveLocationHostElement(t.start.location);
        if (!n) return !1;
        let r = t.start.location.kind === `table-cell` ? n.closest(`[data-docx-cell-key]`) ?? n : n;
        try {
          (r as HTMLElement).focus({
            preventScroll: !0
          });
        } catch {
          (r as HTMLElement).focus();
        }
        return applyDomSelection(t.start, t.end), !0;
      },
      s = (e: any) => {
        be.current = void 0, R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(e);
      },
      c = (t: any) => {
        let n = window.getSelection()?.toString() ?? ``;
        if (n.length > 0) return n;
        if (!t) return ``;
        let r = normalizeTextRange(t);
        return compareTextPositions(r.start, r.end) >= 0 ? `` : enumerateRangeLocationsContract(e.model, r.start.location, r.end.location).map(({
          location: t
        }) => {
          let {
            paragraph: n
          } = resolveLocationContract(e.model, t);
          if (!n) return ``;
          let [i, a] = rangeOffsetsInParagraph(t, r.start, r.end, n);
          return paragraphTextContract(n).slice(i, a);
        }).join(`\n`);
      },
      l = () => {
        if (!i || !a) return !1;
        restoreSelectionAfterEdit({
          start: {
            location: cloneLocationContract(i.start.location),
            offset: i.start.offset
          },
          end: {
            location: cloneLocationContract(i.start.location),
            offset: i.start.offset
          }
        });
        let t = e.deleteExpandedSelection(i);
        return t ? (s(t), !0) : !1;
      },
      u = (t: any) => {
        if (!i) return !1;
        let n = normalizeTextRange(i);
        if (compareTextPositions(n.start, n.end) !== 0) return !1;
        let {
          paragraph: r
        } = resolveLocationContract(e.model, n.start.location);
        if (!r) return !1;
        let a = t.replace(/\r\n?/g, `\n`),
          o = paragraphInsertOffset(r, n.start.offset),
          c = paragraphTextContract(r),
          l = `${c.slice(0, o)}${a}${c.slice(o)}`;
        return n.start.location.kind === `paragraph` ? e.commitParagraphText(n.start.location.nodeIndex, l) : e.commitTableCellParagraphTextRecursive(n.start.location.tableIndex, n.start.location.rowIndex, n.start.location.cellIndex, n.start.location.paragraphIndex, l), s({
          start: {
            location: cloneLocationContract(n.start.location),
            offset: o + a.length
          },
          end: {
            location: cloneLocationContract(n.start.location),
            offset: o + a.length
          }
        }), !0;
      },
      d = () => {
        let t = r.image?.location;
        if (!t) return;
        let {
            paragraph: n
          } = resolveLocationContract(e.model, paragraphLocationOfImage(t)),
          i = (n as any)?.children[t.childIndex];
        if (!(!i || i.type !== `image`)) return {
          location: t,
          image: i
        };
      },
      f = (e: any) => {
        if (typeof document > `u`) return {};
        let t = document.querySelector(`[data-docx-image-location="${imageLocationKeyContract(e)}"]`);
        if (!t) return {};
        let n = t.getBoundingClientRect(),
          r = t.closest(`[data-docx-paragraph-host='true']`)?.getBoundingClientRect(),
          i = t.closest(`[data-docx-page-surface='true']`)?.getBoundingClientRect();
        return {
          paragraphLeftPx: r ? Math.round(n.left - r.left) : void 0,
          paragraphTopPx: r ? Math.round(n.top - r.top) : void 0,
          pageLeftPx: i ? Math.round(n.left - i.left - Hn.marginsPx.left) : void 0,
          pageTopPx: i ? Math.round(n.top - i.top - Hn.marginsPx.top) : void 0
        };
      },
      p = (e: any, t: any) => {
        if (t === `inline`) return;
        let n = imageWrapModel(e.image.floating),
          r = f(e.location),
          i = n.fixedPositionOnPage || t === `behindText` || t === `inFrontOfText`;
        return {
          horizontalRelativeTo: i ? `margin` : `column`,
          verticalRelativeTo: i ? `margin` : `paragraph`,
          ...(Number.isFinite(i ? r.pageLeftPx : r.paragraphLeftPx) ? {
            xPx: Math.round((i ? r.pageLeftPx : r.paragraphLeftPx) as number)
          } : void 0),
          ...(Number.isFinite(i ? r.pageTopPx : r.paragraphTopPx) ? {
            yPx: Math.round((i ? r.pageTopPx : r.paragraphTopPx) as number)
          } : void 0),
          ...(i ? {
            horizontalAlign: void 0,
            verticalAlign: void 0
          } : void 0)
        };
      },
      m = (e: any, t: any) => {
        let n = e.image.floating;
        if (!n) return;
        let r = f(e.location),
          i = imageWrapModel(n).mode,
          a = i === `behindText` || i === `inFrontOfText`;
        return t ? a ? {
          xPx: r.paragraphLeftPx ?? n.xPx ?? 0,
          yPx: r.paragraphTopPx ?? n.yPx ?? 0,
          horizontalAlign: void 0,
          verticalAlign: void 0,
          horizontalRelativeTo: `column`,
          verticalRelativeTo: `paragraph`
        } : {
          yPx: r.paragraphTopPx ?? n.yPx ?? 0,
          verticalRelativeTo: `paragraph`
        } : a ? {
          xPx: r.pageLeftPx ?? n.xPx ?? 0,
          yPx: r.pageTopPx ?? n.yPx ?? 0,
          horizontalAlign: void 0,
          verticalAlign: void 0,
          horizontalRelativeTo: `margin`,
          verticalRelativeTo: `margin`
        } : {
          yPx: r.pageTopPx ?? n.yPx ?? 0,
          verticalRelativeTo: `margin`
        };
      },
      h = () => {
        if (typeof (document as any).execCommand != `function`) return !1;
        try {
          return (document as any).execCommand(`copy`);
        } catch {
          return !1;
        }
      },
      g = async (e: any) => {
        if (!e || (V.current = e, typeof navigator > `u` || !navigator.clipboard?.writeText)) return !1;
        try {
          return await navigator.clipboard.writeText(e), !0;
        } catch {
          return !1;
        }
      },
      _ = async () => {
        if (typeof navigator < `u` && navigator.clipboard?.readText) try {
          let e = await navigator.clipboard.readText();
          if (e.length > 0) return V.current = e, e;
        } catch {}
        return V.current;
      };
    (async () => {
      switch (t) {
        case `copy`:
          {
            if (!a) break;
            i && o(i);
            let e = c(i);
            if (!e) break;
            h(), await g(e);
            break;
          }
        case `cut`:
          {
            if (!a) break;
            i && o(i);
            let e = c(i);
            e && (h(), await g(e)), l();
            break;
          }
        case `paste`:
          {
            let t = await _();
            if (!t) break;
            if (i && a) {
              let n = e.replaceExpandedSelection(t, i);
              if (n) {
                s(n);
                break;
              }
            }
            if (i && o(i), typeof (document as any).execCommand == `function`) try {
              if ((document as any).execCommand(`insertText`, !1, t)) {
                syncActiveTextRangeFromDom();
                break;
              }
            } catch {}
            u(t);
            break;
          }
        case `image-bring-to-front`:
        case `image-bring-forward`:
        case `image-in-front-of-text`:
        case `image-send-to-back`:
        case `image-send-backward`:
        case `image-behind-text`:
        case `image-wrap-inline`:
        case `image-wrap-square`:
        case `image-wrap-tight`:
        case `image-wrap-through`:
        case `image-wrap-top-and-bottom`:
        case `image-wrap-behind-text`:
        case `image-wrap-in-front-of-text`:
        case `image-move-with-text`:
        case `image-fix-position-on-page`:
        case `image-edit-wrap-boundary`:
        case `image-more-layout-options`:
          {
            let n = d();
            if (!n) break;
            let r = wrapModeForAction(t);
            if (r) {
              e.setImageWrapMode(n.location, r, p(n, r));
              break;
            }
            if (t === `image-move-with-text` || t === `image-fix-position-on-page`) {
              let r = m(n, t === `image-move-with-text`);
              r && e.moveFloatingImage(n.location, r);
              break;
            }
            if (!n.image.floating) break;
            let i = n.image.floating,
              a = Number.isFinite(i.zIndex) ? clampNumber(Math.round(i.zIndex), IMAGE_ZINDEX_MIN, IMAGE_ZINDEX_MAX) : IMAGE_ZINDEX_DEFAULT,
              o;
            switch (t) {
              case `image-bring-to-front`:
                o = {
                  behindDocument: !1,
                  zIndex: IMAGE_ZINDEX_MAX
                };
                break;
              case `image-bring-forward`:
                o = {
                  behindDocument: !1,
                  zIndex: clampNumber(a + IMAGE_ZINDEX_STEP, IMAGE_ZINDEX_MIN, IMAGE_ZINDEX_MAX)
                };
                break;
              case `image-send-to-back`:
                o = {
                  behindDocument: !1,
                  zIndex: IMAGE_ZINDEX_MIN
                };
                break;
              case `image-send-backward`:
                o = {
                  behindDocument: !1,
                  zIndex: clampNumber(a - IMAGE_ZINDEX_STEP, IMAGE_ZINDEX_MIN, IMAGE_ZINDEX_MAX)
                };
                break;
              default:
                o = void 0;
                break;
            }
            o && e.moveFloatingImage(n.location, o);
            break;
          }
        default:
          break;
      }
      closeContextMenu();
    })();
  }, [closeContextMenu, vn, e, replaceSelectionWithText, selectionFromDom, runTableAction, syncActiveTextRangeFromDom, restoreSelectionAfterEdit]);

  // 原 删除键兜底 effect（jsx 30673-30706）
  React.useEffect(() => {
    let t = (t: any) => {
      if (k || t.defaultPrevented || !((t.key === `Backspace` || t.key === `Delete`) && !t.metaKey && !t.ctrlKey && !t.altKey && !t.shiftKey)) return;
      let n = t.target;
      if (n instanceof Element && isInteractiveElement(n)) return;
      let r = L.current,
        i = window.getSelection();
      if (!r || !i || i.rangeCount === 0) return;
      let a = i.getRangeAt(0);
      if (!r.contains(a.startContainer) || !r.contains(a.endContainer)) return;
      let o = domPointToBoundary(a.startContainer, a.startOffset),
        s = domPointToBoundary(a.endContainer, a.endOffset);
      if (!o || !s) return;
      let c = normalizeTextRange({
        start: o,
        end: s
      });
      if (compareTextPositions(c.start, c.end) >= 0) return;
      t.preventDefault(), t.stopPropagation(), restoreSelectionAfterEdit({
        start: {
          location: cloneLocationContract(c.start.location),
          offset: c.start.offset
        },
        end: {
          location: cloneLocationContract(c.start.location),
          offset: c.start.offset
        }
      });
      let l = e.deleteExpandedSelection(c);
      l && (be.current = void 0, R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(l));
    };
    return window.addEventListener(`keydown`, t, !0), () => {
      window.removeEventListener(`keydown`, t, !0);
    };
  }, [e, k, domPointToBoundary, restoreSelectionAfterEdit]);

  // 原 选择态守卫 effects（jsx 30707-30745）：
  // 图片失效/包裹镜像/图片互斥/首字下沉失效/包裹文本回灌/聚焦/选区同步
  React.useEffect(() => {
    if (!Pe) return;
    let {
        paragraph: t
      } = resolveLocationContract(e.model, paragraphLocationOfImage(Pe)),
      n = (t as any)?.children[Pe.childIndex];
    (!n || n.type !== `image`) && (Fe(void 0), Ke(void 0));
  }, [e.model, Pe]);
  React.useEffect(() => {
    We.current = He;
  }, [He]);
  React.useEffect(() => {
    !Pe && !Ie || (ze(void 0), Ve(void 0), Ye(void 0), Ue(void 0));
  }, [Pe, Ie]);
  React.useEffect(() => {
    if (Re === void 0) return;
    let t = e.model.nodes[Re];
    (!t || t.type !== `paragraph` || !dropCapOfParagraph(t as DocxParagraphNode)) && (ze(void 0), Ve(void 0), Ye(void 0));
  }, [e.model, Re]);
  React.useEffect(() => {
    if (!He) return;
    let t = resolveLocationContract(e.model, He.location).paragraph;
    if (!t) {
      Ue(void 0);
      return;
    }
    let n = paragraphEditText(t);
    n !== He.text && !He.isComposing && Ue((e: any) => e && e.locationKey === He.locationKey ? {
      ...e,
      text: n,
      selectionStart: Math.max(0, Math.min(e.selectionStart, n.length)),
      selectionEnd: Math.max(0, Math.min(e.selectionEnd, n.length))
    } : e);
  }, [He, e.model]);
  React.useEffect(() => {
    He && focusWrappedTextarea();
  }, [He, focusWrappedTextarea]);
  React.useEffect(() => {
    let e = Et.current,
      t = He;
    if (!e || !t) return;
    let n = Math.max(0, Math.min(t.selectionStart, e.value.length)),
      r = Math.max(n, Math.min(t.selectionEnd, e.value.length));
    try {
      (e.selectionStart !== n || e.selectionEnd !== r) && e.setSelectionRange(n, r);
    } catch {}
  }, [He]);

  /* ---------- 光标导航面（jsx 30747-30923） ---------- */

  // 原 za（jsx 30747）：段落按偏移聚焦（rAF 重试）
  const focusParagraphAtOffset = React.useCallback((e: any, t: any) => {
    let n = (r: any) => {
      let i = paragraphHostAtOffset(e, t);
      if (!i || !i.isConnected) {
        r < 6 && window.requestAnimationFrame(() => {
          n(r + 1);
        });
        return;
      }
      try {
        i.focus({
          preventScroll: !0
        });
      } catch {
        i.focus();
      }
      let a = Math.max(0, Math.min(Math.round(t), i.textContent?.length ?? 0));
      setTextRangeInElement(i, a, a);
      let o = window.getSelection(),
        s = o && o.rangeCount > 0 ? o.getRangeAt(0) : void 0;
      !(s && i.contains(s.startContainer) && i.contains(s.endContainer)) && r < 6 && window.requestAnimationFrame(() => {
        n(r + 1);
      });
    };
    window.requestAnimationFrame(() => {
      n(0);
    });
  }, [paragraphHostAtOffset, setTextRangeInElement]);

  // 原 Ba（jsx 30776）：表格单元格段落聚焦
  const focusTableCellParagraph = React.useCallback((e: any, t: any, n: any) => {
    window.requestAnimationFrame(() => {
      let r = ae.current.get(e);
      if (!r) return;
      let i = r.querySelector(`[data-docx-table-paragraph-index="${t}"]`);
      if (!i) {
        r.focus();
        return;
      }
      r.focus();
      let a = Math.max(0, Math.min(Math.round(n), i.textContent?.length ?? 0));
      setTextRangeInElement(i, a, a);
    });
  }, [setTextRangeInElement]);

  // 原 Va（jsx 30789）：位置按偏移聚焦（段落/单元格分派）
  const focusLocationAtOffset = React.useCallback((e: any, t: any) => {
    if (e.kind === `paragraph`) {
      focusParagraphAtOffset(e.nodeIndex, t);
      return;
    }
    focusTableCellParagraph(`${e.tableIndex}:${e.rowIndex}:${e.cellIndex}`, e.paragraphIndex, t);
  }, [focusParagraphAtOffset, focusTableCellParagraph]);

  // 原 Ha（jsx 30793）：位置内点光标放置（命中回退偏移）
  const placeCaretAtPointInLocation = React.useCallback((t: any, n: any, r: any) => {
    let i = resolveLocationHostElement(t);
    if (!i) return !1;
    let a = i.getBoundingClientRect();
    if (!Number.isFinite(a.left) || !Number.isFinite(a.right) || !Number.isFinite(a.top) || !Number.isFinite(a.bottom) || a.width <= 0 || a.height <= 0) return !1;
    let o = boundaryAtPoint({
      x: Math.max(a.left + 1, Math.min(n.x, a.right - 1)),
      y: Math.max(a.top + 1, Math.min(n.y, a.bottom - 1))
    });
    if (o && sameLocationContract(t, locationBaseContract(o.location))) return applyDomSelection(o, o), !0;
    let s = resolveLocationContract(e.model, t).paragraph,
      c = s ? paragraphTextContract(s).length : textLengthOfElement(i),
      l = Math.max(0, Math.min(Math.round(r), c)),
      u = {
        location: cloneLocationContract(t),
        offset: l
      };
    return applyDomSelection(u, u), !0;
  }, [e.model, textLengthOfElement, boundaryAtPoint, resolveLocationHostElement, applyDomSelection]);

  // 原 Ua（jsx 30813）：段落末尾聚焦
  const focusParagraphEnd = React.useCallback((e: any) => {
    window.requestAnimationFrame(() => {
      let t = te.current.get(e);
      if (!t) return;
      t.focus();
      let n = window.getSelection();
      if (!n) return;
      let r = document.createRange();
      r.selectNodeContents(t), r.collapse(!1), n.removeAllRanges(), n.addRange(r);
    });
  }, []);

  // 原 Wa（jsx 30824）：宿主内选区偏移（编号标签剔除）
  const selectionOffsetsInHost = React.useCallback((e: any) => {
    let t = window.getSelection();
    if (!t || t.rangeCount === 0) return;
    let n = t.getRangeAt(0);
    if (!(!e.contains(n.startContainer) || !e.contains(n.endContainer))) try {
      let t = (e: any) => {
          let t = e.cloneContents();
          return t.querySelectorAll(`[data-docx-numbering-label='true']`).forEach((e: any) => {
            e.remove();
          }), t.textContent?.length ?? 0;
        },
        r = document.createRange();
      r.setStart(e, 0), r.setEnd(n.startContainer, n.startOffset);
      let i = document.createRange();
      i.setStart(e, 0), i.setEnd(n.endContainer, n.endOffset);
      let a = t(r),
        o = t(i);
      return {
        start: Math.min(a, o),
        end: Math.max(a, o)
      };
    } catch {
      return;
    }
  }, []);

  // 原 Ga（jsx 30851）：折叠光标像素点（矩形回退）
  const caretPointOfCollapsed = React.useCallback((e: any) => {
    let t = window.getSelection();
    if (!t || t.rangeCount === 0 || !t.isCollapsed) return;
    let n = t.getRangeAt(0).cloneRange();
    n.collapse(!0);
    let r = n.getClientRects().item(0) ?? n.getBoundingClientRect();
    if (Number.isFinite(r.left) && Number.isFinite(r.top) && Number.isFinite(r.width) && Number.isFinite(r.height) && ((r.width ?? 0) > 0 || (r.height ?? 0) > 0)) return {
      x: r.left + Math.max(1, Math.min(2, r.width || 1)),
      y: r.top + Math.max(1, (r.height || 0) / 2)
    };
    let i = e.getBoundingClientRect();
    if (!(!Number.isFinite(i.left) || !Number.isFinite(i.top) || i.width <= 0 || i.height <= 0)) return {
      x: i.left + 1,
      y: i.top + Math.max(1, Math.min(i.height - 1, i.height / 2))
    };
  }, []);

  // 原 Ka（jsx 30866）：选区下表格段落元素解析
  const tableParagraphUnderSelection = React.useCallback((e: any) => {
    let t = window.getSelection();
    if (!t) return;
    let n = [t.anchorNode, t.focusNode];
    for (let t of n) {
      if (!t) continue;
      let n = (t instanceof Element ? t : t.parentElement)?.closest(`[data-docx-table-paragraph-index]`);
      if (!n || !e.contains(n)) continue;
      let r = n.getAttribute(`data-docx-table-paragraph-index`),
        i = r ? Number.parseInt(r, 10) : NaN;
      if (!(!Number.isFinite(i) || i < 0)) return {
        paragraphElement: n,
        paragraphIndex: Math.max(0, Math.round(i))
      };
    }
  }, []);

  // 原 qa（jsx 30884）：表格单元格文本范围同步（格内限定）
  const syncTableCellTextRange = React.useCallback((t: any, n: any, r: any, i: any) => {
    let a = window.getSelection();
    if (!a || a.rangeCount === 0) {
      e.setActiveTextRange(void 0);
      return;
    }
    let o = a.getRangeAt(0);
    if (!t.contains(o.startContainer) && !t.contains(o.endContainer)) {
      e.setActiveTextRange(void 0);
      return;
    }
    let s = domPointToBoundary(o.startContainer, o.startOffset),
      c = domPointToBoundary(o.endContainer, o.endOffset);
    !s || !c || s.location.kind === `table-cell` && c.location.kind === `table-cell` && s.location.tableIndex === n && s.location.rowIndex === r && s.location.cellIndex === i && c.location.tableIndex === n && c.location.rowIndex === r && c.location.cellIndex === i && (clearTableSelection(), e.setActiveTextRange({
      start: s,
      end: c
    }));
  }, [clearTableSelection, e, domPointToBoundary]);

  // 原 Ja（jsx 30902）：段落文本范围同步
  const syncParagraphTextRange = React.useCallback((t: any, n: any) => {
    let r = window.getSelection();
    if (!r || r.rangeCount === 0) {
      e.setActiveTextRange(void 0);
      return;
    }
    let i = r.getRangeAt(0);
    if (!t.contains(i.startContainer) || !t.contains(i.endContainer)) {
      !t.contains(i.startContainer) && !t.contains(i.endContainer) && e.setActiveTextRange(void 0);
      return;
    }
    let a = selectionOffsetsInHost(t);
    a && (clearTableSelection(), e.setActiveTextRange({
      start: {
        location: n,
        offset: a.start
      },
      end: {
        location: n,
        offset: a.end
      }
    }));
  }, [clearTableSelection, e, selectionOffsetsInHost]);

  /* ---------- 草稿面（jsx 30924-30942 起） ---------- */

  // 原 Ya（jsx 30924）：表格单元格草稿提交（签名比对）
  const commitTableCellDraft = React.useCallback((t: any, n: any, r: any, i: any, a: any, o: any) => {
    let s = elementToClipboardText(o),
      c = o.innerHTML;
    if (s === cellParagraphsSignature(i)) {
      R.current.delete(a);
      return;
    }
    R.current.set(a, c), e.suppressNextDomSelectionRestore(), e.commitTableCellText(t, n, r, s);
  }, [e]);

  // 原 Xa（jsx 30935）：单元格草稿宿主登记
  const registerCellDraftElement = React.useCallback((e: any, t: any) => {
    t ? W.current.set(e, t) : W.current.delete(e);
  }, []);

  // 原 Za（jsx 30938）：单元格段落草稿元素读取
  const cellParagraphDraftElement = React.useCallback((e: any) => ee.current.get(e), []);

  // 原 Qa（jsx 30939）：单元格段落草稿元素登记
  const registerCellParagraphDraftElement = React.useCallback((e: any, t: any) => {
    ee.current.set(e, t), Fn();
  }, [Fn]);

  // 原 eo（jsx 30941）：单元格段落草稿元素注销
  const unregisterCellParagraphDraftElement = React.useCallback((e: any) => {
    ee.current.delete(e), Fn();
  }, [Fn]);

  // 原 no（jsx 30943）：单元格段落草稿提交（文本一致即丢弃）
  const commitCellParagraphDraft = React.useCallback((t: any, n: any, r: any, i: any, a: any) => {
    let o = cellParagraphDraftKey(t, n, r, i),
      s = e.model.nodes[t];
    if (!s || s.type !== `table`) return;
    let c = (s as any).rows[n]?.cells[r];
    if (!c) return;
    let l = cellParagraphs(c.nodes)[i];
    if (l && paragraphTextContract(l) === a) {
      ee.current.delete(o);
      return;
    }
    e.suppressNextDomSelectionRestore(), e.commitTableCellParagraphTextRecursive(t, n, r, i, a);
  }, [e]);

  // 原 ao（jsx 30957）：节区段落草稿宿主登记
  const registerSectionDraftElement = React.useCallback((e: any, t: any) => {
    t ? oe.current.set(e, t) : oe.current.delete(e);
  }, []);

  // 原 oo（jsx 30960）：节区段落草稿读取
  const sectionParagraphDraft = React.useCallback((e: any) => H.current.get(e), []);

  // 原 so（jsx 30961）：节区段落草稿写入
  const setSectionParagraphDraft = React.useCallback((e: any, t: any) => {
    H.current.set(e, t);
  }, []);

  // 原 co（jsx 30963）：节区段落草稿删除
  const deleteSectionParagraphDraft = React.useCallback((e: any) => {
    H.current.delete(e);
  }, []);

  // 原 lo（jsx 30965）：节区段落草稿提交（一致即丢弃）
  const commitSectionParagraphDraft = React.useCallback((t: any, n: any) => {
    let r = sectionParagraphDraftKey(t);
    if ((t.region === `header` ? [(e.model.metadata as any).headerSections ?? [], ...((e.model.metadata as any).sections?.map((e: any) => e.headerSections ?? []) ?? [])] : [(e.model.metadata as any).footerSections ?? [], ...((e.model.metadata as any).sections?.map((e: any) => e.footerSections ?? []) ?? [])]).flat().filter((e: any) => e.partName === t.partName).map((e: any) => sectionNodeTextAt(e.nodes, {
      nodeIndex: t.nodeIndex,
      rowIndex: t.rowIndex,
      cellIndex: t.cellIndex,
      paragraphIndex: t.paragraphIndex
    })).find((e: any) => typeof e == `string`) === n) {
      H.current.delete(r);
      return;
    }
    e.commitSectionParagraphText(t, n);
  }, [e]);

  // 原 uo（jsx 30980）：节区段落草稿捕获（元素 → innerHTML）
  const captureSectionParagraphDraft = React.useCallback((e: any) => {
    if (!(e instanceof Element)) return;
    let t = e.closest(`[data-docx-section-paragraph-key]`);
    if (!t) return;
    let n = t.getAttribute(`data-docx-section-paragraph-key`);
    n && H.current.set(n, t.innerHTML);
  }, []);

  // 原 fo（jsx 30986）：节区草稿批量提交（区域/部件过滤）
  const flushSectionParagraphDrafts = React.useCallback((e: any, t: any, n: any) => {
    Array.from(e.querySelectorAll(`[data-docx-section-paragraph-key]`)).forEach((e: any) => {
      let r = e.getAttribute(`data-docx-section-paragraph-key`);
      if (!r) return;
      let i = parseSectionDraftKey(r);
      if (!i || i.region !== t || i.partName !== n) return;
      let a = elementToPlainText(e);
      H.current.set(r, e.innerHTML), commitSectionParagraphDraft(i, a);
    });
  }, [commitSectionParagraphDraft]);

  // 原 po（jsx 30996）：页眉/页脚会话结束（草稿冲刷 + 状态复位）
  function finishHeaderFooterSession(e: any) {
    let t = e.region === `header` ? K.current.get(e.pageIndex) : ce.current.get(e.pageIndex);
    t && flushSectionParagraphDrafts(t, e.region, e.partName), xn((t: any) => t && t.region === e.region && t.partName === e.partName && t.pageIndex === e.pageIndex ? void 0 : t), Le(void 0), qe(void 0), pe.current = void 0;
  }

  // 原 ho（jsx 31001）：页眉/页脚会话结束调度（rAF 合并）
  function endHeaderFooterSession(e: any) {
    if (typeof window > `u` || typeof window.requestAnimationFrame != `function`) {
      finishHeaderFooterSession(e);
      return;
    }
    Y.current !== null && typeof window.cancelAnimationFrame == `function` && window.cancelAnimationFrame(Y.current), Y.current = window.requestAnimationFrame(() => {
      Y.current = null, finishHeaderFooterSession(e);
    });
  }

  // 原 导出前草稿落模型 effect（jsx 31010-31071）：
  // 单元格/单元格段落/节区段落草稿 → 模型变换登记
  React.useEffect(() => (e.registerPendingExportModelTransformer((t: any) => {
    if (R.current.size === 0 && ee.current.size === 0 && H.current.size === 0) return t;
    let n = t,
      r = cloneRunStyleContract(e.pendingRunStyle),
      i: string[] = [],
      a: string[] = [],
      o: string[] = [];
    return ee.current.forEach((e: any, t: any) => {
      let i = W.current.get(t);
      if (!i && typeof e != `string`) return;
      a.push(t);
      let [o, s, c, l] = t.split(`:`),
        u = Number.parseInt(o ?? ``, 10),
        d = Number.parseInt(s ?? ``, 10),
        f = Number.parseInt(c ?? ``, 10),
        p = Number.parseInt(l ?? ``, 10);
      if (!Number.isFinite(u) || !Number.isFinite(d) || !Number.isFinite(f) || !Number.isFinite(p)) return;
      let m = n.nodes[u];
      if (!m || m.type !== `table`) return;
      let h = m.rows[d]?.cells[f];
      if (!h) return;
      let g = cellParagraphs(h.nodes)[p];
      if (!g) return;
      let _ = i ? elementToPlainText(i) : htmlToPlainText(e);
      _ !== paragraphTextContract(g) && (n = replaceCellParagraphText(n, u, d, f, p, _, {
        insertedStyle: r
      }));
    }), R.current.forEach((e: any, t: any) => {
      let a = ae.current.get(t);
      if (!a && typeof e != `string`) return;
      i.push(t);
      let [o, s, c] = t.split(`:`),
        l = Number.parseInt(o ?? ``, 10),
        u = Number.parseInt(s ?? ``, 10),
        d = Number.parseInt(c ?? ``, 10);
      if (!Number.isFinite(l) || !Number.isFinite(u) || !Number.isFinite(d)) return;
      let f = n.nodes[l];
      if (!f || f.type !== `table`) return;
      let p = f.rows[u]?.cells[d];
      if (!p) return;
      let m = a ? elementToClipboardText(a) : htmlToClipboardText(e);
      m !== cellParagraphsSignature(cellParagraphArray(p.nodes)) && (n = replaceCellTextContract(n, l, u, d, m, {
        insertedStyle: r
      }));
    }), H.current.forEach((e: any, t: any) => {
      let i = oe.current.get(t),
        a = parseSectionDraftKey(t);
      if (!a || !i && typeof e != `string`) return;
      o.push(t);
      let s = i ? elementToPlainText(i) : htmlToPlainText(e);
      n = replaceSectionParagraphText(n, a, s, {
        insertedStyle: r
      });
    }), i.forEach(e => {
      R.current.delete(e);
    }), a.forEach(e => {
      ee.current.delete(e);
    }), o.forEach(e => {
      H.current.delete(e);
    }), n;
  }), () => {
    e.registerPendingExportModelTransformer(void 0);
  }), [e, e.pendingRunStyle]);

  /* ---------- 撤销/输入面（jsx 31073-31340） ---------- */

  // 原 _o（jsx 31073）：撤销/重做按键（flushSync 同步）
  const handleUndoRedoKeys = React.useCallback((t: any, n: any) => {
    if (t.defaultPrevented || !(t.metaKey || t.ctrlKey) || t.altKey) return !1;
    let r = t.key.toLowerCase(),
      i = r === `z` && !t.shiftKey,
      a = r === `y` || r === `z` && t.shiftKey;
    return !i && !a ? !1 : (t.preventDefault(), t.stopPropagation(), flushSyncContract(() => {
      n();
    }), a ? e.redo() : e.undo(), !0);
  }, [e]);

  // 原 vo（jsx 31083）：beforeinput 编辑分派（段落/表格单元格双路径）
  const handleBeforeInput = React.useCallback((t: any) => {
    if (k || t.isComposing || xe.current) return;
    let n = t.target instanceof Element ? t.target : t.target instanceof Node ? t.target.parentElement : null;
    if (!n || n.closest(`textarea, input`) || n.closest(`[data-docx-header-footer-region]`)) return;
    let r = classifyBeforeInput({
      inputType: t.inputType,
      data: t.data,
      dataTransferText: t.dataTransfer?.getData(`text/plain`)
    });
    if (!r) return;
    let i = (e: any) => {
        let n = typeof t.getTargetRanges == `function` ? t.getTargetRanges()[0] : void 0;
        return n ? domRangeToOffsets(e, n) : void 0;
      },
      a = n.closest(`[data-docx-paragraph-host='true'][data-docx-paragraph-kind='paragraph']`);
    if (a) {
      if (!a.isContentEditable) return;
      let n = a.getAttribute(`data-docx-paragraph-node-index`),
        o = n == null ? NaN : Number.parseInt(n, 10),
        s = Number.isFinite(o) ? e.model.nodes[o] : void 0;
      if (!s || s.type !== `paragraph` || (t.preventDefault(), cancelPointerSession(), r.kind === `blocked`)) return;
      if (r.kind === `historyUndo`) {
        e.undo();
        return;
      }
      if (r.kind === `historyRedo`) {
        e.redo();
        return;
      }
      let c = {
          kind: `paragraph`,
          nodeIndex: o
        },
        l = `p:${o}`,
        u = elementToPlainText(a),
        d = be.current,
        f = !!(d && d.key === l && d.text !== u),
        p = f && d ? d.text : u,
        m = f && d ? {
          start: d.caret,
          end: d.caret
        } : selectionOffsetsInHost(a);
      if (!m) {
        let t = e.activeTextRange ? normalizeTextRange(e.activeTextRange) : void 0;
        if (t && sameLocationContract(t.start.location, c as DocxLocation) && sameLocationContract(t.end.location, c as DocxLocation)) {
          let e = Math.max(0, Math.min(Math.round(t.start.offset), p.length));
          m = {
            start: e,
            end: Math.max(e, Math.min(Math.round(t.end.offset), p.length))
          };
        }
      }
      if (m ||= {
        start: p.length,
        end: p.length
      }, r.kind === `insertParagraph`) {
        be.current = void 0;
        let t = Math.max(0, Math.min(m.start, p.length)),
          n = Math.max(t, Math.min(m.end, p.length));
        if (R.current.clear(), ee.current.clear(), paragraphIsListItem(s, p)) {
          let r = e.insertListItemAfterSelection(p, t, n, c as DocxLocation);
          r !== void 0 && focusParagraphAtOffset(r.paragraphIndex, r.caretOffset);
          return;
        }
        let r = e.splitParagraphAtSelection(p, t, n, c as DocxLocation);
        r !== void 0 && focusParagraphAtOffset(r.paragraphIndex, r.caretOffset);
        return;
      }
      if (r.kind === `deleteContent` || r.kind === `deleteRange`) {
        let t = e.activeTextRange ? normalizeTextRange(e.activeTextRange) : void 0;
        if (t && compareTextPositions(t.start, t.end) < 0 && !(sameLocationContract(t.start.location, c as DocxLocation) && sameLocationContract(t.end.location, c as DocxLocation)) && t) {
          be.current = void 0;
          let n = e.deleteExpandedSelection(t);
          n && (R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(n));
          return;
        }
      }
      let h = !f && (r.kind === `insertText` || r.kind === `replaceText` || r.kind === `insertLineBreak` || r.kind === `deleteContent` || r.kind === `deleteRange`) ? i(a) ?? m : m,
        g = applyInputEdit(p, h.start, h.end, r);
      if (!g) {
        if (r.kind === `deleteContent` && h.start === h.end) {
          if (r.direction === `backward` && h.start === 0) {
            be.current = void 0;
            let t;
            for (let n = o - 1; n >= 0; --n) {
              let r = previousEditableParagraphLocation(e.model, n);
              if (r) {
                t = r;
                break;
              }
            }
            let n = t ? resolveLocationContract(e.model, t).paragraph : void 0;
            if (t && n) {
              let r = e.deleteExpandedSelection({
                start: {
                  location: cloneLocationContract(t),
                  offset: paragraphTextContract(n).length
                },
                end: {
                  location: cloneLocationContract(c as DocxLocation),
                  offset: 0
                }
              });
              r && restoreSelectionAfterEdit(r);
            }
            return;
          }
          if (r.direction === `forward` && h.start >= p.length) {
            be.current = void 0;
            let t = nextEditableParagraphLocation(e.model, c as DocxLocation),
              n = t ? resolveLocationContract(e.model, t).paragraph : void 0;
            if (t && n) {
              let n = e.deleteExpandedSelection({
                start: {
                  location: cloneLocationContract(c as DocxLocation),
                  offset: p.length
                },
                end: {
                  location: cloneLocationContract(t),
                  offset: 0
                }
              });
              n && restoreSelectionAfterEdit(n);
            }
            return;
          }
        }
        return;
      }
      let _ = coalesceSuffixForInput(r);
      e.commitParagraphTextAtRange(c as DocxLocation, g.text, {
        start: g.caret,
        end: g.caret
      }, {
        insertionOffset: h.start,
        ...(_ ? {
          coalesceKey: `p:${o}:${_}`
        } : void 0)
      }), be.current = {
        key: l,
        text: g.text,
        caret: g.caret
      }, ve.current = {
        nodeIndex: o,
        start: g.caret,
        end: g.caret
      }, Pn();
      return;
    }
    let o = n.closest(`[data-docx-cell-key]`);
    if (!o || !o.isContentEditable) return;
    let s = /^cell-(\d+)-(\d+)-(\d+)$/.exec(o.getAttribute(`data-docx-cell-key`) ?? ``);
    if (!s) return;
    let c = Number.parseInt(s[1], 10),
      l = Number.parseInt(s[2], 10),
      u = Number.parseInt(s[3], 10),
      d = e.model.nodes[c];
    if (!d || d.type !== `table`) return;
    let f = (d as any).rows[l]?.cells[u];
    if (!f || f.nodes.some((e: any) => e.type === `table`) || (t.preventDefault(), cancelPointerSession(), r.kind === `blocked`)) return;
    if (r.kind === `historyUndo`) {
      e.undo();
      return;
    }
    if (r.kind === `historyRedo`) {
      e.redo();
      return;
    }
    let p = cellParagraphArray(f.nodes),
      m = tableParagraphUnderSelection(o),
      h = be.current,
      g = `c:${c}:${l}:${u}:`,
      _ = !1,
      v = m?.paragraphIndex,
      y = m?.paragraphElement;
    if (h && h.key.startsWith(g)) {
      let e = Number.parseInt(h.key.slice(g.length), 10),
        t = Number.isFinite(e) ? o.querySelector(`[data-docx-table-paragraph-index='${e}']`) ?? void 0 : void 0;
      t && h.text !== elementToPlainText(t) && (_ = !0, v = e, y = t);
    }
    let b;
    if (v === void 0 || !y) {
      let t = e.activeTextRange ? normalizeTextRange(e.activeTextRange) : void 0,
        n = t?.start.location;
      if (t && n && n.kind === `table-cell` && n.tableIndex === c && n.rowIndex === l && n.cellIndex === u && sameLocationContract(n, t.end.location)) {
        let e = o.querySelector(`[data-docx-table-paragraph-index='${n.paragraphIndex}']`) ?? void 0;
        e && (v = n.paragraphIndex, y = e, b = {
          start: Math.max(0, Math.round(t.start.offset)),
          end: Math.max(0, Math.round(t.end.offset))
        });
      }
    }
    if (v === void 0 || !y || !p[v]) return;
    let x = {
        kind: `table-cell`,
        tableIndex: c,
        rowIndex: l,
        cellIndex: u,
        paragraphIndex: v
      } as DocxLocation,
      S = _ && h ? h.text : elementToPlainText(y as HTMLElement),
      C = _ && h ? {
        start: h.caret,
        end: h.caret
      } : b ?? selectionOffsetsInHost(y) ?? {
        start: S.length,
        end: S.length
      };
    if (r.kind === `deleteContent` || r.kind === `deleteRange`) {
      let t = e.activeTextRange ? normalizeTextRange(e.activeTextRange) : void 0;
      if (t && compareTextPositions(t.start, t.end) < 0 && !(sameLocationContract(t.start.location, x) && sameLocationContract(t.end.location, x)) && t) {
        be.current = void 0;
        let n = e.deleteExpandedSelection(t);
        n && (R.current.clear(), ee.current.clear(), restoreSelectionAfterEdit(n));
        return;
      }
    }
    let w: any = r.kind === `insertParagraph` ? {
        kind: `insertLineBreak`
      } : r,
      T = !_ && (w.kind === `insertText` || w.kind === `replaceText` || w.kind === `insertLineBreak` || w.kind === `deleteContent` || w.kind === `deleteRange`) ? i(y) ?? C : C,
      E = applyInputEdit(S, T.start, T.end, w as any);
    if (!E) {
      if (w.kind === `deleteContent` && T.start === T.end) {
        let t = p.map((e: any, t: any) => t === v ? S : paragraphTextContract(e)),
          n = w.direction === `backward` && T.start === 0 ? v : w.direction === `forward` && T.start >= S.length ? v + 1 : void 0,
          r = n === void 0 ? void 0 : mergeCellParagraphDelete(t, n);
        r && (be.current = void 0, e.commitTableCellTextAtRange(c, l, u, r.cellText, {
          paragraphIndex: r.caretParagraphIndex,
          start: r.caretOffset,
          end: r.caretOffset
        }), Pn());
      }
      return;
    }
    let D = coalesceSuffixForInput(w as any);
    e.commitParagraphTextAtRange(x as DocxLocation, E.text, {
      start: E.caret,
      end: E.caret
    }, {
      insertionOffset: T.start,
      ...(D ? {
        coalesceKey: `${g}${v}:${D}`
      } : void 0)
    }), be.current = {
      key: `${g}${v}`,
      text: E.text,
      caret: E.caret
    }, Pn();
  }, [tableParagraphUnderSelection, cancelPointerSession, e, focusParagraphAtOffset, k, Pn, selectionOffsetsInHost, restoreSelectionAfterEdit]);

  // 原 beforeinput 监听 effect（jsx 31334-31340）
  React.useEffect(() => {
    let e = L.current;
    if (!e) return;
    let t = (e: any) => {
      handleBeforeInput(e);
    };
    return e.addEventListener(`beforeinput`, t), () => {
      e.removeEventListener(`beforeinput`, t);
    };
  }, [handleBeforeInput]);

  /* ---------- 表格几何面（jsx 31341-31450） ---------- */

  // 原 yo（jsx 31341）：渲染列宽解析（覆盖 > 网格 > 缺省）
  const resolveColumnWidthsRender = React.useCallback((e: any, t: any, n: any) => {
    let r = tableGridColumnCount(t),
      i = columnWidthOverridesA[e];
    if (i && i.length === r) return normalizeColumnWidths(i, r, n, 1);
    let a = tableGridColumnsCached(t, r);
    return a && a.length > 0 ? normalizeColumnWidths(a.map(e => twipsToPxRounded(e) ?? 0), r, n, 1) : defaultColumnWidths(r, n);
  }, [columnWidthOverridesA]);

  // 原 bo（jsx 31346）：渲染行高解析（预览 > 模型 twips）
  const resolveRowHeightsRender = React.useCallback((e: any, t: any) => {
    let n = rowHeightPreviewA[e];
    return t.rows.map((e: any, t: any) => {
      let r = n?.[t];
      if (Number.isFinite(r) && r > 0) return Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(r));
      let i = twipsToPxRounded(e.style?.heightTwips);
      if (Number.isFinite(i) && (i as number) > 0) return Math.max(MIN_BLOCK_HEIGHT_PX, i as number);
    });
  }, [rowHeightPreviewA]);

  // 原 xo（jsx 31352）：草稿列宽解析
  const resolveColumnWidthsDraft = React.useCallback((e: any, t: any, n: any) => {
    let r = tableGridColumnCount(t),
      i = columnWidthOverridesB[e];
    if (i && i.length === r) return normalizeColumnWidths(i, r, n, 1);
    let a = tableGridColumnsCached(t, r);
    return a && a.length > 0 ? normalizeColumnWidths(a.map(e => twipsToPxRounded(e) ?? 0), r, n, 1) : defaultColumnWidths(r, n);
  }, [columnWidthOverridesB]);

  // 原 So（jsx 31359）：草稿行高解析
  const resolveRowHeightsDraft = React.useCallback((e: any, t: any) => {
    let n = rowHeightPreviewB[e];
    return t.rows.map((e: any, t: any) => {
      let r = n?.[t];
      if (Number.isFinite(r) && r > 0) return Math.max(MIN_BLOCK_HEIGHT_PX, Math.round(r));
      let i = twipsToPxRounded(e.style?.heightTwips);
      if (Number.isFinite(i) && (i as number) > 0) return Math.max(MIN_BLOCK_HEIGHT_PX, i as number);
    });
  }, [rowHeightPreviewB]);

  // 原 表格行高测量回灌 layoutEffect（jsx 31374-31450）：
  // 可见行实测高（去缩放）→ 估算兜底 → blockId 签名合并
  React.useLayoutEffect(() => {
    if (Rt) {
      ft((e: any) => Object.keys(e).length === 0 ? e : {});
      return;
    }
    if (!measurementPassActive || Date.now() < Mn.current) return;
    let t = L.current,
      n = resolveZoomScale(t, resolvedZoomScale),
      r: Record<number, number[]> = {};
    e.model.nodes.forEach((t: any, i: any) => {
      if (t.type !== `table`) return;
      let a = visibleTableRowIndexes.get(i);
      if (!a || a.size === 0) return;
      let o = new Map<number, number>(),
        s = (e: any, r: any) => {
          let i = Math.max(0, Math.round(e));
          if (i >= t.rows.length || !a.has(i)) return;
          let s = normalizeMeasuredHeight(Number.isFinite(n) && n > 0 ? r / n : r),
            c = o.get(i);
          o.set(i, c === void 0 ? s : Math.max(c, s));
        },
        c = G.current.get(i);
      if (c && Array.from(c.querySelectorAll(`tr[data-docx-table-index='${i}'][data-docx-row-index]`) as NodeListOf<Element>).forEach(e => {
        if (e.getAttribute(`data-docx-row-sliced`) === `true`) return;
        let t = Number.parseInt(e.getAttribute(`data-docx-row-index`) ?? ``, 10);
        Number.isFinite(t) && s(t, e.getBoundingClientRect().height);
      }), (L.current ?? document).querySelectorAll(`[data-docx-table-cell='true'][data-docx-table-index='${i}'][data-docx-row-index]`).forEach((e: Element) => {
        if (e.getAttribute(`data-docx-row-sliced`) === `true` || e.closest(`tr`)?.getAttribute(`data-docx-row-sliced`) === `true`) return;
        let t = Number.parseInt(e.getAttribute(`data-docx-row-index`) ?? ``, 10);
        if (!Number.isFinite(t)) return;
        let n = e.closest(`tr`);
        n && s(t, n.getBoundingClientRect().height);
      }), o.size === 0) return;
      let l = estimateTableRowHeights(t, Kn.get(i), e.model.metadata.numberingDefinitions, Gn.get(i), qn.get(i)),
        u = t.blockId ? dt[t.blockId]?.rowHeightsPx : void 0;
      r[i] = t.rows.map((e: any, t: any) => {
        let n = o.get(t);
        if (n !== void 0) return n;
        let r = u?.[t];
        return normalizeMeasuredHeight(Number.isFinite(r) && r > 0 ? r : l[t] ?? MIN_BLOCK_HEIGHT_PX);
      });
    }), ft((t: any) => {
      let n = !1,
        i: Record<string, any> = {},
        a = new Map<string, any>(),
        o = new Map<number, string>();
      return e.model.nodes.forEach((e: any, t: any) => {
        e.type === `table` && e.blockId && (a.set(e.blockId, e), o.set(t, e.blockId));
      }), Object.entries(t).forEach(([e, t]) => {
        let r = a.get(e);
        if (!r || !Array.isArray((t as any).rowHeightsPx) || (t as any).rowHeightsPx.length !== r.rows.length) {
          n = !0;
          return;
        }
        i[e] = t;
      }), Object.entries(r).forEach(([e, t]) => {
        let r = Number.parseInt(e, 10),
          s = o.get(r),
          c = s ? a.get(s) : void 0;
        if (!s || !c) return;
        let l = metadataIdentityHash(c),
          u = i[s],
          d = u?.rowHeightsPx ?? [],
          f = d.length !== t.length;
        if (!f) {
          for (let e = 0; e < t.length; e += 1) if (d[e] !== t[e]) {
            f = !0;
            break;
          }
        }
        (f || u?.contentSignature !== l) && (i[s] = {
          rowHeightsPx: t,
          contentSignature: l
        }, n = !0);
      }), n ? i : t;
    });
  }, [Rt, Gn, e.model.metadata.numberingDefinitions, e.model.nodes, Kn, measurementPassActive, En, resolveZoomScale, dt, columnWidthOverridesA, rowHeightPreviewA, Sn, resolvedZoomScale, visibleTableRowIndexes]);

  /* ---------- 缩放面（jsx 31451-31872） ---------- */

  // 原 Co（jsx 31451）：行高缩放归一（下限 24）
  const normalizeRowHeightsForResize = React.useCallback((e: any) => e.map((e: any) => typeof e != `number` || !Number.isFinite(e) || e <= 0 ? 24 : Math.max(24, Math.round(e))), []);

  // 原 wo（jsx 31453）：行高按总高分配（余量逐格摊平）
  const distributeRowHeights = React.useCallback((e: any, t: any) => {
    let n = e.length;
    if (n === 0) return [];
    let r = 24 * n,
      i = Math.max(r, Math.round(t)),
      a = e.reduce((e: any, t: any) => e + Math.max(24, t), 0);
    if (!Number.isFinite(a) || a <= 0) {
      let e = Math.floor(i / n);
      return Array.from({
        length: n
      }, () => e);
    }
    let o = e.map((e: any) => Math.max(24, Math.round(e / a * i))),
      s = i - o.reduce((e: any, t: any) => e + t, 0);
    if (s !== 0) {
      let e = 0;
      for (; s !== 0 && e < n * 4;) {
        for (let e = 0; e < o.length && s !== 0; e += 1) {
          if (s > 0) {
            o[e] += 1, --s;
            continue;
          }
          o[e] > 24 && (--o[e], s += 1);
        }
        e += 1;
      }
    }
    return o;
  }, []);

  // 原 To（jsx 31479）：列宽缩放（指针捕获 + 相邻列互补）
  const beginColumnResize = React.useCallback((e: any, t: any, n: any, r: any, i: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), !Number.isFinite(r) || r <= 0)) return;
    let a = e.currentTarget,
      o = e.pointerId;
    if (a.setPointerCapture) try {
      a.setPointerCapture(o);
    } catch {}
    let s = Math.max(0, Math.min(n, i.length - 2)),
      c = normalizeColumnWidths(i, i.length, r, 1),
      l = c[s] ?? 0,
      u = l + (c[s + 1] ?? 0);
    if (u <= 0) return;
    let d = e.clientX,
      f = c,
      p: number | undefined;
    setColumnResizeSession({
      tableIndex: t,
      boundaryColumnIndex: s
    });
    let m = () => {
        setColumnWidthOverridesA((e: any) => ({
          ...e,
          [t]: f
        }));
      },
      h = (e: any) => {
        let t = e.clientX - d,
          n = Math.max(8, Math.min(l + t, u - 8)),
          r = u - n;
        f = c.map((e: any, t: any) => t === s ? n : t === s + 1 ? r : e), p !== void 0 && window.cancelAnimationFrame(p), p = window.requestAnimationFrame(m);
      },
      g = (e: any) => {
        if (window.removeEventListener(`pointermove`, h), window.removeEventListener(`pointerup`, g), window.removeEventListener(`pointercancel`, g), p !== void 0 && window.cancelAnimationFrame(p), m(), a.releasePointerCapture) try {
          a.releasePointerCapture(e.pointerId ?? o);
        } catch {}
        setColumnResizeSession(void 0);
      };
    window.addEventListener(`pointermove`, h), window.addEventListener(`pointerup`, g, {
      once: !0
    }), window.addEventListener(`pointercancel`, g, {
      once: !0
    });
  }, [k]);

  // 原 Eo（jsx 31524）：行高缩放（单行抬升）
  const beginRowResize = React.useCallback((e: any, t: any, n: any, r: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), r.length < 2)) return;
    let i = e.currentTarget,
      a = e.pointerId;
    if (i.setPointerCapture) try {
      i.setPointerCapture(a);
    } catch {}
    let o = Math.max(0, Math.min(n, r.length - 2)),
      s = r.map((e: any) => Number.isFinite(e) && e > 0 ? Math.max(24, Math.round(e)) : 24),
      c = s[o] ?? 0;
    if (c <= 0) return;
    let l = e.clientY,
      u = s,
      d: number | undefined;
    setRowResizeSession({
      tableIndex: t,
      boundaryRowIndex: o
    });
    let f = () => {
        setRowHeightPreviewA((e: any) => ({
          ...e,
          [t]: u
        }));
      },
      p = (e: any) => {
        let t = e.clientY - l,
          n = Math.max(24, Math.round(c + t));
        u = s.map((e: any, t: any) => t === o ? n : e), d !== void 0 && window.cancelAnimationFrame(d), d = window.requestAnimationFrame(f);
      },
      m = (e: any) => {
        if (window.removeEventListener(`pointermove`, p), window.removeEventListener(`pointerup`, m), window.removeEventListener(`pointercancel`, m), d !== void 0 && window.cancelAnimationFrame(d), f(), i.releasePointerCapture) try {
          i.releasePointerCapture(e.pointerId ?? a);
        } catch {}
        setRowResizeSession(void 0);
      };
    window.addEventListener(`pointermove`, p), window.addEventListener(`pointerup`, m, {
      once: !0
    }), window.addEventListener(`pointercancel`, m, {
      once: !0
    });
  }, [k]);

  // 原 Do（jsx 31565）：列宽草稿缩放
  const beginColumnResizeDraft = React.useCallback((e: any, t: any, n: any, r: any, i: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), !Number.isFinite(r) || r <= 0)) return;
    let a = e.currentTarget,
      o = e.pointerId;
    if (a.setPointerCapture) try {
      a.setPointerCapture(o);
    } catch {}
    let s = Math.max(0, Math.min(n, i.length - 2)),
      c = normalizeColumnWidths(i, i.length, r, 1),
      l = c[s] ?? 0,
      u = l + (c[s + 1] ?? 0);
    if (u <= 0) return;
    let d = e.clientX,
      f = c,
      p: number | undefined;
    setColumnResizePreview({
      tableKey: t,
      boundaryColumnIndex: s
    });
    let m = () => {
        setColumnWidthOverridesB((e: any) => ({
          ...e,
          [t]: f
        }));
      },
      h = (e: any) => {
        let t = e.clientX - d,
          n = Math.max(8, Math.min(l + t, u - 8)),
          r = u - n;
        f = c.map((e: any, t: any) => t === s ? n : t === s + 1 ? r : e), p !== void 0 && window.cancelAnimationFrame(p), p = window.requestAnimationFrame(m);
      },
      g = (e: any) => {
        if (window.removeEventListener(`pointermove`, h), window.removeEventListener(`pointerup`, g), window.removeEventListener(`pointercancel`, g), p !== void 0 && window.cancelAnimationFrame(p), m(), a.releasePointerCapture) try {
          a.releasePointerCapture(e.pointerId ?? o);
        } catch {}
        setColumnResizePreview(void 0);
      };
    window.addEventListener(`pointermove`, h), window.addEventListener(`pointerup`, g, {
      once: !0
    }), window.addEventListener(`pointercancel`, g, {
      once: !0
    });
  }, [k]);

  // 原 Oo（jsx 31606）：行高草稿缩放
  const beginRowResizeDraft = React.useCallback((e: any, t: any, n: any, r: any) => {
    if (k || (e.preventDefault(), e.stopPropagation(), r.length < 2)) return;
    let i = e.currentTarget,
      a = e.pointerId;
    if (i.setPointerCapture) try {
      i.setPointerCapture(a);
    } catch {}
    let o = Math.max(0, Math.min(n, r.length - 2)),
      s = r.map((e: any) => Number.isFinite(e) && e > 0 ? Math.max(24, Math.round(e)) : 24),
      c = s[o] ?? 0;
    if (c <= 0) return;
    let l = e.clientY,
      u = s,
      d: number | undefined;
    setRowResizePreview({
      tableKey: t,
      boundaryRowIndex: o
    });
    let f = () => {
        setRowHeightPreviewB((e: any) => ({
          ...e,
          [t]: u
        }));
      },
      p = (e: any) => {
        let t = e.clientY - l,
          n = Math.max(24, Math.round(c + t));
        u = s.map((e: any, t: any) => t === o ? n : e), d !== void 0 && window.cancelAnimationFrame(d), d = window.requestAnimationFrame(f);
      },
      m = (e: any) => {
        if (window.removeEventListener(`pointermove`, p), window.removeEventListener(`pointerup`, m), window.removeEventListener(`pointercancel`, m), d !== void 0 && window.cancelAnimationFrame(d), f(), i.releasePointerCapture) try {
          i.releasePointerCapture(e.pointerId ?? a);
        } catch {}
        setRowResizePreview(void 0);
      };
    window.addEventListener(`pointermove`, p), window.addEventListener(`pointerup`, m, {
      once: !0
    }), window.addEventListener(`pointercancel`, m, {
      once: !0
    });
  }, [k]);

  // 原 ko（jsx 31646）：图片缩放（宽高比锁定 + 预览）
  const beginImageResize = React.useCallback((t: any, n: any, r: any, i: any, a: any, o: any) => {
    if (k) return;
    t.preventDefault(), t.stopPropagation(), Fe(n);
    let s = Math.max(24, Math.round(r)),
      c = Math.max(24, Math.round(i)),
      l = s / Math.max(1, c),
      u = t.clientX,
      d = t.clientY,
      f = imageLocationKeyContract(n),
      p = s,
      m = c,
      h: number | undefined,
      g = (e: any) => {
        let t = (e.clientX - u) * a,
          n = (e.clientY - d) * o;
        p = Math.max(24, Math.round(s + (Math.abs(t) > Math.abs(n) ? t : n))), m = Math.max(24, Math.round(p / l)), h !== void 0 && window.cancelAnimationFrame(h), h = window.requestAnimationFrame(() => {
          Ke({
            imageKey: f,
            widthPx: p,
            heightPx: m
          });
        });
      };
    window.addEventListener(`pointermove`, g), window.addEventListener(`pointerup`, () => {
      window.removeEventListener(`pointermove`, g), h !== void 0 && window.cancelAnimationFrame(h), Ke(void 0), e.resizeImage(n, p, m);
    }, {
      once: !0
    });
  }, [e, k]);

  // 原 Ao（jsx 31675）：图片指针移动（拖动/落区/浮动位移/节区位移）
  const beginImagePointerMove = React.useCallback((t: any, n: any, r: any, i: any, a: any) => {
    if (k || t.button !== 0 || t.target.closest(`[data-image-resize-handle='true']`)) return;
    let o = !i && !a;
    t.preventDefault(), t.stopPropagation(), Fe(n);
    let s = imageLocationKeyContract(n),
      c = t.clientX,
      l = t.clientY,
      u = t.currentTarget,
      d = u.getBoundingClientRect(),
      f = u.closest(`[data-docx-page-surface='true']`),
      p = f?.getBoundingClientRect(),
      m = u.closest(`[data-docx-paragraph-host='true']`)?.getBoundingClientRect(),
      h = resolveZoomScale(u, 1),
      g = r.floating ? {
        ...r.floating
      } : {},
      _ = i && n.kind === `paragraph` ? paragraphHostPointHit(u, d.top, d.left) : void 0,
      v = 0,
      y = 0,
      b: number | undefined,
      x = !1,
      S: any,
      C: any,
      w = (() => {
        if (!i || !f || !p) return;
        let e: Record<number, any> = {};
        for (let t of Array.from(f.querySelectorAll(`[data-docx-paragraph-host='true'][data-docx-paragraph-kind='paragraph'][data-docx-paragraph-node-index]`)) as Element[]) {
          let n = Number.parseInt(t.getAttribute(`data-docx-paragraph-node-index`) ?? ``, 10);
          if (!Number.isFinite(n)) continue;
          let r = t.getBoundingClientRect();
          r.height <= 0 || (e[n] = {
            topPx: (r.top - p.top) / h,
            bottomPx: (r.bottom - p.top) / h
          });
        }
        return Object.keys(e).length > 0 ? {
          hostByNodeIndex: e
        } : void 0;
      })(),
      T = () => {
        qe({
          imageKey: s,
          deltaX: v,
          deltaY: y,
          measuredBands: w,
          ...(m ? {
            baseLeftPx: Math.round((d.left - m.left) / h),
            baseTopPx: Math.round((d.top - m.top) / h)
          } : void 0)
        });
      },
      E = (e: any) => {
        if (v = unscaleDelta(e.clientX - c, h), y = unscaleDelta(e.clientY - l, h), o) {
          if (!x) {
            if (Math.abs(v) + Math.abs(y) < 4) return;
            x = !0, Z.current = n, je(!0), Ne(void 0);
          }
          let t = document.elementFromPoint(e.clientX, e.clientY)?.closest(`[data-docx-image-drop-zone='true']`),
            r = t ? parseImageDropZoneDataset((t as HTMLElement).dataset) : void 0,
            i = r ? imageDropZoneKey(r) : void 0;
          i !== C && (S = r, C = i, Ne(r));
        }
        b !== void 0 && window.cancelAnimationFrame(b), b = window.requestAnimationFrame(T);
      },
      D = () => {
        if (window.removeEventListener(`pointermove`, E), window.removeEventListener(`pointerup`, D), window.removeEventListener(`pointercancel`, D), b !== void 0 && window.cancelAnimationFrame(b), qe(void 0), o) {
          if (x && (je(!1), Z.current = null, Ne(void 0)), Math.abs(v) < 1 && Math.abs(y) < 1 || !x || !S) return;
          e.moveImage(n, S);
          let t = sameLocationContract(paragraphLocationOfImage(n), S.kind === `paragraph` ? {
            kind: `paragraph`,
            nodeIndex: S.nodeIndex
          } as DocxLocation : {
            kind: `table-cell`,
            tableIndex: S.tableIndex,
            rowIndex: S.rowIndex,
            cellIndex: S.cellIndex,
            paragraphIndex: S.paragraphIndex
          } as DocxLocation) && n.childIndex < S.childIndex ? S.childIndex - 1 : S.childIndex;
          Fe({
            ...S,
            childIndex: Math.max(0, t)
          });
          return;
        }
        if (!(Math.abs(v) < 1 && Math.abs(y) < 1)) {
          if (i) {
            let t = m ? m.width / h : CONTENT_WIDTH_FALLBACK_PX,
              i = r.widthPx ?? Math.max(24, Math.round(d.width / h)),
              a = r.heightPx ?? Math.max(24, Math.round(d.height / h)),
              // A0-S2c：原式 jsx 31767 `Jp(r, …)` 传图节点 r；旧转录误传浮动面 g，按原式校正
              o = floatingAnchorLayout(r, t, {
                widthPx: i,
                heightPx: a,
                ...(m ? {
                  baseLeftPx: Math.round((d.left - m.left) / h),
                  baseTopPx: Math.round((d.top - m.top) / h)
                } : void 0)
              }),
              s = clampNumber((o?.imageLeftPx ?? 0) + v, 0, Math.max(0, t - i)),
              c = Math.round((o?.imageTopPx ?? 0) + y),
              l = d.top + y * h,
              f = d.left + v * h,
              p = n.kind === `paragraph` && floatingWrapIsInlineLike(g) ? paragraphHostPointHit(u, l, f) : void 0;
            if (p && n.kind === `paragraph` && p.nodeIndex !== n.nodeIndex && p.nodeIndex !== _?.nodeIndex) {
              let t = p.rect.width / h,
                o = clampNumber(Math.round((f - p.rect.left) / h), 0, Math.max(0, t - i)),
                s = Math.round((l - p.rect.top) / h);
              e.moveFloatingImage(n, floatingMovePatch(r, t, o, s, {
                widthPx: i,
                heightPx: a
              }), {
                reparentToParagraphNodeIndex: p.nodeIndex
              }), Fe({
                kind: `paragraph`,
                nodeIndex: p.nodeIndex,
                childIndex: 0
              });
              return;
            }
            e.moveFloatingImage(n, floatingMovePatch(r, t, s, c, {
              widthPx: i,
              heightPx: a
            }));
            return;
          }
          if (a) {
            let t = f && f.isConnected ? f.getBoundingClientRect() : p;
            e.moveFloatingImage(n, sectionFloatingMovePatch(g, Hn, {
              wrapperRect: unscaleRect(d, h),
              pageSurfaceRect: t ? unscaleRect(t, h) : void 0,
              deltaX: v,
              deltaY: y
            }));
            return;
          }
        }
      };
    window.addEventListener(`pointermove`, E), window.addEventListener(`pointerup`, D, {
      once: !0
    }), window.addEventListener(`pointercancel`, D, {
      once: !0
    });
  }, [Hn, e, k, resolveZoomScale]);

  // 原 Mo（jsx 31820）：首字下沉移动（twips 位移）
  const beginDropCapMove = React.useCallback((t: any, n: any, r: any) => {
    if (k || t.button !== 0) return;
    t.preventDefault(), t.stopPropagation(), Fe(void 0), Le(void 0), ze(n);
    let i = t.clientX,
      a = t.clientY,
      o = 0,
      s = 0,
      c = (e: any) => {
        o = e.clientX - i, s = e.clientY - a, Ye({
          nodeIndex: n,
          deltaX: o,
          deltaY: s
        });
      },
      l = () => {
        if (window.removeEventListener(`pointermove`, c), window.removeEventListener(`pointerup`, l), window.removeEventListener(`pointercancel`, l), Ye(void 0), Math.abs(o) < 1 && Math.abs(s) < 1) return;
        let t = Math.max(0, twipsToPxRounded(r.xTwips) ?? 0),
          i = Math.max(0, twipsToPxRounded(r.yTwips) ?? 0);
        e.moveParagraphDropCap(n, {
          xTwips: pxToTwips(Math.max(0, t + o)),
          yTwips: pxToTwips(Math.max(0, i + s))
        });
      };
    window.addEventListener(`pointermove`, c), window.addEventListener(`pointerup`, l, {
      once: !0
    }), window.addEventListener(`pointercancel`, l, {
      once: !0
    });
  }, [e, k]);

  // 原 No（jsx 31847）：首字下沉缩放（字号钳制 12-320px）
  const beginDropCapResize = React.useCallback((t: any, n: any, r: any, i: any, a: any) => {
    if (k || t.button !== 0) return;
    t.preventDefault(), t.stopPropagation(), Fe(void 0), Le(void 0), ze(n);
    let o = t.clientX,
      s = t.clientY,
      c = Math.max(1, i),
      l = Math.max(1, a),
      u = Math.max(12, r),
      d = u,
      f = (e: any) => {
        let t = e.clientX - o,
          r = e.clientY - s,
          i = (c + t) / c,
          a = (l + r) / l;
        d = clampNumber(Math.round(u * Math.max(0.35, Math.max(i, a))), 12, 320), Ze({
          nodeIndex: n,
          fontSizePx: d
        });
      },
      p = () => {
        window.removeEventListener(`pointermove`, f), window.removeEventListener(`pointerup`, p), window.removeEventListener(`pointercancel`, p), Ze(void 0), !(Math.abs(d - u) < 1) && e.setParagraphDropCapFontSizePt(n, d * 72 / 96);
      };
    window.addEventListener(`pointermove`, f), window.addEventListener(`pointerup`, p, {
      once: !0
    }), window.addEventListener(`pointercancel`, p, {
      once: !0
    });
  }, [e, k]);

  /* ---------- 交互面输出（供渲染器/视图接线消费） ---------- */

  return {
    /* 页节/快照面 */
    firstPageIndexByNodeIndex, declaredPageCount, pageSectionInfoByIndex, pageContentKeys,
    pageLayoutSizes, pageSnapshotBatch, tocStyleFieldResolver, livePageCount,
    heavyTableDocument, deferredPaintActive, totalHeightForPageCount,
    /* 虚拟化页窗面 */
    virtualizationSettled, resolvedScrollElement, resolvedZoomScale, pendingVisibleRange,
    settleDelayMs, overscanPx, effectiveOverscan, webdriverDetected, virtualizationEnabled,
    resolveZoomScale, virtualizerActive, windowScrollPending, scrollElementIsDocument,
    virtualizerInContainer, virtualizerInWindow, estimatePageSize, markPaginationThrottle,
    containerVirtualizer, windowVirtualizer, activeVirtualizer, virtualItems, anchorPageIndex,
    virtualVisibleRange, overscannedVisibleRange, manualWindowActive, mergedVisibleRange,
    effectiveVisibleRange, clampedVisibleRange, renderWindowStart, renderWindowEnd,
    deferredFullWindow, firstRenderedPage, lastRenderedPage, renderedPageIndexes,
    pageWindowSpacers, viewportSizeEpoch,
    /* 测量回灌面 */
    visibleTableRowIndexes, measurementPassActive, awaitingTableMeasurement,
    measurementOverlayPending, annotationsByPage, annotationAnchorPoints, headerOverlapHeights,
    annotationCardHeights, gutterAnnotationLayouts, footnotePageNumberBase, pageInRenderWindow,
    revealPage, scrollToBookmark, headerFooterNodesByPage, estimatedHeaderHeights,
    /* 表格选区/指针面 */
    setTableSelectionAnchor, clearTableSelection, tableHitTest, nearestTableAtPoint,
    handlePointerMoveCapture, handlePointerLeave, selectWholeTable, computeTableDropTarget,
    beginTableMove,
    /* 右键菜单状态面 */
    closeTableContextMenu, closeContextMenu, openTextContextMenu, openTableContextMenu,
    runTableAction, tableContextMenuActions, resolveTableMenuCell,
    /* DOM 选区助手面 */
    placeCaretInHost, setTextRangeInElement, textLengthOfElement, recordPartialLineSelection,
    resolveLocationHostElement, textNodeAtOffset, paragraphHostAtOffset, boundaryToDomPoint,
    applyDomSelection, restoreSelectionAfterEdit, wrappedParagraphHit, selectAllContent,
    domPointToBoundary, boundaryAtPoint, selectionFromDom, syncActiveTextRangeFromDom,
    scheduleSelectionSync,
    /* 选区会话面 */
    hasSelectionInside, restoreCaretAtX, ensureSelectionAfterTap, cancelPointerSession,
    clearTransientSelections, beginWrappedEditing, focusWrappedTextarea, commitWrappedText,
    focusParagraphNode, selectDropCap, scheduleCollapsedSelectionSync,
    /* 指针拖选面 */
    beginTextDragSelection, tableCellAtPoint, beginTableCellDragSelection,
    handlePointerDownCapture, handleContextMenu,
    /* 键盘面 */
    handleTableSelectionDelete, handleKeyDownCapture, handleKeyUp,
    deleteExpandedSelectionFromKey, replaceSelectionWithText,
    /* 右键菜单动作面 */
    contextMenuActionsFor, runContextMenuAction,
    /* 光标导航面 */
    focusParagraphAtOffset, focusTableCellParagraph, focusLocationAtOffset,
    placeCaretAtPointInLocation, focusParagraphEnd, selectionOffsetsInHost,
    caretPointOfCollapsed, tableParagraphUnderSelection, syncTableCellTextRange,
    syncParagraphTextRange,
    /* 草稿面 */
    commitTableCellDraft, registerCellDraftElement, cellParagraphDraftElement,
    registerCellParagraphDraftElement, unregisterCellParagraphDraftElement,
    commitCellParagraphDraft, registerSectionDraftElement, sectionParagraphDraft,
    setSectionParagraphDraft, deleteSectionParagraphDraft, commitSectionParagraphDraft,
    captureSectionParagraphDraft, flushSectionParagraphDrafts,
    finishHeaderFooterSession, endHeaderFooterSession,
    /* 撤销/输入面 */
    handleUndoRedoKeys, handleBeforeInput,
    /* 表格几何面 */
    resolveColumnWidthsRender, resolveRowHeightsRender, resolveColumnWidthsDraft,
    resolveRowHeightsDraft,
    /* 缩放面 */
    normalizeRowHeightsForResize, distributeRowHeights, beginColumnResize, beginRowResize,
    beginColumnResizeDraft, beginRowResizeDraft, beginImageResize, beginImagePointerMove,
    beginDropCapMove, beginDropCapResize,
  };
}

/* ============================================================================
 * §4 尾符号表（语义名 ↔ 混淆名 ↔ jsx 行；供 SYMBOL-INDEX 抽取）
 * ============================================================================
 * 页节/快照面：
 *   firstPageIndexByNodeIndex=ir(27889) declaredPageCount=ar(27893)
 *   pageSectionInfoByIndex=or(27900) pageContentKeys=sr(27957)
 *   pageLayoutSizes=cr(27966) pageSnapshotBatch=lr(27971)
 *   publishPageSnapshots-effect=aS(27985) tocStyleFieldResolver=ur(27988)
 *   livePageCount=dr(28023) heavyTableDocument=fr(28024)
 *   deferredPaintActive=pr(28040) totalHeightForPageCount=mr(28041)
 * 虚拟化页窗面：
 *   convergencePageCount=hr(28070) virtualizationPageCount=gr(28071)
 *   virtualizationTotalHeightPx=_r(28072) externalRangeProvided=vr(28073)
 *   virtualizationSettled=yr/br(28078) resolvedScrollElement=xr/Sr(28079)
 *   resolvedZoomScale=Cr/wr(28080) pendingVisibleRange=Tr/Er(28081)
 *   settleDelayMs=Dr(28082) overscanPx=Or(28083) effectiveOverscan=kr(28084)
 *   webdriverDetected=Ar(28085) virtualizationEnabled=jr(28086)
 *   scrollElementProp=Mr(28087) zoomScaleProp=Nr(28088) resolveZoomScale=Fr(28089)
 *   exclusion-rects-effect=(28093) viewportSizeEpoch=Ir/Lr(28182)
 *   virtualizerActive=Rr(28203) windowScrollPending=Vr(28204)
 *   scrollElementIsDocument=Hr(28205) virtualizerInContainer=Ur(28206)
 *   virtualizerInWindow=Wr(28207) estimatePageSize=Gr(28208)
 *   markPaginationThrottle=Kr(28211) containerVirtualizer=qr(28213)
 *   windowVirtualizer=Xr(28219) activeVirtualizer=Zr(28225)
 *   virtualItems=Qr(28231) anchorPageIndex=$r(28232)
 *   virtualVisibleRange=ei(28248) overscannedVisibleRange=ti(28268)
 *   manualWindowActive=ni(28282) manual-window-effect=(28284)
 *   mergedVisibleRange=ri(28354) effectiveVisibleRange=ii(28359)
 *   clampedVisibleRange=ai(28361) renderWindowStart=oi(28378)
 *   initialRenderSpan=si(28379) renderWindowEnd=ci(28380)
 *   deferredFullWindow=di(28381) firstRenderedPage=fi(28382)
 *   lastRenderedPage=pi(28383) renderedPageIndexes=mi(28384)
 *   pageWindowSpacers=hi(28390)
 * 测量回灌面：
 *   blockId-heights-effect=(28403) visibleTableRowIndexes=gi(28423)
 *   measurementPassActive=yi(28447) awaitingTableMeasurement=bi(28448)
 *   measurementOverlayPending=xi(28466) annotationsByPage=Si(28488)
 *   annotationAnchorPoints=Ci/wi(28516) headerOverlapHeights=Ti/Ei(28517)
 *   annotationCardHeights=Di/Oi(28521) gutterAnnotationLayouts=ki(28580)
 *   footnotePageNumberBase=Ai(28585) pageInRenderWindow=ji(28588)
 *   revealPage=Ni(28589) scrollToBookmark=Pi(28600)
 *   headerFooterNodesByPage=Fi(28633) estimatedHeaderHeights=Ii(28655)
 *   header-overlap-effect=(28671) page-height-effect=(28716)
 *   pagination-oscillation-effect=(28848) settle-effect=(28854)
 *   initial-paint-effect=(28866)
 * 表格选区/指针面：
 *   setTableSelectionAnchor=Li(28909) clearTableSelection=Ri(28919)
 *   tableHitTest=zi(28921) nearestTableAtPoint=Bi(28928)
 *   handlePointerMoveCapture=Vi(28940) handlePointerLeave=Hi(28946)
 *   selectWholeTable=Ui(28948) computeTableDropTarget=Wi(28959)
 *   beginTableMove=Gi(28996)
 * 右键菜单状态面：
 *   closeTableContextMenu=Ki(29063) closeContextMenu=qi(29066)
 *   openTextContextMenu=Ji(29069) openTableContextMenu=Yi(29077)
 *   runTableAction=Xi(29084) tableContextMenuActions=Zi(29114)
 *   resolveTableMenuCell=Qi(29115) menu-dismiss-effect=(29133)
 * 守卫 effects：selection-invalidation=(29146) table-menu-invalidation=(29150)
 *   image-menu-invalidation=(29153)
 * DOM 选区助手面：
 *   placeCaretInHost=$i(29166) section-draft-caret-effect=(29269)
 *   setTextRangeInElement=ea(29276) textLengthOfElement=ta(29310)
 *   recordPartialLineSelection=na(29313) resolveLocationHostElement=ra(29332)
 *   textNodeAtOffset=ia(29348) paragraphHostAtOffset=aa(29371)
 *   boundaryToDomPoint=oa(29389) applyDomSelection=sa(29395)
 *   restoreSelectionAfterEdit=ca(29455) wrappedParagraphHit=la(29510)
 *   selectAllContent=ua(29523) domPointToBoundary=da(29540)
 *   boundaryAtPoint=fa(29583) selectionFromDom=pa(29676)
 *   syncActiveTextRangeFromDom=ma(29690) scheduleSelectionSync=ha(29715)
 *   dom-selection-restore-effect=(29723)
 * 选区会话面：
 *   hasSelectionInside=ga(29766) restoreCaretAtX=_a(29773)
 *   ensureSelectionAfterTap=va(29795) cancelPointerSession=ya(29821)
 *   clearTransientSelections=ba(29824) beginWrappedEditing=xa(29827)
 *   focusWrappedTextarea=Sa(29862) commitWrappedText=Ca(29882)
 *   focusParagraphNode=wa(29888) selectDropCap=Ta(29893)
 *   scheduleCollapsedSelectionSync=Ea(29897)
 * 历史/选区监听：history-restore-effect=(29902)
 *   selectionchange-effect=(29977) pointer-session-effect=(30012)
 * 指针拖选面：
 *   beginTextDragSelection=Da(30039) tableCellAtPoint=Oa(30088)
 *   beginTableCellDragSelection=ka(30090) handlePointerDownCapture=Aa(30143)
 *   handleContextMenu=ja(30161)
 * 键盘面：
 *   handleTableSelectionDelete=Ma(30195) handleKeyDownCapture=Na(30211)
 *   handleKeyUp=Pa(30252) deleteExpandedSelectionFromKey=Fa(30255)
 *   replaceSelectionWithText=Ia(30286)
 * 右键菜单动作面：
 *   contextMenuActionsFor=La(30306) runContextMenuAction=Ra(30385)
 *   delete-keydown-effect=(30673) guard-effects=(30707-30745)
 * 光标导航面：
 *   focusParagraphAtOffset=za(30747) focusTableCellParagraph=Ba(30776)
 *   focusLocationAtOffset=Va(30789) placeCaretAtPointInLocation=Ha(30793)
 *   focusParagraphEnd=Ua(30813) selectionOffsetsInHost=Wa(30824)
 *   caretPointOfCollapsed=Ga(30851) tableParagraphUnderSelection=Ka(30866)
 *   syncTableCellTextRange=qa(30884) syncParagraphTextRange=Ja(30902)
 * 草稿面：
 *   commitTableCellDraft=Ya(30924) registerCellDraftElement=Xa(30935)
 *   cellParagraphDraftElement=Za(30938) registerCellParagraphDraftElement=Qa(30939)
 *   unregisterCellParagraphDraftElement=eo(30941) commitCellParagraphDraft=no(30943)
 *   registerSectionDraftElement=ao(30957) sectionParagraphDraft=oo(30960)
 *   setSectionParagraphDraft=so(30961) deleteSectionParagraphDraft=co(30963)
 *   commitSectionParagraphDraft=lo(30965) captureSectionParagraphDraft=uo(30980)
 *   flushSectionParagraphDrafts=fo(30986) finishHeaderFooterSession=po(30996)
 *   endHeaderFooterSession=ho(31001) export-transformer-effect=(31010)
 * 撤销/输入面：
 *   handleUndoRedoKeys=_o(31073) handleBeforeInput=vo(31083)
 *   beforeinput-listener-effect=(31334)
 * 表格几何面：
 *   resolveColumnWidthsRender=yo(31341) resolveRowHeightsRender=bo(31346)
 *   resolveColumnWidthsDraft=xo(31352) resolveRowHeightsDraft=So(31359)
 *   row-height-measurement-effect=(31374)
 * 缩放面：
 *   normalizeRowHeightsForResize=Co(31451) distributeRowHeights=wo(31453)
 *   beginColumnResize=To(31479) beginRowResize=Eo(31524)
 *   beginColumnResizeDraft=Do(31565) beginRowResizeDraft=Oo(31606)
 *   beginImageResize=ko(31646) beginImagePointerMove=Ao(31675)
 *   beginDropCapMove=Mo(31820) beginDropCapResize=No(31847)
 * ==========================================================================*/

/** 交互面类型导出（供 C4 渲染器簇与后续接线消费） 〔A1-R186〕★本注（块 @5246-5246、类别「死面之标签」）係下方被删面之**标签**：其主语 DocxEditorViewInteractionSurface 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R186 裁定 part (ii)，dossier-F E4.1〕本注所标签之实体 useDocxEditorViewRenderCallbacks 经重测仍活（命中 1 处：modules/LegacyDocEngineC4.tsx@380；口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））⇒ 按〔A1-R176〕判别式（注之 referent 是否尚有活体成员）本注必须存活。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批：本地 type DocxEditorViewInteractionSurface（1 行、代码位读者 0、带 export 而无一家导入方把该名作 specifier 拉取〔判据 Ⓑ 之 specifier 级，A1-R184 v8〕）纯删，1 行**单行形**等行墓碑在原位（长形判据文与型-only 论证见本批其余 56 碑）；同名定义站：DocxEditorViewInteractionSurface 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。净零行：本碑 1 行置换原 1 行，文件行数 5252 不变、零重锚（LegacyDocEngineC3 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。 ── */

/* 静态契约断言：交互面回调可赋值给批 B 视图消费契约（宽松函数面） */
const _interactionSurfaceContractCheck: (core: DocxEditorViewInteractionCore) => Record<string, unknown> = useDocxEditorViewInteractionCallbacks;
void _interactionSurfaceContractCheck;
