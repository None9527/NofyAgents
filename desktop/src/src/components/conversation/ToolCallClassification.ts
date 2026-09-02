// A1-P1-B18：工具分类/文件摘要域逐字重建（styles js 22573–22860 + 22861–22995 + 23029–23186 + 23215–23273 + 23393–23749，66 实体）。
// A1-P1-B19：B18 区段切分界外段闭合——Ih/Lh/Rh/zh/Bh@22656–22691（编辑载荷提取族）+ sg/cg@23187–23195（file-write 子族判定）
//   并入本叶（7 实体，域吻合裁定：段落本在 B18 区段行范围内，头注墓碑预留本批）。消费面 = PreviewCards 余 5 declare 全闭
//   （cg/sg/Bh/Rh 转录 + Kh@22830 改指 B18 既有实体）。新跨 chunk 依赖：gte→isFileWriteToolName（styles 681 导入 h as gte；
//   SrcSharedB zS，canonical 改指，零重录）。型缝全部带〔A1-P1-B19〕（参 : any / 返回按 declare 面标注；束无类型面，接缝仅编译期）。
//   Kh 返回面核对〔A1-P1-B19〕：bundle Kh@22830 恒返回 string（`a ? Dme(S,o) : S` 双支均 string，Dme@22573 恒返回 string），
//   canonical 标注 `: string` 与束一致；PreviewCards 原 declare 面 `string | null` 为宽化，消费面仅真值判（2195/2203），
//   string 为其子型直接接通，无投射缝。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = PermissionApprovalOverlay :21/:22 + PreviewCards :218 +
//   ToolCallBlock :47/:67 共五 declare → 真实 import 收敛。canonical 返回面 = og 全形 { toolName, family, source, isLegacy }；
//   三消费面型缝（{ family: string } / ToolIdentity / { family: ToolFamily }）均经 ToolClassification 结构兼容接通，
//   参型 ToolClassificationInput 为三面交叠（ToolCall / ToolCallLike / { toolName?; kind? }）〔A1-P1-B18〕。
// 逐字证明：/tmp/a1r0-p1-b18/b18-roundtrip.js（缝逆变换 + 逆改名 ≡ bundle 逐字 EXACT）+ b18-leafcheck.js（独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝登记 /tmp/a1r0-p1-b18/ToolCallClassification.seam-log.txt（行号→leaf/bundle 行对），
//   全部带〔A1-P1-B18〕。型缝类别：参/返回显式标注（: any / : unknown / 守卫 / ToolClassification / FileSummary[] / Set<string> 泛型 /
//   可选参 t?: ToolCall）——bundle 无类型面，接缝仅编译期。
// 跨 chunk 依赖全部既有 canonical 改指（禁重录）：dte→canonicalizeToolName（styles 673 导入 g as dte；SrcSharedB §39 LS）/
//   Jte→resolveToolViewKind（styles 721 m as Jte；§39 RS）/ ste→isTodoToolTitle（styles 666 f as ste；§40 aC）/
//   Xr→countLineDiffChanges（styles 636 b as Xr；lib/lineDiff bS）← SrcSharedB | zc→resolveFileDisplayInfo（js 5150；ModalsLeaves）|
//   Go→baseName（js 1928；MarkdownIntegration）| pg→isPlainRecord / hg→parseToolCallRaw（ToolStatusModel，A1-R61）。
// 区段切分墓碑：Mh@22561（patch 解析 yh 链）界外；Ih/Lh/Rh/zh/Bh@22656–22691 + sg/cg@23187–23195 原界外，
//   A1-P1-B19 闭合并入本叶（见下方映射表两段及实体注记）；Ume/Wme@22996–23028（答案提取，AskUserQuestion 视图批）界外；
//   dhe/lg/fhe/phe@23274–23300+（截断标记域）界外；23300–23389（diff 预览策略域）界外；zhe/vg/Bhe/Vhe/yg@23750+（相对路径/统计文案域）界外。
//
// 映射表（minified → 语义名 → bundle 定义行）：
//   【diff 构造器族 22573–22860】
//   Kc→HUNK_HEADER_PATTERN（5273，chunk var 局域引入）| Dme→trimDiffHunkContext（22573）| Nh→flushHunkContext（22631）
//   Ph→emitHunk（22646）| Fh→formatHunkRange（22652）| Ome→DIFF_LCS_CELL_BUDGET（22655）| Vh→splitDiffLines（22692）
//   Hh→formatFullRange（22698）| Uh→formatOffsetRange（22701）| kme→commonPrefixLineCount（22704）| Ame→commonSuffixLineCount（22710）
//   Wh→pushPrefixedLines（22716）| jme→indexUniqueLines（22719）| Mme→longestIncreasingSubsequence（22749）
//   Nme→diffLinesUniqueAnchor（22768）| Pme→diffLinesLcs（22783）| Gh→appendLineDiff（22827）| Kh→buildUnifiedDiffText（22830）
//   【编辑载荷提取族 22656–22691】（A1-P1-B19 并入；B18 区段切分段闭合）
//   Ih→isEditPayloadObject（22656）| Lh→firstTrimmedPayloadField（22659）| Rh→extractBeforeAfterEdit（22666）
//   zh→parseDiffTypedPayload（22672）| Bh→parseToolRawPayload（22682）
//   【问句载荷族 22861–22995】
//   Fme→CUSTOM_INPUT_OPTION_FIELDS（22861）| Ime→CUSTOM_INPUT_OPTION_PATTERN（22862）| qh→isQuestionPlainRecord（22864）
//   Jh→firstTrimmedStringField（22867）| Lme→hasTrueField（22873）| Rme→normalizeQuestionOption（22876）
//   zme→isCustomInputOption（22890）| Yh→extractQuestionList（22893）| Bme→extractAnswerRecord（22902）
//   Hme→normalizeQuestion（22951）| $h→parseQuestionPayload（22980）| eg→resolveQuestionSource（22988）
//   【og 分类族 23029–23186】
//   Gme→DEFAULT_TOOL_CLASSIFICATION（23029）| tg→isToolPlainRecord（23030）| Kme→trimmedNonEmptyString（23033）
//   ng→deepTrimmedString（23036）| rg→normalizeToolTerm（23044）| ig→classifyByName（23052）| ag→legacyClassification（23058）
//   qme→parseRawToolMeta（23061）| Jme→isAgentLikePayload（23070）| Yme→isSkillLikePayload（23089）| Xme→hasQuestionPayload（23099）
//   Zme→isGoalToolTerm（23102）| Qme→classifyKindTerm（23105）| $me→isSwitchModeTerm（23122）| og→classifyToolCall（23132）
//   【file-write 子族判定 23187–23195】（A1-P1-B19 并入；B18 区段切分段闭合）
//   sg→toolEditFamilyOf（23187）| cg→toolContentFamilyOf（23193）（sg 依赖 gte≡isFileWriteToolName：SrcSharedB canonical 改指）
//   【_g 文件摘要族 23215–23273 + 23393–23749】
//   uhe→countUnifiedDiffs（23215）| mg→firstStringField（23393）| xhe→extractRawDiffText（23399）| She→normalizeDiffText（23402）
//   Che→parseDiffContent（23430）| whe→extractChangeMaps（23440）| The→lowerTrimmed（23451）| gg→isFileWriteToolCall（23454）
//   Ehe→isFileReadToolCall（23457）| Dhe→classifyOperationTerm（23460）| Ohe→collectOperationTerms（23476）
//   khe→extractContentTexts（23501）| Ahe→findFilePath（23515）| jhe→findFileContent（23531）| Mhe→findBeforeAfterTexts（23550）
//   Nhe→summarizeToolCallFiles（23568）| Phe→collectFileOperationHints（23604）| Fhe→resolveOperationKind（23615）
//   Ihe→extractFileDiffDisplays（23634）| Lhe→renderStructuredPatch（23643）| Rhe→extractDisplayFileSummaries（23661）
//   _g→extractRawFileSummaries（23686）
/* eslint-disable */
import { type FileSummary, type ToolCall } from '../../modules/ConversationLeaves'; // A0-D 类型收敛：会话流共享类型 canonical
import { baseName } from '../../modules/MarkdownIntegration'; // 原 Go（js 1928）：canonical 改指
import { resolveFileDisplayInfo } from '../../modules/ModalsLeaves'; // 原 zc（js 5150）：canonical 改指
import { canonicalizeToolName, resolveToolViewKind, isTodoToolTitle, countLineDiffChanges, isFileWriteToolName } from '../../modules/SrcSharedB'; // 原 dte/Jte/ste/Xr：canonical 改指（styles 673/721/666/636 导入别名）；〔A1-P1-B19〕增 isFileWriteToolName（原 gte，styles 681 导入 h as gte；src chunk zS@9192）
import { isPlainRecord, parseToolCallRaw } from './ToolStatusModel'; // 原 pg（styles 23390）/hg（styles 23421）：A1-R61 实体化

/** 工具分类 canonical 返回面 = bundle og 全形〔A1-P1-B18〕。
 * 索引签名接通 PreviewCards ToolIdentity { family: string; [key: string]: unknown } 消费面〔A1-P1-B18〕。 */
export interface ToolClassification {
  toolName: string | null;
  family: string;
  source: string;
  isLegacy: boolean;
  [key: string]: unknown;
}
/** classifyToolCall 参型：三消费面交叠（ToolCall / PreviewCards ToolCallLike / ToolCallBlock { toolName?; kind? }）〔A1-P1-B18〕 */
export interface ToolClassificationInput {
  toolName?: string | null;
  kind?: string | null;
  title?: string | null;
  input?: unknown;
  raw?: unknown;
  [key: string]: unknown;
}

/* ══ diff 构造器族（styles 22573–22860；Kh 链 = _g patch 分支依赖） ══ */
/* ── 原 Kc（js 5273）→ HUNK_HEADER_PATTERN：chunk var 局域引入（Dme 铰链） ── */
var HUNK_HEADER_PATTERN = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?: (.*))?/m;

/* ── 原 Dme（js 22573–22630）→ trimDiffHunkContext：hunk 上下文裁剪（Kh contextLines 链） ── */
function trimDiffHunkContext(e: any, t = 10) {
  let n = [],
    r: any;
  for (let i of e.split(`
`)) {
    let e = i.match(HUNK_HEADER_PATTERN);
    if (e != null) {
      r != null && (r.hunkLines.length > 0 && (flushHunkContext(r, t, `trailing`), emitHunk(r, n)), (r = void 0));
      let a = parseInt(e[3]),
        o = parseInt(e[1]),
        s = parseInt(e[4] ?? `1`),
        c = parseInt(e[2] ?? `1`);
      isNaN(a) || isNaN(o) || isNaN(s) || isNaN(c)
        ? n.push(i)
        : (r = {
            additionStart: a,
            deletionStart: o,
            additionCount: 0,
            deletionCount: 0,
            hunkLines: [],
            contextLines: [],
          });
      continue;
    }
    if (r == null) {
      n.push(i);
      continue;
    }
    if (i.startsWith(` `)) r.contextLines.push(i);
    else if (i !== ``) {
      if (r.hunkLines.length > 0 && r.contextLines.length > t * 2) {
        let e = r.contextLines.length - t * 2,
          i = r.contextLines.slice(-t);
        flushHunkContext(r, t, `trailing`);
        let { additionCount: a, deletionCount: o } = r;
        (emitHunk(r, n),
          (r = {
            additionStart: r.additionStart + a + e,
            deletionStart: r.deletionStart + o + e,
            deletionCount: 0,
            additionCount: 0,
            contextLines: i,
            hunkLines: [],
          }));
      }
      (flushHunkContext(r, t, r.hunkLines.length === 0 ? `leading` : `before-change`),
        r.hunkLines.push(i),
        i.startsWith(`+`) ? (r.additionCount += 1) : i.startsWith(`-`) && (r.deletionCount += 1));
    }
  }
  r != null && r.hunkLines.length > 0 && (flushHunkContext(r, t, `trailing`), emitHunk(r, n));
  let i = n.join(`
`);
  return e.endsWith(`
`)
    ? `${i}\n`
    : i;
}

/* ── 原 Nh（js 22631–22645）→ flushHunkContext：hunk 上下文冲刷 ── */
function flushHunkContext(e: any, t: any, n: any) {
  if (n === `leading` && e.contextLines.length > t) {
    let n = e.contextLines.length - t;
    (e.contextLines.splice(0, n), (e.additionStart += n), (e.deletionStart += n));
  }
  return (
    n === `trailing` && e.contextLines.length > t && (e.contextLines.length = t),
    e.contextLines.length > 0 &&
      (e.hunkLines.push(...e.contextLines),
      (e.additionCount += e.contextLines.length),
      (e.deletionCount += e.contextLines.length),
      (e.contextLines.length = 0)),
    e
  );
}

/* ── 原 Ph（js 22646–22651）→ emitHunk：hunk 头+行发射 ── */
function emitHunk(e: any, t: any) {
  (t.push(
    `@@ -${formatHunkRange(e.deletionStart, e.deletionCount)} +${formatHunkRange(e.additionStart, e.additionCount)} @@`,
  ),
    t.push(...e.hunkLines));
}

/* ── 原 Fh（js 22652–22654）→ formatHunkRange：hunk 区间格式 ── */
function formatHunkRange(e: any, t: any) {
  return t === 1 ? `${e}` : `${e},${t}`;
}

/* ── 原 Ome（js 22655）→ DIFF_LCS_CELL_BUDGET：LCS 单元预算（6e4） ── */
var DIFF_LCS_CELL_BUDGET = 6e4;

/* ══ 编辑载荷提取族（styles 22656–22691；A1-P1-B19 并入：PreviewCards Bh/Rh declare 批，B18 区段切分段闭合） ══ */
/* ── 原 Ih（js 22656–22658）→ isEditPayloadObject：对象载荷判定（无 Array 排除，与 pg@23390/qh@22864/tg@23030 体异，束独立定义按符号各保）〔A1-P1-B19〕 ── */
function isEditPayloadObject(e: any) {
  return typeof e == `object` && !!e;
}
/* ── 原 Lh（js 22659–22665）→ firstTrimmedPayloadField：首键非空字符串取值（Ih 守卫；局部名 t 遮蔽参数 t = 束形）〔A1-P1-B19〕 ── */
function firstTrimmedPayloadField(e: any, t: any) {
  if (isEditPayloadObject(e))
    for (let n of t) {
      let t = e[n];
      if (typeof t == `string` && t.trim()) return t;
    }
}
/* ── 原 Rh（js 22666–22671）→ extractBeforeAfterEdit：before/after 对提取（返回面 = PreviewCards 原 declare 面）〔A1-P1-B19〕 ── */
function extractBeforeAfterEdit(e: any): { before: string; after: string } | null {
  if (!isEditPayloadObject(e)) return null;
  let t = firstTrimmedPayloadField(e, [`before`, `old_string`, `oldText`, `oldContent`]),
    n = firstTrimmedPayloadField(e, [`after`, `new_string`, `newText`, `newContent`]);
  return t !== void 0 && n !== void 0 ? { before: t, after: n } : null;
}
/* ── 原 zh（js 22672–22681）→ parseDiffTypedPayload：type=diff 载荷解析（oldText 缺省空串 / 非串 String 强转）〔A1-P1-B19〕 ── */
function parseDiffTypedPayload(e: any): any {
  return !isEditPayloadObject(e) || e.type !== `diff` || typeof e.newText != `string`
    ? null
    : {
        path: typeof e.path == `string` && e.path.trim() ? e.path : void 0,
        oldText:
          typeof e.oldText == `string` ? e.oldText : e.oldText == null ? `` : String(e.oldText),
        newText: e.newText,
      };
}
/* ── 原 Bh（js 22682–22691）→ parseToolRawPayload：raw 载荷解析（diff 直取 / content 数组双路；返回面 = PreviewCards 原 declare 面）〔A1-P1-B19〕 ── */
function parseToolRawPayload(e: any): { oldText?: string; newText?: string; path?: string } | null {
  let t = parseDiffTypedPayload(e);
  if (t) return t;
  if (!isEditPayloadObject(e) || !Array.isArray(e.content)) return null;
  for (let t of e.content) {
    let e = parseDiffTypedPayload(t);
    if (e) return e;
  }
  return null;
}

/* ── 原 Vh（js 22692–22697）→ splitDiffLines：空串→空数组 分行 ── */
function splitDiffLines(e: any) {
  return e.length === 0
    ? []
    : e.split(`
`);
}

/* ── 原 Hh（js 22698–22700）→ formatFullRange：全量区间格式（无 context 钳制时） ── */
function formatFullRange(e: any) {
  return e === 0 ? `0,0` : `1,${e}`;
}

/* ── 原 Uh（js 22701–22703）→ formatOffsetRange：偏移区间格式 ── */
function formatOffsetRange(e: any, t: any) {
  return t === 0 ? `${e},0` : `${e + 1},${t}`;
}

/* ── 原 kme（js 22704–22709）→ commonPrefixLineCount：公共前行计数 ── */
function commonPrefixLineCount(e: any, t: any) {
  let n = Math.min(e.length, t.length),
    r = 0;
  for (; r < n && e[r] === t[r];) r += 1;
  return r;
}

/* ── 原 Ame（js 22710–22715）→ commonSuffixLineCount：公共后行计数 ── */
function commonSuffixLineCount(e: any, t: any, n: any) {
  let r = Math.min(e.length, t.length) - n,
    i = 0;
  for (; i < r && e[e.length - 1 - i] === t[t.length - 1 - i];) i += 1;
  return i;
}

/* ── 原 Wh（js 22716–22718）→ pushPrefixedLines：前缀行推入 ── */
function pushPrefixedLines(e: any, t: any, n: any) {
  e.push(...n.map((e: any) => `${t}${e}`));
}

/* ── 原 jme（js 22719–22748）→ indexUniqueLines：唯一行索引（启发式 diff 锚点） ── */
function indexUniqueLines(e: any, t: any) {
  let n = new Map(),
    r = new Map();
  for (let t = 0; t < e.length; t += 1) {
    let r = e[t],
      i = n.get(r);
    if (i) {
      i.count += 1;
      continue;
    }
    n.set(r, { count: 1, firstIndex: t });
  }
  for (let e = 0; e < t.length; e += 1) {
    let n = t[e],
      i = r.get(n);
    if (i) {
      i.count += 1;
      continue;
    }
    r.set(n, { count: 1, firstIndex: e });
  }
  let i = [];
  for (let [e, t] of n) {
    let n = r.get(e);
    t.count !== 1 ||
      n?.count !== 1 ||
      i.push({ beforeIndex: t.firstIndex, afterIndex: n.firstIndex });
  }
  return (i.sort((e, t) => e.beforeIndex - t.beforeIndex), i);
}

/* ── 原 Mme（js 22749–22767）→ longestIncreasingSubsequence：LIS（锚点序列） ── */
function longestIncreasingSubsequence(e: any) {
  if (e.length === 0) return [];
  let t = Array(e.length).fill(-1),
    n = [];
  for (let r = 0; r < e.length; r += 1) {
    let i = e[r],
      a = 0,
      o = n.length;
    for (; a < o;) {
      let t = Math.floor((a + o) / 2);
      e[n[t]].afterIndex < i.afterIndex ? (a = t + 1) : (o = t);
    }
    (a > 0 && (t[r] = n[a - 1]), (n[a] = r));
  }
  let r = [],
    i = n[n.length - 1];
  for (; i >= 0;) (r.push(e[i]), (i = t[i] ?? -1));
  return r.reverse();
}

/* ── 原 Nme（js 22768–22782）→ diffLinesUniqueAnchor：唯一锚点行 diff（超预算回退） ── */
function diffLinesUniqueAnchor(e: any, t: any, n: any) {
  let r = longestIncreasingSubsequence(indexUniqueLines(t, n));
  if (r.length === 0) {
    (pushPrefixedLines(e, `-`, t), pushPrefixedLines(e, `+`, n));
    return;
  }
  let i = 0,
    a = 0;
  for (let o of r)
    (appendLineDiff(e, t.slice(i, o.beforeIndex), n.slice(a, o.afterIndex)),
      e.push(` ${t[o.beforeIndex]}`),
      (i = o.beforeIndex + 1),
      (a = o.afterIndex + 1));
  appendLineDiff(e, t.slice(i), n.slice(a));
}

/* ── 原 Pme（js 22783–22826）→ diffLinesLcs：LCS 行 diff ── */
function diffLinesLcs(e: any, t: any, n: any) {
  if (t.length === 0) {
    pushPrefixedLines(e, `+`, n);
    return;
  }
  if (n.length === 0) {
    pushPrefixedLines(e, `-`, t);
    return;
  }
  if (t.length * n.length > DIFF_LCS_CELL_BUDGET) {
    diffLinesUniqueAnchor(e, t, n);
    return;
  }
  let r = Array.from({ length: t.length + 1 }, () => Array(n.length + 1).fill(0));
  for (let e = t.length - 1; e >= 0; --e)
    for (let i = n.length - 1; i >= 0; --i)
      r[e][i] =
        t[e] === n[i] ? (r[e + 1][i + 1] ?? 0) + 1 : Math.max(r[e + 1][i] ?? 0, r[e][i + 1] ?? 0);
  let i = 0,
    a = 0;
  for (; i < t.length || a < n.length;) {
    let o = t[i],
      s = n[a];
    if (o !== void 0 && s !== void 0 && o === s) {
      (e.push(` ${o}`), (i += 1), (a += 1));
      continue;
    }
    if (o === void 0 && s !== void 0) {
      (e.push(`+${s}`), (a += 1));
      continue;
    }
    if (s === void 0 && o !== void 0) {
      (e.push(`-${o}`), (i += 1));
      continue;
    }
    let c = r[i][a + 1] ?? -1,
      l = r[i + 1][a] ?? -1;
    if (s !== void 0 && c >= l) {
      (e.push(`+${s}`), (a += 1));
      continue;
    }
    o !== void 0 && (e.push(`-${o}`), (i += 1));
  }
}

/* ── 原 Gh（js 22827–22829）→ appendLineDiff：行 diff 追加（Pme 薄包装） ── */
function appendLineDiff(e: any, t: any, n: any) {
  diffLinesLcs(e, t, n);
}

/* ── 原 Kh（js 22830–22860）→ buildUnifiedDiffText：unified-diff 生成（_g patch 分支 / PreviewCards 候闭消费） ── */
function buildUnifiedDiffText(e: any, t: any, n: any, r?: any): string {
  let i = r?.contextLines,
    a = typeof i == `number` && Number.isFinite(i) && i >= 0,
    o = a ? Math.max(0, Math.floor(i)) : 0,
    s = splitDiffLines(e),
    c = splitDiffLines(t),
    l = commonPrefixLineCount(s, c),
    u = commonSuffixLineCount(s, c, l),
    d = s.slice(l, s.length - u),
    f = c.slice(l, c.length - u),
    p = s.length === 0 && c.length > 0,
    m = s.length > 0 && c.length === 0,
    h = a ? Math.min(l, o) : l,
    g = a ? Math.min(u, o) : u,
    _ = l - h,
    v = l - h,
    y = h + d.length + g,
    b = h + f.length + g,
    x = [
      `diff --git a/${n} b/${n}`,
      p ? `--- /dev/null` : `--- a/${n}`,
      m ? `+++ /dev/null` : `+++ b/${n}`,
      a ? `@@ -${formatOffsetRange(_, y)} +${formatOffsetRange(v, b)} @@` : `@@ -${formatFullRange(s.length)} +${formatFullRange(c.length)} @@`,
    ];
  (x.push(...s.slice(l - h, l).map((e: any) => ` ${e}`)),
    appendLineDiff(x, d, f),
    g > 0 && x.push(...s.slice(s.length - u, s.length - u + g).map((e: any) => ` ${e}`)));
  let S = x.join(`
`);
  return a ? trimDiffHunkContext(S, o) : S;
}

/* ══ 问句载荷族（styles 22861–22995；Xme 依赖闭包） ══ */
/* ── 原 Fme（js 22861–22863）→ CUSTOM_INPUT_OPTION_FIELDS：自定义输入选项字段表 + 词样（Ime 同 var 声明） ── */
var CUSTOM_INPUT_OPTION_FIELDS = [`requiresInput`, `customInput`, `isCustom`, `freeText`, `allowFreeText`],
  CUSTOM_INPUT_OPTION_PATTERN =
    /(其他|其它|自定义|自行|自己|补充|填写|填入|输入|other|custom|free\s*text|specify|write\s*in)/i;

/* ── 原 qh（js 22864–22866）→ isQuestionPlainRecord：普通对象判定（体同 pg@23390/$Z@99564/tg@23030，束四处独立定义按符号各保） ── */
function isQuestionPlainRecord(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/* ── 原 Jh（js 22867–22872）→ firstTrimmedStringField：首键非空字符串取值 ── */
function firstTrimmedStringField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t == `string` && t.trim().length > 0) return t;
  }
}

/* ── 原 Lme（js 22873–22875）→ hasTrueField：字段真值判定 ── */
function hasTrueField(e: any, t: any) {
  return t.some((t: any) => e[t] === !0);
}

/* ── 原 Rme（js 22876–22889）→ normalizeQuestionOption：选项归一化（字符串/对象双路） ── */
function normalizeQuestionOption(e: unknown, t: any): any {
  if (typeof e == `string`) return { id: `option-${t}`, label: e, requiresInput: !1 };
  if (!isQuestionPlainRecord(e)) return null;
  let n = firstTrimmedStringField(e, [`label`, `name`, `title`, `text`, `value`]) ?? JSON.stringify(e),
    r = firstTrimmedStringField(e, [`id`, `optionId`, `value`, `key`]) ?? n,
    i = firstTrimmedStringField(e, [`placeholder`, `customInputPlaceholder`, `freeTextPlaceholder`, `inputPlaceholder`]);
  return {
    id: r,
    label: n,
    description: firstTrimmedStringField(e, [`description`, `detail`, `help`, `hint`]),
    placeholder: i,
    requiresInput: hasTrueField(e, CUSTOM_INPUT_OPTION_FIELDS) || (t >= 0 && i !== void 0),
  };
}

/* ── 原 zme（js 22890–22892）→ isCustomInputOption：自定义输入选项词样命中 ── */
function isCustomInputOption(e: any) {
  return e ? CUSTOM_INPUT_OPTION_PATTERN.test(e.label) : !1;
}

/* ── 原 Yh（js 22893–22901）→ extractQuestionList：问题列表提取（questions 数组 / 单题对象） ── */
function extractQuestionList(e: unknown): any[] {
  if (!isQuestionPlainRecord(e)) return [];
  let t = e.questions;
  return Array.isArray(t)
    ? t
    : typeof e.question == `string` && Array.isArray(e.options)
      ? [e]
      : [];
}

/* ── 原 Bme（js 22902–22906）→ extractAnswerRecord：answers 记录提取 ── */
function extractAnswerRecord(e: unknown) {
  if (!isQuestionPlainRecord(e)) return;
  let t = e.answers;
  return isQuestionPlainRecord(t) ? t : void 0;
}

/* ── 原 Hme（js 22951–22979）→ normalizeQuestion：单题归一化（选项/自定义输入/多选） ── */
function normalizeQuestion(e: unknown, t: any) {
  if (!isQuestionPlainRecord(e)) return null;
  let n = firstTrimmedStringField(e, [`question`, `prompt`, `label`, `title`, `text`]);
  if (!n) return null;
  let r = (Array.isArray(e.options) ? e.options : [])
      .map((e, t) => normalizeQuestionOption(e, t))
      .filter((e) => e !== null),
    i = firstTrimmedStringField(e, [`customInputPlaceholder`, `freeTextPlaceholder`, `inputPlaceholder`]),
    a = r.at(-1),
    o = a !== void 0 && (a.requiresInput === !0 || isCustomInputOption(a)),
    s =
      o && a
        ? { ...a, placeholder: a.placeholder ?? a.label, requiresInput: !0 }
        : i
          ? { id: `custom-${t}`, label: i, placeholder: i, requiresInput: !0 }
          : void 0,
    c = o ? r.slice(0, -1) : r,
    l =
      e.multiple === !0 || e.multiSelect === !0 || e.type === `multiple` || e.type === `multi`
        ? `multiple`
        : `single`;
  return {
    id: firstTrimmedStringField(e, [`id`, `key`, `name`]) ?? `question-${t}`,
    question: n,
    type: l,
    options: c,
    customInput: s,
  };
}

/* ── 原 $h（js 22980–22987）→ parseQuestionPayload：问句载荷解析（questions+answers） ── */
function parseQuestionPayload(e: any) {
  return {
    questions: extractQuestionList(e)
      .map((e, t) => normalizeQuestion(e, t))
      .filter((e) => e !== null),
    answers: extractAnswerRecord(e),
  };
}

/* ── 原 eg（js 22988–22995）→ resolveQuestionSource：问句源解析（input 优先，raw 次之） ── */
function resolveQuestionSource(e: any) {
  if (extractQuestionList(e.input).length > 0) return e.input;
  if (isQuestionPlainRecord(e.raw)) {
    if (extractQuestionList(e.raw.rawInput).length > 0) return e.raw.rawInput;
    if (extractQuestionList(e.raw.input).length > 0) return e.raw.input;
  }
  return e.input;
}

/* ══ og 分类族（styles 23029–23186） ══ */
/* ── 原 Gme（js 23029）→ DEFAULT_TOOL_CLASSIFICATION：缺省分类值 ── */
var DEFAULT_TOOL_CLASSIFICATION: ToolClassification = { toolName: null, family: `unknown`, source: `unknown`, isLegacy: !1 };

/* ── 原 tg（js 23030–23032）→ isToolPlainRecord：普通对象判定（体同 pg@23390/$Z@99564/qh@22864，束四处独立定义按符号各保） ── */
function isToolPlainRecord(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/* ── 原 Kme（js 23033–23035）→ trimmedNonEmptyString：非空 trim 字符串（体同 eQ@99567 孪生） ── */
function trimmedNonEmptyString(e: unknown): string | undefined {
  return typeof e == `string` && e.trim().length > 0 ? e.trim() : void 0;
}

/* ── 原 ng（js 23036–23043）→ deepTrimmedString：深路径取字符串 ── */
function deepTrimmedString(e: any, t: any): string | undefined {
  let n = e;
  for (let e of t) {
    if (!isToolPlainRecord(n)) return;
    n = n[e];
  }
  return trimmedNonEmptyString(n);
}

/* ── 原 rg（js 23044–23051）→ normalizeToolTerm：词条归一化（trim/小写/[s-]→_） ── */
function normalizeToolTerm(e: any): string {
  return (
    e
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, `_`) ?? ``
  );
}

/* ── 原 ig（js 23052–23057）→ classifyByName：按名分类（canonicalizeToolName→resolveToolViewKind） ── */
function classifyByName(e: any, t: any): ToolClassification | null {
  let n = canonicalizeToolName(e);
  if (!n) return null;
  let r = resolveToolViewKind(n);
  return r ? { toolName: n, family: r, source: t, isLegacy: !1 } : null;
}

/* ── 原 ag（js 23058–23060）→ legacyClassification：legacy 分类构造 ── */
function legacyClassification(e: any, t: any, n: any): ToolClassification {
  return { toolName: e, family: t, source: n, isLegacy: !0 };
}

/* ── 原 qme（js 23061–23069）→ parseRawToolMeta：raw meta 解析（direct/zcode/claudeCode/kind/title） ── */
function parseRawToolMeta(e: any) {
  return {
    direct: deepTrimmedString(e, [`toolName`]) ?? deepTrimmedString(e, [`tool_name`]) ?? deepTrimmedString(e, [`name`]),
    zcode: deepTrimmedString(e, [`_meta`, `zcode`, `toolName`]),
    claudeCode: deepTrimmedString(e, [`_meta`, `claudeCode`, `toolName`]),
    rawKind: deepTrimmedString(e, [`kind`]),
    rawTitle: deepTrimmedString(e, [`title`]),
  };
}

/* ── 原 Jme（js 23070–23088）→ isAgentLikePayload：agent 形态载荷判定 ── */
function isAgentLikePayload(e: any, t: any) {
  let n = normalizeToolTerm(e.kind),
    r = normalizeToolTerm(e.title),
    i = normalizeToolTerm(t.direct),
    a = normalizeToolTerm(t.zcode),
    o = normalizeToolTerm(t.claudeCode);
  return (
    o === `agent` ||
    o === `task` ||
    a === `agent` ||
    a === `spawn_agent` ||
    i === `agent` ||
    i === `spawn_agent` ||
    n === `agent` ||
    n === `spawn_agent` ||
    (n === `think` && (r === `agent` || r === `task`)) ||
    (n === `think` && isToolPlainRecord(e.input) && typeof e.input.subagent_type == `string`)
  );
}

/* ── 原 Yme（js 23089–23098）→ isSkillLikePayload：skill 形态载荷判定 ── */
function isSkillLikePayload(e: any, t: any) {
  let n = normalizeToolTerm(e.kind),
    r = normalizeToolTerm(e.title);
  return (
    normalizeToolTerm(t.claudeCode) === `skill` ||
    r === `skill` ||
    n === `skill` ||
    (n === `other` && isToolPlainRecord(e.input) && typeof e.input.skill == `string`)
  );
}

/* ── 原 Xme（js 23099–23101）→ hasQuestionPayload：问句载荷存在判定（$h+eg 链） ── */
function hasQuestionPayload(e: any) {
  return parseQuestionPayload(resolveQuestionSource(e)).questions.length > 0;
}

/* ── 原 Zme（js 23102–23104）→ isGoalToolTerm：goal 词条判定 ── */
function isGoalToolTerm(e: any) {
  return e === `goalcreate` || e === `goalupdate`;
}

/* ── 原 Qme（js 23105–23121）→ classifyKindTerm：kind 词条粗分类（读/写/shell/搜索/探索） ── */
function classifyKindTerm(e: any) {
  return /^(?:read|view|open|cat|head|tail|read_file)(?:_|$)/i.test(e)
    ? `file-read`
    : /(?:^|_)(?:edit|patch|replace|multi_edit|multiedit|write|create|save|apply_patch)(?:_|$)/i.test(
          e,
        )
      ? `file-write`
      : /^(?:execute|run|exec|bash|shell|command|terminal)(?:_|$)/i.test(e)
        ? `shell`
        : /^(?:search|grep|find|fetch|web_search|web_fetch|webfetch|query|lookup|glob|list|ls|dir|tree)(?:_|$)/i.test(
              e,
            )
          ? `search`
          : /^(?:explore|inspect)(?:_|$)/i.test(e)
            ? `explore`
            : null;
}

/* ── 原 $me（js 23122–23131）→ isSwitchModeTerm：switch-mode 词条判定 ── */
function isSwitchModeTerm(e: any) {
  return (
    e === `switch_mode` ||
    e === `switchmode` ||
    e === `exited_plan_mode` ||
    e === `exitedplanmode` ||
    e === `exit_plan_mode` ||
    e === `exitplanmode`
  );
}

/* ── 原 og（js 23132–23186）→ classifyToolCall：classifyToolCall 真身（og 全形 { toolName, family, source, isLegacy }） ── */
function classifyToolCall(e: ToolClassificationInput): ToolClassification {
  let t = parseRawToolMeta(e.raw),
    n = normalizeToolTerm(e.kind),
    r = normalizeToolTerm(e.title);
  if (n === `explore`) return legacyClassification(`Explore`, `explore`, `legacy-kind`);
  for (let n of [
    { value: e.toolName, source: `toolName` },
    { value: e.kind, source: `kind` },
    { value: t.direct, source: `raw` },
    { value: t.zcode, source: `raw-zcode-meta` },
  ]) {
    let e = classifyByName(n.value, n.source);
    if (e) return e;
  }
  if (isAgentLikePayload(e, t))
    return legacyClassification(t.direct ?? t.zcode ?? t.claudeCode ?? `Agent`, `agent`, `legacy-payload`);
  let i = classifyByName(e.title, `title`);
  if (i) return i;
  if (
    [e.toolName, e.kind, e.title, t.direct, t.rawKind, t.rawTitle]
      .filter((e) => typeof e == `string`)
      .some(isTodoToolTitle)
  )
    return legacyClassification(`TodoWrite`, `todo`, `legacy-title`);
  if (
    [e.toolName, e.kind, e.title, t.direct, t.rawKind, t.rawTitle]
      .filter((e) => typeof e == `string`)
      .map(normalizeToolTerm)
      .some(isGoalToolTerm)
  )
    return legacyClassification(e.toolName?.trim() ?? e.kind?.trim() ?? `GoalUpdate`, `goal`, `legacy-title`);
  if (r === `enterplanmode` || normalizeToolTerm(t.claudeCode) === `enterplanmode`)
    return legacyClassification(`EnterPlanMode`, `plan-guidance`, `legacy-title`);
  if (
    [e.toolName, e.kind, e.title, t.direct, t.zcode, t.claudeCode, t.rawKind, t.rawTitle]
      .filter((e) => typeof e == `string`)
      .map(normalizeToolTerm)
      .some(isSwitchModeTerm)
  )
    return legacyClassification(`switch_mode`, `switch-mode`, `legacy-kind`);
  if (isSkillLikePayload(e, t)) return legacyClassification(`Skill`, `skill`, `legacy-payload`);
  if (
    n === `ask_question` ||
    r === `askuserquestion` ||
    normalizeToolTerm(t.claudeCode) === `askuserquestion` ||
    hasQuestionPayload(e)
  )
    return legacyClassification(`AskUserQuestion`, `ask-user-question`, `legacy-payload`);
  let a = classifyKindTerm(n);
  if (a) return legacyClassification(e.kind?.trim() ?? null, a, `legacy-kind`);
  if (classifyKindTerm(normalizeToolTerm(e.title).split(`_`)[0] ?? ``) === `file-read`)
    return legacyClassification(e.title?.trim() ?? null, `file-read`, `legacy-title`);
  let o = classifyByName(t.claudeCode, `raw-claude-meta`);
  return o ? { ...o, isLegacy: !0 } : DEFAULT_TOOL_CLASSIFICATION;
}

/* ══ file-write 子族判定（styles 23187–23195；A1-P1-B19 并入：PreviewCards cg/sg declare 批，B18 区段切分段闭合） ══ */
/* ── 原 sg（js 23187–23192）→ toolEditFamilyOf：file-write 结构化写子族（Write 工具名或 write/create/save kind；gte≡isFileWriteToolName canonical 改指；默认参 t = og(e) 束形）〔A1-P1-B19〕 ── */
function toolEditFamilyOf(e: any, t: any = classifyToolCall(e)): boolean {
  if (t.family !== `file-write`) return !1;
  if (isFileWriteToolName(t.toolName)) return !0;
  let n = normalizeToolTerm(e.kind);
  return /^(?:write|create|save)(?:_|$)/i.test(n);
}
/* ── 原 cg（js 23193–23195）→ toolContentFamilyOf：file-write 内容子族（file-write 且非结构化写；默认参 t = og(e) 束形）〔A1-P1-B19〕 ── */
function toolContentFamilyOf(e: any, t: any = classifyToolCall(e)): boolean {
  return t.family === `file-write` && !toolEditFamilyOf(e, t);
}

/* ══ _g 文件摘要族（styles 23215–23273 + 23393–23749） ══ */
/* ── 原 uhe（js 23215–23273）→ countUnifiedDiffs：patch 文本内 unified-diff 段计数（She 多段护栏） ── */
function countUnifiedDiffs(e: any): number {
  let t = e.split(/\r?\n/),
    n = t.filter((e: any) => e.startsWith(`diff --git `)).length;
  if (n > 0) return n;
  let r = (e: any) => {
      let t = e.match(/^@@\s-\d+(?:,(\d+))?\s\+\d+(?:,(\d+))?\s@@/);
      return t ? { oldLines: Number(t[1] ?? `1`), newLines: Number(t[2] ?? `1`) } : null;
    },
    i = (e: any) => (t[e]?.startsWith(`--- `) ?? !1) && (t[e + 1]?.startsWith(`+++ `) ?? !1),
    a = (e: any, n: any, r: any) => {
      let a = e,
        o = n,
        s = r;
      for (; o > 0 || s > 0;) {
        let e = t[a];
        if (e === void 0) return null;
        if (i(a)) return a;
        if (e.startsWith(`\\ `)) {
          a += 1;
          continue;
        }
        if (e.startsWith(` `)) (--o, --s);
        else if (e.startsWith(`-`)) --o;
        else if (e.startsWith(`+`)) --s;
        else return null;
        if (o < 0 || s < 0) return null;
        a += 1;
      }
      for (; t[a]?.startsWith(`\\ `);) a += 1;
      return a;
    },
    o = 0,
    s = 0;
  for (; s < t.length;) {
    let e = t[s],
      n = t[s + 1];
    if (!e?.startsWith(`--- `) || !n?.startsWith(`+++ `)) {
      s += 1;
      continue;
    }
    let i = s + 2,
      c = !1,
      l = !1;
    for (; i < t.length;) {
      let e = r(t[i] ?? ``);
      if (!e) break;
      l = !0;
      let n = a(i + 1, e.oldLines, e.newLines);
      if (n === null) break;
      ((c = !0), (i = n));
    }
    if (!c && !l) {
      s += 1;
      continue;
    }
    ((o += 1), (s = c ? i : s + 2));
  }
  return o;
}

/* ── 原 mg（js 23393–23398）→ firstStringField：首键非空字符串取值（体同 Jh@22867 孪生） ── */
function firstStringField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t == `string` && t.trim().length > 0) return t;
  }
}

/* ── 原 xhe（js 23399–23401）→ extractRawDiffText：raw 载荷 diff 文本提取 ── */
function extractRawDiffText(e: unknown) {
  if (isPlainRecord(e)) return firstStringField(e, [`unified_diff`, `unifiedDiff`, `patch`, `diff`]);
}

/* ── 原 She（js 23402–23420）→ normalizeDiffText：diff 文本归一化（单段补 ---/+++ 头；多段弃用） ── */
function normalizeDiffText(e: any, t: any) {
  if (!e) return;
  let n = e.trim();
  if (n && !(countUnifiedDiffs(n) > 1)) {
    if (/^---\s+/m.test(n) && /^\+\+\+\s+/m.test(n)) return n;
    if (n.startsWith(`@@ `)) {
      let e = n.match(/^@@\s-(\d+)(?:,(\d+))?\s\+(\d+)(?:,(\d+))?\s@@/m),
        r = Number(e?.[2] ?? e?.[1] ?? `1`),
        i = Number(e?.[4] ?? e?.[3] ?? `1`);
      return [
        r === 0 && i > 0 ? `--- /dev/null` : `--- a/${t}`,
        i === 0 && r > 0 ? `+++ /dev/null` : `+++ b/${t}`,
        n,
      ].join(`
`);
    }
    return n;
  }
}

/* ── 原 Che（js 23430–23439）→ parseDiffContent：diff 内容项解析（体同 zh@22672 孪生定义） ── */
function parseDiffContent(e: unknown): any {
  return !isPlainRecord(e) || e.type !== `diff` || typeof e.newText != `string`
    ? null
    : {
        path: typeof e.path == `string` && e.path.trim() ? e.path : void 0,
        oldText:
          typeof e.oldText == `string` ? e.oldText : e.oldText == null ? `` : String(e.oldText),
        newText: e.newText,
      };
}

/* ── 原 whe（js 23440–23450）→ extractChangeMaps：changes 映射三路提取（direct/rawInput/rawOutput） ── */
function extractChangeMaps(e: unknown) {
  if (!isPlainRecord(e)) return { directChanges: null, rawInputChanges: null, rawOutputChanges: null };
  let t = parseToolCallRaw(e),
    n = isPlainRecord(t) ? t : null,
    r = isPlainRecord(e.rawOutput) ? e.rawOutput : null;
  return {
    directChanges: isPlainRecord(e.changes) ? e.changes : null,
    rawInputChanges: n && isPlainRecord(n.changes) ? n.changes : null,
    rawOutputChanges: r && isPlainRecord(r.changes) ? r.changes : null,
  };
}

/* ── 原 The（js 23451–23453）→ lowerTrimmed：trim+小写 ── */
function lowerTrimmed(e: any) {
  return e.trim().toLowerCase();
}

/* ── 原 gg（js 23454–23456）→ isFileWriteToolCall：file-write 族判定（og 分派） ── */
function isFileWriteToolCall(e: any) {
  return e ? classifyToolCall(e).family === `file-write` : !1;
}

/* ── 原 Ehe（js 23457–23459）→ isFileReadToolCall：file-read 族判定（og 分派） ── */
function isFileReadToolCall(e: any) {
  return e ? classifyToolCall(e).family === `file-read` : !1;
}

/* ── 原 Dhe（js 23460–23475）→ classifyOperationTerm：操作词条分类（delete/update/write/edit） ── */
function classifyOperationTerm(e: any) {
  let t = lowerTrimmed(e);
  return t
    ? /(delete|deleted|remov(e|ed)|eras(e|ed)|unlink|destroy|rm)\b/.test(t)
      ? `delete`
      : /(update|updating|updated)\b/.test(t)
        ? `update`
        : /(write|wrote|written|create|creating|created|add|added|save|saved|new)\b/.test(t)
          ? `write`
          : /(edit|editing|edited|modify|modifying|modified|change|changed|patch|replace|replaced|fix|fixed)\b/.test(
                t,
              )
            ? `edit`
            : null
    : null;
}

/* ── 原 Ohe（js 23476–23500）→ collectOperationTerms：操作词条收集（title/kind/input/raw） ── */
function collectOperationTerms(e: any) {
  let t = new Set();
  if (
    (typeof e.title == `string` && e.title.trim().length > 0 && t.add(e.title),
    typeof e.kind == `string` && e.kind.trim().length > 0 && t.add(e.kind),
    isPlainRecord(e.input))
  )
    for (let n of [`description`, `action`, `operation`, `mode`, `title`, `kind`]) {
      let r = e.input[n];
      typeof r == `string` && r.trim().length > 0 && t.add(r);
    }
  if (isPlainRecord(e.raw)) {
    let n = e.raw.kind;
    typeof n == `string` && n.trim().length > 0 && t.add(n);
    let r = e.raw.title;
    typeof r == `string` && r.trim().length > 0 && t.add(r);
    let i = parseToolCallRaw(e.raw);
    if (isPlainRecord(i))
      for (let e of [`description`, `action`, `operation`, `mode`, `title`, `kind`]) {
        let n = i[e];
        typeof n == `string` && n.trim().length > 0 && t.add(n);
      }
  }
  return [...t];
}

/* ── 原 khe（js 23501–23514）→ extractContentTexts：content 文本收集 ── */
function extractContentTexts(e: unknown) {
  if (!isPlainRecord(e)) return [];
  let t = new Set(),
    n = e.content,
    r = (e: any) => {
      typeof e == `string` && e.trim().length > 0 && t.add(e);
    };
  if (Array.isArray(n))
    for (let e of n)
      isPlainRecord(e) &&
        (r(e.text), r(e.content), isPlainRecord(e.content) && (r(e.content.text), r(e.content.content)));
  else isPlainRecord(n) && (r(n.text), r(n.content));
  return [...t];
}

/* ── 原 Ahe（js 23515–23530）→ findFilePath：文件路径字段查找（input/output/raw 四级） ── */
function findFilePath(e: any) {
  if (e)
    for (let t of [e.input, e.output, parseToolCallRaw(e.raw), isPlainRecord(e.raw) ? e.raw.rawOutput : void 0]) {
      if (!isPlainRecord(t)) continue;
      let e = firstStringField(t, [
        `path`,
        `filePath`,
        `file_path`,
        `targetPath`,
        `target_path`,
        `filename`,
        `file`,
      ]);
      if (e) return e;
    }
}

/* ── 原 jhe（js 23531–23549）→ findFileContent：文件内容字段查找 ── */
function findFileContent(e: any) {
  if (e)
    for (let t of [e.input, e.output, parseToolCallRaw(e.raw), isPlainRecord(e.raw) ? e.raw.rawOutput : void 0]) {
      if (!isPlainRecord(t)) continue;
      let e = firstStringField(t, [
        `content`,
        `newText`,
        `new_text`,
        `newString`,
        `new_string`,
        `text`,
        `fileContent`,
        `file_content`,
        `contents`,
        `code`,
      ]);
      if (e !== void 0) return e;
    }
}

/* ── 原 Mhe（js 23550–23567）→ findBeforeAfterTexts：old/new 文本对查找 ── */
function findBeforeAfterTexts(e: any) {
  if (!e) return null;
  for (let t of [e.input, e.output, parseToolCallRaw(e.raw), isPlainRecord(e.raw) ? e.raw.rawOutput : void 0, e.raw]) {
    if (!isPlainRecord(t)) continue;
    let e = firstStringField(t, [`oldText`, `old_string`, `oldString`, `before`, `old_content`, `oldContent`]),
      n = firstStringField(t, [
        `newText`,
        `new_string`,
        `newString`,
        `after`,
        `new_content`,
        `newContent`,
        `content`,
      ]);
    if (e !== void 0 && n !== void 0) return { oldText: e, newText: n };
  }
  return null;
}

/* ── 原 Nhe（js 23568–23603）→ summarizeToolCallFiles：toolCall 兜底文件摘要（单文件 Created/Deleted/Edited） ── */
function summarizeToolCallFiles(e: any) {
  let t = findFilePath(e);
  if (!t || isFileReadToolCall(e) || !isFileWriteToolCall(e)) return [];
  let n = e ? resolveOperationKind([], [], e) : null;
  if (!n) return [];
  let r = resolveFileDisplayInfo(t),
    i = n === `write` ? `Created` : n === `delete` ? `Deleted` : `Edited`,
    a = findFileContent(e),
    o = findBeforeAfterTexts(e),
    s =
      i === `Created` && a !== void 0
        ? countLineDiffChanges(null, a)
        : i === `Deleted` && a !== void 0
          ? countLineDiffChanges(a, ``)
          : i === `Edited` && o
            ? countLineDiffChanges(o.oldText, o.newText)
            : void 0,
    c =
      i === `Created` && a !== void 0
        ? buildUnifiedDiffText(``, a, baseName(t))
        : i === `Edited` && o
          ? buildUnifiedDiffText(o.oldText, o.newText, baseName(t))
          : null;
  return [
    {
      path: t,
      actionLabel: i,
      operationKind: n,
      fileName: r.fileName,
      filePath: r.filePath,
      fileIconSrc: r.fileIconSrc,
      changeStat: s,
      patch: c,
    },
  ];
}

/* ── 原 Phe（js 23604–23614）→ collectFileOperationHints：文件操作提示收集（状态门控） ── */
function collectFileOperationHints(e: any) {
  let t = new Set(),
    n = e.raw,
    r = isPlainRecord(n) && n.status === `pending`,
    i = isPlainRecord(n) && n.status === `completed`,
    a = isFileReadToolCall(e);
  if ((r && typeof e.title == `string` && e.title.trim().length > 0 && t.add(e.title), i && !a))
    for (let e of extractContentTexts(n)) t.add(e);
  for (let n of collectOperationTerms(e)) t.add(n);
  return [...t];
}

/* ── 原 Fhe（js 23615–23633）→ resolveOperationKind：操作类型裁定（词条/动作名/标签三级） ── */
function resolveOperationKind(e: any, t: any, n: any): any {
  if (n && !isFileWriteToolCall(n)) return null;
  if (e.length > 0) {
    let t = e.every((e: any) => e === `write`),
      n = e.every((e: any) => e === `update`),
      r = e.every((e: any) => e === `delete`);
    return t ? `write` : n ? `update` : r ? `delete` : `edit`;
  }
  if (n)
    for (let e of collectFileOperationHints(n)) {
      let t = classifyOperationTerm(e);
      if (t) return t;
    }
  if (t.length === 0) return null;
  let r = t.every((e: any) => e === `Created`),
    i = t.every((e: any) => e === `Edited`),
    a = t.every((e: any) => e === `Deleted`);
  return r ? `write` : a ? `delete` : i || t.length > 0 ? `edit` : null;
}

/* ── 原 Ihe（js 23634–23642）→ extractFileDiffDisplays：file_diff/file_diffs 显示项提取 ── */
function extractFileDiffDisplays(e: unknown) {
  if (!isPlainRecord(e)) return [];
  let t = isPlainRecord(e.display) ? e.display : e;
  return t.kind === `file_diff`
    ? [t]
    : t.kind !== `file_diffs` || !Array.isArray(t.files)
      ? []
      : t.files.filter(isPlainRecord);
}

/* ── 原 Lhe（js 23643–23660）→ renderStructuredPatch：structuredPatch → unified 文本 ── */
function renderStructuredPatch(e: any, t: any) {
  let n = e.structuredPatch;
  if (!Array.isArray(n)) return null;
  let r = [];
  for (let e of n) {
    if (!isPlainRecord(e) || !Array.isArray(e.lines)) continue;
    let t = typeof e.oldStart == `number` ? e.oldStart : 1,
      n = typeof e.oldLines == `number` ? e.oldLines : 1,
      i = typeof e.newStart == `number` ? e.newStart : 1,
      a = typeof e.newLines == `number` ? e.newLines : 1,
      o = e.lines.filter((e) => typeof e == `string`);
    (r.push(`@@ -${t},${n} +${i},${a} @@`), r.push(...o));
  }
  return r.length > 0
    ? [`--- a/${t}`, `+++ b/${t}`, ...r].join(`
`)
    : null;
}

/* ── 原 Rhe（js 23661–23685）→ extractDisplayFileSummaries：显示层文件摘要提取（变参多源去重） ── */
function extractDisplayFileSummaries(...e: any[]) {
  let t = [],
    n = new Set();
  for (let r of e)
    for (let e of extractFileDiffDisplays(r)) {
      let r = firstStringField(e, [`filePath`, `file_path`, `path`]);
      if (!r || n.has(r)) continue;
      n.add(r);
      let i = resolveFileDisplayInfo(r);
      t.push({
        path: r,
        actionLabel: `Edited`,
        operationKind: `edit`,
        fileName: i.fileName,
        filePath: i.filePath,
        fileIconSrc: i.fileIconSrc,
        changeStat: {
          added: typeof e.additions == `number` ? Math.max(0, Math.round(e.additions)) : 0,
          removed: typeof e.deletions == `number` ? Math.max(0, Math.round(e.deletions)) : 0,
        },
        patch: renderStructuredPatch(e, baseName(r)),
      });
    }
  return t;
}

/* ── 原 _g（js 23686–23749）→ extractRawFileSummaries：extractRawFileSummaries 真身（raw→摘要列表，兜底 Nhe） ── */
function extractRawFileSummaries(e: unknown, t?: ToolCall): FileSummary[] {
  if (t && !isFileWriteToolCall(t)) return [];
  if (!isPlainRecord(e)) {
    let e = extractDisplayFileSummaries(t?.output);
    return e.length > 0 ? e : summarizeToolCallFiles(t);
  }
  let n = extractDisplayFileSummaries(e, parseToolCallRaw(e), isPlainRecord(e.rawOutput) ? e.rawOutput : null, t?.output);
  if (n.length > 0) return n;
  let r = Array.isArray(e.content)
      ? e.content.map((e) => parseDiffContent(e)).filter((e) => e !== null && typeof e.path == `string`)
      : [],
    { directChanges: i, rawInputChanges: a, rawOutputChanges: o } = extractChangeMaps(e),
    s = new Set<string>();
  for (let e of r) e.path && s.add(e.path);
  if (i) for (let e of Object.keys(i)) s.add(e);
  if (a) for (let e of Object.keys(a)) s.add(e);
  if (o) for (let e of Object.keys(o)) s.add(e);
  let c = [];
  for (let e of s) {
    let t = r.find((t) => t.path === e),
      n = o?.[e] ?? a?.[e] ?? i?.[e],
      s = isPlainRecord(n) && typeof n.type == `string` ? n.type : void 0,
      l = s === `add` ? `write` : s === `update` ? `update` : s === `delete` ? `delete` : `edit`,
      u = s === `add` ? `Created` : s === `delete` ? `Deleted` : `Edited`,
      d =
        t?.oldText ??
        (isPlainRecord(n)
          ? firstStringField(n, [`oldText`, `old_string`, `oldString`, `before`, `old_content`, `oldContent`])
          : void 0),
      f =
        t?.newText ??
        (isPlainRecord(n)
          ? firstStringField(n, [
              `newText`,
              `new_string`,
              `newString`,
              `after`,
              `new_content`,
              `newContent`,
              `content`,
            ])
          : void 0),
      p = resolveFileDisplayInfo(e),
      m;
    d !== void 0 && f !== void 0
      ? (m = countLineDiffChanges(d, f))
      : s === `add` && f !== void 0
        ? (m = countLineDiffChanges(null, f))
        : s === `delete` && d !== void 0 && (m = countLineDiffChanges(d, ``));
    let h =
      normalizeDiffText(extractRawDiffText(n), baseName(e)) ?? (d !== void 0 || f !== void 0 ? buildUnifiedDiffText(d ?? ``, f ?? ``, baseName(e)) : null);
    c.push({
      path: e,
      actionLabel: u,
      operationKind: l,
      fileName: p.fileName,
      filePath: p.filePath,
      fileIconSrc: p.fileIconSrc,
      changeStat: m,
      patch: h,
    });
  }
  return c.length > 0 ? c : summarizeToolCallFiles(t);
}

export {
  classifyToolCall, extractRawFileSummaries, buildUnifiedDiffText,
  toolContentFamilyOf, toolEditFamilyOf, parseToolRawPayload, extractBeforeAfterEdit, // 〔A1-P1-B19〕PreviewCards 余件 4 declare 收敛导出（cg/sg/Bh/Rh）
};
