// A1-P1-B15+B16+B17：plan 工具族逐字重建（styles js 98073–98180 + 99769–99814 + 107721–107815 + 108469–108605，共 386 行，27 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（B14 留批第 2/3 项：plan-guidance qmt@107754 更正 + switch-mode ght@108476 + qZ 链）。
//   ① ToolCallBlock `plan-guidance` 分支手写 `return SearchToolView`（注「qmt 复用搜索类摘要视图」）与束真身
//     Wht@109119 `case 'plan-guidance': return qmt` 不符——本批改指 PlanGuidanceToolView（B14 §四 1 差异披露办结）。
//   ② CTV 手写 SwitchModeToolView + isInteractiveChild（约 123 行）+ extractPlanMarkdown declare 墓碑，消费面改文件尾转导出。
//   ③ qZ 链（GZ/Kct/qct/KZ/qZ 98073–98114）+ plan 标题段（Jct/Yct/Xct/Zct 98115–98127）同叶实体化；
//     Jo@1952 → resolveWorkspaceRelativePath 转录于 modules/MarkdownIntegration（Go/sae/qo/Ko 同连续段 1928–1957，落点随段判例 A1-R10 2b）。
//   ④ 展开区错误/输入面 var 链整句（Klt+aQ 99769–99814，语句不可分）随 qmt/ght 消费携带；oQ 展开区主体留批。
//   ⑤ 〔A1-P1-B16〕Qct@98128–98144 git 摘要域吸收（98127 右界邻接，B15 留批办结）；消费位 tlt@98181 留批。
//   ⑥ 〔A1-P1-B17〕$ct@98145–98155 + elt@98156–98180 段吸收（98144 右界邻接，B16 留批办结）；
//     消费位 tlt@98181 续留批（TopBar buildSummaryPanelModel A0 期手写属主，型面/体差异需专批裁决）。
// 逐字证明：/tmp/a1r0-p1/p16/p16-roundtrip.js + p16-leafcheck.js（B15/B16 段）；
//   /tmp/a1r0-p1/p17-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT，含 98145–98180 段）+
//   p17-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p16/seams-PlanToolBlocks.json（B15 缝沿用〔A1-P1-B15〕，
//   B16 增缝带〔A1-P1-B16〕）；〔A1-P1-B17〕$ct/elt 段缝（2 函数形参 + 回调形参 `: any`）见
//   /tmp/a1r0-p1/p17/seams-PlanToolBlocks.json。
// 区段切分墓碑：98073 左界 = Gct@98070 会话面板域右界邻接；〔A1-P1-B16〕98144 右界 = $ct@98145 邻接（Qct 吸收）；
//   〔A1-P1-B17〕98180 右界 = tlt@98181 摘要面板模型邻接（留批：属主 TopBar buildSummaryPanelModel，A0 期手写，
//   体差异 = elt/$ct 未施加 + subagent 控制联结缺如；本叶 $ct/elt 实体为未来 tlt 收敛预备）；
//   99769 左界 = resolveToolDisplayModel 域右界（Wlt，F19 界障续留批）；99814 右界 = oQ@99815 展开区主体（留批）；
//   107721 左界 = Wmt 闭包右界邻接；107815 右界 = Jmt@107816 Session 族图标 var 邻接（B13 既录）；
//   108469 左界 = mht Skill 族闭包右界邻接（B13）；108605 右界 = _ht@108606 Task 族图标 var 邻接（B13）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   【真实 import】$→jsx-runtime | Q→React | G→useIntlContext | Z→cn（UtilsCn）| X→Button（modules/button）
//   Sv→IconNotepadText（styles 27549 Sa('notepad-text')；A0-S3b 判例 lucide NotepadText，npm lucide-react@1.35.0 全名核验在案）
//   M_→IconCheck（26849）| W_→IconCopy（26974）| C_→IconArrowRight（26697）（均 lucide；B14 同源判例）
//   rQ→extractToolErrorText（./ToolStatusModel，B11 既录 99590）| cj→MarkdownRenderer（modules/MarkdownIntegration，原 51736）
//   lQ→ToolLayoutMemo（./ToolLayoutBlocks）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs）| gk→CodeSurface（./CodeSurfaceBlocks，B14）
//   Ko→isAbsolutePath | Jo→resolveWorkspaceRelativePath | Go→baseName（均 modules/MarkdownIntegration；Jo 〔A1-P1-B15〕转录 1952）
//   【qZ 链 98073–98127】GZ→isPlainObjectRecord | Kct→readFirstTrimmedString | qct→resolvePlanFilePathCandidate | KZ→extractPlanMarkdownFromValue
//   qZ→extractPlanMarkdown（98092）| Jct→PLAN_TITLE_HEADING_PATTERN（98115）| Yct→MARKDOWN_LINE_PREFIX_PATTERN（98116）
//   Xct→extractPlanTitle（98117）| Zct→planFilePathBaseName（98125）| Qct→resolveGitSummaryModel（98128，〔A1-P1-B16〕）
//   $ct→summarizePlanChecklist（98145，〔A1-P1-B17〕）| elt→extractSessionPlans（98156，〔A1-P1-B17〕）
//   【展开区面 99769–99814】Klt→ToolInputSurface | aQ→ToolErrorSurface
//   【plan-guidance 107721–107815】Gmt→PLAN_GUIDANCE_TOOL_ICON | D$→isPlainObject | O$→readFirstNonEmptyString
//   Kmt→extractPlanGuidanceText | qmt→PlanGuidanceToolView（107754）
//   【switch-mode 108469–108605】hht→isInteractiveChildTarget | ght→SwitchModeToolView（108474）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { Button } from '../../modules/button'; // 原 X（button-laUijeDG.js t 导出）
import { NotepadText as IconNotepadText, Check as IconCheck, Copy as IconCopy, ArrowRight as IconArrowRight } from 'lucide-react'; // 原 Sv/M_/W_/C_（styles vendored Sa；A0-S3b 判例）
import { extractToolErrorText } from './ToolStatusModel'; // 原 rQ（B11 既录 99590）
import { MarkdownRenderer, isAbsolutePath, resolveWorkspaceRelativePath, baseName } from '../../modules/MarkdownIntegration'; // 原 cj/Ko/Jo/Go（Jo 〔A1-P1-B15〕转录）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { CodeSurface } from './CodeSurfaceBlocks'; // 原 gk（B14 既录 48682；Klt/aQ 错误/输入面 JSON 卡消费）

/* ── plan 工具族（styles 98073–98144 + 99769–99814 + 107721–107815 + 108469–108605） ── */
function isPlainObjectRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function readFirstTrimmedString(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t == `string` && t.trim().length > 0) return t.trim();
  }
}
function resolvePlanFilePathCandidate(e: any, t: any) {
  if (e) return isAbsolutePath(e) ? e : resolveWorkspaceRelativePath(t, e);
}
function extractPlanMarkdownFromValue(e: any, t: any): any {
  if (typeof e == `string` && e.trim().length > 0) return { markdown: e.trim() };
  if (!isPlainObjectRecord(e)) return {};
  let n = readFirstTrimmedString(e, [`plan`, `text`, `content`]),
    r = resolvePlanFilePathCandidate(readFirstTrimmedString(e, [`planFilePath`]), t);
  return n ? { markdown: n, planFilePath: r } : {};
}
function extractPlanMarkdown(e: any, t: any): any {
  let n = extractPlanMarkdownFromValue(e.input, t);
  if (n.markdown) return n;
  if (e.inputText?.trim())
    try {
      let n = extractPlanMarkdownFromValue(JSON.parse(e.inputText), t);
      if (n.markdown) return n;
    } catch {}
  let r = extractPlanMarkdownFromValue(e.output, t);
  if (r.markdown) return r;
  if (!isPlainObjectRecord(e.raw)) return {};
  for (let n of [e.raw.rawInput, e.raw.rawOutput]) {
    let e = extractPlanMarkdownFromValue(n, t);
    if (e.markdown) return e;
  }
  let i = Array.isArray(e.raw.content) ? e.raw.content : [];
  for (let e of i) {
    if (!isPlainObjectRecord(e)) continue;
    let n = extractPlanMarkdownFromValue(isPlainObjectRecord(e.content) ? e.content : e, t);
    if (n.markdown) return n;
  }
  return {};
}
var PLAN_TITLE_HEADING_PATTERN = /^\s{0,3}#(?!#)\s+(.+?)\s*#*\s*$/m,
  MARKDOWN_LINE_PREFIX_PATTERN = /^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+)/;
function extractPlanTitle(e: any) {
  let t = PLAN_TITLE_HEADING_PATTERN.exec(e)?.[1]?.trim();
  if (t) return t;
  for (let t of e.split(/\r?\n/u)) {
    let e = t.replace(MARKDOWN_LINE_PREFIX_PATTERN, ``).trim();
    if (e) return e;
  }
}
function planFilePathBaseName(e: any) {
  return e ? baseName(e) : void 0;
}
function resolveGitSummaryModel({ gitSummary: e, gitDirtyFileCount: t = 0, gitWorktreeChangeSummary: n }: any) {
  if (!e?.isGitAvailable || !e.isRepository) return null;
  let r = n?.added ?? 0,
    i = n?.removed ?? 0;
  if (r + i <= 0) return null;
  let a = !e.isDirty && t === 0 && r === 0 && i === 0 && e.ahead === 0;
  return {
    branchName: e.branchName,
    headRefType: e.headRefType,
    dirtyFileCount: t,
    added: r,
    removed: i,
    ahead: e.ahead,
    behind: e.behind,
    isClean: a,
  };
}
function summarizePlanChecklist(e: any) {
  if (!e || e.items.length === 0) return null;
  let t = e.items.filter((e: any) => e.status === `completed`);
  return {
    items: e.items,
    displayItems: e.items,
    completedCount: t.length,
    waitingCount: e.items.length - t.length,
    totalCount: e.items.length,
  };
}
function extractSessionPlans(e: any, t: any) {
  if (!e?.length) return null;
  let n = e
    .filter(
      (e: any) =>
        e.toolName === `ExitPlanMode` &&
        (e.status === `success` || e.status === `error` || e.status === `cancelled`),
    )
    .toSorted((e: any, t: any) => t.rowId - e.rowId)
    .flatMap((e: any) => {
      let n = extractPlanMarkdown(e, t ?? ``);
      if (!n.markdown) return [];
      let r = extractPlanTitle(n.markdown);
      return [
        {
          rowId: e.rowId,
          toolCallId: e.toolCallId,
          markdown: n.markdown,
          ...(r ? { title: r } : {}),
          ...(n.planFilePath ? { planFilePath: n.planFilePath } : {}),
        },
      ];
    });
  return n.length > 0 ? { items: n } : null;
}
var ToolInputSurface = ({ className: e, input: t, ...n }: any) =>
    (0, $.jsxs)(`div`, {
      className: cn(`space-y-2 overflow-hidden`, e),
      ...n,
      children: [
        (0, $.jsx)(`h4`, {
          className: `font-medium text-muted-foreground text-ui-base uppercase tracking-wide`,
          children: `Parameters`,
        }),
        (0, $.jsx)(`div`, {
          className: `max-h-60 overflow-auto rounded-md bg-muted/50`,
          children: (0, $.jsx)(CodeSurface, { code: JSON.stringify(t, null, 2), language: `json` }),
        }),
      ],
    }),
  ToolErrorSurface = ({ className: e, output: t, errorText: n, ...r }: any) => {
    if (!(t || n)) return null;
    let i = null;
    return (
      n ||
        ((i = (0, $.jsx)(`div`, { children: t })),
        typeof t == `object` && !(0, React.isValidElement)(t)
          ? (i = (0, $.jsx)(CodeSurface, { code: JSON.stringify(t, null, 2), language: `json` }))
          : typeof t == `string` && (i = (0, $.jsx)(CodeSurface, { code: t, language: `json` }))),
      (0, $.jsxs)(`div`, {
        className: cn(`space-y-2`, e),
        ...r,
        children: [
          (0, $.jsx)(`h4`, {
            className: `font-medium text-muted-foreground text-ui-base uppercase tracking-wide`,
            children: n ? `Error` : `Result`,
          }),
          (0, $.jsxs)(`div`, {
            className: cn(
              `max-h-60 overflow-auto rounded-md text-ui-base [&_table]:w-full`,
              n ? `bg-destructive/10 text-destructive` : `bg-muted/50 text-foreground`,
            ),
            children: [
              n ? (0, $.jsx)(`div`, { className: `whitespace-pre-wrap p-3`, children: n }) : null,
              i,
            ],
          }),
        ],
      })
    );
  };
var PLAN_GUIDANCE_TOOL_ICON = (0, $.jsx)(IconNotepadText, { className: `size-4 shrink-0 text-foreground-subtle` });
function isPlainObject(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function readFirstNonEmptyString(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t == `string` && t.trim().length > 0) return t.trim();
  }
}
function extractPlanGuidanceText(e: any) {
  for (let t of [e.output, e.input]) {
    if (typeof t == `string` && t.trim().length > 0) return t.trim();
    if (isPlainObject(t)) {
      let e = readFirstNonEmptyString(t, [`text`, `content`, `output`]);
      if (e) return e;
    }
  }
  if (!isPlainObject(e.raw)) return;
  let t =
    typeof e.raw.rawOutput == `string`
      ? e.raw.rawOutput.trim()
      : isPlainObject(e.raw.rawOutput)
        ? readFirstNonEmptyString(e.raw.rawOutput, [`text`, `content`, `output`])
        : void 0;
  if (t) return t;
  let n = Array.isArray(e.raw.content) ? e.raw.content : [];
  for (let e of n) {
    if (!isPlainObject(e)) continue;
    let t = readFirstNonEmptyString(isPlainObject(e.content) ? e.content : e, [`text`, `content`, `output`]);
    if (t) return t;
  }
}
function PlanGuidanceToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = extractToolErrorText(n),
    i = extractPlanGuidanceText(n),
    a = (0, React.useCallback)(
      () =>
        i
          ? (0, $.jsx)(`div`, {
              className: `ml-2 space-y-2 border-border border-l pl-3.5 border-border`,
              children: (0, $.jsx)(MarkdownRenderer, {
                className: `min-w-0 break-words [&_h1]:text-foreground-subtlest [&_h2]:text-foreground-subtlest [&_h3]:text-foreground-subtlest [&_li]:text-foreground-subtlest [&_p]:text-foreground-subtlest`,
                workspacePath: e.workspacePath,
                theme: e.theme,
                codePreviewSettings: e.codePreviewSettings,
                onOpenCodeViewer: e.onOpenCodeViewer,
                onOpenFileLink: e.onOpenFileLink,
                onOpenExternalUrl: e.onOpenBrowserUrl,
                children: i,
              }),
            })
          : (0, $.jsx)(ToolErrorSurface, { errorText: r, output: r ? void 0 : n.output }),
      [
        e.codePreviewSettings,
        e.onOpenBrowserUrl,
        e.onOpenCodeViewer,
        e.onOpenFileLink,
        e.theme,
        e.workspacePath,
        r,
        i,
        n.output,
      ],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(ToolLayout, {
        toolId: n.toolId,
        icon: PLAN_GUIDANCE_TOOL_ICON,
        showIcon: e.showIcon !== !1,
        canToggle: e.canToggle ?? !0,
        forceOpen: e.forceOpen ?? !1,
        kindLabel: t.formatMessage({ id: `planTool.guidance.enterMode` }),
        sourceLabel: e.sourceLabel,
        primaryText: null,
        secondaryText: void 0,
        statusLabel: n.status === `failed` ? e.statusLabel : void 0,
        statusTooltip: n.status === `failed` ? r : void 0,
        showFailureStatus: n.status === `failed`,
        isRunning: e.isRunning,
        title: n.title,
        renderContent: a,
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
function isInteractiveChildTarget(e: any, t: any) {
  if (!(e instanceof Element)) return !1;
  let n = e.closest(`button, a, input, textarea, select, [role='button']`);
  return n !== null && n !== t;
}
function SwitchModeToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = extractToolErrorText(n),
    { markdown: i, planFilePath: a } = extractPlanMarkdown(n, e.workspacePath),
    o = (0, $.jsx)(ToolSnapshotRefs, {
      refs: n.snapshotRefs ?? [],
      onLoadFullToolCallFields: e.onLoadFullToolCallFields
        ? () => e.onLoadFullToolCallFields?.(n.toolId)
        : void 0,
    }),
    s = typeof i == `string` && i.length > 0,
    [c, l] = (0, React.useState)(null),
    u = c === i,
    d = () => {
      !i ||
        !e.onOpenPlanDetail ||
        e.onOpenPlanDetail({
          toolCallId: n.toolId,
          markdown: i,
          ...(a ? { planFilePath: a } : {}),
        });
    },
    f = (e: any) => {
      isInteractiveChildTarget(e.target, e.currentTarget) || d();
    },
    p = (e: any) => {
      (e.key !== `Enter` && e.key !== ` `) ||
        isInteractiveChildTarget(e.target, e.currentTarget) ||
        (e.preventDefault(), d());
    },
    m = () => {
      !i ||
        typeof navigator > `u` ||
        !navigator.clipboard?.writeText ||
        navigator.clipboard.writeText(i).then(
          () => l(i),
          () => l(null),
        );
    };
  return s
    ? (0, $.jsxs)($.Fragment, {
        children: [
          (0, $.jsxs)(`section`, {
            role: e.onOpenPlanDetail ? `button` : void 0,
            tabIndex: e.onOpenPlanDetail ? 0 : void 0,
            "aria-label": t.formatMessage({ id: `planTool.panel.open` }),
            onClick: f,
            onKeyDown: p,
            className: `group w-full min-w-0 overflow-hidden rounded-xl border border-card-border bg-card text-foreground shadow-xs outline-none transition-colors hover:border-border-hover focus-visible:border-input-border-focused focus-visible:ring-2 focus-visible:ring-ring/40`,
            children: [
              (0, $.jsxs)(`header`, {
                className: `flex h-10 min-w-0 items-start gap-2 px-4 pt-4`,
                children: [
                  (0, $.jsxs)(`div`, {
                    className: `flex shrink-0 items-center gap-2`,
                    children: [
                      (0, $.jsx)(IconNotepadText, { className: `size-4 shrink-0 text-foreground-subtle` }),
                      (0, $.jsx)(`h3`, {
                        className: `text-ui-base font-medium text-foreground-subtle`,
                        children: t.formatMessage({ id: `planTool.panel.planTab` }),
                      }),
                    ],
                  }),
                  a
                    ? (0, $.jsx)(`code`, {
                        className: `min-w-0 truncate text-ui-sm text-foreground-subtlest`,
                        title: a,
                        children: planFilePathBaseName(a),
                      })
                    : null,
                  (0, $.jsx)(`div`, {
                    className: `ml-auto flex shrink-0 items-center gap-1`,
                    children: (0, $.jsx)(Button, {
                      type: `button`,
                      variant: `ghost`,
                      size: `icon-sm`,
                      "aria-label": t.formatMessage({
                        id: u ? `planTool.panel.copied` : `planTool.panel.copy`,
                      }),
                      onClick: (e: any) => {
                        (e.stopPropagation(), m());
                      },
                      children: u
                        ? (0, $.jsx)(IconCheck, { className: `size-3.5` })
                        : (0, $.jsx)(IconCopy, { className: `size-3.5` }),
                    }),
                  }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `relative overflow-hidden`,
                children: [
                  (0, $.jsx)(`div`, {
                    className: `max-h-64 overflow-hidden px-4 pt-2 pb-12 [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_100%)]`,
                    children: (0, $.jsx)(MarkdownRenderer, {
                      className: `min-w-0 break-words text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground-subtle [&_p]:text-foreground-subtle`,
                      workspacePath: e.workspacePath,
                      theme: e.theme,
                      codePreviewSettings: e.codePreviewSettings,
                      onOpenCodeViewer: e.onOpenCodeViewer,
                      onOpenFileLink: e.onOpenFileLink,
                      onOpenExternalUrl: e.onOpenBrowserUrl,
                      children: i,
                    }),
                  }),
                  (0, $.jsxs)(Button, {
                    type: `button`,
                    variant: `default`,
                    size: `lg`,
                    className: `absolute bottom-6 left-1/2 h-10 -translate-x-1/2 rounded-full !pr-4.5 pl-6 shadow-xs`,
                    onClick: (e: any) => {
                      (e.stopPropagation(), d());
                    },
                    children: [
                      t.formatMessage({ id: `planTool.panel.viewFull` }),
                      (0, $.jsx)(IconArrowRight, { "data-icon": `inline-end`, className: `size-4` }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          o,
        ],
      })
    : n.output !== void 0 || r
      ? (0, $.jsxs)($.Fragment, {
          children: [(0, $.jsx)(ToolErrorSurface, { errorText: r, output: r ? void 0 : n.output }), o],
        })
      : o;
}
export { isPlainObjectRecord, readFirstTrimmedString, resolvePlanFilePathCandidate, extractPlanMarkdownFromValue, extractPlanMarkdown, PLAN_TITLE_HEADING_PATTERN, MARKDOWN_LINE_PREFIX_PATTERN, extractPlanTitle, planFilePathBaseName, resolveGitSummaryModel, summarizePlanChecklist, extractSessionPlans, ToolInputSurface, ToolErrorSurface, PLAN_GUIDANCE_TOOL_ICON, isPlainObject, readFirstNonEmptyString, extractPlanGuidanceText, PlanGuidanceToolView, isInteractiveChildTarget, SwitchModeToolView };
