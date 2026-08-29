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
import * as React from "react";
import { GitBranch as IconGitBranch, Loader as IconLoader, CircleAlert as IconCircleAlert, Tag as IconTag, GitMerge as IconGitMerge, GitGraph as IconGitGraph, RefreshCw as IconRefreshCw } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { extractErrorMessage as errorMessageOf } from './FeedbackCenter'; // 原 MC（js 37651）：错误消息提取（剥 `Error:` 前缀）；AMBIGUOUS 裁决见 A0-D-Misc 报告
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb/Wb/Vb）
import { hasGitIdentity, mapChangeFilesToRows, summarizeFileRows, type GitFileChange, type GitIdentity } from './GitReview';
import { Input, Textarea, toast } from './ImeComposition';
import { FilePathInline } from './ModalsLeaves';
import { logger } from './SkillStore';
import { useServices } from './services';
/* ── A0-D-Misc 接线：可用属主（前波成果） ── */
import { cn } from './UtilsCn'; // 原 Z（clsx + tailwind-merge 的 cn）
import { useZCodeIntl as useIntlContext } from './I18n'; // 原 G（IntlProvider-C321H7m8.js 的 n 导出）
import { Button } from './button'; // 原 X（button-laUijeDG.js 的 t 导出）

/* --- 横切依赖（他族已抽取/登记，本件仅 declare） --- */

/** 原 J（logger-PFDwl5Yq.js 的 t 导出） */
/** 原 m（imeComposition chunk 的 _ 导出） */

/** Radix Dialog 封装族（原 zb/Hb/Ub/Gb/Kb/Wb/Vb，本 chunk js 31943+） */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/** 原 P（imeComposition chunk 的 y 导出） */
/** 原 j（imeComposition chunk 的 Textarea 导出） */

/* --- lucide 图标（原 Sa 工厂，js 26575–28020；语义名 = lucide 图标名） --- */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（7）：IconGitBranch/IconLoader/IconCircleAlert/IconTag/IconGitMerge/IconGitGraph/IconRefreshCw → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: React.FC<React.SVGProps<SVGSVGElement>>; // g（imeComposition b）

/** 文件路径内联组件（原 Bc，js 5157；图标 + 文件名 + 目录尾） */

/* --- Git 服务（原 fs，js 2638；接口按本族调用点推断） --- */

/* A0-D-Misc：原本地 GitIdentity/GitFileChange 接口删除，改自 GitReview 类型导入
 * （消费面 hasGitIdentity/mapChangeFilesToRows 均按 GitReview 形状契约）。 */
/** 原 NZ 的返回元素形（GitReview.tsx 的 CommitDialogFileRow） */
interface GitFileRow {
  stagePath: string;
  repoRelativePath: string;
  workspaceRelativePath: string;
  kind: string;
  added: number;
  removed: number;
}
interface GitBranchIssue {
  code: string;
  message: string;
  detail?: string | null;
  paths?: string[];
}
interface GitBranchSwitchSummary {
  branchName: string | null;
  headRefType: string;
}
interface GitBranchSwitchResult {
  ok: boolean;
  action: string;
  branchName: string | null;
  didChange: boolean;
  created?: boolean;
  summary: GitBranchSwitchSummary;
  issues: GitBranchIssue[];
}
interface GitBranchEntry {
  name: string;
  isCurrent: boolean;
}
interface GitBranchesResult {
  currentBranchName: string | null;
  headRefType: string;
  branches: GitBranchEntry[];
}
interface GitRef {
  name: string;
  kind: string; // head | tag | branch…
}
interface GitCommitGraphCommit {
  hash: string;
  parents: string[];
  subject: string;
  authorName: string;
  authoredAtMs: number | null;
  refs: GitRef[];
}
interface GitCommitGraphResult {
  commits: GitCommitGraphCommit[];
  hasMore: boolean;
}
interface GitService {
  getChanges(req: { workspacePath: string; sourceId: string }): Promise<GitFileChange[]>;
  getIdentity(req: { workspacePath: string }): Promise<GitIdentity | null>;
  getLocalBranches(req: { workspacePath: string }): Promise<GitBranchesResult>;
  switchBranch(req: { workspacePath: string; targetBranchName: string }): Promise<GitBranchSwitchResult>;
  createBranchAndSwitch(req: { workspacePath: string; branchName: string }): Promise<GitBranchSwitchResult>;
  stagePaths(req: { workspacePath: string; paths: string[] }): Promise<void>;
  commit(req: { workspacePath: string; message: string; paths?: string[]; stagedOnly?: boolean }): Promise<void>;
  getCommitGraph(req: { workspacePath: string; maxCount: number; skip: number }): Promise<GitCommitGraphResult>;
}

/** 原 NZ/Est/PZ（95065/95091/95124）：已随 GitReview.tsx 抽取，此处仅 declare */

/* ============================================================================
 * §1 分支切换助手群（原 95015–95168）
 * ==========================================================================*/

/** 原 MZ（95015）：detached 显示 detachedLabel；空分支名回退 fallbackLabel */
export function resolveBranchDisplayLabel(args: {
  headRefType: string;
  currentBranchName: string | null;
  detachedLabel: string;
  fallbackLabel: string;
}): string {
  if (args.headRefType === `detached`) return args.detachedLabel;
  const name = args.currentBranchName?.trim() ?? ``;
  return name.length > 0 ? name : args.fallbackLabel;
}
/** 原 bst（95020）：大小写不敏感子串过滤（空查询恒真） */
export function branchFilterMatches(branchName: string, query: string): boolean {
  const q = query.trim().toLocaleLowerCase();
  return q.length === 0 ? !0 : branchName.trim().toLocaleLowerCase().includes(q);
}
/** 原 xst（95024） */
export function firstIssue<T>(issues: T[]): T | null {
  return issues[0] ?? null;
}
/** 原 Sst（95027） */
export function isOverwriteIssueCode(code: string | undefined): boolean {
  return code === `tracked-changes-would-be-overwritten` || code === `untracked-changes-would-be-overwritten`;
}
/** 原 Cst（95032）：issue.code → i18n 键（未知返回 null） */
export function issueErrorI18nKey(issue: GitBranchIssue | null): string | null {
  switch (issue?.code) {
    case `invalid-branch-name`:
      return `git.branchSwitcher.error.invalidBranchName`;
    case `branch-already-exists`:
      return `git.branchSwitcher.error.branchAlreadyExists`;
    case `target-branch-not-found`:
      return `git.branchSwitcher.error.targetBranchNotFound`;
    case `tracked-changes-would-be-overwritten`:
      return `git.branchSwitcher.error.trackedOverwrite`;
    case `untracked-changes-would-be-overwritten`:
      return `git.branchSwitcher.error.untrackedOverwrite`;
    case `conflicts-present`:
      return `git.branchSwitcher.error.conflictsPresent`;
    case `operation-in-progress`:
      return `git.branchSwitcher.error.operationInProgress`;
    case `branch-in-other-worktree`:
      return `git.branchSwitcher.error.branchInOtherWorktree`;
    default:
      return null;
  }
}
/** 原 wst（95054）：成功 toast 键（无变化返回 null） */
export function successToastI18nKey(result: { didChange: boolean; action: string; created?: boolean }): string | null {
  return result.didChange
    ? result.action === `create-and-switch` || result.created
      ? `git.branchSwitcher.toast.createSuccess`
      : `git.branchSwitcher.toast.switchSuccess`
    : null;
}
/** 原 Tst（95061）：可见路径前 t 条 + 剩余计数 */
export function splitVisibleIssuePaths(paths: string[] | undefined, maxVisible = 2): { visiblePaths: string[]; remainingCount: number } {
  const nonEmpty = (paths ?? []).filter((path) => path.trim().length > 0);
  return { visiblePaths: nonEmpty.slice(0, maxVisible), remainingCount: Math.max(0, nonEmpty.length - maxVisible) };
}
/** 原 Dst（95097）：issue.paths → 文件行（缺失路径补零行） */
export function filesOfIssuePaths(args: { files: GitFileRow[]; issuePaths?: string[] }): GitFileRow[] {
  const byPath = new Map(args.files.map((file) => [file.repoRelativePath, file]));
  return (args.issuePaths ?? [])
    .filter((path) => path.trim().length > 0)
    .map(
      (path) =>
        byPath.get(path) ?? {
          stagePath: path,
          repoRelativePath: path,
          workspaceRelativePath: path,
          kind: `modified`,
          added: 0,
          removed: 0,
        },
    );
}
/** 原 Ost（95113）：提交并切换的缺省提交消息 */
export function checkpointCommitMessage(targetBranchName: string): string {
  const name = targetBranchName.trim();
  return name.length > 0
    ? `chore: checkpoint before switching to ${name}`
    : `chore: checkpoint before switching branches`;
}
/** 原 kst（95119）：短列表连接（空列表返回空串） */
export function formatShortList(locale: string, items: string[]): string {
  return items.length === 0 ? `` : new Intl.ListFormat(locale, { style: `short`, type: `conjunction` }).format(items);
}

/** §1/§3 共享：切换辅助态（原 Ast 返回形） */
export interface SwitchAssistState {
  targetBranchName: string;
  currentBranchName: string | null;
  issue: GitBranchIssue;
  affectedFiles: GitFileRow[];
  commitFiles: GitFileRow[];
  stagePaths: string[];
  fileCount: number;
  totalAdded: number;
  totalRemoved: number;
  identity: GitIdentity | null;
}
/** 原 Ast（95127）：阻塞类 issue → 拉取 unstaged/staged/identity 组装“提交并切换”辅助态 */
export async function buildSwitchAssistState(args: {
  gitService: GitService;
  workspacePath: string;
  result: GitBranchSwitchResult;
}): Promise<SwitchAssistState | null> {
  const issue = firstIssue(args.result.issues);
  if (!issue || !isOverwriteIssueCode(issue.code) || !args.result.branchName) return null;
  const [unstaged, staged, identity] = await Promise.allSettled([
    args.gitService.getChanges({ workspacePath: args.workspacePath, sourceId: `unstaged` }),
    args.gitService.getChanges({ workspacePath: args.workspacePath, sourceId: `staged` }),
    args.gitService.getIdentity({ workspacePath: args.workspacePath }),
  ]);
  (unstaged.status === `rejected` &&
    logger.warn(`[GitBranchSwitcher] 读取 unstaged 更改失败`, {
      workspacePath: args.workspacePath,
      error: errorMessageOf(unstaged.reason),
    }),
    staged.status === `rejected` &&
      logger.warn(`[GitBranchSwitcher] 读取 staged 更改失败`, {
        workspacePath: args.workspacePath,
        error: errorMessageOf(staged.reason),
      }),
    identity.status === `rejected` &&
      logger.warn(`[GitBranchSwitcher] 读取提交身份失败`, {
        workspacePath: args.workspacePath,
        error: errorMessageOf(identity.reason),
      }));
  const unstagedChanges = unstaged.status === `fulfilled` ? unstaged.value : [];
  const stagedChanges = staged.status === `fulfilled` ? staged.value : [];
  const commitFiles = mapChangeFilesToRows([...unstagedChanges, ...stagedChanges]);
  const affectedFiles = filesOfIssuePaths({ files: commitFiles, issuePaths: issue.paths });
  const stagePaths = Array.from(new Set([...commitFiles.map((file) => file.stagePath), ...(issue.paths ?? [])]));
  const { fileCount, totalAdded, totalRemoved } = summarizeFileRows(commitFiles);
  return {
    targetBranchName: args.result.branchName,
    currentBranchName: args.result.summary.branchName,
    issue,
    affectedFiles,
    commitFiles,
    stagePaths,
    fileCount,
    totalAdded,
    totalRemoved,
    identity: identity.status === `fulfilled` ? identity.value : null,
  };
}

/* ============================================================================
 * §2 CreateBranchDialog（原 jst，95169–95261）
 * ==========================================================================*/

export function CreateBranchDialog({
  open,
  branchName,
  mutationPending,
  onOpenChange,
  onBranchNameChange,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  branchName: string;
  mutationPending: boolean;
  onOpenChange: (open: boolean) => void;
  onBranchNameChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { intl } = useIntlContext();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg gap-0 rounded-2xl p-0 overflow-hidden`}>
        <DialogHeader className={`gap-2 px-6 py-5 pb-0`}>
          <DialogTitle className={`text-lg font-medium text-foreground`}>
            {intl.formatMessage({ id: `git.branchSwitcher.createDialog.title` })}
          </DialogTitle>
          <DialogDescription className={`text-ui-base leading-6 text-foreground-subtle`}>
            {intl.formatMessage({ id: `git.branchSwitcher.createDialog.description` })}
          </DialogDescription>
        </DialogHeader>
        <form
          className={`space-y-5 px-6 py-6`}
          onSubmit={(e) => {
            (e.preventDefault(), onSubmit());
          }}
        >
          <div className={`space-y-2`}>
            <label htmlFor={`git-branch-switcher-create-input`} className={`inline-flex text-ui-base font-medium text-foreground-subtle`}>
              {intl.formatMessage({ id: `git.branchSwitcher.createDialog.nameLabel` })}
            </label>
            <Input
              id={`git-branch-switcher-create-input`}
              size={`lg`}
              autoFocus={!0}
              value={branchName}
              disabled={mutationPending}
              placeholder={intl.formatMessage({ id: `git.branchSwitcher.createDialog.placeholder` })}
              className={`h-10 rounded-lg bg-background/50`}
              onChange={(e) => {
                onBranchNameChange(e.target.value);
              }}
            />
            <p className={`text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({ id: `git.branchSwitcher.createDialog.helper` })}
            </p>
          </div>
          <DialogFooter className={`gap-2 pt-4`}>
            <Button
              type={`button`}
              variant={`secondary`}
              size={`lg`}
              onClick={onCancel}
              disabled={mutationPending}
              className={`h-10 min-w-0 px-5`}
            >
              {intl.formatMessage({ id: `common.cancel` })}
            </Button>
            <Button
              type={`submit`}
              size={`lg`}
              disabled={mutationPending || branchName.trim().length === 0}
              className={`h-10 min-w-0 px-5`}
            >
              {mutationPending ? <IconLoader className={`size-4 animate-spin`} /> : null}
              {intl.formatMessage({ id: `git.branchSwitcher.createDialog.confirm` })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
 * §3 SwitchAssistDialog（原 Mst，95262–95566）：阻塞提示 / 提交并切换 两步
 * ==========================================================================*/

export function SwitchAssistDialog({
  step,
  state,
  currentBranchLabel,
  commitMessage,
  commitError,
  mutationPending,
  onClose,
  onOpenCommit,
  onCommitMessageChange,
  onSubmit,
}: {
  step: `blocked` | `commit` | null;
  state: SwitchAssistState | null;
  currentBranchLabel: string;
  commitMessage: string;
  commitError: string | null;
  mutationPending: boolean;
  onClose: () => void;
  onOpenCommit: () => void;
  onCommitMessageChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { intl, locale } = useIntlContext();
  const numberFormat = new Intl.NumberFormat(locale);
  const descriptionKey =
    state?.issue.code === `untracked-changes-would-be-overwritten`
      ? `git.branchSwitcher.blockedDialog.description.untracked`
      : `git.branchSwitcher.blockedDialog.description.tracked`;
  const identityUsable = hasGitIdentity(state?.identity ?? null);
  return (
    <Dialog
      open={!!(step && state)}
      onOpenChange={(open) => {
        open || onClose();
      }}
    >
      {step === `blocked` && state ? (
        <DialogContent className={`max-w-lg gap-0 rounded-2xl p-0 overflow-hidden`}>
          <DialogHeader className={`gap-2 px-6 py-5 pb-0`}>
            <DialogTitle className={`text-lg font-medium text-foreground`}>
              {intl.formatMessage({ id: `git.branchSwitcher.blockedDialog.title` })}
            </DialogTitle>
            <DialogDescription className={`text-ui-base leading-6 text-foreground-subtle`}>
              {intl.formatMessage({ id: descriptionKey })}
            </DialogDescription>
          </DialogHeader>
          <div className={`space-y-5 px-6 py-6`}>
            <div className={`flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3 text-ui-base text-warning`}>
              <IconCircleAlert className={`mt-0.5 size-4 shrink-0`} />
              <p>{intl.formatMessage({ id: `git.branchSwitcher.blockedDialog.helper` })}</p>
            </div>
            <div className={`rounded-xl bg-background/30`}>
              <div className={`flex items-center justify-between px-4 py-3`}>
                <div className={`text-ui-base font-medium text-foreground`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.blockedDialog.filesLabel` })}
                </div>
                <div className={`text-ui-base text-foreground-subtle`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.changesValue` }, { count: numberFormat.format(state.fileCount) })}
                </div>
              </div>
              <div className={`space-y-1 overflow-y-auto p-1 max-h-56 overflow-y-auto`}>
                {state.affectedFiles.map((file) => (
                  <div key={file.repoRelativePath} className={`flex items-start justify-between gap-4 h-10 rounded-lg bg-background/50 px-3 py-2`}>
                    <div className={`min-w-0 flex-1`}>
                      <FilePathInline
                        path={file.workspaceRelativePath}
                        options={{
                          className: `inline-flex min-w-0 max-w-full items-center gap-1.5`,
                          fileNameClassName: `truncate text-ui-base font-medium text-foreground`,
                        }}
                      />
                    </div>
                    <div className={`flex shrink-0 items-center gap-2 font-mono text-ui-base`}>
                      <span className={`text-diff-added`}>{[`+`, file.added]}</span>
                      <span className={`text-diff-removed`}>{[`-`, file.removed]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className={`gap-2 pt-4`}>
              <Button
                type={`button`}
                variant={`secondary`}
                size={`lg`}
                onClick={onClose}
                disabled={mutationPending}
                className={`h-10 min-w-0 px-5`}
              >
                {intl.formatMessage({ id: `common.cancel` })}
              </Button>
              <Button
                type={`button`}
                size={`lg`}
                onClick={onOpenCommit}
                disabled={mutationPending}
                className={`h-10 min-w-0 px-5`}
              >
                {intl.formatMessage({ id: `git.branchSwitcher.blockedDialog.submitAction` })}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      ) : null}
      {step === `commit` && state ? (
        <DialogContent className={`max-w-lg gap-0 rounded-2xl p-0 overflow-hidden`}>
          <DialogHeader className={`gap-2 px-6 py-5 pb-0`}>
            <DialogTitle className={`text-lg font-medium text-foreground`}>
              {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.title` })}
            </DialogTitle>
            <DialogDescription className={`text-ui-base leading-6 text-foreground-subtle`}>
              {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.description` }, { branchName: state.targetBranchName })}
            </DialogDescription>
          </DialogHeader>
          <form
            className={`space-y-5 px-6 py-6`}
            onSubmit={(e) => {
              (e.preventDefault(), onSubmit());
            }}
          >
            <div className={`rounded-xl bg-background/30`}>
              <div className={`flex items-start justify-between p-4`}>
                <div className={`text-ui-base font-medium text-foreground`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.currentBranchLabel` })}
                </div>
                <div className={`flex items-center gap-2 text-ui-base font-medium text-foreground`}>
                  <IconGitBranch className={`size-4 text-foreground-subtle`} />
                  <span>{currentBranchLabel}</span>
                </div>
              </div>
              <div className={`flex items-center justify-between gap-3 border-t border-border/50 p-4 text-ui-base`}>
                <div className={`text-ui-base font-medium text-foreground`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.changesLabel` })}
                </div>
                <div className={`flex gap-2`}>
                  <span className={`text-foreground-subtle`}>
                    {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.changesValue` }, { count: numberFormat.format(state.fileCount) })}
                  </span>
                  <span className={`text-diff-added font-mono`}>{[`+`, numberFormat.format(state.totalAdded)]}</span>
                  <span className={`text-diff-removed font-mono`}>{[`-`, numberFormat.format(state.totalRemoved)]}</span>
                </div>
              </div>
            </div>
            {identityUsable ? null : (
              <div className={`flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3 text-ui-base text-warning`}>
                <IconCircleAlert className={`mt-0.5 size-4 shrink-0`} />
                <p>{intl.formatMessage({ id: `git.branchSwitcher.commitDialog.identityMissing` })}</p>
              </div>
            )}
            <div>
              <div className={`space-y-2`}>
                <label htmlFor={`git-branch-switcher-commit-message`} className={`inline-flex text-ui-base font-medium text-foreground-subtle`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.messageLabel` })}
                </label>
                <Textarea
                  id={`git-branch-switcher-commit-message`}
                  value={commitMessage}
                  disabled={mutationPending}
                  placeholder={intl.formatMessage({ id: `git.branchSwitcher.commitDialog.messagePlaceholder` })}
                  className={`min-h-32 rounded-lg border-input-border bg-background/50 px-3 py-3 text-ui-base text-foreground placeholder:text-foreground-subtlest focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 md:text-ui-base`}
                  onChange={(e) => {
                    onCommitMessageChange(e.target.value);
                  }}
                />
                <p className={`text-ui-base text-foreground-subtle`}>
                  {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.messageHelper` })}
                </p>
              </div>
            </div>
            {commitError ? <p className={`text-ui-base text-destructive`}>{commitError}</p> : null}
            <DialogFooter className={`gap-2 pt-4`}>
              <Button
                type={`button`}
                variant={`secondary`}
                size={`lg`}
                onClick={onClose}
                disabled={mutationPending}
                className={`h-10 min-w-0 px-5`}
              >
                {intl.formatMessage({ id: `common.cancel` })}
              </Button>
              <Button
                type={`submit`}
                size={`lg`}
                disabled={mutationPending || (!identityUsable && state.identity !== null)}
                className={`h-10 min-w-0 px-5`}
              >
                {mutationPending ? <IconLoader className={`size-4 animate-spin`} /> : null}
                {intl.formatMessage({ id: `git.branchSwitcher.commitDialog.confirm` })}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

/* ============================================================================
 * §4 提交图谱布局引擎（原 95567–95967；gitgraph 风格顶点/泳道布线变体）
 * ==========================================================================*/

/** 原 FZ（95567）：hash 前 7 位 */
export function shortHash(hash: string): string {
  return hash.slice(0, 7);
}
/** 原 Nst（95570）：tag → 标签图标，其余分支图标 */
export function RefKindIcon({ ref, className = `size-3` }: { ref: GitRef; className?: string }) {
  return ref.kind === `tag` ? <IconTag className={className} /> : <IconGitBranch className={className} />;
}
/** 原 Pst（95583 内引用，95573）：月日时分本地化 */
export function formatAuthoredAt(authoredAtMs: number | null, locale: string): string {
  return authoredAtMs
    ? new Intl.DateTimeFormat(locale, {
        month: `2-digit`,
        day: `2-digit`,
        hour: `2-digit`,
        minute: `2-digit`,
      }).format(new Date(authoredAtMs))
    : ``;
}

/** 原 Fst（95583）：选中提交的详情条 */
export function CommitDetailPanel({ commit }: { commit: GitCommitGraphCommit }) {
  const { intl, locale } = useIntlContext();
  return (
    <div className={`border-t border-border bg-surface/45 px-3 py-3`}>
      <div className={`grid gap-3 text-ui-base text-foreground-subtle md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]`}>
        <div className={`min-w-0`}>
          <div className={`mb-1 text-ui-base font-medium text-foreground-subtle`}>
            {intl.formatMessage({ id: `gitGraph.detail.subject` })}
          </div>
          <div className={`break-words text-ui-base text-foreground`}>{commit.subject || shortHash(commit.hash)}</div>
          {commit.refs.length > 0 ? (
            <div className={`mt-2 flex min-w-0 flex-wrap gap-1`}>
              {commit.refs.map((ref) => (
                <span
                  key={`${commit.hash}:${ref.name}`}
                  className={cn(
                    `inline-flex h-5 min-w-0 items-center gap-1 rounded-md border border-border bg-surface px-1.5 text-ui-base text-foreground-subtle`,
                    ref.kind === `head` && `border-git-descendant bg-selected text-foreground`,
                    ref.kind === `tag` && `border-git-added`,
                  )}
                >
                  <RefKindIcon ref={ref} className={`size-2.5`} />
                  <span className={`max-w-48 truncate`}>{ref.name}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className={`grid min-w-0 grid-cols-2 gap-x-3 gap-y-2`}>
          <div className={`min-w-0`}>
            <div className={`text-foreground-subtlest`}>{intl.formatMessage({ id: `gitGraph.detail.commit` })}</div>
            <div className={`truncate font-mono text-foreground`}>{commit.hash}</div>
          </div>
          <div className={`min-w-0`}>
            <div className={`text-foreground-subtlest`}>{intl.formatMessage({ id: `gitGraph.detail.author` })}</div>
            <div className={`truncate text-foreground`}>{commit.authorName || `-`}</div>
          </div>
          <div className={`min-w-0`}>
            <div className={`text-foreground-subtlest`}>{intl.formatMessage({ id: `gitGraph.detail.date` })}</div>
            <div className={`truncate text-foreground`}>{formatAuthoredAt(commit.authoredAtMs, locale) || `-`}</div>
          </div>
          <div className={`min-w-0`}>
            <div className={`text-foreground-subtlest`}>{intl.formatMessage({ id: `gitGraph.detail.parents` })}</div>
            <div className={`truncate font-mono text-foreground`}>
              {commit.parents.length > 0 ? commit.parents.map(shortHash).join(`, `) : `-`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 Ist（95686）：缺失父提交的虚拟行号 */
export const MISSING_PARENT_ROW_INDEX = -1;

interface GraphPoint {
  laneIndex: number;
  rowIndex: number;
}
interface GraphLineSegment {
  from: GraphPoint;
  to: GraphPoint;
  laneIndex: number;
  sourceHash: string;
  targetHash: string;
  lockedFirst: boolean;
}

/** 原 Lst（95687）：一条泳道线（同色） */
export class GraphLine {
  colourIndex: number;
  lines: GraphLineSegment[] = [];
  endRowIndex = 0;
  constructor(colourIndex: number) {
    this.colourIndex = colourIndex;
  }
  addLine(from: GraphPoint, to: GraphPoint, sourceHash: string, targetHash: string, lockedFirst: boolean) {
    this.lines.push({
      from,
      to,
      laneIndex: this.colourIndex,
      sourceHash,
      targetHash,
      lockedFirst,
    });
  }
}

/** 原 Rst（95700）：提交顶点（父链/泳道/连接点簿记） */
export class GraphVertex {
  id: number;
  hash: string;
  parents: GraphVertex[] = [];
  nextParentIndex = 0;
  laneIndex: number | null = null;
  branch: GraphLine | null = null;
  nextLaneIndex = 0;
  connections: Array<{ target: GraphVertex; branch: GraphLine } | undefined> = [];
  constructor(id: number, hash: string) {
    ((this.id = id), (this.hash = hash));
  }
  addParent(parent: GraphVertex) {
    this.parents.push(parent);
  }
  getNextParent(): GraphVertex | null {
    return this.nextParentIndex < this.parents.length ? this.parents[this.nextParentIndex] : null;
  }
  registerParentProcessed() {
    this.nextParentIndex++;
  }
  isMerge(): boolean {
    return this.parents.length > 1;
  }
  isNotOnBranch(): boolean {
    return this.branch === null || this.laneIndex === null;
  }
  addToBranch(branch: GraphLine, laneIndex: number) {
    this.branch === null && ((this.branch = branch), (this.laneIndex = laneIndex));
  }
  getBranch(): GraphLine | null {
    return this.branch;
  }
  getLaneIndex(): number {
    return this.laneIndex ?? 0;
  }
  getPoint(): GraphPoint {
    return { laneIndex: this.getLaneIndex(), rowIndex: this.id };
  }
  getNextPoint(): GraphPoint {
    return { laneIndex: this.nextLaneIndex, rowIndex: this.id };
  }
  getPointConnectingTo(target: GraphVertex, branch: GraphLine | null): GraphPoint | null {
    const index = this.connections.findIndex((connection) => connection?.target === target && connection.branch === branch);
    return index >= 0 ? { laneIndex: index, rowIndex: this.id } : null;
  }
  reservePoint(laneIndex: number, target: GraphVertex, branch: GraphLine) {
    laneIndex === this.nextLaneIndex &&
      ((this.connections[laneIndex] = { target, branch }), (this.nextLaneIndex = laneIndex + 1));
  }
  getWidthLaneIndex(): number {
    return this.nextLaneIndex;
  }
}

/** 原 zst（95759）：提交列表 → 顶点 + 缺失父哨兵 */
export function buildGraphVertices(commits: GitCommitGraphCommit[]): {
  missingParent: GraphVertex;
  vertices: GraphVertex[];
  vertexByHash: Map<string, GraphVertex>;
} {
  const missingParent = new GraphVertex(MISSING_PARENT_ROW_INDEX, `__zcode_missing_parent__`);
  const vertices = commits.map((commit, index) => new GraphVertex(index, commit.hash));
  const vertexByHash = new Map(vertices.map((vertex) => [vertex.hash, vertex]));
  for (const [index, commit] of commits.entries()) {
    const vertex = vertices[index];
    for (const parentHash of commit.parents) {
      const parent = vertexByHash.get(parentHash) ?? missingParent;
      vertex.addParent(parent);
    }
  }
  return { missingParent, vertices, vertexByHash };
}
/** 原 Bst（95772）：复用最早空闲色槽，否则追加 */
export function allocateColourIndex(rowIndex: number, availableColours: number[]): number {
  const index = availableColours.findIndex((endRow) => rowIndex > endRow);
  return index >= 0 ? index : (availableColours.push(0), availableColours.length - 1);
}
/** 原 Vst（95776）：合并提交向已入泳道父节点的回连线 */
export function connectMergeParent(startRow: number, vertices: GraphVertex[], source: GraphVertex, target: GraphVertex) {
  const branch = target.getBranch()!;
  let from = source.getPoint();
  let connected = !1;
  for (let row = startRow + 1; row < vertices.length; row++) {
    const vertex = vertices[row];
    const connectingPoint = vertex.getPointConnectingTo(target, branch);
    const to = connectingPoint ?? vertex.getNextPoint();
    if (
      ((connected = connectingPoint !== null),
      branch.addLine(from, to, source.hash, target.hash, !connected && vertex !== target ? from.laneIndex < to.laneIndex : !0),
      vertex.reservePoint(to.laneIndex, target, branch),
      (from = to),
      connected)
    ) {
      source.registerParentProcessed();
      break;
    }
  }
}
/** 原 Hst（95796）：从起点向下走出一条分支线 */
export function walkBranchLine(args: {
  startAt: number;
  vertices: GraphVertex[];
  branches: GraphLine[];
  availableColours: number[];
  missingParent: GraphVertex;
}) {
  const { startAt, vertices, branches, availableColours, missingParent } = args;
  let source = vertices[startAt];
  let row = startAt;
  let parent = source.getNextParent();
  let from = source.isNotOnBranch() ? source.getNextPoint() : source.getPoint();
  const line = new GraphLine(allocateColourIndex(startAt, availableColours));
  for (
    source.addToBranch(line, from.laneIndex), source.reservePoint(from.laneIndex, source, line), row = startAt + 1;
    row < vertices.length && !(parent === null || parent === missingParent);
    row++
  ) {
    const vertex = vertices[row];
    const to = parent === vertex && !parent.isNotOnBranch() ? vertex.getPoint() : vertex.getNextPoint();
    if (
      (line.addLine(from, to, source.hash, parent.hash, from.laneIndex < to.laneIndex),
      vertex.reservePoint(to.laneIndex, parent, line),
      (from = to),
      parent === vertex)
    ) {
      source.registerParentProcessed();
      const alreadyOnBranch = !parent.isNotOnBranch();
      if ((parent.addToBranch(line, to.laneIndex), (source = parent), (parent = source.getNextParent()), parent === missingParent)) {
        source.registerParentProcessed();
        break;
      }
      if (parent === null || alreadyOnBranch) break;
    }
  }
  ((line.endRowIndex = row), branches.push(line), (availableColours[line.colourIndex] = row));
}
/** 原 Ust（95827）：单顶点分派（缺失父/合并回连/新分支线） */
export function processVertex(args: {
  startAt: number;
  vertices: GraphVertex[];
  branches: GraphLine[];
  availableColours: number[];
  missingParent: GraphVertex;
}) {
  const vertex = args.vertices[args.startAt];
  const parent = vertex.getNextParent();
  if (parent === args.missingParent) {
    vertex.registerParentProcessed();
    return;
  }
  if (parent !== null && vertex.isMerge() && !vertex.isNotOnBranch() && !parent.isNotOnBranch()) {
    connectMergeParent(args.startAt, args.vertices, vertex, parent);
    return;
  }
  walkBranchLine(args);
}
/** 原 Wst（95840）：全图布线 → 顶点 + 线段集 */
export function layoutCommitGraphBranches(commits: GitCommitGraphCommit[]): {
  vertices: GraphVertex[];
  vertexByHash: Map<string, GraphVertex>;
  branchLines: GraphLineSegment[];
} {
  const { missingParent, vertices, vertexByHash } = buildGraphVertices(commits);
  const branches: GraphLine[] = [];
  const availableColours: number[] = [];
  let row = 0;
  for (; row < vertices.length; ) {
    const vertex = vertices[row];
    vertex.getNextParent() !== null || vertex.isNotOnBranch()
      ? processVertex({ startAt: row, vertices, branches, availableColours, missingParent })
      : row++;
  }
  return { vertices, vertexByHash, branchLines: branches.flatMap((branch) => branch.lines) };
}

/** 原 Gst–Yst（95853–95857）：布局缺省几何 */
export const GRAPH_ROW_HEIGHT = 42;
export const GRAPH_LANE_GAP = 18;
export const GRAPH_LANE_PADDING = 16;
export const GRAPH_TOP_PADDING = 20;
export const GRAPH_BOTTOM_PADDING = 18;

/** 原 IZ（95858）：直线（同泳道）或三次贝塞尔（弯折 0.38×Δy，最小 14） */
export function curvePath(args: { fromX: number; fromY: number; toX: number; toY: number; lockedFirst: boolean }): string {
  const { fromX, fromY, toX, toY, lockedFirst } = args;
  if (fromX === toX) return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  const bend = Math.max(14, Math.abs(toY - fromY) * 0.38);
  return lockedFirst === !1
    ? [`M ${fromX} ${fromY}`, `C ${fromX} ${toY - bend}, ${toX} ${toY - bend}, ${toX} ${toY}`].join(` `)
    : [`M ${fromX} ${fromY}`, `C ${fromX} ${fromY + bend}, ${toX} ${fromY + bend}, ${toX} ${toY}`].join(` `);
}
interface PixelOptions {
  lanePadding: number;
  laneGap: number;
  topPadding: number;
  rowHeight: number;
}
/** 原 LZ（95865）：泳道/行 → 像素 */
export function pointPixels(point: GraphPoint, options: PixelOptions): { x: number; y: number } {
  return { x: options.lanePadding + point.laneIndex * options.laneGap, y: options.topPadding + point.rowIndex * options.rowHeight };
}
/** 原 Xst（95868）：整线 path（含关联 hash，供悬浮高亮） */
export function buildEdgePath(line: GraphLineSegment, index: number, options: PixelOptions): {
  id: string;
  laneIndex: number;
  path: string;
  relatedHashes: string[];
} {
  const from = pointPixels(line.from, options);
  const to = pointPixels(line.to, options);
  return {
    id: `${line.sourceHash}:${line.targetHash}:${line.from.rowIndex}:${line.to.rowIndex}:${index}:path`,
    laneIndex: line.laneIndex,
    path: curvePath({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y, lockedFirst: line.lockedFirst }),
    relatedHashes: line.sourceHash === line.targetHash ? [line.sourceHash] : [line.sourceHash, line.targetHash],
  };
}
/** 原 Zst（95878）：同泳道线段（供选中描边） */
export function buildLaneSegmentPath(line: GraphLineSegment, index: number, options: PixelOptions): {
  id: string;
  hash: string;
  laneIndex: number;
  path: string;
} {
  const from = pointPixels(line.from, options);
  const to = pointPixels(line.to, options);
  return {
    id: `${line.sourceHash}:${line.targetHash}:${line.from.rowIndex}:${line.to.rowIndex}:${index}:segment`,
    hash: line.targetHash,
    laneIndex: line.to.laneIndex,
    path: curvePath({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y, lockedFirst: line.lockedFirst }),
  };
}
/** 原 Qst（95888）：视口外父提交的截断边 */
export function buildTruncatedEdges(args: {
  commits: GitCommitGraphCommit[];
  rows: Array<{ commit: GitCommitGraphCommit; rowIndex: number; laneIndex: number; x: number; y: number }>;
  vertexByHash: Map<string, GraphVertex>;
  rowByHash: Map<string, { y: number }>;
  pixelOptions: PixelOptions;
}): Array<{
  id: string;
  fromHash: string;
  toHash: string;
  fromLaneIndex: number;
  toLaneIndex: number;
  path: string;
  truncated: boolean;
}> {
  const { commits, rows, vertexByHash, rowByHash, pixelOptions } = args;
  return commits.flatMap((commit, rowIndex) => {
    const vertex = vertexByHash.get(commit.hash)!;
    return commit.parents.map((parentHash, parentIndex) => {
      const parentVertex = vertexByHash.get(parentHash) ?? null;
      const fromLaneIndex = vertex.getLaneIndex();
      const toLaneIndex = parentVertex ? parentVertex.getLaneIndex() : fromLaneIndex + parentIndex;
      const row = rows[rowIndex];
      const parentRow = rowByHash.get(parentHash);
      const fromX = pixelOptions.lanePadding + fromLaneIndex * pixelOptions.laneGap;
      const toX = pixelOptions.lanePadding + toLaneIndex * pixelOptions.laneGap;
      return {
        id: `${commit.hash}:${parentHash}:${parentIndex}`,
        fromHash: commit.hash,
        toHash: parentHash,
        fromLaneIndex,
        toLaneIndex,
        path: curvePath({ fromX, fromY: row.y, toX, toY: parentRow?.y ?? row.y, lockedFirst: fromLaneIndex < toLaneIndex }),
        truncated: !parentRow,
      };
    });
  });
}

export interface CommitGraphRow {
  commit: GitCommitGraphCommit;
  rowIndex: number;
  laneIndex: number;
  x: number;
  y: number;
}
export interface CommitGraphLayout {
  rows: CommitGraphRow[];
  edges: ReturnType<typeof buildTruncatedEdges>;
  laneSegments: Array<{ id: string; hash: string; laneIndex: number; path: string }>;
  paths: Array<{ id: string; laneIndex: number; path: string; relatedHashes: string[] }>;
  laneCount: number;
  width: number;
  height: number;
  rowHeight: number;
  laneGap: number;
}
/** 原 $st（95912）：提交列表 → 完整像素布局 */
export function computeCommitGraphLayout(
  commits: GitCommitGraphCommit[],
  options: { rowHeight?: number; laneGap?: number; lanePadding?: number; topPadding?: number; bottomPadding?: number } = {},
): CommitGraphLayout {
  const rowHeight = options.rowHeight ?? GRAPH_ROW_HEIGHT;
  const laneGap = options.laneGap ?? GRAPH_LANE_GAP;
  const lanePadding = options.lanePadding ?? GRAPH_LANE_PADDING;
  const topPadding = options.topPadding ?? GRAPH_TOP_PADDING;
  const bottomPadding = options.bottomPadding ?? GRAPH_BOTTOM_PADDING;
  const { vertices, vertexByHash, branchLines } = layoutCommitGraphBranches(commits);
  const rows = vertices.map((vertex, rowIndex) => {
    const laneIndex = vertex.getLaneIndex();
    return { commit: commits[rowIndex], rowIndex, laneIndex, x: lanePadding + laneIndex * laneGap, y: topPadding + rowIndex * rowHeight };
  });
  const rowByHash = new Map(rows.map((row) => [row.commit.hash, row]));
  const maxRowLane = rows.reduce((max, row) => Math.max(max, row.laneIndex), 0);
  const maxWidthLane = vertices.reduce((max, vertex) => Math.max(max, vertex.getWidthLaneIndex() - 1), 0);
  const maxLineLane = branchLines.reduce((max, line) => Math.max(max, line.from.laneIndex, line.to.laneIndex), 0);
  const laneCount = Math.max(1, maxRowLane + 1, maxWidthLane + 1, maxLineLane + 1);
  const height = topPadding + Math.max(0, commits.length - 1) * rowHeight + bottomPadding;
  const width = lanePadding * 2 + (laneCount - 1) * laneGap;
  const pixelOptions = { lanePadding, laneGap, topPadding, rowHeight };
  const sameLaneLines = branchLines.filter((line) => line.from.laneIndex === line.to.laneIndex);
  return {
    rows,
    edges: buildTruncatedEdges({ commits, rows, vertexByHash, rowByHash, pixelOptions }),
    laneSegments: sameLaneLines.map((line, index) => buildLaneSegmentPath(line, index, pixelOptions)),
    paths: branchLines.map((line, index) => buildEdgePath(line, index, pixelOptions)),
    laneCount,
    width,
    height,
    rowHeight,
    laneGap,
  };
}

/** 原 ect/tct（95944–95950）：泳道色类（4 色循环） */
export const STROKE_CLASSES = [
  `stroke-git-descendant`,
  `stroke-git-renamed`,
  `stroke-git-added`,
  `stroke-git-modified`,
];
export const FILL_CLASSES = [`fill-git-descendant`, `fill-git-renamed`, `fill-git-added`, `fill-git-modified`];
/** 原 nct–oct（95951–95955）：节点半径 / 滚动加载阈值 / 图谱列最小宽 */
export const DOT_RADIUS = 4;
export const DOT_SELECTED_RADIUS = 4.25;
export const DOT_SELECTED_RING_RADIUS = 5.5;
export const LOAD_MORE_SCROLL_PX = 96;
export const GRAPH_MIN_COLUMN_PX = 56;
/** 原 sct（95956） */
export function strokeClassOfLane(laneIndex: number): string {
  return STROKE_CLASSES[laneIndex % STROKE_CLASSES.length];
}
/** 原 cct（95959） */
export function fillClassOfLane(laneIndex: number): string {
  return FILL_CLASSES[laneIndex % FILL_CLASSES.length];
}
/** 原 lct（95962）：描述/日期/作者/提交 四列栅格 */
export function gridColumnsStyle(): { gridTemplateColumns: string } {
  return { gridTemplateColumns: `minmax(260px,1fr) 128px 112px 84px` };
}
/** 原 uct（95965） */
export function edgeTouchesHash(edge: { relatedHashes: string[] }, hash: string | null): boolean {
  return !!(hash && edge.relatedHashes.includes(hash));
}

/* ============================================================================
 * §5 CommitGraphView（原 dct，95968–96281）
 * ==========================================================================*/

export function CommitGraphView({
  commits,
  hasMore = !1,
  loadingMore = !1,
  refreshing = !1,
  selectedCommitHash,
  onSelectCommit,
  onLoadMore,
  onRefresh,
}: {
  commits: GitCommitGraphCommit[];
  hasMore?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  selectedCommitHash: string | null;
  onSelectCommit: (hash: string) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
}) {
  const { intl, locale } = useIntlContext();
  const [hoveredCommitHash, setHoveredCommitHash] = React.useState<string | null>(null);
  const [detailCommitHash, setDetailCommitHash] = React.useState<string | null>(null);
  const layout = React.useMemo(() => computeCommitGraphLayout(commits), [commits]);
  const hoveredHash = hoveredCommitHash;
  const gridStyle = gridColumnsStyle();
  const svgWidth = Math.max(layout.width + 12, GRAPH_MIN_COLUMN_PX);
  const detailCommit = commits.find((commit) => commit.hash === detailCommitHash) ?? null;
  const handleScrollLoadMore = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore || loadingMore || !onLoadMore) return;
      const target = event.currentTarget;
      target.scrollHeight - target.scrollTop - target.clientHeight <= LOAD_MORE_SCROLL_PX && onLoadMore();
    },
    [hasMore, loadingMore, onLoadMore],
  );
  return (
    <section className={`flex h-full min-h-0 flex-col bg-background text-foreground`}>
      <div className={`border-b border-border bg-surface/40 px-3 py-2`}>
        <div className={`flex min-w-0 items-center justify-between gap-3`}>
          <div className={`min-w-0`}>
            <div className={`flex items-center gap-2`}>
              <IconGitGraph className={`size-3.5 text-foreground`} />
              <h2 className={`truncate text-ui-base font-medium`}>{intl.formatMessage({ id: `gitGraph.title` })}</h2>
            </div>
          </div>
          {onRefresh ? (
            <Button
              type={`button`}
              variant={`ghost`}
              size={`icon-sm`}
              disabled={refreshing}
              aria-label={intl.formatMessage({ id: `gitGraph.refresh` })}
              title={intl.formatMessage({ id: `gitGraph.refresh` })}
              className={`mr-8 text-foreground-subtle hover:text-foreground`}
              onClick={onRefresh}
            >
              <IconRefreshCw className={cn(`size-3.5`, refreshing && `animate-spin`)} />
            </Button>
          ) : null}
        </div>
      </div>
      {commits.length === 0 ? (
        <div className={`flex min-h-0 flex-1 items-center justify-center p-6`}>
          <div className={`max-w-sm text-center`}>
            <IconGitGraph className={`mx-auto size-8 text-foreground-subtlest`} />
            <p className={`mt-3 text-ui-base font-medium text-foreground`}>
              {intl.formatMessage({ id: `gitGraph.empty.title` })}
            </p>
            <p className={`mt-1 text-ui-base text-foreground-subtle`}>
              {intl.formatMessage({ id: `gitGraph.empty.description` })}
            </p>
          </div>
        </div>
      ) : (
        <div className={`min-h-0 flex-1 overflow-auto`} onScroll={handleScrollLoadMore}>
          <div className={`min-h-0 overflow-auto`}>
            <div
              className={`grid min-w-[760px]`}
              style={{
                gridTemplateColumns: `minmax(${GRAPH_MIN_COLUMN_PX}px, ${layout.width + 12}px) minmax(0, 1fr)`,
              }}
            >
              <div className={`border-b border-r border-border bg-surface/60 px-3 py-2 text-ui-base font-medium text-foreground-subtle`}>
                {intl.formatMessage({ id: `gitGraph.column.graph` })}
              </div>
              <div
                className={`grid border-b border-border bg-surface/60 text-ui-base font-medium text-foreground-subtle`}
                style={gridStyle}
              >
                <div className={`border-r border-border px-3 py-2`}>
                  {intl.formatMessage({ id: `gitGraph.column.description` })}
                </div>
                <div className={`border-r border-border px-3 py-2`}>
                  {intl.formatMessage({ id: `gitGraph.column.date` })}
                </div>
                <div className={`border-r border-border px-3 py-2`}>
                  {intl.formatMessage({ id: `gitGraph.column.author` })}
                </div>
                <div className={`px-3 py-2`}>{intl.formatMessage({ id: `gitGraph.column.commit` })}</div>
              </div>
              <div
                className={`relative border-r border-border bg-background-alt/35`}
                style={{ height: layout.height + layout.rowHeight }}
              >
                <svg
                  className={`absolute inset-0 overflow-visible`}
                  width={svgWidth}
                  height={layout.height + layout.rowHeight}
                  viewBox={`0 0 ${svgWidth} ${layout.height + layout.rowHeight}`}
                  role={`img`}
                  aria-label={intl.formatMessage({ id: `gitGraph.graphAriaLabel` })}
                >
                  {layout.paths.map((edge) => (
                    <path
                      key={edge.id}
                      d={edge.path}
                      className={cn(
                        `fill-none stroke-[2] opacity-55 transition-opacity`,
                        strokeClassOfLane(edge.laneIndex),
                        hoveredHash && !edgeTouchesHash(edge, hoveredHash) && `opacity-30`,
                        edgeTouchesHash(edge, hoveredHash) && `opacity-100`,
                      )}
                    />
                  ))}
                  {layout.rows.map((row) => {
                    const isSelected = row.commit.hash === selectedCommitHash;
                    const isHovered = row.commit.hash === hoveredCommitHash;
                    return (
                      <g key={row.commit.hash}>
                        <circle
                          cx={row.x}
                          cy={row.y}
                          r={isSelected ? DOT_SELECTED_RADIUS : DOT_RADIUS}
                          className={cn(
                            `stroke-background stroke-[2] transition-all`,
                            fillClassOfLane(row.laneIndex),
                            hoveredHash && !isSelected && !isHovered && `opacity-80`,
                          )}
                        />
                        {isSelected ? (
                          <circle
                            cx={row.x}
                            cy={row.y}
                            r={DOT_SELECTED_RING_RADIUS}
                            className={cn(`fill-none stroke-[1] opacity-85`, strokeClassOfLane(row.laneIndex))}
                          />
                        ) : null}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className={`min-w-0`}>
                {layout.rows.map((row) => {
                  const isSelected = row.commit.hash === selectedCommitHash;
                  const isHovered = row.commit.hash === hoveredCommitHash;
                  const authoredAt = formatAuthoredAt(row.commit.authoredAtMs, locale);
                  return (
                    <button
                      key={row.commit.hash}
                      type={`button`}
                      className={cn(
                        `grid w-full min-w-0 items-center border-y border-transparent text-left transition-colors`,
                        `hover:bg-hover focus-visible:bg-hover focus-visible:outline-none`,
                        isSelected && `border-b-border bg-selected`,
                        isSelected && row.rowIndex > 0 && `border-t-border`,
                        isHovered && !isSelected && `bg-surface-hover`,
                      )}
                      style={{ ...gridStyle, height: layout.rowHeight }}
                      onClick={() => {
                        (onSelectCommit(row.commit.hash),
                          setDetailCommitHash((previous) => (previous === row.commit.hash ? null : row.commit.hash)));
                      }}
                      onMouseEnter={() => setHoveredCommitHash(row.commit.hash)}
                      onMouseLeave={() => setHoveredCommitHash(null)}
                    >
                      <span className={`min-w-0 px-3`}>
                        <span className={`flex min-w-0 items-center gap-2`}>
                          {row.commit.refs.length > 0 ? (
                            <span className={`flex min-w-0 shrink-0 items-center gap-1 overflow-hidden`}>
                              {row.commit.refs.slice(0, 4).map((ref) => (
                                <span
                                  key={`${row.commit.hash}:${ref.name}`}
                                  className={cn(
                                    `inline-flex h-5 min-w-0 items-center gap-1 rounded-md border border-border bg-surface px-1.5 text-ui-base text-foreground-subtle`,
                                    ref.kind === `head` && `border-git-descendant bg-selected text-foreground`,
                                    ref.kind === `tag` && `border-git-added`,
                                  )}
                                >
                                  <RefKindIcon ref={ref} className={`size-2.5`} />
                                  <span className={`max-w-32 truncate`}>{ref.name}</span>
                                </span>
                              ))}
                            </span>
                          ) : null}
                          <span className={`truncate text-ui-base text-foreground`}>
                            {row.commit.subject || shortHash(row.commit.hash)}
                          </span>
                          {row.commit.parents.length > 1 ? (
                            <IconGitMerge className={`size-3 shrink-0 text-git-renamed`} />
                          ) : null}
                        </span>
                      </span>
                      <span
                        className={cn(
                          `truncate border-l border-transparent px-3 text-ui-base text-foreground-subtle`,
                          isSelected && `border-border`,
                        )}
                      >
                        {authoredAt}
                      </span>
                      <span
                        className={cn(
                          `truncate border-l border-transparent px-3 text-ui-base font-medium text-foreground-subtle`,
                          isSelected && `border-border`,
                        )}
                      >
                        {row.commit.authorName}
                      </span>
                      <span
                        className={cn(
                          `truncate border-l border-transparent px-3 font-mono text-ui-base text-foreground-subtle`,
                          isSelected && `border-border`,
                        )}
                      >
                        {shortHash(row.commit.hash)}
                      </span>
                    </button>
                  );
                })}
                {hasMore && onLoadMore ? (
                  <div className={`flex h-10 items-center border-b border-border px-3`}>
                    <Button
                      type={`button`}
                      variant={`outline`}
                      size={`sm`}
                      disabled={loadingMore}
                      className={`h-7 w-full text-ui-base sm:hidden`}
                      onClick={onLoadMore}
                    >
                      {loadingMore
                        ? intl.formatMessage({ id: `gitGraph.loadMore.loading` })
                        : intl.formatMessage({ id: `gitGraph.loadMore` })}
                    </Button>
                    <button
                      type={`button`}
                      disabled={loadingMore}
                      className={`hidden w-full rounded-md px-2 py-1 text-ui-base text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground disabled:cursor-default disabled:opacity-60 sm:block`}
                      onClick={onLoadMore}
                    >
                      {loadingMore
                        ? intl.formatMessage({ id: `gitGraph.loadMore.loading` })
                        : intl.formatMessage({ id: `gitGraph.loadMore` })}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      {detailCommit ? <CommitDetailPanel commit={detailCommit} /> : null}
    </section>
  );
}

/* ============================================================================
 * §6 CommitGraphDialog（原 RZ + fct，96282–96409）
 * ==========================================================================*/

/** 原 RZ（96282）：图谱分页大小 */
export const GRAPH_PAGE_SIZE = 50;

export function CommitGraphDialog({ open, workspacePath, onOpenChange }: { open: boolean; workspacePath: string; onOpenChange: (open: boolean) => void }) {
  const { gitService } = useServices() as unknown as { gitService: GitService } // A0-CLEANUP3 3b：ResolvedBaseServices 交集型与投射面不再直接可比，二段断言;
  const { intl } = useIntlContext();
  const [loading, setLoading] = React.useState(!1);
  const [loadingMore, setLoadingMore] = React.useState(!1);
  const [refreshing, setRefreshing] = React.useState(!1);
  const [error, setError] = React.useState<string | null>(null);
  const [commits, setCommits] = React.useState<GitCommitGraphCommit[]>([]);
  const [hasMore, setHasMore] = React.useState(!1);
  const [selectedCommitHash, setSelectedCommitHash] = React.useState<string | null>(null);
  const loadingMoreRef = React.useRef(!1);
  const resetState = React.useCallback(() => {
    (setLoading(!1), setLoadingMore(!1), setRefreshing(!1), (loadingMoreRef.current = !1), setError(null));
  }, []);
  const loadInitial = React.useCallback(async () => {
    (setLoading(!0), setRefreshing(!1), setLoadingMore(!1), (loadingMoreRef.current = !1), setError(null), setCommits([]), setHasMore(!1), setSelectedCommitHash(null));
    try {
      const result = await gitService.getCommitGraph({ workspacePath, maxCount: GRAPH_PAGE_SIZE, skip: 0 });
      (setCommits(result.commits), setHasMore(result.hasMore), setSelectedCommitHash(result.commits[0]?.hash ?? null));
    } catch (requestError) {
      const message = errorMessageOf(requestError);
      (logger.warn(`[GitGraphDialog] 读取 Git Graph 失败`, { workspacePath, error: message }),
        setError(intl.formatMessage({ id: `gitGraph.error.requestFailed` }, { error: message })));
    } finally {
      setLoading(!1);
    }
  }, [gitService, intl, workspacePath]);
  React.useEffect(() => {
    open && loadInitial();
  }, [loadInitial, open]);
  const refreshGraph = React.useCallback(async () => {
    if (!(loading || loadingMore || refreshing)) {
      (setRefreshing(!0), setError(null));
      try {
        const result = await gitService.getCommitGraph({ workspacePath, maxCount: GRAPH_PAGE_SIZE, skip: 0 });
        (setCommits(result.commits), setHasMore(result.hasMore), setSelectedCommitHash(result.commits[0]?.hash ?? null));
      } catch (requestError) {
        const message = errorMessageOf(requestError);
        (logger.warn(`[GitGraphDialog] 刷新 Git Graph 失败`, { workspacePath, error: message }),
          toast(intl.formatMessage({ id: `gitGraph.refreshFailed` }, { error: message })));
      } finally {
        setRefreshing(!1);
      }
    }
  }, [gitService, intl, loading, loadingMore, refreshing, workspacePath]);
  const loadMore = React.useCallback(async () => {
    if (!(loading || loadingMore || refreshing || loadingMoreRef.current || !hasMore)) {
      ((loadingMoreRef.current = !0), setLoadingMore(!0), setError(null));
      try {
        const result = await gitService.getCommitGraph({ workspacePath, maxCount: GRAPH_PAGE_SIZE, skip: commits.length });
        (setCommits((previous) => [...previous, ...result.commits]), setHasMore(result.hasMore));
      } catch (requestError) {
        const message = errorMessageOf(requestError);
        (logger.warn(`[GitGraphDialog] 读取更多 Git Graph 失败`, {
          workspacePath,
          loadedCommitCount: commits.length,
          error: message,
        }),
          setError(intl.formatMessage({ id: `gitGraph.error.requestFailed` }, { error: message })));
      } finally {
        ((loadingMoreRef.current = !1), setLoadingMore(!1));
      }
    }
  }, [commits.length, gitService, hasMore, intl, loading, loadingMore, refreshing, workspacePath]);
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        (nextOpen || resetState(), onOpenChange(nextOpen));
      }}
    >
      <DialogContent showCloseButton={!1} className={`h-[min(78vh,720px)] max-w-5xl gap-0 overflow-hidden rounded-2xl p-0`}>
        <DialogHeader className={`sr-only`}>
          <DialogTitle>{intl.formatMessage({ id: `gitGraph.title` })}</DialogTitle>
          <DialogDescription>{intl.formatMessage({ id: `gitGraph.dialogDescription` })}</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-sm`}
            aria-label={intl.formatMessage({ id: `common.close` })}
            className={`absolute right-2 top-2 z-30 bg-background/80 text-foreground-subtle hover:bg-hover hover:text-foreground [app-region:no-drag]`}
          >
            <IconX className={`size-3.5`} />
          </Button>
        </DialogClose>
        {loading ? (
          <div className={`flex h-full items-center justify-center bg-background text-foreground-subtle`}>
            <IconLoader className={`size-5 animate-spin`} />
          </div>
        ) : error ? (
          <div className={`flex h-full items-center justify-center bg-background p-6`}>
            <div className={`max-w-md rounded-xl border border-border bg-card p-4 text-ui-base text-foreground`}>
              <div className={`flex items-start gap-3`}>
                <IconCircleAlert className={`mt-0.5 size-4 shrink-0 text-warning`} />
                <p className={`break-words text-foreground-subtle`}>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <CommitGraphView
            commits={commits}
            hasMore={hasMore}
            loadingMore={loadingMore}
            refreshing={refreshing}
            selectedCommitHash={selectedCommitHash}
            onSelectCommit={setSelectedCommitHash}
            onLoadMore={loadMore}
            onRefresh={refreshGraph}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
 * §7 useGitBranchSwitcher（原 pct，96410–96636）
 * ==========================================================================*/

export interface GitBranchSwitcherState {
  open: boolean;
  setOpen: (open: boolean) => void;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  createBranchName: string;
  setCreateBranchName: (value: string) => void;
  commitMessage: string;
  setCommitMessage: (value: string) => void;
  commitError: string | null;
  switchAssistStep: `blocked` | `commit` | null;
  switchAssistState: SwitchAssistState | null;
  branchesResult: GitBranchesResult | null;
  loadingBranches: boolean;
  mutationPending: boolean;
  switchBranch: (targetBranchName: string) => Promise<void>;
  createBranchAndSwitch: () => Promise<void>;
  openSwitchCommitDialog: () => void;
  closeSwitchAssistDialog: () => void;
  commitAndSwitchBranch: () => Promise<void>;
}

export function useGitBranchSwitcher({
  workspacePath,
  currentBranchName,
  headRefType,
  onRefreshGit,
}: {
  workspacePath: string;
  currentBranchName: string | null;
  headRefType: string;
  onRefreshGit: () => void;
}): GitBranchSwitcherState {
  const { gitService } = useServices() as unknown as { gitService: GitService } // A0-CLEANUP3 3b：ResolvedBaseServices 交集型与投射面不再直接可比，二段断言;
  const { intl, locale } = useIntlContext();
  const numberFormat = new Intl.NumberFormat(locale);
  const [open, setOpen] = React.useState(!1);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(!1);
  const [createBranchName, setCreateBranchName] = React.useState(``);
  const [commitMessage, setCommitMessage] = React.useState(``);
  const [commitError, setCommitError] = React.useState<string | null>(null);
  const [switchAssistStep, setSwitchAssistStep] = React.useState<`blocked` | `commit` | null>(null);
  const [switchAssistState, setSwitchAssistState] = React.useState<SwitchAssistState | null>(null);
  const [branchesResult, setBranchesResult] = React.useState<GitBranchesResult | null>(null);
  const [loadingBranches, setLoadingBranches] = React.useState(!1);
  const [mutationPending, setMutationPending] = React.useState(!1);
  const resetSwitchAssist = React.useCallback(() => {
    (setSwitchAssistStep(null), setSwitchAssistState(null), setCommitMessage(``), setCommitError(null));
  }, []);
  const loadBranches = React.useCallback(async () => {
    setLoadingBranches(!0);
    try {
      setBranchesResult(await gitService.getLocalBranches({ workspacePath }));
    } catch (requestError) {
      const message = errorMessageOf(requestError);
      (logger.warn(`[GitBranchSwitcher] 读取本地分支失败`, { workspacePath, error: message }),
        toast(intl.formatMessage({ id: `git.branchSwitcher.error.requestFailed` }, { error: message })));
    } finally {
      setLoadingBranches(!1);
    }
  }, [gitService, intl, workspacePath]);
  React.useEffect(() => {
    (setOpen(!1), setCreateDialogOpen(!1), setCreateBranchName(``), setBranchesResult(null), resetSwitchAssist());
  }, [resetSwitchAssist, workspacePath]);
  const openRef = React.useRef(open);
  ((openRef.current = open),
    React.useEffect(() => {
      openRef.current || setBranchesResult(null);
    }, [currentBranchName, headRefType]),
    React.useEffect(() => {
      open && loadBranches();
    }, [loadBranches, open]));
  const reportMutationIssues = React.useCallback(
    (result: GitBranchSwitchResult) => {
      const issue = firstIssue(result.issues);
      const i18nKey = issueErrorI18nKey(issue);
      if (!issue) {
        toast(intl.formatMessage({ id: `git.branchSwitcher.error.unknown` }));
        return;
      }
      if (i18nKey) {
        const { visiblePaths, remainingCount } = splitVisibleIssuePaths(issue.paths);
        const extraPaths =
          remainingCount > 0
            ? intl.formatMessage({ id: `git.branchSwitcher.error.moreFiles` }, { count: numberFormat.format(remainingCount) })
            : ``;
        toast(
          intl.formatMessage(
            { id: i18nKey },
            { branchName: issue.detail ?? result.branchName ?? ``, paths: formatShortList(locale, visiblePaths), extraPaths },
          ),
        );
        return;
      }
      const detail = issue.detail?.trim() || issue.message.trim();
      toast(detail.length > 0 ? detail : intl.formatMessage({ id: `git.branchSwitcher.error.unknown` }));
    },
    [intl, locale, numberFormat],
  );
  const tryOpenBlockedAssist = React.useCallback(
    async (result: GitBranchSwitchResult) => {
      const assistState = await buildSwitchAssistState({ gitService, workspacePath, result });
      return assistState
        ? (setOpen(!1), setCreateDialogOpen(!1), setCommitError(null), setCommitMessage(``), setSwitchAssistState(assistState), setSwitchAssistStep(`blocked`), !0)
        : !1;
    },
    [gitService, workspacePath],
  );
  const applyMutationResult = React.useCallback(
    async (result: GitBranchSwitchResult, actionLabel: string) => {
      if (!result.ok) {
        if (
          (logger.warn(`[GitBranchSwitcher] 分支变更被阻塞`, {
            workspacePath,
            action: result.action,
            branchName: result.branchName,
            issues: result.issues.map((issue) => issue.code),
          }),
          await tryOpenBlockedAssist(result))
        )
          return;
        reportMutationIssues(result);
        return;
      }
      const toastKey = successToastI18nKey(result);
      (toastKey && result.branchName && toast(intl.formatMessage({ id: toastKey }, { branchName: result.branchName })),
        logger.info(`[GitBranchSwitcher] ${actionLabel}成功`, {
          workspacePath,
          branchName: result.branchName,
          action: result.action,
          didChange: result.didChange,
          created: result.created,
        }),
        setOpen(!1),
        setCreateDialogOpen(!1),
        setCreateBranchName(``),
        resetSwitchAssist(),
        setBranchesResult(
          (previous) =>
            previous && {
              ...previous,
              currentBranchName: result.summary.branchName,
              headRefType: result.summary.headRefType,
              branches: previous.branches.map((branch) => ({
                ...branch,
                isCurrent: result.summary.branchName !== null && branch.name === result.summary.branchName,
              })),
            },
        ),
        (result.didChange || result.created) && onRefreshGit());
    },
    [intl, reportMutationIssues, onRefreshGit, tryOpenBlockedAssist, resetSwitchAssist, workspacePath],
  );
  return {
    open,
    setOpen,
    createDialogOpen,
    setCreateDialogOpen,
    createBranchName,
    setCreateBranchName,
    commitMessage,
    setCommitMessage,
    commitError,
    switchAssistStep,
    switchAssistState,
    branchesResult,
    loadingBranches,
    mutationPending,
    switchBranch: React.useCallback(
      async (targetBranchName: string) => {
        (setOpen(!1), setMutationPending(!0));
        try {
          await applyMutationResult(await gitService.switchBranch({ workspacePath, targetBranchName }), `切换分支`);
        } catch (requestError) {
          const message = errorMessageOf(requestError);
          (logger.warn(`[GitBranchSwitcher] 切换分支请求失败`, {
            workspacePath,
            targetBranchName,
            error: message,
          }),
            toast(intl.formatMessage({ id: `git.branchSwitcher.error.requestFailed` }, { error: message })));
        } finally {
          setMutationPending(!1);
        }
      },
      [gitService, applyMutationResult, intl, workspacePath],
    ),
    createBranchAndSwitch: React.useCallback(async () => {
      const branchName = createBranchName.trim();
      if (branchName.length === 0) {
        toast(intl.formatMessage({ id: `git.branchSwitcher.error.invalidBranchName` }));
        return;
      }
      setMutationPending(!0);
      try {
        await applyMutationResult(await gitService.createBranchAndSwitch({ workspacePath, branchName }), `创建并切换分支`);
      } catch (requestError) {
        const message = errorMessageOf(requestError);
        (logger.warn(`[GitBranchSwitcher] 创建并切换分支请求失败`, {
          workspacePath,
          branchName,
          error: message,
        }),
          toast(intl.formatMessage({ id: `git.branchSwitcher.error.requestFailed` }, { error: message })));
      } finally {
        setMutationPending(!1);
      }
    }, [createBranchName, gitService, applyMutationResult, intl, workspacePath]),
    openSwitchCommitDialog: React.useCallback(() => {
      (setCommitError(null), setSwitchAssistStep(`commit`));
    }, []),
    closeSwitchAssistDialog: React.useCallback(() => {
      resetSwitchAssist();
    }, [resetSwitchAssist]),
    commitAndSwitchBranch: React.useCallback(async () => {
      if (!switchAssistState) return;
      if (!hasGitIdentity(switchAssistState.identity)) {
        setCommitError(intl.formatMessage({ id: `git.branchSwitcher.commitDialog.identityMissing` }));
        return;
      }
      const message = commitMessage.trim() || checkpointCommitMessage(switchAssistState.targetBranchName);
      (setCommitError(null), setMutationPending(!0));
      try {
        (logger.info(`[GitBranchSwitcher] 开始提交并重试切换分支`, {
          workspacePath,
          targetBranchName: switchAssistState.targetBranchName,
          stagedPathCount: switchAssistState.stagePaths.length,
        }),
          switchAssistState.stagePaths.length > 0 &&
            (await gitService.stagePaths({ workspacePath, paths: switchAssistState.stagePaths })),
          await gitService.commit({ workspacePath, message }),
          onRefreshGit(),
          await applyMutationResult(
            await gitService.switchBranch({ workspacePath, targetBranchName: switchAssistState.targetBranchName }),
            `提交后切换分支`,
          ));
      } catch (requestError) {
        const errorMessage = errorMessageOf(requestError);
        (logger.warn(`[GitBranchSwitcher] 提交并切换分支失败`, {
          workspacePath,
          targetBranchName: switchAssistState.targetBranchName,
          error: errorMessage,
        }),
          setCommitError(
            intl.formatMessage({ id: `git.branchSwitcher.commitDialog.error.requestFailed` }, { error: errorMessage }),
          ));
      } finally {
        setMutationPending(!1);
      }
    }, [commitMessage, gitService, applyMutationResult, intl, onRefreshGit, switchAssistState, workspacePath]),
  };
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 本机 js 行；旧口径行 = 本机行 − 48）
 * ============================================================================
 *  §1：MZ 95015 | bst 95020 | xst 95024 | Sst 95027 | Cst 95032 | wst 95054
 *   Tst 95061 | NZ 95065（GitReview）| Est 95091（GitReview）| Dst 95097
 *   Ost 95113 | kst 95119 | PZ 95124（GitReview）| Ast 95127
 *  §2：jst 95169
 *  §3：Mst 95262
 *  §4：FZ 95567 | Nst 95570 | Pst 95573 | Fst 95583 | Ist 95686 | Lst 95687
 *   Rst 95700 | zst 95759 | Bst 95772 | Vst 95776 | Hst 95796 | Ust 95827
 *   Wst 95840 | Gst 95853 | Kst 95854 | qst 95855 | Jst 95856 | Yst 95857
 *   IZ 95858 | LZ 95865 | Xst 95868 | Zst 95878 | Qst 95888 | $st 95912
 *   ect 95944 | tct 95949 | nct 95951 | rct 95952 | ict 95953 | act 95954
 *   oct 95955 | sct 95956 | cct 95959 | lct 95962 | uct 95965
 *  §5：dct 95968
 *  §6：RZ 96282 | fct 96283
 *  §7：pct 96410
 *  （zZ 96637：TopBar.tsx §5.6 已物化；mct 96943+：GitReview.tsx 已物化）
 * ============================================================================
 */
