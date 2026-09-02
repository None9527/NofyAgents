/* eslint-disable */
/**
 * ============================================================================
 * PptxGeometryMultiRegion.ts — pptxRendererPreviewEngine 子模块 · 多区域预设几何余量
 * （解混淆重建 · D8 Stage B5-16）
 *
 * 源（只读）：desktop/src/out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js
 *   （55,446 行压缩版；md5 基线 02b3288447a609a826511301b9ec9bfc）
 * 行号锚点口径：desktop/src/src-reconstructed/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.jsx
 *   （44,678 行 pretty 孪生）
 *
 * ---------------------------------------------------------------------------
 * 覆盖清单（全部 first-party 几何代码；与 pptxEngineGeometry.ts 边界互斥）
 * ---------------------------------------------------------------------------
 *   V 弯箭头四预设（本批实体化为 ji 弯箭头条目的前置依赖；原登记于
 *     pptxEngineGeometry.ts DEFERRED_PRESET_GEOMETRY_ANCHORS）：
 *     curvedRightArrow  (jsx 8035-8087)   curvedLeftArrow (jsx 8088)
 *     curvedUpArrow     (jsx 8151-8194)   curvedDownArrow (jsx 8195-8236)
 *   Ti   单预设→区域数组包装（弯箭头特判）        (jsx 8099-8125)
 *   Ei   弯上/下箭头垂直镜像包装                  (jsx 8127-8150)
 *   ki   actionButton 字形路径 Map（7 条）        (jsx 9373-9417)
 *   Ai   actionButton 字形查询                    (jsx 9419-9422)
 *   Mi   actionButton 公共度量                    (jsx 9610-9624)
 *   Ni   actionButton 外框矩形路径                (jsx 9626)
 *   ji   多区域形状注册表未转录条目 ×38           (jsx 9683-10680, 10696-10856)
 *   Pi   多区域查询（小写→原名回退）              (jsx 10857-10861)
 *
 * ---------------------------------------------------------------------------
 * 边界互斥（pptxEngineGeometry.ts 已覆盖、本批实测确认、不重复转录）
 * ---------------------------------------------------------------------------
 *   wi → splitOuterPath (2537)          Si → mirrorPathHorizontally (105)
 *   Ci → mirrorPathVertically (2416)    H  → arcSegment (61)
 *   yi → adjRatio (2267)                 V  → PRESET_GEOMETRY_PATHS (181)
 *   ji 已转录 6 条：actionButtonForwardNext/actionButtonForward/
 *     actionButtonBackPrevious/flowChartOfflineStorage/cube/foldedCorner
 *     (1454-1505)
 *   Ti/Ei 对外形态 buildMultiRegionPaths (1658-1691)——注：其 curvedleftarrow
 *     区域顺序与源 Ti 存在偏差（先 remainder），勘误见 B5-16.report.md §5；
 *     本批按源逐字另录 Ti/Ei 供 ji 委托条目使用，既有文件不改动。
 *   Mi/Ni 既有副本 (1441/1451) 未导出，本批按源再录一份（整合期改指，见报告 §6）。
 *
 * ---------------------------------------------------------------------------
 * 转录口径
 * ---------------------------------------------------------------------------
 *   - 路径模板字面量（含全部 M/L/A/Q/Z 指令与插值）、adj 解构名、分支、
 *     数值常量零改动；条目入参保留原签名 (e, t, n)；函数体内局部名保留原
 *     混淆名；顶层符号改语义名（映射见文末符号总表）。
 *   - 机械归一：!0/!1 → true/false（与既有文件体例一致）；
 *     局部弧助手 C/c/k（公式与 arcSegment 逐项一致，含 +(a>0)）→ 导入
 *     arcSegment，返回字段 x/y → endX/endY；H → arcSegment（源 +(a>=0)，
 *     arcSegment +(a>0)；本批所有调用 sweep 均 ≠0，无行为差，见报告 §5）。
 *   - 外部依赖全部真实 import（均已在 pptxEngineGeometry.ts 导出）；
 *     本文件无 declare 挂接。
 * ==========================================================================*/

import {
  MULTI_REGION_SHAPES,
  PRESET_GEOMETRY_PATHS,
  adjRatio,
  arcSegment,
  mirrorPathHorizontally,
  mirrorPathVertically,
  splitOuterPath,
} from "./pptxEngineGeometry";
import type { MultiRegionBuilder, MultiRegionPath, PresetGeometryBuilder } from "./pptxEngineGeometry";

/** arcSegment 返回形态（原 H 的 {svg, x, y}，字段改指 endX/endY） */
type ArcStep = ReturnType<typeof arcSegment>;

/* ============================================================================
 * 弯箭头 V 构建器（原 V.set，jsx 8035-8088 / 8151-8236）
 * ji 弯箭头四条目（10435）经 Ti/Ei 依赖这四个预设；注册后覆盖
 * pptxEngineGeometry.ts DEFERRED_PRESET_GEOMETRY_ANCHORS 的 FALLBACK_RECT。
 * ==========================================================================*/

/** 原 V.set(`curvedRightArrow`)（jsx 8035-8087） */
const curvedRightArrowBuilder: PresetGeometryBuilder = (e, t, n) => {
  let r = n?.get(`adj1`) ?? 25e3,
    i = n?.get(`adj2`) ?? 5e4,
    a = n?.get(`adj3`) ?? 25e3,
    o = 1e5,
    s = t / 2,
    c = e,
    l = t,
    u = Math.max(Math.min(e, t), 1),
    d = 5e4 * t / u,
    f = Math.max(0, Math.min(i, d)),
    p = u * Math.max(0, Math.min(r, f)) / o,
    m = u * f / o,
    h = s - (p + m) / 4,
    g = h * 2,
    _ = g * g,
    v = p * p,
    y = Math.max(_ - v, 0),
    b = Math.sqrt(y) * e / Math.max(g, 1e-6),
    x = o * b / u,
    S = u * Math.max(0, Math.min(a, x)) / o,
    C = h + p,
    w = e * e,
    T = S * S,
    E = Math.max(w - T, 0),
    D = Math.sqrt(E) * h / Math.max(e, 1e-6),
    O = h + D,
    k = C + D,
    A = (m - p) / 2,
    j = O - A,
    M = k + A,
    N = l - m / 2,
    P = c - S,
    F = Math.atan(D / Math.max(S, 1e-6)),
    I = Math.PI - F,
    L = -F,
    R = p / 2,
    z = Math.atan2(R, Math.max(b, 1e-6)) - Math.PI / 2,
    B = I * 180 / Math.PI,
    ee = L * 180 / Math.PI,
    te = F * 180 / Math.PI,
    ne = z * 180 / Math.PI,
    re = (e: number, t: number, n: number, r: number, i: number, a: number) => {
      let o = i * Math.PI / 180,
        s = a * Math.PI / 180,
        c = e + n * Math.cos(o),
        l = t + r * Math.sin(o),
        u = e + n * Math.cos(s),
        d = t + r * Math.sin(s),
        f = a - i;
      return `M${c},${l} A${n},${r} 0 ${+(Math.abs(f) > 180)},${+(f >= 0)} ${u},${d}`;
    };
  return [`M0,${h}`, re(e, h, e, h, 180, 180 + ee).replace(`M`, `L`), `L${P},${O}`, `L${P},${j}`, `L${c},${N}`, `L${P},${M}`, `L${P},${k}`, re(e, C, e, h, B, B + te).replace(`M`, `L`), `Z`, re(e, h, e, h, 180, 270), `L${c},${p}`, re(e, C, e, h, 270, 270 + ne).replace(`M`, `L`), `Z`].join(` `);
};

/** 原 V.set(`curvedLeftArrow`)（jsx 8088）：curvedRightArrow 的水平镜像 */
const curvedLeftArrowBuilder: PresetGeometryBuilder = (e, t, n) =>
  mirrorPathHorizontally(PRESET_GEOMETRY_PATHS.get(`curvedRightArrow`)!(e, t, n), e);

/** 原 V.set(`curvedUpArrow`)（jsx 8151-8194） */
const curvedUpArrowBuilder: PresetGeometryBuilder = (e, t, n) => {
  let r = (e: number, t: number, n: number, r: number, i: number, a: number) => {
      let o = i * Math.PI / 180,
        s = a * Math.PI / 180,
        c = e + n * Math.cos(o),
        l = t + r * Math.sin(o),
        u = e + n * Math.cos(s),
        d = t + r * Math.sin(s),
        f = a - i;
      return `M${c},${l} A${n},${r} 0 ${+(Math.abs(f) > 180)},${+(f >= 0)} ${u},${d}`;
    },
    i = Math.min(e, t),
    a = e / 2,
    o = n?.get(`adj1`) ?? 25e3,
    s = n?.get(`adj2`) ?? 5e4,
    c = n?.get(`adj3`) ?? 25e3,
    l = 5e4 * e / Math.max(i, 1),
    u = Math.max(0, Math.min(s, l)),
    d = i * Math.max(0, Math.min(o, 1e5)) / 1e5,
    f = i * u / 1e5,
    p = a - (d + f) / 4,
    m = p * 2,
    h = Math.sqrt(Math.max(m * m - d * d, 0)) * t / Math.max(m, 1),
    g = 1e5 * h / Math.max(i, 1),
    _ = i * Math.max(0, Math.min(c, g)) / 1e5,
    v = p + d,
    y = Math.sqrt(Math.max(t * t - _ * _, 0)) * p / Math.max(t, 1),
    b = p + y,
    x = v + y,
    S = (f - d) / 2,
    C = b - S,
    w = x + S,
    T = e - f / 2,
    E = _,
    D = Math.atan2(y, _),
    O = Math.atan2(d / 2, h),
    k = Math.PI / 2 - O,
    A = O - D,
    j = Math.PI / 2 - D,
    M = k * 180 / Math.PI,
    N = A * 180 / Math.PI,
    P = j * 180 / Math.PI,
    F = D * 180 / Math.PI;
  return [r(p, 0, p, t, M, M + N), `L${b},${E}`, `L${C},${E}`, `L${T},0`, `L${w},${E}`, `L${x},${E}`, r(v, 0, p, t, P, P + F).replace(`M`, `L`), `L${p},${t}`, r(p, 0, p, t, 90, 180).replace(`M`, `L`), `L${d},0`, r(v, 0, p, t, 180, 90).replace(`M`, `L`), `Z`].join(` `);
};

/** 原 V.set(`curvedDownArrow`)（jsx 8195-8236） */
const curvedDownArrowBuilder: PresetGeometryBuilder = (e, t, n) => {
  let r = (e: number, t: number, n: number, r: number, i: number, a: number) => {
      let o = i * Math.PI / 180,
        s = a * Math.PI / 180,
        c = e + n * Math.cos(o),
        l = t + r * Math.sin(o),
        u = e + n * Math.cos(s),
        d = t + r * Math.sin(s),
        f = a - i;
      return `M${c},${l} A${n},${r} 0 ${+(Math.abs(f) > 180)},${+(f >= 0)} ${u},${d}`;
    },
    i = Math.min(e, t),
    a = e / 2,
    o = n?.get(`adj1`) ?? 25e3,
    s = n?.get(`adj2`) ?? 5e4,
    c = n?.get(`adj3`) ?? 25e3,
    l = 5e4 * e / Math.max(i, 1),
    u = Math.max(0, Math.min(s, l)),
    d = i * Math.max(0, Math.min(o, 1e5)) / 1e5,
    f = i * u / 1e5,
    p = a - (d + f) / 4,
    m = p * 2,
    h = Math.sqrt(Math.max(m * m - d * d, 0)) * t / Math.max(m, 1),
    g = 1e5 * h / Math.max(i, 1),
    _ = i * Math.max(0, Math.min(c, g)) / 1e5,
    v = p + d,
    y = Math.sqrt(Math.max(t * t - _ * _, 0)) * p / Math.max(t, 1),
    b = p + y,
    x = v + y,
    S = (f - d) / 2,
    C = b - S,
    w = x + S,
    T = e - f / 2,
    E = t - _,
    D = Math.atan2(y, _) * 180 / Math.PI,
    O = Math.atan2(d / 2, h) * 180 / Math.PI,
    k = 270 + D,
    A = 270 - O,
    j = O - 90,
    M = 90 + O;
  return [`M${T},${t}`, `L${C},${E}`, `L${b},${E}`, r(p, t, p, t, k, k - D).replace(`M`, `L`), `L${v},0`, r(v, t, p, t, 270, 270 + D).replace(`M`, `L`), `L${b + d},${E}`, `L${w},${E}`, `Z`, `M${v},0`, r(v, t, p, t, A, A + j).replace(`M`, `L`), r(p, t, p, t, 180, 180 + M).replace(`M`, `L`), `Z`].join(` `);
};

PRESET_GEOMETRY_PATHS.set(`curvedRightArrow`, curvedRightArrowBuilder);
PRESET_GEOMETRY_PATHS.set(`curvedLeftArrow`, curvedLeftArrowBuilder);
PRESET_GEOMETRY_PATHS.set(`curvedUpArrow`, curvedUpArrowBuilder);
PRESET_GEOMETRY_PATHS.set(`curvedDownArrow`, curvedDownArrowBuilder);

/* ============================================================================
 * 多区域包装（原 Ti/Ei，jsx 8099-8150；wi 已在 pptxEngineGeometry.ts
 * 转录为 splitOuterPath，直接 import）
 * ==========================================================================*/

/**
 * 原 Ti（jsx 8099-8125）：V 预设单路径 → 按首个 Z 拆两区域。
 * 特判：仅 curvedRightArrow 为 [remainder, outer]，其余 [outer, remainder]。
 */
export function wrapSplitPresetRegions(e: string, t: number, n: number, r?: Map<string, number>): MultiRegionPath[] {
  let i = PRESET_GEOMETRY_PATHS.get(e)!(t, n, r),
    { outer: a, remainder: o } = splitOuterPath(i);
  return o ? e === `curvedRightArrow` ? [{
    d: o,
    fill: `norm`,
    stroke: true
  }, {
    d: a,
    fill: `norm`,
    stroke: true
  }] : [{
    d: a,
    fill: `norm`,
    stroke: true
  }, {
    d: o,
    fill: `norm`,
    stroke: true
  }] : [{
    d: i,
    fill: `norm`,
    stroke: true
  }];
}

/**
 * 原 Ei（jsx 8127-8150）：恒取 curvedDownArrow 拆分；非 curvedDownArrow
 * 时逐区域垂直镜像（Ci）并反转顺序（弯上箭头形态）。
 */
export function wrapVerticalArrowRegions(e: string, t: number, n: number, r?: Map<string, number>): MultiRegionPath[] {
  let i = PRESET_GEOMETRY_PATHS.get(`curvedDownArrow`)!(t, n, r),
    { outer: a, remainder: o } = splitOuterPath(i);
  const s: MultiRegionPath[] = o ? [{
    d: o,
    fill: `norm`,
    stroke: true
  }, {
    d: a,
    fill: `norm`,
    stroke: true
  }] : [{
    d: i,
    fill: `norm`,
    stroke: true
  }];
  return e === `curvedDownArrow` ? s : s.map(e => ({
    ...e,
    d: mirrorPathVertically(e.d, n)
  })).reverse();
}

/* ============================================================================
 * actionButton 字形（原 ki Map + Ai 查询，jsx 9373-9422）
 * ==========================================================================*/

export const ACTION_BUTTON_GLYPH_PATHS = new Map<string, (e: number, t: number) => string>();
ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonForwardNext`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.3;
  return `M${n - i * 0.5},${r - i} L${n + i},${r} L${n - i * 0.5},${r + i} Z`;
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonBackPrevious`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.3;
  return `M${n + i * 0.5},${r - i} L${n - i},${r} L${n + i * 0.5},${r + i} Z`;
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonReturn`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.28,
    a = i * 0.22,
    o = r + i * 0.4,
    s = r - i * 0.4,
    c = n - i * 0.6,
    l = n + i * 0.6,
    u = (o - s) / 2;
  return [`M${c},${o}`, `L${l},${o}`, `A${u},${u} 0 0,1 ${l},${s}`, `L${c + i * 0.15},${s}`, `L${c + i * 0.15},${s + a}`, `L${l - a * 0.3},${s + a}`, `A${u - a},${u - a} 0 0,0 ${l - a * 0.3},${o - a}`, `L${c},${o - a}`, `Z`, `M${c - i * 0.3},${s + a / 2}`, `L${c + i * 0.15},${s - i * 0.2}`, `L${c + i * 0.15},${s + a + i * 0.2}`, `Z`].join(` `);
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonBeginning`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.28;
  return [`M${n - i},${r - i} L${n - i + i * 0.2},${r - i} L${n - i + i * 0.2},${r + i} L${n - i},${r + i} Z`, `M${n + i},${r - i} L${n - i + i * 0.35},${r} L${n + i},${r + i} Z`].join(` `);
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonEnd`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.28;
  return [`M${n + i - i * 0.2},${r - i} L${n + i},${r - i} L${n + i},${r + i} L${n + i - i * 0.2},${r + i} Z`, `M${n - i},${r - i} L${n + i - i * 0.35},${r} L${n - i},${r + i} Z`].join(` `);
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonInformation`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.28;
  return [`M${n - i * 0.1},${r - i * 0.65} L${n + i * 0.1},${r - i * 0.65} L${n + i * 0.1},${r - i * 0.4} L${n - i * 0.1},${r - i * 0.4} Z`, `M${n - i * 0.12},${r - i * 0.2} L${n + i * 0.12},${r - i * 0.2} L${n + i * 0.12},${r + i * 0.65} L${n - i * 0.12},${r + i * 0.65} Z`].join(` `);
}), ACTION_BUTTON_GLYPH_PATHS.set(`actionButtonDocument`, (e, t) => {
  let n = e / 2,
    r = t / 2,
    i = Math.min(e, t) * 0.28,
    a = i * 0.7,
    o = i,
    s = i * 0.3;
  return [`M${n - a},${r - o}`, `L${n + a - s},${r - o} L${n + a},${r - o + s}`, `L${n + a},${r + o} L${n - a},${r + o} Z`, `M${n + a - s},${r - o} L${n + a - s},${r - o + s} L${n + a},${r - o + s}`].join(` `);
});

/** 原 Ai（jsx 9419-9422）：预设名（小写优先）→ 字形路径 */
export function actionButtonGlyphPath(e: string, t: number, n: number): string | undefined {
  let r = e.toLowerCase();
  return (ACTION_BUTTON_GLYPH_PATHS.get(r) ?? ACTION_BUTTON_GLYPH_PATHS.get(e))?.(t, n);
}

/* ============================================================================
 * actionButton 度量与外框（原 Mi/Ni，jsx 9610-9627）
 * pptxEngineGeometry.ts 1441/1451 已有同形副本但未导出；整合期改指本文件。
 * ==========================================================================*/

/** 原 Mi（jsx 9610-9624） */
export function actionButtonMetrics(e: number, t: number) {
  let n = Math.min(e, t),
    r = e / 2,
    i = t / 2,
    a = n * 3 / 8;
  return {
    ss: n,
    hc: r,
    vc: i,
    dx2: a,
    g9: i - a,
    g10: i + a,
    g11: r - a,
    g12: r + a,
    g13: n * 3 / 4
  };
}

/** 原 Ni（jsx 9626） */
export const actionButtonOuterRect = (e: number, t: number) => `M0,0 L${e},0 L${e},${t} L0,${t} Z`;

/* ============================================================================
 * 多区域形状注册表余量（原 ji.set ×38，jsx 9683-10680 / 10696-10856）
 * 注册进 pptxEngineGeometry.ts 导出的 MULTI_REGION_SHAPES（同一 ji 注册表）。
 * 已转录 6 条（见头注边界互斥）不重复。
 * ==========================================================================*/

/* --- actionButton 族（jsx 9683-10095） --- */

MULTI_REGION_SHAPES.set(`actionButtonBeginning`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g12: a,
      g13: o,
      vc: s
    } = actionButtonMetrics(e, t),
    c = o / 8,
    l = o / 4,
    u = i + c,
    d = `${`M${i + l},${s} L${a},${n} L${a},${r} Z`} ${`M${u},${n} L${i},${n} L${i},${r} L${u},${r} Z`}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${d}`,
    fill: `norm`,
    stroke: false
  }, {
    d,
    fill: `darken`,
    stroke: false
  }, {
    d,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonEnd`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g12: a,
      g13: o,
      vc: s
    } = actionButtonMetrics(e, t),
    c = o * 3 / 4,
    l = o * 7 / 8,
    u = i + c,
    d = i + l,
    f = `${`M${u},${s} L${i},${n} L${i},${r} Z`} ${`M${d},${n} L${a},${n} L${a},${r} L${d},${r} Z`}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${f}`,
    fill: `norm`,
    stroke: false
  }, {
    d: f,
    fill: `darken`,
    stroke: false
  }, {
    d: f,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonReturn`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g12: a,
      g13: o,
      hc: s
    } = actionButtonMetrics(e, t),
    c = o * 7 / 8,
    l = o * 3 / 4,
    u = o * 5 / 8,
    d = o * 3 / 8,
    f = o / 4,
    p = o / 8,
    m = n + l,
    h = n + u,
    g = n + f,
    _ = i + c,
    v = i + l,
    y = i + u,
    b = i + d,
    x = i + f,
    S = [`M${a},${g}`, `L${v},${n}`, `L${s},${g}`, `L${y},${g}`, `L${y},${h}`, `A${p},${p} 0 0,1 ${y - p},${m}`, `L${b},${m}`, `A${p},${p} 0 0,1 ${x},${h}`, `L${x},${g}`, `L${i},${g}`, `L${i},${h}`, `A${d},${d} 0 0,0 ${b},${r}`, `L${s},${r}`, `A${d},${d} 0 0,0 ${s + d},${r - d}`, `L${_},${g}`, `Z`].join(` `),
    C = [`M${a},${g}`, `L${_},${g}`, `L${_},${h}`, `A${d},${d} 0 0,1 ${i + o / 2},${r}`, `L${b},${r}`, `A${d},${d} 0 0,1 ${i},${h}`, `L${i},${g}`, `L${x},${g}`, `L${x},${h}`, `A${p},${p} 0 0,0 ${b},${m}`, `L${s},${m}`, `A${p},${p} 0 0,0 ${y},${h}`, `L${y},${g}`, `L${s},${g}`, `L${v},${n}`, `Z`].join(` `);
  return [{
    d: `${actionButtonOuterRect(e, t)} ${S}`,
    fill: `norm`,
    stroke: false
  }, {
    d: S,
    fill: `darken`,
    stroke: false
  }, {
    d: C,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonSound`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g12: a,
      g13: o,
      vc: s
    } = actionButtonMetrics(e, t),
    c = o / 8,
    l = o * 5 / 16,
    u = o * 5 / 8,
    d = o * 11 / 16,
    f = o * 3 / 4,
    p = o * 7 / 8,
    m = n + c,
    h = n + l,
    g = n + d,
    _ = n + p,
    v = i + l,
    y = i + u,
    b = i + f,
    x = `M${i},${h} L${i},${g} L${v},${g} L${y},${r} L${y},${n} L${v},${h} Z`,
    S = `${`M${i},${h} L${v},${h} L${y},${n} L${y},${r} L${v},${g} L${i},${g} Z`} ${`M${b},${h} L${a},${m}`} ${`M${b},${s} L${a},${s}`} ${`M${b},${g} L${a},${_}`}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${x}`,
    fill: `norm`,
    stroke: false
  }, {
    d: x,
    fill: `darken`,
    stroke: false
  }, {
    d: S,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonInformation`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g13: a,
      hc: o,
      dx2: s
    } = actionButtonMetrics(e, t),
    c = a / 32,
    l = a * 5 / 16,
    u = a * 3 / 8,
    d = a * 13 / 32,
    f = a * 19 / 32,
    p = a * 11 / 16,
    m = a * 13 / 16,
    h = a * 7 / 8,
    g = a * 3 / 32,
    _ = n + c,
    v = n + l,
    y = n + u,
    b = n + m,
    x = n + h,
    S = i + l,
    C = i + d,
    w = i + f,
    T = i + p,
    E = `M${o},${n} A${s},${s} 0 1,1 ${o},${r} A${s},${s} 0 1,1 ${o},${n} Z`,
    D = `${`M${o},${_} A${g},${g} 0 1,1 ${o},${_ + g * 2} A${g},${g} 0 1,1 ${o},${_} Z`} ${`M${S},${v} L${T},${v} L${T},${y} L${w},${y} L${w},${b} L${T},${b} L${T},${x} L${S},${x} L${S},${b} L${C},${b} L${C},${y} L${S},${y} Z`}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${E}`,
    fill: `norm`,
    stroke: false
  }, {
    d: `${E} ${D}`,
    fill: `darken`,
    stroke: false
  }, {
    d: D,
    fill: `lighten`,
    stroke: false
  }, {
    d: `${E} ${D}`,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonHome`, (e, t) => {
  let {
      g9: n,
      g10: r,
      g11: i,
      g12: a,
      g13: o,
      hc: s,
      vc: c
    } = actionButtonMetrics(e, t),
    l = o / 16,
    u = o / 8,
    d = o * 3 / 16,
    f = o * 5 / 16,
    p = o * 7 / 16,
    m = o * 9 / 16,
    h = o * 11 / 16,
    g = o * 3 / 4,
    _ = o * 13 / 16,
    v = o * 7 / 8,
    y = n + l,
    b = n + d,
    x = n + f,
    S = n + g,
    C = i + u,
    w = i + p,
    T = i + m,
    E = i + h,
    D = i + _,
    O = i + v,
    k = `M${s},${n} L${i},${c} L${C},${c} L${C},${r} L${O},${r} L${O},${c} L${a},${c} L${D},${x} L${D},${y} L${E},${y} L${E},${b} Z`,
    A = `M${D},${x} L${D},${y} L${E},${y} L${E},${b} Z`,
    j = `M${C},${c} L${C},${r} L${w},${r} L${w},${S} L${T},${S} L${T},${r} L${O},${r} L${O},${c} Z`,
    M = `M${s},${n} L${i},${c} L${a},${c} Z`,
    N = `M${w},${S} L${T},${S} L${T},${r} L${w},${r} Z`,
    P = `M${s},${n} L${E},${b} L${E},${y} L${D},${y} L${D},${x} L${a},${c} L${O},${c} L${O},${r} L${C},${r} L${C},${c} L${i},${c} Z M${E},${b} L${D},${x} M${O},${c} L${C},${c} M${w},${r} L${w},${S} L${T},${S} L${T},${r}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${k}`,
    fill: `norm`,
    stroke: false
  }, {
    d: `${A} ${j}`,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: `${M} ${N}`,
    fill: `darken`,
    stroke: false
  }, {
    d: P,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonHelp`, (e, t) => {
  let {
      g9: n,
      g11: r,
      g13: i,
      hc: a
    } = actionButtonMetrics(e, t),
    o = i / 7,
    s = i * 3 / 14,
    c = i * 2 / 7,
    l = i * 3 / 7,
    u = i * 4 / 7,
    d = i * 17 / 28,
    f = i * 21 / 28,
    p = i * 11 / 14,
    m = i / 14,
    h = i * 3 / 28,
    g = n + c,
    _ = n + d,
    v = n + f,
    y = n + p,
    b = r + s,
    x = r + l,
    S = r + u,
    w = b,
    T = g,
    E = arcSegment(w, T, c, c, 180, 180);
  w = E.endX, T = E.endY;
  let D = arcSegment(w, T, o, s, 0, 90);
  w = D.endX, T = D.endY;
  let O = arcSegment(w, T, m, h, 270, -90),
    k = arcSegment(x, _, o, s, 180, 90),
    A = arcSegment(k.endX, k.endY, m, h, 90, -90),
    j = arcSegment(A.endX, A.endY, o, o, 0, -180),
    M = `M${a},${y} A${h},${h} 0 1,1 ${a},${y + h * 2} A${h},${h} 0 1,1 ${a},${y} Z`,
    N = `${`M${b},${g} ${E.svg} ${D.svg} ${O.svg} L${S},${v} L${x},${v} L${x},${_} ${k.svg} ${A.svg} ${j.svg} Z`} ${M}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${N}`,
    fill: `norm`,
    stroke: false
  }, {
    d: N,
    fill: `darken`,
    stroke: false
  }, {
    d: N,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonDocument`, (e, t) => {
  let n = Math.min(e, t),
    r = e / 2,
    i = t / 2,
    a = n * 3 / 8,
    o = n * 9 / 32,
    s = i - a,
    c = i + a,
    l = r - o,
    u = r + o,
    d = n * 3 / 16,
    f = u - d,
    p = s + d,
    m = `M${l},${s} L${f},${s} L${u},${p} L${u},${c} L${l},${c} Z`,
    h = `M${f},${s} L${f},${p} L${u},${p} Z`,
    g = `${m} M${u},${p} L${f},${p} L${f},${s}`;
  return [{
    d: `${actionButtonOuterRect(e, t)} ${m}`,
    fill: `norm`,
    stroke: false
  }, {
    d: m,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: h,
    fill: `darken`,
    stroke: false
  }, {
    d: g,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`actionButtonMovie`, (e, t) => {
  let {
      g9: n,
      g11: r,
      g12: i,
      g13: a
    } = actionButtonMetrics(e, t),
    o = a * 1455 / 21600,
    s = a * 1905 / 21600,
    c = a * 2325 / 21600,
    l = a * 16155 / 21600,
    u = a * 17010 / 21600,
    d = a * 19335 / 21600,
    f = a * 19725 / 21600,
    p = a * 20595 / 21600,
    m = a * 5280 / 21600,
    h = a * 5730 / 21600,
    g = a * 6630 / 21600,
    _ = a * 7492 / 21600,
    v = a * 9067 / 21600,
    y = a * 9555 / 21600,
    b = a * 13342 / 21600,
    x = a * 14580 / 21600,
    S = a * 15592 / 21600,
    C = r + o,
    w = r + s,
    T = r + c,
    E = r + l,
    D = r + u,
    O = r + d,
    k = r + f,
    A = r + p,
    j = n + m,
    M = n + h,
    N = n + g,
    P = n + _,
    F = n + v,
    I = n + y,
    L = n + b,
    R = n + x,
    z = n + S,
    B = [`M${r},${j}`, `L${r},${I}`, `L${C},${I}`, `L${w},${F}`, `L${T},${F}`, `L${T},${z}`, `L${D},${z}`, `L${D},${L}`, `L${O},${L}`, `L${A},${R}`, `L${i},${R}`, `L${i},${N}`, `L${A},${N}`, `L${k},${P}`, `L${D},${P}`, `L${D},${N}`, `L${E},${M}`, `L${w},${M}`, `L${C},${j}`, `Z`].join(` `);
  return [{
    d: `${actionButtonOuterRect(e, t)} ${B}`,
    fill: `norm`,
    stroke: false
  }, {
    d: B,
    fill: `darken`,
    stroke: false
  }, {
    d: B,
    fill: `none`,
    stroke: true
  }, {
    d: actionButtonOuterRect(e, t),
    fill: `none`,
    stroke: true
  }];
});

/* --- bevel / 缎带族 / 笑脸 / 罐（jsx 10132-10434） --- */

MULTI_REGION_SHAPES.set(`bevel`, (e, t, n) => {
  let r = Math.min(Math.max(adjRatio(n, `adj`, 12500), 0), 0.45),
    i = Math.min(e, t) * r,
    a = `M${i},${i} L${e - i},${i} L${e - i},${t - i} L${i},${t - i} Z`,
    o = `M0,0 L${e},0 L${e - i},${i} L${i},${i} Z`,
    s = `M0,${t} L${i},${t - i} L${e - i},${t - i} L${e},${t} Z`,
    c = `M0,0 L${i},${i} L${i},${t - i} L0,${t} Z`,
    l = `M${e},0 L${e},${t} L${e - i},${t - i} L${e - i},${i} Z`;
  return [{
    d: a,
    fill: `norm`,
    stroke: true
  }, {
    d: o,
    fill: `lightenLess`,
    stroke: true
  }, {
    d: l,
    fill: `darken`,
    stroke: true
  }, {
    d: s,
    fill: `darken`,
    stroke: true
  }, {
    d: c,
    fill: `lighten`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`leftRightRibbon`, (e, t, n) => {
  let r = Math.min(e, t),
    i = e / 2,
    a = e / 32,
    o = e / 2,
    s = t / 2,
    c = Math.min(Math.max((n?.get(`adj3`) ?? 16667) / 1e5, 0), 0.33333),
    l = 1 - c,
    u = Math.min(Math.max((n?.get(`adj1`) ?? 5e4) / 1e5, 0), l),
    d = (i - a) / r,
    f = r * Math.min(Math.max((n?.get(`adj2`) ?? 5e4) / 1e5, 0), d),
    p = e - f,
    m = t * u / 2,
    h = -t * c / 2,
    g = s + h - m,
    _ = s + m - h,
    v = g + m,
    y = t - v,
    b = v * 2,
    x = t - b,
    S = b - g,
    C = t - S,
    w = c * r / 4,
    T = o - a,
    E = o + a,
    D = g + w,
    O = C - w,
    A = arcSegment(o, g, a, w, 270, 180),
    j = arcSegment(A.endX, A.endY, a, w, 270, -180),
    M = arcSegment(o, _, a, w, 90, 90),
    N = [`M0,${v}`, `L${f},0`, `L${f},${g}`, `L${o},${g}`, A.svg, j.svg, `L${p},${C}`, `L${p},${x}`, `L${e},${y}`, `L${p},${t}`, `L${p},${_}`, `L${o},${_}`, M.svg, `L${T},${S}`, `L${f},${S}`, `L${f},${b}`, `Z`].join(` `),
    P = arcSegment(E, D, a, w, 0, 90),
    F = arcSegment(P.endX, P.endY, a, w, 270, -180),
    I = [`M${E},${D}`, P.svg, F.svg, `L${E},${C}`, `Z`].join(` `),
    L = [N, `M${E},${D} L${E},${C}`, `M${T},${O} L${T},${S}`].join(` `);
  return [{
    d: N,
    fill: `norm`,
    stroke: false
  }, {
    d: I,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: L,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`ellipseRibbon`, (e, t, n) => {
  let r = n?.get(`adj1`) ?? 25e3,
    i = n?.get(`adj2`) ?? 5e4,
    a = n?.get(`adj3`) ?? 12500,
    o = Math.max(0, Math.min(r, 1e5)),
    s = Math.max(25e3, Math.min(i, 75e3)),
    c = o - (1e5 - o) / 2,
    l = Math.max(Math.max(0, c), Math.min(a, o)),
    u = e * s / 2e5,
    d = e / 2 - u,
    f = d + e / 8,
    p = e - f,
    m = e - d,
    h = e - e / 8,
    g = t * l / 1e5,
    _ = e > 0 ? 4 * g / e : 0,
    v = (t: number) => _ * (t - t * t / e),
    y = v(f),
    b = f / 2,
    x = _ * b,
    S = e - b,
    C = t * o / 1e5,
    w = C - g,
    T = v(d),
    E = T + w,
    D = g + w - E + g + w,
    O = t - C,
    k = (g * 14 / 16 + O) / 2,
    A = T + O,
    j = E + O,
    M = d / 2,
    N = _ * M + O,
    P = e - M,
    F = D + O,
    I = y + w,
    L = C + C - I,
    R = e / 2,
    z = e / 8,
    B = [`M0,0`, `Q${b},${x} ${f},${y}`, `L${d},${E}`, `Q${R},${D} ${m},${E}`, `L${p},${y}`, `Q${S},${x} ${e},0`, `L${h},${k}`, `L${e},${O}`, `Q${P},${N} ${m},${A}`, `L${m},${j}`, `Q${R},${F} ${d},${j}`, `L${d},${A}`, `Q${M},${N} 0,${O}`, `L${z},${k}`, `Z`].join(` `),
    ee = [`M${f},${I}`, `L${f},${y}`, `L${d},${E}`, `Q${R},${D} ${m},${E}`, `L${p},${y}`, `L${p},${I}`, `Q${R},${L} ${f},${I}`, `Z`].join(` `),
    te = [`M0,0`, `Q${b},${x} ${f},${y}`, `L${d},${E}`, `Q${R},${D} ${m},${E}`, `L${p},${y}`, `Q${S},${x} ${e},0`, `L${h},${k}`, `L${e},${O}`, `Q${P},${N} ${m},${A}`, `L${m},${j}`, `Q${R},${F} ${d},${j}`, `L${d},${A}`, `Q${M},${N} 0,${O}`, `L${z},${k}`, `Z`, `M${d},${A} L${d},${E}`, `M${m},${E} L${m},${A}`, `M${f},${y} L${f},${I}`, `M${p},${I} L${p},${y}`].join(` `);
  return [{
    d: B,
    fill: `norm`,
    stroke: false
  }, {
    d: ee,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: te,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`ellipseRibbon2`, (e, t, n) => {
  let r = n?.get(`adj1`) ?? 25e3,
    i = n?.get(`adj2`) ?? 5e4,
    a = n?.get(`adj3`) ?? 12500,
    o = Math.max(0, Math.min(r, 1e5)),
    s = Math.max(25e3, Math.min(i, 75e3)),
    c = o - (1e5 - o) / 2,
    l = Math.max(Math.max(0, c), Math.min(a, o)),
    u = t,
    d = e * s / 2e5,
    f = e / 2 - d,
    p = f + e / 8,
    m = e - p,
    h = e - f,
    g = e - e / 8,
    _ = t * l / 1e5,
    v = e > 0 ? 4 * _ / e : 0,
    y = v * (p - p * p / e),
    b = u - y,
    x = p / 2,
    S = u - v * x,
    C = e - x,
    w = t * o / 1e5,
    T = w - _,
    E = v * (f - f * f / e),
    D = E + T,
    O = u - D,
    k = _ + T - D + _ + T,
    A = u - k,
    j = u - w,
    M = u - (_ * 14 / 16 + j) / 2,
    N = u - (E + j),
    P = u - (D + j),
    F = f / 2,
    I = u - (v * F + j),
    L = e - F,
    R = u - (k + j),
    z = y + T,
    B = u - z,
    ee = u - (w + w - z),
    te = e / 2,
    ne = e / 8,
    re = [`M0,${u}`, `Q${x},${S} ${p},${b}`, `L${f},${O}`, `Q${te},${A} ${h},${O}`, `L${m},${b}`, `Q${C},${S} ${e},${u}`, `L${g},${M}`, `L${e},${w}`, `Q${L},${I} ${h},${N}`, `L${h},${P}`, `Q${te},${R} ${f},${P}`, `L${f},${N}`, `Q${F},${I} 0,${w}`, `L${ne},${M}`, `Z`].join(` `),
    ie = [`M${p},${B}`, `L${p},${b}`, `L${f},${O}`, `Q${te},${A} ${h},${O}`, `L${m},${b}`, `L${m},${B}`, `Q${te},${ee} ${p},${B}`, `Z`].join(` `),
    ae = [`M0,${u}`, `L${ne},${M}`, `L0,${w}`, `Q${F},${I} ${f},${N}`, `L${f},${P}`, `Q${te},${R} ${h},${P}`, `L${h},${N}`, `Q${L},${I} ${e},${w}`, `L${g},${M}`, `L${e},${u}`, `Q${C},${S} ${m},${b}`, `L${h},${O}`, `Q${te},${A} ${f},${O}`, `L${p},${b}`, `Q${x},${S} 0,${u}`, `Z`, `M${f},${O} L${f},${N}`, `M${h},${N} L${h},${O}`, `M${p},${B} L${p},${b}`, `M${m},${b} L${m},${B}`].join(` `);
  return [{
    d: re,
    fill: `norm`,
    stroke: false
  }, {
    d: ie,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: ae,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`smileyFace`, (e, t, n) => {
  let r = e / 2,
    i = t / 2,
    a = e / 2,
    o = t / 2,
    s = n?.get(`adj`) ?? 4653,
    c = Math.max(-4653, Math.min(s, 4653)),
    l = e * 6215 / 21600,
    u = e * 13135 / 21600,
    d = t * 7570 / 21600,
    f = e * 1125 / 21600,
    p = t * 1125 / 21600,
    m = e * 4969 / 21699,
    h = e * 16640 / 21600,
    g = t * 16515 / 21600,
    _ = t * c / 1e5,
    v = g - _,
    y = g + _ + t * c / 5e4,
    b = `M${e},${o} A${r},${i} 0 1,1 0,${o} A${r},${i} 0 1,1 ${e},${o} Z`,
    x = `M${(l + f).toFixed(2)},${d.toFixed(2)} A${f.toFixed(2)},${p.toFixed(2)} 0 1,1 ${(l - f).toFixed(2)},${d.toFixed(2)} A${f.toFixed(2)},${p.toFixed(2)} 0 1,1 ${(l + f).toFixed(2)},${d.toFixed(2)} Z`,
    S = `M${(u + f).toFixed(2)},${d.toFixed(2)} A${f.toFixed(2)},${p.toFixed(2)} 0 1,1 ${(u - f).toFixed(2)},${d.toFixed(2)} A${f.toFixed(2)},${p.toFixed(2)} 0 1,1 ${(u + f).toFixed(2)},${d.toFixed(2)} Z`,
    C = `M${m.toFixed(2)},${v.toFixed(2)} Q${a.toFixed(2)},${y.toFixed(2)} ${h.toFixed(2)},${v.toFixed(2)}`,
    w = `M${e},${o} A${r},${i} 0 1,1 0,${o} A${r},${i} 0 1,1 ${e},${o} Z`;
  return [{
    d: b,
    fill: `norm`,
    stroke: false
  }, {
    d: `${x} ${S}`,
    fill: `darkenLess`,
    stroke: false
  }, {
    d: C,
    fill: `none`,
    stroke: true
  }, {
    d: w,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`can`, (e, t, n) => {
  let r = Math.min(e, t),
    i = 5e4 * t / r,
    a = r * Math.min(Math.max(n?.get(`adj`) ?? 25e3, 0), i) / 2e5,
    o = t - a,
    s = e / 2,
    l = arcSegment(0, a, s, a, 180, -180),
    u = arcSegment(e, o, s, a, 0, 180),
    d = `M0,${a} ${l.svg} L${e},${o} ${u.svg} Z`,
    f = arcSegment(0, a, s, a, 180, 180),
    p = arcSegment(f.endX, f.endY, s, a, 0, 180),
    m = `M0,${a} ${f.svg} ${p.svg} Z`,
    h = arcSegment(e, a, s, a, 0, 180),
    g = arcSegment(h.endX, h.endY, s, a, 180, 180),
    _ = arcSegment(e, o, s, a, 0, 180),
    v = `M${e},${a} ${h.svg} ${g.svg} L${e},${o} ${_.svg} L0,${a}`;
  return [{
    d,
    fill: `norm`,
    stroke: false
  }, {
    d: m,
    fill: `lighten`,
    stroke: false
  }, {
    d: v,
    fill: `none`,
    stroke: true
  }];
});

/* --- 弯箭头四条委托（原 ji.set，jsx 10435） --- */

MULTI_REGION_SHAPES.set(`curvedrightarrow`, (e, t, n) => wrapSplitPresetRegions(`curvedRightArrow`, e, t, n)), MULTI_REGION_SHAPES.set(`curvedleftarrow`, (e, t, n) => wrapSplitPresetRegions(`curvedLeftArrow`, e, t, n)), MULTI_REGION_SHAPES.set(`curveduparrow`, (e, t, n) => wrapVerticalArrowRegions(`curvedUpArrow`, e, t, n)), MULTI_REGION_SHAPES.set(`curveddownarrow`, (e, t, n) => wrapVerticalArrowRegions(`curvedDownArrow`, e, t, n));

/* --- 呼出框族（原 ji.set，jsx 10435-10650） --- */

MULTI_REGION_SHAPES.set(`bordercallout1`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 112500) / 1e5,
    o = e * (n?.get(`adj4`) ?? -38333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentcallout1`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 112500) / 1e5,
    o = e * (n?.get(`adj4`) ?? -38333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentcallout2`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 112500) / 1e5,
    c = e * (n?.get(`adj6`) ?? -46667) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentcallout3`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 1e5) / 1e5,
    c = e * (n?.get(`adj6`) ?? -16667) / 1e5,
    l = t * (n?.get(`adj7`) ?? 112963) / 1e5,
    u = e * (n?.get(`adj8`) ?? -8333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s} L${u},${l}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`callout1`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 112500) / 1e5,
    o = e * (n?.get(`adj4`) ?? -38333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},${r} L${o},${a}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`callout2`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 112500) / 1e5,
    c = e * (n?.get(`adj6`) ?? -46667) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`callout3`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 1e5) / 1e5,
    c = e * (n?.get(`adj6`) ?? -16667) / 1e5,
    l = t * (n?.get(`adj7`) ?? 112963) / 1e5,
    u = e * (n?.get(`adj8`) ?? -8333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s} L${u},${l}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`bordercallout2`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 112500) / 1e5,
    c = e * (n?.get(`adj6`) ?? -46667) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`bordercallout3`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 1e5) / 1e5,
    c = e * (n?.get(`adj6`) ?? -16667) / 1e5,
    l = t * (n?.get(`adj7`) ?? 112963) / 1e5,
    u = e * (n?.get(`adj8`) ?? -8333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s} L${u},${l}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentbordercallout1`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 112500) / 1e5,
    o = e * (n?.get(`adj4`) ?? -38333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentbordercallout2`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 112500) / 1e5,
    c = e * (n?.get(`adj6`) ?? -46667) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`accentbordercallout3`, (e, t, n) => {
  let r = t * (n?.get(`adj1`) ?? 18750) / 1e5,
    i = e * (n?.get(`adj2`) ?? -8333) / 1e5,
    a = t * (n?.get(`adj3`) ?? 18750) / 1e5,
    o = e * (n?.get(`adj4`) ?? -16667) / 1e5,
    s = t * (n?.get(`adj5`) ?? 1e5) / 1e5,
    c = e * (n?.get(`adj6`) ?? -16667) / 1e5,
    l = t * (n?.get(`adj7`) ?? 112963) / 1e5,
    u = e * (n?.get(`adj8`) ?? -8333) / 1e5;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: true
  }, {
    d: `M${i},0 L${i},${t}`,
    fill: `none`,
    stroke: true
  }, {
    d: `M${i},${r} L${o},${a} L${c},${s} L${u},${l}`,
    fill: `none`,
    stroke: true
  }];
});

/* --- 图表占位族（原 ji.set，jsx 10651-10680） --- */

MULTI_REGION_SHAPES.set(`chartx`, (e, t) => [{
  d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
  fill: `norm`,
  stroke: false
}, {
  d: `M0,0 L${e},${t} M${e},0 L0,${t}`,
  fill: `none`,
  stroke: true
}]), MULTI_REGION_SHAPES.set(`chartplus`, (e, t) => {
  let n = e / 2,
    r = t / 2;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M${n},0 L${n},${t} M0,${r} L${e},${r}`,
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`chartstar`, (e, t) => {
  let n = e / 2;
  return [{
    d: `M0,0 L${e},0 L${e},${t} L0,${t} Z`,
    fill: `norm`,
    stroke: false
  }, {
    d: `M0,0 L${e},${t} M${e},0 L0,${t} M${n},0 L${n},${t}`,
    fill: `none`,
    stroke: true
  }];
});

/* --- 缎带/卷轴族（原 ji.set，jsx 10696-10856；弧助手 H → arcSegment） --- */

MULTI_REGION_SHAPES.set(`ribbon`, (e, t, n) => {
  let r = n?.get(`adj1`) ?? 16667,
    i = n?.get(`adj2`) ?? 5e4,
    a = Math.min(Math.max(r, 0), 33333),
    o = Math.min(Math.max(i, 25e3), 75e3),
    s = e / 2,
    c = e / 8,
    l = e / 32,
    u = e - c,
    d = e * o / 2e5,
    f = s - d,
    p = s + d,
    m = f + l,
    h = p - l,
    g = f + c,
    _ = p - c,
    v = g - l,
    y = _ + l,
    b = t * a / 2e5,
    x = t * a / 1e5,
    S = t - x,
    C = S / 2,
    w = t * a / 4e5,
    T = t - w,
    E = x - w,
    D: number,
    O: number,
    k: ArcStep,
    A: string[] = [];
  D = 0, O = 0, A.push(`M0,0`), A.push(`L${v},0`), D = v, O = 0, k = arcSegment(D, O, l, w, 270, 180), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${m},${b}`), D = m, O = b, k = arcSegment(D, O, l, w, 270, -180), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${h},${x}`), D = h, O = x, k = arcSegment(D, O, l, w, 90, -180), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${y},${b}`), D = y, O = b, k = arcSegment(D, O, l, w, 90, 180), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${e},0`), A.push(`L${u},${C}`), A.push(`L${e},${S}`), A.push(`L${p},${S}`), A.push(`L${p},${T}`), D = p, O = T, k = arcSegment(D, O, l, w, 0, 90), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${m},${t}`), D = m, O = t, k = arcSegment(D, O, l, w, 90, 90), A.push(k.svg), D = k.endX, O = k.endY, A.push(`L${f},${S}`), A.push(`L0,${S}`), A.push(`L${c},${C}`), A.push(`Z`);
  let j: string[] = [];
  D = g, O = w, j.push(`M${D},${O}`), k = arcSegment(D, O, l, w, 0, 90), j.push(k.svg), D = k.endX, O = k.endY, j.push(`L${m},${b}`), D = m, O = b, k = arcSegment(D, O, l, w, 270, -180), j.push(k.svg), D = k.endX, O = k.endY, j.push(`L${g},${x}`), j.push(`Z`), D = _, O = w, j.push(`M${D},${O}`), k = arcSegment(D, O, l, w, 180, -90), j.push(k.svg), D = k.endX, O = k.endY, j.push(`L${h},${b}`), D = h, O = b, k = arcSegment(D, O, l, w, 270, 180), j.push(k.svg), D = k.endX, O = k.endY, j.push(`L${_},${x}`), j.push(`Z`);
  let M: string[] = [];
  return D = 0, O = 0, M.push(`M0,0`), M.push(`L${v},0`), D = v, O = 0, k = arcSegment(D, O, l, w, 270, 180), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${m},${b}`), D = m, O = b, k = arcSegment(D, O, l, w, 270, -180), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${h},${x}`), D = h, O = x, k = arcSegment(D, O, l, w, 90, -180), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${y},${b}`), D = y, O = b, k = arcSegment(D, O, l, w, 90, 180), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${e},0`), M.push(`L${u},${C}`), M.push(`L${e},${S}`), M.push(`L${p},${S}`), M.push(`L${p},${T}`), D = p, O = T, k = arcSegment(D, O, l, w, 0, 90), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${m},${t}`), D = m, O = t, k = arcSegment(D, O, l, w, 90, 90), M.push(k.svg), D = k.endX, O = k.endY, M.push(`L${f},${S}`), M.push(`L0,${S}`), M.push(`L${c},${C}`), M.push(`Z`), M.push(`M${g},${w} L${g},${x}`), M.push(`M${_},${x} L${_},${w}`), M.push(`M${f},${S} L${f},${E}`), M.push(`M${p},${E} L${p},${S}`), [{
    d: A.join(` `),
    fill: `norm`,
    stroke: false
  }, {
    d: j.join(` `),
    fill: `darkenLess`,
    stroke: false
  }, {
    d: M.join(` `),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`ribbon2`, (e, t, n) => {
  let r = n?.get(`adj1`) ?? 16667,
    i = n?.get(`adj2`) ?? 5e4,
    a = Math.min(Math.max(r, 0), 33333),
    o = Math.min(Math.max(i, 25e3), 75e3),
    s = e / 2,
    c = e / 8,
    l = e / 32,
    u = e - c,
    d = e * o / 2e5,
    f = s - d,
    p = s + d,
    m = f + l,
    h = p - l,
    g = f + c,
    _ = p - c,
    v = g - l,
    y = _ + l,
    b = t - t * a / 2e5,
    x = t * a / 1e5,
    S = t - x,
    C = x,
    w = (C + t) / 2,
    T = t * a / 4e5,
    E = t - T,
    D = b - T,
    O: number,
    k: number,
    A: ArcStep,
    j: string[] = [];
  j.push(`M0,${t}`), j.push(`L${v},${t}`), O = v, k = t, A = arcSegment(O, k, l, T, 90, -180), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${m},${b}`), O = m, k = b, A = arcSegment(O, k, l, T, 90, 180), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${h},${S}`), O = h, k = S, A = arcSegment(O, k, l, T, 270, 180), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${y},${b}`), O = y, k = b, A = arcSegment(O, k, l, T, 270, -180), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${e},${t}`), j.push(`L${u},${w}`), j.push(`L${e},${C}`), j.push(`L${p},${C}`), j.push(`L${p},${T}`), O = p, k = T, A = arcSegment(O, k, l, T, 0, -90), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${m},0`), O = m, k = 0, A = arcSegment(O, k, l, T, 270, -90), j.push(A.svg), O = A.endX, k = A.endY, j.push(`L${f},${C}`), j.push(`L0,${C}`), j.push(`L${c},${w}`), j.push(`Z`);
  let M: string[] = [];
  O = g, k = E, M.push(`M${O},${k}`), A = arcSegment(O, k, l, T, 0, -90), M.push(A.svg), O = A.endX, k = A.endY, M.push(`L${m},${b}`), O = m, k = b, A = arcSegment(O, k, l, T, 90, 180), M.push(A.svg), O = A.endX, k = A.endY, M.push(`L${g},${S}`), M.push(`Z`), O = _, k = E, M.push(`M${O},${k}`), A = arcSegment(O, k, l, T, 180, 90), M.push(A.svg), O = A.endX, k = A.endY, M.push(`L${h},${b}`), O = h, k = b, A = arcSegment(O, k, l, T, 90, -180), M.push(A.svg), O = A.endX, k = A.endY, M.push(`L${_},${S}`), M.push(`Z`);
  let N: string[] = [];
  return N.push(`M0,${t}`), N.push(`L${c},${w}`), N.push(`L0,${C}`), N.push(`L${f},${C}`), N.push(`L${f},${T}`), O = f, k = T, A = arcSegment(O, k, l, T, 180, 90), N.push(A.svg), O = A.endX, k = A.endY, N.push(`L${h},0`), O = h, k = 0, A = arcSegment(O, k, l, T, 270, 90), N.push(A.svg), O = A.endX, k = A.endY, N.push(`L${p},${C}`), N.push(`L${e},${C}`), N.push(`L${u},${w}`), N.push(`L${e},${t}`), N.push(`L${y},${t}`), O = y, k = t, A = arcSegment(O, k, l, T, 90, 180), N.push(A.svg), O = A.endX, k = A.endY, N.push(`L${h},${b}`), O = h, k = b, A = arcSegment(O, k, l, T, 90, -180), N.push(A.svg), O = A.endX, k = A.endY, N.push(`L${m},${S}`), O = m, k = S, A = arcSegment(O, k, l, T, 270, -180), N.push(A.svg), O = A.endX, k = A.endY, N.push(`L${v},${b}`), O = v, k = b, A = arcSegment(O, k, l, T, 270, 180), N.push(A.svg), O = A.endX, k = A.endY, N.push(`Z`), N.push(`M${g},${S} L${g},${E}`), N.push(`M${_},${E} L${_},${S}`), N.push(`M${f},${D} L${f},${C}`), N.push(`M${p},${C} L${p},${D}`), [{
    d: j.join(` `),
    fill: `norm`,
    stroke: false
  }, {
    d: M.join(` `),
    fill: `darkenLess`,
    stroke: false
  }, {
    d: N.join(` `),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`horizontalscroll`, (e, t, n) => {
  let r = n?.get(`adj`) ?? 12500,
    i = Math.min(e, t) * Math.min(Math.max(r, 0), 25e3) / 1e5,
    a = i / 2,
    o = i / 4,
    s = i + a,
    c = i + i,
    l = t - i,
    u = t - a,
    d = l - a,
    f = e - i,
    p = e - a,
    m: string[] = [],
    h: number,
    g: number;
  h = e, g = a, m.push(`M${h},${g}`);
  let _ = arcSegment(h, g, a, a, 0, 90);
  m.push(_.svg), h = _.endX, g = _.endY, m.push(`L${p},${a}`), _ = arcSegment(p, a, o, o, 0, 180), m.push(_.svg), h = _.endX, g = _.endY, m.push(`L${f},${i}`), m.push(`L${a},${i}`), h = a, g = i, _ = arcSegment(h, g, a, a, 270, -90), m.push(_.svg), h = _.endX, g = _.endY, m.push(`L0,${u}`), h = 0, g = u, _ = arcSegment(h, g, a, a, 180, -180), m.push(_.svg), h = _.endX, g = _.endY, m.push(`L${i},${l}`), m.push(`L${p},${l}`), h = p, g = l, _ = arcSegment(h, g, a, a, 90, -90), m.push(_.svg), m.push(`Z`), h = a, g = c, m.push(`M${h},${g}`), _ = arcSegment(h, g, a, a, 90, -90), m.push(_.svg), h = _.endX, g = _.endY, _ = arcSegment(h, g, o, o, 0, -180), m.push(_.svg), m.push(`Z`);
  let v: string[] = [];
  h = a, g = c, v.push(`M${h},${g}`), _ = arcSegment(h, g, a, a, 90, -90), v.push(_.svg), h = _.endX, g = _.endY, _ = arcSegment(h, g, o, o, 0, -180), v.push(_.svg), v.push(`Z`), h = p, g = i, v.push(`M${h},${g}`), _ = arcSegment(h, g, a, a, 90, -270), v.push(_.svg), h = _.endX, g = _.endY, _ = arcSegment(h, g, o, o, 180, -180), v.push(_.svg), v.push(`Z`);
  let y: string[] = [];
  return h = 0, g = s, y.push(`M${h},${g}`), _ = arcSegment(h, g, a, a, 180, 90), y.push(_.svg), h = _.endX, g = _.endY, y.push(`L${f},${i}`), y.push(`L${f},${a}`), h = f, g = a, _ = arcSegment(h, g, a, a, 180, 180), y.push(_.svg), h = _.endX, g = _.endY, y.push(`L${e},${d}`), h = e, g = d, _ = arcSegment(h, g, a, a, 0, 90), y.push(_.svg), h = _.endX, g = _.endY, y.push(`L${i},${l}`), y.push(`L${i},${u}`), h = i, g = u, _ = arcSegment(h, g, a, a, 0, 180), y.push(_.svg), y.push(`Z`), y.push(`M${f},${i}`), y.push(`L${p},${i}`), h = p, g = i, _ = arcSegment(h, g, a, a, 90, -90), y.push(_.svg), y.push(`M${p},${i}`), y.push(`L${p},${a}`), h = p, g = a, _ = arcSegment(h, g, o, o, 0, 180), y.push(_.svg), y.push(`M${a},${c}`), y.push(`L${a},${s}`), h = a, g = s, _ = arcSegment(h, g, o, o, 180, 180), y.push(_.svg), h = _.endX, g = _.endY, _ = arcSegment(h, g, a, a, 0, 180), y.push(_.svg), y.push(`M${i},${s}`), y.push(`L${i},${l}`), [{
    d: m.join(` `),
    fill: `norm`,
    stroke: false
  }, {
    d: v.join(` `),
    fill: `darkenLess`,
    stroke: false
  }, {
    d: y.join(` `),
    fill: `none`,
    stroke: true
  }];
}), MULTI_REGION_SHAPES.set(`verticalscroll`, (e, t, n) => {
  let r = n?.get(`adj`) ?? 12500,
    i = Math.min(e, t) * Math.min(Math.max(r, 0), 25e3) / 1e5,
    a = i / 2,
    o = i / 4,
    s = i + a,
    c = i + i,
    l = e - i,
    u = e - a,
    d = t - i,
    f = t - a,
    p: string[] = [],
    m: number,
    h: number;
  m = a, h = t, p.push(`M${m},${h}`);
  let g = arcSegment(m, h, a, a, 90, -90);
  p.push(g.svg), m = g.endX, h = g.endY, p.push(`L${a},${f}`), m = a, h = f, g = arcSegment(m, h, o, o, 90, -180), p.push(g.svg), m = g.endX, h = g.endY, p.push(`L${i},${d}`), p.push(`L${i},${a}`), m = i, h = a, g = arcSegment(m, h, a, a, 180, 90), p.push(g.svg), m = g.endX, h = g.endY, p.push(`L${u},0`), m = u, h = 0, g = arcSegment(m, h, a, a, 270, 180), p.push(g.svg), m = g.endX, h = g.endY, p.push(`L${l},${i}`), p.push(`L${l},${f}`), m = l, h = f, g = arcSegment(m, h, a, a, 0, 90), p.push(g.svg), p.push(`Z`), m = c, h = a, p.push(`M${m},${h}`), g = arcSegment(m, h, a, a, 0, 90), p.push(g.svg), m = g.endX, h = g.endY, g = arcSegment(m, h, o, o, 90, 180), p.push(g.svg), p.push(`Z`);
  let _: string[] = [];
  m = c, h = a, _.push(`M${m},${h}`), g = arcSegment(m, h, a, a, 0, 90), _.push(g.svg), m = g.endX, h = g.endY, g = arcSegment(m, h, o, o, 90, 180), _.push(g.svg), _.push(`Z`), m = i, h = f, _.push(`M${m},${h}`), g = arcSegment(m, h, a, a, 0, 270), _.push(g.svg), m = g.endX, h = g.endY, g = arcSegment(m, h, o, o, 270, 180), _.push(g.svg), _.push(`Z`);
  let v: string[] = [];
  return m = i, h = d, v.push(`M${m},${h}`), v.push(`L${i},${a}`), m = i, h = a, g = arcSegment(m, h, a, a, 180, 90), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${u},0`), m = u, h = 0, g = arcSegment(m, h, a, a, 270, 180), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${l},${i}`), v.push(`L${l},${f}`), m = l, h = f, g = arcSegment(m, h, a, a, 0, 90), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${a},${t}`), m = a, h = t, g = arcSegment(m, h, a, a, 90, 180), v.push(g.svg), v.push(`Z`), v.push(`M${s},0`), m = s, h = 0, g = arcSegment(m, h, a, a, 270, 180), v.push(g.svg), m = g.endX, h = g.endY, g = arcSegment(m, h, o, o, 90, 180), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${c},${a}`), v.push(`M${l},${i}`), v.push(`L${s},${i}`), v.push(`M${a},${d}`), m = a, h = d, g = arcSegment(m, h, o, o, 270, 180), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${i},${f}`), v.push(`M${a},${t}`), m = a, h = t, g = arcSegment(m, h, a, a, 90, -90), v.push(g.svg), m = g.endX, h = g.endY, v.push(`L${i},${d}`), [{
    d: p.join(` `),
    fill: `norm`,
    stroke: false
  }, {
    d: _.join(` `),
    fill: `darkenLess`,
    stroke: false
  }, {
    d: v.join(` `),
    fill: `none`,
    stroke: true
  }];
});

/* ============================================================================
 * 多区域查询（原 Pi，jsx 10857-10861）：小写优先、原名回退
 * ==========================================================================*/

export function resolveMultiRegionPreset(e: string, t: number, n: number, r?: Map<string, number>): MultiRegionPath[] | null {
  let i = e.toLowerCase(),
    a = MULTI_REGION_SHAPES.get(i) ?? MULTI_REGION_SHAPES.get(e);
  return a ? a(t, n, r) : null;
}

/* ============================================================================
 * 符号总表（混淆名 → 语义名 → jsx 行号 → 把握度）
 * ----------------------------------------------------------------------------
 * | 混淆名 | 语义名                        | jsx 行    | 把握度 |
 * |--------|-------------------------------|-------------|--------|
 * | V×4    | curvedRightArrowBuilder        | 8035-8087   | 高（逐字） |
 * |        | curvedLeftArrowBuilder         | 8088        | 高（逐字） |
 * |        | curvedUpArrowBuilder           | 8151-8194   | 高（逐字） |
 * |        | curvedDownArrowBuilder         | 8195-8236   | 高（逐字） |
 * | Ti     | wrapSplitPresetRegions         | 8099-8125   | 高（逐字） |
 * | Ei     | wrapVerticalArrowRegions       | 8127-8150   | 高（逐字） |
 * | ki     | ACTION_BUTTON_GLYPH_PATHS      | 9373-9417   | 高（逐字） |
 * | Ai     | actionButtonGlyphPath          | 9419-9422   | 高（逐字） |
 * | Mi     | actionButtonMetrics            | 9610-9624   | 高（逐字） |
 * | Ni     | actionButtonOuterRect          | 9626        | 高（逐字） |
 * | ji×38  | MULTI_REGION_SHAPES.set ×38    | 9683-10856  | 高（逐字） |
 * | Pi     | resolveMultiRegionPreset       | 10857-10861 | 高（逐字） |
 * 依赖改指：wi→splitOuterPath、Si→mirrorPathHorizontally、Ci→mirrorPathVertically、
 * H/C/c/k→arcSegment、yi→adjRatio、V→PRESET_GEOMETRY_PATHS（均 pptxEngineGeometry.ts 导出）。
 * ==========================================================================*/
