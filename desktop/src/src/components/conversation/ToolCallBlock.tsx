// A0-S4-4b: 自 modules/Conversation.tsx §4 ToolBlock 子族（工具折叠块 + ToolLayout + Reasoning 三件 + ShellToolView）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §4 全段（910–2128，含内联 declare 15 件）。导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Check as IconCheck, Copy as IconCopy, SquareTerminal as IconSquareTerminal, Lightbulb as IconLightbulb } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../modules/ImeComposition'; // 原 ImeComposition 导出族
import { AgentToolView, AskUserQuestionToolView, AutomationToolView, ExploreToolView, FallbackToolView, FileReadToolView, FileWriteToolView, GoalToolView, NodeReplToolView, PlanGuidanceToolView, RespondToCoordinatorToolView, SearchToolView, SendMessageToolView, SessionContextToolView, SkillToolView, SwitchModeToolView, TaskControlToolView, TaskOutputToolView, TodoToolView, type FileSummary, type OpenCodeViewerFn, type ToolCall, type ToolCallNode, type ToolCallViewProps, type ToolDisplayModel } from '../../modules/ConversationLeaves'; // 18 工具视图 + 会话流共享类型 canonical（A0-D 类型收敛；〔A1-P1-B14〕message 族 aht/uht 二视图入册）
import { type CodePreviewSettings, type FileLinkModel } from '../../modules/MarkdownIntegration'; // A0-D 类型收敛
import { useControllableState } from '../../modules/UsageStatsUiParts'; // 原 fa（A0-CLEANUP2 item 47 接线）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 t 导出（A0-D 接线）；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../modules/Conversation'; // 〔A0-S4-4b〕§1 共享原语留守面，属主补 export 后取回（函数声明提升，渲染期访问，环安全）
import { normalizeToolCallStatus, extractToolErrorText } from './ToolStatusModel'; // 〔A1-P1-B11〕状态/错误文案域实体化收敛（styles 99553–99618 + 99630–99640 逐字；TOOL_STATUS_DISPLAY_MAP/unwrapToolUseError/resolveInlinePreview 同叶在案）
import { extractMcpToolInfo } from './McpToolBlocks'; // 〔A1-P1-B11〕分派点 automation 判定（束 109117：Vmt 真身）
import { hasRawShellOutput, summarizeShellCommand, resolveShellExecution, extractShellOutput, SHELL_TOOL_ICON } from './ShellCommandBlocks'; // 〔A1-P1-B11〕shell 四 declare + SHELL_TOOL_ICON 实体化收敛（styles 105186–105313 逐字）
import {
  TOOL_CHILD_INDENT_CLASS, STREAMING_ENTRANCE_CACHE_LIMIT, STREAMING_ENTRANCE_DURATION_MS, streamingEntranceSeenCache,
  pruneStreamingEntranceCache, normalizeStreamingEntranceKey, hasSeenStreamingEntrance, markStreamingEntranceSeen,
  shouldPlayStreamingEntrance,
} from './ToolCardAnimation'; // 〔A1-P1-B11〕入场动画缓存域实体化收敛（styles 109084–109110 逐字）
import { ToolSnapshotRefs } from './ToolSnapshotRefs'; // 〔A1-P1-B12〕快照引用加载器实体化收敛（styles 99954–100009 逐字；钥匙 1/2）
import { ToolLayoutMemo as ToolLayout } from './ToolLayoutBlocks'; // 〔A1-P1-B12〕ToolLayout 折叠壳族实体化收敛（styles 100010–100465 逐字；钥匙 2/2；displayName 真身保留）
import { EMPTY_SCROLL_MASK, computeScrollMask, scrollMaskStyle } from './ToolScrollMask'; // 〔A1-P1-B12〕滚动遮罩域实体化收敛（styles 64639–64657 逐字）
import { isPendingToolCallStatus, resolveToolCallStatusI18nId } from '../../modules/SrcSharedB'; // 〔A1-P1-B12〕原 $ne/Tee（MS/NS@src-HCld2afU.js 9141/9144）跨 chunk 定位取证 → src 域 canonical 真实 import

/** 工具分类（原 og，js 23084 / jsx 19826；family 枚举按 Wht 分派归纳）——§0 declare 分配：唯一消费（§4）随迁 */
type ToolFamily =
  | "plan-guidance"
  | "agent"
  | "todo"
  | "ask-user-question"
  | "message"
  | "task-control"
  | "skill"
  | "session-context"
  | "file-read"
  | "file-write"
  | "explore"
  | "switch-mode"
  | "search"
  | "shell"
  | "goal"
  | "node-repl"
  | "automation"
  | "fallback";
declare function classifyToolCall(toolCall: { toolName?: string; kind?: string }): { family: ToolFamily };

/* ============================================================================
 * 4. ToolBlock 子族（工具折叠块；spec §6「工具行：▶ ✓ 名称: 摘要」）
 *    状态/错误/显示模型：js 99513–99696 / jsx 85879–86153
 *    ToolLayout：js 100000–100417 / jsx 86327–86605
 *    ToolCallBlock + 16 种工具视图：js 104622–109242 / jsx 90046–93275
 * ==========================================================================*/

/* ── tombstone〔A1-P1-B11〕：TOOL_STATUS_DISPLAY_MAP declare（原 zlt 消费面）+ 三截断手写本地
 * （normalizeToolCallStatus=zlt / unwrapToolUseError=nQ+Blt / extractToolErrorText=rQ 截断副本）+
 * 未接线手写 resolveInlinePreview=iQ 删除——逐字实体化 → ./ToolStatusModel（styles 99553–99618 +
 * 99630–99640；roundtrip EXACT，/tmp/a1r0-p1/p11/）。rQ 真身补全 raw.rawOutput/raw.status/raw.content[]
 * 各级检查（截断副本所无）。消费面改文件头真实 import，调用面逐字不变。 ── */

/* ── tombstone（A0-D 类型收敛）：本地 ToolDisplayModel 已删除，canonical =
 *    ConversationLeaves 导出（索引签名容宽型），经文件头 type import 消费。 ── */
declare function resolveToolDisplayModel(toolCall: ToolCall, workspacePath?: string): ToolDisplayModel;

/** 原 _g（js 23686）：从工具输入/输出抽取文件摘要列表（供展开区渲染） */
declare function extractRawFileSummaries(raw: unknown, toolCall: ToolCall): FileSummary[];

/** 原 qZ（js 98044 / jsx 85024）：ExitPlanMode 结果 → markdown（供复制文本合并） */
declare function buildPlanResultMarkdown(toolCall: ToolCall, fallback: string): { markdown: string };

/* ── tombstone〔A1-P1-B12〕：§4.1 ToolLayout 头部/摘要件手写全族删除（ToolLayoutProps 接口 + ToolLayoutAnimatedText（原 aut）
 * + ToolLayoutSummaryPrefix（sut）+ ToolLayoutSummaryContent（cut）+ activateOnEnterOrSpace（out）+ ToolLayoutHeader（lut）
 * + toolLayoutOpenStateStore/TOOL_LAYOUT_COLLAPSE_DELAY_MS/TOOL_LAYOUT_CONTENT_TEXT_CLASS/TOOL_LAYOUT_CONTENT_PAD_CLASS
 * 四常量（cQ/uut/dut/fut）+ ToolLayoutImpl（put）+ memo 导出（lQ），共约 431 行）——逐字实体化 → ./ToolLayoutBlocks
 * （styles 100010–100465，456 行；roundtrip+leafcheck 双 EXACT，/tmp/a1r0-p1/p12/）。消费面：文件头真实 import
 * （ToolLayoutMemo as ToolLayout），尾导出块 re-export 不动，modules/Conversation §4 转导出链与 CTV 消费面零改动。
 * 束真身更正三处（手写体差异披露）：① testid 构造 qr=Nb@src:8464 `${e}-${t}` 连字符（手写误用冒号）；
 * ② Bi=Zg@src:8266=`tool-summary-trigger`，三态分支同前缀（手写 canToggle/纯展示分支误作 tool-summary-toggle）；
 * ③ aut 真身含 framer-motion 队列动画（$K@74135/gq@75493 vendored，declare 面只消费；手写为简化淡入）。
 * 语义名沿用手写期命名（消费面零改动）；型缝 21 处（17 S16 + 4 S16T）见 p12/ToolLayoutBlocks.seam-log.txt。 ── */

/* --- 4.2 Reasoning 折叠（思考/摘要；原 z_t/B_t/V_t，js 111329–111571 / jsx 95033–95212） --- */

interface ReasoningContextValue {
  duration: number | undefined;
  isOpen: boolean;
  isStreaming: boolean;
  setIsOpen: (open: boolean) => void;
  shouldRenderContent: boolean;
}
/** 原 j_t（jsx 95007） */
const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);
/** 原 M_t（jsx 95008）：必须在 Reasoning 内使用 */
function useReasoning(): ReasoningContextValue {
  const value = React.useContext(ReasoningContext);
  if (!value) throw new Error(`Reasoning components must be used within Reasoning`);
  return value;
}
const REASONING_DURATION_UNIT_MS = 1e3; // N_t
const REASONING_COLLAPSE_ANIMATION_MS = 300; // P_t
const REASONING_BOTTOM_EPSILON_PX = 2; // F_t

/** 原 I_t（jsx 95016）：autoCollapseKey 变化且用户未手动操作 → 自动收起 */
function shouldAutoCollapseReasoning({
  autoCollapseKey,
  previousAutoCollapseKey,
  userInteracted,
}: {
  autoCollapseKey: string | null;
  previousAutoCollapseKey: string | null;
  userInteracted: boolean;
}): boolean {
  return autoCollapseKey != null && autoCollapseKey !== previousAutoCollapseKey && !userInteracted;
}
/** 原 L_t/R_t（jsx 95019/95027）：距底部距离 / 是否贴底 */
function reasoningDistanceFromBottom(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): number {
  return Math.max(0, metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop);
}
function isReasoningAtBottom(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): boolean {
  return reasoningDistanceFromBottom(metrics) <= REASONING_BOTTOM_EPSILON_PX;
}

/* A0-CLEANUP2 item 47：useControllableState declare 删除 → import { useControllableState } from './UsageStatsUiParts'（原 fa = dist-DJJArJ7D.js p 导出，属主 export declare 登记）。 */

/**
 * Reasoning 根（原 z_t，js 111329 / jsx 95033，displayName=`Reasoning`）。
 * 流式计时（isStreaming 期间累计秒数 → duration）、受控/非受控开合、
 * autoCollapseKey 变化自动收起（如：状态 running→complete）。
 */
const Reasoning = React.memo(function Reasoning({
  className,
  isStreaming = false,
  autoCollapseKey = null,
  open,
  defaultOpen = false,
  onOpenChange,
  duration,
  children,
  ...rest
}: Omit<React.ComponentPropsWithoutRef<typeof Collapsible>, "open" | "onOpenChange"> & {
  isStreaming?: boolean;
  autoCollapseKey?: string | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}) {
  const isControlled = open !== undefined;
  const [isOpen, setIsOpenRaw] = useControllableState({ defaultProp: defaultOpen, prop: open, onChange: onOpenChange });
  const [resolvedDuration, setResolvedDuration] = useControllableState<number | undefined>({ defaultProp: undefined, prop: duration });
  const streamingStartedAt = React.useRef<number | null>(null);
  const collapseTimer = React.useRef<number | null>(null);
  const userInteracted = React.useRef(false);
  const previousAutoCollapseKey = React.useRef<string | null>(null);
  const [shouldRenderContent, setShouldRenderContent] = React.useState(() => isOpen);
  const setIsOpen = React.useCallback(
    (next: boolean) => {
      userInteracted.current = true;
      if (next) setShouldRenderContent(true);
      setIsOpenRaw(next);
    },
    [setIsOpenRaw],
  );
  React.useEffect(() => {
    if (isStreaming) {
      if (streamingStartedAt.current === null) streamingStartedAt.current = Date.now();
    } else if (streamingStartedAt.current !== null) {
      setResolvedDuration(Math.ceil((Date.now() - streamingStartedAt.current) / REASONING_DURATION_UNIT_MS));
      streamingStartedAt.current = null;
    }
  }, [isStreaming, setResolvedDuration]);
  React.useEffect(() => {
    const previous = previousAutoCollapseKey.current;
    previousAutoCollapseKey.current = autoCollapseKey;
    if (!isControlled && shouldAutoCollapseReasoning({ autoCollapseKey, previousAutoCollapseKey: previous, userInteracted: userInteracted.current })) {
      setIsOpenRaw(false);
    }
  }, [autoCollapseKey, isControlled, setIsOpenRaw]);
  React.useEffect(() => {
    if (isOpen) {
      if (collapseTimer.current !== null) {
        window.clearTimeout(collapseTimer.current);
        collapseTimer.current = null;
      }
      setShouldRenderContent(true);
      return;
    }
    if (shouldRenderContent) {
      collapseTimer.current = window.setTimeout(() => {
        setShouldRenderContent(false);
        collapseTimer.current = null;
      }, REASONING_COLLAPSE_ANIMATION_MS);
      return () => {
        if (collapseTimer.current !== null) {
          window.clearTimeout(collapseTimer.current);
          collapseTimer.current = null;
        }
      };
    }
    return undefined;
  }, [isOpen, shouldRenderContent]);
  React.useEffect(
    () => () => {
      if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
    },
    [],
  );
  const contextValue = React.useMemo(
    () => ({ duration: resolvedDuration, isOpen, isStreaming, setIsOpen, shouldRenderContent }),
    [resolvedDuration, isOpen, isStreaming, setIsOpen, shouldRenderContent],
  );
  return (
    <ReasoningContext.Provider value={contextValue}>
      <Collapsible className={cn(`not-prose flex flex-col`, className)} onOpenChange={setIsOpen} open={isOpen} {...rest}>
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
});

/**
 * Reasoning 触发器（原 B_t，js 111405 / jsx 95083，displayName=`ReasoningTrigger`）。
 * 文案三态：流式中「正在思考」（渐变动画字）/ 已结束有时长「已思考 · N 秒」/ 无时长「已思考 · 几秒」。
 * chat.reasoning.thinking / thought / durationSeconds / durationFewSeconds
 */
const ReasoningTrigger = React.memo(function ReasoningTrigger({
  className,
  children,
  getThinkingMessage,
  ...rest
}: React.ComponentPropsWithoutRef<typeof CollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration: number | undefined) => React.ReactNode;
}) {
  const { isStreaming, isOpen, duration } = useReasoning();
  const { intl } = useIntlContext();
  const label =
    getThinkingMessage?.(isStreaming, duration) ??
    (isStreaming || duration === 0 ? (
      <span className="animated-gradient-text font-medium">{intl.formatMessage({ id: `chat.reasoning.thinking` })}</span>
    ) : duration === undefined ? (
      <>
        <span className="font-medium text-foreground-subtlest">{intl.formatMessage({ id: `chat.reasoning.thought` })}</span>
        <span className="font text-foreground-subtlest">{` `}{intl.formatMessage({ id: `chat.reasoning.durationFewSeconds` })}</span>
      </>
    ) : (
      <>
        <span className="font-medium text-foreground-subtlest">{intl.formatMessage({ id: `chat.reasoning.thought` })}</span>
        <span className="font text-foreground-subtlest">
          {` `}{intl.formatMessage({ id: `chat.reasoning.durationSeconds` }, { seconds: String(duration) })}
        </span>
      </>
    ));
  return (
    <CollapsibleTrigger
      data-testid="v4-reasoning-trigger"
      className={cn(`group/reasoning inline-flex max-w-full items-center gap-2 self-start text-ui-base transition-colors`, className)}
      {...rest}
    >
      {children ?? (
        <>
          <IconLightbulb className="size-4 shrink-0 text-foreground-subtlest" />
          {label}
          <IconChevronRight
            className={cn(
              `size-4 text-foreground-subtlest transition-opacity transition-transform`,
              isOpen ? `rotate-90 opacity-100` : `rotate-0 opacity-0 group-hover/reasoning:opacity-100`,
            )}
          />
        </>
      )}
    </CollapsibleTrigger>
  );
});

/** 滚动遮罩状态（原 yV/bV/xV，styles 64639–64657）：顶部/底部渐隐指示——〔A1-P1-B12〕运行体已逐字实体化 →
 * ./ToolScrollMask；接口为类型面遗留（JS 束无类型），留供 ReasoningContent 状态注记。 */
interface ScrollMaskState {
  showTop: boolean;
  showBottom: boolean;
}
/* ── tombstone〔A1-P1-B12〕：EMPTY_SCROLL_MASK 手写 const（yV 重复体）+ computeScrollMask/scrollMaskStyle 双 declare
 * （原 bV/xV）删除——逐字实体化 → ./ToolScrollMask（styles 64639–64657；roundtrip+leafcheck 双 EXACT，
 * /tmp/a1r0-p1/p12/）。消费面改文件头真实 import，调用面逐字不变。 ── */

/**
 * Reasoning 内容（原 V_t，js 111471 / jsx 95122，displayName=`ReasoningContent`）。
 * max-h-60 滚动区 + 左竖线（ml-2 border-l pl-3.5）+ 贴底跟随（流式时自动滚到底）+
 * 顶/底渐遮罩（data-reasoning-scroll-mask=none|top|bottom|both）。
 */
const ReasoningContent = React.memo(function ReasoningContent({
  className,
  children,
  forceMount,
  ...rest
}: React.ComponentPropsWithoutRef<typeof CollapsibleContent> & { forceMount?: boolean }) {
  const { isOpen, shouldRenderContent } = useReasoning();
  const mounted = isOpen || shouldRenderContent || !!forceMount;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const stickToBottom = React.useRef(true);
  const [mask, setMask] = React.useState<ScrollMaskState>(EMPTY_SCROLL_MASK);
  const refreshMask = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setMask(EMPTY_SCROLL_MASK);
      return;
    }
    setMask(computeScrollMask({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop }));
  }, []);
  const scrollToBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      refreshMask();
    }
  }, [refreshMask]);
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      stickToBottom.current = isReasoningAtBottom({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop });
      refreshMask();
    }
  }, [refreshMask]);
  React.useEffect(() => {
    if (!mounted) {
      stickToBottom.current = true;
      setMask(EMPTY_SCROLL_MASK);
      return;
    }
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver > `u`) {
      stickToBottom.current ? scrollToBottom() : refreshMask();
      return;
    }
    const update = () => {
      if (stickToBottom.current) {
        scrollToBottom();
        return;
      }
      refreshMask();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (innerRef.current) observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [scrollToBottom, mounted, refreshMask]);
  React.useEffect(() => {
    if (mounted) {
      if (stickToBottom.current) {
        scrollToBottom();
        return;
      }
      refreshMask();
    }
  }, [children, scrollToBottom, refreshMask, mounted]);
  const maskStyle = scrollMaskStyle(mask);
  const maskSide = mask.showTop && mask.showBottom ? `both` : mask.showTop ? `top` : mask.showBottom ? `bottom` : `none`;
  return (
    <CollapsibleContent data-reasoning-content={`true`} data-testid="v4-reasoning-content" forceMount={forceMount} className={className} {...rest}>
      {mounted ? (
        <div className="pt-3">
          <div
            ref={scrollRef}
            className="ml-2 max-h-60 space-y-2 overflow-auto border-border border-l pl-3.5 text-ui-base text-foreground-subtlest"
            data-reasoning-scroll-mask={maskSide}
            onScroll={handleScroll}
            style={maskStyle}
          >
            <div ref={innerRef} className="min-w-0 whitespace-pre-wrap break-words text-foreground-subtlest">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </CollapsibleContent>
  );
});

/* --- 4.3 ToolCallBlock 与工具视图分派（原 Ght/K$/Wht，js 109066–109242 / jsx 93114–93275） --- */

/* ── tombstone〔A1-P1-B11〕：入场动画缓存域九件手写体（Fht/Iht/Lht/G$/Rht/zht/Bht/Vht/Hht）删除——
 * 逐字实体化 → ./ToolCardAnimation（styles 109084–109110；roundtrip EXACT，/tmp/a1r0-p1/p11/）。
 * 语义名全同（手写期即按束真身命名），消费面改文件头真实 import，调用面逐字不变。 ── */
/** 原 Uht（jsx 93135）：agent 家族工具（子代理）不参与嵌套缩进判定 */
function isAgentToolCall(toolCall: ToolCall): boolean {
  return classifyToolCall(toolCall).family === `agent`;
}

/* ── tombstone（A0-D 类型收敛）：本地 ToolCallViewProps（原 Ght I 对象）已删除，
 *    canonical = ConversationLeaves 导出，经文件头 type import 消费；
 *    ShellToolView declare 一并删除——本文件 §4.5 ShellToolViewImpl 即 canonical
 *    实体（尾部符号表以 ShellToolView 别名导出），分派点直接引用实现。 ── */
/* ── tombstone〔A1-P1-B11〕：isAutomationToolCall declare 删除——束真身 = Vmt@107496（= extractMcpToolInfo，
 *    逐字实体 ∈ ./McpToolBlocks）；分派点按束语义 `if (Vmt(e)) return Wmt`（styles 109117）改指。
 *    A0 归属注「107448」为 Lmt 束内行号误植，本批以切探真身更正。 ── */

/**
 * 原 Wht（js 109114 / jsx 93141）：按工具家族分派视图组件。
 * node-repl 与 automation 优先于家族表判定。
 */
function resolveToolCallView(props: ToolCallViewProps): React.FC<ToolCallViewProps> {
  const identity = classifyToolCall(props.toolCallNode.toolCall);
  if (identity.family === `node-repl`) return NodeReplToolView;
  if (extractMcpToolInfo(props)) return AutomationToolView; // 〔A1-P1-B11〕原 isAutomationToolCall declare 改指（束 109117：if (Vmt(e)) return Wmt）
  switch (identity.family) {
    case `plan-guidance`:
      return PlanGuidanceToolView; // 〔A1-P1-B15〕束真身 Wht@109119–109120 `case 'plan-guidance': return qmt`（更正：手写期误注「复用搜索类摘要视图」；qmt@107754 真身已实体化于 ./PlanToolBlocks，B14 留批第 2 项办结）
    case `agent`:
      return AgentToolView;
    case `todo`:
      return TodoToolView;
    case `ask-user-question`:
      return AskUserQuestionToolView;
    case `message`:
      return props.toolCallNode.toolCall.toolName === `RespondToCoordinator` ? RespondToCoordinatorToolView : SendMessageToolView; // 〔A1-P1-B14〕束真身 Wht@109128 `t.toolName === 'RespondToCoordinator' ? aht : uht`（B13 留批 1 更正；手写期 SessionContextToolView/FallbackToolView 为 A0 近似）
    case `task-control`:
      return props.toolCallNode.toolCall.toolName === `TaskOutput` ? TaskOutputToolView : TaskControlToolView;
    case `skill`:
      return SkillToolView;
    case `session-context`:
      return SessionContextToolView;
    case `file-read`:
      return FileReadToolView;
    case `file-write`:
      return FileWriteToolView;
    case `explore`:
      return ExploreToolView;
    case `switch-mode`:
      return SwitchModeToolView;
    case `search`:
      return SearchToolView;
    case `shell`:
      return ShellToolViewImpl; // A0-D：原 ShellToolView declare 已删，直接引用 §4.5 实现
    case `goal`:
      return GoalToolView;
    default:
      return FallbackToolView;
  }
}

/* ── tombstone〔A1-P1-B12〕：isToolCallRunningByDisplayStatus/toolCallStatusI18nId 双 declare（原 $ne/Tee）删除——
 * 跨 chunk 定位取证（正证据，推翻 B11「疑 dist」假设）：真身 = MS/NS@src-HCld2afU.js 9141/9144，
 * 经 src chunk 导出（10030 `MS as v` / 9856 `NS as _`）→ styles 导入（790 `v as $ne` / 620 `_ as Tee`）；
 * src 域 canonical 在案 → 真实 import 收敛（SrcSharedB isPendingToolCallStatus / resolveToolCallStatusI18nId），
 * 消费面（本文件 isRunning/statusLabel 两处）改指 canonical 名，语义逐字等值。 ── */
/* ── tombstone〔A1-P1-B12〕：normalizeToolCallStatusRaw declare 删除——束无对应实体（负证据）：zlt@99553 真身
 * `Rlt[e] ?? 'input-streaming'` 直表查询（ToolStatusModel 在案），状态链无 raw 归一化步骤；本 declare 为
 * A0 假设件，全仓零消费（grep 仅本处）。$ne/Tee 双 declare 同批另行收敛（真身 = MS/NS@src-HCld2afU.js 9141/9144，
 * 跨 chunk：src 10030/9856 导出 → styles 790/620 导入；src 域 canonical SrcSharedB 在案，见上方墓碑）。 ── */

/**
 * ToolCallBlock（原 Ght，js 109105 / jsx 93180；memo 名 K$，js 109241 / jsx 93274，
 * displayName=`ToolCallBlock`）。
 * 组装流程：状态归一化 → 显示模型 → 文件摘要 → 错误文案 → 子工具列表（递归）→
 * 家族视图分派。流式入场动画（data-zcode-tool-stream-animate）每张卡只播一次。
 */
function ToolCallBlockImpl({
  toolCallNode,
  depth = 0,
  workspacePath,
  theme,
  codePreviewSettings,
  showIcon = true,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenBrowserUrl,
  onOpenAutomationsMain,
  onOpenPlanDetail,
  onLoadFullToolCallFields,
  suppressSourceLabel = false,
  showTodoToolCalls = true,
  disableSummaryContentAnimation = false,
  agentSummaryAction,
  authoritativeAgentType,
  streamingEntranceActive = false,
  streamingEntranceKeyPrefix = `tool`,
}: {
  toolCallNode: ToolCallNode;
  depth?: number;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  showIcon?: boolean;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: (automationId: string) => void; // A0-D 类型收敛：与 Leaves ToolCallViewProps 同口径（bundle 传 automationId）
  onOpenPlanDetail?: (plan: unknown) => void;
  onLoadFullToolCallFields?: (toolId: string) => void;
  suppressSourceLabel?: boolean;
  showTodoToolCalls?: boolean;
  disableSummaryContentAnimation?: boolean;
  agentSummaryAction?: { [key: string]: unknown; ariaLabel?: string };
  authoritativeAgentType?: string;
  streamingEntranceActive?: boolean;
  streamingEntranceKeyPrefix?: string;
  /* A0-D：bundle 递归调用面透传的 I 对象冗余字段（实现内部自行重算，接收即忽略） */
  displayModel?: ToolDisplayModel;
  rawFileSummaries?: FileSummary[];
  isRunning?: boolean;
  statusLabel?: string;
  childToolList?: React.ReactNode;
  viewerSource?: unknown;
}) {
  const { toolCall, childToolCalls = [] } = toolCallNode; // A0-D：Leaves ToolCallNode 的 childToolCalls 可选，缺省空数组
  const { intl } = useIntlContext();
  const entranceKey = `${streamingEntranceKeyPrefix}:${toolCall.toolId}`;
  const [entranceActive, setEntranceActive] = React.useState(() => shouldPlayStreamingEntrance(entranceKey, streamingEntranceActive));
  React.useEffect(() => {
    if (!streamingEntranceActive || entranceActive) return;
    if (shouldPlayStreamingEntrance(entranceKey, streamingEntranceActive)) setEntranceActive(true);
  }, [entranceActive, streamingEntranceActive, entranceKey]);
  React.useEffect(() => {
    if (!entranceActive) return;
    const markTimer = window.setTimeout(() => {
      markStreamingEntranceSeen(entranceKey);
    }, 0);
    const stopTimer = window.setTimeout(() => {
      setEntranceActive(false);
    }, STREAMING_ENTRANCE_DURATION_MS);
    return () => {
      window.clearTimeout(markTimer);
      window.clearTimeout(stopTimer);
    };
  }, [entranceActive, entranceKey]);

  const identity = classifyToolCall(toolCall);
  const displayStatus = normalizeToolCallStatus(toolCall.status);
  const displayModel = React.useMemo(() => resolveToolDisplayModel(toolCall, workspacePath), [toolCall, workspacePath]);
  const rawFileSummaries = React.useMemo(
    () =>
      extractRawFileSummaries((toolCall as { raw?: unknown }).raw, {
        ...toolCall,
      }),
    [toolCall],
  );
  const isRunning = isPendingToolCallStatus(displayStatus); // 〔A1-P1-B12〕原 isToolCallRunningByDisplayStatus（$ne=MS@src:9141）→ SrcSharedB canonical
  const statusLabel = intl.formatMessage({ id: resolveToolCallStatusI18nId(displayStatus, toolCall.status) }); // 〔A1-P1-B12〕原 toolCallStatusI18nId（Tee=NS@src:9144）→ SrcSharedB canonical
  const errorText = extractToolErrorText(toolCall);
  const isNested = !isAgentToolCall(toolCall) && (depth > 0 || !!toolCall.parentToolUseId);
  const sourceLabel =
    !suppressSourceLabel && isNested ? intl.formatMessage({ id: `chat.toolCall.source.subAgent` }) : undefined;
  const childToolList = React.useMemo(
    () =>
      childToolCalls.length > 0 ? (
        <div className={TOOL_CHILD_INDENT_CLASS}>
          {childToolCalls.map((child) => (
            <ToolCallBlock
              key={child.toolCall.toolId}
              toolCallNode={child}
              depth={depth + 1}
              workspacePath={workspacePath}
              theme={theme}
              codePreviewSettings={codePreviewSettings}
              showIcon={showIcon}
              onOpenCodeViewer={onOpenCodeViewer}
              onOpenFileLink={onOpenFileLink}
              onOpenBrowserUrl={onOpenBrowserUrl}
              onOpenAutomationsMain={onOpenAutomationsMain}
              onOpenPlanDetail={onOpenPlanDetail}
              onLoadFullToolCallFields={onLoadFullToolCallFields}
              suppressSourceLabel={suppressSourceLabel}
              showTodoToolCalls={showTodoToolCalls}
              disableSummaryContentAnimation={disableSummaryContentAnimation}
              streamingEntranceActive={streamingEntranceActive}
              streamingEntranceKeyPrefix={streamingEntranceKeyPrefix}
            />
          ))}
        </div>
      ) : null,
    [
      childToolCalls,
      depth,
      onLoadFullToolCallFields,
      onOpenAutomationsMain,
      onOpenBrowserUrl,
      onOpenPlanDetail,
      onOpenFileLink,
      onOpenCodeViewer,
      showIcon,
      showTodoToolCalls,
      streamingEntranceActive,
      streamingEntranceKeyPrefix,
      suppressSourceLabel,
      theme,
      codePreviewSettings,
      workspacePath,
      disableSummaryContentAnimation,
    ],
  );
  const viewProps: ToolCallViewProps = React.useMemo(
    () => ({
      toolCallNode,
      workspacePath,
      theme,
      codePreviewSettings,
      displayModel,
      viewerSource: displayModel.viewerSource,
      rawFileSummaries,
      isRunning,
      statusLabel,
      sourceLabel,
      errorText,
      childToolList,
      showIcon,
      showTodoToolCalls,
      disableSummaryContentAnimation,
      agentSummaryAction,
      authoritativeAgentType,
      onOpenCodeViewer,
      onOpenFileLink,
      onOpenBrowserUrl,
      onOpenAutomationsMain,
      onOpenPlanDetail,
      onLoadFullToolCallFields,
    }),
    [
      agentSummaryAction,
      authoritativeAgentType,
      childToolList,
      codePreviewSettings,
      displayModel,
      disableSummaryContentAnimation,
      errorText,
      isRunning,
      onLoadFullToolCallFields,
      onOpenAutomationsMain,
      onOpenBrowserUrl,
      onOpenPlanDetail,
      onOpenFileLink,
      onOpenCodeViewer,
      rawFileSummaries,
      showIcon,
      showTodoToolCalls,
      sourceLabel,
      statusLabel,
      theme,
      toolCallNode,
      workspacePath,
    ],
  );
  const ToolView = React.useMemo(() => resolveToolCallView(viewProps), [viewProps]);
  if (!showTodoToolCalls && identity.family === `todo`) return null;
  return (
    <div
      className="w-full"
      data-testid={`v4-tool-call:${toolCall.toolId}`}
      data-tool-call-id={toolCall.toolId}
      data-tool-name={toolCall.toolName ?? toolCall.kind ?? ``}
      data-status={toolCall.status}
      data-zcode-tool-stream-animate={entranceActive ? `true` : undefined}
    >
      <ToolView {...viewProps} />
    </div>
  );
}
const ToolCallBlock = React.memo(ToolCallBlockImpl);
ToolCallBlock.displayName = `ToolCallBlock`;

/* --- 4.4 工具状态/错误助手登记（实现见行号） ---
 * zlt normalizeToolCallStatus      js 99513 / jsx 85879（Rlt 状态映射表）
 * nQ  unwrapToolUseError           jsx 85900
 * rQ  extractToolErrorText         js 99542 / jsx 85908
 * Glt resolveToolDisplayModel      js 99696 / jsx 86085（Wlt 规则表 js 99593 / jsx 85968）
 * og  classifyToolCall             js 23084 / jsx 19826（横切层，toolName/kind → family）
 * _g  extractRawFileSummaries      js 20269 / jsx 20269 附近（横切层）
 * qZ  buildPlanResultMarkdown      js 98044 / jsx 85024
 */

/* --- 4.5 ShellToolView（原 ept，js 105266 / jsx 90506）——代表性工具视图全量还原 ---
 * spec §6：工具行「▶ ✓ 名称: 摘要」折叠块，bash 显示命令前缀。
 * 摘要行 = 「执行中/执行了」+ 命令单行截断；展开 = $ 命令全文 + 输出（失败时错误优先）。
 * chat.toolCall.execute.running / ran / execute / noOutput
 */

/* ── tombstone〔A1-P1-B11〕：shell 四 declare（Qft/KQ/qQ/GQ）+ SHELL_TOOL_ICON 手写 const 删除——
 * 逐字实体化 → ./ShellCommandBlocks（styles 105186–105313；roundtrip EXACT，/tmp/a1r0-p1/p11/）。
 * SHELL_TOOL_ICON 真身 = Zft@105191（jsx(Uv)，Uv=Sa('square-terminal') styles 27866），图标同源不变。
 * 消费面改文件头真实 import，调用面逐字不变。 ── */

function ShellToolViewImpl(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const commandSummary = summarizeShellCommand(toolCall.input);
  const execution = resolveShellExecution(toolCall.input);
  const outputText = extractShellOutput(toolCall.output);
  const rawOutputText = hasRawShellOutput(toolCall.raw) ? extractShellOutput((toolCall.raw as { rawOutput?: unknown }).rawOutput) : null;
  const fallbackOutput = outputText ?? rawOutputText;
  const failureText = toolCall.status === `failed` ? errorText ?? fallbackOutput ?? undefined : undefined;
  const secondaryText = React.useMemo(() => <code className="truncate font-sans">{commandSummary}</code>, [commandSummary]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 mb-2 rounded-xl border border-border bg-panel px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-start gap-2 font-mono text-ui-base text-foreground">
            <span className="shrink-0 text-foreground-subtle">{`$`}</span>
            <pre className="min-w-0 flex-1 block max-h-15 overflow-over truncate whitespace-pre-wrap break-words">{execution.executionCommand}</pre>
          </div>
        </div>
        {failureText || fallbackOutput ? (
          <div className="space-y-1">
            <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">
              {failureText ?? fallbackOutput}
            </pre>
          </div>
        ) : !isRunning ? (
          <div className="space-y-1">
            <p className="font-mono text-ui-base text-foreground-subtle">{intl.formatMessage({ id: `chat.toolCall.execute.noOutput` })}</p>
          </div>
        ) : null}
      </div>
    ),
    [execution.executionCommand, failureText, intl, isRunning, fallbackOutput],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SHELL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen={true}
        kindLabel={
          props.kindLabelOverride ?? intl.formatMessage({ id: isRunning ? `chat.toolCall.execute.running` : `chat.toolCall.execute.ran` })
        }
        sourceLabel={props.sourceLabel}
        primaryText={commandSummary ? null : toolCall.title ?? toolCall.kind ?? intl.formatMessage({ id: `chat.toolCall.execute.execute` })}
        secondaryText={secondaryText}
        statusLabel={statusLabel}
        statusTooltip={failureText}
        showFailureStatus={toolCall.status === `failed`}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      {/* 快照引用脚注（原 sQ，jsx 86252）：snapshotRefs 存在时显示「加载完整字段」入口 */}
      {toolCall.snapshotRefs && toolCall.snapshotRefs.length > 0 ? (
        <ToolSnapshotRefs
          refs={toolCall.snapshotRefs}
          onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
        />
      ) : null}
    </>
  );
}
/* ── tombstone〔A1-P1-B12〕：ToolSnapshotRefs declare（原 sQ）删除——逐字实体化 → ./ToolSnapshotRefs
 * （styles 99954–100009；roundtrip+leafcheck 双 EXACT，/tmp/a1r0-p1/p12/）。
 * 消费面改文件头真实 import，调用面逐字不变。 ── */

/* --- 4.6 工具视图登记表（混淆名 → 语义名 → js / jsx 行；接口级，按需补全） ---
 * ept ShellToolView          105266 / 90506  ← 本文全量还原（§4.5）
 * opt FileReadToolView       105465 / 90648  chat.toolCall.read.*（读了/正在读 + 文件摘要）
 * Gft FileWriteToolView      104844 / 90186  chat.toolCall.write.*（写入/编辑 + diff 计数）
 * Spt ExploreToolView        105825 / 91001  chat.toolCall.explore.*（浏览目录）
 * upt SearchToolView         105569 / 90768  chat.toolCall.search.*（搜索 + 命中数）
 * Mht TodoToolView           108857 / 93007  chat.toolCall.todo.*（待办列表渲染，可整卡隐藏）
 * Pht AskUserQuestionToolView 108963 / 93067 chat.toolCall.askUserQuestion.*
 * Vpt AgentToolView          106243 / 91282  chat.toolCall.agent.*（子代理卡 + 摘要动作）
 * Hpt SwitchModeHint         （91360）       permission 切模式提示（覆盖层文件引用）
 * Dht TaskControlToolView    108728 / 92913  chat.toolCall.taskControl.*
 * Sht TaskOutputToolView     108581 / 92885  chat.toolCall.taskOutput.*
 * aht RespondToCoordinatorToolView 108091     chat.toolCall.respondToCoordinator.*（B14 实体化 → MessageToolBlocks）
 * uht SendMessageToolView    108195            chat.toolCall.sendMessage.*（B14 实体化 → MessageToolBlocks）
 * mht SkillToolView          108309 / 92648  chat.toolCall.skill.*
 * eht SessionContextToolView 107835 / 92387  chat.toolCall.sessionContext.*
 * ght SwitchModeToolView     108426 / 92791  chat.toolCall.switchMode.*
 * omt GoalToolView           106753 / 91596  chat.toolCall.goal.*（/goal 命令卡）
 * Nmt NodeReplToolView       107168 / 91902  chat.toolCall.nodeRepl.*
 * Wmt AutomationToolView     107472 / 92193  automations.*（定时任务卡，Vmt 判定 107448）
 * Qpt FallbackToolView       106609 / 91478  chat.toolCall.generic.*（通用 输入/输出 JSON）
 * 各视图共享 ToolLayout 壳；图标常量：Bft(90150) Zft(90396) tpt(90555) spt(90711)
 * dpt(90804) Ipt(91208) $pt(91538) Dmt(91861) Pmt(92022) Gmt(92189) Jmt(92262)
 * nht(92467) oht(92521) dht(92623) _ht(92788) Cht(92881) Oht(92980) Nht(93064)
 * -------------------------------------------------------------------------- */

/* 〔A0-S4-4b〕补导出块：原经 Conversation.tsx 文件尾 §9.7 导出块对外，迁出后于属主文件本地导出（体不动；ShellToolView 别名面保留）。 */
export { ToolLayout, ToolCallBlock, ShellToolViewImpl, Reasoning, ReasoningTrigger, ReasoningContent };
