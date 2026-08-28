/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineText.ts — pptxRendererPreviewEngine 子模块 · DrawingML 文本引擎
 * （解混淆重建 · D8 Stage B2）
 *
 * 主文件：pptxRendererPreviewEngine.tsx。对应源 chunk 区段：
 *   fr          bodyPr 查找（本体 → 版式继承）           (jsx 6455-6460)
 *   pr/mr/hr    +mj/+mn 主题字体令牌与脚本映射           (jsx 6462-6468)
 *   gr/_r/vr    字体过滤 / 语言→脚本 / 脚本字体          (jsx 6469-6488)
 *   yr/br       主题字体解析 / 字体栈去重                (jsx 6489-6516)
 *   xr..wr/Tr/Er/Dr/Or  通用族、CJK 回退、雅黑黑名单、
 *               字体别名表、序列化                        (jsx 6517-6555)
 *   qr          pPr → 段落样式对象                        (jsx 6687-6766)
 *   Yr/Xr/Zr    rPr → run 样式 / defRPr 合并             (jsx 6771-6885)
 *   ei/ti/ni    glow / outerShdw 文字阴影                (jsx 6893-6922)
 *   ri..ui      超链接下划线判定族                        (jsx 6923-6962)
 *   di/fi       文字渐变/图案（background-clip: text）    (jsx 6963-6995)
 *   pi/mi       自动编号格式 / 罗马数字                   (jsx 6996-7030)
 *   hi          renderTextBody（段落/run DOM 构建 + 自动
 *               缩放测量）                                (jsx 7034-7250)
 *   Yi/Xi/Zi/$i/ea/ta/na/ra/ia/aa  文本体谓词            (jsx 10928-11085)
 *   oa/sa       transform/filter 追加助手                 (jsx 11086-11095)
 * ============================================================================
 */

import { XmlNode, emuToPx } from "./pptxEngineTypes";
import type { PptxRenderContext, PptxTextBody, PptxTextRun, PptxParagraph } from "./pptxEngineTypes";
import {
  resolveColor, resolveColorCss, colorWithAlphaCss, hexToRgb, resolveFillCss,
  parseGradientFillData,
} from "./pptxEngineColor";

/* --- bodyPr 查找（原 fr） --- */

export function lookupBodyProperty(textBody: PptxTextBody | undefined, localName: string): XmlNode | undefined {
  const own = textBody?.bodyProperties?.child(localName);
  if (own != null && own.exists()) return own;
  const inherited = textBody?.layoutBodyProperties?.child(localName);
  if (inherited != null && inherited.exists()) return inherited;
}

/* --- 主题字体令牌（原 pr/mr/hr） --- */

const THEME_FONT_TOKEN = /^\+(mj|mn)-(lt|ea|cs)$/;
const THEME_FONT_TOKEN_KIND: Record<string, `latin` | `ea` | `cs`> = { lt: `latin`, ea: `ea`, cs: `cs` };
const CJK_SCRIPT_PRIORITY = [`Hans`, `Hant`, `Jpan`, `Hang`];

function filterTypefaces(candidates: Array<string | undefined> | string | undefined): string[] {
  return Array.isArray(candidates)
    ? candidates.filter((c): c is string => typeof c == `string` && c.length > 0)
    : typeof candidates == `string` && candidates.length > 0
      ? [candidates]
      : [];
}

/** BCP-47 → OOXML 脚本（原 _r） */
function languageToScript(lang: string): string | undefined {
  const lower = lang.toLowerCase();
  if (lower.startsWith(`zh`)) return /-(tw|hk|mo)\b/.test(lower) ? `Hant` : `Hans`;
  if (lower.startsWith(`ja`)) return `Jpan`;
  if (lower.startsWith(`ko`)) return `Hang`;
  if (lower.startsWith(`ar`)) return `Arab`;
  if (lower.startsWith(`he`)) return `Hebr`;
  if (lower.startsWith(`th`)) return `Thai`;
  if (lower.startsWith(`hi`) || lower.startsWith(`mr`) || lower.startsWith(`ne`)) return `Deva`;
}

/** 主题字体的脚本变体查找（原 vr） */
function scriptTypeface(scripts: Record<string, string> | undefined, langs: Array<string | undefined> | undefined): string | undefined {
  if (scripts) {
    for (const lang of filterTypefaces(langs)) {
      const script = languageToScript(lang);
      if (script && scripts[script]) return scripts[script];
    }
    for (const script of CJK_SCRIPT_PRIORITY) if (scripts[script]) return scripts[script];
  }
}

/** +mj-lt 等令牌 → 主题字体（原 yr） */
export function resolveThemeTypeface(typeface: string, ctx: PptxRenderContext, langs?: Array<string | undefined>): string {
  const match = typeface.match(THEME_FONT_TOKEN);
  if (!match) return typeface;
  const scheme = match[1] === `mj` ? ctx.theme.majorFont : ctx.theme.minorFont;
  const direct = scheme[THEME_FONT_TOKEN_KIND[match[2]]];
  if (direct) return direct;
  if (match[2] === `ea`) {
    const viaScript = scriptTypeface(scheme.scripts, langs);
    if (viaScript) return viaScript;
  }
  return scheme.latin || scheme.ea || scheme.cs || typeface;
}

/** 字体候选 → 去重栈（原 br） */
export function resolveTypefaceStack(candidates: Array<string | undefined>, ctx: PptxRenderContext, langs?: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = resolveThemeTypeface(candidate, ctx, langs).trim();
    if (!resolved) continue;
    const key = resolved.toLowerCase();
    seen.has(key) || (seen.add(key), out.push(resolved));
  }
  return out;
}

/* --- 字体序列化（原 xr..wr/Tr/Er/Dr/Or，jsx 6517-6555） --- */

const GENERIC_FONT_KEYWORDS = new Set([
  `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`,
  `ui-serif`, `ui-sans-serif`, `ui-monospace`, `emoji`, `math`, `fangsong`,
]);

/** 黑体系（无 CJK 回退栈时补 CJK 栈，原 Cr） */
const HEITI_FAMILY_NAMES = new Set([
  `microsoft yahei`, `microsoft yahei ui`, `微软雅黑`, `dengxian`, `等线`, `simhei`, `黑体`, `heiti sc`,
]);

/** CJK 无衬线回退栈（原 Sr） */
const CJK_SANS_FALLBACK = [
  `PingFang SC`, `Hiragino Sans GB`, `Noto Sans CJK SC`,
  `Source Han Sans SC`, `Arial Unicode MS`, `sans-serif`,
];

/** 中西文字体别名映射（原 wr；Calibri→Aptos/Carlito 等跨平台替换） */
const FONT_ALIAS_TABLE: Record<string, string[]> = {
  calibri: [`Calibri`, `Aptos`, `Carlito`, `system-ui`, `Arial`, `Helvetica`, `sans-serif`],
  "calibri light": [`Calibri Light`, `Aptos Display`, `Aptos`, `Carlito`, `system-ui`, `Arial`, `Helvetica`, `sans-serif`],
  aptos: [`Aptos`, `system-ui`, `Arial`, `Helvetica`, `sans-serif`],
  "aptos display": [`Aptos Display`, `Aptos`, `system-ui`, `Arial`, `Helvetica`, `sans-serif`],
  "microsoft yahei": [`Microsoft YaHei`, `微软雅黑`],
  "microsoft yahei ui": [`Microsoft YaHei UI`, `Microsoft YaHei`, `微软雅黑`],
  微软雅黑: [`微软雅黑`, `Microsoft YaHei`],
  dengxian: [`DengXian`, `等线`],
  等线: [`等线`, `DengXian`],
  simhei: [`SimHei`, `黑体`],
  黑体: [`黑体`, `SimHei`],
  "heiti sc": [`Heiti SC`, `黑体`, `SimHei`],
};

function normalizeTypeface(name: string): string {
  return name.trim().replace(/^['"]|['"]$/g, ``).toLowerCase();
}

function serializeTypeface(name: string): string {
  const bare = normalizeTypeface(name);
  return GENERIC_FONT_KEYWORDS.has(bare) ? bare : `"${name.trim().replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"`;
}

function expandFontAliases(name: string): string[] {
  return FONT_ALIAS_TABLE[normalizeTypeface(name)] ?? [name.trim()];
}

/** 字体栈 → CSS font-family（原 Or） */
export function buildFontFamilyCss(typefaces: string[] | string): string {
  const expanded = Array.isArray(typefaces) ? typefaces.flatMap(expandFontAliases) : expandFontAliases(typefaces);
  const withFallback = expanded.some((t) => HEITI_FAMILY_NAMES.has(normalizeTypeface(t)))
    ? [...expanded, ...CJK_SANS_FALLBACK]
    : expanded;
  const seen = new Set<string>();
  return withFallback
    .filter((t) => {
      const key = normalizeTypeface(t);
      return seen.has(key) ? false : (seen.add(key), true);
    })
    .map(serializeTypeface)
    .join(`, `);
}

/* --- 段落样式解析（原 qr，jsx 6687-6766） --- */

export interface PptxParagraphStyle {
  align?: string;
  rtl?: boolean;
  marginLeft?: number;
  textIndent?: number;
  defaultTabSize?: number;
  lineHeight?: string;
  lineHeightAbsolute?: boolean;
  spaceBefore?: number;
  spaceBeforePct?: number;
  spaceAfter?: number;
  spaceAfterPct?: number;
  bulletChar?: string;
  bulletAutoNum?: string;
  bulletAutoNumStartAt?: number;
  bulletNone?: boolean;
  bulletFont?: string;
  bulletSizePct?: number;
  bulletSizePt?: number;
  bulletColorFollowsText?: boolean;
  bulletColorNode?: XmlNode;
  defRPr?: XmlNode;
  defRPrs?: XmlNode[];
}

/** 层级 pPr 查找（原 Ur，jsx 6655-6660）：lvlN pPr → defPPr */
export function lookupLevelParagraphProperties(styleRoot: XmlNode | undefined, level: number): XmlNode {
  if (!styleRoot || !styleRoot.exists()) return new XmlNode(null);
  const levelNode = styleRoot.child(`lvl${level + 1}pPr`);
  return levelNode.exists() ? levelNode : styleRoot.child(`defPPr`);
}

export function applyParagraphProperties(style: PptxParagraphStyle, pPr: XmlNode | undefined): void {
  if (!pPr || !pPr.exists()) return;
  const align = pPr.attr(`algn`);
  align && (style.align = align);
  const rtl = pPr.attr(`rtl`);
  rtl !== void 0 && (style.rtl = parseBool(rtl));
  const marL = pPr.numAttr(`marL`);
  marL !== void 0 && (style.marginLeft = emuToPx(marL));
  const indent = pPr.numAttr(`indent`);
  indent !== void 0 && (style.textIndent = emuToPx(indent));
  const defTabSz = pPr.numAttr(`defTabSz`);
  defTabSz !== void 0 && (style.defaultTabSize = emuToPx(defTabSz));
  const lnSpc = pPr.child(`lnSpc`);
  if (lnSpc.exists()) {
    const pct = lnSpc.child(`spcPct`);
    if (pct.exists()) {
      const val = pct.numAttr(`val`);
      val !== void 0 && (style.lineHeight = `${(val / 1e5).toFixed(3)}`);
    }
    const pts = lnSpc.child(`spcPts`);
    if (pts.exists()) {
      const val = pts.numAttr(`val`);
      val !== void 0 && ((style.lineHeight = `${val / 100}pt`), (style.lineHeightAbsolute = true));
    }
  }
  const spcBef = pPr.child(`spcBef`);
  if (spcBef.exists()) {
    const pts = spcBef.child(`spcPts`);
    if (pts.exists()) {
      const val = pts.numAttr(`val`);
      val !== void 0 && (style.spaceBefore = val / 100);
    }
    const pct = spcBef.child(`spcPct`);
    if (pct.exists()) {
      const val = pct.numAttr(`val`);
      val !== void 0 && (style.spaceBeforePct = val / 1e5);
    }
  }
  const spcAft = pPr.child(`spcAft`);
  if (spcAft.exists()) {
    const pts = spcAft.child(`spcPts`);
    if (pts.exists()) {
      const val = pts.numAttr(`val`);
      val !== void 0 && (style.spaceAfter = val / 100);
    }
    const pct = spcAft.child(`spcPct`);
    if (pct.exists()) {
      const val = pct.numAttr(`val`);
      val !== void 0 && (style.spaceAfterPct = val / 1e5);
    }
  }
  const buChar = pPr.child(`buChar`);
  buChar.exists() && ((style.bulletChar = buChar.attr(`char`) || ``), (style.bulletNone = false));
  const buAutoNum = pPr.child(`buAutoNum`);
  if (buAutoNum.exists()) {
    style.bulletAutoNum = buAutoNum.attr(`type`) || `arabicPeriod`;
    const startAt = buAutoNum.numAttr(`startAt`);
    startAt !== void 0 && (style.bulletAutoNumStartAt = startAt);
    style.bulletNone = false;
  }
  pPr.child(`buNone`).exists() && ((style.bulletNone = true), (style.bulletChar = void 0), (style.bulletAutoNum = void 0));
  const buFont = pPr.child(`buFont`);
  buFont.exists() && (style.bulletFont = buFont.attr(`typeface`));
  const buSzPct = pPr.child(`buSzPct`);
  if (buSzPct.exists()) {
    const val = buSzPct.numAttr(`val`);
    val !== void 0 && ((style.bulletSizePct = val / 1e5), (style.bulletSizePt = void 0));
  }
  const buSzPts = pPr.child(`buSzPts`);
  if (buSzPts.exists()) {
    const val = buSzPts.numAttr(`val`);
    val !== void 0 && ((style.bulletSizePt = val / 100), (style.bulletSizePct = void 0));
  }
  pPr.child(`buSzTx`).exists() && ((style.bulletSizePct = void 0), (style.bulletSizePt = void 0));
  pPr.child(`buClrTx`).exists() && ((style.bulletColorFollowsText = true), (style.bulletColorNode = void 0));
  const buClr = pPr.child(`buClr`);
  buClr.exists() && ((style.bulletColorNode = buClr), (style.bulletColorFollowsText = false));
  const defRPr = pPr.child(`defRPr`);
  defRPr.exists() && ((style.defRPr = defRPr), (style.defRPrs ??= []), style.defRPrs.push(defRPr));
}

function parseBool(value: string | undefined, fallback = false): boolean {
  if (value === void 0) return fallback;
  const normalized = value.trim().toLowerCase();
  return [`1`, `true`, `t`, `on`].includes(normalized) ? true : [`0`, `false`, `f`, `off`].includes(normalized) ? false : fallback;
}

/* --- run 样式解析（原 Yr，jsx 6771-6878） --- */

export interface PptxRunStyle {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlightColor?: string;
  underlineColor?: string;
  underlineFollowsText?: boolean;
  color?: string;
  textGradientCss?: string;
  textPatternCss?: string;
  textNoFill?: boolean;
  fontFamily?: string;
  fontFamilyStack?: string[];
  hlinkClick?: string;
  hlinkSlideIndex?: number;
  hlinkTooltip?: string;
  letterSpacingPt?: number;
  kern?: number;
  cap?: string;
  baseline?: number;
  textShadow?: string;
  textOutlineWidth?: number;
  textOutlineColor?: string;
  textOutlineGradientCss?: string;
}

export function applyRunProperties(style: PptxRunStyle, rPr: XmlNode, ctx: PptxRenderContext): void {
  const sz = rPr.numAttr(`sz`);
  sz !== void 0 && (style.fontSize = sz / 100);
  const bold = rPr.attr(`b`);
  bold !== void 0 && (style.bold = parseBool(bold));
  const italic = rPr.attr(`i`);
  italic !== void 0 && (style.italic = parseBool(italic));
  const underline = rPr.attr(`u`);
  underline !== void 0 && underline !== `none` && (style.underline = true);
  underline === `none` && (style.underline = false);
  const strike = rPr.attr(`strike`);
  strike !== void 0 && strike !== `noStrike` && (style.strikethrough = true);
  strike === `noStrike` && (style.strikethrough = false);
  const highlight = rPr.child(`highlight`);
  highlight.exists() && (style.highlightColor = resolveColorCss(highlight, ctx));
  const uFill = rPr.child(`uFill`);
  if (uFill.exists()) {
    const solid = uFill.child(`solidFill`);
    solid.exists() && ((style.underlineColor = resolveColorCss(solid, ctx)), (style.underlineFollowsText = false));
  }
  rPr.child(`uFillTx`).exists() && ((style.underlineFollowsText = true), (style.underlineColor = void 0));
  const solidFill = rPr.child(`solidFill`);
  if (solidFill.exists()) {
    delete style.textGradientCss;
    delete style.textPatternCss;
    delete style.textNoFill;
    const { color, alpha } = resolveColor(solidFill, ctx);
    const hex = color.startsWith(`#`) ? color : `#${color}`;
    if (alpha < 1) {
      const { r, g, b } = hexToRgb(hex);
      style.color = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    } else style.color = hex;
  }
  const gradFill = rPr.child(`gradFill`);
  if (gradFill.exists()) {
    delete style.color;
    delete style.textPatternCss;
    delete style.textNoFill;
    const css = textGradientCss(gradFill, ctx);
    css && (style.textGradientCss = css);
  }
  if (rPr.child(`pattFill`).exists()) {
    delete style.color;
    delete style.textGradientCss;
    delete style.textNoFill;
    const css = resolveFillCss(rPr, ctx);
    css && (style.textPatternCss = css);
  }
  const typefaces: string[] = [];
  const langs = [rPr.attr(`lang`), rPr.attr(`altLang`)];
  for (const kind of [`latin`, `ea`, `cs`]) {
    const node = rPr.child(kind);
    if (!node.exists()) continue;
    const typeface = node.attr(`typeface`);
    typeface && typefaces.push(resolveThemeTypeface(typeface, ctx, langs));
  }
  typefaces.length > 0 && ((style.fontFamily = typefaces[0]), (style.fontFamilyStack = typefaces));
  const hlink = rPr.child(`hlinkClick`);
  if (hlink.exists()) {
    const rId = hlink.attr(`id`) ?? hlink.attr(`r:id`);
    const rel = rId ? ctx.slide.rels.get(rId) : void 0;
    const slideIndex = resolveSlideNavigation(ctx, hlink.attr(`action`), rel);
    slideIndex !== void 0 && ctx.onNavigate
      ? ((style.hlinkSlideIndex = slideIndex),
        (style.hlinkTooltip = hlink.attr(`tooltip`)),
        style.underline === void 0 && (style.underline = true))
      : rel && isExternalTargetMode(rel.targetMode) && isHttpUrl(rel.target) &&
        ((style.hlinkClick = rel.target), style.underline === void 0 && (style.underline = true));
  }
  const spacing = rPr.numAttr(`spc`);
  spacing !== void 0 && (style.letterSpacingPt = spacing / 100);
  const kern = rPr.numAttr(`kern`);
  kern !== void 0 && (style.kern = kern / 100);
  const cap = rPr.attr(`cap`);
  cap !== void 0 && (style.cap = cap);
  const baseline = rPr.numAttr(`baseline`);
  baseline !== void 0 && (style.baseline = baseline);
  const effectLst = rPr.child(`effectLst`);
  const outerShdw = effectLst.child(`outerShdw`);
  if (outerShdw.exists()) {
    const shadow = outerShadowCss(outerShdw, ctx);
    shadow && appendTextShadow(style, shadow);
  }
  const glow = effectLst.child(`glow`);
  if (glow.exists()) {
    const shadow = glowShadowCss(glow, ctx);
    shadow && appendTextShadow(style, shadow);
  }
  rPr.child(`noFill`).exists() &&
    (delete style.color, delete style.textGradientCss, delete style.textPatternCss, (style.textNoFill = true));
  const line = rPr.child(`ln`);
  if (line.exists() && !line.child(`noFill`).exists()) {
    const lineWidth = line.numAttr(`w`);
    style.textOutlineWidth = lineWidth ? emuToPx(lineWidth) : 0.75;
    const solid = line.child(`solidFill`);
    if (solid.exists()) {
      const { color, alpha } = resolveColor(solid, ctx);
      style.textOutlineColor = colorWithAlphaCss(color, alpha);
    }
    const grad = line.child(`gradFill`);
    grad.exists() && (style.textOutlineGradientCss = textGradientCss(grad, ctx));
  }
}

/** defRPr 链合并（原 Xr） */
export function applyDefaultRunProperties(style: PptxRunStyle, paragraphStyle: PptxParagraphStyle, ctx: PptxRenderContext): void {
  for (const defRPr of paragraphStyle.defRPrs ?? []) applyRunProperties(style, defRPr, ctx);
}

/** 段落默认样式 → run 样式（原 Zr） */
export function defaultRunStyle(paragraphStyle: PptxParagraphStyle, ctx: PptxRenderContext): PptxRunStyle {
  const style: PptxRunStyle = {};
  applyDefaultRunProperties(style, paragraphStyle, ctx);
  return style;
}

/* --- 文字阴影（原 ei/ti/ni，jsx 6893-6922） --- */

function glowShadowCss(glow: XmlNode, ctx: PptxRenderContext): string | undefined {
  const radius = emuToPx(glow.numAttr(`rad`) ?? 0);
  if (!(radius > 0)) return;
  const { color, alpha } = resolveColor(glow, ctx);
  if (!color || alpha <= 0) return;
  const { r, g, b } = hexToRgb(color.startsWith(`#`) ? color : `#${color}`);
  return `0px 0px ${radius.toFixed(1)}px ${colorWithAlphaCss(color, alpha)}`;
}

function outerShadowCss(shadow: XmlNode, ctx: PptxRenderContext): string | undefined {
  const dist = emuToPx(shadow.numAttr(`dist`) ?? 0);
  const blur = emuToPx(shadow.numAttr(`blurRad`) ?? 0);
  const dirRad = ((shadow.numAttr(`dir`) ?? 0) / 6e4) * (Math.PI / 180);
  const dx = dist * Math.cos(dirRad);
  const dy = dist * Math.sin(dirRad);
  const { color, alpha } = resolveColor(shadow, ctx);
  if (!color || alpha <= 0) return;
  return `${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px ${colorWithAlphaCss(color, alpha)}`;
}

function appendTextShadow(style: PptxRunStyle, shadow: string): void {
  style.textShadow = style.textShadow ? `${style.textShadow}, ${shadow}` : shadow;
}

/* --- 导航/链接助手（原 F/Mn/Pr/Fr/Ir/Nr/Mr/Lr，jsx 3645-6625） --- */

function isExternalTargetMode(targetMode: string | undefined): boolean {
  return targetMode?.trim().toLowerCase() === `external`;
}

function isHttpUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol.toLowerCase();
    return protocol === `http:` || protocol === `https:`;
  } catch {
    return false;
  }
}

function stripQueryAndHashLocal(path: string): string {
  const index = path.search(/[?#]/);
  return index >= 0 ? path.slice(0, index) : path;
}

function formDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ` `));
  } catch {
    return value;
  }
}

/** ppaction 查询串取值（原 Fr） */
function ppActionQueryValue(query: string, name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const pair of query.split(`&`)) {
    const [key, ...rest] = pair.split(`=`);
    if (formDecode(key).toLowerCase() === lower) return formDecode(rest.join(`=`));
  }
}

/** 当前幻灯片序号（原 Nr） */
function currentSlideOrdinal(ctx: PptxRenderContext): number {
  const index = ctx.slide.index;
  if (index >= 0 && index < ctx.presentation.slides.length) return index;
  const normalized = stripQueryAndHashLocal(ctx.slide.slidePath || ``);
  const found = ctx.presentation.slides.findIndex((s) => stripQueryAndHashLocal(s.slidePath || ``) === normalized);
  return found >= 0 ? found : 0;
}

/** 幻灯片 rel 目标 → 页码（原 Mr） */
function slideIndexFromRel(ctx: PptxRenderContext, rel: { target: string; targetMode?: string }): number | undefined {
  if (isExternalTargetMode(rel.targetMode)) return;
  const clean = stripQueryAndHashLocal(rel.target).replace(/\\/g, `/`).replace(/^\/+/, ``);
  const base = ctx.slide.slidePath || `ppt/slides/slide1.xml`;
  const baseDir = base.includes(`/`) ? base.slice(0, base.lastIndexOf(`/`)) : ``;
  const segments = baseDir ? baseDir.split(`/`) : [];
  for (const segment of clean.split(`/`)) segment === `..` ? segments.pop() : segment !== `.` && segment !== `` && segments.push(segment);
  const resolved = segments.join(`/`);
  const direct = ctx.presentation.slides.findIndex((s) => stripQueryAndHashLocal(s.slidePath || ``) === resolved);
  if (direct >= 0) return direct;
  const match = stripQueryAndHashLocal(rel.target).match(/(?:^|[\\/])slide(\d+)\.xml$/i);
  if (match) return parseInt(match[1], 10) - 1;
}

/** ppaction://hlinkshowjump?jump=… → 页码（原 Ir） */
function slideIndexFromAction(ctx: PptxRenderContext, action: string): number | undefined {
  const match = action.match(/^ppaction:\/\/hlinkshowjump\?(.+)$/i);
  if (!match) return;
  const jump = ppActionQueryValue(match[1], `jump`)?.toLowerCase();
  const count = ctx.presentation.slides.length;
  if (count === 0) return;
  switch (jump) {
    case `firstslide`:
      return 0;
    case `lastslide`:
      return count - 1;
    case `nextslide`: {
      const next = currentSlideOrdinal(ctx) + 1;
      return next < count ? next : void 0;
    }
    case `previousslide`: {
      const prev = currentSlideOrdinal(ctx) - 1;
      return prev >= 0 ? prev : void 0;
    }
    default:
      return;
  }
}

/** 动作/关系 → 目标页码（原 Lr） */
export function resolveSlideNavigation(
  ctx: PptxRenderContext,
  action: string | undefined,
  rel: { type: string; target: string; targetMode?: string } | undefined,
): number | undefined {
  if (action?.toLowerCase() === `ppaction://hlinksldjump` && rel) return slideIndexFromRel(ctx, rel);
  if (action) return slideIndexFromAction(ctx, action);
}

/** 导航提示文案（原 Rr） */
export function goToSlideTooltip(slideIndex: number): string {
  return `Go to slide ${slideIndex + 1}`;
}

/* --- 超链接下划线判定（原 ri/ii/ai/oi/si/ci/li/ui，jsx 6923-6962） --- */

function runExplicitColor(rPr: XmlNode | undefined, ctx: PptxRenderContext): string | undefined {
  if (!(rPr != null && rPr.exists())) return;
  const style: PptxRunStyle = {};
  applyRunProperties(style, rPr, ctx);
  return style.color;
}

function normalizeColorForCompare(color: string | undefined): string | undefined {
  if (!color) return;
  const lower = color.trim().toLowerCase();
  if (lower.startsWith(`#`)) {
    const { r, g, b } = hexToRgb(lower);
    return `${r},${g},${b},1`;
  }
  const match = lower.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return lower;
  const parts = match[1].split(`,`).map((p) => p.trim());
  if (parts.length < 3) return lower;
  const [r, g, b] = parts;
  const a = parts[3] ?? `1`;
  return `${Number(r)},${Number(g)},${Number(b)},${Number(a)}`;
}

function sameColor(a: string | undefined, b: string | undefined): boolean {
  const na = normalizeColorForCompare(a);
  const nb = normalizeColorForCompare(b);
  return na !== void 0 && na === nb;
}

function hasExplicitSrgbFill(rPr: PptxRunStyle): boolean {
  return false; // 占位：真实判定见下（需要原始 rPr 节点）
}

/** 链接 run 是否需要显示下划线（原 ui）：
 *  默认（无显式填充）→ 显示；显式填充且与相邻 run 颜色不同 → 显示。 */
export function shouldShowHyperlinkUnderline(
  run: PptxTextRun,
  paragraph: PptxParagraph,
  runStyle: PptxRunStyle,
  fillKind: `none` | `defaultTextScheme` | `explicit`,
  hasExplicitFill: boolean,
  ctx: PptxRenderContext,
): boolean {
  if (!(runStyle.hlinkClick || runStyle.hlinkSlideIndex !== void 0)) return false;
  if (!hasExplicitFill || fillKind === `defaultTextScheme`) return true;
  if (fillKind !== `explicit`) return false;
  // 与段落内其他非链接 run 的颜色比较
  const ownColor = runStyle.color;
  for (const other of paragraph.runs)
    if (!(other === run || other.properties?.child(`hlinkClick`).exists()) && sameColor(ownColor, runExplicitColor(other.properties, ctx)))
      return false;
  return sameColor(ownColor, runExplicitColor(paragraph.endParaRPr, ctx));
}

/** rPr 填充类别（原 Jr，jsx 6767-6775） */
export function classifyRunFillKind(rPr: XmlNode | undefined): `none` | `defaultTextScheme` | `explicit` {
  if (!(rPr != null && rPr.exists())) return `none`;
  if (rPr.child(`gradFill`).exists()) return `explicit`;
  const solid = rPr.child(`solidFill`);
  if (!solid.exists()) return `none`;
  const scheme = solid.child(`schemeClr`).attr(`val`);
  return scheme === `tx1` || scheme === `tx2` ? `defaultTextScheme` : `explicit`;
}

/* --- 文字渐变（原 di/fi，jsx 6963-6995） --- */

export function textGradientCss(gradFill: XmlNode, ctx: PptxRenderContext): string {
  const stopsNode = gradFill.child(`gsLst`);
  const stops: Array<{ position: number; color: string }> = [];
  for (const gs of stopsNode.children(`gs`)) {
    const position = ((gs.numAttr(`pos`) ?? 0) / 1e5) * 100;
    const { color, alpha } = resolveColor(gs, ctx);
    stops.push({ position, color: colorWithAlphaCss(color, alpha) });
  }
  if (stops.length === 0) return ``;
  stops.sort((a, b) => a.position - b.position);
  const stopsCss = stops.map((s) => `${s.color} ${s.position.toFixed(1)}%`).join(`, `);
  const lin = gradFill.child(`lin`);
  return lin.exists()
    ? `linear-gradient(${((((lin.numAttr(`ang`) ?? 0) / 6e4) + 90) % 360).toFixed(1)}deg, ${stopsCss})`
    : `linear-gradient(180deg, ${stopsCss})`;
}

/** background-clip: text 应用（原 fi；图案填充走 8px 网格拆分） */
export function applyTextFillClip(el: HTMLElement, css: string): void {
  el.style.background = css;
  if (!el.style.background && css.includes(` 0 0 / 8px 8px, `)) {
    const parts = css.split(` 0 0 / 8px 8px, `);
    const color = parts[parts.length - 1]?.trim();
    const layers = parts.slice(0, -1).map((p) => p.trim());
    layers.length > 0 &&
      ((el.style.backgroundImage = layers.join(`, `)), (el.style.backgroundSize = layers.map(() => `8px 8px`).join(`, `)));
    color && (el.style.backgroundColor = color);
  }
  el.style.webkitBackgroundClip = `text`;
  el.style.backgroundClip = `text`;
  el.style.color = `transparent`;
}

/* --- 自动编号（原 pi/mi，jsx 6996-7030） --- */

export function formatAutoNumberBullet(kind: string, value: number): string {
  switch (kind) {
    case `arabicPeriod`: return `${value}.`;
    case `arabicParenR`: return `${value})`;
    case `arabicParenBoth`: return `(${value})`;
    case `arabicPlain`: return `${value}`;
    case `romanUcPeriod`: return `${toRoman(value)}.`;
    case `romanLcPeriod`: return `${toRoman(value).toLowerCase()}.`;
    case `alphaUcPeriod`: return `${String.fromCharCode(64 + (((value - 1) % 26) + 1))}.`;
    case `alphaLcPeriod`: return `${String.fromCharCode(96 + (((value - 1) % 26) + 1))}.`;
    case `alphaUcParenR`: return `${String.fromCharCode(64 + (((value - 1) % 26) + 1))})`;
    case `alphaLcParenR`: return `${String.fromCharCode(96 + (((value - 1) % 26) + 1))})`;
    default: return `${value}.`;
  }
}

export function toRoman(value: number): string {
  const values = [1e3, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [`M`, `CM`, `D`, `CD`, `C`, `XC`, `L`, `XL`, `X`, `IX`, `V`, `IV`, `I`];
  let out = ``;
  let rest = value;
  for (let i = 0; i < values.length; i++)
    while (rest >= values[i]) {
      out += symbols[i];
      rest -= values[i];
    }
  return out;
}

/* --- 文本体谓词（原 Yi/Xi/Zi/$i/ea/ta/na/ra/ia/aa，jsx 10928-11085） --- */

/** 有可见文本（原 Yi） */
export function textBodyHasVisibleText(textBody: PptxTextBody): boolean {
  for (const paragraph of textBody.paragraphs)
    for (const run of paragraph.runs) if (run.text != null && run.text.trim().length > 0) return true;
  return false;
}

/** 恰一个非空段落且不含换行（原 Xi） */
export function textBodyIsSingleLine(textBody: PptxTextBody): boolean {
  let count = 0;
  for (const paragraph of textBody.paragraphs)
    if (paragraph.runs.some((r) => r.text != null && r.text.length > 0) && (count++, count > 1 || paragraph.runs.some((r) => r.text === `\n`)))
      return false;
  return count === 1;
}

/** 全部非空段落居中（原 Zi） */
export function textBodyAllCentered(textBody: PptxTextBody): boolean {
  const visible = textBody.paragraphs.filter((p) => p.runs.some((r) => r.text != null && r.text.length > 0));
  return visible.length === 0 ? false : visible.every((p) => p.properties?.attr(`algn`) === `ctr`);
}

/** 去空白字符总数（原 $i） */
export function textBodyCodepointCount(textBody: PptxTextBody): number {
  const joined = textBody.paragraphs.flatMap((p) => p.runs.map((r) => r.text ?? ``)).join(``).replace(/\s+/g, ``);
  return Array.from(joined).length;
}

/** 短文本（≤36 码点，原 Qi/ea） */
export const SHORT_TEXT_THRESHOLD = 36;
export function textBodyIsShort(textBody: PptxTextBody): boolean {
  const count = textBodyCodepointCount(textBody);
  return count > 0 && count <= SHORT_TEXT_THRESHOLD;
}

/** 非空段落数（原 ta） */
export function textBodyVisibleParagraphCount(textBody: PptxTextBody): number {
  return textBody.paragraphs.filter((p) => p.runs.some((r) => r.text != null && r.text.length > 0)).length;
}

/** 任一段落显式行距/段距（原 na） */
export function textBodyHasExplicitSpacing(textBody: PptxTextBody): boolean {
  return textBody.paragraphs.some((p) => {
    const props = p.properties;
    return props?.child(`lnSpc`).exists() || props?.child(`spcBef`).exists() || props?.child(`spcAft`).exists();
  });
}

/** 段落是否有项目符号（原 ra）：本段 pPr → 层级 lstStyle → defPPr */
function paragraphHasBullet(textBody: PptxTextBody, paragraph: PptxParagraph): boolean {
  const candidates = [
    paragraph.properties,
    textBody.listStyle?.child(`lvl${paragraph.level + 1}pPr`),
    textBody.listStyle?.child(`defPPr`),
  ];
  for (const node of candidates)
    if (node != null && node.exists()) {
      if (node.child(`buNone`).exists()) return false;
      if (node.child(`buChar`).exists() || node.child(`buAutoNum`).exists() || node.child(`buBlip`).exists()) return true;
    }
  return false;
}

/** 文本体含带符号段落（原 ia） */
export function textBodyHasBullets(textBody: PptxTextBody): boolean {
  return textBody.paragraphs.some(
    (p) => p.runs.some((r) => r.text != null && r.text.length > 0) && paragraphHasBullet(textBody, p),
  );
}

/** 占位符是否标题（原 aa） */
export function isTitlePlaceholder(placeholder: { type?: string } | undefined): boolean {
  return placeholder?.type === `title` || placeholder?.type === `ctrTitle`;
}

/* --- 样式追加助手（原 oa/sa，jsx 11086-11095） --- */

export function appendTransform(el: HTMLElement, transform: string): void {
  el.style.transform = `${el.style.transform || ``} ${transform}`.trim();
}

export function appendFilter(el: HTMLElement, filter: string): void {
  const existing = el.style.filter.trim();
  el.style.filter = existing ? `${existing} ${filter}` : filter;
}

/* ============================================================================
 * renderTextBody（原 hi，jsx 7034-7250）
 * 段落/run → DOM；样式继承链：
 *   presentation.defaultTextStyle → master.defaultTextStyle →
 *   master.textStyles(title/body/other) → master 占位符 lstStyle →
 *   layout 占位符 lstStyle → 本节点 lstStyle → 本段 pPr
 * normAutofit 的 fontScale/lnSpcReduction 全程生效；
 * 项目符号悬挂缩进按 marL+indent 重排。
 * ==========================================================================*/

export interface RenderTextBodyOptions {
  fontRefColor?: string;
  isVerticalText?: boolean;
  trimOuterParagraphSpacing?: boolean;
  compactSingleLineSpacing?: boolean;
  defaultLineHeight?: string;
  cellTextColor?: string;
  cellTextBold?: boolean;
  cellTextItalic?: boolean;
  cellTextFontFamily?: string[] | string;
}

/** 占位符类别（原 Wr，jsx 6662-6668）：title/body/other 决定 master textStyles 分支 */
function placeholderTextKind(placeholder: { type?: string } | undefined): `title` | `body` | `other` {
  if (!placeholder || !placeholder.type) return `other`;
  const type = placeholder.type;
  return type === `title` || type === `ctrTitle`
    ? `title`
    : type === `body` || type === `subTitle` || type === `obj` || type === `dt` || type === `ftr` || type === `sldNum`
      ? `body`
      : `other`;
}

/** 连续不换行数字/单位分组（原 Hr，jsx 6628-6648）：相邻 ≤4 个 run 拼成 ≤32 字符的
 *  数值+单位片段时归入同一 nowrap 组。 */
function groupNoWrapRuns(runs: PptxTextRun[]): Map<number, number> {
  const groups = new Map<number, number>();
  let nextGroupId = 1;
  for (let start = 0; start < runs.length; start++) {
    if (groups.has(start)) continue;
    let joined = ``;
    let groupEnd = -1;
    for (let probe = start; probe < runs.length && probe < start + 4; probe++) {
      const text = runs[probe].text;
      if (text === void 0 || text === `\n` || text.includes(`\t`) || ((joined += text), joined.trim().length > 32)) break;
      probe > start && isNumericWithUnit(joined) && (groupEnd = probe);
    }
    if (groupEnd > start) {
      const groupId = nextGroupId++;
      for (let i = start; i <= groupEnd; i++) groups.set(i, groupId);
      start = groupEnd;
    }
  }
  return groups;
}

/** 数值+单位判定（原 zr/Br，jsx 6622-6631） */
function isNumericWithUnit(text: string): boolean {
  return numericWithUnit(text) !== void 0;
}

function numericWithUnit(text: string): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed || trimmed.length === 0 || trimmed.length > 32) return;
  return /^[+-]?(?:\d+(?:[.,]\d+)?|\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*(?:%|[A-Za-z]{1,4})?$/.test(trimmed) ? trimmed : void 0;
}

/** 双空格 → 空格+NBSP（原 Vr，jsx 6633-6635） */
function appendPreservingSpaces(parent: HTMLElement, text: string): void {
  text && parent.appendChild(document.createTextNode(text.replace(/ {2}/g, ` \xA0`)));
}

/** 尺寸数值按缩放重写（原 da，jsx 11111） */
function scaleCssSize(size: string | undefined, scale: number): string {
  if (!size) return size ?? ``;
  const match = size.match(/^(-?[\d.]+)(px|%)$/);
  return match ? `${Number(match[1]) * scale}${match[2]}` : size;
}

export function renderTextBody(
  textBody: PptxTextBody,
  placeholder: { type?: string; idx?: number } | undefined,
  ctx: PptxRenderContext,
  container: HTMLElement,
  options?: RenderTextBodyOptions,
): void {
  const kind = placeholderTextKind(placeholder);
  let fontScale = 1;
  let lineSpacingReduction = 0;
  const autofit = lookupBodyProperty(textBody, `normAutofit`);
  if (autofit != null && autofit.exists()) {
    const scaleAttr = autofit.numAttr(`fontScale`);
    scaleAttr !== void 0 && (fontScale = scaleAttr / 1e5);
    const reduction = autofit.numAttr(`lnSpcReduction`);
    reduction !== void 0 && (lineSpacingReduction = reduction / 1e5);
  }
  const autoNumCounters = new Map<string, number>();
  const visibleIndices = textBody.paragraphs
    .map((p, index) => ({ index, visible: p.runs.some((r) => r.text != null && r.text.length > 0) }))
    .filter((entry) => entry.visible)
    .map((entry) => entry.index);
  const firstVisible = visibleIndices[0];
  const lastVisible = visibleIndices[visibleIndices.length - 1];
  const onlyVisible = visibleIndices.length === 1 ? visibleIndices[0] : void 0;

  for (const [paragraphIndex, paragraph] of textBody.paragraphs.entries()) {
    const paragraphEl = document.createElement(`div`);
    paragraphEl.style.width = `100%`;
    paragraphEl.style.minWidth = `0px`;
    paragraphEl.style.maxWidth = `100%`;
    paragraphEl.style.boxSizing = `border-box`;
    paragraphEl.style.overflowWrap = `anywhere`;
    const level = paragraph.level;
    options != null && options.isVerticalText && (paragraphEl.style.wordBreak = `keep-all`);
    const hasLineBreakRun = paragraph.runs.some((r) => r.text === `\n`);
    const compactSpacing = options?.compactSingleLineSpacing && paragraphIndex === onlyVisible && !hasLineBreakRun;
    const style: PptxParagraphStyle = {};
    applyParagraphProperties(style, lookupLevelParagraphProperties(ctx.presentation.defaultTextStyle, level));
    applyParagraphProperties(style, lookupLevelParagraphProperties(ctx.master.defaultTextStyle, level));
    applyParagraphProperties(
      style,
      lookupLevelParagraphProperties(
        kind === `title` ? ctx.master.textStyles.titleStyle : kind === `body` ? ctx.master.textStyles.bodyStyle : ctx.master.textStyles.otherStyle,
        level,
      ),
    );
    if (placeholder) {
      const masterPlaceholder = findPlaceholderNode(ctx.master.placeholders, placeholder);
      masterPlaceholder && applyParagraphProperties(style, lookupLevelParagraphProperties(placeholderListStyle(masterPlaceholder), level));
    }
    if (placeholder) {
      const layoutPlaceholder = findPlaceholderNode(ctx.layout.placeholders.map((entry) => entry.node), placeholder);
      layoutPlaceholder && applyParagraphProperties(style, lookupLevelParagraphProperties(placeholderListStyle(layoutPlaceholder), level));
    }
    applyParagraphProperties(style, lookupLevelParagraphProperties(textBody.listStyle, level));
    paragraph.properties && applyParagraphProperties(style, paragraph.properties);
    if (style.align) {
      const alignMap: Record<string, string> = {
        l: `left`, ctr: `center`, r: `right`,
        just: `justify`, justLow: `justify`, dist: `justify`, thaiDist: `justify`,
      };
      paragraphEl.style.textAlign = alignMap[style.align] || `left`;
    }
    style.rtl !== void 0 && (paragraphEl.style.direction = style.rtl ? `rtl` : `ltr`);
    style.marginLeft !== void 0 && (paragraphEl.style.paddingLeft = `${style.marginLeft}px`);
    style.textIndent !== void 0 && (paragraphEl.style.textIndent = `${style.textIndent}px`);
    let lineHeight = style.lineHeight ?? options?.defaultLineHeight;
    if (lineHeight) {
      if (lineSpacingReduction > 0) {
        const parsed = parseFloat(lineHeight);
        isNaN(parsed) ||
          (lineHeight = lineHeight.includes(`pt`)
            ? `${(parsed * (1 - lineSpacingReduction)).toFixed(2)}pt`
            : `${(parsed * (1 - lineSpacingReduction)).toFixed(3)}`);
      }
      options != null && options.isVerticalText && !style.lineHeightAbsolute
        ? (lineHeight = `1`)
        : compactSpacing && style.lineHeightAbsolute && (lineHeight = `normal`);
      paragraphEl.style.lineHeight = lineHeight;
    }
    let baseFontSize = 12;
    const defaults = defaultRunStyle(style, ctx);
    defaults.fontSize !== void 0 && (baseFontSize = defaults.fontSize);
    if (paragraph.runs.length > 0 && paragraph.runs[0].properties) {
      const sz = paragraph.runs[0].properties.numAttr(`sz`);
      sz !== void 0 && (baseFontSize = sz / 100);
    } else if (paragraph.runs.length === 0 && paragraph.endParaRPr) {
      const sz = paragraph.endParaRPr.numAttr(`sz`);
      sz !== void 0 && (baseFontSize = sz / 100);
    }
    paragraphEl.style.fontSize = `${baseFontSize * fontScale}pt`;
    const trimTop = options?.trimOuterParagraphSpacing && paragraphIndex === firstVisible;
    const trimBottom = options?.trimOuterParagraphSpacing && paragraphIndex === lastVisible;
    trimTop
      ? (paragraphEl.style.marginTop = `0px`)
      : style.spaceBefore === void 0
        ? style.spaceBeforePct !== void 0 && (paragraphEl.style.marginTop = `${style.spaceBeforePct * baseFontSize}pt`)
        : (paragraphEl.style.marginTop = `${style.spaceBefore}pt`);
    trimBottom
      ? (paragraphEl.style.marginBottom = `0px`)
      : style.spaceAfter === void 0
        ? style.spaceAfterPct !== void 0 && (paragraphEl.style.marginBottom = `${style.spaceAfterPct * baseFontSize}pt`)
        : (paragraphEl.style.marginBottom = `${style.spaceAfter}pt`);
    const suppressBullet =
      !paragraph.runs.some((r) => r.text != null && r.text.length > 0) ||
      placeholder?.type === `sldNum` || placeholder?.type === `dt` || placeholder?.type === `ftr` ||
      placeholder?.type === `title` || placeholder?.type === `ctrTitle` || placeholder?.type === `subTitle`;
    let bulletText = ``;
    if (!suppressBullet && style.bulletNone !== true) {
      if (style.bulletChar) bulletText = style.bulletChar;
      else if (style.bulletAutoNum) {
        const counterKey = `${level}:${style.bulletAutoNum}`;
        const value = style.bulletAutoNumStartAt ?? autoNumCounters.get(counterKey) ?? 1;
        bulletText = formatAutoNumberBullet(style.bulletAutoNum, value);
        autoNumCounters.set(counterKey, value + 1);
      }
    }
    if (bulletText) {
      const bulletEl = document.createElement(`span`);
      bulletEl.textContent = bulletText + ` `;
      const marL = style.marginLeft;
      const indent = style.textIndent;
      if (marL !== void 0 && marL > 0 && indent !== void 0 && indent < 0) {
        const hangStart = Math.max(0, marL + indent);
        const hangWidth = Math.max(0, marL - hangStart);
        paragraphEl.style.textIndent = `0px`;
        style.align === `ctr` || style.align === `r`
          ? ((paragraphEl.style.paddingLeft = `0px`),
            (bulletEl.style.display = `inline-block`),
            (bulletEl.style.width = `${hangWidth}px`),
            (bulletEl.style.whiteSpace = `pre`))
          : ((paragraphEl.style.position = `relative`),
            (bulletEl.style.position = `absolute`),
            (bulletEl.style.left = `${hangStart}px`),
            (bulletEl.style.top = `0px`),
            (bulletEl.style.width = `${hangWidth}px`),
            (bulletEl.style.whiteSpace = `pre`));
      }
      style.bulletFont && (bulletEl.style.fontFamily = buildFontFamilyCss(resolveThemeTypeface(style.bulletFont, ctx)));
      const bulletSize = style.bulletSizePt ?? baseFontSize * (style.bulletSizePct ?? 1);
      bulletEl.style.fontSize = `${bulletSize * fontScale}pt`;
      let bulletColor: string | undefined;
      style.bulletColorNode && style.bulletColorNode.exists() && (bulletColor = resolveColorCss(style.bulletColorNode, ctx));
      if (bulletColor === void 0) {
        bulletColor = (() => {
          const firstTextRun = paragraph.runs.find((r) => r.text != null && r.text.length > 0);
          if (!firstTextRun) return;
          const probe = defaultRunStyle(style, ctx);
          firstTextRun.properties && applyRunProperties(probe, firstTextRun.properties, ctx);
          return probe.color ?? options?.fontRefColor ?? options?.cellTextColor ?? (probe.textNoFill ? `transparent` : void 0);
        })();
      }
      if (bulletColor === void 0 && textBody.listStyle) {
        const levelProps = lookupLevelParagraphProperties(textBody.listStyle, level);
        if (levelProps.exists()) {
          const defRPr = levelProps.child(`defRPr`);
          if (defRPr.exists()) {
            const probe: PptxRunStyle = {};
            applyRunProperties(probe, defRPr, ctx);
            probe.color !== void 0 && (bulletColor = probe.color);
          }
        }
      }
      bulletEl.style.color = bulletColor ?? options?.fontRefColor ?? options?.cellTextColor ?? `#000000`;
      paragraphEl.appendChild(bulletEl);
    }
    const noWrapGroups = groupNoWrapRuns(paragraph.runs);
    const groupElements = new Map<number, HTMLElement>();
    paragraph.runs.length === 0 && paragraphEl.appendChild(document.createElement(`br`));
    paragraph.runs.some((r) => r.text?.includes(`\t`)) &&
      (paragraphEl.style.tabSize = `${style.defaultTabSize ?? 96}px`);
    const fixedLineBreakHeight = style.lineHeightAbsolute && hasLineBreakRun && lineHeight;
    let lineBreakHost: HTMLElement | null = null;
    fixedLineBreakHeight &&
      ((lineBreakHost = document.createElement(`div`)),
      (lineBreakHost.style.height = fixedLineBreakHeight),
      (lineBreakHost.style.overflow = `visible`),
      paragraphEl.appendChild(lineBreakHost));
    for (const [runIndex, run] of paragraph.runs.entries()) {
      if (run.text === `\n`) {
        fixedLineBreakHeight
          ? ((lineBreakHost = document.createElement(`div`)),
            (lineBreakHost.style.height = fixedLineBreakHeight),
            (lineBreakHost.style.overflow = `visible`),
            paragraphEl.appendChild(lineBreakHost))
          : paragraphEl.appendChild(document.createElement(`br`));
        continue;
      }
      const runStyle: PptxRunStyle = {};
      applyDefaultRunProperties(runStyle, style, ctx);
      run.properties && applyRunProperties(runStyle, run.properties, ctx);
      if (runStyle.color === void 0 && textBody.listStyle) {
        const levelProps = lookupLevelParagraphProperties(textBody.listStyle, level);
        if (levelProps.exists()) {
          const defRPr = levelProps.child(`defRPr`);
          if (defRPr.exists()) {
            const probe: PptxRunStyle = {};
            applyRunProperties(probe, defRPr, ctx);
            probe.color !== void 0 && (runStyle.color = probe.color);
          }
        }
      }
      let runEl: HTMLElement;
      if (runStyle.hlinkSlideIndex !== void 0) {
        const linkEl = document.createElement(`span`);
        const target = runStyle.hlinkSlideIndex;
        linkEl.setAttribute(`role`, `link`);
        linkEl.tabIndex = 0;
        linkEl.title = runStyle.hlinkTooltip || goToSlideTooltip(target);
        linkEl.style.cursor = `pointer`;
        linkEl.addEventListener(`click`, (event) => {
          event.stopPropagation();
          ctx.onNavigate?.({ slideIndex: target });
        });
        linkEl.addEventListener(`keydown`, (event) => {
          (event.key !== `Enter` && event.key !== ` `) ||
            (event.preventDefault(), event.stopPropagation(), ctx.onNavigate?.({ slideIndex: target }));
        });
        runEl = linkEl;
      } else if (runStyle.hlinkClick) {
        const anchor = document.createElement(`a`);
        anchor.href = runStyle.hlinkClick;
        anchor.target = `_blank`;
        anchor.rel = `noopener noreferrer`;
        runEl = anchor;
      } else runEl = document.createElement(`span`);
      const numericFragment = numericWithUnit(run.text);
      const hasPaintEffects =
        !!runStyle.textGradientCss || !!runStyle.textPatternCss || !!runStyle.textNoFill ||
        runStyle.textOutlineWidth !== void 0 || !!runStyle.textOutlineColor || !!runStyle.textOutlineGradientCss;
      const wrapsNumeric = !!run.text && !!numericFragment && run.text !== numericFragment && !hasPaintEffects;
      if (run.text && run.text.includes(`\t`)) (runEl.textContent = run.text), (runEl.style.whiteSpace = `pre`);
      else if (wrapsNumeric) {
        const start = run.text.indexOf(numericFragment!);
        const end = start + numericFragment!.length;
        appendPreservingSpaces(runEl, run.text.slice(0, start));
        const numericEl = document.createElement(`span`);
        numericEl.textContent = numericFragment!;
        numericEl.style.whiteSpace = `nowrap`;
        runEl.appendChild(numericEl);
        appendPreservingSpaces(runEl, run.text.slice(end));
      } else if (run.text && / {2}/.test(run.text)) {
        runEl.innerHTML = run.text
          .replace(/&/g, `&amp;`)
          .replace(/</g, `&lt;`)
          .replace(/>/g, `&gt;`)
          .replace(/ {2}/g, ` \xA0`);
      } else runEl.textContent = run.text;
      numericFragment &&
        (run.text === numericFragment || (run.text && run.text !== numericFragment && hasPaintEffects)) &&
        (runEl.style.whiteSpace = `nowrap`);
      const fontSize = runStyle.fontSize || 12;
      runEl.style.fontSize = `${fontSize * fontScale}pt`;
      (run.properties?.attr(`b`) === void 0 ? options?.cellTextBold ?? runStyle.bold : runStyle.bold) &&
        (runEl.style.fontWeight = `bold`);
      (run.properties?.attr(`i`) === void 0 ? options?.cellTextItalic ?? runStyle.italic : runStyle.italic) &&
        (runEl.style.fontStyle = `italic`);
      const decorations: string[] = [];
      runStyle.underline && decorations.push(`underline`);
      runStyle.strikethrough && decorations.push(`line-through`);
      decorations.length > 0 && (runEl.style.textDecoration = decorations.join(` `));
      runStyle.highlightColor && (runEl.style.backgroundColor = runStyle.highlightColor);
      const fillKind = classifyRunFillKind(run.properties);
      const hasExplicitFill = fillKind !== `none`;
      let color: string | undefined;
      if (options != null && options.fontRefColor) color = hasExplicitFill ? runStyle.color : options.fontRefColor;
      else if (options != null && options.cellTextColor && !hasExplicitFill) color = options.cellTextColor;
      else color = runStyle.color;
      if (shouldShowHyperlinkUnderline(run, paragraph, runStyle, fillKind, hasExplicitFill, ctx)) {
        const hlinkColor = ctx.theme.colorScheme.get(`hlink`);
        hlinkColor && (color = hlinkColor.startsWith(`#`) ? hlinkColor : `#${hlinkColor}`);
      }
      color ? (runEl.style.color = color) : (runEl.style.color = `#000000`);
      runStyle.underlineFollowsText && color && (runEl.style.textDecorationColor = color);
      runStyle.underlineColor && (runEl.style.textDecorationColor = runStyle.underlineColor);
      runStyle.textShadow && (runEl.style.textShadow = runStyle.textShadow);
      runStyle.textGradientCss && applyTextFillClip(runEl, runStyle.textGradientCss);
      runStyle.textPatternCss && applyTextFillClip(runEl, runStyle.textPatternCss);
      if (runStyle.textNoFill || runStyle.textOutlineWidth) {
        const outlineWidth = runStyle.textOutlineWidth ?? 0.75;
        if (runStyle.textNoFill && runStyle.textOutlineGradientCss) {
          runEl.style.color = `transparent`;
          runEl.style.webkitTextStrokeWidth = `${outlineWidth}px`;
          runEl.style.webkitTextStrokeColor = `#ffffff`;
          runEl.style.paintOrder = `stroke fill`;
          const mask = runStyle.textOutlineGradientCss;
          runEl.style.maskImage = mask;
          runEl.style.webkitMaskImage = mask;
        } else if (runStyle.textNoFill && runStyle.textOutlineColor) {
          runEl.style.color = `transparent`;
          runEl.style.webkitTextStrokeWidth = `${outlineWidth}px`;
          runEl.style.webkitTextStrokeColor = runStyle.textOutlineColor;
          runEl.style.paintOrder = `stroke fill`;
        } else if (runStyle.textNoFill) runEl.style.color = `transparent`;
        else if (runStyle.textOutlineColor) {
          runEl.style.webkitTextStrokeWidth = `${outlineWidth}px`;
          runEl.style.webkitTextStrokeColor = runStyle.textOutlineColor;
          runEl.style.paintOrder = `stroke fill`;
        }
      }
      const fontFamilyCandidate =
        run.properties?.child(`latin`).exists() || run.properties?.child(`ea`).exists() || run.properties?.child(`cs`).exists()
          ? runStyle.fontFamilyStack ?? runStyle.fontFamily
          : options?.cellTextFontFamily ?? runStyle.fontFamilyStack ?? runStyle.fontFamily;
      if (fontFamilyCandidate) {
        const resolved = Array.isArray(fontFamilyCandidate)
          ? fontFamilyCandidate.map((t) => resolveThemeTypeface(t, ctx))
          : resolveThemeTypeface(fontFamilyCandidate, ctx);
        runEl.style.fontFamily = buildFontFamilyCss(resolved);
      } else {
        const fallback = ctx.theme.minorFont.latin || ctx.theme.minorFont.ea;
        fallback && (runEl.style.fontFamily = buildFontFamilyCss(fallback));
      }
      runStyle.letterSpacingPt !== void 0 && (runEl.style.letterSpacing = `${runStyle.letterSpacingPt}pt`);
      if (runStyle.kern !== void 0) {
        const effectiveSize = (runStyle.fontSize || 12) * fontScale;
        runEl.style.fontKerning = effectiveSize >= runStyle.kern ? `normal` : `none`;
      }
      runStyle.cap === `all`
        ? (runEl.style.textTransform = `uppercase`)
        : runStyle.cap === `small` && (runEl.style.fontVariant = `small-caps`);
      if (runStyle.baseline !== void 0 && runStyle.baseline !== 0) {
        const pct = runStyle.baseline / 1e3;
        runEl.style.verticalAlign = `${pct}%`;
        Math.abs(pct) >= 20 && (runEl.style.fontSize = `${fontSize * fontScale * 0.65}pt`);
      }
      const host = lineBreakHost ?? paragraphEl;
      const groupId = noWrapGroups.get(runIndex);
      if (groupId !== void 0) {
        let groupEl = groupElements.get(groupId);
        groupEl ||
          ((groupEl = document.createElement(`span`)), (groupEl.style.whiteSpace = `nowrap`), groupElements.set(groupId, groupEl), host.appendChild(groupEl));
        groupEl.appendChild(runEl);
      } else host.appendChild(runEl);
    }
    if (paragraph.endParaRPr && paragraph.runs[paragraph.runs.length - 1]?.text === `\n`) {
      const sz = paragraph.endParaRPr.numAttr(`sz`);
      if (sz !== void 0) {
        const spacer = document.createElement(`span`);
        spacer.textContent = `\u200b`;
        spacer.style.fontSize = `${(sz / 100) * fontScale}pt`;
        (lineBreakHost ?? paragraphEl).appendChild(spacer);
      }
    }
    container.appendChild(paragraphEl);
  }
}

/* --- 占位符匹配助手（原 Gr/Kr/yt，jsx 6669-6685/4861-4866） --- */

function placeholderListStyle(node: XmlNode): XmlNode | undefined {
  const textBody = node.child(`txBody`);
  if (!textBody.exists()) return;
  const lstStyle = textBody.child(`lstStyle`);
  return lstStyle.exists() ? lstStyle : void 0;
}

function findPlaceholderNode(nodes: XmlNode[], placeholder: { type?: string; idx?: number }): XmlNode | undefined {
  for (const node of nodes) {
    let ph = node.child(`nvSpPr`);
    let phChild: XmlNode | undefined;
    if (ph.exists() && (phChild = ph.child(`nvPr`).child(`ph`)), !phChild || !phChild.exists()) {
      const pic = node.child(`nvPicPr`);
      pic.exists() && (phChild = pic.child(`nvPr`).child(`ph`));
    }
    if (!phChild || !phChild.exists()) continue;
    const type = phChild.attr(`type`);
    const idx = phChild.numAttr(`idx`);
    if ((placeholder.idx !== void 0 && idx === placeholder.idx) || (placeholder.type && type === placeholder.type))
      return node;
  }
}

/** bodyPr 提取（原 yt） */
export function textBodyBodyProperties(node: XmlNode): XmlNode | undefined {
  const textBody = node.child(`txBody`);
  if (!textBody.exists()) return;
  const bodyPr = textBody.child(`bodyPr`);
  return bodyPr.exists() ? bodyPr : void 0;
}
