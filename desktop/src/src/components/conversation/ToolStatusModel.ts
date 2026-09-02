// A1-P1-B11：工具状态/错误文案/内联预览域逐字重建（styles js 99553–99618 + 99630–99640，共 77 行，30 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx TOOL_STATUS_DISPLAY_MAP declare + 三处
//   截断手写本地（unwrapToolUseError/extractToolErrorText/resolveInlinePreview）→ 真实 import 收敛（rQ 真身补全）。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/ToolStatusModel.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：Llt@99534（加载 spinner 组件）在界外；Hlt/Ult@99619/99621（Ko/Jo 路径域未实体化）与
//   Wlt@99641（展示模型策略表，cg/sg 未实体化）为两段界障。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【状态/错误文案域 99553–99618】
//   Rlt→TOOL_STATUS_DISPLAY_MAP（99553）| zlt→normalizeToolCallStatus（99561）| $Z→isPlainRecordValue（99564）
//   eQ→trimmedStringOrUndefined（99567）| tQ→firstTrimmedFieldOf（99572）| Blt→stripCodeFenceBlock（99578）
//   nQ→unwrapToolUseError（99582）| Vlt→extractToolUseErrorText（99586）| rQ→extractToolErrorText（99590）
//   【内联预览判定 99630–99640】
//   iQ→resolveInlinePreview（99630）
//   【工具调用 raw 载荷域 23390–23429】
//   pg→isPlainRecord（23390）| hg→parseToolCallRaw（23421）
/* eslint-disable */

/* ── 工具状态/错误文案域（styles 99553–99618） ── */
var TOOL_STATUS_DISPLAY_MAP: Record<string, string> = {
  pending: `input-streaming`,
  in_progress: `input-available`,
  completed: `output-available`,
  failed: `output-error`,
  stopped: `output-error`,
  denied: `output-denied`,
};
function normalizeToolCallStatus(e: any) {
  return TOOL_STATUS_DISPLAY_MAP[e] ?? `input-streaming`;
}
function isPlainRecordValue(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function trimmedStringOrUndefined(e: any) {
  if (typeof e != `string`) return;
  let t = e.trim();
  return t.length > 0 ? t : void 0;
}
function firstTrimmedFieldOf(e: any, t: any) {
  for (let n of t) {
    let t = trimmedStringOrUndefined(e[n]);
    if (t) return t;
  }
}
function stripCodeFenceBlock(e: any) {
  let t = e.trim();
  return t.match(/^```[\w-]*\n?([\s\S]*?)\n?```$/)?.[1]?.trim() ?? t;
}
function unwrapToolUseError(e: any) {
  let t = stripCodeFenceBlock(e);
  return t.match(/^<tool_use_error>([\s\S]*?)<\/tool_use_error>$/i)?.[1]?.trim() || t;
}
function extractToolUseErrorText(e: any) {
  let t = trimmedStringOrUndefined(e);
  if (!(!t || !/<tool_use_error>[\s\S]*<\/tool_use_error>/i.test(t))) return unwrapToolUseError(t);
}
function extractToolErrorText(e: any) {
  let t = trimmedStringOrUndefined(e.error);
  if (t) return t;
  if (isPlainRecordValue(e.output)) {
    let t = firstTrimmedFieldOf(e.output, [`error`, `message`]);
    if (t) return t;
  }
  let n = extractToolUseErrorText(e.output);
  if (n) return n;
  if (!isPlainRecordValue(e.raw)) return;
  let r = isPlainRecordValue(e.raw.rawOutput) ? e.raw.rawOutput : null,
    i = r ? firstTrimmedFieldOf(r, [`error`, `message`]) : void 0;
  if (i) return i;
  let a = trimmedStringOrUndefined(e.raw.status),
    o = extractToolUseErrorText(e.raw.rawOutput);
  if (o) return o;
  if (a === `failed`) {
    let t = trimmedStringOrUndefined(e.raw.rawOutput);
    if (t) return unwrapToolUseError(t);
  }
  if (e.status === `failed` || a === `failed`) {
    let t = Array.isArray(e.raw.content) ? e.raw.content : [];
    for (let e of t) {
      if (!isPlainRecordValue(e)) continue;
      let t = firstTrimmedFieldOf((isPlainRecordValue(e.content) ? e.content : null) || e, [`error`, `message`, `text`]);
      if (t) return unwrapToolUseError(t);
    }
  }
}

/* ── 内联预览判定（styles 99630–99640） ── */
function resolveInlinePreview(e: any, t: any) {
  return t && e.preview?.type === `patch`
    ? { type: `patch`, source: e.preview }
    : e.preview?.type === `image`
      ? { type: `image`, source: e.preview }
      : e.preview?.type === `text`
        ? { type: `text`, source: e.preview }
        : e.contentPreview
          ? { type: `text`, source: e.contentPreview }
          : { type: `none` };
}

/* ── 工具调用 raw 载荷域（styles 23390–23429） ── */
/** 原 pg（js 23390）：普通对象判定〔体同 $Z@99564 isPlainRecordValue / og 域 tg@23030，束为三处独立定义，按符号各保〕 */
function isPlainRecord(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
/** 原 hg（js 23421）：工具调用 raw 载荷解析（rawInput 优先，input 次之）〔A1-R61 逐字；返回面 cast 缝 = declare 面 Record<string, unknown> | null 维持〕 */
function parseToolCallRaw(e: unknown): Record<string, unknown> | null {
  return isPlainRecord(e)
    ? `rawInput` in e && e.rawInput !== void 0
      ? (e.rawInput as Record<string, unknown>)
      : `input` in e
        ? (e.input as Record<string, unknown>)
        : null
    : null;
}

export {
  TOOL_STATUS_DISPLAY_MAP, normalizeToolCallStatus, isPlainRecordValue, trimmedStringOrUndefined, firstTrimmedFieldOf, stripCodeFenceBlock,
  unwrapToolUseError, extractToolUseErrorText, extractToolErrorText, resolveInlinePreview,
  isPlainRecord, parseToolCallRaw,
};
