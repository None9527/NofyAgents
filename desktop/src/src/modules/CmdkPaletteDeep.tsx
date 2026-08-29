/* ============================================================================
 * CmdkPaletteDeep.tsx — B5-07 段 B：zZ cmdk 弹层深部（F00 分支切换器深部）
 * ----------------------------------------------------------------------------
 * 主口径：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（本机 213,979 行副本）。
 * 旧报告口径（213,695 行副本）本区域行号偏移 +48：旧 96589–97700 → 本机 96637–97748。
 *
 * 混淆名 → 语义名（本机 js 行）：
 *  §1 分支切换助手群（95015–95168）：
 *   MZ  → resolveBranchDisplayLabel   (95015)
 *   bst → branchFilterMatches         (95020)
 *   xst → firstIssue                  (95024)
 *   Sst → isOverwriteIssueCode        (95027)
 *   Cst → issueErrorI18nKey           (95032)
 *   wst → successToastI18nKey         (95054)
 *   Tst → splitVisibleIssuePaths      (95061)
 *   NZ  → mapChangeFilesToRows        (95065；已随 GitReview.tsx 抽取，本件仅 declare)
 *   Est → summarizeFileRows           (95091；已随 GitReview.tsx 抽取，本件仅 declare)
 *   Dst → filesOfIssuePaths           (95097)
 *   Ost → checkpointCommitMessage     (95113)
 *   kst → formatShortList             (95119)
 *   PZ  → hasGitIdentity              (95124；已随 GitReview.tsx 抽取，本件仅 declare)
 *   Ast → buildSwitchAssistState      (95127)
 *  §2 jst → CreateBranchDialog        (95169)
 *  §3 Mst → SwitchAssistDialog        (95262)
 *  §4 提交图谱布局引擎（95567–95967）：
 *   FZ  → shortHash                   (95567) | Nst → refKindIcon (95570)
 *   Pst → formatAuthoredAt            (95573) | Fst → CommitDetailPanel (95583)
 *   Ist → MISSING_PARENT_ROW_INDEX    (95686) | Lst → GraphLine (95687)
 *   Rst → GraphVertex                 (95700) | zst → buildGraphVertices (95759)
 *   Bst → allocateColourIndex         (95772) | Vst → connectMergeParent (95776)
 *   Hst → walkBranchLine              (95796) | Ust → processVertex (95827)
 *   Wst → layoutCommitGraphBranches   (95840)
 *   Gst → GRAPH_ROW_HEIGHT=42 | Kst → GRAPH_LANE_GAP=18 | qst → GRAPH_LANE_PADDING=16
 *   Jst → GRAPH_TOP_PADDING=20 | Yst → GRAPH_BOTTOM_PADDING=18   (95853–95857)
 *   IZ  → curvePath                   (95858) | LZ → pointPixels (95865)
 *   Xst → buildEdgePath               (95868) | Zst → buildLaneSegmentPath (95878)
 *   Qst → buildTruncatedEdges         (95888) | $st → computeCommitGraphLayout (95912)
 *   ect → STROKE_CLASSES | tct → FILL_CLASSES | nct → DOT_RADIUS=4
 *   rct → DOT_SELECTED_RADIUS=4.25 | ict → DOT_SELECTED_RING_RADIUS=5.5
 *   act → LOAD_MORE_SCROLL_PX=96 | oct → GRAPH_MIN_COLUMN_PX=56   (95944–95955)
 *   sct → strokeClassOfLane (95956) | cct → fillClassOfLane (95959)
 *   lct → gridColumnsStyle (95962) | uct → edgeTouchesHash (95965)
 *  §5 dct → CommitGraphView           (95968)
 *  §6 RZ → GRAPH_PAGE_SIZE=50 (96282) | fct → CommitGraphDialog (96283)
 *  §7 pct → useGitBranchSwitcher      (96410)
 *
 * 边界裁决（详见 QuickPickCmdkMcp.report.md §B）：
 *  - zZ（96637–96942）本体已随 TopBar.tsx §5.6 GitBranchChip 语义重建，本件不重复转录；
 *    本件逐字物化 TopBar.tsx 以 declare 挂起的深部：useGitBranchSwitcher（pct）、
 *    resolveBranchDisplayLabel（MZ）、CreateBranchDialog（jst）、SwitchAssistDialog（Mst）、
 *    CommitGraphViewer（fct）及其深部（dct + 布局引擎 + §1 助手群）。
 *  - NZ/Est/PZ（95065/95091/95124）已随 GitReview.tsx 抽取（D8 B3），本件仅 declare。
 *  - mct 起点 96943 起的 Git 审查族段（本机 96943–98056 ≙ 旧 96895–98008）已随
 *    GitReview.tsx 抽取，本件止于 96942，仅注记。
 *  - cmdk 封装 Yb/Xb/Zb/Qb/$b/ex 与 Popover T/h/x、XH/ZH 仅被 zZ 本体使用；
 *    zZ 既已在 TopBar.tsx 物化，本件不再声明（见 TopBar.tsx 2706+ declare 组）。
 *
 * 把握度分级：§1–§7 = 高（逐字回代核验）；类型签名为推断（中），集成时以服务层为准。
 * ==========================================================================*/
/* eslint-disable */

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/cmdk/CmdkPaletteDeep.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  resolveBranchDisplayLabel,
  branchFilterMatches,
  firstIssue,
  isOverwriteIssueCode,
  issueErrorI18nKey,
  successToastI18nKey,
  splitVisibleIssuePaths,
  filesOfIssuePaths,
  checkpointCommitMessage,
  formatShortList,
  buildSwitchAssistState,
  CreateBranchDialog,
  SwitchAssistDialog,
  shortHash,
  RefKindIcon,
  formatAuthoredAt,
  CommitDetailPanel,
  MISSING_PARENT_ROW_INDEX,
  GraphLine,
  GraphVertex,
  buildGraphVertices,
  allocateColourIndex,
  connectMergeParent,
  walkBranchLine,
  processVertex,
  layoutCommitGraphBranches,
  GRAPH_ROW_HEIGHT,
  GRAPH_LANE_GAP,
  GRAPH_LANE_PADDING,
  GRAPH_TOP_PADDING,
  GRAPH_BOTTOM_PADDING,
  curvePath,
  pointPixels,
  buildEdgePath,
  buildLaneSegmentPath,
  buildTruncatedEdges,
  computeCommitGraphLayout,
  STROKE_CLASSES,
  FILL_CLASSES,
  DOT_RADIUS,
  DOT_SELECTED_RADIUS,
  DOT_SELECTED_RING_RADIUS,
  LOAD_MORE_SCROLL_PX,
  GRAPH_MIN_COLUMN_PX,
  strokeClassOfLane,
  fillClassOfLane,
  gridColumnsStyle,
  edgeTouchesHash,
  CommitGraphView,
  GRAPH_PAGE_SIZE,
  CommitGraphDialog,
  useGitBranchSwitcher,
} from '../components/cmdk/CmdkPaletteDeep';
export type {
  SwitchAssistState,
  CommitGraphRow,
  CommitGraphLayout,
  GitBranchSwitcherState,
} from '../components/cmdk/CmdkPaletteDeep';
