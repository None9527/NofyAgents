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
 *   To  → PDF_WORKER_SRC            worker URL（pdf.worker.min-qwK7q_zL.mjs）(3352)
 *   Eo  → ZOOM_STEP = 0.25          按钮缩放步长 (20822)
 *   Do  → MIN_ZOOM = 0.25           缩放下限 (20823 / 18643 段)
 *   Oo  → WHEEL_ZOOM_SENSITIVITY = 0.002  滚轮缩放指数灵敏度 (3361)
 *   ko  → clampZoom                 min(MIN)~max(4) 夹取 (20825)
 *   Ao  → clamp                     通用夹取 (20828)
 *   jo  → memoizedSize              尺寸对象复用（宽高原值则返旧引用）(1308)
 *   Mo  → scaleSize                 尺寸 × 缩放（向下取整）(20834)
 *   No  → zoomOverlayStyle          缩放过渡期的 absolute+scale 变换样式 (1318)
 *   Po  → resolveZoomAnchorPoint    指针/视口中心 → 页面比例锚点 (1324)
 *   Fo  → applyScrollPreservation   按锚点比例修正滚动偏移 (20863)
 *   Io  → useStageZoomOverlay       缩放快照遮罩钩子（canvas 翻拍）(20868)
 *   Lo  → buildCMapOptions          cMapUrl=…/pdfjs/cmaps/ + cMapPacked (1371)
 *   Ro  → RANGE_CHUNK_SIZE = 256KB  (1374)
 *   zo  → CMAP_DOCUMENT_OPTIONS     当前 location 的 cMap 选项 (1407)
 *   Bo  → RANGE_DOCUMENT_OPTIONS    cMap + disableAutoFetch/disableStream/rangeChunkSize (1453)
 *   Vo  → isRangeSource             判定 {requestRange} 范围源 (1553)
 *   Ho  → RangeSourcePDFDataRangeTransport  继承 pdfjs PDFDataRangeTransport (1885)
 *   Uo  → DEFAULT_PDF_VIEWER_LABELS 英文兜底文案 8 条 (1895)
 *   Wo  → normalizePdfSource        string|Blob|ArrayBuffer|TypedArray → getDocument 参数 (1911)
 *   Go  → PdfViewer                 主组件（导出名 PdfViewer）(20956–21204)
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk 导入；js 1–9 行 import 块）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js（`Q`/`$`）
 *  2. preload-helper                 preload-helper-BHSF1fZ9.js（`a`；pdfjs worker 动态 import 用）
 *  3. isMacPlatform (o→`a` 导出)     keyboardShortcuts-BGHopxr9.js：navigator.platform/UA
 *                                    判 Mac（滚轮缩放修饰键 metaKey vs ctrlKey）
 *  4. Button (d→t) + 4 图标          button-laUijeDG.js：`u`=chevron-left(v)、`l`=chevron-right(y)、
 *                                    `c`=zoom-out(x)、`s`→zoom-in(b)；四图标係已成产物（本 chunk 未导入 createLucideIcon）〔A1-R171 勘误二处〕①旧注「`s`=chevron-left(v)」误——`s` 係 zoom-in（束导出 `a`←局部 `b`），且与下句「`s`→zoom-in(b)」自相矛盾（一键双赋即其 tell）；chevron-left 之本 chunk 局部名係 `u`（←束导出 `s`←束局部 `v`），实证 pdf-viewer-m6YcRb_5.js@6 `import { a as s, i as c, o as l, s as u, t as d }`；②旧注「图标为 Sa=createLucideIcon 产物」误——`Sa` 在本 chunk 係 class（pdf-viewer-m6YcRb_5.js@19603 `Sa = class {`、@19872 `new Sa()`），非 createLucideIcon；★根因＝跨 chunk 名复用：`Sa`=createLucideIcon 于 styles chunk 为真（Modals@123 头注在案），移入本 chunk 依赖清单即成误（R159「归账单位 =（源 chunk, 导出名）」同源）。★名皆本 chunk 局部名、括弧内係 button chunk 局部名；束导出行 button-laUijeDG.js@186 与树 canonical modules/button.tsx@348 位位对位互证。
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/pdf/PdfViewer.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  PdfViewer,
} from '../components/pdf/PdfViewer';
export type {
  PdfViewerLabels,
  PdfViewerProps,
} from '../components/pdf/PdfViewer';
