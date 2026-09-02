/* eslint-disable */
/**
 * ============================================================================
 * TopBar.tsx — ZCode 3.7.6 顶栏 + 会话头 组件族（解混淆重建 · pilot）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  组件族主体：
 *   BOt  → TopBarOverlay              顶栏浮层 (129516 / 108974)
 *   o4   → TopBarIconButton          顶栏通用图标按钮+tooltip (129479 / 108952)
 *   LOt  → UpdateIndicator           更新指示器（下载中/可更新/已下载胶囊）(129385 / 108869)
 *   IOt  → updatePillResponsiveClasses 更新胶囊按平台展开的容器查询类 (129354 / 108851)
 *   FOt  → ReleaseNotesPopover       发行说明弹层 (129296 / 108831)
 *   POt  → UpdateStatusDialogController 更新对话框控制器（下载/跳过/重启安装）(129142 / 108678)
 *   COt  → UpdateStatusDialog        更新对话框呈现层（属主 Modals.tsx，本文件真实 import 调用）(128812 / 108390)
 *   DOt  → resolveUpdateViewModel    更新状态 → 视图模型 (129083 / 108630)
 *   TOt  → pickLocalizedReleaseNotes (129064 / 108612)
 *   EOt  → formatReleaseDate         (129071 / 108620)
 *   kOt  → downloadProgressLabel     (129113 / 108657)
 *   NOt  → formatMegabytes           (129139 / 108680)
 *   c4   → windowsCaptionInsetStyle  env(titlebar-area-*) 计算右侧原生控件宽度 (129509 / 108967)
 *   s4   → WINDOWS_CAPTION_RIGHT_INSET_VAR (129507 / 108965)
 *   zOt  → WINDOWS_CAPTION_BUTTON_CLASS   (129515 / 108973)
 *   S6   → WindowsCaptionMenu        Win/Linux 标题栏 ⌄ 应用菜单 (141854 / 117848)
 *   U6   → HelpMenu                  帮助菜单（反馈/建议/社群/文档/导出日志）(143345 / 119420)
 *   H6   → TerminalToggleButton      终端开关（Ctrl+J，激活 !bg-selected）(143316 / 119406)
 *   TFt  → SessionHeader             会话头（h-12 border-b）(144008 / 119938)
 *   wFt  → SessionHeaderLeft         会话头左簇（标题/路径pill/分支/更多）(143485 / 119493)
 *   SFt  → SessionHeaderRight        会话头右簇（编辑器/帮助/终端/侧面板）(143418 / 119457)
 *   xFt  → OpenInEditorButtonGroup   在 IDE 中打开（主按钮+⌄选择编辑器）(143194 / 119336)
 *   j6   → TaskRenameDialog          任务重命名对话框（IME 保护）(142581 / 118551)
 *   oFt  → TaskActionMenuItems       任务操作菜单项（置顶/重命名/归档/未读/复制路径…）(142183 / 118106)
 *   zZ   → GitBranchChip             git 分支切换 chip（含分支搜索/新建/提交切换）(96589 / 84085)
 *   n4   → RemoteSyncMenuItems       远程同步菜单项（技能/MCP/插件）(127166 / 107575)
 *   r4   → RemoteSyncDialogs         远程同步对话框组（本文件仅保留接口）(127265 / 107623)
 *   Flt  → ConversationSummaryAside  会话右摘要栏（mini/panel/auto 三态）(99217 / 85723)
 *   VO/HO/UO/WO/GO/KO/qO/JO/YO/XO
 *        → DropdownMenu* 原语族      (47926-48040 / 43144-43290)
 *
 *  辅助钩子 / 服务 / store（同 chunk 内）：
 *   ZPt  → useHelpActions            (141806 / 117792)
 *   $Pt  → isAutoUpdateChannelSupported（env==='production'）(141826 / 117816)
 *   eFt/tFt → updateMenuItemI18nId / updateMenuItemI18nValues (141829,141843 / 117819,117833)
 *   QPt  → CAPTION_MENU_ALIGN_OFFSET = -12 (141825 / 117815)
 *   YPt  → captureFeedbackScreenshots (141785 / 117765)
 *   XPt  → exportLogsWithToast       (141789 / 117769)
 *   lw   → PRODUCT_DOCS_URL = https://zcode.z.ai/docs (39410 / 35469)
 *   C6   → useTaskFileActions        (142068 / 118006)
 *   CFt/$2 → canOpenRemoteSessionSource (143499,127142 / 119494,107556)
 *   ZTt  → remoteTargetLabel         (123256 / 104935)
 *   QTt  → sshDecoratedProjectName   (123268 / 104947)
 *   Zge  → resolveEffectiveProvider  (jsx 21359)
 *   U2   → useConfirmDialog          (123510 / 105222)
 *   Oc   → useWorkspaceServices      (4945 / 3754)
 *   Ec   → useBaseServices           (4897 / 3716)
 *   ZS   → useTaskListItems          (35727 / 32810)
 *   Uo   → applyOptimisticTaskMutation (1895 / 959)
 *   w6   → buildTaskFeedbackDescription (142334 / 118239)
 *   pct  → useGitBranchSwitcher      (96362 / 83842)
 *   MZ   → resolveBranchDisplayLabel (94967 / 82976)
 *   Uct  → resolveSummaryPanelVariant (98064 / 84991)
 *   tlt  → buildSummaryPanelModel    (98181 / 85113)
 *   slt/clt → EMPTY_BACKGROUND_WORKS / EMPTY_SUBAGENTS (98272 / 85193)
 *   mlt/hlt/Clt/Tlt/klt/Alt/Plt
 *        → SummaryGitSection / SummaryGoalSection / SummaryPlansSection /
 *          SummaryPlanSection / SummaryTerminalsSection / SummaryAgentsSection /
 *          SummaryMiniCard (98402,98501,98775,98826,98919,98981,99157 / 85281…85678)
 *   yC   → useFeedbackStore          (36992 / 33835)
 *   E6   → usePinnedTaskListStore    (142372 / 118266)
 *   k6   → useWorkspaceTaskListStore (142464 / 118392)
 *   Ug   → useMcpStore               (jsx 21655)
 *   ls   → useTrajectoryViewerStore  (jsx 1697)
 *   xe   → useTaskStore（skillStore chunk 的 h 导出）
 *
 *  图标（lucide 风格，Sa=createLucideIcon 工厂，js 行 / jsx 行）：
 *   S_ arrow-left 26634 | C_ arrow-right 26649 | hv message-circle-plus 27379
 *   Tv panel-left-close 27535 | Ev panel-left-open 27540
 *   ibe panel-right-close 27545 | abe panel-right-open 27550
 *   Uv square-terminal 27818 | vye circle-question-mark 26859 | N_ chevron-down 26802
 *   K_ ellipsis 26950 | U_ cloud 26918 | $_ folder 27133 | ev git-branch 27142
 *   Zve arrow-down-to-line 26620 | fv loader 27315 | M_ check 26801
 *   vv message-square 27411 | Uye lightbulb 27270 | Jv users 27950
 *   oye book-open 26698 | Dye file-archive 26998 | H_ cloud-upload 26913
 *   Zye minimize-2 27436 | kv plus（新建分支）| tv git-graph（图谱）
 *
 *  data-testid 常量（来自 src-HCld2afU.js，out/ 行号）：
 *   Jt=workspace-header(8361) | xne=workspace-title(8362) | hn=workspace-path(8362)
 *   Vt=workspace-more-button(8364) | pr=terminal-toggle(8237) | tee=chat-summary-panel(8308)
 *   $n=task-new-button(8318) | Wn=v4-task-open-in-split(8416)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js  (t 导出)
 *  3. Button (X) / createLucideIcon (Sa)
 *                                    button-laUijeDG.js  (t / c 导出)
 *  4. useIntlContext (G) 返回 {intl, locale}
 *                                    IntlProvider-C321H7m8.js (n 导出)
 *  5. usePlatformService (l)、toast (m/b)、Input (P)、IME 回车守卫 (A)、
 *     spinner 图标 (M)、Popover 原语 (T/h/x)
 *                                    imeComposition-DEYFkwWm.js（共享原语 chunk，
 *                                    导出 M/_/y/t/w/a/n/i 等）
 *  6. Tooltip (Ia)、Popover 弹层原语 (Na/Oa/Ma/ka)
 *                                    usageStatsUiParts-CiR7YEhh.js (u/p/d/m/f 导出)
 *  7. shortcutLabel ($i)：`$i('N')` → “Ctrl+N”
 *                                    keyboardShortcuts-BGHopxr9.js (n 导出)
 *  8. logger (J)                     logger-PFDwl5Yq.js (t 导出)
 *  9. DesktopCommand 枚举 (oi)、运行环境常量 (hi)、全部 testid 常量
 *                                    src-HCld2afU.js (ft/js/Ha/qa/Ka/Ga/Ri/Vn/Pi/Oa 导出)
 * 10. Radix DropdownMenu 底层原语 (aTe…vTe)：打包进本 chunk（jsx 27465 起）
 * 11. Markdown 渲染器 (cj)：本 chunk jsx 46461（memo 化）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/TopBar.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  TopBarOverlay,
  TopBarIconButton,
  WINDOWS_CAPTION_RIGHT_INSET_VAR,
  windowsCaptionInsetStyle,
  UpdateIndicator,
  PRODUCT_DOCS_URL,
  WindowsCaptionMenu,
  TerminalToggleButton,
  HelpMenu,
  SessionHeader,
  SessionHeaderRight,
  SessionHeaderLeft,
  TaskRenameDialog,
  TaskActionMenuItems,
  GitBranchChip,
  RemoteSyncMenuItems,
  buildSummaryPanelModel,
  resolveSummaryPanelVariant,
  ConversationSummaryAside,
  MemoizedConversationSummaryAside,
} from '../components/shell/TopBar';
export type {
  UpdateState,
  GitSummary,
  TaskActionMenuItemsProps,
  SummaryPanelVariant,
  SummaryPanelLayoutMode,
  BackgroundWork,
  RunningSubagent,
  SummaryGoal,
} from '../components/shell/TopBar';
