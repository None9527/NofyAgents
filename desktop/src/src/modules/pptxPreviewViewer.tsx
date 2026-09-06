/* eslint-disable */
/**
 * ============================================================================
 * pptxPreviewViewer.tsx — ZCode 3.7.6 PPTX 预览查看器（解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（827 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/pptx-preview-viewer-B1z6CWke.js
 * 对照文件（同一 chunk 的 pretty-print 版，613 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/pptx-preview-viewer-B1z6CWke.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（jsx 行号）
 * ----------------------------------------------------------------------------
 *  外部导入（文件头 1-11）：
 *   chunk-Cq_f4orQ `s`→interopRequireDefault (e) | react `t`→React (h)
 *   jsx-runtime `t`→jsxRuntime (g) | logger `t`→logger (_)
 *   preload-helper `t`→vitePreload (v)
 *   imeComposition chunk：`C`→IconMousePointerClick(t) `S`→IconSparkles(n)
 *     `_`→IconLoaderCircle(p) `h`→PopoverRoot(c) `i`→PopoverContent(a)
 *     `j`→usePlatformService(o) `l`→PopoverAnchor(l) `n`→isImeComposing(u)
 *     `r`→toast(d) `t`→Button(x) `u`→Input(m) `v`→IconZoomOut(ee)
 *     `w`→IconZoomIn(te) `y`→IconChevronLeft(ne) —— 注：字母序按源文件
 *   button chunk：`a`→IconZoomIn(y) `c`→createLucideIcon(b) `i`→IconChevronLeft(ee)
 *     `o`→IconChevronRight(te) `s`→IconZoomOut(ee) `t`→Button(x)
 *   utils `t`→cn (S) | presentationElementModel `n`→hitTestSlideElement (C)
 *
 *  本 chunk 符号：
 *   re → IconFileDown          lucide `file-down` 图标 (jsx 12-21)
 *   ie → SlideAiEditPopover    元素 AI 编辑/加入会话浮层 (jsx 24-117)
 *   ae → clampPageIndex         页码钳制 [1, pageCount] (jsx 118-120)
 *   E  → clampZoomPercent      缩放钳制 [25, 300]，默认 100 (jsx 121-123)
 *   D  → mapElementRectToSurface  元素 EMU 矩形 → 渲染面像素矩形 (jsx 124-135)
 *   O  → rectCenterInsideRect  矩形中心点包含判断 (jsx 136-140)
 *   k  → rangeTextOffsetsInNode Range 与文本节点的交集偏移 (jsx 141-152)
 *   oe → extractSelectedElementText  选区文本抽取（限定元素矩形内）(jsx 153-189)
 *   A  → isSameElementRef      元素引用相等 (jsx 190-192)
 *   j  → clientPointToPageSize  客户端坐标 → 页面尺寸坐标 (jsx 193-199)
 *   M  → SlidePage             单页渲染组件（引擎 renderPage 挂载 +
 *                               选择模式覆盖层 + 滚动归零守卫）(jsx 200-270)
 *   se → SlideThumbnail        缩略图按钮（IntersectionObserver 懒渲染）(jsx 271-323)
 *   ce → useElementSize         ResizeObserver 测尺寸 (jsx 316-329)
 *   N  → PptxPreviewViewer      根组件（导出名同名）(jsx 330-612)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk）
 * ----------------------------------------------------------------------------
 *   1. react / jsx-runtime        react-BQLj9xdT.js / jsx-runtime-B5yMD3-t.js
 *   2. cn()                       utils-CEEH0K_K.js (t)
 *   3. logger                     logger-PFDwl5Yq.js (t)
 *   4. vitePreload                preload-helper-BHSF1fZ9.js (t)
 *   5. Button / Input / Popover原语 / toast / isImeComposing / usePlatformService /
 *      IconLoaderCircle / IconSparkles / IconMousePointerClick
 *                                 imeComposition-DEYFkwWm.js（C/S/_/h/i/j/l/n/r/t/u/v/w/y）
 *   6. createLucideIcon + IconChevronLeft/Right/ZoomIn/ZoomOut
 *                                 button-laUijeDG.js (a/c/i/o/s/t)
 *   7. hitTestSlideElement        presentationElementModel-r6vQ-JZl.js (n)
 *   8. 动态 import：pptxRendererPreviewEngine-BIIRLBue.js（__vite__mapDeps[0,1]，
 *      伴随 presentationElementModel）、presentationPdfPrintExport-CsVZM-dn.js
 * ============================================================================
 */

import * as React from "react";
import { Input, Popover as PopoverRoot, PopoverAnchor, PopoverContent, Textarea, isComposingText as isImeComposing } from './ImeComposition'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import；〔A1-P1-B17〕+isComposingText as isImeComposing（原 u = imeComposition _r@12567；canonical components/ime/ImeComposition@472）；R1 判例别名保留调用名——下方 declare 删碑改指
import { Sparkles as IconSparkles, MousePointerClick as IconMousePointerClick, LoaderCircle as IconLoaderCircle } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight, ZoomOut as IconZoomOut, ZoomIn as IconZoomIn, createLucideIcon } from './button'; // A0-CLEANUP 族清理：Button/四图标/createLucideIcon declare 改指 button chunk

/* ============================================================================
 * 0. 外部依赖类型声明（真实实现位于上述 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 S，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

/** 日志器（原 _，logger-PFDwl5Yq.js） */
declare const logger: { error(message: string, error?: unknown): void };

/** vite 预加载助手（原 v，preload-helper） */
declare function vitePreload<T>(loader: () => Promise<T>, deps: string[], baseUrl: string): Promise<T>;

/** 桌面平台服务（原 o = usePlatformService()） */
interface PlatformPrintResult { success: boolean; data?: Uint8Array; error?: string }
interface PlatformSaveResult { success: boolean; canceled?: boolean; path?: string; error?: string }
interface PlatformService {
  printPageToPdf?(): Promise<PlatformPrintResult>;
  saveFile?(opts: { data: Uint8Array; suggestedName: string }): Promise<PlatformSaveResult>;
}
declare function usePlatformService(): PlatformService | null;

/** toast（原 r） */
declare function toast(message: string): void;

/* ── tombstone〔A1-P1-B17〕：declare isImeComposing（原 u = imeComposition chunk _r@12567）删除 →
 * 一符一家收敛改指 canonical components/ime/ImeComposition isComposingText（@472，原码 _r 逐字；
 * 经 modules/ImeComposition@98 转导出）。消费面实证（1 处，别名保调用名逐字不变）：本文件 @257
 * （≡ bundle pptx 预览 Enter 守卫）。型缝：canonical 形参 CompositionStateProbe，消费位
 * `{ compositionActive, isComposing }` 对象字面传入逐字不变。 ── */

/* --- 引擎接口（pptxRendererPreviewEngine.tsx 的 Hq/Uq 与 presentationElementModel） --- */

interface SlideElementBounds { x: number; y: number; width: number; height: number }
type SlideElementKind = `shape` | `picture` | `table` | `table-cell` | `group` | `chart` | `unknown`;
interface SlideElement {
  slideIndex: number;
  slidePart: string;
  nodeId: string;
  nodeName: string;
  nodeType: SlideElementKind;
  bounds: SlideElementBounds;
  zIndex: number;
  text?: string;
  rowIndex?: number;
  cellIndex?: number;
}
declare function hitTestSlideElement(elements: SlideElement[], point: { x: number; y: number }): SlideElement | null;

interface PptxRenderHandle { ready: Promise<void>; dispose(): void }
interface PptxDocument {
  pageCount: number;
  pageSize: { width: number; height: number };
  renderPage(
    pageIndex: number,
    host: HTMLElement,
    options?: { onNavigate?: (nav: { pageIndex?: number; url?: string }) => void },
  ): PptxRenderHandle;
  getPageElements(pageIndex: number): SlideElement[];
  dispose(): void;
}
/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/pptxPreviewViewer.tsx：1 面／3 行，本批该文件共 1 碑）：本地 interface PptxEngine@129-131（3 行）纯删，3 行等行墓碑在原位。判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。interface PptxEngine：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    同名定义站：PptxEngine 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 3 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。净零行：本碑 3 行置换原 3 行，文件行数 1092 不变、零重锚（本文件 pptxPreviewViewer 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 1 条（原始发射 1）；带行号之记录 1 条**皆在**首个编辑点 @129 之前 ⇒ 位移不证伪任何引证，仍照本批工艺一律强制净零行）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/* --- UI 原语（imeComposition / button chunk；类名逐字保留） --- */

/* ── tombstone（A0-S3c）：Input、PopoverAnchor、PopoverContent、PopoverRoot、Textarea declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */


/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */


/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：IconSparkles/IconMousePointerClick/IconLoaderCircle → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A0-CLEANUP 族清理）：IconChevronLeft/Right/ZoomOut/ZoomIn declare 删除 →
   import { ChevronLeft/ChevronRight/ZoomOut/ZoomIn } from './button'。 ── */

/** lucide file-down 图标（原 re，createLucideIcon 工厂） */
const IconFileDown = createLucideIcon(`file-down`, [
  [`path`, {
    d: `M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,
    key: `1oefj6`,
  }],
  [`path`, { d: `M14 2v5a1 1 0 0 0 1 1h5`, key: `wfsgrz` }],
  [`path`, { d: `M12 18v-6`, key: `17g6i2` }],
  [`path`, { d: `m9 15 3 3 3-3`, key: `1npd3o` }],
]);
/* ── tombstone（A0-CLEANUP 族清理）：createLucideIcon declare 删除 → import from './button'。 ── */

/* ============================================================================
 * 1. 文案标签集（由父组件注入；原组件全部文案经 labels props 传入）
 * ==========================================================================*/

export interface PptxPreviewLabels {
  loading: string;
  loadError: string;
  noSlides: string;
  thumbnails: string;
  thumbnail(pageNumber: number): string;
  previousPage: string;
  nextPage: string;
  pageInput: string;
  zoomIn: string;
  zoomOut: string;
  selectElement: string;
  exitElementSelection: string;
  aiEdit: string;
  commentPlaceholder: string;
  cancelAiEdit: string;
  addToConversation: string;
  exportPdf: string;
  exportingPdf: string;
  exportPdfSuccess(path: string): string;
  exportPdfFailed: string;
  referencedPageMissing(pageNumber: number): string;
  referencedSourceChanged(pageNumber: number): string;
}

/** 元素引用创建参数（原 l = referenceSource 的 create 调用面） */
export interface PptxElementReferenceRequest {
  element: SlideElement;
  selectedText?: string;
  comment?: string;
  sourceFingerprint: string;
}

/* ============================================================================
 * 2. SlideAiEditPopover（原 ie，jsx 24-117）
 *    选中元素后的浮层工具条：未编辑态 = 「AI 编辑」大按钮；
 *    编辑态 = 备注 Textarea + 取消/加入会话 按钮。
 *    Esc：编辑态退出编辑（IME 组词中忽略），非编辑态退出选择模式。
 * ==========================================================================*/

function SlideAiEditPopover({
  children,
  open,
  boundary,
  label,
  commentPlaceholder,
  cancelLabel,
  addToConversationLabel,
  editing,
  disabled,
  onAiEdit,
  onCancelAiEdit,
  onAddToConversation,
  onExitSelection,
}: {
  children: React.ReactNode;
  open: boolean;
  boundary: HTMLElement | null;
  label: string;
  commentPlaceholder: string;
  cancelLabel: string;
  addToConversationLabel: string;
  editing: boolean;
  disabled: boolean;
  onAiEdit(): void;
  onCancelAiEdit(): void;
  onAddToConversation(comment: string): void;
  onExitSelection(): void;
}) {
  const [comment, setComment] = React.useState(``);
  const compositionActive = React.useRef(!1);
  React.useEffect(() => {
    editing || (setComment(``), compositionActive.current = !1);
  }, [editing]);
  return (
    <PopoverRoot open={open} modal={false}>
      {children}
      <PopoverContent
        role="toolbar"
        aria-label={label}
        side="top"
        align="center"
        sideOffset={8}
        collisionBoundary={boundary}
        collisionPadding={8}
        sticky="partial"
        hideWhenDetached={true}
        updatePositionStrategy="always"
        className={
          editing
            ? `w-80 max-w-[calc(100vw-1rem)] gap-0 border-popover-border p-1`
            : `w-auto max-w-[calc(100vw-1rem)] gap-0 border-popover-border p-1`
        }
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (editing) {
            if (isImeComposing({ compositionActive: compositionActive.current, isComposing: e.isComposing })) return;
            onCancelAiEdit();
            return;
          }
          onExitSelection();
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            <Textarea
              autoFocus
              aria-label={commentPlaceholder}
              placeholder={commentPlaceholder}
              value={comment}
              disabled={disabled}
              rows={3}
              className="min-h-16 resize-none border-input-border bg-input text-mobile-input-safe placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 md:text-ui-base"
              onChange={(e) => setComment(e.target.value)}
              onCompositionStart={() => { compositionActive.current = true; }}
              onCompositionEnd={() => { compositionActive.current = false; }}
            />
            <div className="flex items-center justify-end gap-1">
              <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onCancelAiEdit}>
                {cancelLabel}
              </Button>
              <Button type="button" size="sm" disabled={disabled} onClick={() => onAddToConversation(comment)}>
                {addToConversationLabel}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            variant="ghost"
            aria-label={label}
            disabled={disabled}
            className="w-full justify-start rounded-lg px-2"
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); }}
            onClick={onAiEdit}
          >
            <IconSparkles className="size-4" />
            {label}
          </Button>
        )}
      </PopoverContent>
    </PopoverRoot>
  );
}

/* ============================================================================
 * 3. 几何/选区助手（原 ae/E/D/O/k/oe/A/j，jsx 118-199）
 * ==========================================================================*/

/** 页码钳制（原 ae）：非法 → 1；有限 → round 后 [1, pageCount] */
function clampPageIndex(candidate: number, pageCount: number): number {
  const max = Math.max(1, Math.floor(pageCount));
  return Number.isFinite(candidate) ? Math.min(Math.max(1, Math.round(candidate)), max) : 1;
}

/** 缩放百分比钳制（原 E）：[25, 300]，非法 → 100 */
function clampZoomPercent(candidate: number): number {
  return Number.isFinite(candidate) ? Math.min(Math.max(25, Math.round(candidate)), 300) : 100;
}

/**
 * 元素矩形（页面坐标）→ 渲染面视口像素矩形（原 D）。
 * 渲染面按 pageSize*scale 显示，元素 bounds 为页面原始坐标。
 */
function mapElementRectToSurface(
  surface: HTMLElement,
  pageSize: { width: number; height: number },
  bounds: SlideElementBounds,
): { left: number; top: number; right: number; bottom: number } | null {
  const rect = surface.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || bounds.width <= 0 || bounds.height <= 0) return null;
  const scaleX = rect.width / pageSize.width;
  const scaleY = rect.height / pageSize.height;
  const left = rect.left + bounds.x * scaleX;
  const top = rect.top + bounds.y * scaleY;
  return { left, top, right: left + bounds.width * scaleX, bottom: top + bounds.height * scaleY };
}

/** 矩形中心是否落在另一矩形内（原 O） */
function rectCenterInsideRect(
  inner: { left: number; top: number; right: number; bottom: number },
  outer: { left: number; top: number; right: number; bottom: number },
): boolean {
  const cx = (inner.left + inner.right) / 2;
  const cy = (inner.top + inner.bottom) / 2;
  return cx >= outer.left && cx <= outer.right && cy >= outer.top && cy <= outer.bottom;
}

/** Range 与文本节点的交集偏移（原 k）：空交集返回 null */
function rangeTextOffsetsInNode(
  range: Range,
  node: Text,
): { startOffset: number; endOffset: number } | null {
  try {
    if (!range.intersectsNode(node)) return null;
  } catch {
    return null;
  }
  const startOffset = range.startContainer === node ? Math.min(range.startOffset, node.data.length) : 0;
  const endOffset = range.endContainer === node ? Math.min(range.endOffset, node.data.length) : node.data.length;
  return endOffset <= startOffset ? null : { startOffset, endOffset };
}

/**
 * 从当前选区抽取落在指定元素矩形内的文本（原 oe）。
 * 逐 Range × 渲染面内文本节点求交集，客户端矩形过滤，
 * 可选与元素原文做 includes 校验；拼接后去首尾空白。
 */
function extractSelectedElementText({
  selection,
  renderSurface,
  pageSize,
  elementBounds,
  elementText,
}: {
  selection: Selection | null;
  renderSurface: HTMLElement | null;
  pageSize: { width: number; height: number };
  elementBounds: SlideElementBounds;
  elementText?: string;
}): string | null {
  if (!selection || selection.isCollapsed || selection.rangeCount === 0 || !renderSurface) return null;
  const surfaceRect = mapElementRectToSurface(renderSurface, pageSize, elementBounds);
  if (!surfaceRect) return null;
  const doc = renderSurface.ownerDocument;
  const whatToShow = doc.defaultView?.NodeFilter.SHOW_TEXT ?? 4;
  const pieces: string[] = [];
  for (let i = 0; i < selection.rangeCount; i += 1) {
    const range = selection.getRangeAt(i);
    if (range.collapsed) continue;
    const walker = doc.createTreeWalker(renderSurface, whatToShow);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const textNode = node as Text;
      const offsets = rangeTextOffsetsInNode(range, textNode);
      if (!offsets) continue;
      const subRange = doc.createRange();
      subRange.setStart(textNode, offsets.startOffset);
      subRange.setEnd(textNode, offsets.endOffset);
      const visible = Array.from(subRange.getClientRects()).some((r) => rectCenterInsideRect(r, surfaceRect));
      const raw = textNode.data.slice(offsets.startOffset, offsets.endOffset);
      const trimmed = raw.trim();
      visible && (!trimmed || !elementText || elementText.includes(trimmed)) && pieces.push(raw);
    }
  }
  return pieces.join(``).trim() || null;
}

/** 元素引用相等（原 A）：nodeId/nodeType/rowIndex/cellIndex 全同 */
function isSameElementRef(a: SlideElement | null | undefined, b: SlideElement | null | undefined): boolean {
  return !a || !b
    ? false
    : a.nodeId === b.nodeId && a.nodeType === b.nodeType && a.rowIndex === b.rowIndex && a.cellIndex === b.cellIndex;
}

/** 客户端坐标 → 页面尺寸坐标（原 j）：经 getBoundingClientRect 反归一 */
function clientPointToPageSize(
  target: HTMLElement,
  pageSize: { width: number; height: number },
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = target.getBoundingClientRect();
  return rect.width <= 0 || rect.height <= 0
    ? null
    : {
        x: ((clientX - rect.left) / rect.width) * pageSize.width,
        y: ((clientY - rect.top) / rect.height) * pageSize.height,
      };
}

/* ============================================================================
 * 4. SlidePage（原 M，jsx 200-270）
 *    单页渲染面：引擎 renderPage 挂载/释放；滚动归零守卫（引擎产物不应滚动）；
 *    选择模式下渲染元素命中覆盖层（table-cell 层级 +1）。
 * ==========================================================================*/

function SlidePage({
  document: doc,
  pageIndex,
  scale,
  generation,
  interactive = false,
  onNavigate,
  onRenderError,
  selectionMode = false,
  elements = [],
  selectedElement = null,
  onSelectElement,
  renderSurfaceRef,
}: {
  document: PptxDocument;
  pageIndex: number;
  scale: number;
  generation: number;
  interactive?: boolean;
  onNavigate?: (pageIndex: number) => void;
  onRenderError?: (generation: number, error: Error) => void;
  selectionMode?: boolean;
  elements?: SlideElement[];
  selectedElement?: SlideElement | null;
  onSelectElement?: (element: SlideElement) => void;
  renderSurfaceRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const scrollGuardRef = React.useRef<HTMLDivElement>(null);
  const fallbackSurfaceRef = React.useRef<HTMLDivElement>(null);
  const surfaceRef = renderSurfaceRef ?? fallbackSurfaceRef;
  const hasSelectableText = selectionMode && !!selectedElement?.text?.trim();
  React.useEffect(() => {
    const root = scrollGuardRef.current;
    if (!root) return;
    const onScroll = (event: Event) => {
      const target = event.target;
      target instanceof HTMLElement &&
        (target.scrollTop !== 0 || target.scrollLeft !== 0) &&
        ((target.scrollTop = 0), (target.scrollLeft = 0));
    };
    root.addEventListener(`scroll`, onScroll, true);
    return () => root.removeEventListener(`scroll`, onScroll, true);
  }, []);
  React.useEffect(() => {
    const host = surfaceRef.current;
    if (!host) return;
    let handle: PptxRenderHandle | null = null;
    let disposed = false;
    const reportError = (error: unknown) => {
      disposed || onRenderError?.(generation, error instanceof Error ? error : Error(String(error)));
    };
    try {
      handle = doc.renderPage(pageIndex, host, {
        onNavigate: (nav) => {
          nav.pageIndex !== void 0 && onNavigate?.(nav.pageIndex);
        },
      });
      handle.ready.catch(reportError);
    } catch (error) {
      reportError(error);
    }
    return () => {
      disposed = true;
      handle?.dispose();
      host.replaceChildren();
    };
  }, [doc, generation, onNavigate, onRenderError, pageIndex]);
  return (
    <div
      ref={scrollGuardRef}
      className="relative shrink-0 overflow-hidden bg-background shadow-md"
      style={{ width: doc.pageSize.width * scale, height: doc.pageSize.height * scale }}
    >
      <div
        data-zcode-pptx-render-surface=""
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: doc.pageSize.width, height: doc.pageSize.height, transform: `scale(${scale})` }}
      >
        <div
          ref={surfaceRef as React.RefObject<HTMLDivElement>}
          data-zcode-pptx-render-surface="true"
          className={cn(
            `absolute inset-0`,
            interactive && (!selectionMode || hasSelectableText) ? `pointer-events-auto` : `pointer-events-none`,
            hasSelectableText && `select-text`,
          )}
          onPointerDownCapture={(e) => {
            if (!hasSelectableText) return;
            const point = clientPointToPageSize(e.currentTarget, doc.pageSize, e.clientX, e.clientY);
            const hit = point ? hitTestSlideElement(elements, point) : null;
            isSameElementRef(hit, selectedElement) ||
              (e.preventDefault(), e.stopPropagation(), hit && onSelectElement?.(hit));
          }}
          onClickCapture={(e) => {
            selectionMode && (e.preventDefault(), e.stopPropagation());
          }}
        />
        {selectionMode ? (
          <div className="pointer-events-none absolute inset-0" data-pptx-element-selection-overlay="true">
            {elements.map((element) => {
              const key = [element.nodeId, element.nodeType, element.rowIndex ?? ``, element.cellIndex ?? ``].join(`:`);
              const selected = isSameElementRef(selectedElement, element);
              const overlayButton = (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={element.text || element.nodeName || element.nodeType}
                  className={cn(
                    `absolute border outline-none transition-colors`,
                    hasSelectableText ? `pointer-events-none` : `pointer-events-auto`,
                    selected
                      ? `border-primary bg-accent/30`
                      : `border-transparent bg-transparent hover:border-primary hover:bg-accent/20`,
                  )}
                  style={{
                    left: element.bounds.x,
                    top: element.bounds.y,
                    width: element.bounds.width,
                    height: element.bounds.height,
                    zIndex: element.zIndex * 2 + +(element.nodeType === `table-cell`),
                  }}
                  onClick={() => onSelectElement?.(element)}
                />
              );
              return selected ? <PopoverAnchor asChild key={`anchor:${key}`}>{overlayButton}</PopoverAnchor> : overlayButton;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. SlideThumbnail（原 se，jsx 271-313）
 *    缩略图按钮：IntersectionObserver（rootMargin 200px）进入视口才渲染小页；
 *    宽度 ResizeObserver 测可用宽 → 缩略比例；选中时 scrollIntoView。
 * ==========================================================================*/

function SlideThumbnail({
  document: doc,
  pageIndex,
  generation,
  selected,
  scrollRoot,
  labels,
  onSelect,
}: {
  document: PptxDocument;
  pageIndex: number;
  generation: number;
  selected: boolean;
  scrollRoot: HTMLElement | null;
  labels: PptxPreviewLabels;
  onSelect(): void;
}) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [availableWidth, setAvailableWidth] = React.useState(0);
  React.useEffect(() => {
    const el = buttonRef.current;
    if (!el || typeof IntersectionObserver > `u`) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
      root: scrollRoot,
      rootMargin: `200px 0px`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);
  React.useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const measure = () => setAvailableWidth(Math.max(0, el.clientWidth - 16));
    measure();
    if (typeof ResizeObserver > `u`) {
      window.addEventListener(`resize`, measure);
      return () => window.removeEventListener(`resize`, measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    selected && buttonRef.current?.scrollIntoView({ block: `nearest` });
  }, [selected]);
  const thumbnailScale = availableWidth > 0 ? availableWidth / doc.pageSize.width : 0;
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-current={selected ? `page` : void 0}
      aria-label={labels.thumbnail(pageIndex + 1)}
      className={cn(
        `flex w-full flex-col items-center gap-1 rounded-lg border p-2 text-ui-xs text-foreground-subtle outline-none transition-colors`,
        selected
          ? `border-border-hover bg-selected text-foreground`
          : `border-transparent hover:border-border hover:bg-surface-hover`,
      )}
      onClick={onSelect}
    >
      <div
        className="flex w-full items-center justify-center overflow-hidden bg-surface"
        style={{ aspectRatio: `${doc.pageSize.width} / ${doc.pageSize.height}` }}
      >
        {visible && thumbnailScale > 0 ? (
          <SlidePage document={doc} generation={generation} pageIndex={pageIndex} scale={thumbnailScale} />
        ) : null}
      </div>
      <span className="tabular-nums">{pageIndex + 1}</span>
    </button>
  );
}

/* ============================================================================
 * 6. useElementSize（原 ce，jsx 316-329）
 * ==========================================================================*/

function useElementSize(element: HTMLElement | null): { width: number; height: number } {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    if (!element) return;
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    if (typeof ResizeObserver > `u`) {
      window.addEventListener(`resize`, measure);
      return () => window.removeEventListener(`resize`, measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return size;
}

/* ============================================================================
 * 7. PptxPreviewViewer（原 N，jsx 330-612；chunk 唯一导出）
 *    布局：左缩略图栏 + 右主区（页面 + 底部工具条）。
 *    状态机：data 变更 → 代际号递增 → 动态 import 引擎 → open(buffer) →
 *    setDocument；旧文档 dispose。方向键翻页；缩放 25-300%（视口 fit × 百分比）；
 *    元素选择模式 → getPageElements → 点选 → AI 编辑浮层（选区文本抽取 +
 *    带备注加入会话）；导出 PDF = renderPresentationToPrintHost +
 *    platformService.printPageToPdf + saveFile。
 * ==========================================================================*/

export function PptxPreviewViewer({
  data,
  labels,
  className,
  fileName,
  referenceSource,
  referenceNavigation,
  referenceNavigationReady = true,
}: {
  /** PPTX 原始字节（每次变化触发重新解析） */
  data: ArrayBuffer;
  labels: PptxPreviewLabels;
  className?: string;
  fileName?: string;
  /** 元素引用工厂：存在时工具条显示「选择元素」 */
  referenceSource?: { create(request: PptxElementReferenceRequest): Promise<unknown> };
  /** 外部跳转请求（如聊天中的元素引用定位） */
  referenceNavigation?: { requestId: string; pageIndex: number; expectedSourceFingerprint: string } | null;
  referenceNavigationReady?: boolean;
}) {
  const [loaded, setLoaded] = React.useState<{ generation: number; document: PptxDocument; sourceFingerprint: string } | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [pageInputValue, setPageInputValue] = React.useState(`1`);
  const [zoomPercent, setZoomPercent] = React.useState(100);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [thumbnailScrollRoot, setThumbnailScrollRoot] = React.useState<HTMLElement | null>(null);
  const [mainScrollRoot, setMainScrollRoot] = React.useState<HTMLElement | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState<SlideElement | null>(null);
  const [aiEditState, setAiEditState] = React.useState<{ selectedText?: string } | null>(null);
  const [referenceSubmitting, setReferenceSubmitting] = React.useState(false);
  const viewportSize = useElementSize(mainScrollRoot);
  const generationRef = React.useRef(0);
  const platformService = usePlatformService();
  const canExportPdf = !!(platformService?.printPageToPdf && platformService?.saveFile);
  const navigationRequestIdRef = React.useRef<string | null>(null);
  const renderSurfaceRef = React.useRef<HTMLDivElement>(null);
  const doc = loaded?.document ?? null;
  const generation = loaded?.generation ?? 0;

  /* --- 加载管线（原 useEffect [e]，jsx 359-397） --- */
  React.useEffect(() => {
    const myGeneration = generationRef.current + 1;
    generationRef.current = myGeneration;
    let cancelled = false;
    let pendingDocument: PptxDocument | null = null;
    setLoaded(null);
    setLoadFailed(false);
    setPageIndex(1);
    setPageInputValue(`1`);
    setZoomPercent(100);
    setSelectedElement(null);
    setAiEditState(null);
    setReferenceSubmitting(false);
    Promise.resolve(data)
      .then((buffer) =>
        vitePreload(
          async () => {
            const { pptxRendererPreviewEngine: engine } = await import(`./pptxRendererPreviewEngine`);
            return { pptxRendererPreviewEngine: engine };
          },
          [`./pptxRendererPreviewEngine`, `./presentationElementModel-r6vQ-JZl`],
          import.meta.url,
        ).then(({ pptxRendererPreviewEngine: engine }) => engine.open(buffer)),
      )
      .then((nextDocument) => ({ nextDocument, sourceFingerprint: data }))
      .then(({ nextDocument, sourceFingerprint }) => {
        pendingDocument = nextDocument;
        if (cancelled || myGeneration !== generationRef.current) {
          nextDocument.dispose();
          return;
        }
        setLoaded({ generation: myGeneration, document: nextDocument, sourceFingerprint: sourceFingerprint as never });
      })
      .catch((error) => {
        cancelled ||
          myGeneration !== generationRef.current ||
          (logger.error(`[PptxPreviewViewer] PPTX 解析失败`, error), setLoadFailed(true));
      });
    return () => {
      cancelled = true;
      myGeneration === generationRef.current && (generationRef.current += 1);
      pendingDocument?.dispose();
    };
  }, [data]);

  /* --- 翻页 / 输入框提交 / 键盘（原 Q/$/pe，jsx 398-423） --- */
  const goToPage = React.useCallback(
    (candidate: number) => {
      if (!doc || doc.pageCount === 0) return;
      const next = clampPageIndex(candidate, doc.pageCount);
      setPageIndex(next);
      setPageInputValue(String(next));
    },
    [doc],
  );
  const commitPageInput = React.useCallback(() => {
    const parsed = Number.parseInt(pageInputValue.trim(), 10);
    if (Number.isNaN(parsed)) {
      setPageInputValue(String(pageIndex));
      return;
    }
    goToPage(parsed);
  }, [goToPage, pageInputValue, pageIndex]);
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === `INPUT` || target.tagName === `TEXTAREA` || target.isContentEditable) return;
      if (event.key === `Escape` && selectionMode) {
        event.preventDefault();
        if (aiEditState) {
          setAiEditState(null);
          return;
        }
        setSelectionMode(false);
        setSelectedElement(null);
      } else {
        event.key === `ArrowLeft`
          ? (event.preventDefault(), goToPage(pageIndex - 1))
          : event.key === `ArrowRight` && (event.preventDefault(), goToPage(pageIndex + 1));
      }
    },
    [aiEditState, goToPage, pageIndex, selectionMode],
  );
  const exitSelection = React.useCallback(() => {
    setSelectionMode(false);
    setSelectedElement(null);
    setAiEditState(null);
  }, []);

  /* --- 缩放：视口 fit × 百分比（原 he，jsx 425-427） --- */
  const effectiveScale = React.useMemo(
    () =>
      !doc || viewportSize.width === 0 || viewportSize.height === 0
        ? 1
        : Math.min(
            Math.max(1, viewportSize.width - 32) / doc.pageSize.width,
            Math.max(1, viewportSize.height - 32) / doc.pageSize.height,
          ) * (zoomPercent / 100),
    [doc, viewportSize.height, viewportSize.width, zoomPercent],
  );
  const onRenderError = React.useCallback(
    (errorGeneration: number, error: Error) => {
      errorGeneration === generationRef.current &&
        (logger.error(`[PptxPreviewViewer] PPTX 页面渲染失败`, error), setLoadFailed(true));
    },
    [],
  );
  const onNavigateFromPage = React.useCallback((target: number) => goToPage(target + 1), [goToPage]);

  /* --- 外部引用跳转（原 useEffect，jsx 428-437） --- */
  React.useEffect(() => {
    if (!referenceNavigation) return;
    setSelectionMode(false);
    setSelectedElement(null);
    setAiEditState(null);
    if (!referenceNavigationReady || !doc || navigationRequestIdRef.current === referenceNavigation.requestId) return;
    navigationRequestIdRef.current = referenceNavigation.requestId;
    const pageNumber = referenceNavigation.pageIndex + 1;
    if (
      !Number.isInteger(referenceNavigation.pageIndex) ||
      referenceNavigation.pageIndex < 0 ||
      referenceNavigation.pageIndex >= doc.pageCount
    ) {
      toast(labels.referencedPageMissing(pageNumber));
      return;
    }
    goToPage(pageNumber);
    loaded?.sourceFingerprint !== referenceNavigation.expectedSourceFingerprint &&
      toast(labels.referencedSourceChanged(pageNumber));
  }, [doc, goToPage, labels, loaded?.sourceFingerprint, referenceNavigation, referenceNavigationReady]);
  React.useEffect(() => {
    setSelectedElement(null);
    setAiEditState(null);
  }, [generation, pageIndex]);

  /* --- 元素选择 / AI 编辑（原 ve/ye/be/xe，jsx 439-477） --- */
  const pageElements = React.useMemo(
    () => (doc && selectionMode ? doc.getPageElements(pageIndex - 1) : []),
    [doc, pageIndex, selectionMode],
  );
  const startAiEdit = React.useCallback(() => {
    if (!selectedElement || !loaded || !referenceSource || referenceSubmitting) return;
    const surface = renderSurfaceRef.current;
    const extracted = extractSelectedElementText({
      selection: surface?.ownerDocument.defaultView?.getSelection() ?? null,
      renderSurface: surface,
      pageSize: loaded.document.pageSize,
      elementBounds: selectedElement.bounds,
      elementText: selectedElement.text,
    });
    setAiEditState(extracted ? { selectedText: extracted } : {});
  }, [referenceSubmitting, loaded, referenceSource, selectedElement]);
  const onSelectElement = React.useCallback((element: SlideElement) => {
    setAiEditState(null);
    setSelectedElement(element);
  }, []);
  const addToConversation = React.useCallback(
    (comment: string) => {
      if (!selectedElement || !loaded || !referenceSource || !aiEditState || referenceSubmitting) return;
      const trimmedComment = comment.trim();
      setReferenceSubmitting(true);
      referenceSource
        .create({
          element: selectedElement,
          ...aiEditState,
          ...(trimmedComment ? { comment: trimmedComment } : {}),
          sourceFingerprint: loaded.sourceFingerprint as never,
        } as PptxElementReferenceRequest)
        .then(() => {
          toast;
          setAiEditState(null);
        })
        .catch((error) => {
          logger.error(`[PptxPreviewViewer] 创建 PPTX 元素引用失败`, error);
        })
        .finally(() => setReferenceSubmitting(false));
    },
    [referenceSubmitting, aiEditState, loaded, referenceSource, selectedElement],
  );

  /* --- 导出 PDF（原 Se/Ce，jsx 478-512） --- */
  const pdfFileName = React.useMemo(() => {
    const base = fileName?.split(/[\\/]/).pop()?.trim();
    if (!base) return `presentation.pdf`;
    const officeExt = /\.(pptx?|ppsx?)$/i;
    return officeExt.test(base) ? base.replace(officeExt, `.pdf`) : `${base}.pdf`;
  }, [fileName]);
  const exportPdf = React.useCallback(async () => {
    const printPageToPdf = platformService?.printPageToPdf;
    const saveFile = platformService?.saveFile;
    if (!doc || exportingPdf || !printPageToPdf || !saveFile) return;
    setExportingPdf(true);
    let printHost: { dispose(): void } | null = null;
    try {
      const { renderPresentationToPrintHost } = await vitePreload(
        async () => {
          const { renderPresentationToPrintHost: fn } = await import(`./presentationPdfPrintExport`);
          return { renderPresentationToPrintHost: fn };
        },
        [],
        import.meta.url,
      );
      const activeHost = await renderPresentationToPrintHost(doc, window.document);
      printHost = activeHost;
      const printed = await printPageToPdf();
      activeHost.dispose();
      printHost = null;
      if (!printed.success || !printed.data) throw Error(printed.error ?? `print_failed`);
      const saved = await saveFile({ data: printed.data, suggestedName: pdfFileName });
      if (saved.canceled) return;
      if (!saved.success || !saved.path) throw Error(saved.error ?? `save_failed`);
      toast(labels.exportPdfSuccess(saved.path));
    } catch (error) {
      logger.error(`[PptxPreviewViewer] PPTX 导出 PDF 失败`, error);
      toast(labels.exportPdfFailed);
    } finally {
      printHost?.dispose();
      setExportingPdf(false);
    }
  }, [doc, exportingPdf, labels, platformService, pdfFileName]);

  /* --- 渲染（原 jsx 513-612） --- */
  if (loadFailed) return <div className="p-3 text-ui-base text-destructive">{labels.loadError}</div>;
  if (!doc) return <div className="p-3 text-ui-base text-foreground-subtle">{labels.loading}</div>;
  if (doc.pageCount === 0) return <div className="p-3 text-ui-base text-foreground-subtle">{labels.noSlides}</div>;
  const currentPageIndex = pageIndex - 1;
  return (
    <div tabIndex={0} onKeyDown={onKeyDown} className={cn(`flex h-full min-h-0 outline-none`, className)}>
      <aside
        ref={setThumbnailScrollRoot}
        aria-label={labels.thumbnails}
        className="w-24 shrink-0 overflow-y-auto border-r border-border bg-surface/30 p-2 sm:w-32"
      >
        <div className="flex flex-col gap-2">
          {Array.from({ length: doc.pageCount }, (_, index) => (
            <SlideThumbnail
              key={index}
              document={doc}
              generation={generation}
              pageIndex={index}
              selected={index === currentPageIndex}
              scrollRoot={thumbnailScrollRoot}
              labels={labels}
              onSelect={() => goToPage(index + 1)}
            />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div ref={setMainScrollRoot} className="min-h-0 flex-1 overflow-auto">
          <div className="grid min-h-full min-w-full place-items-center p-4">
            <SlideAiEditPopover
              open={selectionMode && selectedElement !== null}
              boundary={mainScrollRoot}
              label={labels.aiEdit}
              commentPlaceholder={labels.commentPlaceholder}
              cancelLabel={labels.cancelAiEdit}
              addToConversationLabel={labels.addToConversation}
              editing={aiEditState !== null}
              disabled={referenceSubmitting}
              onAiEdit={startAiEdit}
              onCancelAiEdit={() => setAiEditState(null)}
              onAddToConversation={addToConversation}
              onExitSelection={exitSelection}
            >
              <SlidePage
                document={doc}
                generation={generation}
                pageIndex={currentPageIndex}
                scale={effectiveScale}
                interactive={true}
                selectionMode={selectionMode}
                elements={pageElements}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                renderSurfaceRef={renderSurfaceRef}
                onNavigate={onNavigateFromPage}
                onRenderError={onRenderError}
              />
            </SlideAiEditPopover>
          </div>
        </div>
        <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-center gap-1 border-t border-border bg-surface/30 px-2 py-1.5 text-ui-base">
          {referenceSource ? (
            <Button
              type="button"
              size="sm"
              variant={selectionMode ? `secondary` : `ghost`}
              aria-pressed={selectionMode}
              aria-label={selectionMode ? labels.exitElementSelection : labels.selectElement}
              title={selectionMode ? labels.exitElementSelection : labels.selectElement}
              onClick={() => {
                setSelectionMode((v) => !v);
                setSelectedElement(null);
                setAiEditState(null);
              }}
            >
              <IconMousePointerClick className="size-4" />
              {selectionMode ? labels.exitElementSelection : labels.selectElement}
            </Button>
          ) : null}
          <Button
            type="button" size="icon-md" variant="ghost"
            aria-label={labels.previousPage} title={labels.previousPage}
            disabled={pageIndex <= 1} onClick={() => goToPage(pageIndex - 1)}
          >
            <IconChevronLeft />
          </Button>
          <Input
            type="text" inputMode="numeric" aria-label={labels.pageInput}
            value={pageInputValue}
            onChange={(e) => setPageInputValue(e.target.value)}
            onBlur={commitPageInput}
            onKeyDown={(e) => {
              e.key === `Enter` && (commitPageInput(), e.currentTarget.blur());
            }}
            className="w-12 text-center text-mobile-input-safe tabular-nums md:text-ui-base"
          />
          <span className="min-w-10 text-center tabular-nums text-foreground-subtle">{`/ `}{doc.pageCount}</span>
          <Button
            type="button" size="icon-md" variant="ghost"
            aria-label={labels.nextPage} title={labels.nextPage}
            disabled={pageIndex >= doc.pageCount} onClick={() => goToPage(pageIndex + 1)}
          >
            <IconChevronRight />
          </Button>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button
            type="button" size="icon-md" variant="ghost"
            aria-label={labels.zoomOut} title={labels.zoomOut}
            disabled={zoomPercent <= 25} onClick={() => setZoomPercent((v) => clampZoomPercent(v - 25))}
          >
            <IconZoomOut />
          </Button>
          <span className="w-12 text-center tabular-nums text-foreground-subtle">{zoomPercent}{`%`}</span>
          <Button
            type="button" size="icon-md" variant="ghost"
            aria-label={labels.zoomIn} title={labels.zoomIn}
            disabled={zoomPercent >= 300} onClick={() => setZoomPercent((v) => clampZoomPercent(v + 25))}
          >
            <IconZoomIn />
          </Button>
          {canExportPdf ? (
            <>
              <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
              <Button
                type="button" size="icon-md" variant="ghost"
                aria-label={exportingPdf ? labels.exportingPdf : labels.exportPdf}
                title={exportingPdf ? labels.exportingPdf : labels.exportPdf}
                disabled={exportingPdf}
                onClick={() => void exportPdf()}
              >
                {exportingPdf ? <IconLoaderCircle className="animate-spin" /> : <IconFileDown />}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PptxPreviewViewer;
