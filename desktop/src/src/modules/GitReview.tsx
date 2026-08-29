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
 *   BWt  → GitChangesPanel            审查 pane 主体 (178584 / 144748)
 *   NWt  → GitChangeRow               单文件变更行（粘性头+上下文菜单+diff 三态渲染）(178371 / 144648)
 *   PWt  → PlainTextDiffPreview       纯文本 diff 轻量预览 (178541 / 144701)
 *   LWt  → computeFileChangeFindMatches 变更内容查找（全文件匹配序列）(178563 / 144726)
 *   IWt  → countOccurrences           (178551 / 144714)
 *   FWt  → normalizeFindQuery         (178548 / 144711)
 *   TWt  → resolveGitSourceI18nId     来源 → git.source.* (178298 / 144567)
 *   EWt  → resolveDiffUnavailableI18nId (178312 / 144581)
 *   y5   → diffCacheKey               `${sourceId}:${path}` (178322 / 144591)
 *   DWt  → extractErrorMessage        (178325 / 144594)
 *   OWt  → countTextLines             (178333 / 144602)
 *   kWt  → isDiffTooLargeForRichRendering（>180KB 或 >1200 行）(178340 / 144609)
 *   AWt  → resolveDiffRenderMode      rich / plain-text / patch (178347 / 144612)
 *   jWt  → tryExtractPlainTextDiffLines (178355 / 144632)
 *   MWt  → findDiffHeaderPath         (178363 / 144640)
 *   CWt/wWt → DIFF_RICH_CONTENT_CHAR_LIMIT=180000 / DIFF_RICH_LINE_LIMIT=1200 (178296 / 144565)
 *   RWt/zWt → GIT_CHANGE_ROW_ESTIMATE_PX=32 / GIT_CHANGE_LIST_OVERSCAN=14 (178581 / 144746)
 *
 *  B. 任务文件动作：
 *   C6   → useTaskFileActions         会话文件/日志/供应商配置 路径+复制+打开 (142068 / 117982)
 *   rFt  → isMacUserAgent             (142169 / 118091)
 *   iFt  → isWindowsUserAgent         (142172 / 118094)
 *   aFt  → resolveFileManagerLabel    finder/explorer/file-manager 三态 (142175 / 118097)
 *   nFt  → resolveProviderConfigOpenPath（不存在时退到父目录）(142059 / 117973)
 *
 *  C. 文件撤销（rewind）：
 *   b_t  → FileRewindDialog           撤销确认对话框（fileRewind / editConflict 双变体）(110632 / 94590)
 *   f1   → RewindDialogFileList       三段文件列表（路径 + 原因/修改次数）(110599 / 94577)
 *   y_t  → formatRewindSkipReason     reason → rewindDialog.reason.* (110586 / 94563)
 *   x_t  → buildUnifiedPatch          hunks → unified patch 文本 (110785 / 94650)
 *   p1   → openFileChangePatchInCodeViewer（「审查」按钮落点）(110793 / 94657)
 *   （调用方 S_t TurnFileChangesSummary js 110813 / jsx 94679 已在 Conversation.tsx 逐字抽取，
 *     本文件保留 b_t 所需的 FileChangeContext 接口；锚点 dim = reverted 徽章 + 撤销按钮禁用，见注释）
 *
 *  D. 代码评论（FH 消费面：行内评论 → 回流对话）：
 *   FH   → useCodeCommentsStore       commentsByBucketKey 行级评论 store (68514 / 60720)
 *   TH   → CodeCommentsChip           「N 条评论」chip + 悬停列表 + 逐条移除 (68250 / 60559)
 *   hXe  → codeCommentContextKey      (68246 / 60556)
 *   EH   → CODE_COMMENT_ADD_TO_CHAT_EVENT = `zcode:code-comment-add-to-chat` (68362 / 60591)
 *   DH   → CODE_COMMENT_REMOVE_FROM_CHAT_EVENT = `zcode:code-comment-remove-from-chat` (68363 / 60592)
 *   gXe  → CODE_COMMENT_REMOVE_BROADCAST_CHANNEL = `code-comment:remove-from-chat` (68364 / 60593)
 *   OH   → removedCommentScopes（已回流评论集合）(68365 / 60594)
 *   kH   → commentWorkspaceKey        (68367 / 60596)
 *   AH   → commentScopeKey            (68371 / 60599)
 *   _Xe/jH/vXe → isCommentRemovedFromChat / markCommentRemovedFromChat / unmark… (68373,68376,68379 / 60601,60603,60605)
 *   yXe/bXe → isAddToChatEvent / isRemoveFromChatEvent (68382,68390 / 60610,60613)
 *   MH   → isCommentScopePayload      (68398 / 60616)
 *   NH   → isCommentAttachmentPayload (68409 / 60620)
 *   xXe  → serializeCodeComment       「## Comment」块 (68427 / 60623)
 *   SXe  → serializeCodeCommentsBlock  「# Code comments:」总块 (68431 / 60627)
 *   CXe  → appendCodeCommentsToContent (68438 / 60631)
 *   wXe  → fileBasename               (68451 / 60638)
 *   TXe  → parseLineRange             「L3-L7」→ {startLine,endLine} (68454 / 60641)
 *   EXe  → parseCodeCommentBlock      (68465 / 60652)
 *   DXe  → splitCodeCommentAttachments（发送内容 → 可见文本 + 评论附件）(68488 / 60680)
 *   OXe  → dispatchCodeCommentAddToChat（cancelable，可被拦截）(68503 / 60700)
 *   kXe  → dispatchCodeCommentRemoveFromChat (68507 / 60707)
 *   jXe  → removeCodeCommentAndBroadcast（跨窗口广播移除）(68580 / 60796)
 *   GH   → countContextAttachments     (68778 / 60964)
 *   GXe  → buildOutboundContentWithAttachments (68787 / 60967)
 *   KXe  → parseDraftContentIntoAttachments (68792 / 60970)
 *   qXe  → newCodeCommentId            (68804 / 60983)
 *   KH   → codeCommentIdentityKey      (68809 / 60986)
 *   JXe  → useCodeCommentContexts      composer 侧事件桥钩子 (68812 / 60989)
 *   （代码查看器侧提交/删除回调 = tHt 内 Ue/We，js 161313–161360，见 useCodeViewerCommentActions；
 *     gutter 行选择机制 El js 6062–6881 属 F14 基建，仅登记）
 *
 *  E. Git 工具 mini 浮卡（状态面板 environment 段）：
 *   mlt  → SummaryGitSection          「Git 工具」段：更改行 + 分支 chip + 提交/推送 (98354 / 85281)
 *   XZ   → SummarySection             段壳（Collapsible + 滚动限高）(98313 / 85250)
 *   plt  → SummarySectionHeader       段头（⌄ 折叠 + trailing）(98278 / 85240)
 *   flt  → SUMMARY_SECTION_SCROLL_CLASS 各段滚动限高表 (98270 / 85232)
 *   Rct  → GitActionMenu              提交/推送入口（header 与 status-row 双布局）(97609 / 84647)
 *   Ict  → GitCommitDialog            提交对话框（AI 生成消息/含未暂存/三动作）(97012 / 84376)
 *   Lct  → GitPushDialog              推送对话框（ahead/behind/upstream/错误复制）(97355 / 84555)
 *   Fct  → GitActionMenuItem          cmdk 动作项（图标+文案+快捷键）(96990 / 84352)
 *   mct  → isGitActionAvailable       (96895 / 84265)
 *   hct  → resolvePrimaryGitAction    commit ∥ push (96898 / 84268)
 *   gct  → isPushEnabled              (96905 / 84271)
 *   BZ   → normalizeStagePath         (96909 / 84274)
 *   _ct  → normalizeDirPath           (96916 / 84280)
 *   vct  → resolveWorkspaceInRepoPath (96919 / 84283)
 *   yct  → resolveRelativeSubpath     (96923 / 84287)
 *   VZ   → addStagePath               (96934 / 84297)
 *   bct  → collectSessionStagePaths   (96939 / 84302)
 *   xct  → isFileInSessionPaths       (96951 / 84313)
 *   Sct  → parseActiveTaskChangeSummaryPaths (96956 / 84316)
 *   Cct  → filterFilesBySessionPaths  (96962 / 84320)
 *   wct  → GIT_ACTION_IDS = [commit, commitAndPush, push] (96966 / 84324)
 *   HZ   → COMMIT_MESSAGE_INPUT_ID = `git-action-menu-commit-message` (96967 / 84325)
 *   Tct/Ect/Dct/Oct/kct/Act/jct → testid 常量群（`git-action-trigger` 等）(96968 / 84326)
 *   Mct  → gitActionItemId            (96975 / 84333)
 *   Nct  → isGitActionId              (96978 / 84336)
 *   Pct  → isCommitMessageTextarea    (96981 / 84339)
 *   UZ   → resolveCommitSelection     (96984 / 84346)
 *   WZ   → resolveCommitStagePaths    (96987 / 84349)
 *   NZ   → mapChangeFilesToRows       仓库相对路径去重合并 (95017 / 83023)
 *   Est  → summarizeFileRows          fileCount/totalAdded/totalRemoved (95047 / 83047)
 *   PZ   → hasGitIdentity             (95076 / 83075)
 *   MC   → extractErrorMessage        （横切，js 37603 / jsx 34228，反馈域定义，此处声明引用）
 *
 *  F. Git 状态层（审查 pane 数据源）：
 *   nge  → useGitRepository            git 仓库状态钩子 (23920 / 20564)
 *   tge  → shouldRefreshGitState       (23910 / 20561)
 *   ege  → buildLastTurnDataset        (23898 / 20549)
 *   $he  → buildLastTurnChange         (23876 / 20533)
 *   Qhe  → buildGitDatasets            (23862 / 20505)
 *   Tg   → groupChangesIntoSections    (23847 / 20491)
 *   Zhe  → attachDiff                  (23844 / 20485)
 *   wg   → createInitialGitPaneState   (23829 / 20428 附近 / 9524)
 *   Cg   → buildGitSourceOptions       (23815 / 20445)
 *   Xhe  → createEmptyGitDatasets      (23807 / 20437)
 *   Sg   → createEmptyGitDataset       (23804 / 20428)
 *   Yhe  → createEmptyGitSummary       (23788 / 20412)
 *   Jhe  → resolveChangeKind           (23785 / 20409)
 *   xg   → countSectionChanges         (23782 / 20406)
 *   qhe  → extractGitErrorMessage      (23774 / 20398)
 *   Khe  → EMPTY_GIT_IDENTITY          (23773 / 20391)
 *   Ghe  → GIT_SOURCE_SECTION_ORDER    (23768 / 20387)
 *   Whe  → EMPTY_BRANCH_COMPARISON     (23767 / 20385)
 *   bg   → isGitRpcEnabled             (23764 / 20377)
 *   Uhe  → isRemoteWorkspaceDescriptor (23760 / 20374)
 *   Hhe  → buildLastTurnChangeSummary  快照 → 文件级增删统计 (23726 / 20340)
 *   yg   → resolveRepoRelativePath     (23717 / 10296 附近)
 *   （⚠ MODULE-MAP F12 备注把 nge 标为「用量数据 hook」系误认：它是本族 useGitRepository，
 *     用量钩子在别处；详见 GitReview.report.md §4）
 *
 *  图标（Sa = createLucideIcon 工厂，js 行）：
 *   Q_ folder-open 27103 | W_ copy 26926 | Nv refresh-cw 27677 | Z_ file-text 27060
 *   N_ chevron-down 26802 | uv list-tree 27300 | wa chevron-right（usageStatsUiParts o 导出）
 *   X_ file-diff 27036 | w_ arrow-up-from-line 26653 | Fye git-commit-horizontal 27147
 *   H_ cloud-upload 26913 | F_ circle-alert 26812 | M_ check 26801 | fv loader 27315
 *   ev git-branch 27142 | Kv trash-2 27882 | Cye code-xml 26921 | _v message-square-text 27399
 *   qv undo-2 27899 | Oye file-clock 27012（editConflict 触发器，登记）
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/GitReview.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  EMPTY_BRANCH_COMPARISON,
  GIT_SOURCE_SECTION_ORDER,
  EMPTY_GIT_IDENTITY,
  extractGitErrorMessage,
  isRemoteWorkspaceDescriptor,
  isGitRpcEnabled,
  countSectionChanges,
  resolveChangeKind,
  createEmptyGitSummary,
  createEmptyGitDataset,
  createEmptyGitDatasets,
  buildGitSourceOptions,
  createInitialGitPaneState,
  attachDiff,
  groupChangesIntoSections,
  buildGitDatasets,
  resolveRepoRelativePath,
  buildLastTurnChange,
  buildLastTurnDataset,
  shouldRefreshGitState,
  buildLastTurnChangeSummary,
  useGitRepository,
  DIFF_RICH_CONTENT_CHAR_LIMIT,
  DIFF_RICH_LINE_LIMIT,
  GIT_CHANGE_ROW_ESTIMATE_PX,
  GIT_CHANGE_LIST_OVERSCAN,
  resolveGitSourceI18nId,
  resolveDiffUnavailableI18nId,
  diffCacheKey,
  extractDiffErrorMessage,
  countTextLines,
  isDiffTooLargeForRichRendering,
  findDiffHeaderPath,
  tryExtractPlainTextDiffLines,
  resolveDiffRenderMode,
  PlainTextDiffPreview,
  normalizeFindQuery,
  countOccurrences,
  computeFileChangeFindMatches,
  GitChangeRow,
  GitChangesPanel,
  formatRewindSkipReason,
  RewindDialogFileList,
  FileRewindDialog,
  buildUnifiedPatch,
  openFileChangePatchInCodeViewer,
  CODE_COMMENT_ADD_TO_CHAT_EVENT,
  CODE_COMMENT_REMOVE_FROM_CHAT_EVENT,
  CODE_COMMENT_REMOVE_BROADCAST_CHANNEL,
  commentWorkspaceKey,
  commentScopeKey,
  isCommentRemovedFromChat,
  markCommentRemovedFromChat,
  unmarkCommentRemovedFromChat,
  isAddToChatEvent,
  isRemoveFromChatEvent,
  isCommentScopePayload,
  isCommentAttachmentPayload,
  serializeCodeComment,
  serializeCodeCommentsBlock,
  appendCodeCommentsToContent,
  fileBasename,
  parseLineRange,
  parseCodeCommentBlock,
  splitCodeCommentAttachments,
  dispatchCodeCommentAddToChat,
  dispatchCodeCommentRemoveFromChat,
  useCodeCommentsStore,
  removeCodeCommentAndBroadcast,
  newCodeCommentId,
  codeCommentIdentityKey,
  useCodeCommentContexts,
  codeCommentContextKey,
  CodeCommentsChip,
  countContextAttachments,
  buildOutboundContentWithAttachments,
  parseDraftContentIntoAttachments,
  useCodeViewerCommentActions,
  handleCodeCommentBroadcastMessage,
  GIT_ACTION_IDS,
  COMMIT_MESSAGE_INPUT_ID,
  GIT_ACTION_TRIGGER_TESTID,
  GIT_COMMIT_ACTION_COMMAND_TESTID,
  GIT_COMMIT_ACTION_ITEM_TESTID,
  GIT_COMMIT_DIALOG_TESTID,
  GIT_COMMIT_GENERATE_BUTTON_TESTID,
  GIT_COMMIT_INCLUDE_UNSTAGED_TESTID,
  GIT_COMMIT_MESSAGE_INPUT_TESTID,
  isGitActionAvailable,
  resolvePrimaryGitAction,
  isPushEnabled,
  normalizeStagePath,
  normalizeDirPath,
  resolveWorkspaceInRepoPath,
  resolveRelativeSubpath,
  addStagePath,
  collectSessionStagePaths,
  isFileInSessionPaths,
  parseActiveTaskChangeSummaryPaths,
  filterFilesBySessionPaths,
  gitActionItemId,
  isGitActionId,
  isCommitMessageTextarea,
  resolveCommitSelection,
  resolveCommitStagePaths,
  mapChangeFilesToRows,
  summarizeFileRows,
  hasGitIdentity,
  GitActionMenuItem,
  GitCommitDialog,
  GitPushDialog,
  GitActionMenu,
  SUMMARY_SECTION_SCROLL_CLASS,
  SummarySectionHeader,
  SummarySection,
  SummaryGitSection,
  isMacUserAgent,
  isWindowsUserAgent,
  resolveFileManagerLabel,
  resolveProviderConfigOpenPath,
  useTaskFileActions,
} from '../components/code-viewer/GitReview';
export type {
  UseBoundStore,
  GitChangeKind,
  GitSourceId,
  GitDiffState,
  GitFileChange,
  GitSection,
  GitDataset,
  GitSourceOption,
  GitSummary,
  GitIdentity,
  GitBranchComparison,
  GitRefreshResult,
  GitPaneState,
  LastTurnChangeFile,
  LastTurnChangeSummary,
  DiffRenderMode,
  FileChangeFindMatch,
  FileChangeFindResult,
  GitChangeContextMenuLabels,
  GitChangeRowProps,
  GitChangesPanelProps,
  RewindFileEntry,
  RewindSkipReason,
  FileRewindPreview,
  FileRewindDialogProps,
  TurnFileChangeItem,
  CodeComment,
  CodeCommentScope,
  CodeCommentAttachment,
  CodeCommentAddDetail,
  CodeCommentContextsApi,
  AttachmentContextBundle,
  GitActionId,
  ActiveTaskChangeSummary,
  GitCommitDialogState,
  CommitDialogFileRow,
  CommitConversationContext,
  GitActionMenuItemProps,
  GitCommitDialogProps,
  GitPushDialogProps,
  GitActionMenuProps,
  SummarySectionProps,
  SummaryPanelGitModel,
  SummaryGitSectionProps,
  UseTaskFileActionsProps,
  TaskFileActions,
} from '../components/code-viewer/GitReview';
