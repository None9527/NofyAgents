// A0-S4-4c: 自 modules/GitReview.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/code-viewer/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * GitReview.tsx — ZCode 3.7.6 Git 审查族（解混淆重建 · D8 Stage B3）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族覆盖（任务对象）：
 *   A. 审查 pane 主体        —— BWt GitChangesPanel + NWt 变更行 + 查找/虚拟列表（侧面板「审查」标签）
 *   B. useTaskFileActions    —— C6（TopBar.tsx 曾保留接口，此处完整还原）
 *   C. FileRewindDialog      —— b_t 撤销对话框（安全/不安全/忽略 三段文件选择器 + 锚点卡片 dim/禁用态）
 *   D. 代码评论消费面        —— FH CodeCommentsStore + 行内评论→回流对话 全链路
 *   E. Git 工具 mini 浮卡    —— 状态面板「Git 工具」段（chat.statusPanel.environment）：
 *                                mlt 段 + Rct GitActionMenu + Ict 提交对话框 + Lct 推送对话框
 *                                （zZ GitBranchChip 已在 TopBar.tsx 抽取，本文件仅引用，勿重复）
 *   F. Git 状态层            —— nge useGitRepository + 数据集/来源助手（审查 pane 的数据源）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  A. 审查 pane（侧面板 git 标签内容）：
 *   BWt  → GitChangesPanel            审查 pane 主体 (178837)
 *   NWt  → GitChangeRow               单文件变更行（粘性头+上下文菜单+diff 三态渲染）(178625)
 *   PWt  → PlainTextDiffPreview       纯文本 diff 轻量预览 (178795)
 *   LWt  → computeFileChangeFindMatches 变更内容查找（全文件匹配序列）(178817)
 *   IWt  → countOccurrences           (178805)
 *   FWt  → normalizeFindQuery         (178802)
 *   TWt  → resolveGitSourceI18nId     来源 → git.source.* (178552)
 *   EWt  → resolveDiffUnavailableI18nId (178566)
 *   y5   → diffCacheKey               `${sourceId}:${path}` (178576)
 *   DWt  → extractErrorMessage        (178579)
 *   OWt  → countTextLines             (178587)
 *   kWt  → isDiffTooLargeForRichRendering（>180KB 或 >1200 行）(178594)
 *   AWt  → resolveDiffRenderMode      rich / plain-text / patch (178601)
 *   jWt  → tryExtractPlainTextDiffLines (178609)
 *   MWt  → findDiffHeaderPath         (178617)
 *   CWt/wWt → DIFF_RICH_CONTENT_CHAR_LIMIT=180000 / DIFF_RICH_LINE_LIMIT=1200 (178296)
 *   RWt/zWt → GIT_CHANGE_ROW_ESTIMATE_PX=32 / GIT_CHANGE_LIST_OVERSCAN=14 (178581)
 *
 *  B. 任务文件动作：
 *   C6   → useTaskFileActions         会话文件/日志/供应商配置 路径+复制+打开 (142085)
 *   rFt  → isMacUserAgent             (142187)
 *   iFt  → isWindowsUserAgent         (142190)
 *   aFt  → resolveFileManagerLabel    finder/explorer/file-manager 三态 (142193)
 *   nFt  → resolveProviderConfigOpenPath（不存在时退到父目录）(142076)
 *
 *  C. 文件撤销（rewind）：
 *   b_t  → FileRewindDialog           撤销确认对话框（fileRewind / editConflict 双变体）(110680)
 *   f1   → RewindDialogFileList       三段文件列表（路径 + 原因/修改次数）(110647)
 *   y_t  → formatRewindSkipReason     reason → rewindDialog.reason.* (110635)
 *   x_t  → buildUnifiedPatch          hunks → unified patch 文本 (110833)
 *   p1   → openFileChangePatchInCodeViewer（「审查」按钮落点）(110841)
 *   （调用方 S_t TurnFileChangesSummary js 110813 / jsx 94679 已在 Conversation.tsx 逐字抽取，
 *     本文件保留 b_t 所需的 FileChangeContext 接口；锚点 dim = reverted 徽章 + 撤销按钮禁用，见注释）
 *
 *  D. 代码评论（FH 消费面：行内评论 → 回流对话）：
 *   FH   → useCodeCommentsStore       commentsByBucketKey 行级评论 store (68562)
 *   TH   → CodeCommentsChip           「N 条评论」chip + 悬停列表 + 逐条移除 (68298；A1-R22 降 re-export → Composer 逐字 canonical)
 *   hXe  → codeCommentContextKey      (68295；A1-R22 降 re-export → Composer KH 68857 同身)
 *   EH   → CODE_COMMENT_ADD_TO_CHAT_EVENT = `zcode:code-comment-add-to-chat` (68411)
 *   DH   → CODE_COMMENT_REMOVE_FROM_CHAT_EVENT = `zcode:code-comment-remove-from-chat` (68363)
 *   gXe  → CODE_COMMENT_REMOVE_BROADCAST_CHANNEL = `code-comment:remove-from-chat` (68364)
 *   OH   → removedCommentScopes（已回流评论集合）(68365)
 *   kH   → commentWorkspaceKey        (68415)
 *   AH   → commentScopeKey            (68418)
 *   _Xe/jH/vXe → isCommentRemovedFromChat / markCommentRemovedFromChat / unmark… (68373,68376,68379)
 *   yXe/bXe → isAddToChatEvent / isRemoveFromChatEvent (68382,68390)
 *   MH   → isCommentScopePayload      (68446)
 *   NH   → isCommentAttachmentPayload (68457)
 *   xXe  → serializeCodeComment       「## Comment」块 (68475)
 *   SXe  → serializeCodeCommentsBlock  「# Code comments:」总块 (68479)
 *   CXe  → appendCodeCommentsToContent (68486)
 *   wXe  → fileBasename               (68499)
 *   TXe  → parseLineRange             「L3-L7」→ {startLine,endLine} (68502)
 *   EXe  → parseCodeCommentBlock      (68510)
 *   DXe  → splitCodeCommentAttachments（发送内容 → 可见文本 + 评论附件）(68536)
 *   OXe  → dispatchCodeCommentAddToChat（cancelable，可被拦截）(68551)
 *   kXe  → dispatchCodeCommentRemoveFromChat (68555)
 *   jXe  → removeCodeCommentAndBroadcast（跨窗口广播移除）(68628)
 *   GH   → countContextAttachments     (68825)
 *   GXe  → buildOutboundContentWithAttachments (68833)
 *   KXe  → parseDraftContentIntoAttachments (68839)
 *   qXe  → newCodeCommentId            (68852)
 *   KH   → codeCommentIdentityKey      (68857；A1-R22 降 re-export → Composer codeCommentContextKey 别名，同身)
 *   JXe  → useCodeCommentContexts      composer 侧事件桥钩子 (68860；A1-R22 降 re-export → Composer 逐字 canonical)
 *   （代码查看器侧提交/删除回调 = tHt 内 Ue/We，js 161313–161360，见 useCodeViewerCommentActions；
 *     gutter 行选择机制 El js 6062–6881 属 F14 基建，仅登记）
 *
 *  E. Git 工具 mini 浮卡（状态面板 environment 段）：
 *   mlt  → SummaryGitSection          「Git 工具」段：更改行 + 分支 chip + 提交/推送 (98402)
 *   XZ   → SummarySection             段壳（Collapsible + 滚动限高）(98361)
 *   plt  → SummarySectionHeader       段头（⌄ 折叠 + trailing）(98326)
 *   flt  → SUMMARY_SECTION_SCROLL_CLASS 各段滚动限高表 (98318)
 *   Rct  → GitActionMenu              提交/推送入口（header 与 status-row 双布局）(97657)
 *   Ict  → GitCommitDialog            提交对话框（AI 生成消息/含未暂存/三动作）(97060)
 *   Lct  → GitPushDialog              推送对话框（ahead/behind/upstream/错误复制）(97403)
 *   Fct  → GitActionMenuItem          cmdk 动作项（图标+文案+快捷键）(97038)
 *   mct  → isGitActionAvailable       (96943)
 *   hct  → resolvePrimaryGitAction    commit ∥ push (96946)
 *   gct  → isPushEnabled              (96953)
 *   BZ   → normalizeStagePath         (96957)
 *   _ct  → normalizeDirPath           (96964)
 *   vct  → resolveWorkspaceInRepoPath (96967)
 *   yct  → resolveRelativeSubpath     (96971)
 *   VZ   → addStagePath               (96982)
 *   bct  → collectSessionStagePaths   (96987)
 *   xct  → isFileInSessionPaths       (96999)
 *   Sct  → parseActiveTaskChangeSummaryPaths (97004)
 *   Cct  → filterFilesBySessionPaths  (97010)
 *   wct  → GIT_ACTION_IDS = [commit, commitAndPush, push] (97014)
 *   HZ   → COMMIT_MESSAGE_INPUT_ID = `git-action-menu-commit-message` (96967)
 *   Tct/Ect/Dct/Oct/kct/Act/jct → testid 常量群（`git-action-trigger` 等）(96968)
 *   Mct  → gitActionItemId            (97023)
 *   Nct  → isGitActionId              (97026)
 *   Pct  → isCommitMessageTextarea    (97029)
 *   UZ   → resolveCommitSelection     (97032)
 *   WZ   → resolveCommitStagePaths    (97035)
 *   NZ   → mapChangeFilesToRows       仓库相对路径去重合并 (95065)
 *   Est  → summarizeFileRows          fileCount/totalAdded/totalRemoved (95091)
 *   PZ   → hasGitIdentity             (95124)
 *   MC   → extractErrorMessage        （横切，js 37603 / jsx 34228，反馈域定义，此处声明引用）
 *
 *  F. Git 状态层（审查 pane 数据源）：
 *   nge  → useGitRepository            git 仓库状态钩子 (23968)
 *   tge  → shouldRefreshGitState       (23957)
 *   ege  → buildLastTurnDataset        (23946)
 *   $he  → buildLastTurnChange         (23922)
 *   Qhe  → buildGitDatasets            (23910)
 *   Tg   → groupChangesIntoSections    (23894)
 *   Zhe  → attachDiff                  (23891)
 *   wg   → createInitialGitPaneState   (23829 / 20428 附近 / 9524)
 *   Cg   → buildGitSourceOptions       (23863)
 *   Xhe  → createEmptyGitDatasets      (23855)
 *   Sg   → createEmptyGitDataset       (23852)
 *   Yhe  → createEmptyGitSummary       (23836)
 *   Jhe  → resolveChangeKind           (23833)
 *   xg   → countSectionChanges         (23830)
 *   qhe  → extractGitErrorMessage      (23822)
 *   Khe  → EMPTY_GIT_IDENTITY          (23773)
 *   Ghe  → GIT_SOURCE_SECTION_ORDER    (23768)
 *   Whe  → EMPTY_BRANCH_COMPARISON     (23815)
 *   bg   → isGitRpcEnabled             (23812)
 *   Uhe  → isRemoteWorkspaceDescriptor (23809)
 *   Hhe  → buildLastTurnChangeSummary  快照 → 文件级增删统计 (23774)
 *   yg   → resolveRepoRelativePath     (23717 / 10296 附近)
 *   （⚠ MODULE-MAP F12 备注把 nge 标为「用量数据 hook」系误认：它是本族 useGitRepository，
 *     用量钩子在别处；详见 GitReview.report.md §4）
 *
 *  图标（Sa = createLucideIcon 工厂，js 行）：
 *   Q_ folder-open 27151 | W_ copy 26974 | Nv refresh-cw 27725 | Z_ file-text 27108
 *   N_ chevron-down 26850 | uv list-tree 27348 | wa chevron-right（usageStatsUiParts o 导出）
 *   X_ file-diff 27084 | w_ arrow-up-from-line 26701 | Fye git-commit-horizontal 27195
 *   H_ cloud-upload 26961 | F_ circle-alert 26860 | M_ check 26849 | fv loader 27363
 *   ev git-branch 27190 | Kv trash-2 27930 | Cye code-xml 26969 | _v message-square-text 27447
 *   qv undo-2 27947 | Oye file-clock 27060（editConflict 触发器，登记）
 *   跨 chunk：f=sparkles（imeComposition S）、g=x（imeComposition b）、M=loader-circle（imeComposition w）
 *
 *  data-testid 常量（来自 src-HCld2afU.js）：
 *   ine=git-pane（out/src-HCld2afU.js 8239）| Tct=git-action-trigger（本 chunk 字面量）
 *   Oct=git-commit-dialog | Ect=git-commit-action-command | Dct=git-commit-action-item
 *   kct=git-commit-generate-button | Act=git-commit-include-unstaged | jct=git-commit-message-input
 *   Ste=v4-edit-workspace-conflict-dialog（8394）| Dne=v4-edit-workspace-conflict-conversation-only（8395）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js (t 导出)
 *  3. Button (X) / createLucideIcon (Sa)
 *                                    button-laUijeDG.js (t / c 导出)
 *  4. useIntlContext (G) 返回 {intl, locale}
 *                                    IntlProvider-C321H7m8.js (n 导出)
 *  5. usePlatformService (l=M)、toast (m=_)、Textarea (j=v)、spinner (M=w)、x 图标 (g=b)、
 *     sparkles 图标 (f=S)            imeComposition-DEYFkwWm.js
 *  6. Tooltip 封装 CN/wN/TN（dN/fN/pN 底层）与 Popover 原语 (Na/Oa/Ma/ka)
 *                                    usageStatsUiParts-CiR7YEhh.js（wa=chevron-right 亦出于此）
 *  7. shortcutLabel ($i)             keyboardShortcuts-BGHopxr9.js (n 导出)
 *  8. logger (J)                     logger-PFDwl5Yq.js (t 导出)
 *  9. zustand create (Ae)            skillStore-BmeKHDBI.js (q 导出)
 * 10. useVirtualizer (to)            esm-BY6T6pIH.js (t 导出，@tanstack/react-virtual)
 * 11. diff 行数统计 (Xr=b)、结构化补丁 (Kh)
 *                                    src-HCld2afU.js（out/src-HCld2afU.js 9020–9040 等）
 * 12. Radix 封装（本 chunk 内）：Dialog (zb/Hb/Ub/Gb/Kb/Wb, 31943+)、Select (iO/oO/aO/sO/cO, 46009+)、
 *     ContextMenu (yk/bk/xk/Sk/Ck, 48825+)、Collapsible (kZ/AZ/jZ, 94925+)、cmdk (Yb/Zb/ex/tx, 32092+)
 * 13. 本 chunk 跨族引用（接口级）：
 *     - zZ GitBranchChip（TopBar.tsx 已抽取；本文件引用其 props 接口，注意 popoverSide 还需支持 "left"）
 *     - Bc FilePathInline（js 5157，横切文件图标块 4946–6061）
 *     - W8 DiffViewer = memo(mVt)（js 160479/160542，F14；底层 rze/nze 47224/47174 + diff 引擎 17445–23919）
 *     - gut LightweightDiffPreview（js 100459；助手 dhe 23226 / mut 100418 / hut 100427）
 *     - QA useFileContextActions（js 51093）、$A useWorkspaceRemoteInfo（js 51166）
 *     - ko useSettingsSelector（js 1296）、xo resolveTheme（js 1103）、fs useServices（js 2638）
 *     - Ko/Jo/Go/zA 路径助手（1941/1952/1928/50919）
 *     - Xge/qge/wge 任务路径钩子（24638/24564/24240）、OA/GA 编辑器助手（50852/51037）
 *     - MC extractErrorMessage（37603）、S_t TurnFileChangesSummary（Conversation.tsx 已抽取，110813）
 *     - Moe/zXe/pptx 附件序列化（composer 族，68787 处引用；本文件按接口声明）
 * ============================================================================
 */

import * as React from "react";
import { ContextMenu, ContextMenuContent, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { HoverCardTooltip as TooltipRoot, HoverCardTooltipContent as TooltipContent, HoverCardTooltipTrigger as TooltipTrigger } from '../ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon, FolderOpen as IconFolderOpen, Copy as IconCopy, RefreshCw as IconRefreshCw, FileText as IconFileText, ChevronDown as IconChevronDown, ListTree as IconListTree, FileDiff as IconFileDiff, ArrowUpFromLine as IconArrowUpFromLine, GitCommitHorizontal as IconGitCommitHorizontal, CloudUpload as IconCloudUpload, CircleAlert as IconCircleAlert, Check as IconCheck, Loader as IconLoader, GitBranch as IconGitBranch, Trash2 as IconTrash2, CodeXml as IconCodeXml, MessageSquareText as IconMessageSquareText, Undo2 as IconUndo2, Sparkles as IconSparkles } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb/Wb）
import { resolveBranchDisplayLabel } from '../../modules/CmdkPaletteDeep';
import { DiffViewer, readLastEditorId as getPreferredEditorId } from '../../modules/CodeViewer'; // 原 OA
import { appendWebElementsToContent, useCodeCommentsStore, type ConversationSelection, type WebElementContext } from '../../modules/Composer'; // 原 zXe 族（A0-CLEANUP2 item 11 接线：declare → Composer 属主导出）+ A1-R8：FH 双实例收敛改指（canonical = Composer 6716 区）；〔A1-R22〕+type ConversationSelection（ConversationSelectionRef 本地镜像删除，同 item 11 模式）
import { orderEditorsForFileManager as normalizeInstalledEditors, useFileContextActions } from '../../modules/FileTreePanel'; // 原 GA / QA
import { Popover as PopoverRoot, PopoverAnchor, PopoverContent, PopoverTrigger, Textarea, toast, usePlatform as usePlatformService, type RemoteTarget } from '../../modules/ImeComposition'; // 原 平台钩子（imeComposition 导出 M=usePlatform）；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { FilePathInline, PlainTextDiffPreview as LightweightDiffPreview, pathBasename } from '../../modules/ModalsLeaves'; // 原 gut
import { Command, CommandItem, CommandList, CommandShortcut } from '../../modules/QuickPick';
import { resolveThemeMode as resolveTheme, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings'; // 原 xo
import { create as createStore } from '../../modules/SkillStore'; // 原 Ae（zustand create，SkillStore 导出）
import { GitBranchChip } from '../../modules/TopBar';
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）
import { t as logger } from '../../modules/logger'; // 原 J（logger-PFDwl5Yq.js 导出 t）
import { countLineDiffChanges as countDiffLines } from '../../modules/SrcSharedB'; // 原 bS（styles 侧 Xr 经别名 b 消费）
import { extractErrorMessage } from '../../modules/FeedbackCenter';
import { isAbsolutePath, relativePathFromWorkspace as toRelativePath, useRemoteWorkspaceInfo as useWorkspaceRemoteInfo } from '../../modules/MarkdownIntegration'; // 原 Ko / zA / $A
import { useSettingsStore as useSettingsSelector } from '../../modules/stores-core'; // 原 ko（zustand 设置 store）
import { useServices, useTaskSessionFilePath, useTaskNativeSessionLogFile as useTaskNativeSessionLogFilePath, useWorkspaceProviderConfigFile as useProviderConfigFilePath } from '../../modules/services'; // 〔A1-R50〕+qge/Xge 两钩（原 useTaskNativeSessionLogFilePath/useTaskSessionFilePath 二 declare）：canonical = services/workspaceServiceHooks D.4（styles 24612/24686，A1-P2-B10 逐字），别名保留调用名，消费位逐字不变；〔A1-R51〕+wge（原 useProviderConfigFilePath declare）：canonical = workspaceServiceHooks D.3 useWorkspaceProviderConfigFile（styles 24288–24367，A1-P2-B10 逐字；WS@224 同符已接线），别名保留调用名，消费位 @3967 逐字不变

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */

/** 自研 i18n 上下文（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** 桌面平台服务（原 l()，imeComposition chunk 的 M 导出）——仅列本族用到的面 */
/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除 → 统一属主
 *    改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出；经 modules/ImeComposition type import，既有边）。消费位 @260（本地
 *    PlatformService.openInEditor opts 面）/ @579/@588/@858/@955 props 面 + @1366/@3963
 *    useWorkspaceRemoteInfo cast 面逐字不变。 ── */
interface InstalledEditor { id: string; name: string; iconDataUrl?: string; [key: string]: unknown }
interface OpenResult { success: boolean; error?: string }
interface PlatformService {
  openInFileManager(path: string): Promise<OpenResult>;
  openInEditor(
    editorId: string,
    path: string,
    opts?: { pathKind?: "directory"; remoteTarget?: RemoteTarget; workspaceIdentity?: string | null },
  ): Promise<OpenResult>;
  getInstalledEditors(): Promise<InstalledEditor[]>;
}

/** 快捷键文案：`shortcutLabel("⏎")` → “Ctrl+Enter / ⏎”（原 $i） */
declare function shortcutLabel(key: string): string;

/** 快捷键匹配（原 ta，keyboardShortcuts-BGHopxr9.js 的 u 导出；⏎ = 无修饰回车） */
declare function shortcutMatches(event: { key: string; shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean }, label: string): boolean;

/** zustand（原 Ae = skillStore chunk 导出的 create；约定同 stores-core.tsx） */
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
type GetState<T> = () => T;
interface StoreApi<T> {
  getState: GetState<T>;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}
export type UseBoundStore<T> = StoreApi<T> & (<R>(selector: (state: T) => R) => R) & (() => T); // 无参调用返回全量 state（zustand 语义）

/* ── tombstone（A0-S3a）：本地 VirtualItem/Virtualizer 接口 + vendored useVirtualizer declare
 *    （原 to，esm-BY6T6pIH.js 的 t 导出）删除，改 npm @tanstack/react-virtual@3.14.10 真实
 *    import（文件头）；真实 Virtualizer 为原接口面的超集（getVirtualItems/getTotalSize/
 *    scrollToIndex/measure/measureElement 均吻合），VirtualItem 字段 key/index/start/size 逐字不变。 ── */

/* --- Radix/shadcn 封装原语（本 chunk 内；类名逐字保留于各自定义处） --- */

/** Dialog 族（原 zb/Hb/Ub/Gb/Kb/Wb，js 31943+） */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'。 ── */

/** 文本域（原 j，imeComposition chunk 的 v 导出；forwardRef，提交对话框需聚焦） */

/** spinner 图标（原 M，imeComposition chunk 的 w 导出 = loader-circle） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** Select 族（原 iO/oO/aO/sO/cO，js 46009+；data-slot=select-*） */

/** ContextMenu 族（原 yk/bk/xk/Sk/Ck，js 48825+） */
/* ── tombstone（A0-S3c）：Collapsible、CollapsibleContent、CollapsibleTrigger、ContextMenu、ContextMenuContent、ContextMenuSeparator、ContextMenuTrigger、TooltipContent、TooltipRoot、TooltipTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */


declare const ContextMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean; onSelect?: () => void }>; // Sk


/** Collapsible 族（原 kZ/AZ/jZ，js 94925+；data-slot=collapsible*） */




/** Tooltip 封装（原 CN/wN/TN，js 54784；底层 dN/fN/pN） */




/** Popover 原语（原 Na/Oa/Ma/ka，usageStatsUiParts chunk；提交对话框生成按钮用） */

/** cmdk 封装（原 Yb/Zb/ex/tx，js 32092+；data-slot=command*） */

/* --- lucide 图标（原 Sa 工厂，js 26575–28020；语义名 = lucide 图标名） --- */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（20）：IconFolderOpen/IconCopy/IconRefreshCw/IconFileText/IconChevronDown/IconChevronRight/IconListTree/IconFileDiff/IconArrowUpFromLine/IconGitCommitHorizontal/IconCloudUpload/IconCircleAlert/IconCheck/IconLoader/IconGitBranch/IconTrash2/IconCodeXml/IconMessageSquareText/IconUndo2/IconSparkles → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R45〕：declare IconX（原 g，imeComposition b）删除——本文件零消费（grep 实测仅本 declare 行）。IconX 全树 16 文件分布皆各文件自有 declare/lucide 面，与本文件死面无涉。纯删碑，证据见 A1-R45.report.md §二。 ── */

/* --- 横切助手（本 chunk 他处定义，本族引用） --- */

/** 文件路径内联组件（原 Bc，js 5157；图标 + 文件名 + 目录尾） */
interface FilePathInlineOptions {
  basePath?: string;
  kind?: "file" | "directory";
  showIcon?: boolean;
  iconSize?: number;
  showFilePath?: boolean;
  className?: string;
  fileNameClassName?: string;
  filePathClassName?: string;
}

/** 代码预览设置（原 ko((e) => e.codePreviewSettings)，SettingsStore 字段） */
interface CodePreviewSettings {
  fontSizePx: number;
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  [key: string]: unknown;
}

/** 设置 store 选择器（原 ko，js 1296；StoreProvider 内可用） */

/** 主题解析（原 xo，js 1103：system → 系统，dark/zai-dark → dark，其余 light） */

/** 服务上下文（原 fs，js 2638） */
interface GitService {
  refresh(req: { workspacePath: string; includeIdentity?: boolean; includeBranchComparison?: boolean }): Promise<GitRefreshResult>;
  getDiff(req: { workspacePath: string; path: string; sourceId: string }): Promise<GitDiffState>;
  getIdentity(req: { workspacePath: string }): Promise<GitIdentity | null>;
  generateCommitMessage(req: {
    workspacePath: string;
    workspaceIdentity?: string;
    locale: string;
    includeUnstaged: boolean;
    currentSessionFilePaths?: string[];
    conversationContext?: CommitConversationContext | null;
  }): Promise<{ message: string; providerId: string; model: string }>;
  push(req: { workspacePath: string }): Promise<{
    branchName: string;
    trackingBranchName?: string | null;
    remoteName?: string | null;
    setUpstream: boolean;
  }>;
  stagePaths(req: { workspacePath: string; paths: string[] }): Promise<void>;
  commit(req: { workspacePath: string; message: string; paths: string[]; stagedOnly: boolean }): Promise<void>;
}

/** 工作区远程信息钩子（原 $A，js 51166；读远程标签页推导 isRemoteWorkspace/remoteTarget） */

/** 文件上下文动作（原 QA，js 51093；复制路径/在文件管理器中显示） */
interface FileContextActions {
  canRevealInFileManager(req: { path: string; deleted?: boolean }): boolean;
  copyAbsolutePath(req: { path: string }): Promise<void>;
  copyRelativePath(req: { path: string; relativePath?: string }): Promise<void>;
  revealInFileManager(req: { path: string; deleted?: boolean; kind: "file" | "directory" }): Promise<void>;
}

/** 路径助手（原 Ko/Jo/Go/zA，js 1941/1952/1928/50919） */
declare function joinPath(base: string, sub: string): string; // 原 Jo（待实体化）

/** 任务路径钩子群（原 Xge/qge/wge，styles 24686/24612/24288；横切 services 层；〔A1-R50〕行号纠偏，原注 24638/24564/24240 为 −48 漂移旧口径；〔A1-R51〕三件全改指 workspaceServiceHooks D.3/D.4，本簇 declare 清零） */
interface TaskPathState { path: string | null; exists: boolean; loading: boolean; error: string | null }
/* ── tombstone〔A1-R50〕：declare useTaskSessionFilePath（原 Xge，styles 24686–24733）/
 *    useTaskNativeSessionLogFilePath（原 qge，styles 24612–24676）二件删除——逐字真身在案：
 *    services/workspaceServiceHooks D.4::useTaskSessionFilePath/useTaskNativeSessionLogFile
 *    （A1-P2-B10 转录；Wge/Yge ≡ pathErrorMessage 三体归一注记在案），改经文件头
 *    modules/services 别名 import 接线（既有边；WorkspaceShell@224 同式先例）。
 *    消费位 @3965（`useTaskSessionFilePath(workspacePath, taskId, workspaceIdentity, { enabled: loadTaskPaths })`）/
 *    @3966（`useTaskNativeSessionLogFilePath(workspacePath, taskId, provider ?? null, workspaceIdentity, { enabled: loadTaskPaths })`）
 *    逐字不变。型相容：返回 TaskSessionFileState ≡ TaskPathState 逐字同形；
 *    TaskNativeSessionLogFileState 多 provider 员（超集可赋）；workspaceIdentity 实参
 *    `string | null | undefined` 纳 canonical 宽化参型（〔A1-R50〕型缝，D.4 注记在案）。
 *    〔A1-R51〕余面闭合：useProviderConfigFilePath declare（原 wge）同批改指，墓碑见下。 ── */
/* ── tombstone〔A1-R51〕：declare useProviderConfigFilePath（原 wge，styles 24288–24367）删除——
 *    逐字真身在案：services/workspaceServiceHooks D.3::useWorkspaceProviderConfigFile
 *    （A1-P2-B10 转录；WS@224 同符已接线 useProviderConfigFile，bundle 186741 en≡wge 实证在案），
 *    改经文件头 modules/services 别名 import 接线（既有边；qge/Xge 同式先例），别名保留调用名。
 *    消费位 @3967（`useProviderConfigFilePath(workspacePath, resolvedProvider, remoteSessionId ?? null,
 *    workspaceIdentity, { serviceScope: remoteSessionId ? 'base' : 'workspace', enabled: loadProviderConfig })`）
 *    逐字不变 ≡ bundle 142100 `m = wge(e, d, t, n, { serviceScope: t ? 'base' : 'workspace', enabled: s })`
 *    （C6 ≡ useTaskFileActions 域 js 142068）；wge 全消费位普查 = 142100 + 186741（WS 面已接线）二处。
 *    型相容：返回 PathState & { refresh(): void } ⊇ TaskPathState（逐字同形，超集可赋；TaskFileActions
 *    面 @3940 与下游 .path/.exists 消费不变）；参型逐位核验 = workspacePath: string ⊆ string | null、
 *    resolvedProvider: string ⊆ string | null、remoteSessionId ?? null ⊆ ?: string | null、
 *    workspaceIdentity 实参 `string | null | undefined` 纳 canonical `?: string | null`（P2-B10 既宽化，
 *    canonical 侧本批零改动；参型宽化先例同 qge/Xge〔A1-R50〕型缝）。 ── */

/** 编辑器助手（原 OA/GA，js 50852/51037） */

/** 错误消息提取（原 MC，js 37603；去 `Error:` 前缀） */

/** 文件分派/打开代码查看（原 p1 使用的 onOpenCodeViewer 目标，F14 标签工厂） */
interface CodeViewerPatchSource {
  type: "patch";
  title: string;
  path: string;
  patch: string;
  workspacePath: string;
  workspaceIdentity?: string;
  workspaceRemoteSessionId?: string;
}
interface FileChangeContextWorkspace {
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenCodeViewer?: (source: CodeViewerPatchSource) => void;
}

/* ============================================================================
 * F. Git 状态层（原 js 23726–24014 / jsx 20340–20564）
 * ----------------------------------------------------------------------------
 * 审查 pane 的数据源：useGitRepository 调 gitService.refresh 拉
 * summary/identity/unstaged/staged/branchComparison，组装成四来源数据集
 * （unstaged/staged/branch/last-turn）+ sourceOptions；last-turn 来源承载
 * 「上一轮更改」只读审阅（任务快照 → 行级增删）。
 * ==========================================================================*/

/** 变更类型（原 Jhe 的返回值） */
export type GitChangeKind = "added" | "deleted" | "modified";

/** 变更来源（审查 pane 顶部下拉） */
export type GitSourceId = "unstaged" | "staged" | "branch" | "last-turn";

/** 文件级 diff 状态（原 getDiff 返回；availability 决定渲染分派） */
export interface GitDiffState {
  path: string;
  availability: "patch" | "binary" | "truncated" | "unavailable";
  patch: string | null;
  beforeContent: string | null;
  afterContent: string | null;
  /** 不可用时的错误摘要（原 DWt 提取） */
  summary?: string | null;
}

/** 单个文件变更（原变更行；BWt/NWt 的消费面） */
export interface GitFileChange {
  path: string;
  repoRelativePath: string;
  workspaceRelativePath: string;
  kind: GitChangeKind;
  added: number;
  removed: number;
  section?: string;
  isStaged?: boolean;
  isUntracked?: boolean;
  isConflicted?: boolean;
  /** last-turn 来源自带内联 diff；其余来源按需懒加载进缓存 */
  diff?: GitDiffState | null;
  lastTurnIndex?: number | null;
  writeCount?: number;
}

/** 分组（unstaged 下再分 unstaged/untracked/conflicted 等） */
export interface GitSection { id: string; changes: GitFileChange[] }

/** 来源数据集 */
export interface GitDataset {
  id: GitSourceId;
  readonly: boolean;
  sections: GitSection[];
  comparisonLabel?: string | null;
  turnIndex?: number | null;
}

/** 来源下拉选项（含计数/禁用/比较标签） */
export interface GitSourceOption {
  id: GitSourceId;
  count: number;
  readonly: boolean;
  disabled: boolean;
  comparisonLabel?: string | null;
}

/** 仓库摘要（原 Yhe 缺省形） */
export interface GitSummary {
  workspacePath: string;
  repoRoot: string;
  workspaceInRepoPath: string;
  autoRefreshWatchPaths: string[];
  branchName: string | null;
  trackingBranchName: string | null;
  headRefType: "branch" | "detached" | string;
  ahead: number;
  behind: number;
  isDirty: boolean;
  isGitAvailable: boolean;
  isRepository: boolean;
}

/** 提交身份（原 Khe 缺省形） */
export interface GitIdentity {
  userName: string | null;
  userEmail: string | null;
  nameSource: string | null;
  emailSource: string | null;
  scopeLabel: string | null;
}

/** 分支比较（原 Whe 缺省形） */
export interface GitBranchComparison {
  baseRef: string | null;
  headRef: string | null;
  comparisonLabel: string | null;
  changes: GitFileChange[];
}

/** refresh 返回（原 gitService.refresh 的解构面） */
export interface GitRefreshResult {
  summary: GitSummary;
  identity: GitIdentity | null;
  unstagedChanges: GitFileChange[];
  stagedChanges: GitFileChange[];
  branchComparison: GitBranchComparison | null;
}

/** 审查 pane 总状态（原 nge 的返回形） */
export interface GitPaneState {
  workspaceKey: string;
  summary: GitSummary;
  identity: GitIdentity;
  placeholder: { enabled: boolean };
  loading: boolean;
  error: string | null;
  revision: number;
  sourceOptions: GitSourceOption[];
  datasets: Record<GitSourceId, GitDataset>;
}

/** 原 Whe（js 23815）：空分支比较 */
export const EMPTY_BRANCH_COMPARISON: GitBranchComparison = { baseRef: null, headRef: null, comparisonLabel: null, changes: [] };

/** 原 Ghe（js 23768）：各来源的分组顺序 */
export const GIT_SOURCE_SECTION_ORDER: Record<Exclude<GitSourceId, "last-turn">, string[]> = {
  unstaged: [`unstaged`, `untracked`, `conflicted`],
  staged: [`staged`],
  branch: [`branch`],
};

/** 原 Khe（js 23773）：空提交身份 */
export const EMPTY_GIT_IDENTITY: GitIdentity = { userName: null, userEmail: null, nameSource: null, emailSource: null, scopeLabel: null };

/** 原 qhe（js 23822）：git 错误消息提取（与 DWt 同构） */
export function extractGitErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error === `object` && error && `message` in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === `string` && message.length > 0) return message;
  }
  return String(error);
}

/** 原 Uhe（js 23809）：是否远程工作区描述（身份/远程会话/远程目标任一） */
export function isRemoteWorkspaceDescriptor(desc: {
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
}): boolean {
  return !!(desc.workspaceIdentity?.trim() || desc.remoteSessionId?.trim() || desc.remoteTarget);
}

/** 原 bg（js 23812）：git RPC 可用 = 本地工作区 ∥ 有远程会话（远程目标直连不走工作区 RPC） */
export function isGitRpcEnabled(desc: {
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
}): boolean {
  return !isRemoteWorkspaceDescriptor(desc) || !!desc.remoteSessionId?.trim();
}

/** 原 xg（js 23830）：分组变更总数 */
export function countSectionChanges(sections: GitSection[]): number {
  return sections.reduce((sum, section) => sum + section.changes.length, 0);
}

/** 原 Jhe（js 23833）：按增删行数推断变更类型 */
export function resolveChangeKind(added: number, removed: number): GitChangeKind {
  return added > 0 && removed === 0 ? `added` : removed > 0 && added === 0 ? `deleted` : `modified`;
}

/** 原 Yhe（js 23836）：空仓库摘要 */
export function createEmptyGitSummary(workspacePath: string): GitSummary {
  return {
    workspacePath,
    repoRoot: workspacePath,
    workspaceInRepoPath: `.`,
    autoRefreshWatchPaths: [],
    branchName: null,
    trackingBranchName: null,
    headRefType: `branch`,
    ahead: 0,
    behind: 0,
    isDirty: false,
    isGitAvailable: false,
    isRepository: false,
  };
}

/** 原 Sg（js 23852）：空来源数据集 */
export function createEmptyGitDataset(id: GitSourceId, readonly: boolean): GitDataset {
  return { id, readonly, sections: [], comparisonLabel: null, turnIndex: null };
}

/** 原 Xhe（js 23855）：四来源空数据集 */
export function createEmptyGitDatasets(): Record<GitSourceId, GitDataset> {
  return {
    unstaged: createEmptyGitDataset(`unstaged`, false),
    staged: createEmptyGitDataset(`staged`, false),
    branch: createEmptyGitDataset(`branch`, true),
    "last-turn": createEmptyGitDataset(`last-turn`, true),
  };
}

/** 原 Cg（js 23863）：数据集 → 来源下拉选项（顺序固定） */
export function buildGitSourceOptions(datasets: Record<GitSourceId, GitDataset>): GitSourceOption[] {
  return [
    { id: `unstaged`, count: countSectionChanges(datasets.unstaged.sections), readonly: false, disabled: false },
    { id: `staged`, count: countSectionChanges(datasets.staged.sections), readonly: false, disabled: false },
    {
      id: `branch`,
      count: countSectionChanges(datasets.branch.sections),
      readonly: true,
      disabled: false,
      comparisonLabel: datasets.branch.comparisonLabel,
    },
    { id: `last-turn`, count: countSectionChanges(datasets[`last-turn`].sections), readonly: true, disabled: false },
  ];
}

/** 原 wg（js 23877）：初始 pane 状态（loading 缺省真） */
export function createInitialGitPaneState(
  workspacePath: string,
  overrides?: { workspaceKey?: string; loading?: boolean; error?: string | null; revision?: number },
): GitPaneState {
  const datasets = createEmptyGitDatasets();
  return {
    workspaceKey: overrides?.workspaceKey ?? workspacePath,
    summary: createEmptyGitSummary(workspacePath),
    identity: EMPTY_GIT_IDENTITY,
    placeholder: { enabled: false },
    loading: overrides?.loading ?? true,
    error: overrides?.error ?? null,
    revision: overrides?.revision ?? 0,
    sourceOptions: buildGitSourceOptions(datasets),
    datasets,
  };
}

/** 原 Zhe（js 23891）：给变更挂 diff */
export function attachDiff(change: GitFileChange, diff: GitDiffState | null = null): GitFileChange {
  return { ...change, diff };
}

/** 原 Tg（js 23894）：扁平变更 → 按分组顺序组装 sections（组内按工作区相对路径排序） */
export function groupChangesIntoSections(sourceId: Exclude<GitSourceId, "last-turn">, changes: GitFileChange[]): GitSection[] {
  const bySection = new Map<string, GitFileChange[]>();
  for (const change of changes) {
    const bucket = bySection.get(change.section ?? ``) ?? [];
    bucket.push(attachDiff(change));
    bySection.set(change.section ?? ``, bucket);
  }
  return GIT_SOURCE_SECTION_ORDER[sourceId]
    .map((sectionId) => {
      const bucket = bySection.get(sectionId);
      return !bucket || bucket.length === 0
        ? null
        : (bucket.sort((a, b) => a.workspaceRelativePath.localeCompare(b.workspaceRelativePath)),
          { id: sectionId, changes: bucket });
    })
    .filter((section): section is GitSection => !!section);
}

/** 原 Qhe（js 23910）：refresh 结果 → 三来源数据集（last-turn 另行注入） */
export function buildGitDatasets(result: {
  unstagedChanges: GitFileChange[];
  stagedChanges: GitFileChange[];
  branchComparison: GitBranchComparison | null;
}): Record<"unstaged" | "staged" | "branch", GitDataset> {
  const comparison = result.branchComparison ?? EMPTY_BRANCH_COMPARISON;
  return {
    unstaged: { id: `unstaged`, readonly: false, sections: groupChangesIntoSections(`unstaged`, result.unstagedChanges) },
    staged: { id: `staged`, readonly: false, sections: groupChangesIntoSections(`staged`, result.stagedChanges) },
    branch: {
      id: `branch`,
      readonly: true,
      sections: groupChangesIntoSections(`branch`, comparison.changes),
      comparisonLabel: comparison.comparisonLabel,
    },
  };
}

/** 原 yg（js 23765）：仓库根相对路径（大小写不敏感前缀；不匹配时原样返回 basename） */
export function resolveRepoRelativePath(repoRoot: string, path: string): string {
  const root = repoRoot.replace(/[\\/]+$/, ``).replace(/\\/g, `/`);
  const target = path.replace(/\\/g, `/`);
  if (target === root) return pathBasename(path);
  const prefix = `${root}/`;
  if (target.startsWith(prefix)) return target.slice(prefix.length) || pathBasename(path);
  const lowerPrefix = prefix.toLowerCase();
  return target.toLowerCase().startsWith(lowerPrefix) ? target.slice(prefix.length) || pathBasename(path) : path;
}

/** 原 $he（js 90289）：last-turn 摘要文件 → 变更行（内联 before/after 内容，供直接出 diff） */
export function buildLastTurnChange(
  workspacePath: string,
  snapshotsByPath: Map<string, { beforeContent: string | null; afterContent: string | null }>,
  file: { path: string; added: number; removed: number; writeCount?: number; lastTurnIndex?: number | null },
): GitFileChange {
  const repoRelativePath = resolveRepoRelativePath(workspacePath, file.path);
  const snapshot = snapshotsByPath.get(file.path);
  return {
    path: file.path,
    repoRelativePath,
    workspaceRelativePath: repoRelativePath,
    kind: resolveChangeKind(file.added, file.removed),
    section: `last-turn`,
    added: file.added,
    removed: file.removed,
    isStaged: false,
    isUntracked: false,
    isConflicted: false,
    diff: {
      path: file.path,
      availability: snapshot ? `patch` : `unavailable`,
      patch: null,
      beforeContent: snapshot?.beforeContent ?? null,
      afterContent: snapshot?.afterContent ?? null,
      summary: null,
    },
  };
}

/** 原 ege（js 23946）：last-turn 数据集（只读；无摘要时为空段） */
export function buildLastTurnDataset(req: {
  workspacePath: string;
  turnIndex: number | null;
  fileChange: { snapshots?: Array<{ path: string; beforeContent: string | null; afterContent: string | null }> } | null;
  summary: LastTurnChangeSummary | null | undefined;
}): GitDataset {
  const snapshotsByPath = new Map((req.fileChange?.snapshots ?? []).map((snapshot) => [snapshot.path, snapshot] as const));
  return {
    id: `last-turn`,
    readonly: true,
    turnIndex: req.turnIndex,
    sections: req.summary
      ? [{ id: `last-turn`, changes: req.summary.files.map((file) => buildLastTurnChange(req.workspacePath, snapshotsByPath, file)) }]
      : [],
  };
}

/** 原 tge（js 23957）：是否需要重新 refresh（工作区/键/刷新令牌变化，或首次要求扩展数据） */
export function shouldRefreshGitState(
  prev: { workspacePath: string; workspaceKey: string; refreshToken: number | null; workspaceRpcEnabled: boolean; includeExtendedData: boolean } | null,
  next: { workspacePath: string; workspaceKey: string; refreshToken: number | null; workspaceRpcEnabled: boolean; includeExtendedData: boolean },
): boolean {
  return next.workspaceRpcEnabled
    ? !prev ||
        !prev.workspaceRpcEnabled ||
        prev.workspacePath !== next.workspacePath ||
        prev.workspaceKey !== next.workspaceKey ||
        prev.refreshToken !== next.refreshToken
      ? true
      : !prev.includeExtendedData && next.includeExtendedData
    : false;
}

/** last-turn 文件级统计（原 Hhe 的 files 元素形） */
export interface LastTurnChangeFile {
  path: string;
  added: number;
  removed: number;
  writeCount: number;
  lastTurnIndex: number | null;
}
export interface LastTurnChangeSummary {
  fileCount: number;
  added: number;
  removed: number;
  files: LastTurnChangeFile[];
}

/** diff 行数统计（原 Xr，src-HCld2afU.js 导出 b；LCS 行级统计） */

/**
 * 原 Hhe（js 23774 / jsx 20340）：任务快照 → 上一轮变更摘要。
 * 快照按路径合并（后写覆盖内容、累加写入次数），再对每个文件做行级增删统计。
 */
export function buildLastTurnChangeSummary(
  fileChange: { turnIndex: number | null; snapshots: Array<{ path: string; beforeContent: string | null; afterContent: string | null; writeCount: number }> } | null,
): LastTurnChangeSummary | null {
  if (!fileChange || fileChange.snapshots.length === 0) return null;
  const merged = new Map<string, { beforeContent: string | null; afterContent: string | null; writeCount: number }>();
  for (const snapshot of fileChange.snapshots) {
    const existing = merged.get(snapshot.path);
    if (existing) {
      existing.afterContent = snapshot.afterContent;
      existing.writeCount += snapshot.writeCount;
      continue;
    }
    merged.set(snapshot.path, {
      beforeContent: snapshot.beforeContent,
      afterContent: snapshot.afterContent,
      writeCount: snapshot.writeCount,
    });
  }
  let added = 0;
  let removed = 0;
  const files = Array.from(merged.entries())
    .map(([path, content]) => {
      const stat = countDiffLines(content.beforeContent, content.afterContent);
      added += stat.added;
      removed += stat.removed;
      return {
        path,
        added: stat.added,
        removed: stat.removed,
        writeCount: content.writeCount,
        lastTurnIndex: fileChange.turnIndex,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  return { fileCount: files.length, added, removed, files };
}

/**
 * 原 nge（js 23968 / jsx 20564）：useGitRepository —— 审查 pane 的状态钩子。
 * 工作区键 = workspaceIdentity?.trim() || workspacePath；git RPC 不可用时直接落空态。
 * ⚠ MODULE-MAP F12 备注把 `nge` 标为「用量数据 hook」系误认（调用面是 gitService.refresh）。
 */
export function useGitRepository(props: {
  workspacePath: string;
  activeTaskId?: string | null;
  includeExtendedData?: boolean;
  refreshToken?: number | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
  workspaceIdentity?: string | null;
}): GitPaneState {
  const {
    workspacePath,
    includeExtendedData = false,
    refreshToken = null,
    remoteSessionId = null,
    remoteTarget,
    workspaceIdentity = null,
  } = props;
  const { gitService } = useServices() as unknown as { gitService: GitService } // A0-CLEANUP3 3b：ResolvedBaseServices 交集型与投射面不再直接可比，二段断言;
  // 原 bg(...)：远程会话走 base 作用域 RPC；远程目标直连不启用工作区 RPC
  const workspaceRpcEnabled = isGitRpcEnabled({ workspaceIdentity, remoteSessionId: resolveRemoteSessionKey(workspacePath, remoteSessionId, workspaceIdentity, remoteTarget), remoteTarget });
  const workspaceKey = workspaceIdentity?.trim() || workspacePath;
  const [state, setState] = React.useState<GitPaneState>(() => createInitialGitPaneState(workspacePath, { workspaceKey }));
  const revisionRef = React.useRef(0);
  const lastRequestRef = React.useRef<{ workspacePath: string; workspaceKey: string; refreshToken: number | null; workspaceRpcEnabled: boolean; includeExtendedData: boolean } | null>(null);

  React.useEffect(() => {
    const request = {
      workspacePath,
      workspaceKey,
      includeExtendedData,
      refreshToken,
      workspaceRpcEnabled,
    };
    if (!workspaceRpcEnabled) {
      // RPC 不可用：不落 loading，直接空态（保留 revision）
      revisionRef.current += 1;
      lastRequestRef.current = request;
      setState((prev) => createInitialGitPaneState(workspacePath, { workspaceKey, loading: false, error: null, revision: prev.revision }));
      return;
    }
    const changed = shouldRefreshGitState(lastRequestRef.current, request);
    lastRequestRef.current = request;
    if (!changed) return;
    let disposed = false;
    const revision = revisionRef.current + 1;
    revisionRef.current = revision;
    setState((prev) =>
      prev.workspaceKey === workspaceKey ? { ...prev, loading: true, error: null } : createInitialGitPaneState(workspacePath, { workspaceKey }),
    );
    gitService
      .refresh({ workspacePath, includeIdentity: includeExtendedData, includeBranchComparison: includeExtendedData })
      .then(({ summary, identity, unstagedChanges, stagedChanges, branchComparison }) => {
        if (disposed || revisionRef.current !== revision) return;
        const datasets: Record<GitSourceId, GitDataset> = {
          ...buildGitDatasets({ unstagedChanges, stagedChanges, branchComparison: branchComparison ?? EMPTY_BRANCH_COMPARISON }),
          "last-turn": createEmptyGitDataset(`last-turn`, true),
        };
        setState({
          workspaceKey,
          summary,
          identity: identity ?? EMPTY_GIT_IDENTITY,
          placeholder: { enabled: false },
          loading: false,
          error: null,
          revision,
          sourceOptions: buildGitSourceOptions(datasets),
          datasets,
        });
      })
      .catch((error) => {
        if (disposed || revisionRef.current !== revision) return;
        const message = extractGitErrorMessage(error);
        logger.warn(`[useGitRepository] 读取 Git 仓库状态失败`, { workspacePath, error: message });
        setState((prev) => ({
          ...createInitialGitPaneState(workspacePath, { workspaceKey, loading: false, error: message, revision: prev.revision }),
        }));
      });
    return () => {
      disposed = true;
    };
  }, [gitService, includeExtendedData, refreshToken, workspaceIdentity, workspaceKey, workspacePath, workspaceRpcEnabled]);

  // 原 nge 尾部 useMemo：注入 last-turn 数据集。融合版此处的任务快照入参被常量化为
  // null（turnIndex/fileChange/summary 均 null → 空 last-turn 段），逐字保留该形态。
  return React.useMemo(() => {
    const base = state.workspaceKey === workspaceKey ? state : createInitialGitPaneState(workspacePath, { workspaceKey });
    const datasets = { ...base.datasets };
    datasets[`last-turn`] = buildLastTurnDataset({
      workspacePath,
      turnIndex: null,
      fileChange: null,
      summary: buildLastTurnChangeSummary(null) ?? null, // 原 bundle 24056 为 `?? void 0 ?? null`，TS2881（void 0 恒 undefined）语义等价收敛
    });
    return { ...base, sourceOptions: buildGitSourceOptions(datasets), datasets };
    // 原依赖数组逐字为 [null, null, state, workspaceKey, workspacePath]
  }, [null, null, state, workspaceKey, workspacePath]);
}

/** 远程会话键解析（原 bc，js 4820；横切 services 层，此处按调用面声明） */
declare function resolveRemoteSessionKey(
  workspacePath: string,
  remoteSessionId: string | null,
  workspaceIdentity: string | null,
  remoteTarget?: RemoteTarget,
): string | null;

/* ============================================================================
 * A. 审查 pane：BWt GitChangesPanel + NWt GitChangeRow（js 178296–178919）
 * ----------------------------------------------------------------------------
 * 侧面板「审查」标签（tab.type === 'git'，固定 id `git`，标题 sidePane.review）
 * 的内容组件。结构：顶部来源 Select + 刷新；主体为 @tanstack/react-virtual
 * 虚拟列表，每行 = 粘性文件头（路径 + ±计数 + ⌄）+ 展开后的 diff 三态渲染
 * （plain-text 轻量预览 / patch 视图 / 前后文件视图）；空态按 6 档文案分派。
 * 查找（fileChangeFind*）由工作区壳的查找条驱动：先全量拉 diff，再在
 * before+after 内容里数匹配，命中文件自动展开/滚动居中。
 * ==========================================================================*/

/** 原 CWt/wWt（js 178296）：富渲染阈值 —— 内容 180KB 或 1200 行以上降级 */
export const DIFF_RICH_CONTENT_CHAR_LIMIT = 18e4;
export const DIFF_RICH_LINE_LIMIT = 1200;

/** 原 RWt/zWt（js 178581）：虚拟列表行高估计 / overscan */
export const GIT_CHANGE_ROW_ESTIMATE_PX = 32;
export const GIT_CHANGE_LIST_OVERSCAN = 14;

/** 原 TWt（js 178552）：来源 → i18n key（未暂存/已暂存/全部分支更改/上一轮更改） */
export function resolveGitSourceI18nId(sourceId: string): string {
  switch (sourceId) {
    case `unstaged`:
      return `git.source.unstaged`;
    case `staged`:
      return `git.source.staged`;
    case `branch`:
      return `git.source.branch`;
    case `last-turn`:
      return `git.source.lastTurn`;
    default:
      return `git.source.unstaged`;
  }
}

/** 原 EWt（js 178566）：diff 不可用文案（二进制/已裁剪/暂不可预览） */
export function resolveDiffUnavailableI18nId(availability: string): string {
  switch (availability) {
    case `binary`:
      return `git.diff.binaryTitle`;
    case `truncated`:
      return `git.diff.truncatedTitle`;
    default:
      return `git.diff.unavailableTitle`;
  }
}

/** 原 y5（js 178576）：diff 缓存键 = 来源:路径 */
export function diffCacheKey(sourceId: string, path: string): string {
  return `${sourceId}:${path}`;
}

/** 原 DWt（js 178579）：错误消息提取（与 MC 同构） */
export function extractDiffErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error === `object` && error && `message` in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === `string` && message.length > 0) return message;
  }
  return String(error);
}

/** 原 OWt（js 178587）：行数统计（末行无换行也计一行） */
export function countTextLines(text: string | null | undefined): number {
  if (!text) return 0;
  let count = +!text.endsWith(`\n`);
  for (let index = 0; index < text.length; index += 1) if (text.charCodeAt(index) === 10) count += 1;
  return count;
}

/** 原 kWt（js 178594）：diff 是否过大而不适合富渲染（字符数或行数超阈） */
export function isDiffTooLargeForRichRendering(diff: GitDiffState): boolean {
  return diff.availability !== `patch` || !diff.patch
    ? false
    : (diff.beforeContent?.length ?? 0) + (diff.afterContent?.length ?? 0) > DIFF_RICH_CONTENT_CHAR_LIMIT
      ? true
      : Math.max(countTextLines(diff.beforeContent), countTextLines(diff.afterContent)) > DIFF_RICH_LINE_LIMIT;
}

/** diff 渲染模式（原 AWt 的返回形） */
export type DiffRenderMode = { kind: "rich" } | { kind: "plain-text"; lines: string[] } | { kind: "patch" };

/** 原 MWt（js 178617）：从 ---/+++ 头里取第一个非 /dev/null 路径 */
export function findDiffHeaderPath(lines: string[]): string | null {
  for (const line of lines) {
    if (!line.startsWith(`--- `) && !line.startsWith(`+++ `)) continue;
    const candidate = line.slice(4).trim();
    if (!(!candidate || candidate === `/dev/null`)) return candidate;
  }
  return null;
}

/** 纯文本 diff 行解析（原 fg，vendored diff 引擎 js 23311；此处按调用面声明） */
declare function parsePatchIntoLines(patch: string): string[] | null;
/** 文件类型判定（原 Xp，js 16569；返回 'text' 等） */
declare function detectFileType(path: string): string;

/**
 * 原 jWt（js 178609）：新增/删除文件（--- /dev/null 或 +++ /dev/null）时，
 * 若头路径是文本文件，则把整个 patch 当纯文本行渲染。
 */
export function tryExtractPlainTextDiffLines(patch: string): string[] | null {
  const lines = parsePatchIntoLines(patch);
  if (!lines) return null;
  const rawLines = patch.split(/\r?\n/);
  if (!(rawLines.some((line) => line === `--- /dev/null`) || rawLines.some((line) => line === `+++ /dev/null`))) return lines;
  const headerPath = findDiffHeaderPath(rawLines);
  return headerPath && detectFileType(headerPath) === `text` ? lines : null;
}

/** 原 AWt（js 178601）：diff 渲染模式分派（无 patch→rich；纯文本→plain-text；过大→patch 兜底） */
export function resolveDiffRenderMode(diff: GitDiffState | null | undefined): DiffRenderMode {
  if (diff?.availability !== `patch` || !diff.patch) return { kind: `rich` };
  const plainTextLines = tryExtractPlainTextDiffLines(diff.patch);
  if (plainTextLines) return { kind: `plain-text`, lines: plainTextLines };
  if (!isDiffTooLargeForRichRendering(diff)) return { kind: `rich` };
  const fallbackLines = parsePatchIntoLines(diff.patch);
  return fallbackLines ? { kind: `plain-text`, lines: fallbackLines } : { kind: `patch` };
}

/** 原 PWt（js 178795）：纯文本 diff 轻量预览（gut 封装 + data-git-plain-text-diff-preview） */
export function PlainTextDiffPreview({ lines, codePreviewSettings }: { lines: string[]; codePreviewSettings: CodePreviewSettings }) {
  return (
    <LightweightDiffPreview
      codePreviewSettings={codePreviewSettings}
      data-git-plain-text-diff-preview={true}
      lines={lines}
    />
  );
}

/** 轻量 diff 预览（原 gut，js 100459；实体在 ModalsLeaves 导出 PlainTextDiffPreview） */

/** Diff 视图（原 W8 = memo(mVt)，js 160479/160542；F14 基建，接口声明） */
interface DiffViewerFile { name: string; contents: string; cacheKey: string }

/** 原 FWt（js 178802）：查找词归一化 */
export function normalizeFindQuery(query: string): string {
  return query.trim().toLocaleLowerCase();
}

/** 原 IWt（js 178805）：不重叠出现次数 */
export function countOccurrences(text: string, needle: string): number {
  if (!needle) return 0;
  const haystack = text.toLocaleLowerCase();
  let count = 0;
  let cursor = 0;
  for (; cursor < haystack.length; ) {
    const index = haystack.indexOf(needle, cursor);
    if (index === -1) break;
    count += 1;
    cursor = index + needle.length;
  }
  return count;
}

/** 查找匹配（原 LWt 的返回形） */
export interface FileChangeFindMatch { path: string; globalIndex: number; matchIndexInFile: number }
export interface FileChangeFindResult {
  matches: FileChangeFindMatch[];
  activeMatch: FileChangeFindMatch | null;
  currentIndex: number;
  total: number;
}

/**
 * 原 LWt（js 178817）：变更内容查找。把每个文件的 before+after 拼成内容串，
 * 逐文件数匹配并展平成全局序列；活动下标越界时回绕到 0。
 */
export function computeFileChangeFindMatches(
  files: Array<{ path: string; content: string | null }>,
  query: string,
  activeIndex: number,
): FileChangeFindResult {
  const needle = normalizeFindQuery(query);
  const matches: FileChangeFindMatch[] = [];
  if (needle)
    for (const file of files) {
      if (!file.content) continue;
      const occurrences = countOccurrences(file.content, needle);
      for (let matchIndex = 0; matchIndex < occurrences; matchIndex += 1)
        matches.push({ path: file.path, globalIndex: matches.length, matchIndexInFile: matchIndex });
    }
  const resolvedIndex = matches.length === 0 ? -1 : activeIndex >= 0 && activeIndex < matches.length ? activeIndex : 0;
  return {
    matches,
    activeMatch: resolvedIndex >= 0 ? matches[resolvedIndex] ?? null : null,
    currentIndex: resolvedIndex,
    total: matches.length,
  };
}

/** diff 缓存条目（原 C 映射值） */
interface DiffCacheEntry { loading: boolean; diff: GitDiffState | null }

/** 上下文菜单文案（原 ie） */
export interface GitChangeContextMenuLabels {
  copyAbsolutePath: string;
  copyRelativePath: string;
  revealInFileManager: string;
  revealInFileTree: string;
}

/** NWt 的 props（原 js 178371 解构面） */
export interface GitChangeRowProps {
  change: GitFileChange;
  contextMenuLabels: GitChangeContextMenuLabels;
  diffState: GitDiffState | null;
  isDiffLoading: boolean;
  isExpanded: boolean;
  canRevealInFileManager: boolean;
  codePreviewSettings: CodePreviewSettings;
  resolvedTheme: "dark" | "light";
  findContentRef?: React.Ref<HTMLDivElement>;
  onCopyAbsolutePath: (change: GitFileChange) => void;
  onCopyRelativePath: (change: GitFileChange) => void;
  onOpenChange: (change: GitFileChange, expanded: boolean) => void;
  onRevealInFileManager: (change: GitFileChange) => void;
  onRevealInFileTree?: (change: GitFileChange) => void;
}

/**
 * 原 NWt（js 178625 / jsx 144648）：单文件变更行。
 * 粘性头（`sticky top-0 z-10 h-8`）= 文件路径（Bc）+ +N/-N + ⌄；
 * 右键菜单 = 在文件管理器中打开/复制绝对路径/复制相对路径/在文件树中显示；
 * 展开体按渲染模式三态：纯文本轻量预览 / patch 视图 / 前后文件视图；
 * 无 patch 时显示不可用文案（binary/truncated/unavailable）。
 */
export function GitChangeRow({
  change,
  contextMenuLabels,
  diffState,
  isDiffLoading,
  isExpanded,
  canRevealInFileManager,
  codePreviewSettings,
  resolvedTheme,
  findContentRef,
  onCopyAbsolutePath,
  onCopyRelativePath,
  onOpenChange,
  onRevealInFileManager,
  onRevealInFileTree,
}: GitChangeRowProps) {
  const { intl } = useIntlContext();
  const renderMode = React.useMemo(() => resolveDiffRenderMode(diffState), [diffState]);
  // 前后文件视图入参（缓存键 = 新旧内容指纹，供 diff 引擎复用）
  const filePair = React.useMemo(
    () =>
      diffState?.availability !== `patch` || diffState.afterContent === null
        ? null
        : {
            oldFile: {
              name: change.workspaceRelativePath,
              contents: diffState.beforeContent ?? ``,
              cacheKey: `old:${diffState.path}:${diffState.beforeContent?.length ?? 0}:${diffState.beforeContent?.slice(0, 100) ?? ``}:${diffState.beforeContent?.slice(-100) ?? ``}`,
            },
            newFile: {
              name: change.workspaceRelativePath,
              contents: diffState.afterContent,
              cacheKey: `new:${diffState.path}:${diffState.afterContent.length}:${diffState.afterContent.slice(0, 100)}:${diffState.afterContent.slice(-100)}`,
            },
          },
    [change.workspaceRelativePath, diffState?.afterContent, diffState?.availability, diffState?.beforeContent, diffState?.path],
  );
  return (
    <div className="w-full min-w-0">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            aria-expanded={isExpanded}
            className={cn(
              `sticky top-0 z-10 flex h-8 w-full items-center gap-3 bg-background px-3 text-left transition-colors hover:bg-surface-hover supports-[backdrop-filter]:backdrop-blur-sm`,
              isExpanded && `bg-surface-hover`,
            )}
            onClick={() => onOpenChange(change, !isExpanded)}
          >
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <FilePathInline
                  path={change.workspaceRelativePath}
                  options={{
                    showFilePath: true,
                    className: `inline-flex min-w-0 max-w-full items-center gap-2`,
                    fileNameClassName: `truncate text-ui-base text-foreground`,
                    filePathClassName: `truncate text-ui-base text-foreground-subtlest`,
                  }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3 pl-3">
              <div className="shrink-0 whitespace-nowrap text-ui-base">
                <span className="text-diff-added">{`+`}{change.added}</span>
                <span className="ml-2 text-diff-removed">{`-`}{change.removed}</span>
              </div>
              <IconChevronDown
                className={cn(`size-4 shrink-0 text-foreground-subtle transition-transform`, isExpanded && `rotate-180`)}
              />
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem disabled={!canRevealInFileManager} onSelect={() => onRevealInFileManager(change)}>
            <IconFolderOpen className="size-4" />
            {contextMenuLabels.revealInFileManager}
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onCopyAbsolutePath(change)}>
            <IconCopy className="size-4" />
            {contextMenuLabels.copyAbsolutePath}
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onCopyRelativePath(change)}>
            <IconCopy className="size-4" />
            {contextMenuLabels.copyRelativePath}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled={!onRevealInFileTree} onSelect={() => onRevealInFileTree?.(change)}>
            <IconListTree className="size-4" />
            {contextMenuLabels.revealInFileTree}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isExpanded ? (
        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden bg-background">
          {isDiffLoading ? (
            <div className="flex items-center justify-center py-4 text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: `common.loading` })}
            </div>
          ) : diffState?.availability === `patch` && renderMode.kind === `plain-text` ? (
            <div ref={findContentRef} className="w-full min-w-0">
              <PlainTextDiffPreview lines={renderMode.lines} codePreviewSettings={codePreviewSettings} />
            </div>
          ) : diffState?.availability === `patch` && renderMode.kind === `patch` && diffState.patch ? (
            <div ref={findContentRef} className="w-full min-w-0">
              <DiffViewer
                patch={diffState.patch}
                diffClassName="block"
                fontSizePx={codePreviewSettings.fontSizePx}
                lightTheme={codePreviewSettings.lightTheme}
                darkTheme={codePreviewSettings.darkTheme}
                themeType={resolvedTheme}
              />
            </div>
          ) : diffState?.availability === `patch` && diffState.afterContent !== null && filePair ? (
            <div ref={findContentRef} className="w-full min-w-0">
              <DiffViewer
                oldFile={filePair.oldFile}
                newFile={filePair.newFile}
                diffClassName="block"
                fontSizePx={codePreviewSettings.fontSizePx}
                lightTheme={codePreviewSettings.lightTheme}
                darkTheme={codePreviewSettings.darkTheme}
                themeType={resolvedTheme}
              />
            </div>
          ) : (
            <div className="px-4 py-3 text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: resolveDiffUnavailableI18nId(diffState?.availability ?? `unavailable`) })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** BWt 的 props（原 js 178584 解构面；onClose 保留但未在体内使用） */
export interface GitChangesPanelProps {
  workspacePath: string;
  gitState: GitPaneState;
  isDesktop: boolean;
  selectedSourceId: string;
  fileChangeFindActiveIndex: number;
  fileChangeFindNavigationRequestId: number | null;
  fileChangeFindQuery: string;
  onFileChangeFindMatchCountChange: (total: number) => void;
  onSelectSource: (sourceId: string) => void;
  onClose: () => void;
  onRefresh: () => void;
  onRevealFileInTree?: (path: string) => void;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}

/**
 * 原 BWt（js 178837 / jsx 144748）：GitChangesPanel —— 侧面板「审查」标签主体。
 * testid `git-pane`（原 ine，src-HCld2afU.js 8239）。
 */
export function GitChangesPanel({
  workspacePath,
  gitState,
  isDesktop,
  selectedSourceId,
  fileChangeFindActiveIndex,
  fileChangeFindNavigationRequestId,
  fileChangeFindQuery,
  onFileChangeFindMatchCountChange,
  onSelectSource,
  onClose,
  onRefresh,
  onRevealFileInTree,
  workspaceIdentity,
  workspaceRemoteSessionId,
}: GitChangesPanelProps) {
  const { gitService } = useServices() as unknown as { gitService: GitService } // A0-CLEANUP3 3b：ResolvedBaseServices 交集型与投射面不再直接可比，二段断言;
  const { intl } = useIntlContext();
  const theme = useSettingsSelector((state) => state.theme);
  const codePreviewSettings = useSettingsSelector((state) => state.codePreviewSettings) as CodePreviewSettings;
  const remoteInfo = useWorkspaceRemoteInfo({ workspacePath, workspaceIdentity, workspaceRemoteSessionId }) as { isRemoteWorkspace: boolean; remoteTarget?: RemoteTarget };
  const fileActions = useFileContextActions({
    canOpenLocalFileManager: !!isDesktop,
    isRemoteWorkspace: !!(workspaceRemoteSessionId || workspaceIdentity?.trim()) || remoteInfo.isRemoteWorkspace,
    remoteTarget: remoteInfo.remoteTarget,
    workspaceIdentity,
  });
  const resolvedTheme = resolveTheme(theme);
  const [expandedPath, setExpandedPath] = React.useState<string | null>(null);
  const [diffCache, setDiffCache] = React.useState<Record<string, DiffCacheEntry>>({});
  const revisionRef = React.useRef(0);
  const inflightRef = React.useRef(new Set<string>());
  const findContentRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const firstSource = gitState.sourceOptions[0];
  const activeSource = gitState.sourceOptions.find((option) => option.id === selectedSourceId) ?? firstSource;
  const activeDataset = gitState.datasets[activeSource.id] ?? gitState.datasets.unstaged;
  const changes = React.useMemo(() => activeDataset.sections.flatMap((section) => section.changes), [activeDataset]);
  const findQuery = fileChangeFindQuery.trim();

  // 空态文案 6 档：上一轮（无任务快照）/ 加载中 / 错误 / 空 / 非仓库 / 无 git
  const emptyState = React.useMemo(
    () =>
      activeSource.id === `last-turn`
        ? {
            title: intl.formatMessage({ id: `git.empty.lastTurnTitle` }),
            description: intl.formatMessage({ id: `git.empty.lastTurnDescription` }),
          }
        : gitState.loading
          ? {
              title: intl.formatMessage({ id: `common.loading` }),
              description: intl.formatMessage({ id: `git.loading.description` }),
            }
          : gitState.error
            ? {
                title: intl.formatMessage({ id: `git.error.title` }),
                description: intl.formatMessage({ id: `git.error.description` }, { message: gitState.error }),
              }
            : gitState.summary.isGitAvailable
              ? gitState.summary.isRepository
                ? {
                    title: intl.formatMessage({ id: `git.empty.title` }),
                    description: intl.formatMessage({ id: `git.empty.description` }),
                  }
                : {
                    title: intl.formatMessage({ id: `git.empty.notRepositoryTitle` }),
                    description: intl.formatMessage({ id: `git.empty.notRepositoryDescription` }),
                  }
              : {
                  title: intl.formatMessage({ id: `git.empty.gitUnavailableTitle` }),
                  description: intl.formatMessage({ id: `git.empty.gitUnavailableDescription` }),
                },
    [activeSource.id, gitState.error, gitState.loading, gitState.summary.isGitAvailable, gitState.summary.isRepository, intl],
  );

  // 新 revision（刷新/换工作区）→ 作废 diff 缓存
  React.useEffect(() => {
    revisionRef.current += 1;
    inflightRef.current.clear();
    setDiffCache({});
  }, [gitState.revision, workspacePath]);

  // 展开的文件从列表消失 → 收起
  React.useEffect(() => {
    if (expandedPath && !changes.some((change) => change.path === expandedPath)) setExpandedPath(null);
  }, [changes, expandedPath]);

  // 懒加载单文件 diff（last-turn 自带内联 diff，跳过；在途去重；revision 守卫）
  const loadDiff = React.useCallback(
    (change: GitFileChange, sourceId: string) => {
      if (sourceId === `last-turn` || change.diff) return;
      const key = diffCacheKey(sourceId, change.path);
      if (inflightRef.current.has(key) || diffCache[key]?.diff) return;
      inflightRef.current.add(key);
      setDiffCache((prev) => ({ ...prev, [key]: { loading: true, diff: prev[key]?.diff ?? null } }));
      const requestRevision = revisionRef.current;
      gitService
        .getDiff({ workspacePath, path: change.path, sourceId })
        .then((diff) => {
          if (revisionRef.current !== requestRevision) return;
          logger.debug(`[GitPane] diff 已加载`, {
            workspacePath,
            sourceId,
            path: change.path,
            availability: diff.availability,
            beforeChars: diff.beforeContent?.length ?? 0,
            afterChars: diff.afterContent?.length ?? 0,
          });
          setDiffCache((prev) => ({ ...prev, [key]: { loading: false, diff } }));
        })
        .catch((error) => {
          if (revisionRef.current !== requestRevision) return;
          const message = extractDiffErrorMessage(error);
          logger.warn(`[GitPane] 读取文件 diff 失败`, {
            workspacePath,
            sourceId,
            path: change.path,
            error: message,
          });
          setDiffCache((prev) => ({
            ...prev,
            [key]: {
              loading: false,
              diff: {
                path: change.path,
                availability: `unavailable`,
                patch: null,
                beforeContent: null,
                afterContent: null,
                summary: message,
              },
            },
          }));
        })
        .finally(() => {
          inflightRef.current.delete(key);
        });
    },
    [diffCache, gitService, workspacePath],
  );

  // 展开文件在来源切换后补拉 diff
  React.useEffect(() => {
    if (!expandedPath) return;
    const change = changes.find((candidate) => candidate.path === expandedPath);
    if (change) loadDiff(change, activeDataset.id);
  }, [changes, activeDataset.id, expandedPath, loadDiff]);

  // 查找内容 = patch 的 before+after 拼接（仅 patch 可用时参与匹配）
  const findFiles = React.useMemo(
    () =>
      changes.map((change) => {
        const diff = change.diff ?? diffCache[diffCacheKey(activeDataset.id, change.path)]?.diff ?? null;
        return {
          path: change.path,
          content:
            diff?.availability === `patch`
              ? `${diff.beforeContent ?? ``}\n${diff.afterContent ?? ``}`
              : null,
        };
      }),
    [changes, activeDataset.id, diffCache],
  );
  const findResult = React.useMemo(() => computeFileChangeFindMatches(findFiles, fileChangeFindQuery, fileChangeFindActiveIndex), [fileChangeFindActiveIndex, fileChangeFindQuery, findFiles]);
  const activeMatch = findResult.activeMatch;

  const virtualizer = useVirtualizer({
    count: changes.length,
    getItemKey: (index) => {
      const change = changes[index];
      return change ? `${activeDataset.id}:${change.path}` : `${activeDataset.id}:${index}`;
    },
    getScrollElement: () => scrollRef.current,
    estimateSize: () => GIT_CHANGE_ROW_ESTIMATE_PX,
    overscan: GIT_CHANGE_LIST_OVERSCAN,
  });
  const virtualItems = virtualizer.getVirtualItems();

  // 查找匹配数上报（供工作区壳查找条显示 x/N）
  React.useEffect(() => {
    onFileChangeFindMatchCountChange(findResult.total);
  }, [findResult.total, onFileChangeFindMatchCountChange]);

  // 展开/来源变化 → 重测行高
  React.useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, activeDataset.id, expandedPath]);

  // 有查找词 → 预拉全部 diff（否则内容串为 null 匹配不到）
  React.useEffect(() => {
    if (findQuery) for (const change of changes) loadDiff(change, activeDataset.id);
  }, [changes, activeDataset.id, loadDiff, findQuery]);

  // 活动匹配 → 展开命中文件并拉 diff（原：e && (x !== R.path && S(R.path), F(e, j.id))）
  React.useEffect(() => {
    if (!activeMatch) return;
    const change = changes.find((candidate) => candidate.path === activeMatch.path);
    if (!change) return;
    if (expandedPath !== activeMatch.path) setExpandedPath(activeMatch.path);
    loadDiff(change, activeDataset.id);
    // 原依赖：[activeMatch, changes, activeDataset.id, expandedPath, fileChangeFindNavigationRequestId, loadDiff]
  }, [activeMatch, changes, activeDataset.id, expandedPath, fileChangeFindNavigationRequestId, loadDiff]);

  // 活动匹配 → 滚动居中
  React.useEffect(() => {
    if (!activeMatch) return;
    const index = changes.findIndex((candidate) => candidate.path === activeMatch.path);
    if (index < 0) return;
    virtualizer.scrollToIndex(index, { align: `center` });
  }, [activeMatch, virtualizer, changes, fileChangeFindNavigationRequestId]);

  const handleSelectSource = (sourceId: string) => {
    logger.info(`[GitPane] 切换来源 workspace=${workspacePath} source=${sourceId}`);
    onSelectSource(sourceId);
    setExpandedPath(null);
  };

  const handleOpenChange = (change: GitFileChange, expanded: boolean) => {
    logger.info(`[GitPane] 切换文件展开 workspace=${workspacePath} source=${activeSource.id} path=${change.path} expanded=${expanded}`);
    setExpandedPath(expanded ? change.path : null);
    if (expanded) loadDiff(change, activeDataset.id);
  };

  const resolveAbsolutePath = React.useCallback(
    (change: GitFileChange) => (isAbsolutePath(change.path) ? change.path : joinPath(workspacePath, change.path)),
    [workspacePath],
  );
  const handleCopyAbsolutePath = React.useCallback(
    (change: GitFileChange) => {
      fileActions.copyAbsolutePath({ path: resolveAbsolutePath(change) });
    },
    [fileActions, resolveAbsolutePath],
  );
  const handleCopyRelativePath = React.useCallback(
    (change: GitFileChange) => {
      fileActions.copyRelativePath({ path: resolveAbsolutePath(change), relativePath: toRelativePath(workspacePath, resolveAbsolutePath(change)) });
    },
    [fileActions, resolveAbsolutePath, workspacePath],
  );
  const handleRevealInFileManager = React.useCallback(
    (change: GitFileChange) => {
      fileActions.revealInFileManager({ path: resolveAbsolutePath(change), deleted: change.kind === `deleted`, kind: `file` });
    },
    [fileActions, resolveAbsolutePath],
  );
  const handleRevealInFileTree = React.useCallback(
    (change: GitFileChange) => {
      onRevealFileInTree?.(resolveAbsolutePath(change));
    },
    [onRevealFileInTree, resolveAbsolutePath],
  );
  const contextMenuLabels = React.useMemo(
    () => ({
      copyAbsolutePath: intl.formatMessage({ id: `fileActions.copyAbsolutePath` }),
      copyRelativePath: intl.formatMessage({ id: `fileActions.copyRelativePath` }),
      revealInFileManager: intl.formatMessage({ id: `git.changeContext.revealInFileManager` }),
      revealInFileTree: intl.formatMessage({ id: `git.changeContext.revealInFileTree` }),
    }),
    [intl],
  );

  return (
    <section
      data-testid="git-pane"
      className="flex h-full min-h-0 flex-col bg-background"
    >
      {/* 头部：来源下拉（未暂存/已暂存/全部分支更改/上一轮更改）+ 刷新 */}
      <div className="flex items-center justify-between gap-3 p-3">
        <Select value={activeSource.id} onValueChange={handleSelectSource}>
          <SelectTrigger className="max-w-full" size="lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {gitState.sourceOptions.map((option) => (
              <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
                {intl.formatMessage({ id: resolveGitSourceI18nId(option.id) })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="lg" disabled={gitState.loading} onClick={onRefresh}>
            <IconRefreshCw className={cn(`size-3.5`, gitState.loading && `animate-spin`)} />
            {intl.formatMessage({ id: `git.action.refresh` })}
          </Button>
        </div>
      </div>
      {/* 主体：虚拟列表 ∥ 空态 */}
      <div className="min-h-0 flex-1">
        {changes.length > 0 ? (
          <div ref={scrollRef} className="h-full min-h-0 w-full overflow-auto">
            <div className="relative w-full min-w-0" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualItems.map((virtualItem) => {
                const change = changes[virtualItem.index];
                if (!change) return null;
                const isExpanded = expandedPath === change.path;
                const cacheEntry = diffCache[diffCacheKey(activeDataset.id, change.path)];
                const diffState = change.diff ?? cacheEntry?.diff ?? null;
                const isDiffLoading = isExpanded && !change.diff && (!cacheEntry || cacheEntry.loading);
                return (
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    className="absolute left-0 w-full min-w-0"
                    data-git-pane-change-virtual-row={true}
                    data-index={virtualItem.index}
                    style={{ top: `${virtualItem.start}px` }}
                  >
                    <GitChangeRow
                      change={change}
                      contextMenuLabels={contextMenuLabels}
                      diffState={diffState}
                      isDiffLoading={isDiffLoading}
                      isExpanded={isExpanded}
                      canRevealInFileManager={fileActions.canRevealInFileManager({
                        path: resolveAbsolutePath(change),
                        deleted: change.kind === `deleted`,
                      })}
                      codePreviewSettings={codePreviewSettings}
                      resolvedTheme={resolvedTheme}
                      findContentRef={isExpanded ? findContentRef : void 0}
                      onCopyAbsolutePath={handleCopyAbsolutePath}
                      onCopyRelativePath={handleCopyRelativePath}
                      onOpenChange={handleOpenChange}
                      onRevealInFileManager={handleRevealInFileManager}
                      onRevealInFileTree={onRevealFileInTree ? handleRevealInFileTree : void 0}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <IconFileText className="size-8 text-foreground-subtlest" />
            <p className="mt-3 text-ui-base font-medium text-foreground">{emptyState.title}</p>
            <p className="mt-1 text-ui-base text-foreground-subtle">{emptyState.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
 * C. 文件撤销：FileRewindDialog（js 110586–110812 / jsx 94563–94670）
 * ----------------------------------------------------------------------------
 * Codex 式「按轮撤销文件改动」的确认对话框。调用方 S_t TurnFileChangesSummary
 * （js 110813，已在 Conversation.tsx 逐字抽取）的「撤销」按钮先
 * previewFileRewind 预检，再打开本对话框；确认后 applyFileRewind。
 * 「rewind 选择器」= 安全/不安全/已忽略 三段文件列表（每文件显示修改次数或
 * 跳过原因）；「锚点 dim」= 撤销后轮文件卡进入 reverted 态：显示「已撤销」
 * 徽章、撤销按钮禁用（S_t 内 `x = state === 'reverted'` 门控，见
 * Conversation.tsx §5.14）；editConflict 变体则是行内编辑「重置会话与文件」
 * 被文件冲突阻断时的锚点对话框（只给「仅继续对话」出口）。
 * ==========================================================================*/

/** 撤销预检中的文件条目：可安全撤销记修改次数，否则记跳过原因 */
export type RewindFileEntry =
  | { path: string; operationCount: number }
  | { path: string; reason: RewindSkipReason };

export type RewindSkipReason =
  | "bash_ignored"
  | "checkpoint_missing"
  | "checkpoint_unreadable"
  | "external_modified"
  | "file_read_failed"
  | "unsupported_checkpoint";

/** 预检结果（原 previewFileRewind 返回） */
export interface FileRewindPreview {
  safeFiles: RewindFileEntry[];
  unsafeFiles: RewindFileEntry[];
  ignoredFiles: RewindFileEntry[];
  canApply: boolean;
}

/** 原 y_t（js 110635）：跳过原因 → i18n（缺省 unsupportedCheckpoint） */
export function formatRewindSkipReason(reason: string, intl: IntlShape): string {
  const fallback = `chat.changeSummary.rewindDialog.reason.unsupportedCheckpoint`;
  const reasonI18nMap: Record<string, string> = {
    bash_ignored: `chat.changeSummary.rewindDialog.reason.bashIgnored`,
    checkpoint_missing: `chat.changeSummary.rewindDialog.reason.checkpointMissing`,
    checkpoint_unreadable: `chat.changeSummary.rewindDialog.reason.checkpointUnreadable`,
    external_modified: `chat.changeSummary.rewindDialog.reason.externalModified`,
    file_read_failed: `chat.changeSummary.rewindDialog.reason.fileReadFailed`,
    unsupported_checkpoint: fallback,
  };
  return intl.formatMessage({ id: reasonI18nMap[reason] ?? fallback });
}

/** 原 f1（js 110647）：撤销对话框文件列表（路径 + 原因/修改次数） */
export function RewindDialogFileList({ files, type }: { files: RewindFileEntry[]; type: string }) {
  const { intl } = useIntlContext();
  return files.length === 0 ? null : (
    <div className="grid gap-1">
      {files.map((file) => (
        <div
          key={`${type}:${file.path}`}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-input/30 px-2 py-1.5"
        >
          <span className="min-w-0 truncate font-mono text-ui-xs text-foreground">{file.path}</span>
          <span className="shrink-0 text-ui-xs text-foreground-subtle">
            {`reason` in file
              ? formatRewindSkipReason(file.reason, intl)
              : intl.formatMessage({ id: `chat.changeSummary.rewindDialog.operationCount` }, { count: String(file.operationCount) })}
          </span>
        </div>
      ))}
    </div>
  );
}

/** b_t 的 props（原 js 110632 解构面） */
export interface FileRewindDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: FileRewindPreview | null;
  previewLoading: boolean;
  applying: boolean;
  error: string | null;
  onApply: () => void;
  /** fileRewind = 轮级撤销；editConflict = 行内编辑重置冲突 */
  variant?: "fileRewind" | "editConflict";
  onConversationOnly?: () => void;
}

/**
 * 原 b_t（js 110680 / jsx 94590）：FileRewindDialog。
 * fileRewind 变体：三段列表（可安全撤销/不能安全撤销/已忽略）+ 红色错误行 +
 *   「存在不安全文件则提示未写入」+ destructive「撤销文件」按钮（!canApply 禁用）。
 * editConflict 变体：标题/描述换成 chat.edit.workspaceConflict.*，testid
 *   v4-edit-workspace-conflict-dialog，底部仅 [取消][仅继续对话]（后者
 *   testid v4-edit-workspace-conflict-conversation-only）。
 */
export function FileRewindDialog({
  open,
  onOpenChange,
  preview,
  previewLoading,
  applying,
  error,
  onApply,
  variant = `fileRewind`,
  onConversationOnly,
}: FileRewindDialogProps) {
  const { intl } = useIntlContext();
  const safeCount = preview?.safeFiles.length ?? 0;
  const unsafeCount = preview?.unsafeFiles.length ?? 0;
  const ignoredCount = preview?.ignoredFiles.length ?? 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        data-testid={variant === `editConflict` ? `v4-edit-workspace-conflict-dialog` : void 0}
      >
        <DialogHeader>
          <DialogTitle>
            {intl.formatMessage({
              id: variant === `editConflict` ? `chat.edit.workspaceConflict.title` : `chat.changeSummary.rewindDialog.title`,
            })}
          </DialogTitle>
          <DialogDescription>
            {intl.formatMessage({
              id: variant === `editConflict` ? `chat.edit.workspaceConflict.description` : `chat.changeSummary.rewindDialog.description`,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[50vh] gap-3 overflow-y-auto pr-1">
          {previewLoading ? (
            <div className="flex items-center gap-2 text-ui-base text-foreground-subtle">
              <SpinnerIcon className="size-3.5 animate-spin" />
              {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.loading` })}
            </div>
          ) : preview ? (
            <>
              {variant === `fileRewind` ? (
                <section className="grid gap-1">
                  <h3 className="text-ui-base font-medium">
                    {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.safeTitle` }, { count: String(safeCount) })}
                  </h3>
                  <RewindDialogFileList files={preview.safeFiles} type="safe" />
                </section>
              ) : null}
              <section className="grid gap-1">
                <h3 className="text-ui-base font-medium">
                  {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.unsafeTitle` }, { count: String(unsafeCount) })}
                </h3>
                <RewindDialogFileList files={preview.unsafeFiles} type="unsafe" />
              </section>
              {ignoredCount > 0 ? (
                <section className="grid gap-1">
                  <h3 className="text-ui-base font-medium">
                    {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.ignoredTitle` }, { count: String(ignoredCount) })}
                  </h3>
                  <RewindDialogFileList files={preview.ignoredFiles} type="ignored" />
                </section>
              ) : null}
            </>
          ) : (
            <p className="text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.noPreview` })}
            </p>
          )}
          {error ? <p className="text-ui-base text-danger">{error}</p> : null}
          {variant === `fileRewind` && preview && !preview.canApply ? (
            <p className="text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.cannotApply` })}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          {variant === `editConflict` ? (
            <>
              <Button type="button" variant="ghost" disabled={applying} onClick={() => onOpenChange(false)}>
                {intl.formatMessage({ id: `common.cancel` })}
              </Button>
              <Button
                type="button"
                disabled={applying || previewLoading}
                data-testid="v4-edit-workspace-conflict-conversation-only"
                onClick={onConversationOnly}
              >
                {applying ? <SpinnerIcon className="animate-spin" /> : null}
                {intl.formatMessage({ id: `chat.edit.workspaceConflict.conversationOnly` })}
              </Button>
            </>
          ) : (
            <Button type="button" variant="destructive" disabled={!preview?.canApply || applying || previewLoading} onClick={onApply}>
              {applying ? <SpinnerIcon className="animate-spin" /> : <IconUndo2 />}
              {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.confirm` })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 文件变更项（原 S_t 内 fetchFileChanges 的条目形；审查/撤销共用） */
export interface TurnFileChangeItem {
  path: string;
  additions: number;
  deletions: number;
  patches: Array<{ oldStart: number; oldLines: number; newStart: number; newLines: number; lines: string[] }>;
}

/**
 * 原 x_t（js 110833）：hunks → unified patch 文本（--- a/ +++ b/ + @@ 头）。
 */
export function buildUnifiedPatch(path: string, patches: TurnFileChangeItem["patches"]): string {
  if (patches.length === 0) return ``;
  const lines = [`--- a/${path}`, `+++ b/${path}`];
  for (const hunk of patches)
    lines.push(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`, ...hunk.lines);
  return lines.join(`\n`);
}

/**
 * 原 p1（js 110841）：「审查」按钮落点 —— 把单文件变更拼成 patch 源，
 * 交给侧面板开 code-viewer 标签（type: 'patch'）。这是「逐文件审查」的入口函数。
 */
export function openFileChangePatchInCodeViewer(item: TurnFileChangeItem, context: FileChangeContextWorkspace): void {
  const patch = buildUnifiedPatch(item.path, item.patches);
  const { workspacePath, workspaceIdentity, workspaceRemoteSessionId, onOpenCodeViewer } = context;
  if (!patch) return;
  if (!onOpenCodeViewer) return;
  onOpenCodeViewer({
    type: `patch`,
    title: resolveRepoRelativePath(workspacePath, item.path),
    path: item.path,
    patch,
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(workspaceRemoteSessionId ? { workspaceRemoteSessionId } : {}),
  });
}

/* ============================================================================
 * D. 代码评论消费面（FH store + 行内评论 → 回流对话 全链路）
 * ----------------------------------------------------------------------------
 * 链路（Codex 式行内评论回流）：
 *   ① 代码查看器（tHt，F14）gutter 选行 → onSubmitCodeComment：
 *      OXe 派发 cancelable window 事件 `zcode:code-comment-add-to-chat`，
 *      并把评论写入 FH store（未被「已回流」集合标记时）；
 *   ② composer 的 JXe 钩子监听该事件 → contexts 列表 → 输入框上方 TH chip
 *      「N 条评论」（悬停展开逐条评论：文件/行号/选中文本/内容，可逐条或整批移除）；
 *   ③ 发送时 GXe/CXe 把评论序列化成 `# Code comments:` markdown 块追加到
 *      消息尾部（## Comment N：File/Side/Lines/Selected text/Comment）；
 *   ④ 历史消息回显时 KXe/DXe 把该块解析回附件，用户行以 TH chip（contentAlign=end）
 *      展示；⑤ 移除评论：chip 移除 → jXe 广播 `code-comment:remove-from-chat`
 *      到其他窗口；查看器删除 → FH.removeComment + kXe 事件 → composer 同步移除。
 *   跨窗口恢复：应用根广播监听 `code-comment:restore-preview`（212714）。
 * ==========================================================================*/

/** 行级评论（FH store 值元素） */
export interface CodeComment {
  id: string;
  sourcePath: string;
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
}

/** 评论作用域（工作区 × 身份 × 文件） */
export interface CodeCommentScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
  sourcePath: string;
}

/** 回流附件（发送后解析回来的形态，含 id 与工作区） */
export interface CodeCommentAttachment {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null; // 〔A1-R22〕型缝：null 放宽——bundle 真形（kH 68415 `workspaceIdentity?.trim()` 消费面；Composer 侧同身型 R8 已含 null），与 Composer.CodeCommentAttachment 结构同一化（chip 行收敛所需）
  sourcePath: string;
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
}

/** 原 EH/DH/gXe（js 68362–68364）：事件名与广播频道 */
export const CODE_COMMENT_ADD_TO_CHAT_EVENT = `zcode:code-comment-add-to-chat`;
export const CODE_COMMENT_REMOVE_FROM_CHAT_EVENT = `zcode:code-comment-remove-from-chat`;
export const CODE_COMMENT_REMOVE_BROADCAST_CHANNEL = `code-comment:remove-from-chat`;

/** 原 OH（js 68365）：已回流（或已被聊天消费）的评论作用域集合 */
const removedCommentScopes = new Set<string>();

/** 原 kH（js 68415）：工作区键 = 身份 ∥ 路径 */
export function commentWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 AH（js 68418）：评论作用域键（工作区键 \0 评论 id） */
export function commentScopeKey(scope: { workspacePath: string; workspaceIdentity?: string | null; id: string }): string {
  return `${commentWorkspaceKey(scope.workspacePath, scope.workspaceIdentity)}\0${scope.id}`;
}

/** 原 _Xe/jH/vXe（js 68427/68376/68379）：已回流集合 读/写/删 */
export function isCommentRemovedFromChat(scope: { workspacePath: string; workspaceIdentity?: string | null; id: string }): boolean {
  return removedCommentScopes.has(commentScopeKey(scope));
}
export function markCommentRemovedFromChat(scope: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void {
  removedCommentScopes.add(commentScopeKey(scope));
}
export function unmarkCommentRemovedFromChat(scope: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void {
  removedCommentScopes.delete(commentScopeKey(scope));
}

/** 原 yXe/bXe（js 68438/68390）：事件类型守卫 */
export function isAddToChatEvent(event: Event): event is CustomEvent<unknown> {
  return (
    event.type === `zcode:code-comment-add-to-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail === `object` &&
    (event as CustomEvent).detail !== null
  );
}
export function isRemoveFromChatEvent(event: Event): event is CustomEvent<unknown> {
  return (
    event.type === `zcode:code-comment-remove-from-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail === `object` &&
    (event as CustomEvent).detail !== null
  );
}

/** 原 MH（js 68446）：移除载荷守卫（id + workspacePath [+ identity]） */
export function isCommentScopePayload(payload: unknown): payload is { id: string; workspacePath: string; workspaceIdentity?: string } {
  const value = payload as Record<string, unknown>;
  return (
    typeof payload === `object` &&
    !!payload &&
    typeof value.id === `string` &&
    value.id.length > 0 &&
    typeof value.workspacePath === `string` &&
    value.workspacePath.length > 0 &&
    (value.workspaceIdentity === void 0 || typeof value.workspaceIdentity === `string`)
  );
}

/** 原 NH（js 68457）：评论附件载荷守卫（全字段类型检查） */
export function isCommentAttachmentPayload(payload: unknown): payload is Omit<CodeCommentAttachment, "id"> & { id?: string } {
  const value = payload as Record<string, unknown>;
  return (
    typeof payload === `object` &&
    !!payload &&
    typeof value.workspacePath === `string` &&
    value.workspacePath.length > 0 &&
    (value.workspaceIdentity === void 0 || typeof value.workspaceIdentity === `string`) &&
    typeof value.sourcePath === `string` &&
    value.sourcePath.length > 0 &&
    typeof value.sourceTitle === `string` &&
    value.sourceTitle.length > 0 &&
    typeof value.selectedText === `string` &&
    typeof value.comment === `string` &&
    Number.isFinite(value.startLine) &&
    Number.isFinite(value.endLine)
  );
}

/** 原 xXe（js 68475）：单条评论 → 「## Comment」markdown 块 */
export function serializeCodeComment(comment: Omit<CodeCommentAttachment, "id" | "workspacePath" | "workspaceIdentity">): string {
  const lineRange = comment.startLine === comment.endLine ? String(comment.startLine) : `${comment.startLine}-${comment.endLine}`;
  return `## Comment\nFile: ${comment.sourcePath ?? comment.sourceTitle}\nSide: R\nLines: ${lineRange}\nSelected text:\n\`\`\`\n${comment.selectedText.trim()}\n\`\`\`\nComment:\n${comment.comment.trim()}\n`;
}

/** 原 SXe（js 68479）：评论列表 → 「# Code comments:」总块（逐条编号） */
export function serializeCodeCommentsBlock(comments: Array<Omit<CodeCommentAttachment, "id" | "workspacePath" | "workspaceIdentity">>): string {
  return comments.length === 0
    ? ``
    : `# Code comments:\n\n${comments.map((comment, index) => serializeCodeComment(comment).replace(`## Comment`, `## Comment ${index + 1}`)).join(`\n`)}`;
}

/** 原 CXe（js 68486）：消息内容 + 评论块 拼接（空内容时只留评论块） */
export function appendCodeCommentsToContent(
  content: string,
  comments: Array<Omit<CodeCommentAttachment, "id" | "workspacePath" | "workspaceIdentity">>,
): string {
  const trimmed = content.trimEnd();
  const block = serializeCodeCommentsBlock(comments);
  return block
    ? `${trimmed}${trimmed ? `\n\n` : ``}${block}`.trim()
    : trimmed.trim();
}

/** 原 wXe（js 68499）：路径 → 文件名（兼容 \ /） */
export function fileBasename(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

/** 原 TXe（js 68502）：「L3」「3-L7」「L3 - L7」→ 行范围 */
export function parseLineRange(raw: string): { startLine: number; endLine: number } | null {
  const normalized = raw.trim().replace(/^L/i, ``);
  const match = /^(\d+)(?:\s*-\s*L?(\d+))?$/.exec(normalized);
  if (!match) return null;
  const startLine = Number(match[1]);
  const endLine = Number(match[2] ?? match[1]);
  return !Number.isFinite(startLine) || !Number.isFinite(endLine) ? null : { startLine, endLine };
}

/** 原 EXe（js 68510）：「## Comment」块 → 附件（解析失败返回 null） */
export function parseCodeCommentBlock(
  block: string,
  index: number,
  workspacePath: string,
  workspaceIdentity?: string | null,
): CodeCommentAttachment | null {
  const fileMatch = /^File:\s*(.+)$/m.exec(block);
  const linesMatch = /^Lines:\s*(.+)$/m.exec(block);
  const bodyMatch = /Selected text:\s*\n```(?:[^\n`]*)?\n([\s\S]*?)\n```\s*\nComment:\s*\n?([\s\S]*)$/m.exec(block);
  if (!fileMatch || !linesMatch || !bodyMatch) return null;
  const sourcePathRaw = fileMatch[1];
  const lineRangeRaw = linesMatch[1];
  const selectedText = bodyMatch[1];
  const comment = bodyMatch[2];
  if (!sourcePathRaw || !lineRangeRaw || selectedText === void 0 || comment === void 0) return null;
  const range = parseLineRange(lineRangeRaw);
  if (!range) return null;
  const sourcePath = sourcePathRaw.trim();
  const commentText = comment.trim();
  return {
    id: `parsed-code-comment-${index + 1}-${range.startLine}-${range.endLine}`,
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    sourcePath,
    sourceTitle: fileBasename(sourcePath),
    startLine: range.startLine,
    endLine: range.endLine,
    selectedText: selectedText.trim(),
    comment: commentText,
  };
}

/** 原 DXe（js 68536）：发送内容 → {可见文本, 评论附件[]}（尾部评论块被摘除） */
export function splitCodeCommentAttachments(
  content: string,
  workspace: { workspacePath: string; workspaceIdentity?: string | null },
): { visibleContent: string; codeCommentAttachments: CodeCommentAttachment[] } {
  const match = /(?:^|\n\n)# Code comments:\s*\n\n([\s\S]*?)\s*$/.exec(content);
  if (!match || match.index < 0) return { visibleContent: content, codeCommentAttachments: [] };
  const block = match[1];
  if (block === void 0) return { visibleContent: content, codeCommentAttachments: [] };
  const attachments = block
    .split(/\n(?=## Comment(?:\s+\d+)?\n)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => parseCodeCommentBlock(chunk, index, workspace.workspacePath, workspace.workspaceIdentity))
    .filter((attachment): attachment is CodeCommentAttachment => attachment !== null);
  return attachments.length === 0
    ? { visibleContent: content, codeCommentAttachments: [] }
    : { visibleContent: content.slice(0, match.index).trimEnd(), codeCommentAttachments: attachments };
}

/** 原 OXe（js 68551）：派发「加入聊天」事件（cancelable —— 监听方可 preventDefault 拦截回流） */
export function dispatchCodeCommentAddToChat(detail: CodeCommentAddDetail): boolean {
  const event = new CustomEvent(CODE_COMMENT_ADD_TO_CHAT_EVENT, { cancelable: true, detail });
  return !window.dispatchEvent(event);
}

/** 加入聊天事件的 detail（原 Ue 组装面：含查看器侧两个标签文案） */
export interface CodeCommentAddDetail {
  id?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  sourcePath: string;
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
  contextLabel?: string;
  commentLabel?: string;
}

/** 原 kXe（js 68555）：派发「从聊天移除」事件（同时记入已回流集合） */
export function dispatchCodeCommentRemoveFromChat(detail: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void {
  markCommentRemovedFromChat(detail);
  window.dispatchEvent(new CustomEvent(CODE_COMMENT_REMOVE_FROM_CHAT_EVENT, { detail }));
}

/** FH store 状态形（原 js 68514–68579） */
interface CodeCommentsStoreState {
  commentsByBucketKey: Record<string, CodeComment[]>;
  getComments(scope: CodeCommentScope): CodeComment[];
  addComment(req: CodeCommentScope & { comment: CodeComment }): void;
  removeComment(req: CodeCommentScope & { id: string }): void;
  removeCommentBySource(req: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void;
  restoreCommentFromAttachment(attachment: CodeCommentAttachment): void;
  clearSource(scope: CodeCommentScope): void;
}

/** 桶键（原 PH，js 68511）：工作区键 \0 文件路径 */
function codeCommentBucketKey(scope: CodeCommentScope): string {
  return `${commentWorkspaceKey(scope.workspacePath, scope.workspaceIdentity)}\0${scope.sourcePath}`;
}

/** 原 AXe（js 68558）：空评论常量（避免每次新数组） */
const EMPTY_COMMENTS: CodeComment[] = [];

/**
 * 原 FH（js 68562 / jsx 60720）：useCodeCommentsStore —— 行级代码评论 store。
 * commentsByBucketKey 按「工作区键 \0 文件路径」分桶；同 id 覆盖写；
 * removeCommentBySource 跨桶按 id 清除；restoreCommentFromAttachment 先解除
 * 「已回流」标记再写回（发送后重新打开查看器时恢复显示）。
 * ── tombstone（A1-R8 双实例收敛）：本地 create 删除 → 改指 canonical
 *    modules/Composer.tsx useCodeCommentsStore（bundle 唯一 FH@68562；A0 期行号
 *    68514 为 TXe 助手位，FH 实体在 68562，更正登记）。本文件消费面 2290/2606/
 *    2676/2681（jXe/Ue-We/g8t 助手转录）经 import 改指逐字不变。导出面维系：
 *    modules/GitReview.tsx 277 行 re-export 不破（零终端拉取，留面备查）。
 *    本地 CodeCommentsStoreState 型面（2178）随 create 删除失引，保留备查。 ── */
export { useCodeCommentsStore };

/** 广播服务（原 ie?.broadcastService，横切层；仅列本族用到的面） */
interface BroadcastService {
  send(req: { channel: string; payload: unknown }): Promise<unknown>;
}

/**
 * 原 jXe（js 68628 / jsx 60796）：移除评论并跨窗口广播。
 * 先记「已回流」、本地按源清除，再经广播频道通知其他窗口（失败仅 warn）。
 */
export function removeCodeCommentAndBroadcast(
  scope: { id: string; workspacePath: string; workspaceIdentity?: string | null },
  broadcastService?: BroadcastService,
): void {
  const payload = {
    id: scope.id,
    workspacePath: scope.workspacePath,
    ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
  };
  markCommentRemovedFromChat(payload);
  useCodeCommentsStore.getState().removeCommentBySource(payload);
  if (broadcastService)
    try {
      Promise.resolve(broadcastService.send({ channel: CODE_COMMENT_REMOVE_BROADCAST_CHANNEL, payload })).catch((error) => {
        logger.warn(`[v4-composer] code comment preview 广播失败: ${String(error)}`);
      });
    } catch (error) {
      logger.warn(`[v4-composer] code comment preview 广播失败: ${String(error)}`);
    }
}

/**
 * 原 qXe（js 68852）：评论 id 生成（crypto.randomUUID 缺省回退）。
 */
export function newCodeCommentId(): string {
  return typeof crypto < `u` && `randomUUID` in crypto
    ? crypto.randomUUID()
    : `code-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── tombstone（A1-R22）：JXe/TH/hXe/KH 双副本裁定——bundle 唯一真身 JXe 68860 / TH 68298 /
 *    hXe 68295 / KH 68857（本文件旧注 68812/68250/68246/68809 为漂移行）。本文件 A1-R12 并行重建
 *    四副本（codeCommentIdentityKey/useCodeCommentContexts/codeCommentContextKey/CodeCommentsChip）
 *    降为 Composer 逐字 canonical 的 re-export（modules/Composer.tsx [B14]/[B16]）；
 *    modules/GitReview 导出面不变。终端消费实测：Home 经 modules/GitReview 消费
 *    useCodeCommentContexts + type CodeCommentAttachment（bundle 90781 面）；余三符全树零消费
 *    （负证据，grep 实证）。 ── */
export {
  useCodeCommentContexts,
  CodeCommentsChip,
  codeCommentContextKey,
  codeCommentContextKey as codeCommentIdentityKey,
} from '../../modules/Composer';

/** JXe 返回形（原 js 68866） */
export interface CodeCommentContextsApi {
  contexts: CodeCommentAttachment[];
  hasContexts: boolean;
  removeContext: (scope: { id: string; workspacePath: string; workspaceIdentity?: string | null }) => void;
  clearContexts: () => void;
  getContexts: () => CodeCommentAttachment[];
}

/* --- 发送管线助手（原 68778–68803；conversationSelections/webElements/pptxElements
       的序列化器属 Composer 族，此处按接口声明） --- */

/* ── tombstone（A1-R22）：interface ConversationSelectionRef（本地开放索引签名镜像）删除 → type import
 *    Composer.ConversationSelection（属主 F03 域；A0-CLEANUP2 item 11 同模式）。 ── */
// A0-CLEANUP2 item 11：WebElementContext 本地镜像删除 → 改自 Composer 类型导入（属主 zXe 族）。
/** pptx 元素引用（原 _ 消费面） */
interface PptxElementRef { [key: string]: unknown }

declare function appendSelectionsToContent(content: string, selections: ConversationSelection[]): string;
// A0-CLEANUP2 item 11：appendWebElementsToContent declare 删除 → import { appendWebElementsToContent } from './Composer'（属主导出，原注释「属主未导出，待登记」）。
declare function appendPptxElementsToContent(content: string, pptxElements: PptxElementRef[]): string;
declare function parseSelectionReferences(content: string): { visibleContent: string; references: ConversationSelection[] };
declare function splitWebElementContexts(content: string, workspace: { workspacePath: string; workspaceIdentity?: string | null }): { visibleContent: string; webElementContexts: WebElementContext[] };
declare function splitPptxElementReferences(content: string): { visibleContent: string; pptxElementReferences: PptxElementRef[] };

/** 附件上下文集合（原 GH/KXe 的消费形） */
export interface AttachmentContextBundle {
  codeComments: CodeCommentAttachment[];
  conversationSelections: ConversationSelection[];
  webElements: WebElementContext[];
  pptxElements: PptxElementRef[];
}

/** 原 GH（js 68825）：上下文附件总数（供消息行上下文计数） */
export function countContextAttachments(bundle: AttachmentContextBundle): number {
  return bundle.codeComments.length + bundle.conversationSelections.length + bundle.webElements.length + bundle.pptxElements.length;
}

/** 原 GXe（js 68833）：发送内容装配 = 文本 + 引用 + 代码评论 + 网页元素 + pptx 元素 */
export function buildOutboundContentWithAttachments(content: string, bundle: AttachmentContextBundle): string {
  // bundle GXe：_(zXe(CXe(Moe(e, selections), codeComments), webElements), pptxElements)——接线时按束真对齐（原重建层调用错位一层）。
  return appendPptxElementsToContent(
    appendWebElementsToContent(
      appendCodeCommentsToContent(appendSelectionsToContent(content, bundle.conversationSelections), bundle.codeComments),
      bundle.webElements,
    ),
    bundle.pptxElements,
  );
}

/** 原 KXe（js 68839）：草稿/历史内容 → 可见文本 + 四类附件（解析顺序：pptx → 网页 → 评论 → 引用） */
export function parseDraftContentIntoAttachments(
  rawContent: string,
  workspace: { workspacePath: string; workspaceIdentity?: string | null },
): { visibleContent: string } & AttachmentContextBundle {
  const withPptx = splitPptxElementReferences(rawContent);
  const withWeb = splitWebElementContexts(withPptx.visibleContent, workspace);
  const withComments = splitCodeCommentAttachments(withWeb.visibleContent, workspace);
  const withSelections = parseSelectionReferences(withComments.visibleContent);
  return {
    visibleContent: withSelections.visibleContent,
    codeComments: withComments.codeCommentAttachments,
    conversationSelections: withSelections.references,
    webElements: withWeb.webElementContexts,
    pptxElements: withPptx.pptxElementReferences,
  };
}

/**
 * 代码查看器侧评论动作（原 tHt 内 Ue/We，js 161313–161360）。
 * 提交：OXe 事件回流 + 未回流过时写 FH store；删除：FH 移除 + kXe 事件。
 * （行选择 gutter 机制 = El，js 6062–6881，F14 基建，本文件不展开。）
 */
export function useCodeViewerCommentActions(scope: {
  sourcePath: string | null;
  sourceTitle?: string;
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}): {
  handleSubmitComment: (req: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => void;
  handleDeleteComment: (commentId: string) => void;
} {
  const { intl } = useIntlContext();
  const addComment = useCodeCommentsStore((state) => state.addComment);
  const removeComment = useCodeCommentsStore((state) => state.removeComment);

  const handleSubmitComment = React.useCallback(
    (req: { range: { startLine: number; endLine: number }; selectedText: string; comment: string }) => {
      if (!scope.sourcePath || !scope.workspacePath) return;
      const commentText = req.comment.trim();
      const commentId = newCodeCommentId();
      dispatchCodeCommentAddToChat({
        id: commentId,
        workspacePath: scope.workspacePath,
        workspaceIdentity: scope.workspaceIdentity,
        sourcePath: scope.sourcePath,
        sourceTitle: scope.sourceTitle ?? scope.sourcePath,
        startLine: req.range.startLine,
        endLine: req.range.endLine,
        selectedText: req.selectedText,
        comment: commentText,
        contextLabel: intl.formatMessage({ id: `codeViewer.comment.contextLabel` }),
        commentLabel: intl.formatMessage({ id: `codeViewer.comment.commentLabel` }),
      });
      if (!isCommentRemovedFromChat({ id: commentId, workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity })) {
        addComment({
          workspacePath: scope.workspacePath,
          workspaceIdentity: scope.workspaceIdentity,
          sourcePath: scope.sourcePath,
          comment: {
            id: commentId,
            sourcePath: scope.sourcePath,
            sourceTitle: scope.sourceTitle ?? scope.sourcePath,
            startLine: req.range.startLine,
            endLine: req.range.endLine,
            selectedText: req.selectedText,
            comment: commentText,
          },
        });
      }
    },
    [addComment, intl, scope.sourcePath, scope.sourceTitle, scope.workspaceIdentity, scope.workspacePath],
  );

  const handleDeleteComment = React.useCallback(
    (commentId: string) => {
      if (!scope.sourcePath || !scope.workspacePath) return;
      removeComment({
        workspacePath: scope.workspacePath,
        workspaceIdentity: scope.workspaceIdentity,
        sourcePath: scope.sourcePath,
        id: commentId,
      });
      dispatchCodeCommentRemoveFromChat({ id: commentId, workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity });
    },
    [removeComment, scope.sourcePath, scope.workspaceIdentity, scope.workspacePath],
  );

  return { handleSubmitComment, handleDeleteComment };
}

/**
 * 应用根广播桥（原 g8t 内监听，js 212711–212719）：
 * `code-comment:restore-preview` → 从附件恢复评论到 store；
 * `code-comment:remove-from-chat` → 记已回流 + 按源清除。
 * 此处抽成纯函数，供 App root 的 broadcastService.onMessage 分派。
 */
export function handleCodeCommentBroadcastMessage(message: {
  channel: string;
  payload: unknown;
}): boolean {
  if (message.channel === `code-comment:restore-preview`) {
    if (!isCommentAttachmentPayload(message.payload) || !message.payload.id) return true;
    useCodeCommentsStore.getState().restoreCommentFromAttachment({ ...message.payload, id: message.payload.id });
    return true;
  }
  if (message.channel === CODE_COMMENT_REMOVE_BROADCAST_CHANNEL && isCommentScopePayload(message.payload)) {
    markCommentRemovedFromChat(message.payload);
    useCodeCommentsStore.getState().removeCommentBySource(message.payload);
    return true;
  }
  return false;
}

/* ============================================================================
 * E. Git 工具 mini 浮卡（状态面板 environment 段，js 96895–98008 + 98270–98452）
 * ----------------------------------------------------------------------------
 * 会话列右上浮动摘要栏（Flt，TopBar.tsx 已抽取）里的「Git 工具」段
 * （chat.statusPanel.environment = 「Git 工具」）：更改行（点击 → 打开审查
 * 标签，携带 worktree 来源）+ zZ 分支 chip（TopBar.tsx）+ Rct 提交/推送入口。
 * ==========================================================================*/

/** 原 wct（js 97014）：git 动作 id 集 */
export const GIT_ACTION_IDS = [`commit`, `commitAndPush`, `push`] as const;
export type GitActionId = (typeof GIT_ACTION_IDS)[number];

/** 原常量群（js 96967–96974）：输入框 id 与 testid */
export const COMMIT_MESSAGE_INPUT_ID = `git-action-menu-commit-message`;
export const GIT_ACTION_TRIGGER_TESTID = `git-action-trigger`; // Tct
export const GIT_COMMIT_ACTION_COMMAND_TESTID = `git-commit-action-command`; // Ect
export const GIT_COMMIT_ACTION_ITEM_TESTID = `git-commit-action-item`; // Dct
export const GIT_COMMIT_DIALOG_TESTID = `git-commit-dialog`; // Oct
export const GIT_COMMIT_GENERATE_BUTTON_TESTID = `git-commit-generate-button`; // kct
export const GIT_COMMIT_INCLUDE_UNSTAGED_TESTID = `git-commit-include-unstaged`; // Act
export const GIT_COMMIT_MESSAGE_INPUT_TESTID = `git-commit-message-input`; // jct

/** 原 mct（js 96943）：git 动作可用 = 有 git ∧ 在仓库内 */
export function isGitActionAvailable(summary: GitSummary): boolean {
  return summary.isGitAvailable && summary.isRepository;
}

/** 原 hct（js 96946）：主动作解析 —— 有变更→commit，否则可推送→push，再无→null */
export function resolvePrimaryGitAction(flags: { actionAvailable: boolean; commitEnabled: boolean; pushEnabled: boolean }): GitActionId | null {
  return flags.actionAvailable && flags.commitEnabled
    ? `commit`
    : flags.actionAvailable && flags.pushEnabled
      ? `push`
      : null;
}

/** 原 gct（js 96953）：可推送 = 分支型 HEAD ∧ 有名 ∧（无上游 ∥ 领先） */
export function isPushEnabled(summary: GitSummary): boolean {
  const branchName = summary.branchName?.trim() ?? ``;
  return summary.headRefType !== `branch` || branchName.length === 0 ? false : !summary.trackingBranchName || summary.ahead > 0;
}

/** 原 BZ（js 96957）：stage 路径归一化（正斜杠、去 ./ 前缀与尾斜杠） */
export function normalizeStagePath(path: string): string {
  return path
    .trim()
    .replace(/\\/g, `/`)
    .replace(/^\.?\//, ``)
    .replace(/\/+$/, ``);
}

/** 原 _ct（js 96964）：目录路径归一化 */
export function normalizeDirPath(path: string): string {
  return path.trim().replace(/\\/g, `/`).replace(/\/+$/, ``);
}

/** 原 vct（js 96967）：workspace 在仓库中的子路径（缺省 `.`） */
export function resolveWorkspaceInRepoPath(workspaceInRepoPath: string): string {
  const normalized = normalizeStagePath(workspaceInRepoPath);
  return normalized.length > 0 ? normalized : `.`;
}

/** 原 yct（js 96971）：求子路径（大小写不敏感前缀；不含返回 null） */
export function resolveRelativeSubpath(fullPath: string, basePath: string): string | null {
  const normalizedFull = normalizeDirPath(fullPath);
  const normalizedBase = normalizeDirPath(basePath);
  if (!normalizedFull || !normalizedBase) return null;
  if (normalizedFull === normalizedBase) return ``;
  const prefix = `${normalizedBase}/`;
  if (normalizedFull.startsWith(prefix)) return normalizedFull.slice(prefix.length);
  const lowerFull = normalizedFull.toLowerCase();
  const lowerPrefix = prefix.toLowerCase();
  return lowerFull.startsWith(lowerPrefix) ? normalizedFull.slice(prefix.length) : null;
}

/** 原 VZ（js 96982）：收集器写入（空路径忽略） */
export function addStagePath(target: Set<string>, path: string | null): void {
  if (path === null) return;
  const normalized = normalizeStagePath(path);
  if (normalized) target.add(normalized);
}

/** 会话变更摘要（原 activeTaskChangeSummary 的解析形；Sct/bct 消费） */
export interface ActiveTaskChangeSummary {
  added: number;
  removed: number;
  files?: Array<{ path: string }>;
}

/**
 * 原 bct（js 96987）：从任务变更摘要收集本会话 stage 路径集合。
 * 每个路径尝试三种形态（原样 / 相对仓库根 / 相对 workspace），并在
 * workspace 是仓库子目录时补 `子目录/路径` 形态。
 */
export function collectSessionStagePaths(req: {
  summary: ActiveTaskChangeSummary | null;
  gitSummary: GitSummary;
  workspacePath: string;
}): Set<string> | null {
  const paths = parseActiveTaskChangeSummaryPaths(req.summary);
  if (!paths) return null;
  const collected = new Set<string>();
  const workspaceInRepoPath = resolveWorkspaceInRepoPath(req.gitSummary.workspaceInRepoPath);
  for (const path of paths) {
    addStagePath(collected, path);
    addStagePath(collected, resolveRelativeSubpath(path, req.gitSummary.repoRoot));
    addStagePath(collected, resolveRelativeSubpath(path, req.workspacePath));
    const normalized = normalizeStagePath(path);
    if (workspaceInRepoPath !== `.` && !normalized.startsWith(`${workspaceInRepoPath}/`)) addStagePath(collected, `${workspaceInRepoPath}/${normalized}`);
  }
  return collected.size > 0 ? collected : null;
}

/** 原 xct（js 96999）：文件是否属于会话路径集（无集合时全通过） */
export function isFileInSessionPaths(
  file: { stagePath: string; repoRelativePath: string; workspaceRelativePath: string },
  sessionPaths: Set<string> | null,
): boolean {
  return sessionPaths
    ? [file.stagePath, file.repoRelativePath, file.workspaceRelativePath].some((candidate) => sessionPaths.has(normalizeStagePath(candidate)))
    : true;
}

/** 原 Sct（js 97004）：变更摘要 → 去重路径列表（空则 undefined） */
export function parseActiveTaskChangeSummaryPaths(summary: ActiveTaskChangeSummary | null): string[] | undefined {
  const paths = Array.from(new Set((summary?.files ?? []).map((file) => file.path.trim()).filter((path) => path.length > 0)));
  return paths.length > 0 ? paths : void 0;
}

/** 原 Cct（js 97010）：按会话路径过滤提交对话框文件列表 */
export function filterFilesBySessionPaths(req: {
  files: CommitDialogFileRow[];
  summary: ActiveTaskChangeSummary | null;
  gitSummary: GitSummary;
  workspacePath: string;
}): CommitDialogFileRow[] {
  const sessionPaths = collectSessionStagePaths({ summary: req.summary, gitSummary: req.gitSummary, workspacePath: req.workspacePath });
  return req.files.filter((file) => isFileInSessionPaths(file, sessionPaths));
}

/** 原 Mct（js 97023）：动作项 testid */
export function gitActionItemId(actionId: string): string {
  return `${GIT_COMMIT_ACTION_ITEM_TESTID}-${actionId}`;
}

/** 原 Nct（js 97026）：动作 id 守卫 */
export function isGitActionId(value: string): value is GitActionId {
  return (GIT_ACTION_IDS as readonly string[]).includes(value);
}

/** 原 Pct（js 97029）：提交消息文本域判定（键盘导航时识别焦点目标） */
export function isCommitMessageTextarea(target: EventTarget | null): target is HTMLTextAreaElement {
  return target instanceof HTMLTextAreaElement && target.id === COMMIT_MESSAGE_INPUT_ID;
}

/** 提交对话框状态（原 Rct 内 _ 的形） */
export interface GitCommitDialogState {
  summary: GitSummary;
  activeTaskChangeSummary: ActiveTaskChangeSummary | null;
  identity: GitIdentity | null;
  stagedFiles: CommitDialogFileRow[];
  unstagedFiles: CommitDialogFileRow[];
}

/** 提交对话框文件行（原 NZ 的返回元素形） */
export interface CommitDialogFileRow {
  stagePath: string;
  repoRelativePath: string;
  workspaceRelativePath: string;
  kind: GitChangeKind;
  added: number;
  removed: number;
}

/** 原 UZ（js 97032）：按「含未暂存」开关选择文件集 */
export function resolveCommitSelection(state: GitCommitDialogState, includeUnstaged: boolean): CommitDialogFileRow[] {
  return includeUnstaged ? [...state.unstagedFiles, ...state.stagedFiles] : state.stagedFiles;
}

/** 原 WZ（js 97035）：选择集 → 去重 stage 路径 */
export function resolveCommitStagePaths(state: GitCommitDialogState, includeUnstaged: boolean): string[] {
  return Array.from(new Set(resolveCommitSelection(state, includeUnstaged).map((file) => file.stagePath)));
}

/**
 * 原 NZ（js 95065 / jsx 83023）：refresh 的变更列表 → 对话框文件行。
 * 按仓库相对路径去重合并（增删累加；类型不一致退化为 modified），再按路径排序。
 */
export function mapChangeFilesToRows(changes: GitFileChange[]): CommitDialogFileRow[] {
  const byPath = new Map<string, CommitDialogFileRow>();
  for (const change of changes) {
    const existing = byPath.get(change.repoRelativePath);
    if (!existing) {
      byPath.set(change.repoRelativePath, {
        stagePath: change.path,
        repoRelativePath: change.repoRelativePath,
        workspaceRelativePath: change.workspaceRelativePath,
        kind: change.kind,
        added: change.added,
        removed: change.removed,
      });
      continue;
    }
    byPath.set(change.repoRelativePath, {
      ...existing,
      added: existing.added + change.added,
      removed: existing.removed + change.removed,
      kind: existing.kind === change.kind ? existing.kind : `modified`,
    });
  }
  return Array.from(byPath.values()).sort((a, b) => a.repoRelativePath.localeCompare(b.repoRelativePath));
}

/** 原 Est（js 95091）：文件行统计 */
export function summarizeFileRows(rows: CommitDialogFileRow[]): { fileCount: number; totalAdded: number; totalRemoved: number } {
  return rows.reduce(
    (acc, row) => ((acc.fileCount += 1), (acc.totalAdded += row.added), (acc.totalRemoved += row.removed), acc),
    { fileCount: 0, totalAdded: 0, totalRemoved: 0 },
  );
}

/** 原 PZ（js 95124）：提交身份可用 = 未知（null）∥ 有名有邮箱 */
export function hasGitIdentity(identity: GitIdentity | null): boolean {
  return identity === null || (!!identity.userName && !!identity.userEmail);
}

/** 提交上下文（原 commitMessageConversationContext，会话消息供 AI 生成提交消息参考） */
export interface CommitConversationContext { messages: unknown[] }

/** Fct 的 props（原 js 96990） */
export interface GitActionMenuItemProps {
  id: GitActionId;
  icon: React.ReactNode;
  label: string;
  shortcutLabel?: string;
  disabled: boolean;
  loading: boolean;
  onSelect: () => void;
}

/** 原 Fct（js 97038）：cmdk 动作项（图标 ∥ spinner + 文案 + 快捷键角标） */
export function GitActionMenuItem({ id, icon, label, shortcutLabel: shortcut, disabled, loading, onSelect }: GitActionMenuItemProps) {
  return (
    <CommandItem
      data-testid={gitActionItemId(id)}
      value={id}
      disabled={disabled}
      onSelect={() => {
        if (!disabled) onSelect();
      }}
      className={cn(`h-9 px-2.5 py-1.5 font-medium`, disabled ? `cursor-default text-foreground-subtlest` : `text-foreground`)}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        {loading ? <IconLoader className="size-4 animate-spin" /> : icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut ? <CommandShortcut>{shortcut}</CommandShortcut> : null}
    </CommandItem>
  );
}

/** Ict 的 props（原 js 97012 解构面） */
export interface GitCommitDialogProps {
  open: boolean;
  loading: boolean;
  state: GitCommitDialogState | null;
  workspacePath: string;
  message: string;
  error: string | null;
  mutationPending: boolean;
  generationPending: boolean;
  includeUnstaged: boolean;
  pushEnabled: boolean;
  onRefreshGit: () => void;
  onOpenChange: (open: boolean) => void;
  onMessageChange: (message: string) => void;
  onIncludeUnstagedChange: (include: boolean) => void;
  onGenerateMessage: () => void;
  onSubmit: () => void;
  onSubmitAndPush: () => void;
  onPushOnly: () => void;
}

/**
 * 原 Ict（js 97060 / jsx 84376）：GitCommitDialog —— AI 提交对话框。
 * 结构：头部 = zZ 分支 chip + ±统计；中部 = 提交消息文本域（右上角
 * 生成/重新生成 popover 按钮）；「包含未暂存的更改」勾选 + 文件数；
 * 底部 = cmdk 三动作列表（提交/提交并推送/推送），↑↓ 循环导航、⏎ 执行，
 * 选中项显示快捷键角标；身份缺失显示警告条。
 */
export function GitCommitDialog({
  open,
  loading,
  state,
  workspacePath,
  message,
  error,
  mutationPending,
  generationPending,
  includeUnstaged,
  pushEnabled,
  onRefreshGit,
  onOpenChange,
  onMessageChange,
  onIncludeUnstagedChange,
  onGenerateMessage,
  onSubmit,
  onSubmitAndPush,
  onPushOnly,
}: GitCommitDialogProps) {
  const { intl, locale } = useIntlContext();
  const [selectedActionId, setSelectedActionId] = React.useState<GitActionId>(`commit`);
  const messageInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const focusedRef = React.useRef(false);
  const numberFormat = new Intl.NumberFormat(locale);
  const identityAvailable = hasGitIdentity(state?.identity ?? null);
  const hasMessage = message.trim().length > 0;
  const pending = mutationPending || generationPending;
  const selectedRows = state ? resolveCommitSelection(state, includeUnstaged) : [];
  const selectedStagePaths = state ? resolveCommitStagePaths(state, includeUnstaged) : [];
  const allFilesCount = state ? resolveCommitStagePaths(state, true).length : 0;
  const { fileCount, totalAdded, totalRemoved } = summarizeFileRows(selectedRows);
  const taskChangeSummary = state?.activeTaskChangeSummary ?? null;
  const displayAdded = taskChangeSummary?.added ?? totalAdded;
  const displayRemoved = taskChangeSummary?.removed ?? totalRemoved;
  const hasSelectedFiles = selectedStagePaths.length > 0;
  const hasUnstagedFiles = !!state?.unstagedFiles.length;
  const commitDisabled = pending || !hasSelectedFiles || (!identityAvailable && state?.identity !== null);
  const pushActionDisabled = pending || !pushEnabled;
  const submitShortcut = shortcutLabel(`⏎`);

  // 三动作定义（提交/提交并推送/推送）
  const actions = React.useMemo(
    () => [
      {
        id: `commit` as GitActionId,
        icon: <IconGitCommitHorizontal className="size-4" />,
        label: intl.formatMessage({ id: `git.actionMenu.commitDialog.action.commit` }),
        disabled: commitDisabled,
        loading: mutationPending,
        onSelect: onSubmit,
      },
      {
        id: `commitAndPush` as GitActionId,
        icon: <IconCloudUpload className="size-4" />,
        label: intl.formatMessage({ id: `git.actionMenu.commitDialog.action.commitAndPush` }),
        disabled: commitDisabled,
        loading: mutationPending,
        onSelect: onSubmitAndPush,
      },
      {
        id: `push` as GitActionId,
        icon: <IconCloudUpload className="size-4" />,
        label: intl.formatMessage({ id: `git.actionMenu.push` }),
        disabled: pushActionDisabled,
        loading: false,
        onSelect: onPushOnly,
      },
    ],
    [commitDisabled, intl, mutationPending, onPushOnly, onSubmit, onSubmitAndPush, pushActionDisabled],
  );

  // 打开时重置选中动作
  React.useEffect(() => {
    if (open) setSelectedActionId(`commit`);
  }, [open]);

  // 就绪后聚焦消息输入框（一次性）
  React.useEffect(() => {
    if (!open) {
      focusedRef.current = false;
      return;
    }
    if (loading || !state || pending || focusedRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
      focusedRef.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pending, loading, open, state]);

  // 选中动作被禁用时自动移到第一个可用动作
  React.useEffect(() => {
    if (!open || loading || !state || pending) return;
    const current = actions.find((action) => action.id === selectedActionId);
    if (current && !current.disabled) return;
    const fallback = actions.find((action) => !action.disabled);
    if (fallback && fallback.id !== selectedActionId) setSelectedActionId(fallback.id);
  }, [pending, actions, loading, open, selectedActionId, state]);

  const runSelectedAction = React.useCallback(() => {
    const action = actions.find((candidate) => candidate.id === selectedActionId);
    if (!action || action.disabled) return;
    action.onSelect();
  }, [actions, selectedActionId]);

  // ↑↓ 在可用动作间循环
  const cycleAction = React.useCallback(
    (delta: number) => {
      setSelectedActionId((current) => {
        const enabled = actions.filter((action) => !action.disabled);
        if (enabled.length === 0) return current;
        const index = enabled.findIndex((action) => action.id === current);
        return index === -1 ? enabled[0]?.id ?? current : enabled[(index + delta + enabled.length) % enabled.length]?.id ?? current;
      });
    },
    [actions],
  );

  const handleListKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== `ArrowDown` && event.key !== `ArrowUp`) return;
      event.preventDefault();
      event.stopPropagation();
      cycleAction(event.key === `ArrowDown` ? 1 : -1);
    },
    [cycleAction],
  );

  // 表单级键盘：文本域内 ↑↓ 也切动作；⏎（原 ta(e,'Enter')）执行选中动作
  const handleFormKeyDownCapture = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (isCommitMessageTextarea(event.target) && (event.key === `ArrowDown` || event.key === `ArrowUp`)) {
        event.preventDefault();
        event.stopPropagation();
        cycleAction(event.key === `ArrowDown` ? 1 : -1);
        return;
      }
      if (shortcutMatches(event, `Enter`)) {
        event.preventDefault();
        event.stopPropagation();
        runSelectedAction();
      }
    },
    [cycleAction, runSelectedAction],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={GIT_COMMIT_DIALOG_TESTID}
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-xl border-popover-border bg-popover p-0 shadow-lg"
        onOpenAutoFocus={(event) => {
          if (!loading && state && !pending) event.preventDefault();
        }}
      >
        {loading ? (
          <div className="flex h-56 items-center justify-center px-5 py-5 text-foreground-subtle">
            <IconLoader className="size-5 animate-spin" />
          </div>
        ) : state ? (
          <form
            className="space-y-0"
            onKeyDownCapture={handleFormKeyDownCapture}
            onSubmit={(event) => {
              event.preventDefault();
              runSelectedAction();
            }}
          >
            {/* 头：分支 chip（TopBar.tsx 已抽取的 zZ）+ ±统计 */}
            <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-3">
              <GitBranchChip
                workspacePath={workspacePath}
                gitSummary={state.summary}
                dirtyFileCount={allFilesCount}
                onRefreshGit={onRefreshGit}
                className="min-w-0 px-0 pt-0"
                triggerClassName="h-7 max-w-64 justify-start rounded-lg px-1.5 text-foreground-subtle hover:bg-hover hover:text-foreground [&>span]:max-w-48"
                popoverSide="bottom"
                popoverClassName="w-80"
                branchListClassName="max-h-56"
                showFooterActions={false}
              />
              <div className="flex shrink-0 items-center gap-1.5 font-mono text-ui-base">
                <span className="text-diff-added">{`+`}{numberFormat.format(displayAdded)}</span>
                <span className="text-diff-removed">{`-`}{numberFormat.format(displayRemoved)}</span>
              </div>
            </div>
            {/* 提交消息输入 + 生成按钮（popover 提示） */}
            <div className="min-h-36 px-4 pb-2">
              <label htmlFor={COMMIT_MESSAGE_INPUT_ID} className="sr-only">
                {intl.formatMessage({ id: `git.actionMenu.commitDialog.messageLabel` })}
              </label>
              <div className="relative">
                <Textarea
                  ref={messageInputRef}
                  data-testid={GIT_COMMIT_MESSAGE_INPUT_TESTID}
                  id={COMMIT_MESSAGE_INPUT_ID}
                  value={message}
                  disabled={pending}
                  placeholder={intl.formatMessage({ id: `git.actionMenu.commitDialog.messagePlaceholder` })}
                  className="field-sizing-fixed min-h-28 rounded-none border-0 bg-transparent px-0 py-2 pr-8 text-ui-base font-medium text-foreground shadow-none placeholder:text-foreground-subtle focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0 md:text-ui-base"
                  onChange={(event) => {
                    onMessageChange(event.target.value);
                  }}
                />
                <PopoverRoot>
                  <PopoverAnchor>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid={GIT_COMMIT_GENERATE_BUTTON_TESTID}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={onGenerateMessage}
                        disabled={pending || !hasSelectedFiles || (!identityAvailable && state.identity !== null)}
                        aria-label={intl.formatMessage({
                          id: hasMessage ? `git.actionMenu.commitDialog.regenerate` : `git.actionMenu.commitDialog.generate`,
                        })}
                        className="absolute right-0 top-1.5 text-foreground-subtle hover:text-foreground"
                      >
                        {generationPending ? <IconLoader className="size-4 animate-spin" /> : <IconSparkles className="size-4" />}
                      </Button>
                    </PopoverTrigger>
                  </PopoverAnchor>
                  <PopoverContent side="top" align="end" sideOffset={6}>
                    {intl.formatMessage({
                      id: hasMessage ? `git.actionMenu.commitDialog.regenerate` : `git.actionMenu.commitDialog.generate`,
                    })}
                  </PopoverContent>
                </PopoverRoot>
              </div>
            </div>
            {/* 包含未暂存 勾选（自绘 checkbox） */}
            <div className="px-2.5 pb-2">
              <button
                type="button"
                role="checkbox"
                data-testid={GIT_COMMIT_INCLUDE_UNSTAGED_TESTID}
                aria-checked={includeUnstaged}
                disabled={pending || !hasUnstagedFiles}
                onClick={() => onIncludeUnstagedChange(!includeUnstaged)}
                className={cn(
                  `flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-ui-base font-medium transition-colors`,
                  pending || !hasUnstagedFiles
                    ? `cursor-default text-foreground-subtle`
                    : `cursor-pointer text-foreground hover:bg-menu-hover`,
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      `flex size-4 items-center justify-center rounded-sm border`,
                      includeUnstaged
                        ? `border-primary bg-primary text-primary-foreground`
                        : `border-border bg-background text-transparent`,
                    )}
                  >
                    <IconCheck className="size-3.5" />
                  </span>
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {intl.formatMessage({ id: `git.actionMenu.commitDialog.includeUnstaged` })}
                </span>
                <span className="shrink-0 text-ui-base font-normal text-foreground-subtle">
                  {intl.formatMessage({ id: `git.actionMenu.commitDialog.changesValue` }, { count: numberFormat.format(fileCount) })}
                </span>
              </button>
            </div>
            {/* 身份警告 / 错误 / 三动作列表 */}
            <div className="border-t border-border/50 px-2.5 py-2">
              {identityAvailable ? null : (
                <div className="mb-1.5 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-ui-base text-warning">
                  <IconCircleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>{intl.formatMessage({ id: `git.actionMenu.commitDialog.identityMissing` })}</p>
                </div>
              )}
              {error ? <p className="px-3 py-1.5 text-ui-base text-destructive">{error}</p> : null}
              <Command
                data-testid={GIT_COMMIT_ACTION_COMMAND_TESTID}
                shouldFilter={false}
                loop={true}
                tabIndex={0}
                value={selectedActionId}
                onValueChange={(value) => {
                  if (isGitActionId(value)) setSelectedActionId(value);
                }}
                onKeyDown={handleListKeyDown}
                aria-label={intl.formatMessage({ id: `git.actionMenu.trigger.ariaLabel` })}
                className="rounded-none bg-transparent p-0 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
              >
                <CommandList className="max-h-none scroll-py-1">
                  {actions.map((action) => (
                    <GitActionMenuItem
                      key={action.id}
                      id={action.id}
                      icon={action.icon}
                      label={action.label}
                      shortcutLabel={selectedActionId === action.id ? submitShortcut : void 0}
                      disabled={action.disabled}
                      loading={action.loading}
                      onSelect={action.onSelect}
                    />
                  ))}
                </CommandList>
              </Command>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Lct 的 props（原 js 97355 解构面） */
export interface GitPushDialogProps {
  open: boolean;
  gitSummary: GitSummary;
  currentBranchLabel: string;
  pushEnabled: boolean;
  error: string | null;
  mutationPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

/**
 * 原 Lct（js 97403 / jsx 84555）：GitPushDialog —— 推送确认对话框。
 * 信息卡 = 分支/远程分支（上游）/同步状态（领先 N / 落后 N）/后续步骤；
 * 无可推送 → 警告条；失败 → 错误摘要 + 只读详情文本域 + 复制按钮（1.5s 已复制态）。
 */
export function GitPushDialog({
  open,
  gitSummary,
  currentBranchLabel,
  pushEnabled,
  error,
  mutationPending,
  onOpenChange,
  onSubmit,
}: GitPushDialogProps) {
  const { intl, locale } = useIntlContext();
  const numberFormat = new Intl.NumberFormat(locale);
  const [copied, setCopied] = React.useState(false);
  const descriptionId = gitSummary.trackingBranchName
    ? `git.actionMenu.pushDialog.description.tracked`
    : `git.actionMenu.pushDialog.description.untracked`;

  const handleCopyError = React.useCallback(() => {
    if (!error) return;
    if (typeof navigator > `u` || !navigator.clipboard?.writeText) {
      toast(intl.formatMessage({ id: `git.actionMenu.pushDialog.error.copyFailed` }, { error: `clipboard-unavailable` }));
      return;
    }
    navigator.clipboard.writeText(error).then(
      () => {
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, 1500);
      },
      (copyError) => {
        const message = copyError instanceof Error ? copyError.message : String(copyError);
        toast(intl.formatMessage({ id: `git.actionMenu.pushDialog.error.copyFailed` }, { error: message }));
      },
    );
  }, [error, intl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="gap-2 px-6 py-5 pb-0">
          <DialogTitle className="text-lg font-medium text-foreground">
            {intl.formatMessage({ id: `git.actionMenu.pushDialog.title` })}
          </DialogTitle>
          <DialogDescription className="text-ui-base leading-6 text-foreground-subtle">
            {intl.formatMessage({ id: descriptionId })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 py-6">
          {!error && (
            <div className="rounded-xl bg-background/30">
              <div className="flex items-start justify-between p-4">
                <div className="text-ui-base font-medium text-foreground">
                  {intl.formatMessage({ id: `git.actionMenu.pushDialog.currentBranchLabel` })}
                </div>
                <div className="flex items-center gap-2 text-ui-base font-medium text-foreground">
                  <IconGitBranch className="size-4 text-foreground-subtle" />
                  <span>{currentBranchLabel}</span>
                </div>
              </div>
              <div className="space-y-3 border-t border-border/50 p-4 text-ui-base">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-ui-base font-medium text-foreground">
                    {intl.formatMessage({ id: `git.actionMenu.pushDialog.upstreamLabel` })}
                  </div>
                  <div className="text-foreground-subtle">
                    {gitSummary.trackingBranchName
                      ? gitSummary.trackingBranchName
                      : intl.formatMessage({ id: `git.actionMenu.pushDialog.upstreamPending` })}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-ui-base font-medium text-foreground">
                    {intl.formatMessage({ id: `git.actionMenu.pushDialog.aheadBehindLabel` })}
                  </div>
                  <div className="text-foreground-subtle">
                    {intl.formatMessage(
                      { id: `git.actionMenu.pushDialog.aheadBehindValue` },
                      { ahead: numberFormat.format(gitSummary.ahead), behind: numberFormat.format(gitSummary.behind) },
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-3">
                  <div className="text-ui-base font-medium text-foreground">
                    {intl.formatMessage({ id: `git.actionMenu.pushDialog.pushLabel` })}
                  </div>
                  <div className="flex items-center gap-2 text-foreground-subtle">
                    <IconArrowUpFromLine className="size-4" />
                    <span>{intl.formatMessage({ id: `git.actionMenu.pushDialog.pushValue` })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {pushEnabled ? null : (
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3 text-ui-base text-warning">
              <IconCircleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{intl.formatMessage({ id: `git.actionMenu.pushDialog.upToDate` })}</span>
            </div>
          )}
          {error ? (
            <>
              <div className="flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3 text-ui-base text-warning">
                <IconCircleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{intl.formatMessage({ id: `git.actionMenu.pushDialog.error.summary` })}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-ui-base font-medium text-foreground">
                    {intl.formatMessage({ id: `git.actionMenu.pushDialog.error.detailsLabel` })}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-ui-base text-foreground-subtle hover:text-foreground"
                    onClick={handleCopyError}
                  >
                    {intl.formatMessage({
                      id: copied ? `git.actionMenu.pushDialog.error.copy.copied` : `git.actionMenu.pushDialog.error.copy`,
                    })}
                  </Button>
                </div>
                <Textarea
                  className="field-sizing-fixed w-full max-w-full min-h-56 rounded-lg border-input-border bg-background/50 px-3 py-3 text-ui-base text-foreground whitespace-pre-wrap break-words placeholder:text-foreground-subtlest focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 md:text-ui-base"
                  readOnly={true}
                  value={error}
                />
              </div>
            </>
          ) : null}
          <DialogFooter className="gap-2 pt-4">
            {error ? (
              <Button type="button" size="lg" onClick={() => onOpenChange(false)} disabled={mutationPending} className="h-10 min-w-0 px-5">
                {intl.formatMessage({ id: `common.close` })}
              </Button>
            ) : (
              <>
                <Button type="button" variant="secondary" size="lg" onClick={() => onOpenChange(false)} disabled={mutationPending} className="h-10 min-w-0 px-5">
                  {intl.formatMessage({ id: `common.cancel` })}
                </Button>
                <Button type="button" size="lg" onClick={onSubmit} disabled={mutationPending || !pushEnabled} className="h-10 min-w-0 px-5">
                  {mutationPending ? <IconLoader className="size-4 animate-spin" /> : null}
                  {intl.formatMessage({ id: `git.actionMenu.pushDialog.confirm` })}
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Rct 的 props（原 js 97609 解构面） */
export interface GitActionMenuProps {
  workspacePath: string;
  workspaceIdentity?: string | null;
  gitSummary: GitSummary;
  activeTaskChangeSummary?: ActiveTaskChangeSummary | null;
  commitMessageConversationContext?: CommitConversationContext | null;
  onRefreshGit: () => void;
  className?: string;
  triggerIconOnly?: boolean;
  /** header = 会话头胶囊；status-row = 摘要栏「Git 工具」段整行按钮 */
  triggerLayout?: "header" | "status-row";
}

/**
 * 原 Rct（js 97657 / jsx 84647）：GitActionMenu —— 提交/推送统一入口。
 * 触发器三形态：会话头胶囊（默认）/ 仅图标 / 状态行（整行点击 = 主动作）。
 * 主动作 = 有变更→提交对话框；无变更可推送→推送对话框。提交对话框打开时
 * refresh 拉全量（含身份），按会话路径过滤文件；生成消息走
 * gitService.generateCommitMessage（locale + 会话文件 + 会话上下文）。
 */
export function GitActionMenu({
  workspacePath,
  workspaceIdentity,
  gitSummary,
  activeTaskChangeSummary = null,
  commitMessageConversationContext = null,
  onRefreshGit,
  className,
  triggerIconOnly = false,
  triggerLayout = `header`,
}: GitActionMenuProps) {
  const { gitService } = useServices() as unknown as { gitService: GitService } // A0-CLEANUP3 3b：ResolvedBaseServices 交集型与投射面不再直接可比，二段断言;
  const { intl, locale } = useIntlContext();
  const [commitDialogOpen, setCommitDialogOpen] = React.useState(false);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogState, setDialogState] = React.useState<GitCommitDialogState | null>(null);
  const [commitMessage, setCommitMessage] = React.useState(``);
  const [commitError, setCommitError] = React.useState<string | null>(null);
  const [includeUnstaged, setIncludeUnstaged] = React.useState(true);
  const [generationPending, setGenerationPending] = React.useState(false);
  const [mutationPending, setMutationPending] = React.useState(false);
  const [pushDialogOpen, setPushDialogOpen] = React.useState(false);
  const [pushError, setPushError] = React.useState<string | null>(null);
  const actionAvailable = isGitActionAvailable(gitSummary);
  const branchDisplayLabel = React.useMemo(
    () =>
      resolveBranchDisplayLabel({
        headRefType: gitSummary.headRefType,
        currentBranchName: gitSummary.branchName,
        detachedLabel: intl.formatMessage({ id: `git.head.detached` }),
        fallbackLabel: intl.formatMessage({ id: `git.branchSwitcher.label` }),
      }),
    [gitSummary.branchName, gitSummary.headRefType, intl],
  );
  const commitEnabled = gitSummary.isDirty;
  const pushEnabled = isPushEnabled(gitSummary);
  const busy = mutationPending || generationPending || dialogLoading;
  const primaryAction = React.useMemo(
    () => resolvePrimaryGitAction({ actionAvailable, commitEnabled, pushEnabled }),
    [actionAvailable, commitEnabled, pushEnabled],
  );
  const primaryActionDisabled = !actionAvailable || busy || primaryAction === null;
  const isStatusRow = triggerLayout === `status-row`;

  // 可用性审计日志（原 Rct 首个 useEffect 逐字）
  React.useEffect(() => {
    logger.info(`[GitActionMenu] 顶部 Git 操作入口可用性变化`, {
      workspacePath,
      available: actionAvailable,
      primaryActionDisabled,
      primaryActionId: primaryAction,
      isGitAvailable: gitSummary.isGitAvailable,
      isRepository: gitSummary.isRepository,
      headRefType: gitSummary.headRefType,
      branchName: gitSummary.branchName,
      trackingBranchName: gitSummary.trackingBranchName,
      isDirty: gitSummary.isDirty,
    });
  }, [
    gitSummary.branchName,
    gitSummary.headRefType,
    gitSummary.isDirty,
    gitSummary.isGitAvailable,
    gitSummary.isRepository,
    gitSummary.trackingBranchName,
    actionAvailable,
    primaryAction,
    primaryActionDisabled,
    workspacePath,
  ]);

  const resetCommitDialog = React.useCallback(() => {
    setCommitDialogOpen(false);
    setDialogLoading(false);
    setDialogState(null);
    setCommitMessage(``);
    setCommitError(null);
    setIncludeUnstaged(true);
    setGenerationPending(false);
  }, []);

  const closePushDialog = React.useCallback(() => {
    setPushDialogOpen(false);
    setPushError(null);
  }, []);

  const openPushDialog = React.useCallback(() => {
    setPushError(null);
    setPushDialogOpen(true);
  }, []);

  // 拉提交对话框状态：refresh（含身份）→ 按会话路径过滤 staged/unstaged
  const loadCommitDialogState = React.useCallback(
    async (opts?: { resetMessage?: boolean }) => {
      setDialogLoading(true);
      setCommitError(null);
      if (opts?.resetMessage) setCommitMessage(``);
      try {
        const result = await gitService.refresh({ workspacePath, includeIdentity: true });
        const unstagedRows = mapChangeFilesToRows(result.unstagedChanges);
        const stagedRows = mapChangeFilesToRows(result.stagedChanges);
        const filteredUnstaged = filterFilesBySessionPaths({ files: unstagedRows, summary: activeTaskChangeSummary, gitSummary: result.summary, workspacePath });
        const filteredStaged = filterFilesBySessionPaths({ files: stagedRows, summary: activeTaskChangeSummary, gitSummary: result.summary, workspacePath });
        setDialogState({
          summary: result.summary,
          activeTaskChangeSummary,
          identity: result.identity,
          stagedFiles: filteredStaged,
          unstagedFiles: filteredUnstaged,
        });
        setIncludeUnstaged(filteredUnstaged.length > 0);
        setDialogLoading(false);
      } catch (error) {
        const message = extractErrorMessage(error);
        logger.warn(`[GitActionMenu] 读取提交弹窗状态失败`, { workspacePath, error: message });
        toast(intl.formatMessage({ id: `git.actionMenu.commitDialog.error.requestFailed` }, { error: message }));
        resetCommitDialog();
      }
    },
    [activeTaskChangeSummary, resetCommitDialog, gitService, intl, workspacePath],
  );

  const openCommitDialog = React.useCallback(async () => {
    setCommitDialogOpen(true);
    setDialogState(null);
    setCommitMessage(``);
    setCommitError(null);
    setIncludeUnstaged(true);
    await loadCommitDialogState({ resetMessage: true });
  }, [loadCommitDialogState]);

  const refreshAndReload = React.useCallback(() => {
    onRefreshGit();
    loadCommitDialogState({ resetMessage: true });
  }, [loadCommitDialogState, onRefreshGit]);

  // AI 生成提交消息（会话文件路径 + 会话上下文一并下发）
  const generateCommitMessage = React.useCallback(
    async (state: GitCommitDialogState, includeUnstagedNow: boolean) => {
      const selectedPaths = resolveCommitStagePaths(state, includeUnstagedNow);
      const sessionPaths = parseActiveTaskChangeSummaryPaths(state.activeTaskChangeSummary);
      logger.info(`[GitActionMenu] 开始生成提交消息`, {
        workspacePath,
        branchName: gitSummary.branchName,
        selectedFileCount: selectedPaths.length,
        currentSessionFileCount: sessionPaths?.length ?? 0,
        includeUnstaged: includeUnstagedNow,
        conversationMessageCount: commitMessageConversationContext?.messages.length ?? 0,
      });
      const result = await gitService.generateCommitMessage({
        workspacePath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        locale,
        includeUnstaged: includeUnstagedNow,
        ...(sessionPaths ? { currentSessionFilePaths: sessionPaths } : {}),
        ...(commitMessageConversationContext ? { conversationContext: commitMessageConversationContext } : {}),
      });
      logger.info(`[GitActionMenu] 提交消息生成成功`, {
        workspacePath,
        branchName: gitSummary.branchName,
        providerId: result.providerId,
        model: result.model,
      });
      return result.message;
    },
    [commitMessageConversationContext, gitService, gitSummary.branchName, locale, workspaceIdentity, workspacePath],
  );

  const handleGenerateMessage = React.useCallback(async () => {
    if (!dialogState) return;
    if (resolveCommitStagePaths(dialogState, includeUnstaged).length === 0) {
      setCommitError(intl.formatMessage({ id: `git.actionMenu.commitDialog.error.noChanges` }));
      return;
    }
    setCommitError(null);
    setGenerationPending(true);
    try {
      setCommitMessage(await generateCommitMessage(dialogState, includeUnstaged));
    } catch (error) {
      const message = extractErrorMessage(error);
      logger.warn(`[GitActionMenu] 生成提交消息失败`, {
        workspacePath,
        branchName: gitSummary.branchName,
        error: message,
      });
      setCommitError(intl.formatMessage({ id: `git.actionMenu.commitDialog.error.generateFailed` }));
    } finally {
      setGenerationPending(false);
    }
  }, [includeUnstaged, dialogState, generateCommitMessage, gitSummary.branchName, intl, workspacePath]);

  // 推送（成功 toast：已推送到 {target}）
  const pushChanges = React.useCallback(
    async (opts?: { showToast?: boolean }) => {
      const result = await gitService.push({ workspacePath });
      logger.info(`[GitActionMenu] 推送更改成功`, {
        workspacePath,
        branchName: result.branchName,
        trackingBranchName: result.trackingBranchName,
        remoteName: result.remoteName,
        setUpstream: result.setUpstream,
      });
      if (opts?.showToast !== false) {
        toast(
          intl.formatMessage(
            { id: `git.actionMenu.pushDialog.toast.success` },
            { target: result.trackingBranchName?.trim() || result.branchName?.trim() || branchDisplayLabel },
          ),
        );
      }
      return result;
    },
    [branchDisplayLabel, gitService, intl, workspacePath],
  );

  // 提交（可带推送）：身份校验 → 空消息自动生成 → 暂存所选 → commit → 可选 push
  const commitChanges = React.useCallback(
    async (opts?: { pushAfterCommit?: boolean }) => {
      if (!dialogState) return;
      if (!hasGitIdentity(dialogState.identity)) {
        setCommitError(intl.formatMessage({ id: `git.actionMenu.commitDialog.identityMissing` }));
        return;
      }
      const includeUnstagedNow = includeUnstaged;
      const selectedPaths = resolveCommitStagePaths(dialogState, includeUnstagedNow);
      const stagedPaths = includeUnstagedNow ? selectedPaths : [];
      if (selectedPaths.length === 0) {
        setCommitError(intl.formatMessage({ id: `git.actionMenu.commitDialog.error.noChanges` }));
        return;
      }
      let message = commitMessage.trim();
      if (!message) {
        setCommitError(null);
        setGenerationPending(true);
        try {
          message = await generateCommitMessage(dialogState, includeUnstagedNow);
          setCommitMessage(message);
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          logger.warn(`[GitActionMenu] 生成提交消息失败`, {
            workspacePath,
            branchName: gitSummary.branchName,
            error: errorMessage,
          });
          setCommitError(intl.formatMessage({ id: `git.actionMenu.commitDialog.error.generateFailed` }));
          return;
        } finally {
          setGenerationPending(false);
        }
      }
      setCommitError(null);
      setMutationPending(true);
      let committed = false;
      try {
        logger.info(`[GitActionMenu] 开始提交当前更改`, {
          workspacePath,
          branchName: gitSummary.branchName,
          selectedPathCount: selectedPaths.length,
          stagedPathCount: stagedPaths.length,
          includeUnstaged: includeUnstagedNow,
          pushAfterCommit: !!opts?.pushAfterCommit,
        });
        if (stagedPaths.length > 0) await gitService.stagePaths({ workspacePath, paths: stagedPaths });
        await gitService.commit({ workspacePath, message, paths: selectedPaths, stagedOnly: !includeUnstagedNow });
        committed = true;
        if (opts?.pushAfterCommit) await pushChanges({ showToast: false });
        logger.info(`[GitActionMenu] 提交当前更改成功`, {
          workspacePath,
          branchName: gitSummary.branchName,
          pushAfterCommit: !!opts?.pushAfterCommit,
        });
        toast(
          intl.formatMessage({
            id: opts?.pushAfterCommit
              ? `git.actionMenu.commitDialog.toast.commitAndPushSuccess`
              : `git.actionMenu.commitDialog.toast.success`,
          }),
        );
        resetCommitDialog();
        onRefreshGit();
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        logger.warn(`[GitActionMenu] 提交当前更改失败`, {
          workspacePath,
          error: errorMessage,
          committed,
          pushAfterCommit: !!opts?.pushAfterCommit,
        });
        setCommitError(
          intl.formatMessage(
            {
              id:
                committed && opts?.pushAfterCommit
                  ? `git.actionMenu.commitDialog.error.pushAfterCommitFailed`
                  : `git.actionMenu.commitDialog.error.requestFailed`,
            },
            { error: errorMessage },
          ),
        );
        if (committed) onRefreshGit();
      } finally {
        setMutationPending(false);
      }
    },
    [resetCommitDialog, includeUnstaged, dialogState, commitMessage, generateCommitMessage, gitService, gitSummary.branchName, intl, onRefreshGit, pushChanges, workspacePath],
  );

  const handleSubmit = React.useCallback(async () => {
    await commitChanges();
  }, [commitChanges]);

  const handleSubmitAndPush = React.useCallback(async () => {
    await commitChanges({ pushAfterCommit: true });
  }, [commitChanges]);

  const handlePushSubmit = React.useCallback(async () => {
    if (!pushEnabled) return;
    setMutationPending(true);
    setPushError(null);
    try {
      await pushChanges();
      closePushDialog();
      onRefreshGit();
    } catch (error) {
      const message = extractErrorMessage(error);
      logger.warn(`[GitActionMenu] 推送更改失败`, { workspacePath, error: message });
      setPushError(intl.formatMessage({ id: `git.actionMenu.pushDialog.error.requestFailed` }, { error: message }));
    } finally {
      setMutationPending(false);
    }
  }, [closePushDialog, intl, onRefreshGit, pushChanges, pushEnabled, workspacePath]);

  // 主动作分派：push → 推送对话框；否则 → 提交对话框
  const runPrimaryAction = React.useCallback(() => {
    if (primaryActionDisabled) return;
    if (primaryAction === `push`) {
      openPushDialog();
      return;
    }
    void openCommitDialog();
  }, [openCommitDialog, openPushDialog, primaryAction, primaryActionDisabled]);

  const handleTriggerActivate = React.useCallback(() => {
    runPrimaryAction();
  }, [runPrimaryAction]);

  return (
    <>
      {/* 触发器：status-row 时整行可点（除图标按钮形态） */}
      <div
        onClick={isStatusRow && !triggerIconOnly ? handleTriggerActivate : void 0}
        className={cn(
          `flex h-7 items-center overflow-hidden rounded-lg border border-border bg-input transition-colors hover:border-border-hover @max-[560px]/workspace-header:w-7 @max-[560px]/workspace-header:justify-center`,
          triggerIconOnly && `w-7 justify-center`,
          isStatusRow &&
            `h-8 w-full justify-start rounded-lg border-0 bg-transparent hover:border-transparent hover:bg-hover @max-[560px]/workspace-header:w-full @max-[560px]/workspace-header:justify-start`,
          className,
        )}
      >
        <Button
          data-testid={GIT_ACTION_TRIGGER_TESTID}
          type="button"
          variant="ghost"
          size="default"
          disabled={primaryActionDisabled}
          aria-label={intl.formatMessage({ id: `git.actionMenu.trigger.ariaLabel` })}
          className={cn(
            `h-7 rounded-lg border-0 gap-1 px-1.5 @max-[560px]/workspace-header:w-7 @max-[560px]/workspace-header:px-0 @max-[560px]/workspace-header:[&>span]:hidden`,
            triggerIconOnly && `w-7 px-0 [&>span]:hidden`,
            isStatusRow &&
              `h-8 min-w-0 w-full justify-start gap-2 px-2 text-left text-ui-base hover:bg-transparent hover:text-foreground @max-[560px]/workspace-header:w-auto @max-[560px]/workspace-header:[&>span]:inline`,
          )}
          onClick={isStatusRow && !triggerIconOnly ? void 0 : handleTriggerActivate}
        >
          {busy ? (
            <IconLoader className="size-4 animate-spin text-foreground-subtle" />
          ) : primaryAction === `push` ? (
            <IconArrowUpFromLine className="size-4 text-foreground" />
          ) : (
            <IconGitCommitHorizontal className="size-4 text-foreground" />
          )}
          <span className={cn(isStatusRow && `min-w-0 truncate`)}>
            {intl.formatMessage({ id: `git.actionMenu.trigger` })}
          </span>
        </Button>
      </div>
      <GitCommitDialog
        open={commitDialogOpen}
        loading={dialogLoading}
        state={dialogState}
        workspacePath={workspacePath}
        message={commitMessage}
        error={commitError}
        mutationPending={mutationPending}
        generationPending={generationPending}
        includeUnstaged={includeUnstaged}
        pushEnabled={pushEnabled}
        onRefreshGit={refreshAndReload}
        onOpenChange={(open) => {
          if (!open) resetCommitDialog();
        }}
        onMessageChange={setCommitMessage}
        onIncludeUnstagedChange={setIncludeUnstaged}
        onGenerateMessage={() => {
          void handleGenerateMessage();
        }}
        onSubmit={() => {
          void handleSubmit();
        }}
        onSubmitAndPush={() => {
          void handleSubmitAndPush();
        }}
        onPushOnly={() => {
          resetCommitDialog();
          openPushDialog();
        }}
      />
      <GitPushDialog
        open={pushDialogOpen}
        gitSummary={gitSummary}
        currentBranchLabel={branchDisplayLabel}
        pushEnabled={pushEnabled}
        error={pushError}
        mutationPending={mutationPending}
        onOpenChange={(open) => {
          if (!open) closePushDialog();
        }}
        onSubmit={() => {
          void handlePushSubmit();
        }}
      />
    </>
  );
}

/** 分支显示标签解析（原 MZ，js 94967；TopBar.tsx 已抽取，此处声明引用） */

/** zZ 分支 chip（TopBar.tsx 已完整抽取；⚠ 实际调用面 popoverSide 还取 "left"，
 *  TopBar.tsx 的接口只声明了 top|bottom —— 见 GitReview.report.md §4 勘误） */

/* --- 状态面板段壳（原 98270–98353） --- */

/** 原 flt（js 98318）：各段滚动限高（environment 段不限高） */
export const SUMMARY_SECTION_SCROLL_CLASS: Record<string, string | null> = {
  environment: null,
  goal: `max-h-48`,
  sessionPlans: `max-h-48`,
  plan: `max-h-80`,
  terminal: `max-h-48`,
  agent: `max-h-48`,
};

/** 原 plt（js 98326）：段头 —— 标题 + ⌄/›（悬停显形）+ trailing 插槽 */
export function SummarySectionHeader({
  children,
  isOpen,
  section,
  title,
}: {
  children?: React.ReactNode;
  isOpen: boolean;
  section: string;
  title: string;
}) {
  return (
    <div className="mb-0.5 flex h-8 min-w-0 shrink-0 items-center gap-1.5 px-2 pr-8">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          data-status-section-trigger={section}
          className="group flex min-w-0 shrink-0 items-center gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-border-focused)]"
        >
          <span className="shrink-0 text-ui-base text-[var(--color-foreground-subtle)]">{title}</span>
          {isOpen ? (
            <IconChevronDown className="size-3.5 shrink-0 text-[var(--color-foreground-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          ) : (
            <IconChevronRight className="size-3.5 shrink-0 text-[var(--color-foreground-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          )}
        </button>
      </CollapsibleTrigger>
      {children ? (
        <div className="inline-flex min-w-0 max-w-full shrink items-center gap-1.5 text-ui-sm text-[var(--color-foreground-subtlest)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** XZ 的 props（原 js 98313 解构面） */
export interface SummarySectionProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  separated?: boolean;
  section: string;
  title: string;
  trailing?: (isOpen: boolean) => React.ReactNode;
}

/** 原 XZ（js 98361）：段壳 —— Collapsible + 段头 + 限高滚动体（受控/非受控两用） */
export function SummarySection({
  children,
  defaultOpen = true,
  onOpenChange,
  open,
  separated = false,
  section,
  title,
  trailing,
}: SummarySectionProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== void 0;
  const resolvedOpen = open ?? internalOpen;
  const scrollClass = SUMMARY_SECTION_SCROLL_CLASS[section];
  return (
    <Collapsible
      open={resolvedOpen}
      onOpenChange={React.useCallback(
        (nextOpen: boolean) => {
          if (!isControlled) setInternalOpen(nextOpen);
          onOpenChange?.(nextOpen);
        },
        [isControlled, onOpenChange],
      )}
      data-status-section={section}
      className={cn(`min-w-0 flex-none`, separated && `border-t border-[var(--color-border)] pt-2`)}
    >
      <section className="min-w-0 flex-none">
        <SummarySectionHeader isOpen={resolvedOpen} section={section} title={title}>
          {trailing?.(resolvedOpen)}
        </SummarySectionHeader>
        <CollapsibleContent>
          {scrollClass ? (
            <div
              data-status-section-scroll={section}
              className={cn(scrollClass, `min-h-0 overflow-x-hidden overflow-y-auto pr-1`)}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/** 摘要面板模型中的 git 段（原 model.git 的消费面） */
export interface SummaryPanelGitModel {
  added: number;
  removed: number;
  dirtyFileCount: number;
}

/** mlt 的 props（原 js 98354 解构面） */
export interface SummaryGitSectionProps {
  activeTaskChangeSummary?: string | ActiveTaskChangeSummary | null;
  gitSummary: GitSummary;
  gitWorktreeReviewSourceId?: string | null;
  model: { git?: SummaryPanelGitModel | null };
  onOpenGitReview?: (sourceId?: string) => void;
  onRefreshGit?: () => void;
  separated: boolean;
  workspaceIdentity?: string | null;
  workspacePath: string;
}

/**
 * 原 mlt（js 98402 / jsx 85281）：SummaryGitSection —— mini 浮卡「Git 工具」段。
 * 段头右侧常驻 ±统计；正文三行：
 *   1. 更改行（file-diff 图标 + ±计数）→ onOpenGitReview(worktreeReviewSourceId)
 *      —— 打开侧面板「审查」标签（审查入口之一）；
 *   2. zZ 分支 chip（status-row 变体类名，弹层朝左）；
 *   3. Rct GitActionMenu（status-row 布局，提交/推送入口）。
 */
export function SummaryGitSection({
  activeTaskChangeSummary,
  gitSummary,
  gitWorktreeReviewSourceId,
  model,
  onOpenGitReview,
  onRefreshGit,
  separated,
  workspaceIdentity,
  workspacePath,
}: SummaryGitSectionProps) {
  const { intl } = useIntlContext();
  const git = model.git;
  if (!git || !gitSummary || !onRefreshGit) return null;
  const hasChanges = git.added + git.removed > 0;
  const canOpenReview = !!(onOpenGitReview && gitSummary.isRepository);
  return (
    <SummarySection
      section="environment"
      separated={separated}
      title={intl.formatMessage({ id: `chat.statusPanel.environment` })}
      trailing={(isOpen) =>
        isOpen ? null : (
          <span className="shrink-0 font-mono text-ui-sm tabular-nums">
            <span className={cn(`text-[var(--color-diff-added)]`, !hasChanges && `opacity-50`)}>{`+`}{git.added}</span>{` `}
            <span className={cn(`text-[var(--color-diff-removed)]`, !hasChanges && `opacity-50`)}>{`-`}{git.removed}</span>
          </span>
        )
      }
    >
      <div className="space-y-0">
        {/* 更改行：点击 → 打开审查标签（携带 worktree 来源 id） */}
        <button
          type="button"
          disabled={!canOpenReview}
          className={cn(
            `flex h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-ui-base text-[var(--color-foreground)] transition-colors`,
            canOpenReview
              ? `hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-border-focused)]`
              : `cursor-default opacity-50`,
          )}
          onClick={() => {
            onOpenGitReview?.(gitWorktreeReviewSourceId ?? void 0);
          }}
        >
          <IconFileDiff className="size-4 shrink-0 text-[var(--color-foreground)]" />
          <span className="min-w-0 flex-1 truncate">{intl.formatMessage({ id: `chat.statusPanel.changes` })}</span>
          <span className="shrink-0 font-mono tabular-nums">
            <span className="text-[var(--color-diff-added)]">{`+`}{git.added}</span>{` `}
            <span className="text-[var(--color-diff-removed)]">{`-`}{git.removed}</span>
          </span>
        </button>
        {/* 分支 chip（TopBar.tsx 的 zZ；status-row 变体） */}
        <GitBranchChip
          workspacePath={workspacePath}
          gitSummary={gitSummary}
          dirtyFileCount={git.dirtyFileCount}
          onRefreshGit={onRefreshGit}
          className="w-full px-0 pt-0"
          triggerClassName="flex h-8 w-full min-w-0 justify-start gap-2 rounded-lg px-2 text-left text-ui-base text-[var(--color-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] [&>span]:max-w-[calc(100%-3.5rem)] [&_svg:first-child]:text-[var(--color-foreground)]"
          popoverClassName="w-72"
          branchListClassName="max-h-56"
          popoverSide="left"
          showFooterActions={true}
        />
        {/* 提交/推送入口（status-row 布局） */}
        <GitActionMenu
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          gitSummary={gitSummary}
          activeTaskChangeSummary={normalizeActiveTaskChangeSummary(activeTaskChangeSummary) ?? null}
          onRefreshGit={onRefreshGit}
          triggerLayout="status-row"
          className="w-full"
        />
      </div>
    </SummarySection>
  );
}

/** activeTaskChangeSummary 归一（mlt 传下来的可能是字符串摘要或结构化对象） */
function normalizeActiveTaskChangeSummary(value: string | ActiveTaskChangeSummary | null | undefined): ActiveTaskChangeSummary | null {
  if (!value) return null;
  return typeof value === `string` ? { added: 0, removed: 0, files: [] } : value;
}

/* ============================================================================
 * B. useTaskFileActions（原 C6，js 142059–142181 / jsx 117973–118105）
 * ----------------------------------------------------------------------------
 * 任务行「…菜单」与审查域共用的文件动作钩子：会话文件/原生日志/供应商配置
 * 三个路径状态 + 复制文本 + 在文件管理器中打开（远程/WSL 分支）+ 打开供应商
 * 配置（优先已选编辑器）。TopBar.tsx 曾保留接口，此处完整还原。
 * ==========================================================================*/

/** 原 rFt/iFt（js 142190/142172）：UA 平台判定 */
export function isMacUserAgent(): boolean {
  return typeof navigator > `u` ? false : /mac/i.test(navigator.userAgent);
}
export function isWindowsUserAgent(): boolean {
  return typeof navigator > `u` ? false : /windows/i.test(navigator.userAgent);
}

/** 原 aFt（js 142193）：文件管理器文案三态（访达/资源管理器/文件管理器） */
export function resolveFileManagerLabel(intl: IntlShape): string {
  return isMacUserAgent()
    ? intl.formatMessage({ id: `appHeader.openInFinder` })
    : isWindowsUserAgent()
      ? intl.formatMessage({ id: `appHeader.openInFileExplorer` })
      : intl.formatMessage({ id: `appHeader.openInFileManager` });
}

/**
 * 原 nFt（js 142076）：供应商配置打开路径 —— 文件存在用原路径，
 * 否则退到父目录（Windows 盘符根保留 `X:\`）。
 */
export function resolveProviderConfigOpenPath(path: string, exists: boolean): string {
  if (exists) return path;
  const trimmed = path.replace(/[\\/]+$/, ``);
  const separatorIndex = Math.max(trimmed.lastIndexOf(`/`), trimmed.lastIndexOf(`\\`));
  if (separatorIndex < 0) return path;
  if (separatorIndex === 0) return trimmed[0] ?? path;
  const parent = trimmed.slice(0, separatorIndex);
  return /^[A-Za-z]:$/.test(parent) ? `${parent}\\` : parent || path;
}

/** C6 的 props（原 js 142068 解构面） */
export interface UseTaskFileActionsProps {
  workspacePath: string;
  remoteSessionId?: string | null;
  workspaceIdentity?: string | null;
  taskId: string | null;
  provider?: string | null;
  intl: IntlShape;
  loadTaskPaths?: boolean;
  loadProviderConfig?: boolean;
}

/** C6 返回形 */
export interface TaskFileActions {
  taskSessionFile: TaskPathState;
  taskNativeSessionLogFile: TaskPathState;
  providerConfigFile: TaskPathState;
  fileManagerLabel: string;
  handleCopyText: (label: string, value: string | null) => Promise<void>;
  handleOpenTaskPathInFileManager: () => Promise<void>;
  handleOpenProviderConfig: () => Promise<void>;
}

/**
 * 原 C6（js 142085 / jsx 117982）：useTaskFileActions。
 * 打开工作区路径的分派顺序：远程（仅 WSL 可开，explorer 走 openInEditor）→
 * 本机按 UA 用 finder/explorer 优先（openInEditor），回退 openInFileManager。
 */
export function useTaskFileActions({
  workspacePath,
  remoteSessionId,
  workspaceIdentity,
  taskId,
  provider,
  intl,
  loadTaskPaths = true,
  loadProviderConfig = true,
}: UseTaskFileActionsProps): TaskFileActions {
  const platformService = usePlatformService() as unknown as PlatformService;
  const remoteInfo = useWorkspaceRemoteInfo({ workspacePath, workspaceIdentity, workspaceRemoteSessionId: remoteSessionId }) as { isRemoteWorkspace: boolean; remoteTarget?: RemoteTarget };
  const resolvedProvider = provider ?? `glm`;
  const taskSessionFile = useTaskSessionFilePath(workspacePath, taskId, workspaceIdentity, { enabled: loadTaskPaths });
  const taskNativeSessionLogFile = useTaskNativeSessionLogFilePath(workspacePath, taskId, provider ?? null, workspaceIdentity, { enabled: loadTaskPaths });
  const providerConfigFile = useProviderConfigFilePath(workspacePath, resolvedProvider, remoteSessionId ?? null, workspaceIdentity, {
    serviceScope: remoteSessionId ? `base` : `workspace`,
    enabled: loadProviderConfig,
  });

  const handleCopyText = React.useCallback(async (label: string, value: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      logger.info(`[TaskListItem] ${label} 已复制: ${value}`);
    } catch (error) {
      logger.warn(`[TaskListItem] 复制文本失败`, {
        label,
        value,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const handleOpenTaskPathInFileManager = React.useCallback(async () => {
    if (remoteSessionId || workspaceIdentity?.trim() || remoteInfo.isRemoteWorkspace) {
      if (remoteInfo.remoteTarget?.kind !== `wsl`) {
        logger.warn(`[TaskListItem] 远程 workspace 不支持本机文件管理器`, {
          taskId,
          path: workspacePath,
          remoteKind: remoteInfo.remoteTarget?.kind ?? `unresolved`,
        });
        return;
      }
      const result = await platformService.openInEditor(`explorer`, workspacePath, {
        pathKind: `directory`,
        remoteTarget: remoteInfo.remoteTarget,
        workspaceIdentity,
      });
      if (!result.success) {
        logger.warn(`[TaskListItem] 打开 WSL workspace 路径失败`, {
          taskId,
          path: workspacePath,
          error: result.error ?? `unknown-error`,
        });
      }
      return;
    }
    const isMac = isMacUserAgent();
    const isWindows = isWindowsUserAgent();
    if (isMac || isWindows) {
      const editorId = isMac ? `finder` : `explorer`;
      if ((await platformService.openInEditor(editorId, workspacePath)).success) return;
    }
    const fallback = await platformService.openInFileManager(workspacePath);
    if (!fallback.success) {
      logger.warn(`[TaskListItem] 打开 workspace 路径失败`, {
        taskId,
        path: workspacePath,
        error: fallback.error ?? `unknown-error`,
      });
    }
  }, [platformService, remoteSessionId, taskId, workspaceIdentity, remoteInfo.isRemoteWorkspace, remoteInfo.remoteTarget, workspacePath]);

  const handleOpenProviderConfig = React.useCallback(async () => {
    if (!providerConfigFile.path) return;
    const openTargetPath = resolveProviderConfigOpenPath(providerConfigFile.path, providerConfigFile.exists);
    try {
      const preferredEditorId = getPreferredEditorId();
      const editors = normalizeInstalledEditors(await platformService.getInstalledEditors());
      const editor = editors.find((candidate) => candidate.id === preferredEditorId) ?? editors[0] ?? null;
      if (editor && (await platformService.openInEditor(editor.id, openTargetPath)).success) return;
      const fallback = await platformService.openInFileManager(openTargetPath);
      if (!fallback.success) {
        logger.warn(`[TaskListItem] 打开 provider 配置失败`, {
          taskId,
          provider: resolvedProvider,
          path: providerConfigFile.path,
          openTargetPath,
          error: fallback.error ?? `unknown-error`,
        });
      }
    } catch (error) {
      logger.warn(`[TaskListItem] 打开 provider 配置失败`, {
        taskId,
        provider: resolvedProvider,
        path: providerConfigFile.path,
        openTargetPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [platformService, providerConfigFile.exists, providerConfigFile.path, taskId, resolvedProvider]);

  return {
    taskSessionFile,
    taskNativeSessionLogFile,
    providerConfigFile,
    fileManagerLabel: resolveFileManagerLabel(intl),
    handleCopyText,
    handleOpenTaskPathInFileManager,
    handleOpenProviderConfig,
  };
}

/* ============================================================================
 * 尾：符号表（混淆名 → 语义名 → js 行 / jsx 行，便于反查）
 * ----------------------------------------------------------------------------
 *  BWt GitChangesPanel 178584/144748 | NWt GitChangeRow 178371/144648
 *  PWt PlainTextDiffPreview 178541/144701 | LWt computeFileChangeFindMatches 178563/144726
 *  IWt countOccurrences 178551/144714 | FWt normalizeFindQuery 178548/144711
 *  TWt resolveGitSourceI18nId 178298/144567 | EWt resolveDiffUnavailableI18nId 178312/144581
 *  y5 diffCacheKey 178322/144591 | DWt extractDiffErrorMessage 178325/144594
 *  OWt countTextLines 178333/144602 | kWt isDiffTooLargeForRichRendering 178340/144609
 *  AWt resolveDiffRenderMode 178347/144612 | jWt tryExtractPlainTextDiffLines 178355/144632
 *  MWt findDiffHeaderPath 178363/144640 | CWt/wWt 阈值 178296/144565 | RWt/zWt 常量 178581/144746
 *  C6 useTaskFileActions 142068/117982 | rFt/iFt/aFt 142169/142172/142175 (118091/118094/118097)
 *  nFt resolveProviderConfigOpenPath 142059/117973
 *  b_t FileRewindDialog 110632/94590 | f1 RewindDialogFileList 110599/94577
 *  y_t formatRewindSkipReason 110586/94563 | x_t buildUnifiedPatch 110785/94650
 *  p1 openFileChangePatchInCodeViewer 110793/94657
 *  FH useCodeCommentsStore 68514/60720 | TH CodeCommentsChip 68250/60559 | hXe 68246/60556
 *  EH/DH/gXe/OH 68362–68365 (60591–60594) | kH/AH 68367/68371 (60596/60599)
 *  _Xe/jH/vXe 68373/68376/68379 (60601/60603/60605) | yXe/bXe 68382/68390 (60610/60613)
 *  MH/NH 68398/68409 (60616/60620) | xXe/SXe/CXe 68427/68431/68438 (60623/60627/60631)
 *  wXe/TXe/EXe/DXe 68451/68454/68465/68488 (60638/60641/60652/60680)
 *  OXe/kXe 68503/68507 (60700/60707) | jXe 68580/60796
 *  GH/GXe/KXe 68778/68787/68792 (60964/60967/60970) | qXe/KH 68804/68809 (60983/60986)
 *  JXe useCodeCommentContexts 68812/60989
 *  mlt SummaryGitSection 98354/85281 | XZ SummarySection 98313/85250
 *  plt SummarySectionHeader 98278/85240 | flt SUMMARY_SECTION_SCROLL_CLASS 98270/85232
 *  Rct GitActionMenu 97609/84647 | Ict GitCommitDialog 97012/84376 | Lct GitPushDialog 97355/84555
 *  Fct GitActionMenuItem 96990/84352 | mct/hct/gct 96895/96898/96905 (84265/84268/84271)
 *  BZ/_ct/vct/yct/VZ 96909–96934 | bct/xct 96939/96951 | Sct/Cct 96956/96962 (84316/84320)
 *  wct/HZ/Tct…jct 96966–96974 (84324–84332) | Mct/Nct/Pct 96975/96978/96981
 *  UZ/WZ 96984/96987 (84346/84349) | NZ mapChangeFilesToRows 95017/83023
 *  Est summarizeFileRows 95047/83047 | PZ hasGitIdentity 95076/83075
 *  nge useGitRepository 23920/20564 | tge 23910/20561 | ege/$he 23898/23876 (20549/20533)
 *  Qhe/Tg/Zhe 23862/23847/23844 (20505/20491/20485) | wg/Cg/Xhe/Sg 23829/23815/23807/23804
 *  Yhe/Jhe/xg/qhe 23788/23785/23782/23774 | Khe/Ghe/Whe 23773/23768/23767
 *  bg/Uhe/Hhe 23764/23760/23726 (20377/20374/20340) | yg 23717
 *
 *  相邻未展开（登记）：
 *   - S_t TurnFileChangesSummary js 110813 / jsx 94679 —— 已在 Conversation.tsx 逐字抽取
 *   - El gutter 控制器 js 6062–6881 —— F14 代码查看基建（行级评论的选择机制）
 *   - tHt CodeViewerPanel js 161141–162009 —— F14 根（评论 props 接线在 161996–162001）
 *   - The…Nhe 工具调用→文件变更推断 js 23403–23700 —— last-turn 数据上游（任务域）
 *   - zZ GitBranchChip js 96589 —— TopBar.tsx 已抽取（本文件仅引用）
 *   - yst countGitDatasetFiles js 94955 —— yJt 脏文件计数消费（184373）
 * ============================================================================ */
