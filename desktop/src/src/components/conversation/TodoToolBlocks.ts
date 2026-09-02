// A1-P1-B14：Todo + AskUserQuestion 工具视图族逐字重建（styles js 108885–109009 + 109010–109083，共 199 行，35 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B13 留批 Todo 族 + 四小族之 AskUserQuestion）。
// 消费面 = ConversationToolViews.tsx 手写 TodoToolView（约 76 行）+ 手写 AskUserQuestionToolView（约 58 行）+ 八 declare →
//   墓碑 + 真实 import 收敛（文件尾转导出，ConversationLeaves 导入面逐字不变）。
// 逐字证明：/tmp/a1r0-p1/p14/p14-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p14-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p14/TodoToolBlocks.seam-log.txt，均带〔A1-P1-B14〕。
// 区段切分墓碑：左界 Oht@108885（Task 族右界 108884 邻接）；Nht@109010 为段间界；右界 Fht@109084（ToolCallBlock 派发域）。
// 跨域只消费披露：ti/Kne = src-HCld2afU.js 导出 d/u = SrcSharedB extractTodosFromToolOutput/extractTodosFromToolInput
//   （B9 在案）；oQ 未实体化 → 叶内 declare（跨域判例，同 B13 CodeSurface 族）。
// 〔A1-R94〕$h/eg/Ume/Wme（ask-question 归一域 22980/22988/22996/23021）实体化入 ToolCallClassification（问句载荷族），
//   本叶 4 declare 删除改真实 import（别名改指，消费面 175/176/201 逐字不变）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）| Z→cn（UtilsCn）
//   Gye→IconListTodo（lucide-react ListTodo；原 styles 27341 vendored Sa('list-todo')；A0-S3b 判例）
//   I_→IconCircleCheck（styles 26869 Sa('circle-check')）| C_→IconArrowRight（styles 26697 Sa('arrow-right')）
//   z_→IconCircle（styles 26921 Sa('circle')）| vye→IconCircleQuestionMark（styles 26907 Sa('circle-question-mark')）
//   ti→extractTodosFromToolOutput | Kne→extractTodosFromToolInput（modules/SrcSharedB，src chunk d/u）
//   lQ→ToolLayout（./ToolLayoutBlocks，B12 钥匙 2）| sQ→ToolSnapshotRefs（./ToolSnapshotRefs，B12 钥匙 1）
//   【Todo 工具视图族 108885–109009】
//   Oht→TODO_TOOL_ICON（108885）| kht→TODO_STATUS_CLASS_TABLE（108886）| Aht→extractTodoItems（108891）
//   jht→TodoStatusIcon（108898）| Mht→TodoToolView（108905）
//   【AskUserQuestion 工具视图族 109010–109083】
//   Nht→ASK_QUESTION_ICON（109010）| Pht→AskUserQuestionToolView（109011）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { ListTodo as IconListTodo, CircleCheck as IconCircleCheck, ArrowRight as IconArrowRight, Circle as IconCircle, CircleQuestionMark as IconCircleQuestionMark } from 'lucide-react'; // 原 Gye/I_/C_/z_/vye（styles vendored Sa；A0-S3b 判例）
import { extractTodosFromToolOutput, extractTodosFromToolInput } from '../../modules/SrcSharedB'; // 原 ti/Kne（src-HCld2afU.js 导出 d/u；SrcSharedB S41 在案）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 原 lQ（B12 钥匙 2）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 原 sQ（B12 钥匙 1）
import { parseQuestionPayload as normalizeAskQuestionModel, resolveQuestionSource as resolveAskQuestionInput, extractAskQuestionAnswers, formatAskQuestionAnswerText } from './ToolCallClassification'; // 原 $h/eg/Ume/Wme（styles 22980/22988/22996/23021；A1-R94 实体化收敛）

// 【declare 面（跨域未实体化，只消费不转录；B13 CodeSurface 族判例同源）】
declare const ToolCallExpandedContent: React.FC<{ childToolList?: React.ReactNode; displayModel: any; inlinePreviewOverride?: { type: string } | null; toolCall: any; workspacePath?: string; theme?: string; codePreviewSettings?: any; onOpenCodeViewer?: unknown; onOpenFileLink?: unknown; onOpenBrowserUrl?: unknown }>; // 原 oQ（99815，展开区通用内容，F19 域未实体化）
// 〔A1-R94〕原 $h/eg/Ume/Wme（22980/22988/22996/23021）：ask-question 归一域实体化入 ToolCallClassification，declare 删除改真实 import（文件头）。

/* ── Todo 工具视图族（styles 108885–109009） ── */
var TODO_TOOL_ICON = (0, $.jsx)(IconListTodo, { className: `size-4 shrink-0 text-foreground-subtle` }),
  TODO_STATUS_CLASS_TABLE: Record<string, string> = {
    pending: `text-foreground-subtle`,
    in_progress: `text-foreground`,
    completed: `text-foreground-subtlest line-through`,
  };
function extractTodoItems(e: any): any {
  let { toolCall: t } = e.toolCallNode;
  return (
    extractTodosFromToolOutput({ title: t.title, kind: t.kind, output: t.output }) ??
    extractTodosFromToolInput({ title: t.title, kind: t.kind, input: t.input })
  );
}
function TodoStatusIcon({ status: e }: any) {
  return e === `completed`
    ? (0, $.jsx)(IconCircleCheck, { className: `size-3.5 shrink-0 text-success` })
    : e === `in_progress`
      ? (0, $.jsx)(IconArrowRight, { className: `size-3.5 shrink-0 text-foreground` })
      : (0, $.jsx)(IconCircle, { className: `size-3.5 shrink-0 text-foreground-subtlest` });
}
function TodoToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCall: n } = e.toolCallNode,
    r = extractTodoItems(e),
    i = r?.filter((e: any) => e.status === `completed`).length ?? 0,
    a =
      r?.find((e: any) => e.status === `in_progress`) ??
      r?.find((e: any) => e.status !== `completed`) ??
      r?.at(-1),
    o = t.formatMessage({ id: `todo.panel.title` }),
    s = a?.title ?? n.title ?? t.formatMessage({ id: `todo.panel.currentTask` }),
    c = r ? `${i}/${r.length}` : e.statusLabel,
    l = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`span`, { className: `min-w-0 truncate text-foreground-subtlest`, children: s }),
      [s],
    ),
    u = (0, React.useMemo)(
      () =>
        (0, $.jsx)(`span`, {
          className: `shrink-0 font-mono text-ui-base text-foreground-subtlest`,
          children: c,
        }),
      [c],
    ),
    d = e.onLoadFullToolCallFields,
    f = (0, React.useCallback)(
      () =>
        r
          ? (0, $.jsxs)(`div`, {
              className: `space-y-1 rounded-xl bg-surface px-3 py-2`,
              children: [
                r.map((e: any) =>
                  (0, $.jsxs)(
                    `div`,
                    {
                      className: `flex min-w-0 items-center gap-2 py-1`,
                      children: [
                        (0, $.jsx)(TodoStatusIcon, { status: e.status }),
                        (0, $.jsx)(`span`, {
                          className: cn(`min-w-0 break-words text-ui-base`, TODO_STATUS_CLASS_TABLE[e.status]),
                          children: e.title,
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
                (0, $.jsx)(ToolSnapshotRefs, {
                  refs: n.snapshotRefs ?? [],
                  onLoadFullToolCallFields: d ? () => d(n.toolId) : void 0,
                }),
              ],
            })
          : (0, $.jsxs)($.Fragment, {
              children: [
                (0, $.jsx)(ToolCallExpandedContent, {
                  childToolList: e.childToolList,
                  displayModel: e.displayModel,
                  toolCall: n,
                  workspacePath: e.workspacePath,
                  theme: e.theme,
                  codePreviewSettings: e.codePreviewSettings,
                  onOpenCodeViewer: e.onOpenCodeViewer,
                  onOpenFileLink: e.onOpenFileLink,
                  onOpenBrowserUrl: e.onOpenBrowserUrl,
                }),
                (0, $.jsx)(ToolSnapshotRefs, {
                  refs: n.snapshotRefs ?? [],
                  onLoadFullToolCallFields: d ? () => d(n.toolId) : void 0,
                }),
              ],
            }),
      [
        e.childToolList,
        e.codePreviewSettings,
        e.displayModel,
        e.onOpenBrowserUrl,
        e.onOpenCodeViewer,
        e.onOpenFileLink,
        e.theme,
        e.workspacePath,
        d,
        r,
        n,
      ],
    );
  return (0, $.jsx)(ToolLayout, {
    toolId: n.toolId,
    icon: TODO_TOOL_ICON,
    showIcon: e.showIcon !== !1,
    canToggle: e.canToggle ?? !0,
    forceOpen: e.forceOpen ?? !1,
    kindLabel: o,
    sourceLabel: e.sourceLabel,
    primaryText: l,
    secondaryText: u,
    statusLabel: n.status === `failed` ? e.statusLabel : void 0,
    statusTooltip: n.status === `failed` ? e.errorText : void 0,
    showFailureStatus: n.status === `failed`,
    isRunning: e.isRunning,
    title: n.title,
    renderContent: f,
  });
}

/* ── AskUserQuestion 工具视图族（styles 109010–109083） ── */
var ASK_QUESTION_ICON = (0, $.jsx)(IconCircleQuestionMark, { className: `size-4 shrink-0 text-foreground-subtle` });
function AskUserQuestionToolView(e: any) {
  let { intl: t } = useIntlContext(),
    { toolCallNode: n, isRunning: r, statusLabel: i, errorText: a } = e,
    { toolCall: o } = n,
    s = normalizeAskQuestionModel(resolveAskQuestionInput(o)),
    c = extractAskQuestionAnswers(o) ?? s.answers,
    l = !r && o.status !== `failed` && c !== void 0 && Object.keys(c).length === 0,
    u = t.formatMessage({
      id: l ? `chat.askQuestion.autoContinued` : `chat.askQuestion.noAnswerProvided`,
    }),
    d = s.questions.length,
    f = o.status === `failed`,
    p = (0, React.useCallback)(
      () =>
        !r || f
          ? (0, $.jsxs)(`div`, {
              className: `ml-2 space-y-2 border-l border-border pl-3.5`,
              children: [
                s.questions.map((e) =>
                  (0, $.jsxs)(
                    `div`,
                    {
                      className: `space-y-1`,
                      children: [
                        (0, $.jsx)(`p`, {
                          className: `text-ui-base font-medium leading-5 text-foreground`,
                          children: e.question,
                        }),
                        (0, $.jsx)(`p`, {
                          className: `text-ui-base leading-5 text-foreground-subtle`,
                          children: formatAskQuestionAnswerText(e, c, u),
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
                s.questions.length === 0
                  ? (0, $.jsx)(`p`, {
                      className: `text-ui-base leading-5 text-foreground-subtle`,
                      children: u,
                    })
                  : null,
              ],
            })
          : null,
      [c, s.questions, f, r, u],
    );
  return (0, $.jsx)($.Fragment, {
    children: (0, $.jsx)(ToolLayout, {
      toolId: o.toolId,
      icon: ASK_QUESTION_ICON,
      showIcon: e.showIcon !== !1,
      canToggle: !r,
      forceOpen: !1,
      autoOpen: !1,
      kindLabel: t.formatMessage({ id: r ? `chat.askQuestion.asking` : `chat.askQuestion.asked` }),
      sourceLabel: e.sourceLabel,
      primaryText: null,
      secondaryText: r
        ? null
        : l
          ? u
          : t.formatMessage({ id: `chat.askQuestion.questionsCount` }, { count: String(d) }),
      statusLabel: f ? i : void 0,
      statusTooltip: f ? a : void 0,
      showFailureStatus: f,
      isRunning: r,
      title: o.title ?? `AskUserQuestion`,
      renderContent: p,
    }),
  });
}

export { TODO_TOOL_ICON, TODO_STATUS_CLASS_TABLE, extractTodoItems, TodoStatusIcon, TodoToolView, ASK_QUESTION_ICON, AskUserQuestionToolView };
