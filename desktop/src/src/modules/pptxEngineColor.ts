/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineColor.ts — pptxRendererPreviewEngine 子模块 · DrawingML 颜色系统
 * （解混淆重建 · D8 Stage B2）
 *
 * 主文件：pptxRendererPreviewEngine.tsx。对应源 chunk 区段：
 *   Et/Dt/Ot/kt        hex/rgb/hsl 互转               (jsx 4984-5058)
 *   At/jt              sRGB 线性化 / gamma            (jsx 5059-5064)
 *   Mt..Rt/zt          tint/shade/lumMod/lumOff/satMod/hueMod/hueOff/satOff (jsx 5065-5218)
 *   Bt..Wt             通道级 mod/off/set             (jsx 5219-5224)
 *   Gt..Qt             lum/sat/hue/inv/gray/comp/gamma(jsx 5225-5264)
 *   $t/en              alpha 钳制 + 变换管线          (jsx 5265-5360)
 *   tn/nn              预设色名表（148 色）           (jsx 5361-5522)
 *   rn/an              颜色缓存键 / 变换列表解析      (jsx 5523-5547)
 *   on/sn/cn           scheme→theme 解析 + 缓存       (jsx 5548-5627)
 *   ln/un/dn           CSS 输出                       (jsx 5628-5645)
 *   fn/pn              填充 CSS（solid/grad/blip/patt/grp/no）(jsx 5646-5750)
 *   mn/hn/gn           渐变填充 CSS / 线型 / 虚线类别 (jsx 5751-5862)
 *   _n/vn/yn/bn/xn/Sn  fillToRect 几何与渐变压缩      (jsx 5863-5912)
 *   Cn/wn              渐变数据模型（供 SVG 渲染）    (jsx 5913-5967)
 *   Tn/En/Dn           主题 fillStyles/bgFillStyles 解析 (jsx 5968-6005)
 *   On                 渐变线（stroke gradient）      (jsx 6006-6035)
 * ============================================================================
 */

import { XmlNode, angleToDeg, permilleToUnit } from "./pptxEngineTypes";
import type { PptxRenderContext } from "./pptxEngineTypes";

export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }
export interface ResolvedColor { color: string; alpha: number }

/* --- 基础互转（原 Et/Dt/Ot/kt） --- */

/** 原 Et：#rgb/#rrggbb → {r,g,b}；非法 → 黑 */
export function hexToRgb(hex: string): Rgb {
  const bare = hex.replace(/^#/, ``);
  if (bare.length !== 6 && bare.length !== 3) return { r: 0, g: 0, b: 0 };
  const expanded = bare.length === 3 ? bare[0] + bare[0] + bare[1] + bare[1] + bare[2] + bare[2] : bare;
  const value = parseInt(expanded, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

/** 原 Dt：{r,g,b} → #rrggbb（通道钳制 0-255） */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#` + [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, `0`)).join(``);
}

/** 原 Ot：rgb(0-255) → hsl（h: 0-360, s/l: 0-1） */
export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60; break;
      case gg: h = ((bb - rr) / d + 2) * 60; break;
      case bb: h = ((rr - gg) / d + 4) * 60; break;
    }
  }
  return { h, s, l };
}

/** 原 kt：hsl → rgb(0-255) */
export function hslToRgb(hue: number, sat: number, light: number): Rgb {
  hue = ((hue % 360) + 360) % 360;
  sat = Math.max(0, Math.min(1, sat));
  light = Math.max(0, Math.min(1, light));
  if (sat === 0) {
    const v = Math.round(light * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    t < 0 && (t += 1);
    t > 1 && --t;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const h = hue / 360;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/* --- sRGB 线性化（原 At/jt） --- */

function srgbToLinear(channel: number): number {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v: number): number {
  const out = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** 0.4166666666666667 - 0.055;
  return Math.max(0, Math.min(255, Math.round(out * 255)));
}

/* --- DrawingML 颜色变换（原 Mt..Qt，全部在线性空间或 HSL 空间操作） --- */

/** 原 Mt：tint —— 朝白色混合（线性空间，amt=100000 → 纯白） */
export function tint(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = amt / 1e5;
  return rgbToHex(
    linearToSrgb(srgbToLinear(r) * a + 1 * (1 - a)),
    linearToSrgb(srgbToLinear(g) * a + 1 * (1 - a)),
    linearToSrgb(srgbToLinear(b) * a + 1 * (1 - a)),
  );
}

/** 原 Nt：shade —— 朝黑色混合（线性空间） */
export function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = amt / 1e5;
  return rgbToHex(linearToSrgb(srgbToLinear(r) * a), linearToSrgb(srgbToLinear(g) * a), linearToSrgb(srgbToLinear(b) * a));
}

/** 原 Pt：lumMod —— 亮度缩放（HSL） */
export function lumMod(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, s, Math.max(0, Math.min(1, (amt / 1e5) * l)));
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Ft：lumOff —— 亮度偏移（HSL） */
export function lumOff(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, s, Math.max(0, Math.min(1, l + amt / 1e5)));
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 It：satMod —— 饱和度缩放 */
export function satMod(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, Math.max(0, Math.min(1, (amt / 1e5) * s)), l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Lt：hueMod —— 色相缩放 */
export function hueMod(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb((((amt / 1e5) * h) % 360), s, l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Rt：hueOff —— 色相偏移 */
export function hueOff(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb((((h + amt / 6e4) % 360) + 360) % 360, s, l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 zt：satOff —— 饱和度偏移 */
export function satOff(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, Math.max(0, Math.min(1, s + amt / 1e5)), l);
  return rgbToHex(out.r, out.g, out.b);
}

/* --- 通道级变换（原 Bt/Vt/Ht/Ut/Wt） --- */

function alphaTo255(amt: number): number {
  return (amt / 1e5) * 255;
}

function transformChannel(hex: string, channel: keyof Rgb, fn: (v: number) => number): string {
  const rgb = hexToRgb(hex);
  rgb[channel] = fn(rgb[channel]);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function channelMod(hex: string, channel: keyof Rgb, amt: number): string {
  return transformChannel(hex, channel, (v) => (amt / 1e5) * v);
}

function channelOff(hex: string, channel: keyof Rgb, amt: number): string {
  return transformChannel(hex, channel, (v) => v + alphaTo255(amt));
}

function channelSet(hex: string, channel: keyof Rgb, amt: number): string {
  return transformChannel(hex, channel, () => alphaTo255(amt));
}

/* --- 其余变换（原 Gt..Qt） --- */

/** 原 Gt：lum —— 直接设置亮度 */
export function setLum(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, s, amt / 1e5);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Kt：sat —— 直接设置饱和度 */
export function setSat(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h, amt / 1e5, l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 qt：hue —— 直接设置色相 */
export function setHue(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(amt / 6e4, s, l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Jt：inv —— 反色 */
export function invert(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(255 - r, 255 - g, 255 - b);
}

/** 原 Yt：gray —— 亮度灰（Rec.709 权重） */
export function grayscale(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return rgbToHex(luma, luma, luma);
}

/** 原 Xt：comp —— 补色（色相 +180） */
export function complement(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const out = hslToRgb(h + 180, s, l);
  return rgbToHex(out.r, out.g, out.b);
}

/** 原 Zt：gamma —— sRGB 编码（线性化后再编码回去的单向形式） */
export function gamma(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(srgbToLinear(r) * 255, srgbToLinear(g) * 255, srgbToLinear(b) * 255);
}

/** 原 Qt：invGamma */
export function invGamma(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(linearToSrgb(r / 255), linearToSrgb(g / 255), linearToSrgb(b / 255));
}

/** 原 $t：alpha 钳制 0..1 */
export function clampAlpha(amt: number): number {
  return Math.max(0, Math.min(1, amt / 1e5));
}

/* --- 变换管线（原 en，jsx 5270-5360）：按 OOXML 顺序施加 --- */

export interface ColorTransform { name: string; val: number }

export function applyColorTransforms(hex: string, transforms: ColorTransform[]): ResolvedColor {
  let color = hex;
  let alpha = 1;
  for (const t of transforms)
    switch (t.name.startsWith(`a:`) ? t.name.slice(2) : t.name) {
      case `tint`: color = tint(color, t.val); break;
      case `shade`: color = shade(color, t.val); break;
      case `red`: color = channelSet(color, `r`, t.val); break;
      case `green`: color = channelSet(color, `g`, t.val); break;
      case `blue`: color = channelSet(color, `b`, t.val); break;
      case `redMod`: color = channelMod(color, `r`, t.val); break;
      case `greenMod`: color = channelMod(color, `g`, t.val); break;
      case `blueMod`: color = channelMod(color, `b`, t.val); break;
      case `redOff`: color = channelOff(color, `r`, t.val); break;
      case `greenOff`: color = channelOff(color, `g`, t.val); break;
      case `blueOff`: color = channelOff(color, `b`, t.val); break;
      case `lum`: color = setLum(color, t.val); break;
      case `lumMod`: color = lumMod(color, t.val); break;
      case `lumOff`: color = lumOff(color, t.val); break;
      case `sat`: color = setSat(color, t.val); break;
      case `satMod`: color = satMod(color, t.val); break;
      case `hue`: color = setHue(color, t.val); break;
      case `hueMod`: color = hueMod(color, t.val); break;
      case `hueOff`: color = hueOff(color, t.val); break;
      case `satOff`: color = satOff(color, t.val); break;
      case `inv`: color = invert(color); break;
      case `gray`: color = grayscale(color); break;
      case `comp`: color = complement(color); break;
      case `gamma`: color = gamma(color); break;
      case `invGamma`: color = invGamma(color); break;
      case `alpha`: alpha = clampAlpha(t.val); break;
      case `alphaMod`:
      case `alphaModFix`: alpha = Math.max(0, Math.min(1, alpha * (t.val / 1e5))); break;
      case `alphaOff`: alpha = Math.max(0, Math.min(1, alpha + t.val / 1e5)); break;
    }
  return { color, alpha };
}

/* --- 预设色名表（原 tn，jsx 5361-5515；148 色全量转录） --- */

export const PRESET_COLOR_NAMES: Record<string, string> = {
  black: `#000000`, white: `#FFFFFF`, red: `#FF0000`, green: `#008000`,
  blue: `#0000FF`, yellow: `#FFFF00`, cyan: `#00FFFF`, magenta: `#FF00FF`,
  orange: `#FFA500`, purple: `#800080`, brown: `#A52A2A`, pink: `#FFC0CB`,
  gray: `#808080`, grey: `#808080`, lime: `#00FF00`, navy: `#000080`,
  teal: `#008080`, maroon: `#800000`, olive: `#808000`, silver: `#C0C0C0`,
  aqua: `#00FFFF`, fuchsia: `#FF00FF`, aliceBlue: `#F0F8FF`, antiqueWhite: `#FAEBD7`,
  aquamarine: `#7FFFD4`, azure: `#F0FFFF`, beige: `#F5F5DC`, bisque: `#FFE4C4`,
  blanchedAlmond: `#FFEBCD`, blueViolet: `#8A2BE2`, burlyWood: `#DEB887`, cadetBlue: `#5F9EA0`,
  chartreuse: `#7FFF00`, chocolate: `#D2691E`, coral: `#FF7F50`, cornflowerBlue: `#6495ED`,
  cornsilk: `#FFF8DC`, crimson: `#DC143C`, darkBlue: `#00008B`, darkCyan: `#008B8B`,
  darkGoldenrod: `#B8860B`, darkGray: `#A9A9A9`, darkGrey: `#A9A9A9`, darkGreen: `#006400`,
  darkKhaki: `#BDB76B`, darkMagenta: `#8B008B`, darkOliveGreen: `#556B2F`, darkOrange: `#FF8C00`,
  darkOrchid: `#9932CC`, darkRed: `#8B0000`, darkSalmon: `#E9967A`, darkSeaGreen: `#8FBC8F`,
  darkSlateBlue: `#483D8B`, darkSlateGray: `#2F4F4F`, darkSlateGrey: `#2F4F4F`, darkTurquoise: `#00CED1`,
  darkViolet: `#9400D3`, deepPink: `#FF1493`, deepSkyBlue: `#00BFFF`, dimGray: `#696969`,
  dimGrey: `#696969`, dodgerBlue: `#1E90FF`, firebrick: `#B22222`, floralWhite: `#FFFAF0`,
  forestGreen: `#228B22`, gainsboro: `#DCDCDC`, ghostWhite: `#F8F8FF`, gold: `#FFD700`,
  goldenrod: `#DAA520`, greenYellow: `#ADFF2F`, honeydew: `#F0FFF0`, hotPink: `#FF69B4`,
  indianRed: `#CD5C5C`, indigo: `#4B0082`, ivory: `#FFFFF0`, khaki: `#F0E68C`,
  lavender: `#E6E6FA`, lavenderBlush: `#FFF0F5`, lawnGreen: `#7CFC00`, lemonChiffon: `#FFFACD`,
  lightBlue: `#ADD8E6`, lightCoral: `#F08080`, lightCyan: `#E0FFFF`, lightGoldenrodYellow: `#FAFAD2`,
  lightGray: `#D3D3D3`, lightGrey: `#D3D3D3`, lightGreen: `#90EE90`, lightPink: `#FFB6C1`,
  lightSalmon: `#FFA07A`, lightSeaGreen: `#20B2AA`, lightSkyBlue: `#87CEFA`, lightSlateGray: `#778899`,
  lightSlateGrey: `#778899`, lightSteelBlue: `#B0C4DE`, lightYellow: `#FFFFE0`, limeGreen: `#32CD32`,
  linen: `#FAF0E6`, mediumAquamarine: `#66CDAA`, mediumBlue: `#0000CD`, mediumOrchid: `#BA55D3`,
  mediumPurple: `#9370DB`, mediumSeaGreen: `#3CB371`, mediumSlateBlue: `#7B68EE`, mediumSpringGreen: `#00FA9A`,
  mediumTurquoise: `#48D1CC`, mediumVioletRed: `#C71585`, midnightBlue: `#191970`, mintCream: `#F5FFFA`,
  mistyRose: `#FFE4E1`, moccasin: `#FFE4B5`, navajoWhite: `#FFDEAD`, oldLace: `#FDF5E6`,
  oliveDrab: `#6B8E23`, orangeRed: `#FF4500`, orchid: `#DA70D6`, paleGoldenrod: `#EEE8AA`,
  paleGreen: `#98FB98`, paleTurquoise: `#AFEEEE`, paleVioletRed: `#DB7093`, papayaWhip: `#FFEFD5`,
  peachPuff: `#FFDAB9`, peru: `#CD853F`, plum: `#DDA0DD`, powderBlue: `#B0E0E6`,
  rosyBrown: `#BC8F8F`, royalBlue: `#4169E1`, saddleBrown: `#8B4513`, salmon: `#FA8072`,
  sandyBrown: `#F4A460`, seaGreen: `#2E8B57`, seaShell: `#FFF5EE`, sienna: `#A0522D`,
  skyBlue: `#87CEEB`, slateBlue: `#6A5ACD`, slateGray: `#708090`, slateGrey: `#708090`,
  snow: `#FFFAFA`, springGreen: `#00FF7F`, steelBlue: `#4682B4`, tan: `#D2B48C`,
  thistle: `#D8BFD8`, tomato: `#FF6347`, turquoise: `#40E0D0`, violet: `#EE82EE`,
  wheat: `#F5DEB3`, whiteSmoke: `#F5F5F5`, yellowGreen: `#9ACD32`,
};

/** 原 nn：大小写不敏感查表 */
export function lookupPresetColor(name: string): string | undefined {
  if (PRESET_COLOR_NAMES[name] !== void 0) return PRESET_COLOR_NAMES[name];
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(PRESET_COLOR_NAMES)) if (key.toLowerCase() === lower) return value;
}

/* --- 颜色解析与缓存（原 rn/an/on/sn/cn，jsx 5523-5627） --- */

/** 缓存键：节点名 + val + 两级子变换（原 rn） */
function colorCacheKey(node: XmlNode): string {
  const parts = [node.localName, node.attr(`val`) ?? ``];
  for (const child of node.allChildren()) {
    const name = child.localName;
    const value = child.attr(`val`) ?? child.attr(`amt`);
    name && parts.push(`${name}:${value ?? ``}`);
    for (const grand of child.allChildren()) {
      const gname = grand.localName;
      const gvalue = grand.attr(`val`) ?? grand.attr(`amt`);
      gname && parts.push(`${gname}:${gvalue ?? ``}`);
    }
  }
  return parts.join(`|`);
}

/** 变换列表解析（原 an）：inv/gray/comp/gamma/invGamma 无 val 补 0 */
export function parseTransformList(node: XmlNode): ColorTransform[] {
  const out: ColorTransform[] = [];
  for (const child of node.allChildren()) {
    const name = child.localName;
    const val = child.numAttr(`val`) ?? child.numAttr(`amt`);
    val !== void 0 && name
      ? out.push({ name, val })
      : (name === `inv` || name === `gray` || name === `comp` || name === `gamma` || name === `invGamma`) &&
        out.push({ name, val: 0 });
  }
  return out;
}

/** scheme 名 → 主题色（经 colorMapOverride / colorMap 两级映射，原 on） */
function resolveSchemeColor(name: string, ctx: PptxRenderContext): string {
  let mapped = name;
  if (ctx.layout.colorMapOverride) {
    const override = ctx.layout.colorMapOverride.get(name);
    override && (mapped = override);
  }
  if (mapped === name) {
    const viaColorMap = ctx.master.colorMap.get(name);
    viaColorMap && (mapped = viaColorMap);
  }
  return ctx.theme.colorScheme.get(mapped) || ctx.theme.colorScheme.get(name) || `000000`;
}

/** 带缓存的颜色解析入口（原 sn） */
export function resolveColor(node: XmlNode, ctx: PptxRenderContext): ResolvedColor {
  const key = colorCacheKey(node);
  const cached = ctx.colorCache.get(key);
  if (cached) return cached;
  const resolved = resolveColorUncached(node, ctx);
  ctx.colorCache.set(key, resolved);
  return resolved;
}

/** 原 cn：按子节点类型分派（支持 phclr 占位符色递归） */
function resolveColorUncached(node: XmlNode, ctx: PptxRenderContext, placeholder?: XmlNode): ResolvedColor {
  for (const child of node.allChildren()) {
    const name = child.localName;
    const transforms = parseTransformList(child);
    switch (name) {
      case `srgbClr`:
        return applyColorTransforms(child.attr(`val`) || `000000`, transforms);
      case `schemeClr`: {
        const scheme = child.attr(`val`) || `tx1`;
        if (scheme.toLowerCase() === `phclr` && placeholder != null && placeholder.exists()) {
          const base = resolveColor(placeholder, ctx);
          const applied = applyColorTransforms(base.color.startsWith(`#`) ? base.color.slice(1) : base.color, transforms);
          return { color: applied.color, alpha: applied.alpha * base.alpha };
        }
        return applyColorTransforms(resolveSchemeColor(scheme, ctx), transforms);
      }
      case `sysClr`:
        return applyColorTransforms(child.attr(`lastClr`) || child.attr(`val`) || `000000`, transforms);
      case `prstClr`:
        return applyColorTransforms((lookupPresetColor(child.attr(`val`) || `black`) || `#000000`).replace(`#`, ``), transforms);
      case `hslClr`: {
        const rgb = hslToRgb((child.numAttr(`hue`) ?? 0) / 6e4, (child.numAttr(`sat`) ?? 0) / 1e5, (child.numAttr(`lum`) ?? 0) / 1e5);
        return applyColorTransforms(rgbToHex(rgb.r, rgb.g, rgb.b).replace(`#`, ``), transforms);
      }
      case `scrgbClr`:
        return applyColorTransforms(
          rgbToHex(
            Math.round((child.numAttr(`r`) ?? 0) / 1e5 * 255),
            Math.round((child.numAttr(`g`) ?? 0) / 1e5 * 255),
            Math.round((child.numAttr(`b`) ?? 0) / 1e5 * 255),
          ).replace(`#`, ``),
          transforms,
        );
    }
  }
  // 节点自身即颜色节点的情况（与上面分支同构，原代码重复实现）
  const selfName = node.localName;
  if (selfName === `srgbClr`) return applyColorTransforms(node.attr(`val`) || `000000`, parseTransformList(node));
  if (selfName === `schemeClr`) {
    const scheme = node.attr(`val`) || `tx1`;
    if (scheme.toLowerCase() === `phclr` && placeholder != null && placeholder.exists()) {
      const base = resolveColor(placeholder, ctx);
      const applied = applyColorTransforms(base.color.startsWith(`#`) ? base.color.slice(1) : base.color, parseTransformList(node));
      return { color: applied.color, alpha: applied.alpha * base.alpha };
    }
    return applyColorTransforms(resolveSchemeColor(scheme, ctx), parseTransformList(node));
  }
  if (selfName === `sysClr`) return applyColorTransforms(node.attr(`lastClr`) || node.attr(`val`) || `000000`, parseTransformList(node));
  if (selfName === `prstClr`) return applyColorTransforms((lookupPresetColor(node.attr(`val`) || `black`) || `#000000`).replace(`#`, ``), parseTransformList(node));
  if (selfName === `hslClr`) {
    const rgb = hslToRgb((node.numAttr(`hue`) ?? 0) / 6e4, (node.numAttr(`sat`) ?? 0) / 1e5, (node.numAttr(`lum`) ?? 0) / 1e5);
    return applyColorTransforms(rgbToHex(rgb.r, rgb.g, rgb.b).replace(`#`, ``), parseTransformList(node));
  }
  return selfName === `scrgbClr`
    ? applyColorTransforms(
        rgbToHex(
          Math.round((node.numAttr(`r`) ?? 0) / 1e5 * 255),
          Math.round((node.numAttr(`g`) ?? 0) / 1e5 * 255),
          Math.round((node.numAttr(`b`) ?? 0) / 1e5 * 255),
        ).replace(`#`, ``),
        parseTransformList(node),
      )
    : { color: `#000000`, alpha: 1 };
}

/* --- CSS 输出（原 ln/un/dn，jsx 5628-5645） --- */

/** 解析并输出 CSS 颜色（原 ln） */
export function resolveColorCss(node: XmlNode, ctx: PptxRenderContext): string {
  const { color, alpha } = resolveColor(node, ctx);
  return colorWithAlphaCss(color, alpha);
}

/** #hex 或 rgba()（原 un） */
export function colorWithAlphaCss(color: string, alpha: number): string {
  const hex = color.startsWith(`#`) ? color : `#${color}`;
  const { r, g, b } = hexToRgb(hex);
  return alpha >= 1 ? hex : `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** phclr 感知解析（原 dn） */
export function resolveColorWithPlaceholder(node: XmlNode, ctx: PptxRenderContext, placeholder?: XmlNode): ResolvedColor {
  return placeholder != null && placeholder.exists() ? resolveColorUncached(node, ctx, placeholder) : resolveColor(node, ctx);
}

/* --- 填充 CSS（原 fn，jsx 5646-5659） --- */

export const FILL_KINDS = [`solidFill`, `gradFill`, `blipFill`, `pattFill`, `grpFill`, `noFill`];

/** 取第一个存在的填充子节点（原 Ae，jsx 4197-4203） */
export function findFillNode(spPr: XmlNode): XmlNode | undefined {
  for (const kind of FILL_KINDS) {
    const node = spPr.child(kind);
    if (node.exists()) return node;
  }
}

/**
 * 填充 → CSS（原 fn）。
 * solid → 颜色；grad → 线性/径向渐变串；blip → 空（由图片渲染器处理）；
 * patt → 图案（CSS 渐变模拟）；grp → 递归组填充；no → transparent。
 */
export function resolveFillCss(spPr: XmlNode, ctx: PptxRenderContext): string {
  const solid = spPr.child(`solidFill`);
  if (solid.exists()) {
    const { color, alpha } = resolveColor(solid, ctx);
    return colorWithAlphaCss(color, alpha);
  }
  const grad = spPr.child(`gradFill`);
  if (grad.exists()) return gradientFillCss(grad, ctx);
  if (spPr.child(`blipFill`).exists()) return ``;
  const patt = spPr.child(`pattFill`);
  if (patt.exists()) return patternFillCss(patt, ctx);
  if (spPr.child(`grpFill`).exists()) return ctx.groupFillNode ? resolveFillCss(ctx.groupFillNode, ctx) : ``;
  if (spPr.child(`noFill`).exists()) return `transparent`;
  return ``;
}

/* --- 图案填充 → CSS 渐变模拟（原 pn，jsx 5660-5750） --- */

export function patternFillCss(node: XmlNode, ctx: PptxRenderContext, placeholder?: XmlNode): string {
  const preset = node.attr(`prst`) ?? `solid`;
  let fg = `#000000`;
  let bg = `#ffffff`;
  const fgNode = node.child(`fgClr`);
  if (fgNode.exists()) {
    const resolved = resolveColorWithPlaceholder(fgNode, ctx, placeholder);
    fg = colorWithAlphaCss(resolved.color, resolved.alpha);
  }
  const bgNode = node.child(`bgClr`);
  if (bgNode.exists()) {
    const resolved = resolveColorWithPlaceholder(bgNode, ctx, placeholder);
    bg = colorWithAlphaCss(resolved.color, resolved.alpha);
  }
  const single = (layer: string) => `${layer} 0 0 / 8px 8px, ${bg}`;
  const double = (layerA: string, layerB: string) => `${layerA} 0 0 / 8px 8px, ${layerB} 0 0 / 8px 8px, ${bg}`;
  switch (preset) {
    case `solid`: case `solidDmnd`: return fg;
    case `pct5`: case `pct10`: case `pct20`: case `pct25`:
      return single(`radial-gradient(${fg} 1px, transparent 1px)`);
    case `pct30`: case `pct40`: case `pct50`:
      return single(`radial-gradient(${fg} 1.5px, transparent 1.5px)`);
    case `pct60`: case `pct70`: case `pct75`: case `pct80`: case `pct90`:
      return single(`radial-gradient(${fg} 2.5px, transparent 2.5px)`);
    case `horz`: case `ltHorz`: case `narHorz`: case `dkHorz`:
      return single(`repeating-linear-gradient(0deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`);
    case `vert`: case `ltVert`: case `narVert`: case `dkVert`:
      return single(`repeating-linear-gradient(90deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`);
    case `dnDiag`: case `ltDnDiag`: case `narDnDiag`: case `dkDnDiag`: case `wdDnDiag`:
      return single(`repeating-linear-gradient(45deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`);
    case `upDiag`: case `ltUpDiag`: case `narUpDiag`: case `dkUpDiag`: case `wdUpDiag`:
      return single(`repeating-linear-gradient(-45deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`);
    case `smGrid`: case `lgGrid`: case `cross`:
      return double(
        `repeating-linear-gradient(0deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`,
        `repeating-linear-gradient(90deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`,
      );
    case `smCheck`: case `lgCheck`: case `diagCross`: case `openDmnd`:
      return double(
        `repeating-linear-gradient(45deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`,
        `repeating-linear-gradient(-45deg, ${fg} 0px, ${fg} 1px, transparent 1px, transparent 8px)`,
      );
    case `dotGrid`: case `dotDmnd`:
      return single(`radial-gradient(${fg} 1px, transparent 1px)`);
    case `trellis`: case `weave`:
      return double(
        `repeating-linear-gradient(45deg, ${fg} 0px, ${fg} 2px, transparent 2px, transparent 8px)`,
        `repeating-linear-gradient(-45deg, ${fg} 0px, ${fg} 2px, transparent 2px, transparent 8px)`,
      );
    case `dashDnDiag`: case `dashUpDiag`: case `dashHorz`: case `dashVert`:
      return single(
        `repeating-linear-gradient(${preset.includes(`Dn`) ? `45deg` : preset.includes(`Up`) ? `-45deg` : preset.includes(`Horz`) ? `0deg` : `90deg`}, ${fg} 0px, ${fg} 3px, transparent 3px, transparent 8px)`,
      );
    case `sphere`: case `shingle`: case `plaid`: case `divot`: case `zigZag`:
      return single(`radial-gradient(${fg} 2px, transparent 2px)`);
    default:
      return bg;
  }
}

/* --- 渐变填充（原 mn/Cn/wn + 几何助手 _n/vn/yn/bn/xn/Sn，jsx 5751-5967） --- */

export interface GradientStop { position: number; color: string }
export interface GradientFillData {
  type: `linear` | `radial`;
  stops: GradientStop[];
  angle: number;
  colorInterpolation: `linearRGB` | `sRGB`;
  cx?: number;
  cy?: number;
  pathType?: string;
  fillToRect?: { l: number; t: number; r: number; b: number };
}

/** 渐变 CSS 串（原 mn）：lin → linear-gradient（OOXML 角度 +90° 换算）；
 *  path circle/shape/rect → radial-gradient；缺省 180deg 兜底。 */
export function gradientFillCss(node: XmlNode, ctx: PptxRenderContext, placeholder?: XmlNode): string {
  const stopsNode = node.child(`gsLst`);
  const stops: GradientStop[] = [];
  for (const gs of stopsNode.children(`gs`)) {
    const position = permilleToUnit(gs.numAttr(`pos`) ?? 0) * 100;
    const { color, alpha } = resolveColorWithPlaceholder(gs, ctx, placeholder);
    stops.push({ position, color: colorWithAlphaCss(color, alpha) });
  }
  if (stops.length === 0) return ``;
  stops.sort((a, b) => a.position - b.position);
  const stopsCss = gradientStopsCss(stops);
  const lin = node.child(`lin`);
  if (lin.exists())
    return `linear-gradient(${((angleToDeg(lin.numAttr(`ang`) ?? 0) + 90) % 360).toFixed(1)}deg, ${stopsCss})`;
  const path = node.child(`path`);
  if (path.exists()) {
    const kind = path.attr(`path`);
    if (kind === `circle` || kind === `shape` || kind === `rect`) {
      const fillToRect = parseFillToRect(path);
      const { cx, cy } = fillToCenter(fillToRect);
      const compressed = gradientStopsCss(compressGradientStops({ stops, cx, cy, fillToRect }));
      return kind === `rect`
        ? `radial-gradient(closest-side at ${(cx * 100).toFixed(1)}% ${(cy * 100).toFixed(1)}%, ${compressed})`
        : `radial-gradient(ellipse at ${(cx * 100).toFixed(1)}% ${(cy * 100).toFixed(1)}%, ${compressed})`;
    }
  }
  return `linear-gradient(180deg, ${stopsCss})`;
}

/** 原 _n：fillToRect 四边千分比 → 0..1 */
export function parseFillToRect(pathNode: XmlNode): { l: number; t: number; r: number; b: number } | undefined {
  const rect = pathNode.child(`fillToRect`);
  if (rect.exists())
    return {
      l: (rect.numAttr(`l`) ?? 0) / 1e5,
      t: (rect.numAttr(`t`) ?? 0) / 1e5,
      r: (rect.numAttr(`r`) ?? 0) / 1e5,
      b: (rect.numAttr(`b`) ?? 0) / 1e5,
    };
}

/** 原 vn：fillToRect → 渐变中心 */
export function fillToCenter(rect?: { l: number; t: number; r: number; b: number }): { cx: number; cy: number } {
  return rect ? { cx: (rect.l + (1 - rect.r)) / 2, cy: (rect.t + (1 - rect.b)) / 2 } : { cx: 0.5, cy: 0.5 };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * 原 bn：rect 路径渐变的半径压缩系数。
 * OOXML rect 渐变从中心按 fillToRect 区域向外扩散，需把 stop 位置
 * 压缩到实际覆盖半径比例内。
 */
export function gradientRadiusFactor(
  data: { fillToRect?: { l: number; t: number; r: number; b: number }; cx?: number; cy?: number },
  options: { axis?: `x` | `y`; width?: number; height?: number } = {},
): number {
  const rect = data.fillToRect;
  if (!rect) return 0;
  const spanW = Math.max(0, 1 - rect.l - rect.r);
  const spanH = Math.max(0, 1 - rect.t - rect.b);
  if (spanW <= 0 && spanH <= 0) return 0;
  const cx = data.cx ?? 0.5;
  const cy = data.cy ?? 0.5;
  const farW = Math.max(Math.abs(cx), Math.abs(1 - cx));
  const farH = Math.max(Math.abs(cy), Math.abs(1 - cy));
  if (options.axis === `x`) return farW > 0 ? clamp01(spanW / 2 / farW) : 0;
  if (options.axis === `y`) return farH > 0 ? clamp01(spanH / 2 / farH) : 0;
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const spanPx = Math.hypot((spanW / 2) * width, (spanH / 2) * height);
  const farPx = Math.hypot(farW * width, farH * height);
  return farPx > 0 ? clamp01(spanPx / farPx) : 0;
}

/** 原 xn：按压缩系数重映射 stop 位置 */
export function compressGradientStops(
  data: { stops: GradientStop[]; fillToRect?: { l: number; t: number; r: number; b: number }; cx?: number; cy?: number },
  options: { axis?: `x` | `y`; width?: number; height?: number } = {},
): GradientStop[] {
  const factor = gradientRadiusFactor(data, options);
  return factor <= 0
    ? data.stops
    : data.stops.map((stop) => ({ ...stop, position: factor * 100 + stop.position * (1 - factor) }));
}

/** 原 Sn：stops → CSS 片段 */
export function gradientStopsCss(stops: GradientStop[]): string {
  return stops.map((stop) => `${stop.color} ${stop.position.toFixed(1)}%`).join(`, `);
}

/** 渐变数据模型（原 Cn）：供 SVG 渲染路径使用（背景/形状填充） */
export function parseGradientFillData(node: XmlNode, ctx: PptxRenderContext, placeholder?: XmlNode): GradientFillData | null {
  const stopsNode = node.child(`gsLst`);
  const stops: GradientStop[] = [];
  for (const gs of stopsNode.children(`gs`)) {
    const position = permilleToUnit(gs.numAttr(`pos`) ?? 0) * 100;
    const { color, alpha } = resolveColorWithPlaceholder(gs, ctx, placeholder);
    stops.push({ position, color: colorWithAlphaCss(color, alpha) });
  }
  if (stops.length === 0) return null;
  stops.sort((a, b) => a.position - b.position);
  const lin = node.child(`lin`);
  if (lin.exists())
    return { type: `linear`, stops, angle: angleToDeg(lin.numAttr(`ang`) ?? 0), colorInterpolation: `linearRGB` };
  const path = node.child(`path`);
  if (path.exists()) {
    const kind = path.attr(`path`);
    if (kind === `circle` || kind === `shape` || kind === `rect`) {
      const fillToRect = parseFillToRect(path);
      const { cx, cy } = fillToCenter(fillToRect);
      return { type: `radial`, stops, angle: 0, cx, cy, pathType: kind, fillToRect, colorInterpolation: `linearRGB` };
    }
  }
  return { type: `linear`, stops, angle: 0, colorInterpolation: `linearRGB` };
}

/** 从填充节点提取渐变数据，支持 grpFill 回退（原 wn） */
export function gradientFillDataFromFill(spPr: XmlNode, ctx: PptxRenderContext): GradientFillData | null {
  let grad = spPr.child(`gradFill`);
  !grad.exists() && spPr.child(`grpFill`).exists() && ctx.groupFillNode && (grad = ctx.groupFillNode.child(`gradFill`));
  return grad.exists() ? parseGradientFillData(grad, ctx) : null;
}

/* --- 线型解析（原 hn/gn，jsx 5793-5862） --- */

export interface ResolvedLineStyle {
  width: number;
  color: string;
  dash: string;
  dashKind: string;
}

/**
 * 原 hn：ln 节点 → 宽度/颜色/虚线。
 * 支持 lnRef（主题 lineStyles 索引）回退：phclr 占位符色、
 * 宽度缺省按主题线宽或 idx*0.75pt 推断。
 */
export function resolveLineStyle(line: XmlNode, ctx: PptxRenderContext, lineRef?: XmlNode): ResolvedLineStyle {
  let width = emuToPxLocal(line.numAttr(`w`) ?? 0);
  let color = `transparent`;
  const solid = line.child(`solidFill`);
  if (solid.exists()) {
    const scheme = solid.child(`schemeClr`);
    if (scheme.exists() && (scheme.attr(`val`) ?? ``).toLowerCase() === `phclr` && lineRef && lineRef.exists()) {
      const base = resolveColor(lineRef, ctx);
      const applied = applyColorTransforms(base.color.startsWith(`#`) ? base.color.slice(1) : base.color, parseTransformList(scheme));
      color = colorWithAlphaCss(applied.color, applied.alpha * base.alpha);
    } else {
      const resolved = resolveColor(solid, ctx);
      color = colorWithAlphaCss(resolved.color, resolved.alpha);
    }
  } else if (lineRef && lineRef.exists() && (lineRef.numAttr(`idx`) ?? 0) > 0) {
    const idx = lineRef.numAttr(`idx`) ?? 0;
    if (idx > 0 && ctx.theme.lineStyles && ctx.theme.lineStyles.length >= idx) {
      const themeLine = ctx.theme.lineStyles[idx - 1];
      width === 0 && (width = emuToPxLocal(themeLine.numAttr(`w`) ?? 0));
      const resolved = resolveColor(lineRef, ctx);
      color = colorWithAlphaCss(resolved.color, resolved.alpha);
    } else {
      const resolved = resolveColor(lineRef, ctx);
      color = colorWithAlphaCss(resolved.color, resolved.alpha);
      width === 0 && idx > 0 && (width = idx * 0.75);
    }
  }
  if (width === 0 && lineRef && lineRef.exists()) {
    const idx = lineRef.numAttr(`idx`) ?? 0;
    idx > 0 && ctx.theme.lineStyles && ctx.theme.lineStyles.length >= idx
      ? (width = emuToPxLocal(ctx.theme.lineStyles[idx - 1].numAttr(`w`) ?? 0))
      : idx > 0 && (width = idx * 0.75);
  }
  width === 0 && color !== `transparent` && !line.child(`noFill`).exists() && (width = 1);
  let dash = `solid`;
  let dashKind = `solid`;
  const prstDash = line.child(`prstDash`);
  if (prstDash.exists()) {
    const kind = prstDash.attr(`val`) || `solid`;
    dashKind = kind;
    dash = classifyDashKind(kind);
  }
  if (dash === `solid` && lineRef && lineRef.exists()) {
    const idx = lineRef.numAttr(`idx`) ?? 0;
    if (idx > 0 && ctx.theme.lineStyles && ctx.theme.lineStyles.length >= idx) {
      const themeDash = ctx.theme.lineStyles[idx - 1].child(`prstDash`);
      themeDash.exists() && ((dashKind = themeDash.attr(`val`) || `solid`), (dash = classifyDashKind(dashKind)));
    }
  }
  return { width, color, dash, dashKind };
}

/** 局部 EMU→px（避免与 types 循环引用，直接内联 914400/96 换算） */
function emuToPxLocal(emu: number): number {
  return (emu / 914400) * 96;
}

/** 原 gn：OOXML prstDash → CSS border 类别 */
export function classifyDashKind(kind: string): string {
  switch (kind) {
    case `solid`: return `solid`;
    case `dot`: case `sysDot`: return `dotted`;
    case `dash`: case `sysDash`: case `lgDash`: return `dashed`;
    case `dashDot`: case `lgDashDot`: case `lgDashDotDot`: case `sysDashDot`: case `sysDashDotDot`: return `dashed`;
    default: return `solid`;
  }
}

/* --- 主题填充样式（原 Tn/En/Dn，jsx 5968-6005） --- */

export interface ResolvedThemeFill {
  fillCss: string;
  gradientFillData: GradientFillData | null;
}

/** fillRef idx → theme.fillStyles（原 Tn） */
export function resolveThemeFill(fillRef: XmlNode, ctx: PptxRenderContext): ResolvedThemeFill {
  const idx = fillRef.numAttr(`idx`) ?? 0;
  return resolveThemeFillEntry(fillRef, ctx, ctx.theme.fillStyles, idx);
}

/** bgRef idx：>=1001 → bgFillStyles[idx-1000]，否则 fillStyles（原 En） */
export function resolveThemeBackgroundFill(bgRef: XmlNode, ctx: PptxRenderContext): ResolvedThemeFill {
  const idx = bgRef.numAttr(`idx`) ?? 0;
  return idx >= 1001
    ? resolveThemeFillEntry(bgRef, ctx, ctx.theme.bgFillStyles ?? [], idx - 1e3)
    : resolveThemeFillEntry(bgRef, ctx, ctx.theme.fillStyles, idx);
}

/** 原 Dn：按样式列表条目解析（越界回退为直接颜色） */
function resolveThemeFillEntry(ref: XmlNode, ctx: PptxRenderContext, styles: XmlNode[], idx: number): ResolvedThemeFill {
  if (idx <= 0 || (styles?.length ?? 0) < idx)
    return { fillCss: resolveColorCss(ref, ctx), gradientFillData: null };
  const entry = styles?.[idx - 1];
  if (!(entry != null && entry.exists()))
    return { fillCss: resolveColorCss(ref, ctx), gradientFillData: null };
  if (entry.localName === `solidFill`) {
    const resolved = resolveColorWithPlaceholder(entry, ctx, ref);
    return { fillCss: colorWithAlphaCss(resolved.color, resolved.alpha), gradientFillData: null };
  }
  if (entry.localName === `gradFill`)
    return { fillCss: gradientFillCss(entry, ctx, ref), gradientFillData: parseGradientFillData(entry, ctx, ref) };
  if (entry.localName === `pattFill`)
    return { fillCss: patternFillCss(entry, ctx, ref), gradientFillData: null };
  if (entry.localName === `noFill`) return { fillCss: `transparent`, gradientFillData: null };
  return { fillCss: resolveColorCss(ref, ctx), gradientFillData: null };
}

/* --- 渐变描边（原 On，jsx 6006-6035） --- */

export interface GradientLineData {
  stops: GradientStop[];
  angle: number;
  width: number;
  colorInterpolation: `linearRGB` | `sRGB`;
}

export function resolveGradientLine(line: XmlNode, ctx: PptxRenderContext): GradientLineData | null {
  const grad = line.child(`gradFill`);
  if (!grad.exists()) return null;
  const stopsNode = grad.child(`gsLst`);
  const stops: GradientStop[] = [];
  for (const gs of stopsNode.children(`gs`)) {
    const position = permilleToUnit(gs.numAttr(`pos`) ?? 0) * 100;
    const { color, alpha } = resolveColor(gs, ctx);
    stops.push({ position, color: colorWithAlphaCss(color, alpha) });
  }
  if (stops.length === 0) return null;
  stops.sort((a, b) => a.position - b.position);
  const lin = grad.child(`lin`);
  let angle = 0;
  lin.exists() && (angle = angleToDeg(lin.numAttr(`ang`) ?? 0));
  let width = emuToPxLocal(line.numAttr(`w`) ?? 0);
  width <= 0 && (width = 1);
  return { stops, angle, width, colorInterpolation: `linearRGB` };
}
