/* eslint-disable */
/**
 * ============================================================================
 * DocxWasmGlue.tsx — docx-core wasm 装载模块 + API 再导出模块（批次 B5-14 · 逐字重建）
 * ============================================================================
 *
 * 源 chunk（只读，全量逐字重建）：
 *  1. out/renderer/assets/chunk-YE7GQOST-DVtn9d8T.js（428 行）
 *     —— docx-core（first-party Rust crate）wasm 装载/模型克隆管线：
 *     规范化（图像 data → Uint8Array）/ blockId 分配与查重 / 段落·表格·模型
 *     深克隆 / 深冻结 / package → 模型（wasm build_doc_model_from_package）/
 *     字节流 → { package, model }（动态 import src-2FP7IUE6 的 parseDocx）。
 *  2. out/renderer/assets/src-AEHDFCS5-Cut3IAW0.js（25 行）
 *     —— 10 符号公开 API 再导出（VENDOR-MANIFEST-LIBS.md 行 193-199 登记；
 *     台账记「9 符号」为勘误，实测 import/export 各 10，见报告 §2.4）。
 *
 * 两 chunk 合并为本文件：实体化 B5-08 挂接的 deepCloneModel（原 h = P/i 导出）
 * 与 newBlockId（原 v = l/t 导出）declare（LegacyDocEngineC2.tsx §0 行 300-303）。
 *
 * ----------------------------------------------------------------------------
 * §0 混淆名 → 语义名 映射（chunk 行号 / chunk 导出字母 / 公开名）
 * ----------------------------------------------------------------------------
 * 装载/依赖面：
 *   —   → __vite__mapDeps (1-10, vite 依赖映射：src-2FP7IUE6/chunk-WKBPLHUA/
 *         chunk-XBI2PYTU)
 *   e   → preloadModule（declare；preload-helper-BHSF1fZ9.js 的 t 导出，
 *         体例同 XlsxPreviewWasmBridge）
 *   t   → wasmBuildDocModelFromPackage（declare；chunk-WKBPLHUA `r` 导出，原 G：
 *         await 初始化 + wasm 调用 + JSON.parse）
 *   n   → packageToPlainInput（declare；chunk-WKBPLHUA `t` 导出，原 U：
 *         Map 包面 → 纯对象）
 * 规范化族：
 *   r   → toUint8Array (13-16) | i → normalizeImageNode (17-21)
 *   a   → normalizeBlockNode (22-23) | o → normalizeBlock (24-36)
 *   s   → normalizeDocModel (37-56)（导出 u → normalizeDocModel）
 * blockId 族：
 *   c   → blockIdCounter (57) | l → allocateBlockId (58-60)（导出 t；
 *         C2 契约名 newBlockId，原 v）
 *   u   → assignBlockIdsRecursive (61-63) | d → ensureDocModelBlockIds (64-74)
 *         （导出 l）
 *   f   → collectDuplicateBlockIdsRecursive (75-78)
 *   p   → collectDuplicateDocModelBlockIds (80-95)（导出 s）
 * 克隆分派族：
 *   m   → blockIsParagraph (96-98) | h → blockIsTable (99-101)
 *   g   → mapBlockNodes (102-104)
 *   _/v/y/b → cloneNumberingStyle/cloneSpacingStyle/cloneIndentStyle/
 *             cloneBorderSideStyle (105-116，四同构浅克隆)
 *   x   → cloneParagraphBordersStyle (117-125)
 *   S   → cloneParagraphStyleDeep (126-136) | C → cloneRunStyleDeep (137-139)
 *   w   → cloneParagraphNode (140-142)（导出 a）| T → cloneTableNode (143-145)
 *         （导出 o）
 *   E   → cloneParagraphFull (146-240) | D → cloneCellMarginTwips (241-246)
 *   O   → cloneBorderSpec (247-249) | k → cloneTableBordersSpec (250-261)
 *   A   → cloneTableFloatingSpec (262-274) | j → cloneTableFull (275-314)
 *   M   → cloneBlock (315-317) | N → cloneNumberingDefinitions (318-340)
 *   P   → cloneDocModel (341-394)（导出 i；C2 契约名 deepCloneModel，原 h）
 *   F   → deepFreezeRecursive (395-406) | I → deepFreezeDocModel (407-409)
 *         （导出 c）
 *   L   → buildDocModel (410-412)（导出 n）
 *   R   → buildDocModelFromBytes (413-427)（导出 r；动态 import src-2FP7IUE6
 *         契约化为 loadParseDocxModule，见 §0 declare）
 * chunk 末导出行 (428)：{ w as a, I as c, P as i, d as l, L as n, T as o,
 *   R as r, p as s, l as t, s as u }
 * src-AEHDFCS5 再导出（本文件公开导出面）：
 *   allocateBlockId(t) · buildDocModel(n) · buildDocModelFromBytes(r) ·
 *   cloneDocModel(i) · cloneParagraphNode(a) · cloneTableNode(o) ·
 *   collectDuplicateDocModelBlockIds(s) · deepFreezeDocModel(c) ·
 *   ensureDocModelBlockIds(l) · normalizeDocModel(u)
 *
 * 把握度：高 = 逐字对原式（分支/字符串/结构零改动）；本文件全部 30 符号为高，
 * 仅 4 项跨 chunk 依赖为 declare 契约（实现位于 preload-helper/chunk-WKBPLHUA/
 * src-2FP7IUE6，均 first-party Rust glue，另行批次）。
 * ============================================================================
 */

/* ============================================================================
 * §0 外部依赖契约（跨 chunk；真实实现见各行注记）
 * ==========================================================================*/

/** Vite preload helper（preload-helper-BHSF1fZ9.js 的 t 导出；
 *  体例同 XlsxPreviewWasmBridge.tsx） */
declare function preloadModule<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
  baseUrl: string,
): Promise<T>;

/** chunk-WKBPLHUA-Dg0DBfSj.js `t` 导出（原 U）：package Map 面 → 纯对象
 *  （parts/binaryAssets 逐条转纯；wasm ABI 入参准备） */
declare function packageToPlainInput(pkg: DocxCorePackage): {
  parts: Record<string, { name: string; content: string }>;
  binaryAssets: Record<string, Uint8Array>;
};

/** chunk-WKBPLHUA-Dg0DBfSj.js `r` 导出（原 G）：await wasm 初始化 +
 *  build_doc_model_from_package + JSON.parse → 原始模型 */
declare function wasmBuildDocModelFromPackage(input: {
  parts: Record<string, { name: string; content: string }>;
  binaryAssets: Record<string, Uint8Array>;
}): Promise<DocxCoreModel>;

/** 原 `import('./src-2FP7IUE6-ahbsNOoE.js')`（docx-core wasm parseDocx 再导出
 *  模块，9 行；该 chunk 不在本产物内，动态 import 契约化，一行结构偏差留痕） */
declare function loadParseDocxModule(): Promise<{
  parseDocx(buffer: ArrayBuffer): Promise<DocxCorePackage>;
}>;

/* ============================================================================
 * §1 vite 依赖映射（原 1-10 逐字；类型注解为 TS 收敛，运行时不变）
 * ==========================================================================*/

type ViteMapDepsFn = ((indexes: number[]) => string[]) & { f?: string[] };

const __vite__mapDeps: ViteMapDepsFn = (
  indexes: number[],
  self = __vite__mapDeps,
  deps = self.f ||
    (self.f = [
      "./src-2FP7IUE6-ahbsNOoE.js",
      "./chunk-WKBPLHUA-Dg0DBfSj.js",
      "./chunk-XBI2PYTU-8QsfST8j.js",
    ]),
) => indexes.map((index) => deps[index]);

/* ============================================================================
 * §2 docx-core 模型契约（本 chunk 视角；字段集 = 克隆管线读写面）
 * ==========================================================================*/

/** docx 包（parseDocx 产物 / wasm 入参；parts/binaryAssets 为 Map 面） */
export interface DocxCorePackage {
  parts: Map<string, { name: string; content: string }>;
  binaryAssets: Map<string, Uint8Array>;
}

/** 边框规格（表格 8 向克隆面：type/color/sizeEighthPt；余字段透传） */
export interface DocxCoreBorderSide {
  type?: string;
  color?: string;
  sizeEighthPt?: number;
  [key: string]: unknown;
}

/** 段落边框（top/right/bottom/left/between/bar） */
export interface DocxCoreParagraphBorders {
  top?: DocxCoreBorderSide;
  right?: DocxCoreBorderSide;
  bottom?: DocxCoreBorderSide;
  left?: DocxCoreBorderSide;
  between?: DocxCoreBorderSide;
  bar?: DocxCoreBorderSide;
}

/** 表格边框（含斜向 tl2br/tr2bl 与内边框） */
export interface DocxCoreTableBorders {
  top?: DocxCoreBorderSide;
  right?: DocxCoreBorderSide;
  bottom?: DocxCoreBorderSide;
  left?: DocxCoreBorderSide;
  insideH?: DocxCoreBorderSide;
  insideV?: DocxCoreBorderSide;
  tl2br?: DocxCoreBorderSide;
  tr2bl?: DocxCoreBorderSide;
}

/** run 样式（runBorder 子对象随克隆） */
export interface DocxCoreRunStyle {
  runBorder?: DocxCoreBorderSide;
  [key: string]: unknown;
}

/** 段落样式（numbering/spacing/indent/borders/dropCap 子对象随克隆） */
export interface DocxCoreParagraphStyle {
  numbering?: Record<string, unknown>;
  spacing?: Record<string, unknown>;
  indent?: Record<string, unknown>;
  borders?: DocxCoreParagraphBorders;
  dropCap?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 补丁/溯源 run（sourceTextPatch / sourceRunProvenance） */
export interface DocxCorePatchRun {
  style?: DocxCoreRunStyle;
  link?: unknown;
  noteReference?: Record<string, unknown>;
}

/** 表单域 widget（text/checkbox/dropdown 三子面） */
export interface DocxCoreWidget {
  name?: string;
  enabled?: boolean;
  calcOnExit?: boolean;
  text?: { inputType?: string; defaultText?: string; maxLength?: number; textFormat?: string };
  checkbox?: { defaultChecked?: boolean; sizeMode?: string; sizePt?: number };
  dropdown?: { defaultValue?: string };
  [key: string]: unknown;
}

/** 段落子节点三态：文本 / 表单域 / 图片 */
export interface DocxCoreTextChild {
  type: `text`;
  text: string;
  style?: DocxCoreRunStyle;
  link?: unknown;
  noteReference?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DocxCoreFormFieldChild {
  type: `form-field`;
  fieldType?: string;
  sourceKind?: string;
  id?: string;
  tag?: string;
  title?: string;
  placeholder?: string;
  checked?: boolean;
  value?: string;
  options?: { displayText?: string; value?: string }[];
  widget?: DocxCoreWidget;
  checkedSymbol?: string;
  uncheckedSymbol?: string;
  style?: DocxCoreRunStyle;
  link?: unknown;
  sourceXml?: string;
  [key: string]: unknown;
}

export interface DocxCoreImageChild {
  type: `image`;
  src?: string;
  alt?: string;
  widthPx?: number;
  heightPx?: number;
  partName?: string;
  contentType?: string;
  data?: Uint8Array;
  sourceXml?: string;
  crop?: Record<string, unknown>;
  cssFilter?: string;
  cssOpacity?: number;
  floating?: Record<string, unknown>;
  syntheticTextBox?: boolean;
  textBoxText?: string;
  [key: string]: unknown;
}

export type DocxCoreParagraphChild = DocxCoreTextChild | DocxCoreFormFieldChild | DocxCoreImageChild;

/** 段落块 */
export interface DocxCoreParagraph {
  type: `paragraph`;
  blockId?: string;
  style?: DocxCoreParagraphStyle;
  paragraphMarkDeleted?: boolean;
  sourceXml?: string;
  sourceTextPatch?: { runs: DocxCorePatchRun[] };
  sourceRunProvenance?: { runs: DocxCorePatchRun[] };
  children: DocxCoreParagraphChild[];
  [key: string]: unknown;
}

/** 单元格边距（twips 四向） */
export interface DocxCoreCellMargins {
  topTwips?: number;
  rightTwips?: number;
  bottomTwips?: number;
  leftTwips?: number;
}

/** 表格浮动定位（锚定/对齐/四向文本距，twips） */
export interface DocxCoreTableFloating {
  xTwips?: number;
  yTwips?: number;
  leftFromTextTwips?: number;
  rightFromTextTwips?: number;
  topFromTextTwips?: number;
  bottomFromTextTwips?: number;
  horizontalAnchor?: string;
  verticalAnchor?: string;
  horizontalAlign?: string;
  verticalAlign?: string;
}

/** 表格样式 */
export interface DocxCoreTableStyle {
  widthTwips?: number;
  indentTwips?: number;
  layout?: string;
  cellSpacingTwips?: number;
  floating?: DocxCoreTableFloating;
  cellMarginTwips?: DocxCoreCellMargins;
  columnWidthsTwips?: number[];
  borders?: DocxCoreTableBorders;
  [key: string]: unknown;
}

/** 表格单元格 */
export interface DocxCoreTableCell {
  type: `table-cell`;
  style?: { marginTwips?: DocxCoreCellMargins; borders?: DocxCoreTableBorders; [key: string]: unknown };
  nodes: DocxCoreBlock[];
  [key: string]: unknown;
}

/** 表格行 */
export interface DocxCoreTableRow {
  type: `table-row`;
  style?: Record<string, unknown>;
  cells: DocxCoreTableCell[];
  [key: string]: unknown;
}

/** 表格块 */
export interface DocxCoreTable {
  type: `table`;
  blockId?: string;
  sourceXml?: string;
  sourceTextPatches?: { sourceParagraphXml?: string; paragraph: DocxCoreParagraph }[];
  style?: DocxCoreTableStyle;
  rows: DocxCoreTableRow[];
  [key: string]: unknown;
}

export type DocxCoreBlock = DocxCoreParagraph | DocxCoreTable;

/** 页眉/页脚段 */
export interface DocxCoreHeaderFooter {
  partName?: string;
  referenceType?: string;
  nodes: DocxCoreBlock[];
}

/** 节元数据（sections 数组项） */
export interface DocxCoreSectionMeta {
  startNodeIndex?: number;
  sectionPropertiesXml?: string;
  headerSections: DocxCoreHeaderFooter[];
  footerSections: DocxCoreHeaderFooter[];
}

/** 脚注/尾注项 */
export interface DocxCoreNote {
  nodes?: DocxCoreBlock[];
  [key: string]: unknown;
}

/** 段落样式定义（paragraphStyles 数组项） */
export interface DocxCoreParagraphStyleDef {
  runStyle?: DocxCoreRunStyle;
  numbering?: Record<string, unknown>;
  spacing?: Record<string, unknown>;
  indent?: Record<string, unknown>;
  borders?: DocxCoreParagraphBorders;
  [key: string]: unknown;
}

/** 编号级别（abstracts/instances 覆盖共用面） */
export interface DocxCoreNumberingLevel {
  runStyle?: DocxCoreRunStyle;
  pictureBullet?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 编号定义（abstracts + instances） */
export interface DocxCoreNumberingDefinitions {
  abstracts: { abstractNumId: number; levels: DocxCoreNumberingLevel[] }[];
  instances: {
    numId: number;
    abstractNumId: number;
    levelStartOverrides?: Record<string, unknown>;
    levelOverrides?: DocxCoreNumberingLevel[];
  }[];
}

/** 模型元数据 */
export interface DocxCoreMetadata {
  sourceParts?: unknown;
  warnings: unknown[];
  documentPageCount?: unknown;
  documentOpenTag?: unknown;
  documentBackgroundColor?: unknown;
  sectionPropertiesXml?: unknown;
  sections?: DocxCoreSectionMeta[];
  headerSections: DocxCoreHeaderFooter[];
  footerSections: DocxCoreHeaderFooter[];
  paragraphStyles?: DocxCoreParagraphStyleDef[];
  defaultParagraphStyleId?: unknown;
  numberingDefinitions?: DocxCoreNumberingDefinitions;
  compatibility?: Record<string, unknown>;
  footnotes?: DocxCoreNote[];
  endnotes?: DocxCoreNote[];
  comments?: Record<string, unknown>[];
}

/** docx-core 模型（本 chunk 克隆/规范化/冻结的根对象） */
export interface DocxCoreModel {
  nodes: DocxCoreBlock[];
  metadata: DocxCoreMetadata;
}

/* ============================================================================
 * §3 规范化族（原 r/i/a/o/s，chunk 13-56）
 * ==========================================================================*/

/** 原 r（13-16）：data → Uint8Array（已是则直通；数组转换；其余 undefined） */
function toUint8Array(data: unknown): Uint8Array | undefined {
  if (data instanceof Uint8Array) return data;
  if (Array.isArray(data)) return Uint8Array.from(data);
}

/** 原 i（17-21）：图片子节点 data 规范化（引用未变则原样返回） */
function normalizeImageNode(node: DocxCoreParagraphChild): DocxCoreParagraphChild {
  if (node.type !== `image`) return node;
  const image = node;
  const data = toUint8Array(image.data);
  return data === image.data ? node : { ...image, data };
}

/** 原 a（22-23）：块级节点规范化（表格 → normalizeBlock；段落 → 子节点图片规范化） */
function normalizeBlockNode(node: DocxCoreBlock): DocxCoreBlock {
  return node.type === `table` ? normalizeBlock(node) : { ...node, children: node.children.map(normalizeImageNode) };
}

/** 原 o（24-36）：块规范化（段落 → children 映射；表格 → rows/cells/nodes 递归） */
function normalizeBlock(block: DocxCoreBlock): DocxCoreBlock {
  return block.type === `paragraph`
    ? { ...block, children: block.children.map(normalizeImageNode) }
    : {
        ...block,
        rows: block.rows.map((row) => ({
          ...row,
          cells: row.cells.map((cell) => ({ ...cell, nodes: cell.nodes.map(normalizeBlockNode) })),
        })),
      };
}

/** 原 s（37-56）：模型规范化（顶层 nodes + 页眉页脚/节/脚注尾注全量递归；
 *  导出名 normalizeDocModel） */
export function normalizeDocModel(model: DocxCoreModel): DocxCoreModel {
  return {
    ...model,
    nodes: model.nodes.map(normalizeBlock),
    metadata: {
      ...model.metadata,
      headerSections: model.metadata.headerSections.map((section) => ({ ...section, nodes: section.nodes.map(normalizeBlock) })),
      footerSections: model.metadata.footerSections.map((section) => ({ ...section, nodes: section.nodes.map(normalizeBlock) })),
      sections: model.metadata.sections?.map((section) => ({
        ...section,
        headerSections: section.headerSections.map((header) => ({ ...header, nodes: header.nodes.map(normalizeBlock) })),
        footerSections: section.footerSections.map((footer) => ({ ...footer, nodes: footer.nodes.map(normalizeBlock) })),
      })),
      footnotes: model.metadata.footnotes?.map((note) => ({ ...note, nodes: note.nodes?.map(normalizeBlock) })),
      endnotes: model.metadata.endnotes?.map((note) => ({ ...note, nodes: note.nodes?.map(normalizeBlock) })),
    },
  };
}

/* ============================================================================
 * §4 blockId 族（原 c/l/u/d/f/p，chunk 57-95）
 * ==========================================================================*/

/** 原 c（57）：blockId 计数器（起始 1） */
let blockIdCounter = 1;

/** 原 l（58-60）：新 blockId（`b` + 计数；导出名 allocateBlockId；
 *  C2 契约名 newBlockId，原 v） */
export function allocateBlockId(): string {
  const id = blockIdCounter;
  return ((blockIdCounter += 1), `b${id}`);
}

/** 原 u（61-63）：递归赋 blockId（表格 → rows/cells/nodes 深入） */
function assignBlockIdsRecursive(block: DocxCoreBlock): void {
  if (((block.blockId ||= allocateBlockId()), block.type === `table`))
    for (const row of block.rows) for (const cell of row.cells) for (const node of cell.nodes) assignBlockIdsRecursive(node);
}

/** 原 d（64-74）：模型级 blockId 确保（顶层 + 页眉页脚/节内页眉页脚/脚注尾注；
 *  导出名 ensureDocModelBlockIds） */
export function ensureDocModelBlockIds(model: DocxCoreModel): DocxCoreModel {
  model.nodes.forEach(assignBlockIdsRecursive);
  for (const section of model.metadata.headerSections ?? []) section.nodes.forEach(assignBlockIdsRecursive);
  for (const section of model.metadata.footerSections ?? []) section.nodes.forEach(assignBlockIdsRecursive);
  for (const section of model.metadata.sections ?? []) {
    for (const header of section.headerSections ?? []) header.nodes.forEach(assignBlockIdsRecursive);
    for (const footer of section.footerSections ?? []) footer.nodes.forEach(assignBlockIdsRecursive);
  }
  for (const note of model.metadata.footnotes ?? []) note.nodes?.forEach(assignBlockIdsRecursive);
  for (const note of model.metadata.endnotes ?? []) note.nodes?.forEach(assignBlockIdsRecursive);
  return model;
}

/** 原 f（75-78）：重复 blockId 收集（递归；已见集合 + 重复集合双登记） */
function collectDuplicateBlockIdsRecursive(block: DocxCoreBlock, seen: Set<string>, duplicates: Set<string>): void {
  if ((block.blockId && (seen.has(block.blockId) && duplicates.add(block.blockId), seen.add(block.blockId)), block.type === `table`))
    for (const row of block.rows) for (const cell of row.cells) for (const node of cell.nodes) collectDuplicateBlockIdsRecursive(node, seen, duplicates);
}

/** 原 p（80-95）：模型级重复 blockId 收集（顶层 + 页眉页脚/脚注尾注；
 *  节内页眉页脚不在扫描面，原式如此；导出名 collectDuplicateDocModelBlockIds） */
export function collectDuplicateDocModelBlockIds(model: DocxCoreModel): string[] {
  const duplicates = new Set<string>();
  const scanNodes = (nodes: DocxCoreBlock[] | undefined) => {
    if (!nodes) return;
    const seen = new Set<string>();
    nodes.forEach((node) => collectDuplicateBlockIdsRecursive(node, seen, duplicates));
  };
  scanNodes(model.nodes);
  for (const section of model.metadata.headerSections ?? []) scanNodes(section.nodes);
  for (const section of model.metadata.footerSections ?? []) scanNodes(section.nodes);
  for (const note of model.metadata.footnotes ?? []) scanNodes(note.nodes);
  for (const note of model.metadata.endnotes ?? []) scanNodes(note.nodes);
  return Array.from(duplicates);
}

/* ============================================================================
 * §5 克隆分派与样式浅克隆族（原 m/h/g/_/v/y/b/x/S/C，chunk 96-139）
 * ==========================================================================*/

/** 原 m（96-98）：段落块判定 */
function blockIsParagraph(block: DocxCoreBlock): block is DocxCoreParagraph {
  return block.type === `paragraph`;
}

/** 原 h（99-101）：表格块判定 */
function blockIsTable(block: DocxCoreBlock): block is DocxCoreTable {
  return block.type === `table`;
}

/** 原 g（102-104）：块数组映射克隆（段落 → cloneParagraphFull；表格 → cloneTableFull） */
function mapBlockNodes(nodes: DocxCoreBlock[]): DocxCoreBlock[] {
  return nodes.map((node) => (blockIsParagraph(node) ? cloneParagraphFull(node) : blockIsTable(node) ? cloneTableFull(node) : node));
}

/** 原 _（105-107）：numbering 子对象浅克隆 */
function cloneNumberingStyle(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  return value ? { ...value } : void 0;
}

/** 原 v（108-110）：spacing 子对象浅克隆 */
function cloneSpacingStyle(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  return value ? { ...value } : void 0;
}

/** 原 y（111-113）：indent 子对象浅克隆 */
function cloneIndentStyle(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  return value ? { ...value } : void 0;
}

/** 原 b（114-116）：边框单边浅克隆 */
function cloneBorderSideStyle(side: DocxCoreBorderSide | undefined): DocxCoreBorderSide | undefined {
  return side ? { ...side } : void 0;
}

/** 原 x（117-125）：段落边框六向克隆 */
function cloneParagraphBordersStyle(borders: DocxCoreParagraphBorders | undefined): DocxCoreParagraphBorders | undefined {
  if (borders)
    return {
      top: cloneBorderSideStyle(borders.top),
      right: cloneBorderSideStyle(borders.right),
      bottom: cloneBorderSideStyle(borders.bottom),
      left: cloneBorderSideStyle(borders.left),
      between: cloneBorderSideStyle(borders.between),
      bar: cloneBorderSideStyle(borders.bar),
    };
}

/** 原 S（126-136）：段落样式深一档克隆（numbering/spacing/indent/borders/dropCap） */
function cloneParagraphStyleDeep(style: DocxCoreParagraphStyle | undefined): DocxCoreParagraphStyle | undefined {
  if (style)
    return {
      ...style,
      numbering: cloneNumberingStyle(style.numbering),
      spacing: cloneSpacingStyle(style.spacing),
      indent: cloneIndentStyle(style.indent),
      borders: cloneParagraphBordersStyle(style.borders),
      dropCap: style.dropCap ? { ...style.dropCap } : void 0,
    };
}

/** 原 C（137-139）：run 样式克隆（runBorder 随克隆） */
function cloneRunStyleDeep(style: DocxCoreRunStyle | undefined): DocxCoreRunStyle | undefined {
  return style ? { ...style, runBorder: style.runBorder ? { ...style.runBorder } : void 0 } : void 0;
}

/* ============================================================================
 * §6 段落克隆（原 w/E，chunk 140-240）
 * ==========================================================================*/

/** 原 w（140-142）：段落节点克隆入口（导出名 cloneParagraphNode） */
export function cloneParagraphNode(paragraph: DocxCoreParagraph): DocxCoreParagraph {
  return cloneParagraphFull(paragraph);
}

/** 原 E（146-240）：段落全量克隆（样式/补丁/溯源 + 文本/表单域/图片三态子节点） */
function cloneParagraphFull(paragraph: DocxCoreParagraph): DocxCoreParagraph {
  return {
    type: `paragraph`,
    blockId: paragraph.blockId,
    style: cloneParagraphStyleDeep(paragraph.style),
    paragraphMarkDeleted: paragraph.paragraphMarkDeleted,
    sourceXml: paragraph.sourceXml,
    sourceTextPatch: paragraph.sourceTextPatch
      ? {
          runs: paragraph.sourceTextPatch.runs.map((run) => ({
            style: cloneRunStyleDeep(run.style),
            link: run.link,
            noteReference: run.noteReference ? { ...run.noteReference } : void 0,
          })),
        }
      : void 0,
    sourceRunProvenance: paragraph.sourceRunProvenance
      ? {
          runs: paragraph.sourceRunProvenance.runs.map((run) => ({
            style: cloneRunStyleDeep(run.style),
            link: run.link,
            noteReference: run.noteReference ? { ...run.noteReference } : void 0,
          })),
        }
      : void 0,
    children: paragraph.children.map((child): DocxCoreParagraphChild =>
      child.type === `text`
        ? {
            type: `text`,
            text: child.text,
            style: cloneRunStyleDeep(child.style),
            link: child.link,
            noteReference: child.noteReference ? { ...child.noteReference } : void 0,
          }
        : child.type === `form-field`
          ? {
              type: `form-field`,
              fieldType: child.fieldType,
              sourceKind: child.sourceKind,
              id: child.id,
              tag: child.tag,
              title: child.title,
              placeholder: child.placeholder,
              checked: child.checked,
              value: child.value,
              options: child.options?.map((option) => ({ displayText: option.displayText, value: option.value })),
              widget: child.widget
                ? {
                    name: child.widget.name,
                    enabled: child.widget.enabled,
                    calcOnExit: child.widget.calcOnExit,
                    text: child.widget.text
                      ? {
                          inputType: child.widget.text.inputType,
                          defaultText: child.widget.text.defaultText,
                          maxLength: child.widget.text.maxLength,
                          textFormat: child.widget.text.textFormat,
                        }
                      : void 0,
                    checkbox: child.widget.checkbox
                      ? {
                          defaultChecked: child.widget.checkbox.defaultChecked,
                          sizeMode: child.widget.checkbox.sizeMode,
                          sizePt: child.widget.checkbox.sizePt,
                        }
                      : void 0,
                    dropdown: child.widget.dropdown
                      ? { defaultValue: child.widget.dropdown.defaultValue }
                      : void 0,
                  }
                : void 0,
              checkedSymbol: child.checkedSymbol,
              uncheckedSymbol: child.uncheckedSymbol,
              style: child.style ? { ...child.style } : void 0,
              link: child.link,
              sourceXml: child.sourceXml,
            }
          : {
              type: `image`,
              src: child.src,
              alt: child.alt,
              widthPx: child.widthPx,
              heightPx: child.heightPx,
              partName: child.partName,
              contentType: child.contentType,
              data: child.data ? new Uint8Array(child.data) : void 0,
              sourceXml: child.sourceXml,
              crop: child.crop ? { ...child.crop } : void 0,
              cssFilter: child.cssFilter,
              cssOpacity: child.cssOpacity,
              floating: child.floating ? { ...child.floating } : void 0,
              syntheticTextBox: child.syntheticTextBox,
              textBoxText: child.textBoxText,
            },
    ),
  };
}

/* ============================================================================
 * §7 表格克隆族（原 T/D/O/k/A/j，chunk 241-314）
 * ==========================================================================*/

/** 原 D（241-246）：单元格边距克隆（twips 四向） */
function cloneCellMarginTwips(margins: DocxCoreCellMargins | undefined): DocxCoreCellMargins | undefined {
  if (margins)
    return {
      topTwips: margins.topTwips,
      rightTwips: margins.rightTwips,
      bottomTwips: margins.bottomTwips,
      leftTwips: margins.leftTwips,
    };
}

/** 原 O（247-249）：边框规格克隆（type/color/sizeEighthPt 三字段） */
function cloneBorderSpec(spec: DocxCoreBorderSide | undefined): DocxCoreBorderSide | undefined {
  if (spec) return { type: spec.type, color: spec.color, sizeEighthPt: spec.sizeEighthPt };
}

/** 原 k（250-261）：表格边框八向克隆 */
function cloneTableBordersSpec(borders: DocxCoreTableBorders | undefined): DocxCoreTableBorders | undefined {
  if (borders)
    return {
      top: cloneBorderSpec(borders.top),
      right: cloneBorderSpec(borders.right),
      bottom: cloneBorderSpec(borders.bottom),
      left: cloneBorderSpec(borders.left),
      insideH: cloneBorderSpec(borders.insideH),
      insideV: cloneBorderSpec(borders.insideV),
      tl2br: cloneBorderSpec(borders.tl2br),
      tr2bl: cloneBorderSpec(borders.tr2bl),
    };
}

/** 原 A（262-274）：表格浮动定位克隆（10 字段） */
function cloneTableFloatingSpec(floating: DocxCoreTableFloating | undefined): DocxCoreTableFloating | undefined {
  if (floating)
    return {
      xTwips: floating.xTwips,
      yTwips: floating.yTwips,
      leftFromTextTwips: floating.leftFromTextTwips,
      rightFromTextTwips: floating.rightFromTextTwips,
      topFromTextTwips: floating.topFromTextTwips,
      bottomFromTextTwips: floating.bottomFromTextTwips,
      horizontalAnchor: floating.horizontalAnchor,
      verticalAnchor: floating.verticalAnchor,
      horizontalAlign: floating.horizontalAlign,
      verticalAlign: floating.verticalAlign,
    };
}

/** 原 T（143-145）：表格节点克隆入口（导出名 cloneTableNode） */
export function cloneTableNode(table: DocxCoreTable): DocxCoreTable {
  return cloneTableFull(table);
}

/** 原 j（275-314）：表格全量克隆（样式/补丁 + rows/cells 递归） */
function cloneTableFull(table: DocxCoreTable): DocxCoreTable {
  return {
    type: `table`,
    blockId: table.blockId,
    sourceXml: table.sourceXml,
    sourceTextPatches: table.sourceTextPatches?.map((patch) => ({
      sourceParagraphXml: patch.sourceParagraphXml,
      paragraph: cloneParagraphFull(patch.paragraph),
    })),
    style: table.style
      ? {
          widthTwips: table.style.widthTwips,
          indentTwips: table.style.indentTwips,
          layout: table.style.layout,
          cellSpacingTwips: table.style.cellSpacingTwips,
          floating: cloneTableFloatingSpec(table.style.floating),
          cellMarginTwips: cloneCellMarginTwips(table.style.cellMarginTwips),
          columnWidthsTwips: table.style.columnWidthsTwips ? [...table.style.columnWidthsTwips] : void 0,
          borders: cloneTableBordersSpec(table.style.borders),
        }
      : void 0,
    rows: table.rows.map((row): DocxCoreTableRow => ({
      type: `table-row`,
      style: row.style ? { ...row.style } : void 0,
      cells: row.cells.map((cell): DocxCoreTableCell => ({
        type: `table-cell`,
        style: cell.style
          ? { ...cell.style, marginTwips: cloneCellMarginTwips(cell.style.marginTwips), borders: cloneTableBordersSpec(cell.style.borders) }
          : void 0,
        nodes: mapBlockNodes(cell.nodes),
      })),
    })),
  };
}

/* ============================================================================
 * §8 模型级克隆/冻结/构建（原 M/N/P/F/I/L/R，chunk 315-427）
 * ==========================================================================*/

/** 原 M（315-317）：块克隆分派 */
function cloneBlock(block: DocxCoreBlock): DocxCoreBlock {
  return block.type === `paragraph` ? cloneParagraphFull(block) : cloneTableFull(block);
}

/** 原 N（318-340）：编号定义克隆（abstracts/instances + 级别覆盖） */
function cloneNumberingDefinitions(definitions: DocxCoreNumberingDefinitions | undefined): DocxCoreNumberingDefinitions | undefined {
  if (definitions)
    return {
      abstracts: definitions.abstracts.map((abstractNum) => ({
        abstractNumId: abstractNum.abstractNumId,
        levels: abstractNum.levels.map((level) => ({
          ...level,
          runStyle: level.runStyle ? { ...level.runStyle } : void 0,
          pictureBullet: level.pictureBullet ? { ...level.pictureBullet } : void 0,
        })),
      })),
      instances: definitions.instances.map((instance) => ({
        numId: instance.numId,
        abstractNumId: instance.abstractNumId,
        levelStartOverrides: instance.levelStartOverrides ? { ...instance.levelStartOverrides } : void 0,
        levelOverrides: instance.levelOverrides
          ? instance.levelOverrides.map((level) => ({
              ...level,
              runStyle: level.runStyle ? { ...level.runStyle } : void 0,
              pictureBullet: level.pictureBullet ? { ...level.pictureBullet } : void 0,
            }))
          : void 0,
      })),
    };
}

/** 原 P（341-394）：模型深克隆（导出名 cloneDocModel；
 *  C2 契约名 deepCloneModel，原 h；$x/eS 消费） */
export function cloneDocModel(model: DocxCoreModel): DocxCoreModel {
  return {
    nodes: model.nodes.map(cloneBlock),
    metadata: {
      sourceParts: model.metadata.sourceParts,
      warnings: [...model.metadata.warnings],
      documentPageCount: model.metadata.documentPageCount,
      documentOpenTag: model.metadata.documentOpenTag,
      documentBackgroundColor: model.metadata.documentBackgroundColor,
      sectionPropertiesXml: model.metadata.sectionPropertiesXml,
      sections: model.metadata.sections?.map((section) => ({
        startNodeIndex: section.startNodeIndex,
        sectionPropertiesXml: section.sectionPropertiesXml,
        headerSections: (section.headerSections ?? []).map((header) => ({
          partName: header.partName,
          referenceType: header.referenceType,
          nodes: header.nodes.map(cloneBlock),
        })),
        footerSections: (section.footerSections ?? []).map((footer) => ({
          partName: footer.partName,
          referenceType: footer.referenceType,
          nodes: footer.nodes.map(cloneBlock),
        })),
      })),
      headerSections: (model.metadata.headerSections ?? []).map((section) => ({
        partName: section.partName,
        referenceType: section.referenceType,
        nodes: section.nodes.map(cloneBlock),
      })),
      footerSections: (model.metadata.footerSections ?? []).map((section) => ({
        partName: section.partName,
        referenceType: section.referenceType,
        nodes: section.nodes.map(cloneBlock),
      })),
      paragraphStyles: (model.metadata.paragraphStyles ?? []).map((style) => ({
        ...style,
        runStyle: style.runStyle ? { ...style.runStyle } : void 0,
        numbering: cloneNumberingStyle(style.numbering),
        spacing: cloneSpacingStyle(style.spacing),
        indent: cloneIndentStyle(style.indent),
        borders: cloneParagraphBordersStyle(style.borders),
      })),
      defaultParagraphStyleId: model.metadata.defaultParagraphStyleId,
      numberingDefinitions: cloneNumberingDefinitions(model.metadata.numberingDefinitions),
      compatibility: model.metadata.compatibility ? { ...model.metadata.compatibility } : void 0,
      footnotes: model.metadata.footnotes?.map((note) => ({ ...note, nodes: note.nodes?.map(cloneBlock) })),
      endnotes: model.metadata.endnotes?.map((note) => ({ ...note, nodes: note.nodes?.map(cloneBlock) })),
      comments: model.metadata.comments?.map((comment) => ({ ...comment })),
    },
  };
}

/** C2 契约别名（原 h；LegacyDocEngineC2 §0 declare 实体化） */
export const deepCloneModel = cloneDocModel;

/** C2 契约别名（原 v；LegacyDocEngineC2 §0 declare 实体化） */
export const newBlockId = allocateBlockId;

/** 原 F（395-406）：深冻结（跳过已冻结/类型化数组/ArrayBuffer；先冻结后递归） */
function deepFreezeRecursive(value: unknown): void {
  if (
    !(typeof value != `object` || !value) &&
    !(ArrayBuffer.isView(value) || value instanceof ArrayBuffer) &&
    !Object.isFrozen(value)
  ) {
    if ((Object.freeze(value), Array.isArray(value))) {
      for (const item of value) deepFreezeRecursive(item);
      return;
    }
    for (const key of Object.keys(value)) deepFreezeRecursive((value as Record<string, unknown>)[key]);
  }
}

/** 原 I（407-409）：模型深冻结（冻结后原样返回；导出名 deepFreezeDocModel） */
export function deepFreezeDocModel(model: DocxCoreModel): DocxCoreModel {
  return (deepFreezeRecursive(model), model);
}

/** 原 L（410-412）：package → 规范化模型（wasm build_doc_model_from_package；
 *  导出名 buildDocModel） */
export async function buildDocModel(pkg: DocxCorePackage): Promise<DocxCoreModel> {
  return normalizeDocModel(await wasmBuildDocModelFromPackage(packageToPlainInput({ parts: pkg.parts, binaryAssets: pkg.binaryAssets })));
}

/** 原 R（413-427）：字节流 → { package, model }（preload + 动态 import
 *  src-2FP7IUE6 的 parseDocx；导出名 buildDocModelFromBytes） */
export async function buildDocModelFromBytes(bytes: ArrayBuffer | Uint8Array): Promise<{ package: DocxCorePackage; model: DocxCoreModel }> {
  const { parseDocx } = await preloadModule(
      async () => {
        const { parseDocx: parseDocxWasm } = await loadParseDocxModule();
        return { parseDocx: parseDocxWasm };
      },
      __vite__mapDeps([0, 1, 2]),
      import.meta.url,
    );
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const pkg = await parseDocx(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  return { package: pkg, model: await buildDocModel(pkg) };
}

/* ============================================================================
 * 文件尾符号表（原名 → 语义名，chunk 行号，把握度；与文件头 §0 一致）
 * ----------------------------------------------------------------------------
 * 规范化族：r → toUint8Array (13, 高) | i → normalizeImageNode (17, 高)
 *   a → normalizeBlockNode (22, 高) | o → normalizeBlock (24, 高)
 *   s → normalizeDocModel (37, 高)
 * blockId 族：c → blockIdCounter (57, 高) | l → allocateBlockId (58, 高)
 *   u → assignBlockIdsRecursive (61, 高) | d → ensureDocModelBlockIds (64, 高)
 *   f → collectDuplicateBlockIdsRecursive (75, 高)
 *   p → collectDuplicateDocModelBlockIds (80, 高)
 * 克隆分派族：m → blockIsParagraph (96, 高) | h → blockIsTable (99, 高)
 *   g → mapBlockNodes (102, 高) | _ → cloneNumberingStyle (105, 高)
 *   v → cloneSpacingStyle (108, 高) | y → cloneIndentStyle (111, 高)
 *   b → cloneBorderSideStyle (114, 高) | x → cloneParagraphBordersStyle (117, 高)
 *   S → cloneParagraphStyleDeep (126, 高) | C → cloneRunStyleDeep (137, 高)
 * 段落克隆：w → cloneParagraphNode (140, 高) | E → cloneParagraphFull (146, 高)
 * 表格克隆：T → cloneTableNode (143, 高) | D → cloneCellMarginTwips (241, 高)
 *   O → cloneBorderSpec (247, 高) | k → cloneTableBordersSpec (250, 高)
 *   A → cloneTableFloatingSpec (262, 高) | j → cloneTableFull (275, 高)
 * 模型级：M → cloneBlock (315, 高) | N → cloneNumberingDefinitions (318, 高)
 *   P → cloneDocModel (341, 高；别名 deepCloneModel)
 *   F → deepFreezeRecursive (395, 高) | I → deepFreezeDocModel (407, 高)
 *   L → buildDocModel (410, 高) | R → buildDocModelFromBytes (413, 高)
 * 装载面：__vite__mapDeps (1-10, 高)；4 项跨 chunk declare 契约（preloadModule/
 *   packageToPlainInput/wasmBuildDocModelFromPackage/loadParseDocxModule）
 * 把握度统计：高 30 / 中 0（declare 契约 4 项不计入符号统计）。
 * ============================================================================
 */
