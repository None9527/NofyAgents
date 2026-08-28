/* eslint-disable */
/**
 * ============================================================================
 * presentationPdfPrintExport.tsx — ZCode 3.7.6 PPTX 打印/PDF 导出宿主
 * （解混淆重建 · D8 Stage B2 · Office 预览族）
 * ============================================================================
 *
 * 来源文件（291 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/presentationPdfPrintExport-CsVZM-dn.js
 * 对照文件（同一 chunk 的 pretty-print 版，227 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/presentationPdfPrintExport-CsVZM-dn.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 行 / js 行 基本一致，本 chunk 为单列压缩）
 * ----------------------------------------------------------------------------
 *   e  → PRINT_HOST_ATTR            `data-zcode-pptx-print-host`   (jsx 1)
 *   t  → PRINT_PAGE_ATTR            `data-zcode-pptx-print-page`   (jsx 2)
 *   n  → PRINT_STYLE_ATTR           `data-zcode-pptx-print-style`  (jsx 3)
 *   r  → IMAGE_DECODE_TIMEOUT_MS     10_000                          (jsx 4)
 *   i  → GENERIC_FONT_KEYWORDS       serif/sans-serif/… 12 个        (jsx 5)
 *   a  → FONT_PROBE_TEXTS            latin/cjk/symbol 三套探针串     (jsx 7-11)
 *   o  → FONTS_ALWAYS_MISSING_ON_MAC `pingfang sc`（Canvas 探针误报规避）(jsx 12)
 *   s  → CJK_SANS_FALLBACK_STACK                                    (jsx 13)
 *   c  → CJK_SERIF_FALLBACK_STACK                                   (jsx 14)
 *   l  → LATIN_SANS_FALLBACK_STACK                                  (jsx 15)
 *   u  → LATIN_NARROW_FALLBACK_STACK                                (jsx 16)
 *   d  → LATIN_SERIF_FALLBACK_STACK                                 (jsx 17)
 *   f  → LATIN_MONO_FALLBACK_STACK                                  (jsx 18)
 *   p  → SYMBOL_FALLBACK_STACK                                      (jsx 19)
 *   m  → unquoteFontName                                             (jsx 20)
 *   h  → splitFontFamilyList         逗号分割（引号/转义感知）        (jsx 27)
 *   g  → serializeFontName           通用关键字小写；含空白/引号加引号 (jsx 54)
 *   _  → classifyTextScript          Han/假名/谚文→cjk；字母数字→latin；否则 symbol (jsx 61)
 *   v  → isGenericFontName                                           (jsx 65)
 *   y  → isPingFangSc                                                (jsx 68)
 *   b  → classifyFontKind            mono/narrow/serif/sans          (jsx 71)
 *   x  → pickFallbackStack            按 script×kind 选回退栈         (jsx 78)
 *   S  → ensureGenericTail           族列表末尾补通用族               (jsx 82)
 *   C  → resolveAvailableFontStack   核心：找到第一个可用字体起点，
 *                                     截断前面的缺失字体，拼回退栈      (jsx 85)
 *   w  → createFontAvailabilityProbe  Canvas measureText 三通用族差分
 *                                     探测字体是否安装；Mac 上对雅黑系
 *                                     直接判缺失（渲染异常规避）        (jsx 97)
 *   T  → substituteMissingFontFamilies  遍历宿主内全部文本节点，按聚合
 *                                     文本做 script 分类，重写
 *                                     element.style.fontFamily        (jsx 117)
 *   E  → formatPx                                                           (jsx 136)
 *   D  → buildPrintHostStylesheet   @media screen 移出视口 / @media print
 *                                     只留打印宿主 + @page 尺寸 + 分页   (jsx 139)
 *   O  → nextFramePromise            rAF（降级 setTimeout 0）          (jsx 188)
 *   k  → preparePrintHost            fonts.ready → 字体替换 → 图片
 *                                     decode（10s 竞赛）→ 双 rAF        (jsx 194)
 *   A  → renderPresentationToPrintHost  导出函数：注入 style+host，
 *                                     逐页 renderPage 并 await ready    (jsx 199)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖（跨 chunk）
 * ----------------------------------------------------------------------------
 *   无导入。本 chunk 为自包含纯 DOM 模块，唯一导出
 *   `renderPresentationToPrintHost`（out 中导出名同名）。
 *   调用方：pptx-preview-viewer-B1z6CWke.js 的「导出 PDF」按钮
 *   （动态 import 本 chunk，随后 platformService.printPageToPdf()）。
 *
 * ----------------------------------------------------------------------------
 * 三、引擎接口（来自 pptxRendererPreviewEngine-BIIRLBue.js 的 Hq 类）
 * ----------------------------------------------------------------------------
 *   PresentationDocument.pageSize : { width, height }
 *   PresentationDocument.pageCount: number
 *   PresentationDocument.renderPage(index, hostEl): { ready: Promise<void>, dispose(): void }
 * ============================================================================
 */

/* ============================================================================
 * 0. 引擎接口（重建声明；真实实现见 pptxRendererPreviewEngine.tsx）
 * ==========================================================================*/

interface PptxPrintRenderHandle {
  /** 页面 DOM 渲染完成（含异步媒体）的 promise */
  ready: Promise<void>;
  /** 释放该页渲染资源 */
  dispose(): void;
}

interface PptxPrintDocument {
  pageSize: { width: number; height: number };
  pageCount: number;
  renderPage(pageIndex: number, hostElement: HTMLElement): PptxPrintRenderHandle;
}

/* ============================================================================
 * 1. data-* 属性与常量
 * ==========================================================================*/

/** 打印宿主容器属性（@media print 时只保留该子树） */
const PRINT_HOST_ATTR = `data-zcode-pptx-print-host`;
/** 单页容器属性（每页一个，break-after: page 分页） */
const PRINT_PAGE_ATTR = `data-zcode-pptx-print-page`;
/** 注入样式表属性（便于识别/清理） */
const PRINT_STYLE_ATTR = `data-zcode-pptx-print-style`;
/** 图片 decode 等待上限（与空转竞赛） */
const IMAGE_DECODE_TIMEOUT_MS = 1e4;

/** CSS 通用字体关键字（原样保留，不加引号、小写化） */
const GENERIC_FONT_KEYWORDS = new Set([
  `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`,
  `ui-serif`, `ui-sans-serif`, `ui-monospace`, `emoji`, `math`, `fangsong`,
]);

/**
 * 字体可用性探针文本（原 a）：
 * - latin：宽窄字符混合 + 数字 + 大写，最大化宽度差
 * - cjk  ：汉字 + 假名 + 谚文混排
 * - symbol：符号字形
 */
const FONT_PROBE_TEXTS = {
  latin: `mmmmmmmmmwwwwwwwiiiiiiiii 0123456789 ABCDEFG`,
  cjk: `汉字排版测试かなカナ한글漢字`,
  symbol: `◆▶▥✦★☻♪—“”`,
};

/**
 * macOS 上 Canvas 探针会误报"已安装"的字体（原 o）——
 * 实际渲染时回退异常，故直接判为缺失。
 */
const FONTS_ALWAYS_MISSING_ON_MAC = new Set([`pingfang sc`]);

/* ============================================================================
 * 2. 回退字体栈（按 脚本 × 字体类别 选择）
 * ==========================================================================*/

const CJK_SANS_FALLBACK_STACK = [
  `Hiragino Sans GB`, `Microsoft YaHei`, `Noto Sans CJK SC`,
  `Source Han Sans SC`, `Arial Unicode MS`, `sans-serif`,
];
const CJK_SERIF_FALLBACK_STACK = [
  `Songti SC`, `STSong`, `SimSun`, `Noto Serif CJK SC`,
  `Source Han Serif SC`, `serif`,
];
const LATIN_SANS_FALLBACK_STACK = [`Arial`, `Helvetica`, `system-ui`, `sans-serif`];
const LATIN_NARROW_FALLBACK_STACK = [`Arial Narrow`, `Arial`, `Helvetica`, `sans-serif`];
const LATIN_SERIF_FALLBACK_STACK = [`Times New Roman`, `Times`, `Georgia`, `serif`];
const LATIN_MONO_FALLBACK_STACK = [`Courier New`, `Menlo`, `Consolas`, `monospace`];
const SYMBOL_FALLBACK_STACK = [
  `Apple Symbols`, `Segoe UI Symbol`, `Noto Sans Symbols 2`, `Arial Unicode MS`, `sans-serif`,
];

type FontScript = `latin` | `cjk` | `symbol`;
type FontKind = `mono` | `narrow` | `serif` | `sans`;

/** 去掉字体名两端的成对引号（原 m） */
function unquoteFontName(name: string): string {
  return name.trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, `$1$2`).trim();
}

/**
 * 逗号分割 font-family 列表（原 h）：
 * 感知引号段与反斜杠转义，引号内的逗号不分割。
 */
function splitFontFamilyList(list: string): string[] {
  const out: string[] = [];
  let current = ``;
  let quote: string | null = null;
  let escaped = !1;
  const flush = () => {
    const name = unquoteFontName(current);
    name && out.push(name);
    current = ``;
  };
  for (const ch of list) {
    if (escaped) {
      current += ch;
      escaped = !1;
      continue;
    }
    if (ch === `\\`) {
      current += ch;
      escaped = !0;
      continue;
    }
    if (quote) {
      current += ch;
      ch === quote && (quote = null);
      continue;
    }
    if (ch === `"` || ch === `'`) {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === `,`) {
      flush();
      continue;
    }
    current += ch;
  }
  flush();
  return out;
}

/** 序列化单个字体名（原 g）：通用关键字小写，其余含空白/引号/逗号的加双引号并转义 */
function serializeFontName(name: string): string {
  const bare = unquoteFontName(name);
  return GENERIC_FONT_KEYWORDS.has(bare.toLowerCase())
    ? bare.toLowerCase()
    : /[\s,"']/.test(bare)
      ? `"${bare.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"`
      : bare;
}

/** 文本脚本分类（原 _）：CJK 统一表意/假名/谚文 → cjk；其他字母数字 → latin；否则 symbol */
function classifyTextScript(text: string): FontScript {
  return /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(text)
    ? `cjk`
    : /[\p{L}\p{N}]/u.test(text)
      ? `latin`
      : `symbol`;
}

/** 是否通用字体关键字（原 v） */
function isGenericFontName(name: string): boolean {
  return GENERIC_FONT_KEYWORDS.has(unquoteFontName(name).toLowerCase());
}

/** 是否 PingFang SC（原 y）——Mac 探针黑名单用 */
function isPingFangSc(name: string): boolean {
  return FONTS_ALWAYS_MISSING_ON_MAC.has(unquoteFontName(name).toLowerCase());
}

/**
 * 字体类别推断（原 b）：
 * 名称含 mono/courier/consolas/menlo → mono；
 * narrow/condensed/oswald/bebas → narrow；
 * 非 sans 且含 serif/times/georgia/song/simsun/宋体/ming/mincho/playfair → serif；
 * 其余 → sans。
 */
function classifyFontKind(names: string[]): FontKind {
  const joined = names.join(` `).toLowerCase();
  return /mono|courier|consolas|menlo/.test(joined)
    ? `mono`
    : /narrow|condensed|oswald|bebas/.test(joined)
      ? `narrow`
      : !/sans/.test(joined) && /serif|times|georgia|song|simsun|宋体|ming|mincho|playfair/.test(joined)
        ? `serif`
        : `sans`;
}

/** 按 script×kind 选回退栈（原 x） */
function pickFallbackStack(script: FontScript, kind: FontKind): string[] {
  return script === `symbol`
    ? SYMBOL_FALLBACK_STACK
    : script === `cjk`
      ? kind === `serif` ? CJK_SERIF_FALLBACK_STACK : CJK_SANS_FALLBACK_STACK
      : kind === `mono`
        ? LATIN_MONO_FALLBACK_STACK
        : kind === `serif`
          ? LATIN_SERIF_FALLBACK_STACK
          : kind === `narrow`
            ? LATIN_NARROW_FALLBACK_STACK
            : LATIN_SANS_FALLBACK_STACK;
}

/** 列表末尾补通用族（原 S）：已含通用族则原样，否则按 kind 追加 monospace/serif/sans-serif */
function ensureGenericTail(names: string[], kind: FontKind): string[] {
  return names.some(isGenericFontName)
    ? [...names]
    : [...names, kind === `mono` ? `monospace` : kind === `serif` ? `serif` : `sans-serif`];
}

/**
 * 核心：解析一个 font-family 声明，返回"从第一个可用字体开始"的新栈（原 C）。
 *
 * @param fontFamily CSS font-family 原值
 * @param sampleText 该元素聚合出的文本（用于 script 分类）
 * @param isFontAvailable 探针 (name, script) => boolean
 * @returns 替换后的栈字符串；若首个字体已可用则 null（无需替换）
 */
function resolveAvailableFontStack(
  fontFamily: string,
  sampleText: string,
  isFontAvailable: (name: string, script: FontScript) => boolean,
): string | null {
  const names = splitFontFamilyList(fontFamily);
  if (names.length === 0) return null;
  const script = classifyTextScript(sampleText);
  const kind = classifyFontKind(names);
  // 原实现：o = e => v(e) || !y(e) && n(e, i)
  // 即"通用关键字直接可用，或（非 PingFang SC 且探针判定已安装）"。
  const isUsable = (name: string) =>
    isGenericFontName(name) || (!isPingFangSc(name) && isFontAvailable(name, script));
  if (isUsable(names[0])) return null;
  const firstUsableIndex = names.findIndex(isUsable);
  if (firstUsableIndex >= 0) {
    return ensureGenericTail(names.slice(firstUsableIndex), kind).map(serializeFontName).join(`, `);
  }
  const fallback = pickFallbackStack(script, kind);
  const fallbackStart = fallback.findIndex(isUsable);
  return (fallbackStart >= 0 ? fallback.slice(fallbackStart) : fallback.slice(-1))
    .map(serializeFontName)
    .join(`, `);
}

/* ============================================================================
 * 3. Canvas 字体可用性探针（原 w）
 * ==========================================================================*/

/**
 * 创建字体安装探针（原 w）：对 monospace/serif/sans-serif 三个通用族分别测量探针文本宽度，
 * 若「候选族, 通用族」与纯通用族的宽度差 > 0.01 则判定候选族已安装。
 * 结果按 `字体名` 缓存（cjk 文本用 latin 探针测量，避免 CJK 探针在纯西文字体上的误判）。
 * 无 Canvas 环境时返回恒 false 探针。
 */
function createFontAvailabilityProbe(
  doc: Document,
): (name: string, script: FontScript) => boolean {
  if (typeof doc.defaultView?.CanvasRenderingContext2D != `function`) return () => !1;
  const ctx = doc.createElement(`canvas`).getContext(`2d`);
  if (!ctx) return () => !1;
  const isMac = /Mac/i.test(doc.defaultView?.navigator.platform ?? ``);
  const macBlacklist = new Set([
    `microsoft yahei`, `microsoft yahei ui`, `微软雅黑`,
    `dengxian`, `等线`, `simhei`, `黑体`, `heiti sc`,
  ]);
  const cache = new Map<string, boolean>();
  return (name, script) => {
    if (isMac && macBlacklist.has(unquoteFontName(name).toLowerCase())) return !1;
    const probeScript = script === `cjk` ? `latin` : script;
    const cacheKey = `${name}\u0000${probeScript}`;
    const cached = cache.get(cacheKey);
    if (cached !== void 0) return cached;
    const probeText = FONT_PROBE_TEXTS[probeScript];
    const serialized = serializeFontName(name);
    const available = [`monospace`, `serif`, `sans-serif`].some((generic) => {
      ctx.font = `72px ${generic}`;
      const baseWidth = ctx.measureText(probeText).width;
      ctx.font = `72px ${serialized}, ${generic}`;
      return Math.abs(ctx.measureText(probeText).width - baseWidth) > 0.01;
    });
    cache.set(cacheKey, available);
    return available;
  };
}

/**
 * 遍历宿主子树的全部文本节点（原 T）：
 * 按元素聚合文本 → 读 computed fontFamily → resolveAvailableFontStack
 * 命中则重写 element.style.fontFamily。
 */
function substituteMissingFontFamilies(
  doc: Document,
  root: HTMLElement,
  isFontAvailable: (name: string, script: FontScript) => boolean = createFontAvailabilityProbe(doc),
): void {
  const whatToShow = doc.defaultView?.NodeFilter.SHOW_TEXT ?? 4;
  const walker = doc.createTreeWalker(root, whatToShow);
  const textByElement = new Map<HTMLElement, string>();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    const parent = node.parentElement;
    !text || !parent || textByElement.set(parent, `${textByElement.get(parent) ?? ``}${text}`);
  }
  const win = doc.defaultView;
  for (const [el, aggregated] of textByElement) {
    const fontFamily = win?.getComputedStyle(el).fontFamily || el.style.fontFamily;
    if (!fontFamily) continue;
    const replaced = resolveAvailableFontStack(fontFamily, aggregated, isFontAvailable);
    replaced && (el.style.fontFamily = replaced);
  }
}

/* ============================================================================
 * 4. 打印样式表与渲染流程
 * ==========================================================================*/

/** 数值 → `Npx`（两位小数去尾，原 E） */
function formatPx(value: number): string {
  return `${Number(value.toFixed(2))}px`;
}

/**
 * 打印宿主样式表（原 D）：
 * - screen 媒体下把宿主移出视口（translateX(-200vw)），预览不受影响；
 * - print 媒体下隐藏 body 其余内容，宿主恢复静态，@page 尺寸 = 幻灯片尺寸，
 *   每页 `break-after: page`，最后一页不分页；
 * - 宿主内全部滚动条隐藏。
 */
function buildPrintHostStylesheet(pageSize: { width: number; height: number }): string {
  const width = formatPx(pageSize.width);
  const height = formatPx(pageSize.height);
  return `
[${PRINT_HOST_ATTR}] * {
  scrollbar-width: none;
}
[${PRINT_HOST_ATTR}] *::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
@media screen {
  [${PRINT_HOST_ATTR}] {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    transform: translateX(-200vw);
    pointer-events: none;
  }
}
@media print {
  body > :not([${PRINT_HOST_ATTR}]) {
    display: none !important;
  }
  [${PRINT_HOST_ATTR}] {
    position: static !important;
    transform: none !important;
  }
  html,
  body {
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  @page {
    size: ${width} ${height};
    margin: 0;
  }
  [${PRINT_PAGE_ATTR}] {
    width: ${width};
    height: ${height};
    position: relative;
    overflow: hidden;
    break-after: page;
  }
  [${PRINT_PAGE_ATTR}]:last-child {
    break-after: auto;
  }
}
`;
}

/** 下一帧 promise（原 O）：rAF 优先，降级 setTimeout(0) */
function nextFramePromise(): Promise<void> {
  return new Promise((resolve) => {
    typeof requestAnimationFrame == `function` ? requestAnimationFrame(() => resolve()) : setTimeout(resolve, 0);
  });
}

/**
 * 打印前准备（原 k）：
 * 1) await document.fonts.ready（字体加载完）
 * 2) 缺失字体替换（Canvas 探针）
 * 3) 再次 await fonts.ready（替换可能触发新字体加载）
 * 4) 全部 <img> 的 decode()，与 10s 超时竞赛
 * 5) 双 rAF，确保布局/绘制落定
 */
async function preparePrintHost(doc: Document, host: HTMLElement): Promise<void> {
  await doc.fonts?.ready;
  substituteMissingFontFamilies(doc, host);
  await doc.fonts?.ready;
  const decodes = Array.from(
    host.querySelectorAll(`img`),
    (img) => (typeof img.decode == `function` ? img.decode().catch(() => void 0) : void 0),
  ).filter((p): p is Promise<void> => p !== void 0);
  decodes.length > 0 &&
    (await Promise.race([Promise.all(decodes), new Promise((resolve) => setTimeout(resolve, IMAGE_DECODE_TIMEOUT_MS))]));
  await nextFramePromise();
  await nextFramePromise();
}

/**
 * 导出函数（原 A，chunk 唯一导出 `renderPresentationToPrintHost`）：
 * 在目标 document 中注入打印样式 + 隐藏宿主，逐页调用引擎
 * `renderPage(index, pageHost)` 并 await `ready`；返回一次性 `dispose`。
 * 任何异常都会先清理再抛出。
 */
export async function renderPresentationToPrintHost(
  presentation: PptxPrintDocument,
  targetDocument: Document,
): Promise<{ dispose(): void }> {
  const styleEl = targetDocument.createElement(`style`);
  styleEl.setAttribute(PRINT_STYLE_ATTR, ``);
  styleEl.textContent = buildPrintHostStylesheet(presentation.pageSize);
  const hostEl = targetDocument.createElement(`div`);
  hostEl.setAttribute(PRINT_HOST_ATTR, ``);
  hostEl.setAttribute(`aria-hidden`, `true`);
  hostEl.setAttribute(`inert`, ``);
  const handles: PptxPrintRenderHandle[] = [];
  let cleaned = !1;
  const dispose = () => {
    if (!cleaned) {
      cleaned = !0;
      for (let i = handles.length - 1; i >= 0; --i) handles[i]?.dispose();
      hostEl.remove();
      styleEl.remove();
    }
  };
  try {
    targetDocument.head.append(styleEl);
    targetDocument.body.append(hostEl);
    for (let index = 0; index < presentation.pageCount; index += 1) {
      const pageEl = targetDocument.createElement(`div`);
      pageEl.setAttribute(PRINT_PAGE_ATTR, ``);
      hostEl.append(pageEl);
      const handle = presentation.renderPage(index, pageEl);
      handles.push(handle);
      await handle.ready;
    }
    await preparePrintHost(targetDocument, hostEl);
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
