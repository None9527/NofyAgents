// A1-P1-B13：Skill 工具视图族逐字重建（styles js 108310–108468，共 159 行，30 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；编排方 B13 四族收割，B12 钥匙 sQ/lQ 已开）。
// 消费面 = ConversationToolViews.tsx Skill 五 declare + 手写 SkillToolView（约 86 行）→ 墓碑 + 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p13/p13-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p13-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p13/SkillToolBlocks.seam-log.txt，均带〔A1-P1-B13〕。
// 区段切分墓碑：dht 图标 var@108310 为左界（Yv=Sa('wand-sparkles')@28014）；hht@108469（switch-mode 族）为右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   Yv→IconWandSparkles（lucide-react WandSparkles；原 styles 28014 vendored Sa('wand-sparkles')；A0-S3b 判例）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【Skill 工具视图族 108310–108468】
//   dht→SKILL_TOOL_ICON（108310）| z$→isRawRecord（108311）| B$→trimmedStringField（108314）
//   fht→extractSkillName（108322）| pht→extractSkillArgs（108328）| V$→extractOutputText（108335）
//   mht→SkillToolView（108357）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { WandSparkles as IconWandSparkles } from 'lucide-react'; // 原 Yv（styles 28014 vendored Sa('wand-sparkles')；A0-S3b 判例）

/* ── Skill 工具视图族（styles 108310–108468） ── */
var SKILL_TOOL_ICON = (0, $.jsx)(IconWandSparkles, { className: `size-4 shrink-0 text-foreground-subtle` });
function isRawRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function trimmedStringField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t != `string`) continue;
    let r = t.trim();
    if (r.length > 0) return r;
  }
}
function extractSkillName(e: any) {
  if (isRawRecord(e.input)) {
    let t = trimmedStringField(e.input, [`skill`, `name`]);
    if (t) return t;
  }
}
function extractSkillArgs(e: any) {
  if (typeof e.input == `string`) {
    let t = e.input.trim();
    return t.length > 0 ? t : void 0;
  }
  if (isRawRecord(e.input)) return trimmedStringField(e.input, [`args`, `arg`, `path`, `prompt`, `input`]);
}
function extractOutputText(e: any): any {
  if (e == null) return null;
  if (typeof e == `string`) {
    let t = e.trim();
    return t.length > 0 ? t : null;
  }
  if (Array.isArray(e)) {
    let t = e.map((e: any) => extractOutputText(e)).filter((e: any) => e != null).join(`
`);
    return t.length > 0 ? t : null;
  }
  if (!isRawRecord(e)) return null;
  let t = trimmedStringField(e, [`output`, `text`, `content`, `message`, `rawOutput`, `result`]);
  if (t) return t;
  if (Array.isArray(e.content)) {
    let t = e.content.map((e: any) => (isRawRecord(e) ? extractOutputText(e.content ?? e) : extractOutputText(e))).filter((e: any) => e != null)
      .join(`
`);
    return t.length > 0 ? t : null;
  }
  return null;
}
function SkillToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = extractSkillName(n),
    i = extractSkillArgs(n),
    a = extractOutputText(n.output),
    o = isRawRecord(n.raw) ? extractOutputText(n.raw.rawOutput) : null,
    s = n.status === `failed` ? (e.errorText ?? a ?? o ?? void 0) : (a ?? o ?? void 0),
    c = t.formatMessage({ id: `chat.toolCall.skill.label` }),
    l = t.formatMessage({ id: `chat.toolCall.skill.unknown` }),
    u = t.formatMessage({ id: `chat.toolCall.skill.args` }),
    d = t.formatMessage({ id: `chat.toolCall.skill.noOutput` }),
    f = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`span`, {
          className: `truncate font-mono text-foreground-subtlest`,
          children: r ?? n.title ?? c,
        }),
      [c, r, n.title],
    ),
    p = (0, React.useMemo)(
      () => (i ? (0, $.jsx)(`code`, { className: `truncate font-mono`, children: i }) : null),
      [i],
    ),
    m = (0, React.useCallback)(
      () =>
        (0, $.jsxs)(`div`, {
          className: `space-y-3 mb-2 rounded-xl border border-border bg-panel px-4 py-3`,
          children: [
            (0, $.jsxs)(`div`, {
              className: `space-y-1`,
              children: [
                (0, $.jsxs)(`div`, {
                  className: `flex flex-wrap items-center gap-2 text-ui-base text-foreground`,
                  children: [
                    (0, $.jsx)(`span`, { className: `text-foreground-subtle`, children: c }),
                    (0, $.jsx)(`code`, {
                      className: `rounded-md bg-surface px-2 py-1 font-mono text-ui-base text-foreground`,
                      children: r ?? n.title ?? l,
                    }),
                  ],
                }),
                i
                  ? (0, $.jsxs)(`div`, {
                      className: `flex items-start gap-2 font-mono text-ui-base text-foreground`,
                      children: [
                        (0, $.jsx)(`span`, {
                          className: `shrink-0 text-foreground-subtle`,
                          children: u,
                        }),
                        (0, $.jsx)(`pre`, {
                          className: `min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground-subtle`,
                          children: i,
                        }),
                      ],
                    })
                  : null,
              ],
            }),
            s
              ? (0, $.jsx)(`div`, {
                  className: `space-y-1`,
                  children: (0, $.jsx)(`pre`, {
                    className: `max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle`,
                    children: s,
                  }),
                })
              : !e.isRunning &&
                (0, $.jsx)(`div`, {
                  className: `space-y-1`,
                  children: (0, $.jsx)(`p`, {
                    className: `font-mono text-ui-base text-foreground-subtle`,
                    children: d,
                  }),
                }),
          ],
        }),
      [e.isRunning, s, i, u, c, r, d, l, n.title],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: SKILL_TOOL_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: e.canToggle ?? !0,
        forceOpen: e.forceOpen ?? !1,
        hideSecondaryTextWhenOpen: !0,
        kindLabel:
          e.kindLabelOverride ??
          t.formatMessage({
            id: e.isRunning ? `chat.toolCall.skill.running` : `chat.toolCall.skill.ran`,
          }),
        sourceLabel: e.sourceLabel,
        primaryText: f,
        secondaryText: p,
        statusLabel: e.statusLabel,
        statusTooltip: n.status === `failed` ? s : void 0,
        showFailureStatus: n.status === `failed`,
        isRunning: e.isRunning,
        title: n.title,
        renderContent: m,
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

export { SKILL_TOOL_ICON, isRawRecord, trimmedStringField, extractSkillName, extractSkillArgs, extractOutputText, SkillToolView };
