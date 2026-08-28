/* eslint-disable */
/**
 * ============================================================================
 * pptxRendererPreviewEngine.tsx — PPTX 自研预览引擎（主模块）
 * （解混淆重建 · D8 Stage B2 · Office 预览族）
 *
 * 源 chunk：out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js
 * （55,447 行；JSX 还原版 src-reconstructed/renderer/assets/
 *  pptxRendererPreviewEngine-BIIRLBue.jsx，44,678 行，行号锚点均指此）
 *
 * 子模块拆分（避免循环依赖，types ← color/text/geometry ← render/charts ← 本文件）：
 *   ./pptxEngineTypes      XmlNode/rels/单位/模型类型            (jsx 3589-3695, 3899-3907, 类型化 3875-4984)
 *   ./pptxEngineColor      颜色/变换/填充/线型解析                (jsx 4984-6242)
 *   ./pptxEngineText       字体/段落/文本体渲染                   (jsx 6455-7458, 10928-11106)
 *   ./pptxEngineGeometry   预设几何/custGeom/多区域               (jsx 7263-10927)
 *   ./pptxEngineRender     形状/背景/图片/表格/组渲染 + EMF       (jsx 6243-6453, 11107-14492)
 *   ./pptxEngineCharts     OOXML 图表 → echarts                  (jsx 14494-14648, 41069-44265)
 *   本文件                 zip 开启/模型构建/占位符继承/幻灯片渲染/
 *                          文本条目/文档类/引擎导出                (jsx 3263-3600, 3697-3875, 3875-4984, 44266-44678)
 *
 * ── vendor 段登记（不逐字转录）─────────────────────────────────────────────
 *   [V1] JSZip 3.10.1            jsx 13-3262     符号 s；zip 读取/解压。
 *                                   上游对照 VENDOR-MANIFEST-LIBS.md（JSZip 3.10.1）。
 *                                   本文件以 JsZipArchive 接口 + registerJszip()
 *                                   注入点替代（真实实现来自该 vendor 段）。
 *   [V2] zrender + echarts       jsx 14650-41068 图表渲染运行时；
 *                                   lx = zrender.graphic.LinearGradient (jsx 21575)，
 *                                   Ej = echarts.init (jsx 28524)。
 *                                   本族以 ChartLinearGradient 结构等价物 +
 *                                   registerEchartsInit() 注入点替代。
 * ────────────────────────────────────────────────────────────────────────────
 *
 * 引擎导出（原 Uq，jsx 44670-44677）：
 *   pptxRendererPreviewEngine.open(buffer) →
 *     new PresentationPreviewDocument(buildPresentationModel(await openPresentationArchive(buffer, ZIP_LIMITS), { lazySlides: true }))
 * chunk 导出名：`pptxRendererPreviewEngine`（export { Uq as pptxRendererPreviewEngine }）。
 * ============================================================================
 */

import {
  XmlNode, parseXml, parseRels, resolvePartPath, partDirectory, partRelsPath,
  emuToPx, angleToDeg, parseXmlBool, parseXmlBoolDefaultTrue,
} from "./pptxEngineTypes";
import type {
  PptxRelationship, PptxTheme, PptxThemeFont, PptxSlideMaster, PptxSlideLayout,
  PptxPlaceholderEntry, PptxSlide, PptxNode, PptxShapeNode, PptxTableNode,
  PptxGroupNode, PptxPresentation, PptxRenderContext, PptxRenderResult,
  PptxChartInstance, PptxMediaResolver, PptxTextBody,
} from "./pptxEngineTypes";
import { THEME_COLOR_SCHEME_KEYS } from "./pptxEngineTypes";
import { renderSlideBackground, renderShapeNode, renderPictureNode, renderTableNode, renderGroupNode } from "./pptxEngineRender";
import { renderChartNode, type EchartsInit } from "./pptxEngineCharts";

/* ============================================================================
 * [V1] JSZip 注入桥（原 s = vendor JSZip 3.10.1，jsx 13-3262）
 * ==========================================================================*/

/** JSZip 文件条目最小接口（原 vendor 段类型） */
export interface JsZipEntry {
  dir: boolean;
  name: string;
  async(kind: `string`): Promise<string>;
  async(kind: `uint8array`): Promise<Uint8Array>;
  _data?: { uncompressedSize?: number };
}

/** JSZip 实例最小接口 */
export interface JsZipArchive {
  files: Record<string, JsZipEntry>;
  loadAsync(data: ArrayBuffer | Uint8Array): Promise<JsZipArchive>;
}

let jszipRuntime: JsZipArchive | null = null;

/** 注入 JSZip 实现（真实构建 = vendor 段 [V1] 的默认导出） */
export function registerJszip(runtime: JsZipArchive): void {
  jszipRuntime = runtime;
}

function requireJszip(): JsZipArchive {
  if (!jszipRuntime) throw new Error(`JSZip runtime is not registered (vendor segment [V1])`);
  return jszipRuntime;
}

/* [V2] echarts 注入桥（原 Ej，jsx 28524） */

let echartsRuntime: EchartsInit | null = null;

/** 注入 echarts.init（真实构建 = vendor 段 [V2]） */
export function registerEchartsInit(init: EchartsInit): void {
  echartsRuntime = init;
}

function requireEchartsInit(): EchartsInit {
  if (!echartsRuntime) throw new Error(`echarts runtime is not registered (vendor segment [V2])`);
  return echartsRuntime;
}

/* ============================================================================
 * zip 限额与归档读取（原 v..M，jsx 3336-3598）
 * ==========================================================================*/

/** zip 解压限额（原 v，jsx 3336-3342） */
export const ZIP_LIMITS = Object.freeze({
  maxEntries: 4e3,
  maxEntryUncompressedBytes: 32 * 1024 * 1024,
  maxTotalUncompressedBytes: 256 * 1024 * 1024,
  maxMediaBytes: 192 * 1024 * 1024,
  maxConcurrency: 8,
});

export interface ZipLimits {
  maxEntries?: number;
  maxEntryUncompressedBytes?: number;
  maxTotalUncompressedBytes?: number;
  maxMediaBytes?: number;
  maxConcurrency?: number;
}

/** 原 y：限额错误 */
function zipLimitError(message: string): never {
  throw Error(`PPTX zip limit exceeded: ${message}`);
}

/** 原 b：媒体路径判定 */
function isMediaPath(path: string): boolean {
  return path.startsWith(`ppt/media/`);
}

/** 原 x：路径段解码（容错） */
function decodePathSegments(path: string): string {
  return path
    .split(`/`)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join(`/`);
}

/** 原 S：双键写入（解码别名同步登记） */
function setWithDecodedAlias<K>(map: Map<string, K>, key: string, value: K): void {
  map.set(key, value);
  const alias = decodePathSegments(key);
  alias !== key && !map.has(alias) && map.set(alias, value);
}

/** 原 C：条目未压缩尺寸（可能缺失） */
function entryUncompressedSize(entry: JsZipEntry): number | undefined {
  const size = entry._data?.uncompressedSize;
  return typeof size === `number` && Number.isFinite(size) ? size : undefined;
}

/** 原 w：UTF-8 字节长度 */
function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

/** 限额核算状态（原 M 内 d 对象） */
interface ZipBudgetState {
  limits: ZipLimits;
  knownSizeByPath: Map<string, number>;
  knownTotalBytes: number;
  knownMediaBytes: number;
  unknownTotalBytes: number;
  unknownMediaBytes: number;
}

/** 原 E：按实际解压尺寸核算限额 */
function accountUncompressedBytes(path: string, bytes: number, state: ZipBudgetState): void {
  state.limits.maxEntryUncompressedBytes !== undefined &&
    bytes > state.limits.maxEntryUncompressedBytes &&
    zipLimitError(`${path} is ${bytes} bytes > maxEntryUncompressedBytes ${state.limits.maxEntryUncompressedBytes}`);
  if (state.knownSizeByPath.has(path)) return;
  state.unknownTotalBytes += bytes;
  const total = state.knownTotalBytes + state.unknownTotalBytes;
  state.limits.maxTotalUncompressedBytes !== undefined &&
    total > state.limits.maxTotalUncompressedBytes &&
    zipLimitError(`total uncompressed bytes ${total} > maxTotalUncompressedBytes ${state.limits.maxTotalUncompressedBytes}`);
  if (isMediaPath(path)) {
    state.unknownMediaBytes += bytes;
    const mediaTotal = state.knownMediaBytes + state.unknownMediaBytes;
    state.limits.maxMediaBytes !== undefined &&
      mediaTotal > state.limits.maxMediaBytes &&
      zipLimitError(`media bytes ${mediaTotal} > maxMediaBytes ${state.limits.maxMediaBytes}`);
  }
}

/** 原 D：读文本条目（核算） */
async function readTextEntry(path: string, entry: JsZipEntry, state: ZipBudgetState): Promise<string> {
  const text = await entry.async(`string`);
  accountUncompressedBytes(path, utf8ByteLength(text), state);
  return text;
}

/** 原 O：读二进制条目（核算） */
async function readBinaryEntry(path: string, entry: JsZipEntry, state: ZipBudgetState): Promise<Uint8Array> {
  const data = await entry.async(`uint8array`);
  accountUncompressedBytes(path, data.byteLength, state);
  return data;
}

/** 原 k：未知尺寸条目的预核算（仅限额开启时） */
async function preaccountEntry(path: string, entry: JsZipEntry, state: ZipBudgetState): Promise<void> {
  state.knownSizeByPath.has(path) ||
    (state.limits.maxEntryUncompressedBytes === undefined && state.limits.maxTotalUncompressedBytes === undefined) ||
    accountUncompressedBytes(path, (await entry.async(`uint8array`)).byteLength, state);
}

/** 原 A：并发池（索引泵送） */
async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  if (items.length === 0) return;
  const poolSize = Math.min(concurrency, items.length);
  let cursor = 0;
  const workers = Array.from({ length: poolSize }, async () => {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index]);
    }
  });
  await Promise.all(workers);
}

/** zip 归档读取结果（原 M 返回类型） */
export interface PptxArchive {
  contentTypes: string;
  presentation: string;
  presentationRels: string;
  tableStyles?: string;
  slides: Map<string, string>;
  slideRels: Map<string, string>;
  slideLayouts: Map<string, string>;
  slideLayoutRels: Map<string, string>;
  slideMasters: Map<string, string>;
  slideMasterRels: Map<string, string>;
  themes: Map<string, string>;
  themeOverrides?: Map<string, string>;
  media: Map<string, Uint8Array>;
  mediaResolver?: PptxMediaResolver;
  charts: Map<string, string>;
  chartRels?: Map<string, string>;
  chartStyles?: Map<string, string>;
  chartColors?: Map<string, string>;
  diagramDrawings: Map<string, string>;
}

/** 延迟媒体条目登记 */
interface LazyMediaEntry {
  path: string;
  file: JsZipEntry;
}

/**
 * 原 T：懒媒体解析器——渲染时按需解压 ppt/media 条目，
 * 双路径候选 + 在途去重 + 已加载字节统计。
 */
class LazyMediaResolver implements PptxMediaResolver {
  private inflight = new Map<string, Promise<Uint8Array>>();
  private loadedPaths = new Set<string>();
  totalCount: number;

  constructor(
    private entries: Map<string, LazyMediaEntry>,
    private media: Map<string, Uint8Array>,
    private state: ZipBudgetState,
    private totalBytes: number,
  ) {
    void totalBytes;
    this.totalCount = new Set(Array.from(entries.values(), (e) => e.path)).size;
  }

  get loadedBytes(): number {
    let bytes = 0;
    for (const path of this.loadedPaths) bytes += this.media.get(path)?.byteLength ?? 0;
    return bytes;
  }

  get loadedCount(): number {
    return this.loadedPaths.size;
  }

  async resolve(target: string): Promise<{ mediaPath: string; data: Uint8Array } | undefined> {
    for (const candidate of mediaPathCandidatesLocal(target)) {
      const data = this.media.get(candidate);
      if (data) return { mediaPath: candidate, data };
    }
    for (const candidate of mediaPathCandidatesLocal(target)) {
      const entry = this.entries.get(candidate);
      if (entry) return { mediaPath: candidate, data: await this.readEntry(entry) };
    }
    return undefined;
  }

  private async readEntry(entry: LazyMediaEntry): Promise<Uint8Array> {
    let pending = this.inflight.get(entry.path);
    if (!pending) {
      pending = readBinaryEntry(entry.path, entry.file, this.state).then((data) => (
        setWithDecodedAlias(this.media, entry.path, data), this.loadedPaths.add(entry.path), data
      ));
      this.inflight.set(entry.path, pending);
    }
    try {
      return await pending;
    } finally {
      this.inflight.delete(entry.path);
    }
  }
}

/** 媒体路径候选（与渲染模块 mediaPathCandidates 同源，原 m，jsx 3317-3321） */
function mediaPathCandidatesLocal(target: string): string[] {
  const clean = target.search(/[?#]/) >= 0 ? target.slice(0, target.search(/[?#]/)) : target;
  const segments = clean.replace(/\\/g, `/`).split(`/`).filter((s) => s && s !== `.`);
  const fileName = (() => {
    const index = segments.lastIndexOf(`media`);
    return (index >= 0 && index < segments.length - 1 ? segments.slice(index + 1) : segments.slice(-1)).join(`/`);
  })();
  const decode = (segment: string) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  };
  const primary = `ppt/media/${fileName.split(`/`).map(decode).join(`/`)}`;
  const baseName = segments[segments.length - 1] ?? ``;
  const direct = `ppt/media/${baseName}`;
  return primary === direct ? [primary] : [primary, direct];
}

/**
 * 原 j：开启 PPTX 归档（懒媒体模式 + 缺省限额）。
 * 引擎导出链路：open(buffer) → j(buffer, v)。
 */
export async function openPresentationArchive(data: ArrayBuffer | Uint8Array, limits: ZipLimits = {}): Promise<PptxArchive> {
  return openPresentationArchiveInternal(data, limits, { lazyMedia: true });
}

/**
 * 原 M：归档读取主体——
 *  1) loadAsync 后按限额核算条目数/单条目/总量/媒体字节（头部已知尺寸优先）；
 *  2) 并发池分类读取：核心 XML（presentation/rels/tableStyles）、
 *     幻灯片/版式/母版及其 rels、主题与 themeOverride、
 *     图表/样式/色样式、SmartArt 绘图；
 *  3) 媒体：懒模式登记待解压条目并挂 LazyMediaResolver，否则即时解压。
 */
async function openPresentationArchiveInternal(
  data: ArrayBuffer | Uint8Array,
  limits: ZipLimits,
  options: { lazyMedia?: boolean },
): Promise<PptxArchive> {
  const concurrency = limits.maxConcurrency ?? 8;
  (!Number.isInteger(concurrency) || concurrency < 1) && zipLimitError(`maxConcurrency ${limits.maxConcurrency} must be an integer >= 1`);
  const zip = await requireJszip().loadAsync(data);
  const entries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
  limits.maxEntries !== undefined && entries.length > limits.maxEntries && zipLimitError(`entries ${entries.length} > maxEntries ${limits.maxEntries}`);
  const knownSizeByPath = new Map<string, number>();
  let knownTotalBytes = 0;
  let knownMediaBytes = 0;
  for (const [rawName, entry] of entries) {
    const path = rawName.replace(/\\/g, `/`);
    const size = entryUncompressedSize(entry);
    if (size !== undefined) {
      knownSizeByPath.set(path, size);
      limits.maxEntryUncompressedBytes !== undefined &&
        size > limits.maxEntryUncompressedBytes &&
        zipLimitError(`${path} is ${size} bytes > maxEntryUncompressedBytes ${limits.maxEntryUncompressedBytes}`);
      knownTotalBytes += size;
      limits.maxTotalUncompressedBytes !== undefined &&
        knownTotalBytes > limits.maxTotalUncompressedBytes &&
        zipLimitError(`total uncompressed bytes ${knownTotalBytes} > maxTotalUncompressedBytes ${limits.maxTotalUncompressedBytes}`);
      if (isMediaPath(path)) {
        knownMediaBytes += size;
        limits.maxMediaBytes !== undefined && knownMediaBytes > limits.maxMediaBytes && zipLimitError(`media bytes ${knownMediaBytes} > maxMediaBytes ${limits.maxMediaBytes}`);
      }
    }
  }
  const archive: PptxArchive = {
    contentTypes: ``,
    presentation: ``,
    presentationRels: ``,
    slides: new Map(),
    slideRels: new Map(),
    slideLayouts: new Map(),
    slideLayoutRels: new Map(),
    slideMasters: new Map(),
    slideMasterRels: new Map(),
    themes: new Map(),
    themeOverrides: new Map(),
    media: new Map(),
    charts: new Map(),
    chartRels: new Map(),
    chartStyles: new Map(),
    chartColors: new Map(),
    diagramDrawings: new Map(),
  };
  const state: ZipBudgetState = {
    limits,
    knownSizeByPath,
    knownTotalBytes,
    knownMediaBytes,
    unknownTotalBytes: 0,
    unknownMediaBytes: 0,
  };
  const lazyEntries = new Map<string, LazyMediaEntry>();
  await runWithConcurrency(entries, concurrency, async ([rawName, entry]) => {
    const path = rawName.replace(/\\/g, `/`);
    if (path === `[Content_Types].xml`) {
      archive.contentTypes = await readTextEntry(path, entry, state);
      return;
    }
    if (path === `ppt/presentation.xml`) {
      archive.presentation = await readTextEntry(path, entry, state);
      return;
    }
    if (path === `ppt/_rels/presentation.xml.rels`) {
      archive.presentationRels = await readTextEntry(path, entry, state);
      return;
    }
    if (path === `ppt/tableStyles.xml`) {
      archive.tableStyles = await readTextEntry(path, entry, state);
      return;
    }
    if (isMediaPath(path)) {
      if (options.lazyMedia) {
        setWithDecodedAlias(lazyEntries, path, { path, file: entry });
        return;
      }
      const mediaData = await readBinaryEntry(path, entry, state);
      setWithDecodedAlias(archive.media, path, mediaData);
      return;
    }
    if (/^ppt\/slides\/_rels\/[^/]+\.xml\.rels$/.test(path)) {
      setWithDecodedAlias(archive.slideRels, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/slides\/[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.slides, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/slideLayouts\/_rels\/[^/]+\.xml\.rels$/.test(path)) {
      setWithDecodedAlias(archive.slideLayoutRels, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/slideLayouts\/[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.slideLayouts, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/slideMasters\/_rels\/[^/]+\.xml\.rels$/.test(path)) {
      setWithDecodedAlias(archive.slideMasterRels, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/slideMasters\/[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.slideMasters, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/theme\/(?!themeOverride[^/]*\.xml$)[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.themes, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/theme\/themeOverride[^/]*\.xml$/.test(path)) {
      archive.themeOverrides && setWithDecodedAlias(archive.themeOverrides, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/charts\/_rels\/[^/]+\.xml\.rels$/.test(path)) {
      archive.chartRels && setWithDecodedAlias(archive.chartRels, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/charts\/(?!style[^/]*\.xml$)(?!colors[^/]*\.xml$)[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.charts, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/charts\/style[^/]*\.xml$/.test(path)) {
      setWithDecodedAlias(archive.chartStyles!, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/charts\/colors[^/]*\.xml$/.test(path)) {
      setWithDecodedAlias(archive.chartColors!, path, await readTextEntry(path, entry, state));
      return;
    }
    if (/^ppt\/diagrams\/[^/]+\.xml$/.test(path)) {
      setWithDecodedAlias(archive.diagramDrawings, path, await readTextEntry(path, entry, state));
      return;
    }
    await preaccountEntry(path, entry, state);
  });
  options.lazyMedia && (archive.mediaResolver = new LazyMediaResolver(lazyEntries, archive.media, state, knownMediaBytes));
  return archive;
}

/* ============================================================================
 * 主题解析（原 ie/ae/oe，jsx 3697-3744）
 * ==========================================================================*/

/** 原 ie：clrScheme 条目颜色（srgbClr 优先，sysClr 回退 lastClr） */
function schemeEntryColor(entry: XmlNode): string | undefined {
  const srgb = entry.child(`srgbClr`);
  if (srgb.exists()) return srgb.attr(`val`);
  const sys = entry.child(`sysClr`);
  if (sys.exists()) return sys.attr(`lastClr`) ?? sys.attr(`val`);
  return undefined;
}

/** 原 ae：字体方案（latin/ea/cs + script 映射） */
function parseThemeFontScheme(node: XmlNode): PptxThemeFont {
  const scripts: Record<string, string> = {};
  for (const font of node.children(`font`)) {
    const script = font.attr(`script`);
    const typeface = font.attr(`typeface`);
    script && typeface && (scripts[script] = typeface);
  }
  const out: PptxThemeFont = {
    latin: node.child(`latin`).attr(`typeface`) ?? ``,
    ea: node.child(`ea`).attr(`typeface`) ?? ``,
    cs: node.child(`cs`).attr(`typeface`) ?? ``,
  };
  Object.keys(scripts).length > 0 && (out.scripts = scripts);
  return out;
}

/** 原 oe：theme → 配色方案 + 字体方案 + 四类样式列表 */
export function parseTheme(themeRoot: XmlNode): PptxTheme {
  const elements = themeRoot.child(`themeElements`);
  const host = elements.exists() ? elements : themeRoot;
  const clrScheme = host.child(`clrScheme`);
  const colorScheme = new Map<string, string>();
  for (const key of THEME_COLOR_SCHEME_KEYS) {
    const entry = clrScheme.child(key);
    if (entry.exists()) {
      const color = schemeEntryColor(entry);
      color !== undefined && colorScheme.set(key, color);
    }
  }
  const fontScheme = host.child(`fontScheme`);
  const majorFont = parseThemeFontScheme(fontScheme.child(`majorFont`));
  const minorFont = parseThemeFontScheme(fontScheme.child(`minorFont`));
  const fmtScheme = host.child(`fmtScheme`);
  return {
    colorScheme,
    majorFont,
    minorFont,
    fillStyles: fmtScheme.child(`fillStyleLst`).allChildren(),
    bgFillStyles: fmtScheme.child(`bgFillStyleLst`).allChildren(),
    lineStyles: fmtScheme.child(`lnStyleLst`).allChildren(),
    effectStyles: fmtScheme.child(`effectStyleLst`).allChildren(),
  };
}

/* ============================================================================
 * 占位符收集（原 se..de / _e..xe 两组同构实现，jsx 3745-3874；
 * 此处合并为单一实现，母版/版式共用）
 * ==========================================================================*/

/** 原 se/_e：元素是否占位符 */
function isPlaceholderElement(element: XmlNode): boolean {
  for (const kind of [`nvSpPr`, `nvPicPr`, `nvGraphicFramePr`, `nvCxnSpPr`]) {
    const nv = element.child(kind);
    if (nv.exists() && nv.child(`nvPr`).child(`ph`).exists()) return true;
  }
  return false;
}

/** 原 ce/ve：元素 xfrm（spPr 优先） */
function elementXfrm(element: XmlNode): { offX: number; offY: number; cx: number; cy: number } | null {
  const spPrXfrm = element.child(`spPr`).child(`xfrm`);
  const xfrm = spPrXfrm.exists() ? spPrXfrm : element.child(`xfrm`);
  if (!xfrm.exists()) return null;
  const off = xfrm.child(`off`);
  const ext = xfrm.child(`ext`);
  return {
    offX: off.numAttr(`x`) ?? 0,
    offY: off.numAttr(`y`) ?? 0,
    cx: ext.numAttr(`cx`) ?? 0,
    cy: ext.numAttr(`cy`) ?? 0,
  };
}

/** 原 le/ye：组 xfrm（含子坐标系） */
function groupXfrm(group: XmlNode): {
  offX: number; offY: number; cx: number; cy: number;
  chOffX: number; chOffY: number; chExtCx: number; chExtCy: number;
} | null {
  const grpSpPr = group.child(`grpSpPr`);
  if (!grpSpPr.exists()) return null;
  const xfrm = grpSpPr.child(`xfrm`);
  if (!xfrm.exists()) return null;
  const off = xfrm.child(`off`);
  const ext = xfrm.child(`ext`);
  const chOff = xfrm.child(`chOff`);
  const chExt = xfrm.child(`chExt`);
  const offX = off.numAttr(`x`) ?? 0;
  const offY = off.numAttr(`y`) ?? 0;
  const cx = ext.numAttr(`cx`) ?? 0;
  const cy = ext.numAttr(`cy`) ?? 0;
  const chOffX = chOff.exists() ? chOff.numAttr(`x`) ?? 0 : 0;
  const chOffY = chOff.exists() ? chOff.numAttr(`y`) ?? 0 : 0;
  const chExtCx = chExt.exists() ? chExt.numAttr(`cx`) ?? cx : cx;
  const chExtCy = chExt.exists() ? chExt.numAttr(`cy`) ?? cy : cy;
  return { offX, offY, cx, cy, chOffX, chOffY, chExtCx: chExtCx > 0 ? chExtCx : 1, chExtCy: chExtCy > 0 ? chExtCy : 1 };
}

/** 组坐标换算上下文 */
interface GroupTransform {
  offX: number;
  offY: number;
  scaleX: number;
  scaleY: number;
}

/**
 * 原 ue/be：递归收集占位符（组内坐标 → 绝对坐标换算）。
 */
function collectPlaceholderEntries(spTree: XmlNode, parent: GroupTransform | null): PptxPlaceholderEntry[] {
  const out: PptxPlaceholderEntry[] = [];
  for (const child of spTree.allChildren()) {
    if (child.localName === `grpSp`) {
      const transform = groupXfrm(child);
      if (transform && transform.chExtCx > 0 && transform.chExtCy > 0) {
        const scaleX = transform.cx / transform.chExtCx;
        const scaleY = transform.cy / transform.chExtCy;
        const shiftX = transform.offX - transform.chOffX * scaleX;
        const shiftY = transform.offY - transform.chOffY * scaleY;
        const next: GroupTransform = parent
          ? {
              offX: parent.offX + shiftX * parent.scaleX,
              offY: parent.offY + shiftY * parent.scaleY,
              scaleX: parent.scaleX * scaleX,
              scaleY: parent.scaleY * scaleY,
            }
          : { offX: shiftX, offY: shiftY, scaleX, scaleY };
        out.push(...collectPlaceholderEntries(child, next));
      } else out.push(...collectPlaceholderEntries(child, parent));
      continue;
    }
    if (!isPlaceholderElement(child)) continue;
    const xfrm = elementXfrm(child);
    if (!xfrm) {
      out.push({ node: child });
      continue;
    }
    if (parent) {
      const absX = parent.offX + xfrm.offX * parent.scaleX;
      const absY = parent.offY + xfrm.offY * parent.scaleY;
      const absW = xfrm.cx * parent.scaleX;
      const absH = xfrm.cy * parent.scaleY;
      out.push({
        node: child,
        absoluteXfrm: { position: { x: emuToPx(absX), y: emuToPx(absY) }, size: { w: emuToPx(absW), h: emuToPx(absH) } },
      });
    } else {
      out.push({
        node: child,
        absoluteXfrm: {
          position: { x: emuToPx(xfrm.offX), y: emuToPx(xfrm.offY) },
          size: { w: emuToPx(xfrm.cx), h: emuToPx(xfrm.cy) },
        },
      });
    }
  }
  return out;
}

/** 原 de/xe：clrMap 属性表 */
function parseColorMapAttributes(node: XmlNode): Map<string, string> {
  const out = new Map<string, string>();
  const element = node.element;
  if (!element) return out;
  const attributes = element.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    out.set(attr.localName, attr.value);
  }
  return out;
}

/* ============================================================================
 * 母版 / 版式解析（原 fe/Se，jsx 3847-3898）
 * ==========================================================================*/

/** 原 fe：slideMaster → 模型（配色映射/文本样式/占位符） */
function parseSlideMaster(masterRoot: XmlNode): PptxSlideMaster {
  const cSld = masterRoot.child(`cSld`);
  const bg = cSld.child(`bg`);
  const background = bg.exists() ? bg : undefined;
  const spTree = cSld.child(`spTree`);
  const colorMap = parseColorMapAttributes(masterRoot.child(`clrMap`));
  const textStyles = masterRoot.child(`txStyles`);
  const titleStyle = textStyles.child(`titleStyle`);
  const bodyStyle = textStyles.child(`bodyStyle`);
  const otherStyle = textStyles.child(`otherStyle`);
  const defaultTextStyle = masterRoot.child(`defaultTextStyle`);
  const entries = collectPlaceholderEntries(spTree, null);
  const placeholders = entries.map((e) => e.node);
  return {
    colorMap,
    background,
    textStyles: {
      titleStyle: titleStyle.exists() ? titleStyle : undefined,
      bodyStyle: bodyStyle.exists() ? bodyStyle : undefined,
      otherStyle: otherStyle.exists() ? otherStyle : undefined,
    },
    defaultTextStyle: defaultTextStyle.exists() ? defaultTextStyle : undefined,
    placeholders,
    placeholderEntries: entries,
    spTree,
    rels: new Map(),
  };
}

/** 原 Se：slideLayout → 模型（含 clrMapOvr、showMasterSp） */
function parseSlideLayout(layoutRoot: XmlNode): PptxSlideLayout {
  const cSld = layoutRoot.child(`cSld`);
  const bg = cSld.child(`bg`);
  const background = bg.exists() ? bg : undefined;
  const spTree = cSld.child(`spTree`);
  let colorMapOverride: Map<string, string> | undefined;
  const override = layoutRoot.child(`clrMapOvr`);
  if (override.exists()) {
    const mapping = override.child(`overrideClrMapping`);
    mapping.exists() && (colorMapOverride = parseColorMapAttributes(mapping));
  }
  const placeholders = collectPlaceholderEntries(spTree, null);
  const showMasterSp = parseXmlBoolDefaultTrue(layoutRoot.attr(`showMasterSp`));
  return { colorMapOverride, background, placeholders, spTree, rels: new Map(), showMasterSp };
}

/* ============================================================================
 * 元素节点解析（原 Ce..et，jsx 4030-4570）
 * ==========================================================================*/

import { findFillNode } from "./pptxEngineColor";
import { parseAdjustments } from "./pptxEngineGeometry";
import type { PptxPictureNode, PptxTableCell, PptxTableRow, PptxParagraph, PptxChartNode } from "./pptxEngineTypes";

/** 原 Ce：nvXxxPr → cNvPr/nvPr */
function elementNvProps(element: XmlNode): { cNvPr: XmlNode; nvPr: XmlNode } {
  for (const kind of [`nvSpPr`, `nvPicPr`, `nvGrpSpPr`, `nvGraphicFramePr`, `nvCxnSpPr`]) {
    const nv = element.child(kind);
    if (nv.exists()) return { cNvPr: nv.child(`cNvPr`), nvPr: nv.child(`nvPr`) };
  }
  return { cNvPr: element.child(`cNvPr`), nvPr: element.child(`nvPr`) };
}

/** 原 we：变换节点查找（spPr > grpSpPr > 直属） */
function elementXfrmNode(element: XmlNode): XmlNode {
  const spPr = element.child(`spPr`);
  if (spPr.exists()) {
    const xfrm = spPr.child(`xfrm`);
    if (xfrm.exists()) return xfrm;
  }
  const grpSpPr = element.child(`grpSpPr`);
  if (grpSpPr.exists()) {
    const xfrm = grpSpPr.child(`xfrm`);
    if (xfrm.exists()) return xfrm;
  }
  const direct = element.child(`xfrm`);
  return direct.exists() ? direct : element.child(`__nonexistent__`);
}

/** 原 Te：nvPr ph → 占位符类型/序号 */
function elementPlaceholder(nvPr: XmlNode): { type?: string; idx?: number } | undefined {
  const ph = nvPr.child(`ph`);
  if (ph.exists()) return { type: ph.attr(`type`), idx: ph.numAttr(`idx`) };
  return undefined;
}

/** 原 Ee：元素公共属性（id/名称/位置/尺寸/旋转/翻转/占位符/超链接） */
function parseElementBase(element: XmlNode): Omit<PptxShapeNode, `nodeType` | `adjustments`> {
  const { cNvPr, nvPr } = elementNvProps(element);
  const id = cNvPr.attr(`id`) ?? ``;
  const name = cNvPr.attr(`name`) ?? ``;
  const xfrm = elementXfrmNode(element);
  const off = xfrm.child(`off`);
  const ext = xfrm.child(`ext`);
  const position = { x: emuToPx(off.numAttr(`x`) ?? 0), y: emuToPx(off.numAttr(`y`) ?? 0) };
  const size = { w: emuToPx(ext.numAttr(`cx`) ?? 0), h: emuToPx(ext.numAttr(`cy`) ?? 0) };
  const rotation = angleToDeg(xfrm.numAttr(`rot`) ?? 0);
  const flipH = parseXmlBool(xfrm.attr(`flipH`));
  const flipV = parseXmlBool(xfrm.attr(`flipV`));
  const placeholder = elementPlaceholder(nvPr);
  let hlinkClick: { action?: string; rId?: string; tooltip?: string } | undefined;
  const hlink = cNvPr.child(`hlinkClick`);
  hlink.exists() &&
    (hlinkClick = {
      action: hlink.attr(`action`) ?? undefined,
      rId: hlink.attr(`id`) ?? hlink.attr(`r:id`) ?? undefined,
      tooltip: hlink.attr(`tooltip`) ?? undefined,
    });
  return { id, name, position, size, rotation, flipH, flipV, placeholder, hlinkClick, source: element };
}

/** 原 De：段落解析（r/br/tab/fld → runs；lvl；endParaRPr） */
function parseParagraph(p: XmlNode): PptxParagraph {
  const pPr = p.child(`pPr`);
  const level = pPr.numAttr(`lvl`) ?? 0;
  const simpleRuns: { text: string; properties?: XmlNode }[] = [];
  for (const run of p.children(`r`)) {
    const rPr = run.child(`rPr`);
    const t = run.child(`t`);
    simpleRuns.push({ text: t.text(), properties: rPr.exists() ? rPr : undefined });
  }
  const runs: { text: string; properties?: XmlNode }[] = [];
  for (const child of p.allChildren()) {
    const kind = child.localName;
    if (kind === `r`) {
      const rPr = child.child(`rPr`);
      const t = child.child(`t`);
      runs.push({ text: t.text(), properties: rPr.exists() ? rPr : undefined });
    } else if (kind === `br`) {
      const rPr = child.child(`rPr`);
      runs.push({ text: `\n`, properties: rPr.exists() ? rPr : undefined });
    } else if (kind === `tab`) runs.push({ text: `` });
    else if (kind === `fld`) {
      const rPr = child.child(`rPr`);
      const t = child.child(`t`);
      runs.push({ text: t.text(), properties: rPr.exists() ? rPr : undefined });
    }
  }
  const endParaRPr = p.child(`endParaRPr`);
  return {
    properties: pPr.exists() ? pPr : undefined,
    runs: runs.length > 0 ? runs : simpleRuns,
    level,
    endParaRPr: endParaRPr.exists() ? endParaRPr : undefined,
  };
}

/** 原 Oe：txBody → 文本体模型 */
function parseTextBody(txBody: XmlNode): PptxTextBody | undefined {
  if (!txBody.exists()) return;
  const bodyProperties = txBody.child(`bodyPr`);
  const listStyle = txBody.child(`lstStyle`);
  const paragraphs: PptxParagraph[] = [];
  for (const p of txBody.children(`p`)) paragraphs.push(parseParagraph(p));
  return {
    bodyProperties: bodyProperties.exists() ? bodyProperties : undefined,
    listStyle: listStyle.exists() ? listStyle : undefined,
    paragraphs,
  };
}

/** 原 Me：sp/cxnSp → 形状节点（几何/填充/线端/文本框边界） */
function parseShapeElement(element: XmlNode): PptxShapeNode {
  const base = parseElementBase(element);
  const spPr = element.child(`spPr`);
  const prstGeom = spPr.child(`prstGeom`);
  const presetGeometry = prstGeom.attr(`prst`);
  const adjustments = parseAdjustments(element);
  const custGeomNode = spPr.child(`custGeom`);
  const customGeometry = custGeomNode.exists() ? custGeomNode : undefined;
  const fill = findFillNode(spPr);
  const lineNode = spPr.child(`ln`);
  const line = lineNode.exists() ? lineNode : undefined;
  let headEnd: { type: string; w?: string; len?: string } | undefined;
  let tailEnd: { type: string; w?: string; len?: string } | undefined;
  if (lineNode.exists()) {
    const head = lineNode.child(`headEnd`);
    if (head.exists()) {
      const type = head.attr(`type`);
      type && type !== `none` && (headEnd = { type, w: head.attr(`w`), len: head.attr(`len`) });
    }
    const tail = lineNode.child(`tailEnd`);
    if (tail.exists()) {
      const type = tail.attr(`type`);
      type && type !== `none` && (tailEnd = { type, w: tail.attr(`w`), len: tail.attr(`len`) });
    }
  }
  const textBody = parseTextBody(element.child(`txBody`));
  let textBoxBounds: { x: number; y: number; w: number; h: number; rotation?: number } | undefined;
  const txXfrm = element.child(`txXfrm`);
  if (txXfrm.exists()) {
    const txOff = txXfrm.child(`off`);
    const txExt = txXfrm.child(`ext`);
    const spXfrm = spPr.child(`xfrm`);
    const spOff = spXfrm.child(`off`);
    const spExt = spXfrm.child(`ext`);
    const spOffX = spOff.numAttr(`x`) ?? 0;
    const spOffY = spOff.numAttr(`y`) ?? 0;
    const spCx = spExt.numAttr(`cx`) ?? 0;
    const spCy = spExt.numAttr(`cy`) ?? 0;
    const txOffX = txOff.numAttr(`x`) ?? 0;
    const txOffY = txOff.numAttr(`y`) ?? 0;
    const txCx = txExt.numAttr(`cx`) ?? 0;
    const txCy = txExt.numAttr(`cy`) ?? 0;
    if (spCx > 0 && spCy > 0) {
      const txRot = angleToDeg(txXfrm.numAttr(`rot`) ?? 0);
      const dx = txOffX - spOffX;
      const dy = txOffY - spOffY;
      const flipped180 = Math.abs(Math.round(txRot)) % 360 === 180;
      const boundX = flipped180 ? spCx - (dx + txCx) : dx;
      const boundY = flipped180 ? spCy - (dy + txCy) : dy;
      textBoxBounds = { x: emuToPx(boundX), y: emuToPx(boundY), w: emuToPx(txCx), h: emuToPx(txCy), rotation: txRot };
    }
  }
  return { ...base, nodeType: `shape`, presetGeometry, adjustments, customGeometry, fill, line, headEnd, tailEnd, textBody, textBoxBounds };
}

const CROP_DIVISOR = 1e5; // 原 Ne

/** 原 Pe：pic → 图片节点（blip/裁剪/视频音频/几何） */
function parsePictureElement(element: XmlNode): PptxPictureNode {
  const base = parseElementBase(element);
  const blipFill = element.child(`blipFill`);
  const blip = blipFill.child(`blip`);
  const blipEmbed = blip.attr(`embed`) ?? blip.attr(`r:embed`);
  const blipLink = blip.attr(`link`) ?? blip.attr(`r:link`);
  const srcRect = blipFill.child(`srcRect`);
  let crop: { top: number; bottom: number; left: number; right: number } | undefined;
  if (srcRect.exists()) {
    const t = srcRect.numAttr(`t`);
    const b = srcRect.numAttr(`b`);
    const l = srcRect.numAttr(`l`);
    const r = srcRect.numAttr(`r`);
    (t !== undefined || b !== undefined || l !== undefined || r !== undefined) &&
      (crop = { top: (t ?? 0) / CROP_DIVISOR, bottom: (b ?? 0) / CROP_DIVISOR, left: (l ?? 0) / CROP_DIVISOR, right: (r ?? 0) / CROP_DIVISOR });
  }
  const spPr = element.child(`spPr`);
  const solid = spPr.child(`solidFill`);
  const grad = spPr.child(`gradFill`);
  const fill = solid.exists() ? solid : grad.exists() ? grad : undefined;
  const lineNode = spPr.child(`ln`);
  const line = lineNode.exists() ? lineNode : undefined;
  const prstGeom = spPr.child(`prstGeom`);
  const presetGeometry = prstGeom.exists() ? prstGeom.attr(`prst`) : undefined;
  const custGeomNode = spPr.child(`custGeom`);
  const customGeometry = custGeomNode.exists() ? custGeomNode : undefined;
  const nvPr = element.child(`nvPicPr`).child(`nvPr`);
  const videoFile = nvPr.child(`videoFile`);
  const audioFile = nvPr.child(`audioFile`);
  const isVideo = videoFile.exists();
  const isAudio = audioFile.exists();
  let mediaRId: string | undefined;
  if (isVideo) mediaRId = videoFile.attr(`link`) ?? videoFile.attr(`r:link`);
  else if (isAudio) mediaRId = audioFile.attr(`link`) ?? audioFile.attr(`r:link`);
  return {
    ...base,
    nodeType: `picture`,
    blipEmbed,
    blipLink,
    crop,
    fill,
    line,
    presetGeometry,
    customGeometry,
    isVideo: isVideo || undefined,
    isAudio: isAudio || undefined,
    mediaRId,
  };
}

/** 原 Fe：tc → 单元格 */
function parseTableCell(tc: XmlNode): PptxTableCell {
  const gridSpan = tc.numAttr(`gridSpan`) ?? 1;
  const rowSpan = tc.numAttr(`rowSpan`) ?? 1;
  const hMerge = parseXmlBool(tc.attr(`hMerge`));
  const vMerge = parseXmlBool(tc.attr(`vMerge`));
  const textBody = parseTextBody(tc.child(`txBody`));
  const tcPr = tc.child(`tcPr`);
  return { gridSpan, rowSpan, hMerge, vMerge, textBody, properties: tcPr.exists() ? tcPr : undefined };
}

/** 原 Ie：tr → 行 */
function parseTableRow(tr: XmlNode): PptxTableRow {
  const height = emuToPx(tr.numAttr(`h`) ?? 0);
  const cells: PptxTableCell[] = [];
  for (const tc of tr.children(`tc`)) cells.push(parseTableCell(tc));
  return { height, cells };
}

/** 原 Le：graphicFrame → tbl 节点 */
function tableNodeOf(element: XmlNode): XmlNode {
  return element.child(`graphic`).child(`graphicData`).child(`tbl`);
}

/** 原 Re：表格样式 id（tableStyleId/tblStyle 多形态） */
function tableStyleIdOf(tblPr: XmlNode): string | undefined {
  const styleId = tblPr.child(`tableStyleId`);
  if (styleId.exists()) return styleId.text() || styleId.attr(`val`) || undefined;
  const tblStyle = tblPr.child(`tblStyle`);
  if (tblStyle.exists()) return tblStyle.attr(`val`) ?? (tblStyle.text() || undefined);
  return tblPr.attr(`tblStyle`) ?? undefined;
}

/** 原 ze：表格节点（列宽/行/属性/样式 id） */
function parseTableElement(element: XmlNode): PptxTableNode {
  const base = parseElementBase(element);
  const tbl = tableNodeOf(element);
  const tblGrid = tbl.child(`tblGrid`);
  const columns: number[] = [];
  for (const gridCol of tblGrid.children(`gridCol`)) columns.push(emuToPx(gridCol.numAttr(`w`) ?? 0));
  const rows: PptxTableRow[] = [];
  for (const tr of tbl.children(`tr`)) rows.push(parseTableRow(tr));
  const tblPr = tbl.child(`tblPr`);
  const tableStyleId = tableStyleIdOf(tblPr);
  return { ...base, nodeType: `table`, columns, rows, properties: tblPr.exists() ? tblPr : undefined, tableStyleId };
}

const GROUP_CHILD_KINDS = new Set([`sp`, `pic`, `grpSp`, `graphicFrame`, `cxnSp`]); // 原 Be/Ue

/** 原 Ve：grpSp → 组节点（子坐标系 + 子元素源） */
function parseGroupElement(element: XmlNode): PptxGroupNode {
  const base = parseElementBase(element);
  const xfrm = element.child(`grpSpPr`).child(`xfrm`);
  const chOff = xfrm.child(`chOff`);
  const chExt = xfrm.child(`chExt`);
  const childOffset = chOff.exists() ? { x: emuToPx(chOff.numAttr(`x`) ?? 0), y: emuToPx(chOff.numAttr(`y`) ?? 0) } : { x: 0, y: 0 };
  const childExtent = (() => {
    if (!chExt.exists()) return { w: base.size.w, h: base.size.h };
    const cx = chExt.numAttr(`cx`);
    const cy = chExt.numAttr(`cy`);
    return { w: cx !== undefined && cx > 0 ? emuToPx(cx) : base.size.w, h: cy !== undefined && cy > 0 ? emuToPx(cy) : base.size.h };
  })();
  const children: XmlNode[] = [];
  for (const child of element.allChildren()) GROUP_CHILD_KINDS.has(child.localName) && children.push(child);
  return { ...base, nodeType: `group`, childOffset, childExtent, children };
}

/** 原 He：graphicFrame(chart) → 图表节点（rels → chart part 路径） */
function parseChartElement(element: XmlNode, rels: Map<string, PptxRelationship>, partPath: string): PptxChartNode | undefined {
  const base = parseElementBase(element);
  const graphicData = element.child(`graphic`).child(`graphicData`);
  let rId: string | undefined;
  for (const child of graphicData.allChildren()) {
    if (child.localName === `chart`) {
      rId = child.attr(`r:id`) || child.attr(`id`);
      break;
    }
  }
  if (!rId) return;
  const rel = rels.get(rId);
  if (!rel) return;
  const chartPath = resolvePartPath(partPath.substring(0, partPath.lastIndexOf(`/`)), rel.target);
  return { ...base, nodeType: `chart`, chartPath };
}

/* --- graphicFrame 分派判定与回退（原 Ge..Ze，jsx 4454-4540） --- */

const NV_PROP_KINDS = [`nvSpPr`, `nvPicPr`, `nvGrpSpPr`, `nvGraphicFramePr`, `nvCxnSpPr`]; // 原 We

/** 原 Ge：占位符判定（含组） */
export function isPlaceholderNode(element: XmlNode): boolean {
  for (const kind of NV_PROP_KINDS) {
    const nv = element.child(kind);
    if (nv.exists() && nv.child(`nvPr`).child(`ph`).exists()) return true;
  }
  return false;
}

/** 原 Ke：graphicFrame 是否表格 */
function isTableFrame(element: XmlNode): boolean {
  return element.child(`graphic`).child(`graphicData`).child(`tbl`).exists();
}

/** 原 qe：graphicData uri 含 chart */
function isChartFrame(element: XmlNode): boolean {
  return (element.child(`graphic`).child(`graphicData`).attr(`uri`) || ``).includes(`chart`);
}

/** 原 Je：graphicData uri 含 diagram（SmartArt） */
function isDiagramFrame(element: XmlNode): boolean {
  return (element.child(`graphic`).child(`graphicData`).attr(`uri`) || ``).includes(`diagram`);
}

/** 原 Ye：路径目录部分 */
function pathDirectory(path: string | undefined): string {
  if (!path) return ``;
  const index = path.lastIndexOf(`/`);
  return index >= 0 ? path.substring(0, index) : ``;
}

/** 原 Xe：OLE 对象 → 内嵌预览图（oleObj pic / AlternateContent） */
function findOlePreviewPicture(element: XmlNode): XmlNode | null {
  const graphicData = element.child(`graphic`).child(`graphicData`);
  if (!(graphicData.attr(`uri`) || ``).includes(`ole`)) return null;
  const hasBlip = (pic: XmlNode) => {
    const blip = pic.child(`blipFill`).child(`blip`);
    return !!(blip.attr(`embed`) ?? blip.attr(`r:embed`) ?? blip.attr(`link`) ?? blip.attr(`r:link`));
  };
  const oleObj = graphicData.child(`oleObj`);
  if (oleObj.exists()) {
    const pic = oleObj.child(`pic`);
    if (pic.exists() && hasBlip(pic)) return pic;
  }
  const alternate = graphicData.child(`AlternateContent`);
  if (!alternate.exists()) return null;
  for (const branch of [`Fallback`, `Choice`]) {
    const branchOle = alternate.child(branch).child(`oleObj`);
    if (!branchOle.exists()) continue;
    const pic = branchOle.child(`pic`);
    if (pic.exists() && hasBlip(pic)) return pic;
  }
  return null;
}

/** 原 Ze：OLE → 图片节点（几何取外壳，内容取预览图） */
function parseOleAsPicture(element: XmlNode): PptxPictureNode | undefined {
  const pic = findOlePreviewPicture(element);
  if (!pic) return;
  const frameProps = parseElementBase(element);
  const pictureProps = parsePictureElement(pic);
  if (!pictureProps.blipEmbed && !pictureProps.blipLink) return;
  return { ...pictureProps, ...frameProps, nodeType: `picture`, source: pic };
}

/** 原 Qe：diagram 绘图 XML → 组节点（无子坐标系） */
function diagramDrawingToGroup(base: Omit<PptxShapeNode, `nodeType` | `adjustments`>, drawingXml: string): PptxGroupNode {
  const spTree = parseXml(drawingXml).child(`spTree`);
  const children: XmlNode[] = [];
  if (spTree.exists()) {
    for (const child of spTree.allChildren()) GROUP_CHILD_KINDS.has(child.localName) && children.push(child);
  }
  return {
    ...base,
    nodeType: `group`,
    childOffset: { x: 0, y: 0 },
    childExtent: { w: Math.max(1, base.size.w), h: Math.max(1, base.size.h) },
    children,
  };
}

/** 元素解析上下文（原 et 第二参数） */
export interface ElementParseContext {
  rels: Map<string, PptxRelationship>;
  partPath?: string;
  diagramDrawings?: Map<string, string>;
  skipPlaceholders?: boolean;
  layout?: PptxSlideLayout;
  master?: PptxSlideMaster;
}

/**
 * 原 $e：SmartArt graphicFrame → 绘图组。
 * 按 rels 中 diagramDrawing 条目匹配（relIds r:dm 的 data 编号就近排序），
 * 命中已缓存的绘图 XML 后包装为组。
 */
function parseDiagramElement(element: XmlNode, ctx: ElementParseContext): PptxGroupNode | undefined {
  if (!ctx.diagramDrawings) return;
  const base = parseElementBase(element);
  const directory = pathDirectory(ctx.partPath);
  const candidates = Array.from(ctx.rels.values())
    .filter((rel) => rel.type.includes(`diagramDrawing`) || rel.target.includes(`diagrams/drawing`))
    .map((rel) => {
      const match = rel.target.match(/drawing(\d+)/);
      return { target: rel.target, num: match ? Number.parseInt(match[1], 10) : undefined };
    });
  const relIds = element.child(`graphic`).child(`graphicData`).child(`relIds`);
  if (relIds.exists()) {
    const dmId = relIds.attr(`r:dm`) ?? relIds.attr(`dm`);
    const dataNum = (dmId ? ctx.rels.get(dmId) : undefined)?.target.match(/data(\d+)/)?.[1];
    if (dataNum) {
      const parsed = Number.parseInt(dataNum, 10);
      candidates.sort(
        (a, b) => (a.num === undefined ? Infinity : Math.abs(a.num - parsed)) - (b.num === undefined ? Infinity : Math.abs(b.num - parsed)),
      );
    }
  }
  for (const candidate of candidates) {
    const resolved = resolvePartPath(directory, candidate.target);
    const drawingXml = ctx.diagramDrawings.get(resolved);
    if (drawingXml) return diagramDrawingToGroup(base, drawingXml);
  }
  return undefined;
}

/**
 * 原 et：spTree 子元素 → 节点模型分派。
 * sp/cxnSp → 形状；pic → 图片；grpSp → 组；
 * graphicFrame → 表格/图表/SmartArt/OLE 预览图。
 */
export function parseSlideElement(element: XmlNode, ctx: ElementParseContext): PptxNode | undefined {
  if (!(ctx.skipPlaceholders && isPlaceholderNode(element))) {
    switch (element.localName) {
      case `sp`:
      case `cxnSp`:
        return parseShapeElement(element);
      case `pic`:
        return parsePictureElement(element);
      case `grpSp`:
        return parseGroupElement(element);
      case `graphicFrame`:
        return isTableFrame(element)
          ? parseTableElement(element)
          : isChartFrame(element)
            ? parseChartElement(element, ctx.rels, ctx.partPath ?? ``)
            : isDiagramFrame(element)
              ? parseDiagramElement(element, ctx)
              : parseOleAsPicture(element);
      default:
        return;
    }
  }
  return undefined;
}

/* --- 幻灯片解析（原 tt..at，jsx 4571-4624） --- */

/** 原 nt：rels → slideLayout 目标 */
function slideLayoutTarget(rels: Map<string, PptxRelationship>): string {
  for (const [, rel] of rels) if (rel.type.includes(`slideLayout`)) return rel.target;
  return ``;
}

/** 原 rt：幻灯片全量解析（节点即时物化） */
function parseSlide(
  slideRoot: XmlNode,
  index: number,
  rels: Map<string, PptxRelationship>,
  slidePath = ``,
  diagramDrawings?: Map<string, string>,
): PptxSlide {
  const cSld = slideRoot.child(`cSld`);
  const bg = cSld.child(`bg`);
  const background = bg.exists() ? bg : undefined;
  const spTree = cSld.child(`spTree`);
  const nodes: PptxNode[] = [];
  for (const child of spTree.allChildren()) {
    const node = parseSlideElement(child, { rels, partPath: slidePath, diagramDrawings });
    node && nodes.push(node);
  }
  const layoutIndex = slideLayoutTarget(rels);
  const showMasterSp = parseXmlBoolDefaultTrue(slideRoot.attr(`showMasterSp`));
  return {
    index,
    hidden: !parseXmlBoolDefaultTrue(slideRoot.attr(`show`)),
    nodes,
    background,
    layoutIndex,
    rels,
    slidePath,
    showMasterSp,
    nodesMaterialized: true,
  };
}

/** 原 it：懒幻灯片占位（仅登记，节点延后物化） */
function parseSlideLazy(sourceXml: string, index: number, rels: Map<string, PptxRelationship>, slidePath = ``): PptxSlide {
  return {
    index,
    nodes: [],
    layoutIndex: slideLayoutTarget(rels),
    rels,
    slidePath,
    showMasterSp: true,
    sourceXml,
    nodesMaterialized: false,
  };
}

/** 原 at：懒幻灯片物化（保留已解析的 layoutIndex） */
function materializeSlide(slide: PptxSlide, diagramDrawings?: Map<string, string>): void {
  if (slide.nodesMaterialized) return;
  if (!slide.sourceXml) {
    slide.nodesMaterialized = true;
    return;
  }
  const previousLayout = slide.layoutIndex;
  const parsed = parseSlide(parseXml(slide.sourceXml), slide.index, slide.rels, slide.slidePath, diagramDrawings);
  slide.hidden = parsed.hidden;
  slide.nodes = parsed.nodes;
  slide.background = parsed.background;
  slide.layoutIndex = previousLayout || parsed.layoutIndex;
  slide.showMasterSp = parsed.showMasterSp;
  slide.nodesMaterialized = true;
  slide.sourceXml = undefined;
}

/* ============================================================================
 * 演示文稿模型构建（原 ot..dt，jsx 4625-4790）
 * ==========================================================================*/

/** 原 ct：WPS 出品判定 */
function isWpsPresentation(xml: string): boolean {
  return xml.includes(`wps`) || xml.includes(`kso`) || xml.includes(`Kingsoft`) || xml.includes(`WPS`);
}

/** 原 lt：rels 中首个指定类型条目 */
function firstRelOfType(rels: Map<string, PptxRelationship>, typePart: string): PptxRelationship | undefined {
  for (const [, rel] of rels) if (rel.type.includes(typePart)) return rel;
  return undefined;
}

/** 原 ut：rels 中全部指定类型条目 */
function relsOfType(rels: Map<string, PptxRelationship>, typePart: string): [string, PptxRelationship][] {
  const out: [string, PptxRelationship][] = [];
  for (const [id, rel] of rels) rel.type.includes(typePart) && out.push([id, rel]);
  return out;
}

/**
 * 原 dt：归档 → 演示文稿模型。
 * 主题/母版/版式/图表（含 chartStyle/chartColorStyle/themeOverride）解析，
 * sldIdLst 定序（缺失时按文件名数字回退），lazySlides 延迟物化。
 */
export function buildPresentationModel(archive: PptxArchive, options: { lazySlides?: boolean } = {}): PptxPresentation {
  const presentationRoot = parseXml(archive.presentation);
  const presentationRels = parseRels(archive.presentationRels);
  const sldSz = presentationRoot.child(`sldSz`);
  const width = emuToPx(sldSz.numAttr(`cx`) ?? 9144e3);
  const height = emuToPx(sldSz.numAttr(`cy`) ?? 6858e3);
  const isWps = isWpsPresentation(archive.presentation);
  const defaultTextStyleNode = presentationRoot.child(`defaultTextStyle`);
  const themes = new Map<string, PptxTheme>();
  for (const [path, xml] of archive.themes) {
    themes.set(path, parseTheme(parseXml(xml)));
  }
  const masters = new Map<string, PptxSlideMaster>();
  const masterToTheme = new Map<string, string>();
  for (const [path, xml] of archive.slideMasters) {
    const master = parseSlideMaster(parseXml(xml));
    const relsXml = archive.slideMasterRels.get(partRelsPath(path));
    if (relsXml) {
      const rels = parseRels(relsXml);
      master.rels = rels;
      const themeRel = firstRelOfType(rels, `theme`);
      if (themeRel) masterToTheme.set(path, resolvePartPath(partDirectory(path), themeRel.target));
    }
    masters.set(path, master);
  }
  const layouts = new Map<string, PptxSlideLayout>();
  const layoutToMaster = new Map<string, string>();
  for (const [path, xml] of archive.slideLayouts) {
    const layout = parseSlideLayout(parseXml(xml));
    const relsXml = archive.slideLayoutRels.get(partRelsPath(path));
    if (relsXml) {
      const rels = parseRels(relsXml);
      layout.rels = rels;
      const masterRel = firstRelOfType(rels, `slideMaster`);
      if (masterRel) layoutToMaster.set(path, resolvePartPath(partDirectory(path), masterRel.target));
    }
    layouts.set(path, layout);
  }
  const charts = new Map<string, XmlNode>();
  const chartThemes = new Map<string, PptxTheme>();
  const chartStyles = new Map<string, XmlNode>();
  const chartColorStyles = new Map<string, XmlNode>();
  for (const [path, xml] of archive.charts) {
    const chartRoot = parseXml(xml);
    chartRoot.exists() && charts.set(path, chartRoot);
    const relsXml = archive.chartRels?.get(partRelsPath(path));
    if (!relsXml) continue;
    const rels = parseRels(relsXml);
    const styleRel = firstRelOfType(rels, `chartStyle`);
    if (styleRel) {
      const stylePath = resolvePartPath(partDirectory(path), styleRel.target);
      const styleXml = archive.chartStyles?.get(stylePath);
      if (styleXml) {
        const styleRoot = parseXml(styleXml);
        styleRoot.exists() && chartStyles.set(path, styleRoot);
      }
    }
    const colorRel = firstRelOfType(rels, `chartColorStyle`);
    if (colorRel) {
      const colorPath = resolvePartPath(partDirectory(path), colorRel.target);
      const colorXml = archive.chartColors?.get(colorPath);
      if (colorXml) {
        const colorRoot = parseXml(colorXml);
        colorRoot.exists() && chartColorStyles.set(path, colorRoot);
      }
    }
    const overrideRel = firstRelOfType(rels, `themeOverride`);
    if (!overrideRel) continue;
    const overridePath = resolvePartPath(partDirectory(path), overrideRel.target);
    const overrideXml = archive.themeOverrides?.get(overridePath) ?? archive.themes.get(overridePath);
    if (!overrideXml) continue;
    const overrideRoot = parseXml(overrideXml);
    overrideRoot.exists() && chartThemes.set(path, parseTheme(overrideRoot));
  }
  const sldIdLst = presentationRoot.child(`sldIdLst`);
  const slidePaths: string[] = [];
  for (const sldId of sldIdLst.children(`sldId`)) {
    const rId = sldId.attr(`r:id`) ?? sldId.attr(`id`);
    if (rId) {
      const rel = presentationRels.get(rId);
      if (rel) slidePaths.push(resolvePartPath(`ppt`, rel.target));
    }
  }
  if (slidePaths.length === 0) {
    const slideRels = relsOfType(presentationRels, `slide`);
    slideRels.sort(
      (a, b) => (parseInt(a[0].replace(/\D/g, ``), 10) || 0) - (parseInt(b[0].replace(/\D/g, ``), 10) || 0),
    );
    for (const [, rel] of slideRels) {
      if (rel.type.includes(`/slide`) && !rel.type.includes(`slideLayout`) && !rel.type.includes(`slideMaster`)) {
        slidePaths.push(resolvePartPath(`ppt`, rel.target));
      }
    }
  }
  const slides: PptxSlide[] = [];
  const slideToLayout = new Map<number, string>();
  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const slideXml = archive.slides.get(slidePath);
    if (!slideXml) continue;
    const relsXml = archive.slideRels.get(partRelsPath(slidePath));
    const rels = relsXml ? parseRels(relsXml) : new Map<string, PptxRelationship>();
    const slide = options.lazySlides ? parseSlideLazy(slideXml, i, rels, slidePath) : parseSlide(parseXml(slideXml), i, rels, slidePath, archive.diagramDrawings);
    if (slide.layoutIndex) {
      const resolved = resolvePartPath(partDirectory(slidePath), slide.layoutIndex);
      slide.layoutIndex = resolved;
      slideToLayout.set(i, resolved);
    }
    slides.push(slide);
  }
  let tableStyles: XmlNode | undefined;
  if (archive.tableStyles) {
    const parsed = parseXml(archive.tableStyles);
    parsed.exists() && (tableStyles = parsed);
  }
  const presentation: PptxPresentation = {
    width,
    height,
    slides,
    layouts,
    masters,
    themes,
    slideToLayout,
    layoutToMaster,
    masterToTheme,
    media: archive.media,
    mediaResolver: archive.mediaResolver,
    tableStyles,
    defaultTextStyle: defaultTextStyleNode.exists() ? defaultTextStyleNode : undefined,
    charts,
    diagramDrawings: archive.diagramDrawings,
    chartThemes,
    chartStyles,
    chartColorStyles,
    isWps,
  };
  options.lazySlides || resolveAllPlaceholderInheritance(presentation);
  return presentation;
}

/* ============================================================================
 * 占位符继承（原 ft..wt，jsx 4791-4935）
 * ==========================================================================*/

/** 原 ft：元素 ph 类型/序号（全 nv 形态） */
function placeholderIdentity(element: XmlNode): { type?: string; idx?: number } {
  for (const kind of NV_PROP_KINDS) {
    const nv = element.child(kind);
    if (nv.exists()) {
      const ph = nv.child(`nvPr`).child(`ph`);
      if (ph.exists()) {
        const type = ph.attr(`type`);
        const idxRaw = ph.attr(`idx`);
        const idx = idxRaw === undefined ? undefined : Number(idxRaw);
        return { type, idx: idx !== undefined && !isNaN(idx) ? idx : undefined };
      }
    }
  }
  return {};
}

/** 原 pt：元素显式 xfrm（位置+尺寸） */
function explicitXfrm(element: XmlNode): { position: { x: number; y: number }; size: { w: number; h: number } } | undefined {
  const spPrXfrm = element.child(`spPr`).child(`xfrm`);
  const xfrm = spPrXfrm.exists() ? spPrXfrm : element.child(`xfrm`);
  if (xfrm.exists()) {
    const off = xfrm.child(`off`);
    const ext = xfrm.child(`ext`);
    const x = off.numAttr(`x`);
    const cx = ext.numAttr(`cx`);
    if (x !== undefined && cx !== undefined) {
      return {
        position: { x: emuToPx(off.numAttr(`x`) ?? 0), y: emuToPx(off.numAttr(`y`) ?? 0) },
        size: { w: emuToPx(ext.numAttr(`cx`) ?? 0), h: emuToPx(ext.numAttr(`cy`) ?? 0) },
      };
    }
  }
  return undefined;
}

/**
 * 原 mt：占位符匹配——类型+序号精确 > 类型首个 > 仅序号；
 * 类型缺省时按序号回退匹配。
 */
function matchPlaceholder(entries: PptxPlaceholderEntry[], type?: string, idx?: number): PptxPlaceholderEntry | undefined {
  let firstByType: PptxPlaceholderEntry | undefined;
  for (const entry of entries) {
    const identity = placeholderIdentity(entry.node);
    if (
      (type !== undefined && identity.type === type && idx !== undefined && identity.idx === idx) ||
      (type !== undefined && identity.type === type && !firstByType && ((firstByType = entry), false)) ||
      (idx !== undefined && identity.idx === idx && type === undefined && identity.type === undefined)
    )
      return entry;
  }
  if (type === undefined && idx !== undefined) {
    for (const entry of entries) if (placeholderIdentity(entry.node).idx === idx) return entry;
  }
  return firstByType;
}

/** 原 ht：母版占位符条目（含绝对坐标） */
function masterPlaceholderEntries(master: PptxSlideMaster): PptxPlaceholderEntry[] {
  return master.placeholderEntries ?? master.placeholders.map((node) => ({ node }));
}

/** 原 gt：全文稿占位符继承解析 */
function resolveAllPlaceholderInheritance(presentation: PptxPresentation): void {
  for (let i = 0; i < presentation.slides.length; i++) resolveSlidePlaceholderInheritance(presentation, presentation.slides[i]);
}

/** 原 _t：单幻灯片继承（版式 → 母版） */
function resolveSlidePlaceholderInheritance(presentation: PptxPresentation, slide: PptxSlide): void {
  if (slide.placeholderInheritanceResolved) return;
  const layoutPath = presentation.slideToLayout.get(slide.index) || slide.layoutIndex;
  const layout = layoutPath ? presentation.layouts.get(layoutPath) : undefined;
  const masterPath = layoutPath ? presentation.layoutToMaster.get(layoutPath) : undefined;
  const master = masterPath ? presentation.masters.get(masterPath) : undefined;
  applyPlaceholderInheritance(slide.nodes, layout, master);
  slide.placeholderInheritanceResolved = true;
}

/**
 * 原 vt：幻灯片就绪化——懒物化 + 占位符继承（渲染前必调）。
 */
export function ensureSlideReady(presentation: PptxPresentation, slide: PptxSlide): void {
  materializeSlide(slide, presentation.diagramDrawings);
  resolveSlidePlaceholderInheritance(presentation, slide);
}

/** 原 yt：占位符源元素的 bodyPr */
function placeholderBodyProperties(element: XmlNode): XmlNode | undefined {
  const txBody = element.child(`txBody`);
  if (!txBody.exists()) return;
  const bodyPr = txBody.child(`bodyPr`);
  return bodyPr.exists() ? bodyPr : undefined;
}

/** 原 bt：占位符类型回填（自身缺类型时取源） */
function backfillPlaceholderType(placeholder: { type?: string; idx?: number }, sourceNode: XmlNode): void {
  if (placeholder.type) return;
  const identity = placeholderIdentity(sourceNode);
  identity.type && (placeholder.type = identity.type);
}

/** 原 xt：绝对坐标 → 组内子坐标（逆变换） */
function toGroupChildCoords(
  bounds: { position: { x: number; y: number }; size: { w: number; h: number } },
  group: PptxGroupNode,
): { position: { x: number; y: number }; size: { w: number; h: number } } {
  const scaleX = group.childExtent.w > 0 ? group.size.w / group.childExtent.w : 1;
  const scaleY = group.childExtent.h > 0 ? group.size.h / group.childExtent.h : 1;
  if (scaleX === 0 || scaleY === 0) return bounds;
  return {
    position: {
      x: group.childOffset.x + (bounds.position.x - group.position.x) / scaleX,
      y: group.childOffset.y + (bounds.position.y - group.position.y) / scaleY,
    },
    size: { w: bounds.size.w / scaleX, h: bounds.size.h / scaleY },
  };
}

/** 原 St：组内节点时换算为子坐标 */
function applyParentGroupCoords(
  bounds: { position: { x: number; y: number }; size: { w: number; h: number } },
  options: { parentGroup?: PptxGroupNode },
): { position: { x: number; y: number }; size: { w: number; h: number } } {
  return options.parentGroup ? toGroupChildCoords(bounds, options.parentGroup) : bounds;
}

/**
 * 原 Ct：单节点占位符继承——
 * 版式匹配优先（补类型/继承几何/布局 bodyPr），未命中回退母版；
 * 零尺寸节点整体继承几何，贴顶节点仅继承位置。
 */
export function applyPlaceholderInheritanceToNode(
  node: PptxNode,
  layout: PptxSlideLayout | undefined,
  master: PptxSlideMaster | undefined,
  options: { parentGroup?: PptxGroupNode } = {},
): void {
  if (!node.placeholder) return;
  const { type, idx } = node.placeholder;
  const masterMatch = () => (master ? matchPlaceholder(masterPlaceholderEntries(master), node.placeholder?.type ?? type, idx) : undefined);
  const zeroSized = node.size.w === 0 && node.size.h === 0;
  const atTop = node.position.y < 5;
  if (layout) {
    const layoutMatch = matchPlaceholder(layout.placeholders, type, idx);
    if (layoutMatch) {
      backfillPlaceholderType(node.placeholder, layoutMatch.node);
      const bounds = layoutMatch.absoluteXfrm ?? explicitXfrm(layoutMatch.node);
      if (bounds) {
        const adjusted = applyParentGroupCoords(bounds, options);
        zeroSized ? ((node.position = adjusted.position), (node.size = adjusted.size)) : atTop && (node.position = adjusted.position);
      }
      if (`textBody` in node && node.textBody) {
        const bodyPr = placeholderBodyProperties(layoutMatch.node);
        bodyPr && (node.textBody.layoutBodyProperties = bodyPr);
      }
      if (bounds) {
        const fallback = masterMatch();
        if (fallback) {
          backfillPlaceholderType(node.placeholder, fallback.node);
          if (`textBody` in node && node.textBody && !node.textBody.layoutBodyProperties) {
            const bodyPr = placeholderBodyProperties(fallback.node);
            bodyPr && (node.textBody.layoutBodyProperties = bodyPr);
          }
          return;
        }
      }
    }
  }
  const fallback = masterMatch();
  if (fallback) {
    backfillPlaceholderType(node.placeholder, fallback.node);
    const bounds = fallback.absoluteXfrm ?? explicitXfrm(fallback.node);
    if (bounds) {
      const adjusted = applyParentGroupCoords(bounds, options);
      zeroSized ? ((node.position = adjusted.position), (node.size = adjusted.size)) : atTop && (node.position = adjusted.position);
    }
    if (`textBody` in node && node.textBody && !node.textBody.layoutBodyProperties) {
      const bodyPr = placeholderBodyProperties(fallback.node);
      bodyPr && (node.textBody.layoutBodyProperties = bodyPr);
    }
  }
}

/** 原 wt：节点列表批量继承 */
export function applyPlaceholderInheritance(nodes: PptxNode[], layout: PptxSlideLayout | undefined, master: PptxSlideMaster | undefined): void {
  for (const node of nodes) node.nodeType === `group` && `children` in node, applyPlaceholderInheritanceToNode(node, layout, master);
}

/* ============================================================================
 * 渲染上下文（原 Tt，jsx 4936-4982）
 * ==========================================================================*/

/** 原 Tt：幻灯片渲染上下文构建（主题链 版式→母版→主题，缺省兜底） */
export function createRenderContext(
  presentation: PptxPresentation,
  slide: PptxSlide,
  mediaUrlCache?: Map<string, string>,
  chartInstances?: Set<PptxChartInstance>,
  pdfjs?: PptxRenderContext[`pdfjs`],
  signal?: AbortSignal,
): PptxRenderContext {
  const layoutPath = presentation.slideToLayout.get(slide.index) || ``;
  const masterPath = presentation.layoutToMaster.get(layoutPath) || ``;
  const themePath = presentation.masterToTheme.get(masterPath) || ``;
  const layout: PptxSlideLayout = presentation.layouts.get(layoutPath) || {
    placeholders: [],
    spTree: {} as unknown as XmlNode,
    rels: new Map(),
    showMasterSp: true,
  };
  const master: PptxSlideMaster = presentation.masters.get(masterPath) || {
    colorMap: new Map(),
    textStyles: {},
    placeholders: [],
    placeholderEntries: [],
    spTree: {} as unknown as XmlNode,
    rels: new Map(),
  };
  return {
    presentation,
    slide,
    theme: presentation.themes.get(themePath) || {
      colorScheme: new Map(),
      majorFont: { latin: `Calibri`, ea: ``, cs: `` },
      minorFont: { latin: `Calibri`, ea: ``, cs: `` },
      fillStyles: [],
      bgFillStyles: [],
      lineStyles: [],
      effectStyles: [],
    },
    master,
    layout,
    partPath: slide.slidePath,
    layoutPath,
    masterPath,
    mediaUrlCache: mediaUrlCache ?? new Map(),
    colorCache: new Map(),
    pdfjs,
    signal,
    chartInstances,
  };
}

/* ============================================================================
 * 节点渲染分派与幻灯片渲染（原 bq..Eq，jsx 44266-44578）
 * ==========================================================================*/

/**
 * 原 bq：节点类型 → 渲染器分派。
 * 组渲染以本分派器递归（第三参），图表注入 echarts 运行时。
 */
export function renderNode(node: PptxNode, ctx: PptxRenderContext): HTMLElement {
  switch (node.nodeType) {
    case `shape`:
      return renderShapeNode(node, ctx);
    case `picture`:
      return renderPictureNode(node, ctx);
    case `table`:
      return renderTableNode(node, ctx);
    case `group`:
      return renderGroupNode(node, ctx, renderNode, buildGroupChildNode);
    case `chart`:
      return renderChartNode(node, ctx, requireEchartsInit());
    default: {
      const unknown = node as unknown as { position: { x: number; y: number }; size: { w: number; h: number } };
      const box = document.createElement(`div`);
      box.style.position = `absolute`;
      box.style.left = `${unknown.position.x}px`;
      box.style.top = `${unknown.position.y}px`;
      box.style.width = `${unknown.size.w}px`;
      box.style.height = `${unknown.size.h}px`;
      return box;
    }
  }
}

/** 原 kc 等价：组子元素 → 节点模型（解析 + 占位符继承，主文件提供） */
function buildGroupChildNode(source: XmlNode, ctx: PptxRenderContext, group: PptxGroupNode): PptxNode | null {
  const node = parseSlideElement(source, {
    rels: ctx.slide.rels,
    partPath: ctx.partPath ?? ctx.slide.slidePath,
    diagramDrawings: ctx.presentation.diagramDrawings,
    skipPlaceholders: ctx.skipPlaceholderChildren,
  });
  node && applyPlaceholderInheritanceToNode(node, ctx.layout, ctx.master, { parentGroup: group });
  return node ?? null;
}

/** 原 xq：节点渲染错误占位框 */
function renderNodeErrorBox(node: PptxNode): HTMLElement {
  const box = document.createElement(`div`);
  box.style.position = `absolute`;
  box.style.left = `${node.position.x}px`;
  box.style.top = `${node.position.y}px`;
  box.style.width = `${node.size.w}px`;
  box.style.height = `${node.size.h}px`;
  box.style.border = `2px dashed #ff4444`;
  box.style.backgroundColor = `rgba(255,68,68,0.08)`;
  box.style.display = `flex`;
  box.style.alignItems = `center`;
  box.style.justifyContent = `center`;
  box.style.color = `#cc0000`;
  box.style.fontSize = `11px`;
  box.style.fontFamily = `monospace`;
  box.style.overflow = `hidden`;
  box.style.boxSizing = `border-box`;
  box.style.padding = `4px`;
  box.textContent = `Render Error`;
  box.title = `Failed to render node: ${node.id} (${node.name})`;
  return box;
}

/* --- 母版/版式子节点缓存（原 Sq..wq，jsx 44433-44452） --- */

const spTreeChildCache = new WeakMap<object, { nodes: PptxNode[]; rels: Map<string, PptxRelationship>; partPath: string; diagramDrawings?: Map<string, string> }>(); // 原 Sq

/** 原 Cq：spTree 子节点解析（跳过占位符，过滤零尺寸） */
function parseSpTreeChildren(
  spTree: XmlNode | undefined,
  rels: Map<string, PptxRelationship> | undefined,
  partPath: string,
  diagramDrawings?: Map<string, string>,
): PptxNode[] {
  const out: PptxNode[] = [];
  if (!spTree || !spTree.exists || !spTree.exists()) return out;
  const ctx: ElementParseContext = { rels: rels ?? new Map(), partPath, diagramDrawings };
  for (const child of spTree.allChildren()) {
    if (isPlaceholderNode(child)) continue;
    try {
      const node = parseSlideElement(child, ctx);
      node && (node.size.w > 0 || node.size.h > 0) && out.push(node);
    } catch {
      /* 单元素失败忽略 */
    }
  }
  return out;
}

/** 原 wq：带缓存的 spTree 子节点解析 */
function cachedSpTreeChildren(
  spTree: XmlNode,
  rels: Map<string, PptxRelationship>,
  partPath: string,
  diagramDrawings?: Map<string, string>,
): PptxNode[] {
  const cached = spTreeChildCache.get(spTree as unknown as object);
  if (cached && cached.rels === rels && cached.partPath === partPath && cached.diagramDrawings === diagramDrawings) return cached.nodes;
  const nodes = parseSpTreeChildren(spTree, rels, partPath, diagramDrawings);
  spTreeChildCache.set(spTree as unknown as object, { nodes, rels, partPath, diagramDrawings });
  return nodes;
}

/**
 * 原 Tq：未连接宿主的离屏挂载（文本测量用）——
 * fixed 移出视口 + contain 隔离，返回还原函数。
 */
function mountOffscreenForMeasurement(el: HTMLElement): () => void {
  if (el.isConnected) return () => {};
  const saved = {
    position: el.style.position,
    left: el.style.left,
    top: el.style.top,
    visibility: el.style.visibility,
    pointerEvents: el.style.pointerEvents,
    contain: el.style.contain,
  };
  el.style.position = `fixed`;
  el.style.left = `-100000px`;
  el.style.top = `0`;
  el.style.visibility = `hidden`;
  el.style.pointerEvents = `none`;
  el.style.contain = `layout style paint`;
  document.body.appendChild(el);
  return () => {
    el.parentNode === document.body && document.body.removeChild(el);
    el.style.position = saved.position;
    el.style.left = saved.left;
    el.style.top = saved.top;
    el.style.visibility = saved.visibility;
    el.style.pointerEvents = saved.pointerEvents;
    el.style.contain = saved.contain;
  };
}

/** renderSlide 选项（原 Eq 第三参数） */
export interface RenderSlideOptions {
  mediaUrlCache?: Map<string, string>;
  chartInstances?: Set<PptxChartInstance>;
  pdfjs?: PptxRenderContext[`pdfjs`];
  onNavigate?: (nav: { slideIndex?: number; url?: string }) => void;
  onNodeError?: (nodeId: string, error: unknown) => void;
}

/**
 * 原 Eq：幻灯片渲染——
 *  1) 就绪化（懒物化+继承）后建上下文（独立 AbortController + 异步任务收集）；
 *  2) 宿主离屏挂载完成文本测量后还原；
 *  3) 背景 → 母版层（showMasterSp 双开关，跳过占位符）→ 版式层 → 幻灯片节点；
 *  4) 返回 {element, ready, dispose}：dispose 中止异步、释放图表实例、
 *     非共享 mediaUrlCache 时回收 objectURL。
 */
export function renderSlide(presentation: PptxPresentation, slide: PptxSlide, options?: RenderSlideOptions): PptxRenderResult {
  ensureSlideReady(presentation, slide);
  const ownsMediaCache = !!(options != null && options.mediaUrlCache);
  const chartInstances = options?.chartInstances ?? new Set<PptxChartInstance>();
  const asyncTasks: Promise<unknown>[] = [];
  const controller = new AbortController();
  const ctx = createRenderContext(presentation, slide, options?.mediaUrlCache, chartInstances, options?.pdfjs, controller.signal);
  ctx.asyncTasks = asyncTasks;
  options != null && options.onNavigate && (ctx.onNavigate = options.onNavigate);
  const host = document.createElement(`div`);
  host.style.position = `relative`;
  host.style.width = `${presentation.width}px`;
  host.style.height = `${presentation.height}px`;
  host.style.overflow = `hidden`;
  host.style.backgroundColor = `#FFFFFF`;
  ctx.measurementRoot = host;
  const unmount = mountOffscreenForMeasurement(host);
  try {
    try {
      renderSlideBackground(ctx, host);
    } catch (error) {
      options?.onNodeError?.(`__background__`, error);
    }
    if (slide.showMasterSp && ctx.layout.showMasterSp) {
      const masterCtx: PptxRenderContext = {
        ...ctx,
        slide: { ...ctx.slide, rels: ctx.master.rels },
        partPath: ctx.masterPath,
        skipPlaceholderChildren: true,
      };
      const masterNodes = cachedSpTreeChildren(ctx.master.spTree, ctx.master.rels, ctx.masterPath, presentation.diagramDrawings);
      for (const node of masterNodes) {
        try {
          const element = renderNode(node, masterCtx);
          host.appendChild(element);
        } catch {
          /* 母版元素失败忽略 */
        }
      }
    }
    if (slide.showMasterSp) {
      const layoutCtx: PptxRenderContext = {
        ...ctx,
        slide: { ...ctx.slide, rels: ctx.layout.rels },
        partPath: ctx.layoutPath,
        skipPlaceholderChildren: true,
      };
      const layoutNodes = cachedSpTreeChildren(ctx.layout.spTree, ctx.layout.rels, ctx.layoutPath, presentation.diagramDrawings);
      for (const node of layoutNodes) {
        try {
          const element = renderNode(node, layoutCtx);
          host.appendChild(element);
        } catch {
          /* 版式元素失败忽略 */
        }
      }
    }
    for (const node of slide.nodes) {
      try {
        const element = renderNode(node, ctx);
        host.appendChild(element);
      } catch (error) {
        options?.onNodeError?.(node.id, error);
        host.appendChild(renderNodeErrorBox(node));
      }
    }
  } finally {
    unmount();
  }
  let disposed = false;
  const mediaCache = ctx.mediaUrlCache;
  const ready = Promise.allSettled(asyncTasks).then(() => {});
  const dispose = () => {
    if (!disposed) {
      disposed = true;
      controller.abort();
      if (chartInstances) {
        for (const instance of chartInstances) {
          !instance.isDisposed() && host.contains(instance.getDom()) && (instance.dispose(), chartInstances.delete(instance));
        }
      }
      if (!ownsMediaCache) {
        for (const url of mediaCache.values()) URL.revokeObjectURL(url);
        mediaCache.clear();
      }
    }
  };
  return {
    element: host,
    ready,
    dispose,
    [Symbol.dispose]() {
      dispose();
    },
  };
}

/* ============================================================================
 * 文本条目收集（原 Dq..Bq + Vq，jsx 44453-44578）
 * 供 AI 编辑/检索使用：逐形状/表格单元格/组递归提取可见文本与边界。
 * ==========================================================================*/

/** 文本条目选项（原 Dq 缺省） */
interface TextEntryOptions {
  includeShapes: boolean;
  includeTables: boolean;
  includeGroups: boolean;
}

const DEFAULT_TEXT_ENTRY_OPTIONS: TextEntryOptions = { includeShapes: true, includeTables: true, includeGroups: true }; // 原 Dq

/** 组坐标换算参数（原 Oq 缺省） */
interface GroupOffsetTransform {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

const IDENTITY_OFFSET_TRANSFORM: GroupOffsetTransform = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }; // 原 Oq

/** 文本条目（Bq 结果元素） */
export interface PptxTextEntry {
  slideIndex: number;
  nodeId: string;
  nodePath: string;
  nodeType: string;
  textKind: `shape` | `table-cell`;
  text: string;
  bounds: { x: number; y: number; w: number; h: number };
  rowIndex?: number;
  cellIndex?: number;
}

/** 原 kq：文本体 → 纯文本（段落换行） */
function textBodyToText(textBody: PptxTextBody | undefined): string {
  return textBody ? textBody.paragraphs.map((p) => p.runs.map((r) => r.text).join(``)).join(`\n`) : ``;
}

/** 原 Aq：单元格文本 */
function cellText(cell: { textBody?: PptxTextBody }): string {
  return textBodyToText(cell.textBody);
}

/** 原 jq：节点边界按组换算 */
function nodeBounds(node: PptxNode, transform: GroupOffsetTransform = IDENTITY_OFFSET_TRANSFORM): { x: number; y: number; w: number; h: number } {
  return {
    x: transform.offsetX + node.position.x * transform.scaleX,
    y: transform.offsetY + node.position.y * transform.scaleY,
    w: node.size.w * transform.scaleX,
    h: node.size.h * transform.scaleY,
  };
}

/** 原 Mq：非空白判定 */
function hasVisibleText(text: string): boolean {
  return text.trim().length > 0;
}

/** 原 Nq：90/270 度判定 */
function isQuarterTurn(rotation: number): boolean {
  const normalized = ((rotation % 360) + 360) % 360;
  return Math.abs(normalized - 90) < 1e-4 || Math.abs(normalized - 270) < 1e-4;
}

/** 原 Pq：子元素解析 + 占位符继承（组内坐标） */
function parseEntryChild(source: XmlNode, ctx: ElementParseContext, skipPlaceholders = false, parentGroup?: PptxGroupNode): PptxNode | undefined {
  const node = parseSlideElement(source, { ...ctx, skipPlaceholders });
  node && applyPlaceholderInheritanceToNode(node, ctx.layout, ctx.master, { parentGroup });
  return node;
}

/** 原 Fq：组 → 子节点换算参数（含 90/270 旋转修正） */
function groupChildTransform(group: PptxGroupNode, child: PptxNode, parent: GroupOffsetTransform): GroupOffsetTransform {
  if (group.childExtent.w <= 0 || group.childExtent.h <= 0) {
    return {
      offsetX: parent.offsetX + group.position.x * parent.scaleX,
      offsetY: parent.offsetY + group.position.y * parent.scaleY,
      scaleX: parent.scaleX,
      scaleY: parent.scaleY,
    };
  }
  const scaleX = group.childExtent.w > 0 ? group.size.w / group.childExtent.w : 1;
  const scaleY = group.childExtent.h > 0 ? group.size.h / group.childExtent.h : 1;
  if (isQuarterTurn(child.rotation)) {
    const squareX = child.position.x + (child.size.w - child.size.h) / 2;
    const squareY = child.position.y + (child.size.h - child.size.w) / 2;
    const swappedSize = { w: child.size.w * scaleY, h: child.size.h * scaleX };
    const adjusted = {
      x: (squareX - group.childOffset.x) * scaleX - (swappedSize.w - swappedSize.h) / 2,
      y: (squareY - group.childOffset.y) * scaleY - (swappedSize.h - swappedSize.w) / 2,
    };
    const combinedScaleX = parent.scaleX * scaleY;
    const combinedScaleY = parent.scaleY * scaleX;
    return {
      offsetX: parent.offsetX + (group.position.x + adjusted.x) * parent.scaleX - child.position.x * combinedScaleX,
      offsetY: parent.offsetY + (group.position.y + adjusted.y) * parent.scaleY - child.position.y * combinedScaleY,
      scaleX: combinedScaleX,
      scaleY: combinedScaleY,
    };
  }
  return {
    offsetX: parent.offsetX + (group.position.x - group.childOffset.x * scaleX) * parent.scaleX,
    offsetY: parent.offsetY + (group.position.y - group.childOffset.y * scaleY) * parent.scaleY,
    scaleX: parent.scaleX * scaleX,
    scaleY: parent.scaleY * scaleY,
  };
}

/** 原 Iq：形状文本条目 */
function pushShapeTextEntry(out: PptxTextEntry[], slideIndex: number, node: PptxShapeNode, nodePath: string, transform: GroupOffsetTransform): void {
  const text = textBodyToText(node.textBody);
  hasVisibleText(text) &&
    out.push({ slideIndex, nodeId: node.id, nodePath, nodeType: node.nodeType, textKind: `shape`, text, bounds: nodeBounds(node, transform) });
}

/** 原 Lq：表格单元格文本条目 */
function pushTableTextEntries(out: PptxTextEntry[], slideIndex: number, node: PptxTableNode, nodePath: string, transform: GroupOffsetTransform): void {
  node.rows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, cellIndex) => {
      const text = cellText(cell);
      hasVisibleText(text) &&
        out.push({
          slideIndex,
          nodeId: node.id,
          nodePath: `${nodePath}/rows/${rowIndex}/cells/${cellIndex}`,
          nodeType: node.nodeType,
          textKind: `table-cell`,
          text,
          bounds: nodeBounds(node, transform),
          rowIndex,
          cellIndex,
        });
    });
  });
}

/** 原 Rq：节点递归收集（组 → 子换算） */
function collectNodeTextEntries(
  out: PptxTextEntry[],
  slideIndex: number,
  node: PptxNode,
  nodePath: string,
  options: TextEntryOptions,
  ctx: ElementParseContext,
  transform: GroupOffsetTransform = IDENTITY_OFFSET_TRANSFORM,
  skipPlaceholders = false,
): void {
  if (skipPlaceholders && node.placeholder) return;
  switch (node.nodeType) {
    case `shape`:
      options.includeShapes && pushShapeTextEntry(out, slideIndex, node, nodePath, transform);
      break;
    case `table`:
      options.includeTables && pushTableTextEntries(out, slideIndex, node, nodePath, transform);
      break;
    case `group`: {
      if (!options.includeGroups) break;
      const group = node;
      node.children.forEach((childSource, childIndex) => {
        try {
          const child = parseEntryChild(childSource, ctx, skipPlaceholders, group);
          if (!child) return;
          const childTransform = groupChildTransform(group, child, transform);
          collectNodeTextEntries(out, slideIndex, child, `${nodePath}/children/${childIndex}/${child.id || child.name || String(childIndex)}`, options, ctx, childTransform, skipPlaceholders);
        } catch {
          /* 单子节点失败忽略 */
        }
      });
      break;
    }
  }
}

/** 原 zq：母版/版式 spTree 文本条目（跳过占位符） */
function collectSpTreeTextEntries(
  out: PptxTextEntry[],
  slideIndex: number,
  spTree: XmlNode | undefined,
  layer: string,
  options: TextEntryOptions,
  ctx: ElementParseContext,
): void {
  spTree != null &&
    spTree.exists() &&
    spTree.allChildren().forEach((childSource, childIndex) => {
      if (isPlaceholderNode(childSource)) return;
      try {
        const child = parseEntryChild(childSource, ctx, true);
        if (!child) return;
        collectNodeTextEntries(out, slideIndex, child, `slides/${slideIndex}/${layer}/nodes/${child.id || child.name || String(childIndex)}`, options, ctx, IDENTITY_OFFSET_TRANSFORM, true);
      } catch {
        /* 单元素失败忽略 */
      }
    });
}

/**
 * 原 Bq：全文稿文本条目收集——每页就绪化后按
 * 母版（双 showMasterSp 开关）→ 版式 → 幻灯片节点顺序收集。
 */
export function collectPresentationTextEntries(presentation: PptxPresentation, overrides?: Partial<TextEntryOptions>): PptxTextEntry[] {
  const options: TextEntryOptions = { ...DEFAULT_TEXT_ENTRY_OPTIONS, ...overrides };
  const out: PptxTextEntry[] = [];
  presentation.slides.forEach((slide, slideIndex) => {
    ensureSlideReady(presentation, slide);
    const layoutPath = presentation.slideToLayout.get(slide.index) || slide.layoutIndex;
    const layout = layoutPath ? presentation.layouts.get(layoutPath) : undefined;
    const masterPath = layoutPath ? presentation.layoutToMaster.get(layoutPath) : ``;
    const master = masterPath ? presentation.masters.get(masterPath) : undefined;
    if (slide.showMasterSp) {
      if (layout != null && layout.showMasterSp && master) {
        collectSpTreeTextEntries(out, slideIndex, master.spTree, `master`, options, {
          rels: master.rels,
          partPath: masterPath,
          diagramDrawings: presentation.diagramDrawings,
          layout,
          master,
        });
      }
      layout &&
        collectSpTreeTextEntries(out, slideIndex, layout.spTree, `layout`, options, {
          rels: layout.rels,
          partPath: layoutPath,
          diagramDrawings: presentation.diagramDrawings,
          layout,
          master,
        });
    }
    slide.nodes.forEach((node, nodeIndex) => {
      collectNodeTextEntries(out, slideIndex, node, `slides/${slideIndex}/nodes/${node.id || node.name || String(nodeIndex)}`, options, {
        rels: slide.rels,
        partPath: slide.slidePath,
        diagramDrawings: presentation.diagramDrawings,
        layout,
        master,
      });
    });
  });
  return out;
}

/** 原 Vq：文本体纯文本（去首尾空白） */
function textBodyPlain(textBody: PptxTextBody | undefined): string | undefined {
  return textBody?.paragraphs.map((p) => p.runs.map((r) => r.text).join(``)).join(`\n`).trim();
}

/* ============================================================================
 * 附录：presentationElementModel-r6vQ-JZl.js 助手 chunk（同族依赖，98 行）
 * 主 chunk 第 1 行：import { t as e } from "./presentationElementModel-r6vQ-JZl.js"
 * （Hq.getPageElements 使用其 t = buildSlideElements）
 *   e  elementBounds            节点 → {x,y,width,height}
 *   t  sumNonNegative           非负求和
 *   n  tableCellElements        表格 → 单元格元素（按网格比例换算边界）
 *   r  buildSlideElements       导出 t：页元素 + 表格单元格 + 组内文本条目
 *   i  rectContainsPoint        点包含判定
 *   a  hitTestElement           导出 n：命中测试（单元格优先，层级降序）
 * ==========================================================================*/

/** 页元素输入节点（Hq 提供的精简模型） */
export interface PageElementNode {
  id: string;
  name: string;
  nodeType: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  text?: string;
  columns?: number[];
  rows?: { height: number; cells: { gridSpan: number; rowSpan: number; hMerge: boolean; vMerge: boolean; text: string | undefined }[] }[];
}

/** 元素类型（含表格单元格虚拟类型） */
export type SlideElementKind = `shape` | `picture` | `table` | `table-cell` | `group` | `chart` | `unknown`;

/** 幻灯片元素（命中测试/选择用） */
export interface SlideElement {
  slideIndex: number;
  slidePart: string;
  nodeId: string;
  nodePath?: string;
  nodeName: string;
  nodeType: SlideElementKind;
  text?: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex: number;
  rowIndex?: number;
  cellIndex?: number;
}

/** 原 e：节点边界 */
function elementBounds(node: PageElementNode): { x: number; y: number; width: number; height: number } {
  return { x: node.position.x, y: node.position.y, width: node.size.w, height: node.size.h };
}

/** 原 t：非负求和 */
function sumNonNegative(values: number[]): number {
  return values.reduce((sum, v) => sum + Math.max(0, v), 0);
}

/** 原 n：表格单元格元素（合并格跳过，跨度按网格比例换算） */
function tableCellElements(node: PageElementNode, base: SlideElement): SlideElement[] {
  if (!node.columns || !node.rows || node.columns.length === 0 || node.rows.length === 0) return [];
  const totalWidth = sumNonNegative(node.columns);
  const totalHeight = sumNonNegative(node.rows.map((r) => r.height));
  if (totalWidth <= 0 || totalHeight <= 0) return [];
  const columnOffsets = node.columns.map((_, i) => sumNonNegative(node.columns?.slice(0, i) ?? []));
  const rowOffsets = node.rows.map((_, i) => sumNonNegative(node.rows?.slice(0, i).map((r) => r.height) ?? []));
  return node.rows.flatMap((row, rowIndex) => {
    let colCursor = 0;
    return row.cells.flatMap((cell, cellIndex) => {
      const gridSpan = Math.max(1, cell.gridSpan || 1);
      if (cell.hMerge || cell.vMerge) {
        cell.vMerge && !cell.hMerge && (colCursor += gridSpan);
        return [];
      }
      const startCol = colCursor;
      colCursor += gridSpan;
      const rowSpan = Math.max(1, cell.rowSpan || 1);
      const spanWidth = sumNonNegative(node.columns?.slice(startCol, startCol + gridSpan) ?? []);
      const spanHeight = sumNonNegative(node.rows?.slice(rowIndex, rowIndex + rowSpan).map((r) => r.height) ?? []);
      return [
        {
          ...base,
          nodeType: `table-cell`,
          rowIndex,
          cellIndex,
          text: cell.text,
          bounds: {
            x: node.position.x + ((columnOffsets[startCol] ?? 0) / totalWidth) * node.size.w,
            y: node.position.y + ((rowOffsets[rowIndex] ?? 0) / totalHeight) * node.size.h,
            width: (spanWidth / totalWidth) * node.size.w,
            height: (spanHeight / totalHeight) * node.size.h,
          },
        },
      ];
    });
  });
}

/** buildSlideElements 输入（原 r 参数） */
export interface SlideElementsInput {
  slideIndex: number;
  slidePart: string;
  nodes: PageElementNode[];
  groupTextEntries: { nodeId: string; nodePath: string; text: string; bounds: { x: number; y: number; w: number; h: number } }[];
}

/**
 * 原 r（导出 t）：页元素构建——普通节点（组/unknown 跳过）+
 * 表格单元格展开 + 组内文本条目（按 nodePath 定位宿主组的层级）。
 */
export function buildSlideElements(input: SlideElementsInput): SlideElement[] {
  const direct = input.nodes.flatMap((node, index) => {
    if (node.nodeType === `group` || node.nodeType === `unknown`) return [];
    const base: SlideElement = {
      slideIndex: input.slideIndex,
      slidePart: input.slidePart,
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.nodeType as SlideElementKind,
      bounds: elementBounds(node),
      zIndex: index,
      ...(node.text ? { text: node.text } : {}),
    };
    return node.nodeType === `table` ? [base, ...tableCellElements(node, base)] : [base];
  });
  const directIds = new Set(input.nodes.filter((n) => n.nodeType !== `group`).map((n) => n.id));
  const groupEntries = input.groupTextEntries.flatMap((entry) => {
    if (directIds.has(entry.nodeId)) return [];
    const segments = entry.nodePath.split(`/`);
    const nodesIndex = segments.indexOf(`nodes`);
    const hostId = (nodesIndex >= 0 ? segments[nodesIndex + 1] : undefined) ?? segments[0];
    const hostIndex = Math.max(0, input.nodes.findIndex((n) => n.nodeType === `group` && n.id === hostId));
    const element: SlideElement = {
      slideIndex: input.slideIndex,
      slidePart: input.slidePart,
      nodeId: entry.nodeId,
      nodePath: entry.nodePath,
      nodeName: ``,
      nodeType: `shape`,
      text: entry.text,
      bounds: { x: entry.bounds.x, y: entry.bounds.y, width: entry.bounds.w, height: entry.bounds.h },
      zIndex: hostIndex,
    };
    return [element];
  });
  return [...direct, ...groupEntries];
}

/** 原 i：点是否在矩形内 */
function rectContainsPoint(bounds: { x: number; y: number; width: number; height: number }, point: { x: number; y: number }): boolean {
  return point.x >= bounds.x && point.y >= bounds.y && point.x <= bounds.x + bounds.width && point.y <= bounds.y + bounds.height;
}

/** 原 a（导出 n）：命中测试——单元格优先，其次层级降序 */
export function hitTestElement(elements: SlideElement[], point: { x: number; y: number }): SlideElement | null {
  return (
    elements
      .filter((element) => rectContainsPoint(element.bounds, point))
      .sort(
        (a, b) =>
          Number(b.nodeType === `table-cell`) - Number(a.nodeType === `table-cell`) || b.zIndex - a.zIndex,
      )[0] ?? null
  );
}

/* ============================================================================
 * 文档类与引擎导出（原 Hq/Uq，jsx 44579-44678）
 * ==========================================================================*/

/** renderPage 选项 */
export interface RenderPageOptions {
  onNavigate?: (nav: { pageIndex?: number; url?: string }) => void;
  onNodeError?: (nodeId: string, error: unknown) => void;
}

/** 页渲染句柄 */
export interface PageRenderHandle {
  ready: Promise<void>;
  dispose(): void;
}

/**
 * 原 Hq：演示文稿预览文档——页计数/尺寸、元素缓存、
 * 活动渲染句柄集合与统一释放。
 */
export class PresentationPreviewDocument {
  pageCount: number;
  pageSize: { width: number; height: number };
  private presentation: PptxPresentation;
  private activeHandles = new Set<PageRenderHandle>();
  private elementCache = new Map<number, SlideElement[]>();
  private disposed = false;

  constructor(presentation: PptxPresentation) {
    this.presentation = presentation;
    this.pageCount = presentation.slides.length;
    this.pageSize = { width: presentation.width, height: presentation.height };
  }

  /** 页元素（缓存）：节点精简模型 + 组内文本条目 → buildSlideElements */
  getPageElements(pageIndex: number): SlideElement[] {
    if (this.disposed) throw Error(`Presentation preview document has been disposed`);
    const cached = this.elementCache.get(pageIndex);
    if (cached) return cached;
    const slide = this.presentation.slides[pageIndex];
    if (!slide) throw RangeError(`Presentation page index is out of range: ${pageIndex}`);
    ensureSlideReady(this.presentation, slide);
    const groupEntries = collectPresentationTextEntries(
      { ...this.presentation, slides: [slide] },
      { includeGroups: true, includeShapes: true, includeTables: false },
    );
    const nodeIds = new Set(slide.nodes.map((n) => n.id));
    const elements = buildSlideElements({
      slideIndex: pageIndex,
      slidePart: slide.slidePath,
      nodes: slide.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        nodeType: node.nodeType,
        position: node.position,
        size: node.size,
        ...(node.nodeType === `shape` ? { text: textBodyPlain((node as PptxShapeNode).textBody) } : {}),
        ...(node.nodeType === `table`
          ? {
              columns: (node as PptxTableNode).columns ?? [],
              rows: ((node as PptxTableNode).rows ?? []).map((row) => ({
                height: row.height,
                cells: row.cells.map((cell) => ({
                  gridSpan: cell.gridSpan,
                  rowSpan: cell.rowSpan,
                  hMerge: cell.hMerge,
                  vMerge: cell.vMerge,
                  text: textBodyPlain(cell.textBody),
                })),
              })),
            }
          : {}),
      })),
      groupTextEntries: groupEntries
        .filter(
          (entry) =>
            entry.slideIndex === 0 &&
            entry.textKind === `shape` &&
            entry.nodePath.startsWith(`slides/0/nodes/`) &&
            !nodeIds.has(entry.nodeId),
        )
        .map((entry) => ({ nodeId: entry.nodeId, nodePath: entry.nodePath, text: entry.text, bounds: entry.bounds })),
    });
    this.elementCache.set(pageIndex, elements);
    return elements;
  }

  /** 页渲染：renderSlide + 句柄登记（释放时移除 DOM 并注销） */
  renderPage(pageIndex: number, container: ParentNode, options?: RenderPageOptions): PageRenderHandle {
    if (this.disposed) throw Error(`Presentation preview document has been disposed`);
    const slide = this.presentation.slides[pageIndex];
    if (!slide) throw RangeError(`Presentation page index is out of range: ${pageIndex}`);
    const result = renderSlide(this.presentation, slide, {
      onNavigate: options?.onNavigate ? (nav) => options.onNavigate?.({ pageIndex: nav.slideIndex, url: nav.url }) : undefined,
      onNodeError: options?.onNodeError,
    });
    container.append(result.element);
    let released = false;
    const handle: PageRenderHandle = {
      ready: result.ready,
      dispose: () => {
        released || ((released = true), result.dispose(), result.element.remove(), this.activeHandles.delete(handle));
      },
    };
    this.activeHandles.add(handle);
    return handle;
  }

  /** 释放：全部活动句柄 + 缓存 */
  dispose(): void {
    if (!this.disposed) {
      this.disposed = true;
      for (const handle of this.activeHandles) handle.dispose();
      this.activeHandles.clear();
      this.elementCache.clear();
    }
  }
}

/**
 * 原 Uq（chunk 导出，jsx 44670-44678）：
 * export { Uq as pptxRendererPreviewEngine }
 * open(buffer) = 限额解压 → 懒模型 → 预览文档。
 */
export const pptxRendererPreviewEngine = {
  async open(data: ArrayBuffer | Uint8Array): Promise<PresentationPreviewDocument> {
    return new PresentationPreviewDocument(buildPresentationModel(await openPresentationArchive(data, ZIP_LIMITS), { lazySlides: true }));
  },
};
