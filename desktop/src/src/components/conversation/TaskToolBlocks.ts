// A1-P1-B13：Task 工具视图族逐字重建（styles js 107995–108075 + 108606–108721 + 108722–108884，共 360 行，69 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；编排方 B13 四族收割，B12 钥匙 sQ/lQ 已开）。
// 消费面 = ConversationToolViews.tsx Task 十 declare + 手写 TaskOutput/TaskControl 双视图（约 164 行）→ 墓碑 + 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p13/TaskToolBlocks.seam-log.txt，均带〔A1-P1-B13〕。
// 区段切分墓碑：左界 N$@107995（eht 右界邻接）；nht@108076（RespondToCoordinator 族）/ oht@108147（SendMessage 族）/
//   dht@108310（Skill 族）/ hht@108469（switch-mode 族）为段间界；右界 Oht@108885（Todo 族）。
// F$ 跨族共享披露：normalizeTaskOutputRaw 同被 RespondToCoordinator（aht）/SendMessage（uht）族消费——
//   该二族留批，届时经本叶 import 收敛（界障证据见 A1-P1-B13.report.md §七）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   kye→IconFileOutput（lucide-react FileOutput；原 styles 27096 vendored Sa('file-output')；A0-S3b 判例）
//   R_→IconCircleStop（lucide-react CircleStop；原 styles 26912 vendored Sa('circle-stop')；A0-S3b 判例）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【Task 显示载荷归一域 107995–108075】
//   N$→isRecordObject（107995）| P$→stringFieldOrNull（107998）| tht→normalizeTaskDisplayEntry（108002）| F$→normalizeTaskOutputRaw（108064）
//   【TaskOutput 工具视图族 108606–108721】
//   _ht→TASK_OUTPUT_ICON（108606）| vht→parseRecordJson（108607）| yht→extractTaskOutputInputId（108617）
//   bht→isTaskRuntimeFailed（108621）| xht→isTaskRuntimeStopped（108625）| Sht→TaskOutputToolView（108629）
//   【TaskControl 工具视图族 108722–108884】
//   Cht→TASK_CONTROL_ICON（108722 链）| wht→HOOK_ADDITIONAL_CONTEXT_MARKER（链）| H$→nestedRecord（108726）
//   U$→stringField（108738）| Tht→nestedStringField（108744）| Eht→resolveStopResultText（108752）
//   W$→DetailRow（108759）| Dht→TaskControlToolView（108776）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { FileOutput as IconFileOutput } from 'lucide-react'; // 原 kye（styles 27096 vendored Sa('file-output')；A0-S3b 判例）
import { CircleStop as IconCircleStop } from 'lucide-react'; // 原 R_（styles 26912 vendored Sa('circle-stop')；A0-S3b 判例）

/* ── Task 显示载荷归一域（styles 107995–108075） ── */
function isRecordObject(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function stringFieldOrNull(e: any, t: any) {
  let n = e[t];
  if (n !== void 0) return typeof n == `string` && n.trim().length > 0 ? n : null;
}
function normalizeTaskDisplayEntry(e: any): any {
  if (isRecordObject(e)) {
    if (e.kind === `local_agent_message`) {
      if (e.status !== `success` && e.status !== `failed`) return;
      let t = stringFieldOrNull(e, `error`),
        n = stringFieldOrNull(e, `message`);
      return t === null || n === null
        ? void 0
        : {
            kind: `local_agent_message`,
            status: e.status,
            ...(t === void 0 ? {} : { error: t }),
            ...(n === void 0 ? {} : { message: n }),
          };
    }
    if (e.kind === `task_stop`) {
      let t = stringFieldOrNull(e, `taskId`),
        n = stringFieldOrNull(e, `taskType`),
        r = stringFieldOrNull(e, `command`),
        i = stringFieldOrNull(e, `message`),
        a = e.truncated;
      return !t || !n || r === null || !i || (a !== void 0 && typeof a != `boolean`)
        ? void 0
        : {
            kind: `task_stop`,
            taskId: t,
            taskType: n,
            ...(r === void 0 ? {} : { command: r }),
            message: i,
            ...(a === void 0 ? {} : { truncated: a }),
          };
    }
    if (e.kind === `task_output`) {
      if (
        e.retrievalStatus !== `success` &&
        e.retrievalStatus !== `not_ready` &&
        e.retrievalStatus !== `timeout`
      )
        return;
      let t = stringFieldOrNull(e, `taskStatus`),
        n = stringFieldOrNull(e, `output`),
        r = e.truncated;
      return t === null ||
        (t !== void 0 && t.length > 64) ||
        n === null ||
        (n !== void 0 && n.length > 2e3) ||
        (r !== void 0 && r !== !0)
        ? void 0
        : {
            kind: `task_output`,
            retrievalStatus: e.retrievalStatus,
            ...(t === void 0 ? {} : { taskStatus: t }),
            ...(n === void 0 ? {} : { output: n }),
            ...(r === !0 ? { truncated: !0 } : {}),
          };
    }
    if (e.kind === `respond_to_coordinator`)
      return e.status !== `success` && e.status !== `failed`
        ? void 0
        : { kind: `respond_to_coordinator`, status: e.status };
  }
}
function normalizeTaskOutputRaw(e: any) {
  if (!isRecordObject(e)) return;
  let t = isRecordObject(e.result) ? e.result : void 0,
    n = isRecordObject(e.metadata) ? e.metadata : void 0,
    r = isRecordObject(e.rawOutput) ? e.rawOutput : void 0,
    i = isRecordObject(e.output) ? e.output : void 0,
    a = [t?.display, e.display, n?.display, r?.display, i?.display];
  for (let e of a) {
    let t = normalizeTaskDisplayEntry(e);
    if (t) return t;
  }
}

/* ── TaskOutput 工具视图族（styles 108606–108721） ── */
var TASK_OUTPUT_ICON = (0, $.jsx)(IconFileOutput, { className: `size-4 shrink-0 text-foreground-subtle` });
function parseRecordJson(e: any) {
  if (typeof e == `object` && e && !Array.isArray(e)) return e;
  if (!(typeof e != `string` || e.trim().length === 0))
    try {
      let t = JSON.parse(e);
      return typeof t == `object` && t && !Array.isArray(t) ? t : void 0;
    } catch {
      return;
    }
}
function extractTaskOutputInputId(e: any) {
  let t = parseRecordJson(e)?.task_id;
  return typeof t == `string` && t.trim().length > 0 ? t : void 0;
}
function isTaskRuntimeFailed(e: any) {
  let t = e?.trim().toLowerCase();
  return t === `failed` || t === `lost`;
}
function isTaskRuntimeStopped(e: any) {
  let t = e?.trim().toLowerCase();
  return t === `cancelled` || t === `killed` || t === `stopped`;
}
function TaskOutputToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = normalizeTaskOutputRaw(n.raw),
    i = r?.kind === `task_output` ? r : void 0,
    a = extractTaskOutputInputId(n.input),
    o = i?.taskStatus,
    s = o?.trim().toLowerCase(),
    c = n.status === `denied`,
    l = n.status === `stopped`,
    u = n.status === `failed`,
    d = isTaskRuntimeFailed(o),
    f = !c && !l && (u || d),
    p = i?.output,
    m = p !== void 0,
    h;
  h = u
    ? t.formatMessage({ id: `chat.toolCall.taskOutput.failed` })
    : c
      ? t.formatMessage({ id: `chat.toolCall.taskOutput.denied` })
      : l
        ? t.formatMessage({ id: `chat.toolCall.taskOutput.stopped` })
        : e.isRunning
          ? t.formatMessage({ id: `chat.toolCall.taskOutput.fetching` })
          : i?.retrievalStatus === `not_ready`
            ? t.formatMessage({ id: `chat.toolCall.taskOutput.running` })
            : i?.retrievalStatus === `timeout`
              ? t.formatMessage({ id: `chat.toolCall.taskOutput.timeout` })
              : d
                ? t.formatMessage({ id: `chat.toolCall.taskOutput.taskFailed` })
                : isTaskRuntimeStopped(o)
                  ? t.formatMessage({ id: `chat.toolCall.taskOutput.taskStopped` })
                  : s === `pending` || s === `running`
                    ? t.formatMessage({ id: `chat.toolCall.taskOutput.running` })
                    : s && s !== `completed`
                      ? (o ?? s)
                      : i?.retrievalStatus === `success`
                        ? t.formatMessage({ id: `chat.toolCall.taskOutput.retrieved` })
                        : t.formatMessage({ id: `chat.toolCall.taskOutput.completed` });
  let g = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`code`, {
          className: `min-w-0 truncate font-mono`,
          children: a ?? n.title ?? `TaskOutput`,
        }),
      [a, n.title],
    ),
    _ = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `rounded-lg border border-border bg-panel px-4 py-3`,
          children: [
            (0, $.jsx)(`pre`, {
              className: `max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle`,
              children: p,
            }),
            i?.truncated === !0
              ? (0, $.jsx)(`p`, {
                  className: `mt-3 text-ui-xs text-foreground-subtle`,
                  children: t.formatMessage({ id: `chat.toolCall.taskOutput.truncated` }),
                })
              : null,
          ],
        }),
      [t, p, i?.truncated],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: TASK_OUTPUT_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: m && (e.canToggle ?? !0),
        forceOpen: m && (e.forceOpen ?? !1),
        kindLabel: h,
        sourceLabel: e.sourceLabel,
        primaryText: g,
        statusLabel: f ? t.formatMessage({ id: `chat.toolCall.status.failed` }) : void 0,
        statusTooltip: u ? e.errorText : void 0,
        showFailureStatus: f,
        isRunning: e.isRunning,
        title: n.title,
        renderContent: m ? _ : void 0,
      }),
      (0, $.jsx)(ToolSnapshotRefs, {
        refs: n.snapshotRefs ?? [],
        onLoadFullToolCallFields: e.onLoadFullToolCallFields
          ? () => e.onLoadFullToolCallFields?.(n.toolId)
          : void 0,
      }),
    ],
  });
}

/* ── TaskControl 工具视图族（styles 108722–108884） ── */
var TASK_CONTROL_ICON = (0, $.jsx)(IconCircleStop, { className: `size-4 shrink-0 text-foreground-subtle` }),
  HOOK_ADDITIONAL_CONTEXT_MARKER = `

[Hook additional context]`;
function nestedRecord(e: any) {
  if (typeof e == `object` && e && !Array.isArray(e)) return e;
  if (typeof e != `string` || e.trim().length === 0) return;
  let t = e.indexOf(HOOK_ADDITIONAL_CONTEXT_MARKER),
    n = t >= 0 ? e.slice(0, t) : e;
  try {
    let e = JSON.parse(n);
    return typeof e == `object` && e && !Array.isArray(e) ? e : void 0;
  } catch {
    return;
  }
}
function stringField(e: any, t: any) {
  for (let n of t) {
    let t = e?.[n];
    if (typeof t == `string` && t.trim().length > 0) return t;
  }
}
function nestedStringField(e: any, t: any) {
  let n = nestedRecord(e);
  if (n)
    for (let e of t) {
      let t = nestedRecord(n[e]);
      if (t) return t;
    }
}
function resolveStopResultText(e: any, t: any, n: any) {
  return !e || !t || n === void 0
    ? e
    : e === `Successfully stopped task: ${t} (${n})`
      ? `Successfully stopped task: ${t}`
      : e;
}
function DetailRow({ label: e, value: t, mono: n = !1 }: any) {
  return (0, $.jsxs)(`div`, {
    className: `space-y-1`,
    children: [
      (0, $.jsx)(`dt`, {
        className: `text-ui-base font-medium text-foreground-subtle`,
        children: e,
      }),
      (0, $.jsx)(`dd`, {
        className: n
          ? `whitespace-pre-wrap break-words font-mono text-ui-base text-foreground`
          : `whitespace-pre-wrap break-words text-ui-base leading-5 text-foreground`,
        children: t,
      }),
    ],
  });
}
function TaskControlToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = normalizeTaskOutputRaw(n.raw),
    i = r?.kind === `task_stop` ? r : void 0,
    a = nestedRecord(n.input) ?? nestedStringField(n.raw, [`rawInput`, `input`]),
    o = nestedRecord(n.output) ?? nestedStringField(n.raw, [`rawOutput`, `output`]),
    s = i?.taskId ?? stringField(o, [`task_id`]) ?? stringField(a, [`task_id`, `shell_id`]),
    c = i?.taskType ?? stringField(o, [`task_type`]),
    l = i?.command,
    u = stringField(o, [`command`]),
    d = c === `local_agent`,
    f = d ? l : (l ?? u),
    p = l ?? u,
    m = i?.message ?? stringField(o, [`message`]),
    h = i?.truncated === !0,
    g = n.status === `denied`,
    _ = n.status === `stopped`,
    v = n.status === `failed`,
    y = v || g || _ ? (e.errorText ?? m) : resolveStopResultText(m, s, p),
    b = !!(c || f || y || h),
    x = e.isRunning
      ? `chat.toolCall.taskStop.stopping`
      : v
        ? `chat.toolCall.taskStop.failed`
        : g
          ? `chat.toolCall.taskStop.denied`
          : _
            ? `chat.toolCall.taskStop.cancelled`
            : `chat.toolCall.taskStop.stopped`,
    S = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`code`, {
          className: `min-w-0 truncate font-mono`,
          children: s ?? n.title ?? `TaskStop`,
        }),
      [s, n.title],
    ),
    C = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `rounded-lg border border-border bg-panel px-4 py-3`,
          children: [
            (0, $.jsxs)(`dl`, {
              className: `space-y-3`,
              children: [
                c
                  ? (0, $.jsx)(DetailRow, {
                      label: t.formatMessage({ id: `chat.toolCall.taskStop.taskType` }),
                      value: c,
                      mono: !0,
                    })
                  : null,
                f
                  ? (0, $.jsx)(DetailRow, {
                      label: t.formatMessage({
                        id: d
                          ? `chat.toolCall.taskStop.description`
                          : `chat.toolCall.taskStop.command`,
                      }),
                      value: f,
                      mono: !d,
                    })
                  : null,
                y
                  ? (0, $.jsx)(DetailRow, {
                      label: t.formatMessage({ id: `chat.toolCall.taskStop.result` }),
                      value: y,
                    })
                  : null,
              ],
            }),
            h
              ? (0, $.jsx)(`p`, {
                  className: `mt-3 text-ui-xs text-foreground-subtle`,
                  children: t.formatMessage({ id: `chat.toolCall.taskStop.truncated` }),
                })
              : null,
          ],
        }),
      [h, t, d, y, f, c],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: TASK_CONTROL_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: b && (e.canToggle ?? !0),
        forceOpen: b && (e.forceOpen ?? !1),
        kindLabel: t.formatMessage({ id: x }),
        sourceLabel: e.sourceLabel,
        primaryText: S,
        statusLabel: v ? t.formatMessage({ id: `chat.toolCall.status.failed` }) : void 0,
        statusTooltip: v ? y : void 0,
        showFailureStatus: v,
        isRunning: e.isRunning,
        title: n.title,
        renderContent: b ? C : void 0,
      }),
      (0, $.jsx)(ToolSnapshotRefs, {
        refs: n.snapshotRefs ?? [],
        onLoadFullToolCallFields: e.onLoadFullToolCallFields
          ? () => e.onLoadFullToolCallFields?.(n.toolId)
          : void 0,
      }),
    ],
  });
}

export { isRecordObject, stringFieldOrNull, normalizeTaskDisplayEntry, normalizeTaskOutputRaw, TASK_OUTPUT_ICON, parseRecordJson, extractTaskOutputInputId, isTaskRuntimeFailed, isTaskRuntimeStopped, TaskOutputToolView, TASK_CONTROL_ICON, HOOK_ADDITIONAL_CONTEXT_MARKER, nestedRecord, stringField, nestedStringField, resolveStopResultText, DetailRow, TaskControlToolView };
