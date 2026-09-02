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
 *   _c  → cachedWasmModulePromise      memo 化的 glue 模块加载 Promise (14341)
 *   vc  → wasmSourceExplicitlySet      是否显式注册过 wasm 源 (14342)
 *   yc  → rawWasmSource                注册时的原始源 (14343)
 *   bc  → resolvedWasmSource           归一化后的源 (14343)
 *   xc  → copyToStandaloneBuffer       复制出独立 ArrayBuffer (14345)
 *   Sc  → normalizeWasmSource          源归一化 (14350)
 *   Cc  → setDukeSheetsWasmSource      注册 wasm 源 (14357)
 *   wc  → isWasmSourceAvailable        源可用判定 (14360)
 *   Tc  → getDukeSheetsWasmSource      取当前源 (14363)
 *   Ec  → loadDukeSheetsWasmModule     懒加载 glue 模块 (14366)
 *   Dc  → createAbortError             AbortError 工厂 (14382)
 *  worker 客户端：
 *   Oc  → XlsxWorkerClient             主线程侧 worker 请求客户端 (14387)
 *   kc  → cloneArrayBuffer             入参缓冲复制（可转移） (14474)
 *  模块级语句：
 *   —   → setDukeSheetsWasmSource(new URL(duke_sheets_wasm_bg-BCCK9PkU.wasm))
 *                                      wasm 资产注册 (199414)
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

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxPreviewWasmBridge.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  setDukeSheetsWasmSource,
  isWasmSourceAvailable,
  getDukeSheetsWasmSource,
  loadDukeSheetsWasmModule,
  XlsxWorkerClient,
} from '../components/xlsx/XlsxPreviewWasmBridge';
export type {
  DukeSheetsWasmSource,
  ResolvedDukeSheetsWasmSource,
  DukeSheetsWasmModule,
  XlsxWorkerRequestType,
  XlsxWorkerBufferPayload,
  XlsxWorkerCellSnapshotPayload,
  XlsxWorkerRowsBatchPayload,
  XlsxWorkerRequest,
  XlsxWorkerResponse,
  XlsxWorkbookLoadResult,
  XlsxChartsParseResult,
  XlsxCellSnapshot,
  XlsxRowsBatchResult,
} from '../components/xlsx/XlsxPreviewWasmBridge';
