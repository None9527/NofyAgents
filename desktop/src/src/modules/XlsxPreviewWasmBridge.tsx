/* eslint-disable */
/**
 * ============================================================================
 * XlsxPreviewWasmBridge.tsx — duke-sheets WASM 宿主 / xlsx-worker 桥
 *                            （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，199,508 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号双轨标注：js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *
 * ----------------------------------------------------------------------------
 * 〇、本模块在融合 chunk 中的位置（边界判定见 XlsxPreview.report.md §1/§2）
 * ----------------------------------------------------------------------------
 * 整个 chunk 五段构成：
 *   [1] js 1-27        跨 chunk import 块（15 条）
 *   [2] js 28-1830     vendored：d3-array(fsum/Adder) + d3-geo(stream) +
 *                      topojson-client(feature/transform)（地图图表用）
 *   [3] js 1831-9131   vendored：regl（createREGL，UMD 经 __commonJS 包装）
 *   [4] js 9110-199414 vendored：react-xlsx（私有表格引擎：OOXML/图表解析、
 *                      画布渲染器、控制器、工具栏/排序/调色板 UI、Spreadsheet/
 *                      Viewer 组件；内嵌 us-atlas + world-atlas TopoJSON 数据）
 *   [5] js 199415-199508 自研：PreviewPane 包装层（见 XlsxPreview.tsx）
 *
 * 本文件重建的是 **duke-sheets wasm 宿主 / worker 桥**：
 *   - 主体位于 react-xlsx 引擎段内（js 14341-14473 / jsx 10638-10756），
 *     是 ZCode 预览管线真正触达 duke-sheets WASM 的唯一通道；
 *   - 外加模块级 wasm 资产注册语句（js 199414 / jsx 49642）。
 * 任务口径（D8 B2）将“wasm 桥”列入自研层全量重建范围；其归属证据
 * （[react-xlsx] 日志前缀、react-xlsx-viewer 类名等）与行号详见报告 §2.3。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  wasm 源管理（原 _c/vc/yc/bc 状态 + xc/Sc/Cc/wc/Tc/Ec/Dc 函数）：
 *   _c  → cachedWasmModulePromise      memo 化的 glue 模块加载 Promise (14341 / 10638)
 *   vc  → wasmSourceExplicitlySet      是否显式注册过 wasm 源 (14342 / 10639)
 *   yc  → rawWasmSource                注册时的原始源 (14343 / 10640)
 *   bc  → resolvedWasmSource           归一化后的源 (14343 / 10640)
 *   xc  → copyToStandaloneBuffer       复制出独立 ArrayBuffer (14345 / 10642)
 *   Sc  → normalizeWasmSource          源归一化 (14350 / 10647)
 *   Cc  → setDukeSheetsWasmSource      注册 wasm 源 (14357 / 10654)
 *   wc  → isWasmSourceAvailable        源可用判定 (14360 / 10657)
 *   Tc  → getDukeSheetsWasmSource      取当前源 (14363 / 10660)
 *   Ec  → loadDukeSheetsWasmModule     懒加载 glue 模块 (14366 / 10663)
 *   Dc  → createAbortError             AbortError 工厂 (14382 / 10668)
 *  worker 客户端：
 *   Oc  → XlsxWorkerClient             主线程侧 worker 请求客户端 (14387 / 10673)
 *   kc  → cloneArrayBuffer             入参缓冲复制（可转移） (14474 / 10770)
 *  模块级语句：
 *   —   → setDukeSheetsWasmSource(new URL(duke_sheets_wasm_bg-BCCK9PkU.wasm))
 *                                      wasm 资产注册 (199414 / 49642)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 跨资产）
 * ----------------------------------------------------------------------------
 *  1. preload-helper-BHSF1fZ9.js（o=__vitePreload，t 导出）
 *     —— Ec 的懒加载走 `o(() => import(...), [], import.meta.url)`。
 *  2. duke_sheets_wasm-WTFY9Nh4.js —— @dukelib/sheets-wasm@0.1.21 的
 *     wasm-bindgen glue（导出 CellValue/Workbook/Worksheet/default/init/
 *     initSync；default 即 wasm-bindgen init，接受 {module_or_path}）。
 *  3. duke_sheets_wasm_bg-BCCK9PkU.wasm —— duke-sheets Rust 工作区编译产物
 *     （4,345,449 B；crates: duke-sheets-core/-xlsx/-xlsb/-xls/-formula/-crypto）。
 *  4. xlsx-worker-DJiDdvsD.js（6,202 行 IIFE worker）—— 宿主 duke-sheets
 *     WASM 做实际解析；消息协议见下方 XlsxWorker* 类型（协议实现位于
 *     worker 的 pa() 分发器，out/…xlsx-worker-DJiDdvsD.js 6150-6202）。
 * ============================================================================
 */

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列资产；此处为重建接口）
 * ==========================================================================*/

/** Vite preload helper（原 o，preload-helper-BHSF1fZ9.js 的 t 导出） */
declare function preloadModule<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
  baseUrl: string,
): Promise<T>;

/** duke-sheets wasm 源：可注入的多种形态（原 Sc 的输入域） */
export type DukeSheetsWasmSource =
  | string
  | URL
  | Request
  | ArrayBuffer
  | ArrayBufferView
  | WebAssembly.Module;

/** 归一化后实际可交给 wasm-bindgen init 的源（原 Sc 的值域） */
export type ResolvedDukeSheetsWasmSource = string | ArrayBuffer | WebAssembly.Module;

/**
 * duke_sheets_wasm-WTFY9Nh4.js glue chunk 的导出面（原 Ec 动态 import 的模块）。
 * 完整绑定见 @dukelib/sheets-wasm@0.1.21（参照安装：
 * zcode-restored/node_modules/@dukelib/sheets-wasm/duke_sheets_wasm.js）。
 */
export interface DukeSheetsWasmModule {
  /** wasm-bindgen init：不传参走默认 fetch，传 {module_or_path} 用注入源 */
  default(input?: { module_or_path: DukeSheetsWasmSource }): Promise<void>;
  Workbook: unknown; // duke-sheets Workbook 绑定类（fromBytes/getSheet/calculate…）
  Worksheet: unknown; // duke-sheets Worksheet 绑定类
  CellValue: unknown; // 单元格值绑定类
  init: unknown;
  initSync: unknown;
}

/* --- worker 消息协议（与 xlsx-worker-DJiDdvsD.js 的 pa() 分发器逐条对齐） --- */

export type XlsxWorkerRequestType = "load" | "parseCharts" | "getCellSnapshot" | "getRowsBatch";

/** load / parseCharts 共用载荷（原 Oc.loadWorkbook / Oc.parseCharts 的 payload） */
export interface XlsxWorkerBufferPayload {
  buffer: ArrayBuffer;
  showHiddenSheets: boolean;
  skipXmlParsing: boolean;
  /** 由主线程注入的 wasm 源；worker 侧 pa() 收到后先调 Si() 注册 */
  wasmSource?: ResolvedDukeSheetsWasmSource;
}

export interface XlsxWorkerCellSnapshotPayload {
  workbookSheetIndex: number;
  row: number;
  col: number;
}

export interface XlsxWorkerRowsBatchPayload {
  workbookSheetIndex: number;
  startRow: number;
  rowCount: number;
}

/** 主线程 → worker 请求封套（原 Oc.request 的 postMessage 结构） */
export interface XlsxWorkerRequest<P = unknown> {
  /** 真实 id 由 Oc.request 分配（nextRequestId 自增）；构造处占位 0 */
  id: number;
  type: XlsxWorkerRequestType;
  payload: P;
}

/** worker → 主线程 响应封套（原 worker fa() 的 postMessage 结构） */
export type XlsxWorkerResponse<R = unknown> =
  | { id: number; success: true; result: R }
  | { id: number; success: false; error: string };

/**
 * load 结果（原 worker ua() 返回，xlsx-worker 6121-6129）：
 * 工作表元模型 + 图表 + 表单控件 + 表格 + 页签。深层结构为 react-xlsx
 * 内部模型（vendored，登记不展开）。
 */
export interface XlsxWorkbookLoadResult {
  sheets: unknown[]; // 每表元模型（含 workbookSheetIndex/sheetOrigins 等）
  tabs: unknown[]; // 页签模型（dy 组件消费的 tabs 即源于此）
  chartsByWorkbookSheetIndex: unknown[];
  chartsheets: unknown[];
  formControlsByWorkbookSheetIndex: unknown[][];
  tablesByWorkbookSheetIndex: unknown[][];
}

/** parseCharts 结果（原 worker da() 返回，xlsx-worker 6141-6145） */
export interface XlsxChartsParseResult {
  chartsByWorkbookSheetIndex: unknown[];
  chartsheets: unknown[];
  tabs: unknown[];
}

/** getCellSnapshot 结果（原 worker 6162-6171；未加载时 { "", "" }） */
export interface XlsxCellSnapshot {
  displayValue: string;
  formula: string;
}

/** getRowsBatch 结果（原 worker 6172-6183；duke Worksheet.getRowsBatch 透传，未加载为 null） */
export type XlsxRowsBatchResult = unknown;

/* ============================================================================
 * 1. wasm 源管理（原 _c/vc/yc/bc + xc/Sc/Cc/wc/Tc/Ec/Dc，
 *    js 14341-14386 / jsx 10638-10672）
 * ----------------------------------------------------------------------------
 * 职责：允许宿主（本 chunk 在模块级、或任意调用方）显式注入
 * duke_sheets_wasm_bg.wasm 的位置；Ec 懒加载 glue 模块时把注入源转交给
 * wasm-bindgen init。未注入时 glue 走自身默认解析。
 * ==========================================================================*/

/** 原 _c：glue 模块加载 Promise 缓存（只加载一次） */
let cachedWasmModulePromise: Promise<DukeSheetsWasmModule> | null = null;
/** 原 vc：是否调用过 setDukeSheetsWasmSource */
let wasmSourceExplicitlySet = false;
/** 原 yc：注入的原始源（保留原样供 init 使用） */
let rawWasmSource: DukeSheetsWasmSource | undefined;
/** 原 bc：归一化后的源（供序列化/转移给 worker） */
let resolvedWasmSource: ResolvedDukeSheetsWasmSource | undefined;

/** 原 xc（js 14345）：把 ArrayBuffer/TypedArray 复制成独立的 ArrayBuffer */
function copyToStandaloneBuffer(input: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (input instanceof ArrayBuffer) return input.slice(0);
  const view = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  return new Uint8Array(view).buffer;
}

/** 原 Sc（js 14350）：把各种形态的 wasm 源归一化成 字符串URL / ArrayBuffer / Module */
function normalizeWasmSource(
  source: DukeSheetsWasmSource,
): ResolvedDukeSheetsWasmSource | undefined {
  if (typeof source === "string") return source;
  if (typeof URL !== "undefined" && source instanceof URL) return source.href;
  if (typeof Request !== "undefined" && source instanceof Request) return source.url;
  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    return copyToStandaloneBuffer(source);
  }
  if (typeof WebAssembly !== "undefined" && source instanceof WebAssembly.Module) return source;
  return undefined;
}

/** 原 Cc（js 14357）：注册 duke-sheets wasm 源（幂等覆盖） */
export function setDukeSheetsWasmSource(source: DukeSheetsWasmSource): void {
  wasmSourceExplicitlySet = true;
  rawWasmSource = source;
  resolvedWasmSource = normalizeWasmSource(source);
}

/**
 * 原 wc（js 14360）：wasm 源可用性判定。
 * 语义：从未显式注册（!vc）→ glue 默认路径可用，视为可用；
 * 注册过 → 只有归一化成功（bc !== undefined）才算可用。
 * react-xlsx 控制器 Ru 用它决定是否启用 worker 解析（Be = useWorker && Worker && wc()）。
 */
export function isWasmSourceAvailable(): boolean {
  return !wasmSourceExplicitlySet || resolvedWasmSource !== undefined;
}

/** 原 Tc（js 14363）：取当前归一化源（随 worker 载荷下发） */
export function getDukeSheetsWasmSource(): ResolvedDukeSheetsWasmSource | undefined {
  return resolvedWasmSource;
}

/**
 * 原 Ec（js 14366）：懒加载 duke_sheets_wasm glue 模块（memo 化）。
 * 走 Vite preload helper（原 o）；注入过源则把 {module_or_path} 交给
 * wasm-bindgen init，否则走 glue 默认 fetch。解析结果为整个模块命名空间。
 */
export function loadDukeSheetsWasmModule(): Promise<DukeSheetsWasmModule> {
  cachedWasmModulePromise ||= preloadModule(
    () =>
      import("./duke_sheets_wasm-WTFY9Nh4.js").then(async (glue) => {
        if (rawWasmSource === undefined) {
          await glue.default();
        } else {
          await glue.default({ module_or_path: rawWasmSource });
        }
        return glue as unknown as DukeSheetsWasmModule;
      }),
    [],
    import.meta.url,
  );
  return cachedWasmModulePromise;
}

/** 原 Dc（js 14382）：构造 AbortError（优先 DOMException，回退 Error） */
function createAbortError(): Error {
  if (typeof DOMException !== "undefined") return new DOMException("Aborted", "AbortError");
  const error = Error("Aborted");
  error.name = "AbortError";
  return error;
}

/* ============================================================================
 * 2. XlsxWorkerClient（原 Oc，js 14387-14473 / jsx 10673-10769）
 * ----------------------------------------------------------------------------
 * 主线程侧的 worker 请求客户端：
 *  - 构造时即 spawn `xlsx-worker-DJiDdvsD.js`（module worker）；
 *  - 请求-响应模型：nextRequestId 自增 + pendingRequests Map；
 *  - loadWorkbook/parseCharts 以 transferable ArrayBuffer 投递（先经 kc 克隆，
 *    避免把调用方的 buffer 转移走）；载荷附带当前 wasm 源（Tc()）；
 *  - dispose() 终止 worker 并以 AbortError 拒绝所有挂起请求。
 * 调用方：react-xlsx 控制器 Ru（js 15672）经 Ge/We 两个 callback 持有/释放。
 * ==========================================================================*/

export class XlsxWorkerClient {
  worker: Worker;
  nextRequestId = 1;
  /** 挂起请求表：响应到达前按 id 存放 resolve/reject（结果类型异构，故 resolve 收 any） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingRequests = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  disposed = false;

  constructor() {
    // Vite 产物中的双层 new URL：内层把 worker chunk 解析成绝对 URL，
    // 外层再包一次以兼容 import.meta.url 基址（原样保留压缩版写法）。
    this.worker = new Worker(
      new URL("" + new URL("xlsx-worker-DJiDdvsD.js", import.meta.url).href, "" + import.meta.url),
      { type: "module" },
    );
    this.worker.addEventListener("message", this.handleMessage);
    this.worker.addEventListener("error", this.handleError);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.removeEventListener("message", this.handleMessage);
    this.worker.removeEventListener("error", this.handleError);
    this.worker.terminate();
    const abortError = createAbortError();
    for (const pending of this.pendingRequests.values()) pending.reject(abortError);
    this.pendingRequests.clear();
  }

  /** 原 loadWorkbook：全量加载（工作表模型+图表+控件+表格+页签） */
  loadWorkbook(
    buffer: ArrayBuffer,
    skipXmlParsing = false,
    showHiddenSheets = false,
  ): Promise<XlsxWorkbookLoadResult> {
    const transferable = cloneArrayBuffer(buffer);
    return this.request<XlsxWorkerBufferPayload, XlsxWorkbookLoadResult>(
      {
        id: 0,
        payload: {
          buffer: transferable,
          showHiddenSheets,
          skipXmlParsing,
          wasmSource: getDukeSheetsWasmSource(),
        },
        type: "load",
      },
      [transferable],
    );
  }

  /** 原 getCellSnapshot：单格快照（展示值+公式），参数序 (表索引, 行, 列) */
  getCellSnapshot(workbookSheetIndex: number, row: number, col: number): Promise<XlsxCellSnapshot> {
    return this.request<XlsxWorkerCellSnapshotPayload, XlsxCellSnapshot>({
      id: 0,
      payload: { col, row, workbookSheetIndex },
      type: "getCellSnapshot",
    });
  }

  /** 原 parseCharts：仅图表通道（比 load 轻，用于图表面板二次解析） */
  parseCharts(
    buffer: ArrayBuffer,
    skipXmlParsing = false,
    showHiddenSheets = false,
  ): Promise<XlsxChartsParseResult> {
    const transferable = cloneArrayBuffer(buffer);
    return this.request<XlsxWorkerBufferPayload, XlsxChartsParseResult>(
      {
        id: 0,
        payload: {
          buffer: transferable,
          showHiddenSheets,
          skipXmlParsing,
          wasmSource: getDukeSheetsWasmSource(),
        },
        type: "parseCharts",
      },
      [transferable],
    );
  }

  /** 原 getRowsBatch：按行批取（公式/超链接/合并/样式/格式化值全开） */
  getRowsBatch(workbookSheetIndex: number, startRow: number, rowCount: number): Promise<XlsxRowsBatchResult> {
    return this.request<XlsxWorkerRowsBatchPayload, XlsxRowsBatchResult>({
      id: 0,
      payload: { rowCount, startRow, workbookSheetIndex },
      type: "getRowsBatch",
    });
  }

  /** 原 request：通用请求投递（分配 id、登记挂起、postMessage+transfers） */
  request<P, R>(message: XlsxWorkerRequest<P>, transfers: Transferable[] = []): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      if (this.disposed) {
        reject(createAbortError());
        return;
      }
      const requestId = this.nextRequestId;
      this.nextRequestId += 1;
      this.pendingRequests.set(requestId, { reject, resolve });
      this.worker.postMessage({ ...message, id: requestId }, transfers);
    });
  }

  /** 原 handleError：worker 级错误 → 拒绝全部挂起请求 */
  handleError = (): void => {
    for (const pending of this.pendingRequests.values()) pending.reject(Error("Worker request failed."));
    this.pendingRequests.clear();
  };

  /** 原 handleMessage：按 id 配对响应，success 分流 resolve/reject */
  handleMessage = (event: MessageEvent<XlsxWorkerResponse>): void => {
    const data = event.data;
    const pending = this.pendingRequests.get(data.id);
    if (pending) {
      this.pendingRequests.delete(data.id);
      if (!data.success) {
        pending.reject(Error(data.error));
        return;
      }
      pending.resolve(data.result);
    }
  };
}

/** 原 kc（js 14474）：入参缓冲克隆（保证调用方 buffer 不被 transfer 置空） */
function cloneArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0);
}

/* ============================================================================
 * 3. 模块级 wasm 资产注册（原语句位于 js 199414 / jsx 49642）
 * ----------------------------------------------------------------------------
 * 压缩版中该语句紧跟 react-xlsx 的 ly 组件定义之后、自研层 uy 之前执行，
 * 即“chunk 一加载就把 duke_sheets_wasm_bg-BCCK9PkU.wasm 的 URL 注入桥”。
 * 归属说明：语句位置在 vendored 与自研的接缝上，证据与讨论见报告 §2.3；
 * 本重建将其作为桥模块的初始化副作用保留。
 * ==========================================================================*/

setDukeSheetsWasmSource("" + new URL("duke_sheets_wasm_bg-BCCK9PkU.wasm", import.meta.url).href);

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: 原名(minified) -> 语义名 -> js 行 / jsx 行
 * ════════════════════════════════════════════════════════════════════════
 * 状态（4 个）：
 *   _c -> cachedWasmModulePromise        14341 / 10638
 *   vc -> wasmSourceExplicitlySet        14342 / 10639
 *   yc -> rawWasmSource                  14343 / 10640
 *   bc -> resolvedWasmSource             14343 / 10640
 * 函数（8 个）：
 *   xc -> copyToStandaloneBuffer         14345 / 10642
 *   Sc -> normalizeWasmSource            14350 / 10647
 *   Cc -> setDukeSheetsWasmSource        14357 / 10654
 *   wc -> isWasmSourceAvailable          14360 / 10657
 *   Tc -> getDukeSheetsWasmSource        14363 / 10660
 *   Ec -> loadDukeSheetsWasmModule       14366 / 10663
 *   Dc -> createAbortError               14382 / 10668
 *   kc -> cloneArrayBuffer               14474 / 10770
 * 类（1 个）：
 *   Oc -> XlsxWorkerClient               14387-14473 / 10673-10755
 *     方法：constructor/dispose/loadWorkbook/getCellSnapshot/parseCharts/
 *           getRowsBatch/request + 类字段 handleError/handleMessage
 * 模块级语句（1 条）：
 *   Cc(new URL(duke_sheets_wasm_bg-BCCK9PkU.wasm).href)   199414 / 49642
 *
 * 上游登记：
 *   @dukelib/sheets-wasm@0.1.21（github.com/guseggert/duke-sheets，
 *   bindings/wasm；参照安装 zcode-restored/node_modules/@dukelib/sheets-wasm）
 *   glue chunk  = out/renderer/assets/duke_sheets_wasm-WTFY9Nh4.js（1,349 行）
 *   wasm 资产   = out/renderer/assets/duke_sheets_wasm_bg-BCCK9PkU.wasm（4,345,449 B）
 *   worker      = out/renderer/assets/xlsx-worker-DJiDdvsD.js（6,202 行）
 * ════════════════════════════════════════════════════════════════════════ */
