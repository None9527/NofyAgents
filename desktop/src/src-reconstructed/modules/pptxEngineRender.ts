/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineRender.ts — pptxRendererPreviewEngine 子模块 · 节点渲染器
 * （解混淆重建 · D8 Stage B2）
 *
 * 主文件：pptxRendererPreviewEngine.tsx。对应源 chunk 区段：
 *   fa/oa/sa/ca  竖排/变换/滤镜追加                       (jsx 11114-11125)
 *   pa..ha/_a/ga 文本自适应阈值常量                       (jsx 11118-11124)
 *   va/ya/ba/xa/Sa 文字弯曲（textPath warp）             (jsx 11126-11176)
 *   Ca/wa        blip → objectURL（同步/懒加载）          (jsx 11177-11210)
 *   Ta/Ea/Da     图片填充区域/裁剪                        (jsx 11211-11247)
 *   Aa/ja/Ma     SVG 外阴影/内阴影/软边缘滤镜             (jsx 11248-11288)
 *   Na           prstDash → stroke-dasharray              (jsx 11289-11311)
 *   Pa           图案填充 → SVG pattern                   (jsx 11312-11417)
 *   Fa/Ia/La     颜色解析/混合/渐变角度                   (jsx 11418-11447)
 *   Ra..Ha       箭头尺寸/渐变端点色/透明判定             (jsx 11448-11480)
 *   Ua..go       贝塞尔/圆弧裁剪 + marker 构建            (jsx 11481-11815)
 *   _o           ln 端点解析                              (jsx 11816-11838)
 *   yo/bo        形状路径缓存                             (jsx 11839-11862)
 *   xo           renderShapeNode（形状渲染主体）          (jsx 11863-12597)
 *   So..Mo/ko/Ao EMF 魔数常量                             (jsx 12598-12608)
 *   No..zo       EMF 解析（内嵌 PDF / DIB 位图）          (jsx 12609-12741)
 *   Bo..is       pdfjs 懒加载 + OffscreenCanvas 工作者    (jsx 12742-12903)
 *   as..Bs       图片/视频/音频/占位渲染                  (jsx 12905-13350)
 *   Vs/Hs/Us     duotone/lum/biLevel 像素滤镜            (jsx 13351-13435)
 *   Ws..dc       表格样式（GUID 表 + 内置模板登记）       (jsx 13436-13969)
 *   fc/pc/mc/hc/gc 表格样式应用                           (jsx 13970-14166)
 *   vc/yc/bc     renderTableNode                          (jsx 14170-14284)
 *   Oc/kc        renderGroupNode                          (jsx 14359-14492)
 *   $n..dr       幻灯片背景渲染                           (jsx 6243-6453)
 * ============================================================================
 */

import { XmlNode, emuToPx, angleToDeg, permilleToUnit, isExternalRel, resolvePartPath, parseXml, parseXmlBool } from "./pptxEngineTypes";
import type {
  PptxRenderContext, PptxShapeNode, PptxPictureNode, PptxTableNode, PptxTableCell,
  PptxGroupNode, PptxNode, PptxRelationship,
} from "./pptxEngineTypes";
import {
  resolveColor, resolveColorCss, colorWithAlphaCss, hexToRgb, rgbToHex,
  resolveFillCss, gradientFillCss, gradientFillDataFromFill, resolveLineStyle,
  classifyDashKind, resolveThemeFill, resolveThemeBackgroundFill, resolveGradientLine,
  patternFillCss, parseTransformList, applyColorTransforms, tint, compressGradientStops,
} from "./pptxEngineColor";
import type { GradientStop, GradientFillData } from "./pptxEngineColor";
import {
  buildShapePaths, buildCustomGeometryPath, buildPresetGeometryPath, parseAdjustments,
  type MultiRegionPath,
} from "./pptxEngineGeometry";
import {
  renderTextBody, lookupBodyProperty, textBodyHasVisibleText, textBodyIsSingleLine,
  textBodyAllCentered, textBodyCodepointCount, textBodyIsShort, textBodyVisibleParagraphCount,
  textBodyHasExplicitSpacing, textBodyHasBullets, isTitlePlaceholder,
  appendTransform, appendFilter, resolveTypefaceStack, buildFontFamilyCss,
  resolveSlideNavigation, goToSlideTooltip, SHORT_TEXT_THRESHOLD,
} from "./pptxEngineText";

/* --- 全局 id 计数器（原 Oa/ka，jsx 11247-11248） --- */

let svgDefsIdCounter = 0;
let arrowMarkerIdCounter = 0;

/* --- 文本自适应阈值（原 pa/ma/ha/ga/_a，jsx 11118-11124） --- */

const FIT_FALLBACK_HEIGHT_RATIO = 1.1;
const FIT_SINGLE_LINE_HEIGHT_RATIO = 1.25;
const FIT_WIDTH_TOLERANCE_PX = 1;
const FIT_GROUP_MIN_SCALE = 0.9;
const FIT_NOWRAP_MIN_SCALE = 0.9;

/* --- 竖排（原 fa，jsx 11114-11117） --- */

export function applyVerticalTextLayout(
  el: HTMLElement,
  anchor: string | undefined,
  upright = false,
  writingMode: string = `vertical-rl`,
): void {
  el.style.writingMode = writingMode as never;
  el.style.justifyContent = `center`;
  el.style.alignItems = anchor === `b` ? `flex-end` : anchor === `ctr` ? `center` : `flex-start`;
  upright && ((el.style.textOrientation = `upright`), (el.style.whiteSpace = `normal`));
}

/* --- 尺寸缩放重写（原 da → Fn，jsx 11111/6055-6066） --- */

const MAX_SCALE_REWRITE_LEN = 128;

export function scaleCssSize(size: string | undefined, scale: number): string {
  if (!size) return size ?? ``;
  const trimmed = size.trim();
  if (!trimmed) return `${100 / scale}%`;
  if (trimmed.length > MAX_SCALE_REWRITE_LEN) return size;
  const parsed = parseCssLength(trimmed);
  return parsed ? `${parsed.value / scale}${parsed.unit || `%`}` : size;
}

function parseCssLength(text: string): { value: number; unit: string } | null {
  let i = 0;
  (text[i] === `-` || text[i] === `+`) && i++;
  let digits = 0;
  for (; isDigit(text.charCodeAt(i));) i++, digits++;
  if (text[i] === `.`) for (i++; isDigit(text.charCodeAt(i));) i++, digits++;
  if (digits === 0) return null;
  if (text[i] === `e` || text[i] === `E`) {
    const mark = i;
    i++;
    (text[i] === `-` || text[i] === `+`) && i++;
    let expDigits = 0;
    for (; isDigit(text.charCodeAt(i));) i++, expDigits++;
    expDigits === 0 && (i = mark);
  }
  const value = Number(text.slice(0, i));
  if (!Number.isFinite(value)) return null;
  const unit = text.slice(i);
  return isCssUnit(unit) ? { value, unit } : null;
}

function isDigit(code: number): boolean {
  return code >= 48 && code <= 57;
}

function isCssUnit(unit: string): boolean {
  if (!unit || unit === `%`) return true;
  for (let i = 0; i < unit.length; i++) {
    const code = unit.charCodeAt(i);
    if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122))) return false;
  }
  return true;
}

/* --- 文字弯曲（原 va/ya/ba/xa/Sa，jsx 11126-11176）：
 *     prstTxWarp 的 textArchUp/textArchDown 用 SVG textPath 渲染单行文本 --- */

function textWarpPreset(textBody: { bodyProperties?: XmlNode }): string | null {
  const preset = textBody.bodyProperties?.child(`prstTxWarp`)?.attr(`prst`);
  return preset === `textArchDown` || preset === `textArchUp` ? preset : null;
}

function textWarpSingleLineText(textBody: { paragraphs: Array<{ runs: Array<{ text?: string | null }> }> }): string | null {
  let joined = ``;
  let count = 0;
  for (const paragraph of textBody.paragraphs) {
    const runs = paragraph.runs.filter((r) => r.text != null && r.text.length > 0);
    if (runs.length !== 0) {
      count++;
      if (count > 1 || runs.some((r) => r.text === `\n`)) return null;
      joined += runs.map((r) => r.text).join(``);
    }
  }
  return joined.length > 0 ? joined : null;
}

function textWarpFirstRunProperties(textBody: { paragraphs: Array<{ runs: Array<{ text?: string | null; properties?: XmlNode }> }> }): XmlNode | undefined {
  for (const paragraph of textBody.paragraphs)
    for (const run of paragraph.runs) if (run.text != null && run.text.length > 0) return run.properties;
}

function textWarpArcPath(preset: string, width: number, height: number): string {
  const inset = Math.min(Math.max(width * 0.04, 4), 18);
  const startX = inset;
  const endX = Math.max(startX, width - inset);
  if (preset === `textArchDown`) {
    const baseY = height * 0.36;
    return `M${startX},${baseY} Q${width / 2},${height * 0.9} ${endX},${baseY}`;
  }
  const baseY = height * 0.66;
  return `M${startX},${baseY} Q${width / 2},${height * 0.08} ${endX},${baseY}`;
}

/** 若形状文本为弯曲文字（且可单行化），返回 SVG 元素；否则 null（原 Sa） */
export function tryRenderWarpedText(
  node: PptxShapeNode,
  ctx: PptxRenderContext,
): SVGElement | null {
  if (!node.textBody) return null;
  const preset = textWarpPreset(node.textBody);
  if (!preset) return null;
  const text = textWarpSingleLineText(node.textBody);
  if (!text) return null;
  const runProps = textWarpFirstRunProperties(node.textBody);
  const fontSize = runProps?.numAttr(`sz`) === void 0 ? 12 : runProps!.numAttr(`sz`)! / 100;
  const fonts = resolveTypefaceStack(
    [runProps?.child(`latin`).attr(`typeface`), runProps?.child(`ea`).attr(`typeface`), runProps?.child(`cs`).attr(`typeface`)],
    ctx,
    [runProps?.attr(`lang`), runProps?.attr(`altLang`)],
  );
  const fontWeight = parseBoolAttr(runProps?.attr(`b`)) ? `bold` : void 0;
  const solidFill = runProps?.child(`solidFill`);
  const fill = solidFill != null && solidFill.exists() ? resolveColorCss(solidFill, ctx) : `#000000`;
  const svgNs = `http://www.w3.org/2000/svg`;
  const svg = document.createElementNS(svgNs, `svg`);
  svg.setAttribute(`viewBox`, `0 0 ${node.size.w} ${node.size.h}`);
  svg.setAttribute(`width`, String(node.size.w));
  svg.setAttribute(`height`, String(node.size.h));
  svg.style.position = `absolute`;
  svg.style.left = `0`;
  svg.style.top = `0`;
  svg.style.overflow = `visible`;
  const defs = document.createElementNS(svgNs, `defs`);
  const path = document.createElementNS(svgNs, `path`);
  const pathId = `text-warp-${++svgDefsIdCounter}`;
  path.setAttribute(`id`, pathId);
  path.setAttribute(`d`, textWarpArcPath(preset, node.size.w, node.size.h));
  path.setAttribute(`fill`, `none`);
  defs.appendChild(path);
  svg.appendChild(defs);
  const textEl = document.createElementNS(svgNs, `text`);
  textEl.setAttribute(`font-size`, `${fontSize}pt`);
  fonts.length > 0 && textEl.setAttribute(`font-family`, buildFontFamilyCss(fonts));
  fontWeight && textEl.setAttribute(`font-weight`, fontWeight);
  textEl.setAttribute(`fill`, fill);
  textEl.setAttribute(`dominant-baseline`, `middle`);
  const textPath = document.createElementNS(svgNs, `textPath`);
  textPath.setAttribute(`href`, `#${pathId}`);
  textPath.setAttribute(`startOffset`, `50%`);
  textPath.setAttribute(`text-anchor`, `middle`);
  textPath.setAttribute(`xml:space`, `preserve`);
  textPath.textContent = text;
  textEl.appendChild(textPath);
  svg.appendChild(textEl);
  return svg;
}

function parseBoolAttr(value: string | undefined, fallback = false): boolean {
  if (value === void 0) return fallback;
  const normalized = value.trim().toLowerCase();
  return [`1`, `true`, `t`, `on`].includes(normalized) ? true : [`0`, `false`, `f`, `off`].includes(normalized) ? false : fallback;
}

/* --- blip 媒体解析（原 Ca/wa，jsx 11177-11210） --- */

export function resolveBlipUrl(blipFill: XmlNode, ctx: PptxRenderContext): string | null {
  const blip = blipFill.child(`blip`);
  const embed = blip.attr(`embed`) ?? blip.attr(`r:embed`);
  const link = blip.attr(`link`) ?? blip.attr(`r:link`);
  const rId = embed ?? link;
  if (!rId) return null;
  const rel = ctx.slide.rels.get(rId);
  if (!rel) return null;
  if (isExternalRel(rel)) return isHttpTarget(rel.target) ? rel.target : null;
  const media = findMedia(rel.target, ctx.presentation.media);
  if (!media) return null;
  return mediaObjectUrl(media.mediaPath, media.data, ctx.mediaUrlCache);
}

export async function resolveBlipUrlLazy(blipFill: XmlNode, ctx: PptxRenderContext): Promise<string | null> {
  const blip = blipFill.child(`blip`);
  const embed = blip.attr(`embed`) ?? blip.attr(`r:embed`);
  const link = blip.attr(`link`) ?? blip.attr(`r:link`);
  const rId = embed ?? link;
  if (!rId) return null;
  const rel = ctx.slide.rels.get(rId);
  if (!rel) return null;
  if (isExternalRel(rel)) return isHttpTarget(rel.target) ? rel.target : null;
  const media = await resolveMediaLazy(rel.target, ctx.presentation.media, ctx.presentation.mediaResolver);
  if (!media) return null;
  return mediaObjectUrl(media.mediaPath, media.data, ctx.mediaUrlCache);
}

/** 原 Nn：http/https 目标（可内嵌为媒体 URL） */
export function isHttpTarget(url: string): boolean {
  const protocol = urlProtocol(url);
  return protocol !== undefined && (protocol === `http:` || protocol === `https:`);
}

/** 原 Mn：可导航协议（http/https/mailto） */
export function isNavigableUrlScheme(url: string): boolean {
  const protocol = urlProtocol(url);
  return protocol !== undefined && (protocol === `http:` || protocol === `https:` || protocol === `mailto:`);
}

/** 原 jn：URL 协议（小写），失败 undefined */
function urlProtocol(url: string): string | undefined {
  try {
    return new URL(url).protocol.toLowerCase();
  } catch {
    return;
  }
}

/** 媒体查找（原 h，jsx 3322-3330；media/ 路径双候选） */
export function findMedia(target: string, media: Map<string, Uint8Array>): { mediaPath: string; data: Uint8Array } | undefined {
  for (const path of mediaPathCandidates(target)) {
    const data = media.get(path);
    if (data) return { mediaPath: path, data };
  }
}

export async function resolveMediaLazy(
  target: string,
  media: Map<string, Uint8Array>,
  resolver?: { resolve(path: string): Promise<{ mediaPath: string; data: Uint8Array } | undefined> },
): Promise<{ mediaPath: string; data: Uint8Array } | undefined> {
  return findMedia(target, media) || resolver?.resolve(target);
}

/** 原 p：首选媒体路径 ppt/media/<解码文件名>（jsx 3314-3316） */
export function primaryMediaPath(target: string): string {
  return `ppt/media/${mediaFileName(target).split(`/`).map(decodeMediaSegment).join(`/`)}`;
}

/** 原 d：decodeURIComponent 容错 */
function decodeMediaSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** 媒体路径候选（原 m，jsx 3317-3321）：ppt/media/<name> 与原名两种 */
export function mediaPathCandidates(target: string): string[] {
  const name = mediaFileName(target);
  const primary = `ppt/media/${name}`;
  const direct = `ppt/media/${mediaBaseName(target)}`;
  return primary === direct ? [primary] : [primary, direct];
}

function mediaBaseName(target: string): string {
  const clean = stripQueryHash(target).replace(/\\/g, `/`);
  const segments = clean.split(`/`).filter((s) => s && s !== `.`);
  return segments[segments.length - 1] ?? ``;
}

function mediaFileName(target: string): string {
  const base = mediaBaseName(target);
  const lastMedia = (() => {
    const segments = stripQueryHash(target).replace(/\\/g, `/`).split(`/`).filter((s) => s && s !== `.`);
    const index = segments.lastIndexOf(`media`);
    return (index >= 0 && index < segments.length - 1 ? segments.slice(index + 1) : segments.slice(-1)).join(`/`);
  })();
  void base;
  return lastMedia;
}

function stripQueryHash(path: string): string {
  const index = path.search(/[?#]/);
  return index >= 0 ? path.slice(0, index) : path;
}

/** 媒体 → Blob objectURL（缓存，原 _，jsx 3336-3345） */
export function mediaObjectUrl(mediaPath: string, data: Uint8Array, cache: Map<string, string>): string {
  let url = cache.get(mediaPath);
  if (!url) {
    const mime = mediaMimeType(mediaPath);
    const blob = new Blob([data as BlobPart], { type: mime });
    url = URL.createObjectURL(blob);
    cache.set(mediaPath, url);
  }
  return url;
}

/** 扩展名 → MIME（原 c，jsx 3264-3286） */
export function mediaMimeType(path: string): string {
  return (
    {
      png: `image/png`, jpg: `image/jpeg`, jpeg: `image/jpeg`, gif: `image/gif`,
      svg: `image/svg+xml`, bmp: `image/bmp`, tiff: `image/tiff`, tif: `image/tiff`,
      emf: `image/x-emf`, wmf: `image/x-wmf`, webp: `image/webp`,
      mp4: `video/mp4`, m4v: `video/mp4`, webm: `video/webm`, avi: `video/x-msvideo`,
      mp3: `audio/mpeg`, wav: `audio/wav`, m4a: `audio/mp4`, ogg: `audio/ogg`,
    } as Record<string, string>
  )[path.split(`.`).pop()?.toLowerCase() || ``] || `application/octet-stream`;
}

/* --- 图片填充几何（原 Ta/Ea/Da，jsx 11211-11247） --- */

function fillRectPercent(node: XmlNode, name: string): number {
  return (node.numAttr(name) ?? 0) / 1e3;
}

interface ImageFillRect { x: number; y: number; w: number; h: number; preserveAspectRatio: string }

function imageFillRect(blipFill: XmlNode, size: { w: number; h: number }): ImageFillRect {
  const stretch = blipFill.child(`stretch`);
  if (!stretch.exists())
    return { x: 0, y: 0, w: size.w, h: size.h, preserveAspectRatio: `xMidYMid slice` };
  const fillRect = stretch.child(`fillRect`);
  const l = fillRect.exists() ? fillRectPercent(fillRect, `l`) : 0;
  const t = fillRect.exists() ? fillRectPercent(fillRect, `t`) : 0;
  const r = fillRect.exists() ? fillRectPercent(fillRect, `r`) : 0;
  const b = fillRect.exists() ? fillRectPercent(fillRect, `b`) : 0;
  return {
    x: size.w * (l / 100),
    y: size.h * (t / 100),
    w: size.w * ((100 - l - r) / 100),
    h: size.h * ((100 - t - b) / 100),
    preserveAspectRatio: `none`,
  };
}

/** 形状路径裁剪 + 图片填充（原 Da） */
export function applyShapeImageFill(
  svgNs: string,
  svg: SVGElement,
  defs: SVGElement,
  blipFill: XmlNode,
  pathD: string,
  size: { w: number; h: number },
  url: string,
  before?: SVGElement,
): void {
  const clipId = `shape-clip-${++svgDefsIdCounter}`;
  const clipPath = document.createElementNS(svgNs, `clipPath`);
  clipPath.setAttribute(`id`, clipId);
  const clipShape = document.createElementNS(svgNs, `path`);
  clipShape.setAttribute(`d`, pathD);
  clipPath.appendChild(clipShape);
  defs.appendChild(clipPath);
  const image = document.createElementNS(svgNs, `image`);
  const rect = imageFillRect(blipFill, size);
  image.setAttributeNS(`http://www.w3.org/1999/xlink`, `href`, url);
  image.setAttribute(`x`, String(rect.x));
  image.setAttribute(`y`, String(rect.y));
  image.setAttribute(`width`, String(rect.w));
  image.setAttribute(`height`, String(rect.h));
  image.setAttribute(`clip-path`, `url(#${clipId})`);
  image.setAttribute(`preserveAspectRatio`, rect.preserveAspectRatio);
  defs.parentNode || svg.appendChild(defs);
  before?.parentNode === svg ? svg.insertBefore(image, before) : svg.appendChild(image);
}

/* --- SVG 滤镜（原 Aa/ja/Ma，jsx 11248-11288） --- */

interface ShadowSpec { dx: number; dy: number; blur: number; color: { r: number; g: number; b: number }; opacity: number }

/** 外阴影 feDropShadow（原 Aa） */
export function applySvgDropShadow(svgNs: string, defs: SVGElement, path: SVGElement, size: { w: number; h: number }, spec: ShadowSpec): void {
  const filterId = `shape-shadow-${++svgDefsIdCounter}`;
  const filter = document.createElementNS(svgNs, `filter`);
  const margin = Math.max(Math.abs(spec.dx), Math.abs(spec.dy)) + spec.blur * 4 + 4;
  filter.setAttribute(`id`, filterId);
  filter.setAttribute(`filterUnits`, `userSpaceOnUse`);
  filter.setAttribute(`x`, String(-margin));
  filter.setAttribute(`y`, String(-margin));
  filter.setAttribute(`width`, String(size.w + margin * 2));
  filter.setAttribute(`height`, String(size.h + margin * 2));
  const drop = document.createElementNS(svgNs, `feDropShadow`);
  drop.setAttribute(`dx`, spec.dx.toFixed(1));
  drop.setAttribute(`dy`, spec.dy.toFixed(1));
  drop.setAttribute(`stdDeviation`, Math.max(0, spec.blur / 2).toFixed(2));
  drop.setAttribute(`flood-color`, `rgb(${spec.color.r},${spec.color.g},${spec.color.b})`);
  drop.setAttribute(`flood-opacity`, spec.opacity.toFixed(4));
  filter.appendChild(drop);
  defs.appendChild(filter);
  !defs.parentNode && path.ownerSVGElement && path.ownerSVGElement.insertBefore(defs, path.ownerSVGElement.firstChild);
  path.setAttribute(`filter`, `url(#${filterId})`);
}

/** 内阴影（原 ja）：feOffset → feGaussianBlur → feComposite(in) → feFlood → feComposite → feMerge */
export function applySvgInnerShadow(svgNs: string, defs: SVGElement, path: SVGElement, size: { w: number; h: number }, spec: ShadowSpec): void {
  const filterId = `shape-inner-shadow-${++svgDefsIdCounter}`;
  const filter = document.createElementNS(svgNs, `filter`);
  const margin = Math.max(Math.abs(spec.dx), Math.abs(spec.dy)) + spec.blur * 4 + 4;
  filter.setAttribute(`id`, filterId);
  filter.setAttribute(`filterUnits`, `userSpaceOnUse`);
  filter.setAttribute(`x`, String(-margin));
  filter.setAttribute(`y`, String(-margin));
  filter.setAttribute(`width`, String(size.w + margin * 2));
  filter.setAttribute(`height`, String(size.h + margin * 2));
  const offset = document.createElementNS(svgNs, `feOffset`);
  offset.setAttribute(`in`, `SourceAlpha`);
  offset.setAttribute(`dx`, spec.dx.toFixed(1));
  offset.setAttribute(`dy`, spec.dy.toFixed(1));
  offset.setAttribute(`result`, `innerOffset`);
  filter.appendChild(offset);
  const blur = document.createElementNS(svgNs, `feGaussianBlur`);
  blur.setAttribute(`in`, `innerOffset`);
  blur.setAttribute(`stdDeviation`, Math.max(0, spec.blur / 2).toFixed(2));
  blur.setAttribute(`result`, `innerBlur`);
  filter.appendChild(blur);
  const compositeIn = document.createElementNS(svgNs, `feComposite`);
  compositeIn.setAttribute(`in`, `innerBlur`);
  compositeIn.setAttribute(`in2`, `SourceAlpha`);
  compositeIn.setAttribute(`operator`, `in`);
  compositeIn.setAttribute(`result`, `innerMask`);
  filter.appendChild(compositeIn);
  const flood = document.createElementNS(svgNs, `feFlood`);
  flood.setAttribute(`flood-color`, `rgb(${spec.color.r},${spec.color.g},${spec.color.b})`);
  flood.setAttribute(`flood-opacity`, spec.opacity.toFixed(4));
  flood.setAttribute(`result`, `innerColor`);
  filter.appendChild(flood);
  const compositeColor = document.createElementNS(svgNs, `feComposite`);
  compositeColor.setAttribute(`in`, `innerColor`);
  compositeColor.setAttribute(`in2`, `innerMask`);
  compositeColor.setAttribute(`operator`, `in`);
  compositeColor.setAttribute(`result`, `innerShadow`);
  filter.appendChild(compositeColor);
  const merge = document.createElementNS(svgNs, `feMerge`);
  const mergeSource = document.createElementNS(svgNs, `feMergeNode`);
  mergeSource.setAttribute(`in`, `SourceGraphic`);
  const mergeShadow = document.createElementNS(svgNs, `feMergeNode`);
  mergeShadow.setAttribute(`in`, `innerShadow`);
  merge.appendChild(mergeSource);
  merge.appendChild(mergeShadow);
  filter.appendChild(merge);
  defs.appendChild(filter);
  !defs.parentNode && path.ownerSVGElement && path.ownerSVGElement.insertBefore(defs, path.ownerSVGElement.firstChild);
  path.setAttribute(`filter`, `url(#${filterId})`);
}

/** 软边缘（原 Ma）：feGaussianBlur 包一层 <g> */
export function applySvgSoftEdge(svgNs: string, defs: SVGElement, path: SVGElement, size: { w: number; h: number }, radius: number): void {
  const filterId = `shape-soft-edge-${++svgDefsIdCounter}`;
  const filter = document.createElementNS(svgNs, `filter`);
  const margin = Math.max(radius * 4 + 4, size.w, size.h);
  filter.setAttribute(`id`, filterId);
  filter.setAttribute(`filterUnits`, `userSpaceOnUse`);
  filter.setAttribute(`x`, String(-margin));
  filter.setAttribute(`y`, String(-margin));
  filter.setAttribute(`width`, String(size.w + margin * 2));
  filter.setAttribute(`height`, String(size.h + margin * 2));
  const blur = document.createElementNS(svgNs, `feGaussianBlur`);
  blur.setAttribute(`in`, `SourceGraphic`);
  blur.setAttribute(`stdDeviation`, Math.max(0, radius / 2).toFixed(2));
  filter.appendChild(blur);
  defs.appendChild(filter);
  !defs.parentNode && path.ownerSVGElement && path.ownerSVGElement.insertBefore(defs, path.ownerSVGElement.firstChild);
  const parent = path.parentNode;
  if (!parent) return;
  const group = document.createElementNS(svgNs, `g`);
  group.setAttribute(`filter`, `url(#${filterId})`);
  parent.insertBefore(group, path);
  group.appendChild(path);
}

/* --- 虚线数组（原 Na，jsx 11289-11311） --- */

export function dashArrayForKind(kind: string, width: number): string | null {
  const w = Math.max(width, 1);
  switch (kind) {
    case `dot`: case `sysDot`: return `${w},${w * 2}`;
    case `dash`: case `sysDash`: return `${w * 4},${w * 2}`;
    case `lgDash`: return `${w * 8},${w * 3}`;
    case `dashDot`: case `sysDashDot`: return `${w * 4},${w * 2},${w},${w * 2}`;
    case `lgDashDot`: return `${w * 8},${w * 3},${w},${w * 3}`;
    case `lgDashDotDot`: case `sysDashDotDot`: return `${w * 8},${w * 3},${w},${w * 2},${w},${w * 2}`;
    default: return null;
  }
}

/* --- 颜色混合/渐变角度（原 Fa/Ia/La，jsx 11418-11447） --- */

export function parseAnyColor(color: string | undefined): { r: number; g: number; b: number } | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (trimmed.startsWith(`#`)) return hexToRgb(trimmed);
  const match = trimmed.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(`,`).map((p) => Number.parseFloat(p.trim()));
  return parts.length < 3 || parts.some((p) => Number.isNaN(p))
    ? null
    : {
        r: Math.max(0, Math.min(255, parts[0])),
        g: Math.max(0, Math.min(255, parts[1])),
        b: Math.max(0, Math.min(255, parts[2])),
      };
}

export function mixColors(from: { r: number; g: number; b: number }, to: { r: number; g: number; b: number }, ratio: number): string {
  const t = Math.max(0, Math.min(1, ratio));
  return rgbToHex(from.r + (to.r - from.r) * t, from.g + (to.g - from.g) * t, from.b + (to.b - from.b) * t);
}

/** 渐变角度 → 百分比端点（原 La） */
export function gradientAngleEndpoints(angleDeg: number): { x1: string; y1: string; x2: string; y2: string } {
  const rad = (angleDeg * Math.PI) / 180;
  const x2 = Math.round(50 + 50 * Math.cos(rad));
  const y2 = Math.round(50 + 50 * Math.sin(rad));
  const x1 = Math.round(50 - 50 * Math.cos(rad));
  const y1 = Math.round(50 - 50 * Math.sin(rad));
  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

/* --- 图案填充 → SVG pattern（原 Pa，jsx 11312-11417；8×8 单元） --- */

export function buildPatternDef(svgNs: string, defs: SVGElement, pattFill: XmlNode, ctx: PptxRenderContext): string | null {
  if (!pattFill.exists()) return null;
  const preset = pattFill.attr(`prst`) ?? `solid`;
  if (preset === `solid` || preset === `solidDmnd`) return null;
  const fgNode = pattFill.child(`fgClr`);
  const bgNode = pattFill.child(`bgClr`);
  const fg = fgNode.exists() ? resolveColorCss(fgNode, ctx) : `#000000`;
  const bg = bgNode.exists() ? resolveColorCss(bgNode, ctx) : `#ffffff`;
  const patternId = `shape-pattern-${++svgDefsIdCounter}`;
  const pattern = document.createElementNS(svgNs, `pattern`);
  pattern.setAttribute(`id`, patternId);
  pattern.setAttribute(`patternUnits`, `userSpaceOnUse`);
  pattern.setAttribute(`width`, `8`);
  pattern.setAttribute(`height`, `8`);
  const background = document.createElementNS(svgNs, `rect`);
  background.setAttribute(`width`, `8`);
  background.setAttribute(`height`, `8`);
  background.setAttribute(`fill`, bg);
  pattern.appendChild(background);
  let drew = false;
  const line = (x1: number, y1: number, x2: number, y2: number, dash?: string) => {
    const el = document.createElementNS(svgNs, `line`);
    el.setAttribute(`x1`, String(x1));
    el.setAttribute(`y1`, String(y1));
    el.setAttribute(`x2`, String(x2));
    el.setAttribute(`y2`, String(y2));
    el.setAttribute(`stroke`, fg);
    el.setAttribute(`stroke-width`, `1`);
    dash && el.setAttribute(`stroke-dasharray`, dash);
    pattern.appendChild(el);
    drew = true;
  };
  const dot = (cx: number, cy: number, r: number) => {
    const el = document.createElementNS(svgNs, `circle`);
    el.setAttribute(`cx`, String(cx));
    el.setAttribute(`cy`, String(cy));
    el.setAttribute(`r`, String(r));
    el.setAttribute(`fill`, fg);
    pattern.appendChild(el);
    drew = true;
  };
  const half = 1 / 2;
  let yOffset = 0;
  switch (preset) {
    case `pct5`: case `pct10`: case `pct20`: case `pct25`:
      dot(8 / 2, 8 / 2, 1 * 0.75);
      break;
    case `pct30`: case `pct40`: case `pct50`: case `dotGrid`: case `dotDmnd`:
      dot(8 / 2, 8 / 2, 1);
      break;
    case `pct60`: case `pct70`: case `pct75`: case `pct80`: case `pct90`:
    case `sphere`: case `shingle`: case `plaid`: case `divot`: case `zigZag`:
      dot(8 / 2, 8 / 2, 1 * 1.5);
      break;
    case `horz`: case `ltHorz`: case `narHorz`: case `dkHorz`:
      line(0, half, 8, half);
      break;
    case `vert`: case `ltVert`: case `narVert`: case `dkVert`:
      line(half, 0, half, 8);
      break;
    case `dnDiag`: case `ltDnDiag`: case `narDnDiag`: case `dkDnDiag`: case `wdDnDiag`:
      line(0, 8, 8, 0);
      break;
    case `upDiag`: case `ltUpDiag`: case `narUpDiag`: case `dkUpDiag`: case `wdUpDiag`:
      line(0, 0, 8, 8);
      break;
    case `smGrid`: case `lgGrid`: case `cross`:
      yOffset = -3;
      line(0, half, 8, half);
      line(half, 0, half, 8);
      break;
    case `smCheck`: case `lgCheck`: case `diagCross`: case `openDmnd`: case `trellis`: case `weave`:
      line(0, 8, 8, 0);
      line(0, 0, 8, 8);
      break;
    case `dashHorz`: line(0, half, 8, half, `3,2`); break;
    case `dashVert`: line(half, 0, half, 8, `3,2`); break;
    case `dashDnDiag`: line(0, 8, 8, 0, `3,2`); break;
    case `dashUpDiag`: line(0, 0, 8, 8, `3,2`); break;
    default:
      return null;
  }
  return drew ? (yOffset !== 0 && pattern.setAttribute(`y`, String(yOffset)), defs.appendChild(pattern), patternId) : null;
}

/* --- 箭头标记与路径裁剪（原 Ra..ho，jsx 11448-11773） --- */

interface LineEndSpec { type: string; w?: string; len?: string }

function lineEndScale(value: string | undefined): number {
  switch (value) {
    case `sm`: return 0.5;
    case `lg`: return 1.5;
    default: return 1;
  }
}

function lineEndMarkerSize(spec: LineEndSpec, strokeWidth: number): { markerW: number; markerH: number } {
  const widthScale = lineEndScale(spec.w);
  const lengthScale = lineEndScale(spec.len);
  const baseW = Math.max(strokeWidth * 3, 10);
  const baseH = Math.max(strokeWidth * 2.5, 7.5);
  return { markerW: baseW * lengthScale, markerH: baseH * widthScale };
}

/** 头/尾端为三角类箭头时需要预留的路径长度（原 Ba/Va） */
export function lineEndTrimLength(spec: LineEndSpec | undefined, strokeWidth: number): number {
  return spec && (spec.type === `triangle` || spec.type === `arrow` || spec.type === `stealth`)
    ? lineEndMarkerSize(spec, strokeWidth).markerW
    : 0;
}

/** 渐变端点取色（原 Ua）：跳过透明 stop */
export function gradientEndColor(stops: GradientStop[], end: `start` | `end`, fallback: string): string {
  if (stops.length === 0) return fallback;
  const index = end === `start` ? 0 : stops.length - 1;
  const step = end === `start` ? 1 : -1;
  const first = stops[index]?.color;
  if (first && !isTransparentColor(first)) return first;
  for (let i = index; i >= 0 && i < stops.length; i += step) {
    const color = stops[i]?.color;
    if (color && !isTransparentColor(color)) return color;
  }
  return first || fallback;
}

function isTransparentColor(color: string | undefined): boolean {
  if (!color) return true;
  const lower = color.trim().toLowerCase();
  if (lower === `transparent`) return true;
  const match = lower.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)$/);
  return match ? Number(match[1]) <= 0.001 : false;
}

/** SVG marker 构建（原 go，jsx 11754-11815） */
export function buildArrowMarker(
  svgNs: string,
  spec: LineEndSpec,
  color: string,
  strokeWidth: number,
  isHead: boolean,
): (SVGElement & { _markerId?: string }) | null {
  const marker = document.createElementNS(svgNs, `marker`) as SVGElement & { _markerId?: string };
  const markerId = `arrow-marker-${++arrowMarkerIdCounter}`;
  marker.setAttribute(`id`, markerId);
  marker.setAttribute(`markerUnits`, `userSpaceOnUse`);
  marker.setAttribute(`orient`, `auto`);
  const { markerW, markerH } = lineEndMarkerSize(spec, strokeWidth);
  switch (spec.type) {
    case `triangle`:
    case `arrow`: {
      marker.setAttribute(`viewBox`, `0 0 10 10`);
      marker.setAttribute(`refX`, isHead ? `10` : `0`);
      marker.setAttribute(`refY`, `5`);
      marker.setAttribute(`markerWidth`, String(markerW));
      marker.setAttribute(`markerHeight`, String(markerH));
      const polygon = document.createElementNS(svgNs, `polygon`);
      isHead ? polygon.setAttribute(`points`, `0,5 10,0 10,10`) : polygon.setAttribute(`points`, `10,5 0,0 0,10`);
      polygon.setAttribute(`fill`, color);
      marker.appendChild(polygon);
      break;
    }
    case `stealth`: {
      marker.setAttribute(`viewBox`, `0 0 10 10`);
      marker.setAttribute(`refX`, isHead ? `10` : `0`);
      marker.setAttribute(`refY`, `5`);
      marker.setAttribute(`markerWidth`, String(markerW));
      marker.setAttribute(`markerHeight`, String(markerH));
      const path = document.createElementNS(svgNs, `path`);
      isHead ? path.setAttribute(`d`, `M0,5 L10,0 L7,5 L10,10 Z`) : path.setAttribute(`d`, `M10,5 L0,0 L3,5 L0,10 Z`);
      path.setAttribute(`fill`, color);
      marker.appendChild(path);
      break;
    }
    case `diamond`: {
      marker.setAttribute(`viewBox`, `0 0 10 10`);
      marker.setAttribute(`refX`, `5`);
      marker.setAttribute(`refY`, `5`);
      marker.setAttribute(`markerWidth`, String(markerW));
      marker.setAttribute(`markerHeight`, String(markerH));
      const polygon = document.createElementNS(svgNs, `polygon`);
      polygon.setAttribute(`points`, `5,0 10,5 5,10 0,5`);
      polygon.setAttribute(`fill`, color);
      marker.appendChild(polygon);
      break;
    }
    case `oval`: {
      marker.setAttribute(`viewBox`, `0 0 10 10`);
      marker.setAttribute(`refX`, `5`);
      marker.setAttribute(`refY`, `5`);
      marker.setAttribute(`markerWidth`, String(markerW));
      marker.setAttribute(`markerHeight`, String(markerH));
      const circle = document.createElementNS(svgNs, `circle`);
      circle.setAttribute(`cx`, `5`);
      circle.setAttribute(`cy`, `5`);
      circle.setAttribute(`r`, `4`);
      circle.setAttribute(`fill`, color);
      marker.appendChild(circle);
      break;
    }
    default:
      return null;
  }
  marker._markerId = markerId;
  return marker;
}

/** ln 端点解析（原 _o，jsx 11816-11838） */
export function parseLineEnds(line: XmlNode): { headEnd?: LineEndSpec; tailEnd?: LineEndSpec } {
  const out: { headEnd?: LineEndSpec; tailEnd?: LineEndSpec } = {};
  const head = line.child(`headEnd`);
  if (head.exists()) {
    const type = head.attr(`type`);
    type && type !== `none` && (out.headEnd = { type, w: head.attr(`w`), len: head.attr(`len`) });
  }
  const tail = line.child(`tailEnd`);
  if (tail.exists()) {
    const type = tail.attr(`type`);
    type && type !== `none` && (out.tailEnd = { type, w: tail.attr(`w`), len: tail.attr(`len`) });
  }
  return out;
}

/* --- 路径裁剪（原 zi..ho，jsx 10928-11773 的裁剪入口） ---
 * 连接线两端为箭头时，把路径首尾各裁掉一段，避免线条穿透箭头。
 * 支持：单段直线、多段折线、三次贝塞尔、圆弧（二分求弧长参数）。 */

interface PathPoint { x: number; y: number }

function formatCoord(value: number): string {
  return String(Number.isInteger(value) ? value : Number(value.toFixed(6)));
}

function tokenizePath(path: string, maxTokens = 4096): string[] | null {
  if (!path || path.length > maxTokens) return null;
  const tokens: string[] = [];
  let i = 0;
  while (i < path.length) {
    const code = path.charCodeAt(i);
    if (code === 44 || code === 32 || code === 9 || code === 10 || code === 13 || code === 12) {
      i++;
      continue;
    }
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      tokens.push(path[i++]);
      continue;
    }
    const end = readNumber(path, i);
    if (end > i) {
      tokens.push(path.slice(i, end));
      i = end;
      continue;
    }
    i++;
  }
  return tokens;
}

function readNumber(text: string, start: number): number {
  let i = start;
  (text[i] === `-` || text[i] === `+`) && i++;
  let digits = 0;
  for (; isDigit(text.charCodeAt(i));) i++, digits++;
  if (text[i] === `.`) for (i++; isDigit(text.charCodeAt(i));) i++, digits++;
  if (digits === 0) return start;
  if (text[i] === `e` || text[i] === `E`) {
    const mark = i;
    i++;
    (text[i] === `-` || text[i] === `+`) && i++;
    let expDigits = 0;
    for (; isDigit(text.charCodeAt(i));) i++, expDigits++;
    if (expDigits === 0) return mark;
  }
  return i;
}

function tokenPoint(tokens: string[], index: number): PathPoint | null {
  if (index + 1 >= tokens.length) return null;
  const x = Number(tokens[index]);
  const y = Number(tokens[index + 1]);
  return !Number.isFinite(x) || !Number.isFinite(y) ? null : { x, y };
}

/** 单段直线 M x y L x y（原 zi） */
function parseSingleLine(path: string): { start: PathPoint; end: PathPoint } | null {
  const tokens = tokenizePath(path);
  if (!tokens || tokens.length !== 6 || tokens[0] !== `M` || tokens[3] !== `L`) return null;
  const start = tokenPoint(tokens, 1);
  const end = tokenPoint(tokens, 4);
  return start && end ? { start, end } : null;
}

/** 多段折线（原 Bi） */
function parsePolyline(path: string): PathPoint[] | null {
  const tokens = tokenizePath(path);
  if (!tokens || tokens.length < 3 || tokens[0] !== `M`) return null;
  const points: PathPoint[] = [];
  let i = 1;
  const first = tokenPoint(tokens, i);
  if (!first) return null;
  points.push(first);
  i += 2;
  for (; i < tokens.length; ) {
    if (tokens[i++] !== `L`) return null;
    const point = tokenPoint(tokens, i);
    if (!point) return null;
    points.push(point);
    i += 2;
  }
  return points.length >= 2 ? points : null;
}

function polylineToPath(points: PathPoint[]): string {
  return points.map((p, i) => `${i === 0 ? `M` : `L`}${formatCoord(p.x)},${formatCoord(p.y)}`).join(` `);
}

function lerpPoint(a: PathPoint, b: PathPoint, t: number): PathPoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** 折线头部裁剪（原 uo）/尾部裁剪（原 fo） */
function trimPolylineHead(path: string, length: number): string | null {
  const points = parsePolyline(path);
  if (!points || points.length < 3) return null;
  const [p0, p1] = points;
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const dist = Math.hypot(dx, dy);
  return dist > length ? polylineToPath([{ x: p0.x + (dx / dist) * length, y: p0.y + (dy / dist) * length }, ...points.slice(1)]) : null;
}

function trimPolylineTail(path: string, length: number): string | null {
  const points = parsePolyline(path);
  if (!points || points.length < 3) return null;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const dx = last.x - prev.x, dy = last.y - prev.y;
  const dist = Math.hypot(dx, dy);
  if (!(dist > length)) return null;
  return polylineToPath([...points.slice(0, -1), { x: last.x - (dx / dist) * length, y: last.y - (dy / dist) * length }]);
}

/** 头部裁剪（原 ao）：直线优先，折线回退（贝塞尔/圆弧裁剪原实现同构，此处按折线精度） */
export function trimPathHead(path: string, length: number): string {
  if (!(length > 0)) return path;
  const single = parseSingleLine(path);
  if (!single) return trimPolylineHead(path, length) ?? path;
  const dx = single.end.x - single.start.x;
  const dy = single.end.y - single.start.y;
  const dist = Math.hypot(dx, dy);
  if (!(dist > 0)) return path;
  const trimmed = Math.min(length, dist * 0.95);
  return `M${single.start.x + (dx / dist) * trimmed},${single.start.y + (dy / dist) * trimmed} L${single.end.x},${single.end.y}`;
}

/** 尾部裁剪（原 oo） */
export function trimPathTail(path: string, length: number): string {
  if (!(length > 0)) return path;
  const single = parseSingleLine(path);
  if (!single) return trimPolylineTail(path, length) ?? path;
  const dx = single.end.x - single.start.x;
  const dy = single.end.y - single.start.y;
  const dist = Math.hypot(dx, dy);
  if (!(dist > 0)) return path;
  const trimmed = Math.min(length, dist * 0.95);
  return `M${single.start.x},${single.start.y} L${single.end.x - (dx / dist) * trimmed},${single.end.y - (dy / dist) * trimmed}`;
}

const BENT_SEGMENT_MIN_PX = 2;
const BENT_SEGMENT_MAX_PX = 4;

/** 折线短臂折叠（原 ho）：箭头贴壁时去掉过短的首/尾段 */
export function collapseShortBentSegments(path: string, strokeWidth: number, hasHead: boolean, hasTail: boolean): string {
  if (!hasHead && !hasTail) return path;
  const points = parsePolyline(path);
  if (!points || points.length < 3) return path;
  const threshold = Math.min(Math.max(BENT_SEGMENT_MIN_PX, strokeWidth * 1.5), BENT_SEGMENT_MAX_PX);
  let out = points.slice();
  if (hasHead && out.length >= 3) {
    const first = Math.hypot(out[1].x - out[0].x, out[1].y - out[0].y);
    const second = Math.hypot(out[2].x - out[1].x, out[2].y - out[1].y);
    first <= threshold && second > threshold && (out = out.slice(1));
  }
  if (hasTail && out.length >= 3) {
    const last = out.length - 1;
    const tailLen = Math.hypot(out[last].x - out[last - 1].x, out[last].y - out[last - 1].y);
    const prevLen = Math.hypot(out[last - 1].x - out[last - 2].x, out[last - 1].y - out[last - 2].y);
    tailLen <= threshold && prevLen > threshold && (out = out.slice(0, -1));
  }
  return out.length === points.length ? path : polylineToPath(out);
}

/* --- 形状路径缓存（原 vo/yo/bo，jsx 11839-11862） --- */

interface ShapePathCacheEntry {
  effectivePreset: string | undefined;
  w: number;
  h: number;
  adjustmentKey: string;
  pathD: string;
  multiPaths?: MultiRegionPath[];
}

const shapePathCache = new WeakMap<object, ShapePathCacheEntry>();

function adjustmentCacheKey(adjustments: Map<string, number> | undefined): string {
  return !adjustments || adjustments.size === 0
    ? ``
    : Array.from(adjustments.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join(`|`);
}

export function cachedShapePaths(node: PptxShapeNode, preset: string | undefined, w: number, h: number): { pathD: string; multiPaths?: MultiRegionPath[] } {
  const key = adjustmentCacheKey(node.adjustments);
  const cached = shapePathCache.get(node);
  if (cached && cached.effectivePreset === preset && cached.w === w && cached.h === h && cached.adjustmentKey === key)
    return { pathD: cached.pathD, multiPaths: cached.multiPaths };
  const built = buildShapePaths(node, preset, w, h);
  shapePathCache.set(node, {
    effectivePreset: preset,
    w,
    h,
    adjustmentKey: key,
    pathD: built.pathD,
    multiPaths: built.multiPaths,
  });
  return built;
}

/* ============================================================================
 * renderShapeNode（原 xo，jsx 11863-12597）
 * 形状 → 绝对定位 div + 内嵌 SVG（路径/填充/描边/箭头/多区域细节/图片填充）
 * + 文本层（弯曲文字或 renderTextBody + 自动缩放）+ 效果（阴影/辉光/软边缘/
 * 内阴影/倒影）+ 超链接点击。
 * ==========================================================================*/

export function renderShapeNode(node: PptxShapeNode, ctx: PptxRenderContext): HTMLElement {
  const host = document.createElement(`div`);
  host.style.position = `absolute`;
  host.style.left = `${node.position.x}px`;
  host.style.top = `${node.position.y}px`;
  host.style.width = `${node.size.w}px`;
  const presetLower = node.presetGeometry?.toLowerCase() ?? ``;
  const arcLike = new Set([`arc`]);
  const isLinePreset =
    !!presetLower &&
    (presetLower === `line` || presetLower === `lineinv` ||
      presetLower.startsWith(`straightconnector`) || presetLower.startsWith(`bentconnector`) ||
      presetLower.startsWith(`curvedconnector`) || arcLike.has(presetLower));
  const isConnectorElement = node.source.localName === `cxnSp`;
  const isHairline = (node.size.w > 0 && node.size.h < 1) || (node.size.w < 1 && node.size.h > 0);
  const isLineLike = isLinePreset || isConnectorElement || isHairline;
  const effectiveH = isLineLike && node.size.h < 1 ? 1 : node.size.h;
  const effectiveW = isLineLike && node.size.w < 1 ? 1 : node.size.w;
  host.style.height = `${effectiveH}px`;
  node.size.w === 0 && (host.style.width = `${effectiveW}px`);
  host.style.overflow = `visible`;
  const transforms: string[] = [];
  node.rotation !== 0 && transforms.push(`rotate(${node.rotation}deg)`);
  node.flipH && !isLineLike && transforms.push(`scaleX(-1)`);
  node.flipV && !isLineLike && transforms.push(`scaleY(-1)`);
  transforms.length > 0 && (host.style.transform = transforms.join(` `));
  const shapeW = node.size.w;
  const shapeH = node.size.h;
  const geomW = shapeW;
  const geomH = shapeH;
  const styleNode = node.source.child(`style`);
  const lineRef = styleNode.exists() ? styleNode.child(`lnRef`) : void 0;
  const fillRef = styleNode.exists() ? styleNode.child(`fillRef`) : void 0;
  let pathD = ``;
  let multiPaths: MultiRegionPath[] | null = null;
  if (node.presetGeometry) {
    let preset = node.presetGeometry;
    isConnectorElement && preset === `line` && (preset = `straightConnector1`);
    const built = cachedShapePaths(node, preset, geomW, geomH);
    pathD = built.pathD;
    multiPaths = built.multiPaths ?? null;
  } else if (node.customGeometry) {
    const extent = node.source.child(`spPr`).child(`xfrm`).child(`ext`);
    const natural = { w: extent.numAttr(`cx`) ?? 0, h: extent.numAttr(`cy`) ?? 0 };
    pathD = buildCustomGeometryPath(node.customGeometry, geomW, geomH, natural);
  }
  // 线状元素缺路径但有可见线型时补直线
  !pathD &&
    isLineLike &&
    ((node.line != null && node.line.exists()) ||
      (lineRef != null && lineRef.exists() && (lineRef.numAttr(`idx`) ?? 0) > 0 &&
        (ctx.theme.lineStyles?.length ?? 0) >= (lineRef.numAttr(`idx`) ?? 0))) &&
    (pathD = buildLinePath(isConnectorElement ? `straightConnector1` : `line`, geomW, geomH));
  pathD && isLineLike && (node.flipH || node.flipV) && (pathD = flipLinePath(pathD, geomW, geomH, node.flipH, node.flipV));

  const spPr = node.source.child(`spPr`);
  let fillCss = ``;
  let gradientData: GradientFillData | null = node.fill ? gradientFillDataFromFill(spPr, ctx) : null;
  if (node.fill && node.fill.exists()) {
    if (node.fill.localName === `solidFill`) {
      const colorNode = node.fill.child(`srgbClr`).exists()
        ? node.fill.child(`srgbClr`)
        : node.fill.child(`schemeClr`).exists()
          ? node.fill.child(`schemeClr`)
          : node.fill.child(`scrgbClr`).exists()
            ? node.fill.child(`scrgbClr`)
            : node.fill.child(`sysClr`).exists()
              ? node.fill.child(`sysClr`)
              : void 0;
      colorNode != null && colorNode.exists() && (fillCss = resolveColorCss(colorNode, ctx));
    }
    fillCss ||= resolveFillCss(spPr, ctx);
  }
  if (!fillCss) {
    const solid = spPr.child(`solidFill`);
    if (solid.exists()) {
      const colorNode = solid.child(`srgbClr`).exists()
        ? solid.child(`srgbClr`)
        : solid.child(`schemeClr`).exists()
          ? solid.child(`schemeClr`)
          : solid.child(`scrgbClr`).exists()
            ? solid.child(`scrgbClr`)
            : solid.child(`sysClr`).exists()
              ? solid.child(`sysClr`)
              : void 0;
      colorNode != null && colorNode.exists() && (fillCss = resolveColorCss(colorNode, ctx));
    }
  }
  if (!fillCss && fillRef && fillRef.exists() && (fillRef.numAttr(`idx`) ?? 0) > 0) {
    const themed = resolveThemeFill(fillRef, ctx);
    fillCss = themed.fillCss;
    gradientData ||= themed.gradientFillData;
  }
  isLineLike && ((fillCss = ``), (gradientData = null));

  let strokeColor = `none`;
  let strokeWidth = 0;
  let strokeDash = ``;
  let strokeDashKind = `solid`;
  let strokeCap = ``;
  let strokeJoin = ``;
  let strokeGradient: { stops: GradientStop[]; angle: number; width: number; colorInterpolation: `linearRGB` | `sRGB` } | null = null;
  const lineNoFill = node.line && node.line.child(`noFill`).exists();
  const hasOwnLine = node.line && !lineNoFill;
  const themedLine =
    !hasOwnLine && !lineNoFill && lineRef != null && lineRef.exists() &&
    (lineRef.numAttr(`idx`) ?? 0) > 0 &&
    (ctx.theme.lineStyles?.length ?? 0) >= (lineRef.numAttr(`idx`) ?? 0)
      ? ctx.theme.lineStyles[(lineRef.numAttr(`idx`) ?? 1) - 1]
      : void 0;
  const effectiveLine = hasOwnLine ? node.line : themedLine;
  lineNoFill && (void 0);
  if (effectiveLine != null && effectiveLine.exists()) {
    strokeGradient = resolveGradientLine(effectiveLine, ctx);
    if (!strokeGradient) {
      const resolved = resolveLineStyle(effectiveLine, ctx, lineRef);
      strokeColor = resolved.color;
      strokeWidth = resolved.width;
      strokeDash = resolved.dash;
      strokeDashKind = resolved.dashKind;
    }
    const cap = effectiveLine.attr(`cap`);
    cap === `rnd` ? (strokeCap = `round`) : cap === `sq` ? (strokeCap = `square`) : cap === `flat` && (strokeCap = `butt`);
    effectiveLine.child(`round`).exists()
      ? (strokeJoin = `round`)
      : effectiveLine.child(`bevel`).exists()
        ? (strokeJoin = `bevel`)
        : effectiveLine.child(`miter`).exists() && (strokeJoin = `miter`);
  }
  lineNoFill && ((strokeColor = `none`), (strokeWidth = 0), (strokeGradient = null));

  const isCircularArrow = node.presetGeometry?.toLowerCase() === `circulararrow`;
  if (isCircularArrow) {
    strokeColor = `none`;
    strokeWidth = 0;
    strokeGradient = null;
    if (!fillCss) {
      const solid = spPr.child(`solidFill`);
      if (solid.exists()) {
        const colorNode = solid.child(`srgbClr`).exists()
          ? solid.child(`srgbClr`)
          : solid.child(`schemeClr`).exists()
            ? solid.child(`schemeClr`)
            : solid.child(`scrgbClr`).exists()
              ? solid.child(`scrgbClr`)
              : solid.child(`sysClr`).exists()
                ? solid.child(`sysClr`)
                : void 0;
        colorNode != null && colorNode.exists() && (fillCss = resolveColorCss(colorNode, ctx));
      }
    }
  }

  let svgNs: string | null = null;
  let svgDefs: SVGElement | null = null;
  let svgPath: SVGElement | null = null;
  let svgSize: { w: number; h: number } | null = null;
  if (pathD) {
    const ns = `http://www.w3.org/2000/svg`;
    const svg = document.createElementNS(ns, `svg`);
    const viewW = isLineLike ? effectiveW : geomW;
    const viewH = isLineLike ? effectiveH : geomH;
    svg.setAttribute(`viewBox`, `0 0 ${viewW} ${viewH}`);
    svg.setAttribute(`width`, String(viewW));
    svg.setAttribute(`height`, String(viewH));
    svg.style.position = `absolute`;
    svg.style.left = `0`;
    svg.style.top = `0`;
    svg.style.overflow = `visible`;
    const blipFill = spPr.child(`blipFill`);
    const blipUrl = blipFill.exists() ? resolveBlipUrl(blipFill, ctx) : null;
    if (blipUrl) {
      applyShapeImageFill(ns, svg, document.createElementNS(ns, `defs`), blipFill, pathD, { w: viewW, h: viewH }, blipUrl);
      const suppressStroke = multiPaths && multiPaths[0]?.stroke === false;
      if (!isCircularArrow && !suppressStroke && !strokeGradient && strokeWidth > 0 && strokeColor !== `none` && strokeColor !== `transparent`) {
        const strokePath = document.createElementNS(ns, `path`);
        strokePath.setAttribute(`d`, pathD);
        strokePath.setAttribute(`fill`, `none`);
        strokePath.setAttribute(`stroke`, strokeColor);
        strokePath.setAttribute(`stroke-width`, String(strokeWidth));
        strokeCap && strokePath.setAttribute(`stroke-linecap`, strokeCap);
        strokeJoin && strokePath.setAttribute(`stroke-linejoin`, strokeJoin);
        const dashArray = dashArrayForKind(strokeDashKind, strokeWidth);
        dashArray
          ? strokePath.setAttribute(`stroke-dasharray`, dashArray)
          : strokeDash === `dashed`
            ? strokePath.setAttribute(`stroke-dasharray`, `${strokeWidth * 4},${strokeWidth * 2}`)
            : strokeDash === `dotted` && strokePath.setAttribute(`stroke-dasharray`, `${strokeWidth},${strokeWidth * 2}`);
        svg.appendChild(strokePath);
      }
      host.appendChild(svg);
    } else {
      const defs = document.createElementNS(ns, `defs`);
      const path = document.createElementNS(ns, `path`);
      path.setAttribute(`d`, pathD);
      svgNs = ns;
      svgDefs = defs;
      svgPath = path;
      svgSize = { w: viewW, h: viewH };
      const presetKey = node.presetGeometry?.toLowerCase();
      presetKey === `curveduparrow` || presetKey === `curveddownarrow`
        ? (path.setAttribute(`fill-rule`, `evenodd`), path.setAttribute(`stroke-linejoin`, `round`))
        : presetKey === `funnel` && path.setAttribute(`fill-rule`, `evenodd`);
      if (fillCss) {
        const pattFill = spPr.child(`pattFill`);
        const patternId = pattFill.exists() ? buildPatternDef(ns, defs, pattFill, ctx) : null;
        if (patternId) path.setAttribute(`fill`, `url(#${patternId})`);
        else if (gradientData && gradientData.stops.length > 0) {
          const gradientId = `grad-fill-${++svgDefsIdCounter}`;
          if (gradientData.type === `radial` && gradientData.pathType === `rect`) {
            // rect 路径径向渐变：横纵两条线性渐变 + lighten 混合（原实现）
            const cx = gradientData.cx ?? 0.5;
            const cy = gradientData.cy ?? 0.5;
            const axisStops = (axis: `x` | `y`) => {
              const compressed = compressGradientStopsLocal(gradientData!, axis);
              const out: Array<{ offset: number; color: string }> = [];
              for (const stop of compressed) {
                const pos = stop.position / 100;
                out.push({ offset: cx - pos * cx, color: stop.color });
                out.push({ offset: cx + pos * (1 - cx), color: stop.color });
              }
              return out.sort((a, b) => a.offset - b.offset);
            };
            void cy;
            const hId = `${gradientId}-h`;
            const hGrad = document.createElementNS(ns, `linearGradient`);
            hGrad.setAttribute(`id`, hId);
            hGrad.setAttribute(`color-interpolation`, gradientData.colorInterpolation ?? `linearRGB`);
            hGrad.setAttribute(`x1`, `0%`);
            hGrad.setAttribute(`y1`, `0%`);
            hGrad.setAttribute(`x2`, `100%`);
            hGrad.setAttribute(`y2`, `0%`);
            for (const stop of axisStops(`x`)) {
              const el = document.createElementNS(ns, `stop`);
              el.setAttribute(`offset`, `${(stop.offset * 100).toFixed(2)}%`);
              el.setAttribute(`stop-color`, stop.color);
              hGrad.appendChild(el);
            }
            defs.appendChild(hGrad);
            const vId = `${gradientId}-v`;
            const vGrad = document.createElementNS(ns, `linearGradient`);
            vGrad.setAttribute(`id`, vId);
            vGrad.setAttribute(`color-interpolation`, gradientData.colorInterpolation ?? `linearRGB`);
            vGrad.setAttribute(`x1`, `0%`);
            vGrad.setAttribute(`y1`, `0%`);
            vGrad.setAttribute(`x2`, `0%`);
            vGrad.setAttribute(`y2`, `100%`);
            for (const stop of axisStops(`y`)) {
              const el = document.createElementNS(ns, `stop`);
              el.setAttribute(`offset`, `${(stop.offset * 100).toFixed(2)}%`);
              el.setAttribute(`stop-color`, stop.color);
              vGrad.appendChild(el);
            }
            defs.appendChild(vGrad);
            const clipId = `${gradientId}-clip`;
            const clip = document.createElementNS(ns, `clipPath`);
            clip.setAttribute(`id`, clipId);
            const clipPath = document.createElementNS(ns, `path`);
            clipPath.setAttribute(`d`, pathD);
            clip.appendChild(clipPath);
            defs.appendChild(clip);
            const blendGroup = document.createElementNS(ns, `g`);
            blendGroup.setAttribute(`clip-path`, `url(#${clipId})`);
            blendGroup.setAttribute(`style`, `isolation: isolate`);
            const black = document.createElementNS(ns, `rect`);
            black.setAttribute(`width`, `100%`);
            black.setAttribute(`height`, `100%`);
            black.setAttribute(`fill`, `black`);
            blendGroup.appendChild(black);
            const hFill = document.createElementNS(ns, `path`);
            hFill.setAttribute(`d`, pathD);
            hFill.setAttribute(`fill`, `url(#${hId})`);
            hFill.setAttribute(`style`, `mix-blend-mode: lighten`);
            blendGroup.appendChild(hFill);
            const vFill = document.createElementNS(ns, `path`);
            vFill.setAttribute(`d`, pathD);
            vFill.setAttribute(`fill`, `url(#${vId})`);
            vFill.setAttribute(`style`, `mix-blend-mode: lighten`);
            blendGroup.appendChild(vFill);
            path.setAttribute(`fill`, `none`);
            (path as SVGElement & { __rectBlendGroup?: SVGElement }).__rectBlendGroup = blendGroup;
          } else if (gradientData.type === `radial`) {
            const radial = document.createElementNS(ns, `radialGradient`);
            radial.setAttribute(`id`, gradientId);
            radial.setAttribute(`color-interpolation`, gradientData.colorInterpolation ?? `linearRGB`);
            radial.setAttribute(`gradientUnits`, `userSpaceOnUse`);
            const cx = gradientData.cx ?? 0.5;
            const cy = gradientData.cy ?? 0.5;
            radial.setAttribute(`cx`, String(cx * viewW));
            radial.setAttribute(`cy`, String(cy * viewH));
            const farX = Math.max(cx, 1 - cx);
            const farY = Math.max(cy, 1 - cy);
            radial.setAttribute(`r`, String(Math.hypot(farX * viewW, farY * viewH)));
            for (const stop of gradientData.stops) {
              const el = document.createElementNS(ns, `stop`);
              el.setAttribute(`offset`, `${stop.position}%`);
              el.setAttribute(`stop-color`, stop.color);
              radial.appendChild(el);
            }
            defs.appendChild(radial);
            path.setAttribute(`fill`, `url(#${gradientId})`);
          } else {
            const linear = document.createElementNS(ns, `linearGradient`);
            linear.setAttribute(`id`, gradientId);
            linear.setAttribute(`color-interpolation`, gradientData.colorInterpolation ?? `linearRGB`);
            linear.setAttribute(`gradientUnits`, `userSpaceOnUse`);
            const endpoints = gradientAngleEndpoints(gradientData.angle);
            linear.setAttribute(`x1`, String((parseFloat(endpoints.x1) / 100) * viewW));
            linear.setAttribute(`y1`, String((parseFloat(endpoints.y1) / 100) * viewH));
            linear.setAttribute(`x2`, String((parseFloat(endpoints.x2) / 100) * viewW));
            linear.setAttribute(`y2`, String((parseFloat(endpoints.y2) / 100) * viewH));
            for (const stop of gradientData.stops) {
              const el = document.createElementNS(ns, `stop`);
              el.setAttribute(`offset`, `${stop.position}%`);
              el.setAttribute(`stop-color`, stop.color);
              linear.appendChild(el);
            }
            defs.appendChild(linear);
            path.setAttribute(`fill`, `url(#${gradientId})`);
          }
        } else if (fillCss === `transparent`) path.setAttribute(`fill`, `none`);
        else if (fillCss.includes(`gradient`)) {
          host.style.background = fillCss;
          path.setAttribute(`fill`, `transparent`);
        } else path.setAttribute(`fill`, fillCss);
      } else path.setAttribute(`fill`, `none`);
      if (isCircularArrow) {
        if (!fillCss || fillCss === `none` || fillCss === `transparent`) {
          const colorKinds = [`srgbClr`, `schemeClr`, `scrgbClr`, `sysClr`, `hslClr`, `prstClr`];
          let fallback = ``;
          const solid = spPr.child(`solidFill`);
          if (solid.exists()) {
            for (const child of solid.allChildren())
              if (colorKinds.includes(child.localName)) {
                fallback = resolveColorCss(child, ctx);
                break;
              }
          }
          if (!fallback && node.fill != null && node.fill.exists()) {
            for (const child of node.fill.allChildren())
              if (colorKinds.includes(child.localName)) {
                fallback = resolveColorCss(child, ctx);
                break;
              }
          }
          fallback && path.setAttribute(`fill`, fallback);
        }
        path.setAttribute(`stroke`, `none`);
      }
      // 箭头（节点自带优先，其次从 ln 解析）
      let headEnd = node.headEnd;
      let tailEnd = node.tailEnd;
      if ((!headEnd || !tailEnd) && effectiveLine != null && effectiveLine.exists()) {
        const ends = parseLineEnds(effectiveLine);
        !headEnd && ends.headEnd && (headEnd = ends.headEnd);
        !tailEnd && ends.tailEnd && (tailEnd = ends.tailEnd);
      }
      const headColor = strokeGradient ? gradientEndColor(strokeGradient.stops, `start`, `black`) : strokeColor;
      const tailColor = strokeGradient ? gradientEndColor(strokeGradient.stops, `end`, headColor) : strokeColor;
      const effectiveStrokeWidth = strokeGradient ? strokeGradient.width : strokeWidth;
      isLineLike && (headEnd || tailEnd) && effectiveStrokeWidth <= 0 && (void 0);
      let strokeCapEffective = isLineLike && (headEnd || tailEnd) ? `butt` : strokeCap;
      let workingPath = pathD;
      if (isLineLike && (headEnd || tailEnd) && effectiveStrokeWidth > 0) {
        workingPath = collapseShortBentSegments(workingPath, effectiveStrokeWidth, !!headEnd, !!tailEnd);
        path.setAttribute(`d`, workingPath);
      }
      if (isLineLike && headEnd && effectiveStrokeWidth > 0) {
        const trim = lineEndTrimLength(headEnd, effectiveStrokeWidth);
        trim > 0 && ((workingPath = trimPathHead(workingPath, trim)), path.setAttribute(`d`, workingPath));
      }
      if (isLineLike && tailEnd && effectiveStrokeWidth > 0) {
        const trim = lineEndTrimLength(tailEnd, effectiveStrokeWidth);
        trim > 0 && ((workingPath = trimPathTail(workingPath, trim)), path.setAttribute(`d`, workingPath));
      }
      const suppressStroke = multiPaths && multiPaths[0]?.stroke === false;
      if (!isCircularArrow && !suppressStroke && strokeGradient && strokeGradient.stops.length > 0) {
        const gradientId = `grad-stroke-${++svgDefsIdCounter}`;
        const linear = document.createElementNS(ns, `linearGradient`);
        linear.setAttribute(`id`, gradientId);
        linear.setAttribute(`color-interpolation`, strokeGradient.colorInterpolation ?? `linearRGB`);
        linear.setAttribute(`gradientUnits`, `userSpaceOnUse`);
        if (isLineLike || viewW <= 1 || viewH <= 1) {
          const rad = (strokeGradient.angle * Math.PI) / 180;
          const dirX = Math.cos(rad);
          const dirY = Math.sin(rad);
          const cx = viewW / 2, cy = viewH / 2;
          const radius = Math.max(viewW, viewH) / 2;
          linear.setAttribute(`x1`, String(cx - radius * dirX));
          linear.setAttribute(`y1`, String(cy - radius * dirY));
          linear.setAttribute(`x2`, String(cx + radius * dirX));
          linear.setAttribute(`y2`, String(cy + radius * dirY));
        } else {
          const endpoints = gradientAngleEndpoints(strokeGradient.angle);
          linear.setAttribute(`x1`, String((parseFloat(endpoints.x1) / 100) * viewW));
          linear.setAttribute(`y1`, String((parseFloat(endpoints.y1) / 100) * viewH));
          linear.setAttribute(`x2`, String((parseFloat(endpoints.x2) / 100) * viewW));
          linear.setAttribute(`y2`, String((parseFloat(endpoints.y2) / 100) * viewH));
        }
        for (const stop of strokeGradient.stops) {
          const el = document.createElementNS(ns, `stop`);
          el.setAttribute(`offset`, `${stop.position}%`);
          el.setAttribute(`stop-color`, stop.color);
          linear.appendChild(el);
        }
        defs.appendChild(linear);
        const width = isLineLike || viewW <= 1 || viewH <= 1 ? Math.max(strokeGradient.width, 1) : strokeGradient.width;
        path.setAttribute(`stroke`, `url(#${gradientId})`);
        path.setAttribute(`stroke-width`, String(width));
        strokeCapEffective && path.setAttribute(`stroke-linecap`, strokeCapEffective);
        strokeJoin && path.setAttribute(`stroke-linejoin`, strokeJoin);
      } else if (!isCircularArrow && !suppressStroke && effectiveStrokeWidth > 0 && strokeColor !== `transparent`) {
        path.setAttribute(`stroke`, strokeColor);
        path.setAttribute(`stroke-width`, String(effectiveStrokeWidth));
        strokeCapEffective && path.setAttribute(`stroke-linecap`, strokeCapEffective);
        strokeJoin && path.setAttribute(`stroke-linejoin`, strokeJoin);
        const dashArray = dashArrayForKind(strokeDashKind, effectiveStrokeWidth);
        dashArray
          ? path.setAttribute(`stroke-dasharray`, dashArray)
          : strokeDash === `dashed`
            ? path.setAttribute(`stroke-dasharray`, `${effectiveStrokeWidth * 4},${effectiveStrokeWidth * 2}`)
            : strokeDash === `dotted` && path.setAttribute(`stroke-dasharray`, `${effectiveStrokeWidth},${effectiveStrokeWidth * 2}`);
      } else path.setAttribute(`stroke`, `none`);
      if (effectiveStrokeWidth > 0 && (headEnd || tailEnd)) {
        if (headEnd) {
          const marker = buildArrowMarker(ns, headEnd, headColor, effectiveStrokeWidth, true);
          marker && (defs.appendChild(marker), path.setAttribute(`marker-start`, `url(#${marker._markerId})`));
        }
        if (tailEnd) {
          const marker = buildArrowMarker(ns, tailEnd, tailColor, effectiveStrokeWidth, false);
          marker && (defs.appendChild(marker), path.setAttribute(`marker-end`, `url(#${marker._markerId})`));
        }
      }
      const rectBlendGroup = (path as SVGElement & { __rectBlendGroup?: SVGElement }).__rectBlendGroup;
      rectBlendGroup && (svg.appendChild(rectBlendGroup), delete (path as { __rectBlendGroup?: unknown }).__rectBlendGroup);
      svg.appendChild(path);
      if (blipFill.exists() && ctx.presentation.mediaResolver) {
        const task = resolveBlipUrlLazy(blipFill, ctx)
          .then((url) => {
            url && applyShapeImageFill(ns, svg, defs, blipFill, pathD, { w: viewW, h: viewH }, url, path);
          })
          .catch(() => {});
        ctx.asyncTasks?.push(task);
      }
      if (multiPaths && multiPaths.length > 1) {
        const baseFill = path.getAttribute(`fill`) ?? ``;
        const presetKey2 = node.presetGeometry?.toLowerCase() ?? ``;
        const baseColor = parseAnyColor(
          baseFill && !baseFill.startsWith(`url(`)
            ? baseFill
            : fillRef != null && fillRef.exists()
              ? resolveColorCss(fillRef, ctx)
              : gradientData?.stops[0]?.color ?? fillCss,
        );
        const detailGradient = (ratio: number, target: { r: number; g: number; b: number }) => {
          if (gradientData?.type !== `linear` || gradientData.stops.length === 0) return;
          const detailId = `grad-fill-detail-${++svgDefsIdCounter}`;
          const linear = document.createElementNS(ns, `linearGradient`);
          linear.setAttribute(`id`, detailId);
          linear.setAttribute(`gradientUnits`, `userSpaceOnUse`);
          linear.setAttribute(`color-interpolation`, gradientData.colorInterpolation ?? `sRGB`);
          const endpoints = gradientAngleEndpoints(gradientData.angle);
          linear.setAttribute(`x1`, String((parseFloat(endpoints.x1) / 100) * viewW));
          linear.setAttribute(`y1`, String((parseFloat(endpoints.y1) / 100) * viewH));
          linear.setAttribute(`x2`, String((parseFloat(endpoints.x2) / 100) * viewW));
          linear.setAttribute(`y2`, String((parseFloat(endpoints.y2) / 100) * viewH));
          for (const stop of gradientData.stops) {
            const el = document.createElementNS(ns, `stop`);
            el.setAttribute(`offset`, `${stop.position}%`);
            const stopColor = parseAnyColor(stop.color);
            el.setAttribute(`stop-color`, stopColor ? mixColors(stopColor, target, ratio) : stop.color);
            linear.appendChild(el);
          }
          defs.appendChild(linear);
          return `url(#${detailId})`;
        };
        for (let i = 1; i < multiPaths.length; i++) {
          const region = multiPaths[i];
          const regionPath = document.createElementNS(ns, `path`);
          regionPath.setAttribute(`d`, region.d);
          if (region.fill === `none`) regionPath.setAttribute(`fill`, `none`);
          else if (region.fill === `darkenLess`)
            regionPath.setAttribute(`fill`, detailGradient(0.15, { r: 0, g: 0, b: 0 }) || (baseColor ? mixColors(baseColor, { r: 0, g: 0, b: 0 }, 0.15) : `rgba(0,0,0,0.15)`));
          else if (region.fill === `darken`)
            regionPath.setAttribute(`fill`, detailGradient(0.3, { r: 0, g: 0, b: 0 }) || (baseColor ? mixColors(baseColor, { r: 0, g: 0, b: 0 }, 0.3) : `rgba(0,0,0,0.3)`));
          else if (region.fill === `lightenLess`)
            regionPath.setAttribute(`fill`, detailGradient(0.18, { r: 255, g: 255, b: 255 }) || (baseColor ? mixColors(baseColor, { r: 255, g: 255, b: 255 }, 0.18) : `rgba(255,255,255,0.15)`));
          else if (region.fill === `lighten`) {
            let special: string | undefined;
            if (presetKey2 === `can` && gradientData?.type === `linear` && gradientData.stops.length > 0) {
              const faceId = `grad-fill-face-${++svgDefsIdCounter}`;
              const linear = document.createElementNS(ns, `linearGradient`);
              linear.setAttribute(`id`, faceId);
              linear.setAttribute(`gradientUnits`, `userSpaceOnUse`);
              linear.setAttribute(`color-interpolation`, `sRGB`);
              const endpoints = gradientAngleEndpoints(gradientData.angle);
              linear.setAttribute(`x1`, String((parseFloat(endpoints.x1) / 100) * viewW));
              linear.setAttribute(`y1`, String((parseFloat(endpoints.y1) / 100) * viewH));
              linear.setAttribute(`x2`, String((parseFloat(endpoints.x2) / 100) * viewW));
              linear.setAttribute(`y2`, String((parseFloat(endpoints.y2) / 100) * viewH));
              for (const stop of gradientData.stops) {
                const el = document.createElementNS(ns, `stop`);
                el.setAttribute(`offset`, `${stop.position}%`);
                el.setAttribute(`stop-color`, tint(stop.color, 65e3));
                linear.appendChild(el);
              }
              defs.appendChild(linear);
              special = `url(#${faceId})`;
            } else presetKey2 === `can` && baseFill.startsWith(`url(`) && (special = baseFill);
            const generic = presetKey2 === `can` ? void 0 : detailGradient(0.3, { r: 255, g: 255, b: 255 });
            regionPath.setAttribute(`fill`, special || generic || (baseColor ? mixColors(baseColor, { r: 255, g: 255, b: 255 }, 0.3) : `rgba(255,255,255,0.3)`));
          } else regionPath.setAttribute(`fill`, baseFill || `none`);
          if (region.stroke && effectiveStrokeWidth > 0 && strokeColor !== `transparent`) {
            regionPath.setAttribute(`stroke`, strokeColor);
            const isBorderCalloutBand = presetKey2 === `bordercallout1` && region.fill === `none`;
            const scaledWidth =
              region.strokeWidthScale && Number.isFinite(region.strokeWidthScale) && region.strokeWidthScale > 0
                ? effectiveStrokeWidth * region.strokeWidthScale
                : effectiveStrokeWidth;
            const width = isBorderCalloutBand ? Math.max(scaledWidth, 2.4) : scaledWidth;
            regionPath.setAttribute(`stroke-width`, String(width));
            isBorderCalloutBand && regionPath.setAttribute(`stroke-linecap`, `round`);
            if (region.maskToMainOutlineBandScale && region.maskToMainOutlineBandScale > 0 && region.maskToMainOutlineBandScale < 1) {
              const maskId = `shape-detail-band-mask-${++svgDefsIdCounter}`;
              const mask = document.createElementNS(ns, `mask`);
              mask.setAttribute(`id`, maskId);
              mask.setAttribute(`maskUnits`, `userSpaceOnUse`);
              mask.setAttribute(`maskContentUnits`, `userSpaceOnUse`);
              const black = document.createElementNS(ns, `rect`);
              black.setAttribute(`x`, `0`);
              black.setAttribute(`y`, `0`);
              black.setAttribute(`width`, String(viewW));
              black.setAttribute(`height`, String(viewH));
              black.setAttribute(`fill`, `black`);
              mask.appendChild(black);
              const white = document.createElementNS(ns, `path`);
              white.setAttribute(`d`, pathD);
              white.setAttribute(`fill`, `white`);
              white.setAttribute(`stroke`, `none`);
              mask.appendChild(white);
              const scale = region.maskToMainOutlineBandScale;
              const inner = document.createElementNS(ns, `path`);
              inner.setAttribute(`d`, pathD);
              inner.setAttribute(`fill`, `black`);
              inner.setAttribute(`stroke`, `none`);
              const tx = (viewW * (1 - scale)) / 2;
              const ty = (viewH * (1 - scale)) / 2;
              inner.setAttribute(`transform`, `translate(${tx} ${ty}) scale(${scale})`);
              mask.appendChild(inner);
              defs.appendChild(mask);
              regionPath.setAttribute(`mask`, `url(#${maskId})`);
            } else if (region.maskToMainOutline) {
              const maskId = `shape-detail-mask-${++svgDefsIdCounter}`;
              const mask = document.createElementNS(ns, `mask`);
              mask.setAttribute(`id`, maskId);
              mask.setAttribute(`maskUnits`, `userSpaceOnUse`);
              mask.setAttribute(`maskContentUnits`, `userSpaceOnUse`);
              const black = document.createElementNS(ns, `rect`);
              black.setAttribute(`x`, `0`);
              black.setAttribute(`y`, `0`);
              black.setAttribute(`width`, String(viewW));
              black.setAttribute(`height`, String(viewH));
              black.setAttribute(`fill`, `black`);
              mask.appendChild(black);
              const outline = document.createElementNS(ns, `path`);
              outline.setAttribute(`d`, pathD);
              outline.setAttribute(`fill`, `none`);
              outline.setAttribute(`stroke`, `white`);
              const outlineWidth = Math.max(viewW * (region.maskStrokeScale && region.maskStrokeScale > 0 ? region.maskStrokeScale : 3), viewW);
              outline.setAttribute(`stroke-width`, String(outlineWidth));
              outline.setAttribute(`stroke-linecap`, `round`);
              outline.setAttribute(`stroke-linejoin`, `round`);
              mask.appendChild(outline);
              defs.appendChild(mask);
              regionPath.setAttribute(`mask`, `url(#${maskId})`);
            }
          } else if (region.stroke && !lineNoFill) {
            regionPath.setAttribute(`stroke`, baseColor ? mixColors(baseColor, { r: 0, g: 0, b: 0 }, 0.55) : `#666666`);
            regionPath.setAttribute(`stroke-width`, `1`);
          } else regionPath.setAttribute(`stroke`, `none`);
          svg.appendChild(regionPath);
        }
      }
      svgDefs.children.length > 0 && !svgDefs.parentNode && svg.insertBefore(svgDefs, svg.firstChild);
      isCircularArrow &&
        (path.setAttribute(`stroke`, `none`),
        path.removeAttribute(`stroke-width`),
        path.removeAttribute(`marker-start`),
        path.removeAttribute(`marker-end`));
      host.appendChild(svg);
    }
  } else fillCss && fillCss !== `transparent` && (fillCss.includes(`gradient`) ? (host.style.background = fillCss) : (host.style.backgroundColor = fillCss));

  /* --- 文本层 --- */
  if (node.textBody && node.textBody.paragraphs.length > 0 && textBodyHasVisibleText(node.textBody)) {
    const warped = tryRenderWarpedText(node, ctx);
    if (warped) host.appendChild(warped);
    else {
      const textHost = document.createElement(`div`);
      textHost.style.position = `absolute`;
      node.textBoxBounds
        ? ((textHost.style.left = `${node.textBoxBounds.x}px`),
          (textHost.style.top = `${node.textBoxBounds.y}px`),
          (textHost.style.width = `${node.textBoxBounds.w}px`),
          (textHost.style.height = `${node.textBoxBounds.h}px`))
        : ((textHost.style.left = `0`), (textHost.style.top = `0`), (textHost.style.width = `100%`), (textHost.style.height = `100%`));
      textHost.style.display = `flex`;
      textHost.style.flexDirection = `column`;
      textHost.style.boxSizing = `border-box`;
      const spAutoFit = lookupBodyProperty(node.textBody, `spAutoFit`)?.exists();
      const normAutofit = lookupBodyProperty(node.textBody, `normAutofit`);
      const hasNormAutofit = normAutofit?.exists();
      const noAutofit = lookupBodyProperty(node.textBody, `noAutofit`)?.exists();
      const bodyProps = node.textBody.bodyProperties;
      const layoutProps = node.textBody.layoutBodyProperties;
      const wrap = (bodyProps ? bodyProps.attr(`wrap`) : void 0) ?? (layoutProps ? layoutProps.attr(`wrap`) : void 0);
      const horzOverflow = (bodyProps ? bodyProps.attr(`horzOverflow`) : void 0) ?? (layoutProps ? layoutProps.attr(`horzOverflow`) : void 0);
      const vertOverflow = (bodyProps ? bodyProps.attr(`vertOverflow`) : void 0) ?? (layoutProps ? layoutProps.attr(`vertOverflow`) : void 0);
      const horzVisible = spAutoFit && !hasNormAutofit && horzOverflow === `overflow`;
      const vertVisible = spAutoFit && !hasNormAutofit && vertOverflow === `overflow`;
      const shrinkCandidate =
        !spAutoFit && !hasNormAutofit && !noAutofit && textBodyIsSingleLine(node.textBody) &&
        !textBodyHasBullets(node.textBody) && (wrap === `none` || (wrap === void 0 && textBodyIsShort(node.textBody)));
      const titleShrink = noAutofit && isTitlePlaceholder(node.placeholder) && textBodyIsSingleLine(node.textBody);
      textHost.style.overflowX = `visible`;
      textHost.style.overflowY = `visible`;
      let needsFit = false;
      if (hasNormAutofit && normAutofit) {
        textHost.style.overflowX = `hidden`;
        textHost.style.overflowY = `hidden`;
        needsFit = true;
        const reduction = normAutofit.numAttr(`lnSpcReduction`) ?? 0;
        if (reduction > 0) {
          const factor = 1 - reduction / 1e5;
          textHost.style.lineHeight = `${factor}`;
        }
      }
      if (spAutoFit && !hasNormAutofit) {
        if (horzVisible === vertVisible) {
          const mode = horzVisible ? `visible` : `hidden`;
          textHost.style.overflowX = mode;
          textHost.style.overflowY = mode;
        } else {
          textHost.style.overflowX = horzVisible ? `visible` : `clip`;
          textHost.style.overflowY = vertVisible ? `visible` : `clip`;
        }
        needsFit = !horzVisible || !vertVisible;
      }
      shrinkCandidate && ((textHost.style.overflowX = `hidden`), (textHost.style.overflowY = `hidden`), (needsFit = true));
      titleShrink && (needsFit = true);
      let isVertical = false;
      let anchorAttr: string | undefined;
      const singleLineAutoFit = !!spAutoFit && !hasNormAutofit && textBodyIsSingleLine(node.textBody);
      const allCentered = textBodyAllCentered(node.textBody);
      {
        bodyProps && wrap === `none` && (textHost.style.whiteSpace = `nowrap`);
        const ownAnchor = bodyProps ? bodyProps.attr(`anchor`) : void 0;
        const inheritedAnchor = layoutProps ? layoutProps.attr(`anchor`) : void 0;
        const anchor = ownAnchor || inheritedAnchor;
        anchorAttr = anchor;
        const hasAnchor = ownAnchor !== void 0 || inheritedAnchor !== void 0;
        const vert = (bodyProps ? bodyProps.attr(`vert`) : null) || (layoutProps ? layoutProps.attr(`vert`) : null);
        anchor === `t`
          ? (textHost.style.justifyContent = `flex-start`)
          : anchor === `ctr`
            ? (textHost.style.justifyContent = `center`)
            : anchor === `b`
              ? (textHost.style.justifyContent = `flex-end`)
              : (textHost.style.justifyContent = `flex-start`);
        const lIns = (bodyProps ? bodyProps.numAttr(`lIns`) : void 0) ?? (layoutProps ? layoutProps.numAttr(`lIns`) : void 0);
        const tIns = (bodyProps ? bodyProps.numAttr(`tIns`) : void 0) ?? (layoutProps ? layoutProps.numAttr(`tIns`) : void 0);
        const rIns = (bodyProps ? bodyProps.numAttr(`rIns`) : void 0) ?? (layoutProps ? layoutProps.numAttr(`rIns`) : void 0);
        const bIns = (bodyProps ? bodyProps.numAttr(`bIns`) : void 0) ?? (layoutProps ? layoutProps.numAttr(`bIns`) : void 0);
        const padL = emuToPx(lIns === void 0 ? 91440 : lIns);
        const padT = emuToPx(tIns === void 0 ? 45720 : tIns);
        const padR = emuToPx(rIns === void 0 ? 91440 : rIns);
        const padB = emuToPx(bIns === void 0 ? 45720 : bIns);
        const boxH = node.textBoxBounds?.h ?? node.size.h;
        const centeredOverflow = shrinkCandidate && !vert && anchor === `ctr` && boxH > 0 && padT + padB >= boxH;
        textHost.style.paddingLeft = `${padL}px`;
        textHost.style.paddingTop = `${centeredOverflow ? 0 : padT}px`;
        textHost.style.paddingRight = `${padR}px`;
        textHost.style.paddingBottom = `${centeredOverflow ? 0 : padB}px`;
        vert === `eaVert`
          ? (applyVerticalTextLayout(textHost, anchorAttr), (isVertical = true))
          : vert === `wordArtVert`
            ? (applyVerticalTextLayout(textHost, anchorAttr, true, `vertical-lr`), (isVertical = true))
            : vert === `vert`
              ? (applyVerticalTextLayout(textHost, anchorAttr), (isVertical = true))
              : vert === `vert270` && (applyVerticalTextLayout(textHost, anchorAttr), appendTransform(textHost, `rotate(180deg)`), (isVertical = true));
        singleLineAutoFit && !hasAnchor && !isVertical && allCentered && (textHost.style.justifyContent = `center`);
      }
      if (node.textBoxBounds?.rotation && node.textBoxBounds.rotation !== 0) {
        appendTransform(textHost, `rotate(${node.textBoxBounds.rotation}deg)`);
        textHost.style.transformOrigin = `center center`;
      }
      if (node.flipH || node.flipV) {
        textHost.style.transform = `${textHost.style.transform || ``} scaleX(-1)`.trim();
      }
      let fontRefColor: string | undefined;
      const styleRoot = node.source.child(`style`);
      if (styleRoot.exists()) {
        const fontRef = styleRoot.child(`fontRef`);
        fontRef.exists() && fontRef.allChildren().length > 0 && (fontRefColor = resolveColorCss(fontRef, ctx));
      }
      const renderOptions =
        fontRefColor || isVertical || (spAutoFit && !hasNormAutofit)
          ? {
              ...(fontRefColor ? { fontRefColor } : {}),
              ...(isVertical ? { isVerticalText: isVertical } : {}),
              ...(spAutoFit && !hasNormAutofit
                ? (() => {
                    const paragraphCount = textBodyVisibleParagraphCount(node.textBody!);
                    const dense =
                      !textBodyHasExplicitSpacing(node.textBody!) && wrap !== `none` &&
                      (paragraphCount > 1 || textBodyCodepointCount(node.textBody!) > SHORT_TEXT_THRESHOLD);
                    return {
                      trimOuterParagraphSpacing: true,
                      ...(singleLineAutoFit && !isVertical && (wrap === `none` || allCentered)
                        ? { compactSingleLineSpacing: true, defaultLineHeight: `1` }
                        : dense
                          ? { defaultLineHeight: `1.1` }
                          : {}),
                    };
                  })()
                : {}),
            }
          : void 0;
      renderTextBody(node.textBody, node.placeholder, ctx, textHost, renderOptions);
      host.appendChild(textHost);
      if (needsFit) {
        const savedTransform = textHost.style.transform;
        const savedTransformOrigin = textHost.style.transformOrigin;
        const savedWidth = textHost.style.width;
        const savedHeight = textHost.style.height;
        const savedWhiteSpace = textHost.style.whiteSpace;
        const savedOverflowY = textHost.style.overflowY;
        const applyFit = () => {
          textHost.style.transform = savedTransform;
          textHost.style.transformOrigin = savedTransformOrigin;
          textHost.style.width = savedWidth;
          textHost.style.height = savedHeight;
          textHost.style.whiteSpace = savedWhiteSpace;
          textHost.style.overflowY = savedOverflowY;
          const connected = host.isConnected;
          const savedVisibility = host.style.visibility;
          const measureRoot = ctx.measurementRoot != null && ctx.measurementRoot.isConnected ? ctx.measurementRoot : document.body;
          connected || ((host.style.visibility = `hidden`), measureRoot.appendChild(host));
          const savedJustify = textHost.style.justifyContent;
          const savedWrap = textHost.style.whiteSpace;
          textHost.style.justifyContent = `flex-start`;
          const boxW = textHost.clientWidth;
          const boxH = textHost.clientHeight;
          const scrollH = textHost.scrollHeight;
          const scrollW = textHost.scrollWidth;
          let contentW = scrollW;
          let contentH = scrollH;
          const fitsWidth = boxW > 0 && scrollW <= boxW + FIT_WIDTH_TOLERANCE_PX;
          const fitsHeight =
            boxH > 0 &&
            (scrollH <= boxH || (!vertVisible && fitsWidth && scrollH <= boxH * (singleLineAutoFit ? FIT_SINGLE_LINE_HEIGHT_RATIO : FIT_FALLBACK_HEIGHT_RATIO)));
          const fits = boxW > 0 && boxH > 0 && fitsWidth && fitsHeight;
          const canOverflowVert = spAutoFit && !hasNormAutofit && !vertVisible && fitsWidth && fitsHeight && scrollH > boxH && boxH > 0;
          const canOverflowShrink = shrinkCandidate && fitsWidth && scrollH > boxH && boxH > 0;
          const mustScale = !isVertical && !horzVisible && !fits && (!fitsWidth || !fitsHeight || singleLineAutoFit || shrinkCandidate || titleShrink);
          let nowrapMeasured = false;
          mustScale &&
            ((textHost.style.whiteSpace = `nowrap`),
            (contentW = textHost.scrollWidth),
            (contentH = textHost.scrollHeight),
            (nowrapMeasured = true),
            (textHost.style.whiteSpace = savedWrap));
          textHost.style.justifyContent = savedJustify;
          connected || ((host.parentNode === measureRoot && measureRoot.removeChild(host)), (host.style.visibility = savedVisibility));
          let scale = 1;
          const fixedShrink = titleShrink || shrinkCandidate;
          const nowrapOneLine =
            spAutoFit && !hasNormAutofit && wrap !== `none` && nowrapMeasured && !fitsHeight &&
            contentW <= boxW + FIT_WIDTH_TOLERANCE_PX && contentH <= boxH;
          nowrapOneLine && (textHost.style.whiteSpace = `nowrap`);
          if (!horzVisible && contentW > boxW + FIT_WIDTH_TOLERANCE_PX && boxW > 0) {
            const ratio = boxW / contentW;
            (!spAutoFit || hasNormAutofit ||
              (spAutoFit && !hasNormAutofit && !fitsHeight && contentH <= boxH && ratio >= FIT_NOWRAP_MIN_SCALE) ||
              (spAutoFit && !hasNormAutofit && singleLineAutoFit && (wrap === void 0 || wrap === `none` || allCentered)) ||
              shrinkCandidate || titleShrink) &&
              (!titleShrink || ratio >= FIT_GROUP_MIN_SCALE) &&
              (scale = Math.min(scale, ratio));
          }
          const nowrapScale = spAutoFit && !hasNormAutofit && scale < 1 && contentH <= boxH && !fitsHeight;
          nowrapScale && (textHost.style.whiteSpace = `nowrap`);
          !fixedShrink && !nowrapOneLine && !nowrapScale && !vertVisible && !fitsHeight && contentH > boxH && boxH > 0 &&
            (scale = Math.min(scale, boxH / contentH));
          !fixedShrink && !nowrapOneLine && !nowrapScale && !vertVisible && scale === 1 && !fitsHeight && scrollH > boxH && boxH > 0 &&
            (scale = boxH / scrollH);
          scale < 1
            ? (textHost.style.transform || (textHost.style.transformOrigin = `top left`),
              appendTransform(textHost, `scale(${scale})`),
              (textHost.style.width = scaleCssSize(savedWidth, scale)),
              (textHost.style.height = scaleCssSize(savedHeight, scale)))
            : (canOverflowVert || canOverflowShrink) && (textHost.style.overflowY = `visible`);
        };
        const schedule = () => {
          typeof requestAnimationFrame == `function` ? requestAnimationFrame(() => requestAnimationFrame(applyFit)) : setTimeout(applyFit, 0);
        };
        applyFit();
        schedule();
        document.fonts?.status === `loading` && document.fonts.ready && document.fonts.ready.then(() => schedule()).catch(() => {});
      }
    }
  }

  /* --- 效果（原 effectLst/effectRef 解析 + 各效果应用） --- */
  let effectLst = spPr.child(`effectLst`);
  if (!effectLst.exists()) {
    const effectRefIdx = node.source.child(`style`).child(`effectRef`).numAttr(`idx`) ?? 0;
    if (effectRefIdx > 0 && (ctx.theme.effectStyles?.length ?? 0) >= effectRefIdx) {
      const entry = ctx.theme.effectStyles[effectRefIdx - 1];
      if (entry.exists()) {
        const entryEffects = entry.child(`effectLst`);
        entryEffects.exists() && (effectLst = entryEffects);
      }
    }
  }
  if (effectLst.exists()) {
    const outerShdw = effectLst.child(`outerShdw`);
    if (outerShdw.exists()) {
      const dir = outerShdw.numAttr(`dir`) ?? 0;
      const dist = outerShdw.numAttr(`dist`) ?? 0;
      const blurRad = outerShdw.numAttr(`blurRad`) ?? 0;
      const sx = outerShdw.numAttr(`sx`);
      const sy = outerShdw.numAttr(`sy`);
      const algn = outerShdw.attr(`algn`);
      const dirRad = (dir / 6e4) * (Math.PI / 180);
      const distPx = emuToPx(dist);
      const blurPx = emuToPx(blurRad);
      const dx = distPx * Math.cos(dirRad);
      const dy = distPx * Math.sin(dirRad);
      let shadowCss = `rgba(0,0,0,0.4)`;
      let shadowRgb = { r: 0, g: 0, b: 0 };
      const { color, alpha } = resolveColor(outerShdw, ctx);
      if (color) {
        shadowRgb = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
        shadowCss = `rgba(${shadowRgb.r},${shadowRgb.g},${shadowRgb.b},${alpha.toFixed(3)})`;
      }
      if (sx != null && sy != null && sx > 0 && sy > 0) {
        // 缩放阴影：boxShadow 扩散近似
        const scaleX = sx / 1e5;
        const scaleY = sy / 1e5;
        const baseW = node.size?.w ?? 100;
        const baseH = node.size?.h ?? 100;
        let w = baseW, h = baseH;
        if (isLineLike || baseW <= 1 || baseH <= 1) {
          const lineWidth = Math.max(1, emuToPx(node.line?.numAttr(`w`) ?? 12700));
          w = lineWidth;
          h = lineWidth;
        }
        const spreadX = (w * (scaleX - 1)) / 2;
        const spreadY = (h * (scaleY - 1)) / 2;
        const spread = Math.max(0, (spreadX + spreadY) / 2);
        let alignX = 0, alignY = 0;
        if (algn) {
          const key = algn.toLowerCase();
          (key === `t` || key === `tl` || key === `tr`) && (alignY = (h * (scaleY - 1)) / 2);
          (key === `b` || key === `bl` || key === `br`) && (alignY = -(h * (scaleY - 1)) / 2);
          (key === `l` || key === `tl` || key === `bl`) && (alignX = (w * (scaleX - 1)) / 2);
          (key === `r` || key === `tr` || key === `br`) && (alignX = -(w * (scaleX - 1)) / 2);
        }
        const clampedBlur = spread > 0 ? Math.min(blurPx, spread * 3) : blurPx;
        let clampedAlpha = alpha;
        spread > 0 && blurPx > 0 && spread < blurPx && (clampedAlpha = (spread / blurPx) * alpha);
        if (clampedAlpha >= 0.01) {
          const finalDx = dx + alignX;
          const finalDy = dy + alignY;
          let finalCss = shadowCss;
          if (color) {
            shadowRgb = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
            finalCss = `rgba(${shadowRgb.r},${shadowRgb.g},${shadowRgb.b},${clampedAlpha.toFixed(4)})`;
          }
          !isLineLike && svgNs && svgDefs && svgPath && svgSize
            ? applySvgDropShadow(svgNs, svgDefs, svgPath, svgSize, { dx: finalDx, dy: finalDy, blur: clampedBlur, color: shadowRgb, opacity: clampedAlpha })
            : (host.style.boxShadow = `${finalDx.toFixed(1)}px ${finalDy.toFixed(1)}px ${clampedBlur.toFixed(1)}px ${spread.toFixed(1)}px ${finalCss}`);
        }
      } else
        !isLineLike && svgNs && svgDefs && svgPath && svgSize
          ? applySvgDropShadow(svgNs, svgDefs, svgPath, svgSize, { dx, dy, blur: blurPx, color: shadowRgb, opacity: alpha })
          : appendFilter(host, `drop-shadow(${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blurPx.toFixed(1)}px ${shadowCss})`);
    }
    const glow = effectLst.child(`glow`);
    glow.exists() && applyGlowFilter(host, glow, ctx);
    const softEdge = effectLst.child(`softEdge`);
    if (softEdge.exists() && !isLineLike && svgNs && svgDefs && svgPath && svgSize) {
      const radius = emuToPx(softEdge.numAttr(`rad`) ?? 0);
      radius > 0 && applySvgSoftEdge(svgNs, svgDefs, svgPath, svgSize, radius);
    }
    const innerShdw = effectLst.child(`innerShdw`);
    if (innerShdw.exists() && !isLineLike && svgNs && svgDefs && svgPath && svgSize) {
      const dir = innerShdw.numAttr(`dir`) ?? 0;
      const distPx = emuToPx(innerShdw.numAttr(`dist`) ?? 0);
      const blurPx = emuToPx(innerShdw.numAttr(`blurRad`) ?? 0);
      const dirRad = (dir / 6e4) * (Math.PI / 180);
      const dx = distPx * Math.cos(dirRad);
      const dy = distPx * Math.sin(dirRad);
      const { color, alpha } = resolveColor(innerShdw, ctx);
      if (color && alpha > 0) {
        const hex = color.startsWith(`#`) ? color : `#${color}`;
        applySvgInnerShadow(svgNs, svgDefs, svgPath, svgSize, { dx, dy, blur: blurPx, color: hexToRgb(hex), opacity: alpha });
      }
    }
    const reflection = effectLst.child(`reflection`);
    if (reflection.exists()) {
      const distPx = emuToPx(reflection.numAttr(`dist`) ?? 0);
      const stA = (reflection.numAttr(`stA`) ?? 5e4) / 1e5;
      const endA = (reflection.numAttr(`endA`) ?? 0) / 1e5;
      const stPos = Math.max(0, Math.min(100, (reflection.numAttr(`stPos`) ?? 0) / 1e3));
      const endPos = Math.max(0, Math.min(100, (reflection.numAttr(`endPos`) ?? 1e5) / 1e3));
      const gradient = `linear-gradient(to bottom, rgba(255,255,255,${stA.toFixed(3)}) ${stPos.toFixed(1)}%, rgba(255,255,255,${endA.toFixed(3)}) ${endPos.toFixed(1)}%)`;
      const reflect = `below ${distPx.toFixed(1)}px ${gradient}`;
      host.style.setProperty(`-webkit-box-reflect`, reflect);
      (host.style as CSSStyleDeclaration & { webkitBoxReflect: string }).webkitBoxReflect = reflect;
    }
  }

  /* --- 超链接（原 jsx 12577-12595） --- */
  if (node.hlinkClick && ctx.onNavigate) {
    const { action, rId } = node.hlinkClick;
    const rel = rId ? ctx.slide.rels.get(rId) : void 0;
    const slideIndex = resolveSlideNavigation(ctx, action, rel);
    slideIndex === void 0
      ? rId && rel && isExternalRel(rel) && isHttpTarget(rel.target) &&
        ((host.style.cursor = `pointer`),
        (host.title = node.hlinkClick.tooltip || rel.target),
        host.addEventListener(`click`, (event) => {
          event.stopPropagation();
          ctx.onNavigate!({ url: rel.target });
        }))
      : ((host.style.cursor = `pointer`),
        (host.title = node.hlinkClick.tooltip || goToSlideTooltip(slideIndex)),
        host.addEventListener(`click`, (event) => {
          event.stopPropagation();
          ctx.onNavigate!({ slideIndex });
        }));
  }
  return host;
}

/* --- 形状渲染内部助手 --- */

function buildLinePath(preset: string, w: number, h: number): string {
  return preset === `straightConnector1`
    ? w === 0 ? `M0.5,0 L0.5,${h || 1}` : h === 0 ? `M0,0.5 L${w || 1},0.5` : `M0,0 L${w},${h}`
    : w === 0 ? `M0.5,0 L0.5,${h || 1}` : h === 0 ? `M0,0.5 L${w || 1},0.5` : `M0,0 L${w},${h}`;
}

function flipLinePath(path: string, w: number, h: number, flipH: boolean, flipV: boolean): string {
  // 线状元素的翻转通过变换路径坐标实现（原 Li，jsx 10869-10903）
  const tokens = path.match(/[MLAZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!tokens) return path;
  const out: string[] = [];
  let i = 0;
  for (; i < tokens.length; ) {
    const token = tokens[i++];
    if (!token) break;
    out.push(token);
    if (token === `Z`) continue;
    if (token === `M` || token === `L`) {
      let x = Number(tokens[i++]);
      let y = Number(tokens[i++]);
      flipH && (x = w - x);
      flipV && (y = h - y);
      out.push(String(x), String(y));
      continue;
    }
    return path;
  }
  return out.join(` `);
}

function compressGradientStopsLocal(data: GradientFillData, axis: `x` | `y`): GradientStop[] {
  const rect = data.fillToRect;
  if (!rect) return data.stops;
  const spanW = Math.max(0, 1 - rect.l - rect.r);
  const spanH = Math.max(0, 1 - rect.t - rect.b);
  const cx = data.cx ?? 0.5;
  const cy = data.cy ?? 0.5;
  let factor = 0;
  if (axis === `x`) {
    const far = Math.max(Math.abs(cx), Math.abs(1 - cx));
    factor = far > 0 ? Math.max(0, Math.min(1, spanW / 2 / far)) : 0;
  } else {
    const far = Math.max(Math.abs(cy), Math.abs(1 - cy));
    factor = far > 0 ? Math.max(0, Math.min(1, spanH / 2 / far)) : 0;
  }
  return factor <= 0 ? data.stops : data.stops.map((s) => ({ ...s, position: factor * 100 + s.position * (1 - factor) }));
}

function applyGlowFilter(el: HTMLElement, glow: XmlNode, ctx: PptxRenderContext): void {
  const radius = emuToPx(glow.numAttr(`rad`) ?? 0);
  if (!(radius > 0)) return;
  const { color, alpha } = resolveColor(glow, ctx);
  if (!color || alpha <= 0) return;
  const { r, g, b } = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
  appendFilter(el, `drop-shadow(0px 0px ${radius.toFixed(1)}px rgba(${r},${g},${b},${alpha.toFixed(3)}))`);
}

/* ============================================================================
 * 幻灯片背景渲染（原 $n..dr，jsx 6243-6453；
 * 含 CSS 兜底工具 Ln..Kn，jsx 6085-6160）
 * ==========================================================================*/

/** 原 Rn：找最后一个顶层逗号（括号深度 0），用于拆分
 *  `... 0 0 / 8px 8px, <color>` 形式的渐变兜底串 */
function lastTopLevelCommaIndex(css: string): number {
  let depth = 0;
  for (let i = css.length - 1; i >= 0; i--) {
    const ch = css[i];
    if (ch === `)`) depth++;
    else if (ch === `(`) {
      if (depth > 0) depth--;
    } else if (ch === `,` && depth === 0) return i;
  }
  return -1;
}

/** 原 zn：去掉平铺尺寸标记 `0 0 / 8px 8px` */
function stripTiledBackgroundSize(css: string): string {
  return css.split(`0 0 / 8px 8px`).join(``).trimEnd();
}

function isDigitCode(code: number): boolean {
  return code >= 48 && code <= 57;
}

function isLetterCode(code: number): boolean {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isHexDigitCode(code: number): boolean {
  return isDigitCode(code) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102);
}

/** 原 Bn：判断串是否为合法颜色记号（hex/rgb()/纯字母名） */
function isCssColorToken(text: string): boolean {
  if (!text) return false;
  if (text[0] === `#`) {
    const len = text.length - 1;
    if (![3, 4, 6, 8].includes(len)) return false;
    for (let i = 1; i < text.length; i++) if (!isHexDigitCode(text.charCodeAt(i))) return false;
    return true;
  }
  const lower = text.toLowerCase();
  if (lower.startsWith(`rgb(`) || lower.startsWith(`rgba(`))
    return text.endsWith(`)`) && !text.slice(0, -1).includes(`)`);
  for (let i = 0; i < text.length; i++) if (!isLetterCode(text.charCodeAt(i))) return false;
  return true;
}

/** 原 Ln：渐变兜底串 → { imageLayers, color }；不合法返回 null */
function splitGradientFallback(css: string): { imageLayers: string; color: string } | null {
  const comma = lastTopLevelCommaIndex(css);
  if (comma < 0) return null;
  const tail = css.slice(comma + 1).trim();
  return isCssColorToken(tail) ? { imageLayers: stripTiledBackgroundSize(css.slice(0, comma)), color: tail } : null;
}

/** 原 Kn：半透明色与白色合成（背景不透明化） */
function alphaOverWhiteCss(r: number, g: number, b: number, alpha: number): string {
  return `rgb(${Math.round(r * alpha + 255 * (1 - alpha))},${Math.round(g * alpha + 255 * (1 - alpha))},${Math.round(b * alpha + 255 * (1 - alpha))})`;
}

/** 原 qn：把填充 CSS 应用到背景；`渐变 0 0 / 8px 8px` 兜底串拆成
 *  平铺图像层 + 底色（Safari 圆锥/矩形渐变近似） */
export function applyBackgroundCss(el: HTMLElement, css: string): void {
  if (css.includes(`gradient`) && css.includes(` 0 0 / `)) {
    const fallback = splitGradientFallback(css);
    if (fallback) {
      el.style.backgroundImage = fallback.imageLayers;
      el.style.backgroundSize = `8px 8px`;
      el.style.backgroundRepeat = `repeat`;
      el.style.backgroundColor = fallback.color;
      return;
    }
  }
  css.includes(`gradient`) || css.startsWith(`url(`) || css.includes(`repeating-`)
    ? (el.style.background = css)
    : (el.style.backgroundColor = css);
}

/** 原 Jn：渐变角度 → 0..100 端点坐标 */
function gradientAngleEndpointsNumeric(angleDeg: number): { x1: number; y1: number; x2: number; y2: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x1: 50 - 50 * Math.cos(rad),
    y1: 50 - 50 * Math.sin(rad),
    x2: 50 + 50 * Math.cos(rad),
    y2: 50 + 50 * Math.sin(rad),
  };
}

/** 原 Yn：stops → SVG <stop> 追加 */
function appendSvgGradientStops(gradient: SVGElement, stops: GradientStop[]): void {
  for (const stop of stops) {
    const el = document.createElementNS(`http://www.w3.org/2000/svg`, `stop`);
    el.setAttribute(`offset`, `${stop.position}%`);
    el.setAttribute(`stop-color`, stop.color);
    gradient.appendChild(el);
  }
}

let backgroundGradientIdCounter = 0; // 原 Gn

/**
 * 原 Xn：以独立 SVG 渲染幻灯片级渐变背景（rect 路径用横纵两道
 * 线性渐变 + lighten 混合模拟 OOXML rect 渐变；circle/shape 用
 * radialGradient；线性渐变按角度铺满）。插入到宿主最前。
 */
export function renderBackgroundGradientSvg(el: HTMLElement, data: GradientFillData, width: number, height: number): void {
  const ns = `http://www.w3.org/2000/svg`;
  const svg = document.createElementNS(ns, `svg`);
  svg.setAttribute(`data-pptx-background-gradient`, `true`);
  svg.setAttribute(`viewBox`, `0 0 ${width} ${height}`);
  svg.setAttribute(`width`, `100%`);
  svg.setAttribute(`height`, `100%`);
  svg.style.position = `absolute`;
  svg.style.left = `0`;
  svg.style.top = `0`;
  svg.style.width = `100%`;
  svg.style.height = `100%`;
  svg.style.pointerEvents = `none`;
  svg.style.display = `block`;
  const defs = document.createElementNS(ns, `defs`);
  svg.appendChild(defs);
  const baseId = `bg-grad-${++backgroundGradientIdCounter}`;
  if (data.type === `radial` && data.pathType === `rect`) {
    const cx = data.cx ?? 0.5;
    const cy = data.cy ?? 0.5;
    const mirrorStops = (center: number, axis: `x` | `y`) => {
      const compressed = compressGradientStops(data, { axis });
      const out: { offset: number; color: string }[] = [];
      for (const stop of compressed) {
        const pos = stop.position / 100;
        out.push({ offset: center - pos * center, color: stop.color });
        out.push({ offset: center + pos * (1 - center), color: stop.color });
      }
      return out.sort((a, b) => a.offset - b.offset);
    };
    const hId = `${baseId}-h`;
    const hGrad = document.createElementNS(ns, `linearGradient`);
    hGrad.setAttribute(`id`, hId);
    hGrad.setAttribute(`color-interpolation`, data.colorInterpolation ?? `linearRGB`);
    hGrad.setAttribute(`x1`, `0%`);
    hGrad.setAttribute(`y1`, `0%`);
    hGrad.setAttribute(`x2`, `100%`);
    hGrad.setAttribute(`y2`, `0%`);
    for (const stop of mirrorStops(cx, `x`)) {
      const el2 = document.createElementNS(ns, `stop`);
      el2.setAttribute(`offset`, `${(stop.offset * 100).toFixed(2)}%`);
      el2.setAttribute(`stop-color`, stop.color);
      hGrad.appendChild(el2);
    }
    defs.appendChild(hGrad);
    const vId = `${baseId}-v`;
    const vGrad = document.createElementNS(ns, `linearGradient`);
    vGrad.setAttribute(`id`, vId);
    vGrad.setAttribute(`color-interpolation`, data.colorInterpolation ?? `linearRGB`);
    vGrad.setAttribute(`x1`, `0%`);
    vGrad.setAttribute(`y1`, `0%`);
    vGrad.setAttribute(`x2`, `0%`);
    vGrad.setAttribute(`y2`, `100%`);
    for (const stop of mirrorStops(cy, `y`)) {
      const el2 = document.createElementNS(ns, `stop`);
      el2.setAttribute(`offset`, `${(stop.offset * 100).toFixed(2)}%`);
      el2.setAttribute(`stop-color`, stop.color);
      vGrad.appendChild(el2);
    }
    defs.appendChild(vGrad);
    const group = document.createElementNS(ns, `g`);
    group.setAttribute(`style`, `isolation: isolate`);
    const black = document.createElementNS(ns, `rect`);
    black.setAttribute(`width`, String(width));
    black.setAttribute(`height`, String(height));
    black.setAttribute(`fill`, `black`);
    group.appendChild(black);
    for (const id of [hId, vId]) {
      const rect = document.createElementNS(ns, `rect`);
      rect.setAttribute(`width`, String(width));
      rect.setAttribute(`height`, String(height));
      rect.setAttribute(`fill`, `url(#${id})`);
      rect.setAttribute(`style`, `mix-blend-mode: lighten`);
      group.appendChild(rect);
    }
    svg.appendChild(group);
  } else if (data.type === `radial`) {
    const grad = document.createElementNS(ns, `radialGradient`);
    grad.setAttribute(`id`, baseId);
    grad.setAttribute(`color-interpolation`, data.colorInterpolation ?? `linearRGB`);
    grad.setAttribute(`gradientUnits`, `userSpaceOnUse`);
    const cx = data.cx ?? 0.5;
    const cy = data.cy ?? 0.5;
    grad.setAttribute(`cx`, String(cx * width));
    grad.setAttribute(`cy`, String(cy * height));
    const farW = Math.max(cx, 1 - cx);
    const farH = Math.max(cy, 1 - cy);
    grad.setAttribute(`r`, String(Math.hypot(farW * width, farH * height)));
    appendSvgGradientStops(grad, compressGradientStops(data, { width, height }));
    defs.appendChild(grad);
    const rect = document.createElementNS(ns, `rect`);
    rect.setAttribute(`width`, String(width));
    rect.setAttribute(`height`, String(height));
    rect.setAttribute(`fill`, `url(#${baseId})`);
    svg.appendChild(rect);
  } else {
    const grad = document.createElementNS(ns, `linearGradient`);
    grad.setAttribute(`id`, baseId);
    grad.setAttribute(`color-interpolation`, data.colorInterpolation ?? `linearRGB`);
    grad.setAttribute(`gradientUnits`, `userSpaceOnUse`);
    const ends = gradientAngleEndpointsNumeric(data.angle);
    grad.setAttribute(`x1`, String((ends.x1 / 100) * width));
    grad.setAttribute(`y1`, String((ends.y1 / 100) * height));
    grad.setAttribute(`x2`, String((ends.x2 / 100) * width));
    grad.setAttribute(`y2`, String((ends.y2 / 100) * height));
    appendSvgGradientStops(grad, data.stops);
    defs.appendChild(grad);
    const rect = document.createElementNS(ns, `rect`);
    rect.setAttribute(`width`, String(width));
    rect.setAttribute(`height`, String(height));
    rect.setAttribute(`fill`, `url(#${baseId})`);
    svg.appendChild(rect);
  }
  el.style.position || (el.style.position = `relative`);
  el.style.background = ``;
  el.querySelectorAll(`svg[data-pptx-background-gradient="true"]`).forEach((old) => {
    old.remove();
  });
  el.insertBefore(svg, el.firstChild);
}

/** 原 Zn：gradFill 节点 → SVG 渐变背景（走 pathType 路径时返回 true） */
export function tryApplyGradientFillSvg(fillHost: XmlNode, ctx: PptxRenderContext, el: HTMLElement): boolean {
  return tryApplyGradientDataSvg(gradientFillDataFromFill(fillHost, ctx), ctx, el);
}

/** 原 Qn：渐变数据带 pathType 时用 SVG 渲染（CSS 无法精确表达） */
export function tryApplyGradientDataSvg(data: GradientFillData | null, ctx: PptxRenderContext, el: HTMLElement): boolean {
  if (data != null && data.pathType) {
    renderBackgroundGradientSvg(el, data, ctx.presentation.width, ctx.presentation.height);
    return true;
  }
  return false;
}

/**
 * 原 $n：幻灯片背景 = slide.background → layout.background →
 * master.background 三级回退；bgPr 走属性填充，bgRef 走主题样式引用；
 * 均无则白底。
 */
export function renderSlideBackground(ctx: PptxRenderContext, el: HTMLElement): void {
  let background: XmlNode | undefined;
  let rels = ctx.slide.rels;
  if (ctx.slide.background) {
    background = ctx.slide.background;
    rels = ctx.slide.rels;
  } else if (ctx.layout.background) {
    background = ctx.layout.background;
    rels = ctx.layout.rels;
  } else if (ctx.master.background) {
    background = ctx.master.background;
    rels = ctx.master.rels;
  }
  if (!background) {
    el.style.backgroundColor = `#FFFFFF`;
    return;
  }
  const bgPr = background.child(`bgPr`);
  if (bgPr.exists()) {
    applyBackgroundPropertiesFill(bgPr, ctx, el, rels);
    return;
  }
  const bgRef = background.child(`bgRef`);
  if (bgRef.exists()) {
    applyBackgroundReferenceFill(bgRef, ctx, el);
    return;
  }
  el.style.backgroundColor = `#FFFFFF`;
}

/** 原 er：bgPr 实体填充（solid/grad/patt/blip/noFill） */
function applyBackgroundPropertiesFill(bgPr: XmlNode, ctx: PptxRenderContext, el: HTMLElement, rels: Map<string, PptxRelationship>): void {
  const solid = bgPr.child(`solidFill`);
  if (solid.exists()) {
    const { color, alpha } = resolveColor(solid, ctx);
    const hex = color.startsWith(`#`) ? color : `#${color}`;
    if (alpha < 1) {
      const { r, g, b } = hexToRgb(hex);
      el.style.backgroundColor = alphaOverWhiteCss(r, g, b, alpha);
    } else el.style.backgroundColor = hex;
    return;
  }
  if (bgPr.child(`gradFill`).exists()) {
    if (tryApplyGradientFillSvg(bgPr, ctx, el)) return;
    const css = resolveFillCss(bgPr, ctx);
    css && (el.style.background = css);
    return;
  }
  if (bgPr.child(`pattFill`).exists()) {
    const css = resolveFillCss(bgPr, ctx);
    css && applyBackgroundCss(el, css);
    return;
  }
  const blipFill = bgPr.child(`blipFill`);
  if (blipFill.exists()) {
    resolveBackgroundBlipUrl(blipFill, ctx, el, rels);
    return;
  }
  if (bgPr.child(`noFill`).exists()) {
    el.style.backgroundColor = `#FFFFFF`;
    return;
  }
}

/** 原 tr：bgRef 主题样式引用（idx>=1001 → bgFillStyles，否则 fillStyles） */
function applyBackgroundReferenceFill(bgRef: XmlNode, ctx: PptxRenderContext, el: HTMLElement): void {
  const idx = bgRef.numAttr(`idx`) ?? 0;
  if (
    (idx >= 1001 && idx - 1e3 <= (ctx.theme.bgFillStyles?.length ?? 0)) ||
    (idx > 0 && idx <= (ctx.theme.fillStyles?.length ?? 0))
  ) {
    const { fillCss, gradientFillData } = resolveThemeBackgroundFill(bgRef, ctx);
    if (tryApplyGradientDataSvg(gradientFillData, ctx, el)) return;
    applyBackgroundCss(el, fillCss);
    return;
  }
  const { color, alpha } = resolveColor(bgRef, ctx);
  if (color && color !== `#000000`) {
    const hex = color.startsWith(`#`) ? color : `#${color}`;
    if (alpha < 1) {
      const { r, g, b } = hexToRgb(hex);
      el.style.backgroundColor = alphaOverWhiteCss(r, g, b, alpha);
    } else el.style.backgroundColor = hex;
  } else el.style.backgroundColor = `#FFFFFF`;
}

/** 原 nr：背景 blipFill → URL（外部/内嵌/懒解析）后应用 */
function resolveBackgroundBlipUrl(blipFill: XmlNode, ctx: PptxRenderContext, el: HTMLElement, rels?: Map<string, PptxRelationship>): void {
  const blip = blipFill.child(`blip`);
  const embed = blip.attr(`embed`) ?? blip.attr(`r:embed`);
  const link = blip.attr(`link`) ?? blip.attr(`r:link`);
  const rId = embed ?? link;
  if (!rId) return;
  const rel = (rels ?? ctx.slide.rels).get(rId);
  if (!rel) return;
  let url: string | undefined;
  if (isExternalRel(rel)) {
    if (!isHttpTarget(rel.target)) return;
    url = rel.target;
  } else {
    const media = findMedia(rel.target, ctx.presentation.media);
    if (!media) {
      if (ctx.presentation.mediaResolver) {
        const task = resolveMediaLazy(rel.target, ctx.presentation.media, ctx.presentation.mediaResolver)
          .then((resolved) => {
            resolved && applyBackgroundBlipUrl(blipFill, el, mediaObjectUrl(resolved.mediaPath, resolved.data, ctx.mediaUrlCache));
          })
          .catch(() => {});
        ctx.asyncTasks?.push(task);
        void ctx.asyncTasks;
      }
      return;
    }
    url = mediaObjectUrl(media.mediaPath, media.data, ctx.mediaUrlCache);
  }
  applyBackgroundBlipUrl(blipFill, el, url);
}

/** 原 rr：背景图应用：有透明修正或裁剪 → 元素层；否则 CSS 背景 */
function applyBackgroundBlipUrl(blipFill: XmlNode, el: HTMLElement, url: string): void {
  const alpha = resolveBlipAlpha(blipFill.child(`blip`));
  if (alpha < 1 || blipFill.child(`srcRect`).exists()) {
    applyBackgroundBlipElement(blipFill, el, url, alpha);
    return;
  }
  el.style.backgroundImage = `url("${url}")`;
  const stretch = blipFill.child(`stretch`);
  stretch.exists() && (applyStretchBackgroundSize(el, stretch.child(`fillRect`)), (el.style.backgroundRepeat = `no-repeat`));
  blipFill.child(`tile`).exists() && ((el.style.backgroundRepeat = `repeat`), (el.style.backgroundSize = `auto`));
}

/** 原 ir：以绝对定位子层承载背景图（支持透明度与 srcRect 裁剪） */
function applyBackgroundBlipElement(blipFill: XmlNode, el: HTMLElement, url: string, alpha: number): void {
  el.style.position || (el.style.position = `relative`);
  el.style.backgroundImage = ``;
  el.querySelectorAll(`[data-pptx-background-image="true"]`).forEach((old) => {
    old.remove();
  });
  const layer = document.createElement(`div`);
  layer.setAttribute(`data-pptx-background-image`, `true`);
  layer.style.position = `absolute`;
  layer.style.pointerEvents = `none`;
  layer.style.opacity = `${Number(alpha.toFixed(4))}`;
  const stretch = blipFill.child(`stretch`);
  applyFillRectBox(layer, stretch.exists() ? stretch.child(`fillRect`) : new XmlNode(null));
  const srcRect = blipFill.child(`srcRect`);
  if (srcRect.exists()) {
    layer.style.overflow = `hidden`;
    const crop = document.createElement(`div`);
    crop.setAttribute(`data-pptx-background-crop`, `true`);
    crop.style.position = `absolute`;
    crop.style.backgroundImage = `url("${url}")`;
    crop.style.backgroundSize = `100% 100%`;
    crop.style.backgroundRepeat = `no-repeat`;
    applySourceRectCrop(crop, srcRect);
    layer.appendChild(crop);
    el.insertBefore(layer, el.firstChild);
    return;
  }
  layer.style.backgroundImage = `url("${url}")`;
  stretch.exists() && ((layer.style.backgroundSize = `100% 100%`), (layer.style.backgroundRepeat = `no-repeat`));
  blipFill.child(`tile`).exists() && ((layer.style.backgroundRepeat = `repeat`), (layer.style.backgroundSize = `auto`));
  el.insertBefore(layer, el.firstChild);
}

/** 原 lr：fillRect 千分比属性 → 百分比 */
function fillRectPercentAttr(node: XmlNode, name: string): number {
  return (node.numAttr(name) ?? 0) / 1e3;
}

/** 原 ar：fillRect → 百分比盒 */
function fillRectPercentBox(node: XmlNode): { left: number; top: number; width: number; height: number } {
  if (!node.exists()) return { left: 0, top: 0, width: 100, height: 100 };
  const l = fillRectPercentAttr(node, `l`);
  const t = fillRectPercentAttr(node, `t`);
  const r = fillRectPercentAttr(node, `r`);
  const b = fillRectPercentAttr(node, `b`);
  return { left: l, top: t, width: 100 - l - r, height: 100 - t - b };
}

/** 原 or：把 fillRect 盒应用到元素定位 */
function applyFillRectBox(el: HTMLElement, fillRect: XmlNode): void {
  const box = fillRectPercentBox(fillRect);
  el.style.left = `${box.left}%`;
  el.style.top = `${box.top}%`;
  el.style.width = `${box.width}%`;
  el.style.height = `${box.height}%`;
}

/** 原 sr：srcRect 裁剪 → 放大+负偏移实现 */
function applySourceRectCrop(el: HTMLElement, srcRect: XmlNode): void {
  const l = fillRectPercentAttr(srcRect, `l`) / 100;
  const t = fillRectPercentAttr(srcRect, `t`) / 100;
  const r = fillRectPercentAttr(srcRect, `r`) / 100;
  const b = fillRectPercentAttr(srcRect, `b`) / 100;
  const spanW = 1 - l - r;
  const spanH = 1 - t - b;
  if (spanW <= 0.001 || spanH <= 0.001) {
    el.style.left = `0%`;
    el.style.top = `0%`;
    el.style.width = `100%`;
    el.style.height = `100%`;
    return;
  }
  const scaleX = 1 / spanW;
  const scaleY = 1 / spanH;
  el.style.left = `${-l * scaleX * 100}%`;
  el.style.top = `${-t * scaleY * 100}%`;
  el.style.width = `${scaleX * 100}%`;
  el.style.height = `${scaleY * 100}%`;
}

/** 原 cr：blip alpha 修正链（alphaModFix × alphaMod + alphaOff） */
export function resolveBlipAlpha(blip: XmlNode): number {
  let alpha = 1;
  const modFix = blip.child(`alphaModFix`);
  modFix.exists() && (alpha *= (modFix.numAttr(`amt`) ?? 1e5) / 1e5);
  const mod = blip.child(`alphaMod`);
  mod.exists() && (alpha *= (mod.numAttr(`val`) ?? 1e5) / 1e5);
  const off = blip.child(`alphaOff`);
  off.exists() && (alpha += (off.numAttr(`val`) ?? 0) / 1e5);
  return Math.max(0, Math.min(1, alpha));
}

/** 原 ur：背景位置百分比（左+右偏移 → position） */
function fillRectPositionPercent(lead: number, trail: number): number {
  const total = lead + trail;
  return Math.abs(total) < 1e-4 ? 0 : (lead / total) * 100;
}

/** 原 dr：stretch fillRect → background-size/position */
function applyStretchBackgroundSize(el: HTMLElement, fillRect: XmlNode): void {
  if (!fillRect.exists()) {
    el.style.backgroundSize = `100% 100%`;
    el.style.backgroundPosition = ``;
    return;
  }
  const l = fillRectPercentAttr(fillRect, `l`);
  const t = fillRectPercentAttr(fillRect, `t`);
  const r = fillRectPercentAttr(fillRect, `r`);
  const b = fillRectPercentAttr(fillRect, `b`);
  const width = 100 - l - r;
  const height = 100 - t - b;
  el.style.backgroundSize = `${width}% ${height}%`;
  el.style.backgroundPosition = `${fillRectPositionPercent(l, r)}% ${fillRectPositionPercent(t, b)}%`;
}

/* ============================================================================
 * EMF 解析 + pdfjs 懒渲染（原 So..is，jsx 12598-12903）
 * ==========================================================================*/

const EMR_HEADER_RECORD = 14; // 原 So
const EMR_COMMENT_RECORD = 70; // 原 Co
const EMR_STRETCH_DIBITS_RECORD = 81; // 原 wo
const EMF_COMMENT_SIGNATURE = 1128875079; // 原 To（"EMF" 标记）
const EMF_COMMENT_DATA_TYPE = 2; // 原 Eo
const EMF_COMMENT_MULTIFORMAT_MARKER = 1073741828; // 原 Do
const EMF_HEADER_SIGNATURE = 1179469088; // 原 Oo（0x464D4520）
const PDF_MAGIC = [37, 80, 68, 70]; // 原 ko（%PDF）
const PDF_EOF_MAGIC = [37, 37, 69, 79, 70]; // 原 Ao（%%EOF）
const BI_RGB = 0; // 原 jo
const EMF_BITMAP_PIXEL_LIMIT = 16777216; // 原 Mo（16M 像素）

export type EmfParseResult =
  | { type: `unsupported` }
  | { type: `empty` }
  | { type: `pdf`; data: Uint8Array }
  | { type: `bitmap`; imageData: ImageData };

/**
 * 原 No：扫描 EMF 记录流——COMMENT(70) 记录里找内嵌 PDF，
 * STRETCHDIBITS(81) 记录里取 DIB 位图；头部签名校验失败即不支持。
 */
export function parseEmf(bytes: Uint8Array): EmfParseResult {
  if (bytes.length < 44) return { type: `unsupported` };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(40, true) !== EMF_HEADER_SIGNATURE) return { type: `unsupported` };
  let offset = 0;
  let recordCount = 0;
  while (offset + 8 <= bytes.length) {
    const recordType = view.getUint32(offset, true);
    const recordSize = view.getUint32(offset + 4, true);
    if (recordSize < 8 || offset + recordSize > bytes.length || (recordCount++, recordType === EMR_HEADER_RECORD)) break;
    if (recordType === EMR_COMMENT_RECORD && recordSize > 16) {
      const found = parseEmfCommentRecord(bytes, view, offset, recordSize);
      if (found) return found;
    }
    if (recordType === EMR_STRETCH_DIBITS_RECORD && recordSize > 80) {
      const found = parseEmfDibRecord(bytes, view, offset);
      if (found) return found;
    }
    offset += recordSize;
  }
  return recordCount <= 2 ? { type: `empty` } : { type: `unsupported` };
}

/** 原 Po：EMR_COMMENT 记录 → 内嵌 PDF（直接数据或多格式目录） */
function parseEmfCommentRecord(bytes: Uint8Array, view: DataView, offset: number, recordSize: number): EmfParseResult | null {
  if (offset + 16 > bytes.length) return null;
  if (view.getUint32(offset + 12, true) === EMF_COMMENT_SIGNATURE && offset + 20 <= bytes.length) {
    const dataType = view.getUint32(offset + 16, true);
    if (dataType === EMF_COMMENT_DATA_TYPE) {
      const pdf = extractPdfBytes(bytes.subarray(offset + 8, offset + recordSize));
      if (pdf) return { type: `pdf`, data: pdf };
    }
    if (dataType === EMF_COMMENT_MULTIFORMAT_MARKER && offset + 24 <= bytes.length) {
      const found = parseEmfMultiFormatDirectory(bytes, view, offset);
      if (found) return found;
    }
  }
  if (recordSize > 100) {
    const pdf = extractPdfBytes(bytes.subarray(offset + 8, offset + recordSize));
    if (pdf) return { type: `pdf`, data: pdf };
  }
  return null;
}

/** 原 Fo：多格式目录（最多 10 条）逐项提取 PDF */
function parseEmfMultiFormatDirectory(bytes: Uint8Array, view: DataView, offset: number): EmfParseResult | null {
  if (offset + 40 > bytes.length) return null;
  const entryCount = view.getUint32(offset + 36, true);
  const tableBase = offset + 40;
  for (let i = 0; i < entryCount && i < 10; i++) {
    const entryOffset = tableBase + i * 16;
    if (entryOffset + 16 > bytes.length) break;
    const dataSize = view.getUint32(entryOffset + 8, true);
    const dataOffset = offset + view.getUint32(entryOffset + 12, true);
    if (dataOffset + dataSize > bytes.length || dataSize === 0) continue;
    const pdf = extractPdfBytes(bytes.subarray(dataOffset, dataOffset + dataSize));
    if (pdf) return { type: `pdf`, data: pdf };
  }
  return null;
}

/** 原 Io：%PDF..%%EOF 边界截取 */
function extractPdfBytes(bytes: Uint8Array): Uint8Array | null {
  const start = findByteSequence(bytes, PDF_MAGIC);
  if (start === -1) return null;
  let end = -1;
  for (let i = bytes.length - PDF_EOF_MAGIC.length; i >= start; i--) {
    if (byteSequenceMatches(bytes, i, PDF_EOF_MAGIC)) {
      end = i + PDF_EOF_MAGIC.length;
      break;
    }
  }
  end === -1 && (end = bytes.length);
  return bytes.slice(start, end);
}

/** 原 Lo：EMR_STRETCHDIBITS → ImageData（24/32 位 BI_RGB，行 4 字节对齐） */
function parseEmfDibRecord(bytes: Uint8Array, view: DataView, offset: number): EmfParseResult | null {
  if (offset + 80 > bytes.length) return null;
  const bmiOffset = view.getUint32(offset + 48, true);
  const bitmapHeaderSize = view.getUint32(offset + 52, true);
  const bitsOffset = view.getUint32(offset + 56, true);
  const bitsSize = view.getUint32(offset + 60, true);
  if (bitmapHeaderSize === 0 || bitsSize === 0) return null;
  const headerOffset = offset + bmiOffset;
  if (headerOffset + 40 > bytes.length) return null;
  const bitmapWidth = view.getInt32(headerOffset + 4, true);
  const bitmapHeight = view.getInt32(headerOffset + 8, true);
  const bitCount = view.getUint16(headerOffset + 14, true);
  if (view.getUint32(headerOffset + 16, true) !== BI_RGB || (bitCount !== 24 && bitCount !== 32)) return null;
  const width = Math.abs(bitmapWidth);
  const height = Math.abs(bitmapHeight);
  if (width === 0 || height === 0 || width > 8192 || height > 8192 || width * height > EMF_BITMAP_PIXEL_LIMIT) return null;
  const dataStart = offset + bitsOffset;
  if (dataStart + bitsSize > bytes.length) return null;
  const bytesPerPixel = bitCount / 8;
  const rowStride = Math.ceil((width * bytesPerPixel) / 4) * 4;
  const required = rowStride * height;
  if (bitsSize < required) return null;
  const raw = bytes.subarray(dataStart, dataStart + required);
  const topDown = bitmapHeight < 0;
  const imageData = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    const sourceRow = (topDown ? y : height - 1 - y) * rowStride;
    const targetRow = y * width * 4;
    for (let x = 0; x < width; x++) {
      const src = sourceRow + x * bytesPerPixel;
      if (src + bytesPerPixel > raw.length) break;
      imageData.data[targetRow + x * 4 + 0] = raw[src + 2];
      imageData.data[targetRow + x * 4 + 1] = raw[src + 1];
      imageData.data[targetRow + x * 4 + 2] = raw[src + 0];
      imageData.data[targetRow + x * 4 + 3] = bitCount === 32 ? raw[src + 3] : 255;
    }
  }
  return { type: `bitmap`, imageData };
}

/** 原 Ro：字节序列查找 */
function findByteSequence(bytes: Uint8Array, seq: number[]): number {
  const last = bytes.length - seq.length;
  for (let i = 0; i <= last; i++) if (byteSequenceMatches(bytes, i, seq)) return i;
  return -1;
}

/** 原 zo：字节序列比对 */
function byteSequenceMatches(bytes: Uint8Array, offset: number, seq: number[]): boolean {
  for (let i = 0; i < seq.length; i++) if (bytes[offset + i] !== seq[i]) return false;
  return true;
}

/* --- pdfjs 模块解析（原 Bo..Yo，jsx 12742-12783） --- */

const PDFJS_MODULE_PATH = `pdfjs-dist/build/pdf.min.mjs`; // 原 Bo
const PDFJS_WORKER_PATH = `pdfjs-dist/build/pdf.worker.min.mjs`; // 原 Vo
let pdfjsModuleUrlResolved = false; // 原 Ho 的 null 哨兵语义
let cachedPdfjsModuleUrl: string | null = null; // 原 Ho
let pdfjsWorkerUrlResolved = false; // 原 Uo 的 null 哨兵语义
let cachedPdfjsWorkerUrl: string | null = null; // 原 Uo

/** 原 Wo：import.meta.resolve 解析（失败返回 null） */
function resolveModuleUrl(specifier: string): string | null {
  try {
    const resolve = import.meta.resolve;
    if (typeof resolve === `function`) return resolve(specifier);
  } catch {
    /* 解析失败 */
  }
  return null;
}

/** 原 Go：从选项对象读字符串字段 */
function readStringOption(options: unknown, key: string): string | null {
  if (!options || typeof options !== `object`) return null;
  const value = (options as Record<string, unknown>)[key];
  return (typeof value === `string` && value.trim()) || null;
}

/** 原 Ko：缓存的模块 URL（仅解析一次） */
function pdfjsModuleUrlCached(): string | null {
  if (!pdfjsModuleUrlResolved) {
    pdfjsModuleUrlResolved = true;
    cachedPdfjsModuleUrl = resolveModuleUrl(PDFJS_MODULE_PATH);
  }
  return cachedPdfjsModuleUrl;
}

/** 原 qo：缓存的工作者 URL */
function pdfjsWorkerUrlCached(): string | null {
  if (!pdfjsWorkerUrlResolved) {
    pdfjsWorkerUrlResolved = true;
    cachedPdfjsWorkerUrl = resolveModuleUrl(PDFJS_WORKER_PATH);
  }
  return cachedPdfjsWorkerUrl;
}

/** 原 Jo：选项优先，回退缓存；显式 false 关闭 */
function resolvePdfjsModuleUrl(options: PptxRenderContext[`pdfjs`]): string | null {
  return options === false ? null : readStringOption(options, `moduleUrl`) ?? pdfjsModuleUrlCached();
}

/** 原 Yo：同上（工作者） */
function resolvePdfjsWorkerUrl(options: PptxRenderContext[`pdfjs`]): string | null {
  return options === false ? null : readStringOption(options, `workerUrl`) ?? pdfjsWorkerUrlCached();
}

/**
 * 原 Xo（jsx 12785-12838）：OffscreenCanvas pdfjs 工作者源码（逐字保留）。
 * 以 Blob URL 实例化，渲染 PDF 首页为 PNG Blob 回传。
 */
const PDFJS_WORKER_SOURCE = `
let pdfjsLib = null;

// PDF.js resolves its nested worker through browser window APIs. Aliasing
// this isolated worker global keeps it on the real-worker path; otherwise its
// fake-worker fallback would bind to this worker's message port.
globalThis.window = globalThis;

self.onmessage = async (e) => {
  const { id, pdfData, width, height, pdfjsUrl, pdfWorkerUrl } = e.data;
  try {
    if (!pdfjsLib) {
      pdfjsLib = await import(pdfjsUrl);
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    }

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    let doc = null;
    try {
      doc = await loadingTask.promise;
      if (doc.numPages < 1) {
        self.postMessage({ id, error: 'no pages' });
        return;
      }
      const page = await doc.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      const scale = Math.max(width / vp.width, height / vp.height);
      const svp = page.getViewport({ scale });

      const canvas = new OffscreenCanvas(Math.ceil(svp.width), Math.ceil(svp.height));
      const ctx = canvas.getContext('2d', { alpha: true });
      await page.render({ canvasContext: ctx, viewport: svp, background: 'rgba(0,0,0,0)' }).promise;

      const blob = await canvas.convertToBlob({ type: 'image/png' });
      self.postMessage({ id, blob });
    } finally {
      if (typeof loadingTask.destroy === 'function') {
        await loadingTask.destroy();
      } else if (doc && typeof doc.destroy === 'function') {
        await doc.destroy();
      }
    }
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
};
`;

const PDF_RENDER_TIMEOUT_MS = 15e3; // 原 Zo
const PDF_RENDER_MAX_CONCURRENCY = 4; // 原 Qo
let pdfRenderActiveCount = 0; // 原 $o
const pdfRenderQueue: { start(): void }[] = []; // 原 es

/** 原 ts：按并发上限泵送队列 */
function drainPdfRenderQueue(): void {
  while (pdfRenderActiveCount < PDF_RENDER_MAX_CONCURRENCY) {
    const task = pdfRenderQueue.shift();
    if (!task) return;
    task.start();
  }
}

/** 原 ns：入队执行（支持 abort 取消；失败归一为 null） */
function enqueuePdfRenderTask<T>(
  run: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T | null> {
  if (signal != null && signal.aborted) return Promise.resolve(null);
  return new Promise<T | null>((resolve) => {
    let started = false;
    let settled = false;
    const settle = (value: T | null) => {
      settled || ((settled = true), resolve(value));
    };
    const entry = {
      start: () => {
        if (settled) return;
        started = true;
        signal?.removeEventListener(`abort`, entry.cancel);
        pdfRenderActiveCount += 1;
        Promise.resolve()
          .then(run)
          .then(settle, () => settle(null))
          .finally(() => {
            --pdfRenderActiveCount;
            drainPdfRenderQueue();
          });
      },
      cancel: () => {
        if (started || settled) return;
        const index = pdfRenderQueue.indexOf(entry);
        index >= 0 && pdfRenderQueue.splice(index, 1);
        signal?.removeEventListener(`abort`, entry.cancel);
        settle(null);
      },
    };
    signal?.addEventListener(`abort`, entry.cancel, { once: true });
    pdfRenderQueue.push(entry);
    drainPdfRenderQueue();
  });
}

/** 原 rs：起一次性 module Worker 渲染 PDF 首页 */
function runPdfjsWorkerRender(
  pdfData: Uint8Array,
  width: number,
  height: number,
  pdfjsUrl: string,
  pdfWorkerUrl: string,
  signal?: AbortSignal,
): Promise<Blob | null> {
  if (signal != null && signal.aborted) return Promise.resolve(null);
  return new Promise<Blob | null>((resolve) => {
    let worker: Worker | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const settle = (value: Blob | null) => {
      if (settled) return;
      settled = true;
      timeoutId !== undefined && clearTimeout(timeoutId);
      signal?.removeEventListener(`abort`, onAbort);
      worker &&= ((worker.onmessage = null), (worker.onerror = null), worker.terminate(), null);
      resolve(value);
    };
    const onAbort = () => settle(null);
    try {
      const blob = new Blob([PDFJS_WORKER_SOURCE], { type: `text/javascript` });
      const blobUrl = URL.createObjectURL(blob);
      try {
        worker = new Worker(blobUrl, { type: `module` });
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
      worker.onmessage = (event) => {
        const { blob, error } = event.data as { blob?: Blob; error?: string };
        settle(error ? null : blob ?? null);
      };
      worker.onerror = () => settle(null);
      signal?.addEventListener(`abort`, onAbort, { once: true });
      const transferable = pdfData.slice();
      worker.postMessage(
        { id: 1, pdfData: transferable, width, height, pdfjsUrl, pdfWorkerUrl },
        [transferable.buffer as ArrayBuffer],
      );
      timeoutId = setTimeout(() => settle(null), PDF_RENDER_TIMEOUT_MS);
    } catch {
      settle(null);
    }
  });
}

/**
 * 原 is：EMF 内嵌 PDF → objectURL（pdfjs 不可用/超时/中止 → null）。
 * 需要 OffscreenCanvas 与 Worker 支持。
 */
export async function renderEmbeddedPdfToObjectUrl(
  pdfData: Uint8Array,
  width: number,
  height: number,
  pdfjsOptions: PptxRenderContext[`pdfjs`],
  signal?: AbortSignal,
): Promise<string | null> {
  if (signal != null && signal.aborted) return null;
  const moduleUrl = resolvePdfjsModuleUrl(pdfjsOptions);
  const workerUrl = resolvePdfjsWorkerUrl(pdfjsOptions);
  if (!moduleUrl || !workerUrl || typeof OffscreenCanvas > `u` || typeof Worker > `u`) return null;
  try {
    const blob = await enqueuePdfRenderTask(() => runPdfjsWorkerRender(pdfData, width, height, moduleUrl, workerUrl, signal), signal);
    if (blob && !(signal != null && signal.aborted)) return URL.createObjectURL(blob);
  } catch {
    /* 渲染失败 */
  }
  return null;
}

/** 原 as：扩展名是否 wmf */
export function isWmfMediaPath(path: string): boolean {
  return (path.split(`.`).pop()?.toLowerCase() || ``) === `wmf`;
}

/** 原 os：扩展名是否 emf */
export function isEmfMediaPath(path: string): boolean {
  return (path.split(`.`).pop()?.toLowerCase() || ``) === `emf`;
}

/* ============================================================================
 * 图片/视频/音频渲染（原 as..Us，jsx 12905-13435）
 * ==========================================================================*/

let pictureClipIdCounter = 0; // 原 ss

/** 原 cs：rel → 海报图 URL（仅内嵌非 wmf 媒体） */
function resolvePosterUrl(rel: PptxRelationship, ctx: PptxRenderContext): string | undefined {
  if (isExternalRel(rel)) return isHttpTarget(rel.target) ? rel.target : undefined;
  const media = findMedia(rel.target, ctx.presentation.media);
  if (!media) return;
  if (isWmfMediaPath(media.mediaPath)) return;
  return mediaObjectUrl(media.mediaPath, media.data, ctx.mediaUrlCache);
}

/**
 * 原 ls：图片节点渲染入口。绝对定位宿主 + 旋转/翻转，随后分派：
 * 视频 → video/audio 分支；blip embed/link → 媒体解析（含懒解析）；
 * 非矩形几何 → SVG clipPath 裁剪。
 */
export function renderPictureNode(node: PptxPictureNode, ctx: PptxRenderContext): HTMLElement {
  const host = document.createElement(`div`);
  host.style.position = `absolute`;
  host.style.left = `${node.position.x}px`;
  host.style.top = `${node.position.y}px`;
  host.style.width = `${node.size.w}px`;
  host.style.height = `${node.size.h}px`;
  host.style.overflow = `hidden`;
  const clipPath = pictureClipPathData(node);
  const transforms: string[] = [];
  node.rotation !== 0 && transforms.push(`rotate(${node.rotation}deg)`);
  node.flipH && !clipPath && transforms.push(`scaleX(-1)`);
  node.flipV && !clipPath && transforms.push(`scaleY(-1)`);
  transforms.length > 0 && (host.style.transform = transforms.join(` `));
  applyPictureDecorations(host, node, ctx);
  if (node.isVideo) {
    renderVideoContent(node, ctx, host);
    return host;
  }
  if (node.isAudio) {
    renderAudioContent(node, ctx, host);
    return host;
  }
  const embedId = node.blipEmbed;
  let url: string | undefined;
  if (embedId) {
    const rel = ctx.slide.rels.get(embedId);
    if (!rel) {
      renderMediaPlaceholder(host, `Missing image reference`);
      return host;
    }
    if (isExternalRel(rel)) {
      url = isHttpTarget(rel.target) ? rel.target : undefined;
      if (!url) {
        renderMediaPlaceholder(host, `Image not found`);
        return host;
      }
    } else {
      const path = primaryMediaPath(rel.target);
      if (isWmfMediaPath(path)) {
        renderUnsupportedImagePlaceholder(host, path);
        return host;
      }
      const media = findMedia(rel.target, ctx.presentation.media);
      if (!media) {
        if (ctx.presentation.mediaResolver) {
          const task = resolveMediaLazy(rel.target, ctx.presentation.media, ctx.presentation.mediaResolver)
            .then((resolved) => {
              if (!resolved) {
                renderMediaPlaceholder(host, `Image not found`);
                return;
              }
              applyResolvedPictureMedia(node, ctx, host, resolved.mediaPath, resolved.data);
            })
            .catch(() => {
              renderMediaPlaceholder(host, `Image not found`);
            });
          ctx.asyncTasks?.push(task);
          void ctx.asyncTasks;
          return host;
        }
        renderMediaPlaceholder(host, `Image not found`);
        return host;
      }
      applyResolvedPictureMedia(node, ctx, host, media.mediaPath, media.data);
      return host;
    }
  } else if (node.blipLink) {
    url = resolveMediaRelUrl(node.blipLink, ctx);
    if (!url) {
      renderMediaPlaceholder(host, `Image not found`);
      return host;
    }
  } else {
    renderMediaPlaceholder(host, `No image data`);
    return host;
  }
  applyPictureContent(node, ctx, host, url);
  return host;
}

/** 原 us：媒体解析完成后的分派（EMF → 专用渲染） */
function applyResolvedPictureMedia(
  node: PptxPictureNode,
  ctx: PptxRenderContext,
  host: HTMLElement,
  mediaPath: string,
  data: Uint8Array | ArrayBuffer,
): void {
  if (isEmfMediaPath(mediaPath)) {
    renderEmfContent(data instanceof Uint8Array ? data : new Uint8Array(data), node, ctx, host, mediaPath);
    return;
  }
  applyPictureContent(node, ctx, host, mediaObjectUrl(mediaPath, data instanceof Uint8Array ? data : new Uint8Array(data), ctx.mediaUrlCache));
}

/**
 * 原 ds：把图片内容铺进宿主——tile → CSS 平铺；否则 <img>，
 * 依次应用 fillRect 定位、几何裁剪（SVG）、srcRect 裁剪、
 * 透明度与像素滤镜（grayscl/duotone/lum/biLevel）。
 */
function applyPictureContent(node: PptxPictureNode, ctx: PptxRenderContext, host: HTMLElement, url: string): void {
  const blipFill = node.source.child(`blipFill`);
  const blip = blipFill.child(`blip`);
  const alpha = resolveBlipAlpha(blip);
  if (blipFill.child(`tile`).exists()) {
    host.style.backgroundImage = `url("${url}")`;
    host.style.backgroundRepeat = `repeat`;
    host.style.backgroundSize = `auto`;
    alpha < 1 && (host.style.opacity = `${Number(alpha.toFixed(4))}`);
    return;
  }
  const img = document.createElement(`img`);
  img.src = url;
  img.style.width = `100%`;
  img.style.height = `100%`;
  img.style.objectFit = `fill`;
  img.style.display = `block`;
  img.draggable = false;
  const fillRectNode = node.source.child(`blipFill`).child(`stretch`).child(`fillRect`);
  const fillRect = fillRectNode.exists() ? pictureFillRect(fillRectNode) : undefined;
  const clipPath = pictureClipPathData(node);
  if (clipPath) {
    renderClippedPictureSvg(node, host, url, clipPath, fillRect);
    alpha < 1 && (host.style.opacity = `${Number(alpha.toFixed(4))}`);
    return;
  }
  fillRect && applyPercentRectToElement(img, fillRect);
  if (node.crop) {
    const { top, right, bottom, left } = node.crop;
    const spanW = 1 - left - right;
    const spanH = 1 - top - bottom;
    if (spanW > 0.001 && spanH > 0.001) {
      const scaleX = 1 / spanW;
      const scaleY = 1 / spanH;
      const baseW = node.size.w * ((fillRect?.width ?? 100) / 100);
      const baseH = node.size.h * ((fillRect?.height ?? 100) / 100);
      img.style.width = `${(scaleX * baseW).toFixed(4)}px`;
      img.style.height = `${(scaleY * baseH).toFixed(4)}px`;
      img.style.marginLeft = `${(-left * scaleX * baseW).toFixed(4)}px`;
      img.style.marginTop = `${(-top * scaleY * baseH).toFixed(4)}px`;
    }
  }
  alpha < 1 && (host.style.opacity = `${Number(alpha.toFixed(4))}`);
  blip.child(`grayscl`).exists() && appendFilter(img, `grayscale(1)`);
  const duotone = blip.child(`duotone`);
  duotone.exists() && applyDuotoneFilter(duotone, ctx, img);
  const lum = blip.child(`lum`);
  lum.exists() && applyLumFilter(lum, img);
  const biLevel = blip.child(`biLevel`);
  biLevel.exists() && applyBiLevelFilter(biLevel, img);
  host.appendChild(img);
}

/** 原 fs：图片 fillRect 千分比属性 */
function pictureFillRectAttr(node: XmlNode, name: string): number {
  return (node.numAttr(name) ?? 0) / 1e3;
}

/** 原 ps：fillRect → 百分比盒 */
function pictureFillRect(node: XmlNode): { left: number; top: number; width: number; height: number } {
  const l = pictureFillRectAttr(node, `l`);
  const t = pictureFillRectAttr(node, `t`);
  const r = pictureFillRectAttr(node, `r`);
  const b = pictureFillRectAttr(node, `b`);
  return { left: l, top: t, width: 100 - l - r, height: 100 - t - b };
}

/** 原 ms：百分比盒 → 绝对定位样式 */
function applyPercentRectToElement(el: HTMLElement, rect: { left: number; top: number; width: number; height: number }): void {
  el.style.position = `absolute`;
  el.style.left = `${rect.left}%`;
  el.style.top = `${rect.top}%`;
  el.style.width = `${rect.width}%`;
  el.style.height = `${rect.height}%`;
}

/**
 * 原 hs：图片几何裁剪路径——优先 custGeom，其次 prstGeom；
 * rect/无几何返回 undefined（走普通 <img>）。
 */
function pictureClipPathData(node: PptxPictureNode): string | undefined {
  const custGeomNode = node.source.child(`spPr`).child(`custGeom`);
  const custGeom = node.customGeometry ?? (custGeomNode.exists() ? custGeomNode : undefined);
  if (custGeom != null && custGeom.exists()) {
    const extentNode = node.source.child(`spPr`).child(`xfrm`).child(`ext`);
    const natural = { w: extentNode.numAttr(`cx`) ?? 0, h: extentNode.numAttr(`cy`) ?? 0 };
    return buildCustomGeometryPath(custGeom, node.size.w, node.size.h, natural) || undefined;
  }
  const presetAttr = node.source.child(`spPr`).child(`prstGeom`).attr(`prst`);
  const preset = node.presetGeometry ?? presetAttr;
  if (!preset || preset === `rect`) return undefined;
  return buildPresetGeometryPath(preset, node.size.w, node.size.h) || undefined;
}

/** 原 gs：flip → SVG transform（裁剪路径与图像同步翻转） */
function pictureFlipTransform(node: PptxPictureNode): string | undefined {
  if (node.flipH && node.flipV) return `translate(${node.size.w} ${node.size.h}) scale(-1 -1)`;
  if (node.flipH) return `translate(${node.size.w} 0) scale(-1 1)`;
  if (node.flipV) return `translate(0 ${node.size.h}) scale(1 -1)`;
  return undefined;
}

/** 原 _s：SVG clipPath 裁剪图片（含 srcRect 裁剪换算） */
function renderClippedPictureSvg(
  node: PptxPictureNode,
  host: HTMLElement,
  url: string,
  clipPath: string,
  fillRect?: { left: number; top: number; width: number; height: number },
): void {
  const ns = `http://www.w3.org/2000/svg`;
  const svg = document.createElementNS(ns, `svg`);
  svg.setAttribute(`viewBox`, `0 0 ${node.size.w} ${node.size.h}`);
  svg.setAttribute(`width`, `100%`);
  svg.setAttribute(`height`, `100%`);
  svg.style.display = `block`;
  svg.style.overflow = `hidden`;
  const clipId = `picture-clip-${pictureClipIdCounter++}`;
  const defs = document.createElementNS(ns, `defs`);
  const clip = document.createElementNS(ns, `clipPath`);
  clip.setAttribute(`id`, clipId);
  clip.setAttribute(`clipPathUnits`, `userSpaceOnUse`);
  const path = document.createElementNS(ns, `path`);
  path.setAttribute(`d`, clipPath);
  const flip = pictureFlipTransform(node);
  flip && path.setAttribute(`transform`, flip);
  clip.appendChild(path);
  defs.appendChild(clip);
  svg.appendChild(defs);
  const image = document.createElementNS(ns, `image`);
  image.setAttribute(`href`, url);
  image.setAttribute(`preserveAspectRatio`, `none`);
  flip && image.setAttribute(`transform`, flip);
  const group = document.createElementNS(ns, `g`);
  group.setAttribute(`clip-path`, `url(#${clipId})`);
  let x = ((fillRect?.left ?? 0) / 100) * node.size.w;
  let y = ((fillRect?.top ?? 0) / 100) * node.size.h;
  let w = ((fillRect?.width ?? 100) / 100) * node.size.w;
  let h = ((fillRect?.height ?? 100) / 100) * node.size.h;
  if (node.crop) {
    const { top, right, bottom, left } = node.crop;
    const spanW = 1 - left - right;
    const spanH = 1 - top - bottom;
    if (spanW > 0.001 && spanH > 0.001) {
      const scaleX = 1 / spanW;
      const scaleY = 1 / spanH;
      w *= scaleX;
      h *= scaleY;
      x += -left * scaleX * ((fillRect?.width ?? 100) / 100) * node.size.w;
      y += -top * scaleY * ((fillRect?.height ?? 100) / 100) * node.size.h;
    }
  }
  image.setAttribute(`x`, String(x));
  image.setAttribute(`y`, String(y));
  image.setAttribute(`width`, String(w));
  image.setAttribute(`height`, String(h));
  host.appendChild(svg);
  svg.appendChild(group);
  group.appendChild(image);
}

/** 原 vs：图片装饰总入口（填充/边框/效果/超链接） */
function applyPictureDecorations(host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext): void {
  applyPictureShapeFill(host, node, ctx);
  applyPictureBorder(host, node, ctx);
  applyPictureEffects(host, node, ctx);
  applyPictureHyperlink(host, node, ctx);
}

/** 原 ys：spPr 填充 → 背景（复用形状填充解析） */
function applyPictureShapeFill(host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext): void {
  const css = resolveFillCss(node.source.child(`spPr`), ctx);
  css && applyPictureBackgroundCss(host, css);
}

/** 原 bs：同 applyBackgroundCss（渐变兜底拆分） */
function applyPictureBackgroundCss(el: HTMLElement, css: string): void {
  if (css.includes(`gradient`) && css.includes(` 0 0 / `)) {
    const fallback = splitGradientFallback(css);
    if (fallback) {
      el.style.backgroundImage = fallback.imageLayers;
      el.style.backgroundSize = `8px 8px`;
      el.style.backgroundRepeat = `repeat`;
      el.style.backgroundColor = fallback.color;
      return;
    }
  }
  css.includes(`gradient`) || css.startsWith(`url(`) || css.includes(`repeating-`)
    ? (el.style.background = css)
    : (el.style.backgroundColor = css);
}

/** 原 xs：清空背景相关样式 */
function clearPictureBackground(el: HTMLElement): void {
  el.style.background = ``;
  el.style.backgroundColor = ``;
  el.style.backgroundImage = ``;
  el.style.backgroundRepeat = ``;
  el.style.backgroundSize = ``;
}

/** 原 Ss：图片边框（显式 ln 或 style/lnRef 主题线型） */
function applyPictureBorder(host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext): void {
  const lineRef = node.source.child(`style`).child(`lnRef`);
  if (node.line?.child(`noFill`).exists() ?? false) return;
  const hasExplicitLine = node.line?.exists() ?? false;
  const themedLine =
    !hasExplicitLine && lineRef.exists() && (lineRef.numAttr(`idx`) ?? 0) > 0 &&
    (ctx.theme.lineStyles?.length ?? 0) >= (lineRef.numAttr(`idx`) ?? 0)
      ? ctx.theme.lineStyles[(lineRef.numAttr(`idx`) ?? 1) - 1]
      : undefined;
  const line = hasExplicitLine ? node.line : themedLine;
  if (!(line != null && line.exists())) return;
  const style = resolveLineStyle(line, ctx, lineRef);
  style.width <= 0 || style.color === `transparent` ||
    ((host.style.boxSizing = `border-box`), (host.style.border = `${style.width}px ${style.dash} ${style.color}`));
}

/** 原 Cs：effectLst → 外阴影/发光/软边缘/倒影 */
function applyPictureEffects(host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext): void {
  const effects = node.source.child(`spPr`).child(`effectLst`);
  if (!effects.exists()) return;
  const shadow = effects.child(`outerShdw`);
  shadow.exists() && applyPictureOuterShadow(host, node, shadow, ctx);
  const glow = effects.child(`glow`);
  glow.exists() && applyGlowFilter(host, glow, ctx);
  const softEdge = effects.child(`softEdge`);
  softEdge.exists() && applyPictureSoftEdge(host, node, softEdge);
  const reflection = effects.child(`reflection`);
  reflection.exists() && applyPictureReflection(host, reflection);
}

/** 原 Ts：阴影颜色 CSS（缺省半透明黑） */
function pictureShadowColorCss(shadow: XmlNode, ctx: PptxRenderContext, fallback: string): string {
  const { color, alpha } = resolveColor(shadow, ctx);
  if (!color) return fallback;
  const { r, g, b } = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** 原 ws：图片外阴影——有 sx/sy 时用 boxShadow（含扩散），否则 drop-shadow 滤镜 */
function applyPictureOuterShadow(host: HTMLElement, node: PptxPictureNode, shadow: XmlNode, ctx: PptxRenderContext): void {
  const dir = shadow.numAttr(`dir`) ?? 0;
  const dist = emuToPx(shadow.numAttr(`dist`) ?? 0);
  const blur = emuToPx(shadow.numAttr(`blurRad`) ?? 0);
  const rad = dir / 6e4;
  const dx = dist * Math.cos((rad * Math.PI) / 180);
  const dy = dist * Math.sin((rad * Math.PI) / 180);
  const colorCss = pictureShadowColorCss(shadow, ctx, `rgba(0,0,0,0.4)`);
  const sx = shadow.numAttr(`sx`);
  const sy = shadow.numAttr(`sy`);
  if (sx != null && sy != null && sx > 0 && sy > 0) {
    const scaleW = sx / 1e5;
    const scaleH = sy / 1e5;
    const growW = (node.size.w * (scaleW - 1)) / 2;
    const growH = (node.size.h * (scaleH - 1)) / 2;
    const spread = Math.max(0, (growW + growH) / 2);
    host.style.boxShadow = `${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px ${spread.toFixed(1)}px ${colorCss}`;
    return;
  }
  appendFilter(host, `drop-shadow(${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px ${colorCss})`);
}

/** 原 Os：软边缘——双向线性渐变 mask 相交 */
function applyPictureSoftEdge(host: HTMLElement, node: PptxPictureNode, softEdge: XmlNode): void {
  const radius = emuToPx(softEdge.numAttr(`rad`) ?? 0);
  if (!(radius > 0)) return;
  const halfMin = Math.max(0, Math.min(node.size.w, node.size.h) / 2);
  const radiusCss = `${Number((halfMin > 0 ? Math.min(radius, halfMin) : radius).toFixed(4))}px`;
  const variable = `var(--pptx-soft-edge-radius)`;
  const mask = [
    `linear-gradient(to right, transparent 0, black ${variable}, black calc(100% - ${variable}), transparent 100%)`,
    `linear-gradient(to bottom, transparent 0, black ${variable}, black calc(100% - ${variable}), transparent 100%)`,
  ].join(`, `);
  host.style.setProperty(`--pptx-soft-edge-radius`, radiusCss);
  host.style.setProperty(`-webkit-mask-image`, mask);
  host.style.setProperty(`mask-image`, mask);
  host.style.setProperty(`-webkit-mask-size`, `100% 100%`);
  host.style.setProperty(`mask-size`, `100% 100%`);
  host.style.setProperty(`-webkit-mask-repeat`, `no-repeat`);
  host.style.setProperty(`mask-repeat`, `no-repeat`);
  host.style.setProperty(`-webkit-mask-composite`, `source-in`);
  host.style.setProperty(`mask-composite`, `intersect`);
  const style = host.style as CSSStyleDeclaration & { webkitMaskImage: string; webkitMaskComposite: string };
  style.webkitMaskImage = mask;
  style.maskImage = mask;
  style.webkitMaskComposite = `source-in`;
  style.maskComposite = `intersect`;
}

/** 原 ks：倒影（-webkit-box-reflect + 渐变透明度） */
function applyPictureReflection(host: HTMLElement, reflection: XmlNode): void {
  const dist = emuToPx(reflection.numAttr(`dist`) ?? 0);
  const startAlpha = (reflection.numAttr(`stA`) ?? 5e4) / 1e5;
  const endAlpha = (reflection.numAttr(`endA`) ?? 0) / 1e5;
  const startPos = Math.max(0, Math.min(100, (reflection.numAttr(`stPos`) ?? 0) / 1e3));
  const endPos = Math.max(0, Math.min(100, (reflection.numAttr(`endPos`) ?? 1e5) / 1e3));
  const gradient = `linear-gradient(to bottom, rgba(255,255,255,${startAlpha.toFixed(3)}) ${startPos.toFixed(1)}%, rgba(255,255,255,${endAlpha.toFixed(3)}) ${endPos.toFixed(1)}%)`;
  const value = `below ${dist.toFixed(1)}px ${gradient}`;
  host.style.setProperty(`-webkit-box-reflect`, value);
  (host.style as CSSStyleDeclaration & { webkitBoxReflect: string }).webkitBoxReflect = value;
}

/** 原 As：图片点击导航（幻灯片跳转/外部链接） */
function applyPictureHyperlink(host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext): void {
  if (!node.hlinkClick || !ctx.onNavigate) return;
  const { action, rId } = node.hlinkClick;
  const rel = rId ? ctx.slide.rels.get(rId) : undefined;
  const slideIndex = resolveSlideNavigation(ctx, action, rel);
  if (slideIndex !== undefined) {
    host.style.cursor = `pointer`;
    host.title = node.hlinkClick.tooltip || goToSlideTooltip(slideIndex);
    host.addEventListener(`click`, (event) => {
      event.stopPropagation();
      ctx.onNavigate!({ slideIndex });
    });
    return;
  }
  rId &&
    (!rel || !isExternalRel(rel) || !isNavigableUrlScheme(rel.target) ||
      ((host.style.cursor = `pointer`),
      (host.title = node.hlinkClick.tooltip || rel.target),
      host.addEventListener(`click`, (event) => {
        event.stopPropagation();
        ctx.onNavigate!({ url: rel.target });
      })));
}

/** 原 Ps：媒体 rel → objectURL（外部 → http 直链） */
function resolveMediaRelUrl(rId: string | undefined, ctx: PptxRenderContext): string | undefined {
  if (!rId) return;
  const rel = ctx.slide.rels.get(rId);
  if (!rel) return;
  if (isExternalRel(rel)) return isHttpTarget(rel.target) ? rel.target : undefined;
  const media = findMedia(rel.target, ctx.presentation.media);
  if (!media) return;
  return mediaObjectUrl(media.mediaPath, media.data, ctx.mediaUrlCache);
}

/** 原 Ms：视频渲染——有源 <video>（海报可选）；仅海报 → 图+播放符；否则占位 */
function renderVideoContent(node: PptxPictureNode, ctx: PptxRenderContext, host: HTMLElement): void {
  const mediaUrl = resolveMediaRelUrl(node.mediaRId, ctx);
  let posterUrl: string | undefined;
  if (node.blipEmbed) {
    const rel = ctx.slide.rels.get(node.blipEmbed);
    rel && (posterUrl = resolvePosterUrl(rel, ctx));
  }
  if (mediaUrl) {
    const video = document.createElement(`video`);
    video.src = mediaUrl;
    video.preload = `none`;
    video.controls = true;
    video.style.width = `100%`;
    video.style.height = `100%`;
    video.style.objectFit = `contain`;
    video.style.backgroundColor = `#000`;
    posterUrl && (video.poster = posterUrl);
    host.appendChild(video);
  } else if (posterUrl) {
    const img = document.createElement(`img`);
    img.src = posterUrl;
    img.style.width = `100%`;
    img.style.height = `100%`;
    img.style.objectFit = `fill`;
    host.appendChild(img);
    const overlay = document.createElement(`div`);
    overlay.style.position = `absolute`;
    overlay.style.inset = `0`;
    overlay.style.display = `flex`;
    overlay.style.alignItems = `center`;
    overlay.style.justifyContent = `center`;
    overlay.style.backgroundColor = `rgba(0,0,0,0.3)`;
    overlay.style.color = `#fff`;
    overlay.style.fontSize = `24px`;
    overlay.textContent = `▶`;
    host.appendChild(overlay);
  } else renderMediaPlaceholder(host, `Video`);
}

/** 原 Ns：音频渲染——海报图 + 底部 <audio> 条 */
function renderAudioContent(node: PptxPictureNode, ctx: PptxRenderContext, host: HTMLElement): void {
  const mediaUrl = resolveMediaRelUrl(node.mediaRId, ctx);
  if (mediaUrl) {
    if (node.blipEmbed) {
      const rel = ctx.slide.rels.get(node.blipEmbed);
      if (rel) {
        const posterUrl = resolvePosterUrl(rel, ctx);
        if (posterUrl) {
          const img = document.createElement(`img`);
          img.src = posterUrl;
          img.style.width = `100%`;
          img.style.height = `calc(100% - 32px)`;
          img.style.objectFit = `contain`;
          host.appendChild(img);
        }
      }
    }
    const audio = document.createElement(`audio`);
    audio.src = mediaUrl;
    audio.preload = `none`;
    audio.controls = true;
    audio.style.width = `100%`;
    audio.style.position = `absolute`;
    audio.style.bottom = `0`;
    audio.style.left = `0`;
    host.appendChild(audio);
  } else renderMediaPlaceholder(host, `Audio`);
}

/** 原 Fs：灰底虚线占位框 */
function renderMediaPlaceholder(host: HTMLElement, label: string): void {
  const box = document.createElement(`div`);
  box.style.width = `100%`;
  box.style.height = `100%`;
  box.style.display = `flex`;
  box.style.alignItems = `center`;
  box.style.justifyContent = `center`;
  box.style.backgroundColor = `#f0f0f0`;
  box.style.color = `#888`;
  box.style.fontSize = `12px`;
  box.style.border = `1px dashed #ccc`;
  box.textContent = label;
  host.appendChild(box);
}

/** 原 Is：不支持格式占位（图标 + 扩展名） */
function renderUnsupportedImagePlaceholder(host: HTMLElement, path: string): void {
  const ext = path.split(`.`).pop()?.toUpperCase() || `Unknown`;
  const box = document.createElement(`div`);
  box.style.width = `100%`;
  box.style.height = `100%`;
  box.style.display = `flex`;
  box.style.flexDirection = `column`;
  box.style.alignItems = `center`;
  box.style.justifyContent = `center`;
  box.style.backgroundColor = `#f5f5f5`;
  box.style.color = `#999`;
  box.style.fontSize = `11px`;
  box.style.border = `1px dashed #ddd`;
  const icon = document.createElement(`div`);
  icon.style.fontSize = `24px`;
  icon.style.marginBottom = `4px`;
  icon.textContent = `🖼`;
  const label = document.createElement(`div`);
  label.textContent = `Unsupported format: ${ext}`;
  box.appendChild(icon);
  box.appendChild(label);
  host.appendChild(box);
}

/** 原 Ls：EMF 内容分派（内嵌 PDF → pdfjs；DIB → canvas） */
function renderEmfContent(bytes: Uint8Array, node: PptxPictureNode, ctx: PptxRenderContext, host: HTMLElement, cacheKey: string): void {
  const parsed = parseEmf(bytes);
  switch (parsed.type) {
    case `pdf`:
      renderEmfPdf(parsed.data, host, node, ctx, cacheKey);
      break;
    case `bitmap`:
      renderEmfBitmap(parsed.imageData, host, ctx, cacheKey);
      break;
  }
}

/** 原 Rs：EMF 内嵌 PDF 异步渲染（结果缓存于 mediaUrlCache） */
function renderEmfPdf(pdfData: Uint8Array, host: HTMLElement, node: PptxPictureNode, ctx: PptxRenderContext, cacheKey: string): void {
  const cacheId = `${cacheKey}:emf-pdf`;
  const cached = ctx.mediaUrlCache.get(cacheId);
  if (cached) {
    host.appendChild(createFitImage(cached));
    return;
  }
  const task = renderEmbeddedPdfToObjectUrl(pdfData, node.size.w, node.size.h, ctx.pdfjs, ctx.signal)
    .then((url) => {
      if (url) {
        if (ctx.signal != null && ctx.signal.aborted) {
          URL.revokeObjectURL(url);
          return;
        }
        ctx.mediaUrlCache.set(cacheId, url);
        host.appendChild(createFitImage(url));
      }
    })
    .catch(() => {});
  ctx.asyncTasks?.push(task);
}

/** 原 zs：EMF DIB 位图 → canvas → PNG objectURL */
function renderEmfBitmap(imageData: ImageData, host: HTMLElement, ctx: PptxRenderContext, cacheKey: string): void {
  const cacheId = `${cacheKey}:emf-bitmap`;
  const cached = ctx.mediaUrlCache.get(cacheId);
  if (cached) {
    host.appendChild(createFitImage(cached));
    return;
  }
  const canvas = document.createElement(`canvas`);
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext(`2d`);
  if (!context) return;
  context.putImageData(imageData, 0, 0);
  const task = new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        ctx.mediaUrlCache.set(cacheId, url);
        host.appendChild(createFitImage(url));
      }
      resolve();
    }, `image/png`);
  });
  ctx.asyncTasks?.push(task);
}

/** 原 Bs：铺满的 <img> */
function createFitImage(url: string): HTMLImageElement {
  const img = document.createElement(`img`);
  img.src = url;
  img.style.width = `100%`;
  img.style.height = `100%`;
  img.style.objectFit = `fill`;
  img.style.display = `block`;
  img.draggable = false;
  return img;
}

/** 原 Vs：duotone——按亮度在双色间插值（canvas 像素改写） */
function applyDuotoneFilter(duotone: XmlNode, ctx: PptxRenderContext, img: HTMLImageElement): void {
  const entries = duotone.allChildren();
  if (entries.length < 2) return;
  const { color: first } = resolveColor(entries[0], ctx);
  const { color: second } = resolveColor(entries[1], ctx);
  if (!first || !second) return;
  const from = hexToRgb(first.startsWith(`#`) ? first : `#${first}`);
  const to = hexToRgb(second.startsWith(`#`) ? second : `#${second}`);
  const apply = () => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return;
    const canvas = document.createElement(`canvas`);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext(`2d`);
    if (!context) return;
    context.drawImage(img, 0, 0);
    const frame = context.getImageData(0, 0, width, height);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      data[i] = Math.round(from.r + (to.r - from.r) * lum);
      data[i + 1] = Math.round(from.g + (to.g - from.g) * lum);
      data[i + 2] = Math.round(from.b + (to.b - from.b) * lum);
    }
    context.putImageData(frame, 0, 0);
    img.src = canvas.toDataURL();
  };
  img.complete && img.naturalWidth ? apply() : img.addEventListener(`load`, apply, { once: true });
}

/** 原 Hs：lum 亮度/对比度调整 */
function applyLumFilter(lum: XmlNode, img: HTMLImageElement): void {
  const bright = (lum.numAttr(`bright`) ?? 0) / 1e5;
  const contrast = (lum.numAttr(`contrast`) ?? 0) / 1e5;
  if (bright === 0 && contrast === 0) return;
  const apply = () => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return;
    const canvas = document.createElement(`canvas`);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext(`2d`);
    if (!context) return;
    context.drawImage(img, 0, 0);
    const frame = context.getImageData(0, 0, width, height);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let value = data[i + c] / 255;
        contrast !== 0 && (value = 0.5 + (value - 0.5) * (1 + contrast));
        value += bright;
        data[i + c] = Math.round(Math.max(0, Math.min(255, value * 255)));
      }
    }
    context.putImageData(frame, 0, 0);
    img.src = canvas.toDataURL();
  };
  img.complete && img.naturalWidth ? apply() : img.addEventListener(`load`, apply, { once: true });
}

/** 原 Us：biLevel 二值化（亮度阈值） */
function applyBiLevelFilter(biLevel: XmlNode, img: HTMLImageElement): void {
  const threshold = (biLevel.numAttr(`thresh`) ?? 5e4) / 1e5;
  const apply = () => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return;
    const canvas = document.createElement(`canvas`);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext(`2d`);
    if (!context) return;
    context.drawImage(img, 0, 0);
    const frame = context.getImageData(0, 0, width, height);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255 >= threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    context.putImageData(frame, 0, 0);
    img.src = canvas.toDataURL();
  };
  img.complete && img.naturalWidth ? apply() : img.addEventListener(`load`, apply, { once: true });
}

/* ============================================================================
 * 表格样式与表格渲染（原 Ws..bc，jsx 13436-14284）
 * ==========================================================================*/

/**
 * 原 Ws：OOXML 内置表格样式 GUID → [样式族, 强调色]。
 * 数据逐字保留（jsx 13436-13445）。
 */
const TABLE_STYLE_GUID_MAP = new Map<string, [string, string]>([
  [`{2D5ABB26-0587-4C30-8999-92F81FD0307C}`, [`Themed-Style-1`, ``]],
  [`{3C2FFA5D-87B4-456A-9821-1D502468CF0F}`, [`Themed-Style-1`, `accent1`]],
  [`{284E427A-3D55-4303-BF80-6455036E1DE7}`, [`Themed-Style-1`, `accent2`]],
  [`{69C7853C-536D-4A76-A0AE-DD22124D55A5}`, [`Themed-Style-1`, `accent3`]],
  [`{775DCB02-9BB8-47FD-8907-85C794F793BA}`, [`Themed-Style-1`, `accent4`]],
  [`{35758FB7-9AC5-4552-8A53-C91805E547FA}`, [`Themed-Style-1`, `accent5`]],
  [`{08FB837D-C827-4EFA-A057-4D05807E0F7C}`, [`Themed-Style-1`, `accent6`]],
  [`{5940675A-B579-460E-94D1-54222C63F5DA}`, [`Themed-Style-2`, ``]],
  [`{D113A9D2-9D6B-4929-AA2D-F23B5EE8CBE7}`, [`Themed-Style-2`, `accent1`]],
  [`{18603FDC-E32A-4AB5-989C-0864C3EAD2B8}`, [`Themed-Style-2`, `accent2`]],
  [`{306799F8-075E-4A3A-A7F6-7FBC6576F1A4}`, [`Themed-Style-2`, `accent3`]],
  [`{E269D01E-BC32-4049-B463-5C60D7B0CCD2}`, [`Themed-Style-2`, `accent4`]],
  [`{327F97BB-C833-4FB7-BDE5-3F7075034690}`, [`Themed-Style-2`, `accent5`]],
  [`{638B1855-1B75-4FBE-930C-398BA8C253C6}`, [`Themed-Style-2`, `accent6`]],
  [`{9D7B26C5-4107-4FEC-AEDC-1716B250A1EF}`, [`Light-Style-1`, ``]],
  [`{3B4B98B0-60AC-42C2-AFA5-B58CD77FA1E5}`, [`Light-Style-1`, `accent1`]],
  [`{0E3FDE45-AF77-4B5C-9715-49D594BDF05E}`, [`Light-Style-1`, `accent2`]],
  [`{C083E6E3-FA7D-4D7B-A595-EF9225AFEA82}`, [`Light-Style-1`, `accent3`]],
  [`{D27102A9-8310-4765-A935-A1911B00CA55}`, [`Light-Style-1`, `accent4`]],
  [`{5FD0F851-EC5A-4D38-B0AD-8093EC10F338}`, [`Light-Style-1`, `accent5`]],
  [`{68D230F3-CF80-4859-8CE7-A43EE81993B5}`, [`Light-Style-1`, `accent6`]],
  [`{7E9639D4-E3E2-4D34-9284-5A2195B3D0D7}`, [`Light-Style-2`, ``]],
  [`{69012ECD-51FC-41F1-AA8D-1B2483CD663E}`, [`Light-Style-2`, `accent1`]],
  [`{72833802-FEF1-4C79-8D5D-14CF1EAF98D9}`, [`Light-Style-2`, `accent2`]],
  [`{F2DE63D5-997A-4646-A377-4702673A728D}`, [`Light-Style-2`, `accent3`]],
  [`{17292A2E-F333-43FB-9621-5CBBE7FDCDCB}`, [`Light-Style-2`, `accent4`]],
  [`{5A111915-BE36-4E01-A7E5-04B1672EAD32}`, [`Light-Style-2`, `accent5`]],
  [`{912C8C85-51F0-491E-9774-3900AFEF0FD7}`, [`Light-Style-2`, `accent6`]],
  [`{616DA210-FB5B-4158-B5E0-FEB733F419BA}`, [`Light-Style-3`, ``]],
  [`{BC89EF96-8CEA-46FF-86C4-4CE0E7609802}`, [`Light-Style-3`, `accent1`]],
  [`{5DA37D80-6434-44D0-A028-1B22A696006F}`, [`Light-Style-3`, `accent2`]],
  [`{8799B23B-EC83-4686-B30A-512413B5E67A}`, [`Light-Style-3`, `accent3`]],
  [`{ED083AE6-46FA-4A59-8FB0-9F97EB10719F}`, [`Light-Style-3`, `accent4`]],
  [`{BDBED569-4797-4DF1-A0F4-6AAB3CD982D8}`, [`Light-Style-3`, `accent5`]],
  [`{E8B1032C-EA38-4F05-BA0D-38AFFFC7BED3}`, [`Light-Style-3`, `accent6`]],
  [`{793D81CF-94F2-401A-BA57-92F5A7B2D0C5}`, [`Medium-Style-1`, ``]],
  [`{B301B821-A1FF-4177-AEE7-76D212191A09}`, [`Medium-Style-1`, `accent1`]],
  [`{9DCAF9ED-07DC-4A11-8D7F-57B35C25682E}`, [`Medium-Style-1`, `accent2`]],
  [`{1FECB4D8-DB02-4DC6-A0A2-4F2EBAE1DC90}`, [`Medium-Style-1`, `accent3`]],
  [`{1E171933-4619-4E11-9A3F-F7608DF75F80}`, [`Medium-Style-1`, `accent4`]],
  [`{FABFCF23-3B69-468F-B69F-88F6DE6A72F2}`, [`Medium-Style-1`, `accent5`]],
  [`{10A1B5D5-9B99-4C35-A422-299274C87663}`, [`Medium-Style-1`, `accent6`]],
  [`{073A0DAA-6AF3-43AB-8588-CEC1D06C72B9}`, [`Medium-Style-2`, ``]],
  [`{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}`, [`Medium-Style-2`, `accent1`]],
  [`{21E4AEA4-8DFA-4A89-87EB-49C32662AFE0}`, [`Medium-Style-2`, `accent2`]],
  [`{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}`, [`Medium-Style-2`, `accent3`]],
  [`{00A15C55-8517-42AA-B614-E9B94910E393}`, [`Medium-Style-2`, `accent4`]],
  [`{7DF18680-E054-41AD-8BC1-D1AEF772440D}`, [`Medium-Style-2`, `accent5`]],
  [`{93296810-A885-4BE3-A3E7-6D5BEEA58F35}`, [`Medium-Style-2`, `accent6`]],
  [`{8EC20E35-A176-4012-BC5E-935CFFF8708E}`, [`Medium-Style-3`, ``]],
  [`{6E25E649-3F16-4E02-A733-19D2CDBF48F0}`, [`Medium-Style-3`, `accent1`]],
  [`{85BE263C-DBD7-4A20-BB59-AAB30ACAA65A}`, [`Medium-Style-3`, `accent2`]],
  [`{EB344D84-9AFB-497E-A393-DC336BA19D2E}`, [`Medium-Style-3`, `accent3`]],
  [`{EB9631B5-78F2-41C9-869B-9F39066F8104}`, [`Medium-Style-3`, `accent4`]],
  [`{74C1A8A3-306A-4EB7-A6B1-4F7E0EB9C5D6}`, [`Medium-Style-3`, `accent5`]],
  [`{2A488322-F2BA-4B5B-9748-0D474271808F}`, [`Medium-Style-3`, `accent6`]],
  [`{D7AC3CCA-C797-4891-BE02-D94E43425B78}`, [`Medium-Style-4`, ``]],
  [`{69CF1AB2-1976-4502-BF36-3FF5EA218861}`, [`Medium-Style-4`, `accent1`]],
  [`{8A107856-5554-42FB-B03E-39F5DBC370BA}`, [`Medium-Style-4`, `accent2`]],
  [`{0505E3EF-67EA-436B-97B2-0124C06EBD24}`, [`Medium-Style-4`, `accent3`]],
  [`{C4B1156A-380E-4F78-BDF5-A606A8083BF9}`, [`Medium-Style-4`, `accent4`]],
  [`{22838BEF-8BB2-4498-84A7-C5851F593DF1}`, [`Medium-Style-4`, `accent5`]],
  [`{16D9F66E-5EB9-4882-86FB-DCBF35E3C3E4}`, [`Medium-Style-4`, `accent6`]],
  [`{E8034E78-7F5D-4C2E-B375-FC64B27BC917}`, [`Dark-Style-1`, ``]],
  [`{125E5076-3810-47DD-B79F-674D7AD40C01}`, [`Dark-Style-1`, `accent1`]],
  [`{37CE84F3-28C3-443E-9E96-99CF82512B78}`, [`Dark-Style-1`, `accent2`]],
  [`{D03447BB-5D67-496B-8E87-E561075AD55C}`, [`Dark-Style-1`, `accent3`]],
  [`{E929F9F4-4A8F-4326-A1B4-22849713DDAB}`, [`Dark-Style-1`, `accent4`]],
  [`{8FD4443E-F989-4FC4-A0C8-D5A2AF1F390B}`, [`Dark-Style-1`, `accent5`]],
  [`{AF606853-7671-496A-8E4F-DF71F8EC918B}`, [`Dark-Style-1`, `accent6`]],
  [`{5202B0CA-FC54-4496-8BCA-5EF66A818D29}`, [`Dark-Style-2`, ``]],
  [`{0660B408-B3CF-4A94-85FC-2B1E0A45F4A2}`, [`Dark-Style-2`, `accent1`]],
  [`{91EBBBCC-DAD2-459C-BE2E-F6DE35CF9A28}`, [`Dark-Style-2`, `accent3`]],
  [`{46F890A9-2807-4EBB-B81D-B2AA78EC7F39}`, [`Dark-Style-2`, `accent5`]],
]);

/** 原 Gs：表格样式 XML 命名空间声明 */
const TABLE_STYLE_XMLNS = `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"`;

/** 原 Ks：solidFill 片段（schemeClr + 可选变换） */
function tableSolidFillXml(scheme: string, transform?: string): string {
  return `<a:fill><a:solidFill><a:schemeClr val="${scheme}">${transform ? `<a:${transform}/>` : ``}</a:schemeClr></a:solidFill></a:fill>`;
}

/** 原 U：12700 EMU 实线边框片段 */
function tableLineXml(scheme: string, transform?: string): string {
  return `<a:ln w="12700"><a:solidFill><a:schemeClr val="${scheme}">${transform ? `<a:${transform}/>` : ``}</a:schemeClr></a:solidFill></a:ln>`;
}

/** 原 qs：单元格文本样式片段 */
function tableTextXml(scheme: string, bold: boolean): string {
  return `<a:tcTxStyle${bold ? ` b="on"` : ``}>${scheme ? `<a:schemeClr val="${scheme}"/>` : ``}</a:tcTxStyle>`;
}

interface TableRegionSpec {
  textColor?: string;
  bold?: boolean;
  fill?: string;
  borders?: Record<string, string>;
}

/** 原 W：区域元素（wholeTbl/band1H/firstRow...）XML 组装 */
function tableRegionXml(region: string, spec: TableRegionSpec): string {
  if (!spec.textColor && !spec.bold && !spec.fill && !spec.borders) return ``;
  const parts = [`<a:${region}>`];
  if (spec.textColor || spec.bold) parts.push(tableTextXml(spec.textColor ?? ``, spec.bold ?? false));
  parts.push(`<a:tcStyle>`);
  spec.fill && parts.push(spec.fill);
  if (spec.borders) {
    parts.push(`<a:tcBdr>`);
    for (const [side, line] of Object.entries(spec.borders)) parts.push(`<a:${side}>${line}</a:${side}>`);
    parts.push(`</a:tcBdr>`);
  }
  parts.push(`</a:tcStyle>`);
  parts.push(`</a:${region}>`);
  return parts.join(``);
}

/** 原 ac：tblStyle 包装 */
function wrapTableStyleXml(styleId: string, styleName: string, body: string): string {
  return `<a:tblStyle ${TABLE_STYLE_XMLNS} styleId="${styleId}" styleName="${styleName}">${body}</a:tblStyle>`;
}

/** 原 Js：Themed-Style-1（强调色网格 + 40% 条纹 + 反白首行） */
function buildThemedStyle1(accent: string, styleId: string): string {
  const hasAccent = accent !== ``;
  const scheme = hasAccent ? accent : `tx1`;
  const regions: string[] = [];
  if (hasAccent) {
    const borders = {
      left: tableLineXml(scheme),
      right: tableLineXml(scheme),
      top: tableLineXml(scheme),
      bottom: tableLineXml(scheme),
      insideH: tableLineXml(scheme),
      insideV: tableLineXml(scheme),
    };
    regions.push(tableRegionXml(`wholeTbl`, { textColor: `dk1`, borders }));
    const band = tableSolidFillXml(scheme, `alpha val="40000"`);
    regions.push(tableRegionXml(`band1H`, { fill: band }));
    regions.push(tableRegionXml(`band1V`, { fill: band }));
    regions.push(
      tableRegionXml(`firstRow`, {
        textColor: `lt1`,
        bold: true,
        fill: tableSolidFillXml(scheme),
        borders: {
          left: tableLineXml(scheme),
          right: tableLineXml(scheme),
          top: tableLineXml(scheme),
          bottom: tableLineXml(`lt1`),
        },
      }),
    );
    regions.push(
      tableRegionXml(`lastRow`, {
        bold: true,
        borders: {
          left: tableLineXml(scheme),
          right: tableLineXml(scheme),
          top: tableLineXml(scheme),
          bottom: tableLineXml(scheme),
        },
      }),
    );
    const colBorders = {
      left: tableLineXml(scheme),
      right: tableLineXml(scheme),
      top: tableLineXml(scheme),
      bottom: tableLineXml(scheme),
      insideH: tableLineXml(scheme),
    };
    regions.push(tableRegionXml(`firstCol`, { bold: true, borders: colBorders }));
    regions.push(tableRegionXml(`lastCol`, { bold: true, borders: colBorders }));
  } else {
    regions.push(tableRegionXml(`wholeTbl`, { textColor: `tx1` }));
    const band = tableSolidFillXml(`tx1`, `alpha val="40000"`);
    regions.push(tableRegionXml(`band1H`, { fill: band }));
    regions.push(tableRegionXml(`band1V`, { fill: band }));
  }
  return wrapTableStyleXml(styleId, `Themed-Style-1`, regions.join(``));
}

/** 原 Ys：Themed-Style-2（强调色底 + 20% 条纹 + 白线分隔） */
function buildThemedStyle2(accent: string, styleId: string): string {
  const hasAccent = accent !== ``;
  const regions: string[] = [];
  if (hasAccent) {
    const scheme = accent;
    const tableBg = `<a:tblBg><a:fillRef idx="1"><a:schemeClr val="${scheme}"/></a:fillRef></a:tblBg>`;
    const borders = {
      left: tableLineXml(scheme, `tint val="50000"`),
      right: tableLineXml(scheme, `tint val="50000"`),
      top: tableLineXml(scheme, `tint val="50000"`),
      bottom: tableLineXml(scheme, `tint val="50000"`),
    };
    regions.push(tableRegionXml(`wholeTbl`, { textColor: `lt1`, borders }));
    const band = tableSolidFillXml(`lt1`, `alpha val="20000"`);
    regions.push(tableRegionXml(`band1H`, { fill: band }));
    regions.push(tableRegionXml(`band1V`, { fill: band }));
    regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, borders: { bottom: tableLineXml(`lt1`) } }));
    regions.push(tableRegionXml(`lastRow`, { bold: true, borders: { top: tableLineXml(`lt1`) } }));
    regions.push(tableRegionXml(`firstCol`, { bold: true, borders: { right: tableLineXml(`lt1`) } }));
    regions.push(tableRegionXml(`lastCol`, { bold: true, borders: { left: tableLineXml(`lt1`) } }));
    return wrapTableStyleXml(styleId, `Themed-Style-2`, tableBg + regions.join(``));
  }
  const borders = {
    left: tableLineXml(`tx1`, `tint val="50000"`),
    right: tableLineXml(`tx1`, `tint val="50000"`),
    top: tableLineXml(`tx1`, `tint val="50000"`),
    bottom: tableLineXml(`tx1`, `tint val="50000"`),
    insideH: tableLineXml(`tx1`),
    insideV: tableLineXml(`tx1`),
  };
  regions.push(tableRegionXml(`wholeTbl`, { borders }));
  const band = tableSolidFillXml(`tx1`, `alpha val="20000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  return wrapTableStyleXml(styleId, `Themed-Style-2`, regions.join(``));
}

/** 原 Xs：Light-Style-1（上下横线 + 20% 条纹 + 粗首尾行） */
function buildLightStyle1(accent: string, styleId: string): string {
  const scheme = accent || `tx1`;
  const regions: string[] = [];
  regions.push(tableRegionXml(`wholeTbl`, { textColor: `tx1`, borders: { top: tableLineXml(scheme), bottom: tableLineXml(scheme) } }));
  const band = tableSolidFillXml(scheme, `alpha val="20000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `tx1`, bold: true, borders: { bottom: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, borders: { top: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`firstCol`, { textColor: `tx1`, bold: true }));
  regions.push(tableRegionXml(`lastCol`, { textColor: `tx1`, bold: true }));
  return wrapTableStyleXml(styleId, `Light-Style-1`, regions.join(``));
}

/** 原 Zs：Light-Style-2（全框 + 条纹边框 + 强调色首行底） */
function buildLightStyle2(accent: string, styleId: string): string {
  const scheme = accent || `tx1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `tx1`,
      borders: {
        left: tableLineXml(scheme),
        right: tableLineXml(scheme),
        top: tableLineXml(scheme),
        bottom: tableLineXml(scheme),
      },
    }),
  );
  regions.push(tableRegionXml(`band1H`, { borders: { top: tableLineXml(scheme), bottom: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`band1V`, { borders: { left: tableLineXml(scheme), right: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`band2V`, { borders: { left: tableLineXml(scheme), right: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `bg1`, bold: true, fill: tableSolidFillXml(scheme) }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, borders: { top: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true }));
  regions.push(tableRegionXml(`lastCol`, { bold: true }));
  return wrapTableStyleXml(styleId, `Light-Style-2`, regions.join(``));
}

/** 原 Qs：Light-Style-3（全框含内线 + 20% 条纹 + 强调色首行底线） */
function buildLightStyle3(accent: string, styleId: string): string {
  const scheme = accent || `tx1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `tx1`,
      borders: {
        left: tableLineXml(scheme),
        right: tableLineXml(scheme),
        top: tableLineXml(scheme),
        bottom: tableLineXml(scheme),
        insideH: tableLineXml(scheme),
        insideV: tableLineXml(scheme),
      },
    }),
  );
  const band = tableSolidFillXml(scheme, `alpha val="20000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: scheme, bold: true, borders: { bottom: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, borders: { top: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true }));
  regions.push(tableRegionXml(`lastCol`, { bold: true }));
  return wrapTableStyleXml(styleId, `Light-Style-3`, regions.join(``));
}

/** 原 $s：Medium-Style-1（白底 + 强调色全框内线 + 40% 条纹 + 强调色首行） */
function buildMediumStyle1(accent: string, styleId: string): string {
  const scheme = accent || `dk1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `dk1`,
      fill: tableSolidFillXml(`lt1`),
      borders: {
        left: tableLineXml(scheme),
        right: tableLineXml(scheme),
        top: tableLineXml(scheme),
        bottom: tableLineXml(scheme),
        insideH: tableLineXml(scheme),
      },
    }),
  );
  const band = tableSolidFillXml(scheme, `tint val="20000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme) }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, fill: tableSolidFillXml(`lt1`), borders: { top: tableLineXml(scheme) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true }));
  regions.push(tableRegionXml(`lastCol`, { bold: true }));
  return wrapTableStyleXml(styleId, `Medium-Style-1`, regions.join(``));
}

/** 原 ec：Medium-Style-2（20% 底 + 白内线 + 40% 条纹 + 强调色首行/首列） */
function buildMediumStyle2(accent: string, styleId: string): string {
  const scheme = accent || `dk1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `dk1`,
      fill: tableSolidFillXml(scheme, `tint val="20000"`),
      borders: {
        left: tableLineXml(`lt1`),
        right: tableLineXml(`lt1`),
        top: tableLineXml(`lt1`),
        bottom: tableLineXml(`lt1`),
        insideH: tableLineXml(`lt1`),
        insideV: tableLineXml(`lt1`),
      },
    }),
  );
  const band = tableSolidFillXml(scheme, `tint val="40000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme), borders: { bottom: tableLineXml(`lt1`) } }));
  regions.push(tableRegionXml(`lastRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme), borders: { top: tableLineXml(`lt1`) } }));
  regions.push(tableRegionXml(`firstCol`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme) }));
  regions.push(tableRegionXml(`lastCol`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme) }));
  return wrapTableStyleXml(styleId, `Medium-Style-2`, regions.join(``));
}

/** 原 tc：Medium-Style-3（白底 + dk1 上下线 + 首行强调色底） */
function buildMediumStyle3(accent: string, styleId: string): string {
  const scheme = accent || `dk1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `dk1`,
      fill: tableSolidFillXml(`lt1`),
      borders: { top: tableLineXml(`dk1`), bottom: tableLineXml(`dk1`) },
    }),
  );
  const band = tableSolidFillXml(`dk1`, `tint val="20000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme), borders: { bottom: tableLineXml(`dk1`) } }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, fill: tableSolidFillXml(`lt1`), borders: { top: tableLineXml(`dk1`) } }));
  regions.push(tableRegionXml(`firstCol`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme) }));
  regions.push(tableRegionXml(`lastCol`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(scheme) }));
  return wrapTableStyleXml(styleId, `Medium-Style-3`, regions.join(``));
}

/** 原 nc：Medium-Style-4（20% 底 + 全框内线 + 40% 条纹 + 首行 20% 底） */
function buildMediumStyle4(accent: string, styleId: string): string {
  const scheme = accent || `dk1`;
  const regions: string[] = [];
  regions.push(
    tableRegionXml(`wholeTbl`, {
      textColor: `dk1`,
      fill: tableSolidFillXml(scheme, `tint val="20000"`),
      borders: {
        left: tableLineXml(scheme),
        right: tableLineXml(scheme),
        top: tableLineXml(scheme),
        bottom: tableLineXml(scheme),
        insideH: tableLineXml(scheme),
        insideV: tableLineXml(scheme),
      },
    }),
  );
  const band = tableSolidFillXml(scheme, `tint val="40000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: scheme, bold: true, fill: tableSolidFillXml(scheme, `tint val="20000"`) }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, fill: tableSolidFillXml(`dk1`, `tint val="20000"`), borders: { top: tableLineXml(`dk1`) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true }));
  regions.push(tableRegionXml(`lastCol`, { bold: true }));
  return wrapTableStyleXml(styleId, `Medium-Style-4`, regions.join(``));
}

/** 原 rc：Dark-Style-1（有强调色用 shade、无则 tint；深色首行/首列） */
function buildDarkStyle1(accent: string, styleId: string): string {
  const hasAccent = accent !== ``;
  const scheme = hasAccent ? accent : `dk1`;
  const transform = hasAccent ? `shade` : `tint`;
  const regions: string[] = [];
  regions.push(tableRegionXml(`wholeTbl`, { textColor: `dk1`, fill: tableSolidFillXml(scheme, `${transform} val="20000"`) }));
  const band = tableSolidFillXml(scheme, `${transform} val="40000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(`dk1`), borders: { bottom: tableLineXml(`lt1`) } }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, fill: tableSolidFillXml(scheme), borders: { top: tableLineXml(`lt1`) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true, fill: tableSolidFillXml(scheme, `${transform} val="60000"`), borders: { right: tableLineXml(`lt1`) } }));
  regions.push(tableRegionXml(`lastCol`, { bold: true, fill: tableSolidFillXml(scheme, `${transform} val="60000"`), borders: { left: tableLineXml(`lt1`) } }));
  return wrapTableStyleXml(styleId, `Dark-Style-1`, regions.join(``));
}

/** 原 ic：Dark-Style-2（强调色配对轮换：1→2、3→4、5→6） */
function buildDarkStyle2(accent: string, styleId: string): string {
  const scheme = accent || `dk1`;
  const regions: string[] = [];
  let paired: string;
  if (accent === ``) paired = `dk1`;
  else if (accent === `accent1`) paired = `accent2`;
  else if (accent === `accent3`) paired = `accent4`;
  else if (accent === `accent5`) paired = `accent6`;
  else paired = scheme;
  regions.push(tableRegionXml(`wholeTbl`, { textColor: `dk1`, fill: tableSolidFillXml(scheme, `tint val="20000"`) }));
  const band = tableSolidFillXml(scheme, `tint val="40000"`);
  regions.push(tableRegionXml(`band1H`, { fill: band }));
  regions.push(tableRegionXml(`band1V`, { fill: band }));
  regions.push(tableRegionXml(`firstRow`, { textColor: `lt1`, bold: true, fill: tableSolidFillXml(paired) }));
  regions.push(tableRegionXml(`lastRow`, { bold: true, fill: tableSolidFillXml(scheme, `tint val="20000"`), borders: { top: tableLineXml(`dk1`) } }));
  regions.push(tableRegionXml(`firstCol`, { bold: true }));
  regions.push(tableRegionXml(`lastCol`, { bold: true }));
  return wrapTableStyleXml(styleId, `Dark-Style-2`, regions.join(``));
}

/** 原 oc：样式族 → 构建器 */
const TABLE_STYLE_BUILDERS: Record<string, (accent: string, styleId: string) => string> = {
  "Themed-Style-1": buildThemedStyle1,
  "Themed-Style-2": buildThemedStyle2,
  "Light-Style-1": buildLightStyle1,
  "Light-Style-2": buildLightStyle2,
  "Light-Style-3": buildLightStyle3,
  "Medium-Style-1": buildMediumStyle1,
  "Medium-Style-2": buildMediumStyle2,
  "Medium-Style-3": buildMediumStyle3,
  "Medium-Style-4": buildMediumStyle4,
  "Dark-Style-1": buildDarkStyle1,
  "Dark-Style-2": buildDarkStyle2,
};

const tableStyleCache = new Map<string, XmlNode>(); // 原 sc

/** 原 cc：GUID → 内置 tblStyle 节点（构建后缓存） */
function lookupBuiltinTableStyle(styleId: string): XmlNode | undefined {
  const cached = tableStyleCache.get(styleId);
  if (cached) return cached;
  const entry = TABLE_STYLE_GUID_MAP.get(styleId);
  if (!entry) return;
  const [family, accent] = entry;
  const builder = TABLE_STYLE_BUILDERS[family];
  if (!builder) return;
  const parsed = parseXml(builder(accent, styleId));
  if (parsed.exists()) {
    tableStyleCache.set(styleId, parsed);
    return parsed;
  }
  return undefined;
}

void TABLE_STYLE_GUID_MAP.size; // 原 `Ws.size;`（jsx 13948）

/**
 * 原 dc：表格样式解析——先查 presentation.tableStyles 中的
 * tblStyle（两种遍历方式兜底），未命中则用 GUID 内置模板。
 */
export function resolveTableStyleNode(styleId: string | undefined, ctx: PptxRenderContext): XmlNode | undefined {
  if (!styleId || !ctx.presentation.tableStyles) return;
  const styles = ctx.presentation.tableStyles;
  for (const entry of styles.children(`tblStyle`)) if (entry.attr(`styleId`) === styleId) return entry;
  for (const entry of styles.children()) if (entry.localName === `tblStyle` && entry.attr(`styleId`) === styleId) return entry;
  return lookupBuiltinTableStyle(styleId);
}

/**
 * 原 fc：按单元格位置收集生效的样式区域——wholeTbl 恒在，
 * 随后按表格属性开关叠加条纹/首末行列区域（有序，后者优先）。
 */
function collectTableCellRegions(
  style: XmlNode,
  row: number,
  col: number,
  rowCount: number,
  colCount: number,
  tableProperties?: XmlNode,
): XmlNode[] {
  const regions: XmlNode[] = [];
  const boolProp = (attrName: string, childName: string): boolean => {
    if (!tableProperties) return false;
    const attrValue = tableProperties.attr(attrName);
    if (attrValue !== undefined) return parseXmlBool(attrValue);
    const child = tableProperties.child(childName);
    return child.exists() ? parseXmlBool(child.attr(`val`), true) : false;
  };
  const bandRow = boolProp(`bandRow`, `bandRow`);
  const bandCol = boolProp(`bandCol`, `bandCol`);
  const firstRow = boolProp(`firstRow`, `firstRow`);
  const lastRow = boolProp(`lastRow`, `lastRow`);
  const firstCol = boolProp(`firstCol`, `firstCol`);
  const lastCol = boolProp(`lastCol`, `lastCol`);
  const whole = style.child(`wholeTbl`);
  whole.exists() && regions.push(whole);
  if (bandRow) {
    const adjustedRow = firstRow ? row - 1 : row;
    if (adjustedRow >= 0 && adjustedRow % 2 === 1) {
      const region = style.child(`band2H`);
      region.exists() && regions.push(region);
    } else if (adjustedRow >= 0 && adjustedRow % 2 === 0) {
      const region = style.child(`band1H`);
      region.exists() && regions.push(region);
    }
  }
  if (bandCol) {
    if (col % 2 === 1) {
      const region = style.child(`band2V`);
      region.exists() && regions.push(region);
    } else {
      const region = style.child(`band1V`);
      region.exists() && regions.push(region);
    }
  }
  if (firstRow && row === 0) {
    const region = style.child(`firstRow`);
    region.exists() && regions.push(region);
  }
  if (lastRow && row === rowCount - 1) {
    const region = style.child(`lastRow`);
    region.exists() && regions.push(region);
  }
  if (firstCol && col === 0) {
    const region = style.child(`firstCol`);
    region.exists() && regions.push(region);
  }
  if (lastCol && col === colCount - 1) {
    const region = style.child(`lastCol`);
    region.exists() && regions.push(region);
  }
  return regions;
}

/** 原 pc：区域栈中最后一个 tcTxStyle → 文本样式（色/粗/斜/字体） */
function resolveTableCellTextStyle(regions: XmlNode[], ctx: PptxRenderContext): {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string[];
} | undefined {
  for (let i = regions.length - 1; i >= 0; i--) {
    const textStyle = regions[i].child(`tcTxStyle`);
    if (!textStyle.exists()) continue;
    const out: { color?: string; bold?: boolean; italic?: boolean; fontFamily?: string[] } = {};
    const boldAttr = textStyle.attr(`b`);
    boldAttr !== undefined && (out.bold = parseXmlBool(boldAttr));
    const italicAttr = textStyle.attr(`i`);
    italicAttr !== undefined && (out.italic = parseXmlBool(italicAttr));
    for (const child of textStyle.allChildren()) {
      const name = child.localName;
      if (name === `schemeClr` || name === `solidFill` || name === `srgbClr` || name === `scrgbClr` || name === `prstClr` || name === `sysClr`) {
        const { color, alpha } = resolveColor(child, ctx);
        const hex = color.startsWith(`#`) ? color : `#${color}`;
        if (alpha < 1) {
          const { r, g, b } = hexToRgb(hex);
          out.color = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        } else out.color = hex;
        break;
      }
    }
    const font = textStyle.child(`font`);
    if (font.exists()) {
      const family = resolveTypefaceStack(
        [font.child(`latin`).attr(`typeface`), font.child(`ea`).attr(`typeface`), font.child(`cs`).attr(`typeface`)],
        ctx,
      );
      family.length > 0 && (out.fontFamily = family);
    }
    if (!out.fontFamily) {
      const fontRef = textStyle.child(`fontRef`);
      if (fontRef.exists()) {
        const idx = fontRef.attr(`idx`);
        if (idx === `major`) {
          const family = resolveTypefaceStack([`+mj-lt`, `+mj-ea`, `+mj-cs`], ctx);
          family.length > 0 && (out.fontFamily = family);
        } else if (idx === `minor`) {
          const family = resolveTypefaceStack([`+mn-lt`, `+mn-ea`, `+mn-cs`], ctx);
          family.length > 0 && (out.fontFamily = family);
        }
      }
    }
    return out;
  }
  return undefined;
}

/** 原 mc：区域 tcStyle 填充应用（noFill/solid/渐变图案/fillRef） */
function applyTableCellFill(cell: HTMLElement, tcStyle: XmlNode, ctx: PptxRenderContext): boolean {
  const fill = tcStyle.child(`fill`);
  if (!fill.exists()) return false;
  if (fill.child(`noFill`).exists()) {
    clearPictureBackground(cell);
    cell.style.background = `transparent`;
    return true;
  }
  const solid = fill.child(`solidFill`);
  if (solid.exists()) {
    clearPictureBackground(cell);
    const { color, alpha } = resolveColor(solid, ctx);
    const hex = color.startsWith(`#`) ? color : `#${color}`;
    if (alpha < 1) {
      const { r, g, b } = hexToRgb(hex);
      cell.style.backgroundColor = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    } else cell.style.backgroundColor = hex;
    return true;
  }
  const css = resolveFillCss(fill, ctx);
  if (css) {
    applyPictureBackgroundCss(cell, css);
    return true;
  }
  const fillRef = fill.child(`fillRef`);
  if (fillRef.exists()) {
    const { fillCss } = resolveThemeFill(fillRef, ctx);
    applyPictureBackgroundCss(cell, fillCss);
    return true;
  }
  return false;
}

/**
 * 原 hc：区域 tcBdr 边框应用——四边 + insideH/insideV 按
 * 行列位置展开为对应边；支持 ln 与 lnRef（主题线宽）。
 */
function applyTableCellBorders(
  cell: HTMLElement,
  tcStyle: XmlNode,
  ctx: PptxRenderContext,
  row?: number,
  col?: number,
  rowCount?: number,
  colCount?: number,
): void {
  const borders = tcStyle.child(`tcBdr`);
  if (!borders.exists()) return;
  const sides: [string, string][] = [
    [`top`, `borderTop`],
    [`bottom`, `borderBottom`],
    [`left`, `borderLeft`],
    [`right`, `borderRight`],
  ];
  borders.child(`insideH`).exists() &&
    row !== undefined &&
    rowCount !== undefined &&
    (row < rowCount - 1 && sides.push([`insideH`, `borderBottom`]), row > 0 && sides.push([`insideH`, `borderTop`]));
  borders.child(`insideV`).exists() &&
    col !== undefined &&
    colCount !== undefined &&
    (col < colCount - 1 && sides.push([`insideV`, `borderRight`]), col > 0 && sides.push([`insideV`, `borderLeft`]));
  for (const [childName, styleProp] of sides) {
    const side = borders.child(childName);
    if (!side.exists()) continue;
    const line = side.child(`ln`);
    if (line.exists()) {
      if (line.child(`noFill`).exists()) continue;
      const resolved = resolveLineStyle(line, ctx);
      resolved.width > 0 &&
        resolved.color !== `transparent` &&
        (cell.style[styleProp as `borderTop`] = `${Math.max(resolved.width, 0.5)}px ${resolved.dash} ${resolved.color}`);
      continue;
    }
    const lineRef = side.child(`lnRef`);
    if (lineRef.exists()) {
      const idx = lineRef.numAttr(`idx`) ?? 0;
      if (idx === 0) continue;
      const { color, alpha } = resolveColor(lineRef, ctx);
      const hex = color.startsWith(`#`) ? color : `#${color}`;
      let width = 1;
      ctx.theme.lineStyles && ctx.theme.lineStyles.length >= idx && (width = emuToPx(ctx.theme.lineStyles[idx - 1].numAttr(`w`) ?? 12700));
      const css = alpha < 1 ? `rgba(${hexToRgb(hex).r},${hexToRgb(hex).g},${hexToRgb(hex).b},${alpha.toFixed(3)})` : hex;
      width > 0 && (cell.style[styleProp as `borderTop`] = `${Math.max(width, 0.5)}px solid ${css}`);
    }
  }
}

/** 原 gc：tblBg 表格整体背景（fillRef/solid/渐变图案） */
function applyTableBackground(table: HTMLElement, style: XmlNode, ctx: PptxRenderContext): void {
  const background = style.child(`tblBg`);
  if (!background.exists()) return;
  const fillRef = background.child(`fillRef`);
  if (fillRef.exists()) {
    const { fillCss } = resolveThemeFill(fillRef, ctx);
    applyPictureBackgroundCss(table, fillCss);
    return;
  }
  const solid = background.child(`solidFill`);
  if (solid.exists()) {
    clearPictureBackground(table);
    const { color, alpha } = resolveColor(solid, ctx);
    const hex = color.startsWith(`#`) ? color : `#${color}`;
    if (alpha < 1) {
      const { r, g, b } = hexToRgb(hex);
      table.style.backgroundColor = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    } else table.style.backgroundColor = hex;
    return;
  }
  const css = resolveFillCss(background, ctx);
  css && applyPictureBackgroundCss(table, css);
}

/** 原 _c：表格翻转 → 内容反向 transform */
function tableFlipTransform(node: PptxTableNode): string {
  const parts: string[] = [];
  node.flipH && parts.push(`scaleX(-1)`);
  node.flipV && parts.push(`scaleY(-1)`);
  return parts.join(` `);
}

/**
 * 原 vc：表格渲染主体——固定布局 <table>，列宽/行高按 EMU 比例；
 * 合并单元格按 gridSpan/rowSpan 展开（hMerge/vMerge 跳过）；
 * 样式区域栈 → 填充/边框/文本样式，最后渲染单元格文本体。
 */
export function renderTableNode(node: PptxTableNode, ctx: PptxRenderContext): HTMLElement {
  const host = document.createElement(`div`);
  host.style.position = `absolute`;
  host.style.left = `${node.position.x}px`;
  host.style.top = `${node.position.y}px`;
  host.style.width = `${node.size.w}px`;
  host.style.height = `${node.size.h}px`;
  host.style.overflow = `hidden`;
  const transforms: string[] = [];
  node.rotation !== 0 && transforms.push(`rotate(${node.rotation}deg)`);
  node.flipH && transforms.push(`scaleX(-1)`);
  node.flipV && transforms.push(`scaleY(-1)`);
  transforms.length > 0 && (host.style.transform = transforms.join(` `));
  const styleNode = resolveTableStyleNode(node.tableStyleId, ctx);
  const tableProperties = node.properties;
  const rowCount = node.rows.length;
  const colCount = node.columns.length;
  const table = document.createElement(`table`);
  table.style.borderCollapse = `collapse`;
  table.style.width = `100%`;
  table.style.height = `100%`;
  table.style.tableLayout = `fixed`;
  styleNode && applyTableBackground(table, styleNode, ctx);
  const totalWidth = node.columns.reduce((sum, w) => sum + w, 0);
  if (totalWidth > 0 && node.columns.length > 0) {
    const colgroup = document.createElement(`colgroup`);
    for (const width of node.columns) {
      const col = document.createElement(`col`);
      col.style.width = `${(width / totalWidth) * 100}%`;
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);
  }
  const totalHeight = node.rows.reduce((sum, row) => sum + row.height, 0);
  const tbody = document.createElement(`tbody`);
  let colIndex = 0;
  for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++) {
    const row = node.rows[rowIndex];
    const tr = document.createElement(`tr`);
    row.height > 0 && totalHeight > 0 && (tr.style.height = `${(row.height / totalHeight) * 100}%`);
    colIndex = 0;
    for (const cellData of row.cells) {
      if (cellData.hMerge || cellData.vMerge) {
        cellData.vMerge && !cellData.hMerge && (colIndex += cellData.gridSpan);
        continue;
      }
      const td = document.createElement(`td`);
      td.style.overflow = `hidden`;
      cellData.gridSpan > 1 && (td.colSpan = cellData.gridSpan);
      cellData.rowSpan > 1 && (td.rowSpan = cellData.rowSpan);
      let regions: XmlNode[] = [];
      if (styleNode) {
        regions = collectTableCellRegions(styleNode, rowIndex, colIndex, rowCount, colCount, tableProperties);
        for (const region of regions) {
          const tcStyle = region.child(`tcStyle`);
          tcStyle.exists() && (applyTableCellFill(td, tcStyle, ctx), applyTableCellBorders(td, tcStyle, ctx, rowIndex, colIndex, rowCount, colCount));
        }
      }
      applyTableCellOwnStyle(td, cellData, ctx);
      const textStyle = regions.length > 0 ? resolveTableCellTextStyle(regions, ctx) : undefined;
      if (cellData.textBody) {
        const flip = tableFlipTransform(node);
        const textHost = flip ? document.createElement(`div`) : td;
        flip &&
          textHost !== td &&
          ((textHost.style.width = `100%`),
          (textHost.style.height = `100%`),
          (textHost.style.transform = flip),
          (textHost.style.transformOrigin = `center center`));
        renderTextBody(cellData.textBody, undefined, ctx, textHost, {
          defaultLineHeight: `1`,
          trimOuterParagraphSpacing: true,
          ...(textStyle
            ? {
                cellTextColor: textStyle.color,
                cellTextBold: textStyle.bold,
                cellTextItalic: textStyle.italic,
                cellTextFontFamily: textStyle.fontFamily,
              }
            : {}),
        });
        textHost !== td && td.appendChild(textHost);
      }
      tr.appendChild(td);
      colIndex += cellData.gridSpan;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  host.appendChild(table);
  return host;
}

/** 原 yc：单元格自身属性（溢出/填充/四边/边距/垂直对齐） */
function applyTableCellOwnStyle(td: HTMLElement, cell: PptxTableCell, ctx: PptxRenderContext): void {
  const properties = cell.properties;
  properties?.attr(`horzOverflow`) === `overflow` && (td.style.overflow = `visible`);
  if (properties) {
    if (properties.child(`noFill`).exists()) {
      clearPictureBackground(td);
      td.style.background = `transparent`;
    } else if (properties.child(`solidFill`).exists()) {
      const solid = properties.child(`solidFill`);
      clearPictureBackground(td);
      const { color, alpha } = resolveColor(solid, ctx);
      const hex = color.startsWith(`#`) ? color : `#${color}`;
      if (alpha < 1) {
        const { r, g, b } = hexToRgb(hex);
        td.style.backgroundColor = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      } else td.style.backgroundColor = hex;
    } else {
      const css = resolveFillCss(properties, ctx);
      css && applyPictureBackgroundCss(td, css);
    }
    applyTableCellBorder(td, properties, `lnT`, `borderTop`, ctx);
    applyTableCellBorder(td, properties, `lnB`, `borderBottom`, ctx);
    applyTableCellBorder(td, properties, `lnL`, `borderLeft`, ctx);
    applyTableCellBorder(td, properties, `lnR`, `borderRight`, ctx);
  }
  const marL = properties?.numAttr(`marL`);
  const marR = properties?.numAttr(`marR`);
  const marT = properties?.numAttr(`marT`);
  const marB = properties?.numAttr(`marB`);
  const defaultHorizontal = 91440;
  td.style.paddingLeft = `${emuToPx(marL ?? defaultHorizontal)}px`;
  td.style.paddingRight = `${emuToPx(marR ?? defaultHorizontal)}px`;
  td.style.paddingTop = `${emuToPx(marT ?? 45720)}px`;
  td.style.paddingBottom = `${emuToPx(marB ?? 45720)}px`;
  const anchor = properties?.attr(`anchor`);
  const anchorMap: Record<string, string> = { t: `top`, ctr: `middle`, b: `bottom` };
  td.style.verticalAlign = anchorMap[anchor || `t`] || `top`;
}

/** 原 bc：单元格显式边（lnT/lnB/lnL/lnR；noFill → none） */
function applyTableCellBorder(td: HTMLElement, properties: XmlNode, childName: string, styleProp: string, ctx: PptxRenderContext): void {
  const line = properties.child(childName);
  if (!line.exists()) return;
  if (line.child(`noFill`).exists()) {
    (td.style as unknown as Record<string, string>)[styleProp] = `none`;
    return;
  }
  const resolved = resolveLineStyle(line, ctx);
  resolved.width > 0 &&
    resolved.color !== `transparent` &&
    ((td.style as unknown as Record<string, string>)[styleProp] = `${Math.max(resolved.width, 0.5)}px ${resolved.dash} ${resolved.color}`);
}

/* ============================================================================
 * 组节点渲染（原 wc..kc，jsx 14284-14492）
 * ==========================================================================*/

/** 原 xc：翻转是否下传（表格/图表以外的节点自行翻转） */
function isFlipPropagatingNode(node: PptxNode): boolean {
  return node.nodeType !== `table` && node.nodeType !== `chart`;
}

/** 原 Sc：90/270 度旋转判定（组内缩放需交换宽高） */
function isQuarterRotation(rotation: number): boolean {
  const normalized = ((rotation % 360) + 360) % 360;
  return Math.abs(normalized - 90) < 1e-4 || Math.abs(normalized - 270) < 1e-4;
}

/** 原 Cc：形状文本框边界按组缩放系数换算 */
function scaleShapeTextBoxBounds(node: PptxNode, scaleX: number, scaleY: number, swapped: boolean): void {
  if (node.nodeType !== `shape`) return;
  const shape = node;
  if (!shape.textBoxBounds) return;
  const factorX = swapped ? scaleY : scaleX;
  const factorY = swapped ? scaleX : scaleY;
  const bounds = shape.textBoxBounds;
  shape.textBoxBounds = {
    ...bounds,
    x: bounds.x * factorX,
    y: bounds.y * factorY,
    w: bounds.w * factorX,
    h: bounds.h * factorY,
  };
}

/** 原 wc：组阴影颜色（缺省半透明黑） */
function groupShadowColorCss(shadow: XmlNode, ctx: PptxRenderContext, fallback: string): string {
  const { color, alpha } = resolveColor(shadow, ctx);
  if (!color) return fallback;
  const { r, g, b } = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** 原 Tc：组外阴影（直接覆写 filter，区别于图片分支的追加） */
function applyGroupOuterShadow(host: HTMLElement, node: PptxGroupNode, shadow: XmlNode, ctx: PptxRenderContext): void {
  const dir = shadow.numAttr(`dir`) ?? 0;
  const dist = emuToPx(shadow.numAttr(`dist`) ?? 0);
  const blur = emuToPx(shadow.numAttr(`blurRad`) ?? 0);
  const rad = dir / 6e4;
  const dx = dist * Math.cos((rad * Math.PI) / 180);
  const dy = dist * Math.sin((rad * Math.PI) / 180);
  const colorCss = groupShadowColorCss(shadow, ctx, `rgba(0,0,0,0.4)`);
  const sx = shadow.numAttr(`sx`);
  const sy = shadow.numAttr(`sy`);
  if (sx != null && sy != null && sx > 0 && sy > 0) {
    const scaleW = sx / 1e5;
    const scaleH = sy / 1e5;
    const growW = (node.size.w * (scaleW - 1)) / 2;
    const growH = (node.size.h * (scaleH - 1)) / 2;
    const spread = Math.max(0, (growW + growH) / 2);
    host.style.boxShadow = `${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px ${spread.toFixed(1)}px ${colorCss}`;
    return;
  }
  host.style.filter = `drop-shadow(${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px ${colorCss})`;
}

/** 原 Ec：组倒影（同图片分支） */
function applyGroupReflection(host: HTMLElement, reflection: XmlNode): void {
  const dist = emuToPx(reflection.numAttr(`dist`) ?? 0);
  const startAlpha = (reflection.numAttr(`stA`) ?? 5e4) / 1e5;
  const endAlpha = (reflection.numAttr(`endA`) ?? 0) / 1e5;
  const startPos = Math.max(0, Math.min(100, (reflection.numAttr(`stPos`) ?? 0) / 1e3));
  const endPos = Math.max(0, Math.min(100, (reflection.numAttr(`endPos`) ?? 1e5) / 1e3));
  const gradient = `linear-gradient(to bottom, rgba(255,255,255,${startAlpha.toFixed(3)}) ${startPos.toFixed(1)}%, rgba(255,255,255,${endAlpha.toFixed(3)}) ${endPos.toFixed(1)}%)`;
  const value = `below ${dist.toFixed(1)}px ${gradient}`;
  host.style.setProperty(`-webkit-box-reflect`, value);
  (host.style as CSSStyleDeclaration & { webkitBoxReflect: string }).webkitBoxReflect = value;
}

/** 原 Dc：grpSpPr effectLst → 外阴影/倒影 */
function applyGroupEffects(host: HTMLElement, node: PptxGroupNode, ctx: PptxRenderContext, grpSpPr: XmlNode): void {
  const effects = grpSpPr.child(`effectLst`);
  if (!effects.exists()) return;
  const shadow = effects.child(`outerShdw`);
  shadow.exists() && applyGroupOuterShadow(host, node, shadow, ctx);
  const reflection = effects.child(`reflection`);
  reflection.exists() && applyGroupReflection(host, reflection);
}

/**
 * 原 Oc：组渲染——子坐标按 childOffset/childExtent 映射到组尺寸；
 * 组级翻转下传；90/270 旋转子节点交换缩放；特判 3 pie + 3 circularArrow
 * 的饼图组合（统一尺寸重排）；单子节点渲染失败显示错误占位。
 *
 * @param renderChild  子节点 → DOM 的分派器（原 bq，主文件提供）
 * @param buildGroupChild 子 XML → 节点模型（原 kc：et + Ct，主文件提供）
 */
export function renderGroupNode(
  node: PptxGroupNode,
  ctx: PptxRenderContext,
  renderChild: (child: PptxNode, childCtx: PptxRenderContext) => HTMLElement,
  buildGroupChild: (source: XmlNode, childCtx: PptxRenderContext, group: PptxGroupNode) => PptxNode | null,
): HTMLElement {
  const host = document.createElement(`div`);
  host.style.position = `absolute`;
  host.style.left = `${node.position.x}px`;
  host.style.top = `${node.position.y}px`;
  host.style.width = `${node.size.w}px`;
  host.style.height = `${node.size.h}px`;
  const transforms: string[] = [];
  node.rotation !== 0 && transforms.push(`rotate(${node.rotation}deg)`);
  transforms.length > 0 && ((host.style.transform = transforms.join(` `)), (host.style.transformOrigin = `center center`));
  const offset = node.childOffset;
  const extent = node.childExtent;
  const hostW = node.size.w;
  const hostH = node.size.h;
  const grpSpPr = node.source.child(`grpSpPr`);
  const childCtx: PptxRenderContext = { ...ctx };
  if (grpSpPr.exists()) {
    applyGroupEffects(host, node, ctx, grpSpPr);
    for (const kind of [`solidFill`, `gradFill`, `blipFill`, `pattFill`]) {
      if (grpSpPr.child(kind).exists()) {
        childCtx.groupFillNode = grpSpPr;
        break;
      }
    }
    !childCtx.groupFillNode && grpSpPr.child(`grpFill`).exists() && ctx.groupFillNode && (childCtx.groupFillNode = ctx.groupFillNode);
  }
  const childCache = new Map<number, PptxNode | null>();
  const childAt = (index: number): PptxNode | null => (
    childCache.has(index) || childCache.set(index, buildGroupChild(node.children[index], ctx, node)), childCache.get(index) ?? null
  );
  let pieBox: { x: number; y: number; w: number; h: number } | null = null;
  let pieCenters: Map<number, { x: number; y: number }> | null = null;
  if (node.children.length === 6 && extent.w > 0 && extent.h > 0) {
    const presetOf = (source: XmlNode) => source.child(`spPr`).child(`prstGeom`).attr(`prst`);
    const allPies = node.children.slice(0, 3).every((c) => presetOf(c) === `pie`);
    const allArrows = node.children.slice(3, 6).every((c) => presetOf(c) === `circularArrow`);
    if (allPies && allArrows) {
      const pies = [0, 1, 2].map((i) => childAt(i)).filter((c): c is PptxNode => Boolean(c));
      if (pies.length === 3) {
        const maxW = Math.max(...pies.map((c) => c.size.w));
        const maxH = Math.max(...pies.map((c) => c.size.h));
        const side = Math.min(maxW, maxH, extent.w, extent.h);
        const centerX = offset.x + extent.w / 2;
        const centerY = offset.y + extent.h / 2;
        const boxX = centerX - side / 2;
        const boxY = centerY - side / 2;
        pieBox = {
          x: ((boxX - offset.x) / extent.w) * hostW,
          y: ((boxY - offset.y) / extent.h) * hostH,
          w: (side / extent.w) * hostW,
          h: (side / extent.h) * hostH,
        };
        const firstSize = pies[0].size;
        pies.every((c) => Math.abs(c.size.w - firstSize.w) < 0.01 && Math.abs(c.size.h - firstSize.h) < 0.01) &&
          (pieCenters = new Map(
            pies.map((c, i) => [
              i,
              {
                x: ((c.position.x + c.size.w / 2 - centerX) / extent.w) * hostW,
                y: ((c.position.y + c.size.h / 2 - centerY) / extent.h) * hostH,
              },
            ]),
          ));
      }
    }
  }
  const order = (pieBox ? [3, 4, 5, 0, 1, 2] : undefined) ?? node.children.map((_, i) => i);
  for (const index of order) {
    try {
      const child = childAt(index);
      if (!child) continue;
      if (extent.w > 0 && extent.h > 0) {
        const scaleX = hostW / extent.w;
        const scaleY = hostH / extent.h;
        const swapped = isQuarterRotation(child.rotation);
        const position = child.position;
        const size = child.size;
        if (swapped) {
          const squareX = position.x + (size.w - size.h) / 2;
          const squareY = position.y + (size.h - size.w) / 2;
          const swappedSize = { w: size.w * scaleY, h: size.h * scaleX };
          child.position = {
            x: (squareX - offset.x) * scaleX - (swappedSize.w - swappedSize.h) / 2,
            y: (squareY - offset.y) * scaleY - (swappedSize.h - swappedSize.w) / 2,
          };
          child.size = swappedSize;
        } else {
          child.position = { x: (position.x - offset.x) * scaleX, y: (position.y - offset.y) * scaleY };
          child.size = { w: size.w * scaleX, h: size.h * scaleY };
        }
        scaleShapeTextBoxBounds(child, scaleX, scaleY, swapped);
      }
      if (node.flipH) {
        child.position = { ...child.position, x: hostW - child.position.x - child.size.w };
        isFlipPropagatingNode(child) && (child.flipH = !child.flipH);
      }
      if (node.flipV) {
        child.position = { ...child.position, y: hostH - child.position.y - child.size.h };
        isFlipPropagatingNode(child) && (child.flipV = !child.flipV);
      }
      if (pieBox && index < 3 && child.nodeType === `shape`) {
        const oldW = child.size.w;
        const oldH = child.size.h;
        const center = pieCenters?.get(index) ?? { x: 0, y: 0 };
        child.position = { x: pieBox.x + center.x, y: pieBox.y + center.y };
        child.size = { w: pieBox.w, h: pieBox.h };
        const shape = child;
        if (oldW > 0 && oldH > 0 && shape.textBoxBounds) {
          const bounds = shape.textBoxBounds;
          shape.textBoxBounds = {
            x: (bounds.x / oldW) * pieBox.w,
            y: (bounds.y / oldH) * pieBox.h,
            w: (bounds.w / oldW) * pieBox.w,
            h: (bounds.h / oldH) * pieBox.h,
          };
        }
      }
      const element = renderChild(child, childCtx);
      host.appendChild(element);
    } catch {
      const errorBox = document.createElement(`div`);
      errorBox.style.position = `absolute`;
      errorBox.style.border = `1px dashed #ff6b6b`;
      errorBox.style.backgroundColor = `rgba(255,107,107,0.1)`;
      errorBox.style.fontSize = `10px`;
      errorBox.style.color = `#cc0000`;
      errorBox.style.display = `flex`;
      errorBox.style.alignItems = `center`;
      errorBox.style.justifyContent = `center`;
      errorBox.style.padding = `2px`;
      errorBox.textContent = `Group child error`;
      host.appendChild(errorBox);
    }
  }
  return host;
}
