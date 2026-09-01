// A0-S4-4b: 自 modules/ConversationOverlays.tsx §2 Elicitation 子族 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §2 全段（767–1501）+ §0 声明群分配本族子集（isImeComposing declare + ElicitationQuestion/ElicitationRequest 模型，
// 二型补 export；InteractionOrigin 经 type import 取回 Permission 族；PendingInteraction 经 type import 取回交互调度族）。
// 导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Info as IconInfo, ChevronDown as IconChevronDown, ChevronUp as IconChevronUp, Check as IconCheck } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Input } from '../../modules/ImeComposition';
import { Badge } from '../../modules/PaymentDeep';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button, ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 H + button chunk 图标（A0-S3b 增补）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { InteractionOriginBadge, type InteractionOrigin } from './PermissionApprovalOverlay'; // §1 族属主（徽章为渲染期值引用，型别 type-only）
import { PLAN_APPROVAL_OPTION_VALUE, resolveAutoResolutionCountdown, nextAutoResolutionTickDelay } from './InteractionCountdown'; // 〔A1-P1-B11〕倒计时域三件实体化收敛（styles 115978–115992 逐字）
import type { PendingInteraction } from './ConversationInteractionsOverlay'; // §3 族属主（type-only，编译期擦除）

/** 原 A（imeComposition chunk 的 t 导出）：IME 组词回车守卫 */
declare function isImeComposing(event: React.KeyboardEvent): boolean;

/* --- 交互/快照模型（本族所有子集） --- */

export interface ElicitationQuestion {
  key: string;
  question: string;
  header?: string;
  options: { value: string; label: string; description?: string }[];
  multiSelect?: boolean;
}
export interface ElicitationRequest {
  type: "elicitation_request";
  taskId: string;
  traceId: string;
  requestId: string;
  message: string;
  header?: string;
  options: { value: string; label?: string; description?: string }[];
  multiSelect?: boolean;
  questions: { question: string; header?: string; options: { value: string; label?: string; description?: string }[]; multiSelect?: boolean }[];
  currentQuestionIndex?: number;
  answerDrafts?: Record<string, string[]>;
  origin?: InteractionOrigin;
  schema?: unknown;
  freeText?: boolean;
}

/* ============================================================================
 * 2. Elicitation 子族（问题内联覆盖层；chat.elicitation.*）
 * ==========================================================================*/

const AUTO_RESOLUTION_TICK_MS = 6e4; // q1（js 115930 / jsx 98698）
/* ── tombstone〔A1-P1-B11〕：PLAN_APPROVAL_OPTION_VALUE 手写 const（J1）+ rxt/ixt 双 declare 删除——
 * 逐字实体化 → ./InteractionCountdown（styles 115978–115992；roundtrip EXACT，/tmp/a1r0-p1/p11/）。
 * 消费面改文件头真实 import，调用面逐字不变。 ── */

/**
 * 自动结束倒计时钩子（原 axt，js 115945 / jsx 98713）。
 * 页面隐藏时暂停计时（visibilitychange/focus 恢复）。
 */
function useAutoResolutionCountdown(autoResolution: PendingInteraction["autoResolution"]): number | null {
  const [nowMs, setNowMs] = React.useState(Date.now);
  React.useEffect(() => {
    if (!autoResolution || autoResolution.state === `snoozed`) return;
    let timer: number | undefined;
    const tick = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      const current = Date.now();
      setNowMs(current);
      if (document.visibilityState === `hidden`) return;
      const delay = nextAutoResolutionTickDelay(autoResolution, current);
      if (delay !== null) timer = window.setTimeout(tick, delay);
    };
    tick();
    window.addEventListener(`focus`, tick);
    document.addEventListener(`visibilitychange`, tick);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener(`focus`, tick);
      document.removeEventListener(`visibilitychange`, tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResolution?.state, autoResolution?.startedAt, autoResolution?.state === `snoozed` ? autoResolution.snoozedAt : autoResolution?.deadlineAt]);
  return resolveAutoResolutionCountdown(autoResolution, nowMs);
}

/**
 * 原 oxt（js 116020 / jsx 98730）：输入框键盘映射。
 * Enter：Ctrl/Meta 或 plan 审批或末题 → 提交；否则下一题。
 * Escape：非审批且有上一题 → 上一题；否则关闭。
 * （IME 组词期间全部忽略。）
 */
function mapElicitationKeyDown(args: {
  key: string;
  advanceKind: "next" | "submit";
  ctrlKey: boolean;
  metaKey: boolean;
  compositionActive: boolean;
  nativeEvent: Event;
  isPlanApproval: boolean;
  hasPreviousQuestion: boolean;
}): "advance" | "submit" | "previous" | "dismiss" | null {
  if (isImeComposing(args as unknown as React.KeyboardEvent)) return null;
  if (args.key === `Enter`) {
    return args.ctrlKey || args.metaKey || args.isPlanApproval || args.advanceKind === `submit` ? `submit` : `advance`;
  }
  if (args.key === `Escape`) {
    return !args.isPlanApproval && args.hasPreviousQuestion ? `previous` : `dismiss`;
  }
  return null;
}

/** 原 sxt（js 116033 / jsx 98733）：请求 → 规范问题列表（无 questions 时用顶层字段包一题） */
function normalizeElicitationQuestions(request: ElicitationRequest): ElicitationQuestion[] {
  return (
    request.questions && request.questions.length > 0
      ? request.questions
      : [
          {
            question: request.message,
            header: request.header ?? request.message,
            options: request.options,
            ...(request.multiSelect ? { multiSelect: true } : {}),
          },
        ]
  ).map((question, index) => ({
    key: `${index}:${question.question}`,
    question: question.question,
    header: question.header,
    options: question.options.map((option) => ({ value: option.value, label: option.label || option.value, description: option.description })),
    ...(question.multiSelect ? { multiSelect: true } : {}),
  }));
}

function isPlainObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value == `object` && !!value && !Array.isArray(value);
}
/** 原 lxt（js 116012 / jsx 98758）：plan 审批 = schema.interaction=plan_approval 且工具为 ExitPlanMode */
function isPlanApprovalRequest(request: ElicitationRequest): boolean {
  const schema = request.schema;
  return isPlainObjectValue(schema) && schema.interaction === `plan_approval` && schema.toolName === `ExitPlanMode`;
}

export type AnswerDraft = { selectedValues: string[]; customAnswer: string };
export type AnswerDraftMap = Record<string, AnswerDraft>;

/** 原 uxt（js 116064 / jsx 98762）：服务端草稿 → 本地草稿（未知选项值落入自定义答案） */
function buildInitialAnswerDrafts(questions: ElicitationQuestion[], request: ElicitationRequest): AnswerDraftMap {
  return Object.fromEntries(
    questions.map((question, index) => {
      const raw = request.answerDrafts?.[`answer_${index}`] ?? request.answerDrafts?.[String(index)] ?? [];
      const validValues = new Set(question.options.map((option) => option.value));
      const selected = raw.filter((value) => validValues.has(value));
      const custom = raw.filter((value) => !validValues.has(value)).join(`, `);
      return [question.key, { selectedValues: selected, customAnswer: custom }];
    }),
  );
}
/** 原 dxt（js 116075 / jsx 98774）：初始题号（服务端 currentQuestionIndex 钳位） */
function resolveInitialQuestionIndex(request: ElicitationRequest, questions: ElicitationQuestion[]): number {
  if (questions.length === 0) return 0;
  const index = request.currentQuestionIndex;
  return typeof index != `number` || !Number.isInteger(index) ? 0 : Math.max(0, Math.min(index, questions.length - 1));
}
/** 原 fxt（js 116080 / jsx 98779）：焦点槽位 = 选项数 + 自定义输入 */
function optionFocusSlotCount(question: ElicitationQuestion | undefined): number {
  return question ? question.options.length + 1 : 0;
}
/** 原 pxt（js 116083 / jsx 98782）：按草稿恢复焦点槽位 */
function focusIndexForQuestion(question: ElicitationQuestion | undefined, drafts: AnswerDraftMap): number {
  if (!question) return 0;
  const draft = drafts[question.key];
  const firstSelected = draft?.selectedValues[0];
  if (firstSelected) {
    const index = question.options.findIndex((option) => option.value === firstSelected);
    if (index >= 0) return index;
  }
  return draft?.customAnswer.trim() ? question.options.length : -1;
}
/** 原 Y1（js 116093 / jsx 98792）：题目草稿 → 答案数组（选中值 + 自定义文本） */
function collectQuestionAnswers(question: ElicitationQuestion, drafts: AnswerDraftMap): string[] {
  const draft = drafts[question.key] ?? { selectedValues: [], customAnswer: `` };
  const custom = draft.customAnswer.trim();
  return [...draft.selectedValues, ...(custom ? [custom] : [])];
}
/** 原 mxt（js 116098 / jsx 98800）：提交载荷（answers 映射 + answer_N + 单题时的 answer） */
function buildElicitationAnswerPayload(questions: ElicitationQuestion[], drafts: AnswerDraftMap): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    answers: Object.fromEntries(
      questions.flatMap((question) => {
        const values = collectQuestionAnswers(question, drafts);
        return values.length > 0 ? [[question.question, values.join(`, `)]] : [];
      }),
    ),
  };
  questions.forEach((question, index) => {
    const values = collectQuestionAnswers(question, drafts);
    if (values.length > 0) payload[`answer_${index}`] = question.multiSelect ? values : values[0];
  });
  const single = questions.length === 1 ? questions[0] : undefined;
  if (single) {
    const values = collectQuestionAnswers(single, drafts);
    if (values.length > 0) payload.answer = single.multiSelect ? values : values[0];
  }
  return payload;
}
/** 原 hxt（js 116118 / jsx 98818）：单选覆盖 / 多选切换 */
function applyAnswerSelection(drafts: AnswerDraftMap, question: ElicitationQuestion, value: string): AnswerDraftMap {
  const current = drafts[question.key] ?? { selectedValues: [], customAnswer: `` };
  const next = question.multiSelect
    ? {
        ...current,
        selectedValues: current.selectedValues.includes(value) ? current.selectedValues.filter((existing) => existing !== value) : [...current.selectedValues, value],
      }
    : { selectedValues: [value], customAnswer: `` };
  return { ...drafts, [question.key]: next };
}
/** 原 X1（js 116130 / jsx 98835）：末题 → submit，否则 next */
function advanceKindForQuestion(questions: ElicitationQuestion[], questionIndex: number): "next" | "submit" {
  return questionIndex >= questions.length - 1 ? `submit` : `next`;
}

/** 原 gxt（js 116133 / jsx 98838）：按 requestId 强制重挂载对话框 */
function ElicitationDialogKeyed(props: React.ComponentProps<typeof ElicitationDialog>) {
  return <ElicitationDialog key={props.request.requestId} {...props} />;
}

/**
 * 问题内联覆盖层（原 _xt，js 116088 / jsx 98841）。
 * 多题问卷卡片：题头（来源徽章 + 标题徽章 + 问题文本，移动端可折叠）、
 * 计数与导航（上一题/下一题/收起对话框/倒计时暂停）、选项列表
 * （单选=序号+选中背景；多选=复选框；末位自定义输入行）、
 * 页脚（键盘提示 + 关闭 + 继续/提交）。
 * 键盘：方向键/Tab 循环焦点，空格/回车选择，回车推进/提交，Esc 回退/关闭；
 * 输入框内 Ctrl/Cmd+Enter 提交。plan 审批模式下标题/问题文案换成
 * chat.permission.title / switchMode.placeholder，approve 选项文案本地化。
 * 草稿经 onFormDraftChange 持久化（任务 store 按 工作区×会话×请求 存储）。
 */
function ElicitationDialog({
  request,
  autoResolution,
  onRespond,
  onFirstInteraction,
  initialFormDraft,
  onFormDraftChange,
}: {
  request: ElicitationRequest;
  autoResolution?: PendingInteraction["autoResolution"];
  onRespond: (requestId: string, action: "accept" | "decline", answers?: Record<string, unknown>) => void;
  onFirstInteraction?: (kind: "answer" | "navigation" | "countdown" | "panelHover") => Promise<boolean> | boolean;
  initialFormDraft?: { questionIndex: number; drafts: AnswerDraftMap };
  onFormDraftChange?: (requestId: string, draft: { questionIndex: number; drafts: AnswerDraftMap }) => void;
}) {
  const { intl } = useIntlContext();
  const questions = React.useMemo(() => normalizeElicitationQuestions(request), [request]);
  const [questionIndex, setQuestionIndex] = React.useState(() => initialFormDraft?.questionIndex ?? resolveInitialQuestionIndex(request, questions));
  const isPlanApproval = isPlanApprovalRequest(request);
  const [focusSlot, setFocusSlot] = React.useState(() => (isPlanApproval ? 0 : -1));
  const [drafts, setDrafts] = React.useState<AnswerDraftMap>(() => initialFormDraft?.drafts ?? buildInitialAnswerDrafts(questions, request));
  const [questionCollapsed, setQuestionCollapsed] = React.useState(false);
  const [dialogExpanded, setDialogExpanded] = React.useState(true);
  const optionElementRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const customInputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const compositionActive = React.useRef(false);
  const firstInteractionSent = React.useRef(false);
  const countdownSeconds = useAutoResolutionCountdown(autoResolution);
  React.useEffect(() => {
    onFormDraftChange?.(request.requestId, { questionIndex, drafts });
  }, [drafts, onFormDraftChange, questionIndex, request.requestId]);
  const notifyInteraction = React.useCallback(
    (kind: "answer" | "navigation" | "countdown" | "panelHover") => {
      if (firstInteractionSent.current) return;
      firstInteractionSent.current = true;
      let result: Promise<boolean> | boolean | undefined;
      try {
        result = onFirstInteraction?.(kind);
      } catch {
        firstInteractionSent.current = false;
        return;
      }
      Promise.resolve(result)
        .then((accepted) => {
          if (accepted === false) firstInteractionSent.current = false;
        })
        .catch(() => {
          firstInteractionSent.current = false;
        });
    },
    [onFirstInteraction],
  );
  React.useEffect(() => {
    setQuestionCollapsed(false);
  }, [questionIndex]);
  const currentQuestion = questions[questionIndex];
  const currentDraft = currentQuestion ? drafts[currentQuestion.key] ?? { selectedValues: [], customAnswer: `` } : undefined;
  React.useEffect(() => {
    if (optionFocusSlotCount(currentQuestion) === 0 || focusSlot < 0) return;
    const frame = requestAnimationFrame(() => {
      if (focusSlot < (currentQuestion?.options.length ?? 0)) {
        optionElementRefs.current[focusSlot]?.focus();
        return;
      }
      customInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusSlot, currentQuestion]);
  React.useEffect(() => {
    if (focusSlot < 0) {
      const frame = requestAnimationFrame(() => {
        containerRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [focusSlot]);
  const updateDraft = React.useCallback((question: ElicitationQuestion, updater: (draft: AnswerDraft) => AnswerDraft) => {
    setDrafts((previous) => ({
      ...previous,
      [question.key]: updater(previous[question.key] ?? { selectedValues: [], customAnswer: `` }),
    }));
  }, []);
  const handleCustomAnswerChange = React.useCallback(
    (question: ElicitationQuestion, value: string) => {
      notifyInteraction(`answer`);
      updateDraft(question, (draft) => ({
        selectedValues: question.multiSelect ? draft.selectedValues : [],
        customAnswer: value,
      }));
    },
    [notifyInteraction, updateDraft],
  );
  const submitAnswers = React.useCallback(
    (answerDrafts: AnswerDraftMap) => {
      const payload = buildElicitationAnswerPayload(questions, answerDrafts);
      onRespond(request.requestId, `accept`, payload);
    },
    [onRespond, questions, request.requestId],
  );
  const advance = React.useCallback(
    (answerDrafts: AnswerDraftMap) => {
      if (advanceKindForQuestion(questions, questionIndex) === `submit`) {
        submitAnswers(answerDrafts);
        return;
      }
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      const restoredFocus = focusIndexForQuestion(questions[nextIndex], answerDrafts);
      setFocusSlot(isPlanApproval && restoredFocus < 0 ? 0 : restoredFocus);
    },
    [questionIndex, questions, submitAnswers, isPlanApproval],
  );
  const selectOption = React.useCallback(
    (question: ElicitationQuestion, value: string) => {
      notifyInteraction(`answer`);
      const nextDrafts = applyAnswerSelection(drafts, question, value);
      setDrafts(nextDrafts);
      if (!question.multiSelect) advance(nextDrafts);
    },
    [advance, drafts, notifyInteraction],
  );
  const effectiveDraftForAdvance = React.useCallback(() => {
    if (!currentQuestion || currentQuestion.multiSelect || focusSlot < 0) return drafts;
    const draft = drafts[currentQuestion.key];
    if ((draft?.selectedValues.length ?? 0) > 0 || (draft?.customAnswer.trim().length ?? 0) > 0) return drafts;
    const focusedOption = currentQuestion.options[focusSlot];
    return focusedOption ? applyAnswerSelection(drafts, currentQuestion, focusedOption.value) : drafts;
  }, [focusSlot, currentQuestion, drafts]);
  const goPrevious = React.useCallback(() => {
    notifyInteraction(`navigation`);
    const previousIndex = Math.max(questionIndex - 1, 0);
    setQuestionIndex(previousIndex);
    const restoredFocus = focusIndexForQuestion(questions[previousIndex], drafts);
    setFocusSlot(isPlanApproval && restoredFocus < 0 ? 0 : restoredFocus);
  }, [drafts, questionIndex, questions, notifyInteraction, isPlanApproval]);
  const submitAll = React.useCallback(() => {
    notifyInteraction(`answer`);
    submitAnswers(drafts);
  }, [drafts, notifyInteraction, submitAnswers]);
  const decline = React.useCallback(() => {
    notifyInteraction(`answer`);
    onRespond(request.requestId, `decline`);
  }, [onRespond, notifyInteraction, request.requestId]);
  const handlePreviousButton = React.useCallback(() => {
    if (questions.length !== 0) goPrevious();
  }, [goPrevious, questions.length]);
  const handleNextButton = React.useCallback(() => {
    if (questions.length === 0 || questionIndex >= questions.length - 1) return;
    notifyInteraction(`navigation`);
    const effective = effectiveDraftForAdvance();
    if (effective !== drafts) setDrafts(effective);
    advance(effective);
  }, [advance, drafts, effectiveDraftForAdvance, questionIndex, questions.length, notifyInteraction]);
  const handlePrimaryAdvance = React.useCallback(() => {
    if (isPlanApproval && currentQuestion && collectQuestionAnswers(currentQuestion, drafts).length === 0) {
      const approveOption = currentQuestion.options.find((option) => option.value === PLAN_APPROVAL_OPTION_VALUE);
      if (approveOption) {
        selectOption(currentQuestion, approveOption.value);
        return;
      }
    }
    notifyInteraction(`navigation`);
    const effective = effectiveDraftForAdvance();
    if (effective !== drafts) setDrafts(effective);
    advance(effective);
  }, [advance, currentQuestion, drafts, effectiveDraftForAdvance, isPlanApproval, notifyInteraction, selectOption]);
  const cycleFocus = React.useCallback(
    (delta: number) => {
      const slotCount = optionFocusSlotCount(currentQuestion);
      if (slotCount === 0) return;
      notifyInteraction(`navigation`);
      setFocusSlot((previous) => (previous < 0 ? (delta > 0 ? 0 : slotCount - 1) : (previous + delta + slotCount) % slotCount));
    },
    [currentQuestion, notifyInteraction],
  );
  const handleOptionKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!currentQuestion) return;
      switch (event.key) {
        case `ArrowUp`:
        case `ArrowLeft`:
          event.preventDefault();
          cycleFocus(-1);
          return;
        case `ArrowDown`:
        case `ArrowRight`:
        case `Tab`:
          event.preventDefault();
          cycleFocus(event.shiftKey ? -1 : 1);
          return;
        case ` `:
          event.preventDefault();
          if (focusSlot < 0) return;
          if (focusSlot < currentQuestion.options.length) {
            const option = currentQuestion.options[focusSlot];
            if (option) selectOption(currentQuestion, option.value);
          } else {
            customInputRef.current?.focus();
          }
          return;
        case `Enter`:
          event.preventDefault();
          if (focusSlot < 0) return;
          if (currentQuestion.multiSelect) {
            handlePrimaryAdvance();
          } else if (focusSlot < currentQuestion.options.length) {
            const option = currentQuestion.options[focusSlot];
            if (option) selectOption(currentQuestion, option.value);
          } else {
            customInputRef.current?.focus();
          }
          return;
        case `Escape`:
          event.preventDefault();
          if (!isPlanApproval && questionIndex > 0) {
            goPrevious();
            return;
          }
          decline();
          return;
        default:
          return;
      }
    },
    [focusSlot, handlePrimaryAdvance, currentQuestion, decline, goPrevious, isPlanApproval, cycleFocus, questionIndex, selectOption],
  );
  const handleCustomInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();
      const action = mapElicitationKeyDown({
        key: event.key,
        advanceKind: advanceKindForQuestion(questions, questionIndex),
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        compositionActive: compositionActive.current,
        nativeEvent: event.nativeEvent,
        isPlanApproval,
        hasPreviousQuestion: questionIndex > 0,
      });
      if (action) notifyInteraction(`navigation`);
      if (action === `advance`) {
        event.preventDefault();
        if (advanceKindForQuestion(questions, questionIndex) === `next`) advance(drafts);
        return;
      }
      if (action === `submit`) {
        event.preventDefault();
        submitAll();
        return;
      }
      if (action === `previous`) {
        event.preventDefault();
        goPrevious();
        return;
      }
      if (action === `dismiss`) {
        event.preventDefault();
        decline();
      }
    },
    [advance, decline, drafts, goPrevious, isPlanApproval, questionIndex, questions, notifyInteraction, submitAll],
  );
  const renderOption = (question: ElicitationQuestion, option: { value: string; label: string; description?: string }, index: number) => {
    const selected = currentDraft?.selectedValues.includes(option.value) === true;
    const focused = focusSlot >= 0 && focusSlot === index;
    const label = isPlanApproval && option.value === PLAN_APPROVAL_OPTION_VALUE ? intl.formatMessage({ id: `chat.elicitation.planApproval.approve` }) : option.label;
    const description =
      isPlanApproval && option.value === PLAN_APPROVAL_OPTION_VALUE ? intl.formatMessage({ id: `chat.elicitation.planApproval.approveDescription` }) : option.description;
    return (
      <button
        key={option.value}
        ref={(element) => {
          optionElementRefs.current[index] = element;
        }}
        type="button"
        role={question.multiSelect ? `checkbox` : `option`}
        aria-selected={question.multiSelect ? undefined : selected}
        aria-checked={question.multiSelect ? selected : undefined}
        tabIndex={focused || (focusSlot < 0 && index === 0) ? 0 : -1}
        onClick={() => selectOption(question, option.value)}
        onFocus={() => setFocusSlot(index)}
        onKeyDown={handleOptionKeyDown}
        className={cn(`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:bg-hover`, selected ? `bg-selected` : focused ? `bg-hover` : `hover:bg-hover`)}
      >
        {question.multiSelect ? (
          <span className={cn(`flex size-4 shrink-0 items-center justify-center rounded-sm border`, selected ? `border-brand bg-brand text-foreground-inverse` : `border-border text-transparent`)}>
            <IconCheck className="size-3" />
          </span>
        ) : (
          <span className={cn(`w-5 shrink-0 self-center text-ui-base font-medium`, selected ? `text-foreground` : `text-foreground-subtlest`)}>
            {index + 1}
            {`.`}
          </span>
        )}
        <span className="min-w-0 flex-1 text-ui-base leading-5">
          <span className="text-ui-base font-medium leading-5 text-foreground">{label}</span>
          {description ? <span className="ml-2 text-ui-base leading-5 text-foreground-subtle">{description}</span> : null}
        </span>
      </button>
    );
  };
  const renderCustomInput = (question: ElicitationQuestion, index: number) => {
    const hasCustom = (currentDraft?.customAnswer.trim().length ?? 0) > 0;
    const focused = focusSlot >= 0 && focusSlot === index;
    const planSingle = isPlanApproval && !question.multiSelect;
    return (
      <div
        key={`custom-input`}
        role={question.multiSelect ? `checkbox` : undefined}
        aria-checked={question.multiSelect ? hasCustom : undefined}
        onClick={(event) => {
          if (event.target !== customInputRef.current) customInputRef.current?.focus();
        }}
        className={cn(`flex w-full cursor-text items-center gap-3 rounded-xl px-3 py-2 transition-colors`, hasCustom ? `bg-selected` : focused ? `bg-hover` : `hover:bg-hover`)}
      >
        {question.multiSelect ? (
          <span className={cn(`flex size-4 shrink-0 items-center justify-center rounded-sm border`, hasCustom ? `border-brand bg-brand text-foreground-inverse` : `border-border text-transparent`)}>
            <IconCheck className="size-3" />
          </span>
        ) : planSingle ? (
          <span aria-hidden="true" className="w-5 shrink-0" />
        ) : (
          <span className={cn(`w-5 shrink-0 self-center text-ui-base font-medium`, hasCustom ? `text-foreground` : `text-foreground-subtlest`)}>
            {index + 1}
            {`.`}
          </span>
        )}
        <Input
          ref={customInputRef}
          size="lg"
          value={currentDraft?.customAnswer ?? ``}
          placeholder={intl.formatMessage({ id: `chat.elicitation.customAnswer.placeholder` })}
          onFocus={() => setFocusSlot(index)}
          onChange={(event) => handleCustomAnswerChange(question, event.target.value)}
          onCompositionStart={() => {
            compositionActive.current = true;
          }}
          onCompositionEnd={() => {
            compositionActive.current = false;
          }}
          onKeyDown={handleCustomInputKeyDown}
          className="h-5 rounded-none border-transparent bg-transparent px-0 py-0 text-ui-base font-medium shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:bg-transparent"
        />
      </div>
    );
  };
  const hasPrevious = questions.length > 0 && questionIndex > 0;
  const hasNext = questions.length > 0 && questionIndex < questions.length - 1;
  const handleContainerKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (focusSlot >= 0) return;
      switch (event.key) {
        case `ArrowDown`:
          event.preventDefault();
          cycleFocus(1);
          return;
        case `ArrowUp`:
          event.preventDefault();
          cycleFocus(-1);
          return;
        case `Tab`:
          event.preventDefault();
          cycleFocus(event.shiftKey ? -1 : 1);
          return;
        case `Enter`:
          event.preventDefault();
          handlePrimaryAdvance();
          return;
        case `Escape`:
          event.preventDefault();
          if (!isPlanApproval && questionIndex > 0) {
            goPrevious();
          } else {
            decline();
          }
          return;
        default:
          return;
      }
    },
    [focusSlot, cycleFocus, handlePrimaryAdvance, isPlanApproval, questionIndex, goPrevious, decline],
  );
  const primaryLabelId = questions.length === 0 || questionIndex >= questions.length - 1 ? `chat.elicitation.submit` : `chat.elicitation.continue`;
  const titleBadge = isPlanApproval ? intl.formatMessage({ id: `chat.permission.title` }) : currentQuestion?.header;
  const questionText = isPlanApproval
    ? intl.formatMessage({ id: `chat.permission.switchMode.placeholder` })
    : currentQuestion?.question ?? intl.formatMessage({ id: `chat.elicitation.title` });
  const isLongQuestion = questionText.length > 80 || questionText.includes(`\n`);
  const collapseQuestionLabel = intl.formatMessage({ id: questionCollapsed ? `chat.elicitation.collapseQuestion` : `chat.elicitation.expandQuestion` });
  const collapseDialogLabel = intl.formatMessage({ id: dialogExpanded ? `chat.elicitation.collapseDialog` : `chat.elicitation.expandDialog` });
  const stopCountdownLabel = intl.formatMessage({ id: `taskList.stopCountdown` });
  const countdownButton =
    countdownSeconds === null ? null : (
      <Button
        type="button"
        size="xs"
        variant="secondary"
        data-elicitation-countdown-seconds={countdownSeconds}
        aria-label={stopCountdownLabel}
        title={stopCountdownLabel}
        onClick={() => notifyInteraction(`countdown`)}
        className="min-w-10 px-1.5 tabular-nums text-foreground-subtle"
      >
        {intl.formatMessage({ id: `chat.elicitation.countdownSeconds` }, { seconds: String(countdownSeconds) })}
      </Button>
    );
  return (
    <div className="w-full shrink-0">
      <div
        ref={containerRef}
        tabIndex={focusSlot < 0 ? 0 : -1}
        data-elicitation-dialog-card="true"
        className="relative z-1 flex w-full max-h-[min(72dvh,42rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xs outline-none"
        onMouseEnter={() => notifyInteraction(`panelHover`)}
        onKeyDown={handleContainerKeyDown}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <div data-elicitation-dialog-body="true" className={cn(`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1`, dialogExpanded ? undefined : `max-md:hidden`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-ui-base font-medium leading-5">
                <InteractionOriginBadge origin={request.origin} className={`mr-2`} />
                {titleBadge ? (
                  <Badge variant={`outline`} className={`mr-2 max-w-40 align-baseline text-ui-base truncate`}>
                    {titleBadge}
                  </Badge>
                ) : null}
                <span title={questionText} className={cn(`whitespace-pre-wrap break-words leading-6 text-foreground`, isLongQuestion && !questionCollapsed ? `max-md:line-clamp-4` : undefined)}>
                  {questionText}
                </span>
                {isLongQuestion ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-expanded={questionCollapsed}
                    aria-label={collapseQuestionLabel}
                    title={collapseQuestionLabel}
                    onClick={() => setQuestionCollapsed((previous) => !previous)}
                    className="mt-2 hidden max-md:inline-flex"
                  >
                    {questionCollapsed ? <IconChevronUp className="size-3" /> : <IconChevronDown className="size-3" />}
                    <span>{collapseQuestionLabel}</span>
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-1 text-ui-base font-medium leading-tight text-foreground-subtlest">
                {countdownButton}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-expanded={dialogExpanded}
                  aria-label={collapseDialogLabel}
                  title={collapseDialogLabel}
                  onClick={() => setDialogExpanded((previous) => !previous)}
                  className="hidden max-md:inline-flex"
                >
                  {dialogExpanded ? <IconChevronDown className="size-3" /> : <IconChevronUp className="size-3" />}
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!hasPrevious}
                  title={intl.formatMessage({ id: `chat.elicitation.previousQuestion` })}
                  aria-label={intl.formatMessage({ id: `chat.elicitation.previousQuestion` })}
                  onClick={handlePreviousButton}
                >
                  <IconChevronLeft className="size-3" />
                </Button>
                <span className="min-w-10 text-center">{`${Math.min(questionIndex + 1, Math.max(questions.length, 1))} / ${Math.max(questions.length, 1)}`}</span>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!hasNext}
                  title={intl.formatMessage({ id: `chat.elicitation.nextQuestion` })}
                  aria-label={intl.formatMessage({ id: `chat.elicitation.nextQuestion` })}
                  onClick={handleNextButton}
                >
                  <IconChevronRight className={`size-3`} />
                </Button>
              </div>
            </div>
            {currentQuestion ? (
              <div className="space-y-3">
                <div role={currentQuestion.multiSelect ? `group` : `listbox`} aria-label={questionText} className="space-y-1">
                  {currentQuestion.options.map((option, index) => renderOption(currentQuestion, option, index))}
                  {renderCustomInput(currentQuestion, currentQuestion.options.length)}
                </div>
              </div>
            ) : (
              <p className="px-1 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: `chat.elicitation.noQuestions` })}</p>
            )}
          </div>
          {dialogExpanded ? null : (
            <div className="hidden min-w-0 items-center justify-between gap-2 max-md:flex">
              <button
                type="button"
                onClick={() => setDialogExpanded(true)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left text-ui-base font-medium text-foreground hover:bg-hover"
              >
                {titleBadge ? (
                  <Badge variant={`outline`} className={`max-w-32 shrink-0 align-baseline text-ui-base truncate`}>
                    {titleBadge}
                  </Badge>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{questionText}</span>
              </button>
              {countdownButton}
              <span className="shrink-0 text-ui-base font-medium text-foreground-subtlest">{`${Math.min(questionIndex + 1, Math.max(questions.length, 1))} / ${Math.max(questions.length, 1)}`}</span>
              <Button type="button" size="icon-xs" variant="ghost" aria-expanded={dialogExpanded} aria-label={collapseDialogLabel} title={collapseDialogLabel} onClick={() => setDialogExpanded(true)}>
                <IconChevronUp className="size-3" />
              </Button>
            </div>
          )}
          <div data-elicitation-dialog-footer="true" className={cn(`flex shrink-0 items-center justify-between gap-2 px-1 max-sm:flex-wrap`, dialogExpanded ? undefined : `max-md:hidden`)}>
            <p className="flex min-w-0 flex-1 items-center gap-2 text-ui-base text-foreground-subtle max-sm:basis-full">
              <IconInfo className={`size-4 shrink-0 text-foreground`} />
              <span className="min-w-0">{intl.formatMessage({ id: `chat.elicitation.keyboardHint` })}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" size="lg" variant="outline" onClick={decline}>
                {intl.formatMessage({ id: `chat.elicitation.dismiss` })}
              </Button>
              <Button type="button" size="lg" onClick={questions.length === 0 ? submitAll : handlePrimaryAdvance} className="bg-brand text-foreground-inverse hover:bg-brand/80">
                {intl.formatMessage({ id: primaryLabelId })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* 〔A0-S4-4b〕补导出块：原经 ConversationOverlays.tsx §6 导出块对外，迁出后于属主文件本地导出（体不动）。 */
export {
  ElicitationDialog,
  ElicitationDialogKeyed,
  normalizeElicitationQuestions,
  isPlanApprovalRequest,
  buildElicitationAnswerPayload,
};
