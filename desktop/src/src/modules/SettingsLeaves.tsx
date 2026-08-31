/* eslint-disable */
/**
 * ============================================================================
 * SettingsLeaves.tsx — ZCode 3.7.6 设置族接口级叶子（D8 Stage B4）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动；只读访问）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 c9d0d675d0b858e6e7711df3e9122e81）
 * 前序产物（本批实体化其接口级声明）：
 *   SettingsPanelsCapability.tsx（n9/V1t/B1t、m0t/S0t/D0t、kNt/YMt、子代理/插件助手群声明）
 *   ExtendedViews.tsx（ZNt/UNt/BNt…XNt、Gjt、tMt/cMt/L3/INt/ANt、Pjt/LNt 声明）
 * 标样：TopBar.tsx（行号口径 = 输入 js 闭区间；混淆名映射表 + 外部依赖清单）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行号为融合 chunk 行）
 * ----------------------------------------------------------------------------
 * §A 子代理分区深层叶子（F06；SettingsPanelsCapability §1.4 接口级，js 196950–197837；A1-R24 cn 行漂移专项：全表 +296 校正）：
 *   q7/b1t/x1t/J7/Y7/S1t/C1t → 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 (196950–196956)
 *   w1t → collectEditableAgents (196957) | X7 → isUserManagedSubagent (196963)
 *   T1t → isBuiltInSubagent (196966)     | E1t → builtInSubagentName (196969)
 *   D1t/O1t → 工具表拆分（已知/保留）(196972/196975) | k1t → mergeToolSelections (196978)
 *   A1t → isInheritAllTools (196982)     | j1t → normalizeSelectedModel (196985)
 *   M1t → isSameModelRef (196989)        | N1t → resolveThoughtLevelOption (196993)
 *   P1t → isThoughtLevelAvailable (197026) | Z7 → isModelAvailableInGroups (197032)
 *   Q7 → subagentFormDraftOf (197036)    | F1t → subagentFormKeyOf (197050)
 *   $7 → resolveModelTriggerLabel (197053) | e9 → SubagentFormLabel (197061)
 *   I1t → SubagentColorDot (197067)      | t9 → SubagentBadge (197073)
 *   L1t → groupSubagents (197082)        | R1t → subagentScopeI18nId (197088)
 *   z1t → ToolCheckboxRow (197097)       | n9 → SubagentRow (197135)
 *   B1t → BuiltInModelOverrideControl (197278) | V1t → SubagentConfigForm (197418)
 *
 * §B 插件分区深层叶子（F06；SettingsPanelsCapability §1.5 接口级，js 198144–199993）：
 *   r9 → PluginIcon (198144) | i9 → hasUpdate (198171) | W1t → isUpdatable (198174)
 *   G1t/K1t → i18n 文案按语言回退 (198154/198165) | a9 → pluginDisplayName (198177)
 *   o9 → pluginDescription (198180) | q1t → 分类 i18n 表 (198187)
 *   J1t → buildStoreItems (198199) | Y1t → collectFeaturedItems (198241)
 *   X1t → buildCategoryGroups (198254) | Z1t → pluginSearchMatch (198272)
 *   Q1t → sortInstalledItems (198286) | $1t → PluginInstalledList (198297)
 *   e0t → PluginHookDetailsList (198413) | s9 → PluginDetailField (198520)
 *   t0t → hookCommandPreview (198531) | n0t → PluginInfoRow (198534)
 *   r0t → AddMarketplaceDialog (198544) | i0t → isPluginBusy (198670)
 *   a0t → PluginEnabledSwitch (198679) | o0t → PluginItemMenu (198695)
 *   s0t → PluginInstallButton (198765) | c0t → PluginStoreCard (198789)
 *   l0t/c9/u0t → 精选配置（官方市场 + 6 插件名）(198843)
 *   d0t → pickRecommendedItems (198857) | f0t/l9/p0t → cache 来源标签 (198870–198878)
 *   u9 → GROUP_COLLAPSED_COUNT=6 (198879)
 *   m0t → PluginStoreGrid (198880) | h0t → PluginStoreSegmentButton (199075)
 *   d9 → PluginStoreSection (199090) | f9 → PluginCardGrid (199106)
 *   g0t → PluginStoreGroup (199112) | _0t → PluginStorePublicView (199172)
 *   v0t → PluginStorePersonalView (199223) | y0t/b0t/x0t → 组件段序/标题/图标 (199267)
 *   S0t → PluginDetail (199276) | C0t → MarketEntryCard (199415)
 *   w0t → PluginComponentSection (199474) | T0t → PluginDetailInfo (199531)
 *   p9 → firstHttpsUrl (199650) | E0t → PluginAdvancedSection (199653)
 *   D0t → PluginManageList (199673) | O0t → isRemovableMarketplace (199763)
 *   k0t → MarketplaceRefreshFailure (199766) | A0t → PluginSourcesDialog (199786)
 *   j0t → formatMarketplaceTime (199899) | M0t → PluginUninstallDialog (199903)
 *   N0t → useUninstallFlow (199952) | P0t/F0t → 聊天提及引用构造 (199978/199989)
 *
 * §C 自动化编辑器（F15；SettingsPanelsCapability §1.8 / ExtendedViews §7 接口级）：
 *   助手群（js 134026–135575）：
 *   Rjt → resolveTitleOnDefaultChange (134026) | Gjt → KeepAwakeSwitch (134428)
 *   E3/D3/Kjt/O3/qjt/k3/A3/Jjt/Yjt/j3/Xjt/M3/N3/P3/Zjt/F3 → 图标尺寸常量与包装 (134452–134510)
 *   Qjt → BACK_BUTTON_CLASS (134511) | I3 → FIELD_STACK_CLASS (134512)
 *   $jt → AutomationsEmptyState (134513) | eMt → EditorTabSwitcher (134518)
 *   tMt → KeepAwakeRow (134543) | L3 → CreateSplitButton (134569)
 *   nMt/rMt/iMt/aMt → 历史排序/气泡侧位常量 (134639–134648)
 *   pMt → PromptCard (134945) | mMt → AutoGrowTextarea (134956，dMt/fMt 116/156)
 *   hMt → PromptCardFooter (134992) | gMt → OffPeakTaskMenu (134998)
 *   _Mt/vMt → 历史状态样式/归一 (135060/135068) | yMt → OffPeakHistoryTable (135075)
 *   H3 → EDITOR_PAGE_CLASS (135266) | G3/K3 → 缺省模式 build/思考 medium (135378)
 *   OMt → isThoughtPreviewReady (135380) | kMt → MODE_VALUES (135383)
 *   jMt → buildModeOption (135406) | MMt/q3 → 模型组条目查找 (135413/135423)
 *   NMt → resolveModelLabel (135436) | PMt → normalizeThoughtOption (135449)
 *   FMt → resolveThoughtLevelPayload (135464) | IMt → resolveThoughtPreviewOption (135467)
 *   LMt → fetchModelThoughtOption (135473，临时会话探测)
 *   RMt → isLocalWorkspaceTab (135496) | J3 → useLocalWorkspaceTabs (135498)
 *   zMt → isRemoteWorkspaceTab (135501) | BMt → collectWorkspaceOptions (135504)
 *   VMt → useWorkspaceOptions (135523) | HMt → pathTailName (135529)
 *   UMt/WMt → 模型配置匹配 (135532/135535) | GMt → resolveAllowedThoughtLevels (135539)
 *   KMt → buildOffPeakThoughtOption (135554) | qMt → neverLocked (135572)
 *   JMt → pathTailNameAlias (135573)
 *   cron 域（js 109250–109510，F03 段双归属，F15 消费）：
 *   qht → automationStatusOf (109250) | q$/J$/Jht → 周序/补零/30 天阈值 (109259)
 *   Yht → isChatCreatedAutomation (109262) | Y$ → scheduleBuilderToCron (109265)
 *   X$ → cronToScheduleBuilder (109296) | Z$ → weekdayLabel (109373)
 *   Q$ → schedulePreviewText (109376) | Xht → cronPreviewText (109449)
 *   Zht → isRepresentableCron (109460) | Qht → gmtOffsetLabel (109466)
 *   $$ → formatDateTime (109474) | $ht → relativeTimeLabel (109478)
 *   egt → resolveNextRunLabel (109498) | tgt → formatRunDuration (109502)
 *   调度原语（js 136026–137004）：
 *   Y3/XMt → ScrollArea/Scrollbar (136026/136042) | ZMt → resolveDraftTitleOnDefaultChange (136058)
 *   QMt → changedFieldsOf (136068) | $Mt → missingRequiredFields (136073)
 *   eNt → removeFromSet (136082) | X3/Z3/tNt → 工作区键解析 (136087–136099)
 *   Q3/nNt/$3/rNt/e6/t6/iNt/n6 → inherit/频率表/页大小 8/区间 0–200 (136101–136108)
 *   aNt → paginationWindow (136109) | r6 → pathTailName2 (136119)
 *   oNt/sNt/cNt → 模型组缺省/当前模型/思考项提取 (136122–136137)
 *   i6 → pad2 (136138) | lNt/a6 → Select 弹层类名常量 (136141)
 *   uNt/dNt → Select 指示/日历图标 (136143/136150)
 *   fNt → HourMinuteColumn (136153) | pNt → TimePicker (136185)
 *   mNt → ValueColumn (136222) | hNt → daysInMonth (136255)
 *   gNt → MonthDayPicker (136258) | _Nt → WeekdayPicker (136309)
 *   o6/vNt/yNt → 日期串工具 (136362–136377) | bNt → EndDatePicker (136378)
 *   xNt → CustomRepeatDialog (136501) | SNt → runIfSaved (136919)
 *   CNt → defaultScheduleBuilder (136922) | s6 → scheduleBuilderOf (136938)
 *   wNt → runStatusOf (136956) | TNt/ENt/DNt → 状态色表 (136970–136989)
 *   ONt → scheduleRulePayload (136990)
 *   编辑器根：
 *   YMt → OffPeakTaskEditor (135576–136025)
 *   kNt → AutomationEditor (137005–138512)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() (Z)                       utils-CEEH0K_K.js
 *  3. Button (X)、图标族             button-laUijeDG.js（lucide 风格）
 *  4. useIntlContext (G)             IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、toast (m)、Input (P)、IME 回车守卫 (A)、
 *     spinner (M/EN)                 imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、Popover (Na/Oa/Ma/ka) usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                     logger-PFDwl5Yq.js
 *  8. 本 chunk 已重建/接口级：
 *     U2 useConfirmDialog（Modals.tsx）、fs useServices（services.tsx）、
 *     DC Switch（Settings.tsx）、hC/gC/_C Tabs、iO/aO/oO/sO/cO Select、
 *     VO/HO/UO/WO/YO DropdownMenu、zb/Hb/Ub/Gb/Wb/Vb Dialog、$4…a3 AlertDialog（原语族）、
 *     pc 工作区标签 store + oc 过滤（stores/壳域）、a4 工作区选择行（Home.tsx）、
 *     Mq 模式选择器（F12）、vq 模型选择器（F08）、Pq 思考级别选择器（F08）、
 *     Jq useWorkspaceConfigOptions（F12 78389）、JM useAppSettings（53440）、
 *     se/Zn 模型键解析（src chunk）、qn/ui 思考级别表（F12）、iN 模型标签助手（F08）、
 *     oee 设置项归一（F12）、Dj 插件提及 markdown（F19 52090）、
 *     B6 plugins store（stores-workspace.tsx）
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings/modal 域）——本文件现为薄 re-export shim〕
 * 三个叶子族已按族原样迁入，导入方零改动（仍从本文件取符号）：
 *   §A 子代理深层叶子（F06）  → components/settings/SubagentLeaves.tsx
 *   §B 插件深层叶子（F06）    → components/settings/PluginLeaves.tsx
 *   §C 自动化编辑器（F15）    → components/automations/AutomationEditor.tsx
 * §0 声明群随消费族迁入：SelectItemEntry/SelectGroupEntry/ConfigOption/
 * ThoughtLevelSelector 由子代理族所有（自动化族经 type import 取回三型）；
 * toSorted/IconComponent/usePlatformService/pluginMentionMarkdown 随插件族；
 * IntlShape/图标 declare/工作区与模型 declare 随自动化族。
 * ToastOptions、PluginsStoreState 无族消费，保留本文件。
 * ==========================================================================*/

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

export interface ToastOptions {
  durationMs?: number;
  position?: string;
  variant?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  anchorId?: string;
  [key: string]: unknown;
}

interface PluginsStoreState {
  uninstallPlugin(pluginId: string, pluginService: unknown): Promise<void>;
  [key: string]: unknown;
}

export {
  SUBAGENT_COLORS,
  SUBAGENT_COLOR_CLASSES,
  subagentModelNeverLocked,
  SUBAGENT_MODEL_INHERIT,
  SUBAGENT_TOOL_OPTIONS,
  collectEditableAgents,
  isUserManagedSubagent,
  isBuiltInSubagent,
  builtInSubagentName,
  filterKnownTools,
  filterPreservedTools,
  mergeToolSelections,
  isInheritAllTools,
  normalizeSelectedModel,
  isSameModelRef,
  resolveThoughtLevelOption,
  isThoughtLevelAvailable,
  isModelAvailableInGroups,
  subagentFormDraftOf,
  subagentFormKeyOf,
  resolveModelTriggerLabel,
  SubagentFormLabel,
  SubagentColorDot,
  SubagentBadge,
  groupSubagents,
  subagentScopeI18nId,
  ToolCheckboxRow,
  SubagentRow,
  BuiltInModelOverrideControl,
  SubagentConfigForm,
} from '../components/settings/SubagentLeaves';
/* ── tombstone（A1-R25）：resolveModelTriggerLabelParts 转导出行删除——属主面（SubagentLeaves
 *    A0 双实例）同批删除，墓碑见该文件原 §A nWe 位。 ── */
export type {
  SelectItemEntry,
  SelectGroupEntry,
  ConfigOption,
  SubagentItem,
  ThoughtLevelResolution,
  SubagentFormDraft,
  ModelProvider,
} from '../components/settings/SubagentLeaves';

export {
  PluginIcon,
  hasPluginUpdate,
  isPluginUpdatable,
  resolveLocalizedText,
  resolveLocalizedList,
  pluginDisplayName,
  pluginDescription,
  PLUGIN_CATEGORY_I18N,
  buildStoreItems,
  isOfficialMarketplace,
  collectFeaturedItems,
  buildCategoryGroups,
  pluginSearchMatch,
  sortInstalledItems,
  PluginInstalledList,
  PluginHookDetailsList,
  PluginDetailField,
  hookCommandPreview,
  PluginInfoRow,
  AddMarketplaceDialog,
  isPluginBusy,
  PluginEnabledSwitch,
  PluginItemMenu,
  PluginInstallButton,
  PluginStoreCard,
  PLUGIN_RECOMMENDED_CONFIG,
  pickRecommendedItems,
  resolveMarketplaceLabel,
  formatPluginSourceLabel,
  PLUGIN_GROUP_COLLAPSED_COUNT,
  PluginStoreGrid,
  PluginStoreSegmentButton,
  PluginStoreSection,
  PluginCardGrid,
  PluginStoreGroup,
  PluginStorePublicView,
  PluginStorePersonalView,
  PluginDetail,
  extractComponentsFromInfo,
  extractComponentsFromDescribe,
  isHttpsUrl,
  MarketEntryCard,
  PluginComponentSection,
  PluginDetailInfo,
  firstHttpsUrl,
  PluginAdvancedSection,
  PluginManageList,
  isRemovableMarketplace,
  MarketplaceRefreshFailure,
  PluginSourcesDialog,
  formatMarketplaceTime,
  PluginUninstallDialog,
  useUninstallFlow,
  buildPluginMentionEntry,
  buildPluginChatPrompt,
} from '../components/settings/PluginLeaves';
export type {
  PluginListing,
  PluginItem,
  PluginStoreActions,
  PluginHookDetail,
  PluginDescribeEntry,
} from '../components/settings/PluginLeaves';

export {
  automationStatusOf,
  WEEKDAY_DISPLAY_ORDER,
  pad2,
  isChatCreatedAutomation,
  scheduleBuilderToCron,
  cronToScheduleBuilder,
  weekdayLabel,
  schedulePreviewText,
  cronPreviewText,
  isRepresentableCron,
  gmtOffsetLabel,
  formatDateTime,
  relativeTimeLabel,
  resolveNextRunLabel,
  formatRunDuration,
  resolveTitleOnDefaultChange,
  resolveDraftTitleOnDefaultChange,
  KeepAwakeSwitch,
  AutomationChevronIndicator,
  AutomationPlusIcon,
  AutomationInfoIcon,
  AutomationCalendarIcon,
  AutomationPauseIcon,
  AutomationPlayIcon,
  AutomationEditIcon,
  AutomationRunIcon,
  AutomationResumeIcon,
  AutomationTemplateStarIcon,
  AutomationActiveIcon,
  AutomationMoreIcon,
  AutomationOpenSessionIcon,
  AutomationRefreshIcon,
  AutomationDeleteIcon,
  AUTOMATION_BACK_BUTTON_CLASS,
  AUTOMATION_FIELD_STACK_CLASS,
  AutomationsEmptyState,
  EditorTabSwitcher,
  KeepAwakeRow,
  CreateSplitButton,
  sortAutomationRuns,
  automationTooltipSide,
  PromptCard,
  AutoGrowTextarea,
  AUTOMATION_TEXT_CLASS,
  PromptCardFooter,
  OffPeakTaskMenu,
  offPeakHistoryStatusOf,
  OffPeakHistoryTable,
  AUTOMATION_EDITOR_PAGE_CLASS,
  AUTOMATION_DEFAULT_MODE,
  AUTOMATION_DEFAULT_THOUGHT_LEVEL,
  isThoughtPreviewReady,
  buildModeOption,
  findModelGroupItem,
  resolveModelGroupItem,
  resolveModelLabel,
  normalizeThoughtOption,
  resolveThoughtLevelPayload,
  resolveThoughtPreviewOption,
  fetchModelThoughtOption,
  isLocalWorkspaceTab,
  useLocalWorkspaceTabs,
  isRemoteWorkspaceTab,
  collectWorkspaceOptions,
  useWorkspaceOptions,
  pathTailName,
  normalizeModelKey,
  modelConfigMatches,
  resolveAllowedThoughtLevels,
  buildOffPeakThoughtOption,
  automationModelNeverLocked,
  AutomationScrollArea,
  AutomationScrollbar,
  changedFieldsOf,
  missingRequiredFields,
  removeFromSet,
  workspaceOptionKey,
  findWorkspaceOption,
  resolveWorkspaceOptionKey,
  AUTOMATION_MODEL_INHERIT,
  AUTOMATION_FREQUENCIES,
  isAutomationFrequency,
  AUTOMATION_RUNS_PAGE_SIZE,
  paginationWindow,
  defaultModelFromGroups,
  currentModelOptionValue,
  findThoughtOption,
  AutomationSelectIndicator,
  ScheduleCalendarIcon,
  HourMinuteColumn,
  TimePicker,
  ValueColumn,
  daysInMonth,
  MonthDayPicker,
  WeekdayPicker,
  toDateString,
  dateStringToEndTimestamp,
  dateStringToDate,
  EndDatePicker,
  CustomRepeatDialog,
  runIfSaved,
  defaultScheduleBuilder,
  scheduleBuilderOf,
  automationRunStatusOf,
  AUTOMATION_RUN_DOT_CLASSES,
  AUTOMATION_RUN_TEXT_CLASSES,
  AUTOMATION_LIFECYCLE_DOT_CLASSES,
  scheduleRulePayload,
  AUTOMATION_TOOLBAR_BUTTON_CLASS,
  OffPeakTaskEditor,
  AutomationEditor,
} from '../components/automations/AutomationEditor';
export type {
  AutomationTaskLite,
  ScheduleBuilderState,
  OffPeakTaskRecord,
  WorkspaceOption,
  CustomRepeatConfirmPayload,
  ScheduleRule,
  AutomationRunRecord,
} from '../components/automations/AutomationEditor';
