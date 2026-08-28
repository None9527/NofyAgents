/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineCharts.ts — pptxRendererPreviewEngine 子模块 · OOXML 图表 → echarts
 * （解混淆重建 · D8 Stage B2）
 *
 * 主文件：pptxRendererPreviewEngine.tsx。对应源 chunk 区段
 * （pptxRendererPreviewEngine-BIIRLBue.jsx）：
 *   jc/Mc        ptCount/索引有效性                          (jsx 14494-14507)
 *   Nc/Pc        strCache/numCache 提取 + formatCode         (jsx 14508-14527)
 *   Fc/Ic/Lc/Rc  数字格式代码解析与数值格式化                 (jsx 14528-14597)
 *   zc/Bc        数值序列（含空白索引）                       (jsx 14598-14631)
 *   Vc/Hc        字符串序列 + 日期序列号换算                   (jsx 14632-14643)
 *   Uc/Wc        布尔属性（缺省 true）                        (jsx 14644-14648)
 *   fW..yW       图表颜色/线宽/虚线/边框提取                   (jsx 41069-41157)
 *   bW/xW        渐变（zrender LinearGradient）/数据点样式     (jsx 41158-41217)
 *   SW..OW       图表缺省常量（字号/灰线/强调色序）             (jsx 41218-41231)
 *   kW/AW        显式字号标记（Symbol）                       (jsx 41232-41235)
 *   jW           支持的图表类型表                             (jsx 41236)
 *   MW..UW       标题/富文本标题提取                          (jsx 41237-41390)
 *   WW           主题次要字体栈                               (jsx 41391-41394)
 *   GW..iG       坐标轴解析 → echarts 轴配置                  (jsx 41395-41590)
 *   aG..lG       数据标签（dLbls/dLbl）解析                  (jsx 41591-41726)
 *   uG..pG       点级标签覆盖/序列提取                        (jsx 41727-41880)
 *   mG/hG        数据表（dTable）→ HTML 表格                 (jsx 41881-41950)
 *   gG..TG       clrMapOvr/图表样式色板                       (jsx 41951-42030)
 *   EG..PG       百分比/图例选项/图例数据构建                  (jsx 42031-42170)
 *   FG..WG       图例度量/字号统一/字体统一/颜色缺省/宽度估算   (jsx 42171-42230)
 *   GG..ZG       网格度量 + 值轴刻度推断                       (jsx 42231-42400)
 *   QG..tK       标题字号/背景/边框/图例图标 SVG               (jsx 42401-42560)
 *   nK..rK       自定义图例（DOM 替代）                        (jsx 42561-42700)
 *   iK..oK       图表标题构建                                 (jsx 42701-42760)
 *   sK..lK       饼图布局/爆炸/起始角                          (jsx 42761-42810)
 *   uK..yK       marker 映射/散点符号轮转/平滑插值             (jsx 42811-42856)
 *   GK           柱状图（含条形/堆叠/百分比堆叠）              (jsx 42857-43041)
 *   KK           折线/面积图                                  (jsx 43042-43275)
 *   qK           饼图/圆环图                                  (jsx 43276-43382)
 *   JK           雷达图                                       (jsx 43383-43550)
 *   YK           散点图                                       (jsx 43551-43688)
 *   XK/ZK        气泡图（含轴扩展）                            (jsx 43689-43784)
 *   QK/$K/eq     股票图（K 线/三序列自定义渲染）               (jsx 43785-43997)
 *   tq/nq/rq/iq/aq 手动布局/绘图区背景                        (jsx 43950-43997)
 *   oq/sq        类型分派 + 可合并判定                         (jsx 43998-44030)
 *   cq..mq       双轴合并/零轴标签修正                         (jsx 44031-44124)
 *   _q           buildChartOptions（chartSpace → option）     (jsx 44125-44188)
 *   vq/yq        renderChartNode（echarts 初始化/自适应）      (jsx 44189-44265)
 *
 * vendor 依赖：echarts/zrender（jsx 14650-41068）——Ej=echarts.init、
 * lx=zrender.graphic.LinearGradient。本模块以结构等价物替代，
 * 真实实现由主文件注入（echartsInit 参数）。
 * ============================================================================
 */

import { XmlNode, emuToPx, parseXmlBool } from "./pptxEngineTypes";
import type { PptxRenderContext, PptxChartNode, PptxChartInstance, PptxTheme } from "./pptxEngineTypes";
import { resolveColor, hexToRgb, rgbToHsl, hslToRgb, rgbToHex, resolveLineStyle } from "./pptxEngineColor";
import { resolveTypefaceStack, buildFontFamilyCss } from "./pptxEngineText";

/* --- 序列数据提取（原 jc..Wc，jsx 14494-14648） --- */

const CHART_POINT_LIMIT = 1e4; // 原 Ac

/** 原 jc：ptCount 与实际最大 idx 取一致的长度（上限 1e4） */
function chartCacheLength(cache: XmlNode): number {
  const declared = cache.child(`ptCount`).numAttr(`val`);
  let maxIndex = -1;
  for (const pt of cache.children(`pt`)) {
    const idx = pt.numAttr(`idx`);
    idx !== undefined && Number.isInteger(idx) && idx >= 0 && idx < CHART_POINT_LIMIT && (maxIndex = Math.max(maxIndex, idx));
  }
  const fromPoints = maxIndex + 1;
  if (declared === undefined || !Number.isFinite(declared) || declared < 0) return fromPoints;
  const floored = Math.floor(declared);
  return floored > CHART_POINT_LIMIT ? fromPoints : Math.min(Math.max(floored, fromPoints), CHART_POINT_LIMIT);
}

/** 原 Mc：点索引有效性 */
function isValidPointIndex(idx: number | undefined, length: number): boolean {
  return idx !== undefined && Number.isInteger(idx) && idx >= 0 && idx < length && idx < CHART_POINT_LIMIT;
}

/** 原 Nc：分类/字符串序列（strCache 优先，回退 numCache） */
export function chartStringSeries(node: XmlNode): string[] {
  const cache = node.child(`strRef`).exists() ? node.child(`strRef`).child(`strCache`) : node.child(`strCache`);
  if (!cache.exists()) {
    const numCache = node.child(`numRef`).exists() ? node.child(`numRef`).child(`numCache`) : node.child(`numCache`);
    return numCache.exists() ? chartNumericStrings(numCache) : [];
  }
  const length = chartCacheLength(cache);
  const out = Array<string>(length).fill(``);
  for (const pt of cache.children(`pt`)) {
    const idx = pt.numAttr(`idx`);
    if (idx !== undefined && isValidPointIndex(idx, length)) out[idx] = pt.child(`v`).text();
  }
  return out;
}

/** 原 Pc：numCache formatCode */
export function chartFormatCode(node: XmlNode): string | undefined {
  const cache = node.child(`numRef`).exists() ? node.child(`numRef`).child(`numCache`) : node.child(`numCache`);
  if (!cache.exists()) return;
  const format = cache.child(`formatCode`);
  return (format.exists() && format.text()) || undefined;
}

/** 原 Fc：格式代码按顶层分号分段（引号内不拆） */
function splitFormatSections(code: string): string[] {
  const sections: string[] = [];
  let current = ``;
  let quoted = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (ch === `"`) {
      quoted = !quoted;
      current += ch;
      continue;
    }
    if (ch === `;` && !quoted) {
      sections.push(current);
      current = ``;
      continue;
    }
    current += ch;
  }
  sections.push(current);
  return sections;
}

/** 原 Ic：去掉条件块/引号字面量/转义/填充符，留下数字骨架 */
function formatNumericSkeleton(section: string): string {
  const withoutConditions = section.replace(/\[[^\]]+\]/g, ``);
  let skeleton = ``;
  for (let i = 0; i < withoutConditions.length; i++) {
    const ch = withoutConditions[i];
    if (ch === `"`) {
      for (i++; i < withoutConditions.length && withoutConditions[i] !== `"`; i++);
      continue;
    }
    if (ch === `\\`) {
      i + 1 < withoutConditions.length && (skeleton += withoutConditions[++i]);
      continue;
    }
    if (ch === `_` || ch === `*`) {
      i++;
      continue;
    }
    skeleton += ch;
  }
  return skeleton.trim();
}

/** 原 Lc：千分位/小数位模板格式化（负数走第二段） */
function formatWithThousands(value: number, code: string): string | undefined {
  const sections = splitFormatSections(code);
  const negative = value < 0 && sections.length > 1;
  const skeleton = formatNumericSkeleton(negative ? sections[1] : sections[0]);
  if (!/[#0]/.test(skeleton) || (!skeleton.includes(`,`) && sections.length === 1)) return;
  const decimalsMatch = skeleton.match(/\.(0+|#+)/);
  const decimals = decimalsMatch ? decimalsMatch[1].length : 0;
  const grouping = skeleton.includes(`,`);
  const text = (negative ? Math.abs(value) : value).toLocaleString(`en-US`, {
    useGrouping: grouping,
    minimumFractionDigits: decimalsMatch != null && decimalsMatch[1].includes(`0`) ? decimals : 0,
    maximumFractionDigits: decimals,
  });
  if (negative)
    return skeleton.includes(`(`) && skeleton.includes(`)`) ? `(${text})` : skeleton.includes(`-`) ? `-${text}` : text;
  return text;
}

/** 原 Rc：数值 → 显示文本（General/百分比/模板/小数位） */
export function formatChartValue(value: number, code?: string): string {
  if (!code || code === `General`) return Number.isInteger(value) ? String(value) : parseFloat(value.toFixed(2)).toString();
  if (code.includes(`%`)) {
    const match = code.match(/0\.(0+)%/);
    const decimals = match ? match[1].length : 0;
    return `${(value * 100).toFixed(decimals)}%`;
  }
  const thousands = formatWithThousands(value, code);
  if (thousands !== undefined) return thousands;
  const decimalsMatch = code.match(/\.(0+|#+)/);
  if (decimalsMatch) {
    const decimals = decimalsMatch[1].length;
    return parseFloat(value.toFixed(decimals)).toString();
  }
  return /^[#0,]+$/.test(code.replace(/[[\]"\\]/g, ``))
    ? Math.round(value).toString()
    : Number.isInteger(value)
      ? String(value)
      : parseFloat(value.toFixed(2)).toString();
}

/** 原 zc：数值序列（仅值） */
export function chartNumberSeries(node: XmlNode): number[] {
  return chartNumberSeriesWithBlanks(node).values;
}

/** 原 Bc：数值序列 + 空白索引集合 */
export function chartNumberSeriesWithBlanks(node: XmlNode): { values: number[]; blankIndices: Set<number> } {
  const cache = node.child(`numRef`).exists() ? node.child(`numRef`).child(`numCache`) : node.child(`numCache`);
  if (!cache.exists()) return { values: [], blankIndices: new Set() };
  const length = chartCacheLength(cache);
  const values = Array<number>(length).fill(0);
  const blanks = new Set<number>();
  for (let i = 0; i < length; i++) blanks.add(i);
  for (const pt of cache.children(`pt`)) {
    const idx = pt.numAttr(`idx`);
    if (idx !== undefined && isValidPointIndex(idx, length)) {
      const text = pt.child(`v`).text().trim();
      const parsed = parseFloat(text);
      text !== `` && !isNaN(parsed) && ((values[idx] = parsed), blanks.delete(idx));
    }
  }
  return { values, blankIndices: blanks };
}

/** 原 Vc：numCache 当字符串读（日期格式代码 → 日期文本） */
function chartNumericStrings(cache: XmlNode): string[] {
  const length = chartCacheLength(cache);
  const out = Array<string>(length).fill(``);
  const format = cache.child(`formatCode`).text();
  const isDate = format && /[yYmMdD]/.test(format) && !/[#0]/.test(format);
  for (const pt of cache.children(`pt`)) {
    const idx = pt.numAttr(`idx`);
    if (idx !== undefined && isValidPointIndex(idx, length)) {
      const text = pt.child(`v`).text();
      out[idx] = isDate && text ? excelSerialToDate(parseFloat(text)) : text;
    }
  }
  return out;
}

/** 原 Hc：Excel 日期序列号 → yyyy/M/d（1900 闰年缺陷修正：>59 减 1） */
function excelSerialToDate(serial: number): string {
  if (!Number.isFinite(serial) || serial < 1) return String(serial);
  const adjusted = serial > 59 ? serial - 1 : serial;
  const date = new Date(Date.UTC(1899, 11, 31) + adjusted * 864e5);
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

/** 原 Wc/he 包装：布尔属性（带缺省） */
export function chartParseBool(value: string | undefined, fallback: boolean): boolean {
  return parseXmlBool(value, fallback);
}

/** 原 Uc：val 布尔（缺省 true；节点不存在 → false） */
export function chartBoolDefaultTrue(node: XmlNode): boolean {
  return node.exists() ? parseXmlBool(node.attr(`val`), true) : false;
}

/* --- 颜色与样式提取（原 fW..xW，jsx 41069-41217） --- */

/** 原 fW：颜色节点 → #hex（失败 undefined） */
function chartColorHex(node: XmlNode, ctx: PptxRenderContext): string | undefined {
  try {
    const { color } = resolveColor(node, ctx);
    return color.startsWith(`#`) ? color : `#${color}`;
  } catch {
    return;
  }
}

/** 原 pW：gs 渐变停止点（含 sysClr lastClr 兜底） */
function chartGradientStop(gs: XmlNode, ctx: PptxRenderContext): { color: string; alpha: number; pos: number } | undefined {
  const pos = gs.numAttr(`pos`);
  if (pos !== undefined) {
    for (const child of gs.allChildren()) {
      const kind = child.localName;
      if (kind === `srgbClr` || kind === `schemeClr` || kind === `sysClr` || kind === `prstClr`) {
        try {
          const resolved = resolveColor(gs, ctx);
          return {
            color: resolved.color.startsWith(`#`) ? resolved.color : `#${resolved.color}`,
            alpha: resolved.alpha,
            pos: pos / 1e5,
          };
        } catch {
          if (kind === `sysClr`) {
            const last = child.attr(`lastClr`);
            if (last) {
              const alphaNode = child.child(`alpha`);
              const alpha = alphaNode.exists() ? (alphaNode.numAttr(`val`) ?? 1e5) / 1e5 : 1;
              return { color: `#${last}`, alpha, pos: pos / 1e5 };
            }
          }
          return;
        }
      }
    }
  }
  return undefined;
}

/** 原 mW：序列 spPr → 颜色（solid > grad > ln solid；渐变返回渐变对象） */
function chartSeriesColor(ser: XmlNode, ctx: PptxRenderContext): string | ChartLinearGradient | undefined {
  const spPr = ser.child(`spPr`);
  if (!spPr.exists()) return;
  const solid = spPr.child(`solidFill`);
  if (solid.exists()) {
    const color = chartColorHex(solid, ctx);
    if (color) return color;
  }
  const grad = spPr.child(`gradFill`);
  if (grad.exists()) {
    const gradient = chartLinearGradient(grad, ctx);
    if (gradient) return gradient;
  }
  const line = spPr.child(`ln`);
  if (line.exists()) {
    const lineSolid = line.child(`solidFill`);
    if (lineSolid.exists()) {
      const color = chartColorHex(lineSolid, ctx);
      if (color) return color;
    }
  }
  return undefined;
}

/** 原 hW：ln 宽度 EMU → pt（最小 1） */
function chartLineWidth(ser: XmlNode): number | undefined {
  const width = ser.child(`spPr`).child(`ln`).numAttr(`w`);
  if (!(width === undefined || width <= 0)) return Math.max(1, Number((width / 12700).toFixed(3)));
  return undefined;
}

/** 原 gW：百分之一磅 → pt */
function hundredthToPt(value: number): number {
  return Number((value / 100).toFixed(3));
}

/** 原 _W：ln noFill 判定 */
function chartLineNoFill(ser: XmlNode): boolean {
  return ser.child(`spPr`).child(`ln`).child(`noFill`).exists();
}

/** 原 vW：dash 类型归一 */
function chartDashType(dash: string): `dotted` | `dashed` | `solid` {
  return dash === `dotted` ? `dotted` : dash === `dashed` ? `dashed` : `solid`;
}

/** 原 yW：ln 节点 → echarts lineStyle 三元组 */
function chartLineStyle(line: XmlNode, ctx: PptxRenderContext): { color: string; width: number; type: `dotted` | `dashed` | `solid` } | undefined {
  if (!line.exists() || line.child(`noFill`).exists()) return;
  const resolved = resolveLineStyle(line, ctx);
  if (!(resolved.width <= 0 || resolved.color === `transparent`))
    return { color: resolved.color, width: Math.max(resolved.width, 0.5), type: chartDashType(resolved.dash) };
  return undefined;
}

/**
 * 线性渐变（原 lx = zrender.graphic.LinearGradient，vendor jsx 21575）。
 * echarts 接受同构对象；此处为结构等价物。
 */
export interface ChartLinearGradient {
  type: `linear`;
  x: number;
  y: number;
  x2: number;
  y2: number;
  colorStops: { offset: number; color: string }[];
}

/** 原 bW：gradFill → 线性渐变（角度 → 端点，rgba 停止点） */
function chartLinearGradient(grad: XmlNode, ctx: PptxRenderContext): ChartLinearGradient | undefined {
  const gsLst = grad.child(`gsLst`);
  if (!gsLst.exists()) return;
  const stops: { offset: number; color: string }[] = [];
  for (const gs of gsLst.children(`gs`)) {
    const stop = chartGradientStop(gs, ctx);
    if (stop) {
      const hex = stop.color.replace(`#`, ``);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      stops.push({ offset: stop.pos, color: `rgba(${r},${g},${b},${stop.alpha})` });
    }
  }
  if (stops.length < 2) return;
  stops.sort((a, b) => a.offset - b.offset);
  const lin = grad.child(`lin`);
  const angle = (((lin.exists() ? lin.numAttr(`ang`) ?? 54e5 : 54e5) / 6e4) * Math.PI) / 180;
  return {
    type: `linear`,
    x: 0.5 - 0.5 * Math.cos(angle),
    y: 0.5 - 0.5 * Math.sin(angle),
    x2: 0.5 + 0.5 * Math.cos(angle),
    y2: 0.5 + 0.5 * Math.sin(angle),
    colorStops: stops,
  };
}

/** 原 xW：dPt 逐点样式（色/边框） */
function chartDataPointStyles(ser: XmlNode, ctx: PptxRenderContext): { color?: string; borderColor?: string; borderWidth?: number; borderType?: string }[] | undefined {
  const points = ser.children(`dPt`);
  if (points.length === 0) return;
  const out: ({ color?: string; borderColor?: string; borderWidth?: number; borderType?: string } | undefined)[] = [];
  for (const dPt of points) {
    const idx = dPt.child(`idx`).numAttr(`val`);
    if (idx === undefined) continue;
    const spPr = dPt.child(`spPr`);
    if (!spPr.exists()) continue;
    const style: { color?: string; borderColor?: string; borderWidth?: number; borderType?: string } = {};
    const solid = spPr.child(`solidFill`);
    if (solid.exists()) {
      const color = chartColorHex(solid, ctx);
      color && (style.color = color);
    }
    const line = chartLineStyle(spPr.child(`ln`), ctx);
    if (line) {
      style.borderColor = line.color;
      style.borderWidth = line.width;
      style.borderType = line.type;
    }
    if (Object.keys(style).length > 0) {
      while (out.length <= idx) out.push(undefined);
      out[idx] = style;
    }
  }
  return out.length > 0 ? (out as { color?: string; borderColor?: string; borderWidth?: number; borderType?: string }[]) : undefined;
}

/* --- 常量与显式字号标记（原 SW..AW，jsx 41218-41235） --- */

const EXPLICIT_FONT_SIZE = Symbol(`pptxExplicitFontSize`); // 原 SW
const CHART_LABEL_BLACK = `#000000`; // 原 CW
const CHART_DEFAULT_FONT_SIZE = 10; // 原 wW
const CHART_AXIS_GRAY = `#898989`; // 原 TW
const CHART_DEFAULT_GRIDLINE = { color: CHART_AXIS_GRAY, width: 1, type: `solid` as const }; // 原 EW
const CHART_RADAR_GRIDLINE = { color: `#868686`, width: 1, type: `solid` as const }; // 原 DW
const CHART_ACCENT_ORDER = [`accent1`, `accent2`, `accent3`, `accent4`, `accent5`, `accent6`]; // 原 OW

/** 原 kW：打上"显式字号"标记（后续统一字号时跳过） */
function markExplicitFontSize<T extends object>(style: T): T {
  (style as unknown as Record<symbol, boolean>)[EXPLICIT_FONT_SIZE] = true;
  return style;
}

/** 原 AW：是否显式字号 */
function hasExplicitFontSize(value: unknown): boolean {
  return !!(value && typeof value === `object` && (value as Record<symbol, unknown>)[EXPLICIT_FONT_SIZE]);
}

/** 原 jW：支持的图表类型（按 plotArea 出现顺序） */
export const CHART_TYPE_NAMES = [
  `barChart`, `bar3DChart`, `lineChart`, `line3DChart`, `areaChart`, `area3DChart`,
  `pieChart`, `pie3DChart`, `doughnutChart`, `radarChart`, `scatterChart`,
  `bubbleChart`, `stockChart`, `surface3DChart`,
];

/* --- 标题与富文本（原 MW..WW，jsx 41237-41394） --- */

/** 原 MW：title 文本（rich 段落拼接 / strRef 首点） */
function chartTitleText(title: XmlNode): string | undefined {
  const tx = title.child(`tx`);
  if (!tx.exists()) return;
  const rich = tx.child(`rich`);
  if (rich.exists()) {
    const lines: string[] = [];
    for (const p of rich.children(`p`)) {
      const parts: string[] = [];
      for (const child of p.allChildren()) {
        if (child.localName === `br`) {
          parts.push(`\n`);
          continue;
        }
        if (child.localName !== `r` && child.localName !== `fld`) continue;
        const text = child.child(`t`).text();
        text && parts.push(text);
      }
      const line = parts.join(``);
      line && lines.push(line);
    }
    if (lines.length > 0) return lines.join(`\n`);
  }
  const strRef = tx.child(`strRef`);
  if (strRef.exists()) {
    const pts = strRef.child(`strCache`).children(`pt`);
    if (pts.length > 0) return pts[0].child(`v`).text();
  }
  return undefined;
}

/** 原 NW：echarts rich 文本转义 */
function escapeRichText(text: string): string {
  return text.replace(/\\/g, `\\\\`).replace(/\{/g, `\\{`).replace(/\}/g, `\\}`).replace(/\|/g, `\\|`);
}

/** 图表文本样式模型（原 zW 返回类型） */
interface ChartTextStyle {
  color?: string;
  fontSize?: number;
  bold?: boolean;
  fontFamily?: string;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  [key: symbol]: unknown;
}

/** 原 PW：样式 → echarts rich 片段（仅非空字段） */
function buildRichStyle(style: ChartTextStyle | undefined): Record<string, unknown> | undefined {
  if (!style) return;
  const out: Record<string, unknown> = {
    ...(style.color ? { color: style.color } : {}),
    ...(style.fontSize === undefined ? {} : { fontSize: style.fontSize }),
    ...(style.fontFamily ? { fontFamily: style.fontFamily } : {}),
    ...(style.textShadowColor ? { textShadowColor: style.textShadowColor } : {}),
    ...(style.textShadowBlur === undefined ? {} : { textShadowBlur: style.textShadowBlur }),
    ...(style.textShadowOffsetX === undefined ? {} : { textShadowOffsetX: style.textShadowOffsetX }),
    ...(style.textShadowOffsetY === undefined ? {} : { textShadowOffsetY: style.textShadowOffsetY }),
  };
  style.bold !== undefined && (out.fontWeight = style.bold ? `bold` : `normal`);
  return Object.keys(out).length > 0 ? out : undefined;
}

/** 原 FW：txPr 段落 defRPr 颜色 */
function chartTxPrColor(host: XmlNode, ctx: PptxRenderContext): string | undefined {
  const txPr = host.child(`txPr`);
  if (txPr.exists()) {
    for (const p of txPr.children(`p`)) {
      const pPr = p.child(`pPr`);
      if (!pPr.exists()) continue;
      const defRPr = pPr.child(`defRPr`);
      if (!defRPr.exists()) continue;
      const solid = defRPr.child(`solidFill`);
      if (solid.exists()) return chartColorHex(solid, ctx);
    }
  }
  return undefined;
}

/** 原 JW：同 FW（坐标轴变体，原样保留两个实现） */
function chartAxisTxPrColor(host: XmlNode, ctx: PptxRenderContext): string | undefined {
  const txPr = host.child(`txPr`);
  if (txPr.exists()) {
    for (const p of txPr.children(`p`)) {
      const pPr = p.child(`pPr`);
      if (!pPr.exists()) continue;
      const defRPr = pPr.child(`defRPr`);
      if (!defRPr.exists()) continue;
      const solid = defRPr.child(`solidFill`);
      if (solid.exists()) return chartColorHex(solid, ctx);
    }
  }
  return undefined;
}

/** 原 IW：#hex → rgb */
function chartHexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace(/^#/, ``);
  const full = raw.length === 3 ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2] : raw;
  const parsed = parseInt(full, 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}

/** 原 LW：颜色+透明 → rgba CSS */
function chartColorAlphaCss(color: string, alpha: number): string {
  const hex = color.startsWith(`#`) ? color : `#${color}`;
  if (alpha >= 1) return hex;
  const { r, g, b } = chartHexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** 原 RW：rPr effectLst outerShdw → 文本阴影参数 */
function chartTextShadow(rPr: XmlNode, ctx: PptxRenderContext): Pick<ChartTextStyle, `textShadowColor` | `textShadowBlur` | `textShadowOffsetX` | `textShadowOffsetY`> | undefined {
  const shadow = rPr.child(`effectLst`).child(`outerShdw`);
  if (shadow.exists()) {
    try {
      const { color, alpha } = resolveColor(shadow, ctx);
      if (!color || alpha <= 0) return;
      const dist = emuToPx(shadow.numAttr(`dist`) ?? 0);
      const blur = emuToPx(shadow.numAttr(`blurRad`) ?? 0);
      const dir = (shadow.numAttr(`dir`) ?? 0) / 6e4;
      const dx = dist * Math.cos((dir * Math.PI) / 180);
      const dy = dist * Math.sin((dir * Math.PI) / 180);
      return { textShadowColor: chartColorAlphaCss(color, alpha), textShadowBlur: blur, textShadowOffsetX: dx, textShadowOffsetY: dy };
    } catch {
      return;
    }
  }
  return undefined;
}

/** 原 zW：rPr → 文本样式（色/字号 hundredth→pt/粗/字体栈/阴影） */
function chartRunStyle(rPr: XmlNode, ctx: PptxRenderContext): ChartTextStyle | undefined {
  if (!rPr.exists()) return;
  const style: ChartTextStyle = {};
  const solid = rPr.child(`solidFill`);
  if (solid.exists()) {
    const color = chartColorHex(solid, ctx);
    color && (style.color = color);
  }
  const size = rPr.numAttr(`sz`);
  size !== undefined && size > 0 && ((style.fontSize = Math.round(size / 100)), (style[EXPLICIT_FONT_SIZE] = true));
  const bold = rPr.attr(`b`);
  bold !== undefined && (style.bold = parseXmlBool(bold));
  const family = resolveTypefaceStack(
    [rPr.child(`latin`).attr(`typeface`), rPr.child(`ea`).attr(`typeface`), rPr.child(`cs`).attr(`typeface`)],
    ctx,
    [rPr.attr(`lang`), rPr.attr(`altLang`)],
  );
  family.length > 0 && (style.fontFamily = buildFontFamilyCss(family));
  const shadow = chartTextShadow(rPr, ctx);
  shadow && Object.assign(style, shadow);
  return style.color || style.fontSize !== undefined || style.bold !== undefined || style.fontFamily !== undefined || style.textShadowColor !== undefined
    ? style
    : undefined;
}

/** 原 BW：rich 首段 defRPr 样式 */
function chartRichDefaultStyle(rich: XmlNode, ctx: PptxRenderContext): ChartTextStyle | undefined {
  for (const p of rich.children(`p`)) {
    const pPr = p.child(`pPr`);
    if (!pPr.exists()) continue;
    const style = chartRunStyle(pPr.child(`defRPr`), ctx);
    if (style) return style;
  }
  return undefined;
}

/** 原 VW：txPr 默认样式 */
function chartTxPrStyle(host: XmlNode, ctx: PptxRenderContext): ChartTextStyle | undefined {
  const txPr = host.child(`txPr`);
  if (txPr.exists()) return chartRichDefaultStyle(txPr, ctx);
  return undefined;
}

/** 原 HW：txPr 优先，回退 tx/rich */
function chartTitleStyle(host: XmlNode, ctx: PptxRenderContext): ChartTextStyle | undefined {
  return chartTxPrStyle(host, ctx) ?? chartRichDefaultStyle(host.child(`tx`).child(`rich`), ctx);
}

/** 原 UW：标题富文本（逐 run 样式 → echarts rich 标记） */
function chartRichTitle(title: XmlNode, ctx: PptxRenderContext): { text: string; rich: Record<string, unknown> } | undefined {
  const rich = title.child(`tx`).child(`rich`);
  if (!rich.exists()) return;
  const lines: string[] = [];
  const richStyles: Record<string, Record<string, unknown>> = {};
  let styleCount = 0;
  for (const p of rich.children(`p`)) {
    const parts: string[] = [];
    for (const child of p.allChildren()) {
      if (child.localName === `br`) {
        parts.push(`\n`);
        continue;
      }
      if (child.localName !== `r` && child.localName !== `fld`) continue;
      const text = child.child(`t`).text();
      if (!text) continue;
      const style = buildRichStyle(chartRunStyle(child.child(`rPr`), ctx));
      if (!style) {
        parts.push(escapeRichText(text));
        continue;
      }
      const key = `r${styleCount++}`;
      richStyles[key] = style;
      parts.push(`{${key}|${escapeRichText(text)}}`);
    }
    const line = parts.join(``);
    line && lines.push(line);
  }
  if (Object.keys(richStyles).length !== 0) return { text: lines.join(`\n`), rich: richStyles };
  return undefined;
}

/** 原 WW：主题次要+主要字体栈（图表全局缺省字体） */
function chartThemeFontFamily(ctx: PptxRenderContext): string | undefined {
  const family = resolveTypefaceStack([`+mn-lt`, `+mn-ea`, `+mj-lt`, `+mj-ea`], ctx);
  return family.length > 0 ? buildFontFamilyCss(family) : undefined;
}

/* --- 坐标轴解析（原 GW..iG，jsx 41395-41590） --- */

/** 坐标轴解析结果（原 $W 返回类型） */
interface ChartAxisInfo {
  deleted: boolean;
  tickLblPos: string;
  crosses?: string;
  numFmt?: string;
  min?: number;
  max?: number;
  hasMajorGridlines: boolean;
  majorTickMark?: string;
  orientation: string;
  title?: string;
  titleStyle?: ChartTextStyle;
  titleRotation?: number;
  labelColor?: string;
  labelFontSize?: number;
  lineColor?: string;
  majorGridlineStyle?: { color: string; width: number; type: string };
}

const CHART_AXIS_DEFAULTS: ChartAxisInfo = {
  deleted: false,
  tickLblPos: `nextTo`,
  hasMajorGridlines: false,
  orientation: `minMax`,
}; // 原 GW

/** 原 KW：主题方案色（大写无 #） */
function themeSchemeColorHex(theme: PptxTheme, name: string): string | undefined {
  return theme.colorScheme.get(name)?.replace(`#`, ``).toUpperCase();
}

/** 原 qW：Office 2007 默认主题（4F81BD/C0504D）→ 黑轴色 */
function legacyThemeAxisColor(ctx: PptxRenderContext): string | undefined {
  if (themeSchemeColorHex(ctx.theme, `accent1`) === `4F81BD` && themeSchemeColorHex(ctx.theme, `accent2`) === `C0504D`) return `#000000`;
  return undefined;
}

/** 原 YW：轴 spPr ln 颜色 */
function chartAxisLineColor(axis: XmlNode, ctx: PptxRenderContext): string | undefined {
  const line = axis.child(`spPr`).child(`ln`);
  if (!line.exists()) return;
  const solid = line.child(`solidFill`);
  if (solid.exists()) return chartColorHex(solid, ctx);
  return undefined;
}

/** 原 XW：majorGridlines 线型 */
function chartGridlineStyle(axis: XmlNode, ctx: PptxRenderContext): { color: string; width: number; type: string } | undefined {
  return chartLineStyle(axis.child(`majorGridlines`).child(`spPr`).child(`ln`), ctx);
}

/** 原 ZW：标题旋转角（bodyPr rot，tx/rich 优先） */
function chartTitleRotation(title: XmlNode): number | undefined {
  const rot = (title.child(`tx`).child(`rich`).child(`bodyPr`).exists()
    ? title.child(`tx`).child(`rich`).child(`bodyPr`)
    : title.child(`txPr`).child(`bodyPr`)
  ).numAttr(`rot`);
  if (rot === undefined) return;
  return Number((rot / 6e4).toFixed(3));
}

/** 原 QW：title → {title, titleStyle, titleRotation} */
function chartAxisTitle(axis: XmlNode, ctx: PptxRenderContext): Partial<ChartAxisInfo> {
  const title = axis.child(`title`);
  if (!title.exists()) return {};
  const text = chartTitleText(title);
  return text ? { title: text, titleStyle: chartTitleStyle(title, ctx), titleRotation: chartTitleRotation(title) } : {};
}

/** 原 $W：轴节点全量解析（delete/tickLblPos/crosses/numFmt/scaling/网格/样式/标题） */
function parseChartAxis(axis: XmlNode, ctx: PptxRenderContext): ChartAxisInfo {
  if (!axis.exists()) return { ...CHART_AXIS_DEFAULTS };
  const deleted = chartBoolDefaultTrue(axis.child(`delete`));
  const tickLblPos = axis.child(`tickLblPos`).attr(`val`) || `nextTo`;
  const crosses = axis.child(`crosses`).attr(`val`);
  const numFmtNode = axis.child(`numFmt`);
  const formatCode = (numFmtNode.exists() && numFmtNode.attr(`formatCode`)) || undefined;
  const scaling = axis.child(`scaling`);
  const minNode = scaling.child(`min`);
  const maxNode = scaling.child(`max`);
  const min = minNode.exists() ? parseFloat(minNode.attr(`val`) || ``) : undefined;
  const max = maxNode.exists() ? parseFloat(maxNode.attr(`val`) || ``) : undefined;
  const hasMajorGridlines = axis.child(`majorGridlines`).exists();
  const majorTickMark = axis.child(`majorTickMark`).attr(`val`);
  const orientation = scaling.child(`orientation`).attr(`val`) || `minMax`;
  const txPrStyle = chartTxPrStyle(axis, ctx);
  const labelColor = txPrStyle?.color ?? chartAxisTxPrColor(axis, ctx);
  const labelFontSize = txPrStyle?.fontSize;
  const legacyColor = legacyThemeAxisColor(ctx);
  const lineColor = chartAxisLineColor(axis, ctx) ?? legacyColor;
  const majorGridlineStyle = hasMajorGridlines
    ? chartGridlineStyle(axis, ctx) ?? (legacyColor ? { ...CHART_DEFAULT_GRIDLINE, color: legacyColor } : undefined)
    : undefined;
  const title = chartAxisTitle(axis, ctx);
  return {
    deleted,
    tickLblPos,
    crosses,
    numFmt: formatCode && formatCode !== `General` ? formatCode : undefined,
    min: min !== undefined && !isNaN(min) ? min : undefined,
    max: max !== undefined && !isNaN(max) ? max : undefined,
    hasMajorGridlines,
    majorTickMark,
    orientation,
    ...title,
    labelColor,
    labelFontSize,
    lineColor,
    majorGridlineStyle,
  };
}

/** 原 eG：图表类型节点的 axId 序列 */
function chartAxisIds(chartTypeNode?: XmlNode): string[] {
  return chartTypeNode != null && chartTypeNode.exists()
    ? chartTypeNode.children(`axId`).map((n) => n.attr(`val`)).filter((v): v is string => v !== undefined && v !== ``)
    : [];
}

/** 原 tG：按 axId 匹配轴（无匹配取首个） */
function findAxisNode(plotArea: XmlNode, kinds: string[], axId?: string): XmlNode {
  if (axId) {
    for (const kind of kinds) {
      const match = plotArea.children(kind).find((axis) => axis.child(`axId`).attr(`val`) === axId);
      if (match) return match;
    }
    return new XmlNode(null);
  }
  for (const kind of kinds) {
    const axes = plotArea.children(kind);
    if (axes[0] != null && axes[0].exists()) return axes[0];
  }
  return new XmlNode(null);
}

/** 原 nG：分类+值轴解析（按图表类型节点的 axId 配对） */
function parseCategoryValueAxes(plotArea: XmlNode, ctx: PptxRenderContext, chartTypeNode?: XmlNode): { valueAxis: ChartAxisInfo; categoryAxis: ChartAxisInfo } {
  const ids = chartAxisIds(chartTypeNode);
  const catId = ids[0];
  const valId = ids[1];
  const valueAxisNode = findAxisNode(plotArea, [`valAx`], valId);
  const categoryAxisNode = findAxisNode(plotArea, [`catAx`, `dateAx`], catId);
  return { valueAxis: parseChartAxis(valueAxisNode, ctx), categoryAxis: parseChartAxis(categoryAxisNode, ctx) };
}

/** 原 rG：散点双值轴（axPos b/t → x，l/r → y；单轴复制） */
function parseScatterAxes(plotArea: XmlNode, ctx: PptxRenderContext): { xAxis: ChartAxisInfo; yAxis: ChartAxisInfo } {
  const valueAxes = plotArea.children(`valAx`);
  let xAxis: ChartAxisInfo = { ...CHART_AXIS_DEFAULTS };
  let yAxis: ChartAxisInfo = { ...CHART_AXIS_DEFAULTS };
  for (const axis of valueAxes) {
    const pos = axis.child(`axPos`).attr(`val`) ?? ``;
    const info = parseChartAxis(axis, ctx);
    pos === `b` || pos === `t` ? (xAxis = info) : (pos === `l` || pos === `r`) && (yAxis = info);
  }
  valueAxes.length === 1 && (yAxis = parseChartAxis(valueAxes[0], ctx));
  return { xAxis, yAxis };
}

/**
 * 原 iG：轴信息 → echarts 轴配置（就地修改）：
 * 删除隐藏、maxMin 反转、autoZero、标题、标签/刻度隐藏、
 * 数值范围、格式化、缺省字号、网格线、颜色。
 */
function applyAxisToOption(axisOption: Record<string, unknown>, info: ChartAxisInfo, kind: `category` | `value`): void {
  if (info.deleted) {
    axisOption.axisLabel = { ...((axisOption.axisLabel as object) || {}), show: false };
    axisOption.axisLine = { show: false };
    axisOption.axisTick = { show: false };
    kind === `value` && (axisOption.splitLine = { show: false });
    return;
  }
  info.orientation === `maxMin` && (axisOption.inverse = true);
  info.crosses === `autoZero` && (axisOption.axisLine = { ...((axisOption.axisLine as object) || {}), onZero: true });
  if (info.title) {
    axisOption.name = info.title;
    axisOption.nameLocation = `middle`;
    axisOption.nameGap = kind === `value` ? 42 : 28;
    info.titleRotation !== undefined && (axisOption.nameRotate = info.titleRotation);
    const nameStyle: Record<string, unknown> = {};
    info.titleStyle?.color && (nameStyle.color = info.titleStyle.color);
    info.titleStyle?.fontSize !== undefined && (nameStyle.fontSize = info.titleStyle.fontSize);
    info.titleStyle?.fontFamily && (nameStyle.fontFamily = info.titleStyle.fontFamily);
    info.titleStyle?.bold !== undefined && (nameStyle.fontWeight = info.titleStyle.bold ? `bold` : `normal`);
    Object.keys(nameStyle).length > 0 && (axisOption.nameTextStyle = nameStyle);
  }
  info.tickLblPos === `none` && (axisOption.axisLabel = { ...((axisOption.axisLabel as object) || {}), show: false });
  if (info.majorTickMark === `none`) axisOption.axisTick = { ...((axisOption.axisTick as object) || {}), show: false };
  else if (!info.deleted) {
    const tick = (axisOption.axisTick as Record<string, unknown>) || {};
    const tickLine = (tick.lineStyle as Record<string, unknown>) || {};
    tickLine.color === undefined && (axisOption.axisTick = { ...tick, lineStyle: { ...tickLine, color: info.lineColor ?? CHART_AXIS_GRAY } });
  }
  if (kind === `value` && (info.min !== undefined && (axisOption.min = info.min), info.max !== undefined && (axisOption.max = info.max)),
    kind === `value` && !info.deleted && info.tickLblPos !== `none`) {
    const label = (axisOption.axisLabel as Record<string, unknown>) || {};
    if (!label.formatter) {
      const numFmt = info.numFmt;
      axisOption.axisLabel = { ...label, formatter: (value: number) => formatChartValue(value, numFmt) };
    }
  }
  if (!info.deleted && info.tickLblPos !== `none`) {
    const label = (axisOption.axisLabel as Record<string, unknown>) || {};
    label.fontSize === undefined && (axisOption.axisLabel = { ...label, fontSize: CHART_DEFAULT_FONT_SIZE });
  }
  if (kind === `value`) {
    if (!info.hasMajorGridlines) axisOption.splitLine = { show: false };
    else if (info.majorGridlineStyle) {
      const split = (axisOption.splitLine as Record<string, unknown>) || {};
      const splitLine = (split.lineStyle as Record<string, unknown>) || {};
      axisOption.splitLine = { ...split, show: true, lineStyle: { ...splitLine, ...info.majorGridlineStyle } };
    } else {
      const split = (axisOption.splitLine as Record<string, unknown>) || {};
      const splitLine = (split.lineStyle as Record<string, unknown>) || {};
      axisOption.splitLine = { ...split, show: true, lineStyle: { ...CHART_DEFAULT_GRIDLINE, ...splitLine } };
    }
  }
  if (info.labelColor || !info.deleted) {
    const label = (axisOption.axisLabel as Record<string, unknown>) || {};
    const color = info.labelColor ?? (label.color === undefined ? CHART_LABEL_BLACK : undefined);
    color && (axisOption.axisLabel = { ...label, color });
  }
  info.labelFontSize !== undefined && (axisOption.axisLabel = { ...((axisOption.axisLabel as object) || {}), fontSize: info.labelFontSize });
  if (info.lineColor || !info.deleted) {
    const line = (axisOption.axisLine as Record<string, unknown>) || {};
    const lineStyle = (line.lineStyle as Record<string, unknown>) || {};
    const color = info.lineColor ?? (lineStyle.color === undefined ? CHART_AXIS_GRAY : undefined);
    color && (axisOption.axisLine = { ...line, show: (line.show as boolean | undefined) ?? true, lineStyle: { ...lineStyle, color } });
  }
}

/* --- 数据标签与序列（原 aG..pG，jsx 41591-41880） --- */

/** 数据标签配置（原 sG/FK 合并类型） */
interface ChartLabelConfig {
  showVal: boolean;
  showCatName: boolean;
  showSerName: boolean;
  showPercent: boolean;
  position?: string;
  showLeaderLines?: boolean;
  manualLayout?: { x?: number; y?: number; width?: number; height?: number };
  color?: string;
  fontSize?: number;
  bold?: boolean;
  deleted?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number[];
}

/** 原 aG：布尔子节点 */
function chartBoolChild(node: XmlNode, name: string): boolean {
  return chartBoolDefaultTrue(node.child(name));
}

/** 原 oG：manualLayout → 数值盒 */
function chartManualLayout(node: XmlNode): { x?: number; y?: number; width?: number; height?: number } | undefined {
  const layout = node.child(`layout`).child(`manualLayout`);
  if (!layout.exists()) return;
  const out: { x?: number; y?: number; width?: number; height?: number } = {};
  const x = layout.child(`x`).numAttr(`val`);
  const y = layout.child(`y`).numAttr(`val`);
  const w = layout.child(`w`).numAttr(`val`);
  const h = layout.child(`h`).numAttr(`val`);
  x !== undefined && (out.x = x);
  y !== undefined && (out.y = y);
  w !== undefined && (out.width = w);
  h !== undefined && (out.height = h);
  return Object.keys(out).length > 0 ? out : undefined;
}

/** 原 lG：标签背景/边框/内边距 */
function chartLabelBoxStyle(node: XmlNode, ctx: PptxRenderContext): Partial<ChartLabelConfig> {
  const out: Partial<ChartLabelConfig> = {};
  const spPr = node.child(`spPr`);
  if (spPr.exists()) {
    const solid = spPr.child(`solidFill`);
    if (solid.exists()) {
      const color = chartColorHex(solid, ctx);
      color && (out.backgroundColor = color);
    }
    const line = spPr.child(`ln`);
    if (line.exists() && !line.child(`noFill`).exists()) {
      const lineSolid = line.child(`solidFill`);
      if (lineSolid.exists()) {
        const color = chartColorHex(lineSolid, ctx);
        color && (out.borderColor = color);
      }
      const width = line.numAttr(`w`);
      width !== undefined && width > 0 ? (out.borderWidth = Math.max(1, emuToPx(width))) : out.borderColor && (out.borderWidth = 1);
    }
  }
  const bodyPr = node.child(`txPr`).child(`bodyPr`);
  if (bodyPr.exists()) {
    const top = emuToPx(bodyPr.numAttr(`tIns`) ?? 0);
    const right = emuToPx(bodyPr.numAttr(`rIns`) ?? 0);
    const bottom = emuToPx(bodyPr.numAttr(`bIns`) ?? 0);
    const left = emuToPx(bodyPr.numAttr(`lIns`) ?? 0);
    (top || right || bottom || left) && (out.padding = [top, right, bottom, left]);
  }
  return out;
}

/** 原 sG：dLbls 共享标签配置（任一 show 开关开启才有效） */
function parseChartLabels(host: XmlNode, ctx: PptxRenderContext): ChartLabelConfig | undefined {
  const labels = host.child(`dLbls`);
  if (!labels.exists()) return;
  const showVal = chartBoolChild(labels, `showVal`);
  const showCatName = chartBoolChild(labels, `showCatName`);
  const showSerName = chartBoolChild(labels, `showSerName`);
  const showPercent = chartBoolChild(labels, `showPercent`);
  const showLeaderLines = chartBoolChild(labels, `showLeaderLines`);
  const posNode = labels.child(`dLblPos`);
  const position = (posNode.exists() && posNode.attr(`val`)) || undefined;
  const manualLayout = chartManualLayout(labels);
  const txPrStyle = chartTxPrStyle(labels, ctx);
  const color = txPrStyle?.color ?? chartTxPrColor(labels, ctx);
  const fontSize = txPrStyle?.fontSize;
  const bold = txPrStyle?.bold;
  const box = chartLabelBoxStyle(labels, ctx);
  if (!showVal && !showCatName && !showSerName && !showPercent) return;
  return { showVal, showCatName, showSerName, showPercent, position, showLeaderLines, manualLayout, color, fontSize, bold, ...box };
}

/** 原 cG：可选布尔子节点 */
function chartOptionalBool(node: XmlNode, name: string): boolean | undefined {
  const child = node.child(name);
  if (child.exists()) return chartBoolDefaultTrue(child);
  return undefined;
}

/** 原 uG：dLbl 逐点标签覆盖（idx → 配置） */
function parseChartPointLabels(labelsHost: XmlNode, ctx: PptxRenderContext): Map<number, Partial<ChartLabelConfig>> {
  const out = new Map<number, Partial<ChartLabelConfig>>();
  if (!labelsHost.exists()) return out;
  for (const dLbl of labelsHost.children(`dLbl`)) {
    const idx = dLbl.child(`idx`).numAttr(`val`);
    if (idx === undefined) continue;
    const style = chartTxPrStyle(dLbl, ctx);
    const posNode = dLbl.child(`dLblPos`);
    const entry: Partial<ChartLabelConfig> = {};
    const deleted = chartOptionalBool(dLbl, `delete`);
    const showVal = chartOptionalBool(dLbl, `showVal`);
    const showCatName = chartOptionalBool(dLbl, `showCatName`);
    const showSerName = chartOptionalBool(dLbl, `showSerName`);
    const showPercent = chartOptionalBool(dLbl, `showPercent`);
    const showLeaderLines = chartOptionalBool(dLbl, `showLeaderLines`);
    const manualLayout = chartManualLayout(dLbl);
    showVal !== undefined && (entry.showVal = showVal);
    showCatName !== undefined && (entry.showCatName = showCatName);
    showSerName !== undefined && (entry.showSerName = showSerName);
    showPercent !== undefined && (entry.showPercent = showPercent);
    deleted === true &&
      ((entry.deleted = true), (entry.showVal = false), (entry.showCatName = false), (entry.showSerName = false), (entry.showPercent = false));
    showLeaderLines !== undefined && (entry.showLeaderLines = showLeaderLines);
    manualLayout && (entry.manualLayout = manualLayout);
    posNode.exists() && (entry.position = posNode.attr(`val`) || undefined);
    if (style != null && style.color) entry.color = style.color;
    else {
      const fallback = chartTxPrColor(dLbl, ctx);
      fallback && (entry.color = fallback);
    }
    style?.fontSize !== undefined && (entry.fontSize = style.fontSize);
    style?.bold !== undefined && (entry.bold = style.bold);
    Object.assign(entry, chartLabelBoxStyle(dLbl, ctx));
    Object.keys(entry).length > 0 && out.set(idx, entry);
  }
  return out;
}

/** 原 dG：序列名（strRef 首点 / v） */
function chartSeriesName(tx: XmlNode): string {
  const strRef = tx.child(`strRef`);
  if (strRef.exists()) {
    const pts = strRef.child(`strCache`).children(`pt`);
    if (pts.length > 0) return pts[0].child(`v`).text();
  }
  const v = tx.child(`v`);
  return v.exists() ? v.text() : ``;
}

/** 原 fG：饼图爆炸值（序列级 + dPt 级） */
function chartExplosions(ser: XmlNode, count: number): number[] | undefined {
  const values = Array<number>(count).fill(0);
  let any = false;
  const seriesExplosion = ser.child(`explosion`).numAttr(`val`) ?? 0;
  seriesExplosion > 0 && (values.fill(seriesExplosion), (any = true));
  for (const dPt of ser.children(`dPt`)) {
    const idx = dPt.child(`idx`).numAttr(`val`);
    if (idx === undefined) continue;
    const explosion = dPt.child(`explosion`).numAttr(`val`);
    explosion !== undefined && explosion > 0 && ((values[idx] = explosion), (any = true));
  }
  return any ? values : undefined;
}

/** 图表序列模型（原 pG 元素类型） */
export interface ChartSeriesData {
  name: string;
  order: number;
  categories: string[];
  values: number[];
  xValues?: number[];
  bubbleSizes?: number[];
  colorHex?: string | ChartLinearGradient;
  dataPointColors?: (string | undefined)[];
  dataPointStyles?: { color?: string; borderColor?: string; borderWidth?: number; borderType?: string }[];
  formatCode?: string;
  blankIndices: Set<number>;
  invertIfNegative?: boolean;
  markerSymbol?: string;
  markerSize?: number;
  smooth?: boolean;
  lineWidth?: number;
  lineNoFill: boolean;
}

/** 原 pG：ser 列表 → 序列模型（按 order 排序） */
export function extractChartSeries(chartTypeNode: XmlNode, ctx: PptxRenderContext): ChartSeriesData[] {
  const out: ChartSeriesData[] = [];
  for (const ser of chartTypeNode.children(`ser`)) {
    const name = chartSeriesName(ser.child(`tx`));
    const order = ser.child(`order`).numAttr(`val`) ?? out.length;
    const categories = chartStringSeries(ser.child(`cat`));
    const valNode = ser.child(`val`);
    const { values, blankIndices } = chartNumberSeriesWithBlanks(valNode);
    const valueList = values;
    let blanks = blankIndices;
    const formatCode = chartFormatCode(valNode);
    const xValNode = ser.child(`xVal`);
    const yValNode = ser.child(`yVal`);
    let xValues: number[] | undefined;
    if (yValNode.exists()) {
      const yData = chartNumberSeriesWithBlanks(yValNode);
      yData.values.length > 0 && ((valueList.length = 0), valueList.push(...yData.values), (blanks = yData.blankIndices));
    }
    if (xValNode.exists() && ((xValues = chartNumberSeries(xValNode)), categories.length === 0)) {
      const xCategories = chartStringSeries(xValNode);
      xCategories.length > 0 && categories.push(...xCategories);
    }
    const bubbleNode = ser.child(`bubbleSize`);
    const bubbleSizes = bubbleNode.exists() ? chartNumberSeries(bubbleNode) : undefined;
    const colorHex = chartSeriesColor(ser, ctx);
    const lineWidth = chartLineWidth(ser);
    const lineNoFill = chartLineNoFill(ser);
    const dataPointStyles = chartDataPointStyles(ser, ctx);
    const dataPointColors = dataPointStyles?.map((s) => s?.color);
    const invertNode = ser.child(`invertIfNegative`);
    const invertIfNegative = invertNode.exists() ? chartBoolDefaultTrue(invertNode) : undefined;
    const marker = ser.child(`marker`);
    const markerSymbol = marker.child(`symbol`).attr(`val`);
    const markerSizeRaw = marker.child(`size`).numAttr(`val`);
    const markerSize = markerSizeRaw === undefined ? undefined : hundredthToPt(markerSizeRaw);
    const smoothNode = ser.child(`smooth`);
    const smooth = smoothNode.exists() ? chartBoolDefaultTrue(smoothNode) : undefined;
    out.push({
      name,
      order,
      categories,
      values: valueList,
      xValues,
      bubbleSizes,
      colorHex,
      dataPointColors,
      dataPointStyles,
      formatCode,
      blankIndices: blanks,
      invertIfNegative,
      markerSymbol,
      markerSize,
      smooth,
      lineWidth,
      lineNoFill,
    });
  }
  out.sort((a, b) => a.order - b.order);
  return out;
}

/* --- 数据表（原 mG/hG，jsx 41881-41950） --- */

/** 原 mG：dTable 配置 */
function parseDataTable(plotArea: XmlNode): { showKeys: boolean } | undefined {
  const table = plotArea.child(`dTable`);
  return table.exists() ? { showKeys: parseXmlBool(table.child(`showKeys`).attr(`val`), true) } : undefined;
}

/** 原 hG：数据表 → HTML <table>（序列×分类，含色块图例） */
function renderDataTableHtml(
  data: { seriesArr: ChartSeriesData[]; showKeys: boolean; formatCode?: string },
  keyColors?: string[],
): HTMLTableElement {
  const table = document.createElement(`table`);
  table.style.width = `100%`;
  table.style.borderCollapse = `collapse`;
  table.style.fontSize = `10px`;
  table.style.marginTop = `8px`;
  const { seriesArr, showKeys, formatCode } = data;
  const categories = seriesArr.find((s) => s.categories.length > 0)?.categories || [];
  const sharedFormat = formatCode;
  const thead = document.createElement(`thead`);
  const headRow = document.createElement(`tr`);
  const corner = document.createElement(`th`);
  corner.style.border = `1px solid #ccc`;
  corner.style.padding = `2px 6px`;
  corner.style.textAlign = `left`;
  corner.style.fontWeight = `bold`;
  headRow.appendChild(corner);
  for (let i = 0; i < categories.length; i++) {
    const th = document.createElement(`th`);
    th.style.border = `1px solid #ccc`;
    th.style.padding = `2px 6px`;
    th.style.textAlign = `right`;
    th.style.fontWeight = `bold`;
    th.textContent = categories[i] ?? ``;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement(`tbody`);
  for (let s = 0; s < seriesArr.length; s++) {
    const series = seriesArr[s];
    const row = document.createElement(`tr`);
    const nameCell = document.createElement(`td`);
    nameCell.style.border = `1px solid #ccc`;
    nameCell.style.padding = `2px 6px`;
    nameCell.style.textAlign = `left`;
    nameCell.style.fontWeight = `bold`;
    if (showKeys && keyColors && keyColors[s]) {
      const swatch = document.createElement(`span`);
      swatch.style.display = `inline-block`;
      swatch.style.width = `8px`;
      swatch.style.height = `8px`;
      swatch.style.marginRight = `4px`;
      swatch.style.verticalAlign = `middle`;
      swatch.style.backgroundColor = keyColors[s];
      nameCell.appendChild(swatch);
    }
    nameCell.appendChild(document.createTextNode(series.name || ``));
    row.appendChild(nameCell);
    for (let c = 0; c < categories.length; c++) {
      const cell = document.createElement(`td`);
      cell.style.border = `1px solid #ccc`;
      cell.style.padding = `2px 6px`;
      cell.style.textAlign = `right`;
      const value = series.values[c];
      cell.textContent = value !== undefined && !series.blankIndices?.has(c) ? formatChartValue(value, sharedFormat ?? series.formatCode) : ``;
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  return table;
}

/* --- 颜色覆盖与色板（原 gG..TG，jsx 41951-42030） --- */

/** 原 gG：clrMapOvr → 覆盖映射属性表 */
function parseColorMapOverride(chartSpace: XmlNode): Map<string, string> | undefined {
  const override = chartSpace.child(`clrMapOvr`);
  if (!override.exists()) return;
  let source = override.element;
  const mapping = override.child(`overrideClrMapping`);
  if (mapping.exists() && mapping.element) source = mapping.element;
  else if (override.child(`masterClrMapping`).exists()) return;
  if (!source) return;
  const attributes = source.attributes;
  const out = new Map<string, string>();
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    out.set(attr.localName, attr.value);
  }
  return out.size > 0 ? out : undefined;
}

/** 原 _G：有覆盖映射时派生新上下文（layout.colorMapOverride + 重置颜色缓存） */
function chartContextWithOverride(chartSpace: XmlNode, ctx: PptxRenderContext): PptxRenderContext {
  const override = parseColorMapOverride(chartSpace);
  return override ? { ...ctx, layout: { ...ctx.layout, colorMapOverride: override }, colorCache: new Map() } : ctx;
}

/** 原 vG：chartSpace style 编号（含 AlternateContent 兜底） */
function chartStyleId(chartSpace: XmlNode): number | undefined {
  const direct = chartSpace.child(`style`).numAttr(`val`);
  if (direct !== undefined) return direct;
  const alternate = chartSpace.child(`AlternateContent`);
  if (alternate.exists()) {
    for (const child of alternate.allChildren()) {
      const value = child.child(`style`).numAttr(`val`);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

const CHART_COLOR_ELEMENT_KINDS = new Set([`srgbClr`, `schemeClr`, `sysClr`, `prstClr`, `hslClr`, `scrgbClr`]); // 原 yG

/** 原 bG：裸颜色元素 → 包一层 solidFill 再解析 */
function chartBareColorHex(node: XmlNode, ctx: PptxRenderContext): string | undefined {
  if (!node.element || !CHART_COLOR_ELEMENT_KINDS.has(node.localName)) return;
  const wrapper = node.element.ownerDocument.createElementNS(node.element.namespaceURI, `solidFill`);
  wrapper.appendChild(node.element.cloneNode(true));
  return chartColorHex(new XmlNode(wrapper), ctx);
}

/** 原 xG：颜色样式列表 → hex 数组 */
function chartColorList(node: XmlNode | undefined, ctx: PptxRenderContext): string[] {
  if (!(node != null && node.exists())) return [];
  const out: string[] = [];
  for (const child of node.allChildren()) {
    const color = chartBareColorHex(child, ctx);
    color && out.push(color);
  }
  return out;
}

/** 原 SG：主题 accent1..6 → 色板 */
function themeAccentPalette(ctx: PptxRenderContext): string[] {
  return CHART_ACCENT_ORDER.map((name) => ctx.theme.colorScheme.get(name))
    .filter((c): c is string => !!c)
    .map((c) => (c.startsWith(`#`) ? c : `#${c}`));
}

/** 原 CG：hex 按系数变暗 */
function darkenHex(hex: string, factor: number): string {
  const raw = hex.replace(`#`, ``);
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return hex;
  const channel = (offset: number) => Math.max(0, Math.min(255, Math.round(parseInt(raw.slice(offset, offset + 2), 16) * factor)));
  return `#${[channel(0), channel(2), channel(4)].map((v) => v.toString(16).padStart(2, `0`)).join(``)}`;
}

/** 原 wG：柱状色板（条形不变暗，柱形 ×0.88） */
function chartBarPalette(ctx: PptxRenderContext, options: { darken?: boolean } = {}): string[] {
  const palette = themeAccentPalette(ctx);
  return options.darken === false ? palette : palette.map((c) => darkenHex(c, 0.88));
}

/** 原 TG：图表色板——chartColorStyles 优先，回退主题强调色 */
function resolveChartPalette(chartSpace: XmlNode, ctx: PptxRenderContext, chartPath: string): string[] | undefined {
  if (chartPath) {
    const styleColors = chartColorList(ctx.presentation.chartColorStyles?.get(chartPath), ctx);
    if (styleColors.length > 0) return styleColors;
  }
  const accents = themeAccentPalette(ctx);
  return accents.length === 0 ? undefined : (chartStyleId(chartSpace), accents);
}

/* --- 图例（原 EG..PG，jsx 42031-42170） --- */

/** 原 EG：0..1 比例 → 百分比串 */
function percentCss(ratio: number): string {
  const scaled = Math.round(ratio * 1e4) / 100;
  return `${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled}%`.replace(/\.0%$/, `%`);
}

/** 图例解析结果（原 DG 返回类型） */
interface ChartLegendInfo {
  option: Record<string, unknown>;
  position: string;
  overlay: boolean;
  textStyle?: ChartTextStyle;
  manualLayout: Record<string, string>;
}

/** 原 DG：legend → echarts 图例选项（位置/覆盖/文本样式/手动布局） */
function parseChartLegend(chartNode: XmlNode, ctx: PptxRenderContext): ChartLegendInfo | undefined {
  const legend = chartNode.child(`legend`);
  if (!legend.exists()) return;
  const posNode = legend.child(`legendPos`);
  const rawPos = (posNode.exists() && posNode.attr(`val`)) || `r`;
  const position = [`b`, `t`, `l`, `r`, `tr`].includes(rawPos) ? rawPos : `r`;
  const overlay = chartBoolDefaultTrue(legend.child(`overlay`));
  const base = { confine: true };
  let option: Record<string, unknown>;
  switch (position) {
    case `b`:
      option = { ...base, bottom: `5%`, orient: `horizontal` };
      break;
    case `t`:
      option = { ...base, top: `14%`, orient: `horizontal` };
      break;
    case `l`:
      option = { ...base, left: `2%`, top: `middle`, orient: `vertical` };
      break;
    case `r`:
      option = { ...base, right: `2%`, top: `middle`, orient: `vertical` };
      break;
    case `tr`:
      option = { ...base, top: `14%`, right: `2%`, orient: `vertical` };
      break;
    default:
      option = { ...base, right: `2%`, top: `middle`, orient: `vertical` };
      break;
  }
  return {
    option,
    position,
    overlay,
    textStyle: (() => {
      const style = chartTxPrStyle(legend, ctx);
      if (!style) return;
      const out: ChartTextStyle = {
        ...(style.color ? { color: style.color } : {}),
        ...(style.fontSize === undefined ? {} : { fontSize: style.fontSize }),
        ...(style.bold === true ? { fontWeight: `bold` } as unknown as ChartTextStyle : {}),
        ...(style.fontFamily ? { fontFamily: style.fontFamily } : {}),
        ...(style.textShadowColor ? { textShadowColor: style.textShadowColor } : {}),
        ...(style.textShadowBlur === undefined ? {} : { textShadowBlur: style.textShadowBlur }),
        ...(style.textShadowOffsetX === undefined ? {} : { textShadowOffsetX: style.textShadowOffsetX }),
        ...(style.textShadowOffsetY === undefined ? {} : { textShadowOffsetY: style.textShadowOffsetY }),
      };
      hasExplicitFontSize(style) && (out[EXPLICIT_FONT_SIZE] = true);
      return out;
    })(),
    manualLayout: legendManualLayout(legend),
  };
}

/** 原 OG：图例手动布局 → 百分比字段 */
function legendManualLayout(legend: XmlNode): Record<string, string> {
  const layout = legend.child(`layout`).child(`manualLayout`);
  if (!layout.exists()) return {};
  const out: Record<string, string> = {};
  const x = layout.child(`x`).numAttr(`val`);
  const y = layout.child(`y`).numAttr(`val`);
  const w = layout.child(`w`).numAttr(`val`);
  const h = layout.child(`h`).numAttr(`val`);
  x !== undefined && (out.left = percentCss(x));
  y !== undefined && (out.top = percentCss(y));
  w !== undefined && (out.width = percentCss(w));
  h !== undefined && (out.height = percentCss(h));
  return out;
}

/** 原 kG：图例在顶部 */
function legendAtTop(legend?: ChartLegendInfo): boolean {
  return legend?.position === `t` || legend?.position === `tr`;
}

/** 原 AG：标题存在时的顶部留白 */
function chartTopMargin(hasTitle: boolean, legend?: ChartLegendInfo): number {
  const top = legendAtTop(legend);
  const overlay = legend?.overlay ?? false;
  return hasTitle ? (top && !overlay ? 52 : 68) : top && !overlay ? 32 : 20;
}

/** 原 jG：图例顶部时的图例上边距 */
function legendTopOffset(hasTitle: boolean, legend?: ChartLegendInfo): number | undefined {
  if (legendAtTop(legend)) return hasTitle ? 26 : 6;
  return undefined;
}

/** 原 MG：图例方位（bottom/top/left/right/none） */
function legendSide(legend?: ChartLegendInfo): `bottom` | `top` | `left` | `right` | `none` {
  if (!legend || legend.overlay || !legend.option || typeof legend.option !== `object`) return `none`;
  const option = legend.option;
  if (option.bottom === undefined) {
    if (option.top !== undefined && option.left === undefined && option.right === undefined) return `top`;
    if (option.left === undefined) return option.right === undefined ? `none` : `right`;
    return `left`;
  }
  return `bottom`;
}

/** 原 NG：底部边距（图例占位 35，否则 20） */
function chartBottomMargin(legend?: ChartLegendInfo): number {
  if (legend) {
    const option = legend.option;
    if (option && option.bottom !== undefined) return 35;
  }
  return 20;
}

/** 原 PG：图例选项合成（手动布局/图标/条目/文本样式） */
function buildLegendOption(
  option: Record<string, unknown> | undefined,
  legend: ChartLegendInfo | undefined,
  topOffset: number | undefined,
  data: (string | { name: string; [key: string]: unknown })[],
  textStyle: ChartTextStyle,
): Record<string, unknown> {
  if (!option) return { show: false };
  const manual = legend?.manualLayout ?? {};
  const top = manual.top === undefined ? (topOffset === undefined ? undefined : topOffset) : manual.top;
  const fontSize = textStyle.fontSize ?? 10;
  const hasIcons = data.some((d) => typeof d === `object` && d.icon);
  const firstIcon = (data[0] as unknown as { icon?: string })?.icon;
  const uniformIcon =
    hasIcons && data.every((d) => typeof d === `object` && typeof d.icon === `string` && d.icon === firstIcon) ? firstIcon : undefined;
  const iconIsBuiltin = uniformIcon !== undefined && !uniformIcon.startsWith(`path://`);
  const legendData = iconIsBuiltin ? data.map((d) => (typeof d === `string` ? d : d.name)) : data;
  const hasPathIcons = data.some((d) => typeof d === `object` && typeof d.icon === `string` && d.icon.startsWith(`path://`));
  return {
    ...option,
    ...manual,
    ...(top === undefined ? {} : { top }),
    ...(iconIsBuiltin ? { icon: uniformIcon } : hasIcons ? {} : { icon: `rect` }),
    itemWidth: hasPathIcons ? Math.max(24, Math.round(fontSize * 2.2)) : fontSize,
    itemHeight: hasPathIcons ? Math.max(8, Math.round(fontSize * 0.9)) : fontSize,
    data: legendData,
    textStyle,
  };
}

/* --- echarts 选项后处理（原 FG..ZG，jsx 42171-42400） --- */

/** echarts 选项（宽松类型，原代码动态读写） */
export type ChartOption = Record<string, any>;

/** 原 FG：legend 取首项（数组/单对象） */
function firstLegend(option: ChartOption | undefined): ChartOption | null {
  if (!option) return null;
  return Array.isArray(option) ? option[0] ?? null : option;
}

/** 原 IG：字符串优先，否则缺省 */
function stringOrDefault(value: unknown, fallback: string): string {
  return typeof value === `string` ? value : fallback;
}

/** 原 LG：序列颜色（lineStyle > itemStyle > 缺省） */
function seriesColorOf(series: ChartOption | undefined, fallback: string): string {
  const lineStyle = series?.lineStyle ?? {};
  const itemStyle = series?.itemStyle ?? {};
  return (
    (typeof lineStyle.color === `string` ? lineStyle.color : undefined) ??
    (typeof itemStyle.color === `string` ? itemStyle.color : undefined) ??
    fallback
  );
}

/** 原 RG：折线图例图标（短横线路径） */
function lineLegendIcon(): string {
  return `path://M2 4.5 L22 4.5`;
}

/** 原 zG：radar 名称样式列表 */
function radarNameStyles(option: ChartOption): ChartOption[] {
  const radars = (Array.isArray(option.radar) ? option.radar : option.radar ? [option.radar] : []).filter(
    (r: unknown): r is ChartOption => typeof r === `object` && !!r,
  );
  return radars.map((r) => {
    const name = (r.name ??= {});
    return (name.textStyle ??= {});
  });
}

/** 原 BG：radar 指示器轴标签列表 */
function radarIndicatorLabels(option: ChartOption): ChartOption[] {
  const radars = (Array.isArray(option.radar) ? option.radar : option.radar ? [option.radar] : []).filter(
    (r: unknown): r is ChartOption => typeof r === `object` && !!r,
  );
  return radars.flatMap((r) => r.indicator ?? []).map((i: ChartOption) => i.axisLabel).filter((l: unknown) => !!l);
}

/** 原 VG：小字号统一提升（标题≤14、雷达/轴/标签/图例 ≤10 → 目标值；显式字号跳过） */
function normalizeSmallFontSizes(option: ChartOption, target: number): void {
  if (option.title?.textStyle != null && option.title.textStyle.fontSize && option.title.textStyle.fontSize <= 14)
    option.title.textStyle.fontSize = target;
  for (const style of radarNameStyles(option)) {
    const size = style.fontSize;
    (typeof size !== `number` || size <= 10) && (style.fontSize = target);
  }
  for (const label of radarIndicatorLabels(option)) {
    const size = label.fontSize;
    (typeof size !== `number` || size <= 10) && (label.fontSize = target);
  }
  const seriesList = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  for (const series of seriesList)
    series?.label != null && series.label.fontSize && series.label.fontSize <= 10 && !hasExplicitFontSize(series.label) && (series.label.fontSize = target);
  const fixAxis = (axis: ChartOption | undefined) => {
    if (!(axis != null && axis.axisLabel)) return;
    const size = axis.axisLabel.fontSize;
    (size === undefined || size <= 10) && (axis.axisLabel.fontSize = target);
  };
  const xAxes = Array.isArray(option.xAxis) ? option.xAxis : option.xAxis ? [option.xAxis] : [];
  const yAxes = Array.isArray(option.yAxis) ? option.yAxis : option.yAxis ? [option.yAxis] : [];
  for (const axis of [...xAxes, ...yAxes]) fixAxis(axis);
  if (option.legend != null && option.legend.textStyle) {
    const size = option.legend.textStyle.fontSize;
    (size === undefined || size <= 10) && !hasExplicitFontSize(option.legend.textStyle) && (option.legend.textStyle.fontSize = target);
  }
}

/** 原 HG：全局缺省字体（标题加粗） */
function applyDefaultFontFamily(option: ChartOption, family: string): void {
  if (option.title != null && option.title.textStyle && !option.title.textStyle.fontFamily) option.title.textStyle.fontFamily = family;
  if (option.title != null && option.title.textStyle && !option.title.textStyle.fontWeight) option.title.textStyle.fontWeight = `bold`;
  const fixAxis = (axis: ChartOption | undefined) => {
    if (!axis) return;
    const label = (axis.axisLabel ??= {});
    label.fontFamily ||= family;
  };
  const xAxes = Array.isArray(option.xAxis) ? option.xAxis : option.xAxis ? [option.xAxis] : [];
  const yAxes = Array.isArray(option.yAxis) ? option.yAxis : option.yAxis ? [option.yAxis] : [];
  for (const axis of [...xAxes, ...yAxes]) fixAxis(axis);
  if (option.legend != null && option.legend.textStyle && !option.legend.textStyle.fontFamily) option.legend.textStyle.fontFamily = family;
  for (const style of radarNameStyles(option)) style.fontFamily ||= family;
  for (const label of radarIndicatorLabels(option)) label.fontFamily ||= family;
}

/** 原 UG：标题/图例/轴名/雷达文字缺省黑色 */
function applyDefaultTextColors(option: ChartOption): void {
  if (option.title != null && option.title.textStyle && option.title.textStyle.color === undefined) option.title.textStyle.color = CHART_LABEL_BLACK;
  const legends = Array.isArray(option.legend) ? option.legend : option.legend ? [option.legend] : [];
  for (const legend of legends) {
    if (!legend || legend.show === false) continue;
    const style = (legend.textStyle ??= {});
    style.color === undefined && (style.color = CHART_LABEL_BLACK);
  }
  const xAxes = Array.isArray(option.xAxis) ? option.xAxis : option.xAxis ? [option.xAxis] : [];
  const yAxes = Array.isArray(option.yAxis) ? option.yAxis : option.yAxis ? [option.yAxis] : [];
  for (const axis of [...xAxes, ...yAxes]) {
    if (!(axis != null && axis.name)) continue;
    const style = (axis.nameTextStyle ??= {});
    style.color === undefined && (style.color = CHART_LABEL_BLACK);
  }
  for (const style of radarNameStyles(option)) style.color === undefined && (style.color = CHART_LABEL_BLACK);
  for (const label of radarIndicatorLabels(option)) label.color === undefined && (label.color = CHART_LABEL_BLACK);
}

/** 原 WG：侧边图例宽度估算 → 调整 grid 左/右留白 */
function adjustGridForSideLegend(option: ChartOption, chartNode: XmlNode, titleFontSize?: number): void {
  if (!option.grid || !option.legend || option.legend.show === false) return;
  const legendNode = chartNode.child(`legend`);
  if (!legendNode.exists() || chartBoolDefaultTrue(legendNode.child(`overlay`))) return;
  const position = legendNode.child(`legendPos`).attr(`val`) || `r`;
  if (position === `r` || position === `l`) {
    const data = option.legend.data;
    if (!data || data.length === 0) return;
    const names = data.map((d: unknown) => (typeof d === `string` ? d : (d as { name: string }).name));
    const fontSize = option.legend?.textStyle?.fontSize ?? titleFontSize ?? 12;
    const itemWidth = Number(option.legend?.itemWidth) || fontSize;
    let maxTextWidth = 0;
    for (const name of names) {
      let width = 0;
      for (const ch of name) width += ch.charCodeAt(0) > 11904 ? fontSize : fontSize * 0.55;
      width > maxTextWidth && (maxTextWidth = width);
    }
    const legendWidth = itemWidth + 8 + maxTextWidth + 14;
    const isLineChart = chartNode.child(`plotArea`).child(`lineChart`).exists();
    const seriesCount = Array.isArray(option.series) ? option.series.length : +!!option.series;
    const firstXAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
    const categoryCount = Array.isArray(firstXAxis?.data) ? firstXAxis.data.length : 0;
    const margin = Math.max(84, Math.round(legendWidth + (isLineChart ? (position === `r` && isLineChart && seriesCount === 1 && categoryCount >= 20 ? -10 : 0) : 18)));
    if ((typeof option.grid.left === `string` && option.grid.left.includes(`%`)) || (typeof option.grid.right === `string` && option.grid.right.includes(`%`))) return;
    position === `r` ? (option.grid.right = margin) : (option.grid.left = margin);
  }
}

/** 原 GG：尺寸值解析（数字/百分比/缺省） */
function resolveSizeValue(value: unknown, total: number, fallback: number): number {
  if (typeof value === `number` && Number.isFinite(value)) return value;
  if (typeof value === `string`) {
    const text = value.trim();
    if (text.endsWith(`%`)) return (total * parseFloat(text)) / 100;
    const parsed = parseFloat(text);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/** 原 KG：grid 轴向净尺寸 */
function gridAxisSpan(grid: ChartOption | undefined, size: { w: number; h: number }, axis: `x` | `y`): number | undefined {
  if (!grid) return;
  const total = axis === `x` ? size.w : size.h;
  const first = Array.isArray(grid) ? grid[0] : grid;
  if (!first) return total;
  const leadKey = axis === `x` ? `left` : `top`;
  const trailKey = axis === `x` ? `right` : `bottom`;
  const lead = resolveSizeValue(first[leadKey], total, 0);
  const trail = resolveSizeValue(first[trailKey], total, 0);
  return Math.max(0, total - lead - trail);
}

/** 原 qG：按净尺寸推断最大刻度间隔数 */
function maxTickIntervals(axis: ChartOption, base: number, axisKind: `x` | `y`, size: { w: number; h: number }, grid: ChartOption | undefined, factor = 2.6): number {
  const span = gridAxisSpan(grid, size, axisKind);
  if (span === undefined || span <= 0) return base;
  const label = axis.axisLabel ?? {};
  const fontSize = typeof label.fontSize === `number` ? label.fontSize : 12;
  const minSlot = Math.max(28, fontSize * factor);
  const slots = Math.max(2, Math.floor(span / minSlot) + 1);
  return Math.max(1, Math.min(base, slots - 1));
}

/** 原 ZG：nice 刻度步长（1/2/5×10^n） */
function niceInterval(max: number, min: number, intervals = 5): number {
  if (max === 0 && min === 0) return 1;
  const span = max - Math.min(0, min);
  if (span === 0) return max > 0 ? max * 1.2 : 1;
  const raw = span / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const ratio = raw / magnitude;
  let step: number;
  if (ratio <= 1) step = magnitude;
  else if (ratio <= 2) step = 2 * magnitude;
  else if (ratio <= 5) step = 5 * magnitude;
  else step = 10 * magnitude;
  return step;
}

/** 原 YG：上取整到步长边界 */
function niceCeil(max: number, min: number, intervals = 5): number {
  const step = niceInterval(max, min, intervals);
  const ceil = Math.ceil(max / step) * step;
  return ceil <= max ? ceil + step : ceil;
}

/** 原 XG：下取整到步长边界 */
function niceFloor(min: number, _max: number, intervals = 5): number {
  const step = niceInterval(_max, min, intervals);
  const floor = Math.floor(min / step) * step;
  return floor >= min ? floor - step : floor;
}

/**
 * 原 JG：值轴范围/刻度自动推断——收集各序列值（堆叠求和），
 * 散点双值轴分别处理；柱状图 10 段、其余 8 段；
 * 全非负时下界归零。
 */
function inferValueAxisBounds(size: { w: number; h: number }, option: ChartOption): void {
  if (!option.xAxis && !option.yAxis) return;
  const flatValues: number[] = [];
  const xPairValues: number[] = [];
  const yPairValues: number[] = [];
  const seriesList = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const stackGroups = new Map<string, { axisIndex: number; values: number[][] }>();
  const unstacked: number[] = [];
  const byAxis = new Map<number, number[]>();
  const pushByAxis = (axisIndex: number, values: number[]) => {
    byAxis.has(axisIndex) || byAxis.set(axisIndex, []);
    byAxis.get(axisIndex)!.push(...values);
  };
  for (const series of seriesList) {
    if (!series.data) continue;
    const seriesValues: number[] = [];
    for (const item of series.data) {
      if (typeof item === `number`) seriesValues.push(item);
      else if (item && typeof item === `object` && `value` in item && typeof item.value === `number`) seriesValues.push(item.value);
      else if (Array.isArray(item)) {
        item.length >= 2 && typeof item[0] === `number` && typeof item[1] === `number` && (xPairValues.push(item[0]), yPairValues.push(item[1]));
        for (const v of item) typeof v === `number` && seriesValues.push(v);
      } else seriesValues.push(0);
    }
    const axisIndex = typeof series.yAxisIndex === `number` && Number.isFinite(series.yAxisIndex) ? series.yAxisIndex : 0;
    if (series.stack) {
      const key = `${axisIndex}:${String(series.stack)}`;
      stackGroups.has(key) || stackGroups.set(key, { axisIndex, values: [] });
      stackGroups.get(key)!.values.push(seriesValues);
    } else unstacked.push(...seriesValues), pushByAxis(axisIndex, seriesValues);
  }
  for (const group of stackGroups.values()) {
    const sums: number[] = [];
    const length = Math.max(...group.values.map((v) => v.length));
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (const values of group.values) sum += values[i] ?? 0;
      sums.push(sum);
      flatValues.push(sum);
    }
    pushByAxis(group.axisIndex, sums);
  }
  flatValues.push(...unstacked);
  const hasBar = seriesList.some((s) => s.type === `bar`);
  const hasOther = seriesList.some((s) => s.type && s.type !== `bar`);
  const barOnly = hasBar && !hasOther;
  const baseIntervals = barOnly ? 10 : 8;
  const factor = barOnly ? 2.6 : 2;
  if (flatValues.length === 0) return;
  const isScatter =
    xPairValues.length > 0 &&
    yPairValues.length > 0 &&
    (Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis)?.type === `value` &&
    (Array.isArray(option.yAxis) ? option.yAxis[0] : option.yAxis)?.type === `value`;
  const fixAxis = (axis: ChartOption | undefined, values: number[], smallSpanIntervals: number) => {
    if (!axis || axis.type !== `value` || values.length === 0 || (axis.min !== undefined && axis.max !== undefined)) return;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = niceInterval(max, min, smallSpanIntervals);
    if (axis.max === undefined) {
      let ceil = niceCeil(max, min, smallSpanIntervals);
      ceil > max && ceil - max < step * 0.25 && (ceil += step);
      axis.max = ceil;
    }
    axis.min === undefined && min >= 0 && (axis.min = 0);
    axis.interval === undefined && (axis.interval = step);
  };
  const smallSpanIntervals = (values: number[]) => {
    if (values.length === 0) return 8;
    const min = Math.min(...values);
    return Math.max(...values) - Math.min(0, min) <= 3 ? 3 : 8;
  };
  if (isScatter) {
    const xAxes = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis];
    const yAxes = Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis];
    xAxes.forEach((axis: ChartOption) => fixAxis(axis, xPairValues, smallSpanIntervals(xPairValues)));
    yAxes.forEach((axis: ChartOption) => fixAxis(axis, yPairValues, smallSpanIntervals(yPairValues)));
    return;
  }
  const fixAxisFamily = (family: ChartOption | ChartOption[] | undefined, axisKind: `x` | `y`, perAxis?: Map<number, number[]>) => {
    family &&
      (Array.isArray(family) ? family : [family]).forEach((axis: ChartOption, index: number) => {
        if (!axis || axis.type !== `value` || (axis.min !== undefined && axis.max !== undefined)) return;
        const values = perAxis?.get(index) ?? flatValues;
        if (values.length === 0) return;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const intervals = maxTickIntervals(axis, baseIntervals, axisKind, size, option.grid, factor);
        const step = niceInterval(max, min, intervals);
        if (axis.max === undefined) {
          let ceil = niceCeil(max, min, intervals);
          intervals > 1 && ceil > max && ceil - max < step * 0.25 && (ceil += step);
          axis.max = ceil;
        }
        axis.min === undefined && min >= 0 ? (axis.min = 0) : axis.min === undefined && min < 0 && (axis.min = niceFloor(min, max, intervals));
        axis.interval === undefined && (axis.interval = step);
      });
  };
  fixAxisFamily(option.xAxis, `x`);
  fixAxisFamily(option.yAxis, `y`, byAxis);
}

/* --- 标题字号/背景/边框/图例图标（原 QG..rK，jsx 42401-42700） --- */

/** 原 QG：txPr defRPr 字号（pt → px 96dpi） */
function chartTitleFontSizePx(chartSpace: XmlNode): number | undefined {
  const txPr = chartSpace.child(`txPr`);
  if (txPr.exists()) {
    for (const p of txPr.children(`p`)) {
      const pPr = p.child(`pPr`);
      if (!pPr.exists()) continue;
      const defRPr = pPr.child(`defRPr`);
      if (!defRPr.exists()) continue;
      const size = defRPr.numAttr(`sz`);
      if (size !== undefined && size > 0) return Math.round((size / 100) * (96 / 72));
    }
  }
  return undefined;
}

/** 原 $G：chartSpace/plotArea 背景色 */
function chartBackgrounds(chartSpace: XmlNode, chart: XmlNode, ctx: PptxRenderContext): { chartBg?: string; plotAreaBg?: string } {
  let chartBg: string | undefined;
  let plotAreaBg: string | undefined;
  const spPr = chartSpace.child(`spPr`);
  if (spPr.exists() && !spPr.child(`noFill`).exists()) {
    const solid = spPr.child(`solidFill`);
    chartBg = solid.exists() ? chartColorHex(solid, ctx) : `#ffffff`;
  }
  const plotArea = chart.child(`plotArea`);
  if (plotArea.exists()) {
    const plotSpPr = plotArea.child(`spPr`);
    if (plotSpPr.exists() && !plotSpPr.child(`noFill`).exists()) {
      const solid = plotSpPr.child(`solidFill`);
      solid.exists() && (plotAreaBg = chartColorHex(solid, ctx));
    }
  }
  return { chartBg, plotAreaBg };
}

/** 原 eK：chartSpace 边框（spPr ln） */
function chartFrameStyle(chartSpace: XmlNode, ctx: PptxRenderContext): { borderColor: string; borderWidth: number; borderStyle: string } | undefined {
  const line = chartLineStyle(chartSpace.child(`spPr`).child(`ln`), ctx);
  if (line) return { borderColor: line.color, borderWidth: line.width, borderStyle: line.type };
  return undefined;
}

/**
 * 原 tK：图例图标 → 内联 SVG（rect/circle/diamond/path://，
 * 折线类图标中央叠加 marker 形状）。
 */
function renderLegendIconSvg(
  icon: string | undefined,
  color: string,
  width: number,
  height: number,
  strokeWidth = 2,
  marker?: string,
  markerSize?: number,
): SVGSVGElement | null {
  if (icon === `none`) return null;
  const ns = `http://www.w3.org/2000/svg`;
  const svg = document.createElementNS(ns, `svg`);
  svg.setAttribute(`width`, String(width));
  svg.setAttribute(`height`, String(height));
  svg.setAttribute(`viewBox`, `0 0 ${width} ${height}`);
  svg.style.display = `block`;
  const kind = icon ?? `rect`;
  if (kind.startsWith(`path://`)) {
    const path = document.createElementNS(ns, `path`);
    path.setAttribute(`d`, kind.slice(7));
    path.setAttribute(`fill`, `none`);
    path.setAttribute(`stroke`, color);
    path.setAttribute(`stroke-width`, String(strokeWidth));
    path.setAttribute(`stroke-linecap`, `round`);
    svg.appendChild(path);
    if (marker && marker !== `none`) {
      const cx = width / 2;
      const cy = height / 2;
      const side = Math.min(width, height, markerSize === undefined ? Math.max(3, height * 0.55) : Math.max(3, markerSize));
      if (marker === `diamond`) {
        const shape = document.createElementNS(ns, `path`);
        shape.setAttribute(`d`, `M${cx} ${cy - side / 2} L${cx + side / 2} ${cy} L${cx} ${cy + side / 2} L${cx - side / 2} ${cy} Z`);
        shape.setAttribute(`fill`, color);
        svg.appendChild(shape);
      } else if (marker === `rect`) {
        const shape = document.createElementNS(ns, `rect`);
        shape.setAttribute(`x`, String(cx - side / 2));
        shape.setAttribute(`y`, String(cy - side / 2));
        shape.setAttribute(`width`, String(side));
        shape.setAttribute(`height`, String(side));
        shape.setAttribute(`fill`, color);
        svg.appendChild(shape);
      } else if (marker === `triangle`) {
        const shape = document.createElementNS(ns, `path`);
        shape.setAttribute(`d`, `M${cx} ${cy - side / 2} L${cx + side / 2} ${cy + side / 2} L${cx - side / 2} ${cy + side / 2} Z`);
        shape.setAttribute(`fill`, color);
        svg.appendChild(shape);
      } else {
        const shape = document.createElementNS(ns, `circle`);
        shape.setAttribute(`cx`, String(cx));
        shape.setAttribute(`cy`, String(cy));
        shape.setAttribute(`r`, String(side / 2));
        shape.setAttribute(`fill`, color);
        svg.appendChild(shape);
      }
    }
    return svg;
  }
  if (kind === `diamond`) {
    const path = document.createElementNS(ns, `path`);
    path.setAttribute(`d`, `M${width / 2} 1 L${width - 1} ${height / 2} L${width / 2} ${height - 1} L1 ${height / 2} Z`);
    path.setAttribute(`fill`, color);
    svg.appendChild(path);
    return svg;
  }
  if (kind === `circle`) {
    const circle = document.createElementNS(ns, `circle`);
    circle.setAttribute(`cx`, String(width / 2));
    circle.setAttribute(`cy`, String(height / 2));
    circle.setAttribute(`r`, String(Math.max(2, Math.min(width, height) / 2 - 1)));
    circle.setAttribute(`fill`, color);
    svg.appendChild(circle);
    return svg;
  }
  const rect = document.createElementNS(ns, `rect`);
  rect.setAttribute(`x`, `1`);
  rect.setAttribute(`y`, `1`);
  rect.setAttribute(`width`, String(Math.max(2, width - 2)));
  rect.setAttribute(`height`, String(Math.max(2, height - 2)));
  rect.setAttribute(`fill`, color);
  svg.appendChild(rect);
  return svg;
}

/** 原 nK：数字/百分比 → px */
function sizeToPx(value: number | string, total: number): string {
  if (typeof value === `number`) return `${value}px`;
  const text = value.trim();
  if (text.endsWith(`%`)) {
    const parsed = Number.parseFloat(text.slice(0, -1));
    if (!Number.isNaN(parsed)) return `${(parsed / 100) * total}px`;
  }
  return text;
}

/**
 * 原 rK：自定义图例（DOM 版）——垂直图例无左右锚定、水平图例无位置
 * 时返回 null（用 echarts 内建图例）。条目按名称匹配序列/雷达数据，
 * 图标按序列形状/颜色/线宽绘制。
 */
function buildCustomLegendHtml(option: ChartOption, size: { w: number; h: number }): HTMLElement | null {
  const legend = firstLegend(option.legend);
  if (!legend || legend.show === false) return null;
  const vertical = legend.orient === `vertical`;
  const horizontal = legend.orient === `horizontal` || legend.orient === undefined;
  const hasPosition = legend.top !== undefined || legend.bottom !== undefined || legend.left !== undefined || legend.right !== undefined;
  if ((vertical && legend.left === undefined && legend.right === undefined) || (horizontal && !hasPosition)) return null;
  const colors = Array.isArray(option.color) ? option.color.filter((c: unknown): c is string => typeof c === `string`) : [];
  const legendData: (string | ChartOption)[] = legend.data ?? [];
  const seriesList: ChartOption[] = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const radarSeries = seriesList.length === 1 && seriesList[0]?.type === `radar` ? seriesList[0] : undefined;
  const radarData: ChartOption[] | undefined = Array.isArray(radarSeries?.data) ? radarSeries.data : undefined;
  const entries = legendData
    .map((item, index) => {
      const name = typeof item === `string` ? item : item.name;
      const icon = typeof item === `string` ? undefined : item.icon;
      const marker = typeof item === `string` ? undefined : item.marker;
      const itemObject = typeof item === `string` ? undefined : item;
      if (!name) return null;
      const seriesIndex = seriesList.findIndex((s) => s?.name === name);
      const radarIndex = radarData?.findIndex((d) => d.name === name) ?? -1;
      const seriesFallback = seriesIndex >= 0 ? seriesList[seriesIndex] : seriesList[index];
      const radarEntry = radarData && radarIndex >= 0 ? radarData[radarIndex] : radarData?.[index] ?? undefined;
      const colorSource = radarData ? radarEntry ?? itemObject ?? seriesFallback : itemObject ?? seriesFallback;
      const styleSource = radarEntry ?? seriesFallback;
      const sizeSource = radarEntry ?? seriesFallback ?? itemObject;
      const mergedLineStyle = { ...(styleSource?.lineStyle ?? {}), ...(itemObject?.lineStyle ?? {}) };
      const color = seriesColorOf(colorSource, colors[seriesIndex >= 0 ? seriesIndex : index] ?? `#2f6f8f`);
      const lineWidth = typeof mergedLineStyle.width === `number` && Number.isFinite(mergedLineStyle.width) ? Math.max(1, mergedLineStyle.width) : 2;
      const symbolSize = sizeSource?.symbolSize;
      const markerSize = typeof symbolSize === `number` && Number.isFinite(symbolSize) ? Math.max(3, symbolSize) : undefined;
      return { name, icon: icon ?? legend.icon, marker, markerSize, color, lineWidth };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
  if (entries.length === 0) return null;
  const host = document.createElement(`div`);
  host.className = `pptx-chart-custom-legend`;
  host.style.position = `absolute`;
  host.style.display = `flex`;
  host.style.flexDirection = vertical ? `column` : `row`;
  host.style.gap = vertical ? `6px` : `12px`;
  host.style.pointerEvents = `none`;
  host.style.zIndex = `1`;
  host.style.whiteSpace = `nowrap`;
  legend.left !== undefined && (host.style.left = sizeToPx(legend.left, size.w));
  legend.right !== undefined && (host.style.right = sizeToPx(legend.right, size.w));
  legend.width !== undefined && (host.style.width = sizeToPx(legend.width, size.w));
  legend.height !== undefined && (host.style.height = sizeToPx(legend.height, size.h));
  (legend.width !== undefined || legend.height !== undefined) &&
    ((host.style.boxSizing = `border-box`),
    horizontal
      ? ((host.style.alignItems = `center`), legend.width !== undefined && (host.style.justifyContent = `center`))
      : (legend.width !== undefined && (host.style.alignItems = `center`), legend.height !== undefined && (host.style.justifyContent = `center`)));
  legend.orient === `vertical` && (legend.left !== undefined || legend.right !== undefined)
    ? legend.top === `middle`
      ? ((host.style.top = `${size.h / 2}px`), (host.style.transform = `translateY(-50%)`))
      : legend.top === undefined
        ? legend.bottom === undefined && ((host.style.top = `${size.h / 2}px`), (host.style.transform = `translateY(-50%)`))
        : (host.style.top = sizeToPx(legend.top, size.h))
    : legend.top !== undefined && (host.style.top = sizeToPx(legend.top, size.h));
  legend.bottom !== undefined && (host.style.bottom = sizeToPx(legend.bottom, size.h));
  horizontal && legend.left === undefined && legend.right === undefined && ((host.style.left = `50%`), (host.style.transform = `translateX(-50%)`));
  const fontSize = legend.textStyle?.fontSize ?? 10;
  const iconWidth = legend.itemWidth ?? fontSize;
  const iconHeight = legend.itemHeight ?? fontSize;
  for (const entry of entries) {
    const row = document.createElement(`div`);
    row.style.display = `flex`;
    row.style.alignItems = `center`;
    row.style.gap = `6px`;
    const markerPx = entry.marker && entry.marker !== `none` ? entry.markerSize : undefined;
    const w = markerPx === undefined ? iconWidth : Math.max(iconWidth, Math.ceil(markerPx));
    const h = markerPx === undefined ? iconHeight : Math.max(iconHeight, Math.ceil(markerPx));
    const iconSvg = renderLegendIconSvg(entry.icon, entry.color, w, h, entry.lineWidth, entry.marker, markerPx);
    iconSvg && row.appendChild(iconSvg);
    const label = document.createElement(`span`);
    label.textContent = entry.name;
    label.style.color = legend.textStyle?.color ?? `#000000`;
    label.style.fontSize = `${fontSize}px`;
    legend.textStyle != null && legend.textStyle.fontFamily && (label.style.fontFamily = legend.textStyle.fontFamily);
    legend.textStyle?.fontWeight !== undefined && (label.style.fontWeight = String(legend.textStyle.fontWeight));
    row.appendChild(label);
    host.appendChild(row);
  }
  return host;
}

/* --- 图表标题（原 iK..oK，jsx 42701-42760） --- */

/** 原 iK：标题文本——autoTitleDeleted 优先；无 title 时单序列名兜底 */
function chartAutoTitle(chartTypeNode: XmlNode, series: ChartSeriesData[]): string | undefined {
  const autoDeleted = chartTypeNode.child(`autoTitleDeleted`);
  if (chartBoolDefaultTrue(autoDeleted)) return;
  const title = chartTypeNode.child(`title`);
  if (title.exists()) return chartTitleText(title);
  return autoDeleted.exists() && !chartBoolDefaultTrue(autoDeleted) && series && series.length === 1 && series[0].name ? series[0].name : undefined;
}

/** 原 aK：echarts title 配置（富文本优先，手动布局定位） */
function buildChartTitle(chartTypeNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext, fontSize: number): ChartOption | undefined {
  const text = chartAutoTitle(chartTypeNode, series);
  if (!text) return;
  const titleNode = chartTypeNode.child(`title`);
  const rich = chartRichTitle(titleNode, ctx);
  const style = buildRichStyle(chartTitleStyle(titleNode, ctx));
  const layout = chartTitleManualLayout(chartTypeNode);
  return {
    text: rich?.text ?? text,
    left: `center`,
    ...layout,
    textStyle: { fontSize, ...(style ?? {}), ...(rich ? { rich: rich.rich } : {}) },
  };
}

/** 原 oK：title 手动布局 → left/top 百分比 */
function chartTitleManualLayout(chartTypeNode: XmlNode): Record<string, string> {
  const layout = chartTypeNode.child(`title`).child(`layout`).child(`manualLayout`);
  if (!layout.exists()) return {};
  const out: Record<string, string> = {};
  const x = layout.child(`x`).numAttr(`val`);
  const y = layout.child(`y`).numAttr(`val`);
  x !== undefined && (out.left = percentCss(x));
  y !== undefined && (out.top = percentCss(y));
  return out;
}

/* --- 饼图布局（原 sK..lK，jsx 42761-42810） --- */

/** 原 sK：饼图中心/半径——按图例方位偏移；圆环按 holeSize 内径 */
function pieLayout(
  legend: ChartLegendInfo | undefined,
  doughnut: boolean,
  hasVisibleLabels: boolean,
  holeSize = 50,
  hasExplosion = false,
): { center: string[]; radius: string | string[] } {
  const side = legendSide(legend);
  let center = [`50%`, `55%`];
  let outer = hasVisibleLabels ? 78 : 82;
  if (side === `right`) {
    if (doughnut && hasExplosion) {
      center = [`45%`, `55%`];
      outer = 76;
    } else if (doughnut) {
      center = [`39%`, `54%`];
      outer = 87;
    } else {
      center = [`38%`, `55%`];
      outer = 82;
    }
  } else if (side === `left`) {
    center = [`62%`, `55%`];
    outer = 82;
  } else if (side === `top`) center = [`50%`, `60%`];
  else if (side === `bottom`) center = [`50%`, `45%`];
  (side === `top` || side === `bottom`) && (outer -= 4);
  if (!doughnut) return { center, radius: `${outer}%` };
  const inner = Math.round((Math.min(Math.max(holeSize, 10), 90) / 100) * outer);
  return { center, radius: [`${inner}%`, `${outer}%`] };
}

/** 原 cK：爆炸偏移（圆环减半） */
function explosionOffset(value: number, doughnut = false): number {
  return doughnut ? value : Math.round(value * 0.5);
}

/** 原 lK：firstSliceAng → echarts startAngle（OOXML 顺时针 0=右 → echarts 0=上） */
function pieStartAngle(firstSliceAng: number | undefined): number | undefined {
  if (firstSliceAng === undefined || !Number.isFinite(firstSliceAng)) return undefined;
  return ((90 - firstSliceAng) % 360 + 360) % 360;
}

/* --- marker 映射与平滑（原 uK..yK，jsx 42811-42856） --- */

const MARKER_SYMBOL_MAP: Record<string, string> = {
  circle: `circle`,
  square: `rect`,
  diamond: `diamond`,
  triangle: `triangle`,
  none: `none`,
  star: `circle`,
  dash: `circle`,
  dot: `circle`,
  plus: `circle`,
  x: `circle`,
}; // 原 uK

/** 原 dK：OOXML marker → echarts symbol */
function mapMarkerSymbol(symbol: string | undefined): string | undefined {
  if (symbol) return MARKER_SYMBOL_MAP[symbol] ?? `circle`;
  return undefined;
}

const LINE_MARKER_CYCLE = [`diamond`, `rect`, `triangle`, `circle`]; // 原 fK
const SCATTER_MARKER_CYCLE = [`diamond`, `square`, `triangle`, `circle`]; // 原 pK
const DEFAULT_MARKER_SIZE_PT = hundredthToPt(9); // 原 mK
const SCATTER_MARKER_SIZE = DEFAULT_MARKER_SIZE_PT; // 原 hK
const BUBBLE_BASE_SIZE = 120; // 原 gK

/** 原 _K：折线类散点符号轮转 */
function lineMarkerForIndex(style: string, index: number): string {
  return style === `lineMarker` || style === `smoothMarker` ? LINE_MARKER_CYCLE[index % LINE_MARKER_CYCLE.length] : `circle`;
}

/** 原 vK：散点符号轮转 */
function scatterMarkerForIndex(index: number): string {
  return SCATTER_MARKER_CYCLE[index % SCATTER_MARKER_CYCLE.length];
}

/**
 * 原 yK：Hermite 平滑插值——x 单调递增时把折线加密成
 * 每段 24 点的平滑曲线（切数取相邻斜率均值 ×0.3）。
 */
function smoothInterpolatePoints(points: [number, number][], segments = 24): [number, number][] {
  if (points.length < 3) return points;
  for (let i = 1; i < points.length; i++) if (points[i][0] <= points[i - 1][0]) return points;
  const count = points.length;
  const slopes = Array<number>(count - 1);
  for (let i = 0; i < count - 1; i++) slopes[i] = (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]);
  const tangents = Array<number>(count);
  tangents[0] = slopes[0];
  tangents[count - 1] = slopes[count - 2] * 1.2;
  for (let i = 1; i < count - 1; i++) tangents[i] = ((slopes[i - 1] + slopes[i]) / 2) * 0.3;
  const out: [number, number][] = [[points[0][0], points[0][1]]];
  for (let i = 0; i < count - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const dx = x1 - x0;
    const m0 = tangents[i];
    const m1 = tangents[i + 1];
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
      const h10 = t ** 3 - 2 * t ** 2 + t;
      const h01 = -2 * t ** 3 + 3 * t ** 2;
      const h11 = t ** 3 - t ** 2;
      const x = x0 + dx * t;
      const y = h00 * y0 + h10 * dx * m0 + h01 * y1 + h11 * dx * m1;
      out.push([Number(x.toFixed(4)), Number(y.toFixed(4))]);
    }
  }
  return out;
}

/* --- 标签/堆叠/空白工具（原 bK..WK，jsx 42811-42856 后段） --- */

/** 原 bK：手动布局是否非空 */
function hasManualLayout(layout: Record<string, unknown>): boolean {
  return layout.left !== undefined || layout.top !== undefined || layout.width !== undefined || layout.height !== undefined;
}

/** 原 xK：柱状图 dLblPos → echarts position（堆叠默认 inside） */
function barLabelPosition(position: string | undefined, stacked: boolean): string {
  switch (position) {
    case `outEnd`:
      return `top`;
    case `inEnd`:
      return `insideTop`;
    case `ctr`:
      return `inside`;
    case `inBase`:
      return `insideBottom`;
    default:
      return stacked ? `inside` : `top`;
  }
}

/** 原 SK：折线图 dLblPos → echarts position */
function lineLabelPosition(position: string | undefined): string {
  switch (position) {
    case `l`:
      return `left`;
    case `r`:
      return `right`;
    case `b`:
      return `bottom`;
    case `ctr`:
      return `top`;
    default:
      return `top`;
  }
}

/** 原 CK：标签盒样式（背景/边框/内边距） */
function labelBoxCss(config: Partial<ChartLabelConfig>): Record<string, unknown> {
  return {
    ...(config.backgroundColor ? { backgroundColor: config.backgroundColor } : {}),
    ...(config.borderColor ? { borderColor: config.borderColor } : {}),
    ...(config.borderWidth === undefined ? {} : { borderWidth: config.borderWidth }),
    ...(config.padding ? { padding: config.padding } : {}),
  };
}

/** 原 wK：tooltip 行高 CSS */
function tooltipLineHeightCss(style: ChartTextStyle | undefined): string | undefined {
  const fontSize = style?.fontSize;
  if (fontSize !== undefined) return `font-size: ${fontSize}px; line-height: ${Math.max(fontSize + 5, Math.round(fontSize * 1.45))}px;`;
  return undefined;
}

/** 原 TK：grouping（缺省 clustered） */
function chartGrouping(chartTypeNode: XmlNode, fallback = `clustered`): string {
  const grouping = chartTypeNode.child(`grouping`);
  return (grouping.exists() && grouping.attr(`val`)) || fallback;
}

/** 原 EK：堆叠判定 */
function isStackedGrouping(grouping: string): boolean {
  return grouping === `stacked` || grouping === `percentStacked`;
}

/** 原 DK：百分比堆叠判定 */
function isPercentStackedGrouping(grouping: string): boolean {
  return grouping === `percentStacked`;
}

/** 原 OK：百分比堆叠归一（负值按 0） */
function percentStackValues(series: ChartSeriesData[]): number[][] {
  const count = Math.max(0, ...series.map((s) => s.values.length));
  const totals = Array<number>(count).fill(0);
  for (const s of series) for (let i = 0; i < count; i++) totals[i] += Math.max(s.values[i] ?? 0, 0);
  return series.map((s) =>
    s.values.map((value, i) => {
      const total = totals[i] ?? 0;
      return total === 0 ? 0 : Number((Math.max(value, 0) / total).toFixed(6));
    }),
  );
}

/** 原 kK：百分比轴（0..1，步长 0.1，百分比标签） */
function applyPercentAxis(axis: ChartOption): void {
  axis.min = 0;
  axis.max = 1;
  axis.interval = 0.1;
  axis.axisLabel = { ...(axis.axisLabel || {}), formatter: (value: number) => formatChartValue(value, `0%`) };
}

/** 原 AK：HSL 调色（饱和度/亮度/色相偏移） */
function adjustColorHsl(hex: string, adjust: { hueOffset?: number; saturationScale: number; lightnessOffset: number }): string {
  const normalized = hex.startsWith(`#`) ? hex : `#${hex}`;
  const { r, g, b } = hexToRgb(normalized);
  const { h, s, l } = rgbToHsl(r, g, b);
  const adjusted = hslToRgb(
    h + (adjust.hueOffset ?? 0),
    Math.min(1, s * adjust.saturationScale),
    Math.max(0, Math.min(1, l + adjust.lightnessOffset)),
  );
  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/** 原 jK：雷达面积渐变（亮 → 深） */
function radarAreaGradient(hex: string): ChartLinearGradient {
  return {
    type: `linear`,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: adjustColorHsl(hex, { saturationScale: 1.95, lightnessOffset: 0.217 }) },
      { offset: 1, color: adjustColorHsl(hex, { hueOffset: -5, saturationScale: 1.7, lightnessOffset: -0.128 }) },
    ],
  };
}

/** 原 MK：参与极值统计的值集合（堆叠按列求和，跳过空白） */
function chartExtentValues(series: ChartSeriesData[], stacked: boolean): number[] {
  if (!stacked)
    return series.flatMap((s) => s.values.filter((_, i) => !s.blankIndices?.has(i)));
  const count = Math.max(0, ...series.map((s) => s.values.length));
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    let sum = 0;
    let any = false;
    for (const s of series) s.blankIndices?.has(i) || ((sum += s.values[i] ?? 0), (any = true));
    any && out.push(sum);
  }
  return out;
}

/** 原 NK：面积图值轴范围（堆叠上界多留一段） */
function applyAreaAxisBounds(axis: ChartOption, series: ChartSeriesData[], stacked: boolean): void {
  const values = chartExtentValues(series, stacked).filter((v) => Number.isFinite(v));
  if (values.length === 0) return;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = niceInterval(max, min, 8);
  axis.min === undefined && min >= 0 && (axis.min = 0);
  axis.interval === undefined && (axis.interval = step);
  if (axis.max === undefined) {
    if (stacked) axis.max = Math.ceil(max / step) * step + step;
    else {
      let ceil = niceCeil(max, min, 8);
      ceil > max && ceil - max < step * 0.25 && (ceil += step);
      axis.max = ceil;
    }
  }
}

/** 原 PK：饼图 dLblPos → inside/outside */
function pieLabelPosition(position: string | undefined): string {
  switch (position) {
    case `ctr`:
    case `inEnd`:
    case `inBase`:
      return `inside`;
    default:
      return `outside`;
  }
}

/** 原 FK：共享标签 + 点覆盖合并 */
function mergeLabelConfig(shared: ChartLabelConfig | undefined, override?: Partial<ChartLabelConfig>): ChartLabelConfig | undefined {
  if (!shared && !override) return undefined;
  return {
    showVal: shared?.showVal ?? false,
    showCatName: shared?.showCatName ?? false,
    showSerName: shared?.showSerName ?? false,
    showPercent: shared?.showPercent ?? false,
    position: shared?.position,
    showLeaderLines: shared?.showLeaderLines,
    manualLayout: shared?.manualLayout,
    color: shared?.color,
    fontSize: shared?.fontSize,
    bold: shared?.bold,
    backgroundColor: shared?.backgroundColor,
    borderColor: shared?.borderColor,
    borderWidth: shared?.borderWidth,
    padding: shared?.padding,
    ...override,
  };
}

/** 原 IK：dLbls 节点（序列级优先，回退图表类型级） */
function labelsNode(ser: XmlNode | undefined, chartTypeNode: XmlNode): XmlNode {
  const own = ser?.child(`dLbls`);
  return own != null && own.exists() ? own : chartTypeNode.child(`dLbls`);
}

/** 原 LK：标签是否显示（任一开关） */
function labelsVisible(config: ChartLabelConfig | undefined): boolean {
  return !!(config && !config.deleted && (config.showVal || config.showCatName || config.showSerName || config.showPercent));
}

/** 原 RK：dispBlanksAs（gap/zero/span） */
function chartBlankMode(chartNode: XmlNode): `gap` | `zero` | `span` {
  const mode = chartNode.child(`dispBlanksAs`).attr(`val`);
  return mode === `zero` || mode === `span` ? mode : `gap`;
}

/** 原 zK：空白点取值（zero → 0，gap → null） */
function blankPointValue(series: ChartSeriesData, index: number, value: number, mode: `gap` | `zero` | `span`): number | null {
  return series.blankIndices?.has(index) ? (mode === `zero` ? 0 : null) : value;
}

/** 原 BK：全序列一致的 formatCode */
function commonFormatCode(series: ChartSeriesData[]): string | undefined {
  const first = series[0]?.formatCode;
  if (first) return series.every((s) => s.formatCode === first) ? first : undefined;
  return undefined;
}

/** 原 VK：饼图标签 → echarts label */
function buildPieLabel(config: ChartLabelConfig | undefined, formatCode: string | undefined, seriesName: string | undefined): ChartOption | undefined {
  if (!config || !labelsVisible(config)) return;
  const merged = config;
  const label: ChartOption = {
    show: true,
    formatter: (params: ChartOption) => {
      const parts: string[] = [];
      merged.showSerName && seriesName && parts.push(seriesName);
      merged.showCatName && parts.push(params.name);
      merged.showVal && parts.push(formatChartValue(params.value, formatCode));
      merged.showPercent && parts.push(`${params.percent}%`);
      return parts.join(` `);
    },
    fontSize: merged.fontSize ?? 10,
    ...(merged.bold === true ? { fontWeight: `bold` } : {}),
    ...(merged.color ? { color: merged.color } : {}),
    position: pieLabelPosition(merged.position),
    ...labelBoxCss(merged),
  };
  return merged.fontSize === undefined ? label : markExplicitFontSize(label);
}

/** 原 HK：手动布局 → labelLayout 回调（按数据点矩形换算） */
function buildLabelLayout(layouts: Map<number, { x?: number; y?: number; width?: number; height?: number }>): ((params: ChartOption) => ChartOption) | undefined {
  return layouts.size === 0
    ? undefined
    : (params) => {
        if (params.dataIndex === undefined) return {};
        const layout = layouts.get(params.dataIndex);
        if (!layout) return {};
        const rect = params.rect;
        const out: ChartOption = {};
        layout.x !== undefined && (out.x = rect ? rect.x + rect.width * layout.x : percentCss(layout.x));
        layout.y !== undefined && (out.y = rect ? rect.y + rect.height * layout.y : percentCss(layout.y));
        layout.width !== undefined && (out.width = rect ? rect.width * layout.width : percentCss(layout.width));
        layout.height !== undefined && (out.height = rect ? rect.height * layout.height : percentCss(layout.height));
        return out;
      };
}

/** 原 UK：多序列分类并集（保序去重） */
function unionCategories(series: ChartSeriesData[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of series) {
    for (const category of s.categories) {
      seen.has(category) || (seen.add(category), out.push(category));
    }
  }
  return out;
}

/** 原 WK：多饼图半径切片（按序号分段） */
function splitPieRadius(radius: string | string[], index: number, count: number): string | string[] {
  if (!Array.isArray(radius) || count <= 1) return radius;
  const inner = Number.parseFloat(radius[0]);
  const outer = Number.parseFloat(radius[1]);
  if (!Number.isFinite(inner) || !Number.isFinite(outer) || outer <= inner) return radius;
  const band = (outer - inner - 1 * (count - 1)) / count;
  const start = Math.round(inner + index * (band + 1));
  const end = Math.round(start + band);
  return [`${start}%`, `${end}%`];
}

/* ============================================================================
 * 图表类型构建器（原 GK..eq，jsx 42857-43997）
 * ==========================================================================*/

/**
 * 原 GK：柱状图/条形图（含堆叠/百分比堆叠、逐点着色、数据标签、
 * 空白处理、负值反色、条宽/间距换算）。
 */
function buildBarChart(chartTypeNode: XmlNode, chartNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext): ChartOption {
  const barDir = chartTypeNode.child(`barDir`).attr(`val`) || chartTypeNode.attr(`barDir`) || `col`;
  const grouping = chartGrouping(chartTypeNode);
  const horizontal = barDir === `bar`;
  const gapWidth = chartTypeNode.child(`gapWidth`).numAttr(`val`) ?? 150;
  const overlap = chartTypeNode.child(`overlap`).numAttr(`val`);
  const categories = series.find((s) => s.categories.length > 0)?.categories || [];
  const title = buildChartTitle(chartTypeNode, series, ctx, 12);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const stacked = isStackedGrouping(grouping);
  const percentStacked = isPercentStackedGrouping(grouping);
  const percentValues = percentStacked ? percentStackValues(series) : undefined;
  const blankMode = chartBlankMode(chartNode);
  const varyColorsNode = chartTypeNode.child(`varyColors`);
  const autoVary = series.length === 1 && series[0].values.length > 1 && !stacked && !percentStacked && !series[0].colorHex;
  const varyColors = varyColorsNode.exists() ? chartBoolDefaultTrue(varyColorsNode) : autoVary;
  const palette = chartBarPalette(ctx, { darken: !horizontal });
  let sharedLabels = parseChartLabels(chartTypeNode, ctx);
  if (!sharedLabels) {
    const firstSer = chartTypeNode.children(`ser`)[0];
    firstSer != null && firstSer.exists() && (sharedLabels = parseChartLabels(firstSer, ctx));
  }
  const orderedSerNodes = chartTypeNode
    .children(`ser`)
    .map((ser, i) => ({ ser, order: ser.child(`order`).numAttr(`val`) ?? i }))
    .sort((a, b) => a.order - b.order)
    .map((e) => e.ser);
  const barSeries = series.map((s, i) => {
    const formatCode = s.formatCode;
    const labels = parseChartLabels(orderedSerNodes[i] ?? chartTypeNode, ctx) ?? sharedLabels;
    const makeLabel = (config: ChartLabelConfig | undefined) => {
      if (!(config != null && config.showVal)) return;
      const label: ChartOption = {
        show: true,
        position: barLabelPosition(config.position, stacked),
        fontSize: config.fontSize ?? 9,
        ...(config.color ? { color: config.color } : {}),
        ...(config.bold === true ? { fontWeight: `bold` } : {}),
        ...labelBoxCss(config),
        formatter: (params: ChartOption) => {
          const raw = params?.value;
          const value = raw && typeof raw === `object` && `value` in raw ? raw.value : raw;
          return value === 0 || value === null ? `` : formatChartValue(value, percentStacked ? `0%` : formatCode);
        },
      };
      return config.fontSize === undefined ? label : markExplicitFontSize(label);
    };
    const seriesLabel = makeLabel(labels);
    const pointLabels = parseChartPointLabels(labelsNode(orderedSerNodes[i], chartTypeNode), ctx);
    const data = (percentValues?.[i] ?? s.values).map((value, pointIndex) => {
      const override = pointLabels.get(pointIndex);
      const displayValue = s.values[pointIndex] ?? value;
      const pointValue = blankPointValue(s, pointIndex, value, blankMode);
      const pointStyle = s.dataPointStyles?.[pointIndex];
      let itemStyle: ChartOption | undefined;
      if (pointStyle) {
        itemStyle = {
          ...(pointStyle.color ? { color: pointStyle.color } : {}),
          ...(pointStyle.borderColor ? { borderColor: pointStyle.borderColor } : {}),
          ...(pointStyle.borderWidth === undefined ? {} : { borderWidth: pointStyle.borderWidth }),
          ...(pointStyle.borderType ? { borderType: pointStyle.borderType } : {}),
        };
      } else if (s.invertIfNegative !== false && displayValue < 0) {
        itemStyle = { color: `#FFFFFF`, borderColor: `#000000`, borderWidth: 1 };
      } else if (varyColors && !s.colorHex && palette.length > 0) {
        itemStyle = { color: palette[pointIndex % palette.length] };
      }
      let pointLabel: ChartOption | undefined;
      if (override != null && override.deleted) pointLabel = { show: false };
      else if (override) {
        pointLabel = makeLabel(
          mergeLabelConfig(labels, {
            showVal: labels?.showVal ?? false,
            showCatName: labels?.showCatName ?? false,
            showSerName: labels?.showSerName ?? false,
            showPercent: labels?.showPercent ?? false,
            position: labels?.position,
            showLeaderLines: labels?.showLeaderLines,
            manualLayout: labels?.manualLayout,
            color: labels?.color,
            fontSize: labels?.fontSize,
            bold: labels?.bold,
            backgroundColor: labels?.backgroundColor,
            borderColor: labels?.borderColor,
            borderWidth: labels?.borderWidth,
            padding: labels?.padding,
            ...override,
          }),
        );
      }
      if (!itemStyle && !pointLabel) return pointValue;
      return { value: pointValue, ...(itemStyle ? { itemStyle } : {}), ...(pointLabel ? { label: pointLabel } : {}) };
    });
    return {
      type: `bar`,
      name: s.name,
      data,
      stack: stacked ? `total` : undefined,
      itemStyle: s.colorHex ? { color: s.colorHex } : undefined,
      label: seriesLabel,
      ...(s.formatCode ? { tooltip: { valueFormatter: (v: number) => formatChartValue(v, percentStacked ? `0%` : s.formatCode) } } : {}),
      barGap: overlap === undefined ? `0%` : `${-overlap}%`,
      barCategoryGap: gapWidth === undefined ? undefined : `${Math.round((gapWidth * 100) / (100 * (stacked ? 1 : series.length) + gapWidth))}%`,
    };
  });
  const { valueAxis, categoryAxis } = parseCategoryValueAxes(chartNode.child(`plotArea`), ctx, chartTypeNode);
  const categoryOption: ChartOption = {
    type: `category`,
    data: categories,
    axisLabel: { interval: 0, rotate: 0, fontSize: 10 },
  };
  applyAxisToOption(categoryOption, categoryAxis, `category`);
  const sharedFormat = commonFormatCode(series);
  const axisFormat = (percentStacked ? `0%` : undefined) || valueAxis.numFmt || (sharedFormat != null && sharedFormat.includes(`%`) ? sharedFormat : undefined);
  const valueOption: ChartOption = {
    type: `value`,
    ...(axisFormat ? { axisLabel: { formatter: (v: number) => formatChartValue(v, axisFormat) } } : {}),
  };
  percentStacked && applyPercentAxis(valueOption);
  applyAxisToOption(valueOption, valueAxis, `value`);
  const hasTitle = !!title;
  const top = horizontal && hasTitle ? 60 : chartTopMargin(hasTitle, legend);
  const legendOffset = legendTopOffset(hasTitle, legend);
  const left = horizontal ? 15 : valueAxis.deleted ? 4 : 18;
  const right = horizontal ? 28 : 10;
  const tooltipFormat = axisFormat || sharedFormat;
  const bottom = chartBottomMargin(legend);
  const manualGrid = plotAreaGridOption(chartNode);
  const containLabel = !hasManualLayout(manualGrid);
  return {
    title,
    tooltip: {
      trigger: `axis`,
      textStyle: tooltipStyle,
      extraCssText: tooltipLineHeightCss(tooltipStyle),
      ...(tooltipFormat ? { valueFormatter: (v: number | number[]) => formatChartValue(Array.isArray(v) ? v[0] : v, tooltipFormat) } : {}),
    },
    legend: buildLegendOption(legendOption, legend, legendOffset, series.map((s) => s.name), tooltipStyle),
    grid: { containLabel, left, right, top, bottom, ...manualGrid },
    xAxis: horizontal ? valueOption : categoryOption,
    yAxis: horizontal ? categoryOption : valueOption,
    series: barSeries,
  };
}

/**
 * 原 KK：折线/面积图（stacked/percentStacked、marker 轮转、
 * 平滑、空白连接、逐点标签、图例线条图标）。
 * @param area 面积模式（areaChart/area3D/surface3D）
 */
function buildLineChart(
  chartTypeNode: XmlNode,
  chartNode: XmlNode,
  series: ChartSeriesData[],
  ctx: PptxRenderContext,
  area: boolean,
  palette?: string[],
): ChartOption {
  const categories = series.find((s) => s.categories.length > 0)?.categories || [];
  const title = buildChartTitle(chartTypeNode, series, ctx, 14);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const grouping = chartGrouping(chartTypeNode, `standard`);
  const stacked = isStackedGrouping(grouping);
  const percentStacked = isPercentStackedGrouping(grouping);
  const percentValues = percentStacked ? percentStackValues(series) : undefined;
  const blankMode = chartBlankMode(chartNode);
  let sharedLabels = parseChartLabels(chartTypeNode, ctx);
  if (!sharedLabels) {
    const firstSer = chartTypeNode.children(`ser`)[0];
    firstSer != null && firstSer.exists() && (sharedLabels = parseChartLabels(firstSer, ctx));
  }
  const orderedSerNodes = chartTypeNode
    .children(`ser`)
    .map((ser, i) => ({ ser, order: ser.child(`order`).numAttr(`val`) ?? i }))
    .sort((a, b) => a.order - b.order)
    .map((e) => e.ser);
  const chartMarkerNode = chartTypeNode.child(`marker`);
  const chartMarkerOn = chartMarkerNode.exists() ? chartBoolDefaultTrue(chartMarkerNode) : undefined;
  const colorOf = (s: ChartSeriesData, index: number): string | ChartLinearGradient | undefined => s.colorHex ?? palette?.[index % palette.length];
  const colorCss = (s: ChartSeriesData, index: number): string | undefined => {
    const color = colorOf(s, index);
    return typeof color === `string` ? color : undefined;
  };
  const lineSeries = series.map((s, index) => {
    const color = colorOf(s, index);
    const symbol = mapMarkerSymbol(s.markerSymbol ?? (chartMarkerOn === true ? scatterMarkerForIndex(index) : chartMarkerOn === false ? `none` : undefined));
    const symbolVisible = symbol === undefined ? undefined : symbol !== `none`;
    const width = s.lineWidth ?? 3;
    const lineStyle: ChartOption = {
      ...(color ? { color } : {}),
      width,
      cap: `round`,
      join: `round`,
      ...(s.lineNoFill ? { opacity: 0 } : {}),
    };
    const formatCode = s.formatCode;
    const labels = parseChartLabels(orderedSerNodes[index] ?? chartTypeNode, ctx) ?? sharedLabels;
    const makeLabel = (config: ChartLabelConfig | undefined) => {
      if (!config || !labelsVisible(config)) return;
      const merged = config;
      const label: ChartOption = {
        show: true,
        position: lineLabelPosition(merged.position),
        fontSize: merged.fontSize ?? 9,
        ...(merged.color ? { color: merged.color } : {}),
        ...(merged.bold === true ? { fontWeight: `bold` } : {}),
        ...labelBoxCss(merged),
        formatter: (params: ChartOption) => {
          const raw = params?.value;
          const value = raw && typeof raw === `object` && `value` in raw ? raw.value : raw;
          const parts: string[] = [];
          merged.showSerName && params != null && params.seriesName && parts.push(params.seriesName);
          merged.showCatName && params != null && params.name && parts.push(params.name);
          merged.showVal && typeof value === `number` && parts.push(formatChartValue(value, percentStacked ? `0%` : formatCode));
          merged.showPercent && typeof params?.percent === `number` && parts.push(`${params.percent}%`);
          return parts.join(` `);
        },
      };
      return merged.fontSize === undefined ? label : markExplicitFontSize(label);
    };
    const seriesLabel = makeLabel(labels);
    const pointLabels = parseChartPointLabels(labelsNode(orderedSerNodes[index], chartTypeNode), ctx);
    const manualLayouts = new Map<number, { x?: number; y?: number; width?: number; height?: number }>();
    const data = (percentValues?.[index] ?? s.values).map((value, pointIndex) => {
      const pointValue = blankPointValue(s, pointIndex, value, blankMode);
      const override = pointLabels.get(pointIndex);
      if (!override) return pointValue;
      override.manualLayout && manualLayouts.set(pointIndex, override.manualLayout);
      const pointLabel = override.deleted ? { show: false } : makeLabel(mergeLabelConfig(labels, override));
      return pointLabel ? { value: pointValue, label: pointLabel } : pointValue;
    });
    const labelOnlyMarker = !!(seriesLabel != null && seriesLabel.show && symbol === `none`);
    const finalSymbol = labelOnlyMarker ? `circle` : symbol && symbol !== `none` ? symbol : undefined;
    const finalSize = labelOnlyMarker ? 0 : s.markerSize ?? (s.markerSymbol === undefined && chartMarkerOn === true ? DEFAULT_MARKER_SIZE_PT : undefined);
    const showSymbol = labelOnlyMarker ? true : area && symbol === undefined ? false : symbolVisible;
    const showAllSymbol = showSymbol === true && finalSymbol !== undefined && finalSymbol !== `none` && finalSize !== 0;
    return {
      type: `line`,
      name: s.name,
      data,
      stack: stacked ? `total` : undefined,
      areaStyle: area ? { ...(color ? { color } : {}), opacity: 1 } : undefined,
      itemStyle: color ? { color } : undefined,
      lineStyle,
      label: seriesLabel,
      labelLayout: buildLabelLayout(manualLayouts),
      connectNulls: blankMode === `span`,
      ...(s.smooth ? { smooth: true } : {}),
      ...(s.formatCode ? { tooltip: { valueFormatter: (v: number) => formatChartValue(v, percentStacked ? `0%` : s.formatCode) } } : {}),
      endLabel: { show: false },
      ...(finalSymbol ? { symbol: finalSymbol } : {}),
      ...(finalSize === undefined ? {} : { symbolSize: finalSize }),
      ...(showSymbol === undefined ? {} : { showSymbol }),
      ...(showAllSymbol ? { showAllSymbol: true } : {}),
      z: 3,
    };
  });
  const { valueAxis, categoryAxis } = parseCategoryValueAxes(chartNode.child(`plotArea`), ctx, chartTypeNode);
  const sharedFormat = commonFormatCode(series);
  const axisFormat = (percentStacked ? `0%` : undefined) || valueAxis.numFmt || (sharedFormat != null && sharedFormat.includes(`%`) ? sharedFormat : undefined);
  const valueOption: ChartOption = {
    type: `value`,
    ...(axisFormat ? { axisLabel: { formatter: (v: number) => formatChartValue(v, axisFormat) } } : {}),
  };
  percentStacked && applyPercentAxis(valueOption);
  applyAxisToOption(valueOption, valueAxis, `value`);
  !percentStacked && area && applyAreaAxisBounds(valueOption, series, stacked);
  const categoryOption: ChartOption = {
    type: `category`,
    data: categories,
    ...(area ? { boundaryGap: false } : {}),
    axisLabel: { interval: 0, rotate: 0 },
  };
  applyAxisToOption(categoryOption, categoryAxis, `category`);
  const top = chartTopMargin(!!title, legend);
  const legendOffset = legendTopOffset(!!title, legend);
  const left = valueAxis.deleted ? 4 : 18;
  const tooltipFormat = axisFormat || sharedFormat;
  const bottom = chartBottomMargin(legend);
  const manualGrid = plotAreaGridOption(chartNode);
  const containLabel = !hasManualLayout(manualGrid);
  const indexed = series.map((s, idx) => ({ series: s, idx }));
  const legendOrder = stacked || percentStacked ? [...indexed].reverse() : indexed;
  return {
    title,
    tooltip: {
      trigger: `axis`,
      textStyle: tooltipStyle,
      extraCssText: tooltipLineHeightCss(tooltipStyle),
      ...(tooltipFormat ? { valueFormatter: (v: number | number[]) => formatChartValue(Array.isArray(v) ? v[0] : v, tooltipFormat) } : {}),
    },
    legend: buildLegendOption(
      legendOption,
      legend,
      legendOffset,
      area
        ? legendOrder.map(({ series: s, idx }) => {
            const css = colorCss(s, idx);
            return css ? { name: s.name, itemStyle: { color: css } } : s.name;
          })
        : legendOrder.map(({ series: s, idx }) => {
            const symbol = mapMarkerSymbol(s.markerSymbol ?? (chartMarkerOn === true ? scatterMarkerForIndex(idx) : chartMarkerOn === false ? `none` : undefined));
            const css = colorCss(s, idx);
            const colorStyles = css ? { lineStyle: { color: css }, itemStyle: { color: css } } : {};
            return symbol && symbol !== `none`
              ? { name: s.name, icon: lineLegendIcon(), marker: symbol, ...colorStyles }
              : { name: s.name, icon: lineLegendIcon(), ...colorStyles };
          }),
      tooltipStyle,
    ),
    grid: { containLabel, left, right: 10, top, bottom, ...manualGrid },
    xAxis: categoryOption,
    yAxis: valueOption,
    series: lineSeries,
  };
}

/** 原 qK：饼图/圆环图（多序列切片、爆炸、引导线、逐点标签） */
function buildPieChart(chartTypeNode: XmlNode, chartNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext, doughnut: boolean): ChartOption {
  const title = buildChartTitle(chartTypeNode, series, ctx, 12);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const activeSeries = doughnut ? series : series.slice(0, 1);
  if (activeSeries.length === 0) return { title };
  const orderedSerNodes = chartTypeNode
    .children(`ser`)
    .map((ser, i) => ({ ser, order: ser.child(`order`).numAttr(`val`) ?? i }))
    .sort((a, b) => a.order - b.order)
    .map((e) => e.ser);
  const prepared = activeSeries.map((s, i) => {
    const serNode = orderedSerNodes[i];
    const sharedLabels = (serNode != null && serNode.exists() ? parseChartLabels(serNode, ctx) : undefined) ?? parseChartLabels(chartTypeNode, ctx);
    const labelsHost = labelsNode(serNode, chartTypeNode);
    const hasLabelsNode = (serNode?.exists() && serNode.child(`dLbls`).exists()) || chartTypeNode.child(`dLbls`).exists();
    const pointLabels = parseChartPointLabels(labelsHost, ctx);
    const anyPointVisible = [...pointLabels.values()].some((p) => labelsVisible(mergeLabelConfig(sharedLabels, p)));
    return {
      series: s,
      serNode,
      sharedLabels,
      pointLabels,
      labelsExplicitlyOff: hasLabelsNode && !sharedLabels && !anyPointVisible,
      explosions: serNode ? chartExplosions(serNode, s.categories.length) : undefined,
    };
  });
  const layout = pieLayout(
    legend,
    doughnut,
    prepared.some((p) => !p.labelsExplicitlyOff && (labelsVisible(p.sharedLabels) || [...p.pointLabels.values()].some((o) => labelsVisible(mergeLabelConfig(p.sharedLabels, o))))),
    doughnut ? chartTypeNode.child(`holeSize`).numAttr(`val`) ?? 50 : 50,
    prepared.some((p) => p.explosions?.some((e) => e > 0)),
  );
  const startAngle = pieStartAngle(chartTypeNode.child(`firstSliceAng`).numAttr(`val`));
  const pieSeries = prepared.map((p, i) => {
    const manualLayouts = new Map<number, { x?: number; y?: number; width?: number; height?: number }>();
    const data = p.series.categories.map((category, pointIndex) => {
      const override = p.pointLabels.get(pointIndex);
      const merged = mergeLabelConfig(p.sharedLabels, override);
      merged != null && merged.manualLayout && manualLayouts.set(pointIndex, merged.manualLayout);
      const entry: ChartOption = {
        name: category || `Item ${pointIndex + 1}`,
        value: p.series.values[pointIndex] ?? 0,
      };
      const pointStyle = p.series.dataPointStyles?.[pointIndex];
      if (pointStyle) {
        entry.itemStyle = {
          ...(pointStyle.color ? { color: pointStyle.color } : {}),
          ...(pointStyle.borderColor ? { borderColor: pointStyle.borderColor } : {}),
          ...(pointStyle.borderWidth === undefined ? {} : { borderWidth: pointStyle.borderWidth }),
          ...(pointStyle.borderType ? { borderType: pointStyle.borderType } : {}),
        };
      } else if (p.series.dataPointColors != null && p.series.dataPointColors[pointIndex]) {
        entry.itemStyle = { color: p.series.dataPointColors[pointIndex] };
      }
      if (p.explosions != null && p.explosions[pointIndex] && p.explosions[pointIndex] > 0) {
        entry.selected = true;
        entry.selectedOffset = explosionOffset(p.explosions[pointIndex], doughnut);
      }
      if (override != null && override.deleted) entry.label = { show: false };
      else if (override && labelsVisible(merged)) entry.label = buildPieLabel(merged, p.series.formatCode, p.series.name);
      return entry;
    });
    const seriesLabel = buildPieLabel(p.sharedLabels, p.series.formatCode, p.series.name);
    const showLeaderLines =
      !!p.sharedLabels?.showLeaderLines || [...p.pointLabels.values()].some((o) => o.showLeaderLines === true);
    const maxExplosion = p.explosions && Math.max(...p.explosions.map((e) => explosionOffset(e, doughnut)));
    return {
      type: `pie`,
      name: p.series.name,
      radius: doughnut ? splitPieRadius(layout.radius, i, prepared.length) : layout.radius,
      center: layout.center,
      data,
      selectedMode: p.explosions ? `multiple` : false,
      ...(maxExplosion ? { selectedOffset: maxExplosion } : {}),
      ...(startAngle === undefined ? {} : { startAngle, clockwise: true }),
      label: seriesLabel ?? { show: false },
      labelLine: { show: showLeaderLines },
      labelLayout: buildLabelLayout(manualLayouts),
    };
  });
  const legendOffset = legendTopOffset(!!title, legend);
  const sharedFormat = commonFormatCode(activeSeries);
  const legendData = doughnut ? unionCategories(activeSeries) : activeSeries[0].categories;
  return {
    title,
    tooltip: {
      trigger: `item`,
      ...(sharedFormat ? { valueFormatter: (v: number | number[]) => formatChartValue(Array.isArray(v) ? v[0] : v, sharedFormat) } : {}),
    },
    legend: buildLegendOption(legendOption, legend, legendOffset, legendData, tooltipStyle),
    series: pieSeries,
  };
}

/** 原 JK：雷达图（filled/marker 样式、反转分类序、渐变面积、网格线） */
function buildRadarChart(
  chartTypeNode: XmlNode,
  chartNode: XmlNode,
  series: ChartSeriesData[],
  ctx: PptxRenderContext,
  palette?: string[],
  size?: { w: number; h: number },
): ChartOption {
  const title = buildChartTitle(chartTypeNode, series, ctx, 12);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const categories = series.find((s) => s.categories.length > 0)?.categories || [];
  const plotArea = chartNode.child(`plotArea`);
  const { valueAxis } = parseCategoryValueAxes(plotArea, ctx);
  let maxValue: number;
  if (valueAxis.max !== undefined) maxValue = valueAxis.max;
  else {
    let hi = 0;
    let lo = 0;
    for (const s of series) {
      for (const v of s.values) {
        v > hi && (hi = v);
        v < lo && (lo = v);
      }
    }
    const step = niceInterval(hi, lo, 5);
    maxValue = Math.ceil(hi / step) * step || 100;
  }
  const labelsOn = !valueAxis.deleted && valueAxis.tickLblPos !== `none`;
  const radarStyle = chartTypeNode.child(`radarStyle`).attr(`val`);
  const axisLabel = labelsOn
    ? {
        show: true,
        formatter: (v: number) => formatChartValue(v, valueAxis.numFmt),
        color: valueAxis.labelColor ?? `#000000`,
        ...(valueAxis.labelFontSize === undefined ? {} : { fontSize: valueAxis.labelFontSize }),
      }
    : undefined;
  const zLevels = radarStyle === `filled` ? { radarZ: 4, seriesZ: 2 } : { radarZ: undefined, seriesZ: undefined };
  const secondAxId = chartTypeNode.children(`axId`)[1]?.attr(`val`);
  const radarAxisNode = plotArea.children(`valAx`).find((a) => a.child(`axId`).attr(`val`) === secondAxId) ?? plotArea.child(`valAx`);
  const hasExplicitGridlines = radarAxisNode.child(`majorGridlines`).child(`spPr`).exists();
  const hasAxisLine = radarAxisNode.child(`spPr`).child(`ln`).exists();
  const splitLine =
    valueAxis.hasMajorGridlines && (radarStyle !== `filled` || hasExplicitGridlines)
      ? { show: true, lineStyle: { ...CHART_RADAR_GRIDLINE, ...(hasExplicitGridlines ? valueAxis.majorGridlineStyle ?? {} : {}) } }
      : { show: false };
  const axisLine = valueAxis.deleted
    ? { show: false }
    : { show: true, lineStyle: { color: hasAxisLine ? valueAxis.lineColor ?? CHART_RADAR_GRIDLINE.color : CHART_RADAR_GRIDLINE.color } };
  const indicator = (categories.length > 1 ? [categories[0], ...categories.slice(1).reverse()] : categories).map((name, i) => ({
    name,
    max: maxValue,
    ...(valueAxis.min === undefined ? {} : { min: valueAxis.min }),
    ...(i === 0 && axisLabel ? { axisLabel } : {}),
  }));
  const topLegend = legendAtTop(legend) && !(legend != null && legend.overlay);
  const manualPie = radarManualLayout(chartNode, size);
  const center = manualPie?.center ?? (topLegend ? [`50%`, `66%`] : radarStyle === `filled` ? [`50%`, `55%`] : [`50%`, `50%`]);
  const radius = manualPie?.radius ?? (topLegend ? `58%` : radarStyle === `filled` ? `76%` : `86%`);
  const radarData = series.map((s, i) => {
    const values = s.values.length > 1 ? [s.values[0], ...s.values.slice(1).reverse()] : s.values;
    const symbol = mapMarkerSymbol(s.markerSymbol);
    const showSymbol = radarStyle === `marker` || (symbol !== undefined && symbol !== `none`);
    const filled = radarStyle === `filled`;
    const color = s.colorHex ?? palette?.[i % palette.length];
    const areaColor = typeof color === `string` ? radarAreaGradient(color) : color;
    const areaStyle = filled ? { ...(areaColor ? { color: areaColor } : {}), opacity: 0.75 } : undefined;
    return {
      name: s.name,
      value: values,
      ...(color
        ? {
            lineStyle: { color, width: s.lineWidth ?? 3, cap: `round`, join: `round`, ...(s.lineNoFill ? { opacity: 0 } : {}) },
            itemStyle: { color },
          }
        : { lineStyle: { width: s.lineWidth ?? 3, cap: `round`, join: `round`, ...(s.lineNoFill ? { opacity: 0 } : {}) } }),
      ...(areaStyle ? { areaStyle } : {}),
      ...(symbol && symbol !== `none` ? { symbol } : {}),
      ...(showSymbol ? {} : { symbol: `none` }),
      ...(s.markerSize ? { symbolSize: s.markerSize } : {}),
      ...(showSymbol ? { symbolSize: s.markerSize ?? 6 } : {}),
    };
  });
  return {
    title,
    tooltip: {},
    legend: buildLegendOption(
      legendOption,
      legend,
      legendTopOffset(!!title, legend),
      series.map((s) => {
        const symbol = mapMarkerSymbol(s.markerSymbol);
        return s.lineNoFill && symbol && symbol !== `none`
          ? { name: s.name, icon: symbol }
          : { name: s.name, icon: lineLegendIcon(), ...(symbol && symbol !== `none` ? { marker: symbol } : {}) };
      }),
      tooltipStyle,
    ),
    radar: {
      ...(zLevels.radarZ === undefined ? {} : { z: zLevels.radarZ }),
      indicator,
      radius,
      center,
      splitNumber: 5,
      splitLine,
      axisLine,
      splitArea: { show: false },
    },
    series: [{ type: `radar`, ...(zLevels.seriesZ === undefined ? {} : { z: zLevels.seriesZ }), data: radarData }],
  };
}

/** 原 YK：散点图（scatterStyle 决定连线/平滑/符号） */
function buildScatterChart(chartTypeNode: XmlNode, chartNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext): ChartOption {
  const title = buildChartTitle(chartTypeNode, series, ctx, 14);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const scatterStyle = chartTypeNode.child(`scatterStyle`).attr(`val`) ?? `lineMarker`;
  const hasLine = scatterStyle === `lineMarker` || scatterStyle === `line` || scatterStyle === `smoothMarker` || scatterStyle === `smooth`;
  const isSmooth = scatterStyle === `smoothMarker` || scatterStyle === `smooth`;
  const lineOnly = scatterStyle === `line` || scatterStyle === `smooth`;
  const scatterSeries = series.map((s, i) => {
    const data = s.values.map((value, pointIndex) => [
      s.xValues && pointIndex < s.xValues.length ? s.xValues[pointIndex] : pointIndex,
      value,
    ]) as [number, number][];
    const symbol = mapMarkerSymbol(s.markerSymbol) ?? lineMarkerForIndex(scatterStyle, i);
    const symbolVisible = !lineOnly && symbol !== `none`;
    if ((hasLine || s.smooth) && !s.lineNoFill) {
      const lineData = s.smooth ?? isSmooth ? smoothInterpolatePoints(data) : data;
      const width = s.lineWidth ?? 3;
      return {
        type: `line`,
        name: s.name,
        data: lineData,
        smooth: false,
        showSymbol: symbolVisible,
        ...(symbolVisible ? { symbol, symbolSize: s.markerSize ?? SCATTER_MARKER_SIZE } : {}),
        ...(s.colorHex
          ? {
              lineStyle: { color: s.colorHex, width, cap: `round`, join: `round` },
              itemStyle: { color: s.colorHex },
            }
          : { lineStyle: { width, cap: `round`, join: `round` } }),
      };
    }
    return {
      type: `scatter`,
      name: s.name,
      data,
      symbol: symbolVisible ? symbol : `none`,
      symbolSize: symbolVisible ? s.markerSize ?? SCATTER_MARKER_SIZE : 0,
      itemStyle: s.colorHex ? { color: s.colorHex } : undefined,
    };
  });
  const legendData = series.map((s, i) => {
    const symbol = mapMarkerSymbol(s.markerSymbol) ?? lineMarkerForIndex(scatterStyle, i);
    const symbolVisible = !lineOnly && symbol !== `none`;
    if ((hasLine || s.smooth) && !s.lineNoFill)
      return symbolVisible && symbol ? { name: s.name, icon: symbol } : { name: s.name, icon: lineLegendIcon() };
    return symbol && symbol !== `none` ? { name: s.name, icon: symbol } : s.name;
  });
  const { xAxis, yAxis } = parseScatterAxes(chartNode.child(`plotArea`), ctx);
  const top = chartTopMargin(!!title, legend);
  const legendOffset = legendTopOffset(!!title, legend);
  const manualGrid = plotAreaGridOption(chartNode);
  const containLabel = !hasManualLayout(manualGrid);
  const left = yAxis.deleted ? 4 : 18;
  const bottom = Math.max(chartBottomMargin(legend), 20);
  const xOption: ChartOption = { type: `value` };
  const yOption: ChartOption = { type: `value` };
  applyAxisToOption(xOption, xAxis, `value`);
  applyAxisToOption(yOption, yAxis, `value`);
  return {
    title,
    tooltip: { trigger: `item` },
    legend: buildLegendOption(legendOption, legend, legendOffset, legendData, tooltipStyle),
    grid: { containLabel, left, right: 10, top, bottom, ...manualGrid },
    xAxis: xOption,
    yAxis: yOption,
    series: scatterSeries,
  };
}

/** 原 XK：气泡轴扩展（最大气泡贴顶时多留一段） */
function applyBubbleAxisBounds(axis: ChartOption, values: number[], bubbleSizes: number[]): void {
  if (axis.max !== undefined || values.length === 0) return;
  const points = values
    .map((value, i) => ({ value, bubbleSize: bubbleSizes[i] ?? 0 }))
    .filter(({ value }) => Number.isFinite(value));
  if (points.length === 0) return;
  const min = Math.min(...points.map(({ value }) => value));
  const max = Math.max(...points.map(({ value }) => value));
  const intervals = max - Math.min(0, min) <= 3 ? 3 : 8;
  const step = niceInterval(max, min, intervals);
  let ceil = niceCeil(max, min, intervals);
  ceil > max && ceil - max < step * 0.25 && (ceil += step);
  const maxBubble = Math.max(...points.map(({ bubbleSize }) => bubbleSize));
  const topBubble = Math.max(...points.filter(({ value }) => Math.abs(value - max) < 1e-9).map(({ bubbleSize }) => bubbleSize), 0);
  maxBubble > 0 && topBubble / maxBubble >= 0.75 && (ceil += step);
  axis.max = ceil;
  axis.min === undefined && min >= 0 && (axis.min = 0);
  axis.interval === undefined && (axis.interval = step);
}

/** 原 ZK：气泡图（bubbleScale 换算符号尺寸，√面积比例） */
function buildBubbleChart(chartTypeNode: XmlNode, chartNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext): ChartOption {
  const title = buildChartTitle(chartTypeNode, series, ctx, 14);
  const legend = parseChartLegend(chartNode, ctx);
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const baseSize = BUBBLE_BASE_SIZE * (Math.max(chartTypeNode.child(`bubbleScale`).numAttr(`val`) ?? 100, 0) / 100);
  let maxBubble = -Infinity;
  for (const s of series) if (s.bubbleSizes) for (const b of s.bubbleSizes) b > maxBubble && (maxBubble = b);
  const normalizer = maxBubble > 0 ? maxBubble : 1;
  const bubbleSeries = series.map((s) => {
    const data = s.values.map((value, pointIndex) => [
      s.xValues && pointIndex < s.xValues.length ? s.xValues[pointIndex] : pointIndex,
      value,
      s.bubbleSizes && pointIndex < s.bubbleSizes.length ? s.bubbleSizes[pointIndex] : 0,
    ]);
    return {
      type: `scatter`,
      name: s.name,
      data,
      symbolSize: (point: number[]) => {
        const bubble = Math.max(Number(point[2]) || 0, 0);
        return Math.sqrt(bubble / normalizer) * baseSize;
      },
      itemStyle: s.colorHex ? { color: s.colorHex } : undefined,
    };
  });
  const { xAxis, yAxis } = parseScatterAxes(chartNode.child(`plotArea`), ctx);
  const top = chartTopMargin(!!title, legend);
  const legendOffset = legendTopOffset(!!title, legend);
  const manualGrid = plotAreaGridOption(chartNode);
  const containLabel = !hasManualLayout(manualGrid);
  const left = yAxis.deleted ? 4 : 18;
  const bottom = Math.max(chartBottomMargin(legend), 20);
  const xOption: ChartOption = { type: `value` };
  const yOption: ChartOption = { type: `value` };
  applyAxisToOption(xOption, xAxis, `value`);
  applyAxisToOption(yOption, yAxis, `value`);
  const allPoints = series.flatMap((s) =>
    s.values.map((value, pointIndex) => ({
      x: s.xValues && pointIndex < s.xValues.length ? s.xValues[pointIndex] : pointIndex,
      y: value,
      bubbleSize: s.bubbleSizes && pointIndex < s.bubbleSizes.length ? s.bubbleSizes[pointIndex] : 0,
    })),
  );
  applyBubbleAxisBounds(xOption, allPoints.map((p) => p.x), allPoints.map((p) => p.bubbleSize));
  applyBubbleAxisBounds(yOption, allPoints.map((p) => p.y), allPoints.map((p) => p.bubbleSize));
  return {
    title,
    tooltip: {
      trigger: `item`,
      formatter: (params: ChartOption) => {
        const p = params;
        return `${p.seriesName}<br/>x: ${p.value[0]}, y: ${p.value[1]}, size: ${p.value[2]}`;
      },
    },
    legend: buildLegendOption(legendOption, legend, legendOffset, series.map((s) => ({ name: s.name, icon: `circle` })), tooltipStyle),
    grid: { containLabel, left, right: 10, top, bottom, ...manualGrid },
    xAxis: xOption,
    yAxis: yOption,
    series: bubbleSeries,
  };
}

/** 原 QK：日期文本判定 */
function isDateCategory(text: string): boolean {
  return /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(text.trim());
}

/** 原 $K：股票图 marker → 符号 */
function stockMarkerSymbol(symbol: string | undefined): string {
  switch (symbol) {
    case `dot`:
    case `circle`:
      return `circle`;
    case `square`:
      return `rect`;
    case `diamond`:
    case `triangle`:
      return symbol;
    case `none`:
    case undefined:
      return `none`;
    default:
      return `circle`;
  }
}

/**
 * 原 eq：股票图——4 序列 → K 线（开高低收），3 序列 →
 * custom 渲染（最高-最低连线 + 收盘短横），其余退化。
 */
function buildStockChart(chartTypeNode: XmlNode, chartNode: XmlNode, series: ChartSeriesData[], ctx: PptxRenderContext): ChartOption {
  const title = buildChartTitle(chartTypeNode, series, ctx, 14);
  const legend = parseChartLegend(chartNode, ctx);
  const categories = series.find((s) => s.categories.length > 0)?.categories || [];
  const pointCount = categories.length || Math.max(...series.map((s) => s.values.length), 0);
  const kData: number[][] = [];
  if (series.length >= 4) {
    for (let i = 0; i < pointCount; i++) kData.push([series[0].values[i] ?? 0, series[3].values[i] ?? 0, series[2].values[i] ?? 0, series[1].values[i] ?? 0]);
  } else if (series.length >= 3) {
    for (let i = 0; i < pointCount; i++) {
      const high = series[2].values[i] ?? 0;
      kData.push([high, high, series[1].values[i] ?? 0, series[0].values[i] ?? 0]);
    }
  } else {
    for (let i = 0; i < pointCount; i++) {
      const value = series[0]?.values[i] ?? 0;
      kData.push([0, value, 0, value]);
    }
  }
  const { valueAxis, categoryAxis } = parseCategoryValueAxes(chartNode.child(`plotArea`), ctx, chartTypeNode);
  const top = chartTopMargin(!!title, legend);
  const manualGrid = plotAreaGridOption(chartNode);
  const containLabel = !hasManualLayout(manualGrid);
  const categoryOption: ChartOption = {
    type: `category`,
    data: categories,
    axisLabel: { interval: 0, rotate: 0, fontSize: 10 },
    splitLine: { show: false },
  };
  applyAxisToOption(categoryOption, categoryAxis, `category`);
  const dateLabels = categories.length >= 3 && categories.every((c) => isDateCategory(c)) && !categoryAxis.deleted && categoryAxis.tickLblPos !== `none`;
  if (dateLabels) {
    const label = categoryOption.axisLabel || {};
    categoryOption.axisLabel = { ...label, rotate: 45, margin: Math.max(Number(label.margin) || 0, 10) };
  }
  const valueOption: ChartOption = { type: `value` };
  applyAxisToOption(valueOption, valueAxis, `value`);
  const extremes = kData.flatMap((d) => [d[2], d[3]]).filter((v) => Number.isFinite(v));
  if (extremes.length > 0) {
    const min = Math.min(...extremes);
    const max = Math.max(...extremes);
    valueOption.min === undefined && min >= 0 && (valueOption.min = 0);
    valueOption.interval === undefined && (valueOption.interval = niceInterval(max, min, 7));
    if (valueOption.max === undefined) {
      const step = Number(valueOption.interval) || niceInterval(max, min, 7);
      valueOption.max = Math.ceil(max / step) * step + step;
    }
  }
  const legendOption = legend?.option;
  const tooltipStyle: ChartTextStyle = { fontSize: 10, ...(legend?.textStyle ?? {}) };
  const legendOffset = legendTopOffset(!!title, legend);
  const bottom = Math.max(chartBottomMargin(legend), dateLabels ? 56 : 0);
  const threeSeries = series.length >= 3 && series.length < 4;
  const legendData = threeSeries
    ? series.slice(0, 3).map((s, i) => ({ name: s.name, icon: i === 2 ? stockMarkerSymbol(s.markerSymbol) : `none` }))
    : series.map((s) => s.name);
  const stockSeries = threeSeries
    ? [
        {
          type: `custom`,
          name: series[2].name,
          coordinateSystem: `cartesian2d`,
          data: Array.from({ length: pointCount }, (_, i) => [i, series[0].values[i] ?? 0, series[1].values[i] ?? 0, series[2].values[i] ?? 0]),
          renderItem: (params: ChartOption, api: ChartOption) => {
            const x = api.value(0);
            const high = api.value(1);
            const low = api.value(2);
            const close = api.value(3);
            const highPoint = api.coord([x, high]);
            const lowPoint = api.coord([x, low]);
            const closePoint = api.coord([x, close]);
            const slotWidth = Math.max(8, api.size([1, 0])[0] || 12);
            const tickWidth = Math.min(4, Math.max(2, Math.round(slotWidth * 0.04)));
            const stemColor = stringOrDefault(series[0].colorHex, `#000000`);
            const tickColor = stringOrDefault(series[2].colorHex, `#00B050`);
            return {
              type: `group`,
              children: [
                {
                  type: `line`,
                  shape: { x1: highPoint[0], y1: highPoint[1], x2: lowPoint[0], y2: lowPoint[1] },
                  style: { stroke: stemColor, lineWidth: 1 },
                },
                {
                  type: `line`,
                  shape: { x1: closePoint[0], y1: closePoint[1], x2: closePoint[0] + tickWidth, y2: closePoint[1] },
                  style: { stroke: tickColor, lineWidth: 1 },
                },
              ],
            };
          },
          silent: true,
        },
      ]
    : [
        {
          type: `candlestick`,
          name: series.length >= 3 ? series[2].name : series[0]?.name,
          data: kData,
          itemStyle: {
            color: stringOrDefault(series[series.length >= 4 ? 3 : 2]?.colorHex, `#ec0000`),
            color0: stringOrDefault(series[0]?.colorHex, `#00da3c`),
            borderColor: stringOrDefault(series[series.length >= 4 ? 3 : 2]?.colorHex, `#ec0000`),
            borderColor0: stringOrDefault(series[0]?.colorHex, `#00da3c`),
          },
        },
      ];
  return {
    title,
    tooltip: { trigger: `axis`, axisPointer: { type: `cross` } },
    legend: buildLegendOption(legendOption, legend, legendOffset, legendData, tooltipStyle),
    grid: { containLabel, left: 24, right: 10, top, bottom, ...manualGrid },
    xAxis: categoryOption,
    yAxis: valueOption,
    series: stockSeries,
  };
}

/* --- 绘图区布局（原 tq..aq，jsx 43950-43997） --- */

/** 原 tq：plotArea manualLayout 原始值 */
function plotAreaManualLayout(chartNode: XmlNode): { x?: number; y?: number; w?: number; h?: number } {
  const layout = chartNode.child(`plotArea`).child(`layout`).child(`manualLayout`);
  return layout.exists()
    ? {
        x: layout.child(`x`).numAttr(`val`),
        y: layout.child(`y`).numAttr(`val`),
        w: layout.child(`w`).numAttr(`val`),
        h: layout.child(`h`).numAttr(`val`),
      }
    : {};
}

/** 原 nq：plotArea → grid 百分比选项 */
function plotAreaGridOption(chartNode: XmlNode): Record<string, string> {
  const { x, y, w, h } = plotAreaManualLayout(chartNode);
  const out: Record<string, string> = {};
  x !== undefined && (out.left = percentCss(x));
  y !== undefined && (out.top = percentCss(y));
  w !== undefined && (out.width = percentCss(w));
  h !== undefined && (out.height = percentCss(h));
  return out;
}

/** 原 rq：plotArea → 雷达中心/半径（有尺寸时按像素） */
function radarManualLayout(chartNode: XmlNode, size?: { w: number; h: number }): { center: (string | number)[]; radius: string | number } | undefined {
  const { x, y, w, h } = plotAreaManualLayout(chartNode);
  if (x === undefined || y === undefined || w === undefined || h === undefined) return;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return size
    ? { center: [cx * size.w, cy * size.h], radius: Math.min(w * size.w, h * size.h) / 2 }
    : { center: [percentCss(cx), percentCss(cy)], radius: percentCss(Math.min(w, h) / 2) };
}

/** 原 iq：绘图区背景 → graphic rect */
function plotAreaBackgroundGraphic(chartNode: XmlNode, fill: string, size?: { w: number; h: number }): ChartOption | undefined {
  if (!size) return;
  const { x = 0, y = 0, w = 1, h = 1 } = plotAreaManualLayout(chartNode);
  return {
    type: `rect`,
    silent: true,
    z: -10,
    left: x * size.w,
    top: y * size.h,
    shape: { width: w * size.w, height: h * size.h },
    style: { fill, stroke: `none` },
  };
}

/** 原 aq：graphic 前置合并 */
function prependGraphic(option: ChartOption, graphic: ChartOption): void {
  const existing = option.graphic;
  if (!existing) {
    option.graphic = graphic;
    return;
  }
  option.graphic = Array.isArray(existing) ? [graphic, ...existing] : [graphic, existing];
}

/* --- 分派与合并（原 oq..mq，jsx 43998-44124） --- */

/** 原 oq：图表类型 → 构建器 */
function dispatchChartBuilder(
  typeName: string,
  chartTypeNode: XmlNode,
  chartNode: XmlNode,
  series: ChartSeriesData[],
  ctx: PptxRenderContext,
  palette?: string[],
  size?: { w: number; h: number },
): ChartOption | undefined {
  switch (typeName) {
    case `barChart`:
    case `bar3DChart`:
      return buildBarChart(chartTypeNode, chartNode, series, ctx);
    case `lineChart`:
    case `line3DChart`:
      return buildLineChart(chartTypeNode, chartNode, series, ctx, false, palette);
    case `areaChart`:
    case `area3DChart`:
    case `surface3DChart`:
      return buildLineChart(chartTypeNode, chartNode, series, ctx, true, palette);
    case `pieChart`:
    case `pie3DChart`:
      return buildPieChart(chartTypeNode, chartNode, series, ctx, false);
    case `doughnutChart`:
      return buildPieChart(chartTypeNode, chartNode, series, ctx, true);
    case `radarChart`:
      return buildRadarChart(chartTypeNode, chartNode, series, ctx, palette, size);
    case `scatterChart`:
      return buildScatterChart(chartTypeNode, chartNode, series, ctx);
    case `bubbleChart`:
      return buildBubbleChart(chartTypeNode, chartNode, series, ctx);
    case `stockChart`:
      return buildStockChart(chartTypeNode, chartNode, series, ctx);
    default:
      return;
  }
}

/** 原 sq：可双轴合并的笛卡尔类型 */
function isMergeableChartType(typeName: string): boolean {
  return (
    typeName === `barChart` || typeName === `bar3DChart` || typeName === `lineChart` || typeName === `line3DChart` ||
    typeName === `areaChart` || typeName === `area3DChart` || typeName === `stockChart` || typeName === `surface3DChart`
  );
}

/** 原 cq：图例合并（data 去重；异构图标时去掉全局 icon） */
function mergeLegendOptions(first: ChartOption | undefined, second: ChartOption | undefined): ChartOption | undefined {
  const a = firstLegend(first);
  const b = firstLegend(second);
  if (!a) return second;
  if (!b) return first;
  const data = [...(a.data ?? []), ...(b.data ?? [])];
  const seen = new Set<string>();
  const merged = data.filter((item: unknown) => {
    const name = typeof item === `string` ? item : (item as { name: string }).name;
    return seen.has(name) ? false : (seen.add(name), true);
  });
  const out: ChartOption = { ...a, data: merged };
  merged.some((item: unknown) => typeof item === `object` && (item as { icon?: unknown }).icon) && delete out.icon;
  return out;
}

/** 原 lq：归一为数组 */
function asArray<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

/** 原 uq：尺寸值解析（百分比按总量） */
function resolveLayoutValue(value: unknown, total: number, fallback: number): number {
  if (typeof value === `number` && Number.isFinite(value)) return value;
  if (typeof value === `string`) {
    if (value.endsWith(`%`)) {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? (total * parsed) / 100 : fallback;
    }
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/** 原 dq：grid 轴向净尺寸（width/height 优先） */
function gridNetSpan(grid: ChartOption | undefined, total: number, leadKey: string, trailKey: string): number {
  if (typeof grid?.width === `string` && leadKey === `left` && grid.width.endsWith(`%`)) return (total * parseFloat(grid.width)) / 100;
  if (typeof grid?.height === `string` && leadKey === `top` && grid.height.endsWith(`%`)) return (total * parseFloat(grid.height)) / 100;
  if (typeof grid?.width === `number` && leadKey === `left`) return grid.width;
  if (typeof grid?.height === `number` && leadKey === `top`) return grid.height;
  const lead = resolveLayoutValue(grid?.[leadKey], total, 0);
  const trail = resolveLayoutValue(grid?.[trailKey], total, 0);
  return Math.max(0, total - lead - trail);
}

/** 原 fq：值轴跨零判定 */
function axisSpansZero(axis: ChartOption): boolean {
  return typeof axis.min === `number` && typeof axis.max === `number` && axis.min < 0 && axis.max > 0;
}

/** 原 pq：跨零时分类轴标签移到零线（负 margin + 提升 z） */
function applyZeroLineLabels(categoryAxis: ChartOption, valueAxis: ChartOption | undefined, span: number): boolean {
  if (!valueAxis || categoryAxis.type !== `category` || valueAxis.type !== `value` || categoryAxis.axisLine?.onZero !== true || !axisSpansZero(valueAxis) || span <= 0)
    return false;
  const zeroOffset = span * ((0 - valueAxis.min) / (valueAxis.max - valueAxis.min));
  const label = (categoryAxis.axisLabel ??= {});
  const fontSize = Math.max(6, Math.round(label.fontSize ?? 10));
  label.margin = -Math.round(Math.max(0, zeroOffset - fontSize));
  categoryAxis.z = Math.max(categoryAxis.z ?? 0, 20);
  return true;
}

/** 原 mq：全选项零轴标签修正 + grid 左留白兜底 */
function applyZeroAxisFixes(option: ChartOption, size: { w: number; h: number }): void {
  const grid = asArray(option.grid)[0];
  const xAxes = asArray(option.xAxis);
  const yAxes = asArray(option.yAxis);
  const verticalSpan = gridNetSpan(grid, size.h, `top`, `bottom`);
  const horizontalSpan = gridNetSpan(grid, size.w, `left`, `right`);
  let fixed = false;
  xAxes.forEach((axis, i) => {
    fixed = applyZeroLineLabels(axis, yAxes[i] ?? yAxes[0], verticalSpan) || fixed;
  });
  yAxes.forEach((axis, i) => {
    fixed = applyZeroLineLabels(axis, xAxes[i] ?? xAxes[0], horizontalSpan) || fixed;
  });
  fixed && grid && ((grid.containLabel = false), (grid.left = Math.max(resolveLayoutValue(grid.left, size.w, 0), 48)));
}

/** 原 hq：图表类型节点的第二 axId（值轴） */
function chartValueAxisId(chartTypeNode: XmlNode): string | undefined {
  return chartAxisIds(chartTypeNode)[1];
}

/** 原 gq：双图表合并——不同值轴 → 追加 yAxis 并改 yAxisIndex */
function mergeChartOptions(base: ChartOption, extra: ChartOption, baseTypeNode: XmlNode, extraTypeNode: XmlNode): ChartOption {
  const baseSeries = Array.isArray(base.series) ? base.series : [];
  const extraSeries = Array.isArray(extra.series) ? extra.series : [];
  const baseAxisId = chartValueAxisId(baseTypeNode);
  const extraAxisId = chartValueAxisId(extraTypeNode);
  if (baseAxisId !== undefined && extraAxisId !== undefined && baseAxisId !== extraAxisId) {
    const baseYAxes = asArray(base.yAxis);
    const extraYAxes = asArray(extra.yAxis);
    const offset = baseYAxes.length;
    return {
      ...base,
      legend: mergeLegendOptions(base.legend, extra.legend),
      yAxis: [...baseYAxes, ...extraYAxes],
      series: [...baseSeries, ...extraSeries.map((s: ChartOption) => ({ ...s, yAxisIndex: s.yAxisIndex === undefined ? offset : s.yAxisIndex }))],
    };
  }
  return { ...base, legend: mergeLegendOptions(base.legend, extra.legend), series: [...baseSeries, ...extraSeries] };
}

/* --- 图表选项总装与渲染（原 _q..yq，jsx 44125-44265） --- */

/** 图表构建结果（原 _q 返回类型） */
export interface ChartBuildResult {
  option: ChartOption;
  dataTable?: { seriesArr: ChartSeriesData[]; showKeys: boolean };
  chartFrameStyle?: { borderColor: string; borderWidth: number; borderStyle: string };
}

/**
 * 原 _q：chartSpace → echarts option。
 * 流程：clrMapOvr 上下文 → 色板 → plotArea 各图表类型提取序列 →
 * 首个类型构建（笛卡尔类型尝试与后续类型双轴合并）→ 字号/字体/颜色
 * 统一 → 图例宽度/值轴推断 → 背景/绘图区背景 → 数据表。
 */
export function buildChartOptions(chartSpace: XmlNode, ctx: PptxRenderContext, chartPath: string, size?: { w: number; h: number }): ChartBuildResult {
  const overrideCtx = chartContextWithOverride(chartSpace, ctx);
  const palette = resolveChartPalette(chartSpace, overrideCtx, chartPath);
  const chart = chartSpace.child(`chart`);
  const plotArea = chart.child(`plotArea`);
  if (!plotArea.exists())
    return { option: { title: { text: `Unsupported chart`, left: `center` } }, chartFrameStyle: chartFrameStyle(chartSpace, overrideCtx) };
  const { chartBg, plotAreaBg } = chartBackgrounds(chartSpace, chart, overrideCtx);
  const frameStyle = chartFrameStyle(chartSpace, overrideCtx);
  const found = CHART_TYPE_NAMES.flatMap((typeName) =>
    plotArea.children(typeName).map((chartTypeNode) => {
      const seriesArr = extractChartSeries(chartTypeNode, overrideCtx);
      return seriesArr.length === 0 ? null : { typeName, chartTypeNode, seriesArr };
    }),
  ).filter((e): e is NonNullable<typeof e> => e !== null);
  for (let index = 0; index < found.length; index++) {
    const entry = found[index];
    let option = dispatchChartBuilder(entry.typeName, entry.chartTypeNode, chart, entry.seriesArr, overrideCtx, palette, size);
    if (!option) continue;
    if (index === 0 && found.length > 1 && isMergeableChartType(entry.typeName)) {
      for (const other of found.slice(1)) {
        if (!isMergeableChartType(other.typeName)) continue;
        const extra = dispatchChartBuilder(other.typeName, other.chartTypeNode, chart, other.seriesArr, overrideCtx, palette, size);
        extra && (option = mergeChartOptions(option, extra, entry.chartTypeNode, other.chartTypeNode));
      }
    }
    const titleFontSize = chartTitleFontSizePx(chartSpace);
    titleFontSize && normalizeSmallFontSizes(option, titleFontSize);
    const fontFamily = chartThemeFontFamily(overrideCtx);
    fontFamily && applyDefaultFontFamily(option, fontFamily);
    applyDefaultTextColors(option);
    adjustGridForSideLegend(option, chart, titleFontSize);
    size && inferValueAxisBounds(size, option);
    chartBg && (option.backgroundColor = chartBg);
    palette && palette.length > 0 && (option.color = palette);
    if (plotAreaBg) {
      if (option.grid) {
        option.grid.backgroundColor = plotAreaBg;
        option.grid.show = true;
      } else {
        const graphic = plotAreaBackgroundGraphic(chart, plotAreaBg, size);
        graphic && prependGraphic(option, graphic);
      }
    }
    const tableSeries =
      index === 0 && found.length > 1 && isMergeableChartType(entry.typeName)
        ? found.filter((e) => isMergeableChartType(e.typeName)).flatMap((e) => e.seriesArr).sort((a, b) => a.order - b.order)
        : entry.seriesArr;
    const dataTableConfig = parseDataTable(plotArea);
    const dataTable = dataTableConfig ? { seriesArr: tableSeries, showKeys: dataTableConfig.showKeys } : undefined;
    return { option, dataTable, chartFrameStyle: frameStyle };
  }
  return {
    option: { title: { text: `Unsupported chart type`, left: `center`, textStyle: { fontSize: 12 } } },
    chartFrameStyle: frameStyle,
  };
}

/** echarts 初始化注入（原 Ej = vendor echarts.init，jsx 28524） */
export type EchartsInit = (el: HTMLElement) => PptxChartInstance;

/**
 * 原 vq：图表节点渲染——宿主 div（flex 列：图区 + 数据表），
 * 自定义图例替代时隐藏内建图例；尺寸就绪后初始化 echarts。
 */
export function renderChartNode(node: PptxChartNode, ctx: PptxRenderContext, echartsInit: EchartsInit): HTMLElement {
  const host = document.createElement(`div`);
  host.style.position = `absolute`;
  host.style.left = `${node.position.x}px`;
  host.style.top = `${node.position.y}px`;
  host.style.width = `${node.size.w}px`;
  host.style.height = `${node.size.h}px`;
  host.style.overflow = `hidden`;
  host.style.display = `flex`;
  host.style.flexDirection = `column`;
  const chartSpace = ctx.presentation.charts?.get(node.chartPath);
  if (!chartSpace) {
    host.style.border = `1px dashed #ccc`;
    host.style.display = `flex`;
    host.style.alignItems = `center`;
    host.style.justifyContent = `center`;
    host.style.color = `#999`;
    host.style.fontSize = `12px`;
    host.textContent = `Chart not found`;
    return host;
  }
  const chartArea = document.createElement(`div`);
  chartArea.style.width = `100%`;
  chartArea.style.flex = `1`;
  chartArea.style.minWidth = `0`;
  chartArea.style.minHeight = `0`;
  chartArea.style.overflow = `hidden`;
  host.appendChild(chartArea);
  const chartTheme = ctx.presentation.chartThemes?.get(node.chartPath);
  const { option, dataTable, chartFrameStyle } = buildChartOptions(
    chartSpace,
    chartTheme ? { ...ctx, theme: chartTheme, colorCache: new Map() } : ctx,
    node.chartPath,
    node.size,
  );
  applyZeroAxisFixes(option, node.size);
  chartFrameStyle &&
    ((host.style.boxSizing = `border-box`),
    chartFrameStyle.borderColor && chartFrameStyle.borderWidth && chartFrameStyle.borderStyle &&
      (host.style.border = `${chartFrameStyle.borderWidth}px ${chartFrameStyle.borderStyle} ${chartFrameStyle.borderColor}`));
  const customLegend = buildCustomLegendHtml(option, node.size);
  const legendEntry = firstLegend(option.legend);
  if (customLegend && legendEntry) {
    legendEntry.show = false;
    host.appendChild(customLegend);
  }
  if (dataTable) {
    const keyColors = dataTable.seriesArr.map((s) => s.colorHex).filter((c): c is string => typeof c === `string`);
    const tableEl = renderDataTableHtml(dataTable, keyColors.length > 0 ? keyColors : undefined);
    host.appendChild(tableEl);
  }
  const instances = ctx.chartInstances;
  const ready = new Promise<void>((resolve) => {
    const initialize = () => {
      initEchartsOnElement(chartArea, option, instances, echartsInit);
      resolve();
    };
    requestAnimationFrame(() => {
      if (!chartArea.isConnected) {
        resolve();
        return;
      }
      if (chartArea.offsetWidth === 0 || chartArea.offsetHeight === 0) {
        if (typeof ResizeObserver > `u`) {
          initialize();
          return;
        }
        const observer = new ResizeObserver((entries) => {
          if (!chartArea.isConnected) {
            observer.disconnect();
            return;
          }
          const { width, height } = entries[0]?.contentRect ?? { width: 0, height: 0 };
          width > 0 && height > 0 && (observer.disconnect(), initialize());
        });
        observer.observe(chartArea);
        resolve();
        return;
      }
      initialize();
    });
  });
  ctx.asyncTasks?.push(ready);
  return host;
}

/** 原 yq：echarts 初始化 + ResizeObserver 自适应（失败显示占位） */
function initEchartsOnElement(
  el: HTMLElement,
  option: ChartOption,
  instances: Set<PptxChartInstance> | undefined,
  echartsInit: EchartsInit,
): void {
  try {
    const instance = echartsInit(el);
    instance.setOption(option);
    instances?.add(instance);
    if (typeof ResizeObserver > `u`) return;
    const observer = new ResizeObserver(() => {
      if (el.isConnected) instance.resize();
      else {
        observer.disconnect();
        instance.isDisposed() || instance.dispose();
        instances?.delete(instance);
      }
    });
    observer.observe(el);
  } catch (error) {
    console.warn(`Failed to initialize ECharts:`, error);
    el.style.display = `flex`;
    el.style.alignItems = `center`;
    el.style.justifyContent = `center`;
    el.style.color = `#999`;
    el.style.fontSize = `12px`;
    el.textContent = `Chart render error`;
  }
}
