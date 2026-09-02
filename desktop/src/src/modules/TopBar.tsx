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
 * 一、混淆名 → 语义名 映射表（行号格式：styles chunk js 定义行；R63 审计：原次列「jsx 行」系统性误链全删，见表尾审计注）
 * ----------------------------------------------------------------------------
 *  组件族主体：
 *   BOt  → TopBarOverlay              顶栏浮层 (129533)
 *   o4   → TopBarIconButton          顶栏通用图标按钮+tooltip (129496)
 *   LOt  → UpdateIndicator           更新指示器（下载中/可更新/已下载胶囊）(129402)
 *   IOt  → updatePillResponsiveClasses 更新胶囊按平台展开的容器查询类 (129371)
 *   FOt  → ReleaseNotesPopover       发行说明弹层 (129313)
 *   POt  → UpdateStatusDialogController 更新对话框控制器（下载/跳过/重启安装）(129142)
 *   COt  → UpdateStatusDialog        更新对话框呈现层（属主 Modals.tsx，本文件真实 import 调用）(128812)
 *   DOt  → resolveUpdateViewModel    更新状态 → 视图模型 (129083)
 *   TOt  → pickLocalizedReleaseNotes (129064)
 *   EOt  → formatReleaseDate         (129071)
 *   kOt  → downloadProgressLabel     (129113)
 *   NOt  → formatMegabytes           (129139)
 *   c4   → windowsCaptionInsetStyle  env(titlebar-area-*) 计算右侧原生控件宽度 (129509)
 *   s4   → WINDOWS_CAPTION_RIGHT_INSET_VAR (129524)
 *   zOt  → WINDOWS_CAPTION_BUTTON_CLASS   (129532)
 *   S6   → WindowsCaptionMenu        Win/Linux 标题栏 ⌄ 应用菜单 (141871)
 *   U6   → HelpMenu                  帮助菜单（反馈/建议/社群/文档/导出日志）(143362)
 *   H6   → TerminalToggleButton      终端开关（Ctrl+J，激活 !bg-selected）(143333)
 *   TFt  → SessionHeader             会话头（h-12 border-b）(144050)
 *   wFt  → SessionHeaderLeft         会话头左簇（标题/路径pill/分支/更多）(143502)
 *   SFt  → SessionHeaderRight        会话头右簇（编辑器/帮助/终端/侧面板）(143435)
 *   xFt  → OpenInEditorButtonGroup   在 IDE 中打开（主按钮+⌄选择编辑器）(143211)
 *   j6   → TaskRenameDialog          任务重命名对话框（IME 保护）(142598)
 *   oFt  → TaskActionMenuItems       任务操作菜单项（置顶/重命名/归档/未读/复制路径…）(142200)
 *   zZ   → GitBranchChip             git 分支切换 chip（含分支搜索/新建/提交切换）(96637)
 *   n4   → RemoteSyncMenuItems       远程同步菜单项（技能/MCP/插件）(127166)
 *   r4   → RemoteSyncDialogs         远程同步对话框组（本文件仅保留接口）(127265)
 *   Flt  → ConversationSummaryAside  会话右摘要栏（mini/panel/auto 三态）(99265)
 *   VO/HO/UO/WO/GO/KO/qO/JO/YO/XO
 *        → DropdownMenu* 原语族      (47926-48040)
 *
 *  辅助钩子 / 服务 / store（同 chunk 内）：
 *   ZPt  → useHelpActions            (141823)
 *   $Pt  → isAutoUpdateChannelSupported（env==='production'）(141843)
 *   eFt/tFt → updateMenuItemI18nId / updateMenuItemI18nValues (141829,141843)
 *   QPt  → CAPTION_MENU_ALIGN_OFFSET = -12 (141842)
 *   YPt  → captureFeedbackScreenshots (141802)
 *   XPt  → exportLogsWithToast       (141806)
 *   lw   → PRODUCT_DOCS_URL = https://zcode.z.ai/docs (39458)
 *   C6   → useTaskFileActions        (142085)
 *   CFt/$2 → canOpenRemoteSessionSource (143499,127142)
 *   ZTt  → remoteTargetLabel         (123256)
 *   QTt  → sshDecoratedProjectName   (123268)
 *   Zge  → resolveEffectiveProvider  (24734)
 *   U2   → useConfirmDialog          (123510)
 *   Oc   → useWorkspaceServices      (4993)
 *   Ec   → useBaseServices           (4945)
 *   ZS   → useTaskListItems          (35727)
 *   Uo   → applyOptimisticTaskMutation (1895)
 *   w6   → buildTaskFeedbackDescription (142351)
 *   pct  → useGitBranchSwitcher      (96410)
 *   MZ   → resolveBranchDisplayLabel (95015)
 *   Uct  → resolveSummaryPanelVariant (98064)
 *   tlt  → buildSummaryPanelModel    (98181)
 *   slt/clt → EMPTY_BACKGROUND_WORKS / EMPTY_SUBAGENTS (98272)
 *   mlt/hlt/Clt/Tlt/klt/Alt/Plt
 *        → SummaryGitSection / SummaryGoalSection / SummaryPlansSection /
 *          SummaryPlanSection / SummaryTerminalsSection / SummaryAgentsSection /
 *          SummaryMiniCard (98402,98501,98775,98826,98919,98981,99157)
 *   yC   → useFeedbackStore          (36992)
 *   E6   → usePinnedTaskListStore    (142389)
 *   k6   → useWorkspaceTaskListStore (142481)
 *   Ug   → useMcpStore               (25055)
 *   ls   → useTrajectoryViewerStore  (2610)
 *   xe   → useTaskStore（skillStore chunk 的 h 导出）
 *
 *  〔A1-R63 映射表次列审计〕原次列「jsx 行」系统性误链，全删：
 *   实证①：src chunk 仅 10,069 行，次列 118006/118239/118266/118392 等不可能存在；
 *   实证②：styles 抽样 84991/85113/85193/85281 全落支付区（zet@84460 全屏视图域，purchaseAudience/onPayWithStripePaymentMethod 邻证）、
 *          108678 落工具输出区（Sht@108629，TaskOutput 渲染）、83842/82976 落支付字段（balanceLoading/campaignDiscountAmount）、
 *          32810/33835 落 zod/Set 区、21359/21655 落 innerHTML/mergeBuffers 区，皆与符号语义无关；
 *   实证③：真 jsx 渲染体在融合 chunk 内联邻接（摘要面板 jsx 99319+，chat-summary-panel 变量实证），无独立远端 jsx 区；
 *   三 jsx-only 行改真定义行：Zge 21359→24734（`e ?? t` 体证）、Ug 21655→25055（Ae store，servers/statusSnapshots 消费实证）、
 *          ls 1697→2610（model-trajectory-open 体证）；误链同源 = a0-symbols.tsv 旧值（Zge/Ug 行同错）。
 *
 *  图标（lucide 风格，Sa=createLucideIcon 工厂，js 行）：
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
 *                                    button-laUijeDG.js  (t)
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
