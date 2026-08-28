/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngineC5.tsx — legacy-doc 内部引擎 [E6]b 余带：
 * 浮动图去缩放/位移补丁/页锚定谓词族/段落宿主样式（批次 B5-14 · 逐字重建）
 * ============================================================================
 *
 * 源 chunk（只读）：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （md5 基线 cfa43c9f7be31ca608214e29ea1419ea）
 * 主口径（行号基准）：src-reconstructed/renderer/assets/
 * previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx（pretty 重建孪生）
 *
 * 覆盖：[E6]b 区（jsx 16816-20230）余带 19542-20230 中 C1/C2 §D 与批 B 未覆盖
 * 部分，共 16 符号 + §D 依赖补全 1 符号（Dp）。
 *
 * 余带已覆盖归属（只注记，不改既有文件）：
 *  - C1 §D：Ng isInlineImageNode (19542) / Fg isPageMarginCornerAnchoredFloating
 *    (19555) / Kg isFloatingImageNode (19817)
 *  - C2 §D：Ig floatingWrapSide (19564) / Lg floatingWrapStyle (19576) /
 *    Rg floatingAbsoluteStyle (19649) / Gg behindDocImageFrameSize (19788) /
 *    Jg imageIsPageAnchoredFloating (19829)
 *  - 批 B BLayout §14/§15/§16：qg..Qg/$g/e_（重复转录；本文件为 canonical，
 *    整合期 BLayout 版改 import，见 B5-14-Final.report §2）
 *  - 批 B BModel [E3]：m_ normalizeFontFamily / p_ themeAwareColor（重复转录；
 *    本文件为 canonical，同上）
 *  - 批 B BLayout §A 余段：t_/n_/r_/i_/a_/o_/s_/c_/l_/u_/d_/h_/g_/__/v_/y_/
 *    b_/x_/S_/C_（19877-20230 间，非本批余带清单，维持批 B 归属）
 *
 * ----------------------------------------------------------------------------
 * §0 混淆名 → 语义名 映射（jsx 行号；把握度：高 = 逐字对原式）
 * ----------------------------------------------------------------------------
 * §D 依赖补全（范围外）：
 *   Dp → floatingIsParagraphRelative (17145-17149, 高)
 * §1 余带本体（19542-20230）：
 *   Pg → inlineImageIsPageOrMarginAnchored (19552-19554, 高)
 *   zg → unscaleDelta (19680-19682, 高；C3 declare 契约名)
 *   Bg → unscaleRect (19683-19695, 高；C3 declare 契约名)
 *   Vg → sectionFloatingMovePatch (19696-19723, 高；C3 declare 契约名)
 *   Hg → floatingMovePatch (19724-19760, 高；C3 declare 契约名)
 *   Ug → paragraphHostPointHit (19761-19782, 高；C3 declare 契约名)
 *   Wg → floatingWrapIsInlineLike (19783-19787, 高；C3 declare 契约名)
 *   qg → isPageOrMarginAnchoredFloating (19821-19828, 高；批 B 重复转录)
 *   Yg → paragraphHasAnchoredImage (19837-19839, 高；批 B 重复转录)
 *   Xg → paragraphHasUnanchoredFloatingImage (19840-19842, 高；批 B 重复转录)
 *   Zg → paragraphHasPageAnchoredFloatingImage (19843-19845, 高；批 B 重复转录)
 *   Qg → paragraphHasVisiblePageAnchoredImage (19846-19848, 高；批 B 重复转录)
 *   e_ → resolveHighlightColor (19872-19876, 高；批 B 重复转录)
 *   f_ → paragraphHostStyle (20104-20126, 高)
 *   p_ → themeAwareColor (20127-20132, 高；批 B BModel 重复转录)
 *   m_ → normalizeFontFamily (20133-20144, 高；批 B BModel 重复转录)
 *
 * C3 declare 签名差异（按原式实体化，整合期以本文件为准）：
 *  - unscaleRect：C3 rect 含 right/bottom；原式仅重构 left/top/width/height
 *    （索引签名保留额外字段传入，返回面同原式）
 *  - floatingMovePatch：C3 第 1 参写作 floating；原式为 image（消费
 *    image.floating/image.widthPx/image.heightPx）
 *  - paragraphHostPointHit：C3 返回缺 host；原式返回含 host
 *  - floatingWrapIsInlineLike：C3 参数 Record<string, unknown>；原式消费
 *    verticalRelativeTo，本文件收窄为 DocxFloatingImage | undefined
 * ============================================================================
 */

import {
  THUMBNAIL_HIGHLIGHT_COLORS,
  MIN_BLOCK_HEIGHT_PX,
} from "./LegacyDocEngineBThumbnails";
import {
  type DocxImageNode,
  type DocxParagraphNode,
  type DocxFloatingImage,
  clampNumber,
} from "./LegacyDocEngineBModel";
import {
  isInlineImageNode,
  isFloatingImageNode,
  snapToGridModeOf,
  applyDefaultSpacingForGrid,
  spacingBeforeAbsent,
} from "./LegacyDocEngineC1";
import { imageIsPageAnchoredFloating } from "./LegacyDocEngineC2";
import { floatingImageGeometry, paragraphCssStyle } from "./LegacyDocEngineBLayout";

/* ============================================================================
 * §D 依赖补全（范围外、余带必需）
 * ==========================================================================*/

/** 原 Dp（jsx 17145）：浮动垂直参照为段落/行级（非页/边距；空浮动视为真） */
export function floatingIsParagraphRelative(floating: DocxFloatingImage | undefined): boolean {
  if (!floating) return !0;
  const verticalRelativeTo = floating.verticalRelativeTo?.trim().toLowerCase();
  return verticalRelativeTo !== `page` && verticalRelativeTo !== `margin`;
}

/* ============================================================================
 * §1 余带本体（jsx 19542-20230）
 * ==========================================================================*/

/** 原 Pg（jsx 19552）：内联（随文环绕）图且页/边距锚定判定 */
export function inlineImageIsPageOrMarginAnchored(image: DocxImageNode): boolean {
  return isInlineImageNode(image) && !floatingIsParagraphRelative(image.floating);
}

/** 原 zg（jsx 19680）：像素增量 → 去缩放增量（C3 declare：unscaleDelta） */
export function unscaleDelta(deltaPx: number, zoomScale: number): number {
  return deltaPx / (Number.isFinite(zoomScale) && zoomScale > 0 ? zoomScale : 1);
}

/** 去缩放矩形输入/输出面（原 Bg 消费面；额外字段经索引签名透传） */
export interface UnscaleRect {
  left: number;
  top: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

/** 原 Bg（jsx 19683）：矩形去缩放（缩放=1 时原样透传；C3 declare：unscaleRect） */
export function unscaleRect(rect: UnscaleRect, zoomScale: number): UnscaleRect {
  const scale = Number.isFinite(zoomScale) && zoomScale > 0 ? zoomScale : 1;
  return scale === 1 ? rect : {
    left: rect.left / scale,
    top: rect.top / scale,
    ...(Number.isFinite(rect.width) ? {
      width: (rect.width as number) / scale
    } : void 0),
    ...(Number.isFinite(rect.height) ? {
      height: (rect.height as number) / scale
    } : void 0)
  };
}

/** 原 Vg（jsx 19696）：节区浮动图位移补丁（包装矩形 → 边距相对坐标；
 *  C3 declare：sectionFloatingMovePatch；layout 面兼容 C3 PageLayoutContract） */
export function sectionFloatingMovePatch(
  floating: { horizontalAlign?: string; verticalAlign?: string; xPx?: number; yPx?: number; [key: string]: unknown } | undefined,
  layout: { pageWidthPx: number; pageHeightPx: number; marginsPx: { left: number; top: number } },
  input: {
    wrapperRect: { left: number; top: number; width?: number; height?: number };
    pageSurfaceRect: { left: number; top: number } | undefined;
    deltaX: number;
    deltaY: number;
  },
): Record<string, unknown> {
  const wrapperLeft = input.wrapperRect.left + Math.round(input.deltaX);
  const wrapperTop = input.wrapperRect.top + Math.round(input.deltaY);
  const wrapperWidth = Number.isFinite(input.wrapperRect.width) ? Math.max(1, Math.round(input.wrapperRect.width as number)) : void 0;
  const wrapperHeight = Number.isFinite(input.wrapperRect.height) ? Math.max(1, Math.round(input.wrapperRect.height as number)) : void 0;
  const horizontalAlign = floating?.horizontalAlign;
  const verticalAlign = floating?.verticalAlign;
  if (!input.pageSurfaceRect) return {
    xPx: Math.round((floating?.xPx ?? 0) + input.deltaX),
    yPx: Math.round((floating?.yPx ?? 0) + input.deltaY),
    horizontalAlign: horizontalAlign,
    verticalAlign: verticalAlign,
    horizontalRelativeTo: `margin`,
    verticalRelativeTo: `margin`
  };
  const minLeft = -Math.round(layout.marginsPx.left);
  const minTop = -Math.round(layout.marginsPx.top);
  const maxLeft = Math.round(Number.isFinite(wrapperWidth) ? layout.pageWidthPx - layout.marginsPx.left - (wrapperWidth as number) : layout.pageWidthPx - layout.marginsPx.left);
  const maxTop = Math.round(Number.isFinite(wrapperHeight) ? layout.pageHeightPx - layout.marginsPx.top - (wrapperHeight as number) : layout.pageHeightPx - layout.marginsPx.top);
  return {
    xPx: clampNumber(Math.round(wrapperLeft - input.pageSurfaceRect.left - layout.marginsPx.left), minLeft, maxLeft),
    yPx: clampNumber(Math.round(wrapperTop - input.pageSurfaceRect.top - layout.marginsPx.top), minTop, maxTop),
    horizontalAlign: horizontalAlign,
    verticalAlign: verticalAlign,
    horizontalRelativeTo: `margin`,
    verticalRelativeTo: `margin`
  };
}

/** 原 Hg（jsx 19724）：浮动图位移补丁（页内坐标 → 环绕/锚定状态重构；
 *  C3 declare：floatingMovePatch，第 1 参原式为 image） */
export function floatingMovePatch(
  image: DocxImageNode,
  contentWidthPx: number,
  leftPx: number,
  topPx: number,
  frame?: { widthPx?: number; heightPx?: number },
): Record<string, unknown> {
  const floatingState: DocxFloatingImage = image.floating ?? {};
  const imageWidthPx = frame?.widthPx ?? image.widthPx ?? MIN_BLOCK_HEIGHT_PX;
  const imageHeightPx = frame?.heightPx ?? image.heightPx ?? imageWidthPx;
  const wrapText = floatingState.wrapText ?? `bothSides`;
  const wrapType = floatingState.wrapType ?? `square`;
  const pageOrMarginAnchored = !floatingIsParagraphRelative(floatingState);
  const topAndBottomAligned = !pageOrMarginAnchored && wrapType.trim().toLowerCase() === `topandbottom` && !!floatingState.horizontalAlign;
  const wrapSide = leftPx + imageWidthPx / 2 <= contentWidthPx / 2 ? `left` : `right`;
  const geometry = floatingImageGeometry({
    ...image,
    widthPx: imageWidthPx,
    heightPx: imageHeightPx
  }, contentWidthPx, {
    widthPx: imageWidthPx,
    heightPx: imageHeightPx,
    baseLeftPx: leftPx,
    baseTopPx: topPx,
    allowNegativeImageTop: !0
  });
  const spansFullWidth = geometry === void 0 || geometry.exclusion.left <= 0 || geometry.exclusion.right >= contentWidthPx;
  const moveTopPx = Math.round(topPx - Math.round(floatingState.distTPx ?? 0));
  return {
    wrapType: wrapType,
    wrapText: wrapText,
    horizontalAlign: topAndBottomAligned ? floatingState.horizontalAlign : spansFullWidth ? wrapSide : wrapText === `bothSides` || wrapText === `largest` ? void 0 : wrapSide,
    xPx: topAndBottomAligned ? void 0 : Math.round(leftPx),
    yPx: moveTopPx,
    distLPx: Math.max(4, Math.round(floatingState.distLPx ?? 8)),
    distRPx: Math.max(4, Math.round(floatingState.distRPx ?? 8)),
    distTPx: Math.max(0, Math.round(floatingState.distTPx ?? 2)),
    distBPx: Math.max(0, Math.round(floatingState.distBPx ?? 4)),
    horizontalRelativeTo: pageOrMarginAnchored ? `column` : floatingState.horizontalRelativeTo ?? `column`,
    verticalRelativeTo: pageOrMarginAnchored ? `paragraph` : floatingState.verticalRelativeTo ?? `paragraph`,
    behindDocument: !1
  };
}

/** 原 Ug（jsx 19761）：段落宿主点命中（浮动图重挂最近宿主；
 *  C3 declare：paragraphHostPointHit，返回面原式含 host） */
export function paragraphHostPointHit(element: HTMLElement, topPx: number, leftPx: number): { host: Element; nodeIndex: number; rect: DOMRect } | undefined {
  const scope = element.closest(`[data-testid='docx-editor-viewer']`) ?? element.ownerDocument;
  if (!scope) return;
  const hosts = Array.from(scope.querySelectorAll(`[data-docx-paragraph-host='true'][data-docx-paragraph-kind='paragraph'][data-docx-paragraph-node-index]`));
  let best: { host: Element; nodeIndex: number; rect: DOMRect } | undefined;
  let bestScore = 1 / 0;
  for (const host of hosts) {
    const nodeIndex = Number.parseInt(host.getAttribute(`data-docx-paragraph-node-index`) ?? ``, 10);
    if (!Number.isFinite(nodeIndex)) continue;
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) continue;
    const verticalGap = topPx < rect.top ? rect.top - topPx : topPx >= rect.bottom ? topPx - rect.bottom : 0;
    const horizontalGap = leftPx < rect.left ? rect.left - leftPx : leftPx > rect.right ? leftPx - rect.right : 0;
    const score = verticalGap * 4 + horizontalGap;
    score < bestScore && (bestScore = score, best = {
      host: host,
      nodeIndex: nodeIndex,
      rect: rect
    });
  }
  return best;
}

/** 原 Wg（jsx 19783）：浮动环绕是否行内语义（段/行级；
 *  C3 declare：floatingWrapIsInlineLike） */
export function floatingWrapIsInlineLike(floating: DocxFloatingImage | undefined): boolean {
  if (!floatingIsParagraphRelative(floating)) return !0;
  const verticalRelativeTo = floating?.verticalRelativeTo?.trim().toLowerCase() ?? ``;
  return verticalRelativeTo === `` || verticalRelativeTo === `paragraph` || verticalRelativeTo === `line`;
}

/** 原 qg（jsx 19821）：绝对浮动图页/边距锚定判定（批 B BLayout 重复转录） */
export function isPageOrMarginAnchoredFloating(image: DocxImageNode): boolean {
  if (!isFloatingImageNode(image)) return !1;
  const floating = image.floating;
  if (!floating) return !1;
  const horizontalRelativeTo = floating.horizontalRelativeTo?.toLowerCase();
  const verticalRelativeTo = floating.verticalRelativeTo?.toLowerCase();
  return (horizontalRelativeTo === `page` || horizontalRelativeTo === `margin`) && (verticalRelativeTo === `page` || verticalRelativeTo === `margin`);
}

/** 原 Yg（jsx 19837）：段落含页/边距锚定图（浮动族或内联族；批 B BLayout 重复转录） */
export function paragraphHasAnchoredImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && (isPageOrMarginAnchoredFloating(child as DocxImageNode) || imageIsPageAnchoredFloating(child as DocxImageNode)));
}

/** 原 Xg（jsx 19840）：段落含非页锚定绝对浮动图（批 B BLayout 重复转录） */
export function paragraphHasUnanchoredFloatingImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isFloatingImageNode(child as DocxImageNode) && !isPageOrMarginAnchoredFloating(child as DocxImageNode));
}

/** 原 Zg（jsx 19843）：段落含页锚定浮动图（批 B BLayout 重复转录） */
export function paragraphHasPageAnchoredFloatingImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isPageOrMarginAnchoredFloating(child as DocxImageNode));
}

/** 原 Qg（jsx 19846）：段落含非背景页锚定浮动图（批 B BLayout 重复转录） */
export function paragraphHasVisiblePageAnchoredImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image` && isPageOrMarginAnchoredFloating(child as DocxImageNode) && (child as DocxImageNode).floating?.behindDocument !== !0);
}

/** 原 e_（jsx 19872）：高亮色解析（# 原样；色名查表；其余原样；批 B BLayout 重复转录） */
export function resolveHighlightColor(highlight: string | undefined): string | undefined {
  if (!highlight) return;
  const lower = highlight.trim().toLowerCase();
  if (lower) return lower.startsWith(`#`) ? lower : THUMBNAIL_HIGHLIGHT_COLORS[lower] ?? lower;
}

/** 原 f_（jsx 20104）：段落宿主样式（段落 CSS + 网格禁用精确行高 +
 *  页首段上距归零 + 左右外边距内折为内边距） */
export function paragraphHostStyle(
  paragraph: DocxParagraphNode,
  numberingDefinitions: unknown,
  headingStyles: Record<number, Record<string, unknown>> | undefined,
  paragraphTopOffsetPx: number,
  applyDefaults: boolean,
  gridPitchPx: number | undefined,
): Record<string, unknown> {
  const baseStyle = paragraphCssStyle(applyDefaultSpacingForGrid(paragraph, applyDefaults), numberingDefinitions, headingStyles, gridPitchPx, snapToGridModeOf(paragraph) === `disable`);
  const zeroTopMargin = paragraphTopOffsetPx <= 0 && spacingBeforeAbsent(paragraph);
  const marginLeft = typeof baseStyle.marginLeft == `number` ? baseStyle.marginLeft : Number.parseFloat(String(baseStyle.marginLeft ?? ``));
  const marginRight = typeof baseStyle.marginRight == `number` ? baseStyle.marginRight : Number.parseFloat(String(baseStyle.marginRight ?? ``));
  const paddingLeft = typeof baseStyle.paddingLeft == `number` ? baseStyle.paddingLeft : Number.parseFloat(String(baseStyle.paddingLeft ?? ``));
  const paddingRight = typeof baseStyle.paddingRight == `number` ? baseStyle.paddingRight : Number.parseFloat(String(baseStyle.paddingRight ?? ``));
  const hasHorizontalMargin = Number.isFinite(marginLeft) && marginLeft > 0 || Number.isFinite(marginRight) && marginRight > 0;
  return {
    ...baseStyle,
    ...(hasHorizontalMargin ? {
      marginLeft: Number.isFinite(marginLeft) && marginLeft > 0 ? 0 : baseStyle.marginLeft,
      marginRight: Number.isFinite(marginRight) && marginRight > 0 ? 0 : baseStyle.marginRight,
      paddingLeft: Number.isFinite(marginLeft) && marginLeft > 0 ? Math.max(0, Math.round((Number.isFinite(paddingLeft) ? paddingLeft : 0) + marginLeft)) : baseStyle.paddingLeft,
      paddingRight: Number.isFinite(marginRight) && marginRight > 0 ? Math.max(0, Math.round((Number.isFinite(paddingRight) ? paddingRight : 0) + marginRight)) : baseStyle.paddingRight,
      boxSizing: `border-box`,
      width: `100%`
    } : void 0),
    ...(zeroTopMargin ? {
      marginTop: 0
    } : void 0)
  };
}

/** 原 p_（jsx 20127）：主题感知颜色（暗色下近黑 → 浅灰；批 B BModel 重复转录） */
export function themeAwareColor(color: string | undefined, theme: string): string | undefined {
  if (theme !== `dark`) return color;
  if (!color) return `#f3f4f6`;
  const lower = color.trim().toLowerCase();
  return lower === `#000` || lower === `#000000` || lower === `#111111` || lower === `#111827` || lower === `black` || lower === `rgb(0,0,0)` || lower === `rgb(0, 0, 0)` ? `#f3f4f6` : color;
}

/** 原 m_（jsx 20133）：字体族规范化（引号/空白处理 + 族尾兜底；批 B BModel 重复转录） */
export function normalizeFontFamily(family: string | undefined): string | undefined {
  if (!family) return;
  const trimmed = family.trim();
  if (!trimmed) return;
  if (trimmed.includes(`,`)) return trimmed;
  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, ``);
  if (!unquoted) return;
  const escaped = unquoted.replace(/"/g, `\\"`),
    head = /\s/.test(escaped) ? `"${escaped}"` : escaped,
    lower = unquoted.toLowerCase();
  return `${head}, ${/(mono|consolas|courier|menlo|code)/.test(lower) ? `monospace` : /(times|cambria|georgia|garamond|baskerville|serif)/.test(lower) ? `serif` : `sans-serif`}`;
}

/* ============================================================================
 * 文件尾符号表（混淆名 → 语义名，jsx 行号，把握度；与文件头 §0 一致）
 * ----------------------------------------------------------------------------
 * §D 依赖补全：
 *   Dp → floatingIsParagraphRelative (17145, 高)
 * §1 余带本体：
 *   Pg → inlineImageIsPageOrMarginAnchored (19552, 高)
 *   zg → unscaleDelta (19680, 高) | Bg → unscaleRect (19683, 高)
 *   Vg → sectionFloatingMovePatch (19696, 高) | Hg → floatingMovePatch (19724, 高)
 *   Ug → paragraphHostPointHit (19761, 高) | Wg → floatingWrapIsInlineLike (19783, 高)
 *   qg → isPageOrMarginAnchoredFloating (19821, 高)
 *   Yg → paragraphHasAnchoredImage (19837, 高)
 *   Xg → paragraphHasUnanchoredFloatingImage (19840, 高)
 *   Zg → paragraphHasPageAnchoredFloatingImage (19843, 高)
 *   Qg → paragraphHasVisiblePageAnchoredImage (19846, 高)
 *   e_ → resolveHighlightColor (19872, 高) | f_ → paragraphHostStyle (20104, 高)
 *   p_ → themeAwareColor (20127, 高) | m_ → normalizeFontFamily (20133, 高)
 * 把握度统计：高 17 / 中 0。
 * 重复转录裁决（canonical = 本文件；整合期批 B 版改 import）：
 *   qg/Yg/Xg/Zg/Qg/e_ ↔ BLayout §14/§16 | m_/p_ ↔ BModel [E3]
 *   （Jg 先例：C2 §D imageIsPageAnchoredFloating vs BLayout §14，B5-08 §2.9）
 */
