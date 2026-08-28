/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineGeometry.ts — pptxRendererPreviewEngine 子模块 · DrawingML 预设几何
 * （解混淆重建 · D8 Stage B2）
 *
 * 主文件：pptxRendererPreviewEngine.tsx。对应源 chunk 区段：
 *   gi/_i      自定义几何 custGeom → SVG path          (jsx 7251-7360)
 *   vi         椭圆弧 path 助手                        (jsx 7361-7373)
 *   yi/bi      adj 值读取（千分比/原值）               (jsx 7374-7378)
 *   xi         n 角星生成器                            (jsx 7379-7398)
 *   Si/Ci      path 水平/垂直镜像变换                  (jsx 7399-7458)
 *   V          预设几何注册表（134 个 V.set）          (jsx 7459-9608)
 *   wi/Ti/Ei   多段路径拆分与弯箭头包装                (jsx 8089-8150)
 *   ji         多区域形状注册表（actionButton 等 24 个）(jsx 9609-10500)
 *   Mi/Ni      actionButton 度量 / 矩形 path           (jsx 9610-9628)
 *   Ai         预设的附加细节路径（本文件末尾登记）     (jsx 9419)
 *
 * 转录策略：全部 134+24 个条目逐一登记；公式简短者全量转录，
 * 公式超长者（弯箭头/缎带/呼出框/动作按钮细节）给出语义说明 +
 * 源行号锚点（这些条目为纯数学数据，语义 = 公式本身）。
 *
 * 整合清理（A0 阶段 S2e；删除/改指依据 = B5-16/17 报告）：
 *   - 删除 DEFERRED_PRESET_GEOMETRY_ANCHORS 登记表（39 项）+ FALLBACK_RECT
 *     兜底循环：38 个真缺预设已逐字转录于 PptxGeometryDeferredPresets.ts
 *     （B5-17），borderCallout1 本文件已有真实体（671-676）；
 *   - 删除 DEFERRED_MULTI_REGION_ANCHORS 登记表（38 项）：全量已逐字转录于
 *     PptxGeometryMultiRegion.ts（B5-16）；
 *   - 两表的实体均为模块级副作用注册，渲染器装配处 pptxRendererPreviewEngine.tsx
 *     与本文件同图 import（求值时序在本文件之后，覆盖方向正确）；
 *   - buildMultiRegionPaths 改指忠实版包装：弯箭头四预设经
 *     PptxGeometryMultiRegion 的 ji 条目委托 wrapSplitPresetRegions/
 *     wrapVerticalArrowRegions（原 Ti/Ei 逐字版），查表改为小写优先→原名回退
 *     （原 Pi），修复 curvedleftarrow 区域顺序偏差与仅小写查表偏差
 *     （B5-16 §5-1/§5-2、§6-4）。
 * ============================================================================
 */

import { XmlNode } from "./pptxEngineTypes";

/* --- adj 读取（原 yi/bi，jsx 7374-7378） --- */

/** adj/100000（千分比 → 0..1），缺省默认值 */
export function adjRatio(adjustments: Map<string, number> | undefined, name: string, fallback: number): number {
  return (adjustments?.get(name) ?? fallback) / 1e5;
}

/** adj 原值，缺省默认值（无 fallback 重载返回 undefined） */
export function adjValue(adjustments: Map<string, number> | undefined, name: string, fallback: number): number;
export function adjValue(adjustments: Map<string, number> | undefined, name: string): number | undefined;
export function adjValue(adjustments: Map<string, number> | undefined, name: string, fallback?: number): number | undefined {
  return adjustments?.get(name) ?? fallback;
}

/* --- 椭圆弧助手（原 vi，jsx 7361-7373） --- */

export function ellipticArcPath(
  cx: number, cy: number, rx: number, ry: number,
  startDeg: number, endDeg: number,
): string {
  const s = (startDeg * Math.PI) / 180;
  const e = (endDeg * Math.PI) / 180;
  const x1 = cx + rx * Math.cos(s);
  const y1 = cy + ry * Math.sin(s);
  const x2 = cx + rx * Math.cos(e);
  const y2 = cy + ry * Math.sin(e);
  let sweep = ((endDeg - startDeg) % 360 + 360) % 360;
  sweep === 0 && startDeg !== endDeg && (sweep = 360);
  return `M${x1},${y1} A${rx},${ry} 0 ${+(sweep > 180)},1 ${x2},${y2}`;
}

/* --- 圆弧段助手（原 H，jsx 10683；plaque 等使用） ---
 * 从 (cx+rx·cosθ, cy+ry·sinθ) 起、扫过 sweepDeg 的 SVG 弧，
 * 返回 {endX, endY, svg}。 */
export function arcSegment(
  cx: number, cy: number, rx: number, ry: number,
  startDeg: number, sweepDeg: number,
): { endX: number; endY: number; svg: string } {
  const s = (startDeg * Math.PI) / 180;
  const e = ((startDeg + sweepDeg) * Math.PI) / 180;
  const endX = cx + rx * Math.cos(e);
  const endY = cy + ry * Math.sin(e);
  const startX = cx + rx * Math.cos(s);
  const startY = cy + ry * Math.sin(s);
  return {
    endX,
    endY,
    svg: `A${rx},${ry} 0 ${+(Math.abs(sweepDeg) > 180)},${+(sweepDeg > 0)} ${endX},${endY}`,
  };
}

/* --- n 角星生成器（原 xi，jsx 7379-7398） --- */

export function starPath(width: number, height: number, points: number, innerRatio = 0.4): string {
  const cx = width / 2;
  const cy = height / 2;
  const outerRx = width / 2;
  const outerRy = height / 2;
  const innerRx = outerRx * innerRatio;
  const innerRy = outerRy * innerRatio;
  const total = points * 2;
  const segments: string[] = [];
  for (let i = 0; i < total; i++) {
    const angle = ((2 * Math.PI) * i) / total - Math.PI / 2;
    const outer = i % 2 == 0;
    const rx = outer ? outerRx : innerRx;
    const ry = outer ? outerRy : innerRy;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    segments.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  segments.push(`Z`);
  return segments.join(` `);
}

/* --- path 镜像变换（原 Si/Ci，jsx 7399-7458） ---
 * 逐指令重写坐标：Si 水平镜像（x → width-x，弧 sweep 翻转），
 * Ci 垂直镜像（y → height-y）。仅处理 M/L/A/Z 指令。 */
export function mirrorPathHorizontally(path: string, width: number): string {
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
      const x = Number(tokens[i++]);
      const y = Number(tokens[i++]);
      out.push(String(width - x), String(y));
      continue;
    }
    if (token === `A`) {
      const rx = tokens[i++], ry = tokens[i++], rot = tokens[i++], large = tokens[i++];
      const sweep = Number(tokens[i++]);
      const x = Number(tokens[i++]);
      const y = Number(tokens[i++]);
      out.push(rx, ry, rot, large, String(+!sweep), String(width - x), String(y));
      continue;
    }
    return path;
  }
  return out.join(` `);
}

export function mirrorPathVertically(path: string, height: number): string {
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
      const x = Number(tokens[i++]);
      const y = Number(tokens[i++]);
      out.push(String(x), String(height - y));
      continue;
    }
    if (token === `A`) {
      const rx = tokens[i++], ry = tokens[i++], rot = tokens[i++], large = tokens[i++];
      const sweep = Number(tokens[i++]);
      const x = Number(tokens[i++]);
      const y = Number(tokens[i++]);
      out.push(rx, ry, rot, large, String(+!sweep), String(x), String(height - y));
    }
  }
  return out.join(` `);
}

/* --- 多段拆分（原 wi，jsx 8089-8098）：首个 Z 处切外轮廓与剩余 --- */

export function splitOuterPath(path: string): { outer: string; remainder: string } {
  const index = path.indexOf(`Z`);
  return index === -1
    ? { outer: path, remainder: `` }
    : { outer: path.slice(0, index + 1).trim(), remainder: path.slice(index + 1).trim() };
}

/* ============================================================================
 * 预设几何注册表（原 V，jsx 7459-9608；134 个 V.set）
 * 签名：(width, height, adjustments?) => SVG path 字符串
 * ==========================================================================*/

export type PresetGeometryBuilder = (
  width: number,
  height: number,
  adjustments?: Map<string, number>,
) => string;

export const PRESET_GEOMETRY_PATHS = new Map<string, PresetGeometryBuilder>();

/* --- 基础形（原 jsx 7460-7489） --- */

PRESET_GEOMETRY_PATHS.set(`rect`, (w, h) => `M0,0 L${w},0 L${w},${h} L0,${h} Z`);

PRESET_GEOMETRY_PATHS.set(`roundRect`, (w, h, adj) => {
  const ratio = adjRatio(adj, `adj`, 16667);
  const r = Math.min(w, h) * ratio;
  return [
    `M${r},0`, `L${w - r},0`, `A${r},${r} 0 0,1 ${w},${r}`,
    `L${w},${h - r}`, `A${r},${r} 0 0,1 ${w - r},${h}`,
    `L${r},${h}`, `A${r},${r} 0 0,1 0,${h - r}`,
    `L0,${r}`, `A${r},${r} 0 0,1 ${r},0`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`plaque`, (w, h, adj) => {
  // 四角内凹弧：外框矩形 + 四角反向圆弧（原 jsx 7466-7473）
  const r = Math.min(Math.max(adjValue(adj, `adj`, 16667), 0), 5e4);
  const inset = (Math.min(w, h) * r) / 1e5;
  const ax = w - inset;
  const ay = h - inset;
  const tl = arcSegment(0, inset, inset, inset, 90, -90);
  const tr = arcSegment(ax, 0, inset, inset, 180, -90);
  const br = arcSegment(w, ay, inset, inset, 270, -90);
  const bl = arcSegment(inset, h, inset, inset, 0, -90);
  return [`M0,${inset}`, tl.svg, `L${ax},0`, tr.svg, `L${w},${ay}`, br.svg, `L${inset},${h}`, bl.svg, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`cornerTabs`, (w, h) => {
  const n = Math.sqrt(w * w + h * h) / 20;
  return [
    `M0,0 L${n},0 L0,${n} Z`,
    `M${w},0 L${w - n},0 L${w},${n} Z`,
    `M${w},${h} L${w - n},${h} L${w},${h - n} Z`,
    `M0,${h} L${n},${h} L0,${h - n} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`squareTabs`, (w, h) => {
  const n = Math.sqrt(w * w + h * h) / 20;
  return [
    `M0,0 L${n},0 L${n},${n} L0,${n} Z`,
    `M${w - n},0 L${w},0 L${w},${n} L${w - n},${n} Z`,
    `M0,${h - n} L${n},${h - n} L${n},${h} L0,${h} Z`,
    `M${w - n},${h - n} L${w},${h - n} L${w},${h} L${w - n},${h} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`plaqueTabs`, (w, h) => {
  const n = Math.sqrt(w * w + h * h) / 20;
  return [
    `M0,0 L${n},0 A${n},${n} 0 0,1 0,${n} Z`,
    `M${w},0 L${w - n},0 A${n},${n} 0 0,0 ${w},${n} Z`,
    `M0,${h} L0,${h - n} A${n},${n} 0 0,1 ${n},${h} Z`,
    `M${w},${h} L${w - n},${h} A${n},${n} 0 0,1 ${w},${h - n} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`ellipse`, (w, h) => {
  const rx = w / 2, ry = h / 2;
  return [`M${w},${ry}`, `A${rx},${ry} 0 1,1 0,${ry}`, `A${rx},${ry} 0 1,1 ${w},${ry}`, `Z`].join(` `);
});

/* --- 三角形/菱形/多边形（原 jsx 7484-7548） --- */

PRESET_GEOMETRY_PATHS.set(`triangle`, (w, h, adj) => `M${w * adjRatio(adj, `adj`, 5e4)},0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`isosTriangle`, (w, h, adj) => `M${w * adjRatio(adj, `adj`, 5e4)},0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`rtTriangle`, (w, h) => `M0,0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`diamond`, (w, h) => {
  const cx = w / 2, cy = h / 2;
  return `M${cx},0 L${w},${cy} L${cx},${h} L0,${cy} Z`;
});

PRESET_GEOMETRY_PATHS.set(`pentagon`, (w, h) => {
  // 正五边形（顶点朝上，原 jsx 7491-7500 的固定三角比）
  const cx = w / 2;
  const rx = cx * 105146 / 1e5;
  const ry = (h / 2) * 110557 / 1e5;
  const baseY = ry;
  const dx18 = rx * Math.cos((18 * Math.PI) / 180);
  const dx54 = rx * Math.cos((54 * Math.PI) / 180);
  const dy18 = ry * Math.sin((18 * Math.PI) / 180);
  const dy54 = ry * Math.sin((54 * Math.PI) / 180);
  return [
    `M${cx - dx18},${baseY - dy18}`, `L${cx},0`, `L${cx + dx18},${baseY - dy18}`,
    `L${cx + dx54},${baseY + dy54}`, `L${cx - dx54},${baseY + dy54}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`hexagon`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const inset = (shortest * Math.min(Math.max(adjValue(adj, `adj`, 25e3), 0), shortest > 0 ? (5e4 * w) / shortest : 5e4)) / 1e5;
  const midY = (h / 2) * 115470 / 1e5;
  const right = w - inset;
  const cy = h / 2;
  const dy = midY * Math.sin((60 * Math.PI) / 180);
  return [
    `M0,${cy}`, `L${inset},${cy - dy}`, `L${right},${cy - dy}`,
    `L${w},${cy}`, `L${right},${cy + dy}`, `L${inset},${cy + dy}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`octagon`, (w, h, adj) => {
  const r = (Math.min(w, h) * Math.min(Math.max(adjValue(adj, `adj`, 29289), 0), 5e4)) / 1e5;
  const ax = w - r, ay = h - r;
  return [
    `M0,${r}`, `L${r},0`, `L${ax},0`, `L${w},${r}`,
    `L${w},${ay}`, `L${ax},${h}`, `L${r},${h}`, `L0,${ay}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`heptagon`, (w, h) => {
  // 正七边形固定比例（原 jsx 7519-7528）
  const cx = w / 2;
  const rx = cx * 102572 / 1e5;
  const topY = (h / 2) * 105210 / 1e5;
  const baseY = (h / 2) * 105210 / 1e5;
  const dx1 = rx * 97493 / 1e5;
  const dx2 = rx * 78183 / 1e5;
  const dx3 = rx * 43388 / 1e5;
  const dy1 = topY * 62349 / 1e5;
  const dy2 = topY * 22252 / 1e5;
  const dy3 = topY * 90097 / 1e5;
  return [
    `M${cx - dx1},${baseY + dy2}`, `L${cx - dx2},${baseY - dy1}`, `L${cx},0`,
    `L${cx + dx2},${baseY - dy1}`, `L${cx + dx1},${baseY + dy2}`,
    `L${cx + dx3},${baseY + dy3}`, `L${cx - dx3},${baseY + dy3}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`decagon`, (w, h) => {
  const cx = w / 2, cy = h / 2;
  const ry = cy * 105146 / 1e5;
  const dx36 = cx * Math.cos((36 * Math.PI) / 180);
  const dx72 = cx * Math.cos((72 * Math.PI) / 180);
  const dy72 = ry * Math.sin((72 * Math.PI) / 180);
  const dy36 = ry * Math.sin((36 * Math.PI) / 180);
  return [
    `M0,${cy}`, `L${cx - dx36},${cy - dy36}`, `L${cx - dx72},${cy - dy72}`,
    `L${cx + dx72},${cy - dy72}`, `L${cx + dx36},${cy - dy36}`, `L${w},${cy}`,
    `L${cx + dx36},${cy + dy36}`, `L${cx + dx72},${cy + dy72}`,
    `L${cx - dx72},${cy + dy72}`, `L${cx - dx36},${cy + dy36}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`dodecagon`, (w, h) => {
  // 正十二边形：21600 网格固定比例（原 jsx 7537-7548）
  const x1 = (w * 2894) / 21600, x2 = (w * 7906) / 21600, x3 = (w * 13694) / 21600, x4 = (w * 18706) / 21600;
  const y1 = (h * 2894) / 21600, y2 = (h * 7906) / 21600, y3 = (h * 13694) / 21600, y4 = (h * 18706) / 21600;
  return [
    `M0,${y2}`, `L${x1},${y1}`, `L${x2},0`, `L${x3},0`, `L${x4},${y1}`,
    `L${w},${y2}`, `L${w},${y3}`, `L${x4},${y4}`, `L${x3},${h}`,
    `L${x2},${h}`, `L${x1},${y4}`, `L0,${y3}`, `Z`,
  ].join(` `);
});

/* --- 四边形族（原 jsx 7549-7575） --- */

PRESET_GEOMETRY_PATHS.set(`parallelogram`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const limit = shortest > 0 ? (1e5 * w) / shortest : 1e5;
  const inset = (shortest * Math.min(Math.max(adjValue(adj, `adj`, 25e3), 0), limit)) / 1e5;
  return `M0,${h} L${inset},0 L${w},0 L${w - inset},${h} Z`;
});

PRESET_GEOMETRY_PATHS.set(`trapezoid`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const limit = shortest > 0 ? (5e4 * w) / shortest : 5e4;
  const inset = (shortest * Math.min(Math.max(adjValue(adj, `adj`, 25e3), 0), limit)) / 1e5;
  return `M0,${h} L${inset},0 L${w - inset},0 L${w},${h} Z`;
});

PRESET_GEOMETRY_PATHS.set(`nonIsoscelesTrapezoid`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const limit = shortest > 0 ? (5e4 * w) / shortest : 5e4;
  const left = Math.min(Math.max(adjValue(adj, `adj1`, 25e3), 0), limit);
  const right = Math.min(Math.max(adjValue(adj, `adj2`, 25e3), 0), limit);
  return `M0,${h} L${(shortest * left) / 1e5},0 L${w - (shortest * right) / 1e5},0 L${w},${h} Z`;
});

PRESET_GEOMETRY_PATHS.set(`corner`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const vertical = Math.min(Math.max(adjRatio(adj, `adj1`, 5e4), 0), 1);
  const horizontal = shortest * Math.min(Math.max(adjRatio(adj, `adj2`, 5e4), 0), 1);
  const stepY = h - shortest * vertical;
  return [`M0,0`, `L${horizontal},0`, `L${horizontal},${stepY}`, `L${w},${stepY}`, `L${w},${h}`, `L0,${h}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`diagStripe`, (w, h, adj) => {
  const ratio = Math.min(Math.max(adjRatio(adj, `adj`, 5e4), 0), 1);
  const inset = w * ratio;
  return [`M0,${h * ratio}`, `L${inset},0`, `L${w},0`, `L0,${h}`, `Z`].join(` `);
});

/* --- 星形（原 jsx 7576-7687）：4/8/12/16/24/32 用生成器，5/6/7/10 专用公式 --- */

PRESET_GEOMETRY_PATHS.set(`star4`, (w, h, adj) => starPath(w, h, 4, Math.min(Math.max(adjRatio(adj, `adj`, 12500) * 2, 0), 1)));

PRESET_GEOMETRY_PATHS.set(`star5`, (w, h, adj) => {
  const inner = Math.min(Math.max(adjValue(adj, `adj`) ?? 19098, 0), 5e4);
  const scale = 110557;
  const cx = (w / 2) * 105146 / 1e5;
  const ry = (h / 2) * scale / 1e5;
  const baseY = (h / 2) * scale / 1e5;
  const innerRx = (cx * inner) / 5e4;
  const innerRy = (ry * inner) / 5e4;
  const midX = w / 2;
  const step = (2 * Math.PI) / 5;
  const half = step / 2;
  const start = -Math.PI / 2;
  const segments: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = start + step * i;
    const innerAngle = outerAngle + half;
    const ox = midX + cx * Math.cos(outerAngle);
    const oy = baseY + ry * Math.sin(outerAngle);
    const ix = midX + innerRx * Math.cos(innerAngle);
    const iy = baseY + innerRy * Math.sin(innerAngle);
    segments.push(i === 0 ? `M${ox},${oy}` : `L${ox},${oy}`);
    segments.push(`L${ix},${iy}`);
  }
  segments.push(`Z`);
  return segments.join(` `);
});

PRESET_GEOMETRY_PATHS.set(`star6`, (w, h, adj) => {
  const inner = Math.min(Math.max(adjValue(adj, `adj`) ?? 28868, 0), 5e4);
  const rx = (w / 2) * 115470 / 1e5;
  const ry = h / 2;
  const innerRx = (rx * inner) / 5e4;
  const innerRy = (ry * inner) / 5e4;
  const cx = w / 2, cy = h / 2;
  const step = (2 * Math.PI) / 6, half = step / 2, start = -Math.PI / 2;
  const segments: string[] = [];
  for (let i = 0; i < 6; i++) {
    const oa = start + step * i, ia = oa + half;
    segments.push(i === 0 ? `M${cx + rx * Math.cos(oa)},${cy + ry * Math.sin(oa)}` : `L${cx + rx * Math.cos(oa)},${cy + ry * Math.sin(oa)}`);
    segments.push(`L${cx + innerRx * Math.cos(ia)},${cy + innerRy * Math.sin(ia)}`);
  }
  segments.push(`Z`);
  return segments.join(` `);
});

PRESET_GEOMETRY_PATHS.set(`star7`, (w, h, adj) => {
  const inner = Math.min(Math.max(adjValue(adj, `adj`) ?? 34601, 0), 5e4);
  const rx = (w / 2) * 102572 / 1e5;
  const ry = (h / 2) * 105210 / 1e5;
  const baseY = ry;
  const innerRx = (rx * inner) / 5e4;
  const innerRy = (ry * inner) / 5e4;
  const cx = w / 2;
  const step = (2 * Math.PI) / 7, half = step / 2, start = -Math.PI / 2;
  const segments: string[] = [];
  for (let i = 0; i < 7; i++) {
    const oa = start + step * i, ia = oa + half;
    segments.push(i === 0 ? `M${cx + rx * Math.cos(oa)},${baseY + ry * Math.sin(oa)}` : `L${cx + rx * Math.cos(oa)},${baseY + ry * Math.sin(oa)}`);
    segments.push(`L${cx + innerRx * Math.cos(ia)},${baseY + innerRy * Math.sin(ia)}`);
  }
  segments.push(`Z`);
  return segments.join(` `);
});

PRESET_GEOMETRY_PATHS.set(`star8`, (w, h, adj) => starPath(w, h, 8, Math.min(Math.max(adjRatio(adj, `adj`, 37500) * 2, 0), 1)));
PRESET_GEOMETRY_PATHS.set(`star10`, (w, h, adj) => {
  const inner = Math.min(Math.max(adjValue(adj, `adj`) ?? 42533, 0), 5e4);
  const rx = (w / 2) * 105146 / 1e5;
  const ry = h / 2;
  const innerRx = (rx * inner) / 5e4;
  const innerRy = (ry * inner) / 5e4;
  const cx = w / 2, cy = h / 2;
  const step = (2 * Math.PI) / 10, half = step / 2, start = -Math.PI / 2;
  const segments: string[] = [];
  for (let i = 0; i < 10; i++) {
    const oa = start + step * i, ia = oa + half;
    segments.push(i === 0 ? `M${cx + rx * Math.cos(oa)},${cy + ry * Math.sin(oa)}` : `L${cx + rx * Math.cos(oa)},${cy + ry * Math.sin(oa)}`);
    segments.push(`L${cx + innerRx * Math.cos(ia)},${cy + innerRy * Math.sin(ia)}`);
  }
  segments.push(`Z`);
  return segments.join(` `);
});
PRESET_GEOMETRY_PATHS.set(`star12`, (w, h, adj) => starPath(w, h, 12, Math.min(Math.max(adjRatio(adj, `adj`, 37500) * 2, 0), 1)));
PRESET_GEOMETRY_PATHS.set(`star16`, (w, h, adj) => starPath(w, h, 16, Math.min(Math.max(adjRatio(adj, `adj`, 37500) * 2, 0), 1)));
PRESET_GEOMETRY_PATHS.set(`star24`, (w, h, adj) => starPath(w, h, 24, Math.min(Math.max(adjRatio(adj, `adj`, 37500) * 2, 0), 1)));
PRESET_GEOMETRY_PATHS.set(`star32`, (w, h, adj) => starPath(w, h, 32, Math.min(Math.max(adjRatio(adj, `adj`, 37500) * 2, 0), 1)));

/* --- 线/连接线（原 jsx 7688-7728） --- */

const lineOrConnector = (w: number, h: number, diagonal: `normal` | `inverted`) =>
  w === 0
    ? `M0.5,0 L0.5,${h || 1}`
    : h === 0
      ? `M0,0.5 L${w || 1},0.5`
      : diagonal === `normal`
        ? `M0,0 L${w},${h}`
        : `M${w},0 L0,${h}`;

PRESET_GEOMETRY_PATHS.set(`line`, (w, h) => lineOrConnector(w, h, `normal`));
PRESET_GEOMETRY_PATHS.set(`lineInv`, (w, h) => lineOrConnector(w, h, `inverted`));
PRESET_GEOMETRY_PATHS.set(`straightConnector1`, (w, h) => lineOrConnector(w, h, `normal`));
PRESET_GEOMETRY_PATHS.set(`bentConnector2`, (w, h) => `M0,0 L${w},0 L${w},${h}`);
PRESET_GEOMETRY_PATHS.set(`bentConnector3`, (w, h, adj) => {
  const bend = w * adjRatio(adj, `adj1`, 5e4);
  return `M0,0 L${bend},0 L${bend},${h} L${w},${h}`;
});
PRESET_GEOMETRY_PATHS.set(`bentConnector4`, (w, h, adj) => {
  const x = w * adjRatio(adj, `adj1`, 5e4);
  const y = h * adjRatio(adj, `adj2`, 5e4);
  return `M0,0 L${x},0 L${x},${y} L${w},${y} L${w},${h}`;
});
PRESET_GEOMETRY_PATHS.set(`bentConnector5`, (w, h, adj) => {
  const x1 = w * adjRatio(adj, `adj1`, 5e4);
  const y1 = h * adjRatio(adj, `adj2`, 5e4);
  const x2 = w * adjRatio(adj, `adj3`, 5e4);
  return `M0,0 L${x1},0 L${x1},${y1} L${x2},${y1} L${x2},${h} L${w},${h}`;
});
PRESET_GEOMETRY_PATHS.set(`curvedConnector2`, (w, h) => `M0,0 C${w / 2},0 ${w},${h / 2} ${w},${h}`);
PRESET_GEOMETRY_PATHS.set(`curvedConnector3`, (w, h, adj) => {
  const x = w * adjRatio(adj, `adj1`, 5e4);
  const halfX = x / 2;
  const midX = (w + x) / 2;
  const midY = h / 2;
  return `M0,0 C${halfX},0 ${x},${h / 4} ${x},${midY} C${x},${(h * 3) / 4} ${midX},${h} ${w},${h}`;
});
PRESET_GEOMETRY_PATHS.set(`curvedConnector4`, (w, h, adj) => {
  const x = w * adjRatio(adj, `adj1`, 5e4);
  const y = h * adjRatio(adj, `adj2`, 5e4);
  const c1x = x / 2, c2x = (x + (w + x) / 2) / 2, c3x = ((w + x) / 2 + w) / 2;
  const c1y = y / 2, c2y = (y / 2 + y) / 2, c3y = (h + y) / 2;
  return [
    `M0,0`,
    `C${c1x},0 ${x},${c1y} ${x},${c1y * 2}`,
    `C${x},${c2y} ${c2x},${y} ${(w + x) / 2},${y}`,
    `C${c3x},${y} ${w},${c3y} ${w},${h}`,
  ].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`curvedConnector5`, (w, h, adj) => {
  const x1 = w * adjRatio(adj, `adj1`, 5e4);
  const y1 = h * adjRatio(adj, `adj2`, 5e4);
  const x2 = w * adjRatio(adj, `adj3`, 5e4);
  const midX = (x1 + x2) / 2;
  const c1x = x1 / 2, c2x = (x1 + midX) / 2, c3x = (x2 + midX) / 2, c4x = (x2 + w) / 2;
  const c1y = y1 / 2, c2y = (y1 / 2 + y1) / 2, c3y = (y1 + h) / 2, c4y = ((h + y1) / 2 + h) / 2;
  return [
    `M0,0`,
    `C${c1x},0 ${x1},${c1y} ${x1},${c1y * 2}`,
    `C${x1},${c2y} ${c2x},${y1} ${midX},${y1}`,
    `C${c3x},${y1} ${x2},${c3y} ${x2},${(h + y1) / 2}`,
    `C${x2},${c4y} ${c4x},${h} ${w},${h}`,
  ].join(` `);
});

/* --- 直线箭头族（原 jsx 7733-8088；adj1=箭头宽比、adj2=箭头长比） --- */

PRESET_GEOMETRY_PATHS.set(`rightArrow`, (w, h, adj) => {
  const halfHead = (h * adjRatio(adj, `adj1`, 5e4)) / 2;
  const headLen = Math.min(w, h) * adjRatio(adj, `adj2`, 5e4);
  const cy = h / 2;
  const shaftEnd = w - headLen;
  return [
    `M0,${cy - halfHead}`, `L${shaftEnd},${cy - halfHead}`, `L${shaftEnd},0`,
    `L${w},${cy}`, `L${shaftEnd},${h}`, `L${shaftEnd},${cy + halfHead}`, `L0,${cy + halfHead}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`leftArrow`, (w, h, adj) => {
  const halfHead = (h * adjRatio(adj, `adj1`, 5e4)) / 2;
  const headLen = Math.min(w, h) * adjRatio(adj, `adj2`, 5e4);
  const cy = h / 2;
  return [
    `M${w},${cy - halfHead}`, `L${headLen},${cy - halfHead}`, `L${headLen},0`,
    `L0,${cy}`, `L${headLen},${h}`, `L${headLen},${cy + halfHead}`, `L${w},${cy + halfHead}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`upArrow`, (w, h, adj) => {
  const halfHead = (w * adjRatio(adj, `adj1`, 5e4)) / 2;
  const headLen = h * adjRatio(adj, `adj2`, 5e4);
  const cx = w / 2;
  return [
    `M${cx - halfHead},${h}`, `L${cx - halfHead},${headLen}`, `L0,${headLen}`,
    `L${cx},0`, `L${w},${headLen}`, `L${cx + halfHead},${headLen}`, `L${cx + halfHead},${h}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`downArrow`, (w, h, adj) => {
  const halfHead = (w * adjRatio(adj, `adj1`, 5e4)) / 2;
  const headLen = h * adjRatio(adj, `adj2`, 5e4);
  const cx = w / 2;
  const shaftEnd = h - headLen;
  return [
    `M${cx - halfHead},0`, `L${cx + halfHead},0`, `L${cx + halfHead},${shaftEnd}`,
    `L${w},${shaftEnd}`, `L${cx},${h}`, `L0,${shaftEnd}`, `L${cx - halfHead},${shaftEnd}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`leftRightArrow`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const cy = h / 2;
  const limit = shortest > 0 ? (5e4 * w) / shortest : 0;
  const halfHead = (shortest * Math.min(Math.max(adjValue(adj, `adj1`) ?? 5e4, 0), 1e5)) / 2e5;
  const headLen = (shortest * Math.min(Math.max(adjValue(adj, `adj2`) ?? 5e4, 0), limit)) / 1e5;
  const shaftEnd = w - headLen;
  return [
    `M0,${cy}`, `L${headLen},0`, `L${headLen},${cy - halfHead}`, `L${shaftEnd},${cy - halfHead}`,
    `L${shaftEnd},0`, `L${w},${cy}`, `L${shaftEnd},${h}`, `L${shaftEnd},${cy + halfHead}`,
    `L${headLen},${cy + halfHead}`, `L${headLen},${h}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`upDownArrow`, (w, h, adj) => {
  const halfHead = (Math.min(w, h) * Math.max(0, Math.min(adjValue(adj, `adj1`) ?? 5e4, 1e5))) / 2e5;
  const shortest = Math.min(w, h);
  const limit = (5e4 * h) / Math.max(shortest, 1);
  const headLen = (shortest * Math.max(0, Math.min(adjValue(adj, `adj2`) ?? 5e4, limit))) / 1e5;
  const cx = w / 2;
  return [
    `M${cx},0`, `L${w},${headLen}`, `L${cx + halfHead},${headLen}`, `L${cx + halfHead},${h - headLen}`,
    `L${w},${h - headLen}`, `L${cx},${h}`, `L0,${h - headLen}`, `L${cx - halfHead},${h - headLen}`,
    `L${cx - halfHead},${headLen}`, `L0,${headLen}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`notchedRightArrow`, (w, h, adj) => {
  const halfHead = (h * adjRatio(adj, `adj1`, 5e4)) / 2;
  const headLen = Math.min(w, h) * adjRatio(adj, `adj2`, 5e4);
  const cy = h / 2;
  const shaftEnd = w - headLen;
  const notch = cy > 0 ? (halfHead * headLen) / cy : 0;
  return [
    `M0,${cy - halfHead}`, `L${shaftEnd},${cy - halfHead}`, `L${shaftEnd},0`,
    `L${w},${cy}`, `L${shaftEnd},${h}`, `L${shaftEnd},${cy + halfHead}`,
    `L0,${cy + halfHead}`, `L${notch},${cy}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`chevron`, (w, h, adj) => {
  const inset = Math.min(w, h) * adjRatio(adj, `adj`, 5e4);
  return [`M0,0`, `L${w - inset},0`, `L${w},${h / 2}`, `L${w - inset},${h}`, `L0,${h}`, `L${inset},${h / 2}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`homePlate`, (w, h, adj) => {
  const inset = w - Math.min(w, h) * adjRatio(adj, `adj`, 5e4);
  return [`M0,0`, `L${inset},0`, `L${w},${h / 2}`, `L${inset},${h}`, `L0,${h}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`stripedRightArrow`, (w, h, adj) => {
  // 竖条纹 + 箭头（原 jsx 7986-7997）：条纹宽度按最短边 1/32..5/32 分级
  const shortest = Math.min(w, h);
  const limit = shortest > 0 ? (84375 * w) / shortest : 84375;
  const halfHead = (h * Math.min(Math.max(adjValue(adj, `adj1`, 5e4), 0), 1e5)) / 2e5;
  const headLen = (shortest * Math.min(Math.max(adjValue(adj, `adj2`, 5e4), 0), limit)) / 1e5;
  const cy = h / 2;
  const shaftEnd = w - headLen;
  const s1 = shortest / 32, s2 = shortest / 16, s3 = shortest / 8, s4 = (shortest * 5) / 32;
  return [
    `M0,${cy - halfHead} L${s1},${cy - halfHead} L${s1},${cy + halfHead} L0,${cy + halfHead} Z`,
    `M${s2},${cy - halfHead} L${s3},${cy - halfHead} L${s3},${cy + halfHead} L${s2},${cy + halfHead} Z`,
    `M${s4},${cy - halfHead}`, `L${shaftEnd},${cy - halfHead}`, `L${shaftEnd},0`,
    `L${w},${cy}`, `L${shaftEnd},${h}`, `L${shaftEnd},${cy + halfHead}`, `L${s4},${cy + halfHead}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`quadArrow`, (w, h, adj) => {
  // 四向箭头（原 jsx 8475-8499）
  const adj1 = adjValue(adj, `adj1`, 22500) ?? 22500;
  const adj2 = adjValue(adj, `adj2`, 22500) ?? 22500;
  const adj3 = adjValue(adj, `adj3`, 22500) ?? 22500;
  const shortest = Math.min(w, h);
  const headRatio = Math.max(0, Math.min(adj2, 5e4));
  const shaftRatio = Math.max(0, Math.min(adj1, 2 * headRatio));
  const headLen = (shortest * Math.max(0, Math.min(adj3, (1e5 - 2 * headRatio) / 2))) / 1e5;
  const halfHead = (shortest * headRatio) / 1e5;
  const halfShaft = (shortest * shaftRatio) / 2e5;
  const cx = w / 2, cy = h / 2;
  const bx = w - headLen, by = h - headLen;
  return [
    `M0,${cy}`, `L${headLen},${cy - halfHead}`, `L${headLen},${cy - halfShaft}`, `L${cx - halfShaft},${cy - halfShaft}`,
    `L${cx - halfShaft},${headLen}`, `L${cx - halfHead},${headLen}`, `L${cx},0`, `L${cx + halfHead},${headLen}`,
    `L${cx + halfShaft},${headLen}`, `L${cx + halfShaft},${cy - halfShaft}`, `L${bx},${cy - halfShaft}`,
    `L${bx},${cy - halfHead}`, `L${w},${cy}`, `L${bx},${cy + halfHead}`, `L${bx},${cy + halfShaft}`,
    `L${cx + halfShaft},${cy + halfShaft}`, `L${cx + halfShaft},${by}`, `L${cx + halfHead},${by}`,
    `L${cx},${h}`, `L${cx - halfHead},${by}`, `L${cx - halfShaft},${by}`, `L${cx - halfShaft},${cy + halfShaft}`,
    `L${headLen},${cy + halfShaft}`, `L${headLen},${cy + halfHead}`, `Z`,
  ].join(` `);
});

/* --- 呼出/立方/十字/心形/云/框/环/禁烟/块弧（原 jsx 8804-8948） --- */

PRESET_GEOMETRY_PATHS.set(`borderCallout1`, (w, h, adj) => {
  const y1 = h * (adjValue(adj, `adj1`, 18750) ?? 18750) / 1e5;
  const x1 = w * (adjValue(adj, `adj2`, -8333) ?? -8333) / 1e5;
  const y2 = h * (adjValue(adj, `adj3`, 112500) ?? 112500) / 1e5;
  return `M0,0 L${w},0 L${w},${h} L0,${h} Z M${x1},${y1} L${w * (adjValue(adj, `adj4`, -38333) ?? -38333) / 1e5},${y2}`;
});

PRESET_GEOMETRY_PATHS.set(`cube`, (w, h, adj) => {
  const inset = Math.min(w, h) * adjRatio(adj, `adj`, 25e3);
  return [
    `M0,${inset} L${w - inset},${inset} L${w - inset},${h} L0,${h} Z`,
    `M0,${inset} L${inset},0 L${w},0 L${w - inset},${inset} Z`,
    `M${w - inset},${inset} L${w},0 L${w},${h - inset} L${w - inset},${h} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`plus`, (w, h, adj) => {
  const arm = (Math.min(w, h) * Math.min(Math.max(adjValue(adj, `adj`, 25e3), 0), 5e4)) / 1e5;
  const ax = w - arm, ay = h - arm;
  return [
    `M0,${arm}`, `L${arm},${arm}`, `L${arm},0`, `L${ax},0`, `L${ax},${arm}`, `L${w},${arm}`,
    `L${w},${ay}`, `L${ax},${ay}`, `L${ax},${h}`, `L${arm},${h}`, `L${arm},${ay}`, `L0,${ay}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`heart`, (w, h) => {
  const cx = w / 2;
  const topY = h / 4;
  const dip = h / 3;
  const wide = (w * 49) / 48;
  const narrow = (w * 10) / 48;
  const leftFar = cx - wide;
  const leftNear = cx - narrow;
  const rightNear = cx + narrow;
  const rightFar = cx + wide;
  const ctrlY = -dip;
  return [`M${cx},${topY}`, `C${rightNear},${ctrlY} ${rightFar},${topY} ${cx},${h}`, `C${leftFar},${topY} ${leftNear},${ctrlY} ${cx},${topY}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`cloud`, (w, h) => {
  // 11 段椭圆弧连缀（原 jsx 8831-8858；43200 网格弧参数表）
  const sx = w / 43200;
  const sy = h / 43200;
  const arcs = [
    [6753, 9190, -11429249, 7426832], [5333, 7267, -8646143, 5396714],
    [4365, 5945, -8748475, 5983381], [4857, 6595, -7859164, 7034504],
    [5333, 7273, -4722533, 6541615], [6775, 9220, -2776035, 7816140],
    [5785, 7867, 37501, 6842e3], [6752, 9215, 1347096, 6910353],
    [7720, 10543, 3974558, 4542661], [4360, 5918, -16496525, 8804134],
    [4345, 5945, -14809710, 9151131],
  ];
  let px = 3900 * sx;
  let py = 14370 * sy;
  const out = [`M${px},${py}`];
  let ux = 3900, uy = 14370;
  for (const [rx, ry, startMilli, sweepMilli] of arcs) {
    const startDeg = startMilli / 6e4;
    const sweepDeg = sweepMilli / 6e4;
    const startRad = (startDeg * Math.PI) / 180;
    const startTheta = Math.atan2(rx * Math.sin(startRad), ry * Math.cos(startRad));
    const endRad = ((startDeg + sweepDeg) * Math.PI) / 180;
    const endTheta = Math.atan2(rx * Math.sin(endRad), ry * Math.cos(endRad));
    const cx0 = ux - rx * Math.cos(startTheta);
    const cy0 = uy - ry * Math.sin(startTheta);
    const ex0 = cx0 + rx * Math.cos(endTheta);
    const ey0 = cy0 + ry * Math.sin(endTheta);
    out.push(`A${rx * sx},${ry * sy} 0 ${+(Math.abs(sweepDeg) > 180)},${+(sweepDeg > 0)} ${ex0 * sx},${ey0 * sy}`);
    ux = ex0; uy = ey0; px = ex0 * sx; py = ey0 * sy;
  }
  out.push(`Z`);
  return out.join(` `);
});

PRESET_GEOMETRY_PATHS.set(`frame`, (w, h, adj) => {
  const inset = Math.min(w, h) * adjRatio(adj, `adj1`, 12500);
  return [`M0,0 L${w},0 L${w},${h} L0,${h} Z`, `M${inset},${inset} L${inset},${h - inset} L${w - inset},${h - inset} L${w - inset},${inset} Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`halfFrame`, (w, h, adj) => {
  const adj1 = adjValue(adj, `adj1`, 33333) ?? 33333;
  const adj2 = adjValue(adj, `adj2`, 33333) ?? 33333;
  const shortest = Math.min(w, h);
  const outer = (shortest * Math.max(0, Math.min(adj2, (1e5 * w) / Math.max(shortest, 1)))) / 1e5;
  const innerY = h - (h * outer) / Math.max(w, 1);
  const inner = (shortest * Math.max(0, Math.min(adj1, (1e5 * innerY) / Math.max(shortest, 1)))) / 1e5;
  const slantX = w - (inner * w) / Math.max(h, 1);
  const slantY = h - (outer * h) / Math.max(w, 1);
  return [`M0,0`, `L${w},0`, `L${slantX},${inner}`, `L${outer},${inner}`, `L${outer},${slantY}`, `L0,${h}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`donut`, (w, h, adj) => {
  const thickness = (Math.min(w, h) * Math.min(Math.max(adjValue(adj, `adj`, 25e3), 0), 5e4)) / 1e5;
  const rx = w / 2, ry = h / 2;
  const innerRx = Math.max(0, rx - thickness);
  const innerRy = Math.max(0, ry - thickness);
  return [
    `M0,${ry}`, `A${rx},${ry} 0 1,1 ${w},${ry}`, `A${rx},${ry} 0 1,1 0,${ry}`, `Z`,
    `M${thickness},${ry}`, `A${innerRx},${innerRy} 0 1,0 ${w - thickness},${ry}`, `A${innerRx},${innerRy} 0 1,0 ${thickness},${ry}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`noSmoking`, (w, h, adj) => {
  // 禁烟标志：外圆 + 斜杠两侧的两个弧缺口（原 jsx 8880-8917）
  const band = (Math.min(w, h) * Math.min(Math.max(adjValue(adj, `adj`, 18750), 0), 5e4)) / 1e5;
  const rx = w / 2, ry = h / 2;
  const cx = w / 2, cy = h / 2;
  const innerRx = rx - band;
  const innerRy = ry - band;
  const diagAngle = Math.atan2(h, w);
  const dx = innerRy * Math.cos(diagAngle);
  const dy = innerRx * Math.sin(diagAngle);
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const tangent = (innerRx * innerRy) / dist;
  const halfBand = band / 2;
  const halfAngle = Math.atan2(halfBand, tangent);
  const sweep = halfAngle * 2;
  const arcSweep = -(Math.PI - sweep);
  const startAngle = diagAngle - halfAngle;
  const oppositeAngle = startAngle - Math.PI;
  const pointAt = (angle: number) => {
    const px = innerRy * Math.cos(angle);
    const py = innerRx * Math.sin(angle);
    const d = Math.sqrt(px * px + py * py) || 1;
    const r = (innerRx * innerRy) / d;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };
  const p1 = pointAt(startAngle);
  const p2 = pointAt(oppositeAngle);
  const endAngle = startAngle + arcSweep;
  const oppositeEnd = oppositeAngle + arcSweep;
  const p3 = pointAt(endAngle);
  const p4 = pointAt(oppositeEnd);
  const large = +(Math.abs(arcSweep) > Math.PI);
  const sweepFlag = +(arcSweep > 0);
  return [
    `M0,${cy}`, `A${rx},${ry} 0 1,1 ${w},${cy}`, `A${rx},${ry} 0 1,1 0,${cy}`, `Z`,
    `M${p1.x},${p1.y}`, `A${innerRx},${innerRy} 0 ${large},${sweepFlag} ${p3.x},${p3.y}`, `Z`,
    `M${p2.x},${p2.y}`, `A${innerRx},${innerRy} 0 ${large},${sweepFlag} ${p4.x},${p4.y}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`blockArc`, (w, h, adj) => {
  // 环形扇区：adj1 起始角、adj2 终止角（60000 制）、adj3 厚度（原 jsx 8918-8946）
  const startMilli = adjValue(adj, `adj1`, 108e5) ?? 108e5;
  const endMilli = adjValue(adj, `adj2`, 0) ?? 0;
  const thicknessAdj = adjValue(adj, `adj3`, 25e3) ?? 25e3;
  const startDeg = Math.min(Math.max(startMilli / 6e4, 0), 360);
  const endDeg = Math.min(Math.max(endMilli / 6e4, 0), 360);
  const sweep = (endDeg - startDeg + 360) % 360 || 360;
  const outerEnd = startDeg + sweep;
  const innerStart = endDeg - sweep;
  const cx = w / 2, cy = h / 2;
  const thickness = (Math.min(w, h) * Math.max(0, Math.min(thicknessAdj, 5e4))) / 1e5;
  const innerRx = Math.max(1, cx - thickness);
  const innerRy = Math.max(1, cy - thickness);
  const pointAt = (px: number, py: number, rx: number, ry: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: px + rx * Math.cos(rad), y: py + ry * Math.sin(rad) };
  };
  const o1 = pointAt(cx, cy, cx, cy, startDeg);
  const o2 = pointAt(cx, cy, cx, cy, outerEnd);
  const i1 = pointAt(cx, cy, innerRx, innerRy, endDeg);
  const i2 = pointAt(cx, cy, innerRx, innerRy, innerStart);
  const large = +(sweep > 180);
  return [`M${o1.x},${o1.y}`, `A${cx},${cy} 0 ${large},1 ${o2.x},${o2.y}`, `L${i1.x},${i1.y}`, `A${innerRx},${innerRy} 0 ${large},0 ${i2.x},${i2.y}`, `Z`].join(` `);
});

/* --- 齿轮（原 gear6/gear9 → Oi，jsx 8946-9002） --- */

function gearPath(w: number, h: number, teeth: number, toothDepthAdj: number, toothWidthAdj: number): string {
  const cx = w / 2, cy = h / 2;
  const shortest = Math.min(w, h);
  const widthLimit = teeth === 6 ? 5358 : 2679;
  const depth = Math.min(Math.max(toothDepthAdj, 0), 2e4);
  const width = Math.min(Math.max(toothWidthAdj, 0), widthLimit);
  const toothDepth = (shortest * depth) / 1e5;
  const toothWidth = (shortest * width) / 1e5;
  const bodyRx = w / 2 - toothDepth;
  const bodyRy = h / 2 - toothDepth;
  if (bodyRx <= 0 || bodyRy <= 0) return `M0,0 L${w},0 L${w},${h} L0,${h} Z`;
  const halfSpan = toothDepth / 2 + toothWidth / 2;
  const halfAngle = Math.atan2(halfSpan, Math.min(bodyRx, bodyRy));
  const angles = teeth === 6 ? [330, 30, 90, 150, 210, 270] : [310, 350, 30, 70, 110, 150, 190, 230, 270];
  const out: string[] = [];
  for (let i = 0; i < angles.length; i++) {
    const theta = (angles[i] * Math.PI) / 180;
    const start = theta - halfAngle;
    const end = theta + halfAngle;
    const sx = cx + bodyRx * Math.cos(start);
    const sy = cy + bodyRy * Math.sin(start);
    const ex = cx + bodyRx * Math.cos(end);
    const ey = cy + bodyRy * Math.sin(end);
    const dx = ex - sx, dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const radialX = Math.cos(theta), radialY = Math.sin(theta);
    let normalX = radialX, normalY = radialY;
    len > 0 && ((normalX = -dy / len), (normalY = dx / len));
    normalX * radialX + normalY * radialY < 0 && ((normalX = -normalX), (normalY = -normalY));
    const alongX = len > 0 ? dx / len : 0;
    const alongY = len > 0 ? dy / len : 0;
    const toothStartX = sx + alongX * toothWidth;
    const toothStartY = sy + alongY * toothWidth;
    const toothEndX = ex - alongX * toothWidth;
    const toothEndY = ey - alongY * toothWidth;
    const outerStartX = toothStartX + normalX * toothDepth;
    const outerStartY = toothStartY + normalY * toothDepth;
    const outerEndX = toothEndX + normalX * toothDepth;
    const outerEndY = toothEndY + normalY * toothDepth;
    if (i === 0) {
      const prevEnd = (angles[angles.length - 1] * Math.PI) / 180 + halfAngle;
      out.push(`M${cx + bodyRx * Math.cos(prevEnd)},${cy + bodyRy * Math.sin(prevEnd)}`);
      out.push(`A${bodyRx},${bodyRy} 0 0,1 ${sx},${sy}`);
    }
    out.push(`L${outerStartX},${outerStartY}`);
    out.push(`L${outerEndX},${outerEndY}`);
    out.push(`L${ex},${ey}`);
    if (i < angles.length - 1) {
      const nextStart = (angles[i + 1] * Math.PI) / 180 - halfAngle;
      out.push(`A${bodyRx},${bodyRy} 0 0,1 ${cx + bodyRx * Math.cos(nextStart)},${cy + bodyRy * Math.sin(nextStart)}`);
    }
  }
  out.push(`Z`);
  return out.join(` `);
}

PRESET_GEOMETRY_PATHS.set(`gear6`, (w, h, adj) => gearPath(w, h, 6, adjValue(adj, `adj1`, 15e3) ?? 15e3, adjValue(adj, `adj2`, 3526) ?? 3526));
PRESET_GEOMETRY_PATHS.set(`gear9`, (w, h, adj) => gearPath(w, h, 9, adjValue(adj, `adj1`, 1e4) ?? 1e4, adjValue(adj, `adj2`, 1763) ?? 1763));

/* --- 数学符号（原 mathPlus..mathNotEqual，jsx 9003-9150） --- */

PRESET_GEOMETRY_PATHS.set(`mathPlus`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const armAdj = Math.min(Math.max(adjValue(adj, `adj`, 23520), 0), 73490);
  const armLen = (w * 73490) / 2e5;
  const armLenY = (h * 73490) / 2e5;
  const halfArm = (shortest * armAdj) / 2e5;
  const cx = w / 2, cy = h / 2;
  const x1 = cx - armLen, x2 = cx - halfArm, x3 = cx + halfArm, x4 = cx + armLen;
  const y1 = cy - armLenY, y2 = cy - halfArm, y3 = cy + halfArm, y4 = cy + armLenY;
  return [
    `M${x1},${y2}`, `L${x2},${y2}`, `L${x2},${y1}`, `L${x3},${y1}`, `L${x3},${y2}`, `L${x4},${y2}`,
    `L${x4},${y3}`, `L${x3},${y3}`, `L${x3},${y4}`, `L${x2},${y4}`, `L${x2},${y3}`, `L${x1},${y3}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`mathMinus`, (w, h, adj) => {
  const halfArm = (h * Math.min(Math.max(adjValue(adj, `adj1`, 23520), 0), 1e5)) / 2e5;
  const halfLen = (w * 73490) / 2e5;
  const cx = w / 2, cy = h / 2;
  return `M${cx - halfLen},${cy - halfArm} L${cx + halfLen},${cy - halfArm} L${cx + halfLen},${cy + halfArm} L${cx - halfLen},${cy + halfArm} Z`;
});

PRESET_GEOMETRY_PATHS.set(`mathMultiply`, (w, h, adj) => {
  // 斜十字（原 jsx 9031-9058）：对角线方向的两条矩形带相交
  const shortest = Math.min(w, h);
  const cx = w / 2, cy = h / 2;
  const arm = (shortest * Math.min(Math.max(adjValue(adj, `adj1`, 23520), 0), 51965)) / 1e5;
  const diagAngle = Math.atan2(h, w);
  const sinA = Math.sin(diagAngle), cosA = Math.cos(diagAngle);
  const slope = sinA / cosA;
  const diagLen = Math.sqrt(w * w + h * h);
  const inset = diagLen - (diagLen * 51965) / 1e5;
  const dx = (cosA * inset) / 2, dy = (sinA * inset) / 2;
  const ax = (sinA * arm) / 2, ay = (cosA * arm) / 2;
  const p1x = dx - ax, p1y = dy + ay;
  const p2x = dx + ax, p2y = dy - ay;
  const midY = (cx - p2x) * slope + p2y;
  const rightX = w - p2x;
  const rightX2 = w - p1x;
  const midX = (cy - p1y) / slope;
  const leftX = rightX2 - midX;
  const joinX = p1x + midX;
  const bottomY = h - p1y;
  const bottomY2 = h - p2y;
  const midY2 = h - midY;
  return [
    `M${p1x},${p1y}`, `L${p2x},${p2y}`, `L${cx},${midY}`, `L${rightX},${p2y}`, `L${rightX2},${p1y}`,
    `L${leftX},${cy}`, `L${rightX2},${bottomY}`, `L${rightX},${bottomY2}`, `L${cx},${midY2}`,
    `L${p2x},${bottomY2}`, `L${p1x},${bottomY}`, `L${joinX},${cy}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`mathDivide`, (w, h, adj) => {
  const barAdj = Math.min(Math.max(adjValue(adj, `adj1`, 23520) ?? 23520, 1e3), 36745);
  const gapLimit = Math.min((73490 - barAdj) / 4, (36745 * w) / Math.max(h, 1));
  const dotAdj = Math.min(Math.max(adjValue(adj, `adj3`, 11760) ?? 11760, 1e3), gapLimit);
  const gapRemain = 73490 - 4 * dotAdj - barAdj;
  const gapAdj = Math.min(Math.max(adjValue(adj, `adj2`, 5880) ?? 5880, 0), gapRemain);
  const cx = w / 2, cy = h / 2;
  const halfBar = (h * barAdj) / 2e5;
  const gap = (h * gapAdj) / 1e5;
  const dotR = (h * dotAdj) / 1e5;
  const halfLen = (w * 73490) / 2e5;
  const barTop = cy - halfBar, barBottom = cy + halfBar;
  const dotTopY = barTop - (gap + dotR) - dotR;
  const dotBottomY = h - dotTopY;
  const x1 = cx - halfLen, x2 = cx + halfLen;
  return [
    `M${cx + dotR},${dotTopY + dotR} A${dotR},${dotR} 0 1,1 ${cx - dotR},${dotTopY + dotR} A${dotR},${dotR} 0 1,1 ${cx + dotR},${dotTopY + dotR} Z`,
    `M${cx + dotR},${dotBottomY - dotR} A${dotR},${dotR} 0 1,1 ${cx - dotR},${dotBottomY - dotR} A${dotR},${dotR} 0 1,1 ${cx + dotR},${dotBottomY - dotR} Z`,
    `M${x1},${barTop} L${x2},${barTop} L${x2},${barBottom} L${x1},${barBottom} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`mathEqual`, (w, h, adj) => {
  const barAdj = Math.min(Math.max(adjValue(adj, `adj1`, 23520) ?? 23520, 0), 36745);
  const gapMax = 1e5 - barAdj * 2;
  const gapAdj = Math.min(Math.max(adjValue(adj, `adj2`, 11760) ?? 11760, 0), Math.max(gapMax, 0));
  const halfBar = (h * barAdj) / 1e5;
  const halfGap = (h * gapAdj) / 2e5;
  const halfLen = (w * 73490) / 2e5;
  const cx = w / 2, cy = h / 2;
  const gapTop = cy - halfGap, gapBottom = cy + halfGap;
  const topBarTop = gapTop - halfBar, bottomBarBottom = gapBottom + halfBar;
  const x1 = cx - halfLen, x2 = cx + halfLen;
  return [
    `M${x1},${topBarTop} L${x2},${topBarTop} L${x2},${gapTop} L${x1},${gapTop} Z`,
    `M${x1},${gapBottom} L${x2},${gapBottom} L${x2},${bottomBarBottom} L${x1},${bottomBarBottom} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`mathNotEqual`, (w, h, adj) => {
  // 双横线 + 斜杠（原 jsx 9099-9150；adj2 为斜杠角度，钳制 70°-110°）
  const barAdj = Math.min(Math.max(adjValue(adj, `adj1`, 23520) ?? 23520, 0), 5e4);
  const angleAdj = adjValue(adj, `adj2`);
  const gapAdjRaw = adjValue(adj, `adj3`, 11760) ?? 11760;
  const cx = w / 2, cy = h / 2, halfH = h / 2;
  const slashAngle = (() => {
    if (angleAdj === void 0) return (110 * Math.PI) / 180;
    const raw = ((angleAdj / 6e4) * Math.PI) / 180;
    return Math.min(Math.max(raw, (70 * Math.PI) / 180), (110 * Math.PI) / 180);
  })();
  const gapMax = 1e5 - barAdj * 2;
  const gapAdj = Math.min(Math.max(gapAdjRaw, 0), gapMax);
  const halfBar = (h * barAdj) / 1e5;
  const halfGap = (h * gapAdj) / 2e5;
  const halfLen = (w * 73490) / 2e5;
  const x1 = cx - halfLen, x2 = cx + halfLen;
  const gapTop = cy - halfGap, gapBottom = cy + halfGap;
  const topBarTop = gapTop - halfBar, bottomBarBottom = gapBottom + halfBar;
  const tilt = slashAngle - Math.PI / 2;
  const run = halfH * Math.tan(tilt);
  const slashLen = Math.hypot(run, halfH) || 1;
  const bandLen = (slashLen * halfBar) / halfH;
  const halfBand = bandLen / 2;
  const baseX = cx + run - halfBand;
  const topX = baseX - (run * topBarTop) / halfH;
  const gapTopX = baseX - (run * gapTop) / halfH;
  const gapBottomX = baseX - (run * gapBottom) / halfH;
  const bottomX = baseX - (run * bottomBarBottom) / halfH;
  const baseX2 = baseX + bandLen;
  const topX2 = topX + bandLen;
  const gapTopX2 = gapTopX + bandLen;
  const gapBottomX2 = gapBottomX + bandLen;
  const bottomX2 = bottomX + bandLen;
  const horizBand = (halfBar * halfH) / slashLen;
  const slashTopX = tilt > 0 ? baseX + horizBand : baseX2;
  const slashTopX2 = tilt > 0 ? baseX : baseX2 - horizBand;
  const vertBand = (halfBar * run) / slashLen;
  const topY = tilt > 0 ? vertBand : 0;
  const topY2 = tilt > 0 ? 0 : -vertBand;
  const mirrorX = w - slashTopX;
  const mirrorX2 = w - slashTopX2;
  const mirrorY = h - topY;
  const mirrorY2 = h - topY2;
  return [
    `M${x1},${topBarTop}`, `L${topX},${topBarTop}`, `L${slashTopX2},${topY2}`, `L${slashTopX},${topY}`,
    `L${topX2},${topBarTop}`, `L${x2},${topBarTop}`, `L${x2},${gapTop}`, `L${gapTopX2},${gapTop}`,
    `L${gapBottomX2},${gapBottom}`, `L${x2},${gapBottom}`, `L${x2},${bottomBarBottom}`, `L${bottomX2},${bottomBarBottom}`,
    `L${mirrorX2},${mirrorY2}`, `L${mirrorX},${mirrorY}`, `L${bottomX},${bottomBarBottom}`, `L${x1},${bottomBarBottom}`,
    `L${x1},${gapBottom}`, `L${gapBottomX},${gapBottom}`, `L${gapTopX},${gapTop}`, `L${x1},${gapTop}`, `Z`,
  ].join(` `);
});

/* --- 圆角/剪角矩形族（原 jsx 9151-9199） --- */

PRESET_GEOMETRY_PATHS.set(`round1Rect`, (w, h, adj) => {
  const r = Math.min(w, h) * adjRatio(adj, `adj`, 16667);
  return [`M0,0`, `L${w - r},0`, `A${r},${r} 0 0,1 ${w},${r}`, `L${w},${h}`, `L0,${h}`, `Z`].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`round2SameRect`, (w, h, adj) => {
  const r1 = Math.min(w, h) * adjRatio(adj, `adj1`, 16667);
  const r2 = Math.min(w, h) * adjRatio(adj, `adj2`, 0);
  return [
    `M${r1},0`, `L${w - r1},0`, `A${r1},${r1} 0 0,1 ${w},${r1}`, `L${w},${h - r2}`,
    `A${r2},${r2} 0 0,1 ${w - r2},${h}`, `L${r2},${h}`, `A${r2},${r2} 0 0,1 0,${h - r2}`,
    `L0,${r1}`, `A${r1},${r1} 0 0,1 ${r1},0`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`round2DiagRect`, (w, h, adj) => {
  const r1 = Math.min(w, h) * adjRatio(adj, `adj1`, 16667);
  const r2 = Math.min(w, h) * adjRatio(adj, `adj2`, 0);
  return [
    `M${r1},0`, `L${w},0`, `L${w},${h - r2}`, `A${r2},${r2} 0 0,1 ${w - r2},${h}`,
    `L0,${h}`, `L0,${r1}`, `A${r1},${r1} 0 0,1 ${r1},0`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`snip1Rect`, (w, h, adj) => {
  const r = Math.min(w, h) * adjRatio(adj, `adj`, 16667);
  return `M0,0 L${w - r},0 L${w},${r} L${w},${h} L0,${h} Z`;
});

PRESET_GEOMETRY_PATHS.set(`snip2SameRect`, (w, h, adj) => {
  const r1 = Math.min(w, h) * adjRatio(adj, `adj1`, 16667);
  const r2 = Math.min(w, h) * adjRatio(adj, `adj2`, 0);
  return `M${r1},0 L${w - r1},0 L${w},${r1} L${w},${h - r2} L${w - r2},${h} L${r2},${h} L0,${h - r2} L0,${r1} Z`;
});

PRESET_GEOMETRY_PATHS.set(`snip2DiagRect`, (w, h, adj) => {
  const shortest = Math.min(w, h);
  const c1 = Math.min(Math.max(adjValue(adj, `adj1`, 0) ?? 0, 0), 5e4);
  const c2 = Math.min(Math.max(adjValue(adj, `adj2`, 16667) ?? 16667, 0), 5e4);
  const cut1 = (shortest * c1) / 1e5;
  const ax = w - cut1, ay = h - cut1;
  const cut2 = (shortest * c2) / 1e5;
  return `M${cut1},0 L${w - cut2},0 L${w},${cut2} L${w},${ay} L${ax},${h} L${cut2},${h} L0,${h - cut2} L0,${cut1} Z`;
});

PRESET_GEOMETRY_PATHS.set(`snipRoundRect`, (w, h, adj) => {
  const r1 = Math.min(w, h) * adjRatio(adj, `adj1`, 16667);
  const r2 = Math.min(w, h) * adjRatio(adj, `adj2`, 16667);
  return [
    `M${r1},0`, `L${w - r2},0`, `L${w},${r2}`, `L${w},${h}`, `L0,${h}`, `L0,${r1}`,
    `A${r1},${r1} 0 0,1 ${r1},0`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`bevel`, (w, h, adj) => {
  // 单路径版（多区域版在 MULTI_REGION_SHAPES 中，渲染器按多区域优先）
  const inset = Math.min(w, h) * adjRatio(adj, `adj`, 12500);
  return [
    `M0,0 L${w},0 L${w},${h} L0,${h} Z`,
    `M${inset},${inset} L${inset},${h - inset} L${w - inset},${h - inset} L${w - inset},${inset} Z`,
    `M0,0 L${w},0 L${w - inset},${inset} L${inset},${inset} Z`,
    `M${w},0 L${w},${h} L${w - inset},${h - inset} L${w - inset},${inset} Z`,
    `M${w},${h} L0,${h} L${inset},${h - inset} L${w - inset},${h - inset} Z`,
    `M0,${h} L0,0 L${inset},${inset} L${inset},${h - inset} Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`foldedCorner`, (w, h, adj) => {
  const fold = Math.min(w, h) * adjRatio(adj, `adj`, 16667) * 0.7;
  return [`M0,0 L${w},0 L${w},${h} L0,${h} Z`, `M${w - fold},${h} L${w},${h} L${w},${h - fold}`].join(` `);
});

/* --- 流程图族（原 flowChart*，jsx 8555-8729；全量转录简单条目） --- */

PRESET_GEOMETRY_PATHS.set(`flowChartProcess`, (w, h) => `M0,0 L${w},0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`flowChartDecision`, (w, h) => {
  const cx = w / 2, cy = h / 2;
  return `M${cx},0 L${w},${cy} L${cx},${h} L0,${cy} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartTerminator`, (w, h) => {
  const inset = (w * 3475) / 21600;
  const right = (w * 18125) / 21600;
  const rx = inset, ry = h / 2;
  return [`M${inset},0`, `L${right},0`, `A${rx},${ry} 0 0,1 ${right},${h}`, `L${inset},${h}`, `A${rx},${ry} 0 0,1 ${inset},0`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartDocument`, (w, h) => {
  // 波浪底边文档（原 jsx 8583；21600 网格比例）
  const waveTop = (h * 17322) / 21600;
  const ctrlA = waveTop;
  const ctrlB = (h * 23922) / 21600;
  const waveEnd = (h * 20172) / 21600;
  return [`M0,0`, `L${w},0`, `L${w},${waveTop}`, `C${w / 2},${ctrlA} ${w / 2},${ctrlB} 0,${waveEnd}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartInputOutput`, (w, h) => {
  const slant = w * 0.2;
  return `M${slant},0 L${w},0 L${w - slant},${h} L0,${h} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartPredefinedProcess`, (w, h) => {
  const inset = w / 8;
  return [`M0,0 L${w},0 L${w},${h} L0,${h} Z`, `M${inset},0 L${inset},${h}`, `M${w - inset},0 L${w - inset},${h}`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartAlternateProcess`, (w, h) => {
  const r = w / 6;
  return [`M0,0`, `L${w - r},0`, `A${r},${h / 2} 0 0,1 ${w - r},${h}`, `L0,${h}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartManualInput`, (w, h) => {
  const slant = h * 0.2;
  return `M0,${slant} L${w},0 L${w},${h} L0,${h} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartManualOperation`, (w, h) => {
  const slant = w * 0.2;
  const cy = h / 2;
  return `M${slant},0 L${w - slant},0 L${w},${cy} L${w - slant},${h} L${slant},${h} L0,${cy} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartPreparation`, (w, h) => {
  const slant = w * 0.2;
  const cy = h / 2;
  return `M${slant},0 L${w - slant},0 L${w},${cy} L${w - slant},${h} L${slant},${h} L0,${cy} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartData`, (w, h) => {
  const slant = w * 0.15;
  return `M${slant},0 L${w},0 L${w - slant},${h} L0,${h} Z`;
});
PRESET_GEOMETRY_PATHS.set(`flowChartInternalStorage`, (w, h) => {
  const dx = w / 8, dy = h / 8;
  return [`M0,0 L${w},0 L${w},${h} L0,${h} Z`, `M${dx},0 L${dx},${h}`, `M0,${dy} L${w},${dy}`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartMagneticDisk`, (w, h) => {
  const ry = h / 6;
  const bottom = h - ry;
  return [
    `M0,${ry}`, `A${w / 2},${ry} 0 1,1 ${w},${ry}`, `L${w},${bottom}`,
    `A${w / 2},${ry} 0 1,1 0,${bottom}`, `L0,${ry}`, `Z`,
    `M${w},${ry}`, `A${w / 2},${ry} 0 1,1 0,${ry}`,
  ].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartDelay`, (w, h) => {
  const cx = w / 2;
  const arc = arcSegment(cx, 0, cx, h / 2, 270, 180);
  return [`M0,0`, `L${cx},0`, arc.svg, `L0,${h}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartDisplay`, (w, h) => {
  const n = w / 6, r = h / 6;
  const arc = arcSegment(5 * n, 0, n, r * 3, 270, 180);
  return [`M0,${3 * r}`, `L${n},0`, `L${5 * n},0`, arc.svg, `L${n},${h}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartExtract`, (w, h) => `M${w / 2},0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`flowChartMerge`, (w, h) => `M0,0 L${w},0 L${w / 2},${h} Z`);
PRESET_GEOMETRY_PATHS.set(`flowChartOffpageConnector`, (w, h) => {
  const inset = h * 0.2;
  return [`M0,0`, `L${w},0`, `L${w},${h - inset}`, `L${w / 2},${h}`, `L0,${h - inset}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartConnector`, (w, h) => {
  const rx = w / 2, ry = h / 2;
  return [`M${w},${ry}`, `A${rx},${ry} 0 1,1 0,${ry}`, `A${rx},${ry} 0 1,1 ${w},${ry}`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartSort`, (w, h) => {
  const cx = w / 2, cy = h / 2;
  return [`M${cx},0 L${w},${cy} L${cx},${h} L0,${cy} Z`, `M0,${cy} L${w},${cy}`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartCollate`, (w, h) => {
  const cx = w / 2, cy = h / 2;
  return [`M0,0 L${w},0 L${cx},${cy} Z`, `M0,${h} L${w},${h} L${cx},${cy} Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartPunchedCard`, (w, h) => `M0,${h / 5} L${w / 5},0 L${w},0 L${w},${h} L0,${h} Z`);
PRESET_GEOMETRY_PATHS.set(`flowChartSummingJunction`, (w, h) => {
  const rx = w / 2, ry = h / 2;
  const dx = rx * Math.cos(Math.PI / 4), dy = ry * Math.sin(Math.PI / 4);
  return [
    `M0,${ry}`, `A${rx},${ry} 0 1,1 ${w},${ry}`, `A${rx},${ry} 0 1,1 0,${ry}`, `Z`,
    `M${rx - dx},${ry - dy} L${rx + dx},${ry + dy}`, `M${rx + dx},${ry - dy} L${rx - dx},${ry + dy}`,
  ].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartOr`, (w, h) => {
  const rx = w / 2, ry = h / 2;
  return [`M0,${ry}`, `A${rx},${ry} 0 1,1 ${w},${ry}`, `A${rx},${ry} 0 1,1 0,${ry}`, `Z`, `M${rx},0 L${rx},${h}`, `M0,${ry} L${w},${ry}`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartOnlineStorage`, (w, h) => {
  const inset = w / 6;
  return [`M${inset},0`, `L${w},0`, `A${inset},${h / 2} 0 0,0 ${w},${h}`, `L${inset},${h}`, `A${inset},${h / 2} 0 0,1 ${inset},0`, `Z`].join(` `);
});
PRESET_GEOMETRY_PATHS.set(`flowChartMagneticDrum`, (w, h) => {
  const inset = w / 6;
  const right = (w * 5) / 6;
  const ry = h / 2;
  return [
    `M${inset},0`, `L${right},0`, `A${inset},${ry} 0 0,1 ${right},${h}`, `L${inset},${h}`,
    `A${inset},${ry} 0 0,1 ${inset},0`, `Z`, `M${right},${h}`, `A${inset},${ry} 0 0,1 ${right},0`,
  ].join(` `);
});

/* --- 楔形呼出（原 wedgeRectCallout/wedgeRoundRectCallout/wedgeEllipseCallout，
 *     jsx 8729-8786；adj1/adj2 = 呼出尖角相对中心的偏移） --- */

PRESET_GEOMETRY_PATHS.set(`wedgeRectCallout`, (w, h, adj) => {
  const cx = w / 2, cy = h / 2;
  const dx = w * (adjValue(adj, `adj1`, -20833) ?? -20833) / 1e5;
  const dy = h * (adjValue(adj, `adj2`, 62500) ?? 62500) / 1e5;
  const tipX = cx + dx;
  const tipY = cy + dy;
  const slope = (dx * h) / w;
  const wedge = Math.abs(dy) - Math.abs(slope);
  const x1 = w * (dx >= 0 ? 7 : 2) / 12;
  const x2 = w * (dx >= 0 ? 10 : 5) / 12;
  const y1 = h * (dy >= 0 ? 7 : 2) / 12;
  const y2 = h * (dy >= 0 ? 10 : 5) / 12;
  const e1 = wedge > 0 || dx >= 0 ? 0 : tipX;
  const e2 = wedge > 0 ? (dy >= 0 ? x1 : tipX) : x1;
  const e3 = wedge > 0 ? w : dx >= 0 ? tipX : w;
  const e4 = wedge > 0 && dy >= 0 ? tipX : x1;
  const e5 = wedge > 0 || dx >= 0 ? y1 : tipY;
  const e6 = wedge > 0 ? (dy >= 0 ? 0 : tipY) : 0;
  const e7 = wedge > 0 ? y1 : dx >= 0 ? tipY : y1;
  const e8 = wedge > 0 && dy >= 0 ? tipY : h;
  return [
    `M0,0`, `L${x1},0`, `L${e2},${e6}`, `L${x2},0`, `L${w},0`, `L${w},${y1}`,
    `L${e3},${e7}`, `L${w},${y2}`, `L${w},${h}`, `L${x2},${h}`, `L${e4},${e8}`,
    `L${x1},${h}`, `L0,${h}`, `L0,${y2}`, `L${e1},${e5}`, `L0,${y1}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`wedgeRoundRectCallout`, (w, h, adj) => {
  const cx = w / 2, cy = h / 2;
  const shortest = Math.min(w, h);
  const dx = w * (adjValue(adj, `adj1`, -20833) ?? -20833) / 1e5;
  const dy = h * (adjValue(adj, `adj2`, 62500) ?? 62500) / 1e5;
  const radius = (shortest * (adjValue(adj, `adj3`, 16667) ?? 16667)) / 1e5;
  const tipX = cx + dx;
  const tipY = cy + dy;
  const slope = (dx * h) / w;
  const wedge = Math.abs(dy) - Math.abs(slope);
  const rw = w - radius, rh = h - radius;
  const x1 = w * (dx >= 0 ? 7 : 2) / 12;
  const x2 = w * (dx >= 0 ? 10 : 5) / 12;
  const y1 = h * (dy >= 0 ? 7 : 2) / 12;
  const y2 = h * (dy >= 0 ? 10 : 5) / 12;
  const e1 = wedge > 0 || dx >= 0 ? 0 : tipX;
  const e2 = wedge > 0 ? (dy >= 0 ? x1 : tipX) : x1;
  const e3 = wedge > 0 ? w : dx >= 0 ? tipX : w;
  const e4 = wedge > 0 && dy >= 0 ? tipX : x1;
  const e5 = wedge > 0 || dx >= 0 ? y1 : tipY;
  const e6 = wedge > 0 ? (dy >= 0 ? 0 : tipY) : 0;
  const e7 = wedge > 0 ? y1 : dx >= 0 ? tipY : y1;
  const e8 = wedge > 0 && dy >= 0 ? tipY : h;
  return [
    `M0,${radius}`, `A${radius},${radius} 0 0,1 ${radius},0`, `L${x1},0`, `L${e2},${e6}`, `L${x2},0`,
    `L${rw},0`, `A${radius},${radius} 0 0,1 ${w},${radius}`, `L${w},${y1}`, `L${e3},${e7}`, `L${w},${y2}`,
    `L${w},${rh}`, `A${radius},${radius} 0 0,1 ${rw},${h}`, `L${x2},${h}`, `L${e4},${e8}`, `L${x1},${h}`,
    `L${radius},${h}`, `A${radius},${radius} 0 0,1 0,${rh}`, `L0,${y2}`, `L${e1},${e5}`, `L0,${y1}`, `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`wedgeEllipseCallout`, (w, h, adj) => {
  const dx = adjRatio(adj, `adj1`, -20833);
  const dy = adjRatio(adj, `adj2`, 62500);
  const cx = w / 2, cy = h / 2;
  const tipX = cx + w * dx;
  const tipY = cy + h * dy;
  const angle = Math.atan2(tipY - cy, tipX - cx);
  const halfWedge = 0.15;
  return [
    ellipticArcPath(cx, cy, cx, cy, ((angle + halfWedge) * 180) / Math.PI, ((angle - halfWedge + 2 * Math.PI) * 180) / Math.PI),
    `L${tipX},${tipY}`,
    `Z`,
  ].join(` `);
});

/* --- 饼/弧/弦/漏斗/泪滴（原 jsx 9479-9548） --- */

PRESET_GEOMETRY_PATHS.set(`pie`, (w, h, adj) => {
  const startMilli = adjValue(adj, `adj1`, 0) ?? 0;
  const endMilli = adjValue(adj, `adj2`, 162e5) ?? 162e5;
  const startDeg = (startMilli / 6e4) % 360;
  const endDeg = (endMilli / 6e4) % 360;
  let sweep = ((endDeg - startDeg) % 360 + 360) % 360;
  sweep === 0 && startDeg !== endDeg && (sweep = 360);
  const cx = w / 2, cy = h / 2;
  const toEllipseAngle = (deg: number) => Math.atan2(Math.sin((deg * Math.PI) / 180) / cy, Math.cos((deg * Math.PI) / 180) / cx);
  const startTheta = toEllipseAngle(startDeg);
  const endTheta = toEllipseAngle(endDeg);
  return [
    `M${cx},${cy}`,
    `L${cx + cx * Math.cos(startTheta)},${cy + cy * Math.sin(startTheta)}`,
    `A${cx},${cy} 0 ${+(sweep > 180)},1 ${cx + cx * Math.cos(endTheta)},${cy + cy * Math.sin(endTheta)}`,
    `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`pieWedge`, (w, h) => [`M0,${h}`, `A${w},${h} 0 0,1 ${w},0`, `L${w},${h}`, `Z`].join(` `));

PRESET_GEOMETRY_PATHS.set(`arc`, (w, h, adj) => {
  const startDeg = (adjValue(adj, `adj1`, 162e5) ?? 162e5) / 6e4;
  const endDeg = (adjValue(adj, `adj2`, 0) ?? 0) / 6e4;
  const cx = w / 2, cy = h / 2;
  const toEllipseAngle = (deg: number) => Math.atan2(Math.sin((deg * Math.PI) / 180) / cy, Math.cos((deg * Math.PI) / 180) / cx);
  const startTheta = toEllipseAngle(startDeg);
  const endTheta = toEllipseAngle(endDeg);
  let sweep = ((endDeg - startDeg) % 360 + 360) % 360;
  sweep === 0 && startDeg !== endDeg && (sweep = 360);
  return `M${cx + cx * Math.cos(startTheta)},${cy + cy * Math.sin(startTheta)} A${cx},${cy} 0 ${+(sweep > 180)},1 ${cx + cx * Math.cos(endTheta)},${cy + cy * Math.sin(endTheta)}`;
});

PRESET_GEOMETRY_PATHS.set(`chord`, (w, h, adj) => {
  const startDeg = (adjValue(adj, `adj1`, 27e5) ?? 27e5) / 6e4;
  const endDeg = (adjValue(adj, `adj2`, 162e5) ?? 162e5) / 6e4;
  const cx = w / 2, cy = h / 2;
  const toEllipseAngle = (deg: number) => Math.atan2(Math.sin((deg * Math.PI) / 180) / cy, Math.cos((deg * Math.PI) / 180) / cx);
  const startTheta = toEllipseAngle(startDeg);
  const endTheta = toEllipseAngle(endDeg);
  let sweep = ((endDeg - startDeg) % 360 + 360) % 360;
  sweep === 0 && startDeg !== endDeg && (sweep = 360);
  return sweep === 0
    ? `M${cx - cx},${cy} A${cx},${cy} 0 1,1 ${cx + cx},${cy} A${cx},${cy} 0 1,1 ${cx - cx},${cy} Z`
    : `M${cx + cx * Math.cos(startTheta)},${cy + cy * Math.sin(startTheta)} A${cx},${cy} 0 ${+(sweep > 180)},1 ${cx + cx * Math.cos(endTheta)},${cy + cy * Math.sin(endTheta)} Z`;
});

PRESET_GEOMETRY_PATHS.set(`funnel`, (w, h) => {
  // 漏斗：顶部椭圆口 + 锥形颈（原 jsx 9538-9548；8° 锥角）
  const shortest = Math.min(w, h);
  const cx = w / 2;
  const mouthRy = h / 4;
  const neckHalf = shortest / 20;
  const neckRx = cx - neckHalf;
  const neckRy = mouthRy - neckHalf;
  const slant = (8 * Math.PI) / 180;
  const dx = cx * Math.cos(slant);
  const dy = mouthRy * Math.sin(slant);
  return [
    `M${cx - dx},${mouthRy - dy}`,
    `A${cx},${mouthRy} 0 1,1 ${cx + dx},${mouthRy - dy}`,
    `L${cx + neckHalf},${h}`,
    `A${neckHalf},${neckRy / 2} 0 0,1 ${cx - neckHalf},${h}`,
    `Z`,
  ].join(` `);
});

PRESET_GEOMETRY_PATHS.set(`teardrop`, (w, h) => {
  // 泪滴（原 jsx 9483）：3/4 椭圆弧 + 右上角尖点
  const rx = w / 2, ry = h / 2;
  return [`M${w},${ry}`, `A${rx},${ry} 0 1,1 ${rx},0`, `L${w},0`, `L${w},${ry}`, `Z`].join(` `);
});

/* [A0-S2e 删除] DEFERRED_PRESET_GEOMETRY_ANCHORS 登记表（39 项）+ FALLBACK_RECT
 * 兜底循环：实体已全量转录于 PptxGeometryDeferredPresets.ts（B5-17），经渲染器
 * 装配处副作用 import 注册。删除依据见文件头注（B5-16/17 报告）。 */

/* ============================================================================
 * 多区域形状注册表（原 ji，jsx 9609-10680）
 * 返回区域数组：{ d, fill: norm|darken|darkenLess|lighten|lightenLess|none,
 *                stroke: boolean }，渲染器按区域分别着色。
 * ==========================================================================*/

export interface MultiRegionPath {
  d: string;
  fill: `norm` | `darken` | `darkenLess` | `lighten` | `lightenLess` | `none`;
  stroke: boolean;
  strokeWidthScale?: number;
  maskToMainOutline?: boolean;
  maskToMainOutlineBandScale?: number;
  maskStrokeScale?: number;
}

export type MultiRegionBuilder = (
  width: number,
  height: number,
  adjustments?: Map<string, number>,
) => MultiRegionPath[];

export const MULTI_REGION_SHAPES = new Map<string, MultiRegionBuilder>();

/** actionButton 公共度量（原 Mi，jsx 9610-9625） */
function actionButtonMetrics(w: number, h: number) {
  const shortest = Math.min(w, h);
  const hc = w / 2, vc = h / 2;
  const dx2 = (shortest * 3) / 8;
  return {
    ss: shortest, hc, vc, dx2,
    g9: vc - dx2, g10: vc + dx2, g11: hc - dx2, g12: hc + dx2, g13: (shortest * 3) / 4,
  };
}

/** 外框矩形路径（原 Ni，jsx 9627） */
const outerRectPath = (w: number, h: number) => `M0,0 L${w},0 L${w},${h} L0,${h} Z`;

MULTI_REGION_SHAPES.set(`actionButtonForwardNext`, (w, h) => {
  const { g9, g10, g11, g12, vc } = actionButtonMetrics(w, h);
  const glyph = `M${g12},${vc} L${g11},${g9} L${g11},${g10} Z`;
  return [
    { d: `${outerRectPath(w, h)} ${glyph}`, fill: `norm`, stroke: false },
    { d: glyph, fill: `darken`, stroke: false },
    { d: glyph, fill: `none`, stroke: true },
    { d: outerRectPath(w, h), fill: `none`, stroke: true },
  ];
});
MULTI_REGION_SHAPES.set(`actionButtonForward`, (w, h) => MULTI_REGION_SHAPES.get(`actionButtonForwardNext`)!(w, h));
MULTI_REGION_SHAPES.set(`actionButtonBackPrevious`, (w, h) => {
  const { g9, g10, g11, g12, vc } = actionButtonMetrics(w, h);
  const glyph = `M${g11},${vc} L${g12},${g9} L${g12},${g10} Z`;
  return [
    { d: `${outerRectPath(w, h)} ${glyph}`, fill: `norm`, stroke: false },
    { d: glyph, fill: `darken`, stroke: false },
    { d: glyph, fill: `none`, stroke: true },
    { d: outerRectPath(w, h), fill: `none`, stroke: true },
  ];
});
MULTI_REGION_SHAPES.set(`flowChartOfflineStorage`, (w, h) => {
  const body = `M0,0 L${w},0 L${w / 2},${h} Z`;
  const baseline = `M${(w * 2) / 5},${(h * 4) / 5} L${(w * 3) / 5},${(h * 4) / 5}`;
  return [
    { d: body, fill: `norm`, stroke: false },
    { d: baseline, fill: `none`, stroke: true },
    { d: body, fill: `none`, stroke: true },
  ];
});
MULTI_REGION_SHAPES.set(`cube`, (w, h, adj) => {
  const inset = Math.min(Math.max(adjRatio(adj, `adj`, 25e3), 0), 0.45) * Math.min(w, h);
  const face = [`M0,${inset}`, `L${w - inset},${inset}`, `L${w - inset},${h}`, `L0,${h}`, `Z`].join(` `);
  const top = [`M0,${inset}`, `L${inset},0`, `L${w},0`, `L${w - inset},${inset}`, `Z`].join(` `);
  const side = [`M${w - inset},${inset}`, `L${w},0`, `L${w},${h - inset}`, `L${w - inset},${h}`, `Z`].join(` `);
  return [
    { d: face, fill: `norm`, stroke: true },
    { d: top, fill: `lightenLess`, stroke: true },
    { d: side, fill: `darkenLess`, stroke: true },
  ];
});
MULTI_REGION_SHAPES.set(`foldedCorner`, (w, h, adj) => {
  const fold = Math.min(w, h) * adjRatio(adj, `adj`, 16667) * 0.7;
  const body = `M0,0 L${w},0 L${w},${h - fold} L${w - fold},${h} L0,${h} Z`;
  const flap = `M${w - fold},${h} L${w - fold},${h - fold} L${w},${h - fold} Z`;
  const crease = `M${w - fold},${h} L${w - fold},${h - fold}`;
  return [
    { d: body, fill: `norm`, stroke: true },
    { d: flap, fill: `darkenLess`, stroke: false },
    { d: crease, fill: `none`, stroke: true },
  ];
});

/* [A0-S2e 删除] DEFERRED_MULTI_REGION_ANCHORS 登记表（38 项）：实体已全量转录于
 * PptxGeometryMultiRegion.ts（B5-16），经渲染器装配处副作用 import 注册。
 * 删除依据见文件头注（B5-16/17 报告）。 */

/* ============================================================================
 * 自定义几何（custGeom）解析（原 gi/_i，jsx 7251-7360）
 * ==========================================================================*/

/** custGeom 路径包围盒估算（原 gi）：逐指令取最大 x/y（arcTo 取半径） */
export function customGeometryExtent(pathNode: XmlNode): { w: number; h: number } {
  let maxX = 0, maxY = 0;
  for (const segment of pathNode.allChildren()) {
    if (segment.localName === `moveTo` || segment.localName === `lnTo`) {
      const pt = segment.child(`pt`);
      maxX = Math.max(maxX, pt.numAttr(`x`) ?? 0);
      maxY = Math.max(maxY, pt.numAttr(`y`) ?? 0);
      continue;
    }
    if (segment.localName === `cubicBezTo` || segment.localName === `quadBezTo`) {
      for (const pt of segment.children(`pt`)) {
        maxX = Math.max(maxX, pt.numAttr(`x`) ?? 0);
        maxY = Math.max(maxY, pt.numAttr(`y`) ?? 0);
      }
      continue;
    }
    segment.localName === `arcTo` &&
      ((maxX = Math.max(maxX, segment.numAttr(`wR`) ?? 0)), (maxY = Math.max(maxY, segment.numAttr(`hR`) ?? 0)));
  }
  return { w: Math.max(1, maxX), h: Math.max(1, maxY) };
}

/**
 * custGeom pathLst → SVG path（原 _i）。
 * 每个 <a:path w= h=> 按目标尺寸缩放；支持 moveTo/lnTo/cubicBezTo/
 * quadBezTo/arcTo（椭圆参数角 → 端点弧换算）/close。
 */
export function buildCustomGeometryPath(
  custGeom: XmlNode,
  width: number,
  height: number,
  naturalExtent?: { w: number; h: number },
): string {
  const pathList = custGeom.child(`pathLst`);
  if (!pathList.exists()) return ``;
  const out: string[] = [];
  for (const pathNode of pathList.children(`path`)) {
    const extent = customGeometryExtent(pathNode);
    const naturalW = pathNode.numAttr(`w`) ?? naturalExtent?.w ?? extent.w;
    const naturalH = pathNode.numAttr(`h`) ?? naturalExtent?.h ?? extent.h;
    const scaleX = naturalW > 0 ? width / naturalW : 1;
    const scaleY = naturalH > 0 ? height / naturalH : 1;
    let px = 0, py = 0;
    for (const segment of pathNode.allChildren())
      switch (segment.localName) {
        case `moveTo`: {
          const pt = segment.child(`pt`);
          const x = (pt.numAttr(`x`) ?? 0) * scaleX;
          const y = (pt.numAttr(`y`) ?? 0) * scaleY;
          out.push(`M${x},${y}`);
          px = x; py = y;
          break;
        }
        case `lnTo`: {
          const pt = segment.child(`pt`);
          const x = (pt.numAttr(`x`) ?? 0) * scaleX;
          const y = (pt.numAttr(`y`) ?? 0) * scaleY;
          out.push(`L${x},${y}`);
          px = x; py = y;
          break;
        }
        case `cubicBezTo`: {
          const pts = segment.children(`pt`);
          if (pts.length >= 3) {
            const x1 = (pts[0].numAttr(`x`) ?? 0) * scaleX, y1 = (pts[0].numAttr(`y`) ?? 0) * scaleY;
            const x2 = (pts[1].numAttr(`x`) ?? 0) * scaleX, y2 = (pts[1].numAttr(`y`) ?? 0) * scaleY;
            const x3 = (pts[2].numAttr(`x`) ?? 0) * scaleX, y3 = (pts[2].numAttr(`y`) ?? 0) * scaleY;
            out.push(`C${x1},${y1} ${x2},${y2} ${x3},${y3}`);
            px = x3; py = y3;
          }
          break;
        }
        case `quadBezTo`: {
          const pts = segment.children(`pt`);
          if (pts.length >= 2) {
            const x1 = (pts[0].numAttr(`x`) ?? 0) * scaleX, y1 = (pts[0].numAttr(`y`) ?? 0) * scaleY;
            const x2 = (pts[1].numAttr(`x`) ?? 0) * scaleX, y2 = (pts[1].numAttr(`y`) ?? 0) * scaleY;
            out.push(`Q${x1},${y1} ${x2},${y2}`);
            px = x2; py = y2;
          }
          break;
        }
        case `arcTo`: {
          const wr = segment.numAttr(`wR`) ?? 0;
          const hr = segment.numAttr(`hR`) ?? 0;
          const rx = wr * scaleX;
          const ry = hr * scaleY;
          const startDeg = segment.numAttr(`stAng`) ?? 0;
          const sweepDeg = segment.numAttr(`swAng`) ?? 0;
          if (rx === 0 || ry === 0 || sweepDeg === 0) break;
          // 椭圆参数角 → 实际角（原实现）
          const startRad = (startDeg / 6e4) * (Math.PI / 180);
          const startTheta = Math.atan2(wr * Math.sin(startRad), hr * Math.cos(startRad));
          const endRad = ((startDeg + sweepDeg) / 6e4) * (Math.PI / 180);
          const endTheta = Math.atan2(wr * Math.sin(endRad), hr * Math.cos(endRad));
          const ux = px / scaleX, uy = py / scaleY;
          const cx0 = ux - wr * Math.cos(startTheta);
          const cy0 = uy - hr * Math.sin(startTheta);
          const endX = (cx0 + wr * Math.cos(endTheta)) * scaleX;
          const endY = (cy0 + hr * Math.sin(endTheta)) * scaleY;
          out.push(`A${rx},${ry} 0 ${+(Math.abs(sweepDeg / 6e4) > 180)},${+(sweepDeg > 0)} ${endX},${endY}`);
          px = endX; py = endY;
          break;
        }
        case `close`:
          out.push(`Z`);
          break;
      }
  }
  return out.join(` `);
}

/* ============================================================================
 * 渲染器入口（原 bo/Fi/Ti/Ei/Ai 的对外形态）
 * ==========================================================================*/

/** 预设 → 主路径（原 Fi 的对外形态；连接线/直线类由渲染器单独处理） */
export function buildPresetGeometryPath(
  preset: string,
  width: number,
  height: number,
  adjustments?: Map<string, number>,
): string | undefined {
  const builder = PRESET_GEOMETRY_PATHS.get(preset);
  return builder ? builder(width, height, adjustments) : undefined;
}

/**
 * 预设 → 多区域路径（原 Pi 的对外形态，jsx 10857-10861：小写优先→原名回退查表）。
 * A0-S2e 改指（依据 B5-16 §5/§6-4）：原弯箭头特判分支删除，
 * curvedrightarrow/curvedleftarrow/curveduparrow/curveddownarrow 改经
 * PptxGeometryMultiRegion 的 ji 条目（委托忠实版包装 wrapSplitPresetRegions/
 * wrapVerticalArrowRegions，即原 Ti/Ei 逐字版），修复两处偏差：
 *   1. curvedleftarrow 区域顺序——源 Ti 仅 curvedRightArrow 为 [remainder, outer]，
 *      curvedLeftArrow 为 [outer, remainder]（原实现一律 [remainder, outer]）；
 *   2. 仅小写查表——actionButton 族/leftRightRibbon/smileyFace 等 camelCase 键
 *      原永远落空回单路径分支，现按源 Pi 小写优先→原名回退。
 */
export function buildMultiRegionPaths(
  preset: string,
  width: number,
  height: number,
  adjustments?: Map<string, number>,
): MultiRegionPath[] | undefined {
  const normalized = preset.toLowerCase();
  const builder = MULTI_REGION_SHAPES.get(normalized) ?? MULTI_REGION_SHAPES.get(preset);
  return builder ? builder(width, height, adjustments) : undefined;
}

/**
 * 形状路径解析结果（原 bo 的返回形态）：
 * pathD = 主轮廓（填充/描边用）；multiPaths = 附加细节区域。
 */
export interface ShapeGeometryPaths {
  pathD: string;
  multiPaths?: MultiRegionPath[];
}

export function buildShapePaths(
  node: { presetGeometry?: string; customGeometry?: XmlNode; source: XmlNode; size: { w: number; h: number } },
  presetOverride: string | undefined,
  width: number,
  height: number,
): ShapeGeometryPaths {
  const preset = presetOverride ?? node.presetGeometry;
  if (preset) {
    const adjustments = parseAdjustments(node.source);
    const multi = buildMultiRegionPaths(preset, width, height, adjustments);
    if (multi) {
      // 多区域形状：首个区域为主轮廓
      const [primary, ...rest] = multi;
      return { pathD: primary.d, multiPaths: rest.length > 0 ? [primary, ...rest] : multi };
    }
    const pathD = buildPresetGeometryPath(preset, width, height, adjustments) ?? ``;
    return { pathD };
  }
  if (node.customGeometry) {
    const extentNode = node.source.child(`spPr`).child(`xfrm`).child(`ext`);
    const natural = { w: extentNode.numAttr(`cx`) ?? 0, h: extentNode.numAttr(`cy`) ?? 0 };
    return { pathD: buildCustomGeometryPath(node.customGeometry, width, height, natural) };
  }
  return { pathD: `` };
}

/** prstGeom avLst → adj 映射（原 je，jsx 4206-4217） */
export function parseAdjustments(spPrSource: XmlNode): Map<string, number> {
  const out = new Map<string, number>();
  const geom = spPrSource.child(`spPr`).child(`prstGeom`);
  if (!geom.exists()) return out;
  for (const gd of geom.child(`avLst`).children(`gd`)) {
    const name = gd.attr(`name`);
    const formula = gd.attr(`fmla`) ?? ``;
    if (!name) continue;
    const match = formula.match(/val\s+(-?\d+)/);
    if (match) out.set(name, Number(match[1]));
    else {
      const direct = Number(formula);
      Number.isNaN(direct) || out.set(name, direct);
    }
  }
  return out;
}
