# SYMBOL-INDEX — ZCode 3.7.6 恢复版全局符号导航底座（D9）

> 四向索引：**语义名 ↔ 混淆名 ↔ js/jsx 行号 ↔ 所在文件**。由脚本自各重建文件的头映射表 + 尾符号表抽取（`/tmp/d9/extract_symbols.py`），人工抽样校验。


## 0. 使用须知

- **行号口径**：
  - styles 族（F00–F20 主体）：`js` = 融合 chunk `out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，压缩版，**主口径**）；`jsx` = `src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，pretty-print 版，规格文档口径）。
    B5 起 styles 族以当前 out 213,979 行为「当前 js」口径（台账 213,695 口径 = 当前−分段偏移，见 B5-MERGE-NOTES §1）。
  - 独立 chunk（i18n/button/charts/office/…）：行号指**该 chunk 自身**（见每族标题的 chunk 名）；office 族按 OfficePreview.report 口径以 **jsx pretty 版**为锚点。
  - 空行号 = 该符号在尾符号表登记但未附行号（多为局部助手/导入符号），可在所在文件内按混淆名直接检索。
- **混淆名是 chunk 局部的**：不同 chunk 可复用同一短名（如 `Oc` 在 styles = useWorkspaceServices，在 xlsx chunk = XlsxWorkerClient）。跨 chunk 同名不构成冲突，以「所在文件」列区分。
- **i18n 去重裁决**：`I18n.tsx` = **canonical**（词典与 API 以它为准）；`intlProvider.tsx` 已在文件头标注 `// DUPLICATE-OF: I18n.tsx`，保留作行级直排版 + 14/14 运行时等价 harness 记录。详见 §19 与 COVERAGE-LEDGER。
- **冲突裁决**：同一 chunk 内同一混淆名出现两个语义名时，以 MODULE-MAP 族归属 + 全量抽取文件优先裁决，裁决表见文末附录 B。
- **校验**：12% 随机抽样（297 条）存在性复核 0 失败；16 个行号锚点回代原始 chunk 逐字命中（`function X(` / `var X = memo(`）。
  B4 增量校验：10.1% 随机抽样（131 条）存在性复核 0 失败；21 个行号锚点回代原始 chunk 逐字命中（详见附录 C）。

**规模**：8,681 条符号登记（含 115 个重建文件；B4 批次新增 1,303 条 / 16 文件，见 §25–§32；B5 批次新增 4,984 条 / 36 文件，见 §34–§69）。

## 1. TopBar

- 族登记：F00 TopBarFamily
- 产物：TopBar.tsx / TopBar.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| applyOptimisticTaskMutation | `Uo` | 1895 | 959 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useBaseServices | `Ec` | 4897 | 3716 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceServices | `Oc` | 4945 | 3754 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useTaskListItems | `ZS` | 35727 | 32810 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useFeedbackStore | `yC` | 36992 | 33835 | TopBar.tsx | styles-CdEGpc2x.js |  |
| PRODUCT_DOCS_URL | `lw` | 39410 | 35469 | TopBar.tsx | styles-CdEGpc2x.js | = https://zcode.z.ai/docs |
| resolveBranchDisplayLabel | `MZ` | 94967 | 82976 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useGitBranchSwitcher | `pct` | 96362 | 83842 | TopBar.tsx | styles-CdEGpc2x.js |  |
| GitBranchChip | `zZ` | 96589 | 84085 | TopBar.tsx | styles-CdEGpc2x.js | git 分支切换 chip（含分支搜索/新建/提交切换） |
| resolveSummaryPanelVariant | `Uct` | 98016 | 84991 | TopBar.tsx | styles-CdEGpc2x.js |  |
| buildSummaryPanelModel | `tlt` | 98133 | 85113 | TopBar.tsx | styles-CdEGpc2x.js |  |
| EMPTY_SUBAGENTS | `clt` | 98224 | 85193 | TopBar.tsx | styles-CdEGpc2x.js |  |
| EMPTY_BACKGROUND_WORKS | `slt` | 98224 | 85193 | TopBar.tsx | styles-CdEGpc2x.js |  |
| ConversationSummaryAside | `Flt` | 99217 | 85723 | TopBar.tsx | styles-CdEGpc2x.js | （mini/panel/auto 三态） |
| remoteTargetLabel | `ZTt` | 123239 | 104935 | TopBar.tsx | styles-CdEGpc2x.js |  |
| sshDecoratedProjectName | `QTt` | 123251 | 104947 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useConfirmDialog | `U2` | 123493 | 105222 | TopBar.tsx | styles-CdEGpc2x.js |  |
| RemoteSyncMenuItems | `n4` | 127149 | 107575 | TopBar.tsx | styles-CdEGpc2x.js | （技能/MCP/插件） |
| RemoteSyncDialogs | `r4` | 127248 | 107623 | TopBar.tsx | styles-CdEGpc2x.js | （本文件仅保留接口） |
| UpdateStatusDialog | `COt` | 128795 | 108390 | TopBar.tsx | styles-CdEGpc2x.js | （本文件仅保留接口，见注释） |
| pickLocalizedReleaseNotes | `TOt` | 129047 | 108612 | TopBar.tsx | styles-CdEGpc2x.js |  |
| formatReleaseDate | `EOt` | 129054 | 108620 | TopBar.tsx | styles-CdEGpc2x.js |  |
| resolveUpdateViewModel | `DOt` | 129066 | 108630 | TopBar.tsx | styles-CdEGpc2x.js | → 视图模型 |
| downloadProgressLabel | `kOt` | 129096 | 108657 | TopBar.tsx | styles-CdEGpc2x.js |  |
| formatMegabytes | `NOt` | 129122 | 108680 | TopBar.tsx | styles-CdEGpc2x.js |  |
| UpdateStatusDialogController | `POt` | 129125 | 108678 | TopBar.tsx | styles-CdEGpc2x.js | （下载/跳过/重启安装） |
| ReleaseNotesPopover | `FOt` | 129296 | 108831 | TopBar.tsx | styles-CdEGpc2x.js |  |
| updatePillResponsiveClasses | `IOt` | 129354 | 108851 | TopBar.tsx | styles-CdEGpc2x.js |  |
| UpdateIndicator | `LOt` | 129385 | 108869 | TopBar.tsx | styles-CdEGpc2x.js | （下载中/可更新/已下载胶囊） |
| TopBarIconButton | `o4` | 129479 | 108952 | TopBar.tsx | styles-CdEGpc2x.js | +tooltip |
| WINDOWS_CAPTION_RIGHT_INSET_VAR | `s4` | 129507 | 108965 | TopBar.tsx | styles-CdEGpc2x.js |  |
| windowsCaptionInsetStyle | `c4` | 129509 | 108967 | TopBar.tsx | styles-CdEGpc2x.js | env(titlebar-area-*) 计算右侧原生控件宽度 |
| WINDOWS_CAPTION_BUTTON_CLASS | `zOt` | 129515 | 108973 | TopBar.tsx | styles-CdEGpc2x.js |  |
| TopBarOverlay | `BOt` | 129516 | 108974 | TopBar.tsx | styles-CdEGpc2x.js |  |
| captureFeedbackScreenshots | `YPt` | 141785 | 117765 | TopBar.tsx | styles-CdEGpc2x.js |  |
| exportLogsWithToast | `XPt` | 141789 | 117769 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useHelpActions | `ZPt` | 141806 | 117792 | TopBar.tsx | styles-CdEGpc2x.js |  |
| CAPTION_MENU_ALIGN_OFFSET | `QPt` | 141825 | 117815 | TopBar.tsx | styles-CdEGpc2x.js | = -12 |
| isAutoUpdateChannelSupported | `$Pt` | 141826 | 117816 | TopBar.tsx | styles-CdEGpc2x.js | （env==='production'） |
| WindowsCaptionMenu | `S6` | 141854 | 117848 | TopBar.tsx | styles-CdEGpc2x.js | Win/Linux 标题栏 ⌄ 应用菜单 |
| useTaskFileActions | `C6` | 142068 | 118006 | TopBar.tsx | styles-CdEGpc2x.js |  |
| TaskActionMenuItems | `oFt` | 142183 | 118106 | TopBar.tsx | styles-CdEGpc2x.js | （置顶/重命名/归档/未读/复制路径…） |
| buildTaskFeedbackDescription | `w6` | 142334 | 118239 | TopBar.tsx | styles-CdEGpc2x.js |  |
| usePinnedTaskListStore | `E6` | 142372 | 118266 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceTaskListStore | `k6` | 142464 | 118392 | TopBar.tsx | styles-CdEGpc2x.js |  |
| TaskRenameDialog | `j6` | 142581 | 118551 | TopBar.tsx | styles-CdEGpc2x.js | （IME 保护） |
| OpenInEditorButtonGroup | `xFt` | 143194 | 119336 | TopBar.tsx | styles-CdEGpc2x.js | IDE 中打开（主按钮+⌄选择编辑器） |
| TerminalToggleButton | `H6` | 143316 | 119406 | TopBar.tsx | styles-CdEGpc2x.js | （Ctrl+J，激活 !bg-selected） |
| HelpMenu | `U6` | 143345 | 119420 | TopBar.tsx | styles-CdEGpc2x.js | （反馈/建议/社群/文档/导出日志） |
| SessionHeaderRight | `SFt` | 143418 | 119457 | TopBar.tsx | styles-CdEGpc2x.js | （编辑器/帮助/终端/侧面板） |
| SessionHeaderLeft | `wFt` | 143485 | 119493 | TopBar.tsx | styles-CdEGpc2x.js | （标题/路径pill/分支/更多） |
| SessionHeader | `TFt` | 144008 | 119938 | TopBar.tsx | styles-CdEGpc2x.js | （h-12 border-b） |
| useTrajectoryViewerStore | `ls` | — | 1697 | TopBar.tsx | styles-CdEGpc2x.js |  |
| resolveEffectiveProvider | `Zge` | — | 21359 | TopBar.tsx | styles-CdEGpc2x.js |  |
| useMcpStore | `Ug` | — | 21655 | TopBar.tsx | styles-CdEGpc2x.js |  |
| canOpenRemoteSessionSource | `$2` | — | — | TopBar.tsx | styles-CdEGpc2x.js | (143482,127125 / 119494,107556) |
| canOpenRemoteSessionSource | `CFt` | — | — | TopBar.tsx | styles-CdEGpc2x.js | (143482,127125 / 119494,107556) |
| updateMenuItemI18nId | `eFt` | — | — | TopBar.tsx | styles-CdEGpc2x.js | / updateMenuItemI18nValues (141829,141843 / 117819,117833) |
| updateMenuItemI18nId | `tFt` | — | — | TopBar.tsx | styles-CdEGpc2x.js | / updateMenuItemI18nValues (141829,141843 / 117819,117833) |
| useTaskStore | `xe` | — | — | TopBar.tsx | styles-CdEGpc2x.js | （skillStore chunk 的 h 导出） |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Q`/`$` | React / jsx 运行时 | react-BQLj9xdT.js / jsx-runtime-B5yMD3-t.js（外部） |
| `Z` | cn() 类名合并 | UtilsCn.tsx（utils-CEEH0K_K.js） |
| `X`/`Sa` | Button / createLucideIcon | button.tsx（button-laUijeDG.js） |
| `G` | useZCodeIntl {intl,locale} | **I18n.tsx**（IntlProvider-C321H7m8.js，canonical） |
| `l`/`m`/`P`/`A`/`M` | usePlatformService / toast / Input / IME 守卫 / spinner | ImeComposition.tsx（imeComposition-DEYFkwWm.js） |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `$i` | shortcutLabel | keyboardShortcuts-BGHopxr9.js（外部） |
| `J` | logger | logger.tsx（logger-PFDwl5Yq.js） |
| `xe`/`Ae`/`Ne` | useTaskStore / zustand create / useSkillsStore | skillStore-BmeKHDBI.js（外部 chunk） |
| `oi`/`hi`/testid×8 | DesktopCommand / 环境常量 / testid | src-HCld2afU.js（外部） |
| `cj` | MarkdownRenderer | MarkdownIntegration.tsx（F19） |
| `VO…JO`/`zb…Wb` | DropdownMenu / Dialog 原语 | styles 本 chunk 47926–48040 / 31943+（横切层） |

## 2. Sidebar

- 族登记：F01 SidebarFamily
- 产物：Sidebar.tsx / Sidebar.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| isLocalDirectoryUnavailableSelector | `sc` | 3324 | — | Sidebar.tsx | styles-CdEGpc2x.js | sc→isLocalDirectoryUnavailableSelector 3324 |
| SpinnerStatus | `EN` | 54789 | — | Sidebar.tsx | styles-CdEGpc2x.js | EN→SpinnerStatus 54789 |
| Badge | `uJ` | 70704 | — | Sidebar.tsx | styles-CdEGpc2x.js | uJ→Badge 70704 |
| resolveWorkspaceTabKey | `R2` | 104991 | — | Sidebar.tsx | styles-CdEGpc2x.js | R2→resolveWorkspaceTabKey★ 104991 |
| store | `A6` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| store | `D6` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| store | `O6` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| store | `T6` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| store | `cFt` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| store | `sFt` | 142360–142580 | 118255–118480 | Sidebar.tsx | styles-CdEGpc2x.js | /排序/刷新助手 |
| storeWorkspaceKey | `T6/O6` | 142360 | 144446 | Sidebar.tsx | styles-CdEGpc2x.js | T6/O6→storeWorkspaceKey 142360/144446 |
| useRemotePinnedTaskListStore | `E6` | 142372 | 118266 | Sidebar.tsx | styles-CdEGpc2x.js | stores：E6→useRemotePinnedTaskListStore 142372/118266 |
| useRemoteWorkspaceTaskListStore | `k6` | 142464 | 118392 | Sidebar.tsx | styles-CdEGpc2x.js | k6→useRemoteWorkspaceTaskListStore 142464/118392 |
| NewTaskRow | `EFt` | 144153 | 120034 | Sidebar.tsx | styles-CdEGpc2x.js | （Ctrl+N）；任务行：EFt→NewTaskRow 144153/120034 |
| 乐观叠加合并助手 | `AFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `DFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `MFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `NFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `OFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `jFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 乐观叠加合并助手 | `kFt` | 144184–144341 | 120050–120152 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 展开键集合 / 可见数限制 | `FFt` | 144342–144362 | 120153–120163 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 展开键集合 / 可见数限制 | `IFt` | 144342–144362 | 120153–120163 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 展开键集合 / 可见数限制 | `LFt` | 144342–144362 | 120153–120163 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 展开键集合 / 可见数限制 | `PFt` | 144342–144362 | 120153–120163 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| workspaceExpansionFlags | `W6` | 144363 | 120164 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceTaskGroups | `VFt` | 144427 | 120229 | Sidebar.tsx | styles-CdEGpc2x.js | （项目视图数据，接口级）；VFt→useWorkspaceTaskGroups★ 144427/120229 |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `GFt` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `K6` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `KFt` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `UFt` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `WFt` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 侧栏任务偏好 zcode-sidebar-task-preferences | `q6` | 144772–144802 | 120543–120570 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| partitionWorkspaceTabsByPurpose | `ZFt/QFt` | 144863 | 144866 | Sidebar.tsx | styles-CdEGpc2x.js | ZFt/QFt→partitionWorkspaceTabsByPurpose 144863/144866 |
| GROUP_COLORS | `$6` | 144872 | 120648 | Sidebar.tsx | styles-CdEGpc2x.js | [gray red orange yellow green blue purple]；$6→GROUP_COLORS 144872/120648 |
| 分组行类名常量 | `aIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组行类名常量 | `iIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组行类名常量 | `nIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组行类名常量 | `oIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组行类名常量 | `rIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组行类名常量 | `tIt` | 144890–144896 | 120667–120672 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| groupedTaskKey | `n8` | 144906 | 120686 | Sidebar.tsx | styles-CdEGpc2x.js | n8→groupedTaskKey 144906/120686 |
| 折叠组持久化 zcode-grouped-task-collapsed-groups | `AIt` | 145137–145166 | 121001–121020 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 折叠组持久化 zcode-grouped-task-collapsed-groups | `DIt` | 145137–145166 | 121001–121020 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 折叠组持久化 zcode-grouped-task-collapsed-groups | `EIt` | 145137–145166 | 121001–121020 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 折叠组持久化 zcode-grouped-task-collapsed-groups | `OIt` | 145137–145166 | 121001–121020 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 折叠组持久化 zcode-grouped-task-collapsed-groups | `kIt` | 145137–145166 | 121001–121020 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| ArchivedTasksSection | `lLt` | 146823 | — | Sidebar.tsx | styles-CdEGpc2x.js | lLt→ArchivedTasksSection★ 146823 |
| Avatar | `_Lt` | 147698–147725 | 122830–122848 | Sidebar.tsx | styles-CdEGpc2x.js | （数值上在 F04 段内，页脚复用）；147698–147725（F04 数值段，页脚复用） |
| Avatar | `gLt` | 147698–147725 | 122830–122848 | Sidebar.tsx | styles-CdEGpc2x.js | （数值上在 F04 段内，页脚复用）；147698–147725（F04 数值段，页脚复用） |
| Avatar | `hLt` | 147698–147725 | 122830–122848 | Sidebar.tsx | styles-CdEGpc2x.js | （数值上在 F04 段内，页脚复用）；147698–147725（F04 数值段，页脚复用） |
| useWebRemoteControlEnabled | `y8` | 150106 | 124386 | Sidebar.tsx | styles-CdEGpc2x.js | y8→useWebRemoteControlEnabled 150106 |
| resolveRemoteControlStatusDisplay | `sRt` | 150109 | 124391 | Sidebar.tsx | styles-CdEGpc2x.js | sRt→resolveRemoteControlStatusDisplay 150109 |
| WebRemoteControlTrigger | `cRt/lRt` | 150140 | 150159 | Sidebar.tsx | styles-CdEGpc2x.js | cRt/lRt→WebRemoteControlTrigger 150140/150159 |
| 用量视图模型助手/常量 | `dRt` | 150230–150254 | 124505–124526 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用量视图模型助手/常量 | `fRt` | 150230–150254 | 124505–124526 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用量视图模型助手/常量 | `pRt` | 150230–150254 | 124505–124526 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用量视图模型助手/常量 | `uRt` | 150230–150254 | 124505–124526 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useSidebarUsageState | `mRt` | 150255 | 124527 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级）；mRt→useSidebarUsageState★ 150255 |
| UsageMenuItems | `hRt` | 150373 | 124636 | Sidebar.tsx | styles-CdEGpc2x.js | gRt → UsagePlanBadge；hRt→UsageMenuItems 150373/124636 |
| UsagePlanBadge | `gRt` | 150410 | 124662 | Sidebar.tsx | styles-CdEGpc2x.js | gRt→UsagePlanBadge 150410/124662 |
| ZOOM_LEVEL_MIN | `_Rt` | 150424 | 124668 | Sidebar.tsx | styles-CdEGpc2x.js | =-3 / ZOOM_LEVEL_MAX=5 |
| ZOOM_LEVEL_MIN | `vRt` | 150424 | 124668 | Sidebar.tsx | styles-CdEGpc2x.js | =-3 / ZOOM_LEVEL_MAX=5 |
| SidebarFooter | `SRt` | 150435 | 124677 | Sidebar.tsx | styles-CdEGpc2x.js | + 用户名/plan 徽章 + 菜单（语言/主题/缩放/用量/登录）；页脚：SRt→SidebarFooter 150435/124677 |
| TaskActionContextMenuContent | `CRt` | 150732 | 124828 | Sidebar.tsx | styles-CdEGpc2x.js | CRt→TaskActionContextMenuContent 150732/124828 |
| isSnoozableUserInputInteraction | `wRt` | 150788 | 124887 | Sidebar.tsx | styles-CdEGpc2x.js | / resolveInteractionBadgeModel (150788/150793 / 124887/124892)；wRt→isSnoozableUserInputInt |
| isSnoozableUserInputInteraction | `TRt` | 150793 | 124892 | Sidebar.tsx | styles-CdEGpc2x.js | / resolveInteractionBadgeModel (150788/150793 / 124887/124892)；TRt→resolveInteractionBadge |
| TaskInteractionBadge | `b8` | 150807 | 124916 | Sidebar.tsx | styles-CdEGpc2x.js | （用户输入/权限 + 倒计时）；b8→TaskInteractionBadge 150807/124916 |
| useSnoozeInteractionCountdown | `ERt` | 150926 | 124970 | Sidebar.tsx | styles-CdEGpc2x.js | ERt→useSnoozeInteractionCountdown★ 150926/124970 |
| 跑马灯常量/助手 | `ARt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `C8` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `DRt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `MRt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `NRt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `ORt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `S8` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `jRt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `kRt` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 跑马灯常量/助手 | `x8` | 150984–150993 | 125010–125025 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| OverflowMarqueeText | `w8` | 150996 | 125026 | Sidebar.tsx | styles-CdEGpc2x.js | w8→OverflowMarqueeText 150996/125026 |
| createDragImageUpdater | `PRt` | 151118 | 125117 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| taskRowPropsAreEqual | `LRt` | 151162 | 125125 | Sidebar.tsx | styles-CdEGpc2x.js | LRt→taskRowPropsAreEqual 151162/125125 |
| TaskRow | `E8` | 151186 | 125140 | Sidebar.tsx | styles-CdEGpc2x.js | （未读点/状态点/置顶/归档确认/拖拽/徽章/相对时间）；E8→TaskRow 151186/125140 |
| TaskRowContextMenuContent | `D8` | 151618 | 125352 | Sidebar.tsx | styles-CdEGpc2x.js | D8→TaskRowContextMenuContent 151618/125352 |
| taskRowKey | `RRt/VRt` | 151748 | 152244 | Sidebar.tsx | styles-CdEGpc2x.js | RRt/VRt→taskRowKey 151748/152244 |
| SectionTitle | `zRt` | 151751 | 125475 | Sidebar.tsx | styles-CdEGpc2x.js | RRt/VRt → taskRowKey；zRt→SectionTitle 151751/125475 |
| PinnedTasksSection | `BRt` | 151757 | 125480 | Sidebar.tsx | styles-CdEGpc2x.js | 列表段：BRt→PinnedTasksSection 151757/125480 |
| TimelineTasksSection | `HRt` | 152247 | 125894 | Sidebar.tsx | styles-CdEGpc2x.js | （日期分组 + 分页）；HRt→TimelineTasksSection 152247/125894 |
| 分组视图构建/乐观叠加/状态 | `$Rt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组视图构建/乐观叠加/状态 | `QRt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组视图构建/乐观叠加/状态 | `ezt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组视图构建/乐观叠加/状态 | `nzt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组视图构建/乐观叠加/状态 | `qRt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分组视图构建/乐观叠加/状态 | `tzt` | 152903–153126 | 126428–126668 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useGroupedTaskView | `uzt` | 153205 | 126735 | Sidebar.tsx | styles-CdEGpc2x.js | （数据装载，接口级）；uzt→useGroupedTaskView★ 153205/126735 |
| GroupedTaskContextMenuContent | `dzt` | 153462 | 126985 | Sidebar.tsx | styles-CdEGpc2x.js | dzt→GroupedTaskContextMenuContent 153462/126985 |
| TaskRowActionButton | `M8` | 153598 | 127060 | Sidebar.tsx | styles-CdEGpc2x.js | （CSS tooltip）；M8→TaskRowActionButton 153598/127060 |
| formatChangeStatParts | `fzt` | 153631 | 127078 | Sidebar.tsx | styles-CdEGpc2x.js | fzt→formatChangeStatParts 153631/127078 |
| GroupEmptyDropZone | `hzt` | 154015 | 127332 | Sidebar.tsx | styles-CdEGpc2x.js | hzt→GroupEmptyDropZone 154015/127332 |
| NewThreadRow | `_zt` | 154093 | 127402 | Sidebar.tsx | styles-CdEGpc2x.js | _zt→NewThreadRow 154093/127402 |
| resolveGroupTitle | `P8` | 154158 | 127422 | Sidebar.tsx | styles-CdEGpc2x.js | P8→resolveGroupTitle 154158/127422 |
| GroupTaskVirtualList | `wzt` | 154202 | 127466 | Sidebar.tsx | styles-CdEGpc2x.js | （>80 启用）；wzt→GroupTaskVirtualList 154202/127466 |
| GroupSection | `Tzt` | 154327 | 127546 | Sidebar.tsx | styles-CdEGpc2x.js | （色点/重命名/折叠/计数/右键）；Tzt→GroupSection 154327/127546 |
| GroupNodeDragOverlayCard | `Ezt` | 154899 | 127898 | Sidebar.tsx | styles-CdEGpc2x.js | Ezt→GroupNodeDragOverlayCard 154899/127898 |
| GroupedNodeVirtualList | `Fzt` | 154948 | 127941 | Sidebar.tsx | styles-CdEGpc2x.js | Fzt→GroupedNodeVirtualList 154948/127941 |
| CollapsedGroupStickyHeader | `Izt` | 155026 | 128002 | Sidebar.tsx | styles-CdEGpc2x.js | Izt→CollapsedGroupStickyHeader 155026/128002 |
| groupedNodeFingerprint | `z8` | 155354 | — | Sidebar.tsx | styles-CdEGpc2x.js | z8→groupedNodeFingerprint★ 155354 |
| FLIP | `aBt` | 155363–155414 | 128321–128355 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| FLIP | `iBt` | 155363–155414 | 128321–128355 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| FLIP | `nBt` | 155363–155414 | 128321–128355 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| FLIP | `oBt` | 155363–155414 | 128321–128355 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| FLIP | `rBt` | 155363–155414 | 128321–128355 | Sidebar.tsx | styles-CdEGpc2x.js |  |
| GroupedTasksSection | `sBt` | 155455 | 128357 | Sidebar.tsx | styles-CdEGpc2x.js | （dnd-kit）；sBt→GroupedTasksSection 155455/128357 |
| STICKY_HEADER_EXIT_DELAY_MS | `cBt` | 156221 | 128900 | Sidebar.tsx | styles-CdEGpc2x.js | = 150；cBt→STICKY_HEADER_EXIT_DELAY_MS 156221/128900 |
| StickyHeaderSlot | `lBt` | 156222 | 128901 | Sidebar.tsx | styles-CdEGpc2x.js | （150ms 淡出）；lBt→StickyHeaderSlot 156222/128901 |
| 光束 CSS 生成器 | `DBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| 光束 CSS 生成器 | `EBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| 光束 CSS 生成器 | `OBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| 光束 CSS 生成器 | `TBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| 光束 CSS 生成器 | `kBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| 光束 CSS 生成器 | `wBt` | 156793–157547 | 130373–131106 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级） |
| BeamBorderAnimation | `ABt` | 157550 | 131107 | Sidebar.tsx | styles-CdEGpc2x.js | （接口级）；ABt→BeamBorderAnimation★ 157550/131107 |
| WorkspaceTaskList | `MBt` | 157550 | — | Sidebar.tsx | styles-CdEGpc2x.js | （重命名/置顶/归档/未读接线）(157550 块内 / 131192)；MBt→WorkspaceTaskList 157550块/131192 |
| autoScrollToBottom | `NBt/PBt` | 158017 | 158020 | Sidebar.tsx | styles-CdEGpc2x.js | NBt/PBt→autoScrollToBottom★ 158017/158020 |
| RemoteConnectionLogsPopover | `FBt` | 158029 | 131404 | Sidebar.tsx | styles-CdEGpc2x.js | FBt→RemoteConnectionLogsPopover 158029/131404 |
| EMPTY_PINNED_TASKS | `IBt` | 158132 | 131438 | Sidebar.tsx | styles-CdEGpc2x.js | LBt → isUserHomeDirectory；IBt→EMPTY_PINNED_TASKS 158132 |
| isUserHomeDirectory | `LBt` | 158133 | 131439 | Sidebar.tsx | styles-CdEGpc2x.js | LBt→isUserHomeDirectory 158133/131439 |
| resolveSshConnectionInfo | `zBt` | 158140 | 131446 | Sidebar.tsx | styles-CdEGpc2x.js | R2 → workspaceTabKey；zBt→resolveSshConnectionInfo★ 158140/131446 |
| WorkspaceSidebarItem | `BBt` | 158149 | 131453 | Sidebar.tsx | styles-CdEGpc2x.js | （折叠/光束动画/更多菜单/重连/文件树/新线程）；工作区行：BBt→WorkspaceSidebarItem 158149/131453 |
| restrictDragToVerticalAxis | `VBt` | 158883 | 131861 | Sidebar.tsx | styles-CdEGpc2x.js | （锁 x=0、钳制 y）；VBt→restrictDragToVerticalAxis 158883/131861 |
| SortableWorkspaceSidebarItem | `HBt` | 158893 | 131883 | Sidebar.tsx | styles-CdEGpc2x.js | HBt→SortableWorkspaceSidebarItem 158893/131883 |
| resolveExpandToggleState | `UBt` | 158967 | 131938 | Sidebar.tsx | styles-CdEGpc2x.js | / expandToggleMessageId (158970/158967 / 131941/131938)；UBt→expandToggleMessageId 158967/1 |
| resolveExpandToggleState | `WBt` | 158970 | 131941 | Sidebar.tsx | styles-CdEGpc2x.js | / expandToggleMessageId (158970/158967 / 131941/131938)；WBt→resolveExpandToggleState 15897 |
| PurposeSection | `GBt` | 158981 | 131948 | Sidebar.tsx | styles-CdEGpc2x.js | /会话分段壳（折叠 + 拖拽重排 + 动作区）；GBt→PurposeSection 158981/131948 |
| isWorkspaceExpandedDuringDrag | `XBt` | 159097 | 132035 | Sidebar.tsx | styles-CdEGpc2x.js | XBt→isWorkspaceExpandedDuringDrag 159097/132035 |
| resolveWorkspaceTabReorder | `ZBt` | 159100 | 132041 | Sidebar.tsx | styles-CdEGpc2x.js | ZBt→resolveWorkspaceTabReorder 159100/132041 |
| DisabledReasonWrapper | `QBt` | 159109 | 132053 | Sidebar.tsx | styles-CdEGpc2x.js | tooltip 包裹；QBt→DisabledReasonWrapper 159109/132053 |
| EMPTY_TASK_ITEMS | `$Bt` | 159112 | 132057 | Sidebar.tsx | styles-CdEGpc2x.js | /EMPTY_REMOTE_LOGS 159112/132057 |
| EMPTY_REMOTE_LOGS | `eVt` | 159112 | 132057 | Sidebar.tsx | styles-CdEGpc2x.js | /EMPTY_REMOTE_LOGS 159112/132057 |
| WorkspaceTabDragOverlay | `tVt` | 159114 | 132061 | Sidebar.tsx | styles-CdEGpc2x.js | tVt→WorkspaceTabDragOverlay 159114/132061 |
| resolveTaskViewMode | `nVt` | 159128 | 132072 | Sidebar.tsx | styles-CdEGpc2x.js | archived/timeline/grouped/workspace；nVt→resolveTaskViewMode 159128/132072 |
| WorkspaceSidebar | `rVt` | 159137 | 132075 | Sidebar.tsx | styles-CdEGpc2x.js | （aside h-full flex-col：h-12 drag 条 + 导航 4 行；骨架：rVt→WorkspaceSidebar 159137/132075 |
| 项目列表拖拽位移助手 | `JBt` |  132008 | 131993 | Sidebar.tsx | styles-CdEGpc2x.js | (159081/159062–159080 / 132008/131993–132007) |
| 项目列表拖拽位移助手 | `KBt` |  132008 | 131993 | Sidebar.tsx | styles-CdEGpc2x.js | (159081/159062–159080 / 132008/131993–132007) |
| workspaceListDragTransition | `YBt` |  132008 | 131993 | Sidebar.tsx | styles-CdEGpc2x.js | (159081/159062–159080 / 132008/131993–132007)；YBt→workspaceListDragTransition 159081/13200 |
| 项目列表拖拽位移助手 | `qBt` |  132008 | 131993 | Sidebar.tsx | styles-CdEGpc2x.js | (159081/159062–159080 / 132008/131993–132007) |
| RemoteSyncingRow | `h8` |  146803 | 146813 | Sidebar.tsx | styles-CdEGpc2x.js | / TaskListLoadingRow (146803/146813 / 122299/122307)；/TaskListLoadingRow 146803/146813 / 1 |
| RemoteSyncingRow | `m8` |  146803 | 146813 | Sidebar.tsx | styles-CdEGpc2x.js | / TaskListLoadingRow (146803/146813 / 122299/122307)；/TaskListLoadingRow 146803/146813 / 1 |
| GroupedTaskRowSlot | `N8` |  154042 | 154092 | Sidebar.tsx | styles-CdEGpc2x.js | (154042/154092 / 127354/127401) |
| GroupedTaskRowSlot | `gzt` |  154042 | 154092 | Sidebar.tsx | styles-CdEGpc2x.js | (154042/154092 / 127354/127401) |
| canOpenRemoteSessionSourceCheck | `$2` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| GROUP_COLOR_SURFACE_CLASSES | `$Ft` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | / GROUP_COLOR_BORDER_CLASSES (144873/144881 / 120649/120658) |
| formatRelativeTime | `$S` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useSessionRouterStore | `A2` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 工作区 logo 色板/光束参数 | `B8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （数据，接口级）(156306/128919 / 128990/128919) |
| useTaskFileActions | `C6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| compareTasksForList | `Fo` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| DEFAULT_GROUP_ID_CRON | `Gne` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | /OFF_PEAK（src chunk tt/nt，8724/8725） |
| workspaceBaseName | `Go` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| workspaceKey | `Io` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useScopedWorkspaceTabs | `J3` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `J6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `JFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| taskEntityKey | `Lo` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| taskSessionActivity | `Mo` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| taskPendingAttention | `No` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| mergeTaskWithActivity | `Po` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `Q6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 按用途拆分工作区标签 | `QFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (144863/144866 / 120636/120638) |
| resolveTaskIndicator | `QS` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| sshDecoratedProjectName | `QTt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| forgetRecentWorkspaces | `Qie` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| resolveServicesByWorkspaceIdentity | `Tse` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| applyOptimisticTaskMutation | `Uo` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （TopBar 已还原） |
| 工作区 logo 色板/光束参数 | `V8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （数据，接口级）(156306/128919 / 128990/128919) |
| titleWithChangeStats | `Vhe` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useSearchResultsStore | `Vo` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `X6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `XFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `Y6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `YFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `Z6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 按用途拆分工作区标签 | `ZFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (144863/144866 / 120636/120638) |
| useTaskListItems | `ZS` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useSessionRegistryStore | `Zs` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 视图不可变操作 144909–144980 | `a8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| DEFAULT_GROUP_ID_CRON | `ane` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | /OFF_PEAK（src chunk tt/nt，8724/8725） |
| markUsageEntryIntent | `aw` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用户名/显示名/首字母 | `bRt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (150426/150429/150432 / 124670–124676) |
| 视图不可变操作 144909–144980 | `cIt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| WebRemoteControlTrigger | `cRt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (150140/150159 / 124420/124436) |
| GroupColorDot | `e8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | / GroupColorSwatch (144897/144903 / 120673/120679) |
| dropAnimation | `eBt/tBt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | /autoScroll★ 155361 |
| GROUP_COLOR_SURFACE_CLASSES | `eIt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | / GROUP_COLOR_BORDER_CLASSES (144873/144881 / 120649/120658) |
| getWorkspaceSlice | `fe` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| Tabs | `hC/gC/_C` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | 原语 36949 |
| 视图不可变操作 144909–144980 | `i8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| TaskRenameDialog | `j6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useSettingsStore | `ko` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 视图不可变操作 144909–144980 | `lIt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| WebRemoteControlTrigger | `lRt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (150140/150159 / 124420/124436) |
| useTrajectoryViewerStore | `ls` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| WebRemoteTaskListSection | `mLt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | ★(F17) 147286 |
| GroupedTaskRow | `mzt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （拖拽 + 悬停动作）(153636/154014 / 127081/127331) |
| RemoteSyncMenuItems | `n4` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 视图不可变操作 144909–144980 | `o8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| TaskActionMenuItems | `oFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| isCronTask | `pi/Yr` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | /isOffPeakTask（src chunk fx/px） |
| GroupedTaskRow | `pzt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （拖拽 + 悬停动作）(153636/154014 / 127081/127331) |
| 分段偏好 zcode-sidebar-purpose-section-preferences | `qFt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| RemoteSyncDialogs | `r4` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 视图不可变操作 144909–144980 | `r8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| 视图不可变操作 144909–144980 | `s8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| 视图不可变操作 144909–144980 | `sIt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| GroupColorDot | `t8` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | / GroupColorSwatch (144897/144903 / 120673/120679) |
| useVirtualizer | `to` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （esm-BY6T6pIH.js） |
| 工作区 logo 色板/光束参数 | `uBt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （数据，接口级）(156306/128919 / 128990/128919) |
| 视图不可变操作 144909–144980 | `uIt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | （c8…TIt 144998–145136 同族） |
| taskChangeSummary | `vg` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| buildTaskFeedbackDescription | `w6` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用户名/显示名/首字母 | `xRt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (150426/150429/150432 / 124670–124676) |
| useTaskStore | `xe` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| trackEvent | `xw` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| useFeedbackStore | `yC` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |
| 用户名/显示名/首字母 | `yRt` | — | — | Sidebar.tsx | styles-CdEGpc2x.js | (150426/150429/150432 / 124670–124676) |
| buildWorkspaceServicesMap | `yc` | — | — | Sidebar.tsx | styles-CdEGpc2x.js |  |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标工厂 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`P`/`A`/`M` | 平台服务 / toast / Input / IME 守卫 / spinner | ImeComposition.tsx |
| `Ia`/`Na/Oa/Ma/ka` | Tooltip / Popover 四件 | usageStatsUiParts-CiR7YEhh.js（外部） |
| `$i` | shortcutLabel | keyboardShortcuts-BGHopxr9.js（外部） |
| `Ae`/`xe`/`Ne`/`fe…` | zustand / 任务 store / 工作区选择器群 | skillStore-BmeKHDBI.js（外部） |
| `E6`/`k6` | 置顶/工作区任务列表 store | stores-tasks.tsx（本目录） |
| `j6`/`oFt`/`C6`/`w6`/`Uo`/`n4`/`r4`/`$2`/`QTt` | 任务重命名/菜单项/文件动作/远程同步 | TopBar.tsx / Modals.tsx（已抽取） |
| `yC`/`ls` | 反馈 / 轨迹 store | stores-core.tsx / stores-session.tsx |
| `to` | useVirtualizer | esm-BY6T6pIH.js（外部，@tanstack/react-virtual） |
| `hC/gC/_C`、`yk…Ck`、`kZ/AZ/jZ`、`uJ`、`hLt…` | Tabs / ContextMenu / Collapsible / Badge / Avatar 原语 | styles 本 chunk 横切层（36949 / 43966 / 82939 / 70704 / 147698） |
| dnd-kit | 拖拽引擎 | styles 本 chunk 91811–94695（vendored，接口挂接） |
| testid×23 | sidebar/task/workspace 系 | src-HCld2afU.js（外部） |

## 3. Home

- 族登记：F02 HomeFamily（= R0 的 draft 形态）
- 产物：Home.tsx / Home.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| mentionTriggerChar | `mC` | 36348 | 33369 | Home.tsx | styles-CdEGpc2x.js | （commands→`>`、conversations→`#`、files→`@`） |
| OFFICIAL_SKILL_PLUGINS | `Dqe` | 63845 | 56970 | Home.tsx | styles-CdEGpc2x.js | Set |
| SuggestionPanel | `SV` | 64639 | 57678 | Home.tsx | styles-CdEGpc2x.js | （虚拟滚动面板） |
| applyExternalTextInsertRequest | `dit` | 90132 | 78112 | Home.tsx | styles-CdEGpc2x.js |  |
| applyComposerRestoreRequest | `fit` | 90150 | 78122 | Home.tsx | styles-CdEGpc2x.js |  |
| areStringArraysEqual | `pit` | 90176 | 78136 | Home.tsx | styles-CdEGpc2x.js |  |
| formatLineCount | `mit` | 90178 | 78139 | Home.tsx | styles-CdEGpc2x.js |  |
| DraftComposerRegion | `hit` | 90180–91174 | 78144 | Home.tsx | styles-CdEGpc2x.js |  |
| DraftComposerRegionMemo | `git` | 91174 | 78829 | Home.tsx | styles-CdEGpc2x.js | = memo(hit) |
| isEventInsideDialog | `_it` | 91176 | 78830 | Home.tsx | styles-CdEGpc2x.js | （R0 Escape 守卫用） |
| GREETING_HOUR_BOUNDARIES | `vit` | 91182 | 78837 | Home.tsx | styles-CdEGpc2x.js | [5,9,12,14,18,23] |
| GREETING_MIN_FONT_SIZE_PX | `gX` | 91183 | 78838 | Home.tsx | styles-CdEGpc2x.js | = 20 |
| GREETING_MAX_FONT_SIZE_PX | `_X` | 91184 | 78839 | Home.tsx | styles-CdEGpc2x.js | = 30 |
| resolveGreetingI18nId | `yit` | 91185 | 78840 | Home.tsx | styles-CdEGpc2x.js | 6 档选 key |
| msUntilNextGreetingBoundary | `bit` | 91202 | 78844 | Home.tsx | styles-CdEGpc2x.js |  |
| fitGreetingFontSize | `xit` | 91212 | 78854 | Home.tsx | styles-CdEGpc2x.js | 20–30px 自适应 |
| GreetingHero | `Sit` | 91219 | 78861 | Home.tsx | styles-CdEGpc2x.js | +品牌线框底图 |
| HomeHeroLogo | `Cit` | 91322 | 78922 | Home.tsx | styles-CdEGpc2x.js | SVG |
| useOffPeakTaskStore | `bX` | 91368 | 78945 | Home.tsx | styles-CdEGpc2x.js | （zustand） |
| OFF_PEAK_HOME_TEMPLATES | `Oit` | 91590 | 79215 | Home.tsx | styles-CdEGpc2x.js | [standupGitSummary, ciFlakyReport, customize] |
| OffPeakNewTaskBanner | `kit` | 91591 | 79222 | Home.tsx | styles-CdEGpc2x.js | （📢 横幅 + 3 张建议卡） |
| resolveHomePathPrefix | `mOt` | 128526 | 108386 | Home.tsx | styles-CdEGpc2x.js |  |
| homeAwareDisplayName | `hOt` | 128533 | 108389 | Home.tsx | styles-CdEGpc2x.js |  |
| workspaceMenuLabel | `gOt` | 128538 | 108393 | Home.tsx | styles-CdEGpc2x.js |  |
| workspaceTriggerLabel | `_Ot` | 128542 | 108397 | Home.tsx | styles-CdEGpc2x.js |  |
| isSameWorkspaceTab | `vOt` | 128546 | 108401 | Home.tsx | styles-CdEGpc2x.js |  |
| remoteTabSearchHaystack | `yOt` | 128549 | 108404 | Home.tsx | styles-CdEGpc2x.js |  |
| filterWorkspaceTabsForMenu | `bOt` | 128554 | 108407 | Home.tsx | styles-CdEGpc2x.js | （搜索、前 5 条） |
| WorkspaceSelectionRow | `a4` | 128568–128776 | 108415 | Home.tsx | styles-CdEGpc2x.js |  |
| skills | `$` | — | — | Home.tsx | styles-CdEGpc2x.js | Lexical 接线（段数据钩子 AJe/WJe/HJe/PJe/Nqe） |
| resolveOffPeakErrorI18nId | `Dit` | — | — | Home.tsx | styles-CdEGpc2x.js | (91358 / —) |
| isQuota3103Error | `Eit` | — | — | Home.tsx | styles-CdEGpc2x.js | (91355 / —) |
| MENTION_TOKEN_PREFIX_REGEX | `Fqe` | — | — | Home.tsx | styles-CdEGpc2x.js | (64025 / —) |
| normalizeCnyTrigger | `Iqe` | — | — | Home.tsx | styles-CdEGpc2x.js | （¥/￥ → $）              (64026 / —) |
| isRemoteWorkspaceTab | `N2` | — | — | Home.tsx | styles-CdEGpc2x.js | (123199 / —) |
| MENTION_TRIGGER_REGEX | `Pqe` | — | — | Home.tsx | styles-CdEGpc2x.js | /(^ |
| isCodingPlanConnectionSelected | `Tit` | — | — | Home.tsx | styles-CdEGpc2x.js | (91348 / —) |
| useRemoteWorkspaceEnabled | `UTt` | — | — | Home.tsx | styles-CdEGpc2x.js | （恒 true）         (123177 / —) |
| SuggestionSectionHeaderRow | `_Je` | — | — | Home.tsx | styles-CdEGpc2x.js | (64776 / —) |
| curatedSkillDescription | `jqe` | — | — | Home.tsx | styles-CdEGpc2x.js | (63975 / —) |
| CURATED_SKILL_DESCRIPTIONS | `kqe` | — | — | Home.tsx | styles-CdEGpc2x.js | （zh-CN/en-US）    (63868 / —) |
| = fOt RemoteWizardDialog | `pOt` | — | — | Home.tsx | styles-CdEGpc2x.js | （F10，接口保留）    (128525 / —) |
| parseMentionTrigger | `tV` | — | — | Home.tsx | styles-CdEGpc2x.js | (64061 / —) |
| SuggestionStatusRow | `vJe` | — | — | Home.tsx | styles-CdEGpc2x.js | （loading/error/empty）   (64785 / —) |
| toErrorMessage | `vX` | — | — | Home.tsx | styles-CdEGpc2x.js | (91337 / 78937 附近) |
| hasCodingPlanProviderEntry | `wit` | — | — | Home.tsx | styles-CdEGpc2x.js | (91340 / —) |
| SuggestionOptionRow | `yJe` | — | — | Home.tsx | styles-CdEGpc2x.js | (64813 / —) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `m`/`p`/`g`/`l` | toast / info / close 图标 / 平台服务 | ImeComposition.tsx |
| `Ia`/`Na/Oa/Ma/ka` | Tooltip / Popover | usageStatsUiParts-CiR7YEhh.js（外部） |
| `Ae`/`xe` | zustand / useTaskStore（draftFocusVersion） | skillStore-BmeKHDBI.js（外部） |
| `to` | useVirtualizer（SV 面板） | esm-BY6T6pIH.js（外部） |
| `bX` | OffPeakTaskStore | stores-tasks.tsx（随本族抽取进 Home.tsx） |
| `zZ` | GitBranchChip（contextHeader 右件） | TopBar.tsx |
| `R0` | ConversationPane（draft 装配现场） | Conversation.tsx |
| `yJt` | WorkspaceShell（contextHeader 组装 184540–184577） | WorkspaceShell.tsx |
| `ZV`/`KJe`/`SJe`/`ait`/`Zrt` | Composer 族（接口保留，B4 队列） | F08 未抽取（行号见 Home.tsx §6） |
| `fOt` | RemoteWizardDialog（接口保留） | F10 未抽取（B4 队列） |

## 4. Conversation

- 族登记：F03 ConversationFamily
- 产物：Conversation.tsx + ConversationOverlays.tsx / Conversation.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| QueueItemRow | `lst` | 94573 | 82753 | Conversation.tsx | styles-CdEGpc2x.js |  |
| SwitchModeHint | `Hpt` | 106405 | 91360 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| isSwitchModePermissionRequest | `Xpt` | 106604 | 91469 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| resolveToolCallView | `Wht` | 109066 | 93141 | Conversation.tsx | styles-CdEGpc2x.js | （16 种工具视图分派） |
| FileRewindDialog | `b_t` | 110632 | 94590 | Conversation.tsx | styles-CdEGpc2x.js |  |
| TurnFileChangesSummary | `S_t` | 110813 | 94679 | Conversation.tsx | styles-CdEGpc2x.js | （chat.changeSummary.*） |
| UserInputCollapsibleText | `G_t` | 111579 | 95219 | Conversation.tsx | styles-CdEGpc2x.js |  |
| UserQueryRow | `pvt` | 112010 | 95596 | Conversation.tsx | styles-CdEGpc2x.js | （编辑/回退文件） |
| AssistantMessageActions | `mvt` | 112234 | 95726 | Conversation.tsx | styles-CdEGpc2x.js | （复制/赞踩/fork/时间） |
| AssistantMessageRow | `hvt` | 112357 | 95832 | Conversation.tsx | styles-CdEGpc2x.js |  |
| UnitSizeCache | `Lyt` | 113965 | 97112 | Conversation.tsx | styles-CdEGpc2x.js |  |
| ScrollToBottomButton | `Fbt` | 114596 | 97637 | Conversation.tsx | styles-CdEGpc2x.js |  |
| InteractionOriginBadge | `nxt` | 115916 | 98675 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useAutoResolutionCountdown | `axt` | 115945 | 98713 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| mapElicitationKeyDown | `oxt` | 115972 | 98730 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| normalizeElicitationQuestions | `sxt` | 115985 | 98733 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| buildInitialAnswerDrafts | `uxt` | 116016 | 98762 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| resolveInitialQuestionIndex | `dxt` | 116027 | 98774 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| optionFocusSlotCount | `fxt` | 116032 | 98779 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| focusIndexForQuestion | `pxt` | 116035 | 98782 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| collectQuestionAnswers | `Y1` | 116045 | 98792 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| buildElicitationAnswerPayload | `mxt` | 116050 | 98800 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| applyAnswerSelection | `hxt` | 116070 | 98818 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| advanceKindForQuestion | `X1` | 116082 | 98835 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| ElicitationDialogKeyed | `gxt` | 116085 | 98838 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| ElicitationDialog | `_xt` | 116088 | 98841 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| PERMISSION_OPTION_KIND_SYNONYMS | `vxt` | 116704 | 99162 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| normalizeOptionKindText | `yxt` | 116711 | 99169 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| classifyPermissionOptionKind | `Z1` | 116714 | 99172 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| isCustomPermissionOption | `bxt` | 116729 | 99179 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| permissionOptionSortRank | `xxt` | 116735 | 99185 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| sortPermissionOptions | `Sxt` | 116749 | 99199 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| PERMISSION_TOOL_ICON | `Cxt` | 116758 | 99210 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| SCOPE_DISPLAY_MAX_LEN | `Txt` | 116762 | 99211 | ConversationOverlays.tsx | styles-CdEGpc2x.js | / 通用理由集 |
| SCOPE_DISPLAY_MAX_LEN | `wxt` | 116762 | 99211 | ConversationOverlays.tsx | styles-CdEGpc2x.js | / 通用理由集 |
| truncateScopeDisplay | `Ext` | 116764 | 99213 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| extractBashAllowScopes | `Dxt` | 116770 | 99222 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| PermissionRuleScopes | `Oxt` | 116781 | 99231 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| permissionOptionLabelId | `kxt` | 116802 | 99236 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| permissionOptionDescriptionId | `Nxt` | 116828 | 99266 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| resolvePermissionRequestReason | `Pxt` | 116849 | 99287 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| resolveMcpToolName | `Fxt` | 116855 | 99293 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| resolveRawReason | `Ixt` | 116860 | 99298 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| classifyPermissionToolView | `Lxt` | 116863 | 99301 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| permissionToolViewToggle | `Rxt` | 116876 | 99306 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| toPermissionToolCall | `zxt` | 116888 | 99324 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| buildPermissionToolViewProps | `Bxt` | 116899 | 99335 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| McpPermissionRow | `Vxt` | 116929 | 99373 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| PermissionApprovalOverlay | `Hxt` | 116960 | 99392 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceInteractionToasts | `eSt` | 117283 | 99619 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useSnapshotInteractionToasts | `tSt` | 117346 | 99703 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| PERMISSION_RULE_FIELDS | `rSt` | 117400 | 99762 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| buildOptionResponse | `iSt` | 117401 | 99763 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| toPermissionRequest | `aSt` | 117419 | 99788 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| toGenericInteractionModel | `oSt` | 117440 | 99816 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| toElicitationRequest | `sSt` | 117449 | 99825 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| GenericInteractionDialog | `cSt` | 117469 | 99855 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| createSnoozeLedger | `fSt` | 117536 | 99884 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| ConversationInteractionsOverlay | `pSt` | 117551 | 99899 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| ALIYUN_CAPTCHA_SCRIPT_URL | `mSt` | 117706 | 100034 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| AliyunCaptchaWidget | `ASt` | 117919 | 100205 | ConversationOverlays.tsx | styles-CdEGpc2x.js | （接口级） |
| isCaptchaProvider | `b0` | 118292 | 100548 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| consumeRecoveredCaptchaHeader | `aCt` | 118327 | 100582 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useCaptchaRecovery | `dCt` | 118412 | 100659 | ConversationOverlays.tsx | styles-CdEGpc2x.js | （接口级） |
| runtimeHeadersRequestKey | `hCt` | 118512 | 100763 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| RuntimeAuthHeadersController | `vCt` | 118608 | 100853 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| parseFaultKey | `CCt` | 118643 | 100895 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useSessionSubscriptionErrorReporter | `wCt` | 118647 | 100899 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| useSessionSnapshot | `k0` | 118675 | 100929 | Conversation.tsx | styles-CdEGpc2x.js |  |
| ConversationPane | `R0` | 119219 | 101388 | Conversation.tsx | styles-CdEGpc2x.js |  |
| ConversationOrchestrator | `PTt` | 122803 | 104572 | Conversation.tsx | styles-CdEGpc2x.js |  |
| SessionQuotaBanner | `gst` | — | 82888 | Conversation.tsx | styles-CdEGpc2x.js |  |
| PendingCommandBanner | `_st` | — | 82927 | Conversation.tsx | styles-CdEGpc2x.js |  |
| useConversationFind | `vbt` | — | 97388 | Conversation.tsx | styles-CdEGpc2x.js | （CSS Custom Highlight API） |
| ConversationSelectionTooltip | `Tbt` | — | 97517 | Conversation.tsx | styles-CdEGpc2x.js | （引用选择动作） |
| ALIYUN_CAPTCHA_CONTAINER_ID | `CSt` | — | 100132 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| CAPTCHA_VERIFY_PARAM_HEADER | `FSt` | — | 100474 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| CAPTCHA_SESSION_STORAGE_KEY | `RSt` | — | 100485 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| CAPTCHA_VERIFY_FAILED | `XSt` | — | 100551 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| 订阅错误面/缺省 fault 键/正则 | `SCt` | — | 100891–100894 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| 订阅错误面/缺省 fault 键/正则 | `bCt` | — | 100891–100894 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| 订阅错误面/缺省 fault 键/正则 | `xCt` | — | 100891–100894 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| 订阅错误面/缺省 fault 键/正则 | `yCt` | — | 100891–100894 | ConversationOverlays.tsx | styles-CdEGpc2x.js |  |
| trimToNull | `$1` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | / visibleReasonText  (116842,116845 / 99280,99283) |
| /goal /compact 命令解析 | `$_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111673 / 95273,95315,95317) |
| 预览卡 | `A_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （网站/文件）  (111193,111233,111161 / 94925,94950,94877) |
| PaneFloatingHeader | `Ait` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (91755,91801 / 79344,79371) |
| 供应商选项文案映射/解析 | `Axt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (116816,116824 / 99250,99262) |
| Reasoning | `B_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （思考/摘要）(111329,111405,111471 / 95033…) |
| 轮体/后台结果轮/工作段/段头 | `Bvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112998,113089,112924,112890) |
| RowRenderer | `Dvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112666,112711,112712 / 96043,96098,96099) |
| RowRenderer | `Evt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112666,112711,112712 / 96043,96098,96099) |
| buildRenderUnits | `Fyt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /splitVirtualizedUnits (113940,113620 / 97087,96770) |
| ToolCallBlock | `Ght` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (109241,109105 / 93274,93180) |
| 工具状态/错误/显示模型 | `Glt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (99513,99542,99696,99593) |
| TurnSection | `Hvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (113156,113295 / 96423,96489) |
| 轮体/后台结果轮/工作段/段头 | `Ivt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112998,113089,112924,112890) |
| 自动结束心跳 60s / plan 审批值 approve | `J1` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (115930,115931 / 98698,98699) |
| ToolCallBlock | `K$` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (109241,109105 / 93274,93180) |
| 轮体/后台结果轮/工作段/段头 | `Lvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112998,113089,112924,112890) |
| 供应商选项文案映射/解析 | `Mxt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (116816,116824 / 99250,99262) |
| 预览卡 | `O_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （网站/文件）  (111193,111233,111161 / 94925,94950,94877) |
| trimToNull | `Q1` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | / visibleReasonText  (116842,116845 / 99280,99283) |
| ConversationMessageList | `Rbt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (114627,115525 / 97662,98313) |
| 轮体/后台结果轮/工作段/段头 | `Rvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112998,113089,112924,112890) |
| PluginIconProvider | `Ubt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /Gate (115538,115559 / 98326,98347) |
| Reasoning | `V_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （思考/摘要）(111329,111405,111471 / 95033…) |
| buildPermissionRequestModel | `Vte` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | （src-HCld2afU.js 的 l 导出，跨 chunk） |
| TurnSection | `Vvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (113156,113295 / 96423,96489) |
| PluginIconProvider | `Wbt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /Gate (115538,115559 / 98326,98347) |
| 工具状态/错误/显示模型 | `Wlt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (99513,99542,99696,99593) |
| /goal /compact 命令解析 | `Z_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111673 / 95273,95315,95317) |
| coalescedRuntimeHeadersResponse | `_Ct` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (118572 / 100800 附近) |
| ToolLayout | `aut` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /摘要件 (100151,100095,100122,100000) |
| buildRenderUnits | `ayt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /splitVirtualizedUnits (113940,113620 / 97087,96770) |
| RowRenderer | `b1` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (112666,112711,112712 / 96043,96098,96099) |
| ToolLayout | `cut` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /摘要件 (100151,100095,100122,100000) |
| isPlainObject | `cxt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | / isPlanApprovalRequest (116009,116012 / 98755,98758) |
| 快照定位/请求覆盖/草稿键 | `dSt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (117527,117530,117533 / 99875,99878,99881) |
| QueuePanel | `dst` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （dnd-kit 排序）(94801,94696 / 82869,82817) |
| refreshCaptchaRuntimeHeaders | `fCt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (118429 / 100618 附近) |
| respondProviderRuntimeHeadersOnce | `gCt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (118519 / 100766 附近) |
| ReasoningRow | `gvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | _vt → TurnHeaderRow  Cvt → TimelineMarkerView |
| 倒计时解析/下次心跳延迟 | `ixt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (115932,115937 / 98700,98705) |
| TurnNavigator | `iyt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （左侧轮刻度条）(113443,113619 / 96660,96769) |
| PaneFloatingHeader | `jit` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (91755,91801 / 79344,79371) |
| 供应商选项文案映射/解析 | `jxt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (116816,116824 / 99250,99262) |
| 预览卡 | `k_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （网站/文件）  (111193,111233,111161 / 94925,94950,94877) |
| ToolLayout | `lQ` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (100416,100214 / 86604,86470) |
| 快照定位/请求覆盖/草稿键 | `lSt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (117527,117530,117533 / 99875,99878,99881) |
| ToolLayout | `lut` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /摘要件 (100151,100095,100122,100000) |
| isPlainObject | `lxt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | / isPlanApprovalRequest (116009,116012 / 98755,98758) |
| /goal /compact 命令解析 | `m1` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111673 / 95273,95315,95317) |
| snoozeInteractionAutoResolution | `nSt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (117366 / 99705 附近) |
| 用户输入富文本/提及部件 | `nvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111783,111712,111769) |
| PermissionApprovalOverlay | `permission` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | ； |
| ToolLayout | `put` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (100416,100214 / 86604,86470) |
| 自动结束心跳 60s / plan 审批值 approve | `q1` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (115930,115931 / 98698,98699) |
| 工具状态/错误/显示模型 | `rQ` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (99513,99542,99696,99593) |
| 用户输入富文本/提及部件 | `rvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111783,111712,111769) |
| 倒计时解析/下次心跳延迟 | `rxt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (115932,115937 / 98700,98705) |
| TurnNavigator | `ryt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （左侧轮刻度条）(113443,113619 / 96660,96769) |
| ToolLayout | `sut` | — | — | Conversation.tsx | styles-CdEGpc2x.js | /摘要件 (100151,100095,100122,100000) |
| 纯工作行 + 重试槽；否则按工作段渲染 | `timelineOnly` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （单段合并默认展开态）， |
| 用户输入富文本/提及部件 | `tvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (111783,111712,111769) |
| 快照定位/请求覆盖/草稿键 | `uSt` | — | — | ConversationOverlays.tsx | styles-CdEGpc2x.js | (117527,117530,117533 / 99875,99878,99881) |
| QueuePanel | `ust` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （dnd-kit 排序）(94801,94696 / 82869,82817) |
| ToolCallRow | `wvt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | Tvt → SubagentRow    jvt → AgentToolCallRow |
| Reasoning | `z_t` | — | — | Conversation.tsx | styles-CdEGpc2x.js | （思考/摘要）(111329,111405,111471 / 95033…) |
| ConversationMessageList | `zbt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (114627,115525 / 97662,98313) |
| 工具状态/错误/显示模型 | `zlt` | — | — | Conversation.tsx | styles-CdEGpc2x.js | (99513,99542,99696,99593) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `io` | ReactDOM createPortal（选区浮层） | react-dom-BlRPXJso.js（外部） |
| `Z`/`X`/`wa`/`Ea` | cn / Button / chevron 图标 | UtilsCn.tsx / button.tsx |
| `G` | useZCodeIntl | **I18n.tsx** |
| `m`/`P`/`M`/`A`/`l` | toast / Input / spinner / IME 守卫 / 平台服务 | ImeComposition.tsx |
| `Ia`/`Na/Oa/Ma/ka` | Tooltip / Popover | usageStatsUiParts-CiR7YEhh.js（外部） |
| `J` | logger | logger.tsx |
| `xe`/`Ae`/`te`/`W`/`Le` | useTaskStore / create / 任务作用域选择器 / 草稿写入 | skillStore-BmeKHDBI.js（外部） |
| `Vte` | buildPermissionRequestViewModel | src-HCld2afU.js（外部，l 导出） |
| `to` | useVirtualizer | esm-BY6T6pIH.js（外部） |
| `fa` | useControllableState（Reasoning 受控态） | dist-DJJArJ7D.js（外部） |
| `cj` | MarkdownRenderer | MarkdownIntegration.tsx |
| `Flt`/`Ilt` | 摘要栏 | TopBar.tsx |
| `hit`/`Sit` | 草稿头 / 问候 hero | Home.tsx |
| `kit` | off-peak 横幅 | Home.tsx（bX/kit 已抽取） |
| `ZV` | ComposerInput（接口，B4） | F08 未抽取 |
| dnd-kit / shiki 核心 | vendored（91811–94695 / 100520–104621） | styles 本 chunk（整体替换，不逐行还原） |

## 5. SidePanel

- 族登记：F04 SidePanelFamily
- 产物：SidePanel.tsx / SidePanel.report.md
- 来源：styles-CdEGpc2x.js（状态层 js 1978–3549）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| isBrowserTabResident | `dae` | 1981 | 1040 | SidePanel.tsx | styles-CdEGpc2x.js | suspended/suspend-pending |
| normalizeSidePaneState | `fae` | 1982 | 1043 | SidePanel.tsx | styles-CdEGpc2x.js | ordinal 补全+activeTabId 修复 |
| hash36 | `Tae` | 2129–2158 | 1210–1229 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| normalizeDecodedSource | `cae` | 2129–2158 | 1210–1229 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| codeViewerSourceKey | `wae` | 2129–2158 | 1210–1229 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| useTrajectoryViewerStore | `ls` | 2610 | 1706 | SidePanel.tsx | styles-CdEGpc2x.js | model-trajectory-open 请求 |
| useTrajectoryOpenRequests | `goe` | 2619 | 1713 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| nextTerminalTabTitle | `zoe` | 2803 | 1910 | SidePanel.tsx | styles-CdEGpc2x.js | Terminal/Terminal 2… |
| useSidePaneState | `Boe` | 2816 | 1919 | SidePanel.tsx | styles-CdEGpc2x.js | （30+ handle*） |
| useGlobalShortcuts | `rge` | 24021 | 20683 | SidePanel.tsx | styles-CdEGpc2x.js | Ctrl+Alt+B = toggleSidePane |
| QUICK_PICK_SECTION_ORDER | `D_e` | 25394 | 22073 | SidePanel.tsx | styles-CdEGpc2x.js | = [suggested,chat,navigation,panels,configure,app] |
| buildQuickPickCommands | `O_e` | 25395 | 22074 | SidePanel.tsx | styles-CdEGpc2x.js | panels 段 6 命令 |
| BrowserFaviconImage | `bKt` | 181256 | 146415 | SidePanel.tsx | styles-CdEGpc2x.js | favicon img（加载失败回退 globe） |
| BrowserTabFavicon | `xKt` | 181269 | 146423 | SidePanel.tsx | styles-CdEGpc2x.js | favicon 或 globe |
| BrowserUseTabIndicator | `SKt` | 181272 | 146432 | SidePanel.tsx | styles-CdEGpc2x.js | browser-use 操作中呼吸指示 |
| TabChipHoverTooltip | `wKt` | 181283 | 146442 | SidePanel.tsx | styles-CdEGpc2x.js | chip 悬停 tooltip（1500ms 延迟） |
| SidePaneTabChip | `TKt` | 181303 | 146452 | SidePanel.tsx | styles-CdEGpc2x.js | chip（sortable+右键关闭菜单） |
| SidePaneTabChipDragOverlay | `EKt` | 181429 | 146517 | SidePanel.tsx | styles-CdEGpc2x.js | chip |
| tabShowsDiffBadge | `DKt` | 181450 | 146524 | SidePanel.tsx | styles-CdEGpc2x.js | code-viewer patch/multi-file-diff 徽章 |
| SidePaneTabIcon | `R5` | 181455 | 146527 | SidePanel.tsx | styles-CdEGpc2x.js | 14 种标签类型的图标分派 |
| resolveSidePaneTabTitle | `V5` | 181533 | 146611 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| sidePaneTabSearchHint | `NKt` | 181562 | 146642 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| resolveTabTitleFromLabels | `PKt` | 181591 | 146645 | SidePanel.tsx | styles-CdEGpc2x.js | labels 解析标题 |
| resolveTabTypeLabel | `FKt` | 181612 | 146662 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| SidePaneTabOverview | `IKt` | 181639 | 146665 | SidePanel.tsx | styles-CdEGpc2x.js | ⌄ 标签总览（cmdk 搜索+最近关闭） |
| SubagentSessionTabContent | `LKt` | 181855 | 146763 | SidePanel.tsx | styles-CdEGpc2x.js | （只读 R0） |
| useSubagentDirectory | `VKt` | 181904 | 146801 | SidePanel.tsx | styles-CdEGpc2x.js | +loadMore |
| SubagentStatusIcon | `WKt` | 182038 | 146954 | SidePanel.tsx | styles-CdEGpc2x.js | running/waiting/success/failed/cancelled/lost |
| SubagentDirectoryItemRow | `GKt` | 182056 | 146983 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| SelectionSideChatTabContent | `JKt` | 182199 | 147056 | SidePanel.tsx | styles-CdEGpc2x.js | （R0 selectionSideChat） |
| isTabBarOverflowing | `tqt` | 182305 | 147135 | SidePanel.tsx | styles-CdEGpc2x.js | 60px 估宽+8px 间隙判定 |
| DEVELOPER_TOOLS_FLAG_KEYS | `nqt` | 182311 | 147145 | SidePanel.tsx | styles-CdEGpc2x.js | = [zcode:developer-tools:enabled, zcode:token-debug:enabled] |
| SuspendedBrowserTabPlaceholder | `pqt` | 182366 | 147193 | SidePanel.tsx | styles-CdEGpc2x.js | browser tab 占位+ack |
| resolveEmptyStateTabOptions | `mqt` | 182389 | 147217 | SidePanel.tsx | styles-CdEGpc2x.js | （最多 5 项，默认 4 项=四宫格） |
| canOpenSelectionSideConversation | `hqt` | 182405 | 147226 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| resolveSidePanePanelSizing | `gqt` | 182408 | 147233 | SidePanel.tsx | styles-CdEGpc2x.js | 240px–65% / mobile overlay 100% |
| shouldRenderHeavyContent | `_qt` | 182425 | 147250 | SidePanel.tsx | styles-CdEGpc2x.js | code-viewer 重渲染门 |
| measureVisibleInlineSize | `vqt` | 182435 | 147260 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| usePanelVisibleInlineSize | `yqt` | 182444 | 147269 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| useResizeSettling | `bqt` | 182489 | 147310 | SidePanel.tsx | styles-CdEGpc2x.js |  |
| SidePanel | `xqt` | 182519 | 147333 | SidePanel.tsx | styles-CdEGpc2x.js | ：标签栏+内容分派+空态 |
| SubagentDirectoryTabContent | `KKt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | /Body 子智能体目录 (182104,182113 / 146995,147012) |
| SessionHeaderRight | `SFt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | （已抽取于 TopBar.tsx；js 143462） |
| 工作区根控制器接线 | `XJt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | (186756,186780–186806) |
| PlanDetailBody | `XKt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | /PlanDetailTabContent 计划详情 markdown (182237,182277 / 147076,147115) |
| PlanDetailBody | `YKt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | /PlanDetailTabContent 计划详情 markdown (182237,182277 / 147076,147115) |
| SubagentDirectoryTabContent | `qKt` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | /Body 子智能体目录 (182104,182113 / 146995,147012) |
| shouldKeepPanelMounted | `uae` | — | — | SidePanel.tsx | styles-CdEGpc2x.js | visible |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`g`/`o`/`M` | 平台服务 / x / mouse-pointer-2 / spinner | ImeComposition.tsx |
| `Na`/`Ia` | TooltipProvider / Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `$i`/`Vre`/`ta`/`Qi`/`Rre` | 快捷键标签与匹配器 | keyboardShortcuts-BGHopxr9.js（外部） |
| `Ae` | zustand create | skillStore-BmeKHDBI.js（外部） |
| `R0` | ConversationPane（辅助对话/子代理会话底座） | Conversation.tsx |
| `cj` | MarkdownRenderer（计划详情） | MarkdownIntegration.tsx |
| `BWt` | GitChangesPanel（审查标签） | GitReview.tsx |
| `FGt`/`AGt`/`tKt`/`mKt`/`l3` | 白板/树图/轨迹/开发工具/Wiki 视图 | ExtendedViews.tsx |
| `bUt` | TerminalPanel | TerminalPane.tsx |
| `_Wt`/`vWt` | BrowserView / BrowserUseView | BrowserPane.tsx |
| `tHt` | CodeViewerPanel | CodeViewer.tsx |
| dnd-kit / cmdk / Tabs / ContextMenu | vendored + 原语（91811–94695 / 26004–26574 / 36949 / 48825） | styles 本 chunk 横切层 |

## 6. QuickPick

- 族登记：F05 QuickPickFamily
- 产物：QuickPick.tsx / QuickPick.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| useSearchResultsStore | `Vo` | 1553–1878 | 569 | QuickPick.tsx | styles-CdEGpc2x.js | store（zustand） |
| selectQueryResult | `Zie` | 1879 | — | QuickPick.tsx | styles-CdEGpc2x.js | queryKey 选择缓存结果 |
| useGlobalQuickPickShortcuts | `rge` | 24015–24078 | 20683 | QuickPick.tsx | styles-CdEGpc2x.js | （⌘K/⌘⇧P/⌘F/⌘B/⌘J/⌘⌥B/⌘[ ]/⌘⇧[ ]） |
| QUICK_PICK_SECTION_ORDER | `D_e` | 25393 | 22073 | QuickPick.tsx | styles-CdEGpc2x.js | suggested/chat/navigation/panels/configure/app |
| buildQuickPickCommands | `O_e` | 25394–25585 | 22074 | QuickPick.tsx | styles-CdEGpc2x.js | （18 条，6 段） |
| 评分常量 | `A_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `Gg` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `Kg` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `M_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `N_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `P_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `j_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 评分常量 | `k_e` | 25586–25595 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 边界字符正则 | `F_e` | 25596–25599 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 边界字符正则 | `I_e` | 25596–25599 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 边界字符正则 | `L_e` | 25596–25599 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| 边界字符正则 | `R_e` | 25596–25599 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| fuzzyScoreRecursive | `qg` | 25600–25622 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| fuzzyNormalize | `z_e` | 25623–25625 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| fuzzyScore | `B_e` | 25626–25631 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| Command | `Yb` | 32092 | 29478 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command） |
| CommandDialog | `tOe` | 32103 | 29490 | QuickPick.tsx | styles-CdEGpc2x.js | （zb Dialog + sr-only 标题） |
| CommandList | `Zb` | 32148 | 29513 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command-list） |
| CommandEmpty | `Qb` | 32158 | 29519 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command-empty） |
| CommandGroup | `$b` | 32166 | 29525 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command-group） |
| CommandItem | `ex` | 32175 | 29531 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command-item + 选中 ✓） |
| CommandShortcut | `tx` | 32191 | 29538 | QuickPick.tsx | styles-CdEGpc2x.js | （data-slot=command-shortcut） |
| mergeTaskListShards | `uje` | 35708–35726 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| useGlobalTaskList | `ZS` | 35727–36070 | 32810 | QuickPick.tsx | styles-CdEGpc2x.js | /搜索 hook |
| formatRelativeTime | `$S` | 36080–36089 | — | QuickPick.tsx | styles-CdEGpc2x.js | （刚刚/分/时/天） |
| tokenizeQuery | `dje` | 36090–36098 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| mergeHighlightRanges | `fje` | 36099–36111 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| findHighlightRanges | `pje` | 36112–36124 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| HighlightedText | `eC` | 36125–36150 | 33169 | QuickPick.tsx | styles-CdEGpc2x.js | （mark） |
| QUICK_PICK_COMMAND_ICONS | `mje` | 36151–36169 | 33181 | QuickPick.tsx | styles-CdEGpc2x.js | → lucide 组件映射 |
| SEARCH_HISTORY_LIMIT | `rC` | 36174 | — | QuickPick.tsx | styles-CdEGpc2x.js | = 20 |
| SEARCH_HISTORY_STORAGE_PREFIX | `yje` | 36175 | — | QuickPick.tsx | styles-CdEGpc2x.js | = `zcode-command-center-search-history:` |
| safeLocalStorage | `iC` | 36176–36184 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| searchHistoryStorageKey | `aC` | 36186–36188 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| isSearchHistoryEntry | `bje` | 36189–36197 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| loadSearchHistory | `oC` | 36198–36210 | 33224 | QuickPick.tsx | styles-CdEGpc2x.js |  |
| saveSearchHistory | `sC` | 36211–36218 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| recordSearchHistory | `xje` | 36219–36227 | 33240 | QuickPick.tsx | styles-CdEGpc2x.js | （去重置顶，≤20） |
| clearSearchHistory | `Sje` | 36228–36230 | 33252 | QuickPick.tsx | styles-CdEGpc2x.js |  |
| COLLAPSED_SECTION_LIMIT | `cC` | 36231 | — | QuickPick.tsx | styles-CdEGpc2x.js | = 3（all 视图每段折叠上限） |
| RECENT_SECTION_LIMIT | `lC` | 36232 | — | QuickPick.tsx | styles-CdEGpc2x.js | = 3（最近变更/最近任务条数） |
| FILE_SEARCH_LIMIT | `Tje` | 36233 | — | QuickPick.tsx | styles-CdEGpc2x.js | = 80 |
| TASK_LIST_LIMIT | `uC` | 36234 | — | QuickPick.tsx | styles-CdEGpc2x.js | = 80 |
| fileDirectoryLabel | `Oje` | 36240–36243 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| fileSearchHaystack | `kje` | 36244–36246 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| filterWorkspaceFiles | `Aje` | 36247–36260 | 33270 | QuickPick.tsx | styles-CdEGpc2x.js | （type=file，分词全命中，≤80） |
| normalizeSearchSnippet | `jje` | 36261–36268 | — | QuickPick.tsx | styles-CdEGpc2x.js | （去首尾 …、压空白） |
| dedupeSearchSnippets | `dC` | 36269–36276 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| resolveTaskTitle | `fC` | 36277 | — | QuickPick.tsx | styles-CdEGpc2x.js | → 「未命名」 |
| compareRecentChanges | `Mje` | 36281–36285 | — | QuickPick.tsx | styles-CdEGpc2x.js | （轮次↓/写次数↓/路径） |
| parseScopedQuery | `Nje` | 36286–36298 | 33298 | QuickPick.tsx | styles-CdEGpc2x.js | `>`命令 `#`任务 `@`文件 |
| commandMatchesQuery | `Pje` | 36299–36308 | 33319 | QuickPick.tsx | styles-CdEGpc2x.js | （标题+关键词，分词全命中） |
| buildTaskSearchRows | `Fje` | 36309–36334 | 33325 | QuickPick.tsx | styles-CdEGpc2x.js | ×片段 行展开 |
| ScopeTab | `pC` | 36335–36348 | 33361 | QuickPick.tsx | styles-CdEGpc2x.js | （全部/操作/任务/文件） |
| scopePrefix | `mC` | 36349–36360 | 33369 | QuickPick.tsx | styles-CdEGpc2x.js | → 前缀字符 |
| MetaText | `Ije` | 36361–36370 | 33381 | QuickPick.tsx | styles-CdEGpc2x.js | （相对时间） |
| SearchHistoryFooter | `Lje` | 36371–36438 | 33387 | QuickPick.tsx | styles-CdEGpc2x.js |  |
| QuickPick | `Rje` | 36439–36948 | 33404 | QuickPick.tsx | styles-CdEGpc2x.js | （memo） |
| mapFindNavigationKey | `QNt` | 139925–139935 | 116623 | QuickPick.tsx | styles-CdEGpc2x.js | ↑=previous ↓=next Enter=按 Shift 反向 |
| normalizeFindMatchState | `$Nt` | 139936–139940 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| stepFindIndex | `ePt` | 139941–139945 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| nextFindNavigation | `tPt` | 139946–139948 | — | QuickPick.tsx | styles-CdEGpc2x.js |  |
| QuickFindBar | `nPt` | 139949–140188 | 116646 | QuickPick.tsx | styles-CdEGpc2x.js | （window/chat 双形态） |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `m`/`g` | toast / close 图标 | ImeComposition.tsx |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `$i`/`ta`/`Qi`/`Rre` | shortcutLabel / 三个键匹配器 | keyboardShortcuts-BGHopxr9.js（外部） |
| `Ae`/`xe`/`fe`/`pe` | zustand / useTaskStore / getWorkspaceState / mergeTaskMeta | skillStore-BmeKHDBI.js（外部） |
| `Vo` | SearchResultsStore | stores-session.tsx |
| cmdk 原语 | `[cmdk-*]` | styles 本 chunk 26004–26574（vendored） |
| `qg/z_e/B_e` | fuzzy 评分（vendored） | styles 本 chunk 25586–25631 |

## 7. Settings

- 族登记：F06 SettingsFamily（壳与已还原分区）
- 产物：Settings.tsx / Settings.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| DEFAULT_CODE_PREVIEW_SETTINGS | `lo` | 1040 | — | Settings.tsx | styles-CdEGpc2x.js | ；xo → resolveThemeMode |
| sessionStorage | `JC` | 39251–39255 | — | Settings.tsx | styles-CdEGpc2x.js | /localStorage/事件 键 |
| sessionStorage | `QC` | 39251–39255 | — | Settings.tsx | styles-CdEGpc2x.js | /localStorage/事件 键 |
| sessionStorage | `XC` | 39251–39255 | — | Settings.tsx | styles-CdEGpc2x.js | /localStorage/事件 键 |
| sessionStorage | `YC` | 39251–39255 | — | Settings.tsx | styles-CdEGpc2x.js | /localStorage/事件 键 |
| sessionStorage | `ZC` | 39251–39255 | — | Settings.tsx | styles-CdEGpc2x.js | /localStorage/事件 键 |
| HIDDEN_SETTINGS_SECTIONS | `VMe` | 39256 | — | Settings.tsx | styles-CdEGpc2x.js | = {automations} |
| isSettingsSectionId | `$C` | 39257 | — | Settings.tsx | styles-CdEGpc2x.js | ；ew → isSettingsSectionVisible |
| resolveVisibleSettingsSection | `tw` | 39279 | — | Settings.tsx | styles-CdEGpc2x.js | ；rw → persistLastSettingsSection |
| readInitialSettingsSection | `UMe` | 39323 | — | Settings.tsx | styles-CdEGpc2x.js | ；KMe → consumeUsageTabIntent |
| consumeModelProviderIntent | `sw` | 39377 | — | Settings.tsx | styles-CdEGpc2x.js | ；qMe → shouldResetUsageTabToApp |
| subscribeSettingsSectionIntent | `cw` | 39394 | — | Settings.tsx | styles-CdEGpc2x.js | ；ow/iw/aw → requestSettingsSectionNavigation |
| CODE_THEME_OPTIONS | `TO` | 47276 | — | Settings.tsx | styles-CdEGpc2x.js | 10 个代码主题 |
| CODE_THEME_PREVIEW_SAMPLE | `sze` | 47298 | — | Settings.tsx | styles-CdEGpc2x.js |  |
| resolveCodeThemeForMode | `EO` | 47303 | — | Settings.tsx | styles-CdEGpc2x.js | ；DMt → resolveCodeThemeLabel |
| SettingsCard | `B3` | 135212 | 113713 | Settings.tsx | styles-CdEGpc2x.js | data-slot=card |
| SettingsCardContent | `V3` | 135254 | 113744 | Settings.tsx | styles-CdEGpc2x.js | data-slot=card-content |
| SETTINGS_CONTENT_CLASS | `H3` | 135261 | 113750 | Settings.tsx | styles-CdEGpc2x.js |  |
| CodeThemeSelect | `wMt` | 135262 | 113751 | Settings.tsx | styles-CdEGpc2x.js | （10 主题） |
| CodeThemePreviewCard | `TMt` | 135278 | 113770 | Settings.tsx | styles-CdEGpc2x.js | /暗主题预览卡 |
| SettingsSectionCard | `W3` | 135363 | 113810 | Settings.tsx | styles-CdEGpc2x.js | （B3+V3 零内边距组合） |
| SettingsTitleChip | `EMt` | 135369 | 113815 | Settings.tsx | styles-CdEGpc2x.js | chip |
| AutomationsMain | `d6` | 138823 | 115911 | Settings.tsx | styles-CdEGpc2x.js | （接口级，属 F15 族） |
| ModelProviderSettingsSection | `FQt` | 191784 | 154557 | Settings.tsx | styles-CdEGpc2x.js | （接口级，见尾注） |
| McpServerEditor | `HQt` | 192533 | — | Settings.tsx | styles-CdEGpc2x.js | /JSON 编辑器 |
| McpServerList | `KQt` | 192956 | — | Settings.tsx | styles-CdEGpc2x.js | /空态 |
| McpImportDialog | `_$t` | 193344 | — | Settings.tsx | styles-CdEGpc2x.js | agent 配置导入（18 种，settingsSync） |
| PluginMcpServerList | `W$t` | 194503 | — | Settings.tsx | styles-CdEGpc2x.js | MCP 列表 |
| McpSettingsSection | `G$t` | 194645 | 156627 | Settings.tsx | styles-CdEGpc2x.js | MCP 服务器（列表/搜索/表单/JSON/导入/远程同步） |
| SkillsSettingsSection | `y1t` | 195992 | 157604 | Settings.tsx | styles-CdEGpc2x.js | （接口级） |
| IndexingSettingsSection | `h2t` | 202286 | 161628 | Settings.tsx | styles-CdEGpc2x.js | （仓库快照/即时 grep） |
| formatShortDate | `S2t` | 202379 | 202384 | Settings.tsx | styles-CdEGpc2x.js |  |
| formatWeekday | `x2t` | 202379 | 202384 | Settings.tsx | styles-CdEGpc2x.js |  |
| formatMemoryUpdatedLabel | `C2t` | 202396 | 161724 | Settings.tsx | styles-CdEGpc2x.js | （刚刚/分钟/今天/昨天/周几/日期） |
| ProjectMemoryViewer | `w2t` | 202420 | 161768 | Settings.tsx | styles-CdEGpc2x.js | （项目→文件→预览三级） |
| errorMessageOf | `T2t` | 202644 | 161838 | Settings.tsx | styles-CdEGpc2x.js | ；T9 → hasErrorCode |
| MemorySettingsSection | `E2t` | 202650 | 161844 | Settings.tsx | styles-CdEGpc2x.js | （开关 + 查看器入口） |
| BrowserSettingsSection | `O2t` | 202904 | 162015 | Settings.tsx | styles-CdEGpc2x.js | （Browser Use 开关/导入/清数据） |
| SettingsCaptionLogo | `H2t` | 203818 | 162542 | Settings.tsx | styles-CdEGpc2x.js | Win 左上 logo 拖拽条 |
| DataBaseDirControl | `U2t` | 203829 | 162548 | Settings.tsx | styles-CdEGpc2x.js | （只读输入+浏览+保存+状态提示） |
| THEME_MODE_OPTIONS | `W2t` | 203925 | 162601 | Settings.tsx | styles-CdEGpc2x.js | system/zai-dark/zai-light |
| SETTINGS_SIDEBAR_GROUPS | `G2t` | 203930 | 162611 | Settings.tsx | styles-CdEGpc2x.js | 3 个侧栏分组 |
| SETTINGS_SECTION_REGISTRY | `K2t` | 203935 | 162621 | Settings.tsx | styles-CdEGpc2x.js | 14 分区注册表（过滤隐藏段） |
| SETTINGS_GROUPED_SECTIONS | `q2t` | 203962 | 162693 | Settings.tsx | styles-CdEGpc2x.js | ×分区装配 |
| AUTO_ARCHIVE_DAY_OPTIONS | `J2t` | 203964 | 162697 | Settings.tsx | styles-CdEGpc2x.js | [3,7,14,30] |
| INTERACTION_BEHAVIOR_OPTIONS | `Y2t` | 203965 | 162698 | Settings.tsx | styles-CdEGpc2x.js | [`queue`,`guide`] |
| GeneralSettingsSection | `X2t` | 203966 | 162699 | Settings.tsx | styles-CdEGpc2x.js | （语言/终端/HTTP代理/更新/通知/行为/归档/数据目录…） |
| GeneralSettingsTitleChips | `Z2t` | 204528 | 163078 | Settings.tsx | styles-CdEGpc2x.js | chip |
| PixelNumberInput | `Q2t` | 204535 | 163088 | Settings.tsx | styles-CdEGpc2x.js | px 数字输入（12–20 等） |
| AppearanceSettingsSection | `$2t` | 204566 | 163104 | Settings.tsx | styles-CdEGpc2x.js | （主题模式/UI字号/代码主题/行号/换行/预览） |
| codingPlanTabId | `A9` | 204819 | 204822 | Settings.tsx | styles-CdEGpc2x.js |  |
| parseCodingPlanTabId | `n4t` | 204819 | 204822 | Settings.tsx | styles-CdEGpc2x.js |  |
| SettingsSidebarItem | `o4t` | 204846 | 163271 | Settings.tsx | styles-CdEGpc2x.js | （Tooltip + 激活态） |
| SettingsView | `j9` | 204878 | 163283 | Settings.tsx | styles-CdEGpc2x.js | （64/264px 左段列表 + 右栏） |
| PendingOperationButton | `D9` | — | — | Settings.tsx | styles-CdEGpc2x.js | spinner 的操作按钮 (202889 / —) |
| Switch | `DC` | — | — | Settings.tsx | styles-CdEGpc2x.js | Radix Switch 封装 (37297 / —) |
| Commands | `G0t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| McpServerRow | `GQt` | — | — | Settings.tsx | styles-CdEGpc2x.js | （开关/编辑/删除/OAuth）(192850 附近) |
| Subagents | `H1t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| Plugins | `I0t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| BackLinkButton | `M7` | — | — | Settings.tsx | styles-CdEGpc2x.js | ← 返回链接按钮 (193045 / —) |
| WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX | `O9` | — | — | Settings.tsx | styles-CdEGpc2x.js | = 136 (204776 / —) |
| Alert | `S9` | — | — | Settings.tsx | styles-CdEGpc2x.js | /AlertDescription   (202338/202356 / —) |
| McpEditorModeTabs | `U$t` | — | — | Settings.tsx | styles-CdEGpc2x.js | form |
| SettingsRow | `U3` | — | — | Settings.tsx | styles-CdEGpc2x.js | 行：grid [1fr_192px] label+desc |
| Migration | `V2t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| Tabs | `_C` | — | — | Settings.tsx | styles-CdEGpc2x.js | /TabsList/TabsTrigger/TabsContent 原语 (36949–36991 / —) |
| 团队计划判定/标签/个人源构造/快照可用性 | `a4t` | — | — | Settings.tsx | styles-CdEGpc2x.js | (204813/204825/204832/204839) |
| Select | `aO` | — | — | Settings.tsx | styles-CdEGpc2x.js | (46009–46104 / —) |
| startOfDay | `b2t` | — | — | Settings.tsx | styles-CdEGpc2x.js | /formatTimeH23 (202372/202376 附近) |
| Select | `cO` | — | — | Settings.tsx | styles-CdEGpc2x.js | (46009–46104 / —) |
| UsageSectionTabBar | `e4t` | — | — | Settings.tsx | styles-CdEGpc2x.js | 用量分区 app |
| Tabs | `gC` | — | — | Settings.tsx | styles-CdEGpc2x.js | /TabsList/TabsTrigger/TabsContent 原语 (36949–36991 / —) |
| Tabs | `hC` | — | — | Settings.tsx | styles-CdEGpc2x.js | /TabsList/TabsTrigger/TabsContent 原语 (36949–36991 / —) |
| 团队计划判定/标签/个人源构造/快照可用性 | `i4t` | — | — | Settings.tsx | styles-CdEGpc2x.js | (204813/204825/204832/204839) |
| Select | `iO` | — | — | Settings.tsx | styles-CdEGpc2x.js | (46009–46104 / —) |
| ResourceGroupHeader | `j7` | — | — | Settings.tsx | styles-CdEGpc2x.js | （标题+计数+提示）(193014 / —) |
| normalizeCaptionRightPaddingPx | `k9` | — | — | Settings.tsx | styles-CdEGpc2x.js | (204777 / —) |
| Select | `oO` | — | — | Settings.tsx | styles-CdEGpc2x.js | (46009–46104 / —) |
| Usage | `p1t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| Hooks | `p2t` | — | — | Settings.tsx | styles-CdEGpc2x.js |  |
| 团队计划判定/标签/个人源构造/快照可用性 | `r4t` | — | — | Settings.tsx | styles-CdEGpc2x.js | (204813/204825/204832/204839) |
| Select | `sO` | — | — | Settings.tsx | styles-CdEGpc2x.js | (46009–46104 / —) |
| 团队计划判定/标签/个人源构造/快照可用性 | `t4t` | — | — | Settings.tsx | styles-CdEGpc2x.js | (204813/204825/204832/204839) |
| Tabs | `vC` | — | — | Settings.tsx | styles-CdEGpc2x.js | /TabsList/TabsTrigger/TabsContent 原语 (36949–36991 / —) |
| Alert | `w9` | — | — | Settings.tsx | styles-CdEGpc2x.js | /AlertDescription   (202338/202356 / —) |
| startOfDay | `y2t` | — | — | Settings.tsx | styles-CdEGpc2x.js | /formatTimeH23 (202372/202376 附近) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`wa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`P`/`M`/`u` | 平台服务 / toast / Input / spinner / useSelectDirectory | ImeComposition.tsx |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `Ae`/`xe`/`Ne`/`q` | zustand / 任务 / 技能 store / 供应商 id 枚举 | skillStore-BmeKHDBI.js（外部） |
| `ko` | SettingsStore | stores-core.tsx |
| `Ug`/`B6`/`F6`/`Z0t` | MCP / 插件 / 命令 / Hooks store | stores-workspace.tsx |
| `S6`/`U6`/`c4`/`s4`/`r4` | 应用菜单 / 帮助 / caption / 远程同步 | TopBar.tsx / Modals.tsx |
| `l4`/`tkt` | 窗口壳 / Linux 控件 | WorkspaceShell.tsx |
| `SRt` | 侧栏页脚 | Sidebar.tsx |
| `hC/gC/_C/vC`、`DC`、`iO…cO`、`$4…o3` | Tabs / Switch / Select / AlertDialog 原语 | styles 本 chunk 36949 / 37297 / 46009 / 131966 |
| `FQt`/`y1t`/`d6`/`I0t`/`H1t`/`G0t`/`p2t`/`V2t`/`p1t` | 九大分区（本批已实体化） | SettingsPanels*.tsx |

## 8. SettingsPanels

- 族登记：F06/F12/F15 设置分区叶子
- 产物：SettingsPanels.tsx + SettingsPanelsCapability.tsx + SettingsPanelsData.tsx / SettingsPanels.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| AppUsageRangeTabs | `G7` | 7 | — | SettingsPanelsData.tsx | styles-CdEGpc2x.js | G7   → AppUsageRangeTabs              7d |
| CodeBlock | `gk` | 48634 | 43829 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | （shiki+mermaid+换行） |
| AutomationRowActionMenu | `ZNt` | 138713 | 115876 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| AutomationsMain | `d6` | 138823 | 115911 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| MemoryFilePreview | `U8` | 160323 | 132773 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | （Markdown 包装） |
| ProviderConfigCardForm | `u7` | 188376 | 151911 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| AddCustomProviderDraftForm | `CXt` | 188882 | 152305 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| SectionLoadingPlaceholder | `v7` | 189650 | 152857 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| PresetEmptyState | `nZt` | 189662 | 152862 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| CodingPlanStatusSection | `rZt` | 189675 | 152873 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ProviderCardShell | `x7` | 190191 | 153248 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ProviderCardHeader | `yZt` | 190194 | 153254 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ConnectionModeNav | `bZt` | 190231 | 153271 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ModelProviderPanel | `AZt` | 190379 | 153409 | SettingsPanels.tsx | styles-CdEGpc2x.js | （分派 preset/codingPlan/teamPlan/custom/addCustom） |
| CodingPlanPurchaseBanner | `MZt` | 190703 | 153690 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| StatusTitleDescription | `WZt` | 191011 | 153927 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ModelProviderNavRail | `eQt` | 191183 | 154042 | SettingsPanels.tsx | styles-CdEGpc2x.js | （拖拽排序） |
| isProviderSectionRefreshing | `tQt` | 191286 | 154088 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ModelProviderSectionShell | `nQt` | 191289 | 154091 | SettingsPanels.tsx | styles-CdEGpc2x.js | （描述行+刷新+双栏卡） |
| useModelProviderNavigationModel | `rQt` | 191351 | 154111 | SettingsPanels.tsx | styles-CdEGpc2x.js | （分组/条目/选中解析） |
| ModelProviderSettingsSection | `FQt` | 191784 | 154557 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| SettingsFormTextarea | `D7` | 192349 | 155116 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| MCP_FORM_DRAFT_DEFAULTS | `IQt` | 192358 | 155125 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| mcpServerToFormDraft | `LQt` | 192374 | 155141 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| mcpFormDraftToConfig | `RQt` | 192401 | 155158 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| mcpFormDraftToJson | `k7` | 192441 | 155201 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| parseMcpJsonToFormDraft | `BQt` | 192445 | 155207 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| SettingsFormFieldLabel | `A7` | 192489 | 155241 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| McpStorageLevelSelect | `VQt` | 192495 | 155246 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| McpServerEditor | `HQt` | 192533 | 155282 | SettingsPanels.tsx | styles-CdEGpc2x.js | /JSON 双模式编辑器 |
| McpStatusIndicator | `UQt` | 192834 | 155435 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| McpScopeBadge | `WQt` | 192847 | 155443 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| McpServerRow | `GQt` | 192855 | 155454 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| McpServerList | `KQt` | 192956 | 155481 | SettingsPanels.tsx | styles-CdEGpc2x.js | /空态 |
| McpImportDialog | `_$t` | 193344 | 155837 | SettingsPanels.tsx | styles-CdEGpc2x.js | category=mcpServers 薄包装 |
| useExternalAgentImportState | `R7` | 193347 | 155843 | SettingsPanels.tsx | styles-CdEGpc2x.js | /选择/导入状态机 |
| ExternalAgentImportDialog | `z7` | 193434 | 155926 | SettingsPanels.tsx | styles-CdEGpc2x.js | （selection/importing/complete） |
| AppUsageDashboard | `e1t` | 195350 | 157165 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | app 用量仪表盘 |
| CodingPlanUsageDashboard | `a1t` | 195530 | 157259 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | Coding Plan 仪表盘 |
| skillEnabledFilterMatch | `m1t` | 195926 | 157535 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| ResourceEnabledFilterSelect | `h1t` | 195930 | 157538 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| SkillsSettingsSection | `y1t` | 195992 | 157604 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| SubagentsSettingsSection | `H1t` | 197542 | 158526 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| PluginsSettingsSection | `I0t` | 199994 | 159986 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| useCommandsStoreBridge | `L0t` | 200503 | 160320 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandRow | `z0t` | 200556 | 160383 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandForm | `W0t` | 200703 | 160448 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandsSettingsSection | `G0t` | 200852 | 160523 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookForm | `t2t` | 201390 | 161023 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookListByEvent | `i2t` | 201771 | 161256 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HooksSettingsSection | `p2t` | 202032 | 161468 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| useClaudeMigration | `I2t` | 203145 | 162189 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | /导入状态机 |
| MigrationCandidatesCard | `z2t` | 203332 | 162321 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| MigrationSettingsSection | `V2t` | 203587 | 162409 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| CodeBlockWrapLinesButton | `_k` | — | 43898 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| CodeBlockMermaidPreviewButton | `iBe` | — | 43907 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| CodeBlockCopyButton | `vk` | — | 43934 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| resolveVisibleTabs | `BNt` | — | 115803 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| resolveEffectiveTab | `VNt` | — | 115809 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| resolveTemplateVisibility | `HNt` | — | 115812 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| AUTOMATION_STATUS_STYLES | `UNt` | — | 115823 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| normalizePromptPreview | `WNt` | — | 115841 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| isFailedAutomation | `GNt` | — | 115845 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| isToggleableAutomation | `KNt` | — | 115848 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| runNowResultMessageId | `qNt` | — | 115851 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| automationErrorMessageId | `u6` | — | 115854 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| createErrorMessageId | `JNt` | — | 115857 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| findAutomationById | `YNt` | — | 115860 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| resolveOpenTarget | `XNt` | — | 115864 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| presetInFamilyDomain | `iQt` | — | 154251 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolvePresetActiveState | `aQt` | — | 154253 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveDefaultSelectedNodeKey | `oQt` | — | 154266 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveSelectedNavItem | `sQt` | — | 154276 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| navItemStorageKey | `cQt` | — | 154299 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| pickPreferredPlanItem | `lQt` | — | 154308 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveFamilyConnectionItem | `uQt` | — | 154315 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| isPlanNavItem | `C7` | — | 154337 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| hasCheckingPlanItem | `dQt` | — | 154338 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| findNavItemByKey | `fQt` | — | 154339 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| isPlanNavKey | `pQt` | — | 154357 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| trackAddModelSuccess | `mQt` | — | 154361 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| openPresetApiKeyUrl | `hQt` | — | 154372 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| confirmAndDeleteCustomProvider | `gQt` | — | 154375 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| refreshProvidersAndTeamProducts | `_Qt` | — | 154415 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| refreshAllProviderCaches | `vQt` | — | 154419 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveDomainAfterLogout | `yQt` | — | 154432 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| applyProviderFamilyDomainMigration | `bQt` | — | 154440 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| withFamilyModeOAuth | `w7` | — | 154449 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| codingPlanAttemptKey | `xQt` | — | 154455 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| shouldRetryFailedTransition | `SQt` | — | 154462 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| shouldCompleteTransition | `CQt` | — | 154470 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| shouldTrackInFlightAttempt | `wQt` | — | 154477 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| normalizeModelProviderIntent | `TQt` | — | 154484 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| codingPlanApiKeyChanged | `EQt` | — | 154495 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| oauthDomainOfProvider | `T7` | — | 154498 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| presetMatchesFamilyDomain | `DQt` | — | 154501 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveDefaultFamilyDomain | `OQt` | — | 154505 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| replaceProviderInList | `kQt` | — | 154510 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| hasActiveProviderInDomain | `AQt` | — | 154513 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| clearPendingModeIfUnchanged | `jQt` | — | 154516 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| clearPendingKeyIfUnchanged | `MQt` | — | 154524 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| isTeamPlanKeyStillSubscribed | `NQt` | — | 154532 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| presetNavKeyOf | `E7` | — | 154550 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| resolveNavItemStorageKey | `PQt` | — | 154554 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| isPlainObject | `O7` | — | 155138 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| parseTimeoutMsInput | `zQt` | — | 155195 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| SkillsImportDialog | `h$t` | — | 155825 | SettingsPanels.tsx | styles-CdEGpc2x.js | category=skills 薄包装 |
| CommandsImportDialog | `g$t` | — | 155831 | SettingsPanels.tsx | styles-CdEGpc2x.js | category=commands 薄包装 |
| ExternalAgentImportSelectionPane | `v$t` | — | 156034 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportTargetScopeSelect | `x$t` | — | 156138 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportResultSummaryBar | `S$t` | — | 156178 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportResultStat | `B7` | — | 156193 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportResultList | `C$t` | — | 156199 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportResultRow | `w$t` | — | 156215 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportResultStatusIcon | `T$t` | — | 156225 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportSourceScopeSelect | `E$t` | — | 156245 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| ImportDiscoveryTree | `D$t` | — | 156275 | SettingsPanels.tsx | styles-CdEGpc2x.js | ×资源选择树 |
| ImportResourceRow | `O$t` | — | 156350 | SettingsPanels.tsx | styles-CdEGpc2x.js |  |
| UsageChartBoundary | `U7` | — | 157119 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | ErrorBoundary(p4)+Suspense 壳 |
| USAGE_CREDENTIAL_ERROR_PATTERNS | `Y$t` | — | 157137 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| isCredentialError | `X$t` | — | 157138 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| usageErrorMessage | `Z$t` | — | 157141 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| UsageErrorBanner | `W7` | — | 157148 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | /通用错误横幅 |
| LazyAppUsageDailyModelBarChart | `Q$t` | — | 157159 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | ← AppUsageDailyModelBarChart-037NXfkz.js |
| LazyAppUsageModelUsagePieChart | `$$t` | — | 157161 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | ← AppUsageModelUsagePieChart-_KCE1AAL.js |
| shortModelName | `t1t` | — | 157222 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| modelSeriesOf | `n1t` | — | 157244 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| toolSeriesOf | `r1t` | — | 157250 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| LazyCodingPlanUsageLineChart | `i1t` | — | 157256 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | ← CodingPlanUsageLineChart-BpNLwqMV.js |
| resolveSourceProviderName | `o1t` | — | 157353 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| CodingPlanQuotaCards | `c1t` | — | 157378 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | 5h/周/月 MCP 配额卡 |
| CodingPlanTrendsSection | `l1t` | — | 157424 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | （区间+刷新+双图） |
| CodingPlanModelUsageSection | `u1t` | — | 157447 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| CodingPlanToolUsageSection | `d1t` | — | 157479 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| UsageSummaryStatGrid | `f1t` | — | 157512 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | 4 格统计 |
| workspaceFolderName | `g1t` | — | 157578 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| formatPublishedAtIso | `_1t` | — | 157580 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| DetailField | `K7` | — | 157585 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| DetailPathRow | `v1t` | — | 157593 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| isUserManagedCommand | `m9` | — | 160369 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandScopeBadge | `R0t` | — | 160372 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| COMMAND_NAME_PATTERN | `B0t` | — | 160404 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandFormLabel | `h9` | — | 160407 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CommandStorageLevelSelect | `U0t` | — | 160412 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| FormLabelSlot | `Q0t` | — | 161013 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HOOK_EVENTS | `$0t` | — | 161019 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| customJsonOf | `e2t` | — | 161020 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookFormField | `y9` | — | 161229 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HOOK_EVENT_ORDER | `n2t` | — | 161236 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookScopeTabs | `r2t` | — | 161237 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| groupHookRowsByEvent | `a2t` | — | 161289 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookRowShell | `b9` | — | 161322 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookRowBody | `x9` | — | 161331 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| EditableHookRow | `o2t` | — | 161349 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| CompatibilityHookRow | `s2t` | — | 161383 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| PluginHookRow | `c2t` | — | 161409 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| HookRowActionButton | `l2t` | — | 161443 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| isZCodeHook | `u2t` | — | 161451 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| collectPluginHookRows | `d2t` | — | 161454 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| filterPluginHooksByScope | `f2t` | — | 161464 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| hookMatchesQuery | `m2t` | — | 161625 | SettingsPanelsCapability.tsx | styles-CdEGpc2x.js |  |
| migrationSkipReasonLabel | `L2t` | — | 162301 | SettingsPanelsData.tsx | styles-CdEGpc2x.js |  |
| MigrationResultItemList | `R2t` | — | 162310 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | /失败明细 |
| MIGRATION_RANGES | `B2t` | — | 162408 | SettingsPanelsData.tsx | styles-CdEGpc2x.js | [7d,30d,90d,all] |
| ImportTargetSplitButton | `b$t` | — | — | SettingsPanels.tsx | styles-CdEGpc2x.js | global |
| UsageSettingsSection | `p1t` | — | — | SettingsPanelsData.tsx | styles-CdEGpc2x.js | 分区根（app |
| CodingPlanRangeTabs | `s1t` | — | — | SettingsPanelsData.tsx | styles-CdEGpc2x.js | today |
| ImportModeSelect | `y$t` | — | — | SettingsPanels.tsx | styles-CdEGpc2x.js | symlink |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`G`/`J` | cn / Button / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`P`/`j`/`M` | 平台服务 / toast / Input / Textarea / Spinner | ImeComposition.tsx |
| `Ia`/`Fa/Pa/Zre/Da/Aa/Qre/Jre/ai` | Tooltip / 用量展示助手 | usageStatsUiParts-CiR7YEhh.js（外部） |
| `q`/`xe`/`XB`/`XQt` | 供应商枚举 / 任务 store / 技能分组 | skillStore-BmeKHDBI.js（外部） |
| `ko`/`B6`/`T3`/`bX`/`Z0t`/`F6` | 设置 / 插件 / 自动化 / 闲时 / Hooks / 命令 store | stores-core/tasks/workspace.tsx |
| `qq`/`JM`/`TY`/`$j`/`sX`/`fX`/`q$t`/`J$t` | 供应商/设置快照/权益/用量数据钩子 | styles 本 chunk（F12 域，部分接口级） |
| `Q$t`/`$$t`/`i1t` | lazy 三图 | appUsageDailyModelBarChart.tsx / appUsageModelUsagePieChart.tsx / codingPlanUsageLineChart.tsx（异步 chunk） |
| `j7`/`M7`/`B3`/`V3`/`U3`/`S9`/`w9`/`r4` | 行式骨架 / Alert / 远程同步 | Settings.tsx / TopBar.tsx / Modals.tsx |
| `cj` | MarkdownRenderer（U8/gk） | MarkdownIntegration.tsx |

## 9. WorkspaceShell

- 族登记：F07 WorkspaceShellFamily + F20 引导
- 产物：WorkspaceShell.tsx + rendererEntry.tsx + e2eStoreBridgeBootstrap.tsx / WorkspaceShell.report.md + rendererEntry.report.md + e2eStoreBridgeBootstrap.report.md
- 来源：styles-CdEGpc2x.js / index-ABImDspU.js / e2eStoreBridgeBootstrap-DOKuAE2h.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| SidebarSessionDropContext | `FTt` | 123103 | 104799 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| SidebarSessionDropProvider | `ITt` | 123104-123117 | 104800-104813 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useSidebarSessionDrop | `LTt` | 123118 | 104814 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| LAST_SESSION_STORAGE_PREFIX | `RTt` | 123122 | 104862 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'zcode-v4-last-session:v1:' |
| lastSessionStorageKey | `j2` | 123124 | 104864 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| readLastSessionId | `zTt` | 123127 | 104867 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| writeLastSessionId | `BTt` | 123133 | 104873 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| shouldRestoreLastSession | `VTt` | 123139 | 104879 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useLastSessionPersistence | `HTt` | 123141-123177 | 104845-104880 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| WindowShell | `l4` | 129647-129666 | 109071-109087 | WorkspaceShell.tsx | styles-CdEGpc2x.js | memo：h-dvh 列容器 |
| ARMS | `GOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `HOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `KOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `UOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `VOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `WOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `qOt` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| ARMS | `u4` | 129667-129705 | 109088-109128 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-error 遥测组 |
| LOCALE_PREFERENCE_KEY | `JOt` | 129706 | 109129 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'zcode-locale-preference' |
| toError | `d4` | 129708 | 109131 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| serializeErrorForLog | `YOt` | 129711 | 109134 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| detectInitialLocale | `XOt` | 129714 | 109137 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| translateAppError | `f4` | 129724 | 109147 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| didResetKeysChange | `ZOt` | 129729 | 109152 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| AppErrorBoundary | `ekt` | 129920 | 109184 | WorkspaceShell.tsx | styles-CdEGpc2x.js | （本文件保留接口） |
| ScopedErrorBoundary | `p4` | 129952-129991 | 109217-109263 | WorkspaceShell.tsx | styles-CdEGpc2x.js | （scope/resetKeys/variant） |
| LinuxWindowControls | `tkt` | 129992-130033 | 109264-109304 | WorkspaceShell.tsx | styles-CdEGpc2x.js | Linux 桌面 −□× 三键 |
| ResizablePanelGroup | `cAt` | 131422 | 110732 | WorkspaceShell.tsx | styles-CdEGpc2x.js | react-resizable-panels Group 引擎 |
| persistentLayoutKey | `J4` | 131599 | 110913 | WorkspaceShell.tsx | styles-CdEGpc2x.js | 'react-resizable-panels:{id}:{panels}' |
| usePersistentGroupLayout | `uAt` | 131631 | 110950 | WorkspaceShell.tsx | styles-CdEGpc2x.js | localStorage 布局持久化 |
| ResizablePanel | `pAt` | 131715 | 111031 | WorkspaceShell.tsx | styles-CdEGpc2x.js | Panel 引擎 |
| SplitLayoutGroup | `X4` | 131934-131942 | 111263-111271 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = cAt + 布局持久化 |
| SplitPanel | `Z4` | 131943 | 111283 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = pAt |
| useCollapsiblePanel | `Iqt` | 183714-183777 | 148181-148239 | WorkspaceShell.tsx | styles-CdEGpc2x.js | +尺寸记忆 |
| resolveAutomationsRunTab | `Lqt` | 183778-183785 | 148240-148247 | WorkspaceShell.tsx | styles-CdEGpc2x.js | tab 裁决 |
| windowRoundedCornerClasses | `Rqt` | 183782-183790 | 148255-148266 | WorkspaceShell.tsx | styles-CdEGpc2x.js | Win 圆角/边框让位 |
| 远控导航高度常量 0.5/352/24/48/168 | `Bqt` | 183792-183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| 远控导航高度常量 0.5/352/24/48/168 | `Hqt` | 183792-183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| 远控导航高度常量 0.5/352/24/48/168 | `Uqt` | 183792-183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| 远控导航高度常量 0.5/352/24/48/168 | `Vqt` | 183792-183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| 远控导航高度常量 0.5/352/24/48/168 | `zqt` | 183792-183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| isSidebarShownInShellLayout | `Wqt` | 183796 | 148267 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| preferredNavHeightForViewport | `Gqt` | 183799 | 148274 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| maxNavHeightForViewport | `Kqt` | 183802 | 148277 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| clampNavHeight | `W5` | 183805 | 148280 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| toggleNavHeight | `qqt` | 183810 | 148294 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| G5 | `Jqt` | 183816-183818 | 148300 | WorkspaceShell.tsx | styles-CdEGpc2x.js | /事件名 |
| G5 | `Xqt` | 183816-183818 | 148300 | WorkspaceShell.tsx | styles-CdEGpc2x.js | /事件名 |
| G5 | `Yqt` | 183816-183818 | 148300 | WorkspaceShell.tsx | styles-CdEGpc2x.js | /事件名 |
| setSidebarResizingAttribute | `G5` | 183819 | 148310 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| MOBILE_VIEWPORT_QUERY | `Zqt` | 183822 | 148313 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = '(max-width: 767px)' |
| COLLAPSE_NAV_ONCE_KEY | `K5` | 183823 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'zcode:web-remote-control:collapse-navigation-once' |
| DEFAULT_VIEWPORT_HEIGHT | `Qqt` | 183824 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 800 |
| NAV_DRAG_THRESHOLD_PX | `$qt` | 183825 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 4 |
| DEFAULT_SIDEBAR_WIDTH_PX | `eJt` | 183826 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 264 |
| MIN_SIDEBAR_WIDTH_PX | `q5` | 183827 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 264 |
| MAX_SIDEBAR_WIDTH_RATIO | `tJt` | 183828 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 0.5 |
| SIDEBAR_WIDTH_STORAGE_KEY | `nJt` | 183829 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'zcode:workspace-shell:sidebar-width-px' |
| SIDEBAR_RATIO_STORAGE_KEY | `rJt` | 183830 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'react-resizable-panels:workspace-shell-layout:sidebar:content' |
| SIDEBAR_KEYBOARD_STEP_PX | `iJt` | 183831 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 16 |
| SIDEBAR_PANEL_WIDTH_VAR | `aJt` | 183832 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = '--workspace-sidebar-panel-width' |
| SIDEBAR_WIDTH_VAR | `oJt` | 183833 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = '--workspace-sidebar-width' |
| SIDE_PANE_AUTO_COLLAPSE_THRESHOLD_PX | `sJt` | 183834 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 480 |
| EMPTY_LOGS_BY_WORKSPACE_KEY | `cJt` | 183835 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = {} |
| EMPTY_REMOTE_WORKSPACE_SESSIONS | `lJt` | 183836 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = [] |
| SIDEBAR_AUTO_COLLAPSE_THRESHOLD_PX | `uJt` | 183837 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 360 |
| RESIZE_DEBOUNCE_MS | `dJt` | 183838 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 300 |
| WORKSPACE_BODY_PANEL_IDS | `fJt` | 183839 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = ['conversation-column', 'browser'] |
| CONVERSATION_COLUMN_PANEL_IDS | `pJt` | 183840 | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | = ['conversation', 'terminal'] |
| clampSidebarWidth | `J5` | 183841 | 148337 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| readPersistedSidebarWidth | `mJt` | 183845 | 148341 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| readPersistedSidebarRatio | `hJt` | 183856 | 148352 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| persistSidebarWidth | `Y5` | 183868 | 148364 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| viewportHeight | `X5` | 183874 | 148369 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| isMobileViewportNow | `gJt` | 183877 | 148372 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| consumeCollapseNavigationOnce | `_Jt` | 183882 | 148375 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| armCollapseNavigationOnce | `vJt` | 183890 | 148382 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| WorkspaceShell | `yJt` | 183896-185431 | 148387-149354 | WorkspaceShell.tsx | styles-CdEGpc2x.js | ：三分布局根组件 |
| MAC_TRAFFIC_LIGHTS_PADDING_PX | `Z5` | 185430 | 149354 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 96 |
| WINDOWS_CAPTION_CONTROLS_WIDTH_PX | `Q5` | 185431 | 149354 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 136 |
| roundPositivePx | `$5` | 185432 | 149355 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| resolveWindowControlsPadding | `bJt` | 185435 | 149358 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| updateReadyVersionOf | `xJt` | 185442 | 149370 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useAppChromeState | `SJt` | 185445-185564 | 149373-149484 | WorkspaceShell.tsx | styles-CdEGpc2x.js | /窗口外观/控制区几何/更新状态订阅 |
| RELOAD_SESSION_DEBOUNCE_MS | `CJt` | 185566 | 149485 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 1200 |
| toReloadSessionError | `wJt` | 185567 | 149486 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| withinReloadDebounce | `TJt` | 185574 | 149495 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| pickSelectedModelFromConfigOptions | `EJt` | 185578 | 149498 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| parseProviderIdFromModelRef | `e7` | 185584 | 149502 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| findCustomModelProvider | `DJt` | 185591 | 149510 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| isProviderMismatch | `OJt` | 185598 | 149516 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| resolveSelectedSupplierKey | `kJt` | 185605 | 149520 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| shouldUseLocalPreference | `AJt` | 185614 | 149526 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| resolveWorkspaceModelSelection | `jJt` | 185624-185687 | 149535-149584 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useReloadSession | `MJt` | 185688-185784 | 149585-149670 | WorkspaceShell.tsx | styles-CdEGpc2x.js | （进程重启+配置重取+模型裁决） |
| useWorkspaceLifecycle | `NJt` | 185785-185824 | 149671-149696 | WorkspaceShell.tsx | styles-CdEGpc2x.js | +预热释放 |
| isTaskRuntimeActive | `PJt` | 185825 | 149697 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| mergeTaskProviders | `FJt` | 185828 | 149700 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| hasActiveTaskRuntimeForProvider | `IJt` | 185835 | 149706 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceShellZCodeState | `LJt` | 185847-185880 | 149720-149744 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| isRestartingRuntime | `t7` | 185881 | 149745 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| isTaskStillVisible | `RJt` | 185884 | 149748 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useTaskNavigation | `zJt` | 185889-186063 | 149753-149916 | WorkspaceShell.tsx | styles-CdEGpc2x.js | /前进后退/自动化导航 |
| useBrowserRestoreUrls | `BJt` | 186064-186109 | 149917-149967 | WorkspaceShell.tsx | styles-CdEGpc2x.js | url + git 源持久化 |
| trimmedOrUndefined | `n7` | 186110 | 149968 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| resolveActiveWorkspaceTarget | `VJt` | 186112 | 149971 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| OFF_PEAK_POLL_INTERVAL_MS | `HJt` | 186119 | 149985 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 30000 |
| toOffPeakNotifyStatus | `UJt` | 186121 | 149986 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| useOffPeakNotifications | `WJt` | 186123-186168 | 149986-150039 | WorkspaceShell.tsx | styles-CdEGpc2x.js | 30s 轮询+系统通知 |
| e2eTaskMembershipProbes | `GJt` | 186170-186214 | 150040-150091 | WorkspaceShell.tsx | styles-CdEGpc2x.js | window.__testActions 探针 |
| CLOSE_ACTIVE_CONTEXT_EVENT | `r7` | 186215 | 150092 | WorkspaceShell.tsx | styles-CdEGpc2x.js | = 'zcode:close-active-context-request' |
| resolveCloseableSidePaneTab | `KJt` | 186216 | 150092 | WorkspaceShell.tsx | styles-CdEGpc2x.js |  |
| WorkspaceRoot | `XJt` | 186219-187019 | 150098-150859 | WorkspaceShell.tsx | styles-CdEGpc2x.js | ：状态机+装配 |
| MemoizedWorkspaceRoot | `Y4t` | 206773 | 164452 | WorkspaceShell.tsx | styles-CdEGpc2x.js | memo(XJt)，供远控壳挂载 |
| ScopedErrorFallback | `$Ot` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | p4 的呈现层（js ~129790+） |
| offPeakTaskChannel | `AAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 b |
| feedbackChannel | `BAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 u |
| TopBarOverlay | `BOt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js 129516） |
| recordArmsCustomEvent | `C8t` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 n |
| memoryChannel | `CAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 D |
| modelProviderChannel | `DAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 C |
| oauthChannel | `EAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 w |
| pluginsChannel | `FAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 h |
| useSubagentsStore | `Gn` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 来自 ; 导出别名 r; 子代理 store（__subagentsStoreE2E） |
| TerminalToggleButton | `H6` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js 143316） |
| promptAttachmentTransferChannel | `HAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 c |
| pluginManagementChannel | `IAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 m |
| RendererMessage | `Ib` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 St |
| useWhiteboardStore | `In` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 来自 ; 导出别名 o; 白板 store（__whiteboardStoreE2E） |
| WebRemoteMobileShell | `JPt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F17（js 141584 / jsx 117999 附近） |
| subagentsChannel | `LAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 p |
| skillSyncChannel | `MAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 v |
| DockTerminalBrowserPanel | `Mqt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F13 根（js 183602 / jsx 148118） |
| mcpSyncChannel | `NAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 _ |
| usageStatsChannel | `OAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 S |
| pluginSyncChannel | `PAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 g |
| ConversationOrchestrator | `PTt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F03 编排器（js 122803 / jsx 104572） |
| AppErrorFallback | `QOt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | ekt 的呈现层（js 129735 / jsx 109158） |
| commandsChannel | `RAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 f |
| FeedbackCenter | `RMe` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F09 根（js 39107 / jsx 35262） |
| QuickPick | `Rje` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F05 根（js 36439 / jsx 33404） |
| WindowsCaptionMenu | `S6` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js 141854） |
| hooksChannel | `SAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 O |
| registerBaseServices | `Sse` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 V |
| setRendererDeviceId | `T8t` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 t |
| fileWatcherChannel | `TAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 T |
| SessionHeader | `TFt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js 144008） |
| HelpMenu | `U6` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js 143345） |
| ServiceProxy | `Us` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 U |
| repoWikiChannel | `VAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 l |
| setPlatformBridge | `WOt` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 s |
| transportFrameLimits | `Wf` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 no |
| useSkillStore | `Yn` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 来自 ; 导出别名 t; 技能 store（__skillStoreE2E） |
| zcodeAgentChannel | `_Ae` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 j |
| registerE2EStoreBridges | `a` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 导出别名 registerE2EStoreBridges; |
| WorkspaceSelectionRow | `a4` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F02 副根（js 128568 / jsx 108415） |
| ProtocolClient | `ase` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 W |
| parseLaunchMarks | `ax` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 ct |
| zcodeSessionChannel | `bAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 A |
| windowsCaptionInsetStyle | `c4` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | / WINDOWS_CAPTION_RIGHT_INSET_VAR（TopBar.tsx） |
| fileChannel | `cAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 B |
| AutomationsMain | `d6` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F15 根（js 138823 / jsx 115911） |
| systemChannel | `dAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 L |
| DEFAULT_LOCALE | `e` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 Ps |
| AppProviders | `ekt` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 o |
| DesktopCommand | `ex` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 ft |
| terminalChannel | `fAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 I |
| ZCodeApp | `g8t` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 a |
| zcodeTaskChannel | `gAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 M |
| broadcastChannel | `hAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 N |
| MessagePortChannelClient | `ise` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 G |
| LAUNCH_MARKS_QUERY_PARAM | `ix` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 st |
| skillsChannel | `jAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 y |
| codingPlanSubscriptionChannel | `kAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 x |
| RepoWikiMain | `l3` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F16 根（js 132306 / jsx 111550） |
| gitChannel | `lAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 z |
| credentialChannel | `mAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 P |
| TaskFindDialog | `nPt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F05 副根（js 139949 / jsx 116646） |
| StackedConversationPane | `owt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F03 变体（js 121284 / jsx 103212） |
| settingChannel | `pAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 F |
| Sidebar | `rVt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F01 根（js 159137 / jsx 132075） |
| windowsCaptionInsetStyle | `s4` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | / WINDOWS_CAPTION_RIGHT_INSET_VAR（TopBar.tsx） |
| createRendererTelemetryContext | `tx` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 ut |
| gitCheckpointChannel | `uAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 R |
| isE2EStoreBridgeEnabled | `v` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 来自 ; 导出别名 K; 门控（window 存在 && 环境变量为 '1'） |
| UpdateStatusWindow | `v8t` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 i |
| outputStyleChannel | `wAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 E |
| playTaskNotificationSound | `x8t` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 r |
| botsChannel | `xAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 k |
| SidePanel | `xqt` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | F04 根（js 182519 / jsx 147333） |
| registerRemoteSession | `xse` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 H |
| useSessionStore | `yn` | — | — | e2eStoreBridgeBootstrap.tsx | e2eStoreBridgeBootstrap-DOKuAE2h.js | 来自 ; 导出别名 h; 会话 store（__zcodeSessionStoreE2E） |
| settingsSyncChannel | `zAe` | — | — | rendererEntry.tsx | index-ABImDspU.js | 来自 ; 导出别名 d |
| GitBranchChip | `zZ` | — | — | WorkspaceShell.tsx | styles-CdEGpc2x.js | （已抽取进 TopBar.tsx，js ~96589） |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`g` | 平台服务 / toast / close 图标 | ImeComposition.tsx |
| `$i`/`Vre`/`ta`/`Qi`/`Rre` | 快捷键 | keyboardShortcuts-BGHopxr9.js（外部） |
| `xe`/`Ae` + 11 字母选择器 | 任务 store / 工作区状态选择器群 | skillStore-BmeKHDBI.js（外部） |
| `A2`/`s2`/`Vo`/`yC`/`ko`/`pc`/`Ug` | 会话路由 / 分屏 / 搜索 / 反馈 / 设置 / tabs / MCP store | stores-session/core/workspace.tsx |
| `Boe` | useSidePaneState | SidePanel.tsx |
| `nge` | useGitRepository | GitReview.tsx |
| `rVt`/`a4`/`xqt`/`Mqt`/`PTt`/`l3`/`d6`/`Rje` | 侧栏 / 工作区行 / 侧面板 / dock / 编排器 / Wiki / 自动化 / 命令面板 | Sidebar / Home / SidePanel / TerminalPane / Conversation / ExtendedViews / QuickPick .tsx |
| `TFt`/`BOt`/`S6`/`U6`/`H6`/`zZ`/`c4`/`s4` | 顶栏族全套 | TopBar.tsx |
| `RMe` | FeedbackCenter（接口，B4） | F09 未抽取 |
| `Mi` testid / `oi` DesktopCommand | app-header 等 | src-HCld2afU.js（外部） |
| 入口（rendererEntry） | 34 通道描述符 / ZCodeApp / AppProviders / UpdateStatusWindow | styles-CdEGpc2x.js（经 index-ABImDspU.js 导入） |

## 10. GitReview

- 族登记：F04 Git 审查面（BWt 族）
- 产物：GitReview.tsx / GitReview.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| buildLastTurnChangeSummary | `Hhe` | 23726 | 20340 | GitReview.tsx | styles-CdEGpc2x.js | → 文件级增删统计 |
| isRemoteWorkspaceDescriptor | `Uhe` | 23760 | 20374 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isGitRpcEnabled | `bg` | 23764 | 20377 | GitReview.tsx | styles-CdEGpc2x.js |  |
| EMPTY_BRANCH_COMPARISON | `Whe` | 23767 | 20385 | GitReview.tsx | styles-CdEGpc2x.js |  |
| GIT_SOURCE_SECTION_ORDER | `Ghe` | 23768 | 20387 | GitReview.tsx | styles-CdEGpc2x.js |  |
| EMPTY_GIT_IDENTITY | `Khe` | 23773 | 20391 | GitReview.tsx | styles-CdEGpc2x.js |  |
| extractGitErrorMessage | `qhe` | 23774 | 20398 | GitReview.tsx | styles-CdEGpc2x.js |  |
| countSectionChanges | `xg` | 23782 | 20406 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveChangeKind | `Jhe` | 23785 | 20409 | GitReview.tsx | styles-CdEGpc2x.js |  |
| createEmptyGitSummary | `Yhe` | 23788 | 20412 | GitReview.tsx | styles-CdEGpc2x.js |  |
| createEmptyGitDataset | `Sg` | 23804 | 20428 | GitReview.tsx | styles-CdEGpc2x.js |  |
| createEmptyGitDatasets | `Xhe` | 23807 | 20437 | GitReview.tsx | styles-CdEGpc2x.js |  |
| buildGitSourceOptions | `Cg` | 23815 | 20445 | GitReview.tsx | styles-CdEGpc2x.js |  |
| attachDiff | `Zhe` | 23844 | 20485 | GitReview.tsx | styles-CdEGpc2x.js |  |
| groupChangesIntoSections | `Tg` | 23847 | 20491 | GitReview.tsx | styles-CdEGpc2x.js |  |
| buildGitDatasets | `Qhe` | 23862 | 20505 | GitReview.tsx | styles-CdEGpc2x.js |  |
| buildLastTurnChange | `$he` | 23876 | 20533 | GitReview.tsx | styles-CdEGpc2x.js |  |
| buildLastTurnDataset | `ege` | 23898 | 20549 | GitReview.tsx | styles-CdEGpc2x.js |  |
| shouldRefreshGitState | `tge` | 23910 | 20561 | GitReview.tsx | styles-CdEGpc2x.js |  |
| useGitRepository | `nge` | 23920 | 20564 | GitReview.tsx | styles-CdEGpc2x.js | git 仓库状态钩子 |
| codeCommentContextKey | `hXe` | 68246 | 60556 | GitReview.tsx | styles-CdEGpc2x.js |  |
| CodeCommentsChip | `TH` | 68250 | 60559 | GitReview.tsx | styles-CdEGpc2x.js | 「N 条评论」chip + 悬停列表 + 逐条移除 |
| CODE_COMMENT_ADD_TO_CHAT_EVENT | `EH` | 68362 | 60591 | GitReview.tsx | styles-CdEGpc2x.js | = `zcode:code-comment-add-to-chat` |
| CODE_COMMENT_REMOVE_FROM_CHAT_EVENT | `DH` | 68363 | 60592 | GitReview.tsx | styles-CdEGpc2x.js | = `zcode:code-comment-remove-from-chat` |
| CODE_COMMENT_REMOVE_BROADCAST_CHANNEL | `gXe` | 68364 | 60593 | GitReview.tsx | styles-CdEGpc2x.js | = `code-comment:remove-from-chat` |
| removedCommentScopes | `OH` | 68365 | 60594 | GitReview.tsx | styles-CdEGpc2x.js | （已回流评论集合） |
| commentWorkspaceKey | `kH` | 68367 | 60596 | GitReview.tsx | styles-CdEGpc2x.js |  |
| commentScopeKey | `AH` | 68371 | 60599 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isCommentScopePayload | `MH` | 68398 | 60616 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isCommentAttachmentPayload | `NH` | 68409 | 60620 | GitReview.tsx | styles-CdEGpc2x.js |  |
| serializeCodeComment | `xXe` | 68427 | 60623 | GitReview.tsx | styles-CdEGpc2x.js | 「## Comment」块 |
| serializeCodeCommentsBlock | `SXe` | 68431 | 60627 | GitReview.tsx | styles-CdEGpc2x.js | 「# Code comments:」总块 |
| appendCodeCommentsToContent | `CXe` | 68438 | 60631 | GitReview.tsx | styles-CdEGpc2x.js |  |
| fileBasename | `wXe` | 68451 | 60638 | GitReview.tsx | styles-CdEGpc2x.js |  |
| parseLineRange | `TXe` | 68454 | 60641 | GitReview.tsx | styles-CdEGpc2x.js | 「L3-L7」→ {startLine,endLine} |
| parseCodeCommentBlock | `EXe` | 68465 | 60652 | GitReview.tsx | styles-CdEGpc2x.js |  |
| splitCodeCommentAttachments | `DXe` | 68488 | 60680 | GitReview.tsx | styles-CdEGpc2x.js | （发送内容 → 可见文本 + 评论附件） |
| dispatchCodeCommentAddToChat | `OXe` | 68503 | 60700 | GitReview.tsx | styles-CdEGpc2x.js | （cancelable，可被拦截） |
| dispatchCodeCommentRemoveFromChat | `kXe` | 68507 | 60707 | GitReview.tsx | styles-CdEGpc2x.js |  |
| useCodeCommentsStore | `FH` | 68514 | 60720 | GitReview.tsx | styles-CdEGpc2x.js | commentsByBucketKey 行级评论 store |
| removeCodeCommentAndBroadcast | `jXe` | 68580 | 60796 | GitReview.tsx | styles-CdEGpc2x.js | （跨窗口广播移除） |
| countContextAttachments | `GH` | 68778 | 60964 | GitReview.tsx | styles-CdEGpc2x.js |  |
| buildOutboundContentWithAttachments | `GXe` | 68787 | 60967 | GitReview.tsx | styles-CdEGpc2x.js |  |
| parseDraftContentIntoAttachments | `KXe` | 68792 | 60970 | GitReview.tsx | styles-CdEGpc2x.js |  |
| newCodeCommentId | `qXe` | 68804 | 60983 | GitReview.tsx | styles-CdEGpc2x.js |  |
| codeCommentIdentityKey | `KH` | 68809 | 60986 | GitReview.tsx | styles-CdEGpc2x.js |  |
| useCodeCommentContexts | `JXe` | 68812 | 60989 | GitReview.tsx | styles-CdEGpc2x.js | composer 侧事件桥钩子 |
| mapChangeFilesToRows | `NZ` | 95017 | 83023 | GitReview.tsx | styles-CdEGpc2x.js |  |
| summarizeFileRows | `Est` | 95047 | 83047 | GitReview.tsx | styles-CdEGpc2x.js | fileCount/totalAdded/totalRemoved |
| hasGitIdentity | `PZ` | 95076 | 83075 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isGitActionAvailable | `mct` | 96895 | 84265 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolvePrimaryGitAction | `hct` | 96898 | 84268 | GitReview.tsx | styles-CdEGpc2x.js | commit ∥ push |
| isPushEnabled | `gct` | 96905 | 84271 | GitReview.tsx | styles-CdEGpc2x.js |  |
| normalizeStagePath | `BZ` | 96909 | 84274 | GitReview.tsx | styles-CdEGpc2x.js |  |
| normalizeDirPath | `_ct` | 96916 | 84280 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveWorkspaceInRepoPath | `vct` | 96919 | 84283 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveRelativeSubpath | `yct` | 96923 | 84287 | GitReview.tsx | styles-CdEGpc2x.js |  |
| addStagePath | `VZ` | 96934 | 84297 | GitReview.tsx | styles-CdEGpc2x.js |  |
| collectSessionStagePaths | `bct` | 96939 | 84302 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isFileInSessionPaths | `xct` | 96951 | 84313 | GitReview.tsx | styles-CdEGpc2x.js |  |
| parseActiveTaskChangeSummaryPaths | `Sct` | 96956 | 84316 | GitReview.tsx | styles-CdEGpc2x.js |  |
| filterFilesBySessionPaths | `Cct` | 96962 | 84320 | GitReview.tsx | styles-CdEGpc2x.js |  |
| GIT_ACTION_IDS | `wct` | 96966 | 84324 | GitReview.tsx | styles-CdEGpc2x.js | = [commit, commitAndPush, push] |
| COMMIT_MESSAGE_INPUT_ID | `HZ` | 96967 | 84325 | GitReview.tsx | styles-CdEGpc2x.js | = `git-action-menu-commit-message` |
| testid | `Act` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `Dct` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `Ect` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `Oct` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `Tct` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `jct` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| testid | `kct` | 96968 | 84326 | GitReview.tsx | styles-CdEGpc2x.js | （`git-action-trigger` 等） |
| gitActionItemId | `Mct` | 96975 | 84333 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isGitActionId | `Nct` | 96978 | 84336 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isCommitMessageTextarea | `Pct` | 96981 | 84339 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveCommitSelection | `UZ` | 96984 | 84346 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveCommitStagePaths | `WZ` | 96987 | 84349 | GitReview.tsx | styles-CdEGpc2x.js |  |
| GitActionMenuItem | `Fct` | 96990 | 84352 | GitReview.tsx | styles-CdEGpc2x.js | cmdk 动作项（图标+文案+快捷键） |
| GitCommitDialog | `Ict` | 97012 | 84376 | GitReview.tsx | styles-CdEGpc2x.js | （AI 生成消息/含未暂存/三动作） |
| GitPushDialog | `Lct` | 97355 | 84555 | GitReview.tsx | styles-CdEGpc2x.js | （ahead/behind/upstream/错误复制） |
| GitActionMenu | `Rct` | 97609 | 84647 | GitReview.tsx | styles-CdEGpc2x.js | /推送入口（header 与 status-row 双布局） |
| SUMMARY_SECTION_SCROLL_CLASS | `flt` | 98270 | 85232 | GitReview.tsx | styles-CdEGpc2x.js |  |
| SummarySectionHeader | `plt` | 98278 | 85240 | GitReview.tsx | styles-CdEGpc2x.js | （⌄ 折叠 + trailing） |
| SummarySection | `XZ` | 98313 | 85250 | GitReview.tsx | styles-CdEGpc2x.js | （Collapsible + 滚动限高） |
| SummaryGitSection | `mlt` | 98354 | 85281 | GitReview.tsx | styles-CdEGpc2x.js | 「Git 工具」段：更改行 + 分支 chip + 提交/推送 |
| formatRewindSkipReason | `y_t` | 110586 | 94563 | GitReview.tsx | styles-CdEGpc2x.js | reason → rewindDialog.reason.* |
| RewindDialogFileList | `f1` | 110599 | 94577 | GitReview.tsx | styles-CdEGpc2x.js | （路径 + 原因/修改次数） |
| FileRewindDialog | `b_t` | 110632 | 94590 | GitReview.tsx | styles-CdEGpc2x.js | （fileRewind / editConflict 双变体） |
| buildUnifiedPatch | `x_t` | 110785 | 94650 | GitReview.tsx | styles-CdEGpc2x.js | hunks → unified patch 文本 |
| openFileChangePatchInCodeViewer | `p1` | 110793 | 94657 | GitReview.tsx | styles-CdEGpc2x.js | （「审查」按钮落点） |
| resolveProviderConfigOpenPath | `nFt` | 142059 | 117973 | GitReview.tsx | styles-CdEGpc2x.js | （不存在时退到父目录） |
| useTaskFileActions | `C6` | 142068 | 117982 | GitReview.tsx | styles-CdEGpc2x.js | /日志/供应商配置 路径+复制+打开 |
| isMacUserAgent | `rFt` | 142169 | 118091 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isWindowsUserAgent | `iFt` | 142172 | 118094 | GitReview.tsx | styles-CdEGpc2x.js |  |
| resolveFileManagerLabel | `aFt` | 142175 | 118097 | GitReview.tsx | styles-CdEGpc2x.js | finder/explorer/file-manager 三态 |
| DIFF_RICH_CONTENT_CHAR_LIMIT | `CWt` | 178296 | 144565 | GitReview.tsx | styles-CdEGpc2x.js | =180000 / DIFF_RICH_LINE_LIMIT=1200 |
| DIFF_RICH_CONTENT_CHAR_LIMIT | `wWt` | 178296 | 144565 | GitReview.tsx | styles-CdEGpc2x.js | =180000 / DIFF_RICH_LINE_LIMIT=1200 |
| resolveGitSourceI18nId | `TWt` | 178298 | 144567 | GitReview.tsx | styles-CdEGpc2x.js | → git.source.* |
| resolveDiffUnavailableI18nId | `EWt` | 178312 | 144581 | GitReview.tsx | styles-CdEGpc2x.js |  |
| diffCacheKey | `y5` | 178322 | 144591 | GitReview.tsx | styles-CdEGpc2x.js | `${sourceId}:${path}` |
| extractErrorMessage | `DWt` | 178325 | 144594 | GitReview.tsx | styles-CdEGpc2x.js |  |
| countTextLines | `OWt` | 178333 | 144602 | GitReview.tsx | styles-CdEGpc2x.js |  |
| isDiffTooLargeForRichRendering | `kWt` | 178340 | 144609 | GitReview.tsx | styles-CdEGpc2x.js | （>180KB 或 >1200 行） |
| resolveDiffRenderMode | `AWt` | 178347 | 144612 | GitReview.tsx | styles-CdEGpc2x.js | rich / plain-text / patch |
| tryExtractPlainTextDiffLines | `jWt` | 178355 | 144632 | GitReview.tsx | styles-CdEGpc2x.js |  |
| findDiffHeaderPath | `MWt` | 178363 | 144640 | GitReview.tsx | styles-CdEGpc2x.js |  |
| GitChangeRow | `NWt` | 178371 | 144648 | GitReview.tsx | styles-CdEGpc2x.js | （粘性头+上下文菜单+diff 三态渲染） |
| PlainTextDiffPreview | `PWt` | 178541 | 144701 | GitReview.tsx | styles-CdEGpc2x.js | diff 轻量预览 |
| normalizeFindQuery | `FWt` | 178548 | 144711 | GitReview.tsx | styles-CdEGpc2x.js |  |
| countOccurrences | `IWt` | 178551 | 144714 | GitReview.tsx | styles-CdEGpc2x.js |  |
| computeFileChangeFindMatches | `LWt` | 178563 | 144726 | GitReview.tsx | styles-CdEGpc2x.js | （全文件匹配序列） |
| GIT_CHANGE_ROW_ESTIMATE_PX | `RWt` | 178581 | 144746 | GitReview.tsx | styles-CdEGpc2x.js | =32 / GIT_CHANGE_LIST_OVERSCAN=14 |
| GIT_CHANGE_ROW_ESTIMATE_PX | `zWt` | 178581 | 144746 | GitReview.tsx | styles-CdEGpc2x.js | =32 / GIT_CHANGE_LIST_OVERSCAN=14 |
| GitChangesPanel | `BWt` | 178584 | 144748 | GitReview.tsx | styles-CdEGpc2x.js | pane 主体 |
| extractErrorMessage | `MC` | — | — | GitReview.tsx | styles-CdEGpc2x.js | （横切，js 37603 / jsx 34228，反馈域定义，此处声明引用） |
| isCommentRemovedFromChat | `_Xe` | — | — | GitReview.tsx | styles-CdEGpc2x.js | / markCommentRemovedFromChat / unmark… (68373,68376,68379 / 60601,60603,60605) |
| isAddToChatEvent | `bXe` | — | — | GitReview.tsx | styles-CdEGpc2x.js | / isRemoveFromChatEvent (68382,68390 / 60610,60613) |
| isCommentRemovedFromChat | `jH` | — | — | GitReview.tsx | styles-CdEGpc2x.js | / markCommentRemovedFromChat / unmark… (68373,68376,68379 / 60601,60603,60605) |
| isCommentRemovedFromChat | `vXe` | — | — | GitReview.tsx | styles-CdEGpc2x.js | / markCommentRemovedFromChat / unmark… (68373,68376,68379 / 60601,60603,60605) |
| createInitialGitPaneState | `wg` | — | — | GitReview.tsx | styles-CdEGpc2x.js | (23829 / 20428 附近 / 9524) |
| isAddToChatEvent | `yXe` | — | — | GitReview.tsx | styles-CdEGpc2x.js | / isRemoveFromChatEvent (68382,68390 / 60610,60613) |
| resolveRepoRelativePath | `yg` | — | — | GitReview.tsx | styles-CdEGpc2x.js | (23717 / 10296 附近) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`j`/`M`/`g`/`f` | 平台服务 / toast / Textarea / spinner / x / sparkles | ImeComposition.tsx |
| `Ia`/`Na/Oa/Ma/ka`/`wa` | Tooltip / Popover / chevron-right | usageStatsUiParts-CiR7YEhh.js + button.tsx |
| `$i`/`ta` | shortcutLabel / 键匹配 | keyboardShortcuts-BGHopxr9.js（外部） |
| `Ae` | zustand create | skillStore-BmeKHDBI.js（外部） |
| `to` | useVirtualizer | esm-BY6T6pIH.js（外部） |
| `FH` | CodeCommentsStore | stores-workspace.tsx |
| `C6` | useTaskFileActions | TopBar.tsx |
| `zZ` | GitBranchChip | TopBar.tsx |
| `S_t` | TurnFileChangesSummary | Conversation.tsx |
| `Xr`/`nr`/testid | diff 行计数 / git-pane testid | src-HCld2afU.js（外部） |
| Dialog/Select/ContextMenu/Collapsible/cmdk 原语 | — | styles 本 chunk 横切层 |

## 11. Terminal

- 族登记：F13 DockTerminalBrowserFamily · 终端侧
- 产物：TerminalPane.tsx / TermBrowser.report.md
- 来源：styles-CdEGpc2x.js（xterm 库体 162010–175264 vendored 不还原）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| createPendingInput | `FHt` | 175265 | — | TerminalPane.tsx | styles-CdEGpc2x.js | pending 输入对象 |
| isPrintableOnly | `l5` | 175268 | — | TerminalPane.tsx | styles-CdEGpc2x.js | DEL |
| stripControlChars | `u5` | 175273 | — | TerminalPane.tsx | styles-CdEGpc2x.js | ESC→null，否则滤控制字符 |
| resolveImeCommitText | `IHt` | 175282 | — | TerminalPane.tsx | styles-CdEGpc2x.js | imeCommit→净化文本；text→原样校验 |
| recordKeydownCandidate | `LHt` | 175290 | — | TerminalPane.tsx | styles-CdEGpc2x.js | Enter/Process→imeCommit 候选；单键→text |
| consumeTrackedText | `RHt` | 175295 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| appendImeCandidate | `zHt` | 175305 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| appendRecentData | `BHt` | 175325 | — | TerminalPane.tsx | styles-CdEGpc2x.js | onData 记录 |
| matchPendingAgainstHistory | `VHt` | 175342 | — | TerminalPane.tsx | styles-CdEGpc2x.js | input 事件与历史配对→handled |
| decideTextareaFlush | `HHt` | 175357 | — | TerminalPane.tsx | styles-CdEGpc2x.js | shouldWrite/shouldClearTextarea |
| ESC | `GHt` | 175365 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / SGR 正则 / 光标归位正则 / 黑底提示正则 |
| ESC | `UHt` | 175365 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / SGR 正则 / 光标归位正则 / 黑底提示正则 |
| ESC | `WHt` | 175365 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / SGR 正则 / 光标归位正则 / 黑底提示正则 |
| ESC | `d5` | 175365 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / SGR 正则 / 光标归位正则 / 黑底提示正则 |
| rewriteBlackBackgroundToDefault | `qHt` | 175376 | — | TerminalPane.tsx | styles-CdEGpc2x.js | SGR 40→49 |
| fixPowerShellPromptColors | `JHt` | 175383 | — | TerminalPane.tsx | styles-CdEGpc2x.js | +光标归位+黑底→重写 |
| http(s)正则 | `XHt` | 175392 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / 尾随标点 / 闭合括号表 |
| http(s)正则 | `YHt` | 175392 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / 尾随标点 / 闭合括号表 |
| http(s)正则 | `ZHt` | 175392 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / 尾随标点 / 闭合括号表 |
| extractUrlMatches | `eUt` | 175410 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| extractBufferLinks | `aUt` | 175448 | — | TerminalPane.tsx | styles-CdEGpc2x.js | URL→ILinkProvider 链接（underline+pointer） |
| 共享 span/canvas 探针 | `f5` | 175472 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| 共享 span/canvas 探针 | `p5` | 175472 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| colorToRgba | `sUt` | 175480 | — | TerminalPane.tsx | styles-CdEGpc2x.js | CSS 色→rgba()（canvas 读像素） |
| TERMINAL_THEME_CSS_VARS | `cUt` | 175494 | — | TerminalPane.tsx | styles-CdEGpc2x.js | 18 槽 --color-terminal-* + 缺省值 |
| buildTerminalThemeFromCssVars | `lUt` | 175517 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| stripCoreColors | `uUt` | 175522 | — | TerminalPane.tsx | styles-CdEGpc2x.js | background/foreground/cursor/cursorAccent |
| mergeTerminalTheme | `m5` | 175533 | — | TerminalPane.tsx | styles-CdEGpc2x.js | CSS 变量主题 + 自定义调色（自定义仅覆盖 16 色） |
| TERMINAL_FONT_STACK | `dUt` | 175537 | — | TerminalPane.tsx | styles-CdEGpc2x.js | ui-monospace…'MesloLGS NF','Hack Nerd Font' |
| 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush | `fUt` | 175539 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush | `h5` | 175539 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush | `mUt` | 175539 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush | `pUt` | 175539 | — | TerminalPane.tsx | styles-CdEGpc2x.js |  |
| normalizeWindowsPty | `hUt` | 175543 | — | TerminalPane.tsx | styles-CdEGpc2x.js | {backend,buildNumber?} |
| clampTerminalFontSize | `gUt` | 175548 | — | TerminalPane.tsx | styles-CdEGpc2x.js | 6–72 之外→undefined |
| isHttpUrl | `vUt` | 175557 | — | TerminalPane.tsx | styles-CdEGpc2x.js | ^https?:// |
| XtermTerminalPane | `yUt` | 175561 | 142320 | TerminalPane.tsx | styles-CdEGpc2x.js | xterm 宿主（单会话完整生命周期） |
| TerminalPanel | `bUt` | 175976 | 142668 | TerminalPane.tsx | styles-CdEGpc2x.js | （SidePanel `terminal` 标签内容） |
| createTerminalSession | `Sqt` | 183257 | 147830 | TerminalPane.tsx | styles-CdEGpc2x.js | {id:uid,workspaceKey,services,cwd,index,shellLabel:null} |
| createInitialTerminalState | `Cqt` | 183267 | — | TerminalPane.tsx | styles-CdEGpc2x.js | +工作区 |
| nextFreeSessionIndex | `wqt` | 183271 | — | TerminalPane.tsx | styles-CdEGpc2x.js | index |
| formatSessionTitle | `Tqt` | 183278 | — | TerminalPane.tsx | styles-CdEGpc2x.js | index==1→原名，否则「原名 N」 |
| removeSession | `Dqt` | 183290 | — | TerminalPane.tsx | styles-CdEGpc2x.js | activeSessionId（左邻回退） |
| removeExitedSession | `Oqt` | 183311 | — | TerminalPane.tsx | styles-CdEGpc2x.js | →close-panel |
| ensureWorkspaceSession | `kqt` | 183323 | — | TerminalPane.tsx | styles-CdEGpc2x.js | →补首会话 |
| TerminalTabChip | `Aqt` | 183331 | 147889 | TerminalPane.tsx | styles-CdEGpc2x.js | chip（active !bg-selected 风格，悬停显关闭） |
| TerminalDockPanel | `jqt` | 183364 | 147904 | TerminalPane.tsx | styles-CdEGpc2x.js | dock（标题/shellLabel chip/标签行/新建/关闭） |
| TerminalDock | `Mqt` | 183602 | 148118 | TerminalPane.tsx | styles-CdEGpc2x.js | dock 外壳（Z4 id=terminal 140px–50% + 拖拽把手 + 错误边界） |
| DOCK_TRANSITION_CLASSES | `Nqt` | 183695 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / 240ms |
| DOCK_TRANSITION_CLASSES | `Pqt` | 183695 | — | TerminalPane.tsx | styles-CdEGpc2x.js | / 240ms |
| useDockPanelController | `Iqt` | 183711 | — | TerminalPane.tsx | styles-CdEGpc2x.js | panelRef/elementRef/isVisible + 折叠/展开/尺寸记忆 |
| countChar | `$Ht` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | / trimBalancedUrl（括号配平+尾标点剥离）(175397,175402) |
| resolveCloseAction | `Eqt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | none |
| armFlexGrowTransition | `Fqt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | transitionend |
| isPowerShellPath | `KHt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | 路径尾段 powershell |
| countChar | `QHt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | / trimBalancedUrl（括号配平+尾标点剥离）(175397,175402) |
| resolveShellLabel | `_Ut` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | powershell |
| expandWrappedLineRange | `iUt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | /buildLogicalLine（isWrapped 双向扩行）(175431,175438) |
| appendCellText | `nUt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | /appendLineCells（宽字符 getWidth()==0 跳过）(175419,175424) |
| readCssVar | `oUt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | getPropertyValue |
| PowerShell | `pwsh` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | ，否则 basename (175551) |
| expandWrappedLineRange | `rUt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | /buildLogicalLine（isWrapped 双向扩行）(175431,175438) |
| appendCellText | `tUt` | — | — | TerminalPane.tsx | styles-CdEGpc2x.js | /appendLineCells（宽字符 getWidth()==0 跳过）(175419,175424) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`G`/`J` | cn / Button / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `P`/`m` | Input / toast | ImeComposition.tsx |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `Ae` | zustand create | skillStore-BmeKHDBI.js（外部） |
| `nn`/`Qe`/`di`/`fre`/`ete`/`xi` | testid / 地址输入 / viewport 限 / WheelBoundary 通道 / restore URL / uid | src-HCld2afU.js（外部） |
| xterm（`nHt='3.7.8'`） | 终端模拟器 | styles 本 chunk 162010–175264（vendored，以 XtermModule 接口挂接；OSC52 addon `OHt` 为应用级已重建） |
| Tabs / ContextMenu / Select / Popover 封装 | — | styles 本 chunk 横切层 |

## 12. Browser

- 族登记：F13 DockTerminalBrowserFamily · 浏览器侧
- 产物：BrowserPane.tsx / TermBrowser.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| EDGE_HANDLES | `IUt` | 4 | — | BrowserPane.tsx | styles-CdEGpc2x.js | /CORNER_HANDLES 把手几何+testid (176734,176770) |
| EDGE_HANDLES | `LUt` | 4 | — | BrowserPane.tsx | styles-CdEGpc2x.js | /CORNER_HANDLES 把手几何+testid (176734,176770) |
| ELEMENT_PICKER_LIMITS | `xUt` | 175990 | — | BrowserPane.tsx | styles-CdEGpc2x.js | {maxTextChars:4000,maxHtmlChars:6000,maxAttributeChars:500,labels} |
| injectableElementPickerScript | `SUt` | 175996 | — | BrowserPane.tsx | styles-CdEGpc2x.js | overlay+tooltip+选择 Promise（纯函数，toString 序列化） |
| serializeElementPicker | `CUt` | 176424 | — | BrowserPane.tsx | styles-CdEGpc2x.js | `(${SUt.toString()})(${JSON.stringify(opts)})` |
| cancelPickerScript | `wUt` | 176428 | — | BrowserPane.tsx | styles-CdEGpc2x.js | picker 的 IIFE |
| attachWorkspaceToPickedElement | `EUt` | 176443 | — | BrowserPane.tsx | styles-CdEGpc2x.js | +BH 校验 |
| originPathOfUrl | `DUt` | 176453 | — | BrowserPane.tsx | styles-CdEGpc2x.js | origin+pathname，失败→?# 前 |
| useWebElementPicker | `OUt` | 176461 | — | BrowserPane.tsx | styles-CdEGpc2x.js | isPicking/start/cancel/toggle + Esc 全局监听 + 卸载取消 |
| BrowserToolbar | `kUt` | 176539 | 143153 | BrowserPane.tsx | styles-CdEGpc2x.js | form h-12：back/forward/reload/地址/responsive/picker/⋯ |
| BrowserMoreMenu | `AUt` | 176611 | — | BrowserPane.tsx | styles-CdEGpc2x.js | ⋯ → openExternal / devtools 两项 |
| ToolbarIconButton | `g5` | 176688 | 143256 | BrowserPane.tsx | styles-CdEGpc2x.js | Tooltip+Button icon-md，active→secondary+aria-pressed |
| ZOOM_OPTIONS | `MUt` | 176711 | — | BrowserPane.tsx | styles-CdEGpc2x.js | [fit,50,75,100,125,150,200] |
| resolveVisualScale | `NUt` | 176713 | — | BrowserPane.tsx | styles-CdEGpc2x.js | fit→min(1,(w-32)*zf/vw,(h-32)*zf/vh) |
| resolveTransformScale | `PUt` | 176721 | — | BrowserPane.tsx | styles-CdEGpc2x.js | visual/desktopZoom |
| resolveDesktopLayoutScale | `FUt` | 176724 | — | BrowserPane.tsx | styles-CdEGpc2x.js | zf>1→{1,1}；zf<1→{1/zf,zf} |
| EDGE_ICON_CLASS | `RUt` | 176801 | — | BrowserPane.tsx | styles-CdEGpc2x.js | group-hover 显现的把手图标类 |
| ResponsiveResizeHandles | `zUt` | 176802 | 143360 | BrowserPane.tsx | styles-CdEGpc2x.js | 4 边 separator(role/aria-valuenow/键盘)+4 角 |
| DEFAULT_VIEWPORT | `BUt` | 176864 | — | BrowserPane.tsx | styles-CdEGpc2x.js | {width:393,height:852} |
| ResponsiveViewportCanvas | `UUt` | 176876 | 143400 | BrowserPane.tsx | styles-CdEGpc2x.js | +scale 变换+fit 重测 RO+blur 结束拖拽 |
| BrowserSurface | `WUt` | 177082 | 143564 | BrowserPane.tsx | styles-CdEGpc2x.js | resize 弱提示条 + UUt + webview（compositor/layout/transform scale data-*） |
| ResponsiveToolbar | `qUt` | 177186 | 143620 | BrowserPane.tsx | styles-CdEGpc2x.js | W×H 输入（Popover 报错）+ zoom Select |
| useFutureTimestamp | `JUt` | 177344 | — | BrowserPane.tsx | styles-CdEGpc2x.js | true |
| 3000/300/100/500 弱提示时序 | `QUt` | 177358 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| 3000/300/100/500 弱提示时序 | `XUt` | 177358 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| 3000/300/100/500 弱提示时序 | `YUt` | 177358 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| 3000/300/100/500 弱提示时序 | `ZUt` | 177358 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| useBrowserResizeWarning | `$Ut` | 177364 | 143741 | BrowserPane.tsx | styles-CdEGpc2x.js | agent 操作期 ResizeObserver 尺寸变化→3s 弱提示 |
| 0.001/100ms/2500ms | `nWt` | 177464 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| 0.001/100ms/2500ms | `rWt` | 177464 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| 0.001/100ms/2500ms | `tWt` | 177464 | — | BrowserPane.tsx | styles-CdEGpc2x.js |  |
| useScreenshotSurfaceStabilizer | `cWt` | 177484 | — | BrowserPane.tsx | styles-CdEGpc2x.js | guest 对齐+scale 稳定双帧→surfaceReady 上报 |
| useDesktopZoomFactor | `hWt` | 177625 | — | BrowserPane.tsx | styles-CdEGpc2x.js | getDesktopZoomLevel+onDesktopZoomLevelChanged |
| useResponsiveModeController | `gWt` | 177644 | 144000 | BrowserPane.tsx | styles-CdEGpc2x.js | /viewport 双向同步（browserViewUpdateViewport/onBrowserViewViewportChanged） |
| BrowserView | `_Wt` | 177724 | 144066 | BrowserPane.tsx | styles-CdEGpc2x.js | ：工具栏+响应式条+surface；webview 事件全集；崩溃重建；residency 上报 |
| BrowserUseView | `vWt` | 178191 | 144506 | BrowserPane.tsx | styles-CdEGpc2x.js | TabsContent forceMount 包装（inert/hidden 三态 + screenshot data-state） |
| useScreenshotSurfaceRequest | `SWt` | 178264 | — | BrowserPane.tsx | styles-CdEGpc2x.js | onBrowserViewScreenshotSurfacePrepare/Release |
| isValidDimension | `GUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /dimensionLimits (177169,177178) |
| clampInt | `HUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /clampViewport (176867,176870) |
| isValidDimension | `KUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /dimensionLimits (177169,177178) |
| isPickerResult | `TUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | cancelled |
| clampInt | `VUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /clampViewport (176867,176870) |
| layoutScaleFromDataset | `aWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /responsiveScaleFromAncestor (177467,177471) |
| tabMatch | `bWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /requestMatch/findBrowserUseTab (178241,178251,178260) |
| 1.1/-3/5；mWt → 1.1^clamp | `dWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | (round(level),-3,5) (177617,177621) |
| roundSize | `eWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /sizesEqual(±1) (177456,177461) |
| 1.1/-3/5；mWt → 1.1^clamp | `fWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | (round(level),-3,5) (177617,177621) |
| layoutScaleFromDataset | `iWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /responsiveScaleFromAncestor (177467,177471) |
| BrowserEmptyState | `jUt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | globe |
| wheelDelta | `lWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /guestWheelScrollCanvas（ipc-message WheelBoundary 续接画布滚动）(177592,177596) |
| surfaceSnapshotEqual | `oWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /measureWebviewViewport (177474,177478) |
| 1.1/-3/5；mWt → 1.1^clamp | `pWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | (round(level),-3,5) (177617,177621) |
| surfaceSnapshotEqual | `sWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /measureWebviewViewport (177474,177478) |
| wheelDelta | `uWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /guestWheelScrollCanvas（ipc-message WheelBoundary 续接画布滚动）(177592,177596) |
| roundSize | `v5` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /sizesEqual(±1) (177456,177461) |
| tabMatch | `xWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /requestMatch/findBrowserUseTab (178241,178251,178260) |
| tabMatch | `yWt` | — | — | BrowserPane.tsx | styles-CdEGpc2x.js | /requestMatch/findBrowserUseTab (178241,178251,178260) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`G`/`J` | cn / Button / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `P`/`m` | Input / toast | ImeComposition.tsx |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `di`/`fre`/`ete` | viewport 限 / WheelBoundary / restore URL | src-HCld2afU.js（外部） |
| `vA/gVe/_Ve/vVe/yVe/yA/xVe/SA/MVe/TA` | URL/状态助手（浏览器域横切 50712–50860） | styles 本 chunk |
| Tabs / Select / Popover 封装 | — | styles 本 chunk 横切层 |
| `pqt` | SuspendedBrowserTabPlaceholder | SidePanel.tsx（互引不重复） |

## 13. CodeViewer

- 族登记：F14 CodeViewerFamily
- 产物：CodeViewer.tsx / TermBrowser.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| MarkdownPreviewView | `U8` | 160323 | — | CodeViewer.tsx | styles-CdEGpc2x.js | cj 渲染 markdown 内容 |
| CodeViewDispatcher | `iVt` | 160344 | 132789 | CodeViewer.tsx | styles-CdEGpc2x.js | →BO，否则 MO（高亮+评论+gutter） |
| CHECKERBOARD_BG_CLASS | `aVt` | 160393 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| imageScaleFromFilename | `oVt` | 160396 | — | CodeViewer.tsx | styles-CdEGpc2x.js | @2x 后缀解析 |
| ImageView | `sVt` | 160404 | 132816 | CodeViewer.tsx | styles-CdEGpc2x.js | ×@Nx 缩放 / fitToContainer |
| SvgView | `cVt` | 160424 | — | CodeViewer.tsx | styles-CdEGpc2x.js | svg 文本→data-url 复用 ImageView |
| PatchPreview | `vVt` | 160578 | — | CodeViewer.tsx | styles-CdEGpc2x.js | patch→纯文本行(Oft) 或 W8 |
| LazyDocx | `bVt` | 160607–160636 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| LazyLegacyDoc | `xVt` | 160607–160636 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| LazyXlsx | `yVt` | 160607–160636 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| OfficePreviewErrorBoundary | `SVt` | 160633 | — | CodeViewer.tsx | styles-CdEGpc2x.js | （resetKey 复位） |
| CodeViewerContentDispatcher | `DVt` | 160699 | 133073 | CodeViewer.tsx | styles-CdEGpc2x.js | +加载/错误/二进制/空态 |
| SCROLL_FADE_MASKS | `NVt` | 160966 | — | CodeViewer.tsx | styles-CdEGpc2x.js | none/left/right/both 渐隐遮罩 |
| SKELETON_ROW_WIDTHS | `PVt` | 160970 | — | CodeViewer.tsx | styles-CdEGpc2x.js | 12 行骨架宽度% |
| splitPath | `FVt` | 160973–160986 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /isMarkdownSource/isSvgSource/md 扩展/svg 扩展 |
| splitPath | `J8` | 160973–160986 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /isMarkdownSource/isSvgSource/md 扩展/svg 扩展 |
| splitPath | `Y8` | 160973–160986 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /isMarkdownSource/isSvgSource/md 扩展/svg 扩展 |
| splitPath | `Z8` | 160973–160986 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /isMarkdownSource/isSvgSource/md 扩展/svg 扩展 |
| splitPath | `q8` | 160973–160986 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /isMarkdownSource/isSvgSource/md 扩展/svg 扩展 |
| pptx | `IVt` | 160994–161014 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /too-large 判/错误文案绝对路径相对化/总解析 |
| pptx | `LVt` | 160994–161014 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /too-large 判/错误文案绝对路径相对化/总解析 |
| pptx | `RVt` | 160994–161014 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /too-large 判/错误文案绝对路径相对化/总解析 |
| pptx | `zVt` | 160994–161014 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /too-large 判/错误文案绝对路径相对化/总解析 |
| imageMediaTypeOf | `HVt` | 161027 | — | CodeViewer.tsx | styles-CdEGpc2x.js | mime≠svg 才作图片 |
| HeavyContentDeferredPlaceholder | `qVt` | 161038 | — | CodeViewer.tsx | styles-CdEGpc2x.js | 12 行 |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `$Vt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `JVt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `QVt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `XVt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `YVt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| 图片/PDF/PPTX 投影/重预览判/纯代码判/更多菜单能力 | `ZVt` | 161064–161114 | — | CodeViewer.tsx | styles-CdEGpc2x.js |  |
| resolveBreadcrumb | `eHt` | 161111 | — | CodeViewer.tsx | styles-CdEGpc2x.js | /外绝对 |
| CodeViewerPanel | `tHt` | 161141 | 133444 | CodeViewer.tsx | styles-CdEGpc2x.js | aside data-testid=preview-pane |
| scrollSnapshot | `BVt/VVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /resolveFilePreviewState（isBinary |
| OfficePending | `CVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /Error/Dispatcher（excel/docx/legacy 三分派）(160654,160663,160670) |
| isSvgPath | `EVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /resolveErrorColor（fileMissing→destructive）(160696,160700) |
| useCodeCommentsStore | `FH` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | getComments/addComment/removeComment/removeCommentBySource/restore/clearSource |
| isSvgPath | `G8` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /resolveErrorColor（fileMissing→destructive）(160696,160700) |
| 256KB/2MB/64MB/pptx-too-large | `GVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | (161032,161033,161036) |
| 256KB/2MB/64MB/pptx-too-large | `KVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | (161032,161033,161036) |
| workspaceKeyOf | `PH` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /bucketKeyOf（`${ws}\0${path}`）(68508,68511) |
| OfficePending | `TVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /Error/Dispatcher（excel/docx/legacy 三分派）(160654,160663,160670) |
| 256KB/2MB/64MB/pptx-too-large | `UVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | (161032,161033,161036) |
| DIFF_UNSAFE_CSS | `W8` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | =''/DiffViewerImpl/DiffViewer(memo)（vendored diff 封装）(160478,160479,160541) |
| 256KB/2MB/64MB/pptx-too-large | `WVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | (161032,161033,161036) |
| isEnoentError | `X8` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | code |
| isPatchSource | `_Vt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /rest-props 透传助手 (160543,160546,160561) |
| LazyPptxViewer | `dVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /PptxPreviewSuspense (160445,160454) |
| LazyPptxViewer | `fVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /PptxPreviewSuspense (160445,160454) |
| isPatchSource | `gVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /rest-props 透传助手 (160543,160546,160561) |
| isPatchSource | `hVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /rest-props 透传助手 (160543,160546,160561) |
| workspaceKeyOf | `kH` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /bucketKeyOf（`${ws}\0${path}`）(68508,68511) |
| LazyPdfViewer | `lVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /PdfPreviewSuspense (160432,160438) |
| DIFF_UNSAFE_CSS | `mVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | =''/DiffViewerImpl/DiffViewer(memo)（vendored diff 封装）(160478,160479,160541) |
| DIFF_UNSAFE_CSS | `pVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | =''/DiffViewerImpl/DiffViewer(memo)（vendored diff 封装）(160478,160479,160541) |
| LazyPdfViewer | `uVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /PdfPreviewSuspense (160432,160438) |
| OfficePending | `wVt` | — | — | CodeViewer.tsx | styles-CdEGpc2x.js | /Error/Dispatcher（excel/docx/legacy 三分派）(160654,160663,160670) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`G`/`J` | cn / Button / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `m`/`P` | toast / Input | ImeComposition.tsx |
| `FH` | CodeCommentsStore | stores-workspace.tsx |
| `EA/DA/OA` | 最近编辑器偏好 `zcode-last-editor-id` | styles 本 chunk 50856–50870 |
| shiki / diff 引擎 | 高亮 / diff 渲染 | styles 本 chunk X08/X09（vendored，接口挂接） |
| `lVt`/`dVt` 懒加载 | PDF / Office 预览 | PdfViewer.tsx / office 诸 chunk（异步分包） |
| `cj` | MarkdownRenderer（U8） | MarkdownIntegration.tsx |
| `MO`/`BO`/`gut`/`Oft` | 高亮块 / 内嵌 mermaid / diff 纯文本 | MarkdownIntegration.tsx（F19，部分接口级） |

## 14. Modals

- 族登记：F09/F10/F18 模态族
- 产物：Modals.tsx / Modals.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| Progress | `yq` | 75986 | 67310 | Modals.tsx | styles-CdEGpc2x.js | ；uJ → Badge ；s4t → ZCodeLogoSvg |
| ConfirmDialogStore | `H2` | 123480 | 105205 | Modals.tsx | styles-CdEGpc2x.js | U2 → useConfirmDialog |
| buildReaddirParams | `OEt` | 123929 | 105703 | Modals.tsx | styles-CdEGpc2x.js | kEt → filterDirectories |
| resolveFolderIconKind | `AEt` | 123935 | 105714 | Modals.tsx | styles-CdEGpc2x.js | jEt → createRequestToken |
| DirectoryBrowserDialog | `MEt` | 123942 | 105724 | Modals.tsx | styles-CdEGpc2x.js | （路径输入/隐藏目录/逐级进入） |
| SKILL_SYNC_ACTION_SELECTOR | `zEt` | 124995 | 106207 | Modals.tsx | styles-CdEGpc2x.js |  |
| shouldHandleSkillCardClick | `BEt` | 124996 | 106208 | Modals.tsx | styles-CdEGpc2x.js |  |
| SkillSyncRowList | `VEt` | 125001 | 106216 | Modals.tsx | styles-CdEGpc2x.js |  |
| SkillSyncResultView | `HEt` | 125107 | 106254 | Modals.tsx | styles-CdEGpc2x.js |  |
| SkillSyncTitle | `UEt` | 125151 | 106266 | Modals.tsx | styles-CdEGpc2x.js | + 警告 tooltip |
| mergeSkillRows | `WEt` | 125180 | 106280 | Modals.tsx | styles-CdEGpc2x.js | GEt → defaultSkillSelection |
| filterSkillRows | `KEt` | 125187 | 106290 | Modals.tsx | styles-CdEGpc2x.js | q2  → remoteSyncTargetLabel |
| resolveSelectAllState | `qEt` | 125199 | 106297 | Modals.tsx | styles-CdEGpc2x.js | JEt → SkillSyncShowExisting |
| SkillSyncHeader | `YEt` | 125219 | 106318 | Modals.tsx | styles-CdEGpc2x.js | XEt → SkillSyncSelectAll |
| SkillSyncDialog | `ZEt` | 125271 | 106355 | Modals.tsx | styles-CdEGpc2x.js |  |
| mergeMcpRows | `QEt` | 125471 | 106467 | Modals.tsx | styles-CdEGpc2x.js | $Et → defaultMcpSelection |
| filterMcpRows | `eDt` | 125478 | 106477 | Modals.tsx | styles-CdEGpc2x.js | tDt → buildMcpImportPayload |
| resolveMcpServerKind | `nDt` | 125490 | 106489 | Modals.tsx | styles-CdEGpc2x.js | rDt → McpSyncTitle |
| McpSyncShowExisting | `iDt` | 125528 | 106506 | Modals.tsx | styles-CdEGpc2x.js | aDt → McpSyncHeader |
| McpSyncSelectAll | `oDt` | 125568 | 106535 | Modals.tsx | styles-CdEGpc2x.js | sDt → McpSyncRowList |
| McpSyncResultView | `cDt` | 125678 | 106577 | Modals.tsx | styles-CdEGpc2x.js | lDt → McpSyncDialog |
| RemotePluginSyncStoppedError | `J2` | 125934 | 106719 | Modals.tsx | styles-CdEGpc2x.js | uDt → pluginSyncLogIdCounter |
| makePluginSyncLogId | `dDt` | 125942 | 106725 | Modals.tsx | styles-CdEGpc2x.js | fDt → toInlinePluginCandidate |
| pluginStatusKey | `pDt` | 125962 | 106748 | Modals.tsx | styles-CdEGpc2x.js | mDt → mergeInlinePluginRows |
| mergePluginRows | `hDt` | 125980 | 106768 | Modals.tsx | styles-CdEGpc2x.js | gDt → defaultPluginSelection |
| filterPluginRows | `_Dt` | 125998 | 106790 | Modals.tsx | styles-CdEGpc2x.js | vDt → canClosePluginSyncDialog |
| buildMarketplaceCandidates | `yDt` | 126004 | 106796 | Modals.tsx | styles-CdEGpc2x.js | bDt → mapMarketplaceStatuses |
| remoteComponentKinds | `xDt` | 126044 | 106850 | Modals.tsx | styles-CdEGpc2x.js | SDt → extractPluginOptions |
| attachPluginOptions | `CDt` | 126052 | 106864 | Modals.tsx | styles-CdEGpc2x.js | wDt → hydratePluginOptions |
| summarizePluginOptions | `TDt` | 126060 | 106875 | Modals.tsx | styles-CdEGpc2x.js | EDt → marketplaceSourceInput |
| marketplaceSourcePayload | `DDt` | 126078 | 106896 | Modals.tsx | styles-CdEGpc2x.js | ODt → loadPluginSyncCandidates |
| isPluginSyncStoppedError | `kDt` | 126111 | 106948 | Modals.tsx | styles-CdEGpc2x.js | ADt → stoppedPluginResult |
| emitPluginSyncProgress | `Y2` | 126126 | 106960 | Modals.tsx | styles-CdEGpc2x.js | X2 → assertPluginSyncNotStopped |
| runCancellableRemoteStep | `Z2` | 126138 | 106974 | Modals.tsx | styles-CdEGpc2x.js | jDt → isFileLikeOptionSchema |
| isPortableOptionValue | `MDt` | 126170 | 106995 | Modals.tsx | styles-CdEGpc2x.js | NDt → pickPortableOptions |
| sameConfiguredOptions | `PDt` | 126188 | 107009 | Modals.tsx | styles-CdEGpc2x.js | FDt → syncPluginOptions |
| runPluginSyncPipeline | `IDt` | 126233 | 107053 | Modals.tsx | styles-CdEGpc2x.js | LDt → runMarketplacePluginSync |
| collectMarketplacePluginNames | `RDt` | 126345 | 107150 | Modals.tsx | styles-CdEGpc2x.js | zDt → prepareMarketplaceSource |
| formatInstallDiagnostics | `BDt` | 126393 | 107194 | Modals.tsx | styles-CdEGpc2x.js | VDt → PluginSyncTitle |
| PluginSyncShowExisting | `HDt` | 126426 | 107212 | Modals.tsx | styles-CdEGpc2x.js | UDt → PluginSyncHeader |
| PluginSyncSelectAll | `WDt` | 126466 | 107238 | Modals.tsx | styles-CdEGpc2x.js | GDt → PluginSyncRowList |
| PluginSyncStatusBadge | `KDt` | 126608 | 107287 | Modals.tsx | styles-CdEGpc2x.js | qDt → PluginSyncLogTooltip |
| PluginSyncProgressList | `JDt` | 126667 | 107329 | Modals.tsx | styles-CdEGpc2x.js | YDt → PluginSyncResultView |
| PluginSyncDialog | `XDt` | 126826 | 107373 | Modals.tsx | styles-CdEGpc2x.js |  |
| REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS | `ZDt` | 127114 | 107547 | Modals.tsx | styles-CdEGpc2x.js | = 15000 |
| RemoteSyncPreflightTimeoutError | `QDt` | 127115 | 107548 | Modals.tsx | styles-CdEGpc2x.js |  |
| isRemoteSyncPreflightTimeoutError | `Q2` | 127122 | 107553 | Modals.tsx | styles-CdEGpc2x.js |  |
| canOpenRemoteSessionSourceCheck | `$2` | 127125 | 107556 | Modals.tsx | styles-CdEGpc2x.js |  |
| canSubmitRemoteSync | `e4` | 127133 | 107559 | Modals.tsx | styles-CdEGpc2x.js |  |
| withRemoteSyncPreflightTimeout | `t4` | 127136 | 107562 | Modals.tsx | styles-CdEGpc2x.js |  |
| RemoteSyncDropdownButton | `$Dt` | 127201 | 107599 | Modals.tsx | styles-CdEGpc2x.js | 「同步到远端」下拉按钮 |
| RemoteSyncDialogs | `r4` | 127248 | 107623 | Modals.tsx | styles-CdEGpc2x.js |  |
| UpdateDialogCheckbox | `xOt` | 128776 | 108512 | Modals.tsx | styles-CdEGpc2x.js | Radix Checkbox 封装（自动更新开关用） |
| UPDATE_DIALOG_LOGO_URL | `SOt` | 128791 | 108522 | Modals.tsx | styles-CdEGpc2x.js | icon_512@2x 资源 URL |
| UpdateStatusDialog | `COt` | 128795 | 108523 | Modals.tsx | styles-CdEGpc2x.js | （三相位 + edgeToEdge 全屏变体） |
| splitUpdateDialogTitle | `wOt` | 129029 | 108590 | Modals.tsx | styles-CdEGpc2x.js | __ZCODE_UPDATE_VERSION__ 占位符切前/后缀 |
| AlertDialogStore | `N9` | 206514 | 164300 | Modals.tsx | styles-CdEGpc2x.js | G4t → AlertDialog |
| AUTOMATION_CONFIRM_DIALOG_CLASS | `K4t` | 206571 | 164352 | Modals.tsx | styles-CdEGpc2x.js |  |
| ConfirmDialog | `q4t` | 206572 | 164353 | Modals.tsx | styles-CdEGpc2x.js | P9 → AppDialogHost |
| ONBOARDING_TASK_STAGGER_MS | `$4t` | 206927 | 164536 | Modals.tsx | styles-CdEGpc2x.js | = 320 |
| initialOnboardingState | `F9` | 206928 | 164537 | Modals.tsx | styles-CdEGpc2x.js | I9 → selectionKey |
| defaultProviderCategories | `e3t` | 206946 | 164553 | Modals.tsx | styles-CdEGpc2x.js | t3t → normalizeDiscovery |
| defaultSelectedKeys | `n3t` | 206964 | 164573 | Modals.tsx | styles-CdEGpc2x.js | r3t → discoveryToTasks |
| parseSelectionKeys | `i3t` | 206985 | 164586 | Modals.tsx | styles-CdEGpc2x.js | a3t → additionalSelectionsToTasks |
| errorMessageText | `L9` | 207005 | 164604 | Modals.tsx | styles-CdEGpc2x.js | o3t → applyImportTaskResults |
| useOnboardingDialogController | `s3t` | 207019 | 164624 | Modals.tsx | styles-CdEGpc2x.js |  |
| ONBOARDING_WIZARD_STEPS | `c3t` | 207290 | 164907 | Modals.tsx | styles-CdEGpc2x.js | l3t → onboardingStepTitleKey |
| OnboardingStepRail | `u3t` | 207312 | 164948 | Modals.tsx | styles-CdEGpc2x.js | d3t → OnboardingStepHeader |
| OnboardingWizardFooter | `f3t` | 207386 | 164966 | Modals.tsx | styles-CdEGpc2x.js | p3t → isSettingsImportStep |
| ProjectSelectorHero | `m3t` | 207490 | 164996 | Modals.tsx | styles-CdEGpc2x.js | h3t → OnboardingWelcomeView |
| initialFinishExecution | `g3t` | 207605 | 165025 | Modals.tsx | styles-CdEGpc2x.js | _3t → OnboardingSessionStep |
| ImportSelectionStep | `R9` | 207794 | 165129 | Modals.tsx | styles-CdEGpc2x.js | v3t → MigrationProgressView |
| MigrationCompleteView | `y3t` | 207846 | 165153 | Modals.tsx | styles-CdEGpc2x.js | b3t → AgentsFileMigrationStep |
| shouldAutoScanSessions | `x3t` | 208073 | 165214 | Modals.tsx | styles-CdEGpc2x.js | S3t → buildSessionGroups |
| useFinishExecution | `C3t` | 208092 | 165227 | Modals.tsx | styles-CdEGpc2x.js | w3t → errorMessageText2 |
| useAgentsFileMigration | `T3t` | 208197 | 165337 | Modals.tsx | styles-CdEGpc2x.js |  |
| ONBOARDING_STEP_ORDER | `z9` | 208251 | 165387 | Modals.tsx | styles-CdEGpc2x.js | E3t → OnboardingDialog |
| useAlertDialog | `$3t` | 209650 | 166685 | Modals.tsx | styles-CdEGpc2x.js |  |
| Dialog | `Gb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `Hb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `Kb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `Ub` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `Vb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `Wb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |
| Dialog | `zb` | — | — | Modals.tsx | styles-CdEGpc2x.js | /Content/Header/Title/Description/Footer/Close (31943+ / 29335+) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`g`/`wa`/`G`/`J` | cn / Button / x / chevron / intl / logger | UtilsCn.tsx / button.tsx / ImeComposition.tsx / **I18n.tsx** / logger.tsx |
| `P`/`M` | Input / spinner | ImeComposition.tsx |
| `Ia` | Tooltip | usageStatsUiParts-CiR7YEhh.js（外部） |
| `Ae` | zustand create | skillStore-BmeKHDBI.js（外部） |
| `H2`/`U2`/`N9`/`$3t` | 确认/警告 store 与钩子 | stores-core.tsx |
| `mee` testid | confirm-dialog-confirm | src-HCld2afU.js（外部） |
| `zb/Hb/Ub/Gb/Kb/Wb/Vb`、`Zxe/$xe`、`yq`、`uJ` | Dialog / Checkbox / Progress / Badge 原语 | styles 本 chunk 31943+ / 横切层 |
| `R7`/`I2t`/`v$t`/`S4t`/`C4t` | 导入/迁移共用面（接口级） | SettingsPanelsData.tsx / F18（B4） |
| `ko` | SettingsStore | stores-core.tsx |

## 15. ExtendedViews

- 族登记：F04/F15/F16 扩展视图
- 产物：ExtendedViews.tsx / ExtendedViews.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| WikiCatalogTree | `bAt` | 132042 | 111381 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| WikiCatalogTreeNode | `xAt` | 132074 | 111404 | ExtendedViews.tsx | styles-CdEGpc2x.js | （递归） |
| RepoWikiLogoIcon | `s3` | 132161 | 111452 | ExtendedViews.tsx | styles-CdEGpc2x.js | SVG 图标（四格+斜线） |
| buildWikiCatalogTree | `CAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `DAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `EAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `OAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `SAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `TAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| buildWikiCatalogTree | `wAt` | 132192–132286 | 111458–111529 | ExtendedViews.tsx | styles-CdEGpc2x.js | （目录树构造） |
| WIKI | `FAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `IAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `LAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `MAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `NAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `PAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `c3` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| WIKI | `jAt` | 132298–132305 | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定） |
| RepoWikiView | `l3` | 132306 | 111550 | ExtendedViews.tsx | styles-CdEGpc2x.js | Wiki 主视图 |
| WikiProjectCard | `RAt` | 133071 | 112122 | ExtendedViews.tsx | styles-CdEGpc2x.js | （名称/停止/元数据 details/进度） |
| WikiPageRenderer | `zAt` | 133156 | 112164 | ExtendedViews.tsx | styles-CdEGpc2x.js | Wiki 页面分帧 Markdown 渲染 |
| CollapsiblePanelShell | `BAt` | 133241 | 112232 | ExtendedViews.tsx | styles-CdEGpc2x.js | （竖排标题/展开收起） |
| WikiProjectList | `VAt` | 133288 | 112244 | ExtendedViews.tsx | styles-CdEGpc2x.js | （展开/选中/节点树挂载） |
| WikiGenerateEmptyState | `HAt` | 133354 | 112277 | ExtendedViews.tsx | styles-CdEGpc2x.js | （语言/模型/重试/图表开关） |
| WikiPagePendingCard | `UAt` | 133594 | 112387 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| WikiTaskProgress | `WAt` | 133625 | 112400 | ExtendedViews.tsx | styles-CdEGpc2x.js | （页数/百分比/当前页/错误） |
| OFFPEAK_TEMPLATE_IDS | `Pjt` | 133989 | 112762 | ExtendedViews.tsx | styles-CdEGpc2x.js | （standupGitSummary/ciFlakyReport/documentationSyncCheck） |
| SwitchToggle | `Gjt` | 134441 | 113337 | ExtendedViews.tsx | styles-CdEGpc2x.js | （绿/蓝，sm/default） |
| KeepAwakeBanner | `tMt` | 134542 | 113438 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| AutomationCreateSplitButton | `L3` | 134567 | 113451 | ExtendedViews.tsx | styles-CdEGpc2x.js | +⌄（经聊天创建） |
| AUTOMATIONS_MAIN_CONTAINER_CLASS | `H3` | 135261 | 113750 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| buildAutomationModelSelectGroups | `AMt` | 135384 | 113829 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| AutomationSchedulePill | `ANt` | 138513 | 115689 | ExtendedViews.tsx | styles-CdEGpc2x.js | （溢出 tooltip） |
| 自动化主视图 toast 锚点/带锚点 toast | `c6` | 138628 | 115768 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 自动化主视图 toast 锚点/带锚点 toast | `l6` | 138628 | 115768 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| OffPeakCreateButton | `INt` | 138634 | 115771 | ExtendedViews.tsx | styles-CdEGpc2x.js | （灰态 tooltip） |
| SCHEDULED_TEMPLATES | `LNt` | 138654 | 115784 | ExtendedViews.tsx | styles-CdEGpc2x.js | （晨间简报/风险扫描/发布周报/文档同步） |
| LIFECYCLE_PRESENTATION | `UNt` | 138675 | 115823 | ExtendedViews.tsx | styles-CdEGpc2x.js | /色 |
| AutomationCardMenu | `ZNt` | 138713 | 115876 | ExtendedViews.tsx | styles-CdEGpc2x.js | ⌄ 菜单（运行/重启/暂停/编辑/删除） |
| AutomationsMain | `d6` | 138823 | 115911 | ExtendedViews.tsx | styles-CdEGpc2x.js | （列表态/编辑器路由态/闲时态） |
| TreemappingView | `AGt` | 179493 | 145507 | ExtendedViews.tsx | styles-CdEGpc2x.js | （摘要/树布局/选中详情） |
| TreemapStatCard | `M5` | 179672 | 145570 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| DiffCountBadge | `N5` | 179681 | 145576 | ExtendedViews.tsx | styles-CdEGpc2x.js | +N/-M 计数 |
| TreemapEmptyState | `jGt` | 179694 | 145583 | ExtendedViews.tsx | styles-CdEGpc2x.js | （运行中计数） |
| TreemapDirectoryNode | `MGt` | 179710 | 145599 | ExtendedViews.tsx | styles-CdEGpc2x.js | （flex 加权布局，递归） |
| TreemapFileNode | `NGt` | 179766 | 145618 | ExtendedViews.tsx | styles-CdEGpc2x.js | （权重/选中/待处理脉冲） |
| WhiteboardCanvas | `FGt` | 179888 | 145638 | ExtendedViews.tsx | styles-CdEGpc2x.js | （画笔/橡皮/色板/线宽/撤销重做/清空/命名/入聊天） |
| useModelTrajectory | `RGt` | 180193 | 145806 | ExtendedViews.tsx | styles-CdEGpc2x.js | （代际防竞态） |
| TrajectoryPartRenderer | `P5` | 180200 | 145853 | ExtendedViews.tsx | styles-CdEGpc2x.js | part 渲染（text/reasoning/tool-call/tool-result/image） |
| TrajectoryToolBlock | `zGt` | 180241 | 145884 | ExtendedViews.tsx | styles-CdEGpc2x.js | /结果折叠块 |
| TrajectoryToolIdBadge | `BGt` | 180263 | 145894 | ExtendedViews.tsx | styles-CdEGpc2x.js | toolId 徽章 |
| TrajectoryCollapsible | `VGt` | 180270 | 145907 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| TrajectoryPayloadPre | `HGt` | 180292 | 145922 | ExtendedViews.tsx | styles-CdEGpc2x.js | payload pre 块 |
| TrajectoryUsageBadge | `UGt` | 180299 | 145927 | ExtendedViews.tsx | styles-CdEGpc2x.js | in/out token 徽章 |
| TrajectoryStatusText | `F5` | 180315 | 145938 | ExtendedViews.tsx | styles-CdEGpc2x.js | /加载/错误居中文案 |
| summarizeTrajectory | `WGt` | 180328 | 145945 | ExtendedViews.tsx | styles-CdEGpc2x.js | （总 token/模型集） |
| stringifyPayload | `GGt` | 180341 | 145959 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| TrajectoryRecordCard | `KGt` | 180352 | 145968 | ExtendedViews.tsx | styles-CdEGpc2x.js | （头/输入/输出/错误） |
| TrajectorySourceBadge | `qGt` | 180443 | 146000 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| resolveSourceLabelId | `JGt` | 180462 | 146018 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| ROLE_STYLES | `YGt` | 180487 | 146048 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| TrajectoryMessageBlock | `XGt` | 180509 | 146070 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| TrajectoryOutputBlock | `ZGt` | 180540 | 146085 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| TrajectorySection | `QGt` | 180568 | 146098 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| ModelTrajectoryView | `tKt` | 180606 | 146115 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 目录解析/记录列表/输入消息去重 | `aKt` | 180752–180800 | 146205–146240 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 目录解析/记录列表/输入消息去重 | `iKt` | 180752–180800 | 146205–146240 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 目录解析/记录列表/输入消息去重 | `nKt` | 180752–180800 | 146205–146240 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 目录解析/记录列表/输入消息去重 | `oKt` | 180752–180800 | 146205–146240 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 目录解析/记录列表/输入消息去重 | `rKt` | 180752–180800 | 146205–146240 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| EMPTY_NETWORK_ENTRIES | `cKt` | 180802 | 146243 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| EMPTY_ROUNDS | `sKt` | 180802 | 146243 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 数值/百分比/毫秒/时刻 格式化 | `I5` | 180806–180830 | 146245–146259 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 数值/百分比/毫秒/时刻 格式化 | `dKt` | 180806–180830 | 146245–146259 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 数值/百分比/毫秒/时刻 格式化 | `lKt` | 180806–180830 | 146245–146259 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| 数值/百分比/毫秒/时刻 格式化 | `uKt` | 180806–180830 | 146245–146259 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| resolveNetworkStatusLabelId | `fKt` | 180836 | 146268 | ExtendedViews.tsx | styles-CdEGpc2x.js |  |
| NetworkHeadersDetails | `pKt` | 180847 | 146282 | ExtendedViews.tsx | styles-CdEGpc2x.js | /响应头 details 表 |
| DeveloperToolsView | `mKt` | 180870 | 146290 | ExtendedViews.tsx | styles-CdEGpc2x.js | （token 缓存统计 + 网络事件流） |
| WHITEBOARD_PALETTE | `PGt` |  179886 | 145637 | ExtendedViews.tsx | styles-CdEGpc2x.js | （在 §3 用，定义于此段 179886 / 145637） |
| formatTime | `$Gt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | /formatDuration (180580,180590 / 146108,146112) |
| pickEntryProjectId | `AAt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | / resolveInitialProjectId (132287,132290 / 111532,111535) |
| 标签/模板可见性决策 | `BNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138662,138665,138668 / 115803,115809,115812) |
| coding | `Dit` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | plan 支持判定/闲时错误 id (91347,91357 / 78933,78941) |
| coding | `Eit` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | plan 支持判定/闲时错误 id (91347,91357 / 78933,78941) |
| 自动化遥测 | `FNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （模型字段/脱敏/创建结果/点击）(138563,138575,138591,138612 / 115713,115725,115735,115752) |
| 提示词归一/失败态/可操作态/生命周期档位 | `GNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276) |
| 标签/模板可见性决策 | `HNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138662,138665,138668 / 115803,115809,115812) |
| 闲时创建遥测 | `Hjt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134385,134396,134421,134425 / 113296,113307,113330,113334) |
| 闲时可用性/剩余时间文案 | `Ijt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (133996,134010 / 112770,112778) |
| 远程标签判定 | `J3` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (135501,135375 / 113941,113820) |
| 错误 i18n id 构造 | `JNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138698,138691,138701 / 115854,115851,115857) |
| 提示词归一/失败态/可操作态/生命周期档位 | `KNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276) |
| 提示词归一/失败态/可操作态/生命周期档位 | `Kht` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276) |
| 闲时可用性/剩余时间文案 | `Ljt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (133996,134010 / 112770,112778) |
| 自动化遥测 | `MNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （模型字段/脱敏/创建结果/点击）(138563,138575,138591,138612 / 115713,115725,115735,115752) |
| 模板图标映射表 | `Mjt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134923,133984) |
| 自动化遥测 | `NNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （模型字段/脱敏/创建结果/点击）(138563,138575,138591,138612 / 115713,115725,115735,115752) |
| OffPeakTemplateIcon | `Njt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | /AutomationTemplateIcon (134931,133990 / 113575,112749) |
| 自动化遥测 | `PNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （模型字段/脱敏/创建结果/点击）(138563,138575,138591,138612 / 115713,115725,115735,115752) |
| 远程标签判定 | `RMt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (135501,135375 / 113941,113820) |
| coding | `Tit` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | plan 支持判定/闲时错误 id (91347,91357 / 78933,78941) |
| 闲时创建遥测 | `Ujt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134385,134396,134421,134425 / 113296,113307,113330,113334) |
| 标签/模板可见性决策 | `VNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138662,138665,138668 / 115803,115809,115812) |
| 闲时创建遥测 | `Vjt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134385,134396,134421,134425 / 113296,113307,113330,113334) |
| 提示词归一/失败态/可操作态/生命周期档位 | `WNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276) |
| 闲时创建遥测 | `Wjt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134385,134396,134421,134425 / 113296,113307,113330,113334) |
| openAutomationId | `XNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138704,138708 / 115860,115864) |
| openAutomationId | `YNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138704,138708 / 115860,115864) |
| WikiMetaRowInline | `d3` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （内联）(133679 / 112418 附近) |
| formatTime | `eKt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | /formatDuration (180580,180590 / 146108,146112) |
| 频率/下次运行文案 | `egt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (109525,109499 / 93602,93576) |
| pickEntryProjectId | `kAt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | / resolveInitialProjectId (132287,132290 / 111532,111535) |
| 模板图标映射表 | `lMt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (134923,133984) |
| 频率/下次运行文案 | `ngt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (109525,109499 / 93602,93576) |
| 错误 i18n id 构造 | `qNt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138698,138691,138701 / 115854,115851,115857) |
| 提示词归一/失败态/可操作态/生命周期档位 | `qht` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276) |
| 频率/下次运行文案 | `rgt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (109525,109499 / 93602,93576) |
| WikiMetaRowGrid | `u3` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | （网格）(133666 / 112415 附近) |
| 错误 i18n id 构造 | `u6` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (138698,138691,138701 / 115854,115851,115857) |
| OffPeakTemplateIcon | `uMt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | /AutomationTemplateIcon (134931,133990 / 113575,112749) |
| 远程标签判定 | `zMt` | — | — | ExtendedViews.tsx | styles-CdEGpc2x.js | (135501,135375 / 113941,113820) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Z`/`X`/`Sa`/`wa`/`G`/`J` | cn / Button / 图标 / intl / logger | UtilsCn.tsx / button.tsx / **I18n.tsx** / logger.tsx |
| `l`/`m`/`P`/`M`/`g`/`N`/`p` | 平台服务 / toast / Input / spinner / x / alert-triangle / moon | ImeComposition.tsx |
| `Ia`/`Na/Oa/Ma/ka` | Tooltip / Popover | usageStatsUiParts-CiR7YEhh.js（外部） |
| `xe`/`Oe`/`ke`/`ve`/`_e`/`ye`/`Te`/`H`/`F`/`Ae` | 任务 / 白板 store 与绘制助手 / 供应商选择 | skillStore-BmeKHDBI.js（外部，l/o/p/d/c/f/U/h 导出） |
| `ene`/`Ti`/`Zn`/`ri`/`xw`/`vee` + testid×9 | repoWiki/automations 键 / 模型解析 / 遥测 | src-HCld2afU.js（外部） |
| `cj` | MarkdownRenderer（Wiki 分帧） | MarkdownIntegration.tsx |
| Select / Checkbox / AlertDialog / DropdownMenu / Collapsible / Badge / ScrollArea / PanelGroup | 原语 | styles 本 chunk 46009 / 37297 / 131966 / 47926 / 94925 / 80303 / 136026 / 131934 |
| `kNt`/`YMt`/`cMt`/`T3`/`bX` | 编辑器与 store（接口，B4） | F15 深层 + stores-tasks.tsx |

## 16. Markdown

- 族登记：F19 MarkdownFamily + streamdown 层
- 产物：Markdown*.tsx + MarkdownIntegration.tsx + HighlightedCodeBlock.tsx + highlightedCodeBlockBody.tsx / Markdown.report.md + MarkdownIntegration.report.md + PreviewMisc.report.md
- 来源：chunk-BO2N2NFS-CSNAeaxF.js（streamdown@2.5.0）+ styles-CdEGpc2x.js（cj 集成层）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| HighlightedCodeBlockBody | `c` | 1–25 | 1–43 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （导出名未混淆）；导出别名 HighlightedCodeBlockBody; （未混淆） |
| DEFAULT_CODE_PREVIEW_SETTINGS | `lo` | 1040 | 93 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | {github-light/github-dark/行号/折行/12px} |
| unist | `qe` | 1274 | 1191 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -util-visit `SKIP`             5.1.0 |
| unist | `Je` | 1275 | 1192 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -util-visit-parents `visitParents` 6.0.2 |
| unist | `Xe` | 1316 | 1230 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -util-visit `visit`            5.1.0 |
| rehype | `ft` | 1487 | 1414 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -harden 插件                  1.1.8 |
| rehype | `jo` | 8230 | 6643 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -raw 插件                     7.0.0 |
| hast | `No` | 8236 | 6652 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -util-sanitize `defaultSchema`  6.x |
| rehype | `Xo` | 8460 | 6883 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -sanitize 插件                6.0.0 |
| remark | `Jd` | 12538 | 10063 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -gfm 插件                     4.0.1 |
| shiki | `Id` | 13191 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | createHighlighter 单例      langs=Td themes=Ed engine=wasm(wasm-B4ap0Fdc.js) |
| remend | `Op` | 13285 | 10721 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | `parseIncompleteMarkdown`    1.3.0 |
| hast | `Yp` | 13560 | 10953 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -util-to-jsx-runtime `toJsxRuntime` 2.3.6 |
| remark | `nh` | 15006 | 12373 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -parse 插件                   11.0.0 |
| remark | `qh` | 15598 | 13087 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -rehype 插件                  11.1.2 |
| unified | `bg` | 16029 | 13440 | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | `unified()` 处理器工厂      11.0.5 |
| WHITESPACE_REGEX | `lv` | 18380 | 15300 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /\s/ |
| ONLY_WHITESPACE_REGEX | `uv` | 18381 | 15301 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /^\s+$/ |
| ANIMATE_SKIP_TAGS | `dv` | 18382 | 15302 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | {code,pre,svg,math,annotation} |
| isHastElement | `fv` | 18383 | 15303 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| containsSkipTag | `pv` | 18384 | 15304 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| splitByWhitespace | `mv` | 18385 | 15305 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （保留空白段） |
| splitByCharacter | `hv` | 18398 | 15318 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （保留空白段） |
| buildAnimatedSpan | `gv` | 18408 | 15328 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | <span data-sd-animate style=--sd-*> |
| animateTextChildren | `_v` | 18422 | 15342 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | span（旧内容不重播） |
| animatePluginCounter | `vv` | 18436 | 15388 | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （唯一化插件名） |
| IsStreamingContext | `bv` | 18470 | 15425 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 「末块是否未完成」上下文（布尔） |
| useIsStreaming | `xv` | 18471 | 15426 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | useContext(bv) |
| cn | `Sv` | 18472 | 15427 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | clsx+twMerge 类名合并（= utils cn 语义） |
| streamdownCn | `Sv` | 18472 | 15427 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | twMerge(clsx(...))（s/c 来自 bundle-mjs chunk） |
| prefixClasses | `Cv` | 18473 | 15428 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | `prefix:` |
| createPrefixedCn | `wv` | 18481 | 15436 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | prefix 造 cn |
| downloadFile | `Tv` | 18484 | 15437 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Blob→a[download] 触发下载（CSV 加 BOM） |
| ClassNamesContext | `Ev` | 18495 | 15443 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （cn，带 prefix 能力） |
| useClassNames | `Q` | 18496 | 15444 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | useContext(Ev) |
| STREAMDOWN_LINE_NUMBER_CLASS | `Dv` | 18497 | 15445 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | CSS counter 类 |
| parseInlineStyle | `Ov` | 18510 | 15446 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 'k:v;k2:v2' → 对象 |
| CodeBlockBody | `kv` | 18522–18614 | 15458–15482 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | memo 组件：shiki tokens → hast 风格 span 树；导出别名 CodeBlockBody; （上游 At） |
| CodeBlockShell | `Av` | 18615 | 15483 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （圆角卡片 + content-visibility）；导出别名 CodeBlockShell; （上游 ot） |
| CodeBlockContainer | `Av` | 18615 | 15483 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （data-streamdown=code-block） |
| CodeBlockCodeContext | `jv` | 18627 | 15494 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | createContext({code:''})——供子组件取原始代码 |
| useCodeBlockCode | `Mv` | 18628 | 15497 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | () => useContext(jv)；导出别名 useCodeBlockCode; （上游 He） |
| CodeBlockContext | `jv` | 18629 | 15496 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | { code }（复制/下载按钮取码用） |
| CodeBlockHeader | `Nv` | 18629 | 15498 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （data-streamdown=code-block-header）；导出别名 CodeBlockHeader; （上游 rt） |
| CodeBlockHeader | `Nv` | 18629 | 15498 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （data-streamdown=code-block-header） |
| useCodeBlockContext | `Mv` | 18630 | 15497 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| trimTrailingNewlines | `Pv` | 18638 | 15504 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 导出别名 trimTrailingNewlines; （上游 lr） |
| trimTrailingNewlines | `Pv` | 18650 | 15508 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| LazyHighlightedCodeBlockBody | `Fv` | 18650 | 15510 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | lazy(() => import('./highlighted-body-…'))；导出别名 LazyHighlightedCodeBlockBody; (cr)（上游 cr） |
| LazyHighlightedBody | `Fv` | 18650 | 15510 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | lazy(() => import('./highlighted-body-…')) |
| HighlightedCodeBlock | `Iv` | 18660 | 15513 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （外壳+头+动作槽+Suspense 正文）；导出别名 HighlightedCodeBlock; （上游 st） |
| CodeBlock | `Iv` | 18660 | 15513 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | ：头+动作条+正文（上游导出 CodeBlock=g） |
| DEFAULT_STREAMDOWN_ICONS | `Lv` | 18731 | 15548 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 10 个内联 SVG 图标 |
| StreamdownIconsContext | `Rv` | 18934 | 15560 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| iconsAreEqual | `zv` | 18935 | 15561 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| StreamdownIconsProvider | `Bv` | 18941 | 15562 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| useStreamdownIcons | `Vv` | 18949 | 15563 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | useContext(Rv) |
| DEFAULT_STREAMDOWN_TRANSLATIONS | `Hv` | 18950 | 15585 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 30 条英文文案 |
| StreamdownTranslationsContext | `Uv` | 18950 | 15585 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| useStreamdownTranslations | `Wv` | 18982 | 15586 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | useContext(Uv) |
| CodeBlockCopyButton | `Gv` | 18983 | 15618 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （导出别名? 上游 i） |
| LANGUAGE_FILE_EXTENSIONS | `Kv` | 19032 | 15657 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | →扩展名表（~300 项） |
| CodeBlockDownloadButton | `qv` | 19340 | 15965 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游 j） |
| CodeBlockSkeleton | `Jv` | 19368 | 15993 | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | mermaid/自定义块加载骨架（上游 k） |
| 滚动锁计数/加锁/解锁 | `$v` | 19481 | 16057 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| 滚动锁计数/加锁/解锁 | `Qv` | 19481 | 16057 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| 滚动锁计数/加锁/解锁 | `Zv` | 19481 | 16057 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| CodeHighlighterContext | `ty` | 19610 | 16111 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | createContext(null)（顶层注入高亮器） |
| StreamdownPluginsContext | `ty` | 19610 | 16111 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （code/mermaid/cjk/math/renderers） |
| useCodeHighlighterContext | `ny` | 19611 | 16112 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | () => useContext(ty) |
| useStreamdownPlugins | `ny` | 19611 | 16112 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | useContext(ty) |
| useCodeHighlighter | `ry` | 19612 | 16113 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | () => useContext(ty)?.code ?? null |
| useMermaidPlugin | `iy` | 19613 | 16114 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | plugins?.mermaid ?? null |
| useCustomBlockRenderer | `ay` | 19614 | 16115 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | plugins.renderers |
| downloadSvgAsPng | `oy` | 19626 | 16120 | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | SVG→base64→Image→canvas(5x)→PNG blob |
| MermaidDownloadDropdown | `sy` | 19653 | 16142 | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （SVG/PNG/MMD 三档） |
| MermaidFullscreenButton | `cy` | 19759 | 16201 | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （portal 覆盖层 + 内嵌 Mermaid） |
| extractTableDataFromElement | `ly` | 19849 | 16254 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | DOM 表格 → {headers, rows}（上游 m） |
| tableDataToCSV | `uy` | 19867 | 16272 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | CSV 序列化（引号转义，上游 n） |
| tableDataToTSV | `dy` | 19896 | 16300 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | TSV 序列化（\t \n \r 字面量化，上游 o） |
| tableDataToMarkdown | `py` | 19946 | 16344 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Markdown 表格序列化（上游 q） |
| TableDownloadDropdown | `hy` | 20062 | 16417 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （CSV/Markdown，上游 s） |
| TableFullscreenButton | `gy` | 20144 | 16455 | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （portal + sticky 表头，上游 t） |
| START_LINE_REGEX | `vy` | 20280 | 16515 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /startLine=(\d+)/ |
| NO_LINE_NUMBERS_REGEX | `yy` | 20281 | 16516 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /\bnoLineNumbers\b/ |
| LANGUAGE_CLASS_REGEX | `xy` | 20289 | 16520 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /language-([^\s]+)/ |
| nodesHaveEqualPosition | `Sy` | 20290 | 16521 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | mdast position 相等 |
| memoPropsAreEqual | `$` | 20301 | 16534 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | className + position |
| resolveControlFlag | `Cy` | 20304 | 16537 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| MarkdownOl | `Dy` | 20320 | 16549 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Oy → MarkdownLi |
| MarkdownUl | `ky` | 20342 | 16562 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Ay → MarkdownHr |
| MarkdownStrong | `jy` | 20363 | 16574 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | My → MarkdownA  → 见 MarkdownLink.tsx |
| MarkdownTable | `zy` | 20512 | 16631 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | By → MarkdownThead |
| MarkdownTbody | `Vy` | 20534 | 16649 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Hy → MarkdownTr |
| MarkdownTh | `Uy` | 20556 | 16661 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Wy → MarkdownTd |
| MarkdownBlockquote | `Gy` | 20581 | 16673 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| MarkdownSup | `Ky` | 20592 | 16682 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | qy → MarkdownSub |
| MarkdownSection | `Jy` | 20653 | 16694 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （data-footnotes 空节过滤） |
| MarkdownCode | `Yy` | 20660 | 16780 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （inline/block/mermaid/自定义渲染器 四分派） |
| MarkdownImg | `Xy` | 20763 | 16833 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （加载失败降级 + 悬停下载） |
| MarkdownParagraph | `Zy` | 20765 | 16843 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （单图/单代码块透传，不包 <p>） |
| STREAMDOWN_COMPONENTS | `Qy` | 20778 | 16856 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | →组件映射表 |
| RTL | `$y` | 20809 | 16888 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /字母探测正则 |
| RTL | `eb` | 20809 | 16888 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /字母探测正则 |
| detectTextDirection | `tb` | 20809 | 16890 | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 u） |
| TABLE_DIVIDER_REGEX | `rb` | 20823 | 16899 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| isCodeFenceIncomplete | `ib` | 20824 | 16900 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 b 的等价内联版） |
| hasIncompleteTableDivider | `ab` | 20846 | 16922 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| htmlToTextPlugin | `ob` | 20857 | 16933 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | html 节点 → 文本（无 rehype-raw 时防崩溃） |
| EMPTY_PLUGINS | `sb` | 20862 | 16938 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | [] |
| DEFAULT_REMARK_REHYPE_OPTIONS | `cb` | 20863 | 16939 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | {allowDangerousHtml:true} |
| pluginNamesCache | `lb` | 20864 | 16940 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | WeakMap |
| ProcessorCache | `ub` | 20865 | 16941 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （LRU 100，按插件名+选项序列化键） |
| MarkdownProcessor | `db` | 20929 | 17000 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | parse→runSync→toJsxRuntime 一步渲染 |
| getProcessor | `fb` | 20935 | 17006 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| hasRehypeRaw | `pb` | 20941 | 17012 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| createProcessor | `mb` | 20942 | 17013 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | unified().use(parse).use(remark*).use(rehype,opts).use(rehype*) |
| preserveHtmlBlocks | `Mb` | 21101 | 17156 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | <!----> 防拆段 |
| 转义正则/函数 | `Nb` | 21119 | 17174 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| 转义正则/函数 | `Pb` | 21119 | 17174 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| escapeLiteralTagContent | `Fb` | 21121 | 17176 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| getTextContent | `Ib` | 21132 | 17187 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| literalTagContentPlugin | `Lb` | 21133 | 17188 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js |  |
| STREAMDOWN_SANITIZE_SCHEMA | `Hb` | 21146 | 17200 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （defaultSchema + tel 协议 + code[metastring]） |
| codeMetaPlugin | `Rb` | 21146 | 17200 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | code.meta → hProperties.metastring |
| normalizeHtmlIndentation | `Bb` | 21154 | 17208 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 x） |
| normalizeHtmlIndentation | `Vb` | 21154 | 17208 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 x） |
| normalizeHtmlIndentation | `zb` | 21154 | 17208 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 x） |
| DEFAULT_REMARK_PLUGINS | `Wb` | 21170 | 17224 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | {gfm:[…], codeMeta}（上游导出 z） |
| Object | `Gb` | 21171 | 17225 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | .values 数组（默认 props 值） |
| Object | `Kb` | 21171 | 17225 | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | .values 数组（默认 props 值） |
| STREAMDOWN_CARET_SYMBOLS | `qb` | 21173 | 17230 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | { block:' ▋', circle:' ●' } |
| DEFAULT_SHIKI_THEME | `Jb` | 21174 | 17231 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | ['github-light','github-dark'] |
| DEFAULT_LINK_SAFETY | `Yb` | 21175 | 17232 | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | { enabled: true } |
| ZoomableContent | `$b` | 21463 | 17421 | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /平移容器（滚轮缩放、指针拖拽、控制钮） |
| cjkTrailingPunctuationAutolinkSplit | `gIe` | 43597 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | visit link 尾标点切分 |
| CJK_PLUGIN | `vIe` | 43631 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | _Ie()  remark/micromark CJK 标点粘连修正 |
| FORGIVING_ONIG_ENGINE | `yIe` | 43632 | 15923 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | = Ep({forgiving:true})  JS 正则引擎 |
| normalizeLanguageAlias | `eE` | 43667 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | bIe 别名表归一 |
| highlightCacheKey | `SIe` | 43673 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | 100+后100字符采样键 |
| getOrCreateHighlighter | `CIe` | 43679 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | lang+themes 缓存 Id(...) |
| createShikiCodeHighlighterPlugin | `wIe` | 43695 | 39365 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | type=code-highlighter，highlight()→codeToTokens 双主题 |
| SHIKI_CODE_HIGHLIGHTER | `TIe` | 43695 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | = wIe()    $Ve.code |
| createMathPlugin(katex) | `xE` | 44373 | 40012 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | remarkPlugin=sLe rehypePlugin=XIe |
| createMermaidPlugin | `rO` | 45986 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | mermaid(tO) initialize/render 门面 |
| HighlightedCodeBlock | `MO` | 47501 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | ZCode 代码查看器高亮体（注释/行选择；本文件仅接口） |
| mermaid | `Mze` | 47690–47716 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| mermaid | `Nze` | 47690–47716 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| mermaid | `PO` | 47690–47716 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| mermaid | `jze` | 47690–47716 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| MermaidInlinePreview | `BO` | 47847 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | mermaid svg，失败降级 pre |
| CodeBlockUiContext | `fk` | 48576 | 43777 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | {code,mermaidPreviewAvailable,openMermaidPreview,toggleWrapLongLines,wrapLongLines} |
| CodeBlockFrame | `nBe` | 48583 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | content-visibility 容器 |
| ZCodeCodeBlockHeader | `pk` | 48592 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | ：文件图标+语言名+折行/复制（mermaid→预览按钮） |
| ZCodeCodeBlock | `gk` | 48634 | 43873 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | ：fk ctx + mermaid 内嵌/全屏 + MO 高亮体 |
| TableEdgeShadow | `Ik` | 49699 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| thead | `FBe` | 49723–49744 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /tbody/tr/th/td 渲染器 |
| thead | `IBe` | 49723–49744 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /tbody/tr/th/td 渲染器 |
| thead | `LBe` | 49723–49744 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /tbody/tr/th/td 渲染器 |
| thead | `NBe` | 49723–49744 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /tbody/tr/th/td 渲染器 |
| thead | `PBe` | 49723–49744 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /tbody/tr/th/td 渲染器 |
| 路径归一助手群 | `aVe` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `cVe` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `dA` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `fA` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `iVe` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `mA` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `oVe` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `pA` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 路径归一助手群 | `sVe` | 50405–50466 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| parseFileHref | `hA` | 50467 | 45323 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | path[:line[:col]] / #L 解析 |
| resolveWorkspaceFileLink | `gA` | 50491 | 45368 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | href → 工作区相对/绝对路径判定 |
| collapseSeparatedImageBlocks | `uVe` | 50511 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| MarkdownParagraphImageGallery | `dVe` | 50542 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | → qk 画廊组 |
| MarkdownImage | `mVe` | 50561 | 45449 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | readMediaPreview + 灯箱 Wk |
| STREAMDOWN_CONTROLS | `hVe` | 50712 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | {table:{fullscreen:false}} |
| isInAppBrowserUrl | `kVe` | 50817 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| zcode | `DA` | 50846–50856 | 45668 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | -last-editor-id 记忆 |
| zcode | `EA` | 50846–50856 | 45668 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | -last-editor-id 记忆 |
| zcode | `OA` | 50846–50856 | 45668 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | -last-editor-id 记忆 |
| zcode | `kA` | 50846–50856 | 45668 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | -last-editor-id 记忆 |
| useRemoteWorkspaceInfo | `$A` | 51166–51174 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | tabs store → isRemoteWorkspace/remoteTarget |
| useRemoteWorkspaceInfo | `QVe` | 51166–51174 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | tabs store → isRemoteWorkspace/remoteTarget |
| STREAMDOWN_PLUGINS | `$Ve` | 51186 | 46054 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | {cjk:vIe, code:TIe, math:xE({singleDollarTextMath:!0}), mermaid:RRe} |
| LINK_SAFETY_DISABLED | `eHe` | 51187 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | {enabled:false} |
| fnv1aLengthHash | `fHe` | 51207 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | resetKey 用内容指纹 |
| 数学 $ 转义助手群 | `_He` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `aj` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `gHe` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `hHe` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `ij` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `mHe` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `pHe` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| 数学 $ 转义助手群 | `vHe` | 51218–51288 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| escapeStrayMathDollars | `yHe` | 51289 | 46167 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | $ 转义（代码栅栏段豁免） |
| MarkdownRenderErrorBoundary | `xHe` | 51318 | 46198 | MarkdownIntegration.tsx | styles-CdEGpc2x.js |  |
| rehypeFileLinksPlugin | `wHe` | 51373 | 46226 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | a[href]/img[src] 工作区相对路径 → SHe 规范 href |
| REHYPE_PLUGINS | `THe` | 51388 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | [wHe, ...Object.values(Mre)]  文件链接 href 重写 + 默认表 |
| codeBlockScopeKey | `DHe` | 51398 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | :字号:折行:工作区三元 → Pre 的 React key |
| languageFromClass | `OHe` | 51408 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | `language-xxx` 提取 |
| childrenToText | `oj` | 51411 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | React children → 纯文本 |
| buildFileLinkModel | `MHe` | 51430 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | pathKind=directory 判定 + relativePath |
| openFileLinkInEditor | `NHe` | 51441 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | stat → pathKind → openInEditor |
| ExternalLinkWithContextMenu | `IHe` | 51461 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | app-browser/external-browser 分流 |
| FileLinkButton | `LHe` | 51508 | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | forwardRef 图标+label 按钮 |
| FileLinkWithContextMenu | `RHe` | 51537 | 46389 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /第三方编辑器菜单 |
| MarkdownRenderer(MessageResponse)会话消息流 | `cj` | 51688 | 46461 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | markdown 渲染入口 |
| bundledLanguages | `dQ` | 100542 | 86706 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | ~200 条 import() 动态分包 |
| AssistantMessageRow | `hvt` | 112357 | 95832 | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (memo)  cj 的消费方：streaming=row.state==='streaming'，children=row.text |
| LINE_NUMBER_CLASS | `Dv` | — | 15445 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | CSS counter 类（before:content-[counter(line)]…） |
| parseInlineStyle | `Ov` | — | 15446 | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | "k:v;k2:v2" → 对象；导出别名 parseInlineStyle; （上游内联助手） |
| marked | `$_` | — | — | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | `Lexer`（$.lex 静态）        17.x    (js 17333 / jsx 13923+) |
| isWorkspaceLikeHref | `CHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51356) |
| resolveCodeBlockTheme | `EHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | system→matchMedia；dark |
| ClassNamesContext | `Ev` | — | — | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | createContext(Sv)（可注入自定义合并器）(18615 附近 / 15443) |
| resolveMermaidControl | `Ey` | — | — | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | controls.mermaid.{download |
| isHttpUrl | `FHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51453) |
| resolveAvailableEditors | `JA` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51052) |
| MarkdownTableStickyScrollbar | `MBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | +粘性横向滚动条+全屏预览 (49090，本文件仅接口+几何助手) |
| IsStreamingContext | `MarkdownProcessor` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （末块未完成标记）→ |
| MarkdownA | `My` | — | — | MarkdownLink.tsx | chunk-BO2N2NFS-CSNAeaxF.js | <a> 元素组件（memo；linkSafety 开启时改渲染为 |
| isMermaidLanguage | `NO` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (47661) |
| isMermaidBlock | `Oze` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (47677) |
| trimTrailingNewlines2 | `PHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51450) |
| mermaidAutoRenderGate | `Pze` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (47717) |
| useClassNames | `Q` | — | — | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | () => useContext(Ev) (18616 附近 / 15444) |
| useWorkspaceFileServices | `QA` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51093，接口) |
| Streamdown | `Qb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （上游导出 Streamdown=C；构建导出别名 r， |
| MermaidFullscreenDialog | `Qze` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (48221，本文件仅接口) |
| MERMAID_PLUGIN | `RRe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | = rO() (45986) |
| buildFileHrefWithLine | `SHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51340) |
| bundledLanguages | `Td` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | 映射 (12440) |
| resolveCodeControl | `Ty` | — | — | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | controls.code.{download |
| DEFAULT_REHYPE_PLUGINS | `Ub` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | {raw, sanitize:[…], harden:[…]}（上游导出 y； |
| ImageLightbox | `Wk` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (49834，接口) |
| StreamdownOptionsContext | `Xb` | — | — | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | {shikiTheme, controls, isAnimating, lineNumbers, |
| StreamdownContext | `Xb` | — | — | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （shikiTheme/controls/isAnimating/ |
| R | `Xb` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | 来自 ; 导出别名 i; -> StreamdownOptionsContext   （shikiTheme 等全局选项上下文） |
| Block | `Zb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （memo；dir 包裹；IsStreaming 注入） |
| identity | `_b` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | / removeRawNode / transformElementUrls / |
| WrapLongLinesButton | `_k` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (48720) |
| TableWrapper | `_y` | — | — | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | + 控件条（data-streamdown=table-wrapper） |
| blockquote | `aBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…) |
| LAZY_RENDER_DEBOUNCE_MS | `av` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | =300 / ROOT_MARGIN='300px' / |
| resolveStreamdownMode | `bHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | streaming |
| LazyMermaid | `by` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | lazy(() => import('./mermaid-GHXKKRXX-…').Mermaid) |
| tailwind | `c` | — | — | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -merge `twMerge` / clsx    3.5.0/2.1.1（独立 chunk |
| HighlightedCodeBlockBody | `c` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | 导出别名 HighlightedCodeBlockBody; |
| blockquote | `cBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…) |
| useLazyRender | `cv` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | IntersectionObserver+requestIdleCallback 懒渲染钩子 |
| codeHeaderDisplayKey | `eBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (48553) |
| Mermaid | `ex` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | Mermaid React 组件（导出别名 a；data-streamdown=mermaid） |
| LinkSafetyModal | `ey` | — | — | MarkdownLink.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （复制链接/打开；Escape/点击背景关闭） |
| escapeMarkdownTableCell | `fy` | — | — | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | 单元格 `\`/` |
| identity | `gb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | / removeRawNode / transformElementUrls / |
| identity | `hb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | / removeRawNode / transformElementUrls / |
| MermaidOpenPreviewButton | `iBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (48745) |
| parseMarkdownIntoBlocks | `jb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | marked.lex 块切分 + 未闭合 HTML/数学合并 |
| trimChildrenText | `kHe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (51420) |
| CodeBlockBody | `kv` | — | — | MarkdownCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | shiki token 渲染（导出别名 t，被 |
| At | `kv` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | 来自 ; 导出别名 t; -> CodeBlockBody              （shiki token 渲染 memo 组件） |
| TableCopyDropdown | `my` | — | — | MarkdownTable.tsx | chunk-BO2N2NFS-CSNAeaxF.js | （Markdown/CSV/TSV；clipboard.write |
| CODE_FENCE_REGEX | `nb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | /^[ \t]{0,3}(`{3,} |
| ReactInterop | `o` | — | — | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | e(t(),1)（react 默认导出互操作） |
| ReactInterop | `o` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | （`e(t(), 1)`，取 react 默认导出） |
| blockquote | `oBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…) |
| LAZY_RENDER_DEBOUNCE_MS | `ov` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | =300 / ROOT_MARGIN='300px' / |
| ImageGalleryGroup | `qk` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (50117，接口) |
| useCodeHighlighter | `ry` | — | — | MarkdownContext.tsx | chunk-BO2N2NFS-CSNAeaxF.js | plugins?.code ?? null（导出别名 n，被 |
| Li | `ry` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | 来自 ; 导出别名 n; -> useCodeHighlighter         （取上下文中的 .code 高亮器） |
| jsxRuntime | `s` | — | — | HighlightedCodeBlock.tsx | chunk-BO2N2NFS-CSNAeaxF.js | n()（jsx-runtime 命名空间互操作） |
| tailwind | `s` | — | — | MarkdownVendored.tsx | chunk-BO2N2NFS-CSNAeaxF.js | -merge `twMerge` / clsx    3.5.0/2.1.1（独立 chunk |
| jsxRuntime | `s` | — | — | highlightedCodeBlockBody.tsx | highlighted-body-OFNGDK62-RS9ZmWFH.js | （`n()`，取 jsx-runtime 命名空间） |
| blockquote | `sBe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | /ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…) |
| MarkdownHeading | `sj` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | h1-h6 分级标题渲染器 (51673 / —) |
| LAZY_RENDER_DEBOUNCE_MS | `sv` | — | — | MarkdownMermaid.tsx | chunk-BO2N2NFS-CSNAeaxF.js | =300 / ROOT_MARGIN='300px' / |
| file | `tVe/nVe/rVe` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | :// / Win 盘 / 系统根目录集 (50458–50466) |
| identity | `vb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | / removeRawNode / transformElementUrls / |
| CopyCodeButton | `vk` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (48775) |
| resolveTableControl | `wy` | — | — | MarkdownElements.tsx | chunk-BO2N2NFS-CSNAeaxF.js | controls.table.{copy |
| identity | `yb` | — | — | MarkdownRenderer.tsx | chunk-BO2N2NFS-CSNAeaxF.js | / removeRawNode / transformElementUrls / |
| createAnimatePlugin | `yv` | — | — | MarkdownAnimate.tsx | chunk-BO2N2NFS-CSNAeaxF.js | ：返回 {name:'animate', type:'animate', |
| relativePathFromWorkspace | `zA` | — | — | MarkdownIntegration.tsx | styles-CdEGpc2x.js | (50919) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `s`/`c`（bundle-mjs） | twMerge / clsx | bundle-mjs-D8tLE0rB.js（外部） |
| `Pre`（构建导出 `r`） | Streamdown | MarkdownRenderer.tsx（chunk-BO2N2NFS 自产） |
| `Mre`（构建导出 `o`） | DEFAULT_REHYPE_PLUGINS | MarkdownRenderer.tsx |
| `Xb`/`ry`/`kv`（导出 `i`/`n`/`t`） | StreamdownContext / useCodeHighlighter / CodeBlockBody | MarkdownContext.tsx / MarkdownCodeBlock.tsx（供 highlighted-body 消费） |
| `Id` | shiki 工厂（getSingletonHighlighter 面） | styles-CdEGpc2x.js 13191（+ wasm-B4ap0Fdc.js） |
| `TIe/wIe`/`vIe`/`xE`/`RRe` | shiki/cjk/katex/mermaid 插件 | MarkdownIntegration.tsx（styles 侧注入） |
| `katex` | 数学渲染 | katex-fHRr5Rbn.js（外部，经 styles 注入） |
| `lo` | 代码预览缺省设置 | stores-core.tsx（SettingsStore 域，styles 1040） |
| `Wk` | 画廊灯箱 | styles 本 chunk（F19 深层，接口级） |
| vendored 段（js 18–18291） | parse5/micromark/unified/remark/rehype/marked/remend… | streamdown@2.5.0 依赖树（MarkdownVendored.tsx 登记） |

## 17. stores

- 族登记：横切层 · zustand 20 store
- 产物：stores-core/session/tasks/workspace.tsx / Stores.report.md
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| SettingsStore | `Mie 工厂/ko 钩子` | 1140–1286 | — | stores-core.tsx | styles-CdEGpc2x.js | 横切（F06 消费） |
| SearchResultsStore | `Vo` | 1553–2609 | — | stores-session.tsx | styles-CdEGpc2x.js | F05 |
| TrajectoryViewerStore | `ls` | 2610–2637 | — | stores-session.tsx | styles-CdEGpc2x.js | F04 |
| SessionRegistryStore | `Zs` | 4309–4352 | — | stores-core.tsx | styles-CdEGpc2x.js | 横切（F07 消费） |
| McpStore | `Ug` | 25007–25973 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F06 |
| FeedbackStore | `yC` | 36992–37066 | — | stores-core.tsx | styles-CdEGpc2x.js | F09 |
| SkillContextStore | `UB` | 63592–63845 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F08 |
| SelectionScopesStore | `yH` | 67554–67560 | — | stores-core.tsx | styles-CdEGpc2x.js | F03 |
| CodeCommentsStore | `FH` | 68514–68579 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F14 |
| OffPeakTaskStore | `bX` | 91368–91590 | — | stores-tasks.tsx | styles-CdEGpc2x.js | F15 |
| SplitLayoutStore | `s2` | 121669–121891 | — | stores-session.tsx | styles-CdEGpc2x.js | F07 |
| SessionRouterStore | `A2` | 122619–122802 | — | stores-session.tsx | styles-CdEGpc2x.js | F07 |
| ConfirmDialogStore | `H2` | 123480–123492 | — | stores-core.tsx | styles-CdEGpc2x.js | F09 |
| PinnedTaskListStore | `E6` | 142372–142463 | — | stores-tasks.tsx | styles-CdEGpc2x.js | F01 |
| CommandsStore | `F6` | 142754–142984 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F06 |
| PluginsStore | `B6` | 142985–143100 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F06 |
| HooksStore | `Z0t` | 201244–201421 | — | stores-workspace.tsx | styles-CdEGpc2x.js | F06 |
| AlertDialogStore | `N9` | 206514–206560 | — | stores-core.tsx | styles-CdEGpc2x.js | F09 |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Ae` | zustand create | skillStore-BmeKHDBI.js（外部，q 导出） |
| `ne` | useStoreWithSelector | skillStore-BmeKHDBI.js（外部，J 导出） |
| `J` | logger | logger.tsx |
| `He`/`We`/`Be` | localStorage 读/写/可写判定 | **I18n.tsx**（IntlProvider chunk 导出 o/s/a） |
| `K` | zod（schema 表达） | src-HCld2afU.js（外部） |
| `xe`/`Ne` | useTaskStore / useSkillsStore | skillStore-BmeKHDBI.js（外部，跨 chunk，不在 20 数内） |

## 18. services

- 族登记：横切层 · services/IPC/命令队列
- 产物：services.tsx / Stores.report.md §2
- 来源：styles-CdEGpc2x.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| useSessionService | `Ag` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| VSBuffer | `As` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| ClientMessageType | `Bs` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 面板作用域 provider | `DT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| useResolvedWorkspaceServices | `Dc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| useBaseServices | `Ec/qse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 解析助手 | `Gse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| ChannelState | `Hs` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 远端会话解析 | `Hse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| toDisposable | `Koe/qoe` | — | — | services.tsx | styles-CdEGpc2x.js | /onceFn |
| 解析助手 | `Kse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| readVarint | `Ms/Ns` | — | — | services.tsx | styles-CdEGpc2x.js | /writeVarint |
| useWorkspaceServices | `Oc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| Event | `Os` | — | — | services.tsx | styles-CdEGpc2x.js | 工具（None/once/toPromise/filter/map） |
| ValueType | `Ps` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| WorkspaceSubscriptionSet | `QAe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| serializeValue | `Rs/zs` | — | — | services.tsx | styles-CdEGpc2x.js | /deserializeValue |
| TelemetryScope | `ST/CT/xFe/wT/SFe` | — | — | services.tsx | styles-CdEGpc2x.js | provider/钩子（服务作用域） |
| 面板作用域 provider | `TFe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| V4Conversation | `TT/CFe/wFe/ET` | — | — | services.tsx | styles-CdEGpc2x.js | provider/钩子（工作区作用域） |
| 解析助手 | `Tc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| ServiceProxy | `Us` | — | — | services.tsx | styles-CdEGpc2x.js | （fromService/toService） |
| 断开占位服务 | `Use` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| store | `VS/HS/BS` | — | — | services.tsx | styles-CdEGpc2x.js | 池 |
| ServerMessageType | `Vs` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| isEventName | `Ws/Gs` | — | — | services.tsx | styles-CdEGpc2x.js | /isDynamicEventName |
| 解析助手 | `Wse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| SessionIndexStore | `XAe` | — | — | services.tsx | styles-CdEGpc2x.js | （v4-sessions-index 订阅/恢复状态机） |
| 会话命令 schema 表 \| | `Yke` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| BufferReader | `Yoe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `_Fe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `_T` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 远端会话解析 | `_c` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| ChannelClient | `ase` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `bFe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| FrameAssembler | `bS` | — | — | services.tsx | styles-CdEGpc2x.js | （流帧装配，15 种 proto.frameAssembly* 故障码） |
| 远端会话解析 | `bc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| fact | `dT/fT/pT/fFe/pFe/mFe/mT` | — | — | services.tsx | styles-CdEGpc2x.js | 助手 |
| ServiceProvider | `ds/fs/ps` | — | — | services.tsx | styles-CdEGpc2x.js | /useServices/useServicesOptional |
| 任务未读通知去重 \| v4 会话协议 zod schema | `dx` | — | — | services.tsx | styles-CdEGpc2x.js | （qOe 队列项： |
| 遥测监督注册表 \| | `gT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 远端会话解析 | `gc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| ConversationTelemetrySupervisor | `hT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| MessagePortStreamProtocol | `ise` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| BufferWriter | `js` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| Emitter | `ks` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| bufferFirstListenerEvent | `ose` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| provider | `qs/lse/vse/Ys/hse/gse/_se` | — | — | services.tsx | styles-CdEGpc2x.js | registry 同步 |
| useGlobalKeyboardShortcuts | `rge` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| isFlowControlMessage | `rse` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| toBase64 | `tse/nse` | — | — | services.tsx | styles-CdEGpc2x.js | /fromBase64 |
| BoundedStringSet | `uT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 任务未读通知去重 \| v4 会话协议 zod schema | `ux` | — | — | services.tsx | styles-CdEGpc2x.js | （qOe 队列项： |
| 遥测监督注册表 \| | `vFe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `vT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 远端会话解析 | `vc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 断开占位服务 | `wc` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `xT` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 遥测监督注册表 \| | `yFe` | — | — | services.tsx | styles-CdEGpc2x.js |  |
| 远端会话解析 | `yc` | — | — | services.tsx | styles-CdEGpc2x.js |  |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Q` | React | react-BQLj9xdT.js（外部） |
| `J` | logger | logger.tsx |
| `K` | zod（命令队列 schema 本体） | src-HCld2afU.js（外部） |
| `Zs` | SessionRegistryStore | stores-core.tsx |
| `ise`/`ase`/`Us` | MessagePort 流客户端 / ChannelClient / ServiceProxy | services.tsx（本文件重建；入口经 rendererEntry.tsx 接线） |
| `rge` | useGlobalShortcuts | services.tsx（24015–24078；消费在 WorkspaceShell.tsx） |

## 19. i18n

- 族登记：横切层 · 自研 i18n（★ canonical = I18n.tsx）
- 产物：I18n.tsx（canonical）/ intlProvider.tsx（DUPLICATE-OF）· I18n.report.md + intlProvider.report.md
- 来源：IntlProvider-C321H7m8.js（9,253 行；词典 48–9085 逐字节）

> ★ **canonical = I18n.tsx**（D8 Stage B2 标样版；词典 zh-CN/en-US 各 4,503 key 逐字节）。`intlProvider.tsx` 为同源重复版（`DUPLICATE-OF: I18n.tsx`），其行级登记见下表但词典引用一律以 I18n.tsx 为准。

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| getStorage | `a` | 6 | — | I18n.tsx | IntlProvider-C321H7m8.js | try 取 window.localStorage / localStorage；i → ZH_CN_MESSAGES      n → useZCodeIntl |
| isReadableStorage | `o` | 17 | — | I18n.tsx | IntlProvider-C321H7m8.js | getItem；r → EN_US_MESSAGES      s → writeLocalStorageItem |
| isWritableStorage | `s` | 20 | — | I18n.tsx | IntlProvider-C321H7m8.js | setItem |
| getReadableStorage | `c` | 23 | — | I18n.tsx | IntlProvider-C321H7m8.js | null |
| getWritableStorage | `l` | 27 | — | I18n.tsx | IntlProvider-C321H7m8.js | null        [导出别名 a]；、待回环比对的载荷 |
| readLocalStorageItem | `u` | 31 | — | I18n.tsx | IntlProvider-C321H7m8.js | → null      [导出别名 o] |
| writeLocalStorageItem | `d` | 38 | — | I18n.tsx | IntlProvider-C321H7m8.js | [导出别名 s] |
| getNavigatorLanguage | `f` | 43 | — | I18n.tsx | IntlProvider-C321H7m8.js | → null |
| ZH_CN_MESSAGES | `p` | 48–4564 | — | I18n.tsx | IntlProvider-C321H7m8.js | [导出别名 i]；（防异步竞态） |
| EN_US_MESSAGES | `m` | 4565–9085 | — | I18n.tsx | IntlProvider-C321H7m8.js | [导出别名 r]；navigator.language → zh-CN/en-US/缺省 |
| jsx | `h` | 9086 | — | I18n.tsx | IntlProvider-C321H7m8.js | （n()）                    重建版直接写 JSX，无对应符号 |
| MESSAGES_BY_LOCALE | `g` | 9087 | — | I18n.tsx | IntlProvider-C321H7m8.js | { "zh-CN": p, "en-US": m }；→ 支持语言兜底 |
| LOCALE_PREFERENCE_STORAGE_KEY | `_` | 9088 | — | I18n.tsx | IntlProvider-C321H7m8.js | = 'zcode-locale-preference' |
| LOCALE_BROADCAST_CHANNEL | `v` | 9089 | — | I18n.tsx | IntlProvider-C321H7m8.js | = 'state:locale' |
| parseLocaleBroadcastPayload | `x` | 9096 | — | I18n.tsx | IntlProvider-C321H7m8.js | {preference, resolvedLocale} |
| resolveInitialLocalePreference | `S` | 9104 | — | I18n.tsx | IntlProvider-C321H7m8.js |  |
| isRelevantLocaleBroadcast | `C` | 9112 | — | I18n.tsx | IntlProvider-C321H7m8.js | +载荷+回环判定 |
| createIntl | `w` | 9122 | — | I18n.tsx | IntlProvider-C321H7m8.js | formatMessage 工厂 |
| ZCodeIntlContext | `T` | 9132 | — | I18n.tsx | IntlProvider-C321H7m8.js | createContext(null) |
| ZCodeIntlProvider | `E` | 9133–9247 | — | I18n.tsx | IntlProvider-C321H7m8.js | [导出别名 t]；'zcode-locale-preference' |
| localePreference | `O` | 9159 | — | I18n.tsx | IntlProvider-C321H7m8.js | 初值 initialLocale ?? 存储 ?? 'system' |
| localePreference | `k` | 9159 | — | I18n.tsx | IntlProvider-C321H7m8.js | 初值 initialLocale ?? 存储 ?? 'system' |
| systemLocale | `A` | 9160 | — | I18n.tsx | IntlProvider-C321H7m8.js | 初值 resolveNavigatorLocale() |
| systemLocale | `j` | 9160 | — | I18n.tsx | IntlProvider-C321H7m8.js | 初值 resolveNavigatorLocale() |
| persistToSettingService | `M` | 9161 | — | I18n.tsx | IntlProvider-C321H7m8.js | update，错误吞掉 |
| effectiveLocale | `N` | 9191 | — | I18n.tsx | IntlProvider-C321H7m8.js | preference==='system' ? systemLocale : preference |
| setLocalePreference | `P` | 9192–9214 | — | I18n.tsx | IntlProvider-C321H7m8.js | ：代际+1、存储、广播、持久化 |
| setLocale | `F` | 9233 | — | I18n.tsx | IntlProvider-C321H7m8.js | （= setLocalePreference） |
| intl | `I` | 9239 | — | I18n.tsx | IntlProvider-C321H7m8.js | useMemo(createIntl(effectiveLocale)) |
| useZCodeIntl | `D` | 9248–9252 | — | I18n.tsx | IntlProvider-C321H7m8.js | [导出别名 n]；'zcode-locale-preference' |
| isRelevantLocaleBroadcast | `C` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 广播相关性/回环过滤 |
| useZCodeIntl | `D` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 n; 国际化上下文 hook |
| ZCodeIntlProvider | `E` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 t; 国际化 Provider |
| resolveInitialLocalePreference | `S` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 初始偏好裁决 |
| ZCodeIntlContext | `T` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 上下文对象 |
| LOCALE_PREFERENCE_STORAGE_KEY | `_` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 'zcode-locale-preference' |
| getStorage | `a` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 安全取 localStorage |
| fileActions | `appHeader` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → workspaceHeader → titleBar → directoryBrowser → |
| isValidLocalePreference | `b` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | (9093)  'system' |
| isLocalePreference | `b` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | system/语言 判定 |
| welcome | `bots` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → login → app → logout → sidebar → browser → diff → sidePane → |
| getReadableStorage | `c` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 取可读存储 |
| settings | `common` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → carousel → quickPick → commandCenter → confirmDialog → |
| writeLocalStorageItem | `d` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 s; 写 localStorage 项 |
| postUpdateReleaseNotes | `desktopMenu` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → projectSelector → appError → |
| markdownImage | `developerTools` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → mode → todo → planTool → zcode → debugInfo → |
| DEFAULT_LOCALE | `e` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 来自 ; 导出别名 Ps; 缺省语言常量 'zh-CN' |
| getNavigatorLanguage | `f` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | navigator.language 探测 |
| terminal | `fileTree` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → v4Pane → taskGroup → taskSearch → taskTimeline → |
| MESSAGE_CATALOGS | `g` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 语言 -> 目录映射 |
| jsxRuntime | `h` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | （n()，jsx-runtime 命名空间） |
| getWritableStorage | `l` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 a; 取可写 localStorage |
| EN_US_MESSAGES | `m` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 r; en-US 文案目录（约 4500 条） |
| isReadableStorage | `o` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 可读判定 |
| ZH_CN_MESSAGES | `p` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 i; zh-CN 文案目录（约 4500 条） |
| feedback | `processMonitor` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → forms → automations → offPeak → scheduledPreview。 |
| webRemoteControl | `remoteConnection` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → server → wsl → docker → locale → |
| git | `repoWiki` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → gitGraph → codeViewer → codeBlock → markdownTable → |
| isWritableStorage | `s` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 可写判定 |
| chat | `subagentDirectory` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → whiteboard → treemapping → modelTrajectory → |
| ZCodeIntlProvider | `t` | — | — | I18n.tsx | IntlProvider-C321H7m8.js |  |
| notification | `taskNav` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → usage → settingsSync → onboarding → tokenDebug → |
| readLocalStorageItem | `u` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 导出别名 o; 读 localStorage 项 |
| updateAvailable | `updateReady` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → updateDialog → update → forceUpdate → |
| LOCALE_BROADCAST_CHANNEL | `v` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 'state:locale' |
| createIntlShim | `w` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | formatMessage 精简实现 |
| taskList | `workspace` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | → workspaceSidebar → workspaceFileTree → ssh → remote → |
| parseLocaleBroadcastPayload | `x` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 广播载荷解析 |
| isSupportedLocale | `y` | — | — | I18n.tsx | IntlProvider-C321H7m8.js | (9090)  'zh-CN' |
| isSupportedLocale | `y` | — | — | intlProvider.tsx | IntlProvider-C321H7m8.js | 'zh-CN' \| 'en-US' 判定 |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Ps` | DEFAULT_LOCALE 'zh-CN' | src-HCld2afU.js（外部，行 1 `var e='zh-CN'`） |
| `s`（导入） | __toESM | chunk-Cq_f4orQ.js（外部 interop） |
| React CJS / jsx 运行时 | — | react-BQLj9xdT.js / jsx-runtime-B5yMD3-t.js |

**消费方（7 chunk）**：index-ABImDspU.js（`t`=ZCodeIntlProvider，rendererEntry.tsx 接线）；styles-CdEGpc2x.js（全 7 导出：`G`=useZCodeIntl×408、`He/We`=SettingsStore 持久化、`Be`=侧栏偏好、`Ve/Ue/Ge` 互操作残留）；三个用量图 chunk + xlsx chunk（`n`=useZCodeIntl）；usageStatsUiParts（模块图边）。

## 20. charts

- 族登记：F12 用量图表 + shadcn chart 包装
- 产物：ChartShadcn.tsx + appUsage*.tsx + codingPlanUsageLineChart.tsx / ChartUtilsIme.report.md + chartVendor.report.md + 各图报告
- 来源：chart-iT2j9K3u.js（recharts@3.8.0 vendored + shadcn 层 14137–14344）+ 3 个图表 chunk

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| jsxRuntime | `$` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | （r()，jsx-runtime 命名空间） |
| jsxRuntime | `$` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | （r()，jsx-runtime 命名空间） |
| USAGE_CHART_COLORS | `$` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 6 色 CSS 变量调色板（内联副本） |
| useChart | `BT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; 容器外调用抛错（本文件 export 以便引用） |
| CodingPlanUsageLineChart | `Ct` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 导出别名 CodingPlanUsageLineChart; （原导出未混淆）；主组件 |
| ChartLegend | `GT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 n; = recharts Legend 再导出（GT = Ju） |
| buildDailyModelUsageRows | `Gt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 按日聚合 + 字典序排序 |
| ChartStyle | `HT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; <style> CSS 变量注入器（保持不导出） |
| filterPositiveTooltipEntries | `Ht` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | tooltip 正值过滤 |
| AppUsageDailyModelBarChart | `Jt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 导出别名 AppUsageDailyModelBarChart; （原导出未混淆） |
| ChartLegendContent | `KT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 r; 图例内容（色块/图标 + label） |
| prepareDailyModelBarChartModel | `Kt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 前 6 模型 + 配色 + chartConfig |
| THEMES | `LT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; { light: '', dark: '.dark' } |
| MAX_PIE_SLICES | `Q` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | 分片上限 6 |
| jsxRuntime | `Q` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | （r()，jsx-runtime 命名空间） |
| AppUsageModelUsagePieChart | `Qt` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | 导出别名 AppUsageModelUsagePieChart; （原导出未混淆）；主组件 |
| FALLBACK_CONTAINER_DIMENSIONS | `RT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; { width: 320, height: 200 } |
| buildLineChartData | `St` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 行组装（缺失补 0） |
| ChartTooltip | `UT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 i; = recharts Tooltip 再导出（UT = xb） |
| shouldShowDateTick | `Ut` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 刻度稀疏化（14/45 阈值） |
| ChartContainer | `VT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 t; 图表容器（context + CSS 变量 + 自适应） |
| DAILY_MODEL_BAR_CHART_MARGIN | `Vt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 图表外边距 {8,24,24} |
| ChartTooltipContent | `WT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 a; tooltip 内容（label/指示器/条目渲染） |
| createEmptyDailyUsageRow | `Wt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 空行工厂 |
| prepareModelPieChartData | `Xt` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | 前 5 + Other 分片 + 占比 |
| getPieModelLabel | `Yt` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | 模型名兜底 |
| PIE_CHART_MARGIN | `Zt` | — | — | appUsageModelUsagePieChart.tsx | AppUsageModelUsagePieChart-_KCE1AAL.js | 四周 4px |
| useMouseEnterItemDispatch | `a` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 导出别名 r; 鼠标进入数据项事件 hook（recharts 上游同名） |
| formatTimeLabel | `bt` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 小时截取/日格式化 |
| USAGE_CHART_COLORS | `c` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 6 色 CSS 变量调色板数组 |
| useAppDispatch | `e` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 来自 ; 导出别名 Tn; recharts state/hooks.js |
| Cell | `i` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 导出别名 a; recharts Cell 占位组件 |
| getUsageChartColor | `l` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 导出别名 t; 调色板取色函数 |
| mouseLeaveItem | `n` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 来自 ; 导出别名 Y; recharts state/tooltipSlice.js |
| useMouseLeaveItemDispatch | `o` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 导出别名 i; 鼠标离开数据项事件 hook（recharts 上游同名） |
| getPayloadConfigFromPayload | `qT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; 条目→配置反查（保持不导出） |
| PositiveEntriesTooltip | `qt` | — | — | appUsageDailyModelBarChart.tsx | AppUsageDailyModelBarChart-037NXfkz.js | 过滤型 tooltip 内容 |
| setActiveMouseOverItemIndex | `r` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 来自 ; 导出别名 Z; recharts state/tooltipSlice.js |
| useMouseClickItemDispatch | `s` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 导出别名 n; 点击数据项事件 hook（recharts 上游同名） |
| setActiveClickItemIndex | `t` | — | — | appUsageChartPalette.tsx | appUsageChartPalette-BeN2wLzW.js | 来自 ; 导出别名 X; recharts state/tooltipSlice.js |
| CODING_PLAN_LINE_CHART_MARGIN | `vt` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 外边距 {8,12,8} |
| shouldShowTimeTick | `xt` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 刻度稀疏化（14/45 阈值） |
| getUsageChartColorLocal | `yt` | — | — | codingPlanUsageLineChart.tsx | CodingPlanUsageLineChart-BpNLwqMV.js | 取色（回绕+兜底） |
| ChartContext | `zT` | — | — | ChartShadcn.tsx | chart-iT2j9K3u.js | 导出别名 -; createContext(null)（本文件 export 以便引用） |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `Tn`/`X`/`Y`/`Z` | useAppDispatch / tooltipSlice 三 action | chart-iT2j9K3u.js（recharts@3.8.0 bundle；运行时验证） |
| `t`/`a`/`i`/`r` | ChartContainer / ChartTooltipContent / ChartTooltip / ChartLegendContent | ChartShadcn.tsx（shadcn 包装层 14137–14344 重建） |
| `n`（IntlProvider） | useZCodeIntl | **I18n.tsx** |
| `a`/`c`/`o`/`t`/`i`（usageStatsUiParts） | formatCompactNumber / getModelLabel / formatUsageDate / UsageEmptyState / formatTurnCount | usageStatsUiParts-CiR7YEhh.js（外部） |
| `t`（tiny-invariant） | invariant | tiny-invariant-Dm49c6Qj.js（外部） |
| CartesianChart/XAxis/YAxis/CartesianGrid | — | CartesianChart-nORn-0bc.js（外部 vendor 分包） |
| `z`/`R`/`Ae`/`Me`/`He`/`Ue`/`We` | getUsageChartColor / 事件 hook 三件 | appUsageChartPalette.tsx |
| 完整 recharts 别名表（~140） | — | chartVendor.report.md §3 |

## 21. office

- 族登记：Office 预览族（docx/legacy-doc/pptx）
- 产物：previewPaneOffice*.tsx + pptxEngine*.ts + pptxRendererPreviewEngine.tsx + pptxPreviewViewer.tsx + presentationPdfPrintExport.tsx / OfficePreview.report.md
- 来源：3 个 office chunk（**行号口径 = jsx pretty 版**）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| PRINT_HOST_ATTR | `e` | — | 1 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | `data-zcode-pptx-print-host` |
| PRINT_PAGE_ATTR | `t` | — | 2 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | `data-zcode-pptx-print-page` |
| PRINT_STYLE_ATTR | `n` | — | 3 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | `data-zcode-pptx-print-style` |
| IMAGE_DECODE_TIMEOUT_MS | `r` | — | 4 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | 10_000 |
| GENERIC_FONT_KEYWORDS | `i` | — | 5 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | serif/sans-serif/… 12 个 |
| FONT_PROBE_TEXTS | `a` | — | 7-11 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | latin/cjk/symbol 三套探针串 |
| FONTS_ALWAYS_MISSING_ON_MAC | `o` | — | 12 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | `pingfang sc`（Canvas 探针误报规避） |
| IconFileDown | `re` | — | 12-21 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | lucide `file-down` 图标 |
| CJK_SANS_FALLBACK_STACK | `s` | — | 13 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| CJK_SERIF_FALLBACK_STACK | `c` | — | 14 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| LATIN_SANS_FALLBACK_STACK | `l` | — | 15 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| LATIN_NARROW_FALLBACK_STACK | `u` | — | 16 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| LATIN_SERIF_FALLBACK_STACK | `d` | — | 17 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| LATIN_MONO_FALLBACK_STACK | `f` | — | 18 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| SYMBOL_FALLBACK_STACK | `p` | — | 19 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| unquoteFontName | `m` | — | 20 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| SlideAiEditPopover | `ie` | — | 24-117 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | AI 编辑/加入会话浮层 |
| splitFontFamilyList | `h` | — | 27 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | （引号/转义感知） |
| serializeFontName | `g` | — | 54 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ；含空白/引号加引号 |
| classifyTextScript | `_` | — | 61 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | Han/假名/谚文→cjk；字母数字→latin；否则 symbol |
| isGenericFontName | `v` | — | 65 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| isPingFangSc | `y` | — | 68 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| classifyFontKind | `b` | — | 71 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | mono/narrow/serif/sans |
| pickFallbackStack | `x` | — | 78 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | script×kind 选回退栈 |
| ensureGenericTail | `S` | — | 82 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| clampPageIndex | `ae` | — | 118-120 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | [1, pageCount] |
| clampZoomPercent | `E` | — | 121-123 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | [25, 300]，默认 100 |
| mapElementRectToSurface | `D` | — | 124-135 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | EMU 矩形 → 渲染面像素矩形 |
| formatPx | `E` | — | 136 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js |  |
| rectCenterInsideRect | `O` | — | 136-140 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js |  |
| rangeTextOffsetsInNode | `k` | — | 141-152 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | Range 与文本节点的交集偏移 |
| extractSelectedElementText | `oe` | — | 153-189 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | （限定元素矩形内） |
| nextFramePromise | `O` | — | 188 | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | rAF（降级 setTimeout 0） |
| isSameElementRef | `A` | — | 190-192 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js |  |
| clientPointToPageSize | `j` | — | 193-199 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | → 页面尺寸坐标 |
| SlideThumbnail | `se` | — | 271-323 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | （IntersectionObserver 懒渲染） |
| useElementSize | `ce` | — | 316-329 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | ResizeObserver 测尺寸 |
| PptxPreviewViewer | `N` | — | 330-612 | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | （导出名同名） |
| XmlNode | `N` | — | 3589-3638 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js | DOMParser 之上的链式 XML 包装类 |
| parseXml | `P` | — | 3639-3644 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| parseRels | `R` | — | 3658-3675 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| resolvePartPath | `z` | — | 3676-3686 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js | rels 目标 → 包内绝对路径 |
| emuToPx | `B` | — | 3687-3695 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| angleToDeg | `ee` | — | 3687-3695 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| ptToPx | `ne` | — | 3687-3695 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| alphaToUnit | `te` | — | 3687-3695 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| parseXmlBoolDefaultTrue | `ge` | — | 3899-3907 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| parseXmlBool | `he` | — | 3899-3907 | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| hex/rgb/hsl 互转 | `Dt` | — | 4984-5058 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| hex/rgb/hsl 互转 | `Et` | — | 4984-5058 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| hex/rgb/hsl 互转 | `Ot` | — | 4984-5058 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| hex/rgb/hsl 互转 | `kt` | — | 4984-5058 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| sRGB 线性化 / gamma | `At` | — | 5059-5064 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| sRGB 线性化 / gamma | `jt` | — | 5059-5064 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| alpha 钳制 + 变换管线 | `$t` | — | 5265-5360 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| alpha 钳制 + 变换管线 | `en` | — | 5265-5360 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 预设色名表（148 色） | `nn` | — | 5361-5522 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 预设色名表（148 色） | `tn` | — | 5361-5522 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 颜色缓存键 / 变换列表解析 | `an` | — | 5523-5547 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 颜色缓存键 / 变换列表解析 | `rn` | — | 5523-5547 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| CSS 输出 | `dn` | — | 5628-5645 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| CSS 输出 | `ln` | — | 5628-5645 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| CSS 输出 | `un` | — | 5628-5645 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变填充 CSS / 线型 / 虚线类别 | `gn` | — | 5751-5862 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变填充 CSS / 线型 / 虚线类别 | `hn` | — | 5751-5862 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变填充 CSS / 线型 / 虚线类别 | `mn` | — | 5751-5862 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `Sn` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `_n` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `bn` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `vn` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `xn` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| fillToRect 几何与渐变压缩 | `yn` | — | 5863-5912 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变数据模型（供 SVG 渲染） | `Cn` | — | 5913-5967 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变数据模型（供 SVG 渲染） | `wn` | — | 5913-5967 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 主题 fillStyles/bgFillStyles 解析 | `Dn` | — | 5968-6005 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 主题 fillStyles/bgFillStyles 解析 | `En` | — | 5968-6005 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 主题 fillStyles/bgFillStyles 解析 | `Tn` | — | 5968-6005 | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| +mj/+mn 主题字体令牌与脚本映射 | `hr` | — | 6462-6468 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| +mj/+mn 主题字体令牌与脚本映射 | `mr` | — | 6462-6468 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| +mj/+mn 主题字体令牌与脚本映射 | `pr` | — | 6462-6468 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 主题字体解析 / 字体栈去重 | `br` | — | 6489-6516 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 主题字体解析 / 字体栈去重 | `yr` | — | 6489-6516 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| defaultOptions | `xt` | — | 6636 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js |  |
| parseAsync | `St` | — | 6655 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | Je.load(data, new ut(opts), opts) |
| render | `Ct` | — | 6666 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | new yt().render(docx, opts) |
| renderAsync | `wt` | — | 6671 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | parse+render：STYLE 节点入 |
| jsxRuntime | `$` | — | 6679 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | （jsx-runtime 的 t 导入别名） |
| DOCX_PREVIEW_OPTIONS | `Tt` | — | 6680-6697 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | renderAsync 固定选项 |
| DOCX_PAGE_SHADOW | `Et` | — | 6698 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js |  |
| docxPreviewClassCounter | `Dt` | — | 6699 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js |  |
| createDocxPreviewClassName | `Ot` | — | 6700-6702 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | `zcode-docx-preview-N` |
| isSameDocxFitMetrics | `kt` | — | 6703-6707 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | fit 结果防抖比较 |
| PreviewPaneOfficeDocxContent | `At` | — | 6708-6776 | previewPaneOfficeDocxContent.tsx | previewPaneOfficeDocxContent-3JqWt7cf.js | （导出名同名） |
| glow / outerShdw 文字阴影 | `ei` | — | 6893-6922 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| glow / outerShdw 文字阴影 | `ni` | — | 6893-6922 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| glow / outerShdw 文字阴影 | `ti` | — | 6893-6922 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文字渐变/图案（background-clip: text） | `di` | — | 6963-6995 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文字渐变/图案（background-clip: text） | `fi` | — | 6963-6995 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 自动编号格式 / 罗马数字 | `mi` | — | 6996-7030 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 自动编号格式 / 罗马数字 | `pi` | — | 6996-7030 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| adj 值读取（千分比/原值） | `bi` | — | 7374-7378 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| adj 值读取（千分比/原值） | `yi` | — | 7374-7378 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| path 水平/垂直镜像变换 | `Ci` | — | 7399-7458 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| path 水平/垂直镜像变换 | `Si` | — | 7399-7458 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 多段路径拆分与弯箭头包装 | `Ei` | — | 8089-8150 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 多段路径拆分与弯箭头包装 | `Ti` | — | 8089-8150 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 多段路径拆分与弯箭头包装 | `wi` | — | 8089-8150 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| actionButton 度量 / 矩形 path | `Mi` | — | 9610-9628 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| actionButton 度量 / 矩形 path | `Ni` | — | 9610-9628 | pptxEngineGeometry.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `$i` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `Xi` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `Yi` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `Zi` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `aa` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `ea` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `ia` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `na` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `ra` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 文本体谓词 | `ta` | — | 10928-11085 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| transform/filter 追加助手 | `oa` | — | 11086-11095 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| transform/filter 追加助手 | `sa` | — | 11086-11095 | pptxEngineText.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 竖排/变换/滤镜追加 | `ca` | — | 11114-11125 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 竖排/变换/滤镜追加 | `fa` | — | 11114-11125 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 竖排/变换/滤镜追加 | `oa` | — | 11114-11125 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 竖排/变换/滤镜追加 | `sa` | — | 11114-11125 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 图片填充区域/裁剪 | `Da` | — | 11211-11247 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 图片填充区域/裁剪 | `Ea` | — | 11211-11247 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 图片填充区域/裁剪 | `Ta` | — | 11211-11247 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| SVG 外阴影/内阴影/软边缘滤镜 | `Aa` | — | 11248-11288 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| SVG 外阴影/内阴影/软边缘滤镜 | `Ma` | — | 11248-11288 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| SVG 外阴影/内阴影/软边缘滤镜 | `ja` | — | 11248-11288 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 颜色解析/混合/渐变角度 | `Fa` | — | 11418-11447 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 颜色解析/混合/渐变角度 | `Ia` | — | 11418-11447 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 颜色解析/混合/渐变角度 | `La` | — | 11418-11447 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 形状路径缓存 | `bo` | — | 11839-11862 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 形状路径缓存 | `yo` | — | 11839-11862 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| wasm 源注册组（initAndRegisterDocxWasm 等） | `br/xr/Sr/Cr/wr/Tr` | — | 11850-11879,36460 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 接口级登记（OfficePreview.report §3.2） |
| importDocx DOCX 导入管线（工作者优先+主线程回退+中止/计时） | `Er…Nr` | — | 11880-11993 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 逐句对照重建 |
| 页面缺省常量（900×1200/56px/15twips） | `Pr…Rr` | — | 11994-12010 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| parsePageGeometry（pgSz/pgMar/docGrid/pgBorders→px） | `zr…Yr` | — | 12011-12118 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| 图片路由/转换（TIFF→PNG via UTIF+encodePng；EMF/WMF 占位；缓存） | `Xr…vi` | — | 12119-12252 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| duotone/lum/biLevel 像素滤镜 | `Hs` | — | 13351-13435 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| duotone/lum/biLevel 像素滤镜 | `Us` | — | 13351-13435 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| duotone/lum/biLevel 像素滤镜 | `Vs` | — | 13351-13435 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderTableNode | `bc` | — | 14170-14284 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderTableNode | `vc` | — | 14170-14284 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderTableNode | `yc` | — | 14170-14284 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderGroupNode | `Oc` | — | 14359-14492 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderGroupNode | `kc` | — | 14359-14492 | pptxEngineRender.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| ptCount/索引有效性 | `Mc` | — | 14494-14507 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| ptCount/索引有效性 | `jc` | — | 14494-14507 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| strCache/numCache 提取 + formatCode | `Nc` | — | 14508-14527 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| strCache/numCache 提取 + formatCode | `Pc` | — | 14508-14527 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数字格式代码解析与数值格式化 | `Fc` | — | 14528-14597 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数字格式代码解析与数值格式化 | `Ic` | — | 14528-14597 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数字格式代码解析与数值格式化 | `Lc` | — | 14528-14597 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数字格式代码解析与数值格式化 | `Rc` | — | 14528-14597 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数值序列（含空白索引） | `Bc` | — | 14598-14631 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 数值序列（含空白索引） | `zc` | — | 14598-14631 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 字符串序列 + 日期序列号换算 | `Hc` | — | 14632-14643 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 字符串序列 + 日期序列号换算 | `Vc` | — | 14632-14643 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 布尔属性（缺省 true） | `Uc` | — | 14644-14648 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 布尔属性（缺省 true） | `Wc` | — | 14644-14648 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| useDocxModel（AbortController 守护） | `DS` | — | 36417-36459 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| docxModelKey（WeakMap 稳定键） | `AS` | — | 36463-36468 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| fitMetricsAlmostEqual | `jS` | — | 36469 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| DocxFitViewport（fit 三层+ResizeObserver） | `MS` | — | 36470-36504 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建 |
| PreviewPaneOfficeLegacyDocContent（chunk 导出） | `NS` | — | 36505-36533 | previewPaneOfficeLegacyDocContent.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 重建；行号=jsx |
| 渐变（zrender LinearGradient）/数据点样式 | `bW` | — | 41158-41217 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 渐变（zrender LinearGradient）/数据点样式 | `xW` | — | 41158-41217 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 显式字号标记（Symbol） | `AW` | — | 41232-41235 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 显式字号标记（Symbol） | `kW` | — | 41232-41235 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 气泡图（含轴扩展） | `XK` | — | 43689-43784 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 气泡图（含轴扩展） | `ZK` | — | 43689-43784 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 股票图（K 线/三序列自定义渲染） | `$K` | — | 43785-43997 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 股票图（K 线/三序列自定义渲染） | `QK` | — | 43785-43997 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 股票图（K 线/三序列自定义渲染） | `eq` | — | 43785-43997 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 类型分派 + 可合并判定 | `oq` | — | 43998-44030 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 类型分派 + 可合并判定 | `sq` | — | 43998-44030 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderChartNode（echarts 初始化/自适应） | `vq` | — | 44189-44265 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderChartNode（echarts 初始化/自适应） | `yq` | — | 44189-44265 | pptxEngineCharts.ts | pptxRendererPreviewEngine-BIIRLBue.js |  |
| renderPresentationToPrintHost | `A` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ：注入 style+host， |
| resolveAvailableFontStack | `C` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ：找到第一个可用字体起点， |
| buildPrintHostStylesheet | `D` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | @media screen 移出视口 / @media print |
| CSS | `EMU` | — | — | pptxEngineTypes.ts | pptxRendererPreviewEngine-BIIRLBue.js | px（96dpi：1in = 914400 EMU = 96px） |
| SlidePage | `M` | — | — | pptxPreviewViewer.tsx | pptx-preview-viewer-B1z6CWke.js | （引擎 renderPage 挂载 + |
| substituteMissingFontFamilies | `T` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ，按聚合 |
| narrow | `bebas` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ； |
| narrow | `condensed` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ； |
| 形状；pic → 图片；grpSp → 组； | `cxnSp` | — | — | pptxRendererPreviewEngine.tsx | pptxRendererPreviewEngine-BIIRLBue.js |  |
| 表格/图表/SmartArt/OLE 预览图。 | `graphicFrame` | — | — | pptxRendererPreviewEngine.tsx | pptxRendererPreviewEngine-BIIRLBue.js |  |
| preparePrintHost | `k` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | fonts.ready → 字体替换 → 图片 |
| narrow | `narrow` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ； |
| narrow | `oswald` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | ； |
| 图案 | `patt` | — | — | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js | （CSS 渐变模拟）；grp → 递归组填充；no → transparent。 |
| 颜色；grad → 线性/径向渐变串；blip → 空 | `solid` | — | — | pptxEngineColor.ts | pptxRendererPreviewEngine-BIIRLBue.js | （由图片渲染器处理）； |
| 形状；pic → 图片；grpSp → 组； | `sp` | — | — | pptxRendererPreviewEngine.tsx | pptxRendererPreviewEngine-BIIRLBue.js |  |
| createFontAvailabilityProbe | `w` | — | — | presentationPdfPrintExport.tsx | presentationPdfPrintExport-CsVZM-dn.js | Canvas measureText 三通用族差分 |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `en`（docx chunk V1） | JSZip 3.10.1 | previewPaneOfficeDocxContent chunk 内 vendored 6–3253（jsx） |
| `xt`/`wt` | docx-preview 0.4.0（defaultOptions/renderAsync） | 同 chunk vendored 3255–6677（jsx） |
| `s`（pptx chunk V1） | JSZip 3.10.1 | pptxRendererPreviewEngine chunk 13–3262（jsx） |
| `lx`/`Ej` | zrender.graphic.LinearGradient / echarts.init | pptx chunk vendored 14650–41068（jsx；注入点 registerEchartsInit） |
| `D`/`se` | PNG 编码器（DataViewWriter/encodePng） | legacy-doc chunk V0 15–490（jsx，登记） |
| pako / UTIF / react 19.2.7 CJS | — | legacy-doc chunk V1 491–10300（jsx，登记） |
| `docx_wasm_bg-HWnIvdMf.wasm` + chunk-WKBPLHUA | docx-core Rust wasm + glue | 独立资产（VENDOR-MANIFEST-LIBS） |
| `PDFJS_WORKER_SOURCE` | pdfjs OffscreenCanvas 工作者 | pptxEngineRender.tsx（逐字） |
| `l`/`m`/`P`/`j`/`M`/`t` | popover/input/textarea/toast/图标/IME 守卫 | ImeComposition.tsx（pptxPreviewViewer 消费） |

## 22. xlsx

- 族登记：自研 xlsx 预览（react-xlsx 库壳 + duke-sheets 桥）
- 产物：XlsxPreview.tsx + XlsxPreviewWasmBridge.tsx / XlsxPreview.report.md
- 来源：previewPaneOfficeXlsxContent-XeHwYdMn.js（js/jsx 双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| cachedWasmModulePromise | `_c` | 14341 | 10638 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | memo 化的 glue 模块加载 Promise |
| wasmSourceExplicitlySet | `vc` | 14342 | 10639 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | wasm 源 |
| resolvedWasmSource | `bc` | 14343 | 10640 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| rawWasmSource | `yc` | 14343 | 10640 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| copyToStandaloneBuffer | `xc` | 14345 | 10642 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | ArrayBuffer |
| normalizeWasmSource | `Sc` | 14350 | 10647 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| setDukeSheetsWasmSource | `Cc` | 14357 | 10654 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | wasm 源 |
| isWasmSourceAvailable | `wc` | 14360 | 10657 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| getDukeSheetsWasmSource | `Tc` | 14363 | 10660 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| loadDukeSheetsWasmModule | `Ec` | 14366 | 10663 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | glue 模块 |
| createAbortError | `Dc` | 14382 | 10668 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | AbortError 工厂 |
| XlsxWorkerClient | `Oc` | 14387 | 10673 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | worker 请求客户端 |
| cloneArrayBuffer | `kc` | 14474 | 10770 | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | （可转移） |
| useSpreadsheetController | `Ru` | 15672 | 11907 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | hook（file→worker→模型/页签） |
| SpreadsheetViewer | `sy` | 199292 | 49527 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | react-xlsx-viewer 呈现壳 |
| SpreadsheetWithOwnedController | `cy` | 199402 | 49623 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| Spreadsheet | `ly` | 199406 | 49630 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | react-xlsx 顶层组件（控制器注入三分支） |
| resolveSheetTabTargetIndex | `uy` | 199415 | 49643 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js |  |
| SheetTabBar | `dy` | 199428 | 49650 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | （role=tablist） |
| XlsxParseErrorState | `fy` | 199470 | 49679 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | （role=alert + error 日志） |
| PreviewPaneOfficeXlsxContent | `py` | 199478 | 49691 | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | （chunk 唯一导出） |
| XlsxFileSizeLimitExceededError | `Dl` | — | — | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | (14726 / —) |
| SpreadsheetHeaderThemeContext | `ig` | — | — | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | {isDark} (190103 / —) |
| SpreadsheetControllerContext | `rg` | — | — | XlsxPreview.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | (190102 / —) |
| 主线程 响应封套 | `worker` | — | — | XlsxPreviewWasmBridge.tsx | previewPaneOfficeXlsxContent-XeHwYdMn.js | （原 worker fa() 的 postMessage 结构） |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `ly`/`cy`/`sy`/`Ru`/`rg`/`ig`/`Dl` | react-xlsx 顶层/控制器/上下文/错误（接口级） | previewPaneOfficeXlsxContent chunk 内 vendored 9111–199414（私有库，登记） |
| `Oc` | XlsxWorkerClient | XlsxPreviewWasmBridge.tsx（本目录重建） |
| `Cc` | setDukeSheetsWasmSource | XlsxPreviewWasmBridge.tsx |
| `duke_sheets_wasm_bg-BCCK9PkU.wasm` / `xlsx-worker-DJiDdvsD.js` | duke-sheets wasm + 宿主 worker | 独立资产（@dukelib/sheets-wasm@0.1.21 逐字节） |
| `r`（=useZCodeIntl） | intl | **I18n.tsx** |
| `a` | logger | logger.tsx |
| fflate | zip 解压 | browser-BrD0k0WI.js（外部） |
| `to` | useVirtualizer | esm-BY6T6pIH.js（外部） |

## 23. PreviewMisc

- 族登记：PDF/diff worker 族
- 产物：PdfViewer.tsx + DiffsWorker.tsx / PreviewMisc.report.md
- 来源：pdf-viewer-m6YcRb_5.js + diffs.worker-CAavpt0L.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| clampZoom | `ko` | 4 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | min(MIN)~max 夹取 |
| initOnigurumaWasm | `el` | 9172 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （懒模块：强制 wasm 初始化） |
| LINE_SPLIT_REGEX | `tl` | 9176 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | = /(?<=\n)/（保留换行的行分割） |
| DEFAULT_DIFFS_THEMES | `nl` | 9177 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | = {dark:'pierre-dark', light:'pierre-light'}（ZCode 自研主题） |
| loadResolvedLanguages | `al` | 9180–9190 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| loadedLanguageNames | `il` | 9180–9190 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| resolvedLanguageMap | `rl` | 9180–9190 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| loadResolvedThemes | `cl` | 9191–9202 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| resolvedThemeMap | `ol` | 9191–9202 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| loadedThemeNames | `sl` | 9191–9202 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| EXTENSION_TO_LANGUAGE | `ul` | 9203–9547 | 8689 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | →shiki 语言 id（343 条） |
| resolveLanguageForFileName | `dl` | 9548 | 9034 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （自定义表→全名→复合扩展→单扩展→'text'） |
| setCustomExtensions | `fl` | 9559 | 9045 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （版本号单调递增才生效） |
| stripTrailingNewline | `pl` | 9568 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | ml → hastText |
| hastElement | `hl` | 9573 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | gl → findCodeElement |
| processLine | `_l` | 9583 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （行元素→div + data-line/alt-line/line-type/line-index） |
| NO_TOKEN | `vl` | 9601 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / MULTIPLE_TOKENS 符号 |
| NO_TOKEN | `yl` | 9601 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / MULTIPLE_TOKENS 符号 |
| groupTokensByCharPosition | `bl` | 9603 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （data-char 归组/补包 span） |
| createDiffTransformers | `wl` | 9664 | 9163 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （行处理 + 可选 token/样式归一） |
| styleToClassTransformer | `Tl` | 9713 | 9209 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | = qc({classPrefix:'hl-'})（vendor §5） |
| TOKEN_STYLE_NORMALIZER | `El` | 9714 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （color/bg/fontStyle→htmlStyle） |
| cssVariablePrefix | `Q` | 9731 | 9222 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （'token'→'--diffs-token-'，其余 '--diffs-'） |
| buildThemeStyles | `Dl` | 9734 | 9225 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （fg/bg + 增/删/改色变量，双主题分 dark/light） |
| buildThemeColorVars | `Ol` | 9756 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （gitDecoration.* → terminal.ansi* 兜底） |
| getLineNodes | `kl` | 9770 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （取 code 元素 children） |
| iterateOverDiff | `Al` | 9779 | 9258 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （hunk 级窗口化迭代：context/context-expanded/change） |
| hasTrailingContext | `Ml` | 10228 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （末 hunk 后仍有未消费行） |
| computeChangeRanges | `Nl` | 10235 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （窗口裁剪变更区段） |
| buildChangeItem | `Pl` | 10271 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （单行变更项装配） |
| createDiffSpanDecoration | `Fl` | 10364 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （data-diff-span 装饰） |
| appendDiffSegment | `Il` | 10374 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （word-alt 相邻同类合并） |
| DEFAULT_WINDOW_OPTIONS | `Ll` | 10387 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | {forcePlainText:false} |
| renderDiff | `Rl` | 10388 | 9669 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （diff 主渲染：按 hunk 累积→成对高亮→窗口回填） |
| computeLineDecorations | `zl` | 10515 | 9784 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （行内 char/word-alt diff 装饰） |
| createHunkAccumulator | `Bl` | 10555 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| highlightFilePair | `Vl` | 10568 | 9863 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （删/增两侧 codeToHast） |
| iterateLines | `Hl` | 10600 | 9905 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （行窗口迭代） |
| splitLines | `Ul` | 10622 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| DEFAULT_FILE_WINDOW_OPTIONS | `Wl` | 10624 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| renderFile | `Gl` | 10625 | 9934 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （单文件渲染） |
| joinLineSlice | `Kl` | 10672 | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| handleWorkerMessage | `Jl` | 10691 | 10010 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （initialize/set-render-options/file/diff 分派） |
| handleInitialize | `Yl` | 10710 | 10032 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| handleSetRenderOptions | `Xl` | 10726 | 10052 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| handleFileRequest | `Zl` | 10736 | 10065 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| handleDiffRequest | `Ql` | 10751 | 10084 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js |  |
| getOrCreateHighlighter | `$l` | 10761 | 10097 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （shiki-wasm→oniguruma 引擎，否则 JS 正则引擎） |
| applyCustomExtensions | `eu` | 10771 | 10104 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （version+map 必须成对） |
| PDF_WORKER_SRC | `To` | 20821 | 18642 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | worker URL（pdf.worker.min-qwK7q_zL.mjs） |
| ZOOM_STEP | `Eo` | 20822 | 18643 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | = 0.25          按钮缩放步长 |
| WHEEL_ZOOM_SENSITIVITY | `Oo` | 20824 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | = 0.002  滚轮缩放指数灵敏度 |
| clamp | `Ao` | 20828 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js |  |
| memoizedSize | `jo` | 20831 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | （宽高原值则返旧引用） |
| scaleSize | `Mo` | 20834 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | × 缩放（向下取整） |
| zoomOverlayStyle | `No` | 20837 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | absolute+scale 变换样式 |
| resolveZoomAnchorPoint | `Po` | 20845 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | /视口中心 → 页面比例锚点 |
| applyScrollPreservation | `Fo` | 20863 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js |  |
| useStageZoomOverlay | `Io` | 20868 | 18693 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | （canvas 翻拍） |
| buildCMapOptions | `Lo` | 20910 | 18724 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | cMapUrl=…/pdfjs/cmaps/ + cMapPacked |
| RANGE_CHUNK_SIZE | `Ro` | 20914 | 18732 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | = 256KB |
| CMAP_DOCUMENT_OPTIONS | `zo` | 20915 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | location 的 cMap 选项 |
| RANGE_DOCUMENT_OPTIONS | `Bo` | 20916 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | cMap + disableAutoFetch/disableStream/rangeChunkSize |
| isRangeSource | `Vo` | 20917 | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | {requestRange} 范围源 |
| RangeSourcePDFDataRangeTransport | `Ho` | 20920 | 18743 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | pdfjs PDFDataRangeTransport |
| DEFAULT_PDF_VIEWER_LABELS | `Uo` | 20937 | 18757 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | 8 条 |
| PdfViewer | `Go` | 20956–21204 | 18774–18929 | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | （导出名 PdfViewer）；导出别名 PdfViewer; （原导出 `export { Go as PdfViewer }`） |
| postFileSuccess | `nu` |  10113 | 10123 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / postDiffSuccess / postErrorResponse (10780/10790/10800 / 10113/10123/10133) |
| postFileSuccess | `ru` |  10113 | 10123 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / postDiffSuccess / postErrorResponse (10780/10790/10800 / 10113/10123/10133) |
| postFileSuccess | `tu` |  10113 | 10123 | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / postDiffSuccess / postErrorResponse (10780/10790/10800 / 10113/10123/10133) |
| highlighterSingleton | `$` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / renderOptions 默认值（theme=pierre 双主题、 |
| getCharPosition | `Cl` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / clearCharPositions / setCharPosition (9651/9655/9661) |
| MIN_ZOOM | `Do` | — | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | = 0.25           缩放下限 (20823 / 18643 段) |
| getCharPosition | `Sl` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / clearCharPositions / setCharPosition (9651/9655/9661) |
| getDocument | `TypedArray` | — | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | 参数 (20948 / 18767) |
| normalizePdfSource | `Wo` | — | — | PdfViewer.tsx | pdf-viewer-m6YcRb_5.js | string |
| customExtensionMap | `Z` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （Map）/ customExtensionsVersion (9202 附近) |
| resolveCollapsedRange | `jl` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （折叠上下文展开量）(10207 / 9693 附近) |
| customExtensionMap | `ll` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | （Map）/ customExtensionsVersion (9202 附近) |
| highlighterSingleton | `ql` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / renderOptions 默认值（theme=pierre 双主题、 |
| getCharPosition | `xl` | — | — | DiffsWorker.tsx | diffs.worker-CAavpt0L.js | / clearCharPositions / setCharPosition (9651/9655/9661) |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| pdfjs-dist 5.4.296 / react-pdf 10.4.1 | PDF 引擎 | pdf-viewer chunk vendored 10–20820（登记） |
| dequal / make-cancellable-promise / make-event-props / warning | react-pdf 小依赖 | 同 chunk 19412–19598 |
| `lVt` 消费方 | lazy PDF 预览 | CodeViewer.tsx（styles 160432+） |
| jsdiff（diff 8.x 面） / shiki 3.23.0 核 / oniguruma-to-es | diff worker vendored | diffs.worker chunk 10–9171（登记） |
| `q6t`/`J6t`/`X6t`/`Y6t`/`XRe` | worker 工厂 / 池 / Provider / 参数同步 / useDiffsWorkerPool | styles-CdEGpc2x.js 211091–211124 / 46950（F14 域） |
| `pierre-dark/pierre-light` | 缺省主题 | styles 16050–16070 注册（主题资产另见 VENDOR-MANIFEST-GRAMMARS） |

## 24. UI 基建（button/cn/IME/logger/e2e 桥）

- 族登记：共享原语 chunk
- 产物：button.tsx / UtilsCn.tsx / ImeComposition.tsx / logger.tsx / button.report.md + ChartUtilsIme.report.md + logger.report.md
- 来源：button-laUijeDG.js / utils-CEEH0K_K.js / imeComposition-DEYFkwWm.js / logger-PFDwl5Yq.js

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| cx | `C` | — | — | button.tsx | button-laUijeDG.js | clsx 别名 |
| Button | `D` | — | — | button.tsx | button-laUijeDG.js | 导出别名 t; ZCode Button 组件 |
| Input | `Dn` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 y; shadcn Input（cva size 变体） |
| buttonVariants | `E` | — | — | button.tsx | button-laUijeDG.js | 导出别名 n; ZCode Button 变体类名表（cva 实例） |
| PPTX_ELEMENT_REFERENCE_EVENT_TYPE | `Gn` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 o; |
| Sparkles | `Gt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 S; lucide sparkles |
| Info | `Ht` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 T; lucide info 图标 |
| TriangleAlert | `Kt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 x; lucide triangle-alert |
| formatLogPrefix | `Lx` | — | — | logger.tsx | logger-PFDwl5Yq.js | 来自 ; 导出别名 K; `[时间戳] [pid:N] [tag]` 前缀格式化器 |
| react | `Mt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 D; -remove-scroll@2.7.2 RemoveScroll |
| Textarea | `On` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 v; shadcn Textarea |
| cvaValue | `S` | — | — | button.tsx | button-laUijeDG.js | cva 取值规范化 |
| jsxRuntime | `T` | — | — | button.tsx | button-laUijeDG.js | （`n()`，jsx-runtime 命名空间） |
| toast | `Un` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 _; toast 入队（返回数字 id） |
| LoaderCircle | `Ut` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 w; lucide loader-circle（spinner） |
| aria | `Vt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 E; -hidden@1.2.6 hideOthers |
| dismissToast | `Wn` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 g; pending/cancelled 双集合去抖 |
| MousePointer2 | `Wt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 C; lucide mouse-pointer-2 |
| createLucideIcon | `_` | — | — | button.tsx | button-laUijeDG.js | 导出别名 c; lucide 图标工厂 |
| isComposingText | `_r` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 t; IME 三重组词探测（chunk 得名于此） |
| logger | `a` | — | — | logger.tsx | logger-PFDwl5Yq.js | 导出别名 t; 渲染进程日志器对象 |
| react | `ae` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 P; -dom/client 19.2.7（CJS interop，vendored 本体 292–10868） |
| sha256Fingerprint | `ar` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 h; |
| ZoomIn | `b` | — | — | button.tsx | button-laUijeDG.js | 导出别名 a; lucide 图标 |
| toKebabCase | `c` | — | — | button.tsx | button-laUijeDG.js | lucide 命名工具 |
| usePlatform | `ce` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 M; 缺省即抛错（中文错误串） |
| upsertPptxElementReference | `cr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 s; |
| defaultAttributes | `d` | — | — | button.tsx | button-laUijeDG.js | lucide SVG 缺省属性 |
| isPptxElementReferenceEvent | `dr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 f; |
| hasA11yProp | `f` | — | — | button.tsx | button-laUijeDG.js | lucide a11y 探测 |
| dispatchPptxElementReferenceEvent | `fr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 u; |
| Icon | `g` | — | — | button.tsx | button-laUijeDG.js | lucide 基础 <svg> 组件 |
| PopoverAnchor | `gr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 r; 锚点 |
| useLucideContext | `h` | — | — | button.tsx | button-laUijeDG.js | lucide 上下文 hook |
| PopoverContent | `hr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 i; Portal+Content（align/sideOffset 缺省） |
| logAtLevel | `i` | — | — | logger.tsx | logger-PFDwl5Yq.js | 核心输出（console + 主进程旁路） |
| toCamelCase | `l` | — | — | button.tsx | button-laUijeDG.js | lucide 命名工具 |
| useOptionalPlatform | `le` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 j; 容器外返回 null |
| appendPptxElementReferences | `lr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 c; |
| LucideProvider | `m` | — | — | button.tsx | button-laUijeDG.js | 导出别名 l; lucide 图标全局缺省 Provider |
| PopoverTrigger | `mr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 a; 触发器 |
| zcodeTwMerge | `n` | — | — | UtilsCn.tsx | utils-CEEH0K_K.js | extendTailwindMerge 定制实例 |
| CONSOLE_METHODS | `n` | — | — | logger.tsx | logger-PFDwl5Yq.js | 级别 -> console 方法映射（info->console.log） |
| isSameWorkspaceTarget | `nr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 p; |
| buildPptxElementReference | `or` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 l; |
| LucideContext | `p` | — | — | button.tsx | button-laUijeDG.js | lucide 上下文 |
| Popover | `pr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 n; shadcn Popover 根 |
| XIcon | `qt` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 b; lucide x |
| cn | `r` | — | — | UtilsCn.tsx | utils-CEEH0K_K.js | 导出别名 t; 类名合并（clsx + 定制 tailwind-merge） |
| shouldLog | `r` | — | — | logger.tsx | logger-PFDwl5Yq.js | 级别过滤（当前忽略级别参数） |
| mergeClasses | `s` | — | — | button.tsx | button-laUijeDG.js | lucide 类名合并 |
| PlatformProvider | `se` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 A; 平台服务 Provider |
| isLoggingDisabled | `t` | — | — | logger.tsx | logger-PFDwl5Yq.js | 禁用判定（全局开关 \|\| PROD） |
| fallbackTo | `tr` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 d; |
| toPascalCase | `u` | — | — | button.tsx | button-laUijeDG.js | lucide 命名工具 |
| useSelectDirectory | `ue` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 N; 目录选择器稳定回调 |
| extractPptxElementReferences | `ur` | — | — | ImeComposition.tsx | imeComposition-DEYFkwWm.js | 导出别名 m; |
| ChevronLeft | `v` | — | — | button.tsx | button-laUijeDG.js | 导出别名 s; lucide 图标 |
| cva | `w` | — | — | button.tsx | button-laUijeDG.js | 导出别名 r; class-variance-authority 内联副本 |
| ZoomOut | `x` | — | — | button.tsx | button-laUijeDG.js | 导出别名 i; lucide 图标 |
| ChevronRight | `y` | — | — | button.tsx | button-laUijeDG.js | 导出别名 o; lucide 图标 |


### 外部依赖跨引用（符号 → 提供模块）

| 混淆名 | 语义 | 提供模块 |
|---|---|---|
| `t`（dist-vnZIbudW） | Slot（@radix-ui/react-slot） | dist-vnZIbudW.js（外部） |
| `r`（bundle-mjs） | clsx@2.1.1 | bundle-mjs-D8tLE0rB.js（外部） |
| `t`（utils） | cn（tailwind-merge@3.5.0 定制） | UtilsCn.tsx（utils-CEEH0K_K.js） |
| react-dom/client 19.2.7 / radix popover 1.1.15 全栈 / focus-scope 1.1.7 / remove-scroll 2.7.2 / aria-hidden 1.2.6 | ImeComposition vendored 段 | imeComposition chunk 26–12052（登记） |
| `K`（logger 导入） | formatLogPrefix | src-HCld2afU.js（外部） |
| `K`/`h`/`o`/`r`/`t`（e2e 桥导入） | 门控 + 四 store（session/skill/subagents/whiteboard） | skillStore-BmeKHDBI.js（外部） |


## 25. B4 · SidebarLeaves（F01 接口级叶子展开）

- 族登记：F01 SidebarFamily · B4 叶子批（Sidebar.report §2 六项★叶子实体化）
- 产物：SidebarLeaves.tsx / Leaves.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| fetchTaskIndex | `Cx` | 29752 | 27072 | SidebarLeaves.tsx | styles-CdEGpc2x.js | （接口级，跨块助手群 _x/vx/gx/yx/bx/xx/Sx/xOe/bOe）；★声明 29752/27072 |
| readVisibleLimit | `FFt` | 144351 | 120150 | SidebarLeaves.tsx | styles-CdEGpc2x.js | FFt→readVisibleLimit 144351/120150 |
| workspaceLoadingFlags | `W6` | 144363 | 120160 | SidebarLeaves.tsx | styles-CdEGpc2x.js | W6→workspaceLoadingFlags 144363/120160 |
| useWorkspaceTaskGroups | `VFt` | 144427 | 120229 | SidebarLeaves.tsx | styles-CdEGpc2x.js | VFt→useWorkspaceTaskGroups 144427/120229 |
| ArchivedTasksSection | `lLt` | 146823 | 122315 | SidebarLeaves.tsx | styles-CdEGpc2x.js | 146823/122315 |
| WebRemoteTaskListSection | `mLt` | 147286 | 122543 | SidebarLeaves.tsx | styles-CdEGpc2x.js | Web 远控任务列表段；mLt→WebRemoteTaskListSection 147286/122543 |
| useSidebarUsageState | `mRt` | 150255 | 124505 | SidebarLeaves.tsx | styles-CdEGpc2x.js | （F12 域接线）；150255/124505 |
| buildGroupedViewFromStructure | `qRt` | 152903 区 | 126428 | SidebarLeaves.tsx | styles-CdEGpc2x.js | qRt→buildGroupedViewFromStructure 152903区/126428 |
| composeOptimisticOverlay | `QRt` | 153040 区 | 126543 | SidebarLeaves.tsx | styles-CdEGpc2x.js | QRt→composeOptimisticOverlay 153040区/126543 |
| useGroupedTaskView | `uzt` | 153205 | 126735 | SidebarLeaves.tsx | styles-CdEGpc2x.js | uzt→useGroupedTaskView 153205/126735 |
| BeamBorderAnimation | `ABt` | 157550 | 131107 | SidebarLeaves.tsx | styles-CdEGpc2x.js | ABt→BeamBorderAnimation 157550/131107 |
| webRemoteTaskKey | `f6` | — | 116795 | SidebarLeaves.tsx | styles-CdEGpc2x.js | `${workspaceKey}:${taskId}`；—/116795 |
| openWebRemoteTask | `iPt` | — | 116801 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/116801 |
| useWebRemoteTaskSwitcher | `aPt` | — | 116882 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /切换状态钩子；—/116882 |
| isRemoteCapableWorkspace | `gPt` | — | 117026 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| filterRemoteCapableWorkspaces | `_Pt` | — | 117029 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| shouldRetryEmptyRemoteIndex | `vPt` | — | 117035 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/117035 |
| normalizeRuntimePhase | `bPt` | — | 117043 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| isStreamingDisplayStatus | `mPt` | — | 117049 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| isRunningRuntimeStatus | `hPt` | — | 117051 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveTaskDisplayStatus | `xPt` | — | 117053 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| mapRemoteTasksToRows | `h6` | — | 117063 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| taskRowComparator | `SPt` | — | 117117 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| sortTaskRows | `g6` | — | 117120 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| sameTaskRef | `CPt` | — | 117126 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/117126 |
| applyRemoteTaskMembership | `wPt` | — | 117128 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/117128 |
| taskMatchesSearch | `EPt` | — | 117146 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /filterTasksBySearch —/117146/117149 |
| filterTasksBySearch | `_6` | — | 117149 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /filterTasksBySearch —/117146/117149 |
| groupTasksByWorkspace | `TPt` | — | 117155 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/117155 |
| buildWebRemoteTaskViewModel | `DPt` | — | 117181 | SidebarLeaves.tsx | styles-CdEGpc2x.js | （pinned/groups/timeline/archived）；—/117181 |
| cleanupDeletedTaskState | `sLt` | — | 122284 | SidebarLeaves.tsx | styles-CdEGpc2x.js | ★声明 —/122284 |
| WebRemoteTaskRow | `uLt` | — | 122425 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| WEB_REMOTE_RETRY_DELAY_MS | `dLt` | — | 122539 | SidebarLeaves.tsx | styles-CdEGpc2x.js | = 300；/MAX_RETRIES/waitRetryDelay —/122539–122541 |
| WEB_REMOTE_MAX_RETRIES | `fLt` | — | 122540 | SidebarLeaves.tsx | styles-CdEGpc2x.js | = 3；/MAX_RETRIES/waitRetryDelay —/122539–122541 |
| waitRetryDelay | `pLt` | — | 122541 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /MAX_RETRIES/waitRetryDelay —/122539–122541 |
| sortTasksByGroupOrder | `KRt` | — | 126406 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| applyDraftPromotions | `JRt` | — | 126470 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| findTaskInViewByKey | `YRt` | — | 126504 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126504 |
| isTaskFirstInGroup | `XRt` | — | 126514 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126514 |
| normalizeWorkspaceScopes | `ZRt` | — | 126518 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126518 |
| collectViewWorkspaceScopes | `j8` | — | 126525 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126525 |
| collectViewTaskKeys | `$Rt` | — | 126621 | SidebarLeaves.tsx | styles-CdEGpc2x.js |  |
| isGroupedViewReady | `tzt` | — | 126635 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126635 |
| GroupedViewLoadCache | `nzt` | — | 126641 | SidebarLeaves.tsx | styles-CdEGpc2x.js | （class）；—/126641 |
| prependCreatedGroup | `rzt` | — | 126669 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126669 |
| resolveVisibleMissingTaskKeys | `izt` | — | 126679 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126679 |
| viewNodeOrderKey | `azt` | — | 126690 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126690 |
| viewNodesShallowEqual | `ozt` | — | 126693 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126693 |
| mergeGroupedViewPreservingIdentity | `szt` | — | 126696 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126696 |
| toTopLevelNodeRef | `czt` | — | 126714 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126714 |
| serializeGroupedViewOrder | `lzt` | — | 126721 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/126721 |
| BEAM_SIZE_PRESETS | `uBt` | — | 128919 | SidebarLeaves.tsx | styles-CdEGpc2x.js | sm/md/line 圆角与描边宽；—/128919 |
| BEAM_THEME_PARAMS | `B8` | — | 128935 | SidebarLeaves.tsx | styles-CdEGpc2x.js | ×主题 不透明度/内阴影/饱和；—/128935 |
| MD_BEAM_PALETTES | `V8` | — | 128990 | SidebarLeaves.tsx | styles-CdEGpc2x.js | md 边框/尖峰色板；—/128990 |
| SM_BEAM_PALETTES | `dBt` | — | 129180 | SidebarLeaves.tsx | styles-CdEGpc2x.js | sm 边框/内部色板；—/129180 |
| smBorderGradients | `fBt` | — | 129454/129458 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /smInnerGradients |
| smBorderGradients | `pBt` | — | 129454/129458 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /smInnerGradients |
| mdBorderGradients | `hBt` | — | 129462/129466 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /mdInnerGradients |
| mdBorderGradients | `mBt` | — | 129462/129466 | SidebarLeaves.tsx | styles-CdEGpc2x.js | /mdInnerGradients |
| resolveSpikePalette | `gBt` | — | 129475 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/129475 |
| LINE_STROKE_PALETTES | `_Bt` | — | 129479 | SidebarLeaves.tsx | styles-CdEGpc2x.js | line 描边色板（主题×变体）；—/129479 |
| withAlpha | `H8` | — | 129920 | SidebarLeaves.tsx | styles-CdEGpc2x.js | rgb()/rgba() → 指定 alpha；—/129920 |
| lineStrokeGradients | `vBt` | — | 129929 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/129929 |
| LINE_INNER_PALETTES | `yBt` | — | 129940 | SidebarLeaves.tsx | styles-CdEGpc2x.js | line 内部色板；—/129940 |
| lineInnerGradients | `bBt` | — | 130159 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/130159 |
| LINE_SPIKE_PALETTES | `xBt` | — | 130168 | SidebarLeaves.tsx | styles-CdEGpc2x.js | line 尖峰色板；—/130168 |
| lineBloomGradients | `SBt` | — | 130327 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/130327 |
| lineBloomMonoGradients | `CBt` | — | 130349 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/130349 |
| generateBeamCss | `wBt` | — | 130367 | SidebarLeaves.tsx | styles-CdEGpc2x.js | —/130367 |
| generateBeamCssSm | `TBt` | — | 130373 | SidebarLeaves.tsx | styles-CdEGpc2x.js | conic 描边；—/130373 |
| generateBeamCssMd | `EBt` | — | 130593 | SidebarLeaves.tsx | styles-CdEGpc2x.js | conic + 边缘渐隐；—/130593 |
| generateBeamCssLine | `DBt` | — | 130825 | SidebarLeaves.tsx | styles-CdEGpc2x.js | travel/spike 动画；—/130825 |
| useSystemThemePreference | `OBt` | — | 131093 | SidebarLeaves.tsx | styles-CdEGpc2x.js | prefers-color-scheme 侦听 |
| resolveBeamTheme | `kBt` | — | 131104 | SidebarLeaves.tsx | styles-CdEGpc2x.js | auto → 系统主题；—/131104 |
| filterRemoteCapableWorkspaces | `_Pt/gPt` | — | — | SidebarLeaves.tsx | styles-CdEGpc2x.js | /isRemoteCapableWorkspace —/117029/117026 |
| taskWorkspaceKey | `ei` | — | — | SidebarLeaves.tsx | styles-CdEGpc2x.js | identity?.trim() |
| smBorder | `fBt/pBt` | — | — | SidebarLeaves.tsx | styles-CdEGpc2x.js | /InnerGradients —/129454/129458 |
| sortTaskRows | `g6/SPt` | — | — | SidebarLeaves.tsx | styles-CdEGpc2x.js | /taskRowComparator —/117120/117117 |
| mdBorder | `mBt/hBt` | — | — | SidebarLeaves.tsx | styles-CdEGpc2x.js | /InnerGradients —/129462/129466 |

## 26. B4 · ConversationLeaves（F03 接口级叶子展开）

- 族登记：F03 ConversationFamily · B4 叶子批（15 工具视图/预览卡/自动化卡/captcha/滚动助手）
- 产物：ConversationLeaves.tsx / Leaves.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| FileWriteToolView | `Gft` | 104844 | 90186 | ConversationLeaves.tsx | styles-CdEGpc2x.js | + Kft 单文件编辑行 (— / 90290) |
| FileReadToolView | `opt` | 105465 | 90659 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| SearchToolView | `upt` | 105569 | 90768 | ConversationLeaves.tsx | styles-CdEGpc2x.js | + lpt 搜索标签 (— / 90700) |
| ExploreToolView | `Spt` | 105825 | 91001 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| AgentToolView | `Vpt` | 106243 | 91282 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| FallbackToolView | `Qpt` | 106609 | 91478 | ConversationLeaves.tsx | styles-CdEGpc2x.js | + Hpt CUA 权限引导 |
| GoalToolView | `omt` | 106753 | 91604 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| NodeReplToolView | `Nmt` | 107168 | 91932 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| AutomationCard | `fgt` | 107448 区 | 93676 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| AutomationToolView | `Wmt` | 107472 | 92099 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| SessionContextToolView | `eht` | 107835 | 92325 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| SkillToolView | `mht` | 108309 | 92669 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| SwitchModeToolView | `ght` | 108426 | 92725 | ConversationLeaves.tsx | styles-CdEGpc2x.js | （plan 面板） |
| TaskOutputToolView | `Sht` | 108581 | 92812 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| TaskControlToolView | `Dht` | 108728 | 92920 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| TodoToolView | `Mht` | 108857 | 93007 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| AskUserQuestionToolView | `Pht` | 108963 | 93067 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| useVisiblePreviewCards | `O_t` | 111161 | 94877 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| PreviewCardList | `k_t` | 111193 | 94925 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| PreviewCard | `A_t` | 111233 | 94950 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceInteractionNotifier | `eSt` | 117283 | 99619 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| useSnapshotInteractionNotifier | `tSt` | 117346 | 99703 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| handleAliyunSdkFail | `ASt` | 117919 | 100205 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| isCaptchaProtectedProvider | `b0` | 118292 | 100548 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| EditInlineDiffContent | `VQ` | — | 90046 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 降动效侦听/数字翻牌动画 | `Fft` | — | 90063–90120 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 降动效侦听/数字翻牌动画 | `Mft` | — | 90063–90120 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 降动效侦听/数字翻牌动画 | `Nft` | — | 90063–90120 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 降动效侦听/数字翻牌动画 | `Pft` | — | 90063–90120 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 降动效侦听/数字翻牌动画 | `jft` | — | 90063–90120 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| DiffCountBadge | `Ift` | — | 90127 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| FileSummaryLabel | `Lft` | — | 90133 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| PathSecondaryText | `HQ` | — | 90147 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveEditKindLabel | `Rft` | — | 90150 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| FileSummaryList | `zft` | — | 90157 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 编辑图标/折叠预设 | `Bft` | — | 90166 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 编辑图标/折叠预设 | `Hft` | — | 90166 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 编辑图标/折叠预设 | `Vft` | — | 90166 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| isRawFailed | `Uft` | — | 90173 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| toCodeViewerTarget | `UQ` | — | 90177 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| toPatchPreview | `Wft` | — | 90183 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| cron | `cgt` | — | 93617–93666 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /JSON 宽松解析/自动化模型归一/多源抽取 |
| cron | `dgt` | — | 93617–93666 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /JSON 宽松解析/自动化模型归一/多源抽取 |
| cron | `lgt` | — | 93617–93666 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /JSON 宽松解析/自动化模型归一/多源抽取 |
| cron | `sgt` | — | 93617–93666 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /JSON 宽松解析/自动化模型归一/多源抽取 |
| cron | `ugt` | — | 93617–93666 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /JSON 宽松解析/自动化模型归一/多源抽取 |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `C_t` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `D_t` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `E_t` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `T_t` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `c1` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 卡签名/同步可见/异步存在性校验/预览源/可点击判定/路径解析 | `w_t` | — | 94833–94876 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| collectAutomationCards | `Mvt` | — | 96194 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| tryParseJsonObject | `Nvt` | — | 96214 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| extractDeletedAutomationId | `Pvt` | — | 96223 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| AutomationCardList | `Fvt` | — | 96229 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| distanceFromBottom | `Ryt` | — | 97137 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| isNearBottom | `T1` | — | 97140 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| isNearBottomAlias | `zyt` | — | 97143 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveFollowIntent | `Byt` | — | 97146 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveInitialIntent | `Vyt` | — | 97149 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| shouldSuppressTopAdjustment | `Hyt` | — | 97152 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| scrollDeltaDirection | `Uyt` | — | 97155 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| compareScrollDirection | `Wyt` | — | 97158 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| keyScrollIntent | `Gyt` | — | 97161 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveFollowAfterIntent | `E1` | — | 97164 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| shouldLoadOlderOnUnfollow | `Kyt` | — | 97171 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| alwaysTrue | `D1` | — | 97174 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| computePrependCompensation | `qyt` | — | 97177 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| computePrependGrowth | `Jyt` | — | 97180 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| estimatePrependTrigger | `Yyt` | — | 97184 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| shouldTriggerLoadOlder | `Xyt` | — | 97187 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `$xt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Gxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Jxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Kxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Qxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Xxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Yxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `Zxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 相位变化通知构建族 | `qxt` | — | 99539–99616 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `SSt` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `_St` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `a0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `bSt` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `c0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `i0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `o0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `r0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `s0` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `vSt` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `xSt` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 失败载荷解析族 | `ySt` | — | 100045–100100 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| CaptchaHostContainer | `wSt` | — | 100110 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 在途拒绝/重置/配置键/挂载校验/按钮查询 | `DSt` | — | 100130–100190 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 在途拒绝/重置/配置键/挂载校验/按钮查询 | `ESt` | — | 100130–100190 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 在途拒绝/重置/配置键/挂载校验/按钮查询 | `OSt` | — | 100130–100190 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 在途拒绝/重置/配置键/挂载校验/按钮查询 | `TSt` | — | 100130–100190 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 在途拒绝/重置/配置键/挂载校验/按钮查询 | `v0` | — | 100130–100190 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| loadAliyunCaptchaScript | `kSt` | — | 100160 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| initAliyunCaptchaInstance | `jSt` | — | 100280 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| awaitCaptchaInstance | `MSt` | — | 100322 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| waitCaptchaScriptSettle | `NSt` | — | 100335 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| runAliyunCaptchaVerification | `PSt` | — | 100344 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证头名/区域头名/头构建 | `FSt` | — | 100470–100478 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证头名/区域头名/头构建 | `ISt` | — | 100470–100478 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证头名/区域头名/头构建 | `LSt` | — | 100470–100478 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| ARMS | `BSt` | — | 100480–100500 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /组/注入/构建/上报 |
| ARMS | `HSt` | — | 100480–100500 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /组/注入/构建/上报 |
| ARMS | `RSt` | — | 100480–100500 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /组/注入/构建/上报 |
| ARMS | `VSt` | — | 100480–100500 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /组/注入/构建/上报 |
| ARMS | `zSt` | — | 100480–100500 | ConversationLeaves.tsx | styles-CdEGpc2x.js | /组/注入/构建/上报 |
| 验证参数缓存/运行时头账本 | `T0` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证参数缓存/运行时头账本 | `aCt` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证参数缓存/运行时头账本 | `iCt` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证参数缓存/运行时头账本 | `nCt` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证参数缓存/运行时头账本 | `rCt` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 验证参数缓存/运行时头账本 | `w0` | — | 100560–100590 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `D0` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `E0` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `cCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `dCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `fCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `lCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `oCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `sCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |
| 配置缓存/可用性/语言/串行队列/预检/发送前恢复 | `uCt` | — | 100590–100680 | ConversationLeaves.tsx | styles-CdEGpc2x.js |  |

## 27. B4 · UsageDeep（F12 用量深层 + 供应商卡群）

- 族登记：F12 ProviderPlanUsageFamily · B4-1 第 2 项第一符号组（u7 卡群深叶 + q$t/J$t 用量数据层 + 配额/权益助手）
- 产物：UsageDeep.tsx / UsageDeep.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| planWidgetGridCols | `r3e` |  1 | 2 | UsageDeep.tsx | styles-CdEGpc2x.js | 1/2/3 列 |
| useBillingDiscount | `dj` | 51862 | 46617 | UsageDeep.tsx | styles-CdEGpc2x.js | hook |
| BillingDiscountCard | `HHe` | 51946 | 46704 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| BillingDiscountInfoDialog | `_j` | 51986 | 46718 | UsageDeep.tsx | styles-CdEGpc2x.js | markdown 信息对话框 |
| useSubscriptionSnapshot | `$j` | 52449 | 47188 | UsageDeep.tsx | styles-CdEGpc2x.js | /订阅快照 hook（薄包装） |
| useUsageEntitlementCore | `eM` | 52451 | 47191 | UsageDeep.tsx | styles-CdEGpc2x.js | hook：缓存/轮询/重置唤醒/去重 |
| providerCacheKey | `rM` | 52602 | 47401 | UsageDeep.tsx | styles-CdEGpc2x.js | zcode:usage-entitlement:<fp> |
| useProviderFamilyConnectionSettings | `PUe` | 52694 | 47475 | UsageDeep.tsx | styles-CdEGpc2x.js | （codingPlan/startPlan）→ 连接设置 |
| findQuotaLimit | `Sq` | 76101 | 67394 | UsageDeep.tsx | styles-CdEGpc2x.js | type/unit/number 三键查找 |
| quotaPercent | `Cq` | 76104 | 67397 | UsageDeep.tsx | styles-CdEGpc2x.js | percentage → 已用百分比 |
| formatQuotaUsage | `$4e` | 76108 | 67400 | UsageDeep.tsx | styles-CdEGpc2x.js | `NN%` 或 `--` |
| formatQuotaResetTime | `wq` | 76115 | 67406 | UsageDeep.tsx | styles-CdEGpc2x.js | date/dateTime（compactToday） |
| bigmodel | `e3e` | 76133 | 67426 | UsageDeep.tsx | styles-CdEGpc2x.js | /zai logo dataURI 表 |
| bigmodel | `t3e` | 76133 | 67426 | UsageDeep.tsx | styles-CdEGpc2x.js | /zai logo dataURI 表 |
| RegionLogo | `Tq` | 76135 | 67431 | UsageDeep.tsx | styles-CdEGpc2x.js | logo img（缺省 log-in 图标） |
| codingPlanProviderFallbackName | `n3e` | 76158 | 67437 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| resolvePlanWidgetModel | `Oq` | 76168 | 67446 | UsageDeep.tsx | styles-CdEGpc2x.js | → 展示模型 |
| SidebarCodingPlanWidget | `s3e` | 76246 | 67506 | UsageDeep.tsx | styles-CdEGpc2x.js | Coding Plan 配额件 |
| modelDisplayName | `kq` | 76370 | 67594 | UsageDeep.tsx | styles-CdEGpc2x.js | GLM 特判 + 词首大写 |
| SidebarStartPlanWidget | `v3e` | 76492 | 67671 | UsageDeep.tsx | styles-CdEGpc2x.js | Start Plan 余额件 |
| useIntranetProbe | `hYt` | 187258 | 151099 | UsageDeep.tsx | styles-CdEGpc2x.js | systemService.probeIntranet |
| trimmedOrUndefined | `i7` | 187289 | 151029 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| useZapiEnabled | `gYt` | 187296 | 151138 | UsageDeep.tsx | styles-CdEGpc2x.js | +内网探测 → zapi 可用 |
| endpointsOfFormatSingle | `vYt` | 187306 | 151162 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| firstKnownFormatOf | `yYt` | 187309 | 151165 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| baseUrlOfDraft | `bYt` | 187314 | 151170 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| normalizeEndpointPath | `xYt` | 187317 | 151173 | UsageDeep.tsx | styles-CdEGpc2x.js | `/` 前缀 |
| endpointsOfFormats | `SYt` | 187321 | 151177 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| autoEnableApiKeyProviderDraft | `CYt` | 187331 | 151187 | UsageDeep.tsx | styles-CdEGpc2x.js | apiKey 模式+系统禁用 → 启用草稿 |
| resolvedBaseUrlOf | `wYt` | 187340 | 151201 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| endpointsPatchOf | `TYt` | 187344 | 151205 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| providerDraftDiff | `o7` | 187345 | 151218 | UsageDeep.tsx | styles-CdEGpc2x.js | → 变更供应商 或 null |
| providerDraftOrSelf | `EYt` | 187373 | 151250 | UsageDeep.tsx | styles-CdEGpc2x.js | diff ?? provider |
| filterKnownKinds | `s7` | 187377 | 151264 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| filterAllowedKinds | `OYt` | 187381 | 151268 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| modelToDraft | `c7` | 187390 | 151277 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| parsePositiveInteger | `kYt` | 187399 | 151286 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ModelMetadataDialog | `MYt` | 187429 区 | 151337 | UsageDeep.tsx | styles-CdEGpc2x.js | /添加对话框（高级=最大输出） |
| selectOnFocus | `jYt` | 187447 | 151334 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| formatContextWindowCompact | `NYt` | 187631 | 151417 | UsageDeep.tsx | styles-CdEGpc2x.js | ja(`en-US`, e)（locale 固定） |
| GetApiKeyLink | `PYt` | 187634 | 151420 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ModelRow | `FYt` | 187649 | 151431 | UsageDeep.tsx | styles-CdEGpc2x.js | （id 输入+上下文徽章+测试+编辑+删除） |
| ApiKeyInput | `IYt` | 187827 | 151553 | UsageDeep.tsx | styles-CdEGpc2x.js | /可见切换 |
| API_FORMAT_LABELS | `LYt` | 187860 | 151570 | UsageDeep.tsx | styles-CdEGpc2x.js | 3 格式 × label/short/title i18n 表 |
| apiFormatTitleOf | `RYt` | 187883 | 151589 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| API_FORMAT_OPTIONS | `l7` | 187886 | 151595 | UsageDeep.tsx | styles-CdEGpc2x.js | _Yt（本域副本） |
| apiFormatOptionLabel | `BYt` | 187892 | 151601 | UsageDeep.tsx | styles-CdEGpc2x.js | `title (path)` |
| ApiFormatSelect | `VYt` | 187895 | 151604 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| apiFormatOptionsOfProvider | `HYt` | 187914 | 151630 | UsageDeep.tsx | styles-CdEGpc2x.js | models.kinds ∩ endpoints → 格式表 |
| PRESET_PROVIDER_IDS | `UYt` | 187922 | 151638 | UsageDeep.tsx | styles-CdEGpc2x.js | {zai,bigmodel,zapi} |
| CATALOG_SOURCE_ID | `WYt` | 187923 | 151639 | UsageDeep.tsx | styles-CdEGpc2x.js | `china-llm-zcode-dev` |
| MODEL_LOOKUP_DEBOUNCE_MS | `GYt` | 187924 | 151640 | UsageDeep.tsx | styles-CdEGpc2x.js | 300 |
| lookupMaxOutputTokens | `KYt` | 187925 | 151641 | UsageDeep.tsx | styles-CdEGpc2x.js | → maxOutputTokens |
| isCustomizableProvider | `qYt` | 187933 | 151648 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ProviderCardFormHeader | `JYt` | 187936 | 151651 | UsageDeep.tsx | styles-CdEGpc2x.js | +状态徽章+启用/禁用+用量/删除 |
| ProviderConnectionSection | `YYt` | 188051 | 151688 | UsageDeep.tsx | styles-CdEGpc2x.js | baseURL+API 格式（只读/编辑双态） |
| ProviderApiKeySection | `XYt` | 188127 | 151715 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ApiKeyDisabledHint | `ZYt` | 188161 | 151732 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| newModelDraft | `QYt` | 188173 | 151743 | UsageDeep.tsx | styles-CdEGpc2x.js | （缺省上下文 kee） |
| ProviderModelsSection | `$Yt` | 188178 | 151753 | UsageDeep.tsx | styles-CdEGpc2x.js | +添加（目录 maxOutputTokens 300ms 防抖查询） |
| isThenable | `tXt` | 188324 | 151860 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| runDeleteWithGuard | `nXt` | 188327 | 151863 | UsageDeep.tsx | styles-CdEGpc2x.js | （异步复位） |
| resolveNameKeyAction | `rXt` | 188346 | 151883 | UsageDeep.tsx | styles-CdEGpc2x.js | IME 守卫 Enter=commit/Escape=cancel |
| normalizeModelEntry | `iXt` | 188355 | 151886 | UsageDeep.tsx | styles-CdEGpc2x.js | → 模型对象 |
| normalizeProviderModels | `aXt` | 188360 | 151895 | UsageDeep.tsx | styles-CdEGpc2x.js | deleted |
| normalizeEndpointPaths | `oXt` | 188363 | 151898 | UsageDeep.tsx | styles-CdEGpc2x.js | paths → 归一化映射 |
| ProviderConfigCardForm | `u7` | 188376 | 151911 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| CatalogProviderIcon | `sXt` | 188652 | 152143 | UsageDeep.tsx | styles-CdEGpc2x.js | radio-tower 方块 |
| CatalogProviderSelect | `cXt` | 188658 | 152148 | UsageDeep.tsx | styles-CdEGpc2x.js | Popover+cmdk 目录选择 |
| newCustomProvider | `lXt` | 188768 | 152186 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| CUSTOM_CATALOG_SOURCE_ID | `uXt` | 188782 | 152204 | UsageDeep.tsx | styles-CdEGpc2x.js | `china-llm-zcode-dev` |
| newAddProviderDraft | `d7` | 188789 | 152211 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| AddFormFieldLabel | `f7` | 188801 | 152223 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| defaultKindOfCatalogProvider | `_Xt` | 188808 | 152229 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| joinBaseUrlAndPath | `vXt` | 188811 | 152232 | UsageDeep.tsx | styles-CdEGpc2x.js | `/` 边界拼接 |
| catalogEndpointUrlOf | `p7` | 188824 | 152237 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| catalogProviderToCustom | `yXt` | 188828 | 152241 | UsageDeep.tsx | styles-CdEGpc2x.js | → 自定义供应商 |
| primaryFormatOf | `bXt` | 188851 | 152266 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| dedupeModelsById | `m7` | 188855 | 152270 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| retargetModelsToFormat | `xXt` | 188862 | 152281 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| customDraftToProvider | `SXt` | 188866 | 152289 | UsageDeep.tsx | styles-CdEGpc2x.js | → 供应商 |
| AddCustomProviderDraftForm | `CXt` | 188882 | 152305 | UsageDeep.tsx | styles-CdEGpc2x.js | （catalog/custom 双路） |
| PlanStatusRow | `wXt` | 189113 | 152453 | UsageDeep.tsx | styles-CdEGpc2x.js | /到期+管理/解绑（`·` 分隔） |
| StartPlanStatusRow | `TXt` | 189156 | 152495 | UsageDeep.tsx | styles-CdEGpc2x.js | +管理/解绑 |
| StatusDotSeparator | `h7` | 189190 | 152529 | UsageDeep.tsx | styles-CdEGpc2x.js | `·` |
| StatusActionButton | `g7` | 189193 | 152534 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| resolveRenewOrExpire | `EXt` | 189199 | 152541 | UsageDeep.tsx | styles-CdEGpc2x.js | renew 优先 |
| formatUtcShortDate | `DXt` | 189205 | 152556 | UsageDeep.tsx | styles-CdEGpc2x.js | UTC 短日期（同年省年） |
| formatLocalShortDate | `OXt` | 189216 | 152569 | UsageDeep.tsx | styles-CdEGpc2x.js | （同年省年） |
| PlanLoginDisconnectButtons | `kXt` | 189226 | 152581 | UsageDeep.tsx | styles-CdEGpc2x.js | /断开按钮组 |
| UpgradePlansButton | `AXt` | 189271 | 152605 | UsageDeep.tsx | styles-CdEGpc2x.js | /收起（折扣渐变态） |
| StartPlanPreviewCard | `jXt` | 189309 | 152628 | UsageDeep.tsx | styles-CdEGpc2x.js | +配额数+明细 |
| startPlanPreviewSummary | `MXt` | 189380 | 152648 | UsageDeep.tsx | styles-CdEGpc2x.js | entitlements → {grantUnitsLabel,unitLabel,detailsDescription} |
| isVisibleModelUsageEntitlement | `NXt` | 189395 | 152660 | UsageDeep.tsx | styles-CdEGpc2x.js | meter=model_usage && grantUnits>0 && showName |
| formatGrantUnits | `PXt` | 189398 | 152663 | UsageDeep.tsx | styles-CdEGpc2x.js | ja(locale, e) |
| formatGrantUnitsLocalized | `FXt` | 189401 | 152666 | UsageDeep.tsx | styles-CdEGpc2x.js | en 紧凑长词形首大写 |
| entitlementDetailsDescription | `IXt` | 189416 | 152674 | UsageDeep.tsx | styles-CdEGpc2x.js | （each/single）× daily/generic |
| groupEntitlementsByGrant | `LXt` | 189441 | 152695 | UsageDeep.tsx | styles-CdEGpc2x.js | grantUnits → showName[] |
| joinModelNames | `RXt` | 189449 | 152706 | UsageDeep.tsx | styles-CdEGpc2x.js | zh `、` / 其余 ` / ` |
| entitlementUnitLabel | `zXt` | 189452 | 152709 | UsageDeep.tsx | styles-CdEGpc2x.js | daily → `unit/day` 文案 |
| entitlementUnitText | `BXt` | 189458 | 152717 | UsageDeep.tsx | styles-CdEGpc2x.js | token → tokens 文案 |
| StartPlanBalanceCard | `VXt` | 189463 | 152722 | UsageDeep.tsx | styles-CdEGpc2x.js | （标题+到期+限额行） |
| StartPlanLimitRow | `HXt` | 189513 | 152753 | UsageDeep.tsx | styles-CdEGpc2x.js | +百分比+进度+用量 |
| startPlanLimitKey | `UXt` | 189554 | 152766 | UsageDeep.tsx | styles-CdEGpc2x.js | `${type}:${label}` |
| startPlanLimitTotal | `WXt` | 189557 | 152769 | UsageDeep.tsx | styles-CdEGpc2x.js | number ?? unit ?? 0 |
| startPlanLimitRemaining | `GXt` | 189560 | 152772 | UsageDeep.tsx | styles-CdEGpc2x.js | remaining ?? 0 |
| formatRemainingPercent | `KXt` | 189563 | 152775 | UsageDeep.tsx | styles-CdEGpc2x.js | ≥10% 整数百分比 |
| formatLimitAmount | `qXt` | 189569 | 152781 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| earliestRenewOrResetTime | `JXt` | 189572 | 152786 | UsageDeep.tsx | styles-CdEGpc2x.js | renewTime 优先，否则 limits.nextResetTime 最小 |
| formatResetTimeLabel | `YXt` | 189581 | 152792 | UsageDeep.tsx | styles-CdEGpc2x.js | =HH:mm，否则 `Mon d HH:mm` |
| expireLabelOf | `XXt` | 189597 | 152807 | UsageDeep.tsx | styles-CdEGpc2x.js | expiresAt 文案 |
| startPlanLimitName | `ZXt` | 189603 | 152819 | UsageDeep.tsx | styles-CdEGpc2x.js | usageDetails → kq 展示名 |
| normalizeStartPlanModelCode | `QXt` | 189612 | 152826 | UsageDeep.tsx | styles-CdEGpc2x.js | glm-5-turbo 特判 |
| StartPlanBalanceCardEmbedded | `$Xt` | 189616 | 152830 | UsageDeep.tsx | styles-CdEGpc2x.js | VXt 薄包装 |
| BigModelUnregisteredHint | `eZt` | 189619 | 152839 | UsageDeep.tsx | styles-CdEGpc2x.js | +注册按钮 |
| isBigModelUnregisteredError | `tZt` | 189640 | 152851 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| USAGE_CHART_COLORS | `_7` | 189649 | 152856 | UsageDeep.tsx | styles-CdEGpc2x.js | 3 色 CSS 变量 |
| SectionLoadingPlaceholder | `v7` | 189650 | 152857 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| PresetEmptyState | `nZt` | 189662 | 152862 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| CodingPlanStatusSection | `rZt` | 189675 | 152873 | UsageDeep.tsx | styles-CdEGpc2x.js | （登录/购买/解绑/升级/配额/对话框） |
| resolvePlanCardTitle | `iZt` | 189991 | 153094 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| isMaxPlanLevel | `oZt` | 190006 | 153109 | UsageDeep.tsx | styles-CdEGpc2x.js | MAX 词边界 |
| CodingPlanQuotaCardRow | `sZt` | 190009 | 153112 | UsageDeep.tsx | styles-CdEGpc2x.js | 5h/周/月 MCP 三卡（缺省回退通用前 3） |
| quotaCardOrNull | `y7` | 190062 | 153156 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| hasVisibleQuotaLimits | `cZt` | 190073 | 153165 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| isNumericQuotaLimit | `lZt` | 190081 | 153168 | UsageDeep.tsx | styles-CdEGpc2x.js | percentage/remaining/currentValue/usage |
| genericQuotaLimitLabel | `uZt` | 190089 | 153171 | UsageDeep.tsx | styles-CdEGpc2x.js | TIME_LIMIT→月 MCP，否则总 token |
| QuotaLimitCard | `dZt` | 190094 | 153178 | UsageDeep.tsx | styles-CdEGpc2x.js | +模型+百分比+重置时间+进度 |
| findQuotaLimitStrict | `b7` | 190140 | 153201 | UsageDeep.tsx | styles-CdEGpc2x.js | type/unit/number（=Sq 的严格变体） |
| quotaUsedPercent | `fZt` | 190143 | 153204 | UsageDeep.tsx | styles-CdEGpc2x.js | percentage 优先，否则 remaining/number |
| clampPercent0to100 | `pZt` | 190156 | 153211 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| formatQuotaPercent | `mZt` | 190159 | 153214 | UsageDeep.tsx | styles-CdEGpc2x.js | `--` 或 `NN%` |
| quotaLimitModelsLabel | `hZt` | 190164 | 153219 | UsageDeep.tsx | styles-CdEGpc2x.js | usageDetails → 去重 `/` 连接 |
| normalizeQuotaModelCode | `gZt` | 190173 | 153226 | UsageDeep.tsx | styles-CdEGpc2x.js | `model:` 前缀；`_-`→空格 |
| resolveViewState | `_Zt` | 190181 | 153229 | UsageDeep.tsx | styles-CdEGpc2x.js | loginPending → checking 覆盖 |
| viewStateOf | `vZt` | 190188 | 153240 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ProviderCardShell | `x7` | 190191 | 153248 | UsageDeep.tsx | styles-CdEGpc2x.js | header+children |
| ProviderCardHeader | `yZt` | 190194 | 153254 | UsageDeep.tsx | styles-CdEGpc2x.js | logo+标题+状态徽章+尾随动作 |
| ConnectionModeNav | `bZt` | 190231 | 153271 | UsageDeep.tsx | styles-CdEGpc2x.js | （apiKey/startPlan/codingPlan/teamPlan） |
| connectionModeOptionsOf | `xZt` | 190307 | 153331 | UsageDeep.tsx | styles-CdEGpc2x.js | → 有序选项 |
| teamPlanLabelOrFallback | `SZt` | 190346 | 153376 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| 购买卡渐变类名 ×4 | `CZt` | 190349 | 153379 | UsageDeep.tsx | styles-CdEGpc2x.js | （success/#4099ff/#0ea5e9/#14b8a6） |
| 购买卡渐变类名 ×4 | `EZt` | 190349 | 153379 | UsageDeep.tsx | styles-CdEGpc2x.js | （success/#4099ff/#0ea5e9/#14b8a6） |
| 购买卡渐变类名 ×4 | `TZt` | 190349 | 153379 | UsageDeep.tsx | styles-CdEGpc2x.js | （success/#4099ff/#0ea5e9/#14b8a6） |
| 购买卡渐变类名 ×4 | `wZt` | 190349 | 153379 | UsageDeep.tsx | styles-CdEGpc2x.js | （success/#4099ff/#0ea5e9/#14b8a6） |
| isResolvedTeamPlanItem | `OZt` | 190356 | 153386 | UsageDeep.tsx | styles-CdEGpc2x.js | organizationId+projectId 非空 |
| mergeTeamPlanSnapshot | `kZt` | 190363 | 153389 | UsageDeep.tsx | styles-CdEGpc2x.js | team-plan 导航项 × 订阅快照合并 |
| resolvePurchaseIntent | `jZt` | 190700 | 153690 | UsageDeep.tsx | styles-CdEGpc2x.js | disconnected→login，其余→purchase |
| CodingPlanPurchaseBanner | `MZt` | 190703 | 153693 | UsageDeep.tsx | styles-CdEGpc2x.js | startPlan/personal/team 卡列 |
| shouldShowGenericTeamCard | `NZt` | 190913 | 153827 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| hasSubscribedProduct | `PZt` | 190922 | 153836 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| teamCardClassOf | `FZt` | 190925 | 153839 | UsageDeep.tsx | styles-CdEGpc2x.js | max/advanced→teal，否则 sky |
| teamIconClassOf | `IZt` | 190929 | 153843 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| teamDescriptionIdOf | `LZt` | 190933 | 153847 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| bannerDiscountConfigOf | `RZt` | 190939 | 153851 | UsageDeep.tsx | styles-CdEGpc2x.js | personal 或 team×断连 → 折扣 |
| productsProviderIdOf | `zZt` | 190947 | 153859 | UsageDeep.tsx | styles-CdEGpc2x.js | EY ?? e |
| resolveBannerPriceState | `BZt` | 190950 | 153862 | UsageDeep.tsx | styles-CdEGpc2x.js | >0 → price；全 soldOut → soldOut；bigmodel 缺省 49/598 |
| resolveTeamGroupPriceState | `VZt` | 190968 | 153888 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| resolveStartPlanTitle | `HZt` | 190975 | 153899 | UsageDeep.tsx | styles-CdEGpc2x.js | zh 下 `start plan` 回退本地文案 |
| PriceFromLabel | `UZt` | 190979 | 153907 | UsageDeep.tsx | styles-CdEGpc2x.js | zh `from $X`；zh `¥X 起` |
| StatusTitleDescription | `WZt` | 191011 | 153927 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| statusTitleDescriptionOf | `GZt` | 191023 | 153933 | UsageDeep.tsx | styles-CdEGpc2x.js | disconnected/notPurchased/unavailable → 标题+描述 |
| reorderProviderIds | `KZt` | 191034 | 153946 | UsageDeep.tsx | styles-CdEGpc2x.js | active/over → arrayMove |
| groupLoadingOf | `qZt` | 191039 | 153951 | UsageDeep.tsx | styles-CdEGpc2x.js | preset→presetLoading，否则 customLoading |
| addCustomLoadingOf | `JZt` | 191042 | 153954 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| navItemDisplayLabel | `YZt` | 191045 | 153957 | UsageDeep.tsx | styles-CdEGpc2x.js | preset → 族 label 覆盖 |
| NavRailItem | `XZt` | 191048 | 153960 | UsageDeep.tsx | styles-CdEGpc2x.js | （选中态/加载/状态点） |
| handleNavRailItemKey | `ZZt` | 191102 | 153987 | UsageDeep.tsx | styles-CdEGpc2x.js | Enter/Space → 选中 |
| NavRailDraggableItem | `QZt` | 191105 | 153994 | UsageDeep.tsx | styles-CdEGpc2x.js | dnd-kit 可拖拽项（grip 手柄） |
| NavRailGroup | `$Zt` | 191171 | 154035 | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ModelProviderNavRail | `eQt` | 191183 | 154042 | UsageDeep.tsx | styles-CdEGpc2x.js | （preset 组 + custom 拖拽组） |
| usageErrorOf | `K$t` | 195171 | 156988 | UsageDeep.tsx | styles-CdEGpc2x.js | → 消息字符串 |
| useAppUsageStats | `q$t` | 195179 | 156996 | UsageDeep.tsx | styles-CdEGpc2x.js | app 本地用量快照 hook |
| useCodingPlanUsageStats | `J$t` | 195206 | 157047 | UsageDeep.tsx | styles-CdEGpc2x.js | Coding Plan 用量快照 hook |
| isNoPlanEntitlement | `AUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| validateModelDraft | `AYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | invalid(id/kinds/contextWindow/maxOutputTokens) |
| 折扣信息对话框类名常量 | `BHe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| entitlementFreshnessKey | `Bj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | providerId+fingerprint → 缓存键 |
| resolveEntitlementStatus | `CUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | active/none/unavailable/unknown |
| entitlementErrorOf | `DUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| MODEL_KINDS | `DYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | [anthropic, openai-compatible, openai] |
| isPlanNavItem | `DZt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | codingPlan |
| hasActiveEntitlementForProvider | `Dq` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| dedupedGetEntitlementSnapshot | `EUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | getEntitlementSnapshot 单飞去重 |
| entitlementSourceId | `Eq` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | sourceId ?? providerId |
| hasNoUserOrProviders | `FUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| 快照缓存/监听集/失败表 | `Gj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （WeakMap×3） |
| FAILURE_BACKOFF_STEPS_MS | `Hj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | [3e4,6e4,12e4,3e5] |
| failureCacheOf | `Jj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| entitlementOptionsKey | `Kj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | JSON 键 |
| nextInFlightToken | `MUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| commitIfCurrent | `NUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| entitlementTimeoutError | `OUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | `usage_entitlement_request_timeout:${ms}` |
| in | `Qj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | -flight 去重表（WeakMap） |
| draggableProviderIdOf | `S7` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | custom |
| earliestNextResetTimeOf | `SUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | remaining/quota.limits 最早重置时间 |
| ENTITLEMENT_REQUEST_TIMEOUT_MS | `TUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 2e4 |
| getCachedBillingDiscount | `UHe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 1h TTL + 单飞 |
| 快照缓存/监听集/失败表 | `Uj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （WeakMap×3） |
| 折扣信息对话框类名常量 | `VHe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| RESET_REFRESH_SLACK_MS | `Vj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 1e4 |
| 快照缓存/监听集/失败表 | `Wj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （WeakMap×3） |
| isDocumentVisible | `Xj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| freshCachedSnapshot | `Yj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | nextAllowedAt/intervalMs 新鲜度判定 |
| ENTITLEMENT_INITIAL_STATE | `Zj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | {snapshot:null,loading:false,error:null} |
| StartPlanBalanceRow | `_3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ensureCodingPlanSources | `_M` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （单飞合并） |
| getCachedSnapshot | `_Ue` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | /setCachedSnapshot（写入时广播监听集） |
| API_FORMATS | `_Yt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | [anthropic-messages, openai-chat-completions, openai-responses] |
| formatResetTimeHm | `a3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | HH:mm（h23） |
| sameRequest | `a7` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| shouldProbeStartPlanEntitlement | `aM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| effectiveEnvOverlay | `aYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | ZCODE_EFFECTIVE_ENV 等（3.7.6 恒空） |
| isStartPlanLevel | `aZt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | start |
| subscribeCachedSnapshots | `bUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | /清理 |
| limitTotalOf | `c3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | number ?? unit ?? 0 |
| 供应商源注册表模块态 | `cM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| 探测缺省常量 | `cYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （800/2/22/3） |
| startPlanNextResetTimeOf | `d3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | subscription.details[0].renewTime → remaining → limits |
| 供应商源注册表模块态 | `dM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| USAGE_ENTITLEMENT_CACHE_TTL_MS | `dUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 600*1e3 |
| clampAttempts | `dYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| cleanupSaveMode | `eXt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | skip-delete |
| formatResetDateTimeCompact | `f3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | =HH:mm，否则 `Mon d HH:mm` |
| listCodingPlanSources | `fM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| readCachedEntitlementSnapshot | `fUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | localStorage 读（TTL 过期清除） |
| clampRequiredSuccessCount | `fYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| useBillingDiscountCore | `fj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| hasStartPlanBalance | `g3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| refreshCodingPlanSourcesForced | `gM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （单飞合并） |
| entitlementFreshnessKeyOf | `gUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | cacheKey+选项 → 新鲜度键 |
| BillingDiscountBadgeWithInfo | `gj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | +信息对话框 (51932 / 46660 区) |
| visibleStartPlanLimits | `h3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | total>0 |
| subscribeCodingPlanSources | `hM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| IDLE_AUTO_REFRESH_INTERVAL_MS | `hUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 30*6e4 |
| BillingDiscountBadge | `hj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （gradient/surface/tag）(51911 / 46646 区) |
| hasPlanWidgetModel | `i3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| hasActiveEntitlement | `iM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| hashApiKey | `jUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 31 进制滚动哈希 → 36 进制 |
| withTimeout | `kUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | Promise.race 超时 |
| limitRemainingOf | `l3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | remaining ?? 0 |
| 供应商源注册表模块态 | `lM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| 探测缺省常量 | `lYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （800/2/22/3） |
| 折扣配置缓存/单飞槽 | `lj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| limitModelLabel | `m3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | usageDetails → 展示名 `/` 连接 |
| setCodingPlanSources | `mM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| ACTIVE_AUTO_REFRESH_INTERVAL_MS | `mUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 5*6e4 |
| probeConfigKey | `mYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | JSON 稳定键 |
| hasDiscountCopy | `mj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| providerApiKeyFingerprint | `nM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | id:hash(apiKey) |
| PlanWidgetLimitRow | `o3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | +数值+进度条 |
| 供应商源注册表模块态 | `oM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| 探测缺省常量 | `oYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （800/2/22/3） |
| normalizeModelCode | `p3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | `model:` 前缀；glm-5-turbo→GLM-5Turbo；其余大写 |
| hasLoadedSources | `pM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| writeCachedEntitlementSnapshot | `pUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | localStorage 写 |
| normalizeProbeTarget | `pYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | service |
| localizedDiscountCopyOf | `pj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | locale → {badgeBody/cardTitle/cardBody/infoTitle/infoBody} |
| provider | `preset` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | .id (191031 / 153943) |
| snapshotCacheOf | `qj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| 供应商源注册表模块态 | `sM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| 探测缺省常量 | `sYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （800/2/22/3） |
| nullSafe | `tM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | e ?? null |
| isProviderSectionRefreshing | `tQt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | presetLoading |
| formatUsedPercent | `u3e` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 0–1 → 百分比 |
| 供应商源注册表模块态 | `uM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | （源列表/已加载/失效计数/单飞槽×2/监听集） |
| USAGE_ENTITLEMENT_CACHE_PREFIX | `uUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | `zcode:usage-entitlement:` (52266 / 47016 区) |
| clampTimeoutMs | `uYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| 折扣配置缓存/单飞槽 | `uj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| providerFamiliesOf | `vM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | jte 薄包装 |
| getCachedSnapshot | `vUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | /setCachedSnapshot（写入时广播监听集） |
| nonEmptyTrimmed | `vj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| shouldApplyRefreshResult | `wUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | reason×status 过滤 |
| isFailureBackoffActive | `xUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js |  |
| activeProvidersOf | `yM` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | kr 薄包装 |
| recordFailureBackoff | `yUe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | → 指数退避 |
| BILLING_DISCOUNT_CACHE_TTL_MS | `zHe` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | 3600*1e3 |
| API_FORMAT_DEFAULT_PATHS | `zYt` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | /v1/messages、/chat/completions、/responses |
| entitlementCacheStorage | `zj` | — | — | UsageDeep.tsx | styles-CdEGpc2x.js | localStorage 守卫 |

## 28. B4 · SettingsLeaves（F06/F15 设置深叶 + 自动化编辑器）

- 族登记：F06 子代理/插件分区 + F15 自动化编辑器（kNt/YMt）· SettingsPanels.report §7 接口级实体化
- 产物：SettingsLeaves.tsx / SettingsModalsStoresLeaves.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| automationStatusOf | `qht` | 109250 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isChatCreatedAutomation | `Yht` | 109262 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| scheduleBuilderToCron | `Y$` | 109265 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| cronToScheduleBuilder | `X$` | 109296 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| weekdayLabel | `Z$` | 109373 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| schedulePreviewText | `Q$` | 109376 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| cronPreviewText | `Xht` | 109449 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isRepresentableCron | `Zht` | 109460 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| gmtOffsetLabel | `Qht` | 109466 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| formatDateTime | `$$` | 109474 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| relativeTimeLabel | `$ht` | 109478 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveNextRunLabel | `egt` | 109498 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| formatRunDuration | `tgt` | 109502 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveTitleOnDefaultChange | `Rjt` | 134026 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| KeepAwakeSwitch | `Gjt` | 134428 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `A3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `D3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `E3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `F3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `Jjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `Kjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `M3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `N3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `O3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `P3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `Xjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `Yjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `Zjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `j3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `k3` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 图标尺寸常量与包装 | `qjt` | 134452–134510 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| BACK_BUTTON_CLASS | `Qjt` | 134511 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| FIELD_STACK_CLASS | `I3` | 134512 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| AutomationsEmptyState | `$jt` | 134513 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| EditorTabSwitcher | `eMt` | 134518 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| KeepAwakeRow | `tMt` | 134543 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| CreateSplitButton | `L3` | 134569 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 历史排序/气泡侧位常量 | `aMt` | 134639–134648 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 历史排序/气泡侧位常量 | `iMt` | 134639–134648 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 历史排序/气泡侧位常量 | `nMt` | 134639–134648 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 历史排序/气泡侧位常量 | `rMt` | 134639–134648 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PromptCard | `pMt` | 134945 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| AutoGrowTextarea | `mMt` | 134956 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | dMt/fMt 116/156) |
| PromptCardFooter | `hMt` | 134992 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| OffPeakTaskMenu | `gMt` | 134998 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| OffPeakHistoryTable | `yMt` | 135075 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| EDITOR_PAGE_CLASS | `H3` | 135266 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isThoughtPreviewReady | `OMt` | 135380 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| MODE_VALUES | `kMt` | 135383 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| buildModeOption | `jMt` | 135406 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveModelLabel | `NMt` | 135436 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| normalizeThoughtOption | `PMt` | 135449 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveThoughtLevelPayload | `FMt` | 135464 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveThoughtPreviewOption | `IMt` | 135467 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| fetchModelThoughtOption | `LMt` | 135473 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | 临时会话探测) |
| isLocalWorkspaceTab | `RMt` | 135496 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| useLocalWorkspaceTabs | `J3` | 135498 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isRemoteWorkspaceTab | `zMt` | 135501 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| collectWorkspaceOptions | `BMt` | 135504 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| useWorkspaceOptions | `VMt` | 135523 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pathTailName | `HMt` | 135529 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveAllowedThoughtLevels | `GMt` | 135539 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| buildOffPeakThoughtOption | `KMt` | 135554 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| neverLocked | `qMt` | 135572 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pathTailNameAlias | `JMt` | 135573 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| OffPeakTaskEditor | `YMt` | 135576–136025 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveDraftTitleOnDefaultChange | `ZMt` | 136058 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| changedFieldsOf | `QMt` | 136068 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| missingRequiredFields | `$Mt` | 136073 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| removeFromSet | `eNt` | 136082 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| inherit | `$3` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `Q3` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `e6` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `iNt` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `n6` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `nNt` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `rNt` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| inherit | `t6` | 136101–136108 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /频率表/页大小 8/区间 0–200 |
| paginationWindow | `aNt` | 136109 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pathTailName2 | `r6` | 136119 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 模型组缺省/当前模型/思考项提取 | `cNt` | 136122–136137 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 模型组缺省/当前模型/思考项提取 | `oNt` | 136122–136137 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 模型组缺省/当前模型/思考项提取 | `sNt` | 136122–136137 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pad2 | `i6` | 136138 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| Select | `lNt/a6` | 136141 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | 弹层类名常量 |
| Select | `dNt` | 136143 | 136150 | SettingsLeaves.tsx | styles-CdEGpc2x.js | /日历图标 |
| Select | `uNt` | 136143 | 136150 | SettingsLeaves.tsx | styles-CdEGpc2x.js | /日历图标 |
| HourMinuteColumn | `fNt` | 136153 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| TimePicker | `pNt` | 136185 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| ValueColumn | `mNt` | 136222 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| daysInMonth | `hNt` | 136255 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| MonthDayPicker | `gNt` | 136258 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| WeekdayPicker | `_Nt` | 136309 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| EndDatePicker | `bNt` | 136378 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| CustomRepeatDialog | `xNt` | 136501 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| runIfSaved | `SNt` | 136919 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| defaultScheduleBuilder | `CNt` | 136922 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| scheduleBuilderOf | `s6` | 136938 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| runStatusOf | `wNt` | 136956 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| scheduleRulePayload | `ONt` | 136990 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| AutomationEditor | `kNt` | 137005–138512 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `C1t` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `J7` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `S1t` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `Y7` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `b1t` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `q7` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 | `x1t` | 196654–196660 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| collectEditableAgents | `w1t` | 196661 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isUserManagedSubagent | `X7` | 196667 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isBuiltInSubagent | `T1t` | 196670 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| builtInSubagentName | `E1t` | 196673 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| mergeToolSelections | `k1t` | 196682 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isInheritAllTools | `A1t` | 196686 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| normalizeSelectedModel | `j1t` | 196689 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isSameModelRef | `M1t` | 196693 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveThoughtLevelOption | `N1t` | 196697 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isThoughtLevelAvailable | `P1t` | 196730 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isModelAvailableInGroups | `Z7` | 196736 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| subagentFormDraftOf | `Q7` | 196740 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| subagentFormKeyOf | `F1t` | 196754 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveModelTriggerLabel | `$7` | 196757 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| SubagentFormLabel | `e9` | 196765 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| SubagentColorDot | `I1t` | 196771 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| SubagentBadge | `t9` | 196777 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| groupSubagents | `L1t` | 196786 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| subagentScopeI18nId | `R1t` | 196792 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| ToolCheckboxRow | `z1t` | 196801 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| SubagentRow | `n9` | 196839 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| BuiltInModelOverrideControl | `B1t` | 196982 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| SubagentConfigForm | `V1t` | 197122 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginIcon | `r9` | 198144 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| hasUpdate | `i9` | 198171 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isUpdatable | `W1t` | 198174 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pluginDisplayName | `a9` | 198177 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pluginDescription | `o9` | 198180 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| buildStoreItems | `J1t` | 198199 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| collectFeaturedItems | `Y1t` | 198241 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| buildCategoryGroups | `X1t` | 198254 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| pluginSearchMatch | `Z1t` | 198272 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| sortInstalledItems | `Q1t` | 198286 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginInstalledList | `$1t` | 198297 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginHookDetailsList | `e0t` | 198413 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginDetailField | `s9` | 198520 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| hookCommandPreview | `t0t` | 198531 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginInfoRow | `n0t` | 198534 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| AddMarketplaceDialog | `r0t` | 198544 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isPluginBusy | `i0t` | 198670 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginEnabledSwitch | `a0t` | 198679 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginItemMenu | `o0t` | 198695 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginInstallButton | `s0t` | 198765 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStoreCard | `c0t` | 198789 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| 精选配置 | `c9` | 198843 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | （官方市场 + 6 插件名） |
| 精选配置 | `l0t` | 198843 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | （官方市场 + 6 插件名） |
| 精选配置 | `u0t` | 198843 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | （官方市场 + 6 插件名） |
| pickRecommendedItems | `d0t` | 198857 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| cache | `f0t/l9/p0t` | 198870–198878 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | 来源标签 |
| GROUP_COLLAPSED_COUNT | `u9` | 198879 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | =6 |
| PluginStoreGrid | `m0t` | 198880 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStoreSegmentButton | `h0t` | 199075 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStoreSection | `d9` | 199090 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginCardGrid | `f9` | 199106 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStoreGroup | `g0t` | 199112 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStorePublicView | `_0t` | 199172 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginStorePersonalView | `v0t` | 199223 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginDetail | `S0t` | 199276 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| MarketEntryCard | `C0t` | 199415 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginComponentSection | `w0t` | 199474 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginDetailInfo | `T0t` | 199531 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| firstHttpsUrl | `p9` | 199650 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginAdvancedSection | `E0t` | 199653 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginManageList | `D0t` | 199673 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| isRemovableMarketplace | `O0t` | 199763 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| MarketplaceRefreshFailure | `k0t` | 199766 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginSourcesDialog | `A0t` | 199786 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| formatMarketplaceTime | `j0t` | 199899 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| PluginUninstallDialog | `M0t` | 199903 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| useUninstallFlow | `N0t` | 199952 | — | SettingsLeaves.tsx | styles-CdEGpc2x.js |  |
| i18n | `G1t/K1t` | — | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | 文案按语言回退 (198154/198165) |
| ScrollArea | `Y3/XMt` | — | — | SettingsLeaves.tsx | styles-CdEGpc2x.js | /Scrollbar (136026/136042) |

## 29. B4 · ModalsLeaves（F09/F14/F18 模态与 diff 视图叶子）

- 族登记：F14 El gutter 控制器/gut 纯文本 diff + F09 文件路径件 + F18 hero 三件
- 产物：ModalsLeaves.tsx / SettingsModalsStoresLeaves.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| FOLDER_ICON_DATA_URI | `Mc` | 5113 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | svg data-uri |
| materialIconsBaseOverride | `Nc` | 5114 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | 可变注水点，$se 设置) |
| setMaterialIconsBase | `$se` | 5116 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| resolveMaterialIconsBase | `ece` | 5119 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | `./`→`material-icons` |
| materialIconPath | `Pc` | 5120 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | `${base}/${name}.svg` |
| materialIconPathAlias | `tce` | 5123 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| folder | `Fc` | 5124 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | /document 图标路径常量 |
| folder | `Ic` | 5124 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | /document 图标路径常量 |
| fileIconFallbackSrc | `Lc` | 5126 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | （自身→null；document→folder-uri；其余→document 路径） |
| relativeDisplayPath | `Rc` | 5138 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | （同基 → 空） |
| displayDirectoryPrefix | `nce` | 5144 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | （`…/` 尾） |
| resolveFileDisplayInfo | `zc` | 5150 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | /名/目录前缀归一 |
| FilePathInline | `Bc` | 5157 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | + 文件名 + 目录尾（失败降级） |
| FileIconImg | `Vc` | 5196 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | （失败降级） |
| isSameSelectionRange | `nl` | 5249 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| gutterUtilityButtonTree | `mce` | 5307 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | `diffs-icon-plus` 按钮 hast |
| isSameSelectionPoint | `hce` | 5314 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| serializeHast | `Tl` | 6020 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | vendored hast-util-to-html；接口级) |
| DiffInteractionManager | `El` | 6062 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | file |
| 指针目标类型守卫与助手 | `Al` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `Fl` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `Ml` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `Nl` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `Ol` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `Pl` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `ble` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `jl` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `kl` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `vle` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| 指针目标类型守卫与助手 | `yle` | 6959–7012 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| DIFF_TRUNCATED_MARKER_PATTERN | `ahe` | 23153 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | `^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$` |
| parseTruncatedMarker | `dhe` | 23226 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| parseDiffLine | `mut` | 100417 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | +/-/空白 前缀 → 行类型 |
| diffKindStyles | `hut` | 100426 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | added/removed/context 三态样式 |
| PlainTextDiffPreview | `gut` | 100459 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | + 截断提示 + 换行模式 |
| resolveHeroThemeStyles | `x4t` | 206054 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | → 面板/光晕/文案色四分支 |
| useHeroTextSizes | `S4t` | 206090 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | store 主题解析（system 走暗判定） |
| HeroCard | `C4t` | 206094 | — | ModalsLeaves.tsx | styles-CdEGpc2x.js |  |
| hast | `al` | — | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | text/element/icon 构造 (5254/5257/5260) |
| hast | `il` | — | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | text/element/icon 构造 (5254/5257/5260) |
| hast | `rl` | — | — | ModalsLeaves.tsx | styles-CdEGpc2x.js | text/element/icon 构造 (5254/5257/5260) |

## 30. B4 · StoresDeep（横切 store 深层助手 + 遥测下沉）

- 族登记：横切层 · Vo 搜索 store 纯助手/T3/F6/B6/Z0t/Eit + services 遥测下沉 29 函数（40397–41807）
- 产物：StoresDeep.tsx / SettingsModalsStoresLeaves.report.md
- 来源：styles-CdEGpc2x.js（js 行 / jsx 行双轨）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| useSessionActivityStore | `Ao` | 1301 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| SESSION_ACTIVITY_FIELD | `Pie` | 1307 | — | StoresDeep.tsx | styles-CdEGpc2x.js | ='__zcodeSessionActivity' |
| withSessionActivity | `jo` | 1308 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| sessionActivityOf | `Mo` | 1311 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| isSessionActivityActive | `Fie` | 1314 | — | StoresDeep.tsx | styles-CdEGpc2x.js | prewarming |
| pendingInteractionOf | `No` | 1318 | — | StoresDeep.tsx | styles-CdEGpc2x.js | userInput |
| mergeMetaPreservingActivity | `Po` | 1324 | — | StoresDeep.tsx | styles-CdEGpc2x.js | （createdAt/status 保持） |
| compareTasksBySortKey | `Iie` | 1340 | — | StoresDeep.tsx | styles-CdEGpc2x.js | created |
| compareTasksActiveFirst | `Lie` | 1353 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| compareTasks | `Fo` | 1365 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| taskWorkspaceKey | `Io` | 1368 | — | StoresDeep.tsx | styles-CdEGpc2x.js | = workspaceKey(路径, 身份) |
| taskEntityKey | `Lo` | 1371 | — | StoresDeep.tsx | styles-CdEGpc2x.js | `${workspaceKey}::${taskId}` |
| dedupeWorkspaceScopes | `Ro` | 1374 | — | StoresDeep.tsx | styles-CdEGpc2x.js | +字典序 |
| normalizeSearchTerm | `Rie` | 1382 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| normalizeSearchDescriptor | `zie` | 1385 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| descriptorCacheKey | `Bie` | 1396 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| sessionActivityListeners | `zo` | 1407 | — | StoresDeep.tsx | styles-CdEGpc2x.js | Set |
| subscribeSessionActivity | `Vie` | 1408 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| broadcastSessionActivity | `Hie` | 1411 | — | StoresDeep.tsx | styles-CdEGpc2x.js | /删除事件广播 |
| freezeQueryResult | `Uie` | 1414 | — | StoresDeep.tsx | styles-CdEGpc2x.js | （fetchedAt/stale=false） |
| descriptorMembershipMatch | `Wie` | 1431 | — | StoresDeep.tsx | styles-CdEGpc2x.js | pinned/archived/active/timeline/workspace |
| titleMatchesSearch | `Gie` | 1446 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| descriptorContainsTask | `Kie` | 1449 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| sortTaskKeysByDescriptor | `Bo` | 1453 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| shallowEqualLoose | `qie` | 1460 | — | StoresDeep.tsx | styles-CdEGpc2x.js | JSON 兜底比较 |
| mergeTaskMetaEntry | `Jie` | 1479 | — | StoresDeep.tsx | styles-CdEGpc2x.js | /非搜索两支合并（标题择优/摘要保持） |
| isQueryResultEquivalent | `Yie` | 1510 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| mergeIncomingTaskKeys | `Xie` | 1532 | — | StoresDeep.tsx | styles-CdEGpc2x.js | （updatedAt>fetchedAt） |
| isTakeNumberFailure | `Eit` | 91354 | — | StoresDeep.tsx | styles-CdEGpc2x.js | quota_3103/3103（stores-tasks.tsx 164 声明实体化 |
| automationErrorMessage | `y3` | 134084 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| automationLoadSeq | `b3` | 134087 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| isSameAutomationWorkspace | `S3` | 134089 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| findAutomation | `C3` | 134092 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| loadAutomationsIntoStore | `w3` | 134099 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| refreshSkillsAfterCommandsChange | `N6` | 142700 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| trimLeadingSlashes | `uFt` | 142719 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| commandNameKey | `dFt` | 142722 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| userCommandToSlashCommand | `fFt` | 142725 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| mergeCommandsIntoSlashCommands | `pFt` | 142737 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| commandsInFlight | `P6` | 142750 | — | StoresDeep.tsx | styles-CdEGpc2x.js | Map |
| commandsWorkspaceKey | `mFt` | 142751 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pluginErrorMessage | `hFt` | 142873 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pluginsWorkspaceKey | `gFt` | 142876 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pluginsInFlight | `I6` | 142879 | — | StoresDeep.tsx | styles-CdEGpc2x.js | Map |
| runPluginOperation | `L6` | 142880 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| loadPluginsListDeduped | `R6` | 142900 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| loadPluginsList | `_Ft` | 142915 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pluginErrorMessage2 | `z6` | 142978 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pluginErrorMessage3 | `yFt` | 143135 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| refreshCommandsAfterPluginSync | `bFt` | 143138 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| refreshPluginsAfterRemoteSync | `V6` | 143172 | — | StoresDeep.tsx | styles-CdEGpc2x.js | 尾部跨族接线接口级) |
| hooksWorkspaceKey | `K0t` | 201185 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| hookLocationForScope | `q0t` | 201188 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| isHookEditable | `_9` | 201193 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| buildNewHook | `J0t` | 201196 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| mergeHookPatch | `Y0t` | 201213 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| reloadHooks | `X0t` | 201229 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| saveHooksList | `v9` | 201238 | — | StoresDeep.tsx | styles-CdEGpc2x.js |  |
| pickBestTaskMetadata | `pe` | — | — | StoresDeep.tsx | styles-CdEGpc2x.js | (跨 chunk：skillStore `de`+`y`，变参折叠择优) |
| isAutomationLimitError | `ri` | — | — | StoresDeep.tsx | styles-CdEGpc2x.js | （跨 chunk：src `et`=hx，AUTOMATION_CREATE_LIMIT_REACHED 判定） |

## 31. B4 · LegacyDocEngine1–4（legacy-doc 引擎 [E1]–[E4]）

- 族登记：office legacy-doc 内部排版引擎 批次 A：BiDi/断词、测量/断行、脚本解析/段落 XML 编辑、编辑指令/分页/布局服务
- 产物：LegacyDocEngine1.tsx + LegacyDocEngine2.tsx + LegacyDocEngine3.tsx + LegacyDocEngine4.tsx / LegacyDocEngine.report.md
- 来源：previewPaneOfficeLegacyDocContent-HWD4EOEM.js（**行号口径 = jsx pretty 版**）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| BIDI_DIRECT_TYPES | `Ee` | — | 10303 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 0-255 双向类型直接表 |
| BIDI_RANGE_TABLE | `De` | — | 10304 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | [起,止,类型] |
| getBidiCharType | `Oe` | — | 10305 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （直接表 + 二分区间表） |
| computeBidiLevels | `ke` | — | 10324 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | UAX#9 级别算法（P2/W2/W4-W7/N1/N2/I1/I2 子集） |
| mapBidiLevelsToSegmentStarts | `Ae` | — | 10400 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | → 段首级别 |
| COLLAPSIBLE_WS_RE | `je` | — | 10407 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Me → NEEDS_WS_NORMALIZE_RE |
| resolveWhiteSpaceMode | `Ne` | — | 10409 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Pe → normalizeCollapsibleSpaces |
| normalizeHardLineBreaks | `Fe` | — | 10425 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 词粒度 Intl.Segmenter 单例 | `Ie` | — | 10429-10435 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 词粒度 Intl.Segmenter 单例 | `Le` | — | 10429-10435 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 词粒度 Intl.Segmenter 单例 | `Re` | — | 10429-10435 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| ARABIC_SCRIPT_RE | `ze` | — | 10437 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Be → COMBINING_MARK_RE |
| DECIMAL_DIGIT_RE | `Ve` | — | 10439 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · He → containsArabic |
| isCJKCodePoint | `Ue` | — | 10443 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · We → containsCJK |
| endsWithCJKClosingPunct | `Ge` | — | 10464 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| NON_BREAK_SPACE_SET | `Ke` | — | 10468 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Q → HYPHEN_CHAR_SET |
| endsWithNoBreakSpace | `qe` | — | 10471 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Je → endsWithHyphen |
| allowsBreakAfter | `Ye` | — | 10478 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| CJK_NO_LINE_START_SET | `Xe` | — | 10481 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ze → OPEN_PUNCT_SET |
| APOSTROPHE_SET | `Qe` | — | 10483 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · $e → CLOSE_PUNCT_SET |
| ARABIC_SENTENCE_END_SET | `et` | — | 10485 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · tt → MYANMAR_FULL_STOP_SET |
| CLOSING_QUOTE_SET | `nt` | — | 10487 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isClosingPunctCluster | `rt` | — | 10488 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · it → isCJKClosingPunctRun |
| isOpenPunctRun | `at` | — | 10503 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ot → isPurePunctRun |
| prevGraphemeBoundary | `st` | — | 10518 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ct → lastGraphemeCluster |
| firstNonMarkChar | `lt` | — | 10533 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ut → lastNonMarkCluster |
| CURRENCY_SIGN_RANGES | `dt` | — | 10548 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ft → inCodePointRanges |
| isCurrencySign | `pt` | — | 10553 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · mt → endsWithCurrencySign |
| firstNonMarkIsDigit | `ht` | — | 10560 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| splitTrailingOpenPunct | `gt` | — | 10563 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · _t → repeatUnitOf |
| expandRepeatUnit | `vt` | — | 10583 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · yt → endsWithArabicSentencePunct |
| endsWithMyanmarFullStop | `bt` | — | 10597 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · xt → splitLeadingSpaceWithMarks |
| endsWithClosingQuoteRun | `St` | — | 10609 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ct → classifyCharForTokenization |
| TOKEN_BOUNDARY_WS_RE | `wt` | — | 10632 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Tt → joinTokenParts |
| prependRepeatUnits | `Et` | — | 10637 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Dt → splitWordSegmentByCharKind |
| isBreakableTokenKind | `Ot` | — | 10673 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| URL_SCHEME_RE | `kt` | — | 10678 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · At → isUrlSchemeToken |
| looksLikeUrlQuery | `jt` | — | 10685 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Mt → mergeUrlTokens |
| mergeUrlQueryTokens | `Nt` | — | 10713 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| NUMERIC_INFIX_SET | `Pt` | — | 10739 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ft → PUNCT_OR_SYMBOL_RE |
| EMOJI_PRESENTATION_RE | `It` | — | 10741 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Lt → HYPHEN_LIKE_SET |
| isAsciiPunctuation | `Rt` | — | 10743 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · zt → isBreakablePunctuation |
| isBreakablePunctRun | `Bt` | — | 10751 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Vt → endsWithBreakableOrCurrency |
| shouldJoinAdjacentWords | `Ht` | — | 10769 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ut → containsDecimalDigit |
| isNumericTokenText | `Wt` | — | 10780 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Gt → mergeNumericTokens |
| mergeAdjacentWordTokens | `Kt` | — | 10812 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · qt → splitHyphenatedNumbers |
| mergeGlueTokens | `Jt` | — | 10877 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Yt → splitCJKOpenPunctTails |
| buildTokenStreamFromSegmenter | `Xt` | — | 10934 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| splitChunksAtHardBreaks | `Zt` | — | 11013 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| applyKeepAllToTokens | `Qt` | — | 11034 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| segmentTextToLayoutTokens | `$t` | — | 11075 | LegacyDocEngine1.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （段入口） |
| 单例测量上下文 | `en` | — | 11094 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 单例测量上下文 | `ln` | — | 11094 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| EMOJI_PRESENTATION_RE | `an` | — | 11098 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| EMOJI_SEQUENCE_RE | `on` | — | 11098 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| measureTextCached | `dn` | — | 11112 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · fn → getLineLayoutQuirks |
| parseFontSizeFromFont | `pn` | — | 11139 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · mn/sn → 字素 Segmenter 单例 |
| isEmojiPresentation | `hn` | — | 11148 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · gn → containsEmojiSequence |
| 表情过绘修正缓存/测量 | `_n` | — | 11153 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表情过绘修正缓存/测量 | `cn` | — | 11153 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| countEmojiSegments | `vn` | — | 11168 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · yn → emojiCountOf |
| emojiCorrectedWidth | `bn` | — | 11177 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · xn → computeBreakableFitAdvances |
| openFontMeasureSession | `Sn` | — | 11222 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isFitOnlyKind | `Cn` | — | 11233 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · wn → isLineEndShrinkableKind |
| skipShrinkableKinds | `Tn` | — | 11239 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · En → advanceToTabStop |
| fitLetterSpacingAt | `Dn` | — | 11253 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · On → addIfNonZero |
| letterSpacingAtSegment | `kn` | — | 11258 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · An → lineEndFitAdvanceOf |
| fitAdvanceOf | `jn` | — | 11263 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Mn → paintAdvanceOf |
| withTrailingLetterSpacing | `Nn` | — | 11268 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Pn → plusLetterSpacing |
| lowerBoundIndex | `Fn` | — | 11273 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · In → trailingLetterSpacingBefore |
| advanceWithTrailingSpacing | `Ln` | — | 11297 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| findChunkBySegment | `Rn` | — | 11298 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · zn → enterChunkAtCursor |
| locateChunkForCursor | `Bn` | — | 11318 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Vn → advanceToNextChunk |
| walkChunkLine | `Hn` | — | 11324 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Un → walkSimpleLine |
| walkLineFromCursor | `Wn` | — | 11479 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Gn → walkNextLineFromCursor |
| countLinesAndMaxWidth | `Kn` | — | 11488 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行字素缓存族 | `Jn` | — | 11525-11533 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行字素缓存族 | `Xn` | — | 11525-11533 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行字素缓存族 | `Yn` | — | 11525-11533 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行字素缓存族 | `qn` | — | 11525-11533 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| appendStringSlice | `Qn` | — | 11539 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · $n → getLineGraphemeCache |
| extractLineText | `er` | — | 11546 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| CJK | `nr` | — | 11566 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | Segmenter 单例  · rr → createEmptyMeasuredText |
| CJK | `tr` | — | 11566 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | Segmenter 单例  · rr → createEmptyMeasuredText |
| segmentCJKRun | `ir` | — | 11600 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ar → applyKeepAllToCJKRuns |
| graphemeCountForSpacing | `or` | — | 11666 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · sr → isHyphenLikeChar |
| hyphenBreakOffsets | `cr` | — | 11680 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · lr → widthWithLetterSpacing |
| buildWidthTable | `ur` | — | 11689 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · dr → remapChunksToWidthIndexes |
| measureTextLayout | `fr` | — | 11807 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · pr → measurePreWrapLayout |
| measuredTextIdentity | `mr` | — | 11815 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · hr → createLineFragment |
| countLayoutLines | `gr` | — | 11831 | LegacyDocEngine2.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · _r → breakNextLine |
| COMPLEX_SCRIPT_RE | `bi` | — | 12250-12252 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| MARK_SEPARATOR_PUNCT_RE | `xi` | — | 12250-12252 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| CJK_SCRIPT_RE | `yi` | — | 12250-12252 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| BIDI_LANG_RE | `Ci` | — | 12253 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| EAST_ASIA_LANG_RE | `Si` | — | 12253 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| trimToUndefined | `wi` | — | 12255 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ti → normalizeFontName |
| hasExplicitFontFamily | `Ei` | — | 12261 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Di → normalizeFontHint |
| resolveDefaultScript | `Oi` | — | 12268 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ki → classifyRunScript |
| resolveFontFamilyForScript | `Ai` | — | 12284 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ji → splitTextByScriptRuns |
| resolvePrimaryFontFamily | `Mi` | — | 12337 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| findTagEnd | `Ni` | — | 12343 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Pi → readTagName  · Fi → isSelfClosingTag |
| scanXmlElements | `Ii` | — | 12369 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Li → elementsByName |
| childElements | `Ri` | — | 12463 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · zi → ancestorElements |
| readXmlAttr | `Bi` | — | 12469 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Vi → setXmlAttr |
| decodeXmlEntities | `Hi` | — | 12522 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ui → escapeXmlText |
| UNSUPPORTED_PARAGRAPH_EDIT_TAGS | `Wi` | — | 12552 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Gi → elementTextContent |
| hasAncestor | `Ki` | — | 12559 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · qi → collectVisibleTextTokens |
| paragraphMatchesTokens | `Ji` | — | 12578 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Yi → cloneRunStyle |
| canonicalizeForCompare | `Xi` | — | 12586 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Zi → deepEqualCanonical |
| buildRunProvenance | `Qi` | — | 12598 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · $i → verifyRunProvenance |
| prepareParagraphEdit | `ea` | — | 12622 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ta → hasInterstitialContent |
| isSimpleRevisionRun | `na` | — | 12676 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ra → findRevisionElements |
| applyXmlEdits | `ia` | — | 12699 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · aa → renameXmlElements |
| parseXmlBoolAttr | `oa` | — | 12715 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · sa → normalizeXmlColor |
| parseRunStyleFromXml | `ca` | — | 12725 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · la → collectDeletedRuns |
| applyRevisionToParagraph | `ua` | — | 12816 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · da → acceptTrackedChange |
| rejectTrackedChange | `fa` | — | 12903 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · pa → setCommentResolved |
| nextCommentId | `ma` | — | 12922 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ha → allocateExtendedParagraphId |
| isValidXmlText | `ga` | — | 12932 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · _a → isLeapYear |
| isValidXsdDateTime | `va` | — | 12948 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ya → isSafeSplitOffset |
| withXmlSpacePreserve | `ba` | — | 12973 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · xa → replaceRunText |
| insertCommentIntoParagraph | `Sa` | — | 12986 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ca → createParagraphNode |
| getParagraphNode | `wa` | — | 13119 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ta → textChildren |
| cloneTextRun | `Ea` | — | 13126 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Da → sameNoteReference |
| cloneFormField | `Oa` | — | 13141 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ka → cloneImageRun |
| cloneAnyRun | `Aa` | — | 13202 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ja → cloneRunStyleShallow |
| styleJsonEqual | `Ma` | — | 13212 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Na → mergeAdjacentTextRuns |
| formFieldDisplayText | `Pa` | — | 13228 | LegacyDocEngine3.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Fa → paragraphPlainText |
| COMPLEX_CONTENT_XML_RE | `Ia` | — | 13244 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| FLD_SIMPLE_RE | `La` | — | 13244 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| buildSourceTextPatch | `Ra` | — | 13246 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · za → isFieldTextDivergent |
| setParagraphText | `Ba` | — | 13272 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Va → countOccurrences |
| registerTableTextPatch | `Ha` | — | 13284 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ua → invalidateTableSourceXml |
| paragraphNodeIndexByOrdinal | `Wa` | — | 13304 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ga → findParagraphByOrdinalDeep |
| splitTextRunsAtOffset | `Ka` | — | 13330 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · qa → commonPrefixLength |
| commonSuffixLength | `Ja` | — | 13378 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ya → diffTextRunsAgainstString |
| rebuildParagraphChildren | `Xa` | — | 13422 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Za → splitParagraphChildrenAroundRange |
| replaceModelParagraphText | `Qa` | — | 13626 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · $a → replaceTableCellText |
| replaceTableCellParagraphText | `eo` | — | 13696 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · to → replaceTableCellParagraphTextDeep |
| serializeDocxPackage | `no` | — | 13764 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| mapBeforeInputEvent | `ro` | — | 13773 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · io → inputCommandCategory |
| isWhitespaceChar | `ao` | — | 13882 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · oo → prevCharUnitLength |
| nextCharUnitLength | `so` | — | 13892 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · co → prevWordStart |
| nextWordEnd | `lo` | — | 13904 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · uo → lineStartBefore |
| lineEndAfter | `fo` | — | 13915 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · po → splicePlainText |
| applyPlainTextInputCommand | `mo` | — | 13925 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ho → isMergeableTypingEntry |
| mergeCellParagraphsAtBoundary | `go` | — | 13967 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| PAGE_BREAK_BR_RE | `_o` | — | 13985 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| PAGE_BREAK_BEFORE_RE | `vo` | — | 13985 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| tableBreakCache | `yo` | — | 13987 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · bo → parseBoolXmlAttrDefaultTrue |
| hasPageBreakRun | `xo` | — | 13995 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · So → hasPageBreakBefore |
| paragraphHasContent | `Co` | — | 14004 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · wo → paragraphHasImage |
| paragraphHasFormField | `To` | — | 14010 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Eo → isPurePageBreakParagraph |
| paragraphNodesOf | `Do` | — | 14016 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Oo → rowHasContent |
| contentCellIndexes | `ko` | — | 14022 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ao → isTrailingFillRow |
| tablePageBreakRowIndexes | `jo` | — | 14033 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Mo → collectNodePageBreaks |
| SCALE_SEARCH_STEPS | `No` | — | 14079 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Po → pageBudgetSatisfied |
| footerOverlapResolved | `Fo` | — | 14089 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Io → updateOverlapStability |
| memoizePageBuilder | `Lo` | — | 14109 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ro → chooseEstimatedPages |
| isBetterScaleCandidate | `zo` | — | 14133 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Bo → fitPageCountByScale |
| HISTORY_LIMIT | `Vo` | — | 14196 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ho → hasOwnProperty |
| createEditorHistoryReducer | `Uo` | — | 14200 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 缓存容量 | `Go` | — | 14269-14271 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 缓存容量 | `Ko` | — | 14269-14271 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 缓存容量 | `Wo` | — | 14269-14271 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| WeakMap | `Xo` | — | 14275 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Qo/$o/es → 布局测量宿主 |
| WeakMap | `Zo` | — | 14275 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Qo/$o/es → 布局测量宿主 |
| canMeasureText | `ts` | — | 14279 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ns → lruGet  · rs → lruEvict |
| getLayoutMeasureContext | `is` | — | 14293 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · as → measureTextWidthPx |
| measurePrefixWidthPx | `os` | — | 14306 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ss → getLayoutGraphemeSegmenter |
| graphemeBoundaryOffsets | `cs` | — | 14313 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ls → graphemeCountOfText |
| graphemeOrdinalToOffset | `us` | — | 14329 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ds → measuredRangeLength |
| layoutCacheKey | `fs` | — | 14357 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ps → fragmentPrefixWidths |
| hitTestFragmentX | `ms` | — | 14369 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · hs → nearestLineIndexByY |
| measurePreWrapCached | `gs` | — | 14391 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · _s → countWrappedLinesCached |
| cloneItemCursor | `vs` | — | 14418 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ys → isCursorAtItemStart |
| normalizeItemCursor | `bs` | — | 14427 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · xs → isItemCursorExhausted |
| measureRestOfItemLine | `Ss` | — | 14442 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Cs → fitItemsIntoInterval |
| wouldTruncateItemStart | `ws` | — | 14493 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ts → shouldSkipTruncatedFit |
| isSegmentCursorAtEnd | `Es` | — | 14525 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ds → isCursorAfterHardBreak |
| isMidSegmentEnd | `Os` | — | 14531 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · ks → lineEndsMidSegment |
| canFitIntoAnyInterval | `As` | — | 14541 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · js → subtractExclusionIntervals |
| layoutPlainTextBlock | `Ms` | — | 14573 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ns → layoutTextItemsBlock |
| hitTestTextOffset | `Ps` | — | 14746 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Fs → caretRectForOffset |
| selectionRangeRects | `Is` | — | 14789 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ls → sliceLayoutLines |
| FNV | `Bs` | — | 14836-14839 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Hs → fnv1aStep |
| FNV | `Rs` | — | 14836-14839 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Hs → fnv1aStep |
| FNV | `Vs` | — | 14836-14839 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Hs → fnv1aStep |
| FNV | `zs` | — | 14836-14839 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Hs → fnv1aStep |
| hashStringSampled | `Us` | — | 14845 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ws → hashValueDeep |
| structuralHashBase36 | `Gs` | — | 14883 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | · Ks/qs → 缓存结构哈希 |
| 文档元数据指纹 | `Js` | — | 14892 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文档元数据指纹 | `Ys` | — | 14892 | LegacyDocEngine4.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |

## 32. B4 · LegacyDocEngineB×6（legacy-doc 引擎 [E5]–[E7]）

- 族登记：office legacy-doc 内部排版引擎 批次 B：缩略图常量/文档模型/行布局分页/编辑器状态机 tS/页注册表/页面渲染器 ES
- 产物：LegacyDocEngineBThumbnails.ts + LegacyDocEngineBModel.ts + LegacyDocEngineBLayout.tsx + LegacyDocEngineBEditorState.tsx + LegacyDocEngineBPageRegistry.tsx + LegacyDocEngineBPageRenderer.tsx / LegacyDocEngineB.report.md
- 来源：previewPaneOfficeLegacyDocContent-HWD4EOEM.js（**行号口径 = jsx pretty 版**）

| 语义名 | 混淆名 | js 行 | jsx 行 | 所在文件 | 源文件 | 备注 |
|---|---|---|---|---|---|---|
| THUMBNAIL_EXCLUDE_ATTR | `Xs` | — | 14902 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| THUMBNAIL_HIGHLIGHT_COLORS | `Zs` | — | 14904-14917 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （8 色 → hex） |
| THUMBNAIL_HEADING_CSS_STYLES | `Qs` | — | 14918-14956 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 1-6 级 CSS 样式 |
| THUMBNAIL_HEADING_METRICS | `$s` | — | 14957-14988 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | 1-6 级度量（字体/字号/粗体/色） |
| IMPORT_PERF_MARK_PREFIX | `Tc` | — | 15015 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | `react-docx.import` |
| markPerf | `Ec` | — | 15016-15020 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | performance.mark 安全包装 |
| measurePerf | `Dc` | — | 15021-15025 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | performance.measure 安全包装 |
| perfMarkName | `Oc` | — | 15026-15029 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | → 标记名（时间戳+净化） |
| NAVIGATION_KEYS | `Ol` | — | 15096 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| MODIFIER_KEYS | `kl` | — | 15097 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeRowHeightPx | `Gl` | — | 15111-15113 | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （非法 → -1，合法 → ≥1 整数） |
| rowHeightCacheKey | `Kl` | — | 15114 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| xmlAttrValue | `ql` | — | 15119 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| headingLevelFromName | `Jl` | — | 15124 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveStyleHeadingLevel | `Yl` | — | 15131 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| applyHeadingRunStyles | `Xl` | — | 15134 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseDropCap | `Zl` | — | 15151 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| hasFramePr | `Ql` | — | 15208 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| detectLetterheadSide | `$l` | — | 15212 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| neighborHasFramePr | `eu` | — | 15223 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| letterheadSideOfNode | `tu` | — | 15232 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| collectLetterheadRun | `nu` | — | 15238 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| clampNumber | `ou` | — | 15287 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isScrollableOverflow | `su` | — | 15290 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| findScrollContainer | `cu` | — | 15293 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveCumulativeZoom | `lu` | — | 15303 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| positiveNumber | `uu` | — | 15316 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| joinDefined | `pu` | — | 15337 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| scheduleFrame | `Ru` | — | 15392 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeMeasuredHeight | `zu` | — | 15401 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| reconcileTableRowHeights | `Bu` | — | 15404 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveMeasuredRowHeights | `Vu` | — | 15421 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| buildPaginationSnapshot | `Hu` | — | 15444 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| samePaginationSnapshot | `Uu` | — | 15461 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| validateMeasuredHeightPrefix | `Wu` | — | 15467 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| placeCaretAtEnd | `Gu` | — | 15494 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| selectionOffsetsWithin | `Ku` | — | 15500 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| rangeOffsetsWithin | `qu` | — | 15525 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| selectTextRange | `Ju` | — | 15547 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| TABLE_CONTEXT_MENU_ITEMS | `Yu` | — | 15583 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isMacPlatform | `Xu` | — | 15608 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| platformShortcut | `Zu` | — | 15618 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| CLIPBOARD_MENU_ITEMS | `Qu` | — | 15621 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| IMAGE_ORDER_MENU_ITEMS | `$u` | — | 15632 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| IMAGE_WRAP_MENU_ITEMS | `ed` | — | 15655 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| defaultTableBorders | `od` | — | 15691 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| twipsToPxRounded | `ld` | — | 15727 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pointsToPx | `ud` | — | 15730 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| relsPartPath | `dd` | — | 15733 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolvePartPath | `fd` | — | 15739 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseRelationships | `pd` | — | 15754 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| decryptEmbeddedFont | `md` | — | 15767 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| extractEmbeddedFonts | `hd` | — | 15776 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseSectionColumns | `gd` | — | 15819 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionContentWidthPx | `_d` | — | 15854 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionStartPageNumber | `vd` | — | 15861 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionStartPageNumberOrUndefined | `yd` | — | 15870 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionPageNumberFormat | `bd` | — | 15879 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionBreakType | `xd` | — | 15884 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeHeaderFooterRefType | `Sd` | — | 15889 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| dedupeHeaderFooterRefs | `Cd` | — | 15893 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| dedupeSectionHeaderFooters | `wd` | — | 15905 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeDocumentSections | `Td` | — | 15908 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodeHasHeavyContent | `Ed` | — | 15927 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| floatingImageTopPx | `kd` | — | 15936 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isAboveDocumentImage | `Ad` | — | 15945 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphFloatingImageTop | `jd` | — | 15948 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| minFloatingImageTop | `Md` | — | 15960 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| floatingImageReservedHeight | `Nd` | — | 15968 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| measureHeaderHeight | `Pd` | — | 15996 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| measureFooterHeight | `Fd` | — | 16014 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolvePageBodyHeight | `Id` | — | 16040 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| maxRenderedBottomPx | `Ld` | — | 16079 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| reconcilePageHeights | `Rd` | — | 16085 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| segmentIdentityKey | `zd` | — | 16095 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageIdentityKey | `Bd` | — | 16101 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| buildSectionPageMetrics | `Vd` | — | 16104 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionIndexForNode | `Hd` | — | 16129 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| scaleSectionMetrics | `Ud` | — | 16135 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| scaleHeightList | `Wd` | — | 16141 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolvePageContentHeight | `Gd` | — | 16144 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveRenderBodyHeight | `Kd` | — | 16152 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageIsOnlySplitSegments | `qd` | — | 16163 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| estimateFootnoteHeight | `Jd` | — | 16166 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| collectPageFootnotes | `Yd` | — | 16181 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paginateWithFootnotes | `Xd` | — | 16191 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseIndexAttr | `Zd` | — | 16214 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseParagraphDomLocation | `Qd` | — | 16218 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseTableCellDomLocation | `$d` | — | 16242 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeCellRange | `ef` | — | 16255 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isCollapsedCellSelection | `tf` | — | 16263 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sameCellSelection | `nf` | — | 16266 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| cellSelectionContains | `rf` | — | 16269 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| rangeTouchesTable | `af` | — | 16274 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| enumerateSelectedCells | `of` | — | 16277 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| tableFirstLastCell | `sf` | — | 16294 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| selectionCoversTable | `cf` | — | 16316 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| rangeTextLength | `lf` | — | 16329 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| compareLocations | `uf` | — | 16335 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| compareTextPositions | `df` | — | 16338 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeTextRange | `ff` | — | 16342 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| STARTER_DOCX_MODEL | `pf` | — | 16351 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| cloneModel | `mf` | — | 16439 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| createStarterModel | `hf` | — | 16442 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| textChildren | `gf` | — | 16445 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphText | `_f` | — | 16448 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodesHaveExplicitFont | `vf` | — | 16451 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| firstExplicitFontFamily | `yf` | — | 16454 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveDocumentFontFamily | `bf` | — | 16470 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| flattenTabLayouts | `xf` | — | 16489 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| elementToPlainText | `Sf` | — | 16511 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| elementToClipboardText | `Cf` | — | 16520 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| htmlToPlainText | `wf` | — | 16530 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| htmlToClipboardText | `Tf` | — | 16536 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| renderStaticMarkup | `Ef` | — | 16541 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| formFieldDisplayText | `Df` | — | 16544 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| firstTextRunStyle | `Of` | — | 16558 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodesContainImage | `Nf` | — | 16587 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasImage | `Pf` | — | 16597 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsTextBoxCarrier | `Ff` | — | 16599 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsImageOnly | `If` | — | 16603 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsFloatingImageOnly | `Lf` | — | 16615 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsImagesAndText | `Rf` | — | 16626 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsBehindDocImages | `zf` | — | 16636 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isBehindDocImageOf | `Bf` | — | 16643 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsCoverCandidate | `Vf` | — | 16646 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasPageAnchoredImage | `Hf` | — | 16648 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasFloatingImage | `Uf` | — | 16655 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| collectHeadingColors | `Wf` | — | 16657 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodesContainFullWidthImage | `Gf` | — | 16699 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodesContainPageFloatingImage | `Kf` | — | 16713 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasFormField | `qf` | — | 16717 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasCheckbox | `Jf` | — | 16719 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasVisibleText | `Yf` | — | 16721 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeComparableText | `Xf` | — | 16725 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| textBoxInnerText | `Zf` | — | 16731 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| textDuplicatedInTextBox | `Qf` | — | 16738 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsWhitespaceOnly | `$f` | — | 16747 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasSectionBreak | `ep` | — | 16749 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| imageIsFullPageCover | `tp` | — | 16751 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasFullPageCover | `np` | — | 16767 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| imageIsPageBackground | `rp` | — | 16769 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasPageBackground | `ip` | — | 16777 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsPlainIntro | `ap` | — | 16779 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| documentStartsWithCovers | `op` | — | 16781 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| imageChildKey | `sp` | — | 16791 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodeIsRemovableCover | `cp` | — | 16792 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| floatingLayerStyle | `lp` | — | 16795 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsCheckboxYesNoRow | `up` | — | 16810 | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| CJK_SCRIPT_REGEX | `dp` | — | 16816 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| exclusionAwareHeight | `hp` | — | 16821 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| dragPreviewHeight | `gp` | — | 16826 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| foreignExclusionsForLine | `_p` | — | 16836 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| singleImageExclusion | `vp` | — | 16846 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphImageExclusions | `yp` | — | 16858 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| wrapBandLayout | `bp` | — | 16917 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| layoutWrappedLines | `xp` | — | 16931 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| floatingImageGeometry | `Jp` | — | 17543 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphFloatingLayout | `Yp` | — | 17598 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| alignedFloatingLayout | `Xp` | — | 17664 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| checkboxGapPx | `Zp` | — | 17686 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| checkboxLeadingSpace | `Qp` | — | 17693 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表单域高度 | `nm` | — | 17703 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表单域高度 | `tm` | — | 17703 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| estimateTextWidthPx | `rm` | — | 17718 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| advanceAfterText | `im` | — | 17758 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nextTabStopDistance | `am` | — | 17764 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| formFieldWidthPx | `om` | — | 17778 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| checkboxWidthPx | `sm` | — | 17797 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsEmptyText | `cm` | — | 17806 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphMarkIsDeleted | `lm` | — | 17809 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| emptyBeforeDeletedMark | `um` | — | 17813 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isSectionBreakSpacer | `dm` | — | 17815 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isRemovableSectionSpacer | `fm` | — | 17818 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isTrailingSectionSpacer | `pm` | — | 17823 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphStyleIdentity | `mm` | — | 17837 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| contextualSpacingApplies | `hm` | — | 17844 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| bookmarkNames | `vm` | — | 17858 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| noteReferenceIds | `ym` | — | 17863 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| collectNodeNoteReferences | `bm` | — | 17871 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isInteractiveElement | `xm` | — | 17886 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isTableCellParagraphHost | `Sm` | — | 17889 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionXmlStartsNewPage | `Cm` | — | 17892 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphBreakFlags | `wm` | — | 17897 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageTailNearlyFull | `Om` | — | 17938 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| xmlBoolAttrEnabled | `km` | — | 17944 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionHasTitlePage | `Am` | — | 17948 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pickHeaderFooterForPage | `jm` | — | 17953 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionIndexForNode | `Mm` | — | 17967 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphHasVisibleBorders | `Nm` | — | 17978 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphIsSectionCover | `Pm` | — | 17982 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| lastPageBreakSectionIndex | `Fm` | — | 17985 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 分节断页节点集缓存 | `Bm` | — | 18010-18028 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 分节断页节点集缓存 | `Vm` | — | 18010-18028 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 分节断页节点集缓存 | `zm` | — | 18010-18028 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 节点高度/布局高 jsx 18571/18913/19002 | `Tg` | — |  18571 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 节点高度/布局高 jsx 18571/18913/19002 | `lg` | — |  18571 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 节点高度/布局高 jsx 18571/18913/19002 | `zh` | — |  18571 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 图片内联/浮动判定 jsx 19542/19817 | `Kg` | — |  19542 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 图片内联/浮动判定 jsx 19542/19817 | `Ng` | — |  19542 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| imageCropMetrics | `$g` | — | 19849 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveHighlightColor | `e_` | — | 19873 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphLineHeightCss | `t_` | — | 19877 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| keepNextExtraSpacing | `n_` | — | 19895 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| parseParagraphIndentXml | `s_` | — | 19918 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveNumberingIndent | `c_` | — | 19952 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| numberingLabelWidthPx | `l_` | — | 19994 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| numberingLabelContainerStyle | `u_` | — | 20010 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphCssStyle | `d_` | — | 20027 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| runStyleToCss | `__` | — | 20156 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| runStyleToCssDefaults | `v_` | — | 20194 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| mergeTextDecoration | `y_` | — | 20201 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| TOC | `C_` | — | 20227-20231 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| TOC | `S_` | — | 20227-20231 | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| reducerState | `n/r` | — | 24340 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /dispatch |
| stateRef | `l` | — | 24361 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| commitAction | `u` | — | 24363 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| docxPackage | `_/y` | — | 24418 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /setDocxPackage |
| documentLoadNonce | `x/S` | — | 24419 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /bump |
| fileName | `T/E` | — | 24424 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /setFileName |
| selectedFormFieldRaw | `D/O` | — | 24425 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| status | `k/A` | — | 24426 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /setStatus |
| importError | `j/M` | — | 24427 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| isImporting | `N/P` | — | 24428 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| documentTheme | `F/I` | — | 24429 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| showTrackedChanges | `L/R` | — | 24430 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| showComments | `z/B` | — | 24431 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| paginationInfo | `ee/V` | — | 24432 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| importAbortRef | `H` | — | 24434 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| historyRestoreRequest | `U/te` | — | 24435 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| selectionSessionKind | `ne/re` | — | 24436 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /set |
| applyEdit | `Be` | — | 24646 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| annotationFailureMessage | `Ve` | — | 24687 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| resolveRevision | `He` | — | 24688 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| createComment | `Ge` | — | 24740 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| setCommentResolved | `Ke` | — | 24776 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| applyModelEdit | `Q` | — | 24817 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| failImport | `qe` | — | 24826 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| importDocxFile | `Je` | — | 24833 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| newDocument | `Ye` | — | 24880 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| exportDocx | `Xe` | — | 24888 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| editSelectedParagraph | `$e` | — | 24965 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| restoreSelection | `et` | — | 24976 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| setActiveTextRange | `tt` | — | 24980 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| suppressNextDomSelectionRestore | `nt` | — | 25007 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| applyRunStyleEdit | `rt` | — | 25009 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| effectiveRunStyle | `lt` | — | 25097 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `_t` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `dt` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `ft` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `gt` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `ht` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `mt` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `pt` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 粗/斜/下划/删除/上标/下标/高亮/字色 | `ut` | — | 25107-25163 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| setLink | `vt` | — | 25164 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| applyBorderPreset | `Et` | — | 25456 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| setAlignment | `Dt` | — | 25549 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| toggleList | `Ot` | — | 25575 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| adjustSelectedListDepth | `kt` | — | 25645 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| insertTable | `Mt` | — | 25806 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| insertImageFile | `Nt` | — | 25873 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| appendParagraph | `Pt` | — | 25906 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| moveImage | `Ut` | — | 26061 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表格删除/移动/浮动/嵌套提取 | `Jt` | — | 26158-26297 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表格删除/移动/浮动/嵌套提取 | `Xt` | — | 26158-26297 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表格删除/移动/浮动/嵌套提取 | `Yt` | — | 26158-26297 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 表格删除/移动/浮动/嵌套提取 | `qt` | — | 26158-26297 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `an` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `nn` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `on` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `rn` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `sn` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 文本提交族 | `tn` | — | 26428-26543 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| syncPaginationInfo | `cn` | — | 26541 | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageRegistryByEditor | `nS` | — | 26661 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paginationSinkOf | `rS` | — | 26662 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageRegistryOf | `iS` | — | 26664 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| publishPageSnapshots | `aS` | — | 26675 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| notifyPageRegistry | `oS` | — | 26706 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| registerPageElement | `sS` | — | 26710 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| cssNumber | `pS` | — | 26725 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| normalizeHexColor | `mS` | — | 26731 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sameThumbnailRun | `hS` | — | 26737 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| appendThumbnailRuns | `gS` | — | 26740 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| headingMetricsOf | `_S` | — | 26757 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphThumbnailRuns | `vS` | — | 26760 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| firstNonEmptyCellRuns | `yS` | — | 26783 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphThumbnailElements | `bS` | — | 26787 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| tableThumbnailElement | `xS` | — | 26844 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| nodeContainsImage | `SS` | — | 26904 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageContainsImage | `CS` | — | 26907 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| buildPageThumbnailSnapshots | `wS` | — | 26909 | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| DocxEditorView | `ES` | — | 27340 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageRegistry | `C` | — | 27363 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isReadOnly | `k` | — | 27368 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| darkInverted | `A` | — | 27369 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| invertFilter | `M` | — | 27370 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| effectiveTheme | `j` | — | 27370 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| isEditable | `N` | — | 27371 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| tocLinkColors | `F` | — | 27376 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paragraphRenderContext | `I` | — | 27377 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sections | `Bn` | — | 27640 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageGeometry | `Hn` | — | 27646 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionMetrics | `Un` | — | 27647 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| geometryIdentityKey | `Wn` | — | 27648 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| sectionColumns | `Jn` | — | 27679 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| precomputedNumberingLabels | `Yn` | — | 27680 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| bookmarkNodeIndexes | `Xn` | — | 27681 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| measuredRowHeights | `Zn` | — | 27696 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| paginationResult | `Qn` | — | 27709-27888 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageIdentityKeys | `rr` | — | 27889 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| firstPageByNode | `ir` | — | 27890 | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行高换算 jsx 18523-18556 | `Fh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 新页节起点集缓存 | `Hm` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | (18029-18040+) |
| pageBreakBefore | `Im` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /分节断页/任一断页 (17996/18004/18008) |
| 行高换算 jsx 18523-18556 | `Lh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageBreakBefore | `Lm` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /分节断页/任一断页 (17996/18004/18008) |
| paginateDocument | `Mg` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | jsx 19190-19541（352 行；分页主循环： |
| 断行引擎 jsx 18200± | `Ms` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （排除带断行/兜底断行） |
| 行高换算 jsx 18523-18556 | `Nh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 断行引擎 jsx 18200± | `Ns` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （排除带断行/兜底断行） |
| 字号/字体解析 jsx 18106-18160 | `Qm` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| 行高换算 jsx 18523-18556 | `Rh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| pageBreakBefore | `Rm` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /分节断页/任一断页 (17996/18004/18008) |
| renderSectionNode | `TS` | — | — | LegacyDocEngineBPageRegistry.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | (26980-27339；段落/表格 + 草稿宿主 + 表格手柄， |
| accept | `Ue/We` | — | — | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /rejectTrackedChange (24737/24738) |
| 新页节起点集缓存 | `Um` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | (18029-18040+) |
| boundedCacheSet | `Wl` | — | — | LegacyDocEngineBThumbnails.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | Map 写入（先进先出淘汰， |
| 新页节起点集缓存 | `Wm` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | (18029-18040+) |
| 字号/字体解析 jsx 18106-18160 | `Ym` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| undo | `Ze/Qe` | — | — | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /redo (24905/24927) |
| 文本测量原语 jsx 18184-18193 | `ch` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （字体分段/宽度测量） |
| pageCount | `hr` | — | — | LegacyDocEngineBPageRenderer.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | (28070±) |
| isParagraph | `kf/Af` | — | — | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /isTable (16563/16566) |
| 文本测量原语 jsx 18184-18193 | `lh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （字体分段/宽度测量） |
| 字号/字体解析 jsx 18106-18160 | `nh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| setFontFamily | `st/ct` | — | — | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /setFontSize (25088/25092) |
| reducer | `starterModel` | — | — | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | + 25 组 useState/refs + 80 命令回调。 |
| 字号/字体解析 jsx 18106-18160 | `th` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js |  |
| px | `twips` | — | — | LegacyDocEngineBModel.ts | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （原 Br 语义；公共层 twipsToPx 为取整版，此处按引擎用法保留浮点） |
| 文本测量原语 jsx 18184-18193 | `uh` | — | — | LegacyDocEngineBLayout.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | （字体分段/宽度测量） |
| replaceExpandedSelection | `yt/bt` | — | — | LegacyDocEngineBEditorState.tsx | previewPaneOfficeLegacyDocContent-HWD4EOEM.js | /deleteExpandedSelection (25196/25387) |

## 33. D5c seam（out/main/seam，手写接线层；非混淆，符号即本名）

> 族登记：D5c nofy 内核接线（kernel supervisor / ACP client / ZCode↔ACP adapter /
> workspace 枚举 / 标题回退）。导航详见 `D5C-WIRING-LEDGER.md`（§1–§7）。
> 行号口径：`out/main/seam/*.js` 自身行号（ESM，未压缩）。

| 语义名 | 所在文件 | 备注 |
|---|---|---|
| ensureKernel / disposeKernel / KERNEL_WS_URL | kernel-supervisor.js | 发现-否则-启动（NOFY_SOCKET→appdata sock→9800 探针→spawn）；父退子收 |
| NofyAcpClient / chunkText | acp-client.js | Node ACP client（initialize/list/new/load/prompt/cancel/permission） |
| handleHostFrame / handleCommand | acp-agent-adapter.js | ZCode stdio ↔ ACP 桥总入口 |
| zcodeSessionSnapshot | acp-agent-adapter.js | **FIX-RESUME**：按 host `Vr` schema 的完整会话快照（protocol/session/settings/projection/runtime/messages）；session/create\|resume\|read\|setModel\|setThoughtLevel\|setMode\|updateRuntimeModelConfig 共用 |
| ZCODE_PROTOCOL / zcodeSettings / zcodeTitle | acp-agent-adapter.js | **FIX-RESUME**：`{name:"ZCode Protocol",version:1}`；settings 最小合法对象；标题回退链（live→首条用户消息→sid8） |
| ensureWorkspaceIndexLoaded / backfillAllIndexes | acp-agent-adapter.js | **FIX-WS**：sessions-index 订阅先懒加载后发初始快照（存量行进快照不进 deltas → host seed 路，不逐行 resume） |
| populateFromSummaries / populateFromSessionList | acp-agent-adapter.js | **FIX-WS**：静默填充 workspaceState.entries（workspace_list 主路 / session/list 回退） |
| logOnce | acp-agent-adapter.js | **FIX-RESUME**：同类日志每键只记一次（防刷屏写盘） |
| emitWireFrameFor / emitConv / emitSessionsIndexDelta | acp-agent-adapter.js | v4 帧发射（per-subscriptionId builder；topic/subscriptionId 与外层一致） |
| conversationSnapshot / sessionsIndexSnapshot / workspaceConfigSnapshot | acp-agent-adapter.js | 三类 topic 初始快照构建 |
| ensureReplayed / finishReplay / replayUpdate | acp-agent-adapter.js | session/load 回放重建 rows（高水位续接） |
| listKnownWorkspaces / listWorkspaceSessions | workspace-registry.js | **FIX-WS**：main 侧全量 workspace 枚举（ACP workspace_list 主路；dir-scan 3s 负缓存 + mtime 排序 + 200 行上限） |
| registerWorkspaceRegistry | workspace-registry.js | **FIX-WS**：IPC 注册（zcode:nofy-list-workspaces / zcode:nofy-workspace-sessions）；注册即预连 ACP |
| firstUserQueryTitle / truncateTitle | session-title.js | 标题回退链末环（chat_history.jsonl 首个 user_query，80 字截断） |
| WsEnumUseKnownWorkspaces / WsEnumUseWorkspaceSessions / WsEnumSection | out/renderer/assets/styles-CdEGpc2x.js（≈159277/159302/159404） | renderer 项目段枚举 + 展开懒 acquire（VS/HS SessionIndexStore 引用计数池）；本次未改动 |
| host Vr（session 快照 schema） | out/host/chunk-O5YHTQBW.js ≈15061 | resume/create/read/set* 响应校验形状（protocol/session/settings/projection/runtime/messages，strict） |
| host applySessionsIndexFrame / processSummary / seedMissingRowsFromInitialSnapshot | out/host/index.js ≈49359/49122/49141 | 首个快照 seed（不 resume）vs 后续 delta 逐行 resume——FIX-WS 让存量行走前者 |

## 34. B5 · Composer.tsx（Composer 族 F08 first-party）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk）· B5-01。行号口径：js 行（头注声明源为台账 213,695 行本，即台账口径；换算当前 js = 台账 + 分段偏移，见 B5-MERGE-NOTES §1）。
- 符号条数：377（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| useSubagentsContext | pqe | 63490 | Composer.tsx |  |
| skillContextRequestCache | RB | 63562 | Composer.tsx |  |
| skillContextGeneration | zB | 63563 | Composer.tsx |  |
| skillContextGenerationCounter | mqe | 63564 | Composer.tsx |  |
| skillContextCacheKey | BB | 63565 | Composer.tsx |  |
| mergeSkillContextEntry | VB | 63568 | Composer.tsx |  |
| dedupeSkillContextList | hqe | 63571 | Composer.tsx |  |
| loadSkillContext | HB | 63581 | Composer.tsx |  |
| useSkillContextStore | UB | 63640 | Composer.tsx |  |
| useSkillsContext | WB | 63680 | Composer.tsx |  |
| SUGGESTION_DEFAULT_LIMIT | gqe | 63751 | Composer.tsx | = 1000 |
| hasNonEmptyQuery | GB | 63752 | Composer.tsx |  |
| suggestionLimitForQuery | _qe | 63755 | Composer.tsx |  |
| filterVisibleSuggestionSections | vqe | 63758 | Composer.tsx |  |
| fuzzyScore | KB | 63761 | Composer.tsx |  |
| sortByFuzzyScore | yqe | 63778 | Composer.tsx |  |
| limitItems | qB | 63795 | Composer.tsx |  |
| fileDirectoryPriority | bqe | 63801 | Composer.tsx |  |
| sortFilesDirectoryFirst | xqe | 63803 | Composer.tsx |  |
| filterSuggestionsByQuery | JB | 63808 | Composer.tsx |  |
| subagentScopePriority | YB | 63843 | Composer.tsx |  |
| subagentScopeLabel | Sqe | 63845 | Composer.tsx |  |
| dedupeSubagentsByName | Cqe | 63854 | Composer.tsx |  |
| detectGlmSkillOrigin | wqe | 63878 | Composer.tsx |  |
| GLM_SKILL_ID_PREFIX_REGEX | Tqe | 63887 | Composer.tsx |  |
| isGlmSkill | Eqe | 63888 | Composer.tsx |  |
| filterGlmSkills | XB | 63891 | Composer.tsx |  |
| OFFICIAL_SKILL_PLUGINS | Dqe | 63893 | Composer.tsx |  |
| OFFICIAL_PLUGIN_PATH_MARKERS | Oqe | 63903 | Composer.tsx |  |
| CURATED_SKILL_DESCRIPTIONS | kqe | 63911 | Composer.tsx |  |
| localizeSkillScopeLabel | Aqe | 64010 | Composer.tsx |  |
| curatedSkillDescription | jqe | 64022 | Composer.tsx |  |
| isOfficialPluginSkill | Mqe | 64025 | Composer.tsx |  |
| buildSkillSuggestions | ZB | 64033 | Composer.tsx |  |
| useSkillSuggestions | Nqe | 64057 | Composer.tsx |  |
| suggestionQueryKey | QB | 64069 | Composer.tsx |  |
| MENTION_TRIGGER_REGEX | Pqe | 64072 | Composer.tsx |  |
| MENTION_TOKEN_PREFIX_REGEX | Fqe | 64073 | Composer.tsx |  |
| normalizeCnyTrigger | Iqe | 64074 | Composer.tsx |  |
| mentionFuzzyScore | $B | 64077 | Composer.tsx |  |
| scoreMentionSuggestion | eV | 64096 | Composer.tsx |  |
| parseMentionTrigger | tV | 64109 | Composer.tsx |  |
| mentionCompletionOverlap | nV | 64113 | Composer.tsx |  |
| sortMentionSuggestions | rV | 64131 | Composer.tsx |  |
| findBestSuggestionIndex | Lqe | 64151 | Composer.tsx |  |
| APP_SLASH_PREFIX | iV | 64163 | Composer.tsx | `app-slash:` |
| buildAppSlashSuggestions | Rqe | 64164 | Composer.tsx |  |
| isAppSlashSuggestion | zqe | 64179 | Composer.tsx |  |
| isSlashPanelAvailable | Bqe | 64182 | Composer.tsx |  |
| normalizeSlashCommandName | aV | 64185 | Composer.tsx |  |
| buildSessionSlashSuggestions | Vqe | 64188 | Composer.tsx |  |
| buildSubagentSlashSuggestions | Hqe | 64207 | Composer.tsx |  |
| buildSkillSlashSuggestions | Uqe | 64209 | Composer.tsx |  |
| toSubagentSlashSuggestion | Wqe | 64219 | Composer.tsx |  |
| readTextAroundCursor | Gqe | 64233 | Composer.tsx |  |
| toSlashPanelMention | Kqe | 64243 | Composer.tsx |  |
| useSessionSlashCommands | qqe | 64275 | Composer.tsx |  |
| isHttpUrl | oV | 64278 | Composer.tsx |  |
| MENTION_NODE_BASE_CLASS | sV | 64279 | Composer.tsx |  |
| mentionCategoryClass | cV | 64280 | Composer.tsx |  |
| unescapeMarkdownLinkLabel | Jqe | 64294 | Composer.tsx |  |
| parseMarkdownLinkLabel | Yqe | 64303 | Composer.tsx |  |
| mentionDisplayLabel | lV | 64307 | Composer.tsx |  |
| SVG_NAMESPACE | uV | 64319 | Composer.tsx |  |
| 技能 | Xqe |  | Composer.tsx |  |
| 子代理 | Zqe |  | Composer.tsx |  |
| 白板 | Qqe |  | Composer.tsx |  |
| 目标命令 | $qe |  | Composer.tsx |  |
| 紧凑命令 | eJe |  | Composer.tsx |  |
| 命令 | tJe |  | Composer.tsx |  |
| 会话 | nJe |  | Composer.tsx |  |
| 插件 | rJe |  | Composer.tsx |  |
| createMentionIconSvg | dV | 64387 | Composer.tsx |  |
| create | iJe | 64406–64431 | Composer.tsx | *Icon |
| create | aJe | 64406–64431 | Composer.tsx | *Icon |
| create | oJe | 64406–64431 | Composer.tsx | *Icon |
| create | sJe | 64406–64431 | Composer.tsx | *Icon |
| create | cJe | 64406–64431 | Composer.tsx | *Icon |
| create | lJe | 64406–64431 | Composer.tsx | *Icon |
| create | uJe | 64406–64431 | Composer.tsx | *Icon |
| create | dJe | 64406–64431 | Composer.tsx | *Icon |
| mentionFilePath | fJe | 64433 | Composer.tsx |  |
| stripLeadingSlashes | fV | 64436 | Composer.tsx |  |
| renderMentionNodeContent | pV | 64438 | Composer.tsx |  |
| PromptMentionNode | mV | 64514 | Composer.tsx |  |
| createMentionNode | hV | 64632 | Composer.tsx |  |
| isMentionNode | gV | 64636 | Composer.tsx |  |
| SCROLL_FADE_HEIGHT | _V | 64639 | Composer.tsx | = 24 |
| SCROLL_FADE_THRESHOLD | vV | 64640 | Composer.tsx | = 1 |
| NO_SCROLL_FADE | yV | 64641 | Composer.tsx |  |
| computeScrollFade | bV | 64642 | Composer.tsx |  |
| scrollFadeMaskStyle | xV | 64646 | Composer.tsx |  |
| 行高 34 | pJe | 64655–64657 | Composer.tsx |  |
| 40 | mJe | 64655–64657 | Composer.tsx |  |
| 28 | hJe | 64655–64657 | Composer.tsx |  |
| flattenSuggestionRows | gJe | 64663 | Composer.tsx |  |
| SuggestionPanel | SV | 64687 | Composer.tsx |  |
| SuggestionSectionHeaderRow | _Je | 64822 | Composer.tsx |  |
| SuggestionStatusRow | vJe | 64833 | Composer.tsx |  |
| SuggestionOptionRow | yJe | 64863 | Composer.tsx |  |
| useSlashPanelSections | bJe | 64915 | Composer.tsx |  |
| readSlashCursorContext | CV | 65000 | Composer.tsx |  |
| isCursorInsideToken | wV | 65018 | Composer.tsx |  |
| parseSlashTokenAtCursor | TV | 65021 | Composer.tsx |  |
| trackSlashToken | EV | 65028 | Composer.tsx |  |
| resolveSlashTokenRange | DV | 65038 | Composer.tsx |  |
| PROGRAMMATIC_UPDATE_TAG | OV | 65046 | Composer.tsx |  |
| HISTORY_NAVIGATION_TAG | kV | 65047 | Composer.tsx |  |
| isUserInitiatedUpdate | xJe | 65048 | Composer.tsx |  |
| SlashPanel | SJe | 65052 | Composer.tsx |  |
| PluginMentionIcon | AV | 65257 | Composer.tsx |  |
| @ | CJe | 65276–65278 | Composer.tsx |  |
| # | wJe | 65276–65278 | Composer.tsx |  |
| $ 触发类别表 | TJe | 65276–65278 | Composer.tsx |  |
| mentionCategoriesForTrigger | EJe | 65279 | Composer.tsx |  |
| mentionSessionScope | DJe | 65283 | Composer.tsx |  |
| buildFileSuggestions | OJe | 65286 | Composer.tsx |  |
| normalizeQueryCase | jV | 65298 | Composer.tsx |  |
| shouldRefreshFileList | kJe | 65301 | Composer.tsx |  |
| useFileSuggestions | AJe | 65310 | Composer.tsx |  |
| EMPTY_PLUGIN_CATALOG | MV | 65360 | Composer.tsx |  |
| INITIAL_PLUGIN_CATALOG_STATE | jJe | 65361 | Composer.tsx |  |
| pluginCatalogRequestCache | NV | 65362 | Composer.tsx |  |
| releasePluginCatalogRequest | PV | 65364 | Composer.tsx |  |
| trackPluginCatalogRequest | MJe | 65368 | Composer.tsx |  |
| usePluginReferenceCatalog | FV | 65372 | Composer.tsx |  |
| buildPluginSuggestions | NJe | 65436 | Composer.tsx |  |
| usePluginSuggestions | PJe | 65455 | Composer.tsx |  |
| SESSION_SUGGESTIONS_PER_WORKSPACE | FJe | 65483 | Composer.tsx | = 20 |
| compareSessionSuggestions | IJe | 65484 | Composer.tsx |  |
| sessionDisplayTitle | IV | 65496 | Composer.tsx |  |
| sessionWorkspaceLabel | LJe | 65499 | Composer.tsx |  |
| buildSessionSuggestion | RJe | 65504 | Composer.tsx |  |
| dedupeAndSortSessions | zJe | 65515 | Composer.tsx |  |
| limitSessionsPerWorkspace | BJe | 65528 | Composer.tsx |  |
| collectSessionListEndpoints | VJe | 65534 | Composer.tsx |  |
| useSessionSuggestions | HJe | 65565 | Composer.tsx |  |
| buildWhiteboardSuggestions | UJe | 65610 | Composer.tsx |  |
| useWhiteboardSuggestions | WJe | 65623 | Composer.tsx |  |
| wrapIndex | LV | 65636 | Composer.tsx |  |
| findNextEnabledIndex | RV | 65639 | Composer.tsx |  |
| clampToEnabledIndex | GJe | 65648 | Composer.tsx |  |
| MentionSelector | KJe | 65653 | Composer.tsx |  |
| resolveTaskProvider | zV | 66097 | Composer.tsx |  |
| useActiveTaskProvider | qJe | 66103 | Composer.tsx |  |
| appendPromptHistory | JJe | 66112 | Composer.tsx |  |
| navigatePromptHistory | YJe | 66118 | Composer.tsx |  |
| MOBILE_TEXT_INPUT_MEDIA_QUERY | BV | 66134 | Composer.tsx |  |
| matchesMediaQuery | XJe | 66135 | Composer.tsx |  |
| subscribeMediaQuery | ZJe | 66139 | Composer.tsx |  |
| isMobileTextInputViewportNow | QJe | 66149 | Composer.tsx |  |
| subscribeMobileTextInputViewport | $Je | 66152 | Composer.tsx |  |
| useIsMobileTextInputViewport | VV | 66155 | Composer.tsx |  |
| isEnterSubmitAllowed | eYe | 66159 | Composer.tsx |  |
| submitShortcutKey | tYe | 66162 | Composer.tsx |  |
| isMobileWebRemoteInput | nYe | 66165 | Composer.tsx |  |
| inputTextClass | HV | 66167 | Composer.tsx |  |
| CJK_COMMA | rYe | 66173 | Composer.tsx | `、` |
| SLASH_CHAR | iYe | 66174 | Composer.tsx | `/` |
| canSubmitText | aYe | 66175 | Composer.tsx |  |
| isSubmitAccepted | oYe | 66187 | Composer.tsx |  |
| isCjkCommaSlashInput | sYe | 66188 | Composer.tsx |  |
| readEditorText | UV | 66192 | Composer.tsx |  |
| setEditorText | WV | 66199 | Composer.tsx |  |
| setEditorMention | cYe | 66214 | Composer.tsx |  |
| applyEditorStateJson | GV | 66225 | Composer.tsx |  |
| clearEditor | KV | 66229 | Composer.tsx |  |
| setSkillMentionContent | lYe | 66232 | Composer.tsx |  |
| setSlashCommandMentionContent | uYe | 66248 | Composer.tsx |  |
| appendFileMentionContent | dYe | 66264 | Composer.tsx |  |
| appendTextContent | fYe | 66289 | Composer.tsx |  |
| findMentionIdAfterCaret | pYe | 66302 | Composer.tsx |  |
| mentionIdFromElement | qV | 66316 | Composer.tsx |  |
| focusAfterMention | mYe | 66321 | Composer.tsx |  |
| SubmitOnEnterPlugin | hYe | 66333 | Composer.tsx |  |
| EditorChangeLogger | gYe | 66411 | Composer.tsx |  |
| EditableSyncPlugin | _Ye | 66451 | Composer.tsx |  |
| E2ELexicalBridgePlugin | vYe | 66463 | Composer.tsx |  |
| PromptHistoryNavigationPlugin | yYe | 66507 | Composer.tsx |  |
| isCaretAtEditorStart | JV | 66575 | Composer.tsx |  |
| CjkCommaSlashPlugin | bYe | 66588 | Composer.tsx |  |
| PasteCapturePlugin | xYe | 66623 | Composer.tsx |  |
| EditorApiPlugin | SYe | 66639 | Composer.tsx |  |
| LEXICAL_CHAT_INPUT_THEME | CYe | 66666 | Composer.tsx |  |
| LexicalChatInput | wYe | 66668 | Composer.tsx |  |
| PassthroughErrorBoundary | TYe | 66808 | Composer.tsx |  |
| applyWorkspaceFileMentionDrop | YV | 66811 | Composer.tsx |  |
| hasExternalFiles | EYe | 66823 | Composer.tsx |  |
| useComposerFileDragDetection | XV | 66827 | Composer.tsx |  |
| buildActionMenuShortcuts | DYe | 66887 | Composer.tsx |  |
| onNextFrame | OYe | 66893 | Composer.tsx |  |
| appendTriggerText | kYe | 66899 | Composer.tsx |  |
| preventDefaultOnMouseDown | AYe | 66904 | Composer.tsx |  |
| ComposerActionMenu | jYe | 66907 | Composer.tsx |  |
| runOnNextFrame | MYe | 67000 | Composer.tsx |  |
| ComposerInput | ZV | 67007 | Composer.tsx |  |
| NANOID_ALPHABET | NYe | 67277 | Composer.tsx |  |
| nanoid | QV | 67278 | Composer.tsx |  |
| LARGE_PASTED_TEXT_THRESHOLD | PYe | 67282 | Composer.tsx | = 5KB |
| MAX_INLINE_IMAGE_BYTES | $V | 67283 | Composer.tsx | = 20MB |
| TEXT_ATTACHMENT_PREVIEW_LIMIT | eH | 67284 | Composer.tsx | = 64KB |
| OversizedInlineImageAttachmentError | FYe | 67285 | Composer.tsx |  |
| readFileAsDataUrl | IYe | 67299 | Composer.tsx |  |
| createFileAttachment | LYe | 67315 | Composer.tsx |  |
| createLocalPathAttachment | RYe | 67324 | Composer.tsx |  |
| createClipboardTextAttachment | zYe | 67328 | Composer.tsx |  |
| isLargePastedText | BYe | 67338 | Composer.tsx |  |
| SPREADSHEET_HTML_PATTERN | VYe | 67340 | Composer.tsx |  |
| prefersSpreadsheetText | HYe | 67342 | Composer.tsx |  |
| pastedTextFilename | UYe | 67346 | Composer.tsx |  |
| countLines | WYe | 67349 | Composer.tsx |  |
| revokeAttachmentObjectUrl | tH | 67371 | Composer.tsx |  |
| resolveAttachmentPayload | GYe | 67374 | Composer.tsx |  |
| readAttachmentBase64 | KYe | 67417 | Composer.tsx |  |
| isImageAttachment | nH | 67424 | Composer.tsx |  |
| isTextLikeAttachment | qYe | 67427 | Composer.tsx |  |
| readTextFilePreview | JYe | 67434 | Composer.tsx |  |
| guessMimeType | rH | 67439 | Composer.tsx |  |
| basenameOfPath | YYe | 67466 | Composer.tsx |  |
| formatPastedTextFilename | XYe | 67469 | Composer.tsx |  |
| resolveComposerPlaceholderKey | ZYe | 67473 | Composer.tsx |  |
| PROMPT_HISTORY_STORAGE_PREFIX | QYe | 67480 | Composer.tsx |  |
| safeLocalStorage | iH | 67481 | Composer.tsx |  |
| promptHistoryStorageKey | aH | 67489 | Composer.tsx |  |
| sanitizePromptHistory | oH | 67492 | Composer.tsx |  |
| loadPromptHistory | sH | 67499 | Composer.tsx |  |
| savePromptHistory | cH | 67509 | Composer.tsx |  |
| resolveFocusStrategy | lH | 67514 | Composer.tsx |  |
| DRAFT_STORAGE_PREFIX | $Ye | 67518 | Composer.tsx | `zcode-v4-composer-drafts:v1:` |
| DRAFT_SCOPE_ID | eXe | 67519 | Composer.tsx | `__draft__` |
| MAX_DRAFT_SCOPES | uH | 67520 | Composer.tsx | = 50 |
| safeDraftStorage | dH | 67521 | Composer.tsx |  |
| draftStorageKey | fH | 67527 | Composer.tsx |  |
| parseDraftStore | pH | 67532 | Composer.tsx |  |
| persistDraftStore | mH | 67542 | Composer.tsx |  |
| pruneDraftScopes | tXe | 67559 | Composer.tsx |  |
| readDraftScope | nXe | 67568 | Composer.tsx |  |
| writeDraftScope | hH | 67574 | Composer.tsx |  |
| deleteDraftScope | gH | 67581 | Composer.tsx |  |
| pendingDraftTransfer | _H | 67587 | Composer.tsx |  |
| draftScopeWorkspaceKey | vH | 67588 | Composer.tsx |  |
| setPendingDraftTransfer | rXe | 67591 | Composer.tsx |  |
| consumePendingDraftTransfer | iXe | 67593 | Composer.tsx |  |
| useComposerAttachmentStore | yH | 67602 | Composer.tsx |  |
| getScopeAttachments | bH | 67603 | Composer.tsx |  |
| updateScopeAttachments | aXe | 67606 | Composer.tsx |  |
| encodeBase64Utf8 | oXe | 67616 | Composer.tsx |  |
| estimateBase64Bytes | sXe | 67623 | Composer.tsx |  |
| putAttachmentContent | cXe | 67627 | Composer.tsx |  |
| EMPTY_ATTACHMENTS | lXe | 67646 | Composer.tsx |  |
| REMOTE_ATTACHMENT_NOT_STAGED | xH | 67647 | Composer.tsx |  |
| selectAttachmentPaths | uXe | 67648 | Composer.tsx |  |
| attachmentScopeKey | dXe | 67653 | Composer.tsx |  |
| isAbortError | SH | 67656 | Composer.tsx |  |
| RemoteAttachmentNotStagedError | fXe | 67663 | Composer.tsx |  |
| isTransientUploadError | pXe | 67666 | Composer.tsx |  |
| uploadProgressPercent | CH | 67673 | Composer.tsx |  |
| isRemoteAttachmentTarget | wH | 67676 | Composer.tsx |  |
| useComposerAttachments | mXe | 67679 | Composer.tsx |  |
| codeCommentKey | hXe | 68295 | Composer.tsx |  |
| CodeCommentsChip | TH | 68298 | Composer.tsx |  |
| CODE_COMMENT_ADD_EVENT | EH | 68411 | Composer.tsx |  |
| CODE_COMMENT_REMOVE_EVENT | DH | 68412 | Composer.tsx |  |
| CODE_COMMENT_REMOVE_CHANNEL | gXe | 68413 | Composer.tsx |  |
| suppressedCodeCommentIds | OH | 68414 | Composer.tsx |  |
| commentWorkspaceKey | kH | 68415 | Composer.tsx |  |
| codeCommentIdentityKey | AH | 68418 | Composer.tsx |  |
| isCodeCommentSuppressed | _Xe | 68421 | Composer.tsx |  |
| suppressCodeComment | jH | 68424 | Composer.tsx |  |
| unsuppressCodeComment | vXe | 68427 | Composer.tsx |  |
| isCodeCommentAddEvent | yXe | 68430 | Composer.tsx |  |
| isCodeCommentRemoveEvent | bXe | 68438 | Composer.tsx |  |
| isCodeCommentRemoveDetail | MH | 68446 | Composer.tsx |  |
| isCodeCommentAddDetail | NH | 68457 | Composer.tsx |  |
| formatCodeCommentMarkdown | xXe | 68475 | Composer.tsx |  |
| formatCodeCommentsMarkdown | SXe | 68479 | Composer.tsx |  |
| appendCodeCommentsToContent | CXe | 68486 | Composer.tsx |  |
| pathBasename | wXe | 68499 | Composer.tsx |  |
| parseLineRange | TXe | 68502 | Composer.tsx |  |
| parseCodeCommentMarkdown | EXe | 68510 | Composer.tsx |  |
| extractCodeCommentsFromContent | DXe | 68536 | Composer.tsx |  |
| dispatchCodeCommentAddEvent | OXe | 68551 | Composer.tsx |  |
| dispatchCodeCommentRemoveEvent | kXe | 68555 | Composer.tsx |  |
| EMPTY_COMMENTS | AXe | 68558 | Composer.tsx |  |
| commentBucketKey | PH | 68559 | Composer.tsx |  |
| useCodeCommentsStore | FH | 68562 | Composer.tsx |  |
| removeCodeCommentEverywhere | jXe | 68628 | Composer.tsx |  |
| WEB_ELEMENT_ADD_EVENT | IH | 68643 | Composer.tsx |  |
| WEB_ELEMENT_REMOVE_EVENT | LH | 68644 | Composer.tsx |  |
| WEB_ELEMENTS_MARKDOWN_HEADER | MXe | 68645 | Composer.tsx |  |
| WEB_ELEMENT_TEXT_LIMIT | RH | 68646 | Composer.tsx | = 8000 |
| createWebElementId | NXe | 68648 | Composer.tsx |  |
| webElementWorkspaceKey | zH | 68653 | Composer.tsx |  |
| isWebElementAddEvent | PXe | 68656 | Composer.tsx |  |
| isWebElementRemoveEvent | FXe | 68663 | Composer.tsx |  |
| isWebElementAddDetail | BH | 68670 | Composer.tsx |  |
| truncateWebElementText | VH | 68686 | Composer.tsx |  |
| pushWebElementField | HH | 68691 | Composer.tsx |  |
| formatWebElementAttributes | IXe | 68695 | Composer.tsx |  |
| formatWebElementFont | LXe | 68703 | Composer.tsx |  |
| formatWebElementMarkdown | RXe | 68707 | Composer.tsx |  |
| appendWebElementsToContent | zXe | 68737 | Composer.tsx |  |
| readWebElementField | UH | 68749 | Composer.tsx |  |
| readWebElementCodeField | WH | 68752 | Composer.tsx |  |
| parseWebElementFont | BXe | 68761 | Composer.tsx |  |
| parseWebElementStyle | VXe | 68766 | Composer.tsx |  |
| parseWebElementMarkdown | HXe | 68781 | Composer.tsx |  |
| extractWebElementsFromContent | UXe | 68805 | Composer.tsx |  |
| dispatchWebElementAddEvent | WXe | 68824 | Composer.tsx |  |
| countComposerContexts | GH | 68825 | Composer.tsx |  |
| buildComposerContextMarkdown | GXe | 68833 | Composer.tsx |  |
| parseComposerContextContent | KXe | 68839 | Composer.tsx |  |
| createCodeCommentId | qXe | 68852 | Composer.tsx |  |
| codeCommentContextKey | KH | 68857 | Composer.tsx |  |
| useCodeCommentContexts | JXe | 68860 | Composer.tsx |  |
| isWebElementRemoveDetail | YXe | 68926 | Composer.tsx |  |
| normalizeWebElementDetail | XXe | 68936 | Composer.tsx |  |
| useWebElementContexts | ZXe | 68940 | Composer.tsx |  |
| usePptxElementReferences | QXe | 68996 | Composer.tsx |  |
| pptxReferenceLabel | qH | 69033 | Composer.tsx |  |
| PptxReferencesChip | JH | 69036 | Composer.tsx |  |
| buildPptxPreviewNavigation | $Xe | 69181 | Composer.tsx |  |
| toPptxViewerTarget | eZe | 69194 | Composer.tsx |  |
| usePptxPreviewOpener | YH | 69207 | Composer.tsx |  |
| useSessionScopedReferences | tZe | 69225 | Composer.tsx |  |
| countBackgroundWorks | nZe | 69266 | Composer.tsx |  |
| BackgroundWorksCapsule | rZe | 69273 | Composer.tsx |  |
| BackgroundWorksCapsuleMemo | iZe | 69345 | Composer.tsx |  |
| isCoarseTouchDevice | XH | 69346 | Composer.tsx |  |
| shouldRestoreFocus | ZH | 69351 | Composer.tsx |  |
| LABEL_ANIMATION_TRANSITION | N4e | 75495 | Composer.tsx |  |
| usePrefersReducedMotion | P4e | 75496 | Composer.tsx |  |
| AnimatedLabel | _q | 75520 | Composer.tsx |  |
| EMPTY_FOOTER_ACTIONS | F4e | 75556 | Composer.tsx |  |
| hasMultipleGroups | I4e | 75557 | Composer.tsx |  |
| hasGroupDecoration | L4e | 75560 | Composer.tsx |  |
| needsGroupSeparator | R4e | 75565 | Composer.tsx |  |
| groupContainsValue | z4e | 75568 | Composer.tsx |  |
| resolveTriggerLabelClass | B4e | 75571 | Composer.tsx |  |
| ModelSelector | vq | 75575 | Composer.tsx |  |
| MODE_LABEL_I18N | V4e | 75972 | Composer.tsx |  |
| MODE_DESCRIPTION_I18N | H4e | 76002 | Composer.tsx |  |
| SegmentedProgress | yq | 76034 | Composer.tsx |  |
| 上下文环几何 10 | bq | 76066–76069 | Composer.tsx |  |
| 24 | U4e | 76066–76069 | Composer.tsx |  |
| 12 | xq | 76066–76069 | Composer.tsx |  |
| 4 | W4e | 76066–76069 | Composer.tsx |  |
| ContextUsageContext | G4e | 76071 | Composer.tsx |  |
| usageRatio | K4e | 76072 | Composer.tsx |  |
| useContextUsage | q4e | 76075 | Composer.tsx |  |
| ContextUsageProvider | J4e | 76079 | Composer.tsx |  |
| ContextRingGlyph | Y4e | 76089 | Composer.tsx |  |
| ContextRingTrigger | X4e | 76125 | Composer.tsx |  |
| ContextRingTooltipContent | Z4e | 76139 | Composer.tsx |  |
| ContextRingTooltipBody | Q4e | 76147 | Composer.tsx |  |
| isOptionValue | M3e | 76848 | Composer.tsx |  |
| DANGEROUS_MODE_VALUES | N3e | 76851 | Composer.tsx |  |
| configSelectTestId | P3e | 76852 | Composer.tsx |  |
| configOptionTestId | F3e | 76856 | Composer.tsx |  |
| ApiRetryIndicator | I3e | 76860 | Composer.tsx |  |
| modeOptionLabel | L3e | 76880 | Composer.tsx |  |
| modeLabelI18nId | R3e | 76883 | Composer.tsx |  |
| modeDescriptionI18nId | z3e | 76886 | Composer.tsx |  |
| configOptionLabel | jq | 76889 | Composer.tsx |  |
| configOptionDescription | B3e | 76892 | Composer.tsx |  |
| isDangerousModeValue | V3e | 76897 | Composer.tsx |  |
| modeOptionIcon | H3e | 76900 | Composer.tsx |  |
| ConfigSelect | Mq | 76911 | Composer.tsx |  |
| THOUGHT_LEVEL_DISABLED_VALUES | U3e | 77062 | Composer.tsx |  |
| THOUGHT_LEVEL_RANKS | W3e | 77063 | Composer.tsx |  |
| THOUGHT_LEVEL_LABEL_I18N | G3e | 77094 | Composer.tsx |  |
| normalizeThoughtLevelKey | Nq | 77127 | Composer.tsx |  |
| isDisabledThoughtOption | K3e | 77130 | Composer.tsx |  |
| thoughtOptionRank | q3e | 77133 | Composer.tsx |  |
| sortThoughtOptions | J3e | 77141 | Composer.tsx |  |
| nextThoughtLevelValue | Y3e | 77155 | Composer.tsx |  |
| thoughtOptionLabel | X3e | 77163 | Composer.tsx |  |

## 35. B5 · OnboardingLoginLeaves.tsx（F18 OnboardingLogin 族余量）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，现行 213,979 行）· B5-02。行号口径：当前 js 行（头注同时给出 jsx 孪生行）。
- 符号条数：139（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| LOGIN_FAILED_MESSAGE | c4t | 205995 | OnboardingLoginLeaves.tsx | 常量「登录失败，请重试」 |
| useOAuth | l4t | 205996 | OnboardingLoginLeaves.tsx | OAuth 流程钩子 |
| familyDomainToProviderId | M9 | 206077 | OnboardingLoginLeaves.tsx | zai/bigmodel → providerId |
| familyDomainLabel | u4t | 206080 | OnboardingLoginLeaves.tsx | Z.ai / BigModel |
| identityDomain | d4t | 206083 | OnboardingLoginLeaves.tsx | 恒等（保留调用面） |
| withFamilyMode | f4t | 206086 | OnboardingLoginLeaves.tsx | modelProviderFamilyModes 置 apiKey |
| familyDomainPatch | p4t | 206089 | OnboardingLoginLeaves.tsx | providerFamilyDomain 补丁 |
| apiKeyUrlForDomain | m4t | 206096 | OnboardingLoginLeaves.tsx | 注册表取 apiKeyUrl |
| shouldShowGetApiKeyLink | h4t | 206099 | OnboardingLoginLeaves.tsx |  |
| applyApiKeyToProvider | g4t | 206102 | OnboardingLoginLeaves.tsx |  |
| defaultModelKeyForProvider | _4t | 206105 | OnboardingLoginLeaves.tsx |  |
| findSavedApiKeyForDomain | v4t | 206109 | OnboardingLoginLeaves.tsx |  |
| savedApiKeyIfUntouched | y4t | 206113 | OnboardingLoginLeaves.tsx |  |
| ApiKeyLoginView | b4t | 206116 | OnboardingLoginLeaves.tsx | API key 登录视图（login.*） |
| LoginEntryScreen | w4t | 206410 | OnboardingLoginLeaves.tsx | 登录入口屏（hero 壳 + D4t） |
| attemptMatchesSuccessProvider | T4t | 206425 | OnboardingLoginLeaves.tsx |  |
| canAutoCompleteOAuth | E4t | 206428 | OnboardingLoginLeaves.tsx |  |
| OAuthLoginPanel | D4t | 206431 | OnboardingLoginLeaves.tsx | OAuth 登录面板（login.*） |
| LoginHeader | O4t | 206685 | OnboardingLoginLeaves.tsx |  |
| LoginLogoBadge | k4t | 206704 | OnboardingLoginLeaves.tsx | （REBRAND-011+111 aria-label） |
| oauthButtonLabelKey | A4t | 206712 | OnboardingLoginLeaves.tsx |  |
| oauthRegionTagKey | j4t | 206722 | OnboardingLoginLeaves.tsx |  |
| OAuthRegionTag | M4t | 206732 | OnboardingLoginLeaves.tsx |  |
| providerSortRank | N4t | 206742 | OnboardingLoginLeaves.tsx |  |
| sortLoginProviders | P4t | 206752 | OnboardingLoginLeaves.tsx |  |
| resolveRetryProviderId | F4t | 206755 | OnboardingLoginLeaves.tsx |  |
| shouldReportLaunchMarks | I4t | 206758 | OnboardingLoginLeaves.tsx |  |
| readRendererLaunchMarks | L4t | 206761 | OnboardingLoginLeaves.tsx | __ZCODE_*__ window 标记 |
| countTotalUnreadTasks | R4t | 206769 | OnboardingLoginLeaves.tsx |  |
| isResolvingStartupAuthState | z4t | 206782 | OnboardingLoginLeaves.tsx | ★OFFLINE-PATCH-001 直通 |
| isStartupRenderBlocked | B4t | 206787 | OnboardingLoginLeaves.tsx |  |
| isProviderAvailabilityGateEnabled | V4t | 206790 | OnboardingLoginLeaves.tsx |  |
| isProviderStartupSyncPending | H4t | 206793 | OnboardingLoginLeaves.tsx |  |
| needsFallbackWorkspaceBootstrap | U4t | 206798 | OnboardingLoginLeaves.tsx |  |
| isProviderStartupHydrationPending | W4t | 206801 | OnboardingLoginLeaves.tsx |  |
| SettingsLayer | J4t | 206998 | OnboardingLoginLeaves.tsx | 设置层（挂 j9） |
| MemoizedWorkspaceShell | Y4t | 207063 | OnboardingLoginLeaves.tsx | memo(XJt) |
| RootWorkspaceContent | X4t | 207064 | OnboardingLoginLeaves.tsx |  |
| trimmedOrUndefined | Z4t | 207205 | OnboardingLoginLeaves.tsx |  |
| resolveActiveWorkspaceShellProps | Q4t | 207208 | OnboardingLoginLeaves.tsx |  |
| workspaceKeyOfRestoreEntry | D3t | 208827 | OnboardingLoginLeaves.tsx |  |
| buildPersistedTabPatch | O3t | 208830 | OnboardingLoginLeaves.tsx |  |
| restoreCombinedWorkspaceSessions | k3t | 208839 | OnboardingLoginLeaves.tsx | ★MODULE-MAP「导入向导」为误标 |
| slugifyRemoteSeed | A3t | 208929 | OnboardingLoginLeaves.tsx |  |
| remoteTargetSeedName | j3t | 208932 | OnboardingLoginLeaves.tsx |  |
| remoteWorkspaceRuntimeLabelPrefix | M3t | 208947 | OnboardingLoginLeaves.tsx |  |
| matchReconnectingWorkspaceKeys | N3t | 208950 | OnboardingLoginLeaves.tsx |  |
| MAX_REMOTE_LOGS_PER_WORKSPACE | P3t | 208963 | OnboardingLoginLeaves.tsx | = 50 |
| useRemoteConnectionLogs | F3t | 208964 | OnboardingLoginLeaves.tsx |  |
| reconnectRemoteWorkspaceEntry | I3t | 209023 | OnboardingLoginLeaves.tsx |  |
| isActiveTaskRuntimeStatus | B9 | 209132 | OnboardingLoginLeaves.tsx |  |
| isTaskRuntimeActiveInState | L3t | 209135 | OnboardingLoginLeaves.tsx |  |
| collectActiveTaskIds | R3t | 209139 | OnboardingLoginLeaves.tsx |  |
| failActiveTasksForClosedTabs | z3t | 209149 | OnboardingLoginLeaves.tsx |  |
| identityFromReconnectEvent | B3t | 209161 | OnboardingLoginLeaves.tsx |  |
| shouldPersistClosedSessionFailure | V3t | 209164 | OnboardingLoginLeaves.tsx |  |
| reconnectRemoteWorkspaceByKey | H3t | 209169 | OnboardingLoginLeaves.tsx |  |
| resolveSshReconnectGroup | U3t | 209181 | OnboardingLoginLeaves.tsx |  |
| reconnectGroupWithSshReuse | W3t | 209189 | OnboardingLoginLeaves.tsx |  |
| isWorkspacePresentInTabs | G3t | 209247 | OnboardingLoginLeaves.tsx |  |
| cancelPendingReconnectRequests | K3t | 209258 | OnboardingLoginLeaves.tsx |  |
| openRemoteWorkspaceFromHistory | q3t | 209275 | OnboardingLoginLeaves.tsx |  |
| completeRemoteProjectSelection | J3t | 209333 | OnboardingLoginLeaves.tsx |  |
| useRemoteWorkspaceOrchestrator | Y3t | 209393 | OnboardingLoginLeaves.tsx |  |
| removedRemoteWorkspaceIdentities | X3t | 209851 | OnboardingLoginLeaves.tsx |  |
| useRemoteTabSessionDisposal | Z3t | 209865 | OnboardingLoginLeaves.tsx |  |
| useModelProviderSnapshotRefresher | Q3t | 209916 | OnboardingLoginLeaves.tsx |  |
| presetSelectedKey | e6t | 209943 | OnboardingLoginLeaves.tsx |  |
| codingPlanSelectedKey | V9 | 209946 | OnboardingLoginLeaves.tsx |  |
| teamPlanSelectedKey | t6t | 209949 | OnboardingLoginLeaves.tsx |  |
| firstSubscribedTeamPlanKey | n6t | 209956 | OnboardingLoginLeaves.tsx |  |
| isTeamPlanKeySubscribed | r6t | 209984 | OnboardingLoginLeaves.tsx |  |
| resolveOAuthFamilySelection | i6t | 210020 | OnboardingLoginLeaves.tsx |  |
| FAMILY_DEFAULT_SELECTED_KEYS | H9 | 210036 | OnboardingLoginLeaves.tsx |  |
| isFamilySelectionUsable | a6t | 210040 | OnboardingLoginLeaves.tsx |  |
| findUnusableFamilyDomains | o6t | 210048 | OnboardingLoginLeaves.tsx |  |
| migrateDefaultFamilySelectedKeys | s6t | 210060 | OnboardingLoginLeaves.tsx |  |
| fetchBigModelTeamProducts | c6t | 210078 | OnboardingLoginLeaves.tsx |  |
| maybeUpgradeBigModelTeamPlan | l6t | 210090 | OnboardingLoginLeaves.tsx |  |
| migrateFamilySelectionWithUpgrade | u6t | 210110 | OnboardingLoginLeaves.tsx |  |
| planProviderIdsForDomain | U9 | 210119 | OnboardingLoginLeaves.tsx |  |
| codingPlanProviderFromKey | d6t | 210126 | OnboardingLoginLeaves.tsx |  |
| fetchEntitlementSnapshot | W9 | 210134 | OnboardingLoginLeaves.tsx |  |
| fetchTeamProductListResult | f6t | 210147 | OnboardingLoginLeaves.tsx |  |
| fetchTeamProductListOrEmpty | p6t | 210160 | OnboardingLoginLeaves.tsx |  |
| isCompleteTeamPlanKey | m6t | 210164 | OnboardingLoginLeaves.tsx |  |
| refreshLatestFamilySelection | h6t | 210168 | OnboardingLoginLeaves.tsx |  |
| refreshFamilySelectionKeepTeamPlan | g6t | 210198 | OnboardingLoginLeaves.tsx |  |
| refreshProvidersAfterStartupRestore | _6t | 210239 | OnboardingLoginLeaves.tsx |  |
| applyRestoredOAuthSession | v6t | 210288 | OnboardingLoginLeaves.tsx |  |
| applyOAuthCallbackSuccess | y6t | 210295 | OnboardingLoginLeaves.tsx |  |
| useOAuthSessionBootstrap | b6t | 210359 | OnboardingLoginLeaves.tsx |  |
| useTitleBarThemeSync | x6t | 210452 | OnboardingLoginLeaves.tsx |  |
| buildWebRemoteControlWorkspaces | S6t | 210467 | OnboardingLoginLeaves.tsx |  |
| buildConnectedRemoteWorkspaces | C6t | 210497 | OnboardingLoginLeaves.tsx |  |
| passThroughFlag | w6t | 210510 | OnboardingLoginLeaves.tsx |  |
| useRootPlatformBridge | T6t | 210513 | OnboardingLoginLeaves.tsx |  |
| WSL_UNC_PATH_REGEX | E6t | 210684 | OnboardingLoginLeaves.tsx |  |
| parseWslUncPath | D6t | 210685 | OnboardingLoginLeaves.tsx |  |
| openWorkspaceFolderEntry | G9 | 210692 | OnboardingLoginLeaves.tsx |  |
| useConversationWorkspaceActions | O6t | 210717 | OnboardingLoginLeaves.tsx |  |
| paneWorkspaceScopePatch | k6t | 210753 | OnboardingLoginLeaves.tsx |  |
| resolveActiveWorkspaceScope | A6t | 210759 | OnboardingLoginLeaves.tsx |  |
| invalidUsageKeys | M6t | 211055 | OnboardingLoginLeaves.tsx | Set |
| usageSanityKey | N6t | 211056 | OnboardingLoginLeaves.tsx |  |
| recordInvalidUsage | P6t | 211060 | OnboardingLoginLeaves.tsx |  |
| isCompactSlashCommand | F6t | 211067 | OnboardingLoginLeaves.tsx |  |
| resolveIncomingUsage | I6t | 211073 | OnboardingLoginLeaves.tsx |  |
| isTaskBroadcastPayload | L6t | 211089 | OnboardingLoginLeaves.tsx |  |
| matchTaskBroadcast | R6t | 211133 | OnboardingLoginLeaves.tsx |  |
| runtimeStateOfBroadcastEvent | z6t | 211138 | OnboardingLoginLeaves.tsx |  |
| isStreamEventBody | B6t | 211158 | OnboardingLoginLeaves.tsx |  |
| isTaskStreamPayload | V6t | 211163 | OnboardingLoginLeaves.tsx |  |
| matchTaskStreamBroadcast | H6t | 211175 | OnboardingLoginLeaves.tsx |  |
| storeBroadcastConfigOptions | U6t | 211180 | OnboardingLoginLeaves.tsx |  |
| shouldBumpTaskListVersion | W6t | 211188 | OnboardingLoginLeaves.tsx |  |
| shouldApplyStreamBroadcast | G6t | 211195 | OnboardingLoginLeaves.tsx |  |
| useBotsTaskBroadcastBridge | K6t | 211198 | OnboardingLoginLeaves.tsx |  |
| createDiffsWorker | q6t | 211381 | OnboardingLoginLeaves.tsx |  |
| resolveDiffsPoolSize | J6t | 211387 | OnboardingLoginLeaves.tsx |  |
| DiffsPoolOptionsSync | Y6t | 211392 | OnboardingLoginLeaves.tsx |  |
| DiffsWorkerPoolProvider | X6t | 211414 | OnboardingLoginLeaves.tsx |  |
| canSyncWebRemoteTasks | Z6t | 211435 | OnboardingLoginLeaves.tsx |  |
| logDeferredWebRemoteSync | Q6t | 211438 | OnboardingLoginLeaves.tsx |  |
| RootStartupLoading | $6t | 211441 | OnboardingLoginLeaves.tsx | data-testid root-startup-loading |
| StartupLogoSvg | e8t | 211454 | OnboardingLoginLeaves.tsx | （REBRAND-013+113 + animate） |
| useProviderAvailabilityLoginGuard | t8t | 211481 | OnboardingLoginLeaves.tsx |  |
| inferFamilyDomainFromCache | n8t | 211532 | OnboardingLoginLeaves.tsx |  |
| migrateProviderFamilyDomain | r8t | 211540 | OnboardingLoginLeaves.tsx |  |
| TDP_SEED_DEFAULTS | K9 | 211564 | OnboardingLoginLeaves.tsx | （i8t 消费，语义属 F20） |
| tdpNamespacedId | q9 | 211570 | OnboardingLoginLeaves.tsx |  |
| buildTdpTurnOperations | J9 | 211573 | OnboardingLoginLeaves.tsx |  |
| defineTelemetryParityCase | Y9 | 211666 | OnboardingLoginLeaves.tsx |  |
| WelcomeGate | v8t | 213554 | OnboardingLoginLeaves.tsx | 更新窗 + 语言选择壳 |
| pluginInstallationKey | Q9 | 213619 | OnboardingLoginLeaves.tsx |  |
| PluginMarketplaceStoreCreation | — | 213621–213895 | OnboardingLoginLeaves.tsx | 无赋值 裸 Ae(...) 死创建 |
| TASK_NOTIFICATION_SOUND_URL | y8t | 213896 | OnboardingLoginLeaves.tsx |  |
| sharedNotificationAudio | $9 | 213897 | OnboardingLoginLeaves.tsx |  |
| getNotificationAudio | b8t | 213898 | OnboardingLoginLeaves.tsx |  |

## 36. B5 · AppRootLeaves.tsx（F20 Bootstrap/AppRoot 族余量）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，现行 213,979 行）· B5-02。行号口径：当前 js 行（头注同时给出 jsx 孪生行）。
- 符号条数：23（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| useWorkspaceActions | j6t | 210776 | AppRootLeaves.tsx |  |
| buildTelemetryParityCases | i8t | 211669 | AppRootLeaves.tsx | TDP01–19 |
| TELEMETRY_PARITY_CASES | a8t | 212448 | AppRootLeaves.tsx | Map(caseId → case) |
| [...a8t.keys()]; | — | 212449 | AppRootLeaves.tsx | 裸语句 逐字保留 |
| telemetryParityCaseById | o8t | 212450 | AppRootLeaves.tsx |  |
| quotaParityAssertions | s8t | 212455 | AppRootLeaves.tsx |  |
| captchaParityAssertions | c8t | 212490 | AppRootLeaves.tsx |  |
| assertParityState | X9 | 212520 | AppRootLeaves.tsx |  |
| exposeTelemetryParityE2E | l8t | 212523 | AppRootLeaves.tsx |  |
| runTelemetryParityCase | u8t | 212534 | AppRootLeaves.tsx |  |
| applyTelemetryParityOperation | d8t | 212580 | AppRootLeaves.tsx |  |
| runTelemetryParityWebNoop | f8t | 212775 | AppRootLeaves.tsx |  |
| pushUniqueParityAssertion | p8t | 212803 | AppRootLeaves.tsx |  |
| buildParityEventFact | Z9 | 212806 | AppRootLeaves.tsx |  |
| APP_ROOT_ICON_STROKE_WIDTH | m8t | 212817 | AppRootLeaves.tsx | = 1.5 |
| WebRemoteControlTaskSyncBridge | h8t | 212818 | AppRootLeaves.tsx |  |
| ZCodeApp | g8t | 212878 | AppRootLeaves.tsx |  |
| AppRootContent | _8t | 212905 | AppRootLeaves.tsx | ★OFFLINE-PATCH-002 |
| playStartupSound | x8t | 213901 | AppRootLeaves.tsx |  |
| ARMS_E2E_EVENT_LIMIT | S8t | 213909 | AppRootLeaves.tsx | = 200 |
| recordArmsCustomEventE2E | C8t | 213910 | AppRootLeaves.tsx |  |
| rendererInstanceId | w8t | 213921 | AppRootLeaves.tsx | 模块级 null |
| setRendererInstanceId | T8t | 213922 | AppRootLeaves.tsx |  |

## 37. B5 · FeedbackCenter.tsx（F09 反馈中心 RMe 族）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行）· B5-03。行号口径：当前 js 行（头注同时给出 jsx 孪生行）。
- 符号条数：109（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| TICKET_STATUS_STYLES | Bje | 37093 | FeedbackCenter.tsx |  |
| TICKET_STATUS_I18N_KEYS | Vje | 37104 | FeedbackCenter.tsx |  |
| formatTicketStatus | Hje | 37115 | FeedbackCenter.tsx |  |
| TicketStatusBadge | Uje | 37118 | FeedbackCenter.tsx |  |
| FeedbackErrorBanner | bC | 37129 | FeedbackCenter.tsx |  |
| persistFeedbackContact | TC | 37172 | FeedbackCenter.tsx |  |
| ScreenshotPicker | Gje | 37175 | FeedbackCenter.tsx |  |
| ScreenshotGridItem | Kje | 37294 | FeedbackCenter.tsx |  |
| readScreenshotFile | qje | 37320 | FeedbackCenter.tsx |  |
| screenshotDataUrl | EC | 37342 | FeedbackCenter.tsx |  |
| FeedbackSwitch | DC | 37345 | FeedbackCenter.tsx |  |
| UploadProgressRow | OC | 37360 | FeedbackCenter.tsx |  |
| DescriptionField | Jje | 37394 | FeedbackCenter.tsx |  |
| ContactField | Yje | 37411 | FeedbackCenter.tsx |  |
| LogsToggleRow | Xje | 37430 | FeedbackCenter.tsx |  |
| SubmitActionBar | Zje | 37465 | FeedbackCenter.tsx |  |
| FormSection | kC | 37530 | FeedbackCenter.tsx |  |
| FormFieldBody | AC | 37548 | FeedbackCenter.tsx |  |
| CharCount | Qje | 37559 | FeedbackCenter.tsx |  |
| SCROLL_FADE_CLASSES | $je | 37565 | FeedbackCenter.tsx |  |
| FadeScrollArea | jC | 37571 | FeedbackCenter.tsx |  |
| MODEL_OPTIONS_PREVIEW_LIMIT=12 | eMe | 37630 | FeedbackCenter.tsx |  |
| collectModelContext | tMe | 37631 | FeedbackCenter.tsx |  |
| extractErrorMessage | MC | 37651 | FeedbackCenter.tsx |  |
| DEFAULT_SUBMISSION_COPY | NC | 37656 | FeedbackCenter.tsx |  |
| submissionJobSeq | nMe | 37679 | FeedbackCenter.tsx |  |
| submissionJobsById | PC | 37680 | FeedbackCenter.tsx |  |
| submissionRegistryListeners | FC | 37681 | FeedbackCenter.tsx |  |
| snapshotSubmissionJobs | IC | 37682 | FeedbackCenter.tsx |  |
| notifySubmissionRegistry | LC | 37685 | FeedbackCenter.tsx |  |
| getSubmissionJobs | rMe | 37689 | FeedbackCenter.tsx |  |
| subscribeSubmissionJobs | iMe | 37692 | FeedbackCenter.tsx |  |
| dismissSubmissionJob | RC | 37703 | FeedbackCenter.tsx |  |
| getSubmissionJobById | aMe | 37706 | FeedbackCenter.tsx |  |
| cancelJobBeforeTicket | zC | 37709 | FeedbackCenter.tsx |  |
| createFeedbackSubmissionJob | oMe | 37723 | FeedbackCenter.tsx |  |
| freezeFormDraft | sMe | 37898 | FeedbackCenter.tsx |  |
| displaySubmissionError | cMe | 37902 | FeedbackCenter.tsx |  |
| FeedbackSubmissionCanceledError | BC | 37911 | FeedbackCenter.tsx |  |
| uploadFullLogWithResume | lMe | 37916 | FeedbackCenter.tsx |  |
| formatBytes | VC | 37992 | FeedbackCenter.tsx |  |
| mapUploadProgress | uMe | 37999 | FeedbackCenter.tsx |  |
| isUploadCanceledError | dMe | 38021 | FeedbackCenter.tsx |  |
| useSubmissionCopy | HC | 38024 | FeedbackCenter.tsx |  |
| TITLE_MAX_LENGTH=80 | fMe | 38052 | FeedbackCenter.tsx |  |
| TICKET_AGENT_NAME | pMe | 38053 | FeedbackCenter.tsx | ='Nofy Agent' REBRAND-014+114 |
| deriveTicketTitle | mMe | 38054 | FeedbackCenter.tsx |  |
| buildFeedbackDescription | hMe | 38064 | FeedbackCenter.tsx |  |
| DEVICE_AGENT_PROVIDER | gMe | 38089 | FeedbackCenter.tsx | ='Nofy Agent' REBRAND-015+115 |
| DEFAULT_SEVERITY | _Me | 38090 | FeedbackCenter.tsx | ='P2-中' |
| DEFAULT_MODULE | vMe | 38091 | FeedbackCenter.tsx | ='其它' |
| startFeedbackSubmission | UC | 38092 | FeedbackCenter.tsx |  |
| DESCRIPTION_MAX_LENGTH=4000 | yMe | 38162 | FeedbackCenter.tsx |  |
| CONTACT_MAX_LENGTH=200 | bMe | 38163 | FeedbackCenter.tsx |  |
| SCREENSHOT_MAX_COUNT=5 | WC | 38164 | FeedbackCenter.tsx |  |
| hasFeedbackAttachments | xMe | 38165 | FeedbackCenter.tsx |  |
| FeedbackSubmitForm | SMe | 38168 | FeedbackCenter.tsx |  |
| isTextEditingTarget | CMe | 38389 | FeedbackCenter.tsx |  |
| useFeedbackModelContext | wMe | 38394 | FeedbackCenter.tsx |  |
| FEATURE_FIELD_MAX=2000 | GC | 38400 | FeedbackCenter.tsx |  |
| FEATURE_CONTACT_MAX=200 | TMe | 38401 | FeedbackCenter.tsx |  |
| FeatureRequestDialog | EMe | 38402 | FeedbackCenter.tsx |  |
| FeatureRequestField | KC | 38637 | FeedbackCenter.tsx |  |
| buildFeatureRequestDescription | DMe | 38677 | FeedbackCenter.tsx |  |
| formatRelativeTime | qC | 38690 | FeedbackCenter.tsx |  |
| FeedbackTicketsView | OMe | 38717 | FeedbackCenter.tsx |  |
| TicketsLoadingPlaceholder | kMe | 38827 | FeedbackCenter.tsx |  |
| TicketList | AMe | 38837 | FeedbackCenter.tsx |  |
| TicketsEmptyState | jMe | 38924 | FeedbackCenter.tsx |  |
| SUCCESS_CARD_TTL_MS=5000 | MMe | 38952 | FeedbackCenter.tsx |  |
| isJobSettledWithTicket | NMe | 38953 | FeedbackCenter.tsx |  |
| jobOpenTarget | PMe | 38956 | FeedbackCenter.tsx |  |
| FeedbackBackgroundJobHost | FMe | 38961 | FeedbackCenter.tsx |  |
| BackgroundJobCard | IMe | 38980 | FeedbackCenter.tsx |  |
| BackgroundJobIndicator | LMe | 39014 | FeedbackCenter.tsx |  |
| FeedbackCenter | RMe | 39155 | FeedbackCenter.tsx | （memo 根） |
| resolveAdjacentTasks | zMe | 39254 | FeedbackCenter.tsx |  |
| collectWorkspaceTaskIds | BMe | 39268 | FeedbackCenter.tsx |  |
| runWithWorkspaceVisibility | JMe | 39455 | FeedbackCenter.tsx |  |
| APP_LOGO_DATA_URL | uw | 39459 | FeedbackCenter.tsx | REBRAND-003+103 |
| ATTACHMENT_CHUNK_BYTES=384KB | dw | 39460 | FeedbackCenter.tsx |  |
| throwIfUploadAborted | fw | 39461 | FeedbackCenter.tsx |  |
| base64ToBytes | YMe | 39466 | FeedbackCenter.tsx |  |
| base64ByteLength | XMe | 39472 | FeedbackCenter.tsx |  |
| bytesToBase64 | ZMe | 39492 | FeedbackCenter.tsx |  |
| sha256Checksum | QMe | 39498 | FeedbackCenter.tsx |  |
| newUploadId | $Me | 39503 | FeedbackCenter.tsx |  |
| measureAttachmentFrameBytes | eNe | 39508 | FeedbackCenter.tsx |  |
| assertFrameWithinLimit | pw | 39512 | FeedbackCenter.tsx |  |
| uploadAttachmentChunkedV4 | tNe | 39515 | FeedbackCenter.tsx |  |
| createConversationTransport | mw | 39582 | FeedbackCenter.tsx |  |
| INITIAL_SNAPSHOT_STORE_STATE | nNe | 39781 | FeedbackCenter.tsx |  |
| TERMINAL_COMMAND_STATUSES | rNe | 39793 | FeedbackCenter.tsx |  |
| frameBumpsPlanDirectory | iNe | 39794 | FeedbackCenter.tsx |  |
| frameBumpsTurnNavigator | aNe | 39804 | FeedbackCenter.tsx |  |
| hasOlderRows | hw | 39814 | FeedbackCenter.tsx |  |
| isFirstTurnHeaderMissing | oNe | 39819 | FeedbackCenter.tsx |  |
| prependOlderRows | gw | 39824 | FeedbackCenter.tsx |  |
| ConversationSnapshotStore | sNe | 39829 | FeedbackCenter.tsx |  |
| KEEP_WARM_MS_DEFAULT=30000 | cNe | 40329 | FeedbackCenter.tsx |  |
| KEEP_WARM_MS_E2E=1000 | lNe | 40330 | FeedbackCenter.tsx |  |
| resolveKeepWarmMs | uNe | 40331 | FeedbackCenter.tsx |  |
| ConversationDataLayer | _w | 40334 | FeedbackCenter.tsx |  |
| dataLayerEntriesByKey | vw | 40390 | FeedbackCenter.tsx |  |
| DATA_LAYER_KEEP_WARM_MS=30000 | dNe | 40391 | FeedbackCenter.tsx |  |
| dataLayerKey | fNe | 40392 | FeedbackCenter.tsx |  |
| disposeDataLayerEntry | yw | 40396 | FeedbackCenter.tsx |  |
| releaseDataLayerEntry | pNe | 40400 | FeedbackCenter.tsx |  |
| acquireConversationDataLayer | mNe | 40411 | FeedbackCenter.tsx |  |

## 38. B5 · PaymentDeep.tsx（F12 支付深部第二符号组）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行本机口径）· B5-04。行号口径：本机当前 js 行（主口径）。
- 符号条数：482（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| closeThenRun | y3e | 76612 | PaymentDeep.tsx | 先关弹层再执行动作 |
| USAGE_CHART_COLORS | Aq | 76615 | PaymentDeep.tsx | 5 段用量图色 |
| PERCENT_SCALE=100 | b3e | 76621 | PaymentDeep.tsx | / x3e → CACHE_HIT_DISPLAY_THRESHOLD=0.78 |
| formatCompactNumberLocale | S3e | 76623 | PaymentDeep.tsx | ja 包装 |
| formatUsedOfTotal | C3e | 76626 | PaymentDeep.tsx | `used/total (pct)` |
| formatPercentOrNull | w3e | 76630 | PaymentDeep.tsx | 阈值下隐 |
| segmentStyleOfIndex | T3e | 76637 | PaymentDeep.tsx | Aq 取色 |
| CONTEXT_BREAKDOWN_LABEL_KEYS | E3e | 76640 | PaymentDeep.tsx | 7 源 i18n 键 |
| CONTEXT_BREAKDOWN_ORDER | D3e | 76648 | PaymentDeep.tsx | 7 源序 |
| aggregateContextBreakdown | O3e | 76656 | PaymentDeep.tsx | chars 聚合+排序 |
| toBreakdownSegments | k3e | 76667 | PaymentDeep.tsx | → id/percent/style |
| validTaskUsageOrNull | A3e | 76670 | PaymentDeep.tsx | used/size 正数守卫 |
| ContextUsagePopover | j3e | 76678 | PaymentDeep.tsx | 弹层根 |
| isOptionValuePresent | M3e | 76844 | PaymentDeep.tsx |  |
| FULL_ACCESS_MODES | N3e | 76847 | PaymentDeep.tsx |  |
| categoryTestidOf | P3e | 76848 | PaymentDeep.tsx |  |
| optionTestidOf | F3e | 76852 | PaymentDeep.tsx |  |
| ApiRetryStatusChip | I3e | 76856 | PaymentDeep.tsx |  |
| modeOptionLabelOf | L3e | 76874 | PaymentDeep.tsx |  |
| modeLabelKeyOf | R3e | 76877 | PaymentDeep.tsx |  |
| modeDescriptionKeyOf | z3e | 76880 | PaymentDeep.tsx |  |
| optionLabelOf | jq | 76883 | PaymentDeep.tsx |  |
| optionDescriptionOf | B3e | 76886 | PaymentDeep.tsx |  |
| isFullAccessMode | V3e | 76892 | PaymentDeep.tsx |  |
| modeIconOf | H3e | 76895 | PaymentDeep.tsx |  |
| ConfigSelect | Mq | 76912 | PaymentDeep.tsx | 工具条 select 触发器 |
| normalizeOptionKey | Nq | 77127 | PaymentDeep.tsx |  |
| isThoughtOffOption | K3e | 77130 | PaymentDeep.tsx |  |
| thoughtRankOf | q3e | 77133 | PaymentDeep.tsx |  |
| sortThoughtOptions | J3e | 77141 | PaymentDeep.tsx |  |
| nextThoughtLevelValue | Y3e | 77153 | PaymentDeep.tsx |  |
| thoughtOptionLabelOf | X3e | 77160 | PaymentDeep.tsx |  |
| ThoughtLevelControl | Pq | 77164 | PaymentDeep.tsx | 三态触发器 |
| shortcutKeyOfCategory | Fq | 77337 | PaymentDeep.tsx |  |
| nextSelectValue | Z3e |  | PaymentDeep.tsx |  |
| resolveToolbarShortcut | Q3e |  | PaymentDeep.tsx |  |
| useToolbarShortcuts | $3e |  | PaymentDeep.tsx | (Ctrl+M 族) |
| PROVIDER_FAMILY_ORDER | e6e | 77452 | PaymentDeep.tsx |  |
| providerFamilyRankOf | t6e |  | PaymentDeep.tsx |  |
| sortProvidersByFamilyAndOrder | Iq |  | PaymentDeep.tsx |  |
| teamOrganizationLabelOf | Lq |  | PaymentDeep.tsx |  |
| providerDisplayLabelsOf | n6e |  | PaymentDeep.tsx |  |
| alwaysFalse | r6e |  | PaymentDeep.tsx |  |
| agentModelFormatsOf | i6e |  | PaymentDeep.tsx |  |
| isModelEntryWithModified | a6e |  | PaymentDeep.tsx |  |
| modelsForAgent | Rq |  | PaymentDeep.tsx |  |
| hasProviderCredentials | o6e |  | PaymentDeep.tsx |  |
| providerSupportsFormat | s6e |  | PaymentDeep.tsx |  |
| providerSupportsAnyFormat | zq |  | PaymentDeep.tsx |  |
| providerUsableForAgent | Bq |  | PaymentDeep.tsx |  |
| isPresetDirectProvider | c6e |  | PaymentDeep.tsx |  |
| modelItemsOfProvider | l6e |  | PaymentDeep.tsx |  |
| providerGroupOf | u6e |  | PaymentDeep.tsx |  |
| preset | d6e |  | PaymentDeep.tsx | 选项键 |
| codingPlan | f6e |  | PaymentDeep.tsx | 选项键 |
| teamPlanOptionKey | Vq |  | PaymentDeep.tsx |  |
| teamPlanOptionsOf | p6e |  | PaymentDeep.tsx |  |
| isTeamPlanKeyAllUnavailable | m6e |  | PaymentDeep.tsx |  |
| savedBigmodelTeamPlanKeyOf | h6e |  | PaymentDeep.tsx |  |
| isBigmodelTeamPlanSelected | g6e |  | PaymentDeep.tsx |  |
| resolveFamilyDefaultOption | _6e |  | PaymentDeep.tsx |  |
| familyGroupOf | v6e |  | PaymentDeep.tsx |  |
| familyOptionBadgeOf | y6e |  | PaymentDeep.tsx |  |
| teamPlanOptionKeysMatch | b6e |  | PaymentDeep.tsx |  |
| inactiveOAuthFamilyOf | x6e |  | PaymentDeep.tsx |  |
| modelMenuGroupsForAgent | S6e |  | PaymentDeep.tsx |  |
| glmMenuGroupsOf | C6e |  | PaymentDeep.tsx |  |
| modelMenuGroupsOf | Hq |  | PaymentDeep.tsx |  |
| modelNameOfValue | w6e |  | PaymentDeep.tsx |  |
| isModelSelectorEnabled | T6e |  | PaymentDeep.tsx |  |
| isSyntheticModel | E6e |  | PaymentDeep.tsx |  |
| shortModelNameOf | D6e |  | PaymentDeep.tsx |  |
| groupsContainValue | O6e |  | PaymentDeep.tsx |  |
| resolveModelSelectState | k6e |  | PaymentDeep.tsx |  |
| hasActiveEntitlementAlias | A6e |  | PaymentDeep.tsx |  |
| isProviderEntitlementVisible | j6e |  | PaymentDeep.tsx |  |
| isStartPlanVisible | M6e |  | PaymentDeep.tsx |  |
| filterUsableProviders | N6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | P6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | F6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | I6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | L6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | R6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | z6e |  | PaymentDeep.tsx |  |
| 供应商指纹族 | B6e |  | PaymentDeep.tsx |  |
| ghost | Uq |  | PaymentDeep.tsx | 模型解析 |
| ghost | V6e |  | PaymentDeep.tsx | 模型解析 |
| 任务供应商解析 | H6e |  | PaymentDeep.tsx |  |
| 任务供应商解析 | U6e |  | PaymentDeep.tsx |  |
| 任务供应商解析 | W6e |  | PaymentDeep.tsx |  |
| 任务供应商解析 | G6e |  | PaymentDeep.tsx |  |
| 代理前缀模型 | K6e |  | PaymentDeep.tsx |  |
| 代理前缀模型 | q6e |  | PaymentDeep.tsx |  |
| canonicalModelNameOf | J6e |  | PaymentDeep.tsx |  |
| claude | Y6e |  | PaymentDeep.tsx | 别名 |
| claude | X6e |  | PaymentDeep.tsx | 别名 |
| 选项调和 | Z6e |  | PaymentDeep.tsx |  |
| 选项调和 | Q6e |  | PaymentDeep.tsx |  |
| 选项调和 | $6e |  | PaymentDeep.tsx |  |
| agent | e8e |  | PaymentDeep.tsx | 同步 |
| agent | t8e |  | PaymentDeep.tsx | 同步 |
| 展示序模块态 | n8e |  | PaymentDeep.tsx |  |
| 展示序模块态 | Wq |  | PaymentDeep.tsx |  |
| 展示序模块态 | r8e |  | PaymentDeep.tsx |  |
| 展示序模块态 | Gq |  | PaymentDeep.tsx |  |
| 展示序模块态 | Kq |  | PaymentDeep.tsx |  |
| 展示序模块态 | i8e |  | PaymentDeep.tsx |  |
| 保存与目标收集 | a8e |  | PaymentDeep.tsx |  |
| 保存与目标收集 | o8e |  | PaymentDeep.tsx |  |
| 保存与目标收集 | s8e |  | PaymentDeep.tsx |  |
| useModelProviders | qq | — / 69033 | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | c8e |  | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | l8e |  | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | u8e |  | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | d8e |  | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | f8e |  | PaymentDeep.tsx |  |
| 任务驱动刷新与配置选项钩 | Jq |  | PaymentDeep.tsx |  |
| CACHE_HIT_DISPLAY_THRESHOLD | x3e | 76622 | PaymentDeep.tsx |  |
| ALIPAY_LOGO_SRC | L8e |  | PaymentDeep.tsx |  |
| normalizeDescriptionItems | $q |  | PaymentDeep.tsx |  |
| CURRENCY_LABELS | R8e |  | PaymentDeep.tsx |  |
| PERIOD_LABEL_KEYS | eJ |  | PaymentDeep.tsx |  |
| productTitleOf | tJ |  | PaymentDeep.tsx |  |
| productBulletLinesOf | z8e |  | PaymentDeep.tsx |  |
| primaryAmountOf | nJ |  | PaymentDeep.tsx |  |
| normalizeCurrency | rJ |  | PaymentDeep.tsx |  |
| formatMoney | iJ |  | PaymentDeep.tsx |  |
| periodOfProduct | aJ |  | PaymentDeep.tsx |  |
| AmountSummaryCard | oJ |  | PaymentDeep.tsx |  |
| AmountRow | sJ |  | PaymentDeep.tsx |  |
| adjustmentSummaryLabelOf | B8e |  | PaymentDeep.tsx |  |
| formatNegatedTotal | V8e |  | PaymentDeep.tsx |  |
| buildAmountSummary | cJ |  | PaymentDeep.tsx |  |
| resolvePayAmount | H8e |  | PaymentDeep.tsx |  |
| pickRenewAmount | U8e |  | PaymentDeep.tsx |  |
| sumCampaignDiscounts | W8e |  | PaymentDeep.tsx |  |
| campaignDiscountRowsOf | G8e |  | PaymentDeep.tsx |  |
| currentPlanCreditRowOf | K8e |  | PaymentDeep.tsx |  |
| firstPositive | q8e |  | PaymentDeep.tsx |  |
| firstNonNegative | J8e |  | PaymentDeep.tsx |  |
| residualCreditOf | Y8e |  | PaymentDeep.tsx |  |
| PLAN_OVERVIEW | X8e |  | PaymentDeep.tsx |  |
| SERVICE_AGREEMENT | Z8e |  | PaymentDeep.tsx |  |
| SUBSCRIPTION_AGREEMENT_URL | Q8e |  | PaymentDeep.tsx |  |
| CodingPlanPaymentQrHost | $8e |  | PaymentDeep.tsx |  |
| CodingPlanPaymentQrDialog | e5e | 80027 | PaymentDeep.tsx |  |
| paymentDialogTitleOf | t5e |  | PaymentDeep.tsx |  |
| PolicyLink | lJ |  | PaymentDeep.tsx |  |
| currencyOfProduct | n5e |  | PaymentDeep.tsx |  |
| BADGE_VARIANTS | r5e |  | PaymentDeep.tsx |  |
| Badge | uJ |  | PaymentDeep.tsx |  |
| OAUTH_REQUIRED_ERROR | i5e |  | PaymentDeep.tsx |  |
| ZAI_START_FREE 文案 | dJ |  | PaymentDeep.tsx |  |
| ZAI_START_FREE 文案 | fJ |  | PaymentDeep.tsx |  |
| TTL + 模块映射 | a5e |  | PaymentDeep.tsx |  |
| TTL + 模块映射 | o5e |  | PaymentDeep.tsx |  |
| useCodingPlanProducts | s5e | 80369 | PaymentDeep.tsx |  |
| 预览快照机制 | c5e |  | PaymentDeep.tsx |  |
| 预览快照机制 | l5e |  | PaymentDeep.tsx |  |
| 预览快照机制 | d5e |  | PaymentDeep.tsx |  |
| 预览快照机制 | f5e |  | PaymentDeep.tsx |  |
| 预览快照机制 | p5e |  | PaymentDeep.tsx |  |
| 预览快照机制 | m5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | h5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | g5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | vJ |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | yJ |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | _5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | v5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | bJ |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | y5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | b5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | xJ |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | SJ |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | x5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | S5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | C5e |  | PaymentDeep.tsx |  |
| Start-Free 与错误归一 | w5e |  | PaymentDeep.tsx |  |
| InfoNoticeCard | CJ |  | PaymentDeep.tsx |  |
| productErrorMessageOf | wJ | 80672 | PaymentDeep.tsx |  |
| TERMINAL_ORDER_STATES | T5e |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | DJ |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | OJ |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | kJ |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | AJ |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | jJ |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | z5e |  | PaymentDeep.tsx |  |
| 企业目录/估算/折扣/订单判定 | B5e |  | PaymentDeep.tsx |  |
| 卡品牌/资产图（含 AMEX/VISA 等） | $J…z7e |  | PaymentDeep.tsx |  |
| ZAI_*_URL | B7e…U7e |  | PaymentDeep.tsx |  |
| STRIPE_LIVE_PUBLISHABLE_KEY | W7e |  | PaymentDeep.tsx |  |
| CARD_BRAND_IMAGES | G7e |  | PaymentDeep.tsx |  |
| COUNTRY_OPTIONS | K7e |  | PaymentDeep.tsx |  |
| stripeElementAppearanceOf | q7e |  | PaymentDeep.tsx |  |
| StripeCardDialogEntry | J7e | 81798 | PaymentDeep.tsx |  |
| StripeCardDialog | Y7e | 81807 | PaymentDeep.tsx |  |
| PaymentMethodOptionRow | X7e |  | PaymentDeep.tsx |  |
| CardBrandLabel | Z7e |  | PaymentDeep.tsx |  |
| CardBrandImage | eY |  | PaymentDeep.tsx |  |
| cardBrandImageOf | Q7e |  | PaymentDeep.tsx |  |
| StripeCardManageDialog | $7e |  | PaymentDeep.tsx |  |
| SavedCardRow | e9e |  | PaymentDeep.tsx |  |
| AddStripeCardForm | t9e |  | PaymentDeep.tsx |  |
| FieldLabel | tY |  | PaymentDeep.tsx |  |
| BillingTextInput | nY |  | PaymentDeep.tsx |  |
| CountrySelect | n9e |  | PaymentDeep.tsx |  |
| CardBrandRow | r9e |  | PaymentDeep.tsx |  |
| OverseasPolicyLink | rY |  | PaymentDeep.tsx |  |
| rawPeriodOfProduct | i9e |  | PaymentDeep.tsx |  |
| stripePublishableKeyOf | a9e |  | PaymentDeep.tsx |  |
| purchaseAttemptIdOf | o9e |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | iY |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | s9e |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | c9e |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | l9e |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | u9e |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | aY |  | PaymentDeep.tsx |  |
| 漏斗快照/埋点 | oY |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | D9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | O9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | k9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | A9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | j9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | M9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | N9e |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | gY |  | PaymentDeep.tsx |  |
| TCaptcha 验证码块（appId 196026326） | P9e |  | PaymentDeep.tsx |  |
| 漏斗常量 | F9e…V9e |  | PaymentDeep.tsx |  |
| useCodingPlanPurchase | H9e | 83232 | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | U9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | bY |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | W9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | G9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | K9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | q9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | J9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | xY |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | Y9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | X9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | SY |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | Z9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | CY |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | Q9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | $9e |  | PaymentDeep.tsx |  |
| PayPal/回调/轮询 | eet |  | PaymentDeep.tsx |  |
| START_PLAN_PREVIEW_TTL_MS | get |  | PaymentDeep.tsx |  |
| useStartPlanPreview | MY | 84302 | PaymentDeep.tsx |  |
| 预览回退/登录竞态 | _et |  | PaymentDeep.tsx |  |
| 预览回退/登录竞态 | vet |  | PaymentDeep.tsx |  |
| 预览回退/登录竞态 | yet |  | PaymentDeep.tsx |  |
| 结账/政策 URL 表 | bet…jet |  | PaymentDeep.tsx |  |
| SEAT_COUNT_OPTIONS | Met |  | PaymentDeep.tsx |  |
| PERSONAL_PLAN_BUTTON_TESTID | Net |  | PaymentDeep.tsx |  |
| DEFAULT_ZH_LOCALE | Pet |  | PaymentDeep.tsx |  |
| ZH_CHECKOUT_POLICY_COPY | NY |  | PaymentDeep.tsx |  |
| 待支付恢复判定 | Fet |  | PaymentDeep.tsx |  |
| 待支付恢复判定 | PY |  | PaymentDeep.tsx |  |
| 待支付恢复判定 | Let |  | PaymentDeep.tsx |  |
| 待支付恢复判定 | Ret |  | PaymentDeep.tsx |  |
| CodingPlanPurchasePanel | zet | 84460 | PaymentDeep.tsx |  |
| PendingOrderDialog | Bet |  | PaymentDeep.tsx |  |
| PlanSelectSections | Vet |  | PaymentDeep.tsx |  |
| planSectionsClassName | Het |  | PaymentDeep.tsx |  |
| planGridClassName | Uet |  | PaymentDeep.tsx |  |
| TeamPlanCard | Wet |  | PaymentDeep.tsx |  |
| StartPlanCard | Get |  | PaymentDeep.tsx |  |
| PersonalPlanCard | Ket |  | PaymentDeep.tsx |  |
| UnavailableProductButton | qet |  | PaymentDeep.tsx |  |
| FromPriceLabel | Jet |  | PaymentDeep.tsx |  |
| BillingCycleSelectPersonal | Yet |  | PaymentDeep.tsx |  |
| BillingCycleOptionRow | Xet |  | PaymentDeep.tsx |  |
| EnterpriseCheckoutPanel | Zet | 85996 | PaymentDeep.tsx |  |
| CheckoutSection | FY |  | PaymentDeep.tsx |  |
| scrollableAncestorOf | Qet |  | PaymentDeep.tsx |  |
| SeatsRow | $et |  | PaymentDeep.tsx |  |
| DurationSelect | ett |  | PaymentDeep.tsx |  |
| SeatCountInput | ttt |  | PaymentDeep.tsx |  |
| PurchaseOptionCard | ntt |  | PaymentDeep.tsx |  |
| DurationDiscountBadge | IY |  | PaymentDeep.tsx |  |
| BalanceSection | rtt |  | PaymentDeep.tsx |  |
| BalanceCheckboxRow | itt |  | PaymentDeep.tsx |  |
| EstimateSummaryBar | att |  | PaymentDeep.tsx |  |
| EstimatePriceLabel | ott |  | PaymentDeep.tsx |  |
| teamTierLabelOf | LY |  | PaymentDeep.tsx |  |
| seatMonthlyPriceOf | stt |  | PaymentDeep.tsx |  |
| yearlyDiscountBadgeOf | ctt |  | PaymentDeep.tsx |  |
| PriceWithUnit | ltt |  | PaymentDeep.tsx |  |
| priceUnitPartsOf | utt |  | PaymentDeep.tsx |  |
| PersonalPaymentConfirm | dtt |  | PaymentDeep.tsx |  |
| EnterprisePaymentConfirm | ftt |  | PaymentDeep.tsx |  |
| EnterpriseEstimateSummary | ptt |  | PaymentDeep.tsx |  |
| SummaryRow | RY |  | PaymentDeep.tsx |  |
| StrongAmount | mtt |  | PaymentDeep.tsx |  |
| PersonalPolicyBlock | htt |  | PaymentDeep.tsx |  |
| AccountPolicyCollapsible | gtt |  | PaymentDeep.tsx |  |
| yenNormalizeOf | _tt |  | PaymentDeep.tsx |  |
| periodEveryLabelOf | vtt |  | PaymentDeep.tsx |  |
| periodSlashLabelOf | ytt |  | PaymentDeep.tsx |  |
| OverseasPolicyBlock | btt |  | PaymentDeep.tsx |  |
| PolicyLayout | xtt |  | PaymentDeep.tsx |  |
| AccountPolicyNote | Stt |  | PaymentDeep.tsx |  |
| TermsCheckbox | zY |  | PaymentDeep.tsx |  |
| PolicyInlineLink | BY |  | PaymentDeep.tsx |  |
| rawPeriodUnitOf | Ctt |  | PaymentDeep.tsx |  |
| personalServicePeriodOf | wtt |  | PaymentDeep.tsx |  |
| enterpriseServicePeriodOf | Ttt |  | PaymentDeep.tsx |  |
| orderDurationOf | Ett |  | PaymentDeep.tsx |  |
| periodMessageOf | Dtt |  | PaymentDeep.tsx |  |
| PaymentStage | Ott |  | PaymentDeep.tsx |  |
| PurchaseSuccessView | ktt |  | PaymentDeep.tsx |  |
| SuccessSummaryRow | VY |  | PaymentDeep.tsx |  |
| enterpriseSummaryLineOf | Att |  | PaymentDeep.tsx |  |
| zhPricePartsOf | jtt |  | PaymentDeep.tsx |  |
| enterprisePayTextOf | Mtt |  | PaymentDeep.tsx |  |
| discountSummaryOf | Ntt |  | PaymentDeep.tsx |  |
| roundEnterpriseAmount | Ptt |  | PaymentDeep.tsx |  |
| formatEnterpriseAmount | Ftt |  | PaymentDeep.tsx |  |
| teamPlanGroupsOf | HY |  | PaymentDeep.tsx |  |
| teamPlanGroupsOfDefaultLocale | Itt |  | PaymentDeep.tsx |  |
| mergePublicAndAuthenticatedProducts | Ltt |  | PaymentDeep.tsx |  |
| teamGroupActionStateOf | Rtt |  | PaymentDeep.tsx |  |
| purchaseOptionsOf | UY |  | PaymentDeep.tsx |  |
| isOptionEligible | ztt |  | PaymentDeep.tsx |  |
| isProductPurchasable | WY |  | PaymentDeep.tsx |  |
| isOneTimeMonthly | Btt |  | PaymentDeep.tsx |  |
| isPromoDisabled | Vtt |  | PaymentDeep.tsx |  |
| isBalanceUsable | GY |  | PaymentDeep.tsx |  |
| hasAnyBalance | Htt |  | PaymentDeep.tsx |  |
| cheapestMonthlyProductOf | Utt |  | PaymentDeep.tsx |  |
| resolveEnterpriseSelection | Wtt |  | PaymentDeep.tsx |  |
| teamProductOfId | Gtt |  | PaymentDeep.tsx |  |
| purchaseOptionKeyOf | KY |  | PaymentDeep.tsx |  |
| purchaseOptionRankOf | qY |  | PaymentDeep.tsx |  |
| tierLabelOf | Ktt |  | PaymentDeep.tsx |  |
| tierMessageKeyOf | qtt |  | PaymentDeep.tsx |  |
| normalizeTierFormatArg | Jtt |  | PaymentDeep.tsx |  |
| tierMessageFormatterOf | JY |  | PaymentDeep.tsx |  |
| teamGroupRankOf | Ytt |  | PaymentDeep.tsx |  |
| durationUnitLabelOf | Xtt |  | PaymentDeep.tsx |  |
| normalizedDurationOf | Ztt |  | PaymentDeep.tsx |  |
| durationOptionsOf | Qtt |  | PaymentDeep.tsx |  |
| durationOptionLabelOf | $tt |  | PaymentDeep.tsx |  |
| durationDiscountLabelOf | ent |  | PaymentDeep.tsx |  |
| clampInt | tnt |  | PaymentDeep.tsx |  |
| parseIntOrNull | nnt |  | PaymentDeep.tsx |  |
| commitSeatDraft | rnt |  | PaymentDeep.tsx |  |
| personalActionStateOf | int |  | PaymentDeep.tsx |  |
| isActionSelectable | ant |  | PaymentDeep.tsx |  |
| billingCycleActionLabelOf | ont |  | PaymentDeep.tsx |  |
| personalPlanActionStateOf | snt |  | PaymentDeep.tsx |  |
| startPlanCurrentStateOf | cnt |  | PaymentDeep.tsx |  |
| startPlanChoiceStateOf | lnt |  | PaymentDeep.tsx |  |
| actionLabelOf | YY |  | PaymentDeep.tsx |  |
| subscriptionGateActionOf | unt |  | PaymentDeep.tsx |  |
| subscribeUrlOf | dnt |  | PaymentDeep.tsx |  |
| groupAvailabilityOf | XY |  | PaymentDeep.tsx |  |
| isMaxGroup | fnt |  | PaymentDeep.tsx |  |
| wordBoundaryTest | ZY |  | PaymentDeep.tsx |  |
| isAnyPurchasable | pnt |  | PaymentDeep.tsx |  |
| strikethroughPriceOf | mnt |  | PaymentDeep.tsx |  |
| priceUnitLabelOf | hnt |  | PaymentDeep.tsx |  |
| currentPlanEntryOf | QY |  | PaymentDeep.tsx |  |
| isAbovePlan | gnt |  | PaymentDeep.tsx |  |
| planEntryRankOf | $Y |  | PaymentDeep.tsx |  |
| tierRankOf | _nt |  | PaymentDeep.tsx |  |
| periodRankOf | vnt |  | PaymentDeep.tsx |  |
| EquityItemLabel | eX |  | PaymentDeep.tsx |  |
| planCardCopyOf | ynt |  | PaymentDeep.tsx |  |
| startPlanCardCopyOf | bnt |  | PaymentDeep.tsx |  |
| startPlanEntitlementRowsOf | xnt | 88047 | PaymentDeep.tsx |  |
| startPlanSummaryOf | Snt |  | PaymentDeep.tsx |  |
| modelUsageEntitlementsOf | Cnt |  | PaymentDeep.tsx |  |
| normalizeUnitName | wnt |  | PaymentDeep.tsx |  |
| periodSuffixOf | Tnt |  | PaymentDeep.tsx |  |
| personalPlanGroupsOf | Ent |  | PaymentDeep.tsx |  |
| hasProductPreview | tX |  | PaymentDeep.tsx |  |
| planGroupKeyOf | Dnt |  | PaymentDeep.tsx |  |
| planGroupRankOf | Ont |  | PaymentDeep.tsx |  |
| availablePeriodsOf | knt |  | PaymentDeep.tsx |  |
| cheapestProductOf | Ant |  | PaymentDeep.tsx |  |
| currentProductOfId | jnt |  | PaymentDeep.tsx |  |
| funnelTierOf | Mnt |  | PaymentDeep.tsx |  |
| funnelTeamTierOf | Nnt |  | PaymentDeep.tsx |  |
| funnelPeriodOf | Pnt |  | PaymentDeep.tsx |  |
| funnelSubscribePeriodOf | Fnt |  | PaymentDeep.tsx |  |
| funnelSubscribeModeOf | Int |  | PaymentDeep.tsx |  |
| funnelAmountOf | Lnt |  | PaymentDeep.tsx |  |
| funnelSlugOf | nX |  | PaymentDeep.tsx |  |
| isGroupCurrentOf | Rnt |  | PaymentDeep.tsx |  |
| providerDisplayNameOf | znt |  | PaymentDeep.tsx |  |
| isBigmodelCodingPlanProvider | Bnt |  | PaymentDeep.tsx |  |
| isPendingRequestCurrent | Vnt |  | PaymentDeep.tsx |  |
| panelTitleOf | Hnt |  | PaymentDeep.tsx |  |
| buildEnvSnapshot | Unt |  | PaymentDeep.tsx |  |
| envConfigOf | Wnt |  | PaymentDeep.tsx |  |
| PLAN_DOMAINS | Gnt |  | PaymentDeep.tsx |  |
| authSessionSnapshotOf | Knt |  | PaymentDeep.tsx |  |
| PURCHASE_TOKEN_TTL | qnt |  | PaymentDeep.tsx |  |
| LOGIN_URL | Jnt |  | PaymentDeep.tsx |  |
| CONSOLE_URL_FOR_PURCHASE | Ynt |  | PaymentDeep.tsx |  |
| SITE_URL_FOR_PURCHASE | rX |  | PaymentDeep.tsx |  |
| API_KEY_PROVIDER_ENTRIES | iX |  | PaymentDeep.tsx |  |
| API_KEY_PROVIDER_ENTRY_MAP | aX |  | PaymentDeep.tsx |  |
| CODING_PLAN_PROVIDER_ENTRIES | oX |  | PaymentDeep.tsx |  |
| KNOWN_PROVIDER_ENTRY_IDS | Xnt |  | PaymentDeep.tsx |  |
| providerDisplayNameOfEntry | Znt |  | PaymentDeep.tsx |  |
| isPresetEntryEnabled | Qnt |  | PaymentDeep.tsx |  |
| teamPlanSelectionOf | $nt |  | PaymentDeep.tsx |  |
| autoRefreshDecisionOf | ert |  | PaymentDeep.tsx |  |
| useCodingPlanEntitlements | sX |  | PaymentDeep.tsx |  |
| mergeRefreshResults | trt |  | PaymentDeep.tsx |  |
| preset | cX |  | PaymentDeep.tsx |  |
| codingPlan | nrt |  | PaymentDeep.tsx |  |
| customSourceIdOf | rrt |  | PaymentDeep.tsx |  |
| isCustomProviderReady | lX |  | PaymentDeep.tsx |  |
| isKnownProviderEntryId | irt |  | PaymentDeep.tsx |  |
| oauthProviderIdOfEntry | art |  | PaymentDeep.tsx |  |
| apiKeyUrlOfEntry | ort |  | PaymentDeep.tsx |  |
| isEmptyText | srt |  | PaymentDeep.tsx |  |
| providerEntryIconOf | crt |  | PaymentDeep.tsx |  |
| codingPlanEntryStatusOf | lrt |  | PaymentDeep.tsx |  |
| injectTeamPlanMenuItems | urt |  | PaymentDeep.tsx |  |
| filterStartPlanMenuItems | drt |  | PaymentDeep.tsx |  |
| mergeTeamPlanMenuItems | frt |  | PaymentDeep.tsx |  |
| teamPlanOrganizationOf | prt |  | PaymentDeep.tsx |  |
| hasTeamScopedEntitlement | mrt |  | PaymentDeep.tsx |  |
| teamMenuItemsOfEntitlement | hrt |  | PaymentDeep.tsx |  |
| fallbackTeamMenuItemOf | grt |  | PaymentDeep.tsx |  |
| teamMenuItemKeyOf | uX |  | PaymentDeep.tsx |  |
| isStatusVisible | _rt |  | PaymentDeep.tsx |  |
| hasApiKey | vrt |  | PaymentDeep.tsx |  |
| CODING_PLAN_ENTRY_ID_SET | yrt |  | PaymentDeep.tsx |  |
| isLoginStatePending | brt |  | PaymentDeep.tsx |  |
| loadPurchaseAuthState | xrt |  | PaymentDeep.tsx |  |
| codingPlanProviderIdOfTarget | Srt |  | PaymentDeep.tsx |  |
| isNonEmpty | Crt |  | PaymentDeep.tsx |  |
| oauthProviderIdOfCodingPlan | wrt |  | PaymentDeep.tsx |  |
| beginUpgradeLoginAttempt | Trt |  | PaymentDeep.tsx |  |
| resolveLoginAttemptAction | Ert |  | PaymentDeep.tsx |  |
| refreshAfterPurchase | Drt |  | PaymentDeep.tsx |  |
| CodingPlanUpgradeDialog | Ort |  | PaymentDeep.tsx |  |
| CodingPlanUpgradeDialogContext | dX |  | PaymentDeep.tsx |  |
| CodingPlanUpgradeDialogProvider | krt |  | PaymentDeep.tsx |  |
| useCodingPlanUpgradeDialog | fX |  | PaymentDeep.tsx |  |
| useCodingPlanUpgradeDialogOptional | Art |  | PaymentDeep.tsx |  |
| planSourceOptionsOf | pX |  | PaymentDeep.tsx |  |
| teamSourceOptionsOf | jrt |  | PaymentDeep.tsx |  |
| resolvePurchaseAudience | Mrt |  | PaymentDeep.tsx |  |
| teamSourceIdMatches | mX |  | PaymentDeep.tsx |  |
| teamSourceLabelOf | Nrt |  | PaymentDeep.tsx |  |
| SIDEBAR_CODING_PLAN_PROVIDER_PREFERENCE_KEY | Prt |  | PaymentDeep.tsx |  |
| SIDEBAR_CODING_PLAN_PROVIDER_IDS | Frt |  | PaymentDeep.tsx |  |
| eligibleSidebarCodingPlanProviders | hX |  | PaymentDeep.tsx |  |
| sidebarPreferenceStorageOf | Irt |  | PaymentDeep.tsx |  |
| writeSidebarCodingPlanProviderPreference | Lrt |  | PaymentDeep.tsx |  |
| modelEntryMatchesValue | Rrt |  | PaymentDeep.tsx |  |
| thoughtOptionOfModel | zrt |  | PaymentDeep.tsx |  |
| currentOptionValueOf | Brt |  | PaymentDeep.tsx |  |
| projectionConfigOfOptions | Vrt |  | PaymentDeep.tsx |  |
| configMatchesModel | Hrt |  | PaymentDeep.tsx |  |
| resolveEffectiveConfig | Urt |  | PaymentDeep.tsx |  |
| draftThoughtOptionOfModel | Wrt |  | PaymentDeep.tsx |  |
| resolvedThoughtLevelOf | Grt |  | PaymentDeep.tsx |  |
| defaultModeOf | Krt |  | PaymentDeep.tsx |  |
| ModePickerTrigger | qrt |  | PaymentDeep.tsx |  |
| noopToolbarAction | Jrt |  | PaymentDeep.tsx |  |
| MODE_TRIGGER_SELECTOR | Yrt |  | PaymentDeep.tsx |  |
| SessionModePicker | Xrt | 89343 | PaymentDeep.tsx |  |
| SessionModePickerMemo | Zrt |  | PaymentDeep.tsx |  |
| MODEL_FOCUS_SELECTOR | Qrt |  | PaymentDeep.tsx |  |
| noopSessionModeCycle | $rt |  | PaymentDeep.tsx |  |
| providerFamilyKindOf | eit |  | PaymentDeep.tsx |  |
| purchaseAudienceStateOf | tit |  | PaymentDeep.tsx |  |
| teamSourceOfEntitlementSnapshot | nit |  | PaymentDeep.tsx |  |
| resolveTeamSourceSelection | rit |  | PaymentDeep.tsx |  |
| SessionModelToolbar | iit | 89503 | PaymentDeep.tsx |  |
| SessionModelToolbarMemo | ait |  | PaymentDeep.tsx |  |
| diffValueOf | oit |  | PaymentDeep.tsx |  |
| accessibleLabelOf | sit |  | PaymentDeep.tsx |  |
| elementDescriptorOf | cit |  | PaymentDeep.tsx |  |
| WebElementsChip | lit | 89989 | PaymentDeep.tsx |  |
| SelectionsChip | uit | 90097 | PaymentDeep.tsx |  |

## 39. B5 · Bots.tsx（F11 Bots 族）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行本机口径）· B5-04。行号口径：本机当前 js 行（主口径）。
- 符号条数：42（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| BOT_PROVIDERS | vLt | 147772 | Bots.tsx | 8 供应商目录（implemented 标记） |
| REPLY_GRANULARITY_OPTIONS | yLt | 147782 | Bots.tsx | 4 回复粒度选项 |
| DEFAULT_REPLY_GRANULARITY | bLt | 147804 | Bots.tsx | yLt[0] |
| replyGranularityOptionsOf | xLt | 147805 | Bots.tsx | Wne(provider) ∩ yLt |
| resolveReplyGranularity | SLt | 147809 | Bots.tsx | 选中 ?? 首项 ?? 缺省 |
| regionTagKeyOfProvider | CLt | 147813 | Bots.tsx | lark→zai / feishu→bigmodel 标签键 |
| workspaceLabelOf | wLt | 147823 | Bots.tsx | trim 非空优先 |
| resolveEntryIntent | TLt | 147826 | Bots.tsx | 已配→select / 未配→create |
| discord | ELt | 147830 | Bots.tsx | 图标 URL |
| dingding | DLt | 147830 | Bots.tsx | 图标 URL |
| feishu | OLt | 147830 | Bots.tsx | 图标 URL |
| telegram | kLt | 147830 | Bots.tsx | 图标 URL |
| wecom | ALt | 147830 | Bots.tsx | 图标 URL |
| weixin | jLt | 147830 | Bots.tsx | 图标 URL |
| BIND_CODE_TTL_MS | MLt | 147836 | Bots.tsx | = See（跨 chunk 常量） |
| TELEGRAM_BOTFATHER_URL | NLt | 147837 | Bots.tsx | `https://t.me/BotFather` |
| isAllWorkspaces | PLt | 147838 | Bots.tsx | 空或含 `*` |
| nonEmptyOr | g8 | 147841 | Bots.tsx | trim 非空优先 |
| BotProviderIcon | _8 | 147844 | Bots.tsx | 7 图标分派 + webhook/log-in 回退 |
| runtimeStatusTextOf | FLt | 147870 | Bots.tsx | messageId→i18n / message / status / enabled \| disabled |
| runtimeDotClassOf | ILt | 147875 | Bots.tsx | error→destructive / polling \| connected→success |
| formatSecondsCeil | LLt | 147884 | Bots.tsx | `NNs` 向上取整 |
| defaultAllowedCommands | RLt | 147887 | Bots.tsx | 7 命令开关全 true |
| BotHeaderRow | zLt | 147890 | Bots.tsx | 图标+名称(内联重命名)+运行态+启用开关 |
| BotReplyGranularityRow | BLt | 148005 | Bots.tsx | 回复粒度 Select |
| BotDeleteRow | VLt | 148030 | Bots.tsx | 删除行 |
| BotDetailCard | v8 | 148046 | Bots.tsx | rounded-lg bg-background p-3 |
| TelegramBotFatherCredentialCard | HLt | 148049 | Bots.tsx | BotFather QR + token 输入 + 保存 |
| BotCredentialSection | ULt | 148125 | Bots.tsx | 凭据/绑定码/飞书注册/微信注册 四路状态机 |
| BotAllowedWorkspacesRow | WLt | 148500 | Bots.tsx | all/selected + 工作区勾选列表 |
| emptyBotsConfig | GLt | 148604 | Bots.tsx | {version:2,bots:[]} |
| newBotOfProvider | KLt | 148607 | Bots.tsx | 新 Bot 骨架 |
| BotsDialog | qLt | 148619 | Bots.tsx | 根对话框 |
| REMOTE_PAIRING_PROVIDERS | JLt | 149473 | Bots.tsx | weixin/feishu/lark/telegram |
| isWorkspaceControlActiveFor | YLt | 149479 | Bots.tsx | 工作区键匹配+会话存在 |
| hasWindowControlSession | XLt | 149490 | Bots.tsx | mobileConnected+会话 |
| remoteControlStatusLabelOf | ZLt | 149495 | Bots.tsx | 6 态 |
| remoteControlStatusDetailOf | QLt | 149511 | Bots.tsx | 6 态 |
| remoteControlDotClassOf | $Lt | 149527 | Bots.tsx | 4 色 |
| remoteControlDeviceTagOf | eRt | 149536 | Bots.tsx | 设备名/phone/ready 回退 |
| remoteControlStatesEqual | tRt | 149549 | Bots.tsx | 18 字段相等 |
| remoteControlFailureMessageOf | nRt | 149571 | Bots.tsx | 11 失败原因 |

## 40. B5 · WebRemote.tsx（F17 WebRemoteFamily）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行，D5b 后现状）· B5-05。行号口径：当前 out chunk js 行。
- 符号条数：39（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| EMPTY_MOBILE_HOME_RESULT | OPt | 140585 | WebRemote.tsx | {workspaces:[],tasks:[]} |
| MOBILE_HOME_PREFERENCES_STORAGE_KEY | kPt | 140586 | WebRemote.tsx |  |
| DEFAULT_MOBILE_HOME_PREFERENCES | v6 | 140587 | WebRemote.tsx | {organizeBy:workspace,sortBy:updated} |
| safeLocalStorage | APt | 140588 | WebRemote.tsx |  |
| isValidMobileHomePreferences | jPt | 140596 | WebRemote.tsx |  |
| loadMobileHomePreferences | MPt | 140604 | WebRemote.tsx |  |
| saveMobileHomePreferences | NPt | 140614 | WebRemote.tsx |  |
| buildMobileHomeModel | PPt | 140619 | WebRemote.tsx | pinned/timeline/groups/计数 |
| activeTaskPresentInModel | FPt | 140648 | WebRemote.tsx |  |
| taskStatusBadgeClass | y6 | 140658 | WebRemote.tsx | running/completed/error/idle |
| latestTaskUpdatedAt | IPt | 140670 | WebRemote.tsx |  |
| MOBILE_THEME_OPTIONS | LPt | 140673 | WebRemote.tsx | [system,zai-dark,zai-light] |
| MobileThemeMenu | RPt | 140674 | WebRemote.tsx | 手机端远控视图主题下拉 |
| TaskStatusIcon | b6 | 140716 | WebRemote.tsx | running→spinner/completed→circle-check/error→circle-alert |
| noopSelectTask | zPt | 140725 | WebRemote.tsx |  |
| WebRemoteMobileTaskHome | BPt | 140726–141572 | WebRemote.tsx | props: activeTaskId/initialResult/onNavigateHome/onNavigateToChat 等 |
| terminalTransportState | VPt | 141573 | WebRemote.tsx | 初值 `idle` |
| transportStateListeners | HPt | 141574 | WebRemote.tsx |  |
| subscribeTransportState | UPt | 141577 | WebRemote.tsx |  |
| getTerminalTransportState | WPt | 141583 | WebRemote.tsx |  |
| useTerminalTransportState | GPt | 141586 | WebRemote.tsx | useSyncExternalStore |
| isMobileChatHistoryState | x6 | 141590 | WebRemote.tsx | history.state.zcodeMobilePage===`chat` |
| pushMobileChatHistoryState | KPt | 141594 | WebRemote.tsx |  |
| resolveInitialMobilePage | qPt | 141598 | WebRemote.tsx |  |
| WebRemoteMobileShell | JPt | 141601–141801 | WebRemote.tsx | home/chat 双页 + 侧pane 覆盖 + 重连通知 |
| BOT_CHANNEL_PROVIDERS | JLt | 149473 | WebRemote.tsx | [weixin,feishu,lark,telegram] |
| statusMatchesWorkspaceTarget | YLt | 149479 | WebRemote.tsx |  |
| isStatusLiveMobileConnected | XLt | 149490 | WebRemote.tsx |  |
| resolveStatusTitle | ZLt | 149495 | WebRemote.tsx | starting/running/… |
| resolveStatusDetail | QLt | 149511 | WebRemote.tsx |  |
| statusDotClass | $Lt | 149527 | WebRemote.tsx | error→bg-destructive/active→bg-success/idle→bg-border/余→bg-warning |
| resolveStatusTag | eRt | 149536 | WebRemote.tsx | 设备名/phone/ready/idle/error |
| isSameWebRemoteStatus | tRt | 149549 | WebRemote.tsx | 17 字段逐比 |
| resolveFailureMessage | nRt | 149571 | WebRemote.tsx | 11 种 failure.reason |
| WebRemoteControlDialog | rRt | 149600–150145 | WebRemote.tsx | memo；QR 配对 + 停止/刷新/复制 + Bot Channel 入口 |
| WEB_REMOTE_CONTROL_ENABLED_DEFAULT | iRt | 150147 | WebRemote.tsx | **D5b 改写：!0 → !1** |
| WebRemoteControlEnabledContext | aRt | 150148 | WebRemote.tsx |  |
| WebRemoteControlEnabledProvider | oRt | 150149 | WebRemote.tsx |  |
| useWebRemoteControlEnabled | y8 | 150152 | WebRemote.tsx |  |

## 41. B5 · RemoteWizard.tsx（F10 RemoteFamily 远程向导）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行，D5b 后现状）· B5-05。行号口径：当前 out chunk js 行。
- 符号条数：12（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| REMOTE_WIZARD_STEPS | i4 | 127943 | RemoteWizard.tsx | [kind,settings,connecting,directory] |
| wizardStepIndex | lOt | 127949 | RemoteWizard.tsx |  |
| RemoteWizardStepIndicator | uOt | 127952 | RemoteWizard.tsx | 移动横滚 nav + 桌面 aside 双形态 |
| RemoteWizardHeader | dOt | 128058 | RemoteWizard.tsx | 标题/描述 + 最小化(bv minus)/关闭(g x) |
| RemoteSettingsForm | REt | 124284–125011 | RemoteWizard.tsx | ssh/server/wsl/docker 四 case 分步表单 |
| RemoteWizardDialog | fOt | 128110–128541 | RemoteWizard.tsx | 触发器 + Dialog 壳 + 四步分派（最小化/关闭语义内嵌） |
| RemoteWizardDialogAlias | pOt | 128542 | RemoteWizard.tsx | `var pOt = fOt`（Home.tsx 接口引用名） |
| — | G2 | 124260 | RemoteWizard.tsx | 内联隙段小助手（无语义名） |
| — | FEt | 124267 | RemoteWizard.tsx | 内联隙段小助手（无语义名） |
| — | K2 | 124276 | RemoteWizard.tsx | 内联隙段小助手（无语义名） |
| — | IEt | 124277 | RemoteWizard.tsx | 内联隙段小助手（无语义名） |
| — | LEt | 124278 | RemoteWizard.tsx | 内联隙段小助手（无语义名） |

## 42. B5 · PreviewCards.tsx（F19 预览卡群深部）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，本机实测 213,979 行）· B5-06。行号口径：本机实测当前 js 行。
- 符号条数：65（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| MIN_DIAGRAM_ZOOM | Uze | 48114 | PreviewCards.tsx |  |
| clampDiagramZoom | ek | 48115 | PreviewCards.tsx |  |
| zoomDiagramAt | tk | 48118 | PreviewCards.tsx |  |
| panDiagram | nk | 48125 | PreviewCards.tsx |  |
| fitDiagramToViewport | Wze | 48128 | PreviewCards.tsx |  |
| IDENTITY_DIAGRAM_TRANSFORM | rk | 48143 | PreviewCards.tsx |  |
| DIAGRAM_ZOOM_PRESETS | Gze | 48144 | PreviewCards.tsx |  |
| SVG_RENDERED_SELECTOR | Kze | 48145 | PreviewCards.tsx |  |
| SVG_NON_RENDERED_SELECTOR | qze | 48158 | PreviewCards.tsx |  |
| pointerCenter | ik | 48173 | PreviewCards.tsx |  |
| pointerDistance | ak | 48179 | PreviewCards.tsx |  |
| isInvisiblePaint | Jze | 48183 | PreviewCards.tsx |  |
| svgRootBounds | ok | 48187 | PreviewCards.tsx |  |
| applySvgRootBounds | sk | 48196 | PreviewCards.tsx |  |
| serializeRect | ck | 48209 | PreviewCards.tsx |  |
| svgBBox | Yze | 48214 | PreviewCards.tsx |  |
| unionBounds | Xze | 48222 | PreviewCards.tsx |  |
| isBackgroundRect | Zze | 48229 | PreviewCards.tsx |  |
| measureSvgContentBounds | lk | 48244 | PreviewCards.tsx |  |
| toViewportLocalPoint | uk | 48265 | PreviewCards.tsx |  |
| MermaidFullscreenDialog | Qze | 48269 | PreviewCards.tsx |  |
| DiagramToolbarButton | dk | 48558 | PreviewCards.tsx |  |
| MarkdownTableStickyScrollbar | MBe | 49138 | PreviewCards.tsx |  |
| TableToolbarButton | Lk | 49758 | PreviewCards.tsx |  |
| ORIGIN_POINT | Rk | 49801 | PreviewCards.tsx |  |
| LIGHTBOX_DOWNLOAD_MAX_BYTES | zk | 49802 | PreviewCards.tsx |  |
| MIME_TO_DOWNLOAD_EXTENSION | RBe | 49803 | PreviewCards.tsx |  |
| clampPanOffset | zBe | 49811 | PreviewCards.tsx |  |
| downloadBaseName | Bk | 49819 | PreviewCards.tsx |  |
| LightboxDownloadError | Vk | 49828 | PreviewCards.tsx |  |
| isHttpDownloadSource | Hk | 49833 | PreviewCards.tsx |  |
| summarizeDownloadSource | Uk | 49836 | PreviewCards.tsx |  |
| downloadBlobWithSizeLimit | BBe | 49845 | PreviewCards.tsx |  |
| openUrlInNewTab | VBe | 49873 | PreviewCards.tsx |  |
| ImageLightbox | Wk | 49882 | PreviewCards.tsx |  |
| ImageGalleryGroup | qk | 50165 | PreviewCards.tsx |  |
| TOOL_PREVIEW_TEXT_LIMIT | HBe | 50177 | PreviewCards.tsx |  |
| EXTENSION_LANGUAGE_MAP | Jk | 50178 | PreviewCards.tsx |  |
| EXTENSION_IMAGE_MIME_MAP | UBe | 50212 | PreviewCards.tsx |  |
| isPlainObject | WBe | 50224 | PreviewCards.tsx |  |
| resolvePreviewTitle | Yk | 50227 | PreviewCards.tsx |  |
| pickStringField | Xk | 50230 | PreviewCards.tsx |  |
| looksLikeUnifiedDiff | Zk | 50237 | PreviewCards.tsx |  |
| extractPatchText | Qk | 50240 | PreviewCards.tsx |  |
| extractContentText | $k | 50245 | PreviewCards.tsx |  |
| extractPathField | eA | 50250 | PreviewCards.tsx |  |
| buildTextPreview | tA | 50263 | PreviewCards.tsx |  |
| resolvePreviewPath | nA | 50266 | PreviewCards.tsx |  |
| detectPreviewLanguage | rA | 50271 | PreviewCards.tsx |  |
| imageMimeTypeOfPath | iA | 50283 | PreviewCards.tsx |  |
| isImagePath | aA | 50289 | PreviewCards.tsx |  |
| isPdfPreviewPath | oA | 50292 | PreviewCards.tsx |  |
| isPptxPreviewPath | sA | 50295 | PreviewCards.tsx |  |
| isUsablePreviewPath | cA | 50298 | PreviewCards.tsx |  |
| unquoteDiffPath | GBe | 50302 | PreviewCards.tsx |  |
| stripDiffSidePrefix | lA | 50306 | PreviewCards.tsx |  |
| parseDiffSidePath | uA | 50310 | PreviewCards.tsx |  |
| parseDiffGitHeaderPath | KBe | 50320 | PreviewCards.tsx |  |
| extractDiffTargetPath | qBe | 50329 | PreviewCards.tsx |  |
| resolvePatchPath | JBe | 50345 | PreviewCards.tsx |  |
| buildDiffPreviewSource | YBe | 50348 | PreviewCards.tsx |  |
| buildToolPreviewSource | XBe | 50367 | PreviewCards.tsx |  |
| buildToolContentPreview | ZBe | 50401 | PreviewCards.tsx |  |
| InlineActionRow | ej | 51221 | PreviewCards.tsx |  |
| InlineIconButton | tj | 51223 | PreviewCards.tsx |  |

## 43. B5 · FileTreePanel.tsx（F04 工作区文件树 $It 全族）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，本机实测 213,979 行）· B5-06。行号口径：本机实测当前 js 行。
- 符号条数：78（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| GIT_STATUS_PRIORITY | AA | 50907 | FileTreePanel.tsx |  |
| GIT_STATUS_BADGE_PRIORITY | jA | 50907 | FileTreePanel.tsx |  |
| normalizePathSeparators | MA | 50909 | FileTreePanel.tsx |  |
| normalizePathKey | NA | 50912 | FileTreePanel.tsx |  |
| gitStatusKeyOf | NVe | 50915 | FileTreePanel.tsx |  |
| buildStatusByPath | PVe | 50918 | FileTreePanel.tsx |  |
| isGitStatusAvailable | FVe | 50928 | FileTreePanel.tsx |  |
| statusForPath | PA | 50931 | FileTreePanel.tsx |  |
| normalizePathSet | IVe | 50934 | FileTreePanel.tsx |  |
| hasNormalizedPath | FA | 50937 | FileTreePanel.tsx |  |
| isDeletedFileRow | IA | 50940 | FileTreePanel.tsx |  |
| isRealDirectory | LA | 50943 | FileTreePanel.tsx |  |
| descendantStatuses | RA | 50946 | FileTreePanel.tsx |  |
| mergeDeletedFileRows | LVe | 50952 | FileTreePanel.tsx |  |
| relativePathFromWorkspace | zA | 50967 | FileTreePanel.tsx | ★MarkdownIntegration 已实现，此处声明 ★MI |
| samePath | BA | 50974 | FileTreePanel.tsx |  |
| isPathWithinRoot | VA | 50977 | FileTreePanel.tsx |  |
| ancestorDirectoryPaths | RVe | 50982 | FileTreePanel.tsx |  |
| relativeDepthFromRoot | HA | 50997 | FileTreePanel.tsx |  |
| parentDirectoryPathInRoot | UA | 51004 | FileTreePanel.tsx |  |
| normalizeSearchQuery | zVe | 51014 | FileTreePanel.tsx |  |
| rowHasGitChange | BVe | 51017 | FileTreePanel.tsx |  |
| filterTreeRows | VVe | 51021 | FileTreePanel.tsx |  |
| flattenTreeRows | HVe | 51035 | FileTreePanel.tsx |  |
| buildFilePreviewNode | UVe | 51077 | FileTreePanel.tsx |  |
| FILE_MANAGER_EDITOR_ORDER | WA | 51084 | FileTreePanel.tsx |  |
| orderEditorsForFileManager | GA | 51085 | FileTreePanel.tsx |  |
| SSH_EDITOR_IDS | WVe | 51092 | FileTreePanel.tsx |  |
| WSL_EDITOR_IDS | GVe | 51092 | FileTreePanel.tsx |  |
| wslFallbackEditor | KA | 51094 | FileTreePanel.tsx |  |
| editorsByIds | qA | 51097 | FileTreePanel.tsx |  |
| resolveAvailableEditors | JA | 51100 | FileTreePanel.tsx |  |
| isExplicitSelection | KVe | 51109 | FileTreePanel.tsx |  |
| toError | YA | 51112 | FileTreePanel.tsx |  |
| toggledPathSet | XA | 51115 | FileTreePanel.tsx |  |
| isMacPlatform | qVe | 51119 | FileTreePanel.tsx |  |
| isWindowsPlatform | JVe | 51122 | FileTreePanel.tsx |  |
| revealInFileManagerLabel | YVe | 51125 | FileTreePanel.tsx |  |
| isHtmlPreviewRow | ZA | 51132 | FileTreePanel.tsx |  |
| browserUrlForRow | XVe | 51135 | FileTreePanel.tsx |  |
| revealPathForEntry | ZVe | 51138 | FileTreePanel.tsx |  |
| useFileContextActions | QA | 51141 | FileTreePanel.tsx |  |
| resolveRemoteWorkspaceInfo | QVe | 51198 | FileTreePanel.tsx | ★MarkdownIntegration 已实现，此处声明 ★MI |
| useRemoteWorkspaceInfo | $A | 51214 | FileTreePanel.tsx | ★MarkdownIntegration 已实现，此处声明 ★MI |
| FILE_TREE_ROW_HEIGHT | f8 | 145213 | FileTreePanel.tsx |  |
| REFRESH_DIRECTORY_TIMEOUT_MS | jIt | 145214 | FileTreePanel.tsx |  |
| REFRESH_GIT_TIMEOUT_MS | MIt | 145215 | FileTreePanel.tsx |  |
| useInstalledEditors | NIt | 145216 | FileTreePanel.tsx |  |
| loadGitStatusSnapshot | PIt | 145241 | FileTreePanel.tsx |  |
| useDirectoryFileWatcher | FIt | 145249 | FileTreePanel.tsx |  |
| collectRefreshTargetPaths | IIt | 145312 | FileTreePanel.tsx |  |
| useFlattenedTreeRows | LIt | 145323 | FileTreePanel.tsx |  |
| timeoutError | RIt | 145346 | FileTreePanel.tsx |  |
| withTimeout | zIt | 145349 | FileTreePanel.tsx |  |
| useWorkspaceFileTreeData | BIt | 145364 | FileTreePanel.tsx |  |
| computeStickyFolderRows | VIt | 145687 | FileTreePanel.tsx |  |
| useStickyFolderScroll | HIt | 145717 | FileTreePanel.tsx |  |
| FileTreeEmptyState | p8 | 145763 | FileTreePanel.tsx |  |
| gitStatusBadgeLetter | UIt | 145778 | FileTreePanel.tsx |  |
| gitStatusTextColor | WIt | 145794 | FileTreePanel.tsx |  |
| primaryGitStatus | GIt | 145812 | FileTreePanel.tsx |  |
| gitStatusBadgeColor | KIt | 145815 | FileTreePanel.tsx |  |
| gitStatusDotColor | qIt | 145831 | FileTreePanel.tsx |  |
| HIERARCHY_GUIDE_BACKGROUND | JIt | 145849 | FileTreePanel.tsx |  |
| hierarchyGuideStyle | YIt | 145850 | FileTreePanel.tsx |  |
| useFileTreeDragState | XIt | 145853 | FileTreePanel.tsx |  |
| CompactPathName | ZIt | 145873 | FileTreePanel.tsx |  |
| FileTreeRow | QIt | 145893 | FileTreePanel.tsx |  |
| FileTreeVirtualList | $It | 146135 | FileTreePanel.tsx |  |
| StickyFolderList | eLt | 146208 | FileTreePanel.tsx |  |
| depthOfPath | tLt | 146283 | FileTreePanel.tsx |  |
| FileTreePanel | nLt | 146286 | FileTreePanel.tsx |  |
| rootErrorIfNotLoaded | rLt | 146775 | FileTreePanel.tsx |  |
| DEFAULT_TASK_MEMBERSHIP | iLt | 146778 | FileTreePanel.tsx |  |
| sortTasksByRecency | aLt | 146779 | FileTreePanel.tsx |  |
| upsertTaskInWorkspaceCache | oLt | 146788 | FileTreePanel.tsx |  |
| cleanupDeletedTaskState | sLt | 146825 | FileTreePanel.tsx |  |
| registerWorkspaceTask | cLt | 146839 | FileTreePanel.tsx |  |

## 44. B5 · FileRewindDialogDeep.tsx（F14 MO 代码查看器 + F03 FileRewindDialog 深部）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，本机实测 213,979 行）· B5-06。行号口径：本机实测当前 js 行。
- 符号条数：25（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| resolveColorScheme | cze | 47354 | FileRewindDialogDeep.tsx |  |
| assignRef | lze | 47363 | FileRewindDialogDeep.tsx |  |
| CODE_COMMENT_DEFAULT_LABELS | uze | 47372 | FileRewindDialogDeep.tsx |  |
| CODE_COMMENT_GUTTER_CSS | dze | 47382 | FileRewindDialogDeep.tsx |  |
| cssVarJsonEscape | fze | 47390 | FileRewindDialogDeep.tsx |  |
| hashStringBase36 | pze | 47393 | FileRewindDialogDeep.tsx |  |
| navigatorFingerprint | mze | 47398 | FileRewindDialogDeep.tsx |  |
| isSubmitCommentShortcut | hze | 47403 | FileRewindDialogDeep.tsx |  |
| isEscapeKey | gze | 47406 | FileRewindDialogDeep.tsx |  |
| submitShortcutLabel | _ze | 47409 | FileRewindDialogDeep.tsx |  |
| cancelShortcutLabel | vze | 47412 | FileRewindDialogDeep.tsx |  |
| setUtilityButtonTitles | DO | 47415 | FileRewindDialogDeep.tsx |  |
| walkShadowRoots | OO | 47419 | FileRewindDialogDeep.tsx |  |
| buildCodeViewerFileSource | yze | 47422 | FileRewindDialogDeep.tsx |  |
| normalizeLineRange | kO | 47433 | FileRewindDialogDeep.tsx |  |
| selectionToLineRange | AO | 47436 | FileRewindDialogDeep.tsx |  |
| rangeToRelativeLines | bze | 47439 | FileRewindDialogDeep.tsx |  |
| extractRangeText | xze | 47443 | FileRewindDialogDeep.tsx |  |
| formatCommentRangeLabel | jO | 47454 | FileRewindDialogDeep.tsx |  |
| CodeCommentComposer | Sze | 47462 | FileRewindDialogDeep.tsx |  |
| CodeCommentCard | Cze | 47518 | FileRewindDialogDeep.tsx |  |
| CodeViewerWithComments | MO | 47549 | FileRewindDialogDeep.tsx |  |
| isMermaidLanguage | NO | 47709 | FileRewindDialogDeep.tsx |  |
| buildFilePreviewSource | __t | 110410 | FileRewindDialogDeep.tsx |  |
| FileOpenWithMenu | v_t | 110427 | FileRewindDialogDeep.tsx |  |

## 45. B5 · QuickPickDeep.tsx（B5-07 段 A：ZS useGlobalTaskList 深部助手 + 分组拖拽 + 协议宿主常量）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，213,979 行）· B5-07 段 A。行号口径：本机当前 chunk js 行（较旧报告 213,695 口径 A 段偏移 +48）。
- 符号条数：108（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| TASK_META_REFRESH_REASONS | nOe | 32249 | QuickPickDeep.tsx | 6 原因集 |
| META_ONLY_REFRESH_REASONS | rOe | 32257 | QuickPickDeep.tsx | 4 原因集 |
| MEMBERSHIP_TOGGLE_REASONS | iOe | 32258 | QuickPickDeep.tsx | 4 原因集 |
| isMembershipToggleReason | nx | 32259 | QuickPickDeep.tsx |  |
| isTaskDeletedReason | aOe | 32262 | QuickPickDeep.tsx |  |
| isListMembershipChanged | rx | 32265 | QuickPickDeep.tsx |  |
| shouldInvalidateShardCache | oOe | 32273 | QuickPickDeep.tsx |  |
| resolveMembershipIntent | ix | 32276 | QuickPickDeep.tsx | insert-active/preserve-membership/null |
| hasMembershipIntent | sOe | 32285 | QuickPickDeep.tsx |  |
| UNREAD_PERSIST_DEDUPE_MS=1e3 | dOe | 32330 | QuickPickDeep.tsx |  |
| UNREAD_PERSIST_DEDUPE_MAX=256 | fOe | 32331 | QuickPickDeep.tsx |  |
| unreadPersistDedupe | fx | 32332 | QuickPickDeep.tsx |  |
| isTerminalStatus | pOe | 32333 | QuickPickDeep.tsx |  |
| unreadPersistDedupeKey | mOe | 32336 | QuickPickDeep.tsx |  |
| isUnreadPersistDeduped | hOe | 32344 | QuickPickDeep.tsx |  |
| isBackgroundTerminalUnreadEvent | gOe | 32354 | QuickPickDeep.tsx |  |
| syncBackgroundTerminalUnread | px | 32364 | QuickPickDeep.tsx |  |
| setTaskUnreadOverlayNow | tae | 1905 | QuickPickDeep.tsx |  |
| reconcileTaskUnreadNow | nae | 1908 | QuickPickDeep.tsx |  |
| rollbackTaskUnreadNow | Wo | 1911 | QuickPickDeep.tsx |  |
| markWorkspaceKeysStaleNow | Ho | 1885 | QuickPickDeep.tsx |  |
| membershipHold | mx | 32414 | QuickPickDeep.tsx |  |
| membershipHoldStats | hx | 32414 | QuickPickDeep.tsx |  |
| armMembershipRefreshHold | _Oe | 32416 | QuickPickDeep.tsx |  |
| releaseMembershipRefreshHold | vOe | 32428 | QuickPickDeep.tsx |  |
| getMembershipHoldStats | yOe | 32432 | QuickPickDeep.tsx |  |
| awaitMembershipRefreshHold | bOe | 32435 | QuickPickDeep.tsx |  |
| scopeOf | gx | 32439 | QuickPickDeep.tsx |  |
| listPinnedIdsSafe | _x | 32445 | QuickPickDeep.tsx |  |
| listTasksWithAvailability | vx | 32452 | QuickPickDeep.tsx |  |
| collectUnreadAt | yx | 32459 | QuickPickDeep.tsx |  |
| collectTerminalStatus | bx | 32462 | QuickPickDeep.tsx |  |
| collectTitleOverrides | xx | 32465 | QuickPickDeep.tsx |  |
| collectCronAutomationIds | Sx | 32469 | QuickPickDeep.tsx |  |
| dedupeTaskRowsByEntityKey | xOe | 32472 | QuickPickDeep.tsx |  |
| loadTaskIndexShard | Cx | 32477 | QuickPickDeep.tsx |  |
| taskIndexSnapshotCache | wx | 32528 | QuickPickDeep.tsx |  |
| SNAPSHOT_CACHE_MAX=8 | SOe | 32529 | QuickPickDeep.tsx |  |
| serviceIdWeakMap | Tx | 32530 | QuickPickDeep.tsx |  |
| nextServiceId | COe | 32531 | QuickPickDeep.tsx |  |
| serviceIdOf | wOe | 32532 | QuickPickDeep.tsx |  |
| acquireTaskIndexSnapshot | Ex | 32536 | QuickPickDeep.tsx |  |
| clearTaskIndexSnapshots | TOe | 32548 | QuickPickDeep.tsx |  |
| loadMergedTaskIndex | EOe | 32551 | QuickPickDeep.tsx |  |
| mergeSessionIntoTask | DOe | 32578 | QuickPickDeep.tsx |  |
| hydrateTaskIndexItems | Dx | 32594 | QuickPickDeep.tsx |  |
| matchesMembershipKind | OOe | 32601 | QuickPickDeep.tsx |  |
| applyIndexOverlay | kOe | 32615 | QuickPickDeep.tsx |  |
| projectTaskIndex | Ox | 32648 | QuickPickDeep.tsx |  |
| mapSessionPhaseToStatus | AOe | 32665 | QuickPickDeep.tsx |  |
| sessionRowToTaskMeta | jOe | 32679 | QuickPickDeep.tsx |  |
| INITIAL_SESSION_INDEX_STATE | FS | 34986 | QuickPickDeep.tsx |  |
| RUNTIME_RESTART_BASE_DELAY_MS=100 | UAe | 34987 | QuickPickDeep.tsx |  |
| RUNTIME_RESTART_MAX_DELAY_MS=5e3 | WAe | 34988 | QuickPickDeep.tsx |  |
| RUNTIME_RESTART_RESET_MS=3e4 | GAe | 34989 | QuickPickDeep.tsx |  |
| SUBSCRIBE_RETRY_BACKOFF_MS | KAe | 34990 | QuickPickDeep.tsx | =[250,1e3,3e3] |
| isDormantSubscribeError | qAe | 34991 | QuickPickDeep.tsx |  |
| isTransientSubscribeError | JAe | 35000 | QuickPickDeep.tsx |  |
| unsubscribeTransportSafe | IS | 35003 | QuickPickDeep.tsx |  |
| applyFrameToIndexState | YAe | 35012 | QuickPickDeep.tsx |  |
| subscriptionScopeKey | US | 35443 | QuickPickDeep.tsx |  |
| isSameSubscriptionEntry | ZAe | 35446 | QuickPickDeep.tsx |  |
| scopeStoreKey | GS | 35529 | QuickPickDeep.tsx |  |
| scopeStoreKeyAlias | $Ae | 35532 | QuickPickDeep.tsx |  |
| toSessionIndexScope | KS | 35535 | QuickPickDeep.tsx |  |
| shardCacheKeyOf | qS | 35543 | QuickPickDeep.tsx |  |
| isIdleEmptyIndexStore | eje | 35546 | QuickPickDeep.tsx |  |
| useSessionIndexShards | JS | 35552 | QuickPickDeep.tsx | ZS 深部主钩子 |
| entityPrevKeyOf | YS | 35625 | QuickPickDeep.tsx |  |
| sessionPrevKeyOf | tje | 35628 | QuickPickDeep.tsx |  |
| deepValueEqual | nje | 35631 | QuickPickDeep.tsx |  |
| reuseUnchangedTaskRows | rje | 35649 | QuickPickDeep.tsx |  |
| dynamicSubsByService | XS | 35659 | QuickPickDeep.tsx |  |
| dynamicScopeKey | ije | 35659 | QuickPickDeep.tsx |  |
| subscribeDynamicWorkspaceEvents | aje | 35663 | QuickPickDeep.tsx |  |
| normalizeShardScopes | oje | 35695 | QuickPickDeep.tsx |  |
| buildShardPlan | sje | 35700 | QuickPickDeep.tsx |  |
| narrowCachedShardToDescriptor | cje | 35730 | QuickPickDeep.tsx |  |
| applyRuntimeStateEvent | lje | 35745 | QuickPickDeep.tsx |  |
| pointerPositionOf | Lzt | 155248 | QuickPickDeep.tsx |  |
| trackPointerPosition | Rzt | 155253 | QuickPickDeep.tsx |  |
| findScrollableAncestor | F8 | 155281 | QuickPickDeep.tsx |  |
| groupSignaturesEqual | zzt | 155290 | QuickPickDeep.tsx |  |
| stringArraysEqual | Bzt | 155296 | QuickPickDeep.tsx |  |
| taskKeyOfDropData | I8 | 155299 | QuickPickDeep.tsx |  |
| groupIdOfDropData | L8 | 155304 | QuickPickDeep.tsx |  |
| dropDataTypeOf | R8 | 155309 | QuickPickDeep.tsx |  |
| groupIdOfGroupOver | Vzt | 155314 | QuickPickDeep.tsx |  |
| groupIdOfCollapsedGroup | Hzt | 155319 | QuickPickDeep.tsx |  |
| groupIdOfExpandedHeader | Uzt | 155324 | QuickPickDeep.tsx |  |
| groupIdOfExpandedFooter | Wzt | 155331 | QuickPickDeep.tsx |  |
| groupIdOfEmptyDropZone | Gzt | 155338 | QuickPickDeep.tsx |  |
| groupedCollisionDetection | Kzt | 155343 | QuickPickDeep.tsx |  |
| applyTaskOverTaskDrop | qzt | 155353 | QuickPickDeep.tsx |  |
| applyTaskOverCollapsedDrop | Jzt | 155358 | QuickPickDeep.tsx |  |
| applyTaskOverExpandedHeaderDrop | Yzt | 155363 | QuickPickDeep.tsx |  |
| applyTaskOverExpandedFooterDrop | Xzt | 155372 | QuickPickDeep.tsx |  |
| applyTaskOverEmptyZoneDrop | Zzt | 155381 | QuickPickDeep.tsx |  |
| applyGroupOverGroupDrop | Qzt | 155386 | QuickPickDeep.tsx |  |
| applyGroupOverTaskDrop | $zt | 155393 | QuickPickDeep.tsx |  |
| groupedLayoutFingerprint | z8 | 155400 | QuickPickDeep.tsx |  |
| DROP_ANIMATION_CONFIG | eBt | 155407 | QuickPickDeep.tsx |  |
| AUTO_SCROLL_THRESHOLDS | tBt | 155408 | QuickPickDeep.tsx |  |
| measureGroupedLayout | nBt | 155409 | QuickPickDeep.tsx |  |
| measureGroupedTaskWidth | rBt | 155427 | QuickPickDeep.tsx |  |
| measureGroupItemWidth | iBt | 155434 | QuickPickDeep.tsx |  |
| findStickyCollapsedGroupId | aBt | 155440 | QuickPickDeep.tsx |  |
| replayGroupedLayoutAnimations | oBt | 155460 | QuickPickDeep.tsx |  |

## 46. B5 · CmdkPaletteDeep.tsx（B5-07 段 B：zZ cmdk 弹层深部（F00 分支切换器深部））

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（本机 213,979 行副本）· B5-07 段 B。行号口径：本机当前 js 行（旧 213,695 口径本区偏移 +48）。
- 符号条数：55（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| resolveBranchDisplayLabel | MZ | 95015 | CmdkPaletteDeep.tsx |  |
| branchFilterMatches | bst | 95020 | CmdkPaletteDeep.tsx |  |
| firstIssue | xst | 95024 | CmdkPaletteDeep.tsx |  |
| isOverwriteIssueCode | Sst | 95027 | CmdkPaletteDeep.tsx |  |
| issueErrorI18nKey | Cst | 95032 | CmdkPaletteDeep.tsx |  |
| successToastI18nKey | wst | 95054 | CmdkPaletteDeep.tsx |  |
| splitVisibleIssuePaths | Tst | 95061 | CmdkPaletteDeep.tsx |  |
| mapChangeFilesToRows | NZ | 95065 | CmdkPaletteDeep.tsx |  |
| summarizeFileRows | Est | 95091 | CmdkPaletteDeep.tsx |  |
| filesOfIssuePaths | Dst | 95097 | CmdkPaletteDeep.tsx |  |
| checkpointCommitMessage | Ost | 95113 | CmdkPaletteDeep.tsx |  |
| formatShortList | kst | 95119 | CmdkPaletteDeep.tsx |  |
| hasGitIdentity | PZ | 95124 | CmdkPaletteDeep.tsx |  |
| buildSwitchAssistState | Ast | 95127 | CmdkPaletteDeep.tsx |  |
| CreateBranchDialog | jst | 95169 | CmdkPaletteDeep.tsx |  |
| SwitchAssistDialog | Mst | 95262 | CmdkPaletteDeep.tsx |  |
| shortHash | FZ | 95567 | CmdkPaletteDeep.tsx |  |
| refKindIcon | Nst | 95570 | CmdkPaletteDeep.tsx |  |
| formatAuthoredAt | Pst | 95573 | CmdkPaletteDeep.tsx |  |
| CommitDetailPanel | Fst | 95583 | CmdkPaletteDeep.tsx |  |
| MISSING_PARENT_ROW_INDEX | Ist | 95686 | CmdkPaletteDeep.tsx |  |
| GraphLine | Lst | 95687 | CmdkPaletteDeep.tsx |  |
| GraphVertex | Rst | 95700 | CmdkPaletteDeep.tsx |  |
| buildGraphVertices | zst | 95759 | CmdkPaletteDeep.tsx |  |
| allocateColourIndex | Bst | 95772 | CmdkPaletteDeep.tsx |  |
| connectMergeParent | Vst | 95776 | CmdkPaletteDeep.tsx |  |
| walkBranchLine | Hst | 95796 | CmdkPaletteDeep.tsx |  |
| processVertex | Ust | 95827 | CmdkPaletteDeep.tsx |  |
| layoutCommitGraphBranches | Wst | 95840 | CmdkPaletteDeep.tsx |  |
| GRAPH_ROW_HEIGHT=42 | Gst | 95853 | CmdkPaletteDeep.tsx |  |
| GRAPH_LANE_GAP=18 | Kst | 95854 | CmdkPaletteDeep.tsx |  |
| GRAPH_LANE_PADDING=16 | qst | 95855 | CmdkPaletteDeep.tsx |  |
| GRAPH_TOP_PADDING=20 | Jst | 95856 | CmdkPaletteDeep.tsx |  |
| GRAPH_BOTTOM_PADDING=18 | Yst | 95853–95857 | CmdkPaletteDeep.tsx |  |
| curvePath | IZ | 95858 | CmdkPaletteDeep.tsx |  |
| pointPixels | LZ | 95865 | CmdkPaletteDeep.tsx |  |
| buildEdgePath | Xst | 95868 | CmdkPaletteDeep.tsx |  |
| buildLaneSegmentPath | Zst | 95878 | CmdkPaletteDeep.tsx |  |
| buildTruncatedEdges | Qst | 95888 | CmdkPaletteDeep.tsx |  |
| computeCommitGraphLayout | $st | 95912 | CmdkPaletteDeep.tsx |  |
| STROKE_CLASSES | ect | 95944 | CmdkPaletteDeep.tsx |  |
| FILL_CLASSES | tct | 95949 | CmdkPaletteDeep.tsx |  |
| DOT_RADIUS=4 | nct | 95951 | CmdkPaletteDeep.tsx |  |
| DOT_SELECTED_RADIUS=4.25 | rct | 95952 | CmdkPaletteDeep.tsx |  |
| DOT_SELECTED_RING_RADIUS=5.5 | ict | 95953 | CmdkPaletteDeep.tsx |  |
| LOAD_MORE_SCROLL_PX=96 | act | 95954 | CmdkPaletteDeep.tsx |  |
| GRAPH_MIN_COLUMN_PX=56 | oct | 95944–95955 | CmdkPaletteDeep.tsx |  |
| strokeClassOfLane | sct | 95956 | CmdkPaletteDeep.tsx |  |
| fillClassOfLane | cct | 95959 | CmdkPaletteDeep.tsx |  |
| gridColumnsStyle | lct | 95962 | CmdkPaletteDeep.tsx |  |
| edgeTouchesHash | uct | 95965 | CmdkPaletteDeep.tsx |  |
| CommitGraphView | dct | 95968 | CmdkPaletteDeep.tsx |  |
| GRAPH_PAGE_SIZE=50 | RZ | 96282 | CmdkPaletteDeep.tsx |  |
| CommitGraphDialog | fct | 96283 | CmdkPaletteDeep.tsx |  |
| useGitBranchSwitcher | pct | 96410 | CmdkPaletteDeep.tsx |  |

## 47. B5 · McpHelpers.tsx（B5-07 段 C：MCP 纯助手群 + 迁移助手尾部）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（本机 213,979 行副本）· B5-07 段 C。行号口径：本机当前 js 行。
- 符号条数：32（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| PLUGIN_COMPONENT_KIND_SEQUENCE | qQt | 193351 | McpHelpers.tsx |  |
| matchesScopedQuery | N7 | 193380 | McpHelpers.tsx |  |
| splitSkillsByScope | XQt | 193384 | McpHelpers.tsx |  |
| splitCommandsByScope | ZQt | 193397 | McpHelpers.tsx |  |
| filterZcodeAgentMcpServers | QQt | 193409 | McpHelpers.tsx |  |
| pluginMcpServerRows | $Qt | 193414 | McpHelpers.tsx |  |
| unwrapPluginServerName | P7 | 193440 | McpHelpers.tsx |  |
| resolveRuntimeServerName | e$t | 193444 | McpHelpers.tsx |  |
| runtimeStateProjection | t$t | 193447 | McpHelpers.tsx |  |
| syncResourceKey | n$t | 193471 | McpHelpers.tsx |  |
| jsonStringify | F7 | 193474 | McpHelpers.tsx |  |
| parseSyncResourceKey | r$t | 193477 | McpHelpers.tsx |  |
| groupImportPlans | i$t | 193494 | McpHelpers.tsx |  |
| errorMessageText | a$t | 193525 | McpHelpers.tsx |  |
| taskResultsOfCategory | o$t | 193528 | McpHelpers.tsx |  |
| agentDisplayLabel | s$t | 193541 | McpHelpers.tsx |  |
| categoryOfAgentResult | I7 | 193583 | McpHelpers.tsx |  |
| SYNC_SCOPES | c$t | 193586 | McpHelpers.tsx |  |
| SYNC_IMPORT_MODES | l$t | 193587 | McpHelpers.tsx |  |
| importScopeI18nKey | u$t | 193588 | McpHelpers.tsx |  |
| itemsOfCategory | L7 | 193591 | McpHelpers.tsx |  |
| normalizeSlashes | d$t | 193600 | McpHelpers.tsx |  |
| scopeOfPath | f$t | 193603 | McpHelpers.tsx |  |
| sourceRootsOfAgent | p$t | 193609 | McpHelpers.tsx |  |
| scopeRowsOfAgents | m$t | 193623 | McpHelpers.tsx |  |
| MIGRATION_DEFAULT_LIMIT=100 | k2t | 203426 | McpHelpers.tsx |  |
| MIGRATION_MAX_LIMIT=500 | A2t | 203427 | McpHelpers.tsx |  |
| MIGRATION_UNLIMITED | j2t | 203428 | McpHelpers.tsx | =`unlimited` |
| MIGRATION_RANGE_DURATIONS | M2t | 203429 | McpHelpers.tsx |  |
| modifiedSinceOfRange | N2t | 203430 | McpHelpers.tsx |  |
| parseScanLimit | P2t | 203433 | McpHelpers.tsx |  |
| resolveWorkspaceFilterMode | F2t | 203437 | McpHelpers.tsx |  |

## 48. B5 · LegacyDocEngineC1.tsx（legacy-doc 内部引擎 C 上（[E6]b 登记余量 + §D 依赖补全））

- 族/来源：legacy-doc 族 · 源 chunk `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` · B5-08。行号口径：jsx 还原孪生行（`previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`）。
- 符号条数：172（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| twipsToPxNonNegative | Br | 12019 | LegacyDocEngineC1.tsx |  |
| PAGE_BREAK_RUN_RE | _o | 13983 | LegacyDocEngineC1.tsx |  |
| PAGE_BREAK_BEFORE_TAG_RE | vo | 13984 | LegacyDocEngineC1.tsx |  |
| paragraphHasPageBreakRun | xo | 13993 | LegacyDocEngineC1.tsx |  |
| paragraphPageBreakBeforeOf | So | 13997 | LegacyDocEngineC1.tsx |  |
| nodePageBreakStarts | Mo | 14061 | LegacyDocEngineC1.tsx |  |
| layoutTextCache | Cp | 17137 | LegacyDocEngineC1.tsx |  |
| fragmentCache | wp | 17138 | LegacyDocEngineC1.tsx |  |
| singleFontCache | Tp | 17139 | LegacyDocEngineC1.tsx |  |
| tabPlaceholderSpaces | jp | 17233 | LegacyDocEngineC1.tsx |  |
| paragraphLayoutText | Mp | 17248 | LegacyDocEngineC1.tsx |  |
| splitParagraphByLineBreaks | Np | 17330 | LegacyDocEngineC1.tsx |  |
| splitPartContentHeight | Pp | 17373 | LegacyDocEngineC1.tsx |  |
| fitSplitPartsHeight | Fp | 17380 | LegacyDocEngineC1.tsx |  |
| layoutTextFragments | zp | 17418 | LegacyDocEngineC1.tsx |  |
| singleFontOfLayoutText | Bp | 17440 | LegacyDocEngineC1.tsx |  |
| fragmentsForRuns | Vp | 17465 | LegacyDocEngineC1.tsx |  |
| paragraphLineLayout | Hp | 17480 | LegacyDocEngineC1.tsx |  |
| pageBreakHintMap | Gm | 18049 | LegacyDocEngineC1.tsx |  |
| paragraphIsKeepNextCandidate | Km | 18055 | LegacyDocEngineC1.tsx |  |
| keepNextChainFitsPageTail | qm | 18058 | LegacyDocEngineC1.tsx |  |
| paragraphDominantFontSizePt | Jm | 18088 | LegacyDocEngineC1.tsx |  |
| spacingBeforeForPagination | _m | 17851 | LegacyDocEngineC1.tsx |  |
| spacingAfterForPagination | gm | 17846 | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | ry |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | iy |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | ay |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | fb |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | bb |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | gb |  | LegacyDocEngineC1.tsx |  |
| 局部克隆 cloneBordersLocal 等（正式实体在 C2，高） | mb |  | LegacyDocEngineC1.tsx |  |
| paragraphFontSizePx | Ym | 18106 | LegacyDocEngineC1.tsx |  |
| paragraphMaxFontPx | Xm | 18113 | LegacyDocEngineC1.tsx |  |
| firstFontFamilyName | Zm | 18121 | LegacyDocEngineC1.tsx |  |
| paragraphDefaultFontFamily | Qm | 18124 | LegacyDocEngineC1.tsx |  |
| denseLineFactorForFont | $m | 18148 | LegacyDocEngineC1.tsx |  |
| looseLineFactorForFont | eh | 18154 | LegacyDocEngineC1.tsx |  |
| paragraphIsCjkLike | th | 18158 | LegacyDocEngineC1.tsx |  |
| lineSpacingFactorFor | nh | 18161 | LegacyDocEngineC1.tsx |  |
| paragraphHasHardLineBreak | rh | 18166 | LegacyDocEngineC1.tsx |  |
| charClassWidthFactor | ih | 18168 | LegacyDocEngineC1.tsx |  |
| heuristicCharClassWidth | ah | 18171 | LegacyDocEngineC1.tsx |  |
| runFontPx | oh | 18175 | LegacyDocEngineC1.tsx |  |
| fontStringOf | sh | 18180 | LegacyDocEngineC1.tsx |  |
| runFontString | ch | 18183 | LegacyDocEngineC1.tsx |  |
| splitTextByFont | lh | 18185 | LegacyDocEngineC1.tsx |  |
| measureTextWidth | uh | 18192 | LegacyDocEngineC1.tsx |  |
| paragraphTabStopsPx | dh | 18214 | LegacyDocEngineC1.tsx |  |
| paragraphIndentStartPx | fh | 18217 | LegacyDocEngineC1.tsx |  |
| leftTabStopsAfterIndent | ph | 18224 | LegacyDocEngineC1.tsx |  |
| nextTabStopAfter | mh | 18228 | LegacyDocEngineC1.tsx |  |
| expandTabsToSpaces | hh | 18233 | LegacyDocEngineC1.tsx |  |
| segmentsWidthPx | gh | 18235 | LegacyDocEngineC1.tsx |  |
| greedyLineCount | _h | 18241 | LegacyDocEngineC1.tsx |  |
| paragraphTabSegments | vh | 18274 | LegacyDocEngineC1.tsx |  |
| splitTabSegments | yh | 18295 | LegacyDocEngineC1.tsx |  |
| tocTabLineCount | bh | 18322 | LegacyDocEngineC1.tsx |  |
| lineCountCache | xh | 18343 | LegacyDocEngineC1.tsx |  |
| lineCountCacheGet | Sh | 18345 | LegacyDocEngineC1.tsx |  |
| lineCountCacheSet | Ch | 18347 | LegacyDocEngineC1.tsx |  |
| paragraphLineCount | wh | 18352 | LegacyDocEngineC1.tsx |  |
| paragraphContentWidth | Th | 18440 | LegacyDocEngineC1.tsx |  |
| paragraphEstimatedLineCount | Eh | 18454 | LegacyDocEngineC1.tsx |  |
| wrappedImageFootprintHeight | Dh | 18466 | LegacyDocEngineC1.tsx |  |
| layoutBottomPx | Oh | 18479 | LegacyDocEngineC1.tsx |  |
| layoutHasFullWidthExclusion | kh | 18484 | LegacyDocEngineC1.tsx |  |
| layoutHeightPx | Ah | 18493 | LegacyDocEngineC1.tsx |  |
| layoutRangeHeightPx | jh | 18496 | LegacyDocEngineC1.tsx |  |
| layoutFitLineEnd | Mh | 18505 | LegacyDocEngineC1.tsx |  |
| lineTwipsToMultiple | Nh | 18523 | LegacyDocEngineC1.tsx |  |
| doubleLineBlend | Ph | 18525 | LegacyDocEngineC1.tsx |  |
| lineHeightFromMultiple | Fh | 18532 | LegacyDocEngineC1.tsx |  |
| snapToGridModeOf | Ih | 18536 | LegacyDocEngineC1.tsx |  |
| gridSnapHeight | Lh | 18548 | LegacyDocEngineC1.tsx |  |
| paragraphLineHeight | Rh | 18553 | LegacyDocEngineC1.tsx |  |
| paragraphOuterHeight | zh | 18572 | LegacyDocEngineC1.tsx |  |
| xmlHasSpacingBefore | Bh | 18602 | LegacyDocEngineC1.tsx |  |
| xmlHasParagraphSpacing | Vh | 18608 | LegacyDocEngineC1.tsx |  |
| applyDefaultSpacingForGrid | Hh | 18614 | LegacyDocEngineC1.tsx |  |
| spacingBeforeAbsent | Uh | 18630 | LegacyDocEngineC1.tsx |  |
| estimateCellContentHeight | Wh | 18635 | LegacyDocEngineC1.tsx |  |
| rowIsSplittable | Gh | 18673 | LegacyDocEngineC1.tsx |  |
| rowNeedsHeightEstimation | Kh | 18676 | LegacyDocEngineC1.tsx |  |
| rowHasNestedTable | qh | 18686 | LegacyDocEngineC1.tsx |  |
| rowHeightWithCaps | Jh | 18689 | LegacyDocEngineC1.tsx |  |
| tableStyleIdOf | Yh | 18699 | LegacyDocEngineC1.tsx |  |
| tableHasVisibleBorders | Xh | 18703 | LegacyDocEngineC1.tsx |  |
| tableHasUnspacedParagraphs | Zh | 18707 | LegacyDocEngineC1.tsx |  |
| tableIsTableGrid | Qh | 18710 | LegacyDocEngineC1.tsx |  |
| tableRowHeights | $h | 18713 | LegacyDocEngineC1.tsx |  |
| computeTableRowHeights | eg | 18729 | LegacyDocEngineC1.tsx |  |
| tableRowStyle | tg | 18759 | LegacyDocEngineC1.tsx |  |
| dedupeSafeBoundaries | ng | 18766 | LegacyDocEngineC1.tsx |  |
| paragraphSafeLayout | rg | 18776 | LegacyDocEngineC1.tsx |  |
| tableSafeLayout | ig | 18803 | LegacyDocEngineC1.tsx |  |
| cellSafeBoundaries | ag | 18812 | LegacyDocEngineC1.tsx |  |
| boundaryIsSafe | og | 18840 | LegacyDocEngineC1.tsx |  |
| tableRowSliceFitHeight | sg | 18844 | LegacyDocEngineC1.tsx |  |
| tableOuterHeightPx | cg | 18899 | LegacyDocEngineC1.tsx |  |
| estimateNodeHeight | lg | 18915 | LegacyDocEngineC1.tsx |  |
| paragraphSpacingBeforeRaw | ug | 18918 | LegacyDocEngineC1.tsx |  |
| paragraphSpacingAfterRaw | dg | 18921 | LegacyDocEngineC1.tsx |  |
| widowControlEnabled | fg | 18924 | LegacyDocEngineC1.tsx |  |
| isPlainPageBreakSpacer | pg | 18926 | LegacyDocEngineC1.tsx |  |
| spacingBeforeAfterPageBreak | mg | 18929 | LegacyDocEngineC1.tsx |  |
| paragraphCanSplitLines | hg | 18935 | LegacyDocEngineC1.tsx |  |
| lineRangeIsPartial | gg | 18939 | LegacyDocEngineC1.tsx |  |
| lineRangeForBand | _g | 18942 | LegacyDocEngineC1.tsx |  |
| segmentRenderBottomPx | vg | 18957 | LegacyDocEngineC1.tsx |  |
| segmentCoversWholeParagraph | yg | 18961 | LegacyDocEngineC1.tsx |  |
| splitEdgePadding | bg | 18964 | LegacyDocEngineC1.tsx |  |
| splitEdgeSmoothingPadding | xg | 18974 | LegacyDocEngineC1.tsx |  |
| splitSegmentExtraHeight | Sg | 18987 | LegacyDocEngineC1.tsx |  |
| splitSegmentSmoothingExtraHeight | Cg | 18994 | LegacyDocEngineC1.tsx |  |
| segmentMatchesLineRange | wg | 19000 | LegacyDocEngineC1.tsx |  |
| nodeLayoutHeight | Tg | 19003 | LegacyDocEngineC1.tsx |  |
| resolveParagraphLineRange | Eg | 19025 | LegacyDocEngineC1.tsx |  |
| trySplitParagraphSegment | Dg | 19045 | LegacyDocEngineC1.tsx |  |
| distributeSegmentsAcrossPages | Og | 19092 | LegacyDocEngineC1.tsx |  |
| rowRangeHeight | kg | 19155 | LegacyDocEngineC1.tsx |  |
| fitRowsWithin | Ag | 19162 | LegacyDocEngineC1.tsx |  |
| paginateByBreakHints | jg | 19173 | LegacyDocEngineC1.tsx |  |
| paginateDocument | Mg | 19190-19541 | LegacyDocEngineC1.tsx |  |
| isInlineImageNode | Ng | 19542 | LegacyDocEngineC1.tsx |  |
| isPageMarginCornerAnchoredFloating | Fg | 19555 | LegacyDocEngineC1.tsx |  |
| isFloatingImageNode | Kg | 19817 | LegacyDocEngineC1.tsx |  |
| tocLevelOf | w_ | 20231 | LegacyDocEngineC1.tsx |  |
| isTocParagraph | T_ | 20241 | LegacyDocEngineC1.tsx |  |
| paragraphHasTocTab | E_ | 20242 | LegacyDocEngineC1.tsx |  |
| tocTabStopOf | D_ | 20245 | LegacyDocEngineC1.tsx |  |
| tocFirstTabStopPx | O_ | 20254 | LegacyDocEngineC1.tsx |  |
| paragraphHasTabChar | k_ | 20257 | LegacyDocEngineC1.tsx |  |
| countTabChars | A_ | 20260 | LegacyDocEngineC1.tsx |  |
| tabLayoutKindOf | j_ | 20269 | LegacyDocEngineC1.tsx |  |
| tabStopByAlignment | M_ | 20279 | LegacyDocEngineC1.tsx |  |
| decodeXmlEntities | N_ | 20282 | LegacyDocEngineC1.tsx |  |
| matchXmlRegions | P_ | 20291 | LegacyDocEngineC1.tsx |  |
| revisionKindOfTag | F_ | 20329 | LegacyDocEngineC1.tsx |  |
| normalizeWhitespace | I_ | 20341 | LegacyDocEngineC1.tsx |  |
| formatRevisionDateUtc | L_ | 20346 | LegacyDocEngineC1.tsx |  |
| stripTextBoxContentXml | R_ | 20357 | LegacyDocEngineC1.tsx |  |
| extractRunTextSegments | z_ | 20361 | LegacyDocEngineC1.tsx |  |
| xmlFlagEnabled | B_ | 20402 | LegacyDocEngineC1.tsx |  |
| xmlColorAttr | V_ | 20407 | LegacyDocEngineC1.tsx |  |
| parseRunStyleXml | H_ | 20413 | LegacyDocEngineC1.tsx |  |
| extractXmlRegionContents | U_ | 20451 | LegacyDocEngineC1.tsx |  |
| mergeRunStyles | W_ | 20454 | LegacyDocEngineC1.tsx |  |
| parseParagraphAlign | G_ | 20469 | LegacyDocEngineC1.tsx |  |
| escapeXmlAttrValue | K_ | 20474 | LegacyDocEngineC1.tsx |  |
| svgDataUrl | q_ | 20477 | LegacyDocEngineC1.tsx |  |
| emuToPxRounded | J_ | 20479 | LegacyDocEngineC1.tsx |  |
| resolveFieldDisplayText | Y_ | 20482 | LegacyDocEngineC1.tsx |  |
| parseTextBoxLines | X_ | 20504 | LegacyDocEngineC1.tsx |  |
| parseTextBoxShapeStyle | Z_ | 20574 | LegacyDocEngineC1.tsx |  |
| textBoxPlainText | Q_ | 20594 | LegacyDocEngineC1.tsx |  |
| textBoxRenderLines | $_ | 20600 | LegacyDocEngineC1.tsx |  |
| textBoxZIndex | ev | 20621 | LegacyDocEngineC1.tsx |  |
| renderTextBoxSvg | tv | 20625 | LegacyDocEngineC1.tsx |  |
| syntheticTextBoxIsGraphicShape | nv | 20674 | LegacyDocEngineC1.tsx |  |
| parseShapeTransformXml | rv | 20679 | LegacyDocEngineC1.tsx |  |
| joinCssTransforms | iv | 20695 | LegacyDocEngineC1.tsx |  |
| shapeTransformCss | av | 20699 | LegacyDocEngineC1.tsx |  |
| isTopAnchoredFloating | ov | 20726 | LegacyDocEngineC1.tsx |  |
| describeFormattingList | sv | 20729 | LegacyDocEngineC1.tsx |  |
| describeRunFormattingXml | cv | 20732 | LegacyDocEngineC1.tsx |  |
| describeParagraphFormattingXml | lv | 20736 | LegacyDocEngineC1.tsx |  |
| describeTableFormattingXml | uv | 20740 | LegacyDocEngineC1.tsx |  |
| parseParagraphRevisions | dv | 20746 | LegacyDocEngineC1.tsx |  |
| parseParagraphCommentRanges | fv | 20863 | LegacyDocEngineC1.tsx |  |
| pageFieldKindOfInstruction | pv | 20913 | LegacyDocEngineC1.tsx |  |
| styleRefTargetOfInstruction | mv | 20920 | LegacyDocEngineC1.tsx |  |
| paragraphPageFieldKinds | hv | 20930 | LegacyDocEngineC1.tsx |  |

## 49. B5 · LegacyDocEngineC2.tsx（legacy-doc 内部引擎 C 下）

- 族/来源：legacy-doc 族 · 源 chunk `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` · B5-08。行号口径：jsx 还原孪生行。
- 符号条数：206（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| pageFieldResultsCache | gv | 20944 | LegacyDocEngineC2.tsx |  |
| paragraphPageFieldResults | _v | 20945 | LegacyDocEngineC2.tsx |  |
| styleRefFieldResultsCache | vv | 20998 | LegacyDocEngineC2.tsx |  |
| paragraphStyleRefFieldResults | yv | 20999 | LegacyDocEngineC2.tsx |  |
| normalizeStyleName | bv | 21052 | LegacyDocEngineC2.tsx |  |
| tocFieldFallback | xv | 21055 | LegacyDocEngineC2.tsx |  |
| leaderBackgroundStyle | Sv | 21074 | LegacyDocEngineC2.tsx |  |
| noteReferenceMark | Cv | 21094 | LegacyDocEngineC2.tsx |  |
| normalizeDateToIso | wv | 21104 | LegacyDocEngineC2.tsx |  |
| renderParagraphRuns | Tv | 21113-21684 | LegacyDocEngineC2.tsx |  |
| romanNumeralOf | Ev | 21685 | LegacyDocEngineC2.tsx |  |
| letterOrdinalOf | Dv | 21693 | LegacyDocEngineC2.tsx |  |
| numberInFormat | Ov | 21703 | LegacyDocEngineC2.tsx |  |
| formatPageNumber | kv | 21728 | LegacyDocEngineC2.tsx |  |
| numberingLevelOf | Av | 21732 | LegacyDocEngineC2.tsx |  |
| numberingLevelHasVisibleBullet | jv | 21736 | LegacyDocEngineC2.tsx |  |
| numberingLevelIsBullet | Mv | 21739 | LegacyDocEngineC2.tsx |  |
| numberingLevelsOf | Nv | 21742 | LegacyDocEngineC2.tsx |  |
| effectiveNumIdOfParagraph | Pv | 21746 | LegacyDocEngineC2.tsx |  |
| numberingLevelStart | Fv | 21771 | LegacyDocEngineC2.tsx |  |
| numberingSuffixText | Iv | 21777 | LegacyDocEngineC2.tsx |  |
| BULLET_GLYPH_REPLACEMENTS | Lv | 21780 | LegacyDocEngineC2.tsx |  |
| replaceBulletGlyphs | Rv | 21785 | LegacyDocEngineC2.tsx |  |
| numberingLabelsForModel | zv | 21792 | LegacyDocEngineC2.tsx |  |
| UNORDERED_BULLET_PREFIX_REGEX | Bv | 21878 | LegacyDocEngineC2.tsx |  |
| ORDERED_DOT_PREFIX_REGEX | Vv | 21878 | LegacyDocEngineC2.tsx |  |
| ANY_LIST_PREFIX_REGEX | Hv | 21878 | LegacyDocEngineC2.tsx |  |
| ORDERED_PREFIX_REGEX | Uv | 21878 | LegacyDocEngineC2.tsx |  |
| LIST_INDENT_TWIPS=720 | Wv | 21878 | LegacyDocEngineC2.tsx |  |
| LIST_HANGING_TWIPS=360 | Gv | 21878 | LegacyDocEngineC2.tsx |  |
| MAX_NUMBERING_DEPTH_DEFAULT=8 | Kv | 21878 | LegacyDocEngineC2.tsx |  |
| looksUnordered | qv | 21885 | LegacyDocEngineC2.tsx |  |
| looksOrdered | Jv | 21888 | LegacyDocEngineC2.tsx |  |
| textIsBulletGlyphs | Yv | 21891 | LegacyDocEngineC2.tsx |  |
| paragraphHasNumbering | Xv | 21895 | LegacyDocEngineC2.tsx |  |
| numberingKindOf | Zv | 21898 | LegacyDocEngineC2.tsx |  |
| isNumberedParagraph | Qv | 21913 | LegacyDocEngineC2.tsx |  |
| stripListPrefix | $v | 21917 | LegacyDocEngineC2.tsx |  |
| listPrefixLength | ey | 21920 | LegacyDocEngineC2.tsx |  |
| orderedSuccessor | ty | 21922 | LegacyDocEngineC2.tsx |  |
| applyListPrefix | ny | 21928 | LegacyDocEngineC2.tsx |  |
| cloneBorderSide | ry | 21933 | LegacyDocEngineC2.tsx |  |
| cloneParagraphBorders | iy | 21938 | LegacyDocEngineC2.tsx |  |
| cloneParagraphStyle | ay | 21948 | LegacyDocEngineC2.tsx |  |
| cloneParagraphStyleWithDefaultSpacing | oy | 21969 | LegacyDocEngineC2.tsx |  |
| cloneMarginTwips | sy | 21983 | LegacyDocEngineC2.tsx |  |
| cloneTableBorderSide | cy | 21991 | LegacyDocEngineC2.tsx |  |
| cloneTableBorders | ly | 21998 | LegacyDocEngineC2.tsx |  |
| cloneCellStyle | uy | 22011 | LegacyDocEngineC2.tsx |  |
| cloneRowStyle | dy | 22018 | LegacyDocEngineC2.tsx |  |
| emptyParagraph | fy | 22024 | LegacyDocEngineC2.tsx |  |
| cloneCell | py | 22037 | LegacyDocEngineC2.tsx |  |
| maxNumberingDepth | my | 22048 | LegacyDocEngineC2.tsx |  |
| shiftIndent | hy | 22057 | LegacyDocEngineC2.tsx |  |
| applyListIndent | gy | 22066 | LegacyDocEngineC2.tsx |  |
| removeListIndent | _y | 22081 | LegacyDocEngineC2.tsx |  |
| cellParagraphsSignature | vy | 22099 | LegacyDocEngineC2.tsx |  |
| tableMaxColumnCount | yy | 22103 | LegacyDocEngineC2.tsx |  |
| floatingTableSide | by | 22106 | LegacyDocEngineC2.tsx |  |
| floatingTableWidthPx | xy | 22112 | LegacyDocEngineC2.tsx |  |
| floatingTableLayout | Sy | 22118 | LegacyDocEngineC2.tsx |  |
| floatingTableStyle | Cy | 22150 | LegacyDocEngineC2.tsx |  |
| locateNestedTable | wy | 22173 | LegacyDocEngineC2.tsx |  |
| tableGridWidthsCache | Ty | 22207 | LegacyDocEngineC2.tsx |  |
| tableGridWidthsCached | Ey | 22208 | LegacyDocEngineC2.tsx |  |
| tableGridWidthsTwips | Dy | 22215 | LegacyDocEngineC2.tsx |  |
| gridWidthsDivergeFromCells | Oy | 22222 | LegacyDocEngineC2.tsx |  |
| gridWidthsFromCellWidths | ky | 22240 | LegacyDocEngineC2.tsx |  |
| normalizeGridWidthsTwips | Ay | 22266 | LegacyDocEngineC2.tsx |  |
| normalizeGridWidthsPx | jy | 22276 | LegacyDocEngineC2.tsx |  |
| evenGridWidthsPx | My | 22285 | LegacyDocEngineC2.tsx |  |
| clampTableContentWidthPx | Ny | 22291 | LegacyDocEngineC2.tsx |  |
| scaleGridWidthsToPx | Py | 22294 | LegacyDocEngineC2.tsx |  |
| rowColumnSpanCount | Fy | 22336 | LegacyDocEngineC2.tsx |  |
| effectiveColumnWidthsPx | Iy | 22339 | LegacyDocEngineC2.tsx |  |
| cellMarginsPx | Ly | 22378 | LegacyDocEngineC2.tsx |  |
| cellPaddingStyle | Ry | 22385 | LegacyDocEngineC2.tsx |  |
| effectiveCellMarginTwips | zy | 22400 | LegacyDocEngineC2.tsx |  |
| diagonalBordersBackground | db | 22884 | LegacyDocEngineC2.tsx |  |
| borderTypeNormalized | By | 22408 | LegacyDocEngineC2.tsx |  |
| borderSideCss | Vy | 22411 | LegacyDocEngineC2.tsx |  |
| borderSideWidthPx | Hy | 22421 | LegacyDocEngineC2.tsx |  |
| borderTypeVisible | Uy | 22427 | LegacyDocEngineC2.tsx |  |
| paragraphBorderVisible | Wy | 22431 | LegacyDocEngineC2.tsx |  |
| tableBorderVisible | Gy | 22434 | LegacyDocEngineC2.tsx |  |
| cellBordersVisible | Ky | 22437 | LegacyDocEngineC2.tsx |  |
| tableUsesCellBorders | qy | 22440 | LegacyDocEngineC2.tsx |  |
| tableBorderSpacingPx | Jy | 22446 | LegacyDocEngineC2.tsx |  |
| tableBorderCollapseStyle | Yy | 22451 | LegacyDocEngineC2.tsx |  |
| firstParagraphBorder | Xy | 22458 | LegacyDocEngineC2.tsx |  |
| firstTableBorder | Zy | 22461 | LegacyDocEngineC2.tsx |  |
| normalizeParagraphBorderSpec | Qy | 22464 | LegacyDocEngineC2.tsx |  |
| normalizeTableBorderSpec | $y | 22472 | LegacyDocEngineC2.tsx |  |
| nilParagraphBorder | eb | 22481 | LegacyDocEngineC2.tsx |  |
| nilTableBorder | tb | 22486 | LegacyDocEngineC2.tsx |  |
| paragraphBorderPresets | nb | 22491 | LegacyDocEngineC2.tsx |  |
| paragraphsMatchBorderPreset | rb | 22514 | LegacyDocEngineC2.tsx |  |
| toggleTableCellBorder | ib | 22553 | LegacyDocEngineC2.tsx |  |
| tableBorderPresets | ab | 22619 | LegacyDocEngineC2.tsx |  |
| toggleParagraphBorder | ob | 22644 | LegacyDocEngineC2.tsx |  |
| toggleTableBorder | sb | 22727 | LegacyDocEngineC2.tsx |  |
| cellBorderForSide | cb | 22839 | LegacyDocEngineC2.tsx |  |
| cellBorderCss | lb | 22848 | LegacyDocEngineC2.tsx |  |
| tableOuterBorderWidthPx | ub | 22868 | LegacyDocEngineC2.tsx |  |
| cloneRunStyle | fb | 22901 | LegacyDocEngineC2.tsx |  |
| withFontFamily | pb | 22906 | LegacyDocEngineC2.tsx |  |
| cloneFormFieldWidget | mb | 22913 | LegacyDocEngineC2.tsx |  |
| mergeFormFieldWidget | hb | 22934 | LegacyDocEngineC2.tsx |  |
| cloneFormField | gb | 22970 | LegacyDocEngineC2.tsx |  |
| sameJson | _b | 22993 | LegacyDocEngineC2.tsx |  |
| normalizeParagraphChildren | vb | 22996 | LegacyDocEngineC2.tsx |  |
| paragraphChildrenAllText | yb | 23027 | LegacyDocEngineC2.tsx |  |
| cloneTextNode | bb | 23030 | LegacyDocEngineC2.tsx |  |
| splitChildrenAt | xb | 23041 | LegacyDocEngineC2.tsx |  |
| runStyleAt | Sb | 23074 | LegacyDocEngineC2.tsx |  |
| linkFrom | Cb | 23088 | LegacyDocEngineC2.tsx |  |
| linkWithin | wb | 23102 | LegacyDocEngineC2.tsx |  |
| expandLinkAt | Tb | 23122 | LegacyDocEngineC2.tsx |  |
| applyRunStyleToRange | Eb | 23154 | LegacyDocEngineC2.tsx |  |
| applyLinkToRange | Db | 23216 | LegacyDocEngineC2.tsx |  |
| bytesToBase64Inline | Ob | 23278 | LegacyDocEngineC2.tsx |  |
| selectionCoversCell | kb | 23288 | LegacyDocEngineC2.tsx |  |
| locationKeyContract | Ab | 23291 | LegacyDocEngineC2.tsx |  |
| imageLocationKeyContract | jb | 23294 | LegacyDocEngineC2.tsx |  |
| childLocationKey | Mb | 23297 | LegacyDocEngineC2.tsx |  |
| locationFromDataset | Nb | 23300 | LegacyDocEngineC2.tsx |  |
| firstTableCellLocation | Pb | 23328 | LegacyDocEngineC2.tsx |  |
| tableFormattingRevisions | Fb | 23342 | LegacyDocEngineC2.tsx |  |
| extractTrackedChanges | Ib | 23379 | LegacyDocEngineC2.tsx |  |
| xmlTextPreview | Lb | 23454 | LegacyDocEngineC2.tsx |  |
| commentAnchorText | Rb | 23460 | LegacyDocEngineC2.tsx |  |
| extractComments | zb | 23468 | LegacyDocEngineC2.tsx |  |
| colorWithAlpha | Bb | 23537 | LegacyDocEngineC2.tsx |  |
| annotationColorFor | Vb | 23541 | LegacyDocEngineC2.tsx |  |
| commentHighlightStyle | Hb | 23550 | LegacyDocEngineC2.tsx |  |
| commentCardHeight | Ub | 23557 | LegacyDocEngineC2.tsx |  |
| trackedChangeKindLabel | Wb | 23562 | LegacyDocEngineC2.tsx |  |
| trackedChangeColor | Gb | 23580 | LegacyDocEngineC2.tsx |  |
| trackedChangeIsAnnotatable | Kb | 23610 | LegacyDocEngineC2.tsx |  |
| locationSortVector | qb | 23613 | LegacyDocEngineC2.tsx |  |
| locationInPages | Jb | 23616 | LegacyDocEngineC2.tsx |  |
| pageIndexForLocation | Yb | 23619 | LegacyDocEngineC2.tsx |  |
| locationElement | Xb | 23623 | LegacyDocEngineC2.tsx |  |
| annotationAnchorRect | Zb | 23626 | LegacyDocEngineC2.tsx |  |
| elementWithClassToken | Qb | 23644 | LegacyDocEngineC2.tsx |  |
| annotationLocationElement | $b | 23652 | LegacyDocEngineC2.tsx |  |
| elementByDataAttr | ex | 23655 | LegacyDocEngineC2.tsx |  |
| annotationAnchorElement | tx | 23663 | LegacyDocEngineC2.tsx |  |
| trackedChangeCardHeight | nx | 23679 | LegacyDocEngineC2.tsx |  |
| assignConnectorLanes | rx | 23684 | LegacyDocEngineC2.tsx |  |
| layoutGutterAnnotations | ix | 23712 | LegacyDocEngineC2.tsx |  |
| sameLocation | ax | 23754 | LegacyDocEngineC2.tsx |  |
| firstEditableCellLocation | ox | 23757 | LegacyDocEngineC2.tsx |  |
| lastEditableCellLocation | sx | 23773 | LegacyDocEngineC2.tsx |  |
| locationNodeIndex | cx | 23791 | LegacyDocEngineC2.tsx |  |
| shiftLocationAfterTableRemoval | lx | 23794 | LegacyDocEngineC2.tsx |  |
| tableFullTextRange | ux | 23813 | LegacyDocEngineC2.tsx |  |
| emptiedTableIndexes | dx | 23830 | LegacyDocEngineC2.tsx |  |
| firstLocationOfNode | fx | 23847 | LegacyDocEngineC2.tsx |  |
| previousEditableParagraphLocation | px | 23854 | LegacyDocEngineC2.tsx |  |
| nextEditableParagraphLocation | mx | 23861 | LegacyDocEngineC2.tsx |  |
| firstEditableLocation | hx | 23899 | LegacyDocEngineC2.tsx |  |
| lastLocation | gx | 23905 | LegacyDocEngineC2.tsx |  |
| enumerateRangeLocations | _x | 23931 | LegacyDocEngineC2.tsx |  |
| caretOffsetIn | vx | 23941 | LegacyDocEngineC2.tsx |  |
| documentIsSingleParagraph | yx | 23945 | LegacyDocEngineC2.tsx |  |
| rangeOffsetsInParagraph | bx | 23957 | LegacyDocEngineC2.tsx |  |
| cloneLocation | xx | 23965 | LegacyDocEngineC2.tsx |  |
| cloneTextRange | Sx | 23977 | LegacyDocEngineC2.tsx |  |
| cloneSelection | Cx | 23989 | LegacyDocEngineC2.tsx |  |
| sameSelection | wx | 24000 | LegacyDocEngineC2.tsx |  |
| sameTextPosition | Tx | 24006 | LegacyDocEngineC2.tsx |  |
| sameTextRange | Ex | 24009 | LegacyDocEngineC2.tsx |  |
| modelChangedBroadcastable | Dx | 24016 | LegacyDocEngineC2.tsx |  |
| selectionRestoreArbitration | Ox | 24019 | LegacyDocEngineC2.tsx |  |
| htmlInsertionContract | kx | 24022 | LegacyDocEngineC2.tsx |  |
| isCompositionKey | Ax | 24030 | LegacyDocEngineC2.tsx |  |
| isNavigationOrEditKey | jx | 24033 | LegacyDocEngineC2.tsx |  |
| caretBeforeBlockText | Mx | 24042 | LegacyDocEngineC2.tsx |  |
| caretXOutOfRange | Nx | 24053 | LegacyDocEngineC2.tsx |  |
| paragraphLocationOfImage | Px | 24056 | LegacyDocEngineC2.tsx |  |
| resolveLocation | Fx | 24068 | LegacyDocEngineC2.tsx |  |
| locationFirstParagraph | Ix | 24085 | LegacyDocEngineC2.tsx |  |
| toMutableLocation | Lx | 24097 | LegacyDocEngineC2.tsx |  |
| locationBase | Rx | 24108 | LegacyDocEngineC2.tsx |  |
| locationFor | zx | 24120 | LegacyDocEngineC2.tsx |  |
| selectionRunStyle | Bx | 24124 | LegacyDocEngineC2.tsx |  |
| nearestEditableLocation | Vx | 24133 | LegacyDocEngineC2.tsx |  |
| normalizeRangeToEditable | Hx | 24172 | LegacyDocEngineC2.tsx |  |
| selectionFromLocation | Ux | 24191 | LegacyDocEngineC2.tsx |  |
| normalizeCursorState | Wx | 24198 | LegacyDocEngineC2.tsx |  |
| editorReducer | Gx | 24208 | LegacyDocEngineC2.tsx |  |
| replaceTextAtLocation | Kx | 24217 | LegacyDocEngineC2.tsx |  |
| sectionParagraphDraftKey | qx | 24220 | LegacyDocEngineC2.tsx |  |
| sectionImageKey | Jx | 24230 | LegacyDocEngineC2.tsx |  |
| cellParagraphDraftKey | Yx | 24241 | LegacyDocEngineC2.tsx |  |
| parseSectionDraftKey | Xx | 24244 | LegacyDocEngineC2.tsx |  |
| sectionNodeTextAt | Zx | 24263 | LegacyDocEngineC2.tsx |  |
| sectionParagraphAt | Qx | 24274 | LegacyDocEngineC2.tsx |  |
| replaceSectionParagraphText | $x | 24290 | LegacyDocEngineC2.tsx |  |
| moveSectionFloatingImage | eS | 24313 | LegacyDocEngineC2.tsx |  |
| floatingWrapSide | Ig | 19564 | LegacyDocEngineC2.tsx |  |
| floatingWrapStyle | Lg | 19576 | LegacyDocEngineC2.tsx |  |
| floatingAbsoluteStyle | Rg | 19649 | LegacyDocEngineC2.tsx |  |
| behindDocImageFrameSize | Gg | 19788 | LegacyDocEngineC2.tsx |  |
| imageIsPageAnchoredFloating | Jg | 19829 | LegacyDocEngineC2.tsx |  |

## 50. B5 · LegacyDocEngineC3.tsx（legacy-doc [E7] 交互回调簇前半（jsx 27889–31873））

- 族/来源：legacy-doc 族 · 源 chunk `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` · B5-09。行号口径：jsx 还原孪生行。
- 符号条数：175（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| firstPageIndexByNodeIndex | ir | 27889 | LegacyDocEngineC3.tsx |  |
| declaredPageCount | ar | 27893 | LegacyDocEngineC3.tsx |  |
| pageSectionInfoByIndex | or | 27900 | LegacyDocEngineC3.tsx |  |
| pageContentKeys | sr | 27957 | LegacyDocEngineC3.tsx |  |
| pageLayoutSizes | cr | 27966 | LegacyDocEngineC3.tsx |  |
| pageSnapshotBatch | lr | 27971 | LegacyDocEngineC3.tsx |  |
| publishPageSnapshots-effect | aS | 27985 | LegacyDocEngineC3.tsx |  |
| tocStyleFieldResolver | ur | 27988 | LegacyDocEngineC3.tsx |  |
| livePageCount | dr | 28023 | LegacyDocEngineC3.tsx |  |
| heavyTableDocument | fr | 28024 | LegacyDocEngineC3.tsx |  |
| deferredPaintActive | pr | 28040 | LegacyDocEngineC3.tsx |  |
| totalHeightForPageCount | mr | 28041 | LegacyDocEngineC3.tsx |  |
| convergencePageCount | hr | 28070 | LegacyDocEngineC3.tsx |  |
| virtualizationPageCount | gr | 28071 | LegacyDocEngineC3.tsx |  |
| virtualizationTotalHeightPx | _r | 28072 | LegacyDocEngineC3.tsx |  |
| externalRangeProvided | vr | 28073 | LegacyDocEngineC3.tsx |  |
| virtualizationSettled | yr | 28078 | LegacyDocEngineC3.tsx |  |
| virtualizationSettled | br | 28078 | LegacyDocEngineC3.tsx |  |
| resolvedScrollElement | xr | 28079 | LegacyDocEngineC3.tsx |  |
| resolvedScrollElement | Sr | 28079 | LegacyDocEngineC3.tsx |  |
| resolvedZoomScale | Cr | 28080 | LegacyDocEngineC3.tsx |  |
| resolvedZoomScale | wr | 28080 | LegacyDocEngineC3.tsx |  |
| pendingVisibleRange | Tr | 28081 | LegacyDocEngineC3.tsx |  |
| pendingVisibleRange | Er | 28081 | LegacyDocEngineC3.tsx |  |
| settleDelayMs | Dr | 28082 | LegacyDocEngineC3.tsx |  |
| overscanPx | Or | 28083 | LegacyDocEngineC3.tsx |  |
| effectiveOverscan | kr | 28084 | LegacyDocEngineC3.tsx |  |
| webdriverDetected | Ar | 28085 | LegacyDocEngineC3.tsx |  |
| virtualizationEnabled | jr | 28086 | LegacyDocEngineC3.tsx |  |
| scrollElementProp | Mr | 28087 | LegacyDocEngineC3.tsx |  |
| zoomScaleProp | Nr | 28088 | LegacyDocEngineC3.tsx |  |
| resolveZoomScale | Fr | 28089 | LegacyDocEngineC3.tsx |  |
| viewportSizeEpoch | Ir | 28182 | LegacyDocEngineC3.tsx |  |
| viewportSizeEpoch | Lr | 28182 | LegacyDocEngineC3.tsx |  |
| virtualizerActive | Rr | 28203 | LegacyDocEngineC3.tsx |  |
| windowScrollPending | Vr | 28204 | LegacyDocEngineC3.tsx |  |
| scrollElementIsDocument | Hr | 28205 | LegacyDocEngineC3.tsx |  |
| virtualizerInContainer | Ur | 28206 | LegacyDocEngineC3.tsx |  |
| virtualizerInWindow | Wr | 28207 | LegacyDocEngineC3.tsx |  |
| estimatePageSize | Gr | 28208 | LegacyDocEngineC3.tsx |  |
| markPaginationThrottle | Kr | 28211 | LegacyDocEngineC3.tsx |  |
| containerVirtualizer | qr | 28213 | LegacyDocEngineC3.tsx |  |
| windowVirtualizer | Xr | 28219 | LegacyDocEngineC3.tsx |  |
| activeVirtualizer | Zr | 28225 | LegacyDocEngineC3.tsx |  |
| virtualItems | Qr | 28231 | LegacyDocEngineC3.tsx |  |
| anchorPageIndex | $r | 28232 | LegacyDocEngineC3.tsx |  |
| virtualVisibleRange | ei | 28248 | LegacyDocEngineC3.tsx |  |
| overscannedVisibleRange | ti | 28268 | LegacyDocEngineC3.tsx |  |
| manualWindowActive | ni | 28282 | LegacyDocEngineC3.tsx |  |
| mergedVisibleRange | ri | 28354 | LegacyDocEngineC3.tsx |  |
| effectiveVisibleRange | ii | 28359 | LegacyDocEngineC3.tsx |  |
| clampedVisibleRange | ai | 28361 | LegacyDocEngineC3.tsx |  |
| renderWindowStart | oi | 28378 | LegacyDocEngineC3.tsx |  |
| initialRenderSpan | si | 28379 | LegacyDocEngineC3.tsx |  |
| renderWindowEnd | ci | 28380 | LegacyDocEngineC3.tsx |  |
| deferredFullWindow | di | 28381 | LegacyDocEngineC3.tsx |  |
| firstRenderedPage | fi | 28382 | LegacyDocEngineC3.tsx |  |
| lastRenderedPage | pi | 28383 | LegacyDocEngineC3.tsx |  |
| renderedPageIndexes | mi | 28384 | LegacyDocEngineC3.tsx |  |
| pageWindowSpacers | hi | 28390 | LegacyDocEngineC3.tsx |  |
| visibleTableRowIndexes | gi | 28423 | LegacyDocEngineC3.tsx |  |
| measurementPassActive | yi | 28447 | LegacyDocEngineC3.tsx |  |
| awaitingTableMeasurement | bi | 28448 | LegacyDocEngineC3.tsx |  |
| measurementOverlayPending | xi | 28466 | LegacyDocEngineC3.tsx |  |
| annotationsByPage | Si | 28488 | LegacyDocEngineC3.tsx |  |
| annotationAnchorPoints | Ci | 28516 | LegacyDocEngineC3.tsx |  |
| annotationAnchorPoints | wi | 28516 | LegacyDocEngineC3.tsx |  |
| headerOverlapHeights | Ti | 28517 | LegacyDocEngineC3.tsx |  |
| headerOverlapHeights | Ei | 28517 | LegacyDocEngineC3.tsx |  |
| annotationCardHeights | Di | 28521 | LegacyDocEngineC3.tsx |  |
| annotationCardHeights | Oi | 28521 | LegacyDocEngineC3.tsx |  |
| gutterAnnotationLayouts | ki | 28580 | LegacyDocEngineC3.tsx |  |
| footnotePageNumberBase | Ai | 28585 | LegacyDocEngineC3.tsx |  |
| pageInRenderWindow | ji | 28588 | LegacyDocEngineC3.tsx |  |
| revealPage | Ni | 28589 | LegacyDocEngineC3.tsx |  |
| scrollToBookmark | Pi | 28600 | LegacyDocEngineC3.tsx |  |
| headerFooterNodesByPage | Fi | 28633 | LegacyDocEngineC3.tsx |  |
| estimatedHeaderHeights | Ii | 28655 | LegacyDocEngineC3.tsx |  |
| setTableSelectionAnchor | Li | 28909 | LegacyDocEngineC3.tsx |  |
| clearTableSelection | Ri | 28919 | LegacyDocEngineC3.tsx |  |
| tableHitTest | zi | 28921 | LegacyDocEngineC3.tsx |  |
| nearestTableAtPoint | Bi | 28928 | LegacyDocEngineC3.tsx |  |
| handlePointerMoveCapture | Vi | 28940 | LegacyDocEngineC3.tsx |  |
| handlePointerLeave | Hi | 28946 | LegacyDocEngineC3.tsx |  |
| selectWholeTable | Ui | 28948 | LegacyDocEngineC3.tsx |  |
| computeTableDropTarget | Wi | 28959 | LegacyDocEngineC3.tsx |  |
| beginTableMove | Gi | 28996 | LegacyDocEngineC3.tsx |  |
| closeTableContextMenu | Ki | 29063 | LegacyDocEngineC3.tsx |  |
| closeContextMenu | qi | 29066 | LegacyDocEngineC3.tsx |  |
| openTextContextMenu | Ji | 29069 | LegacyDocEngineC3.tsx |  |
| openTableContextMenu | Yi | 29077 | LegacyDocEngineC3.tsx |  |
| runTableAction | Xi | 29084 | LegacyDocEngineC3.tsx |  |
| tableContextMenuActions | Zi | 29114 | LegacyDocEngineC3.tsx |  |
| resolveTableMenuCell | Qi | 29115 | LegacyDocEngineC3.tsx |  |
| placeCaretInHost | $i | 29166 | LegacyDocEngineC3.tsx |  |
| setTextRangeInElement | ea | 29276 | LegacyDocEngineC3.tsx |  |
| textLengthOfElement | ta | 29310 | LegacyDocEngineC3.tsx |  |
| recordPartialLineSelection | na | 29313 | LegacyDocEngineC3.tsx |  |
| resolveLocationHostElement | ra | 29332 | LegacyDocEngineC3.tsx |  |
| textNodeAtOffset | ia | 29348 | LegacyDocEngineC3.tsx |  |
| paragraphHostAtOffset | aa | 29371 | LegacyDocEngineC3.tsx |  |
| boundaryToDomPoint | oa | 29389 | LegacyDocEngineC3.tsx |  |
| applyDomSelection | sa | 29395 | LegacyDocEngineC3.tsx |  |
| restoreSelectionAfterEdit | ca | 29455 | LegacyDocEngineC3.tsx |  |
| wrappedParagraphHit | la | 29510 | LegacyDocEngineC3.tsx |  |
| selectAllContent | ua | 29523 | LegacyDocEngineC3.tsx |  |
| domPointToBoundary | da | 29540 | LegacyDocEngineC3.tsx |  |
| boundaryAtPoint | fa | 29583 | LegacyDocEngineC3.tsx |  |
| selectionFromDom | pa | 29676 | LegacyDocEngineC3.tsx |  |
| syncActiveTextRangeFromDom | ma | 29690 | LegacyDocEngineC3.tsx |  |
| scheduleSelectionSync | ha | 29715 | LegacyDocEngineC3.tsx |  |
| hasSelectionInside | ga | 29766 | LegacyDocEngineC3.tsx |  |
| restoreCaretAtX | _a | 29773 | LegacyDocEngineC3.tsx |  |
| ensureSelectionAfterTap | va | 29795 | LegacyDocEngineC3.tsx |  |
| cancelPointerSession | ya | 29821 | LegacyDocEngineC3.tsx |  |
| clearTransientSelections | ba | 29824 | LegacyDocEngineC3.tsx |  |
| beginWrappedEditing | xa | 29827 | LegacyDocEngineC3.tsx |  |
| focusWrappedTextarea | Sa | 29862 | LegacyDocEngineC3.tsx |  |
| commitWrappedText | Ca | 29882 | LegacyDocEngineC3.tsx |  |
| focusParagraphNode | wa | 29888 | LegacyDocEngineC3.tsx |  |
| selectDropCap | Ta | 29893 | LegacyDocEngineC3.tsx |  |
| scheduleCollapsedSelectionSync | Ea | 29897 | LegacyDocEngineC3.tsx |  |
| beginTextDragSelection | Da | 30039 | LegacyDocEngineC3.tsx |  |
| tableCellAtPoint | Oa | 30088 | LegacyDocEngineC3.tsx |  |
| beginTableCellDragSelection | ka | 30090 | LegacyDocEngineC3.tsx |  |
| handlePointerDownCapture | Aa | 30143 | LegacyDocEngineC3.tsx |  |
| handleContextMenu | ja | 30161 | LegacyDocEngineC3.tsx |  |
| handleTableSelectionDelete | Ma | 30195 | LegacyDocEngineC3.tsx |  |
| handleKeyDownCapture | Na | 30211 | LegacyDocEngineC3.tsx |  |
| handleKeyUp | Pa | 30252 | LegacyDocEngineC3.tsx |  |
| deleteExpandedSelectionFromKey | Fa | 30255 | LegacyDocEngineC3.tsx |  |
| replaceSelectionWithText | Ia | 30286 | LegacyDocEngineC3.tsx |  |
| contextMenuActionsFor | La | 30306 | LegacyDocEngineC3.tsx |  |
| runContextMenuAction | Ra | 30385 | LegacyDocEngineC3.tsx |  |
| focusParagraphAtOffset | za | 30747 | LegacyDocEngineC3.tsx |  |
| focusTableCellParagraph | Ba | 30776 | LegacyDocEngineC3.tsx |  |
| focusLocationAtOffset | Va | 30789 | LegacyDocEngineC3.tsx |  |
| placeCaretAtPointInLocation | Ha | 30793 | LegacyDocEngineC3.tsx |  |
| focusParagraphEnd | Ua | 30813 | LegacyDocEngineC3.tsx |  |
| selectionOffsetsInHost | Wa | 30824 | LegacyDocEngineC3.tsx |  |
| caretPointOfCollapsed | Ga | 30851 | LegacyDocEngineC3.tsx |  |
| tableParagraphUnderSelection | Ka | 30866 | LegacyDocEngineC3.tsx |  |
| syncTableCellTextRange | qa | 30884 | LegacyDocEngineC3.tsx |  |
| syncParagraphTextRange | Ja | 30902 | LegacyDocEngineC3.tsx |  |
| commitTableCellDraft | Ya | 30924 | LegacyDocEngineC3.tsx |  |
| registerCellDraftElement | Xa | 30935 | LegacyDocEngineC3.tsx |  |
| cellParagraphDraftElement | Za | 30938 | LegacyDocEngineC3.tsx |  |
| registerCellParagraphDraftElement | Qa | 30939 | LegacyDocEngineC3.tsx |  |
| unregisterCellParagraphDraftElement | eo | 30941 | LegacyDocEngineC3.tsx |  |
| commitCellParagraphDraft | no | 30943 | LegacyDocEngineC3.tsx |  |
| registerSectionDraftElement | ao | 30957 | LegacyDocEngineC3.tsx |  |
| sectionParagraphDraft | oo | 30960 | LegacyDocEngineC3.tsx |  |
| setSectionParagraphDraft | so | 30961 | LegacyDocEngineC3.tsx |  |
| deleteSectionParagraphDraft | co | 30963 | LegacyDocEngineC3.tsx |  |
| commitSectionParagraphDraft | lo | 30965 | LegacyDocEngineC3.tsx |  |
| captureSectionParagraphDraft | uo | 30980 | LegacyDocEngineC3.tsx |  |
| flushSectionParagraphDrafts | fo | 30986 | LegacyDocEngineC3.tsx |  |
| finishHeaderFooterSession | po | 30996 | LegacyDocEngineC3.tsx |  |
| endHeaderFooterSession | ho | 31001 | LegacyDocEngineC3.tsx |  |
| handleUndoRedoKeys | _o | 31073 | LegacyDocEngineC3.tsx |  |
| handleBeforeInput | vo | 31083 | LegacyDocEngineC3.tsx |  |
| resolveColumnWidthsRender | yo | 31341 | LegacyDocEngineC3.tsx |  |
| resolveRowHeightsRender | bo | 31346 | LegacyDocEngineC3.tsx |  |
| resolveColumnWidthsDraft | xo | 31352 | LegacyDocEngineC3.tsx |  |
| resolveRowHeightsDraft | So | 31359 | LegacyDocEngineC3.tsx |  |
| normalizeRowHeightsForResize | Co | 31451 | LegacyDocEngineC3.tsx |  |
| distributeRowHeights | wo | 31453 | LegacyDocEngineC3.tsx |  |
| beginColumnResize | To | 31479 | LegacyDocEngineC3.tsx |  |
| beginRowResize | Eo | 31524 | LegacyDocEngineC3.tsx |  |
| beginColumnResizeDraft | Do | 31565 | LegacyDocEngineC3.tsx |  |
| beginRowResizeDraft | Oo | 31606 | LegacyDocEngineC3.tsx |  |
| beginImageResize | ko | 31646 | LegacyDocEngineC3.tsx |  |
| beginImagePointerMove | Ao | 31675 | LegacyDocEngineC3.tsx |  |
| beginDropCapMove | Mo | 31820 | LegacyDocEngineC3.tsx |  |
| beginDropCapResize | No | 31847 | LegacyDocEngineC3.tsx |  |

## 51. B5 · LegacyDocEngineC4.tsx（legacy-doc [E7] 交互回调簇后半（jsx 31874–35407））

- 族/来源：legacy-doc 族 · 源 chunk `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` · B5-09。行号口径：jsx 还原孪生行（仅文件头映射表，无尾符号表）。
- 符号条数：36（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| beginSectionImagePointerMove | Fo | 31877 | LegacyDocEngineC4.tsx |  |
| selectSectionImageOnTap | zo | 31949 | LegacyDocEngineC4.tsx |  |
| handleImageDragStart | Vo | 31952 | LegacyDocEngineC4.tsx |  |
| handleImageDragEnd | Ho | 31959 | LegacyDocEngineC4.tsx |  |
| beginCornerResize | Uo | 31962 | LegacyDocEngineC4.tsx |  |
| beginCornerResizeDraft | Wo | 32011 | LegacyDocEngineC4.tsx |  |
| beginEmbeddedTableMove | Go | 32060 | LegacyDocEngineC4.tsx |  |
| tableInteractionContext | Ko | 32099 | LegacyDocEngineC4.tsx |  |
| commitImageDrop | qo | 32126 | LegacyDocEngineC4.tsx |  |
| renderImageDropZone | Jo | 32146 | LegacyDocEngineC4.tsx |  |
| renderWrappedParagraph | Yo | 32174 | LegacyDocEngineC4.tsx |  |
| renderParagraphRuns | Xo | 32506 | LegacyDocEngineC4.tsx |  |
| renderTableCellSlice | ds | 33726 | LegacyDocEngineC4.tsx |  |
| renderNode | fs | 33827 | LegacyDocEngineC4.tsx |  |
| renderPageFlow | ps | 35044 | LegacyDocEngineC4.tsx |  |
| dataTransferHasFiles | Zo | 33516 | LegacyDocEngineC4.tsx |  |
| findDocxFileInTransfer | Qo | 33517 | LegacyDocEngineC4.tsx |  |
| handleRootDragEnter | $o | 33518 | LegacyDocEngineC4.tsx |  |
| handleRootDragLeave | es | 33533 | LegacyDocEngineC4.tsx |  |
| handleRootDrop | ts | 33536 | LegacyDocEngineC4.tsx |  |
| minCellContentWidthPx | ns | 33572 | LegacyDocEngineC4.tsx |  |
| documentFontFamily | rs | 33573 | LegacyDocEngineC4.tsx |  |
| pageSurfaceStyle | is | 33574 | LegacyDocEngineC4.tsx |  |
| cellLayoutSignature | ls | 33594 | LegacyDocEngineC4.tsx |  |
| cellSliceLayoutEntries | us | 33600 | LegacyDocEngineC4.tsx |  |
| footnoteNumberById | gs | 35334 | LegacyDocEngineC4.tsx |  |
| endnoteNumberById | _s | 35335 | LegacyDocEngineC4.tsx |  |
| footnoteById | vs | 35336 | LegacyDocEngineC4.tsx |  |
| endnoteById | ys | 35337 | LegacyDocEngineC4.tsx |  |
| footnoteRefsByPage | bs | 35338 | LegacyDocEngineC4.tsx |  |
| orderedEndnotes | xs | 35348 | LegacyDocEngineC4.tsx |  |
| referencedFootnoteIds | Ss | 35360 | LegacyDocEngineC4.tsx |  |
| unreferencedFootnotes | Cs | 35368 | LegacyDocEngineC4.tsx |  |
| renderFootnoteParagraphs | ws | 35369 | LegacyDocEngineC4.tsx |  |
| sectionDraftHandlers | Ts | 35391 | LegacyDocEngineC4.tsx |  |
| beginHeaderFooterEdit | Es | 35398 | LegacyDocEngineC4.tsx |  |

## 52. B5 · LegacyDocEngineC5.tsx（legacy-doc [E6]b 余带：浮动图缩放/页锚定谓词族）

- 族/来源：legacy-doc 族 · 源 chunk `out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js` · B5-14。行号口径：jsx 还原孪生行（pretty 重建孪生为主口径）。
- 符号条数：17（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| floatingIsParagraphRelative | Dp | 17145 | LegacyDocEngineC5.tsx |  |
| inlineImageIsPageOrMarginAnchored | Pg | 19552 | LegacyDocEngineC5.tsx |  |
| unscaleDelta | zg | 19680 | LegacyDocEngineC5.tsx |  |
| unscaleRect | Bg | 19683 | LegacyDocEngineC5.tsx |  |
| sectionFloatingMovePatch | Vg | 19696 | LegacyDocEngineC5.tsx |  |
| floatingMovePatch | Hg | 19724 | LegacyDocEngineC5.tsx |  |
| paragraphHostPointHit | Ug | 19761 | LegacyDocEngineC5.tsx |  |
| floatingWrapIsInlineLike | Wg | 19783 | LegacyDocEngineC5.tsx |  |
| isPageOrMarginAnchoredFloating | qg | 19821 | LegacyDocEngineC5.tsx |  |
| paragraphHasAnchoredImage | Yg | 19837 | LegacyDocEngineC5.tsx |  |
| paragraphHasUnanchoredFloatingImage | Xg | 19840 | LegacyDocEngineC5.tsx |  |
| paragraphHasPageAnchoredFloatingImage | Zg | 19843 | LegacyDocEngineC5.tsx |  |
| paragraphHasVisiblePageAnchoredImage | Qg | 19846 | LegacyDocEngineC5.tsx |  |
| resolveHighlightColor | e_ | 19872 | LegacyDocEngineC5.tsx |  |
| paragraphHostStyle | f_ | 20104 | LegacyDocEngineC5.tsx |  |
| themeAwareColor | p_ | 20127 | LegacyDocEngineC5.tsx |  |
| normalizeFontFamily | m_ | 20133 | LegacyDocEngineC5.tsx |  |

## 53. B5 · DocxWasmGlue.tsx（docx-core wasm 装载 + API 再导出（两 chunk 合并））

- 族/来源：独立 chunk · 源 `out/renderer/assets/chunk-YE7GQOST-DVtn9d8T.js`（428 行）+ `src-AEHDFCS5-Cut3IAW0.js`（25 行）· B5-14。行号口径：chunk 自身行号。
- 符号条数：40（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| toUint8Array | r | 13 | DocxWasmGlue.tsx |  |
| normalizeImageNode | i | 17 | DocxWasmGlue.tsx |  |
| normalizeBlockNode | a | 22 | DocxWasmGlue.tsx |  |
| normalizeBlock | o | 24 | DocxWasmGlue.tsx |  |
| normalizeDocModel | s | 37 | DocxWasmGlue.tsx | （导出 u → normalizeDocModel） |
| blockIdCounter | c | 57 | DocxWasmGlue.tsx |  |
| allocateBlockId | l | 58 | DocxWasmGlue.tsx | 导出 t； |
| assignBlockIdsRecursive | u | 61 | DocxWasmGlue.tsx |  |
| ensureDocModelBlockIds | d | 64 | DocxWasmGlue.tsx |  |
| collectDuplicateBlockIdsRecursive | f | 75 | DocxWasmGlue.tsx |  |
| collectDuplicateDocModelBlockIds | p | 80 | DocxWasmGlue.tsx | （导出 s） |
| blockIsParagraph | m | 96 | DocxWasmGlue.tsx |  |
| blockIsTable | h | 99 | DocxWasmGlue.tsx |  |
| mapBlockNodes | g | 102 | DocxWasmGlue.tsx |  |
| cloneNumberingStyle | _ | 105 | DocxWasmGlue.tsx | / |
| cloneSpacingStyle | v | 108 | DocxWasmGlue.tsx | / |
| cloneIndentStyle | y | 111 | DocxWasmGlue.tsx | / |
| cloneBorderSideStyle | b | 114 | DocxWasmGlue.tsx | / |
| cloneParagraphBordersStyle | x | 117 | DocxWasmGlue.tsx |  |
| cloneParagraphStyleDeep | S | 126 | DocxWasmGlue.tsx |  |
| cloneRunStyleDeep | C | 137 | DocxWasmGlue.tsx |  |
| cloneParagraphNode | w | 140 | DocxWasmGlue.tsx | （导出 a） |
| cloneParagraphFull | E | 146 | DocxWasmGlue.tsx |  |
| cloneTableNode | T | 143 | DocxWasmGlue.tsx |  |
| cloneCellMarginTwips | D | 241 | DocxWasmGlue.tsx |  |
| cloneBorderSpec | O | 247 | DocxWasmGlue.tsx |  |
| cloneTableBordersSpec | k | 250 | DocxWasmGlue.tsx |  |
| cloneTableFloatingSpec | A | 262 | DocxWasmGlue.tsx |  |
| cloneTableFull | j | 275 | DocxWasmGlue.tsx |  |
| cloneBlock | M | 315 | DocxWasmGlue.tsx |  |
| cloneNumberingDefinitions | N | 318 | DocxWasmGlue.tsx |  |
| cloneDocModel | P | 341 | DocxWasmGlue.tsx | （导出 i；C2 契约名 deepCloneModel，原 h） |
| deepFreezeRecursive | F | 395 | DocxWasmGlue.tsx |  |
| deepFreezeDocModel | I | 407 | DocxWasmGlue.tsx |  |
| buildDocModel | L | 410 | DocxWasmGlue.tsx | （导出 n） |
| buildDocModelFromBytes | R | 413 | DocxWasmGlue.tsx | 导出 r；动态 import src-2FP7IUE6 |
| __vite__mapDeps | — | 1-10 | DocxWasmGlue.tsx | vite 依赖映射：src-2FP7IUE6/chunk-WKBPLHUA/ |
| preloadModule | e |  | DocxWasmGlue.tsx | （declare；preload-helper-BHSF1fZ9.js 的 t 导出， |
| wasmBuildDocModelFromPackage | t |  | DocxWasmGlue.tsx | （declare；chunk-WKBPLHUA `r` 导出，原 G： |
| packageToPlainInput | n |  | DocxWasmGlue.tsx | （declare；chunk-WKBPLHUA `t` 导出，原 U： |

## 54. B5 · RemoteGapSegments.tsx（F10 远程族未分配隙段 a/b）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，只读）· B5-14。行号口径：「当前 N」= 当前 out chunk 实测 js 行。
- 符号条数：26（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| probeDockerAvailability | dEt | 123513–123521 | RemoteGapSegments.tsx | 高 |
| resolveCurrentDockerContainer | fEt | 123522–123525 | RemoteGapSegments.tsx | 高 |
| listAvailableRemoteKinds | pEt | 123526–123534 | RemoteGapSegments.tsx | 高 |
| useRemoteWizardState | mEt | 123535–123746 | RemoteGapSegments.tsx | 高 |
| stripRemoteLogPrefixes | hEt | 123747–123753 | RemoteGapSegments.tsx | 高 |
| logIsDownloadProgress | gEt | 123754–123756 | RemoteGapSegments.tsx | 高 |
| classifyProgressLogMessage | _Et | 123757–123761 | RemoteGapSegments.tsx | 高 |
| mergeRemoteLogProgressEntry | vEt | 123762–123784 | RemoteGapSegments.tsx | 高 |
| logEntryMatchesRequestId | yEt | 123785–123788 | RemoteGapSegments.tsx | 高 |
| useRemoteConnectionLogs | bEt | 123789–123837 | RemoteGapSegments.tsx | 高 |
| resolveWizardStepCopy | xEt | 123838–123867 | RemoteGapSegments.tsx | 高 |
| validateAndBuildRemoteTarget | SEt | 123868–123928 | RemoteGapSegments.tsx | 高 |
| attachSelectedResourcePackages | CEt | 123929–123931 | RemoteGapSegments.tsx | 高 |
| isWizardFlowActive | wEt | 123932–123934 | RemoteGapSegments.tsx | 高 |
| isWizardFlowIdle | TEt | 123935–123937 | RemoteGapSegments.tsx | 高 |
| wizardResultToOpenState | EEt | 123938–123940 | RemoteGapSegments.tsx | 高 |
| resolveDirectorySelectFallback | DEt | 123941–123945 | RemoteGapSegments.tsx | 高 |
| REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX | eOt | 127350 | RemoteGapSegments.tsx | 高 |
| logViewIsScrolledToBottom | tOt | 127351–127353 | RemoteGapSegments.tsx | 高 |
| scrollLogViewToBottom | nOt | 127354–127356 | RemoteGapSegments.tsx | 高 |
| RemoteConnectingStep | rOt | 127357–127509 | RemoteGapSegments.tsx | 高 |
| buildRemoteConnectionFeedbackDescription | iOt | 127510–127526 | RemoteGapSegments.tsx | 高 |
| remoteKindIcon | aOt | 127527–127538 | RemoteGapSegments.tsx | 高 |
| RemoteKindStep | oOt | 127539–127615 | RemoteGapSegments.tsx | 高 |
| RemoteSettingsStep | sOt | 127616–127781 | RemoteGapSegments.tsx | 高 |
| RemoteDirectoryStep | cOt | 127782–127942 | RemoteGapSegments.tsx | 高 |

## 55. B5 · SrcSharedA.tsx（src-HCld2afU 共享 chunk 上半部，jsx 1–4901）

- 族/来源：独立 chunk · 解码对象 `src-reconstructed/renderer/assets/src-HCld2afU.jsx`（9,742 行 pretty 孪生）· B5-10a。行号口径：jsx 孪生行。
- 符号条数：567（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| DEFAULT_LOCALE | e | 1 | SrcSharedA.tsx | ·export Ps |
| sanitizeWorkspaceDescriptor | t | 2 | SrcSharedA.tsx | ·export Ns |
| parsePathRootPrefix | n | 20 | SrcSharedA.tsx |  |
| normalizeTraversalPath | r | 64 | SrcSharedA.tsx |  |
| resolveSshAuthMethod | i | 83 | SrcSharedA.tsx |  |
| sshTargetIdentityKey | a | 86 | SrcSharedA.tsx | ·export Ms |
| normalizeBuildEnv | o | 89 | SrcSharedA.tsx |  |
| RESOLVED_BUILD_ENV | s | 92 | SrcSharedA.tsx | ·export js |
| isNonNullObject | c | 94 | SrcSharedA.tsx |  |
| toPrimitiveString | l | 97 | SrcSharedA.tsx |  |
| unwrapErrorPayload | u | 100 | SrcSharedA.tsx |  |
| FILE_LOCK_TIMEOUT_CODE | d | 103 | SrcSharedA.tsx |  |
| stringifyErrorValue | f | 104 | SrcSharedA.tsx |  |
| extractErrorInfo | ee | 115 | SrcSharedA.tsx | ·export As |
| isFileLockTimeoutError | te | 136 | SrcSharedA.tsx | ·export ks |
| $constructor | p | 142 | SrcSharedA.tsx |  |
| $ZodAsyncError | ne | 180 | SrcSharedA.tsx |  |
| $ZodEncodeError | re | 185 | SrcSharedA.tsx |  |
| $globalConfig | ie | 190 | SrcSharedA.tsx |  |
| $getGlobalConfig | ae | 191 | SrcSharedA.tsx |  |
| $getEnumValues | oe | 194 | SrcSharedA.tsx |  |
| jsonStringifyReplacer | se | 198 | SrcSharedA.tsx |  |
| $lazy | ce | 201 | SrcSharedA.tsx |  |
| nullish | le | 214 | SrcSharedA.tsx |  |
| stripRegexAnchors | ue | 217 | SrcSharedA.tsx |  |
| decimalModulo | de | 222 | SrcSharedA.tsx |  |
| EVALUATING_SENTINEL | fe | 233 | SrcSharedA.tsx |  |
| $lazyDefine | m | 234 | SrcSharedA.tsx |  |
| defineWritableProperty | pe | 248 | SrcSharedA.tsx |  |
| $mergeDefs | me | 256 | SrcSharedA.tsx |  |
| jsonStringify | he | 261 | SrcSharedA.tsx |  |
| slugify | ge | 264 | SrcSharedA.tsx |  |
| captureStackTrace | _e | 267 | SrcSharedA.tsx |  |
| isObject | ve | 268 | SrcSharedA.tsx |  |
| $canUseFunction | ye | 271 | SrcSharedA.tsx |  |
| isPlainObject | be | 279 | SrcSharedA.tsx |  |
| shallowClone | xe | 286 | SrcSharedA.tsx |  |
| PRIMITIVE_TYPES | Se | 291 | SrcSharedA.tsx |  |
| escapeRegex | Ce | 292 | SrcSharedA.tsx |  |
| clone | h | 295 | SrcSharedA.tsx |  |
| normalizeCheckParams | g | 299 | SrcSharedA.tsx |  |
| optionalKeys | we | 314 | SrcSharedA.tsx |  |
| NUMBER_FORMAT_LIMITS | Te | 317 | SrcSharedA.tsx |  |
| $pick | Ee | 324 | SrcSharedA.tsx |  |
| $omit | De | 340 | SrcSharedA.tsx |  |
| $extend | Oe | 358 | SrcSharedA.tsx |  |
| $safeExtend | ke | 375 | SrcSharedA.tsx |  |
| $merge | Ae | 387 | SrcSharedA.tsx |  |
| $partial | je | 402 | SrcSharedA.tsx |  |
| $nonpartial | Me | 426 | SrcSharedA.tsx |  |
| $shouldAbort | Ne | 447 | SrcSharedA.tsx |  |
| prefixIssuePath | Pe | 452 | SrcSharedA.tsx |  |
| resolveMessageString | Fe | 458 | SrcSharedA.tsx |  |
| $cleanIssue | Ie | 461 | SrcSharedA.tsx |  |
| resolveOriginKind | Le | 468 | SrcSharedA.tsx |  |
| $issue | Re | 471 | SrcSharedA.tsx |  |
| $ZodErrorInternals | ze | 482 | SrcSharedA.tsx |  |
| $ZodError | Be | 494 | SrcSharedA.tsx |  |
| $ZodRealError | Ve | 495 | SrcSharedA.tsx |  |
| $flattenError | He | 498 | SrcSharedA.tsx |  |
| $treeifyError | Ue | 507 | SrcSharedA.tsx |  |
| makeParseFn | We | 533 | SrcSharedA.tsx |  |
| makeParseAsyncFn | Ge | 550 | SrcSharedA.tsx |  |
| makeSafeParseFn | Ke | 566 | SrcSharedA.tsx |  |
| safeParseReal | qe | 586 | SrcSharedA.tsx |  |
| makeSafeParseAsyncFn | Je | 587 | SrcSharedA.tsx |  |
| safeParseAsyncReal | Ye | 605 | SrcSharedA.tsx |  |
| makeEncodeFn | Xe | 606 | SrcSharedA.tsx |  |
| makeDecodeFn | Ze | 614 | SrcSharedA.tsx |  |
| makeEncodeAsyncFn | Qe | 615 | SrcSharedA.tsx |  |
| makeDecodeAsyncFn | $e | 623 | SrcSharedA.tsx |  |
| makeSafeEncodeFn | et | 624 | SrcSharedA.tsx |  |
| makeSafeDecodeFn | tt | 632 | SrcSharedA.tsx |  |
| makeSafeEncodeAsyncFn | nt | 633 | SrcSharedA.tsx |  |
| makeSafeDecodeAsyncFn | rt | 641 | SrcSharedA.tsx |  |
| cuidRegex | it | 642 | SrcSharedA.tsx |  |
| cuid2Regex | at | 643 | SrcSharedA.tsx |  |
| ulidRegex | ot | 644 | SrcSharedA.tsx |  |
| xidRegex | st | 645 | SrcSharedA.tsx |  |
| ksuidRegex | ct | 646 | SrcSharedA.tsx |  |
| nanoidRegex | lt | 647 | SrcSharedA.tsx |  |
| isoDurationRegex | ut | 648 | SrcSharedA.tsx |  |
| uuidGenericRegex | dt | 649 | SrcSharedA.tsx |  |
| uuidVersionedRegex | ft | 650 | SrcSharedA.tsx |  |
| emailRegex | pt | 651 | SrcSharedA.tsx |  |
| emojiRegexSource | mt | 652 | SrcSharedA.tsx |  |
| emojiRegex | ht | 653 | SrcSharedA.tsx |  |
| ipv4Regex | gt | 656 | SrcSharedA.tsx |  |
| ipv6Regex | _t | 657 | SrcSharedA.tsx |  |
| ipv4CidrRegex | vt | 658 | SrcSharedA.tsx |  |
| ipv6CidrRegex | yt | 659 | SrcSharedA.tsx |  |
| base64Regex | bt | 660 | SrcSharedA.tsx |  |
| base64urlRegex | xt | 661 | SrcSharedA.tsx |  |
| e164Regex | St | 662 | SrcSharedA.tsx |  |
| isoDateSource | Ct | 663 | SrcSharedA.tsx |  |
| isoDateRegex | wt | 664 | SrcSharedA.tsx |  |
| isoTimeSource | Tt | 665 | SrcSharedA.tsx |  |
| isoTimeRegex | Et | 669 | SrcSharedA.tsx |  |
| isoDateTimeRegex | Dt | 672 | SrcSharedA.tsx |  |
| makeStringLengthRegex | Ot | 681 | SrcSharedA.tsx |  |
| integerRegex | kt | 685 | SrcSharedA.tsx |  |
| numberRegex | At | 686 | SrcSharedA.tsx |  |
| booleanRegex | jt | 687 | SrcSharedA.tsx |  |
| undefinedRegex | Mt | 688 | SrcSharedA.tsx |  |
| lowercaseRegex | Nt | 689 | SrcSharedA.tsx |  |
| uppercaseRegex | Pt | 690 | SrcSharedA.tsx |  |
| $ZodCheck | _ | 691 | SrcSharedA.tsx |  |
| CHECK_ORIGIN_BY_VALUE_TYPE | Ft | 695 | SrcSharedA.tsx |  |
| $ZodCheckLessThan | It | 700 | SrcSharedA.tsx |  |
| $ZodCheckGreaterThan | Lt | 719 | SrcSharedA.tsx |  |
| $ZodCheckMultipleOf | Rt | 738 | SrcSharedA.tsx |  |
| $ZodCheckNumberFormat | zt | 754 | SrcSharedA.tsx |  |
| $ZodCheckMaxLength | Bt | 818 | SrcSharedA.tsx |  |
| $ZodCheckMinLength | Vt | 841 | SrcSharedA.tsx |  |
| $ZodCheckLengthEquals | Ht | 864 | SrcSharedA.tsx |  |
| $ZodCheckStringFormat | Ut | 895 | SrcSharedA.tsx |  |
| $ZodCheckRegex | Wt | 914 | SrcSharedA.tsx |  |
| $ZodCheckLowerCase | Gt | 927 | SrcSharedA.tsx |  |
| $ZodCheckUpperCase | Kt | 930 | SrcSharedA.tsx |  |
| $ZodCheckIncludes | qt | 933 | SrcSharedA.tsx |  |
| $ZodCheckStartsWith | Jt | 952 | SrcSharedA.tsx |  |
| $ZodCheckEndsWith | Yt | 970 | SrcSharedA.tsx |  |
| $ZodCheckOverwrite | Xt | 988 | SrcSharedA.tsx |  |
| JitCodeBuilder | Zt | 993 | SrcSharedA.tsx |  |
| ZOD_VERSION | Qt | 1023 | SrcSharedA.tsx |  |
| $ZodType | v | 1028 | SrcSharedA.tsx |  |
| $ZodString | $t | 1106 | SrcSharedA.tsx |  |
| $ZodStringFormat | y | 1119 | SrcSharedA.tsx |  |
| $ZodGUID | en | 1122 | SrcSharedA.tsx |  |
| $ZodUUID | tn | 1125 | SrcSharedA.tsx |  |
| $ZodEmail | nn | 1142 | SrcSharedA.tsx |  |
| $ZodURL | rn | 1145 | SrcSharedA.tsx |  |
| $ZodEmoji | an | 1179 | SrcSharedA.tsx |  |
| $ZodNanoID | on | 1182 | SrcSharedA.tsx |  |
| $ZodCUID | sn | 1185 | SrcSharedA.tsx |  |
| $ZodCUID2 | cn | 1188 | SrcSharedA.tsx |  |
| $ZodULID | ln | 1191 | SrcSharedA.tsx |  |
| $ZodXID | un | 1194 | SrcSharedA.tsx |  |
| $ZodKSUID | dn | 1197 | SrcSharedA.tsx |  |
| $ZodISODateTime | fn | 1200 | SrcSharedA.tsx |  |
| $ZodISODate | pn | 1203 | SrcSharedA.tsx |  |
| $ZodISOTime | mn | 1206 | SrcSharedA.tsx |  |
| $ZodISODuration | hn | 1209 | SrcSharedA.tsx |  |
| $ZodIPv4 | gn | 1212 | SrcSharedA.tsx |  |
| $ZodIPv6 | _n | 1215 | SrcSharedA.tsx |  |
| $ZodCIDRv4 | vn | 1230 | SrcSharedA.tsx |  |
| $ZodCIDRv6 | yn | 1233 | SrcSharedA.tsx |  |
| isValidBase64 | bn | 1254 | SrcSharedA.tsx |  |
| $ZodBase64 | xn | 1263 | SrcSharedA.tsx |  |
| isValidBase64URL | Sn | 1274 | SrcSharedA.tsx |  |
| $ZodBase64URL | Cn | 1279 | SrcSharedA.tsx |  |
| $ZodE164 | wn | 1290 | SrcSharedA.tsx |  |
| isValidJWT | Tn | 1293 | SrcSharedA.tsx |  |
| $ZodJWT | En | 1305 | SrcSharedA.tsx |  |
| $ZodNumber | Dn | 1316 | SrcSharedA.tsx |  |
| $ZodNumberFormat | On | 1335 | SrcSharedA.tsx |  |
| $ZodBoolean | kn | 1338 | SrcSharedA.tsx |  |
| $ZodUndefined | An | 1352 | SrcSharedA.tsx |  |
| $ZodUnknown | jn | 1363 | SrcSharedA.tsx |  |
| $ZodNever | Mn | 1366 | SrcSharedA.tsx |  |
| $ZodDate | Nn | 1374 | SrcSharedA.tsx |  |
| assignArrayElementResult | Pn | 1392 | SrcSharedA.tsx |  |
| $ZodArray | Fn | 1395 | SrcSharedA.tsx |  |
| assignShapeEntryResult | In | 1417 | SrcSharedA.tsx |  |
| computeObjectInternals | Ln | 1424 | SrcSharedA.tsx |  |
| processCatchallKeys | Rn | 1436 | SrcSharedA.tsx |  |
| $ZodObject | zn | 1461 | SrcSharedA.tsx |  |
| $ZodObjectJIT | Bn | 1515 | SrcSharedA.tsx |  |
| finalizeUnionParse | Vn | 1592 | SrcSharedA.tsx |  |
| $ZodUnion | Hn | 1602 | SrcSharedA.tsx |  |
| $ZodDiscriminatedUnion | Un | 1630 | SrcSharedA.tsx |  |
| $ZodIntersection | Wn | 1678 | SrcSharedA.tsx |  |
| mergeValues | Gn | 1692 | SrcSharedA.tsx |  |
| finalizeIntersectionParse | Kn | 1743 | SrcSharedA.tsx |  |
| $ZodRecord | qn | 1760 | SrcSharedA.tsx |  |
| $ZodEnum | Jn | 1832 | SrcSharedA.tsx |  |
| $ZodLiteral | Yn | 1846 | SrcSharedA.tsx |  |
| $ZodTransform | Xn | 1859 | SrcSharedA.tsx |  |
| resetIssuesForOptionalUndefined | Zn | 1868 | SrcSharedA.tsx |  |
| $ZodOptional | Qn | 1874 | SrcSharedA.tsx |  |
| $ZodExactOptional | $n | 1886 | SrcSharedA.tsx |  |
| $ZodNullable | er | 1889 | SrcSharedA.tsx |  |
| $ZodDefault | tr | 1895 | SrcSharedA.tsx |  |
| applyDefaultValue | nr | 1903 | SrcSharedA.tsx |  |
| $ZodPrefault | rr | 1906 | SrcSharedA.tsx |  |
| $ZodNonOptional | ir | 1909 | SrcSharedA.tsx |  |
| rejectUndefinedValue | ar | 1918 | SrcSharedA.tsx |  |
| $ZodCatch | or | 1926 | SrcSharedA.tsx |  |
| $ZodPipe | sr | 1945 | SrcSharedA.tsx |  |
| runPipeStage | cr | 1955 | SrcSharedA.tsx |  |
| $ZodReadonly | lr | 1961 | SrcSharedA.tsx |  |
| freezePayloadValue | ur | 1968 | SrcSharedA.tsx |  |
| $ZodCustom | dr | 1971 | SrcSharedA.tsx |  |
| handleCustomCheckResult | fr | 1979 | SrcSharedA.tsx |  |
| registryInit | pr | 1991 | SrcSharedA.tsx |  |
| MetadataRegistry | mr | 1992 | SrcSharedA.tsx |  |
| createMetadataRegistry | hr | 2026 | SrcSharedA.tsx |  |
| $globalRegistry | gr | 2030 | SrcSharedA.tsx |  |
| $string | _r | 2031 | SrcSharedA.tsx |  |
| $email | vr | 2037 | SrcSharedA.tsx |  |
| $guid | yr | 2046 | SrcSharedA.tsx |  |
| $uuid | br | 2055 | SrcSharedA.tsx |  |
| $uuidv4 | xr | 2064 | SrcSharedA.tsx |  |
| $uuidv6 | Sr | 2074 | SrcSharedA.tsx |  |
| $uuidv7 | Cr | 2084 | SrcSharedA.tsx |  |
| $url | wr | 2094 | SrcSharedA.tsx |  |
| $emoji | Tr | 2103 | SrcSharedA.tsx |  |
| $nanoid | Er | 2112 | SrcSharedA.tsx |  |
| $cuid | Dr | 2121 | SrcSharedA.tsx |  |
| $cuid2 | Or | 2130 | SrcSharedA.tsx |  |
| $ulid | kr | 2139 | SrcSharedA.tsx |  |
| $xid | Ar | 2148 | SrcSharedA.tsx |  |
| $ksuid | jr | 2157 | SrcSharedA.tsx |  |
| $ipv4 | Mr | 2166 | SrcSharedA.tsx |  |
| $ipv6 | Nr | 2175 | SrcSharedA.tsx |  |
| $cidrv4 | Pr | 2184 | SrcSharedA.tsx |  |
| $cidrv6 | Fr | 2193 | SrcSharedA.tsx |  |
| $base64 | Ir | 2202 | SrcSharedA.tsx |  |
| $base64url | Lr | 2211 | SrcSharedA.tsx |  |
| $e164 | Rr | 2220 | SrcSharedA.tsx |  |
| $jwt | zr | 2229 | SrcSharedA.tsx |  |
| $datetime | Br | 2238 | SrcSharedA.tsx |  |
| $date | Vr | 2249 | SrcSharedA.tsx |  |
| $time | Hr | 2257 | SrcSharedA.tsx |  |
| $duration | Ur | 2266 | SrcSharedA.tsx |  |
| $number | Wr | 2274 | SrcSharedA.tsx |  |
| $int | Gr | 2281 | SrcSharedA.tsx |  |
| $boolean | Kr | 2290 | SrcSharedA.tsx |  |
| $undefined | qr | 2296 | SrcSharedA.tsx |  |
| $unknown | Jr | 2302 | SrcSharedA.tsx |  |
| $never | Yr | 2307 | SrcSharedA.tsx |  |
| $dateValue | Xr | 2313 | SrcSharedA.tsx |  |
| $lt | Zr | 2319 | SrcSharedA.tsx |  |
| $lte | Qr | 2327 | SrcSharedA.tsx |  |
| $gt | $r | 2335 | SrcSharedA.tsx |  |
| $gte | ei | 2343 | SrcSharedA.tsx |  |
| $multipleOf | ti | 2351 | SrcSharedA.tsx |  |
| $maxLength | ni | 2358 | SrcSharedA.tsx |  |
| $minLength | ri | 2365 | SrcSharedA.tsx |  |
| $length | ii | 2372 | SrcSharedA.tsx |  |
| $regex | ai | 2379 | SrcSharedA.tsx |  |
| $lowercase | oi | 2387 | SrcSharedA.tsx |  |
| $uppercase | si | 2394 | SrcSharedA.tsx |  |
| $includes | ci | 2401 | SrcSharedA.tsx |  |
| $startsWith | li | 2409 | SrcSharedA.tsx |  |
| $endsWith | ui | 2417 | SrcSharedA.tsx |  |
| $overwrite | di | 2425 | SrcSharedA.tsx |  |
| $normalize | fi | 2431 | SrcSharedA.tsx |  |
| $trim | pi | 2434 | SrcSharedA.tsx |  |
| $toLowerCase | mi | 2437 | SrcSharedA.tsx |  |
| $toUpperCase | hi | 2440 | SrcSharedA.tsx |  |
| $slugify | gi | 2443 | SrcSharedA.tsx |  |
| $array | _i | 2446 | SrcSharedA.tsx |  |
| $custom | vi | 2453 | SrcSharedA.tsx |  |
| $superRefine | yi | 2461 | SrcSharedA.tsx |  |
| defineCheck | bi | 2470 | SrcSharedA.tsx |  |
| initJsonSchemaContext | xi | 2477 | SrcSharedA.tsx |  |
| processJsonSchemaNode | b | 2493 | SrcSharedA.tsx |  |
| resolveJsonSchemaRefs | Si | 2527 | SrcSharedA.tsx |  |
| finalizeJsonSchema | Ci | 2610 | SrcSharedA.tsx |  |
| schemaContainsTransform | x | 2671 | SrcSharedA.tsx |  |
| makeToJsonSchemaFn | wi | 2700 | SrcSharedA.tsx |  |
| makeIoJsonSchemaFn | Ti | 2707 | SrcSharedA.tsx |  |
| JSON_SCHEMA_FORMAT_MAP | Ei | 2720 | SrcSharedA.tsx |  |
| processJsonSchemaString | Di | 2727 | SrcSharedA.tsx |  |
| processJsonSchemaNumber | Oi | 2747 | SrcSharedA.tsx |  |
| processJsonSchemaBoolean | ki | 2759 | SrcSharedA.tsx |  |
| processJsonSchemaUndefined | Ai | 2762 | SrcSharedA.tsx |  |
| processJsonSchemaNever | ji | 2765 | SrcSharedA.tsx |  |
| processJsonSchemaDate | Mi | 2768 | SrcSharedA.tsx |  |
| processJsonSchemaEnum | Ni | 2771 | SrcSharedA.tsx |  |
| processJsonSchemaLiteral | Pi | 2776 | SrcSharedA.tsx |  |
| processJsonSchemaCustom | Fi | 2790 | SrcSharedA.tsx |  |
| processJsonSchemaTransform | Ii | 2793 | SrcSharedA.tsx |  |
| processJsonSchemaArray | Li | 2796 | SrcSharedA.tsx |  |
| processJsonSchemaObject | Ri | 2808 | SrcSharedA.tsx |  |
| processJsonSchemaUnion | zi | 2827 | SrcSharedA.tsx |  |
| processJsonSchemaIntersection | Bi | 2836 | SrcSharedA.tsx |  |
| processJsonSchemaRecord | Vi | 2849 | SrcSharedA.tsx |  |
| processJsonSchemaNullable | Hi | 2875 | SrcSharedA.tsx |  |
| processJsonSchemaNonOptional | Ui | 2883 | SrcSharedA.tsx |  |
| processJsonSchemaDefault | Wi | 2889 | SrcSharedA.tsx |  |
| processJsonSchemaPrefault | Gi | 2895 | SrcSharedA.tsx |  |
| processJsonSchemaCatch | Ki | 2901 | SrcSharedA.tsx |  |
| processJsonSchemaPipe | qi | 2914 | SrcSharedA.tsx |  |
| processJsonSchemaReadonly | Ji | 2921 | SrcSharedA.tsx |  |
| processJsonSchemaOptional | Yi | 2927 | SrcSharedA.tsx |  |
| ZodISODateTime | Xi | 2933 | SrcSharedA.tsx |  |
| isoDateTime | Zi | 2936 | SrcSharedA.tsx |  |
| ZodISODate | Qi | 2939 | SrcSharedA.tsx |  |
| isoDate | $i | 2942 | SrcSharedA.tsx |  |
| ZodISOTime | ea | 2945 | SrcSharedA.tsx |  |
| isoTime | ta | 2948 | SrcSharedA.tsx |  |
| ZodISODuration | na | 2951 | SrcSharedA.tsx |  |
| isoDuration | ra | 2954 | SrcSharedA.tsx |  |
| ZodErrorInternals | ia | 2957 | SrcSharedA.tsx |  |
| ZodError | S | 2983 | SrcSharedA.tsx |  |
| parseImpl | aa | 2986 | SrcSharedA.tsx |  |
| parseAsyncImpl | oa | 2987 | SrcSharedA.tsx |  |
| safeParseImpl | sa | 2988 | SrcSharedA.tsx |  |
| safeParseAsyncImpl | ca | 2989 | SrcSharedA.tsx |  |
| encodeImpl | la | 2990 | SrcSharedA.tsx |  |
| decodeImpl | ua | 2991 | SrcSharedA.tsx |  |
| encodeAsyncImpl | da | 2992 | SrcSharedA.tsx |  |
| decodeAsyncImpl | fa | 2993 | SrcSharedA.tsx |  |
| safeEncodeImpl | pa | 2994 | SrcSharedA.tsx |  |
| safeDecodeImpl | ma | 2995 | SrcSharedA.tsx |  |
| safeEncodeAsyncImpl | ha | 2996 | SrcSharedA.tsx |  |
| safeDecodeAsyncImpl | ga | 2997 | SrcSharedA.tsx |  |
| ZodType | C | 2998 | SrcSharedA.tsx |  |
| _ZodString | _a | 3036 | SrcSharedA.tsx |  |
| ZodString | va | 3041 | SrcSharedA.tsx |  |
| zString | w | 3044 | SrcSharedA.tsx | ·export Es |
| ZodStringFormat | T | 3047 | SrcSharedA.tsx |  |
| ZodEmail | ya | 3050 | SrcSharedA.tsx |  |
| ZodGUID | ba | 3053 | SrcSharedA.tsx |  |
| ZodUUID | xa | 3056 | SrcSharedA.tsx |  |
| ZodURL | Sa | 3059 | SrcSharedA.tsx |  |
| ZodEmoji | Ca | 3062 | SrcSharedA.tsx |  |
| ZodNanoID | wa | 3065 | SrcSharedA.tsx |  |
| ZodCUID | Ta | 3068 | SrcSharedA.tsx |  |
| ZodCUID2 | Ea | 3071 | SrcSharedA.tsx |  |
| ZodULID | Da | 3074 | SrcSharedA.tsx |  |
| ZodXID | Oa | 3077 | SrcSharedA.tsx |  |
| ZodKSUID | ka | 3080 | SrcSharedA.tsx |  |
| ZodIPv4 | Aa | 3083 | SrcSharedA.tsx |  |
| ZodIPv6 | ja | 3086 | SrcSharedA.tsx |  |
| ZodCIDRv4 | Ma | 3089 | SrcSharedA.tsx |  |
| ZodCIDRv6 | Na | 3092 | SrcSharedA.tsx |  |
| ZodBase64 | Pa | 3095 | SrcSharedA.tsx |  |
| ZodBase64URL | Fa | 3098 | SrcSharedA.tsx |  |
| ZodE164 | Ia | 3101 | SrcSharedA.tsx |  |
| ZodJWT | La | 3104 | SrcSharedA.tsx |  |
| ZodNumber | Ra | 3107 | SrcSharedA.tsx |  |
| zNumber | E | 3112 | SrcSharedA.tsx | ·export Cs |
| ZodNumberFormat | za | 3115 | SrcSharedA.tsx |  |
| intCheck | Ba | 3118 | SrcSharedA.tsx |  |
| ZodBoolean | Va | 3121 | SrcSharedA.tsx |  |
| zBoolean | D | 3124 | SrcSharedA.tsx | ·export ys |
| ZodUndefined | Ha | 3127 | SrcSharedA.tsx |  |
| zUndefined | Ua | 3130 | SrcSharedA.tsx |  |
| ZodUnknown | Wa | 3133 | SrcSharedA.tsx |  |
| zUnknown | O | 3136 | SrcSharedA.tsx | ·export Os |
| ZodNever | Ga | 3139 | SrcSharedA.tsx |  |
| zNever | Ka | 3142 | SrcSharedA.tsx | ·export Ss |
| ZodDate | qa | 3145 | SrcSharedA.tsx |  |
| zDate | Ja | 3150 | SrcSharedA.tsx |  |
| ZodArray | Ya | 3153 | SrcSharedA.tsx |  |
| zArray | k | 3156 | SrcSharedA.tsx | ·export vs |
| ZodObject | Xa | 3159 | SrcSharedA.tsx |  |
| zObject | A | 3177 | SrcSharedA.tsx | ·export ws |
| ZodUnion | Za | 3184 | SrcSharedA.tsx |  |
| zUnion | j | 3187 | SrcSharedA.tsx | ·export Ds |
| ZodDiscriminatedUnion | Qa | 3194 | SrcSharedA.tsx |  |
| zDiscriminatedUnion | M | 3197 | SrcSharedA.tsx | ·export bs |
| ZodIntersection | $a | 3205 | SrcSharedA.tsx |  |
| zIntersection | eo | 3208 | SrcSharedA.tsx |  |
| ZodRecord | to | 3215 | SrcSharedA.tsx |  |
| zRecord | N | 3218 | SrcSharedA.tsx | ·export Ts |
| looseRecord | no | 3226 | SrcSharedA.tsx |  |
| ZodEnum | ro | 3235 | SrcSharedA.tsx |  |
| zEnum | P | 3260 | SrcSharedA.tsx | ·export _s |
| ZodLiteral | io | 3267 | SrcSharedA.tsx |  |
| zLiteral | F | 3275 | SrcSharedA.tsx | ·export xs |
| ZodTransform | ao | 3282 | SrcSharedA.tsx |  |
| zTransform | oo | 3295 | SrcSharedA.tsx |  |
| ZodOptional | so | 3301 | SrcSharedA.tsx |  |
| zOptional | co | 3304 | SrcSharedA.tsx |  |
| ZodExactOptional | lo | 3310 | SrcSharedA.tsx |  |
| zExactOptional | uo | 3313 | SrcSharedA.tsx |  |
| ZodNullable | fo | 3319 | SrcSharedA.tsx |  |
| zNullable | po | 3322 | SrcSharedA.tsx |  |
| ZodDefault | mo | 3328 | SrcSharedA.tsx |  |
| zDefault | ho | 3331 | SrcSharedA.tsx |  |
| ZodPrefault | go | 3340 | SrcSharedA.tsx |  |
| zPrefault | _o | 3343 | SrcSharedA.tsx |  |
| ZodNonOptional | vo | 3352 | SrcSharedA.tsx |  |
| zNonOptional | yo | 3355 | SrcSharedA.tsx |  |
| ZodCatch | bo | 3362 | SrcSharedA.tsx |  |
| zCatch | xo | 3365 | SrcSharedA.tsx |  |
| ZodPipe | So | 3372 | SrcSharedA.tsx |  |
| zPipe | Co | 3375 | SrcSharedA.tsx |  |
| ZodReadonly | wo | 3382 | SrcSharedA.tsx |  |
| zReadonly | To | 3385 | SrcSharedA.tsx |  |
| ZodCustom | Eo | 3391 | SrcSharedA.tsx |  |
| refine | Do | 3394 | SrcSharedA.tsx |  |
| superRefine | Oo | 3397 | SrcSharedA.tsx |  |
| transformPipe | ko | 3400 | SrcSharedA.tsx |  |
| ISSUE_CODES | Ao | 3403 | SrcSharedA.tsx | ·export gs |
| emptyNamespaceResidue | jo | 3416 | SrcSharedA.tsx |  |
| BROWSER_VIEWPORT_LIMITS | Mo | 3418 | SrcSharedA.tsx | ·export hs |
| browserViewportSchema | No | 3424 | SrcSharedA.tsx |  |
| browserViewportBoundsSchema | Po | 3428 | SrcSharedA.tsx |  |
| clientModeEnum | Fo | 3433 | SrcSharedA.tsx |  |
| browserErrorCodeEnum | Io | 3441 | SrcSharedA.tsx |  |
| browserPageStateSchema | Lo | 3442 | SrcSharedA.tsx |  |
| mouseButtonEnum | Ro | 3452 | SrcSharedA.tsx |  |
| keyboardModifierEnum | zo | 3453 | SrcSharedA.tsx |  |
| pointSchema | Bo | 3454 | SrcSharedA.tsx |  |
| locatorOperationEnum | Vo | 3458 | SrcSharedA.tsx |  |
| locatorModifierEnum | Ho | 3459 | SrcSharedA.tsx |  |
| timeoutMsSchema | Uo | 3460 | SrcSharedA.tsx |  |
| selectOptionSchema | Wo | 3461 | SrcSharedA.tsx |  |
| playwrightActionSchema | Go | 3466 | SrcSharedA.tsx |  |
| browserRequestSchema | Ko | 3524 | SrcSharedA.tsx |  |
| browserBackendTypeEnum | qo | 3724 | SrcSharedA.tsx |  |
| browserCapabilityRefSchema | Jo | 3725 | SrcSharedA.tsx |  |
| browserDescriptorSchema | Yo | 3729 | SrcSharedA.tsx |  |
| sessionContextEnum | Xo | 3741 | SrcSharedA.tsx |  |
| rectSchema | Zo | 3758 | SrcSharedA.tsx |  |
| domElementSchema | Qo | 3764 | SrcSharedA.tsx |  |
| domNodeSchema | $o | 3781 | SrcSharedA.tsx |  |
| domSnapshotSchema | es | 3791 | SrcSharedA.tsx |  |
| browserTabSchema | ts | 3799 | SrcSharedA.tsx |  |
| userTabSchema | ns | 3807 | SrcSharedA.tsx |  |
| browserDialogSchema | rs | 3814 | SrcSharedA.tsx |  |
| browserMetaSchema | is | 3819 | SrcSharedA.tsx |  |
| browserResultSchema | as | 3829 | SrcSharedA.tsx |  |
| ASSET_INSTALL_MODES | os | 3851 | SrcSharedA.tsx |  |
| DEFAULT_ASSET_INSTALL_MODE | ss | 3852 | SrcSharedA.tsx | ·export ms |
| FILE_TRANSFER_CAPABILITIES | cs | 3853 | SrcSharedA.tsx |  |
| ALL_FILE_TRANSFER_CAPABILITIES | ls | 3854 | SrcSharedA.tsx |  |
| REMOTE_FILE_TRANSFER_CAPABILITIES | us | 3855 | SrcSharedA.tsx |  |
| fileTransferCapabilitySet | ds | 3857 | SrcSharedA.tsx |  |
| listFileTransferCapabilities | fs | 3859 | SrcSharedA.tsx | ·export ps |
| isFileTransferCapability | ps | 3862 | SrcSharedA.tsx |  |
| agentCliProviderEnum | I | 3865 | SrcSharedA.tsx |  |
| USAGE_REPORT_RANGES | ms | 3866 | SrcSharedA.tsx | ·export fs |
| favoriteModelSchema | hs | 3867 | SrcSharedA.tsx |  |
| usageSummarySchema | gs | 3872 | SrcSharedA.tsx |  |
| usageHeatmapDaySchema | _s | 3891 | SrcSharedA.tsx |  |
| usageHeatmapWeekSchema | vs | 3898 | SrcSharedA.tsx |  |
| usageHeatmapSchema | ys | 3902 | SrcSharedA.tsx |  |
| usageDailyModelSchema | bs | 3908 | SrcSharedA.tsx |  |
| usageDailyModelUsageSchema | xs | 3912 | SrcSharedA.tsx |  |
| usageModelDetailSchema | Ss | 3916 | SrcSharedA.tsx |  |
| usageToolStatsSchema | Cs | 3924 | SrcSharedA.tsx |  |
| DEFAULT_AGENT_NAME | ws | 3942 | SrcSharedA.tsx | ·export ls |
| BUILTIN_AGENT_CLI_PROVIDERS | Ts | 3943 | SrcSharedA.tsx |  |
| resolveDefaultAgentCliProvider | Es | 3944 | SrcSharedA.tsx | ·export ds |
| isGlmAgentCliProvider | Ds | 3947 | SrcSharedA.tsx | ·export us |
| nonEmptyString | L | 3950 | SrcSharedA.tsx |  |
| unknownRecord | R | 3951 | SrcSharedA.tsx |  |
| timestampMs | z | 3952 | SrcSharedA.tsx |  |
| clientModeEnum2 | Os | 3953 | SrcSharedA.tsx |  |
| messageVisibilityEnum | ks | 3954 | SrcSharedA.tsx |  |
| syntheticSourceEnum | As | 3955 | SrcSharedA.tsx |  |
| workspaceRefSchema | B | 3956 | SrcSharedA.tsx |  |
| permissionDecisionEnum | js | 3962 | SrcSharedA.tsx |  |
| permissionBehaviorEnum | Ms | 3963 | SrcSharedA.tsx |  |
| permissionRuleSchema | Ns | 3964 | SrcSharedA.tsx |  |
| addRulesUpdateSchema | Ps | 3968 | SrcSharedA.tsx |  |
| permissionResponseSchema | Fs | 3973 | SrcSharedA.tsx | ·export ss |
| modelRefSchema | V | 3979 | SrcSharedA.tsx |  |
| sessionModeEnum | Is | 3984 | SrcSharedA.tsx |  |
| sessionStatusEnum | Ls | 3985 | SrcSharedA.tsx |  |
| sessionKindEnum | Rs | 3986 | SrcSharedA.tsx |  |
| goalTargetSchema | zs | 3987 | SrcSharedA.tsx |  |
| goalVerificationResultSchema | Bs | 4002 | SrcSharedA.tsx |  |
| goalVerificationTimelineSchema | Vs | 4007 | SrcSharedA.tsx |  |
| sessionDescriptorSchema | Hs | 4022 | SrcSharedA.tsx |  |
| subagentOriginSchema | Us | 4038 | SrcSharedA.tsx | ·export os |
| messageTimeSchema | Ws | 4049 | SrcSharedA.tsx |  |
| tokenUsageSchema | Gs | 4053 | SrcSharedA.tsx |  |
| messageSemanticsSchema | Ks | 4063 | SrcSharedA.tsx |  |
| messageInfoSchema | qs | 4072 | SrcSharedA.tsx |  |
| partBaseSchema | H | 4105 | SrcSharedA.tsx |  |
| toolStateSchema | Js | 4110 | SrcSharedA.tsx |  |
| labeledModelRefSchema | Ys | 4136 | SrcSharedA.tsx |  |
| timeRangeSchema | Xs | 4139 | SrcSharedA.tsx |  |
| timelinePartSchema | Zs | 4143 | SrcSharedA.tsx |  |
| messagePartSchema | Qs | 4180 | SrcSharedA.tsx |  |
| messageWithPartsSchema | $s | 4239 | SrcSharedA.tsx |  |
| apiRetrySchema | ec | 4243 | SrcSharedA.tsx |  |
| cacheStatsSchema | tc | 4251 | SrcSharedA.tsx | ·export cs |
| contextBreakdownSchema | nc | 4262 | SrcSharedA.tsx | ·export as |
| contextUsageSchema | rc | 4266 | SrcSharedA.tsx |  |
| sessionStateEventSchema | ic | 4276 | SrcSharedA.tsx |  |
| extractTextFromParts | ac | 4288 | SrcSharedA.tsx |  |
| BOT_PROVIDER_IDS | oc | 4291 | SrcSharedA.tsx |  |
| imBindingSchema | sc | 4292 | SrcSharedA.tsx | ·export is |
| isFeishuOrLark | cc | 4298 | SrcSharedA.tsx | ·export ns |
| BOT_REPLY_MODES | lc | 4301 | SrcSharedA.tsx |  |
| BOTS_STREAM_TIMEOUT_MS | uc | 4302 | SrcSharedA.tsx | ·export Zo |
| BOTS_TASK_CHANNEL | dc | 4303 | SrcSharedA.tsx | ·export Qo |
| BOTS_TASK_STREAM_CHANNEL | fc | 4304 | SrcSharedA.tsx |  |
| botAllowedCommandsSchema | pc | 4305 | SrcSharedA.tsx |  |
| botCurrentOptionsSchema | mc | 4317 | SrcSharedA.tsx |  |
| botDraftOptionsSchema | hc | 4325 | SrcSharedA.tsx |  |
| botQuestionOptionSchema | gc | 4331 | SrcSharedA.tsx |  |
| botQuestionSchema | _c | 4336 | SrcSharedA.tsx |  |
| botElicitationSchema | vc | 4342 | SrcSharedA.tsx |  |
| botConfigSchema | yc | 4358 | SrcSharedA.tsx |  |
| DEFAULT_BOT_REPLY_MODE | bc | 4403 | SrcSharedA.tsx | ·export es |
| availableReplyModesForProvider | xc | 4404 | SrcSharedA.tsx | ·export ts |
| resolveBotReplyMode | Sc | 4407 | SrcSharedA.tsx | ·export rs |
| isValidWslUser | Cc | 4412 | SrcSharedA.tsx | ·export Xo |
| containsControlCharacter | wc | 4416 | SrcSharedA.tsx |  |
| wslUserSchema | Tc | 4423 | SrcSharedA.tsx |  |
| ZCODE_PRODUCTION_ORIGIN | Ec | 4426 | SrcSharedA.tsx |  |
| ZCODE_TEST_ORIGIN | Dc | 4427 | SrcSharedA.tsx |  |
| BIGMODEL_PRODUCTION_ORIGIN | Oc | 4428 | SrcSharedA.tsx |  |
| BIGMODEL_DEV_ORIGIN | kc | 4429 | SrcSharedA.tsx |  |
| REMOTE_V4_MIN_APP_VERSION | Ac | 4430 | SrcSharedA.tsx |  |
| isAppVersionAbove | jc | 4431 | SrcSharedA.tsx |  |
| readEnvValue | Mc | 4445 | SrcSharedA.tsx |  |
| normalizeEndpointOrigin | Nc | 4448 | SrcSharedA.tsx |  |
| resolveZcodeOriginByEnv | Pc | 4455 | SrcSharedA.tsx |  |
| resolveBuildEnvFromVars | Fc | 4462 | SrcSharedA.tsx |  |
| resolveZcodeEndpointOrigin | Ic | 4465 | SrcSharedA.tsx |  |
| resolveZcodeEndpointConfig | Lc | 4474 | SrcSharedA.tsx | ·export Yo |
| resolveBigmodelApiBaseUrl | Rc | 4477 | SrcSharedA.tsx |  |
| buildBigmodelApiUrl | zc | 4483 | SrcSharedA.tsx | ·export Ko |
| codingPlanPersonalOverviewUrl | Bc | 4487 | SrcSharedA.tsx | ·export qo |
| codingPlanTeamPlansUrl | Vc | 4490 | SrcSharedA.tsx | ·export Jo |
| buildZcodeEndpointConfig | Hc | 4493 | SrcSharedA.tsx |  |
| settingsNonEmptyString | U | 4510 | SrcSharedA.tsx |  |
| localeEnum | Uc | 4511 | SrcSharedA.tsx |  |
| localePreferenceEnum | Wc | 4512 | SrcSharedA.tsx |  |
| interactionBehaviorEnum | Gc | 4513 | SrcSharedA.tsx |  |
| updateChannelEnum | Kc | 4514 | SrcSharedA.tsx |  |
| zoomLevelSchema | qc | 4515 | SrcSharedA.tsx |  |
| integratedTerminalShellSchema | Jc | 4516 | SrcSharedA.tsx |  |
| builtinAgentCliProvidersSchema | Yc | 4525 | SrcSharedA.tsx |  |
| providerFamilyModesSchema | Xc | 4526 | SrcSharedA.tsx |  |
| providerFamilyDomainEnum | Zc | 4530 | SrcSharedA.tsx |  |
| providerFamilySelectedKeysSchema | Qc | 4531 | SrcSharedA.tsx |  |
| isRepoSnapshotIndexingUserEnabled | $c | 4535 | SrcSharedA.tsx | ·export Go |
| releaseNotesSchema | el | 4538 | SrcSharedA.tsx |  |
| skippedUpdateVersionsSchema | tl | 4548 | SrcSharedA.tsx |  |
| remoteTargetSchema | nl | 4549 | SrcSharedA.tsx |  |
| workspaceSessionEntrySchema | rl | 4577 | SrcSharedA.tsx |  |
| webRemoteRelayDeviceSchema | il | 4591 | SrcSharedA.tsx |  |
| webRemoteEnabledContextSchema | al | 4594 | SrcSharedA.tsx |  |
| zcodeEndpointOriginSchema | ol | 4599 | SrcSharedA.tsx |  |
| migrateZcodeEndpointOrigin | sl | 4608 | SrcSharedA.tsx |  |
| migrateOptimizeAgentExperience | cl | 4623 | SrcSharedA.tsx |  |
| migrateCloseToTrayOnWindows | ll | 4632 | SrcSharedA.tsx |  |
| migrateLocalePreference | ul | 4641 | SrcSharedA.tsx |  |
| remoteWorkspaceHistoryEntrySchema | dl | 4651 | SrcSharedA.tsx |  |
| migrateEnabledBuiltinAgentCliProviders | fl | 4661 | SrcSharedA.tsx |  |
| stripResourcePackagesFromTarget | pl | 4667 | SrcSharedA.tsx |  |
| migrateLastWorkspaceSession | ml | 4677 | SrcSharedA.tsx |  |
| approvalPolicyEnum | hl | 4831 | SrcSharedA.tsx |  |
| BUILTIN_PROVIDER_PREFIX | gl | 4832 | SrcSharedA.tsx |  |
| providerIds | W | 4833 | SrcSharedA.tsx | ·export mo |
| isBuiltinProviderId | _l | 4842 | SrcSharedA.tsx | ·export Eo |
| isZaiPlanProviderId | vl | 4845 | SrcSharedA.tsx | ·export Po |
| isStartPlanProviderId | yl | 4848 | SrcSharedA.tsx | ·export No |
| isCodingPlanProviderId | bl | 4851 | SrcSharedA.tsx | ·export Do |
| GLM_MODEL_IDS | xl | 4854 | SrcSharedA.tsx | ·export vo |
| GLM_REASONING_LEVELS | Sl | 4855 | SrcSharedA.tsx | ·export ho |
| GLM_DEFAULT_MODEL_PREFIX | Cl | 4856 | SrcSharedA.tsx |  |
| GLM_DATED_MODEL_REGEX | wl | 4857 | SrcSharedA.tsx |  |
| isGlmModelId | Tl | 4858 | SrcSharedA.tsx | ·export Oo |
| CLAUDE_TO_GLM_MODEL_MAP | El | 4863 | SrcSharedA.tsx | ·export yo |
| modelAliasOverrideSchema | Dl | 4871 | SrcSharedA.tsx |  |
| apiFormatEnum | Ol | 4879 | SrcSharedA.tsx |  |
| wireFormatEnum | kl | 4880 | SrcSharedA.tsx |  |
| providerKindEnum | Al | 4881 | SrcSharedA.tsx |  |
| devProviderIdEnum | jl | 4882 | SrcSharedA.tsx |  |
| modalityEnum | Ml | 4883 | SrcSharedA.tsx |  |
| envPathSchema | Nl | 4884 | SrcSharedA.tsx |  |
| envOverrideSchema | Pl | 4887 | SrcSharedA.tsx |  |
| reasoningLevelConfigSchema | Fl | 4893 | SrcSharedA.tsx |  |
| endpointsByKindSchema | Il | 4897 | SrcSharedA.tsx |  |
| providerEndpointsSchema | Ll | 4898 | SrcSharedA.tsx |  |

## 56. B5 · SrcSharedB.tsx（src-HCld2afU 共享 chunk 下半部，jsx 4902–9742）

- 族/来源：独立 chunk · 解码对象 `src-reconstructed/renderer/assets/src-HCld2afU.jsx`（9,742 行 pretty 孪生）· B5-10b。行号口径：jsx 孪生行。
- 符号条数：769（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| CatalogModelSchema | Rl | 4902 | SrcSharedB.tsx |  |
| CatalogProviderSchema | zl | 4917 | SrcSharedB.tsx |  |
| CatalogModelEntrySchema | Bl | 4928 | SrcSharedB.tsx |  |
| ProviderSourceEnum | Vl | 4935 | SrcSharedB.tsx |  |
| ProviderSystemDisabledReasonEnum | Hl | 4936 | SrcSharedB.tsx |  |
| ProviderEndpointsSchema | Ul | 4937 | SrcSharedB.tsx |  |
| ProviderEndpointsOverrideSchema | Wl | 4942 | SrcSharedB.tsx |  |
| ProviderConfigEntryListSchema | Gl | 4970 | SrcSharedB.tsx |  |
| isProviderEnabled | Kl | 5001 | SrcSharedB.tsx |  |
| isProviderReadyForUse | ql | 5004 | SrcSharedB.tsx |  |
| hasAnyReadyProvider | Jl | 5013 | SrcSharedB.tsx |  |
| MODEL_CONTEXT_WINDOW_DEFAULT | Yl | 5016 | SrcSharedB.tsx |  |
| MODEL_CONTEXT_WINDOW_FALLBACK | Xl | 5017 | SrcSharedB.tsx |  |
| MODEL_CONTEXT_WINDOW_UNLIMITED | Zl | 5018 | SrcSharedB.tsx |  |
| isUnlimitedContextModelId | Ql | 5019 | SrcSharedB.tsx |  |
| resolveModelContextWindow | $l | 5022 | SrcSharedB.tsx |  |
| normalizeProviderId | eu | 5028 | SrcSharedB.tsx |  |
| isObjectRecord | tu | 5031 | SrcSharedB.tsx |  |
| resolveModelDisplayName | nu | 5034 | SrcSharedB.tsx |  |
| listProviderModelIds | ru | 5037 | SrcSharedB.tsx |  |
| findProviderModel | iu | 5040 | SrcSharedB.tsx |  |
| dedupeStrings | au | 5044 | SrcSharedB.tsx |  |
| mapModelFormatToKind | ou | 5047 | SrcSharedB.tsx |  |
| mapKindToModelFormat | su | 5059 | SrcSharedB.tsx |  |
| normalizeCatalogModel | cu | 5069 | SrcSharedB.tsx |  |
| resolveProviderDefaultKind | lu | 5110 | SrcSharedB.tsx |  |
| mapKindToApiFormat | uu | 5125 | SrcSharedB.tsx |  |
| mapApiFormatToKind | du | 5135 | SrcSharedB.tsx |  |
| mapKindToDefaultEndpointPath | fu | 5145 | SrcSharedB.tsx |  |
| isHttpUrl | pu | 5155 | SrcSharedB.tsx |  |
| normalizeEndpointBaseUrl | mu | 5163 | SrcSharedB.tsx |  |
| joinEndpointUrlParts | hu | 5179 | SrcSharedB.tsx |  |
| stripKnownEndpointPathSuffix | gu | 5184 | SrcSharedB.tsx |  |
| canonicalizeEndpointUrl | _u | 5197 | SrcSharedB.tsx |  |
| resolveProviderKindEndpointUrl | vu | 5200 | SrcSharedB.tsx |  |
| listEndpointKinds | yu | 5205 | SrcSharedB.tsx |  |
| hasOwnPropertySafe | bu | 5210 | SrcSharedB.tsx |  |
| listEndpointApiFormats | xu | 5213 | SrcSharedB.tsx |  |
| mapApiFormatToModelFormats | Su | 5218 | SrcSharedB.tsx |  |
| resolveProviderApiFormat | Cu | 5228 | SrcSharedB.tsx |  |
| resolveProviderPrimaryEndpointUrl | wu | 5231 | SrcSharedB.tsx |  |
| resolveModelSupportedKinds | Tu | 5238 | SrcSharedB.tsx |  |
| ZCODE_PROTOCOL_NAME | Eu | 5243 | SrcSharedB.tsx |  |
| NonEmptyTrimmedStringSchema | G | 5244 | SrcSharedB.tsx |  |
| JsonObjectRecordSchema | K | 5245 | SrcSharedB.tsx |  |
| NonNegativeIntegerSchema | q | 5246 | SrcSharedB.tsx |  |
| TimestampValueSchema | Du | 5247 | SrcSharedB.tsx |  |
| NodeReplImagesDisplaySchema | Ou | 5248 | SrcSharedB.tsx |  |
| ToolResultDisplaySchema | ku | 5257 | SrcSharedB.tsx |  |
| StringOrIntegerIdSchema | Au | 5266 | SrcSharedB.tsx |  |
| TraceContextSchema | ju | 5267 | SrcSharedB.tsx |  |
| AgentResourceSampleSchema | Mu | 5293 | SrcSharedB.tsx |  |
| MessageInputSourceEnum | Nu | 5302 | SrcSharedB.tsx |  |
| SessionPersistenceEnum | Pu | 5303 | SrcSharedB.tsx |  |
| PermissionOptionSchema | Fu | 5304 | SrcSharedB.tsx |  |
| NameValueEntrySchema | Iu | 5311 | SrcSharedB.tsx |  |
| McpOAuthConfigSchema | Lu | 5315 | SrcSharedB.tsx |  |
| McpServerConfigSchema | Ru | 5329 | SrcSharedB.tsx |  |
| McpServerStatusSchema | zu | 5347 | SrcSharedB.tsx |  |
| McpConnectionActionEnum | Bu | 5360 | SrcSharedB.tsx |  |
| ImportedHistoryMessageSchema | Vu | 5368 | SrcSharedB.tsx |  |
| ImportedClaudeHistorySchema | Hu | 5373 | SrcSharedB.tsx |  |
| ThoughtLevelOptionSchema | Uu | 5380 | SrcSharedB.tsx |  |
| ReasoningLevelConfigSchema | Wu | 5385 | SrcSharedB.tsx |  |
| AvailableModelEntrySchema | Gu | 5391 | SrcSharedB.tsx |  |
| RuntimeProviderKindEnum | Ku | 5407 | SrcSharedB.tsx |  |
| RuntimeApiFormatEnum | qu | 5408 | SrcSharedB.tsx |  |
| RuntimeProviderSourceEnum | Ju | 5409 | SrcSharedB.tsx |  |
| ApiKeyReferenceSchema | Yu | 5410 | SrcSharedB.tsx |  |
| ApiKeyMaterialSchema | Xu | 5423 | SrcSharedB.tsx |  |
| RuntimeModelEntrySchema | Zu | 5436 | SrcSharedB.tsx |  |
| RuntimeProviderWithKeyRefSchema | Qu | 5450 | SrcSharedB.tsx |  |
| RuntimeProviderWithInlineKeySchema | $u | 5467 | SrcSharedB.tsx |  |
| RuntimeModelSelectionSchema | J | 5482 | SrcSharedB.tsx |  |
| trimProviderEndpoints | ed | 5494 | SrcSharedB.tsx |  |
| resolveProviderEndpointBundle | td | 5505 | SrcSharedB.tsx |  |
| resolveProviderSourceBucket | nd | 5515 | SrcSharedB.tsx |  |
| resolveProviderModelFormats | rd | 5518 | SrcSharedB.tsx |  |
| resolveCatalogModelEntry | id | 5522 | SrcSharedB.tsx |  |
| trimHeaderRecord | ad | 5542 | SrcSharedB.tsx |  |
| capitalizeLabel | od | 5547 | SrcSharedB.tsx |  |
| modelSupportsKind | sd | 5551 | SrcSharedB.tsx |  |
| buildReasoningViewModel | cd | 5554 | SrcSharedB.tsx |  |
| buildProviderOptionsByLevel | ld | 5574 | SrcSharedB.tsx |  |
| providerOptionsKeyForKind | ud | 5585 | SrcSharedB.tsx |  |
| buildReasoningProviderOptions | dd | 5595 | SrcSharedB.tsx |  |
| setNestedOptionValue | fd | 5601 | SrcSharedB.tsx |  |
| deleteNestedOptionValue | pd | 5612 | SrcSharedB.tsx |  |
| resolveModelIdForKind | md | 5622 | SrcSharedB.tsx |  |
| VISION_INPUT_MODALITIES | hd | 5625 | SrcSharedB.tsx |  |
| isModelsDevSourcedProvider | gd | 5626 | SrcSharedB.tsx |  |
| modelAcceptsVisionInput | _d | 5629 | SrcSharedB.tsx |  |
| providerSupportsVisionModels | vd | 5632 | SrcSharedB.tsx |  |
| buildRuntimeProviderFromConfig | yd | 5635 | SrcSharedB.tsx |  |
| ModelCatalogSnapshotSchema | bd | 5694 | SrcSharedB.tsx |  |
| TodoItemSchema | xd | 5702 | SrcSharedB.tsx |  |
| GoalStatsSchema | Sd | 5707 | SrcSharedB.tsx |  |
| TodoGroupSchema | Cd | 5716 | SrcSharedB.tsx |  |
| SessionSettingsStateSchema | wd | 5725 | SrcSharedB.tsx |  |
| PendingPermissionRequestSchema | Td | 5746 | SrcSharedB.tsx |  |
| ActiveToolCallSchema | Ed | 5757 | SrcSharedB.tsx |  |
| SessionProjectionSchema | Dd | 5763 | SrcSharedB.tsx |  |
| SlashCommandSchema | Od | 5783 | SrcSharedB.tsx |  |
| ModelStreamEventKindEnum | kd | 5789 | SrcSharedB.tsx |  |
| ModelStreamingPayloadSchema | Ad | 5790 | SrcSharedB.tsx |  |
| SessionSnapshotSchema | jd | 5801 | SrcSharedB.tsx |  |
| SessionEventEnvelopeBaseSchema | Md | 5816 | SrcSharedB.tsx |  |
| SerializedErrorSchema | Nd | 5826 | SrcSharedB.tsx |  |
| SessionCreatedPayloadSchema | Pd | 5835 | SrcSharedB.tsx |  |
| SessionResumedPayloadSchema | Fd | 5839 | SrcSharedB.tsx |  |
| SessionTitleUpdatedPayloadSchema | Id | 5848 | SrcSharedB.tsx |  |
| TurnStartedPayloadSchema | Ld | 5855 | SrcSharedB.tsx |  |
| PLAN_APPROVAL_FEEDBACK_SOURCE | Rd | 5870 | SrcSharedB.tsx |  |
| SteerCommandKindEnum | zd | 5871 | SrcSharedB.tsx |  |
| SteerDeliveryModeEnum | Bd | 5872 | SrcSharedB.tsx |  |
| TurnSteerQueuedPayloadSchema | Vd | 5873 | SrcSharedB.tsx |  |
| TurnSteerDrainedPayloadSchema | Hd | 5888 | SrcSharedB.tsx |  |
| TurnCompletedPayloadSchema | Ud | 5902 | SrcSharedB.tsx |  |
| TurnFailedPayloadSchema | Wd | 5918 | SrcSharedB.tsx |  |
| MessageUpsertedPayloadSchema | Gd | 5923 | SrcSharedB.tsx |  |
| MessageRemovedPayloadSchema | Kd | 5930 | SrcSharedB.tsx |  |
| PartDeltaPayloadSchema | qd | 5934 | SrcSharedB.tsx |  |
| PartSnapshotPayloadSchema | Jd | 5940 | SrcSharedB.tsx |  |
| PartRemovedPayloadSchema | Yd | 5943 | SrcSharedB.tsx |  |
| ToolUpdateBaseSchema | Xd | 5948 | SrcSharedB.tsx |  |
| ToolUpdatedPayloadSchema | Zd | 5959 | SrcSharedB.tsx |  |
| PermissionRequestedPayloadSchema | Qd | 5998 | SrcSharedB.tsx |  |
| PermissionResolvedPayloadSchema | $d | 6009 | SrcSharedB.tsx |  |
| UserInputRequestedPayloadSchema | ef | 6018 | SrcSharedB.tsx |  |
| UserInputResolvedPayloadSchema | tf | 6024 | SrcSharedB.tsx |  |
| SessionClosedPayloadSchema | nf | 6029 | SrcSharedB.tsx |  |
| sessionEvent | Y | 6032 | SrcSharedB.tsx |  |
| SessionEventSchema | rf | 6038 | SrcSharedB.tsx |  |
| SubagentSessionBaseSchema | af | 6064 | SrcSharedB.tsx |  |
| ActiveSubagentSchema | of | 6074 | SrcSharedB.tsx |  |
| EndedSubagentSchema | sf | 6077 | SrcSharedB.tsx |  |
| WorkspaceStateSchema | cf | 6090 | SrcSharedB.tsx |  |
| PREFLIGHT_PROTOCOL_VERSION | lf | 6159 | SrcSharedB.tsx |  |
| ModelContextBudgetStrategyEnum | uf | 6160 | SrcSharedB.tsx |  |
| BrowserAmbientContextSchema | df | 6168 | SrcSharedB.tsx |  |
| GoalQueueActionEnum | ff | 6241 | SrcSharedB.tsx |  |
| BackgroundTaskStatusEnum | pf | 6255 | SrcSharedB.tsx |  |
| BackgroundTaskSchema | mf | 6256 | SrcSharedB.tsx |  |
| WorkspaceProviderRegistrySchema | hf | 6332 | SrcSharedB.tsx |  |
| ProviderRegistryApplyStatusEnum | gf | 6337 | SrcSharedB.tsx |  |
| AskUserQuestionSchema | _f | 6413 | SrcSharedB.tsx |  |
| CredentialPromptReasonEnum | vf | 6440 | SrcSharedB.tsx |  |
| PluginConfigValueSchema | yf | 6454 | SrcSharedB.tsx |  |
| PluginHookDetailSchema | bf | 6455 | SrcSharedB.tsx |  |
| PluginUserConfigOptionSchema | xf | 6469 | SrcSharedB.tsx |  |
| PluginComponentGroupSchema | Sf | 6477 | SrcSharedB.tsx |  |
| PluginDescriptorSchema | Cf | 6484 | SrcSharedB.tsx |  |
| PluginDiagnosticSchema | wf | 6507 | SrcSharedB.tsx |  |
| PluginAuthorityEntrySchema | Tf | 6519 | SrcSharedB.tsx |  |
| PluginInstallScopeEnum | Ef | 6544 | SrcSharedB.tsx |  |
| PluginListingSchema | Df | 6545 | SrcSharedB.tsx |  |
| PluginMarketplaceSchema | Of | 6560 | SrcSharedB.tsx |  |
| AvailablePluginEntrySchema | kf | 6575 | SrcSharedB.tsx |  |
| InstalledPluginEntrySchema | Af | 6585 | SrcSharedB.tsx |  |
| AutomationScheduleRuleSchema | jf | 6698 | SrcSharedB.tsx |  |
| AutomationIntervalUnitEnum | Mf | 6709 | SrcSharedB.tsx |  |
| AutomationRecordSchema | Nf | 6710 | SrcSharedB.tsx |  |
| ZcodeRpcMethods | Pf | 6797 | SrcSharedB.tsx |  |
| StreamRowKeySchema | Ff | 6857 | SrcSharedB.tsx |  |
| StreamTimestampSchema | If | 6861 | SrcSharedB.tsx |  |
| StreamTextFieldEnum | Lf | 6862 | SrcSharedB.tsx |  |
| STREAM_TRANSPORT_LIMITS | Rf | 6863 | SrcSharedB.tsx |  |
| Base64StringSchema | zf | 6893 | SrcSharedB.tsx |  |
| crc32Hex | Bf | 6894 | SrcSharedB.tsx |  |
| BASE64_ALPHABET | Vf | 6902 | SrcSharedB.tsx |  |
| encodeBase64FromBytes | Hf | 6903 | SrcSharedB.tsx |  |
| decodeBase64ToBytes | Uf | 6916 | SrcSharedB.tsx |  |
| RPC_FRAME_LIMITS | Wf | 6932 | SrcSharedB.tsx |  |
| PositiveSafeIntegerSchema | Gf | 6939 | SrcSharedB.tsx |  |
| NonNegativeSafeIntegerSchema | Kf | 6940 | SrcSharedB.tsx |  |
| BridgeTransportIdStringSchema | qf | 6941 | SrcSharedB.tsx |  |
| RpcFrameChecksumSchema | Jf | 6947 | SrcSharedB.tsx |  |
| isValidRpcFramePayload | Yf | 6951 | SrcSharedB.tsx |  |
| RpcDataFrameSchema | Xf | 6956 | SrcSharedB.tsx |  |
| RpcFrameAckSchema | Zf | 6979 | SrcSharedB.tsx |  |
| RpcFramePayloadSchema | Qf | 6986 | SrcSharedB.tsx |  |
| TaskMirrorNonEmptyString | X | 6993 | SrcSharedB.tsx |  |
| TASK_MODE_IDS | $f | 6994 | SrcSharedB.tsx |  |
| TASK_PROVIDER_IDS | ep | 6995 | SrcSharedB.tsx |  |
| TASK_MIGRATION_SOURCES | tp | 6996 | SrcSharedB.tsx |  |
| TaskChangeSummarySchema | np | 6997 | SrcSharedB.tsx |  |
| TaskMirrorMetaSchema | rp | 7009 | SrcSharedB.tsx |  |
| automationsWorkspaceKey | ip | 7034 | SrcSharedB.tsx |  |
| TaskMirrorInvalidationReasonEnum | ap | 7037 | SrcSharedB.tsx |  |
| TaskMirrorDeliveryPurposeEnum | op | 7038 | SrcSharedB.tsx |  |
| TaskMirrorDeliverySourceEnum | sp | 7039 | SrcSharedB.tsx |  |
| TaskMirrorEventBaseSchema | cp | 7040 | SrcSharedB.tsx |  |
| TaskMirrorStreamWatermarkSchema | lp | 7048 | SrcSharedB.tsx |  |
| TaskMirrorInvalidationBaseSchema | up | 7052 | SrcSharedB.tsx |  |
| assertWorkspaceKeyMatchesIdentity | dp | 7056 | SrcSharedB.tsx |  |
| assertRunIdMatchesTraceId | fp | 7064 | SrcSharedB.tsx |  |
| TaskSnapshotInvalidatedEventSchema | pp | 7071 | SrcSharedB.tsx |  |
| WorkspaceTaskListInvalidatedEventSchema | mp | 7075 | SrcSharedB.tsx |  |
| TaskMirrorAttachmentSchema | hp | 7080 | SrcSharedB.tsx |  |
| TaskMirrorStreamEventSchema | gp | 7102 | SrcSharedB.tsx |  |
| TaskMirrorUserMessageOpSchema | _p | 7107 | SrcSharedB.tsx |  |
| TaskMirrorStreamEventOpSchema | vp | 7114 | SrcSharedB.tsx |  |
| TaskMirrorStreamOpSchema | yp | 7118 | SrcSharedB.tsx |  |
| TaskMirrorSequencedStreamOpSchema | bp | 7119 | SrcSharedB.tsx |  |
| TaskMirrorStreamTargetSchema | xp | 7124 | SrcSharedB.tsx |  |
| TaskMirrorValidatedStreamTargetSchema | Sp | 7134 | SrcSharedB.tsx |  |
| TaskStreamMirrorBatchEventSchema | Cp | 7137 | SrcSharedB.tsx |  |
| TaskMirrorStreamReleaseTargetSchema | wp | 7149 | SrcSharedB.tsx |  |
| TaskRunLeaseRequestSchema | Tp | 7150 | SrcSharedB.tsx |  |
| TaskRunLeaseResultSchema | Ep | 7155 | SrcSharedB.tsx |  |
| TaskOwnerCommandBaseSchema | Dp | 7165 | SrcSharedB.tsx |  |
| StopGenerationOwnerCommandSchema | Op | 7173 | SrcSharedB.tsx |  |
| RespondPermissionOwnerCommandSchema | kp | 7176 | SrcSharedB.tsx |  |
| RespondElicitationOwnerCommandSchema | Ap | 7182 | SrcSharedB.tsx |  |
| SendPromptTaskCommandSchema | jp | 7188 | SrcSharedB.tsx |  |
| EnqueueTaskCommandSchema | Mp | 7207 | SrcSharedB.tsx |  |
| PromoteTaskCommandSchema | Np | 7211 | SrcSharedB.tsx |  |
| CancelTaskCommandSchema | Pp | 7216 | SrcSharedB.tsx |  |
| TaskOwnerCommandSchema | Fp | 7221 | SrcSharedB.tsx |  |
| TaskOwnerCommandWithRequesterSchema | Ip | 7224 | SrcSharedB.tsx |  |
| TaskOwnerCommandErrorCodeEnum | Lp | 7239 | SrcSharedB.tsx |  |
| TaskOwnerCommandResultSchema | Rp | 7240 | SrcSharedB.tsx |  |
| TaskRealtimeEventSchema | zp | 7250 | SrcSharedB.tsx |  |
| TaskRealtimeEventWithOriginSchema | Bp | 7253 | SrcSharedB.tsx |  |
| RemoteBridgeNonEmptyString | Z | 7265 | SrcSharedB.tsx |  |
| RemoteBridgeTransportIdSchema | Q | 7266 | SrcSharedB.tsx |  |
| WindowControlWorkspaceListSchema | Vp | 7267 | SrcSharedB.tsx |  |
| WindowControlTaskListSchema | Hp | 7290 | SrcSharedB.tsx |  |
| MobileBridgeFailureReasonEnum | Up | 7306 | SrcSharedB.tsx |  |
| WorkspaceBridgeDescriptorSchema | Wp | 7307 | SrcSharedB.tsx |  |
| RemoteViewStateChangedSchema | Gp | 7326 | SrcSharedB.tsx |  |
| RemoteDeviceInfoSchema | Kp | 7331 | SrcSharedB.tsx |  |
| WindowControlBootstrapResultSchema | qp | 7352 | SrcSharedB.tsx |  |
| WorkspaceListSnapshotSchema | Jp | 7359 | SrcSharedB.tsx |  |
| RemotePlatformRequestMethodEnum | Yp | 7365 | SrcSharedB.tsx |  |
| SshRemoteTargetSchema | Xp | 7476 | SrcSharedB.tsx |  |
| WslRemoteTargetSchema | Zp | 7490 | SrcSharedB.tsx |  |
| RemoteConnectionTargetSchema | Qp | 7495 | SrcSharedB.tsx |  |
| InterWindowBroadcastMessageSchema | $p | 7545 | SrcSharedB.tsx |  |
| RemoteAssetsConfigSchema | em | 7550 | SrcSharedB.tsx |  |
| AgentWarmupTargetSchema | tm | 7556 | SrcSharedB.tsx |  |
| InitLocalAgentHostCommandSchema | nm | 7560 | SrcSharedB.tsx |  |
| InitRemoteAgentHostCommandSchema | rm | 7572 | SrcSharedB.tsx |  |
| InitRemoteWorkspaceCommandSchema | im | 7577 | SrcSharedB.tsx |  |
| InitRemoteSshHostCommandSchema | am | 7586 | SrcSharedB.tsx |  |
| InitRemoteWslHostCommandSchema | om | 7593 | SrcSharedB.tsx |  |
| AttachServicePortCommandSchema | sm | 7600 | SrcSharedB.tsx |  |
| DetachServicePortCommandSchema | cm | 7605 | SrcSharedB.tsx |  |
| AcquireRemoteWorkspaceCommandSchema | lm | 7609 | SrcSharedB.tsx |  |
| ReleaseRemoteWorkspaceCommandSchema | um | 7616 | SrcSharedB.tsx |  |
| DisposeAgentHostCommandSchema | dm | 7622 | SrcSharedB.tsx |  |
| BroadcastAgentHostCommandSchema | fm | 7625 | SrcSharedB.tsx |  |
| TaskRealtimeDeliverCommandSchema | pm | 7629 | SrcSharedB.tsx |  |
| TaskRunLeaseResultCommandSchema | mm | 7633 | SrcSharedB.tsx |  |
| TaskOwnerCommandDeliverCommandSchema | hm | 7637 | SrcSharedB.tsx |  |
| TaskOwnerCommandResultCommandSchema | gm | 7641 | SrcSharedB.tsx |  |
| BotReconnectResultCommandSchema | _m | 7645 | SrcSharedB.tsx |  |
| BotConnectionStatusResultCommandSchema | vm | 7652 | SrcSharedB.tsx |  |
| BotRuntimePortResultCommandSchema | ym | 7659 | SrcSharedB.tsx |  |
| SessionMessageDeliverRequestSchema | bm | 7665 | SrcSharedB.tsx |  |
| SessionMessageDeliveryResultSchema | xm | 7673 | SrcSharedB.tsx |  |
| SessionRouteAnnouncePayloadSchema | Sm | 7680 | SrcSharedB.tsx |  |
| AgentConnectedEventSchema | Cm | 7725 | SrcSharedB.tsx |  |
| RemoteWorkspaceAcquiredEventSchema | wm | 7728 | SrcSharedB.tsx |  |
| AgentErrorEventSchema | Tm | 7737 | SrcSharedB.tsx |  |
| AgentLogEventSchema | Em | 7741 | SrcSharedB.tsx |  |
| AgentMigrationProviderEnum | Dm | 7747 | SrcSharedB.tsx |  |
| AgentProcessSpawnedEventSchema | Om | 7748 | SrcSharedB.tsx |  |
| AgentProcessReadyEventSchema | km | 7759 | SrcSharedB.tsx |  |
| AgentProcessExitedEventSchema | Am | 7769 | SrcSharedB.tsx |  |
| AgentProcessErrorEventSchema | jm | 7786 | SrcSharedB.tsx |  |
| AgentResourceSampleEventSchema | Mm | 7801 | SrcSharedB.tsx |  |
| AgentRunningTaskCountChangedEventSchema | Nm | 7806 | SrcSharedB.tsx |  |
| WorkspaceRunningTaskCountChangedEventSchema | Pm | 7810 | SrcSharedB.tsx |  |
| RepoWikiRunningTaskCountChangedEventSchema | Fm | 7816 | SrcSharedB.tsx |  |
| TaskRealtimePublishEventSchema | Im | 7820 | SrcSharedB.tsx |  |
| TaskStreamOpPublishEventSchema | Lm | 7824 | SrcSharedB.tsx |  |
| TaskRunLeaseAcquireEventSchema | Rm | 7829 | SrcSharedB.tsx |  |
| TaskRunLeaseReleaseEventSchema | zm | 7833 | SrcSharedB.tsx |  |
| TaskOwnerCommandRequestEventSchema | Bm | 7837 | SrcSharedB.tsx |  |
| TaskOwnerCommandResultEventSchema | Vm | 7841 | SrcSharedB.tsx |  |
| BotReconnectRequestEventSchema | Hm | 7845 | SrcSharedB.tsx |  |
| BotConnectionStatusRequestEventSchema | Um | 7852 | SrcSharedB.tsx |  |
| BotRuntimePortRequestEventSchema | Wm | 7859 | SrcSharedB.tsx |  |
| SessionMessageSendRequestedEventSchema | Gm | 7866 | SrcSharedB.tsx |  |
| SessionRouteAnnounceEventSchema | Km | 7870 | SrcSharedB.tsx |  |
| SessionMessageDeliverResultEventSchema | qm | 7874 | SrcSharedB.tsx |  |
| FeedbackLogArchiveRequestEventSchema | Jm | 7878 | SrcSharedB.tsx |  |
| CronRunResultEventSchema | Ym | 7883 | SrcSharedB.tsx |  |
| OffPeakRunResultEventSchema | Xm | 7892 | SrcSharedB.tsx |  |
| CronSchedulerWakeRequestEventSchema | Zm | 7901 | SrcSharedB.tsx |  |
| OffPeakSchedulerWakeRequestEventSchema | Qm | 7905 | SrcSharedB.tsx |  |
| BrowserExecuteRequestEventSchema | $m | 7909 | SrcSharedB.tsx |  |
| NetworkTelemetryObservationSchema | eh | 7924 | SrcSharedB.tsx |  |
| TaskSnapshotStatusEnum | th | 7942 | SrcSharedB.tsx |  |
| SnapshotAttachmentSchema | nh | 7943 | SrcSharedB.tsx |  |
| SnapshotToolCallSchema | rh | 7959 | SrcSharedB.tsx |  |
| SnapshotMessagePartSchema | ih | 7976 | SrcSharedB.tsx |  |
| SnapshotMessageSchema | ah | 7986 | SrcSharedB.tsx |  |
| GoalTargetStatusEnum | oh | 8018 | SrcSharedB.tsx |  |
| GoalStateActionKindEnum | sh | 8019 | SrcSharedB.tsx |  |
| GoalStateSourceEnum | ch | 8020 | SrcSharedB.tsx |  |
| GoalTargetSchema | lh | 8021 | SrcSharedB.tsx |  |
| TaskSnapshotMetaSchema | uh | 8044 | SrcSharedB.tsx |  |
| NativeSnapshotSyncStateEnum | dh | 8090 | SrcSharedB.tsx |  |
| TaskSnapshotFileKeySchema | fh | 8097 | SrcSharedB.tsx |  |
| FileChangeSnapshotSchema | ph | 8105 | SrcSharedB.tsx |  |
| TurnFileChangesSnapshotSchema | mh | 8118 | SrcSharedB.tsx |  |
| TurnCheckpointSchema | hh | 8123 | SrcSharedB.tsx |  |
| REMOTE_WORKSPACE_KEY_PREFIX | gh | 8134 | SrcSharedB.tsx |  |
| REMOTE_KIND_SEGMENT_COUNTS | _h | 8135 | SrcSharedB.tsx |  |
| isRemoteWorkspaceKind | vh | 8141 | SrcSharedB.tsx |  |
| normalizeRemoteWorkspacePath | yh | 8144 | SrcSharedB.tsx |  |
| sanitizeServerIdForWorkspaceKey | bh | 8147 | SrcSharedB.tsx |  |
| buildRemoteServerWorkspaceKey | xh | 8152 | SrcSharedB.tsx |  |
| parseRemoteWorkspaceKey | Sh | 8155 | SrcSharedB.tsx |  |
| MODEL_ONLY_VISIBILITY | Ch | 8179 | SrcSharedB.tsx |  |
| FORK_MESSAGE_SOURCE | wh | 8180 | SrcSharedB.tsx |  |
| GOAL_CONTINUATION_REMINDER_TAG | Th | 8181 | SrcSharedB.tsx |  |
| GOAL_CONTINUATION_PROMPT_LINE | Eh | 8182 | SrcSharedB.tsx |  |
| GOAL_STATE_SECTION_HEADING | Dh | 8183 | SrcSharedB.tsx |  |
| TASK_NOTIFICATION_TAG | Oh | 8184 | SrcSharedB.tsx |  |
| SUBAGENT_NOTIFICATION_TAG | kh | 8185 | SrcSharedB.tsx |  |
| REWIND_APPLIED_NOTICE_LINES | Ah | 8186 | SrcSharedB.tsx |  |
| PROVIDER_ONLY_MESSAGE_SOURCES | jh | 8187 | SrcSharedB.tsx |  |
| classifyMessageVisibility | Mh | 8188 | SrcSharedB.tsx |  |
| isTimelineOnlyMessage | Nh | 8206 | SrcSharedB.tsx |  |
| hasProviderOnlyParts | Ph | 8214 | SrcSharedB.tsx |  |
| resolveMessageSource | Fh | 8220 | SrcSharedB.tsx |  |
| isGoalContinuationText | Ih | 8224 | SrcSharedB.tsx |  |
| isQueuedNotificationText | Lh | 8228 | SrcSharedB.tsx |  |
| collectVisiblePartText | Rh | 8232 | SrcSharedB.tsx |  |
| isSessionForkContextMetadata | zh | 8235 | SrcSharedB.tsx |  |
| asPlainRecord | Bh | 8239 | SrcSharedB.tsx |  |
| asNonEmptyString | Vh | 8242 | SrcSharedB.tsx |  |
| GOAL_CONTINUATION_SYSTEM_TAG | Hh | 8245 | SrcSharedB.tsx |  |
| GOAL_CONTINUATION_PROMPT | Uh | 8246 | SrcSharedB.tsx |  |
| GOAL_STATE_HEADING_LINE | Wh | 8247 | SrcSharedB.tsx |  |
| SUBAGENT_MESSAGE_SOURCE | Gh | 8248 | SrcSharedB.tsx |  |
| isGoalContinuationContent | Kh | 8249 | SrcSharedB.tsx |  |
| isGoalContinuationMessage | qh | 8253 | SrcSharedB.tsx |  |
| isGoalStateContent | Jh | 8256 | SrcSharedB.tsx |  |
| isGoalStateMessage | Yh | 8260 | SrcSharedB.tsx |  |
| isMessageHiddenFromUser | Xh | 8263 | SrcSharedB.tsx |  |
| isCompactionTimelineMessage | Zh | 8268 | SrcSharedB.tsx |  |
| filterUserVisibleMessages | Qh | 8271 | SrcSharedB.tsx |  |
| resolveSessionDisplayTitle | $h | 8276 | SrcSharedB.tsx |  |
| mapSubagentStatusToDisplayStatus | eg | 8284 | SrcSharedB.tsx |  |
| hasSessionActiveWork | tg | 8289 | SrcSharedB.tsx |  |
| isSessionBusy | ng | 8292 | SrcSharedB.tsx |  |
| isToolCallsFinishReason | rg | 8295 | SrcSharedB.tsx |  |
| isSessionAssistantCompleted | ig | 8298 | SrcSharedB.tsx |  |
| resolveSessionDisplayStatus | ag | 8304 | SrcSharedB.tsx |  |
| WorkspacePathOptionSchema | og | 8309 | SrcSharedB.tsx |  |
| loginTriggerTestid | sg | 8329 | SrcSharedB.tsx |  |
| loginMenuItemTestid | cg | 8330 | SrcSharedB.tsx |  |
| loginUseApiKeyButtonTestid | lg | 8331 | SrcSharedB.tsx |  |
| loginApiKeyProviderTriggerTestid | ug | 8332 | SrcSharedB.tsx |  |
| loginApiKeyProviderItemTestid | dg | 8333 | SrcSharedB.tsx |  |
| loginApiKeyInputTestid | fg | 8334 | SrcSharedB.tsx |  |
| loginApiKeyContinueButtonTestid | pg | 8335 | SrcSharedB.tsx |  |
| loginApiKeyCancelButtonTestid | mg | 8336 | SrcSharedB.tsx |  |
| loginApiKeySkipButtonTestid | hg | 8337 | SrcSharedB.tsx |  |
| loginApiKeyErrorTestid | gg | 8338 | SrcSharedB.tsx |  |
| oauthLoginButtonTestid | _g | 8339 | SrcSharedB.tsx |  |
| oauthCancelTestid | vg | 8340 | SrcSharedB.tsx |  |
| oauthErrorTestid | yg | 8341 | SrcSharedB.tsx |  |
| appHeaderTestid | bg | 8342 | SrcSharedB.tsx |  |
| logoutButtonTestid | xg | 8343 | SrcSharedB.tsx |  |
| terminalToggleTestid | Sg | 8344 | SrcSharedB.tsx |  |
| terminalCloseButtonTestid | Cg | 8345 | SrcSharedB.tsx |  |
| gitPaneTestid | wg | 8346 | SrcSharedB.tsx |  |
| browserAddressInputTestid | Tg | 8347 | SrcSharedB.tsx |  |
| browserBackButtonTestid | Eg | 8348 | SrcSharedB.tsx |  |
| browserForwardButtonTestid | Dg | 8349 | SrcSharedB.tsx |  |
| browserRefreshButtonTestid | Og | 8350 | SrcSharedB.tsx |  |
| browserResponsiveButtonTestid | kg | 8351 | SrcSharedB.tsx |  |
| browserResponsiveViewportTestid | Ag | 8352 | SrcSharedB.tsx |  |
| browserResponsiveToolbarTestid | jg | 8353 | SrcSharedB.tsx |  |
| browserResponsiveWidthInputTestid | Mg | 8354 | SrcSharedB.tsx |  |
| browserResponsiveHeightInputTestid | Ng | 8355 | SrcSharedB.tsx |  |
| browserResponsiveZoomSelectTestid | Pg | 8356 | SrcSharedB.tsx |  |
| browserResponsiveZoomOptionTestid | Fg | 8357 | SrcSharedB.tsx |  |
| browserResponsiveScaledFrameTestid | Ig | 8358 | SrcSharedB.tsx |  |
| browserResponsiveResizeLeftTestid | Lg | 8359 | SrcSharedB.tsx |  |
| browserResponsiveResizeWidthTestid | Rg | 8360 | SrcSharedB.tsx |  |
| browserResponsiveResizeTopTestid | zg | 8361 | SrcSharedB.tsx |  |
| browserResponsiveResizeHeightTestid | Bg | 8362 | SrcSharedB.tsx |  |
| browserResponsiveResizeCornerTopLeftTestid | Vg | 8363 | SrcSharedB.tsx |  |
| browserResponsiveResizeCornerTopRightTestid | Hg | 8364 | SrcSharedB.tsx |  |
| browserResponsiveResizeCornerBottomLeftTestid | Ug | 8365 | SrcSharedB.tsx |  |
| browserResponsiveResizeCornerTestid | Wg | 8366 | SrcSharedB.tsx |  |
| browserElementPickerButtonTestid | Gg | 8367 | SrcSharedB.tsx |  |
| browserMoreButtonTestid | Kg | 8368 | SrcSharedB.tsx |  |
| browserOpenExternalItemTestid | qg | 8369 | SrcSharedB.tsx |  |
| browserDevtoolsButtonTestid | Jg | 8370 | SrcSharedB.tsx |  |
| browserWebviewTestid | Yg | 8371 | SrcSharedB.tsx |  |
| previewPaneTestid | Xg | 8372 | SrcSharedB.tsx |  |
| toolSummaryTriggerTestid | Zg | 8373 | SrcSharedB.tsx |  |
| terminalTestid | Qg | 8374 | SrcSharedB.tsx |  |
| sshConnectTriggerTestid | $g | 8375 | SrcSharedB.tsx |  |
| sshDialogTestid | e_ | 8376 | SrcSharedB.tsx |  |
| remoteKindSshTestid | t_ | 8377 | SrcSharedB.tsx |  |
| remoteKindServerTestid | n_ | 8378 | SrcSharedB.tsx |  |
| remoteKindWslTestid | r_ | 8379 | SrcSharedB.tsx |  |
| remoteKindDockerTestid | i_ | 8380 | SrcSharedB.tsx |  |
| sshHostInputTestid | a_ | 8381 | SrcSharedB.tsx |  |
| sshPortInputTestid | o_ | 8382 | SrcSharedB.tsx |  |
| sshUsernameInputTestid | s_ | 8383 | SrcSharedB.tsx |  |
| sshConfigAliasSelectTestid | c_ | 8384 | SrcSharedB.tsx |  |
| sshPasswordInputTestid | l_ | 8385 | SrcSharedB.tsx |  |
| sshPrivateKeyInputTestid | u_ | 8386 | SrcSharedB.tsx |  |
| sshAuthPasswordTestid | d_ | 8387 | SrcSharedB.tsx |  |
| sshAuthPrivateKeyTestid | f_ | 8388 | SrcSharedB.tsx |  |
| wslDistroSelectTestid | p_ | 8389 | SrcSharedB.tsx |  |
| wslUserInputTestid | m_ | 8390 | SrcSharedB.tsx |  |
| dockerContainerSelectTestid | h_ | 8391 | SrcSharedB.tsx |  |
| dockerContainerInputTestid | g_ | 8392 | SrcSharedB.tsx |  |
| serverUrlInputTestid | __ | 8393 | SrcSharedB.tsx |  |
| serverNameInputTestid | v_ | 8394 | SrcSharedB.tsx |  |
| serverTokenInputTestid | y_ | 8395 | SrcSharedB.tsx |  |
| serverWorkspacePathInputTestid | b_ | 8396 | SrcSharedB.tsx |  |
| sidebarTestid | x_ | 8397 | SrcSharedB.tsx |  |
| workspaceListTestid | S_ | 8398 | SrcSharedB.tsx |  |
| workspaceItemTestid | C_ | 8399 | SrcSharedB.tsx |  |
| workspaceCloseTestid | w_ | 8400 | SrcSharedB.tsx |  |
| conversationSectionTestid | T_ | 8401 | SrcSharedB.tsx |  |
| projectSectionTestid | E_ | 8402 | SrcSharedB.tsx |  |
| conversationNewTaskTestid | D_ | 8403 | SrcSharedB.tsx |  |
| projectAddTestid | O_ | 8404 | SrcSharedB.tsx |  |
| composerWorkspaceTriggerTestid | k_ | 8405 | SrcSharedB.tsx |  |
| composerRemoteConnectionTestid | A_ | 8406 | SrcSharedB.tsx |  |
| composerProjectDetachTestid | j_ | 8407 | SrcSharedB.tsx |  |
| composerWorkOutsideProjectTestid | M_ | 8408 | SrcSharedB.tsx |  |
| chatErrorBannerTestid | N_ | 8409 | SrcSharedB.tsx |  |
| chatEmptyTestid | P_ | 8410 | SrcSharedB.tsx |  |
| chatAttachmentButtonTestid | F_ | 8411 | SrcSharedB.tsx |  |
| chatAttachmentMenuItemTestid | I_ | 8412 | SrcSharedB.tsx |  |
| chatSendButtonTestid | L_ | 8413 | SrcSharedB.tsx |  |
| chatLoadingTestid | R_ | 8414 | SrcSharedB.tsx |  |
| chatSummaryPanelTestid | z_ | 8415 | SrcSharedB.tsx |  |
| chatAssistantHistoryTriggerTestid | B_ | 8416 | SrcSharedB.tsx |  |
| chatAssistantHistoryContentTestid | V_ | 8417 | SrcSharedB.tsx |  |
| chatBackgroundResultTitleTestid | H_ | 8418 | SrcSharedB.tsx |  |
| chatToolCallBlockTestid | U_ | 8419 | SrcSharedB.tsx |  |
| promptSuggestionPanelTestid | W_ | 8420 | SrcSharedB.tsx |  |
| promptSuggestionSectionTestid | G_ | 8421 | SrcSharedB.tsx |  |
| promptSuggestionOptionTestid | K_ | 8422 | SrcSharedB.tsx |  |
| promptSuggestionStatusTestid | q_ | 8423 | SrcSharedB.tsx |  |
| taskListTestid | J_ | 8424 | SrcSharedB.tsx |  |
| taskNewButtonTestid | Y_ | 8425 | SrcSharedB.tsx |  |
| taskItemTestid | X_ | 8426 | SrcSharedB.tsx |  |
| taskEmptyTestid | Z_ | 8427 | SrcSharedB.tsx |  |
| taskArchiveTestid | Q_ | 8428 | SrcSharedB.tsx |  |
| taskSettingsButtonTestid | $_ | 8429 | SrcSharedB.tsx |  |
| settingsPageTestid | ev | 8430 | SrcSharedB.tsx |  |
| settingsBackButtonTestid | tv | 8431 | SrcSharedB.tsx |  |
| settingsSectionNavTestid | nv | 8432 | SrcSharedB.tsx |  |
| settingsNativeSearchSwitchTestid | rv | 8433 | SrcSharedB.tsx |  |
| settingsMemorySwitchTestid | iv | 8434 | SrcSharedB.tsx |  |
| settingsMemoryRefreshTestid | av | 8435 | SrcSharedB.tsx |  |
| settingsMemoryBackProjectsTestid | ov | 8436 | SrcSharedB.tsx |  |
| settingsMemoryBackMemoriesTestid | sv | 8437 | SrcSharedB.tsx |  |
| settingsMemoryWorkspaceTestid | cv | 8438 | SrcSharedB.tsx |  |
| settingsMemoryFileTestid | lv | 8439 | SrcSharedB.tsx |  |
| settingsMemoryPreviewTestid | uv | 8440 | SrcSharedB.tsx |  |
| settingsAskUserQuestionAutoResolutionSwitchTestid | dv | 8441 | SrcSharedB.tsx |  |
| settingsLocaleSelectTriggerTestid | fv | 8442 | SrcSharedB.tsx |  |
| settingsLocaleSelectItemTestid | pv | 8443 | SrcSharedB.tsx |  |
| mcpServerRowTestid | mv | 8444 | SrcSharedB.tsx |  |
| pluginMcpServerRowTestid | hv | 8445 | SrcSharedB.tsx |  |
| mcpOpenAuthorizationButtonTestid | gv | 8446 | SrcSharedB.tsx |  |
| subagentRowTestid | _v | 8447 | SrcSharedB.tsx |  |
| subagentBuiltInModelTriggerTestid | vv | 8448 | SrcSharedB.tsx |  |
| settingsUsageTabTestid | yv | 8449 | SrcSharedB.tsx |  |
| sidebarCodingPlanUsageButtonTestid | bv | 8450 | SrcSharedB.tsx |  |
| modelProviderNavItemTestid | xv | 8451 | SrcSharedB.tsx |  |
| modelProviderConnectionModeTriggerTestid | Sv | 8452 | SrcSharedB.tsx |  |
| modelProviderConnectionModeItemTestid | Cv | 8453 | SrcSharedB.tsx |  |
| modelProviderApiKeyInputTestid | wv | 8454 | SrcSharedB.tsx |  |
| modelProviderModelInputTestid | Tv | 8455 | SrcSharedB.tsx |  |
| modelProviderModelDeleteButtonTestid | Ev | 8456 | SrcSharedB.tsx |  |
| modelProviderAddModelButtonTestid | Dv | 8457 | SrcSharedB.tsx |  |
| chatModelSelectTriggerTestid | Ov | 8458 | SrcSharedB.tsx |  |
| chatModelSelectGroupTestid | kv | 8459 | SrcSharedB.tsx |  |
| chatModelSelectItemTestid | Av | 8460 | SrcSharedB.tsx |  |
| chatThoughtLevelSelectTriggerTestid | jv | 8461 | SrcSharedB.tsx |  |
| chatThoughtLevelSelectItemTestid | Mv | 8462 | SrcSharedB.tsx |  |
| chatModeSelectTriggerTestid | Nv | 8463 | SrcSharedB.tsx |  |
| chatModeSelectItemTestid | Pv | 8464 | SrcSharedB.tsx |  |
| chatContextUsageTriggerTestid | Fv | 8465 | SrcSharedB.tsx |  |
| chatReasoningTriggerTestid | Iv | 8466 | SrcSharedB.tsx |  |
| chatReasoningContentTestid | Lv | 8467 | SrcSharedB.tsx |  |
| workspaceHeaderTestid | Rv | 8468 | SrcSharedB.tsx |  |
| workspaceTitleTestid | zv | 8469 | SrcSharedB.tsx |  |
| workspacePathTestid | Bv | 8470 | SrcSharedB.tsx |  |
| workspaceMoreButtonTestid | Vv | 8471 | SrcSharedB.tsx |  |
| workspaceFileTreeButtonTestid | Hv | 8472 | SrcSharedB.tsx |  |
| workspaceFileTreePanelTestid | Uv | 8473 | SrcSharedB.tsx |  |
| workspaceFileTreeRefreshButtonTestid | Wv | 8474 | SrcSharedB.tsx |  |
| workspaceFileTreeRowTestid | Gv | 8475 | SrcSharedB.tsx |  |
| sshErrorTestid | Kv | 8476 | SrcSharedB.tsx |  |
| sshSuccessTestid | qv | 8477 | SrcSharedB.tsx |  |
| v4SessionPaneTestid | Jv | 8478 | SrcSharedB.tsx |  |
| v4TimelineTestid | Yv | 8479 | SrcSharedB.tsx |  |
| v4RowTestid | Xv | 8480 | SrcSharedB.tsx |  |
| v4ComposerTestid | Zv | 8481 | SrcSharedB.tsx |  |
| v4ComposerInputTestid | Qv | 8482 | SrcSharedB.tsx |  |
| v4ComposerBackgroundWorkTriggerTestid | $v | 8483 | SrcSharedB.tsx |  |
| v4ComposerSendTestid | ey | 8484 | SrcSharedB.tsx |  |
| v4ComposerClearQueueSendTestid | ty | 8485 | SrcSharedB.tsx |  |
| v4ComposerKeepQueueSendTestid | ny | 8486 | SrcSharedB.tsx |  |
| v4PausedQueueSendDialogTestid | ry | 8487 | SrcSharedB.tsx |  |
| v4AttachmentTestid | iy | 8488 | SrcSharedB.tsx |  |
| v4AttachmentUploadProgressTestid | ay | 8489 | SrcSharedB.tsx |  |
| v4AttachmentUploadRetryTestid | oy | 8490 | SrcSharedB.tsx |  |
| v4StopTestid | sy | 8491 | SrcSharedB.tsx |  |
| v4ForkTestid | cy | 8492 | SrcSharedB.tsx |  |
| v4FeedbackLikeTestid | ly | 8493 | SrcSharedB.tsx |  |
| v4FeedbackDislikeTestid | uy | 8494 | SrcSharedB.tsx |  |
| v4EditTestid | dy | 8495 | SrcSharedB.tsx |  |
| v4EditInputTestid | fy | 8496 | SrcSharedB.tsx |  |
| v4EditSubmitTestid | py | 8497 | SrcSharedB.tsx |  |
| v4EditCancelTestid | my | 8498 | SrcSharedB.tsx |  |
| v4EditAttachmentRemoveTestid | hy | 8499 | SrcSharedB.tsx |  |
| v4EditRewindWorkspaceTestid | gy | 8500 | SrcSharedB.tsx |  |
| v4EditWorkspaceConflictDialogTestid | _y | 8501 | SrcSharedB.tsx |  |
| v4EditWorkspaceConflictConversationOnlyTestid | vy | 8502 | SrcSharedB.tsx |  |
| v4QueueTestid | yy | 8503 | SrcSharedB.tsx |  |
| v4QueuePausedBannerTestid | by | 8504 | SrcSharedB.tsx |  |
| v4QueueResumeTestid | xy | 8505 | SrcSharedB.tsx |  |
| v4QueueItemTestid | Sy | 8506 | SrcSharedB.tsx |  |
| v4QueueItemDeleteTestid | Cy | 8507 | SrcSharedB.tsx |  |
| v4QueueItemEditTestid | wy | 8508 | SrcSharedB.tsx |  |
| v4QueueItemSendNowTestid | Ty | 8509 | SrcSharedB.tsx |  |
| v4SessionTitleTestid | Ey | 8510 | SrcSharedB.tsx |  |
| v4BackgroundWorkItemTestid | Dy | 8511 | SrcSharedB.tsx |  |
| v4BackgroundWorkCancelTestid | Oy | 8512 | SrcSharedB.tsx |  |
| v4ModelConfigTestid | ky | 8513 | SrcSharedB.tsx |  |
| v4RetrySubscribeTestid | Ay | 8514 | SrcSharedB.tsx |  |
| v4UserInputDialogTestid | jy | 8515 | SrcSharedB.tsx |  |
| v4UserInputOptionTestid | My | 8516 | SrcSharedB.tsx |  |
| v4UserInputTextTestid | Ny | 8517 | SrcSharedB.tsx |  |
| v4TimelineBottomTestid | Py | 8518 | SrcSharedB.tsx |  |
| v4PaneShellTestid | Fy | 8519 | SrcSharedB.tsx |  |
| v4SplitCloseTestid | Iy | 8520 | SrcSharedB.tsx |  |
| v4SplitDividerTestid | Ly | 8521 | SrcSharedB.tsx |  |
| v4PaneWorkspaceBadgeTestid | Ry | 8522 | SrcSharedB.tsx |  |
| v4TaskOpenInSplitTestid | zy | 8523 | SrcSharedB.tsx |  |
| v4TurnNavigatorTestid | By | 8524 | SrcSharedB.tsx |  |
| v4TurnNavigatorItemTestid | Vy | 8525 | SrcSharedB.tsx |  |
| v4TurnNavigatorTooltipTestid | Hy | 8526 | SrcSharedB.tsx |  |
| v4SubagentOpenSidePaneTestid | Uy | 8527 | SrcSharedB.tsx |  |
| v4RowAttachmentsTestid | Wy | 8528 | SrcSharedB.tsx |  |
| automationsOpenTestid | Gy | 8529 | SrcSharedB.tsx |  |
| automationsListTestid | Ky | 8530 | SrcSharedB.tsx |  |
| automationCreateMenuTestid | qy | 8531 | SrcSharedB.tsx |  |
| automationCreateManuallyTestid | Jy | 8532 | SrcSharedB.tsx |  |
| automationCardTestid | Yy | 8533 | SrcSharedB.tsx |  |
| offpeakCreateButtonTestid | Xy | 8534 | SrcSharedB.tsx |  |
| offpeakCardTestid | Zy | 8535 | SrcSharedB.tsx |  |
| offpeakCardMenuTestid | Qy | 8536 | SrcSharedB.tsx |  |
| offpeakEditViewTestid | $y | 8537 | SrcSharedB.tsx |  |
| offpeakEditSubmitTestid | eb | 8538 | SrcSharedB.tsx |  |
| offpeakFormTitleTestid | tb | 8539 | SrcSharedB.tsx |  |
| offpeakFormInstructionsTestid | nb | 8540 | SrcSharedB.tsx |  |
| offpeakActionPauseTestid | rb | 8541 | SrcSharedB.tsx |  |
| offpeakActionContinueTestid | ib | 8542 | SrcSharedB.tsx |  |
| offpeakActionDeleteTestid | ab | 8543 | SrcSharedB.tsx |  |
| offpeakTabTestid | ob | 8544 | SrcSharedB.tsx |  |
| automationCardMenuTestid | sb | 8545 | SrcSharedB.tsx |  |
| automationActionToggleTestid | cb | 8546 | SrcSharedB.tsx |  |
| automationActionDeleteTestid | lb | 8547 | SrcSharedB.tsx |  |
| automationFormTitleTestid | ub | 8548 | SrcSharedB.tsx |  |
| automationFormPromptTestid | db | 8549 | SrcSharedB.tsx |  |
| automationFormSubmitTestid | fb | 8550 | SrcSharedB.tsx |  |
| automationRunNowTestid | pb | 8551 | SrcSharedB.tsx |  |
| automationEditBackTestid | mb | 8552 | SrcSharedB.tsx |  |
| automationFrequencySelectTestid | hb | 8553 | SrcSharedB.tsx |  |
| automationFrequencyOptionTestid | gb | 8554 | SrcSharedB.tsx |  |
| automationCustomUnitSelectTestid | _b | 8555 | SrcSharedB.tsx |  |
| automationCustomUnitOptionTestid | vb | 8556 | SrcSharedB.tsx |  |
| automationCustomIntervalSelectTestid | yb | 8557 | SrcSharedB.tsx |  |
| automationCustomIntervalIncrementTestid | bb | 8558 | SrcSharedB.tsx |  |
| automationCustomIntervalDecrementTestid | xb | 8559 | SrcSharedB.tsx |  |
| automationCustomRepeatEditTestid | Sb | 8560 | SrcSharedB.tsx |  |
| automationCustomConfirmTestid | Cb | 8561 | SrcSharedB.tsx |  |
| automationYearMonthdayTestid | wb | 8562 | SrcSharedB.tsx |  |
| automationYearMonthOptionTestid | Tb | 8563 | SrcSharedB.tsx |  |
| automationYearDayOptionTestid | Eb | 8564 | SrcSharedB.tsx |  |
| automationSchedulePreviewTestid | Db | 8565 | SrcSharedB.tsx |  |
| automationScheduleAddTestid | Ob | 8566 | SrcSharedB.tsx |  |
| automationScheduleDeleteTestid | kb | 8567 | SrcSharedB.tsx |  |
| cronCreateCardTestid | Ab | 8568 | SrcSharedB.tsx |  |
| cronCreateOpenTestid | jb | 8569 | SrcSharedB.tsx |  |
| confirmDialogConfirmTestid | Mb | 8570 | SrcSharedB.tsx |  |
| joinTestidParts | Nb | 8571 | SrcSharedB.tsx |  |
| IpcChannelNames | Pb | 8574 | SrcSharedB.tsx |  |
| EmbeddedBrowserIpcTopics | Fb | 8609 | SrcSharedB.tsx |  |
| ServicePortIpcTopics | Ib | 8612 | SrcSharedB.tsx |  |
| BIGMODEL_PROVIDER_DOMAIN | Lb | 8617 | SrcSharedB.tsx |  |
| CREDENTIAL_DECRYPT_FAILED_CODE | Rb | 8618 | SrcSharedB.tsx |  |
| isCredentialDecryptFailure | zb | 8619 | SrcSharedB.tsx |  |
| extractErrorCode | Bb | 8623 | SrcSharedB.tsx |  |
| extractErrorMessage | Vb | 8626 | SrcSharedB.tsx |  |
| ZCODE_AGENT_AUDIENCE | Hb | 8629 | SrcSharedB.tsx |  |
| CODING_PLAN_SCOPE_PREFIX | Ub | 8630 | SrcSharedB.tsx |  |
| buildCodingPlanScope | Wb | 8631 | SrcSharedB.tsx |  |
| parseCodingPlanScope | Gb | 8638 | SrcSharedB.tsx |  |
| codingPlanScopesOverlap | Kb | 8658 | SrcSharedB.tsx |  |
| encodeScopeSegment | qb | 8664 | SrcSharedB.tsx |  |
| decodeScopeSegment | Jb | 8667 | SrcSharedB.tsx |  |
| resolveCodingPlanAttribution | Yb | 8674 | SrcSharedB.tsx |  |
| makeCodingPlanAttribution | Xb | 8691 | SrcSharedB.tsx |  |
| resolveEntitlementCacheStatus | Zb | 8698 | SrcSharedB.tsx |  |
| BROWSER_RESTORE_PENDING_URL | Qb | 8712 | SrcSharedB.tsx |  |
| sanitizeRemoteTargetForRestore | $b | 8713 | SrcSharedB.tsx |  |
| DesktopMenuActionIds | ex | 8745 | SrcSharedB.tsx |  |
| resolveClientTelemetryContext | tx | 8774 | SrcSharedB.tsx |  |
| buildWebRemoteTelemetryEvent | nx | 8789 | SrcSharedB.tsx |  |
| buildWebRemoteEntryViewTelemetryEvent | rx | 8797 | SrcSharedB.tsx |  |
| LAUNCH_MARKS_STORAGE_KEY | ix | 8803 | SrcSharedB.tsx |  |
| parseLaunchMarks | ax | 8804 | SrcSharedB.tsx |  |
| toHexByte | ox | 8823 | SrcSharedB.tsx |  |
| formatUuidFromBytes | sx | 8826 | SrcSharedB.tsx |  |
| generateUuid | cx | 8830 | SrcSharedB.tsx |  |
| newUniqueId | lx | 8841 | SrcSharedB.tsx |  |
| DEFAULT_CRON_AUTOMATION_GROUP_ID | ux | 8844 | SrcSharedB.tsx |  |
| DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID | dx | 8845 | SrcSharedB.tsx |  |
| isCronAutomationPayload | fx | 8846 | SrcSharedB.tsx |  |
| isOffPeakTaskPayload | px | 8849 | SrcSharedB.tsx |  |
| AUTOMATION_CREATE_LIMIT_REACHED | mx | 8852 | SrcSharedB.tsx |  |
| isAutomationCreateLimitError | hx | 8853 | SrcSharedB.tsx |  |
| TERMINAL_OFFPEAK_RUN_STATUSES | gx | 8856 | SrcSharedB.tsx |  |
| isTerminalOffPeakRunStatus | _x | 8857 | SrcSharedB.tsx |  |
| OFFPEAK_IDLE_PLAN_ID | vx | 8860 | SrcSharedB.tsx |  |
| MODEL_SETTING_ID | yx | 8861 | SrcSharedB.tsx |  |
| MODEL_SETTING_CATEGORY | bx | 8862 | SrcSharedB.tsx |  |
| MODE_SETTING_ID | xx | 8863 | SrcSharedB.tsx |  |
| MODE_SETTING_CATEGORY | Sx | 8864 | SrcSharedB.tsx |  |
| THOUGHT_LEVEL_SETTING_ID | Cx | 8865 | SrcSharedB.tsx |  |
| THOUGHT_LEVEL_SETTING_CATEGORY | wx | 8866 | SrcSharedB.tsx |  |
| SESSION_MODE_PRESETS | Tx | 8867 | SrcSharedB.tsx |  |
| SESSION_MODE_PRESET_ID_SET | Ex | 8884 | SrcSharedB.tsx |  |
| buildModelSettingOptionValue | Dx | 8885 | SrcSharedB.tsx |  |
| normalizeSessionModeId | Ox | 8889 | SrcSharedB.tsx |  |
| listSessionModeOptions | kx | 8892 | SrcSharedB.tsx |  |
| listSessionModePresets | Ax | 8899 | SrcSharedB.tsx |  |
| buildSessionSettingsViewModel | jx | 8904 | SrcSharedB.tsx |  |
| slugifyProviderName | Mx | 8954 | SrcSharedB.tsx |  |
| fnv1aHash32Hex | Nx | 8957 | SrcSharedB.tsx |  |
| buildStableProviderId | Px | 8962 | SrcSharedB.tsx |  |
| buildStableModelId | Fx | 8967 | SrcSharedB.tsx |  |
| formatLocalTimestamp | Ix | 8972 | SrcSharedB.tsx |  |
| formatLogLinePrefix | Lx | 8975 | SrcSharedB.tsx |  |
| ZCODE_AGENT_PROVIDER_NOT_READY | Rx | 8978 | SrcSharedB.tsx |  |
| PROVIDER_NOT_READY_REASON | zx | 8979 | SrcSharedB.tsx |  |
| providerHasUsableCredential | Bx | 8980 | SrcSharedB.tsx |  |
| resolveFirstReadyProvider | Vx | 8994 | SrcSharedB.tsx |  |
| OAUTH_PROVIDER_FAMILIES | Hx | 9009 | SrcSharedB.tsx |  |
| OAUTH_FAMILY_BY_ID | Ux | 9024 | SrcSharedB.tsx |  |
| OAUTH_FAMILY_BY_PROVIDER_ID | Wx | 9025 | SrcSharedB.tsx |  |
| resolveProviderFamilyMode | Gx | 9026 | SrcSharedB.tsx |  |
| isProviderAllowedForFamilyMode | Kx | 9029 | SrcSharedB.tsx |  |
| getOAuthProviderFamilyById | qx | 9033 | SrcSharedB.tsx |  |
| getOAuthFamilyIdByProviderId | Jx | 9036 | SrcSharedB.tsx |  |
| getOAuthProviderFamilyByProviderId | Yx | 9039 | SrcSharedB.tsx |  |
| normalizeProviderFamilyDomain | Xx | 9043 | SrcSharedB.tsx |  |
| normalizeOAuthProviderDomain | Zx | 9046 | SrcSharedB.tsx |  |
| providerFamilyMatchesDomain | Qx | 9049 | SrcSharedB.tsx |  |
| providerIdMatchesFamilyDomain | $x | 9053 | SrcSharedB.tsx |  |
| activeOAuthProviderMatchesFamily | eS | 9060 | SrcSharedB.tsx |  |
| CUSTOM_MODEL_REF_PREFIX | tS | 9066 | SrcSharedB.tsx |  |
| safeDecodeURIComponent | nS | 9067 | SrcSharedB.tsx |  |
| buildCustomModelRef | rS | 9074 | SrcSharedB.tsx |  |
| parseCustomModelRef | iS | 9078 | SrcSharedB.tsx |  |
| NATIVE_PROVIDER_REF_PREFIX | aS | 9097 | SrcSharedB.tsx |  |
| CUSTOM_PROVIDER_REF_PREFIX | oS | 9098 | SrcSharedB.tsx |  |
| GHOST_PROVIDER_REF_PREFIX | sS | 9099 | SrcSharedB.tsx |  |
| nativeProviderRef | cS | 9100 | SrcSharedB.tsx |  |
| customProviderRef | lS | 9103 | SrcSharedB.tsx |  |
| resolveProviderRefFromCustomModelRef | uS | 9106 | SrcSharedB.tsx |  |
| isDataBaseDirForbiddenError | dS | 9110 | SrcSharedB.tsx |  |
| APP_RUNTIME_PREFERENCES_STORAGE_KEY | fS | 9114 | SrcSharedB.tsx |  |
| AppRuntimePreferencesSchema | pS | 9115 | SrcSharedB.tsx |  |
| isUserPreferenceSource | mS | 9118 | SrcSharedB.tsx |  |
| isPluginPreferenceSource | hS | 9121 | SrcSharedB.tsx |  |
| OFFICIAL_PLUGIN_MARKETPLACE_IDS | gS | 9124 | SrcSharedB.tsx |  |
| isOfficialPluginMarketplace | _S | 9125 | SrcSharedB.tsx |  |
| LINE_DIFF_LCS_CELL_BUDGET | vS | 9128 | SrcSharedB.tsx |  |
| splitTextIntoLines | yS | 9129 | SrcSharedB.tsx |  |
| countLineDiffChanges | bS | 9135 | SrcSharedB.tsx |  |
| readMcpServerHeaders | xS | 9173 | SrcSharedB.tsx |  |
| normalizeMcpServerConfigEntry | SS | 9176 | SrcSharedB.tsx |  |
| isValidPositiveTimeoutMs | CS | 9231 | SrcSharedB.tsx |  |
| isValidMcpIsolation | wS | 9234 | SrcSharedB.tsx |  |
| isValidMcpProtocolVersion | TS | 9237 | SrcSharedB.tsx |  |
| isValidMcpOAuthConfig | ES | 9240 | SrcSharedB.tsx |  |
| isPlainObjectRecord | DS | 9243 | SrcSharedB.tsx |  |
| resolvePlatformBinaryName | OS | 9246 | SrcSharedB.tsx |  |
| SEARCH_BINARY_PRESETS | kS | 9249 | SrcSharedB.tsx |  |
| PENDING_TOOL_CALL_STATUSES | AS | 9273 | SrcSharedB.tsx |  |
| TOOL_CALL_STATUS_I18N_IDS | jS | 9274 | SrcSharedB.tsx |  |
| isPendingToolCallStatus | MS | 9281 | SrcSharedB.tsx |  |
| resolveToolCallStatusI18nId | NS | 9284 | SrcSharedB.tsx |  |
| KNOWN_TOOL_NAME_LIST | PS | 9287 | SrcSharedB.tsx |  |
| TOOL_VIEW_KIND_BY_NAME | FS | 9288 | SrcSharedB.tsx |  |
| TOOL_NAME_LOWERCASE_INDEX | IS | 9318 | SrcSharedB.tsx |  |
| canonicalizeToolName | LS | 9319 | SrcSharedB.tsx |  |
| resolveToolViewKind | RS | 9323 | SrcSharedB.tsx |  |
| isFileWriteToolName | zS | 9327 | SrcSharedB.tsx |  |
| TOOL_INPUT_KNOWN_FIELD_NAMES | BS | 9330 | SrcSharedB.tsx |  |
| parseToolCallInput | VS | 9331 | SrcSharedB.tsx |  |
| tryParseJsonValue | HS | 9348 | SrcSharedB.tsx |  |
| extractKnownToolInputFields | US | 9360 | SrcSharedB.tsx |  |
| extractJsonStringField | WS | 9368 | SrcSharedB.tsx |  |
| decodeExtractedJsonString | GS | 9392 | SrcSharedB.tsx |  |
| stripTrailingPartialEscape | KS | 9400 | SrcSharedB.tsx |  |
| unescapeJsonStringLiterals | qS | 9403 | SrcSharedB.tsx |  |
| escapeRegExpSource | JS | 9407 | SrcSharedB.tsx |  |
| TODO_TOOL_TITLE_PATTERN | YS | 9410 | SrcSharedB.tsx |  |
| TODO_LIST_FIELD_NAMES | XS | 9411 | SrcSharedB.tsx |  |
| isPlainObjectValue | ZS | 9412 | SrcSharedB.tsx |  |
| nonEmptyTrimmedString | QS | 9415 | SrcSharedB.tsx |  |
| normalizeTodoStatus | $S | 9418 | SrcSharedB.tsx |  |
| normalizeTodoEntry | eC | 9422 | SrcSharedB.tsx |  |
| tryParseTodoJson | tC | 9440 | SrcSharedB.tsx |  |
| extractTodoListContainer | nC | 9447 | SrcSharedB.tsx |  |
| parseTodoListStrict | rC | 9456 | SrcSharedB.tsx |  |
| collectTodoParseCandidates | iC | 9462 | SrcSharedB.tsx |  |
| isTodoToolTitle | aC | 9474 | SrcSharedB.tsx |  |
| extractTodosFromToolInput | oC | 9477 | SrcSharedB.tsx |  |
| extractTodosFromToolOutput | sC | 9480 | SrcSharedB.tsx |  |
| COMMAND_INPUT_FIELD_NAMES | cC | 9488 | SrcSharedB.tsx |  |
| COMMAND_ARGS_FIELD_NAMES | lC | 9489 | SrcSharedB.tsx |  |
| FILE_PATH_FIELD_NAMES | uC | 9490 | SrcSharedB.tsx |  |
| DIRECTORY_FIELD_NAMES | dC | 9491 | SrcSharedB.tsx |  |
| PERMISSION_FILE_PATH_LIMIT | fC | 9492 | SrcSharedB.tsx |  |
| isPlainRecordValue | $ | 9493 | SrcSharedB.tsx |  |
| collapseWhitespace | pC | 9496 | SrcSharedB.tsx |  |
| normalizeLineEndings | mC | 9499 | SrcSharedB.tsx |  |
| coerceStringArray | hC | 9503 | SrcSharedB.tsx |  |
| unwrapToolCallPayload | gC | 9506 | SrcSharedB.tsx |  |
| extractCommandFromRecord | _C | 9509 | SrcSharedB.tsx |  |
| findCommandValueDeep | vC | 9524 | SrcSharedB.tsx |  |
| pushUniqueFilePath | yC | 9555 | SrcSharedB.tsx |  |
| collectFilePathValues | bC | 9559 | SrcSharedB.tsx |  |
| collectPermissionFilePaths | xC | 9576 | SrcSharedB.tsx |  |
| collectPermissionFileChanges | SC | 9599 | SrcSharedB.tsx |  |
| buildPermissionRequestViewModel | CC | 9614 | SrcSharedB.tsx |  |
| webRemoteWorkspaceKey | wC | 9632 | SrcSharedB.tsx |  |
| CODING_PLAN_SECURITY_VERIFICATION_REQUIRED | TC | 9635 | SrcSharedB.tsx |  |
| CODING_PLAN_SYSTEM_BUSY | EC | 9636 | SrcSharedB.tsx |  |
| readProcessEnv | DC | 9637 | SrcSharedB.tsx |  |
| resolveIntranetMachineHost | OC | 9640 | SrcSharedB.tsx |  |
| INTRANET_MACHINE_HOST | kC | 9643 | SrcSharedB.tsx |  |
| INTRANET_PROBE_CONFIG | AC | 9645 | SrcSharedB.tsx |  |
| shouldUseTestEndpoints | jC | 9654 | SrcSharedB.tsx |  |
| coerceEnvRecord | MC | 9657 | SrcSharedB.tsx |  |
| isTruthyEnvFlag | NC | 9660 | SrcSharedB.tsx |  |
| normalizeEffectiveEnv | PC | 9665 | SrcSharedB.tsx |  |
| normalizeNetworkEnv | FC | 9669 | SrcSharedB.tsx |  |
| resolveEnvOverrideSignals | IC | 9673 | SrcSharedB.tsx |  |
| resolveRuntimeEnvMode | LC | 9688 | SrcSharedB.tsx |  |
| repoSnapshotStorageKey | RC | 9697 | SrcSharedB.tsx |  |
| repoWikiWorkspaceKey | zC | 9701 | SrcSharedB.tsx |  |
| findLocalWorkspaceIndexForward | BC | 9704 | SrcSharedB.tsx |  |
| findNearestLocalWorkspaceIndex | VC | 9708 | SrcSharedB.tsx |  |
| BrowserExecuteOpBaseSchema | HC | 9713 | SrcSharedB.tsx |  |

## 57. B5 · SkillStore.tsx（skillStore chunk 全量）

- 族/来源：独立 chunk · 源 `out/renderer/assets/skillStore-BmeKHDBI.js` · B5-11。行号口径：jsx 孪生 `skillStore-BmeKHDBI.jsx`（2,518 行）行（头注声明共 204 个模块内符号；本表含 200 模块符号 + 11 导入绑定）。
- 符号条数：211（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| ReactInterop | d | 5 | SkillStore.tsx | import 侧，未单列符号 |
| createStoreImpl | f | 6 | SkillStore.tsx |  |
| createVanillaStore | p | 26 | SkillStore.tsx |  |
| identitySelector | m | 27 | SkillStore.tsx |  |
| useStore | h | 28 | SkillStore.tsx | 导出 J |
| createBoundStore | g | 32 | SkillStore.tsx |  |
| create | _ | 38 | SkillStore.tsx | 导出 q |
| readBuildEnvSnapshot | ee | 40 | SkillStore.tsx |  |
| isE2EStoreBridgeEnabled | v | 50 | SkillStore.tsx | 导出 K |
| initialWorkspaceInitState | te | 53 | SkillStore.tsx |  |
| DEFAULT_PROVIDER | ne | 58 | SkillStore.tsx |  |
| initialTaskUiState | re | 59 | SkillStore.tsx |  |
| initialTaskRuntimeState | ie | 67 | SkillStore.tsx |  |
| createInitialWorkspaceTaskState | ae | 79 | SkillStore.tsx |  |
| defaultWorkspaceTaskState | oe | 120 | SkillStore.tsx |  |
| getDefaultWorkspaceTaskState | se | 121 | SkillStore.tsx |  |
| hasOwnProperty | ce | 124 | SkillStore.tsx |  |
| isUntitledTaskTitle | le | 127 | SkillStore.tsx |  |
| pickTaskTitle | ue | 131 | SkillStore.tsx |  |
| mergeTaskMeta | y | 134 | SkillStore.tsx | 导出 G |
| mergeTaskMetaMany | de | 150 | SkillStore.tsx | 导出 W |
| resolveWorkspaceKey | b | 155 | SkillStore.tsx | 导出 H |
| pickRecordByTaskIds | x | 158 | SkillStore.tsx |  |
| collectWorkspaceTaskIds | fe | 162 | SkillStore.tsx |  |
| scopeWorkspaceTaskState | pe | 169 | SkillStore.tsx |  |
| getWorkspaceTaskState | S | 195 | SkillStore.tsx | 导出 V |
| updateWorkspaceTaskState | C | 200 | SkillStore.tsx |  |
| getTaskRuntime | w | 218 | SkillStore.tsx | 导出 F |
| getActiveTaskStatusError | me | 221 | SkillStore.tsx | 导出 z |
| getTaskUi | T | 232 | SkillStore.tsx | 导出 I |
| getMergedTaskListItem | E | 235 | SkillStore.tsx | 导出 P |
| getMergedTaskList | he | 240 | SkillStore.tsx | 导出 R |
| isTaskUnread | ge | 246 | SkillStore.tsx | 导出 L |
| getWorkspaceTaskStateAlias | _e | 249 | SkillStore.tsx | 导出 U |
| getWorkspaceInit | ve | 252 | SkillStore.tsx | 导出 B |
| TASK_NAV_HISTORY_LIMIT | ye | 255 | SkillStore.tsx |  |
| createEmptyTaskNavHistory | be | 256 | SkillStore.tsx |  |
| isTaskNavTaskEntry | xe | 262 | SkillStore.tsx |  |
| isTaskNavAutomationsEntry | Se | 265 | SkillStore.tsx | 导出 N |
| isSameTaskNavEntry | Ce | 268 | SkillStore.tsx |  |
| pushTaskNavEntry | we | 271 | SkillStore.tsx |  |
| pushTaskNavTaskEntry | Te | 287 | SkillStore.tsx |  |
| pushTaskNavAutomationsEntry | Ee | 297 | SkillStore.tsx |  |
| canGoBackInTaskNav | De | 309 | SkillStore.tsx | 导出 j |
| canGoForwardInTaskNav | Oe | 312 | SkillStore.tsx | 导出 M |
| goBackInTaskNavHistory | ke | 315 | SkillStore.tsx |  |
| goForwardInTaskNavHistory | Ae | 327 | SkillStore.tsx |  |
| removeTaskFromTaskNavHistory | je | 339 | SkillStore.tsx |  |
| createTaskNavActions | Me | 350 | SkillStore.tsx |  |
| COMPOSER_DRAFT_STORAGE_PREFIX | Ne | 377 | SkillStore.tsx |  |
| DEFAULT_DRAFT_SCOPE | Pe | 378 | SkillStore.tsx |  |
| getDraftStorage | Fe | 379 | SkillStore.tsx |  |
| getComposerDraftStorageKey | Ie | 387 | SkillStore.tsx |  |
| readComposerDraftStore | Le | 391 | SkillStore.tsx |  |
| clearComposerDraftScope | Re | 412 | SkillStore.tsx |  |
| isSameConfigOptionValueJson | ze | 427 | SkillStore.tsx |  |
| areConfigOptionsEqual | Be | 430 | SkillStore.tsx |  |
| sortTaskListByRecency | Ve | 436 | SkillStore.tsx |  |
| areElicitationOptionListsEqual | He | 439 | SkillStore.tsx |  |
| isSameTaskInteractionRequest | Ue | 445 | SkillStore.tsx |  |
| isSameUsageCost | We | 448 | SkillStore.tsx |  |
| isSameUsageCacheStats | Ge | 453 | SkillStore.tsx |  |
| isSameUsageBreakdown | Ke | 456 | SkillStore.tsx |  |
| isSameTaskUsage | qe | 459 | SkillStore.tsx |  |
| normalizeContextWindow | Je | 462 | SkillStore.tsx |  |
| updateWorkspaceTaskStateResolved | Ye | 465 | SkillStore.tsx |  |
| createTaskRuntimeActions | Xe | 476 | SkillStore.tsx | （16 动作） |
| LAST_AGENT_PROVIDER_KEY | Ze | 850 | SkillStore.tsx |  |
| getProviderStorage | Qe | 851 | SkillStore.tsx |  |
| persistLastAgentProvider | $e | 859 | SkillStore.tsx |  |
| CUSTOM_PROVIDER_IDS | et | 862 | SkillStore.tsx |  |
| parseCustomProviderModelSuffix | tt | 863 | SkillStore.tsx |  |
| isCustomModelOption | nt | 872 | SkillStore.tsx |  |
| formatCustomModelId | rt | 878 | SkillStore.tsx | 导出 k |
| parseCustomModelId | D | 881 | SkillStore.tsx | 导出 O |
| filterNativeModelOptions | it | 884 | SkillStore.tsx | 导出 A |
| LAST_AGENT_MODEL_KEY | O | 887 | SkillStore.tsx |  |
| LAST_AGENT_THOUGHT_LEVEL_KEY | at | 888 | SkillStore.tsx |  |
| LAST_AGENT_CONFIG_KEY | ot | 889 | SkillStore.tsx |  |
| GLOBAL_SCOPE | k | 890 | SkillStore.tsx |  |
| LAST_AGENT_CONFIG_SCHEMA_VERSION | A | 891 | SkillStore.tsx |  |
| GLM_MODEL_PREFIX | st | 892 | SkillStore.tsx |  |
| GLM_DATED_MODEL_PATTERN | ct | 893 | SkillStore.tsx |  |
| MAX_THOUGHT_LEVEL | lt | 894 | SkillStore.tsx |  |
| DISABLED_THOUGHT_VALUES | ut | 895 | SkillStore.tsx |  |
| getModelStorage | j | 896 | SkillStore.tsx |  |
| resolveIdentityKey | dt | 904 | SkillStore.tsx |  |
| getIdentityScopedModelKey | M | 907 | SkillStore.tsx |  |
| getWorkspaceModelStorageKey | ft | 910 | SkillStore.tsx |  |
| getGlobalModelKey | pt | 913 | SkillStore.tsx |  |
| getGlobalThoughtLevelKey | N | 916 | SkillStore.tsx |  |
| getGlobalConfigKey | P | 919 | SkillStore.tsx |  |
| getWorkspaceModelKey | F | 922 | SkillStore.tsx |  |
| findModelSelectOption | mt | 925 | SkillStore.tsx |  |
| findThoughtLevelSelectOption | ht | 928 | SkillStore.tsx |  |
| collectModelValueAliases | gt | 931 | SkillStore.tsx |  |
| extractModelNameFromQualified | _t | 944 | SkillStore.tsx |  |
| isQualifiedProviderModel | vt | 953 | SkillStore.tsx |  |
| getCurrentModelValue | I | 958 | SkillStore.tsx | 导出 w |
| getCurrentThoughtLevelValue | yt | 962 | SkillStore.tsx | 导出 T |
| parseLastAgentConfig | bt | 966 | SkillStore.tsx |  |
| readGlobalLastAgentConfig | xt | 981 | SkillStore.tsx |  |
| readLastAgentModel | St | 984 | SkillStore.tsx |  |
| clearLegacyModelKeys | Ct | 996 | SkillStore.tsx |  |
| writeLastAgentConfig | L | 999 | SkillStore.tsx | 导出 x |
| persistLastAgentConfigIfUnchanged | wt | 1014 | SkillStore.tsx | 导出 S |
| readLastAgentModelConfig | R | 1018 | SkillStore.tsx | 导出 E |
| readLastAgentModelOnly | Tt | 1039 | SkillStore.tsx | 导出 D |
| updateLastAgentModel | Et | 1042 | SkillStore.tsx | 导出 C |
| clearLastAgentModelConfig | Dt | 1051 | SkillStore.tsx | 导出 y |
| applyStoredModelToOptions | Ot | 1056 | SkillStore.tsx | 导出 v |
| hasThoughtLevelOption | z | 1067 | SkillStore.tsx | 导出 b |
| applyThoughtLevelToOptions | kt | 1071 | SkillStore.tsx |  |
| resolveThoughtLevelWithMaxFallback | At | 1081 | SkillStore.tsx |  |
| getMaxThoughtLevelIfSupported | jt | 1084 | SkillStore.tsx |  |
| resolveMaxThoughtLevelForModel | Mt | 1087 | SkillStore.tsx |  |
| isThoughtLevelDisabled | Nt | 1090 | SkillStore.tsx |  |
| isGlmModelSelected | Pt | 1093 | SkillStore.tsx |  |
| getModelNameAliases | B | 1097 | SkillStore.tsx |  |
| applyStoredConfigToOptions | Ft | 1103 | SkillStore.tsx | 导出 _ |
| findModeSelectOption | It | 1109 | SkillStore.tsx |  |
| getCurrentModeValue | Lt | 1112 | SkillStore.tsx |  |
| modelSwitchGuardCache | Rt | 1118 | SkillStore.tsx | 只读预留，无 set |
| trimToNull | V | 1119 | SkillStore.tsx |  |
| findSelectOptionByCategory | zt | 1124 | SkillStore.tsx |  |
| getCurrentValueByCategory | Bt | 1127 | SkillStore.tsx |  |
| isSameModelAlias | Vt | 1130 | SkillStore.tsx |  |
| getModelSwitchGuard | Ht | 1134 | SkillStore.tsx |  |
| findMatchingCurrentOption | Ut | 1139 | SkillStore.tsx |  |
| optionHasValue | Wt | 1142 | SkillStore.tsx |  |
| isOptionValueAcceptable | Gt | 1145 | SkillStore.tsx |  |
| shouldKeepCurrentModelOption | Kt | 1148 | SkillStore.tsx |  |
| pickAuthoritativeOption | qt | 1153 | SkillStore.tsx |  |
| reconcileConfigOptionsWithGuard | Jt | 1157 | SkillStore.tsx |  |
| parseProviderQualifiedModel | Yt | 1187 | SkillStore.tsx |  |
| isSyntheticModel | Xt | 1198 | SkillStore.tsx |  |
| normalizeGlmModelId | Zt | 1201 | SkillStore.tsx |  |
| resolveTaskMetaModel | Qt | 1209 | SkillStore.tsx |  |
| getModelDisplayName | $t | 1213 | SkillStore.tsx |  |
| withModelCurrentValue | en | 1218 | SkillStore.tsx |  |
| createModelSelectOption | tn | 1230 | SkillStore.tsx |  |
| createModeSelectOption | nn | 1243 | SkillStore.tsx |  |
| createThoughtLevelSelectOption | rn | 1253 | SkillStore.tsx |  |
| withCurrentValueGeneric | an | 1266 | SkillStore.tsx |  |
| injectTaskModelIntoOptions | on | 1278 | SkillStore.tsx |  |
| buildTaskConfigOptionsFromMeta | sn | 1294 | SkillStore.tsx | 导出 g |
| groupedDraftCounter | cn | 1316 | SkillStore.tsx |  |
| createGroupedDraftId | ln | 1317 | SkillStore.tsx |  |
| sanitizeThoughtLevelOption | un | 1320 | SkillStore.tsx |  |
| sanitizeConfigOptions | H | 1330 | SkillStore.tsx |  |
| cloneConfigOptions | dn | 1333 | SkillStore.tsx |  |
| isSameGroupedDraftPlacement | fn | 1341 | SkillStore.tsx |  |
| isModeSelectOption | pn | 1344 | SkillStore.tsx |  |
| createModeOptionFromCurrentId | mn | 1347 | SkillStore.tsx |  |
| replaceModeOption | U | 1361 | SkillStore.tsx |  |
| applyModeIdToOptions | hn | 1366 | SkillStore.tsx |  |
| updateActiveTaskConfigOptions | gn | 1378 | SkillStore.tsx |  |
| resolveTaskConfigOptionsForActivation | _n | 1391 | SkillStore.tsx |  |
| createTaskStateActions | vn | 1411 | SkillStore.tsx | （25 动作） |
| useTaskStore | yn | 1794 | SkillStore.tsx | 导出 h + E2E 挂载 (1800) |
| WHITEBOARD_DEFAULT_WIDTH | bn | 1802 | SkillStore.tsx |  |
| WHITEBOARD_DEFAULT_HEIGHT | xn | 1803 | SkillStore.tsx |  |
| WHITEBOARD_DARK_COLOR | Sn | 1804 | SkillStore.tsx | 导出 c |
| WHITEBOARD_ADD_TO_CHAT_EVENT | Cn | 1805 | SkillStore.tsx | 导出 s |
| WHITEBOARD_BACKGROUND_COLOR | wn | 1806 | SkillStore.tsx |  |
| resolveWhiteboardWorkspaceKey | W | 1807 | SkillStore.tsx | 导出 l |
| createWhiteboard | Tn | 1813 | SkillStore.tsx |  |
| createUniqueWhiteboardName | En | 1826 | SkillStore.tsx |  |
| createWhiteboardStroke | Dn | 1833 | SkillStore.tsx | 导出 d |
| renderWhiteboardToContext | On | 1842 | SkillStore.tsx | 导出 p |
| drawWhiteboardStroke | kn | 1849 | SkillStore.tsx |  |
| renderWhiteboardToPngDataUrl | An | 1861 | SkillStore.tsx |  |
| whiteboardToPngFile | jn | 1868 | SkillStore.tsx | 导出 u |
| isWhiteboardAddToChatEvent | Mn | 1879 | SkillStore.tsx | 导出 m |
| dispatchWhiteboardAddToChat | Nn | 1882 | SkillStore.tsx | 导出 f |
| sanitizeWhiteboardFileName | Pn | 1890 | SkillStore.tsx |  |
| isWhiteboardAddToChatDetail | Fn | 1893 | SkillStore.tsx |  |
| getWhiteboardWorkspaceState | G | 1898 | SkillStore.tsx |  |
| updateWhiteboardBoard | K | 1904 | SkillStore.tsx |  |
| useWhiteboardStore | In | 1923 | SkillStore.tsx | 导出 o + E2E 挂载 (2014) |
| subagentContextInflight | q | 2015 | SkillStore.tsx |  |
| subagentContextLoadSeqByScope | J | 2016 | SkillStore.tsx |  |
| subagentContextLoadSeq | Ln | 2017 | SkillStore.tsx |  |
| getSubagentContextScopeKey | Y | 2018 | SkillStore.tsx | 导出 i |
| setSubagentContext | X | 2021 | SkillStore.tsx |  |
| loadSubagentContext | Rn | 2029 | SkillStore.tsx |  |
| loadSubagentContextIntoStore | zn | 2043 | SkillStore.tsx |  |
| useSubagentContextsStore | Bn | 2094 | SkillStore.tsx | 导出 a |
| subagentListInflight | Z | 2135 | SkillStore.tsx |  |
| subagentOperationSeq | Vn | 2136 | SkillStore.tsx |  |
| getSubagentScopeKey | Hn | 2137 | SkillStore.tsx |  |
| listSubagentsCached | Un | 2140 | SkillStore.tsx |  |
| nextSubagentOperationSeq | Wn | 2155 | SkillStore.tsx |  |
| isCurrentSubagentOperation | Q | 2158 | SkillStore.tsx |  |
| useSubagentsStore | Gn | 2161 | SkillStore.tsx | 导出 r + E2E 挂载 (2356) |
| refreshSubagentStoresForWorkspace | Kn | 2357 | SkillStore.tsx | 导出 n |
| skillListInflight | $ | 2368 | SkillStore.tsx |  |
| getSkillScopeKey | qn | 2369 | SkillStore.tsx |  |
| listSkillsCached | Jn | 2372 | SkillStore.tsx |  |
| useSkillsStore | Yn | 2387 | SkillStore.tsx | 导出 t + E2E 挂载 (2517) |
| toEsmInterop | e |  | SkillStore.tsx | import chunk-Cq_f4orQ s |
| reactModuleFactory | t |  | SkillStore.tsx | import react t |
| formatCustomQualifiedModelId | n | 3 | SkillStore.tsx | import =F 内部 rS |
| formatNativeSupplierKey | r | 3 | SkillStore.tsx | import =M cS |
| parseCustomQualifiedModelId | i | 3 | SkillStore.tsx | import =P iS |
| getDefaultModeOptions | a | 3 | SkillStore.tsx | import =Y kx |
| resolveAgentProvider | o | 3 | SkillStore.tsx | import =ds Es，恒 'glm' |
| createUuid | s | 3 | SkillStore.tsx | import =ot cx |
| formatBuiltinQualifiedModelId | c | 3 | SkillStore.tsx | import =q Fx |
| isGlmProvider | l | 3 | SkillStore.tsx | import =us Ds |
| logger | u |  | SkillStore.tsx | import logger t |

## 58. B5 · UsageStatsUiParts.tsx（用量 UI 件 + Tooltip 全栈）

- 族/来源：独立 chunk · 源 `out/renderer/assets/usageStatsUiParts-CiR7YEhh.js`（883 行）· B5-11。行号口径：jsx 孪生 `usageStatsUiParts-CiR7YEhh.jsx`（747 行）行。
- 符号条数：95（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| toEsmInterop | e | 1 | UsageStatsUiParts.tsx |  |
| commonJsModule | t | 1 | UsageStatsUiParts.tsx |  |
| reactModuleFactory | n | 2 | UsageStatsUiParts.tsx |  |
| jsxRuntimeModuleFactory | r | 4 | UsageStatsUiParts.tsx |  |
| isApplePlatform | i | 5 | UsageStatsUiParts.tsx |  |
| createContextScope | a | 6 | UsageStatsUiParts.tsx |  |
| usePopperScope | o | 6 | UsageStatsUiParts.tsx |  |
| Portal | s | 6 | UsageStatsUiParts.tsx |  |
| Primitive | c | 6 | UsageStatsUiParts.tsx |  |
| PopperRoot | l | 6 | UsageStatsUiParts.tsx |  |
| DismissableLayer | u | 6 | UsageStatsUiParts.tsx |  |
| useId | d | 6 | UsageStatsUiParts.tsx |  |
| PopperArrow | f | 6 | UsageStatsUiParts.tsx |  |
| useControllableState | p | 6 | UsageStatsUiParts.tsx |  |
| PopperContent | m | 6 | UsageStatsUiParts.tsx |  |
| Presence | h | 6 | UsageStatsUiParts.tsx |  |
| Slot | g | 6 | UsageStatsUiParts.tsx |  |
| composeEventHandlers | _ | 6 | UsageStatsUiParts.tsx |  |
| useComposedRefs | v | 7 | UsageStatsUiParts.tsx |  |
| createSlottable | y | 7 | UsageStatsUiParts.tsx |  |
| cn | b | 8 | UsageStatsUiParts.tsx |  |
| ReactInterop | x | 9 | UsageStatsUiParts.tsx |  |
| jsxRuntime | S | 10 | UsageStatsUiParts.tsx |  |
| VISUALLY_HIDDEN_STYLE | C | 11 | UsageStatsUiParts.tsx |  |
| VISUALLY_HIDDEN_NAME | w | 23 | UsageStatsUiParts.tsx |  |
| VisuallyHidden | T | 24 | UsageStatsUiParts.tsx |  |
| VisuallyHiddenComponent | E | 29 | UsageStatsUiParts.tsx |  |
| useSyncExternalStoreShimFactory | D | 30 | UsageStatsUiParts.tsx |  |
| useSyncExternalStoreShim | ee | 80 | UsageStatsUiParts.tsx |  |
| TooltipScope | O | 83 | UsageStatsUiParts.tsx |  |
| useTooltipScopeFactory | te | 83 | UsageStatsUiParts.tsx |  |
| useTooltipPopperScope | k | 84 | UsageStatsUiParts.tsx |  |
| TOOLTIP_PROVIDER_NAME | A | 85 | UsageStatsUiParts.tsx |  |
| DEFAULT_DELAY_DURATION | ne | 86 | UsageStatsUiParts.tsx |  |
| TOOLTIP_OPEN_EVENT | j | 87 | UsageStatsUiParts.tsx |  |
| TooltipProviderContextProvider | re | 88 | UsageStatsUiParts.tsx |  |
| useTooltipProviderContext | M | 88 | UsageStatsUiParts.tsx |  |
| TooltipProvider | N | 89 | UsageStatsUiParts.tsx |  |
| TOOLTIP_NAME | P | 122 | UsageStatsUiParts.tsx |  |
| TooltipContextProvider | ie | 123 | UsageStatsUiParts.tsx |  |
| useTooltipContext | F | 123 | UsageStatsUiParts.tsx |  |
| Tooltip | I | 124 | UsageStatsUiParts.tsx |  |
| TOOLTIP_TRIGGER_NAME | L | 187 | UsageStatsUiParts.tsx |  |
| TooltipTrigger | R | 188 | UsageStatsUiParts.tsx |  |
| TOOLTIP_PORTAL_NAME | z | 217 | UsageStatsUiParts.tsx |  |
| TooltipPortalContextProvider | ae | 218 | UsageStatsUiParts.tsx |  |
| useTooltipPortalContext | oe | 218 | UsageStatsUiParts.tsx |  |
| TooltipPortal | B | 221 | UsageStatsUiParts.tsx |  |
| TOOLTIP_CONTENT_NAME | V | 243 | UsageStatsUiParts.tsx |  |
| TooltipContent | H | 244 | UsageStatsUiParts.tsx |  |
| TooltipContentHoverable | se | 261 | UsageStatsUiParts.tsx |  |
| TooltipContentContextProvider | ce | 312 | UsageStatsUiParts.tsx |  |
| useTooltipContentContext | le | 312 | UsageStatsUiParts.tsx |  |
| TooltipContentSlottable | ue | 315 | UsageStatsUiParts.tsx |  |
| TooltipContentBase | U | 316 | UsageStatsUiParts.tsx |  |
| TOOLTIP_ARROW_NAME | W | 372 | UsageStatsUiParts.tsx |  |
| TooltipArrow | de | 373 | UsageStatsUiParts.tsx |  |
| resolveNearestSide | fe | 386 | UsageStatsUiParts.tsx |  |
| getSideOffsetPoints | pe | 404 | UsageStatsUiParts.tsx |  |
| getRectCornerPoints | me | 446 | UsageStatsUiParts.tsx |  |
| isPointInPolygon | he | 467 | UsageStatsUiParts.tsx |  |
| getSortedHullPoints | ge | 484 | UsageStatsUiParts.tsx |  |
| getConvexHull | _e | 488 | UsageStatsUiParts.tsx |  |
| TooltipProviderRoot | ve | 513 | UsageStatsUiParts.tsx |  |
| TooltipRoot | ye | 514 | UsageStatsUiParts.tsx |  |
| TooltipTriggerRoot | be | 515 | UsageStatsUiParts.tsx |  |
| TooltipPortalRoot | xe | 516 | UsageStatsUiParts.tsx |  |
| TooltipContentRoot | Se | 517 | UsageStatsUiParts.tsx |  |
| ShadcnTooltipProvider | Ce | 518 | UsageStatsUiParts.tsx |  |
| ShadcnTooltip | G | 528 | UsageStatsUiParts.tsx |  |
| ShadcnTooltipTrigger | K | 536 | UsageStatsUiParts.tsx |  |
| ShadcnTooltipContent | q | 544 | UsageStatsUiParts.tsx |  |
| TOOLTIP_KBD_CLASS | J | 554 | UsageStatsUiParts.tsx |  |
| setRefValue | Y | 555 | UsageStatsUiParts.tsx |  |
| InfoTooltip | X | 564 | UsageStatsUiParts.tsx |  |
| formatNumberCompact | Z | 599 | UsageStatsUiParts.tsx |  |
| USAGE_HEATMAP_COLORS | Q | 609 | UsageStatsUiParts.tsx |  |
| HEATMAP_WEEK_COUNT | we | 610 | UsageStatsUiParts.tsx |  |
| HEATMAP_DAYS_PER_WEEK | $ | 611 | UsageStatsUiParts.tsx |  |
| MS_PER_DAY | Te | 612 | UsageStatsUiParts.tsx |  |
| formatCountCompact | Ee | 613 | UsageStatsUiParts.tsx |  |
| formatTokens | De | 619 | UsageStatsUiParts.tsx |  |
| formatPercent | Oe | 622 | UsageStatsUiParts.tsx |  |
| formatUtcDateShort | ke | 628 | UsageStatsUiParts.tsx |  |
| resolveModelLabel | Ae | 637 | UsageStatsUiParts.tsx |  |
| heatmapCellStyle | je | 642 | UsageStatsUiParts.tsx |  |
| formatHeatmapCellLabel | Me | 647 | UsageStatsUiParts.tsx |  |
| UsageStatCard | Ne | 656 | UsageStatsUiParts.tsx |  |
| UsageEmptyState | Pe | 669 | UsageStatsUiParts.tsx |  |
| dayIndexOfDate | Fe | 675 | UsageStatsUiParts.tsx |  |
| dateOfDayIndex | Ie | 679 | UsageStatsUiParts.tsx |  |
| createEmptyHeatmapCell | Le | 682 | UsageStatsUiParts.tsx |  |
| normalizeHeatmapWeeks | Re | 691 | UsageStatsUiParts.tsx |  |
| UsageHeatmap | ze | 715 | UsageStatsUiParts.tsx |  |
| UsageHeatmapCell | Be | 739 | UsageStatsUiParts.tsx |  |

## 59. B5 · ProcessMonitor.tsx（进程监控独立窗口）

- 族/来源：独立 chunk · 源 `out/renderer/assets/process-monitor-DOlutpPR.js`（180 行）· B5-11。行号口径：jsx 孪生 `process-monitor-DOlutpPR.jsx`（94 行）行。
- 符号条数：20（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| toEsmInterop | e | 1 | ProcessMonitor.tsx |  |
| watchUiFontSizeStorageChanges | t | 2 | ProcessMonitor.tsx |  |
| applyUiFontSizeCssVariable | n | 2 | ProcessMonitor.tsx |  |
| readStoredUiFontSizePx | r | 2 | ProcessMonitor.tsx |  |
| reactDomClientModule | i | 3 | ProcessMonitor.tsx |  |
| reactModuleFactory | a | 4 | ProcessMonitor.tsx |  |
| jsxRuntimeModuleFactory | o | 5 | ProcessMonitor.tsx |  |
| ReactInterop | s | 6 | ProcessMonitor.tsx |  |
| ReactDOMClient | c | 7 | ProcessMonitor.tsx |  |
| jsxRuntime | l | 8 | ProcessMonitor.tsx |  |
| PROCESS_MONITOR_MESSAGES | u | 9 | ProcessMonitor.tsx |  |
| resolveThemeDarkness | d | 31 | ProcessMonitor.tsx |  |
| applyStoredThemeClasses | f | 34 | ProcessMonitor.tsx |  |
| resolveStoredLocale | p | 40 | ProcessMonitor.tsx |  |
| countProcessTreeNodes | m | 43 | ProcessMonitor.tsx |  |
| PROCESS_GRID_TEMPLATE_COLUMNS | h | 46 | ProcessMonitor.tsx |  |
| formatMemoryMegabytes | g | 47 | ProcessMonitor.tsx |  |
| ProcessTreeNodeRow | _ | 52 | ProcessMonitor.tsx |  |
| ProcessMonitorApp | v | 61 | ProcessMonitor.tsx |  |
| rootElement | y | 93 | ProcessMonitor.tsx |  |

## 60. B5 · XlsxDeepA.tsx（react-xlsx 深部 A 段：控制器 + canvas 图表渲染层）

- 族/来源：xlsx 族 · 源 chunk `out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）· B5-12a。行号口径：chunk js 行。
- 符号条数：154（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| WORLD_COUNTRY_FEATURES | kd | 183972 | XlsxDeepA.tsx |  |
| US_STATE_FIPS_INFO | Ad | 183973 | XlsxDeepA.tsx |  |
| US_STATE_FEATURES | jd | 184026 | XlsxDeepA.tsx |  |
| COUNTRY_NAME_ALIASES | Md | 184038 | XlsxDeepA.tsx |  |
| US_STATE_NAME_ALIASES | Nd | 184057 | XlsxDeepA.tsx |  |
| COUNTRY_FEATURE_BY_NAME | Pd | 184064 | XlsxDeepA.tsx |  |
| US_STATE_FEATURE_BY_NAME | Fd | 184074 | XlsxDeepA.tsx |  |
| normalizeGeoName | Vd | 184117 | XlsxDeepA.tsx |  |
| findGeoFeature | nf | 184213 | XlsxDeepA.tsx |  |
| resolveRegionSet | lf | 184254 | XlsxDeepA.tsx |  |
| featuresForRegionSet | uf | 184260 | XlsxDeepA.tsx |  |
| parseHexColor | Id | 184090 | XlsxDeepA.tsx |  |
| mixHexColors | Ld | 184100 | XlsxDeepA.tsx |  |
| lightenHexColor | Rd | 184108 | XlsxDeepA.tsx |  |
| darkenHexColor | zd | 184111 | XlsxDeepA.tsx |  |
| clampNumber | Bd | 184114 | XlsxDeepA.tsx |  |
| SPREADSHEET_FONT_STACK | Hd | 184129 | XlsxDeepA.tsx |  |
| DEFAULT_CHART_TEXT_COLOR | Ud | 184132 | XlsxDeepA.tsx |  |
| DEFAULT_AXIS_LABEL_COLOR | Wd | 184133 | XlsxDeepA.tsx |  |
| quoteFontFamilyName | Gd | 184134 | XlsxDeepA.tsx |  |
| resolveFontFamilyStack | Kd | 184146 | XlsxDeepA.tsx |  |
| resolveTitleTextColor | qd | 184154 | XlsxDeepA.tsx |  |
| resolveAxisLabelColor | Jd | 184157 | XlsxDeepA.tsx |  |
| resolveSecondaryTextColor | Yd | 184160 | XlsxDeepA.tsx |  |
| toFiniteNumber | Xd | 184163 | XlsxDeepA.tsx |  |
| normalizeHexColor | fp | 184993 | XlsxDeepA.tsx |  |
| formatTickNumber | Cp | 185197 | XlsxDeepA.tsx |  |
| formatPercentTick | wp | 185202 | XlsxDeepA.tsx |  |
| truncateLabel | kp | 185244 | XlsxDeepA.tsx |  |
| toCleanLabel | wf | 184404 | XlsxDeepA.tsx |  |
| formulaRowCount | Tf | 184411 | XlsxDeepA.tsx |  |
| TWO_PI | jp | 185276 | XlsxDeepA.tsx |  |
| roundPathNumber | Fp | 185300 | XlsxDeepA.tsx |  |
| resolveSeriesFillColor | Zd | 184173 | XlsxDeepA.tsx |  |
| resolveSeriesLineColor | Qd | 184178 | XlsxDeepA.tsx |  |
| resolveDataPointColor | $d | 184183 | XlsxDeepA.tsx |  |
| hasHistogramBins | ef | 184206 | XlsxDeepA.tsx |  |
| hasHistogramSeries | tf | 184210 | XlsxDeepA.tsx |  |
| resolveReferenceLineColor | rf | 184223 | XlsxDeepA.tsx |  |
| resolveRegionMapBaseColor | af | 184226 | XlsxDeepA.tsx |  |
| extractValueColorScale | of | 184236 | XlsxDeepA.tsx |  |
| extractCategoryColorLabels | sf | 184241 | XlsxDeepA.tsx |  |
| extractLayoutProperties | cf | 184250 | XlsxDeepA.tsx |  |
| normalizeChartStyleId | hf | 184301 | XlsxDeepA.tsx |  |
| surfaceStyle32Palette | gf | 184304 | XlsxDeepA.tsx |  |
| resolvePieSliceColor | _f | 184309 | XlsxDeepA.tsx |  |
| pickPrimarySeriesIndex | vf | 184315 | XlsxDeepA.tsx |  |
| resolveBarSeriesStyle | yf | 184332 | XlsxDeepA.tsx |  |
| barPaddingFromGapWidth | bf | 184351 | XlsxDeepA.tsx |  |
| normalizeLegendPosition | xf | 184356 | XlsxDeepA.tsx |  |
| normalizeMarkerSymbol | Sf | 184378 | XlsxDeepA.tsx |  |
| resolveChartRenderType | Cf | 184381 | XlsxDeepA.tsx |  |
| resolveCategoryLabels | Ef | 184421 | XlsxDeepA.tsx |  |
| isComboChart | Df | 184453 | XlsxDeepA.tsx |  |
| comboLegendItems | Of | 184457 | XlsxDeepA.tsx |  |
| findAxisByIds | kf | 184467 | XlsxDeepA.tsx |  |
| resolveTypeGroups | Af | 184473 | XlsxDeepA.tsx |  |
| toAxisNumber | jf | 184492 | XlsxDeepA.tsx |  |
| extractNumericValue | Mf | 184495 | XlsxDeepA.tsx |  |
| collectPieDataPoints | Nf | 184521 | XlsxDeepA.tsx |  |
| isSubtotalSeries | Pf | 184532 | XlsxDeepA.tsx |  |
| collectStackedTotals | Ff | 184537 | XlsxDeepA.tsx |  |
| resolveLegendItems | gp | 185063 | XlsxDeepA.tsx |  |
| computeChartLayout | _p | 185092 | XlsxDeepA.tsx |  |
| buildHierarchyTree | If | 184575 | XlsxDeepA.tsx |  |
| resolveQuartileMethod | Lf | 184616 | XlsxDeepA.tsx |  |
| resolveBoxWhiskerVisibility | Rf | 184624 | XlsxDeepA.tsx |  |
| quantileValue | zf | 184635 | XlsxDeepA.tsx |  |
| computeBoxWhiskerStats | Bf | 184648 | XlsxDeepA.tsx |  |
| resolveSunburstFillColor | Vf | 184681 | XlsxDeepA.tsx |  |
| resolveTreemapFillColor | Hf | 184686 | XlsxDeepA.tsx |  |
| tileHierarchyNode | Uf | 184690 | XlsxDeepA.tsx |  |
| resolveSurfaceBaseColor | Wf | 184699 | XlsxDeepA.tsx |  |
| normalizeSurfaceStyleId | Gf | 184709 | XlsxDeepA.tsx |  |
| resolveSurfaceAccentColor | Kf | 184712 | XlsxDeepA.tsx |  |
| surfaceStyleRamp | qf | 184718 | XlsxDeepA.tsx |  |
| resolveSurfaceStylePalette | Jf | 184723 | XlsxDeepA.tsx |  |
| isStyledSurfaceChart | Yf | 184736 | XlsxDeepA.tsx |  |
| resolveSurfaceBandCount | Xf | 184747 | XlsxDeepA.tsx |  |
| resolveSurfaceColorRamp | Zf | 184765 | XlsxDeepA.tsx |  |
| resolveSurfaceBandColor | Qf | 184774 | XlsxDeepA.tsx |  |
| computeSurfaceValueScale | $f | 184780 | XlsxDeepA.tsx |  |
| sampleSurfaceRampColor | ep | 184809 | XlsxDeepA.tsx |  |
| resolveSurfaceCellColor | tp | 184819 | XlsxDeepA.tsx |  |
| surfaceBandIndexForValue | np | 184822 | XlsxDeepA.tsx |  |
| resolveSurfaceLineColors | op | 184886 | XlsxDeepA.tsx |  |
| resolveSurfaceLineColor | sp | 184893 | XlsxDeepA.tsx |  |
| resolveSurfacePlotRect | cp | 184899 | XlsxDeepA.tsx |  |
| surfaceLegendItems | lp | 184918 | XlsxDeepA.tsx |  |
| is2dSurfaceChart | up | 184930 | XlsxDeepA.tsx |  |
| renderSurface2dFrame | dp | 184941 | XlsxDeepA.tsx |  |
| pointsToLinePath | rp | 184828 | XlsxDeepA.tsx |  |
| splitDefinedPointRuns | ip | 184836 | XlsxDeepA.tsx |  |
| joinContourSegments | ap | 184853 | XlsxDeepA.tsx |  |
| niceTickStep | vp | 185122 | XlsxDeepA.tsx |  |
| buildTicks | yp | 185128 | XlsxDeepA.tsx |  |
| buildValueScale | bp | 185138 | XlsxDeepA.tsx |  |
| resolveAxisScale | xp | 185151 | XlsxDeepA.tsx |  |
| computeBar3dDepth | Sp | 185165 | XlsxDeepA.tsx |  |
| isDateFormatCode | Tp | 185205 | XlsxDeepA.tsx |  |
| excelSerialToDate | Ep | 185214 | XlsxDeepA.tsx |  |
| formatExcelDate | Dp | 185219 | XlsxDeepA.tsx |  |
| formatCategoryValue | Op | 185236 | XlsxDeepA.tsx |  |
| markerSymbolPath | Ap | 185250 | XlsxDeepA.tsx |  |
| normalizeArcAngles | Mp | 185277 | XlsxDeepA.tsx |  |
| arcTopFaceSegments | Np | 185283 | XlsxDeepA.tsx |  |
| pieArcPoint | Pp | 185297 | XlsxDeepA.tsx |  |
| pie3dSidePaths | Ip | 185303 | XlsxDeepA.tsx |  |
| isArcBackAngle | Lp | 185320 | XlsxDeepA.tsx |  |
| pie3dSliceWallPath | Rp | 185324 | XlsxDeepA.tsx |  |
| pointsToPath | qp | 185752 | XlsxDeepA.tsx |  |
| project3dPoint | Jp | 185757 | XlsxDeepA.tsx |  |
| scalePoint2d | Hp | 185522 | XlsxDeepA.tsx |  |
| ellipseArcPoints | Up | 185525 | XlsxDeepA.tsx |  |
| closedOutlinePath | Wp | 185538 | XlsxDeepA.tsx |  |
| renderChartTitle | zp | 185338 | XlsxDeepA.tsx |  |
| renderChartLegend | Bp | 185353 | XlsxDeepA.tsx |  |
| renderCartesianGrid | Vp | 185399 | XlsxDeepA.tsx |  |
| resolveStockSeriesRoles | pp | 185000 | XlsxDeepA.tsx |  |
| resolveStockPalette | mp | 185022 | XlsxDeepA.tsx |  |
| stockLegendItems | hp | 185045 | XlsxDeepA.tsx |  |
| findSeriesByNamePattern | om | 188487 | XlsxDeepA.tsx |  |
| renderCylinderCone3d | Gp | 185541 | XlsxDeepA.tsx |  |
| renderBar3dShape | Kp | 185614 | XlsxDeepA.tsx |  |
| renderLine3dChart | Yp | 185769 | XlsxDeepA.tsx |  |
| renderBarChart | Xp | 186122 | XlsxDeepA.tsx |  |
| renderLineAreaChart | Zp | 186505 | XlsxDeepA.tsx |  |
| renderComboChart | Qp | 186738 | XlsxDeepA.tsx |  |
| renderScatterChart | $p | 186906 | XlsxDeepA.tsx |  |
| renderBubbleChart | em | 187147 | XlsxDeepA.tsx |  |
| renderRadarChart | tm | 187378 | XlsxDeepA.tsx |  |
| renderPieChart | nm | 187540 | XlsxDeepA.tsx |  |
| renderBarOfPieChart | rm | 187776 | XlsxDeepA.tsx |  |
| renderSurfaceChart | im | 187927 | XlsxDeepA.tsx |  |
| renderSurfaceHitAreas | am | 188448 | XlsxDeepA.tsx |  |
| renderStockChart | sm | 188491 | XlsxDeepA.tsx |  |
| renderWaterfallChart | cm | 188659 | XlsxDeepA.tsx |  |
| renderFunnelChart | lm | 188793 | XlsxDeepA.tsx |  |
| renderSunburstChart | um | 188844 | XlsxDeepA.tsx |  |
| renderTreemapChart | dm | 188910 | XlsxDeepA.tsx |  |
| renderBoxWhiskerChart | fm | 188972 | XlsxDeepA.tsx |  |
| renderRegionMapChart | pm | 189183 | XlsxDeepA.tsx |  |
| renderUnsupportedChart | mm | 189294 | XlsxDeepA.tsx |  |
| renderChartBody | hm | 189317 | XlsxDeepA.tsx |  |
| ChartSvgRenderer | gm | 189364 | XlsxDeepA.tsx |  |
| LIGHT_GRID_THEME | _m | 189454 | XlsxDeepA.tsx |  |
| DARK_GRID_THEME | vm | 189476 | XlsxDeepA.tsx |  |
| isDarkGridTheme | ym | 189498 | XlsxDeepA.tsx |  |
| resolveGridTheme | bm | 189501 | XlsxDeepA.tsx |  |
| useSpreadsheetController | Ru | 15672 | XlsxDeepA.tsx |  |
| sampleColorRamp | df | 184263 | XlsxDeepA.tsx |  |
| resolveRegionValueColor | ff | 184272 | XlsxDeepA.tsx |  |
| resolveRegionMapStrokeColor | pf | 184278 | XlsxDeepA.tsx |  |
| regionMapLegendItems | mf | 184281 | XlsxDeepA.tsx |  |

## 61. B5 · XlsxDeepB.tsx（react-xlsx 深部 B 段：oy 网格主组件，单一符号）

- 族/来源：xlsx 族 · 源 chunk `out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）· B5-12b。行号口径：chunk js 行。
- 符号条数：1（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| SpreadsheetGrid | oy | 193217–199291 | XlsxDeepB.tsx | 高（结构逐字；类型注记机器补） |

## 62. B5 · XlsxDeepC.tsx（react-xlsx 深部 C 段：常量族/上下文/工具栏/行渲染）

- 族/来源：xlsx 族 · 源 chunk `out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）· B5-12c。行号口径：chunk js 行。
- 符号条数：297（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| clampValue | Vu | 183064 | XlsxDeepC.tsx |  |
| parseNumericInput | Hu | 183067 | XlsxDeepC.tsx |  |
| parseSurfaceHexRgb | Uu | 183077 | XlsxDeepC.tsx |  |
| mixSurfaceHexColors | Wu | 183087 | XlsxDeepC.tsx |  |
| lightenSurfaceHex | Gu | 183095 | XlsxDeepC.tsx |  |
| darkenSurfaceHex | Ku | 183098 | XlsxDeepC.tsx |  |
| resolveChartPrimaryColor | qu | 183101 | XlsxDeepC.tsx |  |
| unwrapChartStyleId | Ju | 183111 | XlsxDeepC.tsx |  |
| normalizeHexColorLiteral | Yu | 183114 | XlsxDeepC.tsx |  |
| resolveSeriesAccentColor | Xu | 183121 | XlsxDeepC.tsx |  |
| surfaceStyleTintRamp | Zu | 183127 | XlsxDeepC.tsx |  |
| surfaceStyleRampFor | Qu | 183132 | XlsxDeepC.tsx |  |
| isSurfaceStyleApplied | $u | 183145 | XlsxDeepC.tsx |  |
| resolveSurfaceBandTotal | ed | 183156 | XlsxDeepC.tsx |  |
| resolveSurfaceBandRamp | td | 183174 | XlsxDeepC.tsx |  |
| computeSurfaceValueTicks | nd | 183183 | XlsxDeepC.tsx |  |
| surfaceBandColorForValue | rd | 183212 | XlsxDeepC.tsx |  |
| surfaceBandColorAlias | id | 183221 | XlsxDeepC.tsx |  |
| surfaceLineColorsForChart | ad | 183224 | XlsxDeepC.tsx |  |
| surfaceLineColorForValue | od | 183231 | XlsxDeepC.tsx |  |
| hexToRgbaTuple | sd | 183240 | XlsxDeepC.tsx |  |
| surfaceLitRgba | cd | 183244 | XlsxDeepC.tsx |  |
| bilinearInterpolateValue | ld | 183247 | XlsxDeepC.tsx |  |
| normalizeGridU | ud | 183250 | XlsxDeepC.tsx |  |
| normalizeGridV | dd | 183253 | XlsxDeepC.tsx |  |
| surfaceValueElevation | fd | 183256 | XlsxDeepC.tsx |  |
| projectSurfacePoint3d | pd | 183259 | XlsxDeepC.tsx |  |
| triangleSurfaceNormal | md | 183271 | XlsxDeepC.tsx |  |
| withAbsoluteDepth | hd | 183284 | XlsxDeepC.tsx |  |
| withRelativeDepth | gd | 183287 | XlsxDeepC.tsx |  |
| isFlatSurfaceChart | _d | 183290 | XlsxDeepC.tsx |  |
| buildSurfaceGeometry | vd | 183301 | XlsxDeepC.tsx |  |
| SurfaceChartPanel | yd | 183672 | XlsxDeepC.tsx |  |
| chartSeriesDataAttrs | bd | 183890 | XlsxDeepC.tsx |  |
| chartSeriesFirstDataAttrs | xd | 183898 | XlsxDeepC.tsx |  |
| closestChartSeriesElement | Sd | 183901 | XlsxDeepC.tsx |  |
| resolveChartElementTarget | Cd | 183904 | XlsxDeepC.tsx |  |
| isChartSeriesSelected | wd | 183926 | XlsxDeepC.tsx |  |
| isChartPointSelected | Td | 183929 | XlsxDeepC.tsx |  |
| isChartElementSelected | Ed | 183932 | XlsxDeepC.tsx |  |
| renderRectSelectionHandles | Dd | 183935 | XlsxDeepC.tsx |  |
| renderSelectionHandles | Od | 183947 | XlsxDeepC.tsx |  |
| DEFAULT_ROW_HEIGHT | xm | 189512 | XlsxDeepC.tsx |  |
| DEFAULT_COL_WIDTH | Sm | 189513 | XlsxDeepC.tsx |  |
| HEADER_ROW_HEIGHT | Cm | 189514 | XlsxDeepC.tsx |  |
| ROW_HEADER_WIDTH | wm | 189515 | XlsxDeepC.tsx |  |
| RANGE_CLIPBOARD_MIME | Tm | 189516 | XlsxDeepC.tsx |  |
| MIN_RENDERED_ROWS | Em | 189517 | XlsxDeepC.tsx |  |
| MIN_RENDERED_COLS | Dm | 189518 | XlsxDeepC.tsx |  |
| ROW_BATCH_SIZE | Om | 189519 | XlsxDeepC.tsx |  |
| COL_BATCH_SIZE | km | 189520 | XlsxDeepC.tsx |  |
| MAX_RENDERED_ROWS | Am | 189521 | XlsxDeepC.tsx |  |
| MAX_RENDERED_COLS | jm | 189522 | XlsxDeepC.tsx |  |
| ROW_CAPACITY_STEP | Mm | 189523 | XlsxDeepC.tsx |  |
| COL_CAPACITY_STEP | Nm | 189524 | XlsxDeepC.tsx |  |
| ROW_PREFETCH_THRESHOLD | Pm | 189525 | XlsxDeepC.tsx |  |
| COL_PREFETCH_THRESHOLD | Fm | 189526 | XlsxDeepC.tsx |  |
| ROW_SCROLL_GROWTH_STEP | Im | 189527 | XlsxDeepC.tsx |  |
| COL_SCROLL_GROWTH_STEP | Lm | 189528 | XlsxDeepC.tsx |  |
| ROW_SCROLL_PREFETCH_PX | Rm | 189529 | XlsxDeepC.tsx |  |
| COL_SCROLL_PREFETCH_PX | zm | 189530 | XlsxDeepC.tsx |  |
| POINTER_MOVE_TOLERANCE_PX | Bm | 189531 | XlsxDeepC.tsx |  |
| SCROLLBAR_PLACEHOLDER_PX | Vm | 189532 | XlsxDeepC.tsx |  |
| RESIZE_HANDLE_SIZE_PX | Hm | 189533 | XlsxDeepC.tsx |  |
| FROZEN_DIVIDER_HIT_TOLERANCE_PX | Um | 189534 | XlsxDeepC.tsx |  |
| CONTENT_LAYER_MAX_PX | Wm | 189535 | XlsxDeepC.tsx |  |
| VIEWPORT_OVERDRAW_MAX_PX | Gm | 189536 | XlsxDeepC.tsx |  |
| SCROLL_SYNC_INVALIDATE_PX | Km | 189537 | XlsxDeepC.tsx |  |
| SCROLL_JUMP_THRESHOLD_PX | qm | 189538 | XlsxDeepC.tsx |  |
| CONTENT_CULL_MARGIN_PX | Jm | 189539 | XlsxDeepC.tsx |  |
| GESTURE_ZOOM_SETTLE_MS | Ym | 189540 | XlsxDeepC.tsx |  |
| WHEEL_ZOOM_FACTOR | Xm | 189541 | XlsxDeepC.tsx |  |
| WHEEL_LINE_DELTA_PX | Zm | 189542 | XlsxDeepC.tsx |  |
| CHART_HIGHLIGHT_PALETTE | Qm | 189543 | XlsxDeepC.tsx |  |
| CHART_HIGHLIGHT_ROLE_COLORS | $m | 189544 | XlsxDeepC.tsx |  |
| DEFAULT_EDITOR_BACKGROUND | eh | 189551 | XlsxDeepC.tsx |  |
| MUTED_SLATE_COLOR | th | 189552 | XlsxDeepC.tsx |  |
| LIGHT_CANVAS_SURFACE | nh | 189553 | XlsxDeepC.tsx |  |
| HANDLE_SHADOW_COLOR | rh | 189554 | XlsxDeepC.tsx |  |
| CELL_PADDING | ih | 189555 | XlsxDeepC.tsx |  |
| RESIZE_HANDLE_DIRECTIONS | ah | 189556 | XlsxDeepC.tsx |  |
| STYLE_INFO_CACHE_CAPACITY | oh | 189557 | XlsxDeepC.tsx |  |
| TEXT_WIDTH_CACHE_CAPACITY | sh | 189558 | XlsxDeepC.tsx |  |
| TRUNCATE_CACHE_CAPACITY | ch | 189559 | XlsxDeepC.tsx |  |
| WRAP_CACHE_CAPACITY | lh | 189560 | XlsxDeepC.tsx |  |
| PATH2D_CACHE_CAPACITY | uh | 189561 | XlsxDeepC.tsx |  |
| EMPTY_VIRTUAL_ITEMS | dh | 189562 | XlsxDeepC.tsx |  |
| RESIZE_CURSOR_BY_DIRECTION | fh | 189563 | XlsxDeepC.tsx |  |
| CSS_LENGTH_PROPERTIES | ph | 189573 | XlsxDeepC.tsx |  |
| STYLE_INFO_CACHE | mh | 189578 | XlsxDeepC.tsx |  |
| TEXT_WIDTH_CACHE | hh | 189579 | XlsxDeepC.tsx |  |
| TRUNCATE_CACHE | gh | 189580 | XlsxDeepC.tsx |  |
| WRAP_CACHE | _h | 189581 | XlsxDeepC.tsx |  |
| PATH2D_CACHE | vh | 189582 | XlsxDeepC.tsx |  |
| cachePutEvicting | yh | 189583 | XlsxDeepC.tsx |  |
| roundToQuarterPx | bh | 189590 | XlsxDeepC.tsx |  |
| measureTextWidthCached | xh | 189593 | XlsxDeepC.tsx |  |
| drawTextDecorations | Sh | 189599 | XlsxDeepC.tsx |  |
| getPath2dCached | Ch | 189622 | XlsxDeepC.tsx |  |
| scaleCssLengths | wh | 189625 | XlsxDeepC.tsx |  |
| scaleStyleValues | Th | 189633 | XlsxDeepC.tsx |  |
| parseLengthNumber | Eh | 189651 | XlsxDeepC.tsx |  |
| parseBoxInsets | Dh | 189662 | XlsxDeepC.tsx |  |
| resolveTextRotationDeg | Oh | 189686 | XlsxDeepC.tsx |  |
| resolveFontShorthand | kh | 189691 | XlsxDeepC.tsx |  |
| fontShorthandAtSize | Ah | 189702 | XlsxDeepC.tsx |  |
| parseBorderShorthand | jh | 189714 | XlsxDeepC.tsx |  |
| borderStyleRank | Mh | 189725 | XlsxDeepC.tsx |  |
| pickStrongerBorder | Nh | 189728 | XlsxDeepC.tsx |  |
| applyLineDashForBorderStyle | Ph | 189732 | XlsxDeepC.tsx |  |
| drawCellBorder | Fh | 189743 | XlsxDeepC.tsx |  |
| truncateTextToWidth | Ih | 189767 | XlsxDeepC.tsx |  |
| resolveFontSizePx | Lh | 189782 | XlsxDeepC.tsx |  |
| resolveLineHeightPx | Rh | 189793 | XlsxDeepC.tsx |  |
| resolveTextBaselineY | zh | 189814 | XlsxDeepC.tsx |  |
| fitTextCharCount | Bh | 189817 | XlsxDeepC.tsx |  |
| wrapTextToWidth | Vh | 189828 | XlsxDeepC.tsx |  |
| resolveCellStyleInfo | Hh | 189874 | XlsxDeepC.tsx |  |
| splitTopLevelSegments | Uh | 189916 | XlsxDeepC.tsx |  |
| parseGradientStops | Wh | 189937 | XlsxDeepC.tsx |  |
| createGradientFill | Gh | 189950 | XlsxDeepC.tsx |  |
| createDataBarFill | Kh | 190010 | XlsxDeepC.tsx |  |
| drawConditionalIconGlyph | qh | 190015 | XlsxDeepC.tsx |  |
| formatZoomPercent | Jh | 190055 | XlsxDeepC.tsx |  |
| clampToBounds | Yh | 190058 | XlsxDeepC.tsx |  |
| normalizeWheelDelta | Xh | 190061 | XlsxDeepC.tsx |  |
| clampPointToRect | Zh | 190072 | XlsxDeepC.tsx |  |
| pointerDistance | Qh | 190075 | XlsxDeepC.tsx |  |
| parseHexRgb | $h | 190078 | XlsxDeepC.tsx |  |
| blendHexColors | eg | 190088 | XlsxDeepC.tsx |  |
| lightenHex | tg | 190096 | XlsxDeepC.tsx |  |
| darkenHex | ng | 190099 | XlsxDeepC.tsx |  |
| SpreadsheetControllerContext | rg | 190102 | XlsxDeepC.tsx |  |
| SpreadsheetHeaderThemeContext | ig | 190103 | XlsxDeepC.tsx |  |
| joinClassNames | ag | 190104 | XlsxDeepC.tsx |  |
| darkHeaderSurface | og | 190107 | XlsxDeepC.tsx |  |
| resolveHeaderSurfaceColor | sg | 190110 | XlsxDeepC.tsx |  |
| normalizeRangeBounds | cg | 190113 | XlsxDeepC.tsx |  |
| parseCellKey | lg | 190119 | XlsxDeepC.tsx |  |
| isSameCell | ug | 190126 | XlsxDeepC.tsx |  |
| cellInRange | dg | 190129 | XlsxDeepC.tsx |  |
| chartHighlightForCell | fg | 190134 | XlsxDeepC.tsx |  |
| rangesEqual | pg | 190150 | XlsxDeepC.tsx |  |
| isPrintableCharKey | mg | 190161 | XlsxDeepC.tsx |  |
| closestInteractiveElement | hg | 190164 | XlsxDeepC.tsx |  |
| isFocusWithinContainer | gg | 190171 | XlsxDeepC.tsx |  |
| buildPrefixSums | _g | 190175 | XlsxDeepC.tsx |  |
| rangeHasIndex | vg | 190180 | XlsxDeepC.tsx |  |
| expandIndicesAcrossMerges | yg | 190184 | XlsxDeepC.tsx |  |
| rangesFingerprint | bg | 190209 | XlsxDeepC.tsx |  |
| rangeBoundsKey | xg | 190212 | XlsxDeepC.tsx |  |
| prefixSpanBetween | Sg | 190217 | XlsxDeepC.tsx |  |
| offsetsByIndices | Cg | 190220 | XlsxDeepC.tsx |  |
| findSegmentIndexAt | wg | 190226 | XlsxDeepC.tsx |  |
| clampScrollOffset | Tg | 190239 | XlsxDeepC.tsx |  |
| minContentExtent | Eg | 190242 | XlsxDeepC.tsx |  |
| collectRenderIndices | Dg | 190245 | XlsxDeepC.tsx |  |
| resolveRenderCapacity | Og | 190259 | XlsxDeepC.tsx |  |
| offsetBeforeIndex | kg | 190263 | XlsxDeepC.tsx |  |
| resolveIndexOffset | Ag | 190268 | XlsxDeepC.tsx |  |
| resolveAnchorRectPx | jg | 190273 | XlsxDeepC.tsx |  |
| drawingRectPx | Mg | 190301 | XlsxDeepC.tsx |  |
| imageAnchorMaxCell | Ng | 190304 | XlsxDeepC.tsx |  |
| shapeAnchorMaxCell | Pg | 190314 | XlsxDeepC.tsx |  |
| chartAnchorMaxCell | Fg | 190324 | XlsxDeepC.tsx |  |
| rectsIntersectWithMargin | Ig | 190334 | XlsxDeepC.tsx |  |
| resolveScrollRegionKind | Lg | 190343 | XlsxDeepC.tsx |  |
| shapeContainerStyle | Rg | 190360 | XlsxDeepC.tsx |  |
| clampShapeAdjust | zg | 190400 | XlsxDeepC.tsx |  |
| resolveShapeAdjust | Bg | 190403 | XlsxDeepC.tsx |  |
| pointsToOutlinePath | Vg | 190407 | XlsxDeepC.tsx |  |
| polarPoint | Hg | 190412 | XlsxDeepC.tsx |  |
| regularPolygonPath | Ug | 190416 | XlsxDeepC.tsx |  |
| starPolygonPath | Wg | 190419 | XlsxDeepC.tsx |  |
| roundedRectPath | Gg | 190424 | XlsxDeepC.tsx |  |
| ellipsePath | Kg | 190440 | XlsxDeepC.tsx |  |
| pieWedgePath | qg | 190443 | XlsxDeepC.tsx |  |
| chordPath | Jg | 190449 | XlsxDeepC.tsx |  |
| plusCrossPath | Yg | 190455 | XlsxDeepC.tsx |  |
| pentagonArrowPath | Xg | 190474 | XlsxDeepC.tsx |  |
| chevronArrowPath | Zg | 190485 | XlsxDeepC.tsx |  |
| notchedArrowPath | Qg | 190497 | XlsxDeepC.tsx |  |
| stripedArrowPath | $g | 190516 | XlsxDeepC.tsx |  |
| leftUpArrowPath | e_ | 190535 | XlsxDeepC.tsx |  |
| bentUpArrowPath | t_ | 190548 | XlsxDeepC.tsx |  |
| uturnArrowPath | n_ | 190568 | XlsxDeepC.tsx |  |
| leftRightUpArrowPath | r_ | 190585 | XlsxDeepC.tsx |  |
| quadArrowPath | i_ | 190612 | XlsxDeepC.tsx |  |
| heartPath | a_ | 190646 | XlsxDeepC.tsx |  |
| lightningBoltPath | o_ | 190658 | XlsxDeepC.tsx |  |
| teardropPath | s_ | 190669 | XlsxDeepC.tsx |  |
| cloudPath | c_ | 190679 | XlsxDeepC.tsx |  |
| rightArrowPath | l_ | 190695 | XlsxDeepC.tsx |  |
| leftArrowPath | u_ | 190711 | XlsxDeepC.tsx |  |
| upArrowPath | d_ | 190727 | XlsxDeepC.tsx |  |
| downArrowPath | f_ | 190743 | XlsxDeepC.tsx |  |
| leftRightArrowPath | p_ | 190759 | XlsxDeepC.tsx |  |
| upDownArrowPath | m_ | 190777 | XlsxDeepC.tsx |  |
| bentArrowPath | h_ | 190795 | XlsxDeepC.tsx |  |
| resolveAutoShapePath | g_ | 190815 | XlsxDeepC.tsx |  |
| resolveShapeSvgPath | __ | 191051 | XlsxDeepC.tsx |  |
| traceRoundedRectPath | v_ | 191054 | XlsxDeepC.tsx |  |
| applyDashPattern | y_ | 191068 | XlsxDeepC.tsx |  |
| renderArrowMarkerDef | b_ | 191092 | XlsxDeepC.tsx |  |
| renderTextParagraphRuns | x_ | 191113 | XlsxDeepC.tsx |  |
| clampRectToGrid | S_ | 191139 | XlsxDeepC.tsx |  |
| resizeHandleStyle | C_ | 191150 | XlsxDeepC.tsx |  |
| useGridTheme | w_ | 191175 | XlsxDeepC.tsx |  |
| columnIndexToLetters | T_ | 191178 | XlsxDeepC.tsx |  |
| formatCellRef | E_ | 191184 | XlsxDeepC.tsx |  |
| parseCellRef | D_ | 191187 | XlsxDeepC.tsx |  |
| resolveGridCellStyle | O_ | 191195 | XlsxDeepC.tsx |  |
| parseExternalCellRef | k_ | 191205 | XlsxDeepC.tsx |  |
| decodeXmlEntities | A_ | 191219 | XlsxDeepC.tsx |  |
| borderToCssShorthand | j_ | 191229 | XlsxDeepC.tsx |  |
| isDarkTheme | M_ | 191233 | XlsxDeepC.tsx |  |
| parseColorToRgbTuple | N_ | 191236 | XlsxDeepC.tsx |  |
| colorWithAlpha | P_ | 191266 | XlsxDeepC.tsx |  |
| relativeLuminance | F_ | 191272 | XlsxDeepC.tsx |  |
| contrastRatio | I_ | 191281 | XlsxDeepC.tsx |  |
| resolveContrastTextColor | L_ | 191289 | XlsxDeepC.tsx |  |
| hueChannel | R_ | 191296 | XlsxDeepC.tsx |  |
| hslToRgbTuple | z_ | 191304 | XlsxDeepC.tsx |  |
| quoteFontFamily | B_ | 191317 | XlsxDeepC.tsx |  |
| resolveSchemeFontFamily | V_ | 191320 | XlsxDeepC.tsx |  |
| resolveFontFamilyStack | H_ | 191325 | XlsxDeepC.tsx |  |
| lineHeightMultiplier | U_ | 191334 | XlsxDeepC.tsx |  |
| gridInsetShadow | W_ | 191338 | XlsxDeepC.tsx |  |
| resolveCellStyleCss | G_ | 191346 | XlsxDeepC.tsx |  |
| measureCanvasSingleton | K_ | 191415 | XlsxDeepC.tsx |  |
| verticalPaddingPx | q_ | 191416 | XlsxDeepC.tsx |  |
| styleFontShorthand | J_ | 191431 | XlsxDeepC.tsx |  |
| measureCellTextWidth | Y_ | 191434 | XlsxDeepC.tsx |  |
| estimateCellContentHeight | X_ | 191441 | XlsxDeepC.tsx |  |
| canOverflowRight | Z_ | 191459 | XlsxDeepC.tsx |  |
| isRenderableEmptyCell | Q_ | 191465 | XlsxDeepC.tsx |  |
| resolveCellDisplayText | $_ | 191468 | XlsxDeepC.tsx |  |
| numericValueAtCell | ev | 191482 | XlsxDeepC.tsx |  |
| booleanValueAtCell | tv | 191490 | XlsxDeepC.tsx |  |
| parseRangeLiteral | nv | 191500 | XlsxDeepC.tsx |  |
| unquoteSheetName | rv | 191506 | XlsxDeepC.tsx |  |
| splitQualifiedRef | iv | 191510 | XlsxDeepC.tsx |  |
| resolveFormulaRangeRef | av | 191526 | XlsxDeepC.tsx |  |
| rangeCellAtOffset | ov | 191548 | XlsxDeepC.tsx |  |
| chartSelectionRanges | sv | 191559 | XlsxDeepC.tsx |  |
| sparklineValueScale | cv | 191618 | XlsxDeepC.tsx |  |
| renderSparklineSvg | lv | 191621 | XlsxDeepC.tsx |  |
| toNonNegativeInteger | uv | 191736 | XlsxDeepC.tsx |  |
| toPlainRecord | dv | 191739 | XlsxDeepC.tsx |  |
| parseHyperlinkInfo | fv | 191742 | XlsxDeepC.tsx |  |
| parseMergeSpan | pv | 191752 | XlsxDeepC.tsx |  |
| resolveDisplayValue | mv | 191759 | XlsxDeepC.tsx |  |
| buildCellBatchMap | hv | 191764 | XlsxDeepC.tsx |  |
| findRangeContaining | gv | 191786 | XlsxDeepC.tsx |  |
| mergeCellStyles | _v | 191791 | XlsxDeepC.tsx |  |
| expandTableBorderSpans | vv | 191807 | XlsxDeepC.tsx |  |
| resolveTableCellStyle | yv | 191818 | XlsxDeepC.tsx |  |
| tableColumnAtHeader | bv | 191845 | XlsxDeepC.tsx |  |
| SortDirectionMenu | xv | 191850 | XlsxDeepC.tsx |  |
| headerFilterButtonStyle | Sv | 191896 | XlsxDeepC.tsx |  |
| WorkbookSheetTabStrip | Cv | 191915 | XlsxDeepC.tsx |  |
| SpreadsheetToolbar | wv | 191961 | XlsxDeepC.tsx |  |
| resolveToolbarNode | Tv | 192125 | XlsxDeepC.tsx |  |
| resolveErrorNode | Ev | 192134 | XlsxDeepC.tsx |  |
| resolveLoadingNode | Dv | 192153 | XlsxDeepC.tsx |  |
| resolveEmptyNode | Ov | 192170 | XlsxDeepC.tsx |  |
| formatByteSize | kv | 192187 | XlsxDeepC.tsx |  |
| renderFileSizeLimitState | Av | 192195 | XlsxDeepC.tsx |  |
| resolveFileTooLargeNode | jv | 192234 | XlsxDeepC.tsx |  |
| ChartLoadingBars | Mv | 192237 | XlsxDeepC.tsx |  |
| resolveChartLoadingNode | Nv | 192264 | XlsxDeepC.tsx |  |
| formatByteSizeAlias | Pv | 192268 | XlsxDeepC.tsx |  |
| DeferredLoadPrompt | Fv | 192276 | XlsxDeepC.tsx |  |
| resolveSelectionPalette | Iv | 192336 | XlsxDeepC.tsx |  |
| fullBleedRects | Lv | 192344 | XlsxDeepC.tsx |  |
| rectIntersectsAnyRect | Rv | 192347 | XlsxDeepC.tsx |  |
| blitScrolledCanvas | zv | 192353 | XlsxDeepC.tsx |  |
| conditionalRuleKey | Bv | 192388 | XlsxDeepC.tsx |  |
| resolveCfvoThreshold | Vv | 192391 | XlsxDeepC.tsx |  |
| iconSetAppearanceFor | Hv | 192405 | XlsxDeepC.tsx |  |
| renderConditionalIconSvg | Uv | 192490 | XlsxDeepC.tsx |  |
| isCheckboxChecked | Wv | 192539 | XlsxDeepC.tsx |  |
| isCheckboxMixed | Gv | 192542 | XlsxDeepC.tsx |  |
| normalizeFormControlModel | Kv | 192545 | XlsxDeepC.tsx |  |
| renderCheckboxIcon | qv | 192615 | XlsxDeepC.tsx |  |
| renderRadioIcon | Jv | 192658 | XlsxDeepC.tsx |  |
| cleanFormControlCaption | Yv | 192680 | XlsxDeepC.tsx |  |
| resolveDataBarAppearance | Xv | 192694 | XlsxDeepC.tsx |  |
| resolveColorScaleAppearance | Zv | 192736 | XlsxDeepC.tsx |  |
| resolveCellIconSet | Qv | 192772 | XlsxDeepC.tsx |  |
| resolveCellValidation | $v | 192801 | XlsxDeepC.tsx |  |
| verticalAlignToFlexAlign | ey | 192814 | XlsxDeepC.tsx |  |
| horizontalAlignToFlexAlign | ty | 192817 | XlsxDeepC.tsx |  |
| nextIndexAtLeast | ny | 192820 | XlsxDeepC.tsx |  |
| lastIndexAtMost | ry | 192823 | XlsxDeepC.tsx |  |
| SpreadsheetRow | iy | 192832 | XlsxDeepC.tsx |  |
| MemoSpreadsheetRow | ay | 193182 | XlsxDeepC.tsx |  |

## 63. B5 · XlsxDeepP.tsx（react-xlsx 深部前导段 P，js 9111–15671）

- 族/来源：xlsx 族 · 源 chunk `out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）· B5-12p。行号口径：chunk js 行。
- 符号条数：440（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| reactInterop | G | 9111 | XlsxDeepP.tsx |  |
| reglInterop | Rn | 9112 | XlsxDeepP.tsx |  |
| jsxRuntime | K | 9113 | XlsxDeepP.tsx |  |
| chartXmlNamespace | zn | 9114 | XlsxDeepP.tsx |  |
| drawingXmlNamespace | q | 9115 | XlsxDeepP.tsx |  |
| chartRelNamespace | Bn | 9116 | XlsxDeepP.tsx |  |
| chartExRelNamespace | Vn | 9117 | XlsxDeepP.tsx |  |
| chartStyleRelNamespace | Hn | 9118 | XlsxDeepP.tsx |  |
| chartColorStyleRelNamespace | Un | 9119 | XlsxDeepP.tsx |  |
| officeChartPalette | Wn | 9120 | XlsxDeepP.tsx |  |
| quoteFormulaString | Gn | 9132 | XlsxDeepP.tsx |  |
| unquoteFormulaString | Kn | 9135 | XlsxDeepP.tsx |  |
| splitFormulaArgs | qn | 9141 | XlsxDeepP.tsx |  |
| seriesRawName | Jn | 9182 | XlsxDeepP.tsx |  |
| chartSeriesFormula | Yn | 9186 | XlsxDeepP.tsx |  |
| parseSeriesFormula | Xn | 9198 | XlsxDeepP.tsx |  |
| updateChartSeriesValues | Zn | 9220 | XlsxDeepP.tsx |  |
| normalizeSheetVisibility | Qn | 9256 | XlsxDeepP.tsx |  |
| emuPerPx | $n | 9259 | XlsxDeepP.tsx |  |
| themeColorIndices | er | 9260 | XlsxDeepP.tsx |  |
| chartElementTagNames | tr | 9278 | XlsxDeepP.tsx |  |
| clampUnitValue | nr | 9296 | XlsxDeepP.tsx |  |
| isElementNode | rr | 9299 | XlsxDeepP.tsx |  |
| normalizeHexColor | ir | 9302 | XlsxDeepP.tsx |  |
| fillColorFromXml | ar | 9310 | XlsxDeepP.tsx |  |
| shapePaintFromXml | or | 9338 | XlsxDeepP.tsx |  |
| seriesPaintColorsFromXml | sr | 9346 | XlsxDeepP.tsx |  |
| dataPointOverridesFromXml | J | 9355 | XlsxDeepP.tsx |  |
| numericPointValuesFromXml | cr | 9399 | XlsxDeepP.tsx |  |
| bubbleSizeValuesFromXml | lr | 9420 | XlsxDeepP.tsx |  |
| decodeXmlEntities | ur | 9429 | XlsxDeepP.tsx |  |
| normalizeTitleText | dr | 9437 | XlsxDeepP.tsx |  |
| chartTitleFromXml | fr | 9440 | XlsxDeepP.tsx |  |
| matchBubbleChartValues | pr | 9446 | XlsxDeepP.tsx |  |
| chartTypeTagFromXml | mr | 9467 | XlsxDeepP.tsx |  |
| chartTypeElement | hr | 9471 | XlsxDeepP.tsx |  |
| scatterChartSubtype | gr | 9479 | XlsxDeepP.tsx |  |
| matchDataPointOverrides | _r | 9491 | XlsxDeepP.tsx |  |
| hexToRgb | Y | 9523 | XlsxDeepP.tsx |  |
| rgbToHsl | X | 9535 | XlsxDeepP.tsx |  |
| hueToRgbChannel | vr | 9559 | XlsxDeepP.tsx |  |
| hslToRgb | yr | 9567 | XlsxDeepP.tsx |  |
| rgbToHex | br | 9580 | XlsxDeepP.tsx |  |
| adjustColorLuminance | xr | 9589 | XlsxDeepP.tsx |  |
| resolveSchemeColor | Sr | 9596 | XlsxDeepP.tsx |  |
| resolveThemeTypeface | Cr | 9601 | XlsxDeepP.tsx |  |
| defaultRunFontFromXml | wr | 9610 | XlsxDeepP.tsx |  |
| colorFromXmlElement | Tr | 9624 | XlsxDeepP.tsx |  |
| isColorElement | Er | 9651 | XlsxDeepP.tsx |  |
| findColorElement | Dr | 9657 | XlsxDeepP.tsx |  |
| resolveShapeFillColor | Or | 9663 | XlsxDeepP.tsx |  |
| resolveShapeLineProperties | kr | 9692 | XlsxDeepP.tsx |  |
| normalizeChartLegend | Ar | 9705 | XlsxDeepP.tsx |  |
| legendPositionCode | jr | 9714 | XlsxDeepP.tsx |  |
| childNumericVal | Z | 9729 | XlsxDeepP.tsx |  |
| childBooleanVal | Mr | 9734 | XlsxDeepP.tsx |  |
| runFontSizePt | Nr | 9741 | XlsxDeepP.tsx |  |
| dataLabelSpecs | Pr | 9747 | XlsxDeepP.tsx |  |
| normalizeDataLabels | Fr | 9770 | XlsxDeepP.tsx |  |
| partRelationshipMap | Ir | 9793 | XlsxDeepP.tsx |  |
| themeColorList | Lr | 9807 | XlsxDeepP.tsx |  |
| chartStyleColors | Rr | 9818 | XlsxDeepP.tsx |  |
| accentColorPalette | zr | 9848 | XlsxDeepP.tsx |  |
| normalizeChartStyleId | Br | 9852 | XlsxDeepP.tsx |  |
| surfaceChartPalette | Vr | 9855 | XlsxDeepP.tsx |  |
| applySurfaceChartDefaults | Hr | 9863 | XlsxDeepP.tsx |  |
| applyChartStyleDefaults | Ur | 9886 | XlsxDeepP.tsx |  |
| dataPointOverridesFromElement | Wr | 9933 | XlsxDeepP.tsx |  |
| invertedPointStyle | Gr | 9949 | XlsxDeepP.tsx |  |
| referencePointsFromElement | Kr | 9956 | XlsxDeepP.tsx |  |
| multiLevelRefPoints | qr | 9975 | XlsxDeepP.tsx |  |
| applySeriesXmlStyles | Jr | 10001 | XlsxDeepP.tsx |  |
| hydrateChartFromPartXml | Yr | 10071 | XlsxDeepP.tsx |  |
| normalizePartPath | Xr | 10501 | XlsxDeepP.tsx |  |
| partDirectory | Zr | 10504 | XlsxDeepP.tsx |  |
| resolvePartTarget | Qr | 10509 | XlsxDeepP.tsx |  |
| partText | $r | 10535 | XlsxDeepP.tsx |  |
| parseXmlDocument | ei | 10540 | XlsxDeepP.tsx |  |
| serializeXmlDocument | ti | 10548 | XlsxDeepP.tsx |  |
| childElements | ni | 10551 | XlsxDeepP.tsx |  |
| removeChildElements | ri | 10556 | XlsxDeepP.tsx |  |
| descendantElements | ii | 10559 | XlsxDeepP.tsx |  |
| firstChild | Q | 10562 | XlsxDeepP.tsx |  |
| firstDescendant | ai | 10565 | XlsxDeepP.tsx |  |
| ensureChildElement | oi | 10568 | XlsxDeepP.tsx |  |
| ensureChildTextElement | si | 10574 | XlsxDeepP.tsx |  |
| ensureBooleanChildElement | ci | 10578 | XlsxDeepP.tsx |  |
| ensureIntegerChildElement | li | 10582 | XlsxDeepP.tsx |  |
| unquoteSheetName | ui | 10586 | XlsxDeepP.tsx |  |
| splitSheetReference | di | 10590 | XlsxDeepP.tsx |  |
| parseCellRef | fi | 10603 | XlsxDeepP.tsx |  |
| parseRangeRef | pi | 10610 | XlsxDeepP.tsx |  |
| columnLetters | mi | 10621 | XlsxDeepP.tsx |  |
| formatAbsoluteRangeRef | hi | 10630 | XlsxDeepP.tsx |  |
| resolveFormulaRange | gi | 10633 | XlsxDeepP.tsx |  |
| resolveRangeTitle | _i | 10649 | XlsxDeepP.tsx |  |
| readRangeStrings | vi | 10669 | XlsxDeepP.tsx |  |
| normalizeLegendModel | yi | 10692 | XlsxDeepP.tsx |  |
| titleCaseLabel | bi | 10698 | XlsxDeepP.tsx |  |
| normalizeAxisModel | xi | 10706 | XlsxDeepP.tsx |  |
| chartExLayoutType | Si | 10733 | XlsxDeepP.tsx |  |
| chartExLayoutId | Ci | 10755 | XlsxDeepP.tsx |  |
| chartExAxisIds | wi | 10764 | XlsxDeepP.tsx |  |
| niceBinSize | Ti | 10781 | XlsxDeepP.tsx |  |
| formatBinInterval | Ei | 10787 | XlsxDeepP.tsx |  |
| computeHistogramBins | Di | 10792 | XlsxDeepP.tsx |  |
| applyHistogramBinning | Oi | 10844 | XlsxDeepP.tsx |  |
| buildParetoSeries | ki | 10867 | XlsxDeepP.tsx |  |
| chartExTextValue | Ai | 10889 | XlsxDeepP.tsx |  |
| chartExTitleText | ji | 10897 | XlsxDeepP.tsx |  |
| hierarchyCategoryRef | Mi | 10906 | XlsxDeepP.tsx |  |
| buildChartExSeries | Ni | 10919 | XlsxDeepP.tsx |  |
| filterChartExSeries | Pi | 10995 | XlsxDeepP.tsx |  |
| buildChartExModel | Fi | 11010 | XlsxDeepP.tsx |  |
| cellValueToNumber | Ii | 11112 | XlsxDeepP.tsx |  |
| cellValueToString | Li | 11135 | XlsxDeepP.tsx |  |
| readFormulaValues | Ri | 11149 | XlsxDeepP.tsx |  |
| resolveFormulaText | zi | 11171 | XlsxDeepP.tsx |  |
| normalizeSeriesRef | Bi | 11182 | XlsxDeepP.tsx |  |
| normalizeChartExAxis | Vi | 11192 | XlsxDeepP.tsx |  |
| mergeAxisModel | Hi | 11234 | XlsxDeepP.tsx |  |
| axisModelFromElement | Ui | 11237 | XlsxDeepP.tsx |  |
| wallModelFromElement | Wi | 11279 | XlsxDeepP.tsx |  |
| normalizeDataLabelsModel | Gi | 11290 | XlsxDeepP.tsx |  |
| normalizeAnchorModel | Ki | 11338 | XlsxDeepP.tsx |  |
| anchorMarkerFromElement | qi | 11398 | XlsxDeepP.tsx |  |
| anchorFromElement | Ji | 11413 | XlsxDeepP.tsx |  |
| isAnchorInverted | Yi | 11446 | XlsxDeepP.tsx |  |
| buildJsonChartSeries | Xi | 11456 | XlsxDeepP.tsx |  |
| buildJsonChartTypeGroup | Zi | 11501 | XlsxDeepP.tsx |  |
| buildChartsheetTab | Qi | 11519 | XlsxDeepP.tsx |  |
| buildSheetTabList | $i | 11531 | XlsxDeepP.tsx |  |
| drawingChartRefs | ea | 11584 | XlsxDeepP.tsx |  |
| assignChartOrigins | ta | 11636 | XlsxDeepP.tsx |  |
| hydrateChartAssets | na | 11661 | XlsxDeepP.tsx |  |
| chartAnchorElements | ra | 11786 | XlsxDeepP.tsx |  |
| writeAnchorMarker | ia | 11800 | XlsxDeepP.tsx |  |
| writeAnchorGeometry | aa | 11807 | XlsxDeepP.tsx |  |
| writeChartTitle | oa | 11829 | XlsxDeepP.tsx |  |
| writeRefFormula | sa | 11851 | XlsxDeepP.tsx |  |
| writeSeriesName | ca | 11858 | XlsxDeepP.tsx |  |
| writeSeriesFormulas | la | 11869 | XlsxDeepP.tsx |  |
| writeAxisProperties | ua | 11911 | XlsxDeepP.tsx |  |
| writeDataLabelFlags | da | 11955 | XlsxDeepP.tsx |  |
| updateChartAnchorInImageAssets | fa | 11965 | XlsxDeepP.tsx |  |
| updateChartInImageAssets | pa | 11980 | XlsxDeepP.tsx |  |
| normalizeStyleHex | ma | 12007 | XlsxDeepP.tsx |  |
| styleHexToRgb | ha | 12015 | XlsxDeepP.tsx |  |
| styleRgbToHsl | ga | 12026 | XlsxDeepP.tsx |  |
| styleHueChannel | _a | 12050 | XlsxDeepP.tsx |  |
| styleHslToRgb | va | 12058 | XlsxDeepP.tsx |  |
| styleRgbToHex | ya | 12071 | XlsxDeepP.tsx |  |
| adjustColorTint | ba | 12074 | XlsxDeepP.tsx |  |
| resolveFontColor | xa | 12082 | XlsxDeepP.tsx |  |
| resolveSolidFillColor | Sa | 12096 | XlsxDeepP.tsx |  |
| resolveFillColor | Ca | 12105 | XlsxDeepP.tsx |  |
| officeRelationshipsNamespace | wa | 12131 | XlsxDeepP.tsx |  |
| packageRelationshipsNamespace | Ta | 12132 | XlsxDeepP.tsx |  |
| spreadsheetMlNamespace | Ea | 12133 | XlsxDeepP.tsx |  |
| contentTypesNamespace | Da | 12134 | XlsxDeepP.tsx |  |
| drawingRelNamespace | Oa | 12135 | XlsxDeepP.tsx |  |
| imageRelNamespace | ka | 12136 | XlsxDeepP.tsx |  |
| drawingContentType | Aa | 12137 | XlsxDeepP.tsx |  |
| emuPerPixel | ja | 12138 | XlsxDeepP.tsx |  |
| minColumnWidthPx | Ma | 12139 | XlsxDeepP.tsx |  |
| minRowHeightPx | Na | 12140 | XlsxDeepP.tsx |  |
| maxColumnWidthEmu | Pa | 12141 | XlsxDeepP.tsx |  |
| defaultRowHeightEmu | Fa | 12142 | XlsxDeepP.tsx |  |
| defaultCharWidthPx | Ia | 12143 | XlsxDeepP.tsx |  |
| charWidthCache | La | 12144 | XlsxDeepP.tsx |  |
| devicePixelSnap | Ra | 12145 | XlsxDeepP.tsx |  |
| measureCharWidth | za | 12150 | XlsxDeepP.tsx |  |
| columnWidthToPixels | Ba | 12171 | XlsxDeepP.tsx |  |
| defaultColumnWidthPx | Va | 12177 | XlsxDeepP.tsx |  |
| defaultRowHeightPx | Ha | 12181 | XlsxDeepP.tsx |  |
| hiddenRowIndices | Ua | 12185 | XlsxDeepP.tsx |  |
| hiddenColumnIndices | Wa | 12191 | XlsxDeepP.tsx |  |
| mergeSpanSummary | Ga | 12197 | XlsxDeepP.tsx |  |
| themePaletteModel | Ka | 12231 | XlsxDeepP.tsx |  |
| copyToUint8Array | qa | 12259 | XlsxDeepP.tsx |  |
| normalizeZipPath | Ja | 12263 | XlsxDeepP.tsx |  |
| joinZipPath | Ya | 12266 | XlsxDeepP.tsx |  |
| zipPathDir | Xa | 12269 | XlsxDeepP.tsx |  |
| resolveZipPath | Za | 12274 | XlsxDeepP.tsx |  |
| relativeZipPath | Qa | 12289 | XlsxDeepP.tsx |  |
| zipRelsPath | $a | 12298 | XlsxDeepP.tsx |  |
| parseXmlStrict | eo | 12302 | XlsxDeepP.tsx |  |
| serializeXmlWb | to | 12306 | XlsxDeepP.tsx |  |
| zipEntryTextWb | no | 12309 | XlsxDeepP.tsx |  |
| columnLettersToIndex | ro | 12313 | XlsxDeepP.tsx |  |
| parseCellAddress | io | 12321 | XlsxDeepP.tsx |  |
| parseRangeAddress | ao | 12328 | XlsxDeepP.tsx |  |
| stripSheetPrefix | oo | 12334 | XlsxDeepP.tsx |  |
| rangeStartCell | so | 12339 | XlsxDeepP.tsx |  |
| rangeAddressPart | co | 12342 | XlsxDeepP.tsx |  |
| isElementNodeWb | lo | 12345 | XlsxDeepP.tsx |  |
| descendantElementsWb | uo | 12348 | XlsxDeepP.tsx |  |
| childElementsWb | fo | 12351 | XlsxDeepP.tsx |  |
| firstChildWb | $ | 12354 | XlsxDeepP.tsx |  |
| firstDescendantWb | po | 12357 | XlsxDeepP.tsx |  |
| featurePropertyBagTypes | mo | 12360 | XlsxDeepP.tsx |  |
| relationIdAttr | ho | 12392 | XlsxDeepP.tsx |  |
| relationEmbedAttr | go | 12395 | XlsxDeepP.tsx |  |
| setChildText | _o | 12398 | XlsxDeepP.tsx |  |
| writeMarkerText | vo | 12402 | XlsxDeepP.tsx |  |
| contentTypeMaps | yo | 12409 | XlsxDeepP.tsx |  |
| contentTypeForPart | bo | 12428 | XlsxDeepP.tsx |  |
| relationshipMapForPart | xo | 12435 | XlsxDeepP.tsx |  |
| workbookSheetEntries | So | 12452 | XlsxDeepP.tsx |  |
| parseTheme | Co | 12467 | XlsxDeepP.tsx |  |
| parseColorAttributes | wo | 12515 | XlsxDeepP.tsx |  |
| booleanFlagAttr | To | 12530 | XlsxDeepP.tsx |  |
| parseSparklineGroups | Eo | 12535 | XlsxDeepP.tsx |  |
| parseFontElement | Do | 12576 | XlsxDeepP.tsx |  |
| parseFillElement | Oo | 12605 | XlsxDeepP.tsx |  |
| parseBorderSide | ko | 12638 | XlsxDeepP.tsx |  |
| parseBorderElement | Ao | 12644 | XlsxDeepP.tsx |  |
| parseAlignmentElement | jo | 12655 | XlsxDeepP.tsx |  |
| parseDxfElement | Mo | 12677 | XlsxDeepP.tsx |  |
| resolveXfStyle | No | 12686 | XlsxDeepP.tsx |  |
| parseStylesPart | Po | 12700 | XlsxDeepP.tsx |  |
| parseSqrefRanges | Fo | 12762 | XlsxDeepP.tsx |  |
| parseCfvo | Io | 12773 | XlsxDeepP.tsx |  |
| optionalBooleanAttr | Lo | 12781 | XlsxDeepP.tsx |  |
| parseConditionalRule | Ro | 12786 | XlsxDeepP.tsx |  |
| parseConditionalRuleExt | zo | 12834 | XlsxDeepP.tsx |  |
| mergeConditionalRules | Bo | 12894 | XlsxDeepP.tsx |  |
| parseConditionalFormatting | Vo | 12932 | XlsxDeepP.tsx |  |
| parseSheetLayout | Ho | 12967 | XlsxDeepP.tsx |  |
| clampColorChannel | Uo | 13057 | XlsxDeepP.tsx |  |
| normalizeArgbHex | Wo | 13060 | XlsxDeepP.tsx |  |
| hexToRgbObject | Go | 13068 | XlsxDeepP.tsx |  |
| rgbChannelsToHex | Ko | 13076 | XlsxDeepP.tsx |  |
| applyColorTransforms | qo | 13079 | XlsxDeepP.tsx |  |
| schemeColorFromTheme | Jo | 13112 | XlsxDeepP.tsx |  |
| drawingColorFromElement | Yo | 13117 | XlsxDeepP.tsx |  |
| drawingSolidFill | Xo | 13135 | XlsxDeepP.tsx |  |
| resolveSchemeTypefaceWb | Zo | 13140 | XlsxDeepP.tsx |  |
| isSchemeTypeface | Qo | 13148 | XlsxDeepP.tsx |  |
| runTypefaceFromElement | $o | 13151 | XlsxDeepP.tsx |  |
| textRunStyleFromElement | es | 13160 | XlsxDeepP.tsx |  |
| mergeRunStyles | ts | 13173 | XlsxDeepP.tsx |  |
| markerPointFromText | ns | 13189 | XlsxDeepP.tsx |  |
| anchorModelToXml | rs | 13200 | XlsxDeepP.tsx |  |
| normalizeDrawingAnchor | is | 13226 | XlsxDeepP.tsx |  |
| captionColorSpec | as | 13255 | XlsxDeepP.tsx |  |
| captionFontSpec | os | 13270 | XlsxDeepP.tsx |  |
| captionSpec | ss | 13286 | XlsxDeepP.tsx |  |
| resolveCaptionTextColor | cs | 13293 | XlsxDeepP.tsx |  |
| captionDisplayProps | ls | 13312 | XlsxDeepP.tsx |  |
| formControlDisplayProps | us | 13326 | XlsxDeepP.tsx |  |
| buildFormControlModel | ds | 13402 | XlsxDeepP.tsx |  |
| buildFormControlsBySheet | fs | 13422 | XlsxDeepP.tsx |  |
| normalizeLabelText | ps | 13432 | XlsxDeepP.tsx |  |
| legacyAnchorFromElement | ms | 13440 | XlsxDeepP.tsx |  |
| anchorEmuRect | hs | 13472 | XlsxDeepP.tsx |  |
| columnWidthPxAt | gs | 13484 | XlsxDeepP.tsx |  |
| rowHeightPxAt | _s | 13487 | XlsxDeepP.tsx |  |
| columnOffsetPx | vs | 13490 | XlsxDeepP.tsx |  |
| rowOffsetPx | ys | 13495 | XlsxDeepP.tsx |  |
| anchorRectPx | bs | 13500 | XlsxDeepP.tsx |  |
| rectToAbsoluteAnchor | xs | 13515 | XlsxDeepP.tsx |  |
| xfrmFromElement | Ss | 13518 | XlsxDeepP.tsx |  |
| applyChildTransform | Cs | 13534 | XlsxDeepP.tsx |  |
| resolveGroupChildTransform | ws | 13542 | XlsxDeepP.tsx |  |
| shapeTransformFromXfrm | Ts | 13578 | XlsxDeepP.tsx |  |
| textAlignFromDrawing | Es | 13601 | XlsxDeepP.tsx |  |
| verticalAlignFromDrawing | Ds | 13615 | XlsxDeepP.tsx |  |
| drawingAnchorElements | Os | 13625 | XlsxDeepP.tsx |  |
| bytesToObjectUrl | ks | 13636 | XlsxDeepP.tsx |  |
| isConnectorGeometry | As | 13645 | XlsxDeepP.tsx |  |
| drawingLineProps | js | 13648 | XlsxDeepP.tsx |  |
| drawingFillProps | Ms | 13665 | XlsxDeepP.tsx |  |
| pathPointAttr | Ns | 13672 | XlsxDeepP.tsx |  |
| customGeometryPath | Ps | 13678 | XlsxDeepP.tsx |  |
| geometryAdjustValues | Fs | 13709 | XlsxDeepP.tsx |  |
| drawingParagraphs | Is | 13724 | XlsxDeepP.tsx |  |
| drawingTextBoxProps | Ls | 13785 | XlsxDeepP.tsx |  |
| drawingHyperlinkTarget | Rs | 13799 | XlsxDeepP.tsx |  |
| drawingImageFromPic | zs | 13804 | XlsxDeepP.tsx |  |
| drawingShapeFromSp | Bs | 13831 | XlsxDeepP.tsx |  |
| collectDrawingShapes | Vs | 13863 | XlsxDeepP.tsx |  |
| parseDrawingPart | Hs | 13899 | XlsxDeepP.tsx |  |
| syncFormControls | Us | 13922 | XlsxDeepP.tsx |  |
| disposeImageAssets | Ws | 13925 | XlsxDeepP.tsx |  |
| parseWorkbookMetadata | Gs | 13928 | XlsxDeepP.tsx |  |
| parseWorkbookImageAssets | Ks | 13948 | XlsxDeepP.tsx |  |
| writeAnchorGeometryWb | qs | 14009 | XlsxDeepP.tsx |  |
| updateImageRect | Js | 14031 | XlsxDeepP.tsx |  |
| ensureRelsDocument | Ys | 14049 | XlsxDeepP.tsx |  |
| ensureContentTypesDocument | Xs | 14059 | XlsxDeepP.tsx |  |
| ensureContentTypeEntry | Zs | 14067 | XlsxDeepP.tsx |  |
| removeDrawingRefs | Qs | 14102 | XlsxDeepP.tsx |  |
| nextDrawingRelationId | $s | 14108 | XlsxDeepP.tsx |  |
| appendDrawingElement | ec | 14118 | XlsxDeepP.tsx |  |
| saveXlsxWithAssets | tc | 14130 | XlsxDeepP.tsx |  |
| emuToPx | nc | 14191 | XlsxDeepP.tsx |  |
| pxToEmu | rc | 14194 | XlsxDeepP.tsx |  |
| pxToColumnWidthUnits | ic | 14197 | XlsxDeepP.tsx |  |
| columnWidthToPx | ac | 14200 | XlsxDeepP.tsx |  |
| rowHeightToPx | oc | 14203 | XlsxDeepP.tsx |  |
| snapGridSize | sc | 14206 | XlsxDeepP.tsx |  |
| pxFromGridSize | cc | 14209 | XlsxDeepP.tsx |  |
| pixelToGridIndex | lc | 14212 | XlsxDeepP.tsx |  |
| rectToDrawingAnchor | uc | 14222 | XlsxDeepP.tsx |  |
| resizeRectWithHandle | dc | 14259 | XlsxDeepP.tsx |  |
| sheetReferenceRegex | fc | 14274 | XlsxDeepP.tsx |  |
| collectFormulaSheetRefs | pc | 14275 | XlsxDeepP.tsx |  |
| hasUnresolvedSheetRefs | mc | 14299 | XlsxDeepP.tsx |  |
| calculateWorkbookSafe | hc | 14311 | XlsxDeepP.tsx |  |
| ensureWorkbookCalculated | gc | 14331 | XlsxDeepP.tsx |  |
| cachedWasmModulePromise | _c | 14341 | XlsxDeepP.tsx |  |
| wasmSourceExplicitlySet | vc | 14342 | XlsxDeepP.tsx |  |
| rawWasmSource | yc | 14343 | XlsxDeepP.tsx |  |
| resolvedWasmSource | bc | 14344 | XlsxDeepP.tsx |  |
| copyToStandaloneBuffer | xc | 14345 | XlsxDeepP.tsx |  |
| normalizeWasmSource | Sc | 14350 | XlsxDeepP.tsx |  |
| setDukeSheetsWasmSource | Cc | 14357 | XlsxDeepP.tsx |  |
| isWasmSourceAvailable | wc | 14360 | XlsxDeepP.tsx |  |
| getDukeSheetsWasmSource | Tc | 14363 | XlsxDeepP.tsx |  |
| loadDukeSheetsWasmModule | Ec | 14366 | XlsxDeepP.tsx |  |
| createAbortError | Dc | 14382 | XlsxDeepP.tsx |  |
| XlsxWorkerClient | Oc | 14387 | XlsxDeepP.tsx |  |
| cloneArrayBuffer | kc | 14474 | XlsxDeepP.tsx |  |
| backslashCharCode | Ac | 14477 | XlsxDeepP.tsx |  |
| slashCharCode | jc | 14478 | XlsxDeepP.tsx |  |
| zipEndOfCentralDirSignature | Mc | 14479 | XlsxDeepP.tsx |  |
| zipCentralDirSignature | Nc | 14480 | XlsxDeepP.tsx |  |
| zipLocalHeaderSignature | Pc | 14481 | XlsxDeepP.tsx |  |
| zipEndOfCentralDirSize | Fc | 14482 | XlsxDeepP.tsx |  |
| zipCentralDirEntrySize | Ic | 14483 | XlsxDeepP.tsx |  |
| zipLocalHeaderSize | Lc | 14484 | XlsxDeepP.tsx |  |
| zipMaxCommentLength | Rc | 14485 | XlsxDeepP.tsx |  |
| zipMaxEntryCount | zc | 14486 | XlsxDeepP.tsx |  |
| zip64MagicValue | Bc | 14487 | XlsxDeepP.tsx |  |
| findEndOfCentralDir | Vc | 14488 | XlsxDeepP.tsx |  |
| readEndOfCentralDir | Hc | 14497 | XlsxDeepP.tsx |  |
| readCentralDirEntry | Uc | 14511 | XlsxDeepP.tsx |  |
| entryNameHasBackslash | Wc | 14529 | XlsxDeepP.tsx |  |
| hasBackslashEntries | Gc | 14533 | XlsxDeepP.tsx |  |
| zipEntryName | Kc | 14543 | XlsxDeepP.tsx |  |
| validateZipStructure | qc | 14551 | XlsxDeepP.tsx |  |
| sanitizeBackslashNames | Jc | 14586 | XlsxDeepP.tsx |  |
| sanitizeZipBytes | Yc | 14601 | XlsxDeepP.tsx |  |
| normalizeWorkbookBytes | Xc | 14608 | XlsxDeepP.tsx |  |
| saveDebounceMs | Zc | 14617 | XlsxDeepP.tsx |  |
| defaultRowHeight | Qc | 14618 | XlsxDeepP.tsx |  |
| defaultColumnWidth | $c | 14619 | XlsxDeepP.tsx |  |
| xlsxMimeType | el | 14620 | XlsxDeepP.tsx |  |
| csvMimeType | tl | 14621 | XlsxDeepP.tsx |  |
| minSheetRowHeightPx | nl | 14622 | XlsxDeepP.tsx |  |
| headerRowHeightPx | rl | 14623 | XlsxDeepP.tsx |  |
| rowHeaderWidthPx | il | 14624 | XlsxDeepP.tsx |  |
| undoEntryLimit | al | 14625 | XlsxDeepP.tsx |  |
| rangeClipboardMimeType | ol | 14626 | XlsxDeepP.tsx |  |
| deferLoadingDefault | sl | 14627 | XlsxDeepP.tsx |  |
| maxFileSizeDefault | cl | 14628 | XlsxDeepP.tsx |  |
| maxWorksheetXmlBytes | ll | 14629 | XlsxDeepP.tsx |  |
| maxSharedStringsBytes | ul | 14630 | XlsxDeepP.tsx |  |
| maxTotalWorksheetBytes | dl | 14631 | XlsxDeepP.tsx |  |
| defaultZoomPercent | fl | 14632 | XlsxDeepP.tsx |  |
| minZoomScale | pl | 14633 | XlsxDeepP.tsx |  |
| maxZoomScale | ml | 14634 | XlsxDeepP.tsx |  |
| zoomStepPercent | hl | 14635 | XlsxDeepP.tsx |  |
| defaultTabId | gl | 14636 | XlsxDeepP.tsx |  |
| normalizeVisibility | _l | 14637 | XlsxDeepP.tsx |  |
| clampZoomScale | vl | 14640 | XlsxDeepP.tsx |  |
| defaultZoomForSheet | yl | 14643 | XlsxDeepP.tsx |  |
| resolveZoomScale | bl | 14646 | XlsxDeepP.tsx |  |
| stepZoomScale | xl | 14654 | XlsxDeepP.tsx |  |
| formatByteSize | Sl | 14659 | XlsxDeepP.tsx |  |
| findEocdrOffset | Cl | 14667 | XlsxDeepP.tsx |  |
| readZipCentralDirectory | wl | 14674 | XlsxDeepP.tsx |  |
| checkSheetLimits | Tl | 14700 | XlsxDeepP.tsx |  |
| sheetLimitError | El | 14721 | XlsxDeepP.tsx |  |
| XlsxFileSizeLimitExceededError | Dl | 14726 | XlsxDeepP.tsx |  |
| deriveDisplayFileName | Ol | 14736 | XlsxDeepP.tsx |  |
| expandUsedRange | kl | 14748 | XlsxDeepP.tsx |  |
| buildSheetStates | Al | 14765 | XlsxDeepP.tsx |  |
| collectSheetOrigins | jl | 14903 | XlsxDeepP.tsx |  |
| defaultCellStyleAt | Ml | 14906 | XlsxDeepP.tsx |  |
| columnIndexToLetters | Nl | 14913 | XlsxDeepP.tsx |  |
| cellAddress | Pl | 14919 | XlsxDeepP.tsx |  |
| parseCellAddressString | Fl | 14922 | XlsxDeepP.tsx |  |
| parseRangeString | Il | 14930 | XlsxDeepP.tsx |  |
| resolveInputRange | Ll | 14936 | XlsxDeepP.tsx |  |
| hexToRgbArray | Rl | 14961 | XlsxDeepP.tsx |  |
| normalizeColorSpec | zl | 14967 | XlsxDeepP.tsx |  |
| normalizeFontSpec | Bl | 15004 | XlsxDeepP.tsx |  |
| normalizeCaptionSpec | Vl | 15019 | XlsxDeepP.tsx |  |
| formControlKindFromInput | Hl | 15028 | XlsxDeepP.tsx |  |
| formControlKindToSpec | Ul | 15061 | XlsxDeepP.tsx |  |
| normalizeDrawing | Wl | 15075 | XlsxDeepP.tsx |  |
| formControlDrawingSpec | Gl | 15092 | XlsxDeepP.tsx |  |
| syncGroupBoxes | Kl | 15105 | XlsxDeepP.tsx |  |
| formControlKindChanged | ql | 15120 | XlsxDeepP.tsx |  |
| normalizeFreezePanes | Jl | 15143 | XlsxDeepP.tsx |  |
| normalizeDataValidations | Yl | 15149 | XlsxDeepP.tsx |  |
| normalizeRange | Xl | 15179 | XlsxDeepP.tsx |  |
| rangeToRef | Zl | 15185 | XlsxDeepP.tsx |  |
| rangeContainsCell | Ql | 15191 | XlsxDeepP.tsx |  |
| worksheetTables | $l | 15195 | XlsxDeepP.tsx |  |
| nonNegativeIntParam | eu | 15231 | XlsxDeepP.tsx |  |
| booleanParam | tu | 15239 | XlsxDeepP.tsx |  |
| fileBaseName | nu | 15249 | XlsxDeepP.tsx |  |
| pxToRowHeightUnits | ru | 15254 | XlsxDeepP.tsx |  |
| colorHexOnly | iu | 15257 | XlsxDeepP.tsx |  |
| borderCss | au | 15262 | XlsxDeepP.tsx |  |
| normalizeDisplayValue | ou | 15266 | XlsxDeepP.tsx |  |
| copyBytes | su | 15276 | XlsxDeepP.tsx |  |
| workbookSavePayload | cu | 15280 | XlsxDeepP.tsx |  |
| pushUndoEntry | lu | 15297 | XlsxDeepP.tsx |  |
| cloneCellValue | uu | 15300 | XlsxDeepP.tsx |  |
| cloneCellStyle | du | 15303 | XlsxDeepP.tsx |  |
| parseCellValueInput | fu | 15315 | XlsxDeepP.tsx |  |
| applyCellMutation | pu | 15326 | XlsxDeepP.tsx |  |
| escapeHtml | mu | 15330 | XlsxDeepP.tsx |  |
| parseClipboardText | hu | 15338 | XlsxDeepP.tsx |  |
| createAbortErrorLocal | gu | 15353 | XlsxDeepP.tsx |  |
| isAbortError | _u | 15358 | XlsxDeepP.tsx |  |
| resolveWorkbookSource | vu | 15361 | XlsxDeepP.tsx |  |
| parseWorkbook | yu | 15381 | XlsxDeepP.tsx |  |
| scheduleIdleWork | bu | 15391 | XlsxDeepP.tsx |  |
| mimeTypeFromImageUrl | xu | 15411 | XlsxDeepP.tsx |  |
| imageFormatMimeType | Su | 15427 | XlsxDeepP.tsx |  |
| bytesToBlobUrl | Cu | 15440 | XlsxDeepP.tsx |  |
| worksheetImageModel | wu | 15453 | XlsxDeepP.tsx |  |
| worksheetImagesBySheet | Tu | 15480 | XlsxDeepP.tsx |  |
| anchorSignature | Eu | 15494 | XlsxDeepP.tsx |  |
| hiddenImageAnchorSignatures | Du | 15525 | XlsxDeepP.tsx |  |
| mergeImageAssets | Ou | 15534 | XlsxDeepP.tsx |  |
| isZipSignature | ku | 15579 | XlsxDeepP.tsx |  |
| isOleSignature | Au | 15582 | XlsxDeepP.tsx |  |
| shouldSkipXmlParsing | ju | 15595 | XlsxDeepP.tsx |  |
| emptyImageAssets | Mu | 15598 | XlsxDeepP.tsx |  |
| buildImageAssets | Nu | 15617 | XlsxDeepP.tsx |  |
| downloadFileSource | Pu | 15628 | XlsxDeepP.tsx |  |
| exportBlob | Fu | 15639 | XlsxDeepP.tsx |  |
| exportTextFile | Iu | 15652 | XlsxDeepP.tsx |  |
| downloadUrlFile | Lu | 15663 | XlsxDeepP.tsx |  |

## 64. B5 · XlsxDeepT.tsx（react-xlsx 深部尾段 T：页签条 + 预览面板入口）

- 族/来源：xlsx 族 · 源 chunk `out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行）· B5-12t。行号口径：chunk js 行。
- 符号条数：7（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| SpreadsheetViewer | sy | 199292 | XlsxDeepT.tsx |  |
| SpreadsheetWithOwnedController | cy | 199402 | XlsxDeepT.tsx |  |
| Spreadsheet | ly | 199406 | XlsxDeepT.tsx |  |
| resolveSheetTabTargetIndex | uy | 199415 | XlsxDeepT.tsx |  |
| SheetTabBar | dy | 199428 | XlsxDeepT.tsx |  |
| XlsxParseErrorState | fy | 199470 | XlsxDeepT.tsx |  |
| PreviewPaneOfficeXlsxContent | py | 199478 | XlsxDeepT.tsx | ·export |

## 65. B5 · OfficeWiring.tsx（office 装配接线 + DEFERRED_PRESET_GEOMETRY 登记）

- 族/来源：独立 chunk · 源 `out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js`（55,446 行；孪生 jsx 44,678 行）· B5-12b · B 段。行号口径：`js 行 / jsx 行` 双记（预设几何行为锚点行；头部 9 符号锚点为 pptxEngineGeometry.ts 源注记）。
- 符号条数：47（脚本抽取；头注映射表与文件尾符号总表合并去重）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| PRESET_GEOMETRY_PATHS | V |  | OfficeWiring.tsx | 预设几何注册表（pptxEngineGeometry.ts:181） |
| adjRatio | yi |  | OfficeWiring.tsx | 调整值归一（÷1e5，带回落）（pptxEngineGeometry.ts:30） |
| adjValue | bi |  | OfficeWiring.tsx | 调整值原值读取（带回落）（pptxEngineGeometry.ts:37） |
| mirrorPathHorizontally | Si |  | OfficeWiring.tsx | 路径水平镜像（pptxEngineGeometry.ts:105） |
| mirrorPathVertically | Ci |  | OfficeWiring.tsx | 路径垂直镜像（仅 Ei 引用；多区域余量，未转录） |
| splitOuterPath | wi |  | OfficeWiring.tsx | 外环/余环拆分（pptxEngineGeometry.ts:163；仅 Ti 引用） |
| circularArrowPairBuilder | Di | 11195 / 8238 | OfficeWiring.tsx | circularArrow/leftCircularArrow 共用生成器（本文件转录） [A] |
| 多区域包装：单预设 → 区域数组 | Ti | jsx 8099–8127 | OfficeWiring.tsx | ┐ 属 DEFERRED_MULTI_REGION_ANCHORS 未转录余量 |
| curvedUp/Down 多区域包装 | Ei | jsx 8128–8150 | OfficeWiring.tsx | ┘ 余量（1508–1524），本批不转录，仅记录 未转录余量 |
| downArrowCallout | — | 10504 / 7766 | OfficeWiring.tsx | [A] |
| rightArrowCallout | — | 10539 / 7788 | OfficeWiring.tsx | [A] |
| leftArrowCallout | — | 10572 / 7808 | OfficeWiring.tsx | [A] |
| upArrowCallout | — | 10605 / 7828 | OfficeWiring.tsx | [A] |
| upDownArrowCallout | — | 10638 / 7848 | OfficeWiring.tsx | [A] |
| leftRightArrowCallout | — | 10683 / 7868 | OfficeWiring.tsx | [A] |
| uturnArrow | — | 10728 / 7890 | OfficeWiring.tsx | [A] |
| leftUpArrow | — | 10800 / 7934 | OfficeWiring.tsx | [A] |
| bentArrow | — | 10924 / 7998 | OfficeWiring.tsx | [A] |
| bentUpArrow | — | 10955 / 8022 | OfficeWiring.tsx | [A] |
| curvedRightArrow | — | 10980 / 8036 | OfficeWiring.tsx | [A] |
| curvedLeftArrow | — | 11048 / 8088 | OfficeWiring.tsx | [A] |
| curvedUpArrow | — | 11081 / 8152 | OfficeWiring.tsx | [A] |
| curvedDownArrow | — | 11139 / 8196 | OfficeWiring.tsx | [A] |
| circularArrow | — | 11421 / 8238 | OfficeWiring.tsx | [A] |
| leftCircularArrow | — | 11422 / 8238 | OfficeWiring.tsx | [A] |
| leftRightCircularArrow | — | 11423 / 8446 | OfficeWiring.tsx | [A] |
| quadArrowCallout | — | 11513 / 8499 | OfficeWiring.tsx | [A] |
| leftRightUpArrow | — | 11578 / 8520 | OfficeWiring.tsx | [A] |
| swooshArrow | — | 11619 / 8540 | OfficeWiring.tsx | [A] |
| flowChartPunchedTape | — | 11778 / 8644 | OfficeWiring.tsx | [A] |
| flowChartMagneticTape | — | 11885 / 8692 | OfficeWiring.tsx | [A] |
| flowChartMultidocument | — | 11917 / 8722 | OfficeWiring.tsx | [A] |
| cloudCallout | — | 12039 / 8788 | OfficeWiring.tsx | [A] |
| sun | — | 12638 / 9200 | OfficeWiring.tsx | [A] |
| moon | — | 12696 / 9244 | OfficeWiring.tsx | [A] |
| lightningBolt | — | 12710 / 9256 | OfficeWiring.tsx | [A] |
| bracketPair | — | 12726 / 9290 | OfficeWiring.tsx | [A] |
| bracePair | — | 12741 / 9330 | OfficeWiring.tsx | [A] |
| leftBracket | — | 12762 / 9267 | OfficeWiring.tsx | [A] |
| rightBracket | — | 12780 / 9280 | OfficeWiring.tsx | [A] |
| leftBrace | — | 12799 / 9370 | OfficeWiring.tsx | [A] |
| rightBrace | — | 12832 / 9395 | OfficeWiring.tsx | [A] |
| actionButtonBlank | — | 12863 / 9410 | OfficeWiring.tsx | [A] |
| wave | — | 12948 / 9423 | OfficeWiring.tsx | [A] |
| doubleWave | — | 12977 / 9450 | OfficeWiring.tsx | [A] |
| irregularSeal1 | — | 13016 / 9460 | OfficeWiring.tsx | [A] |
| irregularSeal2 | — | 13047 / 9479 | OfficeWiring.tsx | [A] |

## 66. B5 · RemoteDirectorySuggestInput.tsx（F10 远程族建议输入 W2 + cmdk 建议弹层）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，现行 213,979 行）· B5-15。行号口径：当前 js 行（台账 213,695 口径 ＝ 当前 − 17；头注同时给出 jsx 孪生行）。
- 符号条数：14（脚本抽取；3 本体符号 + 11 依赖 declare/import 登记）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| containerContainsTarget | NEt | 124144–124146 | RemoteDirectorySuggestInput.tsx | onInteractOutside 目标 containment 判定透传；jsx 105812；把握度高 |
| suggestionMatchesQuery | PEt | 124147–124151 | RemoteDirectorySuggestInput.tsx | 建议项 trim+toLowerCase includes 查询；jsx 105817；把握度高 |
| SuggestionInput | W2 | 124152–124259 | RemoteDirectorySuggestInput.tsx | Popover(anchor)+cmdk 建议输入组件；jsx 105822；把握度高；仅 REt 消费 4 处 |
| ReactInterop | Q | 996 | RemoteDirectorySuggestInput.tsx | 依赖 declare；chunk 996 `var Q = r(F(), 1)` |
| jsxRuntime | $ | 1287 | RemoteDirectorySuggestInput.tsx | 依赖 declare；chunk 1287 `var $ = Ke()` |
| cn | Z | import 901 | RemoteDirectorySuggestInput.tsx | 依赖 declare；utils-CEEH0K_K.js 导出 t；重建实体 UtilsCn.tsx |
| Popover | T | import 358 | RemoteDirectorySuggestInput.tsx | 依赖 declare；imeComposition 导出 n；根封装 pr |
| PopoverAnchor | O | import 361 | RemoteDirectorySuggestInput.tsx | 依赖 declare；imeComposition 导出 r；封装 gr |
| Input | P | import 367 | RemoteDirectorySuggestInput.tsx | 依赖 declare；imeComposition 导出 y；forwardRef Dn |
| PopoverContent | x | import 354 | RemoteDirectorySuggestInput.tsx | 依赖 declare；imeComposition 导出 i；封装 hr |
| Command | Yb | 32140 | RemoteDirectorySuggestInput.tsx | 依赖 declare；cmdk 封装 |
| CommandList | Zb | 32196 | RemoteDirectorySuggestInput.tsx | 依赖 declare |
| CommandEmpty | Qb | 32206 | RemoteDirectorySuggestInput.tsx | 依赖 declare |
| CommandItem | ex | 32223 | RemoteDirectorySuggestInput.tsx | 依赖 declare |

## 67. B5 · LazyPreviewViewers.ts（PDF/PPTX 预览懒加载分包包装 lVt/dVt）

- 族/来源：styles 族 · 源 chunk `out/renderer/assets/styles-CdEGpc2x.js`（融合 chunk，现行 213,979 行）· B5-15b。行号口径：当前 js 行（头注同时给出 jsx 孪生行）。
- 符号条数：5（脚本抽取；2 本体符号 + 3 依赖 declare/注记）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| LazyPdfViewer | lVt | 160672–160678 | LazyPreviewViewers.ts | React.lazy 分包包装；jsx 132852；把握度高；消费方 uVt（CodeViewer.tsx） |
| LazyPptxPreviewViewer | dVt | 160688–160695 | LazyPreviewViewers.ts | React.lazy 分包包装；jsx 132865；把握度高；消费方 fVt（CodeViewer.tsx） |
| ReactInterop | Q | 996 | LazyPreviewViewers.ts | 依赖 declare；chunk 996 |
| preloadModuleWrapper | Y | import 856 | LazyPreviewViewers.ts | 依赖 declare；preload-helper-BHSF1fZ9.js 导出 t；三参 (loader, deps, url) 包装 |
| __vite__mapDeps | — | 1 | LazyPreviewViewers.ts | 依赖注记；vite 运行时依赖索引表；chunk 1 |

## 68. B5 · PptxGeometryDeferredPresets.ts（DEFERRED 单区域复杂预设注册 + circularArrowPath）

- 族/来源：独立 chunk · 源 `out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js`（55,446 行；孪生 jsx 44,678 行）· B5-17。行号口径：jsx 孪生行（预设条目行号取各 `V.set` 注册实际行；无混淆名，按预设名登记）。
- 符号条数：43（脚本抽取；1 导出函数 + 38 预设注册 + 4 导入）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| circularArrowPath | Di | 8237–8443 | PptxGeometryDeferredPresets.ts | 本文件顶层导出；circularArrow/leftCircularArrow/leftRightCircularArrow 共用生成器 |
| downArrowCallout | — | 7768 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| rightArrowCallout | — | 7789 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftArrowCallout | — | 7808 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| upArrowCallout | — | 7827 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| upDownArrowCallout | — | 7846 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftRightArrowCallout | — | 7870 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| uturnArrow | — | 7894 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftUpArrow | — | 7935 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| bentArrow | — | 7998 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| bentUpArrow | — | 8022 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| curvedRightArrow | — | 8035 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| curvedLeftArrow | — | 8088 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| curvedUpArrow | — | 8151 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| curvedDownArrow | — | 8195 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| circularArrow | — | 8444 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftCircularArrow | — | 8444 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftRightCircularArrow | — | 8444 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| quadArrowCallout | — | 8495 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftRightUpArrow | — | 8525 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| swooshArrow | — | 8546 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| flowChartPunchedTape | — | 8641 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| flowChartMagneticTape | — | 8694 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| flowChartMultidocument | — | 8725 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| cloudCallout | — | 8787 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| sun | — | 9200 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| moon | — | 9244 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| lightningBolt | — | 9257 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| bracketPair | — | 9257 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| bracePair | — | 9262 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftBracket | — | 9267 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| rightBracket | — | 9288 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| leftBrace | — | 9310 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| rightBrace | — | 9342 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| actionButtonBlank | — | 9372 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| wave | — | 9423 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| doubleWave | — | 9445 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| irregularSeal1 | — | 9475 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| irregularSeal2 | — | 9479 | PptxGeometryDeferredPresets.ts | PRESET_GEOMETRY_PATHS 注册（原 V.set）；DEFERRED 单区域复杂预设 |
| PRESET_GEOMETRY_PATHS | V | 7459 | PptxGeometryDeferredPresets.ts | import（pptxEngineGeometry 导出） |
| adjRatio | yi | 7373 | PptxGeometryDeferredPresets.ts | import（pptxEngineGeometry 导出） |
| adjValue | bi | 7376 | PptxGeometryDeferredPresets.ts | import（pptxEngineGeometry 导出） |
| mirrorPathHorizontally | Si | 7399 | PptxGeometryDeferredPresets.ts | import（pptxEngineGeometry 导出） |

## 69. B5 · PptxGeometryMultiRegion.ts（MULTI_REGION_SHAPES 多区域预设注册 + actionButton 字形/度量）

- 族/来源：独立 chunk · 源 `out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js`（55,446 行；孪生 jsx 44,678 行）· B5-16。行号口径：jsx 孪生行（预设条目行号取各 `ji.set`/`ki.set` 注册实际行；无混淆名，按预设名登记）。
- 符号条数：56（脚本抽取；11 具名符号 + 7 字形注册 + 38 预设注册）

| 语义名 | 混淆名 | 行号 | 所在文件 | 备注 |
|---|---|---|---|---|
| curvedRightArrowBuilder | V | 8035–8087 | PptxGeometryMultiRegion.ts | 原 V.set；弯箭头构建器（逐字） |
| curvedLeftArrowBuilder | V | 8088 | PptxGeometryMultiRegion.ts | 原 V.set；弯箭头构建器（逐字） |
| curvedUpArrowBuilder | V | 8151–8194 | PptxGeometryMultiRegion.ts | 原 V.set；弯箭头构建器（逐字） |
| curvedDownArrowBuilder | V | 8195–8236 | PptxGeometryMultiRegion.ts | 原 V.set；弯箭头构建器（逐字） |
| wrapSplitPresetRegions | Ti | 8099–8125 | PptxGeometryMultiRegion.ts | 单预设→区域数组包装（弯箭头特判）；逐字 |
| wrapVerticalArrowRegions | Ei | 8127–8150 | PptxGeometryMultiRegion.ts | 弯上/下箭头垂直镜像包装；逐字 |
| ACTION_BUTTON_GLYPH_PATHS | ki | 9373–9417 | PptxGeometryMultiRegion.ts | actionButton 字形路径 Map（7 条）；逐字 |
| actionButtonForwardNext | — | 9374 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonBackPrevious | — | 9379 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonReturn | — | 9384 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonBeginning | — | 9395 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonEnd | — | 9400 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonInformation | — | 9405 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonDocument | — | 9410 | PptxGeometryMultiRegion.ts | ACTION_BUTTON_GLYPH_PATHS 注册（原 ki.set）；字形路径 |
| actionButtonGlyphPath | Ai | 9419–9422 | PptxGeometryMultiRegion.ts | actionButton 字形查询；逐字 |
| actionButtonMetrics | Mi | 9610–9624 | PptxGeometryMultiRegion.ts | actionButton 公共度量；逐字；既有副本 1441 未导出 |
| actionButtonOuterRect | Ni | 9626 | PptxGeometryMultiRegion.ts | actionButton 外框矩形路径；逐字；既有副本 1451 未导出 |
| actionButtonBeginning | — | 9683 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonEnd | — | 9713 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonReturn | — | 9744 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonSound | — | 9786 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonInformation | — | 9827 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonHome | — | 9877 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonHelp | — | 9934 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonDocument | — | 10000 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| actionButtonMovie | — | 10037 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| bevel | — | 10132 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| leftRightRibbon | — | 10161 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| ellipseRibbon | — | 10222 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| ellipseRibbon2 | — | 10276 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| smileyFace | — | 10334 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| can | — | 10393 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| curvedrightarrow | — | 10435 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| curvedleftarrow | — | 10435 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| curveduparrow | — | 10435 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| curveddownarrow | — | 10435 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| bordercallout1 | — | 10435 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentcallout1 | — | 10449 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentcallout2 | — | 10467 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentcallout3 | — | 10487 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| callout1 | — | 10509 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| callout2 | — | 10523 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| callout3 | — | 10539 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| bordercallout2 | — | 10557 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| bordercallout3 | — | 10573 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentbordercallout1 | — | 10591 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentbordercallout2 | — | 10609 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| accentbordercallout3 | — | 10629 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| chartx | — | 10651 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| chartplus | — | 10659 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| chartstar | — | 10671 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| ribbon | — | 10696 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| ribbon2 | — | 10742 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| horizontalscroll | — | 10789 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| verticalscroll | — | 10823 | PptxGeometryMultiRegion.ts | MULTI_REGION_SHAPES 注册（原 ji.set）；多区域预设 |
| resolveMultiRegionPreset | Pi | 10857–10861 | PptxGeometryMultiRegion.ts | 多区域查询（小写→原名回退）；逐字 |

## 附录 A · 全族共享依赖速查

所有 styles 族共用的跨 chunk 依赖（MODULE-MAP §3 导入块 js 336–966）：

| 提供模块 | 关键符号 |
|---|---|
| react-BQLj9xdT.js / jsx-runtime-B5yMD3-t.js / react-dom-BlRPXJso.js | React（Q）/ jsx（$）/ ReactDOM（io） |
| UtilsCn.tsx（utils-CEEH0K_K.js） | `Z`=cn |
| button.tsx（button-laUijeDG.js） | `X`=Button、`Sa`=createLucideIcon、`wa/Ea/xa/Kre`=chevron/zoom 图标 |
| **I18n.tsx**（IntlProvider-C321H7m8.js，canonical） | `G`=useZCodeIntl、`He/We`=localStorage 读写、`Be`=getWritableStorage、`Ve/Ue`=词典 |
| ImeComposition.tsx（imeComposition-DEYFkwWm.js） | `l`=usePlatformService、`m`=toast、`P`=Input、`j`=Textarea、`A`=PlatformProvider、`t`=isComposingText、`M`=spinner、Popover 四件 |
| logger.tsx（logger-PFDwl5Yq.js） | `J`=logger |
| usageStatsUiParts-CiR7YEhh.js（外部） | `Ia`=Tooltip、`Na/Oa/Ma/ka`=Popover 四件、用量助手 |
| keyboardShortcuts-BGHopxr9.js（外部） | `$i`=shortcutLabel、`ta/Qi/Rre`=键匹配器、`Vre`=Ctrl+Alt 标签 |
| skillStore-BmeKHDBI.js（外部） | `Ae`=zustand create、`xe`=useTaskStore、`Ne`=useSkillsStore、`Oe`=白板 store、40+ 选择器 |
| src-HCld2afU.js（外部） | ~400 符号：testid 常量、`oi`=DesktopCommand、`hi`=环境常量、`K`=zod、`Ps`='zh-CN' |
| esm-BY6T6pIH.js（外部） | `to`=useVirtualizer（@tanstack/react-virtual 3.13.23） |
| dist-DJJArJ7D.js / dist-vnZIbudW.js（外部） | popper / Slot / composeRefs |
| styles 本 chunk 横切层 | cmdk（26004–26574）、图标块 184 个（26575–28020）、Radix/shadcn 封装（28021–32245）、Tabs（36949）、Dialog（31943）、Select（46009）、DropdownMenu（47926）、ContextMenu（43966/48825）、Collapsible（82939）、Badge（70704/80303）、ScrollArea（136026）、PanelGroup（131934）、dnd-kit（91811–94695，vendored）、shiki（10880–17444 + 100520–104621，vendored）、diff 引擎（17445–23919，vendored）、xterm（162010–175264，vendored）、Lexical（57652–63592，vendored）、framer-motion（69298–75526，vendored）、qrcode（78408–79978，vendored） |

## 附录 B · 同名冲突裁决表（D9）

**原则**：混淆名是 chunk 局部的；跨 chunk 同名不是冲突。同一 chunk 内同一混淆名出现多个语义名时，
以 MODULE-MAP 族归属 + 「全量抽取文件优先于接口引用文件」裁决。

### B.1 同 chunk 命名变体（已裁决）

| 混淆名 | chunk | 裁决（canonical） | 别名/变体 | 依据 |
|---|---|---|---|---|
| `U8` | styles | **MarkdownPreviewView**（CodeViewer.tsx，F14 属族全量抽取） | MemoryFilePreview（SettingsPanelsData.tsx 按用途命名） | 同一组件（js 160323，cj 包装）；两报告行号一致 |
| `Iqt` | styles | **useCollapsiblePanel**（WorkspaceShell.tsx 全量 183714–183777） | useDockPanelController（TerminalPane.tsx 按 dock 调用面） | 同一钩子两处调用（dock + 侧面板） |
| `Mqt` | styles | **TerminalDock**（TerminalPane.tsx 全量 183602–183694） | DockTerminalBrowserPanel（MODULE-MAP/WorkspaceShell 旧称） | F13 属族全量抽取 |
| `E6` | styles | **PinnedTaskListStore / usePinnedTaskListStore**（stores-tasks.tsx + TopBar.tsx） | useRemotePinnedTaskListStore（Sidebar.tsx 语境名） | store 属横切层；"Remote" 仅描述数据来源 |
| `Tit`/`Eit`/`Dit` | styles | **isCodingPlanConnectionSelected / isQuota3103Error / resolveOffPeakErrorI18nId**（Home.tsx 全量） | "coding-plan 判定"（ExtendedViews.tsx 组注） | Home 族逐字抽取 |
| `BNt`/`VNt`/`HNt`/`KNt`/`JNt`/`UNt` | styles | **resolveVisibleTabs / resolveEffectiveTab / resolveTemplateVisibility / isToggleableAutomation / createErrorMessageId / AUTOMATION_STATUS_STYLES**（SettingsPanelsCapability.tsx 全量） | ExtendedViews.tsx 组描述 | 分区属族全量抽取 |
| `G0t`/`H1t`/`I0t`/`V2t`/`p1t` | styles | **Commands/Subagents/Plugins/Migration/UsageSettingsSection**（SettingsPanelsCapability/Data.tsx） | Settings.tsx 短名（Commands/Plugins/…） | 分区全量抽取文件优先 |
| `Av`/`Iv`/`Nv`/`Mv`/`Pv`/`Fv` | chunk-BO2N2NFS | **CodeBlockContainer / CodeBlock / CodeBlockHeader / useCodeBlockContext / trimTrailingNewlines / LazyHighlightedBody**（MarkdownCodeBlock.tsx，对齐上游 streamdown 导出名） | CodeBlockShell / HighlightedCodeBlock / …（HighlightedCodeBlock.tsx） | 上游 streamdown@2.5.0 导出表为准（Markdown.report §2.2） |
| `Dv`/`Sv`/`Ev` | chunk-BO2N2NFS | **STREAMDOWN_LINE_NUMBER_CLASS / streamdownCn / ClassNamesContext**（MarkdownContext.tsx） | LINE_NUMBER_CLASS / cn（HighlightedCodeBlock.tsx 短名） | 同上 |
| `J3` | styles | **useScopedWorkspaceTabs**（Sidebar.tsx） | "远程标签判定"（ExtendedViews.tsx 组注） | 侧栏族登记 + 调用面 |
| `TRt` | styles | **resolveInteractionBadgeModel**（与 `wRt`=isSnoozableUserInputInteraction 为 zip 对） | — | Sidebar.report §1.1 行 150788/150793 顺序 |
| `UBt` | styles | **expandToggleMessageId**（与 `WBt`=resolveExpandToggleState 为 zip 对） | — | 同上（158970/158967） |
| `FH` | styles | **CodeCommentsStore**（stores-workspace.tsx 本体） | useCodeCommentsStore（钩子形态，CodeViewer/GitReview） | 同实体两形态，非冲突 |
| `YLt…nRt`（js 149473–149599） | styles | **WebRemote.tsx**（B5-05 全量；rRt 唯一消费族） | Bots.tsx 尾段重复转录（整合期删除或改 import） | B5-MERGE-NOTES §2（双方互让消费面优先） |
| `Mq` ConfigSelect 整闭包（js 76848–77167） | styles | **Composer.tsx**（B5-01 先收且含 mode.* 消费链） | PaymentDeep.tsx Mq@76912 锚点版（整合期改 import） | B5-MERGE-NOTES §2 |
| `U3e/W3e/G3e`（js 77062–77126）+ 76034–76156 popover 原语 | styles | **Composer.tsx**（U3e@77062 锚点） | PaymentDeep.tsx declare-only（声明改 import） | B5-MERGE-NOTES §2 |

### B.2 跨 chunk 同名（非冲突，仅登记高频项）

| 混淆名 | 各 chunk 语义 |
|---|---|
| `Oc` | styles=useWorkspaceServices（services.tsx）；xlsx chunk=XlsxWorkerClient；pptx chunk=renderGroupNode |
| `Ec` | styles=useBaseServices；xlsx chunk=loadDukeSheetsWasmModule |
| `Dc` | styles=useResolvedWorkspaceServices；xlsx chunk=createAbortError |
| `Sc`/`Tc` | styles=远端断开错误/解析助手；xlsx chunk=normalizeWasmSource/getDukeSheetsWasmSource |
| `Us` | styles=ServiceProxy；pptx chunk=图片像素滤镜 |
| `Io`/`Lo`/`Mo`/`No`/`Po`/`Fo`/`Go`/`Uo` | styles（Sidebar 横切：workspaceKey/taskEntityKey/…）；pdf-viewer chunk=缩放引擎纯函数族 |
| `At`/`Dt`/`Et`/`Ot`/`St`/`Ct` | docx chunk=包装层五件；pptxEngineColor=颜色变换；codingPlan chunk=数据组装 |
| `Qb` | chunk-BO2N2NFS=Streamdown；styles=CommandEmpty（cmdk 封装） |
| `$b` | chunk-BO2N2NFS=ZoomableContent；styles=CommandGroup |
| `Kb`/`Hb`/`Ub`/`Gb` | styles=Dialog 原语族；chunk-BO2N2NFS=streamdown 内部符号 |
| `Gt`/`Ht`/`Kt`/`Ut` | imeComposition=图标（Sparkles/Info/TriangleAlert/LoaderCircle）；柱状图 chunk=数据助手 |
| `Dl` | diffs.worker=buildThemeStyles；xlsx chunk=XlsxFileSizeLimitExceededError |

## 附录 C · 生成与校验记录

- 抽取脚本：`/tmp/d9/extract_symbols.py`（头映射表 + 尾 SYMBOLS 表，双格式解析）；原始 TSV：`/tmp/d9/symbols-raw.tsv`（2,490 条，含 10 条 legacy-doc 手工补录）。
- 抽样校验：12% 随机样本（297 条）「混淆名 + 语义名存在性」复核 **0 失败**。
- 行号回代：16 个锚点（rVt/R0/xqt/j9/yJt/Rje/hit/BWt/BOt/d6/ust/tHt/Ug/Mqt/E/D）回代 `styles-CdEGpc2x.js` 与 `IntlProvider-C321H7m8.js`，**16/16 逐字命中** `function X(` / `var X = memo(` / `var X = Ae(`。
- 冲突检测：脚本枚举同名 165 项，其中跨 chunk 命名空间项不构成冲突；同 chunk 13 项已裁决（附录 B.1）。
- i18n 去重：canonical = **I18n.tsx**（理由：D8 Stage B2 标样、词典逐字节 diff=0、77 前缀对照表、I18n.report §7 已声明规范产物）；intlProvider.tsx 文件头已加 `// DUPLICATE-OF: I18n.tsx`。
- 本文件为**只读聚合**：除 i18n 去重注释外未改动任何既有 .tsx 内容；`out/` 未触碰。

**B4 批次增量（2026-08-26）**：

- 抽取：同一脚本 `/tmp/d9/extract_symbols.py` 重跑（头映射表 + 尾符号表双格式解析），原始 TSV 更新为 3,837 条；B4 16 文件共 1,357 条原始行，经 (文件, 混淆名) 合并去重后 **1,303 条**入 §25–§32。
- 抽样校验：B4 条目 10.1% 随机样本（131 条，seed=20260826）「混淆名 + 语义名存在性」复核 **0 失败**。
- 行号回代：21 个锚点——styles 族 17 个（VFt 144427 / uzt 153205 / ABt 157550 / mLt 147286 / Gft 104844 / Spt 105825 / ASt 117919 / u7 188376 / q$t 195179 / s3e 76246 / n9 196839 / m0t 198880 / kNt 137005 / El 6062 / gut 100459 / C4t 206094 / bw 40397）回代 `styles-CdEGpc2x.js`，legacy-doc 4 个（Xs 14902 / Kl 15114 / tS 24338 / ES 27340）回代 `previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`——**21/21 当行逐字命中**（`function X(` / `var X = class` / `var X = forwardRef(` / 模板串常量）。
- 冲突/边界：B4 五批互裁记录见 COVERAGE-LEDGER §f.3（q$t/J$t 让位 UsageDeep.tsx 唯一规范；R7/I2t/v$t/W8 不重复抽取；El/gut/Bc 族归属 F14；并行批零行号交集）。
- §21 内 previewPaneOfficeLegacyDocContent.tsx 公共层 10 条手工登记保留不变；批次 A/B 引擎条目分列 §31/§32，不与公共层重复计。
- 规模变化：2,394 → **3,697** 条；重建文件 63 → **79** 个。`out/` 全程只读（批后复验 md5 `c9d0d675d0b858e6e7711df3e9122e81`、213,695 行不变；legacy-doc chunk 47,538 行不变）。

**B5 批次增量（2026-08-29）**：

- 抽取：`/tmp/b5idx/extract.py`（头注映射表 + 文件尾符号总表，12+ 种体例逐文件适配解析；节区切分 `/tmp/b5idx/sections.json`），32 文件共抽取 **4,866 条**入 §34–§65（头表与尾表合并、按混淆名去重）。
- 每文件条数：Composer 377 / OnboardingLoginLeaves 139 / AppRootLeaves 23 / FeedbackCenter 109 / PaymentDeep 482 / Bots 42 / WebRemote 39 / RemoteWizard 12 / PreviewCards 65 / FileTreePanel 78 / FileRewindDialogDeep 25 / QuickPickDeep 108 / CmdkPaletteDeep 55 / McpHelpers 32 / LegacyDocEngineC1 172 / C2 206 / C3 175 / C4 36 / C5 17 / DocxWasmGlue 40 / RemoteGapSegments 26 / SrcSharedA 567 / SrcSharedB 769 / SkillStore 211 / UsageStatsUiParts 95 / ProcessMonitor 20 / XlsxDeepA 154 / XlsxDeepB 1 / XlsxDeepC 297 / XlsxDeepP 440 / XlsxDeepT 7 / OfficeWiring 47。
- 存在性抽查：每文件抽 3 条（首/中/尾；XlsxDeepB 仅 1 条），对产物原文做「混淆名 + 语义名同行共现」grep 复核——32 文件 94 条抽查 **0 失败**（93 条共现命中；1 条匿名条目 RemoteWizard `LEt` 无语义名，按混淆名命中）。
- 行号口径：B5 起 styles 族以当前 out 213,979 行为「当前 js」口径（台账 213,695 口径 = 当前−分段偏移，见 B5-MERGE-NOTES §1）；Composer（B5-01）头注按台账 213,695 行本声明，为 B5 中唯一台账口径节。
- 补记（同日续作 4 件）：`/tmp/b5idx/extract2.py`（同管线）抽取 RemoteDirectorySuggestInput（B5-15）/ LazyPreviewViewers（B5-15b）/ PptxGeometryDeferredPresets（B5-17）/ PptxGeometryMultiRegion（B5-16）共 **118 条**入 §66–§69；每文件条数：RemoteDirectorySuggestInput 14 / LazyPreviewViewers 5 / PptxGeometryDeferredPresets 43 / PptxGeometryMultiRegion 56。行号口径：前两件为 styles 当前 js 行（头注同给 jsx 孪生行），后两件为 `pptxRendererPreviewEngine-BIIRLBue.jsx` 孪生行（预设条目取各 `V.set`/`ji.set`/`ki.set` 注册实际行，无混淆名按预设名登记）。存在性抽查：每文件 ≥2 条对产物原文与 jsx 孪生行号复核，0 失败。
- 规模变化：3,697 → **8,681** 条；重建文件 79 → **115** 个。产物/台账/报告零改动（仅本文件回写）。
