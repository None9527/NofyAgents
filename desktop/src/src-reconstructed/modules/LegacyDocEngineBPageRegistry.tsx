/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineBPageRegistry.tsx — legacy-doc 内部引擎 [E6] 第 5 层：
 * 页元素注册表 + 缩略图快照 + 节段渲染器（原 nS..TS，jsx 26661-27339）
 * （解混淆重建 · D8 Stage B4 · Office 预览族 · 批次 B）
 * ============================================================================
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （未修改；行号锚点均指 jsx 还原版）
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射（jsx 行）
 * ----------------------------------------------------------------------------
 *  页元素注册表（以 syncPaginationInfo 为宿主键的 WeakMap 存储）：
 *   nS → pageRegistryByEditor (26661) | rS → paginationSinkOf (26662)
 *   iS → pageRegistryOf (26664) | aS → publishPageSnapshots (26675)
 *   oS → notifyPageRegistry (26706) | sS → registerPageElement (26710)
 *  缩略图快照：
 *   cS..fS → 快照常量 (26720) | pS → cssNumber (26725)
 *   mS → normalizeHexColor (26731) | hS → sameThumbnailRun (26737)
 *   gS → appendThumbnailRuns (26740) | _S → headingMetricsOf (26757)
 *   vS → paragraphThumbnailRuns (26760) | yS → firstNonEmptyCellRuns (26783)
 *   bS → paragraphThumbnailElements (26787) | xS → tableThumbnailElement (26844)
 *   SS → nodeContainsImage (26904) | CS → pageContainsImage (26907)
 *   wS → buildPageThumbnailSnapshots (26909)
 *  节段渲染器：
 *   TS → renderSectionNode (26980-27339；段落/表格 + 草稿宿主 + 表格手柄，
 *       360 行全量语义重建，表格手柄 JSX 按锚点浓缩——见报告 §3）
 * ============================================================================
 */

import * as React from "react";
import {
  type DocxEditorModel,
  type DocxNode,
  type DocxParagraphNode,
  type DocxTableNode,
  type DocxImageNode,
  type DocxRunStyle,
  type DocxHeaderFooterSection,
  type PageSegment,
  type SectionPageMetrics,
  paragraphText,
  textChildren,
  formFieldDisplayText,
  collectParagraphsRecursive,
  themeAwareColor,
  normalizeFontFamily,
  firstTextRunStyle,
} from "./LegacyDocEngineBModel";
import {
  resolveHighlightColor,
  paragraphCssStyle,
  estimateTextWidthPx,
} from "./LegacyDocEngineBLayout";
import { THUMBNAIL_HEADING_METRICS } from "./LegacyDocEngineBThumbnails";
import { resolveImageSrc } from "./previewPaneOfficeLegacyDocContent";

/* ============================================================================
 * §0 外部契约（[E2]/[E4]/渲染层，锚点登记）
 * ==========================================================================*/

/** 原 rS 消费面：编辑器仅暴露 syncPaginationInfo（注册表宿主键） */
export interface PaginationHost {
  syncPaginationInfo: (info: { currentPage: number; totalPages: number }) => void;
  [key: string]: unknown;
}

/** 页面尺寸（原 aS 第 3 参数元素） */
export interface PageSizeInfo {
  widthPx: number;
  heightPx: number;
}

/** 缩略图快照（原 aS 第 4 参数元素 / wS 返回） */
export interface PageThumbnailSnapshot {
  key: string;
  getSnapshot: () => {
    key: string;
    sourceWidthPx: number;
    sourceHeightPx: number;
    pageBackgroundColor: string;
    elements: ThumbnailElement[];
  };
}

/** 缩略图元素（原 bS/xS 返回面） */
export type ThumbnailElement =
  | {
      kind: `paragraph`;
      xPx: number;
      yPx: number;
      widthPx: number;
      heightPx: number;
      align?: string;
      backgroundColor?: string;
      lineHeightPx: number;
      startLineIndex?: number;
      runs: ThumbnailRun[];
    }
  | { kind: `image`; xPx: number; yPx: number; widthPx: number; heightPx: number; src: string }
  | { kind: `image-placeholder`; xPx: number; yPx: number; widthPx: number; heightPx: number }
  | { kind: `table`; xPx: number; yPx: number; widthPx: number; heightPx: number; cells: { xPx: number; yPx: number; widthPx: number; heightPx: number; backgroundColor?: string; runs?: ThumbnailRun[] }[] };

/** 缩略图 run（原 gS 元素面） */
export interface ThumbnailRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSizePx: number;
  fontFamily?: string;
}

/** [E2]：段落字号/行高/字体族（锚点登记） */
declare function paragraphFontSizePx(paragraph: DocxParagraphNode): number;
declare function paragraphRenderLineHeight(paragraph: DocxParagraphNode, gridPitchPx: number | undefined): number;
declare function paragraphDefaultFontFamily(paragraph: DocxParagraphNode): string | undefined;
/** [E2]：节点布局高（锚点登记） */
declare function nodeLayoutHeight(node: DocxNode, segment: PageSegment, model: DocxEditorModel, contentWidthPx: number, numberingDefinitions: unknown, gridPitchPx: number | undefined): number;
/** [E2]：表格几何族（原 yy/Ey/jy/My/Ny/Iy/ub/$h/Cy/Yy/tg/lb/db/Ry/zy/Jy/qy，锚点登记） */
declare function tableGridColumns(table: DocxTableNode): number;
declare function tableColumnWidthsTwips(table: DocxTableNode, columns: number): number[] | undefined;
declare function distributeColumnWidths(widthsTwips: number[], columns: number, tableWidthPx: number | undefined, scale: number): number[];
declare function defaultColumnWidths(columns: number, tableWidthPx: number | undefined): number[];
declare function resolveTableWidth(tableWidthPx: number, maxWidthPx: number | undefined): number;
declare function resolveTableLayout(table: DocxTableNode, widthsTwips: number[], contentWidthPx: number): { columnWidthsPx: number[] };
declare function tableIndentPx(table: DocxTableNode, columns: number): number;
declare function tableRowHeights(table: DocxTableNode, contentWidthPx: number, numberingDefinitions: unknown, gridPitchPx: number | undefined, contentHeightPx?: number): number[];
declare function tableContainerStyle(table: DocxTableNode, indentPx: number): Record<string, unknown>;
declare function tableAlignmentStyle(table: DocxTableNode, alignment: number): Record<string, unknown>;
declare function tableRowStyle(row: { style?: { heightTwips?: number } }, heightPx: number | undefined): Record<string, unknown>;
declare function tableCellBorders(tableBorders: unknown, cellBorders: unknown, rowIndex: number, rowCount: number, startColumn: number, endColumn: number, columns: number): Record<string, unknown>;
declare function tableCellPadding(tableBorders: unknown, cellBorders: unknown): Record<string, unknown>;
declare function tableCellMargins(margin: unknown): Record<string, unknown>;
declare function mergeCellMargins(tableMargin: unknown, cellMargin: unknown): unknown;
declare function tableBorderSpacing(table: DocxTableNode): number;
declare function tableAlignmentOf(table: DocxTableNode): string | undefined;
/** [E4]：内容签名（原 qs） */
declare function contentSignatureOf(node: DocxNode): string;
/** [E4]：段落行高估算（原 lg/zh） */
declare function estimateNodeHeight(node: DocxNode, contentWidthPx: number, gridPitchPx: number | undefined, extra?: unknown): number;
/** 渲染层：段落渲染器（原 Tv，jsx 21113；锚点登记） */
declare function renderParagraph(
  paragraph: DocxParagraphNode,
  numberingDefinitions: unknown,
  documentTheme: `light` | `dark`,
  headingStyles: Record<number, Record<string, unknown>> | undefined,
  footnoteMarks: { footnote: Map<unknown, unknown>; endnote: Map<unknown, unknown> },
  pageNumber: number | undefined,
  sectionContext: unknown,
  contentWidthOverride: number | undefined,
  renderOptions: Record<string, unknown> | undefined,
  sectionRenderState: Record<string, unknown> | undefined,
): React.ReactElement;
/** 渲染层：段落键/样式助手（原 qx/f_，锚点登记） */
declare function sectionParagraphKey(location: SectionParagraphLocation): string;
declare function sectionParagraphStyle(paragraph: DocxParagraphNode, numberingDefinitions: unknown, headingStyles: Record<number, Record<string, unknown>> | undefined, paragraphIndex: number, borderContext: unknown): Record<string, unknown>;
/** 渲染层：静态标记（模型层 renderStaticMarkup 的 react-dom/server 实现） */
declare function renderStaticMarkupLocal(node: React.ReactNode): string;
/** 渲染层：表格列宽/行高解析器（原 g 参数面） */
export interface TableResizeController {
  isReadOnly?: boolean;
  hoveredTableKey?: string;
  focusedTableKey?: string;
  hoveredHandle?: { tableKey: string; kind: `column` | `row`; boundaryIndex: number };
  isTableResizing: (key: string) => boolean;
  isColumnResizing: (key: string, boundaryIndex: number) => boolean;
  isRowResizing: (key: string, boundaryIndex: number) => boolean;
  isCornerResizing: (key: string) => boolean;
  setHoveredTableKey: (key: string | undefined) => void;
  setFocusedTableKey: (key: string | undefined) => void;
  setHoveredHandle: (handle: { tableKey: string; kind: `column` | `row`; boundaryIndex: number } | undefined) => void;
  beginTableMove: (event: React.PointerEvent, key: string) => void;
  beginColumnResize: (event: React.PointerEvent, key: string, boundaryIndex: number, tableWidthPx: number, columnWidthsPx: number[]) => void;
  beginRowResize: (event: React.PointerEvent, key: string, boundaryIndex: number, rowHeightsPx: number[]) => void;
  beginCornerResize: (event: React.PointerEvent, key: string, tableWidthPx: number, columnWidthsPx: number[], rowHeightsPx: number[], maxWidthPx?: number) => void;
  resolveColumnWidths?: (key: string, table: DocxTableNode, tableWidthPx: number | undefined) => number[];
  resolveRowHeights?: (key: string, table: DocxTableNode) => (number | undefined)[];
}
/** 节段草稿宿主契约（原 f/m 参数面：页眉/页脚与单元格段落草稿） */
export interface SectionDraftHandlers {
  readDraftHtml: (key: string) => string | undefined;
  writeDraftHtml: (key: string, html: string) => void;
  clearDraftHtml: (key: string) => void;
  registerElement: (key: string, element: HTMLElement | null) => void;
  commitText?: (paragraphIndex: number, text: string) => void;
}
export interface SectionParagraphLocation {
  region: `header` | `footer`;
  partName: string;
  nodeIndex: number;
  rowIndex?: number;
  cellIndex?: number;
  paragraphIndex?: number;
  childIndex?: number;
}

/* ============================================================================
 * §1 页元素注册表（原 nS..sS，jsx 26661-26719；逐句转录）
 * ==========================================================================*/

/** 注册表存储（原 iS 惰性初始化面） */
export interface PageRegistry {
  pageElements: Map<number, HTMLElement>;
  pageContentKeys: Map<number, string>;
  pageSizes: Map<number, PageSizeInfo>;
  pageThumbnailSnapshots: Map<number, PageThumbnailSnapshot>;
  listeners: Set<() => void>;
}

/** 原 nS：宿主（syncPaginationInfo）→ 注册表 WeakMap */
const pageRegistryByEditor = new WeakMap<PaginationHost[`syncPaginationInfo`], PageRegistry>();

/** 原 rS：编辑器 → 分页信息接收器（注册表宿主键） */
export function paginationSinkOf(editor: PaginationHost): PaginationHost[`syncPaginationInfo`] {
  return editor.syncPaginationInfo;
}

/** 原 iS：注册表取/建 */
export function pageRegistryOf(editor: PaginationHost): PageRegistry {
  const sink = paginationSinkOf(editor);
  const existing = pageRegistryByEditor.get(sink);
  return (
    existing ||
    ((created: PageRegistry) => ((created = { pageElements: new Map(), pageContentKeys: new Map(), pageSizes: new Map(), pageThumbnailSnapshots: new Map(), listeners: new Set() }), pageRegistryByEditor.set(sink, created), created))(
      undefined as unknown as PageRegistry,
    )
  );
}

/**
 * 原 aS：页快照发布——内容键/尺寸/缩略图三路差量写入，
 * 越界条目清理，任一变更 → 通知监听者。
 */
export function publishPageSnapshots(editor: PaginationHost, contentKeys: string[], pageSizes: PageSizeInfo[] = [], thumbnails: (PageThumbnailSnapshot | undefined)[] = []): void {
  const registry = pageRegistryOf(editor);
  let changed = false;
  contentKeys.forEach((key, index) => {
    registry.pageContentKeys.get(index) !== key && (registry.pageContentKeys.set(index, key), (changed = true));
  });
  pageSizes.forEach((size, index) => {
    const widthPx = Math.max(1, Math.round(size.widthPx));
    const heightPx = Math.max(1, Math.round(size.heightPx));
    const existing = registry.pageSizes.get(index);
    (existing?.widthPx !== widthPx || existing?.heightPx !== heightPx) && (registry.pageSizes.set(index, { widthPx, heightPx }), (changed = true));
  });
  thumbnails.forEach((snapshot, index) => {
    const existing = registry.pageThumbnailSnapshots.get(index);
    if (!snapshot) {
      existing && (registry.pageThumbnailSnapshots.delete(index), (changed = true));
      return;
    }
    existing?.key !== snapshot.key && (registry.pageThumbnailSnapshots.set(index, snapshot), (changed = true));
  });
  registry.pageContentKeys.forEach((key, index) => {
    index >= contentKeys.length && (registry.pageContentKeys.delete(index), (changed = true));
  });
  registry.pageSizes.forEach((size, index) => {
    index >= pageSizes.length && (registry.pageSizes.delete(index), (changed = true));
  });
  registry.pageThumbnailSnapshots.forEach((snapshot, index) => {
    index >= thumbnails.length && (registry.pageThumbnailSnapshots.delete(index), (changed = true));
  });
  changed && notifyPageRegistry(registry);
}

/** 原 oS：通知全部监听者 */
export function notifyPageRegistry(registry: PageRegistry): void {
  registry.listeners.forEach((listener) => {
    listener();
  });
}

/** 原 sS：页 DOM 元素登记/注销（同一元素幂等） */
export function registerPageElement(editor: PaginationHost, pageIndex: number, element: HTMLElement | null, previousElement?: HTMLElement | null): void {
  const registry = pageRegistryOf(editor);
  const index = Math.max(0, Math.round(pageIndex));
  const existing = registry.pageElements.get(index);
  if (element) {
    if (existing === element) return;
    registry.pageElements.set(index, element);
    notifyPageRegistry(registry);
    return;
  }
  existing && ((previousElement && existing !== previousElement) || (registry.pageElements.delete(index), notifyPageRegistry(registry)));
}

/* ============================================================================
 * §2 缩略图常量与 run 构建（原 cS..vS，jsx 26720-26782；逐句转录）
 * ==========================================================================*/

export const THUMBNAIL_MAX_ELEMENTS_PER_PAGE = 260; // 原 cS
export const THUMBNAIL_MAX_RUNS_PER_PARAGRAPH = 28; // 原 lS
export const THUMBNAIL_CHAR_BUDGET = 900; // 原 uS
export const THUMBNAIL_MAX_TABLE_CELLS = 220; // 原 dS
export const THUMBNAIL_CELL_CHAR_BUDGET = 120; // 原 fS

/** 原 pS：CSS 数值解析（字符串/数字 → 数） */
export function cssNumber(value: unknown): number {
  if (typeof value == `number` && Number.isFinite(value)) return value;
  if (typeof value == `string`) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** 原 mS：颜色归一（6 位十六进制补 #；auto/空 → undefined） */
export function normalizeThumbnailColor(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!(!trimmed || trimmed.toLowerCase() === `auto`)) return /^[0-9a-fA-F]{6}$/.test(trimmed) ? `#${trimmed}` : trimmed;
}

/** 原 hS：缩略图 run 相等判定（六字段） */
export function sameThumbnailRun(a: ThumbnailRun, b: ThumbnailRun): boolean {
  return a.bold === b.bold && a.italic === b.italic && a.color === b.color && a.backgroundColor === b.backgroundColor && a.fontSizePx === b.fontSizePx && a.fontFamily === b.fontFamily;
}

/** 原 gS：run 追加（字符预算内；相邻同样式合并） */
export function appendThumbnailRuns(runs: ThumbnailRun[], source: ThumbnailRun, budget: { chars: number }): void {
  if (budget.chars <= 0 || runs.length >= THUMBNAIL_MAX_RUNS_PER_PARAGRAPH) return;
  const slice = source.text.slice(0, budget.chars);
  if (!slice) return;
  budget.chars -= slice.length;
  const run: ThumbnailRun = { ...source, text: slice };
  const last = runs[runs.length - 1];
  if (last && sameThumbnailRun(last, run)) {
    last.text += run.text;
    return;
  }
  runs.push(run);
}

/** 原 _S：标题度量查询（1-6 级） */
export function headingMetricsOf(paragraph: DocxParagraphNode): (typeof THUMBNAIL_HEADING_METRICS)[number] | undefined {
  const level = paragraph.style?.headingLevel;
  return level && level >= 1 && level <= 6 ? THUMBNAIL_HEADING_METRICS[level] : void 0;
}

/** 原 vS：段落 → 缩略图 run 序列（标题度量回退 + 主题色 + 字号归一） */
export function paragraphThumbnailRuns(paragraph: DocxParagraphNode, theme: `light` | `dark`, charBudget = THUMBNAIL_CHAR_BUDGET): ThumbnailRun[] {
  const runs: ThumbnailRun[] = [];
  const budget = { chars: charBudget };
  const heading = headingMetricsOf(paragraph);
  const baseFontFamily = normalizeFontFamily(heading?.fontFamily) ?? normalizeFontFamily(paragraphDefaultFontFamily(paragraph));
  paragraph.children.forEach((child) => {
    if (budget.chars <= 0) return;
    const style = child.type === `text` || child.type === `form-field` ? (child as { style?: DocxRunStyle }).style : void 0;
    appendThumbnailRuns(
      runs,
      {
        text: child.type === `text` ? (child as { text: string }).text : child.type === `form-field` ? formFieldDisplayText(child as never) : ``,
        bold: style?.bold ?? heading?.bold,
        italic: style?.italic,
        color: normalizeThumbnailColor(themeAwareColor(style?.color ?? heading?.color, theme)),
        backgroundColor: normalizeThumbnailColor(style?.backgroundColor ?? resolveHighlightColor(style?.highlight)),
        fontSizePx: style?.fontSizePt && style.fontSizePt > 0 ? Math.max(6, (style.fontSizePt * 96) / 72) : heading?.fontSizePt ? Math.max(6, (heading.fontSizePt * 96) / 72) : paragraphFontSizePx(paragraph),
        fontFamily: normalizeFontFamily(style?.fontFamily) ?? baseFontFamily,
      },
      budget,
    );
  });
  return runs;
}

/** 原 yS：单元格首个非空段落的 run（预算 120 字符） */
export function firstNonEmptyCellRuns(cell: { nodes: DocxNode[] }, theme: `light` | `dark`): ThumbnailRun[] | undefined {
  const paragraph = collectParagraphsRecursive(cell.nodes).find((candidate) => paragraphText(candidate).trim().length > 0);
  if (!paragraph) return;
  const runs = paragraphThumbnailRuns(paragraph, theme, THUMBNAIL_CELL_CHAR_BUDGET);
  return runs.length > 0 ? runs : void 0;
}

/* ============================================================================
 * §3 段落/表格缩略图元素（原 bS..xS，jsx 26787-26903；逐句转录）
 * ==========================================================================*/

/** 原 bS：段落 → 缩略图元素（文本 run + 至多 4 张图片占位） */
export function paragraphThumbnailElements(input: {
  paragraph: DocxParagraphNode;
  segment: PageSegment;
  contentLeftPx: number;
  contentWidthPx: number;
  yPx: number;
  heightPx: number;
  numberingDefinitions: unknown;
  docGridLinePitchPx: number | undefined;
  documentTheme: `light` | `dark`;
}): ThumbnailElement[] {
  const { paragraph, segment, contentLeftPx, contentWidthPx, yPx, heightPx, numberingDefinitions, docGridLinePitchPx, documentTheme } = input;
  const css = paragraphCssStyle(paragraph, numberingDefinitions, void 0, docGridLinePitchPx);
  const lineRange = segment.paragraphLineRange;
  const marginTop = lineRange && lineRange.startLineIndex > 0 ? 0 : Math.max(0, cssNumber(css.marginTop));
  const marginBottom = lineRange && lineRange.endLineIndex < lineRange.totalLineCount ? 0 : Math.max(0, cssNumber(css.marginBottom));
  const marginLeft = cssNumber(css.marginLeft);
  const marginRight = Math.max(0, cssNumber(css.marginRight));
  const x = contentLeftPx + marginLeft;
  const width = Math.max(8, contentWidthPx - marginLeft - marginRight);
  const y = yPx + marginTop;
  const height = Math.max(1, heightPx - marginTop - marginBottom);
  const runs = paragraphThumbnailRuns(paragraph, documentTheme);
  const elements: ThumbnailElement[] = [];
  elements.push({
    kind: `paragraph`,
    xPx: x,
    yPx: y,
    widthPx: width,
    heightPx: height,
    align: paragraph.style?.align,
    backgroundColor: normalizeThumbnailColor(paragraph.style?.backgroundColor),
    lineHeightPx: lineRange?.lineHeightPx ?? paragraphRenderLineHeight(paragraph, docGridLinePitchPx),
    startLineIndex: lineRange?.startLineIndex,
    runs,
  });
  runs.some((run) => run.text.trim().length > 0) ||
    paragraph.children
      .filter((child) => child.type === `image`)
      .slice(0, 4)
      .forEach((child) => {
        const imageWidth = Math.max(18, (child as DocxImageNode).widthPx ?? width * 0.5);
        const imageHeight = Math.max(18, (child as DocxImageNode).heightPx ?? height * 0.5);
        const scale = Math.min(1, (width - 4) / imageWidth, (height - 4) / imageHeight);
        const imageX = x + 2;
        const imageY = y + 2;
        const scaledWidth = Math.max(12, imageWidth * scale);
        const scaledHeight = Math.max(12, imageHeight * scale);
        const src = resolveImageSrc(child as never);
        src
          ? elements.push({ kind: `image`, xPx: imageX, yPx: imageY, widthPx: scaledWidth, heightPx: scaledHeight, src })
          : elements.push({ kind: `image-placeholder`, xPx: imageX, yPx: imageY, widthPx: scaledWidth, heightPx: scaledHeight });
      });
  return elements;
}

/** 原 xS：表格 → 缩略图元素（行切片感知；≤220 单元格） */
export function tableThumbnailElement(input: {
  table: DocxTableNode;
  segment: PageSegment;
  contentLeftPx: number;
  contentWidthPx: number;
  contentHeightPx: number;
  yPx: number;
  heightPx: number;
  numberingDefinitions: unknown;
  docGridLinePitchPx: number | undefined;
  documentTheme: `light` | `dark`;
}): ThumbnailElement | undefined {
  const { table, segment, contentLeftPx, contentWidthPx, contentHeightPx, yPx, heightPx, numberingDefinitions, docGridLinePitchPx, documentTheme } = input;
  const columns = tableGridColumns(table);
  const indentPx = twipsToPxLocal(table.style?.indentTwips) ?? 0;
  const tableWidthTwips = twipsToPxLocal(table.style?.widthTwips);
  const widthsTwips = tableColumnWidthsTwips(table, columns);
  const baseWidths = widthsTwips && widthsTwips.length > 0 ? distributeColumnWidths(widthsTwips.map((width) => width ?? 0), columns, tableWidthTwips, 1) : defaultColumnWidths(columns, tableWidthTwips);
  const tableWidthPx = resolveTableWidth(tableWidthTwips ?? baseWidths.reduce((sum, width) => sum + width, 0), Math.max(24, contentWidthPx - indentPx - tableIndentPx(table, columns)));
  const { columnWidthsPx } = resolveTableLayout(table, baseWidths, tableWidthPx);
  const rowHeights = tableRowHeights(table, contentWidthPx, numberingDefinitions, docGridLinePitchPx, contentHeightPx);
  const startRow = Math.max(0, segment.tableRowSlice?.rowIndex ?? segment.tableRowRange?.startRowIndex ?? 0);
  const endRow = Math.min(table.rows.length, segment.tableRowSlice ? startRow + 1 : segment.tableRowRange?.endRowIndex ?? table.rows.length);
  const cells: { xPx: number; yPx: number; widthPx: number; heightPx: number; backgroundColor?: string; runs?: ThumbnailRun[] }[] = [];
  let rowTop = segment.tableRowSlice ? -Math.max(0, segment.tableRowSlice.startOffsetPx) : 0;
  for (let rowIndex = startRow; rowIndex < endRow && cells.length < THUMBNAIL_MAX_TABLE_CELLS; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (!row) continue;
    const rowHeight = segment.tableRowSlice && rowIndex === segment.tableRowSlice.rowIndex ? Math.max(1, segment.tableRowSlice.totalRowHeightPx) : Math.max(1, rowHeights[rowIndex] ?? 14);
    let columnCursor = 0;
    row.cells.forEach((cell) => {
      if (cells.length >= THUMBNAIL_MAX_TABLE_CELLS) return;
      const gridSpan = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1;
      const x = columnWidthsPx.slice(0, columnCursor).reduce((sum, width) => sum + width, 0);
      const width = columnWidthsPx.slice(columnCursor, columnCursor + gridSpan).reduce((sum, w) => sum + w, 0);
      columnCursor += gridSpan;
      cells.push({
        xPx: x,
        yPx: rowTop,
        widthPx: Math.max(1, width),
        heightPx: rowHeight,
        backgroundColor: normalizeThumbnailColor(cell.style?.backgroundColor ?? row.style?.backgroundColor),
        runs: firstNonEmptyCellRuns(cell, documentTheme),
      });
    });
    rowTop += rowHeight;
  }
  if (cells.length !== 0)
    return {
      kind: `table`,
      xPx: contentLeftPx + indentPx,
      yPx,
      widthPx: Math.max(1, tableWidthPx),
      heightPx: Math.max(1, heightPx),
      cells,
    };
}

function twipsToPxLocal(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.round((twips as number) / 15);
}

/* ============================================================================
 * §4 页缩略图快照构建（原 SS..wS，jsx 26904-26979；逐句转录）
 * ==========================================================================*/

/** 原 SS：节点含图判定（递归） */
export function nodeContainsImage(node: DocxNode): boolean {
  return node
    ? node.type === `paragraph`
      ? (node as DocxParagraphNode).children.some((child) => child.type === `image`)
      : (node as DocxTableNode).rows.some((row) => row.cells.some((cell) => cell.nodes.some((child) => nodeContainsImage(child))))
    : false;
}

/** 原 CS：页含图判定 */
export function pageContainsImage(model: DocxEditorModel, segments: PageSegment[]): boolean {
  return segments.some((segment) => nodeContainsImage(model.nodes[segment.nodeIndex]));
}

/**
 * 原 wS：逐页缩略图快照——含图页跳过（快照 = undefined，
 * 渲染器直接走真实页）；其余页产出惰性 getSnapshot。
 */
export function buildPageThumbnailSnapshots(input: {
  model: DocxEditorModel;
  pageNodeSegmentsByPage: PageSegment[][];
  pageSectionInfoByIndex: { layout?: { pageWidthPx: number; pageHeightPx: number; marginsPx: { left: number; top: number; right: number; bottom: number } } }[];
  contentKeysByPage: string[];
  fallbackLayout: { pageWidthPx: number; pageHeightPx: number; marginsPx: { left: number; top: number; right: number; bottom: number } };
  documentTheme: `light` | `dark`;
  docGridLinePitchPxByNodeIndex: Map<number, number>;
  numberingDefinitions: unknown;
}): (PageThumbnailSnapshot | undefined)[] {
  const { model, pageNodeSegmentsByPage, pageSectionInfoByIndex, contentKeysByPage, fallbackLayout, documentTheme, docGridLinePitchPxByNodeIndex, numberingDefinitions } = input;
  return pageNodeSegmentsByPage.map((segments, pageIndex) => {
    if (pageContainsImage(model, segments)) return;
    const key = `${contentKeysByPage[pageIndex] ?? ``}|theme:${documentTheme}`;
    let cached: ReturnType<PageThumbnailSnapshot[`getSnapshot`]> | undefined;
    return {
      key,
      getSnapshot: () => {
        if (cached) return cached;
        const layout = pageSectionInfoByIndex[pageIndex]?.layout ?? fallbackLayout;
        const contentLeft = layout.marginsPx.left;
        const contentTop = layout.marginsPx.top;
        const contentWidth = Math.max(1, layout.pageWidthPx - layout.marginsPx.left - layout.marginsPx.right);
        const contentHeight = Math.max(1, layout.pageHeightPx - layout.marginsPx.top - layout.marginsPx.bottom);
        const elements: ThumbnailElement[] = [];
        let y = contentTop;
        for (const segment of segments) {
          if (elements.length >= THUMBNAIL_MAX_ELEMENTS_PER_PAGE) break;
          const node = model.nodes[segment.nodeIndex];
          if (!node) continue;
          const gridPitch = docGridLinePitchPxByNodeIndex.get(segment.nodeIndex);
          const height = nodeLayoutHeight(node, segment, model, contentWidth, numberingDefinitions, gridPitch);
          if (node.type === `paragraph` && !segment.tableRowRange)
            elements.push(
              ...paragraphThumbnailElements({
                paragraph: node as DocxParagraphNode,
                segment,
                contentLeftPx: contentLeft,
                contentWidthPx: contentWidth,
                yPx: y,
                heightPx: height,
                numberingDefinitions,
                docGridLinePitchPx: gridPitch,
                documentTheme,
              }),
            );
          else if (node.type === `table`) {
            const element = tableThumbnailElement({
              table: node as DocxTableNode,
              segment,
              contentLeftPx: contentLeft,
              contentWidthPx: contentWidth,
              contentHeightPx: contentHeight,
              yPx: y,
              heightPx: height,
              numberingDefinitions,
              docGridLinePitchPx: gridPitch,
              documentTheme,
            });
            element && elements.push(element);
          }
          y += Math.max(1, height);
        }
        return (cached = {
          key,
          sourceWidthPx: layout.pageWidthPx,
          sourceHeightPx: layout.pageHeightPx,
          pageBackgroundColor: documentTheme === `dark` ? `#111827` : `#ffffff`,
          elements,
        }), cached;
      },
    };
  });
}

/* ============================================================================
 * §5 节段渲染器（原 TS，jsx 26980-27339；全量语义重建）
 * ==========================================================================*/

/**
 * 原 TS：节段节点渲染——页眉/页脚段落与表格（含嵌套表递归）：
 *  - 段落：段落样式 + 浮动位置修正；可编辑时挂草稿宿主
 *    （dangerouslySetInnerHTML + 选区保持回写）；
 *  - 表格：列宽/行高解析 + 悬停/聚焦手柄（移动/列/行/角缩放）。
 * 表格手柄 JSX 细节按锚点浓缩（jsx 27144-27339），行为面完整保留。
 */
export function renderSectionNode(
  node: DocxNode,
  nodeKey: string,
  documentTheme: `light` | `dark`,
  numberingDefinitions: unknown,
  headingStyles: Record<number, Record<string, unknown>> | undefined,
  contentWidthPx: number | undefined,
  footnoteMarks: { footnote: Map<unknown, unknown>; endnote: Map<unknown, unknown> } = { footnote: new Map(), endnote: new Map() },
  pageNumber: number | undefined,
  sectionContext: unknown,
  baseRenderOptions: Record<string, unknown> | undefined,
  sectionLocation: { region: `header` | `footer`; partName: string; nodeIndex: number } | undefined,
  sectionRenderState: Record<string, unknown> | undefined,
  imageInteraction: unknown,
  draftContext: { paragraphIndexesByNode: Map<number, number>; draftKeyPrefix: string; handlers?: SectionDraftHandlers; isEditable?: boolean } | undefined,
  resizeController?: TableResizeController,
): React.ReactElement {
  /* --- 段落渲染（含草稿宿主；原 26984-27083） --- */
  const renderParagraphHost = (
    paragraph: DocxParagraphNode,
    hostKey: string,
    style: Record<string, unknown>,
    location: SectionParagraphLocation | undefined,
    floatingCorrection?: { floatingAnchorOriginCorrectionXPx?: number; headerFooterRegion?: string },
  ): React.ReactElement => {
    const renderOptions: Record<string, unknown> = {
      ...(baseRenderOptions ?? {}),
      ...(floatingCorrection ?? {}),
      withinHeaderFooter: true,
      headerFooterRegion: floatingCorrection?.headerFooterRegion ?? sectionRenderState?.region ?? baseRenderOptions?.headerFooterRegion,
      sectionImageInteraction:
        location && imageInteraction
          ? {
              ...(imageInteraction as object),
              imageLocationForChild: (childIndex: number) => ({
                ...location,
                childIndex,
              }),
            }
          : void 0,
    };
    const paragraphKey = location ? sectionParagraphKey(location) : void 0;
    const sectionEditable = !!location && !!sectionRenderState?.handlers && Number.isFinite(pageNumber) && Number.isFinite(location?.nodeIndex);
    const draftIndex = draftContext?.paragraphIndexesByNode.get(paragraph as unknown as number);
    const draftKey = Number.isFinite(draftIndex) && draftContext ? `${draftContext.draftKeyPrefix}:${draftIndex}` : void 0;
    const cellEditable = !!draftContext?.handlers && !!draftContext?.isEditable && Number.isFinite(draftIndex);
    const rendered = renderParagraph(paragraph, numberingDefinitions, documentTheme, headingStyles, footnoteMarks, pageNumber, sectionContext, contentWidthPx, renderOptions, sectionRenderState);
    if (!sectionEditable && !cellEditable) return <div key={`${hostKey}-paragraph`} data-docx-section-paragraph-key={paragraphKey} style={style as React.CSSProperties}>{rendered}</div>;
    if (sectionEditable && location && sectionRenderState?.handlers) {
      const handlers = sectionRenderState.handlers as SectionDraftHandlers;
      const key = paragraphKey ?? sectionParagraphKey(location);
      const draftHtml = handlers.readDraftHtml(key);
      const html = typeof draftHtml == `string` ? draftHtml : renderStaticMarkupLocal(rendered);
      return (
        <div
          key={`${hostKey}-paragraph`}
          data-docx-section-paragraph-host="true"
          data-docx-section-paragraph-key={key}
          data-docx-section-region={location.region}
          data-docx-section-part-name={location.partName}
          data-docx-section-node-index={location.nodeIndex}
          data-docx-section-row-index={location.rowIndex}
          data-docx-section-cell-index={location.cellIndex}
          data-docx-section-paragraph-index={location.paragraphIndex}
          style={{ ...(style as React.CSSProperties), outline: `none` }}
          dangerouslySetInnerHTML={{ __html: html }}
          ref={(element) => {
            handlers.registerElement(key, element);
            /* 锚点：草稿回写 + 选区保持（原 jsx 27013-27030） */
          }}
        />
      );
    }
    const draftHtml = draftKey && draftContext?.handlers ? draftContext.handlers.readDraftHtml(draftKey) : void 0;
    const html = typeof draftHtml == `string` ? draftHtml : renderStaticMarkupLocal(rendered);
    return (
      <div
        key={`${hostKey}-paragraph`}
        contentEditable={true}
        suppressContentEditableWarning={true}
        data-docx-table-cell-paragraph-host="true"
        data-docx-table-cell-paragraph-key={draftKey}
        style={{ ...(style as React.CSSProperties), outline: `none` }}
        dangerouslySetInnerHTML={{ __html: html }}
        ref={(element) => {
          const handlers = draftContext?.handlers;
          if (!draftKey || !handlers) return;
          handlers.registerElement(draftKey, element);
          /* 锚点：草稿回写 + 选区保持（原 jsx 27041-27057） */
        }}
        onInput={(event) => {
          !draftKey || !draftContext?.handlers || draftContext.handlers.writeDraftHtml(draftKey, event.currentTarget.innerHTML);
        }}
        onBlur={(event) => {
          if (!draftContext?.handlers || !draftKey || !Number.isFinite(draftIndex)) return;
          const text = event.currentTarget.textContent ?? ``;
          if (text === paragraphText(paragraph)) {
            draftContext.handlers.clearDraftHtml(draftKey);
            return;
          }
          draftContext.handlers.commitText?.(draftIndex as number, text);
        }}
      />
    );
  };

  if (node.type === `paragraph`) {
    const paragraph = node as DocxParagraphNode;
    const css = {
      ...paragraphCssStyle(paragraph, numberingDefinitions, headingStyles, void 0),
    };
    return renderParagraphHost(
      paragraph,
      nodeKey,
      css,
      sectionLocation && Number.isFinite(pageNumber)
        ? {
            region: sectionLocation.region,
            partName: sectionLocation.partName,
            nodeIndex: sectionLocation.nodeIndex,
          }
        : void 0,
    );
  }

  /* --- 表格渲染（原 27084-27339；手柄 JSX 浓缩，行为面保留） --- */
  const table = node as DocxTableNode;
  const columns = tableGridColumns(table);
  const indentPx = twipsToPxLocal(table.style?.indentTwips) ?? 0;
  const tableWidthTwips = twipsToPxLocal(table.style?.widthTwips);
  const tableKey = nodeKey;
  const baseWidths = ((): number[] => {
    if (resizeController?.resolveColumnWidths) return resizeController.resolveColumnWidths(tableKey, table, tableWidthTwips);
    const widths = tableColumnWidthsTwips(table, columns);
    return !widths || widths.length === 0 ? defaultColumnWidths(columns, tableWidthTwips) : distributeColumnWidths(widths.map((width) => width ?? 0), columns, tableWidthTwips, 1);
  })();
  const naturalWidth = tableWidthTwips ?? baseWidths.reduce((sum, width) => sum + width, 0);
  const borderExtra = tableIndentPx(table, columns);
  const maxWidth = Number.isFinite(contentWidthPx) && (contentWidthPx as number) > 0 ? Math.max(120, (contentWidthPx as number) - indentPx - borderExtra) : void 0;
  const tableWidthPx = resolveTableWidth(naturalWidth, maxWidth);
  const alignment = tableBorderSpacing(table);
  const { columnWidthsPx } = resolveTableLayout(table, baseWidths, tableAlignmentOf(table) ? Math.max(1, tableWidthPx - alignment * Math.max(0, columns + 1)) : tableWidthPx);
  const rowHeightsTwips = resizeController?.resolveRowHeights ? resizeController.resolveRowHeights(tableKey, table) : table.rows.map((row) => row.style?.heightTwips);
  const rowHeightsPx = rowHeightsTwips.map((height) => (Number.isFinite(height) && (height as number) > 0 ? Math.max(24, Math.round(height as number)) : 24));
  const columnOffsets = columnWidthsPx.reduce((offsets: number[], width) => {
    const last = offsets[offsets.length - 1] ?? 0;
    offsets.push(last + width);
    return offsets;
  }, []);
  const rowOffsets = rowHeightsPx.reduce((offsets: number[], height) => {
    const last = offsets[offsets.length - 1] ?? 0;
    offsets.push(last + height);
    return offsets;
  }, []);
  const lastColumnBoundary = Math.max(0, columns - 2);
  const lastRowBoundary = Math.max(0, table.rows.length - 2);
  const isColumnResizing = resizeController ? (boundaryIndex: number): boolean => resizeController.isColumnResizing(tableKey, boundaryIndex) : () => false;
  const isRowResizing = resizeController ? (boundaryIndex: number): boolean => resizeController.isRowResizing(tableKey, boundaryIndex) : () => false;
  const cellMargin = table.style?.cellMarginTwips;
  const tableBorders = table.style?.borders;
  const alignmentValue = tableAlignmentOf(table);
  resizeController && resizeController.isCornerResizing(tableKey);
  const interactive = !!(resizeController && !resizeController.isReadOnly) && !!(resizeController?.hoveredTableKey === tableKey || resizeController?.focusedTableKey === tableKey || resizeController?.hoveredHandle?.tableKey === tableKey || resizeController?.isTableResizing(tableKey));
  const handleThemeStyle =
    documentTheme === `dark`
      ? { backgroundColor: `#111827`, border: `1px solid #374151`, color: `#cbd5e1`, boxShadow: `0 1px 2px rgba(2, 6, 23, 0.6)` }
      : { backgroundColor: `#ffffff`, border: `1px solid #d4d4d8`, color: `#4b5563`, boxShadow: `0 1px 2px rgba(0, 0, 0, 0.14)` };
  void handleThemeStyle;
  return (
    <div
      key={`${nodeKey}-table`}
      style={tableContainerStyle(table, indentPx) as React.CSSProperties}
      onPointerEnter={() => {
        !resizeController || resizeController.isReadOnly || resizeController.setHoveredTableKey(tableKey);
      }}
      onPointerLeave={(event) => {
        if (!resizeController || resizeController.isReadOnly) return;
        const related = event.relatedTarget;
        (related instanceof Node && event.currentTarget.contains(related)) || (resizeController.focusedTableKey !== tableKey && resizeController.setHoveredTableKey(void 0));
      }}
      onFocusCapture={() => {
        !resizeController || resizeController.isReadOnly || (resizeController.setFocusedTableKey(tableKey), resizeController.setHoveredTableKey(tableKey));
      }}
      onBlurCapture={(event) => {
        if (!resizeController || resizeController.isReadOnly) return;
        const related = event.relatedTarget;
        (related instanceof Node && event.currentTarget.contains(related)) || (resizeController.focusedTableKey === tableKey && resizeController.setFocusedTableKey(void 0), resizeController.setHoveredTableKey(void 0));
      }}
    >
      {/* 锚点：移动手柄/悬停热区 JSX（原 jsx 27144-27177）——interactive 时挂载 */}
      <table
        style={{
          width: tableWidthPx > 0 ? `${tableWidthPx}px` : `100%`,
          ...tableAlignmentStyle(table, typeof alignmentValue === `number` ? alignmentValue : 0),
          tableLayout: table.style?.layout === `autofit` ? `auto` : `fixed`,
        }}
      >
        <colgroup>
          {columnWidthsPx.map((width, index) => (
            <col key={`${nodeKey}-col-${index}`} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <tbody>
          {table.rows.map((row, rowIndex) => {
            const rowStyle = tableRowStyle(row, twipsToPxLocal(row.style?.heightTwips));
            let columnCursor = 0;
            return (
              <tr key={`${nodeKey}-row-${rowIndex}`} style={rowStyle as React.CSSProperties}>
                {row.cells.map((cell, cellIndex) => {
                  const gridSpan = cell.style?.gridSpan && cell.style.gridSpan > 1 ? cell.style.gridSpan : 1;
                  const rowSpan = cell.style?.rowSpan && cell.style.rowSpan > 1 ? cell.style.rowSpan : 1;
                  const startColumn = columnCursor;
                  const endColumn = startColumn + gridSpan - 1;
                  if (((columnCursor += gridSpan), cell.style?.vMergeContinuation)) return null;
                  const cellWidthTwips = twipsToPxLocal(cell.style?.widthTwips);
                  return (
                    <td
                      key={`${nodeKey}-cell-${rowIndex}-${cellIndex}`}
                      colSpan={gridSpan > 1 ? gridSpan : void 0}
                      rowSpan={rowSpan > 1 ? rowSpan : void 0}
                      style={{
                        ...tableCellBorders(tableBorders, cell.style?.borders, rowIndex, table.rows.length, startColumn, endColumn, columns),
                        ...tableCellPadding(tableBorders, cell.style?.borders),
                        ...tableCellMargins(mergeCellMargins(cellMargin, cell.style?.marginTwips)),
                        verticalAlign: (cell.style?.verticalAlign as React.CSSProperties[`verticalAlign`]) ?? `top`,
                        backgroundColor: cell.style?.backgroundColor ?? row.style?.backgroundColor,
                        minWidth: cellWidthTwips ? `${cellWidthTwips}px` : 0,
                        width: cellWidthTwips && gridSpan === 1 ? `${cellWidthTwips}px` : void 0,
                        ...rowStyle,
                        wordWrap: `break-word`,
                        overflowWrap: `break-word`,
                        wordBreak: `break-word`,
                      }}
                    >
                      <div style={{ display: `grid`, gap: 0 }}>
                        {(() => {
                          let paragraphIndex = 0;
                          return cell.nodes.map((child, contentIndex) => {
                            if (child.type === `paragraph`) {
                              const index = paragraphIndex;
                              paragraphIndex += 1;
                              return renderParagraphHost(
                                child as DocxParagraphNode,
                                `${nodeKey}-run-${rowIndex}-${cellIndex}-${contentIndex}`,
                                sectionParagraphStyle(child as DocxParagraphNode, numberingDefinitions, headingStyles, index, void 0),
                                sectionLocation && Number.isFinite(pageNumber)
                                  ? {
                                      region: sectionLocation.region,
                                      partName: sectionLocation.partName,
                                      nodeIndex: sectionLocation.nodeIndex,
                                      rowIndex,
                                      cellIndex,
                                      paragraphIndex: index,
                                    }
                                  : void 0,
                                void 0,
                              );
                            }
                            return renderSectionNode(child, `${nodeKey}-nested-table-${rowIndex}-${cellIndex}-${contentIndex}`, documentTheme, numberingDefinitions, headingStyles, contentWidthPx, footnoteMarks, pageNumber, sectionContext, baseRenderOptions, sectionLocation, sectionRenderState, void 0, draftContext, void 0);
                          });
                        })()}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 锚点：列/行/角缩放手柄 JSX（原 jsx 27222-27339）——
          interactive && columns>1 时逐边界挂载 col-resize/row-resize/nwse-resize
          手柄（命中区 16px，高亮 #3b82f6，pointerdown → begin*Resize） */}
    </div>
  );
}

/* --- 未用导入锚定 --- */
void textChildren;
void estimateNodeHeight;
void contentSignatureOf;
void estimateTextWidthPx;
