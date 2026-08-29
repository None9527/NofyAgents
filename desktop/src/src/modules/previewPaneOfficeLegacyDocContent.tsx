/* eslint-disable */
/**
 * ============================================================================
 * previewPaneOfficeLegacyDocContent.tsx — docx/legacy-doc 预览组件
 * （解混淆重建 · D8 Stage B2 · Office 预览族）
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （47,538 行；JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，36,535 行，行号锚点均指此）
 * chunk 导出：export { NS as PreviewPaneOfficeLegacyDocContent }（jsx 36534）
 *
 * ── vendor 段登记（不逐字转录）─────────────────────────────────────────────
 *   [V0] PNG 编码器                 jsx 15-490
 *        DataViewWriter（D 类）+ CRC32 + PNG 签名/IHDR/PLTE/tRNS/IDAT/IEND
 *        + Adam7 交错；入口 se() = encodePng。zlib 压缩走 [V1] pako。
 *   [V1] CJS 捆绑（原 n() 模块包装）  jsx 491-10300
 *        pako（deflate，供 [V0] 与 docx 解压）        jsx 491-2025
 *        UTIF（TIFF 解码，供图片管线 gi）              jsx 2026-3311
 *        react 19.2.7 CJS（be）                        jsx 3312-6646
 *        react-dom/server 19.2.7 CJS（xe）             jsx 6647-10294
 *        Se = react-dom/server 汇总包装                jsx 10295-10300
 *        上游对照 VENDOR-MANIFEST-LIBS.md（pako/UTIF/react 19.2.7）。
 *   [V2] 动态依赖 chunk / 资产（vite __vite__mapDeps，jsx 1）：
 *        src-2FP7IUE6-ahbsNOoE.js   → parseDocx（docx 包解析；属他批，保留 declare）
 *        src-AEHDFCS5-Cut3IAW0.js   → buildDocModel / ensureDocModelBlockIds
 *        （A0-S2c：AEHDFCS5 两符号已接线 DocxWasmGlue 实体导出，见 §0）
 *        docx-import-worker-oPk-zLr5.js → 导入工作者（协议 {id, type:
 *        `import-docx`, buffer, wasmSource}，jsx 11971-11975）
 *        docx_wasm_bg-HWnIvdMf.wasm → docx-core wasm（Cr() 注入，jsx 36460）
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ── 自研引擎段登记（~26,000 行；[E1]-[E4] 已于 B4 批次全量展开，余段锚点登记）──
 *   [E1] Unicode BiDi 与断词引擎      jsx 10303-11176  【已展开 → LegacyDocEngine1.tsx】
 *        Ee/De = 双向类型表（0-255 直接表 + 区间表），Oe 分类查找，
 *        ke..St = UAX#9 级别算法与断词/空白/标点集，$t = 令牌流入口。
 *   [E2] 文本测量与行布局            jsx 11177-11846  【已展开 → LegacyDocEngine2.tsx】
 *        测量缓存/表情修正/怪癖探测 + 宽度表（ur）+ 断行行走（Hn/Un）；
 *        11847-11993 为 wasm 注册/导入管线，见本文件 §1/§2。
 *   [E3] 字体脚本解析与段落 XML 编辑  jsx 12250-13243  【已展开 → LegacyDocEngine3.tsx】
 *        四脚本字体解析（yi..Mi）+ XML 扫描器（Ni..Ui）+ 修订/批注编辑（Wi..Fa）。
 *   [E4] 文本编辑指令、分页与布局服务  jsx 13244-14903  【已展开 → LegacyDocEngine4.tsx】
 *        段落/表格文本重设（Ia..no）+ 输入指令（ro..go）+ 分页/页数拟合
 *        （_o..Bo）+ 历史归约（Uo）+ 行布局服务（ts..Ls）+ 结构哈希（Rs..Ys/Xs）。
 *        详见 LegacyDocEngine.report.md（含与 B2 登记标签的差异说明）。
 *   [E5] 缩略图                      jsx 14902-15113
 *   [E6] 编辑器核心（状态/命令/分页） jsx 15114-27339
 *        tS（jsx 24338）= 编辑器状态 hook（starterModel → editor 实例）。
 *        （中段 16816-20230 与 24338-27339 见 LegacyDocEngineB* 批次文件）
 *   [E7] ES 页面渲染组件             jsx 27340-36416
 *        分页/虚拟化/修订/批注/右键菜单的只读渲染器（本文件以接口级
 *        占位替代；真实实现见锚点区段与 LegacyDocEngineBPageRenderer.tsx）。
 * ────────────────────────────────────────────────────────────────────────────
 *
 * 本文件全量重建的自研层：
 *   §1 wasm 源注册（原 br/xr/Sr/Cr/wr/Tr，jsx 11850-11879 + 36460）
 *   §2 DOCX 导入管线（原 Er..Nr，jsx 11880-11993；工作者/主线程双路径）
 *   §3 页面几何（原 Pr..Yr，jsx 11994-12118；w:pgSz/w:pgMar/w:docGrid/
 *      w:pgBorders → px 页面参数）
 *   §4 图片路由与转换（原 Xr..vi，jsx 12119-12252；TIFF→PNG、EMF/WMF 标记）
 *   §5 React 组件层（原 DS/AS/jS/MS/NS，jsx 36417-36534）
 *
 * 外部依赖（其他重建文件/declare 桩）：
 *   logger-PFDwl5Yq.js（o）· officeFilePreview-DDCn9-xI.js（u=fit 度量）
 *   react（b = CJS 互操作）· [E6] tS · [E7] ES
 *   A0-S2c 接线：[E6] tS ← LegacyDocEngineBEditorState createDocxEditor；
 *   AEHDFCS5 buildDocModel/ensureDocModelBlockIds ← DocxWasmGlue（§0 桥接）。
 *   保留 declare（属他批/他 chunk，注记见 §0）：logger、Buffer、
 *   computeOfficeFitMetrics、encodePng、utifCodec、parseDocx、initDocxWasmSync。
 * ============================================================================
 */

import * as React from "react";
/** A0-S2c 接线：chunk src-AEHDFCS5 的 buildDocModel/ensureDocModelBlockIds 实体 =
 * DocxWasmGlue 导出（B5-14-Final.report §2.3 裁决）；[E6] tS 编辑器状态 =
 * LegacyDocEngineBEditorState createDocxEditor（其对本文件仅 type 导入，无运行时环）。 */
import {
  buildDocModel as buildDocModelCore, // 原 AEHDFCS5 `buildDocModel` 导出（Glue L，jsx 410-412）
  ensureDocModelBlockIds as ensureDocModelBlockIdsCore, // 原 AEHDFCS5 导出（Glue d，jsx 64-74）
} from "./DocxWasmGlue";
import { createDocxEditor as createDocxEditorCore } from "./LegacyDocEngineBEditorState"; // 原 tS（[E6] jsx 24338）

/* ============================================================================
 * 0. 外部依赖类型声明（真实实现位于上述 chunk/段；此处为重建接口）
 * ==========================================================================*/

/** 日志器（原 o，logger-PFDwl5Yq.js）——A0-S2c 保留 declare（属他批 logger chunk，遗留） */
declare const logger: {
  debug(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

/** Node Buffer（渲染进程中可能由 polyfill 提供；原代码以 typeof Buffer 探测，
 * 未定义时 typeof 判定为 "undefined"，运行期安全）
 *  ——A0-S2c 保留 declare（运行期 typeof 探测，无实体属主，遗留） */
declare const Buffer: {
  from(data: string, encoding: string): Uint8Array;
  from(data: Uint8Array): { toString(encoding: string): string };
};

/** 办公室预览缩放计算（原 u，officeFilePreview-DDCn9-xI.js 的 i/t 导出）
 *  ——A0-S2c 保留 declare（属他批 officeFilePreview chunk，遗留） */
declare function computeOfficeFitMetrics(input: {
  availableWidth: number;
  naturalHeight: number;
  naturalWidth: number;
}): { scale: number; width: number; height: number } | null;

/** PNG 编码（原 se，[V0] 段 jsx 489-491）——A0-S2c 保留 declare（vendor 段不转录，遗留） */
declare function encodePng(
  data: {
    width: number;
    height: number;
    data: Uint8Array;
    channels: number;
    depth: number;
    palette?: number[][];
    text?: Record<string, string>;
  },
  options?: { zlib?: Record<string, unknown>; interlace?: string },
): Uint8Array;

/** UTIF 解码器（原 we.default = ti，[V1] 段 jsx 2026-3311）——A0-S2c 保留 declare（vendor 段不转录，遗留） */
declare const utifCodec: {
  decode(buffer: ArrayBuffer): unknown[];
  decodeImage(buffer: ArrayBuffer, ifd: unknown, ifds: unknown[]): void;
  toRGBA8(ifd: unknown): Uint8Array;
};

/** 动态 chunk src-2FP7IUE6（parseDocx，[V2]）——A0-S2c 注记：该 chunk 属他批，
 * 保留 declare 不接线（遗留；Glue 侧同源 loadParseDocxModule 同样保留） */
declare function parseDocx(buffer: ArrayBuffer): Promise<DocxPackage>;

/** 动态 chunk src-AEHDFCS5（buildDocModel/ensureDocModelBlockIds，[V2]）——
 * A0-S2c 已接线 DocxWasmGlue 实体导出；本文件 DocxPackage/DocxModel 为按用法
 * 还原的最小公共契约（见下），与 Glue DocxCore* 型族以类型桥接，不改发射语义。 */
const buildDocModel = buildDocModelCore as unknown as (pkg: DocxPackage) => Promise<DocxModel>;
const ensureDocModelBlockIds = ensureDocModelBlockIdsCore as unknown as (model: DocxModel) => DocxModel;

/** wasm 同步初始化（原 d，chunk-WKBPLHUA-Dg0DBfSj.js 导出；Cr 内调用）
 *  ——A0-S2c 保留 declare（属他批 chunk，遗留） */
declare function initDocxWasmSync(source: string | ArrayBuffer | WebAssembly.Module): void;

/* --- docx 模型最小接口（真实类型在 [V2] src-AEHDFCS5；按 ES 用法还原） --- */

/** docx 包（parseDocx 结果） */
export interface DocxPackage {
  readonly [key: string]: unknown;
}

/** 文档主题 */
export type DocxDocumentTheme = `light` | `dark`;

/** 编辑器模型（buildDocModel 结果；按 ES/tS 用法还原的最小契约） */
export interface DocxModel {
  nodes: { type: string; blockId?: string; [key: string]: unknown }[];
  metadata: {
    numberingDefinitions?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** 编辑器实例（原 tS 返回，[E6] jsx 24338；按 ES 用法还原的最小契约） */
export interface DocxEditor {
  model: DocxModel;
  documentTheme: DocxDocumentTheme;
  showTrackedChanges: boolean;
  trackedChanges: unknown[];
  showComments: boolean;
  comments: unknown[];
  [key: string]: unknown;
}

/**
 * 编辑器状态 hook（原 tS，[E6] jsx 24338-27339 区段）。
 * A0-S2c 已接线：实体 = LegacyDocEngineBEditorState createDocxEditor（完整状态机）；
 * 本文件保留公共契约面（starterModel + 文件名 + 主题 → DocxEditor），类型桥接。
 */
const createDocxEditor = createDocxEditorCore as unknown as (options: {
  starterModel: DocxModel;
  initialFileName?: string;
  initialDocumentTheme?: DocxDocumentTheme;
}) => DocxEditor;

/** ES 页面渲染器 props（原 ES，[E7] jsx 27340-27362） */
export interface DocxEditorViewProps {
  editor: DocxEditor;
  className?: string;
  style?: React.CSSProperties;
  pageBackgroundColor?: string;
  pageGapBackgroundColor?: string;
  deferInitialPaginationPaint?: boolean;
  loadingState?: unknown;
  pageVirtualization?: { zoomScale: number };
  visiblePageRange?: unknown;
  onPageCountChange?: (count: number) => void;
  onRequestPageReveal?: (page: number) => void;
  headingStyles?: unknown;
  showTrackedChanges?: boolean;
  renderTrackedChangeCard?: unknown;
  showComments?: boolean;
  renderCommentCard?: unknown;
  renderTableContextMenu?: unknown;
  renderContextMenu?: unknown;
  onFormFieldDoubleClick?: unknown;
  mode?: `edit` | `read-only`;
}

/**
 * 页面渲染器占位（原 ES，[E7] jsx 27340-36416）。
 * 真实实现 = 分页 + 虚拟化 + 修订/批注只读渲染；此处保留 props 契约，
 * 渲染空容器（接口级登记，见文件头 [E7]）。
 */
function DocxEditorView(props: DocxEditorViewProps): React.ReactElement {
  const { editor, className, style, pageGapBackgroundColor, pageVirtualization, mode } = props;
  void editor;
  void pageGapBackgroundColor;
  void pageVirtualization;
  void mode;
  return <div className={className} style={style} data-docx-editor-view-placeholder={true} />;
}

/* ============================================================================
 * §1 wasm 源注册（原 br/xr/Sr/Cr/wr/Tr，jsx 11850-11879；调用点 36460）
 * ==========================================================================*/

/** 原 br：buffer → 独立 ArrayBuffer 副本 */
function cloneToArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) return buffer.slice(0);
  const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  return new Uint8Array(view).buffer;
}

/** 原 xr：wasm 源归一（字符串/URL/buffer/Module/Request） */
function normalizeWasmSource(source: unknown): string | ArrayBuffer | WebAssembly.Module | undefined {
  if (typeof source === `string`) return source;
  if (typeof URL < `u` && source instanceof URL) return source.href;
  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) return cloneToArrayBuffer(source);
  if (typeof WebAssembly < `u` && source instanceof WebAssembly.Module) return source;
  if (typeof Request < `u` && source instanceof Request) return source.url;
  return undefined;
}

let wasmSourceRegistered = false; // 原 vr
let registeredWasmSource: string | ArrayBuffer | WebAssembly.Module | undefined; // 原 yr

/** 原 Sr：仅登记（供外部已自行初始化时用） */
function registerWasmSourceOnly(source: unknown): void {
  wasmSourceRegistered = true;
  registeredWasmSource = normalizeWasmSource(source);
}

/** 原 Cr：初始化 + 登记（模块顶层调用：docx_wasm_bg-HWnIvdMf.wasm URL） */
export function initAndRegisterDocxWasm(source: unknown): void {
  initDocxWasmSync(source as string | ArrayBuffer | WebAssembly.Module);
  registerWasmSourceOnly(source);
}

/** 原 wr：工作者可用判定（已登记且源存在） */
function isWasmSourceAvailable(): boolean {
  return !wasmSourceRegistered || registeredWasmSource !== undefined;
}

/** 原 Tr：取已登记 wasm 源（传给工作者） */
function getRegisteredWasmSource(): string | ArrayBuffer | WebAssembly.Module | undefined {
  return registeredWasmSource;
}

/* 模块级注册（原 jsx 36460）：真实构建中由打包器解析 wasm 资产 URL */
initAndRegisterDocxWasm(new URL(`docx_wasm_bg-HWnIvdMf.wasm`, import.meta.url).href);

/* ============================================================================
 * §2 DOCX 导入管线（原 Er..Nr，jsx 11880-11993）
 * ==========================================================================*/

let nextImportId = 1; // 原 Er

/** 原 Dr：AbortError 构造（DOMException 优先） */
function createDocxAbortError(): Error {
  if (typeof DOMException < `u`) return new DOMException(`DOCX import was aborted`, `AbortError`);
  const error = Error(`DOCX import was aborted`);
  error.name = `AbortError`;
  return error;
}

/** 原 Or：工作者错误载荷 → Error（保留 name/stack） */
function workerPayloadToError(payload: { error: { message: string; name?: string; stack?: string } }): Error {
  const error = Error(payload.error.message);
  error.name = payload.error.name ?? `Error`;
  payload.error.stack && (error.stack = payload.error.stack);
  return error;
}

/** 原 kr：工作者路径判定（useWorker !== false 且 Worker 可用且 wasm 源就绪） */
function shouldUseImportWorker(options: { useWorker?: boolean }): boolean {
  return options.useWorker !== false && typeof Worker < `u` && isWasmSourceAvailable();
}

/** 原 Ar：导入工作者实例（模块型，名称 react-docx-import） */
function createDocxImportWorker(): Worker {
  return new Worker(
    new URL(`` + new URL(`docx-import-worker-oPk-zLr5.js`, import.meta.url).href, `` + import.meta.url),
    { type: `module`, name: `react-docx-import` },
  );
}

/** 原 Mr：高精度时间戳 */
function nowMs(): number {
  return typeof performance < `u` && typeof performance.now === `function` ? performance.now() : Date.now();
}

/** 导入结果（原 jr/Nr 返回类型） */
export interface DocxImportResult {
  package: DocxPackage;
  model: DocxModel;
  source: `main-thread` | `worker`;
  timings: { totalMs: number; parseMs: number; buildModelMs: number };
}

/**
 * 原 jr：主线程导入——动态加载 parseDocx 与 buildDocModel，
 * 各阶段检查中止；返回包 + 模型 + 计时。
 */
async function importDocxOnMainThread(buffer: ArrayBuffer, signal?: AbortSignal): Promise<DocxImportResult> {
  if (signal?.aborted) throw createDocxAbortError();
  const startedAt = nowMs();
  const parsed = await parseDocx(buffer);
  const parsedAt = nowMs();
  if (signal?.aborted) throw createDocxAbortError();
  const model = ensureDocModelBlockIds(await buildDocModel(parsed));
  const finishedAt = nowMs();
  if (signal?.aborted) throw createDocxAbortError();
  return {
    package: parsed,
    model,
    source: `main-thread`,
    timings: { totalMs: finishedAt - startedAt, parseMs: parsedAt - startedAt, buildModelMs: finishedAt - parsedAt },
  };
}

/** 工作者消息（原 Nr 内 f 处理的载荷） */
interface DocxImportWorkerMessage {
  id: number;
  type?: `error` | `result`;
  error?: { message: string; name?: string; stack?: string };
  package?: DocxPackage;
  model?: DocxModel;
  timings?: { totalMs: number; parseMs: number; buildModelMs: number };
}

/**
 * 原 Nr：导入入口——工作者优先（一次性 Promise 包装：
 * message/error/messageerror/abort 四路监听，完成后 terminate），
 * 失败回退主线程；结果模型统一补 blockId。
 */
export async function importDocx(
  buffer: ArrayBuffer,
  options: { signal?: AbortSignal; useWorker?: boolean; transferBuffer?: boolean } = {},
): Promise<DocxImportResult> {
  if (options.signal?.aborted) throw createDocxAbortError();
  if (!shouldUseImportWorker(options)) return importDocxOnMainThread(buffer, options.signal);
  let worker: Worker;
  try {
    worker = createDocxImportWorker();
  } catch {
    return importDocxOnMainThread(buffer, options.signal);
  }
  const requestId = nextImportId;
  nextImportId += 1;
  const result = await new Promise<DocxImportResult>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      worker.removeEventListener(`message`, onMessage);
      worker.removeEventListener(`error`, onError);
      worker.removeEventListener(`messageerror`, onMessageError);
      options.signal?.removeEventListener(`abort`, onAbort);
      worker.terminate();
    };
    const settle = (fn: () => void) => {
      settled || ((settled = true), cleanup(), fn());
    };
    const onAbort = () => {
      settle(() => reject(createDocxAbortError()));
    };
    const onError = (event: ErrorEvent) => {
      const message = event.message || `DOCX import worker failed`;
      settle(() => reject(Error(message)));
    };
    const onMessageError = () => {
      settle(() => reject(Error(`DOCX import worker returned an unreadable response`)));
    };
    const onMessage = (event: MessageEvent) => {
      const data = event.data as DocxImportWorkerMessage | null;
      if (!data || data.id !== requestId) return;
      if (data.type === `error`) {
        settle(() => reject(workerPayloadToError(data as { error: { message: string; name?: string; stack?: string } })));
        return;
      }
      settle(() =>
        resolve({
          package: data.package!,
          model: data.model!,
          source: `worker`,
          timings: data.timings!,
        }),
      );
    };
    worker.addEventListener(`message`, onMessage);
    worker.addEventListener(`error`, onError);
    worker.addEventListener(`messageerror`, onMessageError);
    options.signal?.addEventListener(`abort`, onAbort, { once: true });
    try {
      const message = { id: requestId, type: `import-docx`, buffer, wasmSource: getRegisteredWasmSource() };
      const transfer = options.transferBuffer ? [buffer] : [];
      worker.postMessage(message, transfer);
    } catch (error) {
      settle(() => reject(error instanceof Error ? error : Error(`Failed to start DOCX import worker`)));
    }
  });
  return ensureDocModelBlockIdsApplied(result);
}

/** 工作者结果的 blockId 补齐（原 Nr 尾段：动态加载 ensureDocModelBlockIds） */
async function ensureDocModelBlockIdsApplied(result: DocxImportResult): Promise<DocxImportResult> {
  return { ...result, model: ensureDocModelBlockIds(result.model) };
}

/* ============================================================================
 * §3 页面几何（原 Pr..Yr，jsx 11994-12118）
 * ==========================================================================*/

const DEFAULT_PAGE_WIDTH_PX = 900; // 原 Pr
const DEFAULT_PAGE_HEIGHT_PX = 1200; // 原 Fr
const DEFAULT_MARGIN_PX = 56; // 原 Ir
const TWIPS_PER_PX = 15; // 原 Lr（1px = 15 twips @96dpi）

/** 页面参数（原 Rr 缺省 + Yr 返回类型） */
export interface DocxPageGeometry {
  pageWidthPx: number;
  pageHeightPx: number;
  marginsPx: { top: number; right: number; bottom: number; left: number };
  headerDistancePx: number;
  footerDistancePx: number;
  docGridLinePitchPx: number | undefined;
}

const DEFAULT_PAGE_GEOMETRY: DocxPageGeometry = {
  pageWidthPx: DEFAULT_PAGE_WIDTH_PX,
  pageHeightPx: DEFAULT_PAGE_HEIGHT_PX,
  marginsPx: { top: DEFAULT_MARGIN_PX, right: DEFAULT_MARGIN_PX, bottom: DEFAULT_MARGIN_PX, left: DEFAULT_MARGIN_PX },
  headerDistancePx: DEFAULT_MARGIN_PX,
  footerDistancePx: DEFAULT_MARGIN_PX,
  docGridLinePitchPx: undefined,
}; // 原 Rr

/** 原 zr：页边距 → CSS padding */
export function pageMarginsToPadding(margins: { top: number; right: number; bottom: number; left: number }): {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
} {
  return { paddingTop: margins.top, paddingRight: margins.right, paddingBottom: margins.bottom, paddingLeft: margins.left };
}

/** 原 Br：twips → px（非有限 → undefined） */
function twipsToPx(twips: number | undefined): number | undefined {
  if (Number.isFinite(twips)) return Math.max(0, Math.round((twips as number) / TWIPS_PER_PX));
  return undefined;
}

/** 原 Vr：XML 片段数值属性提取（正则） */
function xmlNumAttr(xml: string | undefined, name: string): number | undefined {
  if (!xml) return;
  const match = xml.match(RegExp(`${name}="(\\d+)"`, `i`));
  if (!match?.[1]) return;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

/** 原 Hr：XML 片段字符串属性提取（正则） */
function xmlStrAttr(xml: string | undefined, name: string): string | undefined {
  if (xml) return xml.match(RegExp(`${name}="([^"]+)"`, `i`))?.[1];
  return undefined;
}

/** 原 Ur：按 orientation 校正宽高（landscape 宽>高，portrait 高>宽） */
function orientPageSize(size: { widthPx: number; heightPx: number; orientation?: string }): { widthPx: number; heightPx: number } {
  const orientation = size.orientation?.trim().toLowerCase();
  const width = Math.max(1, size.widthPx);
  const height = Math.max(1, size.heightPx);
  if ((orientation === `landscape` && width < height) || (orientation === `portrait` && width > height)) {
    return { widthPx: height, heightPx: width };
  }
  return { widthPx: width, heightPx: height };
}

/** 原 Wr：十六进制颜色归一（#RRGGBB；auto/空 → undefined） */
function normalizeHexColor(value: string | undefined): string | undefined {
  if (!value) return;
  const text = value.trim();
  if (!text || text.toLowerCase() === `auto`) return;
  if (/^[0-9a-fA-F]{6}$/.test(text)) return `#${text}`;
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text;
  return undefined;
}

/** 原 Gr：边框线型归一（double/dashed/dotted/solid；none/nil → undefined） */
function normalizeBorderKind(value: string | undefined): `double` | `dashed` | `dotted` | `solid` | undefined {
  const kind = value?.trim().toLowerCase();
  if (!kind || kind === `none` || kind === `nil`) return;
  if (kind === `double`) return `double`;
  if (kind === `dashed` || kind === `dashsmallgap` || kind === `dotdash` || kind === `dotdotdash`) return `dashed`;
  if (kind === `dotted`) return `dotted`;
  return `solid`;
}

/** 原 Kr：点 → px */
function pointsToPx(points: number | undefined): number | undefined {
  if (Number.isFinite(points)) return Math.max(0, Math.round((96 / 72) * (points as number)));
  return undefined;
}

/** 页面边框（原 qr 返回类型） */
export interface DocxPageBorder {
  cssBorder: string;
  offsetPx: number;
  shadow: boolean;
}

/** 原 qr：单边页面边框（w:pgBorders 内 top/right/bottom/left） */
function parsePageBorder(sectPr: string, side: string): DocxPageBorder | undefined {
  const bordersXml = sectPr.match(/<w:pgBorders\b[\s\S]*?<\/w:pgBorders>/i)?.[0];
  if (!bordersXml) return;
  const sideXml = bordersXml.match(RegExp(`<w:${side}\\b[^>]*/?>`, `i`))?.[0];
  if (!sideXml) return;
  const kind = normalizeBorderKind(xmlStrAttr(sideXml, `w:val`));
  if (!kind) return;
  const sz = Number(xmlStrAttr(sideXml, `w:sz`));
  const widthPx = Number.isFinite(sz) && sz > 0 ? Math.max(0.5, Number((sz / 6).toFixed(2))) : 1;
  const color = normalizeHexColor(xmlStrAttr(sideXml, `w:color`)) ?? `#000000`;
  const space = Number(xmlStrAttr(sideXml, `w:space`));
  return {
    cssBorder: `${widthPx}px ${kind} ${color}`,
    offsetPx: pointsToPx(space) ?? 0,
    shadow: xmlStrAttr(sideXml, `w:shadow`)?.trim().toLowerCase() === `1` || xmlStrAttr(sideXml, `w:shadow`)?.trim().toLowerCase() === `true`,
  };
}

/** 原 Jr：四边页面边框（无任何边 → undefined） */
export function parsePageBorders(sectPr: string | undefined): {
  top?: DocxPageBorder;
  right?: DocxPageBorder;
  bottom?: DocxPageBorder;
  left?: DocxPageBorder;
} | undefined {
  if (!sectPr || !/<w:pgBorders\b/i.test(sectPr)) return;
  const borders = {
    top: parsePageBorder(sectPr, `top`),
    right: parsePageBorder(sectPr, `right`),
    bottom: parsePageBorder(sectPr, `bottom`),
    left: parsePageBorder(sectPr, `left`),
  };
  return borders.top || borders.right || borders.bottom || borders.left ? borders : undefined;
}

/**
 * 原 Yr：sectPr XML → 页面几何——
 * w:pgSz（w/h/orient）+ w:pgMar（四边距/页眉页脚距）+ w:docGrid（行距网格）。
 */
export function parsePageGeometry(sectPr: string | undefined): DocxPageGeometry {
  if (!sectPr) return DEFAULT_PAGE_GEOMETRY;
  const pgSz = sectPr.match(/<w:pgSz\b[^>]*>/i)?.[0];
  const pgMar = sectPr.match(/<w:pgMar\b[^>]*>/i)?.[0];
  const docGrid = sectPr.match(/<w:docGrid\b[^>]*\/?>/i)?.[0];
  const size = orientPageSize({
    widthPx: twipsToPx(xmlNumAttr(pgSz, `w:w`)) ?? DEFAULT_PAGE_GEOMETRY.pageWidthPx,
    heightPx: twipsToPx(xmlNumAttr(pgSz, `w:h`)) ?? DEFAULT_PAGE_GEOMETRY.pageHeightPx,
    orientation: xmlStrAttr(pgSz, `w:orient`),
  });
  const top = twipsToPx(xmlNumAttr(pgMar, `w:top`)) ?? DEFAULT_PAGE_GEOMETRY.marginsPx.top;
  const right = twipsToPx(xmlNumAttr(pgMar, `w:right`)) ?? DEFAULT_PAGE_GEOMETRY.marginsPx.right;
  const bottom = twipsToPx(xmlNumAttr(pgMar, `w:bottom`)) ?? DEFAULT_PAGE_GEOMETRY.marginsPx.bottom;
  const left = twipsToPx(xmlNumAttr(pgMar, `w:left`)) ?? DEFAULT_PAGE_GEOMETRY.marginsPx.left;
  const header = twipsToPx(xmlNumAttr(pgMar, `w:header`)) ?? DEFAULT_PAGE_GEOMETRY.headerDistancePx;
  const footer = twipsToPx(xmlNumAttr(pgMar, `w:footer`)) ?? DEFAULT_PAGE_GEOMETRY.footerDistancePx;
  const gridType = xmlStrAttr(docGrid, `w:type`)?.toLowerCase();
  const linePitch =
    gridType === `lines` || gridType === `linesandchars` || gridType === `snaptochars`
      ? twipsToPx(xmlNumAttr(docGrid, `w:linePitch`)) ?? DEFAULT_PAGE_GEOMETRY.docGridLinePitchPx
      : DEFAULT_PAGE_GEOMETRY.docGridLinePitchPx;
  return {
    pageWidthPx: size.widthPx,
    pageHeightPx: size.heightPx,
    marginsPx: { top, right, bottom, left },
    headerDistancePx: header,
    footerDistancePx: footer,
    docGridLinePitchPx: linePitch,
  };
}

/* ============================================================================
 * §4 图片路由与转换（原 Xr..vi，jsx 12119-12252）
 * ==========================================================================*/

const TIFF_CONTENT_TYPES = new Set([`image/tiff`, `image/tif`]); // 原 Xr
const METAFILE_CONTENT_TYPES = new Set([`image/x-emf`, `image/emf`, `image/x-wmf`, `image/wmf`]); // 原 Zr
const TIFF_DATA_PREFIXES = [`data:image/tiff`, `data:image/tif`]; // 原 Qr
const EMF_DATA_PREFIXES = [`data:image/emf`, `data:image/x-emf`]; // 原 $r
const WMF_DATA_PREFIXES = [`data:image/wmf`, `data:image/x-wmf`]; // 原 ei
const tiffCache = new Map<string, string | undefined>(); // 原 ni

/** docx 图片引用（模型内形态） */
export interface DocxImageRef {
  contentType?: string;
  src?: string;
  data?: Uint8Array;
}

/** 原 ri：内容类型归一 */
function imageContentType(image: DocxImageRef): string | undefined {
  return image.contentType?.trim().toLowerCase();
}

/** 原 ii：src 归一 */
function imageSrc(image: DocxImageRef): string | undefined {
  return image.src?.trim();
}

/** 原 ai：TIFF 判定（内容类型或 data: 前缀） */
export function isTiffImage(image: DocxImageRef): boolean {
  const contentType = imageContentType(image);
  if (contentType && TIFF_CONTENT_TYPES.has(contentType)) return true;
  const src = imageSrc(image)?.toLowerCase();
  return !!(src && TIFF_DATA_PREFIXES.some((prefix) => src.startsWith(prefix)));
}

/** 原 oi：元文件（EMF/WMF）判定 */
export function isMetafileImage(image: DocxImageRef): boolean {
  const contentType = imageContentType(image);
  if (contentType && METAFILE_CONTENT_TYPES.has(contentType)) return true;
  const src = imageSrc(image)?.toLowerCase();
  return !!(src && (EMF_DATA_PREFIXES.some((prefix) => src.startsWith(prefix)) || WMF_DATA_PREFIXES.some((prefix) => src.startsWith(prefix))));
}

/** 原 si：EMF 判定 */
export function isEmfImage(image: DocxImageRef): boolean {
  const contentType = imageContentType(image);
  if (contentType === `image/x-emf` || contentType === `image/emf`) return true;
  const src = imageSrc(image)?.toLowerCase();
  return !!(src && EMF_DATA_PREFIXES.some((prefix) => src.startsWith(prefix)));
}

/** 原 ci：WMF 判定 */
export function isWmfImage(image: DocxImageRef): boolean {
  const contentType = imageContentType(image);
  if (contentType === `image/x-wmf` || contentType === `image/wmf`) return true;
  const src = imageSrc(image)?.toLowerCase();
  return !!(src && WMF_DATA_PREFIXES.some((prefix) => src.startsWith(prefix)));
}

/** 原 li：需要转换判定（= 元文件判定） */
export function needsImageConversion(image: DocxImageRef): boolean {
  return isMetafileImage(image);
}

/** 原 ui：占位标签（小尺寸退化为单字母） */
export function imagePlaceholderLabel(image: DocxImageRef, width?: number, height?: number): string {
  const tiny = (width ?? 0) <= 56 && (height ?? 0) <= 56;
  if (isEmfImage(image)) return tiny ? `e` : `EMF`;
  if (isWmfImage(image)) return tiny ? `w` : `WMF`;
  return tiny ? `e` : `TIFF`;
}

/** 原 di：base64 data URL → 字节 */
function dataUrlToBytes(dataUrl: string): Uint8Array | undefined {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) return;
  const [, , base64] = match;
  if (typeof Buffer < `u`) return new Uint8Array(Buffer.from(base64, `base64`));
  if (typeof atob !== `function`) return;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** 原 fi：字节 → base64（32KB 分段，避免参数溢出） */
function bytesToBase64(bytes: Uint8Array): string | undefined {
  if (typeof Buffer < `u`) return Buffer.from(bytes).toString(`base64`);
  if (typeof btoa !== `function`) return;
  let binary = ``;
  const chunkSize = 32768;
  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/** 原 pi：视图 → 独立 ArrayBuffer */
function toStandaloneBuffer(bytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = bytes;
  return byteOffset === 0 && byteLength === buffer.byteLength ? (buffer as ArrayBuffer) : (buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer);
}

/** 原 mi：图片字节（data 优先，回退 src data URL） */
function imageBytes(image: DocxImageRef): Uint8Array | undefined {
  if (image.data?.byteLength) return image.data;
  const src = imageSrc(image);
  return src ? dataUrlToBytes(src) : undefined;
}

/** 原 hi：TIFF IFD 选择（最大面积，含 subIFD） */
function pickTiffFrame(ifds: unknown[]): unknown | undefined {
  if (ifds.length === 0) return;
  let candidates = ifds;
  const first = ifds[0] as { subIFD?: unknown[]; width?: number; t256?: number; height?: number; t257?: number };
  Array.isArray(first?.subIFD) && first.subIFD!.length > 0 && (candidates = candidates.concat(first.subIFD));
  let best: unknown;
  let bestArea = -1;
  for (const frame of candidates as { width?: number; t256?: number; height?: number; t257?: number }[]) {
    const width = frame.width ?? frame.t256 ?? 0;
    const height = frame.height ?? frame.t257 ?? 0;
    if (!width || !height) continue;
    const area = width * height;
    (best === undefined || area > bestArea) && ((best = frame), (bestArea = area));
  }
  return best ?? ifds[0];
}

/** 原 gi：TIFF → PNG data URL（UTIF 解码最大帧 → RGBA8 → [V0] encodePng） */
function tiffToPngDataUrl(bytes: Uint8Array): string | undefined {
  const buffer = toStandaloneBuffer(bytes);
  const ifds = utifCodec.decode(buffer);
  const frame = pickTiffFrame(ifds) as { width?: number; t256?: number; height?: number; t257?: number } | undefined;
  if (!frame) return;
  utifCodec.decodeImage(buffer, frame, ifds);
  const width = frame.width ?? frame.t256 ?? 0;
  const height = frame.height ?? frame.t257 ?? 0;
  const rgba = utifCodec.toRGBA8(frame);
  if (!width || !height || rgba.byteLength !== width * height * 4) return;
  const base64 = bytesToBase64(encodePng({ width, height, data: rgba, channels: 4, depth: 8 }));
  return base64 ? `data:image/png;base64,${base64}` : undefined;
}

/**
 * 原 _i：图片 src 解析——TIFF 转 PNG（缓存），元文件 → undefined
 * （由占位渲染），其余原样返回。
 */
export function resolveImageSrc(image: DocxImageRef): string | undefined {
  const src = imageSrc(image);
  if (!src || isMetafileImage(image)) return;
  if (!isTiffImage(image)) return src;
  const cached = tiffCache.get(src);
  if (cached !== undefined || tiffCache.has(src)) return cached;
  let converted: string | undefined;
  try {
    const bytes = imageBytes(image);
    bytes && (converted = tiffToPngDataUrl(bytes));
  } catch {
    converted = undefined;
  }
  tiffCache.set(src, converted);
  return converted;
}

/** 原 vi：空释放回调（图片对象 URL 无缓存时） */
export function noopImageDispose(): () => void {
  return () => {};
}

/* ============================================================================
 * §5 React 组件层（原 DS/AS/jS/MS/NS，jsx 36417-36534）
 * ==========================================================================*/

/** useDocxModel 状态（原 DS 的 useState 形态） */
interface DocxModelState {
  isLoading: boolean;
  model?: DocxModel;
  error?: Error;
}

/**
 * 原 DS：buffer → 模型 hook。AbortController 守护；卸载/换 buffer
 * 时中止；失败归一为 Error。
 */
export function useDocxModel(buffer: ArrayBuffer | null | undefined): DocxModelState {
  const [state, setState] = React.useState<DocxModelState>({ isLoading: !!buffer });
  React.useEffect(() => {
    if (!buffer) {
      setState({ isLoading: false });
      return;
    }
    const pendingBuffer = buffer;
    let alive = true;
    const controller = new AbortController();
    async function run(): Promise<void> {
      setState({ isLoading: true });
      try {
        const { model } = await importDocx(pendingBuffer, { signal: controller.signal, transferBuffer: false });
        if (!alive) return;
        setState({ isLoading: false, model });
      } catch (error) {
        if (!alive) return;
        setState({ isLoading: false, error: error instanceof Error ? error : Error(`Unknown DOCX parse error`) });
      }
    }
    run();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [buffer]);
  return state;
}

let modelKeyCounter = 0; // 原 OS
const modelKeyCache = new WeakMap<object, number>(); // 原 kS

/** 原 AS：模型稳定键（WeakMap 缓存的自增 id，供 key= 强制重建） */
export function docxModelKey(model: DocxModel): number {
  const cached = modelKeyCache.get(model);
  if (cached === undefined) {
    modelKeyCounter += 1;
    modelKeyCache.set(model, modelKeyCounter);
    return modelKeyCounter;
  }
  return cached;
}

/** 原 jS：fit 度量近似相等判定（避免无谓 setState） */
function fitMetricsEqual(
  previous: { scale: number; width: number; height: number } | null,
  next: { scale: number; width: number; height: number },
): boolean {
  return (
    previous !== null &&
    Math.abs(previous.scale - next.scale) < 0.001 &&
    Math.abs(previous.width - next.width) < 0.5 &&
    Math.abs(previous.height - next.height) < 0.5
  );
}

/**
 * 原 MS：只读文档视图——编辑器状态（[E6] tS）+ 宽度自适应缩放
 * （fit 度量 + ResizeObserver）+ [E7] ES 渲染。
 * DOM 结构：
 *   div[data-docx-fit-viewport] > div[data-docx-fit-frame]
 *                               > div[data-docx-fit-content]（scale 变换）> ES
 */
export function DocxFitViewport({ model, sourcePath }: { model: DocxModel; sourcePath: string }): React.ReactElement {
  const editor = createDocxEditor({ starterModel: model, initialFileName: sourcePath, initialDocumentTheme: `light` });
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = React.useState<{ scale: number; width: number; height: number } | null>(null);
  const pageVirtualization = React.useMemo(() => ({ zoomScale: metrics?.scale ?? 1 }), [metrics?.scale]);
  const sync = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const next = computeOfficeFitMetrics({
      availableWidth: viewport.clientWidth,
      naturalHeight: content.offsetHeight,
      naturalWidth: content.offsetWidth,
    });
    next &&
      setMetrics((previous) =>
        fitMetricsEqual(previous, next)
          ? previous
          : (logger.debug(`[PreviewPane] DOCX 预览宽度已同步`, {
              path: sourcePath,
              availableWidth: viewport.clientWidth,
              naturalWidth: content.offsetWidth,
              scale: next.scale,
            }),
            next),
      );
  }, [sourcePath]);
  React.useLayoutEffect(() => {
    sync();
    if (typeof ResizeObserver > `u`) return;
    const observer = new ResizeObserver(sync);
    viewportRef.current && observer.observe(viewportRef.current);
    contentRef.current && observer.observe(contentRef.current);
    return () => {
      observer.disconnect();
    };
  }, [sync]);
  return (
    <div ref={viewportRef} className="w-full min-w-0" data-docx-fit-viewport={true}>
      <div
        className="relative mx-auto"
        data-docx-fit-frame={true}
        style={metrics ? { width: metrics.width, height: metrics.height } : undefined}
      >
        <div
          ref={contentRef}
          className="theme-zai-light min-w-max text-foreground"
          data-docx-fit-content={true}
          style={
            metrics
              ? { position: `absolute`, left: 0, top: 0, transform: `scale(${metrics.scale})`, transformOrigin: `top left` }
              : undefined
          }
        >
          <DocxEditorView
            className="min-w-max"
            editor={editor}
            mode="read-only"
            pageGapBackgroundColor="transparent"
            pageVirtualization={pageVirtualization}
          />
        </div>
      </div>
    </div>
  );
}

/** 预览组件 props（原 NS 参数） */
export interface PreviewPaneOfficeLegacyDocContentProps {
  buffer: ArrayBuffer | null;
  errorMessage: string;
  sourcePath: string;
}

/**
 * 原 NS（chunk 导出 PreviewPaneOfficeLegacyDocContent，jsx 36505-36533）：
 * 加载中 → pending 占位；失败/无模型 → 错误提示；成功 → 滚动漫游
 * 容器内 DocxFitViewport（key 按模型稳定键强制重建）。
 */
export function PreviewPaneOfficeLegacyDocContent({ buffer, errorMessage, sourcePath }: PreviewPaneOfficeLegacyDocContentProps): React.ReactElement {
  const { model, isLoading, error } = useDocxModel(buffer);
  React.useEffect(() => {
    error && logger.error(`[PreviewPane] DOCX 文件解析失败`, { path: sourcePath, error: error.message });
  }, [error, sourcePath]);
  if (isLoading) return <div aria-busy="true" className="h-full min-h-0 w-full bg-background" data-office-preview-pending={true} />;
  if (error || !model)
    return (
      <div className="p-3 text-ui-base text-destructive" role="alert">
        {errorMessage}
      </div>
    );
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-auto bg-background p-4 max-sm:p-2" data-office-preview-kind="doc">
      <DocxFitViewport key={docxModelKey(model)} model={model} sourcePath={sourcePath} />
    </div>
  );
}

export default PreviewPaneOfficeLegacyDocContent;
