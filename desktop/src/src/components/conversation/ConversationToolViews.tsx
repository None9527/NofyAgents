// A0-S4-4b: 自 modules/ConversationLeaves.tsx §2 工具视图共享件 + 17 工具视图 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §2 全段（469–2650）+ §0 声明群分配本族子集（IconQuestion/展开区三件/代码面六件/文件图标与路径助手/
// 流式子摘要/错误文本/plan 抽取/usePlatformService/代理目录三件 + AgentDescriptor；PlatformService 型别留守 shim 经 type import 取回）。
// 导入路径按 components/conversation/ 深度改指 ../../modules/ / ../ui/。
/* eslint-disable */
import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Pencil as IconPencil, Search as IconSearch, Terminal as IconTerminal, Shield as IconShield, Target as IconTarget, Gauge as IconGauge, Calendar as IconCalendar, Clock as IconClock, Bot as IconBot, Check as IconCheck, Copy as IconCopy, ArrowUpRight as IconArrowUpRight, ExternalLink as IconExternal } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { ToolCallBlock, ToolLayout } from '../../modules/Conversation'; // 原 lQ/K$（A0-D 接线：declare → Conversation §4 canonical）
import { MarkdownRenderer, baseName, type CodePreviewSettings, type FileLinkModel } from '../../modules/MarkdownIntegration'; // +CodePreviewSettings/FileLinkModel（A0-D 类型收敛）
import { logger } from '../../modules/SkillStore';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical；IntlShape=ZCodeIntl）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 t 导出，button-laUijeDG.js（A0-D 接线：declare → button.tsx canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { usePlatformService } from '../../modules/ImeComposition'; // 〔A1-P1-B10〕原 declare（S=imeComposition chunk j 导出 → usePlatform）收敛改指：canonical 实体在案（ImeComposition 186）
import {
  extractAgentPrompt, fallbackMessage, resolveAgentFallbackName, resolveAgentTypeLabel,
  normalizeAgentName, resolveAgentColorHash, extractAgentOutputFile, extractAgentOutputText,
  AgentPromptBlock, AgentChildToolList, AgentLabeledBlock, AgentOutputFileCard, AgentColorBadge,
} from './AgentToolBlocks'; // 〔A1-P1-B10〕agent 族 13 declare 实体化收敛（styles 105957–106290 + 105162–105185）
/* ── tombstone〔A1-P1-B13〕：McpToolBlocks 导入块删除——唯一消费面手写 AutomationToolView 已墓碑，
 * 束真身改经 ./AutomationViewBlocks 叶内 import 消费（B11 叶不动）。 ── */
import { hashToAgentPaletteColor } from './ShellCommandBlocks'; // 〔A1-P1-B11〕AgentToolView 调色板兜底链尾（原 Xft，styles 105186）
import { CodeSurfaceCard } from './CodeSurfaceBlocks'; // 〔A1-P1-B14〕原 w$（styles 107180）：手写 CodeSurface declare 五 prop（cardSurface/copyLabel/wrapLabel/eagerLayout/label）之束真身卡面包装体
import { FileIcon, resolveFileIconMeta, resolvePathTitle } from './FileIconBlocks'; // 〔A1-P1-B15〕原 Vc/zc/Hc（styles 5243/5198/5263 逐字实体化；三 declare 收敛）
import type { ToolCall, ToolCallNode, ToolDisplayModel, OpenCodeViewerFn, ToolCallViewProps, FileSummary, PlatformService } from '../../modules/ConversationLeaves'; // 会话流共享类型 canonical（A0-D 类型收敛）；PlatformService 留守 shim（§5/§6 共用）

/* ── tombstone〔A1-P1-B14〕：declare IconQuestion（vye）删除——唯一消费面手写 AskUserQuestionToolView 之
 * ASK_QUESTION_ICON 已墓碑；束真身 Nht@109010 = (0, $.jsx)(vye, …)，vye=Sa('circle-question-mark')@26907
 * （lucide CircleQuestionMark）已逐字实体化于 ./TodoToolBlocks。 ── */

/** ToolCallBlock（原 K$，Conversation.tsx §4 已还原） */
/** 展开区通用内容（原 oQ：输入/输出/错误/子工具列表） */
declare const ToolCallExpandedContent: React.FC<{
  childToolList: React.ReactNode;
  displayModel: ToolDisplayModel;
  inlinePreviewOverride?: { type: string } | null;
  toolCall: ToolCall;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
/** 快照引用加载条（原 sQ） */
declare const SnapshotRefsLoader: React.FC<{
  refs: unknown[];
  onLoadFullToolCallFields?: () => void;
}>;
/** 错误面（原 aQ） */
declare const ToolErrorSurface: React.FC<{ errorText?: string | null; [key: string]: unknown }>;

/* ── tombstone〔A1-P1-B14〕：代码面六 declare（CodeSurface/Header/Title/Actions/WrapButton/CopyButton，
 * 原 gk/pk/mk/hk/_k/vk）删除——束真身已逐字实体化于 ./CodeSurfaceBlocks（styles 48572–48872）。
 * 手写 CodeSurface declare 之 cardSurface/copyLabel/wrapLabel/eagerLayout/label 五 prop 为 A0 期近似：
 * 束真身该型面 = w$@107180 CodeSurfaceCard（卡面包装体，同叶实体化），手写 NodeReplToolView 三处调用面
 * 改指 CodeSurfaceCard（prop 面逐字吻合）。 ── */
/* ── tombstone〔A1-P1-B15〕：文件图标/路径助手三 declare（FileIcon/resolveFileIconMeta/resolvePathTitle，原 Vc/zc/Hc）
 * 删除——束真身 5243/5198/5263 已逐字实体化于 ./FileIconBlocks（文件图标域 5064–5267 收割）。消费面逐字不变，改真实 import。 ── */
/** 流式子工具摘要（原 xpt） */
declare function resolveStreamingChildSummary(
  intl: IntlShape,
  childToolCalls: ToolCallNode[],
  viewProps: ToolCallViewProps,
  options?: { includeChildActionKindLabel?: boolean },
): { primaryText: React.ReactNode; secondaryText?: React.ReactNode; animationKey?: string; title?: string } | null;
/** 工具错误文本（原 rQ，Conversation.tsx 已还原） */
declare function extractToolErrorText(toolCall: ToolCall): string | null;
/* ── tombstone〔A1-P1-B15〕：declare extractPlanMarkdown（原 qZ）删除——束真身 qZ@98092 全链（GZ/Kct/qct/KZ 98073–98114）
 * 已逐字实体化于 ./PlanToolBlocks；手写 SwitchModeToolView 同批墓碑，消费面改文件尾转导出。SidePanel declare 同批收敛（shell 域改指 ./PlanToolBlocks）。 ── */
/* ── tombstone〔A1-P1-B10〕：declare usePlatformService 删除——canonical 收敛改指 modules/ImeComposition（再导出
 * components/ime/ImeComposition 186 `export const usePlatformService = usePlatform`；bundle 消费面 Qpt@106659
 * `n = S()`，S = styles 头注 `j as S` ← imeComposition-DEYFkwWm.js 导出，同一实体）。原型 `| null` 为 A0 期近似：
 * 真身 usePlatform 缺省即抛错（Provider 守卫），消费面 FallbackToolView/CuaPermissionOnboardingPanel 型面兼容。 ── */
/** 代理目录 store（原 he/je） */
interface AgentDescriptor { id: string; name: string; color?: string }
declare function useWorkspaceAgents(workspacePath?: string): AgentDescriptor[] | undefined;
declare function useGlobalAgents(): AgentDescriptor[];
declare function getGlobalAgents(): AgentDescriptor[];

/* ============================================================================
 * 2. 工具视图共享件（原 VQ/jft…Fft/Ift/Lft/HQ/Rft/zft/Bft/Vft/Hft/Uft/UQ/Wft）
 * ==========================================================================*/

/** 原 bhe/rA/kft/Oft：patch 行解析/语言推断/主题类名/高亮行渲染（接口级，F19 域） */
declare function parsePatchLines(patch: string): unknown[];
declare function inferPatchLanguage(pathOrTitle: string, patch: string): string;
declare function resolveHighlightTheme(theme: string, settings: CodePreviewSettings): string;
declare const HighlightedCodeLines: React.FC<{
  className?: string;
  codePreviewSettings?: CodePreviewSettings;
  "data-inline-diff-highlight-language": string;
  "data-inline-diff-highlight-theme": string;
  language: string;
  lines: unknown[];
  path: string;
  theme: string;
}>;

/** 原 VQ（— / 90046）：编辑内联 diff 内容（max-h-60 滚动卡） */
export const EditInlineDiffContent = React.memo(function EditInlineDiffContent({
  preview,
  theme = "system",
  codePreviewSettings,
}: {
  preview: { patch: string; path?: string; title: string };
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
}) {
  const lines = React.useMemo(() => parsePatchLines(preview.patch), [preview.patch]);
  const language = React.useMemo(() => inferPatchLanguage(preview.path ?? preview.title, preview.patch), [preview.patch, preview.path, preview.title]);
  const highlightTheme = React.useMemo(() => resolveHighlightTheme(theme, codePreviewSettings ?? ({} as CodePreviewSettings)), [codePreviewSettings, theme]); /* A0-D 类型垫片：缺省空对象 */
  return (
    <div className="space-y-3">
      <div className="mb-2 max-h-60 overflow-auto rounded-xl border border-border bg-card" data-inline-diff-preview={true}>
        <HighlightedCodeLines
          className="h-full bg-card"
          codePreviewSettings={codePreviewSettings}
          data-inline-diff-highlight-language={language}
          data-inline-diff-highlight-theme={highlightTheme}
          language={language}
          lines={lines}
          path={preview.path ?? preview.title}
          theme={highlightTheme}
        />
      </div>
    </div>
  );
});
EditInlineDiffContent.displayName = "EditInlineDiffContent";

/** 原 Aft/jft：翻牌动画参数 + 降动效侦听 */
const DIGIT_FLIP_TRANSITION = { duration: 0.16, ease: [0.4, 0, 0.2, 1] as const };
declare const MotionPresence: React.FC<{ initial?: boolean; children?: React.ReactNode }>;
declare const motion: { span: React.FC<React.HTMLAttributes<HTMLSpanElement> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown; style?: React.CSSProperties; children?: React.ReactNode }> };
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReduced(query.matches);
    };
    onChange();
    if (typeof query.addEventListener == "function") {
      query.addEventListener("change", onChange);
      return () => {
        query.removeEventListener("change", onChange);
      };
    }
    query.addListener(onChange);
    return () => {
      query.removeListener(onChange);
    };
  }, []);
  return reduced;
}
/** 原 Mft/Nft：数字/标点宽度类 */
function isDigitChar(char: string): boolean {
  return /^[0-9]$/.test(char);
}
function digitWidthClass(char: string): string {
  return isDigitChar(char) ? "w-[0.66em]" : char === ":" || char === "." ? "w-[0.34em]" : "w-[0.7em]";
}
/** 原 Pft：单字符翻牌（数字翻转动效，降动效时静态） */
function FlipDigit({ character, index, reducedMotion }: { character: string; index: number; reducedMotion: boolean }) {
  const widthClass = digitWidthClass(character);
  return !isDigitChar(character) || reducedMotion ? (
    <span aria-hidden="true" className={cn("inline-flex h-[1.15em] shrink-0 items-center justify-center leading-none", widthClass)}>
      {character}
    </span>
  ) : (
    <span aria-hidden="true" className={cn("relative inline-flex h-[1.15em] shrink-0 items-center justify-center overflow-hidden leading-none [perspective:8em]", widthClass)}>
      <MotionPresence initial={false}>
        <motion.span
          key={`${index}-${character}`}
          className="absolute inset-0 flex items-center justify-center leading-none"
          initial={{ rotateX: -90, y: "-0.45em", opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          exit={{ rotateX: 90, y: "0.45em", opacity: 0 }}
          style={{ transformOrigin: "50% 50%" }}
          transition={DIGIT_FLIP_TRANSITION}
        >
          {character}
        </motion.span>
      </MotionPresence>
    </span>
  );
}
/** 原 Fft：数值串翻牌容器 */
function FlipNumberText({ value, className }: { value: string; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const chars = React.useMemo(() => Array.from(value), [value]);
  return (
    <span aria-label={value} className={cn("inline-flex max-w-full items-center overflow-hidden whitespace-nowrap align-middle leading-none", className)} role="text" title={value}>
      {chars.map((char, index) => (
        <FlipDigit key={index} character={char} index={index} reducedMotion={reducedMotion} />
      ))}
    </span>
  );
}
/** 原 Ift：+added / -removed 差异计数徽章 */
function DiffCountBadge({ summary }: { summary: { added: number; removed: number } | null }) {
  if (!summary || (summary.added <= 0 && summary.removed <= 0)) return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono leading-none tabular-nums">
      {summary.added > 0 ? (
        <span aria-label={`+${summary.added}`} className="inline-flex items-center text-diff-added" role="text" title={`+${summary.added}`}>
          {"+"}
          <FlipNumberText value={String(summary.added)} />
        </span>
      ) : null}
      {summary.removed > 0 ? (
        <span aria-label={`-${summary.removed}`} className="inline-flex items-center text-diff-removed" role="text" title={`-${summary.removed}`}>
          {"-"}
          <FlipNumberText value={String(summary.removed)} />
        </span>
      ) : null}
    </span>
  );
}
/** 原 Lft：文件摘要标签（图标 + 文件名，可点击） */
function FileSummaryLabel({
  summary,
  clickable = false,
  onClick,
  title,
  basePath,
}: {
  summary: FileSummary;
  clickable?: boolean;
  onClick?: () => void;
  title?: string;
  basePath?: string;
}) {
  const icon = resolveFileIconMeta(summary.path, { basePath });
  const label = title ?? resolvePathTitle(summary.path, basePath);
  return clickable ? (
    <button
      type="button"
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-foreground hover:underline"
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <FileIcon src={icon.fileIconSrc} size={16} className="size-4 shrink-0" />
      <span className="min-w-0 truncate text-foreground">{baseName(summary.path)}</span>
    </button>
  ) : (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-foreground" title={label}>
      <FileIcon src={icon.fileIconSrc} size={16} className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{baseName(summary.path)}</span>
    </span>
  );
}
/** 原 HQ：次级路径文本 */
function PathSecondaryText(path: string | null | undefined, basePath?: string): React.ReactNode {
  return path ? <span className="min-w-0 truncate text-foreground-subtlest">{resolvePathTitle(path, basePath)}</span> : null;
}
/** 原 Fhe + Rft：编辑动作标签（write/delete/edit × 进行中） */
declare function resolveFileOperation(toolCallish: { kind: string; title?: string | null; input?: unknown; output?: unknown; raw?: unknown }, operationKind?: string): string;
function resolveEditKindLabel(operationKinds: Array<string | undefined>, actionLabels: Array<string | undefined>, isRunning: boolean, toolCallish: { kind: string; title?: string | null; input?: unknown; output?: unknown; raw?: unknown }): string {
  const operation = resolveFileOperation(toolCallish, operationKinds[0]);
  return operation === "write"
    ? isRunning
      ? "chat.toolCall.edit.writing"
      : "chat.toolCall.edit.wrote"
    : operation === "delete"
      ? isRunning
        ? "chat.toolCall.edit.deleting"
        : "chat.toolCall.edit.deleted"
      : isRunning
        ? "chat.toolCall.edit.editing"
        : "chat.toolCall.edit.edited";
}
/** 原 zft：文件摘要列表（逗号分隔） */
function FileSummaryList(summaries: FileSummary[], options: { clickable?: boolean; basePath?: string; onClick?: (summary: FileSummary) => void } = {}): React.ReactNode {
  return (
    <div className="inline-flex min-w-0 items-center">
      {summaries.map((summary, index) => (
        <span key={summary.path} className="inline-flex min-w-0 items-center">
          {index > 0 ? <span className="mx-1 text-foreground-subtlest">{","}</span> : null}
          <FileSummaryLabel
            summary={summary}
            clickable={options.clickable}
            basePath={options.basePath}
            onClick={options.onClick ? () => options.onClick?.(summary) : undefined}
          />
        </span>
      ))}
    </div>
  );
}
/** 原 Bft/Vft/Hft：编辑图标与折叠预设 */
const EDIT_TOOL_ICON = <IconPencil className="size-4 shrink-0 text-foreground-subtle" />;
const EDIT_TOGGLE_PRESET = { canToggle: true, forceOpen: false };
const EDIT_ROW_TOGGLE_PRESET = { canToggle: true, forceOpen: false };
/** 原 Uft：raw.status === 'failed' 判定 */
function isRawFailed(raw: unknown): boolean {
  if (typeof raw != "object" || !raw || Array.isArray(raw)) return false;
  const { status } = raw as { status?: unknown };
  return typeof status == "string" && status === "failed";
}
/** 原 UQ：文件摘要 → 代码查看目标 */
function toCodeViewerTarget(summary: FileSummary): { type: "patch"; title: string; path: string; patch: string } | { type: "file"; title: string; path: string } {
  return summary.patch
    ? { type: "patch", title: summary.fileName, path: summary.path, patch: summary.patch }
    : { type: "file", title: summary.fileName, path: summary.path };
}
/** 原 Wft：单文件 patch → 内联预览源 */
function toPatchPreview(summary: FileSummary | null): { type: "patch"; source: { type: "patch"; title: string; path: string; patch: string } } | undefined {
  if (!summary?.patch) return undefined;
  const target = toCodeViewerTarget(summary);
  if (target.type === "patch") return { type: "patch", source: target };
  return undefined;
}

/** 原 Kft（— / 90290）：多文件编辑中的单文件行 */
function FileWriteChildRow({
  summary,
  isRunning,
  statusLabel,
  errorText,
  toolId,
  isFailed,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenBrowserUrl,
  childToolList,
  displayModel,
  toolCall,
  workspacePath,
  theme,
  codePreviewSettings,
  showIcon = true,
  sourceLabel,
}: {
  summary: FileSummary;
  isRunning: boolean;
  statusLabel: string;
  errorText?: string;
  toolId: string;
  isFailed: boolean;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
  childToolList: React.ReactNode;
  displayModel: ToolDisplayModel;
  toolCall: ToolCall;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  showIcon?: boolean;
  sourceLabel?: string;
}) {
  const { intl } = useIntlContext();
  const kindLabel = intl.formatMessage({ id: resolveEditKindLabel([summary.operationKind], [summary.actionLabel], isRunning, toolCall) });
  const patchPreview = toPatchPreview(summary);
  const openInViewer = React.useCallback(() => {
    if (onOpenCodeViewer) onOpenCodeViewer(toCodeViewerTarget(summary));
  }, [onOpenCodeViewer, summary]);
  const primaryText = React.useMemo(
    () => <FileSummaryLabel summary={summary} clickable={!!onOpenCodeViewer} basePath={workspacePath} onClick={openInViewer} />,
    [onOpenCodeViewer, openInViewer, summary, workspacePath],
  );
  const secondaryText = React.useMemo(() => PathSecondaryText(summary.filePath, workspacePath), [summary.filePath, workspacePath]);
  const diffCount = React.useMemo(() => <DiffCountBadge summary={summary.changeStat ?? null} />, [summary.changeStat]);
  const rowTitle = React.useMemo(() => resolvePathTitle(summary.filePath ?? summary.path, workspacePath), [summary.filePath, summary.path, workspacePath]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3">
        {patchPreview?.type === "patch" ? <EditInlineDiffContent preview={patchPreview.source} theme={theme} codePreviewSettings={codePreviewSettings} /> : null}
        <ToolCallExpandedContent
          childToolList={childToolList}
          displayModel={displayModel}
          inlinePreviewOverride={patchPreview?.type === "patch" ? { type: "none" } : undefined}
          toolCall={toolCall}
          workspacePath={workspacePath}
          theme={theme}
          codePreviewSettings={codePreviewSettings}
          onOpenCodeViewer={onOpenCodeViewer}
          onOpenFileLink={onOpenFileLink}
          onOpenBrowserUrl={onOpenBrowserUrl}
        />
      </div>
    ),
    [childToolList, codePreviewSettings, displayModel, patchPreview, onOpenBrowserUrl, onOpenCodeViewer, onOpenFileLink, theme, toolCall, workspacePath],
  );
  return (
    <>
      <ToolLayout
        toolId={toolId}
        icon={EDIT_TOOL_ICON}
        showIcon={showIcon !== false}
        {...EDIT_ROW_TOGGLE_PRESET}
        kindLabel={kindLabel}
        sourceLabel={sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        diffCount={diffCount}
        statusLabel={statusLabel}
        statusTooltip={isFailed ? errorText : undefined}
        showFailureStatus={isFailed}
        isRunning={isRunning}
        title={rowTitle}
        renderContent={renderContent}
      />
    </>
  );
}

/** 原 Gft（104844 / 90186）：FileWriteToolView */
export function FileWriteToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, rawFileSummaries, isRunning, statusLabel, errorText, onOpenCodeViewer } = props;
  const { toolCall } = toolCallNode;
  const multiple = rawFileSummaries.length > 1;
  const failed = toolCall.status === "failed" || isRawFailed(toolCall.raw) || !!errorText;
  const displayedStatus = failed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : statusLabel;
  const openSummary = React.useCallback(
    (summary: FileSummary) => {
      if (onOpenCodeViewer) onOpenCodeViewer(toCodeViewerTarget(summary));
    },
    [onOpenCodeViewer],
  );
  const primaryText = React.useMemo(
    () =>
      rawFileSummaries.length > 0
        ? FileSummaryList(rawFileSummaries, { clickable: !!onOpenCodeViewer, basePath: props.workspacePath, onClick: openSummary })
        : null,
    [props.workspacePath, onOpenCodeViewer, openSummary, rawFileSummaries],
  );
  const secondaryText = React.useMemo(
    () => (rawFileSummaries.length === 1 ? PathSecondaryText(rawFileSummaries[0]?.filePath, props.workspacePath) : undefined),
    [props.workspacePath, rawFileSummaries],
  );
  const aggregated = React.useMemo(
    () =>
      rawFileSummaries.reduce(
        (acc, summary) =>
          summary.changeStat ? { added: acc.added + summary.changeStat.added, removed: acc.removed + summary.changeStat.removed } : acc,
        { added: 0, removed: 0 },
      ),
    [rawFileSummaries],
  );
  const diffCount = React.useMemo(() => <DiffCountBadge summary={aggregated} />, [aggregated]);
  const kindLabel = intl.formatMessage({
    id: resolveEditKindLabel(
      rawFileSummaries.map((summary) => summary.operationKind),
      rawFileSummaries.map((summary) => summary.actionLabel),
      isRunning,
      { kind: toolCall.kind, title: toolCall.title, input: toolCall.input, output: toolCall.output, raw: toolCall.raw },
    ),
  });
  const togglePreset = multiple ? { canToggle: true, forceOpen: false, autoOpen: false } : EDIT_TOGGLE_PRESET;
  const expandedPrimaryText = React.useMemo(
    () =>
      rawFileSummaries.length > 1 ? (
        <span>
          {intl.formatMessage({ id: "chat.toolCall.edit.multipleFiles" }, { count: String(rawFileSummaries.length) })}
        </span>
      ) : (
        primaryText
      ),
    [intl, primaryText, rawFileSummaries.length],
  );
  const singlePatch = toPatchPreview(rawFileSummaries.length === 1 ? (rawFileSummaries[0] ?? null) : null);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () =>
      rawFileSummaries.length === 0 ? (
        <>
          <ToolCallExpandedContent
            childToolList={null}
            displayModel={props.displayModel}
            toolCall={toolCall}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
          <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        </>
      ) : multiple ? (
        <>
          <div className="ml-2 space-y-2 border-border border-l pl-3.5 border-border">
            {rawFileSummaries.map((summary, index) => (
              <FileWriteChildRow
                key={`${summary.path}:${index}`}
                summary={summary}
                isRunning={isRunning}
                statusLabel={displayedStatus}
                errorText={errorText}
                toolId={`${toolCall.toolId}:${index}`}
                isFailed={failed}
                onOpenCodeViewer={props.onOpenCodeViewer}
                onOpenFileLink={props.onOpenFileLink}
                onOpenBrowserUrl={props.onOpenBrowserUrl}
                childToolList={null}
                displayModel={props.displayModel}
                toolCall={toolCall}
                workspacePath={props.workspacePath}
                theme={props.theme}
                codePreviewSettings={props.codePreviewSettings}
                showIcon={false}
                sourceLabel={props.sourceLabel}
              />
            ))}
            <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {singlePatch?.type === "patch" ? <EditInlineDiffContent preview={singlePatch.source} theme={props.theme} codePreviewSettings={props.codePreviewSettings} /> : null}
            <ToolCallExpandedContent
              childToolList={props.childToolList}
              displayModel={props.displayModel}
              inlinePreviewOverride={singlePatch?.type === "patch" ? { type: "none" } : undefined}
              toolCall={toolCall}
              workspacePath={props.workspacePath}
              theme={props.theme}
              codePreviewSettings={props.codePreviewSettings}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink}
              onOpenBrowserUrl={props.onOpenBrowserUrl}
            />
            <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
          </div>
        </>
      ),
    [props.childToolList, props.codePreviewSettings, props.displayModel, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.sourceLabel, props.theme, props.workspacePath, displayedStatus, errorText, loadFull, multiple, failed, isRunning, rawFileSummaries, singlePatch, toolCall],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={EDIT_TOOL_ICON}
        showIcon={props.showIcon !== false}
        {...togglePreset}
        kindLabel={(props.kindLabelOverride as string) ?? kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        expandedPrimaryText={expandedPrimaryText}
        secondaryText={secondaryText}
        diffCount={diffCount}
        hideDiffCountWhenOpen={multiple}
        statusLabel={displayedStatus}
        statusTooltip={failed ? errorText : undefined}
        showFailureStatus={failed}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
    </>
  );
}

/* ---- 原 opt（105465 / 90659）：FileReadToolView ---- */

/** 原 ipt：toolCall → 文件入口（entryType/file/fileName/path/filePath） */
declare function resolveFileReadEntry(toolCall: ToolCall): {
  entryType: string;
  fileName: string;
  path: string;
  filePath?: string | null;
} | null;
/** 原 apt：可读文件摘要标签 */
declare const ReadSummaryLabel: React.FC<{ summary: NonNullable<ReturnType<typeof resolveFileReadEntry>>; clickable: boolean; onClick: () => void }>;
const READ_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function FileReadToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText, onOpenCodeViewer } = props;
  const { toolCall } = toolCallNode;
  const entry = resolveFileReadEntry(toolCall);
  const clickable = entry?.entryType === "file" && !!onOpenCodeViewer;
  const openEntry = React.useCallback(() => {
    if (!entry || entry.entryType !== "file" || !onOpenCodeViewer) return;
    onOpenCodeViewer({ type: "file", title: entry.fileName, path: entry.path });
  }, [onOpenCodeViewer, entry]);
  const primaryText = React.useMemo(
    () =>
      entry ? (
        <ReadSummaryLabel summary={entry} clickable={clickable} onClick={openEntry} />
      ) : (
        toolCall.title ?? toolCall.kind ?? intl.formatMessage({ id: "chat.toolCall.read.read" })
      ),
    [clickable, intl, openEntry, entry, toolCall.kind, toolCall.title],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={READ_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.toolCall.read.reading" : "chat.toolCall.read.read" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={entry ? PathSecondaryText(entry.filePath) : undefined}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        content={null}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 upt（105569 / 90768）：SearchToolView + lpt ---- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value == "object" && !!value && !Array.isArray(value);
}
/** 原 lpt（— / 90700）：搜索类工具主文本（list_files/search/grep/glob + 通用字段回退） */
function resolveSearchLabel(intl: IntlShape, input: unknown): string {
  if (typeof input == "string") {
    const trimmed = input.trim();
    return trimmed.length > 0
      ? intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query: trimmed })
      : intl.formatMessage({ id: "chat.toolCall.search.find" });
  }
  if (!isPlainObject(input)) return intl.formatMessage({ id: "chat.toolCall.search.find" });
  const parsedCmd = input.parsed_cmd;
  if (Array.isArray(parsedCmd)) {
    for (const item of parsedCmd) {
      if (!isPlainObject(item) || typeof item.type != "string") continue;
      if (item.type === "list_files") {
        const cwd = typeof input.cwd == "string" && input.cwd.trim().length > 0 ? input.cwd.trim().replace(/\/+$/, "") : undefined;
        return cwd
          ? intl.formatMessage({ id: "chat.toolCall.search.listIn" }, { cwd })
          : intl.formatMessage({ id: "chat.toolCall.search.list" });
      }
      if (item.type === "search" || item.type === "grep" || item.type === "glob") {
        const query =
          typeof item.pattern == "string" ? item.pattern.trim() : typeof item.query == "string" ? item.query.trim() : typeof item.path == "string" ? item.path.trim() : "";
        return query.length > 0
          ? intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query })
          : intl.formatMessage({ id: "chat.toolCall.search.find" });
      }
    }
  }
  for (const field of ["search_query", "searchQuery", "query", "pattern", "path", "url", "prompt", "target", "name"]) {
    const value = input[field];
    if (typeof value != "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return intl.formatMessage({ id: "chat.toolCall.search.findWithQuery" }, { query: trimmed });
  }
  return intl.formatMessage({ id: "chat.toolCall.search.find" });
}
const SEARCH_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function SearchToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const label = resolveSearchLabel(intl, toolCall.input);
  const primaryText = React.useMemo(() => <span className="truncate">{label}</span>, [label]);
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SEARCH_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        kindLabel={(props.kindLabelOverride as string) ?? intl.formatMessage({ id: isRunning ? "chat.toolCall.search.searching" : "chat.toolCall.search.searched" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        content={null}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Spt（105825 / 91001）：ExploreToolView + 命令分桶 ---- */

/** 原 ppt：剥离 shell -lc 包裹 */
function unwrapShellCommand(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:\/bin\/)?(?:zsh|bash|sh)\s+-lc\s+([\s\S]+)$/i);
  if (!match?.[1]) return trimmed;
  const inner = match[1].trim();
  return (inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'")) ? inner.slice(1, -1).trim() : inner;
}
/** 原 mpt：input → 命令列表（字符串/数组/parsed_cmd，&&/||/; 切分去重） */
function extractCommands(input: unknown): string[] {
  const commands: string[] = [];
  const push = (value: unknown) => {
    if (typeof value == "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) commands.push(trimmed);
      return;
    }
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item == "string")) {
        const list = value as string[];
        const lcIndex = list.findIndex((item) => item === "-lc");
        if (lcIndex >= 0 && typeof list[lcIndex + 1] == "string") {
          const inner = list[lcIndex + 1].trim();
          if (inner.length > 0) {
            commands.push(inner);
            return;
          }
        }
        const joined = list.join(" ").trim();
        if (joined.length > 0) commands.push(joined);
        return;
      }
      for (const item of value) {
        if (!isPlainObject(item)) continue;
        const cmd = item.cmd;
        if (typeof cmd == "string" && cmd.trim().length > 0) commands.push(cmd.trim());
      }
    }
  };
  push(input);
  if (isPlainObject(input)) {
    for (const field of ["command", "cmd", "script", "parsed_cmd"]) push(input[field]);
  }
  return Array.from(new Set(commands.flatMap((command) => unwrapShellCommand(command).split(/&&|\|\||;/g))))
    .map((command) => command.trim())
    .filter(Boolean);
}
/** 原 hpt：子调用 → 桶（search/list/file） */
function classifyExploreBucket(entry: { kind: string; title?: string | null; input?: unknown }): "search" | "list" | "file" {
  const head = `${entry.kind} ${entry.title ?? ""}`.toLowerCase();
  const body = extractCommands(entry.input).join(" ; ").toLowerCase();
  if (/(\bgrep\b|\bsearch\b|\bfetch\b|\bweb.?search\b|\bweb.?fetch\b)/i.test(head) || /(^|\s)(rg|grep|ripgrep|git\s+grep)(\s|$)/i.test(body)) return "search";
  if (/(\bglob\b|\bfind\b|\blist\b|\btree\b|\bdir\b|\bls\b)/i.test(head) || /(^|\s)(ls|find|tree|dir)(\s|$)/i.test(body)) return "list";
  return "file";
}
/** 原 $Q：桶计数文案 */
function exploreBucketLabel(intl: IntlShape, bucket: "search" | "list" | "file" | string, count: number): string {
  switch (bucket) {
    case "search":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.search.one" : "chat.toolCall.explore.bucket.search.other" });
    case "list":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.list.one" : "chat.toolCall.explore.bucket.list.other" });
    case "file":
      return intl.formatMessage({ id: count === 1 ? "chat.toolCall.explore.bucket.file.one" : "chat.toolCall.explore.bucket.file.other" });
    default:
      return intl.formatMessage({ id: "chat.toolCall.explore.bucket.items" });
  }
}
/** 原 gpt：桶计数 → 摘要串 */
function formatExploreSummary(intl: IntlShape, counts: { search: number; list: number; file: number }): string {
  const parts: string[] = [];
  if (counts.search > 0) parts.push(`${counts.search} ${exploreBucketLabel(intl, "search", counts.search)}`);
  if (counts.list > 0) parts.push(`${counts.list} ${exploreBucketLabel(intl, "list", counts.list)}`);
  if (counts.file > 0) parts.push(`${counts.file} ${exploreBucketLabel(intl, "file", counts.file)}`);
  return parts.length > 0 ? parts.join(", ") : intl.formatMessage({ id: "chat.toolCall.explore.emptySummary" });
}
const EXPLORE_TOOL_ICON = <IconSearch className="size-4 shrink-0 text-foreground-subtle" />;

export function ExploreToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall, childToolCalls = [] } = toolCallNode;
  const summary = formatExploreSummary(
    intl,
    childToolCalls.reduce(
      (counts, child) => {
        const bucket = classifyExploreBucket({ kind: child.toolCall.kind, title: child.toolCall.title, input: child.toolCall.input });
        counts[bucket] += 1;
        return counts;
      },
      { search: 0, list: 0, file: 0 },
    ),
  );
  const kindLabel = intl.formatMessage({ id: "chat.toolCall.explore.label" });
  const streaming = isRunning ? resolveStreamingChildSummary(intl, childToolCalls, props, { includeChildActionKindLabel: true }) : null;
  const renderContent = React.useCallback(
    () =>
      childToolCalls.length > 0 ? (
        <div className="ml-2 space-y-2 border-border border-l pl-3.5 border-border">
          {childToolCalls.map((child) => (
            <ToolCallBlock
              key={child.toolCall.toolId}
              toolCallNode={child}
              workspacePath={props.workspacePath}
              showIcon={false}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink}
              onOpenBrowserUrl={props.onOpenBrowserUrl}
              onOpenAutomationsMain={props.onOpenAutomationsMain}
              onLoadFullToolCallFields={props.onLoadFullToolCallFields}
              displayModel={props.displayModel}
              rawFileSummaries={[]}
              isRunning={isRunning}
              statusLabel={statusLabel}
              childToolList={null}
              viewerSource={null}
              showTodoToolCalls
              disableSummaryContentAnimation={false}
            />
          ))}
        </div>
      ) : null,
    [childToolCalls, props.onLoadFullToolCallFields, props.onOpenAutomationsMain, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.workspacePath, props.displayModel, isRunning, statusLabel],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={EXPLORE_TOOL_ICON}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        kindLabel={kindLabel}
        expandedKindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={streaming ? streaming.primaryText : summary}
        expandedPrimaryText={summary}
        secondaryText={streaming?.secondaryText}
        expandedSecondaryText={null}
        summaryContentSeparator="·"
        animateSummaryContent
        disableSummaryContentAnimation={props.disableSummaryContentAnimation}
        summaryContentKey={streaming?.animationKey ?? `explore:${toolCall.toolId}:${isRunning ? "running" : "done"}:${summary}`}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={streaming?.title ?? (isRunning ? summary : toolCall.title)}
        expandedTitle={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Vpt（106243 / 91282）：AgentToolView ---- */

/* ── tombstone〔A1-P1-B10〕：agent 族 13 declare（Ppt/t$/Npt/Opt/l$/kpt/jpt/Mpt + Fpt/Lpt/Rpt/Bpt/zpt）
 * 实体化 → ./AgentToolBlocks（styles 105957–106139 / 106141–106290 逐字 + 卫星 105162–105185；
 * roundtrip 三段 EXACT，/tmp/a1r0-p1/p10/）。c$（AgentDetailRow）随 Bpt 隐依赖同批实体化；
 * Ipt@106140 早以 AGENT_TOOL_ICON 在案（见下），区段切分不重复。消费面改文件头真实 import，调用面逐字不变。 ── */
/* ── tombstone〔A1-P1-B11〕：手写 hashPaletteColor（原 Xft/Yft 近似，A0 期未接线）删除——
 * Xft 逐字实体 = hashToAgentPaletteColor ∈ ./ShellCommandBlocks（styles 105186–105190）；
 * Yft 早已实体化 ∈ ./AgentToolBlocks（isAgentPaletteColor，styles 105183）。调色板兜底链接线见 AgentToolView。 ── */
const AGENT_TOOL_ICON = <IconBot className="size-4 shrink-0 text-foreground-subtle" />;

export function AgentToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall, childToolCalls = [] } = props.toolCallNode;
  const prompt = extractAgentPrompt(toolCall);
  const kindLabel = fallbackMessage(intl, "chat.toolCall.agent.fallback", "SubAgent");
  const fallbackName = resolveAgentFallbackName(toolCall, kindLabel);
  const typeLabel = resolveAgentTypeLabel(toolCall, "", props.authoritativeAgentType);
  const workspaceAgents = useWorkspaceAgents(props.workspacePath);
  const globalAgents = useGlobalAgents();
  const agents = workspaceAgents && workspaceAgents.length > 0 ? workspaceAgents : globalAgents.length > 0 ? globalAgents : getGlobalAgents();
  const agentColor = React.useMemo(() => {
    const normalized = normalizeAgentName(typeLabel ?? "");
    if (!normalized) return undefined;
    return agents.find((agent) => {
      const byName = normalizeAgentName(agent.name);
      const byId = normalizeAgentName(agent.id);
      return byName === normalized || byId === normalized;
    })?.color;
  }, [typeLabel, agents]);
  /* 〔A1-P1-B11〕调色板链按束真身接线：f = s ? (d ?? kpt(n) ?? Xft(s)) : null（styles 106315）。 */
  const resolvedAgentColor = typeLabel
    ? agentColor ?? resolveAgentColorHash(toolCall) ?? hashToAgentPaletteColor(typeLabel)
    : null;
  const colorBadge =
    typeLabel && resolvedAgentColor ? <AgentColorBadge color={resolvedAgentColor} name={typeLabel} /> : null;
  const streaming = props.isRunning ? resolveStreamingChildSummary(intl, childToolCalls, props, { includeChildActionKindLabel: true }) : null;
  const outputFile = extractAgentOutputFile(toolCall);
  const outputText = extractAgentOutputText(toolCall);
  const thought = toolCall.thought?.trim();
  const primaryText = React.useMemo(() => <span className="truncate">{fallbackName}</span>, [fallbackName]);
  const summaryAction = React.useMemo(
    () =>
      props.agentSummaryAction
        ? ({ ...props.agentSummaryAction, ariaLabel: fallbackMessage(intl, "chat.toolCall.agent.openInSidePane", "Open on the right") } as {
            testId?: string;
            ariaLabel: string;
            onActivate: () => void;
          }) /* A0-D 类型垫片：agentSummaryAction 运行时含 onActivate（Conversation 透传 unknown） */
        : undefined,
    [props.agentSummaryAction, intl],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="ml-2 space-y-3 border-border border-l pl-3.5">
        {outputFile ? <AgentOutputFileCard outputFile={outputFile.outputFile} hasActivity={!!(outputText || thought)} isRunning={props.isRunning} status={toolCall.status} /> : null}
        {prompt ? (
          <AgentPromptBlock
            prompt={prompt}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        {thought ? (
          <AgentLabeledBlock
            label={fallbackMessage(intl, "chat.toolCall.agent.thought", "Agent thought")}
            content={thought}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        {outputText ? (
          <AgentLabeledBlock
            label={fallbackMessage(intl, "chat.toolCall.agent.output", "Agent output")}
            content={outputText}
            workspacePath={props.workspacePath}
            theme={props.theme}
            codePreviewSettings={props.codePreviewSettings}
            onOpenCodeViewer={props.onOpenCodeViewer}
            onOpenFileLink={props.onOpenFileLink}
            onOpenBrowserUrl={props.onOpenBrowserUrl}
          />
        ) : null}
        <AgentChildToolList {...props} childToolCalls={childToolCalls} />
      </div>
    ),
    [outputText, thought, outputFile, childToolCalls, props, intl, toolCall.status],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={AGENT_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={false}
        forceOpen={false}
        summaryAction={summaryAction}
        kindLabel={kindLabel}
        expandedKindLabel={kindLabel}
        kindDetail={colorBadge}
        expandedKindDetail={colorBadge}
        sourceLabel={undefined}
        autoCollapseOnComplete
        primaryText={streaming ? streaming.primaryText : primaryText}
        expandedPrimaryText={primaryText}
        secondaryText={streaming?.secondaryText}
        expandedSecondaryText={null}
        summaryContentSeparator="·"
        animateSummaryContent
        disableSummaryContentAnimation={props.disableSummaryContentAnimation}
        summaryContentKey={streaming?.animationKey ?? `agent:${toolCall.toolId}:${fallbackName}`}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={streaming?.title ?? fallbackName}
        expandedTitle={fallbackName}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Qpt（106609 / 91478）+ Hpt/Xpt/Ypt：FallbackToolView + CUA 权限引导 ---- */

/** 原 Upt/Wpt/Gpt/Kpt/qpt/Jpt/f$/p$：CUA 工具与权限失败判定 */
function nestedToolName(value: unknown): string | null {
  if (!isPlainObject(value)) return null;
  const plain = (v: unknown) => (typeof v == "string" && v.trim().length > 0 ? v.trim() : null);
  return (
    plain(value.toolName) ??
    plain(value.tool_name) ??
    plain(value.name) ??
    (isPlainObject(value._meta) && isPlainObject(value._meta.zcode) ? plain((value._meta.zcode as Record<string, unknown>).toolName) : null)
  );
}
function normalizeToolNameForMatch(name?: string | null): string {
  return name?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}
function isCuaToolName(name?: string | null): boolean {
  const normalized = normalizeToolNameForMatch(name);
  return normalized === "zcode-cua" || normalized.startsWith("mcp--zcode-cua--");
}
function isCuaAccessRequestName(name?: string | null): boolean {
  return normalizeToolNameForMatch(name).includes("request-access");
}
function cuaCandidateNames(toolCall: ToolCall): string[] {
  return [
    typeof toolCall.toolName == "string" ? toolCall.toolName : null,
    typeof toolCall.kind == "string" ? toolCall.kind : null,
    typeof toolCall.title == "string" ? toolCall.title : null,
    nestedToolName(toolCall.raw),
  ].filter((name): name is string => name !== null);
}
function parseJsonish(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  if (typeof value == "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}
const CUA_PERMISSION_PATTERN = /accessibility|辅助功能|screen[_ -]?recording|screen[_ -]?capture|屏幕录制/i;
function mentionsCuaPermission(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  const parsed = parseJsonish(value, depth);
  if (typeof parsed == "string") return CUA_PERMISSION_PATTERN.test(parsed);
  if (Array.isArray(parsed)) return parsed.some((item) => mentionsCuaPermission(item, depth + 1));
  if (isPlainObject(parsed)) {
    return Object.entries(parsed).some(([key, item]) => CUA_PERMISSION_PATTERN.test(key) || mentionsCuaPermission(item, depth + 1));
  }
  return false;
}
function isCuaPermissionDenied(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  const parsed = parseJsonish(value, depth);
  if (typeof parsed == "string") {
    return (
      CUA_PERMISSION_PATTERN.test(parsed) &&
      /(denied|not granted|permission|action_required|zcode cua helper|未授权|没有获得)/i.test(parsed)
    );
  }
  if (Array.isArray(parsed)) return parsed.some((item) => isCuaPermissionDenied(item, depth + 1));
  if (!isPlainObject(parsed)) return false;
  for (const [key, raw] of Object.entries(parsed)) {
    const text = typeof raw == "string" ? raw.toLowerCase() : null;
    const field = key.toLowerCase();
    if (
      (field === "accessibility" && raw === false) ||
      (field === "input_permission" && text === "denied") ||
      (field === "screen_recording" && text !== null && text !== "granted") ||
      (field === "screen_capture_available" && raw === false) ||
      (field === "status_after" && text === "denied") ||
      (field === "action_required" && text?.includes("accessibility")) ||
      (field === "missing" && Array.isArray(raw) && raw.some((item) => item === "accessibility" || item === "screen_recording")) ||
      (field === "blocked_by" && Array.isArray(raw) && (raw.includes("accessibility") || raw.includes("screen_recording"))) ||
      isCuaPermissionDenied(raw, depth + 1)
    ) {
      return true;
    }
  }
  return false;
}
/** 原 Ypt：CUA 工具且输出含权限拒绝 */
function isCuaPermissionFailure(toolCall: ToolCall): boolean {
  return cuaCandidateNames(toolCall).some(isCuaToolName) ? isCuaPermissionDenied(toolCall.output) || isCuaPermissionDenied(toolCall.error) : false;
}
/** 原 Xpt（106604 / 91469）：切模式请求判定（zcode-cua + request-access/描述提及） */
export function isCuaAccessRequest(entry: { kind: string; title?: string | null; raw?: unknown; description?: unknown }): boolean {
  const names = cuaCandidateNames({ kind: entry.kind, title: entry.title, raw: entry.raw, toolId: "", toolName: entry.kind, status: "" });
  return names.some(isCuaToolName) ? names.some(isCuaAccessRequestName) || mentionsCuaPermission(entry.description) || mentionsCuaPermission(entry.raw) : false;
}

/** 原 Hpt（106405 / 91360）：CUA 权限引导面板（辅助功能/屏幕录制 + 拖拽助手） */
export function CuaPermissionOnboardingPanel({ platform }: { platform: PlatformService | null }) {
  const { intl } = useIntlContext();
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (typeof platform?.prepareCuaHelperPermissionDrag == "function") {
      platform.prepareCuaHelperPermissionDrag().catch(() => {});
    }
  }, [platform]);
  if (typeof platform?.openCuaPermissionOnboarding != "function" && typeof platform?.openCuaAccessibilitySettings != "function") return null;
  const open = async (permission: "accessibility" | "screen_recording") => {
    setBusy(true);
    try {
      const result =
        typeof platform.openCuaPermissionOnboarding == "function"
          ? await platform.openCuaPermissionOnboarding({ initialPermission: permission })
          : permission === "accessibility"
            ? await platform.openCuaAccessibilitySettings?.()
            : { success: false, error: "not_supported" };
      if (result?.success === false && !result.canceled) {
        logger.warn("[cuaPermission] open failed", { error: result.error ?? "unknown error" });
      }
    } catch (error) {
      logger.warn("[cuaPermission] open threw", { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void open("accessibility")}>
          {intl.formatMessage({ id: busy ? "chat.cuaPermission.opening" : "chat.cuaPermission.openAccessibility" })}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || typeof platform?.openCuaPermissionOnboarding != "function"}
          onClick={() => void open("screen_recording")}
        >
          {intl.formatMessage({ id: busy ? "chat.cuaPermission.opening" : "chat.cuaPermission.openScreenRecording" })}
        </Button>
      </div>
      <button
        type="button"
        draggable={typeof platform?.startCuaHelperPermissionDrag == "function"}
        disabled={typeof platform?.startCuaHelperPermissionDrag != "function"}
        aria-label={intl.formatMessage({ id: "chat.cuaPermission.dragTitle" })}
        className="flex min-w-0 cursor-grab items-center gap-3 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-left active:cursor-grabbing disabled:cursor-default disabled:opacity-70"
        onDragStart={(event) => {
          event.preventDefault();
          platform?.startCuaHelperPermissionDrag?.();
        }}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
          <IconGauge className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "chat.cuaPermission.dragTitle" })}</p>
          <p className="text-ui-base leading-5 text-foreground-subtle">{intl.formatMessage({ id: "chat.cuaPermission.helperPathHint" })}</p>
        </div>
        <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
      </button>
    </div>
  );
}
const FALLBACK_TOOL_ICON = <IconShield className="size-4 shrink-0 text-foreground-subtle" />;

export function FallbackToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const platform = usePlatformService() as unknown as PlatformService; /* 〔A1-P1-B10〕型缝：二段断言（Bots 1113 判例）。
    bundle 真值同一平台对象（Qpt@106659 n = S()）；ime 视角型（selectDirectory 族）与本件消费视角型
    （ConversationLeaves PlatformService，showTaskNotification 族）各为 A0 期近似，互不兼容，断言归一。 */
  const { toolCallNode, isRunning, statusLabel, errorText, childToolList, displayModel } = props;
  const { toolCall } = toolCallNode;
  const kindLabel = toolCall.kind.length > 0 ? toolCall.kind[0].toUpperCase() + toolCall.kind.slice(1) : toolCall.kind;
  const hasInlinePreview = displayModel.inlinePreview.type !== "none";
  const cuaFailure = isCuaPermissionFailure(toolCall);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <>
        <ToolCallExpandedContent
          childToolList={childToolList}
          displayModel={displayModel}
          toolCall={toolCall}
          workspacePath={props.workspacePath}
          theme={props.theme}
          codePreviewSettings={props.codePreviewSettings}
          onOpenCodeViewer={props.onOpenCodeViewer}
          onOpenFileLink={props.onOpenFileLink}
          onOpenBrowserUrl={props.onOpenBrowserUrl}
        />
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        {cuaFailure ? <CuaPermissionOnboardingPanel platform={platform} /> : null}
        {hasInlinePreview ? null : (
          <pre className="px-4 py-3 rounded-xl bg-surface text-ui-xs mt-1 text-foreground-subtle max-h-50 overflow-auto">{JSON.stringify(toolCall, null, 2)}</pre>
        )}
      </>
    ),
    [childToolList, displayModel, loadFull, hasInlinePreview, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.codePreviewSettings, props.theme, props.workspacePath, toolCall, cuaFailure, platform],
  );
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={FALLBACK_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={props.canToggle ?? true}
      forceOpen={props.forceOpen ?? false}
      kindLabel={(props.kindLabelOverride as string) ?? kindLabel}
      sourceLabel={props.sourceLabel}
      primaryText={toolCall.title ?? intl.formatMessage({ id: "chat.toolCall.toolCall" })}
      secondaryText={toolCall.status === "failed" ? undefined : statusLabel}
      statusLabel={toolCall.status === "failed" ? statusLabel : undefined}
      statusTooltip={toolCall.status === "failed" ? errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={isRunning}
      title={toolCall.title}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 omt（106753 / 91604）：GoalToolView ---- */

function jsonPath(value: unknown, path: string[]): unknown {
  let current: unknown = value;
  for (const key of path) {
    if (!isPlainObject(current)) return undefined;
    current = current[key];
  }
  return current;
}
function parseJsonText(value: unknown): unknown {
  if (typeof value != "string") return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}
function isEmptyValue(value: unknown): boolean {
  return value == null || (typeof value == "string" && value.trim().length === 0);
}
function stringifyLoose(value: unknown): string {
  if (typeof value == "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
function sameLooseValue(a: unknown, b: unknown): boolean {
  return isEmptyValue(a) || isEmptyValue(b) ? false : stringifyLoose(a) === stringifyLoose(b);
}
/** 原 nmt/rmt：goal 结果/内容多源抽取 */
function extractGoalResult(toolCall: ToolCall): unknown {
  for (const candidate of [toolCall.output, jsonPath(toolCall.raw, ["result", "content"]), jsonPath(toolCall.raw, ["rawOutput"]), jsonPath(toolCall.raw, ["output"])]) {
    const parsed = parseJsonText(candidate);
    if (!isEmptyValue(parsed)) return parsed;
  }
  return undefined;
}
function extractGoalContent(toolCall: ToolCall, result: unknown): unknown {
  for (const candidate of [toolCall.content, jsonPath(toolCall.raw, ["content"]), jsonPath(toolCall.raw, ["result", "display"])]) {
    const parsed = parseJsonText(candidate);
    if (!isEmptyValue(parsed) && !sameLooseValue(parsed, result)) return parsed;
  }
  return undefined;
}
/** 原 imt：goal 视图模型（result/content/thought/error 去重合并） */
function buildGoalViewModel(toolCall: ToolCall, errorText?: string): Record<string, unknown> {
  const result = extractGoalResult(toolCall);
  const content = extractGoalContent(toolCall, result);
  const thought = parseJsonText(toolCall.thought);
  const model: Record<string, unknown> = { status: toolCall.status };
  if (!isEmptyValue(result)) model.result = result;
  if (!isEmptyValue(content)) model.content = content;
  if (!isEmptyValue(thought) && !sameLooseValue(thought, result) && !sameLooseValue(thought, content)) model.thought = thought;
  if (errorText) model.error = errorText;
  return model;
}
function stringifyPretty(value: unknown): string {
  if (typeof value == "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
const GOAL_TOOL_ICON = <IconTarget className="size-4 shrink-0 text-foreground-subtle" />;

export function GoalToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const body = stringifyPretty(buildGoalViewModel(toolCall, props.errorText));
  const kindLabel = intl.formatMessage({ id: "chat.toolCall.goal.label" });
  const primaryText = React.useMemo(
    () => (
      <span className="min-w-0 truncate">{toolCall.title ?? kindLabel}</span>
    ),
    [kindLabel, toolCall.title],
  );
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <>
        <div className="space-y-2">
          <h4 className="text-ui-base font-medium uppercase tracking-wide text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.result" })}</h4>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface px-3 py-3 font-mono text-ui-base text-foreground">{body}</pre>
        </div>
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
      </>
    ),
    [loadFull, intl, body, toolCall.snapshotRefs, toolCall.toolId],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={GOAL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        kindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={toolCall.status === "failed" ? undefined : props.statusLabel}
        statusLabel={toolCall.status === "failed" ? props.statusLabel : undefined}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
    </>
  );
}

/* ── tombstone〔A1-P1-B15〕：手写 NodeReplToolView（约 160 行）+ 五 declare（buildNodeReplModel 原 Tmt/
 * resolveNodeReplStatus 原 Mmt/isPlainTextOutput 原 jmt/looksLikeJson 原 Amt/NodeReplImageList 原 Emt）+
 * NODE_REPL_ICON 手写 const 删除——束真身 Nmt@107168 全闭包（106856–107111 + 107115–107179 + 107216–107431，
 * 含 smt 标题归一/v$ 记录判定/Tmt 模型归一/Emt 图像画廊/Amt JSON 判定/jmt 短文本判定/Mmt 头部归一 +
 * Dmt 图标/kmt 纯文本上限）已逐字转录实体化于 ./NodeReplBlocks。消费面改文件尾转导出，调用面逐字不变。
 * 束真身更正披露：手写体为简化卡面；束真身含 smt NODE_REPL_GENERIC_TITLE_PATTERN 标题归一 + q_/wa 图标面 +
 * ImageGalleryGroup/ImageLightbox 图像面（PreviewCards 域）+ ToolSnapshotRefs 加载面，见 NodeReplBlocks 叶头注。 ── */

/* ── tombstone〔A1-P1-B13〕：手写 AutomationToolView（1512–1649，约 138 行）删除——束真身 Wmt@107520–107720
 * 已逐字实体化于 ./AutomationViewBlocks（四族收割之 MCP-Wmt 族；B11 助手域 107432–107519 邻叶在案）。
 * 消费面改文件头转导出（./AutomationViewBlocks），调用面（ToolCallBlock 406 派发 extractMcpToolInfo 判定）逐字不变。
 * 束真身更正披露：手写体为简化卡面；束真身含 CodeSurface 结果面（json/log 双模）+ Collapsible 详情面
 * （description/parameters 双 section）+ snapshotRefs 加载器，见 AutomationViewBlocks 叶头注。 ── */

/* ── tombstone〔A1-P1-B13〕：Session 三 declare（Zmt/Qmt/$mt）+ SESSION_CONTEXT_ICON 手写 const + 手写
 * SessionContextToolView（1651–1738，约 88 行）删除——束真身 eht@107883 全闭包（107816–107994，含 Jmt 图标/
 * k$/A$/Ymt/j$/Xmt/M$ 助手）已逐字实体化于 ./SessionToolBlocks。消费面改文件头转导出，调用面逐字不变。
 * 图标真身更正：aye=Sa('book-open-text')@26732（lucide BookOpenText）；A0 手写期误映 IconGlobe。 ── */

/* ── tombstone〔A1-P1-B13〕：Skill 五 declare（fht/pht/V$/z$/dht）+ SKILL_TOOL_ICON 手写 const + 手写
 * SkillToolView（1740–1825，约 86 行）删除——束真身 mht@108357 全闭包（108310–108468，含 dht 图标/z$/B$ 助手）
 * 已逐字实体化于 ./SkillToolBlocks。消费面改文件头转导出，调用面逐字不变。
 * 图标真身更正：Yv=Sa('wand-sparkles')@28014（lucide WandSparkles）；A0 手写期 declare IconSparklesLike 占位销账。 ── */

/* ── tombstone〔A1-P1-B15〕：手写 SwitchModeToolView（约 126 行）+ isInteractiveChild 手写助手删除——
 * 束真身 ght@108476 全闭包（108469–108605，含 hht 交互子判定 + qZ planMarkdown 抽取链）已逐字转录实体化于
 * ./PlanToolBlocks（同批 qmt@107754 plan-guidance 族 + qZ 链 98073–98127/99769–99814/107721–107815）。
 * 消费面改文件尾转导出，调用面（ToolCallBlock 派发）逐字不变。
 * 束真身更正披露：手写体为简化 plan 面板；束真身 ght 消费 qZ(toolCall, workspacePath) → markdown/planFilePath，
 * 经 MarkdownRenderer 渲染 + Klt ToolInputSurface/aQ ToolErrorSurface 兜底面，见 PlanToolBlocks 叶头注。 ── */

/* ── tombstone〔A1-P1-B13〕：Task 十 declare（F$/yht/bht/xht/U$/H$/Tht/Eht/W$ + F$ 复用面）+ TaskOutputRaw/
 * TaskStopRaw 接口 + 手写 TaskOutputToolView/TaskControlToolView（1953–2116，约 164 行）删除——束真身
 * Sht@108629/Dht@108776 全闭包（107995–108075 归一域 + 108606–108884 双视图族，含 kye/R_ 图标）已逐字实体化于
 * ./TaskToolBlocks。消费面改文件头转导出，调用面（ToolCallBlock 419 派发）逐字不变。
 * F$ 跨族共享披露：normalizeTaskOutputRaw 同被 RespondToCoordinator/SendMessage 族消费，留批经本叶 import 收敛。 ── */

/* ── tombstone〔A1-P1-B14〕：Todo 四 declare（extractTodoItems/TodoStatusIcon/TODO_STATUS_CLASSES/
 * IconListTodoLike）+ TodoItem 接口 + TODO_TOOL_ICON 手写 const + 手写 TodoToolView（约 76 行）删除——
 * 束真身 Oht/kht/Aht/jht/Mht@108885–109009 全闭包（含 Gye=Sa('list-todo')@27341 图标 + I_/C_/z_ 状态图标）
 * 已逐字实体化于 ./TodoToolBlocks。消费面改文件尾转导出，调用面（ToolCallBlock 413 派发）逐字不变。
 * 束真身更正披露：手写期 declare 面 ti/Kne 近似签名 → 束真身 Aht = ti({title,kind,output}) ?? Kne({title,
 * kind,input})（src-HCld2afU.js 导出 d/u = SrcSharedB extractTodosFromToolOutput/extractTodosFromToolInput）。 ── */

/* ── tombstone〔A1-P1-B14〕：AskUserQuestion 三 declare（normalizeAskQuestions/extractAnswers/
 * formatAnswerText）+ AskQuestionModel 接口 + ASK_QUESTION_ICON 手写 const + IconQuestion declare +
 * 手写 AskUserQuestionToolView（约 58 行）删除——束真身 Nht/Pht@109010–109083 全闭包（含
 * vye=Sa('circle-question-mark')@26907 图标）已逐字实体化于 ./TodoToolBlocks。消费面改文件尾转导出，
 * 调用面（ToolCallBlock 415 派发）逐字不变。$h/eg/Ume/Wme 归一域（22980–23040）未实体化 → 新叶叶内
 * declare（跨域判例，同 B13 CodeSurface 族）。 ── */

/* ── 〔A1-P1-B13〕四族束真身转导出（ConversationLeaves 导入面不变）── */
export { AutomationToolView } from './AutomationViewBlocks'; // 原 Wmt（107520）
export { SessionContextToolView } from './SessionToolBlocks'; // 原 eht（107883）
export { SkillToolView } from './SkillToolBlocks'; // 原 mht（108357）
export { TaskOutputToolView, TaskControlToolView } from './TaskToolBlocks'; // 原 Sht（108629）/ Dht（108776）

/* ── 〔A1-P1-B14〕message/Todo/Ask 三族束真身转导出（ConversationLeaves 导入面扩充同批）── */
export { RespondToCoordinatorToolView, SendMessageToolView } from './MessageToolBlocks'; // 原 aht（108091）/ uht（108195）
export { TodoToolView, AskUserQuestionToolView } from './TodoToolBlocks'; // 原 Mht（108905）/ Pht（109011）

/* ── 〔A1-P1-B15〕NodeRepl/plan/switch-mode 三族束真身转导出（ConversationLeaves 导入面扩充同批）── */
export { NodeReplToolView } from './NodeReplBlocks'; // 原 Nmt（107168）
export { PlanGuidanceToolView, SwitchModeToolView } from './PlanToolBlocks'; // 原 qmt（107754）/ ght（108476）
