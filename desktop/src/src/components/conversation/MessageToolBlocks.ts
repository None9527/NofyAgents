// A1-P1-B14：message 工具视图族逐字重建（styles js 108076–108309，共 234 行，51 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B13 留批第 1 项 RespondToCoordinator/SendMessage 族收割）。
// 消费面 = ToolCallBlock.tsx 417 手写分派（RespondToCoordinator ? SessionContextToolView : FallbackToolView）→
//   束真身 Wht@109114 `message` 分支 `aht : uht` 更正（本批同批改指，B13 留批裁定）。
// 逐字证明：/tmp/a1r0-p1/p14/p14-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p14-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p14/MessageToolBlocks.seam-log.txt，均带〔A1-P1-B14〕。
// 区段切分墓碑：左界 nht@108076（F$ Task 归一域右界 108075 邻接）；右界 dht@108310（Skill 族，B13 叶邻接）。
// F$ 跨族共享收敛披露：normalizeTaskOutputRaw 同被 aht/uht 消费——本批经 ./TaskToolBlocks import 收敛（B13 §七裁定）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   hbe→IconReply（lucide-react Reply；原 styles 27731 vendored Sa('reply')；A0-S3b 判例）
//   ybe→IconSend（lucide-react Send；原 styles 27784 vendored Sa('send')；A0-S3b 判例）
//   F$→normalizeTaskOutputRaw（./TaskToolBlocks，B13；跨族共享符号）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【message 工具视图族 108076–108309】
//   nht→RESPOND_TO_COORDINATOR_ICON（108076）| rht→parseJsonRecordValue（108077）| iht→extractSummaryText（108087）
//   aht→RespondToCoordinatorToolView（108091）| oht→SEND_MESSAGE_ICON（108147）| I$→parseJsonObjectValue（108148）
//   L$→firstNonEmptyFieldText（108158）| sht→firstNestedRecordValue（108164）| cht→nonEmptyTrimmedText（108172）
//   lht→extractResultContentValue（108175）| R$→MessageDetailRow（108178）| uht→SendMessageToolView（108195）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { Reply as IconReply } from 'lucide-react'; // 原 hbe（styles 27731 vendored Sa('reply')；A0-S3b 判例）
import { Send as IconSend } from 'lucide-react'; // 原 ybe（styles 27784 vendored Sa('send')；A0-S3b 判例）
import { normalizeTaskOutputRaw } from './TaskToolBlocks'; // 原 F$（B13；跨族共享符号收敛）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）

/* ── message 工具视图族（styles 108076–108309） ── */
var RESPOND_TO_COORDINATOR_ICON = (0, $.jsx)(IconReply, { className: `size-4 shrink-0 text-foreground-subtle` });
function parseJsonRecordValue(e: any) {
  if (typeof e == `object` && e && !Array.isArray(e)) return e;
  if (!(typeof e != `string` || e.trim().length === 0))
    try {
      let t = JSON.parse(e);
      return typeof t == `object` && t && !Array.isArray(t) ? t : void 0;
    } catch {
      return;
    }
}
function extractSummaryText(e: any) {
  let t = parseJsonRecordValue(e)?.summary;
  return typeof t == `string` && t.trim().length > 0 ? t : void 0;
}
function RespondToCoordinatorToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = normalizeTaskOutputRaw(n.raw),
    i = r?.kind === `respond_to_coordinator` ? r : void 0,
    a = extractSummaryText(n.input),
    o = n.status === `denied`,
    s = n.status === `stopped`,
    c = n.status === `failed`,
    l = !o && !s && (c || i?.status === `failed`),
    u = c
      ? `chat.toolCall.respondToCoordinator.failed`
      : o
        ? `chat.toolCall.respondToCoordinator.denied`
        : s
          ? `chat.toolCall.respondToCoordinator.stopped`
          : e.isRunning
            ? `chat.toolCall.respondToCoordinator.replying`
            : i?.status === `failed`
              ? `chat.toolCall.respondToCoordinator.failed`
              : i?.status === `success`
                ? `chat.toolCall.respondToCoordinator.queued`
                : `chat.toolCall.respondToCoordinator.completed`,
    d = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`span`, {
          className: `min-w-0 truncate`,
          children: a ?? n.title ?? `RespondToCoordinator`,
        }),
      [a, n.title],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: RESPOND_TO_COORDINATOR_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: !1,
        kindLabel: t.formatMessage({ id: u }),
        sourceLabel: e.sourceLabel,
        primaryText: d,
        statusLabel: l ? t.formatMessage({ id: `chat.toolCall.status.failed` }) : void 0,
        statusTooltip: c ? e.errorText : void 0,
        showFailureStatus: l,
        isRunning: e.isRunning,
        title: n.title,
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
var SEND_MESSAGE_ICON = (0, $.jsx)(IconSend, { className: `size-4 shrink-0 text-foreground-subtle` });
function parseJsonObjectValue(e: any) {
  if (typeof e == `object` && e && !Array.isArray(e)) return e;
  if (!(typeof e != `string` || e.trim().length === 0))
    try {
      let t = JSON.parse(e);
      return typeof t == `object` && t && !Array.isArray(t) ? t : void 0;
    } catch {
      return;
    }
}
function firstNonEmptyFieldText(e: any, t: any) {
  for (let n of t) {
    let t = e?.[n];
    if (typeof t == `string` && t.trim().length > 0) return t;
  }
}
function firstNestedRecordValue(e: any, t: any) {
  let n = parseJsonObjectValue(e);
  if (n)
    for (let e of t) {
      let t = parseJsonObjectValue(n[e]);
      if (t) return t;
    }
}
function nonEmptyTrimmedText(e: any) {
  return typeof e == `string` && e.trim().length > 0 ? e : void 0;
}
function extractResultContentValue(e: any) {
  return parseJsonObjectValue(parseJsonObjectValue(e)?.result)?.content;
}
function MessageDetailRow({ label: e, value: t, mono: n = !1 }: any) {
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
function SendMessageToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = normalizeTaskOutputRaw(n.raw),
    i = r?.kind === `local_agent_message` ? r : void 0,
    a = parseJsonObjectValue(n.input) ?? firstNestedRecordValue(n.raw, [`rawInput`, `input`]),
    o = parseJsonObjectValue(n.output),
    s = extractResultContentValue(n.raw),
    c = parseJsonObjectValue(s),
    l = o ?? firstNestedRecordValue(n.raw, [`rawOutput`, `output`]) ?? c,
    u = (o ? void 0 : nonEmptyTrimmedText(n.output)) ?? (c ? void 0 : nonEmptyTrimmedText(s)),
    d = firstNonEmptyFieldText(a, [`summary`]),
    f = firstNonEmptyFieldText(a, [`to`]),
    p = firstNonEmptyFieldText(a, [`message`]),
    m = !!(f || d || p),
    h = firstNonEmptyFieldText(l, [`message`]),
    g = firstNonEmptyFieldText(l, [`error`]),
    _ = firstNonEmptyFieldText(l, [`status`]),
    v = n.status === `denied`,
    y = n.status === `stopped`,
    b = !v && !y && (n.status === `failed` || i?.status === `failed` || _ === `failed`),
    x = b ? (e.errorText ?? i?.error ?? i?.message ?? g ?? h ?? u) : void 0,
    S = e.isRunning
      ? `chat.toolCall.sendMessage.sending`
      : b
        ? `chat.toolCall.sendMessage.failed`
        : v
          ? `chat.toolCall.sendMessage.denied`
          : y
            ? `chat.toolCall.sendMessage.stopped`
            : `chat.toolCall.sendMessage.sent`,
    C = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`span`, {
          className: `min-w-0 truncate`,
          children: d ?? n.title ?? `SendMessage`,
        }),
      [d, n.title],
    ),
    w = (0, React.useMemo)(
      () =>
        f
          ? (0, $.jsxs)(`span`, {
              className: `inline-flex min-w-0 items-center gap-1`,
              children: [
                (0, $.jsx)(`span`, {
                  className: `shrink-0`,
                  children: t.formatMessage({ id: `chat.toolCall.sendMessage.to` }),
                }),
                (0, $.jsx)(`code`, { className: `min-w-0 truncate font-mono`, children: f }),
              ],
            })
          : void 0,
      [t, f],
    ),
    T = (0, React.useCallback)(
      () =>
        (0, $.jsx)(`div`, {
          className: `rounded-lg border border-border bg-panel px-4 py-3`,
          children: (0, $.jsxs)(`dl`, {
            className: `space-y-3`,
            children: [
              f
                ? (0, $.jsx)(MessageDetailRow, {
                    label: t.formatMessage({ id: `chat.toolCall.sendMessage.target` }),
                    value: f,
                    mono: !0,
                  })
                : null,
              d
                ? (0, $.jsx)(MessageDetailRow, {
                    label: t.formatMessage({ id: `chat.toolCall.sendMessage.summary` }),
                    value: d,
                  })
                : null,
              p
                ? (0, $.jsx)(MessageDetailRow, {
                    label: t.formatMessage({ id: `chat.toolCall.sendMessage.message` }),
                    value: p,
                  })
                : null,
            ],
          }),
        }),
      [t, p, d, f],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: SEND_MESSAGE_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: m && (e.canToggle ?? !0),
        forceOpen: m && (e.forceOpen ?? !1),
        hideSecondaryTextWhenOpen: !0,
        kindLabel: t.formatMessage({ id: S }),
        sourceLabel: e.sourceLabel,
        primaryText: C,
        secondaryText: w,
        statusLabel: b ? t.formatMessage({ id: `chat.toolCall.status.failed` }) : void 0,
        statusTooltip: b ? x : void 0,
        showFailureStatus: b,
        isRunning: e.isRunning,
        title: n.title,
        renderContent: m ? T : void 0,
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

export { RESPOND_TO_COORDINATOR_ICON, parseJsonRecordValue, extractSummaryText, RespondToCoordinatorToolView, SEND_MESSAGE_ICON, parseJsonObjectValue, firstNonEmptyFieldText, firstNestedRecordValue, nonEmptyTrimmedText, extractResultContentValue, MessageDetailRow, SendMessageToolView };
