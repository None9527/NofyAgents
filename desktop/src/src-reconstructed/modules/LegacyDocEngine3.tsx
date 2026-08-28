/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngine3.tsx — legacy-doc 内部排版引擎 · [E3] 字体脚本解析与段落 XML 编辑
 * （解混淆重建 · D8 Stage B4 · Office 预览族 / legacy-doc 引擎展开第 3 段）
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，行号锚点均指此）
 * 本文件覆盖：[E3] jsx 12250-13243（登记表作 12253 起；12250-12252 为 yi/bi/xi
 * 脚本正则声明，与算法同段，一并收入）。
 *
 * 段职责（按实际代码核定；登记表的“脚本/字体启发式”仅为本段前半）：
 *   A. 字体/脚本解析（12250-12342）：OOXML 四脚本（ascii/highAnsi/eastAsia/
 *      complexScript）分类、按语言/字符域判定、主题字体回退链解析、
 *      文本按脚本拆分字体运行。
 *   B. 轻量 XML 扫描器（12343-12551）：不依赖 DOM 的字符级标签范围扫描
 *      （注释/CDATA/PI 跳过、引号感知、开闭配对、畸形标记）、属性读写、
 *      实体编解码——段落级安全编辑的基础设施。
 *   C. 段落模型操作（12552-13243）：修订（w:ins/w:del）接受/拒绝、
 *      批注插入/解决、源 XML 与子运行一致性校验（sourceTextPatch/
 *      sourceRunProvenance）、表单域/图片运行克隆、段落纯文本。
 *
 * 依赖：chunk-YE7GQOST 的模型克隆族（原 m/h/_/v，本文件以 declare 挂接）；
 * 被依赖：[E4] LegacyDocEngine4（模型类型与运行克隆助手）。
 *
 * 与公共契约的关系：本段操作的 DocxEditorModel 即公共文件
 * previewPaneOfficeLegacyDocContent.tsx 中 DocxModel 的细化——结构上可
 * 赋值给后者的宽接口（nodes/metadata），createDocxEditor/DocxEditorView
 * 契约不受影响。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射表（行号 = jsx）
 * ----------------------------------------------------------------------------
 *  A 字体/脚本：
 *   yi/bi/xi → CJK_SCRIPT_RE/COMPLEX_SCRIPT_RE/MARK_SEPARATOR_PUNCT_RE (12250-12252)
 *   Si/Ci → EAST_ASIA_LANG_RE/BIDI_LANG_RE (12253/12254)
 *   wi → trimToUndefined (12255) · Ti → normalizeFontName (12258)
 *   Ei → hasExplicitFontFamily (12261) · Di → normalizeFontHint (12265)
 *   Oi → resolveDefaultScript (12268) · ki → classifyRunScript (12273)
 *   Ai → resolveFontFamilyForScript (12284) · ji → splitTextByScriptRuns (12296)
 *   Mi → resolvePrimaryFontFamily (12337)
 *  B XML 扫描：
 *   Ni → findTagEnd (12343) · Pi → readTagName (12357) · Fi → isSelfClosingTag (12365)
 *   Ii → scanXmlElements (12369) · Li → elementsByName (12460)
 *   Ri → childElements (12463) · zi → ancestorElements (12466)
 *   Bi → readXmlAttr (12469) · Vi → setXmlAttr (12497)
 *   Hi → decodeXmlEntities (12522) · Ui → escapeXmlText (12549)
 *  C 段落编辑：
 *   Wi → UNSUPPORTED_PARAGRAPH_EDIT_TAGS (12552) · Gi → elementTextContent (12553)
 *   Ki → hasAncestor (12559) · qi → collectVisibleTextTokens (12562)
 *   Ji → paragraphMatchesTokens (12578) · Yi → cloneRunStyle (12583)
 *   Xi → canonicalizeForCompare (12586) · Zi → deepEqualCanonical (12594)
 *   Qi → buildRunProvenance (12598) · $i → verifyRunProvenance (12610)
 *   ea → prepareParagraphEdit (12622) · ta → hasInterstitialContent (12666)
 *   na → isSimpleRevisionRun (12676) · ra → findRevisionElements (12693)
 *   ia → applyXmlEdits (12699) · aa → renameXmlElements (12704)
 *   oa → parseXmlBoolAttr (12715) · sa → normalizeXmlColor (12721)
 *   ca → parseRunStyleFromXml (12725) · la → collectDeletedRuns (12791)
 *   ua → applyRevisionToParagraph (12816) · da → acceptTrackedChange (12900)
 *   fa → rejectTrackedChange (12903) · pa → setCommentResolved (12906)
 *   ma → nextCommentId (12922) · ha → allocateExtendedParagraphId (12925)
 *   ga → isValidXmlText (12932) · _a → isLeapYear (12945)
 *   va → isValidXsdDateTime (12948) · ya → isSafeSplitOffset (12967)
 *   ba → withXmlSpacePreserve (12973) · xa → replaceRunText (12976)
 *   Sa → insertCommentIntoParagraph (12986) · Ca → createParagraphNode (13100)
 *   wa → getParagraphNode (13119) · Ta → textChildren (13123)
 *   Ea → cloneTextRun (13126) · Da → sameNoteReference (13138)
 *   Oa → cloneFormField (13141) · ka → cloneImageRun (13179)
 *   Aa → cloneAnyRun (13202) · ja → cloneRunStyleShallow (13205)
 *   Ma → styleJsonEqual (13212) · Na → mergeAdjacentTextRuns (13215)
 *   Pa → formFieldDisplayText (13228) · Fa → paragraphPlainText (13241)
 * ============================================================================
 */

/* ============================================================================
 * §0 文档模型类型（按 chunk-YE7GQOST 克隆族与 [E4] 用法还原）
 * ==========================================================================*/

/** 运行边框（原 runBorder 子对象） */
export interface DocxRunBorder {
  type?: string;
  color?: string;
  sizeEighthPt?: number;
  spacePt?: number;
  frame?: boolean;
  shadow?: boolean;
}

/** 运行样式（原 ca 解析产物 + 主题解析字段） */
export interface DocxRunStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  backgroundColor?: string;
  fontSizePt?: number;
  fontFamily?: string;
  sourceFontFamily?: string;
  fontFamilyAscii?: string;
  fontFamilyHAnsi?: string;
  fontFamilyEastAsia?: string;
  fontFamilyCs?: string;
  fontThemeAscii?: string;
  fontThemeHAnsi?: string;
  fontThemeEastAsia?: string;
  fontThemeCs?: string;
  fontHint?: string;
  language?: string;
  languageEastAsia?: string;
  languageBidi?: string;
  rightToLeft?: boolean;
  complexScript?: boolean;
  characterSpacingTwips?: number;
  verticalAlign?: `superscript` | `subscript`;
  runBorder?: DocxRunBorder;
  /** 主题字体解析结果（上游模型构建器填充） */
  resolvedFontFamilyAscii?: string;
  resolvedFontFamilyHAnsi?: string;
  resolvedFontFamilyEastAsia?: string;
  resolvedFontFamilyCs?: string;
}

/** 脚注/尾注引用 */
export interface DocxNoteReference {
  kind: string;
  id: number | string;
  [key: string]: unknown;
}

/** 文本运行 */
export interface DocxTextRun {
  type: `text`;
  text: string;
  style?: DocxRunStyle;
  link?: string;
  noteReference?: DocxNoteReference;
}

/** 表单域运行（原 Oa 克隆形态） */
export interface DocxFormFieldRun {
  type: `form-field`;
  fieldType: string;
  sourceKind?: string;
  id?: string;
  tag?: string;
  title?: string;
  placeholder?: string;
  checked?: boolean;
  value?: string;
  options?: { displayText?: string; value?: string }[];
  widget?: {
    name?: string;
    enabled?: boolean;
    calcOnExit?: boolean;
    text?: { inputType?: string; defaultText?: string; maxLength?: number; textFormat?: string };
    checkbox?: { defaultChecked?: boolean; sizeMode?: string; sizePt?: number };
    dropdown?: { defaultValue?: string };
  };
  checkedSymbol?: string;
  uncheckedSymbol?: string;
  style?: DocxRunStyle;
  link?: string;
  sourceXml?: string;
}

/** 图片运行（原 ka 克隆形态） */
export interface DocxImageRun {
  type: `image`;
  src?: string;
  alt?: string;
  widthPx?: number;
  heightPx?: number;
  partName?: string;
  contentType?: string;
  data?: Uint8Array;
  sourceXml?: string;
  crop?: Record<string, number | undefined>;
  cssFilter?: string;
  cssOpacity?: number;
  floating?: Record<string, unknown>;
  syntheticTextBox?: boolean;
  textBoxText?: string;
}

/** 段落子运行联合 */
export type DocxRun = DocxTextRun | DocxFormFieldRun | DocxImageRun;

/** 运行出处凭证（原 sourceTextPatch/sourceRunProvenance 的 runs 项） */
export interface DocxRunProvenanceEntry {
  style?: DocxRunStyle;
  link?: string;
  noteReference?: DocxNoteReference;
}

/** 段落节点 */
export interface DocxParagraphNode {
  type: `paragraph`;
  blockId?: string;
  style?: Record<string, unknown>;
  paragraphMarkDeleted?: boolean;
  children: DocxRun[];
  /** 源 XML（安全编辑子集内才保留） */
  sourceXml?: string;
  /** 文本补丁：子运行与源 XML 的样式凭证 */
  sourceTextPatch?: { runs: DocxRunProvenanceEntry[] };
  sourceRunProvenance?: { runs: DocxRunProvenanceEntry[] };
}

/** 表格单元格 */
export interface DocxTableCell {
  type?: `table-cell`;
  style?: Record<string, unknown>;
  nodes: DocxBlockNode[];
}

/** 表格行 */
export interface DocxTableRow {
  type?: `table-row`;
  style?: Record<string, unknown>;
  cells: DocxTableCell[];
}

/** 表格节点 */
export interface DocxTableNode {
  type: `table`;
  blockId?: string;
  sourceXml?: string;
  sourceTextPatches?: { sourceParagraphXml: string; paragraph: DocxParagraphNode }[];
  style?: Record<string, unknown>;
  rows: DocxTableRow[];
}

/** 块级节点联合 */
export type DocxBlockNode = DocxParagraphNode | DocxTableNode;

/** 批注（原 metadata.comments 项） */
export interface DocxComment {
  id: number;
  author?: string;
  initials?: string;
  date?: string;
  text?: string;
  resolved: boolean;
  extendedParagraphId?: string;
  sourceResolved?: boolean;
  resolutionDirty?: boolean;
  isNew?: boolean;
}

/** 编辑器文档模型（公共契约 DocxModel 的细化；结构兼容） */
export interface DocxEditorModel {
  nodes: DocxBlockNode[];
  metadata: {
    comments?: DocxComment[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* --- 外部模型助手（原 chunk-YE7GQOST 导出；真实实现见该 chunk） --- */

/** 原 m（chunk-YE7GQOST 的 w/E）：段落深克隆 */
declare function cloneParagraphNode(node: DocxParagraphNode): DocxParagraphNode;
/** 原 h（chunk-YE7GQOST 的 P）：整模型深克隆 */
declare function cloneDocModel(model: DocxEditorModel): DocxEditorModel;
/** 原 _（chunk-YE7GQOST 的 T/j）：表格深克隆 */
declare function cloneTableNode(node: DocxTableNode): DocxTableNode;
/** 原 v（chunk-YE7GQOST 的 l）：新 blockId（`b${自增}`） */
declare function newBlockId(): string;

/* ============================================================================
 * §A 字体/脚本解析（原 yi..Mi，jsx 12250-12342）
 * ==========================================================================*/

/** 原 yi（jsx 12250）：CJK 脚本（含注音/彝文） —— 数据逐字保留 */
export const CJK_SCRIPT_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}\p{Script=Yi}]/u;
/** 原 bi（jsx 12251）：复杂脚本（RTL/婆罗米系/东南亚） —— 数据逐字保留 */
export const COMPLEX_SCRIPT_RE = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Thai}\p{Script=Lao}\p{Script=Tibetan}\p{Script=Myanmar}\p{Script=Khmer}]/u;
/** 原 xi（jsx 12252）：记号/分隔/标点/变体选择符 —— 数据逐字保留 */
export const MARK_SEPARATOR_PUNCT_RE = /[\p{Mark}\p{Separator}\p{Punctuation}\u200c\u200d\ufe00-\ufe0f]/u;
/** 原 Si（jsx 12253）：w:lang 东亚语言判定（ja/ko/zh） —— 数据逐字保留 */
export const EAST_ASIA_LANG_RE = /^(?:ja|ko|zh)(?:-|$)/i;
/** 原 Ci（jsx 12254）：w:lang 双向语言判定（ar/he/fa/ur 等） —— 数据逐字保留 */
export const BIDI_LANG_RE = /^(?:ar|ckb|dv|fa|he|hi|ks|ku|pa-arab|ps|sd|syr|ug|ur|yi)(?:-|$)/i;

/** OOXML 四脚本域 */
export type DocxFontScript = `ascii` | `highAnsi` | `eastAsia` | `complexScript`;

/** 原 wi：trim 后空串 → undefined */
export function trimToUndefined(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

/** 原 Ti：字体名归一（去首尾引号 + 小写） */
export function normalizeFontName(value: string | undefined): string | undefined {
  return trimToUndefined(value)?.replace(/^['"]+|['"]+$/g, ``).toLowerCase();
}

/**
 * 原 Ei：fontFamily 是否为显式覆盖——
 * 与 sourceFontFamily 不同，或四域字体/主题字体全部缺位时视为显式。
 */
export function hasExplicitFontFamily(style: DocxRunStyle | undefined): boolean {
  const family = normalizeFontName(style?.fontFamily),
    source = normalizeFontName(style?.sourceFontFamily);
  return family
    ? source
      ? family !== source
      : !(
          trimToUndefined(style?.fontFamilyAscii) ||
          trimToUndefined(style?.fontFamilyHAnsi) ||
          trimToUndefined(style?.fontFamilyEastAsia) ||
          trimToUndefined(style?.fontFamilyCs) ||
          trimToUndefined(style?.fontThemeAscii) ||
          trimToUndefined(style?.fontThemeHAnsi) ||
          trimToUndefined(style?.fontThemeEastAsia) ||
          trimToUndefined(style?.fontThemeCs)
        )
    : false;
}

/** 原 Di：w:hint 归一（去 -_ 空白 + 小写） */
export function normalizeFontHint(style: DocxRunStyle | undefined): string {
  return style?.fontHint?.trim().replace(/[-_\s]/g, ``).toLowerCase() ?? ``;
}

/** 原 Oi：缺省脚本域——hint 优先；cs/bidi/RTL 语言 → complexScript；
 * ja/ko/zh 语言 → eastAsia；否则 highAnsi */
export function resolveDefaultScript(style: DocxRunStyle | undefined): DocxFontScript {
  const hint = normalizeFontHint(style);
  return hint === `eastasia`
    ? `eastAsia`
    : hint === `cs` || hint === `complexscript` || hint === `bidi` || style?.rightToLeft || BIDI_LANG_RE.test(style?.languageBidi?.trim() ?? ``)
      ? `complexScript`
      : EAST_ASIA_LANG_RE.test(style?.languageEastAsia?.trim() ?? ``)
        ? `eastAsia`
        : `highAnsi`;
}

/**
 * 原 ki：按首字符分类脚本域——
 * 样式强制 cs/RTL → complexScript；ASCII → ascii；CJK 字符/全角区 →
 * eastAsia；复杂脚本 → complexScript；记号/分隔/标点 → 继承（undefined）；
 * 其余 → highAnsi。
 */
export function classifyRunScript(text: string, style: DocxRunStyle | undefined): DocxFontScript | undefined {
  const first = Array.from(text)[0];
  if (!first) return;
  if (style?.complexScript === true || (style?.rightToLeft === true && style?.complexScript !== false)) return `complexScript`;
  const codePoint = first.codePointAt(0) ?? 0;
  if (codePoint <= 127) return `ascii`;
  if (CJK_SCRIPT_RE.test(first) || (codePoint >= 12288 && codePoint <= 12351) || (codePoint >= 65280 && codePoint <= 65519)) return `eastAsia`;
  if (COMPLEX_SCRIPT_RE.test(first)) return `complexScript`;
  if (!MARK_SEPARATOR_PUNCT_RE.test(first)) return `highAnsi`;
}

/**
 * 原 Ai：脚本域 → 字体族解析（回退链）——
 * 显式覆盖直接用 fontFamily；否则按域取 resolved → 本域 → hAnsi → ascii。
 */
export function resolveFontFamilyForScript(style: DocxRunStyle | undefined, script: DocxFontScript): string | undefined {
  const family = trimToUndefined(style?.fontFamily);
  if (hasExplicitFontFamily(style)) return family;
  switch (script) {
    case `ascii`:
      return trimToUndefined(style?.resolvedFontFamilyAscii) ?? trimToUndefined(style?.fontFamilyAscii) ?? trimToUndefined(style?.resolvedFontFamilyHAnsi) ?? trimToUndefined(style?.fontFamilyHAnsi) ?? family;
    case `highAnsi`:
      return trimToUndefined(style?.resolvedFontFamilyHAnsi) ?? trimToUndefined(style?.fontFamilyHAnsi) ?? trimToUndefined(style?.resolvedFontFamilyAscii) ?? trimToUndefined(style?.fontFamilyAscii) ?? family;
    case `eastAsia`:
      return (
        trimToUndefined(style?.resolvedFontFamilyEastAsia) ??
        trimToUndefined(style?.fontFamilyEastAsia) ??
        trimToUndefined(style?.resolvedFontFamilyHAnsi) ??
        trimToUndefined(style?.fontFamilyHAnsi) ??
        trimToUndefined(style?.resolvedFontFamilyAscii) ??
        trimToUndefined(style?.fontFamilyAscii) ??
        family
      );
    case `complexScript`:
      return (
        trimToUndefined(style?.resolvedFontFamilyCs) ??
        trimToUndefined(style?.fontFamilyCs) ??
        trimToUndefined(style?.resolvedFontFamilyHAnsi) ??
        trimToUndefined(style?.fontFamilyHAnsi) ??
        trimToUndefined(style?.resolvedFontFamilyAscii) ??
        trimToUndefined(style?.fontFamilyAscii) ??
        family
      );
  }
}

/** 按脚本拆分的字体运行（原 ji 的中间/最终形态） */
export interface DocxScriptRun {
  text: string;
  startOffset: number;
  endOffset: number;
  script: DocxFontScript;
  fontFamily?: string;
}

/**
 * 原 ji：文本 → 脚本字体运行——
 * 逐字符分类（记号类继承：向后扫描补记，再向前回填）；
 * 相邻同字体族合并。
 */
export function splitTextByScriptRuns(text: string | undefined, style: DocxRunStyle | undefined): DocxScriptRun[] {
  if (!text) return [];
  const rawRuns: { text: string; startOffset: number; endOffset: number; script: DocxFontScript | undefined }[] = [];
  let offset = 0;
  for (const ch of text) {
    const start = offset;
    (offset += ch.length), rawRuns.push({ text: ch, startOffset: start, endOffset: offset, script: classifyRunScript(ch, style) });
  }
  const defaultScript = resolveDefaultScript(style),
    following: (DocxFontScript | undefined)[] = Array(rawRuns.length);
  let nextScript: DocxFontScript | undefined;
  for (let i = rawRuns.length - 1; i >= 0; --i) (following[i] = nextScript), rawRuns[i]?.script && (nextScript = rawRuns[i]?.script);
  let previousScript: DocxFontScript | undefined;
  for (let i = 0; i < rawRuns.length; i += 1) {
    const run = rawRuns[i];
    run && ((run.script = run.script ?? previousScript ?? following[i] ?? defaultScript), (previousScript = run.script));
  }
  const merged: DocxScriptRun[] = [];
  for (const run of rawRuns) {
    const script = run.script ?? defaultScript,
      fontFamily = resolveFontFamilyForScript(style, script),
      last = merged[merged.length - 1];
    if (last && normalizeFontName(last.fontFamily) === normalizeFontName(fontFamily)) {
      (last.text += run.text), (last.endOffset = run.endOffset);
      continue;
    }
    merged.push({ text: run.text, startOffset: run.startOffset, endOffset: run.endOffset, script, fontFamily });
  }
  return merged;
}

/** 原 Mi：首个有字体族的脚本运行（回退样式 fontFamily） */
export function resolvePrimaryFontFamily(text: string | undefined, style: DocxRunStyle | undefined): string | undefined {
  return splitTextByScriptRuns(text, style).find((run) => run.fontFamily)?.fontFamily ?? trimToUndefined(style?.fontFamily);
}

/* ============================================================================
 * §B 轻量 XML 扫描器（原 Ni..Ui，jsx 12343-12551）
 * ==========================================================================*/

/** XML 元素范围（原 Ii 的 elements 项） */
export interface XmlElementRange {
  tagName: string;
  /** 开标签 '<' 位置 */
  start: number;
  /** 开标签 '>' 之后 */
  openEnd: number;
  /** 闭标签 '</' 位置（自闭合 = openEnd） */
  closeStart: number;
  /** 闭标签 '>' 之后（自闭合 = openEnd） */
  end: number;
  /** 开标签原文 */
  openTag: string;
  /** 父元素 start（顶层 = undefined） */
  parentStart: number | undefined;
  selfClosing: boolean;
}

/** XML 扫描结果 */
export interface XmlScanResult {
  /** 按 start 升序、同起点按跨度降序 */
  elements: XmlElementRange[];
  malformed: boolean;
}

/** 原 Ni：自 from 找标签结束（引号内的 > 不算），返回 > 后一字符位置 */
export function findTagEnd(xml: string, from: number): number | undefined {
  let quote: string | undefined;
  for (let i = from; i < xml.length; i += 1) {
    const ch = xml[i];
    if (quote) {
      ch === quote && (quote = undefined);
      continue;
    }
    if (ch === `"` || ch === `'`) {
      quote = ch;
      continue;
    }
    if (ch === `>`) return i + 1;
  }
}

/** 原 Pi：读标签名（闭标签跳过 '</'） */
export function readTagName(openTag: string, isClosing: boolean): string | undefined {
  let index = isClosing ? 2 : 1;
  for (; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
  const nameStart = index;
  for (; index < openTag.length && !/[\s/>]/.test(openTag[index] ?? ``);) index += 1;
  return index > nameStart ? openTag.slice(nameStart, index) : undefined;
}

/** 原 Fi：开标签是否自闭合（尾部空白前的 '/'） */
export function isSelfClosingTag(openTag: string): boolean {
  let index = openTag.length - 2;
  for (; index >= 0 && /\s/.test(openTag[index] ?? ``);) --index;
  return openTag[index] === `/`;
}

/**
 * 原 Ii：字符级 XML 范围扫描——跳过注释/CDATA/处理指令/声明；
 * 引号感寻找标签结束；开标签压栈、闭标签配对弹出（不匹配/残留栈 →
 * malformed）；自闭合直接收录。结果按起点升序（同起点跨度降序）。
 */
export function scanXmlElements(xml: string): XmlScanResult {
  const elements: XmlElementRange[] = [],
    openStack: { tagName: string; start: number; openEnd: number; openTag: string; parentStart: number | undefined }[] = [];
  let malformed = false,
    index = 0;
  for (; index < xml.length;) {
    const lt = xml.indexOf(`<`, index);
    if (lt < 0) break;
    if (xml.startsWith(`<!--`, lt)) {
      const end = xml.indexOf(`-->`, lt + 4);
      if (end < 0) {
        malformed = true;
        break;
      }
      index = end + 3;
      continue;
    }
    if (xml.startsWith(`<![CDATA[`, lt)) {
      const end = xml.indexOf(`]]>`, lt + 9);
      if (end < 0) {
        malformed = true;
        break;
      }
      index = end + 3;
      continue;
    }
    if (xml.startsWith(`<?`, lt)) {
      const end = xml.indexOf(`?>`, lt + 2);
      if (end < 0) {
        malformed = true;
        break;
      }
      index = end + 2;
      continue;
    }
    const tagEnd = findTagEnd(xml, lt + 1);
    if (tagEnd === undefined) {
      malformed = true;
      break;
    }
    const openTag = xml.slice(lt, tagEnd);
    if (openTag.startsWith(`<!`)) {
      index = tagEnd;
      continue;
    }
    const isClosing = /^<\s*\//.test(openTag),
      tagName = readTagName(openTag, isClosing);
    if (!tagName) {
      (malformed = true), (index = tagEnd);
      continue;
    }
    if (isClosing) {
      const open = openStack.pop();
      if (!open || open.tagName !== tagName) {
        (malformed = true), (index = tagEnd);
        continue;
      }
      elements.push({
        tagName: open.tagName,
        start: open.start,
        openEnd: open.openEnd,
        closeStart: lt,
        end: tagEnd,
        openTag: open.openTag,
        parentStart: open.parentStart,
        selfClosing: false,
      }),
        (index = tagEnd);
      continue;
    }
    const parentStart = openStack.at(-1)?.start;
    isSelfClosingTag(openTag)
      ? elements.push({ tagName, start: lt, openEnd: tagEnd, closeStart: tagEnd, end: tagEnd, openTag, parentStart, selfClosing: true })
      : openStack.push({ tagName, start: lt, openEnd: tagEnd, openTag, parentStart }),
      (index = tagEnd);
  }
  return openStack.length > 0 && (malformed = true), elements.sort((a, b) => a.start - b.start || b.end - a.end), { elements, malformed };
}

/** 原 Li：按标签名过滤 */
export function elementsByName(scan: XmlScanResult, tagName: string): XmlElementRange[] {
  return scan.elements.filter((element) => element.tagName === tagName);
}

/** 原 Ri：直接子元素（parentStart = 父 start） */
export function childElements(scan: XmlScanResult, parent: XmlElementRange): XmlElementRange[] {
  return scan.elements.filter((element) => element.parentStart === parent.start);
}

/** 原 zi：祖先元素（按跨度升序 = 由内向外） */
export function ancestorElements(scan: XmlScanResult, element: XmlElementRange): XmlElementRange[] {
  return scan.elements.filter((other) => other.start < element.start && other.end >= element.end).sort((a, b) => a.end - a.start - (b.end - b.start));
}

/** 原 Bi：读属性值（引号感知；命中即实体解码） */
export function readXmlAttr(openTag: string, attrName: string): string | undefined {
  let index = 1;
  for (; index < openTag.length;) {
    for (; index < openTag.length && /[^\s]/.test(openTag[index] ?? ``);) index += 1;
    for (; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    if (index >= openTag.length || openTag[index] === `/` || openTag[index] === `>`) break;
    const nameStart = index;
    for (; index < openTag.length && !/[\s=/>]/.test(openTag[index] ?? ``);) index += 1;
    const name = openTag.slice(nameStart, index);
    for (; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    if (openTag[index] !== `=`) {
      for (; index < openTag.length && !/[\s>]/.test(openTag[index] ?? ``);) index += 1;
      continue;
    }
    for (index += 1; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    const quote = openTag[index];
    if (quote !== `"` && quote !== `'`) continue;
    index += 1;
    const valueStart = index,
      valueEnd = openTag.indexOf(quote, valueStart);
    if (valueEnd < 0) return;
    if (name === attrName) return decodeXmlEntities(openTag.slice(valueStart, valueEnd));
    index = valueEnd + 1;
  }
}

/** 原 Vi：写属性值（已有则替换，缺则插到尾部 '/>' 或 '>' 之前） */
export function setXmlAttr(openTag: string, attrName: string, attrValue: string): string {
  let index = 1;
  for (; index < openTag.length;) {
    for (; index < openTag.length && /[^\s]/.test(openTag[index] ?? ``);) index += 1;
    for (; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    if (index >= openTag.length || openTag[index] === `/` || openTag[index] === `>`) break;
    const nameStart = index;
    for (; index < openTag.length && !/[\s=/>]/.test(openTag[index] ?? ``);) index += 1;
    const name = openTag.slice(nameStart, index);
    for (; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    if (openTag[index] !== `=`) continue;
    for (index += 1; index < openTag.length && /\s/.test(openTag[index] ?? ``);) index += 1;
    const quote = openTag[index];
    if (quote !== `"` && quote !== `'`) continue;
    index += 1;
    const valueStart = index,
      valueEnd = openTag.indexOf(quote, valueStart);
    if (valueEnd < 0) return openTag;
    if (name === attrName) return `${openTag.slice(0, valueStart)}${attrValue}${openTag.slice(valueEnd)}`;
    index = valueEnd + 1;
  }
  let tail = openTag.length - 1;
  for (; tail > 0 && /\s/.test(openTag[tail - 1] ?? ``);) --tail;
  return openTag[tail - 1] === `/` && --tail, `${openTag.slice(0, tail)} ${attrName}="${attrValue}"${openTag.slice(tail)}`;
}

/** 原 Hi：XML 实体解码（数字实体 + amp/lt/gt/quot/apos；非法保留原样） */
export function decodeXmlEntities(text: string): string {
  return text.replace(/&(?:#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (entity) => {
    const body = entity.slice(1, -1);
    if (body[0] === `#`) {
      const isHex = body[1]?.toLowerCase() === `x`,
        digits = body.slice(isHex ? 2 : 1),
        codePoint = Number.parseInt(digits, isHex ? 16 : 10);
      if (Number.isFinite(codePoint) && codePoint > 0)
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return entity;
        }
      return entity;
    }
    switch (body.toLowerCase()) {
      case `amp`:
        return `&`;
      case `lt`:
        return `<`;
      case `gt`:
        return `>`;
      case `quot`:
        return `"`;
      case `apos`:
        return `'`;
      default:
        return entity;
    }
  });
}

/** 原 Ui：XML 文本转义（& < >） */
export function escapeXmlText(text: string): string {
  return text.replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
}

/* ============================================================================
 * §C 段落安全编辑（原 Wi..Fa，jsx 12552-13243）
 * ==========================================================================*/

/** 原 Wi（jsx 12552）：段落安全编辑不支持的元素集（域/图形/修订/脚注等） —— 数据逐字保留 */
export const UNSUPPORTED_PARAGRAPH_EDIT_TAGS = new Set(`w:fldChar.w:instrText.w:fldSimple.w:sdt.w:bookmarkStart.w:bookmarkEnd.w:drawing.w:pict.w:object.w:hyperlink.w:moveFrom.w:moveTo.w:rPrChange.w:pPrChange.w:sectPrChange.w:tblPrChange.w:trPrChange.w:tcPrChange.w:numberingChange.w:footnoteReference.w:endnoteReference.w:tab.w:br.w:cr.mc:AlternateContent.a:t`.split(`.`));

/** 原 Gi：元素纯文本内容（含嵌套标记 → undefined；自闭合 → 空串） */
export function elementTextContent(xml: string, element: XmlElementRange): string | undefined {
  if (element.selfClosing) return ``;
  const inner = xml.slice(element.openEnd, element.closeStart);
  return inner.includes(`<`) ? undefined : decodeXmlEntities(inner);
}

/** 原 Ki：元素是否有指定祖先 */
export function hasAncestor(scan: XmlScanResult, element: XmlElementRange, tagName: string): boolean {
  return ancestorElements(scan, element).some((ancestor) => ancestor.tagName === tagName);
}

/** 可见文本令牌（原 qi 的返回项） */
export interface DocxVisibleTextToken {
  range: XmlElementRange;
  text: string;
  enclosingRun: XmlElementRange;
}

/** 原 qi：收集可见 w:t 令牌（跳过 w:del 内；嵌套标记/无宿主 run → 放弃） */
export function collectVisibleTextTokens(xml: string, scan: XmlScanResult): DocxVisibleTextToken[] | undefined {
  const tokens: DocxVisibleTextToken[] = [];
  for (const textElement of elementsByName(scan, `w:t`)) {
    if (hasAncestor(scan, textElement, `w:del`)) continue;
    const text = elementTextContent(xml, textElement);
    if (text === undefined) return;
    if (text.length === 0) continue;
    const run = ancestorElements(scan, textElement).find((ancestor) => ancestor.tagName === `w:r`);
    if (!run) return;
    tokens.push({ range: textElement, text, enclosingRun: run });
  }
  return tokens.sort((a, b) => a.range.start - b.range.start);
}

/** 原 Ji：段落子运行与可见令牌文本一致（仅纯文本、无链接/脚注） */
export function paragraphMatchesTokens(paragraph: DocxParagraphNode, tokens: DocxVisibleTextToken[]): boolean {
  if (paragraph.children.some((child) => child.type !== `text` || child.link !== undefined || child.noteReference !== undefined)) return false;
  const children = paragraph.children as DocxTextRun[];
  return tokens.length === 0 ? children.length === 1 && children[0]?.text === `` : children.length === tokens.length && children.every((child, i) => child.text === tokens[i]?.text);
}

/** 原 Yi：运行样式浅克隆（runBorder 独立） */
export function cloneRunStyle(style: DocxRunStyle | undefined): DocxRunStyle | undefined {
  return style ? { ...style, runBorder: style.runBorder ? { ...style.runBorder } : undefined } : undefined;
}

/** 原 Xi：规范化（去 undefined、键排序、递归）——供稳定 JSON 比较 */
export function canonicalizeForCompare(value: unknown): unknown {
  return Array.isArray(value)
    ? value.map(canonicalizeForCompare)
    : value && typeof value == `object`
      ? Object.fromEntries(
          Object.entries(value)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, canonicalizeForCompare(v)]),
        )
      : value;
}

/** 原 Zi：规范化深比较 */
export function deepEqualCanonical(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalizeForCompare(a)) === JSON.stringify(canonicalizeForCompare(b));
}

/** 原 Qi：构建运行出处凭证（仅全文本段落） */
export function buildRunProvenance(children: DocxRun[]): { runs: DocxRunProvenanceEntry[] } | undefined {
  if (!children.some((child) => child.type !== `text`))
    return {
      runs: (children as DocxTextRun[]).map((child) => ({
        style: cloneRunStyle(child.style),
        link: child.link,
        noteReference: child.noteReference ? { ...child.noteReference } : undefined,
      })),
    };
}

/** 原 $i：运行出处凭证仍与子运行一致 */
export function verifyRunProvenance(paragraph: DocxParagraphNode): boolean {
  const provenance = paragraph.sourceRunProvenance;
  return !provenance || paragraph.children.length !== provenance.runs.length
    ? false
    : paragraph.children.every((child, i) => {
        if (child.type !== `text`) return false;
        const entry = provenance.runs[i];
        return !!entry && deepEqualCanonical(child.style, entry?.style) && child.link === entry?.link && deepEqualCanonical(child.noteReference, entry?.noteReference);
      });
}

/** 段落编辑上下文（原 ea 的 context） */
export interface DocxParagraphEditContext {
  paragraph: DocxParagraphNode;
  sourceXml: string;
  scan: XmlScanResult;
  paragraphRange: XmlElementRange;
  visibleTokens: DocxVisibleTextToken[];
}

/** 模型编辑结果（原 ua/Sa/pa 的返回域） */
export type DocxModelEditResult =
  | { ok: true; model: DocxEditorModel; commentId?: number }
  | { ok: false; reason: `stale` | `unsupported` | `unsafe-xml` };

/**
 * 原 ea：段落安全编辑预备——
 * 节点存在且为段落、有源 XML 且未打补丁、XML 可扫描、单一顶层 w:p、
 * 无不支持元素（域/图形/脚注等）、w:ins/w:del 仅挂顶层、可见令牌可收集、
 * 子运行与令牌/凭证一致。任一失败给出原因。
 */
export function prepareParagraphEdit(model: DocxEditorModel, nodeIndex: number): { ok: true; context: DocxParagraphEditContext } | { ok: false; reason: `stale` | `unsupported` | `unsafe-xml` } {
  const node = model.nodes[nodeIndex];
  if (!node) return { ok: false, reason: `stale` };
  if (node.type !== `paragraph`) return { ok: false, reason: `unsupported` };
  if (!node.sourceXml || node.sourceTextPatch) return { ok: false, reason: `stale` };
  const sourceXml = node.sourceXml,
    scan = scanXmlElements(sourceXml);
  if (scan.malformed) return { ok: false, reason: `unsafe-xml` };
  const topLevel = elementsByName(scan, `w:p`).filter((element) => element.parentStart === undefined);
  if (topLevel.length !== 1) return { ok: false, reason: `unsafe-xml` };
  if (scan.elements.some((element) => UNSUPPORTED_PARAGRAPH_EDIT_TAGS.has(element.tagName))) return { ok: false, reason: `unsupported` };
  const paragraphRange = topLevel[0];
  for (const revision of [...elementsByName(scan, `w:ins`), ...elementsByName(scan, `w:del`)]) if (revision.parentStart !== paragraphRange.start) return { ok: false, reason: `unsupported` };
  const tokens = collectVisibleTextTokens(sourceXml, scan);
  return tokens
    ? !paragraphMatchesTokens(node, tokens) || !verifyRunProvenance(node)
      ? { ok: false, reason: `stale` }
      : { ok: true, context: { paragraph: node, sourceXml, scan, paragraphRange, visibleTokens: tokens } }
    : { ok: false, reason: `unsafe-xml` };
}

/** 原 ta：子元素间隙是否存在非空内容 */
export function hasInterstitialContent(xml: string, parent: XmlElementRange, children: XmlElementRange[]): boolean {
  let cursor = parent.openEnd;
  for (const child of [...children].sort((a, b) => a.start - b.start)) {
    if (xml.slice(cursor, child.start).trim().length > 0) return true;
    cursor = child.end;
  }
  return xml.slice(cursor, parent.closeStart).trim().length > 0;
}

/** 原 na：修订元素是否为“纯运行”结构（仅 w:r > [w:rPr] + w:t|w:delText，无间隙文本） */
export function isSimpleRevisionRun(context: DocxParagraphEditContext, revision: XmlElementRange, kind: `insertion` | `deletion`): boolean {
  const runs = childElements(context.scan, revision);
  if (runs.length === 0 || runs.some((element) => element.tagName !== `w:r`) || hasInterstitialContent(context.sourceXml, revision, runs)) return false;
  const textTag = kind === `insertion` ? `w:t` : `w:delText`;
  for (const run of runs) {
    const runChildren = childElements(context.scan, run);
    if (
      runChildren.some((element) => {
        const tagName = element.tagName;
        return tagName !== `w:rPr` && tagName !== textTag;
      }) ||
      hasInterstitialContent(context.sourceXml, run, runChildren)
    )
      return false;
    const textElements = runChildren.filter((element) => element.tagName === textTag);
    if (textElements.length === 0 || textElements.some((element) => elementTextContent(context.sourceXml, element) === undefined)) return false;
  }
  return true;
}

/** 原 ra：按修订号找顶层 w:ins/w:del 元素 */
export function findRevisionElements(context: DocxParagraphEditContext, change: { revisionId: number | string }, kind: `insertion` | `deletion`): XmlElementRange[] {
  const tagName = kind === `insertion` ? `w:ins` : `w:del`,
    revisionId = String(change.revisionId).trim();
  return elementsByName(context.scan, tagName).filter((element) => element.parentStart === context.paragraphRange.start && readXmlAttr(element.openTag, `w:id`)?.trim() === revisionId);
}

/** 原 ia：按区间（降序）应用 XML 替换 */
export function applyXmlEdits(xml: string, edits: { start: number; end: number; value: string }[]): string {
  let result = xml;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
  return result;
}

/** 原 aa：元素改名（开/闭标签同步；畸形 → undefined） */
export function renameXmlElements(xml: string, oldTagName: string, newTagName: string): string | undefined {
  const scan = scanXmlElements(xml);
  if (scan.malformed) return;
  const edits: { start: number; end: number; value: string }[] = [];
  for (const element of elementsByName(scan, oldTagName))
    edits.push({ start: element.start + 1, end: element.start + 1 + element.tagName.length, value: newTagName }),
      element.selfClosing || edits.push({ start: element.closeStart + 2, end: element.closeStart + 2 + element.tagName.length, value: newTagName });
  return applyXmlEdits(xml, edits);
}

/** 原 oa：布尔属性解析（元素缺省 → undefined；val 缺省视为真） */
export function parseXmlBoolAttr(scan: XmlScanResult, tagName: string): boolean | undefined {
  const element = elementsByName(scan, tagName)[0];
  if (!element) return;
  const value = readXmlAttr(element.openTag, `w:val`)?.trim().toLowerCase();
  return value === undefined || ![`0`, `false`, `off`, `none`].includes(value);
}

/** 原 sa：颜色归一（6 位十六进制 → #rrggbb；auto/空 → undefined） */
export function normalizeXmlColor(value: string | undefined): string | undefined {
  const text = value?.trim();
  if (!(!text || text.toLowerCase() === `auto`)) return /^[0-9a-f]{6}$/i.test(text) ? `#${text.toLowerCase()}` : text;
}

/**
 * 原 ca：运行 XML → 运行样式（w:rPr 全量：字体四域+主题+hint、语言三域、
 * 字号/字距/颜色/高亮/底纹/边框/上下标/加粗斜体下划线删除线/RTL/CS）。
 * 无任何属性 → undefined。
 */
export function parseRunStyleFromXml(runXml: string): DocxRunStyle | undefined {
  const scan = scanXmlElements(runXml);
  if (scan.malformed) return;
  const run = elementsByName(scan, `w:r`)[0],
    rPr = run ? childElements(scan, run).find((element) => element.tagName === `w:rPr`) : undefined;
  if (!rPr) return;
  const propsScan = scanXmlElements(runXml.slice(rPr.start, rPr.end));
  if (propsScan.malformed) return;
  const rFontsTag = elementsByName(propsScan, `w:rFonts`)[0]?.openTag,
    langTag = elementsByName(propsScan, `w:lang`)[0]?.openTag,
    szTag = elementsByName(propsScan, `w:sz`)[0]?.openTag,
    spacingTag = elementsByName(propsScan, `w:spacing`)[0]?.openTag,
    vertAlignTag = elementsByName(propsScan, `w:vertAlign`)[0]?.openTag,
    colorTag = elementsByName(propsScan, `w:color`)[0]?.openTag,
    highlightTag = elementsByName(propsScan, `w:highlight`)[0]?.openTag,
    shdTag = elementsByName(propsScan, `w:shd`)[0]?.openTag,
    bdrTag = elementsByName(propsScan, `w:bdr`)[0]?.openTag,
    ascii = rFontsTag ? readXmlAttr(rFontsTag, `w:ascii`) : undefined,
    hAnsi = rFontsTag ? readXmlAttr(rFontsTag, `w:hAnsi`) : undefined,
    eastAsia = rFontsTag ? readXmlAttr(rFontsTag, `w:eastAsia`) : undefined,
    cs = rFontsTag ? readXmlAttr(rFontsTag, `w:cs`) : undefined,
    family = ascii ?? hAnsi ?? eastAsia ?? cs,
    sz = Number(szTag ? readXmlAttr(szTag, `w:val`) : undefined),
    spacing = Number(spacingTag ? readXmlAttr(spacingTag, `w:val`) : undefined),
    bdrSz = Number(bdrTag ? readXmlAttr(bdrTag, `w:sz`) : undefined),
    bdrSpace = Number(bdrTag ? readXmlAttr(bdrTag, `w:space`) : undefined),
    bdrType = bdrTag ? readXmlAttr(bdrTag, `w:val`) : undefined,
    style: DocxRunStyle = {
      bold: parseXmlBoolAttr(propsScan, `w:b`),
      italic: parseXmlBoolAttr(propsScan, `w:i`),
      underline: parseXmlBoolAttr(propsScan, `w:u`),
      strike: parseXmlBoolAttr(propsScan, `w:strike`),
      color: normalizeXmlColor(colorTag ? readXmlAttr(colorTag, `w:val`) : undefined),
      highlight: highlightTag ? readXmlAttr(highlightTag, `w:val`) : undefined,
      backgroundColor: normalizeXmlColor(shdTag ? readXmlAttr(shdTag, `w:fill`) : undefined),
      fontSizePt: Number.isFinite(sz) && sz > 0 ? sz / 2 : undefined,
      fontFamily: family,
      sourceFontFamily: family,
      fontFamilyAscii: ascii,
      fontFamilyHAnsi: hAnsi,
      fontFamilyEastAsia: eastAsia,
      fontFamilyCs: cs,
      fontThemeAscii: rFontsTag ? readXmlAttr(rFontsTag, `w:asciiTheme`) : undefined,
      fontThemeHAnsi: rFontsTag ? readXmlAttr(rFontsTag, `w:hAnsiTheme`) : undefined,
      fontThemeEastAsia: rFontsTag ? readXmlAttr(rFontsTag, `w:eastAsiaTheme`) : undefined,
      fontThemeCs: rFontsTag ? readXmlAttr(rFontsTag, `w:csTheme`) : undefined,
      fontHint: rFontsTag ? readXmlAttr(rFontsTag, `w:hint`) : undefined,
      language: langTag ? readXmlAttr(langTag, `w:val`) : undefined,
      languageEastAsia: langTag ? readXmlAttr(langTag, `w:eastAsia`) : undefined,
      languageBidi: langTag ? readXmlAttr(langTag, `w:bidi`) : undefined,
      rightToLeft: parseXmlBoolAttr(propsScan, `w:rtl`),
      complexScript: parseXmlBoolAttr(propsScan, `w:cs`),
      characterSpacingTwips: Number.isFinite(spacing) ? spacing : undefined,
      verticalAlign: vertAlignTag && [`superscript`, `subscript`].includes(readXmlAttr(vertAlignTag, `w:val`) ?? ``) ? (readXmlAttr(vertAlignTag, `w:val`) as `superscript` | `subscript` | undefined) : undefined,
      runBorder:
        bdrType && bdrType !== `none` && bdrType !== `nil`
          ? {
              type: bdrType,
              color: normalizeXmlColor(readXmlAttr(bdrTag, `w:color`)),
              sizeEighthPt: Number.isFinite(bdrSz) ? bdrSz : undefined,
              spacePt: Number.isFinite(bdrSpace) ? bdrSpace : undefined,
              frame: bdrTag ? readXmlAttr(bdrTag, `w:frame`) === `1` : undefined,
              shadow: bdrTag ? readXmlAttr(bdrTag, `w:shadow`) === `1` : undefined,
            }
          : undefined,
    };
  return Object.values(style).some((value) => value !== undefined) ? style : undefined;
}

/** 原 la：收集被删运行（w:del 内各 w:delText → 文本运行 + 位置） */
export function collectDeletedRuns(context: DocxParagraphEditContext, deletions: XmlElementRange[]): { position: number; run: DocxTextRun }[] | undefined {
  const deleted: { position: number; run: DocxTextRun }[] = [];
  for (const deletion of deletions) {
    const runs = childElements(context.scan, deletion).filter((element) => element.tagName === `w:r`);
    for (const run of runs) {
      const style = parseRunStyleFromXml(context.sourceXml.slice(run.start, run.end)),
        delTexts = childElements(context.scan, run).filter((element) => element.tagName === `w:delText`);
      for (const delText of delTexts) {
        const text = elementTextContent(context.sourceXml, delText);
        if (text === undefined) return;
        text.length > 0 && deleted.push({ position: delText.start, run: { type: `text`, text, style: style ? { ...style } : undefined } });
      }
    }
  }
  return deleted;
}

/** 修订引用（原 ua 的 t 参数形态） */
export interface DocxTrackedChangeRef {
  kind: string;
  revisionId: number | string;
  nodeIndex: number;
}

/**
 * 原 ua：段落级修订接受/拒绝——
 * 定位唯一顶层修订元素（多个 → unsafe-xml；缺 → stale）；
 * 接受插入/拒绝删除 = 保留内容；拒绝插入 = 移除；接受删除 = 移除；
 * 拒绝删除 = delText 改名 w:t 并按位置归位；随后重建凭证。
 * 空段落补单个空文本运行。
 */
export function applyRevisionToParagraph(model: DocxEditorModel, change: DocxTrackedChangeRef, action: `accept` | `reject`): DocxModelEditResult {
  const kind = change.kind === `insertion` ? `insertion` : change.kind === `deletion` ? `deletion` : undefined;
  if (!kind) return { ok: false, reason: `unsupported` };
  const prepared = prepareParagraphEdit(model, change.nodeIndex);
  if (!prepared.ok) return prepared;
  const context = prepared.context,
    revisions = findRevisionElements(context, change, kind);
  if (revisions.length === 0) return { ok: false, reason: `stale` };
  if (revisions.length !== 1) return { ok: false, reason: `unsafe-xml` };
  if (revisions.some((revision) => !isSimpleRevisionRun(context, revision, kind))) return { ok: false, reason: `unsupported` };
  const keepContent = (kind === `insertion` && action === `accept`) || (kind === `deletion` && action === `reject`),
    edits: { start: number; end: number; value: string }[] = [];
  for (const revision of revisions) {
    let replacement = keepContent ? context.sourceXml.slice(revision.openEnd, revision.closeStart) : ``;
    if (kind === `deletion` && action === `reject`) {
      const renamed = renameXmlElements(replacement, `w:delText`, `w:t`);
      if (renamed === undefined) return { ok: false, reason: `unsafe-xml` };
      replacement = renamed;
    }
    edits.push({ start: revision.start, end: revision.end, value: replacement });
  }
  const nextModel = cloneDocModel(model),
    nextParagraph = nextModel.nodes[change.nodeIndex];
  if (!nextParagraph || nextParagraph.type !== `paragraph`) return { ok: false, reason: `stale` };
  if (((nextParagraph.sourceXml = applyXmlEdits(context.sourceXml, edits)), (nextParagraph.sourceTextPatch = undefined), kind === `insertion` && action === `reject`)) {
    const removed = revisions;
    nextParagraph.children = context.visibleTokens
      .map((token, i) => ({ token, run: nextParagraph.children[i] }))
      .filter(({ token }) => !removed.some((revision) => token.range.start >= revision.start && token.range.end <= revision.end))
      .map(({ run }) => run);
  } else if (kind === `deletion` && action === `reject`) {
    const restored = collectDeletedRuns(context, revisions);
    if (!restored) return { ok: false, reason: `unsafe-xml` };
    const ordered = context.visibleTokens.map((token, i) => ({ position: token.range.start, order: 1, run: nextParagraph.children[i] }));
    ordered.push(...restored.map(({ position, run }) => ({ position, order: 0, run }))),
      ordered.sort((a, b) => a.position - b.position || a.order - b.order),
      (nextParagraph.children = ordered.map((entry) => entry.run));
  }
  return (
    nextParagraph.children.length === 0 && (nextParagraph.children = [{ type: `text`, text: `` }]),
    (nextParagraph.sourceRunProvenance = buildRunProvenance(nextParagraph.children)),
    { ok: true, model: nextModel }
  );
}

/** 原 da：接受修订 */
export function acceptTrackedChange(model: DocxEditorModel, change: DocxTrackedChangeRef): DocxModelEditResult {
  return applyRevisionToParagraph(model, change, `accept`);
}

/** 原 fa：拒绝修订 */
export function rejectTrackedChange(model: DocxEditorModel, change: DocxTrackedChangeRef): DocxModelEditResult {
  return applyRevisionToParagraph(model, change, `reject`);
}

/** 原 pa：批注解决状态切换（幂等；同步 resolutionDirty） */
export function setCommentResolved(model: DocxEditorModel, commentId: number, resolved: boolean): DocxModelEditResult {
  const index = model.metadata.comments?.findIndex((comment) => comment.id === commentId);
  if (index === undefined || index < 0) return { ok: false, reason: `stale` };
  if (model.metadata.comments?.[index]?.resolved === resolved) return { ok: true, model };
  const nextModel = cloneDocModel(model),
    comment = nextModel.metadata.comments?.[index];
  return comment ? ((comment.resolved = resolved), (comment.resolutionDirty = comment.sourceResolved !== resolved), { ok: true, model: nextModel }) : { ok: false, reason: `stale` };
}

/** 原 ma：下一批注 id（现有最大 + 1） */
export function nextCommentId(comments: DocxComment[]): number {
  return comments.reduce((max, comment) => Math.max(max, comment.id), -1) + 1;
}

/** 原 ha：分配扩展段落 id（0xC0000000 基址 + 序号，8 位大写十六进制，避重） */
export function allocateExtendedParagraphId(comments: DocxComment[], seed: number): string {
  const taken = new Set(comments.map((comment) => comment.extendedParagraphId?.toUpperCase()).filter((id) => !!id));
  let candidate = (3221225472 + Math.max(0, seed)) >>> 0;
  for (; taken.has(candidate.toString(16).padStart(8, `0`).toUpperCase());) candidate = (candidate + 1) >>> 0;
  return candidate.toString(16).padStart(8, `0`).toUpperCase();
}

/** 原 ga：XML 合法文本判定（拒绝孤立代理/非法控制符/FFFE/FFFF） */
export function isValidXmlText(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 55296 && code <= 56319) {
      const lo = text.charCodeAt(i + 1);
      if (!(lo >= 56320 && lo <= 57343)) return false;
      i += 1;
      continue;
    }
    if (code >= 56320 && code <= 57343 || (code !== 9 && code !== 10 && code !== 13 && (code < 32 || code === 65534 || code === 65535))) return false;
  }
  return true;
}

/** 原 _a：闰年判定（BigInt，XSD dateTime 用） */
export function isLeapYear(year: bigint): boolean {
  return year % 4n == 0n && (year % 100n != 0n || year % 400n == 0n);
}

/** 原 va：XSD dateTime 合法性（月日/时分秒/闰年/时区范围全查） */
export function isValidXsdDateTime(value: string): boolean {
  const match = /^(-?)(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:(Z)|([+-])(\d{2}):(\d{2}))?$/.exec(value);
  if (!match || /^0+$/.test(match[2] ?? ``)) return false;
  const year = BigInt(`${match[1] ?? ``}${match[2]}`),
    month = Number(match[3]),
    day = Number(match[4]),
    hour = Number(match[5]),
    minute = Number(match[6]),
    second = Number(match[7]),
    fraction = match[8],
    tzHour = match[11] === undefined ? undefined : Number(match[11]),
    tzMinute = match[12] === undefined ? undefined : Number(match[12]),
    daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return !(
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (daysInMonth[month - 1] ?? 0) ||
    minute > 59 ||
    second > 59 ||
    hour > 24 ||
    (hour === 24 && (minute !== 0 || second !== 0 || fraction?.replace(/0/g, ``))) ||
    (tzHour !== undefined && (tzHour > 14 || (tzHour === 14 && tzMinute !== 0) || tzMinute === undefined || tzMinute > 59))
  );
}

/** 原 ya：偏移不落在代理对中间 */
export function isSafeSplitOffset(text: string, offset: number): boolean {
  if (offset <= 0 || offset >= text.length) return true;
  const prev = text.charCodeAt(offset - 1),
    next = text.charCodeAt(offset);
  return !(prev >= 55296 && prev <= 56319 && next >= 56320 && next <= 57343);
}

/** 原 ba：首尾空白 → 开标签加 xml:space="preserve" */
export function withXmlSpacePreserve(openTag: string, text: string): string {
  return /^\s|\s$/.test(text) ? setXmlAttr(openTag, `xml:space`, `preserve`) : openTag;
}

/** 原 xa：替换 w:t 文本（保留闭标签；自闭合展开为成对标签） */
export function replaceRunText(paragraphXml: string, runRange: XmlElementRange, tokenRange: XmlElementRange, newText: string): string {
  const runXml = paragraphXml.slice(runRange.start, runRange.end),
    tokenStart = tokenRange.start - runRange.start,
    tokenEnd = tokenRange.end - runRange.start,
    openTag = withXmlSpacePreserve(tokenRange.openTag, newText),
    replacement = tokenRange.selfClosing
      ? `<w:t${/^\s|\s$/.test(newText) ? ` xml:space="preserve"` : ``}>${escapeXmlText(newText)}</w:t>`
      : `${openTag}${escapeXmlText(newText)}${paragraphXml.slice(tokenRange.closeStart, tokenRange.end)}`;
  return runXml.slice(0, tokenStart) + replacement + runXml.slice(tokenEnd);
}

/** 批注插入请求（原 Sa 的 t 参数） */
export interface DocxInsertCommentRequest {
  nodeIndex: number;
  text: string;
  author?: string;
  initials?: string;
  date?: string;
  startOffset: number;
  endOffset: number;
}

/**
 * 原 Sa：段落内插入批注——
 * 校验（文本/作者/日期合法、偏移为整数且不切代理对、段落无既有
 * 修订/批注标记、仅 w:pPr + w:r 结构、运行与令牌一一对应、无间隙文本）；
 * 按偏移把各 w:t 切片并在边界注入 commentRangeStart/End + commentReference；
 * 重建子运行/凭证，登记批注（isNew，extendedParagraphId 分配）。
 */
export function insertCommentIntoParagraph(model: DocxEditorModel, request: DocxInsertCommentRequest): DocxModelEditResult {
  const prepared = prepareParagraphEdit(model, request.nodeIndex);
  if (!prepared.ok) return prepared;
  const context = prepared.context,
    requiredFields = [request.text, request.author, request.initials, request.date].filter((value) => value !== undefined);
  if (
    !request.text.trim() ||
    requiredFields.some((value) => !isValidXmlText(value)) ||
    (request.date !== undefined && !isValidXsdDateTime(request.date)) ||
    !Number.isInteger(request.startOffset) ||
    !Number.isInteger(request.endOffset) ||
    request.startOffset < 0 ||
    request.endOffset <= request.startOffset
  )
    return { ok: false, reason: `unsupported` };
  const forbiddenTags = new Set([`w:ins`, `w:del`, `w:commentRangeStart`, `w:commentRangeEnd`, `w:commentReference`]);
  if (context.scan.elements.some((element) => forbiddenTags.has(element.tagName))) return { ok: false, reason: `unsupported` };
  const topLevelChildren = childElements(context.scan, context.paragraphRange);
  if (
    topLevelChildren.some((element) => {
      const tagName = element.tagName;
      return tagName !== `w:pPr` && tagName !== `w:r`;
    })
  )
    return { ok: false, reason: `unsupported` };
  const runs = topLevelChildren.filter((element) => element.tagName === `w:r`);
  if (runs.length !== context.visibleTokens.length) return { ok: false, reason: `unsupported` };
  for (let i = 0; i < runs.length; i += 1) {
    const run = runs[i],
      token = context.visibleTokens[i],
      runChildren = childElements(context.scan, run),
      textElements = runChildren.filter((element) => element.tagName === `w:t`),
      simpleShape =
        (runChildren.length === 1 && runChildren[0]?.tagName === `w:t`) || (runChildren.length === 2 && runChildren[0]?.tagName === `w:rPr` && runChildren[1]?.tagName === `w:t`);
    if (token.enclosingRun.start !== run.start || !simpleShape || textElements.length !== 1 || textElements[0].start !== token.range.start || hasInterstitialContent(context.sourceXml, run, runChildren))
      return { ok: false, reason: `unsupported` };
  }
  const fullText = context.visibleTokens.map((token) => token.text).join(``),
    totalLength = fullText.length;
  if (request.endOffset > totalLength) return { ok: false, reason: `stale` };
  if (!isSafeSplitOffset(fullText, request.startOffset) || !isSafeSplitOffset(fullText, request.endOffset)) return { ok: false, reason: `unsupported` };
  const comments = model.metadata.comments ?? [],
    commentId = nextCommentId(comments),
    extendedParagraphId = allocateExtendedParagraphId(comments, commentId),
    rangeStartXml = `<w:commentRangeStart w:id="${commentId}"/>`,
    rangeEndXml = `<w:commentRangeEnd w:id="${commentId}"/><w:r><w:commentReference w:id="${commentId}"/></w:r>`,
    edits: { start: number; end: number; value: string }[] = [],
    newChildren: DocxTextRun[] = [];
  let cursor = 0,
    startInjected = false,
    endInjected = false;
  for (let i = 0; i < runs.length; i += 1) {
    const run = runs[i],
      token = context.visibleTokens[i],
      existingChild = context.paragraph.children[i],
      runStartOffset = cursor,
      runEndOffset = cursor + token.text.length,
      cutPoints = [0, token.text.length];
    request.startOffset > runStartOffset && request.startOffset < runEndOffset && cutPoints.push(request.startOffset - runStartOffset),
      request.endOffset > runStartOffset && request.endOffset < runEndOffset && cutPoints.push(request.endOffset - runStartOffset),
      cutPoints.sort((a, b) => a - b);
    const uniqueCuts = cutPoints.filter((point, index) => point !== cutPoints[index - 1]);
    let runXml = ``;
    for (let k = 0; k < uniqueCuts.length - 1; k += 1) {
      const from = uniqueCuts[k],
        to = uniqueCuts[k + 1],
        absoluteFrom = runStartOffset + from,
        absoluteTo = runStartOffset + to;
      !startInjected && absoluteFrom === request.startOffset && ((runXml += rangeStartXml), (startInjected = true));
      const piece = token.text.slice(from, to);
      piece.length > 0 &&
        ((runXml += replaceRunText(context.sourceXml, run, token.range, piece)),
        newChildren.push({ type: `text`, text: piece, style: existingChild.type === `text` && existingChild.style ? { ...existingChild.style } : undefined })),
        !endInjected && absoluteTo === request.endOffset && ((runXml += rangeEndXml), (endInjected = true));
    }
    edits.push({ start: run.start, end: run.end, value: runXml }), (cursor = runEndOffset);
  }
  if (!startInjected || !endInjected) return { ok: false, reason: `stale` };
  const nextModel = cloneDocModel(model),
    nextParagraph = nextModel.nodes[request.nodeIndex];
  if (!nextParagraph || nextParagraph.type !== `paragraph`) return { ok: false, reason: `stale` };
  (nextParagraph.sourceXml = applyXmlEdits(context.sourceXml, edits)),
    (nextParagraph.sourceTextPatch = undefined),
    (nextParagraph.children = newChildren),
    (nextParagraph.sourceRunProvenance = buildRunProvenance(newChildren));
  const comment: DocxComment = {
    id: commentId,
    author: request.author,
    initials: request.initials,
    date: request.date,
    text: request.text,
    resolved: false,
    extendedParagraphId,
    sourceResolved: false,
    resolutionDirty: false,
    isNew: true,
  };
  return (nextModel.metadata.comments = [...(nextModel.metadata.comments ?? []), comment]), { ok: true, model: nextModel, commentId };
}

/** 原 Ca：新建段落节点（新 blockId；可选段落/运行样式） */
export function createParagraphNode(text: string, styles?: { paragraphStyle?: Record<string, unknown>; runStyle?: DocxRunStyle }): DocxParagraphNode {
  return {
    type: `paragraph`,
    blockId: newBlockId(),
    style: styles?.paragraphStyle,
    children: [{ type: `text`, text, style: styles?.runStyle }],
  };
}

/** 原 wa：取段落节点（非段落/越界 → undefined） */
export function getParagraphNode(model: DocxEditorModel, nodeIndex: number): DocxParagraphNode | undefined {
  const node = model.nodes[nodeIndex];
  if (!(!node || node.type !== `paragraph`)) return node;
}

/** 原 Ta：段落内文本运行 */
export function textChildren(paragraph: DocxParagraphNode): DocxTextRun[] {
  return paragraph.children.filter((child): child is DocxTextRun => child.type === `text`);
}

/** 原 Ea：文本运行克隆 */
export function cloneTextRun(run: DocxTextRun): DocxTextRun {
  return {
    type: `text`,
    text: run.text,
    style: run.style ? { ...run.style } : undefined,
    link: run.link,
    noteReference: run.noteReference ? { ...run.noteReference } : undefined,
  };
}

/** 原 Da：脚注/尾注引用相等（kind + id） */
export function sameNoteReference(a: DocxNoteReference | undefined, b: DocxNoteReference | undefined): boolean {
  return !a || !b ? a === b : a.kind === b.kind && a.id === b.id;
}

/** 原 Oa：表单域运行克隆（全字段） */
export function cloneFormField(run: DocxFormFieldRun): DocxFormFieldRun {
  return {
    type: `form-field`,
    fieldType: run.fieldType,
    sourceKind: run.sourceKind,
    id: run.id,
    tag: run.tag,
    title: run.title,
    placeholder: run.placeholder,
    checked: run.checked,
    value: run.value,
    options: run.options?.map((option) => ({ displayText: option.displayText, value: option.value })),
    widget: run.widget
      ? {
          name: run.widget.name,
          enabled: run.widget.enabled,
          calcOnExit: run.widget.calcOnExit,
          text: run.widget.text
            ? { inputType: run.widget.text.inputType, defaultText: run.widget.text.defaultText, maxLength: run.widget.text.maxLength, textFormat: run.widget.text.textFormat }
            : undefined,
          checkbox: run.widget.checkbox
            ? { defaultChecked: run.widget.checkbox.defaultChecked, sizeMode: run.widget.checkbox.sizeMode, sizePt: run.widget.checkbox.sizePt }
            : undefined,
          dropdown: run.widget.dropdown ? { defaultValue: run.widget.dropdown.defaultValue } : undefined,
        }
      : undefined,
    checkedSymbol: run.checkedSymbol,
    uncheckedSymbol: run.uncheckedSymbol,
    style: run.style ? { ...run.style } : undefined,
    link: run.link,
    sourceXml: run.sourceXml,
  };
}

/** 原 ka：图片运行克隆（data 复制字节） */
export function cloneImageRun(run: DocxImageRun): DocxImageRun {
  return {
    type: `image`,
    src: run.src,
    alt: run.alt,
    widthPx: run.widthPx,
    heightPx: run.heightPx,
    partName: run.partName,
    contentType: run.contentType,
    data: run.data ? new Uint8Array(run.data) : undefined,
    sourceXml: run.sourceXml,
    crop: run.crop ? { ...run.crop } : undefined,
    cssFilter: run.cssFilter,
    cssOpacity: run.cssOpacity,
    floating: run.floating ? { ...run.floating } : undefined,
    syntheticTextBox: run.syntheticTextBox,
    textBoxText: run.textBoxText,
  };
}

/** 原 Aa：任意运行克隆分派 */
export function cloneAnyRun(run: DocxRun): DocxRun {
  return run.type === `text` ? cloneTextRun(run) : run.type === `form-field` ? cloneFormField(run) : cloneImageRun(run);
}

/** 原 ja：运行样式浅克隆（同 Yi） */
export function cloneRunStyleShallow(style: DocxRunStyle | undefined): DocxRunStyle | undefined {
  return style ? { ...style, runBorder: style.runBorder ? { ...style.runBorder } : undefined } : undefined;
}

/** 原 Ma：样式 JSON 相等（undefined 视为 {}） */
export function styleJsonEqual(a: DocxRunStyle | undefined, b: DocxRunStyle | undefined): boolean {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

/** 原 Na：相邻同样式/链接/脚注文本运行合并 */
export function mergeAdjacentTextRuns(runs: DocxTextRun[]): DocxTextRun[] {
  const merged: DocxTextRun[] = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (last && styleJsonEqual(last.style, run.style) && last.link === run.link && sameNoteReference(last.noteReference, run.noteReference)) {
      last.text += run.text;
      continue;
    }
    merged.push(cloneTextRun(run));
  }
  return merged;
}

/** 原 Pa：表单域显示文本（复选框符号/下拉值/文本缺省） */
export function formFieldDisplayText(run: DocxFormFieldRun): string {
  switch (run.fieldType) {
    case `checkbox`:
      return run.checked ?? run.widget?.checkbox?.defaultChecked ? run.checkedSymbol ?? `☒` : run.uncheckedSymbol ?? `☐`;
    case `dropdown`:
      return run.value ?? run.options?.[0]?.displayText ?? ``;
    case `date`:
    case `text`:
      return run.value ?? run.widget?.text?.defaultText ?? ``;
    default:
      return ``;
  }
}

/** 原 Fa：段落纯文本（表单域按显示文本计入） */
export function paragraphPlainText(paragraph: DocxParagraphNode): string {
  return paragraph.children.map((child) => (child.type === `text` ? child.text : child.type === `form-field` ? formFieldDisplayText(child) : ``)).join(``);
}

/* ============================================================================
 * 尾符号表（本文件导出 ↔ 原混淆名 ↔ jsx 行）
 * ----------------------------------------------------------------------------
 * 导出符号（60）：
 *  类型：DocxRunBorder DocxRunStyle DocxNoteReference DocxTextRun
 *   DocxFormFieldRun DocxImageRun DocxRun DocxRunProvenanceEntry
 *   DocxParagraphNode DocxTableCell DocxTableRow DocxTableNode DocxBlockNode
 *   DocxComment DocxEditorModel DocxFontScript DocxScriptRun XmlElementRange
 *   XmlScanResult DocxVisibleTextToken DocxParagraphEditContext
 *   DocxModelEditResult DocxTrackedChangeRef DocxInsertCommentRequest
 *  A 字体/脚本：CJK_SCRIPT_RE(yi,12250) COMPLEX_SCRIPT_RE(bi,12251)
 *   MARK_SEPARATOR_PUNCT_RE(xi,12252) EAST_ASIA_LANG_RE(Si,12253)
 *   BIDI_LANG_RE(Ci,12254) trimToUndefined(wi,12255) normalizeFontName(Ti,12258)
 *   hasExplicitFontFamily(Ei,12261) normalizeFontHint(Di,12265)
 *   resolveDefaultScript(Oi,12268) classifyRunScript(ki,12273)
 *   resolveFontFamilyForScript(Ai,12284) splitTextByScriptRuns(ji,12296)
 *   resolvePrimaryFontFamily(Mi,12337)
 *  B XML：findTagEnd(Ni,12343) readTagName(Pi,12357) isSelfClosingTag(Fi,12365)
 *   scanXmlElements(Ii,12369) elementsByName(Li,12460) childElements(Ri,12463)
 *   ancestorElements(zi,12466) readXmlAttr(Bi,12469) setXmlAttr(Vi,12497)
 *   decodeXmlEntities(Hi,12522) escapeXmlText(Ui,12549)
 *  C 编辑：UNSUPPORTED_PARAGRAPH_EDIT_TAGS(Wi,12552) elementTextContent(Gi,12553)
 *   hasAncestor(Ki,12559) collectVisibleTextTokens(qi,12562)
 *   paragraphMatchesTokens(Ji,12578) cloneRunStyle(Yi,12583)
 *   canonicalizeForCompare(Xi,12586) deepEqualCanonical(Zi,12594)
 *   buildRunProvenance(Qi,12598) verifyRunProvenance($i,12610)
 *   prepareParagraphEdit(ea,12622) hasInterstitialContent(ta,12666)
 *   isSimpleRevisionRun(na,12676) findRevisionElements(ra,12693)
 *   applyXmlEdits(ia,12699) renameXmlElements(aa,12704) parseXmlBoolAttr(oa,12715)
 *   normalizeXmlColor(sa,12721) parseRunStyleFromXml(ca,12725)
 *   collectDeletedRuns(la,12791) applyRevisionToParagraph(ua,12816)
 *   acceptTrackedChange(da,12900) rejectTrackedChange(fa,12903)
 *   setCommentResolved(pa,12906) nextCommentId(ma,12922)
 *   allocateExtendedParagraphId(ha,12925) isValidXmlText(ga,12932)
 *   isLeapYear(_a,12945) isValidXsdDateTime(va,12948) isSafeSplitOffset(ya,12967)
 *   withXmlSpacePreserve(ba,12973) replaceRunText(xa,12976)
 *   insertCommentIntoParagraph(Sa,12986) createParagraphNode(Ca,13100)
 *   getParagraphNode(wa,13119) textChildren(Ta,13123) cloneTextRun(Ea,13126)
 *   sameNoteReference(Da,13138) cloneFormField(Oa,13141) cloneImageRun(ka,13179)
 *   cloneAnyRun(Aa,13202) cloneRunStyleShallow(ja,13205) styleJsonEqual(Ma,13212)
 *   mergeAdjacentTextRuns(Na,13215) formFieldDisplayText(Pa,13228)
 *   paragraphPlainText(Fa,13241)
 * 外部挂接（declare）：cloneParagraphNode(原 m) cloneDocModel(原 h)
 *   cloneTableNode(原 _) newBlockId(原 v)——chunk-YE7GQOST
 * ============================================================================
 */
