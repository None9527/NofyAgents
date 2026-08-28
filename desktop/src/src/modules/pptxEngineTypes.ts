/* eslint-disable */
/**
 * ============================================================================
 * pptxEngineTypes.ts — pptxRendererPreviewEngine 子模块 · 共享类型与 XML 包装
 * （解混淆重建 · D8 Stage B2 · Office 预览族）
 *
 * 主文件：pptxRendererPreviewEngine.tsx（符号总表/分段登记见其头部注释）。
 * 本文件对应源 chunk 中：
 *   N  → XmlNode        DOMParser 之上的链式 XML 包装类   (jsx 3589-3638)
 *   P  → parseXml                                        (jsx 3639-3644)
 *   B/ee/te/ne → emuToPx / angleToDeg / alphaToUnit / ptToPx (jsx 3687-3695)
 *   he/ge → parseXmlBool / parseXmlBoolDefaultTrue        (jsx 3899-3907)
 *   z  → resolvePartPath   rels 目标 → 包内绝对路径        (jsx 3676-3686)
 *   R  → parseRels                                        (jsx 3658-3675)
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 * 单位换算（原 B/ee/te/ne，jsx 3687-3695）
 * -------------------------------------------------------------------------*/

/** EMU → CSS px（96dpi：1in = 914400 EMU = 96px） */
export function emuToPx(emu: number): number {
  return (emu / 914400) * 96;
}

/** OOXML 角度（60000/度）→ 度 */
export function angleToDeg(angle: number): number {
  return angle / 6e4;
}

/** OOXML 千分比（100000 = 100%）→ 0..1 */
export function permilleToUnit(value: number): number {
  return value / 1e5;
}

/** 点 → px（96/72） */
export function ptToPx(pt: number): number {
  return (pt * 96) / 72;
}

/* ---------------------------------------------------------------------------
 * XML 布尔解析（原 pe/me/he/ge，jsx 3899-3907）
 * -------------------------------------------------------------------------*/

const XML_TRUE_VALUES = new Set([`1`, `true`, `t`, `on`]);
const XML_FALSE_VALUES = new Set([`0`, `false`, `f`, `off`]);

/** 原 he：缺省返回第二参数 */
export function parseXmlBool(value: string | undefined, fallback = false): boolean {
  if (value === void 0) return fallback;
  const normalized = value.trim().toLowerCase();
  return XML_TRUE_VALUES.has(normalized) ? true : XML_FALSE_VALUES.has(normalized) ? false : fallback;
}

/** 原 ge：缺省 true */
export function parseXmlBoolDefaultTrue(value: string | undefined): boolean {
  return parseXmlBool(value, true);
}

/* ---------------------------------------------------------------------------
 * XmlNode（原 N，jsx 3589-3638）
 * 命名空间宽容：先按完整名取属性，失败则按 localName 匹配；
 * 前缀 `r` 缺省解析为 relationships 命名空间。
 * -------------------------------------------------------------------------*/

export class XmlNode {
  el: Element | null;
  constructor(el: Element | null) {
    this.el = el;
  }
  attr(name: string): string | undefined {
    if (!this.el) return;
    if (this.el.hasAttribute(name)) return this.el.getAttribute(name) ?? undefined;
    const colon = name.indexOf(`:`);
    const localName = colon >= 0 ? name.slice(colon + 1) : name;
    const ns = colon >= 0 ? this.resolveAttributeNamespace(name.slice(0, colon)) : void 0;
    for (let i = 0; i < this.el.attributes.length; i++) {
      const attr = this.el.attributes[i];
      if (attr.localName === localName && (colon < 0 || (ns ? attr.namespaceURI === ns : attr.namespaceURI !== null)))
        return attr.value;
    }
  }
  resolveAttributeNamespace(prefix: string): string | undefined {
    return (
      this.el?.lookupNamespaceURI(prefix) ??
      (prefix === `r` ? `http://schemas.openxmlformats.org/officeDocument/2006/relationships` : void 0)
    );
  }
  numAttr(name: string): number | undefined {
    const raw = this.attr(name);
    if (raw === void 0) return;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? void 0 : parsed;
  }
  child(localName: string): XmlNode {
    if (!this.el) return new XmlNode(null);
    const children = this.el.children;
    for (let i = 0; i < children.length; i++) if (children[i].localName === localName) return new XmlNode(children[i]);
    return new XmlNode(null);
  }
  children(localName?: string): XmlNode[] {
    if (!this.el) return [];
    const out: XmlNode[] = [];
    const children = this.el.children;
    for (let i = 0; i < children.length; i++)
      (localName === void 0 || children[i].localName === localName) && out.push(new XmlNode(children[i]));
    return out;
  }
  text(): string {
    return this.el ? this.el.textContent ?? `` : ``;
  }
  exists(): boolean {
    return this.el !== null;
  }
  allChildren(): XmlNode[] {
    return this.children();
  }
  get localName(): string {
    return this.el?.localName ?? ``;
  }
  get element(): Element | null {
    return this.el;
  }
}

/** DOMParser 解析（原 P，jsx 3639-3644）：parsererror 时返回空节点并告警 */
export function parseXml(xml: string): XmlNode {
  const doc = new DOMParser().parseFromString(xml, `application/xml`);
  const errorNode = doc.querySelector(`parsererror`);
  return errorNode ? (console.warn(`XML parse error:`, errorNode.textContent), new XmlNode(null)) : new XmlNode(doc.documentElement);
}

/* ---------------------------------------------------------------------------
 * rels（原 F/I/L/R/z，jsx 3645-3686）
 * -------------------------------------------------------------------------*/

export interface PptxRelationship {
  type: string;
  target: string;
  targetMode?: string;
}

/** TargetMode="External"（原 F） */
export function isExternalRel(rel: PptxRelationship | undefined): boolean {
  return rel?.targetMode?.trim().toLowerCase() === `external`;
}

/** 去掉查询串/锚点（原 I） */
export function stripQueryAndHash(path: string): string {
  const index = path.search(/[?#]/);
  return index >= 0 ? path.slice(0, index) : path;
}

/** 容错 decodeURIComponent（原 L） */
export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** 解析 .rels 文档为 rId → 关系 映射（原 R） */
export function parseRels(xml: string | undefined): Map<string, PptxRelationship> {
  const map = new Map<string, PptxRelationship>();
  if (!xml) return map;
  const root = parseXml(xml);
  if (!root.exists()) return map;
  for (const rel of root.children(`Relationship`)) {
    const id = rel.attr(`Id`);
    const type = rel.attr(`Type`);
    const target = rel.attr(`Target`);
    const targetMode = rel.attr(`TargetMode`);
    id && type !== void 0 && target !== void 0 && map.set(id, { type, target, targetMode });
  }
  return map;
}

/** 相对目标 → 包内绝对路径（原 z）：绝对目标去前导 /；相对目标按 .. / . 归一 */
export function resolvePartPath(basePartPath: string, target: string): string {
  const cleanTarget = stripQueryAndHash(target);
  if (cleanTarget.startsWith(`/`))
    return cleanTarget.slice(1).replace(/\\/g, `/`).split(`/`).map(safeDecodeURIComponent).join(`/`);
  const baseSegments = basePartPath.replace(/\\/g, `/`).split(`/`).filter(Boolean);
  const targetSegments = cleanTarget.replace(/\\/g, `/`).split(`/`).filter(Boolean).map(safeDecodeURIComponent);
  const resolved = [...baseSegments];
  for (const segment of targetSegments) segment === `..` ? resolved.pop() : segment !== `.` && resolved.push(segment);
  return resolved.join(`/`);
}

/** 路径的目录部分（原 Ye/ot，jsx 4469/4628） */
export function partDirectory(path: string): string {
  const index = path.lastIndexOf(`/`);
  return index >= 0 ? path.substring(0, index) : ``;
}

/** part 路径 → 其 rels 路径（原 st，jsx 4632） */
export function partRelsPath(path: string): string {
  return `${partDirectory(path)}/_rels/${path.substring(path.lastIndexOf(`/`) + 1)}.rels`;
}

/* ---------------------------------------------------------------------------
 * 主题（原 ae/oe，jsx 3706-3745）
 * -------------------------------------------------------------------------*/

export interface PptxThemeFont {
  latin: string;
  ea: string;
  cs: string;
  scripts?: Record<string, string>;
}

export interface PptxTheme {
  colorScheme: Map<string, string>;
  majorFont: PptxThemeFont;
  minorFont: PptxThemeFont;
  fillStyles: XmlNode[];
  bgFillStyles: XmlNode[];
  lineStyles: XmlNode[];
  effectStyles: XmlNode[];
}

/** 主题配色方案 12 键顺序（原 re，jsx 3697） */
export const THEME_COLOR_SCHEME_KEYS = [
  `dk1`, `dk2`, `lt1`, `lt2`,
  `accent1`, `accent2`, `accent3`, `accent4`, `accent5`, `accent6`,
  `hlink`, `folHlink`,
];

/* ---------------------------------------------------------------------------
 * 母版 / 版式 / 幻灯片 模型（原 fe/Se/rt/it，jsx 3875-4625）
 * -------------------------------------------------------------------------*/

export interface PptxSlideMaster {
  colorMap: Map<string, string>;
  background?: XmlNode;
  textStyles: { titleStyle?: XmlNode; bodyStyle?: XmlNode; otherStyle?: XmlNode };
  defaultTextStyle?: XmlNode;
  placeholders: XmlNode[];
  placeholderEntries: PptxPlaceholderEntry[];
  spTree: XmlNode;
  rels: Map<string, PptxRelationship>;
}

export interface PptxSlideLayout {
  colorMapOverride?: Map<string, string>;
  background?: XmlNode;
  placeholders: PptxPlaceholderEntry[];
  spTree: XmlNode;
  rels: Map<string, PptxRelationship>;
  showMasterSp: boolean;
}

export interface PptxPlaceholderEntry {
  node: XmlNode;
  absoluteXfrm?: { position: { x: number; y: number }; size: { w: number; h: number } };
}

export interface PptxSlide {
  index: number;
  hidden?: boolean;
  nodes: PptxNode[];
  background?: XmlNode;
  layoutIndex?: string;
  rels: Map<string, PptxRelationship>;
  slidePath: string;
  showMasterSp: boolean;
  nodesMaterialized: boolean;
  /** lazySlides 模式下暂存的原始 XML（物化后清空） */
  sourceXml?: string;
  placeholderInheritanceResolved?: boolean;
}

/* ---------------------------------------------------------------------------
 * 元素节点模型（原 Me/Pe/ze/Ve/He/$e/et 的返回类型，jsx 4219-4570）
 * -------------------------------------------------------------------------*/

export type PptxNodeKind = `shape` | `picture` | `table` | `group` | `chart`;

export interface PptxNodeBase {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  placeholder?: { type?: string; idx?: number };
  hlinkClick?: { action?: string; rId?: string; tooltip?: string };
  source: XmlNode;
  nodeType: PptxNodeKind;
}

export interface PptxTextRun {
  text: string;
  properties?: XmlNode;
}

export interface PptxParagraph {
  properties?: XmlNode;
  runs: PptxTextRun[];
  level: number;
  endParaRPr?: XmlNode;
}

export interface PptxTextBody {
  bodyProperties?: XmlNode;
  listStyle?: XmlNode;
  paragraphs: PptxParagraph[];
  layoutBodyProperties?: XmlNode;
}

export interface PptxShapeNode extends PptxNodeBase {
  nodeType: `shape`;
  presetGeometry?: string;
  adjustments: Map<string, number>;
  customGeometry?: XmlNode;
  fill?: XmlNode;
  line?: XmlNode;
  headEnd?: { type: string; w?: string; len?: string };
  tailEnd?: { type: string; w?: string; len?: string };
  textBody?: PptxTextBody;
  textBoxBounds?: { x: number; y: number; w: number; h: number; rotation?: number };
}

export interface PptxPictureNode extends PptxNodeBase {
  nodeType: `picture`;
  blipEmbed?: string;
  blipLink?: string;
  crop?: { top: number; bottom: number; left: number; right: number };
  fill?: XmlNode;
  line?: XmlNode;
  presetGeometry?: string;
  customGeometry?: XmlNode;
  isVideo?: boolean;
  isAudio?: boolean;
  mediaRId?: string;
}

export interface PptxTableCell {
  gridSpan: number;
  rowSpan: number;
  hMerge: boolean;
  vMerge: boolean;
  textBody?: PptxTextBody;
  properties?: XmlNode;
}

export interface PptxTableRow {
  height: number;
  cells: PptxTableCell[];
}

export interface PptxTableNode extends PptxNodeBase {
  nodeType: `table`;
  columns: number[];
  rows: PptxTableRow[];
  properties?: XmlNode;
  tableStyleId?: string;
}

export interface PptxGroupNode extends PptxNodeBase {
  nodeType: `group`;
  childOffset: { x: number; y: number };
  childExtent: { w: number; h: number };
  children: XmlNode[];
}

export interface PptxChartNode extends PptxNodeBase {
  nodeType: `chart`;
  chartPath: string;
}

export type PptxNode = PptxShapeNode | PptxPictureNode | PptxTableNode | PptxGroupNode | PptxChartNode;

/* ---------------------------------------------------------------------------
 * 演示文稿模型 + 媒体解析器（原 M/T/dt 的返回类型，jsx 3459-4790）
 * -------------------------------------------------------------------------*/

export interface PptxMediaResolver {
  resolve(target: string): Promise<{ mediaPath: string; data: Uint8Array } | undefined>;
  loadedBytes: number;
  loadedCount: number;
  totalCount: number;
}

export interface PptxPresentation {
  width: number;
  height: number;
  slides: PptxSlide[];
  layouts: Map<string, PptxSlideLayout>;
  masters: Map<string, PptxSlideMaster>;
  themes: Map<string, PptxTheme>;
  slideToLayout: Map<number, string>;
  layoutToMaster: Map<string, string>;
  masterToTheme: Map<string, string>;
  media: Map<string, Uint8Array>;
  mediaResolver?: PptxMediaResolver;
  tableStyles?: XmlNode;
  defaultTextStyle?: XmlNode;
  charts: Map<string, XmlNode>;
  diagramDrawings: Map<string, string>;
  chartThemes: Map<string, PptxTheme>;
  chartStyles: Map<string, XmlNode>;
  chartColorStyles: Map<string, XmlNode>;
  isWps: boolean;
}

/* ---------------------------------------------------------------------------
 * 渲染上下文（原 Tt，jsx 4936-4982；各渲染器共享）
 * -------------------------------------------------------------------------*/

export interface PptxRenderContext {
  presentation: PptxPresentation;
  slide: PptxSlide;
  theme: PptxTheme;
  master: PptxSlideMaster;
  layout: PptxSlideLayout;
  partPath: string;
  layoutPath: string;
  masterPath: string;
  mediaUrlCache: Map<string, string>;
  colorCache: Map<string, { color: string; alpha: number }>;
  /** echarts 实例集合（供 dispose 统一释放） */
  chartInstances?: Set<PptxChartInstance>;
  /** pdfjs 模块/工作者 URL 配置（EMF 内嵌 PDF 渲染） */
  pdfjs?: { moduleUrl?: string; workerUrl?: string } | false;
  signal?: AbortSignal;
  onNavigate?: (nav: { slideIndex?: number; url?: string }) => void;
  /** 异步媒体任务收集器（渲染完成后 await） */
  asyncTasks?: Promise<unknown>[];
  /** 文本测量宿主（未连接时临时挂载用） */
  measurementRoot?: HTMLElement;
  /** 组继承填充节点（grpFill 解析） */
  groupFillNode?: XmlNode;
  /** 组内渲染时跳过占位符子节点 */
  skipPlaceholderChildren?: boolean;
}

/** echarts 实例最小接口（真实实现 = vendor 段 echarts） */
export interface PptxChartInstance {
  setOption(option: unknown): void;
  resize(): void;
  dispose(): void;
  isDisposed(): boolean;
  getDom(): HTMLElement;
}

/** 渲染句柄（原 Eq 返回类型，jsx 44398-44405） */
export interface PptxRenderResult {
  element: HTMLElement;
  ready: Promise<void>;
  dispose(): void;
  [Symbol.dispose](): void;
}
