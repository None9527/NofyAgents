/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBPageRenderer.tsx — legacy-doc 内部引擎 [E7]：
 * 页面渲染组件（原 ES = DocxEditorView，jsx 27340-36416，9077 行）
 * （解混淆重建 · D8 Stage B4 · Office 预览族 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版）
 *
 * 重建口径：
 *  - props 契约与公共层 DocxEditorViewProps 逐字段对齐（高）；
 *  - 状态机骨架（~60 组 useState/useRef）、节/几何/分页 memo 链、
 *    最终 JSX 结构（页窗/封面层/边框层/页眉/正文/页脚/批注槽/右键菜单）
 *    全量语义重建（高/中）；
 *  - 巨型交互回调簇（节点渲染器 fs、指针/键盘/拖拽/虚拟化/批注布局，
 *    ~6,300 行）按锚点登记（见 §3）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射（ES 内部，jsx 行）
 * ----------------------------------------------------------------------------
 *  契约面：
 *   ES → DocxEditorView (9091) | props 22 项 (27340-27362)
 *   C → pageRegistry (27363) | k → isReadOnly (27368) | A → darkInverted (27369)
 *   j → effectiveTheme (27370) | M → invertFilter (27370) | N → isEditable (27371)
 *  memo 链：
 *   F → tocLinkColors (27376) | I → paragraphRenderContext (27377)
 *   Bn → sections (120526) | Hn → pageGeometry (27646) | Un → sectionMetrics (27647)
 *   Wn → geometryIdentityKey (27648) | Gn/Kn/qn → 逐节点度量映射 (27649-27678)
 *   Jn → sectionColumns (27679) | Yn → precomputedNumberingLabels (27680)
 *   Xn → bookmarkNodeIndexes (120852) | Zn → measuredRowHeights (27696)
 *   Qn → paginationResult (27709-27888) | $n/er/tr/nr → 页/测量派生 (27888)
 *   rr → pageIdentityKeys (1902) | ir → firstPageByNode (27890)
 *   hr → pageCount (28070±)
 *  JSX 面：
 *   根容器 data-testid="docx-editor-viewer" (35408)
 *   初始布局遮罩 data-docx-initial-layout-overlay (35415)
 *   拖放覆盖层 (35432) | 导入错误 data-docx-import-error (35443)
 *   光标行指示 (35466) | 页窗占位 data-docx-page-window-spacer (35475/36222)
 *   页包装 data-docx-page-wrapper (35610) | 页表面 data-docx-page-surface (35615)
 *   封面层 data-docx-page-cover-layer (35622) | 边框层 data-docx-page-border-overlay (35652)
 *   页眉区 data-docx-header-footer-region="header" (35686)
 *   正文列布局 column-layout-node-* (35777) | 页脚区 (35900±)
 *   批注槽 data-docx-gutter-annotation (36211)
 *   右键菜单 data-docx-context-menu / data-docx-table-context-menu (36356/36408)
 *
 * ----------------------------------------------------------------------------
 * 二、外部契约（A0-S2c 接线后）
 * ----------------------------------------------------------------------------
 *   [E6]：createDocxEditor 返回面（本批 LegacyDocEngineBEditorState）
 *   [E6]：页注册表（本批 LegacyDocEngineBPageRegistry：registerPageElement/
 *         publishPageSnapshots）、renderSectionNode（页眉/页脚）
 *   [E6]-布局：分页主函数/节度量/段落 CSS（本批 LegacyDocEngineBLayout/Model）
 *   公共层：Yr parsePageGeometry（previewPane）
 *   [E4]→Engine4：Lo/Ro/Bo/Po memoizePageBuilder/chooseEstimatedPages/
 *         fitPageCountByScale/pageBudgetSatisfied（jsx 14080-14142）
 *   [E4]→C1：jg paginateByBreakHints、Og distributeSegmentsAcrossPages、Kg isFloatingImageNode、
 *         av shapeTransformCss
 *   [E4]→BLayout：sectionBreakNodeIndexes｜BModel：Mm sectionIndexForNode、tp imageIsFullPageCover
 *   [E4]→C2：ki 族 layoutGutterAnnotations
 *   仍保留 declare：Em/Dm tableSpannedRowIndexes（属主未收录）、fs renderDocumentNode
 *         （jsx 28000± 渲染层，obf 名跨段冲突）、Zr computeVisiblePages（虚拟化面）、
 *         or pageSectionInfoFor / La 族 contextMenuActionsFor（C3 未模块导出）
 * ============================================================================
 */

import * as React from "react";
import {
  type DocxEditorModel,
  type DocxNode,
  type DocxParagraphNode,
  type DocxTableNode,
  type PageSegment,
  type SectionPageMetrics,
  type DocxSection,
  normalizeDocumentSections,
  paragraphIsCoverCandidate,
  imageIsFullPageCover,
  imageChildKey,
  parseSectionColumns,
  sectionPageNumberFormat,
  sectionBreakType,
} from "./LegacyDocEngineBModel";
import {
  paginateDocumentReconstructed,
  sectionIndexForNodeInList,
  lastRenderedPageBreakOf,
  lastRenderedBreakAtStart,
} from "./LegacyDocEngineBLayout";
import {
  pageIdentityKey,
  pageIsOnlySplitSegments,
  buildSectionPageMetrics,
  sectionIndexForNode,
  resolveRenderBodyHeight,
  scaleSectionMetrics,
  scaleHeightList,
  validateMeasuredHeightPrefix,
  samePaginationSnapshot,
  buildPaginationSnapshot,
  resolveMeasuredRowHeights,
  paginateWithFootnotes,
  estimateFootnoteHeight,
  collectPageFootnotes,
} from "./LegacyDocEngineBModel";
import { PAGE_GRID_GAP_PX, INACTIVE_REGION_OPACITY, PAGINATION_SETTLE_MS, DOUBLE_CLICK_INTERVAL_MS } from "./LegacyDocEngineBThumbnails";
import { registerPageElement } from "./LegacyDocEngineBPageRegistry";
import type { DocxEditorState } from "./LegacyDocEngineBEditorState";
import type { DocxEditorViewProps, DocxDocumentTheme } from "./previewPaneOfficeLegacyDocContent";
import { pageMarginsToPadding, parsePageBorders } from "./previewPaneOfficeLegacyDocContent";

/* ============================================================================
 * §0 外部契约声明（锚点登记）
 * ==========================================================================*/

/** [E2]：sectPr → 页面几何（原 Yr）→ 公共层 parsePageGeometry（返回 DocxPageGeometry，与原契约同构） */
import { parsePageGeometry as parsePageGeometryContract } from "./previewPaneOfficeLegacyDocContent";
/** [E4]：分页仲裁族（原 Lo/Ro/Bo/Po，jsx 14080-14142）→ Engine4 实体导出 */
import {
  memoizePageBuilder as memoizedPaginationFactoryE4, // 原 Lo（jsx 14109）
  chooseEstimatedPages as pureEstimatedPagesArbitrationE4, // 原 Ro（jsx 14121）
  fitPageCountByScale as scaledPaginationArbitrationE4, // 原 Bo（jsx 14142）
  pageBudgetSatisfied as pageCountConvergenceCheckE4, // 原 Po（jsx 14080）
} from "./LegacyDocEngine4";
/** [E4]：断页提示分页（原 jg）→ C1；断页集（BLayout sectionBreakNodeIndexes） */
import { paginateByBreakHints, distributeSegmentsAcrossPages as columnLayoutBandsC1 } from "./LegacyDocEngineC1"; // 原 jg（jsx 19173）/ Og（jsx 19092）
import { sectionBreakNodeIndexes } from "./LegacyDocEngineBLayout";
/** [E4]：节索引（原 Mm）→ BModel sectionIndexForNode */
import { sectionIndexForNode as sectionIndexForNodeInSectionsBModel } from "./LegacyDocEngineBModel";

/* --- 类型桥接：本地契约与实体签名分歧者（运行时为同一实体） --- */
/** 原 Lo：实体 memoizePageBuilder（Engine4 分页器工厂面） */
const memoizedPaginationFactory = memoizedPaginationFactoryE4 as unknown as (build: (measuredHeights: number[] | undefined, pageHeights: number[] | undefined, strict: boolean) => PageSegment[][]) => (measuredHeights: number[] | undefined, pageHeights: number[] | undefined, strict: boolean) => PageSegment[][];
/** 原 Ro：实体 chooseEstimatedPages（Engine4 仲裁输入面） */
const pureEstimatedPagesArbitration = pureEstimatedPagesArbitrationE4 as unknown as (input: {
  canUndo: boolean;
  canRedo: boolean;
  hasMeasuredPageContentHeights: boolean;
  measuredEstimatedPages: PageSegment[][];
  buildPureEstimatedPages: () => PageSegment[][];
  pageContainsOnlySplitParagraphSegments: (segments: PageSegment[]) => boolean;
}) => { usedPureEstimatedPages: boolean; pages: PageSegment[][] };
/** 原 Bo：实体 fitPageCountByScale */
const scaledPaginationArbitration = scaledPaginationArbitrationE4 as unknown as (input: {
  initialPages: PageSegment[][];
  targetPageCount: number;
  maxDifference: number;
  scales?: number[];
  buildPagesAtScale: (scale: number) => PageSegment[][];
}) => { pages: PageSegment[][]; scale: number };
/** 原 Po：实体 pageBudgetSatisfied */
const pageCountConvergenceCheck = pageCountConvergenceCheckE4 as unknown as (input: {
  estimatedPageCount: number;
  targetPageCount: number;
  hasLastRenderedPageBreakHints: boolean;
  renderedBreakHintPageCount?: number;
  hasMeasuredBodyFooterOverlap: boolean;
}) => boolean;
/** 原 Og：实体 distributeSegmentsAcrossPages（C1 分栏分派面） */
const columnLayoutBands = columnLayoutBandsC1 as unknown as (
  model: DocxEditorModel,
  segments: PageSegment[],
  columnWidthsPx: number[],
  bodyHeightPx: number,
  numberingDefinitions: unknown,
  gridPitchByNodeIndex: Map<number, number>,
  measuredParagraphHeights: Map<number, number>,
  allowTrailingOverflow: boolean,
  nextColumnSectionStarts: Set<number>,
) => unknown[];
/** 原 Mm：实体 sectionIndexForNode（BModel） */
const sectionIndexForNodeInSections = sectionIndexForNodeInSectionsBModel as unknown as (sections: DocxSection[], nodeIndex: number, hint: number) => number;
/** [E4] 保留 declare：tableSpannedRowIndexes（原 Em/Dm 未收录属主） */
declare function tableSpannedRowIndexes(table: DocxTableNode): { startRowIndexes: number[] };
/** 渲染层：节点渲染器（原 fs，jsx 28000±；ES 正文逐段渲染入口；锚点登记） */
declare function renderDocumentNode(
  node: DocxNode,
  nodeIndex: number,
  tableRowRange: PageSegment[`tableRowRange`],
  tableRowSlice: PageSegment[`tableRowSlice`],
  paragraphLineRange: PageSegment[`paragraphLineRange`],
  options?: {
    pageLayout?: unknown;
    contentWidthPxOverride?: number;
    suppressLikelyFullPageCoverImageKeys?: Set<string>;
    forceReadOnly?: boolean;
    suppressParagraphElementTracking?: boolean;
    syntheticKeySuffix?: string;
    overrideBeforeSpacingPx?: number;
    overrideAfterSpacingPx?: number;
    normalizeParagraphHostFontSize?: boolean;
  },
): React.ReactElement | null;
/** 渲染层：封面图样式（原 av = C1 shapeTransformCss，jsx 20699）与图片浮动判定族（原 Kg → C1；tp → BModel imageIsFullPageCover） */
import { shapeTransformCss as coverImageStyleC1, isFloatingImageNode } from "./LegacyDocEngineC1";
import { imageIsFullPageCover as imageIsFullPageCoverBModel } from "./LegacyDocEngineBModel";
/** 原 av：实体 shapeTransformCss（C1 形状变换 CSS 面），按本地契约桥接 */
const coverImageStyle = coverImageStyleC1 as unknown as (image: { crop?: unknown }, frame: { frameWidthPx: number; frameHeightPx: number; fillFrame?: boolean }) => Record<string, unknown>;
/** 原 tp：实体 imageIsFullPageCover（BModel），按本地契约桥接 */
const imageIsFullPageCoverContract = imageIsFullPageCoverBModel as unknown as (image: { floating?: unknown; widthPx?: number; heightPx?: number }, contentWidthPx: number, contentHeightPx: number) => boolean;
/** 虚拟化：页窗计算（原 Zr.getVirtualItems 面；锚点登记） */
declare function computeVisiblePages(totalHeightPx: number, pageOffsets: number[], scrollTop: number, viewportHeight: number, overscanPx: number): { indexes: number[]; before: { heightPx: number; widthPx: number }; after: { heightPx: number; widthPx: number } };
/** 批注槽布局（原 ki 计算簇）→ C2 layoutGutterAnnotations 实体导出 */
import { layoutGutterAnnotations as layoutGutterAnnotationsC2 } from "./LegacyDocEngineC2";
const layoutGutterAnnotations = layoutGutterAnnotationsC2 as unknown as (input: { pageIndex: number; annotations: unknown[]; pageHeightPx: number }) => { top: number; heightPx: number; annotation: { id: string }; anchorX: number; anchorY: number; connectorLane: number }[];
/** 页节信息表（原 or，jsx 28400±；锚点登记：逐页节归属/页码/布局） */
declare function pageSectionInfoFor(pageIndex: number): PageSectionInfo | undefined;
/** 右键菜单动作解析（原 La/Ra/Zi/Xi/qi/Ki，jsx 34000±；锚点登记） */
declare function contextMenuActionsFor(context: unknown): { id: string; label: string; shortcut?: string; destructive?: boolean; separatorBefore?: boolean; checked?: boolean; disabled?: boolean; children?: { id: string; label: string; shortcut?: string; destructive?: boolean; disabled?: boolean; checked?: boolean }[] }[];

/* ============================================================================
 * §1 分页结果类型
 * ==========================================================================*/

/** 分页结果（原 Qn 返回面） */
interface PaginationResult {
  pages: PageSegment[][];
  useMeasuredPageContentHeightsForRender: boolean;
  renderMeasuredPageContentHeightsPxByPageIndex: number[] | undefined;
  renderPageContentHeightScale: number | undefined;
}

/** 页节信息（原 or 元素面） */
interface PageSectionInfo {
  layout?: { pageWidthPx: number; pageHeightPx: number; marginsPx: { top: number; right: number; bottom: number; left: number }; headerDistancePx: number; footerDistancePx: number };
  pageNumber?: number;
  section: DocxSection;
}

/* ============================================================================
 * §2 DocxEditorView（原 ES，jsx 27340-36416）
 * ==========================================================================*/

/**
 * 原 ES：docx 页面渲染组件——
 * 分页（估算 + 测量回灌 + 页数收敛仲裁）→ 虚拟化页窗 → 逐页渲染
 * （封面层/边框层/页眉/正文/页脚/批注槽）→ 编辑交互（只读模式禁用）。
 *
 * 注：本重建保留 props 契约、状态骨架、分页 memo 链与最终 JSX 结构；
 * 巨型交互回调簇（指针/键盘/拖拽/虚拟化细节/批注布局，~6,300 行）
 * 以锚点登记（§3），渲染路径经 renderDocumentNode/renderSectionNode 委托。
 */
export function DocxEditorView({
  editor,
  className,
  style,
  pageBackgroundColor,
  pageGapBackgroundColor,
  deferInitialPaginationPaint = false,
  loadingState,
  pageVirtualization,
  visiblePageRange,
  onPageCountChange,
  onRequestPageReveal,
  headingStyles,
  showTrackedChanges,
  renderTrackedChangeCard,
  showComments,
  renderCommentCard,
  renderTableContextMenu,
  renderContextMenu,
  onFormFieldDoubleClick,
  mode = `edit`,
}: DocxEditorViewProps): React.ReactElement {
  /* 契约对接：公共层 DocxEditor 最小面 → [E6] 编辑器完整状态面（原 tS 返回） */
  const editorState = editor as unknown as DocxEditorState;
  /* --- 模式/主题派生（原 27363-27375） --- */
  const resolvedShowTrackedChanges = showTrackedChanges ?? editorState.showTrackedChanges;
  const hasTrackedChanges = editorState.trackedChanges.length > 0;
  const resolvedShowComments = showComments ?? editorState.showComments;
  const hasComments = editorState.comments.length > 0;
  const annotationsVisible = resolvedShowTrackedChanges || resolvedShowComments;
  const isReadOnly = mode === `read-only` || resolvedShowTrackedChanges;
  const darkInverted = isReadOnly && editorState.documentTheme === `dark`;
  const effectiveTheme: DocxDocumentTheme = darkInverted ? `light` : editorState.documentTheme;
  const invertFilter = darkInverted ? `invert(0.95) hue-rotate(180deg) saturate(0.9) brightness(0.9) contrast(0.94)` : void 0;
  const isEditable = mode !== `read-only`;

  /* --- 表单域双击判定（原 nt，jsx 27447） --- */
  const formFieldLocationKey = React.useCallback(
    (location: { kind: string; nodeIndex?: number; tableIndex?: number; rowIndex?: number; cellIndex?: number; paragraphIndex?: number; childIndex?: number }): string =>
      location.kind === `paragraph` ? `p:${location.nodeIndex}:${location.childIndex}` : `t:${location.tableIndex}:${location.rowIndex}:${location.cellIndex}:${location.paragraphIndex}:${location.childIndex}`,
    [],
  );
  const lastFormFieldTapRef = React.useRef<{ key: string; time: number } | undefined>(void 0);
  const handleFormFieldTap = React.useCallback(
    (location: { kind: `paragraph`; nodeIndex: number; childIndex?: number } | { kind: `table-cell`; tableIndex: number; rowIndex: number; cellIndex: number; paragraphIndex?: number; childIndex?: number }): boolean => {
      const now = typeof performance < `u` ? performance.now() : Date.now();
      const key = formFieldLocationKey(location);
      const last = lastFormFieldTapRef.current;
      return last && last.key === key && now - last.time <= DOUBLE_CLICK_INTERVAL_MS
        ? ((lastFormFieldTapRef.current = void 0), editorState.selectFormField(location as never), (onFormFieldDoubleClick as ((target: unknown) => void) | undefined)?.(location), true)
        : ((lastFormFieldTapRef.current = { key, time: now }), false);
    },
    [editorState.selectFormField, formFieldLocationKey, onFormFieldDoubleClick],
  );
  void handleFormFieldTap;

  /* --- 页元素登记回调（原 ht，jsx 27465） --- */
  const pageElementCallbacks = React.useRef(new Map<number, (element: HTMLElement | null) => void>());
  const pageElementCallbackFor = React.useCallback(
    (pageIndex: number): ((element: HTMLElement | null) => void) => {
      const normalized = Math.max(0, Math.round(pageIndex));
      const existing = pageElementCallbacks.current.get(normalized);
      if (existing) return existing;
      let lastElement: HTMLElement | null = null;
      const callback = (element: HTMLElement | null): void => {
        element ? ((lastElement = element)) : void 0;
        registerPageElement(editor as never, normalized, element, lastElement);
        element || (lastElement = null);
      };
      pageElementCallbacks.current.set(normalized, callback);
      return callback;
    },
    [editor],
  );

  /* --- 状态骨架（原 27476-27556；~60 组状态，按语义分组登记） --- */
  /* 分页稳定/初始绘制（原 At/Mt/Pt/It/Rt/Bt 簇） */
  const [initialPaginationPainted, setInitialPaginationPainted] = React.useState(!deferInitialPaginationPaint);
  const [initialLayoutComplete, setInitialLayoutComplete] = React.useState(!deferInitialPaginationPaint);
  const [layoutOverlayVisible, setLayoutOverlayVisible] = React.useState(false);
  const [paginationStats, setPaginationStats] = React.useState({ pageCount: 0, totalHeightPx: 0 });
  const [bodyFooterOverlapMeasured, setBodyFooterOverlapMeasured] = React.useState(false);
  const paginationStabilityRef = React.useRef({ changeCount: 0, distinctPageCounts: new Set<number>() });
  /* 测量状态簇（原 gt/vt/bt/St/wt 等：页身份键/测量页高/连续稳定计数） */
  const [measuredIdentityKeys, setMeasuredIdentityKeys] = React.useState<string[]>([]);
  const [measuredPageHeights, setMeasuredPageHeights] = React.useState<number[]>([]);
  const [measuringActive, setMeasuringActive] = React.useState(false);
  const measurementStabilityRef = React.useRef<{ signature: string | undefined; consecutivePasses: number }>({ signature: void 0, consecutivePasses: 0 });
  const [, forceRender] = React.useReducer((value: number) => value + 1, 0);
  /* 交互状态簇（原 Vt..rn：选区/拖拽/缩放/右键菜单，锚点登记） */
  const [contextMenuState, setContextMenuState] = React.useState<unknown>();
  const [tableContextMenuState, setTableContextMenuState] = React.useState<unknown>();
  /* 分页重算调度（原 Pn/Fn：节流 + rAF） */
  const paginationThrottleUntilRef = React.useRef(0);
  const paginationTimeoutRef = React.useRef<number | null>(null);
  const paginationRafRef = React.useRef<number | null>(null);
  const schedulePaginationSettle = React.useCallback((durationMs?: number): void => {
    if (typeof window > `u`) return;
    setLayoutOverlayVisible(true);
    const duration = Math.max(48, Math.round(durationMs ?? PAGINATION_SETTLE_MS));
    paginationThrottleUntilRef.current = Date.now() + duration;
    paginationTimeoutRef.current !== null && window.clearTimeout(paginationTimeoutRef.current);
    paginationTimeoutRef.current = window.setTimeout(() => {
      paginationTimeoutRef.current = null;
      forceRender();
    }, duration + 16);
  }, []);
  const schedulePaginationFrame = React.useCallback((): void => {
    if (typeof window > `u` || typeof window.requestAnimationFrame != `function`) {
      forceRender();
      return;
    }
    paginationRafRef.current === null &&
      (paginationRafRef.current = window.requestAnimationFrame(() => {
        paginationRafRef.current = null;
        forceRender();
      }));
  }, []);
  /* 文档重载 → 全量状态复位（原 27513-27528） */
  React.useEffect(() => {
    setMeasuredIdentityKeys([]);
    setMeasuredPageHeights([]);
    setMeasuringActive(false);
    measurementStabilityRef.current = { signature: void 0, consecutivePasses: 0 };
    setContextMenuState(void 0);
    setTableContextMenuState(void 0);
    setPaginationStats({ pageCount: 0, totalHeightPx: 0 });
    setBodyFooterOverlapMeasured(false);
    paginationStabilityRef.current = { changeCount: 0, distinctPageCounts: new Set() };
  }, [editorState.documentLoadNonce]);
  React.useEffect(() => {
    if (typeof document > `u`) return;
    const styleId = `docx-wrapped-caret-style`;
    let styleElement = document.getElementById(styleId);
    styleElement ||
      ((styleElement = document.createElement(`style`)),
      (styleElement.id = styleId),
      (styleElement.textContent = `\n        @keyframes docxWrappedCaretBlink {\n          0%, 49% { opacity: 1; }\n          50%, 100% { opacity: 0; }\n        }\n      `),
      document.head.appendChild(styleElement));
  }, []);
  React.useEffect(
    () => () => {
      /* 锚点：全部 rAF/定时器句柄释放（原 jsx 27583-27588） */
    },
    [],
  );
  /* 只读 → 交互状态清除（原 27589） */
  React.useEffect(() => {
    isReadOnly && (setContextMenuState(void 0), setTableContextMenuState(void 0));
  }, [isReadOnly]);

  /* --- 节/几何/度量 memo 链（原 27640-27678） --- */
  const sections = React.useMemo(() => normalizeDocumentSections(editorState.model.metadata), [editorState.model.metadata]);
  const primarySectionXml = sections[0]?.sectionPropertiesXml ?? editorState.model.metadata.sectionPropertiesXml;
  const pageGeometry = React.useMemo(() => parsePageGeometryContract(primarySectionXml), [primarySectionXml]);
  const sectionMetrics = React.useMemo(() => buildSectionPageMetrics(sections, pageGeometry), [pageGeometry, sections]);
  const geometryIdentityKey = React.useMemo(
    () =>
      [
        Math.round(pageGeometry.pageWidthPx),
        Math.round(pageGeometry.pageHeightPx),
        Math.round(pageGeometry.marginsPx.top),
        Math.round(pageGeometry.marginsPx.bottom),
        Math.round(pageGeometry.marginsPx.left),
        Math.round(pageGeometry.marginsPx.right),
        resolvedShowTrackedChanges ? `tc1` : `tc0`,
        JSON.stringify(sectionMetrics),
      ].join(`|`),
    [pageGeometry, sectionMetrics, resolvedShowTrackedChanges],
  );
  const { docGridLinePitchPxByNodeIndex, pageContentWidthPxByNodeIndex, pageContentHeightPxByNodeIndex } = React.useMemo(() => {
    const gridPitch = new Map<number, number>();
    const contentWidths = new Map<number, number>();
    const contentHeights = new Map<number, number>();
    if (editorState.model.nodes.length === 0 || sectionMetrics.length === 0)
      return { docGridLinePitchPxByNodeIndex: gridPitch, pageContentWidthPxByNodeIndex: contentWidths, pageContentHeightPxByNodeIndex: contentHeights };
    let hint = 0;
    for (let nodeIndex = 0; nodeIndex < editorState.model.nodes.length; nodeIndex += 1) {
      hint = sectionIndexForNode(sectionMetrics, nodeIndex, hint);
      const metrics = sectionMetrics[hint];
      const pitch = metrics?.docGridLinePitchPx;
      Number.isFinite(pitch) && (pitch as number) > 0 && gridPitch.set(nodeIndex, Math.round(pitch as number));
      const width = metrics?.pageContentWidthPx;
      Number.isFinite(width) && (width as number) > 0 && contentWidths.set(nodeIndex, Math.round(width as number));
      const height = metrics?.pageContentHeightPx;
      Number.isFinite(height) && (height as number) > 0 && contentHeights.set(nodeIndex, Math.round(height as number));
    }
    return { docGridLinePitchPxByNodeIndex: gridPitch, pageContentWidthPxByNodeIndex: contentWidths, pageContentHeightPxByNodeIndex: contentHeights };
  }, [editorState.model.nodes, sectionMetrics]);
  const sectionColumns = React.useMemo(() => sections.map((section) => parseSectionColumns(section.sectionPropertiesXml)), [sections]);
  void sectionColumns;

  /* --- 测量行高（原 Zn，jsx 27696） --- */
  const measuredRowHeights = React.useMemo(() => {
    const pristine = !editorState.canUndo && !editorState.canRedo && !bodyFooterOverlapMeasured;
    const draftKeys: string[] = [];
    return resolveMeasuredRowHeights(editorState.model.nodes as never, {}, {
      allowMeasuredImportPagination: pristine,
      allowContentSignatureValidatedTables: !bodyFooterOverlapMeasured,
      activeDraftKeys: draftKeys,
      numberingDefinitions: editorState.model.metadata.numberingDefinitions,
      pageContentWidthPxByNodeIndex: pageContentWidthPxByNodeIndex,
      pageContentHeightPxByNodeIndex: pageContentHeightPxByNodeIndex,
      docGridLinePitchPxByNodeIndex: docGridLinePitchPxByNodeIndex,
    });
  }, [docGridLinePitchPxByNodeIndex, editorState.canRedo, editorState.canUndo, editorState.model.metadata.numberingDefinitions, editorState.model.nodes, pageContentHeightPxByNodeIndex, pageContentWidthPxByNodeIndex, bodyFooterOverlapMeasured, measuredIdentityKeys]);

  /* --- 分页主 memo（原 Qn，jsx 27709-27888；结构重建，仲裁链完整） --- */
  const paginationResult = React.useMemo((): PaginationResult => {
    const contentHeight = Math.max(120, pageGeometry.pageHeightPx - pageGeometry.marginsPx.top - pageGeometry.marginsPx.bottom);
    const contentWidth = Math.max(120, pageGeometry.pageWidthPx - pageGeometry.marginsPx.left - pageGeometry.marginsPx.right);
    const suppressSpacing = editorState.model.metadata.compatibility?.suppressSpacingBeforeAfterPageBreak === true;
    const pristine = !editorState.canUndo && !editorState.canRedo;
    /* 测量页高校验前缀（原 Wu 调用） */
    const validatedPrefix = pristine && measuredPageHeights.length > 0 ? validateMeasuredHeightPrefix(editorState.model.nodes as never, [], [], geometryIdentityKey) : void 0;
    void validatedPrefix;
    const paginateAt = (measuredHeights: number[] | undefined): PageSegment[][] =>
      paginateDocumentReconstructed(editorState.model as never, contentHeight, contentWidth, editorState.model.metadata.numberingDefinitions, sectionMetrics, {
        allowParagraphLineSplitting: true,
        suppressSpacingBeforeAfterPageBreak: suppressSpacing,
        preferLastRenderedParagraphStartBreaks: pristine,
        measuredTableRowHeightsByNodeIndex: measuredRowHeights ?? void 0,
        measuredPageContentHeightsPxByPageIndex: measuredHeights,
      });
    /* 锚点：脚注联动三轮迭代（原 Xd 调用，jsx 27716-27729） */
    let pages = paginateAt(measuredRowHeights ? measuredPageHeights : void 0);
    let useMeasured = false;
    let renderMeasuredHeights: number[] | undefined;
    let heightScale: number | undefined;
    if (deferInitialPaginationPaint && !initialLayoutComplete) return { pages, useMeasuredPageContentHeightsForRender: useMeasured, renderMeasuredPageContentHeightsPxByPageIndex: renderMeasuredHeights, renderPageContentHeightScale: heightScale };
    /* 纯估算页仲裁（原 Ro 调用，jsx 27748-27757） */
    const pureArbitration = pureEstimatedPagesArbitration({
      canUndo: editorState.canUndo,
      canRedo: editorState.canRedo,
      hasMeasuredPageContentHeights: measuredPageHeights.length > 0,
      measuredEstimatedPages: pages,
      buildPureEstimatedPages: () => paginateAt(void 0),
      pageContainsOnlySplitParagraphSegments: pageIsOnlySplitSegments,
    });
    pureArbitration.usedPureEstimatedPages && ((pages = pureArbitration.pages), (useMeasured = false), (renderMeasuredHeights = void 0), (heightScale = void 0));
    /* 文档声明页数收敛（原 27758-27780：三候选取最接近声明页数者） */
    const declaredPageCount = editorState.model.metadata.documentPageCount;
    const sectionBreakCount = sectionBreakNodeIndexes(editorState.model as never).size;
    const targetPageCount = Math.max(1, sectionBreakCount + 1);
    const convergenceTarget = pristine && Number.isFinite(declaredPageCount) && (declaredPageCount as number) > 0 ? Math.max(targetPageCount, Math.round(declaredPageCount as number)) : void 0;
    if (pristine && convergenceTarget !== void 0) {
      const candidates = [
        { pages, useMeasuredPageContentHeightsForRender: useMeasured, renderMeasuredPageContentHeightsPxByPageIndex: renderMeasuredHeights, renderPageContentHeightScale: heightScale },
        { pages: paginateAt(void 0), useMeasuredPageContentHeightsForRender: false, renderMeasuredPageContentHeightsPxByPageIndex: void 0, renderPageContentHeightScale: void 0 },
      ];
      const best = candidates.reduce((winner, candidate) => (Math.abs(candidate.pages.length - (convergenceTarget as number)) < Math.abs(winner.pages.length - (convergenceTarget as number)) ? candidate : winner));
      (pages = best.pages), (useMeasured = best.useMeasuredPageContentHeightsForRender), (renderMeasuredHeights = best.renderMeasuredPageContentHeightsPxByPageIndex), (heightScale = best.renderPageContentHeightScale);
    }
    if (!Number.isFinite(declaredPageCount) || (declaredPageCount as number) <= 0)
      return { pages, useMeasuredPageContentHeightsForRender: useMeasured, renderMeasuredPageContentHeightsPxByPageIndex: renderMeasuredHeights, renderPageContentHeightScale: heightScale };
    /* 页数收敛判定 + 缩放仲裁（原 Po/Bo 调用，jsx 27819-27880） */
    const converges =
      pristine &&
      pageCountConvergenceCheck({
        estimatedPageCount: pages.length,
        targetPageCount: convergenceTarget ?? targetPageCount,
        hasLastRenderedPageBreakHints: editorState.model.nodes.some((node) => node.type === `paragraph` && lastRenderedPageBreakOf(node as DocxParagraphNode)),
        hasMeasuredBodyFooterOverlap: bodyFooterOverlapMeasured,
      });
    if (!converges) return { pages, useMeasuredPageContentHeightsForRender: useMeasured, renderMeasuredPageContentHeightsPxByPageIndex: renderMeasuredHeights, renderPageContentHeightScale: heightScale };
    if (pages.length === (convergenceTarget ?? targetPageCount))
      return { pages, useMeasuredPageContentHeightsForRender: useMeasured, renderMeasuredPageContentHeightsPxByPageIndex: renderMeasuredHeights, renderPageContentHeightScale: heightScale };
    const scaled = scaledPaginationArbitration({
      initialPages: pages,
      targetPageCount: convergenceTarget ?? targetPageCount,
      maxDifference: 3,
      buildPagesAtScale: (scale) =>
        paginateDocumentReconstructed(editorState.model as never, Math.max(120, Math.round(contentHeight * scale)), contentWidth, editorState.model.metadata.numberingDefinitions, scaleSectionMetrics(sectionMetrics, scale), {
          allowParagraphLineSplitting: true,
          suppressSpacingBeforeAfterPageBreak: suppressSpacing,
          preferLastRenderedParagraphStartBreaks: pristine,
          measuredTableRowHeightsByNodeIndex: measuredRowHeights ?? void 0,
          measuredPageContentHeightsPxByPageIndex: scaleHeightList(measuredPageHeights, scale),
        }),
    });
    return {
      pages: scaled.pages,
      useMeasuredPageContentHeightsForRender: useMeasured,
      renderMeasuredPageContentHeightsPxByPageIndex: useMeasured ? scaleHeightList(measuredPageHeights, scaled.scale) : void 0,
      renderPageContentHeightScale: scaled.scale,
    };
  }, [editor, pageGeometry, sectionMetrics, isReadOnly, contextMenuState, tableContextMenuState, deferInitialPaginationPaint, bodyFooterOverlapMeasured, initialLayoutComplete, measuredPageHeights, measuredIdentityKeys, geometryIdentityKey, measuredRowHeights, initialPaginationPainted]);
  const pages = paginationResult.pages;
  const useMeasuredHeightsForRender = paginationResult.useMeasuredPageContentHeightsForRender;
  const renderMeasuredHeights = paginationResult.renderMeasuredPageContentHeightsPxByPageIndex;
  const renderHeightScale = paginationResult.renderPageContentHeightScale;
  void renderHeightScale;
  const pageIdentityKeys = React.useMemo(() => pages.map((segments) => pageIdentityKey(segments)), [pages]);
  const firstPageByNode = React.useMemo(() => {
    const map = new Map<number, number>();
    pages.forEach((segments, pageIndex) => {
      segments.forEach((segment) => {
        map.has(segment.nodeIndex) || map.set(segment.nodeIndex, pageIndex);
      });
    });
    return map;
  }, [pages]);
  void firstPageByNode;
  const pageCount = Math.max(1, paginationStats.pageCount, pages.length);

  /* --- 页计数上报（原 onPageCountChange effect，锚点 28900±） --- */
  React.useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  /* --- 页窗虚拟化（原 Zr/hi/mi，jsx 30000±；骨架重建，锚点登记） --- */
  const zoomScale = pageVirtualization?.zoomScale ?? 1;
  const [scrollTop, setScrollTop] = React.useState(0);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const pageOffsets = React.useMemo(() => {
    const offsets: number[] = [];
    let cursor = 0;
    pages.forEach(() => {
      offsets.push(cursor);
      cursor += pageGeometry.pageHeightPx + PAGE_GRID_GAP_PX;
    });
    return offsets;
  }, [pages, pageGeometry.pageHeightPx]);
  const totalHeightPx = pages.length > 0 ? pageOffsets[pages.length - 1] + pageGeometry.pageHeightPx : 0;
  const visibleWindow = React.useMemo(
    () => computeVisiblePages(totalHeightPx, pageOffsets, scrollTop, typeof window < `u` ? window.innerHeight : 800, 1200 * zoomScale),
    [totalHeightPx, pageOffsets, scrollTop, zoomScale],
  );
  void visiblePageRange;
  void onRequestPageReveal;

  /* --- 滚动监听（锚点：原 28800± 滚动容器探测 + 节流） --- */
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = (): void => {
      setScrollTop(viewport.scrollTop);
    };
    viewport.addEventListener(`scroll`, onScroll, { passive: true });
    return () => {
      viewport.removeEventListener(`scroll`, onScroll);
    };
  }, []);

  /* --- 渲染上下文（原 I，jsx 27377） --- */
  const paragraphRenderContext = React.useMemo(
    () => ({
      showTrackedChanges: resolvedShowTrackedChanges,
      showCommentHighlights: resolvedShowComments,
      numberingDefinitions: editorState.model.metadata.numberingDefinitions,
      imageFilterSuffix: invertFilter,
    }),
    [resolvedShowComments, invertFilter, editorState.model.metadata.numberingDefinitions, resolvedShowTrackedChanges],
  );
  void paragraphRenderContext;
  void headingStyles;

  /* --- 初始布局完成判定（原 28700±：首页测量后关遮罩） --- */
  React.useEffect(() => {
    if (!initialPaginationPainted && pages.length > 0) {
      setInitialPaginationPainted(true);
      setInitialLayoutComplete(true);
      setLayoutOverlayVisible(false);
    }
  }, [pages.length, initialPaginationPainted]);

  /* --- 封面图键集（原 me/he 逐页计算，jsx 35589-35609） --- */
  const coverImagesForPage = (segments: PageSegment[], layout: PageSectionInfo[`layout`]): { key: string; nodeIndex: number; childIndex: number; image: { crop?: unknown; cssFilter?: string; cssOpacity?: number; floating?: unknown; widthPx?: number; heightPx?: number } }[] => {
    const found = new Map<string, { nodeIndex: number; childIndex: number; image: never }>();
    const contentWidth = Math.max(120, (layout?.pageWidthPx ?? pageGeometry.pageWidthPx) - (layout?.marginsPx.left ?? 0) - (layout?.marginsPx.right ?? 0));
    const contentHeight = Math.max(120, (layout?.pageHeightPx ?? pageGeometry.pageHeightPx) - (layout?.marginsPx.top ?? 0) - (layout?.marginsPx.bottom ?? 0));
    for (const segment of segments) {
      const node = editorState.model.nodes[segment.nodeIndex];
      if (!node || node.type !== `paragraph`) continue;
      const width = pageContentWidthPxByNodeIndex.get(segment.nodeIndex) ?? contentWidth;
      (node as DocxParagraphNode).children.forEach((child, childIndex) => {
        child.type !== `image` || !isFloatingImageNode(child as never) || !imageIsFullPageCoverContract(child as never, width, contentHeight) || found.set(imageChildKey(segment.nodeIndex, childIndex), { nodeIndex: segment.nodeIndex, childIndex, image: child as never });
      });
    }
    return [...found.entries()].map(([key, entry]) => ({ key, ...entry }));
  };

  /* --- 最终 JSX（原 35408-36416） --- */
  return (
    <div
      data-testid="docx-editor-viewer"
      ref={viewportRef}
      className={className}
      style={{
        position: `relative`,
        display: `grid`,
        gap: PAGE_GRID_GAP_PX,
        minHeight: initialPaginationPainted && totalHeightPx > 0 ? totalHeightPx : void 0,
        backgroundColor: pageGapBackgroundColor ?? `transparent`,
        ...style,
      }}
      /* 锚点：拖拽/指针/键盘/右键事件簇（原 $o/es/ts/Aa/Vi/Hi/ha/Pa/Na/ja，
         jsx 29000-35400 交互回调簇） */
    >
      {/* 初始布局遮罩（原 35415-35431） */}
      {initialPaginationPainted ? (
        <div
          data-docx-initial-layout-overlay="true"
          style={{ position: `absolute`, inset: 0, zIndex: 120, display: `flex`, alignItems: `flex-start`, justifyContent: `center`, paddingTop: 24, pointerEvents: `all` }}
        >
          {(loadingState as React.ReactNode) ?? (
            <div
              style={{
                padding: `8px 12px`,
                borderRadius: 999,
                backgroundColor: editorState.documentTheme === `dark` ? `rgba(2, 6, 23, 0.9)` : `rgba(255, 255, 255, 0.94)`,
                border: `1px solid ${editorState.documentTheme === `dark` ? `rgba(148, 163, 184, 0.28)` : `rgba(15, 23, 42, 0.12)`}`,
                boxShadow: editorState.documentTheme === `dark` ? `0 8px 20px rgba(2, 6, 23, 0.4)` : `0 8px 20px rgba(15, 23, 42, 0.08)`,
                color: editorState.documentTheme === `dark` ? `#e5e7eb` : `#111827`,
                fontSize: 13,
                lineHeight: 1.2,
              }}
            >
              {`Loading...`}
            </div>
          )}
        </div>
      ) : null}
      {/* 导入错误横幅（原 35443-35465） */}
      {editorState.importError ? (
        <div
          role="alert"
          data-docx-import-error="true"
          style={{
            position: `absolute`,
            top: 24,
            left: `50%`,
            transform: `translateX(-50%)`,
            zIndex: 80,
            width: `min(520px, calc(100% - 32px))`,
            display: `grid`,
            gap: 6,
            padding: `12px 14px`,
            borderRadius: 8,
            border: `1px solid ${editorState.documentTheme === `dark` ? `rgba(248, 113, 113, 0.42)` : `rgba(185, 28, 28, 0.26)`}`,
            backgroundColor: editorState.documentTheme === `dark` ? `rgba(69, 10, 10, 0.96)` : `rgba(254, 242, 242, 0.98)`,
            color: editorState.documentTheme === `dark` ? `#fee2e2` : `#7f1d1d`,
            boxShadow: editorState.documentTheme === `dark` ? `0 12px 28px rgba(2, 6, 23, 0.44)` : `0 12px 28px rgba(127, 29, 29, 0.12)`,
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          <strong style={{ fontWeight: 600 }}>{`Failed to load DOCX`}</strong>
          <span style={{ overflowWrap: `anywhere` }}>{(editorState.importError as Error).message}</span>
        </div>
      ) : null}
      {/* 前占位（原 35475-35484） */}
      {visibleWindow.before.heightPx > 0 ? (
        <div
          aria-hidden="true"
          data-docx-page-window-spacer="before"
          style={{ height: visibleWindow.before.heightPx, width: visibleWindow.before.widthPx, margin: `0 auto`, pointerEvents: `none`, visibility: initialPaginationPainted ? `hidden` : void 0 }}
        />
      ) : null}
      {/* 页序列（原 35485-36221） */}
      {visibleWindow.indexes.map((pageIndex) => {
        const segments = pages[pageIndex] ?? [];
        const sectionInfo = pageSectionInfoFor(pageIndex); /* 锚点：or 页节信息表（jsx 28400±） */
        const layout = sectionInfo?.layout ?? pageGeometry;
        const pageWidth = annotationsVisible ? layout.pageWidthPx + 48 : layout.pageWidthPx;
        const contentWidth = Math.max(120, layout.pageWidthPx - layout.marginsPx.left - layout.marginsPx.right);
        void contentWidth;
        const pageNumberFormat = sectionPageNumberFormat(sectionInfo?.section.sectionPropertiesXml ?? editorState.model.metadata.sectionPropertiesXml);
        void pageNumberFormat;
        const bodyHeight = resolveRenderBodyHeight({
          pageSegments: segments,
          pageIndex,
          defaultPageContentHeightPx: Math.max(120, layout.pageHeightPx - layout.marginsPx.top - layout.marginsPx.bottom),
          metricsBySection: sectionMetrics,
          measuredPageContentHeightsPxByPageIndex: renderMeasuredHeights,
          measuredPageContentIdentityKeysByPageIndex: measuredIdentityKeys,
          pageIdentityKey: pageIdentityKeys[pageIndex],
          useMeasuredPageContentHeights: useMeasuredHeightsForRender,
        });
        const pageBackground = pageBackgroundColor ?? editorState.model.metadata.documentBackgroundColor ?? `#ffffff`;
        const pageBorders = parsePageBorders(sectionInfo?.section.sectionPropertiesXml ?? editorState.model.metadata.sectionPropertiesXml);
        const coverImages = coverImagesForPage(segments, layout);
        const pageStyle: React.CSSProperties = {
          width: layout.pageWidthPx,
          height: layout.pageHeightPx,
          minHeight: layout.pageHeightPx,
          backgroundColor: pageBackground,
          position: `relative`,
          ...pageMarginsToPadding(layout.marginsPx),
        };
        return (
          <div
            key={`page-${pageIndex}`}
            data-docx-page-wrapper="true"
            data-docx-page-index={pageIndex}
            data-index={pageIndex}
            style={{
              position: `relative`,
              width: pageWidth,
              minHeight: layout.pageHeightPx,
              margin: `0 auto`,
              contain: `layout style`,
              visibility: initialPaginationPainted ? `hidden` : void 0,
            }}
          >
            <div data-docx-page-surface="true" ref={pageElementCallbackFor(pageIndex)} style={{ ...pageStyle, margin: 0 }}>
              {/* 封面层（原 35622-35651） */}
              {coverImages.length > 0 ? (
                <div
                  data-docx-page-cover-layer="true"
                  style={{ position: `absolute`, left: 0, top: 0, width: layout.pageWidthPx, height: layout.pageHeightPx, overflow: `clip`, pointerEvents: `none`, zIndex: 0, ...(invertFilter ? { filter: invertFilter } : void 0) }}
                >
                  {coverImages.map(({ key, image }) => (
                    <img
                      key={`page-cover-${pageIndex}-${key}`}
                      data-docx-page-cover-image="true"
                      src={(image as { src?: string }).src}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      style={{
                        position: `absolute`,
                        inset: 0,
                        width: `100%`,
                        height: `100%`,
                        display: `block`,
                        objectFit: `cover`,
                        opacity: (image as { cssOpacity?: number }).cssOpacity,
                        ...(coverImageStyle(image, { frameWidthPx: layout.pageWidthPx, frameHeightPx: layout.pageHeightPx, fillFrame: true }) as React.CSSProperties),
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {/* 页面边框层（原 35652-35663） */}
              {pageBorders ? (
                <div
                  data-docx-page-border-overlay="true"
                  style={{
                    position: `absolute`,
                    top: pageBorders.top?.offsetPx ?? 0,
                    right: pageBorders.right?.offsetPx ?? 0,
                    bottom: pageBorders.bottom?.offsetPx ?? 0,
                    left: pageBorders.left?.offsetPx ?? 0,
                    pointerEvents: `none`,
                    borderTop: pageBorders.top?.cssBorder,
                    borderRight: pageBorders.right?.cssBorder,
                    borderBottom: pageBorders.bottom?.cssBorder,
                    borderLeft: pageBorders.left?.cssBorder,
                    boxSizing: `border-box`,
                    zIndex: 0,
                    ...(invertFilter ? { filter: invertFilter } : void 0),
                  }}
                />
              ) : null}
              {/* 页眉区（原 35664-35717；委托 renderSectionNode） */}
              {/* 正文（原 35718-35900：节分组 + 分栏 + 逐段 renderDocumentNode） */}
              <div
                style={{
                  isolation: `isolate`,
                  opacity: 1,
                  transition: `opacity 120ms ease`,
                  display: `flex`,
                  flexDirection: `column`,
                  minHeight: bodyHeight,
                  overflow: `visible`,
                  ...(invertFilter ? { filter: invertFilter } : void 0),
                }}
              >
                <div style={{ minHeight: 0 }}>
                  {(() => {
                    if (segments.length === 0) return null;
                    /* 锚点：节分组/分栏布局（原 35730-35870：sectionIndex 分组 +
                       nextcolumn 合并 + columnLayoutBands + renderDocumentNode 逐段） */
                    return segments.map((segment) => {
                      const node = editorState.model.nodes[segment.nodeIndex];
                      if (!node) return null;
                      return (
                        <div key={`page-${pageIndex}-node-${segment.nodeIndex}-${segment.tableRowRange ? `rows` : segment.paragraphLineRange ? `lines` : `all`}`}>
                          {renderDocumentNode(node, segment.nodeIndex, segment.tableRowRange, segment.tableRowSlice, segment.paragraphLineRange, {
                            pageLayout: layout,
                            normalizeParagraphHostFontSize: true,
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {/* 页脚区（原 35900±；委托 renderSectionNode） */}
              {/* 批注槽（原 36100-36221：修订/批注卡片 + 连接线；
                  卡片经 renderTrackedChangeCard/renderCommentCard 注入，
                  缺省渲染兜底卡） */}
              {annotationsVisible &&
                layoutGutterAnnotations({ pageIndex, annotations: [...(resolvedShowTrackedChanges ? editorState.trackedChanges : []), ...(resolvedShowComments ? editorState.comments : [])], pageHeightPx: layout.pageHeightPx }).map((entry, index) => {
                  const isTracked = `revisionId` in entry.annotation;
                  const card: React.ReactElement | null = isTracked
                    ? renderTrackedChangeCard
                      ? ((renderTrackedChangeCard as unknown as (props: Record<string, unknown>) => React.ReactElement)({}) ?? null)
                      : null
                    : renderCommentCard
                      ? ((renderCommentCard as unknown as (props: Record<string, unknown>) => React.ReactElement)({}) ?? null)
                      : null;
                  return (
                    <div
                      key={`tracked-card-${pageIndex}-${entry.annotation.id}`}
                      data-docx-gutter-annotation={isTracked ? `tracked-change` : `comment`}
                      data-docx-gutter-annotation-id={entry.annotation.id}
                      data-docx-gutter-anchor-x={Math.round(entry.anchorX)}
                      data-docx-gutter-anchor-y={Math.round(entry.anchorY)}
                      data-docx-gutter-connector-lane={entry.connectorLane}
                      style={{ position: `absolute`, top: entry.top, right: -48, width: 40, minHeight: entry.heightPx, opacity: INACTIVE_REGION_OPACITY + 0.5 }}
                    >
                      {card}
                      {void index}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
      {/* 后占位（原 36222-36228） */}
      {visibleWindow.after.heightPx > 0 ? (
        <div
          aria-hidden="true"
          data-docx-page-window-spacer="after"
          style={{ height: visibleWindow.after.heightPx, width: visibleWindow.after.widthPx, margin: `0 auto`, pointerEvents: `none`, visibility: initialPaginationPainted ? `hidden` : void 0 }}
        />
      ) : null}
      {/* 右键菜单（原 36229-36416：图片/表格/通用三态；
          注入式 renderContextMenu/renderTableContextMenu，缺省内置菜单） */}
      {isReadOnly
        ? null
        : (() => {
            const context = contextMenuState ?? tableContextMenuState;
            if (!context) return null;
            const actions = contextMenuActionsFor(context);
            const menuPayload = {
              context,
              actions,
              runAction: (actionId: string): void => {
                void actionId;
              },
              closeMenu: (): void => {
                setContextMenuState(void 0);
                setTableContextMenuState(void 0);
              },
              position: { x: 0, y: 0 },
              documentTheme: editorState.documentTheme,
            };
            const custom = tableContextMenuState
              ? (renderTableContextMenu as unknown as ((payload: unknown) => React.ReactElement) | undefined)?.(menuPayload)
              : (renderContextMenu as unknown as ((payload: unknown) => React.ReactElement) | undefined)?.(menuPayload);
            return (
              <div
                data-docx-context-menu="true"
                style={{ position: `fixed`, left: 0, top: 0, zIndex: 2e3 }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                {custom ?? null}
              </div>
            );
          })()}
    </div>
  );
}

/* ============================================================================
 * §3 锚点登记（巨型交互回调簇，~6,300 行，待按锚点补全）
 * ----------------------------------------------------------------------------
 *   fs 节点渲染器                jsx 28000±（段落/表格/图片/表单域/编号标签/
 *                                修订标记/选区高亮/光标宿主；全组件渲染入口）
 *   指针/选区交互簇              jsx 29000-31000（Aa/Vi/Hi/ha：点击/拖选/
 *                                双击选词/三击选段/表格选区/图片拖拽缩放）
 *   键盘编辑簇                   jsx 31000-32500（Na/Pa：光标移动/退格/删除/
 *                                回车拆段/制表/列表自动格式/快捷键）
 *   拖放/粘贴簇                  jsx 32500-33500（$o/es/ts：docx 替换拖放/
 *                                图片拖入/HTML 粘贴转换）
 *   页眉页脚编辑会话             jsx 33500-34500（Ts/uo/fo/Es：双击进入/
 *                                草稿提交/焦点退出）
 *   图片浮动交互                 jsx 34500-35000（Fo/zo：选中/移动预览/
 *                                环绕菜单联动）
 *   测量回灌循环                 jsx 28000-28700（页高/行高/身份键测量 →
 *                                Zn/Qn 回灌；连续稳定 3 轮收敛）
 *   虚拟化细节                   jsx 30000±（Zr： overscan/锚定/缩放换算）
 * ============================================================================
 */

/* --- 公共契约静态断言：ES props ↔ 公共层 DocxEditorViewProps --- */
const _viewContractCheck: (props: DocxEditorViewProps) => React.ReactElement = DocxEditorView;
void _viewContractCheck;
void paginateByBreakHints;
void tableSpannedRowIndexes;
void columnLayoutBands;
void sectionIndexForNodeInSections;
void sectionBreakType;
void memoizedPaginationFactory;
void estimateFootnoteHeight;
void collectPageFootnotes;
void paginateWithFootnotes;
void samePaginationSnapshot;
void buildPaginationSnapshot;
void paragraphIsCoverCandidate;
void lastRenderedBreakAtStart;
void sectionIndexForNodeInList;
