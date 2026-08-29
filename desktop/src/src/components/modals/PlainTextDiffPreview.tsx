// A0-S4-4a: 自 modules/ModalsLeaves.tsx §C 纯文本 diff 预览 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §C 全段（339–478，含 DIFF_TRUNCATED_MARKER_PATTERN/parse*/diffKindStyles/CodePreviewSettings/PlainTextDiffPreview）。
import * as React from "react";
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { cn } from '../../modules/UtilsCn';

/* ============================================================================
 * §C. 纯文本 diff 预览（原 js 23153/23226 + 100417–100519）
 * ==========================================================================*/

/** 原 ahe（23153）：ZCode 截断标记（diff 引擎 X09 的自研扩展行） */
const DIFF_TRUNCATED_MARKER_PATTERN = /^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$/;

/** 原 dhe（23226）：解析截断标记（非标记/非正数 → null） */
export function parseTruncatedMarker(line: string): number | null {
  const match = DIFF_TRUNCATED_MARKER_PATTERN.exec(line);
  if (!match) return null;
  const count = Number.parseInt(match[1] ?? "", 10);
  return !Number.isFinite(count) || count <= 0 ? null : count;
}

export interface PlainDiffLine {
  content: string;
  kind: "added" | "removed" | "context";
  marker: string;
  raw: string;
}

/** 原 mut（100417）：行前缀解析（+/-/空白/其余 → added/removed/context/context） */
export function parseDiffLine(line: string): PlainDiffLine {
  return line.startsWith("+")
    ? { content: line.slice(1), kind: "added", marker: "+", raw: line }
    : line.startsWith("-")
      ? { content: line.slice(1), kind: "removed", marker: "-", raw: line }
      : line.startsWith(" ")
        ? { content: line.slice(1), kind: "context", marker: " ", raw: line }
        : { content: line, kind: "context", marker: "", raw: line };
}

export interface DiffKindStyle {
  lineNumberClassName: string;
  rowStyle?: React.CSSProperties;
  gutterStyle?: React.CSSProperties;
}

/** 原 hut（100426）：行类型 → 样式（color-mix 背景 + 3px 内嵌色条；上下文仅行号底色） */
export function diffKindStyles(kind: PlainDiffLine["kind"]): DiffKindStyle {
  return kind === "added"
    ? {
        lineNumberClassName: "text-diff-added",
        rowStyle: {
          backgroundColor: "color-mix(in srgb, var(--color-diff-added) 14%, transparent)",
          boxShadow: "inset 3px 0 0 var(--color-diff-added)",
        },
        gutterStyle: {
          backgroundColor: "color-mix(in srgb, var(--color-diff-added) 18%, var(--color-background))",
          boxShadow: "inset 3px 0 0 var(--color-diff-added)",
          color: "var(--color-diff-added)",
        },
      }
    : kind === "removed"
      ? {
          lineNumberClassName: "text-diff-removed",
          rowStyle: {
            backgroundColor: "color-mix(in srgb, var(--color-diff-removed) 14%, transparent)",
            boxShadow: "inset 3px 0 0 var(--color-diff-removed)",
          },
          gutterStyle: {
            backgroundColor: "color-mix(in srgb, var(--color-diff-removed) 18%, var(--color-background))",
            boxShadow: "inset 3px 0 0 var(--color-diff-removed)",
            color: "var(--color-diff-removed)",
          },
        }
      : {
          lineNumberClassName: "text-foreground-subtlest",
          gutterStyle: { backgroundColor: "var(--color-background)" },
        };
}

export interface CodePreviewSettings {
  fontSizePx: number;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  [key: string]: unknown;
}

/**
 * 原 gut（100459）：纯文本 diff 预览。
 * 粘性行号列（12 宽）+ 截断标记提示（diff.preview.truncatedLines）+ 换行模式切换。
 */
export function PlainTextDiffPreview({
  className,
  codePreviewSettings,
  lines,
  renderLineContent,
  ...rest
}: {
  className?: string;
  codePreviewSettings: CodePreviewSettings;
  lines: string[];
  renderLineContent?: (line: PlainDiffLine, index: number) => React.ReactNode;
} & Record<string, unknown>) {
  const { intl } = useIntlContext();
  return (
    <div className={cn("w-full min-w-0 overflow-auto bg-background", className)} data-lightweight-diff-preview {...rest}>
      <div
        className={cn("min-w-full font-mono leading-relaxed text-foreground", !codePreviewSettings.wrapLongLines && "w-max")}
        data-lightweight-diff-scroll-content
        style={{ fontSize: codePreviewSettings.fontSizePx }}
      >
        {lines.map((line, index) => {
          const truncated = parseTruncatedMarker(line);
          if (truncated !== null) {
            return (
              <div key={index} className="px-3 py-1 text-foreground-subtle">
                {intl.formatMessage({ id: "diff.preview.truncatedLines" }, { count: String(truncated) })}
              </div>
            );
          }
          const parsed = parseDiffLine(line);
          const styles = diffKindStyles(parsed.kind);
          return (
            <div key={index} className="flex min-w-full w-full" style={styles.rowStyle}>
              {codePreviewSettings.showLineNumbers ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "sticky left-0 z-[1] w-12 shrink-0 select-none border-r border-border px-2 text-right tabular-nums",
                    styles.lineNumberClassName,
                  )}
                  style={styles.gutterStyle}
                >
                  {index + 1}
                </span>
              ) : null}
              <code className={cn("block flex-1 px-3", codePreviewSettings.wrapLongLines ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                {renderLineContent?.(parsed, index) ?? (parsed.content || " ")}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

