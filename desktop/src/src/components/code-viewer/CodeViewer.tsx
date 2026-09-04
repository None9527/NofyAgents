// A0-S4-4c: 自 modules/CodeViewer.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/code-viewer/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * CodeViewer.tsx — ZCode 3.7.6 代码查看/文件预览族（解混淆重建 · D8 Stage B3 / F14）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机 213,979 行，未改动；旧账 213,695 行拷贝已不在本机，两版行号不同，本文件引证 vintage 逐条混杂、用前须以本机束重定〔A1-R163〕）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族 = 代码查看面板：breadcrumb 头（滚动渐隐遮罩）+ 更多菜单（markdown/svg 视图切换、
 * 换行、复制路径）+ 外部编辑器打开；内容分派（text/image/svg/pdf/office/pptx/patch/
 * multi-file-diff）；256KB 文本上限 + 2MB/64MB PDF/PPTX 阈值 + PPTX 残缺读取守卫；
 * 重内容延迟渲染占位（骨架 + 滚动位恢复）；行级代码评论 store（FH）。
 * shiki/diff 引擎（X08/X09）与 office/pdf/pptx 懒加载分包按依赖挂接，不逐行还原。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  预览视图群（160323–161140 / jsx 132770 起）：
 *   U8   → MarkdownPreviewView       cj 渲染 markdown 内容 (160565)
 *   iVt  → CodeViewDispatcher        纯文本语言→BO，否则 MO（高亮+评论+gutter）(160587)
 *   aVt  → CHECKERBOARD_BG_CLASS     透明图棋盘底 (160635)
 *   oVt  → imageScaleFromFilename    @2x 后缀解析 (160636)
 *   sVt  → ImageView                 自然尺寸×@Nx 缩放 / fitToContainer (160642)
 *   cVt  → SvgView                   svg 文本→data-url 复用 ImageView (160665)
 *   lVt/uVt → LazyPdfViewer/PdfPreviewSuspense (160432,160438)
 *   dVt/fVt → LazyPptxViewer/PptxPreviewSuspense (160445,160454)
 *   pVt/mVt/W8 → DIFF_UNSAFE_CSS=''/DiffViewerImpl/DiffViewer(memo)（vendored diff 封装）(160478,160479,160541)
 *   hVt/gVt/_Vt → isPatchSource/rest-props 透传助手 (160543,160546,160561)
 *   vVt  → PatchPreview              patch→纯文本行(Oft) 或 W8 (160578)
 *   yVt/bVt/xVt → LazyXlsx/LazyDocx/LazyLegacyDoc (160607–160636)
 *   SVt  → OfficePreviewErrorBoundary（resetKey 复位）(160633)
 *   CVt/wVt/TVt → OfficePending/Error/Dispatcher（excel/docx/legacy 三分派）(160654,160663,160670)
 *   EVt/G8 → isSvgPath/resolveErrorColor（fileMissing→destructive）(160696,160700)
 *   DVt  → CodeViewerContentDispatcher  全型分派+加载/错误/二进制/空态 (160945)
 *
 *  PPTX 残缺读取守卫（160926–160963）：
 *   OVt=256*1024 分块；kVt/K8 → 错误码/错误类；AVt isIncomplete；jVt assertComplete；MVt readWholeFileInChunks
 *
 *  头/占位/助手（160966–161140）：
 *   NVt  → SCROLL_FADE_MASKS         none/left/right/both 渐隐遮罩 (161206)
 *   PVt  → SKELETON_ROW_WIDTHS       12 行骨架宽度% (160970)
 *   FVt/q8/J8/Y8/Z8 → splitPath/isMarkdownSource/isSvgSource/md 扩展/svg 扩展 (160973–160986)
 *   X8   → isEnoentError             code|message 双判 (161227)
 *   IVt/LVt/RVt/zVt → pptx 引用缺失/too-large 判/错误文案绝对路径相对化/总解析 (160994–161014)
 *   BVt/VVt → scrollSnapshot/resolveFilePreviewState（isBinary|truncated）(161016,161018)
 *   HVt  → imageMediaTypeOf          mime≠svg 才作图片 (161270)
 *   UVt/WVt/GVt/KVt → 256KB/2MB/64MB/pptx-too-large (161032,161033,161036)
 *   qVt  → HeavyContentDeferredPlaceholder  骨架 12 行 (161280)
 *   JVt/YVt/XVt/ZVt/QVt/$Vt → 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 (161064–161114)
 *   eHt  → resolveBreadcrumb         工作区内相对分段/外绝对 (161356)
 *
 *  根组件：
 *   tHt  → CodeViewerPanel           aside data-testid=preview-pane (161383)
 *
 *  行级代码评论 store（68511–68579 / jsx 60720）：
 *   kH/PH → workspaceKeyOf/bucketKeyOf（`${ws}\0${path}`）(68508,68511)
 *   FH   → useCodeCommentsStore      getComments/addComment/removeComment/removeCommentBySource/restore/clearSource
 *
 *  常量：HBe=256*1024 文本首读上限（50129）；EA=`zcode-last-editor-id`（50856）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单
 * ----------------------------------------------------------------------------
 *  1. react；2. cn (Z)；3. Button (X)/图标；4. useIntlContext (G)；5. logger (J)；
 *  6. toast (m) imeComposition；7. 设置 store (ko) + resolveTheme (xo)；
 *  8. useWorkspaceServices (Oc) → fileService；9. 远程工作区信息 ($A)；
 * 10. 编辑器安装列表/打开 (getInstalledEditors/openInEditor，PlatformService)；
 * 11. JA resolveSelectedEditor（Settings 域）；12. 文件动作 g（copyAbsolutePath/copyRelativePath）；
 * 13. zA relativePath、Go basename、zc/Vc 文件图标、rA detectLanguage、fg patchToPlainTextLines、
 *     NO isPlainTextLanguage、BO PlainCodeBlock、MO HighlightedCodeBlockWithComments、
 *     gut PlainTextDiffPreview、Oft PatchPlainTextPreview、cj MarkdownRenderer、
 *     nze/rze vendored diff 组件（X09）、no base64ToArrayBuffer、iA/oA/sA/ro 文件类型判定、
 *     Ko isAbsolutePath、cae normalizeDecodedSource（SidePanel 族）、YBe diffSourceOf、
 *     OXe/_Xe/kXe 代码评论聊天附件、QV uid —— 同 chunk 他族/横切，接口声明挂接
 * 14. 懒加载分包：pdf-viewer / pptx-preview-viewer / previewPaneOffice* （动态 import 登记）
 * ============================================================================
 */

import * as React from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Ellipsis as IconEllipsis, ExternalLink as IconOpenExternal, FileCode as IconFileCode, Eye as IconEye, Copy as IconCopy, ChevronDown as IconChevronDown } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { nanoid as uid, useCodeCommentsStore } from '../../modules/Composer'; // 原 QV（js 67278；A0-CLEANUP2 item 12 接线：uid declare → Composer 属主导出 nanoid）+ A1-R8：FH 双实例收敛改指（canonical = Composer 6716 区）
import { toast, usePlatform as usePlatformService } from '../../modules/ImeComposition'; // 原 m / 平台服务钩子（imeComposition chunk 导出 M=usePlatform）
import { LazyPdfViewer, LazyPptxPreviewViewer } from '../../modules/LazyPreviewViewers';
import { MarkdownRenderer, baseName as basename, isAbsolutePath, relativePathFromWorkspace as relativePath, useRemoteWorkspaceInfo } from '../../modules/MarkdownIntegration'; // 原 Go / Ko / zA / $A
import { FileIconImg, resolveFileDisplayInfo } from '../../modules/ModalsLeaves'; // 原 Vc / zc
import { buildDiffPreviewSource, detectPreviewLanguage as detectLanguage, imageMimeTypeOfPath as mimeTypeOfPath, isPdfPreviewPath as isPdfPath, isPptxPreviewPath as isPptxPath, type DiffPreviewFileSource } from '../../modules/PreviewCards'; // 原 rA / iA / oA / sA；+DiffPreviewFileSource（A0-CLEANUP4 tHt 发射面具型）
import { resolveAvailableEditors as useResolvedEditor, useFileContextActions as useFileActions } from '../../modules/FileTreePanel'; // 原 JA / g（QA 族文件动作）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）
import { t as logger } from '../../modules/logger'; // 原 J（logger-PFDwl5Yq.js 导出 t）
import { resolveThemeMode as useResolvedTheme } from '../../modules/Settings'; // 原 xo（theme → dark|light）
import { normalizeDecodedSource } from '../../modules/SidePanel'; // 原 cae（A0-CLEANUP B-26 接线；SidePanel 族解码归一）
import { create as createZustandStore } from '../../modules/SkillStore'; // 原 Ae（zustand create，SkillStore 导出）
import { useWorkspaceServices } from '../../modules/services';
import { useSettingsStore } from '../../modules/stores-core';

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };


// A0-CLEANUP2 item 12：uid declare 删除 → import { nanoid as uid } from './Composer'（bundle Ue 评论 id = QV()，js 161559）。

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type: "button";
  variant: "ghost" | "secondary";
  size: "default" | "icon-md";
  title?: string;
  "aria-label"?: string;
  disabled?: boolean;
  "data-diff-source-preview-trigger"?: boolean;
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */

/** lucide 风格图标（原 wa/K_/q_/Y_/J_/W_/N_/Vc） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（7）：IconChevronRight/IconEllipsis/IconOpenExternal/IconFileCode/IconEye/IconCopy/IconChevronDown → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** DropdownMenu 封装（原 VO/HO/UO/WO/GO/KO/qO/JO/YO） */
/* ── tombstone（A0-S3c）：DropdownMenu、DropdownMenuCheckboxItem、DropdownMenuContent、DropdownMenuItem、DropdownMenuLabel、DropdownMenuRadioGroup、DropdownMenuRadioItem、DropdownMenuSeparator、DropdownMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */









/* ----------------------------------------------------------------------------
 * 设置 / 服务 / 编辑器
 * -------------------------------------------------------------------------- */
export interface CodePreviewSettings {
  fontSizePx: number;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  lightTheme: string;
  darkTheme: string;
}
interface SettingsState {
  theme: string;
  codePreviewSettings: CodePreviewSettings;
}
/** 原 ko（zustand 设置 store） */
/** 原 xo：theme → dark|light */

interface FilePreviewResult {
  isBinary: boolean;
  truncated: boolean;
  content: string;
}
interface FileService {
  readTextFile(req: { path: string; offset: number; length: number }): Promise<FilePreviewResult>;
  readMediaPreview(req: { path: string }): Promise<{ mediaType: string; dataBase64: string }>;
  readFileRange(req: { path: string; offset: number; length: number }): Promise<Uint8Array>;
  readBinaryPreview(req: { path: string }): Promise<{ dataBase64: string; totalBytes?: number }>;
  stat(req: { path: string }): Promise<{ size?: number }>;
}
interface WorkspaceServices {
  fileService: FileService;
}
/** 原 Oc */

interface RemoteWorkspaceInfo {
  remoteTarget: { kind?: string } | null;
  isRemoteWorkspace: boolean;
}
/** 原 $A */

interface InstalledEditor {
  id: string;
  name: string;
  [key: string]: unknown;
}
interface PlatformService {
  getInstalledEditors(): Promise<InstalledEditor[]>;
  openInEditor(
    editorId: string,
    path: string,
    options: { pathKind: "file"; remoteTarget: { kind?: string } | null; workspaceIdentity?: string },
  ): Promise<{ success: boolean; error?: string }>;
}
/** 原 JA：已安装编辑器 × 偏好 × 远程门 → 选中编辑器 */

/** 原 g：文件动作（复制路径） */

/* ----------------------------------------------------------------------------
 * 同 chunk 他族叶子组件 / 助手（接口挂接）
 * -------------------------------------------------------------------------- */
/** 原 cj（Markdown 渲染器，F19） */
/** 原 BO：纯文本代码块 */
declare const PlainCodeBlock: React.FC<{ code: string; theme: string; className?: string }>;
/** 原 MO：高亮代码块（行号/换行/行选择/gutter 评论工具） */
declare const HighlightedCodeBlockWithComments: React.FC<{
  code: string;
  language: string;
  showLineNumbers: boolean;
  theme: string;
  wrapLongLines: boolean;
  fontSizePx: number;
  firstLineNumber?: number;
  comments: CodeComment[];
  enableLineSelection: boolean;
  enableGutterUtility: boolean;
  labels: CodeCommentLabels;
  onSubmitCodeComment: (args: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => void;
  onDeleteCodeComment: (id: string) => void;
  onScroll?: () => void;
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  className?: string;
}>;
/** 原 NO：是否纯文本语言（无高亮） */
declare function isPlainTextLanguage(language: string): boolean;
/** 原 rA：语言探测 */
/** 原 fg：patch → 纯文本行（非 patch 返回 null） */
declare function patchToPlainTextLines(patch: string): string[] | null;
/** 原 gut：纯文本 diff 预览（本文件无消费点，声明移除；实体在 ModalsLeaves 导出） */
/** 原 Oft：patch 纯文本预览（带语言头） */
declare const PatchPlainTextPreview: React.FC<{
  className?: string;
  codePreviewSettings: CodePreviewSettings;
  "data-patch-plain-text-preview"?: boolean;
  language: string;
  lines: string[];
  path: string | null;
  theme: string;
}>;
/** 原 nze/rze：vendored diff 引擎组件（X09） */
declare const DiffFilePairViewer: React.FC<{
  oldFile: DiffFileSpec;
  newFile: DiffFileSpec;
  options: Record<string, unknown>;
  disableWorkerPool?: boolean;
  className?: string;
  style?: React.CSSProperties;
}>;
declare const DiffPatchViewer: React.FC<{
  patch: string;
  options: Record<string, unknown>;
  disableWorkerPool?: boolean;
  className?: string;
  style?: React.CSSProperties;
}>;
/** 原 no：base64 → ArrayBuffer */
declare function base64ToArrayBuffer(dataBase64: string): ArrayBuffer | null;
/** 原 iA/oA/sA/ro：mime / pdf / pptx / office 判定（4946–6061 文件类型工具块） */
declare function officeKindOfPath(path: string): "excel" | "docx" | "legacy-doc" | null;
/** 原 Ko：绝对路径判 */
/** 原 Go/zA：basename / 相对路径 */
/** 原 zc：文件显示信息（图标） */
/* ── tombstone（A0-CLEANUP B-26）：normalizeDecodedSource declare 删除 →
 *    import { normalizeDecodedSource } from './SidePanel'（原 cae，SidePanel 族）。 ── */
/** 原 YBe：patch/multi-file-diff → 可回看的 diff source */

/** 懒加载分包（动态 import 登记；真实 chunk 见 out/renderer/assets/） */
declare const LazyOfficeXlsxContent: React.LazyExoticComponent<
  React.FC<{ buffer: ArrayBuffer; errorMessage: string; isDark: boolean; sourcePath: string }>
>;
declare const LazyOfficeDocxContent: React.LazyExoticComponent<
  React.FC<{ buffer: ArrayBuffer; errorMessage: string; sourcePath: string }>
>;
declare const LazyOfficeLegacyDocContent: React.LazyExoticComponent<
  React.FC<{ buffer: ArrayBuffer; errorMessage: string; sourcePath: string }>
>;

/* ============================================================================
 * 1. 代码评论 store（原 kH/PH/FH，js 68508–68579 / jsx 60720）
 * ==========================================================================*/

export interface CodeComment {
  id: string;
  sourcePath: string;
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
}
interface CodeCommentBucketKeyArgs {
  workspacePath: string;
  workspaceIdentity?: string | null;
  sourcePath: string;
}

/** 原 kH */
export function workspaceKeyOf(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 PH：`${workspaceKey}\0${sourcePath}` */
export function commentBucketKey({ workspacePath, workspaceIdentity, sourcePath }: CodeCommentBucketKeyArgs): string {
  return `${workspaceKeyOf(workspacePath, workspaceIdentity)}\0${sourcePath}`;
}

const EMPTY_COMMENTS: CodeComment[] = [];

interface CodeCommentsStoreState {
  commentsByBucketKey: Record<string, CodeComment[]>;
  getComments(bucket: CodeCommentBucketKeyArgs): CodeComment[];
  addComment(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    sourcePath: string;
    comment: CodeComment;
  }): void;
  removeComment(args: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; id: string }): void;
  removeCommentBySource(args: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void;
  restoreCommentFromAttachment(comment: CodeComment & { workspacePath: string; workspaceIdentity?: string | null }): void;
  clearSource(bucket: CodeCommentBucketKeyArgs): void;
}
/** zustand create（原 Ae，skillStore chunk；set 支持局部更新） */


/** 原 FH：行级代码评论 store（按 工作区\0源路径 分桶）
 * ── tombstone（A1-R8 双实例收敛）：本地 create（325–393 区）删除 → 改指 canonical
 *    modules/Composer.tsx useCodeCommentsStore（bundle 唯一 FH@68562）。本文件消费面
 *    1604–1606 = bundle 161450–161452 钩子簇（getComments/addComment/removeComment 逐字对应）。
 *    导出面维系：modules/CodeViewer.tsx 91 行 re-export 不破（零终端拉取，留面备查）。
 *    本地 CodeCommentsStoreState 型面（307）随 create 删除失引，保留备查。 ── */
export { useCodeCommentsStore };

/** 原 OXe/_Xe/kXe/vXe：代码评论 ↔ 聊天附件同步（Composer 域横切） */
declare function addCodeCommentAttachmentToChat(args: {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  sourcePath: string;
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
  contextLabel: string;
  commentLabel: string;
}): void;
declare function hasCodeCommentAttachment(args: { id: string; workspacePath: string; workspaceIdentity?: string | null }): boolean;
declare function removeCodeCommentAttachment(args: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void;
/* ── tombstone〔A1-R45〕：declare markCodeCommentAttachmentRestored 删除——本文件零消费（grep 实测仅本 declare 行），全树独见。
 * 纯删碑；未来消费面出现 → 经 bundle 取证定真身后重新引入。A1-R45 项 2 杂项微批，证据见 A1-R45.report.md §二。 ── */




/* ============================================================================
 * 2. source 类型与投影助手（原 160966–161140）
 * ==========================================================================*/

export type CodeViewerSourceType =
  | { type: "text"; title: string; path?: string; language: string; content: string }
  | { type: "image"; title: string; path?: string; mediaType: string }
  | { type: "pdf"; title: string; path?: string }
  | { type: "pptx"; title: string; path: string; referenceNavigation?: PptxReferenceNavigation }
  | { type: "file"; title: string; path: string }
  | { type: "patch"; title: string; path?: string; patch: string }
  | { type: "multi-file-diff"; title: string; path?: string; beforeContent: string; afterContent: string };

export interface DecodedCodeViewerSource {
  type: CodeViewerSourceType["type"];
  title: string;
  path?: string;
  language?: string;
  content?: string;
  mediaType?: string;
  patch?: string;
  beforeContent?: string;
  afterContent?: string;
  referenceNavigation?: PptxReferenceNavigation;
  workspacePath?: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
}
export type CodeViewerSourceInput = DecodedCodeViewerSource & Record<string, unknown>;
export interface PptxReferenceSource {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sourcePath: string;
  sourceTitle: string;
}
export interface PptxReferenceNavigation {
  requestId: string;
  [key: string]: unknown;
}
interface DiffFileSpec {
  name: string;
  contents: string;
  cacheKey: string;
}

/** 原 NVt：breadcrumb 横向滚动渐隐遮罩 */
export const SCROLL_FADE_MASKS: Record<"none" | "left" | "right" | "both", string> = {
  none: "",
  left: "[mask-image:linear-gradient(to_right,transparent_0,black_16px,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_16px,black_100%)]",
  right: "[mask-image:linear-gradient(to_right,black_0,black_calc(100%-16px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0,black_calc(100%-16px),transparent_100%)]",
  both: "[mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]",
};

/** 原 PVt */
export const SKELETON_ROW_WIDTHS = [44, 72, 58, 86, 64, 78, 52, 90, 68, 48, 82, 60];

/** 原 FVt */
export function splitPathSegments(path: string): string[] {
  return path.replace(/\\/g, "/").split("/").filter(Boolean);
}

/** 原 q8 */
export function isMarkdownSource(source: { type: string; language?: string } | null): boolean {
  return source?.type === "text" && source.language === "markdown";
}

/** 原 J8 */
export function isSvgSource(source: { type: string; path?: string } | null): boolean {
  return source?.type === "text" && source.path?.toLowerCase().endsWith(".svg") === true;
}

/** 原 Y8 */
export function hasMarkdownExtension(path: string | null | undefined): boolean {
  if (!path) return false;
  const lowered = path.toLowerCase();
  return lowered.endsWith(".md") || lowered.endsWith(".markdown");
}

/** 原 Z8 */
export function hasSvgExtension(path: string | null | undefined): boolean {
  return path?.toLowerCase().endsWith(".svg") ?? false;
}

/** 原 X8 */
export function isEnoentError(error: unknown): boolean {
  if (typeof error === "object" && error && "code" in error && (error as { code: unknown }).code === "ENOENT") return true;
  const message = error instanceof Error ? error.message : String(error);
  return /\bENOENT\b/i.test(message) || /no such file or directory/i.test(message);
}

/** 原 IVt */
export function isPptxReferenceMissing(source: DecodedCodeViewerSource | null, error: unknown): boolean {
  return !!(source?.type === "pptx" && source.referenceNavigation !== void 0 && isEnoentError(error));
}

/** 原 LVt */
export function isLegacyFileTooLargeError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /file is too large to preview/i.test(message);
}

/** 原 RVt：错误文案中的绝对路径相对化 */
export function relativizeErrorMessage(message: string, sourcePath: string | null | undefined): string {
  if (!sourcePath) return message;
  const shortened = basename(sourcePath);
  const variants = new Set([sourcePath, sourcePath.replace(/\\/g, "/"), sourcePath.replace(/\//g, "\\")]);
  let result = message;
  for (const variant of variants) if (variant !== shortened) result = result.split(variant).join(shortened);
  return result;
}

export interface PreviewErrorLabels {
  fileMissingMessage: string;
  legacyFileTooLargeMessage: string;
  incompleteFileMessage: string;
  sourcePath: string | null;
}

/** 原 zVt */
export function resolvePreviewErrorMessage(error: unknown, labels: PreviewErrorLabels): string {
  return isEnoentError(error)
    ? labels.fileMissingMessage
    : isLegacyFileTooLargeError(error)
      ? labels.legacyFileTooLargeMessage
      : isPptxIncompleteFileError(error)
        ? labels.incompleteFileMessage
        : relativizeErrorMessage(
            error instanceof Error ? error.message : String(error),
            labels.sourcePath,
          );
}

/** 原 BVt */
export function scrollSnapshot(container: HTMLDivElement | null): { scrollHeight: number; scrollTop: number } | null {
  return container ? { scrollHeight: container.scrollHeight, scrollTop: container.scrollTop } : null;
}

/** 原 VVt */
export function resolveFilePreviewState(
  preview: FilePreviewResult,
): { filePreview: FilePreviewResult | null; fileTooLarge: boolean } {
  return preview.isBinary
    ? { filePreview: preview, fileTooLarge: false }
    : preview.truncated
      ? { filePreview: null, fileTooLarge: true }
      : { filePreview: preview, fileTooLarge: false };
}

/** 原 HVt：mime 存在且非 svg+xml 才作图片预览 */
export function imageMediaTypeOf(path: string): string | null {
  const mime = mimeTypeOfPath(path);
  return mime && mime !== "image/svg+xml" ? mime : null;
}

/* ----------------------------------------------------------------------------
 * PPTX 残缺读取守卫（原 160926–160963）
 * -------------------------------------------------------------------------- */

/** 原 OVt */
export const PPTX_READ_CHUNK_BYTES = 256 * 1024;
/** 原 kVt */
const PPTX_PREVIEW_INCOMPLETE_FILE = "PPTX_PREVIEW_INCOMPLETE_FILE";

/** 原 K8 */
export class PptxPreviewIncompleteFileError extends Error {
  code = PPTX_PREVIEW_INCOMPLETE_FILE;
  expectedBytes: number;
  actualBytes: number;
  observedFileSize?: number;
  constructor(expectedBytes: number, actualBytes: number, observedFileSize?: number) {
    super(
      observedFileSize === void 0
        ? `PPTX preview read was incomplete: expected ${expectedBytes} bytes, received ${actualBytes}`
        : `PPTX preview file size changed while reading: expected ${expectedBytes} bytes, received ${actualBytes}, current size ${observedFileSize}`,
    );
    this.expectedBytes = expectedBytes;
    this.actualBytes = actualBytes;
    this.observedFileSize = observedFileSize;
    this.name = "PptxPreviewIncompleteFileError";
  }
}

/** 原 AVt */
export function isPptxIncompleteFileError(error: unknown): boolean {
  return (
    error instanceof PptxPreviewIncompleteFileError ||
    (typeof error === "object" && !!error && "code" in error && (error as { code: unknown }).code === PPTX_PREVIEW_INCOMPLETE_FILE)
  );
}

/** 原 jVt */
export function assertPptxReadComplete(args: { expectedBytes: number; actualBytes: number; observedFileSize?: number }): void {
  if (args.actualBytes !== args.expectedBytes || (args.observedFileSize !== void 0 && args.observedFileSize !== args.expectedBytes))
    throw new PptxPreviewIncompleteFileError(args.expectedBytes, args.actualBytes, args.observedFileSize);
}

/** 原 MVt：256KB 分块读全文件，读完校验字节数 */
export async function readWholeFileInChunks(args: {
  fileSize: number;
  readRange: (offset: number, length: number) => Promise<Uint8Array>;
  isDisposed: () => boolean;
}): Promise<ArrayBuffer | null> {
  const buffer = new Uint8Array(args.fileSize);
  let offset = 0;
  while (offset < args.fileSize) {
    const length = Math.min(PPTX_READ_CHUNK_BYTES, args.fileSize - offset);
    const chunk = await args.readRange(offset, length);
    if (args.isDisposed()) return null;
    if (chunk.length === 0) throw new PptxPreviewIncompleteFileError(args.fileSize, offset);
    if (chunk.length > length)
      throw Error(`PPTX preview range exceeded request: requested ${length} bytes, received ${chunk.length}`);
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  assertPptxReadComplete({ expectedBytes: args.fileSize, actualBytes: offset });
  return buffer.buffer;
}

/** 原 UVt/WVt/GVt */
export const TEXT_PREVIEW_MAX_BYTES = 256 * 1024;
export const PDF_INLINE_MAX_BYTES = 2 * 1024 * 1024;
export const PPTX_MAX_BYTES = 64 * 1024 * 1024;

/** 原 KVt */
export function isPptxTooLarge(size: number): boolean {
  return size > PPTX_MAX_BYTES;
}

/** 原 qVt：重内容延迟渲染占位（12 行骨架） */
export function HeavyContentDeferredPlaceholder({ style }: { style?: React.CSSProperties }) {
  return (
    <div aria-hidden="true" className="h-full w-full overflow-hidden bg-background" data-preview-pane-heavy-content-deferred="true" style={style}>
      <div className="sticky top-0 flex h-full min-h-0 flex-col gap-1.5 overflow-hidden p-3" data-preview-pane-heavy-content-placeholder="true">
        {SKELETON_ROW_WIDTHS.map((width, index) => (
          <div key={`${width}-${index}`} className="flex h-4 shrink-0 items-center gap-2">
            <span className="h-3 w-8 shrink-0 rounded-sm bg-surface" />
            <span className="h-3 rounded-sm bg-surface-hover" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 原 JVt */
export function projectImageSource(source: DecodedCodeViewerSource | null): { type: "image"; title: string; path: string; mediaType: string } | null {
  if (!source) return null;
  if (source.type === "image") return source as { type: "image"; title: string; path: string; mediaType: string };
  if (source.type !== "file") return null;
  const mediaType = imageMediaTypeOf(source.path ?? "");
  return mediaType ? { type: "image", title: source.title, path: source.path ?? "", mediaType } : null;
}

/** 原 YVt */
export function projectPdfSource(source: DecodedCodeViewerSource | null): { type: "pdf"; title: string; path: string } | null {
  if (!source) return null;
  if (source.type === "pdf") return source as { type: "pdf"; title: string; path: string };
  return source.type === "file" && isPdfPath(source.path ?? "") ? { type: "pdf", title: source.title, path: source.path ?? "" } : null;
}

/** 原 XVt */
export function projectPptxSource(source: DecodedCodeViewerSource | null): (DecodedCodeViewerSource & { type: "pptx"; path: string }) | null {
  if (!source) return null;
  if (source.type === "pptx") return source as DecodedCodeViewerSource & { type: "pptx"; path: string };
  return source.type === "file" && isPptxPath(source.path ?? "") ? { ...source, type: "pptx", path: source.path ?? "" } : null;
}

/** 原 ZVt */
export function hasHeavyPreview(source: DecodedCodeViewerSource | null): boolean {
  return !!(projectPdfSource(source) || projectPptxSource(source) || (source?.type === "file" && officeKindOfPath(source.path ?? "")));
}

/** 原 QVt */
export function isCodeOnlySource(source: DecodedCodeViewerSource | null): boolean {
  if (!source) return false;
  if (source.type === "text") return !isMarkdownSource(source) && !isSvgSource(source);
  if (source.type === "file")
    return (
      !hasMarkdownExtension(source.path) &&
      !hasSvgExtension(source.path) &&
      !imageMediaTypeOf(source.path ?? "") &&
      !isPdfPath(source.path ?? "") &&
      !officeKindOfPath(source.path ?? "") &&
      !isPptxPath(source.path ?? "")
    );
  return false;
}

/** 原 $Vt：更多菜单能力 */
export function resolveViewerToggles(
  source: DecodedCodeViewerSource | null,
  options: { markdownViewMode?: string; svgViewMode?: string } = {},
): { canToggleCodeWrap: boolean; canToggleMarkdownView: boolean; canToggleSvgView: boolean; hasMoreMenu: boolean } {
  const canToggleMarkdownView = source !== null && (isMarkdownSource(source) || (source.type === "file" && hasMarkdownExtension(source.path)));
  const canToggleSvgView = source !== null && (isSvgSource(source) || (source.type === "file" && hasSvgExtension(source.path)));
  const canToggleCodeWrap =
    isCodeOnlySource(source) ||
    (canToggleMarkdownView && options.markdownViewMode === "code") ||
    (canToggleSvgView && options.svgViewMode === "code");
  return { canToggleCodeWrap, canToggleMarkdownView, canToggleSvgView, hasMoreMenu: canToggleMarkdownView || canToggleSvgView || canToggleCodeWrap };
}

export interface BreadcrumbModel {
  rootLabel: string | null;
  parentSegments: string[];
  fileLabel: string;
  fileIconSrc: string | null;
}

/** 原 eHt：breadcrumb（工作区内→根=工作区名+相对分段；外→绝对分段） */
export function resolveBreadcrumb(source: DecodedCodeViewerSource, workspacePath: string | null): BreadcrumbModel | null {
  const path = source.path;
  if (!path)
    return source.title.trim() ? { rootLabel: null, parentSegments: [], fileLabel: source.title, fileIconSrc: null } : null;
  const normalized = path.replace(/\\/g, "/");
  const workspaceRoot = workspacePath?.replace(/\\/g, "/").replace(/\/+$/, "") ?? null;
  const fileName = basename(path);
  const display = resolveFileDisplayInfo(path);
  if (workspaceRoot && (normalized === workspaceRoot || normalized.startsWith(`${workspaceRoot}/`))) {
    const segments = splitPathSegments(normalized === workspaceRoot ? "" : normalized.slice(workspaceRoot.length + 1));
    return {
      rootLabel: basename(workspaceRoot),
      parentSegments: segments.slice(0, -1),
      fileLabel: segments.at(-1) ?? fileName,
      fileIconSrc: display.fileIconSrc,
    };
  }
  const segments = splitPathSegments(normalized);
  return {
    rootLabel: path.startsWith("/") ? "/" : (segments[0] ?? null),
    parentSegments: path.startsWith("/") ? segments.slice(0, -1) : segments.slice(1, -1),
    fileLabel: segments.at(-1) ?? fileName,
    fileIconSrc: display.fileIconSrc,
  };
}

/* ============================================================================
 * 3. 预览视图群（原 160323–160698）
 * ==========================================================================*/

/** 原 U8：markdown 预览视图 */
export function MarkdownPreviewView({
  content,
  workspacePath,
  theme,
  codePreviewSettings,
  onOpenBrowserUrl,
}: {
  content: string;
  workspacePath: string | null;
  theme: string;
  codePreviewSettings: CodePreviewSettings;
  onOpenBrowserUrl?: (url: string) => void;
}) {
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

export interface CodeCommentLabels {
  addComment: string;
  addCommentTooltip: string;
  commentPlaceholder: string;
  submitComment: string;
  cancelComment: string;
  deleteComment: string;
  commentLine: string;
  commentRange: string;
}

/** 原 iVt：代码视图分派（纯文本语言→PlainCodeBlock，否则高亮块） */
export function CodeViewDispatcher({
  code,
  language,
  codePreviewSettings,
  codeTheme,
  theme,
  wrapLongLines,
  firstLineNumber,
  comments,
  enableLineSelection = false,
  enableGutterUtility = false,
  labels,
  onSubmitCodeComment,
  onDeleteCodeComment,
  onScroll,
  scrollContainerRef,
  className,
}: {
  code: string;
  language: string;
  codePreviewSettings: CodePreviewSettings;
  codeTheme: string;
  theme: string;
  wrapLongLines: boolean;
  firstLineNumber?: number;
  comments: CodeComment[];
  enableLineSelection?: boolean;
  enableGutterUtility?: boolean;
  labels: CodeCommentLabels;
  onSubmitCodeComment: (args: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => void;
  onDeleteCodeComment: (id: string) => void;
  onScroll?: () => void;
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return isPlainTextLanguage(language) ? (
    <div ref={scrollContainerRef} className={cn("h-full w-full overflow-auto bg-background p-4", className)} onScroll={onScroll}>
      <PlainCodeBlock code={code} theme={theme} className="min-h-full rounded-xl border border-border" />
    </div>
  ) : (
    <HighlightedCodeBlockWithComments
      code={code}
      language={language}
      showLineNumbers={codePreviewSettings.showLineNumbers}
      theme={codeTheme}
      wrapLongLines={wrapLongLines}
      fontSizePx={codePreviewSettings.fontSizePx}
      firstLineNumber={firstLineNumber}
      comments={comments}
      enableLineSelection={enableLineSelection}
      enableGutterUtility={enableGutterUtility}
      labels={labels}
      onSubmitCodeComment={onSubmitCodeComment}
      onDeleteCodeComment={onDeleteCodeComment}
      onScroll={onScroll}
      scrollContainerRef={scrollContainerRef}
      className={className}
    />
  );
}

/** 原 aVt */
const CHECKERBOARD_BG_CLASS =
  "[background-color:var(--color-background)] [background-image:linear-gradient(45deg,var(--color-surface)_25%,transparent_25%),linear-gradient(-45deg,var(--color-surface)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--color-surface)_75%),linear-gradient(-45deg,transparent_75%,var(--color-surface)_75%)] [background-position:0_0,0_4px,4px_-4px,-4px_0] [background-size:8px_8px]";

/** 原 oVt：文件名 @Nx 缩放因子 */
export function imageScaleFromFilename(path: string | null | undefined): number {
  const fileName = (path ?? "").replace(/\\/g, "/").split("/").at(-1) ?? "";
  const match = /@(\d+(?:\.\d+)?)x(?=(?:\.[^./\\]+)?$)/i.exec(fileName);
  const scale = match ? Number(match[1]) : 1;
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/** 原 sVt：图片预览（棋盘底 + @Nx 自然尺寸缩放） */
export function ImageView({
  title,
  fitToContainer = false,
  imageSource,
  sourcePath,
}: {
  title: string;
  fitToContainer?: boolean;
  imageSource: string;
  sourcePath?: string | null;
}) {
  const [naturalSize, setNaturalSize] = React.useState<{ source: string; width: number; height: number } | null>(null);
  const scale = React.useMemo(() => imageScaleFromFilename(sourcePath ?? title), [sourcePath, title]);
  const scaledStyle = React.useMemo(() => {
    if (!(fitToContainer || scale <= 1 || naturalSize?.source !== imageSource || naturalSize.width <= 0 || naturalSize.height <= 0))
      return { height: naturalSize.height / scale, width: naturalSize.width / scale };
  }, [fitToContainer, imageSource, naturalSize, scale]);
  const handleLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (fitToContainer) return;
      const target = event.currentTarget;
      setNaturalSize({ source: imageSource, width: target.naturalWidth, height: target.naturalHeight });
    },
    [fitToContainer, imageSource],
  );
  const objectClass = fitToContainer ? "h-full max-h-full w-full max-w-full object-contain" : "h-auto max-h-full w-auto max-w-full object-contain";
  return (
    <div className={`flex h-full min-h-0 items-center justify-center overflow-hidden p-10 ${CHECKERBOARD_BG_CLASS}`}>
      <img alt={title} className={objectClass} onLoad={handleLoad} src={imageSource} style={scaledStyle} />
    </div>
  );
}

/** 原 cVt */
export function SvgView({ title, svgContent }: { title: string; svgContent: string }) {
  return (
    <ImageView
      fitToContainer
      title={title}
      imageSource={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`}
    />
  );
}

/** 原 uVt */
export function PdfPreviewSuspense({
  source,
  labels,
}: {
  source: string | Uint8Array | { totalBytes: number; requestRange: (offset: number, length: number) => Promise<Uint8Array> };
  labels: Record<string, unknown>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="p-3 text-ui-base text-foreground-subtle">{(labels.loading as string) ?? ""}</div>
      }
    >
      <LazyPdfViewer source={source} labels={labels} className="h-full" />
    </React.Suspense>
  );
}

/** 原 fVt */
export function PptxPreviewSuspense({
  data,
  labels,
  fileName,
  referenceSource,
  referenceNavigation,
  referenceNavigationReady,
}: {
  data: ArrayBuffer;
  labels: Record<string, unknown>;
  fileName: string;
  referenceSource?: PptxReferenceSource | null;
  referenceNavigation?: PptxReferenceNavigation | null;
  referenceNavigationReady: boolean;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="p-3 text-ui-base text-foreground-subtle">{(labels.loading as string) ?? ""}</div>
      }
    >
      <LazyPptxPreviewViewer
        data={data}
        labels={labels}
        {...(referenceSource ? { referenceSource } : {})}
        {...(referenceNavigation ? { referenceNavigation } : {})}
        referenceNavigationReady={referenceNavigationReady}
        className="h-full"
        fileName={fileName}
      />
    </React.Suspense>
  );
}

/* ----------------------------------------------------------------------------
 * DiffViewer（原 pVt/mVt/W8/hVt/gVt/_Vt，vendored diff 封装）
 * -------------------------------------------------------------------------- */

const DIFF_UNSAFE_CSS = "";

export interface DiffViewerProps {
  patch?: string;
  oldFile?: DiffFileSpec;
  newFile?: DiffFileSpec;
  options?: Record<string, unknown>;
  disableWorkerPool?: boolean;
  lightTheme?: string;
  darkTheme?: string;
  themeType: "dark" | "light" | string;
  diffClassName?: string;
  fontSizePx?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** 原 hVt */
function isPatchMode(props: DiffViewerProps): boolean {
  return typeof props.patch === "string";
}

/** 原 mVt：diff 引擎封装（统一视图 + bars 指示 + word-alt） */
export function DiffViewerImpl(props: DiffViewerProps) {
  const isPatch = isPatchMode(props);
  const {
    options,
    disableWorkerPool = false,
    lightTheme,
    darkTheme,
    themeType,
    diffClassName,
    fontSizePx = 12,
    className,
    style,
  } = props;
  const cssVars = React.useMemo(
    () => ({
      "--diffs-bg": "var(--color-background)",
      "--diffs-light-bg": "var(--color-background)",
      "--diffs-dark-bg": "var(--color-background)",
      "--diffs-font-size": `${fontSizePx}px`,
      ...style,
    }),
    [fontSizePx, style],
  );
  const engineOptions = React.useMemo(
    () => ({
      diffStyle: "unified",
      diffIndicators: "bars",
      disableFileHeader: true,
      hunkSeparators: isPatch ? "simple" : "line-info",
      lineDiffType: "word-alt",
      overflow: "scroll",
      unsafeCSS: DIFF_UNSAFE_CSS,
      theme: lightTheme && darkTheme ? { light: lightTheme, dark: darkTheme } : void 0,
      themeType,
      ...options,
    }),
    [darkTheme, isPatch, lightTheme, options, themeType],
  );
  const engine = isPatch ? (
    <DiffPatchViewer
      patch={props.patch ?? ""}
      options={engineOptions}
      disableWorkerPool={disableWorkerPool}
      className={cn("min-h-full w-full", diffClassName)}
      style={cssVars}
    />
  ) : (
    <DiffFilePairViewer
      oldFile={props.oldFile as DiffFileSpec}
      newFile={props.newFile as DiffFileSpec}
      options={engineOptions}
      disableWorkerPool={disableWorkerPool}
      className={cn("min-h-full w-full", diffClassName)}
      style={cssVars}
    />
  );
  return (
    <div className={cn("h-full w-full overflow-auto", className)} data-diff-viewer="" style={cssVars}>
      {engine}
    </div>
  );
}

/** 原 W8 */
export const DiffViewer = React.memo(DiffViewerImpl);

/** 原 vVt：patch 预览（纯文本行优先，否则 diff 引擎） */
export function PatchPreview({
  patch,
  codePreviewSettings,
  resolvedTheme,
  sourcePath,
  sourceTitle,
}: {
  patch: string;
  codePreviewSettings: CodePreviewSettings;
  resolvedTheme: "dark" | "light";
  sourcePath?: string;
  sourceTitle: string;
}) {
  const plainLines = React.useMemo(() => patchToPlainTextLines(patch), [patch]);
  const displayPath = sourcePath ?? sourceTitle;
  const language = React.useMemo(() => detectLanguage(displayPath, patch), [displayPath, patch]);
  const theme = resolvedTheme === "dark" ? codePreviewSettings.darkTheme : codePreviewSettings.lightTheme;
  return plainLines ? (
    <PatchPlainTextPreview
      className="h-full"
      codePreviewSettings={codePreviewSettings}
      data-patch-plain-text-preview
      language={language}
      lines={plainLines}
      path={displayPath}
      theme={theme}
    />
  ) : (
    <DiffViewer
      patch={patch}
      diffClassName="block"
      fontSizePx={codePreviewSettings.fontSizePx}
      lightTheme={codePreviewSettings.lightTheme}
      darkTheme={codePreviewSettings.darkTheme}
      themeType={resolvedTheme}
    />
  );
}

/* ----------------------------------------------------------------------------
 * Office 预览（原 yVt…TVt）
 * -------------------------------------------------------------------------- */

/** 原 SVt：Office 预览错误边界（resetKey 变化复位） */
export class OfficePreviewErrorBoundary extends React.Component<
  { fallback: React.ReactNode; resetKey: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("[PreviewPane] Office 预览组件渲染失败", {
      error: error.message,
      componentStack: info.componentStack ?? "",
    });
  }
  componentDidUpdate(previous: { resetKey: string }) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) this.setState({ hasError: false });
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/** 原 CVt */
export function OfficePendingPlaceholder() {
  return <div aria-busy="true" className="h-full min-h-0 w-full bg-background" data-office-preview-pending="true" />;
}

/** 原 wVt */
export function OfficePreviewErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 text-ui-base text-destructive" role="alert">
      {children}
    </div>
  );
}

/** 原 TVt：excel/docx/legacy 三分派 + 边界 + Suspense */
export function OfficePreviewDispatcher({
  error,
  kind,
  loading,
  preview,
  resolvedTheme,
  sourcePath,
}: {
  error: string | null;
  kind: "excel" | "docx" | "legacy-doc";
  loading: boolean;
  preview: { dataBase64: string; totalBytes?: number } | null;
  resolvedTheme: "dark" | "light";
  sourcePath: string;
}) {
  const { intl } = useIntlContext();
  const unavailableMessage = intl.formatMessage({ id: "codeViewer.officeUnavailable" });
  const buffer = React.useMemo(() => (preview ? base64ToArrayBuffer(preview.dataBase64) : null), [preview]);
  return loading || (!error && !buffer) ? (
    <OfficePendingPlaceholder />
  ) : error || !buffer ? (
    <OfficePreviewErrorAlert>{error ?? unavailableMessage}</OfficePreviewErrorAlert>
  ) : (
    <OfficePreviewErrorBoundary
      fallback={<OfficePreviewErrorAlert>{unavailableMessage}</OfficePreviewErrorAlert>}
      resetKey={`${kind}:${sourcePath}:${preview?.totalBytes ?? 0}`}
    >
      <React.Suspense fallback={<OfficePendingPlaceholder />}>
        {kind === "excel" ? (
          <LazyOfficeXlsxContent buffer={buffer} errorMessage={unavailableMessage} isDark={resolvedTheme === "dark"} sourcePath={sourcePath} />
        ) : kind === "docx" ? (
          <LazyOfficeDocxContent buffer={buffer} errorMessage={unavailableMessage} sourcePath={sourcePath} />
        ) : (
          <LazyOfficeLegacyDocContent buffer={buffer} errorMessage={unavailableMessage} sourcePath={sourcePath} />
        )}
      </React.Suspense>
    </OfficePreviewErrorBoundary>
  );
}

/** 原 EVt */
export function isSvgPath(path: string | null | undefined): boolean {
  return path?.toLowerCase().endsWith(".svg") ?? false;
}

/** 原 G8：错误文案色（fileMissing→subtlest，其余 destructive） */
export function resolveErrorColor(error: string, fileMissingMessage: string): string {
  return error === fileMissingMessage ? "text-foreground-subtlest" : "text-destructive";
}

/* ============================================================================
 * 4. 内容分派器（原 DVt，js 160699 / jsx 133073）
 * ==========================================================================*/

/** 原 DVt：全型内容分派（patch/multi-file-diff/text/image/pdf/office/pptx/file 回退） */
export function CodeViewerContentDispatcher({
  source,
  filePreview,
  fileTooLarge,
  loadingInitial,
  loadingImagePreview,
  imagePreview,
  loadingPdfPreview,
  pdfViewerSource,
  pdfViewerLabels,
  loadingOfficePreview,
  officePreview,
  officePreviewKind,
  loadingPptxPreview,
  pptxPreviewData,
  pptxViewerLabels,
  pptxReferenceSource,
  pptxReferenceNavigation,
  pptxReferenceNavigationReady,
  error,
  codePreviewSettings,
  codeTheme,
  resolvedTheme,
  theme,
  workspacePath,
  onOpenBrowserUrl,
  markdownViewMode,
  svgViewMode,
  wrapLongLines,
  codeComments,
  enableCodeLineSelection = false,
  enableCodeGutterUtility = false,
  codeCommentLabels,
  onSubmitCodeComment,
  onDeleteCodeComment,
  onScroll,
  scrollContainerRef,
}: {
  source: DecodedCodeViewerSource;
  filePreview: FilePreviewResult | null;
  fileTooLarge: boolean;
  loadingInitial: boolean;
  loadingImagePreview: boolean;
  imagePreview: { mediaType: string; dataBase64: string } | null;
  loadingPdfPreview: boolean;
  pdfViewerSource:
    | string
    | Uint8Array
    | { totalBytes: number; requestRange: (offset: number, length: number) => Promise<Uint8Array> }
    | null;
  pdfViewerLabels: Record<string, unknown>;
  loadingOfficePreview: boolean;
  officePreview: { dataBase64: string; totalBytes?: number } | null;
  officePreviewKind: "excel" | "docx" | "legacy-doc" | null;
  loadingPptxPreview: boolean;
  pptxPreviewData: ArrayBuffer | null;
  pptxViewerLabels: Record<string, unknown>;
  pptxReferenceSource: PptxReferenceSource | null;
  pptxReferenceNavigation: PptxReferenceNavigation | null;
  pptxReferenceNavigationReady: boolean;
  error: string | null;
  codePreviewSettings: CodePreviewSettings;
  codeTheme: string;
  resolvedTheme: "dark" | "light";
  theme: string;
  workspacePath: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  markdownViewMode: "preview" | "code";
  svgViewMode: "preview" | "code";
  wrapLongLines: boolean;
  codeComments: CodeComment[];
  enableCodeLineSelection?: boolean;
  enableCodeGutterUtility?: boolean;
  codeCommentLabels: CodeCommentLabels;
  onSubmitCodeComment: (args: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => void;
  onDeleteCodeComment: (id: string) => void;
  onScroll: () => void;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { intl } = useIntlContext();
  const fileMissingMessage = intl.formatMessage({ id: "codeViewer.fileMissing" });
  const multiFileDiffFiles = React.useMemo(
    () =>
      source.type === "multi-file-diff"
        ? {
            oldFile: {
              name: source.path ?? source.title,
              contents: (source as { beforeContent: string }).beforeContent,
              cacheKey: `old:${source.path ?? source.title}:${(source as { beforeContent: string }).beforeContent.length}:${(source as { beforeContent: string }).beforeContent.slice(0, 100)}:${(source as { beforeContent: string }).beforeContent.slice(-100)}`,
            },
            newFile: {
              name: source.path ?? source.title,
              contents: (source as { afterContent: string }).afterContent,
              cacheKey: `new:${source.path ?? source.title}:${(source as { afterContent: string }).afterContent.length}:${(source as { afterContent: string }).afterContent.slice(0, 100)}:${(source as { afterContent: string }).afterContent.slice(-100)}`,
            },
          }
        : null,
    [source],
  );

  if (source.type === "patch")
    return (
      <PatchPreview
        patch={(source as { patch: string }).patch}
        codePreviewSettings={codePreviewSettings}
        resolvedTheme={resolvedTheme}
        sourcePath={source.path}
        sourceTitle={source.title}
      />
    );
  if (source.type === "multi-file-diff" && multiFileDiffFiles)
    return (
      <DiffViewer
        oldFile={multiFileDiffFiles.oldFile}
        newFile={multiFileDiffFiles.newFile}
        diffClassName="block"
        fontSizePx={codePreviewSettings.fontSizePx}
        lightTheme={codePreviewSettings.lightTheme}
        darkTheme={codePreviewSettings.darkTheme}
        themeType={resolvedTheme}
      />
    );
  if (source.type === "text") {
    const isMarkdown = source.language === "markdown";
    const isSvg = isSvgPath(source.path);
    const content = (source as { content: string }).content;
    return isMarkdown && markdownViewMode === "preview" ? (
      <MarkdownPreviewView
        content={content}
        workspacePath={workspacePath}
        theme={theme}
        codePreviewSettings={codePreviewSettings}
        onOpenBrowserUrl={onOpenBrowserUrl}
      />
    ) : isSvg && svgViewMode === "preview" ? (
      <SvgView title={source.title} svgContent={content} />
    ) : (
      <CodeViewDispatcher
        code={content}
        language={(source as { language: string }).language}
        codePreviewSettings={codePreviewSettings}
        codeTheme={codeTheme}
        theme={theme}
        wrapLongLines={wrapLongLines}
        comments={codeComments}
        enableLineSelection={enableCodeLineSelection}
        enableGutterUtility={enableCodeGutterUtility}
        labels={codeCommentLabels}
        onSubmitCodeComment={onSubmitCodeComment}
        onDeleteCodeComment={onDeleteCodeComment}
        onScroll={onScroll}
        scrollContainerRef={scrollContainerRef}
      />
    );
  }
  if (source.type === "image") {
    if (loadingImagePreview || (!error && !imagePreview))
      return (
        <div className="p-3 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "codeViewer.loadingImage" })}
        </div>
      );
    if (error || !imagePreview) {
      const message = error ?? intl.formatMessage({ id: "codeViewer.imageUnavailable" });
      return (
        <div className={`p-3 text-ui-base ${error ? resolveErrorColor(error, fileMissingMessage) : "text-destructive"}`}>
          {message}
        </div>
      );
    }
    return (
      <ImageView
        title={source.title}
        imageSource={`data:${imagePreview.mediaType};base64,${imagePreview.dataBase64}`}
        sourcePath={source.path}
      />
    );
  }
  if (source.type === "pdf") {
    if (loadingPdfPreview || (!error && !pdfViewerSource))
      return (
        <div className="p-3 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "codeViewer.loadingPdf" })}
        </div>
      );
    if (error || !pdfViewerSource) {
      const message = error ?? intl.formatMessage({ id: "codeViewer.pdfUnavailable" });
      return (
        <div className={`p-3 text-ui-base ${error ? resolveErrorColor(error, fileMissingMessage) : "text-destructive"}`}>
          {message}
        </div>
      );
    }
    return <PdfPreviewSuspense source={pdfViewerSource} labels={pdfViewerLabels} />;
  }
  if (source.type === "file" && officePreviewKind)
    return (
      <OfficePreviewDispatcher
        error={error}
        kind={officePreviewKind}
        loading={loadingOfficePreview}
        preview={officePreview}
        resolvedTheme={resolvedTheme}
        sourcePath={source.path ?? ""}
      />
    );
  if (source.type === "pptx") {
    if (loadingPptxPreview || (!error && !pptxPreviewData))
      return (
        <div className="p-3 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "codeViewer.loadingPptx" })}
        </div>
      );
    if (error || !pptxPreviewData) {
      const message = error ?? intl.formatMessage({ id: "codeViewer.pptxUnavailable" });
      return (
        <div className={`p-3 text-ui-base ${error ? resolveErrorColor(error, fileMissingMessage) : "text-destructive"}`}>
          {message}
        </div>
      );
    }
    return (
      <PptxPreviewSuspense
        data={pptxPreviewData}
        labels={pptxViewerLabels}
        fileName={source.path ?? ""}
        {...(pptxReferenceSource ? { referenceSource: pptxReferenceSource } : {})}
        {...(pptxReferenceNavigation ? { referenceNavigation: pptxReferenceNavigation } : {})}
        referenceNavigationReady={pptxReferenceNavigationReady}
      />
    );
  }
  if (loadingInitial && !filePreview)
    return (
      <div className="p-3 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "codeViewer.loadingFile" })}
      </div>
    );
  if (error && !filePreview)
    return <div className={`p-3 text-ui-base ${resolveErrorColor(error, fileMissingMessage)}`}>{error}</div>;
  if (fileTooLarge)
    return (
      <div className="p-3 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "codeViewer.fileTooLarge" })}
      </div>
    );
  if (!filePreview) return null;
  if (filePreview.isBinary)
    return (
      <div className="p-3 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "codeViewer.binary" })}
      </div>
    );
  if (filePreview.content.length === 0)
    return (
      <div className="p-3 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "codeViewer.empty" })}
      </div>
    );
  const language = detectLanguage(source.path, filePreview.content);
  const isMarkdownFile = language === "markdown";
  const isSvgFile = isSvgPath(source.path);
  return isMarkdownFile && markdownViewMode === "preview" ? (
    <MarkdownPreviewView content={filePreview.content} workspacePath={workspacePath} onOpenBrowserUrl={onOpenBrowserUrl} theme={theme} codePreviewSettings={codePreviewSettings} />
  ) : isSvgFile && svgViewMode === "preview" ? (
    <SvgView title={source.title} svgContent={filePreview.content} />
  ) : (
    <CodeViewDispatcher
      code={filePreview.content}
      language={language}
      codePreviewSettings={codePreviewSettings}
      codeTheme={codeTheme}
      theme={theme}
      wrapLongLines={wrapLongLines}
      comments={codeComments}
      enableLineSelection={enableCodeLineSelection}
      enableGutterUtility={enableCodeGutterUtility}
      labels={codeCommentLabels}
      onSubmitCodeComment={onSubmitCodeComment}
      onDeleteCodeComment={onDeleteCodeComment}
      onScroll={onScroll}
      scrollContainerRef={scrollContainerRef}
    />
  );
}

/* ============================================================================
 * 5. 最近编辑器偏好（原 EA/DA/OA，50856–50870）
 * ==========================================================================*/

const LAST_EDITOR_ID_KEY = "zcode-last-editor-id";
function editorPreferenceStorage(): Storage | null {
  if (typeof window > "u") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
/** 原 OA */
export function readLastEditorId(storage: Storage | null = editorPreferenceStorage()): string | null {
  const value = storage?.getItem(LAST_EDITOR_ID_KEY);
  return typeof value === "string" && value.length > 0 ? value : null;
}
/** 原 kA（styles 50904 逐字） */
export function rememberLastEditorId(editorId: string, storage: Storage | null = editorPreferenceStorage()): void {
  storage?.setItem(LAST_EDITOR_ID_KEY, editorId);
}

/* ============================================================================
 * 6. CodeViewerPanel（原 tHt，js 161141 / jsx 133444）
 * ==========================================================================*/

export interface CodeViewerPanelProps {
  source: CodeViewerSourceInput | null;
  /** bundle 调用面透传但 tHt 本体不消费（ground-truth jsx 147739 传 onClose: C；tHt jsx 133444 解构无此参） */
  onClose?: (tabId: string) => void;
  workspacePath?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  /** A0-CLEANUP4：发射面 = YBe 回看源（bundle js 161971 `we && r?.(we)`，we=YBe 恒 type:"file"） */
  onOpenCodeViewer?: (source: DiffPreviewFileSource) => void;
  renderHeavyContent?: boolean;
}

/** 原 tHt：代码查看面板根（breadcrumb 头 + 更多菜单 + 内容分派 + 重内容延迟） */
export function CodeViewerPanel({
  source,
  workspacePath,
  onOpenBrowserUrl,
  onOpenCodeViewer,
  renderHeavyContent = true,
}: CodeViewerPanelProps) {
  const platform = usePlatformService() as unknown as PlatformService;
  const { intl } = useIntlContext();
  const theme = useSettingsStore((state) => state.theme);
  const codePreviewSettings = useSettingsStore((state) => state.codePreviewSettings);
  const decoded = React.useMemo(() => (source ? normalizeDecodedSource(source) : null), [source]);
  const effectiveWorkspacePath: string | null = decoded?.workspacePath ?? workspacePath ?? null;
  const remoteInfo = useRemoteWorkspaceInfo({
    workspacePath: effectiveWorkspacePath,
    workspaceIdentity: decoded?.workspaceIdentity,
    workspaceRemoteSessionId: decoded?.workspaceRemoteSessionId,
  });
  const remoteTarget = remoteInfo.remoteTarget as { kind?: string } | null;
  const isRemote = !!(decoded?.workspaceIdentity || decoded?.workspaceRemoteSessionId || remoteInfo.isRemoteWorkspace);
  const fileActions = useFileActions();
  const { fileService } = useWorkspaceServices(effectiveWorkspacePath ?? "", decoded?.workspaceRemoteSessionId, decoded?.workspaceIdentity) as unknown as WorkspaceServices;

  const [filePreview, setFilePreview] = React.useState<FilePreviewResult | null>(null);
  const [fileTooLarge, setFileTooLarge] = React.useState(false);
  const [loadingInitial, setLoadingInitial] = React.useState(false);
  const [loadingImagePreview, setLoadingImagePreview] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<{ mediaType: string; dataBase64: string } | null>(null);
  const [loadingPdfPreview, setLoadingPdfPreview] = React.useState(false);
  const [pdfViewerSource, setPdfViewerSource] = React.useState<
    | string
    | Uint8Array
    | { totalBytes: number; requestRange: (offset: number, length: number) => Promise<Uint8Array> }
    | null
  >(null);
  const [loadingOfficePreview, setLoadingOfficePreview] = React.useState(false);
  const [officePreview, setOfficePreview] = React.useState<{ dataBase64: string; totalBytes?: number } | null>(null);
  const [loadingPptxPreview, setLoadingPptxPreview] = React.useState(false);
  const [pptxPreviewData, setPptxPreviewData] = React.useState<ArrayBuffer | null>(null);
  const [pptxReferenceReadyId, setPptxReferenceReadyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [installedEditors, setInstalledEditors] = React.useState<InstalledEditor[]>([]);
  const [lastEditorId] = React.useState(() => readLastEditorId());
  const [markdownViewMode, setMarkdownViewMode] = React.useState<"preview" | "code">("preview");
  const [svgViewMode, setSvgViewMode] = React.useState<"preview" | "code">("preview");
  const [wrapOverride, setWrapOverride] = React.useState<boolean | null>(null);
  const [fadeState, setFadeState] = React.useState<"none" | "left" | "right" | "both">("none");

  const breadcrumbRef = React.useRef<HTMLDivElement | null>(null);
  const breadcrumbInnerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollSnapshotRef = React.useRef({ scrollHeight: 0, scrollTop: 0 });
  const wasHeavyRenderedRef = React.useRef(renderHeavyContent);

  const resolvedTheme = useResolvedTheme(theme);
  const codeTheme = resolvedTheme === "dark" ? codePreviewSettings.darkTheme : codePreviewSettings.lightTheme;

  const imageSource = React.useMemo(() => projectImageSource(decoded), [decoded]);
  const pdfSource = React.useMemo(() => projectPdfSource(decoded), [decoded]);
  const officeKind = React.useMemo(() => (decoded?.type === "file" ? officeKindOfPath(decoded.path ?? "") : null), [decoded]);
  const pptxSource = React.useMemo(() => projectPptxSource(decoded), [decoded]);
  const hasHeavy = hasHeavyPreview(decoded);
  const pptxPath = pptxSource?.path ?? null;
  const pptxReferenceNavigation = pptxSource?.referenceNavigation ?? null;
  const diffSource = React.useMemo(
    () => (decoded?.type === "patch" || decoded?.type === "multi-file-diff" ? buildDiffPreviewSource(decoded as CodeViewerSourceInput, effectiveWorkspacePath) : null),
    [decoded, effectiveWorkspacePath],
  );
  const plainFileSource = decoded?.type === "file" && !imageSource && !pdfSource && !officeKind && !pptxSource ? decoded : null;
  const commentBucket = React.useMemo(
    () =>
      decoded?.path && effectiveWorkspacePath
        ? { workspacePath: effectiveWorkspacePath, workspaceIdentity: decoded.workspaceIdentity, sourcePath: decoded.path }
        : null,
    [decoded, effectiveWorkspacePath],
  );
  const codeComments = useCodeCommentsStore((state) => (commentBucket ? state.getComments(commentBucket) : []));
  const addComment = useCodeCommentsStore((state) => state.addComment);
  const removeComment = useCodeCommentsStore((state) => state.removeComment);
  const breadcrumb = React.useMemo(() => (decoded ? resolveBreadcrumb(decoded, effectiveWorkspacePath) : null), [decoded, effectiveWorkspacePath]);
  const { selectedEditor } = useResolvedEditor({
    installedEditors: isRemote && !remoteTarget ? [] : installedEditors,
    selectedEditorId: lastEditorId,
    remoteTarget,
  });
  const canOpenInEditor = !!(decoded?.path && selectedEditor);
  const canOpenSourcePreview = !!(diffSource && onOpenCodeViewer);
  const wrapLongLines = wrapOverride ?? codePreviewSettings.wrapLongLines;
  const canSelectLines = !!(decoded?.path && effectiveWorkspacePath);
  const {
    canToggleCodeWrap,
    canToggleMarkdownView,
    canToggleSvgView,
    hasMoreMenu,
  } = React.useMemo(() => resolveViewerToggles(decoded, { markdownViewMode, svgViewMode }), [markdownViewMode, decoded, svgViewMode]);

  const commentLabels = React.useMemo<CodeCommentLabels>(
    () => ({
      addComment: intl.formatMessage({ id: "codeViewer.comment.add" }),
      addCommentTooltip: intl.formatMessage({ id: "codeViewer.comment.addTooltip" }),
      commentPlaceholder: intl.formatMessage({ id: "codeViewer.comment.placeholder" }),
      submitComment: intl.formatMessage({ id: "codeViewer.comment.submit" }),
      cancelComment: intl.formatMessage({ id: "common.cancel" }),
      deleteComment: intl.formatMessage({ id: "codeViewer.comment.delete" }),
      commentLine: intl.formatMessage({ id: "codeViewer.comment.line" }),
      commentRange: intl.formatMessage({ id: "codeViewer.comment.range" }),
    }),
    [intl],
  );
  const pdfViewerLabels = React.useMemo(
    () => ({
      loading: intl.formatMessage({ id: "codeViewer.pdf.loading" }),
      loadError: intl.formatMessage({ id: "codeViewer.pdf.loadError" }),
      noData: intl.formatMessage({ id: "codeViewer.pdf.noData" }),
      previousPage: intl.formatMessage({ id: "codeViewer.pdf.previousPage" }),
      nextPage: intl.formatMessage({ id: "codeViewer.pdf.nextPage" }),
      pageInput: intl.formatMessage({ id: "codeViewer.pdf.pageInput" }),
      zoomIn: intl.formatMessage({ id: "codeViewer.pdf.zoomIn" }),
      zoomOut: intl.formatMessage({ id: "codeViewer.pdf.zoomOut" }),
    }),
    [intl],
  );
  const pptxViewerLabels = React.useMemo(
    () => ({
      loading: intl.formatMessage({ id: "codeViewer.pptx.loading" }),
      loadError: intl.formatMessage({ id: "codeViewer.pptx.loadError" }),
      noSlides: intl.formatMessage({ id: "codeViewer.pptx.noSlides" }),
      previousPage: intl.formatMessage({ id: "codeViewer.pptx.previousPage" }),
      nextPage: intl.formatMessage({ id: "codeViewer.pptx.nextPage" }),
      pageInput: intl.formatMessage({ id: "codeViewer.pptx.pageInput" }),
      zoomIn: intl.formatMessage({ id: "codeViewer.pptx.zoomIn" }),
      zoomOut: intl.formatMessage({ id: "codeViewer.pptx.zoomOut" }),
      thumbnails: intl.formatMessage({ id: "codeViewer.pptx.thumbnails" }),
      thumbnail: (page: number) =>
        intl.formatMessage({ id: "codeViewer.pptx.thumbnail" }, { pageNumber: String(page) }),
      exportPdf: intl.formatMessage({ id: "codeViewer.pptx.exportPdf" }),
      exportingPdf: intl.formatMessage({ id: "codeViewer.pptx.exportingPdf" }),
      exportPdfSuccess: (path: string) =>
        intl.formatMessage({ id: "codeViewer.pptx.exportPdfSuccess" }, { path }),
      exportPdfFailed: intl.formatMessage({ id: "codeViewer.pptx.exportPdfFailed" }),
      selectElement: intl.formatMessage({ id: "codeViewer.pptx.selectElement" }),
      exitElementSelection: intl.formatMessage({ id: "codeViewer.pptx.exitElementSelection" }),
      aiEdit: intl.formatMessage({ id: "codeViewer.pptx.aiEdit" }),
      commentPlaceholder: intl.formatMessage({ id: "codeViewer.pptx.commentPlaceholder" }),
      cancelAiEdit: intl.formatMessage({ id: "codeViewer.pptx.cancelAiEdit" }),
      addToConversation: intl.formatMessage({ id: "codeViewer.pptx.addToConversation" }),
      referencedPageMissing: (page: number) =>
        intl.formatMessage({ id: "chat.pptxElements.previewPageMissing" }, { pageNumber: String(page) }),
      referencedSourceChanged: (page: number) =>
        intl.formatMessage({ id: "chat.pptxElements.previewSourceChanged" }, { pageNumber: String(page) }),
    }),
    [intl],
  );

  /* 已安装编辑器列表 */
  React.useEffect(() => {
    let disposed = false;
    platform
      .getInstalledEditors()
      .then((editors) => {
        if (!disposed) setInstalledEditors(editors);
      })
      .catch((editorsError) => {
        logger.warn("[PreviewPane] 获取已安装编辑器列表失败", {
          error: editorsError instanceof Error ? editorsError.message : String(editorsError),
        });
      });
    return () => {
      disposed = true;
    };
  }, [platform]);

  /* source 切换：视图模式复位 */
  React.useEffect(() => {
    if (decoded) {
      setMarkdownViewMode(isMarkdownSource(decoded) || hasMarkdownExtension(decoded.path) ? "preview" : "code");
      setSvgViewMode(isSvgSource(decoded) || hasSvgExtension(decoded.path) ? "preview" : "code");
      setWrapOverride(null);
    }
  }, [decoded]);

  /** 原 Ue：提交行级评论（聊天附件 + store 双写） */
  const submitCodeComment = React.useCallback(
    (args: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => {
      if (!decoded?.path || !effectiveWorkspacePath) return;
      const commentText = args.comment.trim();
      const commentId = uid();
      addCodeCommentAttachmentToChat({
        id: commentId,
        workspacePath: effectiveWorkspacePath,
        workspaceIdentity: decoded.workspaceIdentity,
        sourcePath: decoded.path,
        sourceTitle: decoded.title,
        startLine: args.range.startLine,
        endLine: args.range.endLine,
        selectedText: args.selectedText,
        comment: commentText,
        contextLabel: intl.formatMessage({ id: "codeViewer.comment.contextLabel" }),
        commentLabel: intl.formatMessage({ id: "codeViewer.comment.commentLabel" }),
      });
      if (!hasCodeCommentAttachment({ id: commentId, workspacePath: effectiveWorkspacePath, workspaceIdentity: decoded.workspaceIdentity }))
        addComment({
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: decoded.workspaceIdentity,
          sourcePath: decoded.path,
          comment: {
            id: commentId,
            sourcePath: decoded.path,
            sourceTitle: decoded.title,
            startLine: args.range.startLine,
            endLine: args.range.endLine,
            selectedText: args.selectedText,
            comment: commentText,
          },
        });
    },
    [addComment, decoded, effectiveWorkspacePath, intl],
  );

  /** 原 We */
  const deleteCodeComment = React.useCallback(
    (commentId: string) => {
      if (!decoded?.path || !effectiveWorkspacePath) return;
      removeComment({
        workspacePath: effectiveWorkspacePath,
        workspaceIdentity: decoded.workspaceIdentity,
        sourcePath: decoded.path,
        id: commentId,
      });
      removeCodeCommentAttachment({ id: commentId, workspacePath: effectiveWorkspacePath, workspaceIdentity: decoded.workspaceIdentity });
    },
    [decoded, effectiveWorkspacePath, removeComment],
  );

  /** 原 Ge：记录滚动位（重内容卸载前） */
  const captureScrollSnapshot = React.useCallback(() => {
    const snapshot = scrollSnapshot(scrollContainerRef.current);
    if (snapshot) scrollSnapshotRef.current = snapshot;
  }, []);

  /* breadcrumb 右滚到底 + 渐隐遮罩状态 */
  React.useLayoutEffect(() => {
    const scroller = breadcrumbRef.current;
    if (!scroller) return;
    const raf = requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [breadcrumb]);

  React.useLayoutEffect(() => {
    const scroller = breadcrumbRef.current;
    const inner = breadcrumbInnerRef.current;
    if (!scroller || !inner) {
      setFadeState("none");
      return;
    }
    const update = () => {
      const overflow = scroller.scrollWidth - scroller.clientWidth;
      if (overflow <= 1) {
        setFadeState("none");
        return;
      }
      const atLeft = scroller.scrollLeft > 1;
      const atRight = scroller.scrollLeft < overflow - 1;
      setFadeState(atLeft && atRight ? "both" : atLeft ? "left" : atRight ? "right" : "none");
    };
    let raf: number | null = null;
    let currentUpdate = update;
    const schedule = () => {
      if (raf === null)
        raf = requestAnimationFrame(() => {
          raf = null;
          currentUpdate();
        });
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    if (typeof ResizeObserver > "u") {
      window.addEventListener("resize", schedule);
      return () => {
        scroller.removeEventListener("scroll", update);
        window.removeEventListener("resize", schedule);
        if (raf !== null) cancelAnimationFrame(raf);
      };
    }
    const observer = new ResizeObserver(() => {
      currentUpdate = update;
      schedule();
    });
    observer.observe(scroller);
    observer.observe(inner);
    window.addEventListener("resize", schedule);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [breadcrumb]);

  /* 文本文件首读（256KB 上限） */
  React.useEffect(() => {
    let disposed = false;
    scrollSnapshotRef.current = { scrollHeight: 0, scrollTop: 0 };
    setFilePreview(null);
    setFileTooLarge(false);
    setPdfViewerSource(null);
    setLoadingInitial(!!plainFileSource);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    if (plainFileSource)
      fileService
        .readTextFile({ path: plainFileSource.path ?? "", offset: 0, length: TEXT_PREVIEW_MAX_BYTES })
        .then((result) => {
          if (disposed) return;
          const state = resolveFilePreviewState(result);
          setFilePreview(state.filePreview);
          setFileTooLarge(state.fileTooLarge);
        })
        .catch((readError) => {
          if (disposed) return;
          logger.error(`[PreviewPane] 读取文件失败 path=${plainFileSource.path}:`, readError);
          setError(
            isEnoentError(readError)
              ? intl.formatMessage({ id: "codeViewer.fileMissing" })
              : readError instanceof Error
                ? readError.message
                : String(readError),
          );
        })
        .finally(() => {
          if (!disposed) setLoadingInitial(false);
        });
    return () => {
      disposed = true;
    };
  }, [fileService, plainFileSource, intl]);

  /* 图片预览 */
  React.useEffect(() => {
    let disposed = false;
    if (!imageSource) {
      setImagePreview(null);
      setLoadingImagePreview(false);
      return () => {
        disposed = true;
      };
    }
    setLoadingImagePreview(true);
    setImagePreview(null);
    setError(null);
    fileService
      .readMediaPreview({ path: imageSource.path })
      .then((result) => {
        if (!disposed) setImagePreview(result);
      })
      .catch((readError) => {
        if (disposed) return;
        logger.error(`[PreviewPane] 读取图片预览失败 path=${imageSource.path}:`, readError);
        setError(
          isEnoentError(readError)
            ? intl.formatMessage({ id: "codeViewer.fileMissing" })
            : readError instanceof Error
              ? readError.message
              : String(readError),
        );
      })
      .finally(() => {
        if (!disposed) setLoadingImagePreview(false);
      });
    return () => {
      disposed = true;
    };
  }, [fileService, imageSource, intl]);

  /* PDF 预览（≤2MB 全读，否则 range 流） */
  React.useEffect(() => {
    let disposed = false;
    if (!pdfSource) {
      setPdfViewerSource(null);
      setLoadingPdfPreview(false);
      return () => {
        disposed = true;
      };
    }
    setLoadingPdfPreview(true);
    setPdfViewerSource(null);
    setError(null);
    const path = pdfSource.path;
    const readAll = async (size: number) => {
      const chunks: Uint8Array[] = [];
      let offset = 0;
      while (offset < size) {
        const chunk = await fileService.readFileRange({ path, offset, length: TEXT_PREVIEW_MAX_BYTES });
        if (disposed) return null;
        if (chunk.length === 0) break;
        chunks.push(chunk);
        offset += chunk.length;
      }
      const merged = new Uint8Array(offset);
      let cursor = 0;
      for (const chunk of chunks) {
        merged.set(chunk, cursor);
        cursor += chunk.length;
      }
      return merged;
    };
    (async () => {
      const stat = await fileService.stat({ path });
      if (disposed) return;
      if (typeof stat.size !== "number") {
        const media = await fileService.readMediaPreview({ path });
        if (disposed) return;
        setPdfViewerSource(`[PDF attachment removed — 0 KB]${media.dataBase64}`);
        return;
      }
      if (stat.size <= PDF_INLINE_MAX_BYTES) {
        const buffer = await readAll(stat.size);
        if (!disposed && buffer) setPdfViewerSource(buffer);
        return;
      }
      const totalBytes = stat.size;
      setPdfViewerSource({
        totalBytes,
        requestRange: (offset, length) => fileService.readFileRange({ path, offset, length }),
      });
    })()
      .catch((readError) => {
        if (disposed) return;
        logger.error(`[PreviewPane] 读取 PDF 预览失败 path=${path}:`, readError);
        setError(
          isEnoentError(readError)
            ? intl.formatMessage({ id: "codeViewer.fileMissing" })
            : readError instanceof Error
              ? readError.message
              : String(readError),
        );
      })
      .finally(() => {
        if (!disposed) setLoadingPdfPreview(false);
      });
    return () => {
      disposed = true;
    };
  }, [fileService, pdfSource, intl]);

  /* Office 预览 */
  React.useEffect(() => {
    let disposed = false;
    if (!officeKind || decoded?.type !== "file") {
      setOfficePreview(null);
      setLoadingOfficePreview(false);
      return () => {
        disposed = true;
      };
    }
    setLoadingOfficePreview(true);
    setOfficePreview(null);
    setError(null);
    fileService
      .readBinaryPreview({ path: decoded.path ?? "" })
      .then((result) => {
        if (!disposed) setOfficePreview(result);
      })
      .catch((readError) => {
        if (disposed) return;
        logger.error("[PreviewPane] 读取 Office 文件预览失败", {
          path: decoded.path,
          error: readError instanceof Error ? readError.message : String(readError),
        });
        setError(
          isEnoentError(readError)
            ? intl.formatMessage({ id: "codeViewer.fileMissing" })
            : isLegacyFileTooLargeError(readError)
              ? intl.formatMessage({ id: "codeViewer.officeTooLarge" })
              : readError instanceof Error
                ? readError.message
                : String(readError),
        );
      })
      .finally(() => {
        if (!disposed) setLoadingOfficePreview(false);
      });
    return () => {
      disposed = true;
    };
  }, [fileService, intl, officeKind, decoded]);

  /* PPTX 引用导航：源文件存在性确认 */
  React.useEffect(() => {
    const navigation = pptxReferenceNavigation;
    if (!navigation || !pptxPath) {
      setPptxReferenceReadyId(null);
      return;
    }
    let disposed = false;
    setPptxReferenceReadyId(null);
    fileService
      .stat({ path: pptxPath })
      .then(() => {
        if (!disposed) setPptxReferenceReadyId(navigation.requestId);
      })
      .catch((statError) => {
        if (!disposed && isPptxReferenceMissing(pptxSource, statError))
          toast(intl.formatMessage({ id: "chat.pptxElements.previewFileMissing" }));
      });
    return () => {
      disposed = true;
    };
  }, [fileService, intl, pptxReferenceNavigation, pptxSource, pptxPath]);

  /* PPTX 预览（64MB 上限 + 分块读 + 尺寸复核） */
  React.useEffect(() => {
    let disposed = false;
    if (!pptxPath) {
      setPptxPreviewData(null);
      setLoadingPptxPreview(false);
      return () => {
        disposed = true;
      };
    }
    setLoadingPptxPreview(true);
    setPptxPreviewData(null);
    setError(null);
    const path = pptxPath;
    (async () => {
      const stat = await fileService.stat({ path });
      if (disposed) return;
      if (typeof stat.size !== "number") {
        const media = await fileService.readMediaPreview({ path });
        if (!disposed) setPptxPreviewData(base64ToArrayBuffer(media.dataBase64));
        return;
      }
      if (isPptxTooLarge(stat.size)) {
        setError(intl.formatMessage({ id: "codeViewer.pptx.fileTooLarge" }));
        return;
      }
      const buffer = await readWholeFileInChunks({
        fileSize: stat.size,
        readRange: (offset, length) => fileService.readFileRange({ path, offset, length }),
        isDisposed: () => disposed,
      });
      if (disposed || !buffer) return;
      const reStat = await fileService.stat({ path });
      if (disposed) return;
      assertPptxReadComplete({ expectedBytes: stat.size, actualBytes: buffer.byteLength, observedFileSize: reStat.size });
      setPptxPreviewData(buffer);
    })()
      .catch((readError) => {
        if (disposed) return;
        if (isPptxIncompleteFileError(readError))
          logger.warn("[PreviewPane] PPTX 文件读取不完整，已阻止解析残缺数据", {
            path,
            expectedBytes: (readError as PptxPreviewIncompleteFileError).expectedBytes,
            actualBytes: (readError as PptxPreviewIncompleteFileError).actualBytes,
            observedFileSize: (readError as PptxPreviewIncompleteFileError).observedFileSize,
          });
        else logger.error(`[PreviewPane] 读取 PPTX 预览失败 path=${path}:`, readError);
        setError(
          resolvePreviewErrorMessage(readError, {
            sourcePath: path,
            fileMissingMessage: intl.formatMessage({ id: "codeViewer.fileMissing" }),
            legacyFileTooLargeMessage: intl.formatMessage({ id: "codeViewer.pptx.legacyFileTooLarge" }),
            incompleteFileMessage: intl.formatMessage({ id: "codeViewer.pptx.incomplete" }),
          }),
        );
      })
      .finally(() => {
        if (!disposed) setLoadingPptxPreview(false);
      });
    return () => {
      disposed = true;
    };
  }, [fileService, intl, pptxPath]);

  const handleContentScroll = React.useCallback(() => {
    captureScrollSnapshot();
  }, [captureScrollSnapshot]);

  /* 重内容恢复渲染时保留滚动位 */
  React.useLayoutEffect(() => {
    if (renderHeavyContent && wasHeavyRenderedRef.current) captureScrollSnapshot();
  }, [filePreview, captureScrollSnapshot, renderHeavyContent, decoded]);
  React.useLayoutEffect(() => {
    const was = wasHeavyRenderedRef.current;
    wasHeavyRenderedRef.current = renderHeavyContent;
    if (!renderHeavyContent || was) return;
    const container = scrollContainerRef.current;
    const previousTop = scrollSnapshotRef.current.scrollTop;
    if (!container || previousTop <= 0) return;
    const raf = requestAnimationFrame(() => {
      container.scrollTop = Math.min(previousTop, Math.max(0, container.scrollHeight - container.clientHeight));
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [renderHeavyContent, decoded]);

  if (!decoded) return null;

  const openInEditor = async () => {
    if (!decoded.path || !selectedEditor) return;
    try {
      const result = await platform.openInEditor(selectedEditor.id, decoded.path, {
        pathKind: "file",
        remoteTarget,
        workspaceIdentity: decoded.workspaceIdentity,
      });
      if (result.success) return;
      logger.warn("[PreviewPane] 用编辑器打开文件失败", {
        editorId: selectedEditor.id,
        path: decoded.path,
        error: result.error ?? "unknown-error",
      });
    } catch (openError) {
      logger.warn("[PreviewPane] 打开文件失败", {
        path: decoded.path,
        error: openError instanceof Error ? openError.message : String(openError),
      });
    }
  };
  const openSourcePreview = () => {
    if (diffSource) onOpenCodeViewer?.(diffSource);
  };
  const placeholderStyle =
    !renderHeavyContent && scrollSnapshotRef.current.scrollHeight > 0
      ? { height: `${scrollSnapshotRef.current.scrollHeight}px` }
      : void 0;

  return (
    <aside data-testid="preview-pane" className="flex h-full flex-col overflow-hidden bg-background">
      <div className={cn(`flex h-10 items-center gap-8 bg-surface/30`, hasHeavy && `border-b border-border`)}>
        <div ref={breadcrumbRef} className={cn(`min-w-0 flex-1 overflow-x-auto !scrollbar-hide`, SCROLL_FADE_MASKS[fadeState])}>
          <div ref={breadcrumbInnerRef} className="flex min-w-max items-center px-3 gap-0.5 text-ui-base text-foreground-subtle">
            {breadcrumb?.rootLabel ? (
              <span className="shrink-0 text-foreground-subtle">{breadcrumb.rootLabel}</span>
            ) : null}
            {breadcrumb?.rootLabel ? <IconChevronRight className="size-3.5 shrink-0 text-foreground-subtlest" /> : null}
            {breadcrumb?.parentSegments.map((segment, index) => (
              <React.Fragment key={`${segment}-${index}`}>
                <span className="shrink-0">{segment}</span>
                <IconChevronRight className="size-3.5 shrink-0 text-foreground-subtlest" />
              </React.Fragment>
            ))}
            <span className="inline-flex min-w-0 items-center gap-1 text-foreground">
              {breadcrumb?.fileIconSrc ? <FileIconImg src={breadcrumb.fileIconSrc} size={14} className="shrink-0" /> : null}
              <span className="truncate">{breadcrumb?.fileLabel ?? decoded.title}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 pr-1.5 items-center gap-2">
          {canOpenSourcePreview ? (
            <Button
              type="button"
              size="default"
              variant="ghost"
              className="shrink-0 rounded-lg text-foreground-subtle hover:text-foreground"
              data-diff-source-preview-trigger
              onClick={openSourcePreview}
              title={intl.formatMessage({ id: "codeViewer.openSourcePreview" })}
              aria-label={intl.formatMessage({ id: "codeViewer.openSourcePreview" })}
            >
              <IconFileCode className="size-3.5" />
              <span>{intl.formatMessage({ id: "codeViewer.openSourcePreview" })}</span>
            </Button>
          ) : null}
          {hasMoreMenu || decoded.path ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon-md"
                  variant="ghost"
                  className="shrink-0 text-foreground-subtle hover:text-foreground"
                  aria-label={intl.formatMessage({ id: "common.more" })}
                  title={intl.formatMessage({ id: "common.more" })}
                >
                  <IconEllipsis className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canToggleMarkdownView ? (
                  <>
                    <DropdownMenuLabel>{intl.formatMessage({ id: "codeViewer.markdownMode" })}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={markdownViewMode} onValueChange={(value) => setMarkdownViewMode(value as "preview" | "code")}>
                      <DropdownMenuRadioItem value="preview">
                        <IconEye className="size-4" />
                        {intl.formatMessage({ id: "codeViewer.markdownPreview" })}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="code">
                        <IconFileCode className="size-4" />
                        {intl.formatMessage({ id: "codeViewer.markdownSource" })}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                ) : null}
                {canToggleSvgView ? (
                  <>
                    {canToggleMarkdownView ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuLabel>{intl.formatMessage({ id: "codeViewer.svgMode" })}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={svgViewMode} onValueChange={(value) => setSvgViewMode(value as "preview" | "code")}>
                      <DropdownMenuRadioItem value="preview">
                        <IconEye className="size-4" />
                        {intl.formatMessage({ id: "codeViewer.svgPreview" })}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="code">
                        <IconFileCode className="size-4" />
                        {intl.formatMessage({ id: "codeViewer.svgSource" })}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                ) : null}
                {canToggleCodeWrap ? (
                  <>
                    {canToggleMarkdownView || canToggleSvgView ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuCheckboxItem
                      checked={wrapLongLines}
                      onCheckedChange={(checked) => {
                        setWrapOverride(!!checked);
                      }}
                    >
                      <IconFileCode className="size-4" />
                      {intl.formatMessage({ id: "codeViewer.wrapLines" })}
                    </DropdownMenuCheckboxItem>
                  </>
                ) : null}
                {decoded.path ? (
                  <>
                    {hasMoreMenu ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuItem onSelect={() => void fileActions.copyAbsolutePath({ path: decoded.path ?? "" })}>
                      <IconCopy className="size-4" />
                      {intl.formatMessage({ id: "fileActions.copyAbsolutePath" })}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        void fileActions.copyRelativePath({
                          path: decoded.path ?? "",
                          relativePath: effectiveWorkspacePath ? relativePath(effectiveWorkspacePath, decoded.path ?? "") : decoded.path ?? "",
                        })
                      }
                    >
                      <IconCopy className="size-4" />
                      {intl.formatMessage({ id: "fileActions.copyRelativePath" })}
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Button
            type="button"
            size="icon-md"
            variant="ghost"
            className="shrink-0 text-foreground-subtle hover:text-foreground disabled:text-foreground-subtlest"
            onClick={() => {
              openInEditor();
            }}
            disabled={!canOpenInEditor}
            title={
              selectedEditor
                ? intl.formatMessage({ id: "appHeader.openInEditor" }, { editor: selectedEditor.name })
                : intl.formatMessage({ id: "chat.changeSummary.openInEditor" })
            }
            aria-label={
              selectedEditor
                ? intl.formatMessage({ id: "appHeader.openInEditor" }, { editor: selectedEditor.name })
                : intl.formatMessage({ id: "chat.changeSummary.openInEditor" })
            }
          >
            <IconOpenExternal className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {renderHeavyContent ? (
          <CodeViewerContentDispatcher
            source={pptxSource ?? imageSource ?? pdfSource ?? decoded}
            filePreview={filePreview}
            fileTooLarge={fileTooLarge}
            loadingInitial={loadingInitial}
            loadingImagePreview={loadingImagePreview}
            imagePreview={imagePreview}
            loadingPdfPreview={loadingPdfPreview}
            pdfViewerSource={pdfViewerSource}
            pdfViewerLabels={pdfViewerLabels}
            loadingOfficePreview={loadingOfficePreview}
            officePreview={officePreview}
            officePreviewKind={officeKind}
            loadingPptxPreview={loadingPptxPreview}
            pptxPreviewData={pptxPreviewData}
            pptxViewerLabels={pptxViewerLabels}
            pptxReferenceSource={
              pptxSource && effectiveWorkspacePath
                ? {
                    workspacePath: effectiveWorkspacePath,
                    ...(pptxSource.workspaceIdentity ? { workspaceIdentity: pptxSource.workspaceIdentity } : {}),
                    ...(pptxSource.workspaceRemoteSessionId
                      ? { remoteSessionId: pptxSource.workspaceRemoteSessionId }
                      : {}),
                    sourcePath: pptxSource.path,
                    sourceTitle: pptxSource.title,
                  }
                : null
            }
            pptxReferenceNavigation={pptxReferenceNavigation}
            pptxReferenceNavigationReady={pptxReferenceNavigation !== null && pptxReferenceReadyId === pptxReferenceNavigation.requestId}
            error={error}
            codePreviewSettings={codePreviewSettings}
            codeTheme={codeTheme}
            resolvedTheme={resolvedTheme}
            theme={theme}
            workspacePath={effectiveWorkspacePath ?? null}
            onOpenBrowserUrl={onOpenBrowserUrl}
            markdownViewMode={markdownViewMode}
            svgViewMode={svgViewMode}
            wrapLongLines={wrapLongLines}
            codeComments={codeComments}
            enableCodeLineSelection={canSelectLines}
            enableCodeGutterUtility={canSelectLines}
            codeCommentLabels={commentLabels}
            onSubmitCodeComment={submitCodeComment}
            onDeleteCodeComment={deleteCodeComment}
            onScroll={handleContentScroll}
            scrollContainerRef={scrollContainerRef}
          />
        ) : (
          <HeavyContentDeferredPlaceholder style={placeholderStyle} />
        )}
      </div>
    </aside>
  );
}
