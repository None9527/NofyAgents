// A1-P1-B10：ConversationToolViews agent 族区段逐字重建（styles js 105162–105185 卫星 + 105957–106139 / 106141–106290 主段，共 357 行，101 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ConversationToolViews.tsx agent 段 13 declare → 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p10/p10-roundtrip.js（逆映射还原 ≡ bundle 逐字，三段各 EXACT）+ p10-leafcheck.js（叶内双段复核）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 S16 式 `: any` 参数缝见 p10-seam-log.txt，均带〔A1-P1-B10〕。
// 区段切分墓碑：Ipt@106140（var Ipt = jsx(D_, …) agent 工具图标元素）已以 AGENT_TOOL_ICON 实体化于
//   ConversationToolViews.tsx（A0-S4-4b 迁入期；D_ = lucide Bot），本叶不重复，主段 1/2 由此切分。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | G→useIntlContext（I18n useZCodeIntl）| Z→cn（UtilsCn）
//   cj→MarkdownRenderer（MarkdownIntegration）| K$→ToolCallBlock（modules/Conversation）
//   【卫星段 105162–105185：agent 调色板】
//   WQ→AGENT_COLOR_PALETTE（105162）| qft→AGENT_COLOR_BADGE_BG_CLASSES（105163，随 var 链附带）
//   Jft→AGENT_COLOR_TEXT_CLASSES（105173）| Yft→isAgentPaletteColor（105183）
//   【主段 1 105957–106139：agent 助手族 + AgentPromptBlock】
//   Cpt→GENERAL_PURPOSE_AGENT_TYPE（105957）| t$→fallbackMessage（105958）| n$→isAgentRecord（105962）
//   r$→firstTrimmedStringField（105965）| i$→extractAgentTextContent（105973）| a$→resolveAgentPathString（105983）
//   wpt→parseAgentJsonObject（105991）| o$→coerceAgentOutputRecord（105999）| Tpt→extractAgentNickname（106004）
//   Ept→isGenericAgentTypeToken（106016）| s$→resolveAgentTypeField（106023）| Dpt→resolveAgentSummaryField（106028）
//   Opt→resolveAgentTypeLabel（106031）| kpt→resolveAgentColorHash（106044）| Apt→resolveAgentColorField（106050）
//   jpt→extractAgentOutputFile（106053）| Mpt→extractAgentOutputText（106068）| Npt→resolveAgentFallbackName（106075）
//   Ppt→extractAgentPrompt（106093）| Fpt→AgentPromptBlock（106100）
//   【主段 2 106141–106290：agent 子块族】
//   Lpt→AgentChildToolList（106141）| Rpt→AgentLabeledBlock（106178）| c$→AgentDetailRow（106215，Bpt 隐依赖新实体）
//   zpt→AgentColorBadge（106224）| l$→normalizeAgentName（106234）| Bpt→AgentOutputFileCard（106237）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { MarkdownRenderer } from '../../modules/MarkdownIntegration'; // 原 cj（F19 markdown 渲染入口）
import { ToolCallBlock } from '../../modules/Conversation'; // 原 K$（Conversation §4 canonical）

/* ── 卫星段：agent 调色板（styles 105162–105185；zpt/kpt 消费） ── */
var AGENT_COLOR_PALETTE = [`yellow`, `red`, `orange`, `green`, `cyan`, `blue`, `purple`, `pink`],
  AGENT_COLOR_BADGE_BG_CLASSES = {
    blue: `bg-sky-300 text-sky-900 dark:bg-sky-400/32 dark:text-sky-50`,
    cyan: `bg-cyan-300 text-cyan-900 dark:bg-cyan-400/32 dark:text-cyan-50`,
    green: `bg-emerald-300 text-emerald-900 dark:bg-emerald-400/32 dark:text-emerald-50`,
    orange: `bg-orange-300 text-orange-900 dark:bg-orange-400/32 dark:text-orange-50`,
    pink: `bg-pink-300 text-pink-900 dark:bg-pink-400/32 dark:text-pink-50`,
    purple: `bg-violet-300 text-violet-900 dark:bg-violet-400/32 dark:text-violet-50`,
    red: `bg-rose-300 text-rose-900 dark:bg-rose-400/32 dark:text-rose-50`,
    yellow: `bg-amber-300 text-amber-900 dark:bg-amber-300/32 dark:text-amber-50`,
  },
  AGENT_COLOR_TEXT_CLASSES: Record<string, string> = {
    blue: `text-sky-700 dark:text-sky-300`,
    cyan: `text-cyan-700 dark:text-cyan-300`,
    green: `text-emerald-700 dark:text-emerald-300`,
    orange: `text-orange-700 dark:text-orange-300`,
    pink: `text-pink-700 dark:text-pink-300`,
    purple: `text-violet-700 dark:text-violet-300`,
    red: `text-rose-700 dark:text-rose-300`,
    yellow: `text-amber-700 dark:text-amber-300`,
  };
function isAgentPaletteColor(e: any) {
  return AGENT_COLOR_PALETTE.includes(e);
}


/* ── 主段 1：agent 助手族 + AgentPromptBlock（styles 105957–106139） ── */
var GENERAL_PURPOSE_AGENT_TYPE = `general-purpose`;
function fallbackMessage(e: any, t: any, n: any) {
  let r = e.formatMessage({ id: t });
  return r === t ? n : r;
}
function isAgentRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function firstTrimmedStringField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t != `string`) continue;
    let r = t.trim();
    if (r.length > 0) return r;
  }
}
function extractAgentTextContent(e: any): any {
  return typeof e == `string` && e.trim().length > 0
    ? e
    : Array.isArray(e)
      ? e.map((e: any) => extractAgentTextContent(e)).filter((e: any) => typeof e == `string` && e.length > 0).join(`
`) || void 0
      : isAgentRecord(e)
        ? firstTrimmedStringField(e, [`text`]) || extractAgentTextContent(e.content)
        : void 0;
}
function resolveAgentPathString(e: any, t: any) {
  let n = e;
  for (let e of t) {
    if (!isAgentRecord(n)) return;
    n = n[e];
  }
  return typeof n == `string` && n.trim().length > 0 ? n.trim() : void 0;
}
function parseAgentJsonObject(e: any) {
  try {
    let t = JSON.parse(e);
    return isAgentRecord(t) ? t : null;
  } catch {
    return null;
  }
}
function coerceAgentOutputRecord(e: any) {
  if (isAgentRecord(e)) return e;
  let t = extractAgentTextContent(e);
  return t ? parseAgentJsonObject(t) : null;
}
function extractAgentNickname(e: any) {
  let t = resolveAgentPathString(e.raw, [`_meta`, `zcode`, `nickname`]) ?? resolveAgentPathString(e.raw, [`nickname`]);
  if (t) return t;
  if (isAgentRecord(e.input)) {
    let t = firstTrimmedStringField(e.input, [`nickname`]);
    if (t) return t;
  }
  let n = extractAgentTextContent(e.output);
  if (!n) return;
  let r = parseAgentJsonObject(n);
  if (r) return firstTrimmedStringField(r, [`nickname`]);
}
function isGenericAgentTypeToken(e: any) {
  let t = e
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, `_`);
  return t === `agent` || t === `task` || t === `spawn_agent`;
}
function resolveAgentTypeField(e: any) {
  return e
    ? firstTrimmedStringField(e, [`agentType`, `agent_type`, `subagentType`, `subagent_type`, `name`, `nickname`])
    : void 0;
}
function resolveAgentSummaryField(e: any) {
  return e ? firstTrimmedStringField(e, [`description`, `summary`, `message`]) : void 0;
}
function resolveAgentTypeLabel(e: any, t: any, n: any) {
  let r = coerceAgentOutputRecord(e.output),
    i = isAgentRecord(e.input) ? e.input : null,
    a = isAgentRecord(e.raw) ? e.raw : null,
    o =
      resolveAgentPathString(e.raw, [`_meta`, `zcode`, `agentType`]) ??
      resolveAgentPathString(e.raw, [`_meta`, `zcode`, `agent_type`]) ??
      resolveAgentPathString(e.raw, [`_meta`, `zcode`, `subagent_type`]);
  return (
    ((n?.trim() || void 0) ?? resolveAgentTypeField(r) ?? extractAgentNickname(e) ?? resolveAgentTypeField(i) ?? o) ||
    (a?.inputPreviewComplete === !0 ? t || GENERAL_PURPOSE_AGENT_TYPE : ``)
  );
}
function resolveAgentColorHash(e: any) {
  let t = coerceAgentOutputRecord(e.output),
    n = isAgentRecord(e.input) ? e.input : null,
    r = resolveAgentPathString(e.raw, [`_meta`, `zcode`, `color`]) ?? resolveAgentPathString(e.raw, [`color`]) ?? resolveAgentColorField(n) ?? resolveAgentColorField(t);
  return r && isAgentPaletteColor(r) ? r : void 0;
}
function resolveAgentColorField(e: any) {
  return e ? firstTrimmedStringField(e, [`color`, `agentColor`, `agent_color`]) : void 0;
}
function extractAgentOutputFile(e: any) {
  let t = isAgentRecord(e.raw) ? e.raw : null,
    n = t && isAgentRecord(t._meta) ? t._meta : null,
    r = n && isAgentRecord(n.zcode) ? n.zcode : null,
    i = r && isAgentRecord(r.backgroundAgent) ? r.backgroundAgent : null,
    a = r && isAgentRecord(r.taskNotification) ? r.taskNotification : null,
    o = i,
    s = isAgentRecord(e.input) ? e.input : null,
    c = extractAgentTextContent(e.output),
    l =
      (a && firstTrimmedStringField(a, [`outputFile`, `output_file`])) ??
      (o && firstTrimmedStringField(o, [`outputFile`, `output_file`])) ??
      c?.match(/output_file:\s*([^\s]+)/i)?.[1];
  return s?.run_in_background !== !0 && s?.runInBackground !== !0 && !l ? null : { outputFile: l };
}
function extractAgentOutputText(e: any) {
  return (
    (resolveAgentPathString(e.raw, [`_meta`, `zcode`, `taskNotification`, `result`]) ??
      resolveAgentPathString(e.raw, [`_meta`, `zcode`, `taskNotification`, `summary`])) ||
    e.content?.trim()
  );
}
function resolveAgentFallbackName(e: any, t: any) {
  let n = extractAgentNickname(e);
  if (n) return n;
  if (typeof e.title == `string` && e.title.trim().length > 0) {
    let t = e.title.trim();
    if (!isGenericAgentTypeToken(t)) return t;
  }
  if (isAgentRecord(e.input)) {
    let t = firstTrimmedStringField(e.input, [`description`]);
    if (t) return t;
    let n = firstTrimmedStringField(e.input, [`subagent_type`]);
    if (n) return n;
    let r = firstTrimmedStringField(e.input, [`agent_type`]);
    if (r) return r;
  }
  let r = coerceAgentOutputRecord(e.output);
  return resolveAgentSummaryField(r) || resolveAgentTypeField(r) || t;
}
function extractAgentPrompt(e: any) {
  if (isAgentRecord(e.input)) {
    let t = firstTrimmedStringField(e.input, [`prompt`, `message`, `description`]);
    if (t) return t;
  }
  if (typeof e.input == `string` && e.input.trim().length > 0) return e.input.trim();
}
function AgentPromptBlock({
  prompt: e,
  workspacePath: t,
  theme: n,
  codePreviewSettings: r,
  onOpenCodeViewer: i,
  onOpenFileLink: a,
  onOpenBrowserUrl: o,
}: any) {
  let { intl: s } = useIntlContext();
  return (0, $.jsx)(`section`, {
    className: `space-y-2`,
    children: (0, $.jsxs)(`div`, {
      className: `rounded-lg border border-border flex flex-col`,
      children: [
        (0, $.jsx)(`div`, {
          className: `flex min-w-0 items-center p-3`,
          children: (0, $.jsx)(`h4`, {
            className: `min-w-0 text-ui-base font-medium tracking-wide text-foreground-subtlest uppercase`,
            children: fallbackMessage(s, `chat.toolCall.agent.prompt`, `Prompt`),
          }),
        }),
        (0, $.jsx)(`div`, {
          className: `overflow-auto max-h-50`,
          "data-markdown-table-sticky-scrollbar": `disabled`,
          children: (0, $.jsx)(MarkdownRenderer, {
            className: `px-3 py-2 min-w-0 break-words text-ui-base [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`,
            workspacePath: t,
            theme: n,
            codePreviewSettings: r,
            onOpenCodeViewer: i,
            onOpenFileLink: a,
            onOpenExternalUrl: o,
            children: e,
          }),
        }),
      ],
    }),
  });
}


/* ── tombstone：Ipt@106140（agent 工具图标元素）已在 ConversationToolViews.tsx 实体化为 AGENT_TOOL_ICON，本叶区段切分不重复。 ── */

/* ── 主段 2：agent 子块族（styles 106141–106290） ── */
function AgentChildToolList({
  childToolCalls: e,
  workspacePath: t,
  theme: n,
  codePreviewSettings: r,
  onOpenCodeViewer: i,
  onOpenFileLink: a,
  onOpenBrowserUrl: o,
  onOpenAutomationsMain: s,
  onLoadFullToolCallFields: c,
}: any) {
  return e.length === 0
    ? null
    : (0, $.jsx)(`div`, {
        className: `space-y-2`,
        children: e.map((e: any) =>
          (0, $.jsx)(
            ToolCallBlock,
            {
              toolCallNode: e,
              depth: 1,
              workspacePath: t,
              theme: n,
              codePreviewSettings: r,
              showIcon: !1,
              onOpenCodeViewer: i,
              onOpenFileLink: a,
              onOpenBrowserUrl: o,
              onOpenAutomationsMain: s,
              onLoadFullToolCallFields: c,
              suppressSourceLabel: !0,
            },
            e.toolCall.toolId,
          ),
        ),
      });
}
function AgentLabeledBlock({
  label: e,
  content: t,
  workspacePath: n,
  theme: r,
  codePreviewSettings: i,
  onOpenCodeViewer: a,
  onOpenFileLink: o,
  onOpenBrowserUrl: s,
}: any) {
  return (0, $.jsx)(`section`, {
    className: `space-y-2`,
    children: (0, $.jsxs)(`div`, {
      className: `rounded-lg border border-border bg-background-alt/40 flex flex-col`,
      children: [
        (0, $.jsx)(`h4`, {
          className: `p-3 text-ui-base font-medium tracking-wide text-foreground-subtlest uppercase`,
          children: e,
        }),
        (0, $.jsx)(`div`, {
          className: `overflow-auto max-h-64`,
          "data-markdown-table-sticky-scrollbar": `disabled`,
          children: (0, $.jsx)(MarkdownRenderer, {
            className: `px-3 py-2 min-w-0 break-words text-ui-base [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`,
            workspacePath: n,
            theme: r,
            codePreviewSettings: i,
            onOpenCodeViewer: a,
            onOpenFileLink: o,
            onOpenExternalUrl: s,
            children: t,
          }),
        }),
      ],
    }),
  });
}
function AgentDetailRow({ label: e, children: t }: any) {
  return (0, $.jsxs)(`div`, {
    className: `grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-2`,
    children: [
      (0, $.jsx)(`div`, { className: `text-foreground-subtlest`, children: e }),
      (0, $.jsx)(`div`, { className: `min-w-0 text-foreground-subtle`, children: t }),
    ],
  });
}
function AgentColorBadge({ color: e, name: t }: any) {
  return (0, $.jsx)(`span`, {
    className: cn(
      `inline-flex max-w-36 items-center truncate font-mono text-ui-base font-medium leading-[1.5]`,
      AGENT_COLOR_TEXT_CLASSES[e],
    ),
    title: t,
    children: t,
  });
}
function normalizeAgentName(e: any) {
  return e.trim().toLowerCase();
}
function AgentOutputFileCard({ outputFile: e, hasActivity: t, isRunning: n, status: r }: any) {
  let { intl: i } = useIntlContext(),
    a = (e: any, t: any) => fallbackMessage(i, e, t),
    o =
      r === `failed`
        ? a(`chat.toolCall.agent.backgroundLaunchFailed`, `启动失败`)
        : r === `pending`
          ? a(`chat.toolCall.agent.backgroundLaunching`, `启动中`)
          : a(`chat.toolCall.agent.backgroundLaunched`, `已启动`),
    s = r === `failed` ? `failed` : r === `pending` ? `pending` : `launched`,
    c = n
      ? t
        ? a(`chat.toolCall.agent.backgroundActivityStreaming`, `后台运行中，正在同步输出`)
        : a(`chat.toolCall.agent.backgroundActivityRunningWaiting`, `后台运行中，等待输出`)
      : t
        ? a(`chat.toolCall.agent.backgroundActivityReceived`, `已收到子智能体回传`)
        : a(`chat.toolCall.agent.backgroundActivityWaiting`, `等待子智能体回传`);
  return (0, $.jsxs)(`section`, {
    "data-background-agent-activity-status": n
      ? t
        ? `streaming`
        : `running_waiting`
      : t
        ? `received`
        : `waiting`,
    "data-background-agent-launch-status": s,
    className: `rounded-lg border border-border bg-background-alt/40 p-3 text-ui-base`,
    children: [
      (0, $.jsx)(`div`, {
        className: `font-medium text-foreground-subtle`,
        children: a(`chat.toolCall.agent.backgroundProcess`, `后台 Agent 过程`),
      }),
      (0, $.jsxs)(`div`, {
        className: `mt-2 space-y-2`,
        children: [
          (0, $.jsx)(AgentDetailRow, { label: a(`chat.toolCall.agent.backgroundLaunch`, `启动`), children: o }),
          (0, $.jsx)(AgentDetailRow, {
            label: a(`chat.toolCall.agent.backgroundActivity`, `活动`),
            children: c,
          }),
          e
            ? (0, $.jsx)(AgentDetailRow, {
                label: a(`chat.toolCall.agent.outputFile`, `输出文件`),
                children: (0, $.jsx)(`span`, {
                  className: `block break-all rounded-md bg-background px-2 py-1 font-mono text-foreground-subtle`,
                  children: e,
                }),
              })
            : null,
        ],
      }),
    ],
  });
}


export {
  AGENT_COLOR_PALETTE, AGENT_COLOR_BADGE_BG_CLASSES, AGENT_COLOR_TEXT_CLASSES, isAgentPaletteColor,
  GENERAL_PURPOSE_AGENT_TYPE, fallbackMessage, isAgentRecord, firstTrimmedStringField,
  extractAgentTextContent, resolveAgentPathString, parseAgentJsonObject, coerceAgentOutputRecord,
  extractAgentNickname, isGenericAgentTypeToken, resolveAgentTypeField, resolveAgentSummaryField,
  resolveAgentTypeLabel, resolveAgentColorHash, resolveAgentColorField, extractAgentOutputFile,
  extractAgentOutputText, resolveAgentFallbackName, extractAgentPrompt, AgentPromptBlock,
  AgentChildToolList, AgentLabeledBlock, AgentDetailRow, AgentColorBadge, normalizeAgentName,
  AgentOutputFileCard,
};
