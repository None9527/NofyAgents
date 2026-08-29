// A0-S4-4b: 自 modules/Conversation.tsx §4 ToolBlock 子族（工具折叠块 + ToolLayout + Reasoning 三件 + ShellToolView）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §4 全段（910–2128，含内联 declare 15 件）。导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Check as IconCheck, Copy as IconCopy, SquareTerminal as IconSquareTerminal, Lightbulb as IconLightbulb } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../modules/ImeComposition'; // 原 ImeComposition 导出族
import { AgentToolView, AskUserQuestionToolView, AutomationToolView, ExploreToolView, FallbackToolView, FileReadToolView, FileWriteToolView, GoalToolView, NodeReplToolView, SearchToolView, SessionContextToolView, SkillToolView, SwitchModeToolView, TaskControlToolView, TaskOutputToolView, TodoToolView, type FileSummary, type OpenCodeViewerFn, type ToolCall, type ToolCallNode, type ToolCallViewProps, type ToolDisplayModel } from '../../modules/ConversationLeaves'; // 16 工具视图 + 会话流共享类型 canonical（A0-D 类型收敛）
import { type CodePreviewSettings, type FileLinkModel } from '../../modules/MarkdownIntegration'; // A0-D 类型收敛
import { useControllableState } from '../../modules/UsageStatsUiParts'; // 原 fa（A0-CLEANUP2 item 47 接线）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 t 导出（A0-D 接线）；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../modules/Conversation'; // 〔A0-S4-4b〕§1 共享原语留守面，属主补 export 后取回（函数声明提升，渲染期访问，环安全）

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

/** 原 zlt（js 99513 / jsx 85879）：工具状态 → 展示状态（Rlt 映射表，缺省 input-streaming） */
declare const TOOL_STATUS_DISPLAY_MAP: Record<string, string>;
function normalizeToolCallStatus(status: string): string {
  return TOOL_STATUS_DISPLAY_MAP[status] ?? `input-streaming`;
}

/** 原 nQ（jsx 85900）：剥离 ``` 围栏与 <tool_use_error> 包裹 */
function unwrapToolUseError(text: string): string {
  const unwrapped = text.trim().match(/^```[\w-]*\n?([\s\S]*?)\n?```$/)?.[1]?.trim() ?? text.trim();
  return unwrapped.match(/^<tool_use_error>([\s\S]*?)<\/tool_use_error>$/i)?.[1]?.trim() || unwrapped;
}

/**
 * 原 rQ（js 99542 / jsx 85908）：从 toolCall 的 error/output/raw 各层
 * 逐级提取错误文案（tool_use_error 包裹、error/message 字段、failed 状态兜底）。
 */
function extractToolErrorText(toolCall: ToolCall): string | undefined {
  const direct = typeof toolCall.error === `string` && toolCall.error.trim().length > 0 ? toolCall.error.trim() : undefined;
  if (direct) return direct;
  const output = toolCall.output as Record<string, unknown> | undefined;
  if (output && typeof output === `object` && !Array.isArray(output)) {
    for (const key of [`error`, `message`]) {
      const value = output[key];
      if (typeof value === `string` && value.trim().length > 0) return value.trim();
    }
  }
  // ……（原实现继续检查 raw.rawOutput / raw.status / raw.content[]，
  //    全部经 unwrapToolUseError 归一；此处按调用面保留接口）
  return undefined;
}

/** 原 iQ（js 99582 / jsx 85951）：内联预览类型判定（patch/image/text/none） */
function resolveInlinePreview(
  toolCall: ToolCall,
  allowPatch: boolean,
): { type: "patch" | "image" | "text" | "none"; source?: unknown } {
  const preview = (toolCall as { preview?: { type?: string } }).preview;
  if (allowPatch && preview?.type === `patch`) return { type: `patch`, source: preview };
  if (preview?.type === `image`) return { type: `image`, source: preview };
  if (preview?.type === `text`) return { type: `text`, source: preview };
  const contentPreview = (toolCall as { contentPreview?: unknown }).contentPreview;
  if (contentPreview) return { type: `text`, source: contentPreview };
  return { type: `none` };
}

/* ── tombstone（A0-D 类型收敛）：本地 ToolDisplayModel 已删除，canonical =
 *    ConversationLeaves 导出（索引签名容宽型），经文件头 type import 消费。 ── */
declare function resolveToolDisplayModel(toolCall: ToolCall, workspacePath?: string): ToolDisplayModel;

/** 原 _g（js 20269）：从工具输入/输出抽取文件摘要列表（供展开区渲染） */
declare function extractRawFileSummaries(raw: unknown, toolCall: ToolCall): FileSummary[];

/** 原 qZ（js 98044 / jsx 85024）：ExitPlanMode 结果 → markdown（供复制文本合并） */
declare function buildPlanResultMarkdown(toolCall: ToolCall, fallback: string): { markdown: string };

/* --- 4.1 ToolLayout 头部/摘要件（原 aut/sut/cut/lut，jsx 86327–86469） --- */

interface ToolLayoutProps {
  toolId: string;
  persistOpenKey?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  canToggle?: boolean;
  forceOpen?: boolean;
  autoOpen?: boolean;
  autoCollapseOnComplete?: boolean;
  kindLabel?: React.ReactNode;
  expandedKindLabel?: React.ReactNode;
  kindDetail?: React.ReactNode;
  expandedKindDetail?: React.ReactNode;
  sourceLabel?: string;
  primaryText?: React.ReactNode;
  expandedPrimaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  expandedSecondaryText?: React.ReactNode;
  summaryContentSeparator?: React.ReactNode;
  animateSummaryContent?: boolean;
  disableSummaryContentAnimation?: boolean;
  summaryContentKey?: string;
  hideSecondaryTextWhenOpen?: boolean;
  diffCount?: React.ReactNode;
  hideDiffCountWhenOpen?: boolean;
  statusLabel?: React.ReactNode;
  statusTooltip?: string;
  showFailureStatus?: boolean;
  isRunning?: boolean;
  title?: React.ReactNode;
  expandedTitle?: React.ReactNode;
  content?: React.ReactNode;
  renderContent?: () => React.ReactNode;
  summaryAction?: { testId?: string; ariaLabel: string; onActivate: () => void };
}

/** 原 aut（jsx 86327）：摘要区主/次文本（可带内容切换动画） */
function ToolLayoutAnimatedText({
  contentKey,
  primaryText,
  secondaryText,
  enabled,
  disableAnimation,
}: {
  contentKey: string;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  enabled: boolean;
  disableAnimation?: boolean;
}) {
  // 原实现：主文本优先，次文本截断；内容键变化时做淡入动画（除非禁用）
  return (
    <span key={enabled && !disableAnimation ? contentKey : undefined} className="min-w-0 truncate">
      {primaryText ?? secondaryText}
    </span>
  );
}

/** 原 sut（js 100095 / jsx 86415）：摘要行前段 = 图标 + 种类标签 + 种类细节 + 来源徽章 */
function ToolLayoutSummaryPrefix({
  icon,
  kindDetail,
  kindLabel,
  kindLabelClassName,
  showIcon,
  sourceLabel,
}: Pick<ToolLayoutProps, "icon" | "kindDetail" | "kindLabel" | "showIcon" | "sourceLabel"> & { kindLabelClassName?: string }) {
  return (
    <>
      {showIcon ? <span className="shrink-0 text-foreground-subtlest [&_svg]:text-foreground-subtlest">{icon}</span> : null}
      {kindLabel != null && kindLabel !== false && kindLabel !== `` ? <span className={kindLabelClassName}>{kindLabel}</span> : null}
      {kindDetail ? <span className="min-w-0 shrink-0">{kindDetail}</span> : null}
      {sourceLabel ? (
        <span className="shrink-0 rounded border border-border bg-background-alt px-1.5 py-0.5 text-ui-xs leading-none text-foreground-subtlest">
          {sourceLabel}
        </span>
      ) : null}
    </>
  );
}

/** 原 cut（js 100122 / jsx 86425）：摘要行后段 = 分隔符 + 主/次文本 + diff 计数 + 状态 */
function ToolLayoutSummaryContent({
  animateContent,
  contentKey,
  diffCount,
  disableContentAnimation,
  isExpanded,
  primaryText,
  secondaryText,
  separator,
  statusNode,
}: {
  animateContent?: boolean;
  contentKey: string;
  diffCount?: React.ReactNode;
  disableContentAnimation?: boolean;
  isExpanded: boolean;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  separator?: React.ReactNode;
  statusNode?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex max-w-full items-center gap-2 text-foreground-subtlest">
      {separator == null ? null : <span className="shrink-0 text-foreground-subtlest">{separator}</span>}
      <ToolLayoutAnimatedText
        contentKey={contentKey}
        primaryText={primaryText}
        secondaryText={secondaryText}
        enabled={!!animateContent && !isExpanded}
        disableAnimation={disableContentAnimation}
      />
      {diffCount}
      {statusNode}
    </div>
  );
}

/** 原 out（jsx 86412）：Enter/Space 激活 */
function activateOnEnterOrSpace(event: React.KeyboardEvent, onActivate: () => void): boolean {
  if (event.key !== `Enter` && event.key !== ` `) return false;
  event.preventDefault();
  onActivate();
  return true;
}

/**
 * 原 lut（js 100151 / jsx 86444）：ToolLayout 头部行。
 * 三态：① summaryAction（整行可点击动作）② canToggle（折叠触发器，悬停显 ▶/⌄）
 * ③ 纯展示。类名逐字保留。
 */
function ToolLayoutHeader(
  props: ToolLayoutProps & {
    isExpanded: boolean;
    toggleAriaLabel: string;
    kindLabelClassName?: string;
    statusNode?: React.ReactNode;
  },
) {
  const { summaryAction: action, canToggle, forceOpen, isExpanded, title, toggleAriaLabel, toolId } = props;
  const summary = (
    <>
      <ToolLayoutSummaryPrefix {...props} />
      <ToolLayoutSummaryContent
        animateContent={props.animateSummaryContent}
        contentKey={props.summaryContentKey ?? ``}
        diffCount={props.diffCount}
        disableContentAnimation={props.disableSummaryContentAnimation}
        isExpanded={isExpanded}
        primaryText={props.primaryText}
        secondaryText={props.secondaryText}
        separator={props.summaryContentSeparator}
        statusNode={props.statusNode}
      />
    </>
  );
  if (action) {
    return (
      <div
        data-testid={action.testId ?? `tool-summary-trigger:${toolId}`}
        role="button"
        tabIndex={0}
        aria-label={action.ariaLabel}
        onClick={action.onActivate}
        onKeyDown={(event) => activateOnEnterOrSpace(event, action.onActivate)}
        className="group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
        title={typeof title === `string` ? title : undefined}
      >
        {summary}
      </div>
    );
  }
  if (canToggle) {
    return (
      <CollapsibleTrigger asChild>
        <div
          data-testid={`tool-summary-toggle:${toolId}`}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={toggleAriaLabel}
          onKeyDown={(event) => {
            if (event.key !== `Enter` && event.key !== ` `) return;
            event.preventDefault();
            event.currentTarget.click();
          }}
          className="group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          title={typeof title === `string` ? title : undefined}
        >
          {summary}
          <IconChevronRight
            aria-hidden={true}
            className={cn(
              `size-4 text-foreground-subtlest opacity-0 transition-transform transition-opacity duration-200 ease-out will-change-transform group-hover/tool-summary:opacity-100 shrink-0`,
              isExpanded ? `rotate-90 opacity-100` : `rotate-0`,
              forceOpen && `opacity-100`,
            )}
          />
        </div>
      </CollapsibleTrigger>
    );
  }
  return (
    <div
      data-testid={`tool-summary-toggle:${toolId}`}
      className="group/tool-summary cursor-default flex w-full items-center gap-2 text-left text-ui-base transition-colors focus-visible:outline-none"
      title={typeof title === `string` ? title : undefined}
    >
      {summary}
    </div>
  );
}

/** 原 cQ（jsx 86466）：工具卡展开态内存缓存（按 persistOpenKey ?? toolId） */
const toolLayoutOpenStateStore = new Map<string, boolean>();
/** 原 uut（jsx 86467）：收起动画延迟 300ms */
const TOOL_LAYOUT_COLLAPSE_DELAY_MS = 300;
const TOOL_LAYOUT_CONTENT_TEXT_CLASS = `text-popover-foreground outline-none`; // dut
const TOOL_LAYOUT_CONTENT_PAD_CLASS = `pt-2`; // fut

/**
 * ToolLayout（原 put，js 100214 / jsx 86470；memo 名 lQ，js 100416 / jsx 86604，
 * displayName=`ToolLayout`）。所有工具折叠块的共享壳：
 * - 展开态持久化在内存 Map（cQ），跨滚动虚拟化复用；
 * - autoOpen：首次出现即展开并记账；autoCollapseOnComplete：运行结束自动收起；
 * - 失败状态（showFailureStatus）的状态文案支持 tooltip + 复制（chat.toolCall.copyError*）；
 * - 展开/收起有 300ms 收起延迟以完成动画。
 */
function ToolLayoutImpl(props: ToolLayoutProps) {
  const {
    toolId,
    persistOpenKey,
    icon,
    showIcon = true,
    canToggle = true,
    forceOpen = false,
    autoOpen = false,
    autoCollapseOnComplete = false,
    kindLabel,
    expandedKindLabel,
    kindDetail,
    expandedKindDetail,
    sourceLabel,
    primaryText,
    expandedPrimaryText,
    secondaryText,
    expandedSecondaryText,
    summaryContentSeparator,
    animateSummaryContent = false,
    disableSummaryContentAnimation = false,
    summaryContentKey,
    hideSecondaryTextWhenOpen = false,
    diffCount,
    hideDiffCountWhenOpen = false,
    statusLabel,
    statusTooltip,
    showFailureStatus = false,
    isRunning = false,
    title,
    expandedTitle,
    content,
    renderContent,
    summaryAction,
  } = props;
  const { intl } = useIntlContext();
  const stateKey = persistOpenKey ?? toolId;
  const [persistedOpen, setPersistedOpen] = React.useState(() => toolLayoutOpenStateStore.get(stateKey) ?? false);
  const hasSummaryAction = summaryAction !== undefined;
  const openByProps = !hasSummaryAction && (forceOpen || (canToggle && persistedOpen));
  const [openLocally, setOpenLocally] = React.useState(openByProps);
  const [copiedTooltip, setCopiedTooltip] = React.useState(false);
  const copyResetTimer = React.useRef<number | null>(null);
  const collapseTimer = React.useRef<number | null>(null);
  const autoOpenApplied = React.useRef(false);
  const prevIsRunning = React.useRef(isRunning);
  const isExpanded = !hasSummaryAction && (openByProps || openLocally);
  const expandedContent = isExpanded ? renderContent?.() ?? content ?? null : null;
  const effectivePrimaryText = openByProps && expandedPrimaryText != null ? expandedPrimaryText : primaryText;
  const effectiveKindLabel = openByProps && expandedKindLabel != null ? expandedKindLabel : kindLabel;
  const effectiveKindDetail = openByProps && expandedKindDetail !== undefined ? expandedKindDetail : kindDetail;
  const effectiveSecondaryText =
    openByProps && expandedSecondaryText !== undefined ? expandedSecondaryText : openByProps && hideSecondaryTextWhenOpen ? null : secondaryText;
  const effectiveTitle = openByProps && expandedTitle !== undefined ? expandedTitle : title;
  const contentKey = summaryContentKey ?? `${String(effectiveTitle ?? ``)}:${String(statusLabel ?? ``)}`;
  const showDiffCount = diffCount != null && !(openByProps && hideDiffCountWhenOpen);
  const kindLabelClassName = cn(`font-medium whitespace-nowrap shrink-0`, isRunning ? `animated-gradient-text` : `text-foreground-subtlest`);

  React.useEffect(() => {
    setPersistedOpen(toolLayoutOpenStateStore.get(stateKey) ?? false);
  }, [stateKey]);
  React.useEffect(() => {
    if (!autoOpen || autoOpenApplied.current) return;
    toolLayoutOpenStateStore.set(stateKey, true);
    setOpenLocally(true);
    setPersistedOpen(true);
    autoOpenApplied.current = true;
  }, [autoOpen, stateKey]);
  React.useEffect(() => {
    const wasRunning = prevIsRunning.current;
    prevIsRunning.current = isRunning;
    if (autoCollapseOnComplete && !isRunning && wasRunning) {
      toolLayoutOpenStateStore.set(stateKey, false);
      setPersistedOpen(false);
    }
  }, [autoCollapseOnComplete, isRunning, stateKey]);
  React.useEffect(() => {
    if (openByProps) {
      if (collapseTimer.current !== null) {
        window.clearTimeout(collapseTimer.current);
        collapseTimer.current = null;
      }
      setOpenLocally(true);
      return;
    }
    if (openLocally) {
      collapseTimer.current = window.setTimeout(() => {
        setOpenLocally(false);
        collapseTimer.current = null;
      }, TOOL_LAYOUT_COLLAPSE_DELAY_MS);
      return () => {
        if (collapseTimer.current !== null) {
          window.clearTimeout(collapseTimer.current);
          collapseTimer.current = null;
        }
      };
    }
    return undefined;
  }, [openByProps, openLocally]);
  React.useEffect(
    () => () => {
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
    },
    [],
  );

  const copyStatusTooltip = () => {
    if (typeof statusTooltip != `string` || statusTooltip.trim().length === 0) return;
    navigator.clipboard.writeText(statusTooltip).then(() => {
      setCopiedTooltip(true);
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => {
        setCopiedTooltip(false);
        copyResetTimer.current = null;
      }, 1500);
    });
  };

  const showFailure = showFailureStatus && statusLabel != null;
  const statusNode = showFailure
    ? statusTooltip != null ? (
        <Popover>
          <PopoverAnchor>
            <PopoverTrigger asChild>
              <span className="whitespace-nowrap underline decoration-dotted underline-offset-2 cursor-help">{statusLabel}</span>
            </PopoverTrigger>
            <PopoverContent side={`top`} align={`start`} className={`max-w-96`}>
              <div className="flex max-w-96 items-center gap-2">
                <span className="line-clamp-3 min-w-0 flex-1 whitespace-pre-wrap break-words">{statusTooltip}</span>
                {typeof statusTooltip == `string` && statusTooltip.trim().length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-md"
                    className="shrink-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      copyStatusTooltip();
                    }}
                    title={intl.formatMessage({ id: copiedTooltip ? `chat.toolCall.copyError.copied` : `chat.toolCall.copyError` })}
                    aria-label={intl.formatMessage({ id: copiedTooltip ? `chat.toolCall.copyError.copied` : `chat.toolCall.copyError` })}
                  >
                    {copiedTooltip ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
                  </Button>
                ) : null}
              </div>
            </PopoverContent>
          </PopoverAnchor>
        </Popover>
      ) : (
        <span className="whitespace-nowrap">{statusLabel}</span>
      )
    : null;

  const headerProps: ToolLayoutProps & {
    isExpanded: boolean;
    toggleAriaLabel: string;
    statusNode?: React.ReactNode;
    kindLabelClassName?: string;
  } = {
    ...props,
    isExpanded,
    kindLabelClassName,
    kindLabel: effectiveKindLabel,
    kindDetail: effectiveKindDetail,
    primaryText: effectivePrimaryText,
    secondaryText: effectiveSecondaryText,
    title: effectiveTitle,
    diffCount: showDiffCount ? diffCount : undefined,
    statusNode,
    toggleAriaLabel: intl.formatMessage({ id: openByProps ? `chat.toolCall.collapseDetails` : `chat.toolCall.expandDetails` }),
  };

  return (
    <Collapsible
      open={!hasSummaryAction && (forceOpen || (canToggle && persistedOpen))}
      onOpenChange={(next) => {
        if (hasSummaryAction || forceOpen) return;
        toolLayoutOpenStateStore.set(stateKey, next);
        if (next) setOpenLocally(true);
        setPersistedOpen(next);
      }}
      className={`w-full flex flex-col`}
    >
      <ToolLayoutHeader {...headerProps} icon={icon} showIcon={showIcon} sourceLabel={sourceLabel} />
      {!hasSummaryAction && canToggle ? (
        <CollapsibleContent className={TOOL_LAYOUT_CONTENT_TEXT_CLASS}>
          <div className={TOOL_LAYOUT_CONTENT_PAD_CLASS}>{expandedContent}</div>
        </CollapsibleContent>
      ) : !hasSummaryAction && forceOpen ? (
        <div className={cn(TOOL_LAYOUT_CONTENT_TEXT_CLASS, TOOL_LAYOUT_CONTENT_PAD_CLASS)}>{expandedContent}</div>
      ) : null}
    </Collapsible>
  );
}
const ToolLayout = React.memo(ToolLayoutImpl);
ToolLayout.displayName = `ToolLayout`;

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

/** 滚动遮罩状态（原 yV/bV/xV，jsx 95122 附近）：顶部/底部渐隐指示 */
interface ScrollMaskState {
  showTop: boolean;
  showBottom: boolean;
}
const EMPTY_SCROLL_MASK: ScrollMaskState = { showTop: false, showBottom: false };
declare function computeScrollMask(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): ScrollMaskState;
declare function scrollMaskStyle(state: ScrollMaskState): React.CSSProperties;

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

/** 原子工具卡缩进类（原 Fht，jsx 93114）：子工具调用左竖线缩进 */
const TOOL_CHILD_INDENT_CLASS = `ml-2 space-y-2 border-border border-l pl-3.5 border-border`;
/** 原 Iht/Lht（jsx 93115）：流式入场动画缓存上限 800 / 动画时长 1000ms */
const STREAMING_ENTRANCE_CACHE_LIMIT = 800;
const STREAMING_ENTRANCE_DURATION_MS = 1e3;
/** 原 G$（jsx 93117）：已播放过入场动画的工具卡（LRU 按时间戳淘汰） */
const streamingEntranceSeenCache = new Map<string, number>();
function pruneStreamingEntranceCache() {
  if (streamingEntranceSeenCache.size <= STREAMING_ENTRANCE_CACHE_LIMIT) return;
  const oldest = Array.from(streamingEntranceSeenCache.entries())
    .sort(([, a], [, b]) => a - b)
    .slice(0, streamingEntranceSeenCache.size - STREAMING_ENTRANCE_CACHE_LIMIT)
    .map(([key]) => key);
  for (const key of oldest) streamingEntranceSeenCache.delete(key);
}
function normalizeStreamingEntranceKey(key: string): string | null {
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}
function hasSeenStreamingEntrance(key: string): boolean {
  const normalized = normalizeStreamingEntranceKey(key);
  return normalized === null || streamingEntranceSeenCache.has(normalized);
}
function markStreamingEntranceSeen(key: string) {
  const normalized = normalizeStreamingEntranceKey(key);
  if (normalized !== null) {
    streamingEntranceSeenCache.set(normalized, Date.now());
    pruneStreamingEntranceCache();
  }
}
function shouldPlayStreamingEntrance(key: string, active: boolean): boolean {
  return active && !hasSeenStreamingEntrance(key);
}
/** 原 Uht（jsx 93135）：agent 家族工具（子代理）不参与嵌套缩进判定 */
function isAgentToolCall(toolCall: ToolCall): boolean {
  return classifyToolCall(toolCall).family === `agent`;
}

/* ── tombstone（A0-D 类型收敛）：本地 ToolCallViewProps（原 Ght I 对象）已删除，
 *    canonical = ConversationLeaves 导出，经文件头 type import 消费；
 *    ShellToolView declare 一并删除——本文件 §4.5 ShellToolViewImpl 即 canonical
 *    实体（尾部符号表以 ShellToolView 别名导出），分派点直接引用实现。 ── */
declare function isAutomationToolCall(props: ToolCallViewProps): boolean; // Vmt (107448 / 92190)

/**
 * 原 Wht（js 109066 / jsx 93141）：按工具家族分派视图组件。
 * node-repl 与 automation 优先于家族表判定。
 */
function resolveToolCallView(props: ToolCallViewProps): React.FC<ToolCallViewProps> {
  const identity = classifyToolCall(props.toolCallNode.toolCall);
  if (identity.family === `node-repl`) return NodeReplToolView;
  if (isAutomationToolCall(props)) return AutomationToolView;
  switch (identity.family) {
    case `plan-guidance`:
      return SearchToolView; // qmt：plan-guidance 复用搜索类摘要视图（93222 附近）
    case `agent`:
      return AgentToolView;
    case `todo`:
      return TodoToolView;
    case `ask-user-question`:
      return AskUserQuestionToolView;
    case `message`:
      return props.toolCallNode.toolCall.toolName === `RespondToCoordinator` ? SessionContextToolView : FallbackToolView;
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

/** 原 $ne（jsx 93246 附近）：展示状态 → isRunning（input-streaming/input-available/output-streaming） */
declare function isToolCallRunningByDisplayStatus(displayStatus: string): boolean;
/** 原 Tee（jsx 93249 附近）：展示状态 → 状态文案 i18n key（chat.toolCall.status.*） */
declare function toolCallStatusI18nId(displayStatus: string, rawStatus: string): string;
/** 原 zlt 的输入：原始状态归一化 */
declare function normalizeToolCallStatusRaw(status: string): string;

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
  const isRunning = isToolCallRunningByDisplayStatus(displayStatus);
  const statusLabel = intl.formatMessage({ id: toolCallStatusI18nId(displayStatus, toolCall.status) });
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

/** 原 Qft（jsx 90400）：bash 命令单行摘要（截断） */
declare function summarizeShellCommand(input: unknown): string | undefined;
/** 原 KQ（jsx 90439）：解析执行命令（含包装/转义还原） */
declare function resolveShellExecution(input: unknown): { executionCommand: string };
/** 原 qQ（jsx 90481）：输出文本提取 */
declare function extractShellOutput(output: unknown): string | undefined;
/** 原 GQ（jsx 90397）：raw 是否含 rawOutput */
declare function hasRawShellOutput(raw: unknown): boolean;

/** shell 工具图标（原 Zft，jsx 90396） */
const SHELL_TOOL_ICON = <IconSquareTerminal className="size-4 shrink-0 text-foreground-subtle" />;

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
/** 原 sQ（jsx 86252）：快照引用脚注（接口保留） */
declare const ToolSnapshotRefs: React.FC<{ refs: unknown[]; onLoadFullToolCallFields?: () => void }>;

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
