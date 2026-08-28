/* ============================================================================
 * OfficeWiring.tsx — B5-12b · B 段：office 装配接线 + DEFERRED_PRESET_GEOMETRY 余量
 * ----------------------------------------------------------------------------
 * 来源（只读原件）：
 *   [P] desktop/src/out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js（55,446 行）
 *       孪生 desktop/src/src-reconstructed/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.jsx（44,678 行）
 *   [D] desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js（47,538 行）
 *
 * 本文件两部分：
 *   §W 装配接线拓扑登记（registerJszip / registerEchartsInit / initAndRegisterDocxWasm）
 *      —— 接线本体已在既有重建文件落定（见下注入点），此处只登记拓扑，不重复转录。
 *   §G DEFERRED_PRESET_GEOMETRY_ANCHORS 余量预设逐字重建（pptxEngineGeometry.ts
 *      1399–1413 登记的 39 锚点；borderCallout1 已在 pptxEngineGeometry.ts 671–676
 *      重建，跳过；实补 38 个 + Di 生成器）。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 混淆名 → 语义名 映射表
 * ─────────────────────────────────────────────────────────────────────────────
 *   V  → PRESET_GEOMETRY_PATHS      预设几何注册表（pptxEngineGeometry.ts:181）
 *                                    本文件顶部以 `const V = PRESET_GEOMETRY_PATHS`
 *                                    保留原名，使注册体与原件逐字一致。
 *   yi → adjRatio                   调整值归一（÷1e5，带回落）（pptxEngineGeometry.ts:30）
 *   bi → adjValue                   调整值原值读取（带回落）（pptxEngineGeometry.ts:37）
 *   Si → mirrorPathHorizontally     路径水平镜像（pptxEngineGeometry.ts:105）
 *   Ci → mirrorPathVertically       路径垂直镜像（仅 Ei 引用；多区域余量，未转录）
 *   wi → splitOuterPath             外环/余环拆分（pptxEngineGeometry.ts:163；仅 Ti 引用）
 *   Di → circularArrowPairBuilder   circularArrow/leftCircularArrow 共用生成器（本文件转录）
 *   Ti → （多区域包装：单预设 → 区域数组）   ┐ 属 DEFERRED_MULTI_REGION_ANCHORS
 *   Ei → （curvedUp/Down 多区域包装）        ┘ 余量（1508–1524），本批不转录，仅记录
 *   ki → actionButton 字形 Map（jsx 9374–9422）  同属多区域余量，不转录
 *   Ai → actionButton 字形查找（jsx 9419–9422）  同上
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * §W 装配接线拓扑（逐字重建已在下列注入点完成，本表为登记）
 * ─────────────────────────────────────────────────────────────────────────────
 *  W1 · JSZip（vendor：jszip 3.10.1，V1 段）
 *      vendor 体      [P] jsx 13–3262（js 13–5723）—— VENDOR-MANIFEST 口径：版本登记不转录
 *      绑定           [P] js 5724 / jsx 3263   `var s = n(o())`
 *      消费点         [P] js 5943 / jsx 3462   `let i = await s.loadAsync(e)`
 *      注入点（已重建）pptxRendererPreviewEngine.tsx:59–70 JsZipEntry/JsZipArchive 接口
 *                      :73 jszipRuntime 槽位 / :76 registerJszip / :80 requireJszip
 *                      :358 `requireJszip().loadAsync(data)`
 *  W2 · echarts（vendor：echarts 5.x + zrender，V2 段）
 *      vendor 体      [P] jsx 14650–41068 —— 版本登记不转录
 *      关键符号       [P] js 36739 / jsx 28524  Ej = echarts.init 包装
 *                      [P] jsx 21575            lx = LinearGradient（zrender 导出）
 *      消费点         [P] js 54974 / jsx 44254  `let r = Ej(e); r.setOption(t)`
 *                      [P] js 52001 / jsx 41172 `new lx(0.5 - 0.5 * Math.cos(a), ...)`
 *                      [P] js 53648 / jsx 42715 `new lx(0, 0, 0, 1, [...])`
 *      注入点（已重建）pptxRendererPreviewEngine.tsx:90 registerEchartsInit
 *                      :94 requireEchartsInit / :1704 renderChartNode 消费
 *  W3 · docx wasm 注册（first-party，已逐字重建）
 *      符号簇         [D] js 18073–18097：br(缓冲拷贝) / xr(源归一) / Sr(注册)
 *                      / Cr(= initAndRegister：d(e) + Sr(e)) / wr(就绪检查) / Tr(取值)
 *      模块级调用     [D] js 47425  `Cr(`` + new URL(`docx_wasm_bg-HWnIvdMf.wasm`, import.meta.url).href)`
 *      重建落点       previewPaneOfficeLegacyDocContent.tsx:235 initAndRegisterDocxWasm
 *                      :251 模块级调用
 *
 * 把握度分级：
 *   [A] 逐字对照原件（§G 全部预设与 Di；锚点见文件尾符号表）
 *   [B] 拓扑登记（§W 常量；行号经 grep 实测）
 * ==========================================================================*/

import {
  PRESET_GEOMETRY_PATHS,
  adjRatio as yi,
  adjValue as bi,
  mirrorPathHorizontally as Si,
} from "./pptxEngineGeometry";

/** 原符号 V 的本地别名：保持注册体与原件逐字一致（见头部映射表） */
const V = PRESET_GEOMETRY_PATHS;

/* ============================================================================
 * §W 装配接线拓扑登记 [B]
 * ==========================================================================*/

export const OFFICE_WIRING_TOPOLOGY = {
  jszip: {
    vendor: `jszip 3.10.1`,
    vendorSegmentJsx: `13–3262`,
    vendorSegmentJs: `13–5723`,
    binding: { symbol: `s`, js: 5724, jsx: 3263, form: `var s = n(o())` },
    consumption: { js: 5943, jsx: 3462, form: `await s.loadAsync(e)` },
    injection: {
      file: `pptxRendererPreviewEngine.tsx`,
      registerJszip: 76,
      requireJszip: 80,
      use: 358,
    },
  },
  echarts: {
    vendor: `echarts 5.x + zrender`,
    vendorSegmentJsx: `14650–41068`,
    keySymbols: {
      Ej: { js: 36739, jsx: 28524, role: `echarts.init 包装` },
      lx: { jsx: 21575, role: `zrender LinearGradient` },
    },
    consumption: [
      { js: 54974, jsx: 44254, form: `let r = Ej(e); r.setOption(t)` },
      { js: 52001, jsx: 41172, form: `new lx(0.5 - 0.5 * Math.cos(a), ...)` },
      { js: 53648, jsx: 42715, form: `new lx(0, 0, 0, 1, [...])` },
    ],
    injection: {
      file: `pptxRendererPreviewEngine.tsx`,
      registerEchartsInit: 90,
      requireEchartsInit: 94,
      use: 1704,
    },
  },
  docxWasm: {
    source: `previewPaneOfficeLegacyDocContent-HWD4EOEM.js`,
    clusterJs: `18073–18097`,
    clusterSymbols: { br: 18073, xr: 18078, Sr: 18085, Cr: 18088, wr: 18091, Tr: 18094 },
    moduleCallJs: 47425,
    reconstructed: {
      file: `previewPaneOfficeLegacyDocContent.tsx`,
      initAndRegisterDocxWasm: 235,
      moduleCall: 251,
    },
  },
} as const;

/* ============================================================================
 * §G DEFERRED_PRESET_GEOMETRY 余量预设 [A]
 * 逐字取自原件 js（babel 范围抽取，块内字节一致）；原注册序不变
 * （[P] js 10504–13047）。原件为逗号链（}), V.set(...)），本文件按既有重建
 * 约定拆为独立语句（仅块间标点变化）；回调参数注记（: number /
 * ?: Map<string, number> / !）与局部助手注记为机械添加，不改表达式。
 * ==========================================================================*/

V.set(`downArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj1`) ?? 25e3,
      i = n?.get(`adj2`) ?? 25e3,
      a = n?.get(`adj3`) ?? 25e3,
      o = n?.get(`adj4`) ?? 64977,
      s = Math.min(e, t),
      c = Math.max(0, Math.min(i, (5e4 * e) / Math.max(s, 1))),
      l = Math.max(0, Math.min(r, c * 2)),
      u = Math.max(0, Math.min(a, (1e5 * t) / Math.max(s, 1))),
      d = (u * s) / Math.max(t, 1),
      f = Math.max(0, Math.min(o, 1e5 - d)),
      p = e / 2,
      m = (s * c) / 1e5,
      h = (s * l) / 2e5,
      g = p - m,
      _ = p - h,
      v = p + h,
      y = p + m,
      b = t - (s * u) / 1e5,
      x = (t * f) / 1e5;
    return [
      `M0,0`,
      `L${e},0`,
      `L${e},${x}`,
      `L${v},${x}`,
      `L${v},${b}`,
      `L${y},${b}`,
      `L${p},${t}`,
      `L${g},${b}`,
      `L${_},${b}`,
      `L${_},${x}`,
      `L0,${x}`,
      `Z`,
    ].join(` `);
  });

V.set(`rightArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = (5e4 * t) / Math.max(r, 1),
      a = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, i)),
      o = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, a * 2)),
      s = (1e5 * e) / Math.max(r, 1),
      c = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, s)),
      l = (c * r) / Math.max(e, 1),
      u = Math.max(0, Math.min(n?.get(`adj4`) ?? 64977, 1e5 - l)),
      d = t / 2,
      f = (r * a) / 1e5,
      p = (r * o) / 2e5,
      m = d - f,
      h = d - p,
      g = d + p,
      _ = d + f,
      v = e - (r * c) / 1e5,
      y = (e * u) / 1e5;
    return [
      `M0,0`,
      `L${y},0`,
      `L${y},${h}`,
      `L${v},${h}`,
      `L${v},${m}`,
      `L${e},${d}`,
      `L${v},${_}`,
      `L${v},${g}`,
      `L${y},${g}`,
      `L${y},${t}`,
      `L0,${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`leftArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = (5e4 * t) / Math.max(r, 1),
      a = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, i)),
      o = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, a * 2)),
      s = (1e5 * e) / Math.max(r, 1),
      c = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, s)),
      l = (c * r) / Math.max(e, 1),
      u = Math.max(0, Math.min(n?.get(`adj4`) ?? 64977, 1e5 - l)),
      d = t / 2,
      f = (r * a) / 1e5,
      p = (r * o) / 2e5,
      m = d - f,
      h = d - p,
      g = d + p,
      _ = d + f,
      v = (r * c) / 1e5,
      y = e - (e * u) / 1e5;
    return [
      `M0,${d}`,
      `L${v},${m}`,
      `L${v},${h}`,
      `L${y},${h}`,
      `L${y},0`,
      `L${e},0`,
      `L${e},${t}`,
      `L${y},${t}`,
      `L${y},${g}`,
      `L${v},${g}`,
      `L${v},${_}`,
      `Z`,
    ].join(` `);
  });

V.set(`upArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = (5e4 * e) / Math.max(r, 1),
      a = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, i)),
      o = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, a * 2)),
      s = (1e5 * t) / Math.max(r, 1),
      c = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, s)),
      l = (c * r) / Math.max(t, 1),
      u = Math.max(0, Math.min(n?.get(`adj4`) ?? 64977, 1e5 - l)),
      d = e / 2,
      f = (r * a) / 1e5,
      p = (r * o) / 2e5,
      m = d - f,
      h = d - p,
      g = d + p,
      _ = d + f,
      v = (r * c) / 1e5,
      y = t - (t * u) / 1e5;
    return [
      `M0,${y}`,
      `L${h},${y}`,
      `L${h},${v}`,
      `L${m},${v}`,
      `L${d},0`,
      `L${_},${v}`,
      `L${g},${v}`,
      `L${g},${y}`,
      `L${e},${y}`,
      `L${e},${t}`,
      `L0,${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`upDownArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj1`) ?? 25e3,
      i = n?.get(`adj2`) ?? 25e3,
      a = n?.get(`adj3`) ?? 25e3,
      o = n?.get(`adj4`) ?? 48123,
      s = Math.min(e, t),
      c = Math.max(0, Math.min(i, (5e4 * e) / Math.max(s, 1))),
      l = Math.max(0, Math.min(r, c * 2)),
      u = Math.max(0, Math.min(a, (5e4 * t) / Math.max(s, 1))),
      d = (u * s) / Math.max(t, 1),
      f = Math.max(0, Math.min(o, 1e5 - d - d)),
      p = (s * c) / 1e5,
      m = (s * l) / 2e5,
      h = e / 2,
      g = h - p,
      _ = h - m,
      v = h + m,
      y = h + p,
      b = (s * u) / 1e5,
      x = (t * f) / 2e5,
      S = t / 2 - x,
      C = t / 2 + x,
      w = t - b;
    return [
      `M${h},0`,
      `L${y},${b}`,
      `L${v},${b}`,
      `L${v},${S}`,
      `L${e},${S}`,
      `L${e},${C}`,
      `L${v},${C}`,
      `L${v},${w}`,
      `L${y},${w}`,
      `L${h},${t}`,
      `L${g},${w}`,
      `L${_},${w}`,
      `L${_},${C}`,
      `L0,${C}`,
      `L0,${S}`,
      `L${_},${S}`,
      `L${_},${b}`,
      `L${g},${b}`,
      `Z`,
    ].join(` `);
  });

V.set(`leftRightArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj1`) ?? 25e3,
      i = n?.get(`adj2`) ?? 25e3,
      a = n?.get(`adj3`) ?? 25e3,
      o = n?.get(`adj4`) ?? 48123,
      s = Math.min(e, t),
      c = Math.max(0, Math.min(i, (5e4 * t) / Math.max(s, 1))),
      l = Math.max(0, Math.min(r, c * 2)),
      u = Math.max(0, Math.min(a, (5e4 * e) / Math.max(s, 1))),
      d = (u * s) / Math.max(e, 1),
      f = Math.max(0, Math.min(o, 1e5 - d - d)),
      p = (s * c) / 1e5,
      m = (s * l) / 2e5,
      h = t / 2,
      g = h - p,
      _ = h - m,
      v = h + m,
      y = h + p,
      b = (s * u) / 1e5,
      x = (e * f) / 2e5,
      S = e / 2 - x,
      C = e / 2 + x,
      w = e - b;
    return [
      `M0,${h}`,
      `L${b},${g}`,
      `L${b},${_}`,
      `L${S},${_}`,
      `L${S},0`,
      `L${C},0`,
      `L${C},${_}`,
      `L${w},${_}`,
      `L${w},${g}`,
      `L${e},${h}`,
      `L${w},${y}`,
      `L${w},${v}`,
      `L${C},${v}`,
      `L${C},${t}`,
      `L${S},${t}`,
      `L${S},${v}`,
      `L${b},${v}`,
      `L${b},${y}`,
      `Z`,
    ].join(` `);
  });

V.set(`uturnArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj1`) ?? 25e3,
      i = n?.get(`adj2`) ?? 25e3,
      a = n?.get(`adj3`) ?? 25e3,
      o = n?.get(`adj4`) ?? 43750,
      s = n?.get(`adj5`) ?? 75e3,
      c = Math.min(e, t),
      l = Math.max(0, Math.min(i, 25e3)),
      u = Math.max(0, Math.min(r, l * 2)),
      d = 1e5 - (u * c) / Math.max(t, 1),
      f = Math.max(0, Math.min(a, (d * t) / Math.max(c, 1))),
      p = ((f + u) * c) / Math.max(t, 1),
      m = Math.max(p, Math.min(s, 1e5)),
      h = (c * u) / 1e5,
      g = (c * l) / 1e5,
      _ = g - h / 2,
      v = (t * m) / 1e5,
      y = v - (c * f) / 1e5,
      b = e - _,
      x = Math.min(b / 2, y),
      S = (c * Math.max(0, Math.min(o, (1e5 * x) / Math.max(c, 1)))) / 1e5,
      C = Math.max(S - h, 0),
      w = h + C,
      T = e - g,
      E = T - g,
      D = E + _,
      O = b - S,
      k = D - C;
    return [
      `M0,${t}`,
      `L0,${S}`,
      S > 0.1 ? `A${S},${S} 0 0,1 ${S},0` : `L0,0`,
      `L${O},0`,
      S > 0.1 ? `A${S},${S} 0 0,1 ${b},${S}` : `L${b},0`,
      `L${b},${y}`,
      `L${e},${y}`,
      `L${T},${v}`,
      `L${E},${y}`,
      `L${D},${y}`,
      `L${D},${w}`,
      C > 0.1 ? `A${C},${C} 0 0,0 ${k},${h}` : `L${k},${h}`,
      `L${w},${h}`,
      C > 0.1 ? `A${C},${C} 0 0,0 ${h},${w}` : `L${h},${w}`,
      `L${h},${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`leftUpArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, 5e4)),
      i = r * 2,
      a = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, i)),
      o = 1e5 - i,
      s = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, o)),
      c = Math.min(e, t),
      l = (c * s) / 1e5,
      u = (c * r) / 5e4,
      d = e - u,
      f = t - u,
      p = (c * r) / 1e5,
      m = e - p,
      h = t - p,
      g = (c * a) / 2e5,
      _ = m - g,
      v = m + g,
      y = h - g,
      b = h + g;
    return [
      `M0,${h}`,
      `L${l},${f}`,
      `L${l},${y}`,
      `L${_},${y}`,
      `L${_},${l}`,
      `L${d},${l}`,
      `L${m},0`,
      `L${e},${l}`,
      `L${v},${l}`,
      `L${v},${b}`,
      `L${l},${b}`,
      `L${l},${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`bentArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, 5e4)),
      a = i * 2,
      o = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, a)),
      s = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, 5e4)),
      c = (r * o) / 1e5,
      l = (r * i) / 1e5,
      u = l - c / 2,
      d = (r * s) / 1e5,
      f = e - d,
      p = t - u,
      m = Math.min(f, p),
      h = m > 0 ? (1e5 * m) / r : 0,
      g = (r * Math.max(0, Math.min(n?.get(`adj4`) ?? 43750, h))) / 1e5,
      _ = Math.max(g - c, 0),
      v = c + _,
      y = e - d,
      b = u + c,
      x = b + u,
      S = u + g,
      C = b + _,
      w = [`M0,${t}`, `L0,${S}`];
    return (
      g > 0.1 ? w.push(`A${g},${g} 0 0,1 ${g},${u}`) : w.push(`L0,${u}`),
      w.push(`L${y},${u}`, `L${y},0`, `L${e},${l}`, `L${y},${x}`, `L${y},${b}`, `L${v},${b}`),
      _ > 0.1 ? w.push(`A${_},${_} 0 0,0 ${c},${C}`) : w.push(`L${c},${b}`),
      w.push(`L${c},${t}`, `Z`),
      w.join(` `)
    );
  });

V.set(`bentUpArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, 5e4)),
      i = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, 5e4)),
      a = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, 5e4)),
      o = Math.min(e, t),
      s = (o * a) / 1e5,
      c = e - (o * i) / 5e4,
      l = e - (o * i) / 1e5,
      u = (o * r) / 2e5,
      d = l - u,
      f = l + u,
      p = t - (o * r) / 1e5;
    return [
      `M0,${p}`,
      `L${d},${p}`,
      `L${d},${s}`,
      `L${c},${s}`,
      `L${l},0`,
      `L${e},${s}`,
      `L${f},${s}`,
      `L${f},${t}`,
      `L0,${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`curvedRightArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj1`) ?? 25e3,
      i = n?.get(`adj2`) ?? 5e4,
      a = n?.get(`adj3`) ?? 25e3,
      o = 1e5,
      s = t / 2,
      c = e,
      l = t,
      u = Math.max(Math.min(e, t), 1),
      d = (5e4 * t) / u,
      f = Math.max(0, Math.min(i, d)),
      p = (u * Math.max(0, Math.min(r, f))) / o,
      m = (u * f) / o,
      h = s - (p + m) / 4,
      g = h * 2,
      _ = g * g,
      v = p * p,
      y = Math.max(_ - v, 0),
      b = (Math.sqrt(y) * e) / Math.max(g, 1e-6),
      x = (o * b) / u,
      S = (u * Math.max(0, Math.min(a, x))) / o,
      C = h + p,
      w = e * e,
      T = S * S,
      E = Math.max(w - T, 0),
      D = (Math.sqrt(E) * h) / Math.max(e, 1e-6),
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
      B = (I * 180) / Math.PI,
      ee = (L * 180) / Math.PI,
      te = (F * 180) / Math.PI,
      ne = (z * 180) / Math.PI,
      re = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (i * Math.PI) / 180,
          s = (a * Math.PI) / 180,
          c = e + n * Math.cos(o),
          l = t + r * Math.sin(o),
          u = e + n * Math.cos(s),
          d = t + r * Math.sin(s),
          f = a - i;
        return `M${c},${l} A${n},${r} 0 ${+(Math.abs(f) > 180)},${+(f >= 0)} ${u},${d}`;
      };
    return [
      `M0,${h}`,
      re(e, h, e, h, 180, 180 + ee).replace(`M`, `L`),
      `L${P},${O}`,
      `L${P},${j}`,
      `L${c},${N}`,
      `L${P},${M}`,
      `L${P},${k}`,
      re(e, C, e, h, B, B + te).replace(`M`, `L`),
      `Z`,
      re(e, h, e, h, 180, 270),
      `L${c},${p}`,
      re(e, C, e, h, 270, 270 + ne).replace(`M`, `L`),
      `Z`,
    ].join(` `);
  });

V.set(`curvedLeftArrow`, (e: number, t: number, n?: Map<string, number>) => Si(V.get(`curvedRightArrow`)!(e, t, n), e));

V.set(`curvedUpArrow`, (e: number, t: number, n?: Map<string, number>) => {
  let r = (e: any, t: any, n: any, r: any, i: any, a: any) => {
      let o = (i * Math.PI) / 180,
        s = (a * Math.PI) / 180,
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
    l = (5e4 * e) / Math.max(i, 1),
    u = Math.max(0, Math.min(s, l)),
    d = (i * Math.max(0, Math.min(o, 1e5))) / 1e5,
    f = (i * u) / 1e5,
    p = a - (d + f) / 4,
    m = p * 2,
    h = (Math.sqrt(Math.max(m * m - d * d, 0)) * t) / Math.max(m, 1),
    g = (1e5 * h) / Math.max(i, 1),
    _ = (i * Math.max(0, Math.min(c, g))) / 1e5,
    v = p + d,
    y = (Math.sqrt(Math.max(t * t - _ * _, 0)) * p) / Math.max(t, 1),
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
    M = (k * 180) / Math.PI,
    N = (A * 180) / Math.PI,
    P = (j * 180) / Math.PI,
    F = (D * 180) / Math.PI;
  return [
    r(p, 0, p, t, M, M + N),
    `L${b},${E}`,
    `L${C},${E}`,
    `L${T},0`,
    `L${w},${E}`,
    `L${x},${E}`,
    r(v, 0, p, t, P, P + F).replace(`M`, `L`),
    `L${p},${t}`,
    r(p, 0, p, t, 90, 180).replace(`M`, `L`),
    `L${d},0`,
    r(v, 0, p, t, 180, 90).replace(`M`, `L`),
    `Z`,
  ].join(` `);
});

V.set(`curvedDownArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (i * Math.PI) / 180,
          s = (a * Math.PI) / 180,
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
      l = (5e4 * e) / Math.max(i, 1),
      u = Math.max(0, Math.min(s, l)),
      d = (i * Math.max(0, Math.min(o, 1e5))) / 1e5,
      f = (i * u) / 1e5,
      p = a - (d + f) / 4,
      m = p * 2,
      h = (Math.sqrt(Math.max(m * m - d * d, 0)) * t) / Math.max(m, 1),
      g = (1e5 * h) / Math.max(i, 1),
      _ = (i * Math.max(0, Math.min(c, g))) / 1e5,
      v = p + d,
      y = (Math.sqrt(Math.max(t * t - _ * _, 0)) * p) / Math.max(t, 1),
      b = p + y,
      x = v + y,
      S = (f - d) / 2,
      C = b - S,
      w = x + S,
      T = e - f / 2,
      E = t - _,
      D = (Math.atan2(y, _) * 180) / Math.PI,
      O = (Math.atan2(d / 2, h) * 180) / Math.PI,
      k = 270 + D,
      A = 270 - O,
      j = O - 90,
      M = 90 + O;
    return [
      `M${T},${t}`,
      `L${C},${E}`,
      `L${b},${E}`,
      r(p, t, p, t, k, k - D).replace(`M`, `L`),
      `L${v},0`,
      r(v, t, p, t, 270, 270 + D).replace(`M`, `L`),
      `L${b + d},${E}`,
      `L${w},${E}`,
      `Z`,
      `M${v},0`,
      r(v, t, p, t, A, A + j).replace(`M`, `L`),
      r(p, t, p, t, 180, 180 + M).replace(`M`, `L`),
      `Z`,
    ].join(` `);
  });

function Di(e: number, t: number, n: Map<string, number> | undefined, r: boolean = !1, i: string = `circularArrow`) {
  let a = e / 2,
    o = t / 2,
    s = e / 2,
    c = t / 2,
    l = Math.min(e, t),
    u = (e: any) => ((e / 6e4) * Math.PI) / 180,
    d = (e: any, t: any) => e * Math.sin(u(t)),
    f = (e: any, t: any) => e * Math.cos(u(t)),
    p = (e: any, t: any, n: any) => e * Math.cos(Math.atan2(n, t)),
    m = (e: any, t: any, n: any) => e * Math.sin(Math.atan2(n, t)),
    h = (e: any, t: any) => ((Math.atan2(t, e) * 180) / Math.PI) * 6e4,
    g = (e: any, t: any, n: any) => Math.sqrt(e * e + t * t + n * n),
    _ = i === `leftCircularArrow`,
    v = n?.get(`adj1`) ?? 12500,
    y = n?.get(`adj2`) ?? (_ ? -1142319 : 1142319),
    b = n?.get(`adj3`) ?? (_ ? 1142319 : 20457681),
    x = n?.get(`adj4`) ?? 108e5,
    S = n?.get(`adj5`) ?? 12500,
    C = Math.max(0, Math.min(S, 25e3)),
    w = C * 2,
    T = Math.max(0, Math.min(v, w)),
    E = Math.max(1, Math.min(b, 21599999)),
    D = Math.max(0, Math.min(x, 21599999)),
    O = (l * T) / 1e5,
    k = (l * C) / 1e5,
    A = O / 2,
    j = s + A - k,
    M = c + A - k,
    N = j - O,
    P = M - O,
    F = N + A,
    I = P + A,
    L = d(F, E),
    R = f(I, E),
    z = p(F, R, L),
    B = m(I, R, L),
    ee = a + z,
    te = o + B,
    ne = Math.min(N, P),
    re = z * z,
    ie = B * B,
    ae = ne * ne,
    oe = re - ae,
    se = ie - ae,
    ce = ie === 0 ? 0 : (oe * se) / re,
    le = 1 - (ie === 0 ? 0 : ce / ie),
    ue = Math.sqrt(Math.max(0, le)),
    de = z === 0 ? 0 : oe / z,
    fe = B === 0 ? 0 : de / B,
    pe = h(1, fe === 0 ? 0 : (1 + ue) / fe),
    me = pe + 216e5,
    he = (pe >= 0 ? pe : me) - E,
    ge = he + 216e5,
    _e = he >= 0 ? he : ge,
    ve = _e - 108e5,
    ye = _e - 216e5,
    be = Math.abs(ve >= 0 ? ye : _e),
    xe;
  if (_) {
    let e = -be,
      t = -Math.abs(y);
    xe = Math.max(e, Math.min(t, 0));
  } else xe = Math.max(0, Math.min(y, be));
  let Se = E + xe,
    Ce = d(F, Se),
    we = f(I, Se),
    Te = p(F, we, Ce),
    Ee = m(I, we, Ce),
    De = a + Te,
    Oe = o + Ee,
    ke = d(j, D),
    Ae = f(M, D),
    je = p(j, Ae, ke),
    Me = m(M, Ae, ke),
    Ne = a + je,
    Pe = o + Me,
    Fe = f(k, Se),
    Ie = d(k, Se),
    Le = ee + Fe,
    Re = te + Ie,
    ze = ee - Fe,
    Be = te - Ie,
    Ve = ze - a,
    He = Be - o,
    Ue = Le - a,
    We = Re - o,
    Ge = Math.min(j, M),
    Ke = j === 0 ? 0 : (Ve * Ge) / j,
    qe = M === 0 ? 0 : (He * Ge) / M,
    Je = j === 0 ? 0 : (Ue * Ge) / j,
    Ye = M === 0 ? 0 : (We * Ge) / M,
    Xe = Je - Ke,
    Ze = Ye - qe,
    Qe = g(Xe, Ze, 0),
    $e = Ke * Ye - Je * qe,
    et = Ge * Ge,
    tt = Qe * Qe,
    nt = et * tt - $e * $e,
    rt = Math.sqrt(Math.max(nt, 0)),
    it = Ze * -1 >= 0 ? -1 : 1,
    at = it * Xe * rt,
    ot = $e * Ze,
    st = tt === 0 ? 0 : (ot + at) / tt,
    ct = ot - at,
    lt = tt === 0 ? 0 : ct / tt,
    ut = Math.abs(Ze) * rt,
    dt = $e * Xe * -1,
    ft = tt === 0 ? 0 : (dt + ut) / tt,
    pt = dt - ut,
    mt = tt === 0 ? 0 : pt / tt,
    ht = Je - st,
    gt = Je - lt,
    _t = Ye - ft,
    vt = Ye - mt,
    yt = g(ht, _t, 0),
    bt = g(gt, vt, 0) - yt,
    xt = bt >= 0 ? st : lt,
    St = bt >= 0 ? ft : mt,
    Ct = Ge === 0 ? 0 : (xt * j) / Ge,
    wt = Ge === 0 ? 0 : (St * M) / Ge,
    Tt = a + Ct,
    Et = o + wt,
    Dt = N === 0 ? 0 : (Ve * ne) / N,
    Ot = P === 0 ? 0 : (He * ne) / P,
    kt = N === 0 ? 0 : (Ue * ne) / N,
    At = P === 0 ? 0 : (We * ne) / P,
    jt = kt - Dt,
    Mt = At - Ot,
    Nt = g(jt, Mt, 0),
    Pt = Dt * At - kt * Ot,
    Ft = ne * ne,
    It = Nt * Nt,
    Lt = Ft * It - Pt * Pt,
    Rt = Math.sqrt(Math.max(Lt, 0)),
    zt = it * jt * Rt,
    Bt = Pt * Mt,
    Vt = It === 0 ? 0 : (Bt + zt) / It,
    Ht = Bt - zt,
    Ut = It === 0 ? 0 : Ht / It,
    Wt = Math.abs(Mt) * Rt,
    Gt = Pt * jt * -1,
    Kt = It === 0 ? 0 : (Gt + Wt) / It,
    qt = Gt - Wt,
    Jt = It === 0 ? 0 : qt / It,
    Yt = Dt - Vt,
    Xt = Dt - Ut,
    Zt = Ot - Kt,
    Qt = Ot - Jt,
    $t = g(Yt, Zt, 0),
    en = g(Xt, Qt, 0) - $t,
    tn = en >= 0 ? Vt : Ut,
    nn = en >= 0 ? Kt : Jt,
    rn = ne === 0 ? 0 : (tn * N) / ne,
    an = ne === 0 ? 0 : (nn * P) / ne,
    on = a + rn,
    sn = o + an,
    cn = h(rn, an),
    ln = cn + 216e5,
    un = cn >= 0 ? cn : ln,
    dn = D - un,
    fn,
    pn;
  if (_) {
    let e = dn >= 0 ? dn : dn + 216e5;
    ((fn = un + e), (pn = -e));
  } else ((fn = un), (pn = dn >= 0 ? dn - 216e5 : dn));
  let mn = g(Tt - on, Et - sn, 0) / 2 - k,
    hn = mn >= 0 ? Tt : Le,
    gn = mn >= 0 ? Et : Re,
    _n = mn >= 0 ? on : ze,
    vn = mn >= 0 ? sn : Be,
    yn = h(Ct, wt),
    bn = yn + 216e5,
    xn = (yn >= 0 ? yn : bn) - D,
    Sn,
    Cn;
  if (_) {
    let e = xn >= 0 ? xn - 216e5 : xn;
    ((Sn = D + e), (Cn = -e));
  } else {
    let e = xn >= 0 ? xn : xn + 216e5;
    ((Sn = D), (Cn = e));
  }
  let wn = Sn + Cn,
    Tn = d(j, wn),
    En = f(M, wn),
    Dn = a + p(j, En, Tn),
    On = o + m(M, En, Tn),
    kn = fn + pn,
    An = d(N, kn),
    jn = f(P, kn),
    Mn = a + p(N, jn, An),
    Nn = o + m(P, jn, An),
    Pn = +(Math.abs(Cn / 6e4) > 180),
    Fn = +(Cn > 0),
    In = +(Math.abs(pn / 6e4) > 180),
    Ln = +(pn > 0);
  if (_) {
    let e = d(N, D),
      t = f(P, D),
      n = a + p(N, t, e),
      r = o + m(P, t, e);
    return [
      `M${Ne},${Pe}`,
      `L${n},${r}`,
      `A${N},${P} 0 ${In},${Ln} ${Mn},${Nn}`,
      `L${_n},${vn}`,
      `L${De},${Oe}`,
      `L${hn},${gn}`,
      `L${Tt},${Et}`,
      `A${j},${M} 0 ${Pn},${Fn} ${Dn},${On}`,
      `Z`,
    ].join(` `);
  }
  return [
    `M${Ne},${Pe}`,
    `A${j},${M} 0 ${Pn},${Fn} ${Dn},${On}`,
    `L${hn},${gn}`,
    `L${De},${Oe}`,
    `L${_n},${vn}`,
    `L${on},${sn}`,
    `A${N},${P} 0 ${In},${Ln} ${Mn},${Nn}`,
    `Z`,
  ].join(` `);
}

V.set(`circularArrow`, (e: number, t: number, n?: Map<string, number>) => Di(e, t, n, !1, `circularArrow`));

V.set(`leftCircularArrow`, (e: number, t: number, n?: Map<string, number>) => Di(e, t, n, !1, `leftCircularArrow`));

V.set(`leftRightCircularArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = e / 400,
      i = t / 280,
      a = (e: any, t: any) => ({ x: e * r, y: t * i }),
      o = a(35, 140),
      s = a(19.9536, 89.9471),
      c = a(33.4296, 89.9471),
      l = a(74.6127, 28.1974),
      u = a(182.5744, 0.5489),
      d = a(274.5688, 28.1924),
      f = a(315.4978, 40.4912),
      p = a(348.2481, 62.4743),
      m = a(366.5707, 89.9471),
      h = a(380.0463, 89.9471),
      g = a(365, 140),
      _ = a(310.0463, 89.9471),
      v = a(320.9838, 89.9471),
      y = a(274.3848, 50.3095),
      b = a(182.4425, 40.5864),
      x = a(115.6249, 68.2298),
      S = a(101.3589, 74.1319),
      C = a(88.9651, 81.4842),
      w = a(79.0159, 89.947),
      T = a(89.9536, 89.9471);
    return [
      `M${o.x},${o.y}`,
      `L${s.x},${s.y}`,
      `L${c.x},${c.y}`,
      `C${l.x},${l.y} ${u.x},${u.y} ${d.x},${d.y}`,
      `C${f.x},${f.y} ${p.x},${p.y} ${m.x},${m.y}`,
      `L${h.x},${h.y}`,
      `L${g.x},${g.y}`,
      `L${_.x},${_.y}`,
      `L${v.x},${v.y}`,
      `C${y.x},${y.y} ${b.x},${b.y} ${x.x},${x.y}`,
      `C${S.x},${S.y} ${C.x},${C.y} ${w.x},${w.y}`,
      `L${T.x},${T.y}`,
      `Z`,
    ].join(` `);
  });

V.set(`quadArrowCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = e / 2,
      a = t / 2,
      o = Math.max(0, Math.min(n?.get(`adj2`) ?? 18515, 5e4)),
      s = Math.max(0, Math.min(n?.get(`adj1`) ?? 18515, o * 2)),
      c = 5e4 - o,
      l = Math.max(0, Math.min(n?.get(`adj3`) ?? 18515, c)),
      u = l * 2,
      d = Math.max(s, Math.min(n?.get(`adj4`) ?? 48123, 1e5 - u)),
      f = (r * o) / 1e5,
      p = (r * s) / 2e5,
      m = (r * l) / 1e5,
      h = (e * d) / 2e5,
      g = (t * d) / 2e5,
      _ = e - m,
      v = i - h,
      y = i + h,
      b = i - f,
      x = i + f,
      S = i - p,
      C = i + p,
      w = t - m,
      T = a - g,
      E = a + g,
      D = a - f,
      O = a + f,
      k = a - p,
      A = a + p;
    return [
      `M0,${a}`,
      `L${m},${D}`,
      `L${m},${k}`,
      `L${v},${k}`,
      `L${v},${T}`,
      `L${S},${T}`,
      `L${S},${m}`,
      `L${b},${m}`,
      `L${i},0`,
      `L${x},${m}`,
      `L${C},${m}`,
      `L${C},${T}`,
      `L${y},${T}`,
      `L${y},${k}`,
      `L${_},${k}`,
      `L${_},${D}`,
      `L${e},${a}`,
      `L${_},${O}`,
      `L${_},${A}`,
      `L${y},${A}`,
      `L${y},${E}`,
      `L${C},${E}`,
      `L${C},${w}`,
      `L${x},${w}`,
      `L${i},${t}`,
      `L${b},${w}`,
      `L${S},${w}`,
      `L${S},${E}`,
      `L${v},${E}`,
      `L${v},${A}`,
      `L${m},${A}`,
      `L${m},${O}`,
      `Z`,
    ].join(` `);
  });

V.set(`leftRightUpArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.max(0, Math.min(n?.get(`adj2`) ?? 25e3, 5e4)),
      i = r * 2,
      a = Math.max(0, Math.min(n?.get(`adj1`) ?? 25e3, i)),
      o = (1e5 - i) / 2,
      s = Math.max(0, Math.min(n?.get(`adj3`) ?? 25e3, o)),
      c = Math.min(e, t),
      l = e / 2,
      u = (c * s) / 1e5,
      d = (c * r) / 1e5,
      f = l - d,
      p = l + d,
      m = (c * a) / 2e5,
      h = l - m,
      g = l + m,
      _ = e - u,
      v = t - (c * r) / 5e4,
      y = t - d,
      b = y - m,
      x = y + m;
    return [
      `M0,${y}`,
      `L${u},${v}`,
      `L${u},${b}`,
      `L${h},${b}`,
      `L${h},${u}`,
      `L${f},${u}`,
      `L${l},0`,
      `L${p},${u}`,
      `L${g},${u}`,
      `L${g},${b}`,
      `L${_},${b}`,
      `L${_},${v}`,
      `L${e},${y}`,
      `L${_},${t}`,
      `L${_},${x}`,
      `L${u},${x}`,
      `L${u},${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`swooshArrow`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = n?.get(`adj1`) ?? 25e3,
      a = n?.get(`adj2`) ?? 16667,
      o = Math.max(1, Math.min(i, 75e3)),
      s = (7e4 * e) / r,
      c = Math.max(0, Math.min(a, s)),
      l = (t * o) / 1e5,
      u = (r * c) / 1e5,
      d = r / 8,
      f = t / 6,
      p = Math.PI / 2 / 14,
      m = Math.tan(p),
      h = e - u,
      g = d,
      _ = d * m,
      v = h - _,
      y = l * m,
      b = g + l,
      x = h + y,
      S = x + _,
      C = b + d,
      w = C / 2 + t / 20,
      T = e / 6,
      E = f + f,
      D = b + f / 2,
      O = e / 4;
    return [
      `M0,${t}`,
      `Q${T},${E} ${h},${g}`,
      `L${v},0`,
      `L${e},${w}`,
      `L${S},${C}`,
      `L${x},${b}`,
      `Q${O},${D} 0,${t}`,
      `Z`,
    ].join(` `);
  });

V.set(`flowChartPunchedTape`, (e: number, t: number) => {
    let n = e / 20,
      r = t / 20,
      i = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = i / 6e4,
          s = a / 6e4,
          c = (o * Math.PI) / 180,
          l = ((o + s) * Math.PI) / 180,
          u = e - n * Math.cos(c),
          d = t - r * Math.sin(c),
          f = u + n * Math.cos(l),
          p = d + r * Math.sin(l);
        return {
          endX: f,
          endY: p,
          svg: `A${n},${r} 0 ${+(Math.abs(s) > 180)},${+(s > 0)} ${f},${p}`,
        };
      },
      a = 5 * n,
      o = 2 * r,
      s = 0,
      c = 2 * r,
      l = [`M${s},${c}`],
      u = i(s, c, a, o, 108e5, -108e5);
    (l.push(u.svg),
      (s = u.endX),
      (c = u.endY),
      (u = i(s, c, a, o, 108e5, 108e5)),
      l.push(u.svg),
      (s = u.endX),
      (c = u.endY));
    let d = 20 * n,
      f = 18 * r;
    return (
      l.push(`L${d},${f}`),
      (s = d),
      (c = f),
      (u = i(s, c, a, o, 0, -108e5)),
      l.push(u.svg),
      (s = u.endX),
      (c = u.endY),
      (u = i(s, c, a, o, 0, 108e5)),
      l.push(u.svg),
      l.push(`Z`),
      l.join(` `)
    );
  });

V.set(`flowChartMagneticTape`, (e: number, t: number) => {
    let n = e / 2,
      r = t / 2,
      i = n,
      a = r,
      o = Math.atan2(t, e),
      s = a + r * Math.sin(Math.PI / 4),
      c = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (i * Math.PI) / 180,
          s = ((i + a) * Math.PI) / 180,
          c = e - n * Math.cos(o),
          l = t - r * Math.sin(o),
          u = c + n * Math.cos(s),
          d = l + r * Math.sin(s);
        return {
          endX: u,
          endY: d,
          svg: `A${n},${r} 0 ${+(Math.abs(a) > 180)},${+(a > 0)} ${u},${d}`,
        };
      },
      l = i,
      u = t,
      d = c(l, u, n, r, 90, 90);
    ((l = d.endX), (u = d.endY));
    let f = c(l, u, n, r, 180, 90);
    ((l = f.endX), (u = f.endY));
    let p = c(l, u, n, r, 270, 90);
    ((l = p.endX), (u = p.endY));
    let m = (o * 180) / Math.PI,
      h = c(l, u, n, r, 0, m);
    return [`M${i},${t}`, d.svg, f.svg, p.svg, h.svg, `L${e},${s}`, `L${e},${t}`, `Z`].join(` `);
  });

V.set(`flowChartMultidocument`, (e: number, t: number) => {
    let n = (t: any) => (e * t) / 21600,
      r = (e: any) => (t * e) / 21600;
    return [
      `M0,${r(20782)}`,
      `C${n(9298)},${r(23542)} ${n(9298)},${r(18022)} ${n(18595)},${r(18022)}`,
      `L${n(18595)},${r(3675)} L0,${r(3675)} Z`,
      `M${n(1532)},${r(3675)} L${n(1532)},${r(1815)} L${n(2e4)},${r(1815)}`,
      `L${n(2e4)},${r(16252)}`,
      `C${n(19298)},${r(16252)} ${n(18595)},${r(16352)} ${n(18595)},${r(16352)}`,
      `L${n(18595)},${r(3675)} Z`,
      `M${n(2972)},${r(1815)} L${n(2972)},0 L${e},0`,
      `L${e},${r(14392)}`,
      `C${n(20800)},${r(14392)} ${n(2e4)},${r(14467)} ${n(2e4)},${r(14467)}`,
      `L${n(2e4)},${r(1815)} Z`,
    ].join(` `);
  });

V.set(`cloudCallout`, (e: number, t: number, n?: Map<string, number>) => {
    let r = yi(n, `adj1`, -20833),
      i = yi(n, `adj2`, 62500),
      a = e / 2 + e * r,
      o = t / 2 + t * i,
      s = V.get(`cloud`)!(e, t),
      c = e / 2,
      l = t / 2,
      u = a - c,
      d = o - l,
      f = Math.min(e, t) * 0.04,
      p = Math.min(e, t) * 0.025,
      m = c + u * 0.5,
      h = l + d * 0.5,
      g = c + u * 0.75,
      _ = l + d * 0.75;
    return [
      s,
      `M${m + f},${h} A${f},${f} 0 1,1 ${m - f},${h} A${f},${f} 0 1,1 ${m + f},${h} Z`,
      `M${g + p},${_} A${p},${p} 0 1,1 ${g - p},${_} A${p},${p} 0 1,1 ${g + p},${_} Z`,
    ].join(` `);
  });

/* borderCallout1（[P] js 12061 / jsx 8804）已在 pptxEngineGeometry.ts 671–676
 * 逐字重建（adj1 18750 / adj2 −8333 / adj3 112500 / adj4 −38333，公式一致），
 * 依纪律不重复登记。 */

V.set(`sun`, (e: number, t: number, n?: Map<string, number>) => {
    let r = n?.get(`adj`) ?? 25e3,
      i = Math.min(Math.max(r, 12500), 46875),
      a = 5e4 - i,
      o = (a * 30274) / 32768,
      s = (a * 12540) / 32768,
      c = 5e4 - o,
      l = 5e4 - s,
      u = (c * 3) / 4,
      d = (l * 3) / 4,
      f = u + 3662,
      p = d + 3662,
      m = d + 12500,
      h = 1e5 - u,
      g = 1e5 - f,
      _ = 1e5 - p,
      v = 1e5 - m,
      y = e / 2,
      b = t / 2,
      x = (e * 18436) / 21600,
      S = (t * 3163) / 21600,
      C = (e * 3163) / 21600,
      w = (t * 18436) / 21600,
      T = (e: any, t: any) => (t * e) / 1e5,
      E = T(u, e),
      D = T(f, e),
      O = T(p, e),
      k = T(m, e),
      A = T(h, e),
      j = T(g, e),
      M = T(_, e),
      N = T(v, e),
      P = T(a, e),
      F = T(a, t),
      I = T(u, t),
      L = T(f, t),
      R = T(p, t),
      z = T(m, t),
      B = T(h, t),
      ee = T(g, t),
      te = T(_, t),
      ne = T(v, t),
      re = T(i, e);
    return [
      `M${e},${b} L${A},${ne} L${A},${z} Z`,
      `M${x},${S} L${j},${R} L${M},${L} Z`,
      `M${y},0 L${N},${I} L${k},${I} Z`,
      `M${C},${S} L${O},${L} L${D},${R} Z`,
      `M0,${b} L${E},${z} L${E},${ne} Z`,
      `M${C},${w} L${D},${te} L${O},${ee} Z`,
      `M${y},${t} L${k},${B} L${N},${B} Z`,
      `M${x},${w} L${M},${ee} L${j},${te} Z`,
      `M${re},${b}`,
      `A${P},${F} 0 1,1 ${re + 2 * P},${b}`,
      `A${P},${F} 0 1,1 ${re},${b}`,
      `Z`,
    ].join(` `);
  });

V.set(`moon`, (e: number, t: number, n?: Map<string, number>) => {
    if (e <= 0 || t <= 0) return `M0,0 L${e},0 L${e},${t} L0,${t} Z`;
    let r = Math.min(e, t),
      i = t / 2,
      a = (r * Math.min(Math.max(n?.get(`adj`) ?? 5e4, 0), 87500)) / 1e5,
      o = r - a;
    if (o <= 0) return `M0,0 L${e},0 L${e},${t} L0,${t} Z`;
    let s = (a * e) / r,
      c = (2 * r * r - a * a) / o,
      l = ((c - a) * e) / r,
      u = ((c / 2 - a) * i) / r,
      d = (l - s) / 2;
    return [`M${e},${t}`, `A${e},${i} 0 0,1 ${e},0`, `A${d},${u} 0 0,0 ${e},${t}`, `Z`].join(` `);
  });

V.set(`lightningBolt`, (e: number, t: number) =>
    [
      `M${e * 0.3895},${t * 0}`,
      `L${e * 0},${t * 0.1821}`,
      `L${e * 0.3425},${t * 0.3845}`,
      `L${e * 0.2265},${t * 0.4452}`,
      `L${e * 0.5497},${t * 0.6391}`,
      `L${e * 0.453},${t * 0.683}`,
      `L${e * 0.9972},${t * 0.9983}`,
      `L${e * 0.6796},${t * 0.5919}`,
      `L${e * 0.7624},${t * 0.5514}`,
      `L${e * 0.5138},${t * 0.3153}`,
      `L${e * 0.5939},${t * 0.2816}`,
      `Z`,
    ].join(` `),
  );

V.set(`bracketPair`, (e: number, t: number, n?: Map<string, number>) => {
    let r = (Math.min(e, t) * Math.min(Math.max(bi(n, `adj`, 16667), 0), 5e4)) / 1e5,
      i = e - r,
      a = t - r;
    return [
      `M${r},${t}`,
      `A${r},${r} 0 0,1 0,${a}`,
      `L0,${r}`,
      `A${r},${r} 0 0,1 ${r},0`,
      `M${i},0`,
      `A${r},${r} 0 0,1 ${e},${r}`,
      `L${e},${a}`,
      `A${r},${r} 0 0,1 ${i},${t}`,
    ].join(` `);
  });

V.set(`bracePair`, (e: number, t: number, n?: Map<string, number>) => {
    let r = yi(n, `adj`, 8333),
      i = Math.min(e, t) * r,
      a = t / 2;
    return [
      `M${i * 2},0`,
      `A${i},${i} 0 0,0 ${i},${i}`,
      `L${i},${a - i}`,
      `A${i},${i} 0 0,1 0,${a}`,
      `A${i},${i} 0 0,1 ${i},${a + i}`,
      `L${i},${t - i}`,
      `A${i},${i} 0 0,0 ${i * 2},${t}`,
      `M${e - i * 2},0`,
      `A${i},${i} 0 0,1 ${e - i},${i}`,
      `L${e - i},${a - i}`,
      `A${i},${i} 0 0,0 ${e},${a}`,
      `A${i},${i} 0 0,0 ${e - i},${a + i}`,
      `L${e - i},${t - i}`,
      `A${i},${i} 0 0,1 ${e - i * 2},${t}`,
    ].join(` `);
  });

V.set(`leftBracket`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = r > 0 ? (5e4 * t) / r : 0,
      a = (r * Math.max(0, Math.min(n?.get(`adj`) ?? 8333, i))) / 1e5,
      o = (e: any) => e / 6e4,
      s = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let s = (o(i) * Math.PI) / 180,
          c = (o(a) * Math.PI) / 180,
          l = e - n * Math.cos(s),
          u = t - r * Math.sin(s),
          d = l + n * Math.cos(s + c),
          f = u + r * Math.sin(s + c);
        return { cmd: `A${n},${r} 0 ${+(Math.abs(o(a)) > 180)},1 ${d},${f}`, x: d, y: f };
      },
      c = s(e, t, e, a, 54e5, 54e5),
      l = s(0, a, e, a, 108e5, 54e5);
    return [`M${e},${t}`, c.cmd, `L0,${a}`, l.cmd].join(` `);
  });

V.set(`rightBracket`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = r > 0 ? (5e4 * t) / r : 0,
      a = (r * Math.max(0, Math.min(n?.get(`adj`) ?? 8333, i))) / 1e5,
      o = t - a,
      s = (e: any) => e / 6e4,
      c = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (s(i) * Math.PI) / 180,
          c = (s(a) * Math.PI) / 180,
          l = e - n * Math.cos(o),
          u = t - r * Math.sin(o),
          d = l + n * Math.cos(o + c),
          f = u + r * Math.sin(o + c);
        return { cmd: `A${n},${r} 0 ${+(Math.abs(s(a)) > 180)},1 ${d},${f}`, x: d, y: f };
      },
      l = c(0, 0, e, a, 162e5, 54e5),
      u = c(e, o, e, a, 0, 54e5);
    return [`M0,0`, l.cmd, `L${e},${o}`, u.cmd].join(` `);
  });

V.set(`leftBrace`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = Math.max(0, Math.min(n?.get(`adj2`) ?? 5e4, 1e5)),
      a = 1e5 - i,
      o = Math.min(a, i) / 2,
      s = r > 0 ? (o * t) / r : 0,
      c = (r * Math.max(0, Math.min(n?.get(`adj1`) ?? 8333, s))) / 1e5,
      l = (t * i) / 1e5 + c,
      u = e / 2,
      d = e / 2,
      f = (e: any) => e / 6e4,
      p = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (f(i) * Math.PI) / 180,
          s = (f(a) * Math.PI) / 180,
          c = e - n * Math.cos(o),
          l = t - r * Math.sin(o),
          u = c + n * Math.cos(o + s),
          d = l + r * Math.sin(o + s);
        return {
          cmd: `A${n},${r} 0 ${+(Math.abs(f(a)) > 180)},${+(a >= 0)} ${u},${d}`,
          x: u,
          y: d,
        };
      },
      m = e,
      h = t,
      g = p(m, h, u, c, 54e5, 54e5);
    ((m = g.x), (h = g.y));
    let _ = p(d, l, u, c, 0, -54e5),
      v = p(_.x, _.y, u, c, 54e5, -54e5),
      y = p(d, c, u, c, 108e5, 54e5);
    return [`M${e},${t}`, g.cmd, `L${d},${l}`, _.cmd, v.cmd, `L${d},${c}`, y.cmd].join(` `);
  });

V.set(`rightBrace`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(e, t),
      i = Math.max(0, Math.min(n?.get(`adj2`) ?? 5e4, 1e5)),
      a = 1e5 - i,
      o = Math.min(a, i) / 2,
      s = r > 0 ? (o * t) / r : 0,
      c = (r * Math.max(0, Math.min(n?.get(`adj1`) ?? 8333, s))) / 1e5,
      l = (t * i) / 1e5 - c,
      u = t - c,
      d = e / 2,
      f = e / 2,
      p = (e: any) => e / 6e4,
      m = (e: any, t: any, n: any, r: any, i: any, a: any) => {
        let o = (p(i) * Math.PI) / 180,
          s = (p(a) * Math.PI) / 180,
          c = e - n * Math.cos(o),
          l = t - r * Math.sin(o),
          u = c + n * Math.cos(o + s),
          d = l + r * Math.sin(o + s);
        return {
          cmd: `A${n},${r} 0 ${+(Math.abs(p(a)) > 180)},${+(a >= 0)} ${u},${d}`,
          x: u,
          y: d,
        };
      },
      h = m(0, 0, d, c, 162e5, 54e5),
      g = m(f, l, d, c, 108e5, -54e5),
      _ = m(g.x, g.y, d, c, 162e5, -54e5),
      v = m(f, u, d, c, 0, 54e5);
    return [`M0,0`, h.cmd, `L${f},${l}`, g.cmd, _.cmd, `L${f},${u}`, v.cmd].join(` `);
  });

V.set(`actionButtonBlank`, (e: number, t: number) => `M0,0 L${e},0 L${e},${t} L0,${t} Z`);

V.set(`wave`, (e: number, t: number, n?: Map<string, number>) => {
  let r = Math.min(Math.max(bi(n, `adj1`, 12500), 0), 2e4),
    i = Math.min(Math.max(bi(n, `adj2`, 0), -1e4), 1e4),
    a = (t * r) / 1e5,
    o = (a * 10) / 3,
    s = a - o,
    c = a + o,
    l = t - a,
    u = l - o,
    d = l + o,
    f = (e * i) / 5e4,
    p = f < 0 ? 0 : f,
    m = f < 0 ? f : 0,
    h = -p,
    g = e - m,
    _ = h + (g - h) / 3,
    v = (_ + g) / 2,
    y = m,
    b = e + p,
    x = y + (b - y) / 3,
    S = (x + b) / 2;
  return [
    `M${h},${a}`,
    `C${_},${s} ${v},${c} ${g},${a}`,
    `L${b},${l}`,
    `C${S},${d} ${x},${u} ${y},${l}`,
    `Z`,
  ].join(` `);
});

V.set(`doubleWave`, (e: number, t: number, n?: Map<string, number>) => {
    let r = Math.min(Math.max(bi(n, `adj1`, 6250), 0), 12500),
      i = Math.min(Math.max(bi(n, `adj2`, 0), -1e4), 1e4),
      a = (t * r) / 1e5,
      o = (a * 10) / 3,
      s = a - o,
      c = a + o,
      l = t - a,
      u = l - o,
      d = l + o,
      f = (e * i) / 5e4,
      p = f < 0 ? 0 : f,
      m = f < 0 ? f : 0,
      h = -p,
      g = e - m,
      _ = (g - h) / 6,
      v = h + _,
      y = h + (g - h) / 3,
      b = (h + g) / 2,
      x = b + _,
      S = (x + g) / 2,
      C = m,
      w = e + p,
      T = (w - C) / 6,
      E = C + T,
      D = C + (w - C) / 3,
      O = (C + w) / 2,
      k = O + T,
      A = (k + w) / 2;
    return [
      `M${h},${a}`,
      `C${v},${s} ${y},${c} ${b},${a}`,
      `C${x},${s} ${S},${c} ${g},${a}`,
      `L${w},${l}`,
      `C${A},${d} ${k},${u} ${O},${l}`,
      `C${D},${d} ${E},${u} ${C},${l}`,
      `Z`,
    ].join(` `);
  });

V.set(`irregularSeal1`, (e: number, t: number) => {
    let n = (t: any) => (e * t) / 21600,
      r = (e: any) => (t * e) / 21600;
    return [
      `M${n(10800)},${r(5800)}`,
      `L${n(14522)},0`,
      `L${n(14155)},${r(5325)}`,
      `L${n(18380)},${r(4457)}`,
      `L${n(16702)},${r(7315)}`,
      `L${n(21097)},${r(8137)}`,
      `L${n(17607)},${r(10475)}`,
      `L${n(21600)},${r(13290)}`,
      `L${n(16837)},${r(12942)}`,
      `L${n(18145)},${r(18095)}`,
      `L${n(14020)},${r(14457)}`,
      `L${n(13247)},${r(19737)}`,
      `L${n(10532)},${r(14935)}`,
      `L${n(8485)},${r(21600)}`,
      `L${n(7715)},${r(15627)}`,
      `L${n(4762)},${r(17617)}`,
      `L${n(5667)},${r(13937)}`,
      `L${n(135)},${r(14587)}`,
      `L${n(3722)},${r(11775)}`,
      `L0,${r(8615)}`,
      `L${n(4627)},${r(7617)}`,
      `L${n(370)},${r(2295)}`,
      `L${n(7312)},${r(6320)}`,
      `L${n(8352)},${r(2295)}`,
      `Z`,
    ].join(` `);
  });

V.set(`irregularSeal2`, (e: number, t: number) =>
    [
      `M${(e * 11462) / 21600},${(t * 4342) / 21600}`,
      `L${(e * 14790) / 21600},0`,
      `L${(e * 14525) / 21600},${(t * 5777) / 21600}`,
      `L${(e * 18007) / 21600},${(t * 3172) / 21600}`,
      `L${(e * 16380) / 21600},${(t * 6532) / 21600}`,
      `L${e},${(t * 6645) / 21600}`,
      `L${(e * 16985) / 21600},${(t * 9402) / 21600}`,
      `L${(e * 18270) / 21600},${(t * 11290) / 21600}`,
      `L${(e * 16380) / 21600},${(t * 12310) / 21600}`,
      `L${(e * 18877) / 21600},${(t * 15632) / 21600}`,
      `L${(e * 14640) / 21600},${(t * 14350) / 21600}`,
      `L${(e * 14942) / 21600},${(t * 17370) / 21600}`,
      `L${(e * 12180) / 21600},${(t * 15935) / 21600}`,
      `L${(e * 11612) / 21600},${(t * 18842) / 21600}`,
      `L${(e * 9872) / 21600},${(t * 17370) / 21600}`,
      `L${(e * 8700) / 21600},${(t * 19712) / 21600}`,
      `L${(e * 7527) / 21600},${(t * 18125) / 21600}`,
      `L${(e * 4917) / 21600},${t}`,
      `L${(e * 4805) / 21600},${(t * 18240) / 21600}`,
      `L${(e * 1285) / 21600},${(t * 17825) / 21600}`,
      `L${(e * 3330) / 21600},${(t * 15370) / 21600}`,
      `L0,${(t * 12877) / 21600}`,
      `L${(e * 3935) / 21600},${(t * 11592) / 21600}`,
      `L${(e * 1172) / 21600},${(t * 8270) / 21600}`,
      `L${(e * 5372) / 21600},${(t * 7817) / 21600}`,
      `L${(e * 4502) / 21600},${(t * 3625) / 21600}`,
      `L${(e * 8550) / 21600},${(t * 6382) / 21600}`,
      `L${(e * 9722) / 21600},${(t * 1887) / 21600}`,
      `Z`,
    ].join(` `),
  );


export { Di as circularArrowPairBuilder };

/* ============================================================================
 * 符号表（本文件）
 * ----------------------------------------------------------------------------
 * 符号                              原混淆名   原件锚点（js / jsx）      把握度
 * OFFICE_WIRING_TOPOLOGY            —（登记）  见 §W 各行号              [B]
 * V（本地别名）                      V          pptxEngineGeometry.ts:181 [A]
 * Di → circularArrowPairBuilder     Di         11195 / 8238              [A]
 * downArrowCallout                  —          10504 / 7766              [A]
 * rightArrowCallout                 —          10539 / 7788              [A]
 * leftArrowCallout                  —          10572 / 7808              [A]
 * upArrowCallout                    —          10605 / 7828              [A]
 * upDownArrowCallout                —          10638 / 7848              [A]
 * leftRightArrowCallout             —          10683 / 7868              [A]
 * uturnArrow                        —          10728 / 7890              [A]
 * leftUpArrow                       —          10800 / 7934              [A]
 * bentArrow                         —          10924 / 7998              [A]
 * bentUpArrow                       —          10955 / 8022              [A]
 * curvedRightArrow                  —          10980 / 8036              [A]
 * curvedLeftArrow                   —          11048 / 8088              [A]
 * curvedUpArrow                     —          11081 / 8152              [A]
 * curvedDownArrow                   —          11139 / 8196              [A]
 * circularArrow                     —          11421 / 8238（Di 注册）   [A]
 * leftCircularArrow                 —          11422 / 8238（Di 注册）   [A]
 * leftRightCircularArrow            —          11423 / 8446              [A]
 * quadArrowCallout                  —          11513 / 8499              [A]
 * leftRightUpArrow                  —          11578 / 8520              [A]
 * swooshArrow                       —          11619 / 8540              [A]
 * flowChartPunchedTape              —          11778 / 8644              [A]
 * flowChartMagneticTape             —          11885 / 8692              [A]
 * flowChartMultidocument            —          11917 / 8722              [A]
 * cloudCallout                      —          12039 / 8788              [A]
 * borderCallout1（跳过：已重建）     —          12061 / 8804              —
 * sun                               —          12638 / 9200              [A]
 * moon                              —          12696 / 9244              [A]
 * lightningBolt                     —          12710 / 9256              [A]
 * bracketPair                       —          12726 / 9290（约）        [A]
 * bracePair                         —          12741 / 9330（约）        [A]
 * leftBracket                       —          12762 / 9267              [A]
 * rightBracket                      —          12780 / 9280              [A]
 * leftBrace                         —          12799 / 9370（约）        [A]
 * rightBrace                        —          12832 / 9395（约）        [A]
 * actionButtonBlank                 —          12863 / 9410（约）        [A]
 * wave                              —          12948 / 9423              [A]
 * doubleWave                        —          12977 / 9450              [A]
 * irregularSeal1                    —          13016 / 9460              [A]
 * irregularSeal2                    —          13047 / 9479              [A]
 *
 * 未转录余量（属 DEFERRED_MULTI_REGION_ANCHORS，pptxEngineGeometry.ts 1508–1524）：
 *   Ti（jsx 8099–8127）/ Ei（jsx 8128–8150）多区域包装；
 *   ki 字形 Map（jsx 9374–9417：actionButtonForwardNext / BackPrevious /
 *   Return / Beginning / End / Information / Document）；Ai 查找（jsx 9419–9422）。
 * ==========================================================================*/
