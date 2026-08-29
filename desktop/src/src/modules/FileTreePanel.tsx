/* eslint-disable */
/**
 * ============================================================================
 * FileTreePanel.tsx — F04 工作区文件树（$It 全族）+ 文件树模型层 + 任务缓存助手
 * （B5-06 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机实测 213,979 行，未改动，只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：B5-FULL-DECODE-PLAN 批次表 #6 B 段；SidePanel.report §1.6（$It 146089–147766）；
 *       COVERAGE-LEDGER §a F04 行。
 *
 * 行号口径：本文件行号一律为**本机实测行**（js 行 / jsx 行）。旧登记（SidePanel.report、
 * MODULE-MAP 等）使用的 213,695 行版口径与本文件存在 **+46 行偏移**（$It 旧登记
 * 146089 → 实测 146135；lLt 旧登记 146823 → 实测 146869）。换算在报告 §1 逐锚点列出。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：实测 js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [Model] 文件树模型层（实测 50907–51197；数值落在 A 段行范围，语义归 F04，
 *          PreviewCards.tsx 尾注已移交本文件；旧登记 50859–51149）：
 *   AA   → GIT_STATUS_PRIORITY           (50907 / 45684)
 *   jA   → GIT_STATUS_BADGE_PRIORITY     (50907 / 45684，同 var)
 *   MA   → normalizePathSeparators       (50909 / 45700)
 *   NA   → normalizePathKey              (50912 / 45703)
 *   NVe  → gitStatusKeyOf                (50915 / 45706)
 *   PVe  → buildStatusByPath             (50918 / 45709)
 *   FVe  → isGitStatusAvailable          (50928 / 45719)
 *   PA   → statusForPath                 (50931 / 45722)
 *   IVe  → normalizePathSet              (50934 / 45725)
 *   FA   → hasNormalizedPath             (50937 / 45728)
 *   IA   → isDeletedFileRow              (50940 / 45731)
 *   LA   → isRealDirectory               (50943 / 45734)
 *   RA   → descendantStatuses            (50946 / 45737)
 *   LVe  → mergeDeletedFileRows          (50952 / 45743)
 *   zA   → relativePathFromWorkspace     (50967 / 45761)★MarkdownIntegration 已实现，此处声明
 *   BA   → samePath                      (50974 / 45768)
 *   VA   → isPathWithinRoot              (50977 / 45771)
 *   RVe  → ancestorDirectoryPaths        (50982 / 45776)
 *   HA   → relativeDepthFromRoot         (50997 / 45791)
 *   UA   → parentDirectoryPathInRoot     (51004 / 45798)
 *   zVe  → normalizeSearchQuery          (51014 / 45808)
 *   BVe  → rowHasGitChange               (51017 / 45811)
 *   VVe  → filterTreeRows                (51021 / 45815)
 *   HVe  → flattenTreeRows               (51035 / 45825)
 *   UVe  → buildFilePreviewNode          (51077 / 45874)
 *   WA   → FILE_MANAGER_EDITOR_ORDER     (51084 / 45888)
 *   GA   → orderEditorsForFileManager    (51085 / 45889)
 *   WVe  → SSH_EDITOR_IDS                (51092 / 45896)
 *   GVe  → WSL_EDITOR_IDS                (51092 / 45896，同 var)
 *   KA   → wslFallbackEditor             (51094 / 45898)
 *   qA   → editorsByIds                  (51097 / 45901)
 *   JA   → resolveAvailableEditors       (51100 / 45904)
 *   KVe  → isExplicitSelection           (51109 / 45923)
 *   YA   → toError                       (51112 / 45926)
 *   XA   → toggledPathSet                (51115 / 45929)
 *   qVe  → isMacPlatform                 (51119 / 45933)
 *   JVe  → isWindowsPlatform             (51122 / 45936)
 *   YVe  → revealInFileManagerLabel      (51125 / 45939)
 *   ZA   → isHtmlPreviewRow              (51132 / 45948)
 *   XVe  → browserUrlForRow              (51135 / 45951)
 *   ZVe  → revealPathForEntry            (51138 / 45954)
 *   QA   → useFileContextActions         (51141 / 45957)
 *   QVe  → resolveRemoteWorkspaceInfo    (51198 / 46011)★MarkdownIntegration 已实现，此处声明
 *   $A   → useRemoteWorkspaceInfo        (51214 / 46033)★MarkdownIntegration 已实现，此处声明
 *  [Tree] $It 文件树全族（实测 145213–146777；旧登记 145167–146731）：
 *   f8   → FILE_TREE_ROW_HEIGHT          (145213 / 121020)
 *   jIt  → REFRESH_DIRECTORY_TIMEOUT_MS  (145214 / 121020，同 var)
 *   MIt  → REFRESH_GIT_TIMEOUT_MS        (145215 / 121020，同 var)
 *   NIt  → useInstalledEditors           (145216 / 121023)
 *   PIt  → loadGitStatusSnapshot         (145241 / 121041)
 *   FIt  → useDirectoryFileWatcher       (145249 / 121051)
 *   IIt  → collectRefreshTargetPaths     (145312 / 121120)
 *   LIt  → useFlattenedTreeRows          (145323 / 121135)
 *   RIt  → timeoutError                  (145346 / 121158)
 *   zIt  → withTimeout                   (145349 / 121161)
 *   BIt  → useWorkspaceFileTreeData      (145364 / 121173)
 *   VIt  → computeStickyFolderRows       (145687 / 121465)
 *   HIt  → useStickyFolderScroll         (145717 / 121494)
 *   p8   → FileTreeEmptyState            (145763 / 121534)
 *   UIt  → gitStatusBadgeLetter          (145778 / 121541)
 *   WIt  → gitStatusTextColor            (145794 / 121557)
 *   GIt  → primaryGitStatus              (145812 / 121575)
 *   KIt  → gitStatusBadgeColor           (145815 / 121581)
 *   qIt  → gitStatusDotColor             (145831 / 121597)
 *   JIt  → HIERARCHY_GUIDE_BACKGROUND    (145849 / 121615)
 *   YIt  → hierarchyGuideStyle           (145850 / 121616)
 *   XIt  → useFileTreeDragState          (145853 / 121622)
 *   ZIt  → CompactPathName               (145873 / 121635)
 *   QIt  → FileTreeRow                   (145893 / 121643)
 *   $It  → FileTreeVirtualList           (146135 / 121795)
 *   eLt  → StickyFolderList              (146208 / 121847)
 *   tLt  → depthOfPath                   (146283 / 121888)
 *   nLt  → FileTreePanel                 (146286 / 121891)
 *   rLt  → rootErrorIfNotLoaded          (146775 / 122250)
 *  [TaskCache] 任务缓存助手（实测 146778–146848；物理位于 B 段行范围，语义属 F01
 *          任务列表域，双归属注记见报告 §3.2）：
 *   iLt  → DEFAULT_TASK_MEMBERSHIP       (146778 / 122256)
 *   aLt  → sortTasksByRecency            (146779 / 122260)
 *   oLt  → upsertTaskInWorkspaceCache    (146788 / 122263)
 *   sLt  → cleanupDeletedTaskState       (146825 / 122284)
 *   cLt  → registerWorkspaceTask         (146839 / 122289)
 *
 * ----------------------------------------------------------------------------
 * 二、边界与双归属注记
 * ----------------------------------------------------------------------------
 *  1. 任务口径 B 段行范围（旧登记 146089–147766）实测换算为 146135–147812。
 *     本文件按 $It 全族展开，实际覆盖：模型层 50907–51197（语义归 F04，行号在 A 段
 *     内，内部裁决）+ 树族 145213–146777 + 任务缓存助手 146778–146848。
 *  2. 实测 146135–147812 区段内其余符号处置（不重复抽取）：
 *     - m8/h8（146849/146859）= RemoteSyncingRow/TaskListLoadingRow → 已由
 *       Sidebar.tsx §8/§h8 完整重建；
 *     - lLt（146869）= ArchivedTasksSection、uLt（147124）及后续 dLt/pLt/mLt 任务
 *       段族 → F01 任务列表域，Sidebar.tsx/SidebarLeaves.tsx 已接口级挂接；
 *     - hLt/gLt/_Lt（头像原语）与 vLt 起 Bots 常量族（147700+）→ X03/B5-04，排除只注记。
 *  3. 模型层 zA/QVe/$A 已由 MarkdownIntegration.tsx 逐字实现（relativePathFromWorkspace
 *     js 50919=实测 50967；resolveRemoteWorkspaceInfo/useRemoteWorkspaceInfo），本文件
 *     以 declare 挂接，不重复转录；JA/QA 在 MarkdownIntegration 仅接口级 declare，
 *     本文件为实现方。
 *  4. 任务缓存助手依赖的跨块任务态符号（xe/ce/pe 等）按接口级声明；sLt 与
 *     SidebarLeaves.tsx、cLt 与 SettingsPanelsCapability.tsx 的接口级声明构成双归属，
 *     本文件为实现方（消费面优先裁决见报告 §3.2）。
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 已在它文件还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime；2. cn (Z)；3. useIntlContext (G)；4. logger (J)；
 *  5. toast (m，imeComposition)；6. usePlatform (l：getInstalledEditors/openInEditor/
 *     openInFileManager)；7. useWorkspaceScopedServices (Oc：fileService/
 *     fileWatcherService/gitService)；8. getFileMeta (zc：fileIconSrc)；
 *  9. useVirtualizer (to，@tanstack/react-virtual 封装)；
 *  10. 路径助手（横切 1925–1975，未归本批）：baseName (Go)、parentDirectoryPath (sae)、
 *      pathToFileUrl (Yo)；
 *  11. MarkdownIntegration.tsx 已重建件：relativePathFromWorkspace (zA)、
 *      useRemoteWorkspaceInfo ($A)；
 *  12. 拖拽助手（Composer 域 52124–52274 实测 52172–52322）：FILE_TREE_DRAG_MIME (kj)、
 *      serializeFileTreeDragPayload ($He)、buildFileTreeDragText (wj)、
 *      setGlobalFileTreeDragging (Pj)、addFileTreeEntryToChat (rUe)；
 *  13. testid（src-HCld2afU.js 反查值）：workspace-file-tree-row (eee/Gv)、
 *      workspace-file-tree-panel (_re/Uv)、workspace-file-tree-refresh-button (st/Wv)、
 *      scopedTestId (qr/Nb：(base,id)=>`${base}-${id}`)；
 *  14. UI 原语：Button (X)、Input (P)、Tooltip (Ia)、DropdownMenu 族 (VO/HO/UO/WO，
 *      X03 双归属接口挂接)、ContextMenu 族 (yk/bk/xk/Sk/Ck/wk/Tk/Ek)；
 *  15. 图标：F_ error / M spinner / jye empty-folder / Iye filter-changes / Nv refresh /
 *      Q_ folder-open / K_ more / W_ copy / g close / S_ back / s3 repo-wiki /
 *      wa chevron-right / Fv search / Vc file-icon-img；
 *  16. 任务态（F01 域，接口级）：taskListStore (xe)、taskStateOf (ce)、
 *      mergeTaskWithState (pe)、taskMetaStore (Vo)、taskEntityKey (Lo)、
 *      notifyTaskMetaUpsert ($ie)、notifyTaskMetaPreservingMembership (eae)、
 *      applyTaskQueryCacheMutation (Uo)、removeTaskAndNotify (rae)、workspaceKey (Io)。
 * ============================================================================
 */

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ContextMenu, ContextMenuContent, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '../components/ui/context-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { CircleAlert as IconError, LoaderCircle as IconSpinner, RefreshCw as IconRefresh, FolderOpen as IconFolderOpen, Ellipsis as IconMore, Copy as IconCopy, X as IconClose, ArrowLeft as IconBack, Search as IconSearch } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { Button, ChevronRight as IconChevronRight } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { Input, toast, usePlatform } from './ImeComposition';
import { baseName, relativePathFromWorkspace, useRemoteWorkspaceInfo } from './MarkdownIntegration';
import { imageMimeTypeOfPath } from './PreviewCards';
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js 导出 t）
import { taskEntityKey } from './StoresDeep';
import { cn } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip；aria-pressed 见 B-28）
import { FileIconImg as FileIconImage, resolveFileDisplayInfo as getFileMeta } from './ModalsLeaves'; // 原 Vc / zc

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
/** 原 G：react-intl 风格 intl 上下文 */
declare function useIntlContext(): { intl: IntlShape };

/** 原 J：logger */

/** 原 m：toast（imeComposition chunk） */

/* 原 l：usePlatform */
export interface InstalledEditor {
  id: string;
  name: string;
  /** 平台实返字段（图标 data URL；可能缺省）。 */
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
  openInFileManager(path: string): Promise<PlatformOpenResult>;
}

/* 原 Oc：useWorkspaceScopedServices */
interface FileEntry {
  path: string;
  name: string;
  type: string;
  isSymbolicLink?: boolean;
}
interface FileService {
  readdir(args: { path: string; includeHidden?: boolean }): Promise<FileEntry[]>;
}
interface GitChange {
  path: string;
  kind: string;
  isUntracked?: boolean;
  section?: string;
  [key: string]: unknown;
}
interface GitSummary {
  isGitAvailable: boolean;
  isRepository: boolean;
}
interface GitService {
  refresh(args: { workspacePath: string }): Promise<{
    summary: GitSummary;
    unstagedChanges: GitChange[];
    stagedChanges: GitChange[];
  }>;
  getIgnoredPaths(args: { workspacePath: string; paths: string[] }): Promise<string[]>;
}
interface FileWatcherSubscription {
  dispose(): void;
}
interface FileWatcherService {
  watch(args: { path: string }): Promise<{ id: string }>;
  unwatch(args: { id: string }): Promise<void>;
  onDynamicChange(id: string): (callback: (event: { dirPath: string }) => void) => FileWatcherSubscription;
}
declare function useWorkspaceScopedServices(
  workspacePath: string,
  workspaceRemoteSessionId: string | null | undefined,
  workspaceIdentity: string | null | undefined,
): { fileService: FileService; fileWatcherService: FileWatcherService; gitService: GitService };

/* 原 to：useVirtualizer（@tanstack/react-virtual 封装） */
interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}
/* ── tombstone（A0-S3a）：本地 Virtualizer 接口 + vendored useVirtualizer declare 删除，
 *    改 npm @tanstack/react-virtual@3.14.10 真实 import（文件头）；真实 Virtualizer 为
 *    原接口面的超集（getVirtualItems/getTotalSize/scrollToIndex/scrollToOffset/scrollOffset/
 *    scrollDirection 均吻合）。VirtualItem 接口保留（行 1319/1358/1844 组件 prop 仍消费）。 ── */

/* 路径助手（横切 1925–1975，未归本批，接口挂接） */
declare function parentDirectoryPath(path: string): string | null; // 原 sae（1932）
declare function pathToFileUrl(path: string): string; // 原 Yo（1958）

/* PreviewCards.tsx 已重建件（接口挂接） */

/* MarkdownIntegration.tsx 已重建件（接口挂接） */

/* 拖拽助手（Composer 域，接口挂接） */
declare const FILE_TREE_DRAG_MIME: string; // 原 kj
declare function serializeFileTreeDragPayload(payload: unknown): string; // 原 $He
declare function buildFileTreeDragText(relativePath: string, name: string, type: string): string; // 原 wj
declare function setGlobalFileTreeDragging(dragging: boolean): void; // 原 Pj
declare function addFileTreeEntryToChat(entry: FileTreeChatEntry): void; // 原 rUe

/* testid（src-HCld2afU.js 反查值；原 eee/Gv、_re/Uv、st/Wv、qr/Nb） */
const TESTID_FILE_TREE_ROW_BASE = `workspace-file-tree-row`;
const TESTID_FILE_TREE_PANEL = `workspace-file-tree-panel`;
const TESTID_FILE_TREE_REFRESH_BUTTON = `workspace-file-tree-refresh-button`;
const scopedTestId = (base: string, id: string): string => `${base}-${id}`;

/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'；
   Tooltip（原 Ia）declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'（aria-pressed 经 B-28 加入 InfoTooltipProps）。 ── */

/** 原 P：Input */

/* 原 VO/HO/UO/WO：DropdownMenu 原语族（X03 双归属，接口挂接） */
/* ── tombstone（A0-S3c）：ContextMenu、ContextMenuContent、ContextMenuSeparator、ContextMenuSub、ContextMenuSubContent、ContextMenuSubTrigger、ContextMenuTrigger、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */




/* 原 yk/bk/xk/Sk/Ck/wk/Tk/Ek：ContextMenu 原语族（接口挂接） */



declare const ContextMenuItem: React.FC<{ disabled?: boolean; onSelect?: () => void; children?: React.ReactNode }>; // Sk





/* 图标族（lucide 封装） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：IconError/IconSpinner → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconEmptyFolder: React.FC<{ className?: string }>; // jye
declare const IconFilterChanges: React.FC<{ className?: string }>; // Iye
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（6）：IconRefresh/IconFolderOpen/IconMore/IconCopy/IconClose/IconBack → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconRepoWiki: React.FC<{ className?: string }>; // s3
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：IconChevronRight/IconSearch → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* ============================================================================
 * 1. 文件树模型层（原 50907–51197）
 * ==========================================================================*/

type GitStatus = `added` | `deleted` | `renamed` | `untracked` | `modified` | `ignored`;
type FileTreeNodeType = `file` | `directory`;

interface FileTreeNode {
  path: string;
  name: string;
  type: FileTreeNodeType;
  depth: number;
  isSymbolicLink?: boolean;
}

interface FlatTreeRow extends FileTreeNode {
  expanded: boolean;
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  compactedPaths?: string[];
}

interface FileTreeChatEntry {
  type: FileTreeNodeType;
  workspacePath: string;
  workspaceIdentity?: string;
  path: string;
  relativePath: string;
  name: string;
}

/** 原 AA：git 状态优先级（合并同路径状态时保留高优先级） */
const GIT_STATUS_PRIORITY: Record<GitStatus, number> = {
  ignored: 0,
  modified: 1,
  renamed: 2,
  deleted: 3,
  added: 4,
  untracked: 5,
};

/** 原 jA：目录徽标聚合排序权重 */
const GIT_STATUS_BADGE_PRIORITY: Record<GitStatus, number> = {
  added: 1,
  deleted: 1,
  renamed: 1,
  untracked: 1,
  modified: 2,
  ignored: 3,
};

/** 原 MA：反斜杠归一为正斜杠、去尾斜杠 */
function normalizePathSeparators(path: string): string {
  return path.replace(/\\/g, `/`).replace(/\/+$/, ``);
}

/** 原 NA：路径归一化键 */
function normalizePathKey(path: string): string {
  return normalizePathSeparators(path);
}

/** 原 NVe：untracked 归并后的状态键 */
function gitStatusKeyOf(change: GitChange): GitStatus {
  return change.isUntracked || change.section === `untracked` ? `untracked` : (change.kind as GitStatus);
}

/** 原 PVe：按路径合并变更状态（同路径保留高优先级） */
function buildStatusByPath(changes: GitChange[]): Map<string, GitStatus> {
  let statusByPath = new Map<string, GitStatus>();
  for (let change of changes) {
    let key = normalizePathKey(change.path),
      status = gitStatusKeyOf(change),
      existing = statusByPath.get(key);
    (existing && GIT_STATUS_PRIORITY[existing] >= GIT_STATUS_PRIORITY[status]) || statusByPath.set(key, status);
  }
  return statusByPath;
}

/** 原 FVe：git 可用且为仓库 */
function isGitStatusAvailable(summary: GitSummary): boolean {
  return summary.isGitAvailable && summary.isRepository;
}

/** 原 PA：查路径状态 */
function statusForPath(statusByPath: Map<string, GitStatus>, path: string): GitStatus | null {
  return statusByPath.get(normalizePathKey(path)) ?? null;
}

/** 原 IVe：路径集合归一化 */
function normalizePathSet(paths: string[]): Set<string> {
  return new Set(paths.map((path) => normalizePathKey(path)));
}

/** 原 FA：集合是否含该路径 */
function hasNormalizedPath(pathSet: Set<string>, path: string): boolean {
  return pathSet.has(normalizePathKey(path));
}

/** 原 IA：文件行且状态为 deleted */
function isDeletedFileRow(row: FileTreeNode, status: GitStatus | null): boolean {
  return row.type !== `directory` && status === `deleted`;
}

/** 原 LA：真实目录（非符号链接） */
function isRealDirectory(node: { type: string; isSymbolicLink?: boolean } | null | undefined): boolean {
  return node?.type === `directory` && node.isSymbolicLink !== true;
}

/** 原 RA：目录下后代状态集合（按徽标权重降序） */
function descendantStatuses(statusByPath: Map<string, GitStatus>, directoryPath: string): GitStatus[] {
  let prefix = `${normalizePathKey(directoryPath)}/`,
    statuses = new Set<GitStatus>();
  for (let [path, status] of statusByPath) normalizePathKey(path).startsWith(prefix) && statuses.add(status);
  return [...statuses].sort((a, b) => GIT_STATUS_BADGE_PRIORITY[b] - GIT_STATUS_BADGE_PRIORITY[a]);
}

/** 原 LVe：把 deleted 文件补回其父目录子列表（视图层保留已删文件） */
function mergeDeletedFileRows(args: {
  rootPath: string;
  childrenByDirectory: Map<string, FileTreeNode[]>;
  statusByPath: Map<string, GitStatus>;
}): Map<string, FileTreeNode[]> {
  let merged: Map<string, FileTreeNode[]> | null = null;
  for (let [path, status] of args.statusByPath) {
    if (status !== `deleted`) continue;
    let parent = parentDirectoryPathInRoot(args.rootPath, path);
    if (!parent) continue;
    let siblings = (merged ?? args.childrenByDirectory).get(parent) ?? null;
    if (!siblings || siblings.some((node) => samePath(node.path, path))) continue;
    let next = [...siblings, { path, name: baseName(path), type: `file` as const, depth: relativeDepthFromRoot(args.rootPath, parent) }].sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === `directory` ? -1 : 1,
    );
    ((merged ??= new Map(args.childrenByDirectory)), merged.set(parent, next));
  }
  return merged ?? args.childrenByDirectory;
}

/** 原 BA：两路径归一化后是否相同 */
function samePath(a: string, b: string): boolean {
  return normalizePathSeparators(a) === normalizePathSeparators(b);
}

/** 原 VA：path 是否在 root 之内（含自身） */
function isPathWithinRoot(rootPath: string, path: string): boolean {
  let root = normalizePathSeparators(rootPath),
    target = normalizePathSeparators(path);
  return target === root || target.startsWith(`${root}/`);
}

/** 原 RVe：root 到 path 的各级祖先目录（不含 root 与 path 自身） */
function ancestorDirectoryPaths(rootPath: string, path: string): string[] {
  let root = normalizePathSeparators(rootPath),
    target = normalizePathSeparators(path),
    prefix = `${root}/`;
  if (!isPathWithinRoot(rootPath, path) || target === root) return [];
  let segments = target.slice(prefix.length).split(`/`).filter(Boolean);
  if (segments.length <= 1) return [];
  let separator = path.includes(`\\`) && !path.includes(`/`) ? `\\` : `/`,
    trimmedRoot = rootPath.replace(/[\\/]+$/, ``),
    ancestors = segments.slice(0, -1),
    result: string[] = [],
    cursor = trimmedRoot;
  for (let segment of ancestors) ((cursor = `${cursor}${separator}${segment}`), result.push(cursor));
  return result;
}

/** 原 HA：path 相对 root 的深度 */
function relativeDepthFromRoot(rootPath: string, path: string): number {
  let root = normalizePathSeparators(rootPath),
    target = normalizePathSeparators(path);
  if (target === root || !isPathWithinRoot(rootPath, path)) return 0;
  let prefix = `${root}/`;
  return target.slice(prefix.length).split(`/`).filter(Boolean).length;
}

/** 原 UA：path 在 root 内的父目录（根直属返回 root 本身） */
function parentDirectoryPathInRoot(rootPath: string, path: string): string | null {
  let root = normalizePathSeparators(rootPath),
    target = normalizePathSeparators(path);
  if (target === root || !isPathWithinRoot(rootPath, path)) return null;
  let prefix = `${root}/`,
    parentSegments = target.slice(prefix.length).split(`/`).filter(Boolean).slice(0, -1);
  if (parentSegments.length === 0) return rootPath.replace(/[\\/]+$/, ``);
  let separator = path.includes(`\\`) && !path.includes(`/`) ? `\\` : `/`;
  return `${rootPath.replace(/[\\/]+$/, ``)}${separator}${parentSegments.join(separator)}`;
}

/** 原 zVe：搜索词归一化 */
function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase();
}

/** 原 BVe：行自身或后代有非 ignored 变更 */
function rowHasGitChange(row: FileTreeNode, statusByPath: Map<string, GitStatus>): boolean {
  let status = statusForPath(statusByPath, row.path);
  return status && status !== `ignored` ? true : row.type === `directory` && descendantStatuses(statusByPath, row.path).length > 0;
}

/** 原 VVe：changedOnly + 搜索过滤（保留命中行的祖先/后代目录链） */
function filterTreeRows(args: {
  rows: FlatTreeRow[];
  searchQuery: string;
  changedOnly: boolean;
  statusByPath: Map<string, GitStatus>;
}): FlatTreeRow[] {
  let baseRows = args.changedOnly ? args.rows.filter((row) => rowHasGitChange(row, args.statusByPath)) : args.rows,
    query = normalizeSearchQuery(args.searchQuery);
  if (!query) return baseRows;
  let matches = baseRows.filter((row) => row.name.toLocaleLowerCase().includes(query));
  if (matches.length === 0) return [];
  let matchedPaths = new Set(matches.map((row) => row.path)),
    matchedDirectories = matches.filter((row) => row.type === `directory`).map((row) => row.path);
  return baseRows.filter((row) =>
    matchedPaths.has(row.path) || (row.type === `directory` && matches.some((match) => isPathWithinRoot(row.path, match.path)))
      ? true
      : matchedDirectories.some((directory) => isPathWithinRoot(directory, row.path)),
  );
}

/** 原 HVe：展平树行（空目录链压缩为单行，含展开/加载/错误态） */
function flattenTreeRows(args: {
  rootPath: string;
  childrenByDirectory: Map<string, FileTreeNode[]>;
  expandedPaths: Set<string>;
  loadedDirectoryPaths: Set<string>;
  loadingDirectoryPaths: Set<string>;
  errorByDirectory: Map<string, Error>;
  flattenEmptyDirectories: boolean;
}): FlatTreeRow[] {
  let rows: FlatTreeRow[] = [];
  function compactChain(node: FileTreeNode): { node: FileTreeNode; compactedPaths?: string[]; childDepthOffset: number } {
    if (!args.flattenEmptyDirectories || !isRealDirectory(node)) return { node, childDepthOffset: 0 };
    let chain = [node],
      cursor = node;
    for (
      ;
      args.loadedDirectoryPaths.has(cursor.path) &&
      !args.loadingDirectoryPaths.has(cursor.path) &&
      !args.errorByDirectory.has(cursor.path);
    ) {
      let children = args.childrenByDirectory.get(cursor.path) ?? [];
      if (children.length !== 1 || !isRealDirectory(children[0])) break;
      ((cursor = children[0]), chain.push(cursor));
    }
    return chain.length === 1
      ? { node, childDepthOffset: 0 }
      : {
          node: { ...cursor, depth: node.depth, name: chain.map((entry) => entry.name).join(`/`) },
          compactedPaths: chain.map((entry) => entry.path),
          childDepthOffset: cursor.depth - node.depth,
        };
  }
  function walk(directoryPath: string, depthOffset = 0) {
    let children = args.childrenByDirectory.get(directoryPath) ?? [];
    for (let child of children) {
      let compacted = compactChain({ ...child, depth: child.depth - depthOffset }),
        expanded = (compacted.compactedPaths ?? [compacted.node.path]).some((path) => args.expandedPaths.has(path));
      (rows.push({
        ...compacted.node,
        expanded,
        loaded: args.loadedDirectoryPaths.has(compacted.node.path),
        loading: args.loadingDirectoryPaths.has(compacted.node.path),
        error: args.errorByDirectory.get(compacted.node.path) ?? null,
        ...(compacted.compactedPaths ? { compactedPaths: compacted.compactedPaths } : {}),
      }),
        compacted.node.type === `directory` && expanded && walk(compacted.node.path, depthOffset + compacted.childDepthOffset));
    }
  }
  return (walk(args.rootPath), rows);
}

/** 原 UVe：文件行 → 预览节点（图片走 image，其余 file） */
function buildFilePreviewNode(path: string): { type: string; title: string; path: string; mediaType?: string } {
  let title = baseName(path),
    mediaType = imageMimeTypeOfPath(path);
  return mediaType && mediaType !== `image/svg+xml`
    ? { type: `image`, title, path, mediaType }
    : { type: `file`, title, path };
}

/** 原 WA：文件管理器优先编辑器顺序 */
const FILE_MANAGER_EDITOR_ORDER = [`finder`, `qspace`, `qspace-pro`, `explorer`];

/** 原 GA：按优先顺序排列已安装编辑器 */
export function orderEditorsForFileManager(editors: InstalledEditor[]): InstalledEditor[] {
  let byId = new Map(editors.map((editor) => [editor.id, editor])),
    preferred = FILE_MANAGER_EDITOR_ORDER.map((id) => byId.get(id) ?? null).filter((editor): editor is InstalledEditor => editor !== null),
    preferredIds = new Set(FILE_MANAGER_EDITOR_ORDER),
    rest = editors.filter((editor) => !preferredIds.has(editor.id));
  return [...preferred, ...rest];
}

/** 原 WVe/GVe：ssh / wsl 远端可用编辑器集 */
const SSH_EDITOR_IDS = [`vscode`, `vscode-insiders`],
  WSL_EDITOR_IDS = [`vscode`, `vscode-insiders`, `explorer`];

/** 原 KA：wsl 场景回退 explorer */
function wslFallbackEditor(editors: InstalledEditor[], remoteTarget: { kind?: string } | null | undefined): InstalledEditor | null {
  return remoteTarget?.kind === `wsl` ? (editors.find((editor) => editor.id === `explorer`) ?? null) : null;
}

/** 原 qA：按 id 列表取交集编辑器 */
function editorsByIds(editors: InstalledEditor[], ids: string[]): InstalledEditor[] {
  return ids.map((id) => editors.find((editor) => editor.id === id) ?? null).filter((editor): editor is InstalledEditor => editor !== null);
}

/** 原 JA：解析可用编辑器（ssh→vscode 系；wsl→vscode 系+explorer；本地→文件管理器顺序） */
export function resolveAvailableEditors({
  installedEditors,
  selectedEditorId,
  remoteTarget,
}: {
  installedEditors: InstalledEditor[];
  selectedEditorId: string | null;
  remoteTarget: { kind?: string } | null;
}): { availableEditors: InstalledEditor[]; selectedEditor: InstalledEditor | null; selectionKind: string } {
  let available: InstalledEditor[];
  available =
    remoteTarget?.kind === `ssh`
      ? editorsByIds(installedEditors, SSH_EDITOR_IDS)
      : remoteTarget?.kind === `wsl`
        ? editorsByIds(installedEditors, WSL_EDITOR_IDS)
        : remoteTarget
          ? []
          : orderEditorsForFileManager(installedEditors);
  let selected = selectedEditorId === null ? null : (available.find((editor) => editor.id === selectedEditorId) ?? null),
    fallback = available[0] ?? null;
  return selected
    ? { availableEditors: available, selectedEditor: selected, selectionKind: `preferred` }
    : { availableEditors: available, selectedEditor: fallback, selectionKind: fallback ? `fallback` : `empty` };
}

/** 原 KVe：是否显式选择 */
function isExplicitSelection(kind: string): boolean {
  return kind === `explicit`;
}

/** 原 YA：未知异常归一为 Error */
function toError(error: unknown): Error {
  return error instanceof Error ? error : Error(String(error));
}

/** 原 XA：集合增删成员（返回新集合） */
function toggledPathSet(set: Set<string>, path: string, add: boolean): Set<string> {
  let next = new Set(set);
  return (add ? next.add(path) : next.delete(path), next);
}

/** 原 qVe：macOS 平台探测 */
function isMacPlatform(): boolean {
  return typeof navigator > `u` ? false : /mac/i.test(navigator.userAgent);
}

/** 原 JVe：Windows 平台探测 */
function isWindowsPlatform(): boolean {
  return typeof navigator > `u` ? false : /windows/i.test(navigator.userAgent);
}

/** 原 YVe：按平台取「在文件管理器中显示」文案 */
function revealInFileManagerLabel(intl: IntlShape): string {
  return isMacPlatform()
    ? intl.formatMessage({ id: `appHeader.openInFinder` })
    : isWindowsPlatform()
      ? intl.formatMessage({ id: `appHeader.openInFileExplorer` })
      : intl.formatMessage({ id: `appHeader.openInFileManager` });
}

/** 原 ZA：文件行且为 .html/.htm */
function isHtmlPreviewRow(row: FileTreeNode): boolean {
  return row.type === `file` ? /\.(?:html|htm)$/i.test(row.path) : false;
}

/** 原 XVe：html 行 → 浏览器 URL */
function browserUrlForRow(row: FileTreeNode): string | null {
  return isHtmlPreviewRow(row) ? pathToFileUrl(row.path) : null;
}

/** 原 ZVe：文件管理器打开路径（目录本身；文件取其父目录） */
function revealPathForEntry(entry: { kind?: string; path: string }): string {
  return entry.kind === `directory` ? entry.path : (parentDirectoryPath(entry.path) ?? entry.path);
}

/** 原 QA：文件上下文动作钩子（显示/复制绝对/相对路径） */
export function useFileContextActions(options: {
  canOpenLocalFileManager?: boolean;
  isRemoteWorkspace?: boolean;
  remoteTarget?: { kind?: string } | null;
  workspaceIdentity?: string | null;
  openFailedMessage?: string;
} = {}) {
  let platform = usePlatform() as unknown as PlatformService,
    { intl } = useIntlContext(),
    canOpenLocalFileManager = !!options.canOpenLocalFileManager,
    isRemoteWorkspace = !!options.isRemoteWorkspace,
    remoteTarget = options.remoteTarget,
    workspaceIdentity = options.workspaceIdentity,
    openFailedMessage = options.openFailedMessage ?? intl.formatMessage({ id: `appHeader.openInFileManagerFailed` }),
    canRevealInFileManager = React.useCallback(
      (entry: { path?: string; deleted?: boolean }) => canOpenLocalFileManager && !entry.deleted && (!isRemoteWorkspace || remoteTarget?.kind === `wsl`),
      [canOpenLocalFileManager, isRemoteWorkspace, remoteTarget?.kind],
    ),
    copyText = React.useCallback(async (text: string) => {
      if (typeof navigator > `u` || !navigator.clipboard?.writeText) {
        logger.warn(`[FileContextActions] 复制文件路径失败`, {
          path: text,
          error: `clipboard-unavailable`,
        });
        return;
      }
      try {
        (await navigator.clipboard.writeText(text),
          logger.info(`[FileContextActions] 文件路径已复制`, { path: text }));
      } catch (error) {
        logger.warn(`[FileContextActions] 复制文件路径失败`, {
          path: text,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, []),
    copyAbsolutePath = React.useCallback((entry: { path: string }) => copyText(entry.path), [copyText]);
  return {
    canRevealInFileManager,
    copyAbsolutePath,
    copyPath: copyAbsolutePath,
    copyRelativePath: React.useCallback((entry: { path: string; relativePath?: string }) => copyText(entry.relativePath ?? entry.path), [copyText]),
    revealInFileManager: React.useCallback(
      async (entry: { path: string; deleted?: boolean; kind?: string }) => {
        if (!canRevealInFileManager(entry)) return;
        let openPath = revealPathForEntry(entry),
          result =
            remoteTarget?.kind === `wsl`
              ? await platform.openInEditor(`explorer`, openPath, {
                  pathKind: `directory`,
                  remoteTarget,
                  workspaceIdentity,
                })
              : await platform.openInFileManager(openPath);
        result.success ||
          (logger.warn(`[FileContextActions] 在文件管理器中显示条目失败`, {
            path: entry.path,
            openPath,
            error: result.error ?? `unknown-error`,
          }),
          toast(openFailedMessage));
      },
      [canRevealInFileManager, openFailedMessage, platform, remoteTarget, workspaceIdentity],
    ),
  };
}

/** 原 zA（50967）：相对路径——实现归 MarkdownIntegration.tsx，此处声明（见文件头 §二.3） */
/** 原 QVe（51198）/$A（51214）：远程工作区信息——实现归 MarkdownIntegration.tsx，此处声明 */

/* ============================================================================
 * 2. $It 文件树全族（原 145213–146777）
 * ==========================================================================*/

/** 原 f8/jIt/MIt：行高 / 目录刷新超时 / git 刷新超时 */
const FILE_TREE_ROW_HEIGHT = 28,
  REFRESH_DIRECTORY_TIMEOUT_MS = 15e3,
  REFRESH_GIT_TIMEOUT_MS = 8e3;

/** 原 NIt：已安装编辑器钩子（失败仅告警） */
function useInstalledEditors(): { installedEditors: InstalledEditor[] } {
  let platform = usePlatform() as unknown as PlatformService,
    [installedEditors, setInstalledEditors] = React.useState<InstalledEditor[]>([]);
  return (
    React.useEffect(() => {
      let cancelled = false;
      return (
        platform
          .getInstalledEditors()
          .then((editors) => {
            cancelled || setInstalledEditors(orderEditorsForFileManager(editors));
          })
          .catch((error) => {
            logger.warn(`[WorkspaceFileTree] 获取已安装 IDE 列表失败`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }),
        () => {
          cancelled = true;
        }
      );
    }, [platform]),
    { installedEditors }
  );
}

/** 原 PIt：拉取 git 状态快照 */
async function loadGitStatusSnapshot(args: { gitService: GitService; workspacePath: string }): Promise<{
  available: boolean;
  statusByPath: Map<string, GitStatus>;
}> {
  let refreshed = await args.gitService.refresh({ workspacePath: args.workspacePath }),
    available = isGitStatusAvailable(refreshed.summary);
  return {
    available,
    statusByPath: available ? buildStatusByPath([...refreshed.unstagedChanges, ...refreshed.stagedChanges]) : new Map(),
  };
}

/** 原 FIt：目录监听钩子（增量增删 watch，服务切换全量重建） */
function useDirectoryFileWatcher({
  fileWatcherService,
  watchedDirectoryPaths,
  onDirectoryChange,
}: {
  fileWatcherService: FileWatcherService;
  watchedDirectoryPaths: Set<string>;
  onDirectoryChange: (dirPath: string) => void;
}) {
  let serviceRef = React.useRef(fileWatcherService),
    generationRef = React.useRef(0),
    watchedRef = React.useRef<Set<string>>(new Set()),
    subscriptionsRef = React.useRef<Map<string, { id: string; subscription: FileWatcherSubscription; unwatch: () => Promise<void> }>>(new Map()),
    pendingRef = React.useRef<Set<string>>(new Set());
  (React.useEffect(() => {
    let dispose = (path: string, handle: { subscription: FileWatcherSubscription; unwatch: () => Promise<void> }) => {
      (handle.subscription.dispose(),
        handle.unwatch().catch((error) => {
          logger.warn(`[WorkspaceFileTree] 停止监听目录失败`, {
            path,
            error: error instanceof Error ? error.message : String(error),
          });
        }));
    };
    if (serviceRef.current !== fileWatcherService) {
      generationRef.current += 1;
      for (let [path, handle] of subscriptionsRef.current) dispose(path, handle);
      ((subscriptionsRef.current = new Map()), (pendingRef.current = new Set()), (serviceRef.current = fileWatcherService));
    }
    watchedRef.current = watchedDirectoryPaths;
    for (let [path, handle] of subscriptionsRef.current) watchedDirectoryPaths.has(path) || (subscriptionsRef.current.delete(path), dispose(path, handle));
    for (let path of watchedDirectoryPaths) {
      if (subscriptionsRef.current.has(path) || pendingRef.current.has(path)) continue;
      pendingRef.current.add(path);
      let generation = generationRef.current;
      fileWatcherService
        .watch({ path })
        .then(({ id }) => {
          if ((pendingRef.current.delete(path), generation !== generationRef.current || !watchedRef.current.has(path))) {
            fileWatcherService.unwatch({ id });
            return;
          }
          let subscription = fileWatcherService.onDynamicChange(id)((event) => {
            onDirectoryChange(event.dirPath);
          });
          subscriptionsRef.current.set(path, { id, subscription, unwatch: () => fileWatcherService.unwatch({ id }) });
        })
        .catch((error) => {
          (pendingRef.current.delete(path),
            logger.warn(`[WorkspaceFileTree] 监听目录失败`, {
              path,
              error: error instanceof Error ? error.message : String(error),
            }));
        });
    }
  }, [fileWatcherService, onDirectoryChange, watchedDirectoryPaths]),
    React.useEffect(
      () => () => {
        ((generationRef.current += 1), (pendingRef.current = new Set()));
        for (let [path, handle] of subscriptionsRef.current)
          (handle.subscription.dispose(),
            handle.unwatch().catch((error) => {
              logger.warn(`[WorkspaceFileTree] 停止监听目录失败`, {
                path,
                error: error instanceof Error ? error.message : String(error),
              });
            }));
        ((subscriptionsRef.current = new Map()), (watchedRef.current = new Set()));
      },
      [],
    ));
}

/** 原 IIt：收集刷新目标路径（根 + 已加载 + 已展开，去重、限根内） */
function collectRefreshTargetPaths({
  workspacePath,
  expandedPaths,
  loadedDirectoryPaths,
}: {
  workspacePath: string;
  expandedPaths: Set<string>;
  loadedDirectoryPaths: Set<string>;
}): string[] {
  let paths: string[] = [],
    seen = new Set<string>(),
    add = (path: string) => {
      !isPathWithinRoot(workspacePath, path) || seen.has(path) || (seen.add(path), paths.push(path));
    };
  add(workspacePath);
  for (let path of loadedDirectoryPaths) add(path);
  for (let path of expandedPaths) add(path);
  return paths;
}

/** 原 LIt：展平行 memo（deleted 合并 + 空目录压缩） */
function useFlattenedTreeRows({
  workspacePath,
  childrenByDirectory,
  expandedPaths,
  loadedDirectoryPaths,
  loadingDirectoryPaths,
  errorByDirectory,
  gitStatusByPath,
}: {
  workspacePath: string;
  childrenByDirectory: Map<string, FileTreeNode[]>;
  expandedPaths: Set<string>;
  loadedDirectoryPaths: Set<string>;
  loadingDirectoryPaths: Set<string>;
  errorByDirectory: Map<string, Error>;
  gitStatusByPath: Map<string, GitStatus>;
}): FlatTreeRow[] {
  return React.useMemo(
    () =>
      flattenTreeRows({
        rootPath: workspacePath,
        childrenByDirectory: mergeDeletedFileRows({ rootPath: workspacePath, childrenByDirectory, statusByPath: gitStatusByPath }),
        expandedPaths,
        loadedDirectoryPaths,
        loadingDirectoryPaths,
        errorByDirectory,
        flattenEmptyDirectories: true,
      }),
    [childrenByDirectory, errorByDirectory, expandedPaths, gitStatusByPath, loadedDirectoryPaths, loadingDirectoryPaths, workspacePath],
  );
}

/** 原 RIt：超时错误 */
function timeoutError(label: string, timeoutMs: number): Error {
  return Error(`${label} timed out after ${timeoutMs}ms`);
}

/** 原 zIt：Promise 超时竞速 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((resolve, reject) => {
        timer = setTimeout(() => {
          reject(timeoutError(label, timeoutMs));
        }, timeoutMs);
      }),
    ]);
  } finally {
    timer && clearTimeout(timer);
  }
}

/** 原 BIt：工作区文件树数据钩子（目录加载/展开/git 状态/监听/手动刷新） */
function useWorkspaceFileTreeData({
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  enableWorkspaceFeatures = true,
}: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  enableWorkspaceFeatures?: boolean;
}) {
  let { fileService, fileWatcherService, gitService } = useWorkspaceScopedServices(workspacePath, workspaceRemoteSessionId, workspaceIdentity),
    generationRef = React.useRef(0),
    treeGenerationRef = React.useRef(0),
    loadCountRef = React.useRef<Map<string, number>>(new Map()),
    gitGenerationRef = React.useRef(0),
    refreshGenerationRef = React.useRef(0),
    dirtyPathsRef = React.useRef<Set<string>>(new Set()),
    debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null),
    loadingRef = React.useRef<Set<string>>(new Set()),
    loadedRef = React.useRef<Set<string>>(new Set()),
    [childrenByDirectory, setChildrenByDirectory] = React.useState<Map<string, FileTreeNode[]>>(new Map()),
    [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(new Set()),
    [loadedDirectoryPaths, setLoadedDirectoryPaths] = React.useState<Set<string>>(new Set()),
    [loadingDirectoryPaths, setLoadingDirectoryPaths] = React.useState<Set<string>>(new Set()),
    [errorByDirectory, setErrorByDirectory] = React.useState<Map<string, Error>>(new Map()),
    [gitStatusByPath, setGitStatusByPath] = React.useState<Map<string, GitStatus>>(new Map()),
    [gitStatusAvailable, setGitStatusAvailable] = React.useState(false),
    [ignoredPathSet, setIgnoredPathSet] = React.useState<Set<string>>(new Set()),
    [refreshingLoadedDirectories, setRefreshingLoadedDirectories] = React.useState(false),
    refreshingRef = React.useRef(false);
  (React.useEffect(() => {
    loadingRef.current = loadingDirectoryPaths;
  }, [loadingDirectoryPaths]),
    React.useEffect(() => {
      loadedRef.current = loadedDirectoryPaths;
    }, [loadedDirectoryPaths]));
  let setLoading = React.useCallback((path: string, value: boolean) => {
      let next = toggledPathSet(loadingRef.current, path, value);
      ((loadingRef.current = next), setLoadingDirectoryPaths(next));
    }, []),
    setLoaded = React.useCallback((path: string, value: boolean) => {
      let next = toggledPathSet(loadedRef.current, path, value);
      ((loadedRef.current = next), setLoadedDirectoryPaths(next));
    }, []),
    bumpLoadCount = React.useCallback((path: string) => {
      loadCountRef.current.set(path, (loadCountRef.current.get(path) ?? 0) + 1);
    }, []),
    bumpTreeGeneration = React.useCallback(() => {
      refreshGenerationRef.current += 1;
    }, []),
    prunePathState = React.useCallback(
      (path: string) => {
        for (let known of loadCountRef.current.keys()) isPathWithinRoot(path, known) && bumpLoadCount(known);
        (setChildrenByDirectory((current) => {
          let next = new Map(current);
          for (let key of current.keys()) isPathWithinRoot(path, key) && next.delete(key);
          return next;
        }),
          setExpandedPaths((current) => new Set([...current].filter((entry) => !isPathWithinRoot(path, entry)))),
          setErrorByDirectory((current) => {
            let next = new Map(current);
            for (let key of current.keys()) isPathWithinRoot(path, key) && next.delete(key);
            return next;
          }));
        let nextLoaded = new Set([...loadedRef.current].filter((entry) => !isPathWithinRoot(path, entry)));
        ((loadedRef.current = nextLoaded), setLoadedDirectoryPaths(nextLoaded));
        let nextLoading = new Set([...loadingRef.current].filter((entry) => !isPathWithinRoot(path, entry)));
        ((loadingRef.current = nextLoading), setLoadingDirectoryPaths(nextLoading));
      },
      [bumpLoadCount],
    ),
    loadDirectory = React.useCallback(
      async (path: string, depth: number, options?: { force?: boolean; silent?: boolean; workspaceGeneration?: number }): Promise<string> => {
        let force = options?.force ?? false,
          silent = options?.silent ?? false,
          workspaceGeneration = options?.workspaceGeneration ?? generationRef.current;
        if (generationRef.current !== workspaceGeneration) return `stale`;
        if (!force && (loadingRef.current.has(path) || loadedRef.current.has(path))) return `loaded`;
        let treeGeneration = treeGenerationRef.current,
          loadCount = (loadCountRef.current.get(path) ?? 0) + 1;
        loadCountRef.current.set(path, loadCount);
        let isCurrent = () => generationRef.current === workspaceGeneration && treeGenerationRef.current === treeGeneration && loadCountRef.current.get(path) === loadCount;
        (silent || setLoading(path, true),
          setErrorByDirectory((current) => {
            let next = new Map(current);
            return (next.delete(path), next);
          }));
        try {
          let entries = await fileService.readdir({ path, includeHidden: true });
          return isCurrent()
            ? (enableWorkspaceFeatures &&
                gitService
                  .getIgnoredPaths({ workspacePath, paths: entries.map((entry) => entry.path) })
                  .then((ignored) => {
                    if (!isCurrent()) return;
                    let ignoredSet = normalizePathSet(ignored);
                    setIgnoredPathSet((current) => {
                      let next = new Set(current);
                      for (let entryPath of entries.map((entry) => entry.path))
                        next.delete(entryPath.replace(/\\/g, `/`).replace(/\/+$/, ``));
                      for (let ignoredPath of ignoredSet) next.add(ignoredPath);
                      return next;
                    });
                  })
                  .catch((error) => {
                    let normalized = toError(error);
                    logger.warn(`[WorkspaceFileTree] 读取 Git ignored 状态失败`, {
                      workspacePath,
                      path,
                      error: normalized.message,
                    });
                  }),
              setChildrenByDirectory((current) => {
                let next = new Map(current);
                return (
                  next.set(
                    path,
                    entries.map((entry) => ({
                      path: entry.path,
                      name: entry.name,
                      type: entry.type as FileTreeNodeType,
                      isSymbolicLink: entry.isSymbolicLink === true,
                      depth,
                    })),
                  ),
                  next
                );
              }),
              setLoaded(path, true),
              entries.length === 1 &&
                isRealDirectory(entries[0]) &&
                loadDirectory(entries[0].path, depth + 1, { silent: true, workspaceGeneration }),
              `loaded`)
            : `stale`;
        } catch (error) {
          if (!isCurrent()) return `stale`;
          let normalized = toError(error);
          return (
            logger.warn(`[WorkspaceFileTree] 读取目录失败`, { path, error: normalized.message }),
            setErrorByDirectory((current) => {
              let next = new Map(current);
              return (next.set(path, normalized), next);
            }),
            `failed`
          );
        } finally {
          isCurrent() && setLoading(path, false);
        }
      },
      [enableWorkspaceFeatures, fileService, gitService, setLoaded, setLoading, workspacePath],
    ),
    loadGitStatus = React.useCallback(
      async (options?: { workspaceGeneration?: number }) => {
        let workspaceGeneration = options?.workspaceGeneration ?? generationRef.current;
        if (generationRef.current !== workspaceGeneration) return;
        if (!enableWorkspaceFeatures) {
          (setGitStatusByPath(new Map()), setGitStatusAvailable(false));
          return;
        }
        let gitGeneration = gitGenerationRef.current + 1;
        gitGenerationRef.current = gitGeneration;
        try {
          let snapshot = await loadGitStatusSnapshot({ gitService, workspacePath });
          if (gitGenerationRef.current !== gitGeneration || generationRef.current !== workspaceGeneration) return;
          (setGitStatusAvailable(snapshot.available), setGitStatusByPath(snapshot.statusByPath));
        } catch (error) {
          if (gitGenerationRef.current !== gitGeneration || generationRef.current !== workspaceGeneration) return;
          let normalized = toError(error);
          (logger.warn(`[WorkspaceFileTree] 读取 Git 状态失败`, { workspacePath, error: normalized.message }),
            setGitStatusAvailable(false),
            setGitStatusByPath(new Map()));
        }
      },
      [enableWorkspaceFeatures, gitService, workspacePath],
    ),
    reloadDirectoryAfterChange = React.useCallback(
      async (path: string, workspaceGeneration: number) => {
        if (generationRef.current !== workspaceGeneration || !isPathWithinRoot(workspacePath, path)) return;
        let result = await loadDirectory(path, relativeDepthFromRoot(workspacePath, path), { force: true, silent: true, workspaceGeneration });
        if (result === `loaded` || result === `stale` || generationRef.current !== workspaceGeneration) return;
        prunePathState(path);
        let parent = parentDirectoryPathInRoot(workspacePath, path);
        parent && (await loadDirectory(parent, relativeDepthFromRoot(workspacePath, parent), { force: true, silent: true, workspaceGeneration }));
      },
      [loadDirectory, prunePathState, workspacePath],
    ),
    refreshDirectoryManually = React.useCallback(
      async (path: string, workspaceGeneration: number) => {
        if (generationRef.current === workspaceGeneration && isPathWithinRoot(workspacePath, path))
          try {
            await withTimeout(
              loadDirectory(path, relativeDepthFromRoot(workspacePath, path), { force: true, silent: true, workspaceGeneration }),
              REFRESH_DIRECTORY_TIMEOUT_MS,
              `workspace file tree refresh ${path}`,
            );
          } catch (error) {
            if (generationRef.current !== workspaceGeneration) return;
            bumpLoadCount(path);
            let normalized = toError(error);
            (logger.warn(`[WorkspaceFileTree] 手动刷新目录超时或失败`, { path, error: normalized.message }),
              setErrorByDirectory((current) => {
                let next = new Map(current);
                return (next.set(path, normalized), next);
              }));
          }
      },
      [bumpLoadCount, loadDirectory, workspacePath],
    ),
    runRefreshQueue = React.useCallback(async (paths: string[], workspaceGeneration: number, refreshGeneration: number, worker: (path: string, generation: number) => Promise<void>) => {
      let queue = [...new Set(paths)],
        concurrency = Math.min(2, queue.length);
      await Promise.allSettled(
        Array.from({ length: concurrency }, async () => {
          for (; queue.length > 0 && generationRef.current === workspaceGeneration && refreshGenerationRef.current === refreshGeneration; ) {
            let path = queue.shift();
            path && (await worker(path, workspaceGeneration));
          }
        }),
      );
    }, []),
    refreshLoadedDirectories = React.useCallback(async () => {
      if (refreshingRef.current) return;
      let workspaceGeneration = generationRef.current,
        refreshGeneration = refreshGenerationRef.current + 1;
      ((refreshGenerationRef.current = refreshGeneration), (refreshingRef.current = true), setRefreshingLoadedDirectories(true));
      let targets = collectRefreshTargetPaths({ workspacePath, expandedPaths, loadedDirectoryPaths: loadedRef.current });
      try {
        if ((await runRefreshQueue(targets, workspaceGeneration, refreshGeneration, refreshDirectoryManually), generationRef.current === workspaceGeneration && refreshGenerationRef.current === refreshGeneration))
          try {
            await withTimeout(loadGitStatus({ workspaceGeneration }), REFRESH_GIT_TIMEOUT_MS, `workspace file tree git refresh`);
          } catch (error) {
            if (generationRef.current === workspaceGeneration && refreshGenerationRef.current === refreshGeneration) {
              gitGenerationRef.current += 1;
              let normalized = toError(error);
              logger.warn(`[WorkspaceFileTree] 手动刷新 Git 状态超时或失败`, {
                workspacePath,
                error: normalized.message,
              });
            }
          }
      } finally {
        generationRef.current === workspaceGeneration && refreshGenerationRef.current === refreshGeneration && ((refreshingRef.current = false), setRefreshingLoadedDirectories(false));
      }
    }, [expandedPaths, loadGitStatus, refreshDirectoryManually, runRefreshQueue, workspacePath]),
    flushDirtyPaths = React.useCallback(() => {
      let dirty = [...dirtyPathsRef.current];
      if (((dirtyPathsRef.current = new Set()), dirty.length === 0)) return;
      let targets = dirty.length > 50 ? [workspacePath, ...expandedPaths] : dirty,
        workspaceGeneration = generationRef.current,
        refreshGeneration = refreshGenerationRef.current;
      runRefreshQueue(targets, workspaceGeneration, refreshGeneration, reloadDirectoryAfterChange).finally(() => {
        generationRef.current === workspaceGeneration && refreshGenerationRef.current === refreshGeneration && loadGitStatus({ workspaceGeneration });
      });
    }, [expandedPaths, loadGitStatus, reloadDirectoryAfterChange, runRefreshQueue, workspacePath]),
    onDirectoryChange = React.useCallback(
      (path: string) => {
        isPathWithinRoot(workspacePath, path) &&
          (dirtyPathsRef.current.add(path),
          debounceTimerRef.current && clearTimeout(debounceTimerRef.current),
          (debounceTimerRef.current = setTimeout(() => {
            ((debounceTimerRef.current = null), flushDirtyPaths());
          }, 300)));
      },
      [flushDirtyPaths, workspacePath],
    );
  React.useEffect(() => {
    generationRef.current += 1;
    let workspaceGeneration = generationRef.current;
    return (
      (treeGenerationRef.current += 1),
      bumpTreeGeneration(),
      (loadCountRef.current = new Map()),
      (loadingRef.current = new Set()),
      (loadedRef.current = new Set()),
      setChildrenByDirectory(new Map()),
      setExpandedPaths(new Set()),
      setLoadedDirectoryPaths(new Set()),
      setLoadingDirectoryPaths(new Set()),
      setErrorByDirectory(new Map()),
      setGitStatusByPath(new Map()),
      setGitStatusAvailable(false),
      setIgnoredPathSet(new Set()),
      (refreshingRef.current = false),
      setRefreshingLoadedDirectories(false),
      (dirtyPathsRef.current = new Set()),
      (debounceTimerRef.current &&= (clearTimeout(debounceTimerRef.current), null)),
      loadDirectory(workspacePath, 0, { force: true, workspaceGeneration }),
      loadGitStatus({ workspaceGeneration }),
      () => {
        bumpTreeGeneration();
      }
    );
  }, [bumpTreeGeneration, loadDirectory, loadGitStatus, workspaceIdentity, workspacePath]);
  let rows = useFlattenedTreeRows({
      workspacePath,
      childrenByDirectory,
      expandedPaths,
      loadedDirectoryPaths,
      loadingDirectoryPaths,
      errorByDirectory,
      gitStatusByPath,
    }),
    watchedRootSet = React.useMemo(() => new Set([workspacePath, ...expandedPaths]), [expandedPaths, workspacePath]);
  return (
    useDirectoryFileWatcher({
      fileWatcherService,
      watchedDirectoryPaths: React.useMemo(() => (enableWorkspaceFeatures ? watchedRootSet : new Set<string>()), [enableWorkspaceFeatures, watchedRootSet]),
      onDirectoryChange,
    }),
    {
      rows,
      setExpandedPaths,
      loadedDirectoryPaths,
      loadingDirectoryPaths,
      errorByDirectory,
      gitStatusByPath,
      gitStatusAvailable,
      ignoredPathSet,
      refreshingLoadedDirectories,
      loadDirectory,
      loadGitStatus,
      refreshLoadedDirectories,
      setLoadedDirectoryPaths,
      loadedDirectoryPathsRef: loadedRef,
    }
  );
}

/** 原 VIt：计算吸顶文件夹行（向上回溯各级展开目录） */
function computeStickyFolderRows({
  rows,
  virtualItems,
  scrollDirection,
  scrollOffset,
  suppressedForwardSticky,
  enabled = true,
}: {
  rows: FlatTreeRow[];
  virtualItems: VirtualItem[];
  scrollDirection?: string;
  scrollOffset: number;
  suppressedForwardSticky?: { path: string; offset: number } | null;
  enabled?: boolean;
}): Array<{ row: FlatTreeRow; index: number }> {
  if (!enabled) return [];
  let firstVisible = virtualItems.find((item) => item.end > scrollOffset) ?? virtualItems[0],
    anchorRow = firstVisible ? rows[firstVisible.index] : null;
  if (!firstVisible || !anchorRow) return [];
  let sticky: Array<{ row: FlatTreeRow; index: number }> = [],
    anchorIsExpandedDirectory = anchorRow.type === `directory` && anchorRow.expanded,
    depth = anchorIsExpandedDirectory ? anchorRow.depth : anchorRow.depth - 1;
  for (let index = anchorIsExpandedDirectory ? firstVisible.index : firstVisible.index - 1; index >= 0 && depth >= 0; --index) {
    let row = rows[index];
    if (!(!row || row.type !== `directory` || !row.expanded) && row.depth === depth) {
      let rowTop = index * FILE_TREE_ROW_HEIGHT,
        rowBottom = rowTop + FILE_TREE_ROW_HEIGHT,
        suppressed = scrollDirection === `forward` && suppressedForwardSticky?.path === row.path && scrollOffset <= suppressedForwardSticky.offset + 0.5;
      (scrollOffset > 0.5 &&
        !suppressed &&
        (scrollDirection === `backward` ? rowBottom <= scrollOffset + 0.5 : rowTop <= scrollOffset + 0.5) &&
        sticky.push({ row, index }),
        (depth = row.depth - 1));
    }
  }
  return sticky.reverse();
}

/** 原 HIt：吸顶文件夹滚动钩子（前进方向自动吸附到下一级） */
function useStickyFolderScroll({
  rows,
  virtualItems,
  scrollDirection,
  scrollOffset,
  enabled,
  onScrollToOffset,
}: {
  rows: FlatTreeRow[];
  virtualItems: VirtualItem[];
  scrollDirection?: string;
  scrollOffset: number;
  enabled: boolean;
  onScrollToOffset: (offset: number) => void;
}): Array<{ row: FlatTreeRow; index: number }> {
  let suppressedRef = React.useRef<{ path: string; offset: number } | null>(null),
    stickyRows = React.useMemo(
      () =>
        computeStickyFolderRows({
          rows,
          virtualItems,
          scrollDirection,
          scrollOffset,
          suppressedForwardSticky: suppressedRef.current,
          enabled,
        }),
      [enabled, rows, scrollDirection, scrollOffset, virtualItems],
    ),
    seenPathsRef = React.useRef<Set<string>>(new Set()),
    lastSnapRef = React.useRef<{ path: string; offset: number } | null>(null);
  return (
    React.useLayoutEffect(() => {
      let previousPaths = seenPathsRef.current;
      if (((seenPathsRef.current = new Set(stickyRows.map((entry) => entry.row.path))), !enabled)) {
        ((seenPathsRef.current = new Set()), (suppressedRef.current = null), (lastSnapRef.current = null));
        return;
      }
      if (scrollDirection !== `forward`) return;
      let newest = stickyRows.filter((entry) => !previousPaths.has(entry.row.path)).at(-1);
      if (!newest) return;
      let snapOffset = (newest.index + 1) * FILE_TREE_ROW_HEIGHT,
        nextRow = rows[newest.index + 1] ?? null,
        lastSnap = lastSnapRef.current;
      (lastSnap?.path === newest.row.path && lastSnap.offset === snapOffset) ||
        scrollOffset >= snapOffset - 0.5 ||
        scrollOffset <= newest.index * FILE_TREE_ROW_HEIGHT + 0.5 ||
        ((lastSnapRef.current = { path: newest.row.path, offset: snapOffset }),
        (suppressedRef.current = nextRow ? { path: nextRow.path, offset: snapOffset } : null),
        onScrollToOffset(snapOffset));
    }, [onScrollToOffset, rows, scrollDirection, scrollOffset, stickyRows, enabled]),
    stickyRows
  );
}

/** 原 p8：文件树空态 */
function FileTreeEmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className={`flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center text-ui-base text-foreground-subtle`}>
      <div className={`text-foreground-subtlest`}>{icon}</div>
      <div className={`font-medium text-foreground-subtle`}>{title}</div>
      {description ? (
        <div className={`max-w-full break-words text-foreground-subtlest`}>{description}</div>
      ) : null}
    </div>
  );
}

/** 原 UIt：git 状态徽标字母 */
function gitStatusBadgeLetter(status: GitStatus): string | null {
  switch (status) {
    case `modified`:
      return `M`;
    case `added`:
      return `A`;
    case `deleted`:
      return `D`;
    case `renamed`:
      return `R`;
    case `untracked`:
      return `U`;
    case `ignored`:
      return null;
  }
}

/** 原 WIt：git 状态文字色 */
function gitStatusTextColor(status: GitStatus | null): string | null {
  switch (status) {
    case `added`:
      return `text-git-added`;
    case `untracked`:
      return `text-git-untracked`;
    case `deleted`:
      return `text-git-deleted`;
    case `ignored`:
      return `text-git-ignored`;
    case `renamed`:
      return `text-git-renamed`;
    case `modified`:
      return `text-git-modified`;
    default:
      return null;
  }
}

/** 原 GIt：行主状态（自身优先，否则取目录聚合首位） */
function primaryGitStatus({ gitStatus, directoryGitStatuses }: { gitStatus: GitStatus | null; directoryGitStatuses: GitStatus[] }): GitStatus | null {
  return gitStatus ?? directoryGitStatuses[0];
}

/** 原 KIt：徽标文字色（70 透明度） */
function gitStatusBadgeColor(status: GitStatus): string | null {
  switch (status) {
    case `added`:
      return `text-git-added/70`;
    case `untracked`:
      return `text-git-untracked/70`;
    case `deleted`:
      return `text-git-deleted/70`;
    case `renamed`:
      return `text-git-renamed/70`;
    case `modified`:
      return `text-git-modified/70`;
    case `ignored`:
      return `text-git-ignored`;
  }
}

/** 原 qIt：目录聚合圆点底色 */
function gitStatusDotColor(status: GitStatus): string {
  switch (status) {
    case `added`:
      return `bg-git-added/60`;
    case `untracked`:
      return `bg-git-untracked/60`;
    case `deleted`:
      return `bg-git-deleted/60`;
    case `ignored`:
      return `bg-git-ignored/60`;
    case `renamed`:
      return `bg-git-renamed/60`;
    case `modified`:
      return `bg-git-modified/60`;
    default:
      return `bg-git-descendant/60`;
  }
}

/** 原 JIt：层级参考线背景 */
const HIERARCHY_GUIDE_BACKGROUND = `repeating-linear-gradient(to right, transparent 0 calc(0.375rem - 1px), var(--color-border) calc(0.375rem - 1px) 0.375rem, transparent 0.375rem 0.75rem)`;

/** 原 YIt：层级参考线样式（depth≤0 不显示） */
function hierarchyGuideStyle(depth: number): { width: string; backgroundImage: string } | null {
  return depth <= 0 ? null : { width: `calc(${depth} * 0.75rem)`, backgroundImage: HIERARCHY_GUIDE_BACKGROUND };
}

/** 原 XIt：拖拽态钩子（dragend/drop/blur 复位） */
function useFileTreeDragState(): { isDragging: boolean; setIsDragging: (value: boolean) => void } {
  let [isDragging, setIsDragging] = React.useState(false);
  return (
    React.useEffect(() => {
      if (!isDragging) return;
      let reset = () => setIsDragging(false);
      return (
        window.addEventListener(`dragend`, reset),
        window.addEventListener(`drop`, reset),
        window.addEventListener(`blur`, reset),
        () => {
          (window.removeEventListener(`dragend`, reset),
            window.removeEventListener(`drop`, reset),
            window.removeEventListener(`blur`, reset));
        }
      );
    }, [isDragging]),
    { isDragging, setIsDragging }
  );
}

/** 原 ZIt：压缩路径名（多段以斜杠分隔渲染） */
function CompactPathName({ name, className, slashClassName }: { name: string; className?: string; slashClassName?: string }) {
  let segments = name.split(`/`);
  return segments.length <= 1 ? (
    <span className={className}>{name}</span>
  ) : (
    <span className={className}>
      {segments.map((segment, index) => (
        <React.Fragment key={`${segment}-${index}`}>
          {index > 0 ? <span className={slashClassName}>/</span> : null}
          <span>{segment}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

interface FileTreeContextMenuLabels {
  open: string;
  openWith: string;
  openInBrowser: string;
  reveal: string;
  copyAbsolutePath: string;
  copyRelativePath: string;
  addToChat: string;
  openFailed: string;
}

interface FileTreeEditorState {
  canOpenLocalFileManager: boolean;
  installedEditors: InstalledEditor[];
  isRemoteWorkspaceFileTree: boolean;
  remoteTarget: { kind?: string } | null;
}

/** 原 QIt：文件树行（选中/展开/右键菜单/拖拽/git 徽标/吸深层级线） */
function FileTreeRow({
  layout = `absolute`,
  row,
  selected,
  gitStatus,
  directoryGitStatuses,
  gitStatusLabelByStatus,
  contextMenuLabels,
  canOpenLocalFileManager,
  installedEditors,
  isRemoteWorkspaceFileTree,
  remoteTarget,
  workspacePath,
  workspaceIdentity,
  style,
  onSelect,
  onToggleDirectory,
  onOpenPreview,
  onOpenBrowserUrl,
  onKeyDown,
}: {
  layout?: string;
  row: FlatTreeRow;
  selected: boolean;
  gitStatus: GitStatus | null;
  directoryGitStatuses: GitStatus[];
  gitStatusLabelByStatus: Record<string, string>;
  contextMenuLabels: FileTreeContextMenuLabels;
  canOpenLocalFileManager: boolean;
  installedEditors: InstalledEditor[];
  isRemoteWorkspaceFileTree: boolean;
  remoteTarget: { kind?: string } | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  style: React.CSSProperties;
  onSelect: (path: string) => void;
  onToggleDirectory: (row: FlatTreeRow) => void;
  onOpenPreview: (row: FlatTreeRow) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onKeyDown: (event: React.KeyboardEvent, row: FlatTreeRow) => void;
}) {
  let platform = usePlatform() as unknown as PlatformService,
    { isDragging, setIsDragging } = useFileTreeDragState(),
    contextActions = useFileContextActions({ canOpenLocalFileManager, isRemoteWorkspace: isRemoteWorkspaceFileTree, openFailedMessage: contextMenuLabels.openFailed }),
    relativePath = relativePathFromWorkspace(workspacePath, row.path),
    isDirectory = row.type === `directory`,
    deleted = isDeletedFileRow(row, gitStatus),
    wslEditor = wslFallbackEditor(installedEditors, remoteTarget),
    rowStyle: React.CSSProperties & { "--workspace-file-tree-depth": number } = { ...style, "--workspace-file-tree-depth": row.depth },
    guideStyle = hierarchyGuideStyle(row.depth),
    fileIconSrc = isDirectory ? null : getFileMeta(row.path).fileIconSrc,
    statusLabel = gitStatus ? gitStatusLabelByStatus[gitStatus] : null,
    badgeLetter = gitStatus ? gitStatusBadgeLetter(gitStatus) : null,
    badgeColor = gitStatus ? gitStatusBadgeColor(gitStatus) : null,
    nameColor = gitStatusTextColor(primaryGitStatus({ gitStatus, directoryGitStatuses })),
    showDirectoryDot = !row.loading && directoryGitStatuses.length > 0,
    chatEntry: FileTreeChatEntry = {
      type: row.type === `directory` ? `directory` : `file`,
      workspacePath,
      ...(workspaceIdentity ? { workspaceIdentity } : {}),
      path: row.path,
      relativePath,
      name: row.name,
    },
    handleClick = (event: React.MouseEvent) => {
      if ((onSelect(row.path), !(event.detail > 1))) {
        if (isDirectory) {
          onToggleDirectory(row);
          return;
        }
        deleted || onOpenPreview(row);
      }
    },
    copyAbsolute = async () => {
      await contextActions.copyAbsolutePath({ path: row.path });
    },
    copyRelative = async () => {
      await contextActions.copyRelativePath({ path: row.path, relativePath });
    },
    openEntry = () => {
      if (!deleted) {
        if (isDirectory) {
          onToggleDirectory(row);
          return;
        }
        onOpenPreview(row);
      }
    },
    openInEditor = async (editor: InstalledEditor) => {
      if (deleted) return;
      let result = await platform.openInEditor(editor.id, row.path, {
        pathKind: isDirectory ? `directory` : `file`,
        remoteTarget,
        workspaceIdentity,
      });
      result.success ||
        (logger.warn(`[WorkspaceFileTree] 打开文件树条目失败`, {
          editorId: editor.id,
          path: row.path,
          error: result.error ?? `unknown-error`,
        }),
        toast(contextMenuLabels.openFailed));
    },
    openInBrowser = () => {
      let url = browserUrlForRow(row);
      url && onOpenBrowserUrl?.(url);
    },
    revealOrOpen = async () => {
      if (wslEditor) {
        await openInEditor(wslEditor);
        return;
      }
      await contextActions.revealInFileManager({ path: row.path, deleted, kind: isDirectory ? `directory` : `file` });
    },
    treeItem = (
      <div
        role={`treeitem`}
        data-testid={scopedTestId(TESTID_FILE_TREE_ROW_BASE, row.path)}
        aria-expanded={isDirectory ? row.expanded : undefined}
        tabIndex={0}
        draggable={!deleted}
        className={cn(
          `group/file-tree-row relative flex h-7 w-full min-w-0 items-center gap-1.5 rounded-lg border pr-2 py-1 text-left text-ui-base text-foreground outline-none transition-[background-color,border-color,box-shadow]`,
          deleted ? `cursor-default` : `cursor-pointer`,
          `pl-[calc(var(--workspace-file-tree-depth)*0.75rem+0.5rem)]`,
          selected
            ? `border-input-border-focused bg-transparent hover:bg-surface-hover`
            : `border-transparent hover:bg-surface-hover`,
          `focus-visible:border-border-hover`,
        )}
        title={relativePath}
        onClick={handleClick}
        onContextMenu={() => onSelect(row.path)}
        onKeyDown={(event) => {
          if (deleted && event.key === `Enter`) {
            (event.preventDefault(), onSelect(row.path));
            return;
          }
          onKeyDown(event, row);
        }}
        onDragStart={(event) => {
          if (deleted) {
            event.preventDefault();
            return;
          }
          ((event.dataTransfer.effectAllowed = `copy`),
            event.dataTransfer.setData(FILE_TREE_DRAG_MIME, serializeFileTreeDragPayload(chatEntry)),
            event.dataTransfer.setData(`text/plain`, buildFileTreeDragText(relativePath, row.name, row.type)),
            setIsDragging(true),
            setGlobalFileTreeDragging(true));
        }}
        onDragEnd={() => {
          (setIsDragging(false), setGlobalFileTreeDragging(false));
        }}
      >
        {guideStyle && !isDragging ? (
          <span
            aria-hidden={`true`}
            className={`pointer-events-none absolute -inset-y-0.5 left-2.5`}
            data-workspace-file-tree-hierarchy-guides={row.depth}
            style={guideStyle}
          />
        ) : null}
        {isDirectory ? (
          <span className={`flex size-4 shrink-0 items-center justify-center text-foreground-subtle`}>
            <IconChevronRight
              aria-hidden={`true`}
              className={cn(
                `size-3 text-foreground-subtlest transition-transform`,
                row.expanded && `rotate-90`,
              )}
            />
          </span>
        ) : null}
        <span className={`flex min-w-0 flex-1 items-center gap-1.5`}>
          {fileIconSrc ? <FileIconImage src={fileIconSrc} className={`shrink-0 size-4`} /> : null}
          <CompactPathName
            name={row.name}
            className={cn(`min-w-0 flex-1 truncate`, nameColor)}
            slashClassName={`mx-1 text-foreground-subtlest`}
          />
        </span>
        {badgeLetter && statusLabel ? (
          <Tooltip
            title={statusLabel}
            side={`right`}
            align={`center`}
            sideOffset={4}
            triggerClassName={`ml-auto`}
          >
            <span
              className={cn(
                `inline-flex shrink-0 justify-center font-mono text-ui-base font-bold leading-none`,
                badgeColor,
              )}
              aria-label={statusLabel}
            >
              {badgeLetter}
            </span>
          </Tooltip>
        ) : null}
        {showDirectoryDot ? (
          <Tooltip
            title={directoryGitStatuses.map((status) => gitStatusLabelByStatus[status]).join(`, `)}
            side={`right`}
            align={`center`}
            sideOffset={4}
            triggerClassName={`ml-1`}
          >
            <span className={`flex shrink-0 items-center`} aria-label={`●`}>
              <span className={cn(`size-1.5 rounded-full`, gitStatusDotColor(directoryGitStatuses[0]))} />
            </span>
          </Tooltip>
        ) : null}
        {row.loading ? (
          <IconSpinner className={`ml-2 size-3 shrink-0 animate-spin text-foreground-subtlest`} />
        ) : row.error ? (
          <IconError className={`ml-2 size-3 shrink-0 text-warning`} />
        ) : null}
      </div>
    ),
    canReveal = (!deleted && !!wslEditor) || contextActions.canRevealInFileManager({ path: row.path, deleted }),
    canOpen = !deleted,
    canOpenInBrowser = !deleted && !isRemoteWorkspaceFileTree && !!onOpenBrowserUrl && isHtmlPreviewRow(row);
  return (
    <div
      className={cn(layout === `absolute` ? `absolute left-0 top-0 w-full px-1` : `w-full`)}
      style={rowStyle}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>{treeItem}</ContextMenuTrigger>
        <ContextMenuContent className={`w-52`}>
          <ContextMenuItem disabled={!canOpen} onSelect={openEntry}>{contextMenuLabels.open}</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={deleted || installedEditors.length === 0}>{contextMenuLabels.openWith}</ContextMenuSubTrigger>
            <ContextMenuSubContent className={`w-44`}>
              {installedEditors.map((editor) => (
                <ContextMenuItem key={editor.id} onSelect={() => void openInEditor(editor)}>{editor.name}</ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          {canOpenInBrowser ? <ContextMenuItem onSelect={openInBrowser}>{contextMenuLabels.openInBrowser}</ContextMenuItem> : null}
          <ContextMenuSeparator />
          <ContextMenuItem disabled={!canReveal} onSelect={() => void revealOrOpen()}>{contextMenuLabels.reveal}</ContextMenuItem>
          <ContextMenuItem onSelect={() => void copyAbsolute()}>{contextMenuLabels.copyAbsolutePath}</ContextMenuItem>
          <ContextMenuItem onSelect={() => void copyRelative()}>{contextMenuLabels.copyRelativePath}</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => addFileTreeEntryToChat(chatEntry)}>{contextMenuLabels.addToChat}</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

/** 原 $It：虚拟化文件树列表（根错误/初始加载/空态/树渲染） */
function FileTreeVirtualList({
  rootError,
  showInitialLoading,
  rows,
  virtualItems,
  totalSize,
  emptyTitle,
  stickyFolderPathSet,
  workspaceTitle,
  workspacePath,
  workspaceIdentity,
  selectedPath,
  gitStatusByPath,
  ignoredPathSet,
  gitStatusLabelByStatus,
  contextMenuLabels,
  editorState,
  onSelect,
  onToggleDirectory,
  onOpenPreview,
  onOpenBrowserUrl,
  onKeyDown,
}: {
  rootError: Error | null;
  showInitialLoading: boolean;
  rows: FlatTreeRow[];
  virtualItems: VirtualItem[];
  totalSize: number;
  emptyTitle: string;
  stickyFolderPathSet: Set<string>;
  workspaceTitle: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  selectedPath: string | null;
  gitStatusByPath: Map<string, GitStatus>;
  ignoredPathSet: Set<string>;
  gitStatusLabelByStatus: Record<string, string>;
  contextMenuLabels: FileTreeContextMenuLabels;
  editorState: FileTreeEditorState;
  onSelect: (path: string) => void;
  onToggleDirectory: (row: FlatTreeRow) => void;
  onOpenPreview: (row: FlatTreeRow) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onKeyDown: (event: React.KeyboardEvent, row: FlatTreeRow) => void;
}) {
  let { intl } = useIntlContext();
  return rootError ? (
    <FileTreeEmptyState
      icon={<IconError className={`size-4`} />}
      title={intl.formatMessage({ id: `workspaceFileTree.readFailed` })}
      description={rootError.message}
    />
  ) : showInitialLoading ? (
    <FileTreeEmptyState
      icon={<IconSpinner className={`size-4 animate-spin`} />}
      title={intl.formatMessage({ id: `common.loading` })}
    />
  ) : rows.length === 0 ? (
    <FileTreeEmptyState icon={<IconEmptyFolder className={`size-4`} />} title={emptyTitle} />
  ) : (
    <div
      className={`relative w-full`}
      style={{ height: `${totalSize}px` }}
      role={`tree`}
      aria-label={workspaceTitle}
    >
      {virtualItems.map((virtualItem) => {
        let row = rows[virtualItem.index];
        return !row || stickyFolderPathSet.has(row.path) ? null : (
          <FileTreeRow
            key={row.path}
            row={row}
            selected={selectedPath !== null && samePath(selectedPath, row.path)}
            gitStatus={statusForPath(gitStatusByPath, row.path) ?? (hasNormalizedPath(ignoredPathSet, row.path) ? `ignored` : null)}
            directoryGitStatuses={row.type === `directory` ? descendantStatuses(gitStatusByPath, row.path) : []}
            gitStatusLabelByStatus={gitStatusLabelByStatus}
            contextMenuLabels={contextMenuLabels}
            canOpenLocalFileManager={editorState.canOpenLocalFileManager}
            installedEditors={editorState.installedEditors}
            isRemoteWorkspaceFileTree={editorState.isRemoteWorkspaceFileTree}
            remoteTarget={editorState.remoteTarget}
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            style={{ height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)` }}
            onSelect={onSelect}
            onToggleDirectory={onToggleDirectory}
            onOpenPreview={onOpenPreview}
            onOpenBrowserUrl={onOpenBrowserUrl}
            onKeyDown={onKeyDown}
          />
        );
      })}
    </div>
  );
}

/** 原 eLt：吸顶文件夹列表（静态布局，键盘导航接管方向键） */
function StickyFolderList({
  items,
  selectedPath,
  gitStatusByPath,
  ignoredPathSet,
  gitStatusLabelByStatus,
  contextMenuLabels,
  editorState,
  workspacePath,
  workspaceIdentity,
  onSelect,
  onToggleDirectory,
  onRevealRow,
  onOpenPreview,
  onOpenBrowserUrl,
  onKeyDown,
}: {
  items: Array<{ row: FlatTreeRow; index: number }>;
  selectedPath: string | null;
  gitStatusByPath: Map<string, GitStatus>;
  ignoredPathSet: Set<string>;
  gitStatusLabelByStatus: Record<string, string>;
  contextMenuLabels: FileTreeContextMenuLabels;
  editorState: FileTreeEditorState;
  workspacePath: string;
  workspaceIdentity?: string | null;
  onSelect: (path: string) => void;
  onToggleDirectory: (row: FlatTreeRow) => void;
  onRevealRow: (item: { row: FlatTreeRow; index: number }) => void;
  onOpenPreview: (row: FlatTreeRow) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onKeyDown: (event: React.KeyboardEvent, row: FlatTreeRow) => void;
}) {
  return items.length === 0 ? null : (
    <div className={`flex max-h-[45%] shrink-0 flex-col overflow-hidden px-2`}>
      <div className={`flex shrink-0 flex-col overflow-hidden px-1`}>
        {items.map((item) => {
          let row = item.row,
            toggleAndReveal = (toggled: FlatTreeRow) => {
              (onToggleDirectory(toggled),
                toggled.expanded &&
                  requestAnimationFrame(() => {
                    onRevealRow(item);
                  }));
            };
          return (
            <FileTreeRow
              key={row.path}
              layout={`static`}
              row={row}
              selected={selectedPath !== null && samePath(selectedPath, row.path)}
              gitStatus={statusForPath(gitStatusByPath, row.path) ?? (hasNormalizedPath(ignoredPathSet, row.path) ? `ignored` : null)}
              directoryGitStatuses={descendantStatuses(gitStatusByPath, row.path)}
              gitStatusLabelByStatus={gitStatusLabelByStatus}
              contextMenuLabels={contextMenuLabels}
              canOpenLocalFileManager={editorState.canOpenLocalFileManager}
              installedEditors={editorState.installedEditors}
              isRemoteWorkspaceFileTree={editorState.isRemoteWorkspaceFileTree}
              remoteTarget={editorState.remoteTarget}
              workspacePath={workspacePath}
              workspaceIdentity={workspaceIdentity}
              style={{}}
              onSelect={onSelect}
              onToggleDirectory={toggleAndReveal}
              onOpenPreview={onOpenPreview}
              onOpenBrowserUrl={onOpenBrowserUrl}
              onKeyDown={(event, rowArg) => {
                if (event.key === `Enter` || event.key === ` `) {
                  (event.preventDefault(), toggleAndReveal(rowArg));
                  return;
                }
                if (event.key === `ArrowRight` && !rowArg.expanded) {
                  (event.preventDefault(), toggleAndReveal(rowArg));
                  return;
                }
                if (event.key === `ArrowLeft` && rowArg.expanded) {
                  (event.preventDefault(), toggleAndReveal(rowArg));
                  return;
                }
                onKeyDown(event, rowArg);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** 原 tLt：路径深度（包装 relativeDepthFromRoot） */
function depthOfPath(rootPath: string, path: string): number {
  return relativeDepthFromRoot(rootPath, path);
}

/** 原 rLt：根未加载时透出错误 */
function rootErrorIfNotLoaded({ rootLoaded, rootError }: { rootLoaded: boolean; rootError: Error | null }): Error | null {
  return rootLoaded ? null : rootError;
}

/** 原 nLt：文件树面板（返回任务/搜索/变更过滤/刷新/吸顶/虚拟列表） */
export function FileTreePanel({
  workspacePath,
  workspaceName,
  workspaceIdentity,
  workspaceRemoteSessionId,
  revealPath,
  temporaryExternalDirectory = false,
  canOpenLocalFileManager = false,
  activePreviewPath,
  onClose,
  onOpenBrowserUrl,
  onOpenPreview,
  onOpenRepoWiki,
  repoWikiActive = false,
}: {
  workspacePath: string;
  workspaceName?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  revealPath?: string | null;
  temporaryExternalDirectory?: boolean;
  canOpenLocalFileManager?: boolean;
  activePreviewPath?: string | null;
  onClose: () => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenPreview?: (node: { type: string; title: string; path: string; mediaType?: string }) => void;
  onOpenRepoWiki?: () => void;
  repoWikiActive?: boolean;
}) {
  let { intl } = useIntlContext(),
    platform = usePlatform() as unknown as PlatformService,
    scrollElementRef = React.useRef<HTMLDivElement | null>(null),
    pendingRevealRef = React.useRef<string | null>(null),
    [selectedPath, setSelectedPath] = React.useState<string | null>(null),
    [searchQuery, setSearchQuery] = React.useState(``),
    [changedOnly, setChangedOnly] = React.useState(false),
    [hasVerticalOverflow, setHasVerticalOverflow] = React.useState(false),
    [stickyScrollEnabled, setStickyScrollEnabled] = React.useState(false),
    treeData = useWorkspaceFileTreeData({
      workspacePath,
      workspaceIdentity,
      workspaceRemoteSessionId,
      enableWorkspaceFeatures: !temporaryExternalDirectory,
    }),
    { installedEditors } = useInstalledEditors(),
    isRemoteWorkspaceFileTree = !!(workspaceRemoteSessionId || workspaceIdentity),
    { remoteTarget } = useRemoteWorkspaceInfo({
      workspacePath,
      workspaceIdentity,
      workspaceRemoteSessionId,
    }) as { remoteTarget: { kind?: string } | null },
    availableEditors = React.useMemo(
      () =>
        isRemoteWorkspaceFileTree && !remoteTarget
          ? []
          : resolveAvailableEditors({ installedEditors, selectedEditorId: null, remoteTarget }).availableEditors,
      [installedEditors, isRemoteWorkspaceFileTree, remoteTarget],
    ),
    wslEditor = wslFallbackEditor(availableEditors, remoteTarget),
    canOpenWorkspace = !!wslEditor || (canOpenLocalFileManager && !isRemoteWorkspaceFileTree),
    visibleRows = React.useMemo(
      () => filterTreeRows({ rows: treeData.rows, searchQuery, changedOnly, statusByPath: treeData.gitStatusByPath }),
      [searchQuery, changedOnly, treeData.gitStatusByPath, treeData.rows],
    ),
    virtualizer = useVirtualizer({
      count: visibleRows.length,
      getScrollElement: () => scrollElementRef.current,
      estimateSize: () => FILE_TREE_ROW_HEIGHT,
      overscan: 12,
    });
  (React.useEffect(() => {
    (setSelectedPath(null), setSearchQuery(``), setChangedOnly(false));
  }, [workspaceIdentity, workspacePath]),
    React.useEffect(() => {
      treeData.gitStatusAvailable || setChangedOnly(false);
    }, [treeData.gitStatusAvailable]));
  let rootLoading = treeData.loadingDirectoryPaths.has(workspacePath),
    rootLoaded = treeData.loadedDirectoryPaths.has(workspacePath),
    rootErrorRaw = treeData.errorByDirectory.get(workspacePath) ?? null,
    rootError = rootErrorIfNotLoaded({ rootLoaded, rootError: rootErrorRaw }),
    showInitialLoading = !rootLoaded && !rootError,
    lastToastRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!rootLoaded || !rootErrorRaw) {
      lastToastRef.current = null;
      return;
    }
    let message = rootErrorRaw.message;
    lastToastRef.current !== message &&
      ((lastToastRef.current = message), toast(`${intl.formatMessage({ id: `workspaceFileTree.readFailed` })}: ${message}`));
  }, [intl, rootErrorRaw, rootLoaded]);
  let gitStatusLabelByStatus = React.useMemo(
      () => ({
        added: intl.formatMessage({ id: `git.kind.added` }),
        deleted: intl.formatMessage({ id: `git.kind.deleted` }),
        ignored: intl.formatMessage({ id: `workspaceFileTree.gitStatus.ignored` }),
        modified: intl.formatMessage({ id: `git.kind.modified` }),
        renamed: intl.formatMessage({ id: `git.kind.renamed` }),
        untracked: intl.formatMessage({ id: `git.section.untracked` }),
      }),
      [intl],
    ),
    revealLabel = revealInFileManagerLabel(intl),
    contextMenuLabels = React.useMemo(
      () => ({
        addToChat: intl.formatMessage({ id: `workspaceFileTree.addToChat` }),
        copyAbsolutePath: intl.formatMessage({ id: `fileActions.copyAbsolutePath` }),
        copyRelativePath: intl.formatMessage({ id: `fileActions.copyRelativePath` }),
        open: intl.formatMessage({ id: `common.open` }),
        openInBrowser: intl.formatMessage({ id: `workspaceFileTree.openInBrowser` }),
        openFailed: intl.formatMessage({ id: `workspaceFileTree.openFailed` }),
        openWith: intl.formatMessage({ id: `workspaceFileTree.openWith` }),
        reveal: revealLabel,
      }),
      [revealLabel, intl],
    ),
    fadeMaskStyle = React.useMemo(() => {
      if (hasVerticalOverflow)
        return {
          WebkitMaskImage: `linear-gradient(to bottom, black 0px, black calc(100% - 32px), transparent 100%)`,
          maskImage: `linear-gradient(to bottom, black 0px, black calc(100% - 32px), transparent 100%)`,
          WebkitMaskRepeat: `no-repeat`,
          maskRepeat: `no-repeat`,
          WebkitMaskSize: `100% 100%`,
          maskSize: `100% 100%`,
        };
    }, [hasVerticalOverflow]),
    scrollContainerStyle = React.useMemo<React.CSSProperties>(() => ({ ...fadeMaskStyle, overflowAnchor: `none` }), [fadeMaskStyle]);
  (React.useEffect(() => {
    let target = revealPath?.trim() || activePreviewPath?.trim();
    if (!target || !isPathWithinRoot(workspacePath, target)) return;
    let cancelled = false,
      ancestors = ancestorDirectoryPaths(workspacePath, target),
      chain = revealPath?.trim() ? [...ancestors, target] : ancestors;
    return (
      (pendingRevealRef.current = target),
      setSelectedPath(target),
      treeData.setExpandedPaths((current) => {
        let next = new Set(current);
        for (let path of chain) next.add(path);
        return next;
      }),
      (async () => {
        for (let [index, path] of chain.entries()) {
          if (cancelled) return;
          await treeData.loadDirectory(path, index + 1);
        }
      })(),
      () => {
        cancelled = true;
      }
    );
  }, [activePreviewPath, revealPath, treeData.loadDirectory, treeData.setExpandedPaths, workspacePath]),
    React.useEffect(() => {
      let target = revealPath?.trim() || activePreviewPath?.trim();
      if (!target || visibleRows.length === 0 || !isPathWithinRoot(workspacePath, target) || !pendingRevealRef.current || !samePath(pendingRevealRef.current, target)) return;
      let index = visibleRows.findIndex((row) => samePath(row.path, target));
      index >= 0 && (virtualizer.scrollToIndex(index, { align: `auto` }), (pendingRevealRef.current = null));
    }, [activePreviewPath, revealPath, virtualizer, visibleRows, workspacePath]),
    React.useEffect(() => {
      let element = scrollElementRef.current;
      if (!element) return;
      let firstChild = element.firstElementChild,
        measure = () => {
          let overflow = element.scrollHeight > element.clientHeight + 1,
            atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
          (setStickyScrollEnabled(overflow), setHasVerticalOverflow(overflow && !atBottom));
        },
        frame: number | null = null,
        latest = measure,
        scheduleMeasure = () => {
          frame === null &&
            (frame = requestAnimationFrame(() => {
              ((frame = null), latest());
            }));
        };
      measure();
      let observer = new ResizeObserver(() => {
        ((latest = measure), scheduleMeasure());
      });
      return (
        observer.observe(element),
        firstChild instanceof HTMLElement && observer.observe(firstChild),
        element.addEventListener(`scroll`, measure, { passive: true }),
        window.addEventListener(`resize`, scheduleMeasure),
        () => {
          (observer.disconnect(),
            element.removeEventListener(`scroll`, measure),
            window.removeEventListener(`resize`, scheduleMeasure),
            frame !== null && cancelAnimationFrame(frame));
        }
      );
    }, [rootErrorRaw, rootLoaded, rootLoading, visibleRows.length]));
  let handleRefresh = React.useCallback(() => {
      treeData.refreshLoadedDirectories();
    }, [treeData]),
    refreshSpinning = rootLoading || treeData.refreshingLoadedDirectories,
    openWorkspaceInFileManager = React.useCallback(async () => {
      if (!canOpenWorkspace) return;
      let result = wslEditor
        ? await platform.openInEditor(wslEditor.id, workspacePath, {
            pathKind: `directory`,
            remoteTarget,
            workspaceIdentity,
          })
        : await platform.openInFileManager(workspacePath);
      result.success ||
        (logger.warn(`[WorkspaceFileTree] 打开 workspace 路径失败`, {
          path: workspacePath,
          error: result.error ?? `unknown-error`,
        }),
        toast(intl.formatMessage({ id: `appHeader.openInFileManagerFailed` })));
    }, [canOpenWorkspace, intl, platform, remoteTarget, workspaceIdentity, workspacePath, wslEditor]),
    copyWorkspacePath = React.useCallback(async () => {
      if (typeof navigator > `u` || !navigator.clipboard?.writeText) {
        logger.warn(`[WorkspaceFileTree] 复制 workspace 路径失败`, {
          path: workspacePath,
          error: `clipboard-unavailable`,
        });
        return;
      }
      try {
        (await navigator.clipboard.writeText(workspacePath),
          logger.info(`[WorkspaceFileTree] workspace 路径已复制`, { path: workspacePath }));
      } catch (error) {
        logger.warn(`[WorkspaceFileTree] 复制 workspace 路径失败`, {
          path: workspacePath,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, [workspacePath]),
    toggleDirectory = React.useCallback(
      (row: FlatTreeRow) => {
        row.type === `directory` &&
          (treeData.setExpandedPaths((current) => {
            let next = new Set(current);
            if (next.has(row.path)) {
              for (let path of row.compactedPaths ?? [row.path]) next.delete(path);
              return next;
            }
            return (next.add(row.path), next);
          }),
          row.expanded || treeData.loadDirectory(row.path, depthOfPath(workspacePath, row.path)));
      },
      [treeData, workspacePath],
    ),
    openPreview = React.useCallback(
      (row: FlatTreeRow) => {
        if (row.type === `directory`) {
          toggleDirectory(row);
          return;
        }
        isDeletedFileRow(row, statusForPath(treeData.gitStatusByPath, row.path)) || onOpenPreview?.(buildFilePreviewNode(row.path));
      },
      [toggleDirectory, onOpenPreview, treeData.gitStatusByPath],
    ),
    handleRowKeyDown = React.useCallback(
      (event: React.KeyboardEvent, row: FlatTreeRow) => {
        if (event.key === `Enter`) {
          (event.preventDefault(), openPreview(row));
          return;
        }
        if (event.key === `ArrowRight` && row.type === `directory`) {
          (event.preventDefault(), row.expanded || toggleDirectory(row));
          return;
        }
        event.key === `ArrowLeft` &&
          row.type === `directory` &&
          row.expanded &&
          (event.preventDefault(), toggleDirectory(row));
      },
      [openPreview, toggleDirectory],
    ),
    hasActiveFilter = searchQuery.trim().length > 0 || changedOnly,
    virtualItems = virtualizer.getVirtualItems(),
    scrollOffset = virtualizer.scrollOffset ?? 0,
    stickyRows = useStickyFolderScroll({
      rows: visibleRows,
      virtualItems,
      scrollDirection: virtualizer.scrollDirection ?? undefined,
      scrollOffset,
      enabled: stickyScrollEnabled,
      onScrollToOffset: virtualizer.scrollToOffset,
    }),
    stickyFolderPathSet = React.useMemo(() => new Set(stickyRows.map((entry) => entry.row.path)), [stickyRows]),
    revealStickyRow = React.useCallback((item: { row: FlatTreeRow; index: number }) => virtualizer.scrollToIndex(item.index, { align: `start` }), [virtualizer]),
    workspaceTitle = workspaceName?.trim() || baseName(workspacePath) || intl.formatMessage({ id: `workspaceFileTree.title` }),
    editorState: FileTreeEditorState = {
      canOpenLocalFileManager,
      installedEditors: availableEditors,
      isRemoteWorkspaceFileTree,
      remoteTarget,
    };
  return (
    <section
      className={`flex h-full min-h-0 flex-col text-foreground`}
      data-testid={TESTID_FILE_TREE_PANEL}
    >
      <div className={`px-2 pb-3 pt-3`}>
        <Button
          type={`button`}
          variant={`ghost`}
          size={`lg`}
          className={`w-full justify-start gap-2 rounded-xl px-2.5 text-foreground-subtle hover:bg-surface-hover hover:text-foreground`}
          onClick={onClose}
        >
          <IconBack className={`size-4 shrink-0`} />
          <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `workspaceFileTree.backToTasks` })}</span>
        </Button>
      </div>
      <div className={`flex shrink-0 items-center px-2 pb-2`}>
        <div className={`relative min-w-0 flex-1`}>
          <IconSearch className={`pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-foreground-subtlest`} />
          <Input
            type={`text`}
            size={`default`}
            value={searchQuery}
            className={`h-7 bg-transparent pl-7 pr-7 focus-visible:bg-input-focused`}
            placeholder={intl.formatMessage({ id: `workspaceFileTree.searchPlaceholder` })}
            aria-label={intl.formatMessage({ id: `workspaceFileTree.searchLabel` })}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
          {searchQuery.length > 0 ? (
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-xs`}
              className={`absolute right-1 top-1/2 -translate-y-1/2 text-foreground-subtlest hover:bg-surface-hover hover:text-foreground`}
              aria-label={intl.formatMessage({ id: `workspaceFileTree.clearSearch` })}
              title={intl.formatMessage({ id: `workspaceFileTree.clearSearch` })}
              onClick={() => setSearchQuery(``)}
            >
              <IconClose className={`size-3`} />
            </Button>
          ) : null}
        </div>
      </div>
      <div className={`flex shrink-0 items-center px-2 pb-2`}>
        <div className={`flex min-w-0 flex-1 items-center gap-1`}>
          <h3 className={`min-w-0 truncate py-1 pr-0.5 pl-2.5 text-ui-base font-medium text-foreground-subtlest`}>{workspaceTitle}</h3>
          {onOpenRepoWiki ? (
            <Tooltip title={intl.formatMessage({ id: `repoWiki.title` })}>
              <Button
                type={`button`}
                variant={`ghost`}
                size={`icon-sm`}
                className={cn(
                  `shrink-0 text-foreground-subtle hover:bg-surface-hover hover:text-foreground`,
                  repoWikiActive && `bg-selected text-foreground`,
                )}
                aria-label={intl.formatMessage({ id: `repoWiki.title` })}
                aria-pressed={repoWikiActive}
                onClick={onOpenRepoWiki}
              >
                <IconRepoWiki className={`size-3.5`} />
              </Button>
            </Tooltip>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-sm`}
              className={`text-foreground-subtle hover:bg-surface-hover hover:text-foreground`}
              aria-label={intl.formatMessage({ id: `common.more` })}
              title={intl.formatMessage({ id: `common.more` })}
            >
              <IconMore className={`size-3.5`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={`end`} className={`w-48`}>
            <DropdownMenuItem disabled={!canOpenWorkspace} onSelect={() => void openWorkspaceInFileManager()}>
              <IconFolderOpen className={`size-4`} />
              {revealLabel}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void copyWorkspacePath()}>
              <IconCopy className={`size-4`} />
              {intl.formatMessage({ id: `appHeader.copyPath` })}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {treeData.gitStatusAvailable ? (
          <Tooltip
            title={intl.formatMessage({
              id: changedOnly ? `workspaceFileTree.showAllFiles` : `workspaceFileTree.showChangedFiles`,
            })}
          >
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-sm`}
              aria-pressed={changedOnly}
              aria-label={intl.formatMessage({
                id: changedOnly ? `workspaceFileTree.showAllFiles` : `workspaceFileTree.showChangedFiles`,
              })}
              className={cn(
                `text-foreground-subtle hover:bg-surface-hover hover:text-foreground`,
                changedOnly && `bg-selected text-foreground`,
              )}
              onClick={() => setChangedOnly((current) => !current)}
            >
              <IconFilterChanges className={`size-3.5`} />
            </Button>
          </Tooltip>
        ) : null}
        <Tooltip title={intl.formatMessage({ id: `workspaceFileTree.refresh` })}>
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-sm`}
            data-testid={TESTID_FILE_TREE_REFRESH_BUTTON}
            className={`text-foreground-subtle hover:bg-surface-hover hover:text-foreground`}
            aria-label={intl.formatMessage({ id: `workspaceFileTree.refresh` })}
            disabled={treeData.refreshingLoadedDirectories}
            onClick={handleRefresh}
          >
            <IconRefresh className={cn(`size-3.5`, refreshSpinning && `animate-spin`)} />
          </Button>
        </Tooltip>
      </div>
      <div className={`flex min-h-0 flex-1 flex-col`}>
        <StickyFolderList
          items={stickyRows}
          selectedPath={selectedPath}
          gitStatusByPath={treeData.gitStatusByPath}
          ignoredPathSet={treeData.ignoredPathSet}
          gitStatusLabelByStatus={gitStatusLabelByStatus}
          contextMenuLabels={contextMenuLabels}
          editorState={editorState}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          onSelect={setSelectedPath}
          onToggleDirectory={toggleDirectory}
          onRevealRow={revealStickyRow}
          onOpenPreview={openPreview}
          onOpenBrowserUrl={onOpenBrowserUrl}
          onKeyDown={handleRowKeyDown}
        />
        <div
          ref={scrollElementRef}
          className={`h-full min-h-0 overflow-auto px-1 px-2`}
          style={scrollContainerStyle}
        >
          <FileTreeVirtualList
            rootError={rootError}
            showInitialLoading={showInitialLoading}
            rows={visibleRows}
            virtualItems={virtualItems}
            totalSize={virtualizer.getTotalSize()}
            emptyTitle={intl.formatMessage({
              id: hasActiveFilter ? `workspaceFileTree.noResults` : `workspaceFileTree.empty`,
            })}
            stickyFolderPathSet={stickyFolderPathSet}
            workspaceTitle={workspaceTitle}
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            selectedPath={selectedPath}
            gitStatusByPath={treeData.gitStatusByPath}
            ignoredPathSet={treeData.ignoredPathSet}
            gitStatusLabelByStatus={gitStatusLabelByStatus}
            contextMenuLabels={contextMenuLabels}
            editorState={editorState}
            onSelect={setSelectedPath}
            onToggleDirectory={toggleDirectory}
            onOpenPreview={openPreview}
            onOpenBrowserUrl={onOpenBrowserUrl}
            onKeyDown={handleRowKeyDown}
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 3. 任务缓存助手（原 146778–146848；物理位于 B 段行范围，语义属 F01 任务列表域）
 * ==========================================================================*/

/* 任务态符号（F01 域 / 跨块，接口级声明；实现不在本批） */
interface TaskRecord {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}
interface TaskMembership {
  pinned: boolean;
  archived: boolean;
}
interface TaskWorkspaceState {
  taskListCache: TaskRecord[] | null;
  [key: string]: unknown;
}
interface TaskListStoreState {
  getWorkspaceState(workspacePath: string, workspaceIdentity?: string | null): TaskWorkspaceState;
  setTaskListCache(workspacePath: string, cache: TaskRecord[], workspaceIdentity?: string | null): void;
  upsertOptimisticTaskListItem(workspacePath: string, task: TaskRecord, workspaceIdentity?: string | null): void;
  removeTaskState(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
}
declare const taskListStore: { getState(): TaskListStoreState }; // 原 xe（跨块）
declare function taskStateOf(state: TaskWorkspaceState, taskId: string): unknown; // 原 ce（跨块）
declare function mergeTaskWithState(task: TaskRecord, state: unknown, meta: unknown): TaskRecord | null; // 原 pe（跨块）
declare const taskMetaStore: {
  getState(): {
    taskMetaByEntityKey: Record<string, unknown>;
  };
}; // 原 Vo（1553）
declare function notifyTaskMetaUpsert(task: TaskRecord): void; // 原 $ie（1889）
declare function notifyTaskMetaPreservingMembership(task: TaskRecord): void; // 原 eae（1892）
declare function applyTaskQueryCacheMutation(args: {
  previousTask: TaskRecord;
  nextTask: TaskRecord;
  previousState: TaskMembership;
  nextState?: TaskMembership;
}): void; // 原 Uo（1895）
declare function removeTaskAndNotify(args: { workspacePath: string; workspaceIdentity?: string | null; taskId: string }): void; // 原 rae（1914）

/** 原 iLt：默认任务归属（置顶且未归档） */
export const DEFAULT_TASK_MEMBERSHIP: TaskMembership = { pinned: true, archived: true };

/** 原 aLt：任务按更新时间倒序（并列退比创建时间、再退比 taskId） */
export function sortTasksByRecency(tasks: TaskRecord[]): TaskRecord[] {
  return [...tasks].sort((a, b) =>
    b.updatedAt === a.updatedAt
      ? b.createdAt === a.createdAt
        ? b.taskId.localeCompare(a.taskId)
        : b.createdAt - a.createdAt
      : b.updatedAt - a.updatedAt,
  );
}

/** 原 oLt：任务写入工作区缓存（乐观列表 + 元数据 + 查询缓存变更） */
export function upsertTaskInWorkspaceCache(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  task: TaskRecord;
  membership?: TaskMembership;
  forceInsertMembership?: boolean;
  preserveListMembership?: boolean;
  ensureInWorkspaceTaskCache?: boolean;
  applyQueryCacheMutation?: boolean;
}) {
  let store = taskListStore.getState(),
    workspaceState = store.getWorkspaceState(args.workspacePath, args.workspaceIdentity),
    previousTask = taskStateOf(workspaceState, args.task.taskId),
    meta =
      taskMetaStore.getState().taskMetaByEntityKey[
        taskEntityKey({
          taskId: args.task.taskId,
          workspacePath: args.workspacePath,
          workspaceIdentity: args.workspaceIdentity ?? args.task.workspaceIdentity,
        })
      ],
    nextTask = mergeTaskWithState(args.task, previousTask, meta) ?? args.task,
    cache = workspaceState.taskListCache ?? [],
    alreadyListed = cache.some((entry) => entry.taskId === nextTask.taskId),
    unpinnedUnarchived = args.membership?.pinned === false && args.membership.archived === false,
    nextCache = args.preserveListMembership
      ? cache.map((entry) => (entry.taskId === nextTask.taskId ? nextTask : entry))
      : unpinnedUnarchived
        ? sortTasksByRecency([nextTask, ...cache.filter((entry) => entry.taskId !== nextTask.taskId)])
        : cache.filter((entry) => entry.taskId !== nextTask.taskId);
  (workspaceState.taskListCache !== null &&
    ((args.preserveListMembership && alreadyListed) || args.ensureInWorkspaceTaskCache || alreadyListed || !unpinnedUnarchived) &&
    store.setTaskListCache(args.workspacePath, nextCache, args.workspaceIdentity),
    store.upsertOptimisticTaskListItem(args.workspacePath, nextTask, args.workspaceIdentity),
    notifyTaskMetaUpsert(nextTask),
    args.preserveListMembership
      ? notifyTaskMetaPreservingMembership(nextTask)
      : args.membership &&
        args.applyQueryCacheMutation !== false &&
        applyTaskQueryCacheMutation({
          previousTask: (previousTask ?? nextTask) as TaskRecord,
          nextTask,
          previousState: previousTask && !args.forceInsertMembership ? args.membership : DEFAULT_TASK_MEMBERSHIP,
          nextState: args.membership,
        }));
}

/** 原 sLt：删除归档任务后的状态清理 */
export function cleanupDeletedTaskState(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
}): void {
  let store = taskListStore.getState(),
    workspaceState = store.getWorkspaceState(args.workspacePath, args.workspaceIdentity);
  return (
    workspaceState.taskListCache &&
      store.setTaskListCache(
        args.workspacePath,
        workspaceState.taskListCache.filter((entry) => entry.taskId !== args.taskId),
        args.workspaceIdentity,
      ),
    store.removeTaskState(args.workspacePath, args.taskId, args.workspaceIdentity),
    removeTaskAndNotify(args)
  );
}

/** 原 cLt：工作区任务登记（强制插入归属，未置顶未归档时确保入缓存） */
export function registerWorkspaceTask(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  task: TaskRecord;
  membership: TaskMembership;
}) {
  upsertTaskInWorkspaceCache({
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    task: args.task,
    membership: args.membership,
    forceInsertMembership: true,
    ensureInWorkspaceTaskCache: args.membership.pinned === false && args.membership.archived === false,
  });
}

/* ============================================================================
 * 尾：符号表（混淆名 → 语义名 → 实测 js 行 / jsx 行，便于反查）
 * ----------------------------------------------------------------------------
 *  [模型层 50907–51197]
 *   AA GIT_STATUS_PRIORITY 50907/45684 | jA GIT_STATUS_BADGE_PRIORITY 50907/45684
 *   MA normalizePathSeparators 50909/45700 | NA normalizePathKey 50912/45703
 *   NVe gitStatusKeyOf 50915/45706 | PVe buildStatusByPath 50918/45709
 *   FVe isGitStatusAvailable 50928/45719 | PA statusForPath 50931/45722
 *   IVe normalizePathSet 50934/45725 | FA hasNormalizedPath 50937/45728
 *   IA isDeletedFileRow 50940/45731 | LA isRealDirectory 50943/45734
 *   RA descendantStatuses 50946/45737 | LVe mergeDeletedFileRows 50952/45743
 *   zA relativePathFromWorkspace 50967/45761★MI | BA samePath 50974/45768
 *   VA isPathWithinRoot 50977/45771 | RVe ancestorDirectoryPaths 50982/45776
 *   HA relativeDepthFromRoot 50997/45791 | UA parentDirectoryPathInRoot 51004/45798
 *   zVe normalizeSearchQuery 51014/45808 | BVe rowHasGitChange 51017/45811
 *   VVe filterTreeRows 51021/45815 | HVe flattenTreeRows 51035/45825
 *   UVe buildFilePreviewNode 51077/45874 | WA FILE_MANAGER_EDITOR_ORDER 51084/45888
 *   GA orderEditorsForFileManager 51085/45889 | WVe SSH_EDITOR_IDS 51092/45896
 *   GVe WSL_EDITOR_IDS 51092/45896 | KA wslFallbackEditor 51094/45898
 *   qA editorsByIds 51097/45901 | JA resolveAvailableEditors 51100/45904
 *   KVe isExplicitSelection 51109/45923 | YA toError 51112/45926
 *   XA toggledPathSet 51115/45929 | qVe isMacPlatform 51119/45933
 *   JVe isWindowsPlatform 51122/45936 | YVe revealInFileManagerLabel 51125/45939
 *   ZA isHtmlPreviewRow 51132/45948 | XVe browserUrlForRow 51135/45951
 *   ZVe revealPathForEntry 51138/45954 | QA useFileContextActions 51141/45957
 *   QVe resolveRemoteWorkspaceInfo 51198/46011★MI | $A useRemoteWorkspaceInfo 51214/46033★MI
 *  [树族 145213–146777]
 *   f8 FILE_TREE_ROW_HEIGHT 145213/121020 | jIt REFRESH_DIRECTORY_TIMEOUT_MS 145214/121020
 *   MIt REFRESH_GIT_TIMEOUT_MS 145215/121020 | NIt useInstalledEditors 145216/121023
 *   PIt loadGitStatusSnapshot 145241/121041 | FIt useDirectoryFileWatcher 145249/121051
 *   IIt collectRefreshTargetPaths 145312/121120 | LIt useFlattenedTreeRows 145323/121135
 *   RIt timeoutError 145346/121158 | zIt withTimeout 145349/121161
 *   BIt useWorkspaceFileTreeData 145364/121173 | VIt computeStickyFolderRows 145687/121465
 *   HIt useStickyFolderScroll 145717/121494 | p8 FileTreeEmptyState 145763/121534
 *   UIt gitStatusBadgeLetter 145778/121541 | WIt gitStatusTextColor 145794/121557
 *   GIt primaryGitStatus 145812/121575 | KIt gitStatusBadgeColor 145815/121581
 *   qIt gitStatusDotColor 145831/121597 | JIt HIERARCHY_GUIDE_BACKGROUND 145849/121615
 *   YIt hierarchyGuideStyle 145850/121616 | XIt useFileTreeDragState 145853/121622
 *   ZIt CompactPathName 145873/121635 | QIt FileTreeRow 145893/121643
 *   $It FileTreeVirtualList 146135/121795 | eLt StickyFolderList 146208/121847
 *   tLt depthOfPath 146283/121888 | nLt FileTreePanel 146286/121891
 *   rLt rootErrorIfNotLoaded 146775/122250
 *  [任务缓存 146778–146848]
 *   iLt DEFAULT_TASK_MEMBERSHIP 146778/122256 | aLt sortTasksByRecency 146779/122260
 *   oLt upsertTaskInWorkspaceCache 146788/122263 | sLt cleanupDeletedTaskState 146825/122284
 *   cLt registerWorkspaceTask 146839/122289
 *
 *  双归属/已覆盖注记：
 *   - m8/h8（146849/146859）= Sidebar.tsx RemoteSyncingRow/TaskListLoadingRow，不重复；
 *   - lLt/uLt/dLt/pLt/mLt（146869+）= F01 任务段族，Sidebar/SidebarLeaves 接口级挂接；
 *   - hLt/gLt/_Lt 头像原语 + vLt 起 Bots 常量（147700+）= X03/B5-04，排除只注记；
 *   - zA/QVe/$A = MarkdownIntegration.tsx 已实现（★MI），本文件 declare 挂接；
 *   - sLt↔SidebarLeaves、cLt↔SettingsPanelsCapability 为接口级双归属，本文件为实现方。
 * ============================================================================
 */
