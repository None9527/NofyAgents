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
 * §A 子代理分区深层叶子（F06；SettingsPanelsCapability §1.4 接口级，js 196654–197541）：
 *   q7/b1t/x1t/J7/Y7/S1t/C1t → 颜色表/色类映射/锁判定常量/inherit/全工具表/关注工具集 (196654–196660)
 *   w1t → collectEditableAgents (196661) | X7 → isUserManagedSubagent (196667)
 *   T1t → isBuiltInSubagent (196670)      | E1t → builtInSubagentName (196673)
 *   D1t/O1t → 工具表拆分（已知/保留）(196676/196679) | k1t → mergeToolSelections (196682)
 *   A1t → isInheritAllTools (196686)     | j1t → normalizeSelectedModel (196689)
 *   M1t → isSameModelRef (196693)        | N1t → resolveThoughtLevelOption (196697)
 *   P1t → isThoughtLevelAvailable (196730) | Z7 → isModelAvailableInGroups (196736)
 *   Q7 → subagentFormDraftOf (196740)    | F1t → subagentFormKeyOf (196754)
 *   $7 → resolveModelTriggerLabel (196757) | e9 → SubagentFormLabel (196765)
 *   I1t → SubagentColorDot (196771)      | t9 → SubagentBadge (196777)
 *   L1t → groupSubagents (196786)        | R1t → subagentScopeI18nId (196792)
 *   z1t → ToolCheckboxRow (196801)       | n9 → SubagentRow (196839)
 *   B1t → BuiltInModelOverrideControl (196982) | V1t → SubagentConfigForm (197122)
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

import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { AlertDialog as AlertDialogRoot } from '../components/ui/alert-dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Corner as ScrollAreaCorner, Root as ScrollAreaRoot, Scrollbar as ScrollAreaScrollbar, Thumb as ScrollAreaThumb, Viewport as ScrollAreaViewport } from '@radix-ui/react-scroll-area'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ArrowLeft as IconArrowLeft, ArrowRight as IconArrowRight, ChevronDown as IconChevronDown, ChevronUp as IconChevronUp, Check as IconCheck, Plus as IconPlus, Ellipsis as IconEllipsis, Trash2 as IconTrash, Pencil as IconPencil, ExternalLink as IconExternalLink, RefreshCw as IconRefresh, CloudUpload as IconCloudUpload, Search as IconSearch, Settings as IconSettings, Puzzle as IconPuzzle, MessageSquarePlus as IconMessageSquarePlus, Play as IconPlay, CirclePlay as IconCirclePlay, Pause as IconPause, Activity as IconActivity, Info as IconInfo, TriangleAlert as IconAlertTriangle, Target as IconTarget, File as IconFile, List as IconList, RotateCcw as IconRestart, LoaderCircle as IconSpinner, Users as IconUsers, FolderOpen as IconFolderOpen, Power as IconPower, Server as IconServer, Sparkle as IconSparkle, TerminalSquare as IconTerminalSquare, Bot as IconBot, Webhook as IconWebhook, ArrowUpRight as IconArrowUpRight } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { ModelSelector, type ModelGroup } from './Composer'; // 原 vq（F08，js 75527；A0-CLEANUP2 item 10 接线：declare → Composer 属主导出）
import { Input, Popover, PopoverContent, PopoverTrigger, toast } from './ImeComposition';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, BackLinkButton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Tabs, TabsList, TabsTrigger } from './Settings';
import { ResourceEnabledFilterSelect } from './SettingsPanelsCapability';
import { useServices } from './services';
import { usePluginsStore, type PluginService } from './stores-workspace'; // A0-CLEANUP3 3b：useUninstallFlow 服务面具型
import { cn } from './UtilsCn';
import { useZCodeIntl as useIntlContext } from './I18n';
import { t as logger } from './logger';
import { useConfirmDialog } from './Modals'; // U2
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // Ia
import { isComposingText as imeGuard } from './ImeComposition'; // A
import { parseCustomModelId as parseModelValue } from './SkillStore'; // se（src chunk）
import { isGlmModelId as isMaxThinkingModel, GLM_REASONING_LEVELS as MAX_THINKING_LEVELS } from './SrcSharedA'; // qn（F12）/ ui=Sl（A0-CLEANUP B-8：MAX_THINKING_LEVELS declare 改指 GLM_REASONING_LEVELS）
import {
  automationsWorkspaceKey as workspaceKey, // Ti（src chunk ip，6913；A0-CLEANUP 族清理：对象参工作区键）
  joinTestidParts as testidTemplate, // Xa
  parseCustomModelRef as parseCustomModelKey, // Zn（src chunk B）
  subagentRowTestid as TESTID_SUBAGENT_ROW, // Ite
  subagentBuiltInModelTriggerTestid as TESTID_SUBAGENT_MODEL, // Gn
  automationFormSubmitTestid as TESTID_AUTOMATION_SAVE, // $t
  automationRunNowTestid as TESTID_AUTOMATION_RUN_NOW, // bn
  automationCardMenuTestid as TESTID_AUTOMATION_ROW_MENU, // at
  automationActionToggleTestid as TESTID_AUTOMATION_TOGGLE, // Xn
  automationActionDeleteTestid as TESTID_AUTOMATION_DELETE, // Et
  automationEditBackTestid as TESTID_AUTOMATION_BACK, // dt
  automationFormTitleTestid as TESTID_AUTOMATION_TITLE, // Rr
  automationSchedulePreviewTestid as TESTID_AUTOMATION_SCHEDULE_BOX, // _ee
  automationScheduleDeleteTestid as TESTID_AUTOMATION_SCHEDULE_DELETE, // mn
  automationScheduleAddTestid as TESTID_AUTOMATION_SCHEDULE_ADD, // Tne
  automationFrequencySelectTestid as TESTID_AUTOMATION_FREQUENCY, // Kt
  automationCustomRepeatEditTestid as TESTID_AUTOMATION_CUSTOM_FREQUENCY, // Dn
  automationFormPromptTestid as TESTID_AUTOMATION_PROMPT, // ree
  automationFrequencyOptionTestid as TESTID_FREQUENCY_OPTION, // Kr
  automationCustomIntervalSelectTestid as TESTID_CUSTOM_INTERVAL_INPUT, // sn
  automationCustomIntervalIncrementTestid as TESTID_CUSTOM_INTERVAL_INC, // zt
  automationCustomIntervalDecrementTestid as TESTID_CUSTOM_INTERVAL_DEC, // ir
  automationCustomUnitSelectTestid as TESTID_CUSTOM_UNIT, // bre
  automationCustomUnitOptionTestid as TESTID_CUSTOM_UNIT_OPTION, // _r
  automationCustomConfirmTestid as TESTID_CUSTOM_CONFIRM, // Un
  automationYearMonthdayTestid as TESTID_ENDDATE_TRIGGER, // wee
  automationYearMonthOptionTestid as TESTID_MONTH_OPTION, // ur
  automationYearDayOptionTestid as TESTID_DAY_OPTION, // dee
  offpeakEditSubmitTestid as TESTID_OFFPEAK_SUBMIT, // Nn
  offpeakFormTitleTestid as TESTID_OFFPEAK_TITLE, // Rt
  offpeakFormInstructionsTestid as TESTID_OFFPEAK_PROMPT, // nr
  offpeakCreateButtonTestid as TESTID_OFFPEAK_CREATE, // Mte
  offpeakCardMenuTestid as TESTID_OFFPEAK_MENU, // rt
  automationCreateManuallyTestid as TESTID_CREATE_MANUALLY, // Nte
  automationCreateMenuTestid as TESTID_CREATE_MORE, // Fn
} from './SrcSharedB';

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/** ES2023 Array.toSorted（bundle 目标含 es2023；tsconfig lib 未含，按接口级补齐） */
declare global {
  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[];
  }
}


/* --- 图标（lucide 风格；Sa=createLucideIcon 工厂，button chunk / 本 chunk 图标块） --- */
type IconComponent = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（10）：IconArrowLeft/IconArrowRight/IconChevronDown/IconChevronUp/IconChevronLeft/IconChevronRight/IconCheck/IconPlus/IconEllipsis/IconTrash → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: IconComponent; // g（imeComposition b）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（12）：IconPencil/IconExternalLink/IconRefresh/IconCloudUpload/IconSearch/IconSettings/IconPuzzle/IconMessageSquarePlus/IconPlay/IconCirclePlay/IconPause/IconActivity → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconStar: IconComponent; // Wv
declare const IconCalendar: IconComponent; // j_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（6）：IconInfo/IconAlertTriangle/IconTarget/IconFile/IconList/IconRestart → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconExternalSession: IconComponent; // P3 包装 = q_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconSpinner → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconSpinnerAlt: React.FC<{ className?: string }>; // EN（运行历史加载）

/* --- UI 原语（本 chunk 横切层，类名逐字引用） --- */
export interface SelectItemEntry {
  key?: string;
  value: string;
  name?: string;
  [key: string]: unknown;
}
export interface SelectGroupEntry {
  key?: string;
  label?: string;
  items: SelectItemEntry[];
  [key: string]: unknown;
}
/* ── tombstone（A0-S3c）：AlertDialogRoot、Dialog、DialogClose、DialogContent、DialogDescription、DialogFooter、DialogHeader、DialogTitle、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger、ScrollAreaCorner、ScrollAreaRoot、ScrollAreaScrollbar、ScrollAreaThumb、ScrollAreaViewport declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */

















/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'。 ── */
declare function usePlatformService(): {
  openExternal(url: string): void;
  selectDirectory(): Promise<string | null>;
  canSelectFilePath?: boolean;
  getPathForFile?: (file: File) => string | null;
} | null; // l
export interface ToastOptions {
  durationMs?: number;
  position?: string;
  variant?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  anchorId?: string;
  [key: string]: unknown;
}
declare function useAppSettings(): {
  settings: { keepAwakeWhileRunning?: boolean; [key: string]: unknown } | null;
  update(patch: Record<string, unknown>): Promise<void> | void;
}; // JM 53440
declare function useWorkspaceTabsStore<T>(selector: (state: { tabs: WorkspaceTab[] }) => T): T; // pc 4753
declare function isUsableWorkspaceTab(tab: WorkspaceTab): boolean; // oc
declare const WorkspaceSelectRow: React.FC<{
  workspacePath: string;
  workspaceTabs: Array<{ workspacePath: string; label: string; workspaceIdentity?: string; workspacePurpose?: string }>;
  allowConversationWorkspaceSelection: boolean;
  allowConversationWorkspaceDetach?: boolean;
  onSelectWorkspace: (entry: { workspacePath: string }) => void;
  onSelectConversationWorkspace: () => void;
  allowOpenWorkspace: boolean;
  allowRemoteWorkspace: boolean;
  onOpenFolder: () => void;
  onConnectRemote: () => Promise<string>;
  onSelectRemoteProject: () => Promise<void>;
  onCancelRemoteProject: (entry: unknown) => Promise<void>;
  containerClassName?: string;
  triggerClassName?: string;
  triggerIndicator?: React.ReactNode;
}>; // a4（Home.tsx，js 128568）
declare const ModeSelector: React.FC<{
  option: ConfigOption | null;
  provider?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  triggerVariant?: string;
  triggerSize?: string;
  triggerClassName?: string;
  labelVisibilityClassName?: string;
  restoreFocusSelector?: string | null;
}>; // Mq（F12，js 76864）
declare const ThoughtLevelSelector: React.FC<{
  intl: IntlShape;
  option: ConfigOption;
  provider?: string;
  showInvalidCurrentValue?: boolean;
  disabled?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  restoreFocusSelector?: string | null;
  labelVisibilityClassName?: string;
  indicatorClassName?: string;
  triggerClassName?: string;
  interactionMode?: string;
  onValueChange: (value: string) => void;
}>; // Pq（F08，js 77118）
declare function useWorkspaceConfigOptions(
  workspacePath: string,
  unused: null,
  workspaceIdentity?: string,
): { configOptions: ConfigOption[]; status: string }; // Jq（F12，js 78389）
/* ── tombstone（A0-CLEANUP B-8）：MAX_THINKING_LEVELS declare 删除 → import
 *    { GLM_REASONING_LEVELS as MAX_THINKING_LEVELS } from './SrcSharedA'（原 ui=Sl）。 ── */
declare function resolveModelGroupLabel(args: {
  modelGroups: SelectGroupEntry[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string;
  providerName?: string;
}): string; // iN（F08）
declare function normalizeSettingsOptions(options: unknown[]): ConfigOption[]; // oee（F12）
declare function pluginMentionMarkdown(displayName: string, pluginId: string): string; // Dj（F19，js 52090）

export interface ConfigOption {
  id: string;
  name: string;
  category: string;
  type: string;
  currentValue?: unknown;
  options?: Array<{ value: string; name: string }>;
  [key: string]: unknown;
}
interface WorkspaceTab {
  workspacePath: string;
  label?: string;
  workspaceIdentity?: string | null;
  workspacePurpose?: string;
  availability?: string;
  remoteSessionId?: string | null;
  remoteTarget?: string | null;
  [key: string]: unknown;
}
interface AgentService {
  createSession(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    persistence: string;
    model: { providerId: string; modelId: string };
  }): Promise<{ session: { sessionId: string }; settings: unknown }>;
  closeSession(args: { workspacePath: string; workspaceIdentity?: string | null; sessionId: string }): Promise<void>;
  [method: string]: unknown;
}
interface PluginsStoreState {
  uninstallPlugin(pluginId: string, pluginService: unknown): Promise<void>;
  [key: string]: unknown;
}

/* A0-CLEANUP2 item 10：ModelSelector declare 删除 → import { ModelSelector, type ModelGroup } from './Composer'（属主导出，原 vq，js 75527）。
   调用面 SelectGroupEntry[] 与属主 ModelGroup[] 之间按边界 as ModelGroup[] 桥接（单 as 合法，可比性已验证）。 */

/* ============================================================================
 * §A. 子代理分区深层叶子（原 js 196654–197541）
 * ==========================================================================*/

export interface SubagentItem {
  id?: string;
  name: string;
  description?: string;
  model?: string | null;
  modelOverride?: string | null;
  thoughtLevel?: string | null;
  thoughtLevelOverride?: string | null;
  path?: string;
  scope: string;
  source: string;
  enabled: boolean;
  readOnly?: boolean;
  color?: string;
  tools?: string[];
  disallowedTools?: string[];
  skills?: string[];
  permissionMode?: string;
  maxTurns?: number;
  background?: boolean;
  mcpServers?: unknown;
  systemPrompt?: string;
  injectAgentsMd?: boolean;
  [key: string]: unknown;
}

/** 原 q7（196654）：颜色表（WQ 105114 展开） */
export const SUBAGENT_COLORS = ["yellow", "red", "orange", "green", "cyan", "blue", "purple", "pink"] as const;
/** 原 b1t（196655，qft 105115）：颜色 → 类名 */
export const SUBAGENT_COLOR_CLASSES: Record<string, string> = {
  blue: "bg-sky-300 text-sky-900 dark:bg-sky-400/32 dark:text-sky-50",
  cyan: "bg-cyan-300 text-cyan-900 dark:bg-cyan-400/32 dark:text-cyan-50",
  green: "bg-emerald-300 text-emerald-900 dark:bg-emerald-400/32 dark:text-emerald-50",
  orange: "bg-orange-300 text-orange-900 dark:bg-orange-400/32 dark:text-orange-50",
  pink: "bg-pink-300 text-pink-900 dark:bg-pink-400/32 dark:text-pink-50",
  purple: "bg-violet-300 text-violet-900 dark:bg-violet-400/32 dark:text-violet-50",
  red: "bg-rose-300 text-rose-900 dark:bg-rose-400/32 dark:text-rose-50",
  yellow: "bg-amber-300 text-amber-900 dark:bg-amber-300/32 dark:text-amber-50",
};
/** 原 x1t（196656）：模型项锁定判定（子代理域恒否） */
export const subagentModelNeverLocked = (): boolean => false;
/** 原 J7（196657）：继承哨兵值 */
export const SUBAGENT_MODEL_INHERIT = "inherit";
/** 原 Y7（196658）：可选工具全集 */
export const SUBAGENT_TOOL_OPTIONS = ["Read", "Grep", "Glob", "Bash", "Edit", "Write", "WebFetch", "WebSearch", "TodoWrite"];
const SUBAGENT_TOOL_OPTION_SET = new Set(SUBAGENT_TOOL_OPTIONS);
/** 原 C1t（196660）：高关注工具（红点） */
const SUBAGENT_ATTENTION_TOOLS = new Set(["Bash", "Edit", "Write"]);

/** 原 w1t（196661）：可编辑代理集（用户域非插件 + 插件域非工作区） */
export function collectEditableAgents(args: { agents: SubagentItem[]; pluginAgents: SubagentItem[] }): SubagentItem[] {
  return [
    ...args.agents.filter((agent) => agent.scope !== "workspace" && agent.source !== "plugin"),
    ...args.pluginAgents.filter((agent) => agent.scope !== "workspace"),
  ];
}

/** 原 X7（196667）：用户管理判定（user 域 ∧ user 源 ∧ 非只读） */
export function isUserManagedSubagent(agent: SubagentItem): boolean {
  return agent.scope === "user" && agent.source === "user" && agent.readOnly !== true;
}

/** 原 T1t（196670）：内置判定 */
export function isBuiltInSubagent(agent: SubagentItem): boolean {
  return agent.scope === "built-in" || agent.source === "built-in";
}

/** 原 E1t（196673）：内置名（仅 general-purpose/Explore） */
export function builtInSubagentName(agent: SubagentItem): string | null {
  return isBuiltInSubagent(agent) && (agent.name === "general-purpose" || agent.name === "Explore") ? agent.name : null;
}

/** 原 D1t（196676）：已知工具过滤 */
export function filterKnownTools(tools: string[] | undefined): string[] {
  return tools?.filter((tool) => SUBAGENT_TOOL_OPTION_SET.has(tool)) ?? [];
}

/** 原 O1t（196679）：保留工具过滤（未知工具） */
export function filterPreservedTools(tools: string[] | undefined): string[] {
  return tools?.filter((tool) => !SUBAGENT_TOOL_OPTION_SET.has(tool)) ?? [];
}

/** 原 k1t（196682）：工具选择合并（去空去重；空 → undefined） */
export function mergeToolSelections(selected: string[], preserved: string[]): string[] | undefined {
  const merged = [...selected, ...preserved].filter((tool, index, all) => tool.length > 0 && all.indexOf(tool) === index);
  return merged.length > 0 ? merged : undefined;
}

/** 原 A1t（196686）：全工具继承判定（空/缺省/含 `*`） */
export function isInheritAllTools(tools: string[] | undefined): boolean {
  return !tools || tools.length === 0 || tools.some((tool) => tool.trim() === "*");
}

/** 原 j1t（196689）：选中模型归一（非 inherit 的有效值） */
export function normalizeSelectedModel(model: string | null | undefined): string | undefined {
  const normalized = (model ?? "").trim();
  return normalized && normalized !== SUBAGENT_MODEL_INHERIT ? normalized : undefined;
}

/** 原 M1t（196693）：模型引用等价（供应商 ∧ 模型 id；原用 Mg 解析，恒非空） */
export function isSameModelRef(value: string, ref: { providerId?: string; modelId?: string }): boolean {
  const parsed = parseModelRef(value);
  return parsed.providerId === ref.providerId && parsed.modelId === ref.modelId;
}

export interface ThoughtLevelResolution {
  kind: "supported" | "unsupported" | "unknown";
  option: ConfigOption | null;
}

/** 原 N1t（196697）：思考级别选项解析（工作区域走配置项；无工作区走供应商模型表） */
export function resolveThoughtLevelOption(args: {
  hasWorkspace: boolean;
  model: string | undefined;
  modelProviders: Array<{ id: string; [key: string]: unknown }>;
  modelProvidersLoading: boolean;
  thoughtLevel?: string;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}): ThoughtLevelResolution {
  const model = normalizeSelectedModel(args.model);
  if (!model) return { kind: "unsupported", option: null };
  const parsed = parseModelRef(model);
  const thoughtLevel = args.thoughtLevel?.trim();
  if (args.hasWorkspace) {
    if (args.workspaceConfigStatus !== "ready") return { kind: "unknown", option: null };
    const modelOption = args.workspaceConfigOptions
      .find((option) => option.type === "select" && (option.category === "model" || option.id === "model"))
      ?.options?.find((option) => isSameModelRef(option.value, parsed));
    const levels = (modelOption as { modelThoughtLevels?: string[] } | undefined)?.modelThoughtLevels;
    if (levels === undefined) return { kind: "unknown", option: null };
    if (levels.length === 0) return { kind: "unsupported", option: null };
    const defaultLevel = (modelOption as { modelDefaultThoughtLevel?: string } | undefined)?.modelDefaultThoughtLevel;
    const current = defaultLevel && levels.includes(defaultLevel) ? defaultLevel : levels[0];
    return {
      kind: "supported",
      option: {
        id: "thought_level",
        name: "Thought Level",
        category: "thought_level",
        type: "select",
        currentValue: thoughtLevel ?? current,
        options: levels.map((level) => ({ value: level, name: level })),
      },
    };
  }
  if (args.modelProvidersLoading) return { kind: "unknown", option: null };
  const providerOption = resolveProviderThoughtOption(args.modelProviders, parsed.providerId, parsed.modelId);
  return providerOption
    ? { kind: "supported", option: thoughtLevel ? { ...providerOption, currentValue: thoughtLevel } : providerOption }
    : { kind: "unsupported", option: null };
}

/** F12 域助手（原 zrt，89174；接口级）：供应商模型 → 思考级别选项 */
declare function resolveProviderThoughtOption(
  providers: Array<{ id: string; [key: string]: unknown }>,
  providerId: string | undefined,
  modelId: string | undefined,
): ConfigOption | null;

/** 原 P1t（196730）：思考级别可用性（未知态恒可；选项集成员判定） */
export function isThoughtLevelAvailable(resolution: ThoughtLevelResolution, thoughtLevel: string | undefined): boolean {
  const normalized = thoughtLevel?.trim();
  return !normalized || resolution.kind === "unknown"
    ? true
    : !!(resolution.option?.type === "select" && resolution.option.options?.some((option) => option.value === normalized));
}

/** 原 Z7（196736）：模型在组内可用（继承/加载中恒真） */
export function isModelAvailableInGroups(groups: SelectGroupEntry[], model: string | null | undefined, loading = false): boolean {
  const normalized = model?.trim();
  return !normalized || normalized === SUBAGENT_MODEL_INHERIT || loading ? true : groups.some((group) => group.items.some((item) => item.value === normalized));
}

export interface SubagentFormDraft {
  name: string;
  description: string;
  color: string;
  model: string;
  thoughtLevel?: string;
  injectAgentsMd: boolean;
  inheritAllTools: boolean;
  selectedTools: string[];
  preservedTools: string[];
  systemPrompt: string;
}

/** 原 Q7（196740）：表单草稿（缺省：黄/inherit/注入 AGENTS.md/全工具） */
export function subagentFormDraftOf(initial: SubagentItem | undefined): SubagentFormDraft {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    color: initial?.color ?? "yellow",
    model: initial?.model?.trim() || SUBAGENT_MODEL_INHERIT,
    thoughtLevel: initial?.thoughtLevel?.trim() || undefined,
    injectAgentsMd: initial?.injectAgentsMd ?? true,
    inheritAllTools: initial?.tools === undefined || initial.tools.length === 0,
    selectedTools: filterKnownTools(initial?.tools),
    preservedTools: filterPreservedTools(initial?.tools),
    systemPrompt: initial?.systemPrompt ?? "",
  };
}

/** 原 F1t（196754）：表单键（id + 草稿序列化；重置侦测用） */
export function subagentFormKeyOf(initial: SubagentItem | undefined): string {
  return JSON.stringify({ id: initial?.id ?? null, ...subagentFormDraftOf(initial) });
}

/** 原 $7（196757）：模型触发器标签（inherit/可用/不可用三支） */
export function resolveModelTriggerLabel(args: {
  inheritLabel: string;
  modelGroups: SelectGroupEntry[];
  model: string | null | undefined;
  modelProvidersLoading: boolean;
  selectModelLabel: string;
}): string {
  const normalized = args.model?.trim();
  return !normalized || normalized === SUBAGENT_MODEL_INHERIT
    ? args.inheritLabel
    : isModelAvailableInGroups(args.modelGroups, normalized, args.modelProvidersLoading)
      ? findModelGroupItemLabel(args.modelGroups, normalized) ?? normalized
      : args.selectModelLabel;
}

/** 组内条目标签查找（原 w6e，F08 域；接口级） */
declare function findModelGroupItemLabel(groups: SelectGroupEntry[], value: string): string | null;

/** 原 dr（src chunk Jx，9036；Wx 别名→规范供应商表，9025）：已知供应商别名解析 */
declare function canonicalProviderIdOf(providerId: string): string | null;

/** 原 rN（styles jsx 48436）：供应商前缀模型名——已知别名供应商不加前缀，否则 `供应商名/模型名` */
function composeProviderModelLabel(providerId: string | null | undefined, providerName: string | null | undefined, modelName: string | undefined): string | undefined {
  if (providerId && canonicalProviderIdOf(providerId)) return modelName;
  const trimmedName = providerName?.trim();
  return trimmedName ? `${trimmedName}/${modelName}` : modelName;
}

/** 原 iN（styles jsx 48441）：规范值全标签——组内命中走 rN 拼接，未命中回退 */
function resolveModelFullLabel(args: {
  modelGroups: SelectGroupEntry[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string | null;
  providerName?: string | null;
}): string | undefined {
  const group = args.modelGroups.find((entry) => entry.items.some((item) => item.value === args.normalizedValue));
  const item = group?.items.find((entry) => entry.value === args.normalizedValue);
  return !group || !item ? args.fallbackLabel : composeProviderModelLabel(args.providerId, args.providerName, item.name);
}

/** 原 nWe（styles jsx 48452）：composer 模型触发器标签三元面（PaymentDeep ModelSelectMenu 消费） */
export function resolveModelTriggerLabelParts(args: {
  modelGroups: SelectGroupEntry[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string | null;
  providerName?: string | null;
}): { fullLabel: string | undefined; providerPrefix?: string; modelLabel: string | undefined } {
  const fullLabel = resolveModelFullLabel(args);
  const group = args.modelGroups.find((entry) => entry.items.some((item) => item.value === args.normalizedValue));
  const item = group?.items.find((entry) => entry.value === args.normalizedValue);
  if (!group || !item) return { fullLabel: fullLabel, modelLabel: args.fallbackLabel };
  const modelLabel = item.name;
  const providerName = args.providerName?.trim();
  return !providerName || (args.providerId && canonicalProviderIdOf(args.providerId))
    ? { fullLabel: fullLabel, modelLabel: modelLabel }
    : { fullLabel: fullLabel, providerPrefix: `${providerName}/`, modelLabel: modelLabel };
}

/** 原 e9（196765）：表单标签 */
export function SubagentFormLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-ui-base font-medium text-foreground-subtle">{children}</label>;
}

/** 原 I1t（196771）：颜色点 */
export function SubagentColorDot({ color }: { color?: string }) {
  return (
    <span
      className={cn("inline-flex size-2 shrink-0 rounded-full", color ? SUBAGENT_COLOR_CLASSES[color] : "bg-foreground-subtlest")}
      aria-hidden="true"
    />
  );
}

/** 原 t9（196777）：次级徽章 */
export function SubagentBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 items-center rounded-md bg-secondary px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 原 L1t（196786）：三组分组（user/plugin/builtIn） */
export function groupSubagents(agents: SubagentItem[]): { user: SubagentItem[]; plugin: SubagentItem[]; builtIn: SubagentItem[] } {
  const groups: { user: SubagentItem[]; plugin: SubagentItem[]; builtIn: SubagentItem[] } = { builtIn: [], plugin: [], user: [] };
  for (const agent of agents) {
    if (isUserManagedSubagent(agent)) groups.user.push(agent);
    else if (agent.source === "plugin") groups.plugin.push(agent);
    else groups.builtIn.push(agent);
  }
  return groups;
}

/** 原 R1t（196792）：作用域 i18n key */
export function subagentScopeI18nId(agent: SubagentItem): string {
  return agent.scope === "built-in"
    ? "settings.subagents.scope.builtIn"
    : agent.scope === "workspace"
      ? "settings.subagents.scope.workspace"
      : agent.source === "plugin"
        ? "settings.subagents.scope.plugin"
        : "settings.scope.user";
}

/** 原 z1t（196801）：工具复选行（自绘 checkbox；高关注工具红点） */
export function ToolCheckboxRow({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-hover",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-sm border transition-colors",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-input-border bg-input text-transparent",
          )}
        >
          <IconCheck className="size-3.5" />
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate text-ui-base font-medium text-foreground">{label}</span>
      {SUBAGENT_ATTENTION_TOOLS.has(label) ? (
        <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
      ) : null}
    </button>
  );
}

/** 原 Mg（24358，模型域；接口级）：模型引用解析（Zn custom: 前缀 → providerId/modelId；否则按 `/` 拆分，`$` 变体） */
declare function parseModelRef(value: string): { providerId?: string; modelId?: string; variant?: string };

export interface ModelProvider {
  id: string;
  name?: string;
  source?: string;
  [key: string]: unknown;
}

/**
 * 原 n9（196839）：SubagentRow。
 * 头像（颜色点）+ 名称/作用域/模型/工具徽章 + 描述 + 路径；
 * 内置行 → B1t 覆盖控件；用户行 → 开关/编辑/删除。
 */
export function SubagentRow({
  agent,
  hasWorkspace,
  isOperating,
  modelGroups,
  modelProviders,
  modelProvidersLoading,
  modelSelectGroups,
  onBuiltInModelChange,
  onDelete,
  onEdit,
  onToggle,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  agent: SubagentItem;
  hasWorkspace: boolean;
  isOperating: boolean;
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  modelSelectGroups: SelectGroupEntry[];
  onBuiltInModelChange: (agent: SubagentItem, override: { model?: string | null; thoughtLevel?: string | null }) => Promise<void>;
  onDelete: (agent: SubagentItem) => Promise<void>;
  onEdit: (agent: SubagentItem) => void;
  onToggle: (agent: SubagentItem, enabled: boolean) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const userManaged = isUserManagedSubagent(agent);
  const builtInName = builtInSubagentName(agent);
  const notBuiltIn = !isBuiltInSubagent(agent);
  const inheritLabel = intl.formatMessage({ id: "settings.subagents.model.inherit" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const modelLabel = resolveModelTriggerLabel({
    inheritLabel,
    modelGroups: modelSelectGroups,
    model: agent.model,
    modelProvidersLoading,
    selectModelLabel,
  });
  const toolCount = agent.tools?.length ?? 0;
  const toolsLabel = isInheritAllTools(agent.tools)
    ? intl.formatMessage({ id: "settings.subagents.tools.all" })
    : intl.formatMessage({ id: "settings.subagents.toolsCount" }, { count: String(toolCount) });
  return (
    <div
      data-testid={testidTemplate(TESTID_SUBAGENT_ROW, agent.name)}
      className={cn(
        "grid items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover",
        builtInName
          ? "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid-cols-[auto_minmax(0,1fr)_auto]",
      )}
    >
      <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle" aria-hidden="true">
        <IconUsers className="size-4" />
        {agent.color ? (
          <span className="absolute -bottom-1 -right-1 inline-flex size-3.5 items-center justify-center rounded-full border border-card bg-card p-px leading-none">
            <SubagentColorDot color={agent.color} />
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-ui-base font-medium text-foreground">{agent.name}</span>
          <SubagentBadge>{intl.formatMessage({ id: subagentScopeI18nId(agent) })}</SubagentBadge>
          {notBuiltIn ? <SubagentBadge>{modelLabel}</SubagentBadge> : null}
          <SubagentBadge>{toolsLabel}</SubagentBadge>
        </div>
        <p className="mt-0.5 line-clamp-2 text-ui-base text-foreground-subtle">
          {agent.description || intl.formatMessage({ id: "settings.subagents.noDescription" })}
        </p>
        {agent.path ? <p className="mt-0.5 truncate font-mono text-ui-base text-foreground-subtlest">{agent.path}</p> : null}
      </div>
      <div className={cn("flex items-center gap-2", builtInName ? "col-span-2 min-w-0 justify-end sm:col-span-1 sm:shrink-0" : "shrink-0")}>
        {builtInName ? (
          <BuiltInModelOverrideControl
            agent={agent}
            disabled={isOperating}
            hasWorkspace={hasWorkspace}
            modelGroups={modelGroups}
            modelProviders={modelProviders}
            modelProvidersLoading={modelProvidersLoading}
            onBuiltInModelChange={onBuiltInModelChange}
            workspaceConfigOptions={workspaceConfigOptions}
            workspaceConfigStatus={workspaceConfigStatus}
          />
        ) : null}
        {userManaged ? (
          <Switch
            checked={agent.enabled}
            onCheckedChange={(checked) => void onToggle(agent, checked)}
            disabled={isOperating}
            aria-label={intl.formatMessage({ id: "settings.subagents.toggleAria" }, { name: agent.name })}
          />
        ) : null}
        <div className="flex items-center gap-1">
          {userManaged ? (
            <Button type="button" variant="ghost" size="icon-md" onClick={() => onEdit(agent)} disabled={isOperating} title={intl.formatMessage({ id: "settings.subagents.edit" })}>
              <IconPencil className="size-3.5" aria-hidden="true" />
            </Button>
          ) : null}
          {userManaged ? (
            <Button type="button" variant="ghost" size="icon-md" onClick={() => void onDelete(agent)} disabled={isOperating} title={intl.formatMessage({ id: "common.delete" })}>
              <IconTrash className="size-3.5" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconUsers → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/**
 * 原 B1t（196982）：内置代理模型覆盖控件。
 * 乐观更新（失败回滚）+ 模型/思考双选择 + 思考不可用红字。
 */
export function BuiltInModelOverrideControl({
  agent,
  disabled,
  hasWorkspace,
  modelGroups,
  modelProviders,
  modelProvidersLoading,
  onBuiltInModelChange,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  agent: SubagentItem;
  disabled: boolean;
  hasWorkspace: boolean;
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  onBuiltInModelChange: (agent: SubagentItem, override: { model?: string | null; thoughtLevel?: string | null }) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [override, setOverride] = React.useState<{ model?: string; thoughtLevel?: string }>(() => ({
    model: agent.modelOverride?.trim() || undefined,
    thoughtLevel: agent.thoughtLevelOverride?.trim() || undefined,
  }));
  const defaultMainLabel = intl.formatMessage({ id: "settings.subagents.model.defaultMain" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const currentModel = override.model ?? SUBAGENT_MODEL_INHERIT;
  const resolution = resolveThoughtLevelOption({
    hasWorkspace,
    model: currentModel,
    modelProviders,
    modelProvidersLoading,
    thoughtLevel: override.thoughtLevel,
    workspaceConfigOptions,
    workspaceConfigStatus,
  });
  const thoughtOption = resolution.option;
  const modelGroup = findModelGroupEntry(modelGroups, currentModel, modelProvidersLoading);
  const thoughtUnavailable = !!(override.thoughtLevel && modelGroup && !isThoughtLevelAvailable(resolution, override.thoughtLevel));
  const triggerLabel =
    currentModel === SUBAGENT_MODEL_INHERIT
      ? defaultMainLabel
      : resolveModelTriggerLabel({ inheritLabel: defaultMainLabel, modelGroups, model: currentModel, modelProvidersLoading, selectModelLabel });
  React.useEffect(() => {
    setOverride({
      model: agent.modelOverride?.trim() || undefined,
      thoughtLevel: agent.thoughtLevelOverride?.trim() || undefined,
    });
  }, [agent.modelOverride, agent.thoughtLevelOverride]);
  const applyOverride = React.useCallback(
    async (next: { model?: string; thoughtLevel?: string }) => {
      if (saving) return;
      const previous = override;
      setOverride(next);
      setSaving(true);
      try {
        await onBuiltInModelChange(agent, next);
      } catch {
        setOverride(previous);
      } finally {
        setSaving(false);
      }
    },
    [agent, override, onBuiltInModelChange, saving],
  );
  const handleModelChange = React.useCallback(
    (value: string) => {
      const next = value === SUBAGENT_MODEL_INHERIT ? undefined : value;
      if (next !== override.model) applyOverride({ model: next, thoughtLevel: undefined });
    },
    [override.model, applyOverride],
  );
  const footerActions = React.useMemo(
    () => [
      {
        key: "subagent-model:built-in-default",
        label: defaultMainLabel,
        onSelect: () => handleModelChange(SUBAGENT_MODEL_INHERIT),
        selected: currentModel === SUBAGENT_MODEL_INHERIT,
      },
    ],
    [defaultMainLabel, handleModelChange, currentModel],
  );
  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-1">
      <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2">
        <span data-testid={testidTemplate(TESTID_SUBAGENT_MODEL, agent.name)} data-model-current-value={currentModel} className="inline-flex min-w-0">
          <ModelSelector
            modelGroups={modelGroups as ModelGroup[]}
            normalizedValue={currentModel}
            triggerLabel={triggerLabel}
            showManageModelsAction={false}
            lockReasonMessage=""
            isItemLocked={subagentModelNeverLocked}
            onValueChange={handleModelChange}
            footerActions={footerActions}
            manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
            contentSide="top"
            contentAlign="end"
            focusSelectorOnClose={null}
            labelVisibilityClassName="inline-flex min-w-0"
            triggerClassName="h-8 w-fit max-w-52 min-w-0 justify-between rounded-lg border border-input-border bg-input px-3 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input focus-visible:border-input-border-focused focus-visible:bg-input-focused"
            triggerLabelClassName="inline-flex min-w-0 truncate text-left"
            disabled={disabled || saving}
          />
        </span>
        {thoughtOption ? (
          <ThoughtLevelSelector
            intl={intl}
            option={thoughtOption}
            provider="glm"
            showInvalidCurrentValue
            disabled={disabled || saving}
            triggerRef={triggerRef}
            restoreFocusSelector={null}
            labelVisibilityClassName="hidden sm:inline-flex"
            triggerClassName="h-8 rounded-lg border border-input-border bg-input px-2 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input"
            onValueChange={(value) => {
              if (value !== override.thoughtLevel) applyOverride({ model: override.model, thoughtLevel: value });
            }}
          />
        ) : null}
      </div>
      {thoughtUnavailable ? (
        <span className="text-ui-sm text-destructive">
          {intl.formatMessage({ id: "settings.subagents.form.validation.thoughtLevelUnavailable" })}
        </span>
      ) : null}
    </div>
  );
}

/** 原 Z7 消费助手：按值查找组条目（返回条目供思考联动） */
function findModelGroupEntry(groups: SelectGroupEntry[], value: string, loading: boolean): SelectItemEntry | null {
  if (!isModelAvailableInGroups(groups, value, loading)) return null;
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value === value);
    if (item) return item;
  }
  return null;
}

/**
 * 原 V1t（197122）：SubagentConfigForm。
 * 名称/颜色/模型/描述/工具/系统提示词/AGENTS.md 注入；校验四段（名 3–50 英数横线、描述、提示词、模型可用）。
 */
export function SubagentConfigForm({
  hasWorkspace,
  initial,
  modelProviders,
  modelProvidersLoading,
  modelSelectGroups,
  onManageModels,
  saving,
  onCancel,
  onDelete,
  onSave,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  hasWorkspace: boolean;
  initial?: SubagentItem;
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  modelSelectGroups: SelectGroupEntry[];
  onManageModels?: () => void;
  saving: boolean;
  onCancel: () => void;
  onDelete: (agent: SubagentItem) => Promise<void>;
  onSave: (config: Record<string, unknown>) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const formKey = subagentFormKeyOf(initial);
  const draft = React.useMemo(() => subagentFormDraftOf(initial), [initial, formKey]);
  const lastFormKey = React.useRef(formKey);
  const [name, setName] = React.useState(draft.name);
  const [description, setDescription] = React.useState(draft.description);
  const [color, setColor] = React.useState(draft.color);
  const [model, setModel] = React.useState(draft.model);
  const [thoughtLevel, setThoughtLevel] = React.useState<string | undefined>(draft.thoughtLevel);
  const [injectAgentsMd, setInjectAgentsMd] = React.useState(draft.injectAgentsMd);
  const [inheritAllTools, setInheritAllTools] = React.useState(draft.inheritAllTools);
  const [selectedTools, setSelectedTools] = React.useState(draft.selectedTools);
  const [systemPrompt, setSystemPrompt] = React.useState(draft.systemPrompt);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [descriptionError, setDescriptionError] = React.useState<string | null>(null);
  const [promptError, setPromptError] = React.useState<string | null>(null);
  const [modelError, setModelError] = React.useState<string | null>(null);
  const inheritLabel = intl.formatMessage({ id: "settings.subagents.model.inherit" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const handleModelChange = React.useCallback(
    (value: string) => {
      if (value !== model) {
        setModel(value);
        setThoughtLevel(undefined);
        setModelError(null);
      }
    },
    [model],
  );
  const triggerLabel = resolveModelTriggerLabel({
    inheritLabel,
    modelGroups: modelSelectGroups,
    model,
    modelProvidersLoading,
    selectModelLabel,
  });
  const footerActions = React.useMemo(
    () => [{ key: "subagent-model:inherit", label: inheritLabel, onSelect: () => handleModelChange(SUBAGENT_MODEL_INHERIT), selected: model === SUBAGENT_MODEL_INHERIT }],
    [handleModelChange, inheritLabel, model],
  );
  const selectedModel = normalizeSelectedModel(model);
  const modelGroup = findModelGroupEntry(modelSelectGroups, model, modelProvidersLoading);
  const resolution = resolveThoughtLevelOption({
    hasWorkspace,
    model,
    modelProviders,
    modelProvidersLoading,
    thoughtLevel,
    workspaceConfigOptions,
    workspaceConfigStatus,
  });
  const thoughtOption = resolution.option;
  const thoughtUnavailable = !!(selectedModel && thoughtLevel && modelGroup && !isThoughtLevelAvailable(resolution, thoughtLevel));
  const colorIndex = Math.max(0, SUBAGENT_COLORS.indexOf(color as (typeof SUBAGENT_COLORS)[number]));
  const thoughtTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (lastFormKey.current === formKey) return;
    lastFormKey.current = formKey;
    const next = subagentFormDraftOf(initial);
    setName(next.name);
    setDescription(next.description);
    setColor(next.color);
    setModel(next.model);
    setThoughtLevel(next.thoughtLevel);
    setInjectAgentsMd(next.injectAgentsMd);
    setInheritAllTools(next.inheritAllTools);
    setSelectedTools(next.selectedTools);
    setSystemPrompt(next.systemPrompt);
    setNameError(null);
    setDescriptionError(null);
    setPromptError(null);
    setModelError(null);
  }, [initial, formKey]);
  const validate = (): boolean => {
    const trimmedName = name.trim();
    let valid = true;
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setNameError(intl.formatMessage({ id: "settings.subagents.form.validation.nameLength" }, { min: "3", max: "50" }));
      valid = false;
    } else if (/^[a-zA-Z0-9-]+$/u.test(trimmedName)) {
      setNameError(null);
    } else {
      setNameError(intl.formatMessage({ id: "settings.subagents.form.validation.nameCharacters" }));
      valid = false;
    }
    if (description.trim()) setDescriptionError(null);
    else {
      setDescriptionError(intl.formatMessage({ id: "settings.subagents.form.validation.descriptionRequired" }));
      valid = false;
    }
    if (systemPrompt.trim()) setPromptError(null);
    else {
      setPromptError(intl.formatMessage({ id: "settings.subagents.form.validation.promptRequired" }));
      valid = false;
    }
    if (isModelAvailableInGroups(modelSelectGroups, model, modelProvidersLoading)) setModelError(null);
    else {
      setModelError(intl.formatMessage({ id: "settings.subagents.form.validation.modelUnavailable" }));
      valid = false;
    }
    if (thoughtUnavailable) valid = false;
    return valid;
  };
  const toggleTool = (tool: string) => {
    setInheritAllTools(false);
    setSelectedTools((previous) => (previous.includes(tool) ? previous.filter((entry) => entry !== tool) : [...previous, tool]));
  };
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!validate()) return;
        await onSave({
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          color,
          injectAgentsMd,
          ...(selectedModel ? { model: selectedModel } : {}),
          ...(selectedModel && thoughtLevel ? { thoughtLevel: thoughtLevel.trim() } : {}),
          tools: inheritAllTools ? undefined : mergeToolSelections(selectedTools, draft.preservedTools),
          disallowedTools: initial?.disallowedTools,
          skills: initial?.skills,
          permissionMode: initial?.permissionMode,
          ...(initial?.maxTurns ? { maxTurns: initial.maxTurns } : {}),
          ...(initial?.background === undefined ? {} : { background: initial.background }),
          mcpServers: initial?.mcpServers,
        });
      }}
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(12rem,14rem)_auto_minmax(0,1fr)] md:items-start">
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.name.label" })}</SubagentFormLabel>
          <Input
            type="text"
            size="lg"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={intl.formatMessage({ id: "settings.subagents.form.name.placeholder" })}
          />
          {nameError ? <p className="text-ui-base text-destructive">{nameError}</p> : null}
        </div>
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.color.label" })}</SubagentFormLabel>
          <div role="radiogroup" className="relative inline-grid w-56 grid-cols-8 rounded-lg border border-input-border bg-input p-1">
            <span
              className="pointer-events-none absolute top-1 size-6 rounded-full border border-border-hover bg-surface shadow-xs transition-[left]"
              style={{ left: `calc(0.25rem + ((100% - 0.5rem) / ${SUBAGENT_COLORS.length}) * ${colorIndex})` }}
              aria-hidden="true"
            />
            {SUBAGENT_COLORS.map((entry) => (
              <button
                key={entry}
                type="button"
                role="radio"
                aria-checked={color === entry}
                aria-label={intl.formatMessage({ id: `settings.subagents.color.${entry}` })}
                className="relative z-10 flex size-6 items-center justify-center rounded-full outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setColor(entry)}
              >
                <span className={cn("size-3.5 rounded-full", SUBAGENT_COLOR_CLASSES[entry])} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.model.label" })}</SubagentFormLabel>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModelSelector
              modelGroups={modelSelectGroups as ModelGroup[]}
              normalizedValue={model}
              triggerLabel={triggerLabel}
              showManageModelsAction={!!onManageModels}
              lockReasonMessage=""
              isItemLocked={subagentModelNeverLocked}
              onValueChange={handleModelChange}
              footerActions={footerActions}
              manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
              onManageModels={onManageModels}
              contentSide="bottom"
              focusSelectorOnClose={null}
              labelVisibilityClassName="inline-flex min-w-0"
              triggerClassName="h-8 w-fit max-w-full min-w-0 justify-between rounded-lg border border-input-border bg-input bg-clip-border px-3 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input focus-visible:border-input-border-focused focus-visible:bg-input-focused"
              triggerLabelClassName="inline-flex min-w-0 truncate text-left"
            />
            {thoughtOption ? (
              <ThoughtLevelSelector
                intl={intl}
                option={thoughtOption}
                provider="glm"
                showInvalidCurrentValue
                disabled={saving}
                triggerRef={thoughtTriggerRef}
                restoreFocusSelector={null}
                labelVisibilityClassName="inline-flex min-w-0"
                triggerClassName="h-8 rounded-lg border border-input-border bg-input px-2 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input"
                onValueChange={setThoughtLevel}
              />
            ) : null}
          </div>
          {modelError ? <p className="text-ui-base text-destructive">{modelError}</p> : null}
          {thoughtUnavailable ? (
            <p className="text-ui-base text-destructive">
              {intl.formatMessage({ id: "settings.subagents.form.validation.thoughtLevelUnavailable" })}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.description.label" })}</SubagentFormLabel>
        <Input
          type="text"
          size="lg"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.subagents.form.description.placeholder" })}
        />
        {descriptionError ? <p className="text-ui-base text-destructive">{descriptionError}</p> : null}
      </div>
      <div className="space-y-2 pt-1">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.tools.label" })}</SubagentFormLabel>
        <div className="flex min-w-0 items-center gap-2">
          <Select
            value={inheritAllTools ? "all" : "custom"}
            onValueChange={(value) => {
              const all = value === "all";
              setInheritAllTools(all);
              if (!all && selectedTools.length === 0) setSelectedTools([...SUBAGENT_TOOL_OPTIONS]);
            }}
          >
            <SelectTrigger size="lg" className="w-fit justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{intl.formatMessage({ id: "settings.subagents.form.tools.mode.all" })}</SelectItem>
              <SelectItem value="custom">{intl.formatMessage({ id: "settings.subagents.form.tools.mode.custom" })}</SelectItem>
            </SelectContent>
          </Select>
          <span className="min-w-0 text-ui-base font-normal text-foreground-subtle">
            {intl.formatMessage({ id: "settings.subagents.form.tools.card.title" })}
          </span>
        </div>
        {inheritAllTools ? null : (
          <div className="rounded-lg border border-border bg-card p-1">
            <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {SUBAGENT_TOOL_OPTIONS.map((tool) => (
                <ToolCheckboxRow key={tool} checked={selectedTools.includes(tool)} disabled={false} label={tool} onToggle={() => toggleTool(tool)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.systemPrompt.label" })}</SubagentFormLabel>
        <textarea
          value={systemPrompt}
          onChange={(event) => setSystemPrompt(event.target.value)}
          rows={3}
          className="max-h-56 min-h-16 resize-y overflow-y-auto text-ui-base w-full rounded-lg border border-input-border bg-input p-2 text-foreground placeholder:text-ui-base placeholder:text-foreground-subtlest focus-visible:border-input-border-focused focus-visible:bg-input-focused"
          placeholder={intl.formatMessage({ id: "settings.subagents.form.systemPrompt.placeholder" })}
        />
        {promptError ? <p className="text-ui-base text-destructive">{promptError}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3 py-2.5">
        <p className="min-w-0 text-ui-base font-medium text-foreground">
          {intl.formatMessage({ id: "settings.subagents.form.injectAgentsMd.label" })}
        </p>
        <Switch checked={injectAgentsMd} onCheckedChange={setInjectAgentsMd} aria-label={intl.formatMessage({ id: "settings.subagents.form.injectAgentsMd.label" })} />
      </div>
      {initial ? null : (
        <div className="flex items-start gap-1.5 text-ui-base leading-6 text-foreground">
          <IconInfo className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
          <span>{intl.formatMessage({ id: "settings.subagents.workspaceScopeUnsupported" })}</span>
        </div>
      )}
      <div className={cn("flex flex-wrap items-center gap-2 pt-1", initial && "justify-between gap-3")}>
        {initial && onDelete ? (
          <Button
            type="button"
            variant="link"
            size="lg"
            className="px-0 text-destructive hover:text-destructive"
            onClick={() => void onDelete(initial)}
            disabled={saving}
          >
            <IconTrash className="size-3.5" aria-hidden="true" />
            {intl.formatMessage({ id: "common.delete" })}
          </Button>
        ) : null}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="default" size="lg" disabled={saving}>
            {saving ? intl.formatMessage({ id: "common.saving" }) : intl.formatMessage({ id: "common.save" })}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={saving}>
            {intl.formatMessage({ id: "common.cancel" })}
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ============================================================================
 * §B. 插件分区深层叶子（原 js 198144–199993）
 * ==========================================================================*/

export interface PluginListing {
  displayName?: string;
  displayNameI18n?: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  category?: string;
  author?: string;
  icon?: string;
  homepage?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  heroImage?: string;
  examplePrompts?: string[];
  examplePromptsI18n?: Record<string, string[]>;
  version?: string;
  [key: string]: unknown;
}

export interface PluginItem {
  id: string;
  name: string;
  marketplace?: string; // A0-CLEANUP3 3b：与 SettingsPanelsCapability.PluginItem 对齐（可选），双向收敛
  installed?: boolean;
  restorable?: boolean;
  orphaned?: boolean;
  enabled?: boolean;
  listing?: PluginListing;
  summary?: { description?: string; version?: string; [key: string]: unknown };
  info?: {
    enabled?: boolean;
    author?: string;
    version?: string;
    description?: string;
    homepage?: string;
    source?: string;
    rootPath?: string; // A0-CLEANUP3 3b：按消费面（PluginDetail advanced 段）补足
    hookDetails?: PluginHookDetail[];
    components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }>;
    [key: string]: unknown;
  };
  installedMeta?: { version?: string; updateStatus?: string; installedAt?: string; description?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface PluginStoreActions {
  operationId: string | null;
  togglingPluginId: string | null;
  onInstall: (item: PluginItem) => void;
  onOpenDetail: (pluginId: string) => void;
  onSetEnabled: (pluginId: string, enabled: boolean) => void;
  onUpdate: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
}

/** 原 AV（65208 区，F08 提及域；接口级）：远程图标头像（失败回落拼图图标） */
declare const RemoteIconAvatar: React.FC<{ src?: string | null; className?: string; iconClassName?: string }>;

/** 原 r9（198144）：插件图标（listing.icon → 头像；缺省拼图） */
export function PluginIcon({ item, className, iconClassName }: { item: PluginItem; className?: string; iconClassName?: string }) {
  return <RemoteIconAvatar src={item.listing?.icon} className={className} iconClassName={iconClassName} />;
}

/** 原 i9（198171）：更新态判定 */
export function hasPluginUpdate(status: string | undefined): boolean {
  return status === "update-available" || status === "version-changed";
}

/** 原 W1t（198174）：可更新判定（非孤儿 ∧ 更新态） */
export function isPluginUpdatable(item: PluginItem): boolean {
  return !!(item && !item.orphaned && hasPluginUpdate(item.installedMeta?.updateStatus));
}

/** 原 G1t（198154）：i18n 文案按语言回退（精确 → 语言前缀 → 缺省） */
export function resolveLocalizedText(locale: string, fallback: string | undefined, i18n: Record<string, string> | undefined): string | undefined {
  if (i18n) {
    const exact = i18n[locale];
    if (exact) return exact;
    const prefix = locale.split("-")[0];
    if (prefix) {
      const prefixed = Object.entries(i18n).find(([key]) => key.split("-")[0] === prefix);
      if (prefixed?.[1]) return prefixed[1];
    }
  }
  return fallback;
}

/** 原 K1t（198165）：i18n 数组文案回退 */
export function resolveLocalizedList(locale: string, fallback: string[] | undefined, i18n: Record<string, string[]> | undefined): string[] | undefined {
  if (i18n) {
    const exact = i18n[locale];
    if (exact && exact.length > 0) return exact;
    const prefix = locale.split("-")[0];
    if (prefix) {
      const prefixed = Object.entries(i18n).find(([key]) => key.split("-")[0] === prefix);
      if (prefixed?.[1] && prefixed[1].length > 0) return prefixed[1];
    }
  }
  return fallback && fallback.length > 0 ? fallback : undefined;
}

/** 原 a9（198177）：显示名（i18n → listing → name） */
export function pluginDisplayName(item: PluginItem, locale: string): string {
  return resolveLocalizedText(locale, item.listing?.displayName, item.listing?.displayNameI18n) ?? item.name;
}

/** 原 o9（198180）：描述（summary → info → installedMeta；i18n 覆盖） */
export function pluginDescription(item: PluginItem, locale: string): string | undefined {
  return resolveLocalizedText(
    locale,
    item.summary?.description ?? item.info?.description ?? item.installedMeta?.description,
    item.listing?.descriptionI18n,
  );
}

/** 原 q1t（198187）：分类 i18n 表 */
export const PLUGIN_CATEGORY_I18N: Record<string, string> = {
  "developer-tools": "settings.plugins.store.category.developerTools",
  productivity: "settings.plugins.store.category.productivity",
  utilities: "settings.plugins.store.category.utilities",
  guides: "settings.plugins.store.category.guides",
  template: "settings.plugins.store.category.template",
  other: "settings.plugins.store.category.other",
};

/** 原 J1t（198199）：商店条目装配（可用 → 可恢复 → 已装三级；孤儿 = 市场不可用 ∧ cache 源 ∧ 市场缺失） */
export function buildStoreItems(args: {
  plugins: PluginItem[];
  installedPlugins: Array<{ id: string; [key: string]: unknown }>;
  marketplaces: Array<{ id: string; [key: string]: unknown }>;
  availablePlugins: Array<PluginItem & { installed?: boolean }>;
  restorableBuiltins: Array<PluginItem>;
  marketplaceAvailabilityKnown: boolean;
}): PluginItem[] {
  const infoById = new Map(args.plugins.map((plugin) => [plugin.id, plugin]));
  const installedById = new Map(args.installedPlugins.map((plugin) => [plugin.id, plugin]));
  const marketplaceIds = new Set(args.marketplaces.map((marketplace) => marketplace.id));
  const merged = new Map<string, PluginItem>();
  for (const available of args.availablePlugins) {
    const info = infoById.get(available.id);
    merged.set(available.id, {
      id: available.id,
      name: available.name,
      marketplace: available.marketplace,
      installed: available.installed || info !== undefined,
      restorable: false,
      orphaned: false,
      ...(available.listing ? { listing: available.listing } : {}),
      summary: available,
      ...(info ? { info } : {}),
      ...(installedById.get(available.id) ? { installedMeta: installedById.get(available.id) } : {}),
    });
  }
  for (const restorable of args.restorableBuiltins) {
    if (merged.has(restorable.id)) continue;
    merged.set(restorable.id, {
      id: restorable.id,
      name: restorable.name,
      marketplace: restorable.marketplace,
      installed: false,
      restorable: true,
      orphaned: false,
      ...(restorable.listing ? { listing: restorable.listing } : {}),
      summary: restorable,
    });
  }
  for (const plugin of args.plugins) {
    if (merged.has(plugin.id)) continue;
    merged.set(plugin.id, {
      id: plugin.id,
      name: plugin.name,
      marketplace: plugin.marketplace,
      installed: true,
      restorable: false,
      orphaned: args.marketplaceAvailabilityKnown && (plugin as { source?: string }).source === "cache" && !marketplaceIds.has(plugin.marketplace ?? ""), // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
      info: plugin,
      ...(installedById.get(plugin.id) ? { installedMeta: installedById.get(plugin.id) } : {}),
    });
  }
  return [...merged.values()];
}

/** 原 vr（src chunk `S`=_S）：官方市场判定 */
export function isOfficialMarketplace(marketplaceId: string): boolean {
  return ["zcode-plugins-official"].includes(marketplaceId);
}

/** 原 Y1t（198241）：精选条目收集（官方市场 featured 序） */
export function collectFeaturedItems(items: PluginItem[], marketplaces: Array<{ id: string; featured?: string[] }>): PluginItem[] {
  const byName = new Map<string, PluginItem>();
  for (const item of items) {
    if (!byName.has(item.name)) byName.set(item.name, item);
  }
  const featured: PluginItem[] = [];
  const seen = new Set<string>();
  for (const marketplace of marketplaces) {
    if (!isOfficialMarketplace(marketplace.id)) continue;
    for (const name of marketplace.featured ?? []) {
      const item = byName.get(name);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        featured.push(item);
      }
    }
  }
  return featured;
}

/** 原 X1t（198254）：分类分组（other 恒末位） */
export function buildCategoryGroups(
  items: PluginItem[],
  locale: string,
  resolveCategoryLabel: (category: string) => string,
): Array<{ category: string; items: PluginItem[] }> {
  const byCategory = new Map<string, PluginItem[]>();
  for (const item of items) {
    const category = item.listing?.category?.trim() || "other";
    const bucket = byCategory.get(category) ?? [];
    bucket.push(item);
    byCategory.set(category, bucket);
  }
  const sortItems = (bucket: PluginItem[]) => bucket.toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale)));
  return [...byCategory.entries()]
    .map(([category, bucket]) => ({ category, items: sortItems(bucket) }))
    .toSorted((a, b) =>
      a.category === "other" ? 1 : b.category === "other" ? -1 : resolveCategoryLabel(a.category).localeCompare(resolveCategoryLabel(b.category)),
    );
}

/** 原 Z1t（198272）：搜索匹配（名/键/市场/显示名/描述/分类/作者） */
export function pluginSearchMatch(item: PluginItem, query: string, locale: string): boolean {
  return [
    item.name,
    item.id,
    item.marketplace,
    pluginDisplayName(item, locale),
    pluginDescription(item, locale) ?? "",
    item.listing?.category ?? "",
    item.listing?.author ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/** 原 Q1t（198286）：已装排序（非 cache 源优先；cache 按安装时刻倒序） */
export function sortInstalledItems(items: PluginItem[], locale: string): PluginItem[] {
  return items.toSorted((a, b) => {
    const aLive = !!(a.info && a.info.source !== "cache");
    if (aLive !== !!(b.info && b.info.source !== "cache")) return aLive ? -1 : 1;
    const byName = () => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale));
    if (aLive) return byName();
    const aInstalledAt = a.installedMeta?.installedAt ?? "";
    const bInstalledAt = b.installedMeta?.installedAt ?? "";
    return aInstalledAt === bInstalledAt ? byName() : bInstalledAt.localeCompare(aInstalledAt);
  });
}

/** 原 $1t（198297）：已装列表（行 = 图标/名/版本/来源徽章/更新徽章/描述/开关） */
export function PluginInstalledList({
  filteredPlugins,
  handlePluginEnabledChange,
  installedPluginMetaById,
  loading,
  onSelectPlugin,
  renderPluginSource,
  selectedPluginId,
  storeItemById,
  togglingPluginId,
}: {
  filteredPlugins: Array<{ id: string; name: string; version?: string; description?: string; enabled: boolean }>;
  handlePluginEnabledChange: (pluginId: string, enabled: boolean) => void;
  installedPluginMetaById: Map<string, { updateStatus?: string }>;
  loading: boolean;
  onSelectPlugin: (pluginId: string) => void;
  renderPluginSource: (item: { id: string; name: string }) => string;
  selectedPluginId: string | null;
  storeItemById: Map<string, PluginItem>;
  togglingPluginId: string | null;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", !loading && filteredPlugins.length === 0 ? "border-dashed" : "bg-card")} data-testid="plugin-store-installed-list">
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
        ) : filteredPlugins.length === 0 ? (
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.empty" })}</div>
        ) : (
          filteredPlugins.map((plugin) => {
            const selected = plugin.id === selectedPluginId;
            const updateStatus = installedPluginMetaById.get(plugin.id)?.updateStatus;
            const storeItem = storeItemById.get(plugin.id) ?? { name: plugin.name } as PluginItem;
            return (
              <div
                key={plugin.id}
                data-testid="plugin-store-installed-row"
                data-plugin-id={plugin.id}
                className={cn(
                  "group/row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover",
                  selected && "bg-selected",
                )}
              >
                <button type="button" className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-left" onClick={() => onSelectPlugin(plugin.id)}>
                  <PluginIcon item={storeItem} className="size-9" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 truncate text-ui-base font-medium text-foreground">{plugin.name}</span>
                      {plugin.version ? <span className="shrink-0 text-ui-xs text-foreground-subtle">{"v"}{plugin.version}</span> : null}
                      <SubagentBadge>{renderPluginSource(plugin)}</SubagentBadge>
                      {hasPluginUpdate(updateStatus) ? (
                        <span className="inline-flex min-h-5 items-center rounded-md bg-secondary px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle">
                          {updateStatus === "update-available"
                            ? intl.formatMessage({ id: "settings.plugins.list.updateAvailable" })
                            : intl.formatMessage({ id: "settings.plugins.list.versionChanged" })}
                        </span>
                      ) : null}
                    </div>
                    {plugin.description ? (
                      <div className="mt-0.5 line-clamp-1 text-ui-base text-foreground-subtle">{plugin.description}</div>
                    ) : null}
                  </div>
                  <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest transition-colors group-hover/row:text-foreground-subtle" aria-hidden="true" />
                </button>
                <Switch
                  data-testid="plugin-store-manage-enabled-switch"
                  data-plugin-id={plugin.id}
                  checked={plugin.enabled}
                  disabled={togglingPluginId === plugin.id}
                  onCheckedChange={(checked) => {
                    handlePluginEnabledChange(plugin.id, checked);
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export interface PluginHookDetail {
  event: string;
  matcher?: string;
  runnable?: boolean;
  command: string;
  args?: string[];
  timeoutMs?: number;
  timeout?: number;
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  sourcePath: string;
}

/** 原 e0t（198413）：钩子明细列表（事件/匹配器/可运行徽章 + 命令/超时/异步/shell/来源） */
export function PluginHookDetailsList({ hooks }: { hooks: PluginHookDetail[] }) {
  const { intl } = useIntlContext();
  return (
    <div>
      <div className="mb-2 text-ui-xs font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.detail.hooks" })}</div>
      {hooks.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.plugins.detail.none" })}
        </div>
      ) : (
        <div className="space-y-2">
          {hooks.map((hook, index) => (
            <div key={`${hook.event}-${hook.matcher ?? "default"}-${hook.command}-${index}`} className="min-w-0 space-y-2 rounded-lg border border-border bg-surface px-3 py-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="inline-flex min-h-5 items-center rounded-md border border-border px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle font-mono">{hook.event}</span>
                <span className="inline-flex min-h-5 items-center rounded-md border border-border px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle">
                  {hook.matcher ?? intl.formatMessage({ id: "settings.plugins.detail.hook.defaultMatcher" })}
                </span>
                <span
                  className={cn(
                    "inline-flex min-h-5 items-center rounded-md px-1.5 py-0.5 text-ui-base font-medium",
                    hook.runnable ? "bg-secondary text-foreground-subtle" : "border border-border text-foreground-subtle",
                  )}
                >
                  {hook.runnable
                    ? intl.formatMessage({ id: "settings.plugins.detail.hook.runnable" })
                    : intl.formatMessage({ id: "settings.plugins.detail.hook.diagnosticOnly" })}
                </span>
              </div>
              <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.command" })} value={hookCommandPreview(hook)} />
              <div className="grid gap-2 sm:grid-cols-2">
                {hook.timeoutMs === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.timeoutMs" })} value={`${hook.timeoutMs}ms`} />
                )}
                {hook.timeout === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.timeout" })} value={String(hook.timeout)} />
                )}
                {hook.async === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.async" })} value={String(hook.async)} />
                )}
                {hook.shell === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.shell" })} value={hook.shell === true ? "true" : hook.shell} />
                )}
                {hook.statusMessage ? (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.statusMessage" })} value={hook.statusMessage} />
                ) : null}
              </div>
              <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.sourcePath" })} value={hook.sourcePath} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 原 s9（198520）：明细字段（小号标签 + 等宽值；值直渲为 React 子，布尔 false 不渲染，同源行为） */
export function PluginDetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-ui-xs text-foreground-subtle">{label}</div>
      <div className="mt-0.5 break-all font-mono text-ui-xs text-foreground">{value}</div>
    </div>
  );
}

/** 原 t0t（198531）：钩子命令预览（命令 + 参数） */
export function hookCommandPreview(hook: { command: string; args?: string[] }): string {
  return !hook.args || hook.args.length === 0 ? hook.command : `${hook.command} ${hook.args.join(" ")}`;
}

/** 原 n0t（198534）：信息行（带框标签 + 等宽值） */
export function PluginInfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2">
      <div className="text-ui-xs text-foreground-subtle">{label}</div>
      <div className="mt-1 break-all font-mono text-ui-xs text-foreground">{value}</div>
    </div>
  );
}

/** 原 r0t（198544）：添加市场对话框（输入 + 目录选择/拖放 + IME 守卫） */
export function AddMarketplaceDialog({
  open,
  onOpenChange,
  onAddMarketplace,
  operationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMarketplace: (source: string) => Promise<boolean> | void;
  operationId: string | null;
}) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const canSelectFilePath = platform?.canSelectFilePath ?? false;
  const [source, setSource] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const trimmed = source.trim();
  const pending = operationId === `marketplace:add:${trimmed}`;
  const composing = React.useRef(false);
  const submitting = React.useRef(false);
  const submit = async () => {
    if (trimmed.length === 0 || submitting.current) return;
    submitting.current = true;
    try {
      const ok = await onAddMarketplace(trimmed);
      if (ok) {
        setSource("");
        onOpenChange(false);
      }
    } finally {
      submitting.current = false;
    }
  };
  const chooseDirectory = async () => {
    if (!platform) return;
    try {
      const selected = await platform.selectDirectory();
      if (selected) setSource(selected);
    } catch {
      /* 取消选择 */
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="plugin-store-add-source-dialog"
        className={cn("w-[min(420px,calc(100vw-2rem))] max-w-none gap-3 transition-colors", canSelectFilePath && dragging ? "border-border-hover bg-surface-hover" : "")}
        onDragOver={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                event.preventDefault();
                setDragging(true);
              }
            : undefined
        }
        onDragLeave={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
              }
            : undefined
        }
        onDrop={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (!file) return;
                const path = platform?.getPathForFile?.(file)?.trim();
                if (path) setSource(path);
              }
            : undefined
        }
      >
        <DialogTitle className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.marketplaces.add" })}</DialogTitle>
        <Input
          type="text"
          data-testid="plugin-store-add-source-input"
          size="lg"
          className="h-9 rounded-lg"
          autoFocus
          aria-label={intl.formatMessage({ id: "settings.plugins.marketplaces.source" })}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !imeGuard({ compositionActive: composing.current, nativeEvent: event.nativeEvent })) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder={intl.formatMessage({ id: "settings.plugins.marketplaces.source" })}
        />
        {canSelectFilePath ? (
          <p className="text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.marketplaces.dropHint" })}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          {canSelectFilePath ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void chooseDirectory()}>
              <IconFolderOpen className="size-3" aria-hidden="true" />
              {intl.formatMessage({ id: "settings.plugins.marketplaces.chooseDirectory" })}
            </Button>
          ) : null}
          <Button type="button" data-testid="plugin-store-add-source-submit" variant="default" size="sm" disabled={trimmed.length === 0 || pending} onClick={() => void submit()}>
            {pending ? <IconSpinner className="size-3 animate-spin" aria-hidden="true" /> : <IconPlus className="size-3" aria-hidden="true" />}
            {intl.formatMessage({ id: "settings.plugins.marketplaces.add" })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconFolderOpen → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 i0t（198670）：插件忙碌判定（安装/恢复/卸载/更新/开关五态） */
export function isPluginBusy(item: PluginItem, actions: PluginStoreActions): boolean {
  return (
    actions.operationId === `plugin:install:${item.name}@${item.marketplace}` ||
    actions.operationId === `plugin:restore:${item.id}` ||
    actions.operationId === `plugin:uninstall:${item.id}` ||
    actions.operationId === `plugin:update:${item.id}` ||
    actions.togglingPluginId === item.id
  );
}

/** 原 a0t（198679）：详情头启用开关 */
export function PluginEnabledSwitch({ item, actions }: { item: PluginItem; actions: PluginStoreActions }) {
  const { intl } = useIntlContext();
  if (!item.info) return null;
  const enabled = item.info.enabled;
  return (
    <Switch
      data-testid="plugin-store-enabled-switch"
      data-plugin-id={item.id}
      checked={enabled ?? false}
      disabled={actions.togglingPluginId === item.id}
      aria-label={enabled ? intl.formatMessage({ id: "settings.plugins.store.menu.disable" }) : intl.formatMessage({ id: "settings.plugins.store.menu.enable" })}
      onClick={(event: React.MouseEvent) => event.stopPropagation()}
      onCheckedChange={(checked) => actions.onSetEnabled(item.id, checked)}
    />
  );
}

/** 原 o0t（198695）：插件行菜单（启用/更新/卸载；忙碌 → spinner） */
export function PluginItemMenu({ item, actions, triggerClassName }: { item: PluginItem; actions: PluginStoreActions; triggerClassName?: string }) {
  const { intl } = useIntlContext();
  const enabled = item.info?.enabled ?? false;
  const updatable = isPluginUpdatable(item);
  const busy = isPluginBusy(item, actions);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-testid="plugin-store-item-menu"
          data-plugin-id={item.id}
          variant="ghost"
          size="icon-md"
          className={triggerClassName}
          aria-label={intl.formatMessage({ id: "settings.plugins.store.menu.label" })}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
        >
          {busy ? <IconSpinner className="size-4 animate-spin" aria-hidden="true" /> : <IconEllipsis className="size-4" aria-hidden="true" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        {item.info ? (
          <DropdownMenuItem data-testid="plugin-store-menu-enabled" data-plugin-id={item.id} disabled={busy} onSelect={() => actions.onSetEnabled(item.id, !enabled)}>
            <IconPower className="size-4" aria-hidden="true" />
            {enabled ? intl.formatMessage({ id: "settings.plugins.store.menu.disable" }) : intl.formatMessage({ id: "settings.plugins.store.menu.enable" })}
          </DropdownMenuItem>
        ) : null}
        {updatable ? (
          <DropdownMenuItem data-testid="plugin-store-menu-update" data-plugin-id={item.id} disabled={busy} onSelect={() => actions.onUpdate(item.id)}>
            <IconRefresh className="size-4" aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.detail.update" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="plugin-store-menu-uninstall" data-plugin-id={item.id} variant="destructive" disabled={busy} onSelect={() => actions.onUninstall(item.id)}>
          <IconTrash className="size-4" aria-hidden="true" />
          {intl.formatMessage({ id: "settings.plugins.detail.uninstall" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconPower → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 s0t（198765）：安装按钮（安装/恢复忙碌态） */
export function PluginInstallButton({ item, actions, size = "sm" }: { item: PluginItem; actions: PluginStoreActions; size?: string }) {
  const { intl } = useIntlContext();
  const busy = actions.operationId === `plugin:install:${item.name}@${item.marketplace}` || actions.operationId === `plugin:restore:${item.id}`;
  return (
    <Button
      type="button"
      data-testid="plugin-store-install"
      data-plugin-id={item.id}
      variant="secondary"
      size={size}
      className="rounded-full"
      disabled={busy}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        actions.onInstall(item);
      }}
    >
      {busy ? <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {busy ? intl.formatMessage({ id: "settings.plugins.marketplace.installing" }) : intl.formatMessage({ id: "settings.plugins.store.install" })}
    </Button>
  );
}

/** 原 c0t（198789）：商店卡片（图标 + 名 + 孤儿警示 + 描述 + 安装/菜单） */
export function PluginStoreCard({ item, actions, locale }: { item: PluginItem; actions: PluginStoreActions; locale: string }) {
  const { intl } = useIntlContext();
  const displayName = pluginDisplayName(item, locale);
  const description = pluginDescription(item, locale);
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="plugin-store-card"
      data-plugin-id={item.id}
      className="group/card flex min-w-0 cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
      onClick={() => actions.onOpenDetail(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          actions.onOpenDetail(item.id);
        }
      }}
    >
      <PluginIcon item={item} className="size-10" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-ui-base font-semibold text-foreground">{displayName}</div>
        {item.orphaned ? (
          <div data-testid="plugin-store-source-degraded" data-plugin-id={item.id} className="mt-0.5 flex items-center gap-1 truncate text-ui-sm text-warning">
            <IconAlertTriangle className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{intl.formatMessage({ id: "settings.plugins.store.sourceMissing" })}</span>
          </div>
        ) : null}
        {description ? <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">{description}</div> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {item.installed ? <PluginItemMenu item={item} actions={actions} /> : <PluginInstallButton item={item} actions={actions} />}
      </div>
    </div>
  );
}

/** 原 l0t（198843）：精选配置（官方市场 + 6 插件名；注释逐字） */
export const PLUGIN_RECOMMENDED_CONFIG = {
  $comment:
    "客户端精选的「推荐」插件列表。来源仍是官方市场 (marketplace)，这里只挑选要在 Recommend 区置顶展示的插件名 (按 plugin name 匹配官方目录)。初期清单可在此直接增删，无需改动数据层。",
  marketplace: "claude-plugins-official",
  pluginNames: ["context7", "code-review", "playwright", "feature-dev", "commit-commands", "superpowers"],
};
const RECOMMENDED_MARKETPLACE = PLUGIN_RECOMMENDED_CONFIG.marketplace;
const RECOMMENDED_PLUGIN_NAMES = PLUGIN_RECOMMENDED_CONFIG.pluginNames;

/** 原 d0t（198857）：按配置序挑选推荐条目（名称去重） */
export function pickRecommendedItems(items: PluginItem[], names: string[] = RECOMMENDED_PLUGIN_NAMES): PluginItem[] {
  const byName = new Map<string, PluginItem>();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, item);
  }
  const picked: PluginItem[] = [];
  for (const name of names) {
    const item = byName.get(name.toLowerCase());
    if (item) picked.push(item);
  }
  return picked;
}

/** 原 f0t/l9/p0t（198870–198878）：cache 来源标签（官方市场 → 固定文案） */
const PLUGIN_CACHE_SOURCE = "cache";
export function resolveMarketplaceLabel(
  marketplaceId: string,
  marketplaces: Array<{ id: string; name?: string }>,
  claudeCodePluginsLabel: string,
): string {
  return marketplaceId === RECOMMENDED_MARKETPLACE ? claudeCodePluginsLabel : marketplaces.find((marketplace) => marketplace.id === marketplaceId)?.name ?? marketplaceId;
}
export function formatPluginSourceLabel(args: {
  source: string;
  marketplace: string;
  marketplaces: Array<{ id: string; name?: string }>;
  claudeCodePluginsLabel: string;
  builtinLabel: string;
  formatFromMarketplace: (label: string) => string;
}): string {
  if (args.source !== PLUGIN_CACHE_SOURCE) return args.builtinLabel;
  const label = resolveMarketplaceLabel(args.marketplace, args.marketplaces, args.claudeCodePluginsLabel);
  return args.formatFromMarketplace(label);
}

/** 原 u9（198879）：分组折叠缺省条数 */
export const PLUGIN_GROUP_COLLAPSED_COUNT = 6;

/** 原 m0t（198880）：PluginStoreGrid（搜索 + 已装条 + 公共/个人双段） */
export function PluginStoreGrid({
  items,
  marketplaces,
  actions,
  loading,
  query,
  onQueryChange,
  segment,
  onSegmentChange,
  onOpenManage,
}: {
  items: PluginItem[];
  marketplaces: Array<{ id: string; name?: string; featured?: string[] }>;
  actions: PluginStoreActions;
  loading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  segment: string;
  onSegmentChange: (segment: string) => void;
  onOpenManage: () => void;
}) {
  const { intl, locale } = useIntlContext();
  const normalizedQuery = query.trim().toLowerCase();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const installedStrip = React.useMemo(() => sortInstalledItems(items.filter((item) => item.installed), locale), [items, locale]);
  const publicItems = React.useMemo(() => items.filter((item) => isOfficialMarketplace(item.marketplace ?? "")), [items]); // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
  const personalItems = React.useMemo(() => items.filter((item) => !isOfficialMarketplace(item.marketplace ?? "")), [items]);
  const resolveCategoryLabel = React.useMemo(
    () => (category: string) => {
      const i18nId = PLUGIN_CATEGORY_I18N[category];
      return i18nId ? intl.formatMessage({ id: i18nId }) : category;
    },
    [intl],
  );
  const featuredItems = React.useMemo(() => collectFeaturedItems(publicItems, marketplaces), [marketplaces, publicItems]);
  const categoryGroups = React.useMemo(() => buildCategoryGroups(publicItems, locale, resolveCategoryLabel), [locale, publicItems, resolveCategoryLabel]);
  const recommendedItems = React.useMemo(() => {
    const summaries = new Map(personalItems.filter((item) => item.marketplace === RECOMMENDED_MARKETPLACE && item.summary).map((item) => [item.id, item]));
    return pickRecommendedItems([...summaries.values()].flatMap((item) => (item.summary ? [item as PluginItem] : []))).flatMap((picked) => {
      const entry = summaries.get(picked.id);
      return entry ? [entry] : [];
    });
  }, [personalItems]);
  const personalGroups = React.useMemo(() => {
    const claudeLabel = intl.formatMessage({ id: "settings.plugins.marketplace.claudeCodePlugins" });
    const byMarketplace = new Map<string, PluginItem[]>();
    for (const item of personalItems) {
      const bucket = byMarketplace.get(item.marketplace ?? "") ?? []; // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
      bucket.push(item);
      byMarketplace.set(item.marketplace ?? "", bucket);
    }
    return [...byMarketplace.entries()]
      .map(([marketplaceId, bucket]) => ({
        key: `marketplace:${marketplaceId}`,
        title: resolveMarketplaceLabel(marketplaceId, marketplaces, claudeLabel),
        items: bucket.toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale))),
      }))
      .toSorted((a, b) => a.title.localeCompare(b.title));
  }, [intl, locale, marketplaces, personalItems]);
  const searchResults = React.useMemo(
    () => (normalizedQuery ? items.filter((item) => pluginSearchMatch(item, normalizedQuery, locale)).toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale))) : []),
    [items, normalizedQuery, locale],
  );
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((previous) => ({ ...previous, [groupKey]: !previous[groupKey] }));
  };
  return (
    <div className="space-y-8" data-testid="plugin-store-list">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtlest" aria-hidden="true" />
        <Input
          type="text"
          data-testid="plugin-store-search"
          size="lg"
          className="h-11 rounded-2xl pl-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.plugins.store.searchPlaceholder" })}
        />
      </div>
      {installedStrip.length > 0 ? (
        <section data-testid="plugin-store-installed-strip">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: "settings.plugins.store.installedStrip" })}</h2>
            <Tooltip title={intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}>
              <Button
                type="button"
                data-testid="plugin-store-manage-open"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}
                onClick={onOpenManage}
              >
                <IconSettings className="size-4" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
            {installedStrip.map((item) => {
              const displayName = pluginDisplayName(item, locale);
              return (
                <Tooltip key={item.id} title={displayName} side="top">
                  <button
                    type="button"
                    data-testid="plugin-store-installed-item"
                    data-plugin-id={item.id}
                    aria-label={displayName}
                    className="shrink-0 rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                    onClick={() => actions.onOpenDetail(item.id)}
                  >
                    <PluginIcon item={item} className="size-10" />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className="flex items-center gap-1.5">
        <PluginStoreSegmentButton
          active={segment === "public"}
          testId="plugin-store-segment-public"
          label={intl.formatMessage({ id: "settings.plugins.store.segment.public" })}
          onClick={() => onSegmentChange("public")}
        />
        <PluginStoreSegmentButton
          active={segment === "personal"}
          testId="plugin-store-segment-personal"
          label={intl.formatMessage({ id: "settings.plugins.store.segment.personal" })}
          onClick={() => onSegmentChange("personal")}
        />
      </div>
      {normalizedQuery ? (
        <PluginStoreSection
          key="search"
          title={intl.formatMessage({ id: "settings.plugins.store.searchResults" }, { count: String(searchResults.length) })}
        >
          {searchResults.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "settings.plugins.store.searchEmpty" })}
            </p>
          ) : (
            <PluginCardGrid items={searchResults} actions={actions} locale={locale} />
          )}
        </PluginStoreSection>
      ) : segment === "public" ? (
        <PluginStorePublicView
          actions={actions}
          categoryGroups={categoryGroups}
          expandedGroups={expandedGroups}
          featuredItems={featuredItems}
          loading={loading}
          locale={locale}
          resolveCategoryLabel={resolveCategoryLabel}
          onToggleGroup={toggleGroup}
        />
      ) : (
        <PluginStorePersonalView actions={actions} expandedGroups={expandedGroups} groups={personalGroups} locale={locale} recommendedItems={recommendedItems} onToggleGroup={toggleGroup} />
      )}
    </div>
  );
}

/** 原 h0t（199075）：段按钮 */
export function PluginStoreSegmentButton({ active, label, onClick, testId }: { active: boolean; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-ui-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused",
        active ? "bg-selected text-foreground" : "text-foreground-subtle hover:bg-hover hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** 原 d9（199090）：分区（标题 + 分隔 + 内容） */
export function PluginStoreSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div aria-hidden="true" className="h-px bg-surface" />
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** 原 f9（199106）：卡片网格（双列） */
export function PluginCardGrid({ items, actions, locale }: { items: PluginItem[]; actions: PluginStoreActions; locale: string }) {
  return (
    <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
      {items.map((item) => (
        <PluginStoreCard key={item.id} item={item} actions={actions} locale={locale} />
      ))}
    </div>
  );
}

/** 原 g0t（199112）：分组（折叠 6 条 + 查看更多/收起；更多行显示前 3 图标 + 前 2 名） */
export function PluginStoreGroup({
  groupKey,
  items,
  expanded,
  onToggle,
  actions,
  locale,
}: {
  groupKey: string;
  items: PluginItem[];
  expanded: boolean;
  onToggle: (groupKey: string) => void;
  actions: PluginStoreActions;
  locale: string;
}) {
  const { intl } = useIntlContext();
  const visible = expanded ? items : items.slice(0, PLUGIN_GROUP_COLLAPSED_COUNT);
  const hidden = expanded ? [] : items.slice(PLUGIN_GROUP_COLLAPSED_COUNT);
  const hiddenNames = hidden.slice(0, 2).map((item) => pluginDisplayName(item, locale));
  return (
    <div>
      <PluginCardGrid items={visible} actions={actions} locale={locale} />
      {hidden.length > 0 ? (
        <button
          type="button"
          data-testid="plugin-store-group-toggle"
          data-group-key={groupKey}
          className="mt-2 flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-ui-base text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          onClick={() => onToggle(groupKey)}
        >
          <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            {hidden.slice(0, 3).map((item) => (
              <PluginIcon key={item.id} item={item} className="size-5 rounded-md" iconClassName="size-2.5" />
            ))}
          </span>
          <span className="min-w-0 truncate">
            {hidden.length > hiddenNames.length
              ? intl.formatMessage(
                  { id: "settings.plugins.store.viewMore" },
                  { names: hiddenNames.join(intl.formatMessage({ id: "common.listSeparator" })), count: String(hidden.length - hiddenNames.length) },
                )
              : intl.formatMessage({ id: "settings.plugins.store.viewMoreFew" }, { names: hiddenNames.join(intl.formatMessage({ id: "common.listSeparator" })) })}
          </span>
        </button>
      ) : expanded && items.length > PLUGIN_GROUP_COLLAPSED_COUNT ? (
        <button
          type="button"
          data-testid="plugin-store-group-toggle"
          data-group-key={groupKey}
          className="mt-2 rounded-xl px-2 py-2 text-ui-base text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          onClick={() => onToggle(groupKey)}
        >
          {intl.formatMessage({ id: "settings.plugins.store.showLess" })}
        </button>
      ) : null}
    </div>
  );
}

/** 原 _0t（199172）：公共段视图（精选 + 分类组；空态双分支） */
export function PluginStorePublicView({
  actions,
  categoryGroups,
  expandedGroups,
  featuredItems,
  loading,
  locale,
  resolveCategoryLabel,
  onToggleGroup,
}: {
  actions: PluginStoreActions;
  categoryGroups: Array<{ category: string; items: PluginItem[] }>;
  expandedGroups: Record<string, boolean>;
  featuredItems: PluginItem[];
  loading: boolean;
  locale: string;
  resolveCategoryLabel: (category: string) => string;
  onToggleGroup: (groupKey: string) => void;
}) {
  const { intl } = useIntlContext();
  return featuredItems.length === 0 && categoryGroups.length === 0 ? (
    <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
      {loading ? intl.formatMessage({ id: "settings.plugins.marketplace.catalogLoading" }) : intl.formatMessage({ id: "settings.plugins.marketplacePlugins.empty" })}
    </p>
  ) : (
    <div>
      {featuredItems.length > 0 ? (
        <PluginStoreSection title={intl.formatMessage({ id: "settings.plugins.store.featured" })} className="py-4 first:pt-0 last:pb-0">
          <PluginCardGrid items={featuredItems} actions={actions} locale={locale} />
        </PluginStoreSection>
      ) : null}
      {categoryGroups.map((group) => (
        <PluginStoreSection
          key={group.category}
          className="py-4 first:pt-0 last:pb-0"
          title={group.category === "other" ? intl.formatMessage({ id: "settings.plugins.store.category.other" }) : resolveCategoryLabel(group.category)}
        >
          <PluginStoreGroup
            groupKey={`category:${group.category}`}
            items={group.items}
            expanded={expandedGroups[`category:${group.category}`] ?? false}
            onToggle={onToggleGroup}
            actions={actions}
            locale={locale}
          />
        </PluginStoreSection>
      ))}
    </div>
  );
}

/** 原 v0t（199223）：个人段视图（推荐 + 市场组） */
export function PluginStorePersonalView({
  actions,
  expandedGroups,
  groups,
  locale,
  recommendedItems,
  onToggleGroup,
}: {
  actions: PluginStoreActions;
  expandedGroups: Record<string, boolean>;
  groups: Array<{ key: string; title: string; items: PluginItem[] }>;
  locale: string;
  recommendedItems: PluginItem[];
  onToggleGroup: (groupKey: string) => void;
}) {
  const { intl } = useIntlContext();
  return recommendedItems.length === 0 && groups.length === 0 ? (
    <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
      {intl.formatMessage({ id: "settings.plugins.store.personalEmpty" })}
    </p>
  ) : (
    <div>
      {recommendedItems.length > 0 ? (
        <PluginStoreSection title={intl.formatMessage({ id: "settings.plugins.marketplace.recommendTitle" })} className="py-4 first:pt-0 last:pb-0">
          <PluginCardGrid items={recommendedItems} actions={actions} locale={locale} />
        </PluginStoreSection>
      ) : null}
      {groups.map((group) => (
        <PluginStoreSection key={group.key} title={group.title} className="py-4 first:pt-0 last:pb-0">
          <PluginStoreGroup groupKey={group.key} items={group.items} expanded={expandedGroups[group.key] ?? false} onToggle={onToggleGroup} actions={actions} locale={locale} />
        </PluginStoreSection>
      ))}
    </div>
  );
}

/** 原 y0t/b0t/x0t（199267）：组件段序/标题/图标 */
const PLUGIN_COMPONENT_KIND_ORDER = ["mcp", "skill", "command", "agent", "hook"];
const PLUGIN_COMPONENT_KIND_I18N: Record<string, string> = {
  mcp: "settings.plugins.store.section.mcp",
  skill: "settings.plugins.store.section.skills",
  command: "settings.plugins.store.section.commands",
  agent: "settings.plugins.store.section.agents",
  hook: "settings.plugins.store.section.hooks",
};
const PLUGIN_COMPONENT_KIND_ICONS: Record<string, IconComponent> = {
  mcp: IconServer,
  skill: IconSparkle,
  command: IconTerminalSquare,
  agent: IconBot,
  hook: IconWebhook,
};
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（5）：IconServer/IconSparkle/IconTerminalSquare/IconBot/IconWebhook → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

export interface PluginDescribeEntry {
  status: "loading" | "loaded" | "error";
  data?: {
    metadata?: { author?: string; category?: string; version?: string; homepage?: string; privacyPolicy?: string; termsOfService?: string };
    components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }>;
    [key: string]: unknown;
  };
}

/**
 * 原 S0t（199276）：PluginDetail。
 * 返回 + 图标/名/描述/孤儿警示 + 操作簇（开关/菜单/立即体验 | 安装）+ 英雄区 + 组件段 + 信息区 + 高级插槽。
 */
export function PluginDetail({
  item,
  actions,
  describeEntry,
  onBack,
  onRetryDescribe,
  onUsePrompt,
  advanced,
}: {
  item: PluginItem;
  actions: PluginStoreActions;
  describeEntry?: PluginDescribeEntry;
  onBack: () => void;
  onRetryDescribe: () => void;
  onUsePrompt: (item: PluginItem, prompt?: string) => void;
  advanced?: React.ReactNode;
}) {
  const { intl, locale } = useIntlContext();
  const displayName = pluginDisplayName(item, locale);
  const description = pluginDescription(item, locale);
  const heroImage = item.listing?.heroImage;
  const examplePrompts = resolveLocalizedList(locale, item.listing?.examplePrompts, item.listing?.examplePromptsI18n) ?? [];
  const describeMetadata = describeEntry?.status === "loaded" ? describeEntry.data?.metadata : undefined;
  const components = item.info ? extractComponentsFromInfo(item.info) : describeEntry?.status === "loaded" && describeEntry.data ? extractComponentsFromDescribe(describeEntry.data) : [];
  const orderedComponents = PLUGIN_COMPONENT_KIND_ORDER.map((kind) => components.find((component) => component.kind === kind)).filter(
    (component): component is { kind: string; count: number; items: Array<{ name: string; description?: string }> } => component !== undefined,
  );
  const componentsLoading = !item.info && (describeEntry?.status ?? "loading") === "loading";
  const componentsError = !item.info && describeEntry?.status === "error";
  return (
    <div className="space-y-8" data-testid="plugin-store-detail" data-plugin-id={item.id}>
      <div>
        <BackLinkButton data-testid="plugin-store-detail-back" onClick={onBack}>
          {intl.formatMessage({ id: "settings.plugins.store.back" })}
        </BackLinkButton>
      </div>
      <div className="space-y-3">
        <PluginIcon item={item} className="size-16 rounded-2xl" iconClassName="size-6" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
            {description ? <p className="mt-1 text-ui-base text-foreground-subtle">{description}</p> : null}
            {item.orphaned ? (
              <p data-testid="plugin-store-source-degraded" data-plugin-id={item.id} className="mt-2 flex items-center gap-1.5 text-ui-base text-warning">
                <IconAlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                {intl.formatMessage({ id: "settings.plugins.store.sourceMissing" })}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1">
            {item.installed ? (
              <>
                {item.info ? <PluginEnabledSwitch item={item} actions={actions} /> : null}
                <PluginItemMenu item={item} actions={actions} />
                <Button type="button" variant="default" size="sm" className="rounded-full" data-testid="plugin-store-try-now" data-plugin-id={item.id} onClick={() => onUsePrompt(item, "")}>
                  <IconMessageSquarePlus className="size-3.5" aria-hidden="true" />
                  {intl.formatMessage({ id: "settings.plugins.store.tryNow" })}
                </Button>
              </>
            ) : (
              <PluginInstallButton item={item} actions={actions} size="default" />
            )}
          </div>
        </div>
      </div>
      {isHttpsUrl(heroImage) || examplePrompts.length > 0 ? (
        <MarketEntryCard item={item} displayName={displayName} examplePrompts={examplePrompts} heroImage={heroImage} onUsePrompt={onUsePrompt} />
      ) : null}
      {componentsLoading ? (
        <div className="flex items-center gap-2 py-2 text-ui-base text-foreground-subtle" data-testid="plugin-store-components-loading">
          <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" />
          <span>{intl.formatMessage({ id: "settings.plugins.marketplace.componentsLoading" })}</span>
        </div>
      ) : componentsError ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-ui-base text-foreground-subtle" data-testid="plugin-store-components-error">
          <span>{intl.formatMessage({ id: "settings.plugins.marketplace.componentsError" })}</span>
          <Button type="button" variant="outline" size="sm" data-testid="plugin-store-components-retry" onClick={onRetryDescribe}>
            <IconRefresh className="size-3" aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.marketplace.componentsRetry" })}
          </Button>
        </div>
      ) : (
        orderedComponents.map((component) => <PluginComponentSection key={component.kind} group={component} />)
      )}
      <PluginDetailInfo item={item} describeMetadata={describeMetadata} />
      {advanced}
    </div>
  );
}

/** Settings.tsx 已抽取：返回链接按钮 */

/** 原 YQt（193070）：info.components → 组件摘要 */
export function extractComponentsFromInfo(info: NonNullable<PluginItem["info"]>): Array<{ kind: string; count: number; items: Array<{ name: string; description?: string }> }> {
  const byKind = new Map<string, { kind: string; count: number; items: Array<{ name: string; description?: string }> }>();
  for (const component of info.components ?? []) {
    if (component.items.length === 0) continue;
    byKind.set(component.kind, {
      kind: component.kind,
      count: component.items.length,
      items: component.items.map((entry) => ({ name: entry.name, ...(entry.description ? { description: entry.description } : {}) })),
    });
  }
  return ["agent", "command", "skill", "hook", "mcp"].map((kind) => byKind.get(kind)).filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
}

/** 原 JQt（193056）：describe.components → 组件摘要（同构） */
export function extractComponentsFromDescribe(data: { components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }> }): Array<{
  kind: string;
  count: number;
  items: Array<{ name: string; description?: string }>;
}> {
  const byKind = new Map<string, { kind: string; count: number; items: Array<{ name: string; description?: string }> }>();
  for (const component of data.components ?? []) {
    if (component.items.length === 0) continue;
    byKind.set(component.kind, {
      kind: component.kind,
      count: component.items.length,
      items: component.items.map((entry) => ({ name: entry.name, ...(entry.description ? { description: entry.description } : {}) })),
    });
  }
  return ["agent", "command", "skill", "hook", "mcp"].map((kind) => byKind.get(kind)).filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
}

/** 原 oV（64229）：https URL 判定 */
export function isHttpsUrl(value: string | undefined | null): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

/** 原 C0t（199415）：市场条目卡（英雄图 + 悬浮示例提示词；图失败降级为普通卡） */
export function MarketEntryCard({
  item,
  displayName,
  examplePrompts,
  heroImage,
  onUsePrompt,
}: {
  item: PluginItem;
  displayName: string;
  examplePrompts: string[];
  heroImage?: string;
  onUsePrompt: (item: PluginItem, prompt?: string) => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const heroMode = isHttpsUrl(heroImage) && !imageFailed;
  const promptButtons = examplePrompts.map((prompt) => (
    <button
      key={prompt}
      type="button"
      data-testid="plugin-store-example-prompt"
      data-plugin-id={item.id}
      className={
        heroMode
          ? "group/prompt flex max-w-full items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-left text-ui-base text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          : "group/prompt flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-left text-ui-base text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
      }
      onClick={() => onUsePrompt(item, prompt)}
    >
      <PluginIcon item={item} className="size-5 rounded-md" iconClassName="size-2.5" />
      <span className={heroMode ? "shrink-0 font-medium text-white/70" : "shrink-0 font-medium text-foreground-subtle"}>{displayName}</span>
      <span className="min-w-0 truncate">{prompt}</span>
      <span
        aria-hidden="true"
        className={
          heroMode
            ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors group-hover/prompt:bg-white/25"
            : "flex size-6 shrink-0 items-center justify-center rounded-full bg-surface transition-colors group-hover/prompt:bg-hover"
        }
      >
        <IconArrowUpRight className="size-3.5" />
      </span>
    </button>
  ));
  return heroMode ? (
    <div className="relative overflow-hidden rounded-2xl">
      <img src={heroImage} alt="" aria-hidden="true" draggable={false} className="h-72 w-full select-none object-cover" onError={() => setImageFailed(true)} />
      {promptButtons.length > 0 ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">{promptButtons}</div> : null}
    </div>
  ) : promptButtons.length === 0 ? null : (
    <div className="flex flex-col items-stretch gap-2">{promptButtons}</div>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconArrowUpRight → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 w0t（199474）：组件段（标题 + 计数 + 条目列表） */
export function PluginComponentSection({ group }: { group: { kind: string; count: number; items: Array<{ name: string; description?: string }> } }) {
  const { intl } = useIntlContext();
  const Icon = PLUGIN_COMPONENT_KIND_ICONS[group.kind];
  return (
    <section data-testid="plugin-store-component-section" data-component-kind={group.kind}>
      <div className="flex items-baseline gap-2 border-b border-border pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: PLUGIN_COMPONENT_KIND_I18N[group.kind] })}</h2>
        <span className="text-ui-base text-foreground-subtle">{group.count}</span>
      </div>
      <ul className="mt-1 divide-y divide-border/60">
        {group.items.map((entry) => (
          <li key={entry.name} className="flex min-w-0 items-center gap-3 py-2.5">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-ui-base font-medium text-foreground">{entry.name}</div>
              {entry.description ? <div className="mt-0.5 line-clamp-1 text-ui-base text-foreground-subtle">{entry.description}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 原 T0t（199531）：信息区（开发者/分类/版本 + 网站/隐私/条款链接；全空 → null） */
export function PluginDetailInfo({ item, describeMetadata }: { item: PluginItem; describeMetadata?: { author?: string; category?: string; version?: string; homepage?: string; privacyPolicy?: string; termsOfService?: string } }) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const listing = item.listing;
  const author = listing?.author ?? item.info?.author ?? describeMetadata?.author;
  const category = listing?.category;
  const categoryI18nId = category ? PLUGIN_CATEGORY_I18N[category] : undefined;
  const categoryLabel = category ? (categoryI18nId ? intl.formatMessage({ id: categoryI18nId }) : category) : undefined;
  const version = item.info?.version ?? item.installedMeta?.version ?? item.summary?.version ?? describeMetadata?.version;
  const homepage = firstHttpsUrl(listing?.homepage, item.info?.homepage, describeMetadata?.homepage);
  const privacyPolicy = firstHttpsUrl(listing?.privacyPolicy);
  const termsOfService = firstHttpsUrl(listing?.termsOfService);
  const fields: Array<{ key: string; label: string; value: string }> = [];
  if (author) fields.push({ key: "developer", label: intl.formatMessage({ id: "settings.plugins.store.info.developer" }), value: author });
  if (categoryLabel) fields.push({ key: "category", label: intl.formatMessage({ id: "settings.plugins.store.info.category" }), value: categoryLabel });
  if (version) fields.push({ key: "version", label: intl.formatMessage({ id: "settings.plugins.store.info.version" }), value: version });
  const links: Array<{ key: string; label: string; url: string }> = [];
  if (homepage) links.push({ key: "website", label: intl.formatMessage({ id: "settings.plugins.store.info.website" }), url: homepage });
  if (privacyPolicy) links.push({ key: "privacyPolicy", label: intl.formatMessage({ id: "settings.plugins.store.info.privacyPolicy" }), url: privacyPolicy });
  if (termsOfService) links.push({ key: "termsOfService", label: intl.formatMessage({ id: "settings.plugins.store.info.termsOfService" }), url: termsOfService });
  return fields.length === 0 && links.length === 0 ? null : (
    <section>
      <div className="border-b border-border pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: "settings.plugins.store.info.title" })}</h2>
      </div>
      <dl className="mt-3 space-y-2.5">
        {fields.map((field) => (
          <div key={field.key} className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-ui-base text-foreground-subtle">{field.label}</dt>
            <dd className="min-w-0 truncate text-ui-base text-foreground">{field.value}</dd>
          </div>
        ))}
        {links.map((link) => (
          <div key={link.key} className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-ui-base text-foreground-subtle">{link.label}</dt>
            <dd className="min-w-0">
              <button
                type="button"
                title={link.url}
                aria-label={`${link.label}: ${link.url}`}
                className="inline-flex items-center gap-1 rounded-md text-ui-base text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                onClick={() => platform?.openExternal(link.url)}
              >
                <IconExternalLink className="size-3.5" aria-hidden="true" />
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 原 p9（199650）：取第一个 https:// 值（原返回 find 直值；此处 null → undefined 归一，行为等价） */
export function firstHttpsUrl(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((candidate) => typeof candidate === "string" && candidate.startsWith("https://")) ?? undefined;
}

/** 原 E0t（199653）：高级信息折叠（details/summary + 旋转箭头） */
export function PluginAdvancedSection({ children }: { children: React.ReactNode }) {
  const { intl } = useIntlContext();
  return (
    <details className="group/advanced border-t border-border pt-4" data-testid="plugin-store-advanced">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-ui-base font-medium text-foreground-subtle transition-colors hover:text-foreground">
        <IconChevronRight className="size-3.5 transition-transform group-open/advanced:rotate-90" aria-hidden="true" />
        {intl.formatMessage({ id: "settings.plugins.detail.moreDetails" })}
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

/** 原 D0t（199673）：PluginManageList（返回 + 标题 + 远程同步/检查更新/过滤 + 已装列表） */
export function PluginManageList({
  plugins,
  installedPluginMetaById,
  loading,
  enabledFilter,
  onEnabledFilterChange,
  togglingPluginId,
  checkingUpdates,
  showRemoteSync,
  renderPluginSource,
  storeItemById,
  onBack,
  onCheckUpdates,
  onOpenRemoteSync,
  onSelectPlugin,
  onPluginEnabledChange,
}: {
  plugins: Array<{ id: string; name: string; version?: string; description?: string; enabled: boolean }>;
  installedPluginMetaById: Map<string, { updateStatus?: string }>;
  loading: boolean;
  enabledFilter: string;
  onEnabledFilterChange: (filter: string) => void;
  togglingPluginId: string | null;
  checkingUpdates: boolean;
  showRemoteSync: boolean;
  renderPluginSource: (item: { id: string; name: string }) => string;
  storeItemById: Map<string, PluginItem>;
  onBack: () => void;
  onCheckUpdates: () => void;
  onOpenRemoteSync: () => void;
  onSelectPlugin: (pluginId: string) => void;
  onPluginEnabledChange: (pluginId: string, enabled: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className="space-y-4" data-testid="plugin-store-manage">
      <div>
        <BackLinkButton data-testid="plugin-store-manage-back" onClick={onBack}>
          {intl.formatMessage({ id: "settings.plugins.store.back" })}
        </BackLinkButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}</h1>
        <div className="flex items-center gap-1.5">
          {showRemoteSync ? (
            <Tooltip title={intl.formatMessage({ id: "settings.plugins.remoteSync.open" })}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={intl.formatMessage({ id: "settings.plugins.remoteSync.open" })} onClick={onOpenRemoteSync}>
                <IconCloudUpload className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
          <Button type="button" data-testid="plugin-store-check-updates" variant="ghost" size="sm" disabled={checkingUpdates} onClick={onCheckUpdates}>
            <IconRefresh className={checkingUpdates ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.checkForUpdates" })}
          </Button>
          <ResourceEnabledFilterSelect value={enabledFilter} onValueChange={onEnabledFilterChange} ariaLabel={intl.formatMessage({ id: "settings.plugins.filter.label" })} />
        </div>
      </div>
      <PluginInstalledList
        filteredPlugins={plugins}
        handlePluginEnabledChange={onPluginEnabledChange}
        installedPluginMetaById={installedPluginMetaById}
        loading={loading}
        renderPluginSource={renderPluginSource}
        selectedPluginId={null}
        storeItemById={storeItemById}
        togglingPluginId={togglingPluginId}
        onSelectPlugin={onSelectPlugin}
      />
    </div>
  );
}

/** SettingsPanelsCapability.tsx 已抽取（原 h1t，195930）：启用过滤下拉 */

/** 原 O0t（199763）：市场可删除判定（官方/内置不可删） */
export function isRemovableMarketplace(marketplace: { id: string }): boolean {
  return !(isOfficialMarketplace(marketplace.id) || marketplace.id === RECOMMENDED_MARKETPLACE);
}

/** 原 k0t（199766）：市场刷新失败提示 */
export function MarketplaceRefreshFailure({ failure }: { failure: { failedAt: number; message: string } }) {
  const { intl } = useIntlContext();
  return (
    <div className="mt-1 flex min-w-0 items-start gap-1 text-ui-xs text-destructive" data-testid="plugin-store-source-refresh-failure">
      <IconAlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">
        {intl.formatMessage({ id: "settings.plugins.store.sources.refreshFailed" }, { time: formatMarketplaceTime(failure.failedAt) })}
        {`: ${failure.message}`}
      </span>
    </div>
  );
}

/** 原 A0t（199786）：市场源对话框（行 = 名/插件数/更新时间/失败提示 + 刷新/删除） */
export function PluginSourcesDialog({
  open,
  onOpenChange,
  marketplaces,
  onUpdateMarketplace,
  onRemoveMarketplace,
  operationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplaces: Array<{ id: string; pluginCount?: number; lastUpdated?: number | null; refreshFailure?: { failedAt: number; message: string } }>;
  onUpdateMarketplace: (marketplaceId: string) => void;
  onRemoveMarketplace: (marketplaceId: string) => void;
  operationId: string | null;
}) {
  const { intl } = useIntlContext();
  const claudeLabel = intl.formatMessage({ id: "settings.plugins.marketplace.claudeCodePlugins" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(480px,calc(100vw-2rem))] max-w-none gap-3" data-testid="plugin-store-sources-dialog">
        <DialogTitle className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.store.sources.title" })}</DialogTitle>
        <div className="max-h-[min(420px,60vh)] space-y-1 overflow-y-auto">
          {marketplaces.length === 0 ? (
            <p className="px-1 py-2 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.store.sources.empty" })}</p>
          ) : (
            marketplaces.map((marketplace) => {
              const updating = operationId === `marketplace:update:${marketplace.id}`;
              const removing = operationId === `marketplace:remove:${marketplace.id}`;
              return (
                <div key={marketplace.id} data-testid="plugin-store-source-row" data-marketplace-id={marketplace.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-hover">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-ui-base font-medium text-foreground">{resolveMarketplaceLabel(marketplace.id, [marketplace], claudeLabel)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-ui-xs text-foreground-subtle">
                      {intl.formatMessage({ id: "settings.plugins.store.sources.pluginCount" }, { count: String(marketplace.pluginCount) })}
                      {marketplace.lastUpdated
                        ? ` · ${intl.formatMessage({ id: "settings.plugins.store.sources.lastUpdated" }, { time: formatMarketplaceTime(marketplace.lastUpdated) })}`
                        : ""}
                    </div>
                    {marketplace.refreshFailure ? <MarketplaceRefreshFailure failure={marketplace.refreshFailure} /> : null}
                  </div>
                  <Button
                    type="button"
                    data-testid="plugin-store-source-update"
                    data-marketplace-id={marketplace.id}
                    variant="ghost"
                    size="icon-sm"
                    aria-label={intl.formatMessage({ id: "settings.plugins.store.sources.update" })}
                    disabled={updating}
                    onClick={() => onUpdateMarketplace(marketplace.id)}
                  >
                    <IconRefresh className={updating ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
                  </Button>
                  {isRemovableMarketplace(marketplace) ? (
                    <Button
                      type="button"
                      data-testid="plugin-store-source-remove"
                      data-marketplace-id={marketplace.id}
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={intl.formatMessage({ id: "settings.plugins.store.sources.remove" })}
                      disabled={removing}
                      onClick={() => onRemoveMarketplace(marketplace.id)}
                    >
                      {removing ? <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" /> : <IconTrash className="size-3.5" aria-hidden="true" />}
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 原 j0t（199899）：市场时间格式化（本地化；非法 → 原值） */
export function formatMarketplaceTime(value: number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

/** 原 M0t（199903）：卸载确认对话框 */
export function PluginUninstallDialog({
  open,
  pluginName,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pluginName: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { intl } = useIntlContext();
  return (
    <AlertDialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent data-testid="plugin-store-uninstall-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{intl.formatMessage({ id: "settings.plugins.uninstall.confirmTitle" }, { name: pluginName })}</AlertDialogTitle>
          <AlertDialogDescription>{intl.formatMessage({ id: "settings.plugins.uninstall.confirmDescription" })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" size="sm" data-testid="plugin-store-uninstall-cancel" disabled={pending}>
            {intl.formatMessage({ id: "common.cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            data-testid="plugin-store-uninstall-confirm"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {intl.formatMessage({ id: "settings.plugins.uninstall.confirm" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

/** 原 N0t（199952）：卸载流状态机（请求/取消/确认；忙碌判定 = 操作 id） */
export function useUninstallFlow(opts: {
  pluginService: PluginService; // A0-CLEANUP3 3b：store uninstallPlugin 形参面具型
  installedPlugins: Array<{ id: string; [key: string]: unknown }>;
  plugins: PluginItem[];
  operationId: string | null;
  onAfterUninstall: () => Promise<void>;
}): {
  pendingPlugin: { name: string } | null;
  uninstalling: boolean;
  requestUninstall: (pluginId: string) => void;
  cancelUninstall: () => void;
  confirmUninstall: () => Promise<void>;
} {
  const uninstallPlugin = usePluginsStore((state) => state.uninstallPlugin);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  return {
    pendingPlugin: React.useMemo(
      () => (pendingId ? opts.installedPlugins.find((plugin) => plugin.id === pendingId) ?? opts.plugins.find((plugin) => plugin.id === pendingId) ?? null : null),
      [opts.installedPlugins, pendingId, opts.plugins],
    ) as { name: string } | null,
    uninstalling: pendingId !== null && opts.operationId === `plugin:uninstall:${pendingId}`,
    requestUninstall: React.useCallback((pluginId: string) => {
      setPendingId(pluginId);
    }, []),
    cancelUninstall: React.useCallback(() => {
      setPendingId(null);
    }, []),
    confirmUninstall: React.useCallback(async () => {
      if (pendingId) {
        await uninstallPlugin(pendingId, opts.pluginService);
        await opts.onAfterUninstall();
        setPendingId(null);
      }
    }, [opts.pluginService, opts.onAfterUninstall, pendingId, uninstallPlugin]),
  };
}

/** 原 P0t（199978）：插件 → 聊天提及条目 */
export function buildPluginMentionEntry({ item, locale }: { item: PluginItem; locale: string }): {
  id: string;
  category: string;
  label: string;
  value: string;
  markdown: string;
  data: { pluginId: string; icon?: string };
} {
  const displayName = pluginDisplayName(item, locale);
  return {
    id: `plugin:${item.id}`,
    category: "plugins",
    label: displayName,
    value: item.id,
    markdown: pluginMentionMarkdown(displayName, item.id),
    data: { pluginId: item.id, ...(item.listing?.icon ? { icon: item.listing.icon } : {}) },
  };
}

/** 原 F0t（199989）：聊天提示词构造（提及 + 追加提示） */
export function buildPluginChatPrompt({ item, locale, prompt }: { item: PluginItem; locale: string; prompt?: string }): string { // A0-CLEANUP3 3b：bundle F0t（159974）prompt 可选
  const markdown = buildPluginMentionEntry({ item, locale }).markdown;
  const trimmed = (prompt ?? "").trim();
  return trimmed ? `${markdown} ${trimmed}` : markdown;
}

/* ============================================================================
 * §C. 自动化编辑器（F15 深层；原 js 109250–109510 + 134026–138512）
 * ==========================================================================*/

/* --- C.1 cron 域（原 109250–109510；F03 段双归属，F15 消费） --- */

export interface AutomationTaskLite {
  automationId: string; // A0-CLEANUP3 3b §C：与 SPC.AutomationTask/StoresDeep.Automation 对齐（运行期恒有值，编辑器 ?? 为防御）
  title: string;
  prompt: string;
  cronExpr: string;
  enabled: boolean;
  lifecycleStatus?: string;
  targetTaskId?: string | null;
  scheduleEditedByUser?: boolean;
  scheduleRule?: ScheduleRule | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceKey?: string | null;
  model?: string | null;
  provider?: string | null;
  mode?: string;
  recurring?: boolean;
  endAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

/** 原 qht（109250）：状态归一（生命周期 → active/paused/completed/failed） */
export function automationStatusOf(automation: AutomationTaskLite): "active" | "paused" | "completed" | "failed" {
  return automation.lifecycleStatus === "failed"
    ? "failed"
    : automation.lifecycleStatus === "completed"
      ? "completed"
      : automation.lifecycleStatus === "paused" || !automation.enabled
        ? "paused"
        : "active";
}

/** 原 q$（109259）：周序（周一起始显示序） */
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
/** 原 J$：补零 */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
/** 原 Jht：30 天阈值（相对时间 ↔ 绝对时间切换） */
const NEXT_RUN_RELATIVE_WINDOW_MS = 720 * 60 * 60 * 1000;

/** 原 Yht（109262）：聊天创建判定（有目标任务） */
export function isChatCreatedAutomation(automation: AutomationTaskLite | null | undefined): boolean {
  return !!automation?.targetTaskId?.trim();
}

export interface ScheduleBuilderState {
  frequency: "hourly" | "daily" | "weekdays" | "weekly" | "monthly" | "custom";
  hour: number;
  minute: number;
  weekdays: number[];
  dayOfMonth: number;
  rawExpr: string;
  customInterval: number;
  customUnit: "minute" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  customWeekdays: number[];
  customMonthDays: number[];
  customMonth: number;
  customMonthlyMode: "date" | "weekday";
}

/** 原 Y$（109265）：构建态 → cron 表达式（六分支；custom 按单位细分） */
export function scheduleBuilderToCron(state: ScheduleBuilderState): string {
  const { frequency, hour, minute, weekdays, dayOfMonth, rawExpr } = state;
  switch (frequency) {
    case "hourly":
      return `${minute} * * * *`;
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekdays":
      return `${minute} ${hour} * * 1-5`;
    case "weekly":
      return `${minute} ${hour} * * ${weekdays.length > 0 ? [...weekdays].sort((a, b) => a - b).join(",") : "*"}`;
    case "monthly":
      return `${minute} ${hour} ${dayOfMonth} * *`;
    case "custom": {
      const interval = Math.max(1, Math.floor(state.customInterval));
      if (state.customUnit === "minute") return interval <= 59 ? `*/${interval} * * * *` : "* * * * *";
      if (state.customUnit === "hourly") return interval <= 24 ? `${minute} */${interval} * * *` : `${minute} * * * *`;
      if (state.customUnit === "daily") return interval <= 31 ? `${minute} ${hour} */${interval} * *` : `${minute} ${hour} * * *`;
      if (state.customUnit === "weekly")
        return `${minute} ${hour} * * ${state.customWeekdays.length > 0 ? state.customWeekdays.join(",") : "1"}`;
      if (state.customUnit === "monthly")
        return state.customMonthlyMode === "weekday"
          ? `${minute} ${hour} * * ${state.customWeekdays[0] ?? 1}#1`
          : `${minute} ${hour} ${state.customMonthDays.length > 0 ? state.customMonthDays.join(",") : "1"} * *`;
      const month = Math.min(12, Math.max(1, Math.floor(state.customMonth)));
      return `${minute} ${hour} ${state.customMonthDays[0] ?? new Date().getDate()} ${month} *`;
    }
    default:
      return rawExpr.trim();
  }
}

/** 原 X$（109296）：cron → 构建态（可表示形式识别；缺省回落 custom 每日） */
export function cronToScheduleBuilder(expr: string): ScheduleBuilderState {
  const base: ScheduleBuilderState = {
    frequency: "custom",
    hour: 9,
    minute: 0,
    weekdays: [1],
    dayOfMonth: 1,
    rawExpr: expr,
    customInterval: 1,
    customUnit: "daily",
    customWeekdays: [1],
    customMonthDays: [1],
    customMonth: new Date().getMonth() + 1,
    customMonthlyMode: "date",
  };
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return base;
  const [minuteExpr, hourExpr, dayExpr, monthExpr, weekdayExpr] = parts;
  const minute = Number(minuteExpr);
  const hour = Number(hourExpr);
  const isNumeric = (value: string) => /^\d+$/.test(value);
  const minuteStep = /^\*\/([1-9]\d*)$/.exec(minuteExpr);
  if (minuteStep && hourExpr === "*" && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", customInterval: Number(minuteStep[1]), customUnit: "minute" };
  const hourStep = /^\*\/(\d+)$/.exec(hourExpr);
  if (isNumeric(minuteExpr) && hourStep && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", minute, customInterval: Math.max(1, Number(hourStep[1])), customUnit: "hourly" };
  const dayStep = /^\*\/(\d+)$/.exec(dayExpr);
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayStep && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", hour, minute, customInterval: Math.max(1, Number(dayStep[1])), customUnit: "daily" };
  if (isNumeric(minuteExpr) && hourExpr === "*" && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "hourly", minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "daily", hour, minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "1-5")
    return { ...base, frequency: "weekdays", hour, minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr !== "*") {
    const days = weekdayExpr
      .split(",")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
    if (days.length > 0) return { ...base, frequency: "weekly", hour, minute, weekdays: days };
  }
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && isNumeric(dayExpr) && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "monthly", hour, minute, dayOfMonth: Number(dayExpr) };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && isNumeric(dayExpr) && monthExpr !== "*" && weekdayExpr === "*") {
    const month = Number(monthExpr);
    if (month >= 1 && month <= 12)
      return { ...base, frequency: "custom", hour, minute, customUnit: "yearly", customMonth: month, customMonthDays: [Number(dayExpr)] };
  }
  return base;
}

/** 原 Z$（109373）：星期标签 */
export function weekdayLabel(weekday: number, intl: IntlShape): string {
  return intl.formatMessage({ id: `automations.weekday.${weekday}` });
}

/** 原 Q$（109376）：构建态 → 预览文案（频率分支 + custom 单位细分） */
export function schedulePreviewText(state: ScheduleBuilderState, intl: IntlShape): string {
  const time = `${pad2(state.hour)}:${pad2(state.minute)}`;
  switch (state.frequency) {
    case "hourly":
      return intl.formatMessage({ id: "automations.schedule.hourly" }, { minute: pad2(state.minute) });
    case "daily":
      return intl.formatMessage({ id: "automations.schedule.daily" }, { time });
    case "weekdays":
      return intl.formatMessage({ id: "automations.schedule.weekdays" }, { time });
    case "weekly": {
      const days = [...state.weekdays]
        .sort((a, b) => WEEKDAY_DISPLAY_ORDER.indexOf(a) - WEEKDAY_DISPLAY_ORDER.indexOf(b))
        .map((weekday) => weekdayLabel(weekday, intl))
        .join("、");
      return intl.formatMessage({ id: "automations.schedule.weekly" }, { days, time });
    }
    case "monthly":
      return intl.formatMessage({ id: "automations.schedule.monthly" }, { day: String(state.dayOfMonth), time });
    case "custom":
      if (state.customUnit === "minute")
        return intl.formatMessage({ id: "automations.schedule.customMinutes" }, { interval: String(state.customInterval) });
      if (state.customUnit === "hourly")
        return intl.formatMessage({ id: "automations.schedule.customHourly" }, { interval: String(state.customInterval), time: pad2(state.minute) });
      if (state.customUnit === "weekly") {
        const days = state.customWeekdays
          .map((weekday) => weekdayLabel(weekday, intl))
          .join(intl.formatMessage({ id: "automations.weekday.separator" }));
        return intl.formatMessage({ id: "automations.schedule.customWeekly" }, { interval: String(state.customInterval), days, time });
      }
      return state.customUnit === "monthly"
        ? state.customMonthlyMode === "weekday"
          ? intl.formatMessage(
              { id: "automations.schedule.customMonthlyWeekday" },
              { interval: String(state.customInterval), day: weekdayLabel(state.customWeekdays[0] ?? 1, intl), time },
            )
          : intl.formatMessage(
              { id: "automations.schedule.customMonthlyDates" },
              { interval: String(state.customInterval), days: state.customMonthDays.join(", "), time },
            )
        : state.customUnit === "yearly"
          ? intl.formatMessage(
              { id: "automations.schedule.customYearly" },
              { interval: String(state.customInterval), month: String(state.customMonth), day: String(state.customMonthDays[0] ?? 1), time },
            )
          : intl.formatMessage(
              { id: "automations.schedule.custom" },
              { interval: String(state.customInterval), unit: intl.formatMessage({ id: "automations.customRepeat.unit.day" }), time },
            );
    default:
      return state.rawExpr;
  }
}

/** 原 Xht（109449）：cron 预览（星号/N 分钟直通；不可表示 → 自定义；否则构建态预览） */
export function cronPreviewText(expr: string, intl: IntlShape): string {
  const normalized = expr.trim().replace(/\s+/g, " ");
  const minuteStep = /^\*\/([1-9]\d*) \* \* \* \*$/.exec(normalized);
  if (minuteStep) return intl.formatMessage({ id: "automations.schedule.customMinutes" }, { interval: minuteStep[1] });
  if (/^\d+ \d+ \d+ \d+ \*$/.test(normalized) || /^\d+ \d+ \d+ \*\/\d+ \*$/.test(normalized))
    return intl.formatMessage({ id: "automations.frequency.custom" });
  const builder = cronToScheduleBuilder(normalized);
  return builder.frequency === "custom" && scheduleBuilderToCron(builder) !== normalized
    ? intl.formatMessage({ id: "automations.frequency.custom" })
    : schedulePreviewText(builder, intl);
}

/** 原 Zht（109460）：cron 可表示判定（日级固定/步进除外） */
export function isRepresentableCron(expr: string): boolean {
  const normalized = expr.trim().replace(/\s+/g, " ");
  return /^\d+ \d+ \d+ \d+ \*$/.test(normalized) || /^\d+ \d+ \d+ \*\/\d+ \*$/.test(normalized)
    ? false
    : scheduleBuilderToCron(cronToScheduleBuilder(normalized)) === normalized;
}

/** 原 Qht（109466）：GMT 偏移标签（分钟 → `GMT+H[:MM]`） */
export function gmtOffsetLabel(offsetMinutes = -new Date().getTimezoneOffset()): string {
  if (offsetMinutes === 0) return "GMT";
  const sign = offsetMinutes > 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `GMT${sign}${hours}${minutes > 0 ? `:${pad2(minutes)}` : ""}`;
}

/** 原 $$（109474）：日期时间格式化（`YYYY-MM-DD HH:mm`；空 → `-`） */
export function formatDateTime(value: number | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** 原 $ht（109478）：相对时间标签（分/时/日 + 前后） */
export function relativeTimeLabel(target: number, now: number, intl: IntlShape): string {
  const delta = target - now;
  const abs = Math.abs(delta);
  const future = delta >= 0;
  const minuteMs = 60000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  let value: number;
  let unitId: string;
  if (abs < minuteMs) return intl.formatMessage({ id: future ? "automations.time.soon" : "automations.time.justNow" });
  if (abs < hourMs) {
    value = Math.round(abs / minuteMs);
    unitId = "automations.time.minutes";
  } else if (abs < dayMs) {
    value = Math.round(abs / hourMs);
    unitId = "automations.time.hours";
  } else {
    value = Math.round(abs / dayMs);
    unitId = "automations.time.days";
  }
  const amount = intl.formatMessage({ id: unitId }, { value: String(value) });
  return intl.formatMessage({ id: future ? "automations.time.in" : "automations.time.ago" }, { amount });
}

/** 原 egt（109498）：下次运行标签（过去/空 → null；30 天内相对；否则绝对） */
export function resolveNextRunLabel(target: number | null | undefined, now: number, intl: IntlShape): string | null {
  return !target || target <= now ? null : target - now <= NEXT_RUN_RELATIVE_WINDOW_MS ? relativeTimeLabel(target, now, intl) : formatDateTime(target);
}

/** 原 tgt（109502）：运行时长（`Ns` / `Nm Ns`） */
export function formatRunDuration(createdAt: number | undefined, updatedAt: number | undefined): string {
  if (!createdAt || !updatedAt || updatedAt < createdAt) return "-";
  const seconds = Math.round((updatedAt - createdAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes <= 0 ? `${rest}s` : `${minutes}m ${rest}s`;
}

/* --- C.2 F15 助手群（原 134026–135575） --- */

/** 原 Rjt（134026）：缺省标题联动（编辑/有初始标题/已触碰/非缺省漂移 → 保持；YMt 消费） */
export function resolveTitleOnDefaultChange(args: {
  currentTitle: string;
  hasInitialTitle: boolean;
  isEditing: boolean;
  nextDefaultTitle: string;
  previousDefaultTitle: string;
  titleTouched: boolean;
}): string {
  return args.isEditing || args.hasInitialTitle || args.titleTouched || args.currentTitle !== args.previousDefaultTitle
    ? args.currentTitle
    : args.nextDefaultTitle;
}

/** 原 ZMt（136058）：同 Rjt 逻辑，字段名 hasInitialDraft（kNt 消费；源码为重复实现） */
export function resolveDraftTitleOnDefaultChange(args: {
  currentTitle: string;
  hasInitialDraft: boolean;
  isEditing: boolean;
  nextDefaultTitle: string;
  previousDefaultTitle: string;
  titleTouched: boolean;
}): string {
  return args.isEditing || args.hasInitialDraft || args.titleTouched || args.currentTitle !== args.previousDefaultTitle
    ? args.currentTitle
    : args.nextDefaultTitle;
}

/** 原 Gjt（134428）：KeepAwakeSwitch（role=switch 自绘；蓝=品牌色/绿=成功色） */
export function KeepAwakeSwitch({
  checked,
  onChange,
  ariaLabel,
  color = "green",
  size = "default",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  color?: "blue" | "green";
  size?: "default" | "sm";
}) {
  const activeClass = color === "blue" ? "bg-brand" : "bg-success";
  const small = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid="automation-switch-toggle"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-[background-color,box-shadow] hover:ring-2 hover:ring-border-hover focus-visible:ring-2 focus-visible:ring-input-border-focused/30",
        checked ? activeClass : "bg-input",
        small ? "h-4 w-8" : "h-5 w-9",
      )}
    >
      <span
        className={cn(
          "absolute inline-block size-3.5 rounded-full shadow transition-all duration-200",
          checked ? (color === "blue" ? "bg-foreground-inverse" : "bg-success-foreground") : "bg-primary",
          checked ? (small ? "left-[17px]" : "left-[18px]") : "left-px",
        )}
      />
    </button>
  );
}

/** 原 E3（134452）：图标尺寸缺省（16/2px） */
const AUTOMATION_ICON_PROPS = { size: 16, strokeWidth: 2 };
/** 原 D3（134453）：chevron 指示容器 */
export function AutomationChevronIndicator({ size = 12, containerSize = 20 }: { size?: number; containerSize?: number }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center", containerSize === 18 ? "size-4.5" : "size-5")} aria-hidden="true">
      <IconChevronDown size={size} strokeWidth={2} className={size === 14 ? "size-3.5" : "size-3"} />
    </span>
  );
}
/** 原 Kjt/O3/qjt/k3/A3/Jjt/Yjt/j3/Xjt/M3/N3/P3/Zjt/F3（134466–134510）：图标包装族 */
export function AutomationPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPlus {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationInfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconInfo {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationCalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconCalendar {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationPauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPause {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationPlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPause {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationEditIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPencil {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationRunIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPlay {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationResumeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconCirclePlay {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationTemplateStarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconStar {...AUTOMATION_ICON_PROPS} fill="currentColor" {...props} />;
}
export function AutomationActiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconActivity {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconEllipsis {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationOpenSessionIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconExternalLink {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationRefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconRefresh {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationDeleteIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
      <IconTrash className="size-4" {...AUTOMATION_ICON_PROPS} />
    </span>
  );
}

/** 原 Qjt（134511）：返回按钮类名 */
export const AUTOMATION_BACK_BUTTON_CLASS =
  "-m-1 inline-flex w-fit max-w-full min-w-0 items-center gap-1 bg-transparent p-1 text-ui-base leading-5 text-foreground-subtle transition-colors hover:text-foreground active:text-foreground focus-visible:text-foreground focus-visible:outline-none";
/** 原 I3（134512）：字段堆叠类名 */
export const AUTOMATION_FIELD_STACK_CLASS = "flex flex-col gap-1.5";

/** 原 $jt（134513）：空态容器 */
export function AutomationsEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[226px] items-center justify-center rounded-lg border border-card-border bg-background px-4 text-center text-ui-base text-foreground-subtle">
      {children}
    </div>
  );
}

/** 原 eMt（134518）：settings/history 标签切换 */
export function EditorTabSwitcher({
  value,
  settingsLabel,
  historyLabel,
  onValueChange,
}: {
  value: string;
  settingsLabel: string;
  historyLabel: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next)} className="gap-0">
      <TabsList className="h-8 rounded-[7px] bg-surface p-0.5">
        {([["settings", settingsLabel], ["history", historyLabel]] as Array<[string, string]>).map(([entryValue, label]) => (
          <TabsTrigger
            key={entryValue}
            value={entryValue}
            className="h-7 flex-none rounded-[6px] border border-transparent px-2 py-1 text-ui-base font-medium leading-snug text-foreground-subtlest transition-colors hover:text-foreground-subtle data-active:border-border data-active:bg-background data-active:text-foreground/80 dark:data-active:border-border dark:data-active:bg-background dark:data-active:text-foreground/80"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/** 原 tMt（134543）：KeepAwakeRow（横幅 + 开关；ExtendedViews 接口级实体化） */
export function KeepAwakeRow({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <div data-automations-keep-awake className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-[10px] bg-surface px-3 py-3 text-foreground-subtle">
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <AutomationInfoIcon className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-ui-base leading-5">{intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}</p>
      <KeepAwakeSwitch checked={checked} ariaLabel={intl.formatMessage({ id: "offPeak.keepAwakeBanner" })} onChange={onChange} color="blue" size="sm" />
    </div>
  );
}

/** 原 L3（134569）：CreateSplitButton（手动创建 + ⌄ 聊天创建；primary/outline 双外观） */
export function CreateSplitButton({
  onViaChat,
  onManually,
  appearance = "primary",
}: {
  onViaChat: () => void;
  onManually: () => void;
  appearance?: "primary" | "outline";
}) {
  const { intl } = useIntlContext();
  const outline = appearance === "outline";
  return (
    <div
      data-appearance={appearance}
      className={cn("inline-flex h-8 items-center overflow-hidden rounded-lg", outline ? "border border-card-border bg-background" : "bg-primary text-primary-foreground")}
    >
      <button
        type="button"
        data-testid={TESTID_CREATE_MANUALLY}
        onClick={onManually}
        className={cn(
          "group inline-flex h-full items-center px-2.5 text-ui-base font-normal leading-5 transition-colors",
          outline ? "hover:bg-hover active:bg-selected" : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
        )}
      >
        <span className={cn("transition-opacity", outline ? "opacity-80 group-hover:opacity-100" : "opacity-100")}>
          {intl.formatMessage({ id: "automations.createManually" })}
        </span>
      </button>
      <div className={cn("h-4 w-px", outline ? "bg-surface" : "bg-primary-foreground/10")} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid={TESTID_CREATE_MORE}
            aria-label={intl.formatMessage({ id: "automations.create" })}
            className={cn(
              "group inline-flex h-full w-7 items-center justify-center transition-colors",
              outline
                ? "hover:bg-hover active:bg-selected data-[state=open]:bg-hover"
                : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20 data-[state=open]:bg-primary-foreground/10",
            )}
          >
            <span className={cn("flex items-center justify-center transition-opacity", outline ? "opacity-80 group-hover:opacity-100 group-data-[state=open]:opacity-100" : "opacity-100")}>
              <AutomationChevronIndicator size={14} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-auto min-w-0">
          <DropdownMenuItem className="pr-6" onSelect={onViaChat}>
            {intl.formatMessage({ id: "automations.createViaChat" })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** 原 nMt（134639）：历史排序（创建时刻倒序） */
export function sortAutomationRuns<T extends { createdAt: number }>(runs: T[]): T[] {
  return [...runs].sort((a, b) => b.createdAt - a.createdAt);
}
/** 原 rMt/iMt/aMt（134645–134648）：气泡延迟/间隙/侧位判定 */
const AUTOMATION_TOOLTIP_DELAY_MS = 320;
const AUTOMATION_TOOLTIP_GAP = 16;
export function automationTooltipSide(rect: { right: number } | null, containerWidth: number): "right" | "top" {
  return rect && containerWidth - rect.right >= AUTOMATION_TOOLTIP_DELAY_MS + AUTOMATION_TOOLTIP_GAP ? "right" : "top";
}

/** 原 pMt（134945）：PromptCard（@container/composer；invalid 红框） */
export function PromptCard({ invalid = false, children }: { invalid?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-42 flex-col overflow-hidden rounded-xl border bg-background transition-colors @container/composer",
        invalid ? "border-destructive" : "border-input-border hover:border-input-border-hover focus-within:border-input-border-focused",
      )}
    >
      {children}
    </div>
  );
}

/** 原 dMt/fMt（134941–134942）：自适应高度上下限 */
const AUTOGROW_MIN_HEIGHT = 116;
const AUTOGROW_MAX_HEIGHT = 156;

/** 原 mMt（134956）：AutoGrowTextarea（高度自适应 116–156 + 溢出滚动切换） */
export function AutoGrowTextarea({
  rows = 5,
  onInput,
  value,
  ...rest
}: {
  rows?: number;
  onInput?: React.FormEventHandler<HTMLTextAreaElement>;
  value: string;
} & Record<string, unknown>) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  const lastHeight = React.useRef<number | null>(null);
  const autoGrow = React.useCallback((element: HTMLTextAreaElement) => {
    const parsed = Number.parseFloat(element.style.height);
    const previous = lastHeight.current;
    const shrinking = previous !== null && Number.isFinite(parsed) && Math.abs(parsed - previous) > 1;
    const scrollHeight = element.scrollHeight;
    if (shrinking) {
      element.style.overflowY = scrollHeight > parsed ? "auto" : "hidden";
      return;
    }
    element.style.height = `${AUTOGROW_MIN_HEIGHT}px`;
    const next = Math.min(Math.max(scrollHeight, AUTOGROW_MIN_HEIGHT), AUTOGROW_MAX_HEIGHT);
    element.style.height = `${next}px`;
    lastHeight.current = next;
    element.style.overflowY = scrollHeight > AUTOGROW_MAX_HEIGHT ? "auto" : "hidden";
  }, []);
  React.useLayoutEffect(() => {
    if (ref.current) autoGrow(ref.current);
  }, [autoGrow, value]);
  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
    autoGrow(event.currentTarget);
    onInput?.(event);
  };
  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      rows={rows}
      onInput={handleInput}
      className={cn(
        "-mx-px -mt-px h-29 min-h-29 max-h-39 sm:max-h-none shrink-0 resize-none sm:resize-y overflow-y-hidden rounded-xl border-0 bg-card p-2 text-foreground outline-none placeholder:text-ui-base placeholder:text-foreground-subtlest focus:outline-none",
        AUTOMATION_TEXT_CLASS,
      )}
    />
  );
}
/** 原 z3（134944）：文本类名 */
export const AUTOMATION_TEXT_CLASS = "text-ui-base leading-5";

/** 原 hMt（134992）：PromptCardFooter */
export function PromptCardFooter({ children }: { children: React.ReactNode }) {
  return <div className="-mx-px -mt-px flex min-h-13 shrink-0 flex-wrap items-center justify-between gap-2 p-3 sm:h-13 sm:flex-nowrap">{children}</div>;
}

/** 原 gMt（134998）：OffPeakTaskMenu（暂停/继续/删除） */
export function OffPeakTaskMenu({
  task,
  onPause,
  onContinue,
  onDelete,
}: {
  task: OffPeakTaskRecord;
  onPause?: (task: OffPeakTaskRecord) => void;
  onContinue?: (task: OffPeakTaskRecord) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid={TESTID_OFFPEAK_MENU}
          aria-label={intl.formatMessage({ id: "automations.moreActions" })}
          className="flex size-8 items-center justify-center rounded-lg border-0 bg-white/[0.06] text-foreground-subtle shadow-none outline-none transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground focus-visible:ring-0"
        >
          <AutomationMoreIcon className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-[190px] min-w-[190px] rounded-[10px] border-0 px-1 py-1.5">
        {task.status === "queued" && onPause ? (
          <DropdownMenuItem className="min-h-9 gap-1 rounded-md leading-5" onSelect={() => onPause(task)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationPauseIcon className="size-4" aria-hidden="true" />
            </span>
            {intl.formatMessage({ id: "offPeak.action.pause" })}
          </DropdownMenuItem>
        ) : null}
        {task.status === "paused" && onContinue ? (
          <DropdownMenuItem className="min-h-9 gap-1 rounded-md leading-5" onSelect={() => onContinue(task)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationResumeIcon className="size-4" aria-hidden="true" />
            </span>
            {intl.formatMessage({ id: "offPeak.action.continue" })}
          </DropdownMenuItem>
        ) : null}
        {onDelete ? (
          <>
            <DropdownMenuSeparator className="mx-0 my-0.5" />
            <DropdownMenuItem
              className="min-h-9 gap-1 rounded-md leading-5 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
              onSelect={() => onDelete(task)}
            >
              <AutomationDeleteIcon />
              {intl.formatMessage({ id: "common.delete" })}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface OffPeakTaskRecord {
  offPeakTaskId: string; // A0-CLEANUP3 3b：与 stores-tasks.OffPeakTask 对齐（运行期恒有值）
  taskId?: string;
  title?: string;
  prompt: string;
  status: string;
  startedAt?: number;
  endedAt?: number;
  historyDeletedAt?: number;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

/** 原 _Mt（135060）：历史状态样式 */
const OFFPEAK_HISTORY_STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  succeeded: { dot: "bg-success", text: "text-success" },
  failed: { dot: "bg-destructive", text: "text-destructive" },
  skipped: { dot: "bg-foreground-subtlest", text: "text-foreground-subtle" },
  running: { dot: "bg-brand", text: "text-brand" },
};

/** 原 vMt（135068）：任务状态 → 历史状态归一 */
export function offPeakHistoryStatusOf(task: OffPeakTaskRecord): "succeeded" | "failed" | "skipped" | "running" {
  return task.status === "completed" ? "succeeded" : task.status === "failed" ? "failed" : task.status === "cancelled" ? "skipped" : "running";
}

/** 原 ar（src chunk `Q`=_x）：终端状态判定（completed/failed/cancelled） */
declare function isTerminalTaskStatus(status: string): boolean;

/** 原 yMt（135075）：OffPeakHistoryTable（单行表：指令/触发时刻/状态/时长/菜单） */
export function OffPeakHistoryTable({
  task,
  onOpenSession,
  onDelete,
}: {
  task: OffPeakTaskRecord | null | undefined;
  onOpenSession?: (task: OffPeakTaskRecord) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
}) {
  const { intl } = useIntlContext();
  if (!task?.startedAt || task.historyDeletedAt !== undefined)
    return <AutomationsEmptyState>{intl.formatMessage({ id: "offPeak.history.empty" })}</AutomationsEmptyState>;
  const status = offPeakHistoryStatusOf(task);
  const endedAt = isTerminalTaskStatus(task.status) ? task.endedAt ?? Date.now() : Date.now();
  const durationMinutes = Math.max(1, Math.round((endedAt - task.startedAt) / 60000));
  return (
    <div className="overflow-x-auto rounded-[8px]">
      <table className="w-full text-left text-ui-base font-normal leading-snug tracking-[-0.08px]">
        <thead className="bg-surface text-foreground-subtle">
          <tr className="h-[30px] border-b border-border">
            <th className="px-4 font-normal">{intl.formatMessage({ id: "offPeak.history.col.instructions" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.triggered" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.status" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.duration" })}</th>
            <th className="px-4 font-normal" />
          </tr>
        </thead>
        <tbody>
          <tr className="h-[46px] transition-colors hover:bg-surface-hover">
            <td className="max-w-64 truncate px-4 text-foreground-subtle" title={task.prompt}>
              {task.prompt}
            </td>
            <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatDateTime(task.startedAt)}</td>
            <td className="px-4">
              <span className="flex items-center text-ui-base leading-5 tracking-[-0.18px]">
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <span className={cn("inline-block size-1.5 rounded-full", OFFPEAK_HISTORY_STATUS_STYLES[status].dot)} />
                </span>
                <span className={OFFPEAK_HISTORY_STATUS_STYLES[status].text}>
                  {intl.formatMessage({ id: `automations.runs.status.${status}` })}
                </span>
              </span>
            </td>
            <td className="whitespace-nowrap px-4 text-foreground-subtle">
              {intl.formatMessage({ id: "offPeak.history.durationMinutes" }, { count: durationMinutes })}
            </td>
            <td className="px-4">
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                      className="flex size-6 items-center justify-center rounded-[6px] text-foreground-subtle transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground"
                    >
                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="flex w-[160px] min-w-[160px] flex-col gap-0.5 rounded-[10px] border-0 px-1 py-1.5">
                    {task.sessionId && onOpenSession ? (
                      <DropdownMenuItem className="min-h-9 gap-1 rounded-md p-2 text-ui-base leading-5 tracking-[-0.18px]" onSelect={() => onOpenSession(task)}>
                        <span className="flex size-5 items-center justify-center">
                          <AutomationOpenSessionIcon className="size-4" aria-hidden="true" />
                        </span>
                        {intl.formatMessage({ id: "offPeak.goToSession" })}
                      </DropdownMenuItem>
                    ) : null}
                    {task.sessionId && onOpenSession && onDelete ? <DropdownMenuSeparator className="m-0 h-px w-full" /> : null}
                    {onDelete ? (
                      <DropdownMenuItem variant="destructive" className="min-h-9 gap-1 rounded-lg p-2 text-ui-base leading-5 tracking-[-0.18px]" onSelect={() => onDelete(task)}>
                        <AutomationDeleteIcon />
                        {intl.formatMessage({ id: "offPeak.history.delete" })}
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** 原 H3（135266）：编辑器页容器类名 */
export const AUTOMATION_EDITOR_PAGE_CLASS = "mx-auto w-full max-w-4xl px-4 pb-8 pt-0 lg:px-8 lg:pb-10";

/** 原 G3/K3（135378）：缺省模式/思考级别 */
export const AUTOMATION_DEFAULT_MODE = "build";
export const AUTOMATION_DEFAULT_THOUGHT_LEVEL = "medium";

/** 原 OMt（135380）：思考预览就绪判定 */
export function isThoughtPreviewReady(previewKey: string | null, state: { key: string | null; status: string }): boolean {
  return previewKey === null || (state.key === previewKey && state.status === "ready");
}

/** 原 kMt（135383）：模式值表 */
const AUTOMATION_MODE_VALUES = ["build", "edit", "plan", "yolo"];

/** 原 jMt（135406）：模式选项构造 */
export function buildModeOption(current: string): ConfigOption {
  return {
    id: "mode",
    name: "Mode",
    category: "mode",
    type: "select",
    currentValue: current,
    options: AUTOMATION_MODE_VALUES.map((value) => ({ value, name: value })),
  };
}

/** 原 MMt（135413）：组内条目查找 */
export function findModelGroupItem(groups: SelectGroupEntry[], value: string): SelectItemEntry | null {
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value === value);
    if (item) return item;
  }
  return null;
}

/** 原 q3（135423）：模型组条目解析（精确 → 供应商前缀 → 模型名单一匹配） */
export function resolveModelGroupItem(groups: SelectGroupEntry[], value: string): SelectItemEntry | null {
  const exact = findModelGroupItem(groups, value);
  if (exact) return exact;
  const slash = value.indexOf("/");
  const providerId = slash > 0 ? value.slice(0, slash) : null;
  const modelId = slash > 0 ? value.slice(slash + 1) : value;
  const candidates = groups.flatMap((group) => group.items.filter((item) => parseModelValue(item.value)?.modelName === modelId));
  if (providerId) {
    const filtered = candidates.filter((item) => parseModelValue(item.value)?.providerId === providerId);
    if (filtered.length === 1) return filtered[0] ?? null;
  }
  return candidates.length === 1 ? candidates[0] ?? null : null;
}

/** 原 NMt（135436）：模型标签（组内标签 + 供应商名；缺省回落） */
export function resolveModelLabel(args: {
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelValue: string;
  fallbackLabel: string;
}): string {
  const item = resolveModelGroupItem(args.modelGroups, args.modelValue);
  if (!item) return args.fallbackLabel;
  const providerId = parseModelValue(item.value)?.providerId;
  const providerName = args.modelProviders.find((provider) => provider.id === providerId)?.name;
  return resolveModelGroupLabel({
    modelGroups: args.modelGroups,
    normalizedValue: item.value,
    fallbackLabel: args.fallbackLabel,
    providerId,
    providerName,
  });
}

/** 原 PMt（135449）：思考选项归一（当前值不在选项 → 回退） */
export function normalizeThoughtOption(option: ConfigOption | null | undefined, current: string): ConfigOption | null {
  const options = option?.options ?? [];
  if (options.length === 0) return null;
  const hasCurrent = options.some((entry) => entry.value === current);
  const optionCurrent = typeof option?.currentValue === "string" ? option.currentValue : undefined;
  const resolved = hasCurrent ? current : options.some((entry) => entry.value === optionCurrent) ? (optionCurrent as string) : (options[0]?.value as string);
  return {
    id: "thought_level",
    name: option?.name ?? "Effort",
    category: "thought_level",
    type: "select",
    currentValue: resolved,
    options: options.map((entry) => ({ ...entry })),
  };
}

/** 原 FMt（135464）：思考级别提交值（有解析 → 用户值；编辑态 → null；新建 → undefined） */
export function resolveThoughtLevelPayload(args: { editing: boolean; resolvedThoughtLevel: string; thoughtLevel: string }): string | null | undefined {
  return args.resolvedThoughtLevel ? args.thoughtLevel : args.editing ? null : undefined;
}

/** 原 IMt（135467）：思考预览选项解析（选中模型预览键命中 → 预览；等于工作区模型 → 运行时；否则空） */
export function resolveThoughtPreviewOption(args: {
  currentWorkspaceModelValue?: string;
  previewKey?: string | null;
  previewOption?: ConfigOption | null;
  runtimeOption?: ConfigOption | null;
  selectedModelPreviewKey?: string | null;
  selectedModelValue?: string;
}): ConfigOption | null | undefined {
  if (args.previewKey && args.previewKey === args.selectedModelPreviewKey) return args.previewOption ?? undefined;
  const selected = args.selectedModelValue?.trim();
  const current = args.currentWorkspaceModelValue?.trim();
  if (!selected || selected === current) return args.runtimeOption;
  return undefined;
}

/** 原 LMt（135473）：模型思考选项探测（临时会话 create→读设置→close） */
export async function fetchModelThoughtOption(args: {
  agentService: AgentService;
  workspacePath: string;
  workspaceIdentity?: string | null;
  providerId: string;
  modelId: string;
}): Promise<ConfigOption | null> {
  let sessionId: string | null = null;
  try {
    const created = await args.agentService.createSession({
      workspacePath: args.workspacePath,
      workspaceIdentity: args.workspaceIdentity,
      persistence: "deferred",
      model: { providerId: args.providerId, modelId: args.modelId },
    });
    sessionId = created.session.sessionId;
    return normalizeSettingsOptions(created.settings as unknown[]).find((option) => option.category === "thought_level" && option.type === "select") ?? null;
  } finally {
    if (sessionId) {
      await args.agentService.closeSession({ workspacePath: args.workspacePath, workspaceIdentity: args.workspaceIdentity, sessionId });
    }
  }
}

/** 原 RMt（135496）：本地工作区标签判定 */
export function isLocalWorkspaceTab(tab: WorkspaceTab): boolean {
  return !tab.remoteSessionId && !tab.remoteTarget && !tab.workspaceIdentity;
}

/** 原 J3（135498）：本地工作区标签钩子 */
export function useLocalWorkspaceTabs({ workspaceTabs }: { workspaceTabs: WorkspaceTab[] }): WorkspaceTab[] {
  return React.useMemo(() => workspaceTabs.filter((tab) => isUsableWorkspaceTab(tab) && isLocalWorkspaceTab(tab)), [workspaceTabs]);
}

/** 原 zMt（135501）：远程工作区标签判定 */
export function isRemoteWorkspaceTab(tab: WorkspaceTab | null | undefined): boolean {
  return !!(tab?.remoteSessionId || tab?.remoteTarget || tab?.workspaceIdentity);
}

export interface WorkspaceOption {
  workspacePath: string;
  label: string;
  workspaceIdentity?: string;
  workspacePurpose?: string;
}

/** 原 BMt（135504）：工作区选项收集（会话工作区单份；不可用目录剔除） */
export function collectWorkspaceOptions(tabs: WorkspaceTab[], options: { includeConversationWorkspace?: boolean } = {}): WorkspaceOption[] {
  const collected: WorkspaceOption[] = [];
  let conversationIncluded = false;
  for (const tab of tabs) {
    if (tab.availability === "unavailable-local-directory") continue;
    if (tab.workspacePurpose === "conversation") {
      if (!options.includeConversationWorkspace || conversationIncluded) continue;
      conversationIncluded = true;
      collected.push({ workspacePath: tab.workspacePath, label: "default", workspacePurpose: "conversation" });
      continue;
    }
    collected.push({ workspacePath: tab.workspacePath, label: tab.label || pathTailName(tab.workspacePath) });
  }
  return collected;
}

/** 原 VMt（135523）：工作区选项钩子（工作区标签 store → 本地过滤 → 选项收集） */
export function useWorkspaceOptions(options: { includeConversationWorkspace?: boolean } = {}): WorkspaceOption[] {
  const tabs = useWorkspaceTabsStore((state) => state.tabs);
  const localTabs = useLocalWorkspaceTabs({ workspaceTabs: React.useMemo(() => tabs.filter(isUsableWorkspaceTab), [tabs]) });
  const includeConversation = options.includeConversationWorkspace === true;
  return React.useMemo(() => collectWorkspaceOptions(localTabs, { includeConversationWorkspace: includeConversation }), [includeConversation, localTabs]);
}

/** 原 HMt/JMt/r6（135529/135573/136119）：路径尾名 */
export function pathTailName(path: string): string {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? path;
}

/** 原 UMt（135532）：模型键归一 */
export function normalizeModelKey(value: string): string {
  return value.trim().toLowerCase();
}

/** 原 WMt（135535）：模型配置匹配（id ∨ 各类型模型名） */
export function modelConfigMatches(config: { id: string; modelIdByKind?: Record<string, string> }, model: string): boolean {
  const normalized = normalizeModelKey(model);
  return normalized ? [config.id, ...Object.values(config.modelIdByKind ?? {})].map(normalizeModelKey).includes(normalized) : false;
}

/** 原 GMt（135539）：允许思考级别解析（配置推理表 → max 模型缺省 → 空） */
export function resolveAllowedThoughtLevels(args: {
  model: string;
  thoughtLevel?: string;
  allowedModelConfigs: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
}): { levels: string[]; defaultLevel: string | undefined } {
  const config = args.allowedModelConfigs.find((entry) => modelConfigMatches(entry, args.model));
  const levels = config?.reasoning ? Object.keys(config.reasoning.levels) : [];
  return levels.length > 0
    ? {
        levels,
        defaultLevel: config?.reasoning?.defaultLevel && levels.includes(config.reasoning.defaultLevel) ? config.reasoning.defaultLevel : levels[0],
      }
    : isMaxThinkingModel(args.model)
      ? { levels: [...MAX_THINKING_LEVELS], defaultLevel: "max" }
      : { levels: [], defaultLevel: undefined };
}

/** 原 KMt（135554）：off-peak 思考选项构造（无级别 → null） */
export function buildOffPeakThoughtOption(args: {
  model: string;
  thoughtLevel?: string;
  allowedModelConfigs: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  formatLevelName: (level: string) => string;
}): ConfigOption | null {
  const { levels, defaultLevel } = resolveAllowedThoughtLevels(args);
  return levels.length === 0
    ? null
    : {
        id: "thought_level",
        name: "Thought level",
        category: "thought_level",
        type: "select",
        currentValue: args.thoughtLevel && levels.includes(args.thoughtLevel) ? args.thoughtLevel : defaultLevel && levels.includes(defaultLevel) ? defaultLevel : levels[0],
        options: levels.map((level) => ({ value: level, name: args.formatLevelName(level) })),
      };
}

/** 原 qMt（135572）：模型项恒不锁 */
export const automationModelNeverLocked = (): boolean => false;

/* --- C.3 调度原语（原 136026–137004） --- */

/** 原 Y3（136026）：ScrollArea 封装 */
export function AutomationScrollArea({ className, children, ...rest }: { className?: string; children: React.ReactNode } & Record<string, unknown>) {
  return (
    <ScrollAreaRoot data-slot="scroll-area" className={cn("relative", className)} {...rest}>
      <ScrollAreaViewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaViewport>
      <AutomationScrollbar />
      <ScrollAreaCorner className="bg-transparent" />
    </ScrollAreaRoot>
  );
}

/** 原 XMt（136042）：Scrollbar */
export function AutomationScrollbar({ className, orientation = "vertical", ...rest }: { className?: string; orientation?: "horizontal" | "vertical" } & Record<string, unknown>) { // A0-S3c：收真实 radix Scrollbar orientation 联合（XMt@136042 透传）
  return (
    <ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors data-horizontal:h-2 data-horizontal:flex-col data-horizontal:p-[2px] data-vertical:h-full data-vertical:w-2 data-vertical:p-[2px]",
        className,
      )}
      {...rest}
    >
      <ScrollAreaThumb data-slot="scroll-area-thumb" className="relative min-h-2 min-w-2 flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  );
}

/** 原 QMt（136068）：变更字段集计算（基线有值 ∧ 当前不同） */
export function changedFieldsOf(args: { touchedFields: Set<string>; baseline: Record<string, string>; current: Record<string, string> }): string[] {
  return [...args.touchedFields].filter((field) => args.baseline[field] !== undefined && args.current[field] !== args.baseline[field]);
}

/** 原 $Mt（136073）：必填缺失集（标题/计划/提示词） */
export function missingRequiredFields(args: { title: string; cronExpr: string; prompt: string }): string[] {
  const missing: string[] = [];
  if (!args.title.trim()) missing.push("title");
  if (!args.cronExpr.trim()) missing.push("schedule");
  if (!args.prompt.trim()) missing.push("prompt");
  return missing;
}

/** 原 eNt（136082）：集合移除（不可变） */
export function removeFromSet<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) return set;
  const next = new Set(set);
  next.delete(value);
  return next;
}

/* ── tombstone（A0-CLEANUP 族清理）：workspaceKey（原 Ti = src chunk ip，6913）declare 删除 →
   import { automationsWorkspaceKey as workspaceKey } from './SrcSharedB'。 ── */

/** 原 X3（136087）：工作区选项键（= workspaceKey） */
export function workspaceOptionKey(option: WorkspaceOption): string {
  return workspaceKey(option);
}

/** 原 Z3（136090）：按键查找工作区选项 */
export function findWorkspaceOption(options: WorkspaceOption[], key: string | null | undefined): WorkspaceOption | undefined {
  return options.find((option) => workspaceOptionKey(option) === key);
}

/** 原 tNt（136093）：工作区选项解析（当前键 → 缺省键 → 首项） */
export function resolveWorkspaceOptionKey(
  options: WorkspaceOption[],
  currentKey: string | null,
  fallback: { workspacePath: string; workspaceIdentity?: string | null } | null,
): string | null {
  const current = findWorkspaceOption(options, currentKey);
  if (current) return workspaceOptionKey(current);
  const fallbackOption = findWorkspaceOption(options, fallback ? workspaceKey(fallback) : null);
  if (fallbackOption) return workspaceOptionKey(fallbackOption);
  const first = options[0];
  return first ? workspaceOptionKey(first) : null;
}

/** 原 Q3（136101）：模型继承哨兵（与子代理域同值） */
export const AUTOMATION_MODEL_INHERIT = "inherit";
/** 原 $3（136103）：频率值表 */
export const AUTOMATION_FREQUENCIES = ["hourly", "daily", "weekdays", "weekly", "monthly", "custom"];
/** 原 rNt：频率守卫 */
export function isAutomationFrequency(value: string): value is ScheduleBuilderState["frequency"] {
  return AUTOMATION_FREQUENCIES.includes(value);
}
/** 原 e6（136105）：运行历史页大小 */
export const AUTOMATION_RUNS_PAGE_SIZE = 8;
/** 原 t6/iNt/n6（136106–136108）：自定义区间 0–200 */
const CUSTOM_INTERVAL_FLOOR = 0;
const CUSTOM_INTERVAL_MIN = 1;
const CUSTOM_INTERVAL_MAX = 200;

/** 原 aNt（136109）：分页窗口（≤7 全列；否则首三 + 邻域 + 尾三 + 省略号） */
export function paginationWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const anchors = [...new Set([1, 2, 3, total - 2, total - 1, total, current - 1, current, current + 1])]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);
  const window: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const value of anchors) {
    if (previous && value - previous > 1) window.push("ellipsis");
    window.push(value);
    previous = value;
  }
  return window;
}

/** 原 oNt（136122）：模型组缺省值（首个非空条目值） */
export function defaultModelFromGroups(groups: SelectGroupEntry[]): string {
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value.trim().length > 0);
    if (item) return item.value;
  }
  return AUTOMATION_MODEL_INHERIT;
}

/** 原 sNt（136130）：当前模型配置项值提取 */
export function currentModelOptionValue(options: ConfigOption[]): string | null {
  const modelOption = options.find((option) => option.category === "model" && option.type === "select");
  return typeof modelOption?.currentValue === "string" && modelOption.currentValue.trim().length > 0 ? modelOption.currentValue : null;
}

/** 原 cNt（136135）：思考配置项提取 */
export function findThoughtOption(options: ConfigOption[]): ConfigOption | undefined {
  return options.find((option) => option.category === "thought_level" && option.type === "select");
}

/** 原 lNt/a6（136141）：Select 弹层/条目类名 */
const AUTOMATION_SELECT_CONTENT_CLASS =
  "w-[var(--radix-select-trigger-width)] px-0 py-1.5 [&_[data-position=popper]]:px-1 [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden";
const AUTOMATION_SELECT_ITEM_CLASS =
  "min-h-8 rounded-[8px] px-2 py-1.5 pr-8 text-ui-base leading-5 text-foreground-subtle data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-[state=checked]:bg-menu-hover data-[state=checked]:text-foreground";

/** 原 uNt（136143）：Select 指示器 */
export function AutomationSelectIndicator() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
      <IconChevronDown className="size-4" strokeWidth={2} />
    </span>
  );
}

/** 原 dNt（136150）：日历图标（调度工具族；与 §B.2 图标包装族 qjt 的 AutomationCalendarIcon 为不同源符号） */
export function ScheduleCalendarIcon({ className }: { className?: string }) {
  return <IconCalendar className={className} strokeWidth={2} />;
}

/** 原 fNt（136153）：时分列（滚动居中选中项） */
export function HourMinuteColumn({ count, selected, onSelect }: { count: number; selected: number; onSelect: (value: number) => void }) {
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <AutomationScrollArea className="h-52 w-14 shrink-0">
      <div className="flex flex-col gap-0.5 p-1">
        {Array.from({ length: count }, (_, index) => index).map((value) => (
          <button
            key={value}
            ref={value === selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "rounded-md px-2 py-1 text-center text-ui-base tabular-nums transition-colors",
              value === selected ? "bg-menu-hover text-foreground" : "text-foreground-subtle hover:bg-menu-hover hover:text-foreground",
            )}
          >
            {pad2(value)}
          </button>
        ))}
      </div>
    </AutomationScrollArea>
  );
}

/** 原 pNt（136185）：TimePicker（HH:MM 触发 + 双列弹层） */
export function TimePicker({
  hour,
  minute,
  onChange,
  ariaLabel,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex h-auto items-center gap-1 rounded-lg bg-hover py-px pl-2 pr-1.5 text-ui-base leading-5 tabular-nums text-foreground transition-colors hover:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          {pad2(hour)}
          {":"}
          {pad2(minute)}
          <span className="shrink-0 text-foreground-subtle">
            <AutomationChevronIndicator />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-29 flex-row gap-0 p-0">
        <HourMinuteColumn count={24} selected={hour} onSelect={(next) => onChange(next, minute)} />
        <div className="w-px shrink-0 bg-border" />
        <HourMinuteColumn count={60} selected={minute} onSelect={(next) => onChange(hour, next)} />
      </PopoverContent>
    </Popover>
  );
}

/** 原 mNt（136222）：值列（月/日；带 testid 前缀） */
export function ValueColumn({
  values,
  selected,
  onSelect,
  buttonTestIdPrefix,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  buttonTestIdPrefix?: string;
}) {
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <AutomationScrollArea className="h-52 w-14 shrink-0">
      <div className="flex flex-col gap-0.5 p-1">
        {values.map((value) => (
          <button
            key={value}
            ref={value === selected ? selectedRef : undefined}
            type="button"
            data-testid={buttonTestIdPrefix ? testidTemplate(buttonTestIdPrefix, String(value)) : undefined}
            onClick={() => onSelect(value)}
            className={cn(
              "rounded-md px-2 py-1 text-center text-ui-sm tabular-nums transition-colors",
              value === selected ? "bg-primary text-primary-foreground" : "text-foreground-subtle hover:bg-surface-hover",
            )}
          >
            {pad2(value)}
          </button>
        ))}
      </div>
    </AutomationScrollArea>
  );
}

/** 原 hNt（136255）：月天数 */
export function daysInMonth(month: number): number {
  return new Date(2024, month, 0).getDate();
}

/** 原 gNt（136258）：MonthDayPicker（月/日双列；日随月钳制） */
export function MonthDayPicker({
  month,
  day,
  intl,
  onChange,
}: {
  month: number;
  day: number;
  intl: IntlShape;
  onChange: (month: number, day: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from({ length: daysInMonth(month) }, (_, index) => index + 1);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={TESTID_ENDDATE_TRIGGER}
          aria-label={intl.formatMessage({ id: "automations.form.schedule.yearDateLabel" })}
          className="inline-flex h-auto items-center gap-1 rounded-lg bg-hover py-px pl-2 pr-1.5 text-ui-base leading-5 tabular-nums text-foreground transition-colors hover:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          {intl.formatMessage({ id: "automations.form.schedule.monthDayValue" }, { month: String(month), day: String(day) })}
          <span className="shrink-0 text-foreground-subtle">
            <AutomationChevronIndicator />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-29 flex-row gap-0 p-0">
        <ValueColumn values={months} selected={month} buttonTestIdPrefix={TESTID_MONTH_OPTION} onSelect={(next) => onChange(next, Math.min(day, daysInMonth(next)))} />
        <div className="w-px shrink-0 bg-border" />
        <ValueColumn values={days} selected={day} buttonTestIdPrefix={TESTID_DAY_OPTION} onSelect={(next) => onChange(month, next)} />
      </PopoverContent>
    </Popover>
  );
}

/** 原 _Nt（136309）：WeekdayPicker（多选；末项保护） */
export function WeekdayPicker({ weekdays, intl, onChange }: { weekdays: number[]; intl: IntlShape; onChange: (weekdays: number[]) => void }) {
  const label = WEEKDAY_DISPLAY_ORDER.filter((weekday) => weekdays.includes(weekday))
    .map((weekday) => intl.formatMessage({ id: `automations.weekday.${weekday}` }))
    .join(intl.formatMessage({ id: "automations.weekday.separator" }));
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={intl.formatMessage({ id: "automations.form.schedule.weekdaysLabel" })}
          className="inline-flex h-auto max-w-full items-center gap-0.5 rounded-lg bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground transition-colors hover:bg-selected data-[state=open]:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          <span className="truncate">{label}</span>
          <AutomationChevronIndicator />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1">
        {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
          const included = weekdays.includes(weekday);
          return (
            <button
              key={weekday}
              type="button"
              onClick={() => {
                if (included && weekdays.length === 1) return;
                onChange(included ? weekdays.filter((entry) => entry !== weekday) : [...weekdays, weekday]);
              }}
              className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-ui-base text-foreground transition-colors hover:bg-menu-hover"
            >
              <span className="min-w-0 flex-1 truncate">{intl.formatMessage({ id: `automations.weekday.${weekday}` })}</span>
              <span className="flex size-4 shrink-0 items-center justify-center">{included ? <IconCheck className="size-3.5" aria-hidden="true" /> : null}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/** 原 o6（136362）：日期 → `YYYY-MM-DD`（缺省明天） */
export function toDateString(value?: number): string {
  const date = value ? new Date(value) : new Date(Date.now() + 1440 * 60 * 1000);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 原 vNt（136366）：日期串 → 当日末时刻戳（非法 → undefined） */
export function dateStringToEndTimestamp(value: string): number | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

/** 原 yNt（136371）：日期串 → Date（非法 → null） */
export function dateStringToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 原 bNt（136378）：EndDatePicker（月历弹层；过去日期禁用；今日环） */
export function EndDatePicker({
  disabled,
  intl,
  min,
  onChange,
  value,
}: {
  disabled: boolean;
  intl: IntlShape;
  min: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = dateStringToDate(value);
  const minDate = dateStringToDate(min);
  const [viewDate, setViewDate] = React.useState<Date>(() => selected ?? minDate ?? new Date());
  React.useEffect(() => {
    if (open && selected) setViewDate(selected);
  }, [open, selected?.getTime()]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const todayString = toDateString(Date.now());
  const monthLabel = intl.formatMessage({ id: "automations.customRepeat.monthLabel" }, { year: String(year), month: String(month + 1) });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-9 w-[135px] items-center justify-center gap-1.5 rounded-lg border border-input-border bg-input pl-3 pr-3.5 text-ui-base font-normal leading-5 tracking-[-0.18px] text-foreground transition-colors hover:border-input-border-hover hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-input-border disabled:hover:bg-input"
        >
          <ScheduleCalendarIcon className="size-5 shrink-0 text-foreground-subtle" />
          <span className="tabular-nums">{selected ? `${selected.getFullYear()}/${pad2(selected.getMonth() + 1)}/${pad2(selected.getDate())}` : value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="mb-3 flex h-8 items-center justify-between">
          <span className="text-ui-sm font-medium text-foreground">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label={intl.formatMessage({ id: "automations.customRepeat.previousMonth" })}>
              <IconChevronLeft className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label={intl.formatMessage({ id: "automations.customRepeat.nextMonth" })}>
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
            <span key={weekday} className="flex size-8 items-center justify-center text-ui-sm text-foreground-subtlest">
              {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
            </span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`blank-${index}`} className="size-8" />
          ))}
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => {
            const cell = `${year}-${pad2(month + 1)}-${pad2(day)}`;
            const isSelected = cell === value;
            const isToday = cell === todayString;
            const isPast = cell < min;
            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => {
                  onChange(cell);
                  setOpen(false);
                }}
                className={cn(
                  "flex size-8 items-center justify-center rounded-[8px] text-ui-base tabular-nums transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-menu-hover",
                  isToday && !isSelected && "ring-1 ring-inset ring-border-hover",
                  isPast && "cursor-not-allowed text-foreground-subtlest opacity-35",
                )}
              >
                {day}
              </button>
            );
          })}
          {Array.from({ length: 42 - firstWeekday - dayCount }, (_, index) => (
            <span key={`trailing-blank-${index}`} className="size-8" />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface CustomRepeatConfirmPayload {
  interval: number;
  unit: ScheduleBuilderState["customUnit"];
  weekdays: number[];
  monthDays: number[];
  monthlyMode: "date" | "weekday";
  endAt?: number;
}

/** 原 xNt（136501）：CustomRepeatDialog（频率 + 单位 + 周几/日期规则 + 结束日期） */
export function CustomRepeatDialog({
  builder,
  endAt,
  intl,
  onConfirm,
  onOpenChange,
  open,
}: {
  builder: ScheduleBuilderState;
  endAt: number | undefined;
  intl: IntlShape;
  onConfirm: (payload: CustomRepeatConfirmPayload) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [intervalInput, setIntervalInput] = React.useState(String(builder.customInterval));
  const [unit, setUnit] = React.useState<ScheduleBuilderState["customUnit"]>(builder.customUnit);
  const [weekdays, setWeekdays] = React.useState<number[]>(builder.customWeekdays);
  const [monthDays, setMonthDays] = React.useState<number[]>(builder.customMonthDays);
  const [monthlyMode, setMonthlyMode] = React.useState<"date" | "weekday">(builder.customMonthlyMode);
  const [hasEnd, setHasEnd] = React.useState(endAt !== undefined);
  const [endValue, setEndValue] = React.useState(toDateString(endAt));
  React.useEffect(() => {
    if (open) {
      setIntervalInput(String(builder.customInterval));
      setUnit(builder.customUnit);
      setWeekdays(builder.customWeekdays);
      setMonthDays(builder.customMonthDays);
      setMonthlyMode(builder.customMonthlyMode);
      setHasEnd(endAt !== undefined);
      setEndValue(toDateString(endAt));
    }
  }, [builder, endAt, open]);
  const interval = Number(intervalInput);
  const intervalValid = /^\d+$/.test(intervalInput) && Number.isInteger(interval) && interval >= CUSTOM_INTERVAL_MIN && interval <= CUSTOM_INTERVAL_MAX;
  const canIncrement = intervalInput === "" || interval < CUSTOM_INTERVAL_MAX;
  const canDecrement = intervalInput !== "" && interval > CUSTOM_INTERVAL_FLOOR;
  const step = (delta: number) => {
    const base = /^\d+$/.test(intervalInput) ? interval : CUSTOM_INTERVAL_FLOOR;
    const next = Math.min(CUSTOM_INTERVAL_MAX, Math.max(CUSTOM_INTERVAL_FLOOR, base + delta));
    setIntervalInput(String(next));
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-[400px] gap-0 overflow-y-auto rounded-xl border-border bg-card p-0 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogHeader className="px-5 pb-5 pt-5">
          <DialogTitle className="text-ui-xl font-medium leading-[26px] tracking-[-0.12px]">{intl.formatMessage({ id: "automations.customRepeat.title" })}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label={intl.formatMessage({ id: "common.close" })}
              className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-[6px] opacity-80 transition-colors hover:bg-surface-hover hover:opacity-100"
            >
              <IconX className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-5 px-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="automation-custom-interval" className="text-ui-base leading-5 tracking-[-0.18px] text-foreground">
              {intl.formatMessage({ id: "automations.customRepeat.frequency" })}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="automation-custom-interval"
                  type="number"
                  min={CUSTOM_INTERVAL_FLOOR}
                  max={CUSTOM_INTERVAL_MAX}
                  step={1}
                  inputMode="numeric"
                  value={intervalInput}
                  aria-invalid={!intervalValid}
                  className="h-9 rounded-lg px-3 pr-10 text-mobile-input-safe leading-6 tracking-[-0.18px] [appearance:textfield] md:text-ui-base md:leading-5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  data-testid={TESTID_CUSTOM_INTERVAL_INPUT}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "" || /^\d+$/.test(next)) setIntervalInput(next);
                  }}
                />
                <div className="absolute inset-y-px right-px flex w-8 flex-col overflow-hidden rounded-r-[7px] border-l border-input-border bg-input">
                  <button
                    type="button"
                    aria-label="+1"
                    title="+1"
                    data-testid={TESTID_CUSTOM_INTERVAL_INC}
                    disabled={!canIncrement}
                    onClick={() => step(1)}
                    className="flex flex-1 items-center justify-center border-b border-input-border text-foreground-subtle transition-colors hover:bg-input-focused hover:text-foreground focus-visible:z-10 focus-visible:bg-input-focused focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                  >
                    <IconChevronUp className="size-3" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="-1"
                    title="-1"
                    data-testid={TESTID_CUSTOM_INTERVAL_DEC}
                    disabled={!canDecrement}
                    onClick={() => step(-1)}
                    className="flex flex-1 items-center justify-center text-foreground-subtle transition-colors hover:bg-input-focused hover:text-foreground focus-visible:z-10 focus-visible:bg-input-focused focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                  >
                    <IconChevronDown className="size-3" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Select
                value={unit}
                onValueChange={(value) => {
                  const next = value as ScheduleBuilderState["customUnit"];
                  setUnit(next);
                  if (next === "yearly") setMonthDays([new Date().getDate()]);
                }}
              >
                <SelectTrigger
                  className="h-9 w-full rounded-[8px] px-3 text-ui-base leading-5 tracking-[-0.18px] hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80"
                  data-testid={TESTID_CUSTOM_UNIT}
                  indicator={<AutomationSelectIndicator />}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start" side="bottom" sideOffset={4} collisionPadding={8} className={AUTOMATION_SELECT_CONTENT_CLASS}>
                  <SelectItem value="minute" className={AUTOMATION_SELECT_ITEM_CLASS} data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "minute")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.minute" })}
                  </SelectItem>
                  <SelectItem value="hourly" className={AUTOMATION_SELECT_ITEM_CLASS} data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "hourly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.hour" })}
                  </SelectItem>
                  <SelectItem value="daily" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "daily")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.day" })}
                  </SelectItem>
                  <SelectItem value="weekly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "weekly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.week" })}
                  </SelectItem>
                  <SelectItem value="monthly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "monthly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.month" })}
                  </SelectItem>
                  <SelectItem value="yearly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "yearly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.year" })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {unit === "weekly" ? (
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
                const included = weekdays.includes(weekday);
                return (
                  <button
                    key={weekday}
                    type="button"
                    onClick={() => {
                      if (included && weekdays.length === 1) return;
                      setWeekdays(included ? weekdays.filter((entry) => entry !== weekday) : [...weekdays, weekday]);
                    }}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border text-ui-base",
                      included ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                    )}
                  >
                    {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
                  </button>
                );
              })}
            </div>
          ) : null}
          {unit === "monthly" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ui-base text-foreground">{intl.formatMessage({ id: "automations.customRepeat.rule" })}</span>
                <Select value={monthlyMode} onValueChange={(value) => setMonthlyMode(value as "date" | "weekday")}>
                  <SelectTrigger className="h-9 w-32 rounded-[8px] px-3 text-ui-base hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80" indicator={<AutomationSelectIndicator />}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" side="bottom" sideOffset={4} collisionPadding={8} className={AUTOMATION_SELECT_CONTENT_CLASS}>
                    <SelectItem value="date" className={AUTOMATION_SELECT_ITEM_CLASS}>
                      {intl.formatMessage({ id: "automations.customRepeat.byDate" })}
                    </SelectItem>
                    <SelectItem value="weekday" className={AUTOMATION_SELECT_ITEM_CLASS}>
                      {intl.formatMessage({ id: "automations.customRepeat.byWeekday" })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {monthlyMode === "date" ? (
                <div className="grid grid-cols-10 gap-2.5">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
                    const included = monthDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (included && monthDays.length === 1) return;
                          setMonthDays(included ? monthDays.filter((entry) => entry !== day) : [...monthDays, day]);
                        }}
                        className={cn(
                          "flex h-7 w-full items-center justify-center rounded-[8px] border text-ui-sm",
                          included ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {WEEKDAY_DISPLAY_ORDER.map((weekday) => (
                    <button
                      key={weekday}
                      type="button"
                      onClick={() => setWeekdays([weekday])}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md border text-ui-base",
                        weekdays.includes(weekday) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                      )}
                    >
                      {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <span className="text-ui-base leading-5 tracking-[-0.18px] text-foreground">{intl.formatMessage({ id: "automations.customRepeat.ends" })}</span>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setHasEnd(false)} className="flex h-9 items-center gap-2 rounded-[8px] px-2 text-ui-base leading-5 tracking-[-0.18px] transition-colors hover:bg-surface-hover">
                <span className="flex size-5 items-center justify-center">
                  <span className={cn("flex size-4 items-center justify-center rounded-full border-[1.33px]", hasEnd ? "border-border" : "border-[#4099FF] bg-[#4099FF]")}>
                    {hasEnd ? null : <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                </span>
                {intl.formatMessage({ id: "automations.customRepeat.neverEnds" })}
              </button>
              <button type="button" onClick={() => setHasEnd(true)} className="flex h-9 items-center gap-2 rounded-[8px] px-2 text-ui-base leading-5 tracking-[-0.18px] transition-colors hover:bg-surface-hover">
                <span className="flex size-5 items-center justify-center">
                  <span className={cn("flex size-4 items-center justify-center rounded-full border-[1.33px]", hasEnd ? "border-[#4099FF] bg-[#4099FF]" : "border-border")}>
                    {hasEnd ? <span className="size-1.5 rounded-full bg-white" /> : null}
                  </span>
                </span>
                {intl.formatMessage({ id: "automations.customRepeat.endsOption" })}
              </button>
            </div>
            <EndDatePicker value={endValue} min={toDateString(Date.now())} disabled={!hasEnd} intl={intl} onChange={setEndValue} />
          </div>
        </div>
        <DialogFooter className="gap-3 px-5 pb-5 pt-5">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-9 rounded-[8px] px-4 text-ui-base font-medium leading-5 tracking-[-0.18px] hover:border-border-hover hover:bg-input/50">
              {intl.formatMessage({ id: "common.cancel" })}
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="h-9 rounded-[8px] px-4 text-ui-base font-medium leading-5 tracking-[-0.18px] hover:bg-primary/80"
            data-testid={TESTID_CUSTOM_CONFIRM}
            disabled={!intervalValid || (hasEnd && !dateStringToEndTimestamp(endValue))}
            onClick={() => {
              onConfirm({
                interval,
                unit,
                weekdays,
                monthDays,
                monthlyMode,
                ...(hasEnd ? { endAt: dateStringToEndTimestamp(endValue) } : {}),
              });
              onOpenChange(false);
            }}
          >
            {intl.formatMessage({ id: "common.confirm" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原 SNt（136919）：保存成功 → 续跑（两步串联） */
export async function runIfSaved(save: () => Promise<boolean>, then: () => Promise<void>): Promise<boolean> {
  return (await save()) ? (await then(), true) : false;
}

/** 原 CNt（136922）：调度构建缺省（每日 09:00） */
export function defaultScheduleBuilder(): ScheduleBuilderState {
  return {
    frequency: "daily",
    hour: 9,
    minute: 0,
    weekdays: [1],
    dayOfMonth: 1,
    rawExpr: "0 9 * * *",
    customInterval: 1,
    customUnit: "daily",
    customWeekdays: [1],
    customMonthDays: [1],
    customMonth: new Date().getMonth() + 1,
    customMonthlyMode: "date",
  };
}

/** 原 s6（136938）：编辑/草稿 → 构建态（无则缺省；scheduleRule 优先 → custom 展开） */
export function scheduleBuilderOf(automation: AutomationTaskLite | null | undefined, draft: Record<string, unknown> | null | undefined): ScheduleBuilderState {
  if (!automation) return draft ? cronToScheduleBuilder(String(draft.cronExpr ?? "")) : defaultScheduleBuilder();
  const base = cronToScheduleBuilder(automation.cronExpr);
  const rule = automation.scheduleRule as
    | { hour: number; minute: number; interval: number; unit: ScheduleBuilderState["customUnit"]; weekdays?: number[]; monthDays?: number[]; months?: number[]; anchorAt: number; monthlyMode?: "date" | "weekday" }
    | null
    | undefined;
  return rule
    ? {
        ...base,
        frequency: "custom",
        hour: rule.hour,
        minute: rule.minute,
        customInterval: rule.interval,
        customUnit: rule.unit,
        customWeekdays: rule.weekdays ?? [1],
        customMonthDays: rule.monthDays ?? [1],
        customMonth: rule.months?.[0] ?? new Date(rule.anchorAt).getMonth() + 1,
        customMonthlyMode: rule.monthlyMode ?? "date",
      }
    : base;
}

/** 原 wNt（136956）：运行记录状态归一（分派态优先） */
export function automationRunStatusOf(run: { dispatchStatus?: string; outcome?: string }): "succeeded" | "failed" | "stopped" | "running" | "skipped" {
  if (run.dispatchStatus === "skipped") return "skipped";
  if (run.dispatchStatus === "failed_to_dispatch") return "failed";
  switch (run.outcome) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "stopped":
      return "stopped";
    default:
      return "running";
  }
}

/** 原 TNt/ENt/DNt（136970–136989）：运行状态色表 */
export const AUTOMATION_RUN_DOT_CLASSES: Record<string, string> = {
  running: "bg-primary",
  succeeded: "bg-success",
  failed: "bg-destructive",
  stopped: "bg-foreground-subtlest",
  skipped: "bg-warning",
};
export const AUTOMATION_RUN_TEXT_CLASSES: Record<string, string> = {
  running: "text-primary",
  succeeded: "text-success",
  failed: "text-destructive",
  stopped: "text-foreground-subtle",
  skipped: "text-warning",
};
export const AUTOMATION_LIFECYCLE_DOT_CLASSES: Record<string, string> = {
  active: "bg-success",
  paused: "bg-warning",
  failed: "bg-destructive",
  completed: "bg-foreground-subtlest",
};

export interface ScheduleRule {
  unit: string;
  interval: number;
  hour: number;
  minute: number;
  anchorAt: number;
  weekdays: number[];
  monthDays: number[];
  months: number[];
  monthlyMode: string;
  [key: string]: unknown; // A0-CLEANUP3 3b：与 AutomationScheduleRule/Record 面互指（接口无隐式索引签名）
}

/** 原 ONt（136990）：scheduleRule 提交载荷（空 → null） */
/** A0-CLEANUP3 3b：ScheduleRule 带索引签名后 Omit 会塌缩成员，改用 Pick&Partial 保形 */
export function scheduleRulePayload(rule: Pick<ScheduleRule, "unit" | "interval" | "hour" | "minute" | "anchorAt"> & Partial<ScheduleRule> | null): ScheduleRule | null {
  return rule
    ? {
        unit: rule.unit,
        interval: rule.interval,
        hour: rule.hour,
        minute: rule.minute,
        anchorAt: rule.anchorAt,
        weekdays: rule.weekdays ?? [],
        monthDays: rule.monthDays ?? [],
        months: rule.months ?? [],
        monthlyMode: rule.monthlyMode ?? "date",
      }
    : null;
}

/* --- C.4 编辑器根组件 --- */

/** 原 R3（134943）：工具条按钮类名 */
export const AUTOMATION_TOOLBAR_BUTTON_CLASS =
  "h-7 rounded-lg text-ui-base font-normal leading-5 text-foreground-subtle hover:bg-surface-hover hover:text-foreground aria-expanded:bg-surface-hover aria-expanded:text-foreground";

/** 原 Nn/Rt/nr testid 登记（头部声明；值见 src chunk） */

/**
 * 原 YMt（135576–136025）：OffPeakTaskEditor（闲时任务编辑器）。
 * settings/history 双标签；标题缺省联动；丢弃确认；全权限提示一次性 toast；
 * keepAwake 写应用设置；运行中态锁定表单。
 */
export function OffPeakTaskEditor({
  editing,
  initialDraft,
  allowedModels,
  allowedModelConfigs = [],
  defaultWorkspacePath,
  defaultWorkspaceIdentity,
  saving,
  createBlocked = false,
  createBlockedTooltip,
  onBack,
  onSubmit,
  onOpenSession,
  onDelete,
  onDeleteHistory,
  onPause,
  onContinue,
  showToast = toast,
}: {
  editing: OffPeakTaskRecord | null;
  initialDraft: Record<string, unknown> | null;
  allowedModels: string[];
  allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  defaultWorkspacePath: string;
  defaultWorkspaceIdentity?: string | null;
  saving: boolean;
  createBlocked?: boolean;
  createBlockedTooltip?: string;
  onBack: () => void;
  onSubmit: (input: { title: string; prompt: string; [key: string]: unknown }) => Promise<boolean>; // A0-CLEANUP3 3b：提交面恒含 title/prompt（函数体构造面即如此），兼容 EV.OffPeakCreateInput 回调
  onOpenSession?: (opts: { sessionId: string; workspacePath?: string; workspaceIdentity?: string | null }) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
  onDeleteHistory?: (task: OffPeakTaskRecord) => void;
  onPause?: (task: OffPeakTaskRecord) => void;
  onContinue?: (task: OffPeakTaskRecord) => void;
  showToast?: (message: string, options?: any) => string | number;
}) {
  const { intl } = useIntlContext();
  const { settings, update } = useAppSettings();
  const confirmDialog = useConfirmDialog();
  const workspaceOptions = useWorkspaceOptions();
  const defaultOption = workspaceOptions.find((option) => !defaultWorkspaceIdentity && option.workspacePath === defaultWorkspacePath) ?? workspaceOptions[0];
  const [tab, setTab] = React.useState("settings");
  const fullAccessHintShown = React.useRef(false);
  const suppressDiscardConfirm = React.useRef(false);
  const titleTouched = React.useRef(false);
  const workspaceSelectRef = React.useRef<string | null>(null);
  const defaultTitle = intl.formatMessage({ id: "offPeak.create.defaultTitle" });
  const draftTitle = (initialDraft?.title as string | undefined) ?? defaultTitle;
  const previousDefaultTitle = React.useRef(defaultTitle);
  const [title, setTitle] = React.useState(editing?.title ?? draftTitle);
  const [prompt, setPrompt] = React.useState((editing?.prompt as string | undefined) ?? (initialDraft?.prompt as string | undefined) ?? "");
  const [mode, setMode] = React.useState((editing?.permissionMode as string | undefined) ?? "build");
  const [model, setModel] = React.useState((editing?.model as string | undefined) ?? allowedModels[0] ?? "");
  const [thoughtLevel, setThoughtLevel] = React.useState<string | undefined>(editing?.thoughtLevel as string | undefined);
  const [workspacePath, setWorkspacePath] = React.useState(defaultOption?.workspacePath ?? "");
  const modelGroups = React.useMemo(
    () => (allowedModels.length > 0 ? [{ key: "off-peak", label: "", items: allowedModels.map((entry) => ({ key: entry, value: entry, name: entry })) }] : []),
    [allowedModels],
  );
  const workspaceTabs = React.useMemo(() => workspaceOptions.map((option) => ({ workspacePath: option.workspacePath, label: option.label })), [workspaceOptions]);
  React.useEffect(() => {
    if (editing || workspaceOptions.length === 0 || workspaceOptions.some((option) => option.workspacePath === workspacePath)) return;
    setWorkspacePath(defaultOption?.workspacePath ?? "");
    workspaceSelectRef.current = defaultOption?.workspacePath ?? "";
  }, [workspacePath, editing, workspaceOptions, defaultOption?.workspacePath]);
  const thoughtOption = React.useMemo(
    () =>
      buildOffPeakThoughtOption({
        model,
        thoughtLevel,
        allowedModelConfigs,
        formatLevelName: (level) => intl.formatMessage({ id: `offPeak.thought.${level}` }),
      }),
    [allowedModelConfigs, intl, model, thoughtLevel],
  );
  const resolvedThoughtLevel =
    typeof thoughtOption?.currentValue === "string" && thoughtOption.currentValue.trim().length > 0 ? thoughtOption.currentValue : undefined;
  const baseline = React.useRef({
    title: editing?.title ?? draftTitle,
    prompt: editing?.prompt ?? (initialDraft?.prompt as string | undefined) ?? "",
    mode: editing?.permissionMode ?? "build",
    model: editing?.model ?? allowedModels[0] ?? "",
    thoughtLevel: editing?.thoughtLevel as string | undefined,
    workspacePath: editing?.workspacePath ?? defaultOption?.workspacePath ?? "",
  });
  React.useEffect(() => {
    const next = resolveTitleOnDefaultChange({
      currentTitle: title,
      hasInitialTitle: !!initialDraft?.title,
      isEditing: !!editing,
      nextDefaultTitle: defaultTitle,
      previousDefaultTitle: previousDefaultTitle.current,
      titleTouched: titleTouched.current,
    });
    previousDefaultTitle.current = defaultTitle;
    if (next !== title) {
      setTitle(next);
      baseline.current.title = next;
    }
  }, [editing, initialDraft?.title, defaultTitle, title]);
  const dirty =
    title !== baseline.current.title ||
    prompt !== baseline.current.prompt ||
    mode !== baseline.current.mode ||
    model !== baseline.current.model ||
    thoughtLevel !== baseline.current.thoughtLevel ||
    (!editing && workspacePath !== baseline.current.workspacePath);
  const handleBack = React.useCallback(async () => {
    if (!dirty || suppressDiscardConfirm.current) {
      onBack();
      return;
    }
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "offPeak.discard.title" }),
      description: intl.formatMessage({ id: "offPeak.discard.description" }),
      confirmLabel: intl.formatMessage({ id: "offPeak.discard.confirm" }),
      confirmVariant: "destructive",
      showCloseButton: true,
      showKeyboardHints: false,
      presentation: "automation-confirmation",
    });
    if (confirmed) onBack();
  }, [confirmDialog, dirty, intl, onBack]);
  const keepAwake = settings?.keepAwakeWhileRunning ?? false;
  const runningLocked = !!(editing && editing.status !== "queued" && editing.status !== "paused");
  suppressDiscardConfirm.current = runningLocked;
  const effectiveWorkspacePath = editing?.workspacePath ?? workspacePath;
  const canSubmit = title.trim().length > 0 && prompt.trim().length > 0 && !!effectiveWorkspacePath && !saving && !createBlocked && !runningLocked;
  const handleSubmit = React.useCallback(async () => {
    if (!canSubmit) return;
    if (mode !== "yolo" && !fullAccessHintShown.current) {
      fullAccessHintShown.current = true;
      showToast(intl.formatMessage({ id: "offPeak.form.fullAccessHint" }), {
        durationMs: 8000,
        position: "top-center",
        variant: "info",
        dismissible: true,
        dismissLabel: intl.formatMessage({ id: "common.close" }),
      });
    }
    const ok = await onSubmit({
      title: title.trim(),
      prompt: prompt.trim(),
      permissionMode: mode,
      ...(model ? { model } : {}),
      ...(resolvedThoughtLevel ? { thoughtLevel: resolvedThoughtLevel } : {}),
      workspacePath: effectiveWorkspacePath,
      ...(editing?.workspaceIdentity ? { workspaceIdentity: editing.workspaceIdentity } : {}),
    });
    if (ok) onBack();
  }, [canSubmit, editing, resolvedThoughtLevel, intl, mode, model, onBack, onSubmit, prompt, title, effectiveWorkspacePath, showToast]);
  const modeOption = React.useMemo(() => buildModeOption(mode), [mode]);
  const submitButton = (
    <button
      type="button"
      data-testid={TESTID_OFFPEAK_SUBMIT}
      disabled={!canSubmit}
      onClick={() => void handleSubmit()}
      className="inline-flex h-8 items-center rounded-lg border-0 bg-white/5 px-3 text-ui-base font-normal leading-5 text-foreground shadow-none outline-none transition-colors hover:bg-white/10 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
    >
      {intl.formatMessage({ id: "offPeak.create.submit" })}
    </button>
  );
  return (
    <div className={cn(AUTOMATION_EDITOR_PAGE_CLASS, "relative flex flex-col gap-6")} data-testid="offpeak-editor-root">
      <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">{intl.formatMessage({ id: "settings.automations.title" })}</h1>
      <div className="flex min-w-0 flex-wrap items-center gap-4 sm:flex-nowrap">
        <button type="button" onClick={() => void handleBack()} className={AUTOMATION_BACK_BUTTON_CLASS}>
          <IconArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="min-w-0 truncate">{editing?.title ?? intl.formatMessage({ id: "offPeak.create.title" })}</span>
        </button>
        <span aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-border sm:block" />
        <div className="flex shrink-0 items-center gap-2">
          <KeepAwakeSwitch
            checked={keepAwake}
            ariaLabel={intl.formatMessage({ id: "offPeak.form.keepAwakeLabel" })}
            onChange={(checked) => void update({ keepAwakeWhileRunning: checked })}
            color="blue"
            size="sm"
          />
          <span className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.keepAwakeLabel" })}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <EditorTabSwitcher
          value={tab}
          settingsLabel={intl.formatMessage({ id: "offPeak.tab.settings" })}
          historyLabel={intl.formatMessage({ id: "offPeak.tab.history" })}
          onValueChange={setTab}
        />
        {tab !== "history" && !editing ? (
          createBlockedTooltip ? (
            <Tooltip title={createBlockedTooltip} side="top" align="center">
              <span className="inline-flex">{submitButton}</span>
            </Tooltip>
          ) : (
            submitButton
          )
        ) : tab !== "history" && !runningLocked ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid={TESTID_OFFPEAK_SUBMIT}
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
              className="inline-flex h-8 items-center rounded-lg border-0 bg-white px-3 text-ui-base font-medium text-black shadow-none outline-none transition-colors hover:bg-white/90 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
            >
              {intl.formatMessage({ id: "offPeak.edit.save" })}
            </button>
            {editing ? (
              <OffPeakTaskMenu
                task={editing}
                {...(onPause ? { onPause } : {})}
                {...(onContinue ? { onContinue } : {})}
                {...(onDelete ? { onDelete } : {})}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {editing && tab === "settings" ? (
        <div className="flex min-h-11 items-center gap-3 rounded-[10px] bg-surface px-3 py-3 text-ui-base leading-5 text-foreground-subtle sm:py-0">
          <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
            <AutomationInfoIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}
        </div>
      ) : null}
      {tab === "history" ? (
        <OffPeakHistoryTable
          task={editing}
          {...(onOpenSession
            ? {
                onOpenSession: (task) =>
                  task.sessionId
                    ? onOpenSession({
                        sessionId: task.sessionId,
                        workspacePath: task.workspacePath,
                        ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
                      })
                    : undefined,
              }
            : {})}
          {...(onDeleteHistory ? { onDelete: onDeleteHistory } : {})}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={AUTOMATION_FIELD_STACK_CLASS}>
            <span className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.titleLabel" })}</span>
            <Input
              value={title}
              disabled={runningLocked}
              data-testid={TESTID_OFFPEAK_TITLE}
              placeholder={intl.formatMessage({ id: "offPeak.form.titlePlaceholder" })}
              onChange={(event) => {
                titleTouched.current = true;
                setTitle(event.target.value);
              }}
              className={cn("h-9 rounded-lg bg-card px-2 text-foreground hover:bg-surface-hover focus-visible:bg-card", AUTOMATION_TEXT_CLASS)}
            />
          </div>
          <div className={AUTOMATION_FIELD_STACK_CLASS}>
            <span className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.instructionsLabel" })}</span>
            <PromptCard>
              <AutoGrowTextarea
                data-testid={TESTID_OFFPEAK_PROMPT}
                value={prompt}
                disabled={runningLocked}
                placeholder={intl.formatMessage({ id: "offPeak.form.instructionsPlaceholder" })}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
              />
              <PromptCardFooter>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {editing ? (
                    <span className="flex h-7 min-w-0 items-center gap-1 rounded-lg px-2 text-ui-base font-normal leading-snug text-foreground-subtle">
                      <IconFolderOpen className="size-4 shrink-0" aria-hidden="true" />
                      <span className="max-w-40 truncate" title={effectiveWorkspacePath}>
                        {pathTailName(effectiveWorkspacePath)}
                      </span>
                    </span>
                  ) : workspaceTabs.length > 0 ? (
                    <WorkspaceSelectRow
                      workspacePath={effectiveWorkspacePath}
                      workspaceTabs={workspaceTabs}
                      allowConversationWorkspaceSelection={false}
                      onSelectWorkspace={(entry) => setWorkspacePath(entry.workspacePath)}
                      onSelectConversationWorkspace={() => {}}
                      allowOpenWorkspace={false}
                      allowRemoteWorkspace={false}
                      onOpenFolder={() => {}}
                      onConnectRemote={async () => ""}
                      onSelectRemoteProject={async () => {}}
                      onCancelRemoteProject={async () => {}}
                      containerClassName="rounded-lg"
                      triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "min-w-0 gap-1 px-2")}
                      triggerIndicator={
                        <span className="text-foreground-subtle">
                          <AutomationChevronIndicator size={14} containerSize={20} />
                        </span>
                      }
                    />
                  ) : (
                    <Button type="button" variant="ghost" size="xs" disabled className={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "gap-1 px-2 text-foreground-subtlest")}>
                      <IconFolderOpen className="size-4" aria-hidden="true" />
                      {intl.formatMessage({ id: "automations.form.project.localRequired" })}
                    </Button>
                  )}
                  <ModeSelector
                    option={modeOption}
                    provider="glm"
                    onValueChange={setMode}
                    disabled={runningLocked}
                    tooltipTitle={intl.formatMessage({ id: "chat.toolbar.mode.label" })}
                    triggerVariant="ghost"
                    triggerSize="default"
                    triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-56 min-w-0 shrink justify-start gap-1 px-2")}
                    labelVisibilityClassName="inline-flex min-w-0 truncate text-left"
                    restoreFocusSelector={null}
                  />
                </div>
                <div className="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:w-auto">
                  <ModelSelector
                    modelGroups={modelGroups}
                    normalizedValue={model}
                    triggerLabel={model || intl.formatMessage({ id: "offPeak.form.modelLabel" })}
                    showProviderLevel={false}
                    showManageModelsAction={false}
                    lockReasonMessage=""
                    isItemLocked={automationModelNeverLocked}
                    onValueChange={setModel}
                    disabled={runningLocked || allowedModels.length === 0}
                    tooltipTitle={intl.formatMessage({ id: "offPeak.form.modelLabel" })}
                    contentSide="top"
                    contentAlign="end"
                    focusSelectorOnClose={null}
                    labelVisibilityClassName="inline-flex min-w-0"
                    triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-72 min-w-0 shrink justify-between px-2")}
                    triggerLabelClassName="inline-flex min-w-0 truncate text-left"
                  />
                  {thoughtOption ? (
                    <ThoughtLevelSelector
                      intl={intl}
                      option={thoughtOption}
                      provider="glm"
                      disabled={runningLocked}
                      triggerRef={workspaceSelectRef as React.RefObject<HTMLButtonElement | null>}
                      triggerClassName={AUTOMATION_TOOLBAR_BUTTON_CLASS}
                      interactionMode="select"
                      restoreFocusSelector={null}
                      labelVisibilityClassName="inline-flex min-w-0"
                      onValueChange={(value) => setThoughtLevel(value)}
                    />
                  ) : null}
                </div>
              </PromptCardFooter>
            </PromptCard>
            <div className="mt-1 flex items-start gap-1.5 text-ui-base leading-5 text-foreground-subtle">
              <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                <AutomationInfoIcon className="size-4" />
              </span>
              {intl.formatMessage({ id: "offPeak.form.permissionWarning" })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface AutomationRunRecord {
  runId: string;
  trigger: string;
  sessionId?: string | null;
  scheduledAt?: number;
  createdAt: number;
  updatedAt?: number;
  outcome?: string;
  dispatchStatus?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * 原 kNt（137005–138512）：AutomationEditor（定时任务编辑器）。
 * 状态机要点：
 *  - 标题缺省联动（Rjt）+ 触碰标记；计划删除（Le 分支：聊天创建 ∧ 未被用户编辑 ∧ 不可表示 cron）
 *  - 工作区解析三级回退（tNt）；模型继承（Q3）+ 工作区配置联动（Jq）
 *  - 思考选项预览（临时会话探测 LMt + 缓存 ie + 重试 de）
 *  - 必填校验（$Mt）+ 变更字段集（QMt）+ 未保存丢弃确认（U2）
 *  - 保存并立即运行（SNt 串联）；历史标签 5s 轮询
 */
export function AutomationEditor({
  editing,
  initialDraft,
  defaultWorkspacePath,
  defaultWorkspaceIdentity,
  modelProviders,
  modelSelectGroups,
  onManageModels,
  saving,
  onSubmit,
  onBack,
  onRunNow,
  onToggle,
  onDelete,
  runsEntry,
  onLoadRuns,
  onDeleteRun,
  onOpenSession,
}: {
  editing: AutomationTaskLite | null;
  initialDraft: Record<string, unknown> | null;
  defaultWorkspacePath: string;
  defaultWorkspaceIdentity?: string | null;
  modelProviders: ModelProvider[];
  modelSelectGroups: SelectGroupEntry[];
  onManageModels?: () => void;
  saving: boolean;
  /** A0-CLEANUP3 3b：input 带出 title/prompt 必有面（buildInput 运行期恒产；消费端 AutomationInput 对齐） */
  onSubmit: (request: { input: { title: string; prompt: string; [key: string]: unknown }; workspacePath: string; workspaceIdentity?: string | null }) => Promise<boolean>;
  onBack: () => void;
  onRunNow?: (automation: AutomationTaskLite) => void;
  onToggle?: (automation: AutomationTaskLite, enabled: boolean) => Promise<void>;
  onDelete?: (automation: AutomationTaskLite) => Promise<void>;
  runsEntry?: { runs?: AutomationRunRecord[]; status?: string; error?: string };
  onLoadRuns: () => void;
  onDeleteRun?: (runId: string) => void;
  onOpenSession?: (sessionId: string) => void;
}) {
  const { intl } = useIntlContext();
  const confirmDialog = useConfirmDialog();
  const { zcodeAgentService } = useServices();
  const [tab, setTab] = React.useState("settings");
  const [runsPage, setRunsPage] = React.useState(1);
  const loadRunsRef = React.useRef(onLoadRuns);
  const runNowInFlightRef = React.useRef(false);
  const [runNowBusy, setRunNowBusy] = React.useState(false);
  const titlePlaceholder = intl.formatMessage({ id: "automations.edit.titlePlaceholder" });
  const previousDefaultTitle = React.useRef(titlePlaceholder);
  const titleTouched = React.useRef(false);
  const [title, setTitle] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState(AUTOMATION_MODEL_INHERIT);
  const modelBaseline = React.useRef(AUTOMATION_MODEL_INHERIT);
  const [mode, setMode] = React.useState(AUTOMATION_DEFAULT_MODE);
  const modeBaseline = React.useRef(AUTOMATION_DEFAULT_MODE);
  const [thoughtLevel, setThoughtLevel] = React.useState(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
  const thoughtBaseline = React.useRef(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
  const modelTouched = React.useRef(false);
  const thoughtTouched = React.useRef(false);
  const thoughtRetrySeq = React.useRef(0);
  const thoughtCache = React.useRef(new Map<string, ConfigOption | null>());
  const [thoughtPreview, setThoughtPreview] = React.useState<{ key: string; thoughtOption: ConfigOption | null } | null>(null);
  const [thoughtState, setThoughtState] = React.useState<{ key: string | null; status: string }>({ key: null, status: "ready" });
  const [thoughtRetry, setThoughtRetry] = React.useState(0);
  const thoughtTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [builder, setBuilder] = React.useState<ScheduleBuilderState>(() => scheduleBuilderOf(editing, initialDraft));
  const [scheduleMissing, setScheduleMissing] = React.useState(!editing && !initialDraft);
  const [validationVisible, setValidationVisible] = React.useState<Set<string>>(() => new Set());
  const [customRepeatOpen, setCustomRepeatOpen] = React.useState(false);
  const [scheduleDeleted, setScheduleDeleted] = React.useState<Set<string>>(() => new Set());
  const baselineRef = React.useRef<Record<string, string> | null>(null);
  const fieldBaselines = React.useRef<Record<string, string>>({});
  const [endAt, setEndAt] = React.useState<number | undefined>(editing?.endAt ?? undefined);
  const [workspaceKeyState, setWorkspaceKeyState] = React.useState<string | null>(null);
  const workspaceOptions = useWorkspaceOptions({ includeConversationWorkspace: true });
  const defaultModel = React.useMemo(() => defaultModelFromGroups(modelSelectGroups), [modelSelectGroups]);
  const defaultModelRef = React.useRef(defaultModel);
  defaultModelRef.current = defaultModel;
  const editingPurpose = editing ? findWorkspaceOption(workspaceOptions, editing.workspaceKey)?.workspacePurpose : undefined;
  const effectiveOptions = React.useMemo(
    () =>
      editing
        ? [
            {
              workspacePath: editing.workspacePath ?? "",
              workspaceIdentity: editing.workspaceIdentity ?? undefined,
              label: pathTailName(editing.workspacePath ?? ""),
              ...(editingPurpose ? { workspacePurpose: editingPurpose } : {}),
            },
          ]
        : workspaceOptions,
    [editing, editingPurpose, workspaceOptions],
  );
  const effectiveOptionsRef = React.useRef(effectiveOptions);
  effectiveOptionsRef.current = effectiveOptions;
  React.useEffect(() => {
    setTab("settings");
    setRunsPage(1);
    setScheduleDeleted(new Set());
    setValidationVisible(new Set());
    fieldBaselines.current = {};
    if (editing) {
      setScheduleMissing(false);
      titleTouched.current = false;
      modelTouched.current = false;
      thoughtTouched.current = false;
      setTitle(editing.title ?? "");
      setPrompt(editing.prompt ?? "");
      const nextModel = editing.model?.trim() || AUTOMATION_MODEL_INHERIT;
      const nextThought = (editing as { thoughtLevel?: string }).thoughtLevel?.trim() || AUTOMATION_DEFAULT_THOUGHT_LEVEL;
      modelBaseline.current = nextModel;
      thoughtBaseline.current = nextThought;
      setModel(nextModel);
      const nextMode = editing.mode?.trim() || AUTOMATION_DEFAULT_MODE;
      modeBaseline.current = nextMode;
      setMode(nextMode);
      setThoughtLevel(nextThought);
      setBuilder(scheduleBuilderOf(editing, initialDraft));
      setEndAt(editing.endAt ?? undefined);
      setWorkspaceKeyState(workspaceKey({ workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? null } as WorkspaceOption));
    } else {
      setScheduleMissing(!initialDraft);
      titleTouched.current = false;
      modelTouched.current = false;
      thoughtTouched.current = false;
      setTitle((initialDraft?.title as string | undefined) ?? titlePlaceholder);
      setPrompt((initialDraft?.prompt as string | undefined) ?? "");
      modelBaseline.current = defaultModelRef.current;
      setModel(defaultModelRef.current);
      modeBaseline.current = AUTOMATION_DEFAULT_MODE;
      thoughtBaseline.current = AUTOMATION_DEFAULT_THOUGHT_LEVEL;
      setMode(AUTOMATION_DEFAULT_MODE);
      setThoughtLevel(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
      setBuilder(scheduleBuilderOf(editing, initialDraft));
      setEndAt(undefined);
      setWorkspaceKeyState(resolveWorkspaceOptionKey(effectiveOptionsRef.current, null, { workspacePath: defaultWorkspacePath, workspaceIdentity: defaultWorkspaceIdentity ?? null }));
    }
  }, [editing, initialDraft, defaultWorkspacePath, defaultWorkspaceIdentity, titlePlaceholder]);
  React.useEffect(() => {
    const next = resolveDraftTitleOnDefaultChange({
      currentTitle: title,
      hasInitialDraft: !!initialDraft,
      isEditing: !!editing,
      nextDefaultTitle: titlePlaceholder,
      previousDefaultTitle: previousDefaultTitle.current,
      titleTouched: titleTouched.current,
    });
    previousDefaultTitle.current = titlePlaceholder;
    if (next !== title) setTitle(next);
  }, [editing, initialDraft, titlePlaceholder, title]);
  React.useEffect(() => {
    if (editing) return;
    setWorkspaceKeyState((current) => resolveWorkspaceOptionKey(effectiveOptions, current, { workspacePath: defaultWorkspacePath, workspaceIdentity: defaultWorkspaceIdentity ?? null }));
  }, [defaultWorkspaceIdentity, defaultWorkspacePath, editing, effectiveOptions]);
  const markTouched = React.useCallback((field: string) => {
    if (fieldBaselines.current[field] === undefined) {
      fieldBaselines.current[field] = baselineRef.current?.[field] as string;
    }
    setScheduleDeleted((previous) => {
      if (previous.has(field)) return previous;
      const next = new Set(previous);
      next.add(field);
      return next;
    });
  }, []);
  const clearTouched = React.useCallback((field: string) => {
    setValidationVisible((previous) => removeFromSet(previous, field));
  }, []);
  const removeSchedule = React.useCallback(() => {
    markTouched("schedule");
    setScheduleMissing(true);
    clearTouched("schedule");
    logger.debug("[AutomationEditView] 删除计划草稿", {
      automationId: editing?.automationId ?? null,
      validationVisible: false,
    });
  }, [clearTouched, editing?.automationId, markTouched]);
  React.useEffect(() => {
    if (editing || model === AUTOMATION_MODEL_INHERIT || defaultModel === AUTOMATION_MODEL_INHERIT) return;
    modelBaseline.current = defaultModel;
    setModel(defaultModel);
  }, [defaultModel, editing, model]);
  React.useEffect(() => {
    loadRunsRef.current = onLoadRuns;
  }, [onLoadRuns]);
  React.useEffect(() => {
    if (tab !== "history" || !editing) return;
    loadRunsRef.current?.();
    const timer = window.setInterval(() => {
      loadRunsRef.current?.();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [tab, editing?.automationId]);
  const legacySchedule =
    isChatCreatedAutomation(editing) && !editing?.scheduleEditedByUser && !!(editing && !isRepresentableCron(editing.cronExpr)) && !scheduleDeleted.has("schedule");
  const cronExpr = React.useMemo(
    () => (scheduleMissing ? "" : legacySchedule ? editing?.cronExpr ?? "" : scheduleBuilderToCron(builder)),
    [builder, editing?.cronExpr, legacySchedule, scheduleMissing],
  );
  const schedulePreview = React.useMemo(() => (cronExpr ? schedulePreviewText(builder, intl) : ""), [builder, cronExpr, intl]);
  const selectedWorkspace =
    findWorkspaceOption(effectiveOptions, workspaceKeyState) ??
    (editing
      ? { workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? undefined, label: pathTailName(editing.workspacePath ?? "") }
      : null);
  const workspaceTabEntries = React.useMemo(
    () =>
      effectiveOptions.map((option) => ({
        workspacePath: option.workspacePath,
        label: option.label,
        ...(option.workspaceIdentity ? { workspaceIdentity: option.workspaceIdentity } : {}),
        ...(option.workspacePurpose ? { workspacePurpose: option.workspacePurpose } : {}),
      })),
    [effectiveOptions],
  );
  const selectedWorkspacePath = selectedWorkspace?.workspacePath ?? "";
  const selectedWorkspaceIdentity = selectedWorkspace?.workspaceIdentity;
  const isConversationWorkspace = selectedWorkspace?.workspacePurpose === "conversation";
  const workspaceDisplayLabel = isConversationWorkspace ? intl.formatMessage({ id: "chat.empty.workOutsideProject" }) : selectedWorkspace?.label ?? pathTailName(defaultWorkspacePath);
  const conversationOption = effectiveOptions.find((option) => option.workspacePurpose === "conversation");
  const { configOptions } = useWorkspaceConfigOptions(selectedWorkspacePath, null, selectedWorkspaceIdentity);
  const workspaceModelValue = React.useMemo(() => currentModelOptionValue(configOptions), [configOptions]);
  const workspaceThoughtOption = React.useMemo(() => findThoughtOption(configOptions), [configOptions]);
  const workspaceModelItem = React.useMemo(() => (workspaceModelValue ? resolveModelGroupItem(modelSelectGroups, workspaceModelValue) : null), [workspaceModelValue, modelSelectGroups]);
  const effectiveModel = workspaceModelItem?.value ?? workspaceModelValue ?? defaultModel;
  React.useEffect(() => {
    if (editing || modelTouched.current || effectiveModel === AUTOMATION_MODEL_INHERIT) return;
    modelBaseline.current = effectiveModel;
    setModel(effectiveModel);
  }, [editing, effectiveModel]);
  React.useEffect(() => {
    if (editing || thoughtTouched.current) return;
    const current = workspaceThoughtOption?.currentValue;
    if (typeof current !== "string" || !current.trim()) return;
    thoughtBaseline.current = current;
    setThoughtLevel(current);
  }, [editing, workspaceThoughtOption]);
  const handleSelectWorkspace = (entry: { workspacePath: string }) => {
    modelTouched.current = false;
    thoughtTouched.current = false;
    setWorkspaceKeyState(workspaceKey(entry as WorkspaceOption));
  };
  const handleSelectConversationWorkspace = () => {
    if (conversationOption) {
      modelTouched.current = false;
      thoughtTouched.current = false;
      setWorkspaceKeyState(workspaceOptionKey(conversationOption));
    }
  };
  const modelTriggerLabel =
    model === AUTOMATION_MODEL_INHERIT
      ? intl.formatMessage({ id: "automations.form.model.inherit" })
      : resolveModelLabel({
          modelGroups: modelSelectGroups,
          modelProviders,
          modelValue: model,
          fallbackLabel: intl.formatMessage({ id: "chat.toolbar.model.label" }),
        });
  const handleModelChange = React.useCallback(
    (value: string) => {
      modelTouched.current = true;
      thoughtTouched.current = false;
      modelBaseline.current = value;
      setModel(value);
      markTouched("model");
    },
    [markTouched],
  );
  const modeOption = React.useMemo(() => buildModeOption(mode), [mode]);
  const modelItem = React.useMemo(() => resolveModelGroupItem(modelSelectGroups, model), [model, modelSelectGroups]);
  const thoughtPreviewKey = selectedWorkspace && modelItem ? `${workspaceKey({ workspacePath: selectedWorkspacePath, workspaceIdentity: selectedWorkspaceIdentity } as WorkspaceOption)}\u0000${modelItem.value}` : null;
  React.useEffect(() => {
    if (!modelItem || !thoughtPreviewKey) {
      setThoughtState({ key: null, status: "ready" });
      return;
    }
    if (workspaceModelItem?.value === modelItem.value) {
      setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: workspaceThoughtOption ?? null });
      setThoughtState({ key: thoughtPreviewKey, status: "ready" });
      return;
    }
    if (thoughtCache.current.has(thoughtPreviewKey)) {
      setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: thoughtCache.current.get(thoughtPreviewKey) ?? null });
      setThoughtState({ key: thoughtPreviewKey, status: "ready" });
      return;
    }
    const parsed = parseModelValue(modelItem.value);
    if (!parsed?.modelName) {
      setThoughtState({ key: thoughtPreviewKey, status: "failed" });
      return;
    }
    const modelId = parsed.modelName;
    const seq = thoughtRetrySeq.current + 1;
    thoughtRetrySeq.current = seq;
    setThoughtState({ key: thoughtPreviewKey, status: "pending" });
    let cancelled = false;
    (async () => {
      try {
        const option = await fetchModelThoughtOption({
          agentService: zcodeAgentService,
          workspacePath: selectedWorkspacePath,
          workspaceIdentity: selectedWorkspaceIdentity,
          providerId: parsed.providerId ?? "",
          modelId,
        });
        thoughtCache.current.set(thoughtPreviewKey, option);
        if (!cancelled && thoughtRetrySeq.current === seq) {
          setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: option });
          setThoughtState({ key: thoughtPreviewKey, status: "ready" });
        }
      } catch (error) {
        logger.warn("[AutomationEditView] 读取模型 think 配置失败", {
          error,
          model: modelItem.value,
          workspaceIdentity: selectedWorkspaceIdentity ?? null,
          workspacePath: selectedWorkspacePath,
        });
        if (!cancelled && thoughtRetrySeq.current === seq) setThoughtState({ key: thoughtPreviewKey, status: "failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceModelItem?.value, thoughtRetry, workspaceThoughtOption, modelItem, thoughtPreviewKey, selectedWorkspaceIdentity, selectedWorkspacePath, zcodeAgentService]);
  const thoughtLoading = thoughtPreviewKey !== null && thoughtState.key === thoughtPreviewKey && thoughtState.status === "pending";
  const thoughtFailed = thoughtPreviewKey !== null && thoughtState.key === thoughtPreviewKey && thoughtState.status === "failed";
  const thoughtReady = isThoughtPreviewReady(thoughtPreviewKey, thoughtState);
  const resolvedThoughtOption = resolveThoughtPreviewOption({
    currentWorkspaceModelValue: workspaceModelItem?.value,
    previewKey: thoughtPreview?.key,
    previewOption: thoughtPreview?.thoughtOption,
    runtimeOption: workspaceThoughtOption,
    selectedModelPreviewKey: thoughtPreviewKey,
    selectedModelValue: modelItem?.value,
  });
  const normalizedThoughtOption = React.useMemo(() => normalizeThoughtOption(resolvedThoughtOption, thoughtLevel), [resolvedThoughtOption, thoughtLevel]);
  const resolvedThoughtLevel = String(normalizedThoughtOption?.currentValue ?? "");
  React.useEffect(() => {
    if (!resolvedThoughtLevel || resolvedThoughtLevel === thoughtLevel) return;
    thoughtBaseline.current = resolvedThoughtLevel;
    setThoughtLevel(resolvedThoughtLevel);
  }, [resolvedThoughtLevel, thoughtLevel]);
  const missingFields = React.useMemo(() => missingRequiredFields({ title, cronExpr, prompt }), [cronExpr, prompt, title]);
  const canSubmitWorkspace = !!(editing || selectedWorkspace);
  const canSubmit = canSubmitWorkspace && thoughtReady && (!!editing || selectedWorkspace !== null);
  const submittable = canSubmit && missingFields.length === 0;
  const validate = React.useCallback(
    (source: string): boolean => {
      setValidationVisible(new Set(missingFields));
      logger.debug("[AutomationEditView] 提交前校验必填字段", {
        automationId: editing?.automationId ?? null,
        source,
        invalidFields: missingFields,
      });
      return missingFields.length === 0;
    },
    [editing?.automationId, missingFields],
  );
  const scheduleRuleDraft = React.useMemo(
    () =>
      builder.frequency === "custom"
        ? {
            unit: builder.customUnit,
            interval: builder.customInterval,
            hour: builder.hour,
            minute: builder.minute,
            anchorAt: editing?.scheduleRule?.anchorAt ?? Date.now(),
            weekdays: builder.customWeekdays,
            monthDays: builder.customMonthDays,
            months: builder.customUnit === "yearly" ? [builder.customMonth] : undefined,
            monthlyMode: builder.customMonthlyMode,
          }
        : undefined,
    [builder, editing?.scheduleRule?.anchorAt],
  );
  const buildInput = React.useCallback(
    ({ modelValue, modeValue, thoughtLevelValue }: { modelValue: string; modeValue: string; thoughtLevelValue: string }) => ({
      title: title.trim(),
      cronExpr,
      prompt: prompt.trim(),
      recurring: editing?.recurring ?? true,
      ...(editing ? { endAt: endAt ?? null } : endAt ? { endAt } : {}),
      ...(editing ? (legacySchedule ? {} : { scheduleRule: scheduleRuleDraft ?? null }) : scheduleRuleDraft ? { scheduleRule: scheduleRuleDraft } : {}),
      ...(editing && scheduleDeleted.has("schedule") ? { scheduleEditedByUser: true } : {}),
      mode: modeValue,
      thoughtLevel: resolveThoughtLevelPayload({ editing: !!editing, resolvedThoughtLevel, thoughtLevel: thoughtLevelValue }),
      ...(modelValue === AUTOMATION_MODEL_INHERIT ? { model: undefined } : { model: modelValue }),
    }),
    [cronExpr, scheduleRuleDraft, editing, endAt, legacySchedule, prompt, resolvedThoughtLevel, title, scheduleDeleted],
  );
  const currentFields = React.useMemo(
    () =>
      editing
        ? {
            title: title.trim(),
            prompt: prompt.trim(),
            schedule: JSON.stringify({
              cronExpr,
              endAt: endAt ?? null,
              scheduleRule: legacySchedule ? null : scheduleRulePayload(scheduleRuleDraft ?? null),
            }),
            mode,
            thoughtLevel: resolvedThoughtLevel ? thoughtLevel : "",
            model: model === AUTOMATION_MODEL_INHERIT ? "" : model,
          }
        : null,
    [cronExpr, scheduleRuleDraft, editing, endAt, legacySchedule, mode, model, prompt, resolvedThoughtLevel, thoughtLevel, title],
  );
  baselineRef.current = currentFields;
  const changedFields = React.useMemo(
    () => (currentFields ? changedFieldsOf({ touchedFields: scheduleDeleted, baseline: fieldBaselines.current, current: currentFields }) : []),
    [currentFields, scheduleDeleted],
  );
  const hasUnsavedChanges = !!editing && changedFields.length > 0;
  const submit = React.useCallback(
    async (options: { returnToList?: boolean; validationSource: string }) => {
      if (saving || !validate(options.validationSource) || !submittable) return false;
      const input = { ...buildInput({ modelValue: modelBaseline.current, modeValue: modeBaseline.current, thoughtLevelValue: thoughtBaseline.current }) };
      const target = editing
        ? { workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? null }
        : selectedWorkspace
          ? { workspacePath: selectedWorkspace.workspacePath, workspaceIdentity: selectedWorkspace.workspaceIdentity ?? null }
          : null;
      if (!target) return false;
      const ok = await onSubmit({ input, ...target });
      if (ok && options.returnToList !== false) onBack();
      return ok;
    },
    [buildInput, submittable, editing, onBack, onSubmit, validate, saving, selectedWorkspace?.workspaceIdentity, selectedWorkspace?.workspacePath],
  );
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit({ validationSource: "save" });
  };
  const handleSaveAndRun = React.useCallback(async () => {
    if (!editing || !onRunNow || runNowInFlightRef.current) return;
    runNowInFlightRef.current = true;
    setRunNowBusy(true);
    logger.debug("[AutomationEditView] 保存并立即运行开始", { automationId: editing.automationId, changedFields });
    try {
      const completed = await runIfSaved(
        () => submit({ returnToList: false, validationSource: "run-now" }),
        () => Promise.resolve(onRunNow(editing)),
      );
      logger.debug("[AutomationEditView] 保存并立即运行结束", { automationId: editing.automationId, completed });
    } finally {
      runNowInFlightRef.current = false;
      setRunNowBusy(false);
    }
  }, [changedFields, editing, onRunNow, submit]);
  const handleBack = React.useCallback(async () => {
    logger.debug("[AutomationEditView] 返回前检查未保存更改", {
      automationId: editing?.automationId ?? null,
      touchedFields: [...scheduleDeleted],
      changedFields,
    });
    if (!hasUnsavedChanges) {
      onBack();
      return;
    }
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "automations.unsaved.title" }),
      description: intl.formatMessage({ id: "automations.unsaved.description" }),
      confirmLabel: intl.formatMessage({ id: "automations.unsaved.discard" }),
      confirmVariant: "destructive",
      showCloseButton: true,
      showKeyboardHints: false,
      presentation: "automation-confirmation",
    });
    logger.debug("[AutomationEditView] 未保存更改确认结果", {
      automationId: editing?.automationId ?? null,
      discarded: confirmed,
    });
    if (confirmed) onBack();
  }, [changedFields, confirmDialog, editing?.automationId, hasUnsavedChanges, intl, onBack, scheduleDeleted]);
  const handleTabChange = React.useCallback(
    (next: string) => {
      logger.debug("[AutomationEditView] 切换设置页签", {
        automationId: editing?.automationId ?? null,
        nextTab: next,
        willLoadRuns: next === "history" && !!editing,
      });
      setTab(next);
    },
    [editing],
  );
  const runs = runsEntry?.runs ?? [];
  const runsLoading = runsEntry?.status === "loading";
  const pageCount = Math.max(1, Math.ceil(runs.length / AUTOMATION_RUNS_PAGE_SIZE));
  const currentPage = Math.min(runsPage, pageCount);
  const pageRuns = runs.slice((currentPage - 1) * AUTOMATION_RUNS_PAGE_SIZE, currentPage * AUTOMATION_RUNS_PAGE_SIZE);
  const pageWindow = paginationWindow(currentPage, pageCount);
  const lifecycleStatus = editing ? automationStatusOf(editing) : null;
  const showSettingsActions = !!(editing && tab === "settings");
  const showCreateAction = !editing && tab === "settings";
  return (
    <>
      <div className={cn(AUTOMATION_EDITOR_PAGE_CLASS, "flex flex-col gap-6")}>
        <div className="flex flex-col gap-6 text-left">
          <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">{intl.formatMessage({ id: "settings.automations.title" })}</h1>
          <button type="button" data-testid={TESTID_AUTOMATION_BACK} onClick={handleBack} className={AUTOMATION_BACK_BUTTON_CLASS}>
            <IconArrowLeft className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />
            <span className="min-w-0 truncate">{editing ? editing.title : intl.formatMessage({ id: "automations.edit.newTask" })}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EditorTabSwitcher
            value={tab}
            settingsLabel={intl.formatMessage({ id: "automations.edit.tab.settings" })}
            historyLabel={intl.formatMessage({ id: "automations.edit.tab.history" })}
            onValueChange={handleTabChange}
          />
          <div className="flex items-center gap-1.5">
            {editing ? (
              <>
                {showSettingsActions ? (
                  <button
                    type="submit"
                    form="automation-edit-form"
                    data-testid={TESTID_AUTOMATION_SAVE}
                    className="inline-flex h-8 items-center rounded-lg border-0 bg-white px-3 text-ui-base font-medium text-black shadow-none outline-none transition-colors hover:bg-white/90 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
                    disabled={!canSubmit || saving}
                  >
                    {intl.formatMessage({ id: saving ? "automations.form.saving" : "automations.form.save" })}
                  </button>
                ) : null}
                {showSettingsActions && onRunNow ? (
                  <button
                    type="button"
                    data-testid={TESTID_AUTOMATION_RUN_NOW}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border-0 bg-white/[0.06] px-3 text-ui-base font-medium text-foreground shadow-none outline-none transition-colors hover:bg-white/10 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-foreground-subtlest disabled:opacity-40"
                    disabled={!canSubmit || saving || runNowBusy}
                    onClick={() => void handleSaveAndRun()}
                  >
                    <AutomationRunIcon className="size-4" aria-hidden="true" />
                    {intl.formatMessage({ id: "automations.runNow" })}
                  </button>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                      className="flex size-8 items-center justify-center rounded-lg border-0 bg-white/[0.06] text-foreground-subtle shadow-none outline-none transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground focus-visible:ring-0"
                    >
                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className="min-w-[180px]">
                    {onToggle && editing.lifecycleStatus !== "completed" && editing.lifecycleStatus !== "failed" ? (
                      <DropdownMenuItem className="gap-1" onSelect={() => void onToggle(editing, !editing.enabled)}>
                        <span className="flex size-5 items-center justify-center">
                          {editing.enabled ? <AutomationPauseIcon className="size-4" aria-hidden="true" /> : <AutomationResumeIcon className="size-4" aria-hidden="true" />}
                        </span>
                        {intl.formatMessage({ id: editing.enabled ? "automations.pause" : "automations.resume" })}
                      </DropdownMenuItem>
                    ) : null}
                    {onDelete ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
                          onSelect={() => void onDelete(editing)}
                        >
                          <AutomationDeleteIcon />
                          {intl.formatMessage({ id: "automations.delete" })}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : showCreateAction ? (
              <Button
                type="submit"
                form="automation-edit-form"
                size="xs"
                data-testid={TESTID_AUTOMATION_SAVE}
                className="h-8 rounded-lg border-0 bg-white/5 px-3 text-ui-base font-normal leading-5 text-foreground hover:bg-white/10 disabled:opacity-40"
                disabled={!submittable || saving}
              >
                {intl.formatMessage({ id: saving ? "automations.form.saving" : "automations.edit.createButton" })}
              </Button>
            ) : null}
          </div>
        </div>
        {tab === "settings" ? (
          <form id="automation-edit-form" className="space-y-4" onSubmit={(event) => void handleFormSubmit(event)}>
            {lifecycleStatus ? (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <div className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "automations.form.status.label" })}</div>
                <div className="flex min-h-8 flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-lg bg-card pl-2 pr-4 text-ui-base leading-5 text-foreground">
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <span className={cn("size-1.5 shrink-0 rounded-full", AUTOMATION_LIFECYCLE_DOT_CLASSES[lifecycleStatus])} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 truncate">{intl.formatMessage({ id: `automations.lifecycle.${lifecycleStatus}` })}</span>
                  </span>
                </div>
              </div>
            ) : null}
            <div className={AUTOMATION_FIELD_STACK_CLASS}>
              <label className="text-ui-base font-normal leading-5 text-foreground-subtle" htmlFor="automation-title">
                {intl.formatMessage({ id: "automations.form.title.label" })}
              </label>
              <Input
                id="automation-title"
                data-testid={TESTID_AUTOMATION_TITLE}
                value={title}
                onChange={(event) => {
                  titleTouched.current = true;
                  markTouched("title");
                  clearTouched("title");
                  setTitle(event.target.value);
                }}
                placeholder={intl.formatMessage({ id: "automations.edit.titlePlaceholder" })}
                aria-invalid={validationVisible.has("title") && !title.trim()}
                maxLength={200}
                className={cn("h-9 rounded-lg bg-card px-2 text-foreground hover:bg-surface-hover focus-visible:bg-card", AUTOMATION_TEXT_CLASS)}
              />
            </div>
            {legacySchedule ? (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <label className="inline-flex items-center gap-1.5 text-ui-base font-normal leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "automations.form.schedule.label" })}
                </label>
                <div
                  data-testid={TESTID_AUTOMATION_SCHEDULE_BOX}
                  className="relative flex h-9 items-center overflow-hidden rounded-lg border border-input-border bg-card px-2 pr-9 text-ui-base leading-5 text-foreground-subtle transition-colors hover:border-input-border-hover focus-within:border-input-border-focused"
                >
                  <span className="min-w-0 truncate">{intl.formatMessage({ id: "automations.frequency.custom" })}</span>
                  <button
                    type="button"
                    data-testid={TESTID_AUTOMATION_SCHEDULE_DELETE}
                    onClick={removeSchedule}
                    className="absolute right-2 top-2 flex size-5 items-center justify-center text-foreground-subtle transition-colors hover:text-foreground"
                    aria-label={intl.formatMessage({ id: "common.delete" })}
                  >
                    <AutomationDeleteIcon />
                  </button>
                </div>
              </div>
            ) : (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <label className="inline-flex items-center gap-1.5 text-ui-base font-normal leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "automations.form.schedule.label" })}
                </label>
                {scheduleMissing ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-testid={TESTID_AUTOMATION_SCHEDULE_ADD}
                        aria-invalid={scheduleMissing && validationVisible.has("schedule")}
                        className={cn(
                          "flex h-9 w-full items-center gap-1 rounded-lg border bg-card px-2 text-ui-base font-normal leading-5 text-foreground-subtle transition-colors hover:border-input-border-hover hover:bg-surface-hover hover:text-foreground focus-visible:border-input-border-focused data-[state=open]:border-input-border-focused data-[state=open]:bg-surface-hover data-[state=open]:text-foreground",
                          validationVisible.has("schedule") ? "!border-destructive !ring-2 !ring-destructive/20" : "border-input-border",
                        )}
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <AutomationPlusIcon aria-hidden="true" />
                        </span>
                        {intl.formatMessage({ id: "scheduledPreview.addSchedule" })}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={4} className="w-[148px] rounded-[10px] p-1.5">
                      {AUTOMATION_FREQUENCIES.map((frequency) => (
                        <DropdownMenuItem
                          key={frequency}
                          data-testid={testidTemplate(TESTID_FREQUENCY_OPTION, frequency)}
                          className="min-h-8 rounded-lg px-2 py-2 text-ui-base text-foreground-subtle data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground"
                          onSelect={() => {
                            markTouched("schedule");
                            if (frequency === "custom") {
                              setCustomRepeatOpen(true);
                              return;
                            }
                            setBuilder((previous) => ({
                              ...previous,
                              frequency: frequency as ScheduleBuilderState["frequency"],
                              ...(frequency === "weekdays" ? { weekdays: [1, 2, 3, 4, 5] } : {}),
                            }));
                            setScheduleMissing(false);
                            clearTouched("schedule");
                          }}
                        >
                          {intl.formatMessage({ id: `automations.frequency.${frequency}` })}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="relative flex h-9 flex-nowrap items-center gap-1 overflow-hidden rounded-lg border border-input-border bg-card py-1 pl-[7px] pr-9 text-ui-base leading-5 text-foreground transition-colors hover:border-input-border-hover focus-within:border-input-border-focused">
                    <Select
                      value={builder.frequency}
                      onValueChange={(value) => {
                        if (!isAutomationFrequency(value)) {
                          logger.warn("[AutomationEditView] 忽略非法的频率选择值", {
                            automationId: editing?.automationId,
                            cronExpr: editing?.cronExpr,
                            value,
                          });
                          return;
                        }
                        markTouched("schedule");
                        if (value === "custom") {
                          setCustomRepeatOpen(true);
                          return;
                        }
                        setBuilder((previous) => ({
                          ...previous,
                          frequency: value,
                          ...(value === "weekdays" ? { weekdays: [1, 2, 3, 4, 5] } : {}),
                        }));
                      }}
                    >
                      <SelectTrigger
                        variant="ghost"
                        data-testid={TESTID_AUTOMATION_FREQUENCY}
                        className="h-auto min-w-24 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 text-foreground hover:bg-selected aria-expanded:bg-selected"
                        indicator={<AutomationChevronIndicator />}
                      >
                        <SelectValue>{intl.formatMessage({ id: `automations.frequency.${builder.frequency}` })}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {AUTOMATION_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency} data-testid={testidTemplate(TESTID_FREQUENCY_OPTION, frequency)}>
                            {intl.formatMessage({ id: `automations.frequency.${frequency}` })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {builder.frequency === "monthly" ? (
                      <Select
                        value={String(builder.dayOfMonth)}
                        onValueChange={(value) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, dayOfMonth: Number(value) }));
                        }}
                      >
                        <SelectTrigger variant="ghost" className="h-auto w-auto rounded-lg border-0 bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground hover:bg-selected aria-expanded:bg-selected" indicator={<AutomationChevronIndicator />}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {intl.formatMessage({ id: "automations.form.dayOfMonth" }, { day: String(day) })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                    {builder.frequency === "weekly" ? (
                      <WeekdayPicker
                        weekdays={builder.weekdays}
                        intl={intl}
                        onChange={(weekdays) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, weekdays }));
                        }}
                      />
                    ) : null}
                    {builder.frequency === "custom" ? (
                      <button
                        type="button"
                        data-testid={TESTID_AUTOMATION_CUSTOM_FREQUENCY}
                        onClick={() => setCustomRepeatOpen(true)}
                        className="inline-flex h-auto items-center gap-0.5 rounded-lg bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground hover:bg-selected"
                      >
                        <span>
                          {intl.formatMessage(
                            { id: "automations.customRepeat.compactFrequency" },
                            {
                              interval: String(builder.customInterval),
                              unit: intl.formatMessage({
                                id: `automations.customRepeat.unit.${
                                  builder.customUnit === "minute" ? "minute" : builder.customUnit === "daily" ? "day" : builder.customUnit === "weekly" ? "week" : builder.customUnit === "monthly" ? "month" : builder.customUnit === "yearly" ? "year" : "hour"
                                }`,
                              }),
                            },
                          )}
                        </span>
                        <AutomationChevronIndicator />
                      </button>
                    ) : null}
                    {builder.frequency !== "custom" && builder.frequency !== "hourly" ? (
                      <>
                        <span className="text-foreground">{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <TimePicker
                          hour={builder.hour}
                          minute={builder.minute}
                          ariaLabel={intl.formatMessage({ id: "automations.form.schedule.label" })}
                          onChange={(hour, minute) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, hour, minute }));
                          }}
                        />
                        <span className="whitespace-nowrap text-foreground-subtle">{gmtOffsetLabel()}</span>
                      </>
                    ) : null}
                    {builder.frequency === "hourly" ? (
                      <div className="flex items-center gap-1 text-ui-base leading-5 text-foreground">
                        <span>{intl.formatMessage({ id: "automations.form.schedule.minutePrefix" })}</span>
                        <Select
                          value={String(builder.minute)}
                          onValueChange={(value) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, minute: Number(value) }));
                          }}
                        >
                          <SelectTrigger variant="ghost" className="h-auto w-14 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 tabular-nums hover:bg-selected">
                            <SelectValue>{pad2(builder.minute)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 60 }, (_, index) => (
                              <SelectItem key={index} value={String(index)}>
                                {pad2(index)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>{intl.formatMessage({ id: "automations.form.schedule.minuteSuffix" })}</span>
                      </div>
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit === "hourly" ? (
                      <div className="flex items-center gap-1 text-ui-base leading-5 text-foreground">
                        <span>{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <Select
                          value={String(builder.minute)}
                          onValueChange={(value) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, minute: Number(value) }));
                          }}
                        >
                          <SelectTrigger variant="ghost" className="h-auto w-16 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 tabular-nums hover:bg-selected">
                            <SelectValue>{pad2(builder.minute)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 60 }, (_, index) => (
                              <SelectItem key={index} value={String(index)}>
                                {pad2(index)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>{intl.formatMessage({ id: "automations.customRepeat.minutes" })}</span>
                      </div>
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit === "yearly" ? (
                      <MonthDayPicker
                        month={builder.customMonth}
                        day={builder.customMonthDays[0] ?? 1}
                        intl={intl}
                        onChange={(month, day) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, customMonth: month, customMonthDays: [day] }));
                        }}
                      />
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit !== "hourly" && builder.customUnit !== "minute" ? (
                      <>
                        <span className="text-foreground">{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <TimePicker
                          hour={builder.hour}
                          minute={builder.minute}
                          onChange={(hour, minute) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, hour, minute }));
                          }}
                        />
                        <span className="text-foreground-subtle">{gmtOffsetLabel()}</span>
                      </>
                    ) : null}
                    {schedulePreview ? (
                      <span data-testid={TESTID_AUTOMATION_SCHEDULE_BOX} className="min-w-0 flex-1 truncate text-ui-base text-foreground-subtle sm:ml-1">
                        {schedulePreview}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      data-testid={TESTID_AUTOMATION_SCHEDULE_DELETE}
                      onClick={removeSchedule}
                      className="absolute right-2 top-2 flex size-5 items-center justify-center text-foreground-subtle transition-colors hover:text-foreground"
                      aria-label={intl.formatMessage({ id: "common.delete" })}
                    >
                      <AutomationDeleteIcon />
                    </button>
                  </div>
                )}
                <CustomRepeatDialog
                  builder={builder}
                  endAt={endAt}
                  intl={intl}
                  open={customRepeatOpen}
                  onOpenChange={setCustomRepeatOpen}
                  onConfirm={({ interval, unit, weekdays, monthDays, monthlyMode, endAt: nextEndAt }) => {
                    markTouched("schedule");
                    setScheduleMissing(false);
                    clearTouched("schedule");
                    setBuilder((previous) => ({
                      ...previous,
                      frequency: "custom",
                      customInterval: interval,
                      customUnit: unit,
                      customWeekdays: weekdays,
                      customMonthDays: monthDays,
                      customMonthlyMode: monthlyMode,
                    }));
                    setEndAt(nextEndAt);
                  }}
                />
              </div>
            )}
            <div className={AUTOMATION_FIELD_STACK_CLASS}>
              <label className="text-ui-base font-normal leading-5 text-foreground-subtle" htmlFor="automation-prompt">
                {intl.formatMessage({ id: "automations.form.prompt.label" })}
              </label>
              <PromptCard invalid={validationVisible.has("prompt") && !prompt.trim()}>
                <AutoGrowTextarea
                  id="automation-prompt"
                  data-testid={TESTID_AUTOMATION_PROMPT}
                  value={prompt}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    markTouched("prompt");
                    clearTouched("prompt");
                    setPrompt(event.target.value);
                  }}
                  placeholder={intl.formatMessage({ id: "automations.edit.promptPlaceholder" })}
                  aria-invalid={validationVisible.has("prompt") && !prompt.trim()}
                />
                <PromptCardFooter>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-foreground-subtle">
                    {editing ? (
                      <Button type="button" variant="ghost" size="xs" disabled className="h-auto min-h-7 gap-1 rounded-md px-2 py-1 text-ui-base font-normal leading-normal">
                        {isConversationWorkspace ? <IconMessageSquarePlus className="size-3.5" aria-hidden="true" /> : <IconFolderOpen className="size-3.5" aria-hidden="true" />}
                        <span className="max-w-40 truncate">{workspaceDisplayLabel}</span>
                      </Button>
                    ) : workspaceTabEntries.length > 0 ? (
                      <WorkspaceSelectRow
                        workspacePath={selectedWorkspacePath}
                        workspaceTabs={workspaceTabEntries}
                        allowConversationWorkspaceSelection={!!conversationOption}
                        allowConversationWorkspaceDetach={false}
                        onSelectWorkspace={handleSelectWorkspace}
                        onSelectConversationWorkspace={handleSelectConversationWorkspace}
                        allowOpenWorkspace={false}
                        allowRemoteWorkspace={false}
                        onOpenFolder={() => {}}
                        onConnectRemote={async () => ""}
                        onSelectRemoteProject={async () => {}}
                        onCancelRemoteProject={async () => {}}
                        containerClassName="rounded-lg"
                        triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "min-w-0 gap-1 px-2")}
                      />
                    ) : (
                      <Button type="button" variant="ghost" size="xs" disabled className="h-auto min-h-7 gap-1 rounded-md px-2 py-1 text-ui-base font-normal leading-normal text-foreground-subtlest">
                        <IconFolderOpen className="size-3.5" aria-hidden="true" />
                        {intl.formatMessage({ id: "automations.form.project.localRequired" })}
                      </Button>
                    )}
                    <ModeSelector
                      option={modeOption}
                      onValueChange={(value) => {
                        markTouched("mode");
                        modeBaseline.current = value;
                        setMode(value);
                      }}
                      tooltipTitle={intl.formatMessage({ id: "chat.toolbar.mode.label" })}
                      triggerVariant="ghost"
                      triggerSize="default"
                      triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-56 min-w-0 shrink justify-start gap-1 px-2")}
                      labelVisibilityClassName="inline-flex min-w-0 truncate text-left"
                      provider="glm"
                      restoreFocusSelector={null}
                    />
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-foreground-subtle">
                    <ModelSelector
                      modelGroups={modelSelectGroups as ModelGroup[]}
                      normalizedValue={modelItem?.value ?? model}
                      triggerLabel={modelTriggerLabel}
                      showManageModelsAction={!!onManageModels}
                      lockReasonMessage=""
                      isItemLocked={automationModelNeverLocked}
                      onValueChange={handleModelChange}
                      tooltipTitle={intl.formatMessage({ id: "chat.toolbar.model.label" })}
                      disabled={thoughtLoading}
                      pending={thoughtLoading}
                      pendingLabel={thoughtLoading ? modelItem?.name : undefined}
                      manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
                      onManageModels={onManageModels}
                      contentSide="top"
                      focusSelectorOnClose={null}
                      labelVisibilityClassName="hidden @sm/composer:inline-flex"
                      indicatorClassName="hidden @sm/composer:block"
                      triggerClassName={cn(
                        AUTOMATION_TOOLBAR_BUTTON_CLASS,
                        "w-fit max-w-72 min-w-0 shrink @max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:gap-0 @max-sm/composer:p-0",
                      )}
                      triggerIconClassName="inline-flex @sm/composer:hidden"
                    />
                    {thoughtFailed ? (
                      <Button type="button" variant="ghost" size="xs" className="h-7 rounded-lg px-2 text-ui-sm text-foreground-subtle" onClick={() => setThoughtRetry((previous) => previous + 1)}>
                        {intl.formatMessage({ id: "automations.form.model.previewRetry" })}
                      </Button>
                    ) : null}
                    {normalizedThoughtOption ? (
                      <ThoughtLevelSelector
                        intl={intl}
                        option={normalizedThoughtOption}
                        provider="glm"
                        disabled={thoughtLoading}
                        triggerRef={thoughtTriggerRef}
                        indicatorClassName="hidden @xl/composer:block"
                        triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:p-0")}
                        restoreFocusSelector={null}
                        labelVisibilityClassName="hidden @xl/composer:inline-flex"
                        onValueChange={(value) => {
                          markTouched("thoughtLevel");
                          thoughtTouched.current = true;
                          thoughtBaseline.current = value;
                          setThoughtLevel(value);
                        }}
                      />
                    ) : null}
                  </div>
                </PromptCardFooter>
              </PromptCard>
            </div>
          </form>
        ) : (
          <div>
            {runsLoading && runs.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <IconSpinnerAlt className="size-5" />
              </div>
            ) : runsEntry?.status === "error" ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-sm text-destructive">{runsEntry.error}</div>
            ) : runs.length === 0 ? (
              <AutomationsEmptyState>{intl.formatMessage({ id: "automations.runs.empty" })}</AutomationsEmptyState>
            ) : (
              <div className="overflow-x-auto rounded-[8px]">
                <table className="w-full text-left text-ui-base font-normal leading-normal tracking-[-0.08px]">
                  <thead className="bg-surface text-foreground-subtle">
                    <tr className="h-[30px] border-b border-border">
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.triggered" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.trigger" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.status" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.duration" })}</th>
                      <th className="px-4 font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRuns.map((run) => {
                      const status = automationRunStatusOf(run);
                      const statusLabel = intl.formatMessage({ id: `automations.runs.status.${status}` });
                      const statusNode = (
                        <span className="flex items-center text-ui-base leading-5 tracking-[-0.18px]">
                          <span className="flex size-5 shrink-0 items-center justify-center">
                            <span className={cn("inline-block size-1.5 rounded-full", AUTOMATION_RUN_DOT_CLASSES[status])} />
                          </span>
                          <span className={AUTOMATION_RUN_TEXT_CLASSES[status]}>{statusLabel}</span>
                        </span>
                      );
                      const canOpenSession = !!(run.sessionId && onOpenSession);
                      const hasActions = canOpenSession || !!onDeleteRun;
                      return (
                        <tr key={run.runId} className="h-[46px] border-b border-border transition-colors last:border-b-0 hover:bg-surface-hover">
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatDateTime(run.scheduledAt ?? run.createdAt)}</td>
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{intl.formatMessage({ id: `automations.trigger.${run.trigger}` })}</td>
                          <td className="px-4">
                            {status === "failed" ? (
                              <Tooltip title={run.error?.trim() || intl.formatMessage({ id: "automations.runs.errorUnavailable" })} side="top" align="start">
                                {statusNode}
                              </Tooltip>
                            ) : (
                              statusNode
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatRunDuration(run.createdAt, run.updatedAt)}</td>
                          <td className="px-4">
                            <div className="flex items-center justify-end">
                              {hasActions ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                                      className="flex size-6 items-center justify-center rounded-[6px] text-foreground-subtle transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground"
                                    >
                                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4} className="min-w-[160px]">
                                    {canOpenSession ? (
                                      <DropdownMenuItem onSelect={() => onOpenSession?.(run.sessionId as string)}>
                                        <IconExternalSession className="size-3.5" aria-hidden="true" />
                                        {intl.formatMessage({ id: "automations.runs.openSession" })}
                                      </DropdownMenuItem>
                                    ) : null}
                                    {onDeleteRun ? (
                                      <>
                                        {canOpenSession ? <DropdownMenuSeparator /> : null}
                                        <DropdownMenuItem variant="destructive" onSelect={() => onDeleteRun(run.runId)}>
                                          <AutomationDeleteIcon />
                                          {intl.formatMessage({ id: "automations.runs.delete" })}
                                        </DropdownMenuItem>
                                      </>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {runs.length > 0 && pageCount > 1 ? (
              <nav className="mt-4 flex items-center justify-between text-ui-base">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setRunsPage(Math.max(1, currentPage - 1))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground-subtle transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <IconArrowLeft className="size-3.5" aria-hidden="true" />
                  {intl.formatMessage({ id: "automations.runs.prevPage" })}
                </button>
                <div className="flex items-center gap-1">
                  {pageWindow.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="flex size-7 items-center justify-center text-foreground-subtlest" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        type="button"
                        aria-current={entry === currentPage ? "page" : undefined}
                        onClick={() => setRunsPage(entry)}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-[6px] transition-colors",
                          entry === currentPage ? "bg-surface text-foreground" : "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
                        )}
                      >
                        {entry}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setRunsPage(Math.min(pageCount, currentPage + 1))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground-subtle transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  {intl.formatMessage({ id: "automations.runs.nextPage" })}
                  <IconArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

/* 文件尾：本文件三个 §区（子代理/插件/自动化）均为接口级叶子的实体化；
   与并行批次的边界裁决见 B4 合并报告 §4。 */
