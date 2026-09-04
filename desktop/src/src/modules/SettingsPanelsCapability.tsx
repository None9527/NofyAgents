/* eslint-disable */
/**
 * ============================================================================
 * SettingsPanelsCapability.tsx — ZCode 3.7.6 Settings 大体量叶子分区（D8 Stage B3 · 第二批）
 *   技能（y1t）/ 子代理（H1t）/ 插件（I0t）/ 命令（G0t）/ Hooks（p2t）/ 自动化（d6）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机 213,979 行，未改动；旧账 213,695 行拷贝已不在本机，两版行号不同，本文件引证 vintage 逐条混杂、用前须以本机束重定〔A1-R163〕）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 前序产物：Settings.tsx / Settings.report.md §1.2（本文件实体化其接口级叶子）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * A. 技能分区（y1t，js 195992–197541 / jsx 157604–157969）
 *   y1t  → SkillsSettingsSection          分区根 (196288)
 *   m1t  → skillEnabledFilterMatch        (196204)
 *   h1t  → ResourceEnabledFilterSelect    (196207)
 *   g1t  → workspaceFolderName            (jsx 157578)
 *   _1t  → formatPublishedAtIso           (jsx 157580)
 *   K7   → DetailField                    (jsx 157585)
 *   v1t  → DetailPathRow                  (jsx 157593)
 *   （接口级）：技能行内联渲染（y1t 内 Ce）、h$t SkillsImportDialog（SettingsPanels.tsx §8）、
 *    r4 RemoteSyncDialogs（TopBar.tsx 已抽取）、XQt/XB 技能分组（skillStore chunk）、
 *    M6/N6 会话能力刷新（跨 chunk）、Tj skill-creator 提示 (jsx 157755)、
 *    cLt 任务登记 (jsx 157785)、zV 运行时供应商 (jsx 157762)
 *
 * B. 子代理分区（H1t，js 197542–199414 / jsx 158526–158853）
 *   H1t  → SubagentsSettingsSection       分区根 (197838)
 *   （接口级）：n9 SubagentRow (jsx 158134)、B1t BuiltInModelOverrideControl (jsx 158196)、
 *    V1t SubagentConfigForm (jsx 158301)、w1t 排序 (157977)、X7 isUserManaged (157980)、
 *    E1t builtInNameOf (157986)、D1t/O1t/k1t/A1t/j1t/M1t/N1t/P1t/Z7/Q7/F1t/$7/e9/I1t/t9
 *    助手群 (157989–158113)、L1t groupSubagents (158114)、Jq useWorkspaceConfigOptions、
 *    Hq buildModelSelectGroups、De subagents 能力刷新（跨 chunk）
 *
 * C. 插件分区（I0t，js 199994–200497 / jsx 159986–160319）
 *   I0t  → PluginsSettingsSection         分区根 (200290)
 *   （接口级）：m0t PluginStoreGrid (jsx 159338)、S0t PluginDetail (jsx 159603)、
 *    C0t MarketEntryCard (jsx 159658)、D0t PluginManageList (jsx 159768)、
 *    E0t/n0t/e0t 高级信息件 (159755/159143/159069)、U1t PluginConfigForm (jsx 158854)、
 *    M0t UninstallConfirmDialog (jsx 159877)、A0t SourcesDialog (jsx 159831)、
 *    r0t AddMarketplaceDialog (jsx 159149)、N0t useUninstallFlow (jsx 159932)、
 *    J1t buildStoreItems (jsx 158932)、W1t describeStatus (jsx 158891)、
 *    i9 isUpdateStatus (jsx 158888)、p0t formatPluginSource (jsx 159332)、
 *    F0t/P0t 聊天创建提示 (159974/159955)、cre/c9 官方市场 id (jsx 159308/159313)、
 *    B6 plugins store (142985)、M6/N6/V6 能力刷新（跨 chunk）
 *
 * D. 命令分区（G0t，js 200852–201243 / jsx 160523–160725）
 *   G0t  → CommandsSettingsSection        分区根 (201148)
 *   L0t  → useCommandsStoreBridge         (200799)
 *   m9   → isUserManagedCommand           (jsx 160369)
 *   R0t  → CommandScopeBadge              (jsx 160372)
 *   z0t  → CommandRow                     (200852)
 *   B0t  → COMMAND_NAME_PATTERN          (jsx 160404)
 *   h9   → CommandFormLabel               (jsx 160407)
 *   U0t  → CommandStorageLevelSelect      (jsx 160412)
 *   W0t  → CommandForm                    (200999)
 *   （接口级）：F6 commands store (142754)、ki/ft 命令类型守卫（跨 chunk）、
 *    Kte agentSource 常量、ZQt 命令分组 (jsx 155568)
 *
 * E. Hooks 分区（p2t，js 202032–202285 / jsx 161468–161624）
 *   p2t  → HooksSettingsSection           分区根 (202328)
 *   t2t  → HookForm                       (201686)
 *   Q0t  → FormLabelSlot                  (jsx 161013)
 *   $0t  → HOOK_EVENTS                    (jsx 161019)
 *   e2t  → customJsonOf                   (jsx 161020)
 *   y9   → HookFormField                  (jsx 161229)
 *   n2t  → HOOK_EVENT_ORDER               (jsx 161236)
 *   r2t  → HookScopeTabs                  (jsx 161237)
 *   i2t  → HookListByEvent                (202067)
 *   a2t  → groupHookRowsByEvent           (jsx 161289)
 *   b9   → HookRowShell                   (jsx 161322)
 *   x9   → HookRowBody                    (jsx 161331)
 *   o2t  → EditableHookRow                (jsx 161349)
 *   s2t  → CompatibilityHookRow           (jsx 161383)
 *   c2t  → PluginHookRow                  (jsx 161409)
 *   l2t  → HookRowActionButton            (jsx 161443)
 *   u2t  → isZCodeHook                    (jsx 161451)
 *   d2t  → collectPluginHookRows          (jsx 161454)
 *   f2t  → filterPluginHooksByScope       (jsx 161464)
 *   m2t  → hookMatchesQuery               (jsx 161625)
 *   （接口级）：Z0t hooks store (201244 / jsx 160815)、lFt 会话能力刷新 (跨 chunk)
 *
 * F. 自动化分区（d6，js 138823–139924 / jsx 115911–116622；F15 族根）
 *   d6   → AutomationsMain                分区根 (138840)
 *   BNt  → resolveVisibleTabs             (jsx 115803)
 *   VNt  → resolveEffectiveTab           (jsx 115809)
 *   HNt  → resolveTemplateVisibility     (jsx 115812)
 *   UNt  → AUTOMATION_STATUS_STYLES      (jsx 115823)
 *   WNt  → normalizePromptPreview        (jsx 115841)
 *   GNt  → isFailedAutomation            (jsx 115845)
 *   KNt  → isToggleableAutomation         (jsx 115848)
 *   qNt  → runNowResultMessageId          (jsx 115851)
 *   u6   → automationErrorMessageId       (jsx 115854)
 *   JNt  → createErrorMessageId           (jsx 115857)
 *   YNt  → findAutomationById            (jsx 115860)
 *   XNt  → resolveOpenTarget              (jsx 115864)
 *   ZNt  → AutomationRowActionMenu        (138730)
 *   （接口级，F15 族深层）：kNt AutomationEditor (jsx 114854)、YMt OffPeakTaskEditor (jsx 114019)、
 *    tMt KeepAwakeRow (jsx 113438)、cMt OffPeakTaskList (jsx 113500)、L3 CreateSplitButton (jsx 113451)、
 *    INt OffPeakCreateButton (jsx 115771)、ANt StatusChip (jsx 115689)、Pjt 闲时模板 (jsx 112762)、
 *    LNt 定时模板 (jsx 115784)、zMt activeWorkspaceTab (jsx 113941)、Ijt/Ljt 配额 (112770/112778)、
 *    AMt 模型选择组 (jsx 113829)、PNt/MNt/FNt 埋点 (115735/115713/115752)、
 *    Vjt/Ujt/Wjt/Dit 闲时埋点 (113296/113330/78936/78941)、Ti workspaceKey (jsx 115867)、
 *    qht/Kht/rgt/egt 状态/下次运行 (93279/93276/93602/93576)、T3 automations store、
 *    bX offPeak store、H3 容器类、at/Xn/jr/Bte/on/Et testid 常量（src chunk）、
 *    EN spinner、M3/k3/I_/N/A3/j3/N3/Yjt/gbe/Jjt/Zjt/F3/uMt/Njt 图标、l6 toast 变体
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单：与 Settings.tsx/SettingsPanels.tsx 头部一致（react、cn、Button、
 *     IntlProvider、imeComposition 原语、logger、stores、服务 context），此处按需再声明。
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings/modal 域）——本文件现为薄 re-export shim〕
 * 六个分区组件单元已按族原样迁入，导入方零改动（仍从本文件取符号）：
 *   §1 技能（y1t）    → components/settings/SkillsSettingsSection.tsx
 *   §2 子代理（H1t）  → components/settings/SubagentsSettingsSection.tsx
 *   §3 插件（I0t）    → components/settings/PluginsSettingsSection.tsx
 *   §4 命令（G0t）    → components/settings/CommandsSettingsSection.tsx
 *   §5 Hooks（p2t）   → components/settings/HooksSettingsSection.tsx
 *   §6 自动化（d6）   → components/automations/AutomationsMain.tsx
 * 六族互不引用；§0 声明群随各消费族迁入（SkillsService 随技能族、SubagentsService
 * 随子代理族；插件族经 type import 取回技能族型别供 SkillsService 签名用）。
 * ==========================================================================*/

export {
  skillEnabledFilterMatch,
  workspaceFolderName,
  formatPublishedAtIso,
  DetailField,
  DetailPathRow,
  ResourceEnabledFilterSelect,
  SkillsSettingsSection,
} from '../components/settings/SkillsSettingsSection';
export type {
  SkillItem,
  SkillCapability,
  SkillDiagnostic,
  SkillsSettingsSectionProps,
} from '../components/settings/SkillsSettingsSection';

export { SubagentsSettingsSection } from '../components/settings/SubagentsSettingsSection';
export type {
  SubagentItem,
  SubagentCapability,
  SubagentConfig,
  SubagentsSettingsSectionProps,
} from '../components/settings/SubagentsSettingsSection';

export { PluginsSettingsSection } from '../components/settings/PluginsSettingsSection';
export type {
  PluginItem,
  PluginDescribeInfo,
  PluginMarketplace,
  PluginsSettingsSectionProps,
} from '../components/settings/PluginsSettingsSection';

export {
  useCommandsStoreBridge,
  isUserManagedCommand,
  CommandScopeBadge,
  CommandRow,
  CommandFormLabel,
  CommandStorageLevelSelect,
  CommandForm,
  CommandsSettingsSection,
} from '../components/settings/CommandsSettingsSection';
export type {
  CommandItem,
  CommandConfig,
  CommandsSettingsSectionProps,
} from '../components/settings/CommandsSettingsSection';

export {
  FormLabelSlot,
  HOOK_EVENTS,
  customJsonOf,
  HookFormField,
  HookForm,
  HookScopeTabs,
  HookRowShell,
  HookRowBody,
  HookRowActionButton,
  EditableHookRow,
  CompatibilityHookRow,
  PluginHookRow,
  isZCodeHook,
  collectPluginHookRows,
  filterPluginHooksByScope,
  hookMatchesQuery,
  groupHookRowsByEvent,
  HookListByEvent,
  HooksSettingsSection,
} from '../components/settings/HooksSettingsSection';
export type {
  HookItem,
  PluginHookRowModel,
  HookFormValues,
  HooksSettingsSectionProps,
} from '../components/settings/HooksSettingsSection';

export {
  resolveVisibleAutomationsTabs,
  resolveEffectiveAutomationsTab,
  resolveAutomationTemplateVisibility,
  normalizeAutomationPromptPreview,
  isFailedAutomation,
  isToggleableAutomation,
  runNowResultMessageId,
  automationErrorMessageId,
  automationCreateErrorMessageId,
  findAutomationById,
  resolveAutomationOpenTarget,
  AutomationRowActionMenu,
  AutomationsMain,
} from '../components/automations/AutomationsMain';
export type {
  AutomationTask,
  OffPeakTask,
  AutomationRun,
  AutomationsMainProps,
} from '../components/automations/AutomationsMain';
