// A0-S4-4b: 自 modules/ConversationLeaves.tsx §2 工具视图共享件 + 17 工具视图 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §2 全段（469–2650）+ §0 声明群分配本族子集（IconQuestion/展开区三件/代码面六件/文件图标与路径助手/
// 流式子摘要/错误文本/plan 抽取/usePlatformService/代理目录三件 + AgentDescriptor；PlatformService 型别留守 shim 经 type import 取回）。
// 导入路径按 components/conversation/ 深度改指 ../../modules/ / ../ui/。
/* eslint-disable */
import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Pencil as IconPencil, Search as IconSearch, Terminal as IconTerminal, Shield as IconShield, Target as IconTarget, Gauge as IconGauge, Calendar as IconCalendar, Clock as IconClock, Bot as IconBot, Globe as IconGlobe, Check as IconCheck, Copy as IconCopy, ArrowUpRight as IconArrowUpRight, ExternalLink as IconExternal } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { ToolCallBlock, ToolLayout } from '../../modules/Conversation'; // 原 lQ/K$（A0-D 接线：declare → Conversation §4 canonical）
import { MarkdownRenderer, baseName, type CodePreviewSettings, type FileLinkModel } from '../../modules/MarkdownIntegration'; // +CodePreviewSettings/FileLinkModel（A0-D 类型收敛）
import { logger } from '../../modules/SkillStore';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical；IntlShape=ZCodeIntl）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 t 导出，button-laUijeDG.js（A0-D 接线：declare → button.tsx canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import type { ToolCall, ToolCallNode, ToolDisplayModel, OpenCodeViewerFn, ToolCallViewProps, FileSummary, PlatformService } from '../../modules/ConversationLeaves'; // 会话流共享类型 canonical（A0-D 类型收敛）；PlatformService 留守 shim（§5/§6 共用）

/** 图标 */
declare const IconQuestion: React.FC<React.SVGProps<SVGSVGElement>>; // vye

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

/** 代码面（shiki 封装，原 w$/gk 族） */
declare const CodeSurface: React.FC<{
  cardSurface?: boolean;
  code: string;
  copyLabel?: string;
  wrapLabel?: string;
  eagerLayout?: boolean;
  label?: React.ReactNode;
  language?: string;
  appTheme?: string;
  className?: string;
  enableSyntaxHighlighting?: boolean;
  renderMermaid?: boolean;
  style?: unknown;
  wrapLongLines?: boolean;
  children?: React.ReactNode;
}>;
declare const CodeSurfaceHeader: React.FC<{ className?: string; children?: React.ReactNode }>;
declare const CodeSurfaceTitle: React.FC<{ children?: React.ReactNode }>;
declare const CodeSurfaceActions: React.FC<{ children?: React.ReactNode }>;
declare const CodeSurfaceWrapButton: React.FC<{ "aria-label": string; title?: string }>;
declare const CodeSurfaceCopyButton: React.FC<{ "aria-label": string; title?: string }>;
/** 文件图标/路径助手（原 Vc/zc/Hc/Go） */
declare const FileIcon: React.FC<{ src: string; size?: number; className?: string }>;
declare function resolveFileIconMeta(path: string, options?: { basePath?: string }): { fileIconSrc: string };
declare function resolvePathTitle(path: string, basePath?: string): string;
/** 流式子工具摘要（原 xpt） */
declare function resolveStreamingChildSummary(
  intl: IntlShape,
  childToolCalls: ToolCallNode[],
  viewProps: ToolCallViewProps,
  options?: { includeChildActionKindLabel?: boolean },
): { primaryText: React.ReactNode; secondaryText?: React.ReactNode; animationKey?: string; title?: string } | null;
/** 工具错误文本（原 rQ，Conversation.tsx 已还原） */
declare function extractToolErrorText(toolCall: ToolCall): string | null;
/** plan markdown 抽取（原 qZ，横切） */
declare function extractPlanMarkdown(toolCall: ToolCall, workspacePath?: string): { markdown: string | null; planFilePath?: string | null };
declare function usePlatformService(): PlatformService | null;
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

/** 原 Ppt/Npt/Opt/l$/kpt/jpt/Mpt：代理提示/回退名/类型解析/颜色哈希/输出抽取 */
declare function extractAgentPrompt(toolCall: ToolCall): string | null; // Ppt
declare function fallbackMessage(intl: IntlShape, id: string, fallback: string): string; // t$
declare function resolveAgentFallbackName(toolCall: ToolCall, fallback: string): string; // Npt
declare function resolveAgentTypeLabel(toolCall: ToolCall, fallback: string, authoritative?: string): string | null; // Opt
declare function normalizeAgentName(value: string): string | null; // l$
declare function resolveAgentColorHash(toolCall: ToolCall): string | undefined; // kpt
declare function extractAgentOutputFile(toolCall: ToolCall): { outputFile: string; [key: string]: unknown } | null; // jpt
declare function extractAgentOutputText(toolCall: ToolCall): string | null; // Mpt
/** 原 Fpt/Lpt/Rpt：提示/子调用列表/标签段 */
declare const AgentPromptBlock: React.FC<{
  prompt: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
declare const AgentChildToolList: React.FC<ToolCallViewProps & { childToolCalls: ToolCallNode[] }>;
declare const AgentLabeledBlock: React.FC<{
  label: string;
  content: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
}>;
declare const AgentOutputFileCard: React.FC<{ outputFile: string; hasActivity: boolean; isRunning: boolean; status: string }>;
/** 原 zpt：代理名色点徽章 */
declare const AgentColorBadge: React.FC<{ color: string; name: string }>;
/** 原 Xft/Yft：名称哈希色 */
function hashPaletteColor(name: string): string {
  const palette = ["yellow", "red", "orange", "green", "cyan", "blue", "purple", "pink"];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  return palette[hash % palette.length] ?? "blue";
}
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
  const colorBadge =
    typeLabel && agentColor ? <AgentColorBadge color={agentColor} name={typeLabel} /> : null;
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
  const platform = usePlatformService();
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

/* ---- 原 Nmt（107168 / 91932）：NodeReplToolView ---- */

interface NodeReplModel {
  operation: string;
  code?: string;
  title?: string;
  resultText?: string;
  images: Array<{ [key: string]: unknown }>;
  persistedResult?: { sizeLabel: string; artifactPath: string } | null;
  error?: { summary?: string; stack?: string } | null;
  displaySource?: string;
}
/** 原 Tmt：node-repl 视图模型归一（接口级解析） */
declare function buildNodeReplModel(toolCall: ToolCall): NodeReplModel;
/** 原 Mmt：状态标题模型 */
declare function resolveNodeReplStatus(
  model: NodeReplModel,
  status: string,
  isRunning: boolean,
  formatMessage: (id: string) => string,
): { title: string; status?: string | null; detail?: string | null };
/** 原 jmt/Amt：纯文本判定/JSON 判定 */
declare function isPlainTextOutput(text: string): boolean;
declare function looksLikeJson(text: string): boolean;
/** 原 Emt：结果图像列表 */
declare const NodeReplImageList: React.FC<{ images: Array<{ [key: string]: unknown }>; resultImageLabel: string }>;
const NODE_REPL_ICON = <IconTerminal className="size-4 shrink-0 text-foreground-subtle" />;

export function NodeReplToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const model = React.useMemo(() => buildNodeReplModel(toolCall), [toolCall]);
  const format = React.useCallback((id: string) => intl.formatMessage({ id }), [intl]);
  const statusModel = React.useMemo(() => resolveNodeReplStatus(model, toolCall.status, props.isRunning, format), [props.isRunning, format, model, toolCall.status]);
  const resultLabel = format("chat.toolCall.nodeRepl.result");
  const noResultLabel = format("chat.toolCall.nodeRepl.noResult");
  const detailsLabel = format("chat.toolCall.nodeRepl.details");
  const detailContentLabel = format("chat.toolCall.nodeRepl.detailContent");
  const technicalLabel = format("chat.toolCall.nodeRepl.technicalDetails");
  const copyResultLabel = format("chat.toolCall.nodeRepl.copyResult");
  const copyDetailsLabel = format("chat.toolCall.nodeRepl.copyDetails");
  const wrapLabel = format("chat.toolCall.nodeRepl.wrapLines");
  const imageLabel = format("chat.toolCall.nodeRepl.resultImage");
  const persistedLabel = model.persistedResult
    ? intl.formatMessage({ id: "chat.toolCall.nodeRepl.fullResult" }, { size: model.persistedResult.sizeLabel })
    : undefined;
  const errorText = toolCall.status === "failed" ? (model.error?.summary ?? props.errorText) : undefined;
  const hasDetails = !!(model.code || model.error?.stack);
  const hasResult = !!(errorText || model.resultText || model.images.length > 0 || model.persistedResult);
  const toggleable = (model.operation === "run" || toolCall.status === "failed") && (hasResult || hasDetails);
  const canToggle = props.canToggle ?? toggleable;
  const primaryText = React.useMemo(
    () => (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate font-medium text-foreground-subtle">{statusModel.title}</span>
        {statusModel.status ? (
          <span className="shrink-0 text-foreground-subtlest">{`· `}{statusModel.status}</span>
        ) : null}
        {statusModel.detail ? <code className="min-w-0 truncate font-mono text-foreground-subtlest">{statusModel.detail}</code> : null}
      </span>
    ),
    [statusModel.detail, statusModel.status, statusModel.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="mb-2 space-y-3 py-1" data-testid="node-repl-expanded-content">
        {errorText ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium text-destructive">{resultLabel}</h4>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{errorText}</p>
          </section>
        ) : model.resultText && isPlainTextOutput(model.resultText) ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="node-repl-result-surface">
            {model.resultText.trim()}
          </p>
        ) : model.resultText ? (
          <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-result-surface">
            <CodeSurface
              cardSurface
              code={model.resultText}
              copyLabel={copyResultLabel}
              eagerLayout
              label={resultLabel}
              language={looksLikeJson(model.resultText) ? "json" : "log"}
              wrapLabel={wrapLabel}
            />
          </div>
        ) : !props.isRunning && model.images.length === 0 ? (
          <p className="text-ui-base text-foreground-subtle">{noResultLabel}</p>
        ) : null}
        {model.images.length > 0 ? <NodeReplImageList images={model.images} resultImageLabel={imageLabel} /> : null}
        {model.persistedResult && persistedLabel ? (
          <div className="flex flex-wrap items-center gap-2 text-ui-base text-foreground-subtle">
            <span>{persistedLabel}</span>
            {props.onOpenCodeViewer ? (
              <Button
                type="button"
                variant="link"
                size="xs"
                className="px-0"
                onClick={() =>
                  props.onOpenCodeViewer?.({ type: "file", title: resultLabel, path: model.persistedResult?.artifactPath })
                }
              >
                {format("chat.toolCall.nodeRepl.openFullResult")}
                <IconExternal className="size-3" />
              </Button>
            ) : null}
          </div>
        ) : null}
        {hasDetails ? (
          <Collapsible className="group/details">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-foreground-subtlest hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground">
                <IconChevronRight className="size-3.5 transition-transform group-data-[state=open]/details:rotate-90" />
                {detailsLabel}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-2">
                {model.code ? (
                  <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-detail-surface">
                    <CodeSurface cardSurface code={model.code} copyLabel={copyDetailsLabel} eagerLayout label={detailContentLabel} language="javascript" wrapLabel={wrapLabel} />
                  </div>
                ) : null}
                {model.error?.stack ? (
                  <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="node-repl-detail-surface">
                    <CodeSurface cardSurface code={model.error.stack} copyLabel={copyDetailsLabel} eagerLayout label={technicalLabel} language="log" wrapLabel={wrapLabel} />
                  </div>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </div>
    ),
    [props.isRunning, props.onOpenCodeViewer, copyDetailsLabel, copyResultLabel, detailContentLabel, detailsLabel, format, persistedLabel, hasDetails, model, noResultLabel, imageLabel, resultLabel, technicalLabel, errorText, wrapLabel],
  );
  if (model.displaySource === "browser_turn_end") return <NodeReplImageList images={model.images} resultImageLabel={imageLabel} />;
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={NODE_REPL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={canToggle}
        forceOpen={props.forceOpen ?? false}
        kindLabel={null}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined} />
    </>
  );
}

/* ---- 原 Wmt（107472 / 92099）：AutomationToolView（MCP 调用面） ---- */

interface McpToolInfo { serverName?: string; toolName?: string; description?: string }
/** 原 Vmt/Hmt/Umt/Rmt/Lmt/T$：MCP 信息归一/服务器名美化/工具名美化/输出文本/纯文本判定/JSON 判定 */
declare function extractMcpToolInfo(props: ToolCallViewProps): McpToolInfo | null; // Vmt
declare function prettifyMcpServerName(serverName: string): string; // Hmt
declare function prettifyMcpToolName(toolName: string, serverName: string): string; // Umt
declare function extractMcpOutputText(output: unknown): string | null; // Rmt
declare function isShortPlainOutput(text: string): boolean; // Lmt
declare function detectOutputLanguage(text: string): string; // T$
const MCP_TOOL_ICON = <IconBot className="size-4 shrink-0 text-foreground-subtle" />;

export function AutomationToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const info = extractMcpToolInfo(props);
  const { toolCall } = props.toolCallNode;
  const serverLabel = info?.serverName ? prettifyMcpServerName(info.serverName) : undefined;
  const primaryLabel = info ? prettifyMcpToolName(info.toolName ?? "", serverLabel ?? "") : toolCall.title;
  const detailsLabel = intl.formatMessage({ id: "chat.toolCall.mcp.callDetails" });
  const resultLabel = intl.formatMessage({ id: "chat.toolCall.mcp.result" });
  const copyResultLabel = intl.formatMessage({ id: "chat.toolCall.mcp.copyResult" });
  const wrapLabel = intl.formatMessage({ id: "chat.toolCall.mcp.wrapLines" });
  const descriptionLabel = intl.formatMessage({ id: "chat.toolCall.mcp.description" });
  const parametersLabel = intl.formatMessage({ id: "chat.toolCall.mcp.parameters" });
  const hasDetails = !!(info?.description || toolCall.input !== undefined);
  const outputText = extractMcpOutputText(toolCall.output);
  const errorText = toolCall.status === "failed" ? (toolCall.error ?? props.errorText) : undefined;
  const pending = toolCall.status === "pending" || toolCall.status === "stopped";
  const stoppedSuffix =
    toolCall.status === "stopped" ? (
      <span className="inline-flex items-center gap-2">
        <span className="text-foreground-subtlest">{`·`}</span>
        <span>{props.statusLabel}</span>
      </span>
    ) : undefined;
  const failedSuffix =
    toolCall.status === "failed" ? (
      <span className="inline-flex items-center gap-2">
        <span className="text-foreground-subtlest">{`·`}</span>
        <span>{props.statusLabel}</span>
      </span>
    ) : undefined;
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () => (
      <div className="mb-2 space-y-3 py-1" data-testid="mcp-expanded-content">
        {errorText ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium text-destructive">{resultLabel}</h4>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-destructive/10 px-3 py-2 text-ui-base text-destructive" data-testid="mcp-error-surface">
              {errorText}
            </p>
          </section>
        ) : outputText && isShortPlainOutput(outputText) ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="mcp-result-surface">
            {outputText.trim()}
          </p>
        ) : outputText ? (
          <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card" data-testid="mcp-result-surface">
            <CodeSurface
              appTheme={props.theme}
              className="bg-card"
              code={outputText}
              enableSyntaxHighlighting={detectOutputLanguage(outputText) === "json"}
              language={detectOutputLanguage(outputText) === "json" ? "json" : "log"}
              renderMermaid={false}
              wrapLongLines
            >
              <CodeSurfaceHeader className="pl-3 pr-2 pt-2">
                <CodeSurfaceTitle>
                  <span className="text-ui-base font-medium text-foreground-subtle">{resultLabel}</span>
                </CodeSurfaceTitle>
                <CodeSurfaceActions>
                  <CodeSurfaceWrapButton aria-label={wrapLabel} title={wrapLabel} />
                  <CodeSurfaceCopyButton aria-label={copyResultLabel} title={copyResultLabel} />
                </CodeSurfaceActions>
              </CodeSurfaceHeader>
            </CodeSurface>
          </div>
        ) : toolCall.status === "pending" ? (
          <p className="break-words rounded-xl border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle" data-testid="mcp-pending-surface">
            {props.statusLabel}
          </p>
        ) : (
          <p className="text-ui-base text-foreground-subtle">{props.statusLabel}</p>
        )}
        {hasDetails ? (
          <Collapsible className="group/details">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-foreground-subtlest hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent aria-expanded:text-foreground">
                <IconChevronRight className="size-3.5 transition-transform group-data-[state=open]/details:rotate-90" />
                {detailsLabel}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-2">
                {info?.description ? (
                  <section className="space-y-1.5">
                    <h4 className="text-ui-sm font-medium text-foreground-subtlest">{descriptionLabel}</h4>
                    <p className="whitespace-pre-wrap break-words text-ui-base text-foreground-subtle">{info.description}</p>
                  </section>
                ) : null}
                {toolCall.input === undefined ? null : (
                  <section className="space-y-1.5">
                    <h4 className="text-ui-sm font-medium text-foreground-subtlest">{parametersLabel}</h4>
                    <div className="max-h-72 overflow-auto rounded-xl border border-border bg-card">
                      <CodeSurface appTheme={props.theme} code={JSON.stringify(toolCall.input, null, 2)} language="json" />
                    </div>
                  </section>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
        <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
      </div>
    ),
    [detailsLabel, copyResultLabel, props, descriptionLabel, loadFull, hasDetails, parametersLabel, resultLabel, outputText, toolCall, errorText, wrapLabel],
  );
  if (!info) return null;
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={MCP_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={!pending && (props.canToggle ?? true)}
      forceOpen={!pending && (props.forceOpen ?? false)}
      kindLabel="MCP"
      kindDetail={serverLabel ? <span className="text-foreground-subtle">{serverLabel}</span> : undefined}
      primaryText={primaryLabel}
      summaryContentSeparator="·"
      secondaryText={stoppedSuffix}
      statusLabel={failedSuffix}
      statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={props.isRunning}
      title={info.description ?? info.toolName}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 eht（107835 / 92325）：SessionContextToolView ---- */

/** 原 Zmt/Qmt/$mt：查询文本/命令标签/结果文本抽取 */
declare function extractSessionQuery(toolCall: ToolCall): string | null; // Zmt
declare function extractSessionCommandLabel(toolCall: ToolCall): string | null; // Qmt
declare function extractSessionResultText(toolCall: ToolCall): string | null; // $mt
const SESSION_CONTEXT_ICON = <IconGlobe className="size-4 shrink-0 text-foreground-subtle" />;

export function SessionContextToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const query = extractSessionQuery(toolCall);
  const commandLabel = extractSessionCommandLabel(toolCall);
  const resultText = extractSessionResultText(toolCall);
  const displayedResult = toolCall.status === "failed" ? errorText : resultText;
  const kindTitle = intl.formatMessage({ id: "chat.toolCall.sessionContext.title" });
  const primaryText = React.useMemo(
    () => (
      <span className="min-w-0 truncate">{query ?? toolCall.title ?? kindTitle}</span>
    ),
    [kindTitle, query, toolCall.title],
  );
  const secondaryText = React.useMemo(
    () =>
      commandLabel ? (
        <code className="min-w-0 truncate rounded-md bg-surface px-1.5 py-0.5 font-mono text-ui-base text-foreground-subtle">{commandLabel}</code>
      ) : undefined,
    [commandLabel],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 rounded-xl border border-border bg-panel px-4 py-3">
        {query ? (
          <section className="space-y-1.5">
            <h4 className="text-ui-base font-medium uppercase text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.query" })}</h4>
            <p className="whitespace-pre-wrap break-words text-ui-base text-foreground">{query}</p>
          </section>
        ) : null}
        <section className="space-y-1.5">
          <h4 className="text-ui-base font-medium uppercase text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.result" })}</h4>
          {displayedResult ? (
            <MarkdownRenderer
              className="min-w-0 break-words text-ui-base"
              workspacePath={props.workspacePath}
              theme={props.theme}
              codePreviewSettings={props.codePreviewSettings}
              onOpenCodeViewer={props.onOpenCodeViewer}
              onOpenFileLink={props.onOpenFileLink}
              onOpenExternalUrl={props.onOpenBrowserUrl}
            >
              {displayedResult}
            </MarkdownRenderer>
          ) : (
            <p className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.sessionContext.noResult" })}</p>
          )}
        </section>
      </div>
    ),
    [props.codePreviewSettings, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.theme, props.workspacePath, intl, query, displayedResult],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SESSION_CONTEXT_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.toolCall.sessionContext.reading" : "chat.toolCall.sessionContext.read" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        statusLabel={statusLabel}
        statusTooltip={toolCall.status === "failed" ? errorText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 mht（108309 / 92669）：SkillToolView ---- */

/** 原 fht/pht/V$/z$：技能名/参数/输出文本/raw 判定 */
declare function extractSkillName(toolCall: ToolCall): string | null; // fht
declare function extractSkillArgs(toolCall: ToolCall): string | null; // pht
declare function extractOutputText(output: unknown): string | null; // V$
declare function isRawRecord(value: unknown): value is Record<string, unknown>; // z$
const SKILL_TOOL_ICON = <IconSparklesLike className="size-4 shrink-0 text-foreground-subtle" />;
declare const IconSparklesLike: React.FC<React.SVGProps<SVGSVGElement>>; // dht（skill 图标）

export function SkillToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const skillName = extractSkillName(toolCall);
  const skillArgs = extractSkillArgs(toolCall);
  const outputText = extractOutputText(toolCall.output);
  const rawOutput = isRawRecord(toolCall.raw) ? extractOutputText(toolCall.raw.rawOutput) : null;
  const surfaceText = toolCall.status === "failed" ? (props.errorText ?? outputText ?? rawOutput ?? undefined) : (outputText ?? rawOutput ?? undefined);
  const label = intl.formatMessage({ id: "chat.toolCall.skill.label" });
  const unknownLabel = intl.formatMessage({ id: "chat.toolCall.skill.unknown" });
  const argsLabel = intl.formatMessage({ id: "chat.toolCall.skill.args" });
  const noOutputLabel = intl.formatMessage({ id: "chat.toolCall.skill.noOutput" });
  const primaryText = React.useMemo(
    () => (
      <span className="truncate font-mono text-foreground-subtlest">{skillName ?? toolCall.title ?? label}</span>
    ),
    [label, skillName, toolCall.title],
  );
  const secondaryText = React.useMemo(() => (skillArgs ? <code className="truncate font-mono">{skillArgs}</code> : null), [skillArgs]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 mb-2 rounded-xl border border-border bg-panel px-4 py-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-ui-base text-foreground">
            <span className="text-foreground-subtle">{label}</span>
            <code className="rounded-md bg-surface px-2 py-1 font-mono text-ui-base text-foreground">{skillName ?? toolCall.title ?? unknownLabel}</code>
          </div>
          {skillArgs ? (
            <div className="flex items-start gap-2 font-mono text-ui-base text-foreground">
              <span className="shrink-0 text-foreground-subtle">{argsLabel}</span>
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground-subtle">{skillArgs}</pre>
            </div>
          ) : null}
        </div>
        {surfaceText ? (
          <div className="space-y-1">
            <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">{surfaceText}</pre>
          </div>
        ) : (
          !props.isRunning && (
            <div className="space-y-1">
              <p className="font-mono text-ui-base text-foreground-subtle">{noOutputLabel}</p>
            </div>
          )
        )}
      </div>
    ),
    [props.isRunning, surfaceText, skillArgs, argsLabel, label, skillName, noOutputLabel, unknownLabel, toolCall.title],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SKILL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen
        kindLabel={(props.kindLabelOverride as string) ?? intl.formatMessage({ id: props.isRunning ? "chat.toolCall.skill.running" : "chat.toolCall.skill.ran" })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        secondaryText={secondaryText}
        statusLabel={props.statusLabel}
        statusTooltip={toolCall.status === "failed" ? surfaceText : undefined}
        showFailureStatus={toolCall.status === "failed"}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 ght（108426 / 92725）：SwitchModeToolView（plan 面板） ---- */

function isInteractiveChild(target: EventTarget | null, currentTarget: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const closest = target.closest("button, a, input, textarea, select, [role='button']");
  return closest !== null && closest !== currentTarget;
}

export function SwitchModeToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const errorText = extractToolErrorText(toolCall);
  const { markdown, planFilePath } = extractPlanMarkdown(toolCall, props.workspacePath);
  const refsLoader = (
    <SnapshotRefsLoader
      refs={toolCall.snapshotRefs ?? []}
      onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
    />
  );
  const hasMarkdown = typeof markdown == "string" && markdown.length > 0;
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const isCopied = copiedText === markdown;
  const openDetail = () => {
    if (!markdown || !props.onOpenPlanDetail) return;
    props.onOpenPlanDetail({
      toolCallId: toolCall.toolId,
      markdown,
      ...(planFilePath ? { planFilePath } : {}),
    });
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isInteractiveChild(event.target, event.currentTarget)) openDetail();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveChild(event.target, event.currentTarget)) return;
    event.preventDefault();
    openDetail();
  };
  const copyMarkdown = () => {
    if (!markdown || typeof navigator > "u" || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(markdown).then(
      () => setCopiedText(markdown),
      () => setCopiedText(null),
    );
  };
  if (hasMarkdown) {
    return (
      <>
        <section
          role={props.onOpenPlanDetail ? "button" : undefined}
          tabIndex={props.onOpenPlanDetail ? 0 : undefined}
          aria-label={intl.formatMessage({ id: "planTool.panel.open" })}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="group w-full min-w-0 overflow-hidden rounded-xl border border-card-border bg-card text-foreground shadow-xs outline-none transition-colors hover:border-border-hover focus-visible:border-input-border-focused focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <header className="flex h-10 min-w-0 items-start gap-2 px-4 pt-4">
            <div className="flex shrink-0 items-center gap-2">
              <IconGauge className="size-4 shrink-0 text-foreground-subtle" />
              <h3 className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "planTool.panel.planTab" })}</h3>
            </div>
            {planFilePath ? (
              <code className="min-w-0 truncate text-ui-sm text-foreground-subtlest" title={planFilePath}>
                {baseName(planFilePath)}
              </code>
            ) : null}
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={intl.formatMessage({ id: isCopied ? "planTool.panel.copied" : "planTool.panel.copy" })}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  copyMarkdown();
                }}
              >
                {isCopied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
              </Button>
            </div>
          </header>
          <div className="relative overflow-hidden">
            <div className="max-h-64 overflow-hidden px-4 pt-2 pb-12 [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_100%)]">
              <MarkdownRenderer
                className="min-w-0 break-words text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground-subtle [&_p]:text-foreground-subtle"
                workspacePath={props.workspacePath}
                theme={props.theme}
                codePreviewSettings={props.codePreviewSettings}
                onOpenCodeViewer={props.onOpenCodeViewer}
                onOpenFileLink={props.onOpenFileLink}
                onOpenExternalUrl={props.onOpenBrowserUrl}
              >
                {markdown}
              </MarkdownRenderer>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              className="absolute bottom-6 left-1/2 h-10 -translate-x-1/2 rounded-full !pr-4.5 pl-6 shadow-xs"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                openDetail();
              }}
            >
              {intl.formatMessage({ id: "planTool.panel.viewFull" })}
              <IconArrowUpRight data-icon="inline-end" className="size-4" />
            </Button>
          </div>
        </section>
        {refsLoader}
      </>
    );
  }
  if (toolCall.output !== undefined || errorText) {
    return (
      <>
        <ToolErrorSurface errorText={errorText} />
        {refsLoader}
      </>
    );
  }
  return <>{refsLoader}</>;
}

/* ---- 原 Sht（108581 / 92812）：TaskOutputToolView ---- */

interface TaskOutputRaw { kind?: string; taskStatus?: string; output?: string; retrievalStatus?: string; truncated?: boolean; [key: string]: unknown }
/** 原 F$/yht/bht/xht：raw 归一/输入 taskId/raw 状态失败判定/停止判定 */
declare function normalizeTaskOutputRaw(raw: unknown): TaskOutputRaw | null; // F$
declare function extractTaskOutputInputId(input: unknown): string | null; // yht
declare function isTaskRuntimeFailed(status?: string): boolean; // bht
declare function isTaskRuntimeStopped(status?: string): boolean; // xht
const TASK_OUTPUT_ICON = <IconClock className="size-4 shrink-0 text-foreground-subtle" />;

export function TaskOutputToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const raw = normalizeTaskOutputRaw(toolCall.raw);
  const info = raw?.kind === "task_output" ? raw : undefined;
  const inputId = extractTaskOutputInputId(toolCall.input);
  const taskStatus = info?.taskStatus;
  const normalizedStatus = taskStatus?.trim().toLowerCase();
  const denied = toolCall.status === "denied";
  const stopped = toolCall.status === "stopped";
  const failed = toolCall.status === "failed";
  const runtimeFailed = isTaskRuntimeFailed(taskStatus);
  const showFailed = !denied && !stopped && (failed || runtimeFailed);
  const output = info?.output;
  const hasOutput = output !== undefined;
  let kindLabel: string;
  if (failed) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.failed" });
  else if (denied) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.denied" });
  else if (stopped) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.stopped" });
  else if (props.isRunning) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.fetching" });
  else if (info?.retrievalStatus === "not_ready") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.running" });
  else if (info?.retrievalStatus === "timeout") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.timeout" });
  else if (runtimeFailed) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.taskFailed" });
  else if (isTaskRuntimeStopped(taskStatus)) kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.taskStopped" });
  else if (normalizedStatus === "pending" || normalizedStatus === "running") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.running" });
  else if (normalizedStatus && normalizedStatus !== "completed") kindLabel = taskStatus ?? normalizedStatus;
  else if (info?.retrievalStatus === "success") kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.retrieved" });
  else kindLabel = intl.formatMessage({ id: "chat.toolCall.taskOutput.completed" });
  const primaryText = React.useMemo(
    () => (
      <code className="min-w-0 truncate font-mono">{inputId ?? toolCall.title ?? "TaskOutput"}</code>
    ),
    [inputId, toolCall.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="rounded-lg border border-border bg-panel px-4 py-3">
        <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">{output}</pre>
        {info?.truncated === true ? <p className="mt-3 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.taskOutput.truncated" })}</p> : null}
      </div>
    ),
    [intl, output, info?.truncated],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={TASK_OUTPUT_ICON}
        showIcon={props.showIcon !== false}
        canToggle={hasOutput && (props.canToggle ?? true)}
        forceOpen={hasOutput && (props.forceOpen ?? false)}
        kindLabel={kindLabel}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={showFailed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : undefined}
        statusTooltip={failed ? props.errorText : undefined}
        showFailureStatus={showFailed}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={hasOutput ? renderContent : undefined}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Dht（108728 / 92920）：TaskControlToolView（task stop） ---- */

interface TaskStopRaw { kind?: string; taskId?: string; taskType?: string; command?: string; message?: string; truncated?: boolean; [key: string]: unknown }
declare function normalizeTaskStopRaw(raw: unknown): TaskStopRaw | null; // F$ 复用
declare function stringField(value: unknown, fields: string[]): string | undefined; // U$
declare function nestedRecord(value: unknown): Record<string, unknown> | null; // H$
declare function nestedStringField(raw: unknown, path: string[]): string | undefined; // Tht
declare function resolveStopResultText(message: string | undefined, taskId?: string, command?: string): string | undefined; // Eht
declare const DetailRow: React.FC<{ label: string; value: string; mono?: boolean }>; // W$
const TASK_STOP_ICON = <IconCalendar className="size-4 shrink-0 text-foreground-subtle" />;

export function TaskControlToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const raw = normalizeTaskStopRaw(toolCall.raw);
  const info = raw?.kind === "task_stop" ? raw : undefined;
  const input = nestedRecord(toolCall.input) ?? nestedStringField(toolCall.raw, ["rawInput", "input"]);
  const output = nestedRecord(toolCall.output) ?? nestedStringField(toolCall.raw, ["rawOutput", "output"]);
  const taskId = info?.taskId ?? stringField(output, ["task_id"]) ?? stringField(input, ["task_id", "shell_id"]);
  const taskType = info?.taskType ?? stringField(output, ["task_type"]);
  const rawCommand = info?.command;
  const outputCommand = stringField(output, ["command"]);
  const isAgent = taskType === "local_agent";
  const command = isAgent ? rawCommand : (rawCommand ?? outputCommand);
  const anyCommand = rawCommand ?? outputCommand;
  const message = info?.message ?? stringField(output, ["message"]);
  const truncated = info?.truncated === true;
  const denied = toolCall.status === "denied";
  const stopped = toolCall.status === "stopped";
  const failed = toolCall.status === "failed";
  const resultText = failed || denied || stopped ? (props.errorText ?? message) : resolveStopResultText(message, taskId, anyCommand);
  const hasContent = !!(taskType || command || resultText || truncated);
  const kindId = props.isRunning
    ? "chat.toolCall.taskStop.stopping"
    : failed
      ? "chat.toolCall.taskStop.failed"
      : denied
        ? "chat.toolCall.taskStop.denied"
        : stopped
          ? "chat.toolCall.taskStop.cancelled"
          : "chat.toolCall.taskStop.stopped";
  const primaryText = React.useMemo(
    () => (
      <code className="min-w-0 truncate font-mono">{taskId ?? toolCall.title ?? "TaskStop"}</code>
    ),
    [taskId, toolCall.title],
  );
  const renderContent = React.useCallback(
    () => (
      <div className="rounded-lg border border-border bg-panel px-4 py-3">
        <dl className="space-y-3">
          {taskType ? <DetailRow label={intl.formatMessage({ id: "chat.toolCall.taskStop.taskType" })} value={taskType} mono /> : null}
          {command ? <DetailRow label={intl.formatMessage({ id: isAgent ? "chat.toolCall.taskStop.description" : "chat.toolCall.taskStop.command" })} value={command} mono={!isAgent} /> : null}
          {resultText ? <DetailRow label={intl.formatMessage({ id: "chat.toolCall.taskStop.result" })} value={resultText} /> : null}
        </dl>
        {truncated ? <p className="mt-3 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "chat.toolCall.taskStop.truncated" })}</p> : null}
      </div>
    ),
    [truncated, intl, isAgent, resultText, command, taskType],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={TASK_STOP_ICON}
        showIcon={props.showIcon !== false}
        canToggle={hasContent && (props.canToggle ?? true)}
        forceOpen={hasContent && (props.forceOpen ?? false)}
        kindLabel={intl.formatMessage({ id: kindId })}
        sourceLabel={props.sourceLabel}
        primaryText={primaryText}
        statusLabel={failed ? intl.formatMessage({ id: "chat.toolCall.status.failed" }) : undefined}
        statusTooltip={failed ? props.errorText : undefined}
        showFailureStatus={failed}
        isRunning={props.isRunning}
        title={toolCall.title}
        renderContent={hasContent ? renderContent : undefined}
      />
      <SnapshotRefsLoader
        refs={toolCall.snapshotRefs ?? []}
        onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
      />
    </>
  );
}

/* ---- 原 Mht（108857 / 93007）：TodoToolView ---- */

interface TodoItem { id: string; title: string; status: string }
/** 原 Aht：todo 列表抽取 */
declare function extractTodoItems(props: ToolCallViewProps): TodoItem[] | null;
/** 原 jht/kht：状态图标/状态类名 */
declare const TodoStatusIcon: React.FC<{ status: string }>;
declare const TODO_STATUS_CLASSES: Record<string, string>;
const TODO_TOOL_ICON = <IconListTodoLike className="size-4 shrink-0 text-foreground-subtle" />;
declare const IconListTodoLike: React.FC<React.SVGProps<SVGSVGElement>>; // Oht

export function TodoToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCall } = props.toolCallNode;
  const items = extractTodoItems(props);
  const completedCount = items?.filter((item) => item.status === "completed").length ?? 0;
  const current = items?.find((item) => item.status === "in_progress") ?? items?.find((item) => item.status !== "completed") ?? items?.at(-1);
  const kindLabel = intl.formatMessage({ id: "todo.panel.title" });
  const primaryLabel = current?.title ?? toolCall.title ?? intl.formatMessage({ id: "todo.panel.currentTask" });
  const counter = items ? `${completedCount}/${items.length}` : props.statusLabel;
  const primaryText = React.useMemo(() => <span className="min-w-0 truncate text-foreground-subtlest">{primaryLabel}</span>, [primaryLabel]);
  const secondaryText = React.useMemo(() => <span className="shrink-0 font-mono text-ui-base text-foreground-subtlest">{counter}</span>, [counter]);
  const loadFull = props.onLoadFullToolCallFields;
  const renderContent = React.useCallback(
    () =>
      items ? (
        <div className="space-y-1 rounded-xl bg-surface px-3 py-2">
          {items.map((item) => (
            <div key={item.id} className="flex min-w-0 items-center gap-2 py-1">
              <TodoStatusIcon status={item.status} />
              <span className={cn("min-w-0 break-words text-ui-base", TODO_STATUS_CLASSES[item.status])}>{item.title}</span>
            </div>
          ))}
          <SnapshotRefsLoader refs={toolCall.snapshotRefs ?? []} onLoadFullToolCallFields={loadFull ? () => loadFull(toolCall.toolId) : undefined} />
        </div>
      ) : (
        <>
          <ToolCallExpandedContent
            childToolList={props.childToolList}
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
      ),
    [props.childToolList, props.codePreviewSettings, props.displayModel, props.onOpenBrowserUrl, props.onOpenCodeViewer, props.onOpenFileLink, props.theme, props.workspacePath, loadFull, items, toolCall],
  );
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={TODO_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={props.canToggle ?? true}
      forceOpen={props.forceOpen ?? false}
      kindLabel={kindLabel}
      sourceLabel={props.sourceLabel}
      primaryText={primaryText}
      secondaryText={secondaryText}
      statusLabel={toolCall.status === "failed" ? props.statusLabel : undefined}
      statusTooltip={toolCall.status === "failed" ? props.errorText : undefined}
      showFailureStatus={toolCall.status === "failed"}
      isRunning={props.isRunning}
      title={toolCall.title}
      renderContent={renderContent}
    />
  );
}

/* ---- 原 Pht（108963 / 93067）：AskUserQuestionToolView ---- */

interface AskQuestionModel { questions: Array<{ id: string; question: string; options?: unknown[] }> ; answers?: Record<string, unknown> }
/** 原 eg/$h：toolCall → 问题模型归一 */
declare function normalizeAskQuestions(toolCall: ToolCall): AskQuestionModel;
/** 原 Ume：已答载荷抽取 */
declare function extractAnswers(toolCall: ToolCall): Record<string, unknown> | undefined;
/** 原 Wme：单题答案展示文本 */
declare function formatAnswerText(question: { id: string; question: string }, answers: Record<string, unknown> | undefined, fallback: string): string;
const ASK_QUESTION_ICON = <IconQuestion className="size-4 shrink-0 text-foreground-subtle" />;

export function AskUserQuestionToolView(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const model = normalizeAskQuestions(toolCall);
  const answers = extractAnswers(toolCall) ?? model.answers;
  const autoContinued = !isRunning && toolCall.status !== "failed" && answers !== undefined && Object.keys(answers).length === 0;
  const emptyLabel = intl.formatMessage({ id: autoContinued ? "chat.askQuestion.autoContinued" : "chat.askQuestion.noAnswerProvided" });
  const questionCount = model.questions.length;
  const failed = toolCall.status === "failed";
  const renderContent = React.useCallback(
    () =>
      !isRunning || failed ? (
        <div className="ml-2 space-y-2 border-l border-border pl-3.5">
          {model.questions.map((question) => (
            <div key={question.id} className="space-y-1">
              <p className="text-ui-base font-medium leading-5 text-foreground">{question.question}</p>
              <p className="text-ui-base leading-5 text-foreground-subtle">{formatAnswerText(question, answers, emptyLabel)}</p>
            </div>
          ))}
          {model.questions.length === 0 ? <p className="text-ui-base leading-5 text-foreground-subtle">{emptyLabel}</p> : null}
        </div>
      ) : null,
    [answers, model.questions, failed, isRunning, emptyLabel],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={ASK_QUESTION_ICON}
        showIcon={props.showIcon !== false}
        canToggle={!isRunning}
        forceOpen={false}
        autoOpen={false}
        kindLabel={intl.formatMessage({ id: isRunning ? "chat.askQuestion.asking" : "chat.askQuestion.asked" })}
        sourceLabel={props.sourceLabel}
        primaryText={null}
        secondaryText={isRunning ? null : autoContinued ? emptyLabel : intl.formatMessage({ id: "chat.askQuestion.questionsCount" }, { count: String(questionCount) })}
        statusLabel={failed ? statusLabel : undefined}
        statusTooltip={failed ? errorText : undefined}
        showFailureStatus={failed}
        isRunning={isRunning}
        title={toolCall.title ?? "AskUserQuestion"}
        renderContent={renderContent}
      />
    </>
  );
}

