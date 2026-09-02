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
//   【工具行归一域 110168–110239】〔A1-R96〕
//   r_t→V4_TOOL_STATUS_MAP（110168）| i_t→isEmptyPlainRecord（110176）| a_t→resolveToolCallInputPreview（110179）
//   l1→trimmedErrorFieldOrUndefined（110194）| o_t→resolveToolCallErrorText（110199）| u1→normalizeToolCallNode（110206）
//   fne→parseToolCallInput（SrcSharedB，styles 744 导入 `p as fne`）| nQ→unwrapToolUseError（本叶既有）
/* eslint-disable */
import { parseToolCallInput } from '../../modules/SrcSharedB'; // 原 fne（styles 744 `p as fne` ← src-HCld2afU 导出 p = parseToolCallInput；SrcSharedB VS@5864）〔A1-R96〕

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

/* ── 工具行归一域（styles 110168–110239；A1-R96 段吸收：Conversation §5.10 + AutomationCards 消费） ── */
/* ── 原 r_t（js 110168–110175）→ V4_TOOL_STATUS_MAP：v4 状态 → 工具状态映射〔A1-R96〕 ── */
var V4_TOOL_STATUS_MAP: Record<string, string> = { // 〔A1-R96〕索引面型缝（r_t[e.status] any 索引）
  inputStreaming: `pending`,
  pendingApproval: `pending`,
  running: `in_progress`,
  success: `completed`,
  error: `failed`,
  cancelled: `stopped`,
};
/* ── 原 i_t（js 110176–110178）→ isEmptyPlainRecord：空对象判定〔A1-R96〕 ── */
function isEmptyPlainRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e) && Object.keys(e).length === 0;
}
/* ── 原 a_t（js 110179–110193）→ resolveToolCallInputPreview：输入预览解析（input 直取 / inputText 流式解析）〔A1-R96〕 ── */
function resolveToolCallInputPreview(e: any): any { // 〔A1-R96〕返回面型缝（{input: void 0} 分支与完全面联合，消费面 r.input/inputPreviewComplete/streamingRawInputLength 投射）
  if (e.input !== void 0)
    return {
      input: e.input,
      inputPreviewComplete: !0,
      ...(e.inputText.length > 0 ? { streamingRawInputLength: e.inputText.length } : {}),
    };
  if (!e.inputText) return { input: void 0 };
  let t = parseToolCallInput(e.inputText);
  return {
    input: isEmptyPlainRecord(t.input) ? void 0 : t.input,
    inputPreviewComplete: t.complete,
    streamingRawInputLength: e.inputText.length,
  };
}
/* ── 原 l1（js 110194–110198）→ trimmedErrorFieldOrUndefined：非空修剪串取值（体同 eQ@99567，束独立定义按符号各保）〔A1-R96〕 ── */
function trimmedErrorFieldOrUndefined(e: any) {
  if (typeof e != `string`) return;
  let t = e.trim();
  return t.length > 0 ? t : void 0;
}
/* ── 原 o_t（js 110199–110205）→ resolveToolCallErrorText：error 态错误文案解析（message → output.text 解包 → code）〔A1-R96〕 ── */
function resolveToolCallErrorText(e: any) {
  if (e.status !== `error`) return;
  let t = trimmedErrorFieldOrUndefined(e.error?.message);
  if (t) return t;
  let n = trimmedErrorFieldOrUndefined(e.output?.text);
  return n ? unwrapToolUseError(n) : trimmedErrorFieldOrUndefined(e.error?.code);
}
/* ── 原 u1（js 110206–110239）→ normalizeToolCallNode：行模型 → ToolCallNode 归一（raw 投影 + Agent/Task content 透传）〔A1-R96〕 ── */
function normalizeToolCallNode(e: any) {
  let t = V4_TOOL_STATUS_MAP[e.status],
    n = resolveToolCallErrorText(e),
    r = resolveToolCallInputPreview(e),
    i = e.display;
  return {
    toolCall: {
      toolId: e.toolCallId,
      toolName: e.toolName,
      kind: e.toolName,
      input: r.input,
      status: t,
      output: e.output?.text,
      ...((e.toolName === `Agent` || e.toolName === `Task`) && e.output?.text
        ? { content: e.output.text }
        : {}),
      error: n,
      raw: {
        error: e.error,
        rawOutput: e.output?.text,
        outputTruncated: e.output?.truncated,
        status: t,
        toolCallId: e.toolCallId,
        toolName: e.toolName,
        v4Status: e.status,
        ...(i ? { display: i } : {}),
        inputPreviewComplete: r.inputPreviewComplete,
        streamingRawInputLength: r.streamingRawInputLength,
      },
      startedAt: typeof e.startedAt == `number` ? e.startedAt : void 0,
    },
    childToolCalls: [],
  };
}

export {
  TOOL_STATUS_DISPLAY_MAP, normalizeToolCallStatus, isPlainRecordValue, trimmedStringOrUndefined, firstTrimmedFieldOf, stripCodeFenceBlock,
  unwrapToolUseError, extractToolUseErrorText, extractToolErrorText, resolveInlinePreview,
  isPlainRecord, parseToolCallRaw,
  V4_TOOL_STATUS_MAP, isEmptyPlainRecord, resolveToolCallInputPreview, trimmedErrorFieldOrUndefined, resolveToolCallErrorText, normalizeToolCallNode, // 〔A1-R96〕工具行归一域（r_t/i_t/a_t/l1/o_t/u1）
};
