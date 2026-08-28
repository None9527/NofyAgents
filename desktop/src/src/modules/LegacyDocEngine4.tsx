/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngine4.tsx — legacy-doc 内部排版引擎 · [E4] 文本编辑指令、分页与布局服务
 * （解混淆重建 · D8 Stage B4 · Office 预览族 / legacy-doc 引擎展开第 4 段）
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，行号锚点均指此）
 * 本文件覆盖：[E4] jsx 13244-14903（登记表作 13244-14901；14902-14903 为
 * Xs 缩略图排除标记，登记表归入本段，一并收入）。
 *
 * 段职责（按实际代码核定；登记表的“DOCX XML → 编辑器模型”为本段前半）：
 *   A. 段落/表格文本编辑（13244-13770）：源 XML 文本补丁凭证（Ra）、
 *      段落文本重设（Ba：子运行按前后缀 diff 重建）、模型级段落/单元格/
 *      深层单元格文本替换（Qa/$a/eo/to）、表格文本补丁登记与失效、
 *      docx 包序列化（no → wasm）。
 *   B. 输入指令（13771-13984）：beforeinput → 编辑指令映射（ro）、
 *      纯文本指令执行（mo：字符/词/行级删除、代理对安全）、
 *      单元格段落合并（go）。
 *   C. 分页提示与页数拟合（13985-14195）：分页符/段前分页探测、
 *      表格行级分页集（缓存）、目标页数校验（Po）、页脚重叠锁存（Io）、
 *      纯估算页选择（Ro）、缩放搜索拟合目标页数（Bo）。
 *   D. 历史归约器（14196-14268）：undo/redo/patch 三态 + 100 步环形历史。
 *   E. 编辑器行布局服务（14269-14835）：带 LRU 缓存的 pre-wrap 测量、
 *      行数统计、排除区（浮动对象）多段行布局、命中测试/光标矩形/
 *      选区矩形/行切片——供 [E6]/[E7] 编辑器渲染层消费。
 *   F. 结构哈希与模型指纹（14836-14901）：FNV-1a 深哈希（字符串采样）、
 *      模型缓存键（qs）、文档元数据指纹（Ys）；缩略图排除标记（Xs）。
 *
 * 依赖：[E2] LegacyDocEngine2（pre-wrap 测量/行数/断行）、
 * [E3] LegacyDocEngine3（模型类型与段落助手）、
 * chunk-WKBPLHUA（wasm 序列化，declare 挂接）、
 * chunk-YE7GQOST（模型克隆，declare 挂接）。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射表（行号 = jsx）
 * ----------------------------------------------------------------------------
 *  A 文本编辑：
 *   Ia/La → COMPLEX_CONTENT_XML_RE/FLD_SIMPLE_RE (13244/13245)
 *   Ra → buildSourceTextPatch (13246) · za → isFieldTextDivergent (13269)
 *   Ba → setParagraphText (13272) · Va → countOccurrences (13277)
 *   Ha → registerTableTextPatch (13284) · Ua → invalidateTableSourceXml (13301)
 *   Wa → paragraphNodeIndexByOrdinal (13304) · Ga → findParagraphByOrdinalDeep (13311)
 *   Ka → splitTextRunsAtOffset (13330) · qa → commonPrefixLength (13372)
 *   Ja → commonSuffixLength (13378) · Ya → diffTextRunsAgainstString (13384)
 *   Xa → rebuildParagraphChildren (13422) · Za → splitParagraphChildrenAroundRange (13510)
 *   Qa → replaceModelParagraphText (13626) · $a → replaceTableCellText (13645)
 *   eo → replaceTableCellParagraphText (13696) · to → replaceTableCellParagraphTextDeep (13723)
 *   no → serializeDocxPackage (13764)
 *  B 输入指令：
 *   ro → mapBeforeInputEvent (13773) · io → inputCommandCategory (13869)
 *   ao → isWhitespaceChar (13882) · oo → prevCharUnitLength (13885)
 *   so → nextCharUnitLength (13892) · co → prevWordStart (13898)
 *   lo → nextWordEnd (13904) · uo → lineStartBefore (13910)
 *   fo → lineEndAfter (13915) · po → splicePlainText (13920)
 *   mo → applyPlainTextInputCommand (13925) · ho → isMergeableTypingEntry (13963)
 *   go → mergeCellParagraphsAtBoundary (13967)
 *  C 分页：
 *   _o/vo → PAGE_BREAK_BR_RE/PAGE_BREAK_BEFORE_RE (13985/13986)
 *   yo → tableBreakCache (13987) · bo → parseBoolXmlAttrDefaultTrue (13988)
 *   xo → hasPageBreakRun (13995) · So → hasPageBreakBefore (13999)
 *   Co → paragraphHasContent (14004) · wo → paragraphHasImage (14007)
 *   To → paragraphHasFormField (14010) · Eo → isPurePageBreakParagraph (14013)
 *   Do → paragraphNodesOf (14016) · Oo → rowHasContent (14019)
 *   ko → contentCellIndexes (14022) · Ao → isTrailingFillRow (14028)
 *   jo → tablePageBreakRowIndexes (14033) · Mo → collectNodePageBreaks (14061)
 *   No → SCALE_SEARCH_STEPS (14079) · Po → pageBudgetSatisfied (14080)
 *   Fo → footerOverlapResolved (14089) · Io → updateOverlapStability (14094)
 *   Lo → memoizePageBuilder (14109) · Ro → chooseEstimatedPages (14121)
 *   zo → isBetterScaleCandidate (14133) · Bo → fitPageCountByScale (14142)
 *  D 历史：
 *   Vo → HISTORY_LIMIT (14196) · Ho → hasOwnProperty (14197)
 *   Uo → createEditorHistoryReducer (14200)
 *  E 布局服务：
 *   Wo/Go/Ko → 缓存容量 (14269-14271) · qo/Jo/Yo → LRU 缓存 (14272-14274)
 *   Xo/Zo → WeakMap 缓存 (14275/14276) · Qo/$o/es → 布局测量宿主 (14277-14278)
 *   ts → canMeasureText (14279) · ns → lruGet (14282) · rs → lruEvict (14286)
 *   is → getLayoutMeasureContext (14293) · as → measureTextWidthPx (14300)
 *   os → measurePrefixWidthPx (14306) · ss → getLayoutGraphemeSegmenter (14309)
 *   cs → graphemeBoundaryOffsets (14313) · ls → graphemeCountOfText (14326)
 *   us → graphemeOrdinalToOffset (14329) · ds → measuredRangeLength (14333)
 *   fs → layoutCacheKey (14357) · ps → fragmentPrefixWidths (14360)
 *   ms → hitTestFragmentX (14369) · hs → nearestLineIndexByY (14381)
 *   gs → measurePreWrapCached (14391) · _s → countWrappedLinesCached (14404)
 *   vs → cloneItemCursor (14418) · ys → isCursorAtItemStart (14424)
 *   bs → normalizeItemCursor (14427) · xs → isItemCursorExhausted (14439)
 *   Ss → measureRestOfItemLine (14442) · Cs → fitItemsIntoInterval (14445)
 *   ws → wouldTruncateItemStart (14493) · Ts → shouldSkipTruncatedFit (14505)
 *   Es → isSegmentCursorAtEnd (14525) · Ds → isCursorAfterHardBreak (14528)
 *   Os → isMidSegmentEnd (14531) · ks → lineEndsMidSegment (14538)
 *   As → canFitIntoAnyInterval (14541) · js → subtractExclusionIntervals (14548)
 *   Ms → layoutPlainTextBlock (14573) · Ns → layoutTextItemsBlock (14656)
 *   Ps → hitTestTextOffset (14746) · Fs → caretRectForOffset (14767)
 *   Is → selectionRangeRects (14789) · Ls → sliceLayoutLines (14813)
 *  F 哈希/指纹：
 *   Rs/zs/Bs/Vs → FNV 常量 (14836-14839) · Hs → fnv1aStep (14840)
 *   Us → hashStringSampled (14845) · Ws → hashValueDeep (14855)
 *   Gs → structuralHashBase36 (14883) · Ks/qs → 缓存结构哈希 (14886)
 *   Js/Ys → 文档元数据指纹 (14892) · Xs → THUMBNAIL_EXCLUDE_ATTR (14902)
 * ============================================================================
 */

import { measurePreWrapLayout, countLayoutLines, breakNextLine } from "./LegacyDocEngine2";
import type { MeasuredText, LineCursor, LineFragment } from "./LegacyDocEngine2";
import {
  paragraphPlainText,
  formFieldDisplayText,
  textChildren,
  createParagraphNode,
  getParagraphNode,
  cloneTextRun,
  cloneFormField,
  cloneImageRun,
  cloneAnyRun,
  cloneRunStyleShallow,
  styleJsonEqual,
  mergeAdjacentTextRuns,
} from "./LegacyDocEngine3";
import type {
  DocxEditorModel,
  DocxParagraphNode,
  DocxTableNode,
  DocxTextRun,
  DocxRun,
  DocxRunStyle,
} from "./LegacyDocEngine3";

/* --- 外部助手接线（A0-S2c：chunk-YE7GQOST 三克隆 declare 改自 DocxWasmGlue
 *     真实导入；Glue 类型族（DocxCore*）与本件类型族不同构，以本地契约类型
 *     绑定，类型层垫片、零运行时影响） --- */
import {
  cloneParagraphNode as cloneParagraphNodeGlue,
  cloneDocModel as cloneDocModelGlue,
  cloneTableNode as cloneTableNodeGlue,
} from "./DocxWasmGlue";

/** 原 m（chunk-YE7GQOST 的 w/E）：段落深克隆（实体：DocxWasmGlue.cloneParagraphNode） */
const cloneParagraphNode = cloneParagraphNodeGlue as unknown as (node: DocxParagraphNode) => DocxParagraphNode;
/** 原 h（chunk-YE7GQOST 的 P）：整模型深克隆（实体：DocxWasmGlue.cloneDocModel） */
const cloneDocModel = cloneDocModelGlue as unknown as (model: DocxEditorModel) => DocxEditorModel;
/** 原 _（chunk-YE7GQOST 的 T/j）：表格深克隆（实体：DocxWasmGlue.cloneTableNode） */
const cloneTableNode = cloneTableNodeGlue as unknown as (node: DocxTableNode) => DocxTableNode;

/* --- chunk-WKBPLHUA 助手：属他批（wasm 序列化 chunk），保留 declare 挂接 --- */

/** docx 包线路格式（原 p 的返回；parts/binaryAssets 为普通对象） */
export interface DocxPackageWireFormat {
  parts: Record<string, { name?: string; content?: string }>;
  binaryAssets: Record<string, Uint8Array>;
}

/** 原 p（chunk-WKBPLHUA 的 U）：包 Map → 线路格式 */
declare function packageToWireFormat(pkg: unknown): DocxPackageWireFormat;
/** 原 f（chunk-WKBPLHUA 的 K）：wasm 序列化为 zip 字节 */
declare function serializeDocxWithWasm(pkg: unknown, options: DocxPackageWireFormat | undefined): Promise<ArrayBuffer>;

/* ============================================================================
 * §A 段落/表格文本编辑（原 Ia..no，jsx 13244-13770）
 * ==========================================================================*/

/** 原 Ia（jsx 13244）：复杂内容探测：域/制表/换行/脚注/修订/批注/书签/SDT 等 —— 数据逐字保留 */
export const COMPLEX_CONTENT_XML_RE = /<(?:w:(?:fldSimple|fldChar|instrText|tab|br|cr|footnoteReference|endnoteReference|drawing|pict|object|sdt|ins|del|conflictIns|conflictDel|moveFrom|moveTo|commentRangeStart|commentRangeEnd|commentReference|bookmarkStart|bookmarkEnd|customXml|smartTag|permStart|permEnd|proofErr|subDoc|altChunk)|mc:AlternateContent)\b/i;
/** 原 La（jsx 13245） —— 数据逐字保留 */
export const FLD_SIMPLE_RE = /<w:fldSimple\b/i;

/**
 * 原 Ra：源 XML 文本补丁凭证——旧/新段落子运行一一对应、
 * 源 XML 无复杂内容（域/图形/修订…）、w:r 与 w:t 计数与运行数一致、
 * 各运行样式/链接/脚注与凭证三方一致时，返回补丁运行凭证。
 */
export function buildSourceTextPatch(
  oldParagraph: DocxParagraphNode,
  newParagraph: DocxParagraphNode,
): { runs: { style?: DocxRunStyle; link?: string; noteReference?: DocxTextRun[`noteReference`] }[] } | undefined {
  const sourceXml = oldParagraph.sourceXml;
  if (
    !sourceXml ||
    COMPLEX_CONTENT_XML_RE.test(sourceXml) ||
    oldParagraph.children.length !== newParagraph.children.length ||
    oldParagraph.children.some((child) => child.type !== `text`) ||
    newParagraph.children.some((child) => child.type !== `text`)
  )
    return;
  const runCount = sourceXml.match(/<w:r\b/gi)?.length ?? 0,
    textTagCount = sourceXml.match(/<w:t\b/gi)?.length ?? 0,
    textElementCount = sourceXml.match(/<w:t\b[^>]*>[\s\S]*?<\/w:t>/gi)?.length ?? 0;
  if (runCount !== oldParagraph.children.length || textTagCount !== oldParagraph.children.length || textElementCount !== oldParagraph.children.length) return;
  // 上方 some() 守卫已保证全部子运行为文本运行（原代码同此语义）
  const oldChildren = oldParagraph.children as DocxTextRun[],
    newChildren = newParagraph.children as DocxTextRun[],
    patchRuns = oldParagraph.sourceTextPatch?.runs ?? oldChildren;
  if (
    oldChildren.every((child, i) => {
      const next = newChildren[i],
        patch = patchRuns[i];
      return (
        !!next &&
        !!patch &&
        child.noteReference === undefined &&
        next.noteReference === undefined &&
        patch.noteReference === undefined &&
        styleJsonEqual(child.style, patch.style) &&
        styleJsonEqual(next.style, patch.style) &&
        child.link === patch.link &&
        next.link === patch.link
      );
    })
  )
    return {
      runs: patchRuns.map((run) => ({
        style: cloneRunStyleShallow(run.style),
        link: run.link,
        noteReference: run.noteReference ? { ...run.noteReference } : undefined,
      })),
    };
}

/** 原 za：段落含 fldSimple 域且纯文本已偏离 → 不可安全重设 */
export function isFieldTextDivergent(paragraph: DocxParagraphNode, newText: string): boolean {
  return paragraphPlainText(paragraph) !== newText && !!(paragraph.sourceXml && FLD_SIMPLE_RE.test(paragraph.sourceXml));
}

/** 原 Ba：段落文本重设（克隆 → 子运行重建 → 补丁凭证；失败则弃源 XML） */
export function setParagraphText(paragraph: DocxParagraphNode, newText: string, options?: ParagraphTextOptions): DocxParagraphNode {
  if (paragraphPlainText(paragraph) === newText) return paragraph;
  const next = cloneParagraphNode(paragraph);
  return (next.children = rebuildParagraphChildren(paragraph, newText, options)), (next.sourceTextPatch = buildSourceTextPatch(paragraph, next)), next.sourceTextPatch || (next.sourceXml = undefined), next;
}

/** 原 Va：不重叠出现次数 */
export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0,
    index = 0;
  for (; index <= haystack.length - needle.length;) {
    const found = haystack.indexOf(needle, index);
    if (found < 0) break;
    (count += 1), (index = found + needle.length);
  }
  return count;
}

/** 原 Ha：表格登记单元格段落文本补丁（源段落 XML 恰出现一次；去重覆盖） */
export function registerTableTextPatch(table: DocxTableNode, sourceParagraph: DocxParagraphNode, patchedParagraph: DocxParagraphNode): boolean {
  const tableXml = table.sourceXml,
    paragraphXml = sourceParagraph.sourceXml;
  if (!tableXml || !paragraphXml || !patchedParagraph.sourceTextPatch || countOccurrences(tableXml, paragraphXml) !== 1) return false;
  const patches = table.sourceTextPatches ?? [],
    entry = { sourceParagraphXml: paragraphXml, paragraph: cloneParagraphNode(patchedParagraph) },
    existing = patches.findIndex((patch) => patch.sourceParagraphXml === paragraphXml);
  return (table.sourceTextPatches = existing < 0 ? [...patches, entry] : patches.map((patch, i) => (i === existing ? entry : patch))), true;
}

/** 原 Ua：表格源 XML/补丁失效（结构已不可逆变更） */
export function invalidateTableSourceXml(table: DocxTableNode): void {
  (table.sourceXml = undefined), (table.sourceTextPatches = undefined);
}

/** 原 Wa：第 n 个段落节点的索引（顶层） */
export function paragraphNodeIndexByOrdinal(nodes: DocxEditorModel[`nodes`], ordinal: number): number | undefined {
  const target = Math.max(0, Math.round(ordinal));
  let seen = 0;
  for (let i = 0; i < nodes.length; i += 1)
    if (nodes[i]?.type === `paragraph`) {
      if (seen === target) return i;
      seen += 1;
    }
}

/** 原 Ga：第 n 个段落节点（深入表格单元格） */
export function findParagraphByOrdinalDeep(nodes: DocxEditorModel[`nodes`], ordinal: number): DocxParagraphNode | undefined {
  const target = Math.max(0, Math.round(ordinal));
  let seen = 0;
  const walk = (list: DocxEditorModel[`nodes`]): DocxParagraphNode | undefined => {
    for (const node of list) {
      if (node.type === `paragraph`) {
        if (seen === target) return node;
        seen += 1;
        continue;
      }
      for (const row of node.rows)
        for (const cell of row.cells) {
          const found = walk(cell.nodes);
          if (found) return found;
        }
    }
  };
  return walk(nodes);
}

/** 原 Ka：文本运行序列按字符偏移切两半（跨界运行拆字） */
export function splitTextRunsAtOffset(runs: DocxTextRun[], offset: number): { left: DocxTextRun[]; right: DocxTextRun[] } {
  const target = Math.max(0, offset),
    left: DocxTextRun[] = [],
    right: DocxTextRun[] = [];
  let cursor = 0;
  for (const run of runs) {
    const length = run.text.length,
      start = cursor,
      end = start + length;
    if ((cursor = end), end <= target) {
      left.push(cloneTextRun(run));
      continue;
    }
    if (start >= target) {
      right.push(cloneTextRun(run));
      continue;
    }
    const cut = Math.max(0, Math.min(length, target - start)),
      head = run.text.slice(0, cut),
      tail = run.text.slice(cut);
    head.length > 0 &&
      left.push({ type: `text`, text: head, style: cloneRunStyleShallow(run.style), link: run.link, noteReference: run.noteReference ? { ...run.noteReference } : undefined }),
      tail.length > 0 &&
        right.push({ type: `text`, text: tail, style: cloneRunStyleShallow(run.style), link: run.link, noteReference: run.noteReference ? { ...run.noteReference } : undefined });
  }
  return { left, right };
}

/** 原 qa：公共前缀长度 */
export function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  for (; index < limit && a[index] === b[index];) index += 1;
  return index;
}

/** 原 Ja：公共后缀长度（不越过前缀） */
export function commonSuffixLength(a: string, b: string, prefixLength: number): number {
  const aRoom = a.length - prefixLength,
    bRoom = b.length - prefixLength,
    limit = Math.min(aRoom, bRoom);
  let index = 0;
  for (; index < limit && a[a.length - 1 - index] === b[b.length - 1 - index];) index += 1;
  return index;
}

/** 段落文本选项（原 Xa/Za/Qa 的尾参） */
export interface ParagraphTextOptions {
  insertedStyle?: DocxRunStyle;
  beforeInsertedStyle?: DocxRunStyle;
  afterInsertedStyle?: DocxRunStyle;
}

/**
 * 原 Ya：新文本对旧运行序列做前后缀 diff——
 * 公共前后缀之间的差异段用插入样式重建，两侧运行按偏移切割保留，
 * 跨界链接合并；结果合并相邻同样式运行。
 */
export function diffTextRunsAgainstString(newText: string, runs: DocxTextRun[], options?: Pick<ParagraphTextOptions, `insertedStyle`>): DocxTextRun[] {
  const target = newText ?? ``;
  if (runs.length === 0) return [{ type: `text`, text: target, style: cloneRunStyleShallow(options?.insertedStyle) }];
  const cloned = runs.map(cloneTextRun),
    oldText = cloned.map((run) => run.text).join(``);
  if (oldText === target) return cloned;
  const prefix = commonPrefixLength(oldText, target),
    suffix = commonSuffixLength(oldText, target, prefix),
    keepStart = prefix,
    keepEnd = Math.max(keepStart, oldText.length - suffix),
    inserted = target.slice(prefix, target.length - suffix),
    headSplit = splitTextRunsAtOffset(cloned, keepStart),
    tailSplit = splitTextRunsAtOffset(headSplit.right, keepEnd - keepStart),
    before = headSplit.left,
    after = tailSplit.right,
    middle: DocxTextRun[] = [];
  if (inserted.length > 0) {
    const prevRun = before[before.length - 1],
      nextRun = after[0],
      link = prevRun?.link && nextRun?.link && prevRun.link === nextRun.link ? prevRun.link : prevRun?.link ?? nextRun?.link;
    middle.push({ type: `text`, text: inserted, style: cloneRunStyleShallow(options?.insertedStyle ?? prevRun?.style ?? nextRun?.style), link });
  }
  const merged = mergeAdjacentTextRuns([...before, ...middle, ...after]);
  return merged.length > 0 ? merged : [{ type: `text`, text: ``, style: cloneRunStyleShallow(options?.insertedStyle ?? runs[0]?.style), link: runs[0]?.link }];
}

/**
 * 原 Xa：段落子运行按新文本重建——
 * 全文本段落走前后缀 diff；含图片段落按图片边界切段 diff；
 * 含表单域段落按域显示文本定位切段（定位失败回退全文 diff）。
 */
export function rebuildParagraphChildren(paragraph: DocxParagraphNode, newText: string, options?: ParagraphTextOptions): DocxRun[] {
  if (!paragraph.children.some((child) => child.type !== `text`)) return diffTextRunsAgainstString(newText, textChildren(paragraph), options);
  const textGroups: DocxTextRun[][] = [],
    objects: (DocxRun & { type: `form-field` | `image` })[] = [];
  let current: DocxTextRun[] = [];
  for (const child of paragraph.children) {
    if (child.type === `text`) {
      current.push(cloneTextRun(child));
      continue;
    }
    textGroups.push(current), (current = []), objects.push(child.type === `form-field` ? cloneFormField(child) : cloneImageRun(child));
  }
  if (textGroups.push(current), objects.length > 0 && objects.every((object) => object.type === `image`)) {
    const groupTexts = textGroups.map((group) => group.map((run) => run.text).join(``)),
      oldText = groupTexts.join(``),
      boundaries: number[] = [];
    let cursor = 0;
    for (let i = 0; i < objects.length; i += 1) (cursor += groupTexts[i]?.length ?? 0), boundaries.push(cursor);
    const prefix = (() => {
        const limit = Math.min(oldText.length, newText.length);
        let index = 0;
        for (; index < limit && oldText[index] === newText[index];) index++;
        return index;
      })(),
      suffix = (() => {
        const oldRoom = oldText.length - prefix,
          newRoom = newText.length - prefix,
          limit = Math.min(oldRoom, newRoom);
        let index = 0;
        for (; index < limit && oldText[oldText.length - 1 - index] === newText[newText.length - 1 - index];) index++;
        return index;
      })(),
      keepStart = prefix,
      keepEnd = Math.max(keepStart, oldText.length - suffix),
      insertedLength = Math.max(keepStart, newText.length - suffix) - keepEnd,
      shifted = boundaries.map((boundary) => (boundary < keepStart ? boundary : boundary >= keepEnd ? boundary + insertedLength : keepStart)),
      segments: string[] = [];
    let segmentStart = 0;
    shifted.forEach((boundary) => {
      const end = Math.max(segmentStart, Math.min(boundary, newText.length));
      segments.push(newText.slice(segmentStart, end)), (segmentStart = end);
    }),
      segments.push(newText.slice(segmentStart));
    const result: DocxRun[] = [];
    for (let i = 0; i < textGroups.length; i += 1) {
      const group = textGroups[i],
        segment = segments[i] ?? ``;
      group.length > 0
        ? result.push(...diffTextRunsAgainstString(segment, group, options))
        : segment.length > 0 && result.push({ type: `text`, text: segment, style: cloneRunStyleShallow(options?.insertedStyle) }),
        i < objects.length && result.push(cloneAnyRun(objects[i]));
    }
    if (result.length > 0) return result;
  }
  const segments: string[] = [];
  let cursor = 0;
  for (let i = 0; i < objects.length; i += 1) {
    const object = objects[i],
      displayText = object.type === `form-field` ? formFieldDisplayText(object) : ``;
    if (!displayText) return diffTextRunsAgainstString(newText, textChildren(paragraph), options);
    const found = newText.indexOf(displayText, cursor);
    if (found < 0) {
      segments.push(newText.slice(cursor)), (cursor = newText.length);
      break;
    }
    segments.push(newText.slice(cursor, found)), (cursor = found + displayText.length);
  }
  for (segments.push(newText.slice(cursor)); segments.length < textGroups.length;) segments.push(``);
  const result: DocxRun[] = [];
  for (let i = 0; i < textGroups.length; i += 1) {
    const group = textGroups[i],
      segment = segments[i] ?? ``;
    group.length > 0
      ? result.push(...diffTextRunsAgainstString(segment, group, options))
      : segment.length > 0 && result.push({ type: `text`, text: segment, style: cloneRunStyleShallow(options?.insertedStyle) }),
      i < objects.length && result.push(cloneAnyRun(objects[i]));
  }
  return result.length > 0 ? result : [{ type: `text`, text: ``, style: cloneRunStyleShallow(options?.insertedStyle) }];
}

/**
 * 原 Za：按范围把段落子运行拆成前后两组（中间被替换文本吞没）——
 * 图片边界按公共前后缀平移对齐；表单域按显示文本定位；
 * 对象落在范围内 → 归前组。空组补空文本运行。
 */
export function splitParagraphChildrenAroundRange(
  paragraph: DocxParagraphNode,
  newText: string,
  startOffset: number,
  endOffset: number,
  options?: ParagraphTextOptions,
): { beforeChildren: DocxRun[]; afterChildren: DocxRun[] } {
  const target = newText ?? ``,
    start = Math.max(0, Math.min(Math.round(startOffset), target.length)),
    end = Math.max(start, Math.min(Math.round(endOffset), target.length));
  if (!paragraph.children.some((child) => child.type !== `text`))
    return {
      beforeChildren: diffTextRunsAgainstString(target.slice(0, start), textChildren(paragraph), { insertedStyle: options?.beforeInsertedStyle }),
      afterChildren: diffTextRunsAgainstString(target.slice(end), textChildren(paragraph), { insertedStyle: options?.afterInsertedStyle }),
    };
  const textGroups: DocxTextRun[][] = [],
    objects: (DocxRun & { type: `form-field` | `image` })[] = [];
  let current: DocxTextRun[] = [];
  for (const child of paragraph.children) {
    if (child.type === `text`) {
      current.push(cloneTextRun(child));
      continue;
    }
    textGroups.push(current), (current = []), objects.push(child.type === `form-field` ? cloneFormField(child) : cloneImageRun(child));
  }
  textGroups.push(current);
  let segments: string[] | undefined,
    objectOffsets: number[] | undefined;
  if (objects.length > 0 && objects.every((object) => object.type === `image`)) {
    const groupTexts = textGroups.map((group) => group.map((run) => run.text).join(``)),
      oldText = groupTexts.join(``),
      boundaries: number[] = [];
    let cursor = 0;
    for (let i = 0; i < objects.length; i += 1) (cursor += groupTexts[i]?.length ?? 0), boundaries.push(cursor);
    const prefix = commonPrefixLength(oldText, target),
      suffix = commonSuffixLength(oldText, target, prefix),
      keepStart = prefix,
      keepEnd = Math.max(keepStart, oldText.length - suffix),
      insertedLength = Math.max(keepStart, target.length - suffix) - keepEnd,
      shifted = boundaries.map((boundary) => (boundary < keepStart ? boundary : boundary >= keepEnd ? boundary + insertedLength : keepStart)),
      pieces: string[] = [];
    let pieceStart = 0;
    shifted.forEach((boundary) => {
      const pieceEnd = Math.max(pieceStart, Math.min(boundary, target.length));
      pieces.push(target.slice(pieceStart, pieceEnd)), (pieceStart = boundary);
    }),
      pieces.push(target.slice(pieceStart)),
      (segments = pieces),
      (objectOffsets = shifted);
  } else {
    const pieces: string[] = [],
      offsets: number[] = [];
    let cursor = 0;
    for (let i = 0; i < objects.length; i += 1) {
      const object = objects[i],
        displayText = object.type === `form-field` ? formFieldDisplayText(object) : ``;
      if (!displayText) {
        (segments = undefined), (objectOffsets = undefined);
        break;
      }
      const found = target.indexOf(displayText, cursor);
      if (found < 0) {
        pieces.push(target.slice(cursor)), (cursor = target.length);
        break;
      }
      pieces.push(target.slice(cursor, found)), (cursor = found + displayText.length), offsets.push(found);
    }
    if (pieces.length > 0 || objects.length === 0) {
      for (pieces.push(target.slice(cursor)); pieces.length < textGroups.length;) pieces.push(``);
      (segments = pieces), (objectOffsets = offsets);
    }
  }
  if (!segments || !objectOffsets)
    return {
      beforeChildren: diffTextRunsAgainstString(target.slice(0, start), textChildren(paragraph), { insertedStyle: options?.beforeInsertedStyle }),
      afterChildren: diffTextRunsAgainstString(target.slice(end), textChildren(paragraph), { insertedStyle: options?.afterInsertedStyle }),
    };
  const before: DocxRun[] = [],
    after: DocxRun[] = [];
  let cursor = 0;
  for (let i = 0; i < textGroups.length; i += 1) {
    const group = textGroups[i],
      segment = segments[i] ?? ``,
      segmentStart = cursor,
      segmentEnd = segmentStart + segment.length;
    cursor = segmentEnd;
    const headPiece = start <= segmentStart ? `` : segment.slice(0, Math.max(0, Math.min(segment.length, start - segmentStart))),
      tailPiece = end >= segmentEnd ? `` : segment.slice(Math.max(0, Math.min(segment.length, end - segmentStart)));
    if (
      (group.length > 0
        ? (headPiece.length > 0 && before.push(...diffTextRunsAgainstString(headPiece, group, { insertedStyle: options?.beforeInsertedStyle })),
          tailPiece.length > 0 && after.push(...diffTextRunsAgainstString(tailPiece, group, { insertedStyle: options?.afterInsertedStyle })))
        : (headPiece.length > 0 && before.push({ type: `text`, text: headPiece, style: cloneRunStyleShallow(options?.beforeInsertedStyle) }),
          tailPiece.length > 0 && after.push({ type: `text`, text: tailPiece, style: cloneRunStyleShallow(options?.afterInsertedStyle) }))),
      i < objects.length
    ) {
      const object = cloneAnyRun(objects[i]),
        offset = objectOffsets[i] ?? segmentEnd;
      offset <= start ? before.push(object) : offset >= end ? after.push(object) : before.push(object);
    }
  }
  return (
    before.length === 0 && before.push({ type: `text`, text: ``, style: cloneRunStyleShallow(options?.beforeInsertedStyle) }),
    after.length === 0 && after.push({ type: `text`, text: ``, style: cloneRunStyleShallow(options?.afterInsertedStyle) }),
    { beforeChildren: before, afterChildren: after }
  );
}

/** 原 Qa：模型级段落文本替换（不可编辑/无变化 → 仅复制节点数组） */
export function replaceModelParagraphText(model: DocxEditorModel, nodeIndex: number, newText: string, options?: ParagraphTextOptions): DocxEditorModel {
  const paragraph = getParagraphNode(model, nodeIndex);
  if (!paragraph) return { ...model, nodes: [...model.nodes] };
  if (isFieldTextDivergent(paragraph, newText)) return model;
  if (paragraphPlainText(paragraph) === newText) return { ...model, nodes: [...model.nodes] };
  const next = setParagraphText(paragraph, newText, options),
    nodes = [...model.nodes];
  return (nodes[nodeIndex] = next), { ...model, nodes };
}

/** 原 $a：表格单元格多行文本替换（按 \n 对位段落；多余行新建；补丁登记） */
export function replaceTableCellText(
  model: DocxEditorModel,
  nodeIndex: number,
  rowIndex: number,
  cellIndex: number,
  newText: string,
  options?: ParagraphTextOptions,
): DocxEditorModel {
  const node = model.nodes[nodeIndex];
  if (!node || node.type !== `table`) return { ...model, nodes: [...model.nodes] };
  const lines = newText.replace(/\r\n/g, `\n`).replace(/\r/g, `\n`).split(`\n`);
  lines.length === 0 && lines.push(``);
  const cell = node.rows[rowIndex]?.cells[cellIndex];
  if (!cell) return { ...model, nodes: [...model.nodes] };
  if (cell.nodes.filter((child) => child.type === `paragraph`).some((paragraph, i) => isFieldTextDivergent(paragraph, lines[i] ?? ``))) return model;
  const nextTable = cloneTableNode(node),
    nextCell = nextTable.rows[rowIndex]?.cells[cellIndex];
  if (!nextCell) return { ...model, nodes: [...model.nodes] };
  const nodes = [...model.nodes];
  nodes[nodeIndex] = nextTable;
  const nextModel = { ...model, nodes },
    paragraphs = nextCell.nodes
      .map((child, i) => ({ node: child, nodeIndex: i }))
      .filter((entry): entry is { node: DocxParagraphNode; nodeIndex: number } => entry.node.type === `paragraph`);
  if (paragraphs.length === 0)
    return nextCell.nodes.push(createParagraphNode(lines[0] ?? ``, { runStyle: cloneRunStyleShallow(options?.insertedStyle) })), invalidateTableSourceXml(nextTable), nextModel;
  let changed = false,
    patchesKept = true;
  if (
    (paragraphs.forEach(({ node: paragraph, nodeIndex: paragraphIndex }, i) => {
      const next = setParagraphText(paragraph, lines[i] ?? ``, options);
      next !== paragraph && ((changed = true), (nextCell.nodes[paragraphIndex] = next), (patchesKept = registerTableTextPatch(nextTable, paragraph, next) && patchesKept));
    }),
    lines.length > paragraphs.length)
  ) {
    (changed = true), (patchesKept = false);
    for (let i = paragraphs.length; i < lines.length; i += 1) nextCell.nodes.push(createParagraphNode(lines[i] ?? ``, { runStyle: cloneRunStyleShallow(options?.insertedStyle) }));
  }
  return changed ? (patchesKept || invalidateTableSourceXml(nextTable), nextModel) : model;
}

/** 原 eo：表格单元格内指定序号段落文本替换（顶层段落序号） */
export function replaceTableCellParagraphText(
  model: DocxEditorModel,
  nodeIndex: number,
  rowIndex: number,
  cellIndex: number,
  paragraphOrdinal: number,
  newText: string,
  options?: ParagraphTextOptions,
): DocxEditorModel {
  const node = model.nodes[nodeIndex];
  if (!node || node.type !== `table`) return { ...model, nodes: [...model.nodes] };
  const cell = node.rows[rowIndex]?.cells[cellIndex],
    paragraphIndex = cell ? paragraphNodeIndexByOrdinal(cell.nodes, paragraphOrdinal) : undefined,
    paragraph = paragraphIndex === undefined ? undefined : cell?.nodes[paragraphIndex];
  if (!cell || !paragraph || paragraph.type !== `paragraph`) return { ...model, nodes: [...model.nodes] };
  if (isFieldTextDivergent(paragraph, newText) || paragraphPlainText(paragraph) === newText) return model;
  const nextTable = cloneTableNode(node),
    nextCell = nextTable.rows[rowIndex]?.cells[cellIndex],
    nextParagraphIndex = nextCell ? paragraphNodeIndexByOrdinal(nextCell.nodes, paragraphOrdinal) : undefined,
    nextParagraph = nextParagraphIndex === undefined ? undefined : nextCell?.nodes[nextParagraphIndex];
  if (!nextCell || !nextParagraph || nextParagraph.type !== `paragraph` || nextParagraphIndex === undefined) return { ...model, nodes: [...model.nodes] };
  const replaced = setParagraphText(nextParagraph, newText, options);
  (nextCell.nodes[nextParagraphIndex] = replaced), registerTableTextPatch(nextTable, nextParagraph, replaced) || invalidateTableSourceXml(nextTable);
  const nodes = [...model.nodes];
  return (nodes[nodeIndex] = nextTable), { ...model, nodes };
}

/** 原 to：表格单元格深层段落文本替换（嵌套表格递归，祖先链登记补丁） */
export function replaceTableCellParagraphTextDeep(
  model: DocxEditorModel,
  nodeIndex: number,
  rowIndex: number,
  cellIndex: number,
  paragraphOrdinal: number,
  newText: string,
  options?: ParagraphTextOptions,
): DocxEditorModel {
  const node = model.nodes[nodeIndex];
  if (!node || node.type !== `table`) return { ...model, nodes: [...model.nodes] };
  const cell = node.rows[rowIndex]?.cells[cellIndex],
    paragraph = cell ? findParagraphByOrdinalDeep(cell.nodes, paragraphOrdinal) : undefined;
  if (!paragraph) return { ...model, nodes: [...model.nodes] };
  if (isFieldTextDivergent(paragraph, newText) || paragraphPlainText(paragraph) === newText) return model;
  const nextModel = cloneDocModel(model),
    nextTable = nextModel.nodes[nodeIndex];
  if (!nextTable || nextTable.type !== `table`) return nextModel;
  const nextCell = nextTable.rows[rowIndex]?.cells[cellIndex];
  if (!nextCell) return nextModel;
  const target = Math.max(0, Math.round(paragraphOrdinal));
  let seen = 0;
  const walk = (list: DocxEditorModel[`nodes`], ancestors: DocxTableNode[]): boolean => {
    for (let i = 0; i < list.length; i += 1) {
      const child = list[i];
      if (child) {
        if (child.type === `paragraph`) {
          if (seen !== target) {
            seen += 1;
            continue;
          }
          const replaced = setParagraphText(child, newText, options);
          return (
            (list[i] = replaced),
            ancestors.forEach((ancestor) => {
              registerTableTextPatch(ancestor, child, replaced) || invalidateTableSourceXml(ancestor);
            }),
            true
          );
        }
        ancestors.push(child);
        for (const row of child.rows) for (const innerCell of row.cells) if (walk(innerCell.nodes, ancestors)) return ancestors.pop(), true;
        ancestors.pop();
      }
    }
    return false;
  };
  return walk(nextCell.nodes, [nextTable]), nextModel;
}

/** 原 no：docx 包序列化（线路格式转换 + wasm zip；无选项直传） */
export function serializeDocxPackage(pkg: unknown, options?: unknown): Promise<ArrayBuffer> {
  return serializeDocxWithWasm(pkg, options ? packageToWireFormat(options) : undefined);
}

/* ============================================================================
 * §B 输入指令（原 ro..go，jsx 13773-13984）
 * ==========================================================================*/

/** beforeinput 事件载荷（原 ro 的 e 参数） */
export interface BeforeInputPayload {
  inputType: string;
  data?: string;
  dataTransferText?: string;
}

/** 编辑指令（原 ro 返回域） */
export type DocxInputCommand =
  | { kind: `insertText`; text: string }
  | { kind: `replaceText`; text: string }
  | { kind: `insertParagraph` }
  | { kind: `insertLineBreak` }
  | { kind: `deleteContent`; direction: `backward` | `forward`; unit: `character` | `word` | `line` | `entire-line` }
  | { kind: `deleteRange` }
  | { kind: `historyUndo` }
  | { kind: `historyRedo` }
  | { kind: `blocked` };

/**
 * 原 ro：beforeinput → 编辑指令——
 * 输入法组合态（insert/deleteCompositionText）不映射（返回 undefined）；
 * 粘贴/拖放优先 dataTransfer 文本；yank/引用粘贴取 data；
 * 删除类按方向×粒度展开；历史指令透传；其余 → blocked。
 */
export function mapBeforeInputEvent(event: BeforeInputPayload): DocxInputCommand | undefined {
  const data = event.data ?? event.dataTransferText ?? ``,
    transferText = event.dataTransferText ?? event.data ?? ``;
  switch (event.inputType) {
    case `insertCompositionText`:
    case `deleteCompositionText`:
      return;
    case `insertText`:
    case `insertFromYank`:
    case `insertFromPasteAsQuotation`:
      return { kind: `insertText`, text: data };
    case `insertFromPaste`:
    case `insertFromDrop`:
      return { kind: `insertText`, text: transferText };
    case `insertReplacementText`:
    case `insertTranspose`:
      return { kind: `replaceText`, text: data };
    case `insertParagraph`:
      return { kind: `insertParagraph` };
    case `insertLineBreak`:
      return { kind: `insertLineBreak` };
    case `deleteContentBackward`:
      return { kind: `deleteContent`, direction: `backward`, unit: `character` };
    case `deleteContentForward`:
      return { kind: `deleteContent`, direction: `forward`, unit: `character` };
    case `deleteWordBackward`:
      return { kind: `deleteContent`, direction: `backward`, unit: `word` };
    case `deleteWordForward`:
      return { kind: `deleteContent`, direction: `forward`, unit: `word` };
    case `deleteSoftLineBackward`:
    case `deleteHardLineBackward`:
      return { kind: `deleteContent`, direction: `backward`, unit: `line` };
    case `deleteSoftLineForward`:
    case `deleteHardLineForward`:
      return { kind: `deleteContent`, direction: `forward`, unit: `line` };
    case `deleteEntireSoftLine`:
      return { kind: `deleteContent`, direction: `backward`, unit: `entire-line` };
    case `deleteContent`:
    case `deleteByCut`:
    case `deleteByDrag`:
      return { kind: `deleteRange` };
    case `historyUndo`:
      return { kind: `historyUndo` };
    case `historyRedo`:
      return { kind: `historyRedo` };
    default:
      return { kind: `blocked` };
  }
}

/** 原 io：指令 → 编辑类别（插入/删除；其余无类别） */
export function inputCommandCategory(command: DocxInputCommand): `insert` | `delete` | undefined {
  switch (command.kind) {
    case `insertText`:
    case `insertLineBreak`:
    case `replaceText`:
      return `insert`;
    case `deleteContent`:
    case `deleteRange`:
      return `delete`;
    default:
      return;
  }
}

/** 原 ao：空白字符判定 */
export function isWhitespaceChar(ch: string | undefined): boolean {
  return /\s/.test(ch ?? ``);
}

/** 原 oo：offset 前一字符的 UTF-16 单元数（代理对 = 2） */
export function prevCharUnitLength(text: string, offset: number): number {
  if (offset >= 2) {
    const codePoint = text.codePointAt(offset - 2);
    if (codePoint !== undefined && codePoint > 65535) return 2;
  }
  return +(offset > 0);
}

/** 原 so：offset 处字符的 UTF-16 单元数 */
export function nextCharUnitLength(text: string, offset: number): number {
  if (offset >= text.length) return 0;
  const codePoint = text.codePointAt(offset);
  return codePoint !== undefined && codePoint > 65535 ? 2 : 1;
}

/** 原 co：前一词起点（跳过尾随空白与词体） */
export function prevWordStart(text: string, offset: number): number {
  let index = offset;
  for (; index > 0 && isWhitespaceChar(text[index - 1]);) --index;
  for (; index > 0 && !isWhitespaceChar(text[index - 1]);) --index;
  return index;
}

/** 原 lo：后一词终点 */
export function nextWordEnd(text: string, offset: number): number {
  let index = offset;
  for (; index < text.length && isWhitespaceChar(text[index]);) index += 1;
  for (; index < text.length && !isWhitespaceChar(text[index]);) index += 1;
  return index;
}

/** 原 uo：行首（前一 \n 之后） */
export function lineStartBefore(text: string, offset: number): number {
  const index = text.lastIndexOf(`\n`, Math.max(0, offset - 1));
  return index < 0 ? 0 : index + 1;
}

/** 原 fo：行尾（下一 \n 处；紧邻则跨过） */
export function lineEndAfter(text: string, offset: number): number {
  const index = text.indexOf(`\n`, offset);
  return index < 0 ? text.length : index === offset ? offset + 1 : index;
}

/** 原 po：区间替换并返回新文本与光标位 */
export function splicePlainText(text: string, start: number, end: number, insertion: string): { text: string; caret: number } {
  return { text: `${text.slice(0, start)}${insertion}${text.slice(end)}`, caret: start + insertion.length };
}

/**
 * 原 mo：纯文本指令执行——
 * 插入/替换（\r 归一）、软换行、区间删除、字符/词/行级方向删除
 * （整行 = 行首到行尾；代理对单元安全）；无变化 → undefined。
 */
export function applyPlainTextInputCommand(text: string, rawStart: number, rawEnd: number, command: DocxInputCommand): { text: string; caret: number } | undefined {
  const start = Math.max(0, Math.min(Math.round(rawStart), text.length)),
    end = Math.max(start, Math.min(Math.round(rawEnd), text.length));
  switch (command.kind) {
    case `insertText`:
    case `replaceText`: {
      const insertion = command.text.replace(/\r\n?/g, `\n`);
      return insertion.length === 0 && start === end ? undefined : splicePlainText(text, start, end, insertion);
    }
    case `insertLineBreak`:
      return splicePlainText(text, start, end, `\n`);
    case `deleteRange`:
      return start === end ? undefined : splicePlainText(text, start, end, ``);
    case `deleteContent`: {
      if (start !== end) return splicePlainText(text, start, end, ``);
      if (command.direction === `backward`) {
        if (command.unit === `entire-line`) {
          const lineStart = lineStartBefore(text, start),
            lineEndIndex = text.indexOf(`\n`, start),
            lineEnd = lineEndIndex < 0 ? text.length : lineEndIndex;
          return lineStart === lineEnd ? undefined : splicePlainText(text, lineStart, lineEnd, ``);
        }
        if (start === 0) return;
        const target = command.unit === `character` ? start - prevCharUnitLength(text, start) : command.unit === `word` ? prevWordStart(text, start) : lineStartBefore(text, start);
        return target >= start ? undefined : splicePlainText(text, target, start, ``);
      }
      if (start >= text.length) return;
      const target = command.unit === `character` ? start + nextCharUnitLength(text, start) : command.unit === `word` ? nextWordEnd(text, start) : lineEndAfter(text, start);
      return target <= start ? undefined : splicePlainText(text, start, target, ``);
    }
    default:
      return;
  }
}

/** 打字合并条目（原 ho 比较形态） */
export interface TypingHistoryEntry {
  key: string;
  at: number;
  caretBefore: number;
  caretAfter: number;
}

/** 原 ho：相邻键入可合并（同键、1s 内、光标衔接） */
export function isMergeableTypingEntry(previous: TypingHistoryEntry | undefined, next: TypingHistoryEntry, windowMs = 1000): boolean {
  return !!(previous && previous.key === next.key && next.at >= previous.at && next.at - previous.at <= windowMs && previous.caretAfter === next.caretBefore);
}

/**
 * 原 go：单元格内相邻段落合并（退格跨段）——
 * 第 t-1 与第 t 段拼接，返回合并后单元格文本与合并点光标
 * （段落序号 + 段内偏移）。
 */
export function mergeCellParagraphsAtBoundary(paragraphTexts: string[], boundaryIndex: number): { cellText: string; caretParagraphIndex: number; caretOffset: number } | undefined {
  if (boundaryIndex <= 0 || boundaryIndex >= paragraphTexts.length) return;
  const cellText = [...paragraphTexts.slice(0, boundaryIndex - 1), `${paragraphTexts[boundaryIndex - 1]}${paragraphTexts[boundaryIndex]}`, ...paragraphTexts.slice(boundaryIndex + 1)].join(`\n`);
  let caretAbsolute = 0;
  for (let i = 0; i < boundaryIndex - 1; i += 1) caretAbsolute += paragraphTexts[i].length + 1;
  caretAbsolute += paragraphTexts[boundaryIndex - 1].length;
  const lines = cellText.split(`\n`);
  let remainder = caretAbsolute,
    paragraphIndex = 0;
  for (; paragraphIndex < lines.length - 1 && remainder > lines[paragraphIndex].length;) (remainder -= lines[paragraphIndex].length + 1), (paragraphIndex += 1);
  return { cellText, caretParagraphIndex: paragraphIndex, caretOffset: Math.max(0, Math.min(remainder, lines[paragraphIndex].length)) };
}

/* ============================================================================
 * §C 分页提示与页数拟合（原 _o..Bo，jsx 13985-14195）
 * ==========================================================================*/

/** 原 _o（jsx 13985）：w:br w:type=page —— 数据逐字保留 */
export const PAGE_BREAK_BR_RE = /<w:br\b[^>]*w:type="page"[^>]*\/?>/i;
/** 原 vo（jsx 13986）：w:pageBreakBefore —— 数据逐字保留 */
export const PAGE_BREAK_BEFORE_RE = /<w:pageBreakBefore\b[^>]*\/?>/i;

const tableBreakCache = new Map<string, { startRowIndexes: number[]; breakAfterTable: boolean }>(); // 原 yo

/** 原 bo：XML 布尔属性（缺省视为真；0/false/off/no 为假） */
export function parseBoolXmlAttrDefaultTrue(xml: string | undefined): boolean {
  if (!xml) return false;
  const value = xml.match(/\bw:val="([^"]+)"/i)?.[1]?.trim().toLowerCase();
  return value ? ![`0`, `false`, `off`, `no`].includes(value) : true;
}

/** 原 xo：段落含行内分页符（w:br type=page） */
export function hasPageBreakRun(paragraph: DocxParagraphNode): boolean {
  const xml = paragraph.sourceXml ?? ``;
  return xml.length > 0 && PAGE_BREAK_BR_RE.test(xml);
}

/** 原 So：段落段前分页（样式标记或 w:pageBreakBefore） */
export function hasPageBreakBefore(paragraph: DocxParagraphNode): boolean {
  if ((paragraph.style as { pageBreakBefore?: boolean } | undefined)?.pageBreakBefore === true) return true;
  const xml = paragraph.sourceXml ?? ``;
  return xml ? parseBoolXmlAttrDefaultTrue(xml.match(PAGE_BREAK_BEFORE_RE)?.[0]) : false;
}

/** 原 Co：段落有可见内容（非空文本/有值表单域） */
export function paragraphHasContent(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => (child.type === `text` && child.text.trim().length > 0) || (child.type === `form-field` && (child.value ?? ``).trim().length > 0));
}

/** 原 wo：段落含图片 */
export function paragraphHasImage(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `image`);
}

/** 原 To：段落含表单域 */
export function paragraphHasFormField(paragraph: DocxParagraphNode): boolean {
  return paragraph.children.some((child) => child.type === `form-field`);
}

/** 原 Eo：纯分页符段落（仅分页、无内容/图片/表单域） */
export function isPurePageBreakParagraph(paragraph: DocxParagraphNode): boolean {
  return hasPageBreakRun(paragraph) && !paragraphHasContent(paragraph) && !paragraphHasImage(paragraph) && !paragraphHasFormField(paragraph);
}

/** 原 Do：节点中的段落 */
export function paragraphNodesOf(nodes: DocxEditorModel[`nodes`]): DocxParagraphNode[] {
  return nodes.filter((node): node is DocxParagraphNode => node.type === `paragraph`);
}

/** 原 Oo：表格行有内容（纯分页段落不计） */
export function rowHasContent(row: DocxTableNode[`rows`][number]): boolean {
  return row.cells.some((cell) => paragraphNodesOf(cell.nodes).some((paragraph) => (isPurePageBreakParagraph(paragraph) ? false : paragraphHasContent(paragraph) || paragraphHasImage(paragraph) || paragraphHasFormField(paragraph) || hasPageBreakRun(paragraph))));
}

/** 原 ko：行内有内容的单元格索引 */
export function contentCellIndexes(row: DocxTableNode[`rows`][number]): number[] {
  const indexes: number[] = [];
  return (
    row.cells.forEach((cell, index) => {
      paragraphNodesOf(cell.nodes).some((paragraph) => (isPurePageBreakParagraph(paragraph) ? false : paragraphHasContent(paragraph) || paragraphHasImage(paragraph) || paragraphHasFormField(paragraph) || hasPageBreakRun(paragraph))) && indexes.push(index);
    }),
    indexes
  );
}

/** 原 Ao：单行表格的尾部填充行判定（≥4 列且仅末列有内容） */
export function isTrailingFillRow(table: DocxTableNode, row: DocxTableNode[`rows`][number]): boolean {
  if (table.rows.length !== 1 || row.cells.length < 4) return false;
  const indexes = contentCellIndexes(row);
  return indexes.length === 1 && indexes[0] >= row.cells.length - 1;
}

/**
 * 原 jo：表格行级分页集——各行内段落的分页符推导“自该行起新页”
 * （首行纯分页段落且行有内容且非尾部填充行 → 记当前行，否则下一行）；
 * 越界 → 表后分页。按源 XML 缓存。
 */
export function tablePageBreakRowIndexes(table: DocxTableNode): { startRowIndexes: number[]; breakAfterTable: boolean } {
  const xml = table.sourceXml ?? ``;
  if (xml) {
    const cached = tableBreakCache.get(xml);
    if (cached) return cached;
  }
  const startRows = new Set<number>();
  let breakAfterTable = false;
  table.rows.forEach((row, rowIndex) => {
    let earliest: number | undefined;
    if (
      (row.cells.forEach((cell) => {
        paragraphNodesOf(cell.nodes).forEach((paragraph) => {
          if (!hasPageBreakRun(paragraph) || (isPurePageBreakParagraph(paragraph) && rowIndex === 0 && rowHasContent(row) && !isTrailingFillRow(table, row))) return;
          const target = isPurePageBreakParagraph(paragraph) ? rowIndex : rowIndex + 1;
          (earliest === undefined || target < earliest) && (earliest = target);
        });
      }),
      earliest !== undefined)
    ) {
      if (earliest >= table.rows.length) {
        breakAfterTable = true;
        return;
      }
      startRows.add(Math.max(0, earliest));
    }
  });
  const result = { startRowIndexes: [...startRows].sort((a, b) => a - b), breakAfterTable };
  return xml && tableBreakCache.set(xml, result), result;
}

/** 原 Mo：节点序列的分页点集（段前分页/行内分页/表格行分页/表后分页） */
export function collectNodePageBreaks(nodes: DocxEditorModel[`nodes`]): Set<number> {
  const breaks = new Set<number>();
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i],
      hasNext = i + 1 < nodes.length;
    if (node.type === `paragraph`) {
      hasPageBreakBefore(node) && breaks.add(i), hasNext && hasPageBreakRun(node) && breaks.add(i + 1);
      continue;
    }
    const tableBreaks = tablePageBreakRowIndexes(node);
    tableBreaks.startRowIndexes.includes(0) && i > 0 && breaks.add(i), hasNext && tableBreaks.breakAfterTable && breaks.add(i + 1);
  }
  for (const index of [...breaks]) (index <= 0 || index >= nodes.length) && breaks.delete(index);
  return breaks;
}

/** 原 No：缩放搜索的区间细分步数 */
const SCALE_SEARCH_STEPS = 10;

/** 页数预算输入（原 Po 参数） */
export interface PageBudgetInput {
  estimatedPageCount: number;
  targetPageCount: number;
  renderedBreakHintPageCount?: number;
  hasLastRenderedPageBreakHints?: boolean;
  hasMeasuredBodyFooterOverlap?: boolean;
}

/** 原 Po：目标页数预算是否满足——目标 ≥ 估算直接通过；
 * 有测量/提示时要求目标 ≥ 渲染提示页数 */
export function pageBudgetSatisfied(input: PageBudgetInput): boolean {
  const estimated = Math.max(1, Math.round(input.estimatedPageCount)),
    target = Math.max(1, Math.round(input.targetPageCount));
  if (target >= estimated) return true;
  const hintPageCount = Number.isFinite(input.renderedBreakHintPageCount) ? Math.max(1, Math.round(input.renderedBreakHintPageCount!)) : undefined,
    hintsSatisfied = input.hasLastRenderedPageBreakHints === true && hintPageCount !== undefined && target >= hintPageCount;
  return input.hasMeasuredBodyFooterOverlap === true || input.hasLastRenderedPageBreakHints === true ? hintsSatisfied : true;
}

/** 原 Fo：页脚重叠已解决（实测重叠且页数不超目标） */
export function footerOverlapResolved(input: { pageCount: number; targetPageCount: number; measuredBodyFooterOverlap: boolean }): boolean {
  if (input.measuredBodyFooterOverlap !== true) return false;
  const target = Number.isFinite(input.targetPageCount) ? Math.max(1, Math.round(input.targetPageCount)) : undefined;
  return target === undefined ? false : Math.max(1, Math.round(input.pageCount)) <= target;
}

/** 原 Io：页脚重叠签名稳定性（连续同签名达阈值 → 锁存） */
export function updateOverlapStability(input: {
  pageCount: number;
  targetPageCount: number;
  overlappingPageIndexes: number[];
  previousSignature?: string;
  previousConsecutivePasses?: number;
  stabilityThreshold?: number;
}): { signature: string | undefined; consecutivePasses: number; shouldLatch: boolean } {
  if (
    !footerOverlapResolved({
      pageCount: input.pageCount,
      targetPageCount: input.targetPageCount,
      measuredBodyFooterOverlap: input.overlappingPageIndexes.length > 0,
    })
  )
    return { signature: undefined, consecutivePasses: 0, shouldLatch: false };
  const signature = input.overlappingPageIndexes.map((index) => `${index}`).join(`|`),
    consecutivePasses = signature === input.previousSignature ? Math.max(0, Math.round(input.previousConsecutivePasses ?? 0)) + 1 : 1;
  return { signature, consecutivePasses, shouldLatch: consecutivePasses >= Math.max(1, Math.round(input.stabilityThreshold ?? 1)) };
}

/** 原 Lo：页面构建器三键记忆化（行高表/页高表/严格分页集） */
export function memoizePageBuilder<Page>(
  builder: (rowHeights: unknown, pageHeights: unknown, strictBreaks: unknown) => Page[],
): (rowHeights: unknown, pageHeights: unknown, strictBreaks: unknown) => Page[] {
  const entries: { measuredTableRowHeightsByNodeIndex: unknown; measuredPageContentHeightsPxByPageIndex: unknown; strictLastRenderedParagraphStartBreaks: unknown; pages: Page[] }[] = [];
  return (rowHeights, pageHeights, strictBreaks) => {
    const hit = entries.find(
      (entry) => entry.measuredTableRowHeightsByNodeIndex === rowHeights && entry.measuredPageContentHeightsPxByPageIndex === pageHeights && entry.strictLastRenderedParagraphStartBreaks === strictBreaks,
    );
    if (hit) return hit.pages;
    const pages = builder(rowHeights, pageHeights, strictBreaks);
    return entries.push({ measuredTableRowHeightsByNodeIndex: rowHeights, measuredPageContentHeightsPxByPageIndex: pageHeights, strictLastRenderedParagraphStartBreaks: strictBreaks, pages }), pages;
  };
}

/** 原 Ro：纯估算页选择——无历史、有测量、全部为拆分段且页数更省时采用 */
export function chooseEstimatedPages<Page>(input: {
  canUndo: boolean;
  canRedo: boolean;
  hasMeasuredPageContentHeights: boolean;
  measuredEstimatedPages: Page[];
  pageContainsOnlySplitParagraphSegments: (page: Page) => boolean;
  buildPureEstimatedPages: () => Page[];
}): { pages: Page[]; usedPureEstimatedPages: boolean } {
  if (input.canUndo || input.canRedo || !input.hasMeasuredPageContentHeights || !(input.measuredEstimatedPages.length > 0 && input.measuredEstimatedPages.every(input.pageContainsOnlySplitParagraphSegments)))
    return { pages: input.measuredEstimatedPages, usedPureEstimatedPages: false };
  const pure = input.buildPureEstimatedPages();
  return pure.length > 0 && pure.every(input.pageContainsOnlySplitParagraphSegments) && pure.length < input.measuredEstimatedPages.length
    ? { pages: pure, usedPureEstimatedPages: true }
    : { pages: input.measuredEstimatedPages, usedPureEstimatedPages: false };
}

/** 原 zo：缩放候选优劣比较（页数差优先，其次贴近 1.0，页数命中者优先） */
export function isBetterScaleCandidate(candidate: { pageCount: number; scale: number }, best: { pageCount: number; scale: number }, targetPageCount: number): boolean {
  const candidateDiff = Math.abs(candidate.pageCount - targetPageCount),
    bestDiff = Math.abs(best.pageCount - targetPageCount);
  if (candidateDiff !== bestDiff) return candidateDiff < bestDiff;
  const candidateScale = Math.abs(candidate.scale - 1),
    bestScale = Math.abs(best.scale - 1);
  return candidateScale === bestScale ? candidate.pageCount === targetPageCount && best.pageCount !== targetPageCount : candidateScale < bestScale;
}

/**
 * 原 Bo：缩放搜索拟合目标页数——
 * 差 0 或超 maxDifference 直接返回；按方向取缩放序列（缩/放），
 * 命中目标后在上一命中点与当前点间细分 10 步精修；
 * 放大方向无命中且最优未达标 → 放弃回原页数。
 */
export function fitPageCountByScale<Page>(input: {
  initialPages: Page[];
  targetPageCount: number;
  buildPagesAtScale: (scale: number) => Page[];
  maxDifference?: number;
  scales?: number[];
}): { pageCount: number; pages: Page[]; scale: number } {
  const { initialPages, targetPageCount, buildPagesAtScale, maxDifference = 3, scales } = input,
    target = Math.max(1, Math.round(targetPageCount)),
    initialCount = initialPages.length,
    difference = Math.abs(initialCount - target);
  if (difference === 0 || difference > maxDifference) return { pageCount: initialCount, pages: initialPages, scale: 1 };
  let best = { pageCount: initialCount, pages: initialPages, scale: 1 };
  const shrinking = initialCount < target,
    candidates =
      scales && scales.length > 0
        ? scales
        : shrinking
          ? [0.98, 0.96, 0.94, 0.92, 0.9, 0.88, 0.86, 0.84, 0.82, 0.8, 0.78, 0.76, 0.74, 0.72, 0.7, 0.68, 0.66, 0.64, 0.62, 0.6, 0.58, 0.56, 0.54, 0.52, 0.5, 0.48, 0.46, 0.44, 0.42, 0.4, 0.38, 0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.22, 0.2]
          : [1.02, 1.04, 1.06, 1.08, 1.1, 1.12, 1.14, 1.16, 1.18, 1.2, 1.22, 1.24, 1.26, 1.28, 1.3],
    build = (scale: number) => {
      const pages = buildPagesAtScale(scale);
      return { pageCount: pages.length, pages, scale };
    },
    refine = (fromScale: number, toScale: number) => {
      let exact: { pageCount: number; pages: Page[]; scale: number } | undefined;
      const span = toScale - fromScale;
      if (!Number.isFinite(span) || Math.abs(span) < 1e-4) return best;
      for (let step = 1; step <= SCALE_SEARCH_STEPS; step += 1) {
        const candidate = build(fromScale + (span * step) / SCALE_SEARCH_STEPS);
        isBetterScaleCandidate(candidate, best, target) && (best = candidate), candidate.pageCount === target && (exact === undefined || isBetterScaleCandidate(candidate, exact, target)) && (exact = candidate);
      }
      return exact ?? best;
    };
  let previousScale = 1,
    previousCount = initialCount;
  for (const scale of candidates) {
    const candidate = build(scale);
    if ((isBetterScaleCandidate(candidate, best, target) && (best = candidate), candidate.pageCount === target)) return (shrinking ? previousCount < target : previousCount > target) ? refine(previousScale, scale) : candidate;
    (previousScale = scale), (previousCount = candidate.pageCount);
  }
  return !shrinking && best.pageCount !== target ? { pageCount: initialCount, pages: initialPages, scale: 1 } : best;
}

/* ============================================================================
 * §D 历史归约器（原 Vo/Uo，jsx 14196-14268）
 * ==========================================================================*/

/** 原 Vo：历史深度上限 */
const HISTORY_LIMIT = 100;

/** 原 Ho：自有属性判定 */
export function hasOwnProperty(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

/** 编辑器光标快照（原 t 闭包形态） */
export interface EditorCursorSnapshot {
  model: DocxEditorModel;
  selection: unknown;
  activeTextRange: unknown;
}

/** 编辑器历史（past/future 双栈） */
export interface EditorHistoryState {
  past: EditorCursorSnapshot[];
  future: EditorCursorSnapshot[];
}

/** 历史归约器状态 */
export interface EditorReducerState extends EditorCursorSnapshot {
  pendingRunStyle?: unknown;
  history: EditorHistoryState;
}

/** 历史归约器动作（原代码按 type 字符串分派；patch 动作的 type 可为任意
 * 宿主字符串，故此处用宽松结构而非可辨识联合） */
export interface EditorReducerAction {
  type: string;
  /** type = replace-history */
  history?: EditorHistoryState;
  /** 其余动作：按自有键合并的补丁 */
  patch?: { model?: DocxEditorModel; selection?: unknown; activeTextRange?: unknown; pendingRunStyle?: unknown };
  /** 模型变化时是否压历史（false = 仅清 future） */
  pushHistory?: boolean;
}

/** 历史归约器适配器（原 Uo 的 e 参数：宿主提供的克隆/归一/比较） */
export interface EditorHistoryAdapter {
  cloneSelection(selection: unknown): unknown;
  cloneTextRange(range: unknown): unknown;
  clonePendingStyle(style: unknown): unknown;
  normalizeCursor(model: DocxEditorModel, selection: unknown, activeTextRange: unknown): { selection: unknown; activeTextRange: unknown };
  sameSelection(a: unknown, b: unknown): boolean;
  sameTextRange(a: unknown, b: unknown): boolean;
  samePendingStyle(a: unknown, b: unknown): boolean;
}

/**
 * 原 Uo：编辑器历史归约器工厂——
 * replace-history 直接换栈；undo/redo 在 past/future 间搬移快照并
 * 归一光标；patch 按自有键合并（模型/选区/活动文本域/待定样式），
 * 模型变化时压历史（pushHistory=false 仅清 future），双栈各限 100。
 */
export function createEditorHistoryReducer(adapter: EditorHistoryAdapter): (state: EditorReducerState, action: EditorReducerAction) => EditorReducerState {
  const snapshot = (state: EditorReducerState): EditorCursorSnapshot => ({
    model: state.model,
    selection: adapter.cloneSelection(state.selection),
    activeTextRange: adapter.cloneTextRange(state.activeTextRange),
  });
  const restore = (state: EditorReducerState, entry: EditorCursorSnapshot, history: EditorHistoryState): EditorReducerState => {
    const normalized = adapter.normalizeCursor(entry.model, adapter.cloneSelection(entry.selection), adapter.cloneTextRange(entry.activeTextRange));
    return {
      model: entry.model,
      selection: adapter.cloneSelection(normalized.selection),
      activeTextRange: adapter.cloneTextRange(normalized.activeTextRange),
      pendingRunStyle: undefined,
      history,
    };
  };
  return (state, action) => {
    if (action.type === `replace-history`) return action.history === state.history ? state : { ...state, history: action.history! };
    if (action.type === `undo`) {
      const entry = state.history.past.at(-1);
      return entry
        ? restore(state, entry, { past: state.history.past.slice(0, -1), future: [snapshot(state), ...state.history.future].slice(0, HISTORY_LIMIT) })
        : state;
    }
    if (action.type === `redo`) {
      const entry = state.history.future[0];
      return entry
        ? restore(state, entry, { past: [...state.history.past, snapshot(state)].slice(-HISTORY_LIMIT), future: state.history.future.slice(1) })
        : state;
    }
    const patch = action.patch!,
      hasModel = hasOwnProperty(patch, `model`),
      hasSelection = hasOwnProperty(patch, `selection`),
      hasTextRange = hasOwnProperty(patch, `activeTextRange`),
      hasPendingStyle = hasOwnProperty(patch, `pendingRunStyle`),
      nextModel = hasModel ? patch.model! : state.model,
      nextSelection = hasSelection ? patch.selection : state.selection,
      nextTextRange = hasTextRange ? patch.activeTextRange : state.activeTextRange,
      normalized = adapter.normalizeCursor(nextModel, nextSelection, nextTextRange),
      clonedSelection = adapter.cloneSelection(normalized.selection),
      clonedRange = adapter.cloneTextRange(normalized.activeTextRange),
      nextPendingStyle = hasPendingStyle ? adapter.clonePendingStyle(patch.pendingRunStyle) : state.pendingRunStyle,
      modelChanged = nextModel !== state.model,
      selectionChanged = !adapter.sameSelection(state.selection, clonedSelection),
      rangeChanged = !adapter.sameTextRange(state.activeTextRange, clonedRange),
      styleChanged = !adapter.samePendingStyle(state.pendingRunStyle, nextPendingStyle);
    return !modelChanged && !selectionChanged && !rangeChanged && !styleChanged
      ? state
      : {
          model: nextModel,
          selection: clonedSelection,
          activeTextRange: clonedRange,
          pendingRunStyle: nextPendingStyle,
          history: modelChanged
            ? action.pushHistory === false
              ? state.history.future.length > 0
                ? { past: state.history.past, future: [] }
                : state.history
              : { past: [...state.history.past.slice(-(HISTORY_LIMIT - 1)), snapshot(state)], future: [] }
            : state.history,
        };
  };
}

/* ============================================================================
 * §E 编辑器行布局服务（原 Wo..Ls，jsx 14269-14835）
 * ==========================================================================*/

const PRE_WRAP_CACHE_LIMIT = 8192; // 原 Wo
const BLOCK_LAYOUT_CACHE_LIMIT = 4096; // 原 Go
const LINE_COUNT_CACHE_LIMIT = 16384; // 原 Ko
const preWrapMeasureCache = new Map<string, MeasuredText>(); // 原 qo
const blockLayoutCache = new Map<string, TextBlockLayout>(); // 原 Jo
const lineCountCache = new Map<string, number>(); // 原 Yo
const fragmentPrefixWidthCaches = new WeakMap<LaidOutLineFragment, number[]>(); // 原 Xo
const graphemeBoundaryCache = new Map<string, number[]>(); // 原 Zo
let layoutMeasureCanvas: HTMLCanvasElement | OffscreenCanvas | undefined; // 原 Qo
let layoutMeasureContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined; // 原 $o
let layoutGraphemeSegmenter: Intl.Segmenter | undefined; // 原 es

/** 布局排除区（浮动对象占位） */
export interface LayoutExclusion {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** 行内片段（原 Ms/Ns 的 fragments 项） */
export interface LaidOutLineFragment {
  text: string;
  width: number;
  x: number;
  intervalX: number;
  intervalWidth: number;
  startOffset: number;
  endOffset: number;
  font: string;
}

/** 布局行 */
export interface LaidOutLine {
  y: number;
  fragments: LaidOutLineFragment[];
}

/** 文本块布局结果 */
export interface TextBlockLayout {
  lineCount: number;
  height: number;
  lines: LaidOutLine[];
  text: string;
  font: string;
  containerWidthPx: number;
  lineHeightPx: number;
  exclusions: LayoutExclusion[];
}

/** 富文本布局条目（原 Ns 的 items 项） */
export interface TextLayoutItem {
  text: string;
  font: string;
  startOffset: number;
  endOffset: number;
  wordBreak?: string;
  /** `never` = 条目内不断行（整体放下或整体换行） */
  break?: string;
}

/** 条目布局游标 */
export interface ItemLayoutCursor {
  itemIndex: number;
  segmentIndex: number;
  graphemeIndex: number;
}

/** 原 ts：测量能力探测 */
export function canMeasureText(): boolean {
  return typeof OffscreenCanvas < `u` || typeof document < `u`;
}

/** 原 ns：LRU 取值并置尾 */
export function lruGet<K, V>(cache: Map<K, V>, key: K): V | undefined {
  const value = cache.get(key);
  if (value !== undefined) return cache.delete(key), cache.set(key, value), value;
}

/** 原 rs：LRU 逐旧至容量内 */
export function lruEvict<K, V>(cache: Map<K, V>, limit: number): void {
  for (; cache.size > limit;) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** 原 is：布局服务测量上下文（独立于 [E2] 的单例） */
export function getLayoutMeasureContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined {
  if (canMeasureText()) {
    if (layoutMeasureContext) return layoutMeasureContext ?? undefined;
    if (typeof OffscreenCanvas < `u`) return (layoutMeasureCanvas = new OffscreenCanvas(1, 1)), (layoutMeasureContext = layoutMeasureCanvas.getContext(`2d`) ?? undefined), layoutMeasureContext ?? undefined;
    if (typeof document < `u`) return (layoutMeasureCanvas = document.createElement(`canvas`)), (layoutMeasureContext = layoutMeasureCanvas.getContext(`2d`) ?? undefined), layoutMeasureContext ?? undefined;
  }
}

/** 原 as：文本宽度（px 取整；不可测 → 0） */
export function measureTextWidthPx(font: string, text: string): number {
  if (!text) return 0;
  const context = getLayoutMeasureContext();
  return context ? ((context.font = font), Math.max(0, Math.round(context.measureText(text).width))) : 0;
}

/** 原 os：前 n 字符前缀宽度 */
export function measurePrefixWidthPx(font: string, text: string, charCount: number): number {
  return charCount <= 0 || !text ? 0 : measureTextWidthPx(font, text.slice(0, Math.max(0, Math.min(charCount, text.length))));
}

/** 原 ss：布局服务字素 Segmenter */
export function getLayoutGraphemeSegmenter(): Intl.Segmenter | undefined {
  if (layoutGraphemeSegmenter) return layoutGraphemeSegmenter;
  if (!(typeof Intl > `u` || Intl.Segmenter === undefined)) return (layoutGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: `grapheme` })), layoutGraphemeSegmenter;
}

/** 原 cs：字素边界偏移数组（缓存；无 Segmenter 按码点退化） */
export function graphemeBoundaryOffsets(text: string): number[] {
  if (!text) return [0];
  const cached = graphemeBoundaryCache.get(text);
  if (cached) return cached;
  const segmenter = getLayoutGraphemeSegmenter(),
    offsets = [0];
  if (segmenter) for (const segment of segmenter.segment(text)) offsets.push(segment.index + segment.segment.length);
  else {
    let index = 0;
    for (const ch of text) (index += ch.length), offsets.push(index);
  }
  return offsets[offsets.length - 1] !== text.length && (offsets[offsets.length - 1] = text.length), graphemeBoundaryCache.set(text, offsets), offsets;
}

/** 原 ls：字素数 */
export function graphemeCountOfText(text: string): number {
  return Math.max(0, graphemeBoundaryOffsets(text).length - 1);
}

/** 原 us：字素序号 → 字符偏移 */
export function graphemeOrdinalToOffset(text: string, ordinal: number): number {
  const offsets = graphemeBoundaryOffsets(text);
  return offsets[Math.max(0, Math.min(Math.round(ordinal), offsets.length - 1))] ?? text.length;
}

/** 原 ds：宽度表上游标区间 → 原文长度（跨段累加，字素边界精确） */
export function measuredRangeLength(table: MeasuredText, start: LineCursor, end: LineCursor): number {
  if (end.segmentIndex < start.segmentIndex || (end.segmentIndex === start.segmentIndex && end.graphemeIndex <= start.graphemeIndex)) return 0;
  let length = 0;
  const lastSegment = Math.min(end.segmentIndex, table.segments!.length);
  for (let segmentIndex = start.segmentIndex; segmentIndex <= lastSegment; segmentIndex += 1) {
    const segment = table.segments![segmentIndex] ?? ``;
    if (segmentIndex === start.segmentIndex && segmentIndex === end.segmentIndex) {
      length += Math.max(0, graphemeOrdinalToOffset(segment, end.graphemeIndex) - graphemeOrdinalToOffset(segment, start.graphemeIndex));
      break;
    }
    if (segmentIndex === start.segmentIndex) {
      length += Math.max(0, segment.length - graphemeOrdinalToOffset(segment, start.graphemeIndex));
      continue;
    }
    if (segmentIndex === end.segmentIndex) {
      length += graphemeOrdinalToOffset(segment, end.graphemeIndex);
      break;
    }
    length += segment.length;
  }
  return length;
}

/** 原 fs：布局缓存键（前缀 + 容器宽 + 行高 + 排除区序列化） */
export function layoutCacheKey(prefix: string, containerWidthPx: number, lineHeightPx: number, exclusions: LayoutExclusion[]): string {
  return `${prefix}\0${containerWidthPx}\0${lineHeightPx}\0${exclusions.map((exclusion) => `${exclusion.left},${exclusion.right},${exclusion.top},${exclusion.bottom}`).join(`;`)}`;
}

/** 原 ps：片段前缀宽度表（按片段对象 WeakMap 缓存） */
export function fragmentPrefixWidths(defaultFont: string, fragment: LaidOutLineFragment): number[] {
  const cached = fragmentPrefixWidthCaches.get(fragment);
  if (cached) return cached;
  const widths = Array(fragment.text.length + 1);
  for (let i = 0; i <= fragment.text.length; i += 1) widths[i] = measurePrefixWidthPx(fragment.font ?? defaultFont, fragment.text, i);
  return fragmentPrefixWidthCaches.set(fragment, widths), widths;
}

/** 原 ms：片段内 x → 字符偏移（最近前缀宽度） */
export function hitTestFragmentX(font: string, fragment: LaidOutLineFragment, x: number): number {
  if (x <= 0) return fragment.startOffset;
  if (x >= fragment.width) return fragment.endOffset;
  let offset = fragment.startOffset,
    bestDistance = Infinity;
  const widths = fragmentPrefixWidths(font, fragment);
  for (let i = 0; i < widths.length; i++) {
    const width = widths[i] ?? 0,
      distance = Math.abs(x - width);
    distance < bestDistance && ((bestDistance = distance), (offset = fragment.startOffset + i));
  }
  return offset;
}

/** 原 hs：y → 最近行索引（行中线距离） */
export function nearestLineIndexByY(layout: TextBlockLayout, y: number): number {
  const lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1));
  if (layout.lines.length === 0) return 0;
  let index = 0,
    bestDistance = Infinity;
  return (
    layout.lines.forEach((line, i) => {
      const centerY = line.y + lineHeight / 2,
        distance = Math.abs(y - centerY);
      distance < bestDistance && ((bestDistance = distance), (index = i));
    }),
    index
  );
}

/** 原 gs：带缓存的 pre-wrap 宽度表（失败 → undefined） */
export function measurePreWrapCached(text: string, font: string, wordBreak: string = `normal`): MeasuredText | undefined {
  if (!canMeasureText()) return;
  const key = `${text}\0${wordBreak}\0${font}`,
    cached = lruGet(preWrapMeasureCache, key);
  if (cached) return cached;
  try {
    const table = measurePreWrapLayout(text, font, { whiteSpace: `pre-wrap`, wordBreak });
    return preWrapMeasureCache.set(key, table), lruEvict(preWrapMeasureCache, PRE_WRAP_CACHE_LIMIT), table;
  } catch {
    return;
  }
}

/** 原 _s：带缓存的换行行数统计 */
export function countWrappedLinesCached(text: string, font: string, maxWidthPx: number, options?: { wordBreak?: string }): number | undefined {
  if (!text) return 0;
  const wordBreak = options?.wordBreak ?? `normal`,
    maxWidth = Math.max(1, Math.round(maxWidthPx)),
    key = `line-count\0${font}\0${wordBreak}\0${maxWidth}\0${text}`,
    cached = lruGet(lineCountCache, key);
  if (cached !== undefined) return cached;
  const table = measurePreWrapCached(text, font, wordBreak);
  if (table)
    try {
      const lineCount = countLayoutLines(table, maxWidth).lineCount;
      return lineCountCache.set(key, lineCount), lruEvict(lineCountCache, LINE_COUNT_CACHE_LIMIT), lineCount;
    } catch {
      return;
    }
}

/** 原 vs：条目游标克隆 */
export function cloneItemCursor(cursor: ItemLayoutCursor): ItemLayoutCursor {
  return { itemIndex: cursor.itemIndex, segmentIndex: cursor.segmentIndex, graphemeIndex: cursor.graphemeIndex };
}

/** 原 ys：游标在条目起点 */
export function isCursorAtItemStart(cursor: ItemLayoutCursor): boolean {
  return cursor.segmentIndex === 0 && cursor.graphemeIndex === 0;
}

/** 原 bs：游标归一（跳过耗尽条目） */
export function normalizeItemCursor(tables: (MeasuredText | undefined)[], cursor: ItemLayoutCursor): ItemLayoutCursor {
  const normalized = cloneItemCursor(cursor);
  for (; normalized.itemIndex < tables.length;) {
    const table = tables[normalized.itemIndex];
    if (!table || normalized.segmentIndex >= table.segments!.length) {
      (normalized.itemIndex += 1), (normalized.segmentIndex = 0), (normalized.graphemeIndex = 0);
      continue;
    }
    break;
  }
  return normalized;
}

/** 原 xs：游标已耗尽全部条目 */
export function isItemCursorExhausted(tables: (MeasuredText | undefined)[], cursor: ItemLayoutCursor): boolean {
  return normalizeItemCursor(tables, cursor).itemIndex >= tables.length;
}

/** 原 Ss：条目剩余部分整行测量（不断行） */
export function measureRestOfItemLine(table: MeasuredText, cursor: LineCursor): LineFragment | null {
  return breakNextLine(table, cursor, Infinity);
}

/** 条目行内片段（原 Cs 的 fragments 项） */
export interface ItemLineFragment {
  itemIndex: number;
  text: string;
  width: number;
  font: string;
  start: LineCursor;
  end: LineCursor;
}

/**
 * 原 Cs：把条目序列填入单个行区间——
 * 逐条目断行（break=never 整体测量）；空片段跳过；条目起点且
 * 已有内容时超宽即停；条目耗尽/区间用尽返回片段集与新游标。
 */
export function fitItemsIntoInterval(
  items: TextLayoutItem[],
  tables: (MeasuredText | undefined)[],
  cursor: ItemLayoutCursor,
  intervalWidth: number,
): { end: ItemLayoutCursor; fragments: ItemLineFragment[] } | null {
  const start = normalizeItemCursor(tables, cursor);
  if (start.itemIndex >= items.length) return null;
  let remaining = Math.max(1, intervalWidth);
  const fragments: ItemLineFragment[] = [];
  let budget = remaining;
  const walk = cloneItemCursor(start);
  for (; walk.itemIndex < items.length;) {
    const item = items[walk.itemIndex],
      table = tables[walk.itemIndex];
    if (!item || !table) {
      (walk.itemIndex += 1), (walk.segmentIndex = 0), (walk.graphemeIndex = 0);
      continue;
    }
    const lineCursor: LineCursor = { segmentIndex: walk.segmentIndex, graphemeIndex: walk.graphemeIndex },
      atItemStart = isCursorAtItemStart(walk),
      piece = item.break === `never` ? measureRestOfItemLine(table, lineCursor) : breakNextLine(table, lineCursor, Math.max(1, budget));
    if (!piece) {
      (walk.itemIndex += 1), (walk.segmentIndex = 0), (walk.graphemeIndex = 0);
      continue;
    }
    if (piece.end.segmentIndex === lineCursor.segmentIndex && piece.end.graphemeIndex === lineCursor.graphemeIndex && piece.text.length === 0) {
      (walk.itemIndex += 1), (walk.segmentIndex = 0), (walk.graphemeIndex = 0);
      continue;
    }
    if (fragments.length > 0 && atItemStart && piece.width > budget + 0.5) break;
    if (
      (fragments.push({ itemIndex: walk.itemIndex, text: piece.text, width: piece.width, font: item.font, start: lineCursor, end: piece.end }),
      (budget = Math.max(0, budget - piece.width)),
      piece.end.segmentIndex >= table.segments!.length)
    ) {
      if (((walk.itemIndex += 1), (walk.segmentIndex = 0), (walk.graphemeIndex = 0), budget <= 0.5)) break;
      continue;
    }
    (walk.segmentIndex = piece.end.segmentIndex), (walk.graphemeIndex = piece.end.graphemeIndex);
    break;
  }
  return fragments.length === 0 ? null : { end: normalizeItemCursor(tables, walk), fragments };
}

/** 原 ws：条目起点即被截断判定（全量测量长于实际片段） */
export function wouldTruncateItemStart(items: TextLayoutItem[], tables: (MeasuredText | undefined)[], cursor: ItemLayoutCursor, fit: { end: ItemLayoutCursor; fragments: ItemLineFragment[] }): boolean {
  if (!isCursorAtItemStart(cursor)) return false;
  const first = fit.fragments[0],
    item = first ? items[first.itemIndex] : undefined,
    table = first ? tables[first.itemIndex] : undefined;
  if (!first || !item || !table || item.break === `never` || first.itemIndex !== cursor.itemIndex) return false;
  const fullLine = measureRestOfItemLine(table, { segmentIndex: cursor.segmentIndex, graphemeIndex: cursor.graphemeIndex });
  return fullLine ? first.text.length < fullLine.text.length : false;
}

/** 原 Ts：截断条目是否应整体跳过——剩余区间放不下全量，
 * 且首片段不是条目的合法中段断点 */
export function shouldSkipTruncatedFit(
  items: TextLayoutItem[],
  tables: (MeasuredText | undefined)[],
  cursor: ItemLayoutCursor,
  fit: { end: ItemLayoutCursor; fragments: ItemLineFragment[] },
  remainingIntervals: { x: number; width: number }[],
): boolean {
  const item = items[cursor.itemIndex],
    table = tables[cursor.itemIndex];
  if (!item || !table || !isCursorAtItemStart(cursor) || item.break === `never`) return false;
  const lineCursor: LineCursor = { segmentIndex: cursor.segmentIndex, graphemeIndex: cursor.graphemeIndex },
    fullLine = measureRestOfItemLine(table, lineCursor);
  if (!fullLine) return false;
  if (remainingIntervals.some((interval) => fullLine.width <= interval.width + 0.5)) return true;
  const first = fit.fragments[0];
  return !first || first.itemIndex !== cursor.itemIndex || !isMidSegmentEnd(table, lineCursor, first.end)
    ? false
    : remainingIntervals.some((interval) => {
        const piece = breakNextLine(table, lineCursor, Math.max(1, interval.width));
        return piece ? !isMidSegmentEnd(table, lineCursor, piece.end) : false;
      });
}

/** 原 Es：段游标到段尾 */
export function isSegmentCursorAtEnd(table: MeasuredText, cursor: LineCursor): boolean {
  return cursor.segmentIndex >= table.segments!.length;
}

/** 原 Ds：游标紧随硬换行段之后 */
export function isCursorAfterHardBreak(table: MeasuredText, cursor: LineCursor): boolean {
  return cursor.graphemeIndex > 0 || cursor.segmentIndex <= 0 ? false : table.kinds[cursor.segmentIndex - 1] === `hard-break`;
}

/** 原 Os：段内中段终点（字素 >0 且未到段尾） */
export function isMidSegmentEnd(table: MeasuredText, start: LineCursor, end: LineCursor): boolean {
  if (start.graphemeIndex !== 0) return false;
  const segment = table.segments![start.segmentIndex],
    graphemeCount = segment ? graphemeCountOfText(segment) : 0;
  return graphemeCount <= 1 ? false : end.segmentIndex === start.segmentIndex && end.graphemeIndex > start.graphemeIndex && end.graphemeIndex < graphemeCount;
}

/** 原 ks：行结束于段中（供连字/字距修正） */
export function lineEndsMidSegment(table: MeasuredText, start: LineCursor, piece: LineFragment): boolean {
  return isMidSegmentEnd(table, start, piece.end);
}

/** 原 As：片段能完整放入任一剩余区间 */
export function canFitIntoAnyInterval(table: MeasuredText, cursor: LineCursor, intervals: { x: number; width: number }[]): boolean {
  for (const interval of intervals) {
    const piece = breakNextLine(table, cursor, interval.width);
    if (piece && !lineEndsMidSegment(table, cursor, piece)) return true;
  }
  return false;
}

/** 原 js：行区间扣除排除区（得到可排布的 {x, width} 段） */
export function subtractExclusionIntervals(containerWidthPx: number, lineHeightPx: number, y: number, exclusions: LayoutExclusion[]): { x: number; width: number }[] {
  const totalWidth = Math.max(0, Math.round(containerWidthPx));
  let intervals = [{ x: 0, width: totalWidth }];
  const lineBottom = y + Math.max(1, Math.round(lineHeightPx));
  for (const exclusion of exclusions) {
    if (!(lineBottom > exclusion.top && y < exclusion.bottom)) continue;
    const left = Math.max(0, Math.min(totalWidth, Math.round(exclusion.left))),
      right = Math.max(left, Math.min(totalWidth, Math.round(exclusion.right)));
    intervals = intervals.flatMap((interval) => {
      const start = interval.x,
        end = interval.x + interval.width;
      if (right <= start || left >= end) return [interval];
      const pieces: { x: number; width: number }[] = [];
      return left > start && pieces.push({ x: start, width: left - start }), right < end && pieces.push({ x: right, width: end - right }), pieces;
    });
  }
  return intervals.filter((interval) => interval.width > 0.5);
}

/** 原 Ms 的空文本结果构造助手 */
function emptyBlockLayout(text: string, font: string, containerWidthPx: number, lineHeightPx: number, exclusions: LayoutExclusion[]): TextBlockLayout {
  return {
    lineCount: 0,
    height: Math.max(0, ...exclusions.map((exclusion) => Math.round(exclusion.bottom))),
    lines: [],
    text,
    font,
    containerWidthPx: Math.max(1, Math.round(containerWidthPx)),
    lineHeightPx: Math.max(1, Math.round(lineHeightPx)),
    exclusions: exclusions.map((exclusion) => ({ left: Math.round(exclusion.left), right: Math.round(exclusion.right), top: Math.round(exclusion.top), bottom: Math.round(exclusion.bottom) })),
  };
}

/**
 * 原 Ms：纯文本块布局（带缓存）——
 * 逐行：扣除排除区得区间 → 每区间断行一片（中段断点让位后续区间）；
 * 无可排片段即终止。行高累进，高度与排除区底部取大。
 */
export function layoutPlainTextBlock(text: string, font: string, containerWidthPx: number, lineHeightPx: number, exclusions?: LayoutExclusion[], options?: { wordBreak?: string }): TextBlockLayout | undefined {
  if (!text) return emptyBlockLayout(text, font, containerWidthPx, lineHeightPx, exclusions ?? []);
  const wordBreak = options?.wordBreak ?? `normal`,
    table = measurePreWrapCached(text, font, wordBreak);
  if (!table) return;
  const containerWidth = Math.max(1, Math.round(containerWidthPx)),
    lineHeight = Math.max(1, Math.round(lineHeightPx)),
    normalizedExclusions = (exclusions ?? []).map((exclusion) => ({ left: Math.round(exclusion.left), right: Math.round(exclusion.right), top: Math.round(exclusion.top), bottom: Math.round(exclusion.bottom) })),
    key = layoutCacheKey(`plain\0${font}\0${wordBreak}\0${text}`, containerWidth, lineHeight, normalizedExclusions),
    cached = lruGet(blockLayoutCache, key);
  if (cached) return cached;
  const lines: LaidOutLine[] = [],
    cursor: LineCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let consumedOffset = 0,
    y = 0;
  for (; !isSegmentCursorAtEnd(table, cursor);) {
    const intervals = subtractExclusionIntervals(containerWidth, lineHeight, y, normalizedExclusions),
      fragments: LaidOutLineFragment[] = [];
    if (intervals.length === 0) {
      y += lineHeight;
      continue;
    }
    for (let i = 0; i < intervals.length; i += 1) {
      const interval = intervals[i];
      if (isSegmentCursorAtEnd(table, cursor) || isCursorAfterHardBreak(table, cursor)) break;
      const piece = breakNextLine(table, cursor, interval.width);
      if (piece) {
        if (lineEndsMidSegment(table, cursor, piece) && canFitIntoAnyInterval(table, cursor, intervals.slice(i + 1))) continue;
        fragments.push({
          text: piece.text,
          width: piece.width,
          x: interval.x,
          intervalX: interval.x,
          intervalWidth: interval.width,
          startOffset: consumedOffset,
          endOffset: consumedOffset + measuredRangeLength(table, cursor, piece.end),
          font,
        }),
          (consumedOffset += measuredRangeLength(table, cursor, piece.end)),
          (cursor.segmentIndex = piece.end.segmentIndex),
          (cursor.graphemeIndex = piece.end.graphemeIndex);
      }
    }
    if (fragments.length === 0) break;
    lines.push({ y, fragments }), (y += lineHeight);
  }
  const lineCount = lines.length,
    contentHeight = lines.length > 0 ? (lines[lines.length - 1]?.y ?? 0) + lineHeight : 0,
    layout: TextBlockLayout = {
      lineCount,
      height: Math.max(contentHeight, ...normalizedExclusions.map((exclusion) => Math.round(exclusion.bottom)), 0),
      lines,
      text,
      font,
      containerWidthPx: containerWidth,
      lineHeightPx: lineHeight,
      exclusions: normalizedExclusions,
    };
  return blockLayoutCache.set(key, layout), lruEvict(blockLayoutCache, BLOCK_LAYOUT_CACHE_LIMIT), layout;
}

/**
 * 原 Ns：富文本条目块布局（带缓存）——
 * 各条目独立 pre-wrap 测量；逐行逐区间填入条目片段
 * （截断条目按剩余区间让位规则跳过）；偏移按条目 startOffset 归位。
 */
export function layoutTextItemsBlock(
  text: string,
  items: TextLayoutItem[],
  containerWidthPx: number,
  lineHeightPx: number,
  exclusions?: LayoutExclusion[],
  fallbackFont?: string,
): TextBlockLayout | undefined {
  if (!text) return emptyBlockLayout(text, fallbackFont ?? ``, containerWidthPx, lineHeightPx, exclusions ?? []);
  if (!canMeasureText()) return;
  const tables = items.map((item) => measurePreWrapCached(item.text, item.font, item.wordBreak ?? `normal`));
  if (tables.some((table, i) => !table && items[i]?.text.length)) return;
  const containerWidth = Math.max(1, Math.round(containerWidthPx)),
    lineHeight = Math.max(1, Math.round(lineHeightPx)),
    normalizedExclusions = (exclusions ?? []).map((exclusion) => ({ left: Math.round(exclusion.left), right: Math.round(exclusion.right), top: Math.round(exclusion.top), bottom: Math.round(exclusion.bottom) })),
    key = layoutCacheKey(`items\0${items.map((item) => `${item.font}${item.break ?? `normal`}${item.wordBreak ?? `normal`}${item.startOffset}${item.endOffset}${item.text}`).join(``)}`, containerWidth, lineHeight, normalizedExclusions),
    cached = lruGet(blockLayoutCache, key);
  if (cached) return cached;
  const lines: LaidOutLine[] = [],
    consumedByItem = items.map(() => 0),
    cursor: ItemLayoutCursor = { itemIndex: 0, segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;
  for (; !isItemCursorExhausted(tables, cursor);) {
    const normalized = normalizeItemCursor(tables, cursor);
    (cursor.itemIndex = normalized.itemIndex), (cursor.segmentIndex = normalized.segmentIndex), (cursor.graphemeIndex = normalized.graphemeIndex);
    const intervals = subtractExclusionIntervals(containerWidth, lineHeight, y, normalizedExclusions),
      fragments: LaidOutLineFragment[] = [];
    if (intervals.length === 0) {
      y += lineHeight;
      continue;
    }
    for (let i = 0; i < intervals.length && ((cursor.itemIndex = normalizeItemCursor(tables, cursor).itemIndex), (cursor.segmentIndex = normalizeItemCursor(tables, cursor).segmentIndex), (cursor.graphemeIndex = normalizeItemCursor(tables, cursor).graphemeIndex), !isItemCursorExhausted(tables, cursor)); i += 1) {
      const interval = intervals[i],
        fit = fitItemsIntoInterval(items, tables, cursor, interval.width);
      if (!fit || (wouldTruncateItemStart(items, tables, cursor, fit) && shouldSkipTruncatedFit(items, tables, cursor, fit, intervals.slice(i + 1)))) continue;
      let x = interval.x;
      const entryCursor = cloneItemCursor(cursor);
      for (const fragment of fit.fragments) {
        const item = items[fragment.itemIndex],
          table = tables[fragment.itemIndex];
        if (!item || !table) continue;
        const pieceLength = measuredRangeLength(table, fragment.start, fragment.end),
          startOffset = item.startOffset + (consumedByItem[fragment.itemIndex] ?? 0),
          endOffset = startOffset + pieceLength;
        fragments.push({ text: fragment.text, width: fragment.width, x, intervalX: interval.x, intervalWidth: interval.width, startOffset, endOffset, font: fragment.font }),
          (consumedByItem[fragment.itemIndex] = (consumedByItem[fragment.itemIndex] ?? 0) + pieceLength),
          (x += fragment.width),
          fragment.itemIndex === entryCursor.itemIndex &&
            (fragment.end.segmentIndex >= table.segments!.length
              ? ((entryCursor.itemIndex += 1), (entryCursor.segmentIndex = 0), (entryCursor.graphemeIndex = 0))
              : ((entryCursor.segmentIndex = fragment.end.segmentIndex), (entryCursor.graphemeIndex = fragment.end.graphemeIndex)));
      }
      (cursor.itemIndex = fit.end.itemIndex), (cursor.segmentIndex = fit.end.segmentIndex), (cursor.graphemeIndex = fit.end.graphemeIndex);
    }
    if (fragments.length === 0) break;
    lines.push({ y, fragments }), (y += lineHeight);
  }
  const lineCount = lines.length,
    contentHeight = lines.length > 0 ? (lines[lines.length - 1]?.y ?? 0) + lineHeight : 0,
    layout: TextBlockLayout = {
      lineCount,
      height: Math.max(contentHeight, ...normalizedExclusions.map((exclusion) => Math.round(exclusion.bottom)), 0),
      lines,
      text,
      font: fallbackFont ?? items[0]?.font,
      containerWidthPx: containerWidth,
      lineHeightPx: lineHeight,
      exclusions: normalizedExclusions,
    };
  return blockLayoutCache.set(key, layout), lruEvict(blockLayoutCache, BLOCK_LAYOUT_CACHE_LIMIT), layout;
}

/** 原 Ps：点命中 → 文本偏移（行中线就近选行；片段间空隙中点分界） */
export function hitTestTextOffset(layout: TextBlockLayout, x: number, y: number): number {
  const textLength = layout.text?.length ?? 0;
  if (layout.lines.length === 0) return 0;
  const lineIndex = nearestLineIndexByY(layout, y),
    line = layout.lines[lineIndex];
  if (!line || line.fragments.length === 0) return Math.max(0, Math.min(textLength, 0));
  const first = line.fragments[0],
    last = line.fragments[line.fragments.length - 1];
  if (x <= first.x) return first.startOffset;
  if (x >= last.x + last.width) return last.endOffset;
  for (let i = 0; i < line.fragments.length; i += 1) {
    const fragment = line.fragments[i],
      fragmentLeft = fragment.x,
      fragmentRight = fragment.x + fragment.width;
    if (x >= fragmentLeft && x <= fragmentRight) return hitTestFragmentX(layout.font ?? ``, fragment, x - fragmentLeft);
    const next = line.fragments[i + 1];
    if (next && x > fragmentRight && x < next.x) return x < fragmentRight + (next.x - fragmentRight) / 2 ? fragment.endOffset : next.startOffset;
  }
  return Math.max(0, Math.min(textLength, last.endOffset));
}

/** 光标矩形（原 Fs 返回） */
export interface CaretRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 原 Fs：偏移 → 光标矩形（1px 宽；越界回退末片段尾） */
export function caretRectForOffset(layout: TextBlockLayout, offset: number): CaretRect | undefined {
  if (layout.lines.length === 0) return;
  const target = Math.max(0, Math.min(Math.round(offset), layout.text?.length ?? 0)),
    lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1));
  for (const line of layout.lines)
    for (const fragment of line.fragments) {
      if (target < fragment.startOffset || target > fragment.endOffset) continue;
      const relative = target - fragment.startOffset,
        widths = fragmentPrefixWidths(layout.font ?? ``, fragment);
      return { left: fragment.x + (widths[relative] ?? 0), top: line.y, width: 1, height: lineHeight };
    }
  const lastLine = layout.lines[layout.lines.length - 1],
    lastFragment = lastLine?.fragments[lastLine.fragments.length - 1];
  if (!(!lastLine || !lastFragment)) return { left: lastFragment.x + lastFragment.width, top: lastLine.y, width: 1, height: lineHeight };
}

/** 原 Is：选区偏移范围 → 矩形集（逐片段求交） */
export function selectionRangeRects(layout: TextBlockLayout, startOffset: number, endOffset: number): CaretRect[] {
  const start = Math.max(0, Math.min(Math.round(startOffset), layout.text?.length ?? 0)),
    end = Math.max(start, Math.min(Math.round(endOffset), layout.text?.length ?? 0));
  if (start === end) return [];
  const lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1)),
    rects: CaretRect[] = [];
  return (
    layout.lines.forEach((line) => {
      line.fragments.forEach((fragment) => {
        const from = Math.max(start, fragment.startOffset),
          to = Math.min(end, fragment.endOffset);
        if (from >= to) return;
        const widths = fragmentPrefixWidths(layout.font ?? ``, fragment),
          fromWidth = widths[from - fragment.startOffset] ?? 0,
          spanWidth = (widths[to - fragment.startOffset] ?? 0) - fromWidth;
        rects.push({ left: fragment.x + fromWidth, top: line.y, width: Math.max(1, spanWidth), height: lineHeight });
      });
    }),
    rects
  );
}

/** 原 Ls：行切片（相对化 y，克隆行与片段） */
export function sliceLayoutLines(layout: TextBlockLayout, startLine: number, endLine: number): TextBlockLayout {
  const from = Math.max(0, Math.min(Math.round(startLine), layout.lines.length)),
    to = Math.max(from, Math.min(Math.round(endLine), layout.lines.length)),
    sliced = layout.lines.slice(from, to),
    baseY = sliced[0]?.y ?? 0,
    lines = sliced.map((line) => ({ ...line, y: line.y - baseY, fragments: line.fragments.map((fragment) => ({ ...fragment })) })),
    lineHeight = Math.max(1, Math.round(layout.lineHeightPx ?? 1)),
    height = lines.length > 0 ? (lines[lines.length - 1]?.y ?? 0) + lineHeight : 0;
  return { ...layout, lineCount: lines.length, height, lines };
}

/* ============================================================================
 * §F 结构哈希与模型指纹（原 Rs..Ys + Xs，jsx 14836-14903）
 * ==========================================================================*/

const FNV_OFFSET_BASIS = 2166136261; // 原 Rs
const FNV_PRIME = 16777619; // 原 zs
const HASH_SAMPLE_LENGTH = 64; // 原 Bs
const HASH_FULL_LENGTH_LIMIT = 256; // 原 Vs

/** 原 Hs：FNV-1a 单步（字符串逐字符异或乘） */
export function fnv1aStep(seed: number, text: string): number {
  let hash = seed;
  for (let i = 0; i < text.length; i += 1) (hash ^= text.charCodeAt(i)), (hash = Math.imul(hash, FNV_PRIME));
  return hash >>> 0;
}

/** 原 Us：长字符串采样哈希（≤256 全量；否则首/中/尾各 64 字符） */
export function hashStringSampled(seed: number, text: string): number {
  if (text.length <= HASH_FULL_LENGTH_LIMIT) return fnv1aStep(fnv1aStep(seed, `${text.length}:`), text);
  const head = text.slice(0, HASH_SAMPLE_LENGTH),
    middleStart = Math.floor(text.length / 2),
    middle = text.slice(middleStart, middleStart + HASH_SAMPLE_LENGTH),
    tail = text.slice(text.length - HASH_SAMPLE_LENGTH);
  let hash = fnv1aStep(seed, `${text.length}:`);
  return (hash = fnv1aStep(hash, head)), (hash = fnv1aStep(hash, middle)), fnv1aStep(hash, tail);
}

/** 原 Ws：任意值深哈希（类型标签前缀；数组/对象递归；字节按长度） */
export function hashValueDeep(seed: number, value: unknown): number {
  if (value === null) return fnv1aStep(seed, `~n`);
  switch (typeof value) {
    case `undefined`:
      return fnv1aStep(seed, `~u`);
    case `string`:
      return hashStringSampled(fnv1aStep(seed, `~s`), value);
    case `number`:
      return fnv1aStep(seed, `~#${value}`);
    case `boolean`:
      return fnv1aStep(seed, value ? `~t` : `~f`);
    case `object`:
      break;
    default:
      return fnv1aStep(seed, `~x`);
  }
  if (Array.isArray(value)) {
    let hash = fnv1aStep(seed, `~a${value.length}`);
    for (const item of value) hash = hashValueDeep(hash, item);
    return hash;
  }
  // 原代码此处含无效副作用表达式 `t instanceof ArrayBuffer, t.byteLength`（压缩残留），语义等价于取 byteLength
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return fnv1aStep(seed, `~b${value.byteLength}`);
  let hash = fnv1aStep(seed, `~o`);
  for (const key of Object.keys(value)) {
    const item = (value as Record<string, unknown>)[key];
    item !== undefined && ((hash = fnv1aStep(hash, key)), (hash = hashValueDeep(hash, item)));
  }
  return hash;
}

/** 原 Gs：结构哈希（base36） */
export function structuralHashBase36(value: unknown): string {
  return hashValueDeep(FNV_OFFSET_BASIS, value).toString(36);
}

const structuralHashCache = new WeakMap<object, string>(); // 原 Ks

/** 原 qs：对象缓存结构哈希（非对象直算） */
export function cachedStructuralHash(value: unknown): string {
  if (typeof value != `object` || !value) return structuralHashBase36(value);
  const cached = structuralHashCache.get(value);
  if (cached !== undefined) return cached;
  const hash = structuralHashBase36(value);
  return structuralHashCache.set(value, hash), hash;
}

const metadataFingerprintCache = new WeakMap<object, string>(); // 原 Js

/** 文档元数据指纹输入（原 Ys 取用的字段） */
export interface DocxMetadataFingerprintInput {
  sections?: unknown;
  headerSections?: unknown;
  footerSections?: unknown;
  numberingDefinitions?: unknown;
  footnotes?: unknown;
  endnotes?: unknown;
  documentBackgroundColor?: unknown;
  compatibility?: unknown;
}

/** 原 Ys：文档元数据指纹（八域深哈希 → base36；WeakMap 缓存） */
export function documentMetadataFingerprint(metadata: DocxMetadataFingerprintInput): string {
  const cached = metadataFingerprintCache.get(metadata);
  if (cached !== undefined) return cached;
  let hash = FNV_OFFSET_BASIS;
  (hash = hashValueDeep(hash, metadata.sections)),
    (hash = hashValueDeep(hash, metadata.headerSections)),
    (hash = hashValueDeep(hash, metadata.footerSections)),
    (hash = hashValueDeep(hash, metadata.numberingDefinitions)),
    (hash = hashValueDeep(hash, metadata.footnotes)),
    (hash = hashValueDeep(hash, metadata.endnotes)),
    (hash = hashValueDeep(hash, metadata.documentBackgroundColor)),
    (hash = hashValueDeep(hash, metadata.compatibility));
  const fingerprint = (hash >>> 0).toString(36);
  return metadataFingerprintCache.set(metadata, fingerprint), fingerprint;
}

/** 原 Xs（jsx 14902）：缩略图排除 data 属性名 */
export const THUMBNAIL_EXCLUDE_ATTR = `data-docx-thumbnail-exclude`;
/** 原 jsx 14903（具名常量被摇树丢弃，仅存表达式）：缩略图排除选择器 */
export const THUMBNAIL_EXCLUDE_SELECTOR = [`[${THUMBNAIL_EXCLUDE_ATTR}="true"]`, `textarea`, `[data-image-resize-handle="true"]`, `[data-docx-table-move-handle="true"]`].join(`,`);

/* ============================================================================
 * 尾符号表（本文件导出 ↔ 原混淆名 ↔ jsx 行）
 * ----------------------------------------------------------------------------
 * 导出符号（92）：
 *  A 文本编辑：COMPLEX_CONTENT_XML_RE(Ia,13244) FLD_SIMPLE_RE(La,13245)
 *   buildSourceTextPatch(Ra,13246) isFieldTextDivergent(za,13269)
 *   setParagraphText(Ba,13272) countOccurrences(Va,13277)
 *   registerTableTextPatch(Ha,13284) invalidateTableSourceXml(Ua,13301)
 *   paragraphNodeIndexByOrdinal(Wa,13304) findParagraphByOrdinalDeep(Ga,13311)
 *   splitTextRunsAtOffset(Ka,13330) commonPrefixLength(qa,13372)
 *   commonSuffixLength(Ja,13378) diffTextRunsAgainstString(Ya,13384)
 *   rebuildParagraphChildren(Xa,13422) splitParagraphChildrenAroundRange(Za,13510)
 *   replaceModelParagraphText(Qa,13626) replaceTableCellText($a,13645)
 *   replaceTableCellParagraphText(eo,13696) replaceTableCellParagraphTextDeep(to,13723)
 *   serializeDocxPackage(no,13764)
 *  B 输入：mapBeforeInputEvent(ro,13773) inputCommandCategory(io,13869)
 *   isWhitespaceChar(ao,13882) prevCharUnitLength(oo,13885)
 *   nextCharUnitLength(so,13892) prevWordStart(co,13898) nextWordEnd(lo,13904)
 *   lineStartBefore(uo,13910) lineEndAfter(fo,13915) splicePlainText(po,13920)
 *   applyPlainTextInputCommand(mo,13925) isMergeableTypingEntry(ho,13963)
 *   mergeCellParagraphsAtBoundary(go,13967)
 *  C 分页：PAGE_BREAK_BR_RE(_o,13985) PAGE_BREAK_BEFORE_RE(vo,13986)
 *   parseBoolXmlAttrDefaultTrue(bo,13988) hasPageBreakRun(xo,13995)
 *   hasPageBreakBefore(So,13999) paragraphHasContent(Co,14004)
 *   paragraphHasImage(wo,14007) paragraphHasFormField(To,14010)
 *   isPurePageBreakParagraph(Eo,14013) paragraphNodesOf(Do,14016)
 *   rowHasContent(Oo,14019) contentCellIndexes(ko,14022) isTrailingFillRow(Ao,14028)
 *   tablePageBreakRowIndexes(jo,14033) collectNodePageBreaks(Mo,14061)
 *   pageBudgetSatisfied(Po,14080) footerOverlapResolved(Fo,14089)
 *   updateOverlapStability(Io,14094) memoizePageBuilder(Lo,14109)
 *   chooseEstimatedPages(Ro,14121) isBetterScaleCandidate(zo,14133)
 *   fitPageCountByScale(Bo,14142)
 *  D 历史：hasOwnProperty(Ho,14197) createEditorHistoryReducer(Uo,14200)
 *  E 布局：canMeasureText(ts,14279) lruGet(ns,14282) lruEvict(rs,14286)
 *   getLayoutMeasureContext(is,14293) measureTextWidthPx(as,14300)
 *   measurePrefixWidthPx(os,14306) getLayoutGraphemeSegmenter(ss,14309)
 *   graphemeBoundaryOffsets(cs,14313) graphemeCountOfText(ls,14326)
 *   graphemeOrdinalToOffset(us,14329) measuredRangeLength(ds,14333)
 *   layoutCacheKey(fs,14357) fragmentPrefixWidths(ps,14360)
 *   hitTestFragmentX(ms,14369) nearestLineIndexByY(hs,14381)
 *   measurePreWrapCached(gs,14391) countWrappedLinesCached(_s,14404)
 *   cloneItemCursor(vs,14418) isCursorAtItemStart(ys,14424)
 *   normalizeItemCursor(bs,14427) isItemCursorExhausted(xs,14439)
 *   measureRestOfItemLine(Ss,14442) fitItemsIntoInterval(Cs,14445)
 *   wouldTruncateItemStart(ws,14493) shouldSkipTruncatedFit(Ts,14505)
 *   isSegmentCursorAtEnd(Es,14525) isCursorAfterHardBreak(Ds,14528)
 *   isMidSegmentEnd(Os,14531) lineEndsMidSegment(ks,14538)
 *   canFitIntoAnyInterval(As,14541) subtractExclusionIntervals(js,14548)
 *   layoutPlainTextBlock(Ms,14573) layoutTextItemsBlock(Ns,14656)
 *   hitTestTextOffset(Ps,14746) caretRectForOffset(Fs,14767)
 *   selectionRangeRects(Is,14789) sliceLayoutLines(Ls,14813)
 *  F 哈希：fnv1aStep(Hs,14840) hashStringSampled(Us,14845)
 *   hashValueDeep(Ws,14855) structuralHashBase36(Gs,14883)
 *   cachedStructuralHash(qs,14888) documentMetadataFingerprint(Ys,14893)
 *   THUMBNAIL_EXCLUDE_ATTR(Xs,14902) THUMBNAIL_EXCLUDE_SELECTOR(jsx 14903)
 * 内部（未导出）：tableBreakCache(yo,13987) SCALE_SEARCH_STEPS(No,14079)
 *   HISTORY_LIMIT(Vo,14196) PRE_WRAP_CACHE_LIMIT(Wo,14269)
 *   BLOCK_LAYOUT_CACHE_LIMIT(Go,14270) LINE_COUNT_CACHE_LIMIT(Ko,14271)
 *   preWrapMeasureCache(qo,14272) blockLayoutCache(Jo,14273)
 *   lineCountCache(Yo,14274) fragmentPrefixWidthCaches(Xo,14275)
 *   graphemeBoundaryCache(Zo,14276) layoutMeasureCanvas(Qo,14277)
 *   layoutMeasureContext($o,14277) layoutGraphemeSegmenter(es,14278)
 *   structuralHashCache(Ks,14886) metadataFingerprintCache(Js,14892)
 *   FNV_OFFSET_BASIS(Rs,14836) FNV_PRIME(zs,14837)
 *   HASH_SAMPLE_LENGTH(Bs,14838) HASH_FULL_LENGTH_LIMIT(Vs,14839)
 *   emptyBlockLayout(Ms 空文本分支助手)
 * 外部挂接（declare）：cloneParagraphNode/cloneDocModel/cloneTableNode
 *   （chunk-YE7GQOST）· packageToWireFormat/serializeDocxWithWasm（chunk-WKBPLHUA）
 * ============================================================================
 */
