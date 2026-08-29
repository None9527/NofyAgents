/* eslint-disable */
/**
 * ============================================================================
 * PdfViewer.tsx — ZCode 3.7.6 PDF 预览组件（解混淆重建 · D8 Stage B2 / PreviewMisc 族）
 * ============================================================================
 *
 * 来源文件（21,205 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/pdf-viewer-m6YcRb_5.js
 * 对照文件（同一 chunk 的 pretty-print 版，18,930 行；行号双标注以 js 为主）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/pdf-viewer-m6YcRb_5.jsx
 * 伴随样式（react-pdf 层/文本层 CSS，vendor，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/pdf-viewer-Dgb4oCkS.css
 *
 * ----------------------------------------------------------------------------
 * 一、chunk 结构总览（vendor 段登记 + 自研段全量重建）
 * ----------------------------------------------------------------------------
 * 本 chunk = 4 段 vendor + 1 段 ZCode 自研包装层。按任务策略，vendor 段仅登记
 * （行号范围 + 上游模块 + 锚点符号），不逐行转写；自研段（20821–21205）全量语义重建。
 *
 *  | # | 行范围 (js)    | 定性            | 上游模块 / 锚点符号                                    |
 *  |---|----------------|-----------------|----------------------------------------------------------|
 *  | 1 | 10–19411       | vendor          | **pdfjs-dist 5.4.296**（build/pdf.mjs 全量：display/api + |
 *  |   |                |                 | shared/util + 各显示层）。锚点：`h`=pdfjs 导出命名空间(10)、|
 *  |   |                |                 | `Gn`=GlobalWorkerOptions(9066)、`Dr`=TextLayer(10221)、    |
 *  |   |                |                 | `kr`=getDocument(10459)、apiVersion `5.4.296`(10531)、     |
 *  |   |                |                 | `Pr`=PDFWorker(11122)、`Rr`=version(11857)、               |
 *  |   |                |                 | `Ci`=AnnotationLayer(14358)、`qi`=AnnotationEditorLayer    |
 *  |   |                |                 | (18685)、`globalThis.pdfjsLib={…}`(19355–19411)            |
 *  | 2 | 19412–19457    | vendor          | **dequal**（react-pdf 依赖）。`Yi`=hasOwnProperty、        |
 *  |   |                |                 | `Xi`=setKeyLookup、`Zi`=dequal 深比较（19880/19887 处用于   |
 *  |   |                |                 | Document 的 options/source 记忆化比较）                    |
 *  | 3 | 19458–19470    | vendor          | **make-cancellable-promise**（react-pdf 依赖）。`Qi`=      |
 *  |   |                |                 | makeCancellable（{promise, cancel()}；19943/20128/20318/   |
 *  |   |                |                 | 20521/20706 处分别包装 getDocument/getAnnotations/         |
 *  |   |                |                 | getStructTree/getTextContent/getPage）                     |
 *  | 4 | 19471–19569    | vendor          | **make-event-props**（react-pdf 依赖）。`$i…ha`=React 事件 |
 *  |   |                |                 | 名数组族、`_a`=合并表、`va`=makeEventProps(eventProps,     |
 *  |   |                |                 | getArgs)                                                   |
 *  | 5 | 19570–19598    | vendor          | **warning**（CJS 包装 `ya`；react-pdf 依赖）               |
 *  | 6 | 19599–20820    | vendor          | **react-pdf 10.4.1**（dist/esm 全家桶）。锚点：`Q`=React   |
 *  |   |                |                 | 互操作、`ba`=DocumentContext(19601)、`Sa`=LinkService      |
 *  |   |                |                 | (19603)、`Ca`=Message(19708)、`wa`=PasswordResponses、     |
 *  |   |                |                 | `Ta/Ea`=useResolver reducer/hook(19716/19727)、           |
 *  |   |                |                 | `Oa/ka`=isBrowser/isLocalFileSystem、`Aa/ja/Ma/Na…`=       |
 *  |   |                |                 | shared/utils 谓词(19733+)、`qa`=Document forwardRef        |
 *  |   |                |                 | (19841)、`Ja`=useDocumentContext(20061)、`Ya`=mergeRefs、  |
 *  |   |                |                 | `Xa`=PageContext(20075)、`Za`=usePageContext、`Qa…`=       |
 *  |   |                |                 | AnnotationLayer(20108+)、`so`=StructTree(20342 附近)、     |
 *  |   |                |                 | TextLayer(20501+)、`Co`=defaultScale=1(20609)、            |
 *  |   |                |                 | `wo`=Page 组件(20610–20820)                                |
 *  | 7 | **20821–21205**| **自研（本文件）** | **ZCode PdfViewer 包装层**：worker 接线、cMap/range 选项、 |
 *  |   |                |                 | 缩放引擎（滚轮/按钮/锚点保持/快照遮罩）、工具栏、默认文案。 |
 *  |   |                |                 | 导出 `export { Go as PdfViewer }`                          |
 *
 * 注 1：react-pdf 上游 import 的 `clsx` 在 ZCode 构建里被替换为 bundle-mjs chunk
 *       （tailwind-merge dist/bundle-mjs.js 内含 clsx）的 `r` 导出（=clsx 本体，
 *       非 twMerge）：chunk 内 `f('react-pdf__Document', t)` 等调用语义不变。
 * 注 2：pdfjs worker 以伴随资产 `pdf.worker.min-qwK7q_zL.mjs` 形式发布（见自研段
 *       `To`），运行时 `Gn.workerSrc = To`；worker 经 pdfjs 内部动态
 *       `import(this.workerSrc)`（js 11282，走 preload-helper）加载。
 *
 * ----------------------------------------------------------------------------
 * 二、自研段 混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   To  → PDF_WORKER_SRC            worker URL（pdf.worker.min-qwK7q_zL.mjs）(20821 / 18642)
 *   Eo  → ZOOM_STEP = 0.25          按钮缩放步长 (20822 / 18643)
 *   Do  → MIN_ZOOM = 0.25           缩放下限 (20823 / 18643 段)
 *   Oo  → WHEEL_ZOOM_SENSITIVITY = 0.002  滚轮缩放指数灵敏度 (20824)
 *   ko  → clampZoom                 min(MIN)~max(4) 夹取 (20825)
 *   Ao  → clamp                     通用夹取 (20828)
 *   jo  → memoizedSize              尺寸对象复用（宽高原值则返旧引用）(20831)
 *   Mo  → scaleSize                 尺寸 × 缩放（向下取整）(20834)
 *   No  → zoomOverlayStyle          缩放过渡期的 absolute+scale 变换样式 (20837)
 *   Po  → resolveZoomAnchorPoint    指针/视口中心 → 页面比例锚点 (20845)
 *   Fo  → applyScrollPreservation   按锚点比例修正滚动偏移 (20863)
 *   Io  → useStageZoomOverlay       缩放快照遮罩钩子（canvas 翻拍）(20868 / 18693)
 *   Lo  → buildCMapOptions          cMapUrl=…/pdfjs/cmaps/ + cMapPacked (20910 / 18724)
 *   Ro  → RANGE_CHUNK_SIZE = 256KB  (20914 / 18732)
 *   zo  → CMAP_DOCUMENT_OPTIONS     当前 location 的 cMap 选项 (20915)
 *   Bo  → RANGE_DOCUMENT_OPTIONS    cMap + disableAutoFetch/disableStream/rangeChunkSize (20916)
 *   Vo  → isRangeSource             判定 {requestRange} 范围源 (20917)
 *   Ho  → RangeSourcePDFDataRangeTransport  继承 pdfjs PDFDataRangeTransport (20920 / 18743)
 *   Uo  → DEFAULT_PDF_VIEWER_LABELS 英文兜底文案 8 条 (20937 / 18757)
 *   Wo  → normalizePdfSource        string|Blob|ArrayBuffer|TypedArray → getDocument 参数 (20948 / 18767)
 *   Go  → PdfViewer                 主组件（导出名 PdfViewer）(20956–21204 / 18774–18929)
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk 导入；js 1–9 行 import 块）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js（`Q`/`$`）
 *  2. preload-helper                 preload-helper-BHSF1fZ9.js（`a`；pdfjs worker 动态 import 用）
 *  3. isMacPlatform (o→`a` 导出)     keyboardShortcuts-BGHopxr9.js：navigator.platform/UA
 *                                    判 Mac（滚轮缩放修饰键 metaKey vs ctrlKey）
 *  4. Button (d→t) + 4 图标          button-laUijeDG.js：`s`=chevron-left(v)、`l`=chevron-right(y)、
 *                                    `c`=zoom-out(x)、`s`→zoom-in(b)；图标为 Sa=createLucideIcon 产物
 *  5. clsx (f→`r` 导出)              bundle-mjs-D8tLE0rB.js（tailwind-merge bundle 内含 clsx；
 *                                    仅 vendor react-pdf 段使用）
 *  6. cn (p→`t` 导出)                utils-CEEH0K_K.js（ZCode tailwind-merge 配置）
 *  7. tiny-invariant (m→`t` 导出)    仅 vendor react-pdf 段使用
 *  8. pdfjs-dist / react-pdf         本 chunk 内联（§一 段 1、段 6）
 *
 * 调用方（上游）：styles-CdEGpc2x.js 的 `lVt`（lazy PDF 预览，MODULE-MAP F14 副根，
 * js 160323–161140 段）经动态 import 载入本 chunk 并以 `<PdfViewer source labels …/>`
 * 挂载；`labels` 的 i18n 文案由调用方经 `codeViewer.*` 键提供（本组件仅带英文兜底）。
 * ============================================================================
 */

import * as React from "react";
import { isMacPlatform } from './LegacyDocEngineBModel';
import { cn } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于 §三 所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 p，utils-CEEH0K_K.js 的 t 导出） */

/** Mac 平台判定（原 o，keyboardShortcuts-BGHopxr9.js 的 a 导出：
 *  navigator.platform 含 mac/iphone/ipad/ipod，或 UA 匹配 Mac|iPhone|iPad|iPod） */

/** 按钮（原 d，button-laUijeDG.js 的 t 导出） */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
declare const Button: React.FC<ButtonProps>;

/* 图标（原 s/l/c/s，button-laUijeDG.js；lucide 工厂产物） */
type IconProps = React.SVGProps<SVGSVGElement>;
declare const IconChevronLeft: React.FC<IconProps>;   // 原 u（button chunk `s` 导出 = chevron-left）
declare const IconChevronRight: React.FC<IconProps>;  // 原 l（button chunk `o` 导出 = chevron-right）
declare const IconZoomOut: React.FC<IconProps>;       // 原 c（button chunk `i` 导出 = zoom-out）
declare const IconZoomIn: React.FC<IconProps>;        // 原 s（button chunk `a` 导出 = zoom-in）

/* --- pdfjs-dist 5.4.296（本 chunk vendor 段 1；此处仅取自研段用到的两个符号） --- */

/** 原 `jr`（pdfjs PDFDataRangeTransport）：length/initialData 构造，
 *  子类实现 requestDataRange；onDataRange 由基类提供。 */
declare class PDFDataRangeTransport {
  constructor(length: number, initialData?: Uint8Array | null);
  requestDataRange(begin: number, end: number): void;
  onDataRange(begin: number, chunk: Uint8Array): void;
  abort(): void;
}

/** 原 `Gn`（pdfjs GlobalWorkerOptions）：workerSrc 静态属性。 */
declare const GlobalWorkerOptions: { workerSrc: string };

/* --- react-pdf 10.4.1（本 chunk vendor 段 6；原 qa / wo） --- */

/** pdfjs PDFDocumentProxy 的最小消费面（onLoadSuccess 回调用） */
interface PdfDocumentProxy {
  numPages: number;
}

/** react-pdf Page onRenderSuccess 回调载荷（原 makePageCallback(page, scale)） */
interface PageRenderResult {
  pageNumber: number;
  scale: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotate: number;
}

/** getDocument 参数形状（原 Wo 归一化结果 / 范围源包装） */
type PdfFileSource = string | Blob | ArrayBuffer | Uint8Array | { range: PDFDataRangeTransport };
type NormalizedPdfSource = string | Blob | { data: Uint8Array } | { range: PDFDataRangeTransport };

/** react-pdf Document（原 qa，js 19841；forwardRef；props 取本组件实际用到的子集） */
declare const PdfDocument: React.FC<{
  file: NormalizedPdfSource;
  options?: Record<string, unknown>;
  onLoadSuccess?: (pdf: PdfDocumentProxy) => void;
  onLoadError?: (error: Error) => void;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  noData?: React.ReactNode;
  children?: React.ReactNode;
}>;

/** react-pdf Page（原 wo，js 20610） */
declare const PdfPage: React.FC<{
  pageNumber: number;
  scale?: number;
  renderAnnotationLayer?: boolean;
  onRenderSuccess?: (result: PageRenderResult) => void;
  className?: string;
}>;

/* ============================================================================
 * 1. worker 接线与常量（原 To/Eo/Do/Oo/Ro/zo/Bo，js 20821–20824、20914–20916）
 * ==========================================================================*/

/** 原 To：pdfjs worker 伴随资产（构建期哈希命名）。 */
const PDF_WORKER_SRC = "" + new URL("pdf.worker.min-qwK7q_zL.mjs", import.meta.url).href;

/** 原 Eo：工具栏 ± 按钮的缩放步长。 */
const ZOOM_STEP = 0.25;
/** 原 Do：缩放下限（上限硬编码 4，见 clampZoom 与按钮 disabled 判定）。 */
const MIN_ZOOM = 0.25;
/** 原 Oo：滚轮缩放灵敏度（指数模型 zoom·exp(-deltaY·Oo)）。 */
const WHEEL_ZOOM_SENSITIVITY = 0.002;

/** 原 Ro：pdfjs range 请求分块尺寸。 */
const RANGE_CHUNK_SIZE = 256 * 1024;

/** 原 Lo（js 20910）：cMap 选项——相对给定基址解析 `pdfjs/cmaps/` 目录。 */
function buildCMapOptions(baseUrl: string, baseHref: string): { cMapPacked: boolean; cMapUrl: string } {
  const resolved = new URL(baseUrl, baseHref);
  return { cMapPacked: true, cMapUrl: new URL("pdfjs/cmaps/", resolved).href };
}

/** 原 zo：以当前页面地址为基址的 cMap 选项（SSR/无 location 时兜底 localhost）。 */
const CMAP_DOCUMENT_OPTIONS = buildCMapOptions("./", globalThis.location?.href ?? "http://localhost/");

/** 原 Bo：范围加载（range 源）专用选项——禁自动抓取/禁流式 + 256KB 分块。 */
const RANGE_DOCUMENT_OPTIONS = {
  ...CMAP_DOCUMENT_OPTIONS,
  disableAutoFetch: true,
  disableStream: true,
  rangeChunkSize: RANGE_CHUNK_SIZE,
};

// 原 `Gn.workerSrc = To`（js 20913）：全局接线 pdfjs worker。
GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

/* ============================================================================
 * 2. 范围源适配（原 Vo/Ho/Wo，js 20917–20954）
 * ==========================================================================*/

/** 原 Vo：鸭子类型判定「可按范围取数」的数据源（工作区文件服务提供）。 */
function isRangeSource(source: unknown): source is RangeSource {
  return typeof source === "object" && !!source && "requestRange" in source && typeof (source as RangeSource).requestRange === "function";
}

/** 范围源接口（原 e.totalBytes/initialData/requestRange 调用面归纳） */
interface RangeSource {
  totalBytes: number;
  initialData?: Uint8Array | null;
  requestRange(begin: number, length: number): Promise<Uint8Array>;
}

/**
 * 原 Ho（js 20920 / jsx 18743）：把 ZCode 范围源适配成 pdfjs 的
 * PDFDataRangeTransport。requestRange 失败时经 onRequestError 上抛
 * （主组件置「加载失败」态并透传 onLoadError）。
 */
class RangeSourcePDFDataRangeTransport extends PDFDataRangeTransport {
  rangeSource: RangeSource;
  onRequestError: (error: Error) => void;

  constructor(rangeSource: RangeSource, onRequestError: (error: Error) => void) {
    super(rangeSource.totalBytes, rangeSource.initialData ?? null);
    this.rangeSource = rangeSource;
    this.onRequestError = onRequestError;
  }

  requestDataRange(begin: number, end: number): void {
    this.rangeSource
      .requestRange(begin, end - begin)
      .then((chunk) => {
        this.onDataRange(begin, chunk);
      })
      .catch((error) => {
        this.onRequestError(error instanceof Error ? error : Error(String(error)));
      });
  }
}

/** 原 Wo（js 20948）：把外部 source 归一成 getDocument 可接受形状。
 *  string/Blob 原样；ArrayBuffer 拷贝一份（避免转移后失效）；
 *  其余 TypedArray 直接包 {data}。 */
function normalizePdfSource(source: string | Blob | ArrayBuffer | Uint8Array): NormalizedPdfSource {
  return typeof source === "string" || source instanceof Blob
    ? source
    : source instanceof ArrayBuffer
      ? { data: new Uint8Array(source.slice(0)) }
      : { data: new Uint8Array(source) };
}

/* ============================================================================
 * 3. 缩放引擎纯函数（原 ko/Ao/jo/Mo/No/Po/Fo，js 20825–20867）
 * ==========================================================================*/

/** 原 ko：缩放夹取 [MIN_ZOOM, 4]。 */
function clampZoom(zoom: number): number {
  return Math.min(4, Math.max(MIN_ZOOM, zoom));
}

/** 原 Ao：通用夹取 [min, max]。 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface Size {
  width: number;
  height: number;
}

/** 原 jo：宽高原值时返回旧对象引用（避免无谓 re-render）。 */
function memoizedSize(previous: Size | null | undefined, width: number, height: number): Size {
  return previous?.width === width && previous.height === height ? previous : { width, height };
}

/** 原 Mo：尺寸按缩放放大（向下取整）；无尺寸且缩放为 1 时返回 undefined。 */
function scaleSize(size: Size | null | undefined, zoom: number): Size | undefined {
  return size ? { width: Math.floor(size.width * zoom), height: Math.floor(size.height * zoom) } : undefined;
}

/** 原 No：缩放过渡期旧快照的定位/变换样式——
 *  有快照时 absolute+inset-0 叠放，缩放≠1 时以左上为原点 scale。 */
function zoomOverlayStyle(hasOverlay: boolean, overlayScale: number): React.CSSProperties | undefined {
  if (!hasOverlay && overlayScale === 1) return undefined;
  return {
    position: hasOverlay ? "absolute" : undefined,
    inset: hasOverlay ? 0 : undefined,
    transform: overlayScale === 1 ? undefined : `scale(${overlayScale})`,
    transformOrigin: "top left",
  };
}

/** 缩放锚点（指针位置或视口中心在页面上的比例坐标）。 */
interface ZoomAnchorPoint {
  clientX: number;
  clientY: number;
  pageXRatio: number;
  pageYRatio: number;
}

/** 原 Po（js 20845）：求缩放锚点——事件指针位置（缺省视口中心）夹进
 *  滚动容器后，换算成相对页面视口的 0–1 比例。容器零尺寸返回 null。 */
function resolveZoomAnchorPoint(
  scrollContainer: HTMLElement,
  pageViewport: HTMLElement,
  event?: { clientX?: number; clientY?: number } | null,
): ZoomAnchorPoint | null {
  const containerRect = scrollContainer.getBoundingClientRect();
  const viewportRect = pageViewport.getBoundingClientRect();
  if (viewportRect.width === 0 || viewportRect.height === 0) return null;
  const clientX = event?.clientX ?? containerRect.left + containerRect.width / 2;
  const clientY = event?.clientY ?? containerRect.top + containerRect.height / 2;
  const clampedX = clamp(clientX, containerRect.left, containerRect.right);
  const clampedY = clamp(clientY, containerRect.top, containerRect.bottom);
  const pageXRatio = clamp((clampedX - viewportRect.left) / viewportRect.width, 0, 1);
  const pageYRatio = clamp((clampedY - viewportRect.top) / viewportRect.height, 0, 1);
  return {
    clientX: viewportRect.left + viewportRect.width * pageXRatio,
    clientY: viewportRect.top + viewportRect.height * pageYRatio,
    pageXRatio,
    pageYRatio,
  };
}

/** 原 Fo（js 20863）：缩放后按锚点比例回补滚动，使指针下的内容不漂移。 */
function applyScrollPreservation(scrollContainer: HTMLElement, pageViewport: HTMLElement, anchor: ZoomAnchorPoint): void {
  const viewportRect = pageViewport.getBoundingClientRect();
  scrollContainer.scrollLeft += viewportRect.left + viewportRect.width * anchor.pageXRatio - anchor.clientX;
  scrollContainer.scrollTop += viewportRect.top + viewportRect.height * anchor.pageYRatio - anchor.clientY;
}

/* ============================================================================
 * 4. useStageZoomOverlay（原 Io，js 20868–20909 / jsx 18693）
 * ----------------------------------------------------------------------------
 * 缩放不是即时重渲染：新分辨率的 canvas 要等 pdfjs 重绘（~200ms 防抖后提交）。
 * 过渡期用「旧 canvas 翻拍快照」盖在页面上做 CSS scale，避免白屏/跳变：
 *  - stageZoomOverlay(w,h)：翻拍当前 .react-pdf__Page__canvas 成离屏 canvas，
 *    absolute 叠放（z-1、pointer-events-none、aria-hidden）；
 *  - clearZoomOverlay()：移除快照；
 *  - pageViewportRef：挂在页面容器上，供锚点计算与翻拍取 canvas。
 * 组件卸载时自动移除快照。
 * ==========================================================================*/

function useStageZoomOverlay(): {
  clearZoomOverlay: () => void;
  pageViewportRef: React.RefObject<HTMLDivElement | null>;
  stageZoomOverlay: (width: number, height: number) => void;
} {
  const pageViewportRef = React.useRef<HTMLDivElement>(null);
  // 仅命令式使用（不挂 JSX ref），故用可空可变 ref
  const overlayCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const clearZoomOverlay = React.useCallback(() => {
    overlayCanvasRef.current?.remove();
    overlayCanvasRef.current = null;
  }, []);

  const stageZoomOverlay = React.useCallback((width: number, height: number) => {
    const viewport = pageViewportRef.current;
    if (!viewport) return;
    let overlay = overlayCanvasRef.current;
    if (!overlay) {
      // 只翻拍可见的页面 canvas；隐藏（visibility:hidden）时不做快照
      const sourceCanvas = viewport.querySelector<HTMLCanvasElement>(".react-pdf__Page__canvas");
      if (!sourceCanvas || sourceCanvas.style.visibility === "hidden") return;
      const cssWidth = sourceCanvas.offsetWidth;
      const cssHeight = sourceCanvas.offsetHeight;
      if (cssWidth === 0 || cssHeight === 0 || sourceCanvas.width === 0 || sourceCanvas.height === 0) return;
      overlay = document.createElement("canvas");
      overlay.width = sourceCanvas.width;
      overlay.height = sourceCanvas.height;
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.zIndex = "1";
      overlay.style.display = "block";
      overlay.style.pointerEvents = "none";
      overlay.style.userSelect = "none";
      overlay.setAttribute("aria-hidden", "true");
      const context = overlay.getContext("2d");
      if (!context) return;
      context.drawImage(sourceCanvas, 0, 0);
      viewport.appendChild(overlay);
      overlayCanvasRef.current = overlay;
    }
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
  }, []);

  React.useEffect(
    () => () => {
      overlayCanvasRef.current?.remove();
    },
    [],
  );

  return { clearZoomOverlay, pageViewportRef, stageZoomOverlay };
}

/* ============================================================================
 * 5. 默认文案（原 Uo，js 20937 / jsx 18757）
 * ----------------------------------------------------------------------------
 * 调用方（styles chunk lVt）经 labels prop 注入 i18n 文案；此处为英文兜底，
 * 与原始对象逐字一致。
 * ==========================================================================*/

export interface PdfViewerLabels {
  loading: string;
  loadError: string;
  noData: string;
  previousPage: string;
  nextPage: string;
  pageInput: string;
  zoomIn: string;
  zoomOut: string;
}

const DEFAULT_PDF_VIEWER_LABELS: PdfViewerLabels = {
  loading: "Loading PDF…",
  loadError: "Failed to load PDF",
  noData: "No PDF data",
  previousPage: "Previous page",
  nextPage: "Next page",
  pageInput: "Page number",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
};

/* ============================================================================
 * 6. PdfViewer（原 Go，js 20956–21204 / jsx 18774–18929）
 * ----------------------------------------------------------------------------
 * 结构要点：
 *  - 外层 `flex h-full min-h-0 flex-col outline-none`，tabIndex=0 接管方向键翻页；
 *  - 中段滚动容器 `min-h-0 flex-1 overflow-auto`，内层 `mx-auto w-max p-4` 居中页面；
 *  - 页面三层嵌套：[尺寸层 style=缩放后尺寸] > [变换层 style=快照缩放] > <Document>；
 *  - 底栏工具条 `border-t`：[上一页] [页码输入/总页数] [下一页] | [缩小] N% [放大]；
 *  - 缩放双轨：目标 zoom（x）与已提交渲染 renderedScale（y）。zoom 变化 200ms
 *    防抖后才提交给 <Page scale>；期间旧快照做 CSS scale 过渡（§4）；
 *  - 锚点保持：缩放前记指针比例坐标（Po），layoutEffect 中回补滚动（Fo）；
 *  - 翻页：页码输入（Enter/失焦提交，NaN 回滚）+ ←/→ 键 + 按钮；换页清缩放
 *    快照并置 pendingScrollToTop，渲染成功回调里滚回顶部；
 *  - 范围源：source 为 {requestRange} 时走 RangeSourcePDFDataRangeTransport +
 *    RANGE_DOCUMENT_OPTIONS；取数失败置内嵌错误态（T）并调 onLoadError；
 *  - 滚轮缩放：Mac 用 metaKey、其余 ctrlKey（isMacPlatform），
 *    zoom·exp(-deltaY·0.002)，preventDefault 阻断页面滚动。
 * ==========================================================================*/

export interface PdfViewerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** PDF 数据源：URL 字符串 / Blob / ArrayBuffer / TypedArray / 范围源。 */
  source: string | Blob | ArrayBuffer | Uint8Array | RangeSource;
  /** i18n 文案（缺省键用英文兜底，见 DEFAULT_PDF_VIEWER_LABELS）。 */
  labels?: Partial<PdfViewerLabels>;
  /** 加载失败回调（含范围取数失败）。 */
  onLoadError?: (error: Error) => void;
  className?: string;
}

export function PdfViewer({ source, labels, onLoadError, className, ...rest }: PdfViewerProps) {
  const mergedLabels = { ...DEFAULT_PDF_VIEWER_LABELS, ...labels };

  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageInputValue, setPageInputValue] = React.useState("1");
  /** 已提交给 <Page> 渲染的缩放（滞后于 zoom）。 */
  const [renderedScale, setRenderedScale] = React.useState(1);
  /** 目标缩放（按钮/滚轮即时更新）。 */
  const [zoom, setZoom] = React.useState(1);
  /** 最近一次渲染成功上报的页面原始尺寸。 */
  const [pageSize, setPageSize] = React.useState<Size | null>(null);
  /** 范围取数失败 → 内嵌错误态。 */
  const [isRangeLoadFailed, setIsRangeLoadFailed] = React.useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  /** 换页待滚顶标记（渲染成功回调里兑现）。 */
  const pendingScrollToTopRef = React.useRef(false);
  const zoomRef = React.useRef(1);
  /** 最近一次已提交渲染的缩放（渲染成功回调的校验基准）。 */
  const renderedScaleRef = React.useRef(1);
  const zoomAnchorRef = React.useRef<ZoomAnchorPoint | null>(null);
  const onLoadErrorRef = React.useRef(onLoadError);
  onLoadErrorRef.current = onLoadError;

  const { clearZoomOverlay, pageViewportRef, stageZoomOverlay } = useStageZoomOverlay();

  // 范围源 → 传输适配器（失败回调：置错误态 + 透传 onLoadError）
  const rangeTransport = React.useMemo(
    () =>
      isRangeSource(source)
        ? new RangeSourcePDFDataRangeTransport(source, (error) => {
            setIsRangeLoadFailed(true);
            onLoadErrorRef.current?.(error);
          })
        : null,
    [source],
  );

  // getDocument 参数：范围源走 {range}，否则归一化普通源
  const documentSource = React.useMemo<NormalizedPdfSource>(
    () => (rangeTransport ? { range: rangeTransport } : normalizePdfSource(source as string | Blob | ArrayBuffer | Uint8Array)),
    [rangeTransport, source],
  );

  // source 变更：中止旧范围请求
  React.useEffect(
    () => () => {
      rangeTransport?.abort();
    },
    [rangeTransport],
  );

  // source 变更：全部状态复位（页码/缩放/快照/标记）
  React.useEffect(() => {
    setPageCount(null);
    setPageNumber(1);
    setPageInputValue("1");
    setRenderedScale(1);
    setZoom(1);
    setPageSize(null);
    setIsRangeLoadFailed(false);
    zoomRef.current = 1;
    renderedScaleRef.current = 1;
    pendingScrollToTopRef.current = false;
    zoomAnchorRef.current = null;
    clearZoomOverlay();
  }, [clearZoomOverlay, documentSource]);

  /** 原 I：翻页（夹取 1..pageCount；真正换页时清快照/锚点并标记滚顶）。 */
  const goToPage = React.useCallback(
    (target: number) => {
      if (pageCount === null) return;
      const next = Math.min(Math.max(1, Math.round(target)), pageCount);
      setPageInputValue(String(next));
      if (next !== pageNumber) {
        clearZoomOverlay();
        setPageSize(null);
        zoomAnchorRef.current = null;
        pendingScrollToTopRef.current = true;
        setPageNumber(next);
      }
    },
    [clearZoomOverlay, pageCount, pageNumber],
  );

  /** 原 L：渲染成功回调——仅当缩放与已提交值一致时采纳尺寸
   *  （防过期渲染覆盖新缩放的布局）；换页则滚回顶部。 */
  const handleRenderSuccess = React.useCallback(
    (scale: number, width: number, height: number) => {
      if (Math.abs(scale - renderedScaleRef.current) > 0.001) return;
      setPageSize((previous) => memoizedSize(previous, width, height));
      clearZoomOverlay();
      const container = scrollContainerRef.current;
      const wasPageChange = pendingScrollToTopRef.current;
      pendingScrollToTopRef.current = false;
      if (container && wasPageChange) container.scrollTop = 0;
    },
    [clearZoomOverlay],
  );

  /** 原 R：页码输入提交（Enter/失焦）；NaN 回滚为当前页。 */
  const commitPageInput = React.useCallback(() => {
    const parsed = Number.parseInt(pageInputValue.trim(), 10);
    if (Number.isNaN(parsed)) {
      setPageInputValue(String(pageNumber));
      return;
    }
    goToPage(parsed);
  }, [goToPage, pageInputValue, pageNumber]);

  /** 原 ne：外层键盘 ←/→ 翻页（输入框内不触发）。 */
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).tagName !== "INPUT")
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToPage(pageNumber - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goToPage(pageNumber + 1);
        }
    },
    [goToPage, pageNumber],
  );

  const isDocumentLoaded = pageCount !== null;

  /** 原 ie：应用新缩放——记锚点（指针/视口中心）后更新目标 zoom。 */
  const applyZoom = React.useCallback(
    (nextZoom: number, event?: { clientX?: number; clientY?: number } | null) => {
      const current = zoomRef.current;
      const clamped = clampZoom(nextZoom);
      if (clamped === current) return;
      const container = scrollContainerRef.current;
      const viewport = pageViewportRef.current;
      zoomAnchorRef.current = container && viewport ? resolveZoomAnchorPoint(container, viewport, event) : null;
      zoomRef.current = clamped;
      setZoom(clamped);
    },
    [pageViewportRef],
  );

  // 缩放提交后立即按锚点回补滚动（layoutEffect 保证在绘制前）
  React.useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current;
    const container = scrollContainerRef.current;
    const viewport = pageViewportRef.current;
    zoomAnchorRef.current = null;
    if (anchor && container && viewport) applyScrollPreservation(container, viewport, anchor);
  }, [zoom, pageViewportRef]);

  // zoom 稳定 200ms 后提交渲染：先铺旧画布快照，再让 <Page> 以新 scale 重绘
  React.useEffect(() => {
    if (zoom === renderedScale) return;
    const timer = window.setTimeout(() => {
      const viewport = pageViewportRef.current;
      if (viewport) stageZoomOverlay(viewport.offsetWidth, viewport.offsetHeight);
      renderedScaleRef.current = zoom;
      setRenderedScale(zoom);
    }, 200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [zoom, renderedScale, stageZoomOverlay]);

  // 滚轮缩放：Mac=metaKey、其余=ctrlKey；指数模型；阻断默认滚动
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isDocumentLoaded) return;
    const mac = isMacPlatform();
    const onWheel = (event: WheelEvent) => {
      if ((mac ? event.metaKey : event.ctrlKey)) {
        event.preventDefault();
        if (event.deltaY !== 0) applyZoom(zoomRef.current * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY), event);
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [isDocumentLoaded, applyZoom]);

  const isDocumentLoading = pageCount === null;
  const zoomPercent = Math.round(zoom * 100);
  const overlayScale = zoom / renderedScale;
  const scaledSize = scaleSize(pageSize, zoom);
  const overlayTransformStyle = zoomOverlayStyle(scaledSize !== undefined, overlayScale);

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className={cn("flex h-full min-h-0 flex-col outline-none", className)} {...rest}>
      {/* 滚动区 */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-max p-4">
          {isRangeLoadFailed ? (
            <div className="p-3 text-ui-base text-destructive">{mergedLabels.loadError}</div>
          ) : (
            <div ref={pageViewportRef} className="relative" style={scaledSize}>
              <div style={overlayTransformStyle}>
                <PdfDocument
                  file={documentSource}
                  options={rangeTransport ? RANGE_DOCUMENT_OPTIONS : CMAP_DOCUMENT_OPTIONS}
                  onLoadSuccess={(pdf) => {
                    setPageCount(pdf.numPages);
                    const next = Math.min(pageNumber, pdf.numPages);
                    setPageNumber(next);
                    setPageInputValue(String(next));
                  }}
                  onLoadError={onLoadError}
                  loading={<div className="p-3 text-ui-base text-foreground-subtle">{mergedLabels.loading}</div>}
                  error={<div className="p-3 text-ui-base text-destructive">{mergedLabels.loadError}</div>}
                  noData={<div className="p-3 text-ui-base text-foreground-subtle">{mergedLabels.noData}</div>}
                >
                  <PdfPage
                    pageNumber={pageNumber}
                    scale={renderedScale}
                    renderAnnotationLayer={false}
                    onRenderSuccess={(result) => handleRenderSuccess(result.width / result.originalWidth, result.originalWidth, result.originalHeight)}
                    className="shadow-md"
                  />
                </PdfDocument>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 工具条：翻页 + 页码 + 缩放 */}
      <div className="flex shrink-0 items-center justify-center gap-1 border-t border-border px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={mergedLabels.previousPage}
          disabled={isDocumentLoading || pageNumber <= 1}
          onClick={() => goToPage(pageNumber - 1)}
        >
          <IconChevronLeft />
        </Button>
        <div className="flex items-center gap-1 text-ui-base text-foreground-subtle">
          <input
            value={pageInputValue}
            inputMode="numeric"
            disabled={isDocumentLoading}
            aria-label={mergedLabels.pageInput}
            onChange={(event) => setPageInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitPageInput();
              }
            }}
            onBlur={commitPageInput}
            className="h-6 w-10 rounded-md border border-input-border bg-input px-1 text-center text-ui-base text-foreground outline-none transition-colors hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused disabled:pointer-events-none disabled:opacity-50"
          />
          <span>{"/ "}{pageCount ?? "-"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={mergedLabels.nextPage}
          disabled={isDocumentLoading || pageCount === null || pageNumber >= pageCount}
          onClick={() => goToPage(pageNumber + 1)}
        >
          <IconChevronRight />
        </Button>
        <div className="mx-1 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={mergedLabels.zoomOut}
          disabled={isDocumentLoading || zoom <= 0.25}
          onClick={() => applyZoom(zoom - ZOOM_STEP)}
        >
          <IconZoomOut />
        </Button>
        <span className="w-11 text-center text-ui-base text-foreground-subtle tabular-nums">{zoomPercent}%</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={mergedLabels.zoomIn}
          disabled={isDocumentLoading || zoom >= 4}
          onClick={() => applyZoom(zoom + ZOOM_STEP)}
        >
          <IconZoomIn />
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ============================================================================
 * 导出符号（1 个）：
 *   PdfViewer -> Go -> PdfViewer（原导出 `export { Go as PdfViewer }`）
 *
 * 自研段局部符号（17 个，全部在本文件重建）：
 *   To -> PDF_WORKER_SRC            Eo -> ZOOM_STEP
 *   Do -> MIN_ZOOM                  Oo -> WHEEL_ZOOM_SENSITIVITY
 *   ko -> clampZoom                 Ao -> clamp
 *   jo -> memoizedSize              Mo -> scaleSize
 *   No -> zoomOverlayStyle          Po -> resolveZoomAnchorPoint
 *   Fo -> applyScrollPreservation   Io -> useStageZoomOverlay
 *   Lo -> buildCMapOptions          Ro -> RANGE_CHUNK_SIZE
 *   zo -> CMAP_DOCUMENT_OPTIONS     Bo -> RANGE_DOCUMENT_OPTIONS
 *   Vo -> isRangeSource             Ho -> RangeSourcePDFDataRangeTransport
 *   Uo -> DEFAULT_PDF_VIEWER_LABELS Wo -> normalizePdfSource
 *
 * vendor 段登记（不转写）：
 *   pdfjs-dist 5.4.296（js 10–19411）、dequal（19412–19457）、
 *   make-cancellable-promise（19458–19470）、make-event-props（19471–19569）、
 *   warning（19570–19598）、react-pdf 10.4.1（19599–20820）
 * ============================================================================ */
