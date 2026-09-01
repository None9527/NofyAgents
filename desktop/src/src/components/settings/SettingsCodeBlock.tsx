// A0-S4-4a: 自 modules/SettingsPanelsData.tsx §3 渲染器叶子 原样迁入（MemoryFilePreview + CodeBlock 族组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §3 全段（1274–1556，含 MemoryFilePreview/CodeBlock/三工具条按钮/CodeBlockContext）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { CopyIcon, Check as CopiedIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button';
import { CodeBlockFrame, MarkdownRenderer, documentVisibilityState, isMermaidBlock } from '../../modules/MarkdownIntegration';
import { MermaidInlinePreview as MermaidPreview, mermaidAutoRenderGate as evaluateMermaidAutoRender, useDocumentVisibilityTick as mermaidAutoRenderDependency } from '../../modules/MarkdownIntegration'; // BO / Pze / tBe
import { HighlightedCodeBlock as ShikiHighlight } from '../../modules/HighlightedCodeBlock'; // MO
import { MermaidFullscreenDialog as MermaidPreviewDialog } from '../../modules/PreviewCards'; // Qze
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { type CodePreviewSettings } from '../../modules/stores-core';

/* ============================================================================
 * 3. 渲染器叶子（原 U8 / gk）
 * ==========================================================================*/

/** Markdown 渲染器（原 cj，F19 族；Markdown.tsx 已抽取，接口级） */

export type { CodePreviewSettings };

/** 原 U8（js 160565 / jsx 132773）：记忆文件预览（Markdown 包装，F14 代码查看族入口） */
export function MemoryFilePreview(props: {
  content: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings: CodePreviewSettings;
  onOpenBrowserUrl?: (url: string) => void;
}) {
  const { content, workspacePath, theme, codePreviewSettings, onOpenBrowserUrl } = props;
  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="min-h-full bg-background p-4">
        <MarkdownRenderer
          className="min-w-0 break-words"
          workspacePath={workspacePath}
          theme={theme}
          codePreviewSettings={codePreviewSettings}
          onOpenExternalUrl={onOpenBrowserUrl}
        >
          {content}
        </MarkdownRenderer>
      </div>
    </div>
  );
}

/* --- CodeBlock（原 gk，js 48634 / jsx 43829；F19 Markdown 族） --- */

declare const WrapLinesIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Tbe
declare const MermaidIcon: React.FC<React.SVGProps<SVGSVGElement>>; // mv
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：CopyIcon/CopiedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

interface CodeBlockContextValue {
  code: string;
  mermaidPreviewAvailable: boolean;
  openMermaidPreview: () => void;
  toggleWrapLongLines: () => void;
  wrapLongLines: boolean;
}
/** 原 fk（jsx 43775）：CodeBlock 工具条 context */
const CodeBlockContext = React.createContext<CodeBlockContextValue>({
  code: "",
  mermaidPreviewAvailable: false,
  openMermaidPreview: () => {},
  toggleWrapLongLines: () => {},
  wrapLongLines: false,
});

export interface CodeBlockProps {
  code: string;
  enableSyntaxHighlighting?: boolean;
  language: string;
  showLineNumbers?: boolean;
  theme?: unknown;
  appTheme?: string;
  wrapLongLines?: boolean;
  fontSizePx?: number;
  renderMermaid?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/** 原 gk（js 48634）：代码块（mermaid 自动渲染 + 换行切换 + 预览对话框） */
export function CodeBlock(props: CodeBlockProps) {
  const {
    code,
    enableSyntaxHighlighting = true,
    language,
    showLineNumbers = false,
    theme,
    appTheme,
    wrapLongLines = false,
    fontSizePx = 14,
    renderMermaid = true,
    className,
    children,
    ...rest
  } = props;
  const { intl } = useIntlContext();
  const [wrapEnabled, setWrapEnabled] = React.useState(wrapLongLines);
  const [mermaidSvg, setMermaidSvg] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const mermaidCandidate = renderMermaid && isMermaidBlock(language, code);
  const mermaidEvaluation = React.useMemo(
    () => (mermaidCandidate ? evaluateMermaidAutoRender(code, { documentVisibilityState: documentVisibilityState() }) : null),
    [mermaidCandidate, code, mermaidAutoRenderDependency(mermaidCandidate)]
  );
  const shouldRenderMermaid = mermaidCandidate && mermaidEvaluation?.shouldRender === true;
  React.useEffect(() => {
    setWrapEnabled(wrapLongLines);
  }, [wrapLongLines]);
  const toggleWrapLongLines = React.useCallback(() => {
    setWrapEnabled((previous) => !previous);
  }, []);
  const openMermaidPreview = React.useCallback(() => {
    setPreviewOpen(true);
  }, []);
  React.useEffect(() => {
    if (!shouldRenderMermaid) {
      setMermaidSvg(null);
      setPreviewOpen(false);
    }
  }, [shouldRenderMermaid]);
  React.useEffect(() => {
    if (mermaidEvaluation && !mermaidEvaluation.shouldRender) {
      logger.debug("[CodeBlock] Mermaid 自动渲染跳过", { reason: mermaidEvaluation.reason, ...((mermaidEvaluation.metrics as object) ?? {}) });
    }
  }, [mermaidEvaluation]);
  const contextValue = React.useMemo<CodeBlockContextValue>(
    () => ({
      code,
      mermaidPreviewAvailable: !!mermaidSvg,
      openMermaidPreview,
      toggleWrapLongLines,
      wrapLongLines: wrapEnabled,
    }),
    [code, wrapEnabled, mermaidSvg, openMermaidPreview, toggleWrapLongLines]
  );

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <CodeBlockFrame className={className} language={language} {...rest}>
        {children}
        <div className="p-2 pt-0 pb-3">
          {shouldRenderMermaid ? (
            <MermaidPreview code={code} theme={appTheme} onOpenPreview={openMermaidPreview} onPreviewSvgChange={setMermaidSvg} />
          ) : (
            <ShikiHighlight
              code={code}
              enableSyntaxHighlighting={enableSyntaxHighlighting}
              language={language}
              showLineNumbers={showLineNumbers}
              theme={theme}
              wrapLongLines={wrapEnabled}
              className="bg-transparent"
              fontSizePx={fontSizePx}
              style={{
                "--diffs-bg": "var(--color-card)",
                "--diffs-light-bg": "var(--color-card)",
                "--diffs-dark-bg": "var(--color-card)",
                "--diffs-gap-block": "0px",
              } as React.CSSProperties}
            />
          )}
        </div>
        {shouldRenderMermaid && mermaidSvg ? (
          <MermaidPreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            svg={mermaidSvg}
            title={intl.formatMessage({ id: "codeBlock.mermaid.ariaLabel" })}
          />
        ) : null}
      </CodeBlockFrame>
    </CodeBlockContext.Provider>
  );
}

/** 原 _k（jsx 43898）：换行切换按钮（工具条） */
export function CodeBlockWrapLinesButton(props: {
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) {
  const { "aria-label": ariaLabel, children, className, onClick, title = "Wrap lines", ...rest } = props;
  const { toggleWrapLongLines, wrapLongLines } = React.useContext(CodeBlockContext);
  return (
    <Tooltip title={title}>
      <Button
        aria-label={ariaLabel ?? title}
        aria-pressed={wrapLongLines}
        className={cn("shrink-0", wrapLongLines && "bg-muted", className)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleWrapLongLines();
        }}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <WrapLinesIcon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}

/** 原 iBe（jsx 43907）：Mermaid 预览按钮（工具条） */
export function CodeBlockMermaidPreviewButton(props: {
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) {
  const { "aria-label": ariaLabel, children, className, onClick, title, ...rest } = props;
  const { intl } = useIntlContext();
  const { mermaidPreviewAvailable, openMermaidPreview } = React.useContext(CodeBlockContext);
  const resolvedTitle = title ?? intl.formatMessage({ id: "codeBlock.mermaid.openPreview" });
  return (
    <Tooltip title={resolvedTitle}>
      <Button
        aria-label={ariaLabel ?? resolvedTitle}
        className={cn("shrink-0", className)}
        disabled={!mermaidPreviewAvailable}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) openMermaidPreview();
        }}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <MermaidIcon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}

/** 原 vk（jsx 43934）：复制按钮（剪贴板 + 2s 勾选反馈） */
export function CodeBlockCopyButton(props: {
  "aria-label"?: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  title?: string;
  timeout?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const { "aria-label": ariaLabel, onCopy, onError, title = "Copy code", timeout = 2000, children, className, ...rest } = props;
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef(0);
  const { code } = React.useContext(CodeBlockContext);
  const handleCopy = React.useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }
    try {
      if (copied) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [code, onCopy, onError, timeout, copied]);
  React.useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );
  const Icon = copied ? CopiedIcon : CopyIcon;
  return (
    <Tooltip title={title}>
      <Button
        aria-label={ariaLabel ?? title}
        className={cn("shrink-0", className)}
        onClick={handleCopy}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <Icon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}
