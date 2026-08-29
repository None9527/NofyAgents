/* eslint-disable */
/**
 * ============================================================================
 * FileRewindDialogDeep.tsx — F14 MO 代码查看器深部 + F03 FileRewindDialog 深部
 * （B5-06 批次 · C+D 段 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机实测 213,979 行，未改动，只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：B5-FULL-DECODE-PLAN 批次表 #6 C/D 段；MarkdownIntegration.report §8（MO 47501–47660）；
 *       Conversation.report §5/§7（v_t/__t/p1/yg 散段）。
 *
 * 行号口径：本文件行号一律为**本机实测行**（js 行 / jsx 行）。旧登记使用的 213,695 行版
 * 口径与本文件存在 **+48 行偏移**（MO 旧登记 47501 → 实测 47549；b_t 旧登记 110632 →
 * 实测 110680）。换算在报告 PreviewTreeRewind.report.md §1 逐锚点列出。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：实测 js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [C] MO 代码查看器深部（实测 47354–47712；任务口径 47501–47660 → 实测 47549–47708；
 *      依赖簇 47354–47548 为 MO 自洽纳入，内部裁决见报告 §3.3）：
 *   cze  → resolveColorScheme            (47354 / 42631)
 *   lze  → assignRef                     (47363 / 42634)
 *   uze  → CODE_COMMENT_DEFAULT_LABELS   (47372 / 42643)
 *   dze  → CODE_COMMENT_GUTTER_CSS       (47382 / 42643，同 var)
 *   fze  → cssVarJsonEscape              (47390 / 42654)
 *   pze  → hashStringBase36              (47393 / 42657)
 *   mze  → navigatorFingerprint          (47398 / 42662)
 *   hze  → isSubmitCommentShortcut       (47403 / 42668)
 *   gze  → isEscapeKey                   (47406 / 42671)
 *   _ze  → submitShortcutLabel           (47409 / 42674)
 *   vze  → cancelShortcutLabel           (47412 / 42677)
 *   DO   → setUtilityButtonTitles         (47415 / 42680)
 *   OO   → walkShadowRoots               (47419 / 42683)
 *   yze  → buildCodeViewerFileSource     (47422 / 42686)
 *   kO   → normalizeLineRange            (47433 / 42697)
 *   AO   → selectionToLineRange          (47436 / 42703)
 *   bze  → rangeToRelativeLines          (47439 / 42709)
 *   xze  → extractRangeText              (47443 / 42716)
 *   jO   → formatCommentRangeLabel       (47454 / 42725)
 *   Sze  → CodeCommentComposer           (47462 / 42729)
 *   Cze  → CodeCommentCard               (47518 / 42766)
 *   MO   → CodeViewerWithComments        (47549 / 42773)
 *   NO   → isMermaidLanguage             (47709 / 42910)
 *  [D] FileRewindDialog 深部（实测 110410–110634；旧登记 110362–110586）：
 *   __t  → buildFilePreviewSource        (110410 / 94426)
 *   v_t  → FileOpenWithMenu              (110427 / 94447)
 *
 * ----------------------------------------------------------------------------
 * 二、边界与双归属注记
 * ----------------------------------------------------------------------------
 *  1. C 段任务口径（旧 47501–47660 → 实测 47549–47708）= MO 主体；依赖簇
 *     47354–47548（cze…Cze）数值在其前，为 MO 自洽纳入（报告 §3.3 裁决）。
 *  2. oze（47343）= 暗色主题探测，横切层，接口级声明（不重复转录）。
 *  3. D 段 p1（openFileChangeInViewer，110841）/ yg（toWorkspaceRelativePath，23765）
 *     已由 GitReview.tsx 逐字重建，本文件仅接口级声明并注记（不重复）；
 *     b_t（FileRewindDialog，110680）/ f1（RewindDialogFileList，110647）/
 *     y_t（formatRewindSkipReason，110635）/ x_t（buildUnifiedPatch，110833）
 *     同归 GitReview.tsx，排除只注记。
 *  4. v_t 消费的 QA（useFileContextActions，51141）/ JA（resolveAvailableEditors，51100）
 *     由本批 FileTreePanel.tsx 重建；$A/zA/OA/kA 由 MarkdownIntegration.tsx 重建；
 *     本文件均以 declare 挂接。
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 已在它文件还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. useIntlContext (G)；4. logger (J)；
 *  5. usePlatform (l：getInstalledEditors/openInEditor/openExternal)；
 *  6. Textarea (j，imeComposition)；7. Button (X)；
 *  8. 暗色探测 oze（47343）；9. 键盘助手 $i/Lre（keyboardShortcuts-BGHopxr9.js）；
 *  10. vendored diff 组件 $Re（X09，DiffViewer）；
 *  11. FileTreePanel.tsx 已重建件：useFileContextActions (QA)、resolveAvailableEditors (JA)；
 *  12. MarkdownIntegration.tsx 已重建件：useRemoteWorkspaceInfo ($A)、
 *      relativePathFromWorkspace (zA)、getLastEditorId (OA)、setLastEditorId (kA)；
 *  13. GitReview.tsx 已重建件：openFileChangeInViewer (p1)、toWorkspaceRelativePath (yg)；
 *  14. DropdownMenu 族 (VO/HO/UO/WO/YO，X03 双归属接口挂接)；
 *  15. 图标：Kv trash / N_ chevron-down / q_ open-external / W_ copy。
 * ============================================================================
 */

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Trash2 as IconTrash, ChevronDown as IconChevronDown, ExternalLink as IconOpenExternal, Copy as IconCopy } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
/* ── tombstone（A0-D-Misc）：原 `import { DiffViewer } from './CodeViewer'` 退回 declare——
 *    CodeViewer.DiffViewer（mVt）props 面（patch/oldFile/newFile/themeType…）与本处
 *    消费面（file/options/lineAnnotations/selectedLines/renderAnnotation）不符；本处实体为
 *    vendored X09 DiffViewer（$Re），按重建基准恢复 declare 挂接。 ── */
import { resolveAvailableEditors, useFileContextActions } from './FileTreePanel';
import { Textarea, usePlatform } from './ImeComposition';
import { readLastUsedEditorId as getLastEditorId, rememberUsedEditorId as setLastEditorId, relativePathFromWorkspace, useRemoteWorkspaceInfo } from './MarkdownIntegration'; // A0-CLEANUP3 #39：OA/kA 属主为 MarkdownIntegration（原 OA=readLastUsedEditorId / kA=rememberUsedEditorId）
import { logger } from './SkillStore';
import { isDarkTheme } from './XlsxDeepC';
/* ── A0-D-Misc 接线：可用属主（前波成果） ── */
import { cn } from './UtilsCn'; // 原 Z：cn 类名拼接
import { useZCodeIntl as useIntlContext } from './I18n'; // 原 G：useIntlContext
import { Button } from './button'; // 原 X：Button

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/** 原 J：logger */

/* 原 l：usePlatform */
interface InstalledEditor {
  id: string;
  name: string;
  iconDataUrl?: string;
  [key: string]: unknown;
}
interface PlatformOpenResult {
  success: boolean;
  error?: string | null;
}
interface PlatformService {
  getInstalledEditors(): Promise<InstalledEditor[]>;
  openInEditor(
    editorId: string,
    path: string,
    options: { pathKind?: string; remoteTarget?: unknown; workspaceIdentity?: string | null },
  ): Promise<PlatformOpenResult>;
  openExternal(url: string): Promise<unknown>;
}

/** 原 j：Textarea（imeComposition chunk） */

/** 原 oze：暗色主题探测（47343，横切层） */

/* 键盘助手（keyboardShortcuts-BGHopxr9.js） */
declare function formatKbd(symbol: string, platform: { platform?: string; userAgent?: string }): string; // 原 $i
declare function isMacKeyboard(platform: { platform?: string; userAgent?: string }): boolean; // 原 Lre

/** 原 $Re：vendored diff 组件（X09，DiffViewer；A0-D-Misc 自 CodeViewer 误接退回，形状照重建基准） */
declare const DiffViewer: React.FC<{
  file: { name: string; contents: string; lang?: string; cacheKey: string };
  options: Record<string, unknown>;
  lineAnnotations?: Array<{ lineNumber: number; metadata: { kind: string; [key: string]: unknown } }>;
  selectedLines?: { start: number; end: number } | null;
  className?: string;
  style?: React.CSSProperties;
  renderAnnotation?: (annotation: {
    lineNumber: number;
    metadata: { kind: string; [key: string]: unknown };
  }) => React.ReactNode;
}>;

/* FileTreePanel.tsx 已重建件（接口挂接） */

/* MarkdownIntegration.tsx 已重建件（接口挂接）——A0-CLEANUP3 #39：getLastEditorId/setLastEditorId（原 OA/kA）已改由 MarkdownIntegration 导入 */

/* GitReview.tsx 已重建件（接口挂接，不重复转录）——A0-CLEANUP3 #41：p1/yg 属主为 GitReview（openFileChangePatchInCodeViewer/resolveRepoRelativePath），declare 改实接线 */
import { openFileChangePatchInCodeViewer as openFileChangeInViewer, resolveRepoRelativePath as toWorkspaceRelativePath } from './GitReview';

/* 原 VO/HO/UO/WO/YO：DropdownMenu 原语族（X03 双归属，接口挂接） */
/* ── tombstone（A0-S3c）：DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */





/* 图标族（lucide 封装） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（4）：IconTrash/IconChevronDown/IconOpenExternal/IconCopy → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* ============================================================================
 * 1. MO 代码查看器深部（原 47354–47712）
 * ==========================================================================*/

type CodeCommentTheme = `dark` | `light` | `auto` | undefined;

interface LineRange {
  startLine: number;
  endLine: number;
}

interface CodeComment {
  id: string;
  startLine: number;
  endLine: number;
  comment: string;
  selectedText?: string;
}

interface CodeCommentLabels {
  addComment: string;
  addCommentTooltip: string;
  commentPlaceholder: string;
  submitComment: string;
  cancelComment: string;
  deleteComment: string;
  commentLine: string;
  commentRange: string;
}

/** 原 cze：主题 → colorScheme（auto 时按 DOM dark 类） */
function resolveColorScheme(theme: CodeCommentTheme): `dark` | `light` {
  return theme
    ? isDarkTheme(theme)
      ? `dark`
      : `light`
    : typeof document < `u` && document.documentElement.classList.contains(`dark`)
      ? `dark`
      : `light`;
}

/** 原 lze：ref 赋值（函数或 mutable ref） */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T): void {
  if (ref) {
    if (typeof ref === `function`) {
      ref(value);
      return;
    }
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/** 原 uze：代码评论默认文案 */
const CODE_COMMENT_DEFAULT_LABELS: CodeCommentLabels = {
  addComment: `Add comment`,
  addCommentTooltip: `Click or drag to comment`,
  commentPlaceholder: `Comment`,
  submitComment: `Add comment`,
  cancelComment: `Cancel`,
  deleteComment: `Delete comment`,
  commentLine: `Line {line}`,
  commentRange: `Lines {startLine}-{endLine}`,
};

/** 原 dze：gutter 评论按钮 CSS（shadow DOM 注入） */
const CODE_COMMENT_GUTTER_CSS = [
  `[data-gutter-utility-slot]{left:auto;right:4px;justify-content:flex-end;align-items:center;}`,
  `[data-utility-button]{margin-left:0;margin-right:0;}`,
  `@media (hover:hover) and (pointer:fine){`,
  `[data-utility-button]::after{content:var(--code-comment-add-tooltip);position:absolute;left:calc(100% + 6px);top:50%;transform:translateY(-50%);max-width:16rem;white-space:nowrap;pointer-events:none;opacity:0;z-index:5;border:1px solid var(--color-border);border-radius:8px;background:var(--color-tooltip);color:var(--color-tooltip-foreground);padding:4px 8px;font-family:var(--diffs-header-font-family,var(--diffs-header-font-fallback));font-size:12px;line-height:16px;box-shadow:0 4px 12px rgb(0 0 0 / 0.14);}`,
  `[data-utility-button]:hover::after,[data-utility-button]:focus-visible::after{opacity:1;}`,
  `}`,
].join(``);

/** 原 fze：CSS var 值 JSON 转义 */
function cssVarJsonEscape(value: string): string {
  return JSON.stringify(value);
}

/** 原 pze：字符串哈希（base36，djb2 变体） */
function hashStringBase36(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 33) ^ input.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

/** 原 mze：navigator 指纹（供修饰键判定） */
function navigatorFingerprint(): { platform?: string; userAgent?: string } {
  return typeof navigator > `u`
    ? {}
    : { platform: navigator.platform, userAgent: navigator.userAgent };
}

/** 原 hze：Enter + 平台修饰键 = 提交评论 */
function isSubmitCommentShortcut(
  event: { key: string; metaKey?: boolean; ctrlKey?: boolean },
  platform: { platform?: string; userAgent?: string } = navigatorFingerprint(),
): boolean {
  return event.key === `Enter` ? (isMacKeyboard(platform) ? !!event.metaKey : !!event.ctrlKey) : false;
}

/** 原 gze：Escape 键 */
function isEscapeKey(event: { key: string }): boolean {
  return event.key === `Escape`;
}

/** 原 _ze：提交快捷键标签（↵ 渲染） */
function submitShortcutLabel(platform: { platform?: string; userAgent?: string } = navigatorFingerprint()): string {
  return formatKbd(`↵`, platform);
}

/** 原 vze：取消快捷键标签 */
function cancelShortcutLabel(): string {
  return `Esc`;
}

/** 原 DO：为 gutter 按钮设置 title/aria-label */
function setUtilityButtonTitles(root: ParentNode, label: string): void {
  for (let button of root.querySelectorAll(`button[data-utility-button]`))
    ((button as HTMLElement).title = label, button.setAttribute(`aria-label`, label));
}

/** 原 OO：递归遍历 shadow root */
function walkShadowRoots(root: ParentNode, visit: (shadow: ShadowRoot) => void): void {
  for (let node of root.querySelectorAll(`*`)) node.shadowRoot && (visit(node.shadowRoot), walkShadowRoots(node.shadowRoot, visit));
}

/** 原 yze：构建代码查看器文件源（含缓存键） */
function buildCodeViewerFileSource(args: {
  code: string;
  enableSyntaxHighlighting: boolean;
  language?: string;
  theme?: CodeCommentTheme;
}): { name: string; contents: string; lang: string | undefined; cacheKey: string } {
  let lang = args.enableSyntaxHighlighting ? args.language : `text`,
    name = args.language ? `preview.${args.language}` : `preview.txt`,
    theme = args.theme ?? `auto`;
  return {
    name,
    contents: args.code,
    lang,
    cacheKey: `${theme}:${name}:${lang}:${args.code.length}:${hashStringBase36(args.code)}`,
  };
}

/** 原 kO：行区间归一（start≤end） */
function normalizeLineRange(range: LineRange): LineRange {
  return { startLine: Math.min(range.startLine, range.endLine), endLine: Math.max(range.startLine, range.endLine) };
}

/** 原 AO：选择区（1 基偏移）→ 行区间 */
function selectionToLineRange(selection: { start: number; end: number }, firstLineNumber: number): LineRange {
  return normalizeLineRange({ startLine: firstLineNumber + selection.start - 1, endLine: firstLineNumber + selection.end - 1 });
}

/** 原 bze：行区间 → 相对首行号 */
function rangeToRelativeLines(range: LineRange, firstLineNumber: number): { start: number; end: number } {
  let normalized = normalizeLineRange(range);
  return { start: normalized.startLine - firstLineNumber + 1, end: normalized.endLine - firstLineNumber + 1 };
}

/** 原 xze：按行区间截取代码文本 */
function extractRangeText(code: string, firstLineNumber: number, range: LineRange): string {
  let lines = code.split(`
`),
    normalized = normalizeLineRange(range),
    start = Math.max(normalized.startLine - firstLineNumber, 0),
    end = Math.min(normalized.endLine - firstLineNumber, lines.length - 1);
  return start > end
    ? ``
    : lines.slice(start, end + 1).join(`
`);
}

/** 原 jO：评论行区间文案（单行/多行） */
function formatCommentRangeLabel(labels: CodeCommentLabels, range: LineRange): string {
  let normalized = normalizeLineRange(range);
  return normalized.startLine === normalized.endLine
    ? labels.commentLine.replaceAll(`{line}`, String(normalized.startLine))
    : labels.commentRange
        .replaceAll(`{startLine}`, String(normalized.startLine))
        .replaceAll(`{endLine}`, String(normalized.endLine));
}

/** 原 Sze：评论输入框（Enter+修饰 提交 / Esc 取消） */
function CodeCommentComposer({
  range,
  labels,
  value,
  onValueChange,
  onSubmit,
  onCancel,
}: {
  range: LineRange;
  labels: CodeCommentLabels;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  let inputRef = React.useRef<HTMLTextAreaElement | null>(null),
    cancelLabel = cancelShortcutLabel(),
    cancelText = `${labels.cancelComment} (${cancelLabel})`,
    submitLabel = submitShortcutLabel(),
    submitText = `${labels.submitComment} (${submitLabel})`;
  return (
    React.useEffect(() => {
      let frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => {
        cancelAnimationFrame(frame);
      };
    }, []),
    (
      <div className={`m-2 rounded-lg border border-border bg-background p-3 font-sans shadow-sm`}>
        <div className={`mb-2 text-ui-base text-foreground-subtle`}>{formatCommentRangeLabel(labels, range)}</div>
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (isSubmitCommentShortcut(event)) {
              (event.preventDefault(), onSubmit());
              return;
            }
            isEscapeKey(event) && (event.preventDefault(), onCancel());
          }}
          placeholder={labels.commentPlaceholder}
          className={`min-h-16 w-full resize-none rounded-lg border-input-border bg-input text-ui-base text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 md:text-ui-base`}
          rows={3}
          autoFocus
        />
        <div className={`mt-2 flex items-center justify-end gap-2`}>
          <Button type={`button`} variant={`ghost`} title={cancelText} aria-label={cancelText} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type={`button`} title={submitText} aria-label={submitText} onClick={onSubmit}>
            {submitText}
          </Button>
        </div>
      </div>
    )
  );
}

/** 原 Cze：已存评论卡片（含删除） */
function CodeCommentCard({
  comment,
  labels,
  onDelete,
}: {
  comment: CodeComment;
  labels: CodeCommentLabels;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className={`m-2 rounded-lg border border-border bg-background p-3 font-sans shadow-sm`}>
      <div className={`mb-2 text-ui-base text-foreground-subtle`}>{formatCommentRangeLabel(labels, comment)}</div>
      {comment.comment.trim() ? (
        <div className={`whitespace-pre-wrap text-ui-base leading-relaxed text-foreground`}>{comment.comment}</div>
      ) : null}
      <div className={`mt-2 flex items-center justify-end`}>
        {onDelete ? (
          <Button
            type={`button`}
            variant={`ghost`}
            className={`text-foreground-subtle hover:text-foreground`}
            title={labels.deleteComment}
            aria-label={labels.deleteComment}
            onClick={() => onDelete(comment.id)}
          >
            <IconTrash className={`size-4`} />
            {labels.deleteComment}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** 原 MO：带行内评论的代码查看器（选区/草稿/gutter 工具/shadow CSS 注入） */
function CodeViewerWithComments({
  code,
  enableSyntaxHighlighting = true,
  language,
  showLineNumbers = true,
  theme,
  wrapLongLines = false,
  fontSizePx = 12,
  firstLineNumber = 1,
  comments = [],
  enableLineSelection = false,
  enableGutterUtility = false,
  labels,
  onSubmitCodeComment,
  onDeleteCodeComment,
  scrollContainerRef,
  className,
  style,
  ...rest
}: {
  code: string;
  enableSyntaxHighlighting?: boolean;
  language?: string;
  showLineNumbers?: boolean;
  theme?: CodeCommentTheme;
  wrapLongLines?: boolean;
  fontSizePx?: number;
  firstLineNumber?: number;
  comments?: CodeComment[];
  enableLineSelection?: boolean;
  enableGutterUtility?: boolean;
  labels?: Partial<CodeCommentLabels>;
  onSubmitCodeComment?: (args: { range: LineRange; selectedText: string; comment: string }) => void;
  onDeleteCodeComment?: (id: string) => void;
  scrollContainerRef?: React.Ref<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  let containerRef = React.useRef<HTMLDivElement | null>(null),
    [draftRange, setDraftRange] = React.useState<LineRange | null>(null),
    [draftText, setDraftText] = React.useState(``),
    commentsEnabled = !!onSubmitCodeComment,
    lineSelectionEnabled = commentsEnabled && enableLineSelection,
    gutterEnabled = commentsEnabled && enableGutterUtility,
    mergedLabels = React.useMemo(() => ({ ...CODE_COMMENT_DEFAULT_LABELS, ...labels }), [labels]),
    fileSource = React.useMemo(
      () => buildCodeViewerFileSource({ code, enableSyntaxHighlighting, language, theme }),
      [code, enableSyntaxHighlighting, language, theme],
    ),
    lineAnnotations = React.useMemo(() => {
      let annotations: Array<{ lineNumber: number; metadata: { kind: string; [key: string]: unknown } }> = [];
      for (let comment of comments) {
        let lineNumber = normalizeLineRange(comment).endLine - firstLineNumber + 1;
        lineNumber < 1 || annotations.push({ lineNumber, metadata: { kind: `comment`, comment } });
      }
      return (
        commentsEnabled &&
          draftRange &&
          annotations.push({ lineNumber: normalizeLineRange(draftRange).endLine - firstLineNumber + 1, metadata: { kind: `draft`, range: draftRange } }),
        annotations
      );
    }, [draftRange, commentsEnabled, comments, firstLineNumber]),
    selectedLines = React.useMemo(() => (commentsEnabled && draftRange ? rangeToRelativeLines(draftRange, firstLineNumber) : null), [draftRange, commentsEnabled, firstLineNumber]),
    handleLineSelectionEnd = React.useCallback(
      (selection: { start: number; end: number } | null) => {
        !commentsEnabled || !selection || (setDraftRange(selectionToLineRange(selection, firstLineNumber)), setDraftText(``));
      },
      [commentsEnabled, firstLineNumber],
    ),
    handleGutterClick = React.useCallback(
      (selection: { start: number; end: number }) => {
        commentsEnabled && (setDraftRange(selectionToLineRange(selection, firstLineNumber)), setDraftText(``));
      },
      [commentsEnabled, firstLineNumber],
    ),
    submitDraft = React.useCallback(() => {
      if (!draftRange) return;
      let selectedText = extractRangeText(code, firstLineNumber, draftRange);
      selectedText.trim() && (onSubmitCodeComment?.({ range: normalizeLineRange(draftRange), selectedText, comment: draftText.trim() }), setDraftRange(null), setDraftText(``));
    }, [draftRange, code, draftText, firstLineNumber, onSubmitCodeComment]);
  React.useEffect(() => {
    if (!gutterEnabled || !containerRef.current) return;
    let root = containerRef.current,
      observers: MutationObserver[] = [],
      seen = new WeakSet<ShadowRoot>(),
      frame = 0,
      observeShadow = (shadow: ShadowRoot) => {
        if (seen.has(shadow)) return;
        seen.add(shadow);
        let observer = new MutationObserver(scheduleRefresh);
        (observer.observe(shadow, { childList: true, subtree: true }), observers.push(observer));
      },
      applyTitles = () => {
        (setUtilityButtonTitles(root, mergedLabels.addCommentTooltip),
          walkShadowRoots(root, (shadow) => {
            (observeShadow(shadow), setUtilityButtonTitles(shadow, mergedLabels.addCommentTooltip));
          }));
      };
    function scheduleRefresh() {
      frame ||= window.requestAnimationFrame(() => {
        ((frame = 0), applyTitles());
      });
    }
    return (
      observeShadow(root as unknown as ShadowRoot),
      applyTitles(),
      scheduleRefresh(),
      () => {
        frame && window.cancelAnimationFrame(frame);
        for (let observer of observers) observer.disconnect();
      }
    );
  }, [gutterEnabled, mergedLabels.addCommentTooltip]);
  let viewerOptions = React.useMemo(
      () => ({
        disableFileHeader: true,
        disableLineNumbers: !showLineNumbers,
        overflow: wrapLongLines ? `wrap` : `scroll`,
        theme,
        enableLineSelection: lineSelectionEnabled,
        enableGutterUtility: gutterEnabled,
        lineHoverHighlight: lineSelectionEnabled || gutterEnabled ? `both` : `disabled`,
        onLineSelectionEnd: handleLineSelectionEnd,
        onGutterUtilityClick: gutterEnabled ? handleGutterClick : void 0,
        unsafeCSS: CODE_COMMENT_GUTTER_CSS,
      }),
      [gutterEnabled, lineSelectionEnabled, handleGutterClick, handleLineSelectionEnd, showLineNumbers, theme, wrapLongLines],
    ),
    containerStyle = React.useMemo(
      () => ({
        colorScheme: resolveColorScheme(theme),
        "--diffs-bg": `var(--color-background)`,
        "--diffs-light-bg": `var(--color-background)`,
        "--diffs-dark-bg": `var(--color-background)`,
        "--diffs-font-size": `${fontSizePx}px`,
        "--code-comment-add-tooltip": cssVarJsonEscape(gutterEnabled ? mergedLabels.addCommentTooltip : ``),
        ...style,
      }),
      [gutterEnabled, fontSizePx, mergedLabels.addCommentTooltip, style, theme],
    );
  return (
    <div
      ref={React.useCallback(
        (node: HTMLDivElement | null) => {
          ((containerRef.current = node), assignRef(scrollContainerRef, node));
        },
        [scrollContainerRef],
      )}
      className={cn(`h-full w-full overflow-auto`, className)}
      data-language={language}
      style={containerStyle}
      {...rest}
    >
      <DiffViewer
        file={fileSource}
        options={viewerOptions}
        lineAnnotations={lineAnnotations}
        selectedLines={selectedLines}
        className={`min-h-full w-full`}
        style={containerStyle}
        renderAnnotation={(annotation) =>
          annotation.metadata.kind === `draft` ? (
            <CodeCommentComposer
              range={annotation.metadata.range as LineRange}
              labels={mergedLabels}
              value={draftText}
              onValueChange={setDraftText}
              onSubmit={submitDraft}
              onCancel={() => {
                (setDraftRange(null), setDraftText(``));
              }}
            />
          ) : (
            <CodeCommentCard comment={annotation.metadata.comment as CodeComment} labels={mergedLabels} onDelete={onDeleteCodeComment} />
          )
        }
      />
    </div>
  );
}

/** 原 NO：语言是否为 mermaid */
function isMermaidLanguage(language: string): boolean {
  let normalized = language.trim().toLowerCase();
  return normalized === `mermaid` || normalized === `mmd`;
}

/* ============================================================================
 * 2. FileRewindDialog 深部（原 110410–110634）
 * ==========================================================================*/

/** 原 __t：构建文件预览源（代码查看器入参） */
export function buildFilePreviewSource(args: {
  path: string;
  relativePath: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}): {
  type: `file`;
  title: string;
  path: string;
  workspacePath?: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
} {
  let { path, relativePath, workspacePath, workspaceIdentity, workspaceRemoteSessionId } = args;
  return {
    type: `file`,
    title: relativePath,
    path,
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(workspaceRemoteSessionId ? { workspaceRemoteSessionId } : {}),
  };
}

/** 「打开方式」目标形（判别联合）：file 支收 path/title/label 全量；
 *  website 支 bundle 111334 调用面仅 type+url（path/title/label 可省）。
 *  previewSource.path 可选：消费面 E_t（ConversationLeaves）按 card.path 可缺省。 */
interface FileOpenPreviewSource {
  type: string;
  title: string;
  path?: string;
  workspacePath?: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
}
type OpenWithTarget =
  | { type: `file`; path: string; title: string; label: string; url?: string; previewSource?: FileOpenPreviewSource }
  | { type: `website`; url?: string; path?: string; title?: string; label?: string; previewSource?: FileOpenPreviewSource };

/** 原 v_t：文件「打开方式」拆分按钮（主打开 + 第三方 App 菜单 + 复制路径） */
export function FileOpenWithMenu({
  target,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  hideOpenWithMenu = false,
  stopPropagation = false,
}: {
  target: OpenWithTarget;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenFileLink?: (args: {
    path: string;
    label: string;
    pathKind: string;
    workspacePath?: string;
    workspaceIdentity?: string;
    workspaceRemoteSessionId?: string;
  }) => void;
  onOpenCodeViewer?: (source: { type: string; title: string; path?: string }) => void; // path 可省：previewSource 透传面（E_t 形）path 可缺
  hideOpenWithMenu?: boolean;
  stopPropagation?: boolean;
}) {
  let { intl } = useIntlContext(),
    platform = usePlatform() as unknown as PlatformService,
    contextActions = useFileContextActions(),
    previewSource = target.type === `file` ? target.previewSource : void 0,
    remoteInfo = useRemoteWorkspaceInfo({
      workspacePath: previewSource?.workspacePath,
      workspaceIdentity: previewSource?.workspaceIdentity,
      workspaceRemoteSessionId: previewSource?.workspaceRemoteSessionId,
    }),
    remoteTarget = remoteInfo.remoteTarget as { kind?: string } | null,
    isRemote = !!(previewSource?.workspaceIdentity || previewSource?.workspaceRemoteSessionId || remoteInfo.isRemoteWorkspace),
    [installedEditors, setInstalledEditors] = React.useState<InstalledEditor[]>([]),
    [editorsLoaded, setEditorsLoaded] = React.useState(false),
    [editorsLoading, setEditorsLoading] = React.useState(false),
    availableEditors = React.useMemo(
      () =>
        isRemote && !remoteTarget
          ? []
          : resolveAvailableEditors({ installedEditors, selectedEditorId: null, remoteTarget }).availableEditors,
      [installedEditors, isRemote, remoteTarget],
    ),
    canOpen = target.type === `website` ? !!onOpenBrowserUrl : !!(onOpenFileLink || onOpenCodeViewer),
    preferredEditor = React.useMemo(() => {
      let lastId = getLastEditorId();
      return availableEditors.find((editor) => editor.id === lastId) ?? availableEditors[0] ?? null;
    }, [availableEditors]),
    swallow = (event: { stopPropagation(): void }) => {
      stopPropagation && event.stopPropagation();
    },
    loadEditors = React.useCallback(async () => {
      if (!(editorsLoaded || editorsLoading || target.type !== `file`)) {
        setEditorsLoading(true);
        try {
          (setInstalledEditors(await platform.getInstalledEditors()), setEditorsLoaded(true));
        } catch (error) {
          logger.warn(`[OpenSplitButton] 获取第三方打开方式失败`, {
            path: target.path,
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          setEditorsLoading(false);
        }
      }
    }, [editorsLoaded, editorsLoading, platform, target]),
    openPrimary = () => {
      if (target.type === `website`) {
        onOpenBrowserUrl?.(target.url as string);
        return;
      }
      if (onOpenCodeViewer) {
        onOpenCodeViewer(target.previewSource ?? { type: `file`, title: target.title, path: target.path });
        return;
      }
      onOpenFileLink?.({
        path: target.path,
        label: target.label,
        pathKind: `file`,
        workspacePath: target.previewSource?.workspacePath,
        workspaceIdentity: target.previewSource?.workspaceIdentity,
        workspaceRemoteSessionId: target.previewSource?.workspaceRemoteSessionId,
      });
    },
    openInEditor = (editor: InstalledEditor) => {
      target.type === `file` &&
        (setLastEditorId(editor.id),
        platform
          .openInEditor(editor.id, target.path, {
            pathKind: `file`,
            remoteTarget,
            workspaceIdentity: target.previewSource?.workspaceIdentity,
          })
          .then((result) => {
            result.success ||
              logger.warn(`[OpenSplitButton] 第三方 App 打开文件失败`, {
                editorId: editor.id,
                path: target.path,
                error: result.error ?? `unknown-error`,
              });
          }));
    };
  return hideOpenWithMenu ? (
    <div
      className={`flex h-7 shrink-0 items-center overflow-hidden rounded-lg border border-border bg-input transition-all hover:border-border-hover`}
      onClick={swallow}
      onPointerDown={swallow}
    >
      <Button
        type={`button`}
        variant={`ghost`}
        size={`default`}
        className={`h-7 rounded-none border-0 gap-1 px-2`}
        disabled={!canOpen}
        onClick={(event: any) => {
          (swallow(event), openPrimary());
        }}
      >
        {intl.formatMessage({ id: `common.open` })}
      </Button>
    </div>
  ) : (
    <DropdownMenu onOpenChange={(open) => open && void loadEditors()}>
      <div
        className={`flex h-7 shrink-0 items-center overflow-hidden rounded-lg border border-border bg-input transition-all hover:border-border-hover`}
        onClick={swallow}
        onPointerDown={swallow}
      >
        <Button
          type={`button`}
          variant={`ghost`}
          size={`default`}
          className={`h-7 rounded-none border-0 gap-1 pr-1.5`}
          disabled={!canOpen}
          onClick={(event: any) => {
            (swallow(event), openPrimary());
          }}
        >
          {intl.formatMessage({ id: `common.open` })}
        </Button>
        <DropdownMenuTrigger asChild>
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-md`}
            className={`!w-5 rounded-none border-0 text-foreground-subtlest`}
            aria-label={intl.formatMessage({ id: `appHeader.selectOpenApp` })}
            title={intl.formatMessage({ id: `appHeader.selectOpenApp` })}
            onClick={swallow}
          >
            <IconChevronDown className={`size-3.5`} />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align={`end`} side={`top`} className={`w-44`} onClick={swallow}>
        {target.type === `website` ? (
          <DropdownMenuItem onSelect={() => platform.openExternal(target.url as string)}>
            <IconOpenExternal className={`size-4`} />
            <span>{intl.formatMessage({ id: `chat.previewCards.openExternal` })}</span>
          </DropdownMenuItem>
        ) : (
          <>
            {preferredEditor
              ? availableEditors.map((editor: InstalledEditor) => (
                  <DropdownMenuItem key={editor.id} onSelect={() => openInEditor(editor)}>
                    <img src={editor.iconDataUrl} alt={editor.name} className={`size-4 shrink-0`} />
                    <span>{editor.name}</span>
                  </DropdownMenuItem>
                ))
              : (
                <DropdownMenuItem disabled>
                  {intl.formatMessage({
                    id: editorsLoading ? `common.loading` : `chat.previewCards.noOpenApps`,
                  })}
                </DropdownMenuItem>
              )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void contextActions.copyAbsolutePath({ path: target.path })}>
              <IconCopy className={`size-4`} />
              {intl.formatMessage({ id: `fileActions.copyAbsolutePath` })}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                void contextActions.copyRelativePath({
                  path: target.path,
                  relativePath: target.previewSource?.workspacePath
                    ? relativePathFromWorkspace(target.previewSource.workspacePath, target.path)
                    : target.label,
                })
              }
            >
              <IconCopy className={`size-4`} />
              {intl.formatMessage({ id: `fileActions.copyRelativePath` })}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================================
 * 尾：符号表（混淆名 → 语义名 → 实测 js 行 / jsx 行，便于反查）
 * ----------------------------------------------------------------------------
 *  [C 段 MO 深部 47354–47712]
 *   cze resolveColorScheme 47354/42631 | lze assignRef 47363/42634
 *   uze CODE_COMMENT_DEFAULT_LABELS 47372/42643 | dze CODE_COMMENT_GUTTER_CSS 47382/42643
 *   fze cssVarJsonEscape 47390/42654 | pze hashStringBase36 47393/42657
 *   mze navigatorFingerprint 47398/42662 | hze isSubmitCommentShortcut 47403/42668
 *   gze isEscapeKey 47406/42671 | _ze submitShortcutLabel 47409/42674
 *   vze cancelShortcutLabel 47412/42677 | DO setUtilityButtonTitles 47415/42680
 *   OO walkShadowRoots 47419/42683 | yze buildCodeViewerFileSource 47422/42686
 *   kO normalizeLineRange 47433/42697 | AO selectionToLineRange 47436/42703
 *   bze rangeToRelativeLines 47439/42709 | xze extractRangeText 47443/42716
 *   jO formatCommentRangeLabel 47454/42725 | Sze CodeCommentComposer 47462/42729
 *   Cze CodeCommentCard 47518/42766 | MO CodeViewerWithComments 47549/42773
 *   NO isMermaidLanguage 47709/42910
 *  [D 段 FileRewindDialog 深部 110410–110634]
 *   __t buildFilePreviewSource 110410/94426 | v_t FileOpenWithMenu 110427/94447
 *
 *  双归属/已覆盖注记：
 *   - oze（47343）= 暗色探测，横切层声明；
 *   - p1/yg = GitReview.tsx 已实现（openFileChangeInViewer/toWorkspaceRelativePath），声明不重复；
 *   - b_t/f1/y_t/x_t = GitReview.tsx 已实现，排除只注记；
 *   - QA/JA = FileTreePanel.tsx 重建；$A/zA/OA/kA = MarkdownIntegration.tsx 重建；声明挂接。
 * ============================================================================
 */
