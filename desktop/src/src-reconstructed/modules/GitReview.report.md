# GitReview 模块抽取报告（Git 审查族 · D8 Stage B3）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，md5 `c9d0d675…`）
- 产物：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/GitReview.tsx`（4,473 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 地图：`MODULE-MAP.md` F04/F14；标样：`TopBar.tsx` / `TopBar.report.md`
- 与已完成族的交接：`SidePanel.report.md`（BWt 接口级登记）、`TopBar.report.md`（C6/zZ 接口级登记）、`Conversation.report.md`（b_t/S_t 登记）

---

## 0. 行号口径

与 TopBar/SidePanel 相同：所有行号以输入 `.js` 为主口径，括注 jsx 双行号。本次对 90+ 个符号做了
双向定位（`function X(` / `var X =` 在两文件各自命中后核对类名/i18n key/日志文案），全部一致。
任务给定的四个对象登记行号逐条命中：

| 任务对象 | 既有登记 | 本次核实 |
|---|---|---|
| `BWt` GitChanges | SidePanel.report §1.6：js 178584–178920（接口级） | ✅ 178584–178919，完整还原 |
| `C6` useTaskFileActions | TopBar.report §1.1：js 142068–142182 / jsx 118006–118105（接口保留） | ✅ 完整还原（jsx 117982 为函数头，报告给的 118006 在其 props 内） |
| FileRewindDialog | Conversation.report §1：`b_t` js 110632 / jsx 94590（接口级） | ✅ 完整还原（含 `f1`/`y_t`/`x_t`/`p1`） |
| `FH` CodeComments | MODULE-MAP §2.1 #9：js 68514–68579 / jsx 60720 | ✅ store + 全消费面 |

---

## 1. 抽取的组件清单（混淆名 → 语义名 → 行号范围）

### 1.1 审查 pane 主体（完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `BWt` | `GitChangesPanel` | 178584–178919 | 144748 | 侧面板「审查」标签主体：来源 Select（未暂存/已暂存/全部分支更改/上一轮更改）+ 刷新 + 虚拟列表 + 6 档空态；`data-testid=git-pane`（原 `ine`，src-HCld2afU.js 8239）。`onClose` 解构未用（关闭走标签栏，保留接口） |
| `NWt` | `GitChangeRow` | 178371–178540 | 144648 | 单文件变更行：粘性头（`sticky top-0 z-10 h-8`，Bc 路径 + ±计数 + ⌄）+ 右键菜单 4 项 + 展开体 diff 三态 |
| `PWt` | `PlainTextDiffPreview` | 178541–178547 | 144701 | `gut` 封装 + `data-git-plain-text-diff-preview` |
| `LWt` | `computeFileChangeFindMatches` | 178563–178580 | 144726 | 变更内容查找（全文件匹配序列 + 下标回绕） |
| `IWt`/`FWt` | `countOccurrences`/`normalizeFindQuery` | 178551/178548 | 144714/144711 | 查找助手 |
| `TWt` | `resolveGitSourceI18nId` | 178298–178311 | 144567 | 来源 → `git.source.*` |
| `EWt` | `resolveDiffUnavailableI18nId` | 178312–178321 | 144581 | binary/truncated/unavailable |
| `y5` | `diffCacheKey` | 178322 | 144591 | `${sourceId}:${path}` |
| `DWt` | `extractDiffErrorMessage` | 178325–178332 | 144594 | |
| `OWt` | `countTextLines` | 178333–178339 | 144602 | |
| `kWt` | `isDiffTooLargeForRichRendering` | 178340–178346 | 144609 | >180KB ∨ >1200 行 |
| `AWt` | `resolveDiffRenderMode` | 178347–178354 | 144612 | rich / plain-text / patch |
| `jWt`/`MWt` | `tryExtractPlainTextDiffLines`/`findDiffHeaderPath` | 178355/178363 | 144632/144640 | /dev/null 新增删除文件特判 |
| `CWt`/`wWt` | `DIFF_RICH_CONTENT_CHAR_LIMIT`=180000 / `DIFF_RICH_LINE_LIMIT`=1200 | 178296 | 144565 | |
| `RWt`/`zWt` | `GIT_CHANGE_ROW_ESTIMATE_PX`=32 / `GIT_CHANGE_LIST_OVERSCAN`=14 | 178581 | 144746 | 虚拟列表常量 |

### 1.2 useTaskFileActions（完整还原，TopBar 族交接项）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `C6` | `useTaskFileActions` | 142068–142168 | 117982 | 会话文件/原生日志/供应商配置 路径 + 复制 + 打开；远程仅 WSL 可开（explorer via openInEditor）；本机 finder/explorer 优先回退 openInFileManager |
| `rFt`/`iFt` | `isMacUserAgent`/`isWindowsUserAgent` | 142169/142172 | 118091/118094 | UA 判定 |
| `aFt` | `resolveFileManagerLabel` | 142175–142181 | 118097 | 访达/资源管理器/文件管理器 三态 |
| `nFt` | `resolveProviderConfigOpenPath` | 142059–142067 | 117973 | 配置不存在退父目录（Windows 盘符根保留 `X:\`） |

### 1.3 FileRewindDialog（rewind 选择器 + 锚点 dim，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `b_t` | `FileRewindDialog` | 110632–110784 | 94590 | 双变体：`fileRewind`（destructive「撤销文件」，`!canApply` 禁用）/ `editConflict`（testid `v4-edit-workspace-conflict-dialog`，仅 [取消][仅继续对话]，后者 testid `v4-edit-workspace-conflict-conversation-only`） |
| `f1` | `RewindDialogFileList` | 110599–110631 | 94577 | **rewind 选择器**：安全/不安全/已忽略 三段文件列表，每文件显示「N 次修改」或跳过原因 |
| `y_t` | `formatRewindSkipReason` | 110586–110598 | 94563 | 6 种原因 → `rewindDialog.reason.*` |
| `x_t` | `buildUnifiedPatch` | 110785–110792 | 94650 | hunks → unified patch |
| `p1` | `openFileChangePatchInCodeViewer` | 110793–110812 | 94657 | 「审查」按钮落点（开 patch 型 code-viewer 标签） |

**锚点 dim 的代码证据**：调用方 `S_t` TurnFileChangesSummary（Conversation.tsx §5.14 已逐字抽取）中
`x = fileChanges.state === 'reverted'`：reverted 后渲染「已撤销」徽章（`chat.changeSummary.reverted`）、
撤销按钮 `disabled: !S || m || g`（S 含 `!x` 门控）—— 即轮文件卡（锚点）进入禁用/降显形态。
行内编辑流（`pvt`，js 112108 `P(l, 'rewind')`）触发 `workspaceMode: rewind`，被文件冲突阻断时
（`disposition: 'blocked' + preview`）打开 `editConflict` 变体。

### 1.4 代码评论消费面（FH：行内评论 → 回流对话，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `FH` | `useCodeCommentsStore` | 68514–68579 | 60720 | zustand store：commentsByBucketKey（工作区键\0文件路径 分桶）、同 id 覆盖、按源跨桶清除、从附件恢复 |
| `TH` | `CodeCommentsChip` | 68250–68361 | 60559 | 「N 条评论」chip + Tooltip 列表（文件/行号/路径/评论预览/逐条移除）；composer 与用户消息行两处消费 |
| `hXe` | `codeCommentContextKey` | 68246 | 60556 | |
| `EH/DH/gXe/OH` | 事件名×2 + 广播频道 + 已回流集合 | 68362–68365 | 60591–60594 | `zcode:code-comment-add-to-chat` / `-remove-from-chat` / `code-comment:remove-from-chat` |
| `kH/AH` | `commentWorkspaceKey`/`commentScopeKey` | 68367/68371 | 60596/60599 | |
| `_Xe/jH/vXe` | 已回流集合 读/写/删 | 68373–68381 | 60601–60605 | |
| `yXe/bXe` | 事件类型守卫 | 68382/68390 | 60610/60613 | |
| `MH/NH` | 载荷守卫（作用域/附件） | 68398/68409 | 60616/60620 | |
| `xXe/SXe/CXe` | 评论序列化三件（单条块/总块/拼接） | 68427–68450 | 60623–60637 | `## Comment N`：File/Side: R/Lines/Selected text/Comment |
| `wXe/TXe/EXe/DXe` | 解析四件（basename/行范围/单块/总块切分） | 68451–68502 | 60638–60697 | 发送内容 → 可见文本 + 附件 |
| `OXe/kXe` | add（cancelable）/remove 事件派发 | 68503/68507 | 60700/60707 | |
| `jXe` | `removeCodeCommentAndBroadcast` | 68580–68592 | 60796 | 移除 + 跨窗口广播（失败仅 warn） |
| `GH` | `countContextAttachments` | 68778–68786 | 60964 | |
| `GXe` | `buildOutboundContentWithAttachments` | 68787–68791 | 60967 | 发送内容装配（引用+评论+网页+pptx） |
| `KXe` | `parseDraftContentIntoAttachments` | 68792–68803 | 60970 | 逆解析（顺序：pptx→网页→评论→引用） |
| `qXe/KH` | `newCodeCommentId`/`codeCommentIdentityKey` | 68804/68809 | 60983/60986 | |
| `JXe` | `useCodeCommentContexts` | 68812–68878 | 60989 | composer 侧事件桥（preventDefault 确认收、去重合并、切作用域清空、请求聚焦） |
| —（tHt 内 `Ue/We`） | `useCodeViewerCommentActions` | 161313–161360 | — | 查看器侧提交/删除：OXe 回流 + FH 写入 / FH 移除 + kXe |
| —（g8t 内监听） | `handleCodeCommentBroadcastMessage` | 212711–212719 | — | 应用根：`restore-preview` 恢复 / `remove-from-chat` 清除 |

### 1.5 Git 工具 mini 浮卡（状态面板「Git 工具」段，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `mlt` | `SummaryGitSection` | 98354–98452 | 85281 | 段标题 `chat.statusPanel.environment`=**「Git 工具」**；三行：更改行（→ 打开审查标签）+ zZ 分支 chip（引用，勿重复）+ Rct 提交/推送 |
| `XZ` | `SummarySection` | 98313–98353 | 85250 | 段壳：Collapsible + 段头 + 限高滚动体（受控/非受控两用） |
| `plt` | `SummarySectionHeader` | 98278–98312 | 85240 | ⌄/› 折叠（悬停显形）+ trailing 插槽 |
| `flt` | `SUMMARY_SECTION_SCROLL_CLASS` | 98270–98277 | 85232 | environment 不限高；其余段 max-h-48/80 |
| `Rct` | `GitActionMenu` | 97609–98008 | 84647 | 提交/推送统一入口；触发器三形态（会话头胶囊/仅图标/status-row 整行）；主动作 = 有变更→提交对话框，否则可推送→推送对话框 |
| `Ict` | `GitCommitDialog` | 97012–97354 | 84376 | AI 提交对话框：分支 chip + ±统计 + 消息文本域（生成/重新生成）+ 含未暂存勾选 + cmdk 三动作（⏎ 执行、↑↓ 循环）+ 身份警告 |
| `Lct` | `GitPushDialog` | 97355–97608 | 84555 | 推送对话框：分支/上游/领先落后/后续步骤 信息卡 + upToDate 警告 + 错误详情复制（1.5s 已复制态） |
| `Fct` | `GitActionMenuItem` | 96990–97011 | 84352 | cmdk 动作项（图标∥spinner + 文案 + 快捷键角标） |
| `mct/hct/gct` | `isGitActionAvailable`/`resolvePrimaryGitAction`/`isPushEnabled` | 96895/96898/96905 | 84265/84268/84271 | |
| `BZ/_ct/vct/yct/VZ` | stage 路径归一化族 | 96909–96938 | 84274–84301 | |
| `bct/xct` | `collectSessionStagePaths`/`isFileInSessionPaths` | 96939/96951 | 84302/84313 | 会话路径三形态 + 子目录补形 |
| `Sct/Cct` | `parseActiveTaskChangeSummaryPaths`/`filterFilesBySessionPaths` | 96956/96962 | 84316/84320 | 提交对话框按本会话改动过滤 |
| `wct/HZ/Tct/Ect/Dct/Oct/kct/Act/jct` | 动作 id 集 + 输入框 id + 7 个 testid | 96966–96974 | 84324–84332 | `git-action-trigger`/`git-commit-dialog`/… |
| `Mct/Nct/Pct` | `gitActionItemId`/`isGitActionId`/`isCommitMessageTextarea` | 96975/96978/96981 | 84333/84336/84339 | |
| `UZ/WZ` | `resolveCommitSelection`/`resolveCommitStagePaths` | 96984/96987 | 84346/84349 | |
| `NZ` | `mapChangeFilesToRows` | 95017–95046 | 83023 | 仓库相对路径去重合并（±累加，类型冲突→modified） |
| `Est` | `summarizeFileRows` | 95047–95053 | 83047 | |
| `PZ` | `hasGitIdentity` | 95076–95078 | 83075 | null=未知可用；有名有邮箱可用 |

### 1.6 Git 状态层（审查 pane 数据源，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `nge` | `useGitRepository` | 23920–24014 | 20564 | gitService.refresh → 四来源数据集；⚠ 地图误标见 §4 |
| `tge` | `shouldRefreshGitState` | 23910–23919 | 20561 | |
| `ege/$he` | `buildLastTurnDataset`/`buildLastTurnChange` | 23898/23876 | 20549/20533 | last-turn 只读来源（内联 before/after） |
| `Qhe/Tg/Zhe` | `buildGitDatasets`/`groupChangesIntoSections`/`attachDiff` | 23862/23847/23844 | 20505/20491/20485 | |
| `wg/Cg/Xhe/Sg` | `createInitialGitPaneState`/`buildGitSourceOptions`/`createEmptyGitDatasets`/`createEmptyGitDataset` | 23829/23815/23807/23804 | 9524/20445/20437/20428 | |
| `Yhe/Jhe/xg/qhe` | 空摘要/变更类型/计数/错误提取 | 23788/23785/23782/23774 | 20412/20409/20406/20398 | |
| `Khe/Ghe/Whe` | 空身份/分组顺序/空分支比较 | 23773/23768/23767 | 20391/20387/20385 | |
| `bg/Uhe` | `isGitRpcEnabled`/`isRemoteWorkspaceDescriptor` | 23764/23760 | 20377/20374 | |
| `Hhe` | `buildLastTurnChangeSummary` | 23726–23759 | 20340 | 快照合并 + 行级增删（`Xr` LCS 计数，src-HCld2afU.js） |
| `yg` | `resolveRepoRelativePath` | 23717–23725 | 10296 附近 | |

### 1.7 图标（19 + 3 跨 chunk）

folder-open(`Q_` 27103)、copy(`W_` 26926)、refresh-cw(`Nv` 27677)、file-text(`Z_` 27060)、
chevron-down(`N_` 26802)、list-tree(`uv` 27300)、file-diff(`X_` 27036)、arrow-up-from-line(`w_` 26653)、
git-commit-horizontal(`Fye` 27147)、cloud-upload(`H_` 26913)、circle-alert(`F_` 26812)、check(`M_` 26801)、
loader(`fv` 27315)、git-branch(`ev` 27142)、trash-2(`Kv` 27882)、code-xml(`Cye` 26921)、
message-square-text(`_v` 27399)、undo-2(`qv` 27899)、chevron-right(`wa`，usageStatsUiParts `o` 导出)；
跨 chunk：sparkles(`f`=imeComposition `S`)、x(`g`=imeComposition `b`)、loader-circle(`M`=imeComposition `w`)。

---

## 2. 与 Codex 式 review 交互的证据（逐文件 + 行内评论回流）

任务重点。证据链全部来自本次抽取的代码现场：

### 2.1 逐文件审查（per-file review）

1. **轮文件卡 → 每文件「审查」按钮**：`S_t` TurnFileChangesSummary（Conversation.tsx 已抽取，
   本族 `p1` 为其落点）对每个变更文件渲染一行：文件图标路径 + ±计数 + **「审查」按钮
   （`chat.changeSummary.review`=「审查」，js 111057–111083）** + open-with 菜单。
2. **审查 = 打开 patch 视图**：`p1`（js 110793）把该文件的 hunks 用 `x_t` 拼成 unified patch，
   以 `{ type: 'patch', title: 仓库相对路径, path, patch, workspacePath… }` 调 `onOpenCodeViewer`
   —— 即侧面板 code-viewer 标签（patch 源，F14 `tHt` 消费，标签徽章 `DKt` 判 `diff --git` 头）。
3. **审查 pane 的逐文件列表**：`BWt` GitChangesPanel 把当前来源（未暂存/已暂存/分支比较/上一轮）
   的所有变更做虚拟列表，每行 `NWt` 展开即该文件 diff（三态渲染），并支持右键在文件管理器/
   文件树中定位 —— 与 Codex CLI `git diff` 逐文件过目的形态对应。
4. **查找驱动审查**：`fileChangeFindQuery/ActiveIndex/NavigationRequestId` 由工作区壳查找条下发；
   `BWt` 先预拉全部 diff（178752–178754），在 before+after 内容里数匹配（`LWt`），命中文件
   自动展开 + 滚动居中（178755–178766）—— 大变更集里的逐文件跳转。
5. **上一轮更改（只读审阅）**：`git.source.lastTurn`=「上一轮更改」来源 + 空态文案
   `git.empty.lastTurnDescription`=「当 agent 产生文件写入后，这里会优先复用现有 task 快照做只读审阅」
   （178621–178628）—— 直接对应 Codex 式「回看上一轮 agent 改了什么」。
6. **审查标签入口**：侧面板空态四宫格与 ⊞ 菜单的「审查」项、quickpick `add-review-tab` →
   `handleOpenGit`（SidePanel.report §2.3 C 已证）；本族 `mlt` 更改行 →
   `onOpenGitReview(gitWorktreeReviewSourceId)`（js 98405–98407）是第四入口。

### 2.2 行内评论回流对话（inline comments → back to conversation）

完整闭环七步，每步有代码落点：

| 步 | 行为 | 证据（js 行） |
|---|---|---|
| ① 行内加评论 | 代码查看器 gutter 选行 → `onSubmitCodeComment`（`Ue`）：`OXe` 派发 **cancelable** window 事件 `zcode:code-comment-add-to-chat`（携带 File/Lines/选中文本/评论 + 两个标签文案），未被「已回流」集合拦截则写 `FH` store | 161313–161348；68503 |
| ② composer 收件 | `JXe` 监听该事件：`preventDefault` 成功才收（拦截语义）、补 id（`qXe`）、按键去重合并、`requestFocus` 聚焦输入框 | 68843–68856 |
| ③ 输入框上方芯片 | `TH` CodeCommentsChip「N 条评论」，悬停展开逐条（文件名 + `L3-L7` 行号 + 路径 + 评论 line-clamp-2），可逐条/整批移除 | 90733（composer 接线）；68250 |
| ④ 发送装配 | `GXe`/`CXe` 把评论序列化成 `# Code comments:` 块（`## Comment N`：File/Side: R/Lines/Selected text/Comment）追加到消息尾部 | 68787；68427–68450 |
| ⑤ 历史回显 | `KXe`/`DXe` 把消息内容里的评论块解析回附件，用户行以 `TH`（`contentAlign: end`）只读回显 | 112193；68792/68488 |
| ⑥ 移除同步 | chip 移除 → `jXe` 广播 `code-comment:remove-from-chat` 到其他窗口（应用根 212714–212719 接收并清 store）；查看器删除 → `FH.removeComment` + `kXe` 事件 → composer 同步移除 | 68580；212711–212719；161349–161360 |
| ⑦ 重开恢复 | 发送后再打开该文件：`code-comment:restore-preview` 广播 → `FH.restoreCommentFromAttachment`（先解除「已回流」标记） | 212711–212714；68554–68569 |

### 2.3 审查 → 提交/推送闭环

`mlt`「Git 工具」段把审查结果直接接到 git 动作：`Rct` 打开提交对话框时按**本会话改动路径**
（`bct`/`Cct`，从 activeTaskChangeSummary 推导）过滤 staged/unstaged 文件 —— 即「这轮对话改的文件」
优先呈现；提交消息由 `gitService.generateCommitMessage` 生成（locale + 会话文件路径 + 会话上下文
`commitMessageConversationContext` 一并下发，js 97728–97746）。这是 Codex 式「review → commit」闭环。

---

## 3. 边界判定依据

1. **函数体边界**：压缩版每语句一行；以相邻顶层声明定界（如 `BWt` 178584 至 `var b5` 178920 前；
   `Rct` 97609 至 `var zct` 98010 前）。
2. **闭包追踪**：从 `BWt`/`mlt`/`TH`/`b_t`/`C6` 的 JSX 与钩子引用出发递归收集局部符号，终点三类：
   本 chunk 他处顶层定义（继续追，如 `NWt→AWt→jWt→MWt`）、文件头跨 chunk 别名（§4）、
   已完成族组件（`zZ`→TopBar.tsx、`S_t`→Conversation.tsx、`kZ/AZ/jZ`→Collapsible 原语）。
3. **调用方确认**：
   - `BWt` 唯一实例化点在 `xqt` SidePanel js 183115（`i.type === 'git'` 分派），props 逐字核对；
   - `gitState` 由 `XJt` js 186469 `un = nge({...})` 下发（含 `includeExtendedData: sn` = 存在 git 标签时拉身份/分支比较）；
   - `mlt` 被 `Flt` 摘要栏消费（TopBar.tsx 接口登记处）；`TH` 两处消费（90733/112193）；
   - `b_t` 两处消费：`S_t`（111104，fileRewind）与行内编辑行（112160，editConflict）。
4. **归属取舍**：
   - `NZ/Est/PZ`（95017–95078）行号落在 TopBar 族区间（94967–99484），但语义为提交对话框服务且
     TopBar.tsx 未抽取，归入本族；
   - `The…Nhe`（23403–23700，工具调用→文件变更推断）是 last-turn 数据的上游生成器，属任务域，
     仅登记不展开；
   - `El` gutter 控制器（6062–6881）与 `tHt` 本体（161141–162009）属 F14，仅登记；本族抽取其
     评论接线面（`Ue/We` 回调 + props 161996–162001）。
5. **排除项**：`yWt/bWt/xWt/SWt`（178240–178295，browser-use 截图 surface，F13）；
   `_Wt/vWt`（177724/178191，浏览器视图，F13）；`yst`（94955，yJt 消费）；
   网页元素上下文族（`IH…` 68593+，与代码评论同构但独立功能域）。

## 4. 外部依赖清单（跨 chunk）与勘误

| # | chunk | 符号 |
|---|---|---|
| 1 | react / jsx-runtime | React（Q）、jsx（$） |
| 2 | utils-CEEH0K_K.js | `cn()`（Z） |
| 3 | button-laUijeDG.js | Button（X）、createLucideIcon（Sa） |
| 4 | IntlProvider-C321H7m8.js | useIntlContext（G）→{intl,locale}；词典侧 `git.*` 95 key、`chat.changeSummary.*`、`chat.codeComments.*`、`chat.statusPanel.environment/changes` 已核对 |
| 5 | imeComposition-DEYFkwWm.js | usePlatformService（l=M）、toast（m=_）、Textarea（j=v）、spinner（M=w）、x 图标（g=b）、sparkles（f=S） |
| 6 | usageStatsUiParts-CiR7YEhh.js | Tooltip 底层（CN/wN/TN 的本 chunk 封装基于 dN/fN/pN）、Popover 原语（Na/Oa/Ma/ka）、chevron-right（wa=o） |
| 7 | keyboardShortcuts-BGHopxr9.js | shortcutLabel（$i=n）、快捷键匹配（ta=u） |
| 8 | logger-PFDwl5Yq.js | logger（J） |
| 9 | skillStore-BmeKHDBI.js | zustand create（Ae） |
| 10 | esm-BY6T6pIH.js | useVirtualizer（to=t，@tanstack/react-virtual） |
| 11 | src-HCld2afU.js | diff 行计数（Xr=b，out 9020–9040）、testid `git-pane`（nr←wg 8239）、editConflict 双 testid（8394/8395） |
| — | 本 chunk 原语 | Dialog（31943+）、Select（46009+）、ContextMenu（48825+）、Collapsible（94925+）、cmdk（32092+）、Bc（5157）、W8=memo(mVt)（160479/160542）、gut（100459） |

**勘误三条**：
1. **MODULE-MAP F12 备注**：「`nge` 用量数据 hook js 23920」系误认 —— `nge` 是 **useGitRepository**
   （调 `gitService.refresh`，日志 `[useGitRepository] 读取 Git 仓库状态失败`），是本族审查 pane 的
   数据层。建议下版地图把 23920–24014 改记为 Git 状态层（双归属 F04/F13 数据面）。
2. **TopBar.tsx GitBranchChipProps**：`popoverSide` 只声明了 `"top" | "bottom"`，但 `mlt`/`Ict`
   实际传 `"left"`（98437）与 `"bottom"`（97169）。本文件按三态声明引用接口；建议回补 TopBar.tsx。
3. **MODULE-MAP F04 备注**：BWt 行号「178584」正确，但「178920」是下一个顶层声明 `var b5` 的行，
   `BWt` 函数体实际止于 178919。

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| `BWt/NWt` 全部类名、i18n key、data 属性、日志文案（`[GitPane] …`）、虚拟列表与查找接线 | **高（逐字转录）** | 直接自压缩源码还原，零改动 |
| `b_t/f1/y_t/x_t/p1` rewind 链路与双变体 | **高（逐字转录）** | 同上；testid 已反查 src chunk 值 |
| `FH` store 五动作 + 评论序列化/解析/事件桥全链路 | **高（逐字转录）** | 纯逻辑逐行对照；正则逐字保留（可回测） |
| `mlt/XZ/plt/flt/Rct/Ict/Lct/Fct` 及全部助手 | **高（逐字转录）** | JSX 与日志文案（`[GitActionMenu] …`）逐字 |
| `nge` 状态层 20 符号 | **高** | 纯逻辑；`last-turn` 常量化入参的怪异形态亦逐字保留并注释 |
| `C6` + 三个路径钩子的调用面 | **高** | C6 本体逐字；`Xge/qge/wge` 按调用面声明（横切层，未逐行展开） |
| TS props/服务类型 | **中高（推断）** | 由解构默认值与用法归纳；GitService/PlatformService 等跨 chunk 接口按调用面归纳，可能与真实接口有细微出入 |
| 声明为接口的叶子（W8/gut/Bc/Select/ContextMenu/Dialog/cmdk/Tooltip 原语、El gutter、tHt 本体） | **中（接口级）** | 体量大且属他族（F14/横切原语），行号已登记，可按需补全 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`（esbuild 0.x，web/node_modules）：**0 错误**，输出 106.7kb。
- `tsc --noEmit --strict --lib es2023,dom,dom.iterable`（在 `/home/none/grok-build/web` 的
  @types/react 环境下，临时副本 `/tmp/gitreview-tsc/` 验证后保留待查）：**0 错误**。
- `out/` 目录未做任何修改（只读访问；`styles-CdEGpc2x.js` md5 `c9d0d675d0b858e6e7711df3e9122e81` 与
  SidePanel 报告记录一致）。

## 7. 后续建议

1. F14（CodeViewerFamily）抽取时，把本文件声明为接口的 `tHt`/`W8`/`gut`/`El` 落地，并与
   `useCodeViewerCommentActions` 对接（接线点 161996–162001 已登记）。
2. Composer 族（F08）抽取时直接复用本族的 `useCodeCommentContexts`/`CodeCommentsChip`/
   `buildOutboundContentWithAttachments`（接线点 90416/90733 已登记）。
3. 建议把 §4 勘误 1/2 回写 MODULE-MAP 与 TopBar.tsx。
4. `The…Nhe`（23403–23700）工具调用→文件变更推断簇可在任务域（F01/Conversation）抽取时补全，
   它是「上一轮更改」来源的数据生成器。
