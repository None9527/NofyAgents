/* eslint-disable */
/**
 * ============================================================================
 * Modals.tsx — ZCode 3.7.6 模态 / 对话框族（解混淆重建 · D8 Stage B3）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，双行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 子族分节：
 *   §1 更新对话框子族        COt 呈现层（POt 控制器/视图模型助手已在 TopBar.tsx）
 *   §2 远程同步对话框子族    r4 分派 + 技能/ MCP/ 插件 三同步对话框 + preflight 助手
 *   §3 目录浏览器子族        MEt（scope `directory-browser`，p4 包裹挂载见 g8t）
 *   §4 Onboarding 对话框子族 E3t + 导入向导六步（settings-sync 迁移）
 *   §5 确认 / 警告对话框子族 H2/U2/q4t + N9/G4t/$3t + P9 模态宿主；
 *                           任务删除/归档确认的触发入口登记（UI 侧在 TopBar/Sidebar 族）
 *   §6 WorkspaceActionError  状态接线登记（本构建无呈现层，见报告）
 *   —— 配额/订阅错误上报 wCt 已在 Conversation 族登记（ConversationOverlays.tsx），跳过
 *   —— j6 TaskRenameDialog 已在 TopBar.tsx，勿重复
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  §1 更新对话框（〔A1-R52〕全族行号纠偏：本节 js 行号系 A0 期旧口径漂移，机械批
 *     纠为 styles 真值——xOt/SOt/COt/POt/DOt/TOt/EOt/kOt/NOt 九件 +17、wOt 起点 +21
 *     异常（COt 尾界同 +21），10 名逐名对 bundle 定义行实证 10/10，见 A1-R52.report.md）：
 *   xOt → UpdateDialogCheckbox   Radix Checkbox 封装（自动更新开关用）(128793)
 *   SOt → UPDATE_DIALOG_LOGO_URL icon_512@2x 资源 URL (128808)
 *   COt → UpdateStatusDialog     更新对话框呈现层（三相位 + edgeToEdge 全屏变体）(128812)
 *   wOt → splitUpdateDialogTitle 标题按 __ZCODE_UPDATE_VERSION__ 占位符切前/后缀 (129050)
 *
 *  §2 远程同步（〔A1-R51〕全族行号纠偏：本节 js 行号系 A0 期旧口径 −17 漂移，机械批
 *     纠为 styles 真值 +17，77 名逐名实证，抽样见 A1-R51.report.md §三；$2/q2 二件
 *     R50 先纠，其注记所引旧号为史料）：
 *   ZDt → REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS = 15000 (styles 127131 / 107547)
 *   QDt → RemoteSyncPreflightTimeoutError (styles 127132 / 107548)
 *   Q2  → isRemoteSyncPreflightTimeoutError (styles 127139 / 107553)
 *   $2  → canOpenRemoteSessionSourceCheck (styles 127142 / 107556；〔A1-R50〕纠偏，原注 127125 为 −17 漂移旧口径)
 *   e4  → canSubmitRemoteSync (styles 127150 / 107559)
 *   t4  → withRemoteSyncPreflightTimeout (styles 127153 / 107562)
 *   $Dt → RemoteSyncDropdownButton 「同步到远端」下拉按钮 (styles 127218 / 107599)
 *   r4  → RemoteSyncDialogs        三同步对话框分派器 (styles 127265 / 107623)
 *   zEt → SKILL_SYNC_ACTION_SELECTOR 技能卡内可点击元素白名单 (styles 125012 / 106207)
 *   BEt → shouldHandleSkillCardClick (styles 125013 / 106208)
 *   VEt → SkillSyncRowList         技能选择行列表 (styles 125018 / 106216)
 *   HEt → SkillSyncResultView      技能同步结果 (styles 125124 / 106254)
 *   UEt → SkillSyncTitle           标题 + 警告 tooltip (styles 125168 / 106266)
 *   WEt → mergeSkillRows (styles 125197 / 106280)  GEt → defaultSkillSelection (styles 125201 / 106287)
 *   KEt → filterSkillRows (styles 125204 / 106290) q2  → remoteSyncTargetLabel (styles 125207 / 106293；〔A1-R50〕纠偏，原注 125190 为 −17 漂移旧口径)
 *   qEt → resolveSelectAllState (styles 125216 / 106297) JEt → SkillSyncShowExisting (styles 125219 / 106307)
 *   YEt → SkillSyncHeader (styles 125236 / 106318) XEt → SkillSyncSelectAll (styles 125259 / 106333)
 *   ZEt → SkillSyncDialog          技能同步对话框 (styles 125288 / 106355)
 *   QEt → mergeMcpRows (styles 125488 / 106467)  $Et → defaultMcpSelection (styles 125492 / 106474)
 *   eDt → filterMcpRows (styles 125495 / 106477) tDt → buildMcpImportPayload (styles 125498 / 106480)
 *   nDt → resolveMcpServerKind (styles 125507 / 106489) rDt → McpSyncTitle (styles 125516 / 106492)
 *   iDt → McpSyncShowExisting (styles 125545 / 106506) aDt → McpSyncHeader (styles 125562 / 106517)
 *   oDt → McpSyncSelectAll (styles 125585 / 106535) sDt → McpSyncRowList (styles 125616 / 106556)
 *   cDt → McpSyncResultView (styles 125695 / 106577) lDt → McpSyncDialog (styles 125745 / 106590)
 *   J2  → RemotePluginSyncStoppedError (styles 125951 / 106719) uDt → pluginSyncLogIdCounter (styles 125958 / 106724)
 *   dDt → makePluginSyncLogId (styles 125959 / 106725) fDt → toInlinePluginCandidate (styles 125964 / 106730)
 *   pDt → pluginStatusKey (styles 125979 / 106748)   mDt → mergeInlinePluginRows (styles 125982 / 106752)
 *   hDt → mergePluginRows (styles 125997 / 106768)   gDt → defaultPluginSelection (styles 126012 / 106787)
 *   _Dt → filterPluginRows (styles 126015 / 106790)  vDt → canClosePluginSyncDialog (styles 126018 / 106793)
 *   yDt → buildMarketplaceCandidates (styles 126021 / 106796) bDt → mapMarketplaceStatuses (styles 126047 / 106832)
 *   xDt → remoteComponentKinds (styles 126061 / 106850) SDt → extractPluginOptions (styles 126064 / 106853)
 *   CDt → attachPluginOptions (styles 126069 / 106864) wDt → hydratePluginOptions (styles 126073 / 106871)
 *   TDt → summarizePluginOptions (styles 126077 / 106875) EDt → marketplaceSourceInput (styles 126087 / 106888)
 *   DDt → marketplaceSourcePayload (styles 126095 / 106896) ODt → loadPluginSyncCandidates (styles 126103 / 106909)
 *   kDt → isPluginSyncStoppedError (styles 126128 / 106948) ADt → stoppedPluginResult (styles 126131 / 106951)
 *   Y2  → emitPluginSyncProgress (styles 126143 / 106960) X2 → assertPluginSyncNotStopped (styles 126152 / 106971)
 *   Z2  → runCancellableRemoteStep (styles 126155 / 106974) jDt → isFileLikeOptionSchema (styles 126184 / 106992)
 *   MDt → isPortableOptionValue (styles 126187 / 106995) NDt → pickPortableOptions (styles 126198 / 107000)
 *   PDt → sameConfiguredOptions (styles 126205 / 107009) FDt → syncPluginOptions (styles 126209 / 107013)
 *   IDt → runPluginSyncPipeline (styles 126250 / 107053) LDt → runMarketplacePluginSync (styles 126292 / 107090)
 *   RDt → collectMarketplacePluginNames (styles 126362 / 107150) zDt → prepareMarketplaceSource (styles 126372 / 107160)
 *   BDt → formatInstallDiagnostics (styles 126410 / 107194) VDt → PluginSyncTitle (styles 126414 / 107198)
 *   HDt → PluginSyncShowExisting (styles 126443 / 107212) UDt → PluginSyncHeader (styles 126460 / 107223)
 *   WDt → PluginSyncSelectAll (styles 126483 / 107238) GDt → PluginSyncRowList (styles 126514 / 107259)
 *   KDt → PluginSyncStatusBadge (styles 126625 / 107287) qDt → PluginSyncLogTooltip (styles 126648 / 107302)
 *   JDt → PluginSyncProgressList (styles 126684 / 107329) YDt → PluginSyncResultView (styles 126796 / 107362)
 *   XDt → PluginSyncDialog     插件同步对话框 (styles 126843 / 107373)
 *
 *  §3 目录浏览器：
 *   OEt → buildReaddirParams (123946)  kEt → filterDirectories (123932)
 *   AEt → resolveFolderIconKind (123952) jEt → createRequestToken (123938)
 *   MEt → DirectoryBrowserDialog 目录浏览对话框（路径输入/隐藏目录/逐级进入）(123959)
 *
 *  §4 Onboarding：
 *   $4t → ONBOARDING_TASK_STAGGER_MS = 320 (207217)
 *   F9  → initialOnboardingState (207218) I9 → selectionKey (206941)
 *   e3t → defaultProviderCategories (207234) t3t → normalizeDiscovery (206947)
 *   n3t → defaultSelectedKeys (207254) r3t → discoveryToTasks (206971)
 *   i3t → parseSelectionKeys (207275) a3t → additionalSelectionsToTasks (206991)
 *   L9  → errorMessageText (207295) o3t → applyImportTaskResults (207008)
 *   s3t → useOnboardingDialogController (207309)
 *   c3t → ONBOARDING_WIZARD_STEPS (207578) l3t → onboardingStepTitleKey (207296)
 *   u3t → OnboardingStepRail (207602) d3t → OnboardingStepHeader (207372)
 *   f3t → OnboardingWizardFooter (207676) p3t → isSettingsImportStep (207511)
 *   m3t → ProjectSelectorHero (207780) h3t → OnboardingWelcomeView (207517)
 *   g3t → initialFinishExecution (207881) _3t → OnboardingSessionStep (207610)
 *   R9  → ImportSelectionStep (208084) v3t → MigrationProgressView (207797)
 *   y3t → MigrationCompleteView (208136) b3t → AgentsFileMigrationStep (207960)
 *   x3t → shouldAutoScanSessions (208363) S3t → buildSessionGroups (208086)
 *   C3t → useFinishExecution (208382) w3t → errorMessageText2 (208194)
 *   T3t → useAgentsFileMigration (208487)
 *   z9  → ONBOARDING_STEP_ORDER (208541) E3t → OnboardingDialog (208252)
 *
 *  §5 确认 / 警告对话框 + 宿主：
 *   H2  → ConfirmDialogStore (123497)  U2 → useConfirmDialog (123510)
 *   N9  → AlertDialogStore (206804)   G4t → AlertDialog (206527)
 *   K4t → AUTOMATION_CONFIRM_DIALOG_CLASS (206861)
 *   q4t → ConfirmDialog (206862)      P9 → AppDialogHost (206704)
 *   $3t → useAlertDialog (209940)
 *
 *  复用原语（本 chunk 内它族 / 跨 chunk，见 §0 声明）：
 *   zb/Hb/Ub/Gb/Kb/Wb/Vb → Dialog/Content/Header/Title/Description/Footer/Close (31943+ / 29335+)
 *   yq → Progress (76034)；uJ → Badge (80303)；s4t → ZCodeLogoSvg (205679)
 *   X=Button / P=Input / M=spinner(loader-circle) / g=IconX / wa=IconChevronRight（跨 chunk）
 *   Ia=Tooltip（usageStatsUiParts）；dN/fN/pN=HoverCard 三件（本 chunk jsx 49005）
 *   Zxe/$xe=Checkbox 原语；iO/oO/sO/cO=Select 四件（Radix 封装主块 28021-32245）
 *   图标（Sa=createLucideIcon，js 行）：M_ check 26849 | N_ chevron-down 26850 | C_ arrow-right 26697
 *   H_ cloud-upload 26961 | $_ folder 27181 | j_ calendar-days 26831 | F_ circle-alert 26860
 *   I_ circle-check 26869 | R_ circle-stop 26912 | yye circle-x 26916 | A_ cable 26798
 *   jv puzzle 27667 | Nv refresh-cw 27725 | Kv trash-2 27930 | Pye folder-symlink 27171
 *   Xve archive-x 26657 | Z_ file-text 27108 | N triangle-alert（跨 chunk 原语块）
 * ============================================================================
 */

import * as React from "react";
import { createLucideIcon } from './button'; // 原 c，button-laUijeDG.js（A0-D 接线：declare → button canonical）

declare global {
  interface ImportMeta {
    url: string;
  }
}

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk / 它族；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
/* ── tombstone（A0-D）：cn declare 删除 → import { cn } from './UtilsCn'（canonical）。 ── */

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
/* ── tombstone（A0-D）：IntlShape/useIntlContext 脚手架删除 → I18n useZCodeIntl（alias）+ type ZCodeIntl as IntlShape。 ── */

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/* ── tombstone（A0-D）：ButtonProps/Button declare 删除 → import { Button } from './button'（canonical，
 *    ButtonProps 为 loose Record；事件回调参数需显式标注，见各调用面）。 ── */
/** 原 P（imeComposition chunk 的 y 导出） */
/** spinner：loader-circle（原 M，imeComposition chunk 的 w 导出） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconLoaderCircle → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 关闭图标（原 g，button chunk） */
declare const IconX: React.FC<{ className?: string; strokeWidth?: number }>;
/** chevron-right（原 wa，button chunk） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconChevronRight → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* ── tombstone（A0-D）：IconProps/createLucideIcon declare 删除 → import { createLucideIcon } from './button'
 *    （canonical，iconNode: Array<[string, Record<string, unknown>]>，空数组调用面兼容）。 ── */
export const IconCheck = createLucideIcon("check", []);            // 原 M_
export const IconChevronDown = createLucideIcon("chevron-down", []); // 原 N_
export const IconArrowRight = createLucideIcon("arrow-right", []);   // 原 C_
export const IconCloudUpload = createLucideIcon("cloud-upload", []); // 原 H_
export const IconFolder = createLucideIcon("folder", []);            // 原 $_
export const IconCalendarDays = createLucideIcon("calendar-days", []); // 原 j_
export const IconCircleAlert = createLucideIcon("circle-alert", []);   // 原 F_
export const IconCircleCheck = createLucideIcon("circle-check", []);   // 原 I_
export const IconCircleStop = createLucideIcon("circle-stop", []);     // 原 R_
export const IconCircleX = createLucideIcon("circle-x", []);           // 原 yye
export const IconCable = createLucideIcon("cable", []);                // 原 A_
export const IconPuzzle = createLucideIcon("puzzle", []);              // 原 jv
export const IconRefreshCw = createLucideIcon("refresh-cw", []);       // 原 Nv
export const IconFolderSymlink = createLucideIcon("folder-symlink", []); // 原 Pye
export const IconFileText = createLucideIcon("file-text", []);         // 原 Z_
export const IconTriangleAlert = createLucideIcon("triangle-alert", []); // 原 N

/** Tooltip（原 Ia，usageStatsUiParts-CiR7YEhh.js 的 u 导出） */
/* ── tombstone（A0-D）：Tooltip declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'
 *    （调用面 open/title/description/side/align 均在其 props 面内）。 ── */
/** HoverCard 三件（原 dN/fN/pN，本 chunk jsx 49005） */
/* ── tombstone（A0-S3c）：CheckboxIndicator、CheckboxRoot、Dialog、DialogClose、DialogContent、DialogDescription、DialogFooter、DialogHeader、DialogTitle、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuTrigger、HoverCard、HoverCardContent、HoverCardTrigger、ProgressIndicator、ProgressRoot、Slot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */



/** Radix Dialog 封装族（原 zb/Hb/Ub/Gb/Kb/Wb/Vb，本 chunk 31943+ / jsx 29335+） */








/** Radix Progress 原语（原 XTe/ZTe，Radix 封装主块） */



/** Radix Checkbox 原语（原 Zxe/$xe，Radix 封装主块） */



/** Radix Select 四件（原 iO/oO/sO/cO，Radix 封装主块） */

/** Badge（原 uJ，本 chunk 80303 / jsx 70704） */

/** asChild 槽位助手（原 Gre，dist-vnZIbudW.js） */



/** Hero 文案尺寸（原 S4t，本 chunk 206090）与 Hero 卡片壳（原 C4t，206094） */
/* ── tombstone（A0-D）：useHeroTextSizes declare 删除 → ModalsLeaves useHeroThemeStyles（alias；
 *    返回 HeroThemeStyles 含 heading/description，调用面 4174 兼容）。 ── */


/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings/modal 域）——原 §1–§5 组件单元已原样迁入
 *   components/modals/，此处为薄 re-export shim；导入方零改动〕
 *   §1 更新对话框子族（COt）        → components/modals/UpdateStatusDialog.tsx
 *   §2 远程同步对话框子族（r4 族）  → components/modals/RemoteSyncDialogs.tsx
 *   §3 目录浏览器子族（MEt）        → components/modals/DirectoryBrowserDialog.tsx
 *   §4 Onboarding 对话框子族（E3t） → components/modals/OnboardingDialog.tsx
 *   §5 确认/警告对话框 + 模态宿主   → components/modals/ConfirmDialog.tsx
 * §0 图标常量（createLucideIcon 产物）留存本文件并补 export（各族经 shim import，
 * 避免常量跨文件复制）；BaseServices/DirectoryEntry 随 DirectoryBrowser 族迁入，
 * 会话迁移/导入选择声明群随 Onboarding 族迁入；SettingsSyncService 于族文件补 export（型别面）。
 * §6/§7 登记留存本文件。
 * ==========================================================================*/

export { UpdateStatusDialog, Progress } from '../components/modals/UpdateStatusDialog';
export type { UpdateDialogPhase } from '../components/modals/UpdateStatusDialog';

export {
  canOpenRemoteSessionSourceCheck,
  remoteSyncTargetLabel, // 〔A1-R50〕+q2（styles 125207）：Skills/Plugins/Mcp 三活面 declare 改指
  RemoteSyncDropdownButton,
  RemoteSyncDialogs,
} from '../components/modals/RemoteSyncDialogs';
export type { RemoteTarget } from '../components/modals/RemoteSyncDialogs';

export { DirectoryBrowserDialog } from '../components/modals/DirectoryBrowserDialog';
export type { BaseServices } from '../components/modals/DirectoryBrowserDialog';

export { OnboardingDialog } from '../components/modals/OnboardingDialog';

export { useConfirmDialog, useAlertDialog, ConfirmDialog, AppDialogHost } from '../components/modals/ConfirmDialog';
export type { ConfirmDialogRequest, AlertDialogRequest } from '../components/modals/ConfirmDialog';

/* ============================================================================
 * 6. WorkspaceActionError 呈现登记（原 j6t 返回，js 210486-210765）
 * ----------------------------------------------------------------------------
 * 结论（逐行核对）：j6t（useWorkspaceActions）以 useState 持有
 * `workspaceActionError`（js 210507 [y,b]），并随 return 暴露（210678）；
 * 唯一调用方 g8t（212837-212852）只解构 setWorkspaceActionError（qe），
 * 值侧在本构建 **无任何呈现层**（全 chunk 搜 workspaceActionError 仅 210678 一处）。
 * 置位点：
 *  - js 210549：startNewTaskFromActiveWorkspace 无活动工作区 →
 *    `workspace.noActiveForNewTask`
 *  - js 210447（O6t ensureConversationWorkspace 失败）→ 原始 error.message
 *  - js 213098（g8t 启动兜底 ensureConversationWorkspace 失败）→ 原始 error.message
 *  - 清零点：210437/210444（O6t）、212882（activeWorkspacePath 变化时 qe(null)）
 * 呈现侧现状 = 无对话框/toast 消费；若重建需自接（建议 AlertDialog N9 或 toast）。
 * ==========================================================================*/

/** 原 j6t 的接口面（仅登记状态接线，不重复 g8t 装配） */
export interface WorkspaceActionsModel {
  /** js 210678：状态值（本构建无呈现层） */
  workspaceActionError: string | null;
  setWorkspaceActionError: (message: string | null) => void;
  startDraftInWorkspace: (workspacePath: string, workspaceIdentity?: string) => void;
  startNewTaskFromActiveWorkspace: (reason: string, workspaceIdentity?: string) => void;
  handleLogout: () => Promise<void> | void;
  handleSelectProject: (path: string) => void;
  handleSelectConversationWorkspace: (path: string) => void;
  handleResolveConversationWorkspace: () => Promise<string>;
  handleEnsureConversationWorkspace: () => Promise<string>;
  handleCreateConversationTask: () => Promise<void>;
  handleOpenWorkspace: () => void;
  handleOpenFolderFromWorkspaceMenu: () => void;
  handleCreateScratchWorkspace: () => Promise<void> | void;
  handleCreateTask: () => void;
  handleBackFromSettings: () => void;
}

/* ============================================================================
 * 7. 跳过项登记
 * ----------------------------------------------------------------------------
 * - wCt useSessionSubscriptionErrorReporter（配额/订阅错误上报，js 118647 / jsx 100899）
 *   已在 Conversation 族登记（ConversationOverlays.tsx §钩子），本文件不重复。
 * - j6 TaskRenameDialog（js 142581 / jsx 118551）已在 TopBar.tsx，不重复。
 * ==========================================================================*/

