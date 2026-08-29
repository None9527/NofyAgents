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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/FileTreePanel.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  orderEditorsForFileManager,
  resolveAvailableEditors,
  useFileContextActions,
  FileTreePanel,
  DEFAULT_TASK_MEMBERSHIP,
  sortTasksByRecency,
  upsertTaskInWorkspaceCache,
  cleanupDeletedTaskState,
  registerWorkspaceTask,
} from '../components/code-viewer/FileTreePanel';
export type {
  InstalledEditor,
} from '../components/code-viewer/FileTreePanel';
